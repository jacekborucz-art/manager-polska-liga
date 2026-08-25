import assert from 'node:assert/strict';
import { STATIC_CLUBS } from '../constants';
import { PolishLeagueSeasonService } from '../services/PolishLeagueSeasonService';
import { SeasonTemplateGenerator } from '../services/SeasonTemplateGenerator';
import {
  FOURTH_LEAGUE_BY_VOIVODESHIP,
  FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP,
  FOURTH_LEAGUE_FEEDER_IDS,
  FOURTH_LEAGUE_IDS,
  PolishFourthLeagueService,
} from '../services/PolishFourthLeagueService';
import { PolishVoivodeship } from '../types';
import { PolishThirdLeagueSeasonTransitionService } from '../services/PolishThirdLeagueSeasonTransitionService';
import { THIRD_LEAGUE_GROUP_IDS } from '../services/PolishThirdLeagueService';

const template = SeasonTemplateGenerator.generate(2026);
let clubs = PolishLeagueSeasonService.buildClubsForCareerStart(STATIC_CLUBS, 2026);
FOURTH_LEAGUE_FEEDER_IDS.forEach(poolId => {
  const poolClubs = clubs.filter(club => club.leagueId === poolId);
  assert.equal(poolClubs.length, 18, `${poolId} must start with exactly 18 promotion candidates`);
  assert.ok(poolClubs.every(club => club.tier === 6 && club.isDefaultActive === false));
});
const initial = PolishFourthLeagueService.createSeason(clubs, template, 812734);
clubs = initial.clubs;
const initialFourthLeagueSizes = new Map(FOURTH_LEAGUE_IDS.map(leagueId => [
  leagueId,
  clubs.filter(club => club.leagueId === leagueId).length,
]));
const sharedLeagueSlots = template.slots
  .filter(slot => String(slot.competition) === 'LEAGUE')
  .sort((left, right) => left.start.getTime() - right.start.getTime());

FOURTH_LEAGUE_IDS.forEach(leagueId => {
  const leagueClubs = clubs.filter(club => club.leagueId === leagueId);
  assert.ok([14, 16, 18].includes(leagueClubs.length), `${leagueId} has an invalid size`);
  const fixtures = initial.state.fixtures[leagueId];
  assert.equal(fixtures.length, leagueClubs.length * (leagueClubs.length - 1));
  assert.equal(new Set(fixtures.map(fixture => fixture.round)).size, (leagueClubs.length - 1) * 2);
  const fixtureDates = fixtures.map(fixture => new Date(fixture.date).getTime());
  if (leagueClubs.length < 18) {
    const expectedFirstSlot = leagueClubs.length === 14 ? 7 : 3;
    assert.equal(Math.min(...fixtureDates), sharedLeagueSlots[expectedFirstSlot].start.getTime(), `${leagueId} must use its later start date`);
    assert.equal(Math.max(...fixtureDates), sharedLeagueSlots[32].start.getTime(), `${leagueId} must finish on 15 May`);
  }
});

const completed = PolishFourthLeagueService.processDate(
  initial.state,
  clubs,
  new Date(2027, 5, 30),
  812734
);
assert.equal(
  completed.played,
  FOURTH_LEAGUE_IDS.reduce((sum, id) => sum + initial.state.fixtures[id].length, 0)
);
const repeated = PolishFourthLeagueService.processDate(
  completed.state,
  completed.clubs,
  new Date(2027, 5, 30),
  812734
);
assert.equal(repeated.played, 0, 'finished IV-liga fixtures must be idempotent');

FOURTH_LEAGUE_IDS.forEach(leagueId => {
  const tableGoals = completed.clubs
    .filter(club => club.leagueId === leagueId)
    .reduce((sum, club) => sum + club.stats.goalsFor, 0);
  const playerGoals = completed.state!.playerStats[leagueId].reduce((sum, row) => sum + row.goals, 0);
  assert.equal(playerGoals, tableGoals, `${leagueId} scorer totals do not match match goals`);
});

const resolution = PolishThirdLeagueSeasonTransitionService.resolve(
  completed.clubs,
  {},
  812734,
  1,
  undefined,
  {},
  completed.state
);
THIRD_LEAGUE_GROUP_IDS.forEach(groupId => {
  assert.equal(resolution.promotedFromFeederByGroup[groupId].length, 5, `${groupId} must receive five IV-liga clubs`);
});
assert.equal(
  resolution.playoffMatches.filter(match => match.stage === 'FOURTH_LEAGUE_RUNNERS_UP').length,
  12,
  'four macro-regions need two semi-finals and one final each'
);

let nextClubs = completed.clubs.map(club => {
  const leagueId = resolution.nextLeagueByClubId.get(club.id) ?? club.leagueId;
  return { ...club, leagueId };
});
THIRD_LEAGUE_GROUP_IDS.forEach(groupId => {
  assert.equal(nextClubs.filter(club => club.leagueId === groupId).length, 18, `${groupId} must return to 18 clubs`);
});
const clubsBeforeFourthLeagueRebalance = nextClubs.map(club => ({ ...club }));
const poolMembershipBeforeRebalance = new Map(FOURTH_LEAGUE_FEEDER_IDS.map(poolId => [
  poolId,
  new Set(clubsBeforeFourthLeagueRebalance.filter(club => club.leagueId === poolId).map(club => club.id)),
]));
nextClubs = PolishFourthLeagueService.rebalanceForNextSeason(clubsBeforeFourthLeagueRebalance, 2027, 812735);
const repeatedRebalance = PolishFourthLeagueService.rebalanceForNextSeason(clubsBeforeFourthLeagueRebalance, 2027, 812735);

(Object.entries(FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP) as Array<[PolishVoivodeship, typeof FOURTH_LEAGUE_FEEDER_IDS[number]]>)
  .forEach(([voivodeship, poolId]) => {
    const leagueId = FOURTH_LEAGUE_BY_VOIVODESHIP[voivodeship];
    const previousPoolIds = poolMembershipBeforeRebalance.get(poolId)!;
    const promotedIds = nextClubs
      .filter(club => club.leagueId === leagueId && previousPoolIds.has(club.id))
      .map(club => club.id)
      .sort();
    const repeatedPromotedIds = repeatedRebalance
      .filter(club => club.leagueId === leagueId && previousPoolIds.has(club.id))
      .map(club => club.id)
      .sort();
    assert.equal(promotedIds.length, 4, `${voivodeship} must promote four clubs from its own pool`);
    assert.deepEqual(repeatedPromotedIds, promotedIds, `${voivodeship} pool draw must be deterministic`);
    assert.equal(nextClubs.filter(club => club.leagueId === poolId).length, 18, `${poolId} must be restored to 18 clubs`);
    assert.equal(
      nextClubs.filter(club => club.leagueId === leagueId).length,
      initialFourthLeagueSizes.get(leagueId),
      `${leagueId} must return to its configured size after the regional cascade`
    );
  });
const nextSeason = PolishFourthLeagueService.createSeason(
  nextClubs,
  SeasonTemplateGenerator.generate(2027),
  812735
);
FOURTH_LEAGUE_IDS.forEach(leagueId => {
  assert.ok(
    [14, 16, 18].includes(nextSeason.clubs.filter(club => club.leagueId === leagueId).length),
    `${leagueId} must retain its configured size after promotion and relegation`
  );
});

console.log('FourthLeague2026Tests: OK');
