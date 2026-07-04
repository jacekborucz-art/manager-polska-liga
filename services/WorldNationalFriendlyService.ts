import { NationalTeam, WCQPlayoffState } from '../types';
import { NTGroupMatch, NTMatchDay, NT_SCHEDULE_BY_YEAR } from '../resources/NationalTeamSchedule';

const WORLD_FRIENDLY_LABEL = 'Mecze towarzyskie reprezentacji';
const WORLD_PLAYOFF_WINDOW_FRIENDLY_LABEL = 'Mecze towarzyskie reprezentacji - okno barażowe';
export const WORLD_FRIENDLY_GROUP = 'WORLD_FRIENDLY';
const MAX_WORLD_FRIENDLY_PAIRS = 30;
const MARCH_PLAYOFF_FRIENDLY_PAIRS = 38;
const REGULAR_WORLD_FRIENDLY_DATES = [
  { day: 4, month: 8 },
  { day: 7, month: 8 },
  { day: 8, month: 9 },
  { day: 11, month: 9 },
  { day: 14, month: 10 },
  { day: 17, month: 10 },
];

type FriendlyDateSlot = { day: number; month: number };

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

const getPairKey = (firstTeam: string, secondTeam: string): string =>
  [firstTeam, secondTeam].sort((a, b) => a.localeCompare(b)).join('|');

const isWorldFriendlyDate = (matchDay: NTMatchDay): boolean =>
  [8, 9, 10].includes(matchDay.month) &&
  (matchDay.eventType === undefined || matchDay.eventType === 'GROUP_MATCH') &&
  matchDay.matches.length > 0;

const isEarlierFriendlySlot = (candidate: FriendlyDateSlot, current: FriendlyDateSlot): boolean =>
  candidate.month < current.month ||
  (candidate.month === current.month && candidate.day < current.day);

const getRegularFriendlySlots = (seasonStartYear: number): FriendlyDateSlot[] => {
  const byKey = new Map<string, FriendlyDateSlot>();
  const addSlot = (slot: FriendlyDateSlot) => byKey.set(`${slot.month}_${slot.day}`, slot);

  REGULAR_WORLD_FRIENDLY_DATES.forEach(addSlot);
  (NT_SCHEDULE_BY_YEAR[seasonStartYear] ?? [])
    .filter(isWorldFriendlyDate)
    .forEach(matchDay => addSlot({ day: matchDay.day, month: matchDay.month }));

  return [...byKey.values()].sort((a, b) => a.month - b.month || a.day - b.day);
};

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
  rng: Rng,
  usedPairKeys: Set<string> = new Set()
): NTGroupMatch[] => {
  const remaining = shuffle(teams, rng)
    .sort((a, b) => b.reputation - a.reputation || a.name.localeCompare(b.name));
  const matches: NTGroupMatch[] = [];
  let stalledHomes = 0;

  while (remaining.length >= 2 && matches.length < pairLimit && stalledHomes < remaining.length) {
    const home = remaining.shift();
    if (!home) break;

    const maxReputationGap = rng.next() < 0.001 ? Number.POSITIVE_INFINITY : 5;
    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;

    const findBestCandidate = (allowedReputationGap: number): void => {
      remaining.forEach((candidate, idx) => {
        if (usedPairKeys.has(getPairKey(home.name, candidate.name))) return;
        const gap = Math.abs(home.reputation - candidate.reputation);
        if (gap > allowedReputationGap) return;
        const sameContinentBonus = home.continent === candidate.continent ? -0.35 : 0;
        const score = gap + sameContinentBonus + rng.next() * 0.25;
        if (score < bestScore) {
          bestScore = score;
          bestIndex = idx;
        }
      });
    };

    findBestCandidate(maxReputationGap);
    if (bestIndex === -1 && maxReputationGap !== Number.POSITIVE_INFINITY) {
      findBestCandidate(Number.POSITIVE_INFINITY);
    }

    if (bestIndex === -1) {
      remaining.push(home);
      stalledHomes++;
      continue;
    }

    stalledHomes = 0;
    const [away] = remaining.splice(bestIndex, 1);
    usedPairKeys.add(getPairKey(home.name, away.name));
    matches.push({
      home: home.name,
      away: away.name,
      group,
      competitionLabel: label,
    });
  }

  return matches;
};

const getStableTeamPool = (teams: NationalTeam[]): NationalTeam[] =>
  [...teams].sort((a, b) =>
    a.name.localeCompare(b.name) ||
    a.id.localeCompare(b.id)
  );

const collectRegularFriendlyPairHistory = (
  currentMatchDay: NTMatchDay,
  nationalTeams: NationalTeam[],
  seasonStartYear: number,
  sessionSeed: number
): Set<string> => {
  const usedPairKeys = new Set<string>();
  const eligibleTeams = getStableTeamPool(nationalTeams.filter(team => team.continent !== 'Europe'));

  getRegularFriendlySlots(seasonStartYear)
    .filter(slot => isEarlierFriendlySlot(slot, currentMatchDay))
    .forEach(slot => {
      const rng = new Rng(hash(`${seasonStartYear}|${sessionSeed}|WORLD_NT_FRIENDLIES|${slot.month}|${slot.day}`));
      buildReputationBalancedMatches(
        eligibleTeams,
        MAX_WORLD_FRIENDLY_PAIRS,
        WORLD_FRIENDLY_GROUP,
        WORLD_FRIENDLY_LABEL,
        rng,
        usedPairKeys
      );
    });

  return usedPairKeys;
};

const buildMarchPlayoffFriendlyMatchDays = (
  nationalTeams: NationalTeam[],
  playoffState: WCQPlayoffState | null,
  sessionSeed: number
): NTMatchDay[] => {
  if (!playoffState?.drawCompleted) return [];

  const usedPairKeys = new Set<string>();
  const playoffTeamNames = getPlayoffTeamNames(playoffState);
  const eligibleTeams = getStableTeamPool(nationalTeams.filter(team => !playoffTeamNames.has(team.name)));

  return WorldNationalFriendlyService.getMarchPlayoffFriendlyDates()
    .map(friendlyDate => {
      const rng = new Rng(hash(`2026|${sessionSeed}|MARCH_PLAYOFF_WORLD_NT_FRIENDLIES|${friendlyDate.getDate()}`));
      const matches = buildReputationBalancedMatches(
        eligibleTeams,
        MARCH_PLAYOFF_FRIENDLY_PAIRS,
        WORLD_FRIENDLY_GROUP,
        WORLD_PLAYOFF_WINDOW_FRIENDLY_LABEL,
        rng,
        usedPairKeys
      );

      if (matches.length === 0) return null;

      return {
        day: friendlyDate.getDate(),
        month: friendlyDate.getMonth(),
        competitionLabel: WORLD_PLAYOFF_WINDOW_FRIENDLY_LABEL,
        matches,
      };
    })
    .filter((matchDay): matchDay is NTMatchDay => Boolean(matchDay));
};

export const WorldNationalFriendlyService = {
  getPlannedFriendlyDates(seasonStartYear: number): Date[] {
    return getRegularFriendlySlots(seasonStartYear)
      .map(slot => new Date(seasonStartYear, slot.month, slot.day));
  },

  generateMatchDay(matchDay: NTMatchDay, nationalTeams: NationalTeam[], seasonStartYear: number, sessionSeed: number): NTMatchDay | null {
    if (!isWorldFriendlyDate(matchDay)) return null;

    const rng = new Rng(hash(`${seasonStartYear}|${sessionSeed}|WORLD_NT_FRIENDLIES|${matchDay.month}|${matchDay.day}`));
    const teams = getStableTeamPool(nationalTeams.filter(team => team.continent !== 'Europe'));
    const usedPairKeys = collectRegularFriendlyPairHistory(matchDay, nationalTeams, seasonStartYear, sessionSeed);
    const matches = buildReputationBalancedMatches(teams, MAX_WORLD_FRIENDLY_PAIRS, WORLD_FRIENDLY_GROUP, WORLD_FRIENDLY_LABEL, rng, usedPairKeys);

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

  generatePlayoffWindowMatchDays(nationalTeams: NationalTeam[], playoffState: WCQPlayoffState | null, sessionSeed: number): NTMatchDay[] {
    return buildMarchPlayoffFriendlyMatchDays(nationalTeams, playoffState, sessionSeed);
  },

  generatePlayoffWindowMatchDay(date: Date, nationalTeams: NationalTeam[], playoffState: WCQPlayoffState | null, sessionSeed: number): NTMatchDay | null {
    const isSupportedDate = date.getFullYear() === 2026 &&
      date.getMonth() === 2 &&
      (date.getDate() === 17 || date.getDate() === 20);
    if (!isSupportedDate || !playoffState?.drawCompleted) return null;

    return buildMarchPlayoffFriendlyMatchDays(nationalTeams, playoffState, sessionSeed)
      .find(matchDay => matchDay.day === date.getDate() && matchDay.month === date.getMonth()) ?? null;
  },
};
