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
console.log("ReserveScheduleServiceTests: OK");
