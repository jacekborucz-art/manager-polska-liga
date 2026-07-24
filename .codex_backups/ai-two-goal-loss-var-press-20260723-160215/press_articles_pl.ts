export type PressVariant =
  | 'PRAGMATYK'
  | 'OPTYMISTA'
  | 'WIZJONER'
  | 'TWARDY_LIDER'
  | 'SHOWMAN'
  | 'ZBYT_DYPLOMATYCZNY'
  | 'ZBYTNI_OPTYMISTA'
  | 'ODMOWA_NEUTRALNA'
  | 'ODMOWA_NEGATYWNA'
  | 'ODMOWA_POZYTYWNA'
  | 'NIEPRZYCHYLNE_AUTORYTET'
  | 'NIEPRZYCHYLNE_SZATNIA'
  | 'NIEPRZYCHYLNE_KRYZYS'
  | 'PRZYCHYLNE_DOBRY_START'
  | 'PRZYCHYLNE_ZWYCIESKI_START'
  | 'PRZYCHYLNE_DOBRA_FORMA'
  | 'PRZYCHYLNE_SZATNIA'
  | 'PRZYCHYLNE_SLABY_OPTYMIZM'
  | 'PRZYCHYLNE_SLABY_SZATNIA'
  | 'PRZYCHYLNE_TRUDNY_OKRES'
  | 'TOTALNA_DEMOLKA'
  | 'TOTALNA_KOMPROMITACJA'
  | 'VAR_KONTROWERSJE'
  | 'CZERWONA_KARTKA_KONTROWERSJE'
  | 'NIEPRZYZNANY_KARNY_KONTROWERSJE'
  | 'NISKA_OCENA_SEDZIEGO';

export interface PressArticleContext {
  opponentName?: string;
  venueLabel?: string;
  latestResultType?: 'WIN' | 'DRAW' | 'LOSS';
  managerFullName?: string;
  seasonPhase?: 'EARLY' | 'MID' | 'LATE';
  varControversyTeamName?: string;
  redCardControversyTeamName?: string;
  penaltyNoCallControversyTeamName?: string;
  refereeName?: string;
  varControversyTeamRole?: 'gospodarzy' | 'gości';
}

export interface PressArticle {
  headline: (managerLastName: string, clubName: string, context?: PressArticleContext) => string;
  body: (managerLastName: string, clubName: string, context?: PressArticleContext) => string;
}

export const PRESS_ARTICLES: Record<PressVariant, PressArticle> = {
  PRAGMATYK: {
    headline: (m, c) => `${m} tonuje nastroje w ${c}. „Najpierw praca, później deklaracje"`,
    body: (m, c) =>
      `Nowy trener ${c} podczas pierwszych rozmów z mediami sprawiał wrażenie człowieka twardo stąpającego po ziemi. ${m} unikał wielkich obietnic i zamiast głośnych deklaracji mówił głównie o systematycznej pracy, organizacji oraz potrzebie spokojnego budowania zespołu.\n\nChoć część kibiców mogła oczekiwać bardziej zdecydowanych zapowiedzi, w klubie taki ton może być odebrany jako sygnał profesjonalnego podejścia. Nowy szkoleniowiec zdaje się nie ulegać emocjom początku sezonu i jasno komunikuje, że sukces będzie efektem procesu, a nie pojedynczych decyzji.\n\nPozostaje pytanie, czy cierpliwości wystarczy zarówno władzom klubu, jak i kibicom ${c}.`,
  },
  OPTYMISTA: {
    headline: (m, c) => `Duże ambicje ${m}. W ${c} wierzą w nowy początek`,
    body: (m, c) =>
      `Pierwsze wystąpienie medialne nowego szkoleniowca ${c} pozostawiło po sobie sporo optymizmu. ${m} nie ukrywał wiary w potencjał zespołu i wielokrotnie podkreślał, że klub może osiągnąć więcej, niż wielu dziś zakłada.\n\nNowy trener emanował spokojną pewnością siebie, przekonując, że odpowiednia organizacja i konsekwencja mogą szybko przynieść pozytywne efekty. Wśród kibiców da się wyczuć ostrożny entuzjazm, choć eksperci przypominają, że ambitne deklaracje bardzo szybko podlegają weryfikacji przez boisko.\n\nJedno jest pewne — wraz z przyjściem ${m} oczekiwania wokół ${c} wyraźnie wzrosły.`,
  },
  WIZJONER: {
    headline: (m, c) => `Nowa wizja dla ${c}. ${m} zapowiada zmiany`,
    body: (m, c) =>
      `Podczas pierwszej konferencji prasowej ${m} wielokrotnie mówił o długofalowej budowie zespołu, tożsamości gry oraz zmianie mentalności w ${c}. Nowy trener sprawia wrażenie szkoleniowca, który patrzy dalej niż najbliższe tygodnie.\n\nWypowiedzi nowego opiekuna zespołu sugerują, że klub może przejść stopniową transformację — zarówno pod względem stylu gry, jak i funkcjonowania szatni. Nie zabrakło także odniesień do rozwoju zawodników i budowy stabilnych fundamentów.\n\nPytanie pozostaje jedno: czy kibice oraz zarząd ${c} będą gotowi dać czas projektowi, którego efekty mogą nie przyjść natychmiast.`,
  },
  TWARDY_LIDER: {
    headline: (m, c) => `Nowe porządki w ${c}? ${m} stawia sprawę jasno`,
    body: (m, c) =>
      `Pierwsze wypowiedzi ${m} sugerują, że w ${c} może nadejść czas większych wymagań i dyscypliny. Nowy szkoleniowiec dużo mówił o odpowiedzialności, zaangażowaniu i konieczności codziennej pracy.\n\nChoć trener unikał personalnych deklaracji, między wierszami można było wyczytać, że miejsce w składzie nie będzie nikomu dane z góry. Wszystko wskazuje na to, że w drużynie zacznie obowiązywać jasna zasada: forma i podejście będą ważniejsze od nazwiska.\n\nTaki styl zarządzania może szybko uporządkować szatnię, choć równie łatwo doprowadzić do pierwszych napięć.`,
  },
  SHOWMAN: {
    headline: (m, c) => `Odważne słowa ${m}. Czy ${c} naprawdę stać na więcej?`,
    body: (m, c) =>
      `Nowy trener ${c} nie zamierza chować się za ostrożnymi deklaracjami. Już podczas pierwszych rozmów z mediami ${m} jasno dawał do zrozumienia, że wierzy w możliwości zespołu i nie boi się wysokich oczekiwań.\n\nPewność siebie szkoleniowca może imponować kibicom, ale jednocześnie automatycznie zwiększa presję przed startem sezonu. Futbol szybko rozlicza odważne zapowiedzi, dlatego pierwsze tygodnie pracy będą szczególnie uważnie obserwowane.\n\nJeśli wyniki szybko przyjdą, ${m} może stać się bohaterem trybun. Jeśli nie — media równie szybko przypomną pierwsze deklaracje.`,
  },
  ZBYT_DYPLOMATYCZNY: {
    headline: (m, c) => `Spokojny start ${m}. Ale jaki właściwie ma plan dla ${c}?`,
    body: (m, c) =>
      `Pierwsze wystąpienie nowego szkoleniowca ${c} pozostawiło po sobie mieszane odczucia. ${m} często unikał jednoznacznych deklaracji, podkreślając potrzebę czasu, analiz i spokojnej pracy.\n\nZ jednej strony można to odbierać jako rozsądek i ostrożność, z drugiej — część kibiców mogła liczyć na bardziej konkretne sygnały dotyczące przyszłości zespołu.\n\nCzy to przejaw profesjonalizmu i chłodnej kalkulacji, czy może brak wyraźnej wizji? Na odpowiedź przyjdzie jeszcze czas.`,
  },
  ZBYTNI_OPTYMISTA: {
    headline: (m, c) => `Za dużo wiary? ${m} wysoko ocenia możliwości ${c}`,
    body: (m, c) =>
      `Podczas pierwszych wywiadów nowy trener ${c} sprawiał wrażenie człowieka mocno przekonanego o potencjale obecnej kadry. ${m} wielokrotnie podkreślał, że drużyna może osiągnąć więcej, niż obecnie przewidują eksperci.\n\nTaki optymizm może budować morale wokół zespołu, ale równocześnie niesie ryzyko zwiększenia oczekiwań jeszcze przed pierwszym gwizdkiem sezonu. Kibice z pewnością chcą wierzyć w ambitny projekt, choć futbol nieraz pokazał, że nadmierna pewność siebie szybko zostaje zweryfikowana.\n\nPierwsze kolejki pokażą, czy szkoleniowiec trafnie ocenił potencjał ${c}.`,
  },
  ODMOWA_NEUTRALNA: {
    headline: (m, c) => `${m} bez konferencji. Trener skupia się na pracy w ${c}`,
    body: (m, c) =>
      `Nowy szkoleniowiec ${c} zdecydował się nie udzielać szerszych wypowiedzi mediom po objęciu stanowiska. Klub poinformował jedynie, że ${m} chce w pierwszych dniach w pełni skoncentrować się na poznaniu drużyny oraz przygotowaniach do sezonu.\n\nChoć część kibiców liczyła na pierwsze deklaracje i poznanie wizji nowego szkoleniowca, inni podchodzą do decyzji ze zrozumieniem. W końcu w futbolu najważniejsze odpowiedzi i tak padają na boisku.\n\nW najbliższych tygodniach oczy kibiców będą zwrócone przede wszystkim na pierwsze decyzje nowego sztabu.`,
  },
  ODMOWA_NEGATYWNA: {
    headline: (m, c) => `Milczenie ${m}. Dlaczego nowy trener ${c} unika pytań?`,
    body: (m, c) =>
      `Objęcie stanowiska przez nowego szkoleniowca ${c} miało być początkiem nowego rozdziału, jednak kibice wciąż nie poznali wizji ${m}. Trener odmówił udziału w szerszych rozmowach z mediami, pozostawiając więcej pytań niż odpowiedzi.\n\nCzy to chłodna kalkulacja i pełne skupienie na pracy, czy może ostrożność wynikająca z trudnej sytuacji klubu? Tego dziś nie wiadomo.\n\nJedno jest pewne — brak deklaracji oznacza, że oczekiwania wobec pierwszych meczów będą jeszcze większe.`,
  },
  ODMOWA_POZYTYWNA: {
    headline: (m, c) => `${m} stawia na ciszę przed sezonem. „Najpierw praca, później słowa”`,
    body: (m, c) =>
      `Bez wielkich deklaracji, bez medialnych obietnic i bez głośnych zapowiedzi — tak rozpoczął pracę w ${c} nowy trener ${m}. Szkoleniowiec zdecydował się ograniczyć kontakty z mediami, koncentrując się na pierwszych tygodniach pracy z zespołem.\n\nTaka postawa może sugerować pragmatyczne podejście oraz chęć uniknięcia niepotrzebnej presji przed startem sezonu. W środowisku piłkarskim nie brakuje trenerów, którzy wolą mówić wynikami niż słowami.\n\nKibice z pewnością szybko ocenią, czy milczenie nowego szkoleniowca było częścią dobrze przemyślanego planu.`,
  },
  NIEPRZYCHYLNE_AUTORYTET: {
    headline: (m, c) => `Pierwsze zgrzyty w ${c}? Nie wszyscy mają być przekonani do metod ${m}`,
    body: (m, c) =>
      `Choć od objęcia stanowiska przez ${m} minęło niewiele czasu, wokół ${c} zaczynają pojawiać się pierwsze pytania dotyczące atmosfery w szatni.\n\nWedług informacji docierających do naszej redakcji część zawodników ma nie być w pełni przekonana do nowych metod pracy oraz zmian wprowadzanych przez sztab szkoleniowy. Nie chodzi jeszcze o otwarty konflikt, ale — jak słyszymy — nie wszyscy równie entuzjastycznie przyjęli nowy porządek.\n\nW klubie oficjalnie nikt problemu nie dostrzega. Jednak jeśli wyniki szybko nie przyjdą, takie sygnały mogą zacząć narastać.`,
  },
  NIEPRZYCHYLNE_SZATNIA: {
    headline: (_m, c) => `Dwie grupy w szatni ${c}? Atmosfera wokół zespołu budzi pytania`,
    body: (m, c) =>
      `Coraz częściej mówi się, że w ${c} nie wszystko wygląda tak spokojnie, jak mogłoby się wydawać z zewnątrz. Według nieoficjalnych informacji w drużynie mają pojawiać się różnice zdań dotyczące kierunku, w którym zmierza zespół pod wodzą ${m}.\n\nCzęść piłkarzy ma pozytywnie oceniać nowe standardy pracy i większe wymagania, jednak inni — jak słyszymy — podchodzą do zmian znacznie bardziej sceptycznie.\n\nNa tym etapie trudno mówić o kryzysie, ale pytanie o jedność szatni może wracać coraz częściej, szczególnie jeśli wyniki nie będą satysfakcjonujące.`,
  },
  NIEPRZYCHYLNE_KRYZYS: {
    headline: (m, c) => `Nerwowo w ${c}? Coraz więcej pytań o atmosferę wokół ${m}`,
    body: (m, c) =>
      `Choć sezon dopiero nabiera rozpędu, wokół ${c} zaczyna robić się coraz bardziej nerwowo. Nieoficjalnie mówi się o rosnącym napięciu w szatni oraz zawodnikach, którzy nie do końca rozumieją decyzje podejmowane przez ${m}.\n\nW ostatnich dniach pojawiają się także głosy, że część bardziej doświadczonych piłkarzy nie jest zachwycona zmianami dotyczącymi treningów oraz zarządzania zespołem.\n\nOczywiście w klubie nikt publicznie nie mówi o problemach. Ale w futbolu plotki rzadko pojawiają się bez powodu — szczególnie wtedy, gdy wyniki nie idą w parze z oczekiwaniami.`,
  },
  PRZYCHYLNE_DOBRY_START: {
    headline: (m, c) => `Udany początek ${m}. W ${c} czuć nową energię`,
    body: (_m, c) =>
      `Pierwsze tygodnie pracy zdają się przynosić pozytywne efekty. Według informacji z otoczenia klubu atmosfera w zespole ma być bardzo dobra, a zawodnicy pozytywnie reagują na nowe metody pracy.\n\nW szatni mówi się o większej organizacji, jasnych zasadach i rosnącym przekonaniu, że drużyna może zrobić krok naprzód względem poprzedniego sezonu. Co ważne, sztab szkoleniowy ma cieszyć się zaufaniem zarówno bardziej doświadczonych piłkarzy, jak i młodszych zawodników.\n\nChoć sezon dopiero się rozpoczyna, wokół ${c} coraz częściej pojawia się słowo: stabilizacja.`,
  },
  PRZYCHYLNE_ZWYCIESKI_START: {
    headline: (m, _c, context) => `Obiecujący początek ${m}. Wygrana z ${context?.opponentName ?? 'rywalem'} daje nadzieję kibicom`,
    body: (m, c, context) =>
      `Lepszego początku trudno było sobie wymarzyć. ${c} pod wodzą ${m} rozpoczęła nowy etap od zwycięstwa nad ${context?.opponentName ?? 'rywalem'} ${context?.venueLabel ?? 'w lidze'}, a wokół zespołu wyraźnie poprawiły się nastroje.\n\nChoć to dopiero pierwszy ważniejszy sprawdzian nowego szkoleniowca, kibice mają powody do umiarkowanego optymizmu. Drużyna wyglądała na dobrze przygotowaną, zaangażowaną i przede wszystkim pewną swoich założeń.\n\nSam trener studzi emocje, ale trudno nie zauważyć, że pierwsze tygodnie pracy w ${c} mogą budować solidny fundament pod dalszy rozwój.`,
  },
  PRZYCHYLNE_DOBRA_FORMA: {
    headline: (m, _c, context) =>
      context?.latestResultType === 'WIN'
        ? `${m} łapie rytm. Wygrana z ${context?.opponentName ?? 'rywalem'} wzmacnia wiarę kibiców`
        : `${m} łapie rytm. Wynik z ${context?.opponentName ?? 'rywalem'} potwierdza stabilizację`,
    body: (m, c, context) => {
      const closingLine = context?.seasonPhase === 'LATE'
        ? `Sam trener zachowuje ostrożność, ale wokół ${c} da się wyczuć przekonanie, że zespół może podejść do finiszu sezonu z większą pewnością siebie.`
        : `Sam trener zachowuje ostrożność, ale wokół ${c} da się wyczuć przekonanie, że zespół może wejść w drugą część sezonu z większą pewnością siebie.`;

      return context?.latestResultType === 'WIN'
        ? `${c} pod wodzą ${m} dopisała kolejne ważne zwycięstwo, pokonując ${context?.opponentName ?? 'rywala'} ${context?.venueLabel ?? 'w lidze'}. Po wielu tygodniach pracy coraz wyraźniej widać, że zespół ma własny rytm i coraz lepiej rozumie założenia sztabu.\n\nTo nie jest już etap pierwszych wrażeń, lecz moment, w którym kibice zaczynają oceniać drużynę przez pryzmat regularności. Ostatni wynik daje argumenty tym, którzy uważają, że obrany kierunek przynosi konkretne efekty.\n\n${closingLine}`
        : `${c} pod wodzą ${m} utrzymała pozytywny rytm w meczu z ${context?.opponentName ?? 'rywalem'} ${context?.venueLabel ?? 'w lidze'}. Choć tym razem nie udało się dopisać kompletu punktów, po wielu tygodniach pracy coraz wyraźniej widać, że zespół lepiej rozumie założenia sztabu.\n\nTo nie jest już etap pierwszych wrażeń, lecz moment, w którym kibice zaczynają oceniać drużynę przez pryzmat regularności. Ostatni wynik nie zamyka dyskusji, ale daje argumenty tym, którzy uważają, że obrany kierunek przynosi konkretne efekty.\n\n${closingLine}`;
    },
  },
  PRZYCHYLNE_SZATNIA: {
    headline: (m, c) => `Piłkarze po stronie ${m}. W ${c} mówi się o bardzo dobrej atmosferze`,
    body: (m, c) =>
      `Coraz więcej sygnałów wskazuje na to, że ${m} bardzo szybko zyskał zaufanie szatni ${c}. Według osób zbliżonych do klubu zawodnicy mają pozytywnie oceniać komunikację nowego szkoleniowca oraz sposób prowadzenia drużyny.\n\nWewnątrz zespołu ma panować dobra atmosfera, a piłkarze doceniają jasne zasady oraz większą przejrzystość w podejmowaniu decyzji. Co istotne, nie słychać o większych napięciach czy niezadowoleniu wśród liderów drużyny.\n\nOczywiście najlepszą oceną pozostaną wyniki, jednak początek pracy ${m} może napawać kibiców ${c} ostrożnym optymizmem.`,
  },
  PRZYCHYLNE_SLABY_OPTYMIZM: {
    headline: (m) => `Wyniki jeszcze nie przyszły, ale są pozytywne sygnały dla ${m}`,
    body: (m, c) =>
      `Choć pierwsze rezultaty ${c} pod wodzą ${m} mogą pozostawiać niedosyt, nie brakuje opinii, że obraz gry wygląda lepiej, niż sugeruje tabela.\n\nW kilku spotkaniach drużyna miała momenty dobrej organizacji, większej intensywności oraz odwagi w grze. Problemem pozostaje skuteczność i brak stabilności, ale część obserwatorów zwraca uwagę, że fundamenty pod poprawę mogą już być widoczne.\n\nW piłce nożnej nie zawsze pierwsze tygodnie oddają realny potencjał projektu. W ${c} wciąż wierzą, że cierpliwość może się opłacić.`,
  },
  PRZYCHYLNE_SLABY_SZATNIA: {
    headline: (m, c) => `Mimo słabego startu szatnia wspiera ${m}. W ${c} nie ma paniki`,
    body: (m, c) =>
      `Słabszy początek sezonu nie musi oznaczać kryzysu. Według informacji z otoczenia ${c} nowy trener ${m} nadal cieszy się dużym wsparciem ze strony zawodników.\n\nW klubie ma panować przekonanie, że obecne problemy wynikają bardziej z czasu potrzebnego na wdrożenie nowych rozwiązań niż głębszych problemów wewnątrz drużyny. Piłkarze podobno pozytywnie oceniają komunikację sztabu oraz codzienną organizację pracy.\n\nOczywiście cierpliwość w futbolu ma swoje granice, ale na dziś w ${c} nie widać oznak większej nerwowości.`,
  },
  PRZYCHYLNE_TRUDNY_OKRES: {
    headline: (m, c) => `${c} bez fajerwerków, ale wokół ${m} wciąż widać spokój`,
    body: (m, c) =>
      `Ostatnie wyniki ${c} nie dają powodów do pełnej satysfakcji, ale w klubie nie widać atmosfery paniki. Według osób zbliżonych do drużyny ${m} nadal ma wsparcie szatni, a zawodnicy wierzą, że konsekwencja w pracy może przełożyć się na stabilniejszą formę.\n\nKibice oczekiwaliby zapewne większej regularności, zwłaszcza na tym etapie sezonu, jednak obraz gry nie jest jednoznacznie negatywny. Zespół ma fragmenty dobrej organizacji, choć wciąż brakuje mu skuteczności i spokojniejszego domykania spotkań.\n\nNajbliższe tygodnie pokażą, czy ${c} potrafi zamienić cierpliwość w punkty, ale na razie projekt nie wygląda na taki, który traci zaufanie od środka.`,
  },
  TOTALNA_DEMOLKA: {
    headline: () => 'TOTALNA DEMOLKA! RYWAL BEZ ŻADNYCH SZANS',
    body: (_m, c) =>
      `Drużyna ${c} urządziła rywalom prawdziwy piłkarski nokaut. Od pierwszego gwizdka całkowicie zdominowała wydarzenia na boisku, bezlitośnie wykorzystywała kolejne błędy przeciwnika i raz za razem trafiała do siatki.\n\nRywal nie był w stanie znaleźć żadnej odpowiedzi na tempo, skuteczność i ofensywną siłę zespołu. Kolejne bramki tylko potwierdzały ogromną różnicę klas, a końcowy wynik nie pozostawia żadnych wątpliwości — tego dnia na boisku istniała tylko jedna drużyna.\n\nTo nie było zwykłe zwycięstwo. To była demonstracja siły, bezwzględna dominacja i totalna demolka przeciwnika.`,
  },
  TOTALNA_KOMPROMITACJA: {
    headline: (m, _c, context) =>
      `TOTALNA KOMPROMITACJA! DRUŻYNA ${context?.managerFullName ?? m} ROZBITA NA BOISKU`,
    body: (m, _c, context) => {
      const managerFullName = context?.managerFullName ?? m;
      return `Drużyna prowadzona przez ${managerFullName} poniosła druzgocącą porażkę, prezentując się zdecydowanie poniżej oczekiwań. Od pierwszych minut rywale przejęli pełną kontrolę nad spotkaniem, bezlitośnie wykorzystywali kolejne błędy i raz za razem trafiali do siatki.\n\nZespół ${m} nie potrafił znaleźć żadnej odpowiedzi na przewagę przeciwnika. Brak organizacji, nieskuteczna gra oraz poważne problemy w defensywie sprawiły, że różnica między drużynami z każdą kolejną minutą stawała się coraz bardziej widoczna.\n\nKońcowy wynik nie pozostawia miejsca na wymówki. To nie była zwykła porażka — to był piłkarski nokaut i totalna kompromitacja drużyny prowadzonej przez ${managerFullName}.`;
    },
  },
  VAR_KONTROWERSJE: {
    headline: (_m, _c, context) =>
      `Kontrowersje po meczu z ${context?.opponentName ?? 'rywalem'}. VAR znów w centrum uwagi`,
    body: (_m, _c, context) => {
      const teamName = context?.varControversyTeamName ?? 'jedna z drużyn';
      const teamRole = context?.varControversyTeamRole ?? 'gospodarzy';
      return `Spotkanie zakończyło się w atmosferze dużych kontrowersji związanych z decyzjami sędziego. Drużyna ${teamName} nie mogła pogodzić się z nieuznaniem zdobytej bramki, mimo że sytuacja została przeanalizowana z wykorzystaniem systemu VAR. Sztab szkoleniowy oraz zawodnicy ${teamRole} otwarcie protestowali przeciwko tej decyzji, podkreślając, że ich zdaniem gol powinien zostać uznany.\n\nCała sytuacja wywołała wiele emocji zarówno na boisku, jak i na trybunach, a decyzja arbitra miała znaczący wpływ na przebieg oraz końcowy wynik spotkania. Kontrowersje związane z pracą zespołu sędziowskiego z pewnością będą jeszcze długo komentowane przez ekspertów i kibiców.`;
    },
  },
  CZERWONA_KARTKA_KONTROWERSJE: {
    headline: (_m, _c, context) =>
      `Kontrowersyjna czerwona kartka w meczu z ${context?.opponentName ?? 'rywalem'}`,
    body: (_m, _c, context) => {
      const teamName = context?.redCardControversyTeamName ?? 'drużyny rywali';
      return `Spotkanie zakończyło się w atmosferze dużych emocji po kontrowersyjnej decyzji sędziego o pokazaniu czerwonej kartki zawodnikowi drużyny ${teamName}. Decyzja arbitra znacząco wpłynęła na przebieg meczu, zmuszając zespół do gry w osłabieniu przez znaczną część spotkania.\n\nSztab szkoleniowy oraz piłkarze drużyny ${teamName} nie kryli swojego niezadowolenia z decyzji sędziego, argumentując, że wykluczenie było zbyt surowe. Gra w osłabieniu wyraźnie utrudniła realizację założeń taktycznych, co zostało wykorzystane przez rywali i miało istotny wpływ na końcowy rezultat spotkania.`;
    },
  },
  NIEPRZYZNANY_KARNY_KONTROWERSJE: {
    headline: (_m, _c, context) =>
      `Karny, który mógł odmienić losy meczu z ${context?.opponentName ?? 'rywalem'}`,
    body: (_m, _c, context) => {
      const teamName = context?.penaltyNoCallControversyTeamName ?? 'drużyny rywali';
      return `Spotkanie zakończyło się w cieniu kontrowersyjnej decyzji sędziego, który nie podyktował rzutu karnego dla drużyny ${teamName} mimo protestów zawodników i sztabu szkoleniowego. Arbiter przeanalizował całą sytuację z wykorzystaniem systemu VAR, jednak podtrzymał swoją pierwotną decyzję.\n\nNieprzyznanie rzutu karnego wywołało wiele emocji zarówno na boisku, jak i na trybunach. Przedstawiciele drużyny ${teamName} przekonywali, że ich zespół został pozbawiony znakomitej okazji do zdobycia bramki, a decyzja sędziego mogła mieć istotny wpływ na przebieg oraz końcowy rezultat spotkania.`;
    },
  },
  NISKA_OCENA_SEDZIEGO: {
    headline: (_m, _c, context) =>
      `Praca arbitra po meczu z ${context?.opponentName ?? 'rywalem'} pod lupą ekspertów`,
    body: (_m, _c, context) => {
      const refereeLead = context?.refereeName ? `Sędzia ${context.refereeName}` : 'Arbiter';
      return `Spotkanie obfitowało w kontrowersje związane z pracą zespołu sędziowskiego. ${refereeLead} przez większą część meczu miał wyraźne problemy z utrzymaniem kontroli nad wydarzeniami na boisku, a jego decyzje wielokrotnie spotykały się z protestami zawodników i sztabów obu drużyn.\n\nZdaniem wielu obserwatorów kilka kluczowych decyzji sędziego miało wpływ na przebieg spotkania, co dodatkowo podgrzało atmosferę rywalizacji. Liczne przerwy, dyskusje z piłkarzami oraz narastające napięcie sprawiły, że praca arbitra stała się jednym z głównych tematów pomeczowych analiz.`;
    },
  },
};
