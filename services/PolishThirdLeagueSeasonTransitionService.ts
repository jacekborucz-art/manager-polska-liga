import { Club, Player } from '../types';
import {
  PolishThirdLeagueService,
  THIRD_LEAGUE_GROUP_IDS,
  ThirdLeagueGroupId,
} from './PolishThirdLeagueService';
import { ReserveTeamLeagueService } from './ReserveTeamLeagueService';
import {
  FOURTH_LEAGUE_IDS,
  PolishFourthLeagueService,
  PolishFourthLeagueState,
} from './PolishFourthLeagueService';

export interface ThirdLeaguePlayoffMatch {
  id: string;
  stage: 'RUNNERS_UP' | 'FOURTH_LEAGUE_RUNNERS_UP' | 'SECOND_LEAGUE_FIRST_LEG' | 'SECOND_LEAGUE_SECOND_LEG';
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  winnerClubId?: string;
}

export interface ThirdLeagueSeasonResolution {
  promotedToSecondLeagueIds: string[];
  relegatedFromSecondLeagueByGroup: Record<ThirdLeagueGroupId, string[]>;
  relegatedToFeederIds: string[];
  promotedFromFeederByGroup: Record<ThirdLeagueGroupId, string[]>;
  nextLeagueByClubId: Map<string, string>;
  playoffMatches: ThirdLeaguePlayoffMatch[];
}

export interface ThirdLeagueResolutionOverrides {
  /** Winners of the runners-up round already drawn on 24 May. */
  challengerIds?: string[];
  /** Interactive II-liga tie outcomes which must override background simulation. */
  finalOutcomes?: Array<{ winnerId: string; loserId: string } | undefined>;
}

const hash = (value: string): number => {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
};

const rngFor = (seed: number, key: string): (() => number) => {
  let state = (seed ^ hash(key)) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const table = (clubs: Club[], leagueId: string): Club[] => clubs
  .filter(club => club.leagueId === leagueId && club.isDefaultActive)
  .sort((a, b) =>
    b.stats.points - a.stats.points ||
    b.stats.goalDifference - a.stats.goalDifference ||
    b.stats.goalsFor - a.stats.goalsFor ||
    a.id.localeCompare(b.id)
  );

const squadStrength = (club: Club, players: Record<string, Player[]>): number => {
  const bestEighteen = [...(players[club.id] ?? [])]
    .filter(player => player.health.status !== 'INJURED')
    .sort((a, b) => b.overallRating - a.overallRating)
    .slice(0, 18);
  const squadAverage = bestEighteen.length
    ? bestEighteen.reduce((sum, player) => sum + player.overallRating, 0) / bestEighteen.length
    : 35 + club.reputation * 2;
  return squadAverage + club.reputation * 1.5 + Math.min(4, club.stats.points / 20);
};

const simulateScore = (
  home: Club,
  away: Club,
  players: Record<string, Player[]>,
  seed: number,
  key: string
): { home: number; away: number } => {
  const rng = rngFor(seed, key);
  const difference = squadStrength(home, players) - squadStrength(away, players);
  const homeExpected = Math.max(0.25, Math.min(3.3, 1.35 + difference / 18 + 0.22));
  const awayExpected = Math.max(0.2, Math.min(3.0, 1.15 - difference / 18));
  const goals = (expected: number): number => {
    // A compact Poisson sampler is deterministic and produces football-like
    // low scores while still making squad quality materially affect the tie.
    const limit = Math.exp(-expected);
    let product = 1;
    let count = 0;
    do {
      count++;
      product *= rng();
    } while (product > limit && count < 9);
    return count - 1;
  };
  return { home: goals(homeExpected), away: goals(awayExpected) };
};

const resolveSingleMatch = (
  home: Club,
  away: Club,
  players: Record<string, Player[]>,
  seed: number,
  key: string,
  stage: ThirdLeaguePlayoffMatch['stage'] = 'RUNNERS_UP'
): ThirdLeaguePlayoffMatch => {
  const score = simulateScore(home, away, players, seed, key);
  let winnerClubId = score.home > score.away ? home.id : score.away > score.home ? away.id : '';
  if (!winnerClubId) {
    const rng = rngFor(seed, `${key}|PENALTIES`);
    const homeChance = 0.5 + Math.max(-0.18, Math.min(0.18, (squadStrength(home, players) - squadStrength(away, players)) / 80));
    winnerClubId = rng() < homeChance ? home.id : away.id;
  }
  return {
    id: key,
    stage,
    homeClubId: home.id,
    awayClubId: away.id,
    homeScore: score.home,
    awayScore: score.away,
    winnerClubId,
  };
};

const emptyGroupRecord = (): Record<ThirdLeagueGroupId, string[]> => ({
  L_PL_4_G1: [],
  L_PL_4_G2: [],
  L_PL_4_G3: [],
  L_PL_4_G4: [],
});

const shuffledForFourthLeaguePlayoff = (
  clubs: Club[],
  sessionSeed: number,
  seasonNumber: number,
  groupId: ThirdLeagueGroupId
): Club[] => [...clubs].sort((left, right) =>
  hash(`${sessionSeed}|${seasonNumber}|${groupId}|IV_RUNNER|${left.id}`) -
  hash(`${sessionSeed}|${seasonNumber}|${groupId}|IV_RUNNER|${right.id}`)
);

export const PolishThirdLeagueSeasonTransitionService = {
  resolve(
    clubs: Club[],
    players: Record<string, Player[]>,
    sessionSeed: number,
    seasonNumber: number,
    projectedLeagueByClubId?: ReadonlyMap<string, string>,
    overrides: ThirdLeagueResolutionOverrides = {},
    fourthLeagueState?: PolishFourthLeagueState | null
  ): ThirdLeagueSeasonResolution {
    const clubById = new Map(clubs.map(club => [club.id, club]));
    const groupTables = Object.fromEntries(
      THIRD_LEAGUE_GROUP_IDS.map(groupId => [groupId, table(clubs, groupId)])
    ) as Record<ThirdLeagueGroupId, Club[]>;
    THIRD_LEAGUE_GROUP_IDS.forEach(groupId => {
      if (groupTables[groupId].length !== 18) {
        throw new Error(`${groupId} must contain 18 clubs before season resolution.`);
      }
    });

    const champions = THIRD_LEAGUE_GROUP_IDS.map(groupId => groupTables[groupId][0]);
    const runnersUp = THIRD_LEAGUE_GROUP_IDS.map(groupId => groupTables[groupId][1]);
    const promotedChampionIds = champions
      .filter(club => ReserveTeamLeagueService.canEnterLeague(club.id, 'L_PL_3', clubs, projectedLeagueByClubId))
      .map(club => club.id);
    const promotedToSecondLeagueIds = [...promotedChampionIds];

    const shuffledRunnersUp = [...runnersUp].sort((a, b) =>
      hash(`${sessionSeed}|${seasonNumber}|${a.id}`) - hash(`${sessionSeed}|${seasonNumber}|${b.id}`)
    );
    const firstStage = [0, 1].map(pairIndex => {
      const left = shuffledRunnersUp[pairIndex * 2];
      const right = shuffledRunnersUp[pairIndex * 2 + 1];
      const hostRng = rngFor(sessionSeed, `III_PLAYOFF_HOST|${seasonNumber}|${pairIndex}`);
      const [home, away] = hostRng() < 0.5 ? [left, right] : [right, left];
      return resolveSingleMatch(home, away, players, sessionSeed, `III_PLAYOFF_R1_${seasonNumber}_${pairIndex}`);
    });

    const secondLeagueTable = table(clubs, 'L_PL_3');
    const incumbents = secondLeagueTable.slice(12, 14);
    const forcedReserveRelegationIds = new Set(
      projectedLeagueByClubId
        ? ReserveTeamLeagueService.findSameLeagueConflicts(clubs, projectedLeagueByClubId)
            .filter(conflict =>
              PolishThirdLeagueService.getPolishTier(conflict.leagueId) === 3 &&
              clubById.get(conflict.reserveClubId)?.leagueId === 'L_PL_3'
            )
            .map(conflict => conflict.reserveClubId)
        : []
    );
    // Positions 15-18 always go down. A reserve side is added to that set when
    // its parent is projected into II Liga, because both teams may not share a
    // level. Treating it as another regional arrival keeps the group arithmetic
    // correct and creates the corresponding replacement place in II Liga.
    const directRelegated = [...new Map(
      [...secondLeagueTable.slice(14, 18), ...secondLeagueTable.filter(club => forcedReserveRelegationIds.has(club.id))]
        .map(club => [club.id, club])
    ).values()];
    const relegatedFromSecondLeagueByGroup = emptyGroupRecord();
    directRelegated.forEach(club => {
      relegatedFromSecondLeagueByGroup[PolishThirdLeagueService.getGroupForClub(club)].push(club.id);
    });

    const playoffMatches: ThirdLeaguePlayoffMatch[] = [...firstStage];
    const playoffPromoted = new Set<string>();
    firstStage.forEach((firstMatch, pairIndex) => {
      const challenger = clubById.get(overrides.challengerIds?.[pairIndex] ?? firstMatch.winnerClubId!);
      const incumbent = incumbents[pairIndex];
      if (!challenger || !incumbent) return;
      const firstLegScore = simulateScore(challenger, incumbent, players, sessionSeed, `III_PLAYOFF_FINAL_L1_${seasonNumber}_${pairIndex}`);
      const secondLegScore = simulateScore(incumbent, challenger, players, sessionSeed, `III_PLAYOFF_FINAL_L2_${seasonNumber}_${pairIndex}`);
      playoffMatches.push({
        id: `III_PLAYOFF_FINAL_L1_${seasonNumber}_${pairIndex}`,
        stage: 'SECOND_LEAGUE_FIRST_LEG',
        homeClubId: challenger.id,
        awayClubId: incumbent.id,
        homeScore: firstLegScore.home,
        awayScore: firstLegScore.away,
      });
      const challengerAggregate = firstLegScore.home + secondLegScore.away;
      const incumbentAggregate = firstLegScore.away + secondLegScore.home;
      const interactiveWinnerId = overrides.finalOutcomes?.[pairIndex]?.winnerId;
      const validInteractiveWinnerId = interactiveWinnerId === challenger.id || interactiveWinnerId === incumbent.id
        ? interactiveWinnerId
        : undefined;
      let winnerClubId = forcedReserveRelegationIds.has(incumbent.id)
        ? challenger.id
        : validInteractiveWinnerId ??
          (challengerAggregate > incumbentAggregate ? challenger.id : incumbentAggregate > challengerAggregate ? incumbent.id : '');
      if (!winnerClubId) {
        const rng = rngFor(sessionSeed, `III_PLAYOFF_FINAL_PENALTIES_${seasonNumber}_${pairIndex}`);
        const challengerChance = 0.5 + Math.max(-0.18, Math.min(0.18, (squadStrength(challenger, players) - squadStrength(incumbent, players)) / 80));
        winnerClubId = rng() < challengerChance ? challenger.id : incumbent.id;
      }
      playoffMatches.push({
        id: `III_PLAYOFF_FINAL_L2_${seasonNumber}_${pairIndex}`,
        stage: 'SECOND_LEAGUE_SECOND_LEG',
        homeClubId: incumbent.id,
        awayClubId: challenger.id,
        homeScore: secondLegScore.home,
        awayScore: secondLegScore.away,
        winnerClubId,
      });
      if (winnerClubId === challenger.id && ReserveTeamLeagueService.canEnterLeague(challenger.id, 'L_PL_3', clubs, projectedLeagueByClubId)) {
        playoffPromoted.add(challenger.id);
        const targetGroup = PolishThirdLeagueService.getGroupForClub(incumbent);
        if (!relegatedFromSecondLeagueByGroup[targetGroup].includes(incumbent.id)) {
          relegatedFromSecondLeagueByGroup[targetGroup].push(incumbent.id);
        }
      }
    });
    promotedToSecondLeagueIds.push(...playoffPromoted);

    // Forced reserve relegations and an ineligible group champion may create a
    // real vacancy in II Liga. Fill it deterministically from the best eligible
    // non-promoted III-liga teams: table position first, then the normal table
    // criteria. This replaces the former random L_PL_4 promotion while keeping
    // exactly as many clubs moving up as move down across this boundary.
    const relegatedFromSecondLeagueIds = new Set(
      Object.values(relegatedFromSecondLeagueByGroup).flat()
    );
    const promotedSet = new Set(promotedToSecondLeagueIds);
    const supplementaryCandidates = THIRD_LEAGUE_GROUP_IDS
      .flatMap(groupId => groupTables[groupId].map((club, index) => ({ club, tablePosition: index + 1 })))
      .filter(candidate =>
        !promotedSet.has(candidate.club.id) &&
        ReserveTeamLeagueService.canEnterLeague(candidate.club.id, 'L_PL_3', clubs, projectedLeagueByClubId)
      )
      .sort((a, b) =>
        a.tablePosition - b.tablePosition ||
        b.club.stats.points - a.club.stats.points ||
        b.club.stats.goalDifference - a.club.stats.goalDifference ||
        b.club.stats.goalsFor - a.club.stats.goalsFor ||
        a.club.id.localeCompare(b.club.id)
      );
    while (promotedSet.size < relegatedFromSecondLeagueIds.size) {
      const replacement = supplementaryCandidates.shift();
      if (!replacement) {
        throw new Error('III liga does not contain enough eligible clubs to fill all II-liga vacancies.');
      }
      promotedSet.add(replacement.club.id);
    }
    promotedToSecondLeagueIds.splice(0, promotedToSecondLeagueIds.length, ...promotedSet);

    const relegatedToFeederIds: string[] = [];
    THIRD_LEAGUE_GROUP_IDS.forEach(groupId => {
      const promotedFromGroup = groupTables[groupId].filter(club => promotedSet.has(club.id)).length;
      const incomingFromSecondLeague = relegatedFromSecondLeagueByGroup[groupId].length;
      // Start with 18, add five regional champions, add II-liga arrivals and
      // subtract every club actually promoted, including a deterministic
      // supplementary promotion created by a reserve-team conflict.
      const relegationCount = 5 + incomingFromSecondLeague - promotedFromGroup;
      relegatedToFeederIds.push(...groupTables[groupId].slice(-relegationCount).map(club => club.id));
    });

    const promotedFromFeederByGroup = emptyGroupRecord();
    if (fourthLeagueState) {
      THIRD_LEAGUE_GROUP_IDS.forEach(groupId => {
        const regionalLeagueIds = FOURTH_LEAGUE_IDS.filter(leagueId =>
          PolishThirdLeagueService.getGroupForVoivodeship(
            PolishFourthLeagueService.getVoivodeshipForLeague(leagueId)
          ) === groupId
        );

        // Each macro-region supplies four direct champions. If a reserve side
        // cannot share the III-liga level with its parent, the next eligible
        // side from that same voivodeship takes the sporting place; no club is
        // ever drawn from an unrelated region.
        const regionalQualifiers = regionalLeagueIds.map(leagueId => {
          const ranking = PolishFourthLeagueService.getTable(clubs, leagueId)
            .filter(club =>
              PolishFourthLeagueService.canReserveEnterThirdLeague(club, clubs) &&
              ReserveTeamLeagueService.canEnterLeague(club.id, groupId, clubs, projectedLeagueByClubId)
            );
          if (ranking.length < 2) {
            throw new Error(`${leagueId} does not contain two eligible promotion candidates.`);
          }
          return { champion: ranking[0], runnerUp: ranking[1] };
        });

        const champions = regionalQualifiers.map(candidate => candidate.champion);
        const runnersUp = shuffledForFourthLeaguePlayoff(
          regionalQualifiers.map(candidate => candidate.runnerUp),
          sessionSeed,
          seasonNumber,
          groupId
        );
        const semiFinals = [0, 1].map(pairIndex => {
          const left = runnersUp[pairIndex * 2];
          const right = runnersUp[pairIndex * 2 + 1];
          const hostRng = rngFor(sessionSeed, `IV_PLAYOFF_HOST|${seasonNumber}|${groupId}|${pairIndex}`);
          const [home, away] = hostRng() < 0.5 ? [left, right] : [right, left];
          return resolveSingleMatch(home, away, players, sessionSeed, `IV_PLAYOFF_SEMI_${seasonNumber}_${groupId}_${pairIndex}`, 'FOURTH_LEAGUE_RUNNERS_UP');
        });
        playoffMatches.push(...semiFinals);
        const finalists = semiFinals
          .map(match => clubById.get(match.winnerClubId ?? ''))
          .filter((club): club is Club => !!club);
        if (finalists.length !== 2) throw new Error(`${groupId} IV-liga playoff did not produce two finalists.`);
        const finalHostRng = rngFor(sessionSeed, `IV_PLAYOFF_FINAL_HOST|${seasonNumber}|${groupId}`);
        const [finalHome, finalAway] = finalHostRng() < 0.5 ? finalists : [finalists[1], finalists[0]];
        const finalMatch = resolveSingleMatch(
          finalHome,
          finalAway,
          players,
          sessionSeed,
          `IV_PLAYOFF_FINAL_${seasonNumber}_${groupId}`,
          'FOURTH_LEAGUE_RUNNERS_UP'
        );
        playoffMatches.push(finalMatch);
        promotedFromFeederByGroup[groupId] = [
          ...champions.map(club => club.id),
          finalMatch.winnerClubId!,
        ];
      });
    } else {
      // Compatibility fallback for isolated tests and pre-IV-liga state. New
      // 2026/27 careers always use the sixteen real regional tables above.
      THIRD_LEAGUE_GROUP_IDS.forEach(groupId => {
        const candidates = clubs
          .filter(club =>
            (club.leagueId === 'L_PL_5' || PolishFourthLeagueService.isFourthLeagueId(club.leagueId)) &&
            club.polishVoivodeship &&
            PolishThirdLeagueService.getGroupForVoivodeship(club.polishVoivodeship) === groupId
          )
          .sort((a, b) => {
            const score = (club: Club) =>
              club.reputation * 100 +
              squadStrength(club, players) +
              (hash(`${sessionSeed}|${seasonNumber}|${groupId}|${club.id}`) % 100) / 100;
            return score(b) - score(a);
          });
        if (candidates.length < 5) {
          throw new Error(`${groupId} feeder pool has only ${candidates.length} regionally assigned clubs; five are required.`);
        }
        promotedFromFeederByGroup[groupId] = candidates.slice(0, 5).map(club => club.id);
      });
    }

    const nextLeagueByClubId = new Map<string, string>();
    promotedToSecondLeagueIds.forEach(clubId => nextLeagueByClubId.set(clubId, 'L_PL_3'));
    Object.entries(relegatedFromSecondLeagueByGroup).forEach(([groupId, clubIds]) =>
      clubIds.forEach(clubId => nextLeagueByClubId.set(clubId, groupId))
    );
    relegatedToFeederIds.forEach(clubId => {
      const club = clubById.get(clubId);
      const targetLeagueId = club?.polishVoivodeship && fourthLeagueState
        ? PolishFourthLeagueService.getLeagueForVoivodeship(club.polishVoivodeship)
        : 'L_PL_5';
      nextLeagueByClubId.set(clubId, targetLeagueId);
    });
    Object.entries(promotedFromFeederByGroup).forEach(([groupId, clubIds]) =>
      clubIds.forEach(clubId => nextLeagueByClubId.set(clubId, groupId))
    );

    return {
      promotedToSecondLeagueIds: [...new Set(promotedToSecondLeagueIds)],
      relegatedFromSecondLeagueByGroup,
      relegatedToFeederIds: [...new Set(relegatedToFeederIds)],
      promotedFromFeederByGroup,
      nextLeagueByClubId,
      playoffMatches,
    };
  },
};
