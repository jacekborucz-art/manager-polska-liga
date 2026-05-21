import { MatchLiveState, MatchContext, Player, PlayerPosition, Lineup, SubstitutionRecord, InjurySeverity, Coach } from '../types';
import { TacticRepository } from '../resources/tactics_db';
import { LineupService } from './LineupService';

const MAX_LEAGUE_SUBS = 5;

const DEFENSIVE_TACTICS = ['5-4-1', '4-4-2-DEF', '5-3-2', '6-3-1', '5-2-1-2', '4-5-1'];
const SOLID_DEFENSIVE_TACTICS = ['4-4-2-DEF', '5-3-2', '4-5-1', '5-2-1-2'];
const OFFENSIVE_TACTICS = ['3-4-3', '4-4-2-OFF', '4-3-3', '4-2-4', '3-5-2', '4-3-2-1', '3-4-2-1', '4-3-3-F9'];

type AiLateMatchContext = {
  aiStakes?: 'TITLE_RACE' | 'EUROPE_RACE' | 'RELEGATION_FIGHT' | 'MID_TABLE' | 'LOW_STAKES';
  userStakes?: 'TITLE_RACE' | 'EUROPE_RACE' | 'RELEGATION_FIGHT' | 'MID_TABLE' | 'LOW_STAKES';
  aiRank?: number;
  userRank?: number;
  isLateSeason?: boolean;
  rivalryMultiplier?: number;
};

type AiDecisionResult = {
  newLineup?: Lineup;
  newSubsCount?: number;
  subRecord?: SubstitutionRecord;
  newTacticId?: string;
  lastAiActionMinute?: number;
  lastAiSubMinute?: number;
  lastAiFormationMinute?: number;
  aiTacticLocked?: boolean;
  aiTacticLockUntilMinute?: number;
  logs: string[];
};

const getCoachQuality = (coach: Coach | null | undefined): number => {
  if (!coach) return 50;
  return (coach.attributes.experience * 0.48) + (coach.attributes.decisionMaking * 0.52);
};

const getStakesWeight = (stakes?: AiLateMatchContext['aiStakes']): number => {
  if (stakes === 'TITLE_RACE') return 1.0;
  if (stakes === 'RELEGATION_FIGHT') return 1.15;
  if (stakes === 'EUROPE_RACE') return 0.78;
  if (stakes === 'LOW_STAKES') return 0.16;
  return 0.42;
};

const getPlayer = (players: Player[], id: string | null): Player | null => {
  if (!id) return null;
  return players.find(p => p.id === id) ?? null;
};

const getEmergencyFieldScore = (player: Player, role: PlayerPosition): number => {
  if (player.position !== PlayerPosition.GK) return LineupService.calculateFitScore(player, role);
  if (role === PlayerPosition.GK) return LineupService.calculateFitScore(player, role);
  return player.overallRating * 0.35 + player.attributes.positioning * 0.25 + player.attributes.strength * 0.2 + player.attributes.mentality * 0.2;
};

const getLineupFitScore = (lineupIds: (string | null)[], tacticId: string, players: Player[]): number => {
  const tactic = TacticRepository.getById(tacticId);
  return tactic.slots.reduce((sum, slot) => {
    const player = getPlayer(players, lineupIds[slot.index]);
    if (!player) return sum - 750;
    return sum + getEmergencyFieldScore(player, slot.role);
  }, 0);
};

const pickBestFieldPlayerForGoal = (lineup: Lineup, players: Player[]): { player: Player; index: number } | null => {
  const candidates = lineup.startingXI
    .map((id, index) => ({ id, index, player: getPlayer(players, id) }))
    .filter((entry): entry is { id: string; index: number; player: Player } => entry.index !== 0 && !!entry.player)
    .sort((a, b) => {
      const scoreA = a.player.attributes.positioning + a.player.attributes.strength + a.player.attributes.mentality * 0.6;
      const scoreB = b.player.attributes.positioning + b.player.attributes.strength + b.player.attributes.mentality * 0.6;
      return scoreB - scoreA;
    });
  return candidates.length > 0 ? { player: candidates[0].player, index: candidates[0].index } : null;
};

const getAvailableBench = (lineup: Lineup, players: Player[], subsHistory: SubstitutionRecord[]): Player[] => {
  const outIds = new Set(subsHistory.map(s => s.playerOutId));
  const inIds = new Set(subsHistory.map(s => s.playerInId));
  return lineup.bench
    .map(id => players.find(p => p.id === id))
    .filter((p): p is Player => !!p && !outIds.has(p.id) && !inIds.has(p.id));
};

const buildDirectSubLineup = (lineup: Lineup, injuredId: string, sub: Player, slotIdx: number): Lineup => {
  const nextLineup = {
    ...lineup,
    startingXI: [...lineup.startingXI],
    bench: lineup.bench.filter(id => id !== sub.id && id !== injuredId),
    reserves: [...lineup.reserves]
  };

  nextLineup.startingXI[slotIdx] = sub.id;
  if (!nextLineup.reserves.includes(injuredId)) nextLineup.reserves.push(injuredId);
  return nextLineup;
};

const chooseNoBenchGoalkeeperResponse = (
  lineup: Lineup,
  players: Player[],
  injuredGoalkeeperId: string,
  subsHistory: SubstitutionRecord[]
): { lineup: Lineup; sub: Player; fieldCover: Player } | null => {
  const fieldCover = pickBestFieldPlayerForGoal(lineup, players);
  if (!fieldCover) return null;

  const tactic = TacticRepository.getById(lineup.tacticId);
  const fieldRole = tactic.slots[fieldCover.index]?.role ?? PlayerPosition.MID;
  const benchPool = getAvailableBench(lineup, players, subsHistory).filter(p => p.position !== PlayerPosition.GK);
  if (benchPool.length === 0) return null;

  const bestFieldSub = [...benchPool].sort((a, b) => getEmergencyFieldScore(b, fieldRole) - getEmergencyFieldScore(a, fieldRole))[0];
  if (!bestFieldSub) return null;

  const nextLineup: Lineup = {
    ...lineup,
    startingXI: [...lineup.startingXI],
    bench: lineup.bench.filter(id => id !== bestFieldSub.id && id !== injuredGoalkeeperId),
    reserves: lineup.reserves.includes(injuredGoalkeeperId) ? [...lineup.reserves] : [...lineup.reserves, injuredGoalkeeperId]
  };

  nextLineup.startingXI[0] = fieldCover.player.id;
  nextLineup.startingXI[fieldCover.index] = bestFieldSub.id;
  return { lineup: nextLineup, sub: bestFieldSub, fieldCover: fieldCover.player };
};

const assignPlayersToTactic = (candidateIds: string[], tacticId: string, players: Player[]): (string | null)[] | null => {
  const tactic = TacticRepository.getById(tacticId);
  const remaining = new Set(candidateIds);
  const lineup: (string | null)[] = new Array(11).fill(null);

  for (const slot of tactic.slots) {
    const pool = Array.from(remaining)
      .map(id => players.find(p => p.id === id))
      .filter((p): p is Player => !!p);

    if (pool.length === 0) return null;

    const samePosition = pool.filter(p => p.position === slot.role);
    const selectable = samePosition.length > 0
      ? samePosition
      : slot.role === PlayerPosition.GK
        ? pool.filter(p => p.position !== PlayerPosition.GK)
        : pool.filter(p => p.position !== PlayerPosition.GK);

    const fallback = selectable.length > 0 ? selectable : pool;
    const selected = [...fallback].sort((a, b) => getEmergencyFieldScore(b, slot.role) - getEmergencyFieldScore(a, slot.role))[0];
    if (!selected) return null;

    lineup[slot.index] = selected.id;
    remaining.delete(selected.id);
  }

  return lineup;
};

const chooseInjuryResponse = (
  lineup: Lineup,
  players: Player[],
  injuredId: string,
  slotIdx: number,
  scoreDiff: number,
  coachQuality: number,
  subsHistory: SubstitutionRecord[],
  canChangeTactic: boolean
): { lineup: Lineup; sub: Player; newTacticId?: string; note: string } | null => {
  const currentTactic = TacticRepository.getById(lineup.tacticId);
  const requiredRole = currentTactic.slots[slotIdx]?.role ?? PlayerPosition.MID;
  const benchPool = getAvailableBench(lineup, players, subsHistory);
  if (benchPool.length === 0) return null;

  const rolePool = requiredRole === PlayerPosition.GK
    ? benchPool.filter(p => p.position === PlayerPosition.GK)
    : benchPool.filter(p => p.position !== PlayerPosition.GK);
  const emergencyPool = rolePool.length > 0 ? rolePool : benchPool;
  const directSub = [...emergencyPool].sort((a, b) => getEmergencyFieldScore(b, requiredRole) - getEmergencyFieldScore(a, requiredRole))[0];
  if (!directSub) return null;

  const directLineup = buildDirectSubLineup(lineup, injuredId, directSub, slotIdx);
  let bestResponse = {
    lineup: directLineup,
    sub: directSub,
    score: getLineupFitScore(directLineup.startingXI, directLineup.tacticId, players),
    note: directSub.position === PlayerPosition.GK && requiredRole !== PlayerPosition.GK
      ? 'awaryjnie bramkarz wchodzi w pole'
      : 'zmiana po pozycji'
  };

  if (canChangeTactic && requiredRole !== PlayerPosition.GK) {
    const tacticalPool = scoreDiff < 0 ? [...OFFENSIVE_TACTICS, ...SOLID_DEFENSIVE_TACTICS] : [...SOLID_DEFENSIVE_TACTICS, ...OFFENSIVE_TACTICS];
    const tacticIds = Array.from(new Set(tacticalPool)).filter(id => id !== lineup.tacticId);
    const activeIds = lineup.startingXI.filter((id): id is string => !!id && id !== injuredId);

    for (const tacticId of tacticIds) {
      for (const sub of benchPool) {
        const assignedXI = assignPlayersToTactic([...activeIds, sub.id], tacticId, players);
        if (!assignedXI) continue;
        const tacticLineup: Lineup = {
          ...lineup,
          tacticId,
          startingXI: assignedXI,
          bench: lineup.bench.filter(id => id !== sub.id && id !== injuredId),
          reserves: lineup.reserves.includes(injuredId) ? lineup.reserves : [...lineup.reserves, injuredId]
        };
        const score = getLineupFitScore(assignedXI, tacticId, players);
        if (score > bestResponse.score) {
          bestResponse = { lineup: tacticLineup, sub, score, note: `zmiana ustawienia na ${tacticId}` };
        }
      }
    }
  }

  const directScore = getLineupFitScore(directLineup.startingXI, directLineup.tacticId, players);
  const requiredGain = Math.max(2.5, 8 - coachQuality * 0.06);
  if (bestResponse.lineup.tacticId !== lineup.tacticId && bestResponse.score < directScore + requiredGain) {
    return { lineup: directLineup, sub: directSub, note: directSub.position === PlayerPosition.GK && requiredRole !== PlayerPosition.GK ? 'awaryjnie bramkarz wchodzi w pole' : 'zmiana po pozycji' };
  }

  return {
    lineup: bestResponse.lineup,
    sub: bestResponse.sub,
    newTacticId: bestResponse.lineup.tacticId !== lineup.tacticId ? bestResponse.lineup.tacticId : undefined,
    note: bestResponse.note
  };
};

const getLightInjuryUrgency = (
  player: Player,
  fatigue: number,
  minute: number,
  subsRemaining: number,
  scoreDiff: number
): number => {
  const conditionPressure = Math.max(0, 100 - fatigue) * 0.95;
  const matchPhasePressure = minute < 35 ? 0 : Math.min(18, (minute - 35) * 0.45);
  const playerResistance = Math.max(0, player.attributes.mentality - 50) * 0.28;
  const physicalBuffer = ((player.attributes.stamina || 50) + (player.attributes.strength || 50)) * 0.08;
  const subsPressure = subsRemaining <= 1 && fatigue > 52 ? -14 : 0;
  const chasingGameBonus = scoreDiff < 0 && player.position !== PlayerPosition.GK ? 6 : 0;

  return 30 + conditionPressure + matchPhasePressure + chasingGameBonus + subsPressure - playerResistance - physicalBuffer;
};

const shouldTryLightInjurySub = (
  urgency: number,
  player: Player,
  fatigue: number,
  coachQuality: number,
  isPriority: boolean,
  isHalftime: boolean
): boolean => {
  if (fatigue < 42) return true;
  const threshold = (isPriority || isHalftime ? 70 : 82) - coachQuality * 0.32;
  if (urgency >= threshold) return true;

  let chance = (urgency - threshold + 22) / 48;
  chance += (coachQuality - 50) / 180;
  if (fatigue < 58) chance += 0.22;
  if (player.attributes.mentality > 74 && fatigue > 55) chance -= 0.16;

  return Math.random() < Math.max(0.04, Math.min(0.92, chance));
};

type HalftimeStatus = 'PROTECT_RESULT' | 'CONTROL_GAME' | 'CHASE_EXPECTED_RESULT' | 'CHASE_UNDERDOG' | 'NEUTRAL';

const getLineupAverageRating = (lineupIds: (string | null)[], players: Player[]): number => {
  const activePlayers = lineupIds
    .map(id => getPlayer(players, id))
    .filter((p): p is Player => !!p);

  if (activePlayers.length === 0) return 60;
  return activePlayers.reduce((sum, player) => sum + player.overallRating, 0) / activePlayers.length;
};

const assessHalftimeStatus = (
  myLineup: Lineup,
  oppLineup: Lineup,
  myPlayers: Player[],
  oppPlayers: Player[],
  scoreDiff: number
): { status: HalftimeStatus; strengthDiff: number } => {
  const myXiStrength = getLineupAverageRating(myLineup.startingXI, myPlayers);
  const oppXiStrength = getLineupAverageRating(oppLineup.startingXI, oppPlayers);
  const strengthDiff = myXiStrength - oppXiStrength;
  const isClearFavorite = strengthDiff >= 3.5;
  const isClearUnderdog = strengthDiff <= -3.5;

  if (isClearUnderdog && scoreDiff >= 0) return { status: 'PROTECT_RESULT', strengthDiff };
  if (isClearFavorite && scoreDiff <= 0) return { status: 'CHASE_EXPECTED_RESULT', strengthDiff };
  if (scoreDiff > 0) return { status: 'CONTROL_GAME', strengthDiff };
  if (scoreDiff < 0) return { status: isClearUnderdog ? 'CHASE_UNDERDOG' : 'CHASE_EXPECTED_RESULT', strengthDiff };
  return { status: 'NEUTRAL', strengthDiff };
};

const getHalftimeReactionChance = (status: HalftimeStatus, coachQuality: number, scoreDiff: number): number => {
  const coachBonus = (coachQuality - 50) * 0.006;
  switch (status) {
    case 'CHASE_EXPECTED_RESULT':
      return Math.max(0.55, Math.min(0.98, 0.78 + coachBonus + Math.abs(Math.min(0, scoreDiff)) * 0.06));
    case 'PROTECT_RESULT':
      return Math.max(0.45, Math.min(0.94, 0.68 + coachBonus));
    case 'CONTROL_GAME':
      return Math.max(0.25, Math.min(0.76, 0.44 + coachBonus));
    case 'CHASE_UNDERDOG':
      return Math.max(0.30, Math.min(0.82, 0.48 + coachBonus + Math.abs(scoreDiff) * 0.05));
    default:
      return Math.max(0.18, Math.min(0.62, 0.34 + coachBonus));
  }
};

const getTacticIntentScore = (tacticId: string, scoreDiff: number): number => {
  const tactic = TacticRepository.getById(tacticId);
  const counts = tactic.slots.reduce((acc, slot) => {
    acc[slot.role] = (acc[slot.role] ?? 0) + 1;
    return acc;
  }, {} as Record<PlayerPosition, number>);

  const defenders = counts[PlayerPosition.DEF] ?? 0;
  const midfielders = counts[PlayerPosition.MID] ?? 0;
  const forwards = counts[PlayerPosition.FWD] ?? 0;

  if (scoreDiff < 0) {
    const urgency = Math.min(3, Math.abs(scoreDiff));
    return forwards * (18 + urgency * 5) + midfielders * 4 - defenders * (6 + urgency);
  }

  return defenders * 16 + midfielders * 5 - forwards * 12;
};

const shouldReactToScore = (
  scoreDiff: number,
  minute: number,
  coachQuality: number,
  isHalftime: boolean
): boolean => {
  if (scoreDiff === 0) return false;

  const absDiff = Math.abs(scoreDiff);
  if (isHalftime) return scoreDiff < 0 || (scoreDiff > 0 && minute >= 45);

  let pressure = absDiff * 20;
  if (scoreDiff < 0) pressure += minute >= 25 ? 18 : 4;
  if (scoreDiff <= -2) pressure += minute >= 25 ? 26 : 10;
  if (scoreDiff <= -3) pressure += 20;
  if (scoreDiff > 0 && minute >= 70) pressure += 18;
  if (scoreDiff > 0 && minute < 65) pressure -= 28;

  const threshold = 82 - coachQuality * 0.38;
  if (pressure >= threshold) return true;

  const chance = Math.max(0.03, Math.min(0.75, (pressure - threshold + 24) / 60 + (coachQuality - 50) / 220));
  return Math.random() < chance;
};

const chooseScoreTacticResponse = (
  lineup: Lineup,
  players: Player[],
  scoreDiff: number,
  coachQuality: number
): string | null => {
  const currentFit = getLineupFitScore(lineup.startingXI, lineup.tacticId, players);
  const currentIntent = getTacticIntentScore(lineup.tacticId, scoreDiff);
  const pool = scoreDiff < 0
    ? (scoreDiff <= -2 ? OFFENSIVE_TACTICS : ['4-4-2-OFF', '4-3-3', '3-5-2', '4-3-2-1'])
    : DEFENSIVE_TACTICS;

  const candidates = Array.from(new Set(pool))
    .filter(tacticId => tacticId !== lineup.tacticId)
    .map(tacticId => {
      const assignedXI = assignPlayersToTactic(lineup.startingXI.filter((id): id is string => !!id), tacticId, players);
      if (!assignedXI) return null;
      const fit = getLineupFitScore(assignedXI, tacticId, players);
      const intent = getTacticIntentScore(tacticId, scoreDiff);
      const fitLoss = Math.max(0, currentFit - fit);
      return {
        tacticId,
        score: intent - currentIntent - fitLoss * (0.18 + coachQuality / 650)
      };
    })
    .filter((entry): entry is { tacticId: string; score: number } => !!entry)
    .sort((a, b) => b.score - a.score);

  const best = candidates[0];
  if (!best) return null;

  const requiredScore = scoreDiff < 0
    ? Math.max(4, 13 - coachQuality * 0.08 - Math.abs(scoreDiff) * 3)
    : Math.max(6, 16 - coachQuality * 0.06);

  return best.score >= requiredScore ? best.tacticId : null;
};

const chooseHalftimeTacticResponse = (
  lineup: Lineup,
  players: Player[],
  status: HalftimeStatus,
  coachQuality: number,
  scoreDiff: number
): string | null => {
  const tacticalScoreDiff = status === 'PROTECT_RESULT' || status === 'CONTROL_GAME' ? Math.max(1, scoreDiff) : Math.min(-1, scoreDiff);
  const candidate = chooseScoreTacticResponse(lineup, players, tacticalScoreDiff, coachQuality);
  if (!candidate) return null;

  if (status === 'NEUTRAL') return null;
  return candidate;
};

const chooseScoreImpulseSub = (
  lineup: Lineup,
  players: Player[],
  fatigue: Record<string, number>,
  subsHistory: SubstitutionRecord[],
  scoreDiff: number,
  coachQuality: number,
  minute: number
): { playerOutId: string; playerIn: Player; slotIdx: number; reason: string } | null => {
  if (scoreDiff >= 0 || minute < 35) return null;

  const tactic = TacticRepository.getById(lineup.tacticId);
  const benchPool = getAvailableBench(lineup, players, subsHistory).filter(p => p.position !== PlayerPosition.GK);
  if (benchPool.length === 0) return null;

  const candidates = lineup.startingXI
    .map((id, slotIdx) => ({ id, slotIdx, role: tactic.slots[slotIdx]?.role }))
    .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition } =>
      !!entry.id && entry.role !== PlayerPosition.GK && entry.role !== PlayerPosition.DEF
    )
    .map(entry => {
      const currentPlayer = getPlayer(players, entry.id);
      if (!currentPlayer) return null;
      const currentScore = getEmergencyFieldScore(currentPlayer, entry.role) + ((fatigue[entry.id] ?? 100) - 70) * 0.18;
      const bestSub = [...benchPool]
        .sort((a, b) => {
          const scoreA = getEmergencyFieldScore(a, entry.role) + (a.position === PlayerPosition.FWD ? 10 : 0);
          const scoreB = getEmergencyFieldScore(b, entry.role) + (b.position === PlayerPosition.FWD ? 10 : 0);
          return scoreB - scoreA;
        })[0];
      if (!bestSub) return null;
      const subScore = getEmergencyFieldScore(bestSub, entry.role) + (bestSub.position === PlayerPosition.FWD ? 10 : 0);
      return { ...entry, currentPlayer, bestSub, gain: subScore - currentScore };
    })
    .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition; currentPlayer: Player; bestSub: Player; gain: number } => !!entry)
    .sort((a, b) => b.gain - a.gain);

  const best = candidates[0];
  if (!best) return null;

  const requiredGain = Math.max(4, 14 - coachQuality * 0.08 - Math.abs(scoreDiff) * 3);
  if (best.gain < requiredGain) return null;

  return {
    playerOutId: best.id,
    playerIn: best.bestSub,
    slotIdx: best.slotIdx,
    reason: scoreDiff <= -2 ? 'mocna reakcja na wynik' : 'impuls ofensywny'
  };
};

const chooseHalftimeExpectationSub = (
  lineup: Lineup,
  players: Player[],
  fatigue: Record<string, number>,
  subsHistory: SubstitutionRecord[],
  status: HalftimeStatus,
  coachQuality: number,
  strengthDiff: number
): { playerOutId: string; playerIn: Player; slotIdx: number; reason: string } | null => {
  if (status !== 'CHASE_EXPECTED_RESULT' && status !== 'CHASE_UNDERDOG') return null;

  const tactic = TacticRepository.getById(lineup.tacticId);
  const benchPool = getAvailableBench(lineup, players, subsHistory).filter(p => p.position !== PlayerPosition.GK);
  if (benchPool.length === 0) return null;

  const candidates = lineup.startingXI
    .map((id, slotIdx) => ({ id, slotIdx, role: tactic.slots[slotIdx]?.role }))
    .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition } =>
      !!entry.id && entry.role !== PlayerPosition.GK && entry.role !== PlayerPosition.DEF
    )
    .map(entry => {
      const currentPlayer = getPlayer(players, entry.id);
      if (!currentPlayer) return null;
      const currentFatigue = fatigue[entry.id] ?? 100;
      const currentScore = getEmergencyFieldScore(currentPlayer, entry.role) + (currentFatigue - 72) * 0.16;
      const bestSub = [...benchPool]
        .sort((a, b) => {
          const bonusA = a.position === PlayerPosition.FWD ? 12 : a.position === PlayerPosition.MID ? 5 : 0;
          const bonusB = b.position === PlayerPosition.FWD ? 12 : b.position === PlayerPosition.MID ? 5 : 0;
          return getEmergencyFieldScore(b, entry.role) + bonusB - (getEmergencyFieldScore(a, entry.role) + bonusA);
        })[0];
      if (!bestSub) return null;
      const subScore = getEmergencyFieldScore(bestSub, entry.role) + (bestSub.position === PlayerPosition.FWD ? 12 : bestSub.position === PlayerPosition.MID ? 5 : 0);
      return { ...entry, currentPlayer, bestSub, gain: subScore - currentScore };
    })
    .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition; currentPlayer: Player; bestSub: Player; gain: number } => !!entry)
    .sort((a, b) => b.gain - a.gain);

  const best = candidates[0];
  if (!best) return null;

  const pressureBonus = status === 'CHASE_EXPECTED_RESULT' ? Math.min(6, Math.max(0, strengthDiff)) : -2;
  const requiredGain = Math.max(3, 13 - coachQuality * 0.07 - pressureBonus);
  if (best.gain < requiredGain) return null;

  return {
    playerOutId: best.id,
    playerIn: best.bestSub,
    slotIdx: best.slotIdx,
    reason: status === 'CHASE_EXPECTED_RESULT' ? 'przerwa: wynik poniżej oczekiwań' : 'przerwa: próba odwrócenia meczu'
  };
};

const chooseProtectResultSub = (
  lineup: Lineup,
  players: Player[],
  fatigue: Record<string, number>,
  subsHistory: SubstitutionRecord[],
  coachQuality: number,
  minute: number,
  reason: string,
  strengthDiff: number
): { playerOutId: string; playerIn: Player; slotIdx: number; reason: string } | null => {
  const tactic = TacticRepository.getById(lineup.tacticId);
  const benchPool = getAvailableBench(lineup, players, subsHistory).filter(p => p.position !== PlayerPosition.GK);
  if (benchPool.length === 0) return null;

  const candidates = lineup.startingXI
    .map((id, slotIdx) => ({ id, slotIdx, role: tactic.slots[slotIdx]?.role }))
    .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition } =>
      !!entry.id && entry.role !== PlayerPosition.GK
    )
    .map(entry => {
      const currentPlayer = getPlayer(players, entry.id);
      if (!currentPlayer) return null;
      const currentFatigue = fatigue[entry.id] ?? 100;
      const currentDefValue = currentPlayer.attributes.defending + currentPlayer.attributes.positioning * 0.55 + currentPlayer.attributes.strength * 0.35;
      const currentAttackValue = currentPlayer.attributes.finishing + currentPlayer.attributes.passing * 0.45 + currentPlayer.attributes.pace * 0.35;
      const tiredPenalty = Math.max(0, 76 - currentFatigue) * 0.22;
      const vulnerability = currentAttackValue - currentDefValue * 0.55 + tiredPenalty + (entry.role === PlayerPosition.FWD ? 10 : entry.role === PlayerPosition.MID ? 3 : -6);
      const bestSub = [...benchPool]
        .sort((a, b) => {
          const roleA = getEmergencyFieldScore(a, entry.role);
          const roleB = getEmergencyFieldScore(b, entry.role);
          const protectA = a.position === PlayerPosition.DEF ? 20 : a.position === PlayerPosition.MID ? 9 : -10;
          const protectB = b.position === PlayerPosition.DEF ? 20 : b.position === PlayerPosition.MID ? 9 : -10;
          return roleB + protectB - (roleA + protectA);
        })[0];
      if (!bestSub) return null;
      const subScore = getEmergencyFieldScore(bestSub, entry.role) + (bestSub.position === PlayerPosition.DEF ? 20 : bestSub.position === PlayerPosition.MID ? 9 : -10);
      const outScore = getEmergencyFieldScore(currentPlayer, entry.role) + (currentFatigue - 72) * 0.12;
      return { ...entry, currentPlayer, bestSub, gain: subScore - outScore + vulnerability * 0.18 };
    })
    .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition; currentPlayer: Player; bestSub: Player; gain: number } => !!entry)
    .sort((a, b) => b.gain - a.gain);

  const best = candidates[0];
  if (!best) return null;

  const favoritePressure = Math.max(0, strengthDiff) * 0.35;
  const minutePressure = minute >= 60 ? 3 : 0;
  const requiredGain = Math.max(1, 12 - coachQuality * 0.08 - favoritePressure - minutePressure);
  if (best.gain < requiredGain) return null;

  return {
    playerOutId: best.id,
    playerIn: best.bestSub,
    slotIdx: best.slotIdx,
    reason
  };
};

export const AiMatchDecisionService = {
  makeDecisions: (
    state: MatchLiveState,
    ctx: MatchContext,
    side: 'HOME' | 'AWAY',
    isPriority: boolean = false,
    isHalftime: boolean = false,
    lateMatchContext?: AiLateMatchContext
  ): AiDecisionResult => {
    const isHome = side === 'HOME';
    const logs: string[] = [];
    let aiTacticLockResult: boolean | undefined = undefined;

    const currentLineup = isHome ? state.homeLineup : state.awayLineup;
    const currentSubsCount = isHome ? state.subsCountHome : state.subsCountAway;
    const currentFatigue = isHome ? state.homeFatigue : state.awayFatigue;
    const currentInjuries = isHome ? state.homeInjuries : state.awayInjuries;
    const myPlayers = isHome ? ctx.homePlayers : ctx.awayPlayers;
    const oppPlayers = isHome ? ctx.awayPlayers : ctx.homePlayers;
    const mySubsHistory = isHome ? state.homeSubsHistory : state.awaySubsHistory;
    const myCoach = isHome ? ctx.homeCoach : ctx.awayCoach;
    const coachQuality = getCoachQuality(myCoach);

    const subCooldown = isPriority || isHalftime ? 0 : Math.max(2, Math.round(6 - (coachQuality / 100) * 4));
    const lastSubAction = state.lastAiSubMinute ?? state.lastAiActionMinute ?? 0;
    if (!isPriority && !isHalftime && (state.minute - lastSubAction < subCooldown)) {
      return { logs: [] };
    }

    const myScore = isHome ? state.homeScore : state.awayScore;
    const oppScore = isHome ? state.awayScore : state.homeScore;
    const scoreDiff = myScore - oppScore;
    const oppLineup = isHome ? state.awayLineup : state.homeLineup;
    const halftimeAssessment = assessHalftimeStatus(currentLineup, oppLineup, myPlayers, oppPlayers, scoreDiff);
    const isFinalPhase = state.minute >= 76;
    const aiStakes = lateMatchContext?.aiStakes ?? 'MID_TABLE';
    const userStakes = lateMatchContext?.userStakes ?? 'MID_TABLE';
    const aiRank = lateMatchContext?.aiRank ?? 10;
    const userRank = lateMatchContext?.userRank ?? 10;
    const stakesWeight = getStakesWeight(aiStakes);
    const userStakesWeight = getStakesWeight(userStakes);
    const rivalryMultiplier = lateMatchContext?.rivalryMultiplier ?? 1;
    const lateSeasonDrama = (lateMatchContext?.isLateSeason ? stakesWeight : stakesWeight * 0.45) * rivalryMultiplier;
    const tablePressure = aiRank <= 5 || aiRank >= 13 || userRank <= 5 || userRank >= 13;
    const mustProtectLate = isFinalPhase && scoreDiff > 0 && (lateSeasonDrama >= 0.70 || userStakesWeight >= 0.75 || tablePressure);
    const mustChaseLate = isFinalPhase && scoreDiff < 0 && (lateSeasonDrama >= 0.70 || aiStakes !== 'LOW_STAKES');
    const avoidCollapseLate = isFinalPhase && scoreDiff <= -2 && (lateSeasonDrama >= 0.90 || aiStakes === 'RELEGATION_FIGHT');

    let reactionChance = 0.35;
    if (isHalftime) {
      reactionChance = getHalftimeReactionChance(halftimeAssessment.status, coachQuality, scoreDiff);
    } else {
      reactionChance = isPriority ? 1.0 : (state.minute < 45 ? 0.30 : (state.minute < 75 ? 0.75 : 0.95));
      if (scoreDiff < 0) reactionChance += 0.20;
      if (isFinalPhase && (mustProtectLate || mustChaseLate)) reactionChance += 0.08 + lateSeasonDrama * 0.08;
      if (isFinalPhase && aiStakes === 'LOW_STAKES' && scoreDiff === 0) reactionChance -= 0.12;
    }
    reactionChance = Math.max(0.08, Math.min(0.98, reactionChance + (coachQuality - 50) * 0.004));

    if (Math.random() > reactionChance && !isPriority) return { logs: [] };

    let newLineup = { ...currentLineup, startingXI: [...currentLineup.startingXI], bench: [...currentLineup.bench], reserves: [...currentLineup.reserves] };
    let newSubsCount = currentSubsCount;
    let subRecord: SubstitutionRecord | undefined;
    let newTacticId: string | undefined;
    let updatedActionMinute: number | undefined;
    let updatedSubMinute: number | undefined;
    let updatedFormationMinute: number | undefined;
    let tacticLockUntilMinute: number | undefined = state.aiTacticLockUntilMinute;
    const markSubAction = () => {
      updatedActionMinute = state.minute;
      updatedSubMinute = state.minute;
    };
    const markFormationAction = (lockMinutes: number = 0) => {
      updatedActionMinute = state.minute;
      updatedFormationMinute = state.minute;
      if (lockMinutes > 0) {
        tacticLockUntilMinute = Math.max(tacticLockUntilMinute ?? 0, state.minute + lockMinutes);
        aiTacticLockResult = true;
      }
    };
    const buildResult = (): AiDecisionResult => ({
      newLineup,
      newSubsCount,
      subRecord,
      newTacticId,
      lastAiActionMinute: updatedActionMinute,
      lastAiSubMinute: updatedSubMinute,
      lastAiFormationMinute: updatedFormationMinute,
      aiTacticLocked: aiTacticLockResult,
      aiTacticLockUntilMinute: tacticLockUntilMinute,
      logs
    });

    const tactic = TacticRepository.getById(newLineup.tacticId);
    const mySentOffCount = state.sentOffIds.filter(id => myPlayers.some(p => p.id === id)).length;
    const tacticCooldown = 12;
    const tacticLockActive = (state.aiTacticLockUntilMinute ?? 0) > state.minute;
    const lastFormationAction = state.lastAiFormationMinute ?? state.lastAiActionMinute ?? 0;
    const canChangeTactic = !tacticLockActive && (state.minute - lastFormationAction) >= tacticCooldown;
    const canChangeTacticNow = isHalftime || canChangeTactic;

    const severeInjuredId = newLineup.startingXI.find(id => id && currentInjuries[id] === InjurySeverity.SEVERE);
    if (severeInjuredId) {
      const slotIdx = newLineup.startingXI.indexOf(severeInjuredId);
      const injuredPlayer = getPlayer(myPlayers, severeInjuredId);

      if (newSubsCount >= MAX_LEAGUE_SUBS) {
        if (slotIdx === 0) {
          const fieldCover = pickBestFieldPlayerForGoal(newLineup, myPlayers);
          if (fieldCover) {
            newLineup.startingXI[0] = fieldCover.player.id;
            newLineup.startingXI[fieldCover.index] = null;
            if (!newLineup.reserves.includes(severeInjuredId)) newLineup.reserves.push(severeInjuredId);
            const defensiveTactic = DEFENSIVE_TACTICS.find(id => id !== newLineup.tacticId);
            if (defensiveTactic && canChangeTactic) {
              newLineup.tacticId = defensiveTactic;
              newTacticId = defensiveTactic;
              markFormationAction(12);
            }
            logs.push(`Brak zmian. ${fieldCover.player.lastName} przejmuje bramkę po kontuzji ${injuredPlayer?.lastName ?? 'bramkarza'}, a drużyna cofa ustawienie.`);
          }
        } else {
          logs.push(`Brak zmian. ${injuredPlayer?.lastName ?? 'Kontuzjowany zawodnik'} musi opuścić boisko, zespół gra w osłabieniu.`);
        }

        return buildResult();
      }

      if (slotIdx === 0) {
        const hasBenchGoalkeeper = getAvailableBench(newLineup, myPlayers, mySubsHistory).some(p => p.position === PlayerPosition.GK);
        if (!hasBenchGoalkeeper) {
          const noGkResponse = chooseNoBenchGoalkeeperResponse(newLineup, myPlayers, severeInjuredId, mySubsHistory);
          if (noGkResponse) {
            newLineup = noGkResponse.lineup;
            newSubsCount++;
            subRecord = { playerOutId: severeInjuredId, playerInId: noGkResponse.sub.id, minute: state.minute };
            const defensiveTactic = DEFENSIVE_TACTICS.find(id => id !== newLineup.tacticId);
            if (defensiveTactic && canChangeTactic) {
              newLineup.tacticId = defensiveTactic;
              newTacticId = defensiveTactic;
              markFormationAction(12);
            }
            markSubAction();
            logs.push(`${state.minute}' ${noGkResponse.fieldCover.lastName} przejmuje bramkę, a ${noGkResponse.sub.lastName} wchodzi w pole po kontuzji ${injuredPlayer?.lastName ?? 'bramkarza'}.`);

            return buildResult();
          }
        }
      }

      const injuryResponse = chooseInjuryResponse(
        newLineup,
        myPlayers,
        severeInjuredId,
        slotIdx,
        scoreDiff,
        coachQuality,
        mySubsHistory,
        canChangeTactic
      );

        if (injuryResponse) {
          newLineup = injuryResponse.lineup;
          newSubsCount++;
          subRecord = { playerOutId: severeInjuredId, playerInId: injuryResponse.sub.id, minute: state.minute };
          markSubAction();
          if (injuryResponse.newTacticId) {
            newTacticId = injuryResponse.newTacticId;
            markFormationAction();
          }
        logs.push(`${state.minute}' ${injuryResponse.sub.lastName} zastępuje ${injuredPlayer?.lastName ?? 'kontuzjowanego'} (${injuryResponse.note}).`);

        return buildResult();
      }

      if (slotIdx === 0) {
        const fieldCover = pickBestFieldPlayerForGoal(newLineup, myPlayers);
        if (fieldCover) {
          newLineup.startingXI[0] = fieldCover.player.id;
          newLineup.startingXI[fieldCover.index] = null;
          if (!newLineup.reserves.includes(severeInjuredId)) newLineup.reserves.push(severeInjuredId);
          const defensiveTactic = DEFENSIVE_TACTICS.find(id => id !== newLineup.tacticId);
          if (defensiveTactic && canChangeTactic) {
            newLineup.tacticId = defensiveTactic;
            newTacticId = defensiveTactic;
            markFormationAction(12);
          }
          logs.push(`Brak rezerwowego bramkarza. ${fieldCover.player.lastName} przejmuje bramkę po kontuzji ${injuredPlayer?.lastName ?? 'bramkarza'}.`);

          return buildResult();
        }
      }
    }

    const gkInSlot = newLineup.startingXI[0];
    if (gkInSlot === null) {
      const benchPool = getAvailableBench(newLineup, myPlayers, mySubsHistory);
      const bestGkOnBench = benchPool
        .filter(p => p.position === PlayerPosition.GK)
        .sort((a, b) => b.overallRating - a.overallRating)[0];

      if (bestGkOnBench && currentSubsCount < MAX_LEAGUE_SUBS) {
        let fieldPlayerIdx = -1;
        for (let i = newLineup.startingXI.length - 1; i >= 1; i--) {
          if (newLineup.startingXI[i] !== null) { fieldPlayerIdx = i; break; }
        }

        if (fieldPlayerIdx !== -1) {
          const playerOutId = newLineup.startingXI[fieldPlayerIdx]!;
          newLineup.startingXI[fieldPlayerIdx] = null;
          newLineup.startingXI[0] = bestGkOnBench.id;
          newLineup.bench = newLineup.bench.filter(id => id !== bestGkOnBench.id);
          newSubsCount++;
          subRecord = { playerOutId, playerInId: bestGkOnBench.id, minute: state.minute };
          markSubAction();
          logs.push(`Bramkarz rezerwowy ${bestGkOnBench.lastName} zastępuje gracza z pola.`);
        }
      } else {
        const fieldCover = pickBestFieldPlayerForGoal(newLineup, myPlayers);
        if (fieldCover) {
          newLineup.startingXI[0] = fieldCover.player.id;
          newLineup.startingXI[fieldCover.index] = null;
          logs.push(`Niecodzienna sytuacja. ${fieldCover.player.lastName} musi stanąć między słupkami.`);
        }
      }
    }

    if (mySentOffCount > 0) {
      if (!newTacticId && !tacticLockActive) {
        const tacticPool = scoreDiff >= 0 ? DEFENSIVE_TACTICS : SOLID_DEFENSIVE_TACTICS;
        const candidates = tacticPool.filter(t => t !== newLineup.tacticId);
        if (candidates.length > 0) {
          newTacticId = candidates[0];
          markFormationAction(12);
          logs.push(`Zmiana taktyki po czerwonej kartce: ${newTacticId}.`);
        }
      } else if (tacticLockActive) {
        aiTacticLockResult = true;
      }

      const defSlots = tactic.slots.filter(s => s.role === PlayerPosition.DEF).map(s => s.index);
      const emptyDefIdx = defSlots.find(idx => newLineup.startingXI[idx] === null);

      if (emptyDefIdx !== undefined && !subRecord) {
        if (newSubsCount < MAX_LEAGUE_SUBS) {
          const bestDefOnBench = getAvailableBench(newLineup, myPlayers, mySubsHistory)
            .filter(p => p.position === PlayerPosition.DEF)
            .sort((a, b) => b.overallRating - a.overallRating)[0];

          if (bestDefOnBench) {
            let sacrificeIdx = -1;
            for (let i = newLineup.startingXI.length - 1; i >= 0; i--) {
              const pid = newLineup.startingXI[i];
              if (pid !== null && (tactic.slots[i].role === PlayerPosition.FWD || tactic.slots[i].role === PlayerPosition.MID)) {
                sacrificeIdx = i;
                break;
              }
            }

            if (sacrificeIdx !== -1) {
              const playerOutId = newLineup.startingXI[sacrificeIdx]!;
              newLineup.startingXI[sacrificeIdx] = null;
              newLineup.startingXI[emptyDefIdx] = bestDefOnBench.id;
              newLineup.bench = newLineup.bench.filter(id => id !== bestDefOnBench.id);
              newSubsCount++;
              subRecord = { playerOutId, playerInId: bestDefOnBench.id, minute: state.minute };
              markSubAction();
              logs.push(`Zmiana wymuszona sytuacją. ${bestDefOnBench.lastName} wchodzi do obrony.`);
            }
          }
        } else {
          const bestInternalCover = newLineup.startingXI
            .map((id, idx) => ({ id, idx, player: getPlayer(myPlayers, id) }))
            .filter((item): item is { id: string; idx: number; player: Player } =>
              !!item.player && tactic.slots[item.idx].role !== PlayerPosition.DEF && tactic.slots[item.idx].role !== PlayerPosition.GK
            )
            .sort((a, b) => b.player.attributes.defending - a.player.attributes.defending)[0];

          if (bestInternalCover) {
            newLineup.startingXI[emptyDefIdx] = bestInternalCover.id;
            newLineup.startingXI[bestInternalCover.idx] = null;
            logs.push(`Brak zmian. ${bestInternalCover.player.lastName} musi zagrać w obronie.`);
          }
        }
      }
    }

    if (!subRecord && currentSubsCount < MAX_LEAGUE_SUBS) {
      const emptySlotIdx = newLineup.startingXI.findIndex(id => id === null);

      if (emptySlotIdx !== -1) {
        const currentOnPitchCount = newLineup.startingXI.filter(id => id !== null).length;
        const maxAllowedOnPitch = 11 - mySentOffCount;

        if (currentOnPitchCount < maxAllowedOnPitch) {
          const requiredRole = tactic.slots[emptySlotIdx].role;
          const benchPool = getAvailableBench(newLineup, myPlayers, mySubsHistory);
          const rolePool = requiredRole === PlayerPosition.GK
            ? benchPool.filter(p => p.position === PlayerPosition.GK)
            : benchPool.filter(p => p.position !== PlayerPosition.GK);
          const finalPool = rolePool.length > 0 ? rolePool : benchPool;
          const bestSub = [...finalPool].sort((a, b) => getEmergencyFieldScore(b, requiredRole) - getEmergencyFieldScore(a, requiredRole))[0];

          if (bestSub) {
            newLineup.startingXI[emptySlotIdx] = bestSub.id;
            newLineup.bench = newLineup.bench.filter(id => id !== bestSub.id);
            newSubsCount = currentSubsCount + 1;
            subRecord = { playerOutId: 'NONE', playerInId: bestSub.id, minute: state.minute };
            markSubAction();
            logs.push(`Zmiana, ${bestSub.lastName} wchodzi w miejsce zniesionego gracza.`);
          }
        }
      }
    }

    if (!subRecord && currentSubsCount < MAX_LEAGUE_SUBS) {
      const subsRemaining = MAX_LEAGUE_SUBS - currentSubsCount;
      const lightInjuryCandidates = newLineup.startingXI
        .filter((id): id is string => !!id && currentInjuries[id] === InjurySeverity.LIGHT)
        .map(id => {
          const player = getPlayer(myPlayers, id);
          const fatigue = currentFatigue[id] ?? 100;
          if (!player) return null;
          return {
            id,
            player,
            fatigue,
            urgency: getLightInjuryUrgency(player, fatigue, state.minute, subsRemaining, scoreDiff)
          };
        })
        .filter((entry): entry is { id: string; player: Player; fatigue: number; urgency: number } => !!entry)
        .sort((a, b) => b.urgency - a.urgency);

      const lightCandidate = lightInjuryCandidates.find(entry =>
        shouldTryLightInjurySub(entry.urgency, entry.player, entry.fatigue, coachQuality, isPriority, isHalftime)
      );

      if (lightCandidate) {
        const slotIdx = newLineup.startingXI.indexOf(lightCandidate.id);
        const allowTacticalResponse = canChangeTacticNow && coachQuality >= 58 && lightCandidate.urgency >= 48;
        const injuryResponse = chooseInjuryResponse(
          newLineup,
          myPlayers,
          lightCandidate.id,
          slotIdx,
          scoreDiff,
          coachQuality,
          mySubsHistory,
          allowTacticalResponse
        );

        if (injuryResponse) {
          newLineup = injuryResponse.lineup;
          newSubsCount = currentSubsCount + 1;
          subRecord = { playerOutId: lightCandidate.id, playerInId: injuryResponse.sub.id, minute: state.minute };
          markSubAction();
          if (injuryResponse.newTacticId) {
            newTacticId = injuryResponse.newTacticId;
            markFormationAction();
          }
          const reason = lightCandidate.fatigue < 58 ? 'lekki uraz i spadek kondycji' : 'profilaktyka po urazie';
          logs.push(`${state.minute}' ${injuryResponse.sub.lastName} zastępuje ${lightCandidate.player.lastName} (${reason}).`);
        }
      }
    }

    if (isHalftime && !subRecord && halftimeAssessment.status !== 'NEUTRAL') {
      const plannedTactic = !newTacticId && canChangeTacticNow
        ? chooseHalftimeTacticResponse(newLineup, myPlayers, halftimeAssessment.status, coachQuality, scoreDiff)
        : null;

      if (plannedTactic) {
        newTacticId = plannedTactic;
        markFormationAction();
        const statusText = halftimeAssessment.status === 'PROTECT_RESULT'
          ? 'korzystny wynik z mocniejszym rywalem'
          : halftimeAssessment.status === 'CONTROL_GAME'
            ? 'kontrola korzystnego wyniku'
            : 'wynik poniżej oczekiwań';
        logs.push(`${state.minute}' Przerwa: trener ocenia ${statusText} i koryguje ustawienie na ${plannedTactic}.`);
      }

      if (!subRecord && currentSubsCount < MAX_LEAGUE_SUBS) {
        const halftimeSub = chooseHalftimeExpectationSub(
          newLineup,
          myPlayers,
          currentFatigue,
          mySubsHistory,
          halftimeAssessment.status,
          coachQuality,
          halftimeAssessment.strengthDiff
        );

        if (halftimeSub) {
          const pOut = getPlayer(myPlayers, halftimeSub.playerOutId);
          newLineup = LineupService.swapPlayers(newLineup, halftimeSub.playerOutId, halftimeSub.playerIn.id, halftimeSub.slotIdx);
          newSubsCount = currentSubsCount + 1;
          subRecord = { playerOutId: halftimeSub.playerOutId, playerInId: halftimeSub.playerIn.id, minute: state.minute };
          markSubAction();
          logs.push(`${state.minute}' ${halftimeSub.playerIn.lastName} zastępuje ${pOut?.lastName} (${halftimeSub.reason}).`);
        }
      }
    }

    const shouldProtectResultWindow =
      !subRecord &&
      currentSubsCount < MAX_LEAGUE_SUBS &&
      (halftimeAssessment.status === 'PROTECT_RESULT' || halftimeAssessment.status === 'CONTROL_GAME') &&
      (isHalftime || (state.minute >= 60 && state.minute <= 75 && scoreDiff >= 0));

    if (shouldProtectResultWindow) {
      const protectReason = isHalftime
        ? halftimeAssessment.status === 'PROTECT_RESULT'
          ? 'przerwa: dowiezienie wyniku z faworytem'
          : 'przerwa: zabezpieczenie przewagi'
        : halftimeAssessment.status === 'PROTECT_RESULT'
          ? '60-75: wynik ponad stan, zabezpieczenie'
          : '60-75: kontrola korzystnego wyniku';
      const protectSub = chooseProtectResultSub(
        newLineup,
        myPlayers,
        currentFatigue,
        mySubsHistory,
        coachQuality,
        state.minute,
        protectReason,
        halftimeAssessment.strengthDiff
      );

      if (protectSub) {
        const pOut = getPlayer(myPlayers, protectSub.playerOutId);
        newLineup = LineupService.swapPlayers(newLineup, protectSub.playerOutId, protectSub.playerIn.id, protectSub.slotIdx);
        newSubsCount = currentSubsCount + 1;
        subRecord = { playerOutId: protectSub.playerOutId, playerInId: protectSub.playerIn.id, minute: state.minute };
        markSubAction();
        logs.push(`${state.minute}' ${protectSub.playerIn.lastName} zastępuje ${pOut?.lastName} (${protectSub.reason}).`);
      }
    }

    if (!subRecord && shouldReactToScore(scoreDiff, state.minute, coachQuality, isHalftime)) {
      const plannedTactic = !newTacticId && canChangeTacticNow
        ? chooseScoreTacticResponse(newLineup, myPlayers, scoreDiff, coachQuality)
        : null;

      if (plannedTactic) {
        newTacticId = plannedTactic;
        markFormationAction();
        const direction = scoreDiff < 0 ? 'odważniej' : 'bezpieczniej';
        logs.push(`${state.minute}' Trener reaguje na wynik i ustawia zespół ${direction}: ${plannedTactic}.`);
      }

      if (!subRecord && currentSubsCount < MAX_LEAGUE_SUBS && (scoreDiff <= -2 || state.minute >= 40 || isHalftime)) {
        const impulseSub = chooseScoreImpulseSub(
          newLineup,
          myPlayers,
          currentFatigue,
          mySubsHistory,
          scoreDiff,
          coachQuality,
          state.minute
        );

        if (impulseSub) {
          const pOut = getPlayer(myPlayers, impulseSub.playerOutId);
          newLineup = LineupService.swapPlayers(newLineup, impulseSub.playerOutId, impulseSub.playerIn.id, impulseSub.slotIdx);
          newSubsCount = currentSubsCount + 1;
          subRecord = { playerOutId: impulseSub.playerOutId, playerInId: impulseSub.playerIn.id, minute: state.minute };
          markSubAction();
          logs.push(`${state.minute}' ${impulseSub.playerIn.lastName} zastępuje ${pOut?.lastName} (${impulseSub.reason}).`);
        }
      }
    }

    if (!subRecord && currentSubsCount < MAX_LEAGUE_SUBS && isFinalPhase) {
      const benchPool = getAvailableBench(newLineup, myPlayers, mySubsHistory).filter(p => p.position !== PlayerPosition.GK);
      const tacticSlots = TacticRepository.getById(newLineup.tacticId).slots;
      const canUseBench = benchPool.length > 0;

      if (canUseBench && (mustProtectLate || avoidCollapseLate || mustChaseLate)) {
        const protectMode = mustProtectLate || (avoidCollapseLate && (state.minute < 86 || coachQuality >= 62));
        const fieldCandidates = newLineup.startingXI
          .map((id, slotIdx) => ({ id, slotIdx, role: tacticSlots[slotIdx]?.role }))
          .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition } =>
            !!entry.id && entry.role !== PlayerPosition.GK
          )
          .map(entry => {
            const player = getPlayer(myPlayers, entry.id);
            if (!player) return null;
            const fatigue = currentFatigue[entry.id] ?? 100;
            const tiredPenalty = Math.max(0, 72 - fatigue) * 0.34;
            const attackValue = player.attributes.finishing + player.attributes.passing * 0.5 + player.attributes.pace * 0.35;
            const defendValue = player.attributes.defending + player.attributes.positioning * 0.55 + player.attributes.strength * 0.35;
            const urgency = protectMode
              ? attackValue - defendValue * 0.55 + tiredPenalty
              : defendValue - attackValue * 0.55 + tiredPenalty;
            return { ...entry, player, fatigue, urgency };
          })
          .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition; player: Player; fatigue: number; urgency: number } => !!entry)
          .sort((a, b) => b.urgency - a.urgency);

        const outgoing = fieldCandidates[0];
        if (outgoing) {
          const bestSub = [...benchPool]
            .sort((a, b) => {
              const roleA = getEmergencyFieldScore(a, outgoing.role);
              const roleB = getEmergencyFieldScore(b, outgoing.role);
              const protectA = a.position === PlayerPosition.DEF ? 20 : a.position === PlayerPosition.MID ? 8 : -8;
              const protectB = b.position === PlayerPosition.DEF ? 20 : b.position === PlayerPosition.MID ? 8 : -8;
              const chaseA = a.position === PlayerPosition.FWD ? 22 : a.position === PlayerPosition.MID ? 8 : -10;
              const chaseB = b.position === PlayerPosition.FWD ? 22 : b.position === PlayerPosition.MID ? 8 : -10;
              return (roleB + (protectMode ? protectB : chaseB)) - (roleA + (protectMode ? protectA : chaseA));
            })[0];

          if (bestSub) {
            const subScore = getEmergencyFieldScore(bestSub, outgoing.role);
            const outScore = getEmergencyFieldScore(outgoing.player, outgoing.role) + ((outgoing.fatigue - 70) * 0.12);
            const requiredGain = protectMode
              ? Math.max(-6, 8 - coachQuality * 0.10 - lateSeasonDrama * 4)
              : Math.max(-3, 10 - coachQuality * 0.09 - lateSeasonDrama * 5);

            if (subScore - outScore >= requiredGain || outgoing.fatigue < 68 || state.minute >= 84) {
              newLineup = LineupService.swapPlayers(newLineup, outgoing.id, bestSub.id, outgoing.slotIdx);
              newSubsCount = currentSubsCount + 1;
              subRecord = { playerOutId: outgoing.id, playerInId: bestSub.id, minute: state.minute };
              markSubAction();
              const reason = protectMode
                ? mustProtectLate
                  ? 'końcówka: obrona wyniku'
                  : 'końcówka: ograniczenie strat'
                : 'końcówka: wszystko na jedną kartę';
              logs.push(`${state.minute}' ${bestSub.lastName} zastępuje ${outgoing.player.lastName} (${reason}).`);
            }
          }
        }
      }

      if (!newTacticId && canChangeTacticNow) {
        const lateTacticPool = mustChaseLate && !avoidCollapseLate
          ? OFFENSIVE_TACTICS
          : (mustProtectLate || avoidCollapseLate)
            ? DEFENSIVE_TACTICS
            : [];
        const lateTactic = lateTacticPool.find(t => t !== newLineup.tacticId);
        if (lateTactic) {
          newTacticId = lateTactic;
          markFormationAction();
          const direction = mustChaseLate && !avoidCollapseLate ? 'rzuca zespół do ataku' : 'zamyka końcówkę bezpieczniej';
          logs.push(`${state.minute}' Trener ${direction}: ${lateTactic}.`);
        }
      }
    }

    if (!subRecord && currentSubsCount < MAX_LEAGUE_SUBS) {
      let playerOutId: string | null = null;
      let reason = '';

      if (isHalftime || state.minute >= 46) {
        const fatigueThreshold = isHalftime
          ? halftimeAssessment.status === 'PROTECT_RESULT'
            ? 72
            : halftimeAssessment.status === 'CONTROL_GAME'
              ? 78
              : halftimeAssessment.status === 'CHASE_EXPECTED_RESULT'
                ? 90
                : halftimeAssessment.status === 'CHASE_UNDERDOG'
                  ? 84
                  : 82
          : state.minute < 56
            ? scoreDiff < 0
              ? 72
              : scoreDiff > 0
                ? 62
                : 68
          : 88;
        const candidates = newLineup.startingXI
          .filter((id): id is string => id !== null)
          .map(id => ({ id, fatigue: currentFatigue[id] || 100 }))
          .filter(c => c.fatigue < fatigueThreshold)
          .sort((a, b) => a.fatigue - b.fatigue);

        if (candidates.length > 0) {
          playerOutId = candidates[0].id;
          reason = isHalftime ? 'zmiana taktyczna' : 'zmęczenie';
        } else if (isHalftime && scoreDiff < 0) {
          const fieldPlayers = newLineup.startingXI
            .slice(1)
            .filter((id): id is string => id !== null)
            .map(id => getPlayer(myPlayers, id))
            .filter((p): p is Player => !!p)
            .sort((a, b) => a.overallRating - b.overallRating);

          if (fieldPlayers.length > 0) {
            playerOutId = fieldPlayers[0].id;
            reason = 'impuls managera';
          }
        }
      }

      if (playerOutId) {
        const slotIdx = newLineup.startingXI.indexOf(playerOutId);
        const requiredRole = tactic.slots[slotIdx].role;
        const benchPool = getAvailableBench(newLineup, myPlayers, mySubsHistory);
        const rolePool = requiredRole === PlayerPosition.GK
          ? benchPool.filter(p => p.position === PlayerPosition.GK)
          : benchPool.filter(p => p.position !== PlayerPosition.GK);
        const bestSub = [...rolePool].sort((a, b) => {
          let scoreA = getEmergencyFieldScore(a, requiredRole);
          let scoreB = getEmergencyFieldScore(b, requiredRole);
          if (scoreDiff < 0 && b.position === PlayerPosition.FWD) scoreB += 25;
          if (scoreDiff < 0 && a.position === PlayerPosition.FWD) scoreA += 25;
          return scoreB - scoreA;
        })[0];

        if (bestSub) {
          const pOut = getPlayer(myPlayers, playerOutId);
          newLineup = LineupService.swapPlayers(newLineup, playerOutId, bestSub.id, slotIdx);
          newSubsCount = currentSubsCount + 1;
          subRecord = { playerOutId, playerInId: bestSub.id, minute: state.minute };
          markSubAction();
          logs.push(`${isHalftime ? '' : state.minute + '\''} ${bestSub.lastName} zastępuje ${pOut?.lastName} (${reason}).`);
        }
      }
    }

    if (state.minute > 20 && !newTacticId && canChangeTactic) {
      if (scoreDiff < -1 && state.minute > 45) {
        const candidates = OFFENSIVE_TACTICS.filter(t => t !== currentLineup.tacticId);
        if (candidates.length > 0) {
          newTacticId = candidates[0];
          markFormationAction();
          logs.push(`Zmiana ustawienia na ${newTacticId}.`);
        }
      } else if (scoreDiff > 0 && state.minute > 75 && mySentOffCount === 0) {
        const candidates = DEFENSIVE_TACTICS.filter(t => t !== currentLineup.tacticId);
        if (candidates.length > 0) {
          newTacticId = candidates[0];
          markFormationAction();
          logs.push(`Zmiana ustawienia na ${newTacticId}.`);
        }
      }
    }

    return buildResult();
  }
};
