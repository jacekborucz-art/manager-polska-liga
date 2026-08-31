import { MatchEngineRegistry } from '../services/match/MatchEngineRegistry';
import type { PendingLeagueMatchEngineSelection } from '../types';

const assert = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const fixtureId = 'LEAGUE_2026_08_29_HOME_AWAY';

assert(
  MatchEngineRegistry.resolveLeagueEngine(fixtureId, null).id === 'LEGACY_1_0',
  'Missing state must default to Match Engine 1.0.',
);

const staleSelection: PendingLeagueMatchEngineSelection = {
  fixtureId: 'PREVIOUS_FIXTURE',
  engineId: 'PROTOTYPE_2_0',
  locked: true,
};
assert(
  MatchEngineRegistry.resolveLeagueEngine(fixtureId, staleSelection).id === 'LEGACY_1_0',
  'A prototype choice must never leak into another fixture.',
);

const selectedPrototype: PendingLeagueMatchEngineSelection = {
  fixtureId,
  engineId: 'PROTOTYPE_2_0',
  locked: true,
};
assert(
  MatchEngineRegistry.resolveLeagueEngine(fixtureId, selectedPrototype).id === 'PROTOTYPE_2_0',
  'The selected fixture should enter the prototype route.',
);

assert(
  MatchEngineRegistry.listLeagueEngines()[0]?.id === 'LEGACY_1_0',
  'The visible engine list must keep 1.0 as its first/default option.',
);

console.log('MatchEngineRegistryTests: PASS');
