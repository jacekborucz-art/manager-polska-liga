// services/match/MatchEngineRegistry.ts
var DEFINITIONS = {
  LEGACY_1_0: {
    id: "LEGACY_1_0",
    label: "Silnik 1.0 \u2014 klasyczny",
    shortLabel: "Silnik 1.0",
    description: "Dotychczasowy, domy\u015Blny przebieg meczu.",
    isPrototype: false
  },
  PROTOTYPE_2_0: {
    id: "PROTOTYPE_2_0",
    label: "Silnik 2.0 \u2014 prototyp",
    shortLabel: "Silnik 2.0",
    description: "Interaktywny prototyp SVG przeznaczony do dobrowolnych test\xF3w.",
    isPrototype: true
  }
};
var MatchEngineRegistry = {
  defaultEngineId: "LEGACY_1_0",
  listLeagueEngines() {
    return [DEFINITIONS.LEGACY_1_0, DEFINITIONS.PROTOTYPE_2_0];
  },
  get(engineId) {
    return DEFINITIONS[engineId] ?? DEFINITIONS.LEGACY_1_0;
  },
  resolveLeagueEngine(fixtureId2, pending) {
    if (!fixtureId2 || pending?.fixtureId !== fixtureId2) return DEFINITIONS.LEGACY_1_0;
    return DEFINITIONS[pending.engineId] ?? DEFINITIONS.LEGACY_1_0;
  }
};

// tests/MatchEngineRegistryTests.ts
var assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
var fixtureId = "LEAGUE_2026_08_29_HOME_AWAY";
assert(
  MatchEngineRegistry.resolveLeagueEngine(fixtureId, null).id === "LEGACY_1_0",
  "Missing state must default to Match Engine 1.0."
);
var staleSelection = {
  fixtureId: "PREVIOUS_FIXTURE",
  engineId: "PROTOTYPE_2_0",
  locked: true
};
assert(
  MatchEngineRegistry.resolveLeagueEngine(fixtureId, staleSelection).id === "LEGACY_1_0",
  "A prototype choice must never leak into another fixture."
);
var selectedPrototype = {
  fixtureId,
  engineId: "PROTOTYPE_2_0",
  locked: true
};
assert(
  MatchEngineRegistry.resolveLeagueEngine(fixtureId, selectedPrototype).id === "PROTOTYPE_2_0",
  "The selected fixture should enter the prototype route."
);
assert(
  MatchEngineRegistry.listLeagueEngines()[0]?.id === "LEGACY_1_0",
  "The visible engine list must keep 1.0 as its first/default option."
);
console.log("MatchEngineRegistryTests: PASS");
