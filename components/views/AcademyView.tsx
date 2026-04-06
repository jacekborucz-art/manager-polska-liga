import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import {
  ViewState, PlayerPosition, PlayerAttributes, Region, YouthPlayer, ClubAcademy, Scout,
} from '../../types';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { AcademyService, ACADEMY_UPGRADE_COSTS, ACADEMY_UPGRADE_DAYS, ACADEMY_MAX_SLOTS } from '../../services/AcademyService';
import { ScoutService } from '../../services/ScoutService';
import rezerwyBg from '../../Graphic/themes/rezerwy.png';

// ── Pomocnicze stałe ───────────────────────────────────────────────────────────

const POSITION_LABEL: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]:  'BR',
  [PlayerPosition.DEF]: 'OBR',
  [PlayerPosition.MID]: 'POM',
  [PlayerPosition.FWD]: 'NAP',
};

const POSITION_BADGE: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]:  'bg-yellow-500/20 border border-yellow-500/60 text-yellow-300',
  [PlayerPosition.DEF]: 'bg-blue-500/20 border border-blue-500/60 text-blue-300',
  [PlayerPosition.MID]: 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300',
  [PlayerPosition.FWD]: 'bg-red-500/20 border border-red-500/60 text-red-300',
};

const POSITION_ORDER = [PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD];

const TALENT_LABEL: Record<NonNullable<YouthPlayer['revealedTalentRating']>, { label: string; color: string }> = {
  EXCEPTIONAL: { label: 'Wyjątkowy',  color: 'text-yellow-300 border-yellow-400/60 bg-yellow-500/10' },
  HIGH:        { label: 'Wysoki',     color: 'text-emerald-300 border-emerald-400/60 bg-emerald-500/10' },
  AVERAGE:     { label: 'Przeciętny', color: 'text-slate-300 border-slate-400/60 bg-slate-500/10' },
  LOW:         { label: 'Niski',      color: 'text-rose-300 border-rose-400/60 bg-rose-500/10' },
};

const LEVEL_ICON = ['', '⚽', '🏗️', '🏟️', '⭐', '🌟'];
const LEVEL_LABEL = ['', 'Boisko treningowe', 'Centrum Szkoleniowe', 'Akademia Regionalna', 'Akademia Profesjonalna', 'Poziom Światowy'];

const ATTR_DISPLAY: { key: keyof PlayerAttributes; label: string }[] = [
  { key: 'pace',       label: 'PRD' },
  { key: 'technique',  label: 'TEC' },
  { key: 'passing',    label: 'POD' },
  { key: 'vision',     label: 'WIZ' },
  { key: 'dribbling',  label: 'DRY' },
  { key: 'finishing',  label: 'SKU' },
  { key: 'defending',  label: 'OBR' },
  { key: 'stamina',    label: 'WYT' },
  { key: 'strength',   label: 'SIŁ' },
  { key: 'heading',    label: 'GŁO' },
  { key: 'goalkeeping',label: 'BR'  },
  { key: 'mentality',  label: 'MEN' },
];

const FOCUS_ATTRS: { key: keyof PlayerAttributes; label: string }[] = [
  { key: 'pace',        label: 'Szybkość' },
  { key: 'technique',   label: 'Technika' },
  { key: 'passing',     label: 'Podania' },
  { key: 'vision',      label: 'Wizja' },
  { key: 'dribbling',   label: 'Drybbling' },
  { key: 'finishing',   label: 'Wykończenie' },
  { key: 'defending',   label: 'Obrona' },
  { key: 'stamina',     label: 'Wytrzymałość' },
  { key: 'strength',    label: 'Siła' },
  { key: 'heading',     label: 'Gra głową' },
  { key: 'goalkeeping', label: 'Bramkarstwo' },
  { key: 'mentality',   label: 'Mentalność' },
  { key: 'leadership',  label: 'Przywództwo' },
  { key: 'workRate',    label: 'Pracowitość' },
];

const REGION_LABELS: Partial<Record<Region, string>> = {
  [Region.POLAND]:    'Polska',
  [Region.BALKANS]:   'Bałkany',
  [Region.CZ_SK]:     'Czechy / Słowacja',
  [Region.SSA]:       'Afryka Sub-Saharyjska',
  [Region.IBERIA]:    'Iberia',
  [Region.GERMANY]:   'Niemcy',
  [Region.BRAZIL]:    'Brazylia',
  [Region.ARGENTINA]: 'Argentyna',
  [Region.FRANCE]:    'Francja',
  [Region.HUNGARIAN]: 'Węgry i okolice',
  [Region.EX_USSR]:   'Europa Wschodnia',
  [Region.ROMANIA]:   'Rumunia',
};

const SELECTABLE_REGIONS: Region[] = [
  Region.POLAND, Region.BALKANS, Region.CZ_SK, Region.SSA,
  Region.IBERIA, Region.GERMANY, Region.BRAZIL, Region.ARGENTINA,
  Region.FRANCE, Region.HUNGARIAN, Region.EX_USSR, Region.ROMANIA,
];

// ── Komponent ─────────────────────────────────────────────────────────────────

type Tab = 'players' | 'infra' | 'scout' | 'scouts' | 'history';

export const AcademyView: React.FC = () => {
  const {
    academy, initAcademy, submitUpgradeProposal, startAcademyUpgrade, promoteYouthPlayer,
    dismissYouthPlayer, setYouthFocus, startScoutMission,
    setAcademyRegionFocus, setAcademyOperationalBudget, signYouthPlayerContract,
    navigateTo, userTeamId, clubs, currentDate,
    scoutPool, scoutMarket, employedScouts, hireScout, fireScout, refreshScoutMarket, scoutMarketRefreshDate,
  } = useGame();

  const [tab, setTab] = useState<Tab>('players');
  const [selectedYouthId, setSelectedYouthId] = useState<string | null>(null);

  const [showPromoteMenu, setShowPromoteMenu] = useState<string | null>(null);
  const [budgetInputValue, setBudgetInputValue] = useState<string>('');

  // Formularz misji skautingowej
  const [scoutPosition, setScoutPosition] = useState<PlayerPosition | ''>('');
  const [scoutAgeMin, setScoutAgeMin] = useState<number>(15);
  const [scoutAgeMax, setScoutAgeMax] = useState<number>(21);
  const [selectedMissionScoutId, setSelectedMissionScoutId] = useState<string>('');
  const [fireScoutConfirm, setFireScoutConfirm] = useState<{ id: string; name: string; isOnMission: boolean } | null>(null);

  const myClub = clubs.find(c => c.id === userTeamId);

  const sortedYouth = useMemo(() => {
    if (!academy) return [];
    return [...academy.youthPlayers].sort((a, b) => {
      const posA = POSITION_ORDER.indexOf(a.position);
      const posB = POSITION_ORDER.indexOf(b.position);
      if (posA !== posB) return posA - posB;
      return b.readinessScore - a.readinessScore;
    });
  }, [academy]);

  const selectedYouth = useMemo(
    () => sortedYouth.find(yp => yp.id === selectedYouthId) ?? null,
    [sortedYouth, selectedYouthId]
  );

  const userClub = clubs.find(c => c.id === userTeamId);
  const budget = userClub?.budget ?? 0;
  const upgradeCost = academy ? (AcademyService.getUpgradeCostForClub(academy.level, userClub?.reputation ?? 5) ?? 0) : 0;
  const upgradeDays = academy ? (AcademyService.getUpgradeDays(academy.level) ?? 0) : 0;
  const canAffordUpgrade = budget >= upgradeCost;
  const maxSlots = academy ? ACADEMY_MAX_SLOTS[academy.level] : 4;
  const readinessThreshold = AcademyService.getReadinessThreshold();

  // ── Renderowanie ──────────────────────────────────────────────────────────────

  if (!academy) {
    return (
      <>
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <img src={rezerwyBg} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.3 }} />
          <div className="absolute inset-0 bg-slate-950/70" />
        </div>
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <div className="max-w-md w-full mx-4 p-10 rounded-[32px] bg-slate-900/80 border border-white/10 shadow-2xl text-center backdrop-blur-2xl">
            <div className="text-7xl mb-6">🏟️</div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-3">Akademia Piłkarska</h1>
            <p className="text-slate-400 text-sm mb-2">Klub nie posiada jeszcze akademii piłkarskiej.</p>
            <p className="text-slate-500 text-xs mb-8">Założenie akademii to inwestycja w przyszłość — wychowuj własnych zawodników, odkrywaj ukryte talenty i buduj skrzydło młodzieżowe od podstaw.</p>
            <p className="text-amber-400 text-xs font-black mb-6 uppercase tracking-widest">Koszt założenia: BEZPŁATNE (Poziom 1)</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={initAcademy}
                className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black italic uppercase tracking-widest text-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                Otwórz Akademię
              </button>
              <button
                onClick={() => navigateTo(ViewState.DASHBOARD)}
                className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-black italic uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
              >
                Powrót
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img src={rezerwyBg} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.3 }} />
        <div className="absolute inset-0 bg-slate-950/70" />
      </div>

      <div className="min-h-screen text-slate-50 p-4 relative z-10">
        <div className="max-w-7xl mx-auto">

          {/* ── Nagłówek ── */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              {myClub && getClubLogo(myClub.id) && (
                <img src={getClubLogo(myClub.id)} alt={myClub.name} className="w-14 h-14 object-contain drop-shadow-2xl shrink-0" />
              )}
              <div>
                {myClub && <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1">{myClub.name}</p>}
                <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-400 to-slate-600">AKADEMIA</h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
                  {LEVEL_ICON[academy.level]} {LEVEL_LABEL[academy.level]} — Poziom {academy.level}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo(ViewState.DASHBOARD)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-black italic uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              <span className="hover:-translate-x-1 transition-transform">←</span>
              <span>Powrót</span>
            </button>
          </div>

          {/* ── Zakładki ── */}
          <div className="flex gap-1 mb-5 bg-slate-900/50 rounded-2xl p-1 border border-white/5 w-fit">
            {([
              { id: 'players', label: '👦 Wychowankowie' },
              { id: 'infra',   label: '🏗️ Infrastruktura' },
              { id: 'scout',   label: '🔍 Skautowanie' },
              { id: 'scouts',  label: '🕵️ Skauci' },
              { id: 'history', label: '🏆 Historia' },
            ] as { id: Tab; label: string }[]).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-2 rounded-xl text-xs font-black italic uppercase tracking-widest transition-all ${
                  tab === t.id ? 'bg-white/10 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB: Wychowankowie ── */}
          {tab === 'players' && (
            <div className="flex gap-4">
              {/* Lista */}
              <div className="flex-1 overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-md">
                {sortedYouth.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-5xl mb-4">⚽</div>
                    <p className="text-slate-500 text-sm uppercase tracking-widest font-black">Brak wychowanków</p>
                    <p className="text-slate-600 text-xs mt-2">Zatrudnij skauta i wyślij go na poszukiwania — wychowankowie pojawią się po zakończeniu misji.</p>
                  </div>
                ) : (
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-800/80 text-slate-400 uppercase tracking-wider">
                        <th className="px-3 py-2.5 text-left">Poz</th>
                        <th className="px-3 py-2.5 text-left min-w-[140px]">Zawodnik</th>
                        <th className="px-3 py-2.5 text-center">Wiek</th>
                        {ATTR_DISPLAY.map(a => (
                          <th key={a.key} className="px-1.5 py-2.5 text-center whitespace-nowrap">{a.label}</th>
                        ))}
                        <th className="px-3 py-2.5 text-center">Gotowość</th>
                        <th className="px-3 py-2.5 text-center">Ocena Talentu</th>
                        <th className="px-3 py-2.5 text-center">Focus</th>
                        <th className="px-3 py-2.5 text-center">Utrzym.</th>
                        <th className="px-3 py-2.5 text-center">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedYouth.map((youth) => {
                        const isReady = youth.readinessScore >= readinessThreshold;
                        const activeMission = academy?.activeMissions.find(m => m.targetYouthPlayerId === youth.id);
                        return (
                          <tr
                            key={youth.id}
                            onClick={() => setSelectedYouthId(prev => prev === youth.id ? null : youth.id)}
                            className={`border-t border-slate-700/30 cursor-pointer transition-colors ${
                              youth.contractSigned === false
                                ? 'bg-amber-500/5 border-l-2 border-l-amber-500/40'
                                : selectedYouthId === youth.id ? 'bg-white/5' : 'hover:bg-white/[0.03]'
                            }`}
                          >
                            <td className="px-3 py-2">
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${POSITION_BADGE[youth.position]}`}>
                                {POSITION_LABEL[youth.position]}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span className="font-black text-white">{youth.firstName} {youth.lastName}</span>
                            </td>
                            <td className="px-3 py-2 text-center text-slate-400">{youth.age}</td>
                            {ATTR_DISPLAY.map(a => {
                              const val = youth.attributes[a.key];
                              const color = val >= 40 ? 'text-emerald-400' : val >= 28 ? 'text-slate-300' : 'text-slate-500';
                              return (
                                <td key={a.key} className={`px-1.5 py-2 text-center font-bold ${color}`}>{val}</td>
                              );
                            })}
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-slate-700/60 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${isReady ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                    style={{ width: `${youth.readinessScore}%` }}
                                  />
                                </div>
                                <span className={`text-[9px] font-black ${isReady ? 'text-emerald-400' : 'text-slate-400'}`}>
                                  {Math.round(youth.readinessScore)}%
                                </span>
                                {isReady && <span className="text-emerald-400 text-xs animate-pulse">✓</span>}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              {youth.revealedTalentRating ? (
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${TALENT_LABEL[youth.revealedTalentRating].color}`}>
                                  {TALENT_LABEL[youth.revealedTalentRating].label}
                                </span>
                              ) : activeMission ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded border text-violet-300 border-violet-400/50 bg-violet-500/10">
                                    Obserwowany
                                  </span>
                                  <span className="text-[8px] text-slate-500">Kolejny raport: {activeMission.completionDate}</span>
                                </div>
                              ) : (
                                <span className="text-slate-600 text-[9px] font-black">Nieznany</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {youth.developmentFocus ? (
                                <span className="text-[9px] font-black text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded bg-amber-500/10">
                                  {FOCUS_ATTRS.find(f => f.key === youth.developmentFocus)?.label ?? youth.developmentFocus}
                                </span>
                              ) : (
                                <span className="text-slate-600 text-[9px]">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {(youth.weeklyMaintenanceCost ?? 0) > 0 ? (
                                <span className={`text-[9px] font-black ${youth.contractSigned === false ? 'text-amber-400' : 'text-slate-400'}`}>
                                  {youth.weeklyMaintenanceCost} PLN/tydz
                                </span>
                              ) : (
                                <span className="text-slate-600 text-[9px]">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex gap-1 items-center" onClick={e => e.stopPropagation()}>
                                {youth.contractSigned === false ? (
                                  <>
                                    <button
                                      onClick={() => signYouthPlayerContract(youth.id)}
                                      className="px-2 py-1 text-[9px] font-black uppercase rounded bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30 transition-all"
                                      title="Podpisz kontrakt w ciemno — nie znasz talentu zawodnika"
                                    >
                                      Podpisz
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Odrzucić ${youth.firstName} ${youth.lastName}?`)) {
                                          dismissYouthPlayer(youth.id);
                                        }
                                      }}
                                      className="px-2 py-1 text-[9px] font-black uppercase rounded bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/30 transition-all"
                                      title="Odrzuć"
                                    >
                                      ✕
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {/* Focus */}
                                    <select
                                      value={youth.developmentFocus ?? ''}
                                      onChange={e => setYouthFocus(youth.id, (e.target.value || null) as keyof PlayerAttributes | null)}
                                      className="bg-slate-800 text-amber-400 border border-amber-500/30 rounded text-[9px] font-black px-1.5 py-1 cursor-pointer outline-none hover:border-amber-500/60 transition-all"
                                      title="Ustaw focus"
                                    >
                                      <option value="" className="bg-slate-900 text-slate-400">Brak fokusu</option>
                                      {FOCUS_ATTRS.map(f => (
                                        <option key={f.key} value={f.key} className="bg-slate-900 text-slate-200">{f.label}</option>
                                      ))}
                                    </select>
                                    {/* Ocena trenera */}
                                    <button
                                      onClick={() => {
                                        const ok = startScoutMission(youth.id, undefined);
                                        if (!ok) alert('Za mało budżetu na zlecenie raportu!');
                                      }}
                                      disabled={!!youth.revealedTalentRating || !!activeMission}
                                      className="px-2 py-1 text-[9px] font-black uppercase rounded bg-violet-600/20 text-violet-400 border border-violet-500/30 hover:bg-violet-600/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                      title={activeMission ? `Trener obserwuje — raport gotowy ${activeMission.completionDate}` : 'Zleć ocenę trenera (oceni potencjał zawodnika)'}
                                    >
                                      📌
                                    </button>
                                    {/* Awans */}
                                    <div className="relative">
                                      <button
                                        onClick={() => setShowPromoteMenu(prev => prev === youth.id ? null : youth.id)}
                                        disabled={!isReady}
                                        className="px-2 py-1 text-[9px] font-black uppercase rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Awansuj"
                                      >
                                        ↑
                                      </button>
                                      {showPromoteMenu === youth.id && (
                                        <div className="absolute right-0 top-8 z-50 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 min-w-[180px]">
                                          <button
                                            onClick={() => { promoteYouthPlayer(youth.id, 'RESERVES'); setShowPromoteMenu(null); }}
                                            className="w-full text-left px-3 py-2 text-xs text-blue-300 hover:bg-white/5 rounded-lg transition-all font-black"
                                          >
                                            ↑ Do Rezerw
                                          </button>
                                          <button
                                            onClick={() => { promoteYouthPlayer(youth.id, 'FIRST_TEAM'); setShowPromoteMenu(null); }}
                                            className="w-full text-left px-3 py-2 text-xs text-emerald-300 hover:bg-white/5 rounded-lg transition-all font-black"
                                          >
                                            ↑↑ Do Pierwszego Składu
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    {/* Zwolnij */}
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Zwolnić ${youth.firstName} ${youth.lastName}?`)) {
                                          dismissYouthPlayer(youth.id);
                                        }
                                      }}
                                      className="px-2 py-1 text-[9px] font-black uppercase rounded bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/30 transition-all"
                                      title="Zwolnij"
                                    >
                                      ✕
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Karta szczegółów wybranego zawodnika */}
              {selectedYouth && (
                <div className="w-72 shrink-0 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md p-5 shadow-2xl self-start sticky top-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${POSITION_BADGE[selectedYouth.position]}`}>
                      {POSITION_LABEL[selectedYouth.position]}
                    </span>
                    <div>
                      <p className="text-white font-black text-sm">{selectedYouth.firstName} {selectedYouth.lastName}</p>
                      <p className="text-slate-500 text-[9px] uppercase tracking-widest">{selectedYouth.age} lat • {REGION_LABELS[selectedYouth.nationality] ?? selectedYouth.nationality}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Gotowość do awansu</p>
                    <div className="w-full h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${selectedYouth.readinessScore >= readinessThreshold ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${selectedYouth.readinessScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-slate-500">{Math.round(selectedYouth.readinessScore)}%</span>
                      <span className="text-[9px] text-slate-600">Próg: {readinessThreshold}%</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Talent</p>
                    {selectedYouth.revealedTalentRating ? (
                      <span className={`text-xs font-black px-3 py-1 rounded-lg border ${TALENT_LABEL[selectedYouth.revealedTalentRating].color}`}>
                        {TALENT_LABEL[selectedYouth.revealedTalentRating].label}
                      </span>
                    ) : (
                      <p className="text-slate-600 text-xs">Niezbadany — wyślij skaut</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Atrybuty</p>
                    <div className="grid grid-cols-2 gap-1">
                      {ATTR_DISPLAY.map(a => (
                        <div key={a.key} className="flex justify-between items-center px-2 py-1 bg-slate-800/40 rounded-lg">
                          <span className="text-[9px] text-slate-400 font-bold">{a.label}</span>
                          <span className={`text-[10px] font-black ${selectedYouth.attributes[a.key] >= 40 ? 'text-emerald-400' : selectedYouth.attributes[a.key] >= 28 ? 'text-slate-300' : 'text-slate-600'}`}>
                            {selectedYouth.attributes[a.key]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-600 mt-2">Miesięcy w Akademii: {Math.round(selectedYouth.monthsInAcademy)}</p>
                  <p className="text-[9px] text-slate-600">Kontrakt do: {selectedYouth.contractEndDate}</p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Infrastruktura ── */}
          {tab === 'infra' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Poziom akademii */}
              <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-md shadow-xl">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Obecny Poziom Akademii</h3>
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-5xl">{LEVEL_ICON[academy.level]}</span>
                  <div>
                    <p className="text-2xl font-black italic uppercase text-white">{LEVEL_LABEL[academy.level]}</p>
                    <p className="text-slate-500 text-xs">Poziom {academy.level} z 5 · Maks. wychowanków: {maxSlots}</p>
                  </div>
                </div>

                {/* Progress bary poziomów */}
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <div
                      key={lvl}
                      className={`flex-1 h-2 rounded-full ${lvl <= academy.level ? 'bg-emerald-500' : 'bg-slate-700/50'}`}
                    />
                  ))}
                </div>

                {/* Upgrade */}
                {academy.level < 5 && !academy.upgradeInProgress && (() => {
                  const proposalStatus = academy.upgradeProposalStatus;
                  const rejectedUntil = academy.upgradeProposalRejectedUntil;
                  const canResubmit = !rejectedUntil || new Date(currentDate) >= new Date(rejectedUntil);

                  // Stan 1: PENDING — czeka na decyzję
                  if (proposalStatus === 'PENDING') {
                    return (
                      <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/30">
                        <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-1">⏳ Pański wniosek jest w trakcie rozpatrywania...</p>
                        <p className="text-slate-400 text-[10px] mb-1">Właściciel analizuje sytuację finansową i sportową klubu.</p>
                        <p className="text-slate-500 text-[10px]">Decyzja do: <span className="text-blue-300 font-black">{academy.upgradeProposalDecisionDate}</span></p>
                      </div>
                    );
                  }

                  // Stan 2: APPROVED — może zlecić rozbudowę
                  if (proposalStatus === 'APPROVED') {
                    return (
                      <div className="p-4 rounded-xl bg-emerald-900/30 border border-emerald-500/40">
                        <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">✅ Właściciel wyraził zgodę!</p>
                        <p className="text-[10px] text-slate-400 mb-3">
                          Koszt: <span className="text-amber-400 font-black">{upgradeCost.toLocaleString('pl-PL')} PLN</span> |
                          Czas budowy: <span className="text-blue-400 font-black">{upgradeDays} dni</span>
                        </p>
                        <button
                          onClick={startAcademyUpgrade}
                          disabled={!canAffordUpgrade}
                          className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black italic uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                        >
                          {canAffordUpgrade ? 'Rozbuduj Akademię' : 'Za mało środków'}
                        </button>
                      </div>
                    );
                  }

                  // Stan 3: REJECTED — odmowa, czeka 90 dni
                  if (proposalStatus === 'REJECTED' && !canResubmit) {
                    return (
                      <div className="p-4 rounded-xl bg-rose-900/20 border border-rose-500/30">
                        <p className="text-rose-400 text-xs font-black uppercase tracking-widest mb-1">❌ Właściciel odmówił</p>
                        <p className="text-slate-400 text-[10px]">Kolejny wniosek możliwy od: <span className="text-rose-300 font-black">{rejectedUntil}</span></p>
                      </div>
                    );
                  }

                  // Stan 4: brak propozycji / odmowa minęła — złóż wniosek
                  return (
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5">
                      <p className="text-xs font-black text-white mb-1">
                        Upgrade do Poziomu {academy.level + 1} — {LEVEL_LABEL[academy.level + 1]}
                      </p>
                      <p className="text-[10px] text-slate-400 mb-1">
                        Szacowany koszt: <span className="text-amber-400 font-black">{upgradeCost.toLocaleString('pl-PL')} PLN</span> |
                        Czas budowy: <span className="text-blue-400 font-black">{upgradeDays} dni</span>
                      </p>
                      <p className="text-[9px] text-slate-600 mb-3">Wymagana zgoda właściciela klubu. Decyzja w ciągu kilku tygodni/miesięcy.</p>
                      <button
                        onClick={submitUpgradeProposal}
                        className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-lg"
                      >
                        Złóż wniosek do właściciela
                      </button>
                    </div>
                  );
                })()}

                {academy.upgradeInProgress && (
                  <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/30">
                    <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-1">🏗️ Modernizacja w toku...</p>
                    <p className="text-slate-400 text-[10px]">Zakończenie: {academy.upgradeCompletionDate}</p>
                  </div>
                )}

                {academy.level === 5 && (
                  <div className="p-4 rounded-xl bg-yellow-900/20 border border-yellow-500/30">
                    <p className="text-yellow-400 text-xs font-black uppercase tracking-widest">🌟 Maksymalny poziom osiągnięty!</p>
                  </div>
                )}
              </div>

              {/* Budżet operacyjny */}
              <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-md shadow-xl">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Budżet Operacyjny Akademii</h3>
                <p className="text-2xl font-black text-emerald-400 mb-1">
                  {academy.operationalBudgetWeekly.toLocaleString('pl-PL')} PLN
                  <span className="text-slate-500 text-sm font-normal"> / tydzień</span>
                </p>
                <p className="text-slate-500 text-xs mb-4">Wyższy budżet przyspiesza rozwój wychowanków i wpływa na jakość szkoleń.</p>

                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    placeholder="Nowa kwota (PLN)"
                    value={budgetInputValue}
                    onChange={e => setBudgetInputValue(e.target.value)}
                    className="flex-1 bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-bold outline-none focus:border-blue-500/50"
                  />
                  <button
                    onClick={() => {
                      const val = parseInt(budgetInputValue);
                      if (!isNaN(val) && val >= 0) {
                        setAcademyOperationalBudget(val);
                        setBudgetInputValue('');
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95"
                  >
                    Ustaw
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[30_000, 80_000, 150_000, 200_000, 300_000, 500_000].map(preset => (
                    <button
                      key={preset}
                      onClick={() => setAcademyOperationalBudget(preset)}
                      className={`py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                        academy.operationalBudgetWeekly === preset
                          ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                          : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {(preset / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>

                {/* Legenda efektu budgetowego */}
                <div className="mt-5 space-y-1">
                  {[
                    { range: '0 – 30k',   label: 'Bardzo wolny rozwój (–50%)',   color: 'text-rose-400' },
                    { range: '30k – 70k', label: 'Wolny rozwój (–20%)',          color: 'text-orange-400' },
                    { range: '70k – 150k',label: 'Standardowy rozwój',           color: 'text-slate-300' },
                    { range: '150k – 300k',label: 'Przyspieszony (+20%)',        color: 'text-emerald-400' },
                    { range: '300k+',     label: 'Maksymalny (+40%)',            color: 'text-yellow-400' },
                  ].map(row => (
                    <div key={row.range} className="flex justify-between text-[9px] px-2 py-0.5">
                      <span className="text-slate-500">{row.range}</span>
                      <span className={`font-black ${row.color}`}>{row.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statystyki akademii */}
              <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-5 backdrop-blur-md shadow-xl lg:col-span-2">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Statystyki Akademii</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Wychowankowie', value: academy.youthPlayers.length, max: maxSlots, icon: '👦' },
                    { label: 'Awansowani łącznie', value: academy.promotedHistory.length, icon: '⬆️' },
                    { label: 'Aktywne misje', value: academy.activeMissions.length, icon: '🔍' },
                    { label: 'Ostatni nabór', value: academy.lastIntakeYear || '—', icon: '📅' },
                  ].map(stat => (
                    <div key={stat.label} className="p-3 rounded-xl bg-slate-800/40 border border-white/5">
                      <p className="text-lg">{stat.icon}</p>
                      <p className="text-xl font-black text-white">{stat.value}{stat.max ? `/${stat.max}` : ''}</p>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Skautowanie ── */}
          {tab === 'scout' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Aktywne misje */}
              <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-md shadow-xl">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Aktywne Misje Skautingowe</h3>
                <p className="text-[10px] text-slate-500 mb-4">Skaut jedzie do wybranego regionu i szuka nowych talentów do rekrutacji do akademii.</p>

                {/* Formularz nowej misji */}
                {employedScouts.length === 0 ? (
                  <div className="bg-slate-800/30 border border-white/5 rounded-xl p-4 mb-4 text-center">
                    <p className="text-2xl mb-2">🕵️</p>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Brak zatrudnionych skautów</p>
                    <p className="text-slate-600 text-[10px]">Przejdź do zakładki <span className="text-slate-400 font-black">Skauci</span>, aby zatrudnić skauta przed wysłaniem misji.</p>
                  </div>
                ) : (
                <div className="bg-slate-800/40 border border-white/5 rounded-xl p-3 mb-4 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Parametry misji</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Skaut (opcjonalnie)</label>
                      <select
                        value={selectedMissionScoutId}
                        onChange={e => setSelectedMissionScoutId(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg text-[10px] font-black text-slate-200 px-2 py-1.5 outline-none"
                      >
                        <option value="">Bez skauta</option>
                        {employedScouts.filter(s => !s.isOnMission).map(s => {
                          const tier = ScoutService.getScoutTier(s);
                          return (
                            <option key={s.id} value={s.id}>
                              {s.firstName} {s.lastName} [{tier.label}]
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Pozycja (opcjonalnie)</label>
                      <select
                        value={scoutPosition}
                        onChange={e => setScoutPosition(e.target.value as PlayerPosition | '')}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg text-[10px] font-black text-slate-200 px-2 py-1.5 outline-none"
                      >
                        <option value="">Dowolna pozycja</option>
                        <option value={PlayerPosition.GK}>Bramkarz (BR)</option>
                        <option value={PlayerPosition.DEF}>Obrońca (OBR)</option>
                        <option value={PlayerPosition.MID}>Pomocnik (POM)</option>
                        <option value={PlayerPosition.FWD}>Napastnik (NAP)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Wiek</label>
                    <div className="flex items-center gap-1 w-full max-w-[180px]">
                      <select
                        value={scoutAgeMin}
                        onChange={e => { const v = +e.target.value; setScoutAgeMin(v); if (v > scoutAgeMax) setScoutAgeMax(v); }}
                        className="flex-1 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-black text-slate-200 px-1.5 py-1.5 outline-none"
                      >
                        {[15,16,17,18,19,20,21].map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                      <span className="text-slate-600 text-[10px]">-</span>
                      <select
                        value={scoutAgeMax}
                        onChange={e => { const v = +e.target.value; setScoutAgeMax(v); if (v < scoutAgeMin) setScoutAgeMin(v); }}
                        className="flex-1 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-black text-slate-200 px-1.5 py-1.5 outline-none"
                      >
                        {[15,16,17,18,19,20,21].filter(a => a >= scoutAgeMin).map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const ok = startScoutMission(undefined, academy.regionFocus, scoutPosition || undefined, scoutAgeMin, scoutAgeMax, selectedMissionScoutId || undefined);
                      if (!ok) alert('Za mało budżetu na misję skautingową!');
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-black bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition-all"
                  >
                    <div className="font-black uppercase tracking-wider">🔍 Wyślij skauta {academy.regionFocus ? `→ ${REGION_LABELS[academy.regionFocus] ?? academy.regionFocus}` : '→ Globalny'}</div>
                    <div className="text-[9px] font-medium normal-case mt-0.5 text-blue-400/70">
                      Koszt: {AcademyService.getScoutMissionCost(academy.regionFocus, academy.level).toLocaleString('pl-PL')} PLN · ~{AcademyService.getScoutMissionDays(academy.regionFocus, academy.level)} dni
                    </div>
                  </button>
                </div>
                )}

                {/* Lista aktywnych misji */}
                {academy.activeMissions.filter(m => m.isRegionScouting).length === 0 ? (
                  <p className="text-slate-600 text-xs">Brak aktywnych misji.</p>
                ) : (
                  <div className="space-y-2">
                    {academy.activeMissions.filter(m => m.isRegionScouting).map(m => (
                      <div key={m.id} className="p-3 rounded-xl bg-slate-800/40 border border-white/5 flex justify-between items-start">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-white">Misja: {m.regionFocus ? (REGION_LABELS[m.regionFocus] ?? m.regionFocus) : 'Globalny'}</p>
                          <p className="text-[9px] text-slate-400">
                            {m.positionFilter ? POSITION_LABEL[m.positionFilter] : 'Dowolna poz.'} · wiek {m.ageMin ?? 15}–{m.ageMax ?? 21}
                          </p>
                          <p className="text-[9px] text-blue-400">Zakończenie: {m.completionDate}</p>
                        </div>
                        <span className="text-lg">🔍</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Region fokus skautingu */}
              <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-md shadow-xl">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Region Fokus Naboru</h3>
                <p className="text-[10px] text-slate-500 mb-4">Podczas naboru (1 Sierpnia) ~40% wychowanków będzie z tego regionu.</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAcademyRegionFocus(undefined)}
                    className={`py-2 rounded-xl text-[10px] font-black border transition-all ${
                      !academy.regionFocus
                        ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                        : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="uppercase tracking-wider">Globalny</div>
                    <div className="text-[8px] font-medium normal-case opacity-60">{AcademyService.getScoutMissionCost(undefined, academy.level).toLocaleString('pl-PL')} PLN</div>
                  </button>
                  {SELECTABLE_REGIONS.map(region => (
                    <button
                      key={region}
                      onClick={() => setAcademyRegionFocus(region)}
                      className={`py-2 rounded-xl text-[10px] font-black border transition-all ${
                        academy.regionFocus === region
                          ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                          : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="uppercase tracking-wider">{REGION_LABELS[region] ?? region}</div>
                      <div className="text-[8px] font-medium normal-case opacity-60">{AcademyService.getScoutMissionCost(region, academy.level).toLocaleString('pl-PL')} PLN</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Skauci ── */}
          {tab === 'scouts' && (() => {
            const maxScouts = ScoutService.getMaxScouts(academy.level);
            const userClub = clubs.find(c => c.id === userTeamId);
            return (
              <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">

                {/* Zatrudnieni skauci */}
                <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-md shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Zatrudnieni Skauci</h3>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${
                      employedScouts.length >= maxScouts
                        ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                        : 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                    }`}>
                      {employedScouts.length} / {maxScouts}
                    </span>
                  </div>
                  <p className="text-[10px] text-gold-500 mb-4">
                    Maks. skautów na tym poziomie:<span className="text-white font-black">{maxScouts}</span>
                    {academy.level < 5 && <span className="text-slate-600"> </span>}
                  </p>

                  {employedScouts.length === 0 ? (
                    <p className="text-slate-600 text-xs text-center py-6">Brak zatrudnionych skautów.</p>
                  ) : (
                    <div className="space-y-2">
                      {employedScouts.map(scout => {
                        const tier = ScoutService.getScoutTier(scout);
                        const personality = ScoutService.getPersonalityLabel(scout.personality);
                        return (
                          <div key={scout.id} className="p-3 rounded-xl bg-slate-800/40 border border-white/5">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="text-white font-black text-sm">{scout.firstName} {scout.lastName}</p>
                                <p className="text-slate-500 text-[9px] uppercase tracking-wider">{scout.age} lat · {scout.nationality}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${tier.color}`}>{tier.label}</span>
                                {scout.isOnMission && (
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded border text-blue-300 border-blue-500/40 bg-blue-500/10 animate-pulse">W misji</span>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-1 mb-2">
                              {[
                                { label: 'Ocena', value: scout.judgmentAccuracy },
                                { label: 'Kontakty', value: scout.networkDepth },
                                { label: 'Mobilność', value: scout.reportSpeed },
                                { label: 'Doświad.', value: scout.experience },
                              ].map(stat => (
                                <div key={stat.label} className="text-center p-1 bg-slate-700/30 rounded-lg">
                                  <p className={`text-xs font-black ${stat.value >= 15 ? 'text-emerald-400' : stat.value >= 10 ? 'text-slate-300' : 'text-slate-500'}`}>{stat.value}</p>
                                  <p className="text-[8px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${personality.color}`}>{personality.label}</span>
                                {scout.regionalSpecialty && (
                                  <span className="text-[8px] text-slate-500">★ {scout.regionalSpecialty}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-amber-400 font-black">{scout.weeklySalary.toLocaleString('pl-PL')} PLN/tydz</span>
                                <button
                                  onClick={() => setFireScoutConfirm({ id: scout.id, name: `${scout.firstName} ${scout.lastName}`, isOnMission: !!scout.isOnMission })}
                                  className="px-2 py-1 text-[9px] font-black rounded bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/30 transition-all"
                                >
                                  Zwolnij
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Rynek pracy */}
                <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-md shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Rynek Pracy</h3>
                    <button
                      onClick={refreshScoutMarket}
                      className="px-3 py-1 text-[9px] font-black rounded-lg bg-slate-800 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider"
                    >
                      🔄 Odśwież
                    </button>
                  </div>
                  {scoutMarketRefreshDate && (
                    <p className="text-[9px] text-slate-600 mb-3">Ostatnie odświeżenie: {scoutMarketRefreshDate} · auto co 45 dni</p>
                  )}

                  {scoutMarket.length === 0 ? (
                    <p className="text-slate-600 text-xs text-center py-6">Brak dostępnych skautów.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[9px]">
                            <th className="px-2 py-2 text-left">Skaut</th>
                            <th className="px-2 py-2 text-center">Tier</th>
                            <th className="px-2 py-2 text-center" title="Dokładność oceny talentu">Ocena</th>
                            <th className="px-2 py-2 text-center" title="Sieć kontaktów — zwiększa szansę znalezienia talentu i obniża koszt misji">Kontakty</th>
                            <th className="px-2 py-2 text-center" title="Mobilność — skraca czas trwania misji">Mobilność</th>
                            <th className="px-2 py-2 text-center" title="Doświadczenie — zmniejsza błąd w ocenie">Dośw.</th>
                            <th className="px-2 py-2 text-center">Osobow.</th>
                            <th className="px-2 py-2 text-right">PLN/tydz</th>
                            <th className="px-2 py-2 text-center">Akcja</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scoutMarket.map(scout => {
                            const tier = ScoutService.getScoutTier(scout);
                            const personality = ScoutService.getPersonalityLabel(scout.personality);
                            const canHire = employedScouts.length < maxScouts;
                            const clubTooSmall = (userClub?.reputation ?? 5) < scout.minClubReputation;
                            return (
                              <tr key={scout.id} className={`border-t border-slate-700/30 transition-colors ${clubTooSmall ? 'opacity-40' : 'hover:bg-white/[0.03]'}`}>
                                <td className="px-2 py-2">
                                  <p className="font-black text-white text-[11px]">{scout.firstName} {scout.lastName}</p>
                                  <p className="text-slate-500 text-[8px]">{scout.age} l. · {scout.nationality}{scout.regionalSpecialty ? ` · ★ ${scout.regionalSpecialty}` : ''}</p>
                                </td>
                                <td className="px-2 py-2 text-center">
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${tier.color}`}>{tier.label}</span>
                                </td>
                                <td className={`px-2 py-2 text-center font-black text-xs ${scout.judgmentAccuracy >= 15 ? 'text-emerald-400' : scout.judgmentAccuracy >= 10 ? 'text-slate-300' : 'text-slate-500'}`}>{scout.judgmentAccuracy}</td>
                                <td className={`px-2 py-2 text-center font-black text-xs ${scout.networkDepth >= 15 ? 'text-emerald-400' : scout.networkDepth >= 10 ? 'text-slate-300' : 'text-slate-500'}`}>{scout.networkDepth}</td>
                                <td className={`px-2 py-2 text-center font-black text-xs ${scout.reportSpeed >= 15 ? 'text-emerald-400' : scout.reportSpeed >= 10 ? 'text-slate-300' : 'text-slate-500'}`}>{scout.reportSpeed}</td>
                                <td className={`px-2 py-2 text-center font-black text-xs ${scout.experience >= 15 ? 'text-emerald-400' : scout.experience >= 10 ? 'text-slate-300' : 'text-slate-500'}`}>{scout.experience}</td>
                                <td className="px-2 py-2 text-center">
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${personality.color}`}>{personality.label}</span>
                                </td>
                                <td className="px-2 py-2 text-right text-amber-400 font-black text-[10px] whitespace-nowrap">{scout.weeklySalary.toLocaleString('pl-PL')}</td>
                                <td className="px-2 py-2 text-center">
                                  <button
                                    onClick={() => {
                                      if (clubTooSmall) { alert('Twój klub ma za niską reputację dla tego skauta.'); return; }
                                      const ok = hireScout(scout.id);
                                      if (!ok) alert('Osiągnięto limit skautów dla tego poziomu akademii.');
                                    }}
                                    disabled={!canHire || clubTooSmall}
                                    className="px-2 py-1 text-[9px] font-black rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                                  >
                                    {clubTooSmall ? 'Za niska rep.' : canHire ? 'Zatrudnij' : 'Limit'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            );
          })()}

          {/* ── TAB: Historia ── */}
          {tab === 'history' && (
            <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-md shadow-xl">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Historia Awansowań</h3>
              {academy.promotedHistory.length === 0 ? (
                <div className="text-center py-10">
                  <span className="text-4xl mb-3 block">🏆</span>
                  <p className="text-slate-600 text-sm uppercase font-black tracking-widest">Brak awansów</p>
                  <p className="text-slate-700 text-xs mt-1">Awansuj pierwszego wychowanka, aby zacząć tworzyć historię akademii.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {academy.promotedHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/40 border border-white/5 hover:bg-white/[0.03] transition-colors"
                    >
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${POSITION_BADGE[entry.position]}`}>
                        {POSITION_LABEL[entry.position]}
                      </span>
                      <div className="flex-1">
                        <p className="text-white font-black text-sm">{entry.firstName} {entry.lastName}</p>
                        <p className="text-slate-500 text-[9px] uppercase tracking-widest">
                          {entry.promotedYear} · Ogólna: {entry.overallAtPromotion}
                        </p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-1 rounded border ${
                        entry.promotedTo === 'FIRST_TEAM'
                          ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                          : 'text-blue-400 border-blue-500/40 bg-blue-500/10'
                      }`}>
                        {entry.promotedTo === 'FIRST_TEAM' ? 'Pierwszy Skład' : 'Rezerwy'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {fireScoutConfirm && (
        <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 flex flex-col items-center gap-6 shadow-2xl w-80">
            <span className="text-4xl">🔍</span>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-widest text-white mb-2">ZWOLNIENIE SKAUTA</p>
              <p className="text-[11px] text-slate-300 font-bold mb-1">{fireScoutConfirm.name}</p>
              {fireScoutConfirm.isOnMission
                ? <p className="text-[10px] text-amber-400 uppercase tracking-wider">Skaut jest w trakcie misji — zostanie przerwana</p>
                : <p className="text-[10px] text-slate-400 uppercase tracking-wider">Ta decyzja jest nieodwracalna</p>
              }
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setFireScoutConfirm(null)}
                className="flex-1 py-3 rounded-[20px] bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all"
              >
                ANULUJ
              </button>
              <button
                onClick={() => { fireScout(fireScoutConfirm.id); setFireScoutConfirm(null); }}
                className="flex-1 py-3 rounded-[20px] bg-rose-700 border border-rose-500 text-[10px] font-black uppercase tracking-widest text-white hover:bg-rose-600 transition-all"
              >
                ZWOLNIJ
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};
