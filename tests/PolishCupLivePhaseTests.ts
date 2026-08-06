import { strict as assert } from 'node:assert';
import {
  getPolishCupExhaustionInjuryChance,
  getPolishCupResumeClock,
  hasPolishCupWalkoverPlayerCount,
} from '../services/PolishCupLivePhaseService';

assert.deepEqual(
  getPolishCupResumeClock({ isExtraTime: false, period: 1, minute: 45 }),
  { period: 2, minute: 45 },
  'zwykła przerwa musi rozpocząć drugą połowę od 45. minuty'
);
assert.deepEqual(
  getPolishCupResumeClock({ isExtraTime: true, period: 3, minute: 105 }),
  { period: 4, minute: 105 },
  'przerwa w dogrywce musi rozpocząć drugą część dogrywki od 105. minuty'
);

assert.equal(getPolishCupExhaustionInjuryChance(64), 0, 'kondycja 64 nie może uruchamiać progresywnego ryzyka');
assert.ok(getPolishCupExhaustionInjuryChance(50) <= 0.0025, 'ryzyko przy kondycji 50 nie może wynosić kilkudziesięciu procent na minutę');
assert.ok(getPolishCupExhaustionInjuryChance(15) <= 0.009, 'ryzyko przy bardzo niskiej kondycji musi pozostać ograniczone');
assert.ok(getPolishCupExhaustionInjuryChance(0) <= 0.012, 'maksymalne ryzyko na minutę musi mieć bezpieczny limit');
assert.ok(
  getPolishCupExhaustionInjuryChance(20) > getPolishCupExhaustionInjuryChance(55),
  'ryzyko nadal musi rosnąć wraz z wyczerpaniem zawodnika'
);

assert.equal(hasPolishCupWalkoverPlayerCount(7), false, 'siedmiu zawodników może kontynuować spotkanie');
assert.equal(hasPolishCupWalkoverPlayerCount(6), true, 'mniej niż siedmiu zawodników musi zakończyć spotkanie');

console.log('PolishCupLivePhaseTests: OK');
