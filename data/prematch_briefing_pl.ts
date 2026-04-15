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
    text: 'Nikt w nas nie wierzy. Dzisiaj pokażemy im, że piłka jest okrągła. Nie mamy nic do stracenia, a wiele do zyskania!',
    hiddenType: 'UPRISING',
  },
  {
    id: 'PB_2',
    text: 'Oddajmy im piłkę ale kontrolujmy to spotkanie i grajmy ostrożnie z tyłu. Wystarczy jedna kontra i ten mecz jest nasz.',
    hiddenType: 'FORTRESS',
  },
  {
    id: 'PB_3',
    text: 'Widziałem, co o nas pisali w prasie. Widziałem ich miny na konferencji. Pokażemy im na boisku, że się mylą.',
    hiddenType: 'WOUNDED_PRIDE',
  },
  {
    id: 'PB_4',
    text: 'Dziś nie ma taktyki, nie ma planu B. Jest tylko serce. Gramy swoje i nie odpuszczamy ani sekundy!',
    hiddenType: 'KAMIKAZE',
  },
  {
    id: 'PB_5',
    text: 'Wiemy o nich wszystko. Trzymajmy się tylko planu. Jeśli nie damy się ponieść emocjom to zwycięstwo samo do nas przyjdzie.',
    hiddenType: 'TACTICIAN',
  },
  {
    id: 'PB_6',
    text: 'Zaczynamy ostro od samego początku. Wychodzimy i atakujemy od pierwszych minut zanim oni zdążą wejść w ten mecz. Zrozumiano ?!',
    hiddenType: 'BLITZ',
  },
  {
    id: 'PB_7',
    text: 'Pamiętajcie, że mecz trwa dziewięćdziesiąt minut. Nie biegamy bez sensu. Gramy spokojnie i precyzyjnie, a efekty przyjdą same.',
    hiddenType: 'PATIENCE',
  },
  {
    id: 'PB_8',
    text: 'Szanujemy rywala ale gramy swoje i nie odpuszczamy. Bez kombinowania, bez głupich błędów i pełna koncentracja przez dziewięćdziesiąt minut.',
    hiddenType: 'PROFESSIONALISM',
  },
  {
    id: 'PB_9',
    text: 'Spokojnie Panowie! To rutynowy mecz. Oszczędzamy siły, gramy spokojnie bez nerwów. Oni i tak nie mają z nami szans. Jestem pewien, że to będzie łatwa wygrana.',
    hiddenType: 'LOOSE',
  },
  {
    id: 'PB_10',
    text: 'Jedziemy z nimi po całości. Gramy piłką i nie odpuszczamy. Pressing, szybkie wyjścia i dużo walki.',
    hiddenType: 'DOMINANCE',
  },
];
