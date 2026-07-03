import { Club, Coach, Lineup, MatchCardEntry, MatchEvent, MatchEventType, MatchSubstitutionEntry, Player, RelegationPlayoffLegResult, RelegationPlayoffPenalties, RelegationPlayoffPairOutcome } from '../types';
import { TacticRepository } from '../resources/tactics_db';
import { AiMatchPreparationService } from './AiMatchPreparationService';
import { LineupService } from './LineupService';
import { PlayerMoraleService } from './PlayerMoraleService';
import { GoalAttributionService } from './GoalAttributionService';
import { KitSelectionService } from './KitSelectionService';
import { MatchHistoryService } from './MatchHistoryService';
import { PolandWeatherService } from './PolandWeatherService';
import { RefereeService } from './RefereeService';
import { CoachPreMatchMoraleService } from './CoachPreMatchMoraleService';

// ── SYMULATOR BARAŻÓW O UTRZYMANIE (2. Liga vs 3. Liga) ──────────────────────
// Osobny silnik dla meczów rozgrywanych w tle. Korzysta z pełnych kadr,
// składów, formy, morale i trenerów, ale nie uruchamia procesora ligowego.

export interface RelegationPlayoffSimulationContext {
  playersMap: Record<string, Player[]>;
  lineups: Record<string, Lineup>;
  coaches: Record<string, Coach>;
  currentDate?: Date;
  seasonNumber?: number;
}

interface TeamProfile {
  attack: number;
  defence: number;
  goalkeeper: number;
  penaltyQuality: number;
  tacticAttackMultiplier: number;
  tacticDefenceMultiplier: number;
  coachMultiplier: number;
  formMultiplier: number;
  clubMoraleMultiplier: number;
  reputationMultiplier: number;
  completenessMultiplier: number;
}

// Generator liczb pseudolosowych (LCG) — deterministyczny dla tego samego seeda.
function createRng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

const average = (values: number[], fallback: number): number =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const cloneLineup = (lineup: Lineup): Lineup => ({
  ...lineup,
  startingXI: [...lineup.startingXI],
  bench: [...lineup.bench],
  reserves: [...lineup.reserves],
});

const getPlayableLineup = (
  club: Club,
  squad: Player[],
  context: RelegationPlayoffSimulationContext
): Lineup | null => {
  if (squad.length === 0) return null;

  const coach = club.coachId ? context.coaches[club.coachId] ?? null : null;
  const existing = context.lineups[club.id];
  if (existing) return LineupService.repairLineup(cloneLineup(existing), squad);

  const tacticId = AiMatchPreparationService.determineBestStartingTactic(club, squad);
  return LineupService.repairLineup(
    LineupService.autoPickLineup(club.id, squad, tacticId, coach),
    squad
  );
};

const getTeamProfile = (
  club: Club,
  context?: RelegationPlayoffSimulationContext
): TeamProfile => {
  const reputationFallback = 38 + club.reputation * 4;
  const squad = context?.playersMap[club.id] ?? [];
  const lineup = context ? getPlayableLineup(club, squad, context) : null;
  const starterIds = lineup?.startingXI.filter((id): id is string => !!id) ?? [];
  const starters = squad.filter(player => starterIds.includes(player.id));

  const effectiveAttribute = (player: Player, value: number): number => {
    const conditionMultiplier = clamp(player.condition / 100, 0.6, 1);
    const moraleMultiplier = PlayerMoraleService.getMatchMultiplier(PlayerMoraleService.ensurePlayerState(player));
    return value * conditionMultiplier * moraleMultiplier;
  };

  const attack = average(starters.map(player => effectiveAttribute(player,
    player.attributes.attacking * 0.26 +
    player.attributes.finishing * 0.24 +
    player.attributes.passing * 0.18 +
    player.attributes.technique * 0.18 +
    player.attributes.pace * 0.14
  )), reputationFallback);
  const defence = average(starters.map(player => effectiveAttribute(player,
    player.attributes.defending * 0.35 +
    player.attributes.positioning * 0.25 +
    player.attributes.strength * 0.20 +
    player.attributes.stamina * 0.20
  )), reputationFallback);
  const goalkeeper = average(starters
    .filter(player => player.position === 'GK')
    .map(player => effectiveAttribute(player,
      player.attributes.goalkeeping * 0.70 +
      player.attributes.positioning * 0.30
    )), reputationFallback);
  const penaltyQuality = average(starters.map(player => effectiveAttribute(player,
    player.attributes.penalties * 0.65 +
    player.attributes.technique * 0.20 +
    player.attributes.mentality * 0.15
  )), reputationFallback);

  const tactic = TacticRepository.getById(lineup?.tacticId ?? '4-4-2');
  const coach = club.coachId && context ? context.coaches[club.coachId] : null;
  const coachScore = coach
    ? coach.attributes.experience * 0.30 + coach.attributes.decisionMaking * 0.35 + coach.attributes.motivation * 0.35
    : 50;
  const recentForm = (club.stats.form ?? []).slice(-5);
  const formScore = recentForm.reduce((sum, result) => sum + (result === 'W' ? 1 : result === 'P' ? -1 : 0), 0);

  return {
    attack,
    defence,
    goalkeeper,
    penaltyQuality,
    tacticAttackMultiplier: clamp(1 + (tactic.attackBias - 50) / 400, 0.88, 1.12),
    tacticDefenceMultiplier: clamp(1 + (tactic.defenseBias - 50) / 500, 0.90, 1.10),
    coachMultiplier: clamp(0.94 + coachScore / 850, 0.96, 1.06),
    formMultiplier: clamp(1 + formScore * 0.018, 0.92, 1.09),
    clubMoraleMultiplier: CoachPreMatchMoraleService.getPreMatchMoraleMultiplier(club, coach),
    reputationMultiplier: clamp(0.92 + club.reputation * 0.016, 0.94, 1.08),
    completenessMultiplier: starters.length > 0 ? clamp(starters.length / 11, 0.55, 1) : 1,
  };
};

const getMinuteGoalChance = (
  attacking: TeamProfile,
  defending: TeamProfile,
  dailyForm: number,
  homeMultiplier: number,
  totalGoals: number
): number => {
  const attackingPower =
    attacking.attack *
    attacking.tacticAttackMultiplier *
    attacking.coachMultiplier *
    attacking.formMultiplier *
    attacking.clubMoraleMultiplier *
    attacking.reputationMultiplier *
    attacking.completenessMultiplier;
  const defensivePower =
    ((defending.defence * defending.tacticDefenceMultiplier) + defending.goalkeeper * 0.42) /
    1.42;
  const saturationMultiplier = totalGoals <= 3 ? 1 : totalGoals === 4 ? 0.72 : totalGoals === 5 ? 0.52 : 0.34;
  return clamp(0.0132 * Math.pow(attackingPower / Math.max(25, defensivePower), 1.28) * dailyForm * homeMultiplier * saturationMultiplier, 0.0025, 0.065);
};

const formatPlayerName = (player: Player | undefined): string =>
  player ? `${player.firstName.charAt(0)}. ${player.lastName}` : 'Nieznany';

const buildReportRatings = (
  homeLineup: Lineup,
  awayLineup: Lineup,
  goals: Array<{ playerId?: string; assistantId?: string; teamId: string }>,
  cards: MatchCardEntry[],
  homeGoals: number,
  awayGoals: number,
  seed: number
): Record<string, number> => {
  const starters = [
    ...homeLineup.startingXI.filter((id): id is string => !!id),
    ...awayLineup.startingXI.filter((id): id is string => !!id),
  ];
  const ratings: Record<string, number> = {};
  starters.forEach((id, index) => {
    ratings[id] = 6.0 + ((seed + index * 17) % 16) / 10;
  });

  goals.forEach(goal => {
    if (goal.playerId) ratings[goal.playerId] = Math.min(10, (ratings[goal.playerId] ?? 6.5) + 0.8);
    if (goal.assistantId) ratings[goal.assistantId] = Math.min(10, (ratings[goal.assistantId] ?? 6.4) + 0.35);
  });
  cards.forEach(card => {
    if (!card.playerId) return;
    const penalty = card.type === 'YELLOW' ? 0.15 : 0.9;
    ratings[card.playerId] = Math.max(3.5, (ratings[card.playerId] ?? 6.0) - penalty);
  });

  if (homeGoals === 0 && awayLineup.startingXI[0]) ratings[awayLineup.startingXI[0]] = Math.min(10, (ratings[awayLineup.startingXI[0]] ?? 6.5) + 0.45);
  if (awayGoals === 0 && homeLineup.startingXI[0]) ratings[homeLineup.startingXI[0]] = Math.min(10, (ratings[homeLineup.startingXI[0]] ?? 6.5) + 0.45);

  return ratings;
};

const simulatePeriod = (
  homeClub: Club,
  awayClub: Club,
  seed: number,
  minutes: number,
  context?: RelegationPlayoffSimulationContext,
  minuteOffset: number = 0
) => {
  const rng = createRng(seed);
  const homeProfile = getTeamProfile(homeClub, context);
  const awayProfile = getTeamProfile(awayClub, context);
  const homeDailyForm = 0.91 + rng() * 0.18;
  const awayDailyForm = 0.91 + rng() * 0.18;
  const homeSquad = context?.playersMap[homeClub.id] ?? [];
  const awaySquad = context?.playersMap[awayClub.id] ?? [];
  const homeLineup = context ? getPlayableLineup(homeClub, homeSquad, context) : null;
  const awayLineup = context ? getPlayableLineup(awayClub, awaySquad, context) : null;
  const homeIds = homeLineup?.startingXI.filter((id): id is string => !!id) ?? [];
  const awayIds = awayLineup?.startingXI.filter((id): id is string => !!id) ?? [];
  const goals: { playerId?: string; playerName: string; minute: number; teamId: string; isPenalty: boolean; assistantId?: string; assistantName?: string }[] = [];
  const cards: MatchCardEntry[] = [];
  const substitutions: MatchSubstitutionEntry[] = [];
  const timeline: MatchEvent[] = [];
  const yellowCounts: Record<string, number> = {};
  let homeActiveIds = [...homeIds];
  let awayActiveIds = [...awayIds];
  let homeGoals = 0;
  let awayGoals = 0;

  const addGoal = (club: Club, squad: Player[], ids: string[], minute: number) => {
    const scorer = GoalAttributionService.pickScorer(squad, ids, false, rng);
    const assistant = scorer ? GoalAttributionService.pickAssistant(squad, ids, scorer.id, false, rng) : null;
    const playerName = formatPlayerName(scorer);
    const assistantName = assistant ? formatPlayerName(assistant) : undefined;
    goals.push({
      playerId: scorer?.id,
      playerName,
      minute,
      teamId: club.id,
      isPenalty: false,
      assistantId: assistant?.id,
      assistantName,
    });
    timeline.push({
      minute,
      teamSide: club.id === homeClub.id ? 'HOME' : 'AWAY',
      type: MatchEventType.GOAL,
      primaryPlayerId: scorer?.id,
      secondaryPlayerId: assistant?.id,
      text: assistantName ? `${playerName} zdobywa bramkę po podaniu ${assistantName}` : `${playerName} zdobywa bramkę`,
    });
  };

  const addCard = (club: Club, squad: Player[], ids: string[], minute: number, directRed = false) => {
    if (ids.length === 0) return;
    const playerId = ids[Math.floor(rng() * ids.length)];
    const player = squad.find(candidate => candidate.id === playerId);
    yellowCounts[playerId] = directRed ? (yellowCounts[playerId] ?? 0) : (yellowCounts[playerId] ?? 0) + 1;
    const type: MatchCardEntry['type'] = directRed ? 'RED' : yellowCounts[playerId] > 1 ? 'SECOND_YELLOW' : 'YELLOW';
    const playerName = formatPlayerName(player);
    cards.push({ playerId, playerName, minute, teamId: club.id, type });
    timeline.push({
      minute,
      teamSide: club.id === homeClub.id ? 'HOME' : 'AWAY',
      type: type === 'YELLOW' ? MatchEventType.YELLOW_CARD : MatchEventType.RED_CARD,
      primaryPlayerId: playerId,
      text: `${playerName} ${type === 'YELLOW' ? 'otrzymuje żółtą kartkę' : type === 'SECOND_YELLOW' ? 'otrzymuje drugą żółtą kartkę' : 'otrzymuje czerwoną kartkę'}`,
    });
  };

  const addSubstitution = (club: Club, squad: Player[], lineup: Lineup | null, activeIds: string[], minute: number) => {
    if (!lineup || activeIds.length < 11) return activeIds;
    const benchCandidate = lineup.bench
      .map(id => squad.find(player => player.id === id))
      .filter((player): player is Player => !!player && !activeIds.includes(player.id) && player.condition >= 58)
      .sort((a, b) => b.condition - a.condition)[0];
    const outgoing = activeIds
      .map(id => squad.find(player => player.id === id))
      .filter((player): player is Player => !!player && player.position !== 'GK')
      .sort((a, b) => a.condition - b.condition)[0];
    if (!benchCandidate || !outgoing) return activeIds;

    const sub: MatchSubstitutionEntry = {
      playerOutId: outgoing.id,
      playerOutName: formatPlayerName(outgoing),
      playerInId: benchCandidate.id,
      playerInName: formatPlayerName(benchCandidate),
      minute,
      teamId: club.id,
    };
    substitutions.push(sub);
    timeline.push({
      minute,
      teamSide: club.id === homeClub.id ? 'HOME' : 'AWAY',
      type: MatchEventType.SUBSTITUTION,
      primaryPlayerId: benchCandidate.id,
      secondaryPlayerId: outgoing.id,
      text: `${sub.playerInName} wchodzi za ${sub.playerOutName}`,
    });
    return activeIds.map(id => id === outgoing.id ? benchCandidate.id : id);
  };

  for (let minute = 1; minute <= minutes; minute++) {
    const absoluteMinute = minuteOffset + minute;
    if (minuteOffset === 0 && (minute === 62 || minute === 76)) {
      if (rng() < 0.78) homeActiveIds = addSubstitution(homeClub, homeSquad, homeLineup, homeActiveIds, absoluteMinute);
      if (rng() < 0.78) awayActiveIds = addSubstitution(awayClub, awaySquad, awayLineup, awayActiveIds, absoluteMinute);
    }
    if (rng() < 0.009) addCard(homeClub, homeSquad, homeActiveIds, absoluteMinute);
    if (rng() < 0.009) addCard(awayClub, awaySquad, awayActiveIds, absoluteMinute);
    if (rng() < 0.0008) addCard(homeClub, homeSquad, homeActiveIds, absoluteMinute, true);
    if (rng() < 0.0008) addCard(awayClub, awaySquad, awayActiveIds, absoluteMinute, true);

    const totalGoals = homeGoals + awayGoals;
    if (rng() < getMinuteGoalChance(homeProfile, awayProfile, homeDailyForm, 1.08, totalGoals)) {
      homeGoals++;
      addGoal(homeClub, homeSquad, homeActiveIds, absoluteMinute);
    }
    if (rng() < getMinuteGoalChance(awayProfile, homeProfile, awayDailyForm, 1, totalGoals)) {
      awayGoals++;
      addGoal(awayClub, awaySquad, awayActiveIds, absoluteMinute);
    }
  }

  return { homeGoals, awayGoals, goals, cards, substitutions, timeline, homeLineup, awayLineup };
};

export const RelegationPlayoffSimulator = {

  // Symuluje pojedynczy mecz barażowy na podstawie pełnych jedenastek.
  simulateMatch(
    homeClub: Club,
    awayClub: Club,
    seed: number,
    context?: RelegationPlayoffSimulationContext
  ): RelegationPlayoffLegResult {
    const result = simulatePeriod(homeClub, awayClub, seed, 95, context);
    const matchId = `RELEGATION_PLAYOFF_${context?.seasonNumber ?? 0}_${context?.currentDate?.toISOString().slice(0, 10) ?? seed}_${homeClub.id}_${awayClub.id}`;

    if (context?.currentDate && context.seasonNumber !== undefined && result.homeLineup && result.awayLineup) {
      const weather = PolandWeatherService.getWeather(context.currentDate, matchId);
      const referee = RefereeService.assignPolishReferee(matchId, 4);
      const ratings = buildReportRatings(
        result.homeLineup,
        result.awayLineup,
        result.goals,
        result.cards,
        result.homeGoals,
        result.awayGoals,
        seed
      );
      MatchHistoryService.logMatch({
        matchId,
        date: context.currentDate.toDateString(),
        season: context.seasonNumber,
        competition: 'BARAŻE O UTRZYMANIE 2. LIGI',
        homeTeamId: homeClub.id,
        awayTeamId: awayClub.id,
        homeScore: result.homeGoals,
        awayScore: result.awayGoals,
        attendance: Math.round(homeClub.stadiumCapacity * clamp(0.58 + (homeClub.reputation + awayClub.reputation) * 0.025, 0.62, 0.96)),
        venue: homeClub.stadiumName,
        weather,
        addedTime: 5,
        refereeName: `${referee.firstName} ${referee.lastName}`,
        goals: result.goals,
        cards: result.cards,
        substitutions: result.substitutions,
        injuries: [],
        timeline: result.timeline.sort((a, b) => a.minute - b.minute),
        homeLineup: result.homeLineup.startingXI.filter((id): id is string => !!id),
        awayLineup: result.awayLineup.startingXI.filter((id): id is string => !!id),
        ratings,
        homeTacticId: result.homeLineup.tacticId,
        awayTacticId: result.awayLineup.tacticId,
        kits: KitSelectionService.selectOptimalKits(homeClub, awayClub),
      });
    }

    return { homeId: homeClub.id, awayId: awayClub.id, homeGoals: result.homeGoals, awayGoals: result.awayGoals, matchId };
  },

  // Symuluje serię rzutów karnych po remisie w agregacie.
  simulatePenalties(
    homeClub: Club,
    awayClub: Club,
    seed: number,
    context?: RelegationPlayoffSimulationContext
  ): RelegationPlayoffPenalties {
    const rng = createRng(seed + 77777);
    const homeProfile = getTeamProfile(homeClub, context);
    const awayProfile = getTeamProfile(awayClub, context);
    const homeChance = clamp(0.62 + homeProfile.penaltyQuality / 420, 0.68, 0.90);
    const awayChance = clamp(0.62 + awayProfile.penaltyQuality / 420, 0.68, 0.90);

    let homeShots = 0;
    let awayShots = 0;
    for (let round = 0; round < 5; round++) {
      if (rng() < homeChance) homeShots++;
      if (rng() < awayChance) awayShots++;
    }

    while (homeShots === awayShots) {
      if (rng() < homeChance) homeShots++;
      if (rng() < awayChance) awayShots++;
    }

    const winnerId = homeShots > awayShots ? homeClub.id : awayClub.id;
    return { winnerId, homeShots, awayShots };
  },

  // Oblicza wynik całego dwumeczu po obu meczach.
  resolveAggregate(
    leg1: RelegationPlayoffLegResult,
    leg2: RelegationPlayoffLegResult,
    clubL3: Club,  // klub z 2. Ligi (homeClub w leg1)
    clubL4: Club,  // klub z 3. Ligi (awayClub w leg1)
    seed: number,
    context?: RelegationPlayoffSimulationContext
  ): RelegationPlayoffPairOutcome {
    const l3Agg = leg1.homeGoals + leg2.awayGoals;
    const l4Agg = leg1.awayGoals + leg2.homeGoals;

    if (l3Agg > l4Agg) {
      return { leg1, leg2, winnerId: clubL3.id, loserId: clubL4.id, decidedBy: 'AGGREGATE' };
    }
    if (l4Agg > l3Agg) {
      return { leg1, leg2, winnerId: clubL4.id, loserId: clubL3.id, decidedBy: 'AGGREGATE' };
    }

    const extraTime = simulatePeriod(clubL4, clubL3, seed + 30000, 30, context, 95);
    const leg2WithExtraTime = {
      ...leg2,
      homeGoals: leg2.homeGoals + extraTime.homeGoals,
      awayGoals: leg2.awayGoals + extraTime.awayGoals,
      isExtraTime: true,
    };
    if (leg2.matchId) {
      const report = MatchHistoryService.getAll().find(entry => entry.matchId === leg2.matchId);
      MatchHistoryService.updateMatch(leg2.matchId, {
        homeScore: leg2WithExtraTime.homeGoals,
        awayScore: leg2WithExtraTime.awayGoals,
        isExtraTime: true,
        goals: [...(report?.goals ?? []), ...extraTime.goals],
        cards: [...(report?.cards ?? []), ...extraTime.cards],
        substitutions: [...(report?.substitutions ?? []), ...extraTime.substitutions],
        timeline: [...(report?.timeline ?? []), ...extraTime.timeline].sort((a, b) => a.minute - b.minute),
      });
    }
    if (extraTime.homeGoals !== extraTime.awayGoals) {
      const winnerId = extraTime.homeGoals > extraTime.awayGoals ? clubL4.id : clubL3.id;
      return {
        leg1,
        leg2: leg2WithExtraTime,
        winnerId,
        loserId: winnerId === clubL3.id ? clubL4.id : clubL3.id,
        decidedBy: 'EXTRA_TIME',
        extraTime: { homeGoals: extraTime.homeGoals, awayGoals: extraTime.awayGoals },
      };
    }

    const penalties = this.simulatePenalties(clubL3, clubL4, seed, context);
    const winnerId = penalties.winnerId;
    const loserId = winnerId === clubL3.id ? clubL4.id : clubL3.id;
    if (leg2.matchId) {
      MatchHistoryService.updateMatch(leg2.matchId, {
        homePenaltyScore: penalties.awayShots,
        awayPenaltyScore: penalties.homeShots,
      });
    }
    return {
      leg1,
      leg2: leg2WithExtraTime,
      winnerId,
      loserId,
      decidedBy: 'PENALTIES',
      penalties,
      extraTime: { homeGoals: extraTime.homeGoals, awayGoals: extraTime.awayGoals },
    };
  },
};
