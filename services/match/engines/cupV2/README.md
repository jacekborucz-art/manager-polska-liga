# Cup Match Engine V2

Ten folder zawiera projekt nowego silnika Pucharu Polski. Moduł jest celowo odseparowany od obecnego `MatchLiveViewPolishCupSimulation`, żeby można było go rozwijać, testować statystycznie i dopiero później przełączyć widok.

## Główna zasada

Silnik nie losuje bramek. Bramka może powstać tylko przez łańcuch:

`posiadanie -> rozegranie -> progresja -> sytuacja -> strzał -> bramkarz/obrona -> gol`

Losowość jest używana tylko jako rozstrzygnięcie pojedynków zależnych od atrybutów, taktyki, zmęczenia, morale, pogody i sędziego.

## Moduły

`CupMatchTypes.ts`

Definiuje kontrakty danych: wejście meczu, stan runtime, statystyki, zdarzenia, profil drużyny, sytuację i wynik strzału. To jest mapa całego silnika.

`CupMath.ts`

Wspólne funkcje matematyczne: clamp, średnie, mnożniki zmęczenia/morale, deterministyczny RNG i prawdopodobieństwo pojedynku. Dzięki temu wszystkie moduły używają tej samej skali.

`CupTeamProfileService.ts`

Buduje profil drużyny z aktywnej jedenastki. Nie sumuje surowo formacji. Każda faza ma osobną jakość: rozegranie, kontrola środka, progresja, tworzenie sytuacji, wykończenie, pressing, obrona, stałe fragmenty i bramkarz.

`CupActionBuilder.ts`

Symuluje pojedynczy tick meczu. Rozstrzyga utrzymanie piłki, pressing, stratę, progresję, spalonego, rzut rożny i ewentualne dojście do sytuacji strzeleckiej.

`CupChanceCreationService.ts`

Zamienia udaną progresję na konkretną sytuację. Liczy jakość sytuacji jako xG, wybiera strzelca, kreatora i obrońcę kryjącego. Sytuacja może nie powstać mimo wejścia w ostatnią tercję.

`CupShotResolver.ts`

Rozstrzyga strzał. Najpierw liczy jakość wykonania strzału, potem jakość obrony bramkarza i presję obrońcy. Wynikiem może być gol, obrona, niecelny, celny bez gola, słupek, poprzeczka albo róg.

`CupDisciplineResolver.ts`

Obsługuje kontakt fizyczny. Faule wynikają z fazy gry, pressingu, ryzyka i atrybutów drużyny. Sędzia wpływa na kartki przez surowość, konsekwencję, przywilej korzyści i doświadczenie.

`CupSetPieceResolver.ts`

Projektuje stałe fragmenty: rożne, wolne z bocznych sektorów, wolne bezpośrednie i karne. Stały fragment jest konsekwencją wcześniejszego zdarzenia, nie osobnym skrótem do gola.

`CupInjuryResolver.ts`

Liczy ryzyko kontuzji z kontaktu, zmęczenia, pogody, murawy i intensywności meczu. Dzięki temu agresywny pressing i zła murawa mają koszt.

`CupOwnGoalResolver.ts`

Obsługuje samobóje wyłącznie jako efekt realnego zagrożenia: dośrodkowania, stałego fragmentu, chaosu w polu karnym albo rykoszetu.

`CupMomentumService.ts`

Liczy momentum jako efekt ostatniego przebiegu gry. Momentum wpływa na presję i zachowanie, ale nie może samo wygenerować bramki.

`CupAiDecisionService.ts`

Projekt decyzji AI. AI ma używać tych samych instrukcji co gracz: tempo, nastawienie, podania, pressing, kontra i krycie. Nie ma ukrytych bonusów.

`CupSubstitutionService.ts`

Projektuje automatyczne zmiany AI na podstawie zmęczenia, kontuzji, kartek, pozycji i jakości ławki. Docelowe wykonanie zmiany powinno zostać spięte z istniejącym systemem składów.

`CupExtraTimeService.ts`

Izoluje reguły pucharowe: dogrywkę, decyzję o karnych i doliczony czas zależny od przebiegu spotkania.

`CupMatchClockService.ts`

Oddziela stale rosnący czas techniczny od czasu pokazywanego na zegarze. Obsługuje osobny doliczony czas obu połów i zapobiega przesunięciu minut drugiej połowy.

`CupPenaltyShootoutService.ts`

Symuluje serię rzutów karnych zgodnie z logiką pucharową: 5 serii, potem nagła śmierć. Karne zależą od atrybutów wykonawcy i bramkarza.

`CupMatchLoop.ts`

Główna pętla okresu meczu. Co 5 sekund odświeża profile drużyn, presję, zdarzenia, momentum, posiadanie i zmęczenie.
Jawnie zapisuje również rozpoczęcia, wykonania rożnych, wykopy i wznowienia bramkarza.

`CupMatchEngineV2.ts`

Publiczne wejście silnika. `simulate(input)` nadal uruchamia pełną symulację testową. API live (`createLiveMatch`, `advanceLiveMatch`, `snapshotLiveMatch`, `finalizeLiveMatch`) udostępnia ten sam rdzeń w trybie przesuwanym wyłącznie do przodu. `applyManualSubstitution` waliduje ręczne zmiany bez przepisywania wcześniejszego przebiegu.

`CupBalanceSimulation.ts`

Narzędzie do kalibracji. Odpala próbkę meczów, liczy średnie globalne oraz podział per scenariusz: wyrównany mecz, faworyt u siebie, faworyt na wyjeździe, niższa liga u siebie i finał neutralny.

`CupSampleMatchFactory.ts`

Generator syntetycznych meczów testowych. Tworzy scenariusze: wyrównany mecz, faworyt u siebie, faworyt na wyjeździe, niższa liga u siebie oraz neutralny finał. Dzięki temu kalibracja nie zależy od jednego konkretnego zapisu gry.

## Targety kalibracyjne

Na próbce 500-1000 meczów:

- strzały łącznie: 18-30
- strzały celne łącznie: 6-12
- gole łącznie: 2.1-3.2
- rożne łącznie: 6-12
- spalone łącznie: 1-5
- żółte kartki: 2-6
- czerwone kartki: rzadko
- wyniki 6+ goli: rzadkie, ale możliwe
- 0:0: możliwe, ale nie dominujące

## Uruchamianie raportu

```bash
npm run test:cup-v2-balance
```

Domyślnie test odpala 40 meczów na scenariusz. Większą próbkę można uruchomić zmienną:

```bash
CUP_V2_MATCHES_PER_SCENARIO=200 npm run test:cup-v2-balance
```

## Najważniejsza różnica względem starego pucharu

Stary silnik próbuje przejść z abstrakcyjnych "udanych podań" bezpośrednio do mocnej okazji. V2 rozdziela fazy. Dzięki temu można osobno kalibrować liczbę akcji, liczbę sytuacji, celność, konwersję, rożne, spalone i faule.
