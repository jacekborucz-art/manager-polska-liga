export type BriefingSpeechType =
  | 'UPRISING'
  | 'FORTRESS'
  | 'WOUNDED_PRIDE'
  | 'KAMIKAZE'
  | 'TACTICIAN'
  | 'BLITZ'
  | 'PATIENCE'
  | 'PROFESSIONALISM'
  | 'LOOSE'
  | 'DOMINANCE';

export interface BriefingSpeech {
  id: string;
  text: string;
  hiddenType: BriefingSpeechType;
}

export const PREMATCH_BRIEFINGS: BriefingSpeech[] = [
  {
    id: 'PB_1',
    text: 'Nikt w nas nie wierzy. Dzisiaj pokażemy im, że piłka jest okrągła. Macie nic do stracenia — wszystko do zyskania!',
    hiddenType: 'UPRISING',
  },
  {
    id: 'PB_2',
    text: 'Dajmy im piłkę. Stańmy jak mur — każdy duel wygrany to nasz punkt. Jedna kontra i ten mecz jest nasz.',
    hiddenType: 'FORTRESS',
  },
  {
    id: 'PB_3',
    text: 'Widziałem co o nas napisali. Widziałem ich miny na konferencji. Pokażcie im, że się mylą — każdym krokiem na tym boisku.',
    hiddenType: 'WOUNDED_PRIDE',
  },
  {
    id: 'PB_4',
    text: 'Nie ma taktyki, nie ma planu B. Jest tylko serce. Grajcie tak, jakby jutro nie istniało — i nie odpuszczajcie ani sekundy!',
    hiddenType: 'KAMIKAZE',
  },
  {
    id: 'PB_5',
    text: 'Wiemy o nich wszystko. Mamy ich rozgryzionych. Trzymamy plan, nie dajemy się ponieść emocjom — zwycięstwo samo do nas przyjdzie.',
    hiddenType: 'TACTICIAN',
  },
  {
    id: 'PB_6',
    text: 'Pierwsze piętnaście minut to nasz czas! Wyjdźcie i zaatakujcie zanim zdążą wejść w rytm. Jeden gol na wejście — i mecz jest nasz!',
    hiddenType: 'BLITZ',
  },
  {
    id: 'PB_7',
    text: 'Mecz trwa dziewięćdziesiąt minut. Nie biegajcie bez sensu. Cierpliwość i skupienie — nasza chwila na pewno nadejdzie.',
    hiddenType: 'PATIENCE',
  },
  {
    id: 'PB_8',
    text: 'Szanujemy rywala. Gramy swój futbol. Zero niespodzianek, zero błędów — pełen profesjonalizm przez dziewięćdziesiąt minut.',
    hiddenType: 'PROFESSIONALISM',
  },
  {
    id: 'PB_9',
    text: 'Spokojnie chłopaki. To rutynowy mecz. Oszczędzajcie siły, nie szarżujcie — wynik jest nasz, gramy swobodnie.',
    hiddenType: 'LOOSE',
  },
  {
    id: 'PB_10',
    text: 'Rozniesiemy ich. Pokażemy klasę i nie damy im ani chwili spokoju. Bezlitosny pressing, szybkie akcje — żadnej litości!',
    hiddenType: 'DOMINANCE',
  },
];
