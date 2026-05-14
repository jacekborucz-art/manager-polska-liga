import React, { useState, useMemo } from 'react';
import { Lineup, Player, SubstitutionRecord, PlayerPosition, InjurySeverity } from '../../types';
import { TacticRepository } from '../../resources/tactics_db';
import { PlayerPresentationService } from '../../services/PlayerPresentationService';
import { LineupService } from '../../services/LineupService';

const GOALKEEPER_KIT_COLORS = ['#16a34a', '#facc15', '#ec4899', '#dc2626', '#14b8a6', '#d6b48c', '#f97316'];

const POSITION_LABEL: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'BR',
  [PlayerPosition.DEF]: 'OBR',
  [PlayerPosition.MID]: 'POM',
  [PlayerPosition.FWD]: 'NAP',
};

const parseHexColor = (color?: string): [number, number, number] | null => {
  if (!color?.startsWith('#')) return null;
  const hex = color.slice(1);
  if (![3, 6].includes(hex.length)) return null;
  const normalized = hex.length === 3 ? hex.split('').map(char => char + char).join('') : hex;
  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) return null;
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const getColorDistance = (a: string, b: string): number => {
  const first = parseHexColor(a);
  const second = parseHexColor(b);
  if (!first || !second) return 0;
  return Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]);
};

const pickContrastingGoalkeeperKitColor = (fieldKitColors: string[]): string => {
  const validFieldColors = fieldKitColors.filter(color => Boolean(parseHexColor(color)));
  if (!validFieldColors.length) return GOALKEEPER_KIT_COLORS[0];
  return GOALKEEPER_KIT_COLORS.reduce((best, color) => {
    const colorScore = Math.min(...validFieldColors.map(fieldColor => getColorDistance(color, fieldColor)));
    const bestScore = Math.min(...validFieldColors.map(fieldColor => getColorDistance(best, fieldColor)));
    return colorScore > bestScore ? color : best;
  }, GOALKEEPER_KIT_COLORS[0]);
};

const getReadableBadgeTextColor = (colors: string[]): string => {
  const parsed = colors.map(parseHexColor).filter((color): color is [number, number, number] => Boolean(color));
  if (!parsed.length) return '#ffffff';
  const avgLuminance = parsed.reduce((sum, [r, g, b]) => sum + (0.2126 * r + 0.7152 * g + 0.0722 * b), 0) / parsed.length;
  return avgLuminance > 168 ? '#0f172a' : '#ffffff';
};

interface MatchTacticsModalProps {
  isOpen: boolean;
  onClose: (newLineup: Lineup, subsCount: number, subsHistory: SubstitutionRecord[], captainId: string | null, penaltyTakerId: string | null, freeKickTakerId: string | null) => void;
  club: any;
  lineup: Lineup;
  players: Player[];
  fatigue: Record<string, number>;
  subsCount: number;
  subsHistory: SubstitutionRecord[];
  minute: number;
  sentOffIds?: string[];
  injs?: Record<string, InjurySeverity>;
  maxSubs?: number;
  injuryEmergencyMode?: boolean;
}

export const MatchTacticsModal: React.FC<MatchTacticsModalProps> = ({
  isOpen, onClose, club, lineup, players, fatigue, subsCount, subsHistory, minute, sentOffIds = [], injs = {}, maxSubs, injuryEmergencyMode = false
}) => {
  if (!isOpen) return null;

  const [currentLineup, setCurrentLineup] = useState<Lineup>(lineup);
  const [currentSubsCount, setCurrentSubsCount] = useState(subsCount);
  const [currentSubsHistory, setCurrentSubsHistory] = useState<SubstitutionRecord[]>(subsHistory);
  const [selectedSlot, setSelectedSlot] = useState<{ id: string | null, index?: number, loc: 'START' | 'BENCH' } | null>(null);
  const [selectedExpectedRole, setSelectedExpectedRole] = useState<string | null>(null);
  const [localCaptainId, setLocalCaptainId] = useState<string | null>(club?.captainId ?? null);
  const [localPenaltyTakerId, setLocalPenaltyTakerId] = useState<string | null>(club?.penaltyTakerId ?? null);
  const [localFreeKickTakerId, setLocalFreeKickTakerId] = useState<string | null>(club?.freeKickTakerId ?? null);
  const [roleMenu, setRoleMenu] = useState<{ x: number; y: number; playerId: string } | null>(null);
  const [showSubLimitModal, setShowSubLimitModal] = useState(false);
  const [tacticNotice, setTacticNotice] = useState<{ title: string; message: string; tone: 'blue' | 'rose' } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const substitutionLimit = maxSubs ?? 5;

  const showTacticNotice = (title: string, message: string, tone: 'blue' | 'rose' = 'rose') => {
    setTacticNotice({ title, message, tone });
  };

  const handleRoleAssign = (role: 'captain' | 'penalty' | 'freekick') => {
    if (!roleMenu) return;
    if (role === 'captain') setLocalCaptainId(roleMenu.playerId);
    if (role === 'penalty') setLocalPenaltyTakerId(roleMenu.playerId);
    if (role === 'freekick') setLocalFreeKickTakerId(roleMenu.playerId);
    setRoleMenu(null);
  };

  const tactic = TacticRepository.getById(currentLineup.tacticId);
  const fieldKitColors = [club?.colorsHex?.[0], club?.colorsHex?.[1]].filter(Boolean) as string[];
  const gkKitColor = pickContrastingGoalkeeperKitColor(fieldKitColors);
  const substitutedOffIds = new Set(currentSubsHistory.map(s => s.playerOutId));

  const registeredIds = new Set([...currentLineup.startingXI.filter(id => id !== null), ...currentLineup.bench]);
  const registeredPlayers = players.filter(p => registeredIds.has(p.id));

  const mySentOffCount = sentOffIds.filter(id => players.some(p => p.id === id)).length;
  const currentOnPitchCount = currentLineup.startingXI.filter(id => id !== null).length;
  const maxAllowedOnPitch = 11 - mySentOffCount;

  const sortedBench = useMemo(() => {
    const pObjs = currentLineup.bench.map(id => registeredPlayers.find(p => p.id === id)).filter(Boolean) as Player[];
    return PlayerPresentationService.sortPlayers(pObjs).map(p => p.id);
  }, [currentLineup.bench, registeredPlayers]);

  const handleSlotClick = (pId: string | null, loc: 'START' | 'BENCH', index?: number, expectedRole?: string) => {
    if (selectedSlot === null) {
      if (pId && substitutedOffIds.has(pId)) return;
      setSelectedSlot({ id: pId, index, loc });
      if (loc === 'START') {
        const slotPlayer = pId ? registeredPlayers.find(p => p.id === pId) : null;
        setSelectedExpectedRole(slotPlayer ? slotPlayer.position : (expectedRole ?? null));
      } else {
        setSelectedExpectedRole(null);
      }
    } else {
      const isSub = (selectedSlot.loc !== loc);
      
      if (isSub) {
        if (currentSubsCount >= substitutionLimit && !injuryEmergencyMode) {
          setShowSubLimitModal(true);
          setSelectedSlot(null);
          return;
        }

        const playerEnteringId = selectedSlot.loc === 'BENCH' ? selectedSlot.id : pId;
        const playerLeavingId = selectedSlot.loc === 'START' ? selectedSlot.id : pId;

        if (selectedSlot.loc === 'BENCH' && loc === 'START' && pId === null) {
           if (currentOnPitchCount >= maxAllowedOnPitch) {
              showTacticNotice('Pozycja zablokowana', 'Ten ruch nie pasuje do aktualnej liczby zawodników po wykluczeniu.');
              setSelectedSlot(null);
              return;
           }
        }

        if (playerEnteringId && substitutedOffIds.has(playerEnteringId)) {
          showTacticNotice('Zmiana zablokowana', 'Ten zawodnik opuścił już plac gry i nie może wrócić na boisko.');
          setSelectedSlot(null);
          return;
        }

        if (playerEnteringId) {
          setCurrentSubsCount(prev => prev + 1);
          setCurrentSubsHistory(prev => [
            ...prev, 
            { playerOutId: playerLeavingId || 'NONE', playerInId: playerEnteringId, minute }
          ]);
        }
      }

      const newLineup = LineupService.swapPlayers(currentLineup, selectedSlot.id, pId, selectedSlot.index, index);
      setCurrentLineup(newLineup);
      setSelectedSlot(null);
      setSelectedExpectedRole(null);
    }
  };

  const renderTacticalCard = (pId: string | null, expectedRole: string, index?: number, loc: 'START' | 'BENCH' = 'START') => {
    const p = pId ? registeredPlayers.find(player => player.id === pId) : null;
    const isSelected = selectedSlot?.loc === loc && (loc === 'START' ? selectedSlot.index === index : selectedSlot.id === pId);
    const isOut = p && substitutedOffIds.has(p.id);
    const f = p ? (fatigue[p.id] !== undefined ? Math.floor(fatigue[p.id]) : 100) : 0;
   // Blokujemy tylko jeśli próbujemy wejść kimś z ławki (loc !== 'START' u wybranego)
    const isRedBlocked = !p && loc === 'START' && currentOnPitchCount >= maxAllowedOnPitch && selectedSlot?.loc !== 'START';
    // Podświetlenie zawodnika na ławce jeśli pasuje pozycją do zaznaczonego slotu w XI
    const isPositionMatch = loc === 'BENCH' && selectedSlot?.loc === 'START' && selectedExpectedRole !== null && p !== null && !isOut && p.position === selectedExpectedRole;
    
    // Logic: Check position match
    const isNaturalPos = p && p.position === expectedRole;
    const isGkMismatch = p && ((p.position === 'GK' && expectedRole !== 'GK') || (p.position !== 'GK' && expectedRole === 'GK'));
    const isLightInjury = p && !isOut && injs[p.id] === InjurySeverity.LIGHT;

    // Logic: Determine label color based on condition (Stage 1 Pro Addon)
    const conditionLabelClass = p ? (f < 40 ? 'text-red-500' : f < 75 ? 'text-orange-500' : 'text-white') : 'text-white';
    const slotPosColor = expectedRole === 'GK' ? 'bg-yellow-500 border-yellow-300 shadow-yellow-500/20' : expectedRole === 'DEF' ? 'bg-blue-500 border-blue-300 shadow-blue-500/20' : expectedRole === 'MID' ? 'bg-emerald-500 border-emerald-300 shadow-emerald-500/20' : 'bg-red-500 border-red-300 shadow-red-500/20';

    return (
      <div
        onClick={() => { setRoleMenu(null); !isRedBlocked && handleSlotClick(pId, loc, index, expectedRole); }}
        onContextMenu={(e) => { if (loc === 'START' && p && !isOut) { e.preventDefault(); setRoleMenu({ x: e.clientX, y: e.clientY, playerId: p.id }); setSelectedSlot(null); } }}
        className={`relative w-full h-[49px] mb-1 rounded-[24px] transition-all duration-500 group overflow-visible
          ${isSelected 
            ? 'bg-blue-500/20 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)] scale-[1.02] z-30' 
            : isLightInjury
            ? 'bg-orange-500/20 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
            : isPositionMatch
            ? 'bg-emerald-500/10 border-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.2)] scale-[1.01]'
            : 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20'
          }
          ${isOut ? 'opacity-30 grayscale pointer-events-none' : 'cursor-pointer'}
          ${isRedBlocked ? 'bg-black/60 opacity-80 cursor-not-allowed grayscale' : ''}
          ${p && !isNaturalPos && !isGkMismatch && loc === 'START' ? 'bg-amber-500/20 border-amber-500/60 shadow-[0_0_22px_rgba(245,158,11,0.3)]' : ''}
          ${isGkMismatch && loc === 'START' ? 'bg-rose-500/20 border-rose-500/60 shadow-[0_0_22px_rgba(244,63,94,0.3)]' : ''}
          border backdrop-blur-xl
        `}
      >
        {isPositionMatch && (
          <div className="absolute -right-1 -top-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-lg z-20 animate-pulse">✓</div>
        )}
        {/* Wizjer Roli (Role Hub Prefix) */}
        <div className={`absolute -left-6 top-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-2xl flex flex-col items-center justify-center shadow-2xl border-2 z-20 transition-all duration-500
          ${loc === 'BENCH' ? 'hidden' : ''}
          ${!p ? 'bg-slate-900 border-white/10' : (isNaturalPos ? `${slotPosColor} rotate-0` : 'bg-amber-600 border-amber-400 shadow-amber-600/20 -rotate-12')}
          ${isGkMismatch ? 'bg-rose-700 border-rose-400 shadow-rose-600/30' : ''}
        `}>
           <span className="text-[7px] font-black text-white/40 uppercase tracking-tighter leading-none mb-0.5">SLOT</span>
           <span className="text-sm font-black italic text-white leading-none">{expectedRole}</span>
           {p && !isNaturalPos && !isRedBlocked && (
             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[8px] animate-bounce shadow-lg">⚠️</div>
           )}
        </div>

        <div className={`absolute inset-0 ${loc === 'START' ? 'pl-10' : ''} p-4 flex items-center gap-4`}>
          <div className="flex-1 min-w-0 flex items-center justify-between">
            <div className="flex flex-col">
              {p ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black uppercase italic tracking-tighter transition-colors truncate ${conditionLabelClass} ${f >= 75 ? 'group-hover:text-blue-300' : ''}`}>
                      {p.firstName.charAt(0)}. {p.lastName}
                    </span>
                    {isLightInjury && (
                      <span className="text-white text-xs font-black leading-none">✚</span>
                    )}
                    {loc === 'START' && !isNaturalPos && (
                      <span className="text-[7px] bg-red-600 text-white px-1.5 py-0.5 rounded border border-red-500 font-black">ZAWODNIK NA NIE SWOJEJ POZYCJI</span>
                    )}
                    {loc === 'START' && localCaptainId === p.id && (
                      <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[8px] font-black rounded border border-yellow-500/30 leading-none shrink-0">C</span>
                    )}
                    {loc === 'START' && localPenaltyTakerId === p.id && (
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded border border-emerald-500/30 leading-none shrink-0">PK</span>
                    )}
                    {loc === 'START' && localFreeKickTakerId === p.id && (
                      <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] font-black rounded border border-blue-500/30 leading-none shrink-0">FK</span>
                    )}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${PlayerPresentationService.getPositionColorClass(p.position)}`}>
                    {p.position === 'GK' ? 'BRAMKARZ' : p.position === 'DEF' ? 'OBROŃCA' : p.position === 'MID' ? 'POMOCNIK' : 'NAPASTNIK'}
                  </span>
                </>
              ) : (
                <span className={`text-[10px] font-black uppercase italic ${isRedBlocked ? 'text-red-900' : 'text-amber-500 animate-pulse'}`}>
                  {isRedBlocked ? "SYSTEM_ZABLOKOWANY_BRAK" : "PUSTE_GNIAZDO_CZEKA"}
                </span>
              )}
            </div>

            {p && (
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                   <div className="flex gap-0.5 mb-1.5">
                     {[...Array(5)].map((_, i) => (
                       <div 
                         key={i} 
                         className={`w-2 h-3 rounded-sm border border-black/20 ${f > (i * 20) ? PlayerPresentationService.getConditionColorClass(f) : 'bg-black/40'} transition-all duration-700`}
                       />
                     ))}
                   </div>
                   <span className="text-[7px] font-black text-slate-500 tracking-widest">KONDYCJA</span>
                </div>

                <div className="relative">
                   <div className="absolute inset-0 blur-lg opacity-20 bg-blue-400 group-hover:opacity-40 transition-opacity" />
                   <div className="relative w-11 h-11 bg-black/60 rounded-xl border border-white/10 flex flex-col items-center justify-center shadow-inner">
                      <span className={`text-xs font-black italic leading-none ${conditionLabelClass}`}>{p.overallRating}</span>
                      <span className="text-[6px] font-black text-blue-500 uppercase mt-0.5 tracking-tighter">OVR</span>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-hidden animate-fade-in font-sans">
      {/* Background with Depth */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm z-[-2]" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 transition-transform duration-[20s] linear animate-pulse-slow" 
        style={{ backgroundImage: "url('https://i.ibb.co/fdSSvHLz/stadion.jpg')" }} 
      />

      <div className="max-w-[1450px] w-full h-[94vh] bg-slate-900/30 backdrop-blur-3xl rounded-[60px] border border-white/15 shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative">
        
        {/* Dynamic Light Flares */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-500/10 rounded-full blur-[150px] pointer-events-none" />
        
        {/* BROADCAST HEADER */}
        <header className="px-12 py-8 border-b border-white/5 flex justify-between items-center bg-white/5 relative z-10">
           <div className="flex items-center gap-10">
              <div className="w-20 h-20 rounded-2xl flex flex-col overflow-hidden border-2 border-white/20 shadow-2xl transform rotate-6">
                <div style={{ backgroundColor: club?.colorsHex[0] }} className="flex-1" />
                <div style={{ backgroundColor: club?.colorsHex[1] || club?.colorsHex[0] }} className="flex-1" />
              </div>
              <div>
                 <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
                   Centrum <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white text-blue-400">Taktyczne</span>
                 </h1>
                 <div className="flex items-center gap-8 mt-4">
                    <div className="flex items-center gap-4">
                       <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em]">ZMIANY</span>
                       <div className="flex gap-2">
                          {Array.from({ length: maxSubs ?? 5 }, (_, i) => i + 1).map(i => (
                             <div key={i} className={`w-4 h-4 rounded-md border transition-all duration-500 ${i <= currentSubsCount ? 'bg-blue-500 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.6)]' : 'bg-black/40 border-white/10'}`} />
                          ))}
                       </div>
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">{minute}' MINUTA MECZU</p>
                 </div>
              </div>
           </div>
           
           <button
             onClick={() => {
               const hasChanges = currentSubsHistory.length > subsHistory.length || currentLineup.tacticId !== lineup.tacticId;
               if (hasChanges) { setShowConfirmModal(true); } else { onClose(currentLineup, currentSubsCount, currentSubsHistory, localCaptainId, localPenaltyTakerId, localFreeKickTakerId); }
             }}
             className="relative group px-16 py-6 bg-white text-slate-950 font-black italic uppercase tracking-tighter text-xl rounded-[30px] transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)] border-b-4 border-slate-300"
           >
             <span className="relative z-10">ZATWIERDŹ PROTOKÓŁ ⚡</span>
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           </button>
        </header>

        {/* THE CORE ENGINE AREA */}
        <div className="flex-1 overflow-hidden flex flex-col px-10 pt-6 pb-4 gap-3 relative z-10">

           {/* HEADER ROW */}
           <div className="flex gap-10 shrink-0 items-center">
              <div className="w-80 shrink-0">
                 <div className="relative group">
                    <select
                       value={currentLineup.tacticId}
                       onChange={(e) => setCurrentLineup({...currentLineup, tacticId: e.target.value})}
                       className="w-full bg-slate-950/80 border border-white/10 text-white rounded-2xl p-5 text-xs font-black italic uppercase outline-none focus:border-blue-500 transition-all cursor-pointer shadow-2xl appearance-none"
                    >
                       {TacticRepository.getAll().map(t => <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>)}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500 font-black">↓</div>
                 </div>
              </div>
              <div className="flex-1 flex items-center px-10">
                 <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Pierwszy skład</h2>
              </div>
              <div className="w-96 shrink-0 flex items-center px-4">
                 <h2 className="text-2xl font-black italic text-slate-400 uppercase tracking-tighter">Rezerwowi</h2>
              </div>
           </div>

           {/* CONTENT ROW */}
           <div className="flex-1 flex gap-10 overflow-hidden">

              {/* PITCH */}
              <div className="w-80 shrink-0 relative overflow-hidden rounded-lg border border-white/15 bg-[linear-gradient(180deg,rgba(16,185,129,0.38),rgba(6,78,59,0.42))]">
                 <div className="absolute inset-3 border border-white/25" />
                 <div className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-white/25" />
                 <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
                 <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/35" />
                 <div className="absolute left-[22%] right-[22%] top-3 h-[23%] border-x border-b border-white/25" />
                 <div className="absolute bottom-3 left-[22%] right-[22%] h-[23%] border-x border-t border-white/25" />
                 <div className="absolute left-[38%] right-[38%] top-3 h-[8%] border-x border-b border-white/25" />
                 <div className="absolute bottom-3 left-[38%] right-[38%] h-[8%] border-x border-t border-white/25" />
                 <div className="absolute left-1/2 top-[19%] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25" />
                 <div className="absolute bottom-[19%] left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/25" />

                 {tactic.slots.map((slot, idx) => {
                    const pid = currentLineup.startingXI[idx];
                    const p = pid ? registeredPlayers.find(pl => pl.id === pid) : null;
                    const isGK = p?.position === PlayerPosition.GK;
                    const shirt = p ? (isGK ? gkKitColor : (club?.colorsHex?.[0] ?? '#111827')) : null;
                    const shorts = p ? (isGK ? gkKitColor : (club?.colorsHex?.[1] ?? shirt ?? '#111827')) : null;
                    const textColor = shirt ? getReadableBadgeTextColor([shirt]) : '#ffffff';
                    return (
                       <div
                          key={slot.index}
                          className={`absolute flex flex-col h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center ${!p ? 'opacity-45' : ''}`}
                          style={{ left: `${slot.x * 100}%`, top: `${slot.y * 100}%` }}
                       >
                          {p && shirt && shorts ? (
                             <span className="relative block h-11 w-11 drop-shadow-[0_8px_10px_rgba(0,0,0,0.5)]">
                                <span
                                   className="absolute left-1/2 top-0 flex h-7 w-9 -translate-x-1/2 items-center justify-center border border-white/30 text-[8px] font-black italic uppercase tracking-tighter shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_-4px_7px_rgba(0,0,0,0.38),0_2px_0_rgba(0,0,0,0.45)]"
                                   style={{
                                      background: `radial-gradient(circle at 35% 18%, rgba(255,255,255,0.34), transparent 34%), ${shirt}`,
                                      color: textColor,
                                      clipPath: 'polygon(24% 0, 76% 0, 100% 22%, 86% 47%, 78% 36%, 78% 100%, 22% 100%, 22% 36%, 14% 47%, 0 22%)',
                                      textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                                   }}
                                >
                                   {`${p.firstName[0]}${p.lastName[0]}`}
                                </span>
                                <span className="absolute bottom-1 left-1/2 h-3 w-4 -translate-x-1/2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]">
                                   <span className="absolute left-0 top-0 h-1 w-full border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]" style={{ background: shorts }} />
                                   <span className="absolute bottom-0 left-0 h-2 w-[7px] border border-white/20 shadow-[inset_0_-2px_3px_rgba(0,0,0,0.32)]" style={{ background: shorts }} />
                                   <span className="absolute bottom-0 right-0 h-2 w-[7px] border border-white/20 shadow-[inset_0_-2px_3px_rgba(0,0,0,0.32)]" style={{ background: shorts }} />
                                </span>
                                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-black text-white drop-shadow-[0_1px_4px_rgba(0,0,0,1)]">
                                   {`${p.firstName[0]}. ${p.lastName}`}
                                </span>
                             </span>
                          ) : (
                             <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-[8px] font-black italic uppercase tracking-tighter text-white/40 shadow-[0_8px_18px_rgba(0,0,0,0.45)]">
                                {POSITION_LABEL[slot.role]}
                             </span>
                          )}
                       </div>
                    );
                 })}
              </div>

              {/* STARTING XI LIST */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pl-10 pr-4 pb-4">
                 <div className="grid grid-cols-1 gap-1">
                    {currentLineup.startingXI.map((pid, idx) => (
                      <div key={idx} className="animate-blur-in" style={{ animationDelay: `${idx * 0.04}s` }}>
                        {renderTacticalCard(pid, tactic.slots[idx].role, idx, 'START')}
                      </div>
                    ))}
                 </div>
              </div>

              {/* BENCH LIST */}
              <div className="w-96 shrink-0 overflow-y-auto custom-scrollbar pr-2 pb-4">
                 <div className="grid grid-cols-1 gap-1">
                    {sortedBench.map((pid, idx) => (
                      <div key={pid} className="animate-blur-in" style={{ animationDelay: `${idx * 0.04}s` }}>
                        {renderTacticalCard(pid, 'SUB', undefined, 'BENCH')}
                      </div>
                    ))}
                 </div>
              </div>

           </div>
        </div>

        {/* CYBER TICKER */}
        <footer className="h-14 bg-black/60 border-t border-white/5 flex items-center px-12 overflow-hidden shrink-0">
           <div className="bg-blue-600 px-4 py-1 rounded-full mr-8 shrink-0 shadow-lg shadow-blue-900/40">
              <span className="text-[10px] font-black text-white uppercase tracking-widest italic">STRUMIEŃ DANYCH BROADCAST</span>
           </div>
           <div className="flex-1 whitespace-nowrap overflow-hidden opacity-30">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.6em] animate-ticker">
                 WYBIERZ TAKTKĘ • ZMIEŃ ZAWODNIKÓW • SPRAWDŹ KONDYCJĘ • TYLKO ZWYCIĘZTWO • TRANSMISJA NA ŻYWO
              </p>
           </div>
        </footer>
      </div>

      {tacticNotice && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/45 backdrop-blur-[2px] px-4" onClick={() => setTacticNotice(null)}>
          <div
            className={`relative w-full max-w-sm overflow-hidden rounded-[30px] border p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.75)] ${
              tacticNotice.tone === 'blue'
                ? 'border-blue-400/30 bg-slate-950/95 shadow-blue-950/20'
                : 'border-rose-400/30 bg-slate-950/95 shadow-rose-950/20'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`absolute inset-x-0 top-0 h-1 ${tacticNotice.tone === 'blue' ? 'bg-blue-500' : 'bg-rose-500'}`} />
            <div className={`absolute -right-16 -top-16 h-36 w-36 rounded-full blur-3xl ${tacticNotice.tone === 'blue' ? 'bg-blue-500/10' : 'bg-rose-500/10'}`} />
            <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl shadow-[0_0_28px_rgba(244,63,94,0.2)] ${
              tacticNotice.tone === 'blue'
                ? 'border-blue-400/30 bg-blue-500/15 text-blue-100'
                : 'border-rose-400/30 bg-rose-500/15 text-rose-100'
            }`}>
              !
            </div>
            <p className={`mb-2 text-[10px] font-black uppercase tracking-[0.35em] ${tacticNotice.tone === 'blue' ? 'text-blue-400' : 'text-rose-400'}`}>Protokół zmian</p>
            <h3 className="mb-3 text-2xl font-black italic uppercase tracking-tight text-white">{tacticNotice.title}</h3>
            <p className="mb-6 text-sm font-medium leading-relaxed text-slate-300 normal-case">{tacticNotice.message}</p>
            <button
              type="button"
              onClick={() => setTacticNotice(null)}
              className={`w-full rounded-2xl border px-6 py-3 text-[11px] font-black uppercase tracking-[0.25em] transition-all hover:scale-[1.02] active:scale-95 ${
                tacticNotice.tone === 'blue'
                  ? 'border-blue-300/30 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30'
                  : 'border-rose-300/30 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30'
              }`}
            >
              Zamknij
            </button>
          </div>
        </div>
      )}

      {showSubLimitModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/45 backdrop-blur-[2px] px-4" onClick={() => setShowSubLimitModal(false)}>
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-[30px] border border-blue-400/30 bg-slate-950/95 p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.75),0_0_40px_rgba(59,130,246,0.16)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-blue-500" />
            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/15 text-2xl shadow-[0_0_28px_rgba(59,130,246,0.25)]">
              ↯
            </div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-blue-400">Protokół zmian</p>
            <h3 className="mb-6 text-2xl font-black italic uppercase tracking-tight text-white">Wykorzystano wszystkie zmiany</h3>
            <button
              type="button"
              onClick={() => setShowSubLimitModal(false)}
              className="w-full rounded-2xl border border-blue-300/30 bg-blue-500/20 px-6 py-3 text-[11px] font-black uppercase tracking-[0.25em] text-blue-100 shadow-[0_12px_30px_rgba(37,99,235,0.18)] transition-all hover:scale-[1.02] hover:bg-blue-500/30 active:scale-95"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}

      {showConfirmModal && (() => {
        const newSubs = currentSubsHistory.slice(subsHistory.length);
        const tacticChanged = currentLineup.tacticId !== lineup.tacticId;
        const oldTactic = TacticRepository.getById(lineup.tacticId);
        const newTactic = TacticRepository.getById(currentLineup.tacticId);
        return (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/45 backdrop-blur-[2px] px-4" onClick={() => { setShowConfirmModal(false); setCurrentLineup(lineup); setCurrentSubsCount(subsCount); setCurrentSubsHistory(subsHistory); setLocalCaptainId(club?.captainId ?? null); setLocalPenaltyTakerId(club?.penaltyTakerId ?? null); setLocalFreeKickTakerId(club?.freeKickTakerId ?? null); }}>
            <div
              className="relative w-full max-w-sm overflow-hidden rounded-[30px] border border-blue-400/30 bg-slate-950/95 p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.75)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-blue-500" />
              <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-blue-400">Protokół zmian</p>
              <h3 className="mb-4 text-2xl font-black italic uppercase tracking-tight text-white">Potwierdź protokół</h3>
              <div className="mb-6 text-left space-y-2">
                {tacticChanged && (
                  <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5">
                    <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest shrink-0">FORMACJA</span>
                    <span className="text-white text-[11px] font-bold">{oldTactic.name} → {newTactic.name}</span>
                  </div>
                )}
                {newSubs.map((sub, i) => {
                  const pIn = registeredPlayers.find(p => p.id === sub.playerInId);
                  const pOut = registeredPlayers.find(p => p.id === sub.playerOutId);
                  return (
                    <div key={i} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5">
                      <span className="text-emerald-400 text-sm font-black shrink-0">↑</span>
                      <span className="text-white text-[11px] font-bold">{pIn ? `${pIn.firstName.charAt(0)}. ${pIn.lastName}` : '?'}</span>
                      <span className="text-slate-500 text-[10px] shrink-0">/</span>
                      <span className="text-rose-400 text-sm font-black shrink-0">↓</span>
                      <span className="text-white text-[11px] font-bold">{pOut ? `${pOut.firstName.charAt(0)}. ${pOut.lastName}` : '?'}</span>
                      <span className="ml-auto text-slate-500 text-[9px] font-black shrink-0">{sub.minute}'</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowConfirmModal(false); setCurrentLineup(lineup); setCurrentSubsCount(subsCount); setCurrentSubsHistory(subsHistory); setLocalCaptainId(club?.captainId ?? null); setLocalPenaltyTakerId(club?.penaltyTakerId ?? null); setLocalFreeKickTakerId(club?.freeKickTakerId ?? null); }}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] font-black uppercase tracking-[0.25em] text-slate-300 transition-all hover:bg-white/10 active:scale-95"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  onClick={() => { setShowConfirmModal(false); onClose(currentLineup, currentSubsCount, currentSubsHistory, localCaptainId, localPenaltyTakerId, localFreeKickTakerId); }}
                  className="flex-1 rounded-2xl border border-blue-300/30 bg-blue-500/20 px-4 py-3 text-[11px] font-black uppercase tracking-[0.25em] text-blue-100 transition-all hover:bg-blue-500/30 active:scale-95"
                >
                  Potwierdź
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {roleMenu && (
        <>
          <div className="fixed inset-0 z-[1100]" onClick={() => setRoleMenu(null)} />
          <div
            className="fixed z-[1101] bg-slate-900/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden"
            style={{ left: roleMenu.x, top: roleMenu.y }}
          >
            <button onClick={() => handleRoleAssign('captain')} className="flex items-center gap-3 w-full px-5 py-3 hover:bg-yellow-500/10 transition-colors text-left">
              <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[8px] font-black rounded border border-yellow-500/30 leading-none">C</span>
              <span className="text-[11px] font-black text-white uppercase tracking-widest">Kapitan</span>
            </button>
            <div className="h-px bg-white/5 mx-3" />
            <button onClick={() => handleRoleAssign('penalty')} className="flex items-center gap-3 w-full px-5 py-3 hover:bg-emerald-500/10 transition-colors text-left">
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded border border-emerald-500/30 leading-none">PK</span>
              <span className="text-[11px] font-black text-white uppercase tracking-widest">Wykonawca PK</span>
            </button>
            <div className="h-px bg-white/5 mx-3" />
            <button onClick={() => handleRoleAssign('freekick')} className="flex items-center gap-3 w-full px-5 py-3 hover:bg-blue-500/10 transition-colors text-left">
              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] font-black rounded border border-blue-500/30 leading-none">FK</span>
              <span className="text-[11px] font-black text-white uppercase tracking-widest">Wykonawca FK</span>
            </button>
          </div>
        </>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker { animation: ticker 30s linear infinite; }
        
        @keyframes blur-in { 
          from { opacity: 0; filter: blur(8px); transform: translateX(20px); } 
          to { opacity: 1; filter: blur(0); transform: translateX(0); } 
        }
        .animate-blur-in { animation: blur-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.08); }
        }
        .animate-pulse-slow { animation: pulse-slow 10s infinite ease-in-out; }
      `}</style>
    </div>
  );
};
