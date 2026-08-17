// tests/ReserveScheduleServiceTests.ts
var import_node_assert = require("node:assert");

// services/ReserveScheduleService.ts
var SEASON_START_MONTH = 7;
var SEASON_START_DAY = 1;
var WINTER_BREAK_START_DAY = 1;
var SECOND_HALF_START_MONTH = 2;
var SECOND_HALF_START_DAY = 1;
var SEASON_END_MONTH = 5;
var SEASON_END_DAY = 30;
var MAX_OPPONENTS = 17;
function seededShuffle(arr, seed) {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = s * 1664525 + 1013904223 & 4294967295;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = Math.imul(state, 1664525) + 1013904223 >>> 0;
    return state / 4294967296;
  };
}
function samplePoisson(lambda, random) {
  const limit = Math.exp(-lambda);
  let product = 1;
  let goals = -1;
  do {
    goals += 1;
    product *= Math.max(1e-6, random());
  } while (product > limit && goals < 9);
  return Math.max(0, goals);
}
function firstSaturdayOnOrAfter(date) {
  const d = new Date(date);
  const day = d.getDay();
  const daysToSat = day === 6 ? 0 : 6 - day;
  d.setDate(d.getDate() + daysToSat);
  return d;
}
function isInWinterBreak(date) {
  const m = date.getMonth();
  const d = date.getDate();
  if (m === 11 && d >= WINTER_BREAK_START_DAY) return true;
  if (m === 0) return true;
  if (m === 1) return true;
  if (m === 2 && d < SECOND_HALF_START_DAY) return true;
  return false;
}
function isAfterSeasonEnd(date, year) {
  if (date.getFullYear() > year + 1) return true;
  if (date.getFullYear() === year + 1 && date.getMonth() > SEASON_END_MONTH) return true;
  if (date.getFullYear() === year + 1 && date.getMonth() === SEASON_END_MONTH && date.getDate() > SEASON_END_DAY) return true;
  return false;
}
var ReserveScheduleService = {
  alignToSeasonStartYear(fixtures, season, seasonStartYear) {
    const seasonIdPart = `_${season}_`;
    return fixtures.map((fixture) => {
      if (!fixture.id.includes(seasonIdPart)) return fixture;
      const date = new Date(fixture.date);
      if (Number.isNaN(date.getTime())) return fixture;
      const expectedYear = fixture.round === 1 ? seasonStartYear : seasonStartYear + 1;
      if (date.getFullYear() === expectedYear) return fixture;
      date.setFullYear(expectedYear);
      return { ...fixture, date: date.toISOString() };
    });
  },
  generate(userClub2, allPolishClubs, season, seed, seasonStartYear) {
    const userTier = userClub2.tier ?? 1;
    const maxTier = Math.max(...allPolishClubs.map((c) => c.tier ?? 1));
    let lowerTier;
    let upperTier;
    if (userTier < maxTier) {
      lowerTier = userTier + 1;
      upperTier = userTier;
    } else {
      lowerTier = userTier;
      upperTier = userTier - 1 > 0 ? userTier - 1 : userTier;
    }
    const pool = allPolishClubs.filter(
      (c) => c.id !== userClub2.id && (c.tier === upperTier || c.tier === lowerTier)
    );
    const shuffled = seededShuffle(pool, seed);
    const opponents2 = shuffled.slice(0, MAX_OPPONENTS);
    const fixtures = [];
    const seasonYear = seasonStartYear;
    let weekSat1 = firstSaturdayOnOrAfter(new Date(seasonYear, SEASON_START_MONTH, SEASON_START_DAY));
    for (let i = 0; i < opponents2.length; i++) {
      while (isInWinterBreak(weekSat1)) {
        weekSat1.setDate(weekSat1.getDate() + 7);
      }
      const matchDate1 = new Date(weekSat1);
      if (i % 4 === 3) {
        matchDate1.setDate(matchDate1.getDate() - 3);
        if (isInWinterBreak(matchDate1)) {
          matchDate1.setDate(matchDate1.getDate() + 3);
        }
      }
      if (isInWinterBreak(matchDate1)) break;
      fixtures.push({
        id: `res_r1_${season}_${i}`,
        date: matchDate1.toISOString(),
        isHome: i % 2 === 0,
        opponentClubId: opponents2[i].id,
        opponentClubName: opponents2[i].name,
        round: 1
      });
      weekSat1.setDate(weekSat1.getDate() + 7);
    }
    let weekSat2 = firstSaturdayOnOrAfter(new Date(seasonYear + 1, SECOND_HALF_START_MONTH, SECOND_HALF_START_DAY));
    for (let i = 0; i < opponents2.length; i++) {
      const matchDate2 = new Date(weekSat2);
      if (i % 4 === 3) {
        matchDate2.setDate(matchDate2.getDate() - 3);
        if (isInWinterBreak(matchDate2)) {
          matchDate2.setDate(matchDate2.getDate() + 3);
        }
      }
      if (isAfterSeasonEnd(matchDate2, seasonYear)) break;
      fixtures.push({
        id: `res_r2_${season}_${i}`,
        date: matchDate2.toISOString(),
        isHome: i % 2 !== 0,
        opponentClubId: opponents2[i].id,
        opponentClubName: opponents2[i].name,
        round: 2
      });
      weekSat2.setDate(weekSat2.getDate() + 7);
    }
    return fixtures;
  },
  /**
   * Odtwarza wirtualne rozgrywki rezerw po przejęciu klubu w trakcie sezonu.
   * Zakończone terminy otrzymują wyłącznie deterministyczny wynik, bez zdarzeń
   * i statystyk zawodników. Pierwszy późniejszy mecz pozostaje nierozstrzygnięty,
   * dzięki czemu standardowy silnik przygotuje dla niego pełny raport.
   */
  generateForMidSeasonTakeover(userClub2, allPolishClubs, season, seed, seasonStartYear, takeoverDate2) {
    const schedule = this.generate(userClub2, allPolishClubs, season, seed, seasonStartYear);
    const clubById = new Map(allPolishClubs.map((club) => [club.id, club]));
    const takeoverDayEnd = new Date(takeoverDate2);
    takeoverDayEnd.setHours(23, 59, 59, 999);
    const results = [];
    const fixtures = schedule.map((fixture) => {
      const fixtureDate = new Date(fixture.date);
      if (Number.isNaN(fixtureDate.getTime()) || fixtureDate.getTime() > takeoverDayEnd.getTime()) {
        return fixture;
      }
      const opponent = clubById.get(fixture.opponentClubId);
      const userReputation = userClub2.reputation ?? 5;
      const opponentReputation = opponent?.reputation ?? 5;
      const homeReputation = fixture.isHome ? userReputation : opponentReputation;
      const awayReputation = fixture.isHome ? opponentReputation : userReputation;
      const strengthDifference = homeReputation - awayReputation;
      const random = createSeededRandom(
        (seed ^ hashString(`${userClub2.id}|${fixture.id}|${fixture.date}`)) >>> 0
      );
      const homeExpectedGoals = Math.max(0.3, Math.min(3.5, 1.35 + strengthDifference * 0.08 + 0.22));
      const awayExpectedGoals = Math.max(0.25, Math.min(3.25, 1.2 - strengthDifference * 0.08));
      const homeScore = samplePoisson(homeExpectedGoals, random);
      const awayScore = samplePoisson(awayExpectedGoals, random);
      const resultId = `res_summary_${fixture.id}`;
      const userTeamName = `${userClub2.shortName || userClub2.name} II`;
      const opponentTeamName = `${opponent?.shortName || opponent?.name || fixture.opponentClubName} II`;
      results.push({
        id: resultId,
        date: fixture.date,
        season,
        homeTeamName: fixture.isHome ? userTeamName : opponentTeamName,
        awayTeamName: fixture.isHome ? opponentTeamName : userTeamName,
        isUserHome: fixture.isHome,
        homeScore,
        awayScore,
        venue: fixture.isHome ? userClub2.stadiumName ?? "Stadion" : opponent?.stadiumName ?? "Stadion",
        opponentClubId: fixture.opponentClubId,
        goals: [],
        missedPenalties: [],
        cards: [],
        substitutions: [],
        injuries: [],
        ratings: {},
        userStartingXI: [],
        matchPlayers: [],
        isSummaryOnly: true
      });
      return { ...fixture, resultId };
    });
    return { fixtures, results };
  }
};

// tests/ReserveScheduleServiceTests.ts
var userClub = {
  id: "USER",
  name: "Klub u\u017Cytkownika",
  tier: 1
};
var opponents = Array.from({ length: 17 }, (_, index) => ({
  id: `OPPONENT_${index}`,
  name: `Rywal ${index + 1}`,
  tier: 2
}));
var schedule2025 = ReserveScheduleService.generate(userClub, [userClub, ...opponents], 1, 12345, 2025);
import_node_assert.strict.ok(schedule2025.length > 0, "terminarz rezerw musi zawiera\u0107 mecze");
import_node_assert.strict.equal(new Date(schedule2025[0].date).getFullYear(), 2025, "start kariery 2025/26 ma wygenerowa\u0107 rund\u0119 jesienn\u0105 w 2025 roku");
import_node_assert.strict.ok(
  schedule2025.filter((fixture) => fixture.round === 2).every((fixture) => new Date(fixture.date).getFullYear() === 2026),
  "runda wiosenna sezonu 2025/26 ma przypada\u0107 na 2026 rok"
);
var schedule2026 = ReserveScheduleService.generate(userClub, [userClub, ...opponents], 1, 12345, 2026);
import_node_assert.strict.ok(schedule2026.length > 0, "terminarz rezerw dla startu 2026/27 musi zawiera\u0107 mecze");
import_node_assert.strict.equal(new Date(schedule2026[0].date).getFullYear(), 2026, "numer sezonu 1 nie mo\u017Ce cofa\u0107 terminarza startu 2026/27 do 2025 roku");
import_node_assert.strict.ok(
  schedule2026.filter((fixture) => fixture.round === 2).every((fixture) => new Date(fixture.date).getFullYear() === 2027),
  "runda wiosenna sezonu 2026/27 ma przypada\u0107 na 2027 rok"
);
var migratedSchedule = ReserveScheduleService.alignToSeasonStartYear(schedule2025, 1, 2026);
import_node_assert.strict.ok(
  migratedSchedule.filter((fixture) => fixture.round === 1).every((fixture) => new Date(fixture.date).getFullYear() === 2026),
  "wczytany b\u0142\u0119dny terminarz rundy jesiennej musi zosta\u0107 przesuni\u0119ty na rok rozpocz\u0119cia sezonu"
);
import_node_assert.strict.ok(
  migratedSchedule.filter((fixture) => fixture.round === 2).every((fixture) => new Date(fixture.date).getFullYear() === 2027),
  "wczytany b\u0142\u0119dny terminarz rundy wiosennej musi zosta\u0107 przesuni\u0119ty na kolejny rok"
);
var takeoverDate = new Date(2026, 9, 5, 12, 0, 0);
var takeoverSchedule = ReserveScheduleService.generateForMidSeasonTakeover(
  userClub,
  [userClub, ...opponents],
  1,
  12345,
  2026,
  takeoverDate
);
var pastFixtures = takeoverSchedule.fixtures.filter((fixture) => new Date(fixture.date).getTime() <= new Date(2026, 9, 5, 23, 59, 59, 999).getTime());
var futureFixtures = takeoverSchedule.fixtures.filter((fixture) => new Date(fixture.date).getTime() > new Date(2026, 9, 5, 23, 59, 59, 999).getTime());
import_node_assert.strict.ok(pastFixtures.length > 0, "przej\u0119cie klubu w trakcie sezonu musi znale\u017A\u0107 wcze\u015Bniejsze mecze rezerw");
import_node_assert.strict.ok(futureFixtures.length > 0, "po przej\u0119ciu klubu musi pozosta\u0107 co najmniej jeden przysz\u0142y mecz rezerw");
import_node_assert.strict.equal(
  takeoverSchedule.results.length,
  pastFixtures.length,
  "ka\u017Cdy wcze\u015Bniejszy termin musi otrzyma\u0107 uproszczony wynik"
);
import_node_assert.strict.ok(pastFixtures.every((fixture) => fixture.resultId), "wcze\u015Bniejsze mecze musz\u0105 wskazywa\u0107 zapisany wynik");
import_node_assert.strict.ok(futureFixtures.every((fixture) => !fixture.resultId), "przysz\u0142e mecze nie mog\u0105 zosta\u0107 zasymulowane podczas przej\u0119cia klubu");
import_node_assert.strict.ok(
  takeoverSchedule.results.every(
    (result) => result.isSummaryOnly && result.goals.length === 0 && result.cards.length === 0 && result.substitutions.length === 0 && Object.keys(result.ratings).length === 0
  ),
  "odtworzone wyniki nie mog\u0105 zawiera\u0107 pe\u0142nego raportu ani statystyk zawodnik\xF3w"
);
var repeatedTakeoverSchedule = ReserveScheduleService.generateForMidSeasonTakeover(
  userClub,
  [userClub, ...opponents],
  1,
  12345,
  2026,
  takeoverDate
);
import_node_assert.strict.deepEqual(
  repeatedTakeoverSchedule.results.map((result) => [result.homeScore, result.awayScore]),
  takeoverSchedule.results.map((result) => [result.homeScore, result.awayScore]),
  "szybkie wyniki musz\u0105 by\u0107 deterministyczne dla tego samego zapisu gry"
);
console.log("ReserveScheduleServiceTests: OK");
