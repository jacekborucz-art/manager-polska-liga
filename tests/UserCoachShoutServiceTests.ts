import assert from 'node:assert/strict';
import {
  HealthStatus,
  PlayerPosition,
  Region,
  type Player,
} from '../types';
import {
  UserCoachShoutService,
  type UserCoachShoutSituation,
} from '../services/UserCoachShoutService';

const makePlayer = (index: number, overrides: Partial<Player> = {}): Player => ({
  id: `shout-player-${index}`,
  firstName: 'Test',
  lastName: `Player ${index}`,
  age: 25,
  clubId: 'user-club',
  nationality: Region.POLAND,
  position: index === 0 ? PlayerPosition.GK : PlayerPosition.MID,
  overallRating: 68,
  attributes: {
    strength: 65,
    stamina: 70,
    pace: 65,
    defending: 65,
    passing: 68,
    attacking: 65,
    finishing: 62,
    technique: 67,
    vision: 66,
    dribbling: 64,
    heading: 64,
    positioning: 68,
    goalkeeping: index === 0 ? 70 : 10,
    freeKicks: 55,
    talent: 65,
    penalties: 55,
    corners: 55,
    aggression: 58,
    crossing: 62,
    leadership: 64,
    mentality: 78,
    workRate: 72,
  },
  stats: {
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    matchesPlayed: 0,
    minutesPlayed: 0,
    seasonalChanges: {},
    ratingHistory: [],
  },
  health: { status: HealthStatus.HEALTHY },
  condition: 95,
  suspensionMatches: 0,
  contractEndDate: '2030-06-30',
  annualSalary: 100000,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 0,
  morale: 62,
  moralePersonality: 'PROFESSIONAL',
  ...overrides,
} as Player);

const players = Array.from({ length: 11 }, (_, index) => makePlayer(index));
const startingXI = players.map(player => player.id);
const fatigueMap = Object.fromEntries(startingXI.map(id => [id, 92]));

const losingPoorly: UserCoachShoutSituation = {
  scoreDiff: -2,
  shotDiff: -6,
  shotsOnTargetDiff: -3,
  userMomentum: -24,
  recentlyScored: false,
  recentlyConceded: false,
  averageFatigue: 84,
  averageMorale: 45,
  yellowCardCount: 1,
};

const leadingComfortably: UserCoachShoutSituation = {
  scoreDiff: 3,
  shotDiff: 7,
  shotsOnTargetDiff: 4,
  userMomentum: 38,
  recentlyScored: false,
  recentlyConceded: false,
  averageFatigue: 82,
  averageMorale: 72,
  yellowCardCount: 0,
};

const fixedRngA = UserCoachShoutService.createRngState(123456789);
const fixedRngB = UserCoachShoutService.createRngState(123456789);
assert.deepEqual(fixedRngA, fixedRngB, 'Stałe prywatne entropy powinno dawać odtwarzalny stan wyłącznie w testach.');

const firstIssue = UserCoachShoutService.issue({
  id: 'MOTIVATE',
  minute: 20,
  rngState: fixedRngA,
  situation: losingPoorly,
});
const replayedIssue = UserCoachShoutService.issue({
  id: 'MOTIVATE',
  minute: 20,
  rngState: fixedRngB,
  situation: losingPoorly,
});
assert.deepEqual(firstIssue, replayedIssue, 'Ten sam zapis stanu emocjonalnego musi odtwarzać wydany już okrzyk.');
assert.equal(firstIssue.rngState.drawCount, 4, 'Każdy okrzyk powinien przesuwać osobny strumień RNG.');

const secondIssue = UserCoachShoutService.issue({
  id: 'MOTIVATE',
  minute: 25,
  rngState: firstIssue.rngState,
  situation: losingPoorly,
  previousActive: firstIssue.active,
  memory: firstIssue.memory,
});
assert.equal(secondIssue.rngState.drawCount, 8, 'Kolejny okrzyk musi kontynuować strumień zamiast wracać do seeda meczu.');
assert.notEqual(secondIssue.active.responseSeed, firstIssue.active.responseSeed, 'Kolejne okrzyki muszą otrzymywać świeże losowanie.');
assert.equal(secondIssue.active.repeatCount, 1, 'Spamowanie tym samym okrzykiem powinno mieć malejącą skuteczność.');

assert.equal(
  UserCoachShoutService.getContextCategory({ ...losingPoorly, recentlyConceded: true }),
  'JUST_CONCEDED',
  'Świeżo stracony gol powinien mieć pierwszeństwo w kontekście okrzyku.'
);
assert.equal(
  UserCoachShoutService.getContextCategory({ ...losingPoorly, shotDiff: 5, shotsOnTargetDiff: 3, userMomentum: 20 }),
  'LOSING_WELL',
  'Silny występ mimo niekorzystnego wyniku nie może być oceniany jak słaba gra.'
);
assert.equal(UserCoachShoutService.getMentalState(leadingComfortably), 'COMPLACENT');
assert.equal(UserCoachShoutService.getMentalState({ ...losingPoorly, averageFatigue: 58 }), 'EXHAUSTED');

const activeMinute = firstIssue.active.startsMinute;
const positiveEffects = UserCoachShoutService.getEffects({
  active: firstIssue.active,
  minute: activeMinute,
  rngState: firstIssue.rngState,
  players,
  startingXI,
  fatigueMap,
  yellowCards: {},
});
assert.equal(positiveEffects.active, true);
assert.ok(positiveEffects.averageResponse > 0, 'Logiczny okrzyk powinien przeciętnie pomagać stabilnej drużynie.');
assert.ok(positiveEffects.positiveShare > 0.5, 'Większość stabilnego zespołu powinna zareagować pozytywnie.');

const beforeReaction = UserCoachShoutService.getEffects({
  active: firstIssue.active,
  minute: firstIssue.active.startsMinute - 1,
  rngState: firstIssue.rngState,
  players,
  startingXI,
  fatigueMap,
  yellowCards: {},
});
const afterExpiry = UserCoachShoutService.getEffects({
  active: firstIssue.active,
  minute: firstIssue.active.expiryMinute + 1,
  rngState: firstIssue.rngState,
  players,
  startingXI,
  fatigueMap,
  yellowCards: {},
});
assert.equal(beforeReaction.active, false, 'Okrzyk nie może działać przed reakcją zawodników.');
assert.equal(afterExpiry.active, false, 'Okrzyk musi wygasać automatycznie.');

const stableBias = UserCoachShoutService.getPlayerMatchDayBias(firstIssue.rngState.entropySeed, players[3].id);
assert.equal(
  stableBias,
  UserCoachShoutService.getPlayerMatchDayBias(firstIssue.rngState.entropySeed, players[3].id),
  'Dyspozycja dnia zawodnika powinna pozostać stała przez cały mecz.'
);

let foundUnexpectedReaction = false;
for (let entropy = 1; entropy <= 400 && !foundUnexpectedReaction; entropy += 1) {
  const rng = UserCoachShoutService.createRngState(entropy);
  const issued = UserCoachShoutService.issue({ id: 'MOTIVATE', minute: 20, rngState: rng, situation: losingPoorly });
  const effects = UserCoachShoutService.getEffects({
    active: issued.active,
    minute: issued.active.startsMinute,
    rngState: issued.rngState,
    players,
    startingXI,
    fatigueMap,
    yellowCards: {},
  });
  foundUnexpectedReaction = effects.unexpectedShare > 0;
}
assert.equal(foundUnexpectedReaction, true, 'Rzadkie reakcje wbrew logice muszą być realnie osiągalne.');
assert.equal(Array.isArray(firstIssue.active), false, 'Aktywny okrzyk nie może przechowywać rosnącej historii.');
assert.equal('playerResponses' in firstIssue.active, false, 'Reakcje zawodników powinny być odtwarzane z małych seedów, nie zapisywane jako tablica.');

console.log('UserCoachShoutService tests passed.');
