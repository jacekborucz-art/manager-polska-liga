import React, { useMemo, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState, HealthStatus, InjurySeverity, Player, StaffMember, StaffRole } from '../../types';
import szpitalBg from '../../Graphic/themes/szpital.png';

type TreatmentStatus = {
  label: string;
  description: string;
  barClass: string;
  textClass: string;
  borderClass: string;
};

type PhysioReportModal = {
  playerName: string;
  report: string;
};

const getTreatmentStatus = (player: Player): TreatmentStatus => {
  const injury = player.health.injury;
  const daysRemaining = injury?.daysRemaining ?? 0;
  const isUnavailable = injury?.severity === InjurySeverity.SEVERE || daysRemaining > 2;

  if (daysRemaining <= 0) {
    return {
      label: 'Gotowy do gry',
      description: 'Rekonwalescencja zakończona',
      barClass: 'bg-emerald-400',
      textClass: 'text-emerald-300',
      borderClass: 'border-emerald-400/30 bg-emerald-500/10',
    };
  }

  if (isUnavailable) {
    return {
      label: 'Niezdolny do gry',
      description: 'Zawodnik nadal poza kadrą meczową',
      barClass: 'bg-red-500',
      textClass: 'text-red-300',
      borderClass: 'border-red-500/30 bg-red-500/10',
    };
  }

  return {
    label: 'Może grać z ryzykiem',
    description: 'Krótki występ możliwy, ale grozi odnowieniem urazu',
    barClass: 'bg-orange-400',
    textClass: 'text-orange-300',
    borderClass: 'border-orange-400/30 bg-orange-500/10',
  };
};

const getRecoveryProgress = (player: Player): number => {
  const injury = player.health.injury;
  if (!injury) return 100;

  const totalDays = Math.max(1, injury.totalDays || injury.daysRemaining || 1);
  const daysRemaining = Math.max(0, injury.daysRemaining);
  const progress = ((totalDays - daysRemaining) / totalDays) * 100;

  return Math.max(0, Math.min(100, Math.round(progress)));
};

const assignPhysios = (physios: StaffMember[], playerIndex: number): StaffMember[] => {
  if (physios.length <= 2) return physios;

  return [
    physios[playerIndex % physios.length],
    physios[(playerIndex + 1) % physios.length],
  ];
};

const seededIndex = (seed: string, length: number): number => {
  if (length <= 1) return 0;

  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) % length;
};

const getPhysioQuality = (physios: StaffMember[]): number => {
  if (physios.length === 0) return 0;

  const total = physios.reduce((sum, physio) => (
    sum + (
      (physio.attributes.rehabilitation ?? 10) +
      (physio.attributes.muscleInjuries ?? 10) +
      (physio.attributes.sportsMassage ?? 10) +
      (physio.attributes.manualTherapy ?? 10)
    ) / 4
  ), 0);

  return Math.round(total / physios.length);
};

const getPhysioLevelLabel = (quality: number): string => {
  if (quality >= 17) return 'elitarny';
  if (quality >= 14) return 'bardzo dobry';
  if (quality >= 11) return 'solidny';
  if (quality >= 8) return 'przeciętny';
  if (quality > 0) return 'ograniczony';
  return 'brak pełnej obsady';
};

const getLoadToleranceText = (daysRemaining: number, progress: number): string => {
  if (daysRemaining <= 2 || progress >= 85) return 'dobrze toleruje ćwiczenia funkcjonalne, ale przed pełnym treningiem powinien przejść próbę szybkościową i reakcję po wysiłku';
  if (progress >= 60) return 'może zwiększać obciążenia w kontrolowanych blokach, bez kontaktu i bez maksymalnych sprintów';
  if (progress >= 35) return 'wciąż wymaga pracy nad zakresem ruchu, kontrolą bólu i spokojną odbudową siły';
  return 'pozostaje w fazie ochronnej, z naciskiem na wyciszenie objawów i odzyskanie podstawowej ruchomości';
};

const getQualityPlanText = (quality: number): string => {
  if (quality >= 17) return 'Zaplecze rehabilitacyjne pozwala prowadzić częste testy kontroli bólu, siły i stabilizacji.';
  if (quality >= 14) return 'Sztab może bezpiecznie stopniować bodźce i szybko reagować na pogorszenie objawów.';
  if (quality >= 11) return 'Plan leczenia powinien pozostać standardowy: obserwacja objawów, progres obciążeń i kontrola po treningu.';
  if (quality >= 8) return 'Przy tej obsadzie lepiej unikać agresywnego przyspieszania rehabilitacji i opierać decyzję na reakcji następnego dnia.';
  if (quality > 0) return 'Ograniczona jakość opieki zwiększa znaczenie prostych kryteriów: brak bólu, pełniejszy zakres ruchu i stabilna reakcja na wysiłek.';
  return 'Bez stałej opieki fizjoterapeutycznej decyzja o powrocie powinna być wyjątkowo ostrożna.';
};

const buildPhysioReport = (player: Player, physios: StaffMember[], progress: number): string => {
  const injury = player.health.injury!;
  const quality = getPhysioQuality(physios);
  const leadPhysio = physios[0] ? `${physios[0].firstName} ${physios[0].lastName}` : 'sztab medyczny';
  const strength = player.attributes.strength;
  const loadTolerance = getLoadToleranceText(injury.daysRemaining, progress);
  const qualityPlan = getQualityPlanText(quality);
  const ageNote = player.age >= 33 ? 'ze względu na wiek zawodnika obciążenia trzeba podnosić ostrożniej' : 'reakcja organizmu na dotychczasowy plan jest prawidłowa';
  const strengthNote = strength < 65
    ? 'niższa siła bazowa może wydłużyć ostatnią fazę odbudowy'
    : strength >= 85
      ? 'dobra baza siłowa przemawia za stabilnym tempem powrotu'
      : 'poziom siły nie powinien istotnie zaburzyć planu rehabilitacji';

  const openers = [
    `${leadPhysio} opisuje uraz jako ${injury.type.toLowerCase()}; w ocenie klinicznej najważniejsze pozostają ból przy obciążeniu i reakcja tkanek po treningu.`,
    `W badaniu kontrolnym ${player.lastName} prezentuje stopniową poprawę po urazie typu ${injury.type.toLowerCase()}, bez podstaw do natychmiastowego pełnego obciążenia.`,
    `Ocena fizjoterapeutyczna wskazuje na uraz "${injury.type}" w fazie odbudowy funkcji, z koniecznością monitorowania bólu i zakresu ruchu.`,
    `${leadPhysio} notuje, że objawy są bardziej przewidywalne, ale decyzja o powrocie musi zależeć od tolerancji sprintu, zwrotów i kontaktu.`,
    `Aktualny obraz rehabilitacji jest stabilny: ${player.lastName} poprawia kontrolę ruchu, lecz pełna intensywność meczowa nadal wymaga potwierdzenia testami.`,
  ];

  const middles = [
    `Na tym etapie zawodnik ${loadTolerance}.`,
    `Postęp leczenia wynosi około ${progress}%, więc kolejny krok to ocena ruchu bez bólu oraz reakcja po jednostce treningowej.`,
    `${qualityPlan}`,
    `W najbliższych dniach priorytetem jest symetria pracy mięśniowej, brak narastającego bólu i kontrolowana ekspozycja na ruchy meczowe.`,
    `Sztab powinien oceniać nie tylko samą datę powrotu, ale też ból przy palpacji, zakres ruchu i tolerancję powtarzalnych przyspieszeń.`,
  ];

  const closers = [
    `Prognoza powrotu pozostaje na poziomie ${injury.daysRemaining} dni, pod warunkiem braku reakcji bólowej po zwiększeniu obciążeń.`,
    `Do gry można go dopuścić dopiero po treningu bez nawrotu objawów; ${ageNote}, a ${strengthNote}.`,
    `Jeśli testy funkcjonalne będą stabilne, obecny licznik ${injury.daysRemaining} dni jest realistyczny.`,
    `Przedwczesny występ nadal zwiększa ryzyko nawrotu, zwłaszcza przy gwałtownych zmianach kierunku i pracy na maksymalnej prędkości.`,
    `Zalecenie: progresować trening etapami i potwierdzić gotowość po reakcji organizmu następnego dnia.`,
  ];

  const seed = `${player.id}_${injury.injuryDate}_${injury.type}_${injury.daysRemaining}`;
  const selected = [
    openers[seededIndex(`${seed}_opener`, openers.length)],
    middles[seededIndex(`${seed}_middle`, middles.length)],
    closers[seededIndex(`${seed}_closer`, closers.length)],
  ];

  return selected.join(' ');
};

export const HospitalView: React.FC = () => {
  const { navigateTo, userTeamId, players, reserves, clubs, staffMembers } = useGame();
  const [selectedReport, setSelectedReport] = useState<PhysioReportModal | null>(null);
  const [reportPosition, setReportPosition] = useState({ x: 760, y: 150 });
  const [isDraggingReport, setIsDraggingReport] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    if (!isDraggingReport) return;

    const handleMouseMove = (event: MouseEvent) => {
      setReportPosition({
        x: Math.max(12, event.clientX - dragOffset.current.x),
        y: Math.max(12, event.clientY - dragOffset.current.y),
      });
    };

    const handleMouseUp = () => setIsDraggingReport(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingReport]);

  const startReportDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    dragOffset.current = {
      x: event.clientX - reportPosition.x,
      y: event.clientY - reportPosition.y,
    };
    setIsDraggingReport(true);
  };

  const userClub = useMemo(
    () => clubs.find(club => club.id === userTeamId) ?? null,
    [clubs, userTeamId]
  );

  const physios = useMemo(() => {
    if (!userClub) return [];

    return (userClub.staffIds ?? [])
      .map(id => staffMembers[id])
      .filter((member): member is StaffMember => member?.role === StaffRole.PHYSIOTHERAPIST);
  }, [userClub, staffMembers]);

  const injuredPlayers = useMemo(() => {
    if (!userTeamId) return [];
    const squad = players[userTeamId] || [];
    const mainInjured = squad.filter(p => p.health.status === HealthStatus.INJURED && p.health.injury);
    const reserveInjured = reserves.filter(p => p.health.status === HealthStatus.INJURED && p.health.injury);
    return [...mainInjured, ...reserveInjured];
  }, [players, userTeamId, reserves]);

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={szpitalBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.4 }}
        />
        <div className="absolute inset-0 bg-slate-950/70" />
      </div>

      <div className="min-h-screen text-slate-50 p-6 relative z-10 font-black italic uppercase tracking-tighter">
        <div className="w-full max-w-[1740px] mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl font-black italic uppercase tracking-tighter text-red-300">
                H
              </div>
              <div>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                  Szpital
                </h1>
                <p className="text-base text-slate-500 mt-2 font-black italic uppercase tracking-tighter">
                  Kontuzjowani zawodnicy
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo(ViewState.DASHBOARD)}
              className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 text-slate-300 font-black italic uppercase tracking-tighter text-base hover:bg-white/10 hover:text-white transition-all active:translate-y-[2px]"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)' }}
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Powrót</span>
            </button>
          </div>

          {injuredPlayers.length === 0 ? (
            <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-12 text-center">
              <p className="text-slate-400 font-black italic uppercase tracking-tighter text-xl">
                Brak kontuzjowanych zawodników
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-white/5 rounded-[28px] overflow-x-auto overflow-y-hidden">
              <table className="w-full min-w-[1480px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="text-left px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap w-[60px] border-r border-white/[0.06] bg-white/[0.015]">#</th>
                    <th className="text-left px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap w-[190px] border-r border-white/[0.06] bg-cyan-500/[0.018]">Zawodnik</th>
                    <th className="text-left px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap w-[190px] border-r border-white/[0.06] bg-red-500/[0.018]">Uraz</th>
                    <th className="text-left px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap w-[560px] border-r border-white/[0.06] bg-orange-500/[0.018]">Postęp leczenia</th>
                    <th className="text-left px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap w-[240px] border-r border-white/[0.06] bg-emerald-500/[0.018]">Fizjoterapeuci</th>
                    <th className="text-left px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap w-[130px] border-r border-white/[0.06] bg-blue-500/[0.018]">Raport</th>
                    <th className="text-right px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap w-[90px] bg-violet-500/[0.018]">Dni</th>
                  </tr>
                </thead>
                <tbody>
                  {injuredPlayers.map((player, index) => {
                    const injury = player.health.injury!;
                    const progress = getRecoveryProgress(player);
                    const status = getTreatmentStatus(player);
                    const assignedPhysios = assignPhysios(physios, index);
                    const physioReport = buildPhysioReport(player, assignedPhysios, progress);

                    return (
                      <tr
                        key={player.id}
                        className={`border-b border-white/5 last:border-0 transition-colors hover:bg-white/10 ${index % 2 === 0 ? 'bg-slate-950/20' : 'bg-white/[0.035]'}`}
                      >
                          <td className="px-5 py-5 text-lg font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap border-r border-white/[0.06] bg-white/[0.012]">{index + 1}</td>
                          <td className="px-5 py-5 whitespace-nowrap border-r border-white/[0.06] bg-cyan-500/[0.014]">
                            <div className="flex flex-col gap-2 items-start">
                              <span className="text-lg font-black italic uppercase tracking-tighter text-white whitespace-nowrap">
                                {player.firstName} {player.lastName}
                              </span>
                              <span className="w-fit text-sm font-black italic uppercase tracking-tighter bg-slate-800 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300 whitespace-nowrap">
                                {player.position}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-5 text-base font-black italic uppercase tracking-tighter text-slate-400 whitespace-nowrap border-r border-white/[0.06] bg-red-500/[0.014]">
                            {injury.type}
                          </td>
                          <td className="px-5 py-5 whitespace-nowrap border-r border-white/[0.06] bg-orange-500/[0.014]">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-4">
                                <span className={`text-sm font-black italic uppercase tracking-tighter px-3 py-1.5 rounded-full border whitespace-nowrap ${status.borderClass}`}>
                                  {status.label}
                                </span>
                                <span className={`text-base font-black italic uppercase tracking-tighter tabular-nums whitespace-nowrap ${status.textClass}`}>
                                  {progress}%
                                </span>
                              </div>
                              <div className="h-3 rounded-full bg-slate-950/70 border border-white/10 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${status.barClass} transition-all duration-500`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <p className="text-sm text-slate-500 font-black italic uppercase tracking-tighter whitespace-nowrap">
                                {status.description}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-5 whitespace-nowrap border-r border-white/[0.06] bg-emerald-500/[0.014]">
                            {assignedPhysios.length > 0 ? (
                              <div className="flex flex-nowrap gap-2">
                                {assignedPhysios.map(physio => (
                                  <span
                                    key={`${player.id}_${physio.id}`}
                                    className="text-sm font-black italic uppercase tracking-tighter text-cyan-100 bg-cyan-500/10 border border-cyan-400/20 px-3 py-1.5 rounded-full whitespace-nowrap"
                                  >
                                    {physio.firstName} {physio.lastName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap">
                                Brak fizjoterapeutów
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-5 whitespace-nowrap border-r border-white/[0.06] bg-blue-500/[0.014]">
                            <button
                              onClick={() => setSelectedReport({
                                playerName: `${player.firstName} ${player.lastName}`,
                                report: physioReport,
                              })}
                              className="px-4 py-2 rounded-xl bg-cyan-500/15 border-t border-x border-b border-t-cyan-300/50 border-x-cyan-400/25 border-b-black/60 text-cyan-100 text-sm font-black italic uppercase tracking-tighter whitespace-nowrap hover:bg-cyan-500/25 hover:text-white transition-all active:translate-y-[2px]"
                              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.14)' }}
                            >
                              Raport
                            </button>
                          </td>
                          <td className="px-5 py-5 text-right whitespace-nowrap bg-violet-500/[0.014]">
                            <span className={`text-lg font-black italic uppercase tracking-tighter whitespace-nowrap ${status.textClass}`}>
                              {injury.daysRemaining} dni
                            </span>
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

      {selectedReport && (
        <div
          className="fixed z-[80] w-[min(680px,calc(100vw-24px))] rounded-[28px] border border-cyan-400/25 bg-slate-950/95 shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl overflow-hidden font-black italic uppercase tracking-tighter text-slate-100"
          style={{ left: reportPosition.x, top: reportPosition.y }}
        >
          <div
            onMouseDown={startReportDrag}
            className="cursor-move select-none px-5 py-4 border-b border-white/10 bg-cyan-500/10 flex items-start justify-between gap-4"
          >
            <div>
              <span className="block text-sm text-cyan-300 font-black italic uppercase tracking-tighter">
                Raport fizjoterapeutów
              </span>
              <h2 className="text-2xl text-white font-black italic uppercase tracking-tighter leading-none mt-1">
                {selectedReport.playerName}
              </h2>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="w-10 h-10 rounded-xl bg-white/5 border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 text-slate-300 text-xl font-black italic uppercase tracking-tighter hover:bg-red-500/20 hover:border-t-red-300/50 hover:border-x-red-400/25 hover:text-white transition-all active:translate-y-[2px]"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)' }}
            >
              ×
            </button>
          </div>

          <div className="p-5">
            <div className="rounded-2xl border border-cyan-400/10 bg-cyan-500/[0.04] p-4">
              <p className="text-base leading-relaxed text-slate-200 font-black italic uppercase tracking-tighter">
                {selectedReport.report}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
