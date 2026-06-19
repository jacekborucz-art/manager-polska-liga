import { MatchHistoryEntry, NationalTeam } from '../types';

export interface FifaRankingEntry {
  teamId: string;
  teamName: string;
  rank: number;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
}

const FIFA_STARTING_POINTS: Record<string, number> = {
  Argentyna: 1874.81,
  Hiszpania: 1876.4,
  Francja: 1877.32,
  Anglia: 1825.97,
  Portugalia: 1778.28,
  Brazylia: 1761.6,
  Maroko: 1756.27,
  Holandia: 1752.44,
  Belgia: 1742.24,
  Niemcy: 1735.77,
  Chorwacja: 1714.87,
  Włochy: 1704.73,
  Kolumbia: 1698.35,
  Meksyk: 1687.48,
  Senegal: 1684.07,
  Urugwaj: 1673.07,
};

const CONTINENT_BASE_BONUS: Record<string, number> = {
  Europe: 42,
  'South America': 38,
  Africa: 20,
  'North America': 14,
  Asia: 6,
  Oceania: 0,
};

const getInitialPoints = (team: NationalTeam): number => {
  const explicit = FIFA_STARTING_POINTS[team.name];
  if (explicit !== undefined) return explicit;

  const tierBase: Record<number, number> = {
    1: 1660,
    2: 1440,
    3: 1220,
    4: 980,
    5: 760,
  };
  const base = tierBase[team.tier] ?? 760;
  const reputationBonus = team.reputation * 14;
  const continentBonus = CONTINENT_BASE_BONUS[team.continent] ?? 0;
  return Math.round((base + reputationBonus + continentBonus) * 100) / 100;
};

const normalizeDateTime = (value: string): number => {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const getMatchImportance = (competition: string): number => {
  const c = competition.toLowerCase();
  if (c.includes('mistrzostw świata') || c.includes('world cup')) return 50;
  if (c.includes('euro') || c.includes('copa') || c.includes('afcon') || c.includes('gold cup') || c.includes('puchar azji')) return 35;
  if (c.includes('kwalifikacje') || c.includes('qualif')) return 25;
  if (c.includes('liga narodów') || c.includes('nations league')) return 15;
  if (c.includes('towarzyski') || c.includes('friendly')) return 10;
  return 15;
};

const getResultWeight = (
  match: MatchHistoryEntry,
  side: 'home' | 'away'
): number => {
  if (match.homeScore === match.awayScore) {
    if (match.penaltyWinner) {
      const wonPens = side === 'home'
        ? match.penaltyWinner === match.homeTeamId
        : match.penaltyWinner === match.awayTeamId;
      return wonPens ? 0.75 : 0.5;
    }
    return 0.5;
  }

  const won = side === 'home'
    ? match.homeScore > match.awayScore
    : match.awayScore > match.homeScore;
  return won ? 1 : 0;
};

const getExpectedResult = (teamPoints: number, opponentPoints: number): number =>
  1 / (10 ** ((opponentPoints - teamPoints) / 600) + 1);

const roundPoints = (value: number): number => Math.round(value * 100) / 100;

export const FifaRankingService = {
  buildRanking(nationalTeams: NationalTeam[], matchHistory: MatchHistoryEntry[]): FifaRankingEntry[] {
    const teamsById = new Map(nationalTeams.map(team => [team.id, team]));
    const stats = new Map<string, Omit<FifaRankingEntry, 'rank'>>();

    nationalTeams.forEach(team => {
      stats.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        points: getInitialPoints(team),
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
      });
    });

    [...matchHistory]
      .filter(match => teamsById.has(match.homeTeamId) && teamsById.has(match.awayTeamId))
      .sort((a, b) =>
        normalizeDateTime(a.date) - normalizeDateTime(b.date) ||
        a.matchId.localeCompare(b.matchId)
      )
      .forEach(match => {
        const home = stats.get(match.homeTeamId);
        const away = stats.get(match.awayTeamId);
        if (!home || !away) return;

        const homeBefore = home.points;
        const awayBefore = away.points;
        const importance = getMatchImportance(match.competition);
        const homeWeight = getResultWeight(match, 'home');
        const awayWeight = getResultWeight(match, 'away');
        const homeExpected = getExpectedResult(homeBefore, awayBefore);
        const awayExpected = getExpectedResult(awayBefore, homeBefore);

        home.points = roundPoints(homeBefore + importance * (homeWeight - homeExpected));
        away.points = roundPoints(awayBefore + importance * (awayWeight - awayExpected));
        home.played += 1;
        away.played += 1;

        if (homeWeight === awayWeight) {
          home.draws += 1;
          away.draws += 1;
        } else if (homeWeight > awayWeight) {
          home.wins += 1;
          away.losses += 1;
        } else {
          away.wins += 1;
          home.losses += 1;
        }
      });

    return [...stats.values()]
      .sort((a, b) =>
        b.points - a.points ||
        (teamsById.get(a.teamId)?.tier ?? 9) - (teamsById.get(b.teamId)?.tier ?? 9) ||
        b.wins - a.wins ||
        a.teamName.localeCompare(b.teamName, 'pl')
      )
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        points: roundPoints(entry.points),
      }));
  },
};
