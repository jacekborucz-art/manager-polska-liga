import { Fixture, Club, Player, PlayerPosition, Lineup, MatchStatus, CompetitionType, InjurySeverity, MatchHistoryEntry, MatchInjuryEntry, MatchEventType, Referee, Coach, PlayerStats } from '../types';
import { TacticRepository } from '../resources/tactics_db';
import { GoalAttributionService } from './GoalAttributionService';
import { LineupService } from './LineupService';
import { EuropeanWeatherService } from './EuropeanWeatherService';
import { RefereeService } from './RefereeService';
import { rollInjuryBySeverity } from './InjuryCatalog';
import { TeamFormImpactService } from './TeamFormImpactService';

// ============================================================
//  NEUTRALNE STADIONY FINAŁÓW
// ============================================================
const CL_FINAL_VENUES: { name: string; city: string; capacity: number; country: string }[] = [
  { name: 'Wembley Stadium',           city: 'Londyn',      capacity: 90000, country: 'England'     },
  { name: 'Stade de France',           city: 'Saint-Denis', capacity: 81338, country: 'France'      },
  { name: 'Estadio Santiago Bernabéu', city: 'Madryt',      capacity: 81044, country: 'Spain'       },
  { name: 'Allianz Arena',             city: 'Monachium',   capacity: 75000, country: 'Germany'     },
  { name: 'Stadio Giuseppe Meazza',    city: 'Mediolan',    capacity: 75817, country: 'Italy'       },
  { name: 'Signal Iduna Park',         city: 'Dortmund',    capacity: 81365, country: 'Germany'     },
  { name: 'Olympiastadion',            city: 'Berlin',      capacity: 74475, country: 'Germany'     },
  { name: 'Puskas Aréna',              city: 'Budapeszt',   capacity: 67215, country: 'Hungary'     },
  { name: 'Estádio da Luz',            city: 'Lizbona',     capacity: 64642, country: 'Portugal'    },
  { name: 'Tottenham Hotspur Stadium', city: 'Londyn',      capacity: 62850, country: 'England'     },
];

const EL_FINAL_VENUES: { name: string; city: string; capacity: number; country: string }[] = [
  { name: 'Aviva Stadium',             city: 'Dublin',      capacity: 51700, country: 'Ireland'     },
  { name: 'Estádio do Dragão',         city: 'Porto',       capacity: 50033, country: 'Portugal'    },
  { name: 'Ramón Sánchez-Pizjuán',     city: 'Sewilla',     capacity: 43883, country: 'Spain'       },
  { name: 'Volksparkstadion',          city: 'Hamburg',     capacity: 57000, country: 'Germany'     },
  { name: 'Arena Nationala',           city: 'Bukareszt',   capacity: 55634, country: 'Romania'     },
  { name: 'Philips Stadion',           city: 'Eindhoven',   capacity: 35000, country: 'Netherlands' },
  { name: 'Estadio de La Cartuja',     city: 'Sewilla',     capacity: 57619, country: 'Spain'       },
  { name: 'Estadio Olimpico',          city: 'Ateny',       capacity: 68000, country: 'Greece'      },
];

const CONF_FINAL_VENUES: { name: string; city: string; capacity: number; country: string }[] = [
  { name: 'Stadion Narodowy',          city: 'Warszawa',    capacity: 58580, country: 'Poland'      },
  { name: 'Lerkendal Stadion',         city: 'Trondheim',   capacity: 21166, country: 'Norway'      },
  { name: 'Eden Arena',                city: 'Praga',       capacity: 19370, country: 'Czech'       },
  { name: 'Parken',                    city: 'Kopenhaga',   capacity: 38065, country: 'Denmark'     },
  { name: 'Estadio do Algarve',        city: 'Faro',        capacity: 30305, country: 'Portugal'    },
  { name: 'Stade de Suisse',           city: 'Berno',       capacity: 31783, country: 'Switzerland' },
  { name: 'GSP Stadium',               city: 'Nikozja',     capacity: 22700, country: 'Cyprus'      },
  { name: 'OAKA Stadium',              city: 'Ateny',       capacity: 69618, country: 'Greece'      },
];

// ============================================================
//  WYNIK MECZU CL — rozszerzony o zdarzenia z zawodnikami
// ============================================================
interface CLMatchResult {
  homeScore: number;
  awayScore: number;
  penaltyHome?: number;
  penaltyAway?: number;
  wentToExtraTime: boolean;
  goals: { playerName: string; playerId?: string; assistId?: string; minute: number; teamId: string; isPenalty: boolean; varDisallowed?: boolean }[];
  cards: { playerId: string; playerName: string; minute: number; teamId: string; type: 'YELLOW' | 'RED' | 'SECOND_YELLOW' }[];
  substitutions: { playerOutId?: string; playerOutName: string; playerInId?: string; playerInName: string; minute: number; teamId: string }[];
  injuries: MatchInjuryEntry[];
  updatedHomePlayers: Player[];
  updatedAwayPlayers: Player[];
  participatingHomePlayerIds: string[];
  participatingAwayPlayerIds: string[];
  homeMinutesPlayedMap: Record<string, number>;
  awayMinutesPlayedMap: Record<string, number>;
  fatigueMap: Record<string, number>;
  fatigueDebtMap: Record<string, number>;
  injuryPenaltyMap: Record<string, number>;
  ratings: Record<string, number>;
}

type SimulatedSub = { min: number; outId: string; inId: string };
type SimulatedExit = { min: number; outId: string };
type PlayerInterval = { playerId: string; start: number; end: number };

const formatPlayerReportName = (player: Pick<Player, 'firstName' | 'lastName'>): string => {
  const lastName = player.lastName.trim();
  return lastName ? `${player.firstName.charAt(0)}. ${lastName}` : player.firstName;
};

// ============================================================
//  RNG — deterministyczny hash (sin-based jak LeagueBackgroundMatchEngine)
// ============================================================
const makeSeededRng = (seed: number) => (offset: number): number => {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
};

// ============================================================
//  TACTIC CLASH MATRIX (identyczna jak w LeagueBackgroundMatchEngine)
// ============================================================
const TACTIC_CLASH_MATRIX: Record<string, Record<string, number>> = {
  '4-4-2':        { '4-4-2': 4, '4-3-3': 3, '5-4-1': 2, '4-2-3-1': 4, '3-5-2': 5, '3-4-3': 3, '5-3-2': 3, '4-5-1': 4, '4-4-2-DIAMOND': 6 },
  '4-3-3':        { '4-4-2': 5, '4-3-3': 4, '5-4-1': 2, '4-2-3-1': 5, '3-5-2': 4, '3-4-3': 6, '5-3-2': 2, '4-5-1': 3, '4-4-2-DIAMOND': 5 },
  '5-4-1':        { '4-4-2': 6, '4-3-3': 7, '5-4-1': 4, '4-2-3-1': 5, '3-5-2': 3, '3-4-3': 6, '5-3-2': 4, '4-5-1': 4, '4-4-2-DIAMOND': 7 },
  '4-2-3-1':      { '4-4-2': 4, '4-3-3': 3, '5-4-1': 3, '4-2-3-1': 4, '3-5-2': 6, '3-4-3': 4, '5-3-2': 4, '4-5-1': 5, '4-4-2-DIAMOND': 4 },
  '3-5-2':        { '4-4-2': 3, '4-3-3': 4, '5-4-1': 5, '4-2-3-1': 2, '3-5-2': 4, '3-4-3': 5, '5-3-2': 5, '4-5-1': 3, '4-4-2-DIAMOND': 4 },
};

const getEffectivenessMult = (score: number): number => {
  if (score <= 1) return 0.70;
  if (score <= 3) return 0.85;
  if (score === 4) return 1.00;
  if (score <= 6) return 1.15;
  return 1.35;
};

// ============================================================
//  SIŁA LINII ZAWODNIKÓW
// ============================================================
const getLineStrength = (players: Player[], lineupIds: (string | null)[]) => {
  const ids = lineupIds.filter((id): id is string => id !== null);
  const active = players.filter(p => ids.includes(p.id));
  if (active.length === 0) return { att: 40, def: 40, gk: 40 };
  const att = active.reduce((acc, p) => acc + (p.attributes.attacking + p.attributes.finishing + p.attributes.passing) / 3, 0) / active.length;
  const def = active.reduce((acc, p) => acc + (p.attributes.defending + p.attributes.stamina) / 2, 0) / active.length;
  const gk = players.find(p => p.id === lineupIds[0])?.attributes.goalkeeping ?? 40;
  return { att, def, gk };
};

const getWeightedLineStrength = (
  players: Player[],
  lineup: Lineup,
  allSubs: { min: number; outId: string; inId: string }[],
  exits: SimulatedExit[] = []
): { att: number; def: number; gk: number } => {
  const TOTAL = 90;
  const minutesPlayed: Record<string, number> = {};
  const currentXI = lineup.startingXI.map(id => ({ id: id ?? null, entryMin: 0 }));
  const timeline = [
    ...allSubs.map(sub => ({ type: 'sub' as const, min: sub.min, outId: sub.outId, inId: sub.inId })),
    ...exits.map(exit => ({ type: 'exit' as const, min: exit.min, outId: exit.outId })),
  ].sort((a, b) => a.min - b.min || (a.type === 'exit' ? -1 : 1));

  for (const event of timeline) {
    const outIdx = currentXI.findIndex(p => p.id === event.outId);
    if (outIdx === -1) continue;
    const leaving = currentXI[outIdx];
    if (leaving.id) minutesPlayed[leaving.id] = (minutesPlayed[leaving.id] ?? 0) + (event.min - leaving.entryMin);
    currentXI[outIdx] = event.type === 'sub'
      ? { id: event.inId, entryMin: event.min }
      : { id: null, entryMin: event.min };
  }
  for (const slot of currentXI) {
    if (slot.id) minutesPlayed[slot.id] = (minutesPlayed[slot.id] ?? 0) + (TOTAL - slot.entryMin);
  }
  let attSum = 0, defSum = 0, totalMins = 0;
  for (const [pId, mins] of Object.entries(minutesPlayed)) {
    const p = players.find(x => x.id === pId);
    if (!p) continue;
    attSum += ((p.attributes.attacking + p.attributes.finishing + p.attributes.passing) / 3) * mins;
    defSum += ((p.attributes.defending + p.attributes.stamina) / 2) * mins;
    totalMins += mins;
  }
  const att = totalMins > 0 ? attSum / totalMins : 40;
  const def = totalMins > 0 ? defSum / totalMins : 40;
  const gk = players.find(p => p.id === lineup.startingXI[0])?.attributes.goalkeeping ?? 40;
  return { att, def, gk };
};

// ============================================================
//  POISSON-LIKE GENERATOR GOLI
// ============================================================
const getGoalsPoissonLike = (
  xg: number,
  rng: (o: number) => number,
  baseOffset: number,
  isChaos: boolean
): number => {
  let g = 0;
  // Nasycenie (satiety): mniejszy pułap niż wcześniej — eliminuje hokejowe wyniki
  let cur = Math.max(0.05, Math.min(isChaos ? 3.8 : 2.8, xg + (rng(baseOffset) - 0.5) * 0.35));
  for (let i = 0; i < 8; i++) {
    if (rng(baseOffset + 10 + i) < cur / (i + 1.15)) { g++; cur *= (isChaos ? 0.72 : 0.62); }
  }
  return g;
};

// ============================================================
//  RZADKIE POGROMY PRZY DUŻEJ RÓŻNICY KLAS
// ============================================================
const applyRareMismatchRout = (
  homeScore: number,
  awayScore: number,
  homeClub: Club,
  awayClub: Club,
  xgHome: number,
  xgAway: number,
  rng: (o: number) => number,
  isChaos: boolean
): { homeScore: number; awayScore: number } => {
  const repGap = homeClub.reputation - awayClub.reputation;
  const xgGap = xgHome - xgAway;
  const homeFavorite = repGap >= 7 && xgGap >= 0.75;
  const awayFavorite = repGap <= -7 && xgGap <= -0.75;
  if (!homeFavorite && !awayFavorite) return { homeScore, awayScore };

  const favoriteScore = homeFavorite ? homeScore : awayScore;
  const underdogScore = homeFavorite ? awayScore : homeScore;
  const mismatchChance =
    Math.max(0, Math.abs(repGap) - 6) * 0.012 +
    Math.max(0, Math.abs(xgGap) - 0.75) * 0.035 +
    (favoriteScore >= 3 && underdogScore <= 1 ? 0.05 : favoriteScore >= 2 && underdogScore === 0 ? 0.035 : 0) +
    (isChaos ? 0.06 : 0);

  if (rng(9300) >= Math.min(0.22, mismatchChance)) return { homeScore, awayScore };

  let extraGoals = 1;
  if (rng(9301) < 0.55) extraGoals++;
  if (rng(9302) < 0.22) extraGoals++;
  if (Math.abs(repGap) >= 12 && rng(9303) < 0.18) extraGoals++;

  const targetMinimum = underdogScore === 0 ? 5 : 4;
  if (favoriteScore < targetMinimum && rng(9304) < 0.65) {
    extraGoals = Math.max(extraGoals, targetMinimum - favoriteScore);
  }

  const cap = underdogScore === 0 ? 7 : 6;
  if (homeFavorite) return { homeScore: Math.min(cap, homeScore + extraGoals), awayScore };
  return { homeScore, awayScore: Math.min(cap, awayScore + extraGoals) };
};

// ============================================================
//  SYMULACJA ZMIAN (3-5 na drużynę)
// ============================================================
const simulateSubs = (
  lineup: Lineup,
  teamPlayers: Player[],
  sideOffset: number,
  rng: (o: number) => number
): { matchSubs: SimulatedSub[]; allPlayedIds: string[] } => {
  const subCount = Math.floor(3 + rng(sideOffset) * 3); // 3-5 zmian
  const matchSubs: SimulatedSub[] = [];
  const currentXI = [...lineup.startingXI];
  const currentBench = [...lineup.bench];
  const participants = new Set(currentXI.filter((id): id is string => id !== null));
  const subbedInIds = new Set<string>();
  const plannedSubs = Array.from({ length: subCount }, (_, i) => ({
    i,
    min: Math.floor(46 + rng(sideOffset + i + 100) * 42),
    outIdx: Math.floor(1 + rng(sideOffset + i + 200) * 10)
  })).sort((a, b) => a.min - b.min || a.i - b.i);

  for (const planned of plannedSubs) {
    const subMin = planned.min; // 46-88 min
    const outIdx = planned.outIdx; // Unikamy GK (index 0)
    const playerOutId = currentXI[outIdx];
    if (!playerOutId || subbedInIds.has(playerOutId)) continue;

    const tacticSlots = TacticRepository.getById(lineup.tacticId).slots;
    const roleNeeded = outIdx < tacticSlots.length ? tacticSlots[outIdx].role : PlayerPosition.MID;

    const subInId = currentBench.find(id => teamPlayers.find(p => p.id === id)?.position === roleNeeded) ||
                    currentBench.find(id => teamPlayers.find(p => p.id === id)?.position !== PlayerPosition.GK);

    if (subInId) {
      matchSubs.push({ min: subMin, outId: playerOutId, inId: subInId });
      currentXI[outIdx] = subInId;
      currentBench.splice(currentBench.indexOf(subInId), 1);
      participants.add(subInId);
      subbedInIds.add(subInId);
    }
  }
  return { matchSubs, allPlayedIds: Array.from(participants) };
};

// ============================================================
//  AKTYWNY SKŁAD W DANEJ MINUCIE
// ============================================================
const getActiveLineupAt = (
  min: number,
  originalXI: (string | null)[],
  subs: SimulatedSub[],
  exits: SimulatedExit[] = []
): string[] => {
  const current = [...originalXI];
  const timeline = [
    ...subs.map(sub => ({ type: 'sub' as const, min: sub.min, outId: sub.outId, inId: sub.inId })),
    ...exits.map(exit => ({ type: 'exit' as const, min: exit.min, outId: exit.outId })),
  ].filter(event => event.min <= min).sort((a, b) => a.min - b.min || (a.type === 'exit' ? -1 : 1));

  timeline.forEach(event => {
    const idx = current.indexOf(event.outId);
    if (idx !== -1) current[idx] = event.type === 'sub' ? event.inId : null;
  });
  return current.filter((id): id is string => id !== null);
};

const getPlayerIntervals = (
  originalXI: (string | null)[],
  subs: SimulatedSub[],
  exits: SimulatedExit[] = [],
  maxMinute = 90
): PlayerInterval[] => {
  const current = originalXI.map(id => ({ id: id ?? null, start: 0 }));
  const intervals: PlayerInterval[] = [];

  const timeline = [
    ...subs.map(sub => ({ type: 'sub' as const, min: sub.min, outId: sub.outId, inId: sub.inId })),
    ...exits.map(exit => ({ type: 'exit' as const, min: exit.min, outId: exit.outId })),
  ].sort((a, b) => a.min - b.min || (a.type === 'exit' ? -1 : 1));

  timeline.forEach(event => {
    const idx = current.findIndex(slot => slot.id === event.outId);
    if (idx === -1) return;
    const leaving = current[idx];
    if (leaving.id) intervals.push({ playerId: leaving.id, start: leaving.start, end: event.min });
    current[idx] = event.type === 'sub'
      ? { id: event.inId, start: event.min }
      : { id: null, start: event.min };
  });

  current.forEach(slot => {
    if (slot.id) intervals.push({ playerId: slot.id, start: slot.start, end: maxMinute });
  });

  return intervals.filter(interval => interval.end > interval.start);
};

const getMinutesPlayedMap = (
  originalXI: (string | null)[],
  subs: SimulatedSub[],
  exits: SimulatedExit[] = []
): Record<string, number> => {
  const minutes: Record<string, number> = {};
  getPlayerIntervals(originalXI, subs, exits).forEach(interval => {
    minutes[interval.playerId] = (minutes[interval.playerId] ?? 0) + (interval.end - interval.start);
  });
  return minutes;
};

const reconcileMatchTimeline = (
  originalXI: (string | null)[],
  subs: SimulatedSub[],
  exits: SimulatedExit[]
): { appliedSubs: SimulatedSub[]; appliedExits: SimulatedExit[]; minutesPlayedMap: Record<string, number>; participatingIds: string[] } => {
  const current = originalXI.map(id => ({ id: id ?? null, start: 0 }));
  const appliedSubs: SimulatedSub[] = [];
  const appliedExits: SimulatedExit[] = [];
  const minutesPlayedMap: Record<string, number> = {};
  const participants = new Set(originalXI.filter((id): id is string => id !== null));
  const timeline = [
    ...subs.map(sub => ({ type: 'sub' as const, min: sub.min, outId: sub.outId, inId: sub.inId })),
    ...exits.map(exit => ({ type: 'exit' as const, min: exit.min, outId: exit.outId })),
  ].sort((a, b) => a.min - b.min || (a.type === 'exit' ? -1 : 1));

  timeline.forEach(event => {
    const idx = current.findIndex(slot => slot.id === event.outId);
    if (idx === -1) return;

    const leaving = current[idx];
    if (leaving.id) {
      minutesPlayedMap[leaving.id] = (minutesPlayedMap[leaving.id] ?? 0) + (event.min - leaving.start);
    }

    if (event.type === 'sub') {
      current[idx] = { id: event.inId, start: event.min };
      participants.add(event.inId);
      appliedSubs.push({ outId: event.outId, inId: event.inId, min: event.min });
    } else {
      current[idx] = { id: null, start: event.min };
      appliedExits.push({ outId: event.outId, min: event.min });
    }
  });

  current.forEach(slot => {
    if (slot.id) minutesPlayedMap[slot.id] = (minutesPlayedMap[slot.id] ?? 0) + (90 - slot.start);
  });

  return { appliedSubs, appliedExits, minutesPlayedMap, participatingIds: Array.from(participants) };
};

// ============================================================
//  ATRYBUOWANIE GOLI DO ZAWODNIKÓW
// ============================================================
const attributeGoalsToPlayers = (
  count: number,
  teamId: string,
  teamPlayers: Player[],
  lineup: Lineup,
  subs: { min: number; outId: string; inId: string }[],
  rng: (o: number) => number,
  baseOffset: number
): { playerName: string; playerId?: string; minute: number; teamId: string; isPenalty: boolean }[] => {
  const goals: { playerName: string; playerId?: string; minute: number; teamId: string; isPenalty: boolean }[] = [];
  const usedMinutes = new Set<number>();

  for (let i = 0; i < count; i++) {
    let minute = Math.floor(1 + rng(baseOffset + i) * 94);
    while (usedMinutes.has(minute)) { minute = minute >= 96 ? 1 : minute + 1; }
    usedMinutes.add(minute);

    const activeXI = getActiveLineupAt(minute, lineup.startingXI, subs);
    const scorer = GoalAttributionService.pickScorer(teamPlayers, activeXI, false, () => rng(baseOffset + i + 500));
    const isPenalty = rng(baseOffset + i + 700) < 0.02;

    goals.push({
      playerName: scorer ? formatPlayerReportName(scorer) : '?',
      playerId: scorer?.id,
      minute,
      teamId,
      isPenalty,
    });
  }
  return goals;
};

// ============================================================
//  SYMULACJA KONTUZJI PER MINUTA (0.4% szansy/minutę)
// ============================================================
const simulateInjuriesPerMinute = (
  lineup: Lineup,
  players: Player[],
  teamId: string,
  preRolledSubs: SimulatedSub[],
  subsAlreadyUsed: number,
  rng: (o: number) => number,
  offset: number,
  refExpFactor: number,
  matchDate: Date
): {
  injuries: MatchInjuryEntry[];
  updatedPlayers: Player[];
  injuryPenaltyMap: Record<string, number>;
  injurySubs: SimulatedSub[];
  forcedExits: SimulatedExit[];
  appliedRegularSubs: SimulatedSub[];
  participatingIds: string[];
  minutesPlayedMap: Record<string, number>;
} => {
  const currentXI = [...lineup.startingXI] as (string | null)[];
  const entryMins = currentXI.map(() => 0);
  const currentBench = [...lineup.bench];
  let subsUsed = 0;
  const injuryChance = 0.002295 * refExpFactor;
  const injuries: MatchInjuryEntry[] = [];
  let updatedPlayers = [...players];
  const injuryPenaltyMap: Record<string, number> = {};
  const injurySubs: SimulatedSub[] = [];
  const forcedExits: SimulatedExit[] = [];
  const appliedRegularSubs: SimulatedSub[] = [];
  const minutesPlayedMap: Record<string, number> = {};
  const participants = new Set(currentXI.filter((id): id is string => id !== null));
  const sortedPreRolledSubs = [...preRolledSubs].sort((a, b) => a.min - b.min);

  for (let minute = 1; minute <= 90; minute++) {
    for (const sub of sortedPreRolledSubs) {
      if (sub.min === minute) {
        const idx = currentXI.indexOf(sub.outId);
        if (idx !== -1 && subsUsed < 5) {
          const leaving = currentXI[idx];
          if (leaving) minutesPlayedMap[leaving] = (minutesPlayedMap[leaving] ?? 0) + (minute - entryMins[idx]);
          currentXI[idx] = sub.inId;
          entryMins[idx] = minute;
          const benchIdx = currentBench.indexOf(sub.inId);
          if (benchIdx !== -1) currentBench.splice(benchIdx, 1);
          appliedRegularSubs.push(sub);
          participants.add(sub.inId);
          subsUsed++;
        }
      }
    }

    if (rng(offset + minute + 800) >= injuryChance) continue;

    const activeIndices = currentXI.map((id, i) => id ? i : -1).filter(i => i !== -1);
    if (activeIndices.length === 0) continue;
    const pIdx = activeIndices[Math.floor(rng(offset + minute + 801) * activeIndices.length)];
    const pId = currentXI[pIdx] as string;
    const p = players.find(x => x.id === pId);
    if (!p) continue;

    const isSev = rng(offset + minute + 803) >= 0.667;
    const severity = isSev ? InjurySeverity.SEVERE : InjurySeverity.LIGHT;
    let injuryRollOffset = offset + minute + 808;
    const { days, type } = rollInjuryBySeverity(severity, () => rng(injuryRollOffset++));
    const playerName = formatPlayerReportName(p);

    injuries.push({ playerId: pId, playerName, minute, teamId, severity, days, type });
    injuryPenaltyMap[pId] = (isSev ? 55 : 20) + rng(offset + minute + 5000) * 15;

    updatedPlayers = updatedPlayers.map(pl => pl.id === pId ? {
      ...pl,
      health: {
        status: 'INJURED' as any,
        injury: { type, daysRemaining: days, severity, injuryDate: matchDate.toISOString(), totalDays: days }
      }
    } : pl);

    if (isSev) {
      const canSub = subsUsed < 5;
      if (canSub) {
        const tacticSlots = TacticRepository.getById(lineup.tacticId).slots;
        const roleNeeded = pIdx < tacticSlots.length ? tacticSlots[pIdx].role : undefined;
        const candidate = (roleNeeded ? currentBench.find(id => players.find(pl => pl.id === id)?.position === roleNeeded) : undefined)
          ?? currentBench.find(id => players.find(pl => pl.id === id)?.position !== PlayerPosition.GK);
        if (candidate) {
          injurySubs.push({ outId: pId, inId: candidate, min: minute });
          minutesPlayedMap[pId] = (minutesPlayedMap[pId] ?? 0) + (minute - entryMins[pIdx]);
          currentXI[pIdx] = candidate;
          entryMins[pIdx] = minute;
          currentBench.splice(currentBench.indexOf(candidate), 1);
          participants.add(candidate);
          subsUsed++;
        } else {
          minutesPlayedMap[pId] = (minutesPlayedMap[pId] ?? 0) + (minute - entryMins[pIdx]);
          forcedExits.push({ outId: pId, min: minute });
          currentXI[pIdx] = null;
        }
      } else {
        minutesPlayedMap[pId] = (minutesPlayedMap[pId] ?? 0) + (minute - entryMins[pIdx]);
        forcedExits.push({ outId: pId, min: minute });
        currentXI[pIdx] = null;
      }
    }
  }

  currentXI.forEach((pId, idx) => {
    if (pId) minutesPlayedMap[pId] = (minutesPlayedMap[pId] ?? 0) + (90 - entryMins[idx]);
  });

  return { injuries, updatedPlayers, injuryPenaltyMap, injurySubs, forcedExits, appliedRegularSubs, participatingIds: Array.from(participants), minutesPlayedMap };
};

// ============================================================
//  SYMULACJA KARTEK I KONTUZJI (z sędzią FIFA/UEFA)
// ============================================================
const simulateCardsAndInjuries = (
  lineup: Lineup,
  players: Player[],
  teamId: string,
  subs: SimulatedSub[],
  offset: number,
  rng: (o: number) => number,
  referee: Referee,
  isHomeTeam: boolean,
  exits: SimulatedExit[] = []
): {
  cards: { playerId: string; playerName: string; minute: number; teamId: string; type: 'YELLOW' | 'RED' | 'SECOND_YELLOW' }[];
  redCount: number;
  updatedPlayers: Player[];
  fatigueMap: Record<string, number>;
  fatigueDebtMap: Record<string, number>;
  injuryPenaltyMap: Record<string, number>;
  injuries: MatchInjuryEntry[];
} => {
  const cards: { playerId: string; playerName: string; minute: number; teamId: string; type: 'YELLOW' | 'RED' | 'SECOND_YELLOW' }[] = [];
  let redCount = 0;
  let updatedPlayers = [...players];
  const fatigueMap: Record<string, number> = {};
  const fatigueDebtMap: Record<string, number> = {};
  const injuryPenaltyMap: Record<string, number> = {};
  const injuries: MatchInjuryEntry[] = [];

  // Sędzia: im mniej doświadczony, tym więcej chaosu; strictness → surowość
  const refExpFactor = 1 + (50 - (referee.experience || 50)) / 100;
  const yellowProb = 0.087 * (referee.strictness / 50) * refExpFactor;
  // Gospodarz korzysta z niewielkiego przywileju (advantageTendency)
  const homeBias = isHomeTeam ? -(referee.advantageTendency / 5000) : (referee.advantageTendency / 10000);
  const adjustedYellowProb = Math.max(0.02, yellowProb + homeBias);
  const directRedProb = 0.0033 * (referee.strictness / 50) * refExpFactor;
  const intervals = getPlayerIntervals(lineup.startingXI, subs, exits);

  intervals.forEach((interval, idx) => {
    const p = players.find(x => x.id === interval.playerId);
    if (!p) return;
    const playerName = formatPlayerReportName(p);
    const minuteFactor = Math.max(0.1, Math.min(1, (interval.end - interval.start) / 90));
    const randomMinute = (base: number) => Math.max(1, Math.min(90, Math.floor(interval.start + rng(base) * Math.max(1, interval.end - interval.start))));

    const isDirectRed = rng(offset + idx + 1500) < directRedProb * minuteFactor;
    const yellowRoll = rng(offset + idx + 1000);
    const isSecondYellow = yellowRoll < adjustedYellowProb * minuteFactor && rng(offset + idx + 1200) < 0.05;
    const isNormalYellow = yellowRoll < adjustedYellowProb * minuteFactor && !isSecondYellow;

    if (isDirectRed) {
      const m = randomMinute(offset + idx + 550);
      cards.push({ playerId: p.id, playerName, minute: m, teamId, type: 'RED' });
      redCount++;
    } else if (isSecondYellow) {
      const duration = Math.max(2, interval.end - interval.start);
      const m1 = Math.max(1, Math.min(89, Math.floor(interval.start + rng(offset + idx + 660) * Math.max(1, duration * 0.55))));
      const m2 = Math.max(m1 + 1, Math.min(90, Math.floor(m1 + 1 + rng(offset + idx + 770) * Math.max(1, interval.end - m1))));
      cards.push({ playerId: p.id, playerName, minute: m1, teamId, type: 'YELLOW' });
      cards.push({ playerId: p.id, playerName, minute: m2, teamId, type: 'SECOND_YELLOW' });
      redCount++;
    } else if (isNormalYellow) {
      const m = randomMinute(offset + idx + 880);
      cards.push({ playerId: p.id, playerName, minute: m, teamId, type: 'YELLOW' });
    }

    const stamina = p.attributes.stamina || 50;
    const stamEff = Math.pow((100 - stamina) / 100, 1.2) * 10;
    let drain = (2.5 + rng(offset + idx + 4000) * 1.5 + (stamEff * 0.5) + 1.5) * minuteFactor;
    if (p.position === PlayerPosition.GK) drain *= 0.75 + (stamina / 100) * 0.10;
    fatigueMap[p.id] = (fatigueMap[p.id] ?? 0) + drain;
    const gkDebtFactor = p.position === PlayerPosition.GK
      ? Math.max(0.70, Math.min(0.90, 0.75 + Math.max(0, (p.age - 27) * 0.004) - (stamina / 100) * 0.05))
      : 1;
    fatigueDebtMap[p.id] = (fatigueDebtMap[p.id] ?? 0) + (5 + ((100 - stamina) * 0.15)) * minuteFactor * gkDebtFactor;
  });

  return { cards, redCount, updatedPlayers, fatigueMap, fatigueDebtMap, injuryPenaltyMap, injuries };
};

const getRedCardExits = (
  cards: { playerId: string; minute: number; type: 'YELLOW' | 'RED' | 'SECOND_YELLOW' }[]
): SimulatedExit[] => {
  const exitByPlayer = new Map<string, number>();

  cards.forEach(card => {
    if (card.type !== 'RED' && card.type !== 'SECOND_YELLOW') return;
    const currentMinute = exitByPlayer.get(card.playerId);
    if (currentMinute === undefined || card.minute < currentMinute) {
      exitByPlayer.set(card.playerId, card.minute);
    }
  });

  return Array.from(exitByPlayer.entries()).map(([outId, min]) => ({ outId, min }));
};

// ============================================================
//  DOGRYWKA + KARNE — poprawiona wersja
// ============================================================
const getShortHandedImpact = (redExits: SimulatedExit[], maxMinute = 90): { attackMult: number; defenseLeakMult: number; winProbPenalty: number } => {
  const redEquivalent = redExits.reduce((sum, exit) => {
    const remaining = Math.max(0, maxMinute - Math.max(1, Math.min(maxMinute, exit.min)));
    return sum + remaining / maxMinute;
  }, 0);

  return {
    attackMult: Math.max(0.25, 1 - redEquivalent * 0.68),
    defenseLeakMult: 1 + redEquivalent * 0.75,
    winProbPenalty: redEquivalent * 0.28,
  };
};

const getShortHandedGoalChance = (redExits: SimulatedExit[], minute: number): number => {
  const activeReds = redExits.filter(exit => exit.min < minute).length;
  if (activeReds >= 2) return 0.001;
  if (activeReds === 1) return 0.28;
  return 1;
};

const adjustExtraTimeWinProbability = (
  homeWinProb: number,
  homeRedExits: SimulatedExit[],
  awayRedExits: SimulatedExit[]
): number => {
  const homeImpact = getShortHandedImpact(homeRedExits);
  const awayImpact = getShortHandedImpact(awayRedExits);
  return Math.max(0.12, Math.min(0.88, homeWinProb - homeImpact.winProbPenalty + awayImpact.winProbPenalty));
};

const simulateExtraTimeAndPenalties = (
  homeScore: number,
  awayScore: number,
  homeWinProb: number,
  rng: (o: number) => number,
  baseOffset: number,
  leg1Diff?: number
): { homeScore: number; awayScore: number; penaltyHome?: number; penaltyAway?: number } => {
  let h = homeScore;
  let a = awayScore;
  const homeAdvantage = 0.05;

  // Dogrywka: P(0)=0.55, P(1)=0.35, P(2)=0.10
  const etRoll = rng(baseOffset);
  const etGoals = etRoll < 0.10 ? 2 : etRoll < 0.45 ? 1 : 0;
  for (let i = 0; i < etGoals; i++) {
    if (rng(baseOffset + 10 + i) < homeWinProb + homeAdvantage) h++;
    else a++;
  }

  let penaltyHome: number | undefined;
  let penaltyAway: number | undefined;

  // Sprawdzenie remisu: dla rewanżu — agregat, dla finału — wynik meczu
  const aggregateTied = leg1Diff !== undefined ? (h - a === leg1Diff) : (h === a);

  if (aggregateTied) {
    const simSeries = (favProb: number, seriesOffset: number): number => {
      let scored = 0;
      for (let i = 0; i < 5; i++) {
        if (rng(seriesOffset + i) < 0.72 + (favProb - 0.5) * 0.1) scored++;
      }
      return scored;
    };

    penaltyHome = simSeries(homeWinProb, baseOffset + 100);
    penaltyAway = simSeries(1 - homeWinProb, baseOffset + 200);

    // Sudden death — aż do rozstrzygnięcia
    let sd = 0;
    while (penaltyHome === penaltyAway && sd < 20) {
      sd++;
      const hScored = rng(baseOffset + 300 + sd * 2) < 0.72;
      const aScored = rng(baseOffset + 301 + sd * 2) < 0.72;
      if (hScored && !aScored) penaltyHome++;
      else if (!hScored && aScored) penaltyAway++;
    }
  }

  return { homeScore: h, awayScore: a, penaltyHome, penaltyAway };
};

// ============================================================
//  GŁÓWNA FUNKCJA SYMULACJI MECZU Z ZAWODNIKAMI (Stage 2)
// ============================================================
const simulateCLMatchFull = (
  homeClub: Club,
  awayClub: Club,
  homePlayersAll: Player[],
  awayPlayersAll: Player[],
  homeLineup: Lineup,
  awayLineup: Lineup,
  date: Date,
  seed: number,
  referee: Referee,
  homeCoach: Coach,
  awayCoach: Coach,
  leg1Diff?: number,
  isFinalMatch?: boolean
): CLMatchResult => {
  const rng = makeSeededRng(seed);

  // ── Sędzia (Stage 2) ─────────────────────────────────────────────────
  const refExpFactor = 1 + (50 - (referee.experience || 50)) / 100;

  // ── Taktyka + Clash Matrix (Stage 2) ────────────────────────────────
  const hTactic = TacticRepository.getById(homeLineup.tacticId);
  const aTactic = TacticRepository.getById(awayLineup.tacticId);
  const hClashBase = TACTIC_CLASH_MATRIX[homeLineup.tacticId]?.[awayLineup.tacticId] ?? 4;
  const aClashBase = TACTIC_CLASH_MATRIX[awayLineup.tacticId]?.[homeLineup.tacticId] ?? 4;
  const hClashFinal = Math.round(hClashBase + rng(900) * 1.5);
  const aClashFinal = Math.round(aClashBase + rng(901) * 1.5);
  const hTacticMod = getEffectivenessMult(hClashFinal);
  const aTacticMod = getEffectivenessMult(aClashFinal);

  // ── Trenerzy (Stage 2) ───────────────────────────────────────────────
  // Normalizacja: atrybuty 0-100 → bonus ±%
  const hCoachAtkMod = 1.0 + ((homeCoach.attributes.motivation - 50) * 0.002) + ((homeCoach.attributes.experience - 50) * 0.001);
  const hCoachDefMod = 1.0 + ((homeCoach.attributes.decisionMaking - 50) * 0.002);
  const aCoachAtkMod = 1.0 + ((awayCoach.attributes.motivation - 50) * 0.002) + ((awayCoach.attributes.experience - 50) * 0.001);
  const aCoachDefMod = 1.0 + ((awayCoach.attributes.decisionMaking - 50) * 0.002);

  // ── Forma dzienna ────────────────────────────────────────────────────
  const homeDailyForm = (rng(11) - 0.5) * 0.3;
  const awayDailyForm = (rng(12) - 0.5) * 0.3;

  // ── Chaos / Stale factor ─────────────────────────────────────────────
  const chaosRoll = rng(7);
  const isChaosMatch = chaosRoll < 0.035;
  const isStaleMatch = chaosRoll > 0.94;
  const volatilityMult = isChaosMatch ? 1.65 : (isStaleMatch ? 0.50 : 1.0);

  // ── Pogoda (klimat kraju gospodarza) ────────────────────────────────
  const homeCountry = homeClub.country ?? 'POL';
  const weatherMod = EuropeanWeatherService.getGoalModifier(homeCountry, date, rng(13));

  // ── Pre-roll czerwonych kartek (z sędzią) → korekta XG ──────────────
  // ── Zmiany i kontuzje (przed obliczeniem xG) ─────────────────────────
  const homeSubData = simulateSubs(homeLineup, homePlayersAll, 5000, rng);
  const awaySubData = simulateSubs(awayLineup, awayPlayersAll, 6000, rng);
  const homeInjuryData = simulateInjuriesPerMinute(homeLineup, homePlayersAll, homeClub.id, homeSubData.matchSubs, homeSubData.matchSubs.length, rng, 10000, refExpFactor, date);
  const awayInjuryData = simulateInjuriesPerMinute(awayLineup, awayPlayersAll, awayClub.id, awaySubData.matchSubs, awaySubData.matchSubs.length, rng, 20000, refExpFactor, date);
  let homeAllSubs = [...homeInjuryData.appliedRegularSubs, ...homeInjuryData.injurySubs].sort((a, b) => a.min - b.min);
  let awayAllSubs = [...awayInjuryData.appliedRegularSubs, ...awayInjuryData.injurySubs].sort((a, b) => a.min - b.min);
  const homeCardData = simulateCardsAndInjuries(homeLineup, homePlayersAll, homeClub.id, homeAllSubs, 10000, rng, referee, true, homeInjuryData.forcedExits);
  const awayCardData = simulateCardsAndInjuries(awayLineup, awayPlayersAll, awayClub.id, awayAllSubs, 20000, rng, referee, false, awayInjuryData.forcedExits);
  const homeRedExits = getRedCardExits(homeCardData.cards);
  const awayRedExits = getRedCardExits(awayCardData.cards);
  const homeTimeline = reconcileMatchTimeline(homeLineup.startingXI, homeAllSubs, [...homeInjuryData.forcedExits, ...homeRedExits]);
  const awayTimeline = reconcileMatchTimeline(awayLineup.startingXI, awayAllSubs, [...awayInjuryData.forcedExits, ...awayRedExits]);
  homeAllSubs = homeTimeline.appliedSubs;
  awayAllSubs = awayTimeline.appliedSubs;
  let homeMinutesPlayedMap = homeTimeline.minutesPlayedMap;
  let awayMinutesPlayedMap = awayTimeline.minutesPlayedMap;
  const homeShortHanded = getShortHandedImpact(homeRedExits);
  const awayShortHanded = getShortHandedImpact(awayRedExits);
  const formImpact = TeamFormImpactService.calculateMatchImpact(homePlayersAll, awayPlayersAll, homeLineup, awayLineup);

  // ── Siła zawodników (ważona czasem gry) ──────────────────────────────
  const hStr = getWeightedLineStrength(homePlayersAll, homeLineup, homeAllSubs, [...homeInjuryData.forcedExits, ...homeRedExits]);
  const aStr = getWeightedLineStrength(awayPlayersAll, awayLineup, awayAllSubs, [...awayInjuryData.forcedExits, ...awayRedExits]);

  // ── XG z bonusami trenerów, taktyki i siły zawodników ───────────────
  const repDiff = homeClub.reputation - awayClub.reputation;
  // Na neutralnym stadionie (finał) obie drużyny mają równy base XG i brak przewagi domowej
  const baseXg = isFinalMatch ? 1.15 : 1.25;
  const baseXgAway = isFinalMatch ? 1.15 : 1.05;
  const homeAdvantage = isFinalMatch ? 0 : 0.08;

  let xgHome = baseXg
    + (repDiff * 0.015)
    + (hTactic.attackBias - 50) / 180
    + ((hStr.att - aStr.def) * 0.04)
    + homeDailyForm
    + homeAdvantage;

  let xgAway = baseXgAway
    - (repDiff * 0.015)
    + (aTactic.attackBias - 50) / 180
    + ((aStr.att - hStr.def) * 0.04)
    + awayDailyForm;

  if (xgHome > xgAway + 1.2) xgHome += 0.5;
  if (xgAway > xgHome + 1.2) xgAway += 0.5;

  // Aplikacja modyfikatorów taktyki, trenerów, czerwonych kartek, pogody
  xgHome = Math.max(0.05, xgHome * volatilityMult * hTacticMod * hCoachAtkMod * (1 / Math.max(0.5, hCoachDefMod)) * homeShortHanded.attackMult * awayShortHanded.defenseLeakMult * weatherMod * formImpact.homeGoalChanceMultiplier);
  xgAway = Math.max(0.05, xgAway * volatilityMult * aTacticMod * aCoachAtkMod * (1 / Math.max(0.5, aCoachDefMod)) * awayShortHanded.attackMult * homeShortHanded.defenseLeakMult * weatherMod * formImpact.awayGoalChanceMultiplier);

  // ── Generowanie goli 90 min (Poisson z nasyceniem) ───────────────────
  let homeScore90 = getGoalsPoissonLike(xgHome, rng, 200, isChaosMatch);
  let awayScore90 = getGoalsPoissonLike(xgAway, rng, 300, isChaosMatch);
  const routedScore90 = applyRareMismatchRout(
    homeScore90,
    awayScore90,
    homeClub,
    awayClub,
    xgHome,
    xgAway,
    rng,
    isChaosMatch
  );
  homeScore90 = routedScore90.homeScore;
  awayScore90 = routedScore90.awayScore;

  // ── Karne w trakcie meczu (Stage 2 — zależne od sędziego) ───────────
  // Prawdopodobieństwo na mecz (suma ~95 minut): strictness/300 na drużynę
  const penThreshold = (referee.strictness / 300) * refExpFactor;
  const inMatchGoals: { playerName: string; playerId?: string; assistId?: string; minute: number; teamId: string; isPenalty: boolean; varDisallowed?: boolean }[] = [];

  const tryPenalty = (side: 'H' | 'A', rollOffset: number) => {
    if (rng(rollOffset) >= penThreshold) return;
    const isScored = rng(rollOffset + 1) < 0.78;
    const teamPlayers = side === 'H' ? homePlayersAll : awayPlayersAll;
    const lineup     = side === 'H' ? homeLineup     : awayLineup;
    const subs       = side === 'H' ? homeAllSubs    : awayAllSubs;
    const exits      = side === 'H' ? homeTimeline.appliedExits : awayTimeline.appliedExits;
    const penMin     = Math.floor(5 + rng(rollOffset + 2) * 85);
    if (rng(rollOffset + 4) > getShortHandedGoalChance(exits, penMin)) return;
    const activeXI   = getActiveLineupAt(penMin, lineup.startingXI, subs, exits);
    const kicker     = GoalAttributionService.pickScorer(teamPlayers, activeXI, false, () => rng(rollOffset + 3));
    if (!kicker) return;
    if (isScored) {
      inMatchGoals.push({ playerName: formatPlayerReportName(kicker), playerId: kicker.id, minute: penMin, teamId: side === 'H' ? homeClub.id : awayClub.id, isPenalty: true });
    }
    // chybiony karny — nie dodajemy do scorers
  };
  tryPenalty('H', 9100);
  tryPenalty('A', 9200);

  const fatigueMap: Record<string, number> = { ...homeCardData.fatigueMap, ...awayCardData.fatigueMap };
  const fatigueDebtMap: Record<string, number> = { ...homeCardData.fatigueDebtMap, ...awayCardData.fatigueDebtMap };
  const injuryPenaltyMap: Record<string, number> = { ...homeCardData.injuryPenaltyMap, ...awayCardData.injuryPenaltyMap, ...homeInjuryData.injuryPenaltyMap, ...awayInjuryData.injuryPenaltyMap };

  // ── Atrybuowanie goli z VAR (Stage 2) ───────────────────────────────
  const attributeWithVAR = (
    count: number,
    teamId: string,
    teamPlayers: Player[],
    lineup: Lineup,
    subs: { min: number; outId: string; inId: string }[],
    exits: SimulatedExit[],
    baseOffset: number
  ): { entries: typeof inMatchGoals; adjustedScore: number } => {
    const entries: typeof inMatchGoals = [];
    const usedMinutes = new Set<number>();
    let adjustedScore = 0;
    for (let i = 0; i < count; i++) {
      let minute = Math.floor(1 + rng(baseOffset + i) * 94);
      while (usedMinutes.has(minute)) { minute = minute >= 96 ? 1 : minute + 1; }
      usedMinutes.add(minute);
      if (rng(baseOffset + i + 503) > getShortHandedGoalChance(exits, minute)) continue;
      const activeXI = getActiveLineupAt(minute, lineup.startingXI, subs, exits);
      const scorer = GoalAttributionService.pickScorer(teamPlayers, activeXI, false, () => rng(baseOffset + i + 500));
      const assist = scorer ? GoalAttributionService.pickAssistant(teamPlayers, activeXI, scorer.id, false, () => rng(baseOffset + i + 501)) : null;
      const isVarDisallowed = rng(baseOffset + i + 502) < 0.04;
      if (!isVarDisallowed) adjustedScore++;
      entries.push({
        playerName: scorer ? formatPlayerReportName(scorer) : '?',
        playerId: scorer?.id,
        assistId: assist?.id,
        minute,
        teamId,
        isPenalty: rng(baseOffset + i + 700) < 0.02,
        varDisallowed: isVarDisallowed || undefined,
      });
    }
    return { entries, adjustedScore };
  };

  const homeGoalData = attributeWithVAR(homeScore90, homeClub.id, homePlayersAll, homeLineup, homeAllSubs, homeTimeline.appliedExits, 400);
  const awayGoalData = attributeWithVAR(awayScore90, awayClub.id, awayPlayersAll, awayLineup, awayAllSubs, awayTimeline.appliedExits, 450);

  // Wynik po VAR
  let finalHomeScore90 = homeGoalData.adjustedScore + inMatchGoals.filter(g => g.teamId === homeClub.id).length;
  let finalAwayScore90 = awayGoalData.adjustedScore + inMatchGoals.filter(g => g.teamId === awayClub.id).length;

  // ── Zmiany → format historii ─────────────────────────────────────────
  const homeSubs = homeAllSubs.map(s => {
    const out = homePlayersAll.find(p => p.id === s.outId);
    const inP = homePlayersAll.find(p => p.id === s.inId);
    return { playerOutId: s.outId, playerOutName: out ? formatPlayerReportName(out) : '?', playerInId: s.inId, playerInName: inP ? formatPlayerReportName(inP) : '?', minute: s.min, teamId: homeClub.id };
  });
  const awaySubs = awayAllSubs.map(s => {
    const out = awayPlayersAll.find(p => p.id === s.outId);
    const inP = awayPlayersAll.find(p => p.id === s.inId);
    return { playerOutId: s.outId, playerOutName: out ? formatPlayerReportName(out) : '?', playerInId: s.inId, playerInName: inP ? formatPlayerReportName(inP) : '?', minute: s.min, teamId: awayClub.id };
  });

  // ── Dogrywka / karne ─────────────────────────────────────────────────
  let finalHomeScore = finalHomeScore90;
  let finalAwayScore = finalAwayScore90;
  let penaltyHome: number | undefined;
  let penaltyAway: number | undefined;
  let wentToExtraTime = false;

  const homeWinProb = adjustExtraTimeWinProbability(
    homeClub.reputation / (homeClub.reputation + awayClub.reputation),
    homeRedExits,
    awayRedExits
  );

  if (leg1Diff !== undefined && finalHomeScore90 - finalAwayScore90 === leg1Diff) {
    const etResult = simulateExtraTimeAndPenalties(finalHomeScore90, finalAwayScore90, homeWinProb, rng, 1000, leg1Diff);
    finalHomeScore = etResult.homeScore;
    finalAwayScore = etResult.awayScore;
    penaltyHome = etResult.penaltyHome;
    penaltyAway = etResult.penaltyAway;
    wentToExtraTime = true;
  } else if (isFinalMatch && finalHomeScore90 === finalAwayScore90) {
    const etResult = simulateExtraTimeAndPenalties(finalHomeScore90, finalAwayScore90, homeWinProb, rng, 1000, undefined);
    finalHomeScore = etResult.homeScore;
    finalAwayScore = etResult.awayScore;
    penaltyHome = etResult.penaltyHome;
    penaltyAway = etResult.penaltyAway;
    wentToExtraTime = true;
  }

  // ── Bramki w dogrywce (min. 91-120) ─────────────────────────────────
  const etGoals: typeof inMatchGoals = [];
  if (wentToExtraTime) {
    const etHomeCount = finalHomeScore - finalHomeScore90;
    const etAwayCount = finalAwayScore - finalAwayScore90;
    const usedETMin = new Set<number>();

    for (let i = 0; i < etHomeCount; i++) {
      let minute = Math.floor(91 + rng(2000 + i) * 30);
      while (usedETMin.has(minute)) { minute = minute >= 120 ? 91 : minute + 1; }
      usedETMin.add(minute);
      const activeXI = getActiveLineupAt(minute, homeLineup.startingXI, homeAllSubs, homeTimeline.appliedExits);
      const scorer = GoalAttributionService.pickScorer(homePlayersAll, activeXI, false, () => rng(2000 + i + 500));
      etGoals.push({ playerName: scorer ? formatPlayerReportName(scorer) : '?', playerId: scorer?.id, minute, teamId: homeClub.id, isPenalty: false });
    }

    for (let i = 0; i < etAwayCount; i++) {
      let minute = Math.floor(91 + rng(2100 + i) * 30);
      while (usedETMin.has(minute)) { minute = minute >= 120 ? 91 : minute + 1; }
      usedETMin.add(minute);
      const activeXI = getActiveLineupAt(minute, awayLineup.startingXI, awayAllSubs, awayTimeline.appliedExits);
      const scorer = GoalAttributionService.pickScorer(awayPlayersAll, activeXI, false, () => rng(2100 + i + 500));
      etGoals.push({ playerName: scorer ? formatPlayerReportName(scorer) : '?', playerId: scorer?.id, minute, teamId: awayClub.id, isPenalty: false });
    }
  }

  // ── Oceny zawodników (Stage 2) ───────────────────────────────────────
  const ratings: Record<string, number> = {};
  const homeWin = finalHomeScore > finalAwayScore;
  const awayWin = finalAwayScore > finalHomeScore;
  const isDraw  = finalHomeScore === finalAwayScore;
  const allGoals = [...homeGoalData.entries, ...awayGoalData.entries, ...inMatchGoals, ...etGoals];
  const allCards = [...homeCardData.cards, ...awayCardData.cards];

  const generateRating = (pId: string, isHome: boolean) => {
    const p = (isHome ? homePlayersAll : awayPlayersAll).find(x => x.id === pId);
    if (!p) return;
    const teamWon = isHome ? homeWin : awayWin;
    const r = rng(pId.length + 90 + 999);
    let score = teamWon ? (6.2 + r * 1.5) : (isDraw ? (5.2 + r * 1.5) : (4.0 + r * 1.8));
    // Bramki i asysty
    const pGoals   = allGoals.filter(g => g.playerId === pId && !g.varDisallowed).length;
    const pAssists = allGoals.filter(g => g.assistId === pId && !g.varDisallowed).length;
    score += (pGoals * 1.0) + (pAssists * 0.6);
    // GK / DEF — czyste konto
    const conceded = isHome ? finalAwayScore : finalHomeScore;
    if (p.position === PlayerPosition.GK || p.position === 'DEF' as any) {
      if (conceded === 0) score += 1.2;
      else score -= (conceded * 0.3);
    }
    // Kary za kartki
    allCards.filter(c => c.playerId === pId).forEach(c => {
      if (c.type === 'RED' || c.type === 'SECOND_YELLOW') score -= 3.0;
      if (c.type === 'YELLOW') score -= 0.5;
    });
    ratings[pId] = parseFloat(Math.min(10, Math.max(1, score)).toFixed(1));
  };

  Object.keys(homeMinutesPlayedMap).forEach(id => generateRating(id, true));
  Object.keys(awayMinutesPlayedMap).forEach(id => generateRating(id, false));

  return {
    homeScore: finalHomeScore,
    awayScore: finalAwayScore,
    penaltyHome,
    penaltyAway,
    wentToExtraTime,
    goals: allGoals.sort((a, b) => a.minute - b.minute),
    cards: allCards,
    substitutions: [
      ...homeSubs,
      ...awaySubs,
      ...homeTimeline.appliedExits.map(s => { const out = homePlayersAll.find(p => p.id === s.outId); return { playerOutId: s.outId, playerOutName: out ? formatPlayerReportName(out) : '?', playerInName: '', minute: s.min, teamId: homeClub.id }; }),
      ...awayTimeline.appliedExits.map(s => { const out = awayPlayersAll.find(p => p.id === s.outId); return { playerOutId: s.outId, playerOutName: out ? formatPlayerReportName(out) : '?', playerInName: '', minute: s.min, teamId: awayClub.id }; }),
    ],
    updatedHomePlayers: homeInjuryData.updatedPlayers,
    updatedAwayPlayers: awayInjuryData.updatedPlayers,
    participatingHomePlayerIds: Object.keys(homeMinutesPlayedMap),
    participatingAwayPlayerIds: Object.keys(awayMinutesPlayedMap),
    homeMinutesPlayedMap,
    awayMinutesPlayedMap,
    fatigueMap,
    fatigueDebtMap,
    injuryPenaltyMap,
    injuries: [...homeInjuryData.injuries, ...awayInjuryData.injuries],
    ratings,
  };
};

// ============================================================
//  GŁÓWNY PROCESOR CL / EL / CONF
// ============================================================
export const BackgroundMatchProcessorCL = {

  processChampionsLeagueEvent: (
    currentDate: Date,
    userTeamId: string | null,
    fixtures: Fixture[],
    clubs: Club[],
    players: Record<string, Player[]>,
    lineups: Record<string, Lineup>,
    seasonNumber: number,
    sessionSeed: number,
    coaches: Record<string, Coach> = {}
  ): { updatedFixtures: Fixture[]; updatedPlayers: Record<string, Player[]>; matchHistoryEntries: MatchHistoryEntry[] } => {
    RefereeService.initializePool();

    const dateStr = currentDate.toDateString();

    const todayMatches = fixtures.filter(f =>
      f.date.toDateString() === dateStr &&
      f.status === MatchStatus.SCHEDULED &&
           (f.leagueId === CompetitionType.CL_R1Q || f.leagueId === CompetitionType.CL_R1Q_RETURN ||
       f.leagueId === CompetitionType.CL_R2Q || f.leagueId === CompetitionType.CL_R2Q_RETURN ||
       f.leagueId === CompetitionType.CL_GROUP_STAGE ||
       f.leagueId === CompetitionType.CL_R16 || f.leagueId === CompetitionType.CL_R16_RETURN ||
             f.leagueId === CompetitionType.CL_QF || f.leagueId === CompetitionType.CL_QF_RETURN ||
             f.leagueId === CompetitionType.CL_SF || f.leagueId === CompetitionType.CL_SF_RETURN ||
       f.leagueId === CompetitionType.CL_FINAL ||
       // ── Liga Europy ────────────────────────────────────────────────────────
       f.leagueId === CompetitionType.EL_R1Q || f.leagueId === CompetitionType.EL_R1Q_RETURN ||
       f.leagueId === CompetitionType.EL_R2Q || f.leagueId === CompetitionType.EL_R2Q_RETURN ||
       f.leagueId === CompetitionType.EL_GROUP_STAGE ||
       f.leagueId === CompetitionType.EL_R16 || f.leagueId === CompetitionType.EL_R16_RETURN ||
       f.leagueId === CompetitionType.EL_QF || f.leagueId === CompetitionType.EL_QF_RETURN ||
       f.leagueId === CompetitionType.EL_SF || f.leagueId === CompetitionType.EL_SF_RETURN ||
       f.leagueId === CompetitionType.EL_FINAL ||       // ── Liga Konferencji ───────────────────────────────────────────────────
       f.leagueId === CompetitionType.CONF_R1Q || f.leagueId === CompetitionType.CONF_R1Q_RETURN ||
       f.leagueId === CompetitionType.CONF_R2Q || f.leagueId === CompetitionType.CONF_R2Q_RETURN ||
       f.leagueId === CompetitionType.CONF_GROUP_STAGE ||
       f.leagueId === CompetitionType.CONF_R16 || f.leagueId === CompetitionType.CONF_R16_RETURN ||
       f.leagueId === CompetitionType.CONF_QF || f.leagueId === CompetitionType.CONF_QF_RETURN ||
       f.leagueId === CompetitionType.CONF_SF || f.leagueId === CompetitionType.CONF_SF_RETURN ||
       f.leagueId === CompetitionType.CONF_FINAL) &&
      (
        // CONF: ZAWSZE symulowane w tle (nawet jeśli gra drużyna gracza)
        f.leagueId === CompetitionType.CONF_R1Q    || f.leagueId === CompetitionType.CONF_R1Q_RETURN ||
        f.leagueId === CompetitionType.CONF_R2Q    || f.leagueId === CompetitionType.CONF_R2Q_RETURN ||
        f.leagueId === CompetitionType.CONF_GROUP_STAGE ||
        f.leagueId === CompetitionType.CONF_R16    || f.leagueId === CompetitionType.CONF_R16_RETURN ||
        f.leagueId === CompetitionType.CONF_QF     || f.leagueId === CompetitionType.CONF_QF_RETURN  ||
        f.leagueId === CompetitionType.CONF_SF     || f.leagueId === CompetitionType.CONF_SF_RETURN  ||
        f.leagueId === CompetitionType.CONF_FINAL  ||
        // CL i EL FINAŁ: zawsze symulowany (mecz 1-mecz finałowy, brak live)
        f.leagueId === CompetitionType.CL_FINAL    ||
        f.leagueId === CompetitionType.EL_FINAL    ||
        // CL i EL pozostałe rundy: pomijamy mecze drużyny gracza (on gra live)
        (f.homeTeamId !== userTeamId && f.awayTeamId !== userTeamId)
      )
    );

    if (todayMatches.length === 0) return { updatedFixtures: fixtures, updatedPlayers: players, matchHistoryEntries: [] };

    let updatedFixtures = [...fixtures];
    let updatedPlayersMap = { ...players };
    const matchHistoryEntries: MatchHistoryEntry[] = [];
    // Zbiór sędziów już przydzielonych w tej kolejce — każdy sędzia tylko 1 mecz dziennie
    const usedRefereeIds = new Set<string>();

    todayMatches.forEach(fixture => {
      const home = clubs.find(c => c.id === fixture.homeTeamId);
      const away = clubs.find(c => c.id === fixture.awayTeamId);
      if (!home || !away) return;

      // Deterministyczny seed dla tej pary
      const matchHash = fixture.id.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
      const seed = (matchHash ^ sessionSeed) ^ (currentDate.getTime() / 1000 | 0);

      // Pobierz lub wygeneruj składy
      const homePlayers = updatedPlayersMap[fixture.homeTeamId] ?? [];
      const awayPlayers = updatedPlayersMap[fixture.awayTeamId] ?? [];
      const homeLineup = lineups[fixture.homeTeamId] ?? LineupService.autoPickLineup(fixture.homeTeamId, homePlayers, '4-4-2', null, { competitionId: fixture.leagueId as string, formAware: true, selectionSeed: `${fixture.id}_home` });
      const awayLineup = lineups[fixture.awayTeamId] ?? LineupService.autoPickLineup(fixture.awayTeamId, awayPlayers, '4-4-2', null, { competitionId: fixture.leagueId as string, formAware: true, selectionSeed: `${fixture.id}_away` });

      const isReturnLeg = fixture.leagueId === CompetitionType.CL_R1Q_RETURN
                       || fixture.leagueId === CompetitionType.CL_R2Q_RETURN
                       || fixture.leagueId === CompetitionType.CL_R16_RETURN
                       || fixture.leagueId === CompetitionType.CL_QF_RETURN
                       || fixture.leagueId === CompetitionType.CL_SF_RETURN
                       || fixture.leagueId === CompetitionType.EL_R1Q_RETURN
                       || fixture.leagueId === CompetitionType.EL_R2Q_RETURN
                       || fixture.leagueId === CompetitionType.EL_R16_RETURN
                       || fixture.leagueId === CompetitionType.EL_QF_RETURN
                       || fixture.leagueId === CompetitionType.EL_SF_RETURN
                       || fixture.leagueId === CompetitionType.CONF_R1Q_RETURN
                       || fixture.leagueId === CompetitionType.CONF_R2Q_RETURN
                       || fixture.leagueId === CompetitionType.CONF_R16_RETURN
                       || fixture.leagueId === CompetitionType.CONF_QF_RETURN
                       || fixture.leagueId === CompetitionType.CONF_SF_RETURN;

      const isFinal = fixture.leagueId === CompetitionType.CL_FINAL
                   || fixture.leagueId === CompetitionType.EL_FINAL
                   || fixture.leagueId === CompetitionType.CONF_FINAL;

      // Oblicz leg1Diff dla rewanżu
      let leg1Diff: number | undefined = undefined;
      if (isReturnLeg) {
        const firstLegId = fixture.id.replace('_RETURN', '');
        const firstLeg = updatedFixtures.find(f => f.id === firstLegId);
        if (firstLeg && firstLeg.homeScore !== null && firstLeg.awayScore !== null) {
          leg1Diff = (firstLeg.homeScore as number) - (firstLeg.awayScore as number);
        }
      }

      // ── Arbiter: FIFA/UEFA, inny kraj niż obie drużyny ─────────────
      const matchSeedStr = `${fixture.id}_${sessionSeed}`;
      const referee = RefereeService.assignInternationalReferee(
        matchSeedStr,
        home.country ?? 'POL',
        away.country ?? 'POL',
        usedRefereeIds
      );
      usedRefereeIds.add(referee.id);

      // ── Trenerzy (opcjonalni — domyślne atrybuty 50 jeśli brak) ──────
      const DEFAULT_COACH_ATTRS = { experience: 50, decisionMaking: 50, motivation: 50, training: 50 };
      const homeCoach: Coach = coaches[fixture.homeTeamId] ?? { id: 'default_h', firstName: '', lastName: '', age: 0, nationality: '', nationalityFlag: '', attributes: DEFAULT_COACH_ATTRS, history: [], seasonStats: [], currentClubId: null, hiredDate: '', contractEndDate: '', annualSalary: 0, expPoints: 1, blacklist: {}, favoriteTactics: { offensive: '', neutral: '', defensive: '' } };
      const awayCoach: Coach = coaches[fixture.awayTeamId] ?? { id: 'default_a', firstName: '', lastName: '', age: 0, nationality: '', nationalityFlag: '', attributes: DEFAULT_COACH_ATTRS, history: [], seasonStats: [], currentClubId: null, hiredDate: '', contractEndDate: '', annualSalary: 0, expPoints: 1, blacklist: {}, favoriteTactics: { offensive: '', neutral: '', defensive: '' } };

      // ── Frekwencja i stadion ──────────────────────────────────────────
      const pseudoRng = ((seed * 9301 + 49297) % 233280) / 233280;
      let attendance: number;
      let venueLabel: string | undefined;
      let weatherCountry = home.country ?? 'POL';

      if (isFinal) {
        // Neutralny stadion dla finału — rotacja co sezon
        const venueList = fixture.leagueId === CompetitionType.CL_FINAL
          ? CL_FINAL_VENUES
          : fixture.leagueId === CompetitionType.EL_FINAL
            ? EL_FINAL_VENUES
            : CONF_FINAL_VENUES;
        const venueIdx = ((seasonNumber - 1) % venueList.length + venueList.length) % venueList.length;
        const venue = venueList[venueIdx];
        const fillRate = 0.98 + pseudoRng * 0.02;
        attendance = Math.floor(venue.capacity * fillRate);
        venueLabel = `${venue.name}, ${venue.city}`;
        weatherCountry = venue.country;
      } else {
        const homeRep = home.reputation;
        const awayRep = away.reputation;
        if (homeRep >= 18 || awayRep >= 18) {
          attendance = home.stadiumCapacity ?? 50000;
        } else {
          const combinedRep = homeRep + awayRep;
          const repNorm = Math.max(0, Math.min(1, (combinedRep - 2) / 32));
          const scatter = 0.10 * (1 - repNorm);
          const randomOffset = (pseudoRng * 2 - 1) * scatter;
          const fillRate = 0.45 + 0.47 * repNorm + randomOffset;
          const weatherMod = EuropeanWeatherService.getGoalModifier(home.country ?? 'POL', currentDate, pseudoRng);
          const weatherPenalty = weatherMod < 0.995 ? 0.88 : 1.0;
          attendance = Math.floor((home.stadiumCapacity ?? 20000) * Math.min(1, fillRate * weatherPenalty));
        }
      }

      // ── Pogoda ───────────────────────────────────────────────────────
      const weather = EuropeanWeatherService.getSnapshot(weatherCountry, currentDate, matchSeedStr);

      // ── Symulacja meczu ─────────────────────────────────────────────
      const result = simulateCLMatchFull(
        home, away, homePlayers, awayPlayers,
        homeLineup, awayLineup,
        currentDate, seed, referee, homeCoach, awayCoach, leg1Diff, isFinal
      );

      // ── Aktualizacja fixtures ────────────────────────────────────────
      updatedFixtures = updatedFixtures.map(f =>
        f.id === fixture.id
          ? {
              ...f,
              homeScore: result.homeScore,
              awayScore: result.awayScore,
              homePenaltyScore: result.penaltyHome,
              awayPenaltyScore: result.penaltyAway,
              status: MatchStatus.FINISHED,
            }
          : f
      );

      // ── Aktualizacja zawodników (kontuzje + zmęczenie + dług zmęczenia) ─
      const applyFatigueToTeam = (teamPlayers: Player[]): Player[] =>
        teamPlayers.map(p => {
          let updatedP = { ...p };
          const drain = result.fatigueMap[p.id];
          const debt  = result.fatigueDebtMap[p.id];
          if (drain !== undefined) {
            updatedP.condition = Math.max(0, (updatedP.condition ?? 100) - drain);
          }
          if (debt !== undefined) {
            updatedP.fatigueDebt = Math.min(100, (updatedP.fatigueDebt ?? 0) + debt);
          }
          const penalty = result.injuryPenaltyMap[p.id];
          if (penalty !== undefined && updatedP.health?.injury) {
            const condAfterPenalty = Math.max(0, (updatedP.condition ?? 100) - penalty);
            updatedP.health = { ...updatedP.health, injury: { ...updatedP.health.injury, conditionAtInjury: condAfterPenalty } };
            updatedP.condition = condAfterPenalty;
          }
          return updatedP;
        });

      updatedPlayersMap = {
        ...updatedPlayersMap,
        [fixture.homeTeamId]: applyFatigueToTeam(result.updatedHomePlayers),
        [fixture.awayTeamId]: applyFatigueToTeam(result.updatedAwayPlayers),
      };

      // ── STATYSTYKI EUROPEJSKIE (euroStats + euroSuspensionMatches) ─────────
      const emptyS = (): PlayerStats => ({ goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] });

      for (const [cId, minutesMap] of [[home.id, result.homeMinutesPlayedMap], [away.id, result.awayMinutesPlayedMap]] as [string, Record<string, number>][]) {
        updatedPlayersMap[cId] = updatedPlayersMap[cId].map(p => {
          const minutesPlayed = minutesMap[p.id];
          if (minutesPlayed === undefined) return p;
          const eur = { ...(p.euroStats ?? emptyS()) };
          eur.matchesPlayed += 1;
          eur.minutesPlayed += minutesPlayed;
          return { ...p, euroStats: eur };
        });
      }
      for (const cId of [home.id, away.id]) {
        updatedPlayersMap[cId] = updatedPlayersMap[cId].map(p => ({
          ...p,
          euroSuspensionMatches: Math.max(0, (p.euroSuspensionMatches ?? 0) - 1)
        }));
      }
      result.goals.filter(g => !g.varDisallowed && g.playerId).forEach(g => {
        for (const cId of Object.keys(updatedPlayersMap)) {
          updatedPlayersMap[cId] = updatedPlayersMap[cId].map(p => {
            if (p.id === g.playerId) return { ...p, euroStats: { ...(p.euroStats ?? emptyS()), goals: (p.euroStats?.goals ?? 0) + 1 } };
            if (g.assistId && p.id === g.assistId) return { ...p, euroStats: { ...(p.euroStats ?? emptyS()), assists: (p.euroStats?.assists ?? 0) + 1 } };
            return p;
          });
        }
      });
      result.cards.forEach(card => {
        const evType = card.type === 'RED' || card.type === 'SECOND_YELLOW' ? MatchEventType.RED_CARD : MatchEventType.YELLOW_CARD;
        for (const cId of Object.keys(updatedPlayersMap)) {
          updatedPlayersMap[cId] = updatedPlayersMap[cId].map(p => {
            if (p.id !== card.playerId) return p;
            const eur = { ...(p.euroStats ?? emptyS()) };
            let euroSusp = p.euroSuspensionMatches ?? 0;
            if (evType === MatchEventType.YELLOW_CARD) {
              eur.yellowCards += 1;
              if (eur.yellowCards % 4 === 0) euroSusp += 1;
            }
            if (evType === MatchEventType.RED_CARD) {
              eur.redCards += 1;
              euroSusp += 2;
            }
            return { ...p, euroStats: eur, euroSuspensionMatches: euroSusp };
          });
        }
      });

      // ── Statystyki sędziego ──────────────────────────────────────────
      const yellowsInMatch = result.cards.filter(c => c.type === 'YELLOW' || c.type === 'SECOND_YELLOW').length;
      const redsInMatch = result.cards.filter(c => c.type === 'RED' || c.type === 'SECOND_YELLOW').length;
      const refereeRating = RefereeService.generateMatchRating(referee);
      RefereeService.recordMatchStats(referee.id, refereeRating, yellowsInMatch, redsInMatch);

      // ── Historia meczu ───────────────────────────────────────────────
      matchHistoryEntries.push({
        matchId: fixture.id,
        date: currentDate.toISOString(),
        season: seasonNumber,
        competition: fixture.leagueId as string,
        homeTeamId: fixture.homeTeamId,
        awayTeamId: fixture.awayTeamId,
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        homePenaltyScore: result.penaltyHome,
        awayPenaltyScore: result.penaltyAway,
        isExtraTime: result.wentToExtraTime,
        goals: result.goals,
        cards: result.cards,
        substitutions: result.substitutions,
        injuries: result.injuries,
        refereeName: `${referee.firstName} ${referee.lastName}`,
        attendance,
        venue: venueLabel,
        weather,
        homeLineup: homeLineup.startingXI.filter((id): id is string => id !== null),
        awayLineup: awayLineup.startingXI.filter((id): id is string => id !== null),
        homeTacticId: homeLineup.tacticId,
        awayTacticId: awayLineup.tacticId,
        ratings: result.ratings,
      });
    });

    return { updatedFixtures, updatedPlayers: updatedPlayersMap, matchHistoryEntries };
  }
};
