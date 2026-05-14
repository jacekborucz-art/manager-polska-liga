import { DebriefContext, DebriefCommentType, DebriefComment, POST_MATCH_DEBRIEF } from '../data/postmatch_debrief_pl';

export type { DebriefContext, DebriefCommentType };

export type DebriefMatchStage = 'LEAGUE' | 'CUP' | 'CUP_SEMIFINAL' | 'CUP_FINAL';

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
type CupDebriefStage = Exclude<DebriefMatchStage, 'LEAGUE'>;

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

  if (isLoss) {
    if (userHasRedCard) return 'RED_CARD_LOSS';
    if (Math.abs(diff) >= 3) return 'BIG_LOSS';
    if (isWeakOpp) return 'LOSS_WEAK';
    if (isStrongOpp) return 'LOSS_STRONG';
    if (lastOppGoalMin >= 80 && Math.abs(diff) === 1) return 'LAST_MIN_LOSS';
    if (Math.abs(diff) === 1) return 'NARROW_LOSS';
    return 'BIG_LOSS';
  }

  if (isWin) {
    if (isStrongOpp) return 'WIN_STRONG';
    if (diff >= 3) return 'BIG_WIN';
    if (isWeakOpp) return 'WIN_WEAK';
    return 'WIN_NORMAL';
  }

  // Remis
  if (lastOppGoalMin >= 80 && oppGoals.length > 0) return 'DRAW_LAST_MIN_AGAINST';
  if (lastUserGoalMin >= 80 && userGoals.length > 0) return 'DRAW_LAST_MIN_FOR';
  if (isStrongOpp) return 'DRAW_STRONG';
  return 'DRAW';
};

// ─── POBRANIE KOMENTARZY DLA KONTEKSTU ───────────────────────────────────────
const getDebriefOutcome = (context: DebriefContext): DebriefOutcome => {
  if (['BIG_WIN', 'WIN_STRONG', 'WIN_WEAK', 'WIN_NORMAL', 'PENALTY_WIN'].includes(context)) return 'WIN';
  if (['BIG_LOSS', 'LOSS_STRONG', 'LOSS_WEAK', 'LAST_MIN_LOSS', 'NARROW_LOSS', 'RED_CARD_LOSS', 'PENALTY_LOSS'].includes(context)) return 'LOSS';
  return 'DRAW';
};

export const getCommentsForContext = (context: DebriefContext, matchStage: DebriefMatchStage = 'LEAGUE'): DebriefComment[] => {
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
  const isWinCtx = ['BIG_WIN', 'WIN_STRONG', 'WIN_WEAK', 'WIN_NORMAL', 'PENALTY_WIN'].includes(context);
  const isLossCtx = ['BIG_LOSS', 'LOSS_STRONG', 'LOSS_WEAK', 'LAST_MIN_LOSS', 'NARROW_LOSS', 'RED_CARD_LOSS', 'PENALTY_LOSS'].includes(context);

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
  const isWinCtx = ['BIG_WIN', 'WIN_STRONG', 'WIN_WEAK', 'WIN_NORMAL', 'PENALTY_WIN'].includes(context);
  const isLossCtx = ['BIG_LOSS', 'LOSS_STRONG', 'LOSS_WEAK', 'LAST_MIN_LOSS', 'NARROW_LOSS', 'RED_CARD_LOSS', 'PENALTY_LOSS'].includes(context);

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
    PENALTY_WIN: 'WYGRANA PO KARNYCH',
    PENALTY_LOSS: 'PORAŻKA PO KARNYCH',
    DRAW_LAST_MIN_AGAINST: 'REMIS W OSTATNIEJ CHWILI',
    DRAW_LAST_MIN_FOR: 'URATOWANY REMIS',
    DRAW_STRONG: 'REMIS Z FAWORYTEM',
    DRAW: 'REMIS',
    BIG_LOSS: 'WYSOKA PRZEGRANA',
    LOSS_STRONG: 'PRZEGRANA Z FAWORYTEM',
    LOSS_WEAK: 'PRZEGRANA ZE SŁABSZYM',
    LAST_MIN_LOSS: 'PRZEGRANA W KOŃCÓWCE',
    NARROW_LOSS: 'MINIMALNA PRZEGRANA',
    RED_CARD_LOSS: 'PRZEGRANA Z 10 ZAWODNIKAMI',
  };
  const baseLabel = labels[context];
  if (matchStage === 'CUP_FINAL') return `FINAŁ: ${baseLabel}`;
  if (matchStage === 'CUP_SEMIFINAL') return `PÓŁFINAŁ: ${baseLabel}`;
  if (matchStage === 'CUP') return `PUCHAR: ${baseLabel}`;
  return baseLabel;
};

// ─── KOLOR AKCENTU PER KONTEKST ──────────────────────────────────────────────
export const getDebriefAccentColor = (context: DebriefContext): { via: string; badge: string; glow: string } => {
  const isWin = ['BIG_WIN', 'WIN_STRONG', 'WIN_WEAK', 'WIN_NORMAL', 'PENALTY_WIN'].includes(context);
  const isLoss = ['BIG_LOSS', 'LOSS_STRONG', 'LOSS_WEAK', 'LAST_MIN_LOSS', 'NARROW_LOSS', 'RED_CARD_LOSS', 'PENALTY_LOSS'].includes(context);
  const isBigLoss = context === 'BIG_LOSS' || context === 'LOSS_WEAK' || context === 'RED_CARD_LOSS';
  const isBigWin = context === 'BIG_WIN' || context === 'WIN_STRONG';

  if (isBigWin) return { via: 'via-yellow-400', badge: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10', glow: 'rgba(250,204,21,0.10)' };
  if (isWin) return { via: 'via-emerald-400', badge: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10', glow: 'rgba(52,211,153,0.08)' };
  if (isBigLoss) return { via: 'via-red-500', badge: 'text-red-400 border-red-500/40 bg-red-500/10', glow: 'rgba(239,68,68,0.10)' };
  if (isLoss) return { via: 'via-orange-500', badge: 'text-orange-400 border-orange-500/40 bg-orange-500/10', glow: 'rgba(249,115,22,0.08)' };
  if (context === 'DRAW_LAST_MIN_AGAINST') return { via: 'via-orange-400', badge: 'text-orange-400 border-orange-400/40 bg-orange-400/10', glow: 'rgba(251,146,60,0.08)' };
  if (context === 'DRAW_LAST_MIN_FOR' || context === 'DRAW_STRONG') return { via: 'via-blue-400', badge: 'text-blue-400 border-blue-400/40 bg-blue-400/10', glow: 'rgba(96,165,250,0.08)' };
  return { via: 'via-slate-400', badge: 'text-slate-300 border-slate-500/40 bg-slate-500/10', glow: 'rgba(148,163,184,0.05)' };
};
