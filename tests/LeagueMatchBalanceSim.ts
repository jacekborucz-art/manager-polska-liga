/**
 * LEAGUE MATCH BALANCE SIMULATION (silnik ligowy MatchLiveView.tsx)
 * ==================================================================
 * Wiernie odtwarza pętlę minutową components/views/MatchLiveView.tsx importując
 * PRAWDZIWE serwisy gry (LiveMatchInstructionBalanceService, MomentumService,
 * MatchEngineService, TeamFormImpactService, GoalAttributionService,
 * MatchActionService, TacticalMatchupService, AiCoachTacticsService,
 * PreMatchBriefingService, PlayerPositionFitService, PlayerMoraleService).
 *
 * POMINIĘTE (symetrycznie dla OBU stron, nie zaburza balansu gracz vs AI):
 *  - kartki, rzuty karne, kontuzje, VAR, gole z rzutów wolnych
 *  - pogoda, sędzia, rywalizacje, presja ligowa (neutralna), konferencje prasowe
 *  - rozmowy w przerwie (obie strony bez efektu)
 *  - inteligencja zmian AI (obie strony: identyczna polityka zmian 58'/68'/78')
 *
 * Run:
 *   npx esbuild tests/LeagueMatchBalanceSim.ts --bundle --platform=node --format=cjs --outfile=tmp/league-balance-sim.cjs
 *   node tmp/league-balance-sim.cjs
 */

import { PlayerPosition, MatchEventType } from '../types';
import { TacticRepository } from '../resources/tactics_db';
import { LiveMatchInstructionBalanceService } from '../services/LiveMatchInstructionBalanceService';
import { MomentumService } from '../services/MomentumService';
import { MatchEngineService } from '../services/MatchEngineService';
import { TeamFormImpactService } from '../services/TeamFormImpactService';
import { GoalAttributionService } from '../services/GoalAttributionService';
import { MatchActionService } from '../services/MatchActionService';
import { PlayerPositionFitService } from '../services/PlayerPositionFitService';
import { TacticalMatchupService } from '../services/TacticalMatchupService';
import { PlayerMoraleService } from '../services/PlayerMoraleService';
import { AiCoachTacticsService } from '../services/AiCoachTacticsService';
import { analyzeClubFormImpact } from '../services/MatchFormService';
import { applyFocusToFormImpact } from '../services/MatchPrepFocusService';
import {
  calculateBriefingEffect,
  calculateAiCoachBriefingEffect,
  getSilenceEffect,
} from '../services/PreMatchBriefingService';

// ─── NARZĘDZIA ────────────────────────────────────────────────────────────────
const clampNumber = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// Identyczny seededRng jak w MatchLiveView.tsx
const seededRng = (seed: number, minute: number, offset = 0) => {
  const s = seed + minute + offset;
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
};

// Prosty mulberry32 do generowania składów (niezależny od silnika)
const mulberry32 = (a: number) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ─── GENEROWANIE SKŁADÓW ─────────────────────────────────────────────────────
type SquadOpts = {
  quality?: number;        // bazowe OVR (domyślnie 64)
  form?: number;           // player.form (domyślnie 50)
  morale?: number;         // morale (domyślnie 50)
};

const ATTR_KEYS = [
  'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking', 'finishing',
  'technique', 'vision', 'dribbling', 'heading', 'positioning', 'goalkeeping',
  'freeKicks', 'talent', 'penalties', 'corners', 'aggression', 'crossing',
  'leadership', 'mentality', 'workRate',
] as const;

const makePlayer = (
  id: string, pos: PlayerPosition, rng: () => number, opts: SquadOpts
): any => {
  const base = opts.quality ?? 64;
  const attributes: any = {};
  for (const key of ATTR_KEYS) {
    attributes[key] = Math.round(clampNumber(base + (rng() - 0.5) * 14, 42, 84));
  }
  attributes.goalkeeping = pos === PlayerPosition.GK
    ? Math.round(clampNumber(base + 6 + (rng() - 0.5) * 8, 50, 84))
    : Math.round(20 + rng() * 15);
  if (pos === PlayerPosition.DEF) {
    attributes.defending = Math.round(clampNumber(base + 7 + (rng() - 0.5) * 8, 48, 86));
    attributes.positioning = Math.round(clampNumber(base + 4 + (rng() - 0.5) * 8, 48, 86));
    attributes.heading = Math.round(clampNumber(base + 4 + (rng() - 0.5) * 8, 48, 86));
  }
  if (pos === PlayerPosition.MID) {
    attributes.passing = Math.round(clampNumber(base + 6 + (rng() - 0.5) * 8, 48, 86));
    attributes.vision = Math.round(clampNumber(base + 4 + (rng() - 0.5) * 8, 48, 86));
    attributes.technique = Math.round(clampNumber(base + 4 + (rng() - 0.5) * 8, 48, 86));
  }
  if (pos === PlayerPosition.FWD) {
    attributes.finishing = Math.round(clampNumber(base + 7 + (rng() - 0.5) * 8, 48, 86));
    attributes.attacking = Math.round(clampNumber(base + 6 + (rng() - 0.5) * 8, 48, 86));
    attributes.pace = Math.round(clampNumber(base + 4 + (rng() - 0.5) * 8, 48, 86));
  }
  const coreByPos: Record<string, string[]> = {
    GK: ['goalkeeping', 'positioning', 'strength'],
    DEF: ['defending', 'positioning', 'heading', 'strength'],
    MID: ['passing', 'vision', 'technique', 'stamina'],
    FWD: ['finishing', 'attacking', 'pace', 'technique'],
  };
  const core = coreByPos[pos];
  const overall = Math.round(core.reduce((s, k) => s + attributes[k], 0) / core.length);

  return {
    id,
    firstName: 'Sim',
    lastName: id,
    position: pos,
    age: 25,
    overallRating: overall,
    attributes,
    condition: 100,
    morale: opts.morale ?? 50,
    form: opts.form ?? 50,
    fatigueDebt: 0,
    health: { status: 'HEALTHY' },
    stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 10, minutesPlayed: 900, seasonalChanges: {}, ratingHistory: [6.5, 6.5, 6.5, 6.5, 6.5] },
  };
};

const SQUAD_SHAPE: Array<[PlayerPosition, number]> = [
  [PlayerPosition.GK, 2],
  [PlayerPosition.DEF, 5],
  [PlayerPosition.MID, 5],
  [PlayerPosition.FWD, 4],
];

const makeSquad = (prefix: string, seed: number, opts: SquadOpts): any[] => {
  const rng = mulberry32(seed);
  const players: any[] = [];
  let n = 0;
  for (const [pos, count] of SQUAD_SHAPE) {
    for (let i = 0; i < count; i++) {
      players.push(makePlayer(`${prefix}_${pos}_${i}`, pos, rng, opts));
      n++;
    }
  }
  return players;
};

// Klonuje skład (lustrzane drużyny — identyczne atrybuty, inne id)
const mirrorSquad = (squad: any[], prefix: string, opts: SquadOpts): any[] =>
  squad.map(p => ({
    ...p,
    id: p.id.replace(/^[^_]+/, prefix),
    lastName: p.id.replace(/^[^_]+/, prefix),
    morale: opts.morale ?? 50,
    form: opts.form ?? 50,
    attributes: { ...p.attributes },
    stats: { ...p.stats, ratingHistory: [...p.stats.ratingHistory] },
  }));

const buildLineup = (players: any[], tacticId: string) => {
  const tactic = TacticRepository.getById(tacticId);
  const pools: Record<string, any[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const p of players) pools[p.position].push(p);
  for (const k of Object.keys(pools)) pools[k].sort((a, b) => b.overallRating - a.overallRating);
  const used = new Set<string>();
  const startingXI: (string | null)[] = tactic.slots.map((slot: any) => {
    const pool = pools[slot.role] ?? [];
    const pick = pool.find(p => !used.has(p.id))
      // brak zawodnika nominalnej pozycji → najlepszy wolny gracz z pola
      ?? players.filter(p => !used.has(p.id) && p.position !== PlayerPosition.GK).sort((a, b) => b.overallRating - a.overallRating)[0];
    if (!pick) return null;
    used.add(pick.id);
    return pick.id;
  });
  const bench = players.filter(p => !used.has(p.id)).map(p => p.id);
  return { tacticId, startingXI, bench };
};

const makeClub = (id: string, name: string, reputation: number): any => ({
  id, name, shortName: name, reputation,
  morale: 50,
  stats: { points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, form: ['R', 'R', 'R', 'R', 'R'] },
  captainId: null, coachId: null, freeKickTakerId: null, leagueId: 'L1',
});

const makeCoach = (id: string, dm: number, exp: number, mot: number): any => ({
  id, firstName: 'Coach', lastName: id,
  attributes: { decisionMaking: dm, experience: exp, motivation: mot, tactical: 60, training: 60, manManagement: 60 },
});

// ─── REPLIKA POMOCNICZYCH FUNKCJI SILNIKA (MatchLiveView.tsx) ────────────────
const getQualityGapCurve = (gap: number): number => {
  const absGap = Math.abs(gap);
  if (absGap <= 2) return 0;
  const normalized = Math.min(1, (absGap - 2) / 18);
  return Math.sign(gap) * Math.pow(normalized, 1.35);
};

const getEffectiveXIStrength = (playersList: any[], lineup: any): number => {
  const tactic = TacticRepository.getById(lineup.tacticId);
  const activeRoleOveralls = lineup.startingXI
    .map((id: string | null, idx: number) => {
      if (!id) return null;
      const player = playersList.find(p => p.id === id);
      const role = tactic.slots[idx]?.role ?? player?.position;
      return player && role ? PlayerPositionFitService.getEffectiveRoleOverall(player, role, true) : null;
    })
    .filter((v: number | null): v is number => v !== null);
  if (activeRoleOveralls.length === 0) return 62;
  const avgOverall = activeRoleOveralls.reduce((s: number, o: number) => s + o, 0) / activeRoleOveralls.length;
  const structureFactor = Math.min(1, activeRoleOveralls.length / 11);
  return avgOverall * structureFactor;
};

const getMidfieldControl = (playersList: any[], xi: (string | null)[]): number => {
  const ids = xi.filter((id): id is string => id !== null);
  const midfielders = playersList.filter(p => ids.includes(p.id) && p.position === PlayerPosition.MID);
  if (midfielders.length === 0) return 60;
  return midfielders.reduce((acc, p) => acc + ((p.attributes.technique + p.attributes.passing) / 2), 0) / midfielders.length;
};

const _fatiguePenalty = (avgFat: number): number => {
  if (avgFat >= 94) return 0;
  const depth = (94 - avgFat) / 94;
  return -(Math.pow(depth, 1.25) * 0.42);
};

const getLiveInstructionFatigueMultiplier = (
  minute: number, tempo: string, intensity: string, pressing: string,
  subsUsed: number, startingXI: (string | null)[], fatigueMap: Record<string, number>
): number => {
  const ids = startingXI.filter((id): id is string => id !== null);
  if (ids.length === 0) return 1;
  const avgFatigue = ids.reduce((s, id) => s + (fatigueMap[id] ?? 100), 0) / ids.length;
  const tiredShare = ids.filter(id => (fatigueMap[id] ?? 100) < 82).length / ids.length;
  const exhaustedShare = ids.filter(id => (fatigueMap[id] ?? 100) < 70).length / ids.length;
  const exertionRaw =
    (tempo === 'FAST' ? 1.0 : tempo === 'SLOW' ? -0.35 : 0) +
    (intensity === 'AGGRESSIVE' ? 0.75 : intensity === 'CAUTIOUS' ? -0.30 : 0) +
    (pressing === 'PRESSING' ? 0.60 : 0);
  const exertionFactor = clampNumber(exertionRaw / 2.35, 0, 1);
  if (exertionFactor <= 0) return 1;
  const lateFactor = minute < 55 ? 0 : clampNumber((minute - 55) / 35, 0, 1);
  const rotationPressure = (Math.max(0, 4 - subsUsed) / 4) * lateFactor;
  const averageFatiguePressure = clampNumber((84 - avgFatigue) / 22, 0, 1);
  const individualFatiguePressure = clampNumber(tiredShare * 0.75 + exhaustedShare * 0.55, 0, 1);
  return clampNumber(
    1 + exertionFactor * (0.07 + rotationPressure * 0.26 + averageFatiguePressure * 0.18 + individualFatiguePressure * 0.22),
    1, 1.85
  );
};

// ─── KONFIGURACJA SCENARIUSZA ────────────────────────────────────────────────
type Instr = {
  tempo: 'SLOW' | 'NORMAL' | 'FAST';
  mindset: 'DEFENSIVE' | 'NEUTRAL' | 'OFFENSIVE';
  intensity: 'CAUTIOUS' | 'NORMAL' | 'AGGRESSIVE';
  passing: 'SHORT' | 'MIXED' | 'LONG';
  pressing: 'NONE' | 'NORMAL' | 'PRESSING';
  counterAttack: 'NORMAL' | 'COUNTER';
};

const NEUTRAL_INSTR: Instr = {
  tempo: 'NORMAL', mindset: 'NEUTRAL', intensity: 'NORMAL',
  passing: 'MIXED', pressing: 'NORMAL', counterAttack: 'NORMAL',
};

type Scenario = {
  id: string;
  desc: string;
  matches?: number;
  mirror?: boolean;                 // lustrzane składy (identyczne atrybuty)
  userInstr?: Partial<Instr>;
  userBriefingType?: string | null; // np. 'BLITZ' | 'RANDOM' | null (milczenie)
  aiBriefing?: boolean;             // AI dostaje briefing trenera (jak w grze)
  aiBrain?: boolean;                // AI: instrukcje przedmeczowe + decyzje w trakcie
  userQuality?: number;
  aiQuality?: number;
  userForm?: number;
  aiForm?: number;
  userMorale?: number;
  aiMorale?: number;
  userTactic?: string;
  aiTactic?: string;
  aiCoachDM?: number;
  aiCoachEXP?: number;
};

// ─── SYMULACJA JEDNEGO MECZU ─────────────────────────────────────────────────
const simulateMatch = (sc: Scenario, matchIdx: number) => {
  // Ten sam seed dla tego samego indeksu meczu we WSZYSTKICH scenariuszach —
  // różnice między scenariuszami pochodzą wyłącznie z konfiguracji, nie z losowania.
  const currentSeed = 100000 + matchIdx * 7919;
  const userSide: 'HOME' | 'AWAY' = matchIdx % 2 === 0 ? 'HOME' : 'AWAY';

  const userOpts: SquadOpts = { quality: sc.userQuality ?? 64, form: sc.userForm ?? 50, morale: sc.userMorale ?? 50 };
  const aiOpts: SquadOpts = { quality: sc.aiQuality ?? 64, form: sc.aiForm ?? 50, morale: sc.aiMorale ?? 50 };

  const userSquad = makeSquad('U', 555 + matchIdx * 17, userOpts);
  const aiSquad = sc.mirror
    ? mirrorSquad(userSquad, 'A', aiOpts)
    : makeSquad('A', 999 + matchIdx * 17, aiOpts);

  const homePlayers = userSide === 'HOME' ? userSquad : aiSquad;
  const awayPlayers = userSide === 'HOME' ? aiSquad : userSquad;

  const userTacticId = sc.userTactic ?? '4-4-2';
  const aiTacticId = sc.aiTactic ?? '4-4-2';
  const homeLineup = buildLineup(homePlayers, userSide === 'HOME' ? userTacticId : aiTacticId);
  const awayLineup = buildLineup(awayPlayers, userSide === 'HOME' ? aiTacticId : userTacticId);

  const homeClub = makeClub('H', 'Home SC', 60);
  const awayClub = makeClub('A', 'Away SC', 60);
  const userCoach = makeCoach('UC', 60, 60, 55);
  const aiCoach = makeCoach('AC', sc.aiCoachDM ?? 62, sc.aiCoachEXP ?? 62, 55);

  const ctx: any = {
    fixture: { id: `SIM_${matchIdx}`, date: new Date('2026-04-04'), leagueId: 'L1' },
    homeClub, awayClub, homePlayers, awayPlayers,
    homeCoach: userSide === 'HOME' ? userCoach : aiCoach,
    awayCoach: userSide === 'HOME' ? aiCoach : userCoach,
    homeAdvantage: true,
    competition: 'LEAGUE',
  };

  // Forma klubowa (neutralna 'R'×5 → symetryczna) — jak w silniku
  const matchDateStr = '2026-04-04';
  const matchSeed = new Date(matchDateStr).getTime() / 100000;
  const homeFormImpact = applyFocusToFormImpact(analyzeClubFormImpact(homeClub.stats.form, ctx.homeCoach), homeClub, matchDateStr, matchSeed);
  const awayFormImpact = applyFocusToFormImpact(analyzeClubFormImpact(awayClub.stats.form, ctx.awayCoach), awayClub, matchDateStr, matchSeed + 1);

  // ── BRIEFINGI PRZEDMECZOWE ──
  let userBriefing = getSilenceEffect();
  if (sc.userBriefingType) {
    const type = sc.userBriefingType === 'RANDOM'
      ? (['UPRISING', 'FORTRESS', 'WOUNDED_PRIDE', 'KAMIKAZE', 'TACTICIAN', 'BLITZ', 'PATIENCE', 'PROFESSIONALISM', 'DOMINANCE'] as const)[matchIdx % 9]
      : sc.userBriefingType;
    userBriefing = calculateBriefingEffect(type as any, 'EQUAL', currentSeed, 3);
  }
  const aiBriefing = sc.aiBriefing
    ? calculateAiCoachBriefingEffect(60, 60, aiCoach.attributes, currentSeed + 7, 'LEAGUE')
    : getSilenceEffect();

  // ── INSTRUKCJE STARTOWE ──
  const uInstr: Instr & Record<string, number> = {
    ...NEUTRAL_INSTR, ...(sc.userInstr ?? {}),
    tempoResponseFactor: 1, mindsetResponseFactor: 1, intensityResponseFactor: 1,
    passingResponseFactor: 1, pressingResponseFactor: 1, counterAttackResponseFactor: 1,
  } as any;
  // response factor jak w UI: przy zmianie z NORMAL losowany 0.6-1.4
  if (uInstr.tempo !== 'NORMAL') (uInstr as any).tempoResponseFactor = parseFloat((0.6 + seededRng(currentSeed, 0, 21) * 0.8).toFixed(2));
  if (uInstr.mindset !== 'NEUTRAL') (uInstr as any).mindsetResponseFactor = parseFloat((0.6 + seededRng(currentSeed, 0, 22) * 0.8).toFixed(2));
  if (uInstr.intensity !== 'NORMAL') (uInstr as any).intensityResponseFactor = parseFloat((0.6 + seededRng(currentSeed, 0, 23) * 0.8).toFixed(2));
  if (uInstr.passing !== 'MIXED') (uInstr as any).passingResponseFactor = parseFloat((0.6 + seededRng(currentSeed, 0, 24) * 0.8).toFixed(2));
  if (uInstr.pressing === 'PRESSING') (uInstr as any).pressingResponseFactor = parseFloat((0.6 + seededRng(currentSeed, 0, 25) * 0.8).toFixed(2));

  // AI: instrukcje przedmeczowe (jak MatchLiveView init — shout z expiry 999)
  let aiActiveShout: any = null;
  if (sc.aiBrain !== false) {
    const preMatchInstr = AiCoachTacticsService.decidePreMatchInstructions(
      userSide === 'HOME' ? awayClub : homeClub,
      aiCoach,
      aiSquad,
      userSide === 'HOME' ? homeClub : awayClub,
      userSquad,
      userTacticId,
      currentSeed
    );
    aiActiveShout = { id: 'pre_match', ...preMatchInstr, expiryMinute: 999 };
  }
  let aiNextInstructionMinute = 10 + Math.floor(seededRng(currentSeed, 0, 77) * 11);
  let aiExploitUntilMinute = -1;

  // ── STAN MECZU ──
  let homeScore = 0, awayScore = 0;
  let momentum = 0, momentumSum = 0, momentumTicks = 0;
  const homeFatigue: Record<string, number> = {};
  const awayFatigue: Record<string, number> = {};
  homePlayers.forEach(p => { homeFatigue[p.id] = p.condition; });
  awayPlayers.forEach(p => { awayFatigue[p.id] = p.condition; });
  const liveStats = {
    home: { shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, offsides: 0 },
    away: { shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, offsides: 0 },
  };
  let subsCountHome = 0, subsCountAway = 0;
  let activeTacticalBoost = 0, tacticalBoostExpiry = -1, lastGoalBoostMinute = -1;
  let nextHomeLineup = { ...homeLineup, startingXI: [...homeLineup.startingXI], bench: [...homeLineup.bench] };
  let nextAwayLineup = { ...awayLineup, startingXI: [...awayLineup.startingXI], bench: [...awayLineup.bench] };

  const firstZeroShotCheckMinute = 34 + Math.floor(seededRng(currentSeed, 0, 641) * 12);
  const secondZeroShotCheckMinute = 61 + Math.floor(seededRng(currentSeed, 0, 642) * 30);
  const satietyRoll = seededRng(currentSeed, 0, 999);

  const SUB_MINUTES = [58, 68, 78];

  for (let nextMinute = 1; nextMinute <= 90; nextMinute++) {
    const localHomeFatigue = homeFatigue;
    const localAwayFatigue = awayFatigue;
    const rngEvent = seededRng(currentSeed, nextMinute, 500);

    // ── KARY ZMĘCZENIA (inicjatywa) ──
    const _getAvgFatigue = (lineup: (string | null)[], map: Record<string, number>) => {
      const ids = lineup.filter((id): id is string => id !== null);
      if (ids.length === 0) return 100;
      return ids.reduce((a, id) => a + (map[id] ?? 100), 0) / ids.length;
    };
    const avgFatigueHome = _getAvgFatigue(nextHomeLineup.startingXI, localHomeFatigue);
    const avgFatigueAway = _getAvgFatigue(nextAwayLineup.startingXI, localAwayFatigue);
    const _rotationPenalty = (lineup: (string | null)[], map: Record<string, number>, ownSubs: number, oppSubs: number) => {
      if (nextMinute < 60 || ownSubs >= 2) return 0;
      const ids = lineup.filter((id): id is string => id !== null);
      if (ids.length === 0) return 0;
      const tiredShare = ids.filter(id => (map[id] ?? 100) < 84).length / ids.length;
      const lateFactor = Math.min(1, (nextMinute - 60) / 30);
      const rotationGap = Math.max(0, oppSubs - ownSubs);
      const pressure = ((2 - ownSubs) * 0.012) + tiredShare * 0.052 + rotationGap * 0.010;
      return -Math.min(0.085, pressure * lateFactor);
    };
    const homeFatPenalty = _fatiguePenalty(avgFatigueHome) + _rotationPenalty(nextHomeLineup.startingXI, localHomeFatigue, subsCountHome, subsCountAway);
    const awayFatPenalty = _fatiguePenalty(avgFatigueAway) + _rotationPenalty(nextAwayLineup.startingXI, localAwayFatigue, subsCountAway, subsCountHome);

    const playerFormImpact = TeamFormImpactService.calculateMatchImpact(homePlayers, awayPlayers, nextHomeLineup as any, nextAwayLineup as any);
    const getFormStackingMultiplier = (side: 'HOME' | 'AWAY') => {
      const sideMomentum = side === 'HOME' ? momentum : -momentum;
      if (sideMomentum <= 10) return 1;
      return 1 - Math.min(0.45, ((sideMomentum - 10) / 90) * 0.45);
    };
    const homeFormStacking = getFormStackingMultiplier('HOME');
    const awayFormStacking = getFormStackingMultiplier('AWAY');

    const homeScoreDiff = homeScore - awayScore;
    const userScoreDiff = userSide === 'HOME' ? homeScoreDiff : -homeScoreDiff;

    const homeMidfieldControl = getMidfieldControl(homePlayers, nextHomeLineup.startingXI);
    const awayMidfieldControl = getMidfieldControl(awayPlayers, nextAwayLineup.startingXI);
    const midfieldControlDiff = homeMidfieldControl - awayMidfieldControl;
    const midfieldInitiativeMod = Math.abs(midfieldControlDiff) <= 2 ? 0
      : Math.max(-0.026, Math.min(0.026, midfieldControlDiff * 0.0014));

    const homeAvgOverallLive = getEffectiveXIStrength(homePlayers, nextHomeLineup);
    const awayAvgOverallLive = getEffectiveXIStrength(awayPlayers, nextAwayLineup);
    const homeQualityGapLive = homeAvgOverallLive - awayAvgOverallLive;
    const qualityInitiativeMod = getQualityGapCurve(homeQualityGapLive) * 0.055;

    const shotGapLive = liveStats.home.shots - liveStats.away.shots;
    const shotDominanceInitiativeMod =
      nextMinute < 25 || Math.abs(shotGapLive) < 8 ? 0
        : -Math.sign(shotGapLive) * Math.min(0.055, (Math.abs(shotGapLive) - 7) * 0.006) *
          (Math.sign(shotGapLive) === Math.sign(homeQualityGapLive) && Math.abs(homeQualityGapLive) > 8 ? 0.45 : 1);

    const fatInitiativeMod = (homeFatPenalty - awayFatPenalty) * 3.0;
    const formInitiativeMod = (homeFormImpact.initiativeModifier * homeFormStacking) - (awayFormImpact.initiativeModifier * awayFormStacking);
    const playerFormInitiativeMod = clampNumber(
      (playerFormImpact.homeGoalChanceMultiplier - playerFormImpact.awayGoalChanceMultiplier) * 0.055, -0.060, 0.060
    );

    const homeAttackChance = Math.min(0.72, Math.max(0.28,
      0.5 + momentum / 280 + fatInitiativeMod + formInitiativeMod + playerFormInitiativeMod +
      midfieldInitiativeMod + qualityInitiativeMod + shotDominanceInitiativeMod
    ));

    let activeSide: 'HOME' | 'AWAY' = seededRng(currentSeed, nextMinute, 600) < homeAttackChance ? 'HOME' : 'AWAY';

    // Zero-shot rescue
    const isZeroShotCheckMinute = nextMinute === firstZeroShotCheckMinute || nextMinute === secondZeroShotCheckMinute;
    const shouldRescue = (side: 'HOME' | 'AWAY') => {
      const sideStats = side === 'HOME' ? liveStats.home : liveStats.away;
      if (!isZeroShotCheckMinute || sideStats.shots > 0) return false;
      const sideAttackChance = side === 'HOME' ? homeAttackChance : 1 - homeAttackChance;
      const sideQualityGap = side === 'HOME' ? homeQualityGapLive : -homeQualityGapLive;
      if (sideAttackChance < 0.30 || sideQualityGap < -16) return false;
      const lateCheck = nextMinute === secondZeroShotCheckMinute;
      if (sideQualityGap >= -8 && sideAttackChance >= 0.34) return true;
      return lateCheck && sideQualityGap >= -11 && sideAttackChance >= 0.35;
    };
    let forceZeroShotChance = false;
    const homeRescue = shouldRescue('HOME');
    const awayRescue = shouldRescue('AWAY');
    if (homeRescue || awayRescue) {
      activeSide = homeRescue && awayRescue ? activeSide : (homeRescue ? 'HOME' : 'AWAY');
      forceZeroShotChance = true;
    }

    // ── KONTRY ──
    const userCounterTactic = TacticRepository.getById(userSide === 'HOME' ? nextHomeLineup.tacticId : nextAwayLineup.tacticId);
    const opponentCounterTactic = TacticRepository.getById(userSide === 'HOME' ? nextAwayLineup.tacticId : nextHomeLineup.tacticId);
    const opponentPressure = userSide === 'HOME' ? Math.max(0, -momentum) : Math.max(0, momentum);
    const userPressure = userSide === 'HOME' ? Math.max(0, momentum) : Math.max(0, -momentum);
    const counterAttackEnabled = uInstr.counterAttack === 'COUNTER';
    const counterShape = uInstr.mindset === 'DEFENSIVE' || userCounterTactic.defenseBias >= 62 || userCounterTactic.attackBias <= 45;
    const opponentPushes = opponentPressure >= 35 || opponentCounterTactic.attackBias >= 62 || userScoreDiff > 0;
    let counterAttackTriggered = false, counterAttackShotBonus = 0;
    const uPlayersList = userSide === 'HOME' ? homePlayers : awayPlayers;
    const uXIList = userSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
    const oPlayersList = userSide === 'HOME' ? awayPlayers : homePlayers;
    const oXIList = userSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI;

    if (activeSide !== userSide && counterAttackEnabled && counterShape && opponentPushes) {
      const pressureFactor = clampNumber((opponentPressure - 25) / 75, 0, 1);
      const shapeFactor = clampNumber((userCounterTactic.defenseBias - 50) / 40, 0, 1);
      const opponentRiskFactor = clampNumber((opponentCounterTactic.attackBias - 50) / 45, 0, 1);
      const scoreFactor = userScoreDiff > 0 ? 0.03 : 0;
      const rf = (uInstr as any).counterAttackResponseFactor ?? 1.0;
      const counterChance = clampNumber((0.023 + pressureFactor * 0.054 + shapeFactor * 0.022 + opponentRiskFactor * 0.022 + scoreFactor) * rf, 0, 0.14);
      if (seededRng(currentSeed, nextMinute, 631) < counterChance) {
        activeSide = userSide;
        counterAttackTriggered = true;
        const q = LiveMatchInstructionBalanceService.getCounterAttackModifier(uPlayersList, uXIList, oPlayersList, oXIList);
        counterAttackShotBonus = clampNumber(0.011 + pressureFactor * 0.009 + opponentRiskFactor * 0.005 + q, 0.006, 0.028);
      }
    }

    let aiCounterAttackTriggered = false, aiCounterAttackShotBonus = 0;
    const aiSideForCounter: 'HOME' | 'AWAY' = userSide === 'HOME' ? 'AWAY' : 'HOME';
    const aiCounterAttackEnabled = aiActiveShout?.counterAttack === 'COUNTER';
    const aiCounterShoutMinute = aiActiveShout?.id?.startsWith('ai_') ? parseInt(aiActiveShout.id.replace('ai_', '')) : 0;
    const aiCounterResponseFactor = aiCounterAttackEnabled ? parseFloat((0.6 + seededRng(currentSeed, aiCounterShoutMinute, 806) * 0.8).toFixed(2)) : 1.0;
    const aiCounterTacticObj = TacticRepository.getById(userSide === 'HOME' ? nextAwayLineup.tacticId : nextHomeLineup.tacticId);
    const aiScoreDiffForCounter = -userScoreDiff;
    const aiCounterShape = aiCounterTacticObj.defenseBias >= 55 || aiActiveShout?.mindset === 'DEFENSIVE' || aiScoreDiffForCounter > 0;
    const userPushes = uInstr.mindset === 'OFFENSIVE' || userCounterTactic.attackBias >= 60 || userScoreDiff < 0;
    if (!counterAttackTriggered && activeSide === userSide && aiCounterAttackEnabled && aiCounterShape && userPushes) {
      const userPressFactor = clampNumber((userPressure - 25) / 75, 0, 1);
      const aiShapeFactor = clampNumber((aiCounterTacticObj.defenseBias - 50) / 40, 0, 1);
      const userRiskFactor = clampNumber((userCounterTactic.attackBias - 50) / 45, 0, 1);
      const aiScoreFactor = aiScoreDiffForCounter > 0 ? 0.03 : 0;
      const aiCounterChance = clampNumber((0.023 + userPressFactor * 0.054 + aiShapeFactor * 0.022 + userRiskFactor * 0.022 + aiScoreFactor) * aiCounterResponseFactor, 0, 0.14);
      if (seededRng(currentSeed, nextMinute, 641) < aiCounterChance) {
        activeSide = aiSideForCounter;
        aiCounterAttackTriggered = true;
        const q = LiveMatchInstructionBalanceService.getCounterAttackModifier(oPlayersList, oXIList, uPlayersList, uXIList);
        aiCounterAttackShotBonus = clampNumber(0.011 + userPressFactor * 0.009 + userRiskFactor * 0.005 + q, 0.006, 0.028);
      }
    }

    // ── SHOT THRESHOLD ──
    let shotThreshold = 0.11;
    const goalDiffAbs = Math.abs(homeScore - awayScore);
    const leads = (activeSide === 'HOME' && homeScore > awayScore) || (activeSide === 'AWAY' && awayScore > homeScore);
    if (leads && goalDiffAbs >= 3) {
      const satietyWeight = 0.3 + satietyRoll * 0.3;
      shotThreshold /= 1 + (goalDiffAbs - 1) * satietyWeight;
    }

    const defendingLineup2 = activeSide === 'HOME' ? nextAwayLineup : nextHomeLineup;
    const defendingTactic2 = TacticRepository.getById(defendingLineup2.tacticId);
    const defBiasPenalty = (defendingTactic2.defenseBias / 100) * 0.045;

    const attackingTeamPlayers2 = activeSide === 'HOME' ? homePlayers : awayPlayers;
    const attackingXI2 = (activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).filter((id): id is string => id !== null);
    const topStriker = attackingTeamPlayers2
      .filter(p => attackingXI2.includes(p.id) && p.position === PlayerPosition.FWD)
      .sort((a, b) => b.attributes.finishing - a.attributes.finishing)[0];
    const strikerBonus = topStriker
      ? Math.max(0, ((topStriker.attributes.finishing * PlayerMoraleService.getMatchMultiplier(topStriker)) - 55) / (77 - 55)) * 0.012
      : 0;

    let moraleTeamPenalty = 0;
    attackingXI2.forEach(id => {
      const player = attackingTeamPlayers2.find(p => p.id === id);
      if (!player) return;
      const morale = (player as any).morale ?? 50;
      const baseDebuff = morale <= 19 ? 0.097 : morale <= 39 ? 0.062 : 0;
      if (baseDebuff === 0) return;
      const mentalityResistance = (player.attributes.mentality ?? 50) / 100;
      moraleTeamPenalty += baseDebuff * (1 - mentalityResistance * 0.6) * (1 + (Math.random() * 0.10 - 0.05));
    });
    const moraleDebuffMultiplier = Math.max(0.15, 1 - moraleTeamPenalty);

    const activeFormImpact = activeSide === 'HOME' ? homeFormImpact : awayFormImpact;
    const defendingFormImpact = activeSide === 'HOME' ? awayFormImpact : homeFormImpact;
    const activePlayerFormImpact = activeSide === 'HOME' ? playerFormImpact.home : playerFormImpact.away;
    const defendingPlayerFormImpact = activeSide === 'HOME' ? playerFormImpact.away : playerFormImpact.home;
    const activePlayerFormChanceMultiplier = activeSide === 'HOME' ? playerFormImpact.homeGoalChanceMultiplier : playerFormImpact.awayGoalChanceMultiplier;
    const activeFormStacking = activeSide === 'HOME' ? homeFormStacking : awayFormStacking;
    const defendingFormStacking = activeSide === 'HOME' ? awayFormStacking : homeFormStacking;

    const activeFatPenalty = activeSide === 'HOME' ? homeFatPenalty : awayFatPenalty;
    const activeAvgFatigue = activeSide === 'HOME' ? avgFatigueHome : avgFatigueAway;
    const defendingAvgFatigue = activeSide === 'HOME' ? avgFatigueAway : avgFatigueHome;
    const relativeFreshnessShotSwing = clampNumber(((activeAvgFatigue - defendingAvgFatigue) / 100) * 0.18, -0.026, 0.026);

    const attackingTacticObj = TacticRepository.getById(activeSide === 'HOME' ? nextHomeLineup.tacticId : nextAwayLineup.tacticId);
    const defendingTacticObj = defendingTactic2;

    const attackingFatigueMap = activeSide === 'HOME' ? localHomeFatigue : localAwayFatigue;
    const defendingFatigueMap = activeSide === 'HOME' ? localAwayFatigue : localHomeFatigue;
    const attackingXIIds = attackingXI2;
    const defendingXIIds = (activeSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI).filter((id): id is string => id !== null);
    const tiredAttackers = attackingXIIds.filter(id => (attackingFatigueMap[id] ?? 100) < 82).length;
    const exhaustedAttackers = attackingXIIds.filter(id => (attackingFatigueMap[id] ?? 100) < 70).length;
    const tiredDefenders = defendingXIIds.filter(id => (defendingFatigueMap[id] ?? 100) < 82).length;
    const exhaustedDefenders = defendingXIIds.filter(id => (defendingFatigueMap[id] ?? 100) < 70).length;
    const freshDefenders = defendingXIIds.filter(id => (defendingFatigueMap[id] ?? 100) > 82).length;
    const criticalFatPenalty = Math.min(0.060, tiredAttackers * 0.006 + exhaustedAttackers * 0.010);
    const freshDefBonus = tiredAttackers >= 2 ? Math.min(0.040, freshDefenders * 0.006) : 0;
    const attackingSubsUsed = activeSide === 'HOME' ? subsCountHome : subsCountAway;
    const defendingSubsUsed = activeSide === 'HOME' ? subsCountAway : subsCountHome;
    const noRotationShotPenalty = nextMinute >= 60 && attackingSubsUsed <= 1
      ? Math.min(0.035, (2 - attackingSubsUsed) * 0.006 + tiredAttackers * 0.004 + exhaustedAttackers * 0.007) * Math.min(1, (nextMinute - 60) / 30)
      : 0;
    const rotationMismatchAttackBonus = nextMinute >= 60 && attackingSubsUsed >= 3 && defendingSubsUsed <= 1
      ? Math.min(0.024, 0.006 + Math.max(0, attackingSubsUsed - defendingSubsUsed - 1) * 0.003 + tiredDefenders * 0.003 + exhaustedDefenders * 0.005) * Math.min(1, (nextMinute - 60) / 30)
      : 0;
    const lateFatigueShotDrag = nextMinute >= 60 ? Math.min(0.052, noRotationShotPenalty * 0.75 + criticalFatPenalty * 0.35) : 0;
    const fatiguedShotFloor = Math.max(0.055, 0.10 - noRotationShotPenalty - criticalFatPenalty * 0.25);

    shotThreshold = Math.max(
      fatiguedShotFloor,
      shotThreshold
        - defBiasPenalty
        + strikerBonus
        + activeFatPenalty
        + relativeFreshnessShotSwing
        + activeFormImpact.shotModifier * activeFormStacking
        - defendingFormImpact.shotResistanceModifier * defendingFormStacking
        + rotationMismatchAttackBonus
        - criticalFatPenalty
        - freshDefBonus
        - noRotationShotPenalty
    );
    shotThreshold = Math.max(fatiguedShotFloor, shotThreshold * moraleDebuffMultiplier);

    const attackingAvgRating = activeSide === 'HOME' ? homeAvgOverallLive : awayAvgOverallLive;
    const defendingAvgRating = activeSide === 'HOME' ? awayAvgOverallLive : homeAvgOverallLive;
    const ratingGap = attackingAvgRating - defendingAvgRating;
    shotThreshold += Math.max(-0.014, Math.min(0.020, getQualityGapCurve(ratingGap) * 0.020));

    const activeShotsSoFar = activeSide === 'HOME' ? liveStats.home.shots : liveStats.away.shots;
    const defendingShotsSoFar = activeSide === 'HOME' ? liveStats.away.shots : liveStats.home.shots;
    const activeShotGap = activeShotsSoFar - defendingShotsSoFar;
    const shotVolumeDrag = nextMinute < 25 || activeShotGap < 8 ? 0
      : Math.min(0.034, (activeShotGap - 7) * 0.0026) * (ratingGap > 10 ? 0.40 : ratingGap > 6 ? 0.65 : 1.0);

    shotThreshold += Math.max(-0.016, Math.min(0.016, (attackingTacticObj.attackBias - 50) / 100 * 0.04));
    shotThreshold += TacticalMatchupService.evaluateShotMatchup(
      attackingTacticObj.id, defendingTacticObj.id,
      attackingTeamPlayers2,
      activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI,
      activeSide === 'HOME' ? awayPlayers : homePlayers,
      defendingLineup2.startingXI
    ).modifier;

    const activeMidfieldControlDiff = activeSide === 'HOME' ? midfieldControlDiff : -midfieldControlDiff;
    if (activeMidfieldControlDiff > 2) shotThreshold += Math.min(0.006, activeMidfieldControlDiff * 0.00045);
    else if (activeMidfieldControlDiff < -4) shotThreshold -= Math.min(0.004, Math.abs(activeMidfieldControlDiff) * 0.0003);

    const hasMomentumAdvantage = (activeSide === 'HOME' && momentum > 0) || (activeSide === 'AWAY' && momentum < 0);
    if (hasMomentumAdvantage) shotThreshold += (Math.abs(momentum) / 100) * 0.012;

    shotThreshold += (attackingTacticObj.pressingIntensity / 100) * 0.008;

    // ── INSTRUKCJE GRACZA ──
    const isUserAttacking = activeSide === userSide;
    const _getXIAvgAttr = (playersList: any[], xi: (string | null)[], attr: string): number => {
      const ids = xi.filter((id): id is string => id !== null);
      const active = playersList.filter(p => ids.includes(p.id));
      if (active.length === 0) return 60;
      return active.reduce((acc, p) => acc + p.attributes[attr], 0) / active.length;
    };
    const uAvgTech = _getXIAvgAttr(uPlayersList, uXIList, 'technique');
    const oAvgTech = _getXIAvgAttr(oPlayersList, oXIList, 'technique');
    const uAvgPace = _getXIAvgAttr(uPlayersList, uXIList, 'pace');
    const oAvgPace = _getXIAvgAttr(oPlayersList, oXIList, 'pace');
    const oppTacticDefBias = TacticRepository.getById(userSide === 'HOME' ? nextAwayLineup.tacticId : nextHomeLineup.tacticId).defenseBias;
    const aiOppTacticDefBias = TacticRepository.getById(userSide === 'HOME' ? nextHomeLineup.tacticId : nextAwayLineup.tacticId).defenseBias;

    if (uInstr.tempo === 'FAST') {
      const rf = (uInstr as any).tempoResponseFactor ?? 1.0;
      if (isUserAttacking) shotThreshold += 0.012 * rf;
      else {
        const counterBonus = oppTacticDefBias > 60 ? 0.010 : 0.004;
        shotThreshold += counterBonus * (uAvgTech > 62 ? 0.5 : 1.0) * rf;
      }
    } else if (uInstr.tempo === 'SLOW') {
      const rf = (uInstr as any).tempoResponseFactor ?? 1.0;
      if (isUserAttacking) shotThreshold += LiveMatchInstructionBalanceService.getSlowTempoModifier(uPlayersList, uXIList, oPlayersList, oXIList) * rf;
    }
    if (uInstr.mindset === 'OFFENSIVE') {
      const rf = (uInstr as any).mindsetResponseFactor ?? 1.0;
      if (isUserAttacking) shotThreshold += 0.015 * rf;
      else if (oppTacticDefBias > 65) shotThreshold += 0.012 * rf;
    } else if (uInstr.mindset === 'DEFENSIVE') {
      const rf = (uInstr as any).mindsetResponseFactor ?? 1.0;
      if (!isUserAttacking) shotThreshold -= LiveMatchInstructionBalanceService.getDefensiveMindsetModifier(uPlayersList, uXIList, oPlayersList, oXIList) * rf;
      else shotThreshold -= 0.005 * rf;
    }
    const userIntensityRisk = LiveMatchInstructionBalanceService.getIntensityRiskModifiers(
      uInstr.intensity as any, uPlayersList, uXIList, (uInstr as any).intensityResponseFactor ?? 1.0
    );
    if (uInstr.passing === 'SHORT') {
      const rf = (uInstr as any).passingResponseFactor ?? 1.0;
      const modifier = LiveMatchInstructionBalanceService.getShortPassingModifier(uPlayersList, uXIList, oPlayersList, oXIList, uInstr.tempo === 'FAST') * rf;
      shotThreshold += isUserAttacking ? modifier : -modifier;
    } else if (uInstr.passing === 'LONG') {
      const rf = (uInstr as any).passingResponseFactor ?? 1.0;
      const modifier = LiveMatchInstructionBalanceService.getLongPassingModifier(uPlayersList, uXIList, oPlayersList, oXIList, uInstr.tempo === 'FAST') * rf;
      shotThreshold += isUserAttacking ? modifier : -modifier;
    }
    if (uInstr.pressing === 'PRESSING') {
      const rf = (uInstr as any).pressingResponseFactor ?? 1.0;
      const modifier = LiveMatchInstructionBalanceService.getPressingModifier(uPlayersList, uXIList, oPlayersList, oXIList) * rf;
      shotThreshold += isUserAttacking ? modifier : -modifier;
    }
    shotThreshold += LiveMatchInstructionBalanceService.getCombinationModifier(
      uInstr.tempo as any, uInstr.mindset as any, uInstr.pressing as any, uInstr.counterAttack as any, isUserAttacking
    );

    if (counterAttackTriggered && isUserAttacking) shotThreshold += counterAttackShotBonus;
    if (aiCounterAttackTriggered && !isUserAttacking) shotThreshold += aiCounterAttackShotBonus;

    // ── DECYZJA AI (co ~10-20 min) ──
    if (sc.aiBrain !== false && nextMinute >= aiNextInstructionMinute) {
      const aiScoreDiff = -userScoreDiff;
      const aiMomentum = userSide === 'HOME' ? -momentum : momentum;
      const aiXIForDecision = oXIList;
      const aiFatMap = userSide === 'HOME' ? localAwayFatigue : localHomeFatigue;
      const aiFats = aiXIForDecision.filter((id): id is string => id !== null).map(id => aiFatMap[id] ?? 100);
      const aiAvgFat = aiFats.length ? aiFats.reduce((a, b) => a + b, 0) / aiFats.length : 100;
      const aiLowestFat = aiFats.length ? Math.min(...aiFats) : 100;
      const userFatMap = userSide === 'HOME' ? localHomeFatigue : localAwayFatigue;
      const userFats = uXIList.filter((id): id is string => id !== null).map(id => userFatMap[id] ?? 100);
      const userAvgFat = userFats.length ? userFats.reduce((a, b) => a + b, 0) / userFats.length : 100;
      const userLowestFat = userFats.length ? Math.min(...userFats) : 100;
      const aiSubsUsed = userSide === 'HOME' ? subsCountAway : subsCountHome;
      const userSubsUsed = userSide === 'HOME' ? subsCountHome : subsCountAway;
      const aiStats = userSide === 'HOME' ? liveStats.away : liveStats.home;
      const userStats = userSide === 'HOME' ? liveStats.home : liveStats.away;

      const decision = AiCoachTacticsService.decideInMatchInstructions(
        aiScoreDiff, aiMomentum, nextMinute,
        aiCoach.attributes.decisionMaking, aiCoach.attributes.experience,
        lastGoalBoostMinute, currentSeed,
        uInstr.mindset as any,
        userCounterTactic.attackBias,
        aiCounterTacticObj.defenseBias,
        {
          aiAvgFatigue: aiAvgFat, aiLowestFatigue: aiLowestFat,
          aiShots: aiStats.shots, userShots: userStats.shots,
          aiShotsOnTarget: aiStats.shotsOnTarget, userShotsOnTarget: userStats.shotsOnTarget,
          aiSubsRemaining: 5 - aiSubsUsed,
          userAvgFatigue: userAvgFat, userLowestFatigue: userLowestFat,
          userSubsRemaining: 5 - userSubsUsed,
          userSentOffCount: 0, userGoalkeeperCrisis: false,
          userTempo: uInstr.tempo as any,
          aiStakes: 'MID_TABLE', userStakes: 'MID_TABLE',
          aiRank: 10, userRank: 10, isLateSeason: false, rivalryMultiplier: 1,
          aiSentOffCount: 0,
          aiPaceAvg: oAvgPace, aiTechAvg: oAvgTech, userPaceAvg: uAvgPace, userTechAvg: uAvgTech,
          aiTacticId: aiCounterTacticObj.id, userTacticId: userCounterTactic.id,
        }
      );
      if (aiExploitUntilMinute > 0 && nextMinute > aiExploitUntilMinute) aiExploitUntilMinute = -1;
      const shouldHoldExploit =
        !decision && aiExploitUntilMinute >= nextMinute &&
        aiActiveShout?.mindset === 'OFFENSIVE' && aiActiveShout?.tempo === 'FAST' &&
        aiAvgFat > 55 && aiScoreDiff > -3;
      if (decision) {
        const { exploitUntilMinute, ...decisionShout } = decision as any;
        aiActiveShout = { id: `ai_${nextMinute}`, ...decisionShout, expiryMinute: -1 };
        aiExploitUntilMinute = exploitUntilMinute ?? -1;
      } else if (!shouldHoldExploit) {
        aiActiveShout = null;
        aiExploitUntilMinute = -1;
      }
      const coachReadiness = (aiCoach.attributes.decisionMaking + aiCoach.attributes.experience) / 2;
      const baseDelay = nextMinute >= 46 && nextMinute <= 75 ? Math.max(5, Math.round(12 - coachReadiness * 0.06)) : 10;
      const randomDelay = Math.floor(seededRng(currentSeed, nextMinute, 77) * (nextMinute >= 46 && nextMinute <= 75 ? 6 : 11));
      aiNextInstructionMinute = nextMinute + baseDelay + randomDelay;
    }

    // ── INSTRUKCJE AI (shout) ──
    const aiShoutMinute = aiActiveShout?.id?.startsWith('ai_') ? parseInt(aiActiveShout.id.replace('ai_', '')) : 0;
    const aiTempoRf = aiActiveShout ? parseFloat(((0.6 + seededRng(currentSeed, aiShoutMinute, 801) * 0.8) * (aiActiveShout.tempoResponseFactor ?? 1.0)).toFixed(2)) : 1.0;
    const aiMindsetRf = aiActiveShout ? parseFloat(((0.6 + seededRng(currentSeed, aiShoutMinute, 802) * 0.8) * (aiActiveShout.mindsetResponseFactor ?? 1.0)).toFixed(2)) : 1.0;
    const aiPassingRf = aiActiveShout ? parseFloat((0.6 + seededRng(currentSeed, aiShoutMinute, 803) * 0.8).toFixed(2)) : 1.0;
    const aiPressingRf = aiActiveShout ? parseFloat((0.6 + seededRng(currentSeed, aiShoutMinute, 804) * 0.8).toFixed(2)) : 1.0;
    const aiIntensityRf = aiActiveShout ? parseFloat(((0.6 + seededRng(currentSeed, aiShoutMinute, 805) * 0.8) * (aiActiveShout.intensityResponseFactor ?? 1.0)).toFixed(2)) : 1.0;

    const isAiAttacking = !isUserAttacking;
    if (aiActiveShout) {
      if (aiActiveShout.tempo === 'FAST') {
        if (isAiAttacking) shotThreshold += 0.012 * aiTempoRf;
        else {
          const counterBonus = aiOppTacticDefBias > 60 ? 0.010 : 0.004;
          shotThreshold += counterBonus * (oAvgTech > 62 ? 0.5 : 1.0) * aiTempoRf;
        }
      } else if (aiActiveShout.tempo === 'SLOW' && isAiAttacking) {
        shotThreshold += LiveMatchInstructionBalanceService.getSlowTempoModifier(oPlayersList, oXIList, uPlayersList, uXIList) * aiTempoRf;
      }
      if (aiActiveShout.mindset === 'OFFENSIVE') {
        if (isAiAttacking) shotThreshold += 0.015 * aiMindsetRf;
        else if (aiOppTacticDefBias > 65) shotThreshold += 0.012 * aiMindsetRf;
      } else if (aiActiveShout.mindset === 'DEFENSIVE') {
        if (!isAiAttacking) shotThreshold -= LiveMatchInstructionBalanceService.getDefensiveMindsetModifier(oPlayersList, oXIList, uPlayersList, uXIList) * aiMindsetRf;
        else shotThreshold -= 0.005 * aiMindsetRf;
      }
      if (aiActiveShout.pressing === 'PRESSING') {
        const modifier = LiveMatchInstructionBalanceService.getPressingModifier(oPlayersList, oXIList, uPlayersList, uXIList) * aiPressingRf;
        shotThreshold += isAiAttacking ? modifier : -modifier;
      }
      shotThreshold += LiveMatchInstructionBalanceService.getCombinationModifier(
        aiActiveShout.tempo, aiActiveShout.mindset, aiActiveShout.pressing ?? 'NORMAL', aiActiveShout.counterAttack, isAiAttacking
      );
      if (aiActiveShout.passing === 'SHORT') {
        const modifier = LiveMatchInstructionBalanceService.getShortPassingModifier(oPlayersList, oXIList, uPlayersList, uXIList, aiActiveShout.tempo === 'FAST') * aiPassingRf;
        shotThreshold += isAiAttacking ? modifier : -modifier;
      } else if (aiActiveShout.passing === 'LONG') {
        const modifier = LiveMatchInstructionBalanceService.getLongPassingModifier(oPlayersList, oXIList, uPlayersList, uXIList, aiActiveShout.tempo === 'FAST') * aiPassingRf;
        shotThreshold += isAiAttacking ? modifier : -modifier;
      }
    }

    // ── BUILD-UP ──
    const uFatigueMap = userSide === 'HOME' ? localHomeFatigue : localAwayFatigue;
    const oFatigueMap = userSide === 'HOME' ? localAwayFatigue : localHomeFatigue;
    const userBuildUpProfile = LiveMatchInstructionBalanceService.getBuildUpAccuracyProfile(
      uPlayersList, uXIList, oPlayersList, oXIList, uInstr.passing as any, uInstr.tempo as any, (aiActiveShout?.pressing ?? 'NORMAL') as any, uFatigueMap
    );
    const aiBuildUpProfile = LiveMatchInstructionBalanceService.getBuildUpAccuracyProfile(
      oPlayersList, oXIList, uPlayersList, uXIList, (aiActiveShout?.passing ?? 'MIXED') as any, (aiActiveShout?.tempo ?? 'NORMAL') as any, uInstr.pressing as any, oFatigueMap
    );
    const activeBuildUpProfile = isUserAttacking ? userBuildUpProfile : aiBuildUpProfile;
    shotThreshold += activeBuildUpProfile.shotModifier;
    const opponentPressingNow = isUserAttacking ? aiActiveShout?.pressing === 'PRESSING' : uInstr.pressing === 'PRESSING';
    shotThreshold -= activeBuildUpProfile.turnoverRisk * (opponentPressingNow ? 0.006 : 0.002);

    const aiIntensityRisk = LiveMatchInstructionBalanceService.getIntensityRiskModifiers(
      (aiActiveShout?.intensity ?? 'NORMAL') as any, oPlayersList, oXIList, aiIntensityRf
    );

    // ── CONTACT GOAL BOOST ──
    if (activeTacticalBoost !== 0 && nextMinute <= tacticalBoostExpiry) {
      const boostSide = activeTacticalBoost > 0 ? 'HOME' : 'AWAY';
      if (boostSide === activeSide) shotThreshold += Math.abs(activeTacticalBoost);
    }

    // ── BRIEFING ──
    const activeBriefing = userBriefing.expiryMinute >= nextMinute ? userBriefing : null;
    const activeAiBriefing = aiBriefing.expiryMinute >= nextMinute ? aiBriefing : null;
    const briefingFinishingFitMod = activeBriefing ? Math.max(0.96, Math.min(1.05, 1 + activeBriefing.goalMod * 1.25)) : 1.0;
    const aiBriefingFinishingFitMod = activeAiBriefing ? Math.max(0.96, Math.min(1.05, 1 + activeAiBriefing.goalMod * 1.25)) : 1.0;
    const briefingFreshnessDelta = activeBriefing ? Math.max(-3, Math.min(3, (1 - activeBriefing.fatigueMult) * 45)) : 0;
    const aiBriefingFreshnessDelta = activeAiBriefing ? Math.max(-3, Math.min(3, (1 - activeAiBriefing.fatigueMult) * 45)) : 0;

    if (activeBriefing) {
      if (isUserAttacking) {
        shotThreshold += activeBriefing.actionMod * 0.12;
        shotThreshold += (1 - activeBriefing.fatigueMult) * 0.04;
      } else if (activeBriefing.rivalBoost !== 0) {
        shotThreshold += activeBriefing.rivalBoost * 0.012;
      }
    }
    if (activeAiBriefing) {
      if (isAiAttacking) {
        shotThreshold += activeAiBriefing.actionMod * 0.12;
        shotThreshold += (1 - activeAiBriefing.fatigueMult) * 0.04;
      } else if (activeAiBriefing.rivalBoost !== 0) {
        shotThreshold += activeAiBriefing.rivalBoost * 0.012;
      }
    }
    if (nextMinute === 1 && activeBriefing?.momentumBonus && isUserAttacking) shotThreshold += (activeBriefing.momentumBonus / 100) * 0.014;
    if (nextMinute === 1 && activeAiBriefing?.momentumBonus && isAiAttacking) shotThreshold += (activeAiBriefing.momentumBonus / 100) * 0.014;

    // ── FINALNY CLAMP ──
    shotThreshold = Math.max(
      Math.max(0.050, fatiguedShotFloor - 0.010),
      Math.min(0.155,
        (shotThreshold - lateFatigueShotDrag - shotVolumeDrag) *
        clampNumber(activePlayerFormChanceMultiplier, 0.66, 1.34)
      )
    );

    const statShotGapDrag = activeShotsSoFar >= 14 ? Math.min(0.035, (activeShotsSoFar - 13) * 0.007) : 0;
    const statPressureChance = Math.max(0.075, Math.min(0.205,
      0.145
      + Math.max(-0.018, Math.min(0.024, getQualityGapCurve(ratingGap) * 0.022))
      + Math.max(-0.014, Math.min(0.018, (attackingTacticObj.attackBias - 50) / 100 * 0.045))
      + (activeMidfieldControlDiff > 0 ? Math.min(0.014, activeMidfieldControlDiff * 0.0010) : -Math.min(0.012, Math.abs(activeMidfieldControlDiff) * 0.0009))
      + (hasMomentumAdvantage ? (Math.abs(momentum) / 100) * 0.007 : 0)
      - lateFatigueShotDrag * 0.35
      - statShotGapDrag
    ));
    const statPressureLimit = Math.min(0.42, shotThreshold + statPressureChance);

    // ── ROZSTRZYGNIĘCIE ZDARZENIA ──
    let immediateEventType: MatchEventType | undefined;
    const activeIntensityRisk = isUserAttacking ? userIntensityRisk : aiIntensityRisk;
    const uFoulThreshold = 0.043 * activeIntensityRisk.foul;
    const activeStats = activeSide === 'HOME' ? liveStats.home : liveStats.away;

    if (!forceZeroShotChance && rngEvent < uFoulThreshold) {
      // Faul (kartki i karne pominięte — symetrycznie)
      activeStats.fouls++;
      immediateEventType = MatchEventType.FOUL;
    } else if (forceZeroShotChance || rngEvent < shotThreshold) {
      // ── STRZAŁ ──
      const team = activeSide === 'HOME' ? homePlayers : awayPlayers;
      const xi = (activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI) as string[];
      const oppTeam = activeSide === 'HOME' ? awayPlayers : homePlayers;
      const oppXi = (activeSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI) as string[];
      const scorer = GoalAttributionService.pickScorer(team, xi, false, () => seededRng(currentSeed, nextMinute, 700));
      if (scorer) {
        const assistant = GoalAttributionService.pickAssistant(team, xi, scorer.id, false, () => seededRng(currentSeed, nextMinute, 720));
        const gk = oppTeam.find(p => p.id === oppXi[0]);
        const defs = oppTeam.filter(p => oppXi.slice(1, 6).includes(p.id));
        const oppFatigueMapS = activeSide === 'HOME' ? localAwayFatigue : localHomeFatigue;
        const myFatigueMapS = activeSide === 'HOME' ? localHomeFatigue : localAwayFatigue;
        const scorerLiveFatigue = myFatigueMapS[scorer.id] ?? 100;
        const gkLiveFatigue = gk ? (oppFatigueMapS[gk.id] ?? 100) : 100;

        const attackingLineupS = activeSide === 'HOME' ? nextHomeLineup : nextAwayLineup;
        const defendingLineupS = activeSide === 'HOME' ? nextAwayLineup : nextHomeLineup;
        const attackingTacticS = TacticRepository.getById(attackingLineupS.tacticId);
        const defendingTacticS = TacticRepository.getById(defendingLineupS.tacticId);
        const scorerSlotIdx = attackingLineupS.startingXI.indexOf(scorer.id);
        const scorerSlotRole = scorerSlotIdx !== -1 ? attackingTacticS.slots[scorerSlotIdx].role : scorer.position;
        const penaltyFactor = PlayerPositionFitService.getPenaltyFactor(scorer, scorerSlotRole, true);
        let scorerFitMod = 1.0;
        if (penaltyFactor !== 0) {
          const gkMismatch = scorer.position === PlayerPosition.GK || scorerSlotRole === PlayerPosition.GK;
          if (gkMismatch) scorerFitMod = 0.45;
          else {
            const baseMod = ((scorer.position === PlayerPosition.DEF && scorerSlotRole === PlayerPosition.FWD) ||
              (scorer.position === PlayerPosition.FWD && scorerSlotRole === PlayerPosition.DEF)) ? 0.75 : 0.88;
            scorerFitMod = 1 - ((1 - baseMod) * penaltyFactor);
          }
        }
        const gkFitMod = gk ? (gk.position === PlayerPosition.GK ? 1.0 : 0.45) : 0.01;
        const scorerBriefingFatigue = activeSide === userSide
          ? clampNumber(scorerLiveFatigue + briefingFreshnessDelta, 0, 100)
          : clampNumber(scorerLiveFatigue + aiBriefingFreshnessDelta, 0, 100);
        const scorerBriefingFitMod = activeSide === userSide
          ? scorerFitMod * briefingFinishingFitMod
          : scorerFitMod * aiBriefingFinishingFitMod;
        const scorerCounterFitMod = (counterAttackTriggered && activeSide === userSide) || (aiCounterAttackTriggered && activeSide !== userSide)
          ? scorerBriefingFitMod * 1.06 : scorerBriefingFitMod;
        const scorerFormBoost = 1 + ((activeFormImpact.finishingMultiplier - 1) * activeFormStacking);
        const gkFormBoost = 1 + ((defendingFormImpact.goalkeepingMultiplier - 1) * defendingFormStacking);
        const playerFormFinishingBoost = clampNumber(activePlayerFormImpact.performanceMultiplier, 0.78, 1.22);
        const playerFormGoalkeepingBoost = clampNumber(defendingPlayerFormImpact.performanceMultiplier, 0.82, 1.18);
        const actionProfile = MatchActionService.evaluateOpenPlayAction({
          attackingPlayers: team, defendingPlayers: oppTeam,
          attackingLineup: attackingLineupS as any, defendingLineup: defendingLineupS as any,
          attackingTactic: attackingTacticS, defendingTactic: defendingTacticS,
          attackingFatigue: myFatigueMapS, defendingFatigue: oppFatigueMapS,
          scorer, assistant,
          isCounterAttack: (counterAttackTriggered && activeSide === userSide) || (aiCounterAttackTriggered && activeSide !== userSide),
          rng: () => seededRng(currentSeed, nextMinute, 760),
        } as any);
        const scorerTeamFormFitMod = scorerCounterFitMod * scorerFormBoost * playerFormFinishingBoost * actionProfile.finishingFitMod;
        const gkTeamFormFitMod = gkFitMod * gkFormBoost * playerFormGoalkeepingBoost;

        const isGoal = GoalAttributionService.checkShotSuccess(
          scorer, gk as any, defs, false,
          () => seededRng(currentSeed, nextMinute, 750),
          false, scorerBriefingFatigue, gkLiveFatigue, scorerTeamFormFitMod, gkTeamFormFitMod, oppFatigueMapS
        );

        if (isGoal) {
          if (activeSide === 'HOME') { homeScore++; liveStats.home.shots++; liveStats.home.shotsOnTarget++; }
          else { awayScore++; liveStats.away.shots++; liveStats.away.shotsOnTarget++; }
          immediateEventType = MatchEventType.GOAL;
          // Contact goal boost
          const prevScoringScore = activeSide === 'HOME' ? homeScore - 1 : awayScore - 1;
          const prevOppScore = activeSide === 'HOME' ? awayScore : homeScore;
          if (prevScoringScore < prevOppScore) {
            const newDiff = (prevOppScore - prevScoringScore) - 1;
            const baseBoost = newDiff === 0 ? 0.020 : newDiff === 1 ? 0.013 : 0.007;
            const scoringPlayers = activeSide === 'HOME' ? homePlayers : awayPlayers;
            const scoringXI = (activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).filter((id): id is string => id !== null);
            const avgRating = scoringXI.length > 0
              ? scoringPlayers.filter(p => scoringXI.includes(p.id)).reduce((acc, p) => acc + (p.overallRating * PlayerMoraleService.getMatchMultiplier(p)), 0) / scoringXI.length
              : 60;
            const teamFactor = 0.75 + clampNumber((avgRating - 55) / 25, 0, 1) * 0.5;
            activeTacticalBoost = (activeSide === 'HOME' ? 1 : -1) * parseFloat((baseBoost * teamFactor).toFixed(4));
            tacticalBoostExpiry = nextMinute + 5 + Math.floor(seededRng(currentSeed, nextMinute, 9901) * 11);
            lastGoalBoostMinute = nextMinute;
          }
        } else {
          const failRng = seededRng(currentSeed, nextMinute, 780);
          let failType = MatchEventType.SHOT_ON_TARGET;
          if (failRng < 0.08) failType = MatchEventType.SHOT_POST;
          else if (failRng < 0.16) failType = MatchEventType.SHOT_BAR;
          else if (failRng < 0.26) failType = MatchEventType.ONE_ON_ONE_SAVE;
          else if (failRng < 0.36) failType = MatchEventType.ONE_ON_ONE_MISS;
          else if (failRng < 0.44) failType = MatchEventType.SAVE;
          else if (failRng < 0.54) failType = MatchEventType.WINGER_STOPPED;
          else if (failRng > 0.85) failType = MatchEventType.SHOT;
          if ((actionProfile as any).dangerLabel === 'big' && failType === MatchEventType.SHOT) failType = MatchEventType.ONE_ON_ONE_MISS;
          if ((actionProfile as any).dangerLabel === 'clear' && failType === MatchEventType.WINGER_STOPPED) failType = MatchEventType.SHOT_ON_TARGET;
          if ((actionProfile as any).dangerLabel === 'chaotic' && failType === MatchEventType.SHOT_ON_TARGET) failType = MatchEventType.SHOT;
          const shotAccuracyRoll = seededRng(currentSeed, nextMinute, 790);
          const sotBoost = (actionProfile as any).shotOnTargetBoost ?? 0;
          if (sotBoost > 0 && failType === MatchEventType.SHOT && shotAccuracyRoll < sotBoost * 3) failType = MatchEventType.SHOT_ON_TARGET;
          else if (sotBoost < 0 && failType !== MatchEventType.SHOT && shotAccuracyRoll < Math.abs(sotBoost) * 2) failType = MatchEventType.SHOT;
          if (activeSide === 'HOME') { liveStats.home.shots++; if (failType !== MatchEventType.SHOT) liveStats.home.shotsOnTarget++; }
          else { liveStats.away.shots++; if (failType !== MatchEventType.SHOT) liveStats.away.shotsOnTarget++; }
          immediateEventType = failType;
        }
      }
    } else if (rngEvent < statPressureLimit) {
      // ── ZDARZENIE STATYSTYCZNE ──
      const statRng = seededRng(currentSeed, nextMinute, 910);
      const statTeam = activeSide === 'HOME' ? homePlayers : awayPlayers;
      const statLineup = activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
      const statActiveIds = statLineup.filter((id): id is string => id !== null);
      const statPlayerId = statActiveIds[Math.floor(seededRng(currentSeed, nextMinute, 914) * statActiveIds.length)];
      const statPlayer = statTeam.find(p => p.id === statPlayerId);
      const chaosShotShare = activeStats.shots < 5 ? 0.24 : activeStats.shots < 9 ? 0.16 : activeStats.shots < 13 ? 0.09 : 0.04;
      const cornerShare = 0.26 + Math.max(0, Math.min(0.05, (activeStats.shots - activeStats.corners) * 0.006));
      const foulShare = 0.12 + Math.max(0, Math.min(0.06, (70 - attackingTacticObj.defenseBias) * 0.0015));
      if (statRng < chaosShotShare) {
        activeStats.shots++;
        const strengthEdge = Math.max(-1, Math.min(1, ratingGap / 18));
        const chaosGoalChance = Math.max(0.012, Math.min(0.064, 0.032 + strengthEdge * 0.022));
        const isChaosGoal = seededRng(currentSeed, nextMinute, 920) < chaosGoalChance;
        const onTargetChance = 0.24 + seededRng(currentSeed, nextMinute, 916) * 0.16 + (strengthEdge * 0.04);
        const shotType = isChaosGoal || seededRng(currentSeed, nextMinute, 918) < onTargetChance ? MatchEventType.SHOT_ON_TARGET : MatchEventType.SHOT;
        if (shotType === MatchEventType.SHOT_ON_TARGET) activeStats.shotsOnTarget++;
        immediateEventType = shotType;
        if (isChaosGoal && statPlayer) {
          if (activeSide === 'HOME') homeScore++; else awayScore++;
          immediateEventType = MatchEventType.GOAL;
        }
      } else if (statRng < chaosShotShare + cornerShare) {
        activeStats.corners++;
        immediateEventType = MatchEventType.CORNER;
      } else if (statRng < chaosShotShare + cornerShare + foulShare) {
        activeStats.fouls++;
        immediateEventType = MatchEventType.FOUL;
      } else {
        activeStats.offsides++;
        immediateEventType = MatchEventType.OFFSIDE;
      }
    } else if (rngEvent < 0.32) {
      // ── FLAVOR ──
      const flavorRng = seededRng(currentSeed, nextMinute, 900);
      let type = MatchEventType.MIDFIELD_CONTROL;
      if (flavorRng < 0.25) type = MatchEventType.CORNER;
      else if (flavorRng < 0.26) type = MatchEventType.MISPLACED_PASS;
      else if (flavorRng < 0.32) type = MatchEventType.BLUNDER;
      else if (flavorRng < 0.40) type = MatchEventType.PLAY_LEFT;
      else if (flavorRng < 0.48) type = MatchEventType.PLAY_RIGHT;
      else if (flavorRng < 0.54) type = MatchEventType.PLAY_BACK;
      else if (flavorRng < 0.60) type = MatchEventType.PLAY_SIDE;
      else if (flavorRng < 0.66) type = MatchEventType.STUMBLE;
      else if (flavorRng < 0.72) type = MatchEventType.OFFSIDE;
      else if (flavorRng < 0.78) type = MatchEventType.PRESSURE;
      else if (flavorRng < 0.84) type = MatchEventType.FREE_KICK;
      else if (flavorRng < 0.90) type = MatchEventType.FOUL_PUSH;
      else if (flavorRng < 0.95) type = MatchEventType.FOUL_JERSEY;
      else type = MatchEventType.GK_LONG_THROW;
      immediateEventType = type;

      if (type === MatchEventType.CORNER) {
        activeStats.corners++;
        const cornerTakers = (activeSide === 'HOME' ? homePlayers : awayPlayers).filter(p => (activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).includes(p.id));
        const bestCornerAttr = cornerTakers.length > 0 ? Math.max(...cornerTakers.map(p => p.attributes.corners)) : 50;
        const cornerShotChance = 0.10 + (bestCornerAttr / 100) * 0.30;
        if (seededRng(currentSeed, nextMinute, 3300) < cornerShotChance) {
          const cornerTeam = activeSide === 'HOME' ? homePlayers : awayPlayers;
          const cornerXI = (activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).filter((id): id is string => id !== null);
          const cornerOppTeam = activeSide === 'HOME' ? awayPlayers : homePlayers;
          const cornerOppXI = (activeSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI).filter((id): id is string => id !== null);
          const headerScorer = GoalAttributionService.pickScorer(cornerTeam, cornerXI, true, () => seededRng(currentSeed, nextMinute, 3400));
          if (headerScorer) {
            const cornerGk = cornerOppTeam.find(p => p.id === cornerOppXI[0]);
            const cornerDefs = cornerOppTeam.filter(p => cornerOppXI.slice(1, 6).includes(p.id));
            const hScorerFat = (activeSide === 'HOME' ? localHomeFatigue : localAwayFatigue)[headerScorer.id] ?? 100;
            const hGkFat = cornerGk ? ((activeSide === 'HOME' ? localAwayFatigue : localHomeFatigue)[cornerGk.id] ?? 100) : 100;
            const hGkFitMod = cornerGk ? (cornerGk.position === PlayerPosition.GK ? 1.0 : 0.45) : 0.01;
            const cornerOppFatigue = activeSide === 'HOME' ? localAwayFatigue : localHomeFatigue;
            const headerBriefingFatigue = activeSide === userSide
              ? clampNumber(hScorerFat + briefingFreshnessDelta, 0, 100)
              : clampNumber(hScorerFat + aiBriefingFreshnessDelta, 0, 100);
            const headerBriefingFitMod = activeSide === userSide ? briefingFinishingFitMod : aiBriefingFinishingFitMod;
            const headerFormBoost = 1 + ((activeFormImpact.finishingMultiplier - 1) * activeFormStacking);
            const headerGkBoost = 1 + ((defendingFormImpact.goalkeepingMultiplier - 1) * defendingFormStacking);
            const headerTeamFormFitMod = headerBriefingFitMod * headerFormBoost * clampNumber(activePlayerFormImpact.performanceMultiplier, 0.80, 1.20);
            const headerGkFormFitMod = hGkFitMod * headerGkBoost * clampNumber(defendingPlayerFormImpact.performanceMultiplier, 0.84, 1.16);
            const isHeaderGoal = GoalAttributionService.checkShotSuccess(
              headerScorer, cornerGk as any, cornerDefs, true,
              () => seededRng(currentSeed, nextMinute, 3500),
              false, headerBriefingFatigue, hGkFat, headerTeamFormFitMod, headerGkFormFitMod, cornerOppFatigue
            );
            if (isHeaderGoal) {
              if (activeSide === 'HOME') { homeScore++; liveStats.home.shots++; liveStats.home.shotsOnTarget++; }
              else { awayScore++; liveStats.away.shots++; liveStats.away.shotsOnTarget++; }
              immediateEventType = MatchEventType.GOAL;
            } else {
              if (activeSide === 'HOME') liveStats.home.shots++;
              else liveStats.away.shots++;
            }
          }
        }
      }
      // (Gole z rzutów wolnych pominięte — symetrycznie)
    }

    // ── MOMENTUM ──
    const stateLike: any = {
      minute: nextMinute, momentum,
      homeLineup: nextHomeLineup, awayLineup: nextAwayLineup,
      sentOffIds: [],
      homeFatigue: localHomeFatigue, awayFatigue: localAwayFatigue,
      subsCountHome, subsCountAway,
    };
    const briefingMomentumImpulse = nextMinute === 1
      ? (activeBriefing?.momentumBonus ?? 0) * (userSide === 'HOME' ? 1 : -1)
        + (activeAiBriefing?.momentumBonus ?? 0) * (userSide === 'HOME' ? -1 : 1)
      : 0;
    const rawMomentum = MomentumService.computeMomentum(ctx, stateLike, immediateEventType, activeSide, localHomeFatigue, localAwayFatigue, undefined);
    momentum = clampNumber(rawMomentum + briefingMomentumImpulse, -100, 100);
    momentumSum += momentum;
    momentumTicks++;

    // ── ZMĘCZENIE ──
    const fatigue = MatchEngineService.calculateFatigueStep({
      ...stateLike, momentum,
      homeLineup: nextHomeLineup, awayLineup: nextAwayLineup,
    }, ctx, undefined);
    Object.assign(homeFatigue, fatigue.home);
    Object.assign(awayFatigue, fatigue.away);

    const uFatExtra = LiveMatchInstructionBalanceService.getInstructionFatigueExtra(
      uInstr.tempo as any, uInstr.intensity as any, uInstr.pressing as any,
      (uInstr as any).tempoResponseFactor ?? 1.0, (uInstr as any).intensityResponseFactor ?? 1.0, (uInstr as any).pressingResponseFactor ?? 1.0
    );
    if (uFatExtra !== 0) {
      const uXIForFat = userSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
      const uFatTarget = userSide === 'HOME' ? homeFatigue : awayFatigue;
      const uSubsUsed = userSide === 'HOME' ? subsCountHome : subsCountAway;
      const mult = uFatExtra > 0
        ? getLiveInstructionFatigueMultiplier(nextMinute, uInstr.tempo, uInstr.intensity, uInstr.pressing, uSubsUsed, uXIForFat, uFatTarget)
        : 1;
      uXIForFat.filter((id): id is string => id !== null).forEach(id => {
        uFatTarget[id] = clampNumber((uFatTarget[id] ?? 100) - uFatExtra * mult, 0, 100);
      });
    }
    const aiFatExtra = aiActiveShout
      ? LiveMatchInstructionBalanceService.getInstructionFatigueExtra(
          aiActiveShout.tempo, aiActiveShout.intensity, aiActiveShout.pressing ?? 'NORMAL',
          aiTempoRf, aiIntensityRf, aiPressingRf
        )
      : 0;
    if (aiFatExtra !== 0) {
      const aiXIForFat = userSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI;
      const aiFatTarget = userSide === 'HOME' ? awayFatigue : homeFatigue;
      const aiSubsUsed = userSide === 'HOME' ? subsCountAway : subsCountHome;
      const mult = aiFatExtra > 0 && aiActiveShout
        ? getLiveInstructionFatigueMultiplier(nextMinute, aiActiveShout.tempo, aiActiveShout.intensity, aiActiveShout.pressing ?? 'NORMAL', aiSubsUsed, aiXIForFat, aiFatTarget)
        : 1;
      aiXIForFat.filter((id): id is string => id !== null).forEach(id => {
        aiFatTarget[id] = clampNumber((aiFatTarget[id] ?? 100) - aiFatExtra * mult, 0, 100);
      });
    }

    // ── ZMIANY (identyczna polityka obu stron) ──
    if (SUB_MINUTES.includes(nextMinute)) {
      const doSub = (lineup: any, players: any[], fatMap: Record<string, number>) => {
        const starters = lineup.startingXI
          .map((id: string | null, idx: number) => ({ id, idx }))
          .filter((s: any) => s.id !== null && players.find(p => p.id === s.id)?.position !== PlayerPosition.GK);
        starters.sort((a: any, b: any) => (fatMap[a.id] ?? 100) - (fatMap[b.id] ?? 100));
        const tired = starters[0];
        if (!tired) return false;
        const tiredPlayer = players.find(p => p.id === tired.id)!;
        const benchPick = lineup.bench
          .map((id: string) => players.find(p => p.id === id)!)
          .filter((p: any) => p && p.position === tiredPlayer.position)
          .sort((a: any, b: any) => (fatMap[b.id] ?? 100) - (fatMap[a.id] ?? 100))[0];
        if (!benchPick) return false;
        lineup.startingXI[tired.idx] = benchPick.id;
        lineup.bench = lineup.bench.filter((id: string) => id !== benchPick.id);
        return true;
      };
      if (doSub(nextHomeLineup, homePlayers, homeFatigue)) subsCountHome++;
      if (doSub(nextAwayLineup, awayPlayers, awayFatigue)) subsCountAway++;
    }
  }

  const userGoals = userSide === 'HOME' ? homeScore : awayScore;
  const aiGoals = userSide === 'HOME' ? awayScore : homeScore;
  const userShots = userSide === 'HOME' ? liveStats.home.shots : liveStats.away.shots;
  const aiShots = userSide === 'HOME' ? liveStats.away.shots : liveStats.home.shots;
  const userMomentumAvg = (userSide === 'HOME' ? 1 : -1) * (momentumSum / Math.max(1, momentumTicks));

  return { userGoals, aiGoals, userShots, aiShots, userMomentumAvg, userSide };
};

// ─── SCENARIUSZE ─────────────────────────────────────────────────────────────
const MATCHES = Number(process.env.SIM_MATCHES ?? 50);

const SCENARIOS: Scenario[] = [
  {
    id: 'S0-mirror-passive',
    desc: 'SANITY: lustrzane składy, obaj pasywni (bez briefingu, AI brain OFF) — oczekiwane ~50/50 + przewaga gospodarza',
    mirror: true, aiBrain: false, aiBriefing: false, userBriefingType: null,
  },
  {
    id: 'S1-baseline',
    desc: 'Gracz PASYWNY (neutralne instrukcje, milczenie), AI pełny mózg + briefing — równe składy',
    aiBrain: true, aiBriefing: true, userBriefingType: null,
  },
  {
    id: 'S2-fast-offensive',
    desc: 'Gracz: tylko TEMPO=FAST + NASTAWIENIE=OFFENSIVE (reszta neutralna)',
    aiBrain: true, aiBriefing: true, userBriefingType: null,
    userInstr: { tempo: 'FAST', mindset: 'OFFENSIVE' },
  },
  {
    id: 'S3-full-meta',
    desc: 'Gracz: FAST + OFFENSIVE + PRESSING + SHORT (pełny meta-stack)',
    aiBrain: true, aiBriefing: true, userBriefingType: null,
    userInstr: { tempo: 'FAST', mindset: 'OFFENSIVE', pressing: 'PRESSING', passing: 'SHORT' },
  },
  {
    id: 'S4-briefing-blitz',
    desc: 'Gracz: neutralne instrukcje + briefing BLITZ (najsilniejszy w EQUAL)',
    aiBrain: true, aiBriefing: true, userBriefingType: 'BLITZ',
  },
  {
    id: 'S5-briefing-random',
    desc: 'Gracz: neutralne instrukcje + briefing LOSOWY ("byle co") — czy nadal daje przewagę?',
    aiBrain: true, aiBriefing: true, userBriefingType: 'RANDOM',
  },
  {
    id: 'S6-form-gap',
    desc: 'Forma/morale: gracz form 62 + morale 68 (trening/morale zarządzane) vs AI form 44 + morale 50 (brak trainingFocus)',
    aiBrain: true, aiBriefing: true, userBriefingType: null,
    userForm: 62, userMorale: 68, aiForm: 44, aiMorale: 50,
  },
  {
    id: 'S7-all-in',
    desc: 'Wszystko naraz: FAST+OFFENSIVE + briefing BLITZ + przewaga formy/morale',
    aiBrain: true, aiBriefing: true, userBriefingType: 'BLITZ',
    userInstr: { tempo: 'FAST', mindset: 'OFFENSIVE' },
    userForm: 62, userMorale: 68, aiForm: 44, aiMorale: 50,
  },
  {
    id: 'S8-ai-stronger',
    desc: 'AI SILNIEJSZE o ~4 OVR, gracz pasywny — czy silniejsza drużyna AI wygrywa?',
    aiBrain: true, aiBriefing: true, userBriefingType: null,
    userQuality: 62, aiQuality: 66,
  },
  {
    id: 'S9-ai-stronger-vs-meta',
    desc: 'AI SILNIEJSZE o ~4 OVR vs gracz FAST+OFFENSIVE + briefing BLITZ ("czy meta bije klasę?")',
    aiBrain: true, aiBriefing: true, userBriefingType: 'BLITZ',
    userInstr: { tempo: 'FAST', mindset: 'OFFENSIVE' },
    userQuality: 62, aiQuality: 66,
  },
];

// ─── RUNNER ──────────────────────────────────────────────────────────────────
const realLog = console.log;
const silenceLogs = () => { (console as any).log = () => {}; };
const restoreLogs = () => { (console as any).log = realLog; };

const pct = (n: number, total: number) => `${((n / total) * 100).toFixed(0)}%`;

realLog(`\n═══ LEAGUE MATCH BALANCE SIM — ${MATCHES} meczów na scenariusz ═══\n`);

for (const sc of SCENARIOS) {
  let w = 0, d = 0, l = 0, gf = 0, ga = 0, sf = 0, sa = 0, momSum = 0;
  silenceLogs();
  try {
    for (let i = 0; i < (sc.matches ?? MATCHES); i++) {
      const r = simulateMatch(sc, i);
      if (r.userGoals > r.aiGoals) w++;
      else if (r.userGoals === r.aiGoals) d++;
      else l++;
      gf += r.userGoals; ga += r.aiGoals;
      sf += r.userShots; sa += r.aiShots;
      momSum += r.userMomentumAvg;
    }
  } finally {
    restoreLogs();
  }
  const n = sc.matches ?? MATCHES;
  realLog(`── ${sc.id}`);
  realLog(`   ${sc.desc}`);
  realLog(`   GRACZ: ${w}W ${d}D ${l}L  (${pct(w, n)} zwycięstw, pkt/mecz ${( (w * 3 + d) / n).toFixed(2)})`);
  realLog(`   Gole: ${(gf / n).toFixed(2)} : ${(ga / n).toFixed(2)}   Strzały: ${(sf / n).toFixed(1)} : ${(sa / n).toFixed(1)}   Śr. momentum gracza: ${(momSum / n).toFixed(1)}\n`);
}

realLog('Uwaga: pominięto symetrycznie kartki/karne/kontuzje/FK/pogodę/przerwę — patrz nagłówek pliku.');
