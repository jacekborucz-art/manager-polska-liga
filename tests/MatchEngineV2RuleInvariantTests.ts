import assert from 'node:assert/strict';
import { MatchEventType } from '../types';
import {
  CupMatchEngineV2,
  CupDisciplineResolver,
  CupSampleMatchFactory,
  CupTeamProfileService,
  DEFAULT_CUP_ENGINE_CONFIG,
  createInitialCupRuntimeState,
  type CupMatchResult,
} from '../services/match/engines/cupV2';
import {
  LEAGUE_MATCH_RULES_V2,
  MatchEngineV2,
  type MatchEngineV2Input,
} from '../services/match/engines/v2';

const ordinaryGoalTypes = new Set([
  MatchEventType.GOAL,
  MatchEventType.ONE_ON_ONE_GOAL,
  MatchEventType.PENALTY_SCORED,
]);

const assertCommonInvariants = (result: CupMatchResult): void => {
  assert.equal(result.finalState.phase, 'FINISHED');
  assert.equal(new Set(result.events.map(event => event.id)).size, result.events.length, 'Event ids must be unique.');
  result.events.forEach((event, index) => {
    assert.ok(event.second >= 0 && event.second <= result.finalState.second);
    if (index > 0) assert.ok(event.second >= result.events[index - 1].second, 'Events must be chronological.');
  });

  const homeGoals = result.events.filter(event => event.side === 'HOME' && ordinaryGoalTypes.has(event.type) && event.detail?.isShootout !== true).length;
  const awayGoals = result.events.filter(event => event.side === 'AWAY' && ordinaryGoalTypes.has(event.type) && event.detail?.isShootout !== true).length;
  assert.equal(result.homeScore, homeGoals);
  assert.equal(result.awayScore, awayGoals);
  assert.equal(result.stats.HOME.goals, result.homeScore);
  assert.equal(result.stats.AWAY.goals, result.awayScore);
  assert.equal(
    result.stats.HOME.corners + result.stats.AWAY.corners,
    result.events.filter(event => event.type === MatchEventType.CORNER).length,
  );

  const byId = new Map(result.events.map(event => [event.id, event]));
  const injuryEvents = result.events.filter(event =>
    event.type === MatchEventType.INJURY_LIGHT || event.type === MatchEventType.INJURY_SEVERE
  );
  assert.equal(
    new Set(injuryEvents.map(event => event.playerId)).size,
    injuryEvents.length,
    'A player cannot receive duplicate injury reports in one match.',
  );
  result.events
    .filter(event => event.type === MatchEventType.MEDICAL_TREATMENT)
    .forEach(treatment => {
      const injury = result.events.find(event => event.id === treatment.detail?.sourceInjuryId);
      assert.ok(injury, 'Medical treatment must reference an injury event.');
      assert.equal(injury?.playerId, treatment.playerId);
      assert.equal(injury?.second, treatment.second);
    });
  result.events
    .filter(event => event.type === MatchEventType.ADVANTAGE_PLAYED)
    .forEach(advantage => {
      assert.equal(advantage.detail?.advantagePlayed, true);
      assert.ok(!result.events.some(event =>
        event.second === advantage.second &&
        (event.type === MatchEventType.FREE_KICK ||
          event.type === MatchEventType.FREE_KICK_DANGEROUS ||
          event.type === MatchEventType.PENALTY_AWARDED)
      ), 'Advantage cannot also create a stopped-ball restart.');
    });
  (['HOME', 'AWAY'] as const).forEach(side => {
    const substitutions = result.events.filter(event => event.type === MatchEventType.SUBSTITUTION && event.side === side);
    assert.equal(new Set(substitutions.map(event => event.playerId)).size, substitutions.length, 'A substitute cannot enter twice.');
    assert.equal(new Set(substitutions.map(event => event.secondaryPlayerId)).size, substitutions.length, 'A player cannot leave twice.');
    substitutions.forEach((event, index) => {
      const earlierDepartures = new Set(substitutions.slice(0, index).map(previous => previous.secondaryPlayerId));
      assert.ok(!earlierDepartures.has(event.playerId), 'A substituted player cannot return from the bench.');
    });
  });
  const kickOffs = result.events.filter(event => event.type === MatchEventType.KICK_OFF);
  assert.ok(kickOffs.length >= 2, 'Both regulation halves require an explicit kick-off.');
  assert.equal(kickOffs[0].second, 0);
  assert.equal(kickOffs[0].side, result.finalState.firstHalfKickOffSide);
  const halfTimeKickOff = kickOffs.find(event => event.detail?.restartReason === 'HALF_START');
  assert.ok(halfTimeKickOff, 'The second-half kick-off is missing.');
  assert.equal(
    halfTimeKickOff?.second,
    45 * 60 + result.finalState.firstHalfAddedTimeSeconds,
  );
  assert.notEqual(halfTimeKickOff?.side, result.finalState.firstHalfKickOffSide);

  result.events
    .filter(event => event.type === MatchEventType.CORNER_TAKEN || event.type === MatchEventType.GOAL_KICK)
    .forEach(restart => {
      const sourceId = restart.detail?.sourceEventId;
      assert.equal(typeof sourceId, 'string', `Restart ${restart.id} has no source event.`);
      const source = byId.get(sourceId as string);
      assert.ok(source, `Restart ${restart.id} references a missing source event.`);
      assert.ok((source?.second ?? 0) <= restart.second);
      if (restart.type === MatchEventType.CORNER_TAKEN) {
        assert.equal(source?.type, MatchEventType.CORNER);
        assert.equal(source?.side, restart.side);
      } else {
        assert.notEqual(source?.side, restart.side);
      }
    });

  result.events
    .filter(event =>
      event.type === MatchEventType.FREE_KICK ||
      event.type === MatchEventType.FREE_KICK_DANGEROUS ||
      event.type === MatchEventType.PENALTY_AWARDED
    )
    .forEach(award => {
      const sourceId = award.detail?.sourceContactId;
      assert.equal(typeof sourceId, 'string');
      const source = byId.get(sourceId as string);
      assert.ok(source, 'Every foul restart must reference a real contact.');
      assert.equal(source?.second, award.second);
      assert.ok(
        source?.type === MatchEventType.FOUL ||
        source?.type === MatchEventType.YELLOW_CARD ||
        source?.type === MatchEventType.RED_CARD,
      );
      assert.notEqual(source?.side, award.side, 'A fouling team cannot receive its own restart.');
      const illegalTurnover = result.events.find(event =>
        event.second === award.second &&
        (event.type === MatchEventType.MISPLACED_PASS || event.type === MatchEventType.TACKLE_WON)
      );
      assert.equal(illegalTurnover, undefined, 'A foul and a normal turnover cannot resolve the same tick.');
    });

  result.events
    .filter(event => event.type === MatchEventType.PENALTY_SCORED || event.type === MatchEventType.PENALTY_MISSED)
    .filter(event => event.detail?.isShootout !== true)
    .forEach(penalty => {
      assert.equal(penalty.detail?.setPieceKind, 'PENALTY');
      assert.equal(penalty.detail?.assistEligible, false);
      assert.ok(result.events.some(event =>
        event.type === MatchEventType.PENALTY_AWARDED &&
        event.second === penalty.second &&
        event.detail?.sequenceId === penalty.detail?.sequenceId
      ));
    });
};

// Deterministic discipline edge case: every possible fouler is already booked,
// and the forced contact is a yellow-card offence rather than a direct red.
const disciplineSample = CupSampleMatchFactory.makeInput(2199, 'EQUAL');
const disciplineState = createInitialCupRuntimeState(disciplineSample);
const disciplineFatigue = disciplineState.fatigue;
const disciplineHome = CupTeamProfileService.buildProfile(disciplineSample.home, disciplineFatigue, {});
const disciplineAway = CupTeamProfileService.buildProfile(disciplineSample.away, disciplineFatigue, {});
disciplineAway.activePlayers.forEach(player => { disciplineState.yellowCards[player.id] = 1; });
const secondYellow = CupDisciplineResolver.resolveContact({
  ctx: {
    input: disciplineSample,
    config: DEFAULT_CUP_ENGINE_CONFIG,
    state: disciplineState,
    homeProfile: disciplineHome,
    awayProfile: disciplineAway,
    random: salt => salt === 202 ? 0 : salt === 203 ? 1 : salt === 204 ? 0 : salt === 207 ? 1 : 0.5,
  },
  defending: disciplineAway,
  attacking: disciplineHome,
  danger: 0.7,
  salt: 200,
});
assert.equal(secondYellow?.type, MatchEventType.RED_CARD);
assert.equal(secondYellow?.detail?.secondYellow, true);

const advantage = CupDisciplineResolver.resolveContact({
  ctx: {
    input: disciplineSample,
    config: DEFAULT_CUP_ENGINE_CONFIG,
    state: createInitialCupRuntimeState(disciplineSample),
    homeProfile: disciplineHome,
    awayProfile: disciplineAway,
    random: salt => salt === 202 ? 0 : salt === 203 || salt === 204 ? 1 : salt === 207 ? 0 : 0.5,
  },
  defending: disciplineAway,
  attacking: disciplineHome,
  danger: 0.7,
  salt: 200,
});
assert.equal(advantage?.type, MatchEventType.ADVANTAGE_PLAYED);
assert.equal(advantage?.detail?.advantagePlayed, true);

let leaguePenaltyAwards = 0;
let leagueFreeKicks = 0;
let leagueCorners = 0;
let leagueThrowIns = 0;
let leagueOffsides = 0;
let leagueDribbles = 0;
for (let seed = 1; seed <= 60; seed += 1) {
  const sample = CupSampleMatchFactory.makeInput(2200 + seed, seed % 4 === 0 ? 'HOME_FAVORITE' : 'EQUAL');
  const input: MatchEngineV2Input = {
    seed: `rule_invariants_league_${seed}`,
    home: sample.home,
    away: sample.away,
    environment: sample.environment,
    halfTimeTalks: sample.halfTimeTalks,
    calibration: sample.calibration,
    rules: LEAGUE_MATCH_RULES_V2,
    config: { tickSeconds: 5 },
  };
  const result = MatchEngineV2.advanceTo(MatchEngineV2.createMatch(input), 120 * 60).result;
  assertCommonInvariants(result);
  assert.equal(result.decidedByPenalties, false);
  assert.equal(result.penaltyShootout, undefined);
  assert.ok(result.finalState.firstHalfAddedTimeSeconds >= 60 && result.finalState.firstHalfAddedTimeSeconds <= 420);
  assert.ok(result.finalState.secondHalfAddedTimeSeconds >= 60 && result.finalState.secondHalfAddedTimeSeconds <= 420);
  assert.equal(
    result.finalState.addedTimeSeconds,
    result.finalState.firstHalfAddedTimeSeconds + result.finalState.secondHalfAddedTimeSeconds,
  );
  assert.equal(result.finalState.addedTimeSeconds % 5, 0);
  assert.equal(result.finalState.second, 90 * 60 + result.finalState.addedTimeSeconds);
  const firstHalfEnd = 45 * 60 + result.finalState.firstHalfAddedTimeSeconds;
  const normalTimeEnd = 90 * 60 + result.finalState.addedTimeSeconds;
  result.events
    .filter(event => event.second >= firstHalfEnd && event.second < normalTimeEnd)
    .forEach(event => {
      assert.equal(
        event.minute,
        Math.floor((event.second - result.finalState.firstHalfAddedTimeSeconds) / 60) + 1,
        `Incorrect display minute after half-time for ${event.id}.`,
      );
    });
  assert.ok(result.finalState.substitutionsUsed.HOME <= LEAGUE_MATCH_RULES_V2.maxSubstitutions);
  assert.ok(result.finalState.substitutionsUsed.AWAY <= LEAGUE_MATCH_RULES_V2.maxSubstitutions);
  leaguePenaltyAwards += result.events.filter(event => event.type === MatchEventType.PENALTY_AWARDED).length;
  leagueFreeKicks += result.events.filter(event =>
    event.type === MatchEventType.FREE_KICK || event.type === MatchEventType.FREE_KICK_DANGEROUS
  ).length;
  leagueCorners += result.events.filter(event => event.type === MatchEventType.CORNER).length;
  leagueThrowIns += result.events.filter(event => event.type === MatchEventType.THROW_IN).length;
  leagueOffsides += result.events.filter(event => event.type === MatchEventType.OFFSIDE).length;
  leagueDribbles += result.events.filter(event => event.type === MatchEventType.DRIBBLING).length;
}

let shootouts = 0;
let extraTimeMatches = 0;
for (let seed = 1; seed <= 24; seed += 1) {
  const sample = CupSampleMatchFactory.makeInput(3200 + seed, 'EQUAL');
  const result = CupMatchEngineV2.simulate({
    ...sample,
    seed: `rule_invariants_cup_${seed}`,
  });
  assertCommonInvariants(result);
  assert.ok(result.winner === 'HOME' || result.winner === 'AWAY');
  if (result.finalState.second > 90 * 60 + result.finalState.addedTimeSeconds) extraTimeMatches += 1;
  if (result.decidedByPenalties) {
    shootouts += 1;
    assert.equal(result.homeScore, result.awayScore);
    assert.ok(result.penaltyShootout && result.penaltyShootout.length >= 6);
    assert.notEqual(result.penaltyScore?.home, result.penaltyScore?.away);
  }
}

assert.ok(leagueFreeKicks > 0, 'No foul-created free kick was generated.');
assert.ok(leaguePenaltyAwards > 0, 'No foul-created penalty was generated.');
assert.ok(leagueCorners > 0, 'No corner was generated.');
assert.ok(leagueThrowIns > 0, 'No throw-in was generated.');
assert.ok(leagueOffsides > 0, 'No offside was generated.');
assert.ok(leagueDribbles > 0, 'No individual dribble was generated.');
assert.ok(extraTimeMatches > 0, 'Knockout rules never reached extra time.');
assert.ok(shootouts > 0, 'Knockout rules never reached a shootout.');

console.log('MatchEngineV2RuleInvariantTests: OK', {
  leagueMatches: 60,
  leagueFreeKicks,
  leaguePenaltyAwards,
  leagueCorners,
  leagueThrowIns,
  leagueOffsides,
  leagueDribbles,
  knockoutMatches: 24,
  extraTimeMatches,
  shootouts,
});
