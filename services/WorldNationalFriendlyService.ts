import { NationalTeam, WCQPlayoffState } from '../types';
import { NTGroupMatch, NTMatchDay, NT_SCHEDULE_BY_YEAR } from '../resources/NationalTeamSchedule';

const WORLD_FRIENDLY_LABEL = 'Mecze towarzyskie reprezentacji';
const WORLD_PLAYOFF_WINDOW_FRIENDLY_LABEL = 'Mecze towarzyskie reprezentacji - okno barażowe';
export const WORLD_FRIENDLY_GROUP = 'WORLD_FRIENDLY';
const MAX_WORLD_FRIENDLY_PAIRS = 30;
const MARCH_PLAYOFF_FRIENDLY_PAIRS = 38;

class Rng {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0 || 1;
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }
}

const hash = (value: string): number => {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = ((h << 5) - h + value.charCodeAt(i)) | 0;
  return h >>> 0;
};

const shuffle = <T,>(items: T[], rng: Rng): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const isWorldFriendlyDate = (matchDay: NTMatchDay): boolean =>
  [8, 9, 10].includes(matchDay.month) &&
  (matchDay.eventType === undefined || matchDay.eventType === 'GROUP_MATCH') &&
  matchDay.matches.length > 0;

const getPlayoffTeamNames = (playoffState: WCQPlayoffState | null): Set<string> => new Set(
  (playoffState?.paths ?? []).flatMap(path => [
    path.sf1Home,
    path.sf1Away,
    path.sf2Home,
    path.sf2Away,
  ])
);

const buildReputationBalancedMatches = (
  teams: NationalTeam[],
  pairLimit: number,
  group: string,
  label: string,
  rng: Rng
): NTGroupMatch[] => {
  const remaining = shuffle(teams, rng)
    .sort((a, b) => b.reputation - a.reputation || a.name.localeCompare(b.name));
  const matches: NTGroupMatch[] = [];

  while (remaining.length >= 2 && matches.length < pairLimit) {
    const home = remaining.shift();
    if (!home) break;

    const maxReputationGap = rng.next() < 0.001 ? Number.POSITIVE_INFINITY : 5;
    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;

    remaining.forEach((candidate, idx) => {
      const gap = Math.abs(home.reputation - candidate.reputation);
      if (gap > maxReputationGap) return;
      const sameContinentBonus = home.continent === candidate.continent ? -0.35 : 0;
      const score = gap + sameContinentBonus + rng.next() * 0.25;
      if (score < bestScore) {
        bestScore = score;
        bestIndex = idx;
      }
    });

    if (bestIndex === -1) {
      remaining.unshift(home);
      break;
    }

    const [away] = remaining.splice(bestIndex, 1);
    matches.push({
      home: home.name,
      away: away.name,
      group,
      competitionLabel: label,
    });
  }

  return matches;
};

export const WorldNationalFriendlyService = {
  getPlannedFriendlyDates(seasonStartYear: number): Date[] {
    return (NT_SCHEDULE_BY_YEAR[seasonStartYear] ?? [])
      .filter(isWorldFriendlyDate)
      .map(matchDay => new Date(seasonStartYear, matchDay.month, matchDay.day));
  },

  generateMatchDay(matchDay: NTMatchDay, nationalTeams: NationalTeam[], seasonStartYear: number, sessionSeed: number): NTMatchDay | null {
    if (!isWorldFriendlyDate(matchDay)) return null;

    const rng = new Rng(hash(`${seasonStartYear}|${sessionSeed}|WORLD_NT_FRIENDLIES|${matchDay.month}|${matchDay.day}`));
    const teams = nationalTeams.filter(team => team.continent !== 'Europe');
    const matches = buildReputationBalancedMatches(teams, MAX_WORLD_FRIENDLY_PAIRS, WORLD_FRIENDLY_GROUP, WORLD_FRIENDLY_LABEL, rng);

    if (matches.length === 0) return null;

    return {
      day: matchDay.day,
      month: matchDay.month,
      competitionLabel: WORLD_FRIENDLY_LABEL,
      matches,
    };
  },

  getMarchPlayoffFriendlyDates(): Date[] {
    return [
      new Date(2026, 2, 17),
      new Date(2026, 2, 20),
    ];
  },

  generatePlayoffWindowMatchDay(date: Date, nationalTeams: NationalTeam[], playoffState: WCQPlayoffState | null, sessionSeed: number): NTMatchDay | null {
    const isSupportedDate = date.getFullYear() === 2026 &&
      date.getMonth() === 2 &&
      (date.getDate() === 17 || date.getDate() === 20);
    if (!isSupportedDate || !playoffState?.drawCompleted) return null;

    const playoffTeamNames = getPlayoffTeamNames(playoffState);
    const eligibleTeams = nationalTeams.filter(team => !playoffTeamNames.has(team.name));
    const rng = new Rng(hash(`2026|${sessionSeed}|MARCH_PLAYOFF_WORLD_NT_FRIENDLIES|${date.getDate()}`));
    const matches = buildReputationBalancedMatches(
      eligibleTeams,
      MARCH_PLAYOFF_FRIENDLY_PAIRS,
      WORLD_FRIENDLY_GROUP,
      WORLD_PLAYOFF_WINDOW_FRIENDLY_LABEL,
      rng
    );

    if (matches.length === 0) return null;

    return {
      day: date.getDate(),
      month: date.getMonth(),
      competitionLabel: WORLD_PLAYOFF_WINDOW_FRIENDLY_LABEL,
      matches,
    };
  },
};
