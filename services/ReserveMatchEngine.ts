
import { Player, Coach, PlayerPosition, HealthStatus, InjurySeverity, MatchGoalEntry, MatchCardEntry, MatchSubstitutionEntry, MatchInjuryEntry, ReserveMatchPlayerEntry, Region } from '../types';
import { TacticRepository } from '../resources/tactics_db';

const INJURY_TYPES = ['Naciągnięcie mięśnia', 'Skręcenie kostki', 'Stłuczenie', 'Naderwanie więzadła', 'Kontuzja kolana'];

const TACTIC_PROFILES: Record<string, { atkMult: number; defMult: number }> = {
  '4-4-2':   { atkMult: 1.00, defMult: 1.00 },
  '4-3-3':   { atkMult: 1.12, defMult: 0.88 },
  '4-2-3-1': { atkMult: 0.95, defMult: 1.10 },
  '5-3-2':   { atkMult: 0.85, defMult: 1.20 },
  '5-4-1':   { atkMult: 0.80, defMult: 1.25 },
  '3-5-2':   { atkMult: 1.08, defMult: 0.92 },
  '4-1-4-1': { atkMult: 0.90, defMult: 1.08 },
};

const POLISH_FIRST_NAMES = ['Jakub', 'Mateusz', 'Bartosz', 'Kamil', 'Łukasz', 'Piotr', 'Michał', 'Tomasz', 'Paweł', 'Marcin', 'Krzysztof', 'Grzegorz', 'Szymon', 'Maciej', 'Rafał'];
const POLISH_LAST_NAMES = ['Kowalski', 'Nowak', 'Wiśniewski', 'Wójcik', 'Kowalczyk', 'Kamiński', 'Lewandowski', 'Zieliński', 'Szymański', 'Woźniak', 'Dąbrowski', 'Kozłowski', 'Jankowski', 'Mazur', 'Kwiatkowski'];

function makeRng(seed: number) {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return (offset: number) => {
    const x = Math.sin(s + offset) * 10000;
    return x - Math.floor(x);
  };
}

function rollRng(rng: (o: number) => number, base: number): number {
  return rng(base + Math.floor(rng(base * 7) * 9999));
}

function generateJuniorGK(seed: number, index: number): Player {
  const rng = makeRng(seed + index * 777);
  const firstName = POLISH_FIRST_NAMES[Math.floor(rng(1) * POLISH_FIRST_NAMES.length)];
  const lastName = POLISH_LAST_NAMES[Math.floor(rng(2) * POLISH_LAST_NAMES.length)];
  const gkStat = 35 + Math.floor(rng(3) * 20);
  const low = (o: number) => 20 + Math.floor(rng(o) * 20);
  return {
    id: `junior_gk_temp_${seed}_${index}`,
    firstName,
    lastName,
    age: 16 + Math.floor(rng(16) * 4),
    clubId: 'JUNIOR',
    nationality: Region.POLAND,
    position: PlayerPosition.GK,
    overallRating: 42 + Math.floor(rng(4) * 10),
    attributes: {
      strength: low(5),
      stamina: low(6),
      pace: low(7),
      defending: low(8),
      passing: low(9),
      attacking: low(10),
      finishing: low(11),
      technique: low(12),
      vision: low(13),
      dribbling: low(14),
      heading: low(15),
      positioning: 30 + Math.floor(rng(17) * 15),
      goalkeeping: gkStat,
      freeKicks: low(18),
      talent: 40 + Math.floor(rng(19) * 30),
      penalties: low(20),
      corners: low(21),
      aggression: low(22),
      crossing: low(23),
      leadership: low(24),
      mentality: 40 + Math.floor(rng(25) * 20),
      workRate: 50 + Math.floor(rng(26) * 20),
    },
    stats: {
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
      matchesPlayed: 0,
      minutesPlayed: 0,
      seasonalChanges: {},
      ratingHistory: [],
    },
    health: { status: HealthStatus.HEALTHY },
    condition: 75 + Math.floor(rng(27) * 15),
    suspensionMatches: 0,
    contractEndDate: '2099-06-30',
    annualSalary: 0,
    history: [],
    boardLockoutUntil: null,
    isUntouchable: false,
    negotiationStep: 0,
    negotiationLockoutUntil: null,
    contractLockoutUntil: null,
    fatigueDebt: 0,
    isNegotiationPermanentBlocked: false,
    transferLockoutUntil: null,
    freeAgentLockoutUntil: null,
  };
}

// Wybiera najlepszych startowych 11 z dostępnych rezerw
function pickReserveLineup(
  reserves: Player[],
  tacticId: string,
  rng: (o: number) => number,
  seed: number
): { xi: Player[]; bench: Player[]; juniors: Player[] } {
  const tactic = TacticRepository.getById(tacticId);
  const available = reserves.filter(p =>
    p.health.status === HealthStatus.HEALTHY &&
    p.suspensionMatches === 0
  );

  const juniors: Player[] = [];
  const availableGKCount = available.filter(p => p.position === PlayerPosition.GK).length;
  const missingGKs = Math.max(0, 2 - availableGKCount);
  for (let i = 0; i < missingGKs; i++) {
    const junior = generateJuniorGK(seed, i);
    juniors.push(junior);
    available.push(junior);
  }

  const needed: Record<PlayerPosition, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const slot of tactic.slots) {
    needed[slot.role] = (needed[slot.role] || 0) + 1;
  }

  const byPos: Record<PlayerPosition, Player[]> = {
    [PlayerPosition.GK]: [],
    [PlayerPosition.DEF]: [],
    [PlayerPosition.MID]: [],
    [PlayerPosition.FWD]: [],
  };
  for (const p of available) {
    byPos[p.position].push(p);
  }
  for (const pos of Object.keys(byPos) as PlayerPosition[]) {
    byPos[pos].sort((a, b) => b.overallRating - a.overallRating);
  }

  const fallbackOrder: Record<PlayerPosition, PlayerPosition[]> = {
    [PlayerPosition.GK]:  [PlayerPosition.GK],
    [PlayerPosition.DEF]: [PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD],
    [PlayerPosition.MID]: [PlayerPosition.MID, PlayerPosition.DEF, PlayerPosition.FWD],
    [PlayerPosition.FWD]: [PlayerPosition.FWD, PlayerPosition.MID, PlayerPosition.DEF],
  };

  const xi: Player[] = [];
  const usedIds = new Set<string>();

  for (const pos of [PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD]) {
    const count = needed[pos] || 0;
    let picked = 0;
    for (const fallbackPos of fallbackOrder[pos]) {
      for (const p of byPos[fallbackPos]) {
        if (picked >= count) break;
        if (!usedIds.has(p.id)) {
          xi.push(p);
          usedIds.add(p.id);
          picked++;
        }
      }
      if (picked >= count) break;
    }
  }

  const bench = available.filter(p => !usedIds.has(p.id)).slice(0, 8);
  return { xi, bench, juniors };
}

// Wybiera 11 zawodników przeciwnika (pierwszych po posortowaniu pozycją)
function pickOpponentLineup(opponents: Player[]): { xi: Player[]; bench: Player[] } {
  const byPos: Record<string, Player[]> = {};
  for (const p of opponents) {
    if (!byPos[p.position]) byPos[p.position] = [];
    byPos[p.position].push(p);
  }
  const order = [PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD];
  const needed: Record<string, number> = { GK: 1, DEF: 4, MID: 4, FWD: 2 };
  const xi: Player[] = [];
  const usedIds = new Set<string>();
  for (const pos of order) {
    const count = needed[pos] || 0;
    const pool = (byPos[pos] || []).sort((a, b) => b.overallRating - a.overallRating);
    for (let i = 0; i < count && i < pool.length; i++) {
      xi.push(pool[i]);
      usedIds.add(pool[i].id);
    }
  }
  const bench = opponents.filter(p => !usedIds.has(p.id)).slice(0, 9);
  return { xi, bench };
}

function getTeamStrength(players: Player[], xi: Player[]): { atk: number; def: number; gk: number } {
  const xiPlayers = players.filter(p => xi.find(x => x.id === p.id));
  if (xiPlayers.length === 0) return { atk: 50, def: 50, gk: 50 };
  const avg = (key: keyof Player['attributes']) =>
    xiPlayers.reduce((s, p) => s + p.attributes[key], 0) / xiPlayers.length;
  const avgCondition = xiPlayers.reduce((s, p) => s + p.condition, 0) / xiPlayers.length;
  const condFactor = 0.5 + (avgCondition / 100) * 0.5;
  return {
    atk: (avg('attacking') * 0.4 + avg('finishing') * 0.4 + avg('pace') * 0.2) * condFactor,
    def: (avg('defending') * 0.5 + avg('strength') * 0.3 + avg('positioning') * 0.2) * condFactor,
    gk: avg('goalkeeping') * condFactor,
  };
}

function calcXg(
  atkStr: number,
  defStr: number,
  gkStr: number,
  isHome: boolean,
  redCardPenalty: number,
  atkTacticMult: number,
  defTacticMult: number,
  pitchMod: number
): number {
  const base = 1.15 + (isHome ? 0.08 : 0) + pitchMod;
  const diff = (atkStr * atkTacticMult - defStr * defTacticMult) * 0.012;
  const gkAdj = (50 - gkStr) * 0.005;
  return Math.max(0.2, (base + diff + gkAdj) * redCardPenalty);
}

function poissonGoals(xg: number, rng: (o: number) => number, offset: number): number {
  const r = rng(offset);
  const p0 = Math.exp(-xg);
  const p1 = p0 * xg;
  const p2 = p1 * xg / 2;
  const p3 = p2 * xg / 3;
  if (r < p0) return 0;
  if (r < p0 + p1) return 1;
  if (r < p0 + p1 + p2) return 2;
  if (r < p0 + p1 + p2 + p3) return 3;
  return 4;
}

function findAssistant(scorerId: string, xi: Player[], rng: (o: number) => number, offset: number): Player | null {
  const candidates = xi.filter(p => p.id !== scorerId && p.position !== PlayerPosition.GK);
  if (candidates.length === 0) return null;
  if (rng(offset) < 0.15) return null; // 15% bez asysty
  const weights = candidates.map(p => p.attributes.passing + p.attributes.vision + p.attributes.crossing);
  const total = weights.reduce((s, w) => s + w, 0);
  let pick = rng(offset + 1) * total;
  for (let i = 0; i < candidates.length; i++) {
    pick -= weights[i];
    if (pick <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

function pickScorer(xi: Player[], rng: (o: number) => number, offset: number): Player {
  const weights = xi.map(p => {
    if (p.position === PlayerPosition.FWD) return p.attributes.finishing * 3 + p.attributes.attacking * 2;
    if (p.position === PlayerPosition.MID) return p.attributes.attacking + p.attributes.finishing;
    if (p.position === PlayerPosition.DEF) return p.attributes.attacking * 0.3;
    return 0.1;
  });
  const total = weights.reduce((s, w) => s + w, 0);
  let pick = rng(offset) * total;
  for (let i = 0; i < xi.length; i++) {
    pick -= weights[i];
    if (pick <= 0) return xi[i];
  }
  return xi[Math.floor(rng(offset + 1) * xi.length)];
}

function pickFouler(xi: Player[], rng: (o: number) => number, offset: number): Player {
  const weights = xi.map(p => p.attributes.aggression + 10);
  const total = weights.reduce((s, w) => s + w, 0);
  let pick = rng(offset) * total;
  for (let i = 0; i < xi.length; i++) {
    pick -= weights[i];
    if (pick <= 0) return xi[i];
  }
  return xi[Math.floor(rng(offset + 1) * xi.length)];
}

export interface ReserveMatchEngineResult {
  homeScore: number;
  awayScore: number;
  goals: MatchGoalEntry[];
  missedPenalties: MatchGoalEntry[];
  cards: MatchCardEntry[];
  substitutions: MatchSubstitutionEntry[];
  injuries: MatchInjuryEntry[];
  ratings: Record<string, number>;
  userStartingXI: string[];
  manOfTheMatch?: string;
  matchPlayers: ReserveMatchPlayerEntry[];
  updatedUserReserves: Player[];
}

export const ReserveMatchEngine = {
  simulate(
    userReserves: Player[],
    opponentPlayers: Player[],
    reserveCoach: Coach,
    opponentClubReputation: number,
    isHome: boolean,
    seed: number,
    currentDate: string
  ): ReserveMatchEngineResult {
    const rng = makeRng(seed);

    // Taktyki
    const userTacticKey = isHome
      ? reserveCoach.favoriteTactics.offensive
      : reserveCoach.favoriteTactics.neutral;
    const oppTacticId = opponentClubReputation >= 8 ? '4-3-3'
      : opponentClubReputation >= 6 ? '4-4-2'
      : opponentClubReputation >= 4 ? '4-2-3-1'
      : '5-3-2';

    // Ustal realny tacticId — mapuj z nazwy trenera (format: "4-4-2 Classic") na id taktyki
    const allTactics = TacticRepository.getAll();
    const resolveId = (name: string): string => {
      const found = allTactics.find(t => t.name === name || t.id === name);
      return found ? found.id : '4-4-2';
    };
    const userTacticId = resolveId(userTacticKey);

    // Profile taktyczne
    const userTacticProfile = TACTIC_PROFILES[userTacticId] ?? { atkMult: 1.0, defMult: 1.0 };
    const oppTacticProfile = TACTIC_PROFILES[oppTacticId] ?? { atkMult: 1.0, defMult: 1.0 };
    const hTacticProfile = isHome ? userTacticProfile : oppTacticProfile;
    const aTacticProfile = isHome ? oppTacticProfile : userTacticProfile;

    // Jakość terenu (losowa z seeda, stała dla meczu)
    const pitchRoll = rng(9999);
    const pitchMod = pitchRoll < 0.20 ? -0.10 : pitchRoll > 0.85 ? 0.05 : 0.0;

    // Składy
    const { xi: userXI, bench: userBench, juniors } = pickReserveLineup(userReserves, userTacticId, rng, seed);
    const { xi: oppXI, bench: oppBench } = pickOpponentLineup(opponentPlayers);

    let hXI = isHome ? [...userXI] : [...oppXI];
    let aXI = isHome ? [...oppXI] : [...userXI];
    const hBench = isHome ? [...userBench] : [...oppBench];
    const aBench = isHome ? [...oppBench] : [...userBench];
    const homeStartingIds = new Set(hXI.map(p => p.id));
    const awayStartingIds = new Set(aXI.map(p => p.id));
    const homePlayerIds = new Set(hXI.map(p => p.id));
    const awayPlayerIds = new Set(aXI.map(p => p.id));
    const playersById = new Map<string, Player>();
    [...userReserves, ...opponentPlayers, ...juniors].forEach(player => playersById.set(player.id, player));

    let hScore = 0;
    let aScore = 0;
    const goals: MatchGoalEntry[] = [];
    const cards: MatchCardEntry[] = [];
    const subs: MatchSubstitutionEntry[] = [];
    const injuries: MatchInjuryEntry[] = [];
    const ratingPoints: Record<string, number[]> = {};
    const yellowCounts: Record<string, number> = {};
    const missedPenalties: MatchGoalEntry[] = [];
    const yellowMinutes: Record<string, number> = {};
    const expelled = new Set<string>();
    const allPlayed = new Set<string>([...hXI.map(p => p.id), ...aXI.map(p => p.id)]);

    let hSubsUsed = 0;
    let aSubsUsed = 0;
    let hRedPenalty = 1.0;
    let aRedPenalty = 1.0;

    const userTeamId = isHome ? 'HOME' : 'AWAY';

    for (let min = 1; min <= 95; min++) {
      const offset = min * 100;

      // Siły
      const hStr = getTeamStrength(
        isHome ? [...userXI, ...userBench] : [...opponentPlayers],
        hXI
      );
      const aStr = getTeamStrength(
        isHome ? [...opponentPlayers] : [...userXI, ...userBench],
        aXI
      );

      // Zmiany (min 60, co 5 minut)
      const doSub = (
        xi: Player[],
        bench: Player[],
        used: number,
        side: 'H' | 'A'
      ): number => {
        if (used >= 3 || bench.length === 0) return used;
        const tired = xi.find(p => p.condition < 88);
        if (!tired) return used;
        const candidate = bench.find(b => b.position === tired.position);
        if (!candidate) return used;
        const idx = xi.indexOf(tired);
        xi[idx] = candidate;
        const removedIdx = bench.indexOf(candidate);
        bench.splice(removedIdx, 1);
        allPlayed.add(candidate.id);
        if (side === 'H') homePlayerIds.add(candidate.id);
        else awayPlayerIds.add(candidate.id);
        playersById.set(candidate.id, candidate);
        const teamId = side === 'H' ? 'HOME' : 'AWAY';
        subs.push({
          playerOutName: `${tired.firstName} ${tired.lastName}`,
          playerInName: `${candidate.firstName} ${candidate.lastName}`,
          minute: min,
          teamId,
          playerOutId: tired.id,
          playerInId: candidate.id,
        });
        return used + 1;
      };

      if (min >= 60 && min % 5 === 0) {
        hSubsUsed = doSub(hXI, hBench, hSubsUsed, 'H');
        aSubsUsed = doSub(aXI, aBench, aSubsUsed, 'A');
      }
      if (min === 45 && rng(offset + 77) < 0.3) {
        hSubsUsed = doSub(hXI, hBench, hSubsUsed, 'H');
      }

      // Zmęczenie
      for (const p of [...hXI, ...aXI]) {
        p.condition = Math.max(50, p.condition - (rng(offset + p.id.length) * 0.08 + 0.05));
      }

      // XG na minutę
      const hXg = calcXg(hStr.atk, aStr.def, aStr.gk, isHome, hRedPenalty, hTacticProfile.atkMult, aTacticProfile.defMult, pitchMod) / 90;
      const aXg = calcXg(aStr.atk, hStr.def, hStr.gk, !isHome, aRedPenalty, aTacticProfile.atkMult, hTacticProfile.defMult, pitchMod) / 90;

      // Gol domowy
      if (rng(offset + 1) < hXg) {
        const scorer = pickScorer(hXI, rng, offset + 2);
        const assistant = findAssistant(scorer.id, hXI, rng, offset + 3);
        const isPenalty = rng(offset + 4) < 0.08;
        if (isPenalty && rng(offset + 50) < 0.22) {
          missedPenalties.push({
            playerName: `${scorer.firstName} ${scorer.lastName}`,
            playerId: scorer.id,
            minute: min,
            teamId: 'HOME',
            isPenalty: true,
          });
        } else {
          hScore++;
          goals.push({
            playerName: `${scorer.firstName} ${scorer.lastName}`,
            playerId: scorer.id,
            minute: min,
            teamId: 'HOME',
            isPenalty,
            assistantName: isPenalty ? undefined : (assistant ? `${assistant.firstName} ${assistant.lastName}` : undefined),
            assistantId: isPenalty ? undefined : assistant?.id,
          });
        }
      }
      // Gol wyjazdowy
      if (rng(offset + 5) < aXg) {
        const scorer = pickScorer(aXI, rng, offset + 6);
        const assistant = findAssistant(scorer.id, aXI, rng, offset + 7);
        const isPenalty = rng(offset + 8) < 0.08;
        if (isPenalty && rng(offset + 55) < 0.22) {
          missedPenalties.push({
            playerName: `${scorer.firstName} ${scorer.lastName}`,
            playerId: scorer.id,
            minute: min,
            teamId: 'AWAY',
            isPenalty: true,
          });
        } else {
          aScore++;
          goals.push({
            playerName: `${scorer.firstName} ${scorer.lastName}`,
            playerId: scorer.id,
            minute: min,
            teamId: 'AWAY',
            isPenalty,
            assistantName: isPenalty ? undefined : (assistant ? `${assistant.firstName} ${assistant.lastName}` : undefined),
            assistantId: isPenalty ? undefined : assistant?.id,
          });
        }
      }

      // Faule i kartki (p~0.013/min home, ~0.013/min away)
      const cardChance = 0.00975;
      for (const [side, xi] of [['H', hXI], ['A', aXI]] as ['H' | 'A', Player[]][]) {
        if (rng(offset + (side === 'H' ? 10 : 11)) < cardChance) {
          const fouler = pickFouler(xi, rng, offset + (side === 'H' ? 12 : 13));
          if (expelled.has(fouler.id)) continue;
          const yellows = yellowCounts[fouler.id] || 0;
          const lastYellow = yellowMinutes[fouler.id] || 0;
          if (yellows >= 1 && min - lastYellow >= 15) {
            cards.push({ playerName: `${fouler.firstName} ${fouler.lastName}`, playerId: fouler.id, minute: min, teamId: side === 'H' ? 'HOME' : 'AWAY', type: 'SECOND_YELLOW' });
            expelled.add(fouler.id);
            const idx = xi.indexOf(fouler);
            if (idx !== -1) xi.splice(idx, 1);
            if (side === 'H') hRedPenalty *= 0.68; else aRedPenalty *= 0.68;
          } else if (yellows === 0) {
            yellowCounts[fouler.id] = 1;
            yellowMinutes[fouler.id] = min;
            cards.push({ playerName: `${fouler.firstName} ${fouler.lastName}`, playerId: fouler.id, minute: min, teamId: side === 'H' ? 'HOME' : 'AWAY', type: 'YELLOW' });
          }
        }
        // Czerwona bezpośrednia (rzadko)
        if (rng(offset + (side === 'H' ? 20 : 21)) < 0.0004) {
          const fouler = pickFouler(xi, rng, offset + 22);
          if (!expelled.has(fouler.id)) {
            cards.push({ playerName: `${fouler.firstName} ${fouler.lastName}`, playerId: fouler.id, minute: min, teamId: side === 'H' ? 'HOME' : 'AWAY', type: 'RED' });
            expelled.add(fouler.id);
            const idx = xi.indexOf(fouler);
            if (idx !== -1) xi.splice(idx, 1);
            if (side === 'H') hRedPenalty *= 0.68; else aRedPenalty *= 0.68;
          }
        }
      }

      // Kontuzje (tylko zawodnicy gracza, ~2% szansa/min na drużynę)
      const userXIRef = isHome ? hXI : aXI;
      if (userXIRef.length > 0 && rng(offset + 30) < 0.02) {
        const pIdx = Math.floor(rng(offset + 31) * userXIRef.length);
        const p = userXIRef[pIdx];
        const isSevere = rng(offset + 32) < 0.15;
        const days = isSevere
          ? 14 + Math.floor(rng(offset + 33) * 30)
          : 2 + Math.floor(rng(offset + 34) * 7);
        const severity = isSevere ? InjurySeverity.SEVERE : InjurySeverity.LIGHT;
        const injuryType = INJURY_TYPES[Math.floor(rng(offset + 35) * INJURY_TYPES.length)];
        injuries.push({
          playerName: `${p.firstName} ${p.lastName}`,
          playerId: p.id,
          minute: min,
          teamId: isHome ? 'HOME' : 'AWAY',
          severity,
          days,
          type: injuryType,
        });
        const idx = userXIRef.indexOf(p);
        if (idx !== -1) userXIRef.splice(idx, 1);
        const benchArr2 = isHome ? hBench : aBench;
        const injFallback: Record<PlayerPosition, PlayerPosition[]> = {
          [PlayerPosition.GK]:  [PlayerPosition.GK],
          [PlayerPosition.DEF]: [PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD],
          [PlayerPosition.MID]: [PlayerPosition.MID, PlayerPosition.DEF, PlayerPosition.FWD],
          [PlayerPosition.FWD]: [PlayerPosition.FWD, PlayerPosition.MID, PlayerPosition.DEF],
        };
        let sub: Player | undefined;
        for (const fallbackPos of injFallback[p.position]) {
          sub = benchArr2.find(b => b.position === fallbackPos);
          if (sub) break;
        }
        if (sub) {
          userXIRef.push(sub);
          benchArr2.splice(benchArr2.indexOf(sub), 1);
          allPlayed.add(sub.id);
          if (isHome) homePlayerIds.add(sub.id);
          else awayPlayerIds.add(sub.id);
          playersById.set(sub.id, sub);
          subs.push({
            playerOutName: `${p.firstName} ${p.lastName}`,
            playerInName: `${sub.firstName} ${sub.lastName}`,
            minute: min,
            teamId: isHome ? 'HOME' : 'AWAY',
            playerOutId: p.id,
            playerInId: sub.id,
          });
        }
      }
    }

    // Oblicz oceny dla zawodników gracza
    const userXIFinal = isHome ? hXI : aXI;
    const userWon = isHome ? hScore > aScore : aScore < hScore;
    const userDrew = hScore === aScore;

    for (const p of allPlayed) {
      const player = userReserves.find(r => r.id === p);
      if (!player) continue;

      const inXI = userXIFinal.some(x => x.id === p);
      const playerGoals = goals.filter(g => g.teamId === (isHome ? 'HOME' : 'AWAY') && g.playerId === p).length;
      const playerAssists = goals.filter(g => g.teamId === (isHome ? 'HOME' : 'AWAY') && g.assistantId === p).length;
      const playerCards = cards.filter(c => c.playerId === p).length;
      const gotInjured = injuries.some(i => i.playerId === p);

      let rating = 6.0;
      if (userWon) rating += 0.5;
      if (userDrew) rating += 0.1;
      rating += playerGoals * 1.2;
      rating += playerAssists * 0.7;
      rating -= playerCards * 0.8;
      if (gotInjured) rating -= 0.5;
      if (!inXI) rating -= 0.3; // zszedł w przerwie/był zmieniony

      ratingPoints[p] = [Math.min(10, Math.max(1, Math.round(rating * 10) / 10))];
    }

    // Flatten ocen
    const ratings: Record<string, number> = {};
    for (const [id, pts] of Object.entries(ratingPoints)) {
      ratings[id] = pts[0];
    }

    const calculateRating = (playerId: string, teamId: 'HOME' | 'AWAY', finalXI: Player[], won: boolean, drew: boolean): number => {
      const inXI = finalXI.some(x => x.id === playerId);
      const playerGoals = goals.filter(g => g.teamId === teamId && g.playerId === playerId).length;
      const playerAssists = goals.filter(g => g.teamId === teamId && g.assistantId === playerId).length;
      const playerCards = cards.filter(c => c.playerId === playerId).length;
      const gotInjured = injuries.some(i => i.playerId === playerId);

      let rating = 6.0;
      if (won) rating += 0.5;
      if (drew) rating += 0.1;
      rating += playerGoals * 1.2;
      rating += playerAssists * 0.7;
      rating -= playerCards * 0.8;
      if (gotInjured) rating -= 0.5;
      if (!inXI) rating -= 0.3;
      return Math.min(10, Math.max(1, Math.round(rating * 10) / 10));
    };

    homePlayerIds.forEach(id => {
      ratings[id] = calculateRating(id, 'HOME', hXI, hScore > aScore, hScore === aScore);
    });
    awayPlayerIds.forEach(id => {
      ratings[id] = calculateRating(id, 'AWAY', aXI, aScore > hScore, hScore === aScore);
    });

    // Man of the Match — najwyższa ocena w zwycięskiej lub remisowej drużynie
    const userScoredGoals = goals.filter(g => g.teamId === (isHome ? 'HOME' : 'AWAY'));
    let mom: string | undefined;
    if (userScoredGoals.length > 0) {
      const scorerCounts: Record<string, number> = {};
      for (const g of userScoredGoals) {
        if (g.playerId) scorerCounts[g.playerId] = (scorerCounts[g.playerId] || 0) + 1;
      }
      mom = Object.entries(scorerCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    }
    if (!mom) {
      const sorted = Object.entries(ratings).sort((a, b) => b[1] - a[1]);
      mom = sorted[0]?.[0];
    }

    const winningTeamId: 'HOME' | 'AWAY' | null = hScore > aScore ? 'HOME' : aScore > hScore ? 'AWAY' : null;
    const winningRatings = Object.entries(ratings).filter(([id]) =>
      !winningTeamId || (winningTeamId === 'HOME' ? homePlayerIds.has(id) : awayPlayerIds.has(id))
    );
    mom = winningRatings.sort((a, b) => b[1] - a[1])[0]?.[0] ?? mom;

    const buildMatchPlayer = (id: string, teamId: 'HOME' | 'AWAY'): ReserveMatchPlayerEntry | null => {
      const player = playersById.get(id);
      if (!player) return null;
      const starters = teamId === 'HOME' ? homeStartingIds : awayStartingIds;
      return {
        id,
        name: `${player.firstName} ${player.lastName}`,
        position: player.position,
        teamId,
        starter: starters.has(id),
        rating: ratings[id],
      };
    };

    const matchPlayers = [
      ...Array.from(homePlayerIds).map(id => buildMatchPlayer(id, 'HOME')),
      ...Array.from(awayPlayerIds).map(id => buildMatchPlayer(id, 'AWAY')),
    ].filter(Boolean) as ReserveMatchPlayerEntry[];

    // Aplikuj kontuzje na prawdziwych zawodnikach gracza
    const updatedUserReserves = userReserves.map(p => {
      const injury = injuries.find(i => i.playerId === p.id);
      if (!injury) return p;
      const conditionAtInjury = injury.days > 30
        ? 30 + Math.floor(Math.random() * 21)
        : 70;
      return {
        ...p,
        health: {
          status: HealthStatus.INJURED,
          injury: {
            type: injury.type,
            daysRemaining: injury.days,
            severity: injury.severity,
            injuryDate: currentDate,
            totalDays: injury.days,
            conditionAtInjury,
          },
        },
      };
    });

    return {
      homeScore: hScore,
      awayScore: aScore,
      goals,
      missedPenalties,
      cards,
      substitutions: subs,
      injuries,
      ratings,
      userStartingXI: userXI.map(p => p.id),
      manOfTheMatch: mom,
      matchPlayers,
      updatedUserReserves,
    };
  },
};
