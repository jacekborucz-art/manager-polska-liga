import { MatchEventType, type Player } from '../../../../types';
import type {
  CupInjurySeverity,
  CupMatchEvent,
  CupMatchInput,
  CupPenaltyShootoutAttempt,
  CupTeamInput,
  CupTeamSide,
} from './CupMatchTypes';
import { clamp, pickWeighted, seededRandom, weightedScore } from './CupMath';

const playerName = (player: Player): string => `${player.firstName} ${player.lastName}`.trim();

const takerWeight = (player: Player, fatigue = player.condition, injury?: CupInjurySeverity): number => {
  const injuryPenalty =
    injury === 'SEVERE' ? 0.56 :
    injury === 'LIGHT' ? 0.82 :
    1;

  return Math.max(1, weightedScore(player.attributes, {
    penalties: 0.34,
    finishing: 0.18,
    technique: 0.16,
    mentality: 0.18,
    leadership: 0.06,
    strength: 0.04,
    talent: 0.04,
  }) * clamp(0.72 + fatigue / 285, 0.72, 1.07) * injuryPenalty);
};

const goalkeeperWeight = (player?: Player, fatigue = player?.condition ?? 70, injury?: CupInjurySeverity): number => {
  if (!player) return 42;

  const injuryPenalty =
    injury === 'SEVERE' ? 0.62 :
    injury === 'LIGHT' ? 0.86 :
    1;

  return weightedScore(player.attributes, {
    goalkeeping: 0.42,
    positioning: 0.18,
    mentality: 0.16,
    pace: 0.08,
    strength: 0.08,
    leadership: 0.08,
  }) * clamp(0.74 + fatigue / 310, 0.74, 1.06) * injuryPenalty;
};

const activePlayers = (team: CupTeamInput, redCards: Record<string, boolean>): Player[] => {
  const byId = new Map(team.players.map(player => [player.id, player]));
  const active = team.lineup.startingXI
    .map(id => id ? byId.get(id) : undefined)
    .filter((player): player is Player => Boolean(player && !redCards[player.id]));

  return active.length > 0 ? active : team.players.filter(player => !redCards[player.id]);
};

const selectGoalkeeper = (players: Player[], redCards: Record<string, boolean>): Player | undefined => {
  const eligible = players.filter(player => !redCards[player.id]);
  return eligible.find(player => player.position === 'GK') ??
    eligible
      .map(player => ({
        player,
        score: weightedScore(player.attributes, {
          goalkeeping: 0.55,
          positioning: 0.18,
          mentality: 0.12,
          strength: 0.08,
          leadership: 0.07,
        }),
      }))
      .sort((a, b) => b.score - a.score)[0]?.player;
};

const buildTakerOrder = (
  candidates: Player[],
  fatigue: Record<string, number>,
  injuries: Record<string, CupInjurySeverity>,
  seed: string,
  salt: number,
): Player[] => {
  const remaining = [...candidates];
  const ordered: Player[] = [];
  let pickIndex = 0;

  while (remaining.length > 0) {
    const picked = pickWeighted(
      remaining.map(player => ({
        item: player,
        weight: takerWeight(player, fatigue[player.id] ?? player.condition, injuries[player.id]) *
          (0.82 + seededRandom(seed, 91000 + pickIndex, salt + pickIndex) * 0.36),
      })),
      seededRandom(seed, 92000 + pickIndex, salt + 100),
    );
    ordered.push(picked);
    remaining.splice(remaining.findIndex(player => player.id === picked.id), 1);
    pickIndex += 1;
  }

  return ordered;
};

export const CupPenaltyShootoutService = {
  /**
   * Seria karnych jest osobną fazą po dogrywce. Nie dolicza bramek do wyniku
   * meczu, ale generuje osobne zdarzenia wykonawców i bramkarzy dla raportu.
   */
  simulate: (
    input: CupMatchInput,
    fatigue: Record<string, number>,
    options: {
      redCards?: Record<string, boolean>;
      injuries?: Record<string, CupInjurySeverity>;
      startSecond?: number;
    } = {},
  ): { winner: CupTeamSide; home: number; away: number; attempts: CupPenaltyShootoutAttempt[]; events: CupMatchEvent[] } => {
    const redCards = options.redCards ?? {};
    const injuries = options.injuries ?? {};
    const startSecond = options.startSecond ?? 120 * 60;
    const homeCandidates = activePlayers(input.home, redCards);
    const awayCandidates = activePlayers(input.away, redCards);
    const homeKeeper = selectGoalkeeper(homeCandidates, redCards);
    const awayKeeper = selectGoalkeeper(awayCandidates, redCards);
    const homeOrder = buildTakerOrder(homeCandidates, fatigue, injuries, input.seed, 31);
    const awayOrder = buildTakerOrder(awayCandidates, fatigue, injuries, input.seed, 47);
    let home = 0;
    let away = 0;
    let round = 0;
    let order = 0;
    const attempts: CupPenaltyShootoutAttempt[] = [];
    const events: CupMatchEvent[] = [];

    const takePenalty = (side: CupTeamSide, taker: Player, salt: number): CupPenaltyShootoutAttempt => {
      const keeper = side === 'HOME' ? awayKeeper : homeKeeper;
      const takerScore = takerWeight(taker, fatigue[taker.id] ?? taker.condition, injuries[taker.id]);
      const keeperScore = goalkeeperWeight(keeper, keeper ? fatigue[keeper.id] ?? keeper.condition : 70, keeper ? injuries[keeper.id] : undefined);
      const chance = clamp(0.73 + (takerScore - keeperScore) * 0.003, 0.55, 0.90);
      const scored = seededRandom(input.seed, 100000 + round, salt) < chance;
      const saved = !scored && seededRandom(input.seed, 101000 + round, salt) < clamp(0.43 + (keeperScore - takerScore) * 0.004, 0.18, 0.72);

      return {
        id: `cupv2_shootout_${order}_${side.toLowerCase()}_${taker.id}`,
        round: round + 1,
        order,
        side,
        takerId: taker.id,
        goalkeeperId: keeper?.id,
        scored,
        saved,
        xG: Number(chance.toFixed(2)),
        takerScore: Number(takerScore.toFixed(2)),
        keeperScore: Number(keeperScore.toFixed(2)),
      };
    };

    const pushAttempt = (attempt: CupPenaltyShootoutAttempt): void => {
      attempts.push(attempt);
      if (attempt.side === 'HOME' && attempt.scored) home += 1;
      if (attempt.side === 'AWAY' && attempt.scored) away += 1;

      const team = attempt.side === 'HOME' ? input.home : input.away;
      const taker = team.players.find(player => player.id === attempt.takerId);
      const keeperTeam = attempt.side === 'HOME' ? input.away : input.home;
      const keeper = attempt.goalkeeperId ? keeperTeam.players.find(player => player.id === attempt.goalkeeperId) : undefined;
      const second = startSecond + attempt.order * 15;
      const penaltyScoreText = `${home}:${away}`;
      const resultText = attempt.scored
        ? `${taker ? playerName(taker) : 'Zawodnik'} wykorzystuje rzut karny w serii.`
        : attempt.saved
          ? `${keeper ? playerName(keeper) : 'Bramkarz'} broni rzut karny wykonywany przez ${taker ? playerName(taker) : 'zawodnika'}.`
          : `${taker ? playerName(taker) : 'Zawodnik'} nie trafia w serii rzutów karnych.`;

      events.push({
        id: attempt.id,
        second,
        minute: Math.floor(second / 60) + 1,
        side: attempt.side,
        type: attempt.scored ? MatchEventType.PENALTY_SCORED : MatchEventType.PENALTY_MISSED,
        playerId: attempt.takerId,
        secondaryPlayerId: attempt.goalkeeperId,
        text: resultText,
        xG: attempt.xG,
        detail: {
          isShootout: true,
          phase: 'PENALTY_SHOOTOUT',
          shootoutRound: attempt.round,
          shootoutOrder: attempt.order,
          goalkeeperId: attempt.goalkeeperId,
          saved: attempt.saved,
          penaltyScoreHome: home,
          penaltyScoreAway: away,
          penaltyScore: penaltyScoreText,
        },
      });
    };

    while (round < 5 || home === away) {
      const homeTaker = homeOrder[round % homeOrder.length];
      const awayTaker = awayOrder[round % awayOrder.length];
      pushAttempt(takePenalty('HOME', homeTaker, 11));
      order += 1;

      const remainingAfterHome = Math.max(0, 5 - round - 1);
      if (round < 5 && Math.abs(home - away) > remainingAfterHome + 1) break;

      pushAttempt(takePenalty('AWAY', awayTaker, 12));
      order += 1;
      round += 1;

      const remaining = Math.max(0, 5 - round);
      if (round >= 5 && home !== away) break;
      if (round < 5 && Math.abs(home - away) > remaining) break;
      if (round > 16 && home !== away) break;
    }

    return { winner: home >= away ? 'HOME' : 'AWAY', home, away, attempts, events };
  },
};
