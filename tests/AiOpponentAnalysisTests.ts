import {
  AiOpponentAnalysisService,
  AiOpponentMatchReport,
  getDefensiveStartProbability,
  isCautiousStartJustified,
  isDefensiveStartJustified,
  isLowBlockStartJustified,
} from '../services/AiOpponentAnalysisService';
import { AiCoachTacticsService } from '../services/AiCoachTacticsService';
import { AiLeagueMatchPlanService } from '../services/AiLeagueMatchPlanService';
import { LineupService } from '../services/LineupService';
import { TacticRepository } from '../resources/tactics_db';
import { Club, Coach, HealthStatus, Player, PlayerPosition } from '../types';

const assert = (condition: boolean, message: string): void => {
  if (!condition) throw new Error(message);
};

const makePlayer = (id: string, position: PlayerPosition, level: number): Player => ({
  id,
  position,
  overallRating: level,
  condition: 100,
  morale: 82,
  suspensionMatches: 0,
  health: { status: HealthStatus.HEALTHY },
  attributes: {
    strength: level,
    stamina: level,
    pace: level,
    defending: level,
    passing: level,
    attacking: level,
    finishing: level,
    technique: level,
    vision: level,
    dribbling: level,
    heading: level,
    positioning: level,
    goalkeeping: level,
    freeKicks: level,
    talent: level,
    penalties: level,
    corners: level,
    aggression: level,
    crossing: level,
    leadership: level,
    mentality: level,
    workRate: level,
  },
} as Player);

const makeSquad = (prefix: string, level: number): Player[] => [
  makePlayer(`${prefix}_gk_1`, PlayerPosition.GK, level),
  makePlayer(`${prefix}_gk_2`, PlayerPosition.GK, level - 2),
  ...Array.from({ length: 6 }, (_, index) => makePlayer(`${prefix}_def_${index}`, PlayerPosition.DEF, level - index % 2)),
  ...Array.from({ length: 7 }, (_, index) => makePlayer(`${prefix}_mid_${index}`, PlayerPosition.MID, level - index % 2)),
  ...Array.from({ length: 4 }, (_, index) => makePlayer(`${prefix}_fwd_${index}`, PlayerPosition.FWD, level - index % 2)),
];

const strongAi = makeSquad('ai', 88);
const weakerOpponent = makeSquad('opponent', 55);
const opponentLineup = LineupService.autoPickLineup('OPPONENT', weakerOpponent, '4-4-2-OFF', null, {
  respectRequestedTactic: true,
});
const aiClub = { id: 'AI', staffIds: [], reputation: 9 } as Club;
const opponentClub = { id: 'OPPONENT', staffIds: [], reputation: 5 } as Club;

assert(!isCautiousStartJustified(1.24), 'Różnica poniżej 25% nie powinna wymuszać ostrożnego startu.');
assert(isCautiousStartJustified(1.25), 'Różnica od 25% powinna umożliwiać ostrożniejszy start.');
assert(!isDefensiveStartJustified(1.49), 'Różnica poniżej 50% nie powinna uruchamiać defensywnego losowania.');
assert(isDefensiveStartJustified(1.50), 'Różnica od 50% powinna uruchamiać defensywne losowanie.');
assert(getDefensiveStartProbability(1.49) === 0, 'Poniżej progu defensywnego prawdopodobieństwo musi wynosić 0%.');
assert(getDefensiveStartProbability(1.50) === 0.50, 'Od progu defensywnego prawdopodobieństwo musi wynosić 50%.');
assert(!isLowBlockStartJustified(1.74), 'Niski blok musi pozostać skrajnym wyjątkiem.');
assert(isLowBlockStartJustified(1.75), 'Bardzo duża różnica klasy może umożliwiać niski blok.');

const report = AiOpponentAnalysisService.generateReport({
  aiClub,
  aiCoach: null,
  aiPlayers: strongAi,
  opponentClub,
  opponentPlayers: weakerOpponent,
  opponentLineup,
  seed: 12345,
  matchEnvironment: 'DOMESTIC_LEAGUE',
});

assert(report.perceivedOpponentToAiPowerRatio !== undefined, 'Raport powinien porównywać siłę obu drużyn.');
assert(report.perceivedOpponentToAiPowerRatio! < 0.92, 'Mocniejsza drużyna AI powinna zostać rozpoznana jako faworyt.');
assert(report.recommendedApproach !== 'LOW_BLOCK', 'Wyraźny faworyt nie powinien automatycznie wybierać niskiego bloku.');

const defensiveCoach = {
  attributes: { decisionMaking: 75, experience: 75, training: 70 },
  favoriteTactics: {
    neutral: '5-3-2',
    offensive: '4-3-3 Atak',
    defensive: '5-4-1',
  },
} as Coach;

const preparedLineup = LineupService.autoPickLineup('AI', strongAi, '4-3-3', defensiveCoach, {
  respectRequestedTactic: true,
});
assert(preparedLineup.tacticId === '4-3-3', 'Taktyka wybrana przez analizę meczu nie może zostać nadpisana preferencją trenera.');

const strongFavoriteReport: AiOpponentMatchReport = {
  ...report,
  confidence: 0.9,
  predictedTacticId: '4-4-2-OFF',
  predictedStyle: 'OFFENSIVE',
  recommendedApproach: 'LOW_BLOCK',
  perceivedOpponentToAiPowerRatio: 0.75,
  defensiveStartChance: 0,
  defensiveStartSelected: false,
};
const recommendedTacticId = AiOpponentAnalysisService.recommendStartingTactic(
  '5-3-2',
  strongFavoriteReport,
  aiClub,
  opponentClub,
  strongAi,
  true,
  defensiveCoach
);
const recommendedTactic = TacticRepository.getById(recommendedTacticId);
assert(recommendedTactic.defenseBias <= 65, 'Wyraźny faworyt powinien odejść od defensywnej formacji startowej.');
assert(recommendedTactic.attackBias >= 55, 'Wyraźny faworyt powinien wybrać aktywniejszą formację.');

const normalDomesticReport: AiOpponentMatchReport = {
  ...strongFavoriteReport,
  perceivedOpponentToAiPowerRatio: 1.10,
  defensiveStartChance: 0,
  defensiveStartSelected: false,
  matchEnvironment: 'DOMESTIC_LEAGUE',
};
const normalDomesticTacticId = AiOpponentAnalysisService.recommendStartingTactic(
  '5-3-2',
  normalDomesticReport,
  aiClub,
  opponentClub,
  strongAi,
  true,
  defensiveCoach
);
assert(
  TacticRepository.getById(normalDomesticTacticId).defenseBias <= 65,
  'W zwykłym meczu ligi krajowej umiarkowana różnica siły nie uzasadnia defensywnego startu.'
);

const hugeEuropeanGapReport: AiOpponentMatchReport = {
  ...strongFavoriteReport,
  perceivedOpponentToAiPowerRatio: 1.80,
  defensiveStartChance: 0.50,
  defensiveStartSelected: true,
  matchEnvironment: 'EUROPE',
};
const hugeEuropeanGapTacticId = AiOpponentAnalysisService.recommendStartingTactic(
  '4-4-2',
  hugeEuropeanGapReport,
  aiClub,
  opponentClub,
  strongAi,
  true,
  defensiveCoach
);
assert(
  TacticRepository.getById(hugeEuropeanGapTacticId).defenseBias >= 65,
  'Przy ogromnej różnicy klasy w Europie defensywny start powinien pozostać dostępny.'
);

const fiftyFiftyDefensiveReport: AiOpponentMatchReport = {
  ...strongFavoriteReport,
  perceivedOpponentToAiPowerRatio: 1.55,
  defensiveStartChance: 0.50,
  defensiveStartSelected: true,
  recommendedApproach: 'COUNTER',
};
const fiftyFiftyDefensiveTacticId = AiOpponentAnalysisService.recommendStartingTactic(
  '4-4-2',
  fiftyFiftyDefensiveReport,
  aiClub,
  opponentClub,
  strongAi,
  true,
  defensiveCoach
);
assert(
  TacticRepository.getById(fiftyFiftyDefensiveTacticId).defenseBias >= 65,
  'Wylosowana defensywna połowa wariantu 50/50 powinna wybrać defensywną formację.'
);

const fiftyFiftyCautiousReport: AiOpponentMatchReport = {
  ...fiftyFiftyDefensiveReport,
  defensiveStartSelected: false,
};
const fiftyFiftyCautiousTacticId = AiOpponentAnalysisService.recommendStartingTactic(
  '5-3-2',
  fiftyFiftyCautiousReport,
  aiClub,
  opponentClub,
  strongAi,
  true,
  defensiveCoach
);
assert(
  TacticRepository.getById(fiftyFiftyCautiousTacticId).defenseBias <= 65,
  'Niewylosowana połowa wariantu 50/50 powinna pozostać ostrożna, ale zbalansowana.'
);

const cautiousGapReport: AiOpponentMatchReport = {
  ...fiftyFiftyCautiousReport,
  perceivedOpponentToAiPowerRatio: 1.30,
};
const cautiousGapTacticId = AiOpponentAnalysisService.recommendStartingTactic(
  '4-3-3',
  cautiousGapReport,
  aiClub,
  opponentClub,
  strongAi,
  true,
  defensiveCoach
);
assert(
  TacticRepository.getById(cautiousGapTacticId).attackBias < 65,
  'Przy różnicy 25-50% wariant ostrożny nie powinien zmieniać się w skrajnie ofensywny start.'
);

const originalConsoleLog = console.log;
console.log = () => undefined;
try {
  for (let seed = 1; seed <= 50; seed += 1) {
    const instructions = AiCoachTacticsService.decidePreMatchInstructions(
      aiClub,
      defensiveCoach,
      strongAi,
      opponentClub,
      weakerOpponent,
      '4-4-2-OFF',
      seed,
      normalDomesticReport
    );
    assert(
      instructions.mindset !== 'DEFENSIVE',
      'Losowy błąd trenera nie może wymusić defensywnej postawy bez odpowiedniej różnicy klas.'
    );

    const europeanInstructions = AiCoachTacticsService.decidePreMatchInstructions(
      aiClub,
      defensiveCoach,
      strongAi,
      opponentClub,
      weakerOpponent,
      '4-4-2-OFF',
      seed,
      hugeEuropeanGapReport
    );
    assert(
      europeanInstructions.mindset !== 'OFFENSIVE',
      'Losowy błąd wielkiego europejskiego outsidera nie może wymusić skrajnie ofensywnej postawy.'
    );
  }

  const strongAiBaseLineup = LineupService.autoPickLineup('AI', strongAi, '5-3-2', defensiveCoach, {
    respectRequestedTactic: true,
  });
  const misleadingReport: AiOpponentMatchReport = {
    ...strongFavoriteReport,
    confidence: 0.25,
    perceivedOpponentToAiPowerRatio: 1.85,
    defensiveStartChance: 0.50,
    defensiveStartSelected: true,
    recommendedApproach: 'LOW_BLOCK',
  };
  const protectedStrongTeamPlan = AiLeagueMatchPlanService.createPlan({
    report: misleadingReport,
    aiClub,
    aiCoach: defensiveCoach,
    aiPlayers: strongAi,
    aiBaseLineup: strongAiBaseLineup,
    userClub: opponentClub,
    userPlayers: weakerOpponent,
    userLineup: opponentLineup,
    aiRank: 3,
    userRank: 8,
    isAiAway: true,
    seed: 9182,
  }).plan;
  assert(
    protectedStrongTeamPlan.opponentToAiPowerRatio < 1.25,
    'Trener ligowej czołówki z mocnym składem i wysokim morale nie może uznać słabszego rywala za wyraźnego faworyta.'
  );
  assert(
    !protectedStrongTeamPlan.defensiveStartSelected,
    'Błędny raport nie może wymusić defensywnego startu mocnej drużyny przeciw słabszemu rywalowi.'
  );
  assert(
    protectedStrongTeamPlan.initialInstructions.mindset !== 'DEFENSIVE',
    'Spójny plan mocnej drużyny nie może zaczynać od defensywnego nastawienia w takim meczu.'
  );
  assert(
    TacticRepository.getById(protectedStrongTeamPlan.initialTacticId).defenseBias <= 65,
    'Formacja startowa mocnej drużyny musi być zgodna z niedefensywnymi instrukcjami.'
  );

  const outsiderPlayers = makeSquad('outsider', 58);
  const elitePlayers = makeSquad('elite', 88);
  const outsiderLineup = LineupService.autoPickLineup('OUTSIDER', outsiderPlayers, '4-4-2', defensiveCoach, {
    respectRequestedTactic: true,
  });
  const eliteLineup = LineupService.autoPickLineup('ELITE', elitePlayers, '4-3-3', null, {
    respectRequestedTactic: true,
  });
  const outsiderClub = { id: 'OUTSIDER', staffIds: [], reputation: 4 } as Club;
  const eliteClub = { id: 'ELITE', staffIds: [], reputation: 10 } as Club;
  const outsiderReport: AiOpponentMatchReport = {
    ...strongFavoriteReport,
    perceivedOpponentToAiPowerRatio: 1.55,
    defensiveStartChance: 0.50,
    defensiveStartSelected: false,
    recommendedApproach: 'COUNTER',
  };
  let defensiveStarts = 0;
  const observedSources = new Set<string>();
  for (let seed = 1; seed <= 200; seed += 1) {
    const plan = AiLeagueMatchPlanService.createPlan({
      report: outsiderReport,
      aiClub: outsiderClub,
      aiCoach: defensiveCoach,
      aiPlayers: outsiderPlayers,
      aiBaseLineup: outsiderLineup,
      userClub: eliteClub,
      userPlayers: elitePlayers,
      userLineup: eliteLineup,
      aiRank: 12,
      userRank: 2,
      isAiAway: true,
      seed,
    }).plan;
    if (plan.defensiveStartSelected) defensiveStarts += 1;
    observedSources.add(plan.source);
  }
  assert(
    defensiveStarts >= 70 && defensiveStarts <= 130,
    `Przy różnicy ponad 50% defensywny start powinien pozostać losowaniem około 50/50; wynik: ${defensiveStarts}/200.`
  );
  assert(
    observedSources.has('REPORT') && observedSources.has('INTUITION'),
    'RNG trenera powinien czasem prowadzić za raportem, a czasem za intuicją.'
  );
} finally {
  console.log = originalConsoleLog;
}

console.log('AiOpponentAnalysisTests: OK');
