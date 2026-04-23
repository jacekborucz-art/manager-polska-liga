import { CommentaryCategory, CompetitionType } from '../types';

export interface CommentaryTemplate {
  id: string;
  speaker: string;
  category: CommentaryCategory;
  conditions: {
    competitionType?: CompetitionType;
    importanceTier?: number;
    tableGap?: 'CLOSE' | 'WIDE' | 'NONE';
    seasonPhase?: 'START' | 'MID' | 'END';
    underdog?: boolean;
    weather?: 'RAINY' | 'COLD' | 'WARM';
    rivalryTier?: 'RIVALRY' | 'RIVAL' | 'DERBY' | 'CLASSIC';
  };
  text: string;
}

export const PREMATCH_COMMENTARY_DB: CommentaryTemplate[] = [
  {
    id: 'intro_001',
    speaker: 'Mateusz Borek',
    category: CommentaryCategory.INTRO,
    conditions: {},
    text: 'Witamy panstwa bardzo serdecznie ze studia przedmeczowego. Dzisiejsze spotkanie {HOME} kontra {AWAY} zapowiada sie jako widowisko pelne energii, presji i taktycznych szachow. Na trybunach atmosfera rosnie z minuty na minute, a my za chwile przeanalizujemy najwazniejsze watki tego starcia. Obie druzyny maja swoje argumenty, ale tylko jedna narzuci wieczorem swoje warunki. To bedzie mecz, w ktorym liczyc sie beda detale, koncentracja i gotowosc do walki od pierwszego gwizdka. Zapraszamy na nasze studio i na wielkie pilkarskie emocje.'
  },
  {
    id: 'intro_002',
    speaker: 'Tomasz Smokowski',
    category: CommentaryCategory.INTRO,
    conditions: {},
    text: 'Dobry wieczor panstwu. Przed nami mecz, ktory bardzo mocno elektryzuje kibicow obu zespolow, bo {HOME} podejmuje dzisiaj {AWAY}. Sklady sa juz gotowe, trenerzy podjeli decyzje i za chwile zobaczymy, kto lepiej wejdzie w to spotkanie. Przy takich wieczorach zawsze wraca pytanie o to, kto lepiej wytrzyma presje i kto szybciej zlapie swoj rytm. Wlasne boisko moze byc przewaga, ale goscie tez przyjechali tutaj po konkret. Za moment przechodzimy do analizy i sprawdzimy, gdzie ten mecz moze zostac rozstrzygniety.'
  },
  {
    id: 'intro_003',
    speaker: 'Mateusz Borek',
    category: CommentaryCategory.INTRO,
    conditions: { rivalryTier: 'RIVALRY' },
    text: 'Dzisiaj nie mowimy o zwyklym meczu ligowym, bo starcie {HOME} z {AWAY} to spotkanie, w ktorym historia, duma i emocje niosa sie po trybunach jeszcze na dlugo przed pierwszym gwizdkiem. To sa mecze, w ktorych kibice nie wybaczaja braku charakteru, a pilkarze od pierwszej minuty musza wejsc na najwyzszy poziom agresji sportowej i koncentracji. Od rana wokol stadionu slychac bylo jedno: ten wieczor ma dac odpowiedz, kto dzisiaj rzadzi w tej rywalizacji. Takie spotkania bardzo czesto wymykaja sie tabeli i aktualnej formie, bo tutaj liczy sie tez odpornosc psychiczna i gotowosc do walki o kazdy metr. Jezeli ktoras z druzyn nie udzwignie ciezaru chwili, zostanie dzisiaj brutalnie zweryfikowana. Zapinamy pasy, bo zapowiada sie widowisko, ktore kibice beda wspominac jeszcze dlugo po ostatnim gwizdku.'
  },
  {
    id: 'tact_001',
    speaker: 'Tomasz Hajto',
    category: CommentaryCategory.TACTICS,
    conditions: {},
    text: 'Tutaj nie ma co komplikowac. {HOME} musi bardzo dobrze zamknac srodek pola i nie pozwolic druzynie {AWAY} rozpedzic sie po odbiorze. Jezeli gospodarze odpuszcza pierwszy doskok, to goscie zaczna budowac przewage i przejma tempo meczu. Z drugiej strony przy takich ustawieniach bardzo wazna bedzie asekuracja bocznych sektorow, bo tam moze pojawic sie najwiecej wolnej przestrzeni. To bedzie spotkanie, w ktorym dobra organizacja bez pilki moze okazac sie wazniejsza niz sam procent posiadania. Jedna zla reakcja po stracie moze otworzyc ten mecz bardziej, niz trenerzy by chcieli.'
  },
  {
    id: 'tact_002',
    speaker: 'Andrzej Strejlau',
    category: CommentaryCategory.TACTICS,
    conditions: {},
    text: 'Najciekawsze bedzie to, jak oba zespoly ustawia sie po przejsciu z ataku do obrony. {HOME} lubi budowac akcje szeroko, ale to oznacza, ze po stracie trzeba bardzo szybko skrocic pole gry. {AWAY} ma natomiast potencjal, by wykorzystac kazda chwile zawahania i od razu wejsc w atak na wolna przestrzen. W takich meczach ogromne znaczenie ma synchronizacja miedzy liniami oraz umiejetnosc czytania gry bez pilki. Jezeli jedna z druzyn zacznie sie rozrywac na odcinki, rywal natychmiast to wykorzysta. Tu moze wygrac nie ten, kto dluzej utrzyma sie przy pilce, tylko ten, kto bedzie madrzejszy w kluczowych momentach.'
  },
  {
    id: 'tact_003',
    speaker: 'Jerzy Engel',
    category: CommentaryCategory.TACTICS,
    conditions: { importanceTier: 4 },
    text: 'Mecze o takim ciezarze gatunkowym wygrywa sie w glowach, ale plan taktyczny musi byc egzekwowany z chirurgiczna precyzja od pierwszej minuty. {HOME} ma argumenty, by przejac inicjatywe na bokach boiska, natomiast {AWAY} wyglada na zespol gotowy cierpiec w niskiej obronie i szukac jednej decydujacej sytuacji. Kluczowe bedzie to, jak napastnicy i srodkowi pomocnicy beda reagowac po zmianie faz gry. W spotkaniach tej rangi stale fragmenty potrafia zadecydowac o wszystkim, zwlaszcza kiedy margines bledu jest tak maly. Spodziewam sie ostroznego poczatku i bardzo wysokiej koncentracji po obu stronach. To bedzie test dojrzalosci dla obu tych druzyn.'
  },
  {
    id: 'tact_004',
    speaker: 'Tomasz Hajto',
    category: CommentaryCategory.TACTICS,
    conditions: { rivalryTier: 'RIVALRY' },
    text: 'W takich meczach trzeba odlozyc ladne gadanie na bok, bo tutaj wszystko zaczyna sie od mentalu i odwagi w pojedynkach. {HOME} i {AWAY} wiedza, ze przy tej temperaturze trybun jedno miekkie wejscie albo jeden spozniony doskok zostanie natychmiast odczytany jako slabosc. Dlatego spodziewam sie bardzo ostrej walki w srodku pola, wysokiego pressingu i prob narzucenia tonu meczu juz w pierwszych minutach. Kto pierwszy wygra serie stykowych pojedynkow, ten moze zyskac nie tylko przewage taktyczna, ale tez psychologiczna nad rywalem. Tu nie wystarczy miec plan na pilke, trzeba jeszcze pokazac, ze umiesz grac pod presja wrzasku z trybun i calej historii tego starcia. Wlasnie dlatego mecze najwiekszych wrogow tak czesto maja swoja osobna dynamike i wlasne prawa.'
  },
  {
    id: 'form_001',
    speaker: 'Artur Wichniarek',
    category: CommentaryCategory.FORM,
    conditions: {},
    text: 'Patrzac na ostatnie tygodnie, mozna znalezc argumenty po obu stronach. {HOME} ma swoje atuty w regularnosci i intensywnosci, natomiast {AWAY} pokazywal juz w tym sezonie, ze potrafi odpowiedziec po slabszym okresie. Forma jest wazna, ale liczy sie tez to, jak zespol reaguje pod presja i czy w odpowiednim momencie potrafi podkrecic tempo. Takie mecze bardzo czesto wygrywa ta druzyna, ktora lepiej wykorzysta swoj dobry fragment. Jesli ktoras ekipa dobrze wejdzie w pierwsze dwadziescia minut, moze ustawic sobie cale spotkanie. Dzisiaj nawet drobny impuls mentalny moze miec ogromne znaczenie.'
  },
  {
    id: 'form_002',
    speaker: 'Artur Wichniarek',
    category: CommentaryCategory.FORM,
    conditions: { rivalryTier: 'DERBY' },
    text: 'Przy derbach forma z ostatnich tygodni oczywiscie ma znaczenie, ale bardzo czesto schodzi na drugi plan, kiedy rusza mecz o dume miasta albo regionu. Tu nawet zawodnik po slabszym okresie potrafi wejsc na poziom, ktorego w normalnej kolejce by nie pokazal, bo adrenalina niesie go przez cale spotkanie. Z drugiej strony pilkarze w najlepszej dyspozycji tez potrafia sie zagotowac, jesli od pierwszego starcia nie wytrzymaja temperatury tego widowiska. Dlatego trenerzy {HOME} i {AWAY} beda patrzec nie tylko na forme sportowa, ale tez na to, kto mentalnie uniesie takie obciazenie. W derbach liczy sie cierpliwosc, wyrachowanie i umiejetnosc grania pod ogromnym cisnieniem. Jedna prowokacja albo jedna karta moze kompletnie przewrocic mecz.'
  },
  {
    id: 'inj_001',
    speaker: 'Jerzy Brzeczek',
    category: CommentaryCategory.INJURIES,
    conditions: { underdog: true },
    text: 'Sytuacja kadrowa gospodarzy nie jest idealna, a przy takim spotkaniu kazde oslabienie moze byc odczuwalne jeszcze mocniej. Brak kilku ogniw nie tylko zmienia uklad personalny, ale tez odbiera trenerowi czesc rozwiazan w trakcie meczu. Z drugiej strony takie wieczory tworza szanse dla pilkarzy z dalszego planu, ktorzy moga pokazac charakter i wejsc w role bohaterow. {AWAY} przyjezdza w mocnym zestawieniu, co tylko podnosi stopien trudnosci. Kluczowe bedzie zarzadzanie zmianami i rozlozenie sil na koncowke. Przy duzym tempie i presji kazdy detal medyczny moze miec znaczenie.'
  },
  {
    id: 'ref_001',
    speaker: 'Witt Zelasko',
    category: CommentaryCategory.REFEREE,
    conditions: {},
    text: 'Dzisiejszy sedzia, pan {REF_NAME}, to arbiter z duzym doswiadczeniem i mocnym charakterem. W meczach o wysokiej temperaturze bardzo wazne bedzie to, czy od poczatku nada jasny ton i nie pozwoli zawodnikom przesunac granicy za daleko. Obie druzyny musza uwazac na niepotrzebne dyskusje i emocjonalne reakcje, bo kartki moga szybko ustawic pewne pojedynki. W takich spotkaniach arbitrowi nie jest latwo, bo kazda decyzja jest natychmiast oceniana przez trybuny. Kluczem bedzie konsekwencja i spokoj. Jezeli sedzia utrzyma kontrole, widowisko tylko na tym skorzysta.'
  },
  {
    id: 'pred_001',
    speaker: 'Andrzej Juskowiak',
    category: CommentaryCategory.PREDICTION,
    conditions: {},
    text: 'Spodziewam sie meczu, w ktorym obie druzyny beda chcialy przejac inicjatywe, ale dlugo beda tez badac swoje reakcje. {HOME} ma atut wlasnego boiska i to zawsze robi roznice w takich spotkaniach, jednak {AWAY} niejednokrotnie pokazywal juz, ze potrafi funkcjonowac pod presja. Wiele bedzie zalezec od tego, kto pierwszy wykorzysta swoj moment i jak zespoly wejda w druga polowe. Nie zdziwi mnie mecz rozstrzygniety jednym golem albo jednym staly fragmentem. To jest typ spotkania, w ktorym cierpliwosc moze okazac sie najwieksza bronia. Jedno jest pewne: emocji nie zabraknie.'
  },
  {
    id: 'pred_002',
    speaker: 'Mateusz Borek',
    category: CommentaryCategory.PREDICTION,
    conditions: { importanceTier: 5 },
    text: 'Czuc w powietrzu cos wielkiego i to sa dokladnie te wieczory, dla ktorych kibice kochaja futbol. Kazda sekunda dekoncentracji moze dzisiaj kosztowac bardzo duzo, bo obie druzyny wiedza, jak wysoka jest stawka tego widowiska. Moje serce podpowiada otwarty mecz i duzo dramaturgii, ale glowa mowi, ze poczatek bedzie pelen ostroznosci i wzajemnego szacunku dla potencjalu rywala. Jesli spotkanie otworzy sie po pierwszej bramce, mozemy dostac prawdziwy rollercoaster emocji. Tu jest miejsce na bohaterow, ale tez na momenty, ktore beda analizowane jeszcze przez wiele dni. Zapowiada sie wielki wieczor pilki.'
  },
  {
    id: 'pred_003',
    speaker: 'Andrzej Juskowiak',
    category: CommentaryCategory.PREDICTION,
    conditions: { rivalryTier: 'RIVALRY' },
    text: 'Przed takimi spotkaniami bardzo trudno bawic sie w klasyczne typowanie, bo mecze najwiekszych rywali regularnie wymykaja sie logice i tabeli. Jedno jest pewne: kibice beda oczekiwac od {HOME} i {AWAY} pelnego poswiecenia, agresji sportowej i walki od pierwszej do ostatniej minuty. Kto lepiej opanuje emocje, ten zrobi dzisiaj wielki krok do zwyciestwa, bo przy takiej temperaturze trybun latwo stracic glowe po jednym ostrzejszym starciu. Spodziewam sie meczu, w ktorym bedzie malo miejsca i czasu, za to bardzo duzo pojedynkow, stykowych sytuacji i napiecia przy kazdej decyzji sedziego. Jesli padnie szybka bramka, stadion moze eksplodowac. A jesli wynik dlugo bedzie remisowy, koncowka zapowiada sie na prawdziwa wojne nerwow.'
  }
];
