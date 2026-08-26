import assert from 'node:assert/strict';
import { HealthStatus, MatchEventType, Player, PlayerPosition, Region } from '../types';
import { PlayerStatsService } from '../services/PlayerStatsService';

const makePlayer = (id: string, clubId: string, position: PlayerPosition = PlayerPosition.MID): Player => ({
  id,
  firstName: id,
  lastName: 'Test',
  clubId,
  position,
  nationality: Region.POLAND,
  nationalityCountry: 'Polska',
  age: 24,
  overallRating: 70,
  reputacja: 60,
  lojalnosc: 60,
  attributes: {
    pace: 70,
    acceleration: 70,
    strength: 70,
    stamina: 70,
    finishing: 70,
    passing: 70,
    vision: 70,
    technique: 70,
    dribbling: 70,
    crossing: 70,
    defending: 70,
    positioning: 70,
    attacking: 70,
    mentality: 70,
    workRate: 70,
    aggression: 70,
    leadership: 70,
    goalkeeping: 5,
    reflexes: 5,
    handling: 5,
    aerial: 70,
    talent: 75,
    freeKicks: 70,
    penalties: 70,
    corners: 70,
  },
  stats: {
    matchesPlayed: 0,
    minutesPlayed: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    seasonalChanges: {},
    ratingHistory: [],
  },
  health: { status: HealthStatus.HEALTHY },
  condition: 99,
  fatigueDebt: 0,
  suspensionMatches: 0,
  annualSalary: 100_000,
  marketValue: 1_000_000,
  contractEndDate: '2028-06-30T00:00:00.000Z',
  history: [],
} as Player);

const homeScorer = makePlayer('HOME_SCORER', 'HOME', PlayerPosition.FWD);
const homeAssistant = makePlayer('HOME_ASSISTANT', 'HOME');
const awayBooked = makePlayer('AWAY_BOOKED', 'AWAY', PlayerPosition.DEF);
const unrelated = makePlayer('UNRELATED', 'OTHER');
const freeAgent = makePlayer('FREE_AGENT', 'FREE_AGENTS');

const source = {
  HOME: [homeScorer, homeAssistant],
  AWAY: [awayBooked],
  OTHER: [unrelated],
  FREE_AGENTS: [freeAgent],
};

const legacyGoalResult = PlayerStatsService.applyGoal(
  source,
  homeScorer.id,
  homeAssistant.id,
  'L_TEST'
);
const scopedGoalResult = PlayerStatsService.applyGoal(
  source,
  homeScorer.id,
  homeAssistant.id,
  'L_TEST',
  ['HOME', 'AWAY']
);

assert.deepEqual(scopedGoalResult, legacyGoalResult, 'scoped goal update must preserve the legacy statistic result');
assert.equal(scopedGoalResult.OTHER, source.OTHER, 'an unrelated club squad must keep its array reference');
assert.equal(scopedGoalResult.FREE_AGENTS, source.FREE_AGENTS, 'FREE_AGENTS must keep its array reference');
assert.equal(scopedGoalResult.HOME[0].stats.goals, 1, 'the scorer must receive one goal');
assert.equal(scopedGoalResult.HOME[1].stats.assists, 1, 'the assistant must receive one assist');
assert.equal(scopedGoalResult.HOME[0].competitionStats?.L_TEST?.goals, 1, 'competition goals must remain synchronized');

const legacyCardResult = PlayerStatsService.applyCard(
  source,
  awayBooked.id,
  MatchEventType.YELLOW_CARD,
  'L_TEST'
);
const scopedCardResult = PlayerStatsService.applyCard(
  source,
  awayBooked.id,
  MatchEventType.YELLOW_CARD,
  'L_TEST',
  ['HOME', 'AWAY']
);

assert.deepEqual(scopedCardResult, legacyCardResult, 'scoped card update must preserve the legacy statistic result');
assert.equal(scopedCardResult.OTHER, source.OTHER, 'card update must not copy an unrelated squad');
assert.equal(scopedCardResult.FREE_AGENTS, source.FREE_AGENTS, 'card update must not copy FREE_AGENTS');
assert.equal(scopedCardResult.AWAY[0].stats.yellowCards, 1, 'the booked player must receive one yellow card');

// A legacy or malformed fixture may supply the wrong scope. The compatibility
// fallback must still locate the player rather than silently dropping the event.
const fallbackResult = PlayerStatsService.applyCard(
  source,
  unrelated.id,
  MatchEventType.RED_CARD,
  'L_TEST',
  ['HOME', 'AWAY']
);
assert.equal(fallbackResult.OTHER[0].stats.redCards, 1, 'fallback search must preserve old-save compatibility');
assert.equal(fallbackResult.OTHER[0].suspensionMatches, 2, 'red-card suspension logic must remain unchanged');
assert.equal(fallbackResult.FREE_AGENTS, source.FREE_AGENTS, 'fallback must stop before touching later unrelated buckets');

// A missing event id should be a genuine no-op. Returning the original record
// prevents React state churn and proves that no statistic was fabricated.
const missingResult = PlayerStatsService.applyGoal(
  source,
  'MISSING_PLAYER',
  undefined,
  'L_TEST',
  ['HOME', 'AWAY']
);
assert.equal(missingResult, source, 'a missing player event must preserve the original world record');

// Deterministic performance guard: count squad-array traversals instead of
// relying on machine-dependent milliseconds. A scoped event may inspect only
// the two fixture squads, regardless of how large the rest of the world is.
let scopedMapCalls = 0;
const trackedSquad = (squad: Player[]): Player[] => new Proxy(squad, {
  get(target, property, receiver) {
    if (property === 'map') {
      return (...args: Parameters<Player[]['map']>) => {
        scopedMapCalls += 1;
        return (target.map as (...innerArgs: Parameters<Player[]['map']>) => unknown[])(...args);
      };
    }
    return Reflect.get(target, property, receiver);
  },
}) as Player[];

const largeWorld: Record<string, Player[]> = {
  HOME: trackedSquad([makePlayer('PERF_SCORER', 'HOME', PlayerPosition.FWD)]),
  AWAY: trackedSquad([makePlayer('PERF_AWAY', 'AWAY')]),
  FREE_AGENTS: trackedSquad(Array.from({ length: 15_000 }, (_, index) =>
    makePlayer(`PERF_FA_${index}`, 'FREE_AGENTS')
  )),
};
for (let index = 0; index < 600; index++) {
  largeWorld[`AI_${index}`] = trackedSquad([makePlayer(`PERF_AI_${index}`, `AI_${index}`)]);
}

const largeWorldFreeAgents = largeWorld.FREE_AGENTS;
PlayerStatsService.applyGoal(
  largeWorld,
  'PERF_SCORER',
  undefined,
  'L_PERF',
  ['HOME', 'AWAY']
);
assert.equal(scopedMapCalls, 2, 'one scoped event must traverse only the two fixture squads');
assert.equal(largeWorld.FREE_AGENTS, largeWorldFreeAgents, 'the large free-agent pool must remain untouched');

console.log('PlayerStatsScopedUpdateTests: OK');
