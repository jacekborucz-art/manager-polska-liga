import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../context/GameContext';
import { ViewState, Player, StaffRole } from '../../types';
import { TRAINING_CYCLES } from '../../data/training_definitions_pl';
import { TrainingAssistantService, generatePlayerReport } from '../../services/TrainingAssistantService';
import { MATCH_PREP_FOCUSES } from '../../data/match_prep_focuses_pl';
import { getFocusDaysCount, isFocusReady } from '../../services/MatchPrepFocusService';

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
  const [selectedId, setSelectedId] = useState<string | null>(activeTrainingId);
  const [hoveredAttribute, setHoveredAttribute] = useState<{ label: string; x: number; y: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; player: Player } | null>(null);
  const [reportPlayer, setReportPlayer] = useState<Player | null>(null);
  const [modalPos, setModalPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'training' | 'focus'>('training');
  const [selectedFocusId, setSelectedFocusId] = useState<string | null>(null);
  const teamPlayers = (userTeamId ? players[userTeamId] : []) || [];
  const allLeaguePlayers = useMemo(() => Object.values(players).flat(), [players]);
  const cachedReport = useMemo(() => reportPlayer ? generatePlayerReport(reportPlayer, teamPlayers, allLeaguePlayers) : null, [reportPlayer]);

  const myClub = clubs.find(c => c.id === userTeamId);
  const hasAssistant = (myClub?.staffIds ?? [])
    .some(id => staffMembers[id]?.role === StaffRole.ASSISTANT_COACH);
  const currentCycle = TRAINING_CYCLES.find(c => c.id === selectedId) || null;
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
    leadership: 'Przywództwo', mentality: 'Mentalność', workRate: 'Pracowitość'
  };
  const TRAINABLE_ATTRS = Object.entries(ATTR_LABELS);

  const ATTR_ABBR: Record<string, string> = {
    strength: 'SIŁ', stamina: 'KON', pace: 'SZY', defending: 'OBR',
    heading: 'GŁW', positioning: 'UST', goalkeeping: 'BRA', passing: 'POD',
    technique: 'TEC', vision: 'WIZ', dribbling: 'DRY', crossing: 'DŚR',
    attacking: 'ATK', finishing: 'WYK', freeKicks: 'RWL', corners: 'RŻN',
    penalties: 'KRN', aggression: 'AGR', leadership: 'PRZ', mentality: 'MEN', workRate: 'PRC'
  };
  const COLS = Object.keys(ATTR_ABBR);

  const handleSave = () => {
    if (selectedId) {
      setActiveTrainingId(selectedId);
      navigateTo(ViewState.DASHBOARD);
    }
  };

  const handleAskAssistant = () => {
    if (!userTeamId || teamPlayers.length === 0) return;

    const assistants = (myClub?.staffIds ?? [])
      .map(id => staffMembers[id])
      .filter(s => !!s && s.role === StaffRole.ASSISTANT_COACH);
    const assistantIndividualWork = assistants.length > 0
      ? assistants.reduce((sum, s) => sum + (s.attributes.individualWork ?? 10), 0) / assistants.length
      : 10;

    const plan = TrainingAssistantService.buildPlan(teamPlayers, Math.random, assistantIndividualWork);
    const selectedCycle = TRAINING_CYCLES.find(cycle => cycle.id === plan.cycleId);

    setSelectedId(plan.cycleId);
    setActiveTrainingId(plan.cycleId);
    setPlayers(prev => ({
      ...prev,
      [userTeamId]: (prev[userTeamId] || []).map(player => ({
        ...player,
        trainingFocus: plan.playerFocuses[player.id] ?? player.trainingFocus ?? null
      }))
    }));

    showGameNotification({
      title: 'Asystent ustawil trening',
      message: `Wybral program ${selectedCycle?.name || 'treningowy'} i przydzielil indywidualny fokus dla ${teamPlayers.length} zawodnikow.`,
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
    setSelectedFocusId(null);
  };

  const tooltipStyle = hoveredAttribute
    ? {
        left: `${hoveredAttribute.x + 14}px`,
        top: `${Math.max(hoveredAttribute.y - 10, 18)}px`,
        transform: 'translateY(-100%)'
      }
    : undefined;

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
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            >
              &larr; Anuluj zmiany
            </button>
            <button
              onClick={handleAskAssistant}
              disabled={teamPlayers.length === 0 || !hasAssistant}
              className="px-8 py-4 rounded-2xl bg-blue-600/85 hover:bg-blue-500 disabled:opacity-20 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_18px_40px_rgba(37,99,235,0.35)] border border-blue-300/20"
            >
              POPROS ASYSTENTA
            </button>
            <button 
              onClick={handleSave}
              disabled={!selectedId}
              className="px-14 py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-20 text-white font-black italic uppercase tracking-tighter text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(16,185,129,0.4)] border-b-4 border-emerald-900"
            >
              ZATWIERDŹ PROGRAM 🏁
            </button>
         </div>
      </header>

      {/* ZAKŁADKI */}
      <div className="relative z-20 flex items-center gap-2 px-12 pt-4 border-b border-white/5 shrink-0">
        <button
          onClick={() => setActiveTab('training')}
          className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'training' ? 'text-emerald-400 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
        >
          Program Treningowy
        </button>
        <button
          onClick={() => setActiveTab('focus')}
          className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'focus' ? 'text-emerald-400 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
        >
          Fokus Tygodniowy
          {myClub?.matchPrepFocusId && (
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[7px] font-black ${isFocusReady(myClub, currentDate.toISOString().split('T')[0]) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
              {isFocusReady(myClub, currentDate.toISOString().split('T')[0]) ? 'AKTYWNY' : `${getFocusDaysCount(myClub, currentDate.toISOString().split('T')[0])}/5`}
            </span>
          )}
        </button>
      </div>

      {/* GŁÓWNA PRZESTRZEŃ ROBOCZA */}
      {activeTab === 'training' && (
      <div className="relative z-10 flex-1 flex gap-8 p-12 min-h-0 overflow-hidden">

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
                        {COLS.map(k => (
                          <th key={k} className="py-2 px-2 text-center text-slate-500 uppercase tracking-widest font-black">{ATTR_ABBR[k]}</th>
                        ))}
                        <th className="py-2 px-3 text-center text-slate-500 uppercase tracking-widest sticky right-0 bg-slate-950 z-10">FOKUS</th>
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
                          <tr key={player.id} onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, player }); }} className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-context-menu ${idx % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                            <td className={`py-2 px-3 sticky left-0 z-10 whitespace-nowrap ${stickyBg}`}>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border mr-2 ${posColor}`}>{player.position}</span>
                              <button onClick={() => viewPlayerDetails(player.id)} className="font-black text-white hover:text-emerald-400 transition-colors cursor-pointer">{player.firstName[0]}. {player.lastName}</button>
                              <span className="ml-2 text-slate-500 font-bold">OVR {player.overallRating}</span>
                            </td>
                            {COLS.map(k => {
                              const val = (player.attributes[k as keyof typeof player.attributes] as number) ?? 0;
                              const color = val >= 85 ? 'text-emerald-400' : val >= 75 ? 'text-white' : val >= 60 ? 'text-amber-400' : 'text-rose-400';
                              const attributeLabel = ATTR_LABELS[k] || k;
                              return (
                                <td
                                  key={k}
                                  title={attributeLabel}
                                  className={`py-2 px-2 text-center tabular-nums ${color}`}
                                  onMouseEnter={e => setHoveredAttribute({ label: attributeLabel, x: e.clientX, y: e.clientY })}
                                  onMouseMove={e => setHoveredAttribute({ label: attributeLabel, x: e.clientX, y: e.clientY })}
                                  onMouseLeave={() => setHoveredAttribute(null)}
                                >
                                  {val}
                                </td>
                              );
                            })}
                            <td className={`py-2 px-2 sticky right-0 z-10 ${stickyBg}`}>
                              <select
                                value={player.trainingFocus || ''}
                                onChange={e => updatePlayer(userTeamId!, player.id, { trainingFocus: (e.target.value as any) || null })}
                                className="bg-slate-800 border border-white/10 text-white text-[9px] font-black rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-emerald-500/40 transition-all"
                              >
                                <option value="">— Brak —</option>
                                {TRAINABLE_ATTRS.map(([key, label]) => (
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
        <div className="w-[680px] shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar animate-slide-left pb-20">

           {/* WYKRES PROGRESU TRENINGOWEGO */}
           {trainingProgressHistory.length >= 2 && (() => {
             const data = trainingProgressHistory;
             const W = 620;
             const H = 80;
             const PAD = { top: 10, right: 12, bottom: 18, left: 28 };
             const innerW = W - PAD.left - PAD.right;
             const innerH = H - PAD.top - PAD.bottom;
             const minVal = Math.min(...data) - 1;
             const maxVal = Math.max(...data) + 1;
             const range = maxVal - minVal || 1;
             const toX = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
             const toY = (v: number) => PAD.top + innerH - ((v - minVal) / range) * innerH;
             const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
             const areaPoints = `${toX(0)},${PAD.top + innerH} ${points} ${toX(data.length - 1)},${PAD.top + innerH}`;
             const last = data[data.length - 1];
             const prev = data[data.length - 2];
             const diff = last - prev;
             const trendColor = diff > 0 ? '#10b981' : diff < 0 ? '#f43f5e' : '#94a3b8';
             const trendArrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '—';
             const trendLabel = diff > 0 ? `+${diff}` : `${diff}`;
             return (
               <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-3 backdrop-blur-sm">
                 <div className="flex items-center justify-between mb-2 px-1">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Progres Treningowy Drużyny</span>
                   <div className="flex items-center gap-2">
                     <span className="text-[9px] font-black uppercase" style={{ color: trendColor }}>{trendArrow} {trendLabel}</span>
                     <span className="text-[11px] font-black text-white tabular-nums">OVR {last}</span>
                   </div>
                 </div>
                 <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
                   <defs>
                     <linearGradient id="tpg" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                       <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                     </linearGradient>
                   </defs>
                   {/* Linie siatki poziomej */}
                   {[0, 0.5, 1].map((t, i) => {
                     const y = PAD.top + innerH * (1 - t);
                     const val = Math.round(minVal + range * t);
                     return (
                       <g key={i}>
                         <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                         <text x={PAD.left - 4} y={y + 3.5} fill="rgba(148,163,184,0.6)" fontSize="7" textAnchor="end" fontWeight="bold">{val}</text>
                       </g>
                     );
                   })}
                   {/* Gradient wypełnienia */}
                   <polygon points={areaPoints} fill="url(#tpg)" />
                   {/* Linia wykresu */}
                   <polyline points={points} fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
                   {/* Punkty */}
                   {data.map((v, i) => (
                     <circle key={i} cx={toX(i)} cy={toY(v)} r={i === data.length - 1 ? 3.5 : 2} fill={i === data.length - 1 ? '#10b981' : '#1e293b'} stroke="#10b981" strokeWidth="1.5" />
                   ))}
                   {/* Etykieta ostatniego punktu */}
                   <text x={toX(data.length - 1)} y={toY(last) - 6} fill="#10b981" fontSize="8" textAnchor="middle" fontWeight="bold">{last}</text>
                   {/* Etykiety osi X */}
                   {data.length <= 10
                     ? data.map((_, i) => (
                         <text key={i} x={toX(i)} y={H - 3} fill="rgba(148,163,184,0.45)" fontSize="6.5" textAnchor="middle">T{i + 1}</text>
                       ))
                     : [0, Math.floor((data.length - 1) / 2), data.length - 1].map(i => (
                         <text key={i} x={toX(i)} y={H - 3} fill="rgba(148,163,184,0.45)" fontSize="6.5" textAnchor="middle">T{i + 1}</text>
                       ))
                   }
                 </svg>
               </div>
             );
           })()}

           {/* SIATKA PROGRAMÓW TRENINGOWYCH */}
           <div className="grid grid-cols-2 gap-3">
              {TRAINING_CYCLES.map(cycle => {
                const isActive = activeTrainingId === cycle.id;
                const isSelected = selectedId === cycle.id;
                return (
                  <button
                    key={cycle.id}
                    onClick={() => setSelectedId(cycle.id)}
                    className={`group relative p-3 rounded-2xl border transition-all duration-300 text-left overflow-hidden
                      ${isSelected
                        ? 'bg-emerald-600/15 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                        : 'bg-slate-900/40 border-white/5 hover:border-white/20 hover:bg-slate-900/60'}
                    `}
                  >
                    {/* OPIS NA HOVER */}
                    <div className="absolute inset-0 rounded-2xl p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20 pointer-events-none" style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <p className="text-[10px] text-white font-medium leading-relaxed text-center italic">"{cycle.description}"</p>
                    </div>

                    <div className="relative z-10 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110
                        ${isSelected ? 'bg-emerald-500 border border-emerald-300 text-white' : 'bg-slate-800 border border-white/10'}`}>
                        {cycle.icon}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <h4 className="text-sm font-black text-white uppercase italic tracking-tighter truncate">{cycle.name}</h4>
                        {isActive && (
                          <span className="bg-blue-600/20 text-blue-400 text-[7px] px-2 py-0.5 rounded-full border border-blue-500/30 font-black tracking-widest uppercase shrink-0">OBECNY</span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />
                    )}
                  </button>
                );
              })}
           </div>

           {/* PANEL DIAGNOSTYKI */}
           <div className="bg-slate-900/60 rounded-[40px] border border-white/10 backdrop-blur-3xl p-5 flex flex-col gap-4 shadow-[0_50px_100px_rgba(0,0,0,0.7)]">

              {/* PANEL INTENSYWNOŚCI */}
              <div className="bg-black/40 p-3 rounded-[20px] border border-white/5">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 block px-1">Intensywność</span>
                 <div className="flex gap-2">
                    {[
                      { id: 'LIGHT', label: 'LEKKI', color: 'border-emerald-500/50 text-emerald-400', active: 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' },
                      { id: 'NORMAL', label: 'NORMALNY', color: 'border-blue-500/50 text-blue-400', active: 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' },
                      { id: 'HEAVY', label: 'CIĘŻKI', color: 'border-rose-500/50 text-rose-400', active: 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]' }
                    ].map(btn => (
                       <button
                          key={btn.id}
                          onClick={() => setTrainingIntensity(btn.id as any)}
                          className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all border ${activeIntensity === btn.id ? btn.active : `bg-white/5 ${btn.color} hover:bg-white/10`}`}
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
                      className={`group relative p-4 rounded-2xl border transition-all duration-300 text-left overflow-hidden
                        ${isSelected ? 'bg-emerald-600/15 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                        : isCurrent ? 'bg-blue-600/10 border-blue-500/30'
                        : 'bg-slate-900/40 border-white/5 hover:border-white/20 hover:bg-slate-900/60'}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110
                          ${isSelected ? 'bg-emerald-500 border border-emerald-300'
                          : isCurrent ? 'bg-blue-500/30 border border-blue-500/40'
                          : 'bg-slate-800 border border-white/10'}`}>
                          {focus.icon}
                        </div>
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
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-3xl">{activeFocus.icon}</div>
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
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl">{previewFocus.icon}</div>
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
                    className="mt-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black italic uppercase tracking-tighter text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(16,185,129,0.4)] border-b-4 border-emerald-900"
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
        <>
          <div className="fixed inset-0 z-[140]" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-[150] bg-slate-900 border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => { setReportPlayer(contextMenu.player); setModalPos({ x: Math.max(0, window.innerWidth / 2 - 610), y: Math.max(20, window.innerHeight / 2 - 320) }); setContextMenu(null); }}
              className="flex items-center gap-3 px-5 py-3 w-full text-left hover:bg-white/10 transition-colors"
            >
              <span className="text-xl">🧠</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Raport Asystenta</span>
            </button>
          </div>
        </>,
        document.body
      )}

      {/* MODAL RAPORTU INDYWIDUALNEGO */}
      {reportPlayer && cachedReport && createPortal((() => {
        const report = cachedReport;
        const posColor = reportPlayer.position === 'GK' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
          : reportPlayer.position === 'DEF' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
          : reportPlayer.position === 'MID' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
          : 'bg-rose-500/20 border-rose-500/40 text-rose-400';
        const effColor = report.positionEffectivenessScore >= 78 ? 'text-emerald-400' : report.positionEffectivenessScore >= 68 ? 'text-amber-400' : 'text-rose-400';
        return (
          <div
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm"
            onClick={() => { if (!dragging) setReportPlayer(null); }}
            onMouseMove={e => { if (!dragging) return; setModalPos({ x: dragging.originX + (e.clientX - dragging.startX), y: dragging.originY + (e.clientY - dragging.startY) }); }}
            onMouseUp={() => setDragging(null)}
            onMouseLeave={() => setDragging(null)}
          >
            <div
              className="fixed bg-slate-950 border border-white/10 rounded-[36px] w-[1220px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] p-8 flex flex-col gap-5"
              style={{ left: modalPos.x, top: modalPos.y }}
              onClick={e => e.stopPropagation()}
            >
              {/* NAGŁÓWEK — drag handle */}
              <div
                className="flex items-center justify-between select-none pb-5 border-b border-white/10"
                style={{ cursor: dragging ? 'grabbing' : 'grab' }}
                onMouseDown={e => { e.preventDefault(); setDragging({ startX: e.clientX, startY: e.clientY, originX: modalPos.x, originY: modalPos.y }); }}
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[18px] bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-3xl shrink-0">🧠</div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${posColor}`}>{reportPlayer.position}</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">OVR {reportPlayer.overallRating}</span>
                      <span className="text-slate-700">•</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{reportPlayer.age} lat</span>
                      <span className="text-slate-700">•</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${reportPlayer.attributes.talent >= 75 ? 'text-emerald-400' : reportPlayer.attributes.talent >= 60 ? 'text-amber-400' : 'text-slate-500'}`}>Talent {reportPlayer.attributes.talent}</span>
                    </div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">{reportPlayer.firstName} {reportPlayer.lastName}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-blue-400/50 uppercase tracking-widest">Raport Indywidualny • Asystent</span>
                  <button onClick={() => setReportPlayer(null)} className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black text-lg">✕</button>
                </div>
              </div>

              {/* BODY — 3 kolumny */}
              <div className="flex gap-5">

                {/* KOLUMNA 1 — statystyki + słabe/mocne */}
                <div className="w-[286px] shrink-0 flex flex-col gap-4">
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Statystyki Sezonowe</span>
                    <div className="grid grid-cols-2 gap-2">
                      {(() => {
                        const items = [
                          { label: 'Mecze', value: String(reportPlayer.stats.matchesPlayed), color: 'text-white' },
                          { label: 'Minuty', value: String(reportPlayer.stats.minutesPlayed), color: 'text-white' },
                          { label: 'Bramki', value: String(reportPlayer.stats.goals), color: 'text-white' },
                          { label: 'Asysty', value: String(reportPlayer.stats.assists), color: 'text-white' },
                          { label: 'Żółte kartki', value: String(reportPlayer.stats.yellowCards), color: 'text-amber-400' },
                          { label: 'Czerwone kartki', value: String(reportPlayer.stats.redCards), color: 'text-rose-400' },
                          ...(reportPlayer.position === 'GK' ? [{ label: 'Czyste konta', value: String(reportPlayer.stats.cleanSheets), color: 'text-emerald-400' }] : []),
                        ];
                        return items.map((s, i) => (
                          <div key={i} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight">{s.label}</span>
                            <span className={`text-[13px] font-black tabular-nums ${s.color}`}>{s.value}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  <div className="bg-rose-950/30 border border-rose-500/20 rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em]">Słabe Strony</span>
                    {report.weakAttributes.length > 0 ? report.weakAttributes.map(a => (
                      <div key={a.attr} className="flex items-center justify-between">
                        <span className="text-[12px] font-black italic uppercase tracking-tighter text-rose-300">{a.label}</span>
                        <span className="text-[13px] font-black tabular-nums text-rose-400">{a.value}</span>
                      </div>
                    )) : (
                      <p className="text-[10px] font-black italic uppercase tracking-tighter text-rose-300/50">Brak wyraźnych słabości</p>
                    )}
                  </div>

                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Mocne Strony</span>
                    {report.strongAttributes.length > 0 ? report.strongAttributes.map(a => (
                      <div key={a.attr} className="flex items-center justify-between">
                        <span className="text-[12px] font-black italic uppercase tracking-tighter text-emerald-300">{a.label}</span>
                        <span className="text-[13px] font-black tabular-nums text-emerald-400">{a.value}</span>
                      </div>
                    )) : (
                      <p className="text-[10px] font-black italic uppercase tracking-tighter text-emerald-300/50">Brak wyraźnych atutów</p>
                    )}
                  </div>

                </div>

                {/* KOLUMNA 2 — wykres formy + ocena + skuteczność */}
                <div className="flex-1 flex flex-col gap-4">
                  {(() => {
                    const ratings = (reportPlayer.stats.ratingHistory || []).slice(-15);
                    if (ratings.length < 2) return (
                      <div className="bg-slate-900/40 border border-white/10 rounded-2xl flex items-center justify-center h-[117px]">
                        <span className="text-[12px] font-black text-slate-600 uppercase tracking-widest italic">Brak danych meczowych</span>
                      </div>
                    );
                    const W = 546, H = 104;
                    const PAD = { top: 12, right: 12, bottom: 22, left: 32 };
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
                      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Forma — Ostatnie Mecze</span>
                          <span className="text-[13px] font-black italic uppercase tracking-tighter" style={{ color: lc }}>{last.toFixed(1)}</span>
                        </div>
                        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
                          <defs>
                            <linearGradient id="fg2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={lc} stopOpacity="0.25" />
                              <stop offset="100%" stopColor={lc} stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {[0, 0.5, 1].map((t, i) => {
                            const y = PAD.top + innerH * (1 - t);
                            return (
                              <g key={i}>
                                <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <text x={PAD.left - 5} y={y + 4} fill="rgba(148,163,184,0.55)" fontSize="9" textAnchor="end" fontWeight="bold">{(minVal + range * t).toFixed(1)}</text>
                              </g>
                            );
                          })}
                          <polygon points={area} fill="url(#fg2)" />
                          <polyline points={pts} fill="none" stroke={lc} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                          {ratings.map((v, i) => {
                            const pc = v >= 7.5 ? '#10b981' : v >= 6.5 ? '#f59e0b' : '#f43f5e';
                            return <circle key={i} cx={toX(i)} cy={toY(v)} r={i === ratings.length - 1 ? 4.5 : 3} fill={pc} stroke="#0f172a" strokeWidth="1.5" />;
                          })}
                          <text x={toX(ratings.length - 1)} y={toY(last) - 8} fill={lc} fontSize="10" textAnchor="middle" fontWeight="bold">{last.toFixed(1)}</text>
                          {ratings.map((_, i) => (
                            <text key={i} x={toX(i)} y={H - 2} fill="rgba(148,163,184,0.35)" fontSize="8" textAnchor="middle">{i + 1}</text>
                          ))}
                        </svg>
                      </div>
                    );
                  })()}

                  <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex-1">
                    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Ocena Ogólna</span>
                    <p className="text-[13px] font-black italic uppercase tracking-tighter text-white leading-relaxed">{report.overallAssessment}</p>
                  </div>

                  <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Skuteczność na Pozycji</span>
                    <p className="text-[13px] font-black italic uppercase tracking-tighter text-white leading-relaxed">{report.positionEffectivenessText}</p>
                  </div>
                </div>

                {/* KOLUMNA 3 — metryki + rekomendacje + inwestycja */}
                <div className="w-[273px] shrink-0 flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center leading-tight">Wartość</span>
                      <span className={`text-[13px] font-black italic uppercase tracking-tighter ${report.valueColor}`}>{report.valueForTeam}</span>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center leading-tight">Potencjał</span>
                      <span className={`text-[13px] font-black italic uppercase tracking-tighter ${report.potentialColor}`}>{report.developmentPotential}</span>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center leading-tight">Poz. Eff.</span>
                      <span className={`text-[13px] font-black italic uppercase tracking-tighter ${effColor}`}>{report.positionEffectivenessScore}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex-1">
                    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Ocena Asystenta</span>
                    <p className="text-[13px] font-black italic uppercase tracking-tighter text-white leading-relaxed">{report.trainingRecommendationText}</p>
                  </div>

                  <div className="bg-blue-950/30 border border-blue-500/20 rounded-2xl p-4 flex flex-col gap-2.5">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Rekomendacje</span>
                    <div className="bg-black/30 rounded-xl p-2.5 flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Fokus Indywidualny</span>
                      <span className="text-[13px] font-black italic uppercase tracking-tighter text-blue-300">{report.recommendedFocusLabel}</span>
                    </div>
                    <div className="bg-black/30 rounded-xl p-2.5 flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Program Drużynowy</span>
                      <span className="text-[13px] font-black italic uppercase tracking-tighter text-blue-300">{report.recommendedCycleName}</span>
                    </div>
                  </div>

                  <div className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-4 flex-1">
                    <span className="block text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] mb-2">Opłacalność Inwestycji</span>
                    <p className="text-[13px] font-black italic uppercase tracking-tighter text-amber-200 leading-relaxed">{report.investmentText}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })(), document.body)}

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
