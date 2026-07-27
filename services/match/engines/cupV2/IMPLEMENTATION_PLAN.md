# Plan wdrożenia silnika meczowego Pucharu Polski V2

Ten dokument jest punktem kontrolnym dla całej pracy nad nowym silnikiem meczowym. Przed każdym kolejnym etapem należy tu wrócić, sprawdzić status checklisty i dopiero wtedy przejść dalej. Wygląd graficzny meczu zaczynamy dopiero po zakończeniu części symulacyjnej, testowej i integracyjnej.

## Cel

Zbudować realistyczny, modularny silnik meczu piłkarskiego dla Pucharu Polski, w którym wynik, statystyki i przebieg meczu wynikają z akcji boiskowych, a nie z prostego losowania bramek.

Silnik ma:

- symulować mecz krok po kroku,
- korzystać z atrybutów zawodników, taktyk, ustawień taktycznych i czynników meczowych,
- generować akcje, sytuacje, strzały, interwencje, faule, kontuzje, kartki, stałe fragmenty, dogrywkę i rzuty karne,
- działać identycznie dla gracza i AI,
- produkować wiarygodne statystyki drużynowe oraz indywidualne,
- być łatwy do kalibracji bez niszczenia całej logiki.

## Zasada pracy

Przed rozpoczęciem każdego kolejnego zadania trzeba:

1. Otworzyć ten plik.
2. Sprawdzić sekcję "Status etapów".
3. Upewnić się, że poprzedni etap ma testy i opis działania.
4. Nie przechodzić do UI, dopóki etapy symulacyjne i integracyjne nie są oznaczone jako wykonane.
5. Po każdej większej zmianie dopisać, co zostało zrobione i jakie testy to potwierdzają.

## Status etapów

| Etap | Status | Opis |
| --- | --- | --- |
| 1. Architektura bazowa V2 | Wykonane | Utworzono modularny silnik w `services/match/engines/cupV2`. |
| 2. Pętla meczu | Wykonane | Mecz jest symulowany iteracyjnie, z aktualizacją stanu, zmęczenia i zdarzeń. |
| 3. Momentum i kontrola meczu | Wykonane | Silnik liczy wpływ siły drużyny, taktyki, morale, domu i przebiegu meczu. |
| 4. Generowanie akcji i sytuacji | Wykonane częściowo | Akcje wynikają z profili drużyn, tempa, przestrzeni, pressingu i jakości zawodników. Wymaga dalszego rozbicia na bardziej jawne decyzje zawodników. |
| 5. Strzały i gole | Wykonane częściowo | Strzały wynikają z sytuacji i atrybutów strzelca, obrońcy oraz bramkarza. Wymaga dopracowania atrybucji samobójów i asyst. |
| 6. Taktyki i ustawienia | Wykonane częściowo | Formacja, tempo, nastawienie, pressing, kontra i krycie wpływają na profil drużyny. Wymaga szerszej siatki testów porównawczych. |
| 7. Pogoda, murawa, stadion | Wykonane częściowo | Pogoda i murawa wpływają na jakość gry, pressing, strzały i ryzyko kontuzji. Stadion wymaga dalszego powiązania z frekwencją i presją. |
| 8. Sędzia | Wykonane częściowo | Atrybuty sędziego wpływają na faule, kartki i karne. Wymaga testów skrajnych profili sędziowskich. |
| 9. Motywacja i rozmowy | Wykonane częściowo | Motywacja przedmeczowa i rozmowa w przerwie wpływają na profil drużyny. Wymaga lepszego raportowania efektów. |
| 10. Osłabienia, czerwone kartki, kontuzje | Wykonane częściowo | Silnik uwzględnia grę w osłabieniu i zawodników grających z kontuzją. Wymaga testów scenariuszy ekstremalnych. |
| 11. Statystyki indywidualne | Wykonane częściowo | Dodano `CupPlayerStatsAggregator`, typy `playerStats`, testy gola, asysty, strzałów, samobója, karnego, serii karnych, zmiany, kartki, fauli, spalonych i kontuzji. Wymaga jeszcze podłączenia pełnego raportu do UI. |
| 12. Oceny zawodników | Wykonane częściowo | Dodano `CupPlayerRatingService` i test ocen. Rating korzysta z pozycji, wyniku, minut, xG, goli, asyst, kreacji, bramkarza, kartek, karnych, czystego konta i zmęczenia. |
| 13. Raport meczowy V2 | Wykonane częściowo | Dodano `CupMatchReportAdapter`, który zamienia wynik V2 na `MatchSummary` z golami, timeline, statystykami drużyn i zawodników. |
| 14. Adapter do obecnego UI | Wykonane częściowo | Raport shadow zwraca teraz `matchSummary`, listy top zawodników, strzelców, asystentów, liderów strzałów i mapę ratingów. V2 nadal nie jest głównym źródłem meczu. |
| 15. Testy pełnych wariantów | W toku | Istnieją testy balansu, audytu i czynników, ale trzeba je rozszerzać wraz z modułami. |
| 16. Kalibracja końcowa | W toku | Dodano tłumienie lawinowych wyników przy dużym prowadzeniu. Wymaga jeszcze dłuższego audytu po przełączeniu raportu V2. |
| 17. Przełączenie silnika | Do wykonania | Dopiero po statystykach, raportach i testach. |
| 18. Projekt wyglądu meczu | Zablokowane do czasu ukończenia etapów 11-17 | UI robimy dopiero po zatwierdzeniu działania silnika. |

## Obecny stan techniczny

Nowy silnik znajduje się w:

- `services/match/engines/cupV2`
- `services/match/adapters/cupV2`
- testach `tests/CupMatchEngineV2*.ts`

Najważniejsze bloki:

- `CupMatchEngineV2.ts` - główne wejście do symulacji.
- `CupMatchLoop.ts` - pętla meczu, zmęczenie, kontuzje, zmiany, dogrywka.
- `CupTeamProfileService.ts` - przelicza zawodników, taktykę, morale, pogodę i osłabienia na profil drużyny.
- `CupMomentumService.ts` - liczy momentum i przewagę w danym fragmencie meczu.
- `CupChanceCreationService.ts` - tworzy sytuacje i wybiera strzelca, kreatora oraz obrońcę.
- `CupShotResolver.ts` - rozstrzyga strzał: gol, celny, niecelny, słupek, poprzeczka, obrona.
- `CupActionBuilder.ts` - buduje zdarzenia i statystyki drużynowe.
- `CupDisciplineResolver.ts` - faule, kartki i decyzje sędziego.
- `CupInjuryResolver.ts` - kontuzje i ich ryzyko.
- `CupSubstitutionService.ts` - zmiany zawodników, w tym reakcje na kontuzje.
- `CupPenaltyShootoutService.ts` - seria rzutów karnych.
- `CupBalanceSimulation.ts` - większe próby testowe i kalibracja statystyk.

## Etap 11: statystyki indywidualne

Moduł `CupPlayerStatsAggregator` został dodany. Jego zadaniem jest przejście po zdarzeniach V2 i zbudowanie statystyk każdego zawodnika.

### Zamierzenie

Silnik zapisuje zdarzenia z `playerId`, `secondaryPlayerId`, typem zdarzenia i `xG`. Agregator przechodzi po nich po meczu i buduje statystyki zawodników. Wynik `CupMatchResult` ma teraz pole `playerStats`.

### Zakres danych

Agregator liczy obecnie:

- minuty gry,
- gole,
- asysty,
- strzały,
- strzały celne,
- strzały niecelne,
- słupki,
- poprzeczki,
- xG,
- stworzone sytuacje,
- kluczowe podania,
- faule popełnione,
- faule otrzymane,
- spalone,
- żółte kartki,
- czerwone kartki,
- kontuzje,
- wejścia i zejścia z boiska,
- interwencje bramkarza,
- gole stracone przez bramkarza,
- rzuty karne wykonywane, strzelone i nietrafione,
- ocenę meczową.

Do późniejszego wzbogacenia, gdy zdarzenia będą niosły dokładniejsze dane:

- dokładniejsze źródło gola: open play, counter, set piece, penalty, own goal.

### Logika strzałów

Zdarzenie liczy się jako strzał zawodnika, jeśli `event.playerId` wskazuje strzelającego i typ zdarzenia oznacza próbę zakończenia akcji.

Do strzałów zaliczamy:

- gol,
- strzał celny,
- obronę bramkarza,
- sytuację sam na sam zakończoną golem,
- sytuację sam na sam obronioną,
- strzał niecelny,
- słupek,
- poprzeczkę.

Strzały celne:

- gol,
- strzał celny,
- obrona bramkarza,
- sytuacja sam na sam zakończona golem,
- sytuacja sam na sam obroniona.

Strzały niecelne:

- strzał niecelny,
- słupek,
- poprzeczka.

Słupki i poprzeczki powinny być dodatkowo liczone osobno.

### Logika asyst

Dla gola `secondaryPlayerId` można traktować jako asystenta tylko wtedy, gdy:

- gol nie jest samobójem,
- gol nie padł bezpośrednio z rzutu karnego,
- zdarzenie ma rzeczywistego kreatora akcji,
- asystent nie jest tym samym zawodnikiem co strzelec.

Dodano:

- jawne pole `assistEligible`,
- jawne pole `isOwnGoal`,
- jawne pole `ownGoalPlayerId`.

Do dopracowania:

- jawne źródło gola: open play, counter, set piece, penalty, own goal,
- pełne rozróżnienie asysty, preasysty, rykoszetu i gola po odbitce.

### Logika ocen zawodników

Ocena zawodnika nie powinna być prostą sumą gola i asysty. Powinna wynikać z wkładu w mecz.

Przykładowe składniki:

- bazowa ocena startowa,
- wpływ minut,
- gole i asysty,
- xG i jakość wykończenia,
- stworzone sytuacje,
- udział w pressingu,
- kartki i faule,
- błędy prowadzące do sytuacji,
- skuteczność bramkarza,
- wpływ kontuzji,
- wpływ gry w osłabieniu,
- wynik drużyny.

## Etap po statystykach indywidualnych

Po agregatorze trzeba zrobić:

1. Rozszerzenie typów wyniku meczu o `playerStats` - wykonane.
2. Testy jednostkowe agregatora - wykonane.
3. Test scenariusza z golem, asystą, strzałami celnymi i niecelnymi - wykonane.
4. Test scenariusza z samobójem - wykonane.
5. Test scenariusza z rzutem karnym - wykonane.
6. Test scenariusza z czerwoną kartką i grą w osłabieniu - wykonane, kartki mają teraz `playerId`, a zawodnik faulowany trafia do `secondaryPlayerId`.
7. Test scenariusza z kontuzją bez zmiany - wykonane częściowo przez zdarzenie kontuzji i minuty gry.
8. Podłączenie statystyk do adaptera V2 - wykonane częściowo.
9. Test serii rzutów karnych per zawodnik - wykonane.
10. Dopiero potem analiza raportu i decyzja o przełączeniu silnika z trybu shadow.

## Etap 13-14: raport i adapter V2

Dodano warstwę raportową i bezpieczny przełącznik integracyjny, który przygotowuje wynik V2 do użycia przez obecny ekran pomeczowy bez zmiany wyglądu UI.

### Co zostało wykonane

- `CupMatchReportAdapter` tworzy `MatchSummary` z wyniku V2.
- `CupShadowSimulationReport` ma teraz pole `matchSummary`.
- `CupV2FinalReportSelectionService` wybiera raport końcowy dla UI.
- Tryb `safe` używa raportu V2 tylko wtedy, gdy przejdzie walidację oraz ma ten sam wynik, karne, gole i podstawowe statystyki co live-mecz starego silnika.
- Tryb `force` pozwala ręcznie przetestować raport V2 mimo różnicy wyniku.
- Tryb `off` wymusza stary raport.
- Flaga integracyjna: `localStorage.cupV2FinalReport`.
- `CupShadowSimulationSummary` zawiera listy:
  - `topPerformers`,
  - `scorers`,
  - `assistants`,
  - `shotLeaders`,
  - `keeperReports`,
  - `ratings`.
- Widok live loguje w konsoli dodatkowe tabele zawodników z raportu shadow.
- Test adaptera sprawdza, czy `matchSummary` ma wynik, statystyki, zawodników i oceny.
- Test selektora raportu sprawdza tryby `safe`, `force`, `off`, walidację statystyk i fallback do starego raportu.
- Widok live przy zamknięciu meczu próbuje zbudować końcowy raport V2 i przekazuje do `setLastMatchSummary` wybrany raport.

### Status przełączenia

- Ekran pomeczowy może dostać `matchSummary` z V2, ale tylko za selektorem bezpieczeństwa.
- Domyślny tryb `safe` chroni przed sytuacją, w której ekran live pokazuje inny wynik, strzelców lub statystyki niż raport pomeczowy.
- UI nadal korzysta ze starego silnika jako źródła przebiegu live.
- Pełne przełączenie przebiegu meczu na V2 zostaje następnym etapem, bo musi objąć wynik live, fixture, historię meczu, statystyki zawodników i raport pomeczowy jednym źródłem prawdy.

## Etap 11b: atrybucja fauli, kartek i spalonych

Ten krok usuwa anonimowość najczęstszych zdarzeń defensywnych i pozycyjnych. Dzięki temu raport zawodnika nie pokazuje już wyłącznie strzałów, goli i asyst, ale również realny koszt zachowań bez piłki.

### Co zostało wykonane

- `CupDisciplineResolver` wybiera konkretnego faulującego z drużyny broniącej.
- `CupDisciplineResolver` wybiera konkretnego faulowanego z drużyny atakującej.
- Faul, żółta kartka i czerwona kartka zapisują `playerId` faulującego oraz `secondaryPlayerId` faulowanego.
- `CupActionBuilder` wybiera konkretnego zawodnika złapanego na spalonym.
- `CupActionBuilder` zapisuje też podającego przy spalonym w `secondaryPlayerId`.
- `CupPlayerStatsAggregator` liczy `foulsWon` z `secondaryPlayerId`.
- Test agregatora obejmuje czerwoną kartkę, faul popełniony i faul otrzymany.
- Test adaptera sprawdza, czy faule, kartki i spalone z silnika V2 mają przypisanych zawodników.

### Logika wyboru zawodników

Faulujący nie jest losowany płasko. Waga wynika z agresji, odbioru, pracowitości, siły, szybkości, ustawiania się, mentalności, kondycji i pozycji. Obrońcy oraz pomocnicy mają naturalnie większą ekspozycję na takie zdarzenia niż napastnicy.

Faulowany wynika z dryblingu, szybkości, techniki, ofensywy, wizji, siły, mentalności, pracowitości i pozycji. Najczęściej będą to zawodnicy, którzy realnie prowadzą akcję albo próbują minąć rywala.

Spalony przypisywany jest głównie napastnikom i ofensywnym pomocnikom. Waga korzysta z szybkości, ofensywy, ustawiania się, wykończenia, mentalności, pracowitości i dryblingu. Podający wybierany jest osobno na podstawie podań, wizji, techniki, dośrodkowań, mentalności i pozycji.

### Wpływ na silnik

To nie jest tylko kosmetyka raportu. Czerwone kartki mają teraz konkretnego zawodnika, więc stan meczu potrafi realnie usunąć go z aktywnych profili drużyny. Oznacza to, że gra w osłabieniu jest bardziej wiarygodna i widoczna w kolejnych minutach symulacji.

## Etap 11c: seria rzutów karnych per zawodnik

Seria rzutów karnych po dogrywce została rozbita na konkretne próby zawodników. To ważne, bo w Pucharze Polski awans może wynikać z konkursu karnych, ale te trafienia nie powinny zmieniać oficjalnego wyniku meczu ani statystyk strzałów z gry.

### Co zostało wykonane

- Dodano typ `CupPenaltyShootoutAttempt`.
- `CupPenaltyShootoutService` zwraca teraz wynik serii, listę prób oraz wydarzenia.
- Każda próba ma wykonawcę, bramkarza, kolejkę, kolejność, xG próby, wynik, informację o obronie oraz wynik serii po strzale.
- Wykonawcy są wybierani w kolejce bez powtórek przed pełnym obrotem listy.
- Zawodnicy z czerwoną kartką są wykluczeni z listy wykonawców.
- Kontuzja i zmęczenie obniżają wagę wykonawcy oraz jakość bramkarza.
- `CupMatchEngineV2` dodaje wydarzenia serii do `events`, ale nie dolicza ich do wyniku meczu.
- `CupPlayerStatsAggregator` liczy rzuty karne z serii jako `penaltiesTaken`, `penaltiesScored`, `penaltiesMissed` i `penaltiesSaved`.
- `CupMatchReportAdapter` odróżnia karne z serii od goli w meczu, więc lista strzelców i wynik podstawowy nie są zafałszowane.

### Logika próby

Skuteczność wykonawcy wynika z karnych, wykończenia, techniki, mentalności, przywództwa, siły, talentu, kondycji i ewentualnej kontuzji.

Jakość bramkarza wynika z bramkarstwa, ustawiania się, mentalności, szybkości, siły, przywództwa, kondycji i ewentualnej kontuzji.

Szansa trafienia jest liczona jako różnica jakości wykonawcy i bramkarza na bazie prawdopodobieństwa typowego dla rzutów karnych. Jeśli strzał nie jest golem, osobny model decyduje, czy była to obrona bramkarza, czy strzał niecelny.

### Zasada raportowania

`PENALTY_SCORED` i `PENALTY_MISSED` z `detail.isShootout = true` oznaczają konkurs po meczu. Agregator księguje je w statystykach karnych zawodników, ale nie traktuje ich jako bramek, strzałów, xG meczowego ani goli straconych przez bramkarza.

## Etap 16a: kalibracja dużej różnicy klas

Przez dużą różnicę klas rozumiemy mecze, w których jedna drużyna ma wyraźnie wyższą jakość składu, reputację, taktykę ofensywną i przewagę profilu nad rywalem z niższego poziomu. W Pucharze Polski takie mecze powinny dawać dominację faworyta, ale nie powinny regularnie kończyć się wynikami 0:7, 0:8 albo 0:9.

### Problem

Audyt shadow pokazywał, że ogólne średnie były akceptowalne, ale w skrajnych parach pojawiały się wyniki hokejowe. Przyczyna nie leżała wyłącznie w skuteczności strzału. `CupShotResolver` miał już tłumienie skuteczności po wysokim prowadzeniu, ale `CupActionBuilder` i `CupChanceCreationService` nadal pozwalały prowadzącemu faworytowi generować zbyt dużo kolejnych progresji i sytuacji.

### Co zostało wykonane

- Dodano `leadingGameControlDampener` w `CupActionBuilder`.
- Zespół prowadzący 2, 3, 4 lub 5+ bramkami obniża tempo kolejnych akcji i prawdopodobieństwo progresji.
- Obniżono minimalną podłogę tempa akcji z 0.14 do 0.08, żeby tłumienie po wysokim prowadzeniu faktycznie działało.
- Dodano `scoreDiff` do `CupChanceCreationService`.
- Zespół wysoko prowadzący ma mniejsze prawdopodobieństwo stworzenia kolejnej sytuacji i lekko niższe xG sytuacji.
- Drużyna przegrywająca ma niewielką premię pilności, żeby mecz nie zamierał całkowicie.
- Zaostrzono test shadow: wyniki hokejowe muszą być poniżej 1%, a liczba anomalii poniżej 12.

### Wynik po kalibracji

Audyt 256 meczów shadow po zmianie:

- średnie strzały: 18.96,
- średnie strzały celne: 8.22,
- średnie gole: 2.13,
- średnie xG: 2.12,
- średnie rożne: 5.48,
- średnie spalone: 1.31,
- wyniki hokejowe: 0%,
- za dużo strzałów: 0%,
- za dużo spalonych: 0%,
- anomalie: 1.

Balans 200 meczów po zmianie:

- średnie strzały: 18.20,
- średnie strzały celne: 7.13,
- średnie gole: 1.71,
- średnie xG: 1.87,
- wysokie wyniki: 0%,
- spalone: 1.26.

### Założenie projektowe

Nie wprowadzono twardego limitu bramek. Silnik nadal może wygenerować wysokie zwycięstwo, ale musi ono wynikać z przebiegu akcji. Po dużym prowadzeniu faworyt częściej zarządza meczem, a rywal nadal może próbować reagować.

## Etap 12: oceny zawodników

Dodano osobny moduł `CupPlayerRatingService`, żeby ocena meczowa nie była ukryta w agregatorze statystyk. Rating jest teraz łatwiejszy do kalibracji, testowania i późniejszego pokazywania w raporcie.

### Co zostało wykonane

- Przeniesiono logikę oceny z `CupPlayerStatsAggregator` do `CupPlayerRatingService`.
- Agregator nadal liczy statystyki, ale ocenę deleguje do dedykowanego serwisu.
- `CupMatchEngineV2` przekazuje do agregatora statystyki drużynowe i końcowe zmęczenie.
- Rating korzysta z kontekstu meczu: wynik, przewaga w xG, strzały celne, rożne, czerwone kartki, minuty i zmęczenie.
- Rating jest zależny od pozycji: napastnik, pomocnik, obrońca i bramkarz mają różne wagi za gole, asysty, kreację, czyste konto i interwencje.
- Dodano test `npm run test:cup-v2-player-ratings`.

### Logika oceny

Ocena startuje z bazowej wartości i jest korygowana przez:

- wynik drużyny,
- liczbę minut,
- ogólną kontrolę meczu,
- zmęczenie końcowe,
- gole i skuteczność względem xG,
- asysty, stworzone sytuacje i kluczowe podania,
- strzały celne, niecelne, słupki i poprzeczki,
- interwencje bramkarza, czyste konto i obronione karne,
- czyste konto obrońców i pomocników,
- faule, kartki, samobóje, niewykorzystane karne i kontuzje.

### Testy ocen

Test bezpośredni sprawdza kilka scenariuszy:

- napastnik z dwoma golami dostaje wysoką ocenę,
- kreator z asystą i kilkoma kluczowymi podaniami jest oceniany dobrze, ale niżej niż strzelec dwóch goli,
- bramkarz z czystym kontem, obronami i obronionym karnym jest mocno nagradzany,
- obrońca z samobójem i czerwoną kartką jest wyraźnie karany,
- nieskuteczny napastnik z wysokim xG i niewykorzystanym karnym spada poniżej średniej,
- zawodnik bez minut dostaje ocenę 0.

### Do dalszego wzbogacenia

Rating stanie się pełniejszy, gdy silnik zacznie raportować dokładne udane i nieudane podania, odbiory, pojedynki, pressingi, błędy prowadzące do strzału i bloki. Obecny model jest gotowy na te dane, ale nie udaje, że już je posiada.

## Testy kontrolne

Po każdej większej zmianie trzeba uruchamiać odpowiedni zestaw:

- `npm run test:cup-v2-full-factors`
- `npm run test:cup-v2-balance`
- `npm run test:cup-v2-shadow-audit`
- `npm run test:cup-v2-adapter`
- `npm run test:cup-v2-player-stats`
- `npm run test:cup-v2-player-ratings`
- `npm run test:cup-v2-final-report`
- `npm run build`

Jeżeli zmiana dotyczy tylko jednego modułu, można zacząć od testu celowanego, ale przed przełączeniem silnika komplet powyżej musi przejść.

## Kryteria przejścia do wyglądu graficznego

Nie projektujemy końcowego wyglądu meczu, dopóki:

- statystyki drużynowe mieszczą się w realistycznych zakresach,
- spalone, kartki, rożne i strzały są stabilne w większej próbce,
- gole nie mają wyników hokejowych poza rzadkimi wyjątkami,
- każdy gol ma prawidłowego strzelca,
- asysty są liczone zgodnie z zasadami,
- każdy zawodnik ma statystyki indywidualne,
- raport V2 potrafi zastąpić obecny raport pucharowy,
- adapter V2 przekazuje dane w formacie potrzebnym UI,
- testy kontrolne przechodzą.

## Decyzja architektoniczna

Nie kopiujemy obecnego starego silnika pucharowego. Budujemy V2 obok niego, testujemy go w cieniu i dopiero po potwierdzeniu jakości przełączamy jako główne źródło wyniku.

Powód: obecny silnik generował niskie strzały, wysokie spalone i czasem wyniki hokejowe. Naprawianie go punktowo grozi kolejnymi przesunięciami balansu. V2 ma mieć czytelne moduły, osobne testy i kalibrację opartą na dużej liczbie symulacji.

## Dziennik zmian

### 2026-07-26

- Utworzono architekturę silnika V2.
- Dodano symulację shadow.
- Dodano testy balansu, audytu, adaptera i pełnych czynników.
- Skalibrowano strzały, gole, spalone, rożne i kartki.
- Dopracowano wpływ kontuzji i gry kontuzjowanym zawodnikiem.
- Dodano ten dokument jako stałą checklistę przed dalszymi etapami.
- Dodano `CupPlayerStatsAggregator`.
- Rozszerzono `CupMatchResult` o `playerStats`.
- Dodano metadane samobója i kwalifikowalności asysty do zdarzeń strzału.
- Dodano test `npm run test:cup-v2-player-stats`.
- Dodano `CupMatchReportAdapter`.
- Rozszerzono raport shadow o `matchSummary`, top zawodników, strzelców, asystentów, liderów strzałów, raport bramkarzy i mapę ratingów.
- Rozszerzono log shadow w `MatchLiveViewPolishCupSimulation.tsx`.
- Wzbogacono faule, żółte kartki i czerwone kartki o konkretnego faulującego oraz faulowanego zawodnika.
- Wzbogacono spalone o konkretnego zawodnika złapanego na spalonym oraz podającego.
- Rozszerzono statystyki indywidualne o pełniejsze `foulsWon`, `foulsCommitted`, kartki i spalone wynikające z rzeczywistych zdarzeń V2.
- Dostosowano karę złej pogody dla celności strzałów i potwierdzono ją testem pełnych czynników.
- Rozbito serię rzutów karnych na próby konkretnych zawodników i bramkarzy.
- Wykluczono zawodników z czerwoną kartką z listy wykonawców karnych w serii.
- Podłączono karne z serii do statystyk indywidualnych bez fałszowania wyniku i strzałów z meczu.
- Dodano `CupPlayerRatingService` jako osobny model ocen zawodników.
- Dodano test `npm run test:cup-v2-player-ratings`.
