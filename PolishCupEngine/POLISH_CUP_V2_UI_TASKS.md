# Plan nowego UI meczu Pucharu Polski V2

Ten plik jest checklistą dla nowego interfejsu meczu pucharowego. Nowy UI ma być budowany obok starego ekranu i ma korzystać z V2 jako jedynego źródła prawdy. Nie przenosimy starej logiki symulacji, sztucznego poprawiania statystyk ani automatycznych zmian gracza ze starego widoku.

## Decyzja

Tworzymy osobny ekran:

- `MatchLiveViewPolishCupV2.tsx`
- osobne komponenty SVG w folderze nowego UI,
- osobny kontroler odtwarzania meczu V2,
- osobny adapter danych UI, który nie liczy meczu, tylko zamienia wynik silnika na stan do wyświetlenia.

Stary `MatchLiveViewPolishCupSimulation.tsx` zostaje jako fallback do czasu pełnego przełączenia.

## Zasady projektu

- Silnik V2 jest jedynym źródłem wyniku, zdarzeń, statystyk, kartek, kontuzji, zmian, dogrywki i karnych.
- UI nie może sam doliczać strzałów, goli, spalonych, kartek ani zmian.
- UI może tylko wysyłać decyzje gracza do kontrolera: zmiana, korekta taktyki, rozmowa w przerwie, pauza, wznowienie, szybkość.
- AI i gracz korzystają z tych samych danych silnika, ale zmiany personalne gracza nie wykonują się automatycznie.
- Wszystkie elementy boiska, koszulek, ikon zawodników i panelu taktycznego mają być SVG albo komponentami renderującymi SVG.
- Layout ma wypełniać ekran bez wrażenia pustki, ale musi zostać czytelny na mniejszych rozdzielczościach.

## Etap 1: kontrakt danych UI

Status: Wykonane częściowo

Zadania:

- Utworzyć typ `CupV2LiveUiState`.
- Utworzyć typ `CupV2PlayerLiveCard`.
- Utworzyć typ `CupV2TacticalPanelState`.
- Utworzyć typ `CupV2PitchPlayerNode`.
- Utworzyć typ `CupV2MatchHeaderState`.
- Utworzyć mapper z `CupMatchResult` i bieżącej minuty na stan UI.
- Upewnić się, że mapper potrafi pokazać stan na minutę 0, 45, 90, 120 i po karnych.

Dane minimalne dla UI:

- wynik,
- minuta,
- okres meczu,
- nazwy klubów,
- herby,
- kolory strojów,
- stadion,
- faza pucharu,
- zwycięzca,
- karne,
- posiadanie,
- strzały,
- celne,
- xG,
- rożne,
- spalone,
- faule,
- kartki,
- lista zdarzeń,
- statystyki indywidualne,
- zmęczenie,
- morale/momentum,
- kontuzje,
- czerwone kartki,
- aktywny skład,
- ławka,
- dostępne zmiany.

## Etap 2: kontroler odtwarzania V2

Status: Wykonane częściowo

Zadania:

- Utworzyć `CupV2LivePlaybackController`.
- Kontroler ma przesuwać mecz po osi czasu bez liczenia meczu od nowa w każdej sekundzie UI.
- Obsłużyć prędkości meczu: normalnie, szybciej, bardzo szybko.
- Obsłużyć pauzę na zdarzeniach ważnych: gol, czerwona kartka, kontuzja, karny, koniec połowy, koniec meczu.
- Obsłużyć przerwę i rozmowę w przerwie.
- Obsłużyć dogrywkę.
- Obsłużyć serię rzutów karnych.
- Oddzielić eventy już pokazane od eventów czekających na pokazanie.
- Nie pozwalać, aby UI pokazał zdarzenie spoza aktualnej minuty.

Kryterium akceptacji:

- Jeśli V2 mówi, że w 1. połowie rywal miał 0 celnych strzałów, panel przerwy pokazuje 0.
- Jeśli gracz nie zrobił zmiany, lista i boisko nie pokazują zmiany po stronie gracza.
- Jeśli AI zrobiło zmianę, zmiana pojawia się po stronie AI.

## Etap 3: header meczu

Status: Wykonane częściowo

Wymaganie użytkownika:

- Układ headera ma zostać podobny do starego silnika.
- Wygląd ma być nowy, ładniejszy i zrobiony w SVG.

Zadania:

- Utworzyć `CupV2MatchHeaderSvg`.
- Zachować układ: drużyna gospodarzy po lewej, wynik w centrum, drużyna gości po prawej.
- Dodać SVG tło headera: światła stadionu, subtelna tablica wyników, metaliczna rama pucharowa.
- Pokazać fazę rozgrywek.
- Pokazać stadion.
- Pokazać minutę i okres meczu.
- Pokazać zwycięzcę po meczu.
- Pokazać wynik karnych, jeśli mecz rozstrzygnął się po serii.
- Dodać małe znaczniki formy/momentum obok drużyn.

Nie robić:

- Nie kopiować starego CSS 1:1.
- Nie wkładać w header żadnej logiki liczącej statystyki.

## Etap 4: boisko SVG

Status: Wykonane częściowo

Wymaganie użytkownika:

- Nowy wygląd boiska po środku ekranu.
- Ikony piłkarzy w SVG.
- Ładne efekty.

Zadania:

- Utworzyć `CupV2PitchSvg`.
- Boisko ma być centralnym elementem ekranu.
- Dodać realistyczną siatkę linii: pola karne, koło środkowe, bramki, linie boczne.
- Dodać efekty: delikatne światło stadionowe, aktywna strefa akcji, puls przy zawodniku uczestniczącym w zdarzeniu.
- Ułożyć zawodników według taktyki i pozycji z aktywnego składu.
- Pokazać osłabienie po czerwonej kartce jako pusty slot albo brak zawodnika z subtelnym znacznikiem.
- Pokazać kontuzjowanego zawodnika z ostrzeżeniem.
- Pokazać zawodnika z piłką albo ostatniego uczestnika akcji.
- Dodać tryb dogrywki i karnych bez zmiany całego layoutu.

## Etap 5: ikona piłkarza SVG

Status: Wykonane częściowo

Wymaganie użytkownika:

- Ikony piłkarzy: koszulki i spodenki w kolorach, w których grają.
- Na koszulce numer overall.
- Sprawdzać kontrast.
- Pod ikoną pierwsza litera imienia i nazwisko.

Zadania:

- Utworzyć `CupV2PlayerKitIconSvg`.
- Renderować koszulkę i spodenki jako SVG.
- Pobierać kolory stroju z danych meczu.
- Automatycznie dobrać kolor tekstu overall na koszulce: biały/czarny według kontrastu.
- Pokazać overall jako główny numer na koszulce.
- Pod ikoną pokazać podpis: `A. Kowalski`.
- Dodać warianty:
  - normalny,
  - strzelec gola,
  - żółta kartka,
  - czerwona kartka,
  - kontuzja lekka,
  - kontuzja ciężka,
  - zmęczony,
  - najlepszy zawodnik meczu,
  - zawodnik właśnie przy piłce.
- Dodać tooltip albo panel hover z live statystykami.

## Etap 6: panel taktyczny pod boiskiem

Status: Wykonane częściowo

Wymaganie użytkownika:

- Pod boiskiem nowy panel taktyczny.
- Nowy design w SVG.
- Dokładnie te same opcje jak w starym silniku.

Opcje do zachowania:

- ustawienie/formacja,
- nastawienie,
- tempo,
- intensywność,
- pressing,
- styl podań,
- kontraatak,
- krycie,
- kapitan,
- wykonawca karnych,
- wykonawca wolnych,
- zmiany zawodników,
- licznik zmian,
- blokada zawodnika po czerwonej kartce,
- obsługa kontuzji,
- potwierdzenie zmian.

Zadania:

- Utworzyć `CupV2TacticalPanelSvg`.
- Utworzyć sekcję szybkich poleceń taktycznych.
- Utworzyć sekcję zmian zawodników.
- Utworzyć sekcję stałych fragmentów.
- Utworzyć jasny stan: zmiana zapisana, zmiana niemożliwa, zawodnik niedostępny.
- Nie używać starego modala jako logiki. Można tylko sprawdzić, jakie opcje miał.
- Wszystkie decyzje użytkownika przekazywać do kontrolera V2, a nie do starego silnika.

Aktualizacja:

- Panel ma już selektory formacji, nastawienia, tempa, intensywności, podań, pressingu, krycia, kontry, zmian, kapitana, wykonawcy karnych i wykonawcy wolnych.
- Wybrany wykonawca karnych oraz wolnych trafia do wejścia silnika V2 i dostaje pierwszeństwo przy stałych fragmentach, jeśli jest na boisku.
- Zmiany personalne gracza nie są wykonywane automatycznie przez V2.

## Etap 7: listy zawodników po bokach

Status: Wykonane częściowo

Wymaganie użytkownika:

- Lista piłkarzy z dwóch drużyn po prawej i po lewej.
- Przy piłkarzach na liście pokazywać live staty.
- Pokazywać strzelców, kartki i kontuzje.

Zadania:

- Utworzyć `CupV2TeamPlayerList`.
- Lewa lista dla jednej drużyny, prawa lista dla drugiej.
- Pokazać podstawowe informacje:
  - numer overall,
  - nazwisko,
  - pozycja,
  - ocena live,
  - zmęczenie,
  - gole,
  - asysty,
  - strzały/celne,
  - xG,
  - faule,
  - spalone,
  - kartki,
  - kontuzja,
  - minuty gry.
- Przy strzelcach pokazać ikonkę piłki.
- Przy żółtej kartce pokazać żółty znacznik.
- Przy czerwonej kartce pokazać czerwony znacznik i wyszarzyć zawodnika.
- Przy kontuzji pokazać czytelny znacznik urazu.
- Przy zawodniku zmienionym pokazać minutę zejścia/wejścia.
- Dodać wyróżnienie zawodnika aktywnego w ostatnim zdarzeniu.

## Etap 8: dolny pasek zdarzeń

Status: Wykonane częściowo

Zadania:

- Utworzyć `CupV2EventTicker`.
- Pokazywać najważniejsze zdarzenia z V2.
- Odróżnić typy zdarzeń kolorem i ikoną:
  - gol,
  - strzał,
  - interwencja bramkarza,
  - rzut rożny,
  - spalony,
  - faul,
  - żółta kartka,
  - czerwona kartka,
  - kontuzja,
  - zmiana,
  - karny,
  - koniec połowy,
  - koniec meczu.
- Dodać mikroanimację wejścia nowego zdarzenia.
- Nie pokazywać drobnych technicznych zdarzeń, jeśli zagracają ekran.

## Etap 9: panel statystyk meczu

Status: Wykonane częściowo

Zadania:

- Utworzyć `CupV2MatchStatsStrip`.
- Pokazać statystyki obu drużyn:
  - posiadanie,
  - strzały,
  - celne,
  - xG,
  - rożne,
  - spalone,
  - faule,
  - kartki.
- Statystyki mają pochodzić wyłącznie z V2.
- W przerwie pokazywać stan do 45. minuty.
- Po meczu pokazywać pełny stan.
- Nie używać `buildCupDisplayStats` do poprawiania liczb V2.

## Etap 10: stan przerwy, dogrywki i karnych

Status: Do wykonania

Zadania:

- Utworzyć widok przerwy zgodny z nowym UI.
- Pokazać krótkie podsumowanie 1. połowy.
- Podłączyć rozmowę w przerwie.
- Pokazać dogrywkę jako naturalną kontynuację meczu.
- Pokazać serię karnych w osobnym module SVG.
- W serii karnych pokazać kolejnych wykonawców, wynik prób i bramkarzy.
- Karne po meczu nie mogą zmieniać oficjalnych goli ani strzałów z meczu.

## Etap 11: responsywność i czytelność

Status: Do wykonania

Zadania:

- Przygotować layout dla 1920x1080.
- Przygotować layout dla 1366x768.
- Przygotować layout dla laptopów z mniejszą wysokością.
- Przygotować tryb kompaktowy, jeśli boczne listy nie mieszczą się wygodnie.
- Zapewnić, że tekst nie nachodzi na boisko, header ani panel taktyczny.
- Zapewnić stałe rozmiary ikon zawodników, żeby animacje nie przesuwały układu.
- Sprawdzić kontrast napisów na koszulkach i panelach.

## Etap 12: animacje i efekty

Status: Do wykonania

Zadania:

- Dodać subtelny ruch światła stadionowego.
- Dodać puls przy golu.
- Dodać ślad akcji albo aktywną strefę boiska.
- Dodać efekt ostrzeżenia przy czerwonej kartce.
- Dodać efekt kontuzji bez przesady wizualnej.
- Dodać animację zmiany zawodnika.
- Animacje muszą być lekkie i nie mogą utrudniać czytania.

## Etap 13: testy wizualne i integracyjne

Status: Do wykonania

Zadania:

- Dodać test mappera UI.
- Dodać test, że statystyki przerwy są liczone tylko z eventów do 45. minuty.
- Dodać test, że gracz nie dostaje automatycznych zmian.
- Dodać test, że AI może wykonać zmianę.
- Dodać test, że kartki i kontuzje są widoczne na boisku i listach.
- Dodać test, że strzelcy mają ikonkę piłki.
- Dodać Playwright/screenshot dla głównego układu.
- Sprawdzić brak nakładania tekstów.
- Sprawdzić rendering SVG na 1920x1080 i 1366x768.

## Etap 14: przełączenie

Status: Wykonane częściowo

Zadania:

- Dodać flagę wyboru nowego UI.
- Uruchomić nowy UI tylko dla Pucharu Polski V2.
- Zostawić stary ekran jako fallback.
- Po testach przełączyć nowy UI jako domyślny.
- Usunąć albo odizolować stare próby podpięcia V2 pod stary UI.

Aktualizacja:

- Nowy UI `MatchLiveViewPolishCupV2.tsx` jest domyślnym ekranem dla `ViewState.MATCH_LIVE_CUP`.
- Dodano finalizację V2, która zapisuje wynik, fixture, awans/odpadnięcie w Pucharze Polski, statystyki pucharowe zawodników, kondycję, dług zmęczenia, kontuzje, zawieszenia, historię meczu, ratingi, sędziego, frekwencję, pogodę i raport pomeczowy.
- Superpuchar korzysta z tego samego zapisu meczu, ale nie zmienia flagi `isInPolishCup`.
- Stary ekran pozostaje dla playoffów i jako techniczny fallback, ale nowy UI nie korzysta z jego logiki live.

## Rzeczy, które trzeba jeszcze doprecyzować

- Czy boczne listy mają zawsze pokazywać całe 18-23 osoby, czy tylko aktywną jedenastkę plus zmiany?
- Czy panel taktyczny ma być zawsze widoczny, czy rozwijany, gdy użytkownik chce ingerować?
- Czy boisko ma pokazywać obie drużyny naraz przez cały mecz, czy tylko aktywne fazy/linie?
- Czy chcesz styl bardziej telewizyjny, czy bardziej menedżersko-analityczny?
- Czy w nowym UI zostawiamy tekstowy komentarz meczowy, czy tylko ticker zdarzeń?

## Dodatkowe elementy, których nie było w pierwszej liście, ale warto je uwzględnić

- Panel ostrzeżeń spójności: pokazuje, jeśli UI dostało event bez zawodnika albo skład ma brakujący slot.
- Tryb debug V2 tylko dla nas: licznik eventów, aktualna minuta, źródło statystyk, seed meczu.
- Widok najlepszych zawodników live.
- Ikona aktualnego momentum.
- Podgląd zmian dostępnych po kontuzji.
- Czytelne rozróżnienie gola w meczu od gola w serii karnych.
- Obsługa samobója: piłka przy drużynie, ale opis przy zawodniku, który trafił do własnej bramki.

## Definicja gotowości

Nowy UI można uznać za gotowy dopiero wtedy, gdy:

- nie importuje starej logiki symulacji meczu,
- nie poprawia statystyk po swojemu,
- gracz nie wykonuje automatycznych zmian,
- AI wykonuje zmiany zgodnie z V2,
- przerwa pokazuje dokładne statystyki z pierwszej połowy,
- boisko, listy i header pokazują te same zdarzenia,
- dogrywka i karne działają z jednego źródła danych,
- testy i screenshoty nie pokazują nakładania tekstów ani pustych SVG.

## Dziennik zmian UI

### 2026-07-27

- Dodano `MatchLiveViewPolishCupV2.tsx` jako osobny ekran dla Pucharu Polski V2.
- Dodano typy UI w `v2-ui/CupV2LiveUiTypes.ts`.
- Dodano mapper `CupV2LiveUiMapper`, który buduje wynik, statystyki, listy zawodników, statusy kartek/kontuzji i boisko z eventów V2 do aktualnej sekundy.
- Dodano `CupV2LivePlaybackController`, który przesuwa mecz po osi czasu raportu V2 i zatrzymuje się na przerwie, ważnym zdarzeniu oraz końcu meczu.
- Dodano komponenty SVG: header, boisko, ikony koszulek, listy zawodników, pasek statystyk, ticker zdarzeń, panel taktyczny i kontrolki odtwarzania.
- Podłączono nowy ekran w `App.tsx` dla `ViewState.MATCH_LIVE_CUP`.
- Stary ekran pozostaje jako fallback dla playoffów oraz jako odniesienie do późniejszej migracji trwałych skutków meczu.
- `npm run build` przechodzi.
- Dodano `CupV2MatchFinalizationService`, który zamienia raport V2 na trwały wynik gry: terminarz, kluby, zawodników, historię meczu i raport pomeczowy.
- Podłączono finalizację w `MatchLiveViewPolishCupV2.tsx`; kliknięcie końca meczu zapisuje dane V2 do `applySimulationResult`, `MatchHistoryService` i `setLastMatchSummary`.
- Rozszerzono panel taktyczny o realne selektory kapitana, wykonawcy karnych i wykonawcy wolnych.
- Rozszerzono wejście V2 o role stałych fragmentów i uwzględniono wybranych wykonawców w `CupSetPieceResolver`.
- Dodano test `npm run test:cup-v2-finalization`.
- Przebudowano pierwszy widok UI po teście czytelności: usunięto teksty techniczne z ekranu meczu, powiększono centralne boisko, dodano wyraźny zegar w headerze, uproszczono komentarz do jednej linii zdarzenia, zmieniono listy zawodników na tabelę bez kart z podziałem na pierwszy skład, ławkę oraz zawodników niedostępnych, dodano pozycje, paski kondycji, live statystyki, oznaczenia strzelców, kartek, kontuzji oraz podświetlenie zawodnika schodzącego i wchodzącego.
- Uproszczono ikony boiskowe do koszulki i spodenek SVG z overallem oraz paskiem kondycji. Panel taktyczny został spłaszczony, dostał subtelne tło SVG, przyciski nastawienia/tempa/intensywności/podań i wyraźny przycisk `Wprowadź zmiany`.
- Poprawiono drugi test czytelności: zawodnicy są mapowani tylko na własną połowę boiska, ikony boiskowe nie mają pasków kondycji, header rozdziela wynik i czas, listy pokazują polskie skróty pozycji `BR/OBR/POM/NAP`, a przycisk `Wprowadź zmiany` ma walidację i komunikat zwrotny.
- Dodano panel indywidualnych poleceń zawodnika w nowym UI. Polecenia nastawienia, tempa, podań, pressingu i krycia trafiają do wejścia V2 i wpływają na profil drużyny oraz wybór strzelca/kreatora akcji.

### 2026-07-28 — poprawki czytelności i mecz naprawdę na żywo

- Naprawiono dropdown (kolor `<option>`), poucinane nazwiska (szersze kolumny), kursywę i wagę czcionek w całym UI.
- Usunięto przycisk `Wprowadź zmiany`, dropdowny `Schodzi`/`Wchodzi` oraz dolny panel poleceń indywidualnych z panelu taktycznego. Zastąpione klikaniem: klik na zawodniku na boisku (własna drużyna) zaznacza go do zmiany, klik na ławce w liście bocznej dokonuje zmiany od razu.
- Dodano `CupV2PlayerInstructionMenu` — polecenia indywidualne i role (kapitan/karny/wolny) po kliknięciu prawym przyciskiem na zawodniku na boisku (tylko własna drużyna).
- Nowy header: cyfrowy zegar (MM:SS) + duży wynik w stylu tablicy wyników.
- Poprawiono boisko: usunięto pasy trawy, ciemniejsza murawa, subtelniejsze linie, portretowy kształt (zamiast szerokiego i niskiego), większe odstępy pionowe między liniami zawodników.
- Komentarz meczowy przeniesiony na środek boiska w barwach drużyny (jak w starym silniku), usunięto zdublowany pasek komentarza pod boiskiem; komentarz jest teraz szerokim paskiem z maksymalnie 2 liniami tekstu zamiast kwadratowej karty.
- **Naprawiono architekturę silnika na żywo (najważniejsza zmiana):** mecz był liczony w całości z góry (`CupMatchEngineV2.simulate()` na starcie), a UI tylko odsłaniało gotowe zdarzenia według minuty — stąd wynik/zwycięzca/oceny znane od razu, zmiana taktyki przeliczała cały mecz od nowa (rotując też przeciwnika) i zegar skakał przy zmianie prędkości. Dodano `CupMatchEngineV2.createLiveMatch` / `advanceLiveMatch` / `snapshotLiveMatch` / `finalizeLiveMatch` / `applyManualSubstitution` — mecz liczy się naprawdę minuta po minucie, zmiana taktyki/zawodnika/roli wpływa tylko na przyszłość (mutacja `input.home/away` w miejscu), a przeszłe zdarzenia nigdy się nie przeliczają. `simulate()` zostaje nietknięte dla testów/kalibracji. Dodano `services/match/adapters/cupV2/CupShadowSimulationService.createLiveMatch/tickLiveMatch`, przebudowano `CupV2LivePlaybackController.step` (teraz faktycznie dolicza mecz zamiast odsłaniać gotowe dane) i `MatchLiveViewPolishCupV2.tsx` (mecz trzymany w `useRef`, komponenty React tylko odczytują świeży snapshot).
- Naprawiono zegar: krok zawsze 30s gry, prędkość x2/x4 przyspiesza częstotliwość ticków zamiast rozmiaru skoku — minuta zawsze rośnie płynnie.
- Przycisk "Zakończ mecz" zablokowany do faktycznego końca meczu (wcześniej można było zakończyć w dowolnej minucie).
- Dodano `tests/CupV2LiveMatchTests.ts` (`npm run test:cup-v2-live-match`): sprawdza, że mecz nie ma zdarzeń na minucie 0, że zmiana taktyki/zawodnika w trakcie nie zmienia zdarzeń sprzed tego momentu, że ręczna zmiana generuje zdarzenie w logu i że mecz kończy się poprawnym wynikiem ze statystykami graczy.
- Naprawiono błąd: zawodnik, który już zszedł z boiska (zmieniony), mógł zostać wprowadzony ponownie. `CupSubstitutionService`/`CupMatchEngineV2.applyManualSubstitution` sprawdzają teraz log zdarzeń (`secondaryPlayerId` w evencie ZMIANY) i odrzucają taką próbę — dotyczy zarówno AI, jak i ręcznej zmiany. Dodano `hasLeftPitch` do `CupV2PlayerLiveCard`, żeby taki zawodnik poprawnie trafiał do "Zeszli/niedostępni", a nie z powrotem na "Ławkę".
- Zawodnik z czerwoną kartką: dodano etykietę czerwonej kartki i wyszarzenie (grayscale) jego ikonki bezpośrednio na boisku (wcześniej po prostu znikał z boiska), zamrożono go do zmiany (`applyManualSubstitution` odrzuca próbę zmiany za kogoś z czerwoną kartką — drużyna gra w osłabieniu, zgodnie z zasadami piłki nożnej) i zablokowano dla niego menu poleceń indywidualnych (PPM). Przy okazji poprawiono `CupV2LiveUiMapper`: skład startowy do rozróżniania "kto zaczynał w składzie/na ławce" jest teraz brany z zamrożonego `report.initialLineup` zamiast z bieżącego (mutowanego) `report.input`, a odtwarzanie zmian w mapperze usunięto całkowicie (silnik na żywo mutuje skład bezpośrednio, więc powielanie tego w mapperze podwajało wpisy na ławce).
