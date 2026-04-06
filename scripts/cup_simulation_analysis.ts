/**
 * CUP MATCH SIMULATION ANALYSIS
 * ================================
 * Wiernie reimplementuje logikę MatchLiveViewPolishCupSimulation.tsx
 * jako skrypt standalone bez React/UI.
 *
 * Run: npx ts-node scripts/cup_simulation_analysis.ts
 */

// ============================================================
// TYPY
// ============================================================
enum PlayerPosition { GK = 'GK', DEF = 'DEF', MID = 'MID', FWD = 'FWD' }
enum InjurySeverity { LIGHT = 'LIGHT', SEVERE = 'SEVERE' }

interface PlayerAttributes {
  strength: number; stamina: number; pace: number; defending: number;
  passing: number; attacking: number; finishing: number; technique: number;
  vision: number; dribbling: number; heading: number; positioning: number;
  goalkeeping: number; freeKicks: number; talent: number; penalties: number;
  corners: number; aggression: number; crossing: number; leadership: number;
  mentality: number; workRate: number;
}

interface Player {
  id: string;
  lastName: string;
  position: PlayerPosition;
  overallRating: number;
  attributes: PlayerAttributes;
  condition: number;
}

interface TacticSlot { role: PlayerPosition; }
interface Tactic {
  id: string; name: string;
  attackBias: number; defenseBias: number; pressingIntensity: number;
  slots: TacticSlot[];
}

interface TacticalInstructions {
  tempo: 'SLOW' | 'NORMAL' | 'FAST';
  mindset: 'DEFENSIVE' | 'NEUTRAL' | 'OFFENSIVE';
  intensity: 'CAUTIOUS' | 'NORMAL' | 'AGGRESSIVE';
  pressing: 'NONE' | 'NORMAL' | 'PRESSING';
  counterAttack: 'NORMAL' | 'COUNTER';
  passing: 'SHORT' | 'MIXED' | 'LONG';
}

interface AiShout {
  mindset: 'DEFENSIVE' | 'NEUTRAL' | 'OFFENSIVE';
  tempo: 'SLOW' | 'NORMAL' | 'FAST';
  intensity: 'CAUTIOUS' | 'NORMAL' | 'AGGRESSIVE';
  expiryMinute: number;
  isExpired?: boolean;
}

// ============================================================
// BAZA TAKTYK (z tactics_db.ts)
// ============================================================
const slot = (role: PlayerPosition): TacticSlot => ({ role });

const TACTICS_DB: Record<string, Tactic> = {
  '4-4-2': {
    id: '4-4-2', name: '4-4-2 Classic', attackBias: 50, defenseBias: 50, pressingIntensity: 50,
    slots: [slot(PlayerPosition.GK), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF),
            slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID),
            slot(PlayerPosition.FWD), slot(PlayerPosition.FWD)]
  },
  '4-4-2-OFF': {
    id: '4-4-2-OFF', name: '4-4-2 Offensive', attackBias: 75, defenseBias: 35, pressingIntensity: 75,
    slots: [slot(PlayerPosition.GK), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF),
            slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID),
            slot(PlayerPosition.FWD), slot(PlayerPosition.FWD)]
  },
  '4-4-2-DEF': {
    id: '4-4-2-DEF', name: '4-4-2 Defensive', attackBias: 30, defenseBias: 80, pressingIntensity: 40,
    slots: [slot(PlayerPosition.GK), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF),
            slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID),
            slot(PlayerPosition.FWD), slot(PlayerPosition.FWD)]
  },
  '6-3-1': {
    id: '6-3-1', name: '6-3-1 Ultra Defensive', attackBias: 5, defenseBias: 95, pressingIntensity: 20,
    slots: [slot(PlayerPosition.GK), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF),
            slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID),
            slot(PlayerPosition.FWD)]
  },
  '4-2-4': {
    id: '4-2-4', name: '4-2-4 Brazilian', attackBias: 90, defenseBias: 10, pressingIntensity: 85,
    slots: [slot(PlayerPosition.GK), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF),
            slot(PlayerPosition.MID), slot(PlayerPosition.MID),
            slot(PlayerPosition.FWD), slot(PlayerPosition.FWD), slot(PlayerPosition.FWD), slot(PlayerPosition.FWD)]
  },
  '4-3-3': {
    id: '4-3-3', name: '4-3-3 Offensive', attackBias: 75, defenseBias: 30, pressingIntensity: 80,
    slots: [slot(PlayerPosition.GK), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF),
            slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID),
            slot(PlayerPosition.FWD), slot(PlayerPosition.FWD), slot(PlayerPosition.FWD)]
  },
  '4-5-1': {
    id: '4-5-1', name: '4-5-1 Park Bus', attackBias: 30, defenseBias: 85, pressingIntensity: 40,
    slots: [slot(PlayerPosition.GK), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF),
            slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID),
            slot(PlayerPosition.FWD)]
  },
  '5-3-2': {
    id: '5-3-2', name: '5-3-2 Fortress', attackBias: 20, defenseBias: 90, pressingIntensity: 30,
    slots: [slot(PlayerPosition.GK), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF),
            slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID),
            slot(PlayerPosition.FWD), slot(PlayerPosition.FWD)]
  },
  '4-2-3-1': {
    id: '4-2-3-1', name: '4-2-3-1 Wide', attackBias: 60, defenseBias: 60, pressingIntensity: 60,
    slots: [slot(PlayerPosition.GK), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF),
            slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID),
            slot(PlayerPosition.FWD)]
  },
  '3-4-3': {
    id: '3-4-3', name: '3-4-3 Total', attackBias: 85, defenseBias: 20, pressingIntensity: 90,
    slots: [slot(PlayerPosition.GK), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF),
            slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID),
            slot(PlayerPosition.FWD), slot(PlayerPosition.FWD), slot(PlayerPosition.FWD)]
  },
  '5-4-1': {
    id: '5-4-1', name: '5-4-1 Diamond', attackBias: 35, defenseBias: 80, pressingIntensity: 50,
    slots: [slot(PlayerPosition.GK), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF),
            slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID),
            slot(PlayerPosition.FWD)]
  },
  '4-3-3-F9': {
    id: '4-3-3-F9', name: '4-3-3 False Nine', attackBias: 80, defenseBias: 35, pressingIntensity: 75,
    slots: [slot(PlayerPosition.GK), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF), slot(PlayerPosition.DEF),
            slot(PlayerPosition.MID), slot(PlayerPosition.MID), slot(PlayerPosition.MID),
            slot(PlayerPosition.FWD), slot(PlayerPosition.FWD), slot(PlayerPosition.FWD)]
  },
};

// ============================================================
// GENERATOR ZAWODNIKÓW (na podstawie Tier/pozycji)
// ============================================================
interface TierAttrRange {
  base: number; variance: number;
}

interface TierProfile {
  reputation: number;
  gk: TierAttrRange;
  def: TierAttrRange;
  mid: TierAttrRange;
  fwd: TierAttrRange;
}

const TIER_PROFILES: Record<number, TierProfile> = {
  1: { reputation: 10, gk: { base: 78, variance: 8 }, def: { base: 72, variance: 8 }, mid: { base: 66, variance: 8 }, fwd: { base: 74, variance: 8 } },
  2: { reputation: 7,  gk: { base: 64, variance: 8 }, def: { base: 58, variance: 8 }, mid: { base: 55, variance: 8 }, fwd: { base: 62, variance: 8 } },
  3: { reputation: 4,  gk: { base: 52, variance: 7 }, def: { base: 47, variance: 7 }, mid: { base: 45, variance: 7 }, fwd: { base: 50, variance: 7 } },
  4: { reputation: 2,  gk: { base: 40, variance: 6 }, def: { base: 38, variance: 6 }, mid: { base: 36, variance: 6 }, fwd: { base: 40, variance: 6 } },
};

let _playerIdCounter = 1;

function rngRange(seed: number, min: number, max: number): number {
  const s = Math.sin(seed * 9301 + 49297) * 233280;
  const r = s - Math.floor(s);
  return min + Math.floor(r * (max - min + 1));
}

function generatePlayerAttrs(position: PlayerPosition, tier: TierProfile, seed: number): PlayerAttributes {
  const profile = position === PlayerPosition.GK ? tier.gk
    : position === PlayerPosition.DEF ? tier.def
    : position === PlayerPosition.MID ? tier.mid
    : tier.fwd;

  const base = profile.base;
  const v = profile.variance;
  const r = (offset: number) => Math.max(20, Math.min(99, base + rngRange(seed + offset, -v, v)));

  return {
    strength: r(1), stamina: r(2), pace: r(3), defending: r(4),
    passing: r(5), attacking: r(6), finishing: r(7), technique: r(8),
    vision: r(9), dribbling: r(10), heading: r(11), positioning: r(12),
    goalkeeping: position === PlayerPosition.GK ? r(13) : Math.max(20, tier.gk.base - 40 + rngRange(seed + 13, -5, 5)),
    freeKicks: r(14), talent: r(15), penalties: r(16), corners: r(17),
    aggression: r(18), crossing: r(19), leadership: r(20), mentality: r(21), workRate: r(22),
  };
}

function buildSquad(tier: number, teamId: string, seed: number): Player[] {
  const profile = TIER_PROFILES[tier];
  const players: Player[] = [];
  const positions: PlayerPosition[] = [
    PlayerPosition.GK,
    PlayerPosition.DEF, PlayerPosition.DEF, PlayerPosition.DEF, PlayerPosition.DEF,
    PlayerPosition.MID, PlayerPosition.MID, PlayerPosition.MID, PlayerPosition.MID,
    PlayerPosition.FWD, PlayerPosition.FWD,
  ];
  positions.forEach((pos, i) => {
    const id = `${teamId}_p${i}`;
    const pid = _playerIdCounter++;
    players.push({
      id, lastName: `P${pid}`,
      position: pos, overallRating: profile[pos === PlayerPosition.GK ? 'gk' : pos === PlayerPosition.DEF ? 'def' : pos === PlayerPosition.MID ? 'mid' : 'fwd'].base,
      attributes: generatePlayerAttrs(pos, profile, seed * 100 + i),
      condition: 90 + rngRange(seed + i * 37, -5, 5),
    });
  });
  return players;
}

function buildLineup(players: Player[]): (string | null)[] {
  return players.map(p => p.id);
}

// ============================================================
// RNG (identyczne z MatchLiveViewPolishCupSimulation.tsx)
// ============================================================
function seededRng(seed: number, minute: number, offset: number = 0): number {
  let s = seed + minute + offset;
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
}

// ============================================================
// getFormationPowerPro (wiernie przepisana z symulacji)
// ============================================================
function getFormationPowerPro(
  lineup: (string | null)[],
  teamPlayers: Player[],
  fatigueMap: Record<string, number>,
  attrKeys: (keyof PlayerAttributes)[],
  positions: PlayerPosition[],
  weatherMod: number = 1.0,
  injuriesMap: Record<string, InjurySeverity> = {},
  tacticObj?: Tactic,
): number {
  let tacticalMult = 1.0;
  if (tacticObj) {
    if (tacticObj.attackBias > 65 && positions.includes(PlayerPosition.FWD)) tacticalMult = 1.15;
    if (tacticObj.defenseBias > 65 && attrKeys.includes('technique')) tacticalMult = 1.20;
  }

  const activePlayers = teamPlayers.filter(p => lineup.includes(p.id) && positions.includes(p.position));
  if (activePlayers.length === 0) return 1;

  const hasRealGkInXI = teamPlayers.find(p => p.id === lineup[0])?.position === PlayerPosition.GK;
  const isDefensiveLine = positions.includes(PlayerPosition.GK) || positions.includes(PlayerPosition.DEF);
  let integrityMult = 1.0;
  if (!hasRealGkInXI) {
    integrityMult = isDefensiveLine ? 0.35 + Math.random() * 0.10 : 0.72 + Math.random() * 0.10;
  }

  const startersCount = lineup.filter(id => id !== null).length;
  const isAttack = positions.includes(PlayerPosition.FWD);
  const penaltyPerPlayer = isAttack ? 0.10 : 0.04;
  const numericalPenalty = Math.max(0.78, 1 - (11 - startersCount) * penaltyPerPlayer);

  const gksOnFieldCount = teamPlayers.filter(p =>
    lineup.slice(1).filter(id => id !== null).includes(p.id) && p.position === PlayerPosition.GK
  ).length;
  const defLineupCount = teamPlayers.filter(p =>
    lineup.filter(id => id !== null).includes(p.id) && p.position === PlayerPosition.DEF
  ).length;
  const generalDisorderMult = Math.max(0.55, 1
    - gksOnFieldCount * 0.09
    - Math.max(0, 2 - defLineupCount) * 0.08);

  return activePlayers.reduce((sum, p) => {
    const pFatigue = fatigueMap[p.id] ?? p.condition;
    const fatigueMult = 0.12 + (pFatigue / 100) * 0.43;
    const avgAttr = attrKeys.reduce((s, attr) => s + (p.attributes[attr] || 50), 0) / attrKeys.length;
    const mentalityWorkRateBase = ((p.attributes.mentality || 50) * 0.55) + ((p.attributes.workRate || 50) * 0.45);
    const mentalityWorkRateMult = 0.92 + (mentalityWorkRateBase / 100) * 0.16;
    const powerBase = Math.pow(avgAttr, 1.0);
    const lightInjMult = injuriesMap[p.id] === InjurySeverity.LIGHT ? 0.94 : 1.0;
    return sum + (powerBase * fatigueMult * weatherMod * integrityMult * numericalPenalty * generalDisorderMult * lightInjMult * tacticalMult * mentalityWorkRateMult);
  }, 0);
}

// Pomocnicza: suma atrybutu zawodników na boisku
function getSumAttr(ids: (string | null)[], pool: Player[], attr: keyof PlayerAttributes): number {
  return pool.filter(p => ids.includes(p.id)).reduce((s, p) => s + (p.attributes[attr] || 50), 0);
}

// Łączna moc drużyny (jak w logice Brain/AI)
function getTeamTotalPower(ids: (string | null)[], pool: Player[], fatigueMap: Record<string, number>): number {
  const act = pool.filter(p => ids.includes(p.id));
  return act.reduce((sum, p) => {
    const liveCondition = fatigueMap[p.id] ?? p.condition ?? 100;
    const fatigueMult = 0.72 + (Math.max(0, liveCondition) / 100) * 0.28;
    const corePower =
      (p.attributes.attacking * 1.15) + (p.attributes.finishing * 0.95) +
      (p.attributes.passing * 1.0) + (p.attributes.defending * 1.1) +
      (p.attributes.technique * 0.75) + (p.attributes.vision * 0.55) +
      (p.attributes.positioning * 0.65) + (p.attributes.pace * 0.45) +
      (p.attributes.stamina * 0.42) + (p.attributes.strength * 0.38) +
      (p.attributes.heading * 0.32) + (p.attributes.crossing * 0.30) +
      (p.attributes.mentality * 0.60) + (p.attributes.workRate * 0.58) +
      (p.attributes.leadership * 0.20);
    const gkBonus = p.position === PlayerPosition.GK
      ? (p.attributes.goalkeeping * 1.9) + (p.attributes.positioning * 0.45) + (p.attributes.mentality * 0.20)
      : 0;
    return sum + ((corePower + gkBonus) * fatigueMult);
  }, 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// ============================================================
// STRUKTURA WYNIKÓW MECZU
// ============================================================
interface MatchResult {
  matchId: number;
  label: string;
  homeTier: number;
  awayTier: number;
  homeRep: number;
  awayRep: number;
  homeTactic: string;
  awayTactic: string;
  userInstructions: TacticalInstructions;
  homeScore: number;
  awayScore: number;
  totalGoals: number;
  homeShots: number;
  awayShots: number;
  homeRedCards: number;
  awayRedCards: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeSevereInjuries: number;
  awaySevereInjuries: number;
  homeLightInjuries: number;
  awayLightInjuries: number;
  wentET: boolean;
  wentPenalties: boolean;
  winner: 'HOME' | 'AWAY' | 'DRAW';
  minutesSimulated: number;
  // AI behavior log
  aiReactions: string[];
  // Dodatkowe dane do analizy
  homeFinalCondAvg: number;
  awayFinalCondAvg: number;
  momentumHigh: number;
  momentumLow: number;
}

// ============================================================
// GŁÓWNA SYMULACJA MECZU
// ============================================================
interface MatchConfig {
  matchId: number;
  homeTeam: { club: { name: string; shortName: string; reputation: number; tier: number }; players: Player[]; lineup: (string | null)[]; tacticId: string };
  awayTeam: { club: { name: string; shortName: string; reputation: number; tier: number }; players: Player[]; lineup: (string | null)[]; tacticId: string };
  userInstructions: TacticalInstructions;
  seed: number;
}

function simulateMatch(cfg: MatchConfig): MatchResult {
  const { homeTeam, awayTeam, userInstructions, seed, matchId } = cfg;
  const homeTactic = TACTICS_DB[homeTeam.tacticId] || TACTICS_DB['4-4-2'];
  const awayTactic = TACTICS_DB[awayTeam.tacticId] || TACTICS_DB['4-4-2'];

  // Stałe (identyczne jak w silniku)
  const RED_CARD_CHANCE = 0.00001;
  const SEVERE_INJURY_CHANCE = 0.00004;
  const LIGHT_INJURY_CHANCE = 0.0020;
  const YELLOW_CARD_CHANCE = 0.022;

  // Stan meczu
  let homeScore = 0;
  let awayScore = 0;
  let homeLineup: (string | null)[] = [...homeTeam.lineup];
  let awayLineup: (string | null)[] = [...awayTeam.lineup];
  let homeFatigue: Record<string, number> = {};
  let awayFatigue: Record<string, number> = {};
  let homeInjuries: Record<string, InjurySeverity> = {};
  let awayInjuries: Record<string, InjurySeverity> = {};
  let playerYellowCards: Record<string, number> = {};
  let sentOffIds: string[] = [];
  let momentum = 5;
  let homeShotsTotal = 0;
  let awayShotsTotal = 0;
  let homeRedCards = 0;
  let awayRedCards = 0;
  let homeYellowCards = 0;
  let awayYellowCards = 0;
  let homeSevereInj = 0;
  let awaySevereInj = 0;
  let homeLightInj = 0;
  let awayLightInj = 0;
  let lastGoalBoostMinute = -15;
  let postGoalSuppressionDuration = 4;
  let postGoalPenaltyPct = 0.10;
  let wentET = false;
  let wentPenalties = false;
  let minutesSimulated = 90;
  let momentumHigh = 5;
  let momentumLow = 5;

  // Logi reakcji AI
  const aiReactions: string[] = [];

  // AI shout (inicjalizacja jak w silniku)
  let aiActiveShout: AiShout = (() => {
    let mindset: AiShout['mindset'] = 'NEUTRAL';
    let tempo: AiShout['tempo'] = 'NORMAL';
    let intensity: AiShout['intensity'] = 'NORMAL';
    if (awayTactic.attackBias > 65) mindset = 'OFFENSIVE';
    else if (awayTactic.defenseBias > 65) mindset = 'DEFENSIVE';
    if (awayTactic.attackBias > 70) tempo = 'FAST';
    else if (awayTactic.defenseBias > 75) tempo = 'SLOW';
    if (awayTactic.pressingIntensity > 65) intensity = 'AGGRESSIVE';
    else if (awayTactic.pressingIntensity < 35) intensity = 'CAUTIOUS';
    return { mindset, tempo, intensity, expiryMinute: 25, isExpired: false };
  })();

  let lastAiActionMinute = 0;

  // Helper: wybierz strzelca (uproszczony GoalAttributionService)
  function pickScorer(teamPlayers: Player[], lineup: (string | null)[], rngSeed: number): Player | null {
    const active = teamPlayers.filter(p => lineup.includes(p.id) && !sentOffIds.includes(p.id) && p.position !== PlayerPosition.GK);
    if (active.length === 0) return null;
    const weights = active.map(p => (p.attributes.finishing + p.attributes.attacking) / 2);
    const total = weights.reduce((s, w) => s + w, 0);
    let roll = seededRng(rngSeed, 0, 42) * total;
    for (let i = 0; i < active.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return active[i];
    }
    return active[active.length - 1];
  }

  // Helper: drużyna w 10 – AI przestawia się na defensywę
  function aiSwitchToDefensive(minute: number, reason: string) {
    aiActiveShout = { mindset: 'DEFENSIVE', tempo: 'SLOW', intensity: 'CAUTIOUS', expiryMinute: 999 };
    aiReactions.push(`[${minute}'] ${reason}`);
  }

  // Helper: AI reaguje na wynik
  function updateAiShout(minute: number, score: { home: number; away: number }) {
    const diff = score.away - score.home; // AI = AWAY
    const isLastQuarter = minute >= 70;
    const reactionDelay = 30; // simplified: co ~30 minut możliwa zmiana

    if (minute - lastAiActionMinute < reactionDelay) return;
    if (aiActiveShout.expiryMinute === 999) return; // czerwona kartka - nie zmieniaj

    if (diff <= -2 && isLastQuarter) {
      aiActiveShout = { mindset: 'OFFENSIVE', tempo: 'FAST', intensity: 'AGGRESSIVE', expiryMinute: 120, isExpired: false };
      aiReactions.push(`[${minute}'] AI atakuje! Przegrywa ${score.home}:${score.away} - desperacja`);
      lastAiActionMinute = minute;
    } else if (diff === -1 && minute >= 70) {
      aiActiveShout = { mindset: 'OFFENSIVE', tempo: 'FAST', intensity: 'NORMAL', expiryMinute: 90, isExpired: false };
      aiReactions.push(`[${minute}'] AI naciera - traci 1 gola`);
      lastAiActionMinute = minute;
    } else if (diff >= 1 && isLastQuarter) {
      aiActiveShout = { mindset: 'DEFENSIVE', tempo: 'SLOW', intensity: 'CAUTIOUS', expiryMinute: 120, isExpired: false };
      aiReactions.push(`[${minute}'] AI broni przewagi ${score.away}:${score.home}`);
      lastAiActionMinute = minute;
    } else if (diff >= 2) {
      aiActiveShout = { mindset: 'DEFENSIVE', tempo: 'NORMAL', intensity: 'NORMAL', expiryMinute: minute + 30, isExpired: false };
      lastAiActionMinute = minute;
    }
  }

  // -------- PĘTLA MINUT --------
  const maxMinute = 120; // dogrywka
  let period = 1;
  let addedTime = 0;
  let halfTimeDone = false;
  let periodEndMinute = 90;

  for (let rawMin = 1; rawMin <= maxMinute + 5; rawMin++) {
    // Zarządzanie połowami
    if (!halfTimeDone && rawMin > 45 + addedTime && period === 1) {
      addedTime = 0;
      halfTimeDone = true;
      period = 2;
      // Doliczony czas dla 2. połowy
      const added2 = 2 + Math.floor(Math.random() * 4);
      periodEndMinute = 90 + added2;
    }
    if (!wentET && rawMin > periodEndMinute && period === 2) {
      // Koniec regulaminowego czasu
      if (homeScore !== awayScore) break;
      // Remis → dogrywka
      wentET = true;
      period = 3;
      periodEndMinute = 120;
      aiReactions.push(`[90'] REMIS - dogrywka!`);
    }
    if (wentET && rawMin > 120) {
      // Koniec dogrywki
      if (homeScore !== awayScore) break;
      // Remis w dogrywce → karne (uproszczone - losowanie)
      wentPenalties = true;
      minutesSimulated = 120;
      // Rzuty karne (uproszczone)
      let homePen = 0, awayPen = 0;
      for (let round = 0; round < 5; round++) {
        if (seededRng(seed, round, 5001) < 0.78) homePen++;
        if (seededRng(seed, round, 5002) < 0.78) awayPen++;
      }
      // Dogrywka rzutów karnych jeśli remis
      let penRound = 5;
      while (homePen === awayPen && penRound < 15) {
        if (seededRng(seed, penRound, 5001) < 0.78) homePen++;
        if (seededRng(seed, penRound, 5002) < 0.78) awayPen++;
        penRound++;
      }
      if (homePen > awayPen) homeScore = awayScore + 1;
      else awayScore = homeScore + 1;
      break;
    }

    const minute = rawMin;
    minutesSimulated = minute;
    const currentSeed = seed;

    // === NADPROGRAMOWY DRENAŻ ZMĘCZENIA za niedobór graczy (identyczny jak w silniku) ===
    const applyNumericalFatigueDrain = (fatigue: Record<string, number>, lineup: (string | null)[], pool: Player[]) => {
      const onPitch = lineup.filter(id => id !== null) as string[];
      const missing = Math.max(0, 11 - onPitch.length);
      if (missing === 0) return;
      const extraDrain = Math.pow(missing, 1.6) * 0.25;
      onPitch.forEach(id => {
        const p = pool.find(x => x.id === id);
        if (!p) return;
        const current = fatigue[id] ?? p.condition;
        fatigue[id] = Math.max(0, current - extraDrain);
      });
    };
    applyNumericalFatigueDrain(homeFatigue, homeLineup, homeTeam.players);
    applyNumericalFatigueDrain(awayFatigue, awayLineup, awayTeam.players);

    // === KALKULACJA PROGÓW PROGRESJI ===
    const homeDisorder = 0; // brak pozycyjnych zaburzeń dla uproszczenia
    const awayDisorder = 0;
    let homeProgressionThreshold = Math.max(0.24, 0.57 + homeDisorder * 0.24 - awayDisorder * 0.42);
    let awayProgressionThreshold = Math.max(0.24, 0.57 + awayDisorder * 0.24 - homeDisorder * 0.42);

    // Kara za niedobór graczy (czerwone kartki)
    const homeOnPitch = homeLineup.filter(id => id !== null).length;
    const awayOnPitch = awayLineup.filter(id => id !== null).length;
    const homeMissing = Math.max(0, 11 - homeOnPitch);
    const awayMissing = Math.max(0, 11 - awayOnPitch);
    const numPenThreshold = (missing: number) => missing === 0 ? 0 : Math.pow(missing, 1.8) * 0.20;
    homeProgressionThreshold = Math.min(0.85, homeProgressionThreshold + numPenThreshold(homeMissing));
    awayProgressionThreshold = Math.min(0.85, awayProgressionThreshold + numPenThreshold(awayMissing));

    // Premia dla rywala grającego vs osłabiony
    const repRatioBonus = (ar: number, dr: number) => Math.min(1.5, Math.max(0.6, ar / Math.max(1, dr)));
    if (awayMissing > 0) {
      const baseBonus = numPenThreshold(awayMissing) * 0.21;
      const sm = repRatioBonus(homeTeam.club.reputation, awayTeam.club.reputation);
      homeProgressionThreshold = Math.max(0.25, homeProgressionThreshold - baseBonus * sm);
    }
    if (homeMissing > 0) {
      const baseBonus = numPenThreshold(homeMissing) * 0.21;
      const sm = repRatioBonus(awayTeam.club.reputation, homeTeam.club.reputation);
      awayProgressionThreshold = Math.max(0.25, awayProgressionThreshold - baseBonus * sm);
    }

    // Korekta taktyczna (taktyka defensywna przy niedoborze) 
    const defensiveReduction = (tacticObj: Tactic, missing: number) =>
      missing === 1 && tacticObj.defenseBias > 65 ? 0.07 : 0;
    homeProgressionThreshold = Math.max(0.24, homeProgressionThreshold - defensiveReduction(homeTactic, homeMissing));
    awayProgressionThreshold = Math.max(0.24, awayProgressionThreshold - defensiveReduction(awayTactic, awayMissing));

    // Bonus waleczności Tier 3/4 vs Tier 1 z defensywą
    if (awayTeam.club.reputation <= 5 && homeTeam.club.reputation >= 8 && awayTactic.defenseBias > 65) {
      const fightBonus = 0.03 + seededRng(currentSeed, minute, 3131) * 0.05;
      awayProgressionThreshold = Math.min(0.95, awayProgressionThreshold + fightBonus);
    }

    // Premia gospodarska (ogólna) — każda drużyna u siebie ma lekką przewagę
    homeProgressionThreshold = Math.max(0.24, homeProgressionThreshold - 0.035);

    // Bonus gospdarza z niższej ligi
    if (homeTeam.club.reputation < awayTeam.club.reputation) {
      homeProgressionThreshold = Math.max(0.24, homeProgressionThreshold - 0.07);
    }

    // AI aktualizacja krzyku (co ~25-30 minut)
    if (minute % 25 === 0) {
      updateAiShout(minute, { home: homeScore, away: awayScore });
    }

    // Sprawdź wygaśnięcie AI shout
    if (!aiActiveShout.isExpired && minute >= aiActiveShout.expiryMinute) {
      aiActiveShout = { ...aiActiveShout, isExpired: true };
    }

    // === pPower / aPower ===
    const pPower = getTeamTotalPower(homeLineup, homeTeam.players, homeFatigue);
    const aPower = getTeamTotalPower(awayLineup, awayTeam.players, awayFatigue);
    const powerDiff = pPower - aPower;

    // === ZDARZENIA (KARTKI / KONTUZJE) ===
    const incidentSide: 'HOME' | 'AWAY' = seededRng(currentSeed, minute, 8888) < 0.5 ? 'HOME' : 'AWAY';
    const sideIntensity = incidentSide === 'HOME' ? userInstructions.intensity : (aiActiveShout.intensity || 'NORMAL');
    const otherIntensity = incidentSide === 'HOME' ? (aiActiveShout.intensity || 'NORMAL') : userInstructions.intensity;

    let effectiveRedChance = RED_CARD_CHANCE;
    let effectiveYellowChance = YELLOW_CARD_CHANCE;
    if (sideIntensity === 'AGGRESSIVE') {
      effectiveRedChance *= 1.50;
      effectiveYellowChance *= 1.65;
    } else if (sideIntensity === 'CAUTIOUS') {
      effectiveRedChance *= 0.5;
      effectiveYellowChance *= 0.5;
    }
    effectiveYellowChance *= 1.10; // CUP boost

    let injuryIntensityMult = 1.0;
    if (sideIntensity === 'AGGRESSIVE' && otherIntensity === 'AGGRESSIVE')
      injuryIntensityMult = 1.05 + seededRng(currentSeed, minute, 7777) * 0.25;
    else if (sideIntensity === 'AGGRESSIVE')
      injuryIntensityMult = 1.0 + seededRng(currentSeed, minute, 7777) * 0.1;
    else if (sideIntensity === 'CAUTIOUS' && otherIntensity === 'CAUTIOUS')
      injuryIntensityMult = 0.4;
    else if (sideIntensity === 'CAUTIOUS' || otherIntensity === 'CAUTIOUS')
      injuryIntensityMult = 0.7;

    const effectiveSevereBonus = SEVERE_INJURY_CHANCE * Math.max(0, injuryIntensityMult - 1.0);

    // Wybierz zawodnika - ważone zmęczeniem
    const teamPool = incidentSide === 'HOME' ? homeTeam.players : awayTeam.players;
    const teamXI = incidentSide === 'HOME' ? homeLineup : awayLineup;
    const fatigueMapForSide = incidentSide === 'HOME' ? homeFatigue : awayFatigue;
    const activeIds = teamXI.filter(id => id !== null) as string[];
    const targetId = activeIds[Math.floor(seededRng(currentSeed, minute, 777) * activeIds.length)] || activeIds[0];
    const targetPlayer = targetId ? teamPool.find(p => p.id === targetId) : null;

    if (targetPlayer) {
      const targetCondition = fatigueMapForSide[targetPlayer.id] ?? targetPlayer.condition;
      const BASE_INJURY_TOTAL = SEVERE_INJURY_CHANCE + LIGHT_INJURY_CHANCE;
      let totalInjuryChance: number;
      if (targetCondition >= 75) totalInjuryChance = BASE_INJURY_TOTAL;
      else if (targetCondition >= 50) totalInjuryChance = 0.03 + ((75 - targetCondition) / 25) * (0.60 - 0.03);
      else if (targetCondition >= 35) totalInjuryChance = 0.60 + ((50 - targetCondition) / 15) * (0.92 - 0.60);
      else totalInjuryChance = 0.98;
      totalInjuryChance = Math.min(0.98, totalInjuryChance * injuryIntensityMult);

      const sevRatio = SEVERE_INJURY_CHANCE / BASE_INJURY_TOTAL;
      const effectiveSevereChance = totalInjuryChance * sevRatio;
      const tempoLightBonus = (userInstructions.tempo === 'FAST' || aiActiveShout.tempo === 'FAST') ? 0.003 : 0;
      const effectiveLightChance = Math.min(0.98, (totalInjuryChance * (1 - sevRatio) + tempoLightBonus) * 0.80);

      const cardRoll = seededRng(currentSeed, minute, 9991);
      const injuryRoll = seededRng(currentSeed, minute, 9993);

      // 1. CZERWONA KARTKA
      if (cardRoll < effectiveRedChance) {
        sentOffIds.push(targetPlayer.id);
        if (incidentSide === 'HOME') {
          homeLineup = homeLineup.map(id => id === targetPlayer.id ? null : id);
          homeRedCards++;
        } else {
          awayLineup = awayLineup.map(id => id === targetPlayer.id ? null : id);
          awayRedCards++;
          // AI reaguje na czerwoną kartką - przechodzi na defensywę
          aiSwitchToDefensive(minute, `AI czerwona kartka - gra w ${awayLineup.filter(id => id !== null).length}!`);
        }
      }
      // 2. GROŹNA KONTUZJA
      else if (injuryRoll < effectiveSevereChance + effectiveSevereBonus) {
        if (incidentSide === 'HOME') {
          homeInjuries[targetPlayer.id] = InjurySeverity.SEVERE;
          homeLineup = homeLineup.map(id => id === targetPlayer.id ? null : id);
          homeSevereInj++;
        } else {
          awayInjuries[targetPlayer.id] = InjurySeverity.SEVERE;
          awayLineup = awayLineup.map(id => id === targetPlayer.id ? null : id);
          awaySevereInj++;
        }
      }
      // 3. LEKKI URAZ
      else if (injuryRoll < effectiveSevereChance + effectiveSevereBonus + effectiveLightChance) {
        const pStrength = targetPlayer.attributes.strength || 50;
        const conditionDrop = 5 + ((100 - pStrength) / 100) * 5;
        if (incidentSide === 'HOME') {
          homeFatigue[targetPlayer.id] = Math.max(0, (homeFatigue[targetPlayer.id] ?? targetPlayer.condition) - conditionDrop);
          homeLightInj++;
        } else {
          awayFatigue[targetPlayer.id] = Math.max(0, (awayFatigue[targetPlayer.id] ?? targetPlayer.condition) - conditionDrop);
          awayLightInj++;
        }
      }
      // 4. ŻÓŁTA KARTKA
      else if (cardRoll < effectiveRedChance + effectiveYellowChance) {
        const yellows = (playerYellowCards[targetPlayer.id] || 0) + 1;
        playerYellowCards[targetPlayer.id] = yellows;
        if (incidentSide === 'HOME') homeYellowCards++;
        else awayYellowCards++;

        if (yellows >= 2) {
          sentOffIds.push(targetPlayer.id);
          if (incidentSide === 'HOME') {
            homeLineup = homeLineup.map(id => id === targetPlayer.id ? null : id);
            homeRedCards++;
          } else {
            awayLineup = awayLineup.map(id => id === targetPlayer.id ? null : id);
            awayRedCards++;
            aiSwitchToDefensive(minute, `AI 2xżółta→czerwona - gra w ${awayLineup.filter(id => id !== null).length}!`);
          }
        }
      }
    }

    // === FAZA 1: BITWY KATEGORII (identyczna z silnikiem) ===
    const humanFactor = (offset: number) => 0.60 + (seededRng(currentSeed, minute, offset) * 0.80);

    const battleCategories: { attrs: (keyof PlayerAttributes)[]; positions: PlayerPosition[] }[] = [
      { attrs: ['stamina', 'workRate'],   positions: [PlayerPosition.MID, PlayerPosition.DEF, PlayerPosition.FWD] },
      { attrs: ['strength', 'defending'], positions: [PlayerPosition.DEF, PlayerPosition.MID] },
      { attrs: ['technique', 'vision'],   positions: [PlayerPosition.MID, PlayerPosition.FWD] },
      { attrs: ['pace', 'dribbling'],     positions: [PlayerPosition.FWD, PlayerPosition.MID] },
      { attrs: ['passing', 'vision'],     positions: [PlayerPosition.MID, PlayerPosition.DEF] },
      { attrs: ['crossing', 'heading'],   positions: [PlayerPosition.MID, PlayerPosition.FWD, PlayerPosition.DEF] },
      { attrs: ['positioning', 'mentality'], positions: [PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD] },
      { attrs: ['finishing', 'attacking'], positions: [PlayerPosition.FWD, PlayerPosition.MID] },
    ];

    let homeWins = 0;
    let awayWins = 0;

    battleCategories.forEach(({ attrs, positions }, i) => {
      const hPwr = getFormationPowerPro(homeLineup, homeTeam.players, homeFatigue, attrs, positions, 1.0, homeInjuries, homeTactic) * humanFactor(i * 17 + 1);
      const aPwr = getFormationPowerPro(awayLineup, awayTeam.players, awayFatigue, attrs, positions, 1.0, awayInjuries, awayTactic) * humanFactor(i * 17 + 2);
      const totalPower = hPwr + aPwr;
      const homeWinProb = hPwr / totalPower;
      const matchChaos = 0.88 + (seededRng(currentSeed, minute, i) * 0.24);
      if (seededRng(currentSeed, minute, i + 100) * matchChaos < homeWinProb) {
        homeWins++;
        momentum += (1.8 + seededRng(currentSeed, minute, i + 200) * 2.2);
      } else {
        awayWins++;
        momentum -= (1.8 + seededRng(currentSeed, minute, i + 300) * 2.2);
      }
    });

    if (homeWins >= 5) momentum += 12;
    else if (awayWins >= 5) momentum -= 12;

    // Clamp momentum
    momentum = Math.max(-100, Math.min(100, momentum));
    if (momentum > momentumHigh) momentumHigh = momentum;
    if (momentum < momentumLow) momentumLow = momentum;

    // Wybierz stronę atakującą
    let eventSide: 'HOME' | 'AWAY';
    if (homeWins === awayWins) {
      eventSide = seededRng(currentSeed, minute, 201) < 0.5 ? 'HOME' : 'AWAY';
    } else {
      const totalWins = Math.max(1, homeWins + awayWins);
      const rawHomeInitiative = homeWins / totalWins;
      const compressedHomeInitiative = 0.22 + (rawHomeInitiative * 0.56);
      const momentumShift = Math.max(-0.06, Math.min(0.06, momentum / 500));
      const homeInitiativeProb = Math.max(0.22, Math.min(0.78, compressedHomeInitiative + momentumShift));
      eventSide = seededRng(currentSeed, minute, 201) < homeInitiativeProb ? 'HOME' : 'AWAY';
    }

    // === FAZA 2: PROGRESJA ATAKU ===
    const diceMultiplier = 0.85 + seededRng(currentSeed, minute, 444) * 0.30;
    const diceRolls = 6 + Math.floor(seededRng(currentSeed, minute, 445) * 3.0 * diceMultiplier);

    let successfulPasses = 0;
    for (let i = 0; i < diceRolls; i++) {
      const attPwr = getFormationPowerPro(
        eventSide === 'HOME' ? homeLineup : awayLineup,
        eventSide === 'HOME' ? homeTeam.players : awayTeam.players,
        eventSide === 'HOME' ? homeFatigue : awayFatigue,
        ['attacking', 'passing'], [PlayerPosition.MID, PlayerPosition.FWD], 1.0,
        eventSide === 'HOME' ? homeInjuries : awayInjuries
      );
      const defPwr = getFormationPowerPro(
        eventSide === 'HOME' ? awayLineup : homeLineup,
        eventSide === 'HOME' ? awayTeam.players : homeTeam.players,
        eventSide === 'HOME' ? awayFatigue : homeFatigue,
        ['defending', 'positioning'], [PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.GK], 1.0,
        eventSide === 'HOME' ? awayInjuries : homeInjuries
      );
      if (attPwr * humanFactor(i * 7 + 300) > defPwr * humanFactor(i * 7 + 400)) {
        successfulPasses++;
        momentum += (eventSide === 'HOME' ? 1.8 : -1.8);
      }
    }

    // Przechwyt
    const interceptRoll = seededRng(currentSeed, minute, 555);
    if (interceptRoll < 0.15 && successfulPasses < diceRolls * 0.4) {
      momentum = (eventSide === 'HOME' ? -15 : 15);
      successfulPasses = 0;
    }

    // Dynamiczny próg
    const directionalMomentum = eventSide === 'HOME' ? Math.max(0, momentum) : Math.max(0, -momentum);
    const momentumBonus = directionalMomentum / 250;
    const activeBaseThreshold = eventSide === 'HOME' ? homeProgressionThreshold : awayProgressionThreshold;
    let dynamicThreshold = Math.max(0.25, (activeBaseThreshold - momentumBonus) * 1.03);

    // Underdog bonus
    const isUnderdog = eventSide === 'HOME' ? powerDiff < 0 : powerDiff > 0;
    const attackingClubRep = eventSide === 'HOME' ? homeTeam.club.reputation : awayTeam.club.reputation;
    const defendingClubRep = eventSide === 'HOME' ? awayTeam.club.reputation : homeTeam.club.reputation;
    const repGap = Math.max(0, defendingClubRep - attackingClubRep);
    const powerGapRatio = Math.min(0.18, Math.abs(powerDiff) / Math.max(1, Math.max(pPower, aPower)) * 0.35);
    const underdogThresholdMultiplier = isUnderdog ? Math.max(0.74, 0.86 - (repGap * 0.015) - powerGapRatio) : 1.0;
    dynamicThreshold *= underdogThresholdMultiplier;

    // Instrukce gracza (HOME = user) wpływają na threshold
    const instr = userInstructions;
    let pActionMod = 1.0;
    let pGoalMod = 1.0;
    let pRiskMod = 1.0;

    if (instr.tempo === 'SLOW') pActionMod -= 0.05;
    if (instr.tempo === 'FAST') pActionMod += 0.05;
    if (instr.mindset === 'OFFENSIVE') { pGoalMod += 0.03; if (awayTeam.club.reputation >= homeTeam.club.reputation) pRiskMod += 0.025; }
    if (instr.mindset === 'DEFENSIVE') { pGoalMod -= 0.025; pRiskMod -= 0.025; }
    if (instr.intensity === 'AGGRESSIVE') pActionMod += 0.0075;
    if (instr.intensity === 'CAUTIOUS') pActionMod -= 0.0075;

    if (eventSide === 'HOME' && pActionMod !== 1.0) {
      dynamicThreshold = Math.max(0.25, dynamicThreshold * (1.0 / pActionMod));
    }

    // AI advantage factor
    let aiAdvantageFactor = 1.0;
    const pStyle = homeTactic.attackBias > 70 ? 'ALL-IN' : homeTactic.defenseBias > 80 ? 'BUS' : 'SOLID';
    const aiStyle = awayTactic.attackBias > 70 ? 'ALL-IN' : awayTactic.defenseBias > 80 ? 'BUS' : 'TRAP';
    if (pStyle === 'ALL-IN' && aiStyle === 'TRAP') {
      const myPow = pPower; const oppPow = aPower;
      const relDiff = Math.max(0, (myPow - oppPow) / Math.max(1, myPow));
      const counterBonus = Math.max(0.03, 0.17 - relDiff * 0.50);
      aiAdvantageFactor = 1.0 + counterBonus;
    }

    // AI goal threshold boost (pRiskMod)
    const aiClubRep = awayTeam.club.reputation;
    const playerClubRep = homeTeam.club.reputation;
    const aiGoalThresholdBoost = pRiskMod * (aiClubRep >= playerClubRep ? 0.04 : 0.03);

    if (eventSide === 'AWAY') {
      dynamicThreshold *= (1.5 - 1.0 * 0.5) / aiAdvantageFactor; // coachEfficiency=1.0
      dynamicThreshold = Math.max(0.25, dynamicThreshold - aiGoalThresholdBoost);
    }

    // Logika nasycenia bramkowego
    const timeSinceGoal = minute - lastGoalBoostMinute;
    const goalDiff = Math.abs(homeScore - awayScore);
    const leads = (eventSide === 'HOME' && homeScore > awayScore) || (eventSide === 'AWAY' && awayScore > homeScore);

    if (leads && goalDiff >= 1) {
      const satietyFactor = goalDiff === 1 ? 1.10 : 1 + (goalDiff - 1) * 0.22;
      dynamicThreshold = Math.min(0.95, dynamicThreshold * satietyFactor);
    }
    if (!leads && goalDiff >= 1) {
      const desperationBoost = goalDiff === 1 ? 0.92 : Math.max(0.62, 1 - goalDiff * 0.20);
      dynamicThreshold *= desperationBoost;
    }

    // Post-goal suppression
    if (timeSinceGoal < postGoalSuppressionDuration) {
      dynamicThreshold *= (1 + postGoalPenaltyPct);
    }

    const currentThreshold = dynamicThreshold;
    const isCoolingDown = minute - lastGoalBoostMinute < 2;

    // Giant Killer
    let isGiantKillerShot = false;
    if (repGap >= 3 && !isCoolingDown) {
      const attackingTacticObj = eventSide === 'HOME' ? homeTactic : awayTactic;
      const giantKillerTacticMod = attackingTacticObj.attackBias > 55 ? 1.40
        : attackingTacticObj.defenseBias > 65 ? 0.60 : 1.00;
      const gkBaseFactor = repGap >= 5 ? 0.009 : 0.006;
      const giantKillerChance = Math.max(0.004, Math.min(0.050, (11 - repGap) * gkBaseFactor)) * giantKillerTacticMod;
      const alreadyGettingShot = successfulPasses / diceRolls > currentThreshold;
      if (!alreadyGettingShot && seededRng(currentSeed, minute, 9988) < giantKillerChance) {
        successfulPasses = Math.ceil(diceRolls * (currentThreshold + 0.05));
        isGiantKillerShot = true;
      }
    }

    // === STRZAŁ I GOL ===
    if (!isCoolingDown && successfulPasses / diceRolls > currentThreshold) {
      const attTeam = eventSide === 'HOME' ? homeTeam.players : awayTeam.players;
      const defTeam = eventSide === 'HOME' ? awayTeam.players : homeTeam.players;
      const attLineup = eventSide === 'HOME' ? homeLineup : awayLineup;
      const defLineup = eventSide === 'HOME' ? awayLineup : homeLineup;

      const scorer = pickScorer(attTeam, attLineup, currentSeed + minute);
      const keeper = defTeam.find(p => p.id === defLineup[0]) || defTeam[0];

      if (scorer && keeper) {
        if (eventSide === 'HOME') homeShotsTotal++;
        else awayShotsTotal++;

        const isRealKeeper = keeper.position === PlayerPosition.GK;
        const randomShot = 0.85 + seededRng(currentSeed, minute, 8801) * 0.3;
        const scorerFatigue = (eventSide === 'HOME' ? homeFatigue : awayFatigue)[scorer.id] ?? scorer.condition;
        const scorerFatigueMod = Math.max(0.38, scorerFatigue / 100);

        const shotPower =
          (scorer.attributes.finishing * 0.52 + scorer.attributes.attacking * 0.16 +
           scorer.attributes.technique * 0.10 + scorer.attributes.positioning * 0.10 +
           scorer.attributes.dribbling * 0.07 + scorer.attributes.mentality * 0.05) *
          humanFactor(500) * 0.92 * randomShot * scorerFatigueMod;

        const keeperFatigue = (eventSide === 'HOME' ? awayFatigue : homeFatigue)[keeper.id] ?? keeper.condition;
        const keeperFatigueMod = isRealKeeper ? Math.max(0.42, 0.40 + (keeperFatigue / 100) * 0.60) : 1.0;
        let savePower =
          (keeper.attributes.goalkeeping * 0.72 + keeper.attributes.positioning * 0.16 +
           (keeper.attributes.mentality || 50) * 0.07 + (keeper.attributes.leadership || 50) * 0.05) *
          (0.88 + seededRng(currentSeed, minute, 999) * 0.20) * keeperFatigueMod;
        if (!isRealKeeper) savePower *= 0.18;

        // Współczynnik konwersji
        const homePwr2 = pPower, awayPwr2 = aPower;
        const attackingPwr2 = eventSide === 'HOME' ? homePwr2 : awayPwr2;
        const defendingPwr2 = eventSide === 'HOME' ? awayPwr2 : homePwr2;
        const powerRatio = Math.min(1.5, attackingPwr2 / Math.max(1, defendingPwr2));
        const baseConversionMult = isGiantKillerShot
          ? Math.max(0.52, 0.60 - (powerRatio - 1.0) * 0.40)
          : Math.max(0.45, 0.60 - (powerRatio - 1.0) * 0.40);

        const attackingScore = eventSide === 'HOME' ? homeScore : awayScore;
        const defendingScore = eventSide === 'HOME' ? awayScore : homeScore;
        const leadDiff = attackingScore - defendingScore;
        const dominanceRepGap = Math.max(0, (eventSide === 'HOME' ? homeTeam.club.reputation : awayTeam.club.reputation)
          - (eventSide === 'HOME' ? awayTeam.club.reputation : homeTeam.club.reputation));
        const satietyBase = dominanceRepGap >= 3 ? 0.68 : 0.76;
        let satietyMult = 1.0;
        if (leadDiff >= 7) satietyMult = 0.0;
        else if (leadDiff >= 2) satietyMult = Math.pow(satietyBase, leadDiff - 1);
        else if (leadDiff === 1) satietyMult = 0.91;

        let luckyBonus = 0;
        const shootingClubRep = eventSide === 'HOME' ? homeTeam.club.reputation : awayTeam.club.reputation;
        if (shootingClubRep <= 7) {
          const luckChance = shootingClubRep <= 3 ? 0.18 : shootingClubRep <= 5 ? 0.13 : 0.08;
          if (seededRng(currentSeed, minute, 7171) < luckChance) {
            luckyBonus = 0.01 + Math.pow(seededRng(currentSeed, minute, 7172), 0.6) * 0.49;
          }
        }

        let rawGoalProbability = (shotPower / (shotPower + savePower)) * baseConversionMult * satietyMult + luckyBonus;
        if (eventSide === 'HOME' && pGoalMod !== 1.0) rawGoalProbability *= pGoalMod;
        if (isGiantKillerShot) rawGoalProbability = Math.max(rawGoalProbability, 0.22);

        const goalProbability = leadDiff >= 7 ? Math.min(0.01, rawGoalProbability) : Math.min(0.90, rawGoalProbability);
        const goalRoll = seededRng(currentSeed, minute, 8831);

        if (goalRoll < goalProbability) {
          if (eventSide === 'HOME') homeScore++;
          else awayScore++;

          lastGoalBoostMinute = minute;
          momentum = 0;
          const isEquivalent = Math.abs(pPower - aPower) < 25;
          postGoalSuppressionDuration = isEquivalent ? 4 + Math.floor(Math.random() * 5) : 7 + Math.floor(Math.random() * 6);
          postGoalPenaltyPct = isEquivalent ? 0.10 + Math.random() * 0.10 : 0.13 + Math.random() * 0.10;

          // AI reaguje po golu
          if (eventSide === 'HOME' && awayScore - homeScore <= -1) {
            // Gracz właśnie strzelił - AI traci
            if (minute >= 60) {
              aiReactions.push(`[${minute}'] AI traci gola ${homeScore}:${awayScore} - min.${minute}`);
            }
          }
        }
      } // end if scorer && keeper
    } // end if shot

    // dogrywka kończy minutę
    if (wentET && minute >= 120) break;
  }

  // Oblicz średnią kondycję
  const avgCond = (players: Player[], fatigue: Record<string, number>): number => {
    if (players.length === 0) return 90;
    return players.reduce((s, p) => s + (fatigue[p.id] ?? p.condition), 0) / players.length;
  };

  return {
    matchId,
    label: `T${homeTeam.club.tier} vs T${awayTeam.club.tier}`,
    homeTier: homeTeam.club.tier,
    awayTier: awayTeam.club.tier,
    homeRep: homeTeam.club.reputation,
    awayRep: awayTeam.club.reputation,
    homeTactic: homeTeam.tacticId,
    awayTactic: awayTeam.tacticId,
    userInstructions,
    homeScore, awayScore,
    totalGoals: homeScore + awayScore,
    homeShots: homeShotsTotal,
    awayShots: awayShotsTotal,
    homeRedCards, awayRedCards,
    homeYellowCards, awayYellowCards,
    homeSevereInjuries: homeSevereInj,
    awaySevereInjuries: awaySevereInj,
    homeLightInjuries: homeLightInj,
    awayLightInjuries: awayLightInj,
    wentET, wentPenalties,
    winner: homeScore > awayScore ? 'HOME' : awayScore > homeScore ? 'AWAY' : 'DRAW',
    minutesSimulated,
    aiReactions,
    homeFinalCondAvg: avgCond(homeTeam.players, homeFatigue),
    awayFinalCondAvg: avgCond(awayTeam.players, awayFatigue),
    momentumHigh,
    momentumLow,
  };
}

// ============================================================
// KONFIGURACJE 100 MECZÓW
// ============================================================

const TACTIC_COMBOS = [
  { home: '4-4-2',     away: '4-4-2',     label: 'Neutral vs Neutral' },
  { home: '4-4-2-OFF', away: '4-4-2-DEF', label: 'Aggressive vs Defensive' },
  { home: '4-3-3',     away: '4-5-1',     label: 'Pressing vs Bus' },
  { home: '4-2-4',     away: '5-3-2',     label: 'Ultra-OFF vs Ultra-DEF' },
  { home: '3-4-3',     away: '6-3-1',     label: 'All-In vs Park-Bus' },
  { home: '4-4-2',     away: '4-3-3-F9',  label: 'Neutral vs False-Nine' },
  { home: '4-4-2-DEF', away: '4-4-2-OFF', label: 'Defensive vs Aggressive' },
  { home: '5-3-2',     away: '4-2-4',     label: 'Fortress vs Brazilian' },
];

const INSTRUCTION_COMBOS: { instr: TacticalInstructions; label: string }[] = [
  {
    instr: { tempo: 'NORMAL', mindset: 'NEUTRAL', intensity: 'NORMAL', pressing: 'NORMAL', counterAttack: 'NORMAL', passing: 'MIXED' },
    label: 'Standard',
  },
  {
    instr: { tempo: 'FAST', mindset: 'OFFENSIVE', intensity: 'AGGRESSIVE', pressing: 'PRESSING', counterAttack: 'NORMAL', passing: 'MIXED' },
    label: 'Full-Attack Pressing',
  },
  {
    instr: { tempo: 'SLOW', mindset: 'DEFENSIVE', intensity: 'CAUTIOUS', pressing: 'NONE', counterAttack: 'COUNTER', passing: 'LONG' },
    label: 'Park-Bus Counter',
  },
  {
    instr: { tempo: 'NORMAL', mindset: 'OFFENSIVE', intensity: 'NORMAL', pressing: 'PRESSING', counterAttack: 'NORMAL', passing: 'SHORT' },
    label: 'Possession Pressing',
  },
  {
    instr: { tempo: 'FAST', mindset: 'NEUTRAL', intensity: 'AGGRESSIVE', pressing: 'PRESSING', counterAttack: 'COUNTER', passing: 'MIXED' },
    label: 'High-Tempo Blitz',
  },
];

// Konfiguracja 100 meczów: 10 matchupów tierowych × zróżnicowane taktyki/instrukcje
const TIER_MATCHUPS = [
  { homeTier: 1, awayTier: 1, count: 10, label: 'T1 vs T1 (Ekstraklasa top)' },
  { homeTier: 1, awayTier: 2, count: 10, label: 'T1 vs T2 (Ekstraklasa vs 1.Liga)' },
  { homeTier: 1, awayTier: 3, count: 10, label: 'T1 vs T3 (Ekstraklasa vs 2.Liga)' },
  { homeTier: 1, awayTier: 4, count: 10, label: 'T1 vs T4 (Ekstraklasa vs 3.Liga)' },
  { homeTier: 2, awayTier: 2, count: 10, label: 'T2 vs T2 (1.Liga)' },
  { homeTier: 2, awayTier: 3, count: 10, label: 'T2 vs T3 (1.Liga vs 2.Liga)' },
  { homeTier: 2, awayTier: 4, count: 10, label: 'T2 vs T4 (1.Liga vs 3.Liga)' },
  { homeTier: 3, awayTier: 3, count: 10, label: 'T3 vs T3 (2.Liga)' },
  { homeTier: 3, awayTier: 4, count: 10, label: 'T3 vs T4 (2.Liga vs 3.Liga)' },
  { homeTier: 4, awayTier: 4, count: 10, label: 'T4 vs T4 (3.Liga)' },
];

// ============================================================
// URUCHOMIENIE SYMULACJI
// ============================================================
function runSimulations(): MatchResult[] {
  const results: MatchResult[] = [];
  let matchId = 1;

  TIER_MATCHUPS.forEach(({ homeTier, awayTier, count, label }) => {
    console.log(`Symulacja: ${label}...`);

    for (let i = 0; i < count; i++) {
      const seed = matchId * 1337 + i * 73;
      const tacticCombo = TACTIC_COMBOS[i % TACTIC_COMBOS.length];
      const instrCombo = INSTRUCTION_COMBOS[i % INSTRUCTION_COMBOS.length];

      const homePlayers = buildSquad(homeTier, `home_${matchId}`, seed);
      const awayPlayers = buildSquad(awayTier, `away_${matchId}`, seed + 500);

      const homeClub = {
        name: `Drużyna-H-T${homeTier}-${matchId}`,
        shortName: `H-T${homeTier}`,
        reputation: TIER_PROFILES[homeTier].reputation,
        tier: homeTier,
      };
      const awayClub = {
        name: `Drużyna-A-T${awayTier}-${matchId}`,
        shortName: `A-T${awayTier}`,
        reputation: TIER_PROFILES[awayTier].reputation,
        tier: awayTier,
      };

      const result = simulateMatch({
        matchId,
        homeTeam: { club: homeClub, players: homePlayers, lineup: buildLineup(homePlayers), tacticId: tacticCombo.home },
        awayTeam: { club: awayClub, players: awayPlayers, lineup: buildLineup(awayPlayers), tacticId: tacticCombo.away },
        userInstructions: instrCombo.instr,
        seed,
      });

      results.push(result);
      matchId++;
    }
  });

  return results;
}

// ============================================================
// ANALIZA WYNIKÓW
// ============================================================

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function pct(count: number, total: number): string {
  if (total === 0) return '0.0%';
  return `${(count / total * 100).toFixed(1)}%`;
}

function printSeparator(char = '=', len = 80): void {
  console.log(char.repeat(len));
}

function analyzeResults(results: MatchResult[]): void {
  printSeparator();
  console.log('                RAPORT ANALIZY SYMULACJI - PUCHAR POLSKI                    ');
  console.log(`                    ${results.length} meczów | ${new Date().toLocaleDateString('pl-PL')}                    `);
  printSeparator();

  // ─────────────────────────────────────────────
  // 1. STATYSTYKI GLOBALNE
  // ─────────────────────────────────────────────
  console.log('\n[1] STATYSTYKI GLOBALNE\n');

  const allGoals   = results.map(r => r.totalGoals);
  const allHomeG   = results.map(r => r.homeScore);
  const allAwayG   = results.map(r => r.awayScore);
  const allShots   = results.map(r => r.homeShots + r.awayShots);
  const homeWins   = results.filter(r => r.winner === 'HOME').length;
  const awayWins   = results.filter(r => r.winner === 'AWAY').length;
  const draws      = results.filter(r => r.winner === 'DRAW').length;
  const goToET     = results.filter(r => r.wentET).length;
  const goToPens   = results.filter(r => r.wentPenalties).length;

  console.log(`  Meczów razem:          ${results.length}`);
  console.log(`  Wygrał gospodarz:      ${homeWins} (${pct(homeWins, results.length)})`);
  console.log(`  Wygrał gość:           ${awayWins} (${pct(awayWins, results.length)})`);
  console.log(`  Remis (→dogr/karne):   ${draws} (${pct(draws, results.length)})`);
  console.log(`  Do dogrywki:           ${goToET} (${pct(goToET, results.length)})`);
  console.log(`  Do rzutów karnych:     ${goToPens} (${pct(goToPens, results.length)})`);
  console.log(`  Śr. gole/mecz:         ${avg(allGoals).toFixed(2)} (min=${Math.min(...allGoals)}, max=${Math.max(...allGoals)})`);
  console.log(`  Śr. gole gosp./mecz:  ${avg(allHomeG).toFixed(2)}`);
  console.log(`  Śr. gole gości/mecz:  ${avg(allAwayG).toFixed(2)}`);
  console.log(`  Śr. strzały/mecz:      ${avg(allShots).toFixed(2)}`);

  // Rozkład wyników (score histogram)
  const scoreMap: Record<string, number> = {};
  results.forEach(r => {
    const key = `${r.homeScore}:${r.awayScore}`;
    scoreMap[key] = (scoreMap[key] || 0) + 1;
  });
  const sortedScores = Object.entries(scoreMap).sort((a, b) => b[1] - a[1]).slice(0, 15);
  console.log('\n  TOP 15 WYNIKÓW:');
  sortedScores.forEach(([score, cnt]) => {
    const bar = '█'.repeat(cnt);
    console.log(`    ${score.padEnd(8)} ${cnt.toString().padStart(3)}x  ${bar}`);
  });

  // Rozkład liczby goli
  const goalDistrib: Record<number, number> = {};
  results.forEach(r => {
    goalDistrib[r.totalGoals] = (goalDistrib[r.totalGoals] || 0) + 1;
  });
  console.log('\n  ROZKŁAD LICZBY GOLI W MECZU:');
  Object.entries(goalDistrib).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([goals, cnt]) => {
    const pctVal = (cnt / results.length * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(cnt / results.length * 40));
    console.log(`    ${goals.toString().padStart(2)} goli: ${cnt.toString().padStart(3)}x (${pctVal.padStart(5)}%) ${bar}`);
  });

  // ─────────────────────────────────────────────
  // 2. WYNIKI WEDŁUG MATCHUPU TIEROWEGO
  // ─────────────────────────────────────────────
  console.log('\n' + '─'.repeat(80));
  console.log('[2] WYNIKI WEDŁUG POZIOMU DRUŻYN\n');

  const tierKeys = new Set(results.map(r => r.label));
  tierKeys.forEach(key => {
    const group = results.filter(r => r.label === key);
    if (group.length === 0) return;

    const hw = group.filter(r => r.winner === 'HOME').length;
    const aw = group.filter(r => r.winner === 'AWAY').length;
    const d = group.filter(r => r.winner === 'DRAW').length;
    const avgGoals = avg(group.map(r => r.totalGoals));
    const avgHomeGoals = avg(group.map(r => r.homeScore));
    const avgAwayGoals = avg(group.map(r => r.awayScore));
    const upsets = group.filter(r => {
      const homeIsFav = r.homeRep > r.awayRep;
      return (homeIsFav && r.winner === 'AWAY') || (!homeIsFav && r.winner === 'HOME' && r.homeRep < r.awayRep);
    }).length;

    console.log(`  ${key}`);
    console.log(`    n=${group.length} | Wygrał H: ${pct(hw, group.length)} | Wygrał A: ${pct(aw, group.length)} | Remis: ${pct(d, group.length)}`);
    console.log(`    Śr. gole/mecz: ${avgGoals.toFixed(2)} (H: ${avgHomeGoals.toFixed(2)}, A: ${avgAwayGoals.toFixed(2)})`);
    if (upsets > 0) console.log(`    ⚠ Niespodzianki: ${upsets} (${pct(upsets, group.length)})`);
    console.log('');
  });

  // ─────────────────────────────────────────────
  // 3. WPŁYW TAKTYK
  // ─────────────────────────────────────────────
  console.log('─'.repeat(80));
  console.log('[3] WPŁYW TAKTYK NA LICZBĘ GOLI\n');

  const tacticGoalMap: Record<string, { goals: number[]; homeGoals: number[]; awayGoals: number[]; wins: number; total: number }> = {};
  results.forEach(r => {
    const key = `${r.homeTactic} vs ${r.awayTactic}`;
    if (!tacticGoalMap[key]) tacticGoalMap[key] = { goals: [], homeGoals: [], awayGoals: [], wins: 0, total: 0 };
    tacticGoalMap[key].goals.push(r.totalGoals);
    tacticGoalMap[key].homeGoals.push(r.homeScore);
    tacticGoalMap[key].awayGoals.push(r.awayScore);
    tacticGoalMap[key].total++;
    if (r.winner === 'HOME') tacticGoalMap[key].wins++;
  });

  Object.entries(tacticGoalMap).forEach(([key, data]) => {
    const tH = TACTICS_DB[key.split(' vs ')[0]];
    const tA = TACTICS_DB[key.split(' vs ')[1]];
    if (!tH || !tA) return;
    const hBias = tH.attackBias > 65 ? '⚡ATK' : tH.defenseBias > 65 ? '🛡DEF' : '⚖NEU';
    const aBias = tA.attackBias > 65 ? '⚡ATK' : tA.defenseBias > 65 ? '🛡DEF' : '⚖NEU';
    console.log(`  ${key} [H:${hBias} vs A:${aBias}]`);
    console.log(`    n=${data.total} | Śr.gole: ${avg(data.goals).toFixed(2)} | H: ${avg(data.homeGoals).toFixed(2)} | A: ${avg(data.awayGoals).toFixed(2)} | Wygrane H: ${pct(data.wins, data.total)}`);
    console.log('');
  });

  // ─────────────────────────────────────────────
  // 4. WPŁYW INSTRUKCJI GRACZA
  // ─────────────────────────────────────────────
  console.log('─'.repeat(80));
  console.log('[4] WPŁYW INSTRUKCJI GRACZA (HOME = gracz)\n');

  const instrGroups: Record<string, { results: MatchResult[] }> = {};
  results.forEach(r => {
    const i = r.userInstructions;
    const key = `${i.tempo}|${i.mindset}|${i.intensity}|${i.pressing}|${i.counterAttack}`;
    if (!instrGroups[key]) instrGroups[key] = { results: [] };
    instrGroups[key].results.push(r);
  });

  Object.entries(instrGroups).forEach(([key, data]) => {
    const pts = data.results;
    const sample = pts[0].userInstructions;
    const hw = pts.filter(r => r.winner === 'HOME').length;
    const aw = pts.filter(r => r.winner === 'AWAY').length;
    const avgG = avg(pts.map(r => r.totalGoals));
    const avgHG = avg(pts.map(r => r.homeScore));
    const avgAG = avg(pts.map(r => r.awayScore));
    const avgRedHome = avg(pts.map(r => r.homeRedCards));
    const avgYelHome = avg(pts.map(r => r.homeYellowCards));
    console.log(`  Tempo:${sample.tempo} | Nastawienie:${sample.mindset} | Intensywność:${sample.intensity} | Pressing:${sample.pressing} | Kontra:${sample.counterAttack}`);
    console.log(`    n=${pts.length} | Wygrane H: ${pct(hw, pts.length)} | Wygrane A: ${pct(aw, pts.length)}`);
    console.log(`    Śr.gole: ${avgG.toFixed(2)} (H: ${avgHG.toFixed(2)}, A: ${avgAG.toFixed(2)})`);
    console.log(`    Śr. czerwone H: ${avgRedHome.toFixed(3)} | Śr. żółte H: ${avgYelHome.toFixed(3)}`);
    console.log('');
  });

  // ─────────────────────────────────────────────
  // 5. WPŁYW CZERWONYCH KARTEK / KONTUZJI / ZMĘCZENIA
  // ─────────────────────────────────────────────
  console.log('─'.repeat(80));
  console.log('[5] WPŁYW CZERWONYCH KARTEK, KONTUZJI I ZMĘCZENIA\n');

  const matchesWithHomeRed = results.filter(r => r.homeRedCards > 0);
  const matchesWithAwayRed = results.filter(r => r.awayRedCards > 0);
  const matchesNoRed       = results.filter(r => r.homeRedCards === 0 && r.awayRedCards === 0);

  const calcWinRate = (grp: MatchResult[], side: 'HOME' | 'AWAY') =>
    grp.length > 0 ? (grp.filter(r => r.winner === side).length / grp.length * 100).toFixed(1) : 'N/A';

  console.log(`  Mecze BEZ czerwonych (n=${matchesNoRed.length}):`);
  console.log(`    Wygrane HOME: ${calcWinRate(matchesNoRed, 'HOME')}% | AWAY: ${calcWinRate(matchesNoRed, 'AWAY')}%`);
  console.log(`    Śr. gole/mecz: ${avg(matchesNoRed.map(r => r.totalGoals)).toFixed(2)}`);
  console.log('');

  if (matchesWithHomeRed.length > 0) {
    console.log(`  Mecze gdzie HOME dostał czerwoną (n=${matchesWithHomeRed.length}):`);
    console.log(`    Wygrane HOME: ${calcWinRate(matchesWithHomeRed, 'HOME')}% | AWAY: ${calcWinRate(matchesWithHomeRed, 'AWAY')}%`);
    console.log(`    Śr. gole/mecz: ${avg(matchesWithHomeRed.map(r => r.totalGoals)).toFixed(2)}`);
    console.log('');
  }

  if (matchesWithAwayRed.length > 0) {
    console.log(`  Mecze gdzie AWAY dostał czerwoną (n=${matchesWithAwayRed.length}):`);
    console.log(`    Wygrane HOME: ${calcWinRate(matchesWithAwayRed, 'HOME')}% | AWAY: ${calcWinRate(matchesWithAwayRed, 'AWAY')}%`);
    console.log(`    Śr. gole/mecz: ${avg(matchesWithAwayRed.map(r => r.totalGoals)).toFixed(2)}`);
    console.log('');
  }

  const matchesWithSevereInj = results.filter(r => r.homeSevereInjuries > 0 || r.awaySevereInjuries > 0);
  const matchesWithLightInj  = results.filter(r => r.homeLightInjuries > 0 || r.awayLightInjuries > 0);

  console.log(`  Groźne kontuzje:`);
  console.log(`    Mecze z groźną kontuzją: ${matchesWithSevereInj.length} (${pct(matchesWithSevereInj.length, results.length)})`);
  console.log(`    Śr. groźnych/mecz: ${avg(results.map(r => r.homeSevereInjuries + r.awaySevereInjuries)).toFixed(3)}`);
  console.log(`    Śr. lekkich/mecz:  ${avg(results.map(r => r.homeLightInjuries + r.awayLightInjuries)).toFixed(3)}`);
  console.log('');

  // Zmęczenie a wyniki
  const highFatigueHome = results.filter(r => r.homeFinalCondAvg < 80);
  const highFatigueAway = results.filter(r => r.awayFinalCondAvg < 80);
  console.log(`  Zmęczenie (kondycja na koniec meczu):`);
  console.log(`    Śr. końcowa kondycja HOME: ${avg(results.map(r => r.homeFinalCondAvg)).toFixed(1)}`);
  console.log(`    Śr. końcowa kondycja AWAY: ${avg(results.map(r => r.awayFinalCondAvg)).toFixed(1)}`);
  console.log(`    HOME <80 kondycja na końcu: ${highFatigueHome.length} meczów (${pct(highFatigueHome.length, results.length)})`);
  console.log('');

  // ─────────────────────────────────────────────
  // 6. REAKCJE AI NA WYNIK
  // ─────────────────────────────────────────────
  console.log('─'.repeat(80));
  console.log('[6] REAKCJE AI (AWAY) NA WYNIK\n');

  let aiDefensive = 0, aiOffensive = 0, aiRedCardReact = 0;
  const aiReactionSummary: Record<string, number> = {};

  results.forEach(r => {
    r.aiReactions.forEach(reaction => {
      if (reaction.includes('czerwona') || reaction.includes('żółta→czerwona')) aiRedCardReact++;
      else if (reaction.includes('broni') || reaction.includes('defensyw')) aiDefensive++;
      else if (reaction.includes('naciera') || reaction.includes('atakuje') || reaction.includes('desperacja')) aiOffensive++;
      const type = reaction.includes('czerwona') || reaction.includes('żółta→czerwona') ? 'Czerwona kartka' :
                   reaction.includes('broni') || reaction.includes('defensyw') ? 'Obrona przewagi' :
                   reaction.includes('naciera') || reaction.includes('atakuje') || reaction.includes('desperacja') ? 'Atak desperat' :
                   'Inne';
      aiReactionSummary[type] = (aiReactionSummary[type] || 0) + 1;
    });
  });

  console.log(`  Łączne reakcje AI: ${Object.values(aiReactionSummary).reduce((s, v) => s + v, 0)}`);
  Object.entries(aiReactionSummary).sort((a, b) => b[1] - a[1]).forEach(([type, cnt]) => {
    console.log(`    ${type}: ${cnt}x`);
  });
  console.log('');

  // Przykłady reakcji AI
  const aiExamples = results
    .filter(r => r.aiReactions.length > 0)
    .slice(0, 8);
  if (aiExamples.length > 0) {
    console.log('  Przykłady reakcji AI:');
    aiExamples.forEach(r => {
      if (r.aiReactions.length > 0) {
        console.log(`    Mecz ${r.matchId} (${r.label}, wynik ${r.homeScore}:${r.awayScore}): ${r.aiReactions.slice(0, 2).join(' | ')}`);
      }
    });
  }

  // ─────────────────────────────────────────────
  // 7. ANALIZA REALISTYCZNOŚCI - OCENA PRAWDOPODOBIEŃSTWA
  // ─────────────────────────────────────────────
  console.log('\n' + '─'.repeat(80));
  console.log('[7] OCENA REALISTYCZNOŚCI WYNIKÓW\n');

  // Polskie dane referencyjne (sezon 2023/24 Ekstraklasa)
  const REF_GOALS_PER_MATCH = 2.68;    // Ekstraklasa śr. gole/mecz 2023/24
  const REF_HOME_WIN_PCT    = 0.444;   // 44.4% wygranych gospdarzy w PL
  const REF_DRAWS_PCT       = 0.238;   // 23.8% remisów
  const REF_AWAY_WIN_PCT    = 0.318;   // 31.8% wygranych gości

  const simGoalsPerMatch = avg(results.map(r => r.totalGoals));
  const simHomeWinPct    = homeWins / results.length;
  const simDrawsPct      = draws / results.length;
  const simAwayWinPct    = awayWins / results.length;

  const goalsDeviation = Math.abs(simGoalsPerMatch - REF_GOALS_PER_MATCH);
  const homeWinDeviation = Math.abs(simHomeWinPct - REF_HOME_WIN_PCT) * 100;
  const drawsDeviation = Math.abs(simDrawsPct - REF_DRAWS_PCT) * 100;

  console.log('  Porównanie z danymi referencyjnymi (Ekstraklasa 2023/24):');
  console.log(`  ${'METRYKA'.padEnd(30)} ${'SYMULACJA'.padEnd(12)} ${'REFERENCJA'.padEnd(12)} ${'ODCHYLENIE'.padEnd(12)} OCENA`);
  console.log('  ' + '─'.repeat(76));

  const checkMetric = (sim: number, ref: number, label: string, threshold: number) => {
    const dev = Math.abs(sim - ref);
    const ok = dev <= threshold;
    console.log(`  ${label.padEnd(30)} ${sim.toFixed(3).padEnd(12)} ${ref.toFixed(3).padEnd(12)} ${dev.toFixed(3).padEnd(12)} ${ok ? '✅ OK' : '⚠️  ODCHYLENIE'}`);
    return ok;
  };

  const checks = [
    checkMetric(simGoalsPerMatch, REF_GOALS_PER_MATCH, 'Śr. gole/mecz', 0.80),
    checkMetric(simHomeWinPct * 100, REF_HOME_WIN_PCT * 100, 'Wygrane HOME %', 8.0),
    checkMetric(simDrawsPct * 100, REF_DRAWS_PCT * 100, 'Remisy %', 8.0),
    checkMetric(simAwayWinPct * 100, REF_AWAY_WIN_PCT * 100, 'Wygrane AWAY %', 8.0),
  ];

  // Puchar dodatkowo: duże niespodzianki
  const bigUpsets = results.filter(r => {
    const repDiff = Math.abs(r.homeRep - r.awayRep);
    return repDiff >= 6 && ((r.homeRep < r.awayRep && r.winner === 'HOME') || (r.homeRep > r.awayRep && r.winner === 'AWAY'));
  });
  console.log(`\n  Niespodzianki (różnica rep≥6, słabszy wygrał): ${bigUpsets.length} (${pct(bigUpsets.length, results.length)})`);
  console.log(`    → Oczekiwane ~5-15% w rozgrywkach pucharowych`);

  // Mecze hokejowe (≥5 goli)?
  const hockeyMatches = results.filter(r => r.totalGoals >= 5);
  const highScoring   = results.filter(r => r.totalGoals >= 4);
  console.log(`\n  Mecze z 4+ golami: ${highScoring.length} (${pct(highScoring.length, results.length)}) → oczekiwane ~20-28%`);
  console.log(`  Mecze z 5+ golami: ${hockeyMatches.length} (${pct(hockeyMatches.length, results.length)}) → oczekiwane ~8-15%`);
  console.log(`  Mecze z 0 golami:  ${results.filter(r => r.totalGoals === 0).length} (${pct(results.filter(r => r.totalGoals === 0).length, results.length)}) → oczekiwane ~7-12%`);

  const passedChecks = checks.filter(Boolean).length;
  console.log(`\n  Łącznie przeszło kontroli: ${passedChecks}/${checks.length}`);

  if (passedChecks >= 3) {
    console.log('  ✅ WNIOSEK: Symulacja mieści się w granicach realistycznych wyników piłkarskich.');
  } else if (passedChecks >= 2) {
    console.log('  ⚠️  WNIOSEK: Symulacja wymaga kalibracji - część metryk odbiega od normy.');
  } else {
    console.log('  ❌ WNIOSEK: Symulacja wymaga znacznej kalibracji - wyniki wyраźnie nierealistyczne.');
  }

  // ─────────────────────────────────────────────
  // 8. DIAGNOZA I ZALECENIA
  // ─────────────────────────────────────────────
  console.log('\n' + '─'.repeat(80));
  console.log('[8] DIAGNOZA I ZALECENIA\n');

  if (simGoalsPerMatch > REF_GOALS_PER_MATCH + 1.0) {
    console.log('  🔴 ZA DUŻO GOLI: Symulacja produkuje wyniki hokejowe.');
    console.log('     → Rozwiązanie: Podnieść BASE_GOAL_THRESHOLD lub obniżyć baseConversionMult');
    console.log('     → Lub: Silniejszy dynamicThreshold w spokojnych minutach (momentum<15)');
  } else if (simGoalsPerMatch < REF_GOALS_PER_MATCH - 1.0) {
    console.log('  🔴 ZA MAŁO GOLI: Mecze kończą się zbyt często 0:0 lub 1:0.');
    console.log('     → Rozwiązanie: Obniżyć baseConversionMult floor, zwiększyć luckyBonus dla T1');
  } else {
    console.log(`  ✅ LICZBA GOLI: Średnia ${simGoalsPerMatch.toFixed(2)} goli/mecz - realistyczna (ref: ${REF_GOALS_PER_MATCH})`);
  }

  const etPct = goToET / results.length;
  if (etPct > 0.30) {
    console.log(`\n  🔴 ZA DUŻO DOGRYWEK: ${pct(goToET, results.length)} meczów w dogrywce (norma ~15-20% dla pucharów)`);
  } else if (etPct < 0.10) {
    console.log(`\n  ⚠️  MAŁO DOGRYWEK: ${pct(goToET, results.length)} - może za małe prawdopodobieństwo remisu`);
  } else {
    console.log(`\n  ✅ DOGRYWKI: ${pct(goToET, results.length)} - w normie dla pucharów`);
  }

  const redPer90 = avg(results.map(r => r.homeRedCards + r.awayRedCards));
  const yellowPer90 = avg(results.map(r => r.homeYellowCards + r.awayYellowCards));
  if (redPer90 > 0.15) {
    console.log(`\n  🔴 ZA DUŻO czerwonych kartek: ${redPer90.toFixed(3)}/mecz (norma ~0.05-0.10 w Ekstraklasie)`);
    console.log('     → Rozwiązanie: Obniżyć RED_CARD_CHANCE o ~30%');
  } else if (redPer90 < 0.01) {
    console.log(`\n  ⚠️  ZA MAŁO czerwonych: ${redPer90.toFixed(3)}/mecz`);
  } else {
    console.log(`\n  ✅ CZERWONE KARTKI: ${redPer90.toFixed(3)}/mecz - w normie`);
  }

  console.log(`     Żółte kartki: ${yellowPer90.toFixed(2)}/mecz (norma ~3.0-4.5 w PL)`);
  if (yellowPer90 > 5.0) {
    console.log('     → ZA DUŻO żółtych. Obniżyć YELLOW_CARD_CHANCE lub effectiveYellowChance multiplier dla CUP');
  }

  const upsetPct = bigUpsets.length / results.length;
  if (upsetPct < 0.03) {
    console.log(`\n  ⚠️  ZBYT MAŁO NIESPODZIANEK: ${pct(bigUpsets.length, results.length)} - puchar powinien generować ~5-12% dużych niespodzianek`);
    console.log('     → Rozwiązanie: Zwiększyć giantKillerChance, wzmocnić underdogThresholdMultiplier dla T3/T4');
  } else if (upsetPct > 0.20) {
    console.log(`\n  🔴 ZA DUŻO NIESPODZIANEK: ${pct(bigUpsets.length, results.length)} - faworyt nie ma realnej przewagi`);
    console.log('     → Rozwiązanie: Zmniejszyć underdogThresholdMultiplier, obniżyć luckyBonus cap');
  } else {
    console.log(`\n  ✅ NIESPODZIANKI: ${pct(bigUpsets.length, results.length)} - realistyczne dla rozgrywek pucharowych`);
  }

  // ─────────────────────────────────────────────
  // 9. PODSUMOWANIE MECZU-PRZYKŁADU (debug view)
  // ─────────────────────────────────────────────
  console.log('\n' + '─'.repeat(80));
  console.log('[9] PRZYKŁADOWE MECZE (TOP 10 NAJCIEKAWSZYCH)\n');

  const interesting = [...results]
    .sort((a, b) => (b.totalGoals + b.homeRedCards * 2 + b.awayRedCards * 2 + (b.wentET ? 1 : 0)) - (a.totalGoals + a.homeRedCards * 2 + a.awayRedCards * 2 + (a.wentET ? 1 : 0)))
    .slice(0, 10);

  interesting.forEach(r => {
    const instrShort = `${r.userInstructions.tempo.slice(0, 3)}|${r.userInstructions.mindset.slice(0, 3)}|${r.userInstructions.intensity.slice(0, 3)}`;
    const events: string[] = [];
    if (r.homeRedCards > 0) events.push(`🟥${r.homeRedCards}H`);
    if (r.awayRedCards > 0) events.push(`🟥${r.awayRedCards}A`);
    if (r.homeSevereInjuries + r.awaySevereInjuries > 0) events.push(`🏥${r.homeSevereInjuries + r.awaySevereInjuries}`);
    if (r.wentPenalties) events.push('PKR');
    if (r.wentET) events.push('ET');
    console.log(`  #${r.matchId.toString().padStart(3)} ${r.label} | ${r.homeTactic.padEnd(10)} vs ${r.awayTactic.padEnd(10)} | [${instrShort}] | ${r.homeScore}:${r.awayScore} ${events.join(' ')}`);
  });

  printSeparator();
  console.log('\nSymulacja zakończona. Użyj danych powyżej do kalibracji silnika.\n');
}

// ============================================================
// MAIN
// ============================================================
console.log('🏆 CUP SIMULATION ANALYSIS - startowanie 100 meczów...\n');
const results = runSimulations();
console.log(`\n✅ Zasymulowano ${results.length} meczów.\n`);
analyzeResults(results);
