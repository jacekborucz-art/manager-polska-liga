import type { MatchSummary, MatchSummaryTeamStats } from '../../../../types';

export type CupV2FinalReportMode = 'off' | 'safe' | 'force';

export type CupV2FinalReportSource = 'legacy' | 'cupV2';

export type CupV2FinalReportSelection = {
  summary: MatchSummary;
  source: CupV2FinalReportSource;
  mode: CupV2FinalReportMode;
  reason: string;
  warnings: string[];
};

export type CupV2FinalReportStorage = {
  getItem: (key: string) => string | null;
};

export type CupV2FinalReportSelectionInput = {
  legacySummary: MatchSummary;
  v2Summary?: MatchSummary | null;
  mode?: CupV2FinalReportMode;
};

export const CUP_V2_FINAL_REPORT_MODE_KEY = 'cupV2FinalReport';

const sameNullableNumber = (left?: number, right?: number): boolean =>
  (left ?? undefined) === (right ?? undefined);

const isFiniteNumber = (value: number): boolean =>
  Number.isFinite(value);

const validateTeamStats = (
  label: 'home' | 'away',
  stats: MatchSummaryTeamStats,
): string[] => {
  const warnings: string[] = [];
  const entries: Array<[keyof MatchSummaryTeamStats, number]> = [
    ['shots', stats.shots],
    ['shotsOnTarget', stats.shotsOnTarget],
    ['corners', stats.corners],
    ['fouls', stats.fouls],
    ['offsides', stats.offsides],
    ['yellowCards', stats.yellowCards],
    ['redCards', stats.redCards],
    ['possession', stats.possession],
  ];

  entries.forEach(([key, value]) => {
    if (!isFiniteNumber(value) || value < 0) warnings.push(`${label}.${key} is invalid`);
  });

  if (stats.shotsOnTarget > stats.shots) warnings.push(`${label}.shotsOnTarget exceeds shots`);
  if (stats.redCards > 5) warnings.push(`${label}.redCards is unrealistic`);
  if (stats.yellowCards > 9) warnings.push(`${label}.yellowCards is unrealistic`);

  return warnings;
};

const validateSummaryShape = (legacy: MatchSummary, candidate: MatchSummary): string[] => {
  const warnings: string[] = [];

  if (candidate.matchId !== legacy.matchId) warnings.push('matchId mismatch');
  if (candidate.homeClub.id !== legacy.homeClub.id) warnings.push('home club mismatch');
  if (candidate.awayClub.id !== legacy.awayClub.id) warnings.push('away club mismatch');
  if (!isFiniteNumber(candidate.homeScore) || candidate.homeScore < 0) warnings.push('homeScore is invalid');
  if (!isFiniteNumber(candidate.awayScore) || candidate.awayScore < 0) warnings.push('awayScore is invalid');

  warnings.push(...validateTeamStats('home', candidate.homeStats));
  warnings.push(...validateTeamStats('away', candidate.awayStats));

  const possessionTotal = candidate.homeStats.possession + candidate.awayStats.possession;
  if (possessionTotal < 99 || possessionTotal > 101) warnings.push('possession does not add up to 100');

  const totalShots = candidate.homeStats.shots + candidate.awayStats.shots;
  const totalGoals = candidate.homeScore + candidate.awayScore;
  const totalOffsides = candidate.homeStats.offsides + candidate.awayStats.offsides;
  const totalCards =
    candidate.homeStats.yellowCards +
    candidate.awayStats.yellowCards +
    candidate.homeStats.redCards +
    candidate.awayStats.redCards;

  if (totalShots > 52) warnings.push('total shots are outside calibrated range');
  if (totalGoals > 8) warnings.push('total goals are outside football range');
  if (totalOffsides > 16) warnings.push('total offsides are outside calibrated range');
  if (totalCards > 18) warnings.push('total cards are outside calibrated range');
  if (candidate.homePlayers.length < 11) warnings.push('home player report is incomplete');
  if (candidate.awayPlayers.length < 11) warnings.push('away player report is incomplete');

  [...candidate.homePlayers, ...candidate.awayPlayers].forEach(player => {
    if (!player.playerId) warnings.push('player report without playerId');
    if (typeof player.rating === 'number' && (player.rating < 1 || player.rating > 10)) {
      warnings.push(`rating outside range for ${player.playerId}`);
    }
    if (player.fatigue < 0 || player.fatigue > 100) warnings.push(`fatigue outside range for ${player.playerId}`);
  });

  candidate.timeline.forEach(event => {
    if (event.minute < 0 || event.minute > 130) warnings.push(`timeline minute outside range: ${event.minute}`);
    if (event.teamSide !== 'HOME' && event.teamSide !== 'AWAY') warnings.push('timeline event without valid side');
  });

  return Array.from(new Set(warnings));
};

const validateScoreParity = (legacy: MatchSummary, candidate: MatchSummary): string[] => {
  const warnings: string[] = [];

  if (candidate.homeScore !== legacy.homeScore || candidate.awayScore !== legacy.awayScore) {
    warnings.push('score differs from live legacy match');
  }
  if (!sameNullableNumber(candidate.homePenaltyScore, legacy.homePenaltyScore) ||
      !sameNullableNumber(candidate.awayPenaltyScore, legacy.awayPenaltyScore)) {
    warnings.push('penalty score differs from live legacy match');
  }

  const compareGoals = (
    label: 'home' | 'away',
    legacyGoals: MatchSummary['homeGoals'],
    candidateGoals: MatchSummary['homeGoals'],
  ) => {
    const signature = (goals: MatchSummary['homeGoals']) =>
      goals
        .map(goal => [
          goal.minute,
          goal.scorerId ?? goal.playerName,
          goal.assistantId ?? goal.assistantName ?? '',
          goal.isOwnGoal ? 'OG' : '',
          goal.isPenalty ? 'PEN' : '',
        ].join(':'))
        .sort()
        .join('|');

    if (signature(legacyGoals) !== signature(candidateGoals)) {
      warnings.push(`${label} goal list differs from live legacy match`);
    }
  };

  const compareStats = (
    label: 'home' | 'away',
    legacyStats: MatchSummaryTeamStats,
    candidateStats: MatchSummaryTeamStats,
  ) => {
    const keys: Array<keyof MatchSummaryTeamStats> = [
      'shots',
      'shotsOnTarget',
      'corners',
      'fouls',
      'offsides',
      'yellowCards',
      'redCards',
      'possession',
    ];

    if (keys.some(key => legacyStats[key] !== candidateStats[key])) {
      warnings.push(`${label} stats differ from live legacy match`);
    }
  };

  compareGoals('home', legacy.homeGoals, candidate.homeGoals);
  compareGoals('away', legacy.awayGoals, candidate.awayGoals);
  compareStats('home', legacy.homeStats, candidate.homeStats);
  compareStats('away', legacy.awayStats, candidate.awayStats);

  return warnings;
};

export const CupV2FinalReportSelectionService = {
  resolveMode: (storage?: CupV2FinalReportStorage | null): CupV2FinalReportMode => {
    const raw = storage?.getItem(CUP_V2_FINAL_REPORT_MODE_KEY)?.toLowerCase().trim();
    if (raw === '0' || raw === 'off' || raw === 'legacy') return 'off';
    if (raw === 'force' || raw === '2') return 'force';
    return 'safe';
  },

  selectFinalReport: ({
    legacySummary,
    v2Summary,
    mode = 'safe',
  }: CupV2FinalReportSelectionInput): CupV2FinalReportSelection => {
    if (mode === 'off') {
      return {
        summary: legacySummary,
        source: 'legacy',
        mode,
        reason: 'Cup V2 final report is disabled',
        warnings: [],
      };
    }

    if (!v2Summary) {
      return {
        summary: legacySummary,
        source: 'legacy',
        mode,
        reason: 'Cup V2 final report is missing',
        warnings: ['missing v2 summary'],
      };
    }

    const shapeWarnings = validateSummaryShape(legacySummary, v2Summary);
    if (shapeWarnings.length > 0) {
      return {
        summary: legacySummary,
        source: 'legacy',
        mode,
        reason: 'Cup V2 final report failed validation',
        warnings: shapeWarnings,
      };
    }

    const parityWarnings = validateScoreParity(legacySummary, v2Summary);
    if (mode === 'safe' && parityWarnings.length > 0) {
      return {
        summary: legacySummary,
        source: 'legacy',
        mode,
        reason: 'Cup V2 final report differs from the live match result',
        warnings: parityWarnings,
      };
    }

    return {
      summary: v2Summary,
      source: 'cupV2',
      mode,
      reason: mode === 'force'
        ? 'Cup V2 final report forced by integration flag'
        : 'Cup V2 final report passed safe validation',
      warnings: parityWarnings,
    };
  },
};
