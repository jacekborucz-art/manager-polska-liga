import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SoccerBall } from './SoccerBall';

type ProcessingOptions = {
  title?: string;
  message?: string;
  status?: string;
  minVisibleMs?: number;
};

type ProcessingStep = {
  id: string;
  label: string;
  status: 'ACTIVE' | 'DONE' | 'ERROR';
  startedAt: number;
  elapsedMs?: number;
};

type ProcessingState = Required<ProcessingOptions> & {
  steps: ProcessingStep[];
};

type ProcessingContextValue = {
  isProcessing: boolean;
  runWithProcessing: <T>(task: () => T | Promise<T>, options?: ProcessingOptions) => Promise<T>;
  beginProcessingStep: (label: string) => Promise<string | null>;
  completeProcessingStep: (stepId: string | null, failed?: boolean) => Promise<void>;
  recordProcessingStep: (label: string, elapsedMs: number, failed?: boolean) => void;
  runProcessingStep: <T>(label: string, task: () => T | Promise<T>) => Promise<T>;
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
  const [clockNow, setClockNow] = useState(() => performance.now());
  const sessionActiveRef = useRef(false);
  const stepCounterRef = useRef(0);
  const stepStartTimesRef = useRef(new Map<string, number>());

  useEffect(() => {
    if (!processing) return;
    const timer = window.setInterval(() => setClockNow(performance.now()), 250);
    return () => window.clearInterval(timer);
  }, [processing !== null]);

  const beginProcessingStep = useCallback(async (label: string): Promise<string | null> => {
    if (!sessionActiveRef.current) return null;

    const id = `processing-step-${++stepCounterRef.current}`;
    const startedAt = performance.now();
    stepStartTimesRef.current.set(id, startedAt);
    setProcessing(previous => previous ? {
      ...previous,
      status: label,
      steps: [
        ...previous.steps.map(step => step.status === 'ACTIVE'
          ? { ...step, status: 'DONE' as const, elapsedMs: performance.now() - step.startedAt }
          : step),
        { id, label, status: 'ACTIVE', startedAt },
      ],
    } : previous);

    // React cannot paint while a long synchronous simulation owns the main
    // thread. Yield for two frames before starting the phase so the player can
    // actually see which operation is about to run.
    await waitForPaint();
    return id;
  }, []);

  const completeProcessingStep = useCallback(async (stepId: string | null, failed = false): Promise<void> => {
    if (!stepId) return;
    const finishedAt = performance.now();
    const startedAt = stepStartTimesRef.current.get(stepId) ?? finishedAt;
    stepStartTimesRef.current.delete(stepId);
    setProcessing(previous => previous ? {
      ...previous,
      steps: previous.steps.map(step => step.id === stepId
        ? { ...step, status: failed ? 'ERROR' : 'DONE', elapsedMs: finishedAt - startedAt }
        : step),
    } : previous);
    await waitForPaint();
  }, []);

  const recordProcessingStep = useCallback((label: string, elapsedMs: number, failed = false): void => {
    if (!sessionActiveRef.current) return;
    const id = `processing-step-${++stepCounterRef.current}`;
    const normalizedElapsedMs = Math.max(0, elapsedMs);
    const finishedAt = performance.now();

    // Some legacy simulations are intentionally synchronous. Their internal
    // phases cannot repaint while they run, but recording the measured result
    // still exposes the exact bottleneck without changing simulation order,
    // random draws, save data or game-world rules.
    setProcessing(previous => previous ? {
      ...previous,
      steps: [
        ...previous.steps,
        {
          id,
          label,
          status: failed ? 'ERROR' : 'DONE',
          startedAt: finishedAt - normalizedElapsedMs,
          elapsedMs: normalizedElapsedMs,
        },
      ],
    } : previous);
  }, []);

  const runProcessingStep = useCallback(async <T,>(label: string, task: () => T | Promise<T>): Promise<T> => {
    const stepId = await beginProcessingStep(label);
    try {
      const result = await task();
      await completeProcessingStep(stepId);
      return result;
    } catch (error) {
      await completeProcessingStep(stepId, true);
      throw error;
    }
  }, [beginProcessingStep, completeProcessingStep]);

  const runWithProcessing = useCallback(async <T,>(task: () => T | Promise<T>, options: ProcessingOptions = {}): Promise<T> => {
    const randomTip = getRandomProcessingTip();
    const nextProcessing: ProcessingState = {
      title: options.title ?? 'Czy wiesz, że?',
      message: options.message ?? randomTip,
      status: options.status ?? 'Przetwarzam dane kariery',
      minVisibleMs: options.minVisibleMs ?? 350,
      steps: [],
    };
    const startedAt = performance.now();
    sessionActiveRef.current = true;
    stepCounterRef.current = 0;
    stepStartTimesRef.current.clear();
    setProcessing(nextProcessing);
    await waitForPaint();

    try {
      return await task();
    } finally {
      sessionActiveRef.current = false;
      const finishedAt = performance.now();
      setProcessing(previous => previous ? {
        ...previous,
        steps: previous.steps.map(step => step.status === 'ACTIVE'
          ? { ...step, status: 'DONE', elapsedMs: finishedAt - step.startedAt }
          : step),
      } : previous);
      const elapsed = performance.now() - startedAt;
      if (elapsed < nextProcessing.minVisibleMs) {
        await wait(nextProcessing.minVisibleMs - elapsed);
      }
      if (stepCounterRef.current > 0) {
        // Keep completed day timings visible briefly. Other users of the global
        // overlay (loading a game, opening the post-match studio) do not create
        // tracked steps and therefore retain their original closing speed.
        await waitForPaint();
        await wait(900);
      }
      setProcessing(null);
    }
  }, []);

  const value = useMemo<ProcessingContextValue>(() => ({
    isProcessing: processing !== null,
    runWithProcessing,
    beginProcessingStep,
    completeProcessingStep,
    recordProcessingStep,
    runProcessingStep,
  }), [processing, runWithProcessing, beginProcessingStep, completeProcessingStep, recordProcessingStep, runProcessingStep]);

  return (
    <ProcessingContext.Provider value={value}>
      {children}
      {processing && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/82 backdrop-blur-[4px]"
          role="dialog"
          aria-modal="true"
          aria-live="polite"
          aria-labelledby="processing-overlay-title"
          aria-describedby="processing-overlay-message"
        >
          <div className="relative w-[520px] max-w-[calc(100vw-32px)] overflow-hidden border-2 border-cyan-200/45 bg-[#030814] px-9 py-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.9),0_0_36px_rgba(34,211,238,0.16)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
            <div className="relative mx-auto mb-6 h-20 w-20" aria-hidden="true">
              <div className="processing-ball-idle absolute inset-x-0 top-0 flex justify-center">
                <SoccerBall className="h-14 w-14 drop-shadow-[0_8px_14px_rgba(0,0,0,0.7)]" />
              </div>
              <div className="processing-ball-shadow absolute bottom-1 left-1/2 h-2 w-12 -translate-x-1/2 rounded-full bg-black/70 blur-[3px]" />
            </div>
            <h2 id="processing-overlay-title" className="font-black italic uppercase tracking-tighter text-3xl leading-none text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {processing.title}
            </h2>
            <p id="processing-overlay-message" className="font-black italic uppercase tracking-tighter mx-auto mt-5 max-w-[430px] text-base leading-snug text-cyan-50 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {processing.message}
            </p>
            <p className="font-black italic uppercase tracking-tighter mt-5 text-xs leading-snug text-white/75">
              {processing.status}
            </p>
            {processing.steps.length > 0 && (
              <div className="mt-6 max-h-[280px] space-y-2 overflow-y-auto border-y border-cyan-200/10 py-3 text-left">
                {processing.steps.map(step => {
                  const elapsedMs = step.status === 'ACTIVE'
                    ? Math.max(0, clockNow - step.startedAt)
                    : (step.elapsedMs ?? 0);
                  return (
                    <div key={step.id} className="flex items-center gap-3 bg-white/[0.035] px-3 py-2.5">
                      <span
                        aria-hidden="true"
                        className={`flex h-5 w-5 shrink-0 items-center justify-center border text-[11px] ${
                          step.status === 'DONE'
                            ? 'border-emerald-300/50 bg-emerald-500/20 text-emerald-200'
                            : step.status === 'ERROR'
                              ? 'border-rose-300/50 bg-rose-500/20 text-rose-200'
                              : 'processing-step-pulse border-cyan-300/50 bg-cyan-500/20 text-cyan-100'
                        }`}
                      >
                        {step.status === 'DONE' ? '✓' : step.status === 'ERROR' ? '!' : '•'}
                      </span>
                      <span className={`font-black italic uppercase tracking-tighter min-w-0 flex-1 text-[11px] ${
                        step.status === 'DONE' ? 'text-emerald-100' : step.status === 'ERROR' ? 'text-rose-100' : 'text-white'
                      }`}>
                        {step.label}
                      </span>
                      <span className="font-black italic uppercase tracking-tighter shrink-0 tabular-nums text-[11px] text-cyan-100">
                        {(elapsedMs / 1000).toFixed(1)} s
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="font-black italic uppercase tracking-tighter mx-auto mt-4 max-w-[440px] text-[11px] leading-snug text-yellow-200">
              Jeśli przeglądarka pokaże komunikat, że strona nie odpowiada, nie martw się i poczekaj. Gra nadal przetwarza dane.
            </p>
            <div
              className="relative mt-8 h-3 w-full overflow-hidden rounded-full border border-cyan-200/20 bg-white/10"
              role="progressbar"
              aria-label="Postęp przetwarzania danych"
              aria-valuetext="Trwa przetwarzanie"
            >
              <div aria-hidden="true" className="processing-progress-bar absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-cyan-500 via-cyan-100 to-emerald-300 shadow-[0_0_16px_rgba(103,232,249,0.75)]" />
            </div>
            <style>{`
              @keyframes processing-ball-idle {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-12px); }
              }
              .processing-ball-idle { animation: processing-ball-idle 1.6s ease-in-out infinite; will-change: transform; }

              @keyframes processing-ball-shadow {
                0%, 100% { transform: translateX(-50%) scaleX(1); opacity: 0.5; }
                50% { transform: translateX(-50%) scaleX(0.65); opacity: 0.22; }
              }
              .processing-ball-shadow { animation: processing-ball-shadow 1.6s ease-in-out infinite; will-change: transform, opacity; }

              @keyframes processing-progress-bar {
                0% { transform: translateX(-110%); }
                100% { transform: translateX(310%); }
              }
              .processing-progress-bar { animation: processing-progress-bar 1.35s ease-in-out infinite; will-change: transform; }

              @keyframes processing-step-pulse {
                0%, 100% { opacity: 0.55; transform: scale(0.92); }
                50% { opacity: 1; transform: scale(1); }
              }
              .processing-step-pulse { animation: processing-step-pulse 0.9s ease-in-out infinite; }

              @media (prefers-reduced-motion: reduce) {
                .processing-ball-idle,
                .processing-ball-shadow,
                .processing-progress-bar,
                .processing-step-pulse { animation-duration: 3.5s; }
              }
            `}</style>
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
