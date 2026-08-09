import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { PortalScaleWrapper } from '../GameScaler';
import { useGame } from '../../context/GameContext';
import {
  ViewState, PlayerPosition, PlayerAttributes, Region, YouthPlayer, ClubAcademy, Scout,
} from '../../types';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { AcademyService, ACADEMY_UPGRADE_COSTS, ACADEMY_UPGRADE_DAYS, ACADEMY_MAX_SLOTS } from '../../services/AcademyService';
import { ScoutService } from '../../services/ScoutService';
import { PlayerAttributesGenerator } from '../../services/PlayerAttributesGenerator';
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

interface ScoutMissionDraft {
  region: Region | '';
  position: PlayerPosition | '';
  ageMin: number;
  ageMax: number;
}

export const AcademyView: React.FC = () => {
  const {
    academy, initAcademy, submitUpgradeProposal, startAcademyUpgrade, promoteYouthPlayer,
    dismissYouthPlayer, setYouthFocus, startScoutMission, startAnnualYouthIntake, cancelAcademyScoutMission,
    setAcademyOperationalBudget, signYouthPlayerContract, rejectScoutCandidate, startScoutCandidateFollowUp,
    navigateTo, userTeamId, clubs, currentDate,
    scoutPool, scoutMarket, employedScouts, hireScout, fireScout, refreshScoutMarket, scoutMarketRefreshDate, scoutMarketManualRefreshCount, scoutMarketPeriodStart,
    showGameNotification,
  } = useGame();

  const [tab, setTab] = useState<Tab>('players');
  const [hoveredYouthProgress, setHoveredYouthProgress] = useState<{ youth: YouthPlayer; x: number; y: number } | null>(null);

  const [showPromoteMenu, setShowPromoteMenu] = useState<string | null>(null);
  const [budgetInputValue, setBudgetInputValue] = useState<string>('');

  // Formularz misji skautingowej
  const [scoutMissionDrafts, setScoutMissionDrafts] = useState<Record<string, ScoutMissionDraft>>({});
  const [fireScoutConfirm, setFireScoutConfirm] = useState<{ id: string; name: string; isOnMission: boolean } | null>(null);
  const [cancelMissionConfirm, setCancelMissionConfirm] = useState<{ scoutId: string; scoutName: string; cost: number } | null>(null);
  const [youthConfirm, setYouthConfirm] = useState<{ id: string; name: string; action: 'reject' | 'dismiss' | 'candidate' } | null>(null);

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

  const promoteChoiceYouth = useMemo(
    () => sortedYouth.find(yp => yp.id === showPromoteMenu) ?? null,
    [sortedYouth, showPromoteMenu]
  );

  const userClub = clubs.find(c => c.id === userTeamId);
  const budget = userClub?.budget ?? 0;
  const upgradeCost = academy ? (AcademyService.getUpgradeCostForClub(academy.level, userClub?.reputation ?? 5) ?? 0) : 0;
  const upgradeDays = academy ? (AcademyService.getUpgradeDays(academy.level) ?? 0) : 0;
  const canAffordUpgrade = budget >= upgradeCost;
  const maxSlots = academy ? ACADEMY_MAX_SLOTS[academy.level] : 4;
  const readinessThreshold = AcademyService.getReadinessThreshold();

  // ── Renderowanie ──────────────────────────────────────────────────────────────

  const renderYouthProgressTooltip = (youth: YouthPlayer) => {
    const attributeRows = ATTR_DISPLAY.map(a => {
      const value = youth.attributes[a.key];
      const isFocusAttribute = youth.developmentFocus === a.key;
      const color = value >= 40 ? '#34d399' : value >= 28 ? '#f8fafc' : '#64748b';
      const label = FOCUS_ATTRS.find(f => f.key === a.key)?.label ?? a.label;
      return { key: a.key, label, value, isFocusAttribute, color };
    });
    const isReady = youth.readinessScore >= readinessThreshold;
    const talent = youth.revealedTalentRating ? TALENT_LABEL[youth.revealedTalentRating] : null;
    const overall = PlayerAttributesGenerator.calculateOverall(youth.attributes, youth.position);
    const attrSvgW = 860;
    const attrSvgH = 260;
    const attrColW = 430;
    const attrBarStartX = 125;
    const attrBarMaxW = 195;
    const attrBarYStart = 66;
    const attrRowGap = 28;

    return (
      <div
        className="fixed z-[130] pointer-events-none w-[940px] overflow-hidden rounded-[28px] border border-emerald-400/25 bg-slate-950/95 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.68)] backdrop-blur-xl"
        style={hoveredYouthProgress ? { left: `${hoveredYouthProgress.x}px`, top: `${hoveredYouthProgress.y}px` } : undefined}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(16,185,129,0.24),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.55),rgba(2,6,23,0.22))]" />
        <div className="relative z-10 flex items-start justify-between gap-3 px-2 pt-1">
          <div className="min-w-0">
            <span className="block text-[8px] text-emerald-300/75 font-black italic uppercase tracking-tighter">
              Indywidualny progres
            </span>
            <p className="mt-1 truncate text-[15px] text-white font-black italic uppercase tracking-tighter leading-none">
              {youth.firstName} {youth.lastName}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase tracking-widest ${youth.position === PlayerPosition.GK ? 'text-amber-400' : youth.position === PlayerPosition.DEF ? 'text-blue-400' : youth.position === PlayerPosition.MID ? 'text-emerald-400' : 'text-rose-400'}`}>{POSITION_LABEL[youth.position]}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{youth.age} lat</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">{youth.nationalityCountry || REGION_LABELS[youth.nationality] || youth.nationality}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-right">
            <div className="flex flex-col items-center justify-center h-12 w-12 shrink-0 rounded-full border-2 border-white/15 bg-white/[0.05]">
              <span className="text-[6px] text-slate-500 font-black italic uppercase tracking-tighter leading-none">OVR</span>
              <span className="text-base font-black text-white tabular-nums leading-none mt-0.5">{overall}</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-2.5 py-1.5">
              <div className="text-[7px] text-slate-500 font-black italic uppercase tracking-tighter">Gotowość</div>
              <div className={`text-lg font-black tabular-nums leading-none ${isReady ? 'text-emerald-400' : 'text-white'}`}>{Math.round(youth.readinessScore)}%</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-2.5 py-1.5">
              <div className="text-[7px] text-slate-500 font-black italic uppercase tracking-tighter">Talent</div>
              <div className={`text-[11px] font-black uppercase leading-none ${talent ? talent.color.split(' ')[0] : 'text-slate-500'}`}>{talent ? talent.label : 'Nieznany'}</div>
            </div>
          </div>
        </div>

        <svg viewBox={`0 0 ${attrSvgW} ${attrSvgH}`} width="100%" height={attrSvgH} className="relative z-10 mt-3 block">
          <defs>
            {attributeRows.map(attr => (
              <linearGradient key={attr.key} id={`youth-attr-${attr.key}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={attr.color} stopOpacity="0.18" />
                <stop offset="100%" stopColor={attr.color} stopOpacity="0.92" />
              </linearGradient>
            ))}
          </defs>
          <rect x="8" y="4" width={attrSvgW - 16} height={attrSvgH - 10} rx="22" fill="rgba(2,6,23,0.48)" stroke="rgba(255,255,255,0.08)" />
          <text x="24" y="28" fill="rgba(203,213,225,0.72)" fontSize="8" fontWeight="900" fontStyle="italic" letterSpacing="2">
            WSZYSTKIE ATRYBUTY
          </text>
          <line x1="24" y1="44" x2={attrSvgW - 24} y2="44" stroke="rgba(255,255,255,0.08)" />
          {attributeRows.map((attr, i) => {
            const col = i < 6 ? 0 : 1;
            const row = i < 6 ? i : i - 6;
            const x = 24 + col * attrColW;
            const y = attrBarYStart + row * attrRowGap;
            const barX = x + attrBarStartX;
            const barW = Math.max(8, (Math.min(attr.value, 100) / 100) * attrBarMaxW);
            return (
              <g key={attr.key}>
                {attr.isFocusAttribute && (
                  <rect x={x - 6} y={y - 12} width="120" height="20" rx="7" fill="rgba(250,204,21,0.06)" stroke="rgba(250,204,21,0.48)" />
                )}
                <text x={x} y={y + 4} fill={attr.isFocusAttribute ? 'rgba(254,240,138,0.95)' : 'rgba(226,232,240,0.9)'} fontSize="10" fontWeight="900" fontStyle="italic" letterSpacing="1.1">
                  {attr.label.toUpperCase()}
                </text>
                <rect x={barX} y={y - 8} width={attrBarMaxW} height="16" rx="8" fill="rgba(15,23,42,0.92)" stroke="rgba(255,255,255,0.08)" />
                <rect x={barX} y={y - 8} width={barW} height="16" rx="8" fill={`url(#youth-attr-${attr.key})`} />
                <line x1={barX + barW} y1={y - 10} x2={barX + barW} y2={y + 10} stroke={attr.color} strokeOpacity="0.95" strokeWidth="2" />
                <text x={barX + attrBarMaxW + 22} y={y + 4} fill="white" fontSize="12" fontWeight="900" textAnchor="end">
                  {attr.value}
                </text>
                <title>{`${attr.label}: ${attr.value}${attr.isFocusAttribute ? ', focus rozwoju' : ''}`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

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
      {hoveredYouthProgress && createPortal(
        <PortalScaleWrapper>
          {renderYouthProgressTooltip(hoveredYouthProgress.youth)}
        </PortalScaleWrapper>,
        document.body
      )}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img src={rezerwyBg} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.3 }} />
        <div className="absolute inset-0 bg-slate-950/70" />
      </div>

      <div className="min-h-screen text-slate-50 p-4 relative z-10">
        <div className="max-w-[92rem] mx-auto">

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
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 text-slate-300 font-black italic uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all active:translate-y-[2px]"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}
            >
              <span>←</span>
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
                className={`px-5 py-2 rounded-xl text-xs font-black italic uppercase tracking-widest transition-all active:translate-y-[2px] ${
                  tab === t.id ? 'bg-white/15 text-white border-t border-x border-b border-t-white/40 border-x-white/20 border-b-black/60' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
                style={tab === t.id ? { boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)' } : {}}
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
                            className={`border-t border-slate-700/30 transition-colors ${
                              youth.contractSigned === false
                                ? 'bg-amber-500/5 border-l-2 border-l-amber-500/40'
                                : 'hover:bg-white/[0.03]'
                            }`}
                          >
                            <td className="px-3 py-2">
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${POSITION_BADGE[youth.position]}`}>
                                {POSITION_LABEL[youth.position]}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className="font-black text-white cursor-default hover:text-emerald-400 transition-colors"
                                onMouseEnter={e => setHoveredYouthProgress({
                                  youth,
                                  x: Math.max(18, Math.min(e.clientX + 18, window.innerWidth - 962)),
                                  y: Math.max(18, Math.min(Math.max(e.clientY - 210, 32), window.innerHeight - 360))
                                })}
                                onMouseMove={e => setHoveredYouthProgress({
                                  youth,
                                  x: Math.max(18, Math.min(e.clientX + 18, window.innerWidth - 962)),
                                  y: Math.max(18, Math.min(Math.max(e.clientY - 210, 32), window.innerHeight - 360))
                                })}
                                onMouseLeave={() => setHoveredYouthProgress(null)}
                              >{youth.firstName} {youth.lastName}</span>
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
                                      onClick={() => setYouthConfirm({ id: youth.id, name: `${youth.firstName} ${youth.lastName}`, action: 'reject' })}
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
                                        if (!ok) {
                                          showGameNotification({
                                            title: 'Za mało budżetu',
                                            message: 'Nie masz wystarczających środków na zlecenie raportu trenera.',
                                            tone: 'warning'
                                          });
                                        }
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
                                    </div>
                                    {/* Zwolnij */}
                                    <button
                                      onClick={() => setYouthConfirm({ id: youth.id, name: `${youth.firstName} ${youth.lastName}`, action: 'dismiss' })}
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

          {tab === 'scout' && (
              <div className="mb-5 rounded-2xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-md shadow-xl">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-xs text-slate-300 font-black italic uppercase tracking-tighter">Shortlista kandydatów</h3>
                    <p className="text-[10px] text-slate-500 font-black italic uppercase tracking-tighter">Kandydaci nie zajmują miejsca w akademii, dopóki nie podpiszesz z nimi umowy.</p>
                  </div>
                  <span className="text-xs text-amber-300 font-black italic uppercase tracking-tighter">{academy.scoutingCandidates.length} oczekuje</span>
                </div>
                {academy.scoutingCandidates.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-600 font-black italic uppercase tracking-tighter">Brak kandydatów oczekujących na decyzję.</p>
                ) : (
                  <div className="space-y-3">
                    {academy.scoutingCandidates.map(candidate => {
                      const talent = candidate.scoutReport.talentRating ? TALENT_LABEL[candidate.scoutReport.talentRating] : null;
                      const activeFollowUp = academy.activeMissions.find(mission => mission.targetScoutCandidateId === candidate.id);
                      const sourceMission = academy.scoutingHistory.find(entry => entry.id === `HISTORY_${candidate.sourceMissionId}`);
                      const followUpCost = ScoutService.getFollowUpCost(sourceMission?.cost ?? 12_000);
                      const confidenceLabel = candidate.scoutReport.confidence === 'VERY_HIGH'
                        ? 'Bardzo wysoka'
                        : candidate.scoutReport.confidence === 'HIGH'
                          ? 'Wysoka'
                          : candidate.scoutReport.confidence === 'MEDIUM'
                            ? 'Średnia'
                            : 'Niska';
                      const recommendationLabel = candidate.scoutReport.recommendation === 'SIGN'
                        ? 'Podpisz'
                        : candidate.scoutReport.recommendation === 'OBSERVE'
                          ? 'Obserwuj'
                          : 'Odrzuć';
                      return (
                        <div key={candidate.id} className="rounded-xl border border-white/5 bg-slate-800/40 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-base text-white font-black italic uppercase tracking-tighter">{candidate.firstName} {candidate.lastName}</p>
                              <p className="text-[10px] text-slate-400 font-black italic uppercase tracking-tighter">
                                {POSITION_LABEL[candidate.position]} · {candidate.age} lat · {candidate.nationalityCountry || REGION_LABELS[candidate.nationality] || candidate.nationality}
                              </p>
                              <p className="mt-1 text-[9px] text-blue-300 font-black italic uppercase tracking-tighter">Raport: {candidate.scoutReport.scoutName} · pewność {confidenceLabel}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {talent && <span className={`rounded border px-2 py-1 text-[9px] font-black italic uppercase tracking-tighter ${talent.color}`}>{talent.label}</span>}
                              <span className="rounded border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[9px] text-violet-300 font-black italic uppercase tracking-tighter">Rekomendacja: {recommendationLabel}</span>
                              <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[9px] text-amber-300 font-black italic uppercase tracking-tighter">Decyzja do {candidate.decisionDeadline}</span>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-4 gap-1 sm:grid-cols-6 lg:grid-cols-12">
                            {ATTR_DISPLAY.map(attribute => {
                              const estimate = candidate.scoutReport.attributeEstimates[attribute.key];
                              return (
                                <div key={attribute.key} className="rounded-lg bg-slate-900/60 p-1.5 text-center">
                                  <p className="text-[8px] text-slate-500 font-black italic uppercase tracking-tighter">{attribute.label}</p>
                                  <p className="text-[11px] text-slate-200 font-black italic uppercase tracking-tighter">{estimate ? `${estimate.min}–${estimate.max}` : '?'}</p>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-3 flex justify-end gap-2">
                            <button
                              onClick={() => setYouthConfirm({ id: candidate.id, name: `${candidate.firstName} ${candidate.lastName}`, action: 'candidate' })}
                              className="rounded-lg border border-rose-500/30 bg-rose-600/15 px-3 py-2 text-[10px] text-rose-300 transition-all hover:bg-rose-600/25 font-black italic uppercase tracking-tighter"
                            >
                              Odrzuć
                            </button>
                            <button
                              disabled={!!activeFollowUp}
                              onClick={() => {
                                const ok = startScoutCandidateFollowUp(candidate.id);
                                showGameNotification(ok ? {
                                  title: 'Dodatkowa obserwacja',
                                  message: `Skaut przygotuje dokładniejszy raport w ciągu 7 dni. Koszt: ${followUpCost.toLocaleString('pl-PL')} PLN.`,
                                  tone: 'info'
                                } : {
                                  title: 'Nie można rozpocząć obserwacji',
                                  message: 'Oryginalny skaut musi być nadal zatrudniony i dostępny, a klub musi mieć wystarczający budżet.',
                                  tone: 'warning'
                                });
                              }}
                              className="rounded-lg border border-blue-500/30 bg-blue-600/15 px-3 py-2 text-[10px] text-blue-300 transition-all hover:bg-blue-600/25 disabled:cursor-not-allowed disabled:opacity-50 font-black italic uppercase tracking-tighter"
                            >
                              {activeFollowUp ? `Obserwacja do ${activeFollowUp.completionDate}` : `Obserwuj dalej · ${followUpCost.toLocaleString('pl-PL')} PLN`}
                            </button>
                            <button
                              onClick={() => {
                                const ok = signYouthPlayerContract(candidate.id);
                                showGameNotification(ok ? {
                                  title: 'Kandydat przyjęty',
                                  message: `${candidate.firstName} ${candidate.lastName} dołączył do akademii.`,
                                  tone: 'success'
                                } : {
                                  title: 'Brak miejsca',
                                  message: 'Zwolnij miejsce albo rozbuduj akademię przed podpisaniem umowy.',
                                  tone: 'warning'
                                });
                              }}
                              className="rounded-lg border border-emerald-500/30 bg-emerald-600/20 px-3 py-2 text-[10px] text-emerald-300 transition-all hover:bg-emerald-600/30 font-black italic uppercase tracking-tighter"
                            >
                              Podpisz umowę
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
          )}

          {/* ── TAB: Skautowanie ── */}
          {tab === 'scout' && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-xs text-slate-400 font-black italic uppercase tracking-tighter">Zlecenia skautingowe</h3>
                  <p className="mt-1 text-[10px] text-slate-500 font-black italic uppercase tracking-tighter">Ustaw parametry osobno dla każdego zatrudnionego skauta.</p>
                </div>
                {academy.annualIntakeAvailableYear && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                    <p className="text-[10px] text-emerald-300 font-black italic uppercase tracking-tighter">Coroczny nabór {academy.annualIntakeAvailableYear} dostępny</p>
                    <p className="text-[8px] text-emerald-300/60 font-black italic uppercase tracking-tighter">Wybierz „Nabór roczny” przy wolnym skaucie</p>
                  </div>
                )}
              </div>

              {employedScouts.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-slate-800/30 p-8 text-center">
                  <p className="text-2xl">🕵️</p>
                  <p className="mt-2 text-xs text-slate-400 font-black italic uppercase tracking-tighter">Brak zatrudnionych skautów</p>
                  <p className="mt-1 text-[10px] text-slate-600 font-black italic uppercase tracking-tighter">Zatrudnij skauta w zakładce Skauci.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="hidden grid-cols-[minmax(220px,1.25fr)_minmax(145px,0.9fr)_minmax(135px,0.8fr)_150px_150px] gap-3 px-4 text-[9px] text-slate-600 lg:grid font-black italic uppercase tracking-tighter">
                    <span>Skaut</span>
                    <span>Region</span>
                    <span>Pozycja</span>
                    <span>Zakres wieku</span>
                    <span className="text-center">Akcja</span>
                  </div>
                  {employedScouts.map((scout, index) => {
                    const activeMission = academy.activeMissions.find(mission => mission.scoutId === scout.id);
                    const defaultDraft: ScoutMissionDraft = { region: '', position: '', ageMin: 15, ageMax: 21 };
                    const draft = scoutMissionDrafts[scout.id] ?? defaultDraft;
                    const displayedRegion = activeMission ? (activeMission.regionFocus ?? '') : draft.region;
                    const displayedPosition = activeMission ? (activeMission.positionFilter ?? '') : draft.position;
                    const displayedAgeMin = activeMission?.ageMin ?? draft.ageMin;
                    const displayedAgeMax = activeMission?.ageMax ?? draft.ageMax;
                    const tier = ScoutService.getScoutTier(scout);
                    const missionCost = ScoutService.getMissionCost(scout, draft.region || undefined, academy.level);
                    const missionDays = ScoutService.getMissionDays(scout, draft.region || undefined, academy.level);
                    const rowColors = [
                      'bg-slate-800/60',
                      'bg-blue-950/45',
                      'bg-emerald-950/35',
                      'bg-violet-950/35',
                      'bg-amber-950/30',
                    ];
                    const updateDraft = (changes: Partial<ScoutMissionDraft>) => {
                      setScoutMissionDrafts(previous => ({
                        ...previous,
                        [scout.id]: { ...(previous[scout.id] ?? defaultDraft), ...changes },
                      }));
                    };

                    return (
                      <div
                        key={scout.id}
                        className={`grid grid-cols-1 gap-3 rounded-xl border border-white/5 p-4 lg:grid-cols-[minmax(220px,1.25fr)_minmax(145px,0.9fr)_minmax(135px,0.8fr)_150px_150px] lg:items-center ${rowColors[index % rowColors.length]}`}
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-[15px] text-white font-black italic uppercase tracking-tighter">{scout.firstName} {scout.lastName}</p>
                            {activeMission && (
                              <span className="rounded-md border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[9px] text-amber-300 font-black italic uppercase tracking-tighter">Wysłany</span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-black italic uppercase tracking-tighter">{scout.age} lat · {scout.nationality}</span>
                            <span aria-label={`${tier.stars} z 4 gwiazdek`} className="text-[11px] text-amber-300 font-black italic uppercase tracking-tighter">{'★'.repeat(tier.stars)}<span className="text-slate-700">{'★'.repeat(4 - tier.stars)}</span></span>
                          </div>
                          {activeMission && (
                            <p className="mt-1 text-[9px] text-amber-300/70 font-black italic uppercase tracking-tighter">Do {activeMission.completionDate}{activeMission.isAnnualIntake ? ' · Nabór roczny' : ''}</p>
                          )}
                        </div>

                        <div>
                          <label className="mb-1 block text-[9px] text-slate-500 lg:hidden font-black italic uppercase tracking-tighter">Region</label>
                          <select
                            value={displayedRegion}
                            disabled={!!activeMission}
                            onChange={event => updateDraft({ region: event.target.value as Region | '' })}
                            className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-2 py-2 text-[10px] text-slate-200 outline-none disabled:cursor-not-allowed disabled:opacity-60 font-black italic uppercase tracking-tighter"
                          >
                            <option value="">Globalny</option>
                            {SELECTABLE_REGIONS.map(region => <option key={region} value={region}>{REGION_LABELS[region] ?? region}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-[9px] text-slate-500 lg:hidden font-black italic uppercase tracking-tighter">Pozycja</label>
                          <select
                            value={displayedPosition}
                            disabled={!!activeMission}
                            onChange={event => updateDraft({ position: event.target.value as PlayerPosition | '' })}
                            className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-2 py-2 text-[10px] text-slate-200 outline-none disabled:cursor-not-allowed disabled:opacity-60 font-black italic uppercase tracking-tighter"
                          >
                            <option value="">Dowolna</option>
                            <option value={PlayerPosition.GK}>Bramkarz</option>
                            <option value={PlayerPosition.DEF}>Obrońca</option>
                            <option value={PlayerPosition.MID}>Pomocnik</option>
                            <option value={PlayerPosition.FWD}>Napastnik</option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-[9px] text-slate-500 lg:hidden font-black italic uppercase tracking-tighter">Zakres wieku</label>
                          <div className="flex items-center gap-1">
                            <select
                              value={displayedAgeMin}
                              disabled={!!activeMission}
                              onChange={event => {
                                const ageMin = Number(event.target.value);
                                updateDraft({ ageMin, ageMax: Math.max(ageMin, draft.ageMax) });
                              }}
                              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/70 px-2 py-2 text-[10px] text-slate-200 outline-none disabled:cursor-not-allowed disabled:opacity-60 font-black italic uppercase tracking-tighter"
                            >
                              {[15, 16, 17, 18, 19, 20, 21].map(age => <option key={age} value={age}>{age}</option>)}
                            </select>
                            <span className="text-slate-600">–</span>
                            <select
                              value={displayedAgeMax}
                              disabled={!!activeMission}
                              onChange={event => updateDraft({ ageMax: Number(event.target.value) })}
                              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/70 px-2 py-2 text-[10px] text-slate-200 outline-none disabled:cursor-not-allowed disabled:opacity-60 font-black italic uppercase tracking-tighter"
                            >
                              {[15, 16, 17, 18, 19, 20, 21].filter(age => age >= displayedAgeMin).map(age => <option key={age} value={age}>{age}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <button
                            onClick={() => {
                              if (activeMission) {
                                setCancelMissionConfirm({
                                  scoutId: scout.id,
                                  scoutName: `${scout.firstName} ${scout.lastName}`,
                                  cost: activeMission.cost,
                                });
                                return;
                              }
                              const ok = startScoutMission(undefined, draft.region || undefined, draft.position || undefined, draft.ageMin, draft.ageMax, scout.id);
                              showGameNotification(ok ? {
                                title: 'Skaut wysłany',
                                message: `${scout.firstName} ${scout.lastName} rozpoczął poszukiwania.`,
                                tone: 'success'
                              } : {
                                title: 'Nie można wysłać skauta',
                                message: 'Sprawdź budżet oraz dostępność skauta.',
                                tone: 'warning'
                              });
                            }}
                            className={`w-full rounded-lg border px-3 py-2 text-[10px] transition-all font-black italic uppercase tracking-tighter ${activeMission ? 'border-rose-500/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25' : 'border-blue-500/40 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'}`}
                          >
                            {activeMission ? 'Odwołaj' : 'Wyślij'}
                          </button>
                          {!activeMission && (
                            <p className="text-center text-[8px] text-slate-500 font-black italic uppercase tracking-tighter">{missionCost.toLocaleString('pl-PL')} PLN · {missionDays} dni</p>
                          )}
                          {!activeMission && academy.annualIntakeAvailableYear && (
                            <button
                              onClick={() => {
                                const ok = startAnnualYouthIntake(scout.id, draft.region || undefined);
                                showGameNotification(ok ? {
                                  title: 'Nabór rozpoczęty',
                                  message: `${scout.firstName} ${scout.lastName} rozpoczął bezpłatny coroczny nabór.`,
                                  tone: 'success'
                                } : {
                                  title: 'Nie można rozpocząć naboru',
                                  message: 'Skaut nie jest dostępny albo nabór został już wykorzystany.',
                                  tone: 'warning'
                                });
                              }}
                              className="w-full rounded-lg border border-emerald-500/35 bg-emerald-500/15 px-2 py-1.5 text-[9px] text-emerald-300 hover:bg-emerald-500/25 font-black italic uppercase tracking-tighter"
                            >
                              Nabór roczny
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Skauci ── */}
          {tab === 'scouts' && (() => {
            const maxScouts = ScoutService.getMaxScouts(academy.level);
            const userClub = clubs.find(c => c.id === userTeamId);
            return (
              <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-5">

                {/* Zatrudnieni skauci */}
                <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-md shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[15px] font-black text-slate-300 uppercase italic tracking-tighter">Zatrudnieni Skauci</h3>
                    <span className={`text-[13px] font-black px-2.5 py-1 rounded-lg border ${
                      employedScouts.length >= maxScouts
                        ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                        : 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                    }`}>
                      {employedScouts.length} / {maxScouts}
                    </span>
                  </div>
                  <p className="text-[13px] text-gold-500 font-black italic uppercase tracking-tighter mb-4">
                    Maks. skautów na tym poziomie: <span className="text-white font-black italic uppercase tracking-tighter">{maxScouts}</span>
                    {academy.level < 5 && <span className="text-slate-600"> </span>}
                  </p>

                  {employedScouts.length === 0 ? (
                    <p className="text-slate-400 text-[15px] font-black italic uppercase tracking-tighter text-center py-6">Brak zatrudnionych skautów.</p>
                  ) : (
                    <div className="space-y-3">
                      {employedScouts.map(scout => {
                        const tier = ScoutService.getScoutTier(scout);
                        const personality = ScoutService.getPersonalityLabel(scout.personality);
                        return (
                          <div key={scout.id} className="rounded-xl border border-white/5 bg-slate-800/40 p-4">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="break-words text-[17px] text-white font-black italic uppercase tracking-tighter">{scout.firstName} {scout.lastName}</p>
                                <p className="text-slate-400 text-[12px] font-black italic uppercase tracking-tighter">{scout.age} lat · {scout.nationality}</p>
                              </div>
                              <div className="flex shrink-0 flex-col items-end gap-1.5">
                                <span
                                  title={tier.label}
                                  aria-label={`${tier.label}: ${tier.stars} z 4 gwiazdek`}
                                  className="flex items-center gap-0.5 px-1"
                                >
                                  {[1, 2, 3, 4].map(star => (
                                    <span key={star} className={`text-[14px] font-black italic uppercase tracking-tighter ${star <= tier.stars ? 'text-amber-300' : 'text-slate-700'}`}>★</span>
                                  ))}
                                </span>
                                {scout.isOnMission && (
                                  <span className="rounded border border-blue-500/40 bg-blue-500/10 px-1.5 py-0.5 text-[11px] text-blue-300 animate-pulse font-black italic uppercase tracking-tighter">W misji</span>
                                )}
                              </div>
                            </div>
                            <div className="mb-3 grid grid-cols-2 gap-2">
                              {[
                                { label: 'Ocena', value: scout.judgmentAccuracy },
                                { label: 'Kontakty', value: scout.networkDepth },
                                { label: 'Mobilność', value: scout.reportSpeed },
                                { label: 'Doświadczenie', value: scout.experience },
                              ].map(stat => (
                                <div key={stat.label} className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-slate-700/30 px-3 py-2">
                                  <p className="truncate text-[10px] text-slate-400 font-black italic uppercase tracking-tighter">{stat.label}</p>
                                  <p className={`shrink-0 text-[16px] font-black italic uppercase tracking-tighter ${stat.value >= 15 ? 'text-emerald-400' : stat.value >= 10 ? 'text-slate-300' : 'text-slate-500'}`}>{stat.value}</p>
                                </div>
                              ))}
                            </div>
                            <div className="mb-3 flex min-h-6 flex-wrap items-center gap-2">
                                <span className={`text-[11px] font-black italic uppercase tracking-tighter ${personality.color}`}>{personality.label}</span>
                                {scout.regionalSpecialty && (
                                  <span className="text-[11px] text-slate-400 font-black italic uppercase tracking-tighter">★ {scout.regionalSpecialty}</span>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3">
                              <div className="min-w-0">
                                <p className="text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Wynagrodzenie tygodniowe</p>
                                <p className="whitespace-nowrap text-[13px] text-amber-400 font-black italic uppercase tracking-tighter">{scout.weeklySalary.toLocaleString('pl-PL')} PLN</p>
                              </div>
                                <button
                                  onClick={() => setFireScoutConfirm({ id: scout.id, name: `${scout.firstName} ${scout.lastName}`, isOnMission: !!scout.isOnMission })}
                                  className="shrink-0 rounded-lg border border-rose-500/30 bg-rose-600/20 px-3 py-1.5 text-[11px] text-rose-400 transition-all hover:bg-rose-600/30 font-black italic uppercase tracking-tighter"
                                >
                                  Zwolnij
                                </button>
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
                    <h3 className="text-[15px] font-black text-slate-300 uppercase italic tracking-tighter">Rynek Pracy</h3>
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-black italic uppercase tracking-tighter ${scoutMarketManualRefreshCount >= 3 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {3 - Math.min(scoutMarketManualRefreshCount, 3)}/3 odświeżeń
                      </span>
                      <button
                        onClick={refreshScoutMarket}
                        disabled={scoutMarketManualRefreshCount >= 3}
                        className="px-3 py-1 text-[12px] font-black italic uppercase tracking-tighter rounded-lg bg-slate-800/60 border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:translate-y-[2px] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:translate-y-0"
                        style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}
                      >
                        🔄 Odśwież
                      </button>
                    </div>
                  </div>
                  {scoutMarketRefreshDate && (
                    <p className="text-[12px] text-slate-400 font-black italic uppercase tracking-tighter mb-3">Ostatnie odświeżenie: {scoutMarketRefreshDate} · auto co 45 dni</p>
                  )}

                  {scoutMarket.length === 0 ? (
                    <p className="text-slate-400 text-[15px] font-black italic uppercase tracking-tighter text-center py-6">Brak dostępnych skautów.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[15px] border-collapse">
                        <thead>
                          <tr className="bg-slate-800/80 text-slate-300 font-black italic uppercase tracking-tighter text-[9px]">
                            <th className="px-2 py-2 text-left">Imię i Nazwisko</th>
                            <th className="px-2 py-2 text-center border-l border-slate-700/50">Ocena</th>
                            <th className="px-2 py-2 text-center border-l border-slate-700/50" title="Dokładność oceny talentu">
                              <span className="block">Ocena</span>
                              <span className="block text-[7px] opacity-60">Zawodnika</span>
                            </th>
                            <th className="px-2 py-2 text-center border-l border-slate-700/50" title="Sieć kontaktów — zwiększa szansę znalezienia talentu i obniża koszt misji">Kontakty</th>
                            <th className="px-2 py-2 text-center border-l border-slate-700/50" title="Mobilność — skraca czas trwania misji">Mobilność</th>
                            <th className="px-2 py-2 text-center border-l border-slate-700/50" title="Doświadczenie — zmniejsza błąd w ocenie">Dośw.</th>
                            <th className="px-2 py-2 text-center border-l border-slate-700/50">Osobowość</th>
                            <th className="px-2 py-2 text-right border-l border-slate-700/50">
                              <span className="block">Opłata</span>
                              <span className="block text-[7px] opacity-60">Tygodniowa</span>
                            </th>
                            <th className="px-2 py-2 text-center border-l border-slate-700/50">Akcja</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scoutMarket.map((scout, index) => {
                            const tier = ScoutService.getScoutTier(scout);
                            const personality = ScoutService.getPersonalityLabel(scout.personality);
                            const canHire = employedScouts.length < maxScouts;
                            const clubTooSmall = (userClub?.reputation ?? 5) < scout.minClubReputation;
                            return (
                              <tr key={scout.id} className={`border-t border-slate-700/30 transition-colors ${index % 2 === 0 ? 'bg-slate-700/20' : 'bg-transparent'} ${clubTooSmall ? 'opacity-40' : 'hover:bg-white/[0.05]'}`}>
                                <td className="px-2 py-2">
                                  <p className="font-black italic uppercase tracking-tighter text-white text-[14px]">{scout.firstName} {scout.lastName}</p>
                                  <p className="text-slate-400 text-[11px] font-black italic uppercase tracking-tighter">{scout.age} l. · {scout.nationality}{scout.regionalSpecialty && scout.regionalSpecialty !== scout.nationality ? ` · ★ ${scout.regionalSpecialty}` : ''}</p>
                                </td>
                                <td className="px-2 py-2 text-center border-l border-slate-700/30">
                                  <span
                                    title={tier.label}
                                    aria-label={`${tier.label}: ${tier.stars} z 4 gwiazdek`}
                                    className="inline-flex items-center gap-0.5 px-1"
                                  >
                                    {[1, 2, 3, 4].map(star => (
                                      <span key={star} className={`text-[12px] font-black italic uppercase tracking-tighter ${star <= tier.stars ? 'text-amber-300' : 'text-slate-700'}`}>★</span>
                                    ))}
                                  </span>
                                </td>
                                <td className={`px-2 py-2 text-center font-black italic uppercase tracking-tighter text-[15px] border-l border-slate-700/30 ${scout.judgmentAccuracy >= 15 ? 'text-emerald-400' : scout.judgmentAccuracy >= 10 ? 'text-slate-300' : 'text-slate-500'}`}>{scout.judgmentAccuracy}</td>
                                <td className={`px-2 py-2 text-center font-black italic uppercase tracking-tighter text-[15px] border-l border-slate-700/30 ${scout.networkDepth >= 15 ? 'text-emerald-400' : scout.networkDepth >= 10 ? 'text-slate-300' : 'text-slate-500'}`}>{scout.networkDepth}</td>
                                <td className={`px-2 py-2 text-center font-black italic uppercase tracking-tighter text-[15px] border-l border-slate-700/30 ${scout.reportSpeed >= 15 ? 'text-emerald-400' : scout.reportSpeed >= 10 ? 'text-slate-300' : 'text-slate-500'}`}>{scout.reportSpeed}</td>
                                <td className={`px-2 py-2 text-center font-black italic uppercase tracking-tighter text-[15px] border-l border-slate-700/30 ${scout.experience >= 15 ? 'text-emerald-400' : scout.experience >= 10 ? 'text-slate-300' : 'text-slate-500'}`}>{scout.experience}</td>
                                <td className="px-2 py-2 text-center border-l border-slate-700/30">
                                  <span className={`text-[11px] font-black italic uppercase tracking-tighter ${personality.color}`}>{personality.label}</span>
                                </td>
                                <td className="px-2 py-2 text-right text-amber-400 font-black italic uppercase tracking-tighter text-[13px] whitespace-nowrap border-l border-slate-700/30">{scout.weeklySalary.toLocaleString('pl-PL')}</td>
                                <td className="px-2 py-2 text-center border-l border-slate-700/30">
                                  <button
                                    onClick={() => {
                                      if (clubTooSmall) {
                                        showGameNotification({
                                          title: 'Reputacja za niska',
                                          message: 'Twój klub ma za niską reputację dla tego skauta.',
                                          tone: 'warning'
                                        });
                                        return;
                                      }
                                      const hiringFee = scout.weeklySalary * 4;
                                      if ((userClub?.budget ?? 0) < hiringFee) {
                                        showGameNotification({
                                          title: 'Za mało środków',
                                          message: `Zatrudnienie wymaga opłaty początkowej ${hiringFee.toLocaleString('pl-PL')} PLN.`,
                                          tone: 'warning'
                                        });
                                        return;
                                      }
                                      const ok = hireScout(scout.id);
                                      if (!ok) {
                                        showGameNotification({
                                          title: 'Limit skautów',
                                          message: 'Osiągnięto limit skautów dla tego poziomu akademii.',
                                          tone: 'warning'
                                        });
                                      }
                                    }}
                                    disabled={!canHire || clubTooSmall}
                                    className="px-2 py-1 text-[12px] font-black italic uppercase tracking-tighter rounded bg-emerald-600/20 text-emerald-400 border-t border-x border-b border-t-emerald-400/40 border-x-emerald-500/20 border-b-black/60 hover:bg-emerald-600/30 transition-all active:translate-y-[2px] disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                                    style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}
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
              <h3 className="mb-4 text-xs text-slate-500 font-black italic uppercase tracking-tighter">Historia misji skautingowych</h3>
              {academy.scoutingHistory.length === 0 ? (
                <p className="mb-8 py-5 text-center text-xs text-slate-600 font-black italic uppercase tracking-tighter">Brak zakończonych misji.</p>
              ) : (
                <div className="mb-8 space-y-2">
                  {academy.scoutingHistory.map(entry => (
                    <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-800/40 p-3">
                      <div>
                        <p className="text-xs text-white font-black italic uppercase tracking-tighter">
                          {entry.isAnnualIntake ? 'Coroczny nabór · ' : ''}{entry.scoutName} · {entry.regionFocus ? (REGION_LABELS[entry.regionFocus] ?? entry.regionFocus) : 'Globalny'}
                        </p>
                        <p className="text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">{entry.startedDate} → {entry.completionDate} · {entry.cost.toLocaleString('pl-PL')} PLN</p>
                      </div>
                      <span className={`rounded border px-2 py-1 text-[9px] font-black italic uppercase tracking-tighter ${
                        entry.status === 'SUCCESS'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : entry.status === 'CANCELLED'
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                            : 'border-slate-500/30 bg-slate-500/10 text-slate-400'
                      }`}>
                        {entry.status === 'SUCCESS' ? `Znaleziono: ${entry.foundCount}` : entry.status === 'CANCELLED' ? 'Przerwana' : 'Bez kandydatów'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mb-6 border-t border-white/10" />
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

      {promoteChoiceYouth && (
        <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] border border-emerald-500/25 bg-slate-950/95 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.75)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />
            <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="relative flex flex-col items-center gap-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-emerald-400/30 bg-emerald-500/15 text-3xl text-emerald-200 shadow-[0_0_32px_rgba(16,185,129,0.22)]">
                ↑
              </div>
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-emerald-300">
                  Awans wychowanka
                </p>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                  {promoteChoiceYouth.firstName} {promoteChoiceYouth.lastName}
                </h3>
                <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Wybierz docelową kadrę
                </p>
              </div>
              <div className="grid w-full gap-3">
                <button
                  type="button"
                  onClick={() => {
                    promoteYouthPlayer(promoteChoiceYouth.id, 'RESERVES');
                    setShowPromoteMenu(null);
                  }}
                  className="rounded-2xl border border-blue-400/35 bg-blue-600/20 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-blue-100 transition-all hover:bg-blue-600/30"
                >
                  Do rezerw
                </button>
                <button
                  type="button"
                  onClick={() => {
                    promoteYouthPlayer(promoteChoiceYouth.id, 'FIRST_TEAM');
                    setShowPromoteMenu(null);
                  }}
                  className="rounded-2xl border border-emerald-400/35 bg-emerald-600/25 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-100 transition-all hover:bg-emerald-600/35"
                >
                  Do pierwszej drużyny
                </button>
                <button
                  type="button"
                  onClick={() => setShowPromoteMenu(null)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {youthConfirm && (
        <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] border border-rose-500/25 bg-slate-950/95 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.75)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-rose-500" />
            <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-rose-500/10 blur-3xl" />
            <div className="relative flex flex-col items-center gap-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-rose-400/30 bg-rose-500/15 text-3xl shadow-[0_0_32px_rgba(244,63,94,0.22)]">
                !
              </div>
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-rose-300">
                  Decyzja akademii
                </p>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                  {youthConfirm.action === 'dismiss' ? 'Zwolnić zawodnika?' : 'Odrzucić zawodnika?'}
                </h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-300 normal-case">
                  {youthConfirm.name}
                </p>
              </div>
              <div className="grid w-full grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setYouthConfirm(null)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (youthConfirm.action === 'candidate') rejectScoutCandidate(youthConfirm.id);
                    else dismissYouthPlayer(youthConfirm.id);
                    setYouthConfirm(null);
                  }}
                  className="rounded-2xl border border-rose-400/35 bg-rose-600/25 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-rose-100 transition-all hover:bg-rose-600/35"
                >
                  Potwierdź
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {cancelMissionConfirm && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-amber-500/25 bg-slate-950/95 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-amber-400" />
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="relative flex flex-col items-center gap-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-amber-400/30 bg-amber-500/15 text-3xl text-amber-300 shadow-[0_0_32px_rgba(251,191,36,0.2)]">!</div>
              <div>
                <p className="mb-2 text-[10px] text-amber-300 font-black italic uppercase tracking-tighter">Przerwanie misji skautingowej</p>
                <h3 className="text-2xl text-white font-black italic uppercase tracking-tighter">Odwołać skauta?</h3>
                <p className="mt-3 text-sm text-slate-300 font-black italic uppercase tracking-tighter">{cancelMissionConfirm.scoutName}</p>
              </div>
              <div className="w-full rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                {cancelMissionConfirm.cost > 0 ? (
                  <p className="text-[11px] leading-relaxed text-amber-200 font-black italic uppercase tracking-tighter">
                    Koszt wysłania skauta w wysokości {cancelMissionConfirm.cost.toLocaleString('pl-PL')} PLN nie zostanie zwrócony.
                  </p>
                ) : (
                  <p className="text-[11px] leading-relaxed text-amber-200 font-black italic uppercase tracking-tighter">
                    Misja była bezpłatna, ale cały dotychczasowy postęp zostanie utracony.
                  </p>
                )}
                <p className="mt-2 text-[10px] text-slate-300 font-black italic uppercase tracking-tighter">Czy na pewno chcesz odwołać skauta?</p>
              </div>
              <div className="grid w-full grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCancelMissionConfirm(null)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-[10px] text-slate-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white font-black italic uppercase tracking-tighter"
                >
                  Zostaw na misji
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const confirmation = cancelMissionConfirm;
                    const ok = cancelAcademyScoutMission(confirmation.scoutId);
                    setCancelMissionConfirm(null);
                    showGameNotification(ok ? {
                      title: 'Misja odwołana',
                      message: `${confirmation.scoutName} jest ponownie dostępny.${confirmation.cost > 0 ? ' Koszt misji nie został zwrócony.' : ''}`,
                      tone: 'warning'
                    } : {
                      title: 'Nie można odwołać misji',
                      message: 'Misja została już zakończona albo skaut nie jest dostępny.',
                      tone: 'warning'
                    });
                  }}
                  className="rounded-2xl border border-rose-400/35 bg-rose-600/25 px-5 py-3 text-[10px] text-rose-100 transition-all hover:bg-rose-600/35 font-black italic uppercase tracking-tighter"
                >
                  Odwołaj skauta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};
