import { Player, Coach, AiFriendlyPair, AiFriendlyMatchReport, PlayerPosition, HealthStatus, InjurySeverity } from '../types';
import { GoalAttributionService } from './GoalAttributionService';
import { rollInjuryBySeverity } from './InjuryCatalog';
import { TACTICS_DB } from '../resources/tactics_db';

const MAX_SUBS = 9;
const BASE_DRAIN = 0.12;
const GOAL_LAMBDA_BASE = 0.018;

interface SimLineup {
  starters: (string | null)[];
  bench: string[];
}

function seededRng(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function pickByAggression(players: Player[], activeXI: string[], expelledIds: Set<string>, rng: () => number): string | null {
  const candidates = players.filter(p => activeXI.includes(p.id) && !expelledIds.has(p.id));
  if (candidates.length === 0) return null;
  const weights = candidates.map(p => Math.max(1, p.attributes.aggression));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    if (r < weights[i]) return candidates[i].id;
    r -= weights[i];
  }
  return candidates[candidates.length - 1].id;
}

function getPositionStrength(p: Player, role: PlayerPosition): number {
  switch (role) {
    case PlayerPosition.GK: return p.attributes.goalkeeping;
    case PlayerPosition.DEF: return p.attributes.defending;
    case PlayerPosition.MID: return (p.attributes.passing + p.attributes.defending) / 2;
    case PlayerPosition.FWD: return (p.attributes.finishing + p.attributes.attacking) / 2;
    default: return p.attributes.defending;
  }
}

function pickTactic(coach: Coach | null, rngFn: () => number) {
  const fallback = TACTICS_DB.find(t => t.id === '4-4-2') ?? TACTICS_DB[0];
  if (!coach) return fallback;
  const keys = ['offensive', 'neutral', 'defensive'] as const;
  const key = keys[Math.floor(rngFn() * 3)];
  const tacticId = coach.favoriteTactics[key];
  return TACTICS_DB.find(t => t.id === tacticId) ?? fallback;
}

function buildLineupWithTactic(
  players: Player[],
  tactic: ReturnType<typeof pickTactic>,
  coachExp: number,
  rngFn: (offset: number) => number,
  seed: number
): SimLineup {
  const healthy = players.filter(p => p.health.status === HealthStatus.HEALTHY && p.suspensionMatches === 0);
  const usedIds = new Set<string>();
  const errorChance = 0.01 + (100 - coachExp) / 100 * 0.75;
  const starters: (string | null)[] = [];

  tactic.slots.forEach((slot, slotIdx) => {
    const isError = rngFn(seed + slotIdx * 17 + 1000) < errorChance;
    const available = healthy.filter(p => !usedIds.has(p.id));

    if (available.length === 0) {
      starters.push(null);
      return;
    }

    const isGKSlot = slot.role === PlayerPosition.GK;

    if (isError) {
      const errorPool = isGKSlot ? available : available.filter(p => p.position !== PlayerPosition.GK);
      const src = errorPool.length > 0 ? errorPool : available;
      const picked = src[Math.floor(rngFn(seed + slotIdx * 17 + 2000) * src.length)];
      starters.push(picked.id);
      usedIds.add(picked.id);
    } else {
      const candidates = available.filter(p => p.position === slot.role);
      const fallbackPool = isGKSlot ? available : available.filter(p => p.position !== PlayerPosition.GK);
      const pool = candidates.length > 0 ? candidates : (fallbackPool.length > 0 ? fallbackPool : available);
      pool.sort((a, b) => getPositionStrength(b, slot.role) - getPositionStrength(a, slot.role));
      starters.push(pool[0].id);
      usedIds.add(pool[0].id);
    }
  });

  while (starters.length < 11) starters.push(null);

  const remaining = healthy.filter(p => !usedIds.has(p.id));
  const bench: string[] = [];
  const benchedIds = new Set<string>();

  const addBench = (pos: PlayerPosition, count: number) => {
    let added = 0;
    for (const p of remaining) {
      if (added >= count) break;
      if (!benchedIds.has(p.id) && p.position === pos) {
        bench.push(p.id);
        benchedIds.add(p.id);
        added++;
      }
    }
  };

  addBench(PlayerPosition.GK, 1);
  addBench(PlayerPosition.DEF, 4);
  addBench(PlayerPosition.MID, 2);
  addBench(PlayerPosition.FWD, 2);

  for (const p of remaining) {
    if (bench.length >= MAX_SUBS) break;
    if (!benchedIds.has(p.id)) {
      bench.push(p.id);
      benchedIds.add(p.id);
    }
  }

  return { starters, bench };
}

function getCoachBonus(coach: Coach | null): { atk: number; def: number } {
  if (!coach) return { atk: 0, def: 0 };
  return {
    atk: coach.attributes.motivation * 0.15 + coach.attributes.experience * 0.1,
    def: coach.attributes.decisionMaking * 0.2,
  };
}

export const AiFriendlyMatchSimulator = {
  simulate(
    pair: AiFriendlyPair,
    homePlayers: Player[],
    awayPlayers: Player[],
    homeCoach: Coach | null,
    awayCoach: Coach | null,
    seed: number
  ): AiFriendlyMatchReport {

    const rng = (offset: number): number => seededRng(seed, offset);

    const hTactic = pickTactic(homeCoach, () => rng(seed + 1));
    const aTactic = pickTactic(awayCoach, () => rng(seed + 2));

    const hCoachExp = homeCoach?.attributes.experience ?? 50;
    const aCoachExp = awayCoach?.attributes.experience ?? 50;

    const hLineup = buildLineupWithTactic(homePlayers, hTactic, hCoachExp, rng, seed + 10);
    const aLineup = buildLineupWithTactic(awayPlayers, aTactic, aCoachExp, rng, seed + 20);

    const homeStartingXI = hLineup.starters.map(id => id ?? '');
    const awayStartingXI = aLineup.starters.map(id => id ?? '');

    const extraTime = Math.floor(rng(9999) * 10) + 1;
    const totalMinutes = 90 + extraTime;

    let homeScore = 0;
    let awayScore = 0;
    const scorers: AiFriendlyMatchReport['scorers'] = [];
    const cards: AiFriendlyMatchReport['cards'] = [];
    const injuries: AiFriendlyMatchReport['injuries'] = [];
    const substitutions: AiFriendlyMatchReport['substitutions'] = [];

    let hSubsUsed = 0;
    let aSubsUsed = 0;
    const substitutedInIds = new Set<string>();
    const substitutedOutIds = new Set<string>();
    const expelledIds = new Set<string>();
    const playerYellowCounts = new Map<string, number>();
    const lightInjuredOnPitch = new Map<string, number>();

    const allPlayedIds = new Set<string>([
      ...(hLineup.starters.filter(Boolean) as string[]),
      ...(aLineup.starters.filter(Boolean) as string[]),
    ]);

    const homeFatigue: Record<string, number> = {};
    const awayFatigue: Record<string, number> = {};
    homePlayers.forEach(p => { homeFatigue[p.id] = p.condition; });
    awayPlayers.forEach(p => { awayFatigue[p.id] = p.condition; });

    const allPlayers = [...homePlayers, ...awayPlayers];
    const pName = (id: string): string => {
      const p = allPlayers.find(x => x.id === id);
      return p ? `${p.firstName} ${p.lastName}` : id;
    };
    const sideTeamId = (side: 'H' | 'A'): string =>
      side === 'H' ? pair.homeTeamId : pair.awayTeamId;

    const findReplacement = (lineup: SimLineup, players: Player[], position: PlayerPosition): string | undefined => {
      const available = (id: string) => !substitutedOutIds.has(id) && !lineup.starters.includes(id);
      const getPos = (id: string) => players.find(p => p.id === id)?.position;

      const samePos = lineup.bench.find(id => available(id) && getPos(id) === position);
      if (samePos) return samePos;

      if (position === PlayerPosition.GK) {
        const anyGKLeft = players.some(p => p.position === PlayerPosition.GK && !expelledIds.has(p.id) && !substitutedOutIds.has(p.id) && !lineup.starters.includes(p.id));
        if (!anyGKLeft) return lineup.bench.find(id => available(id));
        return undefined;
      }
      if (position === PlayerPosition.DEF) {
        return lineup.bench.find(id => available(id) && getPos(id) === PlayerPosition.MID);
      }
      if (position === PlayerPosition.MID) {
        return lineup.bench.find(id => available(id) && (getPos(id) === PlayerPosition.DEF || getPos(id) === PlayerPosition.FWD));
      }
      if (position === PlayerPosition.FWD) {
        return lineup.bench.find(id => available(id) && getPos(id) === PlayerPosition.MID);
      }
      return undefined;
    };

    const performSub = (lineup: SimLineup, players: Player[], fMap: Record<string, number>, side: 'H' | 'A', minute: number) => {
      if ((side === 'H' ? hSubsUsed : aSubsUsed) >= MAX_SUBS) return;

      let worstIdx = -1;
      let worstFatigue = Infinity;
      lineup.starters.forEach((id, idx) => {
        if (!id || substitutedInIds.has(id)) return;
        const p = players.find(x => x.id === id);
        if (!p || p.position === PlayerPosition.GK) return;
        const f = fMap[id] ?? 100;
        if (f < worstFatigue) { worstFatigue = f; worstIdx = idx; }
      });

      if (worstIdx === -1 || worstFatigue >= 88) return;

      const outId = lineup.starters[worstIdx] as string;
      const pos = players.find(p => p.id === outId)?.position ?? PlayerPosition.MID;
      const inId = findReplacement(lineup, players, pos);
      if (!inId) return;

      lineup.starters[worstIdx] = inId;
      substitutedInIds.add(inId);
      substitutedOutIds.add(outId);
      allPlayedIds.add(inId);
      substitutions.push({
        playerOutId: outId, playerOutName: pName(outId),
        playerInId: inId, playerInName: pName(inId),
        teamId: sideTeamId(side), minute,
      });
      if (side === 'H') hSubsUsed++; else aSubsUsed++;
    };

    const getTeamPower = (players: Player[], lineup: SimLineup, fMap: Record<string, number>) => {
      const xi = players.filter(p => lineup.starters.includes(p.id));
      const sum = (attr: keyof Player['attributes']) =>
        xi.reduce((acc, p) => acc + p.attributes[attr] * ((fMap[p.id] || 100) / 100), 0);
      return { atk: sum('attacking'), def: sum('defending'), fin: sum('finishing'), gk: sum('goalkeeping') };
    };

    const hCoachBonus = getCoachBonus(homeCoach);
    const aCoachBonus = getCoachBonus(awayCoach);
    const hTacticAtkMult = hTactic.attackBias / 50;
    const hTacticDefMult = hTactic.defenseBias / 50;
    const aTacticAtkMult = aTactic.attackBias / 50;
    const aTacticDefMult = aTactic.defenseBias / 50;

    // ── GLOWNA PETLA MINUTOWA ──────────────────────────────────────────────────
    for (let minute = 1; minute <= totalMinutes; minute++) {

      const hActiveXI = hLineup.starters.filter(Boolean) as string[];
      const aActiveXI = aLineup.starters.filter(Boolean) as string[];

      // ZMIANY
      if (minute === 45) {
        for (let s = 0; s < 3; s++) {
          if (rng(minute + 45 + s * 7) < 0.75) performSub(hLineup, homePlayers, homeFatigue, 'H', minute);
          if (rng(minute + 55 + s * 7) < 0.75) performSub(aLineup, awayPlayers, awayFatigue, 'A', minute);
        }
      }
      if (minute === 60 || minute === 70 || minute === 80) {
        if (rng(minute + 11) < 0.80) performSub(hLineup, homePlayers, homeFatigue, 'H', minute);
        if (rng(minute + 22) < 0.80) performSub(hLineup, homePlayers, homeFatigue, 'H', minute);
        if (rng(minute + 33) < 0.80) performSub(aLineup, awayPlayers, awayFatigue, 'A', minute);
        if (rng(minute + 44) < 0.80) performSub(aLineup, awayPlayers, awayFatigue, 'A', minute);
      }
      if (minute >= 88) {
        performSub(hLineup, homePlayers, homeFatigue, 'H', minute);
        performSub(aLineup, awayPlayers, awayFatigue, 'A', minute);
      }

      // SILA ZESPOLOW
      const hPwr = getTeamPower(homePlayers, hLineup, homeFatigue);
      const aPwr = getTeamPower(awayPlayers, aLineup, awayFatigue);

      // BRAMKI
      const hSatiety = 1 / (1 + homeScore * 0.31);
      const aSatiety = 1 / (1 + awayScore * 0.31);
      const homeBonus = 1.005;

      const hLambda = (((hPwr.atk + hCoachBonus.atk) * hTacticAtkMult * 0.4 + hPwr.fin * 0.6) / Math.max(1, (aPwr.def + aCoachBonus.def) * aTacticDefMult + aPwr.gk)) * GOAL_LAMBDA_BASE * hSatiety * homeBonus;
      const aLambda = (((aPwr.atk + aCoachBonus.atk) * aTacticAtkMult * 0.4 + aPwr.fin * 0.6) / Math.max(1, (hPwr.def + hCoachBonus.def) * hTacticDefMult + hPwr.gk)) * GOAL_LAMBDA_BASE * aSatiety;

      if (rng(minute + 100) < hLambda && hActiveXI.length > 0) {
        const scorer = GoalAttributionService.pickScorer(homePlayers, hActiveXI, false, () => rng(minute + 500));
        if (scorer) {
          const assistant = GoalAttributionService.pickAssistant(homePlayers, hActiveXI, scorer.id, false, () => rng(minute + 501));
          homeScore++;
          scorers.push({ playerId: scorer.id, playerName: pName(scorer.id), teamId: pair.homeTeamId, assistId: assistant?.id, assistName: assistant ? pName(assistant.id) : undefined, minute, isPenalty: false });
        }
      }

      if (rng(minute + 200) < aLambda && aActiveXI.length > 0) {
        const scorer = GoalAttributionService.pickScorer(awayPlayers, aActiveXI, false, () => rng(minute + 600));
        if (scorer) {
          const assistant = GoalAttributionService.pickAssistant(awayPlayers, aActiveXI, scorer.id, false, () => rng(minute + 601));
          awayScore++;
          scorers.push({ playerId: scorer.id, playerName: pName(scorer.id), teamId: pair.awayTeamId, assistId: assistant?.id, assistName: assistant ? pName(assistant.id) : undefined, minute, isPenalty: false });
        }
      }

      // KARNE
      if (rng(minute + 700) < 0.003) {
        const side = rng(minute + 701) < 0.5 ? 'H' : 'A';
        const isScored = rng(minute + 702) < 0.78;
        const sideXI = side === 'H' ? hActiveXI : aActiveXI;
        const sidePlayers = side === 'H' ? homePlayers : awayPlayers;
        const kicker = GoalAttributionService.pickScorer(sidePlayers, sideXI, false, () => rng(minute + 703));
        if (kicker) {
          if (isScored) { if (side === 'H') homeScore++; else awayScore++; }
          scorers.push({ playerId: kicker.id, playerName: pName(kicker.id), teamId: sideTeamId(side), minute, isPenalty: true, isMiss: !isScored });
        }
      }

      // ZOLTA KARTKA — zdarzenie 0.1 per minuta, zawodnik wybierany wg aggression
      if (rng(minute + 300) < 0.017) {
        const side = rng(minute + 301) < 0.5 ? 'H' : 'A';
        const activeXI = side === 'H' ? hActiveXI : aActiveXI;
        const sPlayers = side === 'H' ? homePlayers : awayPlayers;
        const lineup = side === 'H' ? hLineup : aLineup;
        const pId = pickByAggression(sPlayers, activeXI, expelledIds, () => rng(minute + 302));
        if (pId) {
          const yellows = (playerYellowCounts.get(pId) || 0) + 1;
          if (yellows >= 2) {
            cards.push({ playerId: pId, playerName: pName(pId), teamId: sideTeamId(side), type: 'RED_CARD', minute });
            expelledIds.add(pId);
            lineup.starters = lineup.starters.map(id => id === pId ? null : id);
          } else {
            playerYellowCounts.set(pId, yellows);
            cards.push({ playerId: pId, playerName: pName(pId), teamId: sideTeamId(side), type: 'YELLOW_CARD', minute });
          }
        }
      }

      // BEZPOSREDNIA CZERWONA — zdarzenie 0.05 per minuta, zawodnik wybierany wg aggression
      if (rng(minute + 400) < 0.001) {
        const side = rng(minute + 401) < 0.5 ? 'H' : 'A';
        const activeXI = side === 'H' ? hActiveXI : aActiveXI;
        const sPlayers = side === 'H' ? homePlayers : awayPlayers;
        const lineup = side === 'H' ? hLineup : aLineup;
        const pId = pickByAggression(sPlayers, activeXI, expelledIds, () => rng(minute + 402));
        if (pId) {
          cards.push({ playerId: pId, playerName: pName(pId), teamId: sideTeamId(side), type: 'RED_CARD', minute });
          expelledIds.add(pId);
          lineup.starters = lineup.starters.map(id => id === pId ? null : id);
        }
      }

      // KONTUZJE — per zawodnik per mecz: lekka 0.01, ciezka 0.001
      const lightProbPerMin = 0.01 / totalMinutes;
      const severeProbPerMin = 0.001 / totalMinutes;
      const allOnPitch: { id: string; side: 'H' | 'A' }[] = [
        ...hActiveXI.map(id => ({ id, side: 'H' as const })),
        ...aActiveXI.map(id => ({ id, side: 'A' as const })),
      ];

      allOnPitch.forEach(({ id, side }, pIdx) => {
        if (injuries.some(inj => inj.playerId === id)) return;
        const fMap = side === 'H' ? homeFatigue : awayFatigue;
        const lineup = side === 'H' ? hLineup : aLineup;
        const sPlayers = side === 'H' ? homePlayers : awayPlayers;

        const rollSevere = rng(minute + 800 + pIdx * 13);
        const rollLight = rng(minute + 900 + pIdx * 13);

        const severity = rollSevere < severeProbPerMin
          ? InjurySeverity.SEVERE
          : rollLight < lightProbPerMin
            ? InjurySeverity.LIGHT
            : null;

        if (!severity) return;

        let injOff = 950 + pIdx * 7;
        const { days, type } = rollInjuryBySeverity(severity, () => rng(minute + injOff++));
        injuries.push({ playerId: id, playerName: pName(id), teamId: sideTeamId(side), severity, minute, days, type });
        fMap[id] = Math.max(0, (fMap[id] || 100) - (severity === InjurySeverity.SEVERE ? 55 : 20));

        if (severity === InjurySeverity.SEVERE) {
          const usedCount = side === 'H' ? hSubsUsed : aSubsUsed;
          if (usedCount < MAX_SUBS) {
            const pIdxInLineup = lineup.starters.indexOf(id);
            if (pIdxInLineup !== -1) {
              const pos = sPlayers.find(p => p.id === id)?.position ?? PlayerPosition.MID;
              const candidate = findReplacement(lineup, sPlayers, pos);
              if (candidate) {
                lineup.starters[pIdxInLineup] = candidate;
                substitutedInIds.add(candidate);
                substitutedOutIds.add(id);
                allPlayedIds.add(candidate);
                substitutions.push({ playerOutId: id, playerOutName: pName(id), playerInId: candidate, playerInName: pName(candidate), teamId: sideTeamId(side), minute });
                if (side === 'H') hSubsUsed++; else aSubsUsed++;
              } else {
                lineup.starters[pIdxInLineup] = null;
              }
            }
          }
        } else {
          lightInjuredOnPitch.set(id, 0.30);
        }
      });

      // DRENAZ KONDYCJI
      hLineup.starters.forEach(id => {
        if (!id) return;
        const p = homePlayers.find(x => x.id === id);
        let drain = BASE_DRAIN;
        if (p?.position === PlayerPosition.GK) drain *= 0.5;
        if (lightInjuredOnPitch.has(id)) drain += lightInjuredOnPitch.get(id)!;
        homeFatigue[id] = Math.max(0, (homeFatigue[id] || 100) - drain);
      });
      aLineup.starters.forEach(id => {
        if (!id) return;
        const p = awayPlayers.find(x => x.id === id);
        let drain = BASE_DRAIN;
        if (p?.position === PlayerPosition.GK) drain *= 0.5;
        if (lightInjuredOnPitch.has(id)) drain += lightInjuredOnPitch.get(id)!;
        awayFatigue[id] = Math.max(0, (awayFatigue[id] || 100) - drain);
      });
    }

    // OCENY
    const ratings: Record<string, number> = {};
    const homeWin = homeScore > awayScore;
    const awayWin = awayScore > homeScore;
    const isDraw = homeScore === awayScore;

    allPlayedIds.forEach(pId => {
      const isHome = homePlayers.some(p => p.id === pId);
      const players = isHome ? homePlayers : awayPlayers;
      const p = players.find(x => x.id === pId);
      if (!p) return;

      const teamWon = isHome ? homeWin : awayWin;
      const r = rng(pId.length + 90 + 999);
      let score = teamWon ? (6.2 + r * 1.5) : (isDraw ? (5.2 + r * 1.5) : (4.0 + r * 1.8));

      const pGoals = scorers.filter(s => s.playerId === pId && !s.isMiss).length;
      const pAssists = scorers.filter(s => s.assistId === pId).length;
      score += pGoals * 1.0 + pAssists * 0.6;

      const conceded = isHome ? awayScore : homeScore;
      if (p.position === PlayerPosition.GK || p.position === PlayerPosition.DEF) {
        if (conceded === 0) score += 1.2;
        else score -= conceded * 0.3;
      }

      cards.filter(c => c.playerId === pId).forEach(c => {
        score -= c.type === 'RED_CARD' ? 3.0 : 0.5;
      });

      ratings[pId] = parseFloat(Math.min(10, Math.max(1, score)).toFixed(1));
    });

    return { pairId: pair.id, homeTeamId: pair.homeTeamId, awayTeamId: pair.awayTeamId, date: pair.date, homeScore, awayScore, scorers, cards, injuries, substitutions, ratings, extraTime, homeTacticId: hTactic.id, awayTacticId: aTactic.id, homeStartingXI, awayStartingXI };
  },
};
