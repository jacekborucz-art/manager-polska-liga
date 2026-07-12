import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { PortalScaleWrapper } from '../GameScaler';
import { useGame } from '../../context/GameContext';
import { ViewState, Player, StaffRole, PlayerPosition, TrainingIntensity } from '../../types';
import { TrainingAssistantService, generatePlayerReport } from '../../services/TrainingAssistantService';
import { MATCH_PREP_FOCUSES } from '../../data/match_prep_focuses_pl';
import { getFocusDaysCount, isFocusReady } from '../../services/MatchPrepFocusService';
import { getTrainableAttributesForPosition } from '../../services/TrainingAttributeRules';
import { findTeamTrainingCycle, getTeamTrainingCycles, isTeamTrainingCycleId } from '../../services/TrainingProgramRules';
import { KitPreview } from '../common/KitPreview';

const MAX_ASSISTANT_TRAINING_SUGGESTIONS_PER_WEEK = 3;

const getAssistantTrainingWeekKey = (date: Date): string => {
  const start = new Date(date.getFullYear(), 0, 1);
  const day = Math.floor((
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
    new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  ) / 86_400_000);
  return `${date.getFullYear()}-${Math.floor(day / 7)}`;
};

const createStableAssistantRng = (seed: string): (() => number) => {
  let state = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    state ^= seed.charCodeAt(i);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export const TrainingView: React.FC = () => {
  const {
    navigateTo,
    activeTrainingId,
    setActiveTrainingId,
    clubs,
    userTeamId,
    activeIntensity,
    setTrainingIntensity,
    players,
    updatePlayer,
    viewPlayerDetails,
    setPlayers,
    showGameNotification,
    trainingProgressHistory,
    currentDate,
    setClubs,
    staffMembers,
  } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(
    isTeamTrainingCycleId(activeTrainingId) ? activeTrainingId : null
  );
  const [hoveredAttribute, setHoveredAttribute] = useState<{ label: string; x: number; y: number } | null>(null);
  const [hoveredPlayerProgress, setHoveredPlayerProgress] = useState<{ player: Player; x: number; y: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; player: Player } | null>(null);
  const [reportPlayer, setReportPlayer] = useState<Player | null>(null);
  const [modalPos, setModalPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'training' | 'focus' | 'load'>('training');
  const [selectedFocusId, setSelectedFocusId] = useState<string | null>(null);
  const [hasIndividualFocusChange, setHasIndividualFocusChange] = useState(false);
  const [hasIndividualLoadChange, setHasIndividualLoadChange] = useState(false);
  const [hoveredCycleHint, setHoveredCycleHint] = useState<{ name: string; description: string; x: number; y: number } | null>(null);
  const teamPlayers = (userTeamId ? players[userTeamId] : []) || [];
  const allLeaguePlayers = useMemo(() => Object.values(players).flat(), [players]);
  const cachedReport = useMemo(() => {
    if (!reportPlayer) return null;
    const club = clubs.find(c => c.id === userTeamId);
    const getStaffQ = (role: StaffRole, keys: string[]) => {
      const ms = (club?.staffIds ?? []).map(id => staffMembers[id]).filter(s => s?.role === role);
      if (ms.length === 0) return 0;
      return Math.round(ms.reduce((sum, s) => sum + keys.reduce((ks, k) => ks + (((s?.attributes ?? {}) as Record<string, number>)[k] ?? 10), 0) / keys.length, 0) / ms.length);
    };
    const staffQuality = {
      assistantExists: (club?.staffIds ?? []).some(id => staffMembers[id]?.role === StaffRole.ASSISTANT_COACH),
      assistantAvg: getStaffQ(StaffRole.ASSISTANT_COACH, ['offensiveTactics', 'defensiveTactics', 'motivation']),
      fitnessExists: (club?.staffIds ?? []).some(id => staffMembers[id]?.role === StaffRole.FITNESS_COACH),
      fitnessAvg: getStaffQ(StaffRole.FITNESS_COACH, ['periodization', 'fitnessTests', 'nutrition']),
      goalkeeperExists: (club?.staffIds ?? []).some(id => staffMembers[id]?.role === StaffRole.GOALKEEPER_COACH),
      goalkeeperAvg: getStaffQ(StaffRole.GOALKEEPER_COACH, ['gkTechnique', 'positioning', 'footwork'])
    };
    const activeTeamCycle = findTeamTrainingCycle(activeTrainingId);
    return generatePlayerReport(reportPlayer, teamPlayers, allLeaguePlayers, staffQuality, {
      activeTrainingName: activeTeamCycle?.name ?? null,
      intensity: activeIntensity
    });
  }, [reportPlayer, clubs, userTeamId, staffMembers, teamPlayers, allLeaguePlayers, activeTrainingId, activeIntensity]);

  const myClub = clubs.find(c => c.id === userTeamId);
  const hasAssistant = (myClub?.staffIds ?? [])
    .some(id => staffMembers[id]?.role === StaffRole.ASSISTANT_COACH);
  const assistantTrainingWeekKey = getAssistantTrainingWeekKey(currentDate);
  const assistantTrainingSuggestionCount = myClub?.assistantTrainingSuggestionWeekKey === assistantTrainingWeekKey
    ? (myClub.assistantTrainingSuggestionCount ?? 0)
    : 0;
  const assistantTrainingSuggestionsRemaining = Math.max(
    0,
    MAX_ASSISTANT_TRAINING_SUGGESTIONS_PER_WEEK - assistantTrainingSuggestionCount
  );
  const isAssistantTrainingSuggestionLimitReached = assistantTrainingSuggestionsRemaining === 0;
  const teamTrainingCycles = useMemo(() => getTeamTrainingCycles(), []);
  const currentCycle = findTeamTrainingCycle(selectedId);
  const sortedPlayers = useMemo(() => (
    [...teamPlayers].sort((a, b) => {
      const ord: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
      return (ord[a.position] ?? 4) - (ord[b.position] ?? 4);
    })
  ), [teamPlayers]);

  const ATTR_LABELS: Record<string, string> = {
    strength: 'Siła', stamina: 'Kondycja', pace: 'Szybkość', defending: 'Obrona',
    passing: 'Podania', attacking: 'Atak', finishing: 'Wykończenie', technique: 'Technika',
    vision: 'Wizja', dribbling: 'Drybling', heading: 'Gra głową', positioning: 'Ustawianie',
    goalkeeping: 'Bramkarstwo', freeKicks: 'Rzuty wolne', penalties: 'Jedenastki',
    corners: 'Rożne', aggression: 'Agresja', crossing: 'Dośrodkowania',
    leadership: 'Przywództwo', mentality: 'Mentalność', workRate: 'Pracowitość', talent: 'Talent'
  };
  const TRAINABLE_ATTRS = Object.entries(ATTR_LABELS);

  const ATTR_ABBR: Record<string, string> = {
    strength: 'SIŁ', stamina: 'KON', pace: 'SZY', defending: 'OBR',
    heading: 'GŁW', positioning: 'UST', goalkeeping: 'BRA', passing: 'POD',
    technique: 'TEC', vision: 'WIZ', dribbling: 'DRY', crossing: 'DŚR',
    attacking: 'ATK', finishing: 'WYK', freeKicks: 'RWL', corners: 'RŻN',
    penalties: 'KRN', aggression: 'AGR', leadership: 'PRZ', mentality: 'MEN', workRate: 'PRC', talent: 'TAL'
  };
  const POSITION_KEY_ATTRS: Record<PlayerPosition, Set<string>> = {
    [PlayerPosition.GK]: new Set(['goalkeeping', 'positioning', 'passing', 'mentality']),
    [PlayerPosition.DEF]: new Set(['defending', 'positioning', 'heading', 'strength', 'passing']),
    [PlayerPosition.MID]: new Set(['passing', 'vision', 'technique', 'dribbling', 'workRate']),
    [PlayerPosition.FWD]: new Set(['finishing', 'attacking', 'technique', 'pace', 'heading'])
  };
  const COLS = Object.keys(ATTR_ABBR);
  const PROGRESS_MODULES = [
    { label: 'TECHNIKA', keys: ['technique', 'passing', 'vision', 'dribbling', 'crossing'], color: '#38bdf8' },
    { label: 'KONDYCJA', keys: ['stamina', 'pace', 'strength'], color: '#f59e0b' },
    { label: 'DEFENSYWA', keys: ['defending', 'positioning', 'heading'], color: '#60a5fa' },
    { label: 'ATAK', keys: ['attacking', 'finishing', 'freeKicks', 'corners', 'penalties'], color: '#fb7185' },
    { label: 'MENTAL', keys: ['mentality', 'workRate', 'leadership', 'aggression'], color: '#a78bfa' }
  ];
  const INTENSITY_OPTIONS: { id: TrainingIntensity; label: string; shortLabel: string; color: string; active: string }[] = [
    { id: TrainingIntensity.LIGHT, label: 'LEKKI', shortLabel: 'Lekki', color: 'border-t-white/10 border-x-white/5 border-b-black/40 text-emerald-400', active: 'bg-emerald-500 text-black border-t-emerald-300/70 border-x-emerald-400/40 border-b-black/60' },
    { id: TrainingIntensity.NORMAL, label: 'NORMALNY', shortLabel: 'Normalny', color: 'border-t-white/10 border-x-white/5 border-b-black/40 text-blue-400', active: 'bg-blue-500 text-white border-t-blue-300/70 border-x-blue-400/40 border-b-black/60' },
    { id: TrainingIntensity.HEAVY, label: 'CIĘŻKI', shortLabel: 'Ciężki', color: 'border-t-white/10 border-x-white/5 border-b-black/40 text-rose-400', active: 'bg-rose-500 text-white border-t-rose-300/70 border-x-rose-400/40 border-b-black/60' }
  ];
  const getIntensityLabel = (intensity: TrainingIntensity): string =>
    INTENSITY_OPTIONS.find(option => option.id === intensity)?.shortLabel ?? intensity;

  const CYCLE_ACCENT: Record<string, string> = {
    T_TACTICAL_PERIOD: '#7c3aed',
    T_GEGENPRESSING:   '#ea580c',
    T_TIKI_TAKA:       '#0284c7',
    T_CATENACCIO:      '#1d4ed8',
    T_SAQ:             '#d97706',
    T_AIR_DOM:         '#9333ea',
    T_SET_PIECES:      '#e11d48',
    T_RECOVERY_YOGA:   '#0d9488',
    T_HIGH_PRESS:      '#dc2626',
    T_COUNTER_ATTACK:  '#65a30d',
  };

  const buildProgressRows = (sourcePlayers: Player[]) => PROGRESS_MODULES.map(module => {
    const values = sourcePlayers.flatMap(player => module.keys.map(key => (
      (player.attributes[key as keyof typeof player.attributes] as number) ?? 0
    )));
    const changes = sourcePlayers.flatMap(player => module.keys.map(key => (
      player.stats.seasonalChanges?.[key] ?? 0
    )));
    const score = values.length > 0
      ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      : 0;
    const change = changes.length > 0
      ? Number((changes.reduce((sum, value) => sum + value, 0) / changes.length).toFixed(1))
      : 0;
    return { ...module, score, change };
  });

  const handleSave = () => {
    if (selectedId) {
      setActiveTrainingId(selectedId);
      navigateTo(ViewState.DASHBOARD);
    }
  };

  const handleAskAssistant = () => {
    if (!userTeamId || !myClub || teamPlayers.length === 0) return;

    if (isAssistantTrainingSuggestionLimitReached) {
      showGameNotification({
        title: 'Limit sugestii asystenta',
        message: 'Asystent przygotował już 3 propozycje w tym tygodniu. Kolejna konsultacja będzie dostępna w następnym tygodniu.',
        tone: 'info'
      });
      return;
    }

    const assistants = (myClub?.staffIds ?? [])
      .map(id => staffMembers[id])
      .filter(s => !!s && s.role === StaffRole.ASSISTANT_COACH);
    const assistantIndividualWork = assistants.length > 0
      ? assistants.reduce((sum, s) => sum + (s.attributes.individualWork ?? 10), 0) / assistants.length
      : 10;

    const planRng = createStableAssistantRng(`${myClub.id}_${assistantTrainingWeekKey}_training_plan`);
    const plan = TrainingAssistantService.buildPlan(teamPlayers, planRng, assistantIndividualWork);
    const selectedCycle = findTeamTrainingCycle(plan.cycleId);

    setSelectedId(plan.cycleId);
    setActiveTrainingId(plan.cycleId);
    setPlayers(prev => ({
      ...prev,
      [userTeamId]: (prev[userTeamId] || []).map(player => ({
        ...player,
        trainingFocus: plan.playerFocuses[player.id] ?? player.trainingFocus ?? null
      }))
    }));
    setClubs(prev => prev.map(club => club.id === userTeamId ? {
      ...club,
      assistantTrainingSuggestionWeekKey: assistantTrainingWeekKey,
      assistantTrainingSuggestionCount: assistantTrainingSuggestionCount + 1
    } : club));

    showGameNotification({
      title: 'Asystent ustawił trening',
      message: `Wybrał program ${selectedCycle?.name || 'treningowy'} i przydzielił indywidualny fokus dla ${teamPlayers.length} zawodników. Pozostałe konsultacje w tym tygodniu: ${assistantTrainingSuggestionsRemaining - 1}.`,
      tone: 'info'
    });
  };

  const handleSaveFocus = () => {
    if (!selectedFocusId || !userTeamId) return;
    const todayStr = currentDate.toISOString().split('T')[0];
    setClubs(prev => prev.map(c => {
      if (c.id !== userTeamId) return c;
      const isChanging = c.matchPrepFocusId !== selectedFocusId;
      return {
        ...c,
        matchPrepFocusId: selectedFocusId,
        matchPrepFocusStartDate: isChanging ? todayStr : (c.matchPrepFocusStartDate ?? todayStr),
      };
    }));
    const focusName = MATCH_PREP_FOCUSES.find(f => f.id === selectedFocusId)?.name ?? '';
    showGameNotification({
      title: 'Fokus tygodniowy ustawiony',
      message: `Program "${focusName}" aktywowany. Efekt zadziala po 5 dniach bez przerwy.`,
      tone: 'info',
    });
    setActiveTab('training');
    setSelectedFocusId(null);
  };

  const tooltipStyle = hoveredAttribute
    ? {
        left: `${hoveredAttribute.x + 14}px`,
        top: `${Math.max(hoveredAttribute.y - 10, 18)}px`,
        transform: 'translateY(-100%)'
      }
    : undefined;

  const playerProgressTooltipStyle = hoveredPlayerProgress
    ? {
        left: `${hoveredPlayerProgress.x}px`,
        top: `${hoveredPlayerProgress.y}px`
      }
    : undefined;

  const renderPlayerProgressTooltip = (player: Player) => {
    const attributeRows = COLS.map(key => {
      const value = (player.attributes[key as keyof typeof player.attributes] as number) ?? 0;
      const change = player.stats.seasonalChanges?.[key] ?? 0;
      const isKeyAttribute = POSITION_KEY_ATTRS[player.position]?.has(key) ?? false;
      const color = value >= 85 ? '#34d399' : value >= 75 ? '#f8fafc' : value >= 60 ? '#facc15' : '#fb7185';
      return {
        key,
        label: ATTR_ABBR[key],
        fullLabel: ATTR_LABELS[key] || key,
        value,
        change,
        isKeyAttribute,
        color
      };
    });
    const totalChange = Number(Object.values(player.stats.seasonalChanges ?? {})
      .reduce((sum, value) => sum + value, 0)
      .toFixed(1));
    const trendColor = totalChange > 0 ? '#34d399' : totalChange < 0 ? '#fb7185' : '#94a3b8';
    const trendIcon = totalChange > 0 ? '▲' : totalChange < 0 ? '▼' : '—';
    const trendLabel = totalChange > 0 ? `+${totalChange}` : `${totalChange}`;
    const attrSvgW = 860;
    const attrSvgH = 390;
    const attrColW = 430;
    const attrBarStartX = 125;
    const attrBarMaxW = 195;
    const attrBarYStart = 66;
    const attrRowGap = 28;

    return (
      <div
        className="fixed z-[130] pointer-events-none w-[940px] overflow-hidden rounded-[28px] border border-emerald-400/25 bg-slate-950/95 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.68)] backdrop-blur-xl"
        style={playerProgressTooltipStyle}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(16,185,129,0.24),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.55),rgba(2,6,23,0.22))]" />
        <div className="relative z-10 flex items-start justify-between gap-3 px-2 pt-1">
          <div className="min-w-0">
            <span className="block text-[8px] text-emerald-300/75 font-black italic uppercase tracking-tighter">
              Indywidualny progres
            </span>
            <p className="mt-1 truncate text-[15px] text-white font-black italic uppercase tracking-tighter leading-none">
              {player.firstName[0]}. {player.lastName}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase tracking-widest ${player.position === 'GK' ? 'text-amber-400' : player.position === 'DEF' ? 'text-blue-400' : player.position === 'MID' ? 'text-emerald-400' : 'text-rose-400'}`}>{player.position === 'GK' ? 'Bramkarz' : player.position === 'DEF' ? 'Obrońca' : player.position === 'MID' ? 'Pomocnik' : 'Napastnik'}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{player.age} lat</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-right">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-2.5 py-1.5">
              <div className="text-[7px] text-slate-500 font-black italic uppercase tracking-tighter">OVR</div>
              <div className="text-lg font-black text-white tabular-nums leading-none">{player.overallRating}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-2.5 py-1.5">
              <div className="text-[7px] text-slate-500 font-black italic uppercase tracking-tighter">Trend</div>
              <div className="text-lg font-black tabular-nums leading-none" style={{ color: trendColor }}>{trendIcon} {trendLabel}</div>
            </div>
          </div>
        </div>

        <svg viewBox={`0 0 ${attrSvgW} ${attrSvgH}`} width="100%" height={attrSvgH} className="relative z-10 mt-3 block">
          <defs>
            {attributeRows.map(attr => (
              <linearGradient key={attr.key} id={`player-attr-${attr.key}`} x1="0" y1="0" x2="1" y2="0">
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
            const col = i < 11 ? 0 : 1;
            const row = i < 11 ? i : i - 11;
            const x = 24 + col * attrColW;
            const y = attrBarYStart + row * attrRowGap;
            const barX = x + attrBarStartX;
            const barW = Math.max(8, (Math.min(attr.value, 100) / 100) * attrBarMaxW);
            const changeColor = attr.change > 0 ? '#34d399' : attr.change < 0 ? '#fb7185' : '#94a3b8';
            const changeIcon = attr.change > 0 ? '▲' : attr.change < 0 ? '▼' : '—';
            const changeLabel = attr.change > 0 ? `+${attr.change}` : `${attr.change}`;
            return (
              <g key={attr.key}>
                {attr.isKeyAttribute && (
                  <rect x={x - 6} y={y - 12} width="120" height="20" rx="7" fill="rgba(250,204,21,0.06)" stroke="rgba(250,204,21,0.48)" />
                )}
                <text x={x} y={y + 4} fill={attr.isKeyAttribute ? 'rgba(254,240,138,0.95)' : 'rgba(226,232,240,0.9)'} fontSize="10" fontWeight="900" fontStyle="italic" letterSpacing="1.1">
                  {attr.fullLabel.toUpperCase()}
                </text>
                <rect x={barX} y={y - 8} width={attrBarMaxW} height="16" rx="8" fill="rgba(15,23,42,0.92)" stroke="rgba(255,255,255,0.08)" />
                <rect x={barX} y={y - 8} width={barW} height="16" rx="8" fill={`url(#player-attr-${attr.key})`} />
                <line x1={barX + barW} y1={y - 10} x2={barX + barW} y2={y + 10} stroke={attr.color} strokeOpacity="0.95" strokeWidth="2" />
                <text x={barX + attrBarMaxW + 22} y={y + 4} fill="white" fontSize="12" fontWeight="900" textAnchor="end">
                  {attr.value}
                </text>
                {attr.change !== 0 && (
                  <text x={barX + attrBarMaxW + 26} y={y + 4} fill={changeColor} fontSize="10" fontWeight="900">
                    {changeIcon} {changeLabel}
                  </text>
                )}
                <title>{`${attr.fullLabel}: ${attr.value}, trend ${changeLabel}${attr.isKeyAttribute ? ', ważny dla pozycji' : ''}`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col animate-fade-in overflow-hidden relative bg-slate-950 font-sans">
      {hoveredAttribute && (
        <div
          className="fixed z-[120] pointer-events-none rounded-lg border border-emerald-400/30 bg-slate-950/95 px-2.5 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-md"
          style={tooltipStyle}
        >
          <span className="block text-[9px] font-black uppercase tracking-[0.28em] text-emerald-400/80">Atrybut</span>
          <span className="block text-[10px] font-bold text-white whitespace-nowrap">{hoveredAttribute.label}</span>
        </div>
      )}

      {hoveredCycleHint && (
        <div
          className="fixed z-[120] pointer-events-none w-80 rounded-2xl border border-white/15 bg-slate-950/96 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          style={{ left: `${hoveredCycleHint.x + 18}px`, top: `${Math.max(hoveredCycleHint.y - 80, 18)}px` }}
        >
          <span className="block text-[8px] font-black uppercase tracking-[0.35em] text-slate-500 mb-2">{hoveredCycleHint.name}</span>
          <p className="text-[13px] text-white font-semibold leading-relaxed">{hoveredCycleHint.description}</p>
        </div>
      )}

      {hoveredPlayerProgress && createPortal(
        <PortalScaleWrapper>
          {renderPlayerProgressTooltip(hoveredPlayerProgress.player)}
        </PortalScaleWrapper>,
        document.body
      )}

      {/* TŁO KINEMATYCZNE */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: "url('https://i.ibb.co/VcMTs5c6/traning.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-slate-950" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* NAGŁÓWEK TECHNICZNY */}
      <header className="relative z-20 flex items-center justify-between px-12 py-8 border-b border-white/10 bg-white/5 backdrop-blur-3xl shrink-0 shadow-2xl">
         <div className="flex items-center gap-8">
            <div className="w-16 h-16 rounded-[22px] bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-inner animate-pulse-slow">
               🏋️‍♂️
            </div>
            <div className="flex flex-col">
               <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                    Centrum <span className="text-emerald-500">Treningowe</span>
                  </h1>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">System Aktywny</span>
                  </div>
               </div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Optymalizacja Rozwoju • {myClub?.name.toUpperCase()}</p>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo(ViewState.DASHBOARD)}
              className="px-8 py-4 rounded-2xl bg-white/5 border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all active:translate-y-[2px]"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >
              &larr; Anuluj zmiany
            </button>
            <button
              onClick={handleAskAssistant}
              disabled={teamPlayers.length === 0 || !hasAssistant || isAssistantTrainingSuggestionLimitReached}
              title={isAssistantTrainingSuggestionLimitReached ? 'Limit 3 konsultacji w tym tygodniu został wykorzystany' : undefined}
              className="px-8 py-4 rounded-2xl bg-blue-600/85 hover:bg-blue-500 disabled:opacity-20 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all active:translate-y-[2px] border-t border-x border-b border-t-blue-300/60 border-x-blue-400/30 border-b-black/60"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 16px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}
            >
              POPROŚ ASYSTENTA ({assistantTrainingSuggestionsRemaining}/3)
            </button>
            {selectedId && (selectedId !== activeTrainingId || hasIndividualFocusChange || hasIndividualLoadChange) ? (
              <button
                onClick={handleSave}
                className="px-14 py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black italic uppercase tracking-tighter text-lg transition-all active:translate-y-[2px] border-t border-x border-b border-t-emerald-300/60 border-x-emerald-500/30 border-b-black/60"
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 8px 24px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.2)' }}
              >
                ZATWIERDŹ PROGRAM 🏁
              </button>
            ) : (
              <button
                onClick={() => navigateTo(ViewState.DASHBOARD)}
                className="px-14 py-5 rounded-2xl bg-white/5 border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all active:translate-y-[2px]"
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
              >
                WYJDŹ
              </button>
            )}
         </div>
      </header>

      {/* ZAKŁADKI */}
      <div className="relative z-20 flex items-center gap-2 px-12 pt-4 border-b border-white/5 shrink-0">
        <button
          onClick={() => setActiveTab('training')}
          className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest transition-all rounded-xl border-t border-x border-b active:translate-y-[2px] ${activeTab === 'training' ? 'text-emerald-400 bg-emerald-600/10 border-t-emerald-400/40 border-x-emerald-500/20 border-b-black/60' : 'text-slate-500 bg-white/5 border-t-white/10 border-x-white/5 border-b-black/40 hover:text-slate-300 hover:bg-white/10'}`}
          style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          Program Treningowy
        </button>
        <button
          onClick={() => setActiveTab('focus')}
          className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest transition-all rounded-xl border-t border-x border-b active:translate-y-[2px] ${activeTab === 'focus' ? 'text-emerald-400 bg-emerald-600/10 border-t-emerald-400/40 border-x-emerald-500/20 border-b-black/60' : 'text-slate-500 bg-white/5 border-t-white/10 border-x-white/5 border-b-black/40 hover:text-slate-300 hover:bg-white/10'}`}
          style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          Fokus
          {myClub?.matchPrepFocusId && (
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[7px] font-black ${isFocusReady(myClub, currentDate.toISOString().split('T')[0]) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
              {isFocusReady(myClub, currentDate.toISOString().split('T')[0]) ? 'AKTYWNY' : `${getFocusDaysCount(myClub, currentDate.toISOString().split('T')[0])}/5`}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('load')}
          className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest transition-all rounded-xl border-t border-x border-b active:translate-y-[2px] ${activeTab === 'load' ? 'text-emerald-400 bg-emerald-600/10 border-t-emerald-400/40 border-x-emerald-500/20 border-b-black/60' : 'text-slate-500 bg-white/5 border-t-white/10 border-x-white/5 border-b-black/40 hover:text-slate-300 hover:bg-white/10'}`}
          style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          Obciążenie
        </button>
      </div>

      {/* GŁÓWNA PRZESTRZEŃ ROBOCZA */}
      {activeTab === 'training' && (
      <div className="relative z-10 flex-1 flex gap-4 p-12 min-h-0 overflow-hidden">

        {/* LEWA STRONA: LISTA ZAWODNIKÓW */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">

              {/* FOKUS INDYWIDUALNY ZAWODNIKÓW */}
              <div className="pb-20">
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 px-1">Fokus Indywidualny Zawodników</span>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="text-[9px] font-bold border-collapse" style={{ minWidth: 'max-content' }}>
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-2 px-3 text-left text-slate-500 uppercase tracking-widest sticky left-0 bg-slate-950 z-10 whitespace-nowrap">ZAWODNIK</th>
                        <th className="py-2 px-2 text-center text-slate-500 uppercase tracking-widest font-black">WIEK</th>
                        {COLS.map(k => (
                          <th key={k} className="py-2 px-2 text-center text-slate-500 uppercase tracking-widest font-black">{ATTR_ABBR[k]}</th>
                        ))}
                        <th className="p-0" style={{ width: 6, minWidth: 6, maxWidth: 6 }} aria-hidden="true" />
                        <th className="py-2 px-1 text-center text-slate-500 uppercase tracking-widest sticky right-0 bg-slate-950 z-10" style={{ width: 118, minWidth: 118, maxWidth: 118 }}>FOKUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPlayers.map((player, idx) => {
                        const posColor = player.position === 'GK' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : player.position === 'DEF' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                          : player.position === 'MID' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'bg-rose-500/20 border-rose-500/40 text-rose-400';
                        const stickyBg = idx % 2 === 0 ? 'bg-slate-950' : 'bg-[#090e1a]';
                        return (
                          <tr
                            key={player.id}
                            onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, player }); }}
                            className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-context-menu ${idx % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}
                          >
                            <td className={`py-2 px-3 sticky left-0 z-10 whitespace-nowrap ${stickyBg}`}>
                              <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border mr-2 text-[11px] font-black ${posColor}`}>{player.overallRating}</span>
                              <button
                                onClick={() => viewPlayerDetails(player.id)}
                                onMouseEnter={e => setHoveredPlayerProgress({
                                  player,
                                  x: Math.max(18, Math.min(e.clientX + 18, window.innerWidth - 962)),
                                  y: Math.max(18, Math.min(Math.max(e.clientY - 210, 32), window.innerHeight - 520))
                                })}
                                onMouseMove={e => setHoveredPlayerProgress({
                                  player,
                                  x: Math.max(18, Math.min(e.clientX + 18, window.innerWidth - 962)),
                                  y: Math.max(18, Math.min(Math.max(e.clientY - 210, 32), window.innerHeight - 520))
                                })}
                                onMouseLeave={() => setHoveredPlayerProgress(null)}
                                className="text-[11px] font-black uppercase text-white hover:text-emerald-400 transition-colors cursor-pointer active:translate-y-[2px]"
                              >{player.firstName[0]}. {player.lastName}</button>
                            </td>
                            <td className="py-2 px-2 text-center tabular-nums text-slate-300">
                              {player.age}
                            </td>
                            {COLS.map(k => {
                              const val = (player.attributes[k as keyof typeof player.attributes] as number) ?? 0;
                              const change = player.stats.seasonalChanges?.[k as string] ?? 0;
                              const isKeyAttribute = POSITION_KEY_ATTRS[player.position]?.has(k) ?? false;
                              const color = val >= 85 ? 'text-emerald-400' : val >= 75 ? 'text-white' : val >= 60 ? 'text-amber-400' : 'text-rose-400';
                              const attributeLabel = ATTR_LABELS[k] || k;
                              return (
                                <td
                                  key={k}
                                  title={`${attributeLabel}${isKeyAttribute ? ' • ważny dla pozycji' : ''}${change !== 0 ? ` ${change > 0 ? '+' : ''}${change}` : ''}`}
                                  className={`relative py-2 px-2 text-center tabular-nums ${color}`}
                                  onMouseEnter={e => setHoveredAttribute({ label: attributeLabel, x: e.clientX, y: e.clientY })}
                                  onMouseMove={e => setHoveredAttribute({ label: attributeLabel, x: e.clientX, y: e.clientY })}
                                  onMouseLeave={() => setHoveredAttribute(null)}
                                >
                                  {isKeyAttribute && (
                                    <span className="pointer-events-none absolute inset-x-0 inset-y-1 border border-yellow-400/70 bg-yellow-400/5" />
                                  )}
                                  {change !== 0 ? (
                                    <span className={`relative z-10 inline-flex h-3.5 min-w-5 items-center justify-center rounded-[3px] px-1 ${change > 0 ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/45' : 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/45'}`}>
                                      {val}
                                    </span>
                                  ) : (
                                    <span className="relative z-10">{val}</span>
                                  )}
                                  {change !== 0 && (
                                    <span className={`absolute right-0.5 top-1/2 z-20 -translate-y-1/2 text-[7px] font-black ${change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {change > 0 ? '▲' : '▼'}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="p-0" style={{ width: 6, minWidth: 6, maxWidth: 6 }} aria-hidden="true" />
                            <td className={`py-2 px-1 sticky right-0 z-10 ${stickyBg}`} style={{ width: 118, minWidth: 118, maxWidth: 118 }}>
                              <select
                                value={player.trainingFocus || ''}
                                onChange={e => { updatePlayer(userTeamId!, player.id, { trainingFocus: (e.target.value as any) || null }); setHasIndividualFocusChange(true); }}
                                className="w-full bg-slate-800 border border-white/10 text-white text-[9px] font-black rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-emerald-500/40 transition-all"
                              >
                                <option value="">— Brak —</option>
                                {TRAINABLE_ATTRS
                                  .filter(([key]) => getTrainableAttributesForPosition(player.position).includes(key as keyof Player['attributes']))
                                  .map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                  ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
        </div>

        {/* PRAWA STRONA: PROGRAMY + DIAGNOSTYKA */}
        <div className="w-[640px] shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar animate-slide-left pb-20">

           {/* WYKRES PROGRESU TRENINGOWEGO */}
           {trainingProgressHistory.length >= 2 && (() => {
             const data = trainingProgressHistory;
             const W = 620;
             const minVal = Math.min(...data) - 1;
             const maxVal = Math.max(...data) + 1;
             const range = maxVal - minVal || 1;
             const last = data[data.length - 1];
             const prev = data[data.length - 2];
             const first = data[0];
             const diff = last - prev;
             const totalDiff = last - first;
             const best = Math.max(...data);
             const worst = Math.min(...data);
             const trendColor = diff > 0 ? '#10b981' : diff < 0 ? '#f43f5e' : '#94a3b8';
             const trendArrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '—';
             const trendLabel = diff > 0 ? `+${diff}` : `${diff}`;
             const totalLabel = totalDiff > 0 ? `+${totalDiff}` : `${totalDiff}`;
             const statusLabel = diff > 0 ? 'Drużyna rośnie' : diff < 0 ? 'Spadek formy' : 'Stabilnie';
             const statusText = diff > 0
               ? 'Ostatni tydzień podniósł średni potencjał składu.'
               : diff < 0
                 ? 'Ostatni tydzień obniżył średni OVR. Warto sprawdzić intensywność i fokus.'
                 : 'Średni OVR nie zmienił się po ostatnim tygodniu.';
             const moduleRows = buildProgressRows(teamPlayers);
             const moduleSvgH = 286;
             const barStartX = 118;
             const barMaxW = 372;
             const barYStart = 130;
             const barGap = 30;
             const ovrBarY = 58;
             const historyY = 78;
             const sectionDividerY = 104;
             const moduleTitleY = 124;
             const ovrBarW = Math.max(8, (Math.min(last, 100) / 100) * barMaxW);
             return (
               <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-slate-950/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-md">
                 <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(16,185,129,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.35),rgba(2,6,23,0.1))]" />
                 <div className="relative z-10 flex items-start justify-between gap-4">
                   <div>
                     <div className="flex items-center gap-2">
                       <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]" />
                       <span className="text-[9px] text-slate-400 font-black italic uppercase tracking-tighter">Progres treningowy drużyny</span>
                     </div>
                     <p className="mt-1 text-[10px] text-slate-500 font-black italic uppercase tracking-tighter">
                       Średni OVR kadry po kolejnych tygodniach treningu
                     </p>
                   </div>

                   <div className="grid grid-cols-3 gap-2 text-right">
                     <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                       <div className="text-[8px] text-slate-500 font-black italic uppercase tracking-tighter">Teraz</div>
                       <div className="text-xl font-black text-white tabular-nums leading-none">OVR {last}</div>
                     </div>
                     <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                       <div className="text-[8px] text-slate-500 font-black italic uppercase tracking-tighter">Tydzień</div>
                       <div className="text-xl font-black tabular-nums leading-none" style={{ color: trendColor }}>{trendArrow} {trendLabel}</div>
                     </div>
                     <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                       <div className="text-[8px] text-slate-500 font-black italic uppercase tracking-tighter">Okres</div>
                       <div className={`text-xl font-black tabular-nums leading-none ${totalDiff > 0 ? 'text-emerald-300' : totalDiff < 0 ? 'text-rose-300' : 'text-slate-300'}`}>{totalLabel}</div>
                     </div>
                   </div>
                 </div>

                 <div className="relative z-10 mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                   <div>
                     <div className="text-[10px] text-white font-black italic uppercase tracking-tighter">{statusLabel}</div>
                     <div className="text-[9px] text-slate-400 font-semibold">{statusText}</div>
                   </div>
                   <div className="flex gap-2 text-[9px] font-black uppercase tabular-nums">
                     <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-emerald-300">MAX {best}</span>
                     <span className="rounded-full border border-slate-400/20 bg-slate-400/10 px-2 py-1 text-slate-300">MIN {worst}</span>
                   </div>
                 </div>

                 <svg viewBox={`0 0 ${W} ${moduleSvgH}`} width="100%" height={moduleSvgH} className="relative z-10 mt-3 block">
                   <defs>
                     <linearGradient id="tpg" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
                       <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                     </linearGradient>
                     {moduleRows.map(module => (
                       <linearGradient key={module.label} id={`module-${module.label}`} x1="0" y1="0" x2="1" y2="0">
                         <stop offset="0%" stopColor={module.color} stopOpacity="0.25" />
                         <stop offset="100%" stopColor={module.color} stopOpacity="0.95" />
                       </linearGradient>
                     ))}
                     <filter id="tpgGlow" x="-20%" y="-20%" width="140%" height="140%">
                       <feGaussianBlur stdDeviation="3" result="blur" />
                       <feMerge>
                         <feMergeNode in="blur" />
                         <feMergeNode in="SourceGraphic" />
                       </feMerge>
                     </filter>
                   </defs>
                   <rect x="8" y="4" width={W - 16} height={moduleSvgH - 10} rx="24" fill="rgba(2,6,23,0.42)" stroke="rgba(255,255,255,0.08)" />
                   <text x="26" y="24" fill="rgba(203,213,225,0.72)" fontSize="8" fontWeight="900" fontStyle="italic" letterSpacing="2">
                     ŚREDNI OVERALL
                   </text>
                   <text x="28" y={ovrBarY + 5} fill="rgba(226,232,240,0.9)" fontSize="10" fontWeight="900" fontStyle="italic" letterSpacing="1.2">
                     OVR DRUŻYNY
                   </text>
                   <rect x={barStartX} y={ovrBarY - 10} width={barMaxW} height="20" rx="10" fill="rgba(15,23,42,0.9)" stroke="rgba(255,255,255,0.08)" />
                   <rect x={barStartX} y={ovrBarY - 10} width={ovrBarW} height="20" rx="10" fill="url(#tpg)" />
                   <rect x={barStartX} y={ovrBarY - 10} width={ovrBarW} height="20" rx="10" fill="rgba(16,185,129,0.36)" filter="url(#tpgGlow)" />
                   <line x1={barStartX + ovrBarW} y1={ovrBarY - 13} x2={barStartX + ovrBarW} y2={ovrBarY + 13} stroke="#34d399" strokeWidth="2.4" />
                   <circle cx={barStartX + ovrBarW} cy={ovrBarY} r="6" fill="#10b981" stroke="#a7f3d0" strokeWidth="1.4" />
                   <text x={barStartX + barMaxW + 16} y={ovrBarY + 5} fill="white" fontSize="13" fontWeight="900" textAnchor="end">
                     {last}
                   </text>
                   <text x={barStartX + barMaxW + 72} y={ovrBarY + 5} fill={trendColor} fontSize="10" fontWeight="900">
                     {trendArrow} {trendLabel}
                   </text>
                   <text x="28" y={historyY + 7} fill="rgba(148,163,184,0.58)" fontSize="7" fontWeight="900" letterSpacing="1">
                     HISTORIA TYGODNI
                   </text>
                   {data.map((value, i) => {
                     const cellGap = 3;
                     const cellW = Math.max(5, (barMaxW - (data.length - 1) * cellGap) / data.length);
                     const x = barStartX + i * (cellW + cellGap);
                     const opacity = 0.25 + ((value - minVal) / range) * 0.65;
                     return (
                       <g key={i}>
                         <rect x={x} y={historyY} width={cellW} height="8" rx="4" fill="#34d399" opacity={opacity} />
                         <title>{`Tydzień ${i + 1}: OVR ${value}`}</title>
                       </g>
                     );
                   })}
                   <line x1="26" y1={sectionDividerY} x2={W - 26} y2={sectionDividerY} stroke="rgba(255,255,255,0.08)" />
                   <text x="26" y={moduleTitleY} fill="rgba(203,213,225,0.72)" fontSize="8" fontWeight="900" fontStyle="italic" letterSpacing="2">
                     MAPA TRENDÓW ATRYBUTÓW
                   </text>
                   {moduleRows.map((module, i) => {
                     const y = barYStart + 18 + i * barGap;
                     const barW = Math.max(8, (Math.min(module.score, 100) / 100) * barMaxW);
                     const changeColor = module.change > 0 ? '#34d399' : module.change < 0 ? '#fb7185' : '#94a3b8';
                     const changeIcon = module.change > 0 ? '▲' : module.change < 0 ? '▼' : '—';
                     const changeLabel = module.change > 0 ? `+${module.change}` : `${module.change}`;
                     return (
                       <g key={module.label}>
                         <text x="28" y={y + 4} fill="rgba(226,232,240,0.9)" fontSize="10" fontWeight="900" fontStyle="italic" letterSpacing="1.2">
                           {module.label}
                         </text>
                         <rect x={barStartX} y={y - 8} width={barMaxW} height="16" rx="8" fill="rgba(15,23,42,0.9)" stroke="rgba(255,255,255,0.08)" />
                         <rect x={barStartX} y={y - 8} width={barW} height="16" rx="8" fill={`url(#module-${module.label})`} />
                         <line x1={barStartX + barW} y1={y - 10} x2={barStartX + barW} y2={y + 10} stroke={module.color} strokeOpacity="0.95" strokeWidth="2" />
                         <text x={barStartX + barMaxW + 16} y={y + 4} fill="white" fontSize="12" fontWeight="900" textAnchor="end">
                           {module.score}
                         </text>
                         <text x={barStartX + barMaxW + 72} y={y + 4} fill={changeColor} fontSize="10" fontWeight="900">
                           {changeIcon} {changeLabel}
                         </text>
                         <title>{`${module.label}: średnia ${module.score}, trend ${changeLabel}`}</title>
                       </g>
                     );
                   })}
                 </svg>
               </div>
             );
           })()}

           {/* SIATKA PROGRAMÓW TRENINGOWYCH */}
           <div>
              <div className="mb-3">
                <span className="block text-[11px] font-black text-white uppercase tracking-[0.35em]">Programy Treningowe</span>
                <div className="mt-1.5 h-px bg-gradient-to-r from-yellow-400/70 via-yellow-300/30 to-transparent" />
              </div>
              <div className="grid grid-cols-2 auto-rows-[64px] gap-3">
                {teamTrainingCycles.map(cycle => {
                  const isActive = activeTrainingId === cycle.id;
                  const isSelected = selectedId === cycle.id;
                  const accent = CYCLE_ACCENT[cycle.id] ?? '#10b981';
                  return (
                    <button
                      key={cycle.id}
                      onClick={() => setSelectedId(cycle.id)}
                      onMouseEnter={e => setHoveredCycleHint({ name: cycle.name, description: cycle.description, x: Math.min(e.clientX, window.innerWidth - 330), y: e.clientY })}
                      onMouseMove={e => setHoveredCycleHint({ name: cycle.name, description: cycle.description, x: Math.min(e.clientX, window.innerWidth - 330), y: e.clientY })}
                      onMouseLeave={() => setHoveredCycleHint(null)}
                      className="relative h-full p-3 rounded-2xl transition-all duration-200 text-left overflow-hidden active:translate-y-[2px] border-t border-x border-b border-b-black/60 hover:scale-[1.03] hover:brightness-110"
                      style={{
                        backgroundColor: isSelected ? `${accent}22` : `${accent}0d`,
                        borderTopColor: isSelected ? `${accent}99` : `${accent}44`,
                        borderLeftColor: isSelected ? `${accent}55` : `${accent}22`,
                        borderRightColor: isSelected ? `${accent}55` : `${accent}22`,
                        boxShadow: isSelected
                          ? `0 3px 0 rgba(0,0,0,0.5), 0 6px 20px ${accent}44, inset 0 1px 0 rgba(255,255,255,0.08)`
                          : `0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`
                      }}
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-opacity duration-200"
                        style={{ backgroundColor: accent, opacity: isSelected ? 1 : 0.35, boxShadow: isSelected ? `0 0 8px ${accent}` : 'none' }}
                      />
                      <div className="relative z-10 flex h-full items-center gap-3 pl-2">
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <h4 className="text-sm font-black text-white uppercase italic tracking-tighter truncate">{cycle.name}</h4>
                          {isActive && (
                            <span className="bg-blue-600/20 text-blue-400 text-[7px] px-2 py-0.5 rounded-full border border-blue-500/30 font-black tracking-widest uppercase shrink-0">OBECNY</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
           </div>

           {/* PANEL DIAGNOSTYKI */}
           <div className="bg-slate-900/60 rounded-[40px] border border-white/10 backdrop-blur-3xl p-5 flex flex-col gap-4 shadow-[0_50px_100px_rgba(0,0,0,0.7)]">

              {/* PANEL INTENSYWNOŚCI */}
              <div className="bg-black/40 p-3 rounded-[20px] border border-white/5">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 block px-1">Intensywność</span>
                 <div className="flex gap-2">
                    {[
                      { id: 'LIGHT', label: 'LEKKI', color: 'border-t-white/10 border-x-white/5 border-b-black/40 text-emerald-400', active: 'bg-emerald-500 text-black border-t-emerald-300/70 border-x-emerald-400/40 border-b-black/60' },
                      { id: 'NORMAL', label: 'NORMALNY', color: 'border-t-white/10 border-x-white/5 border-b-black/40 text-blue-400', active: 'bg-blue-500 text-white border-t-blue-300/70 border-x-blue-400/40 border-b-black/60' },
                      { id: 'HEAVY', label: 'CIĘŻKI', color: 'border-t-white/10 border-x-white/5 border-b-black/40 text-rose-400', active: 'bg-rose-500 text-white border-t-rose-300/70 border-x-rose-400/40 border-b-black/60' }
                    ].map(btn => (
                       <button
                          key={btn.id}
                          onClick={() => setTrainingIntensity(btn.id as any)}
                          className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all border-t border-x border-b active:translate-y-[2px] ${activeIntensity === btn.id ? btn.active : `bg-white/5 ${btn.color} hover:bg-white/10`}`}
                          style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                       >
                          {btn.label}
                       </button>
                    ))}
                 </div>
              </div>

              {currentCycle ? (
                <div className="flex flex-col gap-3 animate-fade-in">

                  {/* PRIORYTETOWE */}
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-2 px-1">Priorytet</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentCycle.primaryAttributes.map(attr => (
                        <span key={attr} className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 uppercase italic tracking-tight">
                          + {ATTR_LABELS[attr] || attr}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* WSPIERAJĄCE */}
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-2 px-1">Wsparcie</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentCycle.secondaryAttributes.map(attr => (
                        <span key={attr} className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 uppercase italic tracking-tight">
                          + {ATTR_LABELS[attr] || attr}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* OBCIĄŻENIE */}
                  {(() => {
                    let totalRisk = currentCycle.fatigueRisk;
                    if (activeIntensity === 'HEAVY') totalRisk += 0.3;
                    if (activeIntensity === 'LIGHT') totalRisk -= 0.2;
                    totalRisk = Math.max(0.1, Math.min(1.0, totalRisk));
                    const color = totalRisk > 0.7 ? 'text-rose-500' : totalRisk > 0.4 ? 'text-amber-500' : 'text-emerald-500';
                    const barColor = totalRisk > 0.7 ? 'bg-gradient-to-r from-rose-600 to-rose-400' : totalRisk > 0.4 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400';
                    return (
                      <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Obciążenie</span>
                          <span className={`text-base font-black italic tabular-nums ${color}`}>{Math.round(totalRisk * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
                          <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${totalRisk * 100}%` }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* BONUS REGENERACJI */}
                  {currentCycle.recoveryBonus && (
                    <div className="p-3 bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/30 rounded-2xl flex items-center gap-3">
                       <div className="text-2xl">🧘</div>
                       <div>
                          <span className="block text-[8px] font-black text-blue-400 uppercase tracking-[0.3em] mb-0.5">Regeneracja</span>
                          <span className="text-[10px] font-black text-white italic uppercase tracking-tight">+50% odzysk sił</span>
                       </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center opacity-30 py-8">
                   <div className="text-5xl mb-4">🔬</div>
                   <p className="text-xs font-black uppercase tracking-[0.3em] italic text-slate-500">Wybierz cykl</p>
                </div>
              )}
           </div>
        </div>
      </div>
      )}

      {/* FOKUS TYGODNIOWY TAB */}
      {activeTab === 'focus' && (() => {
        const todayStr = currentDate.toISOString().split('T')[0];
        const activeFocusId = myClub?.matchPrepFocusId ?? null;
        const activeFocus = MATCH_PREP_FOCUSES.find(f => f.id === activeFocusId) ?? null;
        const daysCount = activeFocusId && myClub ? getFocusDaysCount(myClub, todayStr) : 0;
        const isReady = activeFocusId && myClub ? isFocusReady(myClub, todayStr) : false;
        const previewFocus = MATCH_PREP_FOCUSES.find(f => f.id === selectedFocusId) ?? null;
        const isChanging = selectedFocusId && selectedFocusId !== activeFocusId;
        return (
          <div className="relative z-10 flex-1 flex gap-8 p-12 min-h-0 overflow-hidden">
            {/* LEWA: SIATKA FOKUSÓW */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-20">
              <span className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 px-1">Wybierz Fokus Przedmeczowy</span>
              <div className="grid grid-cols-3 gap-3">
                {MATCH_PREP_FOCUSES.map(focus => {
                  const isCurrent = activeFocusId === focus.id;
                  const isSelected = selectedFocusId === focus.id;
                  return (
                    <button
                      key={focus.id}
                      onClick={() => setSelectedFocusId(prev => prev === focus.id ? null : focus.id)}
                      className={`group relative p-4 rounded-2xl transition-all duration-300 text-left overflow-hidden active:translate-y-[2px] border-t border-x border-b
                        ${isSelected ? 'bg-emerald-600/15 border-t-emerald-400/60 border-x-emerald-500/30 border-b-black/60'
                        : isCurrent ? 'bg-blue-600/10 border-t-blue-400/40 border-x-blue-500/20 border-b-black/60'
                        : 'bg-slate-900/40 border-t-white/10 border-x-white/5 border-b-black/40 hover:bg-slate-900/60'}`}
                      style={{ boxShadow: isSelected ? '0 3px 0 rgba(0,0,0,0.5), 0 6px 16px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.08)' : isCurrent ? '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(29,78,216,0.15), inset 0 1px 0 rgba(255,255,255,0.06)' : '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)' }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-white uppercase italic tracking-tighter truncate">{focus.name}</h4>
                          {isCurrent && isReady && (
                            <span className="text-[7px] font-black uppercase tracking-widest text-emerald-400">● AKTYWNY</span>
                          )}
                          {isCurrent && !isReady && (
                            <span className="text-[7px] font-black uppercase tracking-widest text-amber-400">Dzień {daysCount}/5</span>
                          )}
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 leading-relaxed">{focus.description}</p>
                      {isSelected && (
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRAWA: PANEL STATUSU */}
            <div className="w-[360px] shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar animate-slide-left pb-20">

              {/* AKTUALNY STATUS */}
              <div className="bg-slate-900/60 rounded-[28px] border border-white/10 backdrop-blur-3xl p-5 flex flex-col gap-3">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Aktualny Fokus</span>
                {activeFocus ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-base font-black text-white uppercase italic tracking-tighter">{activeFocus.name}</p>
                        {isReady ? (
                          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">● Aktywny — działa na mecze</span>
                        ) : (
                          <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Aktywny za {5 - daysCount} {5 - daysCount === 1 ? 'dzień' : 'dni'}</span>
                        )}
                      </div>
                    </div>
                    {!isReady && (
                      <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Postęp</span>
                          <span className="text-[9px] font-black text-white tabular-nums">{daysCount} / 5 dni</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
                          <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500" style={{ width: `${(daysCount / 5) * 100}%` }} />
                        </div>
                      </div>
                    )}
                    {isReady && (
                      <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 text-[9px] font-black text-emerald-300 uppercase tracking-widest">
                        Efekt aktywny — gotowy na następny mecz
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center opacity-30 py-4">
                    <div className="text-4xl mb-2">🎯</div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Brak aktywnego fokusa</p>
                  </div>
                )}
              </div>

              {/* PODGLĄD WYBRANEGO */}
              {previewFocus && (
                <div className="bg-slate-900/60 rounded-[28px] border border-white/10 backdrop-blur-3xl p-5 flex flex-col gap-3 animate-fade-in">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Wybrany Fokus</span>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-base font-black text-white uppercase italic tracking-tighter">{previewFocus.name}</h4>
                  </div>

                  {previewFocus.isRecovery ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-xl p-2.5">
                        <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Regeneracja</span>
                        <span className="text-[10px] font-black text-white">+15%</span>
                      </div>
                      <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5">
                        <span className="text-[9px] font-black text-rose-300 uppercase tracking-widest">Finalizacja (kara losowa)</span>
                        <span className="text-[9px] font-black text-rose-400">do -2.2%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {previewFocus.finishingMultiplierBase > 0 && (
                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
                          <span className="text-[9px] font-black text-emerald-300 uppercase tracking-widest">Finalizacja</span>
                          <span className="text-[9px] font-black text-white">+{(previewFocus.finishingMultiplierBase * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      {previewFocus.shotModifierBase > 0 && (
                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
                          <span className="text-[9px] font-black text-emerald-300 uppercase tracking-widest">Celność strzałów</span>
                          <span className="text-[9px] font-black text-white">+{(previewFocus.shotModifierBase * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      {previewFocus.initiativeModifierBase > 0 && (
                        <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-xl p-2.5">
                          <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Inicjatywa</span>
                          <span className="text-[9px] font-black text-white">+{(previewFocus.initiativeModifierBase * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      {previewFocus.shotResistanceModifierBase > 0 && (
                        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
                          <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest">Defensywa</span>
                          <span className="text-[9px] font-black text-white">+{(previewFocus.shotResistanceModifierBase * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      {previewFocus.goalkeepingMultiplierBase > 0 && (
                        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
                          <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest">Bramkarstwo</span>
                          <span className="text-[9px] font-black text-white">+{(previewFocus.goalkeepingMultiplierBase * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  )}

                  {isChanging && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
                      <p className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Zmiana fokusa zresetuje licznik 5 dni</p>
                    </div>
                  )}

                  <button
                    onClick={handleSaveFocus}
                    className="mt-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black italic uppercase tracking-tighter text-sm transition-all active:translate-y-[2px] border-t border-x border-b border-t-emerald-300/60 border-x-emerald-500/30 border-b-black/60"
                    style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 8px 24px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.2)' }}
                  >
                    ZATWIERDŹ FOKUS 🎯
                  </button>
                </div>
              )}

              {!previewFocus && !activeFocus && (
                <div className="flex flex-col items-center justify-center text-center opacity-20 py-8">
                  <div className="text-5xl mb-4">🎯</div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] italic text-slate-500">Wybierz fokus</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* OBCIĄŻENIE INDYWIDUALNE TAB */}
      {activeTab === 'load' && (
        <div className="relative z-10 flex-1 flex gap-8 p-12 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-20">
            <div className="mb-5 flex items-end justify-between gap-4 px-1">
              <div>
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Obciążenie indywidualne zawodników</span>
                <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-400">
                  Domyślnie każdy zawodnik dziedziczy intensywność drużyny: <span className="text-blue-300">{getIntensityLabel(activeIntensity)}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  if (!userTeamId) return;
                  setPlayers(prev => ({
                    ...prev,
                    [userTeamId]: (prev[userTeamId] || []).map(player => ({ ...player, trainingIntensity: null }))
                  }));
                  setHasIndividualLoadChange(true);
                }}
                className="rounded-xl border-t border-x border-b border-t-white/10 border-x-white/5 border-b-black/50 bg-white/5 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-white/10 hover:text-white active:translate-y-[2px]"
                style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)' }}
              >
                Reset do drużynowego
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-white/5 bg-black/10">
              <table className="w-full min-w-[760px] text-[9px] font-bold border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-left text-slate-500 uppercase tracking-widest">Zawodnik</th>
                    <th className="py-3 px-2 text-center text-slate-500 uppercase tracking-widest">Wiek</th>
                    <th className="py-3 px-2 text-center text-slate-500 uppercase tracking-widest">OVR</th>
                    <th className="py-3 px-4 text-left text-slate-500 uppercase tracking-widest">Obciążenie</th>
                    <th className="py-3 px-4 text-left text-slate-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((player, idx) => {
                    const effectiveIntensity = player.trainingIntensity ?? activeIntensity;
                    const isCustom = !!player.trainingIntensity;
                    const posColor = player.position === 'GK' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : player.position === 'DEF' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                      : player.position === 'MID' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-400';
                    const loadColor = effectiveIntensity === TrainingIntensity.HEAVY
                      ? 'text-rose-300 bg-rose-500/10 border-rose-500/20'
                      : effectiveIntensity === TrainingIntensity.LIGHT
                        ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-blue-300 bg-blue-500/10 border-blue-500/20';
                    return (
                      <tr key={player.id} className={`border-b border-white/5 transition-colors hover:bg-white/5 ${idx % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border mr-2 text-[11px] font-black ${posColor}`}>{player.overallRating}</span>
                          <button
                            onClick={() => viewPlayerDetails(player.id)}
                            className="text-[11px] font-black uppercase text-white hover:text-emerald-400 transition-colors active:translate-y-[2px]"
                          >
                            {player.firstName[0]}. {player.lastName}
                          </button>
                        </td>
                        <td className="py-2.5 px-2 text-center tabular-nums text-slate-300">{player.age}</td>
                        <td className="py-2.5 px-2 text-center tabular-nums text-white">{player.overallRating}</td>
                        <td className="py-2.5 px-4">
                          <select
                            value={player.trainingIntensity || ''}
                            onChange={e => {
                              updatePlayer(userTeamId!, player.id, { trainingIntensity: (e.target.value as TrainingIntensity) || null });
                              setHasIndividualLoadChange(true);
                            }}
                            className="w-full max-w-[260px] bg-slate-800 border border-white/10 text-white text-[9px] font-black rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:border-emerald-500/40 transition-all"
                          >
                            <option value="">Drużynowe ({getIntensityLabel(activeIntensity)})</option>
                            {INTENSITY_OPTIONS.map(option => (
                              <option key={option.id} value={option.id}>{option.shortLabel}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex rounded-lg border px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${loadColor}`}>
                            {isCustom ? getIntensityLabel(effectiveIntensity) : `Drużynowe: ${getIntensityLabel(activeIntensity)}`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="w-[360px] shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar animate-slide-left pb-20">
            <div className="bg-slate-900/60 rounded-[28px] border border-white/10 backdrop-blur-3xl p-5 flex flex-col gap-4">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Podsumowanie</span>
              {INTENSITY_OPTIONS.map(option => {
                const count = sortedPlayers.filter(player => (player.trainingIntensity ?? activeIntensity) === option.id).length;
                const customCount = sortedPlayers.filter(player => player.trainingIntensity === option.id).length;
                const width = sortedPlayers.length > 0 ? (count / sortedPlayers.length) * 100 : 0;
                return (
                  <div key={option.id} className="rounded-2xl border border-white/5 bg-black/25 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-black italic uppercase tracking-tighter text-white">{option.shortLabel}</span>
                      <span className="text-[10px] font-black tabular-nums text-slate-300">{count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full border border-white/10 bg-black/40">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${option.id === TrainingIntensity.HEAVY ? 'bg-rose-500' : option.id === TrainingIntensity.LIGHT ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                      Indywidualnie: {customCount}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER TICKER */}
      <footer className="h-12 bg-black/60 border-t border-white/5 flex items-center px-12 overflow-hidden shrink-0 relative z-20">
         <div className="bg-emerald-600 px-5 py-1.5 rounded-full mr-10 shrink-0 shadow-lg shadow-emerald-900/40">
            <span className="text-[10px] font-black text-white uppercase tracking-widest italic">MONITORING_TRENINGU_NA_ZYWO</span>
         </div>
         <div className="flex-1 whitespace-nowrap overflow-hidden opacity-30">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.6em] animate-ticker">
               ANALIZA WYDOLNOŚCIOWA • KONTROLA OBCIĄŻEŃ • REGENERACJA MIĘŚNIOWA • SZLIFOWANIE TAKTYKI • BRAK ANOMALII W SYSTEMIE • ROZWÓJ MŁODZIEŻY
            </p>
         </div>
      </footer>

      {/* MENU KONTEKSTOWE */}
      {contextMenu && createPortal(
        <PortalScaleWrapper>
        <>
          <div className="fixed inset-0 z-[140]" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-[150] bg-slate-900 border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                const modalWidth = Math.min(1720, window.innerWidth - 32);
                setReportPlayer(contextMenu.player);
                setModalPos({ x: Math.max(16, (window.innerWidth - modalWidth) / 2), y: 12 });
                setContextMenu(null);
              }}
              className="flex items-center gap-3 px-5 py-3 w-full text-left hover:bg-white/10 transition-colors active:translate-y-[2px]"
            >
              <span className="text-xl">🧠</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Raport Asystenta</span>
            </button>
          </div>
        </>
        </PortalScaleWrapper>,
        document.body
      )}

      {/* MODAL RAPORTU INDYWIDUALNEGO */}
      {reportPlayer && cachedReport && createPortal(<PortalScaleWrapper>{(() => {
        const report = cachedReport;
        const posColor = reportPlayer.position === 'GK' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
          : reportPlayer.position === 'DEF' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
          : reportPlayer.position === 'MID' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
          : 'bg-rose-500/20 border-rose-500/40 text-rose-400';
        const effColor = report.positionEffectivenessScore >= 78 ? 'text-emerald-400' : report.positionEffectivenessScore >= 68 ? 'text-amber-400' : 'text-rose-400';
        const homeKit = myClub?.kits?.[0];
        const shirtPrimary = homeKit?.shirt ?? myClub?.colorPrimary ?? myClub?.colorsHex?.[0] ?? '#10b981';
        const shirtSecondary = homeKit?.shirtSecondary ?? myClub?.colorSecondary ?? myClub?.colorsHex?.[1] ?? '#0f172a';
        const shortsColor = homeKit?.shorts ?? shirtSecondary;
        const socksColor = homeKit?.socks ?? shortsColor;
        const teamName = myClub?.name ?? 'Klub';
        const posLabel = reportPlayer.position === 'GK' ? 'Bramkarz' : reportPlayer.position === 'DEF' ? 'Obrońca' : reportPlayer.position === 'MID' ? 'Środkowy pomocnik' : 'Napastnik';
        const assistantGrade = report.positionEffectivenessScore >= 82 ? 'A' : report.positionEffectivenessScore >= 72 ? 'B+' : report.positionEffectivenessScore >= 62 ? 'B' : 'C+';
        const investmentScore = Math.max(1, Math.min(10, Math.round((reportPlayer.attributes.talent + report.positionEffectivenessScore - Math.max(0, reportPlayer.age - 22) * 2) / 18)));
        const latestRatings = (reportPlayer.stats.ratingHistory || []).slice(-6);
        const latestAverage = latestRatings.length > 0 ? latestRatings.reduce((sum, rating) => sum + rating, 0) / latestRatings.length : 0;
        const topStrong = report.strongAttributes.slice(0, 3);
        const topWeak = report.weakAttributes.slice(0, 3);
        const formatMoney = (amount: number): string => {
          if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(amount >= 10_000_000 ? 0 : 1)} mln PLN`;
          if (amount >= 1_000) return `${Math.round(amount / 1_000)} tys. PLN`;
          return `${amount.toLocaleString('pl-PL')} PLN`;
        };
        const currentMarketValue = reportPlayer.marketValue ?? 0;
        const purchaseValue = reportPlayer.purchaseFee && reportPlayer.purchaseFee > 0 ? reportPlayer.purchaseFee : null;
        const valueDeltaPct = purchaseValue ? Math.round(((currentMarketValue - purchaseValue) / purchaseValue) * 100) : null;
        const talentGap = Math.max(0, reportPlayer.attributes.talent - reportPlayer.overallRating);
        const potentialMin = Math.max(reportPlayer.overallRating, Math.min(99, reportPlayer.overallRating + Math.floor(talentGap * 0.45)));
        const potentialMax = Math.max(potentialMin, Math.min(99, reportPlayer.attributes.talent + Math.ceil(talentGap * 0.25)));
        return (
          <div
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
            onClick={() => { if (!dragging) setReportPlayer(null); }}
            onMouseMove={e => { if (!dragging) return; setModalPos({ x: dragging.originX + (e.clientX - dragging.startX), y: dragging.originY + (e.clientY - dragging.startY) }); }}
            onMouseUp={() => setDragging(null)}
            onMouseLeave={() => setDragging(null)}
          >
            <div
              className="fixed flex flex-col w-[1720px] max-w-[calc(100vw-32px)] rounded-[28px] border border-white/15 bg-slate-950/70 backdrop-blur-2xl shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden"
              style={{ left: modalPos.x || 'max(16px, calc(50vw - 860px))', top: modalPos.y || 12, maxHeight: 'calc(100vh - 24px)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* GLOSS */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none z-0" />
              <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none z-0" />
              <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/[0.025] to-transparent rotate-45 pointer-events-none z-0" />
              {/* ZNAK WODNY */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
                <span className="text-[160px] font-black italic uppercase tracking-tighter text-white/[0.025] whitespace-nowrap leading-none">{reportPlayer.firstName} {reportPlayer.lastName}</span>
              </div>

              {/* HEADER */}
              <div
                className="relative z-10 flex items-center justify-between select-none border-b border-white/10 px-6 py-3 shrink-0"
                style={{ cursor: dragging ? 'grabbing' : 'grab' }}
                onMouseDown={e => { e.preventDefault(); setDragging({ startX: e.clientX, startY: e.clientY, originX: modalPos.x, originY: modalPos.y }); }}
              >
                <span className="text-[11px] font-black italic uppercase tracking-tighter text-blue-400/70">Raport indywidualny • Asystent</span>
                <div className="flex items-center gap-4">
                  <button onClick={() => setReportPlayer(null)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black active:translate-y-[2px]">✕</button>
                </div>
              </div>

              {/* NOWY RAPORT SVG */}
              <div className="relative z-10 flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_460px] gap-4 min-h-[820px]">
                  <main className="min-w-0 grid grid-cols-[520px_280px_minmax(0,1fr)] auto-rows-min gap-3">
                    <section className="row-span-2 relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-5">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_88%_14%,rgba(59,130,246,0.12),transparent_32%)]" />
                      <div className="relative grid grid-cols-[150px_1fr] gap-5">
                        <div className="flex min-h-[230px] items-center justify-center [&_path]:[stroke:none]" style={{ filter: (() => { const hex = shirtPrimary.replace('#', ''); const r = parseInt(hex.slice(0, 2), 16); const g = parseInt(hex.slice(2, 4), 16); const b = parseInt(hex.slice(4, 6), 16); const brightness = 0.299 * r + 0.587 * g + 0.114 * b; const shadowColor = brightness < 128 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.5)'; return `drop-shadow(0 10px 22px ${shadowColor})`; })() }}>
                          <KitPreview
                            shirt={shirtPrimary}
                            shirtSecondary={shirtSecondary}
                            shorts={shortsColor}
                            socks={socksColor}
                            pattern={homeKit?.pattern}
                            className="h-[220px] w-[200px]"
                          />
                        </div>
                        <div className="min-w-0 pt-3">
                          <h2 className="text-[32px] font-black italic uppercase tracking-tighter text-white leading-[0.95] break-words">{reportPlayer.firstName}<br />{reportPlayer.lastName}</h2>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-widest ${posColor}`}>{reportPlayer.position}</span>
                            <span className="px-0 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">{reportPlayer.age} lat</span>
                            <span className="px-0 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400">OVR {reportPlayer.overallRating}</span>
                            <span className="px-0 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-300">Talent {reportPlayer.attributes.talent}</span>
                          </div>
                          <div className="mt-5 grid grid-cols-2 gap-3 text-[9px] font-black uppercase tracking-widest text-slate-500">
                            <div>Klub<br /><span className="text-[11px] italic tracking-tighter text-white">{teamName}</span></div>
                            <div>Pozycja<br /><span className="text-[11px] italic tracking-tighter text-white">{posLabel}</span></div>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-4 grid grid-cols-[150px_1fr] gap-5">
                        <div className="flex items-center justify-center">
                          <svg viewBox="0 0 150 150" className="h-[128px] w-[128px]">
                            <circle cx="75" cy="75" r="58" fill="rgba(2,6,23,0.82)" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                            <circle cx="75" cy="75" r="58" fill="none" stroke="rgba(16,185,129,0.95)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${report.positionEffectivenessScore * 3.64} 364`} transform="rotate(-90 75 75)" />
                            <text x="75" y="76" textAnchor="middle" fill="white" fontSize="34" fontWeight="900" fontStyle="italic">{report.positionEffectivenessScore}</text>
                            <text x="75" y="96" textAnchor="middle" fill="rgba(148,163,184,0.9)" fontSize="8" fontWeight="900">POZ. EFEKTYWNOŚCI</text>
                          </svg>
                        </div>
                        <div className="flex flex-col justify-center">
                        {[
                          ['Mecze', reportPlayer.stats.matchesPlayed],
                          ['Minuty', reportPlayer.stats.minutesPlayed],
                          ['Bramki', reportPlayer.stats.goals],
                          ['Asysty', reportPlayer.stats.assists],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between border-b border-white/10 py-2.5 last:border-b-0">
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</div>
                            <div className="text-base font-black text-white tabular-nums">{value}</div>
                          </div>
                        ))}
                        </div>
                      </div>
                    </section>

                    <section className="relative overflow-hidden rounded-2xl border border-emerald-400/15 bg-black/35 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="block text-[9px] font-black uppercase tracking-[0.35em] text-slate-500">Wartość</span>
                          <strong className="mt-1 block text-2xl font-black italic uppercase tracking-tighter text-emerald-300">{formatMoney(currentMarketValue)}</strong>
                          <span className="mt-1 block text-[8px] font-black uppercase tracking-widest text-slate-500">{report.valueForTeam} dla drużyny</span>
                        </div>
                        {valueDeltaPct !== null && (
                          <span className={`rounded-full px-2 py-1 text-[9px] font-black ${valueDeltaPct >= 0 ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>
                            {valueDeltaPct >= 0 ? '+' : ''}{valueDeltaPct}% od zakupu
                          </span>
                        )}
                      </div>
                      {(() => {
                        const samePos = teamPlayers
                          .filter(p => p.position === reportPlayer.position && (p.marketValue ?? 0) > 0)
                          .sort((a, b) => (b.marketValue ?? 0) - (a.marketValue ?? 0));
                        const rank = samePos.findIndex(p => p.id === reportPlayer.id) + 1;
                        const total = samePos.length;
                        if (rank === 0 || total === 0) return null;
                        const posLabel = reportPlayer.position === 'GK' ? 'bramkarzy' : reportPlayer.position === 'DEF' ? 'obrońców' : reportPlayer.position === 'MID' ? 'pomocników' : 'napastników';
                        const windowStart = Math.max(0, Math.min(rank - 3, total - 5));
                        const windowEnd = Math.min(total, windowStart + 5);
                        const visiblePlayers = samePos.slice(windowStart, windowEnd);
                        return (
                          <div className="mt-3 space-y-1">
                            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">Wartość wśród {posLabel}</span>
                            {visiblePlayers.map((p, i) => {
                              const isCurrentPlayer = p.id === reportPlayer.id;
                              return (
                                <div key={p.id} className={`flex items-center justify-between rounded-lg px-2 py-1.5 ${isCurrentPlayer ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-black/20 border border-white/5'}`}>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-black tabular-nums w-4 ${isCurrentPlayer ? 'text-emerald-400' : 'text-slate-500'}`}>{windowStart + i + 1}.</span>
                                    <span className={`text-[10px] font-black italic uppercase tracking-tighter ${isCurrentPlayer ? 'text-white' : 'text-slate-400'}`}>{p.firstName[0]}. {p.lastName}</span>
                                  </div>
                                  <span className={`text-[9px] font-black tabular-nums ${isCurrentPlayer ? 'text-emerald-300' : 'text-slate-500'}`}>{formatMoney(p.marketValue ?? 0)}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                      {purchaseValue && (
                        <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/55 p-3">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                              <span>Kwota zakupu</span>
                              <span>{formatMoney(purchaseValue)}</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-slate-900">
                              <div
                                className={`h-full rounded-full ${currentMarketValue >= purchaseValue ? 'bg-emerald-400' : 'bg-rose-400'}`}
                                style={{ width: `${Math.max(8, Math.min(100, (currentMarketValue / Math.max(currentMarketValue, purchaseValue)) * 100))}%` }}
                              />
                            </div>
                            <p className="mt-2 text-[10px] font-black italic uppercase tracking-tighter text-slate-300">
                              Porównanie tylko do realnie zapisanej kwoty transferu.
                            </p>
                        </div>
                      )}
                    </section>

                    <section className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-black/35 p-4">
                      <span className="block text-[9px] font-black uppercase tracking-[0.35em] text-slate-500">Potencjał</span>
                      <strong className="mt-1 block text-2xl font-black italic uppercase tracking-tighter text-violet-300">{report.developmentPotential}</strong>
                      <span className="mt-1 block text-[8px] font-black uppercase tracking-widest text-slate-500">{potentialMin} - {potentialMax} OVR</span>
                      <svg viewBox="0 0 260 92" className="mt-2 h-[92px] w-full">
                        <rect x="8" y="8" width="244" height="70" rx="12" fill="rgba(15,23,42,0.62)" stroke="rgba(255,255,255,0.08)" />
                        <line x1="28" x2="232" y1="58" y2="58" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
                        <line x1="28" x2={28 + Math.max(20, Math.min(204, (reportPlayer.attributes.talent / 100) * 204))} y1="58" y2="58" stroke="#a78bfa" strokeWidth="8" strokeLinecap="round" />
                        <circle cx={28 + Math.max(20, Math.min(204, (reportPlayer.overallRating / 100) * 204))} cy="58" r="8" fill="#0f172a" stroke="#34d399" strokeWidth="3" />
                        <circle cx={28 + Math.max(20, Math.min(204, (reportPlayer.attributes.talent / 100) * 204))} cy="58" r="8" fill="#a78bfa" stroke="#2e1065" strokeWidth="3" />
                        <text x="28" y="30" fill="#34d399" fontSize="10" fontWeight="900">OVR {reportPlayer.overallRating}</text>
                        <text x="232" y="30" fill="#c4b5fd" fontSize="10" fontWeight="900" textAnchor="end">TAL {reportPlayer.attributes.talent}</text>
                      </svg>
                    </section>

                    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-4">
                      <span className="block text-[9px] font-black uppercase tracking-[0.35em] text-slate-500">Pozycja na boisku</span>
                      <div className="flex h-full min-h-[150px] items-center justify-center">
                        <svg viewBox="0 0 134 96" preserveAspectRatio="none" className="h-36 w-[202px] shrink-0">
                          <rect x="11" y="8" width="112" height="80" fill="rgba(6,19,31,0.9)" stroke="rgba(148,163,184,0.45)" />
                          <line x1="67" x2="67" y1="8" y2="88" stroke="rgba(148,163,184,0.25)" />
                          <circle cx="67" cy="48" r="16" fill="none" stroke="rgba(148,163,184,0.3)" />
                          <rect x="11" y="31" width="22" height="34" fill="none" stroke="rgba(148,163,184,0.28)" />
                          <rect x="101" y="31" width="22" height="34" fill="none" stroke="rgba(148,163,184,0.28)" />
                          {(() => {
                            const posX = (pos: string) => pos === 'GK' ? 22 : pos === 'DEF' ? 42 : pos === 'MID' ? 67 : 98;
                            const posColor = (pos: string) => pos === 'GK' ? '#f59e0b' : pos === 'DEF' ? '#60a5fa' : pos === 'MID' ? '#34d399' : '#fb7185';
                            const px = posX(reportPlayer.position);
                            const pc = posColor(reportPlayer.position);
                            const sx = reportPlayer.secondaryPosition ? posX(reportPlayer.secondaryPosition) : null;
                            const sc = reportPlayer.secondaryPosition ? posColor(reportPlayer.secondaryPosition) : null;
                            return (
                              <>
                                {sx !== null && sc !== null && (
                                  <>
                                    <circle cx={sx} cy={48} r="12" fill={sc} opacity="0.15" />
                                    <circle cx={sx} cy={48} r="5" fill={sc} opacity="0.5" />
                                  </>
                                )}
                                <circle cx={px} cy={48} r="12" fill={pc} opacity="0.35" />
                                <circle cx={px} cy={48} r="5" fill={pc} />
                              </>
                            );
                          })()}
                        </svg>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <span className="block text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Atrybuty</span>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          {topStrong.map(attr => (
                            <div key={attr.attr}>
                              <div className="flex justify-between text-[10px] font-black italic uppercase tracking-tighter text-emerald-300"><span>{attr.label}</span><span>{attr.value}</span></div>
                              <div className="mt-1 h-2 rounded-full bg-slate-900"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${attr.value}%` }} /></div>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-3">
                          {topWeak.map(attr => (
                            <div key={attr.attr}>
                              <div className="flex justify-between text-[10px] font-black italic uppercase tracking-tighter text-rose-300"><span>{attr.label}</span><span>{attr.value}</span></div>
                              <div className="mt-1 h-2 rounded-full bg-slate-900"><div className="h-full rounded-full bg-rose-400" style={{ width: `${attr.value}%` }} /></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="col-span-3 grid grid-cols-[minmax(0,1fr)_430px] gap-3">
                      <div className="flex flex-col gap-3">
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Średnia ocena meczowa</span>
                            <span className="mt-1 block text-[9px] font-black uppercase tracking-widest text-slate-600">Ostatnie {latestRatings.length} występów</span>
                          </div>
                          <div className="text-right">
                            <strong className="block text-4xl font-black italic uppercase tracking-tighter text-emerald-300">{latestAverage > 0 ? latestAverage.toFixed(1) : '-'}</strong>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">średnia</span>
                          </div>
                        </div>
                        <svg viewBox="0 0 700 150" className="mt-3 h-[150px] w-full">
                        <defs>
                          <linearGradient id="formAreaReport" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <rect x="20" y="10" width="660" height="140" rx="14" fill="rgba(15,23,42,0.55)" stroke="rgba(255,255,255,0.08)" />
                        {[4, 6, 8, 10].map((value, i) => (
                          <g key={value}>
                            <line x1="48" x2="665" y1={134 - i * 36} y2={134 - i * 36} stroke="rgba(255,255,255,0.06)" />
                            <text x="38" y={138 - i * 36} textAnchor="end" fill="rgba(148,163,184,0.6)" fontSize="9" fontWeight="900">{value}</text>
                          </g>
                        ))}
                        {(() => {
                          const values = latestRatings;
                          if (values.length < 2) {
                            return (
                              <>
                                <text x="350" y="82" textAnchor="middle" fill="rgba(148,163,184,0.75)" fontSize="18" fontWeight="900" fontStyle="italic">BRAK DANYCH MECZOWYCH</text>
                                <text x="350" y="104" textAnchor="middle" fill="rgba(100,116,139,0.8)" fontSize="10" fontWeight="900">OCENY POJAWIĄ SIĘ PO ROZEGRANYCH MECZACH</text>
                              </>
                            );
                          }
                          const pts = values.map((value, i) => {
                            const x = 58 + (i / (values.length - 1)) * 585;
                            const y = 134 - ((Math.max(4, Math.min(10, value)) - 4) / 6) * 108;
                            return `${x},${y}`;
                          });
                          return (
                            <>
                              <polygon points={`58,143 ${pts.join(' ')} 643,143`} fill="url(#formAreaReport)" />
                              <polyline points={pts.join(' ')} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                              {pts.map((point, i) => {
                                const [x, y] = point.split(',').map(Number);
                                return (
                                  <g key={i}>
                                    <circle cx={x} cy={y} r="5" fill="#22c55e" stroke="#052e16" strokeWidth="3" />
                                    <text x={x} y={y - 12} textAnchor="middle" fill="#bbf7d0" fontSize="10" fontWeight="900">{values[i].toFixed(1)}</text>
                                    <text x={x} y="144" textAnchor="middle" fill="rgba(148,163,184,0.55)" fontSize="8" fontWeight="900">{i + 1}</text>
                                  </g>
                                );
                              })}
                            </>
                          );
                        })()}
                        </svg>
                      </div>
                      <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
                        <span className="block text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Ocena ogólna</span>
                        <p className="mt-3 max-w-5xl text-[14px] font-semibold leading-relaxed tracking-normal text-slate-100">{report.overallAssessment}</p>
                      </section>
                      </div>

                      <div className="flex min-w-0 flex-col gap-3">
                      <div className="rounded-2xl border border-blue-400/15 bg-black/30 p-4">
                        <span className="block text-[11px] font-black uppercase tracking-[0.25em] text-blue-300">Diagnoza rozwoju</span>
                        <div className="mt-3 space-y-2">
                          {report.developmentAdvice.items.slice(0, 3).map(item => {
                            const priorityClass = item.priority === 'WYSOKI'
                              ? 'border-rose-400/20 bg-rose-950/20 text-rose-200'
                              : item.priority === 'SREDNI'
                                ? 'border-amber-400/20 bg-amber-950/20 text-amber-200'
                                : 'border-blue-400/20 bg-blue-950/20 text-blue-200';
                            return (
                              <div key={item.title} className={`rounded-xl border p-3 ${priorityClass}`}>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-black uppercase tracking-tight text-white">{item.title}</span>
                                  <span className="shrink-0 text-[7px] font-black uppercase tracking-widest opacity-70">{item.priority}</span>
                                </div>
                                <p className="mt-1.5 text-[12px] font-semibold leading-relaxed tracking-normal text-slate-50">{item.action}</p>
                                <p className="mt-1 text-[11px] font-medium leading-relaxed tracking-normal text-slate-300/90">{item.reason}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <span className="block text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Najbliższe kroki</span>
                        <div className="mt-3 space-y-2">
                          {report.developmentAdvice.items.slice(0, 2).map(item => (
                            <div key={item.title} className="flex gap-3 rounded-xl border border-white/5 bg-slate-950/45 p-3 text-slate-100">
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-[10px] font-black text-emerald-300">✓</span>
                              <span className="text-[12px] font-semibold leading-relaxed tracking-normal">{item.action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      </div>
                    </section>

                  </main>

                  <aside className="space-y-3">
                    <section className="rounded-2xl border border-white/10 bg-black/35 p-5">
                      <span className="block text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Ogólna ocena asystenta</span>
                      <div className="mt-5 flex items-center gap-5">
                        <svg viewBox="0 0 130 130" className="h-28 w-28 shrink-0">
                          <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(15,23,42,0.95)" strokeWidth="14" />
                          <circle cx="65" cy="65" r="52" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${report.positionEffectivenessScore * 3.27} 327`} transform="rotate(-90 65 65)" />
                          <text x="65" y="75" textAnchor="middle" fill="#34d399" fontSize="42" fontWeight="900" fontStyle="italic">{assistantGrade}</text>
                        </svg>
                        <p className="text-[12px] font-normal italic uppercase tracking-tighter leading-relaxed text-slate-200">{report.trainingRecommendationText}</p>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-emerald-400/15 bg-emerald-950/10 p-5">
                      <span className="block text-[10px] font-black uppercase tracking-[0.35em] text-emerald-300">Raport sztabu</span>
                      <div className="mt-4 space-y-3">
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">Asystent trenera</span>
                          <p className="mt-1 text-[11px] font-normal italic uppercase tracking-tighter leading-relaxed text-slate-200">{report.staffProgressReport.assistantCoach.observations}</p>
                          {report.staffProgressReport.assistantCoach.formAssessment && (
                            <p className="mt-1 text-[11px] font-normal italic uppercase tracking-tighter leading-relaxed text-slate-300">{report.staffProgressReport.assistantCoach.formAssessment}</p>
                          )}
                          <p className="mt-1 text-[11px] font-black italic uppercase tracking-tighter leading-relaxed text-emerald-300">{report.staffProgressReport.assistantCoach.recommendations}</p>
                        </div>
                        <div className="border-t border-white/10 pt-3">
                          <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">Przygotowanie motoryczne</span>
                          <p className="mt-1 text-[11px] font-normal italic uppercase tracking-tighter leading-relaxed text-slate-200">{report.staffProgressReport.fitnessCoach.assessment}</p>
                          <p className="mt-1 text-[11px] font-black italic uppercase tracking-tighter leading-relaxed text-emerald-300">{report.staffProgressReport.fitnessCoach.recommendations}</p>
                        </div>
                        {reportPlayer.position === 'GK' && (
                          <div className="border-t border-white/10 pt-3">
                            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">Trener bramkarzy</span>
                            <p className="mt-1 text-[11px] font-normal italic uppercase tracking-tighter leading-relaxed text-slate-200">{report.staffProgressReport.goalkeeperCoach.observations}</p>
                            {report.staffProgressReport.goalkeeperCoach.assessment && (
                              <p className="mt-1 text-[11px] font-normal italic uppercase tracking-tighter leading-relaxed text-slate-300">{report.staffProgressReport.goalkeeperCoach.assessment}</p>
                            )}
                            <p className="mt-1 text-[11px] font-black italic uppercase tracking-tighter leading-relaxed text-amber-300">{report.staffProgressReport.goalkeeperCoach.recommendations}</p>
                          </div>
                        )}
                      </div>
                    </section>

                    <section className="rounded-2xl border border-blue-500/20 bg-blue-950/25 p-5">
                      <span className="block text-[10px] font-black uppercase tracking-[0.35em] text-blue-300">Rekomendacje</span>
                      <div className="mt-4 space-y-3">
                        {[
                          ['Fokus indywidualny', report.recommendedFocusLabel],
                          ['Program treningowy', report.recommendedCycleName],
                          ['Priorytet rozwoju', report.developmentAdvice.items[0]?.title ?? 'Utrzymać plan'],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl border border-white/5 bg-black/25 p-3">
                            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">{label}</span>
                            <strong className="mt-1 block text-[11px] font-black italic uppercase tracking-tighter text-white">{value}</strong>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-2xl border border-amber-400/25 bg-amber-950/25 p-5">
                      <span className="block text-[10px] font-black uppercase tracking-[0.35em] text-amber-300">Opłacalność inwestycji</span>
                      <div className="mt-5 flex items-center gap-5">
                        <svg viewBox="0 0 120 120" className="h-24 w-24 shrink-0">
                          <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(15,23,42,0.95)" strokeWidth="12" />
                          <circle cx="60" cy="60" r="45" fill="none" stroke="#facc15" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${investmentScore * 28.3} 283`} transform="rotate(-90 60 60)" />
                          <text x="60" y="66" textAnchor="middle" fill="#fde047" fontSize="30" fontWeight="900" fontStyle="italic">{investmentScore}</text>
                          <text x="79" y="71" fill="#fde68a" fontSize="12" fontWeight="900">/10</text>
                        </svg>
                        <p className="text-[12px] font-normal italic uppercase tracking-tighter leading-relaxed text-amber-100">{report.investmentText}</p>
                      </div>
                    </section>

                  </aside>
                </div>
              </div>

              {/* BODY — lewy profil + szeroki panel decyzji + analiza */}
              <div className="hidden">

                {/* KOL 1: Statystyki + Słabe/Mocne */}
                <div className="w-[240px] shrink-0 flex flex-col gap-3 min-h-0">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-2">Statystyki Sezonowe</span>
                    <div className="relative grid grid-cols-2 gap-1.5">
                      {[
                        { label: 'Mecze', value: String(reportPlayer.stats.matchesPlayed), color: 'text-white' },
                        { label: 'Minuty', value: String(reportPlayer.stats.minutesPlayed), color: 'text-white' },
                        { label: 'Bramki', value: String(reportPlayer.stats.goals), color: 'text-white' },
                        { label: 'Asysty', value: String(reportPlayer.stats.assists), color: 'text-white' },
                        { label: 'Żółte kartki', value: String(reportPlayer.stats.yellowCards), color: 'text-amber-400' },
                        { label: 'Czerwone kartki', value: String(reportPlayer.stats.redCards), color: 'text-rose-400' },
                        ...(reportPlayer.position === 'GK' ? [{ label: 'Czyste konta', value: String(reportPlayer.stats.cleanSheets), color: 'text-emerald-400' }] : []),
                      ].map((s, i) => (
                        <div key={i} className="bg-black/40 border border-white/[0.08] rounded-xl px-2.5 py-2 flex items-center justify-between gap-1">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-tight">{s.label}</span>
                          <span className={`text-[12px] font-black tabular-nums ${s.color}`}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {(() => {
                    const sc = reportPlayer.stats.seasonalChanges ?? {};
                    const dropping = Object.entries(sc).filter(([, v]) => v < 0).sort(([, a], [, b]) => a - b);
                    const rising = Object.entries(sc).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a);
                    if (dropping.length === 0 && rising.length === 0) return null;
                    return (
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                        <span className="relative text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-2">Trend Sezonu</span>
                        <div className="relative flex flex-col gap-0.5">
                          {dropping.map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between rounded-lg bg-rose-950/40 border border-rose-500/20 px-2 py-1">
                              <span className="text-[10px] font-black italic uppercase tracking-tighter text-rose-300">{ATTR_LABELS[key] ?? key}</span>
                              <span className="text-[11px] font-black tabular-nums text-rose-400">▼ {val}</span>
                            </div>
                          ))}
                          {rising.map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between rounded-lg bg-emerald-950/40 border border-emerald-500/20 px-2 py-1">
                              <span className="text-[10px] font-black italic uppercase tracking-tighter text-emerald-300">{ATTR_LABELS[key] ?? key}</span>
                              <span className="text-[11px] font-black tabular-nums text-emerald-400">▲ +{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-950/30 p-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[9px] font-black text-rose-400 uppercase tracking-[0.4em] block mb-1.5">Słabe Strony</span>
                    <div className="relative flex flex-col gap-1">
                      {report.weakAttributes.length > 0 ? report.weakAttributes.map(a => (
                        <div key={a.attr} className="flex items-center justify-between">
                          <span className="text-[11px] font-black italic uppercase tracking-tighter text-rose-300">{a.label}</span>
                          <span className="text-[12px] font-black tabular-nums text-rose-400">{a.value}</span>
                        </div>
                      )) : <p className="text-[9px] font-normal italic uppercase tracking-tighter text-rose-300/50">Brak wyraźnych słabości</p>}
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[9px] font-black text-emerald-400 uppercase tracking-[0.4em] block mb-1.5">Mocne Strony</span>
                    <div className="relative flex flex-col gap-1">
                      {report.strongAttributes.length > 0 ? report.strongAttributes.map(a => (
                        <div key={a.attr} className="flex items-center justify-between">
                          <span className="text-[11px] font-black italic uppercase tracking-tighter text-emerald-300">{a.label}</span>
                          <span className="text-[12px] font-black tabular-nums text-emerald-400">{a.value}</span>
                        </div>
                      )) : <p className="text-[9px] font-normal italic uppercase tracking-tighter text-emerald-300/50">Brak wyraźnych atutów</p>}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-4">
                  <div className="order-1 grid grid-cols-2 gap-4 items-start">

                {/* KOL 2: Wykres formy + Ocena ogólna + Skuteczność */}
                <div className="min-w-0 flex flex-col gap-3">
                  {(() => {
                    const ratings = (reportPlayer.stats.ratingHistory || []).slice(-15);
                    if (ratings.length < 2) return (
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 flex items-center justify-center h-[108px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest italic">Brak danych meczowych</span>
                      </div>
                    );
                    const W = 500, H = 94;
                    const PAD = { top: 10, right: 10, bottom: 20, left: 28 };
                    const innerW = W - PAD.left - PAD.right;
                    const innerH = H - PAD.top - PAD.bottom;
                    const minVal = Math.max(0, Math.min(...ratings) - 0.5);
                    const maxVal = Math.min(10, Math.max(...ratings) + 0.5);
                    const range = maxVal - minVal || 1;
                    const toX = (i: number) => PAD.left + (i / (ratings.length - 1)) * innerW;
                    const toY = (v: number) => PAD.top + innerH - ((v - minVal) / range) * innerH;
                    const pts = ratings.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
                    const area = `${toX(0)},${PAD.top + innerH} ${pts} ${toX(ratings.length - 1)},${PAD.top + innerH}`;
                    const last = ratings[ratings.length - 1];
                    const lc = last >= 7.5 ? '#10b981' : last >= 6.5 ? '#f59e0b' : '#f43f5e';
                    return (
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                        <div className="relative flex items-center justify-between mb-1">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Forma — Ostatnie Mecze</span>
                          <span className="text-[12px] font-black italic uppercase tracking-tighter" style={{ color: lc }}>{last.toFixed(1)}</span>
                        </div>
                        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="relative block">
                          <defs>
                            <linearGradient id="tvrfg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={lc} stopOpacity="0.25" />
                              <stop offset="100%" stopColor={lc} stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {[0, 0.5, 1].map((t, i) => { const y = PAD.top + innerH * (1 - t); return (<g key={i}><line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" /><text x={PAD.left - 4} y={y + 3} fill="rgba(148,163,184,0.55)" fontSize="8" textAnchor="end" fontWeight="bold">{(minVal + range * t).toFixed(1)}</text></g>); })}
                          <polygon points={area} fill="url(#tvrfg)" />
                          <polyline points={pts} fill="none" stroke={lc} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                          {ratings.map((v, i) => { const pc = v >= 7.5 ? '#10b981' : v >= 6.5 ? '#f59e0b' : '#f43f5e'; return <circle key={i} cx={toX(i)} cy={toY(v)} r={i === ratings.length - 1 ? 4 : 2.5} fill={pc} stroke="#0f172a" strokeWidth="1.5" />; })}
                          <text x={toX(ratings.length - 1)} y={toY(last) - 7} fill={lc} fontSize="9" textAnchor="middle" fontWeight="bold">{last.toFixed(1)}</text>
                          {ratings.map((_, i) => (<text key={i} x={toX(i)} y={H - 1} fill="rgba(148,163,184,0.3)" fontSize="7" textAnchor="middle">{i + 1}</text>))}
                        </svg>
                      </div>
                    );
                  })()}
                  <div className="relative rounded-2xl border border-white/10 bg-black/30 p-4 max-h-[190px] overflow-y-auto custom-scrollbar">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[10px] font-black text-slate-500 uppercase tracking-[0.36em] block mb-2">Ocena Ogólna</span>
                    <p className="relative text-[12px] font-normal italic uppercase tracking-tighter text-white leading-relaxed">{report.overallAssessment}</p>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[10px] font-black text-slate-500 uppercase tracking-[0.36em] block mb-2">Skuteczność na Pozycji</span>
                    <p className="relative text-[12px] font-normal italic uppercase tracking-tighter text-white leading-relaxed">{report.positionEffectivenessText}</p>
                  </div>
                </div>

                {/* KOL 3: Sztab szkoleniowy */}
                <div className="min-w-0 flex flex-col gap-3">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4 flex flex-col gap-2.5">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[10px] font-black text-blue-400 uppercase tracking-[0.36em]">Asystent Trenera</span>
                    {report.staffProgressReport.assistantCoach.hasCoach ? (<>
                      <div className="relative"><span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Obserwacje Treningowe</span><p className="text-[11px] font-normal italic uppercase tracking-tighter text-white leading-relaxed">{report.staffProgressReport.assistantCoach.observations}</p></div>
                      {report.staffProgressReport.assistantCoach.formAssessment && <div className="relative"><span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Ocena Formy</span><p className="text-[11px] font-normal italic uppercase tracking-tighter text-white leading-relaxed">{report.staffProgressReport.assistantCoach.formAssessment}</p></div>}
                      <div className="relative"><span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Zalecenia</span><p className="text-[11px] font-normal italic uppercase tracking-tighter text-emerald-300 leading-relaxed">{report.staffProgressReport.assistantCoach.recommendations}</p></div>
                    </>) : <p className="relative text-[11px] font-normal italic uppercase tracking-tighter text-slate-600">{report.staffProgressReport.assistantCoach.observations}</p>}
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4 flex flex-col gap-2.5">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[10px] font-black text-emerald-400 uppercase tracking-[0.36em]">Trener Przygotowania Motorycznego</span>
                    <div className="relative flex gap-1.5">
                      {report.staffProgressReport.fitnessCoach.physicalMetrics.map((m, i) => (
                        <div key={i} className={`flex-1 flex flex-col items-center gap-0.5 rounded-xl p-2 ${m.change > 0 ? 'border border-emerald-500/20 bg-emerald-950/40' : m.change < 0 ? 'border border-rose-500/20 bg-rose-950/40' : 'border border-white/10 bg-black/30'}`}>
                          <span className="text-[7px] font-black uppercase tracking-widest text-slate-500">{m.label}</span>
                          <span className={`text-[11px] font-black ${m.change > 0 ? 'text-emerald-400' : m.change < 0 ? 'text-rose-400' : 'text-slate-500'}`}>{m.change > 0 ? `▲ +${m.change}` : m.change < 0 ? `▼ ${m.change}` : '—'}</span>
                        </div>
                      ))}
                    </div>
                    {report.staffProgressReport.fitnessCoach.hasCoach ? (<>
                      <div className="relative"><span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Ocena</span><p className="text-[11px] font-normal italic uppercase tracking-tighter text-white leading-relaxed">{report.staffProgressReport.fitnessCoach.assessment}</p></div>
                      <div className="relative"><span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Zalecenia</span><p className="text-[11px] font-normal italic uppercase tracking-tighter text-emerald-300 leading-relaxed">{report.staffProgressReport.fitnessCoach.recommendations}</p></div>
                    </>) : <p className="relative text-[11px] font-normal italic uppercase tracking-tighter text-slate-600">{report.staffProgressReport.fitnessCoach.assessment}</p>}
                  </div>
                  {reportPlayer.position === 'GK' && (
                    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4 flex flex-col gap-2.5">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
                      <span className="relative text-[10px] font-black text-amber-400 uppercase tracking-[0.36em]">Trener Bramkarzy</span>
                      {report.staffProgressReport.goalkeeperCoach.hasCoach ? (<>
                        <div className="relative"><span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Obserwacje Treningowe</span><p className="text-[11px] font-normal italic uppercase tracking-tighter text-white leading-relaxed">{report.staffProgressReport.goalkeeperCoach.observations}</p></div>
                        {report.staffProgressReport.goalkeeperCoach.assessment && <div className="relative"><span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Ocena</span><p className="text-[11px] font-normal italic uppercase tracking-tighter text-white leading-relaxed">{report.staffProgressReport.goalkeeperCoach.assessment}</p></div>}
                        <div className="relative"><span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Zalecenia</span><p className="text-[11px] font-normal italic uppercase tracking-tighter text-amber-300 leading-relaxed">{report.staffProgressReport.goalkeeperCoach.recommendations}</p></div>
                      </>) : <p className="relative text-[11px] font-normal italic uppercase tracking-tighter text-slate-600">{report.staffProgressReport.goalkeeperCoach.observations}</p>}
                    </div>
                  )}
                </div>

                  </div>

                {/* PANEL DECYZYJNY: co robić teraz + rekomendacje */}
                <div className="order-0 flex flex-col gap-3 min-h-0">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Wartość', value: report.valueForTeam, color: report.valueColor },
                      { label: 'Potencjał', value: report.developmentPotential, color: report.potentialColor },
                      { label: 'Poz. Eff.', value: String(report.positionEffectivenessScore), color: effColor },
                    ].map((kpi, i) => (
                      <div key={i} className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-2.5 flex flex-col items-center gap-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none" />
                        <span className="relative text-center text-[8px] font-black uppercase tracking-widest leading-tight text-slate-500">{kpi.label}</span>
                        <span className={`relative text-[12px] font-black italic uppercase tracking-tighter ${kpi.color}`}>{kpi.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(340px,0.85fr)] gap-3 items-start">
                  <div className="relative rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4 flex flex-col gap-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[10px] font-black text-emerald-400 uppercase tracking-[0.36em]">Co zrobić teraz</span>
                    <p className="relative text-[12px] font-normal italic uppercase tracking-tighter text-emerald-100/80 leading-relaxed">{report.developmentAdvice.summary}</p>
                    <div className="relative flex flex-col gap-2">
                      {report.developmentAdvice.items.map((item, i) => {
                        const priorityClass = item.priority === 'WYSOKI'
                          ? 'border-rose-500/25 bg-rose-950/35 text-rose-300'
                          : item.priority === 'SREDNI'
                            ? 'border-amber-500/25 bg-amber-950/30 text-amber-300'
                            : 'border-blue-500/20 bg-blue-950/25 text-blue-300';
                        return (
                          <div key={`${item.title}-${i}`} className={`rounded-xl border px-3 py-2.5 ${priorityClass}`}>
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="min-w-0 text-[11px] font-black italic uppercase tracking-tighter text-white leading-snug">{item.title}</span>
                              <span className="shrink-0 text-[7px] font-black uppercase tracking-widest opacity-80">{item.priority}</span>
                            </div>
                            <p className="text-[12px] font-black italic uppercase tracking-tighter leading-snug">{item.action}</p>
                            <p className="mt-1.5 text-[11px] font-normal italic uppercase tracking-tighter leading-snug text-slate-300/85">{item.reason}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-col gap-3">
                  <div className="relative rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[10px] font-black text-slate-500 uppercase tracking-[0.36em] block mb-2">Ocena Asystenta</span>
                    <p className="relative text-[12px] font-normal italic uppercase tracking-tighter text-white leading-relaxed">{report.trainingRecommendationText}</p>
                  </div>
                  <div className="relative rounded-2xl border border-blue-500/20 bg-blue-950/30 p-4 flex flex-col gap-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[10px] font-black text-blue-400 uppercase tracking-[0.36em]">Rekomendacje</span>
                    <div className="relative bg-black/30 rounded-xl p-2.5 flex flex-col gap-1">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Fokus Indywidualny</span>
                      <span className="text-[12px] font-black italic uppercase tracking-tighter text-blue-300">{report.recommendedFocusLabel}</span>
                    </div>
                    <div className="relative bg-black/30 rounded-xl p-2.5 flex flex-col gap-1">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Program Drużynowy</span>
                      <span className="text-[12px] font-black italic uppercase tracking-tighter text-blue-300">{report.recommendedCycleName}</span>
                    </div>
                  </div>
                  <div className="relative rounded-2xl border border-amber-500/20 bg-amber-950/30 p-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
                    <span className="relative text-[10px] font-black text-amber-400 uppercase tracking-[0.36em] block mb-2">Opłacalność Inwestycji</span>
                    <p className="relative text-[12px] font-normal italic uppercase tracking-tighter text-amber-200 leading-relaxed">{report.investmentText}</p>
                  </div>
                  </div>
                  </div>
                </div>

                </div>

              </div>
            </div>
          </div>
        );
      })()}</PortalScaleWrapper>, document.body)}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        
        @keyframes fade-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes slide-left { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-left { animation: slide-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.02); opacity: 1; } }
        .animate-pulse-slow { animation: pulse-slow 8s infinite ease-in-out; }

        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker { animation: ticker 40s linear infinite; }
      `}</style>
    </div>
  );
};
