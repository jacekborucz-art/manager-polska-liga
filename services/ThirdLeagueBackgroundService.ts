import { Club, Coach, Fixture, HealthStatus, InjurySeverity, Lineup, MatchStatus, Player, PlayerPosition, WeatherSnapshot } from '../types';
import { LeagueBackgroundMatchEngineV2 } from './LeagueBackgroundMatchEngine-ver2';
import { PlayerStatsService } from './PlayerStatsService';
import { RefereeService } from './RefereeService';

const THIRD_LEAGUE_ID = 'L_PL_4';

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return hash;
};

const seededRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const shuffle = <T,>(items: T[], seed: number): T[] => {
  const rng = seededRng(seed);
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const cloneLineup = (lineup: Lineup): Lineup => ({
  ...lineup,
  startingXI: [...lineup.startingXI],
  bench: [...lineup.bench],
  reserves: [...lineup.reserves],
});

const canPlayHiddenMatch = (player: Player): boolean =>
  player.health.status !== HealthStatus.INJURED &&
  (player.suspensionMatches || 0) <= 0 &&
  player.condition >= 55;

const hasUsableStartingXI = (lineup: Lineup | undefined, squad: Player[]): lineup is Lineup => {
  if (!lineup) return false;
  const availableIds = new Set(squad.filter(canPlayHiddenMatch).map(player => player.id));
  const starters = lineup.startingXI.filter((id): id is string => !!id && availableIds.has(id));
  return starters.length >= 11 && starters.some(id => squad.find(player => player.id === id)?.position === PlayerPosition.GK);
};

const fallbackCoach = (): Coach => ({
  id: 'THIRD_LEAGUE_FALLBACK_COACH',
  firstName: 'Trener',
  lastName: 'Tymczasowy',
  age: 45,
  nationality: 'Polska',
  nationalityFlag: 'PL',
  attributes: {
    experience: 45,
    decisionMaking: 45,
    motivation: 45,
    training: 45,
  },
  history: [],
  currentClubId: null,
  hiredDate: new Date(2025, 6, 1).toISOString(),
  contractEndDate: new Date(2027, 5, 30).toISOString(),
  annualSalary: 120000,
  expPoints: 0,
  blacklist: {},
  favoriteTactics: {
    offensive: '4-3-3',
    neutral: '4-4-2',
    defensive: '5-4-1',
  },
  seasonStats: [],
});

const applyMatchOutputToPlayers = (
  playersMap: Record<string, Player[]>,
  homeClubId: string,
  awayClubId: string,
  result: ReturnType<typeof LeagueBackgroundMatchEngineV2.simulate>,
  currentDate: Date
): Record<string, Player[]> => {
  const homeIds = new Set((playersMap[homeClubId] || []).map(player => player.id));
  const awayIds = new Set((playersMap[awayClubId] || []).map(player => player.id));

  let nextPlayers = PlayerStatsService.processMatchDayEndForClub(
    playersMap,
    homeClubId,
    result.playedPlayerIds.filter(id => homeIds.has(id))
  );
  nextPlayers = PlayerStatsService.processMatchDayEndForClub(
    nextPlayers,
    awayClubId,
    result.playedPlayerIds.filter(id => awayIds.has(id))
  );

  result.scorers.forEach(scorer => {
    if (!scorer.isMiss && !scorer.varDisallowed) {
      nextPlayers = PlayerStatsService.applyGoal(nextPlayers, scorer.playerId, scorer.assistId);
    }
  });

  result.cards.forEach(card => {
    nextPlayers = PlayerStatsService.applyCard(nextPlayers, card.playerId, card.type);
  });

  if (result.awayScore === 0) {
    const homeGkIds = (nextPlayers[homeClubId] || [])
      .filter(player => player.position === PlayerPosition.GK && result.playedPlayerIds.includes(player.id))
      .map(player => player.id);
    nextPlayers = PlayerStatsService.applyCleanSheet(nextPlayers, homeClubId, homeGkIds);
  }

  if (result.homeScore === 0) {
    const awayGkIds = (nextPlayers[awayClubId] || [])
      .filter(player => player.position === PlayerPosition.GK && result.playedPlayerIds.includes(player.id))
      .map(player => player.id);
    nextPlayers = PlayerStatsService.applyCleanSheet(nextPlayers, awayClubId, awayGkIds);
  }

  return {
    ...nextPlayers,
    [homeClubId]: (nextPlayers[homeClubId] || []).map(player => applyHiddenMatchPlayerState(player, result, currentDate)),
    [awayClubId]: (nextPlayers[awayClubId] || []).map(player => applyHiddenMatchPlayerState(player, result, currentDate)),
  };
};

const applyHiddenMatchPlayerState = (
  player: Player,
  result: ReturnType<typeof LeagueBackgroundMatchEngineV2.simulate>,
  currentDate: Date
): Player => {
  let updated = { ...player };

  if (result.fatigue[player.id] !== undefined) {
    updated.condition = Math.round(result.fatigue[player.id]);
  }

  if (result.fatigueDebtMap[player.id]) {
    updated.fatigueDebt = Math.min(100, Math.round((updated.fatigueDebt || 0) + result.fatigueDebtMap[player.id]));
  }

  if (result.ratings[player.id]) {
    updated.stats = {
      ...updated.stats,
      ratingHistory: [...(updated.stats.ratingHistory || []), result.ratings[player.id]],
    };
  }

  const injury = result.injuries.find(entry => entry.playerId === player.id);
  if (injury) {
    const conditionDrop = injury.severity === InjurySeverity.SEVERE ? 55 : 20;
    const conditionAtInjury = Math.max(0, updated.condition - conditionDrop);
    updated = {
      ...updated,
      condition: conditionAtInjury,
      health: {
        status: HealthStatus.INJURED,
        injury: {
          type: injury.type,
          daysRemaining: injury.days,
          severity: injury.severity,
          injuryDate: currentDate.toISOString(),
          totalDays: injury.days,
          conditionAtInjury,
        },
      },
    };
  }

  return updated;
};

const createHiddenFixture = (home: Club, away: Club, currentDate: Date, roundIndex: number): Fixture => ({
  id: `HIDDEN_L_PL_4_${currentDate.toISOString().split('T')[0]}_${roundIndex}_${home.id}_${away.id}`,
  leagueId: THIRD_LEAGUE_ID,
  homeTeamId: home.id,
  awayTeamId: away.id,
  date: currentDate,
  status: MatchStatus.SCHEDULED,
  homeScore: null,
  awayScore: null,
});

export const ThirdLeagueBackgroundService = {
  simulateMatchday: (
    currentDate: Date,
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    lineups: Record<string, Lineup>,
    coaches: Record<string, Coach>,
    weather: WeatherSnapshot,
    sessionSeed: number
  ): Record<string, Player[]> => {
    const eligibleClubs = clubs.filter(club => club.leagueId === THIRD_LEAGUE_ID && club.isDefaultActive);
    if (eligibleClubs.length < 2) return playersMap;

    const dateKey = currentDate.toISOString().split('T')[0];
    const shuffledClubs = shuffle(eligibleClubs, hashString(`${dateKey}_${sessionSeed}_L_PL_4`));
    let currentPlayers = playersMap;

    for (let i = 0; i < shuffledClubs.length - 1; i += 2) {
      const home = shuffledClubs[i];
      const away = shuffledClubs[i + 1];
      const homePlayers = currentPlayers[home.id] || [];
      const awayPlayers = currentPlayers[away.id] || [];
      const homeLineup = lineups[home.id];
      const awayLineup = lineups[away.id];

      if (!hasUsableStartingXI(homeLineup, homePlayers) || !hasUsableStartingXI(awayLineup, awayPlayers)) continue;

      const fixture = createHiddenFixture(home, away, currentDate, i / 2);
      const referee = RefereeService.assignPolishReferee(fixture.id, 4);
      const seed = hashString(`${fixture.id}_${sessionSeed}_${home.id}_${away.id}`);
      const homeCoach = coaches[home.coachId || ''] || fallbackCoach();
      const awayCoach = coaches[away.coachId || ''] || fallbackCoach();

      const result = LeagueBackgroundMatchEngineV2.simulate(
        fixture,
        home,
        away,
        homePlayers,
        awayPlayers,
        cloneLineup(homeLineup),
        cloneLineup(awayLineup),
        homeCoach,
        awayCoach,
        referee,
        weather,
        seed
      );

      currentPlayers = applyMatchOutputToPlayers(currentPlayers, home.id, away.id, result, currentDate);
    }

    return currentPlayers;
  },
};
