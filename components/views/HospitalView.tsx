import React, { useMemo, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState, HealthStatus, InjurySeverity, Player, StaffMember, StaffRole } from '../../types';

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

const HospitalScene: React.FC<{ primaryColor: string; secondaryColor: string }> = ({ primaryColor, secondaryColor }) => (
  <svg
    className="absolute inset-0 h-full w-full"
    viewBox="0 0 1920 1080"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="hospital-base" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#061321" />
        <stop offset="0.5" stopColor="#07101d" />
        <stop offset="1" stopColor="#020711" />
      </linearGradient>
      <linearGradient id="hospital-club-wash" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={primaryColor} stopOpacity="0.25" />
        <stop offset="0.42" stopColor={secondaryColor} stopOpacity="0.08" />
        <stop offset="1" stopColor="#020711" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="hospital-red-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#ef4444" stopOpacity="0.18" />
        <stop offset="1" stopColor="#ef4444" stopOpacity="0" />
      </radialGradient>
      <pattern id="hospital-dot-grid" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="1.2" fill="#ffffff" fillOpacity="0.075" />
      </pattern>
      <pattern id="hospital-diagonal" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
        <line x1="0" y1="0" x2="0" y2="14" stroke="#ffffff" strokeOpacity="0.035" strokeWidth="3" />
      </pattern>
      <filter id="hospital-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
    </defs>

    <rect width="1920" height="1080" fill="url(#hospital-base)" />
    <rect width="1920" height="1080" fill="url(#hospital-club-wash)" />
    <rect x="22" y="22" width="1876" height="1036" rx="52" fill="url(#hospital-dot-grid)" />
    <ellipse cx="1630" cy="700" rx="520" ry="470" fill="url(#hospital-red-glow)" />
    <path d="M0 0h380l150 1080H0z" fill="url(#hospital-diagonal)" opacity="0.8" />

    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M70 210h190l25-42 42 92 46-153 58 221 42-118 38 58h184"
        stroke="#f8fafc"
        strokeOpacity="0.16"
        strokeWidth="3"
      />
      <path
        d="M70 210h190l25-42 42 92 46-153 58 221 42-118 38 58h184"
        stroke="#ef4444"
        strokeOpacity="0.42"
        strokeWidth="1.5"
      />
      <circle cx="373" cy="107" r="7" fill="#ef4444" fillOpacity="0.7" stroke="none" filter="url(#hospital-soft-glow)" />
    </g>

    <g transform="translate(1320 390)" opacity="0.13" fill="none" stroke="#f8fafc">
      <rect x="0" y="0" width="455" height="470" rx="38" strokeWidth="3" />
      <path d="M75 0v470M380 0v470M0 112h455" strokeWidth="2" />
      <path d="M174 48h108M228 0v96" stroke="#ef4444" strokeWidth="20" strokeLinecap="square" />
      <rect x="118" y="180" width="220" height="122" rx="16" strokeWidth="4" />
      <path d="M150 180v-34h156v34M146 302l-18 98M310 302l18 98M103 400h250" strokeWidth="4" />
      <circle cx="128" cy="414" r="14" strokeWidth="4" />
      <circle cx="328" cy="414" r="14" strokeWidth="4" />
      <path d="M168 240h34l14-24 26 53 22-37h32" stroke="#ef4444" strokeOpacity="0.8" strokeWidth="4" />
    </g>

    <g transform="translate(900 735)" opacity="0.11" fill="none" stroke="#bae6fd" strokeWidth="4">
      <path d="M0 118h680l68 63H-45z" />
      <path d="M44 118V20h548v98M90 20V-16h454v36" />
      <path d="M35 181l-24 112M667 181l24 112M-8 293h58M652 293h78" />
      <path d="M92 70h150M276 70h150M462 70h82" strokeOpacity="0.5" />
    </g>

    <g opacity="0.12" fill="none" stroke="#ffffff">
      <path d="M0 430h1920M0 930h1920" />
      <path d="M1250 0v1080" />
      <path d="M34 34h270M1616 1046h270" stroke={primaryColor} strokeOpacity="0.85" strokeWidth="3" />
      <path d="M34 46h170M1716 1034h170" stroke="#ef4444" strokeOpacity="0.85" strokeWidth="3" />
    </g>

    <rect x="0" y="0" width="10" height="1080" fill="#ef4444" fillOpacity="0.75" />
    <rect x="10" y="0" width="4" height="1080" fill="#ffffff" fillOpacity="0.75" />
  </svg>
);

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

  const clubPrimary = userClub?.colorsHex?.[0] || '#38bdf8';
  const clubSecondary = userClub?.colorsHex?.[1] || '#f8fafc';

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <HospitalScene primaryColor={clubPrimary} secondaryColor={clubSecondary} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020711]/5 via-[#020711]/20 to-[#020711]/65" />
      </div>

      <div className="relative z-10 min-h-screen p-8 text-slate-50 font-black italic uppercase tracking-tighter">
        <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-7">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div
                className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-[20px] border border-red-300/25 bg-[#150b10]/88 text-[36px] font-black not-italic leading-none text-white shadow-[inset_3px_0_0_rgba(248,113,113,0.78),0_10px_28px_rgba(0,0,0,0.32)]"
                style={{ boxShadow: `inset 3px 0 0 rgba(248,113,113,0.78), 0 0 0 1px ${clubPrimary}26, 0 10px 28px rgba(0,0,0,0.32)` }}
              >
                <span className="relative -top-0.5">+</span>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-black italic uppercase tracking-tighter text-red-300/80">Centrum medyczne</p>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)]">
                  Szpital
                </h1>
                <p className="mt-2 text-base font-black italic uppercase tracking-tighter text-slate-300/60">
                  Kontuzjowani zawodnicy
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo(ViewState.DASHBOARD)}
              className="group flex items-center gap-2 rounded-2xl border border-white/15 bg-[#07111e]/88 px-6 py-3 text-base font-black italic uppercase tracking-tighter text-slate-300 shadow-[0_8px_22px_rgba(0,0,0,0.3)] transition-all hover:border-red-200/30 hover:bg-red-400/10 hover:text-white active:translate-y-[2px]"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Powrót</span>
            </button>
          </div>

          {injuredPlayers.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-[#050d18]/90 p-12 text-center shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-slate-400 font-black italic uppercase tracking-tighter text-xl">
                Brak kontuzjowanych zawodników
              </p>
            </div>
          ) : (
            <div className="relative overflow-x-auto overflow-y-hidden rounded-[30px] border border-white/10 bg-[#050d18]/92 shadow-[0_28px_76px_rgba(0,0,0,0.42)] backdrop-blur-[8px]">
              <div className="pointer-events-none absolute inset-x-8 top-0 z-20 h-px bg-gradient-to-r from-transparent via-red-300/65 to-transparent" />
              <table className="w-full min-w-[1480px]">
                <thead>
                  <tr className="border-b border-white/10 bg-gradient-to-r from-red-500/10 via-white/[0.055] to-transparent">
                    <th className="text-left px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-slate-300/65 whitespace-nowrap w-[60px] border-r border-white/[0.06] bg-white/[0.015]">#</th>
                    <th className="text-left px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-slate-300/65 whitespace-nowrap w-[190px] border-r border-white/[0.06]">Zawodnik</th>
                    <th className="text-left px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-red-200/70 whitespace-nowrap w-[190px] border-r border-white/[0.06] bg-red-500/[0.028]">Uraz</th>
                    <th className="text-left px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-slate-300/65 whitespace-nowrap w-[560px] border-r border-white/[0.06]">Postęp leczenia</th>
                    <th className="text-left px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-slate-300/65 whitespace-nowrap w-[240px] border-r border-white/[0.06]">Fizjoterapeuci</th>
                    <th className="text-left px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-slate-300/65 whitespace-nowrap w-[130px] border-r border-white/[0.06]">Raport</th>
                    <th className="text-right px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-slate-300/65 whitespace-nowrap w-[90px]">Dni</th>
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
                        className={`border-b border-white/[0.07] last:border-0 transition-colors hover:bg-white/[0.085] ${index % 2 === 0 ? 'bg-[#06111e]/88' : 'bg-[#0a1726]/82'}`}
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
