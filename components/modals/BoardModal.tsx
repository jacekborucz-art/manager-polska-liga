
import React, { useMemo, useState } from 'react';
import { Club, BoardAttributeLevel, ClubBoard, CompetitionType, MatchStatus, Fixture, Player, SportingDirectorObjective, SportingDirectorPersonality, StadiumStand } from '../../types';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { useGame } from '../../context/GameContext';
import { BoardRequestModal } from './BoardRequestModal';
import { StadiumModal } from './StadiumModal';
import { StadiumExpansionRequestModal } from './StadiumExpansionRequestModal';
import { Stadium3DViewer } from '../stadium/Stadium3DViewer';

interface BoardModalProps {
  club: Club;
  confidence: number;
  rank: number;
  fixtures: Fixture[];
  onClose: () => void;
}

const ATTR_NAME: Record<keyof ClubBoard, string> = {
  hojnosc:     'HOJNOŚĆ',
  ambicja:     'AMBICJA',
  cierpliwosc: 'CIERPLIWOŚĆ',
  chciwosc:    'CHCIWOŚĆ',
  oczekiwania: 'OCZEKIWANIA',
  kompetencja: 'KOMPETENCJA',
};

const LEVEL_LABEL: Record<BoardAttributeLevel, string> = {
  bardzo_niska: 'BARDZO NISKA',
  niska:        'NISKA',
  przecietna:   'PRZECIĘTNA',
  wysoka:       'WYSOKA',
  bardzo_wysoka:'BARDZO WYSOKA',
};


const LEVEL_BAR_COLOR: Record<BoardAttributeLevel, string> = {
  bardzo_niska: '#ef4444',
  niska:        '#fb923c',
  przecietna:   '#facc15',
  wysoka:       '#4ade80',
  bardzo_wysoka:'#34d399',
};

const LEVEL_BAR_WIDTH: Record<BoardAttributeLevel, string> = {
  bardzo_niska: '20%',
  niska:        '40%',
  przecietna:   '60%',
  wysoka:       '80%',
  bardzo_wysoka:'100%',
};

const HOJNOSC_TEXT: Record<BoardAttributeLevel, string> = {
  bardzo_wysoka: 'Jesteśmy gotowi inwestować znaczące środki, jeśli zajdzie taka potrzeba. Nie będziemy skąpić na wzmocnienia, które klub potrzebuje.',
  wysoka:        'Jesteśmy otwarci na rozsądne inwestycje w kadrę. Popieramy ambitne ruchy transferowe, które mają sens sportowy.',
  przecietna:    'Oczekujemy zrównoważonego podejścia do wydatków. Każdy transfer musi być uzasadniony ani rozrzutność, ani nadmierna oszczędność.',
  niska:         'Będziemy uważnie kontrolować każdy wydatek transferowy. Oczekujemy maksymalnej efektywności przy minimalnych nakładach.',
  bardzo_niska:  'Pomimo dostępnych środków będziemy śledzić każdą wydaną złotówkę. Nie pozwolimy na rozrzutność, każdy ruch musi być szczegółowo uzasadniony.',
};

// Reputacja: low = 1-3, mid = 4-6, high = 7-10
type RepTier = 'low' | 'mid' | 'high';
const getRepTier = (rep: number): RepTier => rep <= 3 ? 'low' : rep <= 6 ? 'mid' : 'high';

const EXPECTATIONS_TEXTS: Record<BoardAttributeLevel, Record<RepTier, string[]>> = {
  bardzo_wysoka: {
    low: [
      'Może nie jesteśmy jeszcze uznawani za faworytów, ale w tym sezonie celujemy w TOP 3. To ambitny cel i w pełni go zatwierdzamy.',
      'Nasz klub rośnie. Oczekujemy zakończenia sezonu w TOP 3, to sygnał dla całej ligi, że naprawdę się liczymy.',
      'Mimo skromniejszej historii oczekiwania są jasne, TOP 3. Chcemy udowodnić, że ten klub należy do czołówki.',
    ],
    mid: [
      'Mamy kadrę i zasoby, by walczyć o mistrzostwo. W tym sezonie oczekujemy zakończenia rozgrywek w TOP 3.',
      'Celujemy w TOP 3. Mamy odpowiedni potencjał i oczekujemy, że Pan go w pełni wykorzysta.',
      'Ten klub jest gotowy na wielkie rzeczy. Oczekujemy zakończenia sezonu w TOP 3 i walki o najwyższe laury.',
    ],
    high: [
      'Ten klub ma historię i obowiązek walki o mistrzostwo. Oczekujemy finiszu w TOP 3, wszystko poniżej będzie rozczarowaniem.',
      'Jesteśmy jednym z największych klubów w Polsce. Oczekiwania są jasne, TOP 3, a najlepiej tytuł mistrza.',
      'Z naszą reputacją i kadrą TOP 3 to absolutne minimum. Oczekujemy walki o tytuł do ostatniej kolejki.',
    ],
  },
  wysoka: {
    low: [
      'Rośniemy jako klub. W tym sezonie oczekujemy zakończenia w TOP 5, to realny i ambitny cel dla nas.',
      'Chcemy zaznaczyć swoją obecność w górnej połowie tabeli. TOP 5 to nasz cel na ten sezon.',
      'Nasz klub jest na wznoszącej. Oczekujemy finiszu w TOP 5 i pokażemy, że potrafimy bić się z mocniejszymi.',
    ],
    mid: [
      'Mamy zasoby i ambicje, by zakończyć sezon w TOP 6. Oczekujemy walki o europejskie puchary.',
      'TOP 5 to nasz cel, chcemy wejść na europejskie salony lub przynajmniej wyraźnie o to powalczyć.',
      'Oczekujemy zakończenia sezonu w czołowej szóstce. Mamy ku temu odpowiedni potencjał i kadrę.',
    ],
    high: [
      'Z naszym potencjałem i reputacją TOP 6 to minimum. Liczymy na solidną walkę o europejskie puchary.',
      'Ten klub należy do europejskich rozgrywek. Oczekujemy zakończenia sezonu w TOP 6, najlepiej wyżej.',
      'Jesteśmy zbyt dobrym klubem, by zadowalać się środkiem tabeli. Oczekujemy finiszu w TOP 6.',
    ],
  },
  przecietna: {
    low: [
      'Naszym priorytetem jest stabilna, bezpieczna pozycja w środku tabeli. Spokojny sezon to nasz cel.',
      'Zależy nam na spokoju. Bezpieczne miejsce w środku tabeli wystarczy, by kontynuować rozwój klubu.',
      'Środek tabeli to realistyczny i wystarczający cel. Budujemy fundament pod przyszłe sukcesy.',
    ],
    mid: [
      'Oczekujemy bezpiecznej pozycji w środku tabeli. Solidna gra i stabilność, to nasz cel na ten sezon.',
      'Środek tabeli to nasz punkt odniesienia. Chcemy spokojnego sezonu bez zbędnych nerwów.',
      'Priorytetem jest regularna i spokojna gra. Miejsce w środku tabeli wystarczy na tym etapie.',
    ],
    high: [
      'Ten sezon traktujemy jako rok konsolidacji. Środek tabeli wystarczy, by przygotować grunt pod przyszłe wyzwania.',
      'Mimo naszej reputacji, w tym sezonie stawiamy na stabilność i spokojną pozycję w środku tabeli.',
      'Nie chcemy presji wyników. Bezpieczny środek tabeli daje nam przestrzeń do długofalowej pracy.',
    ],
  },
  niska: {
    low: [
      'Wiemy, że stoimy przed trudnym zadaniem. Utrzymanie się w lidze będzie dla nas pełnym sukcesem.',
      'Naszym jedynym celem jest utrzymanie w lidze. Każdy zdobyty punkt będzie cenny.',
      'Walczymy o przetrwanie. Utrzymanie się w tej klasie rozgrywkowej to nasz najważniejszy priorytet.',
    ],
    mid: [
      'W tym sezonie skupiamy się na utrzymaniu. Stabilizacja i praca są ważniejsze niż wygórowane ambicje.',
      'Priorytetem jest utrzymanie w lidze. Zbudowanie solidnych fundamentów jest kluczowym celem.',
      'Utrzymanie to nasz cel minimum. Liczymy, że Pan doprowadzi drużynę do bezpiecznej przystani.',
    ],
    high: [
      'Po trudnym czasie oczekujemy przede wszystkim ustabilizowania sytuacji i bezpiecznego utrzymania w lidze.',
      'W tym sezonie skupiamy się głównie na utrzymaniu. Ambicje wrócimy, gdy będziemy na to gotowi.',
      'Klub przeżywa trudniejszy okres. Utrzymanie jest priorytetem, prestiż odbudujemy w przyszłości.',
    ],
  },
  bardzo_niska: {
    low: [
      'Walczymy o przetrwanie. Utrzymanie się w tej klasie rozgrywkowej będzie naszym największym sukcesem.',
      'Liczymy każdy punkt. Utrzymanie to jedyny cel, wszystko powyżej będzie miłą premią.',
      'Sytuacja jest trudna. Oczekujemy jedynie tego, że drużyna ustrzeże się przed spadkiem.',
    ],
    mid: [
      'Ten sezon będzie wymagający. Jedynym celem jest uniknięcie spadku, wszystko inne to bonus.',
      'Nie ukrywamy, że priorytetem jest utrzymanie. Oczekujemy spokojnej, solidnej roboty na boisku.',
      'Utrzymanie w lidze jest jedynym celem na ten sezon. Bez zbędnego ryzyka i pochopnych decyzji.',
    ],
    high: [
      'Przeżywamy trudny okres w historii klubu. Jedynym celem jest utrzymanie, prestiż odbudujemy w przyszłości.',
      'Pomimo naszej historii musimy być realistami. Utrzymanie w lidze jest priorytetem numer jeden.',
      'Ten klub zasługuje na więcej, ale teraz liczymy tylko na utrzymanie. Odbudowa zacznie się od nowej podstawy.',
    ],
  },
};

// Dla drużyn 1. i 2. ligowej (L_PL_2, L_PL_3) — awans / baraż / utrzymanie
const LOWER_DIVISION_EXPECTATIONS: Record<BoardAttributeLevel, string[]> = {
  bardzo_wysoka: [
    'Oczekujemy bezpośredniego awansu. Miejsca 1-2 to jedyny akceptowalny wynik tego sezonu.',
    'Cel jest jasny: awans bezpośredni. Nie zadowolimy się niczym poniżej pierwszych dwóch miejsc w tabeli.',
    'Ten sezon ma zakończyć się awansem. Miejsca 1-2 to nasz priorytet absolutny i nie ma od niego odstępstw.',
  ],
  wysoka: [
    'Oczekujemy awansu, najlepiej bezpośredniego. Jeśli nie pierwsze dwa miejsca, to przynajmniej baraż jest obowiązkowy.',
    'Awans jest naszym celem. Miejsca 1-2 to ideał, ale baraż też nas satysfakcjonuje. Ważne, żebyśmy wyszli z tej ligi.',
    'Celujemy w górę tabeli. Bezpośredni awans lub przynajmniej baraż, to minimum, które zaakceptujemy na koniec sezonu.',
  ],
  przecietna: [
    'Chcemy walczyć o baraże. Miejsca 3-6 dają nam szansę na awans i taki jest nasz cel na ten sezon.',
    'Oczekujemy zakończenia sezonu w strefie barażowej. Miejsca 3-6 to realny i ambitny cel dla tej drużyny.',
    'Baraże to nasz cel. Chcemy być w górnej połowie tabeli i walczyć o szansę na awans w barażach.',
  ],
  niska: [
    'Priorytetem jest trzymanie się z dala od strefy spadkowej. Spokojny sezon bez zbędnych nerwów.',
    'Oczekujemy bezpiecznej pozycji w tabeli. Nie chcemy walczyć o utrzymanie, środek stawki nas zadowoli.',
    'Naszym celem jest stabilność. Chcemy unikać bezpośredniego zagrożenia spadkiem i tyle na ten sezon.',
  ],
  bardzo_niska: [
    'Jedynym celem jest utrzymanie w lidze. Każdy zdobyty punkt będzie na wagę złota.',
    'Walczymy o przetrwanie. Utrzymanie się w tej klasie rozgrywkowej będzie dla nas pełnym sukcesem.',
    'Priorytetem numer jeden jest unikanie spadku. Nic innego nas w tej chwili nie interesuje.',
  ],
};

// Dla klubów o wysokiej reputacji (7-10) ambicja zarządu decyduje o aspiracjach,
// bo nawet skromny zarząd Legii nie może zejść poniżej miejsc pucharowych.
const HIGH_REP_EXPECTATIONS: Record<BoardAttributeLevel, string[]> = {
  bardzo_wysoka: [
    'Cel na ten sezon jest jeden: mistrzostwo lub wicemistrzostwo Polski oraz Puchar Polski. Nic poniżej nie będzie akceptowalne.',
    'Ten klub żyje trofeami. Oczekujemy tytułu mistrza lub wicemistrza oraz zdobycia Pucharu Polski to nasze dwa priorytety.',
    'Historia tego klubu zobowiązuje. Mistrzostwo lub wicemistrzostwo i Puchar Polski to jedyne cele, które nas interesują.',
  ],
  wysoka: [
    'Oczekujemy zakończenia sezonu na 1 lub 2 miejscu w lidze oraz dotarcia do finału Pucharu Polski. To minimum dla klubu tej rangi.',
    'Mistrzostwo lub wicemistrzostwo to nasz cel ligowy. Równolegle wymagamy poważnego podejścia do Pucharu Polski.',
    'Z naszą kadrą i historią satysfakcjonuje nas tylko miejsce na podium, a najlepiej pierwsze lub drugie, plus walka o Puchar Polski.',
  ],
  przecietna: [
    'Jesteśmy dużym klubem, ale ten sezon traktujemy z pokorą. Oczekujemy finiszu w TOP 4.',
    'Cel na ten sezon: TOP 4. Chcemy walczyć o europejskie puchary, to minimum dla naszej rangi.',
    'Oczekujemy miejsca w czołowej szóstce i powrotu do europejskich rozgrywek.',
  ],
  niska: [
    'Pomimo naszej reputacji oczekujemy w tym sezonie co najmniej miejsc pucharowych TOP 4 to minimum.',
    'Klub tej rangi musi przynajmniej walczyć o europejskie puchary. Minimum to TOP 4.',
    'Nawet w trudniejszym sezonie nie możemy odpuścić miejsc pucharowych. TOP 4 to nasze twarde minimum.',
  ],
  bardzo_niska: [
    'Nasze ambicje są ograniczone, ale dla klubu tej rangi miejsca pucharowe to absolutne minimum. Celujemy w TOP 4.',
    'Nie liczymy na mistrzostwo, ale TOP 4 i europejskie puchary muszą być celem minimalnym.',
    'Klub z naszą historią nie może zejść poniżej miejsc pucharowych. TOP 4 to dolna granica, której nie przekroczymy.',
  ],
};

const getExpectationsText = (oczekiwania: BoardAttributeLevel, reputation: number, ambicja: BoardAttributeLevel, leagueId: string, seed: number): string => {
  if (leagueId === 'L_PL_2' || leagueId === 'L_PL_3') {
    return pick(LOWER_DIVISION_EXPECTATIONS[oczekiwania], seed + 17);
  }
  const tier = getRepTier(reputation);
  if (tier === 'high') {
    return pick(HIGH_REP_EXPECTATIONS[ambicja], seed + 17);
  }
  return pick(EXPECTATIONS_TEXTS[oczekiwania][tier], seed + 17);
};

const EXPECTED_MAX_RANK: Record<BoardAttributeLevel, number> = {
  bardzo_wysoka: 3,
  wysoka:        6,
  przecietna:    12,
  niska:         15,
  bardzo_niska:  18,
};

const PATIENCE_THRESHOLD: Record<BoardAttributeLevel, number> = {
  bardzo_wysoka: 15,
  wysoka:        12,
  przecietna:    8,
  niska:         5,
  bardzo_niska:  3,
};

type SituationType =
  | 'early' | 'good' | 'cupPolish' | 'cupEuropean'
  | 'mixed' | 'concern' | 'warning' | 'seriousWarning'
  | 'formGood' | 'formPoor' | 'formNeutral';

const SITUATION_MESSAGES: Record<SituationType, string[]> = {
  early: [
    'Na chwilę obecną nie mamy uwag do Pańskiej pracy.',
    'Jesteśmy na początku drogi, obserwujemy i spokojnie czekamy na więcej danych.',
    'Sezon dopiero się rozkręca. Na tym etapie nie ma podstaw do niepokoju.',
    'Na chwilę obecną nie mamy uwag do Pańskiej pracy.',
    'Pierwsze kolejki to zawsze test. Śledzimy sytuację ze spokojem.',
  ],
  good: [
    'Wyniki są bardzo satysfakcjonujące. Proszę tak trzymać.',
    'Drużyna reaguje dokładnie tak, jak oczekiwaliśmy. Jesteśmy zadowoleni.',
    'Pozycja w tabeli napawa nas optymizmem. Doskonała robota.',
    'To jest dokładnie to, czego oczekujemy od naszego szkoleniowca.',
    'Zarząd jest z Pana pracy bardzo zadowolony. Liczymy na utrzymanie tej formy.',
  ],
  cupPolish: [
    'Awans w Pucharze Polski to świetna wiadomość. Liczymy na kolejne rundy.',
    'Wyniki w Pucharze Polski są imponujące. Cel pucharowy staje się realny.',
    'Dobra passa w Pucharze dodaje nam wszystkim energii i wiary.',
    'Puchar Polski jest ważnym celem. Cieszymy się z konsekwentnych postępów.',
    'Awans w Pucharze to sukces, który doceniamy i chcemy kontynuować.',
  ],
  cupEuropean: [
    'Wyniki w europejskich rozgrywkach to powód do dumy dla całego klubu.',
    'Europa daje nam prestiż. Proszę nie zapominać o lidze, wyniki europejskie są obiecujące ale Liga to nasz priorytet.',
    'Awans w europejskich pucharach to coś, z czego jesteśmy naprawdę dumni.',
    'Gra w Europie to wizytówka naszego klubu. Gratulujemy.',
    'Europejskie sukcesy przekładają się na wizerunek i finansowe możliwości klubu.',
  ],
  mixed: [
    ' Oczekujemy stabilizacji i bardziej równomiernej gry Pańskiej drużyny.',
    'Drużyna gra w kratę: jeden dobry mecz, następny słabszy. Może najwyzszy czas na znalezienie formuły, która zapewni większą regularność?',
    'Forma naszej drużyny nie do końca nas satysfakcjonuje. Oczekujemy większej konsekwencji w prowadzeniu drużyny.',
    'Zarząd oczekuje większej regularności w wynikach. To nie czas na eksperymenty.',
    'Ta huśtawka wyników jest niepokojąca. Prosimy o jak najszybszą reakcję.',
  ],
  concern: [
    'Wyniki nie spełniają naszych oczekiwań. Zarząd klubu obserwuje sytuację z niepokojem.',
    'Jesteśmy zaniepokojeni obecnym przebiegiem rozgrywek. Oczekujemy dużo lepszej postawy na boisku.',
    'Pozycja w tabeli nie wygląda tak, jak sobie ją wyobrażaliśmy. Czekamy na wyraźną poprawę.',
    'Cierpliwość zarządu ma swoje granice. Na razie obserwujemy, ale czas ucieka.',
    'Wymagamy szybkiej i konkretnej reakcji. Wyniki drużyny muszą się poprawić.',
  ],
  warning: [
    'Wyniki naszej drużyny zdecydowanie poniżej oczekiwań i wymagają natychmiastowej poprawy.',
    'Jesteśmy bardzo niezadowoleni z obecnej pozycji drużyny w tabeli to musi się zmienić w krotkim czasie.',
    'Zarząd oczekuje zdecydowanej zmiany. Sytuacja jest poważna i wymaga Pana konkretnej reakcji.',
    'To nie są wyniki, których oczekiwaliśmy inwestując w tę drużynę. Taka sytuacja jest nie do zaakceptowania.',
    'Nasze zaufanie do Pana jest wystawione na poważną próbę. Oczekujemy szybkiej poprawy.',
  ],
  seriousWarning: [
    'Pozycja drużyny w tabeli to wstyd dla tego klubu. Proszę to traktować jakoformalne ostrzeżenie.',
    'Zarząd rozważa podjęcie zdecydowanych kroków w związku z serią słabych wyników. Wkrótce będziemy musieli podjąć decyzję o przyszłości tej drużyny.',
    'Nie możemy dłużej tolerować takiego poziomu gry. Wymagamy natychmiastowej poprawy.',
    'To jest ostatni moment na uratowanie sytuacji. Zarząd nie zamierza dłużej czekać.',
    'Wyniki są katastrofalne. Musi Pan zdawać sobie sprawę z powagi sytuacji.',
  ],
  formGood: [
    'Wyniki są bardzo satysfakcjonujące. Forma drużyny nas cieszy.',
    'Drużyna wygrywa mecze, to jest fundament naszej oceny Pańskiej pracy.',
    'Forma jest znakomita. Proszę tak trzymać.',
    'Wyniki w ostatnich meczach bardzo nas zadowalają.',
    'Dobra seria, zarząd jest z Pańskiej pracy zadowolony.',
  ],
  formPoor: [
    'Seria porażek jest niepokojąca. Oczekujemy natychmiastowej poprawy.',
    'Wyniki w ostatnich meczach nie spełniają naszych oczekiwań.',
    'Forma drużyny jest rozczarowująca. Zarząd jest wyraźnie zaniepokojony.',
    'Proszę natychmiast wytłumaczyć nam przyczynę tych porażek.',
    'Nie możemy pozwolić, aby ta seria porażek się dalej przedłużała.',
  ],
  formNeutral: [
    'Na chwilę obecną nie mamy uwag do Pańskiej pracy.',
    'Obserwujemy sytuację. Forma drużyny jest wyrównana.',
    'Na chwilę obecną wyniki wyglądają w porządku. Czekamy jednak na więcej spotkań.',
    'Nie mamy zastrzeżeń na tym etapie sezonu. Forma jest stabilna, ale na pewno chcielibyśmy zobaczyć więcej pozytywnych wyników.',
    'Brak uwag do tej pory, ale oczekujemy, że drużyna będzie się rozwijać i poprawiać formę w kolejnych meczach.',
  ],
};



const pick = (arr: string[], seed: number): string => arr[Math.abs(seed) % arr.length];

const ATTR_ROWS: (keyof ClubBoard)[][] = [
  ['hojnosc', 'ambicja', 'cierpliwosc'],
  ['chciwosc', 'oczekiwania', 'kompetencja'],
];

const getDirectorPersonalityLabel = (personality?: SportingDirectorPersonality): string => {
  switch (personality) {
    case 'CONTROLLER': return 'Kontroler';
    case 'VISIONARY': return 'Wizjoner';
    case 'ACCOUNTANT': return 'Księgowy';
    case 'PARTNER': return 'Partner trenera';
    case 'POLITICIAN': return 'Polityk klubowy';
    case 'TALENT_HUNTER': return 'Łowca talentów';
    default: return 'Dyrektor';
  }
};

const getDirectorRelationshipColor = (value = 50): string => {
  if (value >= 70) return 'text-emerald-400';
  if (value >= 45) return 'text-amber-300';
  return 'text-red-400';
};

const getDirectorBoardInfluenceLabel = (value = 0): string => {
  if (value <= -12) return 'Bardzo zła';
  if (value <= -8) return 'Zła';
  if (value <= -4) return 'Słaba';
  if (value <= 0) return 'Neutralna';
  if (value <= 3) return 'Zadowalająca';
  if (value <= 7) return 'Dobra';
  if (value <= 11) return 'Bardzo dobra';
  return 'Super';
};

const getDirectorRelationshipLabel = (value = 50): string => {
  if (value >= 85) return 'Bardzo dobra';
  if (value >= 70) return 'Dobra';
  if (value >= 45) return 'Poprawna';
  if (value >= 30) return 'Chlodna';
  return 'Zla';
};

const clampObjectiveProgress = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

const getHighPotentialYouthMinutes = (squad: Player[]): number =>
  squad
    .filter(player => player.age <= 21 && player.attributes.talent >= 68)
    .reduce((sum, player) => sum + player.stats.minutesPlayed, 0);

const getSquadWageBill = (squad: Player[]): number =>
  squad.reduce((sum, player) => sum + (player.annualSalary ?? 0), 0);

const getObjectiveStatusLabel = (status: SportingDirectorObjective['status']): string => {
  switch (status) {
    case 'COMPLETED': return 'Zaliczone';
    case 'FAILED': return 'Niezaliczone';
    case 'AWAITING_REVIEW': return 'W realizacji';
    default: return 'Aktywne';
  }
};

const getObjectiveStatusClasses = (status: SportingDirectorObjective['status']): string => {
  switch (status) {
    case 'COMPLETED': return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20';
    case 'FAILED': return 'bg-red-500/15 text-red-300 border-red-400/20';
    case 'AWAITING_REVIEW': return 'bg-sky-500/15 text-sky-300 border-sky-400/20';
    default: return 'bg-amber-500/15 text-amber-300 border-amber-400/20';
  }
};

const getObjectiveProgressClasses = (status: SportingDirectorObjective['status']): string => {
  switch (status) {
    case 'COMPLETED': return 'bg-emerald-400';
    case 'FAILED': return 'bg-red-400';
    case 'AWAITING_REVIEW': return 'bg-sky-400';
    default: return 'bg-amber-400';
  }
};

const getObjectivePanelData = (
  objective: SportingDirectorObjective,
  club: Club,
  rank: number,
  squad: Player[]
): {
  progressPercent: number;
  progressLabel: string;
  summaryLabel: string;
  summaryValue: string;
  resolvedMark: 'V' | 'X' | null;
} => {
  if (objective.status === 'COMPLETED') {
    return {
      progressPercent: 100,
      progressLabel: 'Cel został wykonany',
      summaryLabel: 'Wynik',
      summaryValue: 'Zadanie domknięte pozytywnie',
      resolvedMark: 'V',
    };
  }

  if (objective.status === 'FAILED') {
    return {
      progressPercent: 100,
      progressLabel: 'Cel został przegrany',
      summaryLabel: 'Wynik',
      summaryValue: 'Zadanie zakończone niepowodzeniem',
      resolvedMark: 'X',
    };
  }

  const matchesDelta = Math.max(0, club.stats.played - objective.baselinePlayed);
  const pointsDelta = Math.max(0, club.stats.points - objective.baselinePoints);
  const goalsAgainstDelta = Math.max(0, club.stats.goalsAgainst - objective.baselineGoalsAgainst);
  const youthMinutesDelta = Math.max(0, getHighPotentialYouthMinutes(squad) - (objective.baselineYouthMinutes ?? 0));
  const playerMinutesDelta = objective.targetPlayerId
    ? Math.max(0, (squad.find(player => player.id === objective.targetPlayerId)?.stats.minutesPlayed ?? objective.baselinePlayerMinutes ?? 0) - (objective.baselinePlayerMinutes ?? 0))
    : 0;
  const wageReduction = objective.baselineWageBill != null
    ? Math.max(0, objective.baselineWageBill - getSquadWageBill(squad))
    : 0;

  switch (objective.type) {
    case 'WIN_NEXT_MATCH':
      return {
        progressPercent: clampObjectiveProgress((pointsDelta / 3) * 100),
        progressLabel: `${Math.min(pointsDelta, 3)}/3 pkt`,
        summaryLabel: 'Warunek',
        summaryValue: matchesDelta > 0 ? 'Najbliższy mecz został rozegrany' : 'Czekamy na kolejny mecz ligowy',
        resolvedMark: null,
      };
    case 'AVOID_DEFEAT':
      return {
        progressPercent: clampObjectiveProgress(pointsDelta >= 1 ? 100 : 0),
        progressLabel: pointsDelta >= 1 ? 'Minimum punkt jest' : 'Punkt jeszcze nie został zdobyty',
        summaryLabel: 'Warunek',
        summaryValue: matchesDelta > 0 ? 'Najbliższy mecz został rozegrany' : 'Czekamy na kolejny mecz ligowy',
        resolvedMark: null,
      };
    case 'HOLD_TOP_SPOT':
      return {
        progressPercent: clampObjectiveProgress(rank <= 1 ? 100 : Math.max(0, 100 - (rank - 1) * 35)),
        progressLabel: rank <= 1 ? 'Lider utrzymany' : `Aktualnie ${rank}. miejsce`,
        summaryLabel: 'Cel tabeli',
        summaryValue: 'Utrzymać 1. miejsce',
        resolvedMark: null,
      };
    case 'STAY_IN_TOP_THREE':
      return {
        progressPercent: clampObjectiveProgress(rank <= 3 ? 100 : Math.max(0, 100 - (rank - 3) * 20)),
        progressLabel: rank <= 3 ? 'Czołówka utrzymana' : `Aktualnie ${rank}. miejsce`,
        summaryLabel: 'Cel tabeli',
        summaryValue: 'Utrzymać miejsce w top 3',
        resolvedMark: null,
      };
    case 'POINTS_RUN':
      return {
        progressPercent: clampObjectiveProgress((pointsDelta / Math.max(1, objective.target)) * 100),
        progressLabel: `${Math.min(pointsDelta, objective.target)}/${objective.target} pkt`,
        summaryLabel: 'Seria',
        summaryValue: `${matchesDelta} mecz. od startu celu`,
        resolvedMark: null,
      };
    case 'DEFENSIVE_RUN': {
      const remaining = Math.max(0, objective.target - goalsAgainstDelta);
      return {
        progressPercent: clampObjectiveProgress((remaining / Math.max(1, objective.target)) * 100),
        progressLabel: `${goalsAgainstDelta}/${objective.target} straconych`,
        summaryLabel: 'Limit',
        summaryValue: `${remaining} zapasu do limitu`,
        resolvedMark: null,
      };
    }
    case 'YOUTH_DEVELOPMENT':
      return {
        progressPercent: clampObjectiveProgress((youthMinutesDelta / Math.max(1, objective.target)) * 100),
        progressLabel: `${Math.min(youthMinutesDelta, objective.target)}/${objective.target} minut`,
        summaryLabel: 'Minuty U21',
        summaryValue: 'Liczą się minuty talentów U21',
        resolvedMark: null,
      };
    case 'PLAYER_MINUTES':
      return {
        progressPercent: clampObjectiveProgress((playerMinutesDelta / Math.max(1, objective.target)) * 100),
        progressLabel: `${Math.min(playerMinutesDelta, objective.target)}/${objective.target} minut`,
        summaryLabel: 'Zawodnik',
        summaryValue: objective.targetPlayerName ?? 'Wskazany młody zawodnik',
        resolvedMark: null,
      };
    case 'WAGE_DISCIPLINE':
      return {
        progressPercent: clampObjectiveProgress((wageReduction / Math.max(1, objective.target)) * 100),
        progressLabel: `${Math.min(wageReduction, objective.target).toLocaleString('pl-PL')} / ${objective.target.toLocaleString('pl-PL')} PLN`,
        summaryLabel: 'Redukcja',
        summaryValue: 'Spadek budżetu płac',
        resolvedMark: null,
      };
    default:
      return {
        progressPercent: 0,
        progressLabel: 'Brak danych',
        summaryLabel: 'Status',
        summaryValue: 'Czekamy na aktualizację',
        resolvedMark: null,
      };
  }
};

export const BoardModal: React.FC<BoardModalProps> = ({ club, confidence, rank, fixtures, onClose }) => {
  const { respondToSportingDirectorObjective, players, currentDate, requestStadiumExpansion } = useGame();
  const [isDirectorModalOpen, setIsDirectorModalOpen] = useState(false);
  const [isBoardRequestOpen, setIsBoardRequestOpen] = useState(false);
  const [isStadiumModalOpen, setIsStadiumModalOpen] = useState(false);
  const [isExpansionRequestOpen, setIsExpansionRequestOpen] = useState(false);
  const logo = getClubLogo(club.id);

  const attendanceHistory = useMemo(() => {
    return fixtures
      .filter(f => f.homeTeamId === club.id && f.status === MatchStatus.FINISHED && f.attendance != null)
      .slice(-10)
      .map(f => f.attendance!);
  }, [fixtures, club.id]);

  const handleExpansionSubmit = (stand: StadiumStand, requestedIncrease: number) => {
    requestStadiumExpansion(stand, requestedIncrease);
  };
  const board = club.board;
  const sportingDirector = club.sportingDirector;
  const directorPolicy = club.sportingDirectorPolicy;
  const directorObjective = club.sportingDirectorObjective;
  const directorBoardInfluence = club.sportingDirectorBoardInfluence ?? 0;
  const squad = players[club.id] ?? [];
  const objectivePanelData = directorObjective
    ? getObjectivePanelData(directorObjective, club, rank, squad)
    : null;

  const { situationType, seed } = useMemo<{ situationType: SituationType; seed: number }>(() => {
    const played = club.stats.played;
    const s = (played * 7 + rank * 3 + club.stats.wins * 11 + club.stats.losses * 5);

    if (!board) return { situationType: 'early', seed: s };

    // Drużyna bez ligi — forma
    if (club.leagueId === 'NONE') {
      if (played < 5) return { situationType: 'early', seed: s };
      const winRate = played > 0 ? club.stats.wins / played : 0.5;
      if (winRate >= 0.55) return { situationType: 'formGood', seed: s };
      if (winRate <= 0.35) return { situationType: 'formPoor', seed: s };
      return { situationType: 'formNeutral', seed: s };
    }

    if (played < 5) return { situationType: 'early', seed: s };

    // Puchary europejskie
    if ((club.europeanBonusPoints ?? 0) >= 4) return { situationType: 'cupEuropean', seed: s };

    // Puchar Polski — policz wygrane mecze
    const polishCupWins = fixtures.filter(f => {
      if (f.leagueId !== CompetitionType.POLISH_CUP) return false;
      if (f.status !== MatchStatus.FINISHED) return false;
      const isHome = f.homeTeamId === club.id;
      const isAway = f.awayTeamId === club.id;
      if (!isHome && !isAway) return false;
      const homeScore = f.homeScore ?? 0;
      const awayScore = f.awayScore ?? 0;
      if (homeScore !== awayScore) {
        return isHome ? homeScore > awayScore : awayScore > homeScore;
      }
      // Rzuty karne
      const hp = f.homePenaltyScore ?? 0;
      const ap = f.awayPenaltyScore ?? 0;
      return isHome ? hp > ap : ap > hp;
    }).length;
    if (polishCupWins >= 3) return { situationType: 'cupPolish', seed: s };

    // Sytuacja ligowa
    const expectedMax = EXPECTED_MAX_RANK[board.oczekiwania];
    const patience   = PATIENCE_THRESHOLD[board.cierpliwosc];
    const gap = rank - expectedMax;

    if (rank <= expectedMax) return { situationType: 'good', seed: s };
    if (rank >= 16 && played >= 12) return { situationType: 'seriousWarning', seed: s };
    if (gap > 5 && played >= patience) return { situationType: 'warning', seed: s };
    if (gap > 2 && played >= patience) return { situationType: 'concern', seed: s };
    if (gap > 3) return { situationType: 'mixed', seed: s };
    return { situationType: 'mixed', seed: s };
  }, [club, rank, fixtures, board]);

  const situationComment = useMemo(() => pick(SITUATION_MESSAGES[situationType], seed), [situationType, seed]);

  const infoColor = (['good', 'cupPolish', 'cupEuropean', 'formGood'] as SituationType[]).includes(situationType)
    ? 'text-emerald-400 drop-shadow-[0_1px_4px_rgba(52,211,153,0.4)]'
    : (['warning', 'seriousWarning', 'concern', 'formPoor'] as SituationType[]).includes(situationType)
    ? 'text-red-400 drop-shadow-[0_1px_4px_rgba(248,113,113,0.4)]'
    : 'text-yellow-400 drop-shadow-[0_1px_4px_rgba(250,204,21,0.4)]';

  const confidenceColor = confidence > 70 ? '#34d399' : confidence > 40 ? '#fbbf24' : '#ef4444';
  const confidenceTextColor = confidence > 70 ? 'text-emerald-400' : confidence > 40 ? 'text-amber-400' : 'text-red-500';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <div
        className="relative w-full max-w-[1560px] max-h-[92vh] overflow-y-auto rounded-[40px] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Tło */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${club.colorsHex[0]}cc 0%, ${club.colorsHex[1] || club.colorsHex[0]}99 50%, #0f172a 100%)`
            }}
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[40px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '52px 52px'
            }}
          />
        </div>

        {/* Przycisk zamknięcia */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm font-black"
        >
          ✕
        </button>

        {/* Zawartość */}
        <div className="relative z-10 grid gap-6 p-6 xl:grid-cols-[380px_minmax(0,1fr)_500px] xl:p-8">
          <aside className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">
            <div className="mb-5">
              <p className="text-[9px] font-black italic uppercase tracking-tighter text-sky-300/80">Panel</p>
              <h2 className="mt-1 text-2xl font-black italic uppercase tracking-tighter text-white">Członkowie Zarządu</h2>
            </div>

            {sportingDirector ? (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => setIsDirectorModalOpen(true)}
                  className="w-full rounded-[22px] border border-sky-500/20 bg-sky-500/10 p-4 text-left transition-all hover:border-sky-400/35 hover:bg-sky-500/15"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-300/20 bg-black/25 text-xl font-black text-sky-100">
                      DS
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black italic uppercase tracking-tighter text-sky-300">Dyrektor sportowy</p>
                      <p className="mt-1 text-lg font-black italic uppercase tracking-tighter leading-tight text-white">
                        {sportingDirector.firstName} {sportingDirector.lastName}
                      </p>
                      <p className="mt-1 text-[10px] font-black italic uppercase tracking-tighter text-slate-400">Dyrektor sportowy</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-2">
                    <span className="text-[9px] font-black italic uppercase tracking-tighter text-yellow-300">Szczegóły i interakcje</span>
                    <span className="text-[10px] font-black italic uppercase tracking-tighter text-yellow-300">Otwórz</span>
                  </div>
                </button>

                <div className="rounded-[20px] border border-white/5 bg-black/25 p-4">
                  <div className="relative group rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2">
                    <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Relacja z zarządem</p>
                    <p className={`mt-1 text-sm font-black italic uppercase tracking-tighter ${directorBoardInfluence >= 4 ? 'text-emerald-400' : directorBoardInfluence <= -4 ? 'text-red-400' : 'text-slate-300'}`}>
                      {getDirectorBoardInfluenceLabel(directorBoardInfluence)}
                    </p>
                    <div className="absolute bottom-full left-0 mb-2 w-64 rounded-[14px] border border-white/10 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                      <p className="text-[9px] font-black italic uppercase tracking-tighter text-slate-500 mb-2">Wpływ na grę</p>
                      <p className="text-sm font-black italic uppercase tracking-tighter leading-relaxed text-slate-300">
                        Dyrektor ocenia wyniki co miesiąc i może blokować ryzykowne ruchy transferowe, gdy uzna je za sprzeczne z interesem klubu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[22px] border border-white/5 bg-black/25 p-5 text-sm text-slate-400">
                Klub nie ma jeszcze przypisanego dyrektora sportowego.
              </div>
            )}
          </aside>

          <div className="flex min-w-0 flex-col gap-6">

          {/* Nagłówek */}
          <div className="text-center">
            <p className="text-[10px] font-black italic text-blue-500 uppercase tracking-tighter mb-1">BIURO</p>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              ZARZĄD KLUBU
            </h1>
          </div>

          {/* Logo i nazwa */}
          <div className="flex flex-col items-center gap-3">
            {logo ? (
              <div className="w-24 h-24 flex items-center justify-center">
                <img
                  src={logo}
                  alt={club.name}
                  className="w-full h-full object-contain -rotate-[6deg] drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-[20px] overflow-hidden border-2 border-white/10 shadow-xl">
                <div style={{ backgroundColor: club.colorsHex[0] }} className="h-1/2 w-full" />
                <div style={{ backgroundColor: club.colorsHex[1] || club.colorsHex[0] }} className="h-1/2 w-full" />
              </div>
            )}
            <span className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              {club.name}
            </span>
          </div>

          {/* Pasek zaufania */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black italic text-slate-500 uppercase tracking-tighter">ZAUFANIE ZARZĄDU</span>
              <span className={`text-base font-black italic uppercase tracking-tighter ${confidenceTextColor}`}>{confidence}%</span>
            </div>
            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${confidence}%`, backgroundColor: confidenceColor }}
              />
            </div>
          </div>

          {/* Atrybuty zarządu — siatka 2×3 */}
          {board && (
            <div className="grid grid-cols-3 gap-2">
              {ATTR_ROWS.flat().map(key => {
                const level = board[key] as BoardAttributeLevel;
                return (
                  <div key={key} className="bg-black/30 rounded-[14px] border border-white/5 p-3 flex flex-col gap-1.5">
                    <span className="text-base font-black italic uppercase tracking-tighter text-white">{ATTR_NAME[key]}</span>
                    <div className="h-px w-full bg-gradient-to-r from-yellow-500/40 via-yellow-400/20 to-transparent" />
                    <span className="text-xs font-black italic uppercase tracking-tighter text-white">{LEVEL_LABEL[level]}</span>
                    <div className="h-[2px] w-full bg-black/50 rounded-full overflow-hidden mt-0.5">
                      <div
                        className="h-full rounded-full"
                        style={{ width: LEVEL_BAR_WIDTH[level], backgroundColor: LEVEL_BAR_COLOR[level] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Wiadomość zarządu */}
          <div className="bg-black/25 rounded-[20px] border border-white/5 p-5 flex flex-col gap-3">

            <p className="text-base text-slate-300 font-normal italic uppercase tracking-tighter leading-relaxed">
              Witamy serdecznie w naszym biurze.
            </p>
            <p className="text-base text-slate-300 font-normal italic uppercase tracking-tighter leading-relaxed">
              Jako zarząd klubu, chcielibyśmy podzielić się z Panem naszymi oczekiwaniami i refleksjami na temat obecnej sytuacji drużyny. Naszym celem jest wspólna praca nad rozwojem klubu i osiągnięciem jak najlepszych wyników sportowych, a także budowanie silnej i stabilnej organizacji. Poniżej znajdzie Pan nasze spostrzeżenia oraz wskazówki, które mamy nadzieję, pomogą nam wszystkim w realizacji tych celów.
            </p>

            {board && (
              <p className={`text-base font-normal italic uppercase tracking-tighter leading-relaxed ${infoColor}`}>
                {getExpectationsText(board.oczekiwania, club.reputation, board.ambicja, club.leagueId, seed)} {HOJNOSC_TEXT[board.hojnosc]}
              </p>
            )}

            <div className="border-t border-white/5 pt-3">
              <p className="text-base font-normal italic uppercase tracking-tighter leading-relaxed text-yellow-400">
                „{situationComment}"
              </p>
            </div>
          </div>

          </div>

          <aside className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">

            {/* ── STADION ── */}
            <button
              type="button"
              onClick={() => setIsStadiumModalOpen(true)}
              className="w-full rounded-[22px] border border-white/5 bg-black/30 overflow-hidden mb-5 hover:border-white/10 transition-all group"
            >
              <div className="w-full" style={{ aspectRatio: '16/9' }}>
                <Stadium3DViewer capacity={club.stadiumCapacity} primaryColor={club.colorsHex?.[0]} seatColors={club.stadiumSeatColors} />
              </div>
              <div className="px-4 py-3 flex items-center justify-between gap-2">
                <div className="text-left min-w-0">
                  <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500 truncate">{club.stadiumName}</p>
                  <p className="mt-0.5 text-sm font-black italic uppercase tracking-tighter text-white">
                    {club.stadiumCapacity.toLocaleString('pl-PL')} miejsc
                  </p>
                </div>
                <span className="shrink-0 text-[9px] font-black italic uppercase tracking-tighter text-amber-300/60 group-hover:text-amber-300 transition-colors">
                  SZCZEGÓŁY →
                </span>
              </div>
            </button>

            <div className="mb-5">
              <p className="text-[9px] font-black italic uppercase tracking-tighter text-sky-300/80">Panel</p>
              <h2 className="mt-1 text-2xl font-black italic uppercase tracking-tighter text-white">Zadania</h2>
            </div>

            {sportingDirector ? (
                <div className="rounded-[20px] border border-white/5 bg-black/25 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Panel</p>
                      <h3 className="mt-1 text-lg font-black italic uppercase tracking-tighter text-white">Zadania</h3>
                    </div>
                    {directorObjective && objectivePanelData?.resolvedMark && (
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full border text-base font-black italic uppercase tracking-tighter ${
                        objectivePanelData.resolvedMark === 'V'
                          ? 'border-emerald-400/25 bg-emerald-500/15 text-emerald-300'
                          : 'border-red-400/25 bg-red-500/15 text-red-300'
                      }`}>
                        {objectivePanelData.resolvedMark}
                      </div>
                    )}
                  </div>

                  {directorObjective && objectivePanelData ? (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] font-black italic uppercase tracking-tighter text-white">
                            {directorObjective.title.replace('Cel dyrektora: ', '')}
                          </p>
                          <span className={`shrink-0 rounded-full border px-2 py-1 text-[8px] font-black italic uppercase tracking-tighter ${getObjectiveStatusClasses(directorObjective.status)}`}>
                            {getObjectiveStatusLabel(directorObjective.status)}
                          </span>
                        </div>

                        <p className="mt-2 text-[10px] font-black italic uppercase tracking-tighter leading-relaxed text-slate-400">
                          {directorObjective.description}
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="rounded-xl border border-white/5 bg-black/25 px-3 py-2">
                            <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">
                              {objectivePanelData.summaryLabel}
                            </p>
                            <p className="mt-1 text-[10px] font-black italic uppercase tracking-tighter text-white">
                              {objectivePanelData.summaryValue}
                            </p>
                          </div>
                          <div className="rounded-xl border border-white/5 bg-black/25 px-3 py-2">
                            <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Termin</p>
                            <p className="mt-1 text-[10px] font-black italic uppercase tracking-tighter text-white">
                              {new Date(directorObjective.dueAt).toLocaleDateString('pl-PL')}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between gap-4">
                            <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Postęp zadania</p>
                            <p className="text-[9px] font-black italic uppercase tracking-tighter text-right text-slate-300">
                              {objectivePanelData.progressLabel}
                            </p>
                          </div>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-black/50">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getObjectiveProgressClasses(directorObjective.status)}`}
                              style={{ width: `${objectivePanelData.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {directorObjective.managerResponse && (
                          <p className="mt-3 text-[9px] font-black italic uppercase tracking-tighter text-sky-300">
                            Odpowiedź sztabu: {directorObjective.managerResponse === 'ACCEPTED' ? 'Akceptacja' : directorObjective.managerResponse === 'NEGOTIATED' ? 'Negocjacja' : 'Sprzeciw'}
                          </p>
                        )}

                        {directorObjective.resultNote && (
                          <p className="mt-2 text-[10px] font-black italic uppercase tracking-tighter leading-relaxed text-slate-300">
                            {directorObjective.resultNote}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-[11px] font-black italic uppercase tracking-tighter leading-relaxed text-slate-400">
                      Brak aktywnego zadania dyrektora. Gdy pojawi się nowy cel, jego postęp będzie widoczny właśnie tutaj.
                    </p>
                  )}
                </div>
            ) : (
              <div className="rounded-[22px] border border-white/5 bg-black/25 p-5 text-sm text-slate-400">
                Klub nie ma jeszcze przypisanego dyrektora sportowego.
              </div>
            )}

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsBoardRequestOpen(true)}
                className="w-full rounded-[20px] border border-amber-400/20 bg-amber-500/[0.08] p-4 text-left transition-all hover:border-amber-400/35 hover:bg-amber-500/[0.12] group"
              >
                <p className="text-[8px] font-black italic uppercase tracking-tighter text-amber-300/70">Komunikacja</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-black italic uppercase tracking-tighter text-white">PROŚBA DO ZARZĄDU</p>
                  <span className="text-amber-400/50 group-hover:text-amber-400 transition-colors">→</span>
                </div>
                <p className="mt-1 text-[9px] font-black italic uppercase tracking-tighter text-slate-500">
                  Złóż oficjalną prośbę do zarządu klubu
                </p>
              </button>
            </div>
          </aside>
        </div>
      </div>

      {sportingDirector && isDirectorModalOpen && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4" onClick={() => setIsDirectorModalOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-[32px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.65)]"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsDirectorModalOpen(false)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
            >
              ×
            </button>

            <div className="mb-6 pr-12">
              <p className="text-[9px] font-black italic uppercase tracking-tighter text-sky-300/80">Pion sportowy</p>
              <h3 className="mt-2 text-3xl font-black italic uppercase tracking-tighter text-white">
                {sportingDirector.firstName} {sportingDirector.lastName}
              </h3>
              <p className="mt-2 text-[11px] font-black italic uppercase tracking-tighter text-slate-400">
                Dyrektor sportowy
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="rounded-[24px] border border-sky-500/20 bg-sky-500/10 p-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-300/20 bg-black/25 text-2xl font-black text-sky-100">
                  DS
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div>
                    <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Kraj</p>
                    <p className="mt-1 font-black italic uppercase tracking-tighter text-white">{sportingDirector.nationalityCountry}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Wiek</p>
                    <p className="mt-1 font-black italic uppercase tracking-tighter text-white">{sportingDirector.age} lat</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Styl decyzyjny</p>
                    <p className="mt-1 font-black italic uppercase tracking-tighter text-white">{getDirectorPersonalityLabel(sportingDirector.personality)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { label: 'Kontrola', value: sportingDirector.control },
                    { label: 'Elastyczność', value: sportingDirector.flexibility },
                    { label: 'Ambicja', value: sportingDirector.ambition },
                    { label: 'Wiedza', value: sportingDirector.footballKnowledge },
                    { label: 'Negocjacje', value: sportingDirector.negotiation },
                    { label: 'Finanse', value: sportingDirector.financialDiscipline },
                    { label: 'Rozwój', value: sportingDirector.developmentVision },
                    { label: 'Relacja z trenerem', value: sportingDirector.relationshipWithManager, percent: true },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-[16px] border border-white/5 bg-black/25 p-3">
                      <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">{stat.label}</p>
                      <p className={`mt-1 text-lg font-black italic uppercase tracking-tighter ${stat.label === 'Relacja' ? getDirectorRelationshipColor(stat.value) : 'text-white'}`}>
                        {stat.value}{stat.percent ? '%' : ''}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[20px] border border-sky-500/10 bg-sky-500/[0.06] p-4">
                  <p className="text-[9px] font-black italic uppercase tracking-tighter text-sky-300/80">Jak to czytać</p>
                  <p className="mt-2 text-xs font-black italic uppercase tracking-tighter leading-relaxed text-slate-300">
                    Relacja z trenerem pokazuje osobistą współpracę z dyrektorem sportowym. Osobno, niżej, widzisz jego wpływ na zarząd, czyli to jak mocno wspiera albo podkopuje Twoją pozycję politycznie.
                  </p>
                </div>

                <div className="rounded-[20px] border border-white/5 bg-black/25 p-4">
                  <p className="text-[9px] font-black italic uppercase tracking-tighter text-slate-500">Polityka sportowa</p>
                  {directorPolicy ? (
                    <div className="mt-3 space-y-3">
                      <p className="text-xs font-black italic uppercase tracking-tighter leading-relaxed text-slate-300">{directorPolicy.summary}</p>
                      {[
                        { title: 'Chronieni', items: directorPolicy.protectedPlayers },
                        { title: 'Do sprzedaży', items: directorPolicy.sellCandidates },
                        { title: 'Do rozwoju', items: directorPolicy.developmentPlayers },
                      ].map(group => (
                        <div key={group.title}>
                          <p className="text-[8px] font-black italic uppercase tracking-tighter text-sky-300/80">{group.title}</p>
                          <div className="mt-1 space-y-1">
                            {group.items.length > 0 ? group.items.slice(0, 2).map(item => (
                              <div key={item.playerId} className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
                                <p className="text-[11px] font-black italic uppercase tracking-tighter text-white">{item.playerName}</p>
                                <p className="mt-0.5 text-[10px] font-black italic uppercase tracking-tighter leading-snug text-slate-500">{item.note}</p>
                              </div>
                            )) : (
                              <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">Brak wskazań.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm font-black italic uppercase tracking-tighter leading-relaxed text-slate-400">
                      Polityka sportowa pojawi się przed najbliższym oknem transferowym.
                    </p>
                  )}
                </div>

                <div className="rounded-[20px] border border-white/5 bg-black/25 p-4">
                  <p className="text-[9px] font-black italic uppercase tracking-tighter text-slate-500">Cel dyrektora</p>
                  {directorObjective ? (
                    <div className="mt-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-black italic uppercase tracking-tighter text-white">{directorObjective.title.replace('Cel dyrektora: ', '')}</p>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-black italic uppercase tracking-tighter ${
                          directorObjective.status === 'COMPLETED'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : directorObjective.status === 'FAILED'
                              ? 'bg-red-500/15 text-red-300'
                              : directorObjective.status === 'AWAITING_REVIEW'
                                ? 'bg-sky-500/15 text-sky-300'
                                : 'bg-amber-500/15 text-amber-300'
                        }`}>
                          {directorObjective.status === 'COMPLETED'
                            ? 'Zrobione'
                            : directorObjective.status === 'FAILED'
                              ? 'Nieudane'
                              : directorObjective.status === 'AWAITING_REVIEW'
                                ? 'W oczekiwaniu'
                                : 'Aktywne'}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-black italic uppercase tracking-tighter leading-relaxed text-slate-400">{directorObjective.description}</p>
                      <p className="mt-2 text-[10px] font-black italic uppercase tracking-tighter text-slate-500">
                        Termin: {new Date(directorObjective.dueAt).toLocaleDateString('pl-PL')}
                      </p>
                      {directorObjective.resultNote && (
                        <p className="mt-2 text-[11px] font-black italic uppercase tracking-tighter leading-snug text-slate-300">{directorObjective.resultNote}</p>
                      )}
                      {directorObjective.status === 'ACTIVE' && (
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <button
                            disabled={directorObjective.managerResponse === 'ACCEPTED'}
                            onClick={() => respondToSportingDirectorObjective('ACCEPT')}
                            className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-[9px] font-black italic uppercase tracking-tighter text-emerald-200 transition-all hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            Akceptuj cel
                          </button>
                          <button
                            disabled={!!directorObjective.renegotiated}
                            onClick={() => respondToSportingDirectorObjective('NEGOTIATE')}
                            className="rounded-xl border border-sky-400/20 bg-sky-500/10 px-3 py-2 text-[9px] font-black italic uppercase tracking-tighter text-sky-200 transition-all hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            Negocjuj warunki
                          </button>
                          <button
                            disabled={directorObjective.managerResponse === 'CHALLENGED'}
                            onClick={() => respondToSportingDirectorObjective('CHALLENGE')}
                            className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-[9px] font-black italic uppercase tracking-tighter text-red-200 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            Zakwestionuj cel
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm font-black italic uppercase tracking-tighter leading-relaxed text-slate-400">
                      Dyrektor nie wyznaczył jeszcze konkretnego celu dla sztabu.
                    </p>
                  )}
                </div>

                <div className="rounded-[20px] border border-white/5 bg-black/25 p-4">
                  <div className="relative group rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2">
                    <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Relacja z Zarządem</p>
                    <p className={`mt-1 text-sm font-black italic uppercase tracking-tighter ${directorBoardInfluence >= 4 ? 'text-emerald-400' : directorBoardInfluence <= -4 ? 'text-red-400' : 'text-slate-300'}`}>
                      {getDirectorBoardInfluenceLabel(directorBoardInfluence)}
                    </p>
                    <div className="absolute bottom-full left-0 mb-2 w-64 rounded-[14px] border border-white/10 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                      <p className="text-[9px] font-black italic uppercase tracking-tighter text-slate-500 mb-2">Wpływ na grę</p>
                      <p className="text-sm font-black italic uppercase tracking-tighter leading-relaxed text-slate-300">
                        Dyrektor ocenia wyniki co miesiąc i może blokować ryzykowne ruchy transferowe, gdy uzna je za sprzeczne z interesem klubu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isBoardRequestOpen && (
        <BoardRequestModal
          club={club}
          onClose={() => setIsBoardRequestOpen(false)}
          onSelectStadium={() => {
            setIsBoardRequestOpen(false);
            setIsStadiumModalOpen(true);
          }}
        />
      )}

      {isStadiumModalOpen && (
        <StadiumModal
          club={club}
          onClose={() => setIsStadiumModalOpen(false)}
          onRequestExpansion={() => {
            setIsStadiumModalOpen(false);
            setIsExpansionRequestOpen(true);
          }}
        />
      )}

      {isExpansionRequestOpen && (
        <StadiumExpansionRequestModal
          club={club}
          attendanceHistory={attendanceHistory}
          onClose={() => setIsExpansionRequestOpen(false)}
          onSubmit={(stand, requestedIncrease) => {
            handleExpansionSubmit(stand, requestedIncrease);
            setIsExpansionRequestOpen(false);
          }}
        />
      )}
    </div>
  );
};
