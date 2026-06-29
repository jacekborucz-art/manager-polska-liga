import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ProcessingOptions = {
  title?: string;
  message?: string;
  status?: string;
  minVisibleMs?: number;
};

type ProcessingState = Required<ProcessingOptions>;

type ProcessingContextValue = {
  isProcessing: boolean;
  runWithProcessing: <T>(task: () => T | Promise<T>, options?: ProcessingOptions) => Promise<T>;
};

const ProcessingContext = createContext<ProcessingContextValue | undefined>(undefined);

export const PROCESSING_TIPS = [
  'Piłkarz ustawiony poza naturalną pozycją może tracić efektywność nawet wtedy, gdy jego ogólna ocena wygląda dobrze.',
  'Zmęczony obrońca zwiększa szansę rywala na groźną akcję w końcówce meczu.',
  'Agresywny pressing potrafi odzyskać inicjatywę, ale podnosi ryzyko fauli, kartek i urazów.',
  'Kontra jest najgroźniejsza wtedy, gdy rywal wysoko atakuje i zostawia wolne przestrzenie.',
  'Dobra ławka rezerwowych pomaga w rotacji i zmniejsza spadek jakości w końcówce sezonu.',
  'Młodzi zawodnicy rozwijają się szybciej, gdy dostają minuty dopasowane do aktualnego poziomu presji.',
  'Pierwsze dni lipca są najcięższe dla silnika, bo gra przelicza kadry, finanse, kontrakty i ruchy AI.',
  'Forma bramkarza i jego zmęczenie mogą zmienić jakość obrony nawet przy tej samej taktyce.',
  'Zbyt defensywna postawa po prowadzeniu może oddać rywalowi inicjatywę zamiast spokojnie zamknąć mecz.',
  'Raporty sztabu są dokładniejsze, gdy klub ma lepszą jakość analizy i stabilniejszy dział sportowy.',
  'Zawodnik z wysoką determinacją częściej utrzymuje formę po słabszym występie.',
  'Szeroka kadra pomaga przetrwać terminarz, ale zbyt wielu niezadowolonych rezerwowych może psuć atmosferę.',
  'Najtańszy transfer nie zawsze jest okazją, jeśli zawodnik ma wysoką pensję i niską odporność na presję.',
  'Mecz po krótkiej przerwie bardziej premiuje zespoły z dobrą kondycją i rozsądną rotacją.',
  'Długie podania mogą szybciej przesunąć grę pod bramkę rywala, ale zwiększają ryzyko strat.',
  'Krótkie podania pomagają kontrolować tempo, szczególnie gdy drużyna prowadzi i nie musi ryzykować.',
  'Neutralna postawa nie jest brakiem decyzji, tylko próbą utrzymania równowagi między ryzykiem a kontrolą.',
  'Ofensywna postawa może dać więcej sytuacji, ale odkrywa przestrzenie za plecami obrońców.',
  'Defensywna postawa najlepiej działa wtedy, gdy zespół ma szybkich zawodników do kontrataków.',
  'Im więcej minut gra młody piłkarz, tym ważniejsze staje się pilnowanie jego zmęczenia.',
  'Kapitan z dobrym morale potrafi ustabilizować drużynę po serii słabszych wyników.',
  'Kontuzje częściej pojawiają się przy dużym zmęczeniu i intensywnym stylu gry.',
  'Wysokie premie mogą pomóc w negocjacjach, ale z czasem obciążają budżet płac.',
  'Krótka seria zwycięstw potrafi podnieść oceny meczowe, bo zawodnicy grają pewniej.',
  'Słaba atmosfera w szatni może obniżyć jakość gry nawet wtedy, gdy skład wygląda mocno na papierze.',
  'Rezerwowy z dobrym nastawieniem bywa ważniejszy niż gwiazda, która źle znosi brak minut.',
  'W pucharach jeden słabszy wieczór może ważyć więcej niż cały miesiąc solidnej formy ligowej.',
  'Derby częściej generują nerwowe mecze, większą presję i ostrzejszą walkę o środek pola.',
  'Zespół z niską pewnością siebie częściej traci kontrolę po pierwszej straconej bramce.',
  'Bramka tuż przed przerwą potrafi mocno zmienić przebieg drugiej połowy.',
  'Dobrze dobrana taktyka może ukryć jedną słabszą pozycję, ale rzadko ukrywa trzy naraz.',
  'Silny środek pola pomaga ograniczyć liczbę akcji rywala, nawet bez bardzo ofensywnego ustawienia.',
  'Szybcy boczni obrońcy są szczególnie cenni, gdy drużyna gra szeroko i wysoko.',
  'Napastnik bez gola nadal może zagrać dobry mecz, jeśli wiąże obrońców i tworzy przestrzeń.',
  'Asysta nie zawsze pokazuje całą wartość pomocnika, bo kluczowe może być wcześniejsze podanie.',
  'Zawodnik po urazie może potrzebować kilku spotkań, żeby wrócić do pełnego rytmu.',
  'Przewaga w posiadaniu piłki nie gwarantuje zwycięstwa, jeśli brakuje strzałów z dobrych pozycji.',
  'Drużyna oddająca mniej strzałów może wygrać, jeśli ma lepszą jakość sytuacji.',
  'Rzuty rożne są groźniejsze, gdy w składzie są wysocy obrońcy i dobrzy wykonawcy stałych fragmentów.',
  'Kartka dla defensywnego pomocnika może zmusić cały zespół do ostrożniejszego pressingu.',
  'Czerwona kartka nie zawsze kończy mecz, ale prawie zawsze zmienia jego tempo.',
  'Mocny bramkarz potrafi utrzymać drużynę w meczu, którego statystyki wyglądają źle.',
  'Zbyt częste zmiany taktyki mogą utrudnić zespołowi złapanie automatyzmów.',
  'Stabilny skład pomaga budować zgranie, ale bez rotacji szybciej rośnie zmęczenie.',
  'Młody zawodnik z dużym potencjałem nie zawsze jest gotowy na mecze o najwyższą stawkę.',
  'Doświadczony piłkarz często lepiej reaguje na presję końcówki sezonu.',
  'Rywal po serii porażek bywa groźny, bo gra ostrożniej i mocniej walczy o każdy punkt.',
  'Mecz wyjazdowy może być trudniejszy, jeśli zespół jest zmęczony podróżą i ma krótki odpoczynek.',
  'Głęboka defensywa ogranicza przestrzeń, ale może zaprosić rywala do większej liczby dośrodkowań.',
  'Wysoka linia obrony wymaga szybkich stoperów i bramkarza gotowego wychodzić z bramki.',
  'Pressing najlepiej działa, gdy cała drużyna porusza się razem, a nie tylko pojedynczy zawodnicy.',
  'Zbyt wolne tempo może uspokoić mecz, ale czasem ułatwia rywalowi ustawienie obrony.',
  'Szybkie tempo pomaga zaskoczyć rywala, ale częściej prowadzi do strat i spadku kondycji.',
  'Piłkarz z niskim morale może podejmować gorsze decyzje w prostych sytuacjach.',
  'Dobry skauting ogranicza ryzyko transferu, ale nigdy nie usuwa go całkowicie.',
  'Zawodnik z kończącym się kontraktem może być okazją, jeśli pasuje do stylu gry.',
  'Zbyt wysoka pensja jednego piłkarza może rozbić strukturę płac w całej szatni.',
  'Sprzedaż rezerwowego czasem poprawia budżet i atmosferę bardziej niż kolejny transfer do klubu.',
  'Awans do europejskich pucharów zwiększa prestiż, ale mocno obciąża terminarz.',
  'Krótka ławka w europejskich pucharach może odbić się na formie ligowej.',
  'W barażach ważna jest nie tylko jakość drużyny, ale też odporność na presję.',
  'Finały pucharów częściej nagradzają zespoły, które potrafią cierpliwie czekać na moment.',
  'Czasem najlepszą zmianą jest zdjęcie zmęczonego lidera, zanim popełni kosztowny błąd.',
  'Zawodnik z wysoką pracowitością szybciej odnajduje się w intensywnych zadaniach taktycznych.',
  'Słaby wynik nie zawsze oznacza złą taktykę, jeśli rywal miał wyjątkowo skuteczny dzień.',
  'Seria czystych kont buduje pewność obrony i bramkarza.',
  'Drużyna po awansie często potrzebuje czasu, żeby przyzwyczaić się do wyższego poziomu ligi.',
  'Najlepszy moment na rotację bywa przed trudnym meczem, a nie dopiero po nim.',
  'Zbyt późne zmiany mogą nie zdążyć odwrócić meczu, nawet jeśli są logiczne.',
  'Zawodnik grający regularnie na jednej pozycji szybciej buduje stabilność ocen.',
  'Wysoka forma jednego skrzydłowego może zmusić rywali do przesunięcia całej obrony.',
  'Silnik meczu bierze pod uwagę nie tylko oceny, ale też role, zmęczenie, morale i przebieg spotkania.',
  'Niektóre dni kariery są liczone dłużej, bo gra aktualizuje wiele lig, kadr i raportów naraz.',
  'Dobre wyniki juniorów mogą z czasem dać tańszą alternatywę dla drogich transferów.',
  'Zawodnik z wysoką ambicją może szybciej naciskać na transfer, jeśli klub nie spełnia jego celów.',
  'Czasem remis na wyjeździe jest dobrym wynikiem, jeśli terminarz i forma są przeciwko drużynie.',
  'Kontrola meczu to nie tylko posiadanie piłki, ale też ograniczanie najgroźniejszych stref rywala.',
  'Najlepsze zespoły wygrywają różne typy meczów: otwarte, zamknięte, brzydkie i nerwowe.',
  'Dobre przygotowanie fizyczne pomaga utrzymać jakość pressingu przez większą część meczu.',
  'Zawodnik z wysoką koncentracją rzadziej popełnia proste błędy w końcówkach spotkań.',
  'Silny rezerwowy na skrzydle może być idealną bronią na zmęczonych bocznych obrońców.',
  'Zmiana tempa w trakcie meczu potrafi zaskoczyć rywala bardziej niż sama zmiana ustawienia.',
  'Drużyna bez liderów mentalnych może mieć problem z odwracaniem trudnych spotkań.',
  'Wysoka skuteczność strzałów bywa chwilowa, dlatego warto patrzeć także na liczbę tworzonych sytuacji.',
  'Słaba skuteczność nie zawsze oznacza kryzys, jeśli zespół regularnie dochodzi do dobrych okazji.',
  'Mocna akademia pozwala planować kadrę kilka sezonów do przodu.',
  'Zbyt szybkie wprowadzanie juniora do pierwszego składu może zatrzymać jego rozwój zamiast go przyspieszyć.',
  'Dobry balans między doświadczeniem a młodością pomaga przejść przez długi sezon.',
  'Zawodnik po świetnym sezonie może oczekiwać większej roli albo lepszego kontraktu.',
  'Czasem opłaca się sprzedać piłkarza w szczycie wartości, zanim jego forma zacznie spadać.',
  'Klub z dobrą reputacją łatwiej przyciąga zawodników, nawet jeśli nie oferuje najwyższej pensji.',
  'Mecze po przerwie reprezentacyjnej bywają nieprzewidywalne przez zmęczenie i zmianę rytmu.',
  'Stałe fragmenty gry mogą rozstrzygać spotkania, w których żadna drużyna nie dominuje z gry.',
  'Obrońca z dobrą szybkością lepiej zabezpiecza przestrzeń za wysoko ustawioną linią.',
  'Pomocnik z wysoką inteligencją boiskową może poprawić płynność gry bez efektownych statystyk.',
  'Napastnik z dobrą grą tyłem do bramki pomaga drużynie utrzymać piłkę pod presją.',
  'Zbyt wielu piłkarzy o podobnym profilu może ograniczyć elastyczność taktyczną.',
  'Czasem lepiej mieć jednego specjalistę od stałych fragmentów niż kilku przeciętnych wykonawców.',
  'Dobra seria u siebie potrafi zbudować przewagę psychologiczną przed trudniejszymi rywalami.',
  'Słaba forma wyjazdowa często wymaga prostszego planu gry i mniejszego ryzyka.',
  'Mecz z teoretycznie słabszym rywalem nadal może być pułapką, jeśli drużyna jest przemęczona.',
  'Wysoka intensywność treningu może przyspieszyć rozwój, ale zwiększa ryzyko przeciążenia.',
  'Lekki trening przed ważnym meczem pomaga zachować świeżość najważniejszych zawodników.',
  'Zawodnik z dobrą wszechstronnością daje trenerowi więcej opcji przy kontuzjach i kartkach.',
  'Nie każdy transfer musi być gwiazdą, czasem najważniejszy jest brakujący profil w kadrze.',
  'Drużyna prowadząca jednym golem nadal musi tworzyć zagrożenie, żeby nie oddać pełnej kontroli rywalowi.',
  'W końcówce sezonu terminarz potrafi być równie trudnym przeciwnikiem jak rywale na boisku.',
  'Najlepsza taktyka to taka, którą potrafią wykonać konkretni zawodnicy dostępni w danym dniu.',
];

export const getRandomProcessingTip = () =>
  PROCESSING_TIPS[Math.floor(Math.random() * PROCESSING_TIPS.length)] ?? PROCESSING_TIPS[0];

const waitForPaint = () =>
  new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

const wait = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms));

export const ProcessingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [processing, setProcessing] = useState<ProcessingState | null>(null);

  const runWithProcessing = useCallback(async <T,>(task: () => T | Promise<T>, options: ProcessingOptions = {}): Promise<T> => {
    const randomTip = getRandomProcessingTip();
    const nextProcessing: ProcessingState = {
      title: options.title ?? 'Czy wiesz, że?',
      message: options.message ?? randomTip,
      status: options.status ?? 'Przetwarzam dane kariery',
      minVisibleMs: options.minVisibleMs ?? 350,
    };
    const startedAt = performance.now();
    setProcessing(nextProcessing);
    await waitForPaint();

    try {
      return await task();
    } finally {
      const elapsed = performance.now() - startedAt;
      if (elapsed < nextProcessing.minVisibleMs) {
        await wait(nextProcessing.minVisibleMs - elapsed);
      }
      setProcessing(null);
    }
  }, []);

  const value = useMemo<ProcessingContextValue>(() => ({
    isProcessing: processing !== null,
    runWithProcessing,
  }), [processing, runWithProcessing]);

  return (
    <ProcessingContext.Provider value={value}>
      {children}
      {processing && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/82 backdrop-blur-[4px]">
          <div className="relative w-[520px] max-w-[calc(100vw-32px)] overflow-hidden border-2 border-cyan-200/45 bg-[#030814] px-9 py-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.9),0_0_36px_rgba(34,211,238,0.16)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
            <div className="mx-auto mb-5 h-12 w-12 rounded-full border-4 border-cyan-300/25 border-t-cyan-100 animate-spin" />
            <h2 className="font-black italic uppercase tracking-tighter text-3xl leading-none text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {processing.title}
            </h2>
            <p className="font-black italic uppercase tracking-tighter mx-auto mt-5 max-w-[430px] text-base leading-snug text-cyan-50 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {processing.message}
            </p>
            <p className="font-black italic uppercase tracking-tighter mt-5 text-xs leading-snug text-white/75">
              {processing.status}
            </p>
            <p className="font-black italic uppercase tracking-tighter mx-auto mt-4 max-w-[440px] text-[11px] leading-snug text-yellow-200">
              Jeśli przeglądarka pokaże komunikat, że strona nie odpowiada, nie martw się i poczekaj. Gra nadal przetwarza dane.
            </p>
            <div className="mt-7 h-1 w-full overflow-hidden bg-white/15">
              <div className="h-full w-1/2 animate-pulse bg-cyan-200" />
            </div>
          </div>
        </div>
      )}
    </ProcessingContext.Provider>
  );
};

export const useProcessing = () => {
  const context = useContext(ProcessingContext);
  if (!context) throw new Error('useProcessing must be used within ProcessingProvider');
  return context;
};
