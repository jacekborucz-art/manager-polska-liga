import { Player, AiFriendlyPair, AiFriendlyMatchReport, PlayerPosition, HealthStatus, InjurySeverity } from '../types';
import { GoalAttributionService } from './GoalAttributionService';
import { rollInjuryBySeverity } from './InjuryCatalog';

const MAX_SUBS = 9;
const BASE_DRAIN = 0.22;
const GOAL_LAMBDA_BASE = 0.018;

interface SimLineup {
  starters: (string | null)[];
  bench: string[];
}

function seededRng(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function buildLineup(players: Player[], seed: number): SimLineup {
  const healthy = players.filter(p => p.health.status === HealthStatus.HEALTHY && p.suspensionMatches === 0);
  const gks = healthy.filter(p => p.position === PlayerPosition.GK);
  const outfield = healthy.filter(p => p.position !== PlayerPosition.GK);

  const shuffleArr = <T>(arr: T[], s: number): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(seededRng(s, i * 77) * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const shuffledGK = shuffleArr(gks, seed);
  const shuffledOut = shuffleArr(outfield, seed + 1);

  const gk = shuffledGK[0] || shuffledOut[0];
  const remaining = shuffledOut.filter(p => p.id !== gk?.id);

  const starters: (string | null)[] = [
    gk?.id ?? null,
    ...remaining.slice(0, 10).map(p => p.id),
  ];
  while (starters.length < 11) starters.push(null);

  const bench = remaining.slice(10, 10 + MAX_SUBS).map(p => p.id);

  return { starters, bench };
}

export const AiFriendlyMatchSimulator = {
  simulate(
    pair: AiFriendlyPair,
    homePlayers: Player[],
    awayPlayers: Player[],
    seed: number
  ): AiFriendlyMatchReport {

    const rng = (offset: number): number => seededRng(seed, offset);

    const hLineup = buildLineup(homePlayers, seed + 10);
    const aLineup = buildLineup(awayPlayers, seed + 20);

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
      return lineup.bench.find(id => available(id) && players.find(p => p.id === id)?.position === position)
        ?? lineup.bench.find(id => available(id) && players.find(p => p.id === id)?.position !== PlayerPosition.GK);
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

      const hLambda = ((hPwr.atk * 0.4 + hPwr.fin * 0.6) / Math.max(1, aPwr.def + aPwr.gk)) * GOAL_LAMBDA_BASE * hSatiety * homeBonus;
      const aLambda = ((aPwr.atk * 0.4 + aPwr.fin * 0.6) / Math.max(1, hPwr.def + hPwr.gk)) * GOAL_LAMBDA_BASE * aSatiety;

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

      // KARTKI
      const yellowProb = 0.0012;
      const processCard = (side: 'H' | 'A', activeXI: string[], roll: number) => {
        if (roll >= yellowProb || activeXI.length === 0) return;
        const pId = activeXI[Math.floor(rng(minute + 333) * activeXI.length)];
        if (!pId || expelledIds.has(pId)) return;

        const yellows = (playerYellowCounts.get(pId) || 0) + 1;
        const isDirectRed = rng(minute + 334) < 0.001;
        const lineup = side === 'H' ? hLineup : aLineup;

        if (isDirectRed || yellows >= 2) {
          cards.push({ playerId: pId, playerName: pName(pId), teamId: sideTeamId(side), type: 'RED_CARD', minute });
          expelledIds.add(pId);
          lineup.starters = lineup.starters.map(id => id === pId ? null : id);
        } else {
          playerYellowCounts.set(pId, yellows);
          cards.push({ playerId: pId, playerName: pName(pId), teamId: sideTeamId(side), type: 'YELLOW_CARD', minute });
        }
      };

      processCard('H', hActiveXI, rng(minute + 300));
      processCard('A', aActiveXI, rng(minute + 400));

      // KONTUZJE
      if (rng(minute + 800) < 0.004) {
        const side = rng(minute + 801) < 0.5 ? 'H' : 'A';
        const lineup = side === 'H' ? hLineup : aLineup;
        const sPlayers = side === 'H' ? homePlayers : awayPlayers;
        const fMap = side === 'H' ? homeFatigue : awayFatigue;
        const activeXI = side === 'H' ? hActiveXI : aActiveXI;
        if (activeXI.length === 0) continue;

        const pId = activeXI[Math.floor(rng(minute + 802) * activeXI.length)];
        if (!pId) continue;

        const severity = rng(minute + 803) < 0.84 ? InjurySeverity.LIGHT : InjurySeverity.SEVERE;
        let injOff = 808;
        const { days, type } = rollInjuryBySeverity(severity, () => rng(minute + injOff++));

        injuries.push({ playerId: pId, playerName: pName(pId), teamId: sideTeamId(side), severity, minute, days, type });

        const penalty = severity === InjurySeverity.SEVERE ? 55 : 20;
        if (fMap[pId] !== undefined) fMap[pId] = Math.max(0, fMap[pId] - penalty);

        if (severity === InjurySeverity.SEVERE) {
          const usedCount = side === 'H' ? hSubsUsed : aSubsUsed;
          if (usedCount < MAX_SUBS) {
            const pIdx = lineup.starters.indexOf(pId);
            if (pIdx !== -1) {
              const pos = sPlayers.find(p => p.id === pId)?.position ?? PlayerPosition.MID;
              const candidate = findReplacement(lineup, sPlayers, pos);
              if (candidate) {
                lineup.starters[pIdx] = candidate;
                substitutedInIds.add(candidate);
                substitutedOutIds.add(pId);
                allPlayedIds.add(candidate);
                substitutions.push({ playerOutId: pId, playerOutName: pName(pId), playerInId: candidate, playerInName: pName(candidate), teamId: sideTeamId(side), minute });
                if (side === 'H') hSubsUsed++; else aSubsUsed++;
              } else {
                lineup.starters[pIdx] = null;
              }
            }
          }
        } else {
          lightInjuredOnPitch.set(pId, 0.30);
        }
      }

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

    return { pairId: pair.id, homeTeamId: pair.homeTeamId, awayTeamId: pair.awayTeamId, date: pair.date, homeScore, awayScore, scorers, cards, injuries, substitutions, ratings, extraTime };
  },
};
