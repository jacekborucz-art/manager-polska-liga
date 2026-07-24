import { Club, CoachAttributes, CompetitionType, Fixture } from '../types';
import type { BriefingEffect } from './PreMatchBriefingService';
import { detectLeagueMotivationContext, getLeagueMotivationContextLabel } from './LeagueMotivationContextService';
import type { LeagueMotivationContext } from './LeagueMotivationContextService';
import { RivalryService } from './RivalryService';

export type PressConferenceTone = 'CALM' | 'CONFIDENT' | 'MOTIVATING' | 'CAUTIOUS' | 'PROVOCATIVE';

export interface PressConferenceAnswer {
  id: string;
  tone: PressConferenceTone;
  text: string;
  moraleDelta: number;
  focusDelta: number;
  pressureDelta: number;
}

export interface PressConferenceQuestion {
  id: string;
  category: 'TABLE' | 'FORM' | 'OPPONENT' | 'MATCH_CONTEXT' | 'CUP_CONTEXT' | 'EUROPE_CONTEXT' | 'LEAGUE_STAKES';
  journalist: string;
  text: string;
  answers: PressConferenceAnswer[];
}

export interface PressConferenceData {
  fixtureId: string;
  headline: string;
  opponentStatement: string | null;
  questions: PressConferenceQuestion[];
}

export interface PressConferenceMatchEffect {
  fixtureId: string;
  userTeamId: string;
  opponentTeamId: string;
  userMoraleDelta: number;
  userFocusDelta: number;
  userPressureDelta: number;
  opponentMoraleDelta: number;
  opponentFocusDelta: number;
  opponentPressureDelta: number;
  opponentReaction: string | null;
}

export interface PressConferenceFixture extends Pick<Fixture, 'id' | 'homeTeamId' | 'awayTeamId'> {
  leagueId?: Fixture['leagueId'];
}

const stableHash = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const average = (values: number[]): number =>
  values.length > 0 ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

const toBriefingEffect = (moraleDelta: number, focusDelta: number, pressureDelta: number, label: string): BriefingEffect => ({
  actionMod: clamp((moraleDelta * 0.006) + (focusDelta * 0.004) - (Math.max(0, pressureDelta) * 0.002), -0.045, 0.045),
  goalMod: clamp((moraleDelta * 0.004) + (focusDelta * 0.003) - (Math.max(0, pressureDelta) * 0.002), -0.035, 0.035),
  momentumBonus: clamp(Math.round(moraleDelta * 2 + focusDelta - pressureDelta), -14, 14),
  expiryMinute: 35,
  fatigueMult: clamp(1 + Math.max(0, pressureDelta) * 0.004, 1, 1.04),
  rivalBoost: 0,
  label,
  reactionText: '',
  wasSurprise: false,
});

const getRank = (club: Club, clubs: Club[]): number => {
  const table = clubs
    .filter(candidate => candidate.leagueId === club.leagueId)
    .sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
  const rank = table.findIndex(candidate => candidate.id === club.id);
  return rank >= 0 ? rank + 1 : 0;
};

const getFormLabel = (club: Club): string => {
  const recent = club.stats.form.slice(-5);
  if (recent.length === 0) return 'trudną do oceny';
  const points = recent.reduce((sum, result) => sum + (result === 'W' ? 3 : result === 'R' ? 1 : 0), 0);
  if (points >= 13) return 'znakomitą';
  if (points >= 10) return 'dobrą';
  if (points >= 6) return 'nierówną';
  if (points >= 3) return 'słabą';
  return 'bardzo słabą';
};

const getLeagueTier = (club: Club): number => {
  if (club.leagueId === 'L_PL_1') return 1;
  if (club.leagueId === 'L_PL_2') return 2;
  if (club.leagueId === 'L_PL_3') return 3;
  return 4;
};

const getPolishCupRoundLabel = (fixtureId: string): string => {
  const normalizedId = fixtureId.toUpperCase();
  if (normalizedId.includes('FINAŁ') || normalizedId.includes('FINAL')) return 'finał';
  if (normalizedId.includes('1/2') || normalizedId.includes('SEMI')) return 'półfinał';
  if (normalizedId.includes('1/4')) return 'ćwierćfinał';
  if (normalizedId.includes('1/8')) return '1/8 finału';
  if (normalizedId.includes('1/16')) return '1/16 finału';
  if (normalizedId.includes('1/32')) return '1/32 finału';
  if (normalizedId.includes('1/64')) return '1/64 finału';
  return 'kolejna runda';
};

type LeagueDeciderType = 'TITLE' | 'RELEGATION';

interface LeagueDeciderContext {
  type: LeagueDeciderType;
  headline: string;
  question: string;
}

const getLeagueDeciderContext = (
  userClub: Club,
  opponent: Club,
  clubs: Club[],
): LeagueDeciderContext | null => {
  if (!userClub.leagueId.startsWith('L_PL_')) return null;

  const table = clubs
    .filter(club => club.leagueId === userClub.leagueId)
    .sort((a, b) =>
      b.stats.points - a.stats.points ||
      b.stats.goalDifference - a.stats.goalDifference ||
      b.stats.goalsFor - a.stats.goalsFor
    );

  if (table.length < 2) return null;

  const userRank = table.findIndex(club => club.id === userClub.id) + 1;
  const opponentRank = table.findIndex(club => club.id === opponent.id) + 1;
  const totalMatches = (table.length - 1) * 2;
  const remainingIncludingCurrent = Math.max(0, totalMatches - userClub.stats.played);
  const remainingAfterCurrent = Math.max(0, remainingIncludingCurrent - 1);

  if (remainingIncludingCurrent === 0 || remainingIncludingCurrent > 3) return null;

  if (userClub.leagueId === 'L_PL_1') {
    const runnerUp = table[1];
    const canSealTitleWithWin =
      userRank === 1 &&
      userClub.stats.points + 3 > runnerUp.stats.points + remainingAfterCurrent * 3;
    const directTitleClash =
      remainingIncludingCurrent <= 2 &&
      userRank <= 2 &&
      opponentRank > 0 &&
      opponentRank <= 2 &&
      Math.abs(userClub.stats.points - opponent.stats.points) <= 3;

    if (canSealTitleWithWin || directTitleClash) {
      return {
        type: 'TITLE',
        headline: 'Mecz, który może przesądzić o mistrzostwie Polski',
        question: 'To spotkanie może przesądzić o mistrzostwie Polski. Jak przygotować drużynę na mecz, w którym presja będzie równie ważna jak forma sportowa?',
      };
    }
  }

  const relegationSlots = userClub.leagueId === 'L_PL_3' ? 4 : 3;
  const lastSafeRank = table.length - relegationSlots;
  const lastSafeClub = table[lastSafeRank - 1];
  const firstRelegationClub = table[lastSafeRank];
  const isInRelegationZone = userRank > lastSafeRank;
  const isNearBoundary = userRank >= lastSafeRank - 1;
  const boundaryPoints = isInRelegationZone
    ? lastSafeClub.stats.points
    : firstRelegationClub.stats.points;
  const canSwingAroundBoundary =
    Math.abs(userClub.stats.points - boundaryPoints) <= remainingIncludingCurrent * 3;
  const canSealSurvivalWithWin =
    !isInRelegationZone &&
    userClub.stats.points + 3 > firstRelegationClub.stats.points + remainingAfterCurrent * 3;
  const canSealRelegationWithLoss =
    isInRelegationZone &&
    userClub.stats.points + remainingAfterCurrent * 3 < lastSafeClub.stats.points;
  const criticalBoundaryFight =
    remainingIncludingCurrent <= 2 &&
    isNearBoundary &&
    canSwingAroundBoundary;

  if (canSealSurvivalWithWin || canSealRelegationWithLoss || criticalBoundaryFight) {
    return {
      type: 'RELEGATION',
      headline: 'Mecz, który może przesądzić o utrzymaniu',
      question: isInRelegationZone
        ? 'Ten mecz może przesądzić o spadku z ligi. Jak zamierza pan pomóc zawodnikom opanować napięcie i walczyć do końca?'
        : 'Ten mecz może przesądzić o utrzymaniu w lidze. Jak zamierza pan wykorzystać presję, nie paraliżując drużyny?',
    };
  }

  return null;
};

const answers = (
  prefix: string,
  calm: string,
  confident: string,
  motivating: string,
  cautious: string,
): PressConferenceAnswer[] => [
  { id: `${prefix}_CALM`, tone: 'CALM', text: calm, moraleDelta: 1, focusDelta: 2, pressureDelta: -1 },
  { id: `${prefix}_CONFIDENT`, tone: 'CONFIDENT', text: confident, moraleDelta: 2, focusDelta: 0, pressureDelta: 2 },
  { id: `${prefix}_MOTIVATING`, tone: 'MOTIVATING', text: motivating, moraleDelta: 3, focusDelta: 1, pressureDelta: 1 },
  { id: `${prefix}_CAUTIOUS`, tone: 'CAUTIOUS', text: cautious, moraleDelta: 0, focusDelta: 3, pressureDelta: -2 },
];

const getOpponentStatement = (fixtureId: string, opponent: Club): string => {
  const statements = [
    `Trener ${opponent.name} stwierdził: „Wiemy, jak zagrają. Niczym nas nie zaskoczą”.`,
    `Trener ${opponent.name} powiedział: „Ich wyniki wyglądają dobrze, ale boisko szybko weryfikuje takie serie”.`,
    `Trener ${opponent.name} podkreślił: „To groźna drużyna. Musimy zagrać z pełnym szacunkiem i cierpliwością”.`,
  ];
  return statements[stableHash(fixtureId) % statements.length];
};

const getCupQuestions = (
  fixture: PressConferenceFixture,
  userClub: Club,
  opponent: Club,
  opponentStatement: string,
  rivalryLabel: string | null,
): PressConferenceQuestion[] => {
  const isSuperCup = fixture.leagueId === CompetitionType.SUPER_CUP;
  const normalizedFixtureId = fixture.id.toUpperCase();
  const isFinal = normalizedFixtureId.includes('FINAŁ') || normalizedFixtureId.includes('FINAL');
  const isSemifinal = normalizedFixtureId.includes('1/2') || normalizedFixtureId.includes('SEMI');
  const roundLabel = getPolishCupRoundLabel(fixture.id);
  const isOpeningCupRound = roundLabel.includes('1/64');
  const tierGap = getLeagueTier(userClub) - getLeagueTier(opponent);
  const isFavourite = tierGap < 0 || (tierGap === 0 && userClub.reputation >= opponent.reputation + 8);
  const isUnderdog = tierGap > 0 || (tierGap === 0 && opponent.reputation >= userClub.reputation + 8);
  const roleText = isSuperCup
    ? `To pierwszy oficjalny mecz sezonu, a stawką od razu jest trofeum. Co może przesądzić o zwycięstwie z ${opponent.name}?`
    : isFinal
      ? `To ostatni mecz tej edycji Pucharu Polski. Co może przesądzić o tym, kto sięgnie po trofeum w starciu z ${opponent.name}?`
      : isSemifinal
        ? `Stawką meczu z ${opponent.name} jest awans do finału Pucharu Polski. Jak nie pozwolić, by drużyna wybiegła myślami na PGE Narodowy?`
    : isFavourite
      ? `Przed meczem z ${opponent.name} jesteście wskazywani jako faworyt. Jak uniknąć rozluźnienia w spotkaniu, w którym nie ma miejsca na poprawkę?`
      : isUnderdog
        ? `${opponent.name} przystępuje do tego meczu w roli faworyta. Czy perspektywa sprawienia niespodzianki może dodatkowo napędzić drużynę?`
        : `Siły przed meczem z ${opponent.name} wydają się wyrównane. Co może przesądzić o awansie w spotkaniu bez marginesu błędu?`;
  const stakesText = isSuperCup
    ? `Superpuchar Polski otwiera sezon i od razu daje szansę na trofeum. Jak przygotować zespół na taki mecz na PGE Narodowym?`
    : isFinal
      ? `Przed wami finał Pucharu Polski na PGE Narodowym. Jak zamierza pan utrzymać równowagę między mobilizacją a presją walki o trofeum?`
      : isSemifinal
        ? `Przed wami półfinał Pucharu Polski. Od meczu na PGE Narodowym dzieli was tylko jedno zwycięstwo. Jak odciąć zespół od myślenia o finale?`
      : `Przed wami ${roundLabel} Pucharu Polski. Jeden mecz zdecyduje o awansie. Jakie nastawienie będzie najważniejsze?`;
  const stakesAnswers = isFinal
    ? answers(
        `${fixture.id}_CUP_STAKES`,
        'Finał wymaga spokoju. Musimy skupić się na każdej kolejnej akcji.',
        'Jesteśmy gotowi na walkę o trofeum i chcemy to pokazać od pierwszej minuty.',
        'Nie przyjechaliśmy na Narodowy podziwiać oprawy. Puchar ma wrócić z nami.',
        'W finale emocje nie mogą odebrać nam dyscypliny i cierpliwości.',
      )
    : isSemifinal
      ? answers(
          `${fixture.id}_CUP_STAKES`,
          'Nie gramy jeszcze finału. Liczy się wyłącznie najbliższy mecz.',
          'Wiemy, o co gramy, i ta stawka powinna dodać nam energii.',
          'To rywal powinien martwić się presją. My zamierzamy narzucić swoje warunki.',
          'Najważniejsze, aby przez cały mecz kontrolować emocje i realizować plan.',
        )
      : isOpeningCupRound
        ? answers(
            `${fixture.id}_CUP_STAKES`,
            'Musimy zachować spokój. To początek pucharowej drogi i liczy się każda decyzja.',
            'Jesteśmy gotowi na pierwszy pucharowy test. Chcemy od początku narzucić własne warunki.',
            'To dobry moment, żeby od razu pokazać energię i ambicję. Oczekuję odwagi i pełnego zaangażowania.',
            'Nie możemy pozwolić, aby emocje odebrały nam koncentrację. Najważniejsza będzie dyscyplina.',
          )
      : answers(
          `${fixture.id}_CUP_STAKES`,
          'Musimy zachować spokój. W pucharach liczy się każda decyzja i każda minuta.',
          'Jesteśmy gotowi na mecz o wysoką stawkę. Chcemy od początku narzucić własne warunki.',
          'To moment, dla którego pracuje się cały sezon. Oczekuję odwagi i pełnego zaangażowania.',
          'Nie możemy pozwolić, aby emocje odebrały nam koncentrację. Najważniejsza będzie dyscyplina.',
        );
  const rivalryText = rivalryLabel ? ` ${rivalryLabel} dodatkowo podnosi temperaturę spotkania.` : '';

  return [
    {
      id: `${fixture.id}_CUP_STAKES`,
      category: 'CUP_CONTEXT',
      journalist: 'Pucharowy Wieczór',
      text: stakesText,
      answers: stakesAnswers,
    },
    {
      id: `${fixture.id}_CUP_ROLE`,
      category: 'CUP_CONTEXT',
      journalist: 'Dziennik Sportowy',
      text: `${roleText}${rivalryText}`,
      answers: answers(
        `${fixture.id}_CUP_ROLE`,
        'Nazwy i przewidywania nie grają. Musimy wykonać swoją pracę na boisku.',
        'Znamy swoją wartość. W takim meczu chcemy przejąć inicjatywę.',
        'Ta stawka powinna nas napędzać. Każdy zawodnik ma szansę zrobić różnicę.',
        'Potrzebujemy cierpliwości. Pucharowe mecze często rozstrzygają się przez jeden błąd.',
      ),
    },
    {
      id: `${fixture.id}_OPPONENT`,
      category: 'OPPONENT',
      journalist: 'Futbol nad Wisłą',
      text: `${opponentStatement} W meczu pucharowym takie słowa mogą szczególnie wpłynąć na emocje. Jak pan odpowie?`,
      answers: [
        ...answers(
          `${fixture.id}_OPPONENT`,
          'Szanujemy rywala, ale skupiamy się na sobie. Odpowiedź damy na boisku.',
          'Może mówić, co chce. Moi zawodnicy wiedzą, na co ich stać.',
          'Takie słowa powinny nas napędzać. Wyjdziemy skoncentrowani i odważni.',
          'Nie możemy dać się wciągnąć w grę słów. Najważniejsza jest dyscyplina.',
        ),
        {
          id: `${fixture.id}_OPPONENT_PROVOCATIVE`,
          tone: 'PROVOCATIVE',
          text: 'Jeżeli rywal uważa, że wie o nas wszystko, może się bardzo zdziwić.',
          moraleDelta: -1,
          focusDelta: -2,
          pressureDelta: 4,
        },
      ],
    },
  ];
};

const getLeagueStakesQuestionText = (
  context: LeagueMotivationContext,
  opponent: Club,
): { headline: string; mainQuestion: string; pressureQuestion: string } => {
  if (context === 'LAST_ROUND_GENERAL') {
    return {
      headline: 'Ostatni mecz sezonu',
      mainQuestion: `Przed wami ostatni mecz sezonu z ${opponent.name}. Jak sprawić, żeby zespół potraktował go z pełną koncentracją niezależnie od układu tabeli?`,
      pressureQuestion: 'Ostatnia kolejka często miesza emocje, zmęczenie i myślenie o przerwie. Jak utrzyma pan profesjonalizm do ostatniego gwizdka?',
    };
  }
  if (context === 'TITLE_OR_PROMOTION_SECURED') {
    return {
      headline: 'Cel sezonu już osiągnięty',
      mainQuestion: `Mistrzostwo lub awans są już zapewnione, a przed wami mecz z ${opponent.name}. Jak uniknąć rozluźnienia po tak dużym sukcesie?`,
      pressureQuestion: 'Czy po osiągnięciu celu drużyna potrzebuje bardziej pochwały, czy przypomnienia, że standard nadal obowiązuje?',
    };
  }
  if (context === 'TITLE_DECIDER') {
    return {
      headline: 'Mecz o mistrzostwo Polski',
      mainQuestion: `To spotkanie z ${opponent.name} może dać mistrzostwo Polski. Jak przygotować zawodników na presję, która będzie równie ważna jak forma sportowa?`,
      pressureQuestion: 'Jeśli remis może wystarczyć, czy drużyna powinna kalkulować, czy grać tak, jakby potrzebowała zwycięstwa?',
    };
  }
  if (context === 'DIRECT_PROMOTION_DECIDER') {
    return {
      headline: 'Mecz o bezpośredni awans',
      mainQuestion: `Wygrana może zapewnić bezpośredni awans. Jak sprawić, żeby zawodnicy potraktowali mecz z ${opponent.name} jako szansę, a nie ciężar?`,
      pressureQuestion: 'Awans jest blisko, ale takie mecze potrafią paraliżować. Jaki impuls mentalny będzie dziś najważniejszy?',
    };
  }
  if (context === 'PLAYOFF_PLACE_DECIDER') {
    return {
      headline: 'Mecz o miejsce w barażach',
      mainQuestion: `Stawką meczu z ${opponent.name} może być miejsce dające grę w barażach. Jak przekona pan drużynę, że sezon może jeszcze potrwać?`,
      pressureQuestion: 'Baraże oznaczają dodatkową szansę, ale też dodatkową presję. Jak znaleźć właściwy balans między odwagą i rozsądkiem?',
    };
  }
  if (context === 'RELEGATION_DECIDER') {
    return {
      headline: 'Walka o utrzymanie',
      mainQuestion: `To może być mecz o utrzymanie w lidze. Jak zamierza pan pomóc zawodnikom opanować napięcie przed spotkaniem z ${opponent.name}?`,
      pressureQuestion: 'W takich chwilach zawodnicy mogą potrzebować dodatkowego impulsu. Co powie im pan, żeby nie grali ze strachem?',
    };
  }
  if (context === 'EUROPE_PLACE_DECIDER') {
    return {
      headline: 'Mecz o europejskie puchary',
      mainQuestion: `W Ekstraklasie walczycie o miejsce dające grę w europejskich pucharach. Jak przygotować drużynę na mecz z ${opponent.name}, który może otworzyć klubowi większą scenę?`,
      pressureQuestion: 'Miejsca 2-4 oznaczają prestiż i nowe oczekiwania. Jak nie pozwolić, by ta wizja odciągnęła zespół od najbliższego zadania?',
    };
  }
  return {
    headline: 'Spadek już przesądzony',
    mainQuestion: `Spadek jest już pewny, ale sezon jeszcze trwa. Jak znaleźć motywację przed meczem z ${opponent.name}, kiedy tabela nie zostawia złudzeń?`,
    pressureQuestion: 'Czy w takiej sytuacji ważniejsza jest ochrona zawodników przed presją, czy wymaganie reakcji i walki o godność klubu?',
  };
};

const getLeagueStakesAnswers = (
  fixture: PressConferenceFixture,
  context: LeagueMotivationContext,
): PressConferenceAnswer[] => {
  if (context === 'TITLE_OR_PROMOTION_SECURED') {
    return answers(
      `${fixture.id}_LEAGUE_STAKES`,
      'Cel został osiągnięty, ale nasza odpowiedzialność wobec kibiców i siebie samych się nie kończy.',
      'To jest drużyna, która zasłużyła na sukces. Teraz chcemy pokazać, że potrafimy utrzymać poziom.',
      'Sukces ma nas napędzać, nie usypiać. Oczekuję energii od pierwszej minuty.',
      'Najważniejsze jest, żeby emocje po sukcesie nie odebrały nam dyscypliny.',
    );
  }
  if (context === 'TITLE_DECIDER') {
    return answers(
      `${fixture.id}_LEAGUE_STAKES`,
      'Musimy zachować spokój. Mistrzostwo wygrywa się głową tak samo jak nogami.',
      'To moment, na który pracowaliśmy cały sezon. Drużyna jest gotowa po niego sięgnąć.',
      'Nie chcę kalkulacji. Chcę odwagi, tempa i mentalności mistrzów.',
      'Nie możemy dać się ponieść. Każda decyzja musi być odpowiedzialna.',
    );
  }
  if (context === 'DIRECT_PROMOTION_DECIDER') {
    return answers(
      `${fixture.id}_LEAGUE_STAKES`,
      'Awans jest blisko, ale trzeba go domknąć spokojem i dobrą organizacją.',
      'Wierzę w ten zespół. Zawodnicy wiedzą, że mogą zrobić dziś wielki krok.',
      'To jest chwila, w której trzeba wyjść po swoje. Awans sam do nas nie przyjdzie.',
      'Nie wolno nam grać samymi emocjami. Plan i cierpliwość będą kluczowe.',
    );
  }
  if (context === 'PLAYOFF_PLACE_DECIDER') {
    return answers(
      `${fixture.id}_LEAGUE_STAKES`,
      'Baraże są celem na dziś, ale zaczyna się od prostych decyzji i koncentracji.',
      'Zespół wie, że może przedłużyć sezon. To powinno dodać nam energii.',
      'Musimy wyrwać tę szansę. W takim meczu nie ma miejsca na półśrodki.',
      'Presja baraży nie może zmienić nas w chaotyczną drużynę.',
    );
  }
  if (context === 'RELEGATION_DECIDER') {
    return answers(
      `${fixture.id}_LEAGUE_STAKES`,
      'Walka o utrzymanie wymaga spokoju, odpowiedzialności i wzajemnego wsparcia.',
      'Wierzę, że presja może wyzwolić w nas dodatkową energię.',
      'Nie zamierzamy się chować. To jest mecz, w którym trzeba pokazać charakter.',
      'Nie możemy pozwolić, żeby strach podjął decyzje za zawodników.',
    );
  }
  if (context === 'EUROPE_PLACE_DECIDER') {
    return answers(
      `${fixture.id}_LEAGUE_STAKES`,
      'Europa wymaga dojrzałości. Najpierw musimy dobrze wykonać najbliższe zadanie.',
      'Mamy prawo mieć ambicję. Chcemy udowodnić, że zasługujemy na puchary.',
      'To jest mecz dla odważnych. Taka szansa powinna napędzać całą szatnię.',
      'Nie możemy myśleć o losowaniach i wyjazdach. Liczy się najbliższe dziewięćdziesiąt minut.',
    );
  }
  if (context === 'ALREADY_RELEGATED') {
    return answers(
      `${fixture.id}_LEAGUE_STAKES`,
      'Spadek boli, ale musimy zachować godność i odpowiedzialność wobec klubu.',
      'Ta drużyna nadal ma coś do udowodnienia sobie i kibicom.',
      'Nie akceptuję odpuszczania. Nawet po spadku trzeba walczyć o herb.',
      'Emocje są trudne, więc potrzebujemy prostego planu i chłodnej głowy.',
    );
  }
  return answers(
    `${fixture.id}_LEAGUE_STAKES`,
    'Ostatni mecz sezonu wymaga profesjonalizmu i szacunku do całej pracy.',
    'Chcemy zakończyć sezon mocnym akcentem i dać kibicom dobry sygnał.',
    'Nie ma spaceru w ostatniej kolejce. Oczekuję intensywności do końca.',
    'Najważniejsze, żeby zmęczenie sezonem nie odebrało nam koncentracji.',
  );
};

const getLeagueStakesQuestions = (
  fixture: PressConferenceFixture,
  opponent: Club,
  opponentStatement: string,
  rivalryLabel: string | null,
  context: LeagueMotivationContext,
): PressConferenceQuestion[] => {
  const texts = getLeagueStakesQuestionText(context, opponent);
  const label = getLeagueMotivationContextLabel(context) ?? texts.headline;
  const rivalryText = rivalryLabel ? ` ${rivalryLabel} jeszcze podnosi temperaturę tego spotkania.` : '';

  return [
    {
      id: `${fixture.id}_LEAGUE_STAKES`,
      category: 'LEAGUE_STAKES',
      journalist: 'Dziennik Sportowy',
      text: texts.mainQuestion,
      answers: getLeagueStakesAnswers(fixture, context),
    },
    {
      id: `${fixture.id}_LEAGUE_PRESSURE`,
      category: 'LEAGUE_STAKES',
      journalist: 'Gazeta Sportowa',
      text: `${texts.pressureQuestion}${rivalryText}`,
      answers: getLeagueStakesAnswers({ ...fixture, id: `${fixture.id}_PRESSURE` }, context),
    },
    {
      id: `${fixture.id}_LEAGUE_OPPONENT`,
      category: 'OPPONENT',
      journalist: 'Futbol nad Wisłą',
      text: `${opponentStatement} W kontekście "${label}" takie słowa mogą wybrzmieć mocniej. Jak pan odpowie?`,
      answers: [
        ...answers(
          `${fixture.id}_LEAGUE_OPPONENT`,
          'Szanujemy rywala, ale nie pozwolimy, żeby cudze słowa zmieniły nasze przygotowanie.',
          'Niech mówią, co chcą. My mamy swoje zadanie i swoją jakość.',
          'Jeśli te słowa mają nas dodatkowo pobudzić, to dobrze. Odpowiedź ma być na boisku.',
          'Nie będziemy grać konferencji. Musimy zachować dyscyplinę i koncentrację.',
        ),
        {
          id: `${fixture.id}_LEAGUE_OPPONENT_PROVOCATIVE`,
          tone: 'PROVOCATIVE',
          text: 'Jeżeli rywal myśli, że presja nas złamie, może się bardzo pomylić.',
          moraleDelta: -1,
          focusDelta: -2,
          pressureDelta: 4,
        },
      ],
    },
  ];
};

type EuropeanCupStage = 'QUALIFYING' | 'GROUP_ENTRY' | 'GROUP_STAGE' | 'R16' | 'QF' | 'SF' | 'FINAL' | 'SUPER_CUP';

interface EuropeanCupContext {
  competitionLabel: string;
  stage: EuropeanCupStage;
  stageLabel: string;
  isReturnLeg: boolean;
}

const getEuropeanCupContext = (fixture: PressConferenceFixture): EuropeanCupContext | null => {
  if (fixture.leagueId === CompetitionType.UEFA_SUPER_CUP) {
    return {
      competitionLabel: 'Superpuchar Europy',
      stage: 'SUPER_CUP',
      stageLabel: 'mecz o Superpuchar Europy',
      isReturnLeg: false,
    };
  }

  const competitionId = fixture.leagueId;
  if (!competitionId || competitionId.endsWith('_DRAW')) return null;

  const competitionLabel = competitionId.startsWith('CL_')
    ? 'Liga Mistrzów UEFA'
    : competitionId.startsWith('EL_')
      ? 'Liga Europy UEFA'
      : competitionId.startsWith('CONF_')
        ? 'Liga Konferencji UEFA'
        : null;

  if (!competitionLabel) return null;

  const isReturnLeg = competitionId.endsWith('_RETURN');
  if (competitionId.includes('_R1Q')) {
    return { competitionLabel, stage: 'QUALIFYING', stageLabel: '1. runda preeliminacyjna', isReturnLeg };
  }
  if (competitionId.includes('_R2Q')) {
    return { competitionLabel, stage: 'GROUP_ENTRY', stageLabel: 'decydująca runda preeliminacyjna', isReturnLeg };
  }
  if (competitionId.includes('_GROUP_STAGE')) {
    return { competitionLabel, stage: 'GROUP_STAGE', stageLabel: 'faza grupowa', isReturnLeg };
  }
  if (competitionId.includes('_R16')) {
    return { competitionLabel, stage: 'R16', stageLabel: '1/8 finału', isReturnLeg };
  }
  if (competitionId.includes('_QF')) {
    return { competitionLabel, stage: 'QF', stageLabel: 'ćwierćfinał', isReturnLeg };
  }
  if (competitionId.includes('_SF')) {
    return { competitionLabel, stage: 'SF', stageLabel: 'półfinał', isReturnLeg };
  }
  if (competitionId.includes('_FINAL')) {
    return { competitionLabel, stage: 'FINAL', stageLabel: 'finał', isReturnLeg };
  }

  return null;
};

const getEuropeanStageQuestion = (
  context: EuropeanCupContext,
  opponent: Club,
): string => {
  if (context.stage === 'SUPER_CUP') {
    return `Przed wami mecz o Superpuchar Europy z ${opponent.name}. Jak przygotować drużynę na walkę o pierwsze międzynarodowe trofeum sezonu?`;
  }
  if (context.stage === 'QUALIFYING') {
    return context.isReturnLeg
      ? `Rewanż z ${opponent.name} zdecyduje, czy pozostaniecie w walce o europejskie puchary. Jak zespół radzi sobie z presją preeliminacji?`
      : `Rozpoczynacie europejskie preeliminacje meczem z ${opponent.name}. Jak uniknąć nerwowości na początku tej drogi?`;
  }
  if (context.stage === 'GROUP_ENTRY') {
    return context.isReturnLeg
      ? `Rewanż z ${opponent.name} może dać wam awans do fazy grupowej ${context.competitionLabel}. Jak ważny jest to moment dla klubu?`
      : `Od fazy grupowej ${context.competitionLabel} dzieli was dwumecz z ${opponent.name}. Jak zamierzacie udźwignąć stawkę tego spotkania?`;
  }
  if (context.stage === 'GROUP_STAGE') {
    return `W fazie grupowej każdy punkt może zdecydować o awansie do 1/8 finału. Jakiego meczu spodziewa się pan przeciwko ${opponent.name}?`;
  }
  if (context.stage === 'R16') {
    return context.isReturnLeg
      ? `Rewanż w 1/8 finału z ${opponent.name} zdecyduje o awansie do najlepszej ósemki. Jak zachować równowagę między odwagą a kontrolą?`
      : `Rozpoczynacie walkę o ćwierćfinał ${context.competitionLabel}. Jakiego nastawienia oczekuje pan w meczu z ${opponent.name}?`;
  }
  if (context.stage === 'QF') {
    return context.isReturnLeg
      ? `Rewanż z ${opponent.name} zdecyduje o awansie do półfinału. Czy drużyna jest gotowa na mecz o takiej presji?`
      : `Ćwierćfinał ${context.competitionLabel} to już najwyższy poziom europejskiej rywalizacji. Co może przesądzić o wyniku z ${opponent.name}?`;
  }
  if (context.stage === 'SF') {
    return context.isReturnLeg
      ? `Od europejskiego finału dzieli was jeden rewanż z ${opponent.name}. Jak nie pozwolić, by stawka sparaliżowała zawodników?`
      : `Przed wami półfinał ${context.competitionLabel}. Jak przygotować drużynę na spotkanie, które może otworzyć drogę do finału?`;
  }
  return `Przed wami finał ${context.competitionLabel} z ${opponent.name}. Jak utrzymać koncentrację, gdy jeden mecz zdecyduje o europejskim trofeum?`;
};

const getEuropeanCupQuestions = (
  fixture: PressConferenceFixture,
  opponent: Club,
  opponentStatement: string,
  rivalryLabel: string | null,
  context: EuropeanCupContext,
): PressConferenceQuestion[] => {
  const returnLegText = context.isReturnLeg
    ? ' To rewanż, więc drużyna musi odpowiednio zarządzać emocjami i przebiegiem dwumeczu.'
    : '';
  const rivalryText = rivalryLabel ? ` ${rivalryLabel} dodatkowo podnosi temperaturę spotkania.` : '';
  const routeText = context.stage === 'QUALIFYING'
    ? 'Europejska droga dopiero się zaczyna, ale jeden słabszy wieczór może ją szybko zakończyć. Jak utrzymać pełną koncentrację?'
    : context.stage === 'GROUP_ENTRY'
      ? `Stawką tej rundy jest awans do fazy grupowej ${context.competitionLabel}. Czy zawodnicy potrafią potraktować tę szansę jako motywację, a nie ciężar?`
      : context.stage === 'GROUP_STAGE'
        ? `Faza grupowa ${context.competitionLabel} wymaga regularności. Jak połączyć ambicję awansu z cierpliwością w walce o każdy punkt?`
        : context.stage === 'FINAL' || context.stage === 'SUPER_CUP'
          ? 'Stawką jest europejskie trofeum. Co będzie najważniejsze w zarządzaniu emocjami zespołu?'
          : `Przed wami ${context.stageLabel} ${context.competitionLabel}. Jak zachować spokój, gdy każdy błąd może kosztować awans?`;

  return [
    {
      id: `${fixture.id}_EURO_STAKES`,
      category: 'EUROPE_CONTEXT',
      journalist: 'Europejski Futbol',
      text: getEuropeanStageQuestion(context, opponent),
      answers: answers(
        `${fixture.id}_EURO_STAKES`,
        'Musimy zachować spokój i konsekwentnie realizować plan na ten mecz.',
        'Jesteśmy gotowi na ten poziom rywalizacji i chcemy to udowodnić na boisku.',
        'Takie mecze powinny napędzać zawodników. To szansa, na którą ciężko pracowaliśmy.',
        'Nie możemy pozwolić, aby stawka odebrała nam koncentrację i dyscyplinę.',
      ),
    },
    {
      id: `${fixture.id}_EURO_ROUTE`,
      category: 'EUROPE_CONTEXT',
      journalist: 'Sport Europa',
      text: `${routeText}${returnLegText}${rivalryText}`,
      answers: answers(
        `${fixture.id}_EURO_ROUTE`,
        'Najważniejszy jest najbliższy fragment meczu. Nie możemy wybiegać myślami dalej.',
        'Zespół zna stawkę i wierzy, że potrafi zrobić kolejny krok.',
        'Chcemy wykorzystać ten moment. W europejskich pucharach trzeba grać odważnie.',
        'Potrzebujemy cierpliwości. Na tym poziomie jeden niepotrzebny błąd może zmienić wszystko.',
      ),
    },
    {
      id: `${fixture.id}_EURO_OPPONENT`,
      category: 'OPPONENT',
      journalist: 'Futbol nad Wisłą',
      text: `${opponentStatement} W europejskich pucharach takie słowa mogą dodatkowo wpłynąć na atmosferę. Jak pan odpowie?`,
      answers: [
        ...answers(
          `${fixture.id}_EURO_OPPONENT`,
          'Szanujemy rywala, ale odpowiedzi chcemy udzielić swoją grą.',
          'Może mówić, co chce. Jesteśmy przygotowani na to spotkanie.',
          'Takie słowa tylko zwiększają naszą determinację. Chcemy pokazać swoją jakość.',
          'Nie możemy dać się wciągnąć w grę słów. W Europie koncentracja jest kluczowa.',
        ),
        {
          id: `${fixture.id}_EURO_OPPONENT_PROVOCATIVE`,
          tone: 'PROVOCATIVE',
          text: 'Jeżeli rywal sądzi, że europejska scena nas onieśmieli, szybko przekona się, że jest inaczej.',
          moraleDelta: -1,
          focusDelta: -2,
          pressureDelta: 4,
        },
      ],
    },
  ];
};

export const PreMatchPressConferenceService = {
  calculateMatchEffect(
    fixtureId: string,
    userTeamId: string,
    opponentTeamId: string,
    selectedAnswers: PressConferenceAnswer[],
    opponentCoachAttributes?: CoachAttributes | null,
  ): PressConferenceMatchEffect {
    const provocativeCount = selectedAnswers.filter(answer => answer.tone === 'PROVOCATIVE').length;
    const coachControl = (
      (opponentCoachAttributes?.motivation ?? 50) +
      (opponentCoachAttributes?.experience ?? 50) +
      (opponentCoachAttributes?.decisionMaking ?? 50)
    ) / 3;
    const reactionRoll = (stableHash(`${fixtureId}_${selectedAnswers.map(answer => answer.id).join('_')}`) % 1000) / 1000;
    const opponentMobilized = provocativeCount > 0 && reactionRoll < clamp(0.42 + (coachControl - 50) * 0.006, 0.22, 0.72);
    const opponentMoraleDelta = provocativeCount === 0 ? 0 : opponentMobilized ? 3 : -2;
    const opponentFocusDelta = provocativeCount === 0 ? 0 : opponentMobilized ? 2 : -2;
    const opponentPressureDelta = provocativeCount === 0 ? 0 : opponentMobilized ? 1 : 3;

    return {
      fixtureId,
      userTeamId,
      opponentTeamId,
      userMoraleDelta: average(selectedAnswers.map(answer => answer.moraleDelta)),
      userFocusDelta: average(selectedAnswers.map(answer => answer.focusDelta)),
      userPressureDelta: average(selectedAnswers.map(answer => answer.pressureDelta)),
      opponentMoraleDelta,
      opponentFocusDelta,
      opponentPressureDelta,
      opponentReaction: provocativeCount === 0
        ? null
        : opponentMobilized
          ? 'Prowokacja zmobilizowała rywala.'
          : 'Prowokacja wytrąciła rywala z równowagi.',
    };
  },

  getTeamMatchEffect(effect: PressConferenceMatchEffect | null | undefined, teamId: string): BriefingEffect | null {
    if (!effect) return null;
    if (teamId === effect.userTeamId) {
      return toBriefingEffect(effect.userMoraleDelta, effect.userFocusDelta, effect.userPressureDelta, 'KONFERENCJA PRASOWA');
    }
    if (teamId === effect.opponentTeamId) {
      return toBriefingEffect(effect.opponentMoraleDelta, effect.opponentFocusDelta, effect.opponentPressureDelta, 'REAKCJA NA PROWOKACJĘ');
    }
    return null;
  },

  findMatchEffect(
    effects: Record<string, PressConferenceMatchEffect>,
    fixtureId: string,
    userTeamId: string,
    opponentTeamId: string,
  ): PressConferenceMatchEffect | null {
    return effects[fixtureId] ?? Object.values(effects).reverse().find(effect =>
      effect.userTeamId === userTeamId && effect.opponentTeamId === opponentTeamId
    ) ?? null;
  },

  combineWithBriefing(conferenceEffect: BriefingEffect | null | undefined, briefingEffect: BriefingEffect): BriefingEffect {
    if (!conferenceEffect) return briefingEffect;
    return {
      actionMod: clamp(conferenceEffect.actionMod + briefingEffect.actionMod, -0.10, 0.12),
      goalMod: clamp(conferenceEffect.goalMod + briefingEffect.goalMod, -0.09, 0.11),
      momentumBonus: clamp(conferenceEffect.momentumBonus + briefingEffect.momentumBonus, -36, 42),
      expiryMinute: Math.max(conferenceEffect.expiryMinute, briefingEffect.expiryMinute),
      fatigueMult: clamp(conferenceEffect.fatigueMult * briefingEffect.fatigueMult, 0.84, 1.18),
      rivalBoost: clamp(conferenceEffect.rivalBoost + briefingEffect.rivalBoost, -0.10, 1),
      /**
       * Tactical predictability is a one-way penalty against the user's chance creation,
       * while actionMod/goalMod are side-owned bonuses. Combining it additively keeps the
       * source effects transparent and lets MatchLiveView clamp the final gameplay impact.
       */
      userActionSuppression: clamp(
        (conferenceEffect.userActionSuppression ?? 0) + (briefingEffect.userActionSuppression ?? 0),
        0,
        0.022
      ),
      tacticalReadActionMod: clamp(
        (conferenceEffect.tacticalReadActionMod ?? 0) + (briefingEffect.tacticalReadActionMod ?? 0),
        0,
        0.024
      ),
      tacticalReadGoalMod: clamp(
        (conferenceEffect.tacticalReadGoalMod ?? 0) + (briefingEffect.tacticalReadGoalMod ?? 0),
        0,
        0.012
      ),
      tacticalReadMomentumBonus: clamp(
        (conferenceEffect.tacticalReadMomentumBonus ?? 0) + (briefingEffect.tacticalReadMomentumBonus ?? 0),
        0,
        12
      ),
      label: `${conferenceEffect.label} + ${briefingEffect.label}`,
      reactionText: briefingEffect.reactionText,
      wasSurprise: briefingEffect.wasSurprise,
    };
  },

  generate(
    fixture: PressConferenceFixture,
    userClub: Club,
    opponent: Club,
    clubs: Club[],
    fixtures: Fixture[] = [],
  ): PressConferenceData {
    const userRank = getRank(userClub, clubs);
    const opponentRank = getRank(opponent, clubs);
    const enoughRounds = Math.max(userClub.stats.played, opponent.stats.played) >= 6;
    const isHome = fixture.homeTeamId === userClub.id;
    const rivalry = RivalryService.getMatchContext(
      fixture.homeTeamId === userClub.id ? userClub : opponent,
      fixture.awayTeamId === userClub.id ? userClub : opponent,
    );
    const opponentStatement = getOpponentStatement(fixture.id, opponent);
    const isDomesticCup = fixture.leagueId === CompetitionType.POLISH_CUP || fixture.leagueId === CompetitionType.SUPER_CUP;
    const europeanCupContext = getEuropeanCupContext(fixture);
    const fullFixture = fixtures.find(item => item.id === fixture.id);
    const leagueMotivationContext = fullFixture && typeof fullFixture.leagueId === 'string'
      ? detectLeagueMotivationContext({
          fixture: fullFixture,
          userClub,
          opponentClub: opponent,
          standings: clubs.filter(club => club.leagueId === fullFixture.leagueId),
          fixtures,
        })
      : null;

    if (isDomesticCup) {
      const competitionLabel = fixture.leagueId === CompetitionType.SUPER_CUP ? 'Superpuchar Polski' : 'Puchar Polski';
      return {
        fixtureId: fixture.id,
        headline: `${competitionLabel}: ${userClub.name} przed meczem z ${opponent.name}`,
        opponentStatement,
        questions: getCupQuestions(fixture, userClub, opponent, opponentStatement, rivalry.label ?? null),
      };
    }

    if (europeanCupContext) {
      return {
        fixtureId: fixture.id,
        headline: `${europeanCupContext.competitionLabel}: ${europeanCupContext.stageLabel} przed meczem z ${opponent.name}`,
        opponentStatement,
        questions: getEuropeanCupQuestions(fixture, opponent, opponentStatement, rivalry.label ?? null, europeanCupContext),
      };
    }

    if (leagueMotivationContext) {
      const stakesText = getLeagueStakesQuestionText(leagueMotivationContext, opponent);
      return {
        fixtureId: fixture.id,
        headline: `${stakesText.headline}: ${userClub.name} przed meczem z ${opponent.name}`,
        opponentStatement,
        questions: getLeagueStakesQuestions(fixture, opponent, opponentStatement, rivalry.label ?? null, leagueMotivationContext),
      };
    }

    const leagueDecider = getLeagueDeciderContext(userClub, opponent, clubs);
    const tableText = leagueDecider?.question ?? (enoughRounds && userRank === 1
      ? `Pozycja lidera zwiększa oczekiwania. Czy zespół jest gotowy udźwignąć presję przed meczem z ${opponent.name}?`
      : enoughRounds && userRank > 0 && userRank >= 13
        ? `Jesteście w dolnej części tabeli. Czy spotkanie z ${opponent.name} może stać się punktem zwrotnym?`
        : enoughRounds && userRank > 0
          ? `Zajmujecie ${userRank}. miejsce w tabeli. Jakiego sygnału oczekuje pan od drużyny w kolejnym meczu?`
          : `Sezon dopiero nabiera kształtu. Czego oczekuje pan od drużyny w meczu z ${opponent.name}?`);
    const tableAnswers = leagueDecider?.type === 'TITLE'
      ? answers(
          `${fixture.id}_TABLE`,
          'Musimy zachować spokój i potraktować ten mecz jak każde kolejne zadanie.',
          'To chwila, na którą pracowaliśmy cały sezon. Drużyna jest gotowa.',
          'Rywal może próbować nas zatrzymać, ale mistrzostwo zależy od nas.',
          'Nie możemy pozwolić, aby myśl o tytule odebrała nam koncentrację.',
        )
      : leagueDecider?.type === 'RELEGATION'
        ? answers(
            `${fixture.id}_TABLE`,
            'W tej sytuacji najważniejsze są opanowanie i odpowiedzialność za zespół.',
            'Wierzę w zawodników. Presja może wyzwolić w nas dodatkową energię.',
            'Nie zamierzamy się bać. To rywal powinien czuć ciężar tego spotkania.',
            'Musimy grać rozsądnie. Jeden nerwowy moment nie może zniszczyć naszego planu.',
          )
        : answers(
            `${fixture.id}_TABLE`,
            'Tabela jest ważna, ale dzisiaj interesuje nas przede wszystkim najbliższe zadanie.',
            'Znamy swoją wartość. Naszym celem jest zwycięstwo.',
            'To dobry moment, żeby pokazać charakter i zrobić kolejny krok razem.',
            'Nie wolno nam wybiegać myślami za daleko. Najpierw wykonajmy swoją pracę.',
          );

    const opponentText = opponentRank > 0 && opponentRank <= 4
      ? `${opponent.name} jest w ścisłej czołówce. Jak odpowie pan na słowa trenera rywala i skalę tego wyzwania?`
      : `${opponentStatement} Jak odpowie pan na tę wypowiedź?`;

    const contextText = rivalry.isRivalry
      ? `${rivalry.label ?? 'Ten mecz'} budzi wyjątkowe emocje. Jak zamierza pan utrzymać koncentrację zespołu?`
      : isHome
        ? `Gracie u siebie. Czy wsparcie trybun oznacza dziś dodatkową odpowiedzialność?`
        : `Czeka was mecz wyjazdowy. Czy presja trybun rywala może wpłynąć na drużynę?`;

    return {
      fixtureId: fixture.id,
      headline: leagueDecider
        ? `${leagueDecider.headline}: ${userClub.name} przed meczem z ${opponent.name}`
        : `${userClub.name} przed meczem z ${opponent.name}`,
      opponentStatement,
      questions: [
        {
          id: `${fixture.id}_FORM`,
          category: 'FORM',
          journalist: 'Gazeta Sportowa',
          text: `Pański zespół prezentuje ostatnio ${getFormLabel(userClub)} formę. Jakie jest nastawienie drużyny przed tym spotkaniem?`,
          answers: answers(
            `${fixture.id}_FORM`,
            'Pracujemy spokojnie. Liczy się dobre wykonanie planu od pierwszej minuty.',
            'Jesteśmy gotowi i wierzymy w swoją jakość. Chcemy to pokazać na boisku.',
            'Oczekuję odwagi i pełnego zaangażowania. Każdy zawodnik ma dziś znaczenie.',
            'Musimy zachować koncentrację. Sam wynik nie przyjdzie bez ciężkiej pracy.',
          ),
        },
        {
          id: `${fixture.id}_TABLE`,
          category: leagueDecider ? 'MATCH_CONTEXT' : 'TABLE',
          journalist: 'Dziennik Sportowy',
          text: tableText,
          answers: tableAnswers,
        },
        {
          id: `${fixture.id}_OPPONENT`,
          category: rivalry.isRivalry ? 'MATCH_CONTEXT' : 'OPPONENT',
          journalist: 'Futbol nad Wisłą',
          text: rivalry.isRivalry ? `${opponentText} ${contextText}` : `${opponentText} ${contextText}`,
          answers: [
            ...answers(
              `${fixture.id}_OPPONENT`,
              'Szanujemy rywala, ale skupiamy się na sobie. Odpowiedź damy na boisku.',
              'Może mówić, co chce. Moi zawodnicy wiedzą, na co ich stać.',
              'Takie słowa powinny nas napędzać. Wyjdziemy skoncentrowani i odważni.',
              'Nie możemy dać się wciągnąć w grę słów. Najważniejsza jest dyscyplina.',
            ),
            {
              id: `${fixture.id}_OPPONENT_PROVOCATIVE`,
              tone: 'PROVOCATIVE',
              text: 'Jeżeli rywal uważa, że wie o nas wszystko, może się bardzo zdziwić.',
              moraleDelta: -1,
              focusDelta: -2,
              pressureDelta: 4,
            },
          ],
        },
      ],
    };
  },
};
