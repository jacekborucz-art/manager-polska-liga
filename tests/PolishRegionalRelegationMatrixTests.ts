import assert from 'node:assert/strict';
import { STATIC_CLUBS } from '../constants';
import { PolishLeagueSeasonService } from '../services/PolishLeagueSeasonService';
import {
  FOURTH_LEAGUE_BY_VOIVODESHIP,
  FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP,
  FOURTH_LEAGUE_IDS,
  PolishFourthLeagueService,
} from '../services/PolishFourthLeagueService';
import { PolishThirdLeagueSeasonTransitionService } from '../services/PolishThirdLeagueSeasonTransitionService';
import {
  PolishThirdLeagueService,
  THIRD_LEAGUE_GROUP_IDS,
  ThirdLeagueGroupId,
} from '../services/PolishThirdLeagueService';
import { SeasonTemplateGenerator } from '../services/SeasonTemplateGenerator';
import { Club, PolishVoivodeship } from '../types';

const GROUP_REGIONS: Record<ThirdLeagueGroupId, PolishVoivodeship[]> = {
  L_PL_4_G1: ['łódzkie', 'mazowieckie', 'podlaskie', 'warmińsko-mazurskie'],
  L_PL_4_G2: ['kujawsko-pomorskie', 'pomorskie', 'wielkopolskie', 'zachodniopomorskie'],
  L_PL_4_G3: ['dolnośląskie', 'lubuskie', 'opolskie', 'śląskie'],
  L_PL_4_G4: ['lubelskie', 'małopolskie', 'podkarpackie', 'świętokrzyskie'],
};

type RegionalPattern = 'BALANCED' | 'CONCENTRATED' | 'SPLIT';

interface RelegationScenario {
  name: string;
  /** The target III-liga macrogroup of each of the four direct II-liga drops. */
  secondLeagueDropGroups: [ThirdLeagueGroupId, ThirdLeagueGroupId, ThirdLeagueGroupId, ThirdLeagueGroupId];
  /** Controls which voivodeships own the clubs at the bottom of every III-liga table. */
  thirdLeagueBottomPattern: RegionalPattern;
  /** Rotates club ids through table positions so every scenario relegates different teams. */
  tableRotation: number;
}

const REGIONAL_PATTERNS: RegionalPattern[] = ['BALANCED', 'CONCENTRATED', 'SPLIT'];

const SCENARIOS: RelegationScenario[] = (() => {
  const scenarios: RelegationScenario[] = [];
  let scenarioIndex = 0;
  // Four direct II-liga relegations can be distributed across the four III-liga
  // macrogroups in 35 distinct numerical ways. Generate every one of them,
  // including 4-0-0-0, 2-2-0-0, 1-1-1-1 and every permutation, rather than
  // relying on a small hand-picked sample that could miss a regional cascade.
  for (let groupOne = 0; groupOne <= 4; groupOne++) {
    for (let groupTwo = 0; groupTwo <= 4 - groupOne; groupTwo++) {
      for (let groupThree = 0; groupThree <= 4 - groupOne - groupTwo; groupThree++) {
        const groupFour = 4 - groupOne - groupTwo - groupThree;
        const counts = [groupOne, groupTwo, groupThree, groupFour];
        const secondLeagueDropGroups = counts.flatMap((count, groupIndex) =>
          Array.from({ length: count }, () => THIRD_LEAGUE_GROUP_IDS[groupIndex])
        ) as RelegationScenario['secondLeagueDropGroups'];
        scenarios.push({
          name: `II-to-III distribution ${counts.join('-')}`,
          secondLeagueDropGroups,
          thirdLeagueBottomPattern: REGIONAL_PATTERNS[scenarioIndex % REGIONAL_PATTERNS.length],
          tableRotation: scenarioIndex,
        });
        scenarioIndex++;
      }
    }
  }
  return scenarios;
})();

const rotate = <T,>(values: T[], offset: number): T[] => {
  const normalizedOffset = offset % values.length;
  return [...values.slice(normalizedOffset), ...values.slice(0, normalizedOffset)];
};

const regionForBottomPosition = (
  regions: PolishVoivodeship[],
  bottomIndex: number,
  pattern: RegionalPattern
): PolishVoivodeship => {
  if (pattern === 'CONCENTRATED') return regions[0];
  if (pattern === 'SPLIT') return regions[Math.floor(bottomIndex / 2) % regions.length];
  return regions[bottomIndex % regions.length];
};

const rankScenarioWorld = (source: Club[], scenario: RelegationScenario): Club[] => {
  const thirdLeagueRankById = new Map<string, { groupId: ThirdLeagueGroupId; position: number }>();
  THIRD_LEAGUE_GROUP_IDS.forEach((groupId, groupIndex) => {
    const ordered = rotate(
      source.filter(club => club.leagueId === groupId).sort((left, right) => left.id.localeCompare(right.id)),
      scenario.tableRotation + groupIndex
    );
    ordered.forEach((club, index) => thirdLeagueRankById.set(club.id, { groupId, position: index }));
  });

  const secondLeagueOrder = rotate(
    source.filter(club => club.leagueId === 'L_PL_3').sort((left, right) => left.id.localeCompare(right.id)),
    scenario.tableRotation
  );
  const secondLeagueRankById = new Map(secondLeagueOrder.map((club, index) => [club.id, index]));

  return source.map(club => {
    const thirdRank = thirdLeagueRankById.get(club.id);
    if (thirdRank) {
      const regions = GROUP_REGIONS[thirdRank.groupId];
      // The lowest ten positions are enough to cover the worst possible case:
      // five normal III-liga exits plus four II-liga arrivals and one safety
      // margin. All assigned regions remain legal for the selected macrogroup.
      const bottomStart = 8;
      const polishVoivodeship = thirdRank.position >= bottomStart
        ? regionForBottomPosition(regions, thirdRank.position - bottomStart, scenario.thirdLeagueBottomPattern)
        : regions[thirdRank.position % regions.length];
      return {
        ...club,
        polishVoivodeship,
        stats: {
          ...club.stats,
          played: 34,
          points: 200 - thirdRank.position * 6,
          wins: Math.max(0, 17 - thirdRank.position),
          draws: 3,
          losses: thirdRank.position,
          goalsFor: 65 - thirdRank.position,
          goalsAgainst: 18 + thirdRank.position,
          goalDifference: 47 - thirdRank.position * 2,
        },
      };
    }

    const secondRank = secondLeagueRankById.get(club.id);
    if (secondRank !== undefined) {
      const directDropIndex = secondRank - 14;
      const polishVoivodeship = directDropIndex >= 0
        ? GROUP_REGIONS[scenario.secondLeagueDropGroups[directDropIndex]][0]
        : club.polishVoivodeship;
      return {
        ...club,
        polishVoivodeship,
        stats: {
          ...club.stats,
          played: 34,
          points: 180 - secondRank * 7,
          wins: Math.max(0, 16 - secondRank),
          draws: 4,
          losses: secondRank,
          goalsFor: 58 - secondRank,
          goalsAgainst: 20 + secondRank,
          goalDifference: 38 - secondRank * 2,
        },
      };
    }
    return club;
  });
};

SCENARIOS.forEach((scenario, scenarioIndex) => {
  const seed = 920000 + scenarioIndex * 100;
  const template = SeasonTemplateGenerator.generate(2026);
  const careerClubs = PolishLeagueSeasonService.buildClubsForCareerStart(STATIC_CLUBS, 2026);
  const fourthLeagueSeason = PolishFourthLeagueService.createSeason(careerClubs, template, seed);
  const rankedClubs = rankScenarioWorld(fourthLeagueSeason.clubs, scenario);

  // Resolve once to obtain the two legitimate III-liga challengers, then force
  // both II-liga incumbents to win. This isolates the direct four relegations
  // and makes the expected regional arithmetic explicit in every scenario.
  const preliminary = PolishThirdLeagueSeasonTransitionService.resolve(
    rankedClubs,
    {},
    seed,
    1,
    undefined,
    {},
    fourthLeagueSeason.state
  );
  const challengers = preliminary.playoffMatches
    .filter(match => match.stage === 'RUNNERS_UP')
    .map(match => match.winnerClubId!);
  const secondLeagueTable = rankedClubs
    .filter(club => club.leagueId === 'L_PL_3')
    .sort((left, right) =>
      right.stats.points - left.stats.points ||
      right.stats.goalDifference - left.stats.goalDifference ||
      right.stats.goalsFor - left.stats.goalsFor ||
      left.id.localeCompare(right.id)
    );
  const incumbents = secondLeagueTable.slice(12, 14);
  const resolution = PolishThirdLeagueSeasonTransitionService.resolve(
    rankedClubs,
    {},
    seed,
    1,
    undefined,
    {
      challengerIds: challengers,
      finalOutcomes: incumbents.map((incumbent, index) => ({
        winnerId: incumbent.id,
        loserId: challengers[index],
      })),
    },
    fourthLeagueSeason.state
  );

  const expectedSecondLeagueDrops = new Map<ThirdLeagueGroupId, number>(
    THIRD_LEAGUE_GROUP_IDS.map(groupId => [
      groupId,
      scenario.secondLeagueDropGroups.filter(candidate => candidate === groupId).length,
    ])
  );

  THIRD_LEAGUE_GROUP_IDS.forEach(groupId => {
    const incomingFromSecondLeague = resolution.relegatedFromSecondLeagueByGroup[groupId];
    assert.equal(
      incomingFromSecondLeague.length,
      expectedSecondLeagueDrops.get(groupId),
      `${scenario.name}: incorrect II-to-III regional distribution for ${groupId}`
    );

    // With both playoff incumbents surviving, every III group promotes exactly
    // its champion. Therefore it relegates four normal clubs plus every club
    // delivered to that group from II liga.
    const relegatedFromGroup = resolution.relegatedToFeederIds
      .map(clubId => rankedClubs.find(club => club.id === clubId)!)
      .filter(club => club.leagueId === groupId);
    assert.equal(
      relegatedFromGroup.length,
      4 + incomingFromSecondLeague.length,
      `${scenario.name}: incorrect number of III-to-IV relegations for ${groupId}`
    );
    relegatedFromGroup.forEach(club => {
      assert.equal(
        resolution.nextLeagueByClubId.get(club.id),
        FOURTH_LEAGUE_BY_VOIVODESHIP[club.polishVoivodeship!],
        `${scenario.name}: ${club.id} was not routed to its voivodeship IV liga`
      );
    });

    const nextThirdLeagueSize = rankedClubs.filter(club =>
      (resolution.nextLeagueByClubId.get(club.id) ?? club.leagueId) === groupId
    ).length;
    assert.equal(nextThirdLeagueSize, 18, `${scenario.name}: ${groupId} must finish with 18 clubs`);
  });

  const transitionedClubs = rankedClubs.map(club => ({
    ...club,
    leagueId: resolution.nextLeagueByClubId.get(club.id) ?? club.leagueId,
  }));
  const originalFourthLeagueSizes = new Map(FOURTH_LEAGUE_IDS.map(leagueId => [
    leagueId,
    careerClubs.filter(club => club.leagueId === leagueId).length,
  ]));
  const poolIdsBeforeRebalance = new Map(
    (Object.entries(FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP) as Array<[PolishVoivodeship, string]>).map(([voivodeship, poolId]) => [
      voivodeship,
      new Set(transitionedClubs.filter(club => club.leagueId === poolId).map(club => club.id)),
    ])
  );
  const fourthLeagueIdsBeforeRebalance = new Map(FOURTH_LEAGUE_IDS.map(leagueId => [
    leagueId,
    new Set(transitionedClubs.filter(club => club.leagueId === leagueId).map(club => club.id)),
  ]));

  const rebalanced = PolishFourthLeagueService.rebalanceForNextSeason(
    transitionedClubs,
    2027,
    seed + 1
  );

  (Object.entries(FOURTH_LEAGUE_BY_VOIVODESHIP) as Array<[PolishVoivodeship, typeof FOURTH_LEAGUE_IDS[number]]>)
    .forEach(([voivodeship, leagueId]) => {
      const poolId = FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP[voivodeship];
      const previousFourthLeagueIds = fourthLeagueIdsBeforeRebalance.get(leagueId)!;
      const previousPoolIds = poolIdsBeforeRebalance.get(voivodeship)!;
      const preRebalanceSize = previousFourthLeagueIds.size;
      const targetSize = originalFourthLeagueSizes.get(leagueId)!;
      const expectedFourthLeagueDrops = Math.max(0, preRebalanceSize + 4 - targetSize);
      const actualFourthLeagueDrops = [...previousFourthLeagueIds]
        .filter(clubId => rebalanced.find(club => club.id === clubId)?.leagueId !== leagueId)
        .length;
      const promotedFromRegionalPool = rebalanced
        .filter(club => club.leagueId === leagueId && previousPoolIds.has(club.id));

      assert.equal(
        actualFourthLeagueDrops,
        expectedFourthLeagueDrops,
        `${scenario.name}: ${leagueId} did not absorb its III-liga cascade correctly`
      );
      assert.equal(
        promotedFromRegionalPool.length,
        4,
        `${scenario.name}: ${leagueId} must receive four clubs from its own regional pool`
      );
      assert.equal(
        rebalanced.filter(club => club.leagueId === leagueId).length,
        targetSize,
        `${scenario.name}: ${leagueId} did not return to its configured size`
      );
      assert.equal(
        rebalanced.filter(club => club.leagueId === poolId).length,
        18,
        `${scenario.name}: ${poolId} did not return to 18 clubs`
      );
      assert.ok(
        rebalanced.filter(club => club.leagueId === leagueId || club.leagueId === poolId)
          .every(club => club.polishVoivodeship === voivodeship),
        `${scenario.name}: a club crossed a voivodeship boundary in ${leagueId}`
      );
    });

  // A final schedule creation proves that every arithmetically balanced league
  // is also accepted by the real next-season scheduler, not merely by counts in
  // this test file.
  PolishFourthLeagueService.createSeason(
    rebalanced,
    SeasonTemplateGenerator.generate(2027),
    seed + 1
  );
});

console.log(`PolishRegionalRelegationMatrixTests: OK (${SCENARIOS.length} scenarios)`);
