
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState } from '../../types';

type ManualCategory = 'INTRO' | 'ENGINE' | 'CUP_LOGIC' | 'TACTICS' | 'PLAYERS' | 'MINDSET' | 'REFEREE' | 'LEAGUE' | 'MATCHDAY' | 'FINANCE' | 'CONTRACTS' | 'INJURIES' | 'TRAINING' | 'CALENDAR' | 'TIPS';

const PLAYER_ATTRIBUTE_GROUPS = [
  {
    title: 'Fundament Fizyczny',
    items: [
      {
        label: 'Szybkość (Pace)',
        description: 'Napędza sprint, kontratak i asekurację przy wysokiej linii. Jest ważna nie tylko dla skrzydeł i napastników, ale też dla obrońców ścigających piłkę za plecy.',
      },
      {
        label: 'Kondycja (Stamina)',
        description: 'Spowalnia spadek energii w meczu i pod pressingiem. Najmocniej czuć ją u pomocników, bo ta pozycja zużywa się najszybciej.',
      },
      {
        label: 'Siła (Strength)',
        description: 'Pomaga w bark w bark, utrzymaniu pozycji i walce o drugą piłkę. Dla stoperów i napastników to fundament gry kontaktowej.',
      },
    ],
  },
  {
    title: 'Obrona, Intensywność i Gra Bez Piłki',
    items: [
      {
        label: 'Obrona (Defending)',
        description: 'Podnosi jakość odbioru i krycia. W defensywnych ustawieniach ma bezpośredni wpływ na to, czy zespół odzyskuje kontrolę bez fauli i chaosu.',
      },
      {
        label: 'Ustawianie się (Positioning)',
        description: 'Jeden z najbardziej uniwersalnych atrybutów w grze. Obrońca zamyka linie podań, napastnik lepiej atakuje wolne strefy, a bramkarz skuteczniej skraca kąt.',
      },
      {
        label: 'Gra głową (Heading)',
        description: 'Ważna przy stałych fragmentach, długich piłkach i obronie własnego pola karnego. W połączeniu z siłą buduje dominację w powietrzu.',
      },
      {
        label: 'Pracowitość (Work Rate)',
        description: 'Wpływa na pressing, aktywność bez piłki i intensywność gry. Jest bardzo cenna w wysokim pressingu, kontrataku i dla liderów nadających tempo zespołowi.',
      },
      {
        label: 'Agresja (Aggression)',
        description: 'Podkręca zaciekłość odbioru i pressingu. Daje przewagę w twardych meczach, ale przy surowym arbitrze i dużym zmęczeniu zamienia się w ryzyko kartek.',
      },
    ],
  },
  {
    title: 'Technika i Kreacja',
    items: [
      {
        label: 'Podania (Passing)',
        description: 'Trzon budowania akcji. Silnik używa podań w wyjściu spod pressingu, progresji akcji i jakości rozegrania, więc słabe podanie psuje całą strukturę.',
      },
      {
        label: 'Technika (Technique)',
        description: 'Zmniejsza ryzyko błędu technicznego i poprawia kontrolę piłki. To też ważna część krótkiego i długiego rozegrania, zwłaszcza przy grze kombinacyjnej.',
      },
      {
        label: 'Wizja (Vision)',
        description: 'Decyduje, czy zawodnik zobaczy podanie przed resztą boiska. Bardzo mocna dla rozgrywających, nowoczesnych bramkarzy i przy tempie opartym na cierpliwości.',
      },
      {
        label: 'Drybling (Dribbling)',
        description: 'Podnosi jakość prowadzenia piłki, wyjść 1 na 1 i minięcia pierwszej linii pressingu. U skrzydłowych i ofensywnych pomocników robi realny bałagan w obronie rywala.',
      },
      {
        label: 'Dośrodkowania (Crossing)',
        description: 'Kluczowe przy grze skrzydłami, długim rozegraniu i stałych fragmentach z bocznych sektorów. Bez jakości na wrzutce nawet wysocy napastnicy nie dostaną piłki na czas.',
      },
    ],
  },
  {
    title: 'Atak i Stałe Fragmenty',
    items: [
      {
        label: 'Atak (Attacking)',
        description: 'To inteligencja ofensywna i zachowanie w polu karnym. Wspiera liczenie siły ataku drużyny, ruch bez piłki i jakość finalnej fazy akcji.',
      },
      {
        label: 'Wykończenie (Finishing)',
        description: 'Najmocniejszy surowy atrybut snajpera. Bezpośrednio podnosi jakość strzału, jest premiowany po zdobywaniu goli i ma znaczenie przy jedenastkach.',
      },
      {
        label: 'Rzuty wolne (Free Kicks)',
        description: 'Specjalistyczny parametr od uderzeń z dystansu i stałych fragmentów. W połączeniu z techniką, podaniem i wizją buduje prawdziwego wykonawcę.',
      },
      {
        label: 'Rzuty karne (Penalties)',
        description: 'Najważniejszy parametr przy jedenastkach. Pomagają mu wykończenie, technika i mentalność, ale to właśnie karne są bazą przy wyborze etatowego strzelca.',
      },
      {
        label: 'Rzuty rożne (Corners)',
        description: 'Nie pompują mocno OVR, ale potrafią dać kilka bramek w sezonie. Im wyższe rożne i dośrodkowania, tym większa wartość z wysokich stoperów i napastników.',
      },
    ],
  },
  {
    title: 'Mental, Liderzy i Specjalizacje',
    items: [
      {
        label: 'Mentalność (Mentality)',
        description: 'Stabilizuje reakcję pod presją, pomaga w momentum i wspiera specjalistów od karnych, bramkarzy oraz liderów szatni. To atrybut od nerwów i koncentracji.',
      },
      {
        label: 'Przywództwo (Leadership)',
        description: 'Kluczowe przy wyborze kapitana i odporności drużyny na wahania. Nie zawsze błyszczy w OVR, ale realnie wzmacnia strukturę zespołu.',
      },
      {
        label: 'Bramkarstwo (Goalkeeping)',
        description: 'Podstawowy atrybut golkipera i najcięższa waga w jego OVR. U zawodników z pola praktycznie nie ma znaczenia, bo silnik generuje im tę statystykę bardzo nisko.',
      },
      {
        label: 'Talent (Talent)',
        description: 'Nie wchodzi bezpośrednio do OVR, ale mocno steruje rozwojem i wartością rynkową. To najważniejszy długoterminowy wskaźnik przy młodych zawodnikach i akademii.',
      },
    ],
  },
] as const;

const PLAYER_OVR_PROFILES = [
  {
    position: 'GK',
    label: 'Bramkarz',
    formula: 'BR 85% • UST 10% • POD 5%',
    note: 'U bramkarza liczy się przede wszystkim gra na bramce. Pozycjonowanie i podanie są dodatkiem, ale mogą odróżnić zwykłego golkipera od nowoczesnej jedynki.',
  },
  {
    position: 'DEF',
    label: 'Obrońca',
    formula: 'OBR 35% • UST 20% • SIŁ 15% • GŁ 10% • SZYB 10% • POD 10%',
    note: 'Dobry obrońca to nie tylko sam odbiór. Ustawienie, siła i gra głową są dla systemu równie ważne, szczególnie przy bronieniu pola karnego.',
  },
  {
    position: 'MID',
    label: 'Pomocnik',
    formula: 'POD 30% • WIZ 20% • TEC 15% • DRY 10% • OBR 10% • KON 10% • ATAK 5%',
    note: 'Pomocnik jest najbardziej złożony. Podanie i wizja budują fundament, ale bez techniki, biegania i odrobiny defensywy środek pola zacznie pękać.',
  },
  {
    position: 'FWD',
    label: 'Napastnik',
    formula: 'WYK 35% • ATAK 25% • SZYB 15% • DRY 10% • GŁ 10% • SIŁ 5%',
    note: 'Napastnik żyje z wykończenia i ruchu w ataku. Szybkość, drybling i gra głową są wzmacniaczami stylu, nie zamiennikiem instynktu.',
  },
] as const;

const PLAYER_DEVELOPMENT_RULES = [
  {
    title: 'Bazowa szansa wzrostu',
    text: 'Każdy trenowalny atrybut ma bazowo 2% szans tygodniowo na wzrost w pierwszej drużynie i 1.5% w rezerwach. To tylko start, bo dalej wchodzą trening, forma, talent i wiek.',
  },
  {
    title: 'Intensywność treningu',
    text: 'Heavy mnoży rozwój x1.8, Normal zostawia x1.0, a Light tnie go do x0.5. Mocniejszy bodziec przyspiesza wzrost, ale zwiększa też ryzyko przeciążenia i utraty świeżości.',
  },
  {
    title: 'Plan treningowy i focus',
    text: 'Atrybut główny cyklu dostaje +0.08 do szansy wzrostu, poboczny +0.04, a indywidualny trainingFocus kolejne +0.06. Najszybciej rosną więc gracze z dobrze dopiętym planem.',
  },
  {
    title: 'Minuty i występy',
    text: 'Samo granie daje +0.02. Ocena 7.5+ dorzuca +0.05, a występ 9.0+ kolejne +0.10. Napastnik po golu dostaje bonus do wykończenia, a bramkarz po czystym koncie bonus do bramkarstwa.',
  },
  {
    title: 'Talent i wiek',
    text: 'Talent działa jak mnożnik 0.70-1.30 do rozwoju. Zawodnicy poniżej 21 lat rosną szybciej, a po 32. roku życia rozwój mocno hamuje. W rezerwach młodzi dostają jeszcze większy bonus.',
  },
  {
    title: 'Regres i starzenie',
    text: 'Każdy atrybut może też spadać. Fizyczne statystyki lecą najszybciej, mentalne najwolniej. Po trzydziestce regres rośnie co sezon, a brak minut dodatkowo przyspiesza zużycie starszych zawodników.',
  },
  {
    title: 'Twarde limity sezonowe',
    text: 'Silnik trzyma limit maksymalnie +3 i -3 na atrybut w sezonie. Dzięki temu nie ma absurdalnych eksplozji ani kompletnego załamania formy po jednym miesiącu.',
  },
  {
    title: 'Czego nie wytrenujesz tak samo',
    text: 'Talent nie jest zwykłym atrybutem treningowym i nie podnosi OVR bezpośrednio. To parametr strategiczny: mówi, jak wysoki jest sufit gracza i jak bardzo opłaca się inwestować w jego minuty.',
  },
] as const;

const PLAYER_TRAINING_CYCLES = [
  'Periodyzacja Taktyczna: wizja, ustawianie się, podania, technika, mentalność.',
  'Gegenpressing i Wysoki Pressing: kondycja, szybkość, pracowitość, agresja, obrona.',
  'Szkoła Techniczna: podania, technika, drybling, wizja, dośrodkowania.',
  'Blok Defensywny i Dominacja w Powietrzu: obrona, siła, ustawianie, gra głową.',
  'Instynkt Snajperski i Kontratak: wykończenie, atak, szybkość, pracowitość.',
  'Nowoczesny Bramkarz i Stałe Fragmenty: bramkarstwo, ustawianie, wolne, rożne, karne.',
] as const;

export const GameManual: React.FC = () => {
  const { navigateTo, previousViewState } = useGame();
  const [activeTab, setActiveTab] = useState<ManualCategory>('INTRO');

  const categories: { id: ManualCategory; label: string; icon: string }[] = [
    { id: 'INTRO', label: 'Wstęp i Świat', icon: '🌍' },
    { id: 'ENGINE', label: 'Silnik Momentum', icon: '⚙️' },
    { id: 'CUP_LOGIC', label: 'Symulacja Meczu', icon: '🏆' },
    { id: 'TACTICS', label: 'Encyklopedia Taktyki', icon: '📋' },
    { id: 'PLAYERS', label: 'Atrybuty i Rozwój', icon: '👕' },
    { id: 'MINDSET', label: 'Morale i Mindset', icon: 'M' },
    { id: 'INJURIES', label: 'Kontuzje i Regeneracja', icon: '🏥' },
    { id: 'TRAINING', label: 'Trening i Rozwój', icon: '🎯' },
    { id: 'FINANCE', label: 'Finanse Klubu i Transfery', icon: '💰' },
    { id: 'CONTRACTS', label: 'Negocjacje Kontraktowe', icon: '📝' },
    { id: 'REFEREE', label: 'Kolegium Sędziów', icon: '⚖️' },
    { id: 'LEAGUE', label: 'Zasady i Kariera', icon: '📊' },
    { id: 'CALENDAR', label: 'Kalendarz Sezonu', icon: '📅' },
    { id: 'MATCHDAY', label: 'Dzień Meczowy', icon: '⚽' },
    { id: 'TIPS', label: 'Sekrety Pro', icon: '💡' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'INTRO':
        return (
          <div className="space-y-12 animate-fade-in pb-20">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-[45px] shadow-2xl relative overflow-hidden">
               <div className="absolute right-[-40px] top-[-40px] text-[12rem] opacity-[0.03] rotate-12 select-none">PL</div>
               <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-6">Witaj w Managerze Futbolu PL</h3>
               <p className="text-slate-300 leading-relaxed text-xl font-medium">
                 To najbardziej kompleksowy symulator polskiej piłki nożnej, jaki kiedykolwiek powstał. Twoim zadaniem nie jest tylko wygrywanie meczów – to budowanie dziedzictwa klubu w brutalnej, ale fascynującej rzeczywistości ligowej. 
               </p>
               <div className="mt-8 flex gap-4">
                  <div className="px-6 py-2 bg-emerald-500 text-black font-black uppercase text-xs rounded-full">Sezon 2025/26</div>
                  <div className="px-6 py-2 bg-white/10 text-white font-black uppercase text-xs rounded-full border border-white/10">3 Poziomy Rozgrywkowe</div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <section className="space-y-4">
                  <h4 className="text-emerald-400 font-black uppercase tracking-[0.3em] text-sm">Piramida Ligowa</h4>
                  <div className="space-y-3">
                     <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                        <span className="text-white font-bold italic">Ekstraklasa</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full font-black border border-amber-500/30">ELITA</span>
                     </div>
                     <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                        <span className="text-slate-300 font-bold italic">1. Liga</span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full font-black border border-blue-500/30">ZAPLECZE</span>
                     </div>
                     <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                        <span className="text-slate-400 font-bold italic">2. Liga</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full font-black border border-emerald-500/30">POZIOM PRO</span>
                     </div>
                  </div>
               </section>
               <section className="space-y-4">
                  <h4 className="text-blue-400 font-black uppercase tracking-[0.3em] text-sm">Twoja Rola</h4>
                  <p className="text-sm text-slate-400 leading-relaxed italic bg-black/20 p-5 rounded-3xl border border-white/5">
                    "Jako Manager, decydujesz o wszystkim. Od tego, kto usiądzie na trybunach, po agresywność pressingu w 89. minucie meczu. Twoja reputacja rośnie z każdym zwycięstwem, ale pamiętaj – zarząd nie wybacza seryjnych porażek."
                  </p>
               </section>
            </div>
          </div>
        );

      case 'ENGINE':
        return (
          <div className="space-y-10 animate-fade-in pb-20">
             <div className="bg-blue-600/10 border border-blue-500/20 p-10 rounded-[45px] shadow-2xl relative">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Silnik Momentum</h3>
                <p className="text-slate-300 leading-relaxed text-[15px]">
                  Momentum to nie ozdobny pasek, tylko żywy rdzeń symulacji meczu. Pokazuje, która drużyna przejmuje inicjatywę, a sam wynik tego wskaźnika wpływa potem na liczbę akcji, jakość strzałów, presję, posiadanie i tempo zużywania sił.
                </p>
             </div>

             <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <h4 className="text-blue-300 font-black uppercase tracking-widest text-sm flex items-center gap-3">
                      <span className="w-6 h-px bg-blue-400/30" /> Naturalny kierunek meczu
                   </h4>
                   <p className="text-[15px] text-slate-200 leading-relaxed">
                     Momentum zawsze próbuje wracać do naturalnego balansu sił. Ten balans nie jest liczony tylko z reputacji. Znaczenie mają też przewaga własnego boiska, jakość techniczna składu, attackBias obu taktyk, forma z ostatnich meczów, morale, oceny obrońców i przywództwo kapitana na boisku.
                   </p>
                   <p className="text-[13px] text-slate-300 leading-relaxed">
                     W praktyce oznacza to, że lepsza drużyna częściej odzyskuje kontrolę, ale nie dzieje się to automatycznie. Jeśli źle dobierzesz system albo wejdziesz w mecz z niskim morale i słabą serią, naturalny cel paska może być dużo mniej korzystny, niż sugeruje sama nazwa klubu.
                   </p>
                </div>

                <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <h4 className="text-cyan-300 font-black uppercase tracking-widest text-sm flex items-center gap-3">
                      <span className="w-6 h-px bg-cyan-400/30" /> Impulsy meczowe
                   </h4>
                   <p className="text-[15px] text-slate-200 leading-relaxed">
                     Każde ważne zdarzenie daje natychmiastowy impuls. Gol, strzał w światło bramki, słupek, długi fragment pressingu, karny czy czerwona kartka mogą gwałtownie przestawić środek ciężkości meczu w jedną stronę.
                   </p>
                   <div className="p-4 bg-black/35 rounded-2xl border border-cyan-500/20">
                      <span className="block text-[13px] text-cyan-300 font-black mb-2 uppercase">Najmocniejsze bodźce:</span>
                      <ul className="text-[13px] text-slate-200 space-y-2">
                         <li>• Gol i wykorzystany karny potrafią wywołać pełne przejęcie inicjatywy.</li>
                         <li>• Słupek, poprzeczka i strzały celne budują napór nawet bez zmiany wyniku.</li>
                         <li>• Blunder, zły pass, druga żółta i czerwona karta mogą odwrócić mecz jednym ruchem.</li>
                         <li>• Seria drobnych akcji też działa, bo silnik sumuje presję minuta po minucie.</li>
                      </ul>
                   </div>
                </div>
             </section>

             <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-slate-950 p-8 rounded-[35px] border border-white/10 space-y-4">
                   <h4 className="text-emerald-300 font-black uppercase tracking-widest text-sm">Mikrodrgania i błędy</h4>
                   <p className="text-[13px] text-slate-200 leading-relaxed">
                     Pasek nigdy nie stoi idealnie nieruchomo. Silnik dorzuca lekki szum kinetyczny, żeby mecz oddychał, a do tego losuje sporadyczne „ludzkie błędy” wynikające z gorszej koncentracji. Im słabsza mentalność zespołu, tym łatwiej o nagłe załamanie rytmu.
                   </p>
                </div>

                <div className="bg-slate-950 p-8 rounded-[35px] border border-white/10 space-y-4">
                   <h4 className="text-amber-300 font-black uppercase tracking-widest text-sm">Zmęczenie i świeżość</h4>
                   <p className="text-[13px] text-slate-200 leading-relaxed">
                     Świeższa drużyna dostaje naturalny bonus do momentum. Gdy rywal wchodzi w pomarańczową lub czerwoną strefę kondycji, inicjatywa coraz łatwiej dryfuje na Twoją stronę. Dlatego sensowne zmiany i kontrola energii w drugiej połowie są realną bronią, a nie tylko kosmetyką.
                   </p>
                </div>

                <div className="bg-slate-950 p-8 rounded-[35px] border border-white/10 space-y-4">
                   <h4 className="text-rose-300 font-black uppercase tracking-widest text-sm">Presja zużywa siły</h4>
                   <p className="text-[13px] text-slate-200 leading-relaxed">
                     Mocne momentum nie tylko wygląda groźnie na pasku. Drużyna zamknięta pod presją szybciej traci energię, a wysoki pressing dodatkowo podkręca koszt fizyczny. W efekcie dominacja może sama napędzać kolejną dominację, jeśli przeciwnik nie przerwie spirali zmianą planu albo zmianami personalnymi.
                   </p>
                </div>
             </section>

             <div className="bg-slate-950 p-10 rounded-[50px] border border-white/10 shadow-2xl">
                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8">Jak momentum wpływa na symulację akcji</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                   <div className="space-y-3">
                      <span className="text-[13px] text-blue-300 font-black uppercase tracking-[0.25em]">1. Inicjatywa</span>
                      <p className="text-[13px] text-slate-200 leading-relaxed">Silniejsze momentum zwiększa szansę, że to Twoja drużyna będzie stroną atakującą w kolejnych fragmentach meczu.</p>
                   </div>
                   <div className="space-y-3">
                      <span className="text-[13px] text-emerald-300 font-black uppercase tracking-[0.25em]">2. Jakość strzału</span>
                      <p className="text-[13px] text-slate-200 leading-relaxed">Gdy aktywna drużyna ma impet po swojej stronie, rośnie próg jakości akcji i łatwiej o strzały naprawdę groźne.</p>
                   </div>
                   <div className="space-y-3">
                      <span className="text-[13px] text-amber-300 font-black uppercase tracking-[0.25em]">3. Posiadanie</span>
                      <p className="text-[13px] text-slate-200 leading-relaxed">Końcowe posiadanie piłki jest częściowo wyliczane ze średniego momentum z całego meczu, więc dominacja na pasku przekłada się na statystyki.</p>
                   </div>
                   <div className="space-y-3">
                      <span className="text-[13px] text-rose-300 font-black uppercase tracking-[0.25em]">4. Presja psychiczna</span>
                      <p className="text-[13px] text-slate-200 leading-relaxed">Długie przebywanie pod naporem zwiększa szansę, że przeciwnik popełni błąd, spóźni się z reakcją albo odda pole na własnej połowie.</p>
                   </div>
                </div>
             </div>

             <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <h4 className="text-violet-300 font-black uppercase tracking-widest text-sm">Co możesz kontrolować</h4>
                   <p className="text-[15px] text-slate-200 leading-relaxed">
                     Na momentum wpływasz przez dobór taktyki, pressing, tempo, mindset, świeżość składu, zmiany oraz reakcję na kartki. Jeśli przeciwnik przejął rytm, nie zawsze trzeba od razu zmieniać formację. Często wystarczy poprawić intensywność, skrócić lub wydłużyć podania albo zdjąć dwóch najbardziej zmęczonych zawodników.
                   </p>
                </div>

                <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <h4 className="text-fuchsia-300 font-black uppercase tracking-widest text-sm">Briefing i przerwa</h4>
                   <p className="text-[15px] text-slate-200 leading-relaxed">
                     Momentum dostaje też wsparcie spoza samej akcji. Odprawa przed meczem może dać startowy impuls, a rozmowa w przerwie potrafi dodać albo odjąć konkretne punkty impetu oraz zmienić reakcję drużyny na tempo, nastawienie i intensywność po wznowieniu gry.
                   </p>
                   <p className="text-[13px] text-slate-300 leading-relaxed">
                     Dobra mowa działa najlepiej, gdy pasuje do sytuacji: agresja dla zespołu w dołku, spokój dla drużyny prowadzącej i pochwała, gdy wynik jest gorszy niż sama jakość gry.
                   </p>
                </div>
             </section>
          </div>
        );

      case 'CUP_LOGIC':
        return (
          <div className="space-y-12 animate-fade-in pb-20">
            <div className="bg-rose-600/10 border border-rose-500/20 p-10 rounded-[45px] shadow-2xl relative">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Symulacja Meczu</h3>
                <p className="text-slate-300">Ten sam rdzeń obsługuje mecze ligowe w symulacji oraz spotkania w LM, LE i LK. O wyniku decydują attackBias, defenseBias, pressingIntensity, momentum, zmęczenie, kartki, pogoda i instrukcje live. Puchar Polski korzysta z tego samego fundamentu, ale ma lekko bardziej pucharowy charakter, żeby rozgrywka dawała więcej napięcia i niespodzianek.</p>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                  <h4 className="text-rose-400 font-black uppercase tracking-widest text-sm flex items-center gap-3">
                     <span className="w-6 h-px bg-rose-500/30" /> Rdzeń silnika meczowego
                  </h4>
                  <p className="text-[15px] text-slate-200 leading-relaxed">
                    Każda formacja wnosi trzy realne parametry: ile ryzykujesz w ataku, jak mocno bronisz dostępu do strzału i jak agresywnie próbujesz odzyskać piłkę. Dlatego ta sama nazwa systemu może dać zupełnie inny efekt przy innym składzie, kondycji i przebiegu meczu.
                  </p>
                  <div className="p-4 bg-black/40 rounded-2xl border border-rose-500/20">
                    <span className="block text-[13px] text-rose-300 font-black mb-2 uppercase">Najważniejsze zależności:</span>
                    <ul className="text-[13px] text-slate-200 space-y-2">
                      <li>• Wysoki defenseBias tłumi liczbę i jakość sytuacji przeciwnika.</li>
                      <li>• Wysoki pressingIntensity daje więcej akcji, ale zwiększa koszt energetyczny.</li>
                      <li>• Wysoki attackBias po czerwonej kartce lub dziurach w XI otwiera plecy.</li>
                      <li>• Ten sam system może być genialny albo fatalny zależnie od składu i stanu meczu.</li>
                    </ul>
                  </div>
               </div>

               <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                  <h4 className="text-blue-400 font-black uppercase tracking-widest text-sm flex items-center gap-3">
                     <span className="w-6 h-px bg-blue-500/30" /> Instrukcje live
                  </h4>
                  <p className="text-[15px] text-slate-200 leading-relaxed">
                    Instrukcje w trakcie meczu są bardzo ważne, ale działają warunkowo. Silnik sprawdza je względem techniki, podań, pressingu, bloku rywala i aktualnej sytuacji na boisku, więc sam klik nie gwarantuje przewagi.
                  </p>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                       <span className="text-[13px] font-bold text-white uppercase tracking-tighter">Tempo, nastawienie i intensywność</span>
                       <span className="text-[12px] text-slate-200 italic leading-relaxed">FAST podbija liczbę akcji i kontr. SLOW pomaga tylko wtedy, gdy masz przewagę techniki i podań. OFFENSIVE daje mocniejszy impuls w ataku, a DEFENSIVE lepiej broni tylko przy sensownym fundamencie MID/DEF. AGGRESSIVE głównie pompuje faule, urazy i ryzyko karnego.</span>
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-[13px] font-bold text-white uppercase tracking-tighter">Podania i pressing</span>
                       <span className="text-[12px] text-slate-200 italic leading-relaxed">SHORT i LONG są liczone względem jakości technicznej Twojego środka i ataku. PRESSING porównuje agresję, pace, strength i stamina zawodników z pola. Jeśli nie masz nóg do biegania, ten przycisk staje się karą, nie bonusem.</span>
                    </div>
                  </div>
               </div>
            </section>

            <div className="bg-slate-950 p-10 rounded-[50px] border border-white/10 shadow-2xl">
               <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8">Analiza przedmeczowa - krok po kroku</h4>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="space-y-4">
                     <div className="text-3xl">🕵️‍♂️</div>
                     <h5 className="text-white font-black uppercase text-[15px]">1. Poznaj Rywala</h5>
                     <p className="text-[13px] text-slate-200 leading-relaxed">Sprawdź biasy i pressing rywala, nie tylko nazwę systemu. 6-3-1 i 5-4-1 mocno tłumią strzały, 3-4-3 i 4-2-4 są bardziej ryzykowne, a 5-2-1-2 oraz 5-3-2 lubią przejścia i kontratak.</p>
                  </div>
                  <div className="space-y-4">
                     <div className="text-3xl">🌡️</div>
                     <h5 className="text-white font-black uppercase text-[15px]">2. Sprawdź Warunki</h5>
                     <p className="text-[13px] text-slate-200 leading-relaxed">Deszcz karze technicznie słabszą drużynę. Jeśli przegrywasz techniką, nie zmuszaj zespołu do wolnego kombinowania. W pucharach pilnuj też energii, bo szybkie tempo i pressing mają realny koszt po 90 minucie.</p>
                  </div>
                  <div className="space-y-4">
                     <div className="text-3xl">⚖️</div>
                     <h5 className="text-white font-black uppercase text-[15px]">3. Oceń Arbitra</h5>
                     <p className="text-[13px] text-slate-200 leading-relaxed">Agresywna intensywność przede wszystkim podnosi ryzyko faulu, urazu i karnego. Przy surowym sędzim albo zmęczonym zespole spokojniejsza gra często daje więcej niż sztuczny chaos.</p>
                  </div>
               </div>
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                  <h4 className="text-amber-400 font-black uppercase tracking-widest text-sm">Liga, Europa i Puchar Polski</h4>
                  <p className="text-[13px] text-slate-200 leading-relaxed">Mecze ligowe w symulacji oraz spotkania w Lidze Mistrzów, Lidze Europy i Lidze Konferencji korzystają z tego samego rdzenia. Wszędzie liczą się te same profile taktyczne, jakość piłkarska, stamina, momentum i reakcje live.</p>
                  <p className="text-[13px] text-slate-200 leading-relaxed">Puchar Polski działa na bardzo podobnych zasadach, ale ma celowo trochę więcej chaosu i presji jednego meczu. Dzięki temu łatwiej o zwroty akcji, czerwone kartki, mecz życia underdoga i bardziej filmowe rozstrzygnięcia niż w długim rytmie ligi.</p>
               </div>

               <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                  <h4 className="text-emerald-400 font-black uppercase tracking-widest text-sm">Dogrywka i karne</h4>
                  <p className="text-[13px] text-slate-200 leading-relaxed">W rozgrywkach pucharowych, w tym w Pucharze Polski, remis po 90 minutach może przejść do dogrywki, a potem do serii karnych. W dogrywce AI częściej zwalnia, pilnuje sił i szuka jednego gola zamiast pełnego chaosu.</p>
                  <p className="text-[13px] text-slate-200 leading-relaxed">Przy karnych najważniejsze są penalties u strzelca i goalkeeping u bramkarza, ale pomagają też finishing, technique, mentality i positioning. Warto więc planować wykonawców jeszcze przed pierwszym gwizdkiem.</p>
               </div>

               <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                  <h4 className="text-blue-400 font-black uppercase tracking-widest text-sm">Jak czytać ryzyko</h4>
                  <p className="text-[13px] text-slate-200 leading-relaxed">Wysoki attackBias daje odwagę, ale po osłabieniu składu może otworzyć autostradę za plecy. Wysoki defenseBias dusi mecz, ale nie naprawi wolnych stoperów ani pustych sektorów po kartce.</p>
                  <p className="text-[13px] text-slate-200 leading-relaxed">Najlepsza decyzja pucharowa to zwykle nie "najbardziej heroiczny system", tylko taki profil, który pasuje do Twoich nóg, jakości technicznej i stanu meczu. W Pucharze Polski szczególnie warto szanować chaos i nie przeszarżować od pierwszej minuty.</p>
               </div>
            </section>

            <div className="bg-slate-950 p-10 rounded-[50px] border border-white/10 shadow-2xl">
               <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8">Szybki model decyzyjny na mecz</h4>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="space-y-3">
                     <span className="text-[13px] text-rose-300 font-black uppercase tracking-[0.25em]">1. Profil rywala</span>
                     <p className="text-[13px] text-slate-200 leading-relaxed">Patrz na attackBias, defenseBias i pressing, nie na samą nazwę formacji.</p>
                  </div>
                  <div className="space-y-3">
                     <span className="text-[13px] text-blue-300 font-black uppercase tracking-[0.25em]">2. Twoje nogi</span>
                     <p className="text-[13px] text-slate-200 leading-relaxed">Bez stamina, pace, strength i aggression nie klikaj PRESSING tylko dlatego, że to puchar.</p>
                  </div>
                  <div className="space-y-3">
                     <span className="text-[13px] text-emerald-300 font-black uppercase tracking-[0.25em]">3. Warunki</span>
                     <p className="text-[13px] text-slate-200 leading-relaxed">Deszcz, czerwone kartki i w pucharach także dogrywka zmieniają sens nawet najlepszej taktyki.</p>
                  </div>
                  <div className="space-y-3">
                     <span className="text-[13px] text-amber-300 font-black uppercase tracking-[0.25em]">4. Korekta live</span>
                     <p className="text-[13px] text-slate-200 leading-relaxed">Jeśli mecz nie daje Ci sytuacji, szukaj poprawy przez tempo, passing i mindset, nie tylko przez paniczną zmianę systemu.</p>
                  </div>
               </div>
            </div>
          </div>
        );

      case 'TACTICS':
        return (
          <div className="space-y-10 animate-fade-in pb-20">
             <div className="bg-slate-800/50 p-10 rounded-[45px] border border-white/10 relative overflow-hidden">
                <h3 className="text-3xl font-black text-white uppercase italic mb-4">Wszystkie Formacje</h3>
                <p className="text-slate-400 text-lg">Prawdziwy manager dopasowuje taktykę do zawodników, a nie zawodników do taktyki.</p>
             </div>

             <div className="space-y-4">
                {[
                  { id: '4-4-2', desc: 'Klasyka polskiej myśli szkoleniowej. Zrównoważona, bezpieczna, oparta na bocznych sektorach.', type: 'Neutral' },
                  { id: '4-3-3', desc: 'Agresywna, ofensywna. Skrzydła dominują, ale stoperzy zostają bez asekuracji. Wymaga szybkich obrońców.', type: 'Offensive' },
                  { id: '4-2-3-1', desc: 'Nowoczesny standard. Dwa "bezpieczniki" (CDM) pozwalają ofensywnemu pomocnikowi na pełną swobodę.', type: 'Neutral' },
                  { id: '3-5-2', desc: 'Dominacja w środku pola. Wymaga wydolnych wahadłowych i technicznych pomocników.', type: 'Possession' },
                  { id: '5-3-2', desc: 'Forteca. Bardzo trudna do przebicia, nastawiona na kontry i stałe fragmenty gry.', type: 'Defensive' },
                  { id: '4-5-1', desc: 'Klasyczne "murowanie". Zagęszczony środek uniemożliwia rywalowi wejście w pole karne.', type: 'Defensive' },
                  { id: '4-1-4-1', desc: 'Kontrola i cierpliwość. Szukanie luk w obronie rywala poprzez powolny atak pozycyjny.', type: 'Control' },
                  { id: '3-4-3', desc: 'Totalny futbol. Bardzo ryzykowne, ale przy dobrych zawodnikach miażdży rywala Momentum.', type: 'Ultra-Offensive' },
                  { id: '5-4-1', desc: 'Diamentowa obrona. Najlepsza do dowożenia prowadzenia 1:0 w doliczonym czasie gry.', type: 'Park Bus' },
                  { id: '4-3-2-1', desc: 'Choinka. Skupienie sił w centrum boiska, wymuszanie błędów rywala w środkowej strefie.', type: 'Technical' },
                ].map(t => (
                  <div key={t.id} className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 hover:bg-white/5 transition-all">
                     <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-black italic text-white">{t.id}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/20">{t.type}</span>
                     </div>
                     <p className="text-sm text-slate-400 leading-relaxed">{t.desc}</p>
                  </div>
                ))}
             </div>
          </div>
        );

      case 'PLAYERS':
        return (
          <div className="space-y-12 animate-fade-in pb-20">
             <div className="bg-emerald-950/20 p-10 rounded-[45px] border border-emerald-500/20">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Zrozumienie Atrybutów</h3>
                <p className="text-slate-300">Statystyki to nie tylko liczby – to zachowanie zawodnika na murawie.</p>
             </div>

             <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <h4 className="text-emerald-400 font-black uppercase tracking-widest text-sm flex items-center gap-3">
                      <span className="w-8 h-px bg-emerald-500/30" /> Atrybuty Fizyczne
                   </h4>
                   <div className="space-y-4">
                      <div className="group">
                         <span className="block text-white font-bold text-xs uppercase mb-1 group-hover:text-emerald-400 transition-colors">Szybkość (Pace)</span>
                         <p className="text-[10px] text-slate-500">Kluczowa dla FWD i Skrzydłowych. Decyduje o dystansie dzielącym zawodnika od obrońcy w rajdzie 1v1.</p>
                      </div>
                      <div className="group">
                         <span className="block text-white font-bold text-xs uppercase mb-1 group-hover:text-emerald-400 transition-colors">Siła (Strength)</span>
                         <p className="text-[10px] text-slate-500">Wpływa na wygrywanie pojedynków w tłoku i walkę o górne piłki przy rzutach rożnych.</p>
                      </div>
                      <div className="group">
                         <span className="block text-white font-bold text-xs uppercase mb-1 group-hover:text-emerald-400 transition-colors">Kondycja (Stamina)</span>
                         <p className="text-[10px] text-slate-500">Bazowa wytrzymałość. Im wyższa, tym wolniej zawodnik traci energię (Fatigue) co minutę.</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <h4 className="text-blue-400 font-black uppercase tracking-widest text-sm flex items-center gap-3">
                      <span className="w-8 h-px bg-blue-500/30" /> Atrybuty Techniczne
                   </h4>
                   <div className="space-y-4">
                      <div className="group">
                         <span className="block text-white font-bold text-xs uppercase mb-1 group-hover:text-blue-400 transition-colors">Technika (Technique)</span>
                         <p className="text-[10px] text-slate-500">Zmniejsza szansę na błąd techniczny (Blunder) i potknięcie (Stumble). Zwiększa kontrolę przy Momentum.</p>
                      </div>
                      <div className="group">
                         <span className="block text-white font-bold text-xs uppercase mb-1 group-hover:text-blue-400 transition-colors">Wizja (Vision)</span>
                         <p className="text-[10px] text-slate-500">Zwiększa szansę na prostopadłe podanie, które kompletnie mija linię obrony rywala.</p>
                      </div>
                      <div className="group">
                         <span className="block text-white font-bold text-xs uppercase mb-1 group-hover:text-blue-400 transition-colors">Ustawianie się (Positioning)</span>
                         <p className="text-[10px] text-slate-500">Defensor: Przecinanie podań. Atakujący: Znajdowanie wolnych stref. Bramkarz: Skracanie kąta.</p>
                      </div>
                   </div>
                </div>
             </section>

             <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/60 p-6 rounded-[30px] border border-emerald-500/20">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">22 parametry</span>
                   <p className="text-sm text-slate-300 mt-3 leading-relaxed">Tyle atrybutów opisuje zawodnika. Część buduje OVR, a część daje przewagę ukrytą w pressingu, stałych fragmentach, przywództwie i odporności psychicznej.</p>
                </div>
                <div className="bg-slate-900/60 p-6 rounded-[30px] border border-blue-500/20">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">21 trenowalnych</span>
                   <p className="text-sm text-slate-300 mt-3 leading-relaxed">Prawie wszystko może rosnąć lub spadać wraz z treningiem, minutami i wiekiem. Wyjątkiem jest talent, który działa bardziej jak sufit rozwoju niż zwykła statystyka.</p>
                </div>
                <div className="bg-slate-900/60 p-6 rounded-[30px] border border-amber-500/20">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">OVR to nie wszystko</span>
                   <p className="text-sm text-slate-300 mt-3 leading-relaxed">Rożne, wolne, karne, agresja, przywództwo czy mentalność często nie robią wielkiego numeru na ocenie ogólnej, ale potrafią wygrywać mecze i serie rzutów karnych.</p>
                </div>
             </section>

             <section className="space-y-8">
                <div className="flex items-center justify-between gap-6 flex-wrap">
                   <h4 className="text-white font-black uppercase tracking-[0.25em] text-sm">Pełna Analiza Atrybutów</h4>
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.25em]">Czytaj kartę zawodnika jak raport skautingowy</span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {PLAYER_ATTRIBUTE_GROUPS.map(group => (
                    <div key={group.title} className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5">
                      <h5 className="text-white font-black uppercase tracking-widest text-sm mb-6">{group.title}</h5>
                      <div className="space-y-5">
                        {group.items.map(item => (
                          <div key={item.label} className="border-l-2 border-white/10 pl-4">
                            <span className="block text-white font-bold text-xs uppercase mb-1">{item.label}</span>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
             </section>

             <section className="bg-slate-950 p-10 rounded-[50px] border border-white/10 shadow-2xl space-y-8">
                <div>
                   <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-3">Jak Naprawdę Liczony Jest OVR</h4>
                   <p className="text-sm text-slate-400 leading-relaxed">
                     Ocena ogólna nie korzysta ze wszystkich statystyk po równo. Silnik liczy ją przez wagi pozycyjne, więc ten sam zawodnik może wyglądać świetnie jako pomocnik i przeciętnie jako napastnik.
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {PLAYER_OVR_PROFILES.map(profile => (
                    <div key={profile.position} className="bg-slate-900/60 p-6 rounded-[30px] border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-black italic text-xl">{profile.position}</span>
                        <span className="text-[10px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-black uppercase tracking-widest">{profile.label}</span>
                      </div>
                      <p className="text-xs text-emerald-400 font-black uppercase tracking-[0.25em] mb-3">{profile.formula}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{profile.note}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-900/20 border border-blue-500/20 rounded-[30px] p-6">
                   <p className="text-xs text-slate-300 leading-relaxed">
                     Ważne: <span className="text-white font-bold">talent, przywództwo, mentalność, agresja, stałe fragmenty i rożne</span> mogą nie pompować mocno OVR, ale realnie wpływają na dobór kapitana, wykonawców, pressing, momentum i rozwój młodych zawodników.
                   </p>
                </div>
             </section>

             <section className="space-y-8">
                <div className="bg-rose-950/20 p-10 rounded-[45px] border border-rose-500/20">
                   <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">Mechanika Rozwoju Krok po Kroku</h4>
                   <p className="text-sm text-slate-300 leading-relaxed">
                     Rozwój nie jest losową mgłą. Kod gry sprawdza trening, intensywność, wiek, minuty, ocenę po meczu, talent i nawet to, czy bramkarz zachował czyste konto.
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {PLAYER_DEVELOPMENT_RULES.map(rule => (
                    <div key={rule.title} className="bg-slate-900/55 p-7 rounded-[32px] border border-white/5">
                      <h5 className="text-white font-black uppercase text-xs tracking-[0.25em] mb-3">{rule.title}</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{rule.text}</p>
                    </div>
                  ))}
                </div>
             </section>

             <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
                <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5">
                   <h4 className="text-emerald-400 font-black uppercase tracking-[0.25em] text-sm mb-5">Cykle Treningowe, Które Najmocniej Zmieniają Profil Gracza</h4>
                   <div className="space-y-3">
                      {PLAYER_TRAINING_CYCLES.map(cycle => (
                        <div key={cycle} className="p-4 rounded-2xl bg-black/25 border border-white/5 text-[11px] text-slate-300 leading-relaxed">
                          {cycle}
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-slate-950 p-8 rounded-[35px] border border-white/10">
                   <h4 className="text-amber-400 font-black uppercase tracking-[0.25em] text-sm mb-5">Praktyka Managera</h4>
                   <div className="space-y-4 text-[11px] text-slate-400 leading-relaxed">
                      <p><span className="text-white font-bold">Młodzi 17-21:</span> dawaj im minuty, ustaw trainingFocus i pilnuj zgodności cyklu z pozycją. Talent bez gry rozwija się wolniej niż talent z regularną rotacją.</p>
                      <p><span className="text-white font-bold">Szczyt kariery 24-29:</span> tu budujesz wynik sportowy. Tacy gracze najlepiej zamieniają wysoki OVR na regularną jakość bez gwałtownego regresu.</p>
                      <p><span className="text-white font-bold">Po 30. roku życia:</span> rotuj rozsądniej i nie ignoruj braku minut. Fizyczność zaczyna spadać pierwsza, więc weteranów trzeba chronić rolą, nie tylko reputacją.</p>
                      <p><span className="text-white font-bold">Czytaj kartę kontekstowo:</span> napastnik z gorszym OVR, ale lepszym wykończeniem i atakiem, może być skuteczniejszy od bardziej "pełnego" rywala. To samo dotyczy obrońcy z mocnym ustawianiem i grą głową.</p>
                   </div>
                </div>
             </section>
          </div>
        );

      case 'MINDSET':
        return (
          <div className="space-y-10 animate-fade-in pb-20">
             <div className="bg-violet-950/20 p-10 rounded-[45px] border border-violet-500/20 shadow-2xl">
                <h3 className="text-3xl text-white mb-4 font-black italic uppercase tracking-tighter">Morale i Mindset Zawodnika</h3>
                <p className="text-slate-300 text-[15px] leading-relaxed">
                  Karta zawodnika pokazuje dwie warstwy psychiki. Morale jest aktualnym paliwem mentalnym, które silnik wykorzystuje w meczu, treningu i wyborze składu. Mindset tłumaczy, skąd bierze się spokój albo kryzys: czy zawodnik ufa trenerowi, czuje się potrzebny, rozumie rolę, widzi rozwój i czy myśli o transferze.
                </p>
             </div>

             <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/55 p-8 rounded-[35px] border border-white/5 space-y-5">
                   <h4 className="text-violet-300 text-sm flex items-center gap-3 font-black italic uppercase tracking-tighter">
                      <span className="w-6 h-px bg-violet-400/30" /> Morale
                   </h4>
                   <p className="text-[13px] text-slate-300 leading-relaxed">
                     Morale jest liczbą 0-100 i działa natychmiastowo. Niskie morale obniża efektywną jakość zawodnika, pogarsza jego wkład w akcje bramkowe i spowalnia rozwój. Wysokie morale potrafi sprawić, że piłkarz gra powyżej bazowego OVR.
                   </p>
                   <div className="space-y-3">
                      {[
                        { range: '0-19', label: 'Bardzo słabe', text: 'mecz x0.92, skład x0.80, rozwój x0.45, regres x2.20', color: 'text-red-400' },
                        { range: '20-39', label: 'Słabe', text: 'mecz x0.96, skład x0.92, rozwój x0.65, regres x1.65', color: 'text-orange-400' },
                        { range: '40-59', label: 'Normalne', text: 'brak premii i brak kary, zawodnik gra zgodnie z bazą', color: 'text-slate-200' },
                        { range: '60-79', label: 'Wysokie', text: 'mecz x1.03, skład x1.06, rozwój x1.08, regres x0.92', color: 'text-emerald-400' },
                        { range: '80-100', label: 'Bardzo wysokie', text: 'mecz x1.06, skład x1.12, rozwój x1.15, regres x0.85', color: 'text-yellow-300' },
                      ].map(row => (
                        <div key={row.range} className="grid grid-cols-[70px_120px_1fr] gap-3 items-center bg-black/25 p-4 rounded-2xl border border-white/5">
                           <span className={`text-xs font-black ${row.color}`}>{row.range}</span>
                           <span className="text-[10px] text-white font-black uppercase tracking-widest">{row.label}</span>
                           <span className="text-[11px] text-slate-400 leading-relaxed">{row.text}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-slate-900/55 p-8 rounded-[35px] border border-white/5 space-y-5">
                   <h4 className="text-cyan-300 text-sm flex items-center gap-3 font-black italic uppercase tracking-tighter">
                      <span className="w-6 h-px bg-cyan-400/30" /> Mindset
                   </h4>
                   <p className="text-[13px] text-slate-300 leading-relaxed">
                     Mindset nie jest jednym ukrytym morale. To mapa relacji zawodnika z trenerem i klubem. Większość zdarzeń najpierw zmienia morale, a gra automatycznie dopisuje do tego zmianę odpowiednich pasków mindsetu.
                   </p>
                   <p className="text-[13px] text-slate-300 leading-relaxed">
                     Raz w tygodniu działa też sprzężenie zwrotne: pozytywny mindset może delikatnie podnieść morale, a negatywny mindset może je obniżyć. Najmocniej ważą niskie zaufanie, brak minut, słaba rola, wysoka otwartość transferowa i wysoki konflikt.
                   </p>
                   <div className="bg-blue-950/25 p-5 rounded-3xl border border-blue-500/20">
                      <p className="text-[12px] text-slate-300 leading-relaxed">
                        Przykład: niespełniona obietnica minut obniża morale, ale jednocześnie uderza w zaufanie, satysfakcję z minut i konflikt. Udana rozmowa z trenerem podnosi morale, a przy okazji poprawia zaufanie i obniża napięcie.
                      </p>
                   </div>
                   <div className="space-y-3 text-[12px] text-slate-300 leading-relaxed">
                      <p><span className="text-white font-bold">Zielone paski</span> zwykle są dobre: zaufanie, klub, rola, minuty i rozwój.</p>
                      <p><span className="text-white font-bold">Transfer i konflikt</span> czytaj odwrotnie. Im wyżej, tym większe ryzyko odejścia, protestu albo eskalacji rozmów.</p>
                      <p><span className="text-white font-bold">Data aktualizacji</span> mówi, kiedy ostatnio zdarzenie realnie zmieniło mindset zawodnika.</p>
                   </div>
                </div>
             </section>

             <section className="space-y-6">
                <div>
                   <h4 className="text-white text-xl mb-3 font-black italic uppercase tracking-tighter">Paski Mindsetu na Karcie</h4>
                   <p className="text-sm text-slate-400 leading-relaxed">
                     Każdy pasek opisuje inną przyczynę nastroju. Dobry manager nie patrzy tylko na morale, bo zawodnik z wysokim morale może nadal być w konflikcie po złamanej obietnicy albo po wystawieniu na listę transferową bez rozmowy.
                   </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[
                     { title: 'Zaufanie', text: 'Wiara w trenera, rozmowy i obietnice. Spada po ignorowaniu próśb, przerwanych dialogach i niespełnionych deklaracjach. Przy bardzo niskim zaufaniu każda kolejna rozmowa jest trudniejsza.' },
                     { title: 'Klub', text: 'Ogólne zadowolenie z bycia w klubie. Rośnie po sukcesach, awansie, pucharach, kontrakcie i spełnionych prośbach. Spada po spadku, blokadach i decyzjach przeciw zawodnikowi.' },
                     { title: 'Rola', text: 'Czy piłkarz rozumie swój status i uważa go za uczciwy. Niska wartość zwiększa ryzyko prośby o status podstawowego albo kluczowego zawodnika.' },
                     { title: 'Minuty', text: 'Satysfakcja z gry. Jeśli zawodnik jest gotowy, ma argument sportowy i nie gra, może poprosić o minuty. Zignorowanie tej prośby często eskaluje problem.' },
                     { title: 'Rozwój', text: 'Poczucie, że klub pomaga zawodnikowi rosnąć. Szczególnie ważne u młodych. Brak minut po wcześniejszej prośbie może skończyć się żądaniem wypożyczenia albo transferu.' },
                     { title: 'Transfer', text: 'Gotowość do słuchania ofert. Wysoka wartość jest ostrzeżeniem. Podbijają ją niskie morale, zainteresowanie mocniejszych klubów, lista transferowa i konflikt z klubem.' },
                     { title: 'Konflikt', text: 'Poziom napięcia z trenerem albo klubem. Rośnie po odrzuceniu próśb, złamanych obietnicach, wymuszonych ruchach i złych rozmowach. Wysoki konflikt potrafi zablokować spokój nawet przy dobrych wynikach.' },
                   ].map(item => (
                     <div key={item.title} className="bg-slate-900/55 p-6 rounded-[30px] border border-white/5">
                        <h5 className="text-white text-xs mb-3 font-black italic uppercase tracking-tighter">{item.title}</h5>
                        <p className="text-[12px] text-slate-400 leading-relaxed">{item.text}</p>
                     </div>
                   ))}
                </div>
             </section>

             <section className="bg-slate-950 p-10 rounded-[50px] border border-white/10 shadow-2xl space-y-7">
                <div>
                   <h4 className="text-2xl text-white mb-3 font-black italic uppercase tracking-tighter">Co Zmienia Morale i Mindset</h4>
                   <p className="text-sm text-slate-400 leading-relaxed">
                     System regularnie przegląda kadrę. Jeśli zawodnik ma sportowy argument, niskie morale albo niespełnioną obietnicę, może wysłać mail do trenera i rozpocząć ścieżkę żądania.
                   </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[
                     { title: 'Rozmowy indywidualne', text: 'Pochwała, motywacja, wsparcie, krytyka, obietnica minut i wymaganie cięższej pracy mogą dać bonus albo mocno zaszkodzić. Osobowość zawodnika zmienia reakcję.' },
                     { title: 'Minuty i status', text: 'Zawodnik z rolą STARTER lub KEY_PLAYER oczekuje gry. Brak minut obniża morale, psuje zaufanie i może wywołać prośbę o rozmowę.' },
                     { title: 'Obietnice', text: 'Spełniona obietnica minut daje mały bonus. Niespełniona obietnica u ambitnych i egoistycznych zawodników potrafi mocno podnieść konflikt.' },
                     { title: 'Lista transferowa', text: 'Jeśli piłkarz sam prosił o listę, zgoda poprawia morale. Jeśli wystawisz go bez zgody, dostaje karę do morale i może wysłać protest.' },
                     { title: 'Kontrakty', text: 'Podpisanie kontraktu wycisza żądania, poprawia zaufanie, klub, rolę i obniża otwartość transferową. Przez rok blokuje nowe żądania morale.' },
                     { title: 'Sukces i spadek', text: 'Mistrzostwo, awans, puchary i Europa poprawiają klub, rozwój i zmniejszają chęć odejścia. Spadek robi odwrotnie, zwłaszcza u zawodników za dobrych na ligę.' },
                   ].map(item => (
                     <div key={item.title} className="bg-slate-900/50 p-6 rounded-[30px] border border-white/5">
                        <h5 className="text-emerald-300 text-xs mb-3 font-black italic uppercase tracking-tighter">{item.title}</h5>
                        <p className="text-[12px] text-slate-400 leading-relaxed">{item.text}</p>
                     </div>
                   ))}
                </div>
             </section>

             <section className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8">
                <div className="bg-rose-950/20 p-8 rounded-[35px] border border-rose-500/20 space-y-5">
                   <h4 className="text-rose-300 text-sm font-black italic uppercase tracking-tighter">Alarm Kryzysowy</h4>
                   <p className="text-[13px] text-slate-300 leading-relaxed">
                     Najgroźniejszy profil to niskie zaufanie, wysoki konflikt i wysoka otwartość transferowa. Taki zawodnik może nadal lubić klub, ale nie ufa trenerowi i mentalnie przygotowuje się do odejścia.
                   </p>
                   <div className="space-y-3">
                      {[
                        'Zaufanie 0-20: nie składaj pustych obietnic, bo kolejna wpadka pogłębi kryzys.',
                        'Konflikt 70-100: najpierw uspokój relację, potem negocjuj rolę albo transfer.',
                        'Transfer 65-100: licz się z prośbą o listę, ofertami i presją agenta.',
                        'Minuty poniżej 40: daj realną szansę albo uczciwie otwórz ścieżkę wypożyczenia.',
                      ].map(text => (
                        <div key={text} className="bg-black/25 p-4 rounded-2xl border border-rose-500/10 text-[12px] text-slate-300 leading-relaxed">
                          {text}
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-slate-900/55 p-8 rounded-[35px] border border-white/5 space-y-5">
                   <h4 className="text-amber-300 text-sm font-black italic uppercase tracking-tighter">Instrukcja Naprawy Relacji</h4>
                   <ol className="space-y-4 text-[12px] text-slate-300 leading-relaxed">
                      <li><span className="text-white font-bold">1. Sprawdź, o co chodzi.</span> Jeśli niskie są minuty, problemem jest gra. Jeśli rola, problemem jest status. Jeśli transfer i konflikt są wysokie, problem jest już strategiczny.</li>
                      <li><span className="text-white font-bold">2. Spełnij aktywne żądanie.</span> Prośba o minuty wymaga występu, prośba o rolę wymaga statusu, prośba o listę wymaga decyzji transferowej.</li>
                      <li><span className="text-white font-bold">3. Nie obiecuj bez planu.</span> Obietnica gry w następnym meczu jest dobra tylko wtedy, gdy naprawdę zamierzasz go wystawić.</li>
                      <li><span className="text-white font-bold">4. Użyj kontraktu jako resetu.</span> Nowa umowa poprawia kilka pól mindsetu i czyści wiele żądań, ale kosztuje budżet oraz musi przejść logikę negocjacji.</li>
                      <li><span className="text-white font-bold">5. Przy wysokim transferze wybierz drogę.</span> Albo odbudowujesz zawodnika minutami i sukcesem klubu, albo ustalasz rozsądną sprzedaż, zanim konflikt zniszczy morale.</li>
                   </ol>
                </div>
             </section>
          </div>
        );

      case 'REFEREE':
        return (
          <div className="space-y-10 animate-fade-in pb-20">
             <div className="bg-slate-900/80 p-10 rounded-[45px] border border-white/10 relative overflow-hidden">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Kolegium Sędziów</h3>
                <p className="text-slate-400">W grze występuje pool 150 unikalnych polskich sędziów o różnych charakterach.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 text-center">
                   <span className="text-3xl block mb-4">📏</span>
                   <h5 className="text-white font-black uppercase text-xs mb-2">Surowość (Strictness)</h5>
                   <p className="text-[10px] text-slate-500 leading-relaxed">Wysoka surowość sędziego oznacza, że każda żółta kartka to ryzyko drugiej i wylotu z boiska. Surowy sędzia chętniej gwiżdże też rzuty karne.</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 text-center">
                   <span className="text-3xl block mb-4">📈</span>
                   <h5 className="text-white font-black uppercase text-xs mb-2">Konsekwencja (Consistency)</h5>
                   <p className="text-[10px] text-slate-500 leading-relaxed">Wysoki parametr oznacza, że sędzia sędziuje tak samo od 1. do 90. minuty. Sędzia z niską konsekwencją może "pogubić się" pod koniec meczu.</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 text-center">
                   <span className="text-3xl block mb-4">⚖️</span>
                   <h5 className="text-white font-black uppercase text-xs mb-2">Przywilej Korzyści</h5>
                   <p className="text-[10px] text-slate-500 leading-relaxed">Określa, jak często sędzia puszcza grę po faulu. Kluczowe dla drużyn grających szybki, fizyczny futbol.</p>
                </div>
             </div>
          </div>
        );

      case 'LEAGUE':
        return (
          <div className="space-y-10 animate-fade-in pb-20">
             <div className="bg-slate-900/40 p-10 rounded-[45px] border border-white/5 space-y-8">
                <section>
                   <h4 className="text-white font-black uppercase tracking-widest text-lg mb-4">Zawieszenia i Kary</h4>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                         <span className="text-xs font-bold text-slate-300 uppercase">Co 4 żółte kartki</span>
                         <span className="text-xs font-black text-amber-500">1 MECZ KARY</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                         <span className="text-xs font-bold text-slate-300 uppercase">Czerwona kartka (bezpośrednia)</span>
                         <span className="text-xs font-black text-red-500">2 MECZE KARY</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-4 italic">
                        Zawieszenia automatycznie zmniejszają się o 1 po każdym rozegranym meczu. Po zakończeniu sezonu wszystkie zawieszenia są resetowane.
                      </p>
                   </div>
                </section>
                <section>
                   <h4 className="text-white font-black uppercase tracking-widest text-lg mb-4">Zasada Awansów i Spadków</h4>
                   <div className="space-y-4">
                     <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/10">
                       <h5 className="text-emerald-400 font-black uppercase text-sm mb-3">Ekstraklasa, 1. Liga, 2. Liga (po 18 drużyn)</h5>
                       <ul className="text-xs text-slate-400 space-y-2">
                         <li>• <span className="text-white font-bold">Miejsca 1-3:</span> Awans wyżej (lub mistrzostwo)</li>
                         <li>• <span className="text-white font-bold">Miejsca 16-18:</span> Spadek niżej</li>
                       </ul>
                     </div>
                     <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/10">
                       <h5 className="text-blue-400 font-black uppercase text-sm mb-3">Regionalna Liga (100 drużyn)</h5>
                       <ul className="text-xs text-slate-400 space-y-2">
                         <li>• <span className="text-white font-bold">Miejsca 1-4:</span> Awans do 2. Ligi</li>
                         <li>• <span className="text-white font-bold">Miejsca 97-100:</span> Spadek z 2. Ligi</li>
                       </ul>
                     </div>
                   </div>
                </section>
             </div>
          </div>
        );

      case 'INJURIES':
        return (
          <div className="space-y-10 animate-fade-in pb-20">
             <div className="bg-red-900/20 p-10 rounded-[45px] border border-red-500/20">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Kontuzje i Regeneracja</h3>
                <p className="text-slate-300">Zarządzanie zdrowiem zawodników to klucz do sukcesu w długim sezonie.</p>
             </div>

             <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <h4 className="text-red-400 font-black uppercase tracking-widest text-sm flex items-center gap-3">
                      <span className="w-6 h-px bg-red-500/30" /> Rodzaje Urazów
                   </h4>
                   <div className="space-y-3">
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-amber-500/20">
                         <span className="text-amber-400 font-black uppercase text-xs">Lekki Uraz (LIGHT)</span>
                         <p className="text-[10px] text-slate-400 mt-2">
                           Kontuzja wymagająca 3-10 dni przerwy. Zawodnik traci kondycję w momencie urazu i wraca do niej stopniowo w trakcie leczenia.
                         </p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-red-500/20">
                         <span className="text-red-400 font-black uppercase text-xs">Poważny Uraz (SEVERE)</span>
                         <p className="text-[10px] text-slate-400 mt-2">
                           Kontuzja wymagająca 14-45 dni przerwy. Zawodnik jest całkowicie niedostępny do czasu pełnego wyzdrowienia.
                         </p>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <h4 className="text-emerald-400 font-black uppercase tracking-widest text-sm flex items-center gap-3">
                      <span className="w-6 h-px bg-emerald-500/30" /> Regeneracja
                   </h4>
                   <p className="text-xs text-slate-400 leading-relaxed">
                     Kondycja zawodnika regeneruje się codziennie. Tempo zależy od:
                   </p>
                   <ul className="text-xs text-slate-400 space-y-2 mt-3">
                      <li>• <span className="text-white font-bold">Wiek:</span> Młodsi (≤24) regenerują się najszybciej</li>
                      <li>• <span className="text-white font-bold">Siła:</span> 99 STR = ~1.1 pkt długu zmęczeniowego/doba</li>
                      <li>• <span className="text-white font-bold">Kontuzja:</span> Uraz zmniejsza regenerację o 50%</li>
                      <li>• <span className="text-white font-bold">Trening:</span> Lekki trening (+0.5), Ciężki (-2.0)</li>
                   </ul>
                </div>
             </section>

             <div className="bg-slate-950 p-10 rounded-[50px] border border-white/10">
                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6">Fatigue Debt (Dług Zmęczeniowy)</h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Każdy mecz i trening generuje "dług zmęczeniowy". Zawodnik z wysokim fatigue debt ma obniżony sufit kondycji (max condition = 100 - debt).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                      <div className="text-2xl mb-3">🔋</div>
                      <h5 className="text-white font-black uppercase text-xs mb-2">Kondycja 100%</h5>
                      <p className="text-[10px] text-slate-500">Pełna wydajność, zawodnik gotowy do gry</p>
                   </div>
                   <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                      <div className="text-2xl mb-3">⚠️</div>
                      <h5 className="text-white font-black uppercase text-xs mb-2">Kondycja 60-70%</h5>
                      <p className="text-[10px] text-slate-500">Znacznie gorsza wydajność, ryzyko błędów</p>
                   </div>
                   <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                      <div className="text-2xl mb-3">🚨</div>
                      <h5 className="text-white font-black uppercase text-xs mb-2">Kondycja &lt;40%</h5>
                      <p className="text-[10px] text-slate-500">Ekstremalne ryzyko kontuzji, zawodnik do odpoczynku</p>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'TRAINING':
        return (
          <div className="space-y-10 animate-fade-in pb-20">
             <div className="bg-emerald-900/20 p-10 rounded-[45px] border border-emerald-500/20">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Trening i Rozwój Zawodników</h3>
                <p className="text-slate-300 text-[15px] leading-relaxed">Mądrze zaplanowany trening buduje nie tylko rozwój młodych zawodników, ale też kondycję całej kadry, jakość wejść z ławki i wartość rynkową piłkarzy. To sekcja o balansie między wzrostem atrybutów, regeneracją i doborem programu do realnych potrzeb drużyny.</p>
             </div>

             <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <h4 className="text-emerald-400 font-black uppercase tracking-widest text-sm flex items-center gap-3">
                      <span className="w-6 h-px bg-emerald-500/30" /> Intensywność Treningu
                   </h4>
                   <div className="space-y-3">
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-emerald-500/20">
                         <span className="text-emerald-400 font-black uppercase text-xs">LIGHT (Lekki)</span>
                         <p className="text-[12px] text-slate-300 mt-2 leading-relaxed">
                           Daje bonus do regeneracji kondycji i obniża tempo rozwoju do połowy standardu. Idealny po serii meczów, dla weteranów oraz wtedy, gdy Twoim priorytetem jest odzyskanie świeżości przed kolejnym spotkaniem.
                         </p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-blue-500/20">
                         <span className="text-blue-400 font-black uppercase text-xs">NORMAL (Standardowy)</span>
                         <p className="text-[12px] text-slate-300 mt-2 leading-relaxed">
                           Bazowy balans między wzrostem i regeneracją. To domyślny wybór na większość sezonu, zwłaszcza jeśli grasz regularnie co tydzień i nie chcesz przepalać kadry.
                         </p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-red-500/20">
                         <span className="text-red-400 font-black uppercase text-xs">HEAVY (Ciężki)</span>
                         <p className="text-[12px] text-slate-300 mt-2 leading-relaxed">
                           Mnoży wzrost atrybutów ×1.8, ale mocno uderza w regenerację kondycji. Najlepiej działa przy młodych zawodnikach, dłuższych tygodniach bez meczu albo w okresie, gdy świadomie pompujesz rozwój kosztem krótkoterminowej świeżości.
                         </p>
                      </div>
                   </div>
                   <p className="text-[12px] text-amber-300 italic leading-relaxed">
                     Kontuzjowani zawodnicy nie korzystają z regularnych efektów treningu, więc przy urazach ważniejsza od ambicji staje się regeneracja i mądre zarządzanie obciążeniem kadry.
                   </p>
                </div>

                <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <h4 className="text-blue-400 font-black uppercase tracking-widest text-sm flex items-center gap-3">
                      <span className="w-6 h-px bg-blue-500/30" /> Wzrost i Regres Atrybutów
                   </h4>
                   <p className="text-[13px] text-slate-300 leading-relaxed">
                     Każdy cykl treningowy co rundę przelicza szansę wzrostu dla atrybutów zawodnika. Na rozwój wpływają jednocześnie program zespołu, fokus indywidualny, wiek, talent i to, czy piłkarz faktycznie gra oraz daje liczby na boisku.
                   </p>
                   <ul className="text-[13px] text-slate-200 space-y-2 mt-3">
                      <li>• <span className="text-white font-bold">Baza:</span> 2% szansy/tydzień</li>
                      <li>• <span className="text-white font-bold">Primary Attributes:</span> +8% szansy</li>
                      <li>• <span className="text-white font-bold">Secondary Attributes:</span> +4% szansy</li>
                      <li>• <span className="text-white font-bold">Indywidualny fokus:</span> +6% do wybranego atrybutu</li>
                      <li>• <span className="text-white font-bold">Wiek &lt;21:</span> ×1.5 wzrostu</li>
                      <li>• <span className="text-white font-bold">Wiek &gt;32:</span> ×0.3 wzrostu</li>
                      <li>• <span className="text-white font-bold">Gra w meczu:</span> +2%, rating 7.5+: +5%, 9.0+: +10%</li>
                      <li>• <span className="text-white font-bold">Talent:</span> mocno skaluje końcową szansę rozwoju</li>
                   </ul>
                   <p className="text-[12px] text-amber-300 mt-4 italic leading-relaxed">
                     Regres też istnieje i z wiekiem rośnie coraz szybciej, szczególnie bez minut meczowych. Najmocniej cierpią parametry fizyczne, a łagodniej cofają się mentalne. Limit sezonowy pozostaje ważny: jeden atrybut nie urośnie ani nie spadnie bardziej niż o 3 punkty w sezonie.
                   </p>
                </div>
             </section>

             <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-950 p-8 rounded-[35px] border border-white/10 space-y-4">
                   <h4 className="text-violet-300 font-black uppercase tracking-widest text-sm">Kto rozwija się najlepiej</h4>
                   <p className="text-[13px] text-slate-200 leading-relaxed">
                     Największy zwrot z treningu dają młodzi gracze z wysokim talentem, regularnie grający i dobrze oceniani po meczach. To właśnie oni powinni dostawać cięższe bloki, indywidualny fokus i miejsce w rotacji.
                   </p>
                   <p className="text-[13px] text-slate-200 leading-relaxed">
                     Starsi zawodnicy nadal mogą poprawiać elementy techniczne i mentalne, ale ich parametry fizyczne cofają się szybciej. Dla weteranów zwykle ważniejsze jest utrzymanie poziomu i świeżości niż agresywne pompowanie rozwoju.
                   </p>
                </div>

                <div className="bg-slate-950 p-8 rounded-[35px] border border-white/10 space-y-4">
                   <h4 className="text-cyan-300 font-black uppercase tracking-widest text-sm">Asystent i ocena drużyny</h4>
                   <p className="text-[13px] text-slate-200 leading-relaxed">
                     Asystent może realnie pomóc. W centrum treningowym przycisk `Poproś Asystenta` wybiera program zespołowy i ustawia indywidualne focusy dla zawodników na podstawie wieku, pozycji, słabości kadry i aktualnej kondycji zespołu.
                   </p>
                   <p className="text-[13px] text-slate-200 leading-relaxed">
                     Dodatkowo analiza drużyny pomaga ocenić, które techniczne obszary są dziś najsłabsze, które linie wymagają najwięcej pracy oraz kogo warto traktować jako lidera, wykonawcę wolnych czy karnych. To dobry punkt startowy, jeśli nie chcesz ustawiać wszystkiego ręcznie.
                   </p>
                </div>
             </section>

             <div className="bg-slate-950 p-10 rounded-[50px] border border-white/10">
                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6">Cykle Treningowe</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {[
                     { id: '🧠', name: 'Periodyzacja Taktyczna', attrs: 'Wizja, Ustawianie się' },
                     { id: '⚡', name: 'Gegenpressing', attrs: 'Kondycja, Szybkość' },
                     { id: '👟', name: 'Szkoła Techniczna', attrs: 'Podania, Technika' },
                     { id: '🛡️', name: 'Blok Defensywny', attrs: 'Obrona, Siła' },
                     { id: '🎯', name: 'Instynkt Snajperski', attrs: 'Wykończenie, Atakowanie' },
                     { id: '🚀', name: 'Szybkość i Zwinność', attrs: 'Szybkość, Drybling' },
                     { id: '🪂', name: 'Dominacja w Powietrzu', attrs: 'Gra głową, Siła' },
                     { id: '🧤', name: 'Nowoczesny Bramkarz', attrs: 'Bramkarstwo, Ustawianie się' },
                     { id: '🚩', name: 'Stałe Fragmenty Gry', attrs: 'Wolne, Rożne, Karne' },
                     { id: '🧘', name: 'Odnowa i Joga', attrs: 'Kondycja, +50% regeneracji' },
                     { id: '🔥', name: 'Wysoki Pressing', attrs: 'Pracowitość, Agresja' },
                     { id: '💨', name: 'Kontratak', attrs: 'Szybkość, Atakowanie' },
                   ].map(c => (
                     <div key={c.name} className="bg-slate-900/40 p-5 rounded-2xl border border-white/5">
                        <span className="text-2xl block mb-2">{c.id}</span>
                        <h5 className="text-white font-black uppercase text-xs mb-1">{c.name}</h5>
                        <p className="text-[11px] text-slate-400">{c.attrs}</p>
                     </div>
                   ))}
                </div>
                <p className="text-[13px] text-slate-300 mt-6 italic leading-relaxed">
                  Dobry cykl to taki, który wzmacnia największą słabość drużyny albo wspiera model gry, którym naprawdę chcesz wygrywać mecze. Nie zawsze warto trenować „najlepszy” styl na papierze. Często lepiej wybrać program, który pasuje do obecnej kadry.
                </p>
             </div>

             <div className="bg-black/30 p-10 rounded-[45px] border border-white/10">
                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6">Praktyczny model pracy</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div className="space-y-3">
                      <span className="text-[13px] text-emerald-300 font-black uppercase tracking-[0.25em]">1. Oceń kadrę</span>
                      <p className="text-[13px] text-slate-200 leading-relaxed">Sprawdź, czy bardziej kuleje technika, fizyczność, obrona czy wykończenie. Tu najlepiej pomagają asystent i analiza drużyny.</p>
                   </div>
                   <div className="space-y-3">
                      <span className="text-[13px] text-blue-300 font-black uppercase tracking-[0.25em]">2. Dobierz cykl</span>
                      <p className="text-[13px] text-slate-200 leading-relaxed">Program zespołowy ustawiaj pod problem drużyny albo plan gry, a nie pod jednego zawodnika.</p>
                   </div>
                   <div className="space-y-3">
                      <span className="text-[13px] text-amber-300 font-black uppercase tracking-[0.25em]">3. Ustaw focus</span>
                      <p className="text-[13px] text-slate-200 leading-relaxed">Indywidualny fokus dawaj pod pozycję i największy brak zawodnika. To jeden z najmocniejszych dopalaczy rozwoju.</p>
                   </div>
                   <div className="space-y-3">
                      <span className="text-[13px] text-rose-300 font-black uppercase tracking-[0.25em]">4. Patrz na minuty</span>
                      <p className="text-[13px] text-slate-200 leading-relaxed">Trening bez grania rozwija wolniej. Jeśli chcesz pompować młodego, musisz dać mu też realne występy i oceny meczowe.</p>
                   </div>
                </div>
                <p className="text-[12px] text-slate-400 mt-8 italic leading-relaxed">
                  Rezerwy także rozwijają się osobno, a na ich tempo wpływa jakość szkoleniowa trenera rezerw. To ważne miejsce do prowadzenia projektów długoterminowych, zanim zawodnik wejdzie do pierwszej drużyny.
                </p>
             </div>
          </div>
        );

      case 'FINANCE':
        return (
          <div className="space-y-10 animate-fade-in pb-20">
             <div className="bg-amber-900/20 p-10 rounded-[45px] border border-amber-500/20">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">FINANSE KLUBU I TRANSFERY</h3>
                <p className="text-slate-200 text-[15px] leading-relaxed">
                  Ten moduł łączy ekonomię klubu z rynkiem transferowym, bo w grze jedno napędza drugie. Budżety, ceny biletów, przychody meczowe, wyceny piłkarzy i limity ofert nie są losowe: model stara się zbliżać do realnych danych, publicznych benchmarków, kursów walut i prawdziwych proporcji między ligami, reputacją oraz skalą klubu.
                </p>
             </div>

             <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-950 p-8 rounded-[40px] border border-white/10 space-y-5">
                   <h4 className="text-amber-300 font-black uppercase tracking-[0.22em] text-[15px]">Model Finansowy</h4>
                   <p className="text-[14px] text-slate-200 leading-relaxed">
                     Startowy potencjał finansowy klubu zależy od ligi, kraju, reputacji i skali rynku. Dla rozgrywek europejskich silnik korzysta z publicznych benchmarków przychodowych i przeliczeń walutowych, a dla Polski pilnuje realnych widełek dla Ekstraklasy, 1. ligi, 2. ligi i poziomu regionalnego.
                   </p>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                         <span className="text-[12px] text-white font-black uppercase">Ekstraklasa</span>
                         <p className="text-[13px] text-emerald-300 mt-2 leading-relaxed">Największe budżety, najwyższe ceny dnia meczowego i najszersze sufity transferowe.</p>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                         <span className="text-[12px] text-white font-black uppercase">Niższe ligi</span>
                         <p className="text-[13px] text-sky-300 mt-2 leading-relaxed">Mniejsze pieniądze, niższe koszty i twarde limity na wyceny oraz transfery.</p>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-950 p-8 rounded-[40px] border border-white/10 space-y-5">
                   <h4 className="text-emerald-300 font-black uppercase tracking-[0.22em] text-[15px]">Skąd Klub Bierze Pieniądze</h4>
                   <div className="space-y-3">
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                         <h5 className="text-white font-black uppercase text-[12px] mb-2">📺 Liga, premie i pozycja końcowa</h5>
                         <p className="text-[13px] text-slate-200 leading-relaxed">Na sezon wpływają pieniądze ligowe, bonusy za miejsca w tabeli i premie pucharowe. W Ekstraklasie top tabeli potrafi zmienić skalę całego kolejnego okna.</p>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                         <h5 className="text-white font-black uppercase text-[12px] mb-2">🎫 Bilety i karnety</h5>
                         <p className="text-[13px] text-slate-200 leading-relaxed">Cena biletu zależy od tieru, reputacji i rynku klubu. Karnety są liczone osobno i opierają się na procentowym wykorzystaniu pojemności stadionu.</p>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                         <h5 className="text-white font-black uppercase text-[12px] mb-2">🍿 Dzień meczowy</h5>
                         <p className="text-[13px] text-slate-200 leading-relaxed">Do kasy wpada nie tylko sam bilet. Silnik dolicza catering, merchandising, programy meczowe, LED i parkingi, a wszystko skaluje frekwencją oraz renomą klubu.</p>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                         <h5 className="text-white font-black uppercase text-[12px] mb-2">🏢 VIP i loże</h5>
                         <p className="text-[13px] text-slate-200 leading-relaxed">Duże kluby z odpowiednim stadionem mogą generować roczne wpływy z lóż i stref VIP. To nie jest kosmetyka, tylko realny zastrzyk stabilności dla mocnych organizacji.</p>
                      </div>
                   </div>
                </div>
             </section>

             <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-950 p-8 rounded-[40px] border border-white/10 space-y-5">
                   <h4 className="text-rose-300 font-black uppercase tracking-[0.22em] text-[15px]">Co Obciąża Budżet</h4>
                   <div className="space-y-3">
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                         <h5 className="text-white font-black uppercase text-[12px] mb-2">🏟️ Koszt meczu u siebie</h5>
                         <p className="text-[13px] text-slate-200 leading-relaxed">Organizacja domowego spotkania rośnie wraz z ligą, reputacją, frekwencją i obciążeniem stadionu. Wielki klub płaci za mecz dużo więcej niż średniak czy zespół z niższego poziomu.</p>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                         <h5 className="text-white font-black uppercase text-[12px] mb-2">✈️ Koszt wyjazdu</h5>
                         <p className="text-[13px] text-slate-200 leading-relaxed">Wyjazdy też są liczone osobno. Ich skala zależy od poziomu rozgrywek i renomy klubu, więc napięty kalendarz może naprawdę podjadać budżet.</p>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                         <h5 className="text-white font-black uppercase text-[12px] mb-2">💸 Transfery i bonusy za podpis</h5>
                         <p className="text-[13px] text-slate-200 leading-relaxed">Przy zakupie liczy się nie tylko odstępne. Z budżetu transferowego schodzą też bonus za podpis oraz koszt zakontraktowania pensji na cały uzgodniony okres.</p>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-950 p-8 rounded-[40px] border border-white/10 space-y-5">
                   <h4 className="text-blue-300 font-black uppercase tracking-[0.22em] text-[15px]">Jak Budżet Zmienia Się W Sezonie</h4>
                   <p className="text-[14px] text-slate-200 leading-relaxed">
                     Po każdym meczu symulacja aktualizuje finanse. Gospodarz dostaje wpływy z biletów i dnia meczowego, ale równocześnie płaci za organizację spotkania. Gość ponosi koszt wyjazdu. Dzięki temu stadion, frekwencja i reputacja mają realny wpływ na to, ile możesz później wydać na kadrę.
                   </p>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-emerald-500/20">
                         <span className="text-[12px] text-emerald-300 font-black uppercase">Dom</span>
                         <p className="text-[13px] text-slate-200 mt-2 leading-relaxed">Bilety + dodatki dnia meczowego - koszt organizacji.</p>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-blue-500/20">
                         <span className="text-[12px] text-blue-300 font-black uppercase">Wyjazd</span>
                         <p className="text-[13px] text-slate-200 mt-2 leading-relaxed">Brak wpływów meczowych, ale pojawia się koszt logistyki i wyjazdu.</p>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-amber-500/20">
                         <span className="text-[12px] text-amber-300 font-black uppercase">Sezon</span>
                         <p className="text-[13px] text-slate-200 mt-2 leading-relaxed">Karnety, premie ligowe, puchary i VIP robią różnicę w długim horyzoncie.</p>
                      </div>
                   </div>
                </div>
             </section>

             <div className="bg-slate-950 p-10 rounded-[50px] border border-white/10 space-y-6">
                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Wartość Rynkowa Zawodnika</h4>
                <p className="text-[14px] text-slate-200 leading-relaxed">
                  Wycena piłkarza nie jest jedną liczbą z sufitu. System bierze pod uwagę OVR, wiek pod konkretną pozycję, talent, liczbę meczów w karierze, ostatnie noty, reputację klubu, tier rozgrywek i siłę rynku krajowego. W Polsce dodatkowo działają twarde sufity zależne od ligi i wieku, żeby rynek nie odklejał się od realiów.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div className="bg-slate-900/50 p-5 rounded-3xl border border-white/5">
                      <h5 className="text-white font-black uppercase text-[12px] mb-2">Jakość</h5>
                      <p className="text-[13px] text-slate-200 leading-relaxed">OVR i potencjał ustawiają bazę wyceny.</p>
                   </div>
                   <div className="bg-slate-900/50 p-5 rounded-3xl border border-white/5">
                      <h5 className="text-white font-black uppercase text-[12px] mb-2">Profil wieku</h5>
                      <p className="text-[13px] text-slate-200 leading-relaxed">Inny szczyt wartości ma bramkarz, obrońca, a inny ofensywny zawodnik.</p>
                   </div>
                   <div className="bg-slate-900/50 p-5 rounded-3xl border border-white/5">
                      <h5 className="text-white font-black uppercase text-[12px] mb-2">Forma i doświadczenie</h5>
                      <p className="text-[13px] text-slate-200 leading-relaxed">Historia ocen i rozegrane mecze podbijają wiarygodność zawodnika.</p>
                   </div>
                   <div className="bg-slate-900/50 p-5 rounded-3xl border border-white/5">
                      <h5 className="text-white font-black uppercase text-[12px] mb-2">Rynek</h5>
                      <p className="text-[13px] text-slate-200 leading-relaxed">Reputacja klubu, kraj i liga zmieniają sufit cenowy.</p>
                   </div>
                </div>
             </div>

             <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="bg-slate-950 p-8 rounded-[40px] border border-white/10 space-y-5">
                   <h4 className="text-fuchsia-300 font-black uppercase tracking-[0.22em] text-[15px]">Jak Klub Sprzedający Ustala Cenę</h4>
                   <p className="text-[14px] text-slate-200 leading-relaxed">
                     Punkt wyjścia to realna wycena rynkowa albo cena z listy transferowej, ale później silnik dokłada kontekst sportowy i politykę klubu.
                   </p>
                   <ul className="text-[13px] text-slate-200 space-y-2 leading-relaxed">
                      <li>• długość kontraktu: im mniej czasu zostało, tym trudniej bronić wysokiej ceny</li>
                      <li>• status w drużynie: topowi gracze i filary składu są chronieni dużo mocniej</li>
                      <li>• rywal ligowy: sprzedaż do bezpośredniego konkurenta bywa blokowana albo mocno windowana</li>
                      <li>• termin transferu: teraz, za 6 miesięcy, za 12 miesięcy albo po końcu kontraktu to cztery różne stany negocjacji</li>
                      <li>• potrzeba gotówki i decyzje zarządu: klub pod presją finansową szybciej mięknie</li>
                   </ul>
                </div>

                <div className="bg-slate-950 p-8 rounded-[40px] border border-white/10 space-y-5">
                   <h4 className="text-cyan-300 font-black uppercase tracking-[0.22em] text-[15px]">Jak Kupujący Jest Sprawdzany</h4>
                   <ul className="text-[13px] text-slate-200 space-y-3 leading-relaxed">
                      <li>• oferta nie może przekraczać dostępnego budżetu transferowego</li>
                      <li>• bonus za podpis musi zmieścić się w osobnej puli bonusowej</li>
                      <li>• kontrakt musi mieć od 1 do 5 lat</li>
                      <li>• klub nie przepchnie zakupu, jeśli kadra jest już przeładowana</li>
                      <li>• istnieje twardy sufit „realizmu”, więc absurdalnie przepłacona oferta zostanie zablokowana</li>
                   </ul>
                   <p className="text-[13px] text-slate-300 leading-relaxed">
                     W praktyce oznacza to, że trzeba pilnować całego pakietu, a nie tylko samego odstępnego.
                   </p>
                </div>

                <div className="bg-slate-950 p-8 rounded-[40px] border border-white/10 space-y-5">
                   <h4 className="text-emerald-300 font-black uppercase tracking-[0.22em] text-[15px]">Jak Decyduje Zawodnik</h4>
                   <ul className="text-[13px] text-slate-200 space-y-3 leading-relaxed">
                      <li>• liczy się pensja, bonus za podpis, długość umowy i ogólna wartość pakietu</li>
                      <li>• ważna jest rola w zespole: gwiazda, pierwszy skład, rotacja albo rezerwa</li>
                      <li>• reputacja nowego klubu może pomóc albo wymusić dużo wyższe wymagania</li>
                      <li>• ruch zagraniczny i przejście do słabszego klubu mają własne mnożniki ryzyka</li>
                      <li>• zawodnik z listy transferowej albo z kończącą się umową schodzi z żądań szybciej</li>
                   </ul>
                   <p className="text-[13px] text-slate-300 leading-relaxed">
                     Młodsi mocniej reagują na rozwój i długość kontraktu, a starsi dużo uważniej patrzą na bonus za podpis i bezpieczeństwo finansowe.
                   </p>
                </div>
             </section>

             <div className="bg-red-900/20 p-10 rounded-[50px] border border-red-500/20">
                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6">Kontrola Zarządu i Blokady Ruchów</h4>
                <p className="text-[14px] text-slate-200 leading-relaxed mb-6">
                  Nie każda decyzja managerska przechodzi automatycznie. Zarząd może ograniczyć sprzedaż kluczowego piłkarza, a polityka finansowa pilnuje, żeby klub nie rozjechał się ekonomicznie.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div className="bg-slate-900/50 p-6 rounded-3xl border border-emerald-500/20">
                      <div className="text-emerald-400 font-black text-2xl mb-2">0-29</div>
                      <h5 className="text-white font-black uppercase text-[12px]">ZATWIERDZONO</h5>
                      <p className="text-[12px] text-slate-300 mt-2 leading-relaxed">Zarząd uznaje ruch za bezpieczny.</p>
                   </div>
                   <div className="bg-slate-900/50 p-6 rounded-3xl border border-amber-500/20">
                      <div className="text-amber-400 font-black text-2xl mb-2">30-59</div>
                      <h5 className="text-white font-black uppercase text-[12px]">OSTRZEŻENIE</h5>
                      <p className="text-[12px] text-slate-300 mt-2 leading-relaxed">Decyzja przechodzi, ale zarząd nie jest spokojny.</p>
                   </div>
                   <div className="bg-slate-900/50 p-6 rounded-3xl border border-orange-500/20">
                      <div className="text-orange-400 font-black text-2xl mb-2">60-84</div>
                      <h5 className="text-white font-black uppercase text-[12px]">ODRZUCONO</h5>
                      <p className="text-[12px] text-slate-300 mt-2 leading-relaxed">Ruch zostaje zablokowany i trzeba wrócić do tematu później.</p>
                   </div>
                   <div className="bg-slate-900/50 p-6 rounded-3xl border border-red-500/20">
                      <div className="text-red-400 font-black text-2xl mb-2">85-100</div>
                      <h5 className="text-white font-black uppercase text-[12px]">VETO</h5>
                      <p className="text-[12px] text-slate-300 mt-2 leading-relaxed">Klub nie pozwoli ruszyć takiego zawodnika lub takiej operacji.</p>
                   </div>
                </div>
                <p className="text-[13px] text-slate-200 mt-6 italic leading-relaxed">
                  Topowi gracze z pierwszej jedenastki są szczególnie chronieni, a polityka płacowa pilnuje, żeby wynagrodzenia nie odjechały względem możliwości klubu.
                </p>
             </div>
          </div>
        );

      case 'CONTRACTS':
        return (
          <div className="space-y-10 animate-fade-in pb-20">
             <div className="bg-blue-900/20 p-10 rounded-[45px] border border-blue-500/20">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Negocjacje Kontraktowe</h3>
                <p className="text-slate-300">Sztuka negocjacji to balans między oczekiwaniami zawodnika a możliwościami klubu.</p>
             </div>

             <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <h4 className="text-blue-400 font-black uppercase tracking-widest text-sm flex items-center gap-3">
                      <span className="w-6 h-px bg-blue-500/30" /> Struktura Oferty
                   </h4>
                   <p className="text-xs text-slate-400 leading-relaxed">
                     Każda oferta składa się z dwóch kluczowych elementów:
                   </p>
                   <div className="space-y-3 mt-4">
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-blue-500/20">
                         <span className="text-blue-400 font-black uppercase text-xs">📋 Roczna Pensja</span>
                         <p className="text-[10px] text-slate-400 mt-2">
                           Podstawa negocjacji. Zawodnicy porównują ofertę do obecnej pensji i wartości rynkowej.
                         </p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-amber-500/20">
                         <span className="text-amber-400 font-black uppercase text-xs">💰 Bonus za Podpis</span>
                         <p className="text-[10px] text-slate-400 mt-2">
                           Jednorazowa płatność (25-100% rocznej pensji). Weterani (32+) cenią bonusy bardziej niż młodzi.
                         </p>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <h4 className="text-emerald-400 font-black uppercase tracking-widest text-sm flex items-center gap-3">
                      <span className="w-6 h-px bg-emerald-500/30" /> Etapy Negocjacji
                   </h4>
                   <div className="space-y-3">
                      <div className="flex items-center gap-4">
                         <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-xs">0</span>
                         <p className="text-xs text-slate-400">Pierwsza oferta - największe szanse na sukces</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="w-8 h-8 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-xs">1</span>
                         <p className="text-xs text-slate-400">Druga oferta - zawodnik oczekuje ustępstw</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-black flex items-center justify-center text-xs">2</span>
                         <p className="text-xs text-slate-400">Trzecia oferta - ostatnia szansa przed zerwaniem</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="w-8 h-8 rounded-full bg-red-500 text-white font-black flex items-center justify-center text-xs">3</span>
                         <p className="text-xs text-slate-400">Czwarta oferta - prawie pewne zerwanie negocjacji</p>
                      </div>
                   </div>
                   <p className="text-[10px] text-red-400 italic mt-4">
                     Po 3 nieudanych próbach zawodnik może zostać trwale zablokowany (`isNegotiationPermanentBlocked`).
                   </p>
                </div>
             </section>

             <div className="bg-slate-950 p-10 rounded-[50px] border border-white/10">
                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6">Mechanika Akceptacji</h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  System ocenia ofertę na podstawie kilku czynników:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                         <h5 className="text-white font-black uppercase text-xs mb-3">📊 Progi Akceptacji</h5>
                         <ul className="text-xs text-slate-400 space-y-2">
                            <li>• <span className="text-emerald-400 font-bold">Final Score ≥ 0.98:</span> Natychmiastowa zgoda</li>
                            <li>• <span className="text-blue-400 font-bold">0.70 - 0.97:</span> Kontroferta (żądanie 5-25% więcej)</li>
                            <li>• <span className="text-red-400 font-bold">&lt; 0.65:</span> "Progu Godności" - automatyczna odmowa</li>
                         </ul>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                         <h5 className="text-white font-black uppercase text-xs mb-3">⚖️ Wpływ Wiek</h5>
                         <ul className="text-xs text-slate-400 space-y-2">
                            <li>• <span className="text-white font-bold">Weterani (32+):</span> Cenią bonusy (waga 50%)</li>
                            <li>• <span className="text-white font-bold">Dorośli (24-31):</span> Standardowe wagi</li>
                            <li>• <span className="text-white font-bold">Młodzi (≤23):</span> Cenią pensję (waga 70%)</li>
                         </ul>
                      </div>
                   </div>
                </div>
                <div className="mt-6 bg-amber-900/20 p-6 rounded-3xl border border-amber-500/20">
                   <h5 className="text-amber-400 font-black uppercase text-xs mb-3">💡 Wskazówki Negocjacyjne</h5>
                   <ul className="text-xs text-slate-400 space-y-2">
                      <li>• <span className="text-white font-bold">Wymienialność:</span> Nadwyżka w pensji rekompensuje bonus w skali 1:2.5</li>
                      <li>• <span className="text-white font-bold">10% zasada:</span> Oferta w 15% poniżej oczekiwań ma 10% szans na akceptację</li>
                      <li>• <span className="text-white font-bold">9/10 przypadków:</span> Zawodnik żąda 5-25% więcej niż obecna pensja</li>
                   </ul>
                </div>
             </div>
          </div>
        );

      case 'CALENDAR':
        return (
          <div className="space-y-10 animate-fade-in pb-20">
             <div className="bg-purple-900/20 p-10 rounded-[45px] border border-purple-500/20">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Kalendarz Sezonu</h3>
                <p className="text-slate-300">Sezon piłkarski to maraton, nie sprint. Zaplanuj swoją strategię z wyprzedzeniem.</p>
             </div>

             <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <h4 className="text-purple-400 font-black uppercase tracking-widest text-sm flex items-center gap-3">
                      <span className="w-6 h-px bg-purple-500/30" /> Struktura Sezonu
                   </h4>
                   <p className="text-xs text-slate-400 leading-relaxed">
                     Sezon trwa od **1 Lipca** do **30 Czerwca**. Miesiące w grze używają indeksowania JavaScript (Lipiec = 6, Styczeń = 0).
                   </p>
                   <div className="space-y-2 mt-4">
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                         <span className="text-xs text-white font-bold">Start sezonu</span>
                         <span className="text-xs text-purple-400 font-black">1 Lipca</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                         <span className="text-xs text-white font-bold">Przerwa zimowa</span>
                         <span className="text-xs text-blue-400 font-black">18 Gru - 7 Sty</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                         <span className="text-xs text-white font-bold">Koniec ligi</span>
                         <span className="text-xs text-emerald-400 font-black">23 Maja</span>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-900/50 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <h4 className="text-amber-400 font-black uppercase tracking-widest text-sm flex items-center gap-3">
                      <span className="w-6 h-px bg-amber-500/30" /> Okna Transferowe
                   </h4>
                   <div className="space-y-3">
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-emerald-500/20">
                         <span className="text-emerald-400 font-black uppercase text-xs">☀️ Letnie Okno</span>
                         <p className="text-[10px] text-slate-400 mt-2">
                           <span className="text-white font-bold">9 Lipca - 1 Października</span>
                         </p>
                         <p className="text-[9px] text-slate-500 mt-1">Główne okno, najwięcej transferów</p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-blue-500/20">
                         <span className="text-blue-400 font-black uppercase text-xs">❄️ Zimowe Okno</span>
                         <p className="text-[10px] text-slate-400 mt-2">
                           <span className="text-white font-bold">24 Stycznia - 24 Lutego</span>
                         </p>
                         <p className="text-[9px] text-slate-500 mt-1">Mniejsze okno, korekty składu</p>
                      </div>
                   </div>
                </div>
             </section>

             <div className="bg-slate-950 p-10 rounded-[50px] border border-white/10">
                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6">📅 Oś Czasu Sezonu</h4>
                <div className="space-y-4">
                   <div className="flex gap-4 items-start">
                      <div className="w-24 shrink-0 text-xs font-black text-purple-400 uppercase">Lipiec</div>
                      <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                         <p className="text-xs text-slate-300">Start sezonu, Superpuchar, 1/64 Pucharu Polski, kwalifikacje europejskie</p>
                      </div>
                   </div>
                   <div className="flex gap-4 items-start">
                      <div className="w-24 shrink-0 text-xs font-black text-purple-400 uppercase">Sierpień</div>
                      <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                         <p className="text-xs text-slate-300">Start ligi, 1/32 Pucharu Polski, faza grupowa LM/LE/LK</p>
                      </div>
                   </div>
                   <div className="flex gap-4 items-start">
                      <div className="w-24 shrink-0 text-xs font-black text-purple-400 uppercase">Wrz-Paź</div>
                      <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                         <p className="text-xs text-slate-300">Kontynuacja ligi, 1/16 Pucharu Polski, zamknięcie okna transferowego</p>
                      </div>
                   </div>
                   <div className="flex gap-4 items-start">
                      <div className="w-24 shrink-0 text-xs font-black text-purple-400 uppercase">Lis-Gru</div>
                      <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                         <p className="text-xs text-slate-300">1/8 Pucharu Polski, ostatnie kolejki przed przerwą, losowania 1/8 LM/LE/LK</p>
                      </div>
                   </div>
                   <div className="flex gap-4 items-start">
                      <div className="w-24 shrink-0 text-xs font-black text-purple-400 uppercase">Sty-Lut</div>
                      <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                         <p className="text-xs text-slate-300">Wznowienie ligi, 1/8 LM/LE/LK, zimowe okno transferowe, 1/4 finałów</p>
                      </div>
                   </div>
                   <div className="flex gap-4 items-start">
                      <div className="w-24 shrink-0 text-xs font-black text-purple-400 uppercase">Mar-Kwi</div>
                      <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                         <p className="text-xs text-slate-300">1/4 i 1/2 Pucharu Polski, ćwierćfinały i półfinały LM/LE/LK</p>
                      </div>
                   </div>
                   <div className="flex gap-4 items-start">
                      <div className="w-24 shrink-0 text-xs font-black text-purple-400 uppercase">Maj</div>
                      <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                         <p className="text-xs text-slate-300">Finał Pucharu Polski (2 Maja), koniec ligi (23 Maja), finały europejskie (20-30 Maja)</p>
                      </div>
                   </div>
                   <div className="flex gap-4 items-start">
                      <div className="w-24 shrink-0 text-xs font-black text-purple-400 uppercase">Czerwiec</div>
                      <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                         <p className="text-xs text-slate-300">Zarząd/urlopy, reprezentacja, koniec sezonu (29 Czerwca)</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-blue-900/20 p-10 rounded-[50px] border border-blue-500/20">
                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6">🌡️ Pogoda w Polsce</h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Warunki pogodowe wpływają na styl gry i kondycję zawodników.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                      <div className="text-2xl mb-3">❄️</div>
                      <h5 className="text-white font-black uppercase text-xs mb-2">Zima</h5>
                      <p className="text-[9px] text-slate-500">-8°C do 5°C, zamiecie, mróz</p>
                   </div>
                   <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                      <div className="text-2xl mb-3">🌧️</div>
                      <h5 className="text-white font-black uppercase text-xs mb-2">Wiosna</h5>
                      <p className="text-[9px] text-slate-500">-1°C do 16°C, deszcz, wiatr</p>
                   </div>
                   <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                      <div className="text-2xl mb-3">☀️</div>
                      <h5 className="text-white font-black uppercase text-xs mb-2">Lato</h5>
                      <p className="text-[9px] text-slate-500">13°C do 27°C, burze, upał</p>
                   </div>
                   <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                      <div className="text-2xl mb-3">🍂</div>
                      <h5 className="text-white font-black uppercase text-xs mb-2">Jesień</h5>
                      <p className="text-[9px] text-slate-500">0°C do 20°C, mgła, deszcz</p>
                   </div>
                </div>
                <p className="text-xs text-slate-400 mt-6 italic">
                  Wiatr: 0-55 km/h | Burze z piorunami (12% latem) | Zamiecie śnieżne (7% zimą)
                </p>
             </div>
          </div>
        );

      case 'MATCHDAY':
        return (
          <div className="space-y-10 animate-fade-in pb-20">
             <div className="relative h-64 bg-slate-900 rounded-[50px] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1500')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950" />
                <h3 className="text-5xl font-black italic text-white uppercase tracking-tighter relative z-10 text-center">90 Minut Prawdy</h3>
             </div>

             <div className="space-y-8">
                <div className="flex gap-8 items-start">
                   <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl shrink-0 shadow-lg">📺</div>
                   <div>
                      <h4 className="text-white font-black uppercase text-lg mb-2 italic">Studio Przedmeczowe</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">To tutaj dowiesz się wszystkiego o rywalu. Sprawdź atrybuty przeciwnika, sędziego oraz pogodę. Każdy z tych elementów powinien wpłynąć na Twoją taktykę.</p>
                   </div>
                </div>
                <div className="flex gap-8 items-start">
                   <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-3xl shrink-0 shadow-lg">⚡</div>
                   <div>
                      <h4 className="text-white font-black uppercase text-lg mb-2 italic">Interakcja Live</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">Mecz można pauzować, aby dokonać zmian taktycznych. Pasek Momentum reaguje na każde Twoje polecenie. Przycisk SPEED (x5) pozwala przeskoczyć fragmenty gry.</p>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'TIPS':
        return (
          <div className="space-y-8 animate-fade-in pb-20">
             <div className="bg-amber-500/10 border border-amber-500/20 p-10 rounded-[45px] shadow-2xl">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Sekrety Profesjonalistów</h3>
                <p className="text-slate-300 text-lg">Triki, które pozwolą Ci wygrać ligę już w pierwszym sezonie.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900/60 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <div className="text-2xl">🔁</div>
                   <h5 className="text-white font-black uppercase text-sm italic">Rotacja to podstawa</h5>
                   <p className="text-[11px] text-slate-500 leading-relaxed italic">Nigdy nie graj tym samym składem przez 3 mecze z rzędu. Zawodnik z kondycją 70% gra znacznie gorzej niż jego słabszy zmiennik ze 100% energii.</p>
                </div>
                <div className="bg-slate-900/60 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <div className="text-2xl">🧠</div>
                   <h5 className="text-white font-black uppercase text-sm italic">Czekaj na błąd AI</h5>
                   <p className="text-[11px] text-slate-500 leading-relaxed italic">Jeśli AI prowadzi i jest 80. minuta, przejdzie na defensywne 5-4-1. Zmień wtedy taktykę na 3-4-3 i rzuć wszystkie siły do ataku - momentum eksploduje.</p>
                </div>
                <div className="bg-slate-900/60 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <div className="text-2xl">🌧️</div>
                   <h5 className="text-white font-black uppercase text-sm italic">Dostosuj się do pogody</h5>
                   <p className="text-[11px] text-slate-500 leading-relaxed italic">W deszczu graj prostszą piłkę (Tempo FAST, Technika mniej ważna). W upale (&gt;25°C) zmień intensywność na Ostrożnie, by uniknąć kontuzji.</p>
                </div>
                <div className="bg-slate-900/60 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <div className="text-2xl">💰</div>
                   <h5 className="text-white font-black uppercase text-sm italic">Poluj na wolne agenty</h5>
                   <p className="text-[11px] text-slate-500 leading-relaxed italic">Zawodnicy z wygasającym kontraktem (6 miesięcy) są tańsi. Młodzi (&lt;23 lata) z OVR 65-70 to ukryte perełki.</p>
                </div>
                <div className="bg-slate-900/60 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <div className="text-2xl">📊</div>
                   <h5 className="text-white font-black uppercase text-sm italic">Forma &gt; OVR</h5>
                   <p className="text-[11px] text-slate-500 leading-relaxed italic">Zawodnik z formą (seria 3+ wygranych) gra o 10-15% lepiej niż jego OVR. Sprawdzaj ratingHistory przed meczem!</p>
                </div>
                <div className="bg-slate-900/60 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <div className="text-2xl">🎯</div>
                   <h5 className="text-white font-black uppercase text-sm italic">Taktuj puchary</h5>
                   <p className="text-[11px] text-slate-500 leading-relaxed italic">W pucharach (KO) jedna bramka decyduje. Graj bezpieczniej u siebie na wyjazd, ryzykuj u siebie w rewanżu.</p>
                </div>
                <div className="bg-slate-900/60 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <div className="text-2xl">🏥</div>
                   <h5 className="text-white font-black uppercase text-sm italic">Zarządzaj kontuzjami</h5>
                   <p className="text-[11px] text-slate-500 leading-relaxed italic">Lekki uraz (3-10 dni) = rotacja. Poważny (14-45 dni) = szukaj zastępstwa. Nie ryzykuj gry kontuzjowanych w ważnych meczach.</p>
                </div>
                <div className="bg-slate-900/60 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <div className="text-2xl">📈</div>
                   <h5 className="text-white font-black uppercase text-sm italic">Trenuj mądrze</h5>
                   <p className="text-[11px] text-slate-500 leading-relaxed italic">Młodzi (&lt;21) rosną najszybciej. Daj im Heavy trening w okresie bez meczów. Weteranom (32+) daj Light dla regeneracji.</p>
                </div>
                <div className="bg-slate-900/60 p-8 rounded-[35px] border border-white/5 space-y-4">
                   <div className="text-2xl">⚖️</div>
                   <h5 className="text-white font-black uppercase text-sm italic">Czytaj sędziów</h5>
                   <p className="text-[11px] text-slate-500 leading-relaxed italic">Surowy sędzia (Strictness &gt;70) = unikaj agresywnego pressingu. Niska Konsekwencja (&lt;50) = sędzia "gubi się" pod koniec meczu.</p>
                </div>
             </div>

             <div className="bg-emerald-900/20 p-10 rounded-[50px] border border-emerald-500/20 mt-8">
                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6">🏆 Droga do Mistrzostwa</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-3">
                      <div className="text-3xl">📅</div>
                      <h5 className="text-white font-black uppercase text-sm">Sezon 1: Stabilizacja</h5>
                      <p className="text-[10px] text-slate-400">Utrzymaj się w lidze, zbuduj zrąb drużyny, poznaj mechanikę. Cel: środek tabeli.</p>
                   </div>
                   <div className="space-y-3">
                      <div className="text-3xl">📈</div>
                      <h5 className="text-white font-black uppercase text-sm">Sezon 2-3: Rozwój</h5>
                      <p className="text-[10px] text-slate-400">Inwestuj w młodzież, walcz o puchary europejskie. Cel: TOP 6.</p>
                   </div>
                   <div className="space-y-3">
                      <div className="text-3xl">👑</div>
                      <h5 className="text-white font-black uppercase text-sm">Sezon 4+: Dominacja</h5>
                      <p className="text-[10px] text-slate-400">Buduj drużynę Ligi Mistrzów, przyciągaj gwiazdy. Cel: Mistrzostwo i LM.</p>
                   </div>
                </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col animate-fade-in overflow-hidden relative">
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[200px] opacity-20 bg-blue-600" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[180px] opacity-20 bg-emerald-600" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      </div>

      <div className="flex items-center justify-between px-12 py-10 bg-slate-900/60 border-b border-white/10 backdrop-blur-3xl shrink-0 z-20 shadow-2xl">
         <div className="flex items-center gap-10">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-inner transform -rotate-6">📖</div>
            <div>
               <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">BIBLIA MANAGERA</h1>
               <p className="text-blue-400 text-xs font-black uppercase tracking-[0.5em] mt-4 opacity-80">Wszystkie sekrety symulacji w jednym miejscu</p>
            </div>
         </div>
         <button 
           onClick={() => navigateTo(previousViewState ?? ViewState.START_MENU)}
           className="group px-12 py-5 rounded-2xl bg-white text-slate-900 font-black italic uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.2)] flex items-center gap-4"
         >
           POWRÓT DO MENU <span className="text-xl">↩</span>
         </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 bg-black/40 border-r border-white/10 flex flex-col p-6 z-10 backdrop-blur-3xl">
           <div className="space-y-3">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`w-full flex items-center justify-between p-6 rounded-3xl transition-all border group
                    ${activeTab === cat.id 
                      ? 'bg-white/10 border-white/20 shadow-2xl scale-[1.03] translate-x-2' 
                      : 'bg-transparent border-transparent hover:bg-white/5 text-slate-500'}
                  `}
                >
                  <div className="flex items-center gap-6">
                    <span className={`text-3xl transform transition-transform group-hover:scale-125 ${activeTab === cat.id ? 'opacity-100' : 'opacity-30'}`}>{cat.icon}</span>
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${activeTab === cat.id ? 'text-white' : 'group-hover:text-slate-300'}`}>{cat.label}</span>
                  </div>
                </button>
              ))}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-16 bg-slate-950/40 backdrop-blur-md">
           <div className="max-w-5xl mx-auto">
              {renderContent()}
           </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};
