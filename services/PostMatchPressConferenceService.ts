import { MatchEventType, MatchSummary } from '../types';

export type PostMatchConferenceJournalistTone = 'PROVOCATIVE' | 'NEUTRAL' | 'AGGRESSIVE' | 'MOCKING' | 'FRIENDLY';
export type PostMatchConferenceResultContext =
  | 'LOW_LOSS'
  | 'CLEAR_LOSS'
  | 'HORRIBLE_LOSS'
  | 'DRAW'
  | 'NORMAL_WIN'
  | 'MEDIUM_WIN'
  | 'HIGH_WIN';
export type PostMatchConferenceAnswerIntent =
  | 'PRAISE_REFEREE'
  | 'CRITICIZE_REFEREE'
  | 'NO_REFEREE_COMMENT'
  | 'PRAISE_TEAM'
  | 'CRITICIZE_TEAM'
  | 'NO_TEAM_COMMENT'
  | 'PRAISE_OPPONENT'
  | 'CRITICIZE_OPPONENT'
  | 'MOCK_OPPONENT'
  | 'NO_OPPONENT_COMMENT'
  | 'CALM_RESULT'
  | 'DEFLECT';

export interface PostMatchConferenceAnswer {
  id: string;
  intent: PostMatchConferenceAnswerIntent;
  text: string;
  refereeTrustDelta: number;
  teamMoraleDelta: number;
  opponentRespectDelta: number;
  mediaDramaDelta: number;
}

export interface PostMatchConferenceQuestion {
  id: string;
  journalist: string;
  tone: PostMatchConferenceJournalistTone;
  text: string;
  answers: PostMatchConferenceAnswer[];
}

export interface PostMatchConferenceData {
  matchId: string;
  headline: string;
  resultContext: PostMatchConferenceResultContext;
  questions: PostMatchConferenceQuestion[];
  controversies: {
    penaltyNoCall: boolean;
    varDisallowedEqualizer: boolean;
    userRedCard: boolean;
  };
}

export interface PostMatchConferenceOutcome {
  refereeTrustDelta: number;
  teamMoraleDelta: number;
  opponentRespectDelta: number;
  mediaDramaDelta: number;
  summary: string;
}

const JOURNALISTS: Record<PostMatchConferenceJournalistTone, string[]> = {
  PROVOCATIVE: ['Michał Trela', 'Kamil Wolnicki', 'Rafał Stec'],
  NEUTRAL: ['Piotr Żelazny', 'Tomasz Włodarczyk', 'Robert Błoński'],
  AGGRESSIVE: ['Mateusz Borek', 'Dariusz Tuzimek', 'Sebastian Staszewski'],
  MOCKING: ['Krzysztof Stanowski', 'Łukasz Wiśniowski', 'Roman Kołtoń'],
  FRIENDLY: ['Bożydar Iwanow', 'Przemysław Rudzki', 'Michał Pol'],
};

const stableHash = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

const pick = <T,>(items: T[], seed: string): T => items[stableHash(seed) % items.length];

const orderBySeed = <T extends { id: string }>(items: T[], seed: string): T[] =>
  [...items].sort((a, b) => stableHash(`${seed}_${a.id}`) - stableHash(`${seed}_${b.id}`));

const getAnswerSet = (prefix: string, target: 'REFEREE' | 'TEAM' | 'OPPONENT' | 'RESULT', spicyReferee = false): PostMatchConferenceAnswer[] => {
  if (target === 'REFEREE') {
    return [
      {
        id: `${prefix}_REF_PRAISE`,
        intent: 'PRAISE_REFEREE',
        text: 'Sędzia prowadził mecz konsekwentnie. Decyzje były trudne, ale akceptujemy je.',
        refereeTrustDelta: 2,
        teamMoraleDelta: 0,
        opponentRespectDelta: 0,
        mediaDramaDelta: -2,
      },
      {
        id: `${prefix}_REF_CRITICIZE`,
        intent: 'CRITICIZE_REFEREE',
        text: spicyReferee
          ? 'Nie będę udawał, że wszystko było w porządku. Te decyzje realnie wpłynęły na wynik.'
          : 'Mam poważne wątpliwości co do kilku decyzji. Takie sytuacje trzeba analizować.',
        refereeTrustDelta: -3,
        teamMoraleDelta: 1,
        opponentRespectDelta: 0,
        mediaDramaDelta: spicyReferee ? 5 : 3,
      },
      {
        id: `${prefix}_REF_NO_COMMENT`,
        intent: 'NO_REFEREE_COMMENT',
        text: 'Nie chcę komentować pracy sędziego na gorąco. Od tego są odpowiednie organy.',
        refereeTrustDelta: 0,
        teamMoraleDelta: 0,
        opponentRespectDelta: 0,
        mediaDramaDelta: -1,
      },
    ];
  }

  if (target === 'TEAM') {
    return [
      {
        id: `${prefix}_TEAM_PRAISE`,
        intent: 'PRAISE_TEAM',
        text: 'Drużyna zostawiła na boisku dużo zdrowia. Widzę zaangażowanie i odpowiedzialność.',
        refereeTrustDelta: 0,
        teamMoraleDelta: 3,
        opponentRespectDelta: 0,
        mediaDramaDelta: -1,
      },
      {
        id: `${prefix}_TEAM_CRITICIZE`,
        intent: 'CRITICIZE_TEAM',
        text: 'Musimy wymagać od siebie więcej. Niektóre zachowania były poniżej naszego standardu.',
        refereeTrustDelta: 0,
        teamMoraleDelta: -2,
        opponentRespectDelta: 0,
        mediaDramaDelta: 2,
      },
      {
        id: `${prefix}_TEAM_NO_COMMENT`,
        intent: 'NO_TEAM_COMMENT',
        text: 'Najpierw porozmawiam z zawodnikami w szatni. Publiczna ocena nie jest teraz potrzebna.',
        refereeTrustDelta: 0,
        teamMoraleDelta: 0,
        opponentRespectDelta: 0,
        mediaDramaDelta: -1,
      },
    ];
  }

  if (target === 'OPPONENT') {
    return [
      {
        id: `${prefix}_OPP_PRAISE`,
        intent: 'PRAISE_OPPONENT',
        text: 'Rywal zagrał solidnie i zasłużył na szacunek. To był wymagający przeciwnik.',
        refereeTrustDelta: 0,
        teamMoraleDelta: 0,
        opponentRespectDelta: 3,
        mediaDramaDelta: -1,
      },
      {
        id: `${prefix}_OPP_CRITICIZE`,
        intent: 'CRITICIZE_OPPONENT',
        text: 'Nie widziałem tam wielkiej piłki. Bardziej wykorzystali nasze błędy niż pokazali dominację.',
        refereeTrustDelta: 0,
        teamMoraleDelta: 1,
        opponentRespectDelta: -2,
        mediaDramaDelta: 3,
      },
      {
        id: `${prefix}_OPP_MOCK`,
        intent: 'MOCK_OPPONENT',
        text: 'Jeśli to ma być ich najlepszy futbol, to nie robi to na mnie większego wrażenia.',
        refereeTrustDelta: 0,
        teamMoraleDelta: 1,
        opponentRespectDelta: -4,
        mediaDramaDelta: 5,
      },
      {
        id: `${prefix}_OPP_NO_COMMENT`,
        intent: 'NO_OPPONENT_COMMENT',
        text: 'Nie będę oceniał przeciwnika. Skupiam się wyłącznie na swoim zespole.',
        refereeTrustDelta: 0,
        teamMoraleDelta: 0,
        opponentRespectDelta: 0,
        mediaDramaDelta: -1,
      },
    ];
  }

  return [
    {
      id: `${prefix}_CALM`,
      intent: 'CALM_RESULT',
      text: 'Emocje są duże, ale wynik trzeba przyjąć i przeanalizować bez wymówek.',
      refereeTrustDelta: 0,
      teamMoraleDelta: 1,
      opponentRespectDelta: 0,
      mediaDramaDelta: -2,
    },
    {
      id: `${prefix}_DEFLECT`,
      intent: 'DEFLECT',
      text: 'Nie sprowadzajmy całego meczu do jednej historii. Decydowało wiele detali.',
      refereeTrustDelta: 0,
      teamMoraleDelta: 0,
      opponentRespectDelta: 0,
      mediaDramaDelta: -1,
    },
  ];
};

const makeQuestion = (
  id: string,
  tone: PostMatchConferenceJournalistTone,
  text: string,
  target: 'REFEREE' | 'TEAM' | 'OPPONENT' | 'RESULT',
  seed: string,
  spicyReferee = false,
): PostMatchConferenceQuestion => ({
  id,
  journalist: pick(JOURNALISTS[tone], `${seed}_${id}_journalist`),
  tone,
  text,
  answers: getAnswerSet(id, target, spicyReferee),
});

const classifyResult = (summary: MatchSummary): PostMatchConferenceResultContext => {
  const userIsHome = summary.homeClub.id === summary.userTeamId;
  const userScore = userIsHome ? summary.homeScore : summary.awayScore;
  const opponentScore = userIsHome ? summary.awayScore : summary.homeScore;
  const diff = userScore - opponentScore;
  const absDiff = Math.abs(diff);

  if (diff < 0) {
    if (absDiff === 1) return 'LOW_LOSS';
    if (absDiff <= 3) return 'CLEAR_LOSS';
    return 'HORRIBLE_LOSS';
  }

  if (diff === 0) return 'DRAW';
  if (diff === 1) return 'NORMAL_WIN';
  if (diff <= 3) return 'MEDIUM_WIN';
  return 'HIGH_WIN';
};

const getHeadline = (context: PostMatchConferenceResultContext, opponentName: string): string => {
  switch (context) {
    case 'LOW_LOSS':
      return `Porażka z ${opponentName}. Jeden detal zmienił cały wieczór`;
    case 'CLEAR_LOSS':
      return `Wyraźna porażka z ${opponentName}. Trudne pytania po meczu`;
    case 'HORRIBLE_LOSS':
      return `Bolesny wieczór. Media pytają o rozmiary porażki z ${opponentName}`;
    case 'DRAW':
      return `Remis z ${opponentName}. Konferencja po meczu bez jednoznacznych odpowiedzi`;
    case 'HIGH_WIN':
      return `Wysokie zwycięstwo nad ${opponentName}. Szatnia pod lupą mediów`;
    case 'MEDIUM_WIN':
      return `Zwycięstwo nad ${opponentName}. Kontrola czy szczęśliwy przebieg?`;
    case 'NORMAL_WIN':
    default:
      return `Wygrana z ${opponentName}. Trener odpowiada po ostatnim gwizdku`;
  }
};

const getResultQuestions = (
  context: PostMatchConferenceResultContext,
  opponentName: string,
  seed: string,
): PostMatchConferenceQuestion[] => {
  switch (context) {
    case 'LOW_LOSS':
      return [
        makeQuestion('LOW_LOSS_1', 'PROVOCATIVE', 'Przegraliście tylko jedną bramką. To bardziej brak szczęścia czy brak jakości w kluczowych momentach?', 'TEAM', seed),
        makeQuestion('LOW_LOSS_2', 'NEUTRAL', `Czy ${opponentName} był dziś naprawdę lepszy, czy zdecydowały pojedyncze sytuacje?`, 'OPPONENT', seed),
        makeQuestion('LOW_LOSS_3', 'FRIENDLY', 'Czy mimo porażki widzi pan elementy, na których można budować kolejne spotkania?', 'TEAM', seed),
      ];
    case 'CLEAR_LOSS':
      return [
        makeQuestion('CLEAR_LOSS_1', 'AGGRESSIVE', 'Przegraliście wyraźnie. Czy drużyna była mentalnie gotowa na ten mecz?', 'TEAM', seed),
        makeQuestion('CLEAR_LOSS_2', 'MOCKING', `Czy ${opponentName} obnażył dziś wszystkie wasze słabości?`, 'OPPONENT', seed),
        makeQuestion('CLEAR_LOSS_3', 'NEUTRAL', 'Co było największym problemem: organizacja, intensywność czy skuteczność?', 'TEAM', seed),
      ];
    case 'HORRIBLE_LOSS':
      return [
        makeQuestion('HORRIBLE_LOSS_1', 'AGGRESSIVE', 'To była katastrofa sportowa. Czy bierze pan pełną odpowiedzialność za ten wynik?', 'TEAM', seed),
        makeQuestion('HORRIBLE_LOSS_2', 'MOCKING', `Kibice mogą zapytać, czy pański zespół w ogóle był dziś na poziomie ${opponentName}. Co pan im odpowie?`, 'TEAM', seed),
        makeQuestion('HORRIBLE_LOSS_3', 'PROVOCATIVE', 'Czy po takim meczu ktoś powinien stracić miejsce w składzie?', 'TEAM', seed),
      ];
    case 'DRAW':
      return [
        makeQuestion('DRAW_1', 'NEUTRAL', 'Remis zostawia niedosyt czy daje poczucie dobrze wykonanej pracy?', 'RESULT', seed),
        makeQuestion('DRAW_2', 'PROVOCATIVE', `Czy z takim rywalem jak ${opponentName} powinniście zrobić więcej, żeby wygrać?`, 'TEAM', seed),
        makeQuestion('DRAW_3', 'FRIENDLY', 'Czy punkt zdobyty w takich okolicznościach może pozytywnie wpłynąć na szatnię?', 'TEAM', seed),
      ];
    case 'HIGH_WIN':
      return [
        makeQuestion('HIGH_WIN_1', 'FRIENDLY', 'Wysokie zwycięstwo wyglądało bardzo przekonująco. Czy to był najlepszy mecz pana drużyny?', 'TEAM', seed),
        makeQuestion('HIGH_WIN_2', 'PROVOCATIVE', `Czy ${opponentName} był dziś aż tak słaby, czy pański zespół zagrał perfekcyjnie?`, 'OPPONENT', seed),
        makeQuestion('HIGH_WIN_3', 'NEUTRAL', 'Jak utrzymać koncentrację po meczu, który może podbić oczekiwania kibiców?', 'TEAM', seed),
      ];
    case 'MEDIUM_WIN':
      return [
        makeQuestion('MEDIUM_WIN_1', 'NEUTRAL', 'Wygraliście dość pewnie. Co najbardziej zadowoliło pana w organizacji gry?', 'TEAM', seed),
        makeQuestion('MEDIUM_WIN_2', 'PROVOCATIVE', `Czy ${opponentName} zmusił was do maksimum, czy mieliście jeszcze rezerwy?`, 'OPPONENT', seed),
        makeQuestion('MEDIUM_WIN_3', 'FRIENDLY', 'Czy to zwycięstwo może być sygnałem stabilizacji formy?', 'TEAM', seed),
      ];
    case 'NORMAL_WIN':
    default:
      return [
        makeQuestion('NORMAL_WIN_1', 'NEUTRAL', 'To było zwycięstwo wywalczone detalami. Co przesądziło o wyniku?', 'TEAM', seed),
        makeQuestion('NORMAL_WIN_2', 'PROVOCATIVE', `Czy ${opponentName} zasłużył dziś na więcej, niż pokazuje wynik?`, 'OPPONENT', seed),
        makeQuestion('NORMAL_WIN_3', 'FRIENDLY', 'Czy takie mecze budują charakter drużyny mocniej niż łatwe zwycięstwa?', 'TEAM', seed),
      ];
  }
};

const getGeneralQuestions = (opponentName: string, seed: string): PostMatchConferenceQuestion[] => [
  makeQuestion('GENERAL_REFEREE', 'PROVOCATIVE', 'Jak oceni pan pracę sędziego w tym spotkaniu?', 'REFEREE', seed),
  makeQuestion('GENERAL_TEAM', 'NEUTRAL', 'Jaka jest pana pierwsza ocena postawy własnej drużyny?', 'TEAM', seed),
  makeQuestion('GENERAL_OPPONENT', 'MOCKING', `Co powiedziałby pan o poziomie gry ${opponentName}?`, 'OPPONENT', seed),
  makeQuestion('GENERAL_EMOTIONS', 'FRIENDLY', 'Jakie emocje dominują w szatni po końcowym gwizdku?', 'RESULT', seed),
];

const getControversyQuestions = (summary: MatchSummary, seed: string): PostMatchConferenceQuestion[] => {
  const userSide = summary.homeClub.id === summary.userTeamId ? 'HOME' : 'AWAY';
  const userIsHome = userSide === 'HOME';
  const userScore = userIsHome ? summary.homeScore : summary.awayScore;
  const opponentScore = userIsHome ? summary.awayScore : summary.homeScore;
  const isOneGoalLoss = opponentScore - userScore === 1;
  const timeline = summary.timeline ?? [];

  if (!isOneGoalLoss) return [];

  const penaltyNoCall = timeline.some(event =>
    event.teamSide === userSide &&
    event.type === MatchEventType.GENERIC &&
    typeof event.text === 'string' &&
    event.text.includes('VAR: Nie ma karnego')
  );
  const varDisallowedEqualizer = timeline.some(event =>
    event.teamSide === userSide &&
    event.varDisallowed === true &&
    (event.type === MatchEventType.GOAL || event.type === MatchEventType.PENALTY_SCORED)
  );
  const userRedCard = timeline.some(event =>
    event.teamSide === userSide &&
    event.type === MatchEventType.RED_CARD
  );

  const questions: PostMatchConferenceQuestion[] = [];
  if (penaltyNoCall) {
    questions.push(makeQuestion('CONTROVERSY_PENALTY_NO_CALL', 'AGGRESSIVE', 'Przegraliście jedną bramką, a sędzia po analizie VAR nie podyktował dla was karnego. Czy publicznie powie pan, że zostaliście skrzywdzeni?', 'REFEREE', seed, true));
  }
  if (varDisallowedEqualizer) {
    questions.push(makeQuestion('CONTROVERSY_VAR_EQUALIZER', 'PROVOCATIVE', 'Anulowana bramka mogła dać wam remis. Czy po takiej decyzji ma pan jeszcze zaufanie do VAR?', 'REFEREE', seed, true));
  }
  if (userRedCard) {
    questions.push(makeQuestion('CONTROVERSY_USER_RED_CARD', 'AGGRESSIVE', 'Czerwona kartka dla pańskiego zawodnika zmieniła mecz. Czy sędzia przesadził z karą?', 'REFEREE', seed, true));
  }

  return questions;
};

export const PostMatchPressConferenceService = {
  generate(summary: MatchSummary): PostMatchConferenceData {
    /**
     * This generator deliberately separates match interpretation from long-term consequences.
     * The post-match report already stores the final score, VAR markers, red cards, and referee
     * grade; this service reads that context and turns it into a believable press room sequence.
     * Later systems can consume selected answer impacts to affect morale, media tone, board trust,
     * or referee-related newspaper stories without changing the question selection rules.
     */
    const userIsHome = summary.homeClub.id === summary.userTeamId;
    const opponent = userIsHome ? summary.awayClub : summary.homeClub;
    const resultContext = classifyResult(summary);
    const seed = `${summary.matchId}_${summary.homeScore}_${summary.awayScore}_${resultContext}`;
    const controversyQuestions = getControversyQuestions(summary, seed);
    const allQuestions = [
      ...controversyQuestions,
      ...getResultQuestions(resultContext, opponent.name, seed),
      ...getGeneralQuestions(opponent.name, seed),
    ];
    const questionCount = Math.min(allQuestions.length, 5 + (stableHash(`${seed}_count`) % 3));
    const selectedQuestions = [
      ...controversyQuestions,
      ...orderBySeed(allQuestions.filter(question => !controversyQuestions.some(item => item.id === question.id)), seed),
    ].slice(0, questionCount);

    return {
      matchId: summary.matchId,
      headline: getHeadline(resultContext, opponent.name),
      resultContext,
      questions: selectedQuestions,
      controversies: {
        penaltyNoCall: controversyQuestions.some(question => question.id === 'CONTROVERSY_PENALTY_NO_CALL'),
        varDisallowedEqualizer: controversyQuestions.some(question => question.id === 'CONTROVERSY_VAR_EQUALIZER'),
        userRedCard: controversyQuestions.some(question => question.id === 'CONTROVERSY_USER_RED_CARD'),
      },
    };
  },

  summarize(answers: PostMatchConferenceAnswer[]): PostMatchConferenceOutcome {
    const outcome = answers.reduce<PostMatchConferenceOutcome>(
      (acc, answer) => ({
        refereeTrustDelta: acc.refereeTrustDelta + answer.refereeTrustDelta,
        teamMoraleDelta: acc.teamMoraleDelta + answer.teamMoraleDelta,
        opponentRespectDelta: acc.opponentRespectDelta + answer.opponentRespectDelta,
        mediaDramaDelta: acc.mediaDramaDelta + answer.mediaDramaDelta,
        summary: acc.summary,
      }),
      { refereeTrustDelta: 0, teamMoraleDelta: 0, opponentRespectDelta: 0, mediaDramaDelta: 0, summary: '' },
    );

    const dominant = answers.reduce<Record<PostMatchConferenceAnswerIntent, number>>((acc, answer) => {
      acc[answer.intent] = (acc[answer.intent] ?? 0) + 1;
      return acc;
    }, {} as Record<PostMatchConferenceAnswerIntent, number>);
    const topIntent = Object.entries(dominant).sort((a, b) => b[1] - a[1])[0]?.[0] as PostMatchConferenceAnswerIntent | undefined;

    const summaryByIntent: Partial<Record<PostMatchConferenceAnswerIntent, string>> = {
      PRAISE_REFEREE: 'Konferencja była spokojna. Media odnotowały, że trener nie szukał wymówek w pracy arbitra.',
      CRITICIZE_REFEREE: 'Konferencja będzie szeroko komentowana. Publiczna krytyka sędziego podniosła temperaturę po meczu.',
      NO_REFEREE_COMMENT: 'Trener uniknął otwartego konfliktu z arbitrem i nie dał mediom prostego cytatu o sędziowaniu.',
      PRAISE_TEAM: 'W szatni powinno to zostać odebrane pozytywnie. Trener publicznie stanął za drużyną.',
      CRITICIZE_TEAM: 'Przekaz był twardy. Media dostały jasny sygnał, że standard drużyny ma być wyższy.',
      PRAISE_OPPONENT: 'Ton wobec rywala był pełen szacunku, co obniża temperaturę medialną po spotkaniu.',
      CRITICIZE_OPPONENT: 'Wypowiedzi o przeciwniku mogą podgrzać atmosferę przed kolejnym starciem.',
      MOCK_OPPONENT: 'Szyderczy ton wypowiedzi prawdopodobnie stanie się głównym cytatem pomeczowym.',
      CALM_RESULT: 'Trener próbował tonować emocje i przenieść uwagę na analizę sportową.',
      DEFLECT: 'Konferencja była ostrożna. Trener nie pozwolił mediom sprowadzić meczu do jednej tezy.',
    };

    return {
      ...outcome,
      summary: summaryByIntent[topIntent ?? 'DEFLECT'] ?? summaryByIntent.DEFLECT!,
    };
  },
};
