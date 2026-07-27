import type { CupMatchInput, CupMatchResult } from './CupMatchTypes';
import { CupMatchEngineV2 } from './CupMatchEngineV2';

export type CupBalanceSummary = {
  matches: number;
  avgTotalShots: number;
  avgTotalShotsOnTarget: number;
  avgTotalGoals: number;
  avgTotalXg: number;
  avgTotalCorners: number;
  avgTotalOffsides: number;
  avgTotalYellowCards: number;
  highScoringShare: number;
  nilNilShare: number;
  penaltyShootoutShare: number;
  homeWinShare: number;
  awayWinShare: number;
  avgHomeGoals: number;
  avgAwayGoals: number;
  avgGoalDifference: number;
  favoriteWinShare?: number;
  underdogWinShare?: number;
};

export type CupScenarioBalanceSummary = CupBalanceSummary & {
  scenario: string;
};

const summarizeResults = (
  pairs: Array<{ input: CupMatchInput; result: CupMatchResult }>
): CupBalanceSummary => {
  const matches = Math.max(1, pairs.length);
  const totals = pairs.reduce((sum, pair) => {
    const { input, result } = pair;
    const home = result.stats.HOME;
    const away = result.stats.AWAY;
    const goals = result.homeScore + result.awayScore;
    const favorite = input.calibration?.expectedFavorite;
    const underdog = favorite === 'HOME' ? 'AWAY' : favorite === 'AWAY' ? 'HOME' : undefined;

    return {
      shots: sum.shots + home.shots + away.shots,
      shotsOnTarget: sum.shotsOnTarget + home.shotsOnTarget + away.shotsOnTarget,
      goals: sum.goals + goals,
      xG: sum.xG + home.xG + away.xG,
      corners: sum.corners + home.corners + away.corners,
      offsides: sum.offsides + home.offsides + away.offsides,
      yellowCards: sum.yellowCards + home.yellowCards + away.yellowCards,
      highScoring: sum.highScoring + (goals >= 6 ? 1 : 0),
      nilNil: sum.nilNil + (goals === 0 ? 1 : 0),
      penalties: sum.penalties + (result.decidedByPenalties ? 1 : 0),
      homeWins: sum.homeWins + (result.winner === 'HOME' ? 1 : 0),
      awayWins: sum.awayWins + (result.winner === 'AWAY' ? 1 : 0),
      homeGoals: sum.homeGoals + result.homeScore,
      awayGoals: sum.awayGoals + result.awayScore,
      goalDifference: sum.goalDifference + Math.abs(result.homeScore - result.awayScore),
      favoriteMatches: sum.favoriteMatches + (favorite ? 1 : 0),
      favoriteWins: sum.favoriteWins + (favorite && result.winner === favorite ? 1 : 0),
      underdogWins: sum.underdogWins + (underdog && result.winner === underdog ? 1 : 0),
    };
  }, {
    shots: 0,
    shotsOnTarget: 0,
    goals: 0,
    xG: 0,
    corners: 0,
    offsides: 0,
    yellowCards: 0,
    highScoring: 0,
    nilNil: 0,
    penalties: 0,
    homeWins: 0,
    awayWins: 0,
    homeGoals: 0,
    awayGoals: 0,
    goalDifference: 0,
    favoriteMatches: 0,
    favoriteWins: 0,
    underdogWins: 0,
  });

  return {
    matches,
    avgTotalShots: totals.shots / matches,
    avgTotalShotsOnTarget: totals.shotsOnTarget / matches,
    avgTotalGoals: totals.goals / matches,
    avgTotalXg: totals.xG / matches,
    avgTotalCorners: totals.corners / matches,
    avgTotalOffsides: totals.offsides / matches,
    avgTotalYellowCards: totals.yellowCards / matches,
    highScoringShare: totals.highScoring / matches,
    nilNilShare: totals.nilNil / matches,
    penaltyShootoutShare: totals.penalties / matches,
    homeWinShare: totals.homeWins / matches,
    awayWinShare: totals.awayWins / matches,
    avgHomeGoals: totals.homeGoals / matches,
    avgAwayGoals: totals.awayGoals / matches,
    avgGoalDifference: totals.goalDifference / matches,
    favoriteWinShare: totals.favoriteMatches > 0 ? totals.favoriteWins / totals.favoriteMatches : undefined,
    underdogWinShare: totals.favoriteMatches > 0 ? totals.underdogWins / totals.favoriteMatches : undefined,
  };
};

export const CupBalanceSimulation = {
  /**
   * Narzędzie kalibracyjne. Docelowo powinno odpalać 500-1000 meczów dla
   * różnych par siły: faworyt, wyrównany mecz, niższa liga u siebie,
   * finał na neutralnym stadionie. Wyniki z tej funkcji porównujemy z targetami.
   */
  summarize: (inputs: CupMatchInput[]): CupBalanceSummary => {
    return summarizeResults(inputs.map(input => ({ input, result: CupMatchEngineV2.simulate(input) })));
  },

  summarizeByScenario: (inputs: CupMatchInput[]): CupScenarioBalanceSummary[] => {
    const pairs = inputs.map(input => ({ input, result: CupMatchEngineV2.simulate(input) }));
    const grouped = new Map<string, Array<{ input: CupMatchInput; result: CupMatchResult }>>();

    pairs.forEach(pair => {
      const scenario = pair.input.calibration?.scenario ?? 'UNKNOWN';
      grouped.set(scenario, [...(grouped.get(scenario) ?? []), pair]);
    });

    return [...grouped.entries()].map(([scenario, scenarioPairs]) => ({
      scenario,
      ...summarizeResults(scenarioPairs),
    }));
  },
};
