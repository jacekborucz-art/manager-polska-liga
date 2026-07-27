import type { Lineup, MatchContext, TacticalInstructions } from '../../../../types';
import type { CupTeamSide } from '../../engines/cupV2';
import {
  CupShadowSimulationService,
  type CupLegacyComparableStats,
  type CupShadowSimulationReport,
} from './CupShadowSimulationService';

export type CupShadowAuditCase = {
  id: string;
  label?: string;
  scenario?: string;
  ctx: MatchContext;
  homeLineup: Lineup;
  awayLineup: Lineup;
  homeInstructions?: Partial<TacticalInstructions>;
  awayInstructions?: Partial<TacticalInstructions>;
  userSide?: CupTeamSide;
  legacy?: CupLegacyComparableStats;
};

export type CupShadowAuditAnomalyType =
  | 'TOO_FEW_SHOTS'
  | 'TOO_MANY_SHOTS'
  | 'HOCKEY_SCORE'
  | 'TOO_MANY_OFFSIDES'
  | 'NO_GOALKEEPER'
  | 'BROKEN_LINEUP';

export type CupShadowAuditAnomaly = {
  caseId: string;
  label: string;
  type: CupShadowAuditAnomalyType;
  value: number | string;
  score: string;
  shots: number;
  offsides: number;
  details: string;
};

export type CupShadowAuditSummary = {
  matches: number;
  avgTotalShots: number;
  avgTotalShotsOnTarget: number;
  avgTotalGoals: number;
  avgTotalXg: number;
  avgTotalCorners: number;
  avgTotalOffsides: number;
  avgTotalYellowCards: number;
  penaltyShootoutShare: number;
  lowShotShare: number;
  highShotShare: number;
  hockeyScoreShare: number;
  highOffsideShare: number;
  favoriteWinShare?: number;
  homeWinShare: number;
  awayWinShare: number;
  anomalyCount: number;
};

export type CupShadowAuditScenarioSummary = CupShadowAuditSummary & {
  scenario: string;
};

export type CupShadowAuditReport = {
  reports: CupShadowSimulationReport[];
  summary: CupShadowAuditSummary;
  byScenario: CupShadowAuditScenarioSummary[];
  anomalies: CupShadowAuditAnomaly[];
};

const round2 = (value: number): number => Math.round(value * 100) / 100;

const pct = (count: number, total: number): number =>
  total > 0 ? round2((count / total) * 100) : 0;

const detectAnomalies = (
  item: CupShadowSimulationReport,
  testCase: CupShadowAuditCase,
): CupShadowAuditAnomaly[] => {
  const anomalies: CupShadowAuditAnomaly[] = [];
  const label = testCase.label ?? `${item.input.home.name} - ${item.input.away.name}`;
  const summary = item.summary;
  const add = (type: CupShadowAuditAnomalyType, value: number | string, details: string) => {
    anomalies.push({
      caseId: testCase.id,
      label,
      type,
      value,
      score: summary.score,
      shots: summary.totalShots,
      offsides: summary.totalOffsides,
      details,
    });
  };

  if (summary.totalShots < 8) {
    add('TOO_FEW_SHOTS', summary.totalShots, 'Mecz ma mniej niż 8 strzałów łącznie.');
  }
  if (summary.totalShots > 38) {
    add('TOO_MANY_SHOTS', summary.totalShots, 'Mecz ma więcej niż 38 strzałów łącznie.');
  }
  if (summary.totalGoals >= 7 || (item.result.homeScore >= 4 && item.result.awayScore >= 4)) {
    add('HOCKEY_SCORE', summary.score, 'Wynik wygląda zbyt hokejowo jak na pojedynczy mecz piłkarski.');
  }
  if (summary.totalOffsides > 8) {
    add('TOO_MANY_OFFSIDES', summary.totalOffsides, 'Spalone przekraczają próg audytu.');
  }
  if (!item.diagnostics.home.hasGoalkeeper || !item.diagnostics.away.hasGoalkeeper) {
    add('NO_GOALKEEPER', item.diagnostics.home.hasGoalkeeper ? 'AWAY' : 'HOME', 'Jedna z drużyn nie ma bramkarza w XI.');
  }
  if (item.diagnostics.home.missingStartingSlots > 0 || item.diagnostics.away.missingStartingSlots > 0) {
    add(
      'BROKEN_LINEUP',
      `${item.diagnostics.home.missingStartingSlots}:${item.diagnostics.away.missingStartingSlots}`,
      'Adapter nie odnalazł pełnej jedenastki w danych kadrowych.',
    );
  }

  return anomalies;
};

const summarize = (
  reports: CupShadowSimulationReport[],
  anomalies: CupShadowAuditAnomaly[],
): CupShadowAuditSummary => {
  const matches = reports.length;
  const totals = reports.reduce((acc, item) => {
    acc.shots += item.summary.totalShots;
    acc.shotsOnTarget += item.summary.totalShotsOnTarget;
    acc.goals += item.summary.totalGoals;
    acc.xG += item.summary.totalXg;
    acc.corners += item.summary.totalCorners;
    acc.offsides += item.summary.totalOffsides;
    acc.yellowCards += item.summary.totalYellowCards;
    acc.penalties += item.summary.decidedByPenalties ? 1 : 0;
    acc.lowShots += item.summary.totalShots < 8 ? 1 : 0;
    acc.highShots += item.summary.totalShots > 38 ? 1 : 0;
    acc.hockey += item.summary.totalGoals >= 7 || (item.result.homeScore >= 4 && item.result.awayScore >= 4) ? 1 : 0;
    acc.highOffsides += item.summary.totalOffsides > 8 ? 1 : 0;
    acc.homeWins += item.summary.winner === 'HOME' ? 1 : 0;
    acc.awayWins += item.summary.winner === 'AWAY' ? 1 : 0;

    if (item.diagnostics.expectedFavorite) {
      acc.favoriteMatches += 1;
      acc.favoriteWins += item.summary.winner === item.diagnostics.expectedFavorite ? 1 : 0;
    }

    return acc;
  }, {
    shots: 0,
    shotsOnTarget: 0,
    goals: 0,
    xG: 0,
    corners: 0,
    offsides: 0,
    yellowCards: 0,
    penalties: 0,
    lowShots: 0,
    highShots: 0,
    hockey: 0,
    highOffsides: 0,
    homeWins: 0,
    awayWins: 0,
    favoriteMatches: 0,
    favoriteWins: 0,
  });

  return {
    matches,
    avgTotalShots: round2(totals.shots / Math.max(1, matches)),
    avgTotalShotsOnTarget: round2(totals.shotsOnTarget / Math.max(1, matches)),
    avgTotalGoals: round2(totals.goals / Math.max(1, matches)),
    avgTotalXg: round2(totals.xG / Math.max(1, matches)),
    avgTotalCorners: round2(totals.corners / Math.max(1, matches)),
    avgTotalOffsides: round2(totals.offsides / Math.max(1, matches)),
    avgTotalYellowCards: round2(totals.yellowCards / Math.max(1, matches)),
    penaltyShootoutShare: pct(totals.penalties, matches),
    lowShotShare: pct(totals.lowShots, matches),
    highShotShare: pct(totals.highShots, matches),
    hockeyScoreShare: pct(totals.hockey, matches),
    highOffsideShare: pct(totals.highOffsides, matches),
    favoriteWinShare: totals.favoriteMatches > 0 ? pct(totals.favoriteWins, totals.favoriteMatches) : undefined,
    homeWinShare: pct(totals.homeWins, matches),
    awayWinShare: pct(totals.awayWins, matches),
    anomalyCount: anomalies.length,
  };
};

export const CupShadowAuditService = {
  run: (cases: CupShadowAuditCase[]): CupShadowAuditReport => {
    const reports = cases.map(testCase =>
      CupShadowSimulationService.simulateFromMatchContext(testCase.ctx, {
        homeLineup: testCase.homeLineup,
        awayLineup: testCase.awayLineup,
        homeInstructions: testCase.homeInstructions,
        awayInstructions: testCase.awayInstructions,
        userSide: testCase.userSide,
        seedSuffix: testCase.id,
        legacy: testCase.legacy,
      })
    );
    const anomalies = reports.flatMap((report, index) => detectAnomalies(report, cases[index]));
    const scenarios = Array.from(new Set(cases.map(testCase => testCase.scenario ?? 'ALL')));

    return {
      reports,
      summary: summarize(reports, anomalies),
      byScenario: scenarios.map(scenario => {
        const scenarioReports = reports.filter((_, index) => (cases[index].scenario ?? 'ALL') === scenario);
        const scenarioAnomalies = anomalies.filter(anomaly =>
          cases.find(testCase => testCase.id === anomaly.caseId)?.scenario === scenario
        );
        return { scenario, ...summarize(scenarioReports, scenarioAnomalies) };
      }),
      anomalies,
    };
  },
};
