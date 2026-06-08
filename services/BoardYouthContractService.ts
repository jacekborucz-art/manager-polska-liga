import { Club, Player } from '../types';

export type YouthQuestionCategory = 'POTENTIAL' | 'READINESS' | 'RISK' | 'PSYCHOLOGICAL';
export type YouthStage =
  | 'STAGE1_REJECT'
  | 'STAGE1_PASSED'
  | 'STAGE2_APPROVE'
  | 'STAGE2_REJECT'
  | 'INTERVIEW'
  | 'INTERVIEW_APPROVED'
  | 'INTERVIEW_REJECTED'
  | null;

export interface YouthQuizAnswer {
  id: 'a' | 'b' | 'c';
  text: string;
  basePoints: number;
  realizmDelta: number;
  ryzykoDelta: number;
  pewnieDelta: number;
}

export interface YouthQuizQuestion {
  id: number;
  text: string;
  category: YouthQuestionCategory;
  answers: YouthQuizAnswer[];
}

export interface YouthManagerProfile {
  realizm: number;
  ryzyko: number;
  pewnosc: number;
  spojnosc: number;
}

export interface YouthQuizSession {
  selectedQuestions: YouthQuizQuestion[];
  currentIndex: number;
  givenAnswers: { questionId: number; answerId: 'a' | 'b' | 'c' }[];
  profile: YouthManagerProfile;
  contradictions: number;
  basePoints: number;
  isComplete: boolean;
}

export interface YouthQuizResult {
  quizScore: number;
  scoreLabel: string;
  profile: YouthManagerProfile;
  approved: boolean;
  approvalProbability: number;
  ownerMessage: string;
}

export interface YouthStage1Result {
  worthInvesting: boolean;
  directorNote: string;
  coachNote: string;
}

export type YouthStage2PreDecision = 'IMMEDIATE_APPROVE' | 'INTERVIEW' | 'IMMEDIATE_REJECT';

interface ContradictionPair {
  q1Id: number;
  a1Id: 'a' | 'b' | 'c';
  q2Id: number;
  a2Id: 'a' | 'b' | 'c';
}

const CONTRADICTION_PAIRS: ContradictionPair[] = [
  { q1Id: 4,  a1Id: 'a', q2Id: 9,  a2Id: 'a' },
  { q1Id: 4,  a1Id: 'a', q2Id: 19, a2Id: 'a' },
  { q1Id: 4,  a1Id: 'a', q2Id: 26, a2Id: 'a' },
  { q1Id: 3,  a1Id: 'c', q2Id: 10, a2Id: 'a' },
  { q1Id: 3,  a1Id: 'c', q2Id: 17, a2Id: 'a' },
  { q1Id: 8,  a1Id: 'c', q2Id: 25, a2Id: 'a' },
  { q1Id: 11, a1Id: 'a', q2Id: 27, a2Id: 'a' },
  { q1Id: 18, a1Id: 'a', q2Id: 9,  a2Id: 'a' },
  { q1Id: 20, a1Id: 'a', q2Id: 21, a2Id: 'a' },
  { q1Id: 7,  a1Id: 'c', q2Id: 12, a2Id: 'a' },
];

const ALL_QUESTIONS: YouthQuizQuestion[] = [
  {
    id: 1, category: 'PSYCHOLOGICAL',
    text: 'Czy gdyby zawodnik nie był wychowankiem naszego klubu, nadal walczyłby Pan o jego nowy kontrakt?',
    answers: [
      { id: 'a', text: 'Tak, bez wahania',       basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak',   basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Prawdopodobnie nie',       basePoints: -2, realizmDelta: 2,  ryzykoDelta: -2, pewnieDelta: -3 },
    ],
  },
  {
    id: 2, category: 'RISK',
    text: 'Czy nie obawia się Pan, że zawodnik wygląda dobrze wyłącznie na tle słabszych rywali?',
    answers: [
      { id: 'a', text: 'Tak, mam takie obawy',    basePoints: 2,  realizmDelta: 3,  ryzykoDelta: -2, pewnieDelta: -1 },
      { id: 'b', text: 'Wydaje mi się, że tak',   basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie, jego poziom jest wyższy', basePoints: 3, realizmDelta: -1, ryzykoDelta: 2, pewnieDelta: 2 },
    ],
  },
  {
    id: 3, category: 'READINESS',
    text: 'Gdyby zawodnik miał spędzić większość sezonu na ławce, czy nowy kontrakt nadal miałby sens?',
    answers: [
      { id: 'a', text: 'Tak, inwestujemy w przyszłość',         basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak',                  basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie, musi najpierw regularnie grać',     basePoints: 2,  realizmDelta: 1,  ryzykoDelta: -1, pewnieDelta: 0  },
    ],
  },
  {
    id: 4, category: 'READINESS',
    text: 'Czy uważa Pan, że zawodnik jest gotowy rywalizować o miejsce w pierwszym składzie?',
    answers: [
      { id: 'a', text: 'Tak, już teraz',          basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak',   basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Jeszcze nie',             basePoints: 2,  realizmDelta: 1,  ryzykoDelta: -1, pewnieDelta: 0  },
    ],
  },
  {
    id: 5, category: 'RISK',
    text: 'Czy nie przeceniamy jego potencjału po kilku dobrych tygodniach?',
    answers: [
      { id: 'a', text: 'To możliwe',              basePoints: 2,  realizmDelta: 3,  ryzykoDelta: -2, pewnieDelta: -1 },
      { id: 'b', text: 'Wydaje mi się, że tak',   basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie, to nie przypadek',   basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
    ],
  },
  {
    id: 6, category: 'POTENTIAL',
    text: 'Czy zawodnik posiada cechy, które realnie mogą podnieść poziom pierwszej drużyny?',
    answers: [
      { id: 'a', text: 'Tak, zdecydowanie',        basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak',    basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Jeszcze tego nie widzę',   basePoints: -2, realizmDelta: 2,  ryzykoDelta: -2, pewnieDelta: -3 },
    ],
  },
  {
    id: 7, category: 'READINESS',
    text: 'Gdyby kontrakt oznaczał większe oczekiwania wobec zawodnika, czy uważa Pan, że sobie poradzi?',
    answers: [
      { id: 'a', text: 'Tak',                      basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak',    basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'To może być za wcześnie',  basePoints: 2,  realizmDelta: 1,  ryzykoDelta: -1, pewnieDelta: 0  },
    ],
  },
  {
    id: 8, category: 'RISK',
    text: 'Czy brak nowego kontraktu może sprawić, że w przyszłości popełnimy błąd?',
    answers: [
      { id: 'a', text: 'Tak, możemy tego żałować', basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak',    basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie sądzę',               basePoints: -2, realizmDelta: 2,  ryzykoDelta: -2, pewnieDelta: -3 },
    ],
  },
  {
    id: 9, category: 'POTENTIAL',
    text: 'Czy uważa Pan, że zawodnik wymaga jeszcze spokojnego rozwoju poza główną presją?',
    answers: [
      { id: 'a', text: 'Tak',                               basePoints: 2,  realizmDelta: 3,  ryzykoDelta: -2, pewnieDelta: -1 },
      { id: 'b', text: 'Wydaje mi się, że tak',             basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie, powinien być przyspieszony',   basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
    ],
  },
  {
    id: 10, category: 'RISK',
    text: 'Gdyby miał Pan ograniczony budżet płacowy, czy ten zawodnik nadal byłby priorytetem?',
    answers: [
      { id: 'a', text: 'Tak',                basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1, realizmDelta: 2, ryzykoDelta: 0, pewnieDelta: -1 },
      { id: 'c', text: 'Nie',                basePoints: 0,  realizmDelta: 1,  ryzykoDelta: -1, pewnieDelta: -1 },
    ],
  },
  {
    id: 11, category: 'POTENTIAL',
    text: 'Czy jest możliwe, że zawodnik osiągnął już poziom, którego znacząco nie przekroczy?',
    answers: [
      { id: 'a', text: 'Tak',                basePoints: 2,  realizmDelta: 3,  ryzykoDelta: -2, pewnieDelta: -1 },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1, realizmDelta: 2, ryzykoDelta: 0, pewnieDelta: -1 },
      { id: 'c', text: 'Nie, stać go na więcej', basePoints: 3, realizmDelta: -1, ryzykoDelta: 2, pewnieDelta: 2 },
    ],
  },
  {
    id: 12, category: 'READINESS',
    text: 'Czy uważa Pan, że zawodnik już dziś wniósłby coś wartościowego do kadry meczowej?',
    answers: [
      { id: 'a', text: 'Tak',           basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1, realizmDelta: 2, ryzykoDelta: 0, pewnieDelta: -1 },
      { id: 'c', text: 'Jeszcze nie',   basePoints: 2,  realizmDelta: 1,  ryzykoDelta: -1, pewnieDelta: 0  },
    ],
  },
  {
    id: 13, category: 'RISK',
    text: 'Czy nie obawia się Pan, że zbyt szybkie promowanie zawodnika zahamuje jego rozwój?',
    answers: [
      { id: 'a', text: 'Tak',                   basePoints: 2,  realizmDelta: 3,  ryzykoDelta: -2, pewnieDelta: -1 },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie, to mu pomoże',     basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
    ],
  },
  {
    id: 14, category: 'PSYCHOLOGICAL',
    text: 'Gdyby inny klub zgłosił się po zawodnika już teraz, czy próbowałby Pan go zatrzymać?',
    answers: [
      { id: 'a', text: 'Zdecydowanie tak',      basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie za wszelką cenę',   basePoints: 0,  realizmDelta: 1,  ryzykoDelta: -1, pewnieDelta: -1 },
    ],
  },
  {
    id: 15, category: 'PSYCHOLOGICAL',
    text: 'Czy uważa Pan, że zawodnik ma odpowiednią mentalność do walki o miejsce?',
    answers: [
      { id: 'a', text: 'Tak',                   basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Mam wątpliwości',        basePoints: 1,  realizmDelta: 1,  ryzykoDelta: -1, pewnieDelta: 0  },
    ],
  },
  {
    id: 16, category: 'RISK',
    text: 'Czy nie istnieje ryzyko, że obecny zachwyt nad zawodnikiem jest chwilowy?',
    answers: [
      { id: 'a', text: 'Tak',                   basePoints: 2,  realizmDelta: 3,  ryzykoDelta: -2, pewnieDelta: -1 },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie',                   basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
    ],
  },
  {
    id: 17, category: 'PSYCHOLOGICAL',
    text: 'Czy zawodnik zasługuje na kredyt zaufania nawet bez gwarancji regularnych występów?',
    answers: [
      { id: 'a', text: 'Tak',                   basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie',                   basePoints: 1,  realizmDelta: 1,  ryzykoDelta: -1, pewnieDelta: 0  },
    ],
  },
  {
    id: 18, category: 'READINESS',
    text: 'Gdyby pierwszy zespół walczył o ważny wynik, czy zaufałby Pan temu zawodnikowi?',
    answers: [
      { id: 'a', text: 'Tak',                   basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Jeszcze nie',           basePoints: 2,  realizmDelta: 1,  ryzykoDelta: -1, pewnieDelta: 0  },
    ],
  },
  {
    id: 19, category: 'POTENTIAL',
    text: 'Czy uważa Pan, że zawodnik potrzebuje jeszcze czasu fizycznie lub mentalnie?',
    answers: [
      { id: 'a', text: 'Tak',                   basePoints: 2,  realizmDelta: 3,  ryzykoDelta: -2, pewnieDelta: -1 },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie',                   basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
    ],
  },
  {
    id: 20, category: 'RISK',
    text: 'Czy nie uważa Pan, że kontrakt byłby bardziej oparty na wierze niż faktach?',
    answers: [
      { id: 'a', text: 'Tak',                   basePoints: 2,  realizmDelta: 3,  ryzykoDelta: -2, pewnieDelta: -1 },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie',                   basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
    ],
  },
  {
    id: 21, category: 'POTENTIAL',
    text: 'Czy zawodnik daje wystarczające sygnały, że warto w niego inwestować?',
    answers: [
      { id: 'a', text: 'Tak',                      basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak',    basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie jestem przekonany',    basePoints: -1, realizmDelta: 2,  ryzykoDelta: -2, pewnieDelta: -2 },
    ],
  },
  {
    id: 22, category: 'PSYCHOLOGICAL',
    text: 'Gdyby miał Pan wybrać jednego młodego zawodnika do rozwoju, czy byłby to właśnie on?',
    answers: [
      { id: 'a', text: 'Tak',                   basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie',                   basePoints: 0,  realizmDelta: 1,  ryzykoDelta: -1, pewnieDelta: -1 },
    ],
  },
  {
    id: 23, category: 'POTENTIAL',
    text: 'Czy uważa Pan, że zawodnik może szybciej się rozwijać przy pierwszym zespole niż w rezerwach?',
    answers: [
      { id: 'a', text: 'Tak',                   basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie',                   basePoints: 1,  realizmDelta: 1,  ryzykoDelta: -1, pewnieDelta: 0  },
    ],
  },
  {
    id: 24, category: 'RISK',
    text: 'Czy nie istnieje ryzyko, że zawodnik nie udźwignie oczekiwań po nowym kontrakcie?',
    answers: [
      { id: 'a', text: 'Tak',                   basePoints: 2,  realizmDelta: 3,  ryzykoDelta: -2, pewnieDelta: -1 },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie',                   basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
    ],
  },
  {
    id: 25, category: 'PSYCHOLOGICAL',
    text: 'Czy gdyby dziś miał Pan podjąć decyzję wyłącznie sportową, podpisałby Pan z nim kontrakt?',
    answers: [
      { id: 'a', text: 'Tak',                   basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie',                   basePoints: -2, realizmDelta: 2,  ryzykoDelta: -2, pewnieDelta: -3 },
    ],
  },
  {
    id: 26, category: 'READINESS',
    text: 'Czy uważa Pan, że zawodnik wymaga jeszcze sprawdzenia przed większą inwestycją?',
    answers: [
      { id: 'a', text: 'Tak',                   basePoints: 2,  realizmDelta: 3,  ryzykoDelta: -2, pewnieDelta: -1 },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie',                   basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
    ],
  },
  {
    id: 27, category: 'POTENTIAL',
    text: 'Czy zawodnik może w przyszłości stać się jednym z liderów zespołu?',
    answers: [
      { id: 'a', text: 'Tak',                        basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak',       basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'To mało prawdopodobne',       basePoints: -2, realizmDelta: 2,  ryzykoDelta: -2, pewnieDelta: -3 },
    ],
  },
  {
    id: 28, category: 'RISK',
    text: 'Czy nie uważa Pan, że zbyt szybkie oczekiwania mogą mu zaszkodzić?',
    answers: [
      { id: 'a', text: 'Tak',                   basePoints: 2,  realizmDelta: 3,  ryzykoDelta: -2, pewnieDelta: -1 },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie',                   basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
    ],
  },
  {
    id: 29, category: 'PSYCHOLOGICAL',
    text: 'Gdyby nie było presji wyniku, czy decyzja o kontrakcie byłaby dla Pana prostsza?',
    answers: [
      { id: 'a', text: 'Tak',                   basePoints: 2,  realizmDelta: 1,  ryzykoDelta: -1, pewnieDelta: 0  },
      { id: 'b', text: 'Wydaje mi się, że tak', basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nie',                   basePoints: 2,  realizmDelta: 1,  ryzykoDelta: 0,  pewnieDelta: 0  },
    ],
  },
  {
    id: 30, category: 'READINESS',
    text: 'Czy po tym, co widział Pan do tej pory, uważa Pan podpisanie nowego kontraktu za rozsądną decyzję?',
    answers: [
      { id: 'a', text: 'Tak',                      basePoints: 3,  realizmDelta: -1, ryzykoDelta: 2,  pewnieDelta: 2  },
      { id: 'b', text: 'Wydaje mi się, że tak',    basePoints: 1,  realizmDelta: 2,  ryzykoDelta: 0,  pewnieDelta: -1 },
      { id: 'c', text: 'Nadal mam wątpliwości',    basePoints: 1,  realizmDelta: 1,  ryzykoDelta: -1, pewnieDelta: 0  },
    ],
  },
];

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function selectQuestions(): YouthQuizQuestion[] {
  const byCategory: Record<YouthQuestionCategory, YouthQuizQuestion[]> = {
    POTENTIAL:     ALL_QUESTIONS.filter(q => q.category === 'POTENTIAL'),
    READINESS:     ALL_QUESTIONS.filter(q => q.category === 'READINESS'),
    RISK:          ALL_QUESTIONS.filter(q => q.category === 'RISK'),
    PSYCHOLOGICAL: ALL_QUESTIONS.filter(q => q.category === 'PSYCHOLOGICAL'),
  };

  const selected: YouthQuizQuestion[] = [
    ...shuffleArray(byCategory.POTENTIAL).slice(0, 2),
    ...shuffleArray(byCategory.READINESS).slice(0, 2),
    ...shuffleArray(byCategory.RISK).slice(0, 1),
    ...shuffleArray(byCategory.PSYCHOLOGICAL).slice(0, 1),
  ];

  return shuffleArray(selected);
}

function detectContradictions(answers: { questionId: number; answerId: 'a' | 'b' | 'c' }[]): number {
  let count = 0;
  for (const pair of CONTRADICTION_PAIRS) {
    const a1 = answers.find(a => a.questionId === pair.q1Id);
    const a2 = answers.find(a => a.questionId === pair.q2Id);
    if (a1?.answerId === pair.a1Id && a2?.answerId === pair.a2Id) count++;
  }
  return count;
}

function getSquadAvgOverall(squad: Player[]): number {
  if (squad.length === 0) return 70;
  return squad.reduce((sum, p) => sum + p.overallRating, 0) / squad.length;
}

export const BoardYouthContractService = {
  createQuizSession(_player: Player, _squad: Player[]): YouthQuizSession {
    return {
      selectedQuestions: selectQuestions(),
      currentIndex: 0,
      givenAnswers: [],
      profile: { realizm: 0, ryzyko: 0, pewnosc: 0, spojnosc: 100 },
      contradictions: 0,
      basePoints: 0,
      isComplete: false,
    };
  },

  submitAnswer(
    session: YouthQuizSession,
    questionId: number,
    answerId: 'a' | 'b' | 'c'
  ): YouthQuizSession {
    const question = session.selectedQuestions.find(q => q.id === questionId);
    if (!question) return session;
    const answer = question.answers.find(a => a.id === answerId);
    if (!answer) return session;

    const newAnswers = [...session.givenAnswers, { questionId, answerId }];
    const contradictions = detectContradictions(newAnswers);

    const newProfile: YouthManagerProfile = {
      realizm:  Math.max(-10, Math.min(10, session.profile.realizm  + answer.realizmDelta)),
      ryzyko:   Math.max(-10, Math.min(10, session.profile.ryzyko   + answer.ryzykoDelta)),
      pewnosc:  Math.max(-10, Math.min(10, session.profile.pewnosc  + answer.pewnieDelta)),
      spojnosc: Math.max(0, 100 - contradictions * 20),
    };

    const nextIndex = session.currentIndex + 1;
    return {
      ...session,
      currentIndex: nextIndex,
      givenAnswers: newAnswers,
      profile: newProfile,
      contradictions,
      basePoints: session.basePoints + answer.basePoints,
      isComplete: nextIndex >= session.selectedQuestions.length,
    };
  },

  calculateQuizScore(session: YouthQuizSession, player: Player, squad: Player[]): number {
    // Normalize: min = 6×(-2)=-12, max = 6×3=18, range = 30
    const normalized = ((session.basePoints + 12) / 30) * 100;

    const consistencyFactor = session.profile.spojnosc / 100;

    const talent = player.attributes.talent;
    let talentMult = 1.0;
    if (talent >= 80)      talentMult = 1.10;
    else if (talent >= 65) talentMult = 1.05;
    else                   talentMult = 0.90;

    const avgOverall = getSquadAvgOverall(squad);
    const diff = player.overallRating - avgOverall;
    let diffBonus = 0;
    if (diff >= -4)       diffBonus = 15;
    else if (diff >= -8)  diffBonus = 5;
    else if (diff >= -12) diffBonus = -5;
    else                  diffBonus = -15;

    const score = (normalized * consistencyFactor * talentMult) + diffBonus;
    return Math.max(0, Math.min(100, Math.round(score)));
  },

  getScoreLabel(score: number): string {
    if (score >= 85) return 'Świetna analiza';
    if (score >= 70) return 'Dobra analiza';
    if (score >= 50) return 'Ryzykowna decyzja';
    return 'Zarząd nie ufa ocenie';
  },

  calculateApprovalProbability(
    player: Player,
    squad: Player[],
    club: Club,
    quizScore: number,
    profile: YouthManagerProfile
  ): number {
    const owner = club.management?.owner;
    if (!owner) return 50;

    let prob = 50;

    const talent = player.attributes.talent;
    if (talent >= 80)      prob += 15;
    else if (talent >= 70) prob += 8;
    else if (talent >= 60) prob += 2;
    else                   prob -= 10;

    const avgOverall = getSquadAvgOverall(squad);
    const diff = player.overallRating - avgOverall;
    if (diff >= -3)       prob += 15;
    else if (diff >= -7)  prob += 8;
    else if (diff >= -12) prob -= 3;
    else                  prob -= 12;

    if (quizScore >= 85)      prob += 20;
    else if (quizScore >= 70) prob += 10;
    else if (quizScore < 50)  prob -= 15;

    prob += (owner.ambicja - 10) * 1.5;
    prob += (owner.hojnosc - 10);

    if (owner.doswiadczenie > 12 && profile.ryzyko > 3) {
      prob -= (owner.doswiadczenie - 10) * profile.ryzyko * 0.4;
    }

    const rng = (Math.random() * 16) - 8;
    prob += rng;

    return Math.max(5, Math.min(95, Math.round(prob)));
  },

  buildOwnerMessage(approved: boolean, probability: number, profile: YouthManagerProfile): string {
    if (approved) {
      if (probability >= 80) return 'Doceniamy potencjał zawodnika oraz przedstawioną ocenę sztabu. Klub wyraża zgodę na nowy kontrakt.';
      if (probability >= 65) return 'Po analizie argumentów trenera zdecydowaliśmy się zatwierdzić ten kontrakt. Oczekujemy jednak wyników.';
      return 'Z pewnym wahaniem, ale wyrażamy zgodę. Trener przekonał nas swoją oceną.';
    }
    if (profile.spojnosc < 60) return 'Odpowiedzi trenera były niespójne — nie możemy zatwierdzić takiej inwestycji na podstawie sprzecznych argumentów.';
    if (probability < 30)      return 'Analiza sztabu nie przekonała zarządu. Zawodnik wymaga jeszcze czasu, zanim rozważymy tak znaczący kontrakt.';
    return 'Byliśmy bliscy zgody, ale ryzyko inwestycji jest zbyt duże na tym etapie jego kariery.';
  },

  evaluateYouthInvestmentWorthiness(
    player: Player,
    squad: Player[],
    club: Club,
    coachExperience: number = 10
  ): YouthStage1Result {
    const talent = player.attributes.talent;
    const avgOverall = getSquadAvgOverall(squad);
    const diff = player.overallRating - avgOverall;
    const director = club.sportingDirector;

    let score = 0;
    let directorNote = '';

    if (talent >= 80) {
      score += 3;
      directorNote = 'Wyjątkowy talent — to jeden z najbardziej perspektywicznych zawodników w tym wieku.';
    } else if (talent >= 65) {
      score += 2;
      directorNote = 'Dobry talent, który przy odpowiednim wsparciu może dużo dać klubowi.';
    } else if (talent >= 50) {
      score += 1;
      directorNote = 'Przeciętny potencjał — inwestycja ma sens, ale bez wielkich oczekiwań.';
    } else {
      score -= 2;
      directorNote = 'Nie widzę tu wystarczającego talentu, by uzasadnić tak duży skok pensji.';
    }

    if (diff >= -5) {
      score += 2;
      directorNote += ' Poziomem jest bardzo bliski drużyny — gotowy na ten krok.';
    } else if (diff >= -10) {
      score += 1;
      directorNote += ' Ma potencjał, by osiągnąć poziom drużyny, choć jeszcze trochę brakuje.';
    } else if (diff >= -15) {
      score -= 1;
      directorNote += ' Jest jeszcze dość daleko od poziomu pierwszego składu.';
    } else {
      score -= 2;
      directorNote += ' Różnica poziomu jest zbyt duża, by uzasadnić tak dużą inwestycję.';
    }

    if (director?.developmentVision !== undefined && director.developmentVision >= 14) {
      score += 1;
      directorNote += ' Moja wizja rozwoju podpowiada, że to odpowiedni moment na inwestycję.';
    }

    let coachNote = '';
    if (coachExperience >= 15 && talent >= 65) {
      score += 1;
      coachNote = 'Po wielu latach w futbolu wiem, że takich talentów nie wolno marnować. Popieram inwestycję.';
    } else if (coachExperience >= 10) {
      coachNote = 'Widzę w nim potencjał, ale potrzebujemy jeszcze chwili, by w pełni ocenić jego możliwości.';
    } else {
      coachNote = 'Dopiero zaczynam go poznawać, ale pierwsze wrażenia są pozytywne.';
    }

    return {
      worthInvesting: score >= 2,
      directorNote,
      coachNote,
    };
  },

  evaluateStage2PreDecision(player: Player, squad: Player[], club: Club): YouthStage2PreDecision {
    const owner = club.management?.owner;
    if (!owner) return 'INTERVIEW';

    let score = 50;

    const talent = player.attributes.talent;
    if (talent >= 80)      score += 15;
    else if (talent >= 70) score += 8;
    else if (talent >= 60) score += 2;
    else                   score -= 10;

    const avgOverall = getSquadAvgOverall(squad);
    const diff = player.overallRating - avgOverall;
    if (diff >= -3)       score += 15;
    else if (diff >= -7)  score += 8;
    else if (diff >= -12) score -= 3;
    else                  score -= 12;

    score += (owner.ambicja - 10) * 1.5;
    score += (owner.hojnosc - 10);

    const rng = (Math.random() * 10) - 5;
    score += rng;

    if (score >= 78) return 'IMMEDIATE_APPROVE';
    if (score <= 28) return 'IMMEDIATE_REJECT';
    return 'INTERVIEW';
  },
};
