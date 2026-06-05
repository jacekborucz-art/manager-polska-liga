import { DebriefContext, DebriefCommentType, DebriefComment, POST_MATCH_DEBRIEF } from '../data/postmatch_debrief_pl';
import type { LeagueMotivationContext } from './LeagueMotivationContextService';

export type { DebriefContext, DebriefCommentType };

export type DebriefMatchStage = 'LEAGUE' | 'FRIENDLY' | 'CUP' | 'CUP_SEMIFINAL' | 'CUP_FINAL';

export interface DebriefEffect {
  moraleDelta: number;
  reactionText: string;
}

// ─── SEEDED RNG ───────────────────────────────────────────────────────────────
const seededRng = (seed: number, offset: number): number => {
  const s = seed + offset;
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
};

// ─── TEKSTY REAKCJI SZATNI ───────────────────────────────────────────────────
const REACTION_NORMAL: Record<DebriefCommentType, string[]> = {
  PRAISE: [
    'Kilku zawodników kiwa głowami. W szatni panuje pozytywna atmosfera.',
    'Widać uśmiechy. Słowa trafiły do drużyny.',
    'Zawodnicy wymieniają spojrzenia. Atmosfera jest dobra.',
    'Jeden z liderów klaszcze. Drużyna reaguje pozytywnie.',
  ],
  AGGRESSIVE: [
    'W szatni narasta napięcie. Kilku zawodników zaciska pięści.',
    'Słychać okrzyki. Drużyna wygląda nakręcona.',
    'Zawodnicy wstają z ławek. Energia jest wyczuwalna.',
    'Intensywność w szatni sięga zenitu. Drużyna jest gotowa.',
  ],
  CALM: [
    'W szatni zapada spokój. Zawodnicy skupiają się.',
    'Kiwają głowami. Spokój udziela się całej drużynie.',
    'Atmosfera jest opanowana. Każdy wie, co robić.',
    'Cisza i skupienie. Drużyna słucha uważnie.',
  ],
  CRITICIZE: [
    'Szatnia milczy. Niektórzy wbijają wzrok w podłogę.',
    'Jeden z liderów wstaje i przemawia do reszty.',
    'Kilku zawodników wymienia nerwowe spojrzenia.',
    'Atmosfera jest gęsta. Każdy wie, że musi dać więcej.',
  ],
  SILENCE: [
    'Zawodnicy wychodzą w milczeniu. Każdy z własną myślą.',
    'Brak słów. Cisza mówi wszystko.',
    'Nikt nic nie mówi. Każdy siedzi z własnymi myślami.',
    'Szatnia w milczeniu. Atmosfera jest ciężka.',
  ],
};

const REACTION_UNEXPECTED: string[] = [
  'Zawodnicy wydają się obojętni. Słowa nie trafiają w czuły punkt.',
  'Cisza. Kilku zawodników patrzy gdzie indziej.',
  'Drużyna nie reaguje tak, jak można by oczekiwać.',
  'Kilka skwaszonych min. Atmosfera nie idzie w dobrą stronę.',
  'Zaskakująca reakcja. Szatnia wydaje się zdezorientowana.',
];

type DebriefOutcome = 'WIN' | 'DRAW' | 'LOSS';
type CupDebriefStage = Exclude<DebriefMatchStage, 'LEAGUE' | 'FRIENDLY'>;

const FRIENDLY_HALF_SWING_DEBRIEF: Partial<Record<DebriefContext, DebriefComment[]>> = {
  WIN_FROM_BEHIND: [
    { id: 'fr_wfb_1', text: 'Pierwsza połowa była trudna, ale reakcja po przerwie była bardzo dobra. Właśnie po to gramy sparingi.', hiddenType: 'PRAISE' },
    { id: 'fr_wfb_2', text: 'Podnieśliście się po słabym początku. Wynik cieszy, ale najważniejsza jest lekcja z pierwszych minut.', hiddenType: 'CALM' },
    { id: 'fr_wfb_3', text: 'Nie chcę czekać do przerwy, żeby zobaczyć taką energię. W następnym sparingu startujemy od razu.', hiddenType: 'AGGRESSIVE' },
    { id: 'fr_wfb_4', text: 'Comeback jest dobry, ale początek meczu był sygnałem ostrzegawczym. Musimy szybciej wejść w rytm.', hiddenType: 'CRITICIZE' },
    { id: 'fr_wfb_5', text: 'Odrobiliśmy stratę. To ważna informacja.', hiddenType: 'SILENCE' },
  ],
  WIN_BAD_SECOND_HALF: [
    { id: 'fr_wbsh_1', text: 'Pierwsza połowa była solidna i dała nam przewagę. Ten fragment warto zapamiętać.', hiddenType: 'PRAISE' },
    { id: 'fr_wbsh_2', text: 'Wygraliśmy sparing, ale druga połowa pokazała rzeczy do poprawy. O to chodzi w takim meczu.', hiddenType: 'CALM' },
    { id: 'fr_wbsh_3', text: 'Po przerwie nie możemy gasnąć. Nawet w sparingu intensywność musi trwać dłużej.', hiddenType: 'AGGRESSIVE' },
    { id: 'fr_wbsh_4', text: 'Druga połowa była zbyt chaotyczna. Wynik tego nie przykrywa.', hiddenType: 'CRITICIZE' },
    { id: 'fr_wbsh_5', text: 'Dobry wynik, nierówny mecz.', hiddenType: 'SILENCE' },
  ],
  DRAW_FROM_BEHIND: [
    { id: 'fr_dfb_1', text: 'Po przerwie zobaczyłem reakcję, której szukaliśmy. Ten sparing dał nam dobry materiał.', hiddenType: 'PRAISE' },
    { id: 'fr_dfb_2', text: 'Remis po słabszej pierwszej połowie jest sygnałem, że zespół potrafi się dostosować.', hiddenType: 'CALM' },
    { id: 'fr_dfb_3', text: 'Druga połowa była lepsza, ale chcę tej odwagi od początku meczu.', hiddenType: 'AGGRESSIVE' },
    { id: 'fr_dfb_4', text: 'Nie możemy potrzebować straty bramki, żeby zacząć grać. To jest wniosek z tego sparingu.', hiddenType: 'CRITICIZE' },
    { id: 'fr_dfb_5', text: 'Odrobiliśmy stratę. Analiza będzie ważniejsza niż wynik.', hiddenType: 'SILENCE' },
  ],
  DRAW_AFTER_LEADING: [
    { id: 'fr_dal_1', text: 'Pierwsza połowa miała dobre fragmenty. Szkoda, że po przerwie nie utrzymaliśmy tego poziomu.', hiddenType: 'PRAISE' },
    { id: 'fr_dal_2', text: 'Ten sparing pokazał, że umiemy zbudować przewagę, ale musimy lepiej zarządzać meczem.', hiddenType: 'CALM' },
    { id: 'fr_dal_3', text: 'Po prowadzeniu nie możemy odpuszczać rytmu. Chcę więcej koncentracji po przerwie.', hiddenType: 'AGGRESSIVE' },
    { id: 'fr_dal_4', text: 'Oddaliśmy kontrolę zbyt łatwo. W sparingu też trzeba dbać o nawyki.', hiddenType: 'CRITICIZE' },
    { id: 'fr_dal_5', text: 'Dobra pierwsza połowa, słabsza druga.', hiddenType: 'SILENCE' },
  ],
  LOSS_AFTER_LEADING: [
    { id: 'fr_lal_1', text: 'Przed przerwą były rzeczy, które można docenić. Po przerwie dostaliśmy lekcję.', hiddenType: 'PRAISE' },
    { id: 'fr_lal_2', text: 'Prowadzenie w sparingu nie jest celem samym w sobie. Ważne, że wiemy już, co się rozsypało.', hiddenType: 'CALM' },
    { id: 'fr_lal_3', text: 'Nie akceptuję takiego spadku po przerwie. Nawet w sparingu musimy trzymać standard.', hiddenType: 'AGGRESSIVE' },
    { id: 'fr_lal_4', text: 'Mieliśmy kontrolę i ją oddaliśmy. To jest główny temat do analizy.', hiddenType: 'CRITICIZE' },
    { id: 'fr_lal_5', text: 'Prowadziliśmy. Przegraliśmy. Materiał do pracy jest oczywisty.', hiddenType: 'SILENCE' },
  ],
  LOSS_BAD_SECOND_HALF: [
    { id: 'fr_lbsh_1', text: 'Do przerwy było kilka dobrych sygnałów. Druga połowa pokazała, gdzie brakuje nam stabilności.', hiddenType: 'PRAISE' },
    { id: 'fr_lbsh_2', text: 'To sparing, więc wynik nie jest najważniejszy. Najważniejsze, że mamy konkretny problem do naprawy.', hiddenType: 'CALM' },
    { id: 'fr_lbsh_3', text: 'Po przerwie nie możemy wyglądać gorzej fizycznie i mentalnie. To musi się poprawić.', hiddenType: 'AGGRESSIVE' },
    { id: 'fr_lbsh_4', text: 'Druga połowa była za słaba. Sparing nie zwalnia z organizacji i odpowiedzialności.', hiddenType: 'CRITICIZE' },
    { id: 'fr_lbsh_5', text: 'Pierwsza połowa do przyjęcia. Druga do analizy.', hiddenType: 'SILENCE' },
  ],
};

const FRIENDLY_POST_MATCH_DEBRIEF: Record<DebriefOutcome, DebriefComment[]> = {
  WIN: [
    { id: 'fr_w_1', text: 'Dobry sparing. Wynik cieszy, ale najbardziej interesuje mnie jakość i realizacja założeń.', hiddenType: 'PRAISE' },
    { id: 'fr_w_2', text: 'Było zaangażowanie i kilka dobrych automatyzmów. To jest krok w dobrą stronę.', hiddenType: 'PRAISE' },
    { id: 'fr_w_3', text: 'Wygraliśmy, ale traktujemy to spokojnie. Najważniejsze są wnioski na trening.', hiddenType: 'CALM' },
    { id: 'fr_w_4', text: 'Dobre minuty, dobry rytm. Teraz regeneracja i analiza fragmentów, które możemy poprawić.', hiddenType: 'CALM' },
    { id: 'fr_w_5', text: 'Chcę takiej intensywności częściej! Sparing ma budować nawyki, a dzisiaj było ich sporo.', hiddenType: 'AGGRESSIVE' },
    { id: 'fr_w_6', text: 'Wynik jest dobry, ale nie odpuszczamy. Następny test ma być jeszcze lepszy.', hiddenType: 'AGGRESSIVE' },
    { id: 'fr_w_7', text: 'Wygraliśmy, ale kilka strat i ustawień bez piłki wymaga poprawy.', hiddenType: 'CRITICIZE' },
    { id: 'fr_w_8', text: 'Nie patrzymy tylko na wynik. W sparingu błędy są po to, żeby je nazwać i usunąć.', hiddenType: 'CRITICIZE' },
    { id: 'fr_w_9', text: 'Dobry test.', hiddenType: 'SILENCE' },
    { id: 'fr_w_10', text: 'Wnioski są ważniejsze niż wynik.', hiddenType: 'SILENCE' },
  ],
  DRAW: [
    { id: 'fr_d_1', text: 'To był pożyteczny sparing. Były dobre fragmenty i kilka rzeczy, które musimy uporządkować.', hiddenType: 'PRAISE' },
    { id: 'fr_d_2', text: 'Doceniam pracę i zaangażowanie. Wynik jest neutralny, ale materiał do analizy bardzo konkretny.', hiddenType: 'PRAISE' },
    { id: 'fr_d_3', text: 'Remis w sparingu nie jest problemem. Ważne, żebyśmy wyciągnęli właściwe wnioski.', hiddenType: 'CALM' },
    { id: 'fr_d_4', text: 'Spokojnie. Ten mecz miał sprawdzić rozwiązania i dał nam dużo informacji.', hiddenType: 'CALM' },
    { id: 'fr_d_5', text: 'Chcę więcej konkretu pod bramką. Sparing czy nie, sytuacje trzeba kończyć lepiej.', hiddenType: 'AGGRESSIVE' },
    { id: 'fr_d_6', text: 'Nie zadowalamy się przeciętnością. Ten test miał pokazać głód gry i momentami go brakowało.', hiddenType: 'AGGRESSIVE' },
    { id: 'fr_d_7', text: 'Za dużo niedokładności. Wynik nie boli, ale jakość w kilku fazach już tak.', hiddenType: 'CRITICIZE' },
    { id: 'fr_d_8', text: 'Mieliśmy momenty kontroli i za łatwo je oddawaliśmy. To trzeba poprawić.', hiddenType: 'CRITICIZE' },
    { id: 'fr_d_9', text: 'Test zakończony. Analiza pokaże resztę.', hiddenType: 'SILENCE' },
    { id: 'fr_d_10', text: 'Bez wielkich słów. Do pracy.', hiddenType: 'SILENCE' },
  ],
  LOSS: [
    { id: 'fr_l_1', text: 'Nie wszystko wyszło, ale widziałem fragmenty, na których możemy budować.', hiddenType: 'PRAISE' },
    { id: 'fr_l_2', text: 'Dziękuję za walkę. Sparing ma pokazywać problemy i dzisiaj kilka z nich zobaczyliśmy.', hiddenType: 'PRAISE' },
    { id: 'fr_l_3', text: 'To był mecz kontrolny. Wynik przyjmujemy, analizujemy błędy i pracujemy dalej.', hiddenType: 'CALM' },
    { id: 'fr_l_4', text: 'Spokojnie. Lepiej zobaczyć te problemy teraz niż w meczu o stawkę.', hiddenType: 'CALM' },
    { id: 'fr_l_5', text: 'Sparing nie oznacza braku ambicji. Chcę więcej agresji, dokładności i reakcji po stracie.', hiddenType: 'AGGRESSIVE' },
    { id: 'fr_l_6', text: 'Ten test miał nas czegoś nauczyć. Jeżeli nie wyciągniemy wniosków, zmarnujemy go.', hiddenType: 'AGGRESSIVE' },
    { id: 'fr_l_7', text: 'Za dużo prostych błędów. W sparingu można testować, ale nie można tracić koncentracji.', hiddenType: 'CRITICIZE' },
    { id: 'fr_l_8', text: 'Nie podobała mi się organizacja po stracie piłki. To jest temat numer jeden.', hiddenType: 'CRITICIZE' },
    { id: 'fr_l_9', text: 'Materiał do pracy jest jasny.', hiddenType: 'SILENCE' },
    { id: 'fr_l_10', text: 'Wracamy do treningu.', hiddenType: 'SILENCE' },
  ],
};

const CUP_BIG_WIN_DEBRIEF: DebriefComment[] = [
  { id: 'cup_bw_1', text: 'Tak trzeba zamykać pucharowe mecze z niżej notowanym rywalem. Pełna kontrola i awans.', hiddenType: 'PRAISE' },
  { id: 'cup_bw_2', text: 'Zrobiliście dokładnie to, czego oczekiwałem: szybko narzuciliście poziom i nie daliście rywalowi nadziei.', hiddenType: 'PRAISE' },
  { id: 'cup_bw_3', text: 'Pewny awans. Doceniamy wynik, regenerujemy się i spokojnie przygotowujemy kolejny etap.', hiddenType: 'CALM' },
  { id: 'cup_bw_4', text: 'Mecz był pod kontrolą od początku do końca. Teraz utrzymujemy ten profesjonalizm.', hiddenType: 'CALM' },
  { id: 'cup_bw_5', text: 'Tak wygląda różnica klas! Chcę takiej intensywności niezależnie od rywala!', hiddenType: 'AGGRESSIVE' },
  { id: 'cup_bw_6', text: 'Nie odpuściliście ani minuty. W pucharze właśnie tak trzeba traktować słabszych przeciwników!', hiddenType: 'AGGRESSIVE' },
  { id: 'cup_bw_7', text: 'Wynik jest bardzo dobry, ale nawet przy takim prowadzeniu musimy pilnować koncentracji w detalach.', hiddenType: 'CRITICIZE' },
  { id: 'cup_bw_8', text: 'Awans był pewny, lecz kilka fragmentów da się zagrać czyściej. Standard ma być wysoki przez cały mecz.', hiddenType: 'CRITICIZE' },
  { id: 'cup_bw_9', text: 'Pewna robota. Zadanie wykonane.', hiddenType: 'SILENCE' },
  { id: 'cup_bw_10', text: 'Wygraliśmy wysoko i idziemy dalej.', hiddenType: 'SILENCE' },
];

const CUP_WIN_STRONG_DEBRIEF: DebriefComment[] = [
  { id: 'cup_ws_1', text: 'Pokonaliśmy faworyta w meczu, który mógł zbudować ten zespół. Jestem z was dumny.', hiddenType: 'PRAISE' },
  { id: 'cup_ws_2', text: 'Tak wygląda pucharowy charakter. Silniejszy rywal, duża presja i pełna odpowiedź drużyny.', hiddenType: 'PRAISE' },
  { id: 'cup_ws_3', text: 'To jest bardzo ważny awans. Doceniamy wynik, ale zachowujemy spokój, bo puchar idzie dalej.', hiddenType: 'CALM' },
  { id: 'cup_ws_4', text: 'Wygraliśmy z mocniejszym rywalem, bo byliśmy zdyscyplinowani. Teraz musimy utrzymać ten poziom.', hiddenType: 'CALM' },
  { id: 'cup_ws_5', text: 'Właśnie tak wygrywa się mecze, w których inni nas skreślają! Nie zatrzymujemy się!', hiddenType: 'AGGRESSIVE' },
  { id: 'cup_ws_6', text: 'Pokazaliście, że możemy uderzyć w każdego! Taka odwaga ma zostać w tej szatni!', hiddenType: 'AGGRESSIVE' },
  { id: 'cup_ws_7', text: 'Wynik jest świetny, ale z takim rywalem każda strata mogła nas zaboleć. Musimy być jeszcze dokładniejsi.', hiddenType: 'CRITICIZE' },
  { id: 'cup_ws_8', text: 'Awans z faworytem cieszy, ale nie możemy udawać, że nie było momentów nerwowości.', hiddenType: 'CRITICIZE' },
  { id: 'cup_ws_9', text: 'Pokonaliśmy faworyta. Zapamiętajcie ten wieczór.', hiddenType: 'SILENCE' },
  { id: 'cup_ws_10', text: 'Dobra robota. Idziemy dalej.', hiddenType: 'SILENCE' },
];

const CUP_DRAW_STRONG_DEBRIEF: DebriefComment[] = [
  { id: 'cup_ds_1', text: 'Remis z takim rywalem pokazuje charakter. Nie pękliście pod presją.', hiddenType: 'PRAISE' },
  { id: 'cup_ds_2', text: 'Postawiliśmy się faworytowi i daliście z siebie bardzo dużo. To ma znaczenie.', hiddenType: 'PRAISE' },
  { id: 'cup_ds_3', text: 'Ten remis zostawia nas w grze. Głowy spokojne, bo z takim przeciwnikiem liczy się każdy detal.', hiddenType: 'CALM' },
  { id: 'cup_ds_4', text: 'Nie daliśmy się złamać mocniejszej drużynie. Teraz trzeba chłodno przygotować kolejny krok.', hiddenType: 'CALM' },
  { id: 'cup_ds_5', text: 'Udowodniliście, że możemy walczyć z faworytem! Teraz trzeba dołożyć jeszcze jeden procent!', hiddenType: 'AGGRESSIVE' },
  { id: 'cup_ds_6', text: 'To był rywal z wyższej półki, a my nie cofnęliśmy się ani na moment!', hiddenType: 'AGGRESSIVE' },
  { id: 'cup_ds_7', text: 'Remis z faworytem jest coś wart, ale mieliśmy momenty, żeby ten mecz wygrać.', hiddenType: 'CRITICIZE' },
  { id: 'cup_ds_8', text: 'Doceniam wynik, lecz w pucharze takie szanse trzeba wykorzystywać bez wahania.', hiddenType: 'CRITICIZE' },
  { id: 'cup_ds_9', text: 'Nie przegraliśmy z faworytem. Rywalizacja trwa.', hiddenType: 'SILENCE' },
  { id: 'cup_ds_10', text: 'Każdy wie, ile pracy nas to kosztowało.', hiddenType: 'SILENCE' },
];

const CUP_POST_MATCH_DEBRIEF: Record<CupDebriefStage, Record<DebriefOutcome, DebriefComment[]>> = {
  CUP: {
    WIN: [
      { id: 'cup_w_1', text: 'W pucharze liczy się przetrwanie takich meczów. Dobra robota.', hiddenType: 'PRAISE' },
      { id: 'cup_w_2', text: 'Zachowaliśmy koncentrację w spotkaniu, w którym nie ma miejsca na poprawkę.', hiddenType: 'PRAISE' },
      { id: 'cup_w_3', text: 'To był krok w dobrą stronę. Odpoczywamy i myślimy o kolejnym rywalu.', hiddenType: 'CALM' },
      { id: 'cup_w_4', text: 'Wynik jest po naszej stronie, ale puchar wymaga chłodnej głowy.', hiddenType: 'CALM' },
      { id: 'cup_w_5', text: 'Taką determinację chcę widzieć w każdym meczu pucharowym!', hiddenType: 'AGGRESSIVE' },
      { id: 'cup_w_6', text: 'Nie zwalniamy. W pucharze każdy następny rywal będzie groźniejszy!', hiddenType: 'AGGRESSIVE' },
      { id: 'cup_w_7', text: 'Wygraliśmy, ale kilka momentów mogło nas kosztować bardzo dużo.', hiddenType: 'CRITICIZE' },
      { id: 'cup_w_8', text: 'W pucharze błędy nie wybaczają. Ten wynik nie przykrywa rzeczy do poprawy.', hiddenType: 'CRITICIZE' },
      { id: 'cup_w_9', text: 'Zrobiliśmy swoje.', hiddenType: 'SILENCE' },
      { id: 'cup_w_10', text: 'Dzisiaj najważniejsze jest to, że zostajemy w grze.', hiddenType: 'SILENCE' },
    ],
    DRAW: [
      { id: 'cup_d_1', text: 'Remis w pucharze nie daje komfortu. Musimy być gotowi na dalszą walkę.', hiddenType: 'CALM' },
      { id: 'cup_d_2', text: 'Nie wygraliśmy, ale nadal mamy za co się zaczepić.', hiddenType: 'CALM' },
      { id: 'cup_d_3', text: 'To był mecz na ostrzu. Doceniam walkę do końca.', hiddenType: 'PRAISE' },
      { id: 'cup_d_4', text: 'Walczyliście, choć zabrakło decyzji w kluczowych momentach.', hiddenType: 'PRAISE' },
      { id: 'cup_d_5', text: 'Nie możemy zostawiać losów takiego meczu przypadkowi.', hiddenType: 'CRITICIZE' },
      { id: 'cup_d_6', text: 'Za dużo nerwów jak na spotkanie o takiej stawce.', hiddenType: 'CRITICIZE' },
      { id: 'cup_d_7', text: 'W pucharze trzeba grać do ostatniej sekundy z pełną koncentracją!', hiddenType: 'AGGRESSIVE' },
      { id: 'cup_d_8', text: 'Następnym razem mamy wyjść i zamknąć taki mecz!', hiddenType: 'AGGRESSIVE' },
      { id: 'cup_d_9', text: 'Każdy wie, co ten wynik oznacza.', hiddenType: 'SILENCE' },
      { id: 'cup_d_10', text: 'Bez wielkich słów. Rywalizacja trwa.', hiddenType: 'SILENCE' },
    ],
    LOSS: [
      { id: 'cup_l_1', text: 'To boli, bo w pucharze takie mecze ważą podwójnie.', hiddenType: 'CALM' },
      { id: 'cup_l_2', text: 'Musimy to przeanalizować i szybko podnieść głowy.', hiddenType: 'CALM' },
      { id: 'cup_l_3', text: 'Nie można odmówić wam walki, ale sama walka nie wystarczy.', hiddenType: 'PRAISE' },
      { id: 'cup_l_4', text: 'Byliście blisko, ale w kluczowych momentach zabrakło jakości.', hiddenType: 'PRAISE' },
      { id: 'cup_l_5', text: 'Za dużo błędów jak na mecz o taką stawkę.', hiddenType: 'CRITICIZE' },
      { id: 'cup_l_6', text: 'Ten wynik jest ostrzeżeniem. W pucharze nie ma miejsca na rozkojarzenie.', hiddenType: 'CRITICIZE' },
      { id: 'cup_l_7', text: 'Taki mecz trzeba wyrywać, a my tego nie zrobiliśmy!', hiddenType: 'AGGRESSIVE' },
      { id: 'cup_l_8', text: 'To była nasza szansa i nie wolno jej tak oddawać!', hiddenType: 'AGGRESSIVE' },
      { id: 'cup_l_9', text: 'Nie mam teraz nic do dodania.', hiddenType: 'SILENCE' },
      { id: 'cup_l_10', text: 'Każdy wie, jak ciężki jest ten wynik.', hiddenType: 'SILENCE' },
    ],
  },
  CUP_SEMIFINAL: {
    WIN: [
      { id: 'sf_w_1', text: 'To był półfinał i udźwignęliście ciężar. Jestem z was dumny.', hiddenType: 'PRAISE' },
      { id: 'sf_w_2', text: 'W takim meczu charakter jest równie ważny jak jakość. Dzisiaj go pokazaliście.', hiddenType: 'PRAISE' },
      { id: 'sf_w_3', text: 'Półfinał wymaga cierpliwości. Zrobiliśmy ważną robotę i zachowujemy spokój.', hiddenType: 'CALM' },
      { id: 'sf_w_4', text: 'Dobry wynik, ale w walce o finał nie można ani na moment odpuścić.', hiddenType: 'CALM' },
      { id: 'sf_w_5', text: 'Jesteśmy o krok bliżej wielkiego meczu. Chcę jeszcze większej intensywności!', hiddenType: 'AGGRESSIVE' },
      { id: 'sf_w_6', text: 'Tak gra drużyna, która wierzy w finał! Nie zatrzymujemy się!', hiddenType: 'AGGRESSIVE' },
      { id: 'sf_w_7', text: 'Wygraliśmy, ale w półfinale takie straty i zawahania mogą wszystko odwrócić.', hiddenType: 'CRITICIZE' },
      { id: 'sf_w_8', text: 'Wynik jest dobry, ale droga do finału wymaga większej odpowiedzialności.', hiddenType: 'CRITICIZE' },
      { id: 'sf_w_9', text: 'Dobry półfinał.', hiddenType: 'SILENCE' },
      { id: 'sf_w_10', text: 'Wykonaliśmy zadanie.', hiddenType: 'SILENCE' },
    ],
    DRAW: [
      { id: 'sf_d_1', text: 'Półfinał nie wybacza braku skuteczności. Ten remis zostawia niedosyt.', hiddenType: 'CALM' },
      { id: 'sf_d_2', text: 'Walka o finał nadal wymaga od nas pełnej koncentracji.', hiddenType: 'CALM' },
      { id: 'sf_d_3', text: 'Doceniam walkę. W takim półfinale każdy wysiłek ma znaczenie.', hiddenType: 'PRAISE' },
      { id: 'sf_d_4', text: 'Były momenty, w których wyglądaliśmy jak drużyna gotowa na finał.', hiddenType: 'PRAISE' },
      { id: 'sf_d_5', text: 'Za mało konkretów jak na półfinał. Musimy być odważniejsi.', hiddenType: 'CRITICIZE' },
      { id: 'sf_d_6', text: 'Mieliśmy szanse, żeby postawić się w lepszej sytuacji. To trzeba poprawić.', hiddenType: 'CRITICIZE' },
      { id: 'sf_d_7', text: 'Półfinał to nie miejsce na kalkulację! Musimy grać ostrzej!', hiddenType: 'AGGRESSIVE' },
      { id: 'sf_d_8', text: 'Finał sam do nas nie przyjdzie. Musimy go wyrwać!', hiddenType: 'AGGRESSIVE' },
      { id: 'sf_d_9', text: 'Rywalizacja trwa.', hiddenType: 'SILENCE' },
      { id: 'sf_d_10', text: 'Każdy wie, ile jeszcze brakuje.', hiddenType: 'SILENCE' },
    ],
    LOSS: [
      { id: 'sf_l_1', text: 'Półfinał boli mocniej niż zwykły mecz. Musimy udźwignąć ten ciężar.', hiddenType: 'CALM' },
      { id: 'sf_l_2', text: 'To trudny wynik, ale musimy zachować zimną głowę.', hiddenType: 'CALM' },
      { id: 'sf_l_3', text: 'Walczyliście, a w półfinale to ma znaczenie. Zabrakło detali.', hiddenType: 'PRAISE' },
      { id: 'sf_l_4', text: 'Nie wszystko wyszło, ale widziałem ludzi, którzy chcieli walczyć o finał.', hiddenType: 'PRAISE' },
      { id: 'sf_l_5', text: 'W półfinale takie błędy kosztują marzenia. Nie możemy ich powtarzać.', hiddenType: 'CRITICIZE' },
      { id: 'sf_l_6', text: 'Byliśmy zbyt pasywni w meczu, który wymaga odwagi.', hiddenType: 'CRITICIZE' },
      { id: 'sf_l_7', text: 'To jest półfinał! Tutaj nie można oddawać inicjatywy!', hiddenType: 'AGGRESSIVE' },
      { id: 'sf_l_8', text: 'Jeżeli chcemy finału, musimy grać z większą wściekłością!', hiddenType: 'AGGRESSIVE' },
      { id: 'sf_l_9', text: 'Ciężko cokolwiek teraz powiedzieć.', hiddenType: 'SILENCE' },
      { id: 'sf_l_10', text: 'Każdy czuje wagę tego wyniku.', hiddenType: 'SILENCE' },
    ],
  },
  CUP_FINAL: {
    WIN: [
      { id: 'final_w_1', text: 'Wygraliśmy finał. Zapisaliście się dziś w historii tego klubu.', hiddenType: 'PRAISE' },
      { id: 'final_w_2', text: 'To był mecz o trofeum i byliście gotowi. Jestem z was dumny.', hiddenType: 'PRAISE' },
      { id: 'final_w_3', text: 'Trofeum jest nasze. Cieszmy się tym, ale pamiętajmy, ile pracy nas tu doprowadziło.', hiddenType: 'CALM' },
      { id: 'final_w_4', text: 'Finał wygrany. Taki moment trzeba docenić i zachować w głowie.', hiddenType: 'CALM' },
      { id: 'final_w_5', text: 'Tak zdobywa się puchary! Taka mentalność ma zostać w tej szatni!', hiddenType: 'AGGRESSIVE' },
      { id: 'final_w_6', text: 'Pokazaliście charakter mistrzów. Chcę, żeby to był nasz standard!', hiddenType: 'AGGRESSIVE' },
      { id: 'final_w_7', text: 'Podnieśliśmy puchar, ale nawet w finale mieliśmy momenty, które musimy poprawić.', hiddenType: 'CRITICIZE' },
      { id: 'final_w_8', text: 'Wygraliśmy, lecz nie zapominam o błędach, które mogły nas zaboleć.', hiddenType: 'CRITICIZE' },
      { id: 'final_w_9', text: 'Puchar jest nasz.', hiddenType: 'SILENCE' },
      { id: 'final_w_10', text: 'To zostanie z nami na długo.', hiddenType: 'SILENCE' },
    ],
    DRAW: [
      { id: 'final_d_1', text: 'Finał nie został zamknięty w normalnym czasie. Teraz liczy się odporność.', hiddenType: 'CALM' },
      { id: 'final_d_2', text: 'W takim finale decydują nerwy i detale. Musimy zachować spokój.', hiddenType: 'CALM' },
      { id: 'final_d_3', text: 'Walczyliście jak w finale trzeba walczyć.', hiddenType: 'PRAISE' },
      { id: 'final_d_4', text: 'Nie pękliście pod presją. To ważne.', hiddenType: 'PRAISE' },
      { id: 'final_d_5', text: 'Mieliśmy momenty, żeby ten finał rozstrzygnąć wcześniej.', hiddenType: 'CRITICIZE' },
      { id: 'final_d_6', text: 'W finale trzeba być bezwzględnym. Dzisiaj tego zabrakło.', hiddenType: 'CRITICIZE' },
      { id: 'final_d_7', text: 'To finał! Nie ma już miejsca na ostrożność!', hiddenType: 'AGGRESSIVE' },
      { id: 'final_d_8', text: 'Trofeum trzeba wyrwać, nie czekać aż samo przyjdzie!', hiddenType: 'AGGRESSIVE' },
      { id: 'final_d_9', text: 'Wszystko rozstrzyga się w głowach.', hiddenType: 'SILENCE' },
      { id: 'final_d_10', text: 'Nie trzeba wielu słów.', hiddenType: 'SILENCE' },
    ],
    LOSS: [
      { id: 'final_l_1', text: 'Przegrany finał boli najbardziej. Musimy to przyjąć i wyciągnąć wnioski.', hiddenType: 'CALM' },
      { id: 'final_l_2', text: 'Byliśmy bardzo blisko trofeum. Teraz najważniejsze jest, jak na to odpowiemy.', hiddenType: 'CALM' },
      { id: 'final_l_3', text: 'Walczyliście w finale do końca. Dzisiaj to nie wystarczyło.', hiddenType: 'PRAISE' },
      { id: 'final_l_4', text: 'Nie mogę wam odmówić serca, ale finały wygrywa się detalami.', hiddenType: 'PRAISE' },
      { id: 'final_l_5', text: 'W finale za takie błędy płaci się najwyższą cenę.', hiddenType: 'CRITICIZE' },
      { id: 'final_l_6', text: 'To była szansa na trofeum i nie wykorzystaliśmy jej.', hiddenType: 'CRITICIZE' },
      { id: 'final_l_7', text: 'Finału nie można tak oddać! To musi w nas zostać!', hiddenType: 'AGGRESSIVE' },
      { id: 'final_l_8', text: 'Ten ból ma nas popchnąć do pracy, nie złamać!', hiddenType: 'AGGRESSIVE' },
      { id: 'final_l_9', text: 'Dzisiaj słowa niewiele zmienią.', hiddenType: 'SILENCE' },
      { id: 'final_l_10', text: 'Każdy wie, co straciliśmy.', hiddenType: 'SILENCE' },
    ],
  },
};

const LEAGUE_STAKES_POST_MATCH_DEBRIEF: Record<LeagueMotivationContext, Record<DebriefOutcome, DebriefComment[]>> = {
  LAST_ROUND_GENERAL: {
    WIN: [
      { id: 'lg_last_w_1', text: 'Wygraliśmy ostatni mecz sezonu. Dobrze zamknęliście ten rozdział.', hiddenType: 'PRAISE' },
      { id: 'lg_last_w_2', text: 'Koniec sezonu z trzema punktami. Doceniam koncentrację do ostatniego gwizdka.', hiddenType: 'CALM' },
      { id: 'lg_last_w_3', text: 'Taką energię trzeba zabrać do przygotowań. Nie pozwalamy, żeby to był jednorazowy zryw.', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_last_w_4', text: 'Wygrana cieszy, ale cały sezon pokazał też rzeczy, które musimy poprawić.', hiddenType: 'CRITICIZE' },
      { id: 'lg_last_w_5', text: 'Sezon zakończony zwycięstwem.', hiddenType: 'SILENCE' },
    ],
    DRAW: [
      { id: 'lg_last_d_1', text: 'Ostatni mecz sezonu dał punkt i kilka ważnych wniosków.', hiddenType: 'CALM' },
      { id: 'lg_last_d_2', text: 'Walczyliście do końca. Wynik nie jest idealny, ale charakter był widoczny.', hiddenType: 'PRAISE' },
      { id: 'lg_last_d_3', text: 'Nie chciałem kończyć sezonu remisem. Następny ma zacząć się z większym głodem.', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_last_d_4', text: 'Za dużo niedokładności jak na mecz, którym mieliśmy domknąć sezon.', hiddenType: 'CRITICIZE' },
      { id: 'lg_last_d_5', text: 'Sezon dobiegł końca.', hiddenType: 'SILENCE' },
    ],
    LOSS: [
      { id: 'lg_last_l_1', text: 'Taki koniec sezonu boli, ale musimy spokojnie wyciągnąć wnioski.', hiddenType: 'CALM' },
      { id: 'lg_last_l_2', text: 'Dziękuję tym, którzy walczyli do końca mimo wyniku.', hiddenType: 'PRAISE' },
      { id: 'lg_last_l_3', text: 'Nie tak kończy się sezon. Ten niedosyt ma zostać z nami w przygotowaniach.', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_last_l_4', text: 'Ostatni mecz obnażył problemy, których nie możemy przenieść na kolejny sezon.', hiddenType: 'CRITICIZE' },
      { id: 'lg_last_l_5', text: 'Koniec sezonu. Bez komentarza.', hiddenType: 'SILENCE' },
    ],
  },
  TITLE_OR_PROMOTION_SECURED: {
    WIN: [
      { id: 'lg_done_w_1', text: 'Cel już był osiągnięty, a wy nadal wygraliście. Tak wygląda drużyna ze standardem.', hiddenType: 'PRAISE' },
      { id: 'lg_done_w_2', text: 'Świętujemy, ale z szacunkiem do pracy. Dobrze, że nie odpuściliście.', hiddenType: 'CALM' },
      { id: 'lg_done_w_3', text: 'To ma być nasza mentalność po sukcesie: dalej głód, dalej intensywność!', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_done_w_4', text: 'Wygraliśmy, ale były momenty zbyt luźne. Sukces nie usprawiedliwia rozkojarzenia.', hiddenType: 'CRITICIZE' },
      { id: 'lg_done_w_5', text: 'Zrobiliśmy swoje.', hiddenType: 'SILENCE' },
    ],
    DRAW: [
      { id: 'lg_done_d_1', text: 'Cel jest nasz. Remis przyjmujemy spokojnie, ale standard gry musi zostać wyższy.', hiddenType: 'CALM' },
      { id: 'lg_done_d_2', text: 'Nie przegraliście i utrzymaliście godność tego sukcesu. Doceniam to.', hiddenType: 'PRAISE' },
      { id: 'lg_done_d_3', text: 'Po osiągniętym celu też trzeba chcieć wygrywać. Tego zabrakło.', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_done_d_4', text: 'Za dużo samozadowolenia. Nie lubię, gdy sukces rozmywa koncentrację.', hiddenType: 'CRITICIZE' },
      { id: 'lg_done_d_5', text: 'Cel osiągnięty.', hiddenType: 'SILENCE' },
    ],
    LOSS: [
      { id: 'lg_done_l_1', text: 'Sukcesu nikt nam nie odbierze, ale taka porażka nie może stać się nawykiem.', hiddenType: 'CALM' },
      { id: 'lg_done_l_2', text: 'Sezon i tak należy do was. Ten mecz analizujemy bez paniki.', hiddenType: 'PRAISE' },
      { id: 'lg_done_l_3', text: 'Nie akceptuję odpuszczania po sukcesie. Drużyna z ambicją gra do końca!', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_done_l_4', text: 'To wyglądało jak zbyt wczesne świętowanie. Tak nie bronimy własnego standardu.', hiddenType: 'CRITICIZE' },
      { id: 'lg_done_l_5', text: 'Sukces jest. Wynik do zapomnienia.', hiddenType: 'SILENCE' },
    ],
  },
  TITLE_DECIDER: {
    WIN: [
      { id: 'lg_title_w_1', text: 'Jesteśmy mistrzami. Udźwignęliście najważniejszy ciężar sezonu.', hiddenType: 'PRAISE' },
      { id: 'lg_title_w_2', text: 'Tytuł zdobyty. Zapamiętajcie spokój i odpowiedzialność, które nas tu doprowadziły.', hiddenType: 'CALM' },
      { id: 'lg_title_w_3', text: 'Tak wygrywa się mistrzostwo! Taka wiara ma zostać w tej szatni na lata!', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_title_w_4', text: 'Mistrzostwo jest nasze, ale nawet dziś są detale do poprawy.', hiddenType: 'CRITICIZE' },
      { id: 'lg_title_w_5', text: 'Mistrzostwo.', hiddenType: 'SILENCE' },
    ],
    DRAW: [
      { id: 'lg_title_d_1', text: 'Jeśli ten punkt wystarcza, doceniamy go. Jeśli nie, wiemy, czego zabrakło.', hiddenType: 'CALM' },
      { id: 'lg_title_d_2', text: 'Wytrzymaliście ogromną presję. Taki punkt też wymaga charakteru.', hiddenType: 'PRAISE' },
      { id: 'lg_title_d_3', text: 'Mieliśmy pójść po pełną kontrolę. Remis zostawia zbyt wiele nerwów.', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_title_d_4', text: 'W meczu o mistrzostwo trzeba być bardziej bezwzględnym.', hiddenType: 'CRITICIZE' },
      { id: 'lg_title_d_5', text: 'Wszystko zależy od tabeli.', hiddenType: 'SILENCE' },
    ],
    LOSS: [
      { id: 'lg_title_l_1', text: 'Taka porażka w meczu o mistrzostwo boli podwójnie. Musimy ją udźwignąć.', hiddenType: 'CALM' },
      { id: 'lg_title_l_2', text: 'Nie przekreślam sezonu jednym meczem, ale ten ból musi czegoś nas nauczyć.', hiddenType: 'PRAISE' },
      { id: 'lg_title_l_3', text: 'To był mecz o tytuł! Nie możemy w takim momencie wyglądać na sparaliżowanych!', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_title_l_4', text: 'Nie byliśmy wystarczająco dojrzali w najważniejszym momencie sezonu.', hiddenType: 'CRITICIZE' },
      { id: 'lg_title_l_5', text: 'Nie teraz. Bez komentarza.', hiddenType: 'SILENCE' },
    ],
  },
  DIRECT_PROMOTION_DECIDER: {
    WIN: [
      { id: 'lg_promo_w_1', text: 'Awans jest nasz. Udźwignęliście presję i zrobiliście to razem.', hiddenType: 'PRAISE' },
      { id: 'lg_promo_w_2', text: 'To zwycięstwo jest nagrodą za cały sezon pracy. Spokojnie, zasłużyliście.', hiddenType: 'CALM' },
      { id: 'lg_promo_w_3', text: 'Tak się bierze awans! Odwaga, tempo i wiara do końca!', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_promo_w_4', text: 'Awans cieszy, ale wyższa liga ukarze te błędy, które dzisiaj jeszcze widzieliśmy.', hiddenType: 'CRITICIZE' },
      { id: 'lg_promo_w_5', text: 'Awans.', hiddenType: 'SILENCE' },
    ],
    DRAW: [
      { id: 'lg_promo_d_1', text: 'Punkt w meczu o awans trzeba ocenić chłodno. Najważniejsze, czy przybliża nas do celu.', hiddenType: 'CALM' },
      { id: 'lg_promo_d_2', text: 'Presja była ogromna, a wy nie pękliście. Teraz patrzymy, co daje nam tabela.', hiddenType: 'PRAISE' },
      { id: 'lg_promo_d_3', text: 'W takim meczu trzeba szukać zwycięstwa mocniej. Remis zostawia niedosyt.', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_promo_d_4', text: 'Za mało odwagi jak na spotkanie, które mogło dać awans.', hiddenType: 'CRITICIZE' },
      { id: 'lg_promo_d_5', text: 'Czekamy na znaczenie tego punktu.', hiddenType: 'SILENCE' },
    ],
    LOSS: [
      { id: 'lg_promo_l_1', text: 'Porażka w meczu o awans boli, ale musimy natychmiast odzyskać kontrolę nad głowami.', hiddenType: 'CALM' },
      { id: 'lg_promo_l_2', text: 'Nie wszystko dziś wyszło, ale sezon jeszcze nie musi być przegrany.', hiddenType: 'PRAISE' },
      { id: 'lg_promo_l_3', text: 'Takiej szansy nie można oddać bez odpowiedzi! To musi was wstrząsnąć!', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_promo_l_4', text: 'W najważniejszym momencie zabrakło jakości i odwagi.', hiddenType: 'CRITICIZE' },
      { id: 'lg_promo_l_5', text: 'Szansa uciekła.', hiddenType: 'SILENCE' },
    ],
  },
  PLAYOFF_PLACE_DECIDER: {
    WIN: [
      { id: 'lg_playoff_w_1', text: 'Wyrwaliście miejsce w barażach. Teraz sezon naprawdę wchodzi w decydującą fazę.', hiddenType: 'PRAISE' },
      { id: 'lg_playoff_w_2', text: 'Dobra robota. Cieszymy się, ale baraże wymagają jeszcze chłodniejszej głowy.', hiddenType: 'CALM' },
      { id: 'lg_playoff_w_3', text: 'Taką determinacją przedłuża się sezon! Teraz idziemy po więcej.', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_playoff_w_4', text: 'Wygraliśmy, ale baraże nie wybaczą momentów takiej nerwowości.', hiddenType: 'CRITICIZE' },
      { id: 'lg_playoff_w_5', text: 'Gramy dalej.', hiddenType: 'SILENCE' },
    ],
    DRAW: [
      { id: 'lg_playoff_d_1', text: 'Remis w walce o baraże zostawia nas z rachunkami. Musimy przyjąć ten punkt i tabelę.', hiddenType: 'CALM' },
      { id: 'lg_playoff_d_2', text: 'Walczyliście, ale w takim meczu detale ważą więcej niż zwykle.', hiddenType: 'PRAISE' },
      { id: 'lg_playoff_d_3', text: 'Mieliśmy to wyrwać, a nie czekać na układ wyników!', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_playoff_d_4', text: 'Za mało konkretu pod bramką jak na mecz o baraże.', hiddenType: 'CRITICIZE' },
      { id: 'lg_playoff_d_5', text: 'Tyle.', hiddenType: 'SILENCE' },
    ],
    LOSS: [
      { id: 'lg_playoff_l_1', text: 'Przegrana w walce o baraże jest trudna do przyjęcia. Musimy nazwać błędy spokojnie.', hiddenType: 'CALM' },
      { id: 'lg_playoff_l_2', text: 'Doceniam wysiłek, ale dzisiaj zabrakło tego jednego poziomu więcej.', hiddenType: 'PRAISE' },
      { id: 'lg_playoff_l_3', text: 'To była szansa na przedłużenie sezonu! Nie wolno tak jej oddawać!', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_playoff_l_4', text: 'W meczu o baraże zabrakło nam odwagi, skuteczności i zimnej krwi.', hiddenType: 'CRITICIZE' },
      { id: 'lg_playoff_l_5', text: 'Szansa przepadła.', hiddenType: 'SILENCE' },
    ],
  },
  RELEGATION_DECIDER: {
    WIN: [
      { id: 'lg_stay_w_1', text: 'To było zwycięstwo o ogromnym ciężarze. Pokazaliście charakter w walce o utrzymanie.', hiddenType: 'PRAISE' },
      { id: 'lg_stay_w_2', text: 'Trzy punkty w takim meczu są bezcenne. Oddychamy, ale nie tracimy czujności.', hiddenType: 'CALM' },
      { id: 'lg_stay_w_3', text: 'Tak walczy drużyna, która nie chce spaść! Tę energię musimy utrzymać.', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_stay_w_4', text: 'Wygraliśmy, ale sytuacja pokazała, jak wiele wcześniej zaniedbaliśmy.', hiddenType: 'CRITICIZE' },
      { id: 'lg_stay_w_5', text: 'Żyjemy.', hiddenType: 'SILENCE' },
    ],
    DRAW: [
      { id: 'lg_stay_d_1', text: 'Punkt w walce o utrzymanie może być ważny, ale niczego nie możemy uznać za załatwione.', hiddenType: 'CALM' },
      { id: 'lg_stay_d_2', text: 'Nie pękliście pod presją. Teraz sprawdzamy, ile ten punkt znaczy.', hiddenType: 'PRAISE' },
      { id: 'lg_stay_d_3', text: 'W takim meczu trzeba gryźć trawę po zwycięstwo, nie tylko przetrwanie!', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_stay_d_4', text: 'Za dużo strachu. Utrzymania nie da się obronić samym cofnięciem.', hiddenType: 'CRITICIZE' },
      { id: 'lg_stay_d_5', text: 'Jeden punkt.', hiddenType: 'SILENCE' },
    ],
    LOSS: [
      { id: 'lg_stay_l_1', text: 'Porażka w walce o utrzymanie jest ciosem. Musimy ją przyjąć i jeszcze raz policzyć szanse.', hiddenType: 'CALM' },
      { id: 'lg_stay_l_2', text: 'Walczyliście momentami, ale w takim meczu momenty nie wystarczą.', hiddenType: 'PRAISE' },
      { id: 'lg_stay_l_3', text: 'To był mecz o ligę! Nie możemy przechodzić obok takiej stawki!', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_stay_l_4', text: 'Zabrakło odpowiedzialności w meczu, w którym każdy błąd ważył podwójnie.', hiddenType: 'CRITICIZE' },
      { id: 'lg_stay_l_5', text: 'Bardzo ciężki wynik.', hiddenType: 'SILENCE' },
    ],
  },
  EUROPE_PLACE_DECIDER: {
    WIN: [
      { id: 'lg_europe_w_1', text: 'Wygraliśmy mecz o puchary. Pokazaliście ambicję drużyny gotowej na większą scenę.', hiddenType: 'PRAISE' },
      { id: 'lg_europe_w_2', text: 'To ważny krok. Cieszymy się, ale Europa wymaga jeszcze większej jakości.', hiddenType: 'CALM' },
      { id: 'lg_europe_w_3', text: 'Tak walczy się o puchary! Ta szatnia ma prawo chcieć więcej.', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_europe_w_4', text: 'Wygrana cieszy, ale przy europejskim poziomie takie błędy będą kosztować.', hiddenType: 'CRITICIZE' },
      { id: 'lg_europe_w_5', text: 'Ważny krok.', hiddenType: 'SILENCE' },
    ],
    DRAW: [
      { id: 'lg_europe_d_1', text: 'Remis w walce o puchary zostawia niedosyt, ale nadal może mieć znaczenie.', hiddenType: 'CALM' },
      { id: 'lg_europe_d_2', text: 'Nie przegraliście meczu o dużej stawce. To też wymaga odporności.', hiddenType: 'PRAISE' },
      { id: 'lg_europe_d_3', text: 'Jeśli chcemy Europy, musimy takie mecze wygrywać odważniej!', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_europe_d_4', text: 'Za mało jakości w ostatniej tercji jak na mecz o puchary.', hiddenType: 'CRITICIZE' },
      { id: 'lg_europe_d_5', text: 'Niedosyt.', hiddenType: 'SILENCE' },
    ],
    LOSS: [
      { id: 'lg_europe_l_1', text: 'Porażka w meczu o puchary boli, ale musimy zachować chłodną analizę.', hiddenType: 'CALM' },
      { id: 'lg_europe_l_2', text: 'Ambicji nie odmawiam, lecz dziś zabrakło jakości w najważniejszych momentach.', hiddenType: 'PRAISE' },
      { id: 'lg_europe_l_3', text: 'Takiej szansy na Europę nie można oddać bez zdecydowanej reakcji!', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_europe_l_4', text: 'Jeśli chcemy pucharów, musimy grać dojrzalej niż dzisiaj.', hiddenType: 'CRITICIZE' },
      { id: 'lg_europe_l_5', text: 'Europa oddaliła się.', hiddenType: 'SILENCE' },
    ],
  },
  ALREADY_RELEGATED: {
    WIN: [
      { id: 'lg_down_w_1', text: 'Spadek jest faktem, ale dzisiaj pokazaliście, że charakter jeszcze tu jest.', hiddenType: 'PRAISE' },
      { id: 'lg_down_w_2', text: 'To zwycięstwo nie zmieni tabeli, ale może być początkiem odbudowy.', hiddenType: 'CALM' },
      { id: 'lg_down_w_3', text: 'Takiej złości i dumy potrzebujemy, jeśli mamy wrócić silniejsi!', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_down_w_4', text: 'Szkoda, że taka reakcja przyszła dopiero teraz.', hiddenType: 'CRITICIZE' },
      { id: 'lg_down_w_5', text: 'Wygrana po spadku.', hiddenType: 'SILENCE' },
    ],
    DRAW: [
      { id: 'lg_down_d_1', text: 'Spadek jest przesądzony. Ten remis traktujemy jako fragment trudnej odbudowy.', hiddenType: 'CALM' },
      { id: 'lg_down_d_2', text: 'Nie odpuściliście całkowicie i to trzeba zauważyć.', hiddenType: 'PRAISE' },
      { id: 'lg_down_d_3', text: 'Nawet po spadku trzeba grać z większą wściekłością niż dziś!', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_down_d_4', text: 'Za dużo bierności jak na drużynę, która powinna odzyskiwać twarz.', hiddenType: 'CRITICIZE' },
      { id: 'lg_down_d_5', text: 'Remis. Nic więcej.', hiddenType: 'SILENCE' },
    ],
    LOSS: [
      { id: 'lg_down_l_1', text: 'Spadek i kolejna porażka. Musimy spokojnie rozpocząć odbudowę od fundamentów.', hiddenType: 'CALM' },
      { id: 'lg_down_l_2', text: 'Doceniam tych, którzy mimo wszystko próbowali walczyć.', hiddenType: 'PRAISE' },
      { id: 'lg_down_l_3', text: 'Nie wolno nam przyzwyczaić się do przegrywania! Nawet teraz!', hiddenType: 'AGGRESSIVE' },
      { id: 'lg_down_l_4', text: 'Ten mecz pokazał, dlaczego znaleźliśmy się w takiej sytuacji.', hiddenType: 'CRITICIZE' },
      { id: 'lg_down_l_5', text: 'Bez słów.', hiddenType: 'SILENCE' },
    ],
  },
};

// ─── WYZNACZENIE KONTEKSTU PO MECZU ─────────────────────────────────────────
export const getDebriefContext = (
  userScore: number,
  oppScore: number,
  userRep: number,
  oppRep: number,
  userGoals: { minute: number }[],
  oppGoals: { minute: number }[],
  userHasRedCard: boolean
): DebriefContext => {
  const diff = userScore - oppScore;
  const isWin = diff > 0;
  const isLoss = diff < 0;
  const repRatio = userRep > 0 ? oppRep / userRep : 1;
  const isStrongOpp = repRatio >= 1.20;
  const isWeakOpp = repRatio <= 0.85;

  const lastOppGoalMin = oppGoals.length > 0 ? Math.max(...oppGoals.map(g => g.minute)) : 0;
  const lastUserGoalMin = userGoals.length > 0 ? Math.max(...userGoals.map(g => g.minute)) : 0;
  const userHalfTimeScore = userGoals.filter(g => g.minute <= 45).length;
  const oppHalfTimeScore = oppGoals.filter(g => g.minute <= 45).length;
  const halfTimeDiff = userHalfTimeScore - oppHalfTimeScore;
  const secondHalfDiff = diff - halfTimeDiff;
  const wasLosingAtHalfTime = halfTimeDiff < 0;
  const wasLeadingAtHalfTime = halfTimeDiff > 0;
  const wasLevelAtHalfTime = halfTimeDiff === 0;
  const lostSecondHalf = secondHalfDiff < 0;

  if (isLoss) {
    if (userHasRedCard) return 'RED_CARD_LOSS';
    if (wasLeadingAtHalfTime) return 'LOSS_AFTER_LEADING';
    if ((wasLevelAtHalfTime || wasLeadingAtHalfTime) && lostSecondHalf) return 'LOSS_BAD_SECOND_HALF';
    if (Math.abs(diff) >= 3) return 'BIG_LOSS';
    if (isWeakOpp) return 'LOSS_WEAK';
    if (isStrongOpp) return 'LOSS_STRONG';
    if (lastOppGoalMin >= 80 && Math.abs(diff) === 1) return 'LAST_MIN_LOSS';
    if (Math.abs(diff) === 1) return 'NARROW_LOSS';
    return 'BIG_LOSS';
  }

  if (isWin) {
    if (wasLosingAtHalfTime) return 'WIN_FROM_BEHIND';
    if (wasLeadingAtHalfTime && lostSecondHalf) return 'WIN_BAD_SECOND_HALF';
    if (isStrongOpp) return 'WIN_STRONG';
    if (diff >= 3) return 'BIG_WIN';
    if (isWeakOpp) return 'WIN_WEAK';
    return 'WIN_NORMAL';
  }

  // Remis
  if (wasLosingAtHalfTime) return 'DRAW_FROM_BEHIND';
  if (wasLeadingAtHalfTime) return 'DRAW_AFTER_LEADING';
  if (lastOppGoalMin >= 80 && oppGoals.length > 0) return 'DRAW_LAST_MIN_AGAINST';
  if (lastUserGoalMin >= 80 && userGoals.length > 0) return 'DRAW_LAST_MIN_FOR';
  if (isStrongOpp) return 'DRAW_STRONG';
  return 'DRAW';
};

// ─── POBRANIE KOMENTARZY DLA KONTEKSTU ───────────────────────────────────────
const getDebriefOutcome = (context: DebriefContext): DebriefOutcome => {
  if (['BIG_WIN', 'WIN_STRONG', 'WIN_WEAK', 'WIN_NORMAL', 'WIN_FROM_BEHIND', 'WIN_BAD_SECOND_HALF', 'PENALTY_WIN'].includes(context)) return 'WIN';
  if (['BIG_LOSS', 'LOSS_STRONG', 'LOSS_WEAK', 'LOSS_AFTER_LEADING', 'LOSS_BAD_SECOND_HALF', 'LAST_MIN_LOSS', 'NARROW_LOSS', 'RED_CARD_LOSS', 'PENALTY_LOSS'].includes(context)) return 'LOSS';
  return 'DRAW';
};

const HALF_SWING_CONTEXTS: DebriefContext[] = [
  'WIN_FROM_BEHIND',
  'WIN_BAD_SECOND_HALF',
  'DRAW_FROM_BEHIND',
  'DRAW_AFTER_LEADING',
  'LOSS_AFTER_LEADING',
  'LOSS_BAD_SECOND_HALF',
];

export const getCommentsForContext = (
  context: DebriefContext,
  matchStage: DebriefMatchStage = 'LEAGUE',
  leagueMotivationContext?: LeagueMotivationContext | null
): DebriefComment[] => {
  if (matchStage === 'FRIENDLY') {
    return FRIENDLY_HALF_SWING_DEBRIEF[context] ?? FRIENDLY_POST_MATCH_DEBRIEF[getDebriefOutcome(context)];
  }

  if (matchStage === 'LEAGUE' && leagueMotivationContext) {
    return LEAGUE_STAKES_POST_MATCH_DEBRIEF[leagueMotivationContext][getDebriefOutcome(context)];
  }

  if (HALF_SWING_CONTEXTS.includes(context)) {
    return POST_MATCH_DEBRIEF[context];
  }

  if (matchStage === 'CUP' && context === 'BIG_WIN') {
    return CUP_BIG_WIN_DEBRIEF;
  }

  if (matchStage !== 'LEAGUE' && matchStage !== 'CUP_FINAL' && context === 'WIN_STRONG') {
    return CUP_WIN_STRONG_DEBRIEF;
  }

  if (matchStage !== 'LEAGUE' && matchStage !== 'CUP_FINAL' && context === 'DRAW_STRONG') {
    return CUP_DRAW_STRONG_DEBRIEF;
  }

  if (matchStage !== 'LEAGUE') {
    return CUP_POST_MATCH_DEBRIEF[matchStage][getDebriefOutcome(context)];
  }

  return POST_MATCH_DEBRIEF[context];
};

// ─── KONTEKSTOWA TRAFNOŚĆ KOMENTARZA ────────────────────────────────────────
const getContextFit = (type: DebriefCommentType, context: DebriefContext): number => {
  const isWinCtx = ['BIG_WIN', 'WIN_STRONG', 'WIN_WEAK', 'WIN_NORMAL', 'WIN_FROM_BEHIND', 'WIN_BAD_SECOND_HALF', 'PENALTY_WIN'].includes(context);
  const isLossCtx = ['BIG_LOSS', 'LOSS_STRONG', 'LOSS_WEAK', 'LOSS_AFTER_LEADING', 'LOSS_BAD_SECOND_HALF', 'LAST_MIN_LOSS', 'NARROW_LOSS', 'RED_CARD_LOSS', 'PENALTY_LOSS'].includes(context);

  if (type === 'PRAISE') {
    if (isWinCtx) return 0.9;
    if (isLossCtx) return -0.3;
    return 0.4;
  }
  if (type === 'AGGRESSIVE') {
    if (isLossCtx) return 0.8;
    if (context === 'DRAW_LAST_MIN_AGAINST') return 0.7;
    if (isWinCtx) return -0.2;
    return 0.3;
  }
  if (type === 'CALM') {
    if (isWinCtx) return 0.7;
    if (isLossCtx) return -0.1;
    return 0.5;
  }
  if (type === 'CRITICIZE') {
    if (isLossCtx) return 0.5;
    if (context === 'DRAW_LAST_MIN_AGAINST') return 0.5;
    if (isWinCtx) return -0.6;
    return 0.2;
  }
  return 0; // SILENCE
};

// ─── ZAKRESY BAZOWYCH DELT MORALE PER TYP ────────────────────────────────────
const getBaseRange = (type: DebriefCommentType, context: DebriefContext): { min: number; max: number } => {
  const isWinCtx = ['BIG_WIN', 'WIN_STRONG', 'WIN_WEAK', 'WIN_NORMAL', 'WIN_FROM_BEHIND', 'WIN_BAD_SECOND_HALF', 'PENALTY_WIN'].includes(context);
  const isLossCtx = ['BIG_LOSS', 'LOSS_STRONG', 'LOSS_WEAK', 'LOSS_AFTER_LEADING', 'LOSS_BAD_SECOND_HALF', 'LAST_MIN_LOSS', 'NARROW_LOSS', 'RED_CARD_LOSS', 'PENALTY_LOSS'].includes(context);

  if (type === 'PRAISE') {
    if (isWinCtx) return { min: 4, max: 10 };
    if (isLossCtx) return { min: -2, max: 6 };
    return { min: 1, max: 7 };
  }
  if (type === 'AGGRESSIVE') {
    if (isLossCtx) return { min: 2, max: 12 };
    if (isWinCtx) return { min: -4, max: 7 };
    return { min: 1, max: 8 };
  }
  if (type === 'CALM') {
    if (isWinCtx) return { min: 2, max: 7 };
    if (isLossCtx) return { min: -4, max: 4 };
    return { min: 1, max: 6 };
  }
  if (type === 'CRITICIZE') {
    if (isLossCtx) return { min: -8, max: 9 };
    if (isWinCtx) return { min: -10, max: 2 };
    return { min: -7, max: 6 };
  }
  // SILENCE
  return { min: -4, max: -1 };
};

// ─── GŁÓWNA KALKULACJA EFEKTU ODPRAWY ────────────────────────────────────────
export const calculateDebriefEffect = (
  commentType: DebriefCommentType,
  context: DebriefContext,
  seed: number,
  optionIndex: number
): DebriefEffect => {
  const rng1 = seededRng(seed, optionIndex * 11 + 200);
  const rng2 = seededRng(seed, optionIndex * 11 + 201);
  const rng3 = seededRng(seed, optionIndex * 11 + 202);
  const rng4 = seededRng(seed, optionIndex * 11 + 203);

  const { min, max } = getBaseRange(commentType, context);
  const contextFit = getContextFit(commentType, context);

  const rawBase = min + rng1 * (max - min);
  const totalMod = Math.max(0.1, 1.0 + contextFit);
  let delta = rawBase * totalMod;

  // ── 20% czynnik losowy: szatnia może zareagować odwrotnie ─────────────────
  const isUnexpected = rng2 < 0.20;
  let reactionText: string;

  if (isUnexpected) {
    delta = -delta * (0.4 + rng3 * 0.6);
    reactionText = REACTION_UNEXPECTED[Math.floor(rng4 * REACTION_UNEXPECTED.length)];
  } else {
    const pool = REACTION_NORMAL[commentType];
    reactionText = pool[Math.floor(rng3 * pool.length)];
  }

  delta = Math.max(-15, Math.min(15, Math.round(delta)));

  return { moraleDelta: delta, reactionText };
};

// ─── ETYKIETA KONTEKSTU (do wyświetlenia w modalu) ───────────────────────────
export const getDebriefContextLabel = (context: DebriefContext, matchStage: DebriefMatchStage = 'LEAGUE'): string => {
  const labels: Record<DebriefContext, string> = {
    BIG_WIN: 'DUŻE ZWYCIĘSTWO',
    WIN_STRONG: 'WYGRANA Z FAWORYTEM',
    WIN_WEAK: 'WYGRANA ZE SŁABSZYM',
    WIN_NORMAL: 'ZWYCIĘSTWO',
    WIN_FROM_BEHIND: 'WYGRANA PO ODROBIENIU STRAT',
    WIN_BAD_SECOND_HALF: 'WYGRANA MIMO SŁABEJ DRUGIEJ POŁOWY',
    PENALTY_WIN: 'WYGRANA PO KARNYCH',
    PENALTY_LOSS: 'PORAŻKA PO KARNYCH',
    DRAW_LAST_MIN_AGAINST: 'REMIS W OSTATNIEJ CHWILI',
    DRAW_LAST_MIN_FOR: 'URATOWANY REMIS',
    DRAW_FROM_BEHIND: 'REMIS PO ODROBIENIU STRAT',
    DRAW_AFTER_LEADING: 'REMIS PO UTRACIE PROWADZENIA',
    DRAW_STRONG: 'REMIS Z FAWORYTEM',
    DRAW: 'REMIS',
    BIG_LOSS: 'WYSOKA PRZEGRANA',
    LOSS_STRONG: 'PRZEGRANA Z FAWORYTEM',
    LOSS_WEAK: 'PRZEGRANA ZE SŁABSZYM',
    LOSS_AFTER_LEADING: 'PORAŻKA PO UTRACIE PROWADZENIA',
    LOSS_BAD_SECOND_HALF: 'PORAŻKA PO SŁABEJ DRUGIEJ POŁOWIE',
    LAST_MIN_LOSS: 'PRZEGRANA W KOŃCÓWCE',
    NARROW_LOSS: 'MINIMALNA PRZEGRANA',
    RED_CARD_LOSS: 'PRZEGRANA Z 10 ZAWODNIKAMI',
  };
  const baseLabel = labels[context];
  if (matchStage === 'CUP_FINAL') return `FINAŁ: ${baseLabel}`;
  if (matchStage === 'CUP_SEMIFINAL') return `PÓŁFINAŁ: ${baseLabel}`;
  if (matchStage === 'CUP') return `PUCHAR: ${baseLabel}`;
  if (matchStage === 'FRIENDLY') return `SPARING: ${baseLabel}`;
  return baseLabel;
};

// ─── KOLOR AKCENTU PER KONTEKST ──────────────────────────────────────────────
export const getDebriefAccentColor = (context: DebriefContext): { via: string; badge: string; glow: string } => {
  const isWin = ['BIG_WIN', 'WIN_STRONG', 'WIN_WEAK', 'WIN_NORMAL', 'WIN_FROM_BEHIND', 'WIN_BAD_SECOND_HALF', 'PENALTY_WIN'].includes(context);
  const isLoss = ['BIG_LOSS', 'LOSS_STRONG', 'LOSS_WEAK', 'LOSS_AFTER_LEADING', 'LOSS_BAD_SECOND_HALF', 'LAST_MIN_LOSS', 'NARROW_LOSS', 'RED_CARD_LOSS', 'PENALTY_LOSS'].includes(context);
  const isBigLoss = context === 'BIG_LOSS' || context === 'LOSS_WEAK' || context === 'RED_CARD_LOSS';
  const isBigWin = context === 'BIG_WIN' || context === 'WIN_STRONG';

  if (isBigWin) return { via: 'via-yellow-400', badge: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10', glow: 'rgba(250,204,21,0.10)' };
  if (isWin) return { via: 'via-emerald-400', badge: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10', glow: 'rgba(52,211,153,0.08)' };
  if (isBigLoss) return { via: 'via-red-500', badge: 'text-red-400 border-red-500/40 bg-red-500/10', glow: 'rgba(239,68,68,0.10)' };
  if (isLoss) return { via: 'via-orange-500', badge: 'text-orange-400 border-orange-500/40 bg-orange-500/10', glow: 'rgba(249,115,22,0.08)' };
  if (context === 'DRAW_LAST_MIN_AGAINST') return { via: 'via-orange-400', badge: 'text-orange-400 border-orange-400/40 bg-orange-400/10', glow: 'rgba(251,146,60,0.08)' };
  if (context === 'DRAW_LAST_MIN_FOR' || context === 'DRAW_STRONG' || context === 'DRAW_FROM_BEHIND') return { via: 'via-blue-400', badge: 'text-blue-400 border-blue-400/40 bg-blue-400/10', glow: 'rgba(96,165,250,0.08)' };
  return { via: 'via-slate-400', badge: 'text-slate-300 border-slate-500/40 bg-slate-500/10', glow: 'rgba(148,163,184,0.05)' };
};
