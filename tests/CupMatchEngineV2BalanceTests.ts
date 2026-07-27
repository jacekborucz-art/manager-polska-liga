import assert from 'node:assert/strict';
import { CupBalanceSimulation, CupSampleMatchFactory } from '../services/match/engines/cupV2';

const matchesPerScenario = Number(process.env.CUP_V2_MATCHES_PER_SCENARIO ?? 40);
const inputs = CupSampleMatchFactory.makeBatch(matchesPerScenario);
const summary = CupBalanceSimulation.summarize(inputs);
const scenarioSummaries = CupBalanceSimulation.summarizeByScenario(inputs);

const rounded = {
  matches: summary.matches,
  avgTotalShots: Number(summary.avgTotalShots.toFixed(2)),
  avgTotalShotsOnTarget: Number(summary.avgTotalShotsOnTarget.toFixed(2)),
  avgTotalGoals: Number(summary.avgTotalGoals.toFixed(2)),
  avgTotalXg: Number(summary.avgTotalXg.toFixed(2)),
  avgTotalCorners: Number(summary.avgTotalCorners.toFixed(2)),
  avgTotalOffsides: Number(summary.avgTotalOffsides.toFixed(2)),
  avgTotalYellowCards: Number(summary.avgTotalYellowCards.toFixed(2)),
  highScoringShare: Number((summary.highScoringShare * 100).toFixed(2)),
  nilNilShare: Number((summary.nilNilShare * 100).toFixed(2)),
  penaltyShootoutShare: Number((summary.penaltyShootoutShare * 100).toFixed(2)),
  homeWinShare: Number((summary.homeWinShare * 100).toFixed(2)),
  awayWinShare: Number((summary.awayWinShare * 100).toFixed(2)),
};

const roundScenario = (value: number | undefined): number | undefined =>
  value === undefined ? undefined : Number(value.toFixed(2));

console.table(rounded);
console.table(scenarioSummaries.map(scenario => ({
  scenario: scenario.scenario,
  matches: scenario.matches,
  shots: roundScenario(scenario.avgTotalShots),
  onTarget: roundScenario(scenario.avgTotalShotsOnTarget),
  goals: roundScenario(scenario.avgTotalGoals),
  xG: roundScenario(scenario.avgTotalXg),
  corners: roundScenario(scenario.avgTotalCorners),
  offsides: roundScenario(scenario.avgTotalOffsides),
  yellows: roundScenario(scenario.avgTotalYellowCards),
  homeWinPct: roundScenario(scenario.homeWinShare * 100),
  awayWinPct: roundScenario(scenario.awayWinShare * 100),
  favoriteWinPct: roundScenario(scenario.favoriteWinShare === undefined ? undefined : scenario.favoriteWinShare * 100),
  underdogWinPct: roundScenario(scenario.underdogWinShare === undefined ? undefined : scenario.underdogWinShare * 100),
  penaltiesPct: roundScenario(scenario.penaltyShootoutShare * 100),
})));

assert.ok(summary.avgTotalShots >= 14 && summary.avgTotalShots <= 34, `Średnia strzałów poza szerokim pasmem: ${summary.avgTotalShots}`);
assert.ok(summary.avgTotalShotsOnTarget >= 4 && summary.avgTotalShotsOnTarget <= 15, `Średnia celnych poza szerokim pasmem: ${summary.avgTotalShotsOnTarget}`);
assert.ok(summary.avgTotalGoals >= 1.4 && summary.avgTotalGoals <= 4.2, `Średnia goli poza szerokim pasmem: ${summary.avgTotalGoals}`);
assert.ok(summary.avgTotalOffsides >= 0.5 && summary.avgTotalOffsides <= 6, `Średnia spalonych poza szerokim pasmem: ${summary.avgTotalOffsides}`);
assert.ok(summary.highScoringShare <= 0.18, `Za dużo hokejowych wyników: ${summary.highScoringShare}`);

const byScenario = Object.fromEntries(scenarioSummaries.map(scenario => [scenario.scenario, scenario]));
assert.ok(byScenario.EQUAL.homeWinShare >= 0.30 && byScenario.EQUAL.homeWinShare <= 0.70, `Wyrównany mecz ma zły rozkład zwycięstw gospodarzy: ${byScenario.EQUAL.homeWinShare}`);
assert.ok(byScenario.FINAL_NEUTRAL.homeWinShare >= 0.30 && byScenario.FINAL_NEUTRAL.homeWinShare <= 0.70, `Finał neutralny ma zły rozkład stron: ${byScenario.FINAL_NEUTRAL.homeWinShare}`);
assert.ok((byScenario.HOME_FAVORITE.favoriteWinShare ?? 0) >= 0.55, `Faworyt u siebie wygrywa za rzadko: ${byScenario.HOME_FAVORITE.favoriteWinShare}`);
assert.ok((byScenario.HOME_FAVORITE.favoriteWinShare ?? 1) <= 0.93, `Faworyt u siebie jest zbyt pewny: ${byScenario.HOME_FAVORITE.favoriteWinShare}`);
assert.ok((byScenario.AWAY_FAVORITE.favoriteWinShare ?? 0) >= 0.52, `Faworyt na wyjeździe wygrywa za rzadko: ${byScenario.AWAY_FAVORITE.favoriteWinShare}`);
assert.ok((byScenario.AWAY_FAVORITE.favoriteWinShare ?? 1) <= 0.90, `Faworyt na wyjeździe jest zbyt pewny: ${byScenario.AWAY_FAVORITE.favoriteWinShare}`);
assert.ok((byScenario.LOWER_LEAGUE_HOME.underdogWinShare ?? 0) >= 0.12, `Za mało niespodzianek pucharowych: ${byScenario.LOWER_LEAGUE_HOME.underdogWinShare}`);
assert.ok((byScenario.LOWER_LEAGUE_HOME.underdogWinShare ?? 1) <= 0.42, `Za dużo niespodzianek pucharowych: ${byScenario.LOWER_LEAGUE_HOME.underdogWinShare}`);

console.log('CupMatchEngineV2BalanceTests: OK');
