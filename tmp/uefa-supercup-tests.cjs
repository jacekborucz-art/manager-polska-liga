// tests/UEFASuperCupServiceTests.ts
var import_node_assert = require("node:assert");

// services/UEFASuperCupService.ts
var UEFASuperCupService = {
  /**
   * Generuje fixture Superpucharu Europy.
   * @param year Rok, w którym rozgrywany jest mecz (23 sierpnia)
   * @param clubs Lista aktualnych klubów
   * @param clWinnerId ID zdobywcy Ligi Mistrzów; ma pierwszeństwo przed obsadą startową
   * @param elWinnerId ID zdobywcy Ligi Europy; ma pierwszeństwo przed obsadą startową
   */
  generateFixture: (year, clubs2, clWinnerId, elWinnerId) => {
    const initialEuropaLeagueWinnerId = year === 2026 ? "EU_EL_ASTON_VILLA" : "EU_CL_TOTTENHAM_HOTSPUR";
    const homeId = clWinnerId ?? "EU_CL_PARIS_SAINT_GERMAIN";
    let awayId = elWinnerId ?? initialEuropaLeagueWinnerId;
    if (homeId === awayId) {
      const fallback = clubs2.find((c) => c.id.startsWith("EU_CL_") && c.id !== homeId);
      awayId = fallback?.id ?? "EU_CL_REAL_MADRYT";
    }
    return {
      id: `UEFA_SUPER_CUP_${year}`,
      leagueId: "UEFA_SUPER_CUP" /* UEFA_SUPER_CUP */,
      homeTeamId: homeId,
      awayTeamId: awayId,
      date: new Date(year, 7, 23),
      // 23 Sierpnia
      status: "SCHEDULED" /* SCHEDULED */,
      homeScore: null,
      awayScore: null
    };
  }
};

// tests/UEFASuperCupServiceTests.ts
var clubs = [];
var season2025Fixture = UEFASuperCupService.generateFixture(2025, clubs);
import_node_assert.strict.equal(season2025Fixture.homeTeamId, "EU_CL_PARIS_SAINT_GERMAIN");
import_node_assert.strict.equal(season2025Fixture.awayTeamId, "EU_CL_TOTTENHAM_HOTSPUR");
var season2026Fixture = UEFASuperCupService.generateFixture(2026, clubs);
import_node_assert.strict.equal(season2026Fixture.homeTeamId, "EU_CL_PARIS_SAINT_GERMAIN");
import_node_assert.strict.equal(season2026Fixture.awayTeamId, "EU_EL_ASTON_VILLA");
import_node_assert.strict.equal(season2026Fixture.leagueId, "UEFA_SUPER_CUP" /* UEFA_SUPER_CUP */);
import_node_assert.strict.equal(season2026Fixture.status, "SCHEDULED" /* SCHEDULED */);
import_node_assert.strict.equal(season2026Fixture.date.getFullYear(), 2026);
import_node_assert.strict.equal(season2026Fixture.date.getMonth(), 7);
import_node_assert.strict.equal(season2026Fixture.date.getDate(), 23);
var generatedWinnersFixture = UEFASuperCupService.generateFixture(
  2026,
  clubs,
  "EU_CL_REAL_MADRYT",
  "EU_EL_MANCHESTER_UNITED"
);
import_node_assert.strict.equal(generatedWinnersFixture.homeTeamId, "EU_CL_REAL_MADRYT");
import_node_assert.strict.equal(generatedWinnersFixture.awayTeamId, "EU_EL_MANCHESTER_UNITED");
console.log("UEFA Super Cup service tests passed.");
