import { Club, Fixture, Lineup, MailMessage, MailType, MatchHistoryEntry, MatchStatus, Player, PlayerPosition } from '../types';
import { TacticRepository } from '../resources/tactics_db';
import { getActiveClubKits } from '../resources/ClubKits';
import { KitSelectionService } from './KitSelectionService';

type PlayerMap = Record<string, Player[]>;

interface TeamOfWeekCandidate {
  player: Player;
  club: Club;
  rating: number;
  selectionScore: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  savedPenalties: number;
}

export interface TeamOfWeekBuildContext {
  leagueId: string;
  leagueName: string;
  date: Date;
  seasonNumber: number;
  fixtures: Fixture[];
  clubs: Club[];
  players: PlayerMap;
  lineups: Record<string, Lineup>;
  matchHistory: MatchHistoryEntry[];
  liveRatings?: Record<string, number>;
}

const POSITION_QUOTAS: Record<PlayerPosition, number> = {
  [PlayerPosition.GK]: 1,
  [PlayerPosition.DEF]: 4,
  [PlayerPosition.MID]: 4,
  [PlayerPosition.FWD]: 2,
};

const getDateKey = (date: Date): string => date.toDateString();

const getRoundNumber = (fixtures: Fixture[], leagueId: string, date: Date): number => {
  const playedDates = Array.from(new Set(
    fixtures
      .filter(f => f.leagueId === leagueId)
      .filter(f => {
        const fixtureDate = f.date instanceof Date ? f.date : new Date(f.date);
        return !Number.isNaN(fixtureDate.getTime()) && fixtureDate.getTime() <= date.getTime();
      })
      .map(f => getDateKey(f.date instanceof Date ? f.date : new Date(f.date)))
  ));

  return Math.max(1, playedDates.length);
};

const getPlayerClub = (playerId: string, players: PlayerMap, clubs: Club[]): { player: Player; club: Club } | null => {
  for (const [clubId, squad] of Object.entries(players)) {
    const player = squad.find(p => p.id === playerId);
    if (!player) continue;
    const club = clubs.find(c => c.id === clubId);
    if (!club) return null;
    return { player, club };
  }
  return null;
};

const resolvePlayerId = (
  playerId: string | undefined,
  playerName: string | undefined,
  teamId: string,
  players: PlayerMap
): string | null => {
  if (playerId) return playerId;
  if (!playerName) return null;

  const normalized = playerName.trim().toLowerCase();
  const squad = players[teamId] ?? [];
  const exact = squad.find(player =>
    `${player.firstName} ${player.lastName}`.trim().toLowerCase() === normalized ||
    player.lastName.trim().toLowerCase() === normalized
  );

  return exact?.id ?? null;
};

const selectBestByFormation = (candidates: TeamOfWeekCandidate[]): TeamOfWeekCandidate[] => {
  const sorted = [...candidates].sort((a, b) =>
    b.selectionScore - a.selectionScore ||
    b.rating - a.rating ||
    b.goals - a.goals ||
    b.assists - a.assists ||
    Number(b.cleanSheet) - Number(a.cleanSheet) ||
    b.savedPenalties - a.savedPenalties ||
    b.player.overallRating - a.player.overallRating
  );
  const selected: TeamOfWeekCandidate[] = [];
  const selectedIds = new Set<string>();
  const clubCounts = new Map<string, number>();

  const pickForPosition = (position: PlayerPosition, maxPerClub: number) => {
    const quota = POSITION_QUOTAS[position];
    const picked = sorted.filter(candidate => {
      if (candidate.player.position !== position) return false;
      if (selectedIds.has(candidate.player.id)) return false;
      if ((clubCounts.get(candidate.club.id) ?? 0) >= maxPerClub) return false;
      return true;
    }).slice(0, quota);

    picked.forEach(candidate => {
      selected.push(candidate);
      selectedIds.add(candidate.player.id);
      clubCounts.set(candidate.club.id, (clubCounts.get(candidate.club.id) ?? 0) + 1);
    });
  };

  Object.values(PlayerPosition).forEach(position => pickForPosition(position, 2));

  if (selected.length < 11) {
    Object.values(PlayerPosition).forEach(position => {
      const needed = POSITION_QUOTAS[position] - selected.filter(candidate => candidate.player.position === position).length;
      if (needed <= 0) return;
      sorted
        .filter(candidate => candidate.player.position === position && !selectedIds.has(candidate.player.id))
        .slice(0, needed)
        .forEach(candidate => {
          selected.push(candidate);
          selectedIds.add(candidate.player.id);
        });
    });
  }

  if (selected.length < 11) {
    sorted
      .filter(candidate => !selectedIds.has(candidate.player.id))
      .slice(0, 11 - selected.length)
      .forEach(candidate => selected.push(candidate));
  }

  return selected.slice(0, 11);
};

interface PlayerRoundImpact {
  goals: number;
  assists: number;
  cleanSheet: boolean;
  savedPenalties: number;
  cardPenalty: number;
}

const emptyImpact = (): PlayerRoundImpact => ({
  goals: 0,
  assists: 0,
  cleanSheet: false,
  savedPenalties: 0,
  cardPenalty: 0,
});

const calculateSelectionScore = (player: Player, rating: number, impact: PlayerRoundImpact): number => {
  let score = rating;

  const goalWeight = player.position === PlayerPosition.DEF ? 1.15 : player.position === PlayerPosition.MID ? 1.0 : 0.85;
  score += impact.goals * goalWeight;
  score += impact.assists * 0.55;

  if (impact.goals >= 3) score += 1.6;
  else if (impact.goals === 2) score += 0.45;

  if (impact.cleanSheet) {
    if (player.position === PlayerPosition.GK) score += 1.1;
    if (player.position === PlayerPosition.DEF) score += 0.75;
  }

  score += impact.savedPenalties * 1.5;
  score -= impact.cardPenalty;

  return Math.round(score * 100) / 100;
};

export const LeagueTeamOfWeekService = {
  buildMail: (context: TeamOfWeekBuildContext): MailMessage | null => {
    const dateKey = getDateKey(context.date);
    const leagueFixtures = context.fixtures.filter(fixture => {
      const fixtureDate = fixture.date instanceof Date ? fixture.date : new Date(fixture.date);
      return fixture.leagueId === context.leagueId && getDateKey(fixtureDate) === dateKey;
    });

    if (leagueFixtures.length === 0) return null;
    if (!leagueFixtures.some(fixture => fixture.status === MatchStatus.FINISHED)) return null;
    if (!leagueFixtures.every(fixture => fixture.status === MatchStatus.FINISHED)) return null;

    const ratingsByPlayer = new Map<string, number>();
    const impactsByPlayer = new Map<string, PlayerRoundImpact>();
    const finishedFixtureIds = new Set(leagueFixtures.map(fixture => fixture.id));

    context.matchHistory
      .filter(entry => entry.season === context.seasonNumber && finishedFixtureIds.has(entry.matchId))
      .forEach(entry => {
        Object.entries(entry.ratings ?? {}).forEach(([playerId, rating]) => ratingsByPlayer.set(playerId, rating));

        const homeCleanSheet = entry.awayScore === 0;
        const awayCleanSheet = entry.homeScore === 0;
        (entry.homeLineup ?? []).forEach(playerId => {
          if (!impactsByPlayer.has(playerId)) impactsByPlayer.set(playerId, emptyImpact());
          impactsByPlayer.get(playerId)!.cleanSheet ||= homeCleanSheet;
        });
        (entry.awayLineup ?? []).forEach(playerId => {
          if (!impactsByPlayer.has(playerId)) impactsByPlayer.set(playerId, emptyImpact());
          impactsByPlayer.get(playerId)!.cleanSheet ||= awayCleanSheet;
        });

        (entry.goals ?? []).forEach(goal => {
          if (goal.varDisallowed) return;

          const scorerId = resolvePlayerId(goal.playerId, goal.playerName, goal.teamId, context.players);
          const assistantId = resolvePlayerId(goal.assistantId, goal.assistantName, goal.teamId, context.players);

          if (goal.isPenalty && goal.isMiss) {
            const defendingTeamId = goal.teamId === entry.homeTeamId ? entry.awayTeamId : entry.homeTeamId;
            const defendingLineup = goal.teamId === entry.homeTeamId ? entry.awayLineup : entry.homeLineup;
            const goalkeeperId = (defendingLineup ?? []).find(playerId => {
              const resolved = getPlayerClub(playerId, context.players, context.clubs);
              return resolved?.player.position === PlayerPosition.GK;
            });
            if (goalkeeperId) {
              if (!impactsByPlayer.has(goalkeeperId)) impactsByPlayer.set(goalkeeperId, emptyImpact());
              impactsByPlayer.get(goalkeeperId)!.savedPenalties += 1;
            } else {
              const squadGoalkeeper = (context.players[defendingTeamId] ?? []).find(player => player.position === PlayerPosition.GK);
              if (squadGoalkeeper) {
                if (!impactsByPlayer.has(squadGoalkeeper.id)) impactsByPlayer.set(squadGoalkeeper.id, emptyImpact());
                impactsByPlayer.get(squadGoalkeeper.id)!.savedPenalties += 1;
              }
            }
            return;
          }

          if (scorerId) {
            if (!impactsByPlayer.has(scorerId)) impactsByPlayer.set(scorerId, emptyImpact());
            impactsByPlayer.get(scorerId)!.goals += 1;
          }

          if (assistantId) {
            if (!impactsByPlayer.has(assistantId)) impactsByPlayer.set(assistantId, emptyImpact());
            impactsByPlayer.get(assistantId)!.assists += 1;
          }
        });

        (entry.cards ?? []).forEach(card => {
          const playerId = resolvePlayerId(card.playerId, card.playerName, card.teamId, context.players);
          if (!playerId) return;
          if (!impactsByPlayer.has(playerId)) impactsByPlayer.set(playerId, emptyImpact());
          impactsByPlayer.get(playerId)!.cardPenalty += card.type === 'YELLOW' ? 0.25 : 1.4;
        });
      });

    Object.entries(context.liveRatings ?? {}).forEach(([playerId, rating]) => ratingsByPlayer.set(playerId, rating));

    if (ratingsByPlayer.size === 0) return null;

    const candidates: TeamOfWeekCandidate[] = [];
    ratingsByPlayer.forEach((rating, playerId) => {
      const resolved = getPlayerClub(playerId, context.players, context.clubs);
      if (!resolved) return;
      if (resolved.club.leagueId !== context.leagueId) return;
      const impact = impactsByPlayer.get(playerId) ?? emptyImpact();
      candidates.push({
        ...resolved,
        rating,
        selectionScore: calculateSelectionScore(resolved.player, rating, impact),
        goals: impact.goals,
        assists: impact.assists,
        cleanSheet: impact.cleanSheet,
        savedPenalties: impact.savedPenalties,
      });
    });

    const selected = selectBestByFormation(candidates);
    if (selected.length < 11) return null;

    const tactic = TacticRepository.getById('4-4-2');
    const roundNumber = getRoundNumber(context.fixtures, context.leagueId, context.date);
    const team = selected.map((candidate, index) => {
      const kit = getActiveClubKits(candidate.club)[0];
      return {
        slotIndex: index,
        role: tactic.slots[index]?.role ?? candidate.player.position,
        x: tactic.slots[index]?.x ?? 0.5,
        y: tactic.slots[index]?.y ?? 0.5,
        playerId: candidate.player.id,
        playerName: `${candidate.player.firstName} ${candidate.player.lastName}`,
        clubId: candidate.club.id,
        clubName: candidate.club.name,
        position: candidate.player.position,
        rating: candidate.rating,
        overallRating: candidate.player.overallRating,
        shirt: kit.shirt,
        shirtSecondary: kit.shirtSecondary,
        shorts: kit.shorts,
        socks: kit.socks,
        pattern: kit.pattern,
        labelColor: KitSelectionService.isColorLight(kit.shirt) ? '#000000' : '#ffffff',
      };
    });

    return {
      id: `TEAM_OF_WEEK_${context.leagueId}_${context.seasonNumber}_${dateKey}`,
      sender: 'Gazeta Sportowa',
      role: 'Redakcja sportowa',
      subject: `Gazeta Sportowa - Jedenastka ${roundNumber}. tygodnia (${context.leagueName})`,
      body: [
        `Redakcja Gazety Sportowej przedstawia najlepszą jedenastkę ${roundNumber}. tygodnia rozgrywek. Po emocjonujących spotkaniach wybraliśmy zawodników, którzy wyróżnili się najwyższą formą, skutecznością oraz wpływem na wyniki swoich drużyn.`,
        '',
        'W zestawieniu nie zabrakło bohaterów hitowych spotkań, skutecznych napastników, kreatywnych pomocników oraz defensorów, którzy zachowali zimną krew w kluczowych momentach. Kilku zawodników po raz pierwszy znalazło się w naszym zestawieniu, potwierdzając rosnącą formę i aspiracje do walki o najwyższe cele.',
        '',
        `Poniżej prezentujemy pełną Jedenastkę ${roundNumber}. tygodnia wraz z ocenami zawodników.`,
      ].join('\n'),
      date: new Date(context.date),
      isRead: false,
      type: MailType.MEDIA,
      priority: 82,
      metadata: {
        type: 'TEAM_OF_WEEK',
        leagueId: context.leagueId,
        leagueName: context.leagueName,
        roundNumber,
        formation: '4-4-2',
        team,
      },
    };
  },
};
