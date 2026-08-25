// tests/PolishCupLivePhaseTests.ts
var import_node_assert = require("node:assert");

// services/PolishCupLivePhaseService.ts
var getPolishCupResumeClock = (state) => state.isExtraTime && state.period === 3 && state.minute >= 105 ? { period: 4, minute: 105 } : { period: 2, minute: 45 };
var getPolishCupExhaustionInjuryChance = (condition) => {
  const normalized = Math.max(0, Math.min(100, condition));
  if (normalized >= 64) return 0;
  if (normalized >= 50) return (64 - normalized) / 14 * 25e-4;
  if (normalized >= 15) return 25e-4 + (50 - normalized) / 35 * 65e-4;
  return 9e-3 + (15 - normalized) / 15 * 3e-3;
};
var hasPolishCupWalkoverPlayerCount = (playersOnPitch) => playersOnPitch < 7;

// tests/PolishCupLivePhaseTests.ts
import_node_assert.strict.deepEqual(
  getPolishCupResumeClock({ isExtraTime: false, period: 1, minute: 45 }),
  { period: 2, minute: 45 },
  "zwyk\u0142a przerwa musi rozpocz\u0105\u0107 drug\u0105 po\u0142ow\u0119 od 45. minuty"
);
import_node_assert.strict.deepEqual(
  getPolishCupResumeClock({ isExtraTime: true, period: 3, minute: 105 }),
  { period: 4, minute: 105 },
  "przerwa w dogrywce musi rozpocz\u0105\u0107 drug\u0105 cz\u0119\u015B\u0107 dogrywki od 105. minuty"
);
import_node_assert.strict.equal(getPolishCupExhaustionInjuryChance(64), 0, "kondycja 64 nie mo\u017Ce uruchamia\u0107 progresywnego ryzyka");
import_node_assert.strict.ok(getPolishCupExhaustionInjuryChance(50) <= 25e-4, "ryzyko przy kondycji 50 nie mo\u017Ce wynosi\u0107 kilkudziesi\u0119ciu procent na minut\u0119");
import_node_assert.strict.ok(getPolishCupExhaustionInjuryChance(15) <= 9e-3, "ryzyko przy bardzo niskiej kondycji musi pozosta\u0107 ograniczone");
import_node_assert.strict.ok(getPolishCupExhaustionInjuryChance(0) <= 0.012, "maksymalne ryzyko na minut\u0119 musi mie\u0107 bezpieczny limit");
import_node_assert.strict.ok(
  getPolishCupExhaustionInjuryChance(20) > getPolishCupExhaustionInjuryChance(55),
  "ryzyko nadal musi rosn\u0105\u0107 wraz z wyczerpaniem zawodnika"
);
import_node_assert.strict.equal(hasPolishCupWalkoverPlayerCount(7), false, "siedmiu zawodnik\xF3w mo\u017Ce kontynuowa\u0107 spotkanie");
import_node_assert.strict.equal(hasPolishCupWalkoverPlayerCount(6), true, "mniej ni\u017C siedmiu zawodnik\xF3w musi zako\u0144czy\u0107 spotkanie");
console.log("PolishCupLivePhaseTests: OK");
