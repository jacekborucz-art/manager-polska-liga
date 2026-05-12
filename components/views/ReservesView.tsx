import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { PlayerPosition, PlayerAttributes, ViewState, Player, ReserveProgressPoint, HealthStatus } from '../../types';
import { Button } from '../ui/Button';
import rezerwyBg from '../../Graphic/themes/rezerwy.png';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { ReserveScheduleModal } from '../modals/ReserveScheduleModal';
import { PlayerCareerService } from '../../services/PlayerCareerService';
import { TacticRepository } from '../../resources/tactics_db';

const POSITION_LABEL: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'BR',
  [PlayerPosition.DEF]: 'OBR',
  [PlayerPosition.MID]: 'POM',
  [PlayerPosition.FWD]: 'NAP',
};

const RESERVE_ROW_BG = 'bg-slate-950/35';

const ATTR_KEYS: (keyof PlayerAttributes)[] = [
  'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking',
  'finishing', 'technique', 'vision', 'dribbling', 'heading', 'positioning',
  'goalkeeping', 'freeKicks', 'talent', 'penalties', 'corners', 'aggression',
  'crossing', 'leadership', 'mentality', 'workRate',
];

const RESERVE_TABLE_COLUMN_COUNT = ATTR_KEYS.length + 4;

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
  [PlayerPosition.GK]:  'border border-yellow-300/70 bg-[radial-gradient(circle_at_35%_25%,rgba(254,240,138,0.75),rgba(234,179,8,0.32)_42%,rgba(113,63,18,0.82)_100%)] text-yellow-50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-3px_6px_rgba(0,0,0,0.42),0_3px_0_rgba(113,63,18,0.8),0_7px_12px_rgba(0,0,0,0.45)]',
  [PlayerPosition.DEF]: 'border border-blue-300/70 bg-[radial-gradient(circle_at_35%_25%,rgba(147,197,253,0.85),rgba(37,99,235,0.42)_42%,rgba(30,58,138,0.86)_100%)] text-blue-50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_-3px_6px_rgba(0,0,0,0.42),0_3px_0_rgba(30,58,138,0.85),0_7px_12px_rgba(0,0,0,0.45)]',
  [PlayerPosition.MID]: 'border border-emerald-300/70 bg-[radial-gradient(circle_at_35%_25%,rgba(110,231,183,0.85),rgba(16,185,129,0.42)_42%,rgba(6,95,70,0.86)_100%)] text-emerald-50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_-3px_6px_rgba(0,0,0,0.42),0_3px_0_rgba(6,95,70,0.85),0_7px_12px_rgba(0,0,0,0.45)]',
  [PlayerPosition.FWD]: 'border border-red-300/70 bg-[radial-gradient(circle_at_35%_25%,rgba(252,165,165,0.88),rgba(239,68,68,0.45)_42%,rgba(127,29,29,0.88)_100%)] text-red-50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_-3px_6px_rgba(0,0,0,0.42),0_3px_0_rgba(127,29,29,0.85),0_7px_12px_rgba(0,0,0,0.45)]',
};

const GOALKEEPER_KIT_COLORS = ['#16a34a', '#facc15', '#ec4899', '#dc2626', '#14b8a6', '#d6b48c', '#f97316'];

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

const formatReservePanelDate = (date: string): string => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
  });
};

const getReserveResultDisplay = (result: { isUserHome: boolean; homeScore: number; awayScore: number }) => {
  const userScore = result.isUserHome ? result.homeScore : result.awayScore;
  const opponentScore = result.isUserHome ? result.awayScore : result.homeScore;
  const colorClass = userScore > opponentScore
    ? 'text-emerald-300'
    : userScore === opponentScore
    ? 'text-amber-300'
    : 'text-rose-300';

  return {
    label: `${userScore}:${opponentScore}`,
    colorClass,
  };
};

const getReserveAverageRating = (player: Player): number => {
  const reserveStats = player.reserveStats;
  if (reserveStats?.matches) return reserveStats.totalRatingPoints / reserveStats.matches;

  const ratings = player.stats.ratingHistory ?? [];
  if (!ratings.length) return 0;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
};

const getReserveTopPlayerScore = (player: Player): number => (
  player.overallRating + getReserveAverageRating(player) * 10 + player.attributes.talent
);

const getReserveDevTotal = (player: Player): number => (
  Object.values(player.stats.seasonalChanges ?? {}).reduce((sum, value) => sum + value, 0)
);

const getFirstTeamReadiness = (player: Player): { label: string; colorClass: string; score: number } => {
  const score = (
    player.overallRating
    + player.attributes.talent * 0.45
    + Math.max(0, getReserveAverageRating(player) - 6) * 8
    + Math.max(0, getReserveDevTotal(player)) * 0.15
  );

  if (score >= 118 || player.overallRating >= 66) {
    return { label: 'Gotowy', colorClass: 'text-emerald-300', score };
  }

  if (score >= 108 || player.overallRating >= 62) {
    return { label: 'Blisko', colorClass: 'text-amber-300', score };
  }

  return { label: 'Obserwuj', colorClass: 'text-blue-300', score };
};

const resolveReserveTactic = (tacticNameOrId?: string | null) => {
  const allTactics = TacticRepository.getAll();
  return allTactics.find(tactic => tactic.id === tacticNameOrId || tactic.name === tacticNameOrId)
    ?? TacticRepository.getDefault();
};

const pickReservePitchLineup = (players: Player[], tactic = TacticRepository.getDefault()) => {
  const available = [...players].sort((a, b) => b.overallRating - a.overallRating);
  const used = new Set<string>();

  return tactic.slots.map(slot => {
    const preferred = available.find(player => !used.has(player.id) && player.position === slot.role);
    const fallback = available.find(player => !used.has(player.id));
    const player = preferred ?? fallback ?? null;
    if (player) used.add(player.id);
    return { slot, player };
  });
};

const ReservePlayerKitFigure: React.FC<{ shirtColor: string; shortsColor: string }> = ({ shirtColor, shortsColor }) => (
  <span className="relative block h-16 w-16" aria-hidden="true">
    <span
      className="absolute left-1/2 top-1 flex h-[39px] w-[50px] -translate-x-1/2 border border-white/20"
      style={{
        background: shirtColor,
        clipPath: 'polygon(24% 0, 76% 0, 100% 22%, 86% 48%, 78% 36%, 78% 100%, 22% 100%, 22% 36%, 14% 48%, 0 22%)',
      }}
    />
    <span className="absolute bottom-1 left-1/2 h-[19px] w-[35px] -translate-x-1/2">
      <span
        className="absolute left-0 top-0 h-1.5 w-full border border-white/15"
        style={{ background: shortsColor }}
      />
      <span
        className="absolute bottom-0 left-0 h-3.5 w-[17px] border border-white/15"
        style={{ background: shortsColor }}
      />
      <span
        className="absolute bottom-0 right-0 h-3.5 w-[17px] border border-white/15"
        style={{ background: shortsColor }}
      />
    </span>
  </span>
);

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
          coaches, viewCoachDetails, reserveCoachId, reserveProgressHistory,
          reserveFixtures, reserveMatchResults } = useGame();
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

  const reserveTactic = useMemo(
    () => resolveReserveTactic(reserveCoach?.favoriteTactics.neutral ?? reserveCoach?.favoriteTactics.offensive),
    [reserveCoach]
  );

  const projectedReserveLineup = useMemo(
    () => pickReservePitchLineup(sortedReserves, reserveTactic),
    [sortedReserves, reserveTactic]
  );

  const reserveFieldKitColors = useMemo(() => {
    const fieldPlayer = projectedReserveLineup.find(({ slot, player }) => (
      player && slot.role !== PlayerPosition.GK && player.position !== PlayerPosition.GK
    ))?.player;
    const fieldClub = clubs.find(club => club.id === fieldPlayer?.clubId)
      ?? clubs.find(club => club.id === userTeamId);

    return [fieldClub?.colorsHex?.[0], fieldClub?.colorsHex?.[1]].filter((color): color is string => Boolean(color));
  }, [clubs, projectedReserveLineup, userTeamId]);

  const reserveGoalkeeperKitColor = useMemo(
    () => pickContrastingGoalkeeperKitColor(reserveFieldKitColors),
    [reserveFieldKitColors]
  );

  const getPitchPlayerKitColors = (player: Player) => {
    const playerClub = clubs.find(club => club.id === player.clubId)
      ?? clubs.find(club => club.id === userTeamId);
    const primary = playerClub?.colorsHex?.[0] ?? '#111827';
    const secondary = playerClub?.colorsHex?.[1] ?? primary;
    const isGoalkeeper = player.position === PlayerPosition.GK;
    const shirt = isGoalkeeper ? reserveGoalkeeperKitColor : primary;
    const shorts = isGoalkeeper ? reserveGoalkeeperKitColor : secondary;

    return {
      shirt,
      shorts,
      text: getReadableBadgeTextColor([shirt]),
    };
  };

  const seasonReserveFixtures = useMemo(() => (
    reserveFixtures.filter(fixture => {
      const result = fixture.resultId ? reserveMatchResults.find(match => match.id === fixture.resultId) : null;
      return !result || result.season === seasonNumber || fixture.id.includes(`_${seasonNumber}_`);
    })
  ), [reserveFixtures, reserveMatchResults, seasonNumber]);

  const reservePanelMatches = useMemo(() => {
    const withResults = seasonReserveFixtures
      .map(fixture => ({
        fixture,
        result: fixture.resultId ? reserveMatchResults.find(match => match.id === fixture.resultId) ?? null : null,
      }));

    const played = withResults
      .filter(item => item.result)
      .sort((a, b) => new Date(b.result?.date ?? b.fixture.date).getTime() - new Date(a.result?.date ?? a.fixture.date).getTime())
      .slice(0, 5);

    const upcoming = withResults
      .filter(item => !item.result && new Date(item.fixture.date).getTime() >= currentDate.getTime())
      .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())
      .slice(0, 3);

    return { played, upcoming };
  }, [currentDate, reserveMatchResults, seasonReserveFixtures]);

  const reserveHighlights = useMemo(() => {
    const topPlayers = [...reserves]
      .sort((a, b) => getReserveTopPlayerScore(b) - getReserveTopPlayerScore(a))
      .slice(0, 3);

    const topScorer = [...reserves]
      .sort((a, b) => (b.reserveStats?.goals ?? 0) - (a.reserveStats?.goals ?? 0) || b.overallRating - a.overallRating)[0] ?? null;
    const topAssistant = [...reserves]
      .sort((a, b) => (b.reserveStats?.assists ?? 0) - (a.reserveStats?.assists ?? 0) || b.overallRating - a.overallRating)[0] ?? null;
    const topRated = [...reserves]
      .filter(player => getReserveAverageRating(player) > 0)
      .sort((a, b) => getReserveAverageRating(b) - getReserveAverageRating(a) || b.overallRating - a.overallRating)[0] ?? null;
    const progressPlayers = [...reserves]
      .map(player => ({ player, dev: getReserveDevTotal(player) }))
      .filter(item => item.dev > 0)
      .sort((a, b) => (
        b.dev - a.dev
        || b.player.attributes.talent - a.player.attributes.talent
        || b.player.overallRating - a.player.overallRating
      ))
      .slice(0, 3);
    const firstTeamReady = [...reserves]
      .map(player => ({ player, readiness: getFirstTeamReadiness(player) }))
      .sort((a, b) => b.readiness.score - a.readiness.score || b.player.overallRating - a.player.overallRating)
      .slice(0, 3);

    return {
      topPlayers,
      topScorer: topScorer && (topScorer.reserveStats?.goals ?? 0) > 0 ? topScorer : null,
      topAssistant: topAssistant && (topAssistant.reserveStats?.assists ?? 0) > 0 ? topAssistant : null,
      topRated,
      progressPlayers,
      firstTeamReady,
    };
  }, [reserves]);

  const reserveAverageProfile = useMemo(() => {
    if (reserves.length === 0) {
      return {
        age: 0,
        overall: 0,
        talent: 0,
        rating: 0,
        dev: 0,
      };
    }

    const totals = reserves.reduce((sum, player) => ({
      age: sum.age + player.age,
      overall: sum.overall + player.overallRating,
      talent: sum.talent + player.attributes.talent,
      rating: sum.rating + getReserveAverageRating(player),
      dev: sum.dev + getReserveDevTotal(player),
    }), {
      age: 0,
      overall: 0,
      talent: 0,
      rating: 0,
      dev: 0,
    });

    return {
      age: totals.age / reserves.length,
      overall: totals.overall / reserves.length,
      talent: totals.talent / reserves.length,
      rating: totals.rating / reserves.length,
      dev: totals.dev / reserves.length,
    };
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

  const getReserveHighlightKit = (player: Player | null) => {
    const playerClub = player
      ? clubs.find(club => club.id === player.clubId) ?? myClub
      : myClub;
    const shirtColor = playerClub?.colorsHex?.[0] ?? '#2563eb';
    const shortsColor = playerClub?.colorsHex?.[1] ?? shirtColor;
    return {
      shirtColor,
      shortsColor,
    };
  };

  const renderReserveHighlightCard = (label: string, player: Player | null, details: string[] = []) => {
    const kit = getReserveHighlightKit(player);

    return (
      <button
        key={`${label}-${player?.id ?? 'empty'}`}
        type="button"
        disabled={!player}
        onClick={() => player && viewPlayerDetails(player.id)}
        className="group flex min-h-[118px] min-w-0 flex-col items-center justify-end rounded-lg border border-white/10 bg-white/[0.04] px-2 pb-2.5 pt-2 text-center transition-colors hover:border-blue-300/35 hover:bg-blue-500/10 disabled:cursor-default disabled:hover:border-white/10 disabled:hover:bg-white/[0.04]"
      >
        <p className="mb-1 font-black italic uppercase tracking-tighter text-[10px] text-blue-300">{label}</p>
        <ReservePlayerKitFigure shirtColor={kit.shirtColor} shortsColor={kit.shortsColor} />
        <p className="mt-1 max-w-full truncate font-black italic uppercase tracking-tighter text-[10px] leading-tight text-white">
          {player ? `${player.firstName} ${player.lastName}` : 'Brak danych'}
        </p>
        {player && details.length > 0 && (
          <div className="mt-1 flex max-w-full flex-wrap justify-center gap-x-2 gap-y-0.5">
            {details.map(detail => (
              <span key={detail} className="font-black italic uppercase tracking-tighter text-[9px] leading-none text-slate-400">
                {detail}
              </span>
            ))}
          </div>
        )}
      </button>
    );
  };

  const renderReserveMiniRow = (
    player: Player | null,
    subLabel: string,
    valueLabel: string,
    valueColorClass = 'text-slate-300'
  ) => (
    <button
      type="button"
      disabled={!player}
      onClick={() => player && viewPlayerDetails(player.id)}
      className="grid min-h-[38px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 rounded-md border border-white/10 bg-white/[0.035] px-2 py-1.5 text-left transition-colors hover:border-blue-300/35 hover:bg-blue-500/10 disabled:cursor-default disabled:hover:border-white/10 disabled:hover:bg-white/[0.035]"
    >
      <span className="truncate font-black italic uppercase tracking-tighter text-[10px] leading-none text-white">
        {player ? `${player.firstName} ${player.lastName}` : 'Brak danych'}
      </span>
      <span className={`font-black italic uppercase tracking-tighter text-[10px] leading-none ${player ? valueColorClass : 'text-slate-500'}`}>
        {player ? valueLabel : '-'}
      </span>
      <span className="truncate font-black italic uppercase tracking-tighter text-[9px] leading-none text-slate-500">
        {player ? subLabel : ''}
      </span>
    </button>
  );

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

        <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_450px_360px]">
        <div className="min-w-0 overflow-x-auto rounded-lg border border-slate-700 bg-slate-950/20">
          <table className="w-max min-w-[1040px] border-collapse text-[10px]">
            <thead>
              <tr className="bg-slate-800 text-slate-400 uppercase tracking-tight">
                <th className="px-1 py-1.5 text-left sticky left-0 bg-slate-800 z-10 whitespace-nowrap w-10">Poz</th>
                <th className="px-1.5 py-1.5 text-left sticky left-10 bg-slate-800 z-10 whitespace-nowrap w-[194px]">Zawodnik</th>
                {ATTR_KEYS.map(key => (
                  <th key={key} title={ATTR_FULL_NAMES[key]} className="w-8 min-w-8 max-w-8 px-0 py-1.5 text-center font-black italic tracking-tighter text-[9px] whitespace-nowrap cursor-help">{ATTR_LABELS[key]}</th>
                ))}
                <th className="w-9 px-0 py-1.5 text-center font-black italic tracking-tighter text-[9px] whitespace-nowrap">Wiek</th>
                <th className="w-9 px-0 py-1.5 text-center font-black italic tracking-tighter text-[9px] whitespace-nowrap text-emerald-400">DEV</th>
              </tr>
            </thead>
            <tbody>
              {sortedReserves.map((player, index) => {
                const isUnavailable = player.health.status === HealthStatus.INJURED || player.suspensionMatches > 0;
                const startsPositionGroup = index > 0 && sortedReserves[index - 1].position !== player.position;
                const rowBg = isUnavailable ? 'bg-red-800/30' : RESERVE_ROW_BG;

                return (
                  <React.Fragment key={player.id}>
                    {startsPositionGroup && (
                      <tr aria-hidden="true">
                        <td colSpan={RESERVE_TABLE_COLUMN_COUNT} className="h-px bg-white/20 p-0" />
                      </tr>
                    )}
                    <tr
                  className={`${rowBg} ${isUnavailable ? 'opacity-50' : ''} border-b border-slate-700/45 hover:bg-slate-900/55 transition-all cursor-pointer`}
                  onClick={() => viewPlayerDetails(player.id)}
                  onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, player }); }}
                >
                  <td className={`px-1 py-1 sticky left-0 z-10 ${rowBg}`}>
                    <div className="relative group/pos w-7">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-center text-[7px] font-black italic leading-none tracking-tight ${POSITION_BADGE_STYLE[player.position]}`}>
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
                  <td className={`px-1.5 py-1 sticky left-10 z-10 whitespace-nowrap w-[194px] max-w-[194px] ${rowBg}`}>
                    <span title={`${player.firstName} ${player.lastName}`} className={`block max-w-[176px] truncate font-medium italic tracking-tighter uppercase text-[13px] leading-tight ${isUnavailable ? 'text-slate-400' : 'text-slate-100'}`}>{player.firstName} {player.lastName}</span>
                    {player.health.status === HealthStatus.INJURED && (
                      <span className="ml-1 inline-flex items-center gap-0.5 text-red-400 font-black text-[9px] align-middle">
                        <span>✚</span>
                        <span>{player.health.injury?.daysRemaining}d</span>
                      </span>
                    )}
                    {player.suspensionMatches > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center w-2.5 h-3.5 bg-red-600 rounded-[2px] align-middle" />
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
                      <td key={key} className={`w-8 min-w-8 max-w-8 px-0 py-1 text-center font-black italic tracking-tighter text-[9px] ${isTop ? 'text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]' : isWeak ? 'text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.5)]' : 'text-slate-100'}`} style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 1px rgba(0,0,0,1)', ...ringStyle }}>
                        {val}
                      </td>
                    );
                  })}
                  <td className="w-9 px-0 py-1 text-center text-[9px] text-slate-300 font-black italic tabular-nums">{player.age}</td>
                  {(() => {
                    const totalDev = Object.values(player.stats.seasonalChanges ?? {}).reduce((s, v) => s + v, 0);
                    const devColor = totalDev > 0 ? 'text-emerald-400' : totalDev < 0 ? 'text-red-400' : 'text-slate-500';
                    const devLabel = totalDev > 0 ? `+${totalDev}` : `${totalDev}`;
                    return (
                        <td className={`w-9 px-0 py-1 text-center font-black italic text-[9px] tabular-nums ${devColor}`}>
                        {totalDev === 0 ? '—' : devLabel}
                      </td>
                    );
                  })()}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <section className="flex min-h-0 flex-col gap-3 rounded-lg border border-white/10 bg-slate-950/55 p-3 shadow-2xl backdrop-blur-sm">
          <div>
            <h2 className="font-black italic uppercase tracking-tighter text-xl leading-none text-white">Liderzy</h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              renderReserveHighlightCard(
                `Top ${index + 1}`,
                reserveHighlights.topPlayers[index] ?? null,
                reserveHighlights.topPlayers[index]
                  ? [`OVR ${reserveHighlights.topPlayers[index].overallRating}`, `${reserveHighlights.topPlayers[index].age} lat`]
                  : []
              )
            ))}
          </div>

          <div className="h-px bg-white/10" />

          <div className="grid grid-cols-2 gap-2">
            {renderReserveHighlightCard(
              'Top strzelec',
              reserveHighlights.topScorer,
              reserveHighlights.topScorer
                ? [`${reserveHighlights.topScorer.age} lat`, `${reserveHighlights.topScorer.reserveStats?.goals ?? 0} goli`]
                : []
            )}
            {renderReserveHighlightCard(
              'Top asystent',
              reserveHighlights.topAssistant,
              reserveHighlights.topAssistant
                ? [`${reserveHighlights.topAssistant.age} lat`, `${reserveHighlights.topAssistant.reserveStats?.assists ?? 0} asyst`]
                : []
            )}
          </div>

          <div className="h-px bg-white/10" />

          {renderReserveHighlightCard(
            'Najwyższa ocena',
            reserveHighlights.topRated,
            reserveHighlights.topRated
              ? [`${reserveHighlights.topRated.age} lat`, `Śr. ${getReserveAverageRating(reserveHighlights.topRated).toFixed(2)}`]
              : []
          )}

          <div className="h-px bg-white/10" />

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
              <p className="mb-1.5 font-black italic uppercase tracking-tighter text-[10px] leading-none text-blue-300">Progres</p>
              <div className="space-y-1">
                {Array.from({ length: 3 }, (_, index) => {
                  const item = reserveHighlights.progressPlayers[index];
                  return (
                    <React.Fragment key={`progress-${item?.player.id ?? index}`}>
                      {renderReserveMiniRow(
                        item?.player ?? null,
                        item ? `${item.player.age} lat` : '',
                        item ? `+${item.dev}` : '-',
                        'text-emerald-300'
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
              <p className="mb-1.5 font-black italic uppercase tracking-tighter text-[10px] leading-none text-blue-300">Pierwsza drużyna</p>
              <div className="space-y-1">
                {Array.from({ length: 3 }, (_, index) => {
                  const item = reserveHighlights.firstTeamReady[index];
                  return (
                    <React.Fragment key={`ready-${item?.player.id ?? index}`}>
                      {renderReserveMiniRow(
                        item?.player ?? null,
                        item ? `OVR ${item.player.overallRating}` : '',
                        item?.readiness.label ?? '-',
                        item?.readiness.colorClass ?? 'text-slate-500'
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          <div className="rounded-lg border border-cyan-300/15 bg-cyan-950/10 p-2.5">
            <p className="mb-2 font-black italic uppercase tracking-tighter text-[10px] leading-none text-cyan-300">Średni profil rezerw</p>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { label: 'Wiek', value: reserves.length ? reserveAverageProfile.age.toFixed(1) : '-' },
                { label: 'OVR', value: reserves.length ? reserveAverageProfile.overall.toFixed(1) : '-' },
                { label: 'Talent', value: reserves.length ? reserveAverageProfile.talent.toFixed(1) : '-' },
                { label: 'Ocena', value: reserves.length && reserveAverageProfile.rating > 0 ? reserveAverageProfile.rating.toFixed(2) : '-' },
                { label: 'DEV', value: reserves.length && reserveAverageProfile.dev !== 0 ? `${reserveAverageProfile.dev > 0 ? '+' : ''}${reserveAverageProfile.dev.toFixed(1)}` : '-' },
              ].map(item => (
                <div key={item.label} className="rounded-md border border-white/10 bg-white/[0.035] px-1.5 py-2 text-center">
                  <p className="font-black italic uppercase tracking-tighter text-[9px] leading-none text-slate-500">{item.label}</p>
                  <p className="mt-1 font-black italic uppercase tracking-tighter text-[13px] leading-none text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col gap-3 rounded-lg border border-white/10 bg-slate-950/55 p-3 shadow-2xl backdrop-blur-sm">
          <section className="rounded-lg border border-emerald-400/20 bg-emerald-950/20 p-3">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="font-black italic uppercase tracking-tighter text-[10px] text-emerald-300">Taktyka rezerw</p>
                <h2 className="font-black italic uppercase tracking-tighter text-xl leading-none text-white">{reserveTactic.id}</h2>
              </div>
              <div className="text-right">
                <p className="font-black italic uppercase tracking-tighter text-[9px] text-slate-400">Styl</p>
                <p className="font-black italic uppercase tracking-tighter text-[11px] text-white">{reserveTactic.category}</p>
              </div>
            </div>

            <div className="relative h-[330px] overflow-hidden rounded-lg border border-white/15 bg-[linear-gradient(180deg,rgba(16,185,129,0.38),rgba(6,78,59,0.42))]">
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

              {projectedReserveLineup.map(({ slot, player }) => {
                const kit = player ? getPitchPlayerKitColors(player) : null;

                return (
                  <button
                    key={slot.index}
                    type="button"
                    disabled={!player}
                    onClick={() => player && viewPlayerDetails(player.id)}
                    title={player ? `${player.firstName} ${player.lastName}` : POSITION_FULL_NAME[slot.role]}
                    className={`absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-transform ${player ? 'hover:scale-110' : 'opacity-45'}`}
                    style={{ left: `${slot.x * 100}%`, top: `${slot.y * 100}%` }}
                  >
                    {kit ? (
                      <span className="relative block h-11 w-11 drop-shadow-[0_8px_10px_rgba(0,0,0,0.5)]">
                        <span
                          className="absolute left-1/2 top-0 flex h-7 w-9 -translate-x-1/2 items-center justify-center border border-white/30 text-[8px] font-black italic uppercase tracking-tighter shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_-4px_7px_rgba(0,0,0,0.38),0_2px_0_rgba(0,0,0,0.45)]"
                          style={{
                            background: `radial-gradient(circle at 35% 18%, rgba(255,255,255,0.34), transparent 34%), ${kit.shirt}`,
                            color: kit.text,
                            clipPath: 'polygon(24% 0, 76% 0, 100% 22%, 86% 47%, 78% 36%, 78% 100%, 22% 100%, 22% 36%, 14% 47%, 0 22%)',
                            textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                          }}
                        >
                          {`${player.firstName[0]}${player.lastName[0]}`}
                        </span>
                        <span className="absolute bottom-1 left-1/2 h-3 w-6 -translate-x-1/2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]">
                          <span
                            className="absolute left-0 top-0 h-1 w-full border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]"
                            style={{ background: kit.shorts }}
                          />
                          <span
                            className="absolute bottom-0 left-0 h-2 w-[11px] border border-white/20 shadow-[inset_0_-2px_3px_rgba(0,0,0,0.32)]"
                            style={{ background: kit.shorts }}
                          />
                          <span
                            className="absolute bottom-0 right-0 h-2 w-[11px] border border-white/20 shadow-[inset_0_-2px_3px_rgba(0,0,0,0.32)]"
                            style={{ background: kit.shorts }}
                          />
                        </span>
                      </span>
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-[8px] font-black italic uppercase tracking-tighter text-white/40 shadow-[0_8px_18px_rgba(0,0,0,0.45)]">
                        {POSITION_LABEL[slot.role]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <p className="font-black italic uppercase tracking-tighter text-[11px] leading-none text-white">Forma</p>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }, (_, index) => {
                  const match = reservePanelMatches.played[index];
                  const result = match?.result;
                  const userScore = result ? (result.isUserHome ? result.homeScore : result.awayScore) : 0;
                  const opponentScore = result ? (result.isUserHome ? result.awayScore : result.homeScore) : 0;
                  const circleClass = !result
                    ? 'border-slate-600/50 bg-slate-800/70'
                    : userScore > opponentScore
                    ? 'border-emerald-300/80 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.45)]'
                    : userScore === opponentScore
                    ? 'border-yellow-300/80 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.42)]'
                    : 'border-red-300/80 bg-red-500 shadow-[0_0_10px_rgba(248,113,113,0.42)]';

                  return (
                    <span
                      key={match?.fixture.id ?? `empty-form-${index}`}
                      title={result ? `${match.fixture.opponentClubName} II ${userScore}:${opponentScore}` : 'Brak meczu'}
                      className={`h-3.5 w-3.5 rounded-full border ${circleClass}`}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-blue-400/20 bg-blue-950/20 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-black italic uppercase tracking-tighter text-[13px] text-white">Kalendarz</h3>
            </div>
            <div className="space-y-1.5">
              {reservePanelMatches.played.length === 0 && reservePanelMatches.upcoming.length === 0 && (
                <p className="font-black italic uppercase tracking-tighter text-[11px] text-slate-500">Brak wydarzeń</p>
              )}
              {reservePanelMatches.played.map(({ fixture, result }) => {
                const score = result ? getReserveResultDisplay(result) : null;
                return (
                  <button
                    key={fixture.id}
                    type="button"
                    onClick={() => setShowScheduleModal(true)}
                    className="grid w-full grid-cols-[42px_24px_1fr_42px] items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 text-left hover:bg-white/[0.08]"
                  >
                    <span className="font-black italic uppercase tracking-tighter text-[10px] text-slate-400">{formatReservePanelDate(result?.date ?? fixture.date)}</span>
                    <span className={`font-black italic uppercase tracking-tighter text-[10px] ${fixture.isHome ? 'text-emerald-300' : 'text-blue-300'}`}>{fixture.isHome ? 'D' : 'W'}</span>
                    <span className="truncate font-black italic uppercase tracking-tighter text-[11px] text-white">{fixture.opponentClubName} II</span>
                    <span className={`text-right font-black italic uppercase tracking-tighter text-[12px] ${score?.colorClass ?? 'text-slate-500'}`}>{score?.label ?? '-'}</span>
                  </button>
                );
              })}

              {reservePanelMatches.upcoming.map(({ fixture }) => (
                <button
                  key={fixture.id}
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  className="grid w-full grid-cols-[42px_24px_1fr] items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 text-left hover:bg-white/[0.08]"
                >
                  <span className="font-black italic uppercase tracking-tighter text-[10px] text-slate-400">{formatReservePanelDate(fixture.date)}</span>
                  <span className={`font-black italic uppercase tracking-tighter text-[10px] ${fixture.isHome ? 'text-emerald-300' : 'text-blue-300'}`}>{fixture.isHome ? 'D' : 'W'}</span>
                  <span className="truncate font-black italic uppercase tracking-tighter text-[11px] text-white">{fixture.opponentClubName} II</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
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
