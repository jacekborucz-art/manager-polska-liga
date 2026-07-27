import { MatchEventType, type Lineup, type MatchContext, type Player, type TacticalInstructions } from '../../types';
import { TacticRepository } from '../../resources/tactics_db';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { PolishCupVenueService } from '../../services/PolishCupVenueService';
import type { KitSelection } from '../../services/KitSelectionService';
import type { CupMatchEvent } from '../../services/match/engines/cupV2';
import type { CupShadowSimulationReport } from '../../services/match/adapters/cupV2';
import type {
  CupV2KitUi,
  CupV2LiveUiState,
  CupV2PitchPlayerNode,
  CupV2PlayerLiveCard,
  CupV2TeamStatsUi,
  CupV2TimelineEvent,
  CupV2UiSide,
} from './CupV2LiveUiTypes';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const isShootoutEvent = (event: CupMatchEvent): boolean => event.detail?.isShootout === true;

const isShotEvent = (type: MatchEventType): boolean =>
  type === MatchEventType.GOAL ||
  type === MatchEventType.SHOT ||
  type === MatchEventType.SHOT_ON_TARGET ||
  type === MatchEventType.SHOT_POST ||
  type === MatchEventType.SHOT_BAR ||
  type === MatchEventType.ONE_ON_ONE_GOAL ||
  type === MatchEventType.ONE_ON_ONE_MISS ||
  type === MatchEventType.ONE_ON_ONE_SAVE ||
  type === MatchEventType.PENALTY_SCORED ||
  type === MatchEventType.PENALTY_MISSED;

const isShotOnTargetEvent = (type: MatchEventType): boolean =>
  type === MatchEventType.GOAL ||
  type === MatchEventType.SHOT_ON_TARGET ||
  type === MatchEventType.ONE_ON_ONE_GOAL ||
  type === MatchEventType.ONE_ON_ONE_SAVE ||
  type === MatchEventType.PENALTY_SCORED;

const isGoalEvent = (event: CupMatchEvent): boolean =>
  !isShootoutEvent(event) &&
  (
    event.type === MatchEventType.GOAL ||
    event.type === MatchEventType.ONE_ON_ONE_GOAL ||
    event.type === MatchEventType.PENALTY_SCORED
  );

const isRelevantTickerEvent = (event: CupMatchEvent): boolean =>
  event.type !== MatchEventType.MIDFIELD_CONTROL &&
  event.type !== MatchEventType.MISPLACED_PASS;

const playerName = (player?: Player): string => player ? `${player.firstName} ${player.lastName}` : '';
const shortPlayerName = (player?: Player): string => player ? `${player.firstName.charAt(0)}. ${player.lastName}` : '';

const buildPlayerLookup = (report: CupShadowSimulationReport): Map<string, Player> => {
  const lookup = new Map<string, Player>();
  [...report.input.home.players, ...report.input.away.players].forEach(player => lookup.set(player.id, player));
  return lookup;
};

const kitForSide = (kits: KitSelection, side: CupV2UiSide): CupV2KitUi => {
  const kit = side === 'HOME' ? kits.home : kits.away;
  return {
    primary: kit.primary,
    secondary: kit.secondary,
    text: kit.text,
    shirtSecondary: kit.shirtSecondary,
  };
};

const emptyStats = (): CupV2TeamStatsUi => ({
  possession: 50,
  shots: 0,
  shotsOnTarget: 0,
  xG: 0,
  corners: 0,
  fouls: 0,
  offsides: 0,
  yellowCards: 0,
  redCards: 0,
});

const buildElapsedStats = (
  report: CupShadowSimulationReport,
  events: CupMatchEvent[],
): Record<CupV2UiSide, CupV2TeamStatsUi> => {
  const stats: Record<CupV2UiSide, CupV2TeamStatsUi> = {
    HOME: emptyStats(),
    AWAY: emptyStats(),
  };

  events.forEach(event => {
    if (!event.side || isShootoutEvent(event)) return;
    const sideStats = stats[event.side];
    if (isShotEvent(event.type)) {
      sideStats.shots += 1;
      sideStats.xG += event.xG ?? 0;
    }
    if (isShotOnTargetEvent(event.type)) sideStats.shotsOnTarget += 1;
    if (event.type === MatchEventType.CORNER) sideStats.corners += 1;
    if (event.type === MatchEventType.OFFSIDE) sideStats.offsides += 1;
    if (event.type === MatchEventType.FOUL || event.type === MatchEventType.YELLOW_CARD || event.type === MatchEventType.RED_CARD) sideStats.fouls += 1;
    if (event.type === MatchEventType.YELLOW_CARD) sideStats.yellowCards += 1;
    if (event.type === MatchEventType.RED_CARD) sideStats.redCards += 1;
  });

  const homeTicks = report.result.stats.HOME.possessionTicks;
  const awayTicks = report.result.stats.AWAY.possessionTicks;
  const totalTicks = Math.max(1, homeTicks + awayTicks);
  stats.HOME.possession = Math.round((homeTicks / totalTicks) * 100);
  stats.AWAY.possession = 100 - stats.HOME.possession;
  stats.HOME.xG = Math.round(stats.HOME.xG * 100) / 100;
  stats.AWAY.xG = Math.round(stats.AWAY.xG * 100) / 100;

  return stats;
};

const interpolateFatigue = (report: CupShadowSimulationReport, player: Player, currentSecond: number): number => {
  const finalSecond = Math.max(1, report.result.finalState.second);
  const progress = clamp(currentSecond / finalSecond, 0, 1);
  const start = player.condition ?? 75;
  const end = report.result.finalState.fatigue[player.id] ?? start;
  return Math.round((start + (end - start) * progress) * 10) / 10;
};

const createPlayerCards = (
  report: CupShadowSimulationReport,
  elapsedEvents: CupMatchEvent[],
  activeLineups: Record<CupV2UiSide, Lineup>,
  activePlayerId: string | undefined,
  currentSecond: number,
): Record<CupV2UiSide, CupV2PlayerLiveCard[]> => {
  const playersBySide: Record<CupV2UiSide, Player[]> = {
    HOME: report.input.home.players,
    AWAY: report.input.away.players,
  };
  const leftPitchIds = new Set(
    elapsedEvents
      .filter(event => event.type === MatchEventType.SUBSTITUTION)
      .map(event => event.secondaryPlayerId)
      .filter((id): id is string => Boolean(id))
  );
  const cards: Record<CupV2UiSide, Record<string, CupV2PlayerLiveCard>> = { HOME: {}, AWAY: {} };

  (['HOME', 'AWAY'] as CupV2UiSide[]).forEach(side => {
    const finalStats = report.result.playerStats[side];
    playersBySide[side].forEach(player => {
      const isStarter = report.initialLineup[side].startingXI.includes(player.id);
      const isBench = report.initialLineup[side].bench.includes(player.id);
      const isOnPitch = activeLineups[side].startingXI.includes(player.id);
      const hasLeftPitch = !isOnPitch && leftPitchIds.has(player.id);
      const finalEntry = finalStats[player.id];
      cards[side][player.id] = {
        id: player.id,
        side,
        name: playerName(player),
        shortName: shortPlayerName(player),
        position: player.position,
        overall: player.overallRating,
        rating: finalEntry?.rating ?? 0,
        fatigue: interpolateFatigue(report, player, currentSecond),
        isStarter,
        isBench,
        isOnPitch,
        hasLeftPitch,
        isActiveEvent: activePlayerId === player.id,
        goals: 0,
        ownGoals: 0,
        assists: 0,
        shots: 0,
        shotsOnTarget: 0,
        xG: 0,
        fouls: 0,
        offsides: 0,
        yellowCards: 0,
        redCards: 0,
      };
    });
  });

  const playerToSide = new Map<string, CupV2UiSide>();
  (['HOME', 'AWAY'] as CupV2UiSide[]).forEach(side => {
    playersBySide[side].forEach(player => playerToSide.set(player.id, side));
  });

  elapsedEvents.forEach(event => {
    if (!event.side || isShootoutEvent(event)) return;
    const side = event.side;
    const playerId = event.playerId;
    const playerCard = playerId ? cards[playerToSide.get(playerId) ?? side]?.[playerId] : undefined;
    const ownGoalPlayerId = typeof event.detail?.ownGoalPlayerId === 'string' ? event.detail.ownGoalPlayerId : undefined;
    const ownGoalSide = ownGoalPlayerId ? playerToSide.get(ownGoalPlayerId) : undefined;
    const ownGoalCard = ownGoalPlayerId && ownGoalSide ? cards[ownGoalSide]?.[ownGoalPlayerId] : undefined;

    if (event.type === MatchEventType.SUBSTITUTION) {
      if (event.playerId && cards[side][event.playerId]) cards[side][event.playerId].substitutedOnMinute = event.minute;
      if (event.secondaryPlayerId && cards[side][event.secondaryPlayerId]) cards[side][event.secondaryPlayerId].substitutedOffMinute = event.minute;
      return;
    }

    if (playerCard && isShotEvent(event.type)) {
      playerCard.shots += 1;
      playerCard.xG = Math.round((playerCard.xG + (event.xG ?? 0)) * 100) / 100;
      if (isShotOnTargetEvent(event.type)) playerCard.shotsOnTarget += 1;
    }

    if (isGoalEvent(event)) {
      if (event.detail?.isOwnGoal === true && ownGoalCard) {
        ownGoalCard.ownGoals += 1;
      } else if (playerCard) {
        playerCard.goals += 1;
      }
      if (event.secondaryPlayerId && event.detail?.assistEligible !== false && cards[side][event.secondaryPlayerId]) {
        cards[side][event.secondaryPlayerId].assists += 1;
      }
    }

    if (event.type === MatchEventType.FOUL || event.type === MatchEventType.YELLOW_CARD || event.type === MatchEventType.RED_CARD) {
      if (playerCard) playerCard.fouls += 1;
    }
    if (event.type === MatchEventType.OFFSIDE && playerCard) playerCard.offsides += 1;
    if (event.type === MatchEventType.YELLOW_CARD && playerCard) playerCard.yellowCards += 1;
    if (event.type === MatchEventType.RED_CARD && playerCard) playerCard.redCards += 1;
    if ((event.type === MatchEventType.INJURY_LIGHT || event.type === MatchEventType.INJURY_SEVERE) && playerCard) {
      playerCard.injury = event.type === MatchEventType.INJURY_SEVERE ? 'SEVERE' : 'LIGHT';
    }
  });

  return {
    HOME: Object.values(cards.HOME).sort((a, b) => Number(b.isOnPitch) - Number(a.isOnPitch) || Number(b.isStarter) - Number(a.isStarter) || Number(b.isBench) - Number(a.isBench) || b.rating - a.rating),
    AWAY: Object.values(cards.AWAY).sort((a, b) => Number(b.isOnPitch) - Number(a.isOnPitch) || Number(b.isStarter) - Number(a.isStarter) || Number(b.isBench) - Number(a.isBench) || b.rating - a.rating),
  };
};

const buildPitchNodes = (
  report: CupShadowSimulationReport,
  cards: Record<CupV2UiSide, CupV2PlayerLiveCard[]>,
  activeLineups: Record<CupV2UiSide, Lineup>,
  kits: KitSelection,
): CupV2PitchPlayerNode[] => {
  const nodes: CupV2PitchPlayerNode[] = [];

  (['HOME', 'AWAY'] as CupV2UiSide[]).forEach(side => {
    const tactic = TacticRepository.getById(activeLineups[side].tacticId);
    const kit = kitForSide(kits, side);
    const cardMap = new Map(cards[side].map(card => [card.id, card]));
    activeLineups[side].startingXI.forEach((playerId, index) => {
      if (!playerId) return;
      const card = cardMap.get(playerId);
      const slot = tactic.slots[index] ?? tactic.slots[0];
      if (!card) return;
      const halfY = side === 'HOME'
        ? clamp(0.41 + slot.y * 0.6, 0.53, 0.96)
        : clamp(0.59 - slot.y * 0.6, 0.04, 0.47);

      nodes.push({
        ...card,
        x: slot.x,
        y: halfY,
        kit,
      });
    });
  });

  return nodes;
};

const toTimelineEvent = (event: CupMatchEvent): CupV2TimelineEvent => ({
  id: event.id,
  minute: event.minute,
  side: event.side,
  type: event.type,
  text: event.text,
  playerId: event.playerId,
  secondaryPlayerId: event.secondaryPlayerId,
  isGoal: isGoalEvent(event),
  isCard: event.type === MatchEventType.YELLOW_CARD || event.type === MatchEventType.RED_CARD,
  isInjury: event.type === MatchEventType.INJURY_LIGHT || event.type === MatchEventType.INJURY_SEVERE,
  isShootout: isShootoutEvent(event),
});

const phaseLabel = (currentSecond: number, finalSecond: number, isFinished: boolean, decidedByPenalties: boolean): string => {
  if (isFinished && decidedByPenalties) return 'KARNE';
  if (isFinished) return 'KONIEC';
  if (currentSecond <= 45 * 60) return '1. POŁOWA';
  if (currentSecond <= 90 * 60) return '2. POŁOWA';
  if (currentSecond <= 105 * 60) return 'DOGRYWKA I';
  if (currentSecond < finalSecond) return 'DOGRYWKA II';
  return 'KONIEC';
};

const minuteLabel = (currentSecond: number, isFinished: boolean): string => {
  if (isFinished) return 'FT';
  return `${Math.max(0, Math.floor(currentSecond / 60))}'`;
};

export const CupV2LiveUiMapper = {
  build: ({
    report,
    ctx,
    kits,
    currentSecond,
    title,
    userSide,
    userInstructions,
    captainId,
    penaltyTakerId,
    freeKickTakerId,
  }: {
    report: CupShadowSimulationReport;
    ctx: MatchContext;
    kits: KitSelection;
    currentSecond: number;
    title: string;
    userSide: CupV2UiSide;
    userInstructions: TacticalInstructions;
    captainId?: string | null;
    penaltyTakerId?: string | null;
    freeKickTakerId?: string | null;
  }): CupV2LiveUiState => {
    const finalSecond = Math.max(90 * 60, report.result.finalState.second);
    const safeSecond = clamp(currentSecond, 0, finalSecond);
    const isFinished = safeSecond >= finalSecond;
    const elapsedEvents = report.result.events
      .filter(event => event.second <= safeSecond)
      .sort((a, b) => a.second - b.second);
    const activeTimelineEvents = elapsedEvents.filter(isRelevantTickerEvent).map(toTimelineEvent);
    const activePlayerId = [...elapsedEvents].reverse().find(event => event.playerId && isRelevantTickerEvent(event))?.playerId;
    const scoreEvents = elapsedEvents.filter(isGoalEvent);
    const homeScore = isFinished ? report.result.homeScore : scoreEvents.filter(event => event.side === 'HOME').length;
    const awayScore = isFinished ? report.result.awayScore : scoreEvents.filter(event => event.side === 'AWAY').length;
    const activeLineups: Record<CupV2UiSide, Lineup> = {
      HOME: report.input.home.lineup,
      AWAY: report.input.away.lineup,
    };
    const players = createPlayerCards(report, elapsedEvents, activeLineups, activePlayerId, safeSecond);
    const stats = buildElapsedStats(report, elapsedEvents);
    const pitchNodes = buildPitchNodes(report, players, activeLineups, kits);
    const homeMomentum = clamp(50 + (stats.HOME.possession - 50) + (stats.HOME.xG - stats.AWAY.xG) * 10, 0, 100);
    const awayMomentum = 100 - homeMomentum;
    const winnerClub = isFinished && report.result.winner === 'HOME' ? ctx.homeClub : isFinished && report.result.winner === 'AWAY' ? ctx.awayClub : undefined;
    const shootout = report.result.penaltyScore && isFinished
      ? {
          home: report.result.penaltyScore.home,
          away: report.result.penaltyScore.away,
          attempts: (report.result.penaltyShootout ?? []).map(attempt => {
            const lookup = buildPlayerLookup(report);
            return {
              id: attempt.id,
              side: attempt.side,
              playerName: shortPlayerName(lookup.get(attempt.takerId)) || 'Zawodnik',
              scored: attempt.scored,
              saved: attempt.saved,
            };
          }),
        }
      : undefined;

    return {
      minute: Math.floor(safeSecond / 60),
      currentSecond: safeSecond,
      isHalfTime: safeSecond === 45 * 60 && !isFinished,
      isFinished,
      isExtraTime: safeSecond > 90 * 60 && !report.result.decidedByPenalties,
      isShootout: isFinished && report.result.decidedByPenalties,
      header: {
        title,
        venue: PolishCupVenueService.getVenue(ctx.fixture, ctx.homeClub).name,
        minuteLabel: minuteLabel(safeSecond, isFinished),
        phaseLabel: phaseLabel(safeSecond, finalSecond, isFinished, report.result.decidedByPenalties),
        isFinished,
        winnerLabel: winnerClub ? `ZWYCIĘZCA: ${winnerClub.name}` : undefined,
        home: {
          side: 'HOME',
          club: ctx.homeClub,
          logo: getClubLogo(ctx.homeClub.id),
          score: homeScore,
          penaltyScore: shootout?.home,
          kit: kitForSide(kits, 'HOME'),
          momentum: homeMomentum,
        },
        away: {
          side: 'AWAY',
          club: ctx.awayClub,
          logo: getClubLogo(ctx.awayClub.id),
          score: awayScore,
          penaltyScore: shootout?.away,
          kit: kitForSide(kits, 'AWAY'),
          momentum: awayMomentum,
        },
      },
      stats,
      players,
      pitchNodes,
      recentEvents: activeTimelineEvents.slice(-8).reverse(),
      allElapsedEvents: activeTimelineEvents,
      tactical: {
        availableFormations: TacticRepository.getAll().map(tactic => ({ id: tactic.id, name: tactic.name })),
        instructions: userInstructions,
        captainId,
        penaltyTakerId,
        freeKickTakerId,
        substitutionsUsed: elapsedEvents.filter(event => event.type === MatchEventType.SUBSTITUTION && event.side === userSide).length,
        substitutionsLimit: 5,
      },
      penaltyShootout: shootout,
      activePlayerId,
    };
  },
};
