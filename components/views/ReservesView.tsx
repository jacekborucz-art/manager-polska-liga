import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { PlayerPosition, PlayerAttributes, ViewState, Player, ReserveProgressPoint, HealthStatus } from '../../types';
import { Button } from '../ui/Button';
import rezerwyBg from '../../Graphic/themes/rezerwy.png';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { ReserveScheduleModal } from '../modals/ReserveScheduleModal';
import { PlayerCareerService } from '../../services/PlayerCareerService';

const POSITION_LABEL: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'BR',
  [PlayerPosition.DEF]: 'OBR',
  [PlayerPosition.MID]: 'POM',
  [PlayerPosition.FWD]: 'NAP',
};

const POSITION_ROW_BG: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'bg-yellow-900/40',
  [PlayerPosition.DEF]: 'bg-blue-900/40',
  [PlayerPosition.MID]: 'bg-emerald-900/40',
  [PlayerPosition.FWD]: 'bg-red-900/40',
};

const ATTR_KEYS: (keyof PlayerAttributes)[] = [
  'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking',
  'finishing', 'technique', 'vision', 'dribbling', 'heading', 'positioning',
  'goalkeeping', 'freeKicks', 'talent', 'penalties', 'corners', 'aggression',
  'crossing', 'leadership', 'mentality', 'workRate',
];

const RESERVE_PROGRESS_ATTR_KEYS = ATTR_KEYS.filter(key => !['talent', 'leadership'].includes(key));

const ATTR_LABELS: Record<string, string> = {
  strength: 'SIŁ',
  stamina: 'WYT',
  pace: 'PRD',
  defending: 'OBR',
  passing: 'POD',
  attacking: 'ATK',
  finishing: 'SKU',
  technique: 'TEC',
  vision: 'WIZ',
  dribbling: 'DRY',
  heading: 'GŁO',
  positioning: 'POZ',
  goalkeeping: 'BR',
  freeKicks: 'WRZ',
  talent: 'TAL',
  penalties: 'KAR',
  corners: 'ROZ',
  aggression: 'AGR',
  crossing: 'DOŚ',
  leadership: 'LID',
  mentality: 'MEN',
  workRate: 'PRA',
};

const ATTR_FULL_NAMES: Record<string, string> = {
  strength: 'Siła fizyczna',
  stamina: 'Wytrzymałość',
  pace: 'Prędkość',
  defending: 'Obrona',
  passing: 'Podania',
  attacking: 'Atak',
  finishing: 'Skuteczność',
  technique: 'Technika',
  vision: 'Wizja gry',
  dribbling: 'Drybling',
  heading: 'Główkowanie',
  positioning: 'Pozycjonowanie',
  goalkeeping: 'Bramkarstwo',
  freeKicks: 'Rzuty wolne',
  talent: 'Talent',
  penalties: 'Rzuty karne',
  corners: 'Rozgrywanie',
  aggression: 'Agresja',
  crossing: 'Dośrodkowania',
  leadership: 'Liderstwo',
  mentality: 'Mentalność',
  workRate: 'Pracowitość',
};

const POSITION_ORDER = [PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD];

// Kluczowe atrybuty dla danej pozycji — jeśli wartość ≤ 35, atrybut oznaczony jako alarmująco niski
const POSITION_KEY_ATTRS: Record<PlayerPosition, (keyof PlayerAttributes)[]> = {
  [PlayerPosition.GK]:  ['goalkeeping', 'positioning', 'strength'],
  [PlayerPosition.DEF]: ['defending', 'heading', 'strength', 'positioning'],
  [PlayerPosition.MID]: ['passing', 'vision', 'stamina', 'technique'],
  [PlayerPosition.FWD]: ['finishing', 'attacking', 'pace', 'positioning'],
};
const WEAK_THRESHOLD = 35;

const isWeakForPosition = (pos: PlayerPosition, attr: keyof PlayerAttributes, val: number): boolean =>
  val <= WEAK_THRESHOLD && POSITION_KEY_ATTRS[pos].includes(attr);

const POSITION_FULL_NAME: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]:  'Bramkarz',
  [PlayerPosition.DEF]: 'Obrońca',
  [PlayerPosition.MID]: 'Pomocnik',
  [PlayerPosition.FWD]: 'Napastnik',
};

const POSITION_BADGE_STYLE: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]:  'bg-yellow-500/20 border border-yellow-500/60 text-yellow-300',
  [PlayerPosition.DEF]: 'bg-blue-500/20 border border-blue-500/60 text-blue-300',
  [PlayerPosition.MID]: 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300',
  [PlayerPosition.FWD]: 'bg-red-500/20 border border-red-500/60 text-red-300',
};

const POS_PRAISE: Record<PlayerPosition, string[]> = {
  [PlayerPosition.GK]: [
    'Dobry refleks, pewny na przedpolu.',
    'Spokojny pod presją, komenderuje obroną.',
    'Świetne wyjścia z bramki, nie boi się konfrontacji.',
    'Bardzo dobra gra na linii.',
    'Czyta grę rywalów lepiej niż większość zawodników w jego wieku.',
  ],
  [PlayerPosition.DEF]: [
    'Silny w powietrzu i dominuje przy stałych fragmentach.',
    'Dobra praca nóg, wychodzi z pressingu bez strat.',
    'Dobry timing przy wślizgach, rzadko popełnia błędy pozycyjne.',
    'Mocny fizycznie, bardzo szybki',
    'Bardzo dobry stoper',
    'Potrafi bardzo dobrze uwolnić się spod pressingu.',
  ],
  [PlayerPosition.MID]: [
    'Świetna wizja gry. Widzi więcej niż inni.',
    'Technicznie wyróżniający się w ciasnych sytuacjach.',
    'Mocno pracuje przez całe spotkanie, nie odpuszcza żadnej piłki.',
    'Aktywny w pressingu, odzyskuje cenne piłki.',
    'Kreatywny i trudny do przewidzenia, potrafi zaskoczyć rywala.',
    'Inteligentne poruszanie bez piłki, zawsze dostępny do podania.',
  ],
  [PlayerPosition.FWD]: [
    'Instynkt strzeleck, dobrze potrafi odnaleźć się w polu karnym.',
    'Szybki w akcjach 1 na 1, trudny do zatrzymania.',
    'Dobra gra głową, groźny przy dośrodkowaniach.',
    'Potrafi utrzymać piłkę i wciągnąć obrońców.',
    'Nieprzewidywalny w polu karnym, zawsze szuka wykończenia.',
    'Świetna gra bez piłki.',
  ],
};

const POS_CONCERN: Record<PlayerPosition, string[]> = {
  [PlayerPosition.GK]: [
    'Niepewny przy wyjściach.',
    'Słaba gra nogami, rywal może to wykorzystać.',
  ],
  [PlayerPosition.DEF]: [
    'Problemy z powrotami po akcjach ofensywnych.',
    'Za słaby w powietrzu jak na tę pozycję.',
  ],
  [PlayerPosition.MID]: [
    'Słaba gra bez piłki.',
    'Słabe pressing, nie wraca wystarczająco szybko.',
  ],
  [PlayerPosition.FWD]: [
    'Wykończenie wymaga dużej pracy, gdyż marnuje zbyt wiele okazji.',
    'Niepewny w kluczowych momentach meczu.',
  ],
};

const COACH_INTROS = [
  'Przejrzałem dokładnie kadrę. Oto moje obserwacje z ostatnich tygodni:',
  'Obserwowałem chłopaków na treningach i meczach sparingowych. Mam kilka uwag:',
  'To ciekawy zespół, są tu zawodnicy z potencjałem, ale też tacy wymagający pracy:',
  'Będąc obiektywnym widzę, że:',
  'Po ostatnim miesiącu intensywnych treningów mogę przedstawić moje spostrzeżenia:',
  'Obserwuję ich uważnie od jakiegoś czasu i mam konkretne wnioski:',
];

interface ReportEntry {
  player: Player;
  perceivedTalent: number;
  note: string;
  tier: 'gem' | 'solid' | 'concern';
}

interface CoachReport {
  intro: string;
  highlights: ReportEntry[];
  concerns: ReportEntry[];
}

interface NormalizedReserveProgressPoint {
  date: string;
  label: string;
  overall: number;
}

interface HoveredProgressPoint {
  x: number;
  y: number;
  index: number;
  point: NormalizedReserveProgressPoint;
  diff: number;
}

type ProgressRange = 'DAY' | 'WEEK' | 'MONTH';

const PROGRESS_RANGE_LABELS: Record<ProgressRange, string> = {
  DAY: '1D',
  WEEK: '1T',
  MONTH: '1M',
};

const PROGRESS_WINDOW_SIZE: Record<ProgressRange, number> = {
  DAY: 14,
  WEEK: 10,
  MONTH: 12,
};

const formatProgressDate = (date: string): string => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatProgressShortDate = (date: string): string => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};

const normalizeReserveProgressHistory = (
  history: ReserveProgressPoint[],
  currentDate: Date
): NormalizedReserveProgressPoint[] => (
  history.map((entry, index) => {
    if (typeof entry === 'number') {
      const inferredDate = new Date(currentDate);
      inferredDate.setDate(currentDate.getDate() - (history.length - 1 - index) * 7);
      const isoDate = inferredDate.toISOString();
      return {
        date: isoDate,
        label: formatProgressDate(isoDate),
        overall: entry,
      };
    }

    return {
      date: entry.date,
      label: formatProgressDate(entry.date),
      overall: entry.overall,
    };
  }).filter(point => Number.isFinite(point.overall))
);

const getWeekKey = (date: Date): string => {
  const weekStart = new Date(date);
  const day = weekStart.getDay() || 7;
  weekStart.setDate(weekStart.getDate() - day + 1);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.toISOString().split('T')[0];
};

const aggregateReserveProgressPoints = (
  points: NormalizedReserveProgressPoint[],
  range: ProgressRange
): NormalizedReserveProgressPoint[] => {
  if (range === 'DAY') return points;

  const groups = new Map<string, NormalizedReserveProgressPoint[]>();
  points.forEach(point => {
    const parsed = new Date(point.date);
    const key = range === 'WEEK'
      ? getWeekKey(parsed)
      : `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
    groups.set(key, [...(groups.get(key) || []), point]);
  });

  return Array.from(groups.entries()).map(([key, group]) => {
    const lastPoint = group[group.length - 1];
    const overall = Math.round(group.reduce((sum, point) => sum + point.overall, 0) / group.length);
    const date = range === 'WEEK' ? key : `${key}-01`;
    const label = range === 'WEEK'
      ? formatProgressDate(date)
      : new Date(date).toLocaleDateString('pl-PL', { month: '2-digit', year: 'numeric' });

    return {
      date: lastPoint.date,
      label,
      overall,
    };
  });
};

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateCoachReport(players: Player[], seed: number): CoachReport {
  const rng = seededRand(seed);
  const rand = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

  const evaluated = players.map(p => {
    // Bias: 0.35–1.65 — trener może mocno niedocenić lub przecenić zawodnika
    const bias = 0.35 + rng() * 1.3;
    const perceivedTalent = Math.round(Math.min(99, Math.max(1, p.attributes.talent * bias)));
    return { player: p, perceivedTalent };
  });

  evaluated.sort((a, b) => b.perceivedTalent - a.perceivedTalent);

  const topCount = 3 + Math.floor(rng() * 3); // 3–5
  const highlights: ReportEntry[] = evaluated.slice(0, topCount).map(e => ({
    player: e.player,
    perceivedTalent: e.perceivedTalent,
    note: rand(POS_PRAISE[e.player.position]),
    tier: e.perceivedTalent >= 68 ? 'gem' : 'solid',
  }));

  const concerns: ReportEntry[] = evaluated
    .filter(e => {
      const keyAttrs = POSITION_KEY_ATTRS[e.player.position];
      return keyAttrs.some(attr => e.player.attributes[attr] <= WEAK_THRESHOLD);
    })
    .slice(0, 2)
    .map(e => ({
      player: e.player,
      perceivedTalent: e.perceivedTalent,
      note: rand(POS_CONCERN[e.player.position]),
      tier: 'concern' as const,
    }));

  return { intro: rand(COACH_INTROS), highlights, concerns };
}

export const ReservesView: React.FC = () => {
  const { reserves, navigateTo, viewPlayerDetails, userTeamId, clubs, currentDate, seasonNumber,
          players, setPlayers, setReserves, lineups, updateLineup,
          coaches, viewCoachDetails, reserveCoachId, reserveProgressHistory } = useGame();
  const [showReport, setShowReport] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [hoveredProgressPoint, setHoveredProgressPoint] = useState<HoveredProgressPoint | null>(null);
  const [progressRange, setProgressRange] = useState<ProgressRange>('DAY');
  const [progressWindowOffset, setProgressWindowOffset] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; player: Player } | null>(null);

  const moveToFirstTeam = (player: Player) => {
    if (!userTeamId) return;
    const clubData = clubs.find(c => c.id === userTeamId);
    if (!clubData) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const newHistory = PlayerCareerService.reopenOrCreateEntry(
      player.history || [],
      player,
      { clubId: userTeamId, clubName: clubData.name },
      year,
      month
    );
    const updatedPlayer = { ...player, history: newHistory };
    setReserves(prev => prev.filter(p => p.id !== player.id));
    setPlayers(prev => ({ ...prev, [userTeamId]: [...(prev[userTeamId] ?? []), updatedPlayer] }));
    const currentLineup = lineups[userTeamId];
    if (currentLineup) {
      updateLineup(userTeamId, { ...currentLineup, reserves: [...currentLineup.reserves, updatedPlayer.id] });
    }
  };

  const myClub = clubs.find(c => c.id === userTeamId);
  const reserveCoach = reserveCoachId ? coaches[reserveCoachId] : null;

  const weekKey = useMemo(
    () => Math.floor(currentDate.getTime() / (7 * 24 * 3600 * 1000)) + seasonNumber * 1000,
    [currentDate, seasonNumber]
  );

  const weeklyReport = useMemo(
    () => reserves.length > 0 ? generateCoachReport(reserves, weekKey) : null,
    [reserves, weekKey]
  );

  const sortedReserves = useMemo(() => {
    return [...reserves].sort((a, b) => {
      const posA = POSITION_ORDER.indexOf(a.position);
      const posB = POSITION_ORDER.indexOf(b.position);
      if (posA !== posB) return posA - posB;
      return b.overallRating - a.overallRating;
    });
  }, [reserves]);

  const reserveProgressPoints = useMemo(
    () => normalizeReserveProgressHistory(reserveProgressHistory, currentDate),
    [reserveProgressHistory, currentDate]
  );

  const rangedReserveProgressPoints = useMemo(
    () => aggregateReserveProgressPoints(reserveProgressPoints, progressRange),
    [reserveProgressPoints, progressRange]
  );

  const visibleReserveProgressPoints = useMemo(() => {
    const visibleCount = PROGRESS_WINDOW_SIZE[progressRange];
    const maxOffset = Math.max(0, rangedReserveProgressPoints.length - visibleCount);
    const safeOffset = Math.min(progressWindowOffset, maxOffset);
    const start = Math.max(0, rangedReserveProgressPoints.length - visibleCount - safeOffset);
    return rangedReserveProgressPoints.slice(start, start + visibleCount);
  }, [progressRange, progressWindowOffset, rangedReserveProgressPoints]);

  const canShiftProgressLeft = progressWindowOffset < Math.max(0, rangedReserveProgressPoints.length - PROGRESS_WINDOW_SIZE[progressRange]);
  const canShiftProgressRight = progressWindowOffset > 0;

  const reserveAttributeChanges = useMemo(() => (
    RESERVE_PROGRESS_ATTR_KEYS.map(key => {
      const total = reserves.reduce((sum, player) => (
        sum + (player.stats.seasonalChanges?.[key as string] ?? 0)
      ), 0);
      return {
        key,
        label: ATTR_LABELS[key],
        name: ATTR_FULL_NAMES[key],
        total,
        average: reserves.length > 0 ? total / reserves.length : 0,
      };
    }).sort((a, b) => b.total - a.total || a.label.localeCompare(b.label))
  ), [reserves]);

  const maxAttributeChange = useMemo(() => (
    Math.max(1, ...reserveAttributeChanges.map(stat => Math.abs(stat.total)))
  ), [reserveAttributeChanges]);

  const latestReserveProgress = reserveProgressPoints[reserveProgressPoints.length - 1] ?? null;
  const previousReserveProgress = reserveProgressPoints[reserveProgressPoints.length - 2] ?? null;
  const reserveProgressDiff = latestReserveProgress && previousReserveProgress
    ? latestReserveProgress.overall - previousReserveProgress.overall
    : 0;

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={rezerwyBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.35 }}
        />
        <div className="absolute inset-0 bg-slate-950/65" />
      </div>

    <div className="min-h-screen text-slate-50 p-4 relative z-10">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {myClub && getClubLogo(myClub.id) && (
              <img
                src={getClubLogo(myClub.id)}
                alt={myClub.name}
                className="w-16 h-16 object-contain drop-shadow-2xl shrink-0"
              />
            )}
            <div>
              {myClub && (
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">{myClub.name} II</p>
              )}
              <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-400 to-slate-600">REZERWY</h1>
              {myClub && (
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">{reserves.length} zawodników</p>
              )}
              {reserveCoach && (
                <button
                  onClick={() => viewCoachDetails(reserveCoach.id)}
                  className="mt-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80 hover:text-amber-300 transition-colors group"
                >
                  <span className="text-amber-500/60 group-hover:text-amber-400 transition-colors">🎽</span>
                  <span>Trener rezerw: {reserveCoach.firstName} {reserveCoach.lastName}</span>
                  <span className="text-amber-600/50 group-hover:text-amber-400 transition-colors">{reserveCoach.nationalityFlag}</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {reserveProgressPoints.length >= 2 && (
              <button
                type="button"
                onClick={() => setShowProgressModal(true)}
                className="group flex items-center gap-3 rounded-2xl border-t border-x border-b border-t-emerald-400/40 border-x-emerald-400/20 border-b-black/60 bg-emerald-500/10 px-5 py-3 text-left uppercase tracking-tighter text-white backdrop-blur-sm transition-all hover:border-t-emerald-300/60 hover:border-x-emerald-300/40 hover:bg-emerald-500/20 active:translate-y-[2px]"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                aria-label="Otworz szczegolowy progres rezerw"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-300/50 bg-black/45 text-emerald-300 transition-colors group-hover:bg-emerald-400 group-hover:text-black">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 19V5" />
                    <path d="M4 19h16" />
                    <path d="m7 15 3.2-4 3.1 2.7L18 8" />
                    <path d="M18 8h-3.5" />
                    <path d="M18 8v3.5" />
                  </svg>
                </span>
                <span className="block text-[13px] italic text-white">Statystyki progresu</span>
              </button>
            )}
          <div className="flex gap-3">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="group flex items-center gap-3 rounded-2xl border-t border-x border-b border-t-blue-500/40 border-x-blue-500/20 border-b-black/60 bg-blue-600/15 px-5 py-3 text-left uppercase tracking-tighter text-white backdrop-blur-sm transition-all hover:border-t-blue-400/60 hover:border-x-blue-400/30 hover:bg-blue-600/25 active:translate-y-[2px]"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/50 bg-black/45 text-blue-400 transition-colors group-hover:bg-blue-400 group-hover:text-black">📅</span>
              <span className="block text-[13px] italic text-white">Terminarz</span>
            </button>
            <button
              onClick={() => setShowReport(true)}
              className="group flex items-center gap-3 rounded-2xl border-t border-x border-b border-t-amber-500/40 border-x-amber-500/20 border-b-black/60 bg-amber-600/15 px-5 py-3 text-left uppercase tracking-tighter text-white backdrop-blur-sm transition-all hover:border-t-amber-400/60 hover:border-x-amber-400/30 hover:bg-amber-600/25 active:translate-y-[2px]"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/50 bg-black/45 text-amber-400 transition-colors group-hover:bg-amber-400 group-hover:text-black">📋</span>
              <span className="block text-[13px] italic text-white">Analiza trenera</span>
            </button>
            <button
              onClick={() => navigateTo(ViewState.DASHBOARD)}
              className="group flex items-center gap-3 rounded-2xl border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 bg-white/5 px-5 py-3 text-left uppercase tracking-tighter text-white backdrop-blur-sm transition-all hover:border-t-white/35 hover:border-x-white/20 hover:bg-white/10 active:translate-y-[2px]"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)' }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-black/45 text-white transition-colors group-hover:bg-white group-hover:text-black">←</span>
              <span className="block text-[13px] italic text-white">Powrót</span>
            </button>
          </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="px-2 py-2 text-left sticky left-0 bg-slate-800 z-10 whitespace-nowrap">Poz</th>
                <th className="px-2 py-2 text-left sticky left-[44px] bg-slate-800 z-10 whitespace-nowrap min-w-[130px]">Zawodnik</th>
                {ATTR_KEYS.map(key => (
                  <th key={key} title={ATTR_FULL_NAMES[key]} className="px-1 py-2 text-center whitespace-nowrap cursor-help">{ATTR_LABELS[key]}</th>
                ))}
                <th className="px-2 py-2 text-center whitespace-nowrap">Wiek</th>
                <th className="px-2 py-2 text-center whitespace-nowrap text-emerald-400">DEV</th>
              </tr>
            </thead>
            <tbody>
              {sortedReserves.map((player) => (
                <tr
                  key={player.id}
                  className={`${player.health.status === HealthStatus.INJURED || player.suspensionMatches > 0 ? 'bg-red-800/30 opacity-50' : POSITION_ROW_BG[player.position]} border-b border-slate-700/50 hover:brightness-110 transition-all cursor-pointer`}
                  onClick={() => viewPlayerDetails(player.id)}
                  onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, player }); }}
                >
                  <td className={`px-1 py-1.5 sticky left-0 z-10 ${player.health.status === HealthStatus.INJURED || player.suspensionMatches > 0 ? 'bg-red-800/30' : POSITION_ROW_BG[player.position]}`}>
                    <div className="relative group/pos w-8">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-center text-[8px] font-black italic leading-none tracking-tight ${POSITION_BADGE_STYLE[player.position]}`}>
                        {POSITION_LABEL[player.position]}
                      </div>
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 opacity-0 group-hover/pos:opacity-100 transition-opacity duration-150">
                        <div className="bg-slate-900 border border-slate-600 text-slate-100 text-[10px] font-black uppercase tracking-widest whitespace-nowrap px-2 py-1 rounded-lg shadow-xl">
                          {POSITION_FULL_NAME[player.position]}
                        </div>
                        <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-600 rotate-45 mx-auto -mt-1" />
                      </div>
                    </div>
                  </td>
                  <td className={`px-2 py-1.5 sticky left-[44px] z-10 whitespace-nowrap ${player.health.status === HealthStatus.INJURED || player.suspensionMatches > 0 ? 'bg-red-800/30' : POSITION_ROW_BG[player.position]}`}>
                    <span className={`font-semibold italic tracking-tight uppercase text-[15px] ${player.health.status === HealthStatus.INJURED || player.suspensionMatches > 0 ? 'text-slate-400' : 'text-slate-100'}`}>{player.firstName} {player.lastName}</span>
                    {player.health.status === HealthStatus.INJURED && (
                      <span className="ml-2 inline-flex items-center gap-0.5 text-red-400 font-black text-[11px] align-middle">
                        <span>✚</span>
                        <span>{player.health.injury?.daysRemaining}d</span>
                      </span>
                    )}
                    {player.suspensionMatches > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-3 h-4 bg-red-600 rounded-[2px] align-middle" />
                    )}
                  </td>
                  {ATTR_KEYS.map(key => {
                    const val = player.attributes[key];
                    const change = (player.stats.seasonalChanges?.[key as string] ?? 0);
                    const isTop = val >= 65;
                    const isWeak = isWeakForPosition(player.position, key, val);
                    const ringStyle = change > 0
                      ? { outline: '1px solid rgba(16,185,129,0.55)', backgroundColor: 'rgba(16,185,129,0.08)' }
                      : change < 0
                      ? { outline: '1px solid rgba(244,63,94,0.45)', backgroundColor: 'rgba(244,63,94,0.07)' }
                      : {};
                    return (
                      <td key={key} className={`px-1 py-1.5 text-center font-medium italic tracking-tight text-[11px] ${isTop ? 'text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]' : isWeak ? 'text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.5)]' : 'text-slate-100'}`} style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 1px rgba(0,0,0,1)', ...ringStyle }}>
                        {val}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5 text-center text-slate-300 font-medium">{player.age}</td>
                  {(() => {
                    const totalDev = Object.values(player.stats.seasonalChanges ?? {}).reduce((s, v) => s + v, 0);
                    const devColor = totalDev > 0 ? 'text-emerald-400' : totalDev < 0 ? 'text-red-400' : 'text-slate-500';
                    const devLabel = totalDev > 0 ? `+${totalDev}` : `${totalDev}`;
                    return (
                      <td className={`px-2 py-1.5 text-center font-black italic text-[11px] tabular-nums ${devColor}`}>
                        {totalDev === 0 ? '—' : devLabel}
                      </td>
                    );
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {contextMenu && (
      <div
        className="fixed z-[9999] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 min-w-[220px]"
        style={{ top: contextMenu.y, left: contextMenu.x }}
        onMouseLeave={() => setContextMenu(null)}
      >
        <button
          onClick={() => { moveToFirstTeam(contextMenu.player); setContextMenu(null); }}
          className="w-full px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-3"
        >
          <span className="text-base">↑</span> Przenieś do 1. drużyny
        </button>
        <div className="my-1 border-t border-white/10" />
        <button
          onClick={() => { viewPlayerDetails(contextMenu.player.id); setContextMenu(null); }}
          className="w-full px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-colors flex items-center gap-3"
        >
          <span className="text-base">👤</span> Karta zawodnika
        </button>
      </div>
    )}

    {showProgressModal && latestReserveProgress && (
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 px-4 py-4"
        onClick={() => {
          setShowProgressModal(false);
          setHoveredProgressPoint(null);
        }}
      >
        {hoveredProgressPoint && (
          <div
            className="pointer-events-none fixed z-[120] rounded-xl border border-emerald-300 bg-black px-4 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.75)]"
            style={{ left: hoveredProgressPoint.x + 16, top: hoveredProgressPoint.y + 16 }}
          >
            <p className="text-[13px] italic uppercase tracking-tighter text-emerald-300">Punkt {hoveredProgressPoint.index + 1}</p>
            <p className="text-[15px] italic uppercase tracking-tighter text-white">Data: {hoveredProgressPoint.point.label}</p>
            <p className="text-[15px] italic uppercase tracking-tighter text-white">Ogólne: {hoveredProgressPoint.point.overall}</p>
            <p
              className="text-[15px] italic uppercase tracking-tighter"
              style={{ color: hoveredProgressPoint.diff > 0 ? '#34d399' : hoveredProgressPoint.diff < 0 ? '#fb7185' : '#ffffff' }}
            >
              Wzrost/Spadek: {hoveredProgressPoint.diff > 0 ? `+${hoveredProgressPoint.diff}` : hoveredProgressPoint.diff}
            </p>
          </div>
        )}

        <div
          className="relative flex max-h-[78vh] w-[96vw] max-w-[1550px] flex-col overflow-hidden rounded-[20px] border border-emerald-400/35 bg-[#020617] shadow-[0_28px_90px_rgba(0,0,0,0.85)]"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between gap-5 border-b border-white/15 bg-black/45 px-6 py-4">
            <div>
              <p className="text-[13px] italic uppercase tracking-tighter text-emerald-300">Analiza rozwoju</p>
              <h2 className="text-3xl italic uppercase tracking-tighter text-white leading-none">Progres Rezerw</h2>
              <p className="mt-2 text-[13px] italic uppercase tracking-tighter text-white">
                {myClub?.name || 'Klub'} II / {reserves.length} zawodnikow / RAPORT: {latestReserveProgress.label}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-emerald-300/60 bg-emerald-500 px-4 py-2 text-black">
                <p className="text-[13px] italic uppercase tracking-tighter">Ogólne</p>
                <p className="text-2xl italic uppercase tracking-tighter leading-none">{latestReserveProgress.overall}</p>
              </div>
              <div
                className="rounded-xl border px-4 py-2 text-center"
                style={{
                  borderColor: reserveProgressDiff >= 0 ? '#34d399' : '#fb7185',
                  backgroundColor: reserveProgressDiff >= 0 ? 'rgba(16,185,129,0.18)' : 'rgba(244,63,94,0.18)',
                }}
              >
                <p className="text-[13px] italic uppercase tracking-tighter text-white">Wzrost/Spadek</p>
                <p
                  className="text-center text-2xl italic uppercase tracking-tighter leading-none"
                  style={{ color: reserveProgressDiff >= 0 ? '#34d399' : '#fb7185' }}
                >
                  {reserveProgressDiff > 0 ? `+${reserveProgressDiff}` : reserveProgressDiff}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowProgressModal(false);
                  setHoveredProgressPoint(null);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white text-lg text-black transition-all hover:scale-105 active:scale-95"
                aria-label="Zamknij modal progresu rezerw"
              >
                X
              </button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-5 lg:grid-cols-[460px_1fr]">
            <section className="flex min-h-0 flex-col rounded-2xl border border-white/15 bg-black/35 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl italic uppercase tracking-tighter text-white">Ogólne</h3>
                  <p className="text-[13px] italic uppercase tracking-tighter text-emerald-300">
                    {visibleReserveProgressPoints[0]?.label || latestReserveProgress.label} - {visibleReserveProgressPoints[visibleReserveProgressPoints.length - 1]?.label || latestReserveProgress.label}
                  </p>
                </div>
                <div className="flex rounded-xl border border-white/15 bg-black p-1">
                  {(['DAY', 'WEEK', 'MONTH'] as ProgressRange[]).map(range => (
                    <button
                      key={range}
                      onClick={() => {
                        setProgressRange(range);
                        setProgressWindowOffset(0);
                        setHoveredProgressPoint(null);
                      }}
                      className={`min-w-10 rounded-lg px-3 py-2 text-[13px] italic uppercase tracking-tighter transition-all ${
                        progressRange === range ? 'bg-emerald-400 text-black' : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {PROGRESS_RANGE_LABELS[range]}
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const data = visibleReserveProgressPoints.length > 0 ? visibleReserveProgressPoints : reserveProgressPoints;
                const W = 420;
                const H = 250;
                const PAD = { top: 26, right: 18, bottom: 48, left: 50 };
                const innerW = W - PAD.left - PAD.right;
                const innerH = H - PAD.top - PAD.bottom;
                const minVal = Math.min(...data.map(point => point.overall)) - 1;
                const maxVal = Math.max(...data.map(point => point.overall)) + 1;
                const valueRange = maxVal - minVal || 1;
                const toX = (i: number) => PAD.left + (i / Math.max(1, data.length - 1)) * innerW;
                const toY = (v: number) => PAD.top + innerH - ((v - minVal) / valueRange) * innerH;
                const points = data.map((point, i) => `${toX(i)},${toY(point.overall)}`).join(' ');
                const areaPoints = `${toX(0)},${PAD.top + innerH} ${points} ${toX(data.length - 1)},${PAD.top + innerH}`;
                const labelIndexes = data.length <= 6
                  ? data.map((_, i) => i)
                  : [0, Math.floor((data.length - 1) / 2), data.length - 1];

                return (
                  <div className="rounded-2xl border border-white/15 bg-black/55 p-3">
                    <svg
                      viewBox={`0 0 ${W} ${H}`}
                      width="100%"
                      height={H}
                      role="img"
                      aria-label="Wykres liniowy ogólne rezerw"
                      onMouseLeave={() => setHoveredProgressPoint(null)}
                      style={{ display: 'block' }}
                    >
                      <defs>
                        <linearGradient id="reserveProgressModalFillCompact" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      {[0, 0.5, 1].map((t, i) => {
                        const y = PAD.top + innerH * (1 - t);
                        const val = Math.round(minVal + valueRange * t);
                        return (
                          <g key={i}>
                            <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                            <text x={PAD.left - 10} y={y + 5} fill="#ffffff" fontSize="13" textAnchor="end" fontStyle="italic">{val}</text>
                          </g>
                        );
                      })}

                      <polygon points={areaPoints} fill="url(#reserveProgressModalFillCompact)" />
                      <polyline points={points} fill="none" stroke="#34d399" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />

                      {labelIndexes.map(index => (
                        <text key={index} x={toX(index)} y={H - 14} fill="#ffffff" fontSize="13" textAnchor="middle" fontStyle="italic">
                          {progressRange === 'DAY' ? formatProgressShortDate(data[index].date) : data[index].label}
                        </text>
                      ))}

                      {data.map((point, index) => {
                        const diff = index === 0 ? 0 : point.overall - data[index - 1].overall;
                        const fill = index === data.length - 1 ? '#34d399' : '#020617';
                        return (
                          <g key={`${point.date}-${index}`}>
                            <circle
                              cx={toX(index)}
                              cy={toY(point.overall)}
                              r={6.5}
                              fill={fill}
                              stroke="#34d399"
                              strokeWidth="3"
                              cursor="pointer"
                              onMouseEnter={e => setHoveredProgressPoint({ x: e.clientX, y: e.clientY, index, point, diff })}
                              onMouseMove={e => setHoveredProgressPoint({ x: e.clientX, y: e.clientY, index, point, diff })}
                            />
                            <text x={toX(index)} y={toY(point.overall) - 12} fill="#ffffff" fontSize="13" textAnchor="middle" fontStyle="italic">
                              {point.overall}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })()}

              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  onClick={() => setProgressWindowOffset(prev => prev + 1)}
                  disabled={!canShiftProgressLeft}
                  className="rounded-xl border border-white/20 bg-white px-4 py-2 text-[13px] italic uppercase tracking-tighter text-black transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ←
                </button>
                <p className="text-center text-[13px] italic uppercase tracking-tighter text-white">
                  {visibleReserveProgressPoints.length} / {rangedReserveProgressPoints.length}
                </p>
                <button
                  onClick={() => setProgressWindowOffset(prev => Math.max(0, prev - 1))}
                  disabled={!canShiftProgressRight}
                  className="rounded-xl border border-white/20 bg-white px-4 py-2 text-[13px] italic uppercase tracking-tighter text-black transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  →
                </button>
              </div>
            </section>

            <section className="flex min-h-0 flex-col rounded-2xl border border-white/15 bg-black/35">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <h3 className="text-xl italic uppercase tracking-tighter text-white">Atrybuty</h3>
                <div className="flex gap-3 text-[13px] italic uppercase tracking-tighter">
                  <span className="text-emerald-300">+{reserveAttributeChanges.filter(stat => stat.total > 0).length}</span>
                  <span className="text-rose-300">-{reserveAttributeChanges.filter(stat => stat.total < 0).length}</span>
                  <span className="text-white">0:{reserveAttributeChanges.filter(stat => stat.total === 0).length}</span>
                </div>
              </div>

              <div className="custom-scrollbar grid flex-1 grid-cols-1 gap-1.5 overflow-y-auto p-2 xl:grid-cols-2">
                {reserveAttributeChanges.map(stat => {
                  const isPositive = stat.total > 0;
                  const isNegative = stat.total < 0;
                  const barWidth = `${Math.max(stat.total === 0 ? 2 : 6, (Math.abs(stat.total) / maxAttributeChange) * 50)}%`;
                  const valueColor = isPositive ? '#34d399' : isNegative ? '#fb7185' : '#ffffff';
                  return (
                    <div key={stat.key} className="grid grid-cols-[118px_1fr_86px] items-center gap-2 rounded-lg border border-white/15 bg-black/55 px-2.5 py-1">
                      <div>
                        <p className="truncate text-[11px] italic uppercase tracking-tighter text-white" title={stat.name}>{stat.name}</p>
                      </div>
                      <div className="relative h-5 overflow-hidden rounded-md border border-white/20 bg-black">
                        <div className="absolute bottom-0 left-1/2 top-0 w-px bg-white" />
                        {isPositive && (
                          <div className="absolute bottom-0 left-1/2 top-0 bg-emerald-400" style={{ width: barWidth }} />
                        )}
                        {isNegative && (
                          <div className="absolute bottom-0 right-1/2 top-0 bg-rose-400" style={{ width: barWidth }} />
                        )}
                        {!isPositive && !isNegative && (
                          <div className="absolute bottom-0 left-1/2 top-0 -translate-x-1/2 bg-white" style={{ width: barWidth }} />
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] italic uppercase tracking-tighter leading-none text-white">Suma</p>
                        <p className="text-[15px] italic uppercase tracking-tighter leading-none tabular-nums" style={{ color: valueColor }}>
                          {stat.total > 0 ? `+${stat.total}` : stat.total}
                        </p>
                        <p className="mt-0.5 text-[10px] italic uppercase tracking-tighter leading-none text-white">
                          Sr/zaw {stat.average > 0 ? `+${stat.average.toFixed(1)}` : stat.average.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    )}

    {showScheduleModal && (
      <ReserveScheduleModal onClose={() => setShowScheduleModal(false)} />
    )}

    {showReport && weeklyReport && (
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80"
        onClick={() => setShowReport(false)}
      >
        <div
          className="relative w-full max-w-2xl mx-4 bg-slate-900 border border-white/10 rounded-[32px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* gradient top bar */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

          {/* header */}
          <div className="flex items-center justify-between px-7 pt-7 pb-4 border-b border-white/5 shrink-0">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.45em] text-amber-500 mb-1">📋 Raport tygodniowy</p>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">Trener Rezerw</h2>
            </div>
            <button
              onClick={() => setShowReport(false)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-sm font-black"
            >
              ✕
            </button>
          </div>

          {/* scrollable body */}
          <div className="overflow-y-auto px-7 py-5 space-y-6">
            {/* intro */}
            <p className="text-[13px] text-slate-300 italic leading-relaxed border-l-2 border-slate-600 pl-4">
              {weeklyReport.intro}
            </p>

            {/* highlights */}
            {weeklyReport.highlights.length > 0 && (
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-amber-500 mb-3">◆ Na uwagę zasługują</p>
                <div className="space-y-3">
                  {weeklyReport.highlights.map(e => (
                    <div
                      key={e.player.id}
                      className="bg-slate-800/60 rounded-2xl px-4 py-3 cursor-pointer hover:bg-slate-800 transition-colors border border-white/5"
                      onClick={() => { viewPlayerDetails(e.player.id); setShowReport(false); }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-center text-[7px] font-black italic leading-none ${POSITION_BADGE_STYLE[e.player.position]}`}>
                          {POSITION_LABEL[e.player.position]}
                        </div>
                        <span className={`text-sm font-black italic uppercase tracking-tight ${e.tier === 'gem' ? 'text-amber-300' : 'text-white'}`}>
                          {e.player.firstName} {e.player.lastName}
                        </span>
                        {e.tier === 'gem' && (
                          <span className="text-[7px] font-black uppercase tracking-widest text-amber-500 border border-amber-700/50 rounded px-1.5 py-0.5">★ TALENT</span>
                        )}
                        <span className="text-[9px] text-slate-500 ml-auto">{e.player.age} lat</span>
                      </div>
                      <p className="text-[12px] text-slate-300 leading-relaxed">
                        Myślę, że na uwagę zasługuje <span className={`font-bold ${e.tier === 'gem' ? 'text-amber-300' : 'text-white'}`}>{e.player.firstName} {e.player.lastName}</span>, ponieważ <span className="italic text-slate-400">{e.note}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* concerns */}
            {weeklyReport.concerns.length > 0 && (
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-red-500 mb-3">⚠ Niepokoi mnie</p>
                <div className="space-y-3">
                  {weeklyReport.concerns.map(e => (
                    <div
                      key={e.player.id}
                      className="bg-red-950/30 rounded-2xl px-4 py-3 cursor-pointer hover:bg-red-950/50 transition-colors border border-red-900/30"
                      onClick={() => { viewPlayerDetails(e.player.id); setShowReport(false); }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-center text-[7px] font-black italic leading-none ${POSITION_BADGE_STYLE[e.player.position]}`}>
                          {POSITION_LABEL[e.player.position]}
                        </div>
                        <span className="text-sm font-black italic uppercase tracking-tight text-red-300">
                          {e.player.firstName} {e.player.lastName}
                        </span>
                        <span className="text-[9px] text-slate-500 ml-auto">{e.player.age} lat</span>
                      </div>
                      <p className="text-[12px] text-slate-300 leading-relaxed">
                        Martwi mnie <span className="font-bold text-red-300">{e.player.firstName} {e.player.lastName}</span> — <span className="italic text-slate-400">{e.note}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};
