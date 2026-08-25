import assert from 'node:assert/strict';
import { STATIC_CLUBS } from '../constants';
import { PolishLeagueSeasonService } from '../services/PolishLeagueSeasonService';
import { PolishThirdLeagueService, THIRD_LEAGUE_GROUP_IDS } from '../services/PolishThirdLeagueService';
import { LeagueScheduleGenerator } from '../services/LeagueScheduleGenerator';
import { SeasonTemplateGenerator } from '../services/SeasonTemplateGenerator';
import { PolishThirdLeagueSeasonTransitionService } from '../services/PolishThirdLeagueSeasonTransitionService';
import { SquadGeneratorService } from '../services/SquadGeneratorService';
import { PlayerStatsService } from '../services/PlayerStatsService';
import { LeagueStatsService } from '../services/LeagueStatsService';
import { ReserveTeamLeagueService } from '../services/ReserveTeamLeagueService';
import { MatchEventType } from '../types';

const clubs = PolishLeagueSeasonService.buildClubsForCareerStart(STATIC_CLUBS, 2026);
const membershipIds = THIRD_LEAGUE_GROUP_IDS.flatMap(groupId =>
  clubs.filter(club => club.leagueId === groupId).map(club => club.id)
);

assert.equal(membershipIds.length, 72, 'The four III-liga groups must contain exactly 72 clubs.');
assert.equal(new Set(membershipIds).size, 72, 'A club may not appear in two III-liga groups.');

// Every official reserve side represents the same football organisation as its
// parent. Keeping an identical logoFile is important because several legacy UI
// screens read Club.logoFile directly and do not use the central logo asset map.
ReserveTeamLeagueService.getParentReservePairs().forEach(({ reserveClubId, parentClubId }) => {
  const reserveClub = clubs.find(club => club.id === reserveClubId);
  const parentClub = clubs.find(club => club.id === parentClubId);
  assert.ok(reserveClub, `Configured reserve club ${reserveClubId} must exist in the Polish database.`);
  assert.ok(parentClub, `Configured parent club ${parentClubId} must exist in the Polish database.`);
  assert.ok(parentClub.logoFile, `Parent club ${parentClubId} must provide a logo file.`);
  assert.equal(
    reserveClub.logoFile,
    parentClub.logoFile,
    `Reserve club ${reserveClubId} must reuse the crest of ${parentClubId}.`
  );
});

const template = SeasonTemplateGenerator.generate(2026);
THIRD_LEAGUE_GROUP_IDS.forEach((groupId, groupIndex) => {
  const groupClubs = clubs.filter(club => club.leagueId === groupId);
  assert.equal(groupClubs.length, 18, `${groupId} must contain 18 clubs.`);

  const schedule = LeagueScheduleGenerator.generate(groupClubs, template, 4, groupId, 202600 + groupIndex);
  assert.equal(schedule.matchdays.length, 34, `${groupId} must contain 34 rounds.`);
  assert.ok(schedule.matchdays.every(matchday => matchday.fixtures.length === 9), 'Every round must contain nine matches.');

  const fixtures = schedule.matchdays.flatMap(matchday => matchday.fixtures);
  assert.equal(fixtures.length, 306, `${groupId} must contain 306 fixtures.`);
  const pairCounts = new Map<string, number>();
  fixtures.forEach(fixture => {
    const pairKey = [fixture.homeTeamId, fixture.awayTeamId].sort().join('|');
    pairCounts.set(pairKey, (pairCounts.get(pairKey) ?? 0) + 1);
  });
  assert.equal(pairCounts.size, 153, 'Every unique pair must occur once in the pair map.');
  assert.ok([...pairCounts.values()].every(count => count === 2), 'Every pair must play home and away.');
});

// Give every table an unambiguous order without simulating a full test season.
// The transition service can then validate group arithmetic, territorial
// routing and the two-stage playoff structure deterministically.
const rankedClubs = clubs.map(club => {
  const league = club.leagueId;
  const groupIndex = THIRD_LEAGUE_GROUP_IDS.indexOf(league as any);
  const leaguePeers = clubs.filter(candidate => candidate.leagueId === league);
  const tableIndex = leaguePeers.findIndex(candidate => candidate.id === club.id);
  return {
    ...club,
    stats: {
      ...club.stats,
      played: 34,
      wins: Math.max(0, 17 - tableIndex),
      draws: 4,
      losses: Math.max(0, tableIndex),
      goalsFor: 60 - tableIndex,
      goalsAgainst: 20 + tableIndex,
      goalDifference: 40 - tableIndex * 2,
      points: groupIndex >= 0 || league === 'L_PL_3' ? 70 - tableIndex * 3 : club.stats.points,
    },
  };
});

const resolution = PolishThirdLeagueSeasonTransitionService.resolve(rankedClubs, {}, 123456, 1);
assert.equal(resolution.playoffMatches.length, 6, 'The playoff must contain two single matches and two two-legged ties.');
assert.ok(resolution.promotedToSecondLeagueIds.length >= 4 && resolution.promotedToSecondLeagueIds.length <= 6);

const expectedRunnerUpIds = THIRD_LEAGUE_GROUP_IDS.map(groupId => rankedClubs
  .filter(club => club.leagueId === groupId)
  .sort((a, b) =>
    b.stats.points - a.stats.points ||
    b.stats.goalDifference - a.stats.goalDifference ||
    b.stats.goalsFor - a.stats.goalsFor ||
    a.id.localeCompare(b.id)
  )[1].id
).sort();
const expectedChampionIds = THIRD_LEAGUE_GROUP_IDS.map(groupId => rankedClubs
  .filter(club => club.leagueId === groupId)
  .sort((a, b) =>
    b.stats.points - a.stats.points ||
    b.stats.goalDifference - a.stats.goalDifference ||
    b.stats.goalsFor - a.stats.goalsFor ||
    a.id.localeCompare(b.id)
  )[0].id
);
assert.ok(
  expectedChampionIds.every(clubId => resolution.promotedToSecondLeagueIds.includes(clubId)),
  'Every eligible group champion must receive direct promotion.'
);
const firstStageParticipantIds = resolution.playoffMatches
  .filter(match => match.stage === 'RUNNERS_UP')
  .flatMap(match => [match.homeClubId, match.awayClubId])
  .sort();
assert.deepEqual(
  firstStageParticipantIds,
  expectedRunnerUpIds,
  'The first playoff stage must use the four actual runners-up, never random III-liga clubs.'
);
const otherSeedParticipantIds = PolishThirdLeagueSeasonTransitionService.resolve(rankedClubs, {}, 987654, 1)
  .playoffMatches
  .filter(match => match.stage === 'RUNNERS_UP')
  .flatMap(match => [match.homeClubId, match.awayClubId])
  .sort();
assert.deepEqual(otherSeedParticipantIds, expectedRunnerUpIds, 'Changing the draw seed may change pairs, but never participants.');

const finalFirstLegs = resolution.playoffMatches.filter(match => match.stage === 'SECOND_LEAGUE_FIRST_LEG');
const firstStageWinnerIds = new Set(
  resolution.playoffMatches.filter(match => match.stage === 'RUNNERS_UP').map(match => match.winnerClubId)
);
assert.ok(
  finalFirstLegs.every(match => firstStageWinnerIds.has(match.homeClubId)),
  'The III-liga challenger must host the first leg against the II-liga incumbent.'
);
THIRD_LEAGUE_GROUP_IDS.forEach(groupId => {
  assert.equal(resolution.promotedFromFeederByGroup[groupId].length, 5, `${groupId} must receive five feeder clubs.`);
  const nextCount = rankedClubs.filter(club =>
    (resolution.nextLeagueByClubId.get(club.id) ?? club.leagueId) === groupId
  ).length;
  assert.equal(nextCount, 18, `${groupId} must be restored to 18 clubs after all movements.`);
});

// Interactive playoff outcomes are authoritative. Force both II-liga clubs to
// survive and verify that the background resolver neither promotes a defeated
// challenger nor sends an incumbent to a regional group by its simulated score.
const secondLeagueTable = rankedClubs
  .filter(club => club.leagueId === 'L_PL_3')
  .sort((a, b) =>
    b.stats.points - a.stats.points ||
    b.stats.goalDifference - a.stats.goalDifference ||
    b.stats.goalsFor - a.stats.goalsFor ||
    a.id.localeCompare(b.id)
  );
const challengers = resolution.playoffMatches
  .filter(match => match.stage === 'RUNNERS_UP')
  .map(match => match.winnerClubId!);
const incumbents = secondLeagueTable.slice(12, 14);
secondLeagueTable.slice(14, 18).forEach(club => {
  assert.equal(
    resolution.nextLeagueByClubId.get(club.id),
    PolishThirdLeagueService.getGroupForClub(club),
    `${club.name} must be relegated to its territorial III-liga group.`
  );
});
const interactiveResolution = PolishThirdLeagueSeasonTransitionService.resolve(
  rankedClubs,
  {},
  123456,
  1,
  undefined,
  {
    challengerIds: challengers,
    finalOutcomes: incumbents.map((incumbent, index) => ({
      winnerId: incumbent.id,
      loserId: challengers[index],
    })),
  }
);
assert.equal(interactiveResolution.promotedToSecondLeagueIds.length, 4);
assert.equal(
  Object.values(interactiveResolution.relegatedFromSecondLeagueByGroup).flat().length,
  4,
  'Only places 15-18 may be relegated when both II-liga incumbents win their interactive ties.'
);

// Exhaust all four combinations of the two interactive finals. Regional
// concentration can change the number relegated from an individual group, but
// every group must always be restored to exactly eighteen clubs.
for (let outcomeMask = 0; outcomeMask < 4; outcomeMask++) {
  const exhaustiveResolution = PolishThirdLeagueSeasonTransitionService.resolve(
    rankedClubs,
    {},
    123456,
    1,
    undefined,
    {
      challengerIds: challengers,
      finalOutcomes: incumbents.map((incumbent, index) => {
        const challengerWins = Boolean(outcomeMask & (1 << index));
        return {
          winnerId: challengerWins ? challengers[index] : incumbent.id,
          loserId: challengerWins ? incumbent.id : challengers[index],
        };
      }),
    }
  );
  assert.equal(
    exhaustiveResolution.promotedToSecondLeagueIds.length,
    new Set(Object.values(exhaustiveResolution.relegatedFromSecondLeagueByGroup).flat()).size,
    `II-liga entries and exits must balance for playoff outcome mask ${outcomeMask}.`
  );
  THIRD_LEAGUE_GROUP_IDS.forEach(groupId => {
    const nextCount = rankedClubs.filter(club =>
      (exhaustiveResolution.nextLeagueByClubId.get(club.id) ?? club.leagueId) === groupId
    ).length;
    assert.equal(nextCount, 18, `${groupId} must contain 18 clubs for playoff outcome mask ${outcomeMask}.`);
  });
}

// A reserve champion blocked by its parent's projected II-liga membership must
// not be promoted, and its group must still finish the transition at 18 clubs.
const reserveChampionClubs = rankedClubs.map(club => {
  if (club.id === 'PL_WIDZEW_LODZ_II') return { ...club, stats: { ...club.stats, points: 100 } };
  if (club.leagueId === 'L_PL_4_G1') return { ...club, stats: { ...club.stats, points: Math.min(99, club.stats.points) } };
  return club;
});
const reserveConflictProjection = new Map<string, string>([['PL_WIDZEW_LODZ', 'L_PL_3']]);
const reserveChampionResolution = PolishThirdLeagueSeasonTransitionService.resolve(
  reserveChampionClubs,
  {},
  123456,
  1,
  reserveConflictProjection
);
assert.ok(!reserveChampionResolution.promotedToSecondLeagueIds.includes('PL_WIDZEW_LODZ_II'));
const groupOneAfterBlockedPromotion = reserveChampionClubs.filter(club =>
  (reserveChampionResolution.nextLeagueByClubId.get(club.id) ?? club.leagueId) === 'L_PL_4_G1'
).length;
assert.equal(groupOneAfterBlockedPromotion, 18, 'A blocked reserve promotion must not leave its group with 19 clubs.');

const forcedReserveProjection = new Map<string, string>([['PL_SLASK_WROCLAW', 'L_PL_3']]);
const forcedReserveResolution = PolishThirdLeagueSeasonTransitionService.resolve(
  rankedClubs,
  {},
  123456,
  1,
  forcedReserveProjection
);
assert.ok(
  Object.values(forcedReserveResolution.relegatedFromSecondLeagueByGroup).flat().includes('PL_SLASK_WROCLAW_II'),
  'A reserve team must leave II Liga when its parent is projected into the same level.'
);
assert.equal(
  forcedReserveResolution.promotedToSecondLeagueIds.length,
  new Set(Object.values(forcedReserveResolution.relegatedFromSecondLeagueByGroup).flat()).size,
  'A forced reserve relegation must create a deterministic supplementary promotion, not a vacant II-liga place.'
);
THIRD_LEAGUE_GROUP_IDS.forEach(groupId => {
  const nextCount = rankedClubs.filter(club =>
    (forcedReserveResolution.nextLeagueByClubId.get(club.id) ?? club.leagueId) === groupId
  ).length;
  assert.equal(nextCount, 18, `${groupId} must stay balanced after a forced reserve relegation.`);
});

const statsClub = clubs.find(club => club.leagueId === 'L_PL_4_G1')!;
const statsSquad = SquadGeneratorService.generateSquadForClub(statsClub.id, statsClub);
const statsPlayerId = statsSquad[0].id;
let statsMap = { [statsClub.id]: statsSquad };
statsMap = PlayerStatsService.processMatchDayEndForClub(statsMap, statsClub.id, [statsPlayerId], 'L_PL_4_G1', { [statsPlayerId]: 37 });
statsMap = PlayerStatsService.applyGoal(statsMap, statsPlayerId, undefined, 'L_PL_4_G1');
statsMap = PlayerStatsService.applyCard(statsMap, statsPlayerId, MatchEventType.YELLOW_CARD, 'L_PL_4_G1');
const statsPlayer = statsMap[statsClub.id][0];
assert.equal(LeagueStatsService.getStatsForLeagueId(statsPlayer, 'L_PL_4_G1').matchesPlayed, 1);
assert.equal(LeagueStatsService.getStatsForLeagueId(statsPlayer, 'L_PL_4_G1').minutesPlayed, 37);
assert.equal(LeagueStatsService.getStatsForLeagueId(statsPlayer, 'L_PL_4_G1').goals, 1);
assert.equal(LeagueStatsService.getStatsForLeagueId(statsPlayer, 'L_PL_4_G1').yellowCards, 1);
assert.equal(LeagueStatsService.getStatsForLeagueId(statsPlayer, 'L_PL_4_G2').goals, 0, 'A transfer must not leak goals into the destination group.');

console.log('ThirdLeague2026Tests: OK');
