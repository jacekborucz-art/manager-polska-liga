export type MotivationTalkType =
  | 'HONEST'
  | 'AGGRESSIVE'
  | 'PRAISE'
  | 'DOUBT'
  | 'BELIEF'
  | 'OVERCONFIDENT'
  | 'CALM'
  | 'CHALLENGE'
  | 'UNITY'
  | 'PRESS'
  | 'HISTORY'
  | 'SILENCE'
  | 'INDIVIDUAL'
  | 'DEMAND'
  | 'TACTICAL';

export interface MotivationTalkOption {
  type: MotivationTalkType;
  title: string;
  description: string;
  // Zakres bazowy efektu (min, max) — kontekst modyfikuje prawdopodobieństwo i amplitudę
  baseMin: number;
  baseMax: number;
}

export const WEEKLY_MOTIVATION_TALKS: MotivationTalkOption[] = [
  {
    type: 'HONEST',
    title: 'Szczera rozmowa',
    description: 'Powiem wam wprost jak widzę sytuację — bez owijania w bawełnę. Oceniam co robimy dobrze, a co wymaga poprawy.',
    baseMin: -15,
    baseMax: 22,
  },
  {
    type: 'AGGRESSIVE',
    title: 'Ostra rozmowa',
    description: 'Nie akceptuję takiej postawy. Musicie dać z siebie więcej — każdy z was, bez wyjątków. To nie jest czas na połowiczne zaangażowanie.',
    baseMin: -14,
    baseMax: 20,
  },
  {
    type: 'PRAISE',
    title: 'Pochwała zespołu',
    description: 'Jestem z was dumny. Widzę postęp, widzę zaangażowanie. Właśnie tak wygląda drużyna, która zmierza we właściwym kierunku.',
    baseMin: -6,
    baseMax: 14,
  },
  {
    type: 'DOUBT',
    title: 'Wyrażenie wątpliwości',
    description: 'Martwię się o naszą formę. Chcę żebyście wiedzieli, że widzę problemy — i że oczekuję, że razem je rozwiążemy.',
    baseMin: -12,
    baseMax: 10,
  },
  {
    type: 'BELIEF',
    title: 'Wiara w zespół',
    description: 'Wierzę w każdego z was. Wierzę, że możemy to osiągnąć — niezależnie od tego, co pokazuje tabela. Macie moje pełne zaufanie.',
    baseMin: -5,
    baseMax: 13,
  },
  {
    type: 'OVERCONFIDENT',
    title: 'Pewność siebie',
    description: 'Jesteśmy najlepszą drużyną w tej lidze. Nikt nas nie pokona jeśli gramy razem. Każdy rywal powinien się nas bać.',
    baseMin: -10,
    baseMax: 8,
  },
  {
    type: 'CALM',
    title: 'Spokojne podejście',
    description: 'Skupmy się na procesie, nie na wynikach. Róbmy swoje, krok po kroku — wyniki przyjdą same jeśli będziemy konsekwentni.',
    baseMin: -3,
    baseMax: 9,
  },
  {
    type: 'CHALLENGE',
    title: 'Wyzwanie',
    description: 'Udowodnijcie, że jesteście warci tego miejsca w składzie. Każdy trening, każdy mecz — to jest moment żebyście pokazali na co was stać.',
    baseMin: -14,
    baseMax: 18,
  },
  {
    type: 'UNITY',
    title: 'Jedność drużyny',
    description: 'Jesteśmy rodziną. Na boisku i poza nim. Kiedy jeden z nas pada — reszta go podnosi. Nikt przez to nie przechodzi sam.',
    baseMin: -4,
    baseMax: 12,
  },
  {
    type: 'PRESS',
    title: 'Presja kibiców',
    description: 'Kibice przychodzą na każdy mecz z wiarą w was. Widzę ile to dla nich znaczy. Chcę żebyście o tym pamiętali wchodząc na boisko.',
    baseMin: -8,
    baseMax: 13,
  },
  {
    type: 'HISTORY',
    title: 'Historia klubu',
    description: 'Ten klub przeżył gorsze chwile niż te. Wielcy poprzednicy też mieli kryzysy — i wychodzili z nich silniejsi. Teraz wasza kolej.',
    baseMin: -3,
    baseMax: 11,
  },
  {
    type: 'SILENCE',
    title: 'Daj im przestrzeń',
    description: 'Nie mam dziś wielu słów. Znam was — sami wiecie co trzeba zrobić. Ufam waszemu profesjonalizmowi.',
    baseMin: -2,
    baseMax: 4,
  },
  {
    type: 'INDIVIDUAL',
    title: 'Indywidualne podejście',
    description: 'Rozmawiałem z każdym z was osobno. Wiem czego potrzebujecie. Dziś to przekładamy na drużynę — razem jesteśmy silniejsi.',
    baseMin: -4,
    baseMax: 15,
  },
  {
    type: 'DEMAND',
    title: 'Twarde wymagania',
    description: 'Oczekuję stu procent od każdego. Kto nie jest gotowy dać z siebie wszystkiego — nie ma miejsca w tym składzie. Proste zasady.',
    baseMin: -16,
    baseMax: 17,
  },
  {
    type: 'TACTICAL',
    title: 'Skupienie taktyczne',
    description: 'Zapomnijcie o tym co było. Skupmy się na detalach — ustawieniu, przejściach, pressingу. Gra taktyczna wygruje mecze.',
    baseMin: -3,
    baseMax: 8,
  },
];
