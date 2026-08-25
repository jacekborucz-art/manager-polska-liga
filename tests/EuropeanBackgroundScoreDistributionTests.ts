import { strict as assert } from 'node:assert';
import {
  getEuropeanBackgroundProfile,
  sampleEuropeanBackgroundGoals,
  simulateEuropeanBackgroundScore,
} from '../services/BackgroundMatchProcessorCL';
import { CompetitionType } from '../types';

interface DistributionScenario {
  name: string;
  competitionId: CompetitionType;
  homeExpectedGoals: number;
  awayExpectedGoals: number;
  homeStrength: number;
  awayStrength: number;
}

interface DistributionSummary {
  name: string;
  matches: number;
  averageGoals: number;
  homeWinShare: number;
  drawShare: number;
  awayWinShare: number;
  nilNilShare: number;
  sideFivePlusShare: number;
  sixPlusTotalShare: number;
  maximumTeamScore: number;
}

const SAMPLE_SIZE = 60_000;

const summarize = (scenario: DistributionScenario): DistributionSummary => {
  let totalGoals = 0;
  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;
  let nilNils = 0;
  let sideFivePlus = 0;
  let sixPlusTotal = 0;
  let maximumTeamScore = 0;

  for (let seed = 1; seed <= SAMPLE_SIZE; seed++) {
    const result = simulateEuropeanBackgroundScore({
      competitionId: scenario.competitionId,
      homeExpectedGoals: scenario.homeExpectedGoals,
      awayExpectedGoals: scenario.awayExpectedGoals,
      homeStrength: scenario.homeStrength,
      awayStrength: scenario.awayStrength,
      seed: seed * 7919,
    });
    const total = result.homeScore + result.awayScore;
    totalGoals += total;
    maximumTeamScore = Math.max(maximumTeamScore, result.homeScore, result.awayScore);
    if (result.homeScore > result.awayScore) homeWins++;
    else if (result.awayScore > result.homeScore) awayWins++;
    else draws++;
    if (total === 0) nilNils++;
    if (Math.max(result.homeScore, result.awayScore) >= 5) sideFivePlus++;
    if (total >= 6) sixPlusTotal++;
  }

  return {
    name: scenario.name,
    matches: SAMPLE_SIZE,
    averageGoals: totalGoals / SAMPLE_SIZE,
    homeWinShare: homeWins / SAMPLE_SIZE,
    drawShare: draws / SAMPLE_SIZE,
    awayWinShare: awayWins / SAMPLE_SIZE,
    nilNilShare: nilNils / SAMPLE_SIZE,
    sideFivePlusShare: sideFivePlus / SAMPLE_SIZE,
    sixPlusTotalShare: sixPlusTotal / SAMPLE_SIZE,
    maximumTeamScore,
  };
};

const championsLeagueProfile = getEuropeanBackgroundProfile(CompetitionType.CL_GROUP_STAGE);
const europaLeagueProfile = getEuropeanBackgroundProfile(CompetitionType.EL_GROUP_STAGE);
const conferenceQualifierProfile = getEuropeanBackgroundProfile(CompetitionType.CONF_R1Q);

assert.equal(championsLeagueProfile.useLegacyChampionsLeagueModel, true, 'Liga Mistrzów musi zachować dotychczasowy model');
assert.equal(europaLeagueProfile.useLegacyChampionsLeagueModel, false, 'Liga Europy musi korzystać z nowego modelu');
assert.ok(
  conferenceQualifierProfile.individualVariance > europaLeagueProfile.individualVariance,
  'kwalifikacje Ligi Konferencji powinny mieć większą zmienność niż faza ligowa LE'
);

// A very high inverse-CDF roll proves that the sampler can naturally cross the
// former four-goal observation without any post-processing or hard score cap.
const uncappedPoissonResult = sampleEuropeanBackgroundGoals(3.2, () => 0.999999, 0);
assert.ok(uncappedPoissonResult >= 10, `rozkład Poissona został nieoczekiwanie ucięty: ${uncappedPoissonResult}`);

const deterministicInput = {
  competitionId: CompetitionType.EL_GROUP_STAGE,
  homeExpectedGoals: 1.45,
  awayExpectedGoals: 1.05,
  homeStrength: 79,
  awayStrength: 76,
  seed: 20260825,
};
assert.deepEqual(
  simulateEuropeanBackgroundScore(deterministicInput),
  simulateEuropeanBackgroundScore(deterministicInput),
  'ten sam zapis i seed muszą zawsze dawać identyczny wynik'
);

const equalEuropa = summarize({
  name: 'EL_EQUAL_LEAGUE',
  competitionId: CompetitionType.EL_GROUP_STAGE,
  homeExpectedGoals: 1.35,
  awayExpectedGoals: 1.10,
  homeStrength: 80,
  awayStrength: 80,
});
const equalConference = summarize({
  name: 'CONF_EQUAL_LEAGUE',
  competitionId: CompetitionType.CONF_GROUP_STAGE,
  homeExpectedGoals: 1.35,
  awayExpectedGoals: 1.10,
  homeStrength: 80,
  awayStrength: 80,
});
const clearEuropaFavorite = summarize({
  name: 'EL_CLEAR_FAVORITE',
  competitionId: CompetitionType.EL_GROUP_STAGE,
  homeExpectedGoals: 2.20,
  awayExpectedGoals: 0.65,
  homeStrength: 91,
  awayStrength: 70,
});
const conferenceQualifierMismatch = summarize({
  name: 'CONF_QUALIFIER_MISMATCH',
  competitionId: CompetitionType.CONF_R1Q,
  homeExpectedGoals: 2.80,
  awayExpectedGoals: 0.45,
  homeStrength: 94,
  awayStrength: 63,
});

console.table([
  equalEuropa,
  equalConference,
  clearEuropaFavorite,
  conferenceQualifierMismatch,
].map(summary => ({
  ...summary,
  averageGoals: Number(summary.averageGoals.toFixed(3)),
  homeWinShare: Number((summary.homeWinShare * 100).toFixed(2)),
  drawShare: Number((summary.drawShare * 100).toFixed(2)),
  awayWinShare: Number((summary.awayWinShare * 100).toFixed(2)),
  nilNilShare: Number((summary.nilNilShare * 100).toFixed(2)),
  sideFivePlusShare: Number((summary.sideFivePlusShare * 100).toFixed(2)),
  sixPlusTotalShare: Number((summary.sixPlusTotalShare * 100).toFixed(2)),
})));

for (const summary of [equalEuropa, equalConference]) {
  assert.ok(summary.averageGoals >= 2.0 && summary.averageGoals <= 3.1, `${summary.name}: nierealistyczna średnia goli ${summary.averageGoals}`);
  assert.ok(summary.nilNilShare >= 0.04 && summary.nilNilShare <= 0.16, `${summary.name}: zły udział 0:0 ${summary.nilNilShare}`);
  assert.ok(summary.sideFivePlusShare >= 0.004 && summary.sideFivePlusShare <= 0.05, `${summary.name}: zły udział wyników 5+ ${summary.sideFivePlusShare}`);
  assert.ok(summary.maximumTeamScore >= 7, `${summary.name}: długi ogon wyników nie osiągnął 7 bramek`);
}

assert.ok(clearEuropaFavorite.homeWinShare >= 0.67 && clearEuropaFavorite.homeWinShare <= 0.88, `faworyt LE ma zły udział zwycięstw ${clearEuropaFavorite.homeWinShare}`);
assert.ok(clearEuropaFavorite.awayWinShare >= 0.035 && clearEuropaFavorite.awayWinShare <= 0.13, `outsider LE ma zły udział sensacji ${clearEuropaFavorite.awayWinShare}`);
assert.ok(clearEuropaFavorite.sideFivePlusShare >= 0.04, 'wyraźny faworyt LE zbyt rzadko osiąga wynik 5+');
assert.ok(
  conferenceQualifierMismatch.sideFivePlusShare > clearEuropaFavorite.sideFivePlusShare,
  'duża różnica sił w kwalifikacjach LK powinna częściej tworzyć wysokie wyniki'
);
assert.ok(conferenceQualifierMismatch.awayWinShare >= 0.015, 'skrajny outsider w kwalifikacjach nadal musi mieć niezerową, mierzalną szansę sensacji');

console.log('EuropeanBackgroundScoreDistributionTests: OK');
