import { Fixture, Club, Player, PlayerPosition, Lineup, MatchStatus, CompetitionType, InjurySeverity, MatchHistoryEntry, MatchEventType, Referee, Coach } from '../types';
import { TacticRepository } from '../resources/tactics_db';
import { GoalAttributionService } from './GoalAttributionService';
import { LineupService } from './LineupService';
import { EuropeanWeatherService } from './EuropeanWeatherService';
import { PlayerStatsService } from './PlayerStatsService';
import { RefereeService } from './RefereeService';

// ============================================================
//  WYNIK MECZU CL â€” rozszerzony o zdarzenia z zawodnikami
// ============================================================
interface CLMatchResult {
  homeScore: number;
  awayScore: number;
  penaltyHome?: number;
  penaltyAway?: number;
  wentToExtraTime: boolean;
  goals: { playerName: string; playerId?: string; assistId?: string; minute: number; teamId: string; isPenalty: boolean; varDisallowed?: boolean }[];
  cards: { playerId: string; playerName: string; minute: number; teamId: string; type: 'YELLOW' | 'RED' | 'SECOND_YELLOW' }[];
  substitutions: { playerOutName: string; playerInName: string; minute: number; teamId: string }[];
  updatedHomePlayers: Player[];
  updatedAwayPlayers: Player[];
  fatigueMap: Record<string, number>;
  fatigueDebtMap: Record<string, number>;
  injuryPenaltyMap: Record<string, number>;
  ratings: Record<string, number>;
}

// ============================================================
//  RNG â€” deterministyczny hash (sin-based jak LeagueBackgroundMatchEngine)
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
//  SIÅA LINII ZAWODNIKÃ“W
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
  // Nasycenie (satiety): mniejszy puÅ‚ap niÅ¼ wczeÅ›niej â€” eliminuje hokejowe wyniki
  let cur = Math.max(0.05, Math.min(isChaos ? 3.8 : 2.8, xg + (rng(baseOffset) - 0.5) * 0.35));
  for (let i = 0; i < 8; i++) {
    if (rng(baseOffset + 10 + i) < cur / (i + 1.15)) { g++; cur *= (isChaos ? 0.72 : 0.62); }
  }
  return g;
};

// ============================================================
//  SYMULACJA ZMIAN (3-5 na druÅ¼ynÄ™)
// ============================================================
const simulateSubs = (
  lineup: Lineup,
  teamPlayers: Player[],
  sideOffset: number,
  rng: (o: number) => number
): { matchSubs: { min: number; outId: string; inId: string }[]; allPlayedIds: string[] } => {
  const subCount = Math.floor(3 + rng(sideOffset) * 3); // 3-5 zmian
  const matchSubs: { min: number; outId: string; inId: string }[] = [];
  const currentXI = [...lineup.startingXI];
  const currentBench = [...lineup.bench];
  const participants = new Set(currentXI.filter((id): id is string => id !== null));

  for (let i = 0; i < subCount; i++) {
    const subMin = Math.floor(46 + rng(sideOffset + i + 100) * 42); // 46-88 min
    const outIdx = Math.floor(1 + rng(sideOffset + i + 200) * 10); // Unikamy GK (index 0)
    const playerOutId = currentXI[outIdx];
    if (!playerOutId) continue;

    const tacticSlots = TacticRepository.getById(lineup.tacticId).slots;
    const roleNeeded = outIdx < tacticSlots.length ? tacticSlots[outIdx].role : PlayerPosition.MID;

    const subInId = currentBench.find(id => teamPlayers.find(p => p.id === id)?.position === roleNeeded) ||
                    currentBench.find(id => teamPlayers.find(p => p.id === id)?.position !== PlayerPosition.GK);

    if (subInId) {
      matchSubs.push({ min: subMin, outId: playerOutId, inId: subInId });
      currentXI[outIdx] = subInId;
      currentBench.splice(currentBench.indexOf(subInId), 1);
      participants.add(subInId);
    }
  }
  return { matchSubs, allPlayedIds: Array.from(participants) };
};

// ============================================================
//  AKTYWNY SKÅAD W DANEJ MINUCIE
// ============================================================
const getActiveLineupAt = (
  min: number,
  originalXI: (string | null)[],
  subs: { min: number; outId: string; inId: string }[]
): string[] => {
  const current = [...originalXI];
  subs.filter(s => s.min <= min).forEach(s => {
    const idx = current.indexOf(s.outId);
    if (idx !== -1) current[idx] = s.inId;
  });
  return current.filter((id): id is string => id !== null);
};

// ============================================================
//  ATRYBUOWANIE GOLI DO ZAWODNIKÃ“W
// ============================================================
const attributeGoalsToPlayers = (
  count: number,
  teamId: string,
  teamPlayers: Player[],
  lineup: Lineup,
  subs: { min: number; outId: string; inId: string }[],
  rng: (o: number) => number,
  baseOffset: number
): { playerName: string; minute: number; teamId: string; isPenalty: boolean }[] => {
  const goals: { playerName: string; minute: number; teamId: string; isPenalty: boolean }[] = [];
  const usedMinutes = new Set<number>();

  for (let i = 0; i < count; i++) {
    let minute = Math.floor(1 + rng(baseOffset + i) * 94);
    while (usedMinutes.has(minute)) { minute = minute >= 96 ? 1 : minute + 1; }
    usedMinutes.add(minute);

    const activeXI = getActiveLineupAt(minute, lineup.startingXI, subs);
    const scorer = GoalAttributionService.pickScorer(teamPlayers, activeXI, false, () => rng(baseOffset + i + 500));
    const isPenalty = rng(baseOffset + i + 700) < 0.02;

    goals.push({
      playerName: scorer ? `${scorer.firstName} ${scorer.lastName}` : '?',
      minute,
      teamId,
      isPenalty,
    });
  }
  return goals;
};

// ============================================================
//  SYMULACJA KARTEK I KONTUZJI (z sÄ™dziÄ… FIFA/UEFA)
// ============================================================
const simulateCardsAndInjuries = (
  lineup: Lineup,
  players: Player[],
  teamId: string,
  offset: number,
  rng: (o: number) => number,
  referee: Referee,
  isHomeTeam: boolean
): {
  cards: { playerId: string; playerName: string; minute: number; teamId: string; type: 'YELLOW' | 'RED' | 'SECOND_YELLOW' }[];
  redCount: number;
  updatedPlayers: Player[];
  fatigueMap: Record<string, number>;
  fatigueDebtMap: Record<string, number>;
  injuryPenaltyMap: Record<string, number>;
} => {
  const cards: { playerId: string; playerName: string; minute: number; teamId: string; type: 'YELLOW' | 'RED' | 'SECOND_YELLOW' }[] = [];
  let redCount = 0;
  let updatedPlayers = [...players];
  const fatigueMap: Record<string, number> = {};
  const fatigueDebtMap: Record<string, number> = {};
  const injuryPenaltyMap: Record<string, number> = {};

  // SÄ™dzia: im mniej doÅ›wiadczony, tym wiÄ™cej chaosu; strictness â†’ surowoÅ›Ä‡
  const refExpFactor = 1 + (50 - (referee.experience || 50)) / 100;
  const yellowProb = 0.087 * (referee.strictness / 50) * refExpFactor;
  // Gospodarz korzysta z niewielkiego przywileju (advantageTendency)
  const homeBias = isHomeTeam ? -(referee.advantageTendency / 5000) : (referee.advantageTendency / 10000);
  const adjustedYellowProb = Math.max(0.02, yellowProb + homeBias);
  const directRedProb = 0.0033 * (referee.strictness / 50) * refExpFactor;

  lineup.startingXI.forEach((pId, idx) => {
    if (!pId) return;
    const p = players.find(x => x.id === pId);
    if (!p) return;
    const playerName = `${p.firstName} ${p.lastName}`;

    const isDirectRed = rng(offset + idx + 1500) < directRedProb;
    const yellowRoll = rng(offset + idx + 1000);
    const isSecondYellow = yellowRoll < adjustedYellowProb && rng(offset + idx + 1200) < 0.05;
    const isNormalYellow = yellowRoll < adjustedYellowProb && !isSecondYellow;

    if (isDirectRed) {
      const m = Math.max(1, Math.floor(10 + rng(offset + idx + 550) * 85));
      cards.push({ playerId: pId, playerName, minute: m, teamId, type: 'RED' });
      redCount++;
    } else if (isSecondYellow) {
      const m1 = Math.max(1, Math.floor(5 + rng(offset + idx + 660) * 40));
      const m2 = Math.max(m1 + 1, Math.floor(m1 + 10 + rng(offset + idx + 770) * 40));
      cards.push({ playerId: pId, playerName, minute: m1, teamId, type: 'YELLOW' });
      cards.push({ playerId: pId, playerName, minute: m2, teamId, type: 'SECOND_YELLOW' });
      redCount++;
    } else if (isNormalYellow) {
      const m = Math.max(1, Math.floor(5 + rng(offset + idx + 880) * 90));
      cards.push({ playerId: pId, playerName, minute: m, teamId, type: 'YELLOW' });
    }

    const isInjured = rng(offset + idx + 2000) < 0.0064;
    if (isInjured) {
      const isSev = rng(idx + 3000) < 0.15;
      const days = isSev
        ? (14 + Math.floor(rng(idx + 3100) * 30))
        : (2 + Math.floor(rng(idx + 3200) * 6));
      updatedPlayers = updatedPlayers.map(pl => pl.id === pId ? {
        ...pl,
        health: {
          status: 'INJURED' as any,
          injury: {
            type: isSev ? 'PowaÅ¼ny uraz wiÄ™zadeÅ‚' : 'StÅ‚uczenie miÄ™Å›nia',
            daysRemaining: days,
            severity: isSev ? InjurySeverity.SEVERE : InjurySeverity.LIGHT,
            injuryDate: new Date().toISOString(),
            totalDays: days,
          }
        }
      } : pl);
      injuryPenaltyMap[pId] = (isSev ? 55 : 20) + rng(offset + idx + 5000) * 15;
    }

    const stamina = p.attributes.stamina || 50;
    const stamEff = Math.pow((100 - stamina) / 100, 1.2) * 10;
    let drain = 2.5 + rng(offset + idx + 4000) * 1.5 + (stamEff * 0.5) + 1.5;
    if (p.position === PlayerPosition.GK) drain *= 0.15;
    fatigueMap[pId] = drain;
    fatigueDebtMap[pId] = 5 + ((100 - stamina) * 0.15);
  });

  return { cards, redCount, updatedPlayers, fatigueMap, fatigueDebtMap, injuryPenaltyMap };
};

// ============================================================
//  DOGRYWKA + KARNE â€” poprawiona wersja
// ============================================================
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

  // Sprawdzenie remisu: dla rewanÅ¼u â€” agregat, dla finaÅ‚u â€” wynik meczu
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

    // Sudden death â€” aÅ¼ do rozstrzygniÄ™cia
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
//  GÅÃ“WNA FUNKCJA SYMULACJI MECZU Z ZAWODNIKAMI (Stage 2)
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

  // â”€â”€ SÄ™dzia (Stage 2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const refExpFactor = 1 + (50 - (referee.experience || 50)) / 100;

  // â”€â”€ Taktyka + Clash Matrix (Stage 2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const hTactic = TacticRepository.getById(homeLineup.tacticId);
  const aTactic = TacticRepository.getById(awayLineup.tacticId);
  const hClashBase = TACTIC_CLASH_MATRIX[homeLineup.tacticId]?.[awayLineup.tacticId] ?? 4;
  const aClashBase = TACTIC_CLASH_MATRIX[awayLineup.tacticId]?.[homeLineup.tacticId] ?? 4;
  const hClashFinal = Math.round(hClashBase + rng(900) * 1.5);
  const aClashFinal = Math.round(aClashBase + rng(901) * 1.5);
  const hTacticMod = getEffectivenessMult(hClashFinal);
  const aTacticMod = getEffectivenessMult(aClashFinal);

  // â”€â”€ Trenerzy (Stage 2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Normalizacja: atrybuty 0-100 â†’ bonus Â±%
  const hCoachAtkMod = 1.0 + ((homeCoach.attributes.motivation - 50) * 0.002) + ((homeCoach.attributes.experience - 50) * 0.001);
  const hCoachDefMod = 1.0 + ((homeCoach.attributes.decisionMaking - 50) * 0.002);
  const aCoachAtkMod = 1.0 + ((awayCoach.attributes.motivation - 50) * 0.002) + ((awayCoach.attributes.experience - 50) * 0.001);
  const aCoachDefMod = 1.0 + ((awayCoach.attributes.decisionMaking - 50) * 0.002);

  // â”€â”€ SiÅ‚a zawodnikÃ³w â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const hStr = getLineStrength(homePlayersAll, homeLineup.startingXI);
  const aStr = getLineStrength(awayPlayersAll, awayLineup.startingXI);

  // â”€â”€ Forma dzienna â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const homeDailyForm = (rng(11) - 0.5) * 0.3;
  const awayDailyForm = (rng(12) - 0.5) * 0.3;

  // â”€â”€ Chaos / Stale factor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const chaosRoll = rng(7);
  const isChaosMatch = chaosRoll < 0.035;
  const isStaleMatch = chaosRoll > 0.94;
  const volatilityMult = isChaosMatch ? 1.65 : (isStaleMatch ? 0.50 : 1.0);

  // â”€â”€ Pogoda (klimat kraju gospodarza) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const homeCountry = homeClub.country ?? 'POL';
  const weatherMod = EuropeanWeatherService.getGoalModifier(homeCountry, date, rng(13));

  // â”€â”€ Pre-roll czerwonych kartek (z sÄ™dziÄ…) â†’ korekta XG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const directRedProb = 0.0033 * (referee.strictness / 50) * refExpFactor;
  const yellowProb    = 0.087  * (referee.strictness / 50) * refExpFactor;
  let homeRedPre = 0;
  let awayRedPre = 0;
  homeLineup.startingXI.forEach((_, idx) => {
    if (rng(10000 + idx + 1500) < directRedProb) homeRedPre++;
    else if (rng(10000 + idx + 1000) < yellowProb && rng(10000 + idx + 1200) < 0.05) homeRedPre++;
  });
  awayLineup.startingXI.forEach((_, idx) => {
    if (rng(20000 + idx + 1500) < directRedProb) awayRedPre++;
    else if (rng(20000 + idx + 1000) < yellowProb && rng(20000 + idx + 1200) < 0.05) awayRedPre++;
  });

  // â”€â”€ XG z bonusami trenerÃ³w, taktyki i siÅ‚y zawodnikÃ³w â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const repDiff = homeClub.reputation - awayClub.reputation;
  let xgHome = 1.25
    + (repDiff * 0.015)
    + (hTactic.attackBias - 50) / 180
    + ((hStr.att - aStr.def) * 0.04)
    + homeDailyForm
    + 0.08; // przewaga domowa

  let xgAway = 1.05
    - (repDiff * 0.015)
    + (aTactic.attackBias - 50) / 180
    + ((aStr.att - hStr.def) * 0.04)
    + awayDailyForm;

  if (xgHome > xgAway + 1.2) xgHome += 0.5;
  if (xgAway > xgHome + 1.2) xgAway += 0.5;

  // Aplikacja modyfikatorÃ³w taktyki, trenerÃ³w, czerwonych kartek, pogody
  xgHome = Math.max(0.05, xgHome * volatilityMult * hTacticMod * hCoachAtkMod * (1 / Math.max(0.5, hCoachDefMod)) * (1 - homeRedPre * 0.25) * (1 + awayRedPre * 0.20) * weatherMod);
  xgAway = Math.max(0.05, xgAway * volatilityMult * aTacticMod * aCoachAtkMod * (1 / Math.max(0.5, aCoachDefMod)) * (1 - awayRedPre * 0.25) * (1 + homeRedPre * 0.20) * weatherMod);

  // â”€â”€ Generowanie goli 90 min (Poisson z nasyceniem) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let homeScore90 = getGoalsPoissonLike(xgHome, rng, 200, isChaosMatch);
  let awayScore90 = getGoalsPoissonLike(xgAway, rng, 300, isChaosMatch);

  // â”€â”€ Karne w trakcie meczu (Stage 2 â€” zaleÅ¼ne od sÄ™dziego) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // PrawdopodobieÅ„stwo na mecz (suma ~95 minut): strictness/300 na druÅ¼ynÄ™
  const penThreshold = (referee.strictness / 300) * refExpFactor;
  const inMatchGoals: { playerName: string; playerId?: string; assistId?: string; minute: number; teamId: string; isPenalty: boolean; varDisallowed?: boolean }[] = [];

  const tryPenalty = (side: 'H' | 'A', rollOffset: number) => {
    if (rng(rollOffset) >= penThreshold) return;
    const isScored = rng(rollOffset + 1) < 0.78;
    const teamPlayers = side === 'H' ? homePlayersAll : awayPlayersAll;
    const lineup     = side === 'H' ? homeLineup     : awayLineup;
    const penMin     = Math.floor(5 + rng(rollOffset + 2) * 85);
    const activeXI   = getActiveLineupAt(penMin, lineup.startingXI, []);
    const kicker     = GoalAttributionService.pickScorer(teamPlayers, activeXI, false, () => rng(rollOffset + 3));
    if (!kicker) return;
    if (isScored) {
      if (side === 'H') homeScore90++; else awayScore90++;
      inMatchGoals.push({ playerName: `${kicker.firstName} ${kicker.lastName}`, playerId: kicker.id, minute: penMin, teamId: side === 'H' ? homeClub.id : awayClub.id, isPenalty: true });
    }
    // chybiony karny â€” nie dodajemy do scorers
  };
  tryPenalty('H', 9100);
  tryPenalty('A', 9200);

  // â”€â”€ Zmiany â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const homeSubData = simulateSubs(homeLineup, homePlayersAll, 5000, rng);
  const awaySubData = simulateSubs(awayLineup, awayPlayersAll, 6000, rng);

  // â”€â”€ Kartki i kontuzje z sÄ™dziÄ… (Stage 2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const homeCardData = simulateCardsAndInjuries(homeLineup, homePlayersAll, homeClub.id, 10000, rng, referee, true);
  const awayCardData = simulateCardsAndInjuries(awayLineup, awayPlayersAll, awayClub.id, 20000, rng, referee, false);

  // â”€â”€ ZmÄ™czenie â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fatigueMap: Record<string, number> = { ...homeCardData.fatigueMap, ...awayCardData.fatigueMap };
  const fatigueDebtMap: Record<string, number> = { ...homeCardData.fatigueDebtMap, ...awayCardData.fatigueDebtMap };
  const injuryPenaltyMap: Record<string, number> = { ...homeCardData.injuryPenaltyMap, ...awayCardData.injuryPenaltyMap };

  const homeSubIns = homeSubData.allPlayedIds.filter(id => !homeLineup.startingXI.includes(id));
  homeSubIns.forEach((id, idx) => {
    const p = homePlayersAll.find(x => x.id === id);
    if (!p) return;
    const stamina = p.attributes.stamina || 50;
    const stamEff = Math.pow((100 - stamina) / 100, 1.2) * 10;
    let drain = (2.5 + rng(7000 + idx) * 1.5 + (stamEff * 0.5) + 1.5) * 0.40;
    if (p.position === PlayerPosition.GK) drain *= 0.15;
    fatigueMap[id] = drain;
    fatigueDebtMap[id] = (5 + ((100 - stamina) * 0.15)) * 0.40;
  });
  const awaySubIns = awaySubData.allPlayedIds.filter(id => !awayLineup.startingXI.includes(id));
  awaySubIns.forEach((id, idx) => {
    const p = awayPlayersAll.find(x => x.id === id);
    if (!p) return;
    const stamina = p.attributes.stamina || 50;
    const stamEff = Math.pow((100 - stamina) / 100, 1.2) * 10;
    let drain = (2.5 + rng(8000 + idx) * 1.5 + (stamEff * 0.5) + 1.5) * 0.40;
    if (p.position === PlayerPosition.GK) drain *= 0.15;
    fatigueMap[id] = drain;
    fatigueDebtMap[id] = (5 + ((100 - stamina) * 0.15)) * 0.40;
  });

  // â”€â”€ Atrybuowanie goli z VAR (Stage 2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const attributeWithVAR = (
    count: number,
    teamId: string,
    teamPlayers: Player[],
    lineup: Lineup,
    subs: { min: number; outId: string; inId: string }[],
    baseOffset: number
  ): { entries: typeof inMatchGoals; adjustedScore: number } => {
    const entries: typeof inMatchGoals = [];
    const usedMinutes = new Set<number>();
    let adjustedScore = 0;
    for (let i = 0; i < count; i++) {
      let minute = Math.floor(1 + rng(baseOffset + i) * 94);
      while (usedMinutes.has(minute)) { minute = minute >= 96 ? 1 : minute + 1; }
      usedMinutes.add(minute);
      const activeXI = getActiveLineupAt(minute, lineup.startingXI, subs);
      const scorer = GoalAttributionService.pickScorer(teamPlayers, activeXI, false, () => rng(baseOffset + i + 500));
      const assist = scorer ? GoalAttributionService.pickAssistant(teamPlayers, activeXI, scorer.id, false, () => rng(baseOffset + i + 501)) : null;
      const isVarDisallowed = rng(baseOffset + i + 502) < 0.04;
      if (!isVarDisallowed) adjustedScore++;
      entries.push({
        playerName: scorer ? `${scorer.firstName} ${scorer.lastName}` : '?',
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

  const homeGoalData = attributeWithVAR(homeScore90, homeClub.id, homePlayersAll, homeLineup, homeSubData.matchSubs, 400);
  const awayGoalData = attributeWithVAR(awayScore90, awayClub.id, awayPlayersAll, awayLineup, awaySubData.matchSubs, 450);

  // Wynik po VAR
  let finalHomeScore90 = homeGoalData.adjustedScore + inMatchGoals.filter(g => g.teamId === homeClub.id).length;
  let finalAwayScore90 = awayGoalData.adjustedScore + inMatchGoals.filter(g => g.teamId === awayClub.id).length;

  // â”€â”€ Zmiany â†’ format historii â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const homeSubs = homeSubData.matchSubs.map(s => {
    const out = homePlayersAll.find(p => p.id === s.outId);
    const inP = homePlayersAll.find(p => p.id === s.inId);
    return { playerOutName: out ? `${out.firstName} ${out.lastName}` : '?', playerInName: inP ? `${inP.firstName} ${inP.lastName}` : '?', minute: s.min, teamId: homeClub.id };
  });
  const awaySubs = awaySubData.matchSubs.map(s => {
    const out = awayPlayersAll.find(p => p.id === s.outId);
    const inP = awayPlayersAll.find(p => p.id === s.inId);
    return { playerOutName: out ? `${out.firstName} ${out.lastName}` : '?', playerInName: inP ? `${inP.firstName} ${inP.lastName}` : '?', minute: s.min, teamId: awayClub.id };
  });

  // â”€â”€ Dogrywka / karne â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let finalHomeScore = finalHomeScore90;
  let finalAwayScore = finalAwayScore90;
  let penaltyHome: number | undefined;
  let penaltyAway: number | undefined;
  let wentToExtraTime = false;

  const homeWinProb = homeClub.reputation / (homeClub.reputation + awayClub.reputation);

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

  // â”€â”€ Oceny zawodnikÃ³w (Stage 2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const ratings: Record<string, number> = {};
  const homeWin = finalHomeScore > finalAwayScore;
  const awayWin = finalAwayScore > finalHomeScore;
  const isDraw  = finalHomeScore === finalAwayScore;
  const allGoals = [...homeGoalData.entries, ...awayGoalData.entries, ...inMatchGoals];
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
    // GK / DEF â€” czyste konto
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

  homeLineup.startingXI.filter((id): id is string => id !== null).forEach(id => generateRating(id, true));
  awayLineup.startingXI.filter((id): id is string => id !== null).forEach(id => generateRating(id, false));

  return {
    homeScore: finalHomeScore,
    awayScore: finalAwayScore,
    penaltyHome,
    penaltyAway,
    wentToExtraTime,
    goals: [...homeGoalData.entries, ...awayGoalData.entries, ...inMatchGoals],
    cards: allCards,
    substitutions: [...homeSubs, ...awaySubs],
    updatedHomePlayers: homeCardData.updatedPlayers,
    updatedAwayPlayers: awayCardData.updatedPlayers,
    fatigueMap,
    fatigueDebtMap,
    injuryPenaltyMap,
    ratings,
  };
};

// ============================================================
//  PROCESOR SUPERPUCHARU EUROPY (dedykowany silnik)
// ============================================================
export const BackgroundMatchUEFASuperCup = {

  processSuperCupMatch: (
    currentDate: Date,
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
      f.leagueId === CompetitionType.UEFA_SUPER_CUP
    );

    if (todayMatches.length === 0) return { updatedFixtures: fixtures, updatedPlayers: players, matchHistoryEntries: [] };

    let updatedFixtures = [...fixtures];
    let updatedPlayersMap = { ...players };
    const matchHistoryEntries: MatchHistoryEntry[] = [];
    const usedRefereeIds = new Set<string>();

    todayMatches.forEach(fixture => {
      const home = clubs.find(c => c.id === fixture.homeTeamId);
      const away = clubs.find(c => c.id === fixture.awayTeamId);
      if (!home || !away) return;

      const matchHash = fixture.id.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
      const seed = (matchHash ^ sessionSeed) ^ (currentDate.getTime() / 1000 | 0);

      const homePlayers = updatedPlayersMap[fixture.homeTeamId] ?? [];
      const awayPlayers = updatedPlayersMap[fixture.awayTeamId] ?? [];
      const homeLineup = lineups[fixture.homeTeamId] ?? LineupService.autoPickLineup(fixture.homeTeamId, homePlayers);
      const awayLineup = lineups[fixture.awayTeamId] ?? LineupService.autoPickLineup(fixture.awayTeamId, awayPlayers);

      // Superpuchar Europy: zawsze mecz finaÅ‚owy, brak rewanÅ¼u
      const isFinal = true;
      const leg1Diff: number | undefined = undefined;

      const matchSeedStr = `${fixture.id}_${sessionSeed}`;
      const referee = RefereeService.assignInternationalReferee(
        matchSeedStr,
        home.country ?? 'POL',
        away.country ?? 'POL',
        usedRefereeIds
      );
      usedRefereeIds.add(referee.id);

      const DEFAULT_COACH_ATTRS = { experience: 50, decisionMaking: 50, motivation: 50, training: 50 };
      const homeCoach: Coach = coaches[fixture.homeTeamId] ?? { id: 'default_h', firstName: '', lastName: '', age: 0, nationality: '', nationalityFlag: '', attributes: DEFAULT_COACH_ATTRS, history: [], currentClubId: null, hiredDate: '', blacklist: {}, favoriteTactics: { offensive: '', neutral: '', defensive: '' } };
      const awayCoach: Coach = coaches[fixture.awayTeamId] ?? { id: 'default_a', firstName: '', lastName: '', age: 0, nationality: '', nationalityFlag: '', attributes: DEFAULT_COACH_ATTRS, history: [], currentClubId: null, hiredDate: '', blacklist: {}, favoriteTactics: { offensive: '', neutral: '', defensive: '' } };

      const homeRep = home.reputation;
      const awayRep = away.reputation;
      let attendance: number;
      if (homeRep >= 18 || awayRep >= 18) {
        attendance = home.stadiumCapacity ?? 50000;
      } else {
        const pseudoRng = ((seed * 9301 + 49297) % 233280) / 233280;
        const combinedRep = homeRep + awayRep;
        const repNorm = Math.max(0, Math.min(1, (combinedRep - 2) / 32));
        const scatter = 0.10 * (1 - repNorm);
        const randomOffset = (pseudoRng * 2 - 1) * scatter;
        const fillRate = 0.45 + 0.47 * repNorm + randomOffset;
        const weatherMod = EuropeanWeatherService.getGoalModifier(home.country ?? 'POL', currentDate, pseudoRng);
        const weatherPenalty = weatherMod < 0.995 ? 0.88 : 1.0;
        attendance = Math.floor((home.stadiumCapacity ?? 20000) * Math.min(1, fillRate * weatherPenalty));
      }

      const weather = EuropeanWeatherService.getSnapshot(home.country ?? 'POL', currentDate, matchSeedStr);

      const result = simulateCLMatchFull(
        home, away, homePlayers, awayPlayers,
        homeLineup, awayLineup,
        currentDate, seed, referee, homeCoach, awayCoach, leg1Diff, isFinal
      );

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

      result.cards.forEach(card => {
        const eventType = card.type === 'RED' || card.type === 'SECOND_YELLOW'
          ? MatchEventType.RED_CARD
          : MatchEventType.YELLOW_CARD;
        updatedPlayersMap = PlayerStatsService.applyCard(updatedPlayersMap, card.playerId, eventType);
      });

      const yellowsInMatch = result.cards.filter(c => c.type === 'YELLOW' || c.type === 'SECOND_YELLOW').length;
      const redsInMatch = result.cards.filter(c => c.type === 'RED' || c.type === 'SECOND_YELLOW').length;
      const refereeRating = RefereeService.generateMatchRating(referee);
      RefereeService.recordMatchStats(referee.id, refereeRating, yellowsInMatch, redsInMatch);

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
        goals: result.goals.filter(g => !g.varDisallowed),
        cards: result.cards,
        substitutions: result.substitutions,
        refereeName: `${referee.firstName} ${referee.lastName}`,
        attendance,
        weather,
      });
    });

    return { updatedFixtures, updatedPlayers: updatedPlayersMap, matchHistoryEntries };
  }
};
