
import React, { useMemo } from 'react';
import { Club, BoardAttributeLevel, ClubBoard, CompetitionType, MatchStatus, Fixture } from '../../types';
import { getClubLogo } from '../../resources/ClubLogoAssets';

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

export const BoardModal: React.FC<BoardModalProps> = ({ club, confidence, rank, fixtures, onClose }) => {
  const logo = getClubLogo(club.id);
  const board = club.board;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <div
        className="relative w-full max-w-5xl rounded-[40px] overflow-hidden border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
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
        <div className="relative z-10 p-10 flex flex-col gap-6">

          {/* Nagłówek */}
          <div className="text-center">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.45em] mb-1">BIURO</p>
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
            <span className="text-3xl font-black italic uppercase tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              {club.name}
            </span>
          </div>

          {/* Pasek zaufania */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em]">ZAUFANIE ZARZĄDU</span>
              <span className={`text-base font-black italic ${confidenceTextColor}`}>{confidence}%</span>
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
                    <span className="text-base font-black italic tracking-tight text-white">{ATTR_NAME[key]}</span>
                    <div className="h-px w-full bg-gradient-to-r from-yellow-500/40 via-yellow-400/20 to-transparent" />
                    <span className="text-xs font-normal italic tracking-tight text-white">{LEVEL_LABEL[level]}</span>
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

            <p className="text-base text-slate-300 font-normal italic tracking-tight leading-relaxed">
              Witamy serdecznie w naszym biurze.
            </p>
            <p className="text-base text-slate-300 font-normal italic tracking-tight leading-relaxed">
              Jako zarząd klubu, chcielibyśmy podzielić się z Panem naszymi oczekiwaniami i refleksjami na temat obecnej sytuacji drużyny. Naszym celem jest wspólna praca nad rozwojem klubu i osiągnięciem jak najlepszych wyników sportowych, a także budowanie silnej i stabilnej organizacji. Poniżej znajdzie Pan nasze spostrzeżenia oraz wskazówki, które mamy nadzieję, pomogą nam wszystkim w realizacji tych celów.
            </p>

            {board && (
              <p className={`text-base font-normal italic tracking-tight leading-relaxed ${infoColor}`}>
                {getExpectationsText(board.oczekiwania, club.reputation, board.ambicja, club.leagueId, seed)} {HOJNOSC_TEXT[board.hojnosc]}
              </p>
            )}

            <div className="border-t border-white/5 pt-3">
              <p className="text-base font-normal italic tracking-tight leading-relaxed text-yellow-400">
                „{situationComment}"
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
