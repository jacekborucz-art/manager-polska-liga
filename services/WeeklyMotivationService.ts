import { Club } from '../types';
import { MotivationTalkType, MotivationTalkOption } from '../data/weekly_motivation_talks_pl';

export interface MotivationContext {
  form: ('W' | 'R' | 'P')[];
  leaguePosition: number;   // 1-18
  teamCount: number;        // liczba drużyn w lidze
  matchesPlayed: number;
  currentMorale: number;
}

export interface MotivationTalkResult {
  moraleDelta: number;
  reactionText: string;
  isPositive: boolean;
}

// ─── SEEDED RNG ────────────────────────────────────────────────────────────────
const seededRng = (seed: number, offset: number): number => {
  const s = seed + offset * 9301 + 49297;
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
};

// ─── TEKSTY REAKCJI ───────────────────────────────────────────────────────────
const REACTION_TEXTS: Record<MotivationTalkType, { positive: string[]; negative: string[] }> = {
  HONEST: {
    positive: [
      'Zawodnicy słuchają w skupieniu. Nieliczni przytakują.',
      'Cisza w szatni. Szczerość trenera robi wrażenie. Widać, że to przemawia do zawodników.',
      'Jeden z liderów wstaje i mówi: "Trener ma rację". Atmosfera się zmienia.',
    ],
    negative: [
      'Kilku zawodników spogląda po sobie z niepokojem. Szczerość uderza za mocno.',
      'W szatni robi się ciężko. Niektórzy nie są gotowi na taką rozmowę.',
      'Słowa odbijają się od ściany. Zespół nie reaguje tak jak powinien.',
    ],
  },
  AGGRESSIVE: {
    positive: [
      'Szatnia eksploduje energią. Zawodnicy wychodzą zmotywowani jak nigdy.',
      'Ostra rozmowa robi swoje, widać determinację na twarzach graczy.',
      'Nikt nie odzywa się, ale wszyscy wstają z głowami podniesionymi wysoko.',
    ],
    negative: [
      'Kilku doświadczonych zawodników reaguje na słowa trenera z dystansem.',
      'Atmosfera gęstnieje. Nie wszyscy doceniają takie podejście.',
      'Zbyt wiele presji naraz. Kilku zawodników wychodzi zamkniętych w sobie.',
    ],
  },
  PRAISE: {
    positive: [
      'Uśmiechy, oklaski. Drużyna wychodzi z szatni z głowami wysoko.',
      'Pochwały trafiają w punkt, pozytywna energia wypełnia szatnię.',
      'Widać, że słowa uznania dały zastrzyku pewności siebie.',
    ],
    negative: [
      'Pochwały brzmią pusto przy obecnych wynikach. Zawodnicy milczą.',
      'Kilku graczy wymienia spojrzenia. Pochwały w tej chwili nie przekonują.',
      'Brak reakcji. Szatnia zdaje się nie wierzyć w to co słyszy.',
    ],
  },
  DOUBT: {
    positive: [
      'Szczerość trenera mobilizuje. Zawodnicy nie chcą go zawieść.',
      'Wyrażone wątpliwości działają jak wyzwanie, kilku graczy zaciska pięści.',
      'Jeden z kapitanów mówi: "Pokażemy im". Drużyna reaguje.',
    ],
    negative: [
      'Wątpliwości trenera udzielają się drużynie. Nastrój wyraźnie siada.',
      'Kilku zawodników traci pewność siebie po tych słowach.',
      'Negatywna atmosfera zostaje w szatni długo po zakończeniu rozmowy.',
    ],
  },
  BELIEF: {
    positive: [
      'Słowa wiary trafiają do każdego. Szatnia ożywia się.',
      'Zawodnicy czują wsparcie trenera. Widać to w ich postawie.',
      'Pozytywna energia. Drużyna wychodzi zjednoczona.',
    ],
    negative: [
      'Słowa brzmią szczerze, ale nie wystarczą na zmianę nastroju.',
      'Kilku zawodników kiwa głową, ale zmęczenie i wyniki mówią co innego.',
      'Wiara trenera nie przekłada się dziś na reakcję drużyny.',
    ],
  },
  OVERCONFIDENT: {
    positive: [
      'Przesada? Może. Ale energie w szatni skoczyła. Zawodnicy łapią bakcyla pewności siebie.',
      'Kilku zawodników śmieje się, ale śmiech przechodzi w oklaski. Działa.',
      'Poczucie humoru i pewność siebie trenera zaraża. Dobra atmosfera.',
    ],
    negative: [
      'Zawodnicy spoglądają po sobie z niedowierzaniem. To zbyt wiele jak na teraz.',
      'Kilku weteranów kręci głowami. Deklaracja brzmi oderwanie od rzeczywistości.',
      'Cisza. Drużyna nie wierzy w słowa trenera przy obecnych wynikach.',
    ],
  },
  CALM: {
    positive: [
      'Spokój trenera działa uspokajająco. Drużyna koncentruje się na robocie.',
      'Nikt nie panikuje. Spokojne podejście stabilizuje atmosferę w szatni.',
      'Zawodnicy oddychają z ulgą. Brak presji pomaga im się skupić.',
    ],
    negative: [
      'Spokój trenera jest niezrozumiały dla kilku zawodników. Potrzebowali czegoś więcej.',
      'Drużyna oczekiwała impulsu. Spokojne słowa nie dają tego czego szukała.',
      'Brak reakcji. Neutralne nastawienie nie zmienia nic w szatni.',
    ],
  },
  CHALLENGE: {
    positive: [
      'Wyzwanie mobilizuje. Kilku zawodników wstaje i zaczyna gestykulować — są gotowi.',
      'Rywalizacja o miejsce w składzie działa. Drużyna wychodzi głodna.',
      'Kapitan podnosi głos: "Pokaż co potrafisz!" Szatnia reaguje pozytywnie.',
    ],
    negative: [
      'Kilku zawodników odbiera wyzwanie jak zagrożenie. Napięcie rośnie.',
      'Za dużo presji. Przy obecnym morale wyzwanie tylko pogłębia kryzys.',
      'Drużyna milczy. Zamiast motywacji — widać niepewność.',
    ],
  },
  UNITY: {
    positive: [
      'Zawodnicy kładą ręce na siebie. Atmosfera szatni zmienia się wyraźnie.',
      'Słowa o jedności trafiają szczególnie gdy drużyna potrzebuje wsparcia.',
      'Kilku zawodników ściska się przed wyjściem. Razem silniejsi.',
    ],
    negative: [
      'Słowa o jedności brzmią pusto gdy wyniki mówią co innego.',
      'Brak reakcji. Drużyna nie jest dziś gotowa na taką rozmowę.',
      'Kilku zawodników wychodzi bez słowa. Atmosfera pozostaje napięta.',
    ],
  },
  PRESS: {
    positive: [
      'Kibice to argument który trafia do każdego. Widać mobilizację.',
      'Słowa o kibicach dodają dodatkowej motywacji. Nikt nie chce ich zawieść.',
      'Jeden z graczy mówi cicho: "Dla nich". Inni kiwnęli głowami.',
    ],
    negative: [
      'Presja kibiców działa jak dodatkowy ciężar, a nie skrzydła.',
      'Kilku zawodników reaguje niepokojem na wspomnienie kibiców.',
      'Przy słabym morale oczekiwania kibiców tylko dokładają stresu.',
    ],
  },
  HISTORY: {
    positive: [
      'Historia klubu robi wrażenie. Zawodnicy czują się częścią czegoś większego.',
      'Słowa o poprzednikach budzą dumę. Drużyna wychodzi z podniesioną głową.',
      'Trener wie jak odwołać się do korzeni. To przemawia do zawodników.',
    ],
    negative: [
      'Historia to tylko historia, kilku zawodników żyje teraźniejszością.',
      'Odwołanie do przeszłości nie robi dziś specjalnego wrażenia.',
      'Brak reakcji. Drużyna potrzebuje konkretów, nie opowieści.',
    ],
  },
  SILENCE: {
    positive: [
      'Cisza mówi więcej niż słowa. Każdy wie co ma robić.',
      'Zawodnicy cenią przestrzeń którą dał im trener. Skupiają się we własnym tempie.',
      'Bez słów, ale z wyraźną atmosferą zrozumienia.',
    ],
    negative: [
      'Drużyna spodziewała się czegoś innego. Cisza odbierana jako brak zainteresowania.',
      'Nastrój w szatni pozostał bez zmian.',
      'Kilku zawodników wychodzi zdezorientowanych brakiem komunikatu.',
    ],
  },
  INDIVIDUAL: {
    positive: [
      'Indywidualne rozmowy przynoszą efekt, każdy czuje się ważny.',
      'Widać że trener zna swoich zawodników. To buduje zaufanie.',
      'Personalne podejście robi różnicę. Drużyna reaguje jako jedność.',
    ],
    negative: [
      'Mimo indywidualnych rozmów, nie widać jakiejś specjalnej poprawy.',
      'Kilku zawodników ma poczucie że ich rozmowa z trenerem nie zmieniła nic.',
      'Indywidualne podejście kosztuje energię, a efektu grupowego brak.',
    ],
  },
  DEMAND: {
    positive: [
      'Twarde wymagania budzą w zawodnikach ducha walki. Wychodzą zmobilizowani.',
      'Kto daje sto procent, nie ma się czego bać. Drużyna jest gotowa.',
      'Słowa trenera działają jak zimny prysznic. Wszyscy się prostują.',
    ],
    negative: [
      'Zbyt duże wymagania przy obecnym nastroju tylko pogłębiają kryzys.',
      'Kilku zawodników reaguje ze złością. Napięcie w szatni wzrasta.',
      'Zamiast motywacji lęk przed konsekwencjami. Nie o to chodziło.',
    ],
  },
  TACTICAL: {
    positive: [
      'Zawodnicy słuchają uważnie.',
      'Jasny plan na mecz daje drużynie pewność.',
      'Taktyczne skupienie zastępuje emocje. Szatnia wychodzi skoncentrowana.',
    ],
    negative: [
      'Taktyka to nie to czego drużyna potrzebuje dziś w szatni.',
      'Kilku zawodników rozgląda się po sobie. Taktyczne szczegóły nie trafiają w nastrój.',
      'Mniej emocji, więcej zimnej analizy. Nie wszyscy są na to gotowi.',
    ],
  },
};

// ─── GŁÓWNA KALKULACJA ─────────────────────────────────────────────────────────
export const WeeklyMotivationService = {

  canMotivate: (club: Club, currentDate: Date): boolean => {
    if (!club.lastMotivationDate) return true;
    const last = new Date(club.lastMotivationDate);
    const diffMs = currentDate.getTime() - last.getTime();
    return diffMs >= 7 * 24 * 60 * 60 * 1000;
  },

  buildContext: (club: Club, leaguePosition: number, teamCount: number): MotivationContext => {
    return {
      form: club.stats.form || [],
      leaguePosition,
      teamCount,
      matchesPlayed: club.stats.played || 0,
      currentMorale: club.morale ?? 50,
    };
  },

  calculate: (
    talk: MotivationTalkOption,
    ctx: MotivationContext,
    seed: number
  ): MotivationTalkResult => {

    const rng1 = seededRng(seed, 1);
    const rng2 = seededRng(seed, 2);
    const rng3 = seededRng(seed, 3);

    // ── 1. Faza sezonu ─────────────────────────────────────────────────────────
    const isSeasonStart = ctx.matchesPlayed < 5;
    const isSeasonEnd = ctx.matchesPlayed > 27;

    // ── 2. Forma ───────────────────────────────────────────────────────────────
    const recentForm = ctx.form.slice(-5);
    const wins = recentForm.filter(r => r === 'W').length;
    const losses = recentForm.filter(r => r === 'P').length;
    const goodForm = wins >= 3;
    const badForm = losses >= 3;

    // ── 3. Pozycja w tabeli ────────────────────────────────────────────────────
    const relegationZone = ctx.leaguePosition > ctx.teamCount - 3;
    const topPositions = ctx.leaguePosition <= 3;
    const midTable = !relegationZone && !topPositions;

    // ── 4. Aktualne morale ─────────────────────────────────────────────────────
    const lowMorale = ctx.currentMorale <= 35;
    const highMorale = ctx.currentMorale >= 65;

    // ── 5. Prawdopodobieństwo pozytywnego efektu per typ + kontekst ────────────
    let posChance = 0.5; // baza

    switch (talk.type) {
      case 'HONEST':
        // Szczerość działa lepiej gdy są problemy, gorzej gdy wszystko ok
        if (badForm || relegationZone) posChance = 0.65;
        else if (goodForm && topPositions) posChance = 0.40;
        else posChance = 0.55;
        break;
      case 'AGGRESSIVE':
        if (badForm || relegationZone) posChance = 0.60;
        else if (goodForm) posChance = 0.30;
        else posChance = 0.45;
        if (lowMorale) posChance -= 0.10; // przy niskim morale agresja może zaszkodzić
        break;
      case 'PRAISE':
        if (goodForm || topPositions) posChance = 0.75;
        else if (badForm && losses >= 4) posChance = 0.25; // pusta pochwała przy klęsce
        else posChance = 0.50;
        break;
      case 'DOUBT':
        if (badForm) posChance = 0.50; // mobilizuje gdy jest problem
        else if (goodForm) posChance = 0.30; // wątpliwości przy sukcesach psują nastrój
        else posChance = 0.40;
        break;
      case 'BELIEF':
        posChance = 0.60; // zawsze umiarkowanie pozytywne
        if (isSeasonStart) posChance = 0.55; // mniej meczów = mniej podstaw do wiary
        break;
      case 'OVERCONFIDENT':
        if (topPositions && goodForm) posChance = 0.50;
        else if (relegationZone || badForm) posChance = 0.25; // drużyna w kryzysie nie uwierzy
        else if (isSeasonStart) posChance = 0.45; // na początku można spróbować
        else posChance = 0.35;
        break;
      case 'CALM':
        if (highMorale) posChance = 0.65; // spokój utrzymuje dobre morale
        else if (lowMorale) posChance = 0.40; // za mało impulsu dla drużyny w kryzysie
        else posChance = 0.55;
        break;
      case 'CHALLENGE':
        if (isSeasonStart) posChance = 0.60; // na początku wyzwanie motywuje
        else if (lowMorale) posChance = 0.35; // przy niskim morale ryzykowne
        else if (midTable) posChance = 0.55;
        else posChance = 0.50;
        break;
      case 'UNITY':
        if (lowMorale || badForm) posChance = 0.65; // jedność działa gdy jest kryzys
        else posChance = 0.50;
        break;
      case 'PRESS':
        if (topPositions) posChance = 0.60; // kibice jako dodatkowa motywacja gdy wyniki dobre
        else if (relegationZone) posChance = 0.40; // presja kibiców może dobijać
        else posChance = 0.50;
        break;
      case 'HISTORY':
        if (badForm || relegationZone) posChance = 0.60; // historia mobilizuje w trudnych chwilach
        else posChance = 0.45;
        break;
      case 'SILENCE':
        posChance = 0.45; // zawsze neutralna, małe wahania
        break;
      case 'INDIVIDUAL':
        posChance = 0.60; // indywidualne podejście ogólnie skuteczne
        if (isSeasonStart) posChance = 0.65;
        break;
      case 'DEMAND':
        if (badForm && !lowMorale) posChance = 0.55; // twarde wymagania gdy jest baza morale
        else if (lowMorale) posChance = 0.30; // przy niskim morale może zniszczyć
        else if (goodForm) posChance = 0.50;
        else posChance = 0.45;
        break;
      case 'TACTICAL':
        posChance = 0.55;
        if (isSeasonEnd) posChance = 0.60; // pod koniec sezonu detale ważniejsze
        break;
    }

    // ── 6. Finalny rzut i wyliczenie delty ────────────────────────────────────
    const isPositive = rng1 < posChance;

    const { baseMin, baseMax } = talk;
    let delta: number;

    if (isPositive) {
      // Losujemy z górnej połowy zakresu
      const midpoint = (baseMin + baseMax) / 2;
      delta = midpoint + rng2 * (baseMax - midpoint);
    } else {
      // Losujemy z dolnej połowy zakresu
      const midpoint = (baseMin + baseMax) / 2;
      delta = baseMin + rng2 * (midpoint - baseMin);
    }

    delta = Math.round(delta);

    // ── 7. Tekst reakcji ──────────────────────────────────────────────────────
    const texts = isPositive
      ? REACTION_TEXTS[talk.type].positive
      : REACTION_TEXTS[talk.type].negative;
    const reactionText = texts[Math.floor(rng3 * texts.length)];

    return { moraleDelta: delta, reactionText, isPositive };
  },
};
