
import { MailType } from '../types';

export interface MailTemplate {
  id: string;
  type: MailType;
  sender: string;
  role: string;
  subject: string;
  body: string;
}

export const MAIL_TEMPLATES: MailTemplate[] = [
  // --- WELCOME MESSAGES ---
  {
    id: 'board_welcome_elite',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Objęcie stanowiska Pierwszego Trenera. Przesyłamy oczekiwania Zarządu klubu',
    body: 'Szanowny Trenerze,\n\W imieniu Zarządu {CLUB} serdecznie witamy Pana w naszym klubie i życzymy powodzenia w pracy z pierwszym zespołem.\n\nCieszymy się, że dołącza Pan do naszej organizacji. Liczymy, że Pańskie doświadczenie, wiedza oraz podejście do prowadzenia drużyny pozwolą nam realizować cele sportowe wyznaczone na ten sezon.\n\nOczekiwania Zarządu są jednoznaczne: Mistrzostwo Polski oraz Puchar Polski to cele minimalne, które traktujemy jako obowiązek. Dysponuje Pan kadrą o najwyższym potencjale w lidze i oczekujemy, że zostanie ona w pełni wykorzystana.\n\nInformujemy, że budżet transferowy przeznaczony na obecny sezon wynosi {TRANSFER_BUDGET} PLN. Środki te mają wspierać budowę kadry zdolnej do realizacji tych ambitnych celów.\n\nLiczymy na owocną współpracę, profesjonalizm oraz pełne zaangażowanie w realizacji wspólnego celu.\n\nZ poważaniem,\n{BOARD_SIGNATORY_NAME}\n{BOARD_SIGNATORY_ROLE}, {CLUB}'
  },
  {
    id: 'board_welcome_pro',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Witamy w {CLUB}. Oto nasze cele na nadchodzący sezon',
    body: 'Szanowny Trenerze,\n\nW imieniu Zarządu {CLUB} serdecznie witamy Pana w naszym klubie i życzymy powodzenia w pracy z pierwszym zespołem.\n\nCieszymy się, że dołącza Pan do naszej organizacji w tak ważnym momencie. Liczymy, że Pańskie doświadczenie, wiedza oraz podejście do prowadzenia drużyny pomogą nam w realizacji celów sportowych wyznaczonych na obecny sezon.\n\nGłównym oczekiwaniem Zarządu jest regularna rywalizacja o miejsca w europejskich pucharach oraz realna walka o Puchar Polski. Jest to priorytet sportowy klubu na ten sezon.\n\nInformujemy, że budżet transferowy przeznaczony na obecny sezon wynosi {TRANSFER_BUDGET} PLN. Środki te mają wspierać budowę konkurencyjnej kadry, zgodnej z potrzebami drużyny oraz strategią sportową klubu.\n\nLiczymy na owocną współpracę, profesjonalizm oraz pełne zaangażowanie w realizacji wspólnego celu.\n\nZ poważaniem,\n{BOARD_SIGNATORY_NAME}\n{BOARD_SIGNATORY_ROLE}, {CLUB}'
  },
  {
    id: 'board_welcome_elite_promotion',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Objęcie stanowiska Pierwszego Trenera.',
    body: 'Szanowny Trenerze,\n\nW imieniu Zarządu {CLUB} serdecznie witamy Pana w naszym klubie i życzymy powodzenia w pracy z pierwszym zespołem.\n\nCieszymy się, że dołącza Pan do naszej organizacji w tak ważnym momencie. Liczymy, że Pańskie doświadczenie, wiedza oraz podejście do prowadzenia drużyny pozwolą nam zrealizować cel, który jest dla {CLUB} priorytetem absolutnym.\n\nOczekiwania Zarządu są jednoznaczne: awans do {TARGET_LEAGUE} w tym sezonie. Obecny szczebel rozgrywkowy jest stanem przejściowym, który nie odpowiada ani historii, ani ambicjom klubu. Dysponuje Pan kadrą znacząco przewyższającą poziom tej ligi.\n\nInformujemy, że budżet transferowy przeznaczony na obecny sezon wynosi {TRANSFER_BUDGET} PLN. Środki te mają wspierać budowę kadry zdolnej do realizacji tego celu.\n\nLiczymy na owocną współpracę, profesjonalizm oraz pełne zaangażowanie w realizacji wspólnego celu.\n\nZ poważaniem,\n{BOARD_SIGNATORY_NAME}\n{BOARD_SIGNATORY_ROLE}, {CLUB}'
  },
  {
    id: 'board_welcome_pro_promotion',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Dyrektor Sportowy',
    subject: 'Witamy w {CLUB} . Lista priorytetów nadchodzącego sezonu',
    body: 'Szanowny Trenerze,\n\nW imieniu Zarządu {CLUB} serdecznie witamy Pana w naszym klubie i życzymy powodzenia w pracy z pierwszym zespołem.\n\nCieszymy się, że dołącza Pan do naszej organizacji w tak ważnym momencie. Liczymy, że Pańskie doświadczenie, wiedza oraz podejście do prowadzenia drużyny pomogą nam w realizacji celów sportowych wyznaczonych na obecny sezon.\n\nGłównym oczekiwaniem Zarządu jest zajęcie miejsca gwarantującego awans do {TARGET_LEAGUE}. Jest to priorytet sportowy klubu na ten sezon.\n\nInformujemy, że budżet transferowy przeznaczony na obecny sezon wynosi {TRANSFER_BUDGET} PLN. Środki te mają wspierać budowę konkurencyjnej kadry, zgodnej z potrzebami drużyny oraz strategią sportową klubu.\n\nLiczymy na owocną współpracę, profesjonalizm oraz pełne zaangażowanie w realizacji wspólnego celu.\n\nZ poważaniem,\n{BOARD_SIGNATORY_NAME}\n{BOARD_SIGNATORY_ROLE}, {CLUB}'
  },
  {
    id: 'board_welcome_mid',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Dyrektor Sportowy',
    subject: 'Witamy w {CLUB}',
    body: 'Szanowny Trenerze,\n\nW imieniu Zarządu {CLUB} serdecznie witamy Pana w naszym klubie i życzymy powodzenia w pracy z pierwszym zespołem.\n\nCieszymy się, że dołącza Pan do naszej organizacji. Liczymy, że Pańskie doświadczenie, wiedza oraz podejście do prowadzenia drużyny pomogą nam w realizacji celów sportowych wyznaczonych na obecny sezon.\n\nGłównym oczekiwaniem Zarządu jest zapewnienie stabilnej pozycji w środku tabeli. Klub przechodzi etap budowania i konsolidacji kadry — zależy nam na stworzeniu solidnych fundamentów, które pozwolą na ambitniejsze plany w kolejnych rozgrywkach.\n\nInformujemy, że budżet transferowy przeznaczony na obecny sezon wynosi {TRANSFER_BUDGET} PLN. Środki te mają wspierać budowę spójnej i stabilnej kadry.\n\nLiczymy na owocną współpracę, profesjonalizm oraz pełne zaangażowanie w realizacji wspólnego celu.\n\nZ poważaniem,\n{BOARD_SIGNATORY_NAME}\n{BOARD_SIGNATORY_ROLE}, {CLUB}'
  },
  {
    id: 'board_welcome_relegation',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Właściciel Klubu',
    subject: 'Witamy w {CLUB}. Pilne!',
    body: 'Szanowny Trenerze,\n\nW imieniu Zarządu {CLUB} serdecznie witamy Pana w naszym klubie i życzymy powodzenia w pracy z pierwszym zespołem.\n\nDoceniamy gotowość do podjęcia tego wyzwania w trudnym momencie dla klubu. Liczymy, że Pańskie doświadczenie i podejście do prowadzenia drużyny pomogą nam wyjść z obecnej sytuacji.\n\nPriorytetem absolutnym na ten sezon jest utrzymanie miejsca w lidze. Sytuacja sportowa jest poważna i wymaga natychmiastowych działań — każdy zdobyty punkt ma dla nas kluczowe znaczenie.\n\nInformujemy, że budżet transferowy przeznaczony na obecny sezon wynosi {TRANSFER_BUDGET} PLN. Prosimy o przemyślane zarządzanie tymi środkami w celu stabilizacji sytuacji kadrowej.\n\nLiczymy na owocną współpracę, profesjonalizm oraz pełne zaangażowanie w realizacji wspólnego celu.\n\nZ poważaniem,\n{BOARD_SIGNATORY_NAME}\n{BOARD_SIGNATORY_ROLE}, {CLUB}'
  },

  // --- PERFORMANCE TRACKING (BOARD) ---
  {
    id: 'board_winning_streak',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Imponująca seria zwycięstw!',
    body: 'Jesteśmy pod ogromnym wrażeniem ostatnich wyników. Seria wygranych meczów napawa nas dumą i buduje świetną atmosferę wokół klubu. Proszę utrzymać tę koncentrację. Premie dla sztabu są już przygotowane.'
  },
  {
    id: 'board_losing_streak',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Dyrektor Sportowy',
    subject: 'Głęboki niepokój zarządu',
    body: 'Ostatnia seria porażek jest dla nas nieakceptowalna. Rozumiemy trudności, ale {CLUB} nie może pozwalać sobie na takie przestoje. Oczekujemy natychmiastowej reakcji w najbliższym spotkaniu. Nasz kredyt zaufania drastrocznie maleje.'
  },
  {
    id: 'board_excellent_position',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Aktualna pozycja w tabeli',
    body: 'Z dużą satysfakcją spoglądamy na tabelę ligową. Miejsce, które obecnie zajmujemy, przewyższa nasze przedsezonowe założenia. To dowód na Pana świetną pracę z zespołem. Tak trzymać!'
  },
  {
    id: 'board_bad_position',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Właściciel Klubu',
    subject: 'Niezadowolenie z miejsca w tabeli',
    body: 'Obecna lokata {CLUB} w tabeli jest upokarzająca dla marki o takiej reputacji. Nie po to inwestujemy w kadrę, by oglądać plecy znacznie słabszych zespołów. Oczekujemy jak najszybszej poprawy wyników.'
  },
  {
    id: 'board_watching_patience',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Obserwujemy sytuację w tabeli',
    body: 'Zarząd uważnie śledzi poczynania {CLUB} na boisku i w tabeli. Zdajemy sobie sprawę, że sezon jest jeszcze w toku, dlatego cierpliwie czekamy na przełom. Liczymy jednak, że w nadchodzących kolejkach drużyna potwierdzi swój potencjał i zacznie wspinać się w klasyfikacji.'
  },

  // --- WINTER BREAK FORM EMAILS (STYCZEŃ) ---
  {
    id: 'board_winter_form_excellent',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Imponująca seria przed przerwą zimową!',
    body: 'Panie Trenerze,\n\nKorzystamy z przerwy zimowej, aby przekazać Panu słowa najwyższego uznania. Forma, jaką {CLUB} zaprezentował w ostatnich kolejkach przed pauzą, jest absolutnie imponująca. Seria wygranych meczów buduje znakomitą atmosferę w klubie i napawa nas optymizmem przed drugą rundą sezonu.\n\nZarząd jest przekonany, że kontynuacja tej drogi zaowocuje znakomitym wynikiem końcowym. Proszę utrzymać tę koncentrację i motywację podczas obozu zimowego.\n\nZ wyrazami uznania,\nZarząd Klubu'
  },
  {
    id: 'board_winter_form_good',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Dobra forma {CLUB} przed przerwą zimową',
    body: 'Panie Trenerze,\n\nPrzed przerwą zimową chcielibyśmy podsumować ostatnie tygodnie. Wyniki {CLUB} są zadowalające — drużyna prezentuje dobrą formę, a punkty zdobywane są regularnie. To solidna podstawa do pracy w drugiej części sezonu.\n\nLiczymy, że obóz zimowy zostanie dobrze wykorzystany, a drużyna wróci na boisko jeszcze mocniejsza.\n\nPozdrawienia,\nZarząd Klubu'
  },
  {
    id: 'board_winter_form_mixed',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Dyrektor Sportowy',
    subject: 'Analiza formy przed przerwą zimową',
    body: 'Panie Trenerze,\n\nPrzerwa zimowa to dobry moment na szczerą ocenę sytuacji. Ostatnie wyniki {CLUB} są nierówne — kilka zwycięstw przeplatanych stratami punktów, na które nie możemy sobie pozwolić. Widać potencjał, ale brakuje regularności.\n\nProsimy o przeanalizowanie taktyki i ustawieniu drużyny podczas obozu zimowego. Oczekujemy zdecydowanie lepszej konsekwencji po powrocie z przerwy.\n\nZ poważaniem,\nDyrektor Sportowy'
  },
  {
    id: 'board_winter_form_poor',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Właściciel Klubu',
    subject: 'Pilna rozmowa po wynikach przed przerwą',
    body: 'Panie Trenerze,\n\nPrzerwa zimowa powinna zostać przez Pana potraktowana jako ostatnie ostrzeżenie. Wyniki {CLUB} w ostatnich kolejkach są głęboko niezadowalające i budzą poważne obawy o dalszy przebieg sezonu.\n\nOczekuję gruntownej analizy przyczyn tak słabej dyspozycji i konkretnych zmian, które przyniosą efekty już w pierwszych meczach rundy wiosennej. Zarząd bacznie obserwuje sytuację.\n\nZ całą powagą,\nWłaściciel Klubu'
  },

  // --- BOARD WEEKLY PRESSURE MAILS ---
  {
    id: 'board_pressure_concern',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Dyrektor Sportowy',
    subject: 'Obecna pozycja w tabeli',
    body: 'Panie Trenerze,\n\nChcielibyśmy zwrócić Pana uwagę na obecną sytuację {CLUB} w tabeli ligowej. Pozycja, którą aktualnie zajmujemy, odbiega od naszych oczekiwań. Jesteśmy przekonani, że drużyna ma potencjał, by wypracować lepszy wynik, jednak czas gra na niekorzyść. Oczekujemy wyraźnej poprawy w najbliższych kolejkach.\n\nZarząd Klubu'
  },
  {
    id: 'board_pressure_warning',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Wyniki poniżej oczekiwań',
    body: 'Panie Trenerze,\n\nPrzesyłamy niniejsze pismo jako formalne wyrażenie niezadowolenia zarządu z obecnych wyników sportowych {CLUB}. Jesteśmy poważnie zaniepokojeni tempem i jakością pracy. Pozycja w tabeli jest nie do zaakceptowania i wymaga natychmiastowej, zdecydowanej reakcji z Pana strony.\n\nNasz kredyt zaufania maleje. Zarząd Klubu'
  },
  {
    id: 'board_pressure_critical',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Właściciel Klubu',
    subject: 'PILNE: Wymagane działania',
    body: 'Panie Trenerze,\n\nSytuacja sportowa {CLUB} osiągnęła punkt krytyczny. Obecna pozycja w tabeli jest katastrofalna i stanowi zagrożenie dla celów całego klubu. Zarząd jest zdecydowany podjąć wszelkie niezbędne kroki, by odwrócić tę sytuację.\n\nOczekujemy NATYCHMIASTOWEJ poprawy. Jeśli wyniki nie zmienią się w ciągu najbliższych kolejek, zarząd będzie zmuszony rozważyć radykalne decyzje kadrowe.\n\nZ całą powagą,\nZarząd Klubu'
  },

  // --- MATCH EVENTS (FIXED LOGIC) ---
  {
    id: 'board_high_win_praise',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'To byl mecz jaki chcielibyśmy widzieć w każdej kolejce!',
    body: ' W imieniu całego Zarządu chcemy bardzo podziękować za dostarczone emocje i piękny styl tego spotkania. Zwycięstwo przy tak dużej liczbie zdobytych bramek to najlepsza reklama naszego klubu. Kibice są zachwyceni ofensywnym stylem gry. Gratulujemy spektakularnego wyniku.'
  },
  {
    id: 'fans_bitter_loss_high_score',
    type: MailType.FANS,
    sender: 'Stowarzyszenie Kibiców',
    role: 'Gniazdowy',
    subject: 'Serce boli po takim meczu...',
    body: 'Strzeliliśmy tyle goli, a i tak wracamy z niczym. Jak można tak fatalnie grać w obronie?! To bolesna lekcja, że sam atak meczu nie wygrywa. Oczekujemy poprawy gry defensywnej, bo serca nam pękną od takich wyników.'
  },
  {
    id: 'fans_furious_loss',
    type: MailType.FANS,
    sender: 'Stowarzyszenie Kibiców',
    role: 'Gniazdowy',
    subject: 'Wstyd i hańba!',
    body: 'To co pokazaliście w dzisiejszym meczu to obraza dla tych barw. Brak walki, brak ambicji. My nie wymagamy samych wygranych, my wymagamy gryzienia trawy! Następnym razem nie będzie tak miło.'
  },

  // --- LEAGUE NEWS (INJURIES) ---
  {
    id: 'media_league_star_injured',
    type: MailType.MEDIA,
    sender: 'Przegląd Ligowy',
    role: 'Redakcja',
    subject: 'Dramat gwiazdy ligi! {PLAYER} wypada z gry.',
    body: 'Szokujące wieści z obozu {OTHER_CLUB}. Ich kluczowy zawodnik, {PLAYER}, doznał fatalnej kontuzji, która wyklucza go z gry na co najmniej {DAYS} dni. To może być punkt zwrotny w walce o czołowe lokaty w tym sezonie.'
  },

  // --- STAFF (FATIGUE & HEALTH) ---
  {
    id: 'staff_fatigue_check',
    type: MailType.STAFF,
    sender: 'Sztab Medyczny',
    role: 'Fizjoterapeuta',
    subject: 'Raport kondycyjny: {PLAYER}',
    body: 'Trenerze, rzuciłem okiem na wyniki pomiarów {PLAYER} i wygląda na to, że chłopak zaczyna odczuwać zmęczenie. Nic alarmującego na ten moment, ale warto mieć to z tyłu głowy przy ustalaniu składu. Może warto dać mu chwilę oddechu zanim zaczniemy go znowu regularnie wystawiać?'
  },
  {
    id: 'staff_fatigue_warning',
    type: MailType.STAFF,
    sender: 'Sztab Medyczny',
    role: 'Fizjoterapeuta',
    subject: 'Raport kondycyjny: {PLAYER}',
    body: 'Trenerze, muszę być z Panem szczery — kondycja {PLAYER} jest teraz naprawdę na granicy. Wystawianie go do gry w tym stanie to spore ryzyko. Organizm wyraźnie sygnalizuje, że potrzebuje przerwy. Proszę poważnie rozważyć danie mu wolnego przy najbliższej okazji, zanim dopadnie go coś poważniejszego.'
  },
  {
    id: 'staff_severe_injury',
    type: MailType.STAFF,
    sender: 'Szef Sztabu Medycznego',
    role: 'Lekarz Klubowy',
    subject: 'Raport medyczny: {PLAYER}',
    body: 'Niestety, badania potwierdziły uraz u zawodnika {PLAYER}. Przewidywany rozbrat z futbollem to około {DAYS} dni. To spore wyzwanie dla składu, ale rozpoczynamy intensywną rehabilitację.'
  },
  {
    id: 'staff_emergency_gk_hired',
    type: MailType.STAFF,
    sender: 'Sztab Szkoleniowy',
    role: 'Asystent Trenera',
    subject: 'Awaryjny bramkarz: {PLAYER} dołączył do składu',
    body: 'Trenerze, ze względu na brak dostępnych bramkarzy tymczasowo dołączyliśmy do składu juniora {PLAYER}. Będzie do dyspozycji do czasu powrotu podstawowego golkipera do pełnej sprawności.'
  },
  {
    id: 'staff_emergency_gk_fired',
    type: MailType.STAFF,
    sender: 'Sztab Szkoleniowy',
    role: 'Asystent Trenera',
    subject: 'Powrót bramkarza — {PLAYER} odchodzi',
    body: 'Trenerze, podstawowy bramkarz wrócił do pełnej sprawności. Awaryjny junior {PLAYER} opuścił skład i wrócił do akademii.'
  },
  {
    id: 'board_league_champion',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Gratulacje z okazji zdobycia tytułu Mistrza Polski',
    body: 'Szanowny Panie Trenerze,\n\nw imieniu Zarządu Klubu składamy serdeczne gratulacje z okazji zdobycia tytułu Mistrza Polski.\n\nTo wyjątkowe osiągnięcie jest potwierdzeniem Pana profesjonalizmu, wiedzy, konsekwencji oraz ogromnego zaangażowania w rozwój drużyny. Sukces ten jest również efektem umiejętnego prowadzenia zespołu, podejmowania trafnych decyzji oraz budowania atmosfery sprzyjającej osiąganiu najwyższych celów.\n\nDziękujemy za wykonaną pracę, determinację i wkład w ten historyczny sukces. Zdobycie Mistrzostwa Polski stanowi powód do dumy dla całego Klubu, jego zawodników, pracowników oraz kibiców.\n\nŻyczymy kolejnych sukcesów, dalszego rozwoju oraz wielu niezapomnianych chwil związanych z prowadzeniem naszej drużyny.\n\nZ wyrazami uznania,\n\nZarząd Klubu'
  },
  {
    id: 'board_cup_victory',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'PUCHAR JEST NASZ! 🏆 HISTORIA NAPISANA NA NOWO!',
    body: 'Brakuje nam słów, by opisać dumę, jaką czujemy. Zdobycie Pucharu Polski to moment, który na zawsze zostanie zapisany złotymi zgłoskami w historii {CLUB}. Pokonał Pan {OPPONENT} w finale na Narodowym, udowadniając, że nasza wizja rozwoju klubu była słuszna. Miasto dziś nie zaśnie, a trofeum trafia do naszej gabloty. Gratulujemy wielkiego sukcesu!'
  },
  {
    id: 'board_cup_final_loss',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Dyrektor Sportowy',
    subject: 'Głowa do góry - dziękujemy za walkę w finale',
    body: 'Panie Managerze, mimo goryczy porażki w finale z {OPPONENT}, chcemy Panu podziękować za niesamowitą przygodę w tegorocznym Pucharze Polski. Sam awans na PGE Narodowy był dla nas wielkim wydarzeniem. Dziś zabrakło niewiele, być może odrobiny szczęścia w kluczowych momentach. Proszę przekazać zawodnikom, że zarząd docenia ich trud. Teraz musimy skupić się na lidze i wyciągnąć wnioski z tego spotkania.'
  },
  {
    id: 'system_cup_news',
    type: MailType.SYSTEM,
    sender: 'Sekretariat PZPN',
    role: 'Biuro Prasowe',
    subject: 'Finał Pucharu Polski rozstrzygnięty!',
    body: 'Byliśmy świadkami pasjonującego finału na Stadionie Narodowym w Warszawie. Po zaciętym spotkaniu, nowym triumfatorem Pucharu Polski została drużyna {WINNER}, która pokonała {LOSER} wynikiem {SCORE}. Trofeum wędruje do nowej siedziby, a kibice zwycięzców rozpoczęli świętowanie sukcesu.'
  },
  {
    id: 'fans_welcome',
    type: MailType.FANS,
    sender: 'Stowarzyszenie Kibiców',
    role: 'Przewodniczący',
    subject: 'Wsparcie z trybun. Liczymy na walkę!',
    body: 'Witamy w naszym ukochanym klubie. My, kibice {CLUB}, nie oczekujemy od Pana cudów, ale wymagamy jednego: pełnego zaangażowania i walki o każdy centymetr murawy. Liczymy, że potrafi Pan zmotywować tych chłopaków tak, aby po meczu mogli spojrzeć nam w oczy. {TRANSFER_DEMAND} Jesteśmy z wami!'
  },
  {
    id: 'board_bie_approved',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Biuro Finansowe',
    subject: 'Zatwierdzenie wniosku: {PLAYER}',
    body: 'Szanowny Panie, informujemy, że Pana wniosek o rozwiązanie kontraktu z zawodnikiem {PLAYER} został rozpatrzony pozytywnie. Finanse klubu pozwalają na wypłatę odszkodowania. Proszę kontynuować proces w panelu kadrowym.'
  },
  {
    id: 'board_bie_veto',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'KATEGORYCZNE ODRZUCENIE WNIOSKU: {PLAYER}',
    body: 'Jestem głęboko rozczarowany Pana próbą pozbycia się tak kluczowego ogniwa jak {PLAYER}. Ten ruch naraziłby nas na śmieszność w mediach i zniszczył budżet na transfery. Kolejna taka prośba zostanie uznana za działanie na szkodę klubu. Proszę natychmiast porzucić ten temat.'
  },
  // --- SUPERCUP TEMPLATES ---
  {
    id: 'board_supercup_win',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Superpuchar jest nasz!',
    body: 'Szanowny Panie, gratulujemy zdobycia Superpucharu Polski po zwycięstwie nad {OPPONENT} ({SCORE}). To trofeum jest dowodem na Pana znakomity warsztat i świetne przygotowanie zespołu do sezonu. Na konto klubu wpłynęła premia w wysokości {BONUS} PLN. Oby tak dalej!'
  },
  {
    id: 'board_supercup_loss_1',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Dyrektor Sportowy',
    subject: 'Porażka w Superpucharze ({SCORE})',
    body: 'Niestety, przegrywamy walkę o trofeum z {OPPONENT}. Mimo wyniku, w Pana grze widać było pozytywne aspekty. Proszę wyciągnąć wnioski i skupić się na nadchodzącym starcie ligi.'
  },
  {
    id: 'board_supercup_loss_2',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Dyrektor Sportowy',
    subject: 'Rozczarowanie po finale Superpucharu',
    body: 'Zarząd nie jest zadowolony z wyniku meczu z {OPPONENT}. Oczekiwalibyśmy lepszej organizacji gry, szczególnie w formacji obronnej. Liczymy na szybką poprawę przed pierwszą kolejką.'
  },
  {
    id: 'board_supercup_loss_3',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Dyrektor Sportowy',
    subject: 'Słaby występ zespołu w Superpucharze',
    body: 'Jesteśmy zaniepokojeni postawą drużyny w dzisiejszym starciu. {OPPONENT} obnażył nasze braki. Oczekujemy od Pana szczegółowego raportu i planu naprawczego.'
  },
  {
    id: 'board_supercup_loss_high',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Właściciel Klubu',
    subject: 'KATASTROFA w Superpucharze',
    body: 'Wynik {SCORE} z {OPPONENT} to kompromitacja naszego klubu. Nie po to inwestujemy w kadrę, by oglądać taki antyfutbol. Pana kredyt zaufania został drastycznie uszczuplony.'
  },
  {
    id: 'fans_supercup_furious',
    type: MailType.FANS,
    sender: 'Kibice',
    role: 'Stowarzyszenie',
    subject: 'AMBICJA! WALKA!',
    body: 'To co pokazaliście dzisiaj to naplucie nam w twarz. Przegrać w taki sposób mecz o trofeum?! Jeśli w lidze będzie to samo, to nie mamy o czym rozmawiać.'
  },
  {
    id: 'media_supercup_news',
    type: MailType.MEDIA,
    sender: 'Prasa Sportowa',
    role: 'Redaktor',
    subject: 'Echa finału Superpucharu',
    body: '{MEDIA_COMMENT}'
  }, // <--- TUTAJ BYŁ BRAK PRZECINKA
  {
    id: 'media_coach_fired',
    type: MailType.MEDIA,
    sender: 'Głos Ligowy',
    role: 'Redakcja Sportowa',
    subject: 'Trzęsienie ziemi w {CLUB}! {COACH} zwolniony.',
    body: 'Oficjalnie: Zarząd klubu {CLUB} podjął decyzję o natychmiastowym rozwiązaniu kontraktu z trenerem {COACH}. Powodem dymisji jest rozczarowująca postawa zespołu i odległa pozycja w tabeli ({RANK}. miejsce). Media spekulują, że czara goryczy przelała się po ostatnich wynikach, które nie dawały nadziei na realizację celu.'
  },
  {
    id: 'press_winless_streak',
    type: MailType.MEDIA,
    sender: 'Gazeta Sportowa',
    role: 'Redakcja Sportowa',
    subject: 'Sytuacja w {CLUB} staje się coraz bardziej niepokojąca',
    body: 'Sytuacja w {CLUB} staje się coraz bardziej niepokojąca. Zespół pozostaje bez zwycięstwa od co najmniej pięciu spotkań, a rosnąca presja ze strony kibiców i ekspertów zaczyna odbijać się na atmosferze wokół drużyny.\n\nOstatnie tygodnie nie należą do udanych dla zespołu, który jeszcze niedawno uchodził za jednego z kandydatów do walki o czołowe lokaty w tabeli. Zamiast punktów i stabilnej formy, drużyna notuje kolejne rozczarowujące rezultaty, tracąc cenne punkty zarówno w meczach domowych, jak i wyjazdowych.\n\nNiepokój budzi przede wszystkim styl gry zespołu. Coraz częściej pojawiają się również pytania dotyczące decyzji sztabu szkoleniowego oraz przygotowania mentalnego zawodników.\n\nChoć przedstawiciele klubu publicznie apelują o spokój i podkreślają, że drużyna przechodzi jedynie trudniejszy moment sezonu, cierpliwość kibiców wydaje się coraz mniejsza. Po ostatnim spotkaniu na trybunach pojawiły się pierwsze oznaki frustracji, a w mediach społecznościowych nie brakuje głosów domagających się zmian.\n\nNajbliższe mecze mogą okazać się kluczowe dla przyszłości zespołu oraz pozycji sztabu szkoleniowego. Jeśli seria bez zwycięstwa będzie się wydłużać, presja wokół {CLUB} może osiągnąć poziom, który trudno będzie zignorować.'
  },
  {
    id: 'board_coach_warning',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'OSTRZEŻENIE - Ultimatum Zarządu',
    body: 'Szanowny Panie, nasza cierpliwość dobiegła końca. Obecna lokata zespołu ({RANK}) drastycznie odbiega od Pana obietnic. Jeśli w najbliższym czasie nie zobaczymy wyraźnej poprawy punktowej, będziemy zmuszeni podjąć radykalne kroki. Proszę traktować tę wiadomość jako oficjalne ostrzeżenie.'
  },
  {
    id: 'board_season_ticket_report',
    type: MailType.BOARD,
    sender: 'Dział Marketingu',
    role: 'Dyrektor ds. Sprzedaży',
    subject: 'Raport przedsprzedaży karnetów. Sezon {SEASON}',
    body: 'Szanowny Panie Managerze,\n\nZ przyjemnością przedstawiamy raport z przedsprzedaży karnetów sezonowych dla {CLUB} przed startem nowych rozgrywek.\n\n🏟️ STADION: {STADIUM}\n📊 POJEMNOŚĆ: {CAPACITY} miejsc\n\n--- WYNIKI PRZEDSPRZEDAŻY ---\n\n🎫 Sprzedane karnety: {TICKETS_SOLD} szt.\n💰 Przychód netto: {REVENUE}\n💳 Cena karnetu: {TICKET_PRICE}\n\nZainteresowanie kibiców przed tym sezonem oceniamy jako {DEMAND_LEVEL}. Pieniądze z przedsprzedaży zostały doliczone do budżetu klubu.\n\nZ poważaniem,\nDział Marketingu {CLUB}'
  },
  // --- EUROPEJSKIE GRATULACJE — FAZA GRUPOWA ---
  {
    id: 'board_european_advance_group_cl',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Awans do Fazy Grupowej Ligi Mistrzów — Gratulacje!',
    body: 'Panie Managerze,\n\nW imieniu całego Zarządu {CLUB} składamy serdeczne gratulacje z okazji awansu do fazy grupowej Ligi Mistrzów! To historyczny moment dla naszego klubu. Europejskie areny czekają — liczymy na godne zaprezentowanie barw {CLUB}. Zarząd w pełni Pana wspiera.\n\nZ wyrazami uznania,\nZarząd {CLUB}'
  },
  {
    id: 'board_european_advance_group_el',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Awans do Fazy Grupowej Ligi Europy. Gratulacje!',
    body: 'Szanowny Panie Managerze,\n\nZ wielką przyjemnością gratulujemy awansu do fazy grupowej Ligi Europy! To znakomity wynik, który potwierdza rosnącą siłę {CLUB} na arenie europejskiej. Cały klub jest z Pana dumny — powodzenia w dalszych zmaganiach!\n\nZ poważaniem,\nZarząd {CLUB}'
  },
  {
    id: 'board_european_advance_group_conf',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Awans do Fazy Grupowej Ligi Konferencji. Gratulacje!',
    body: 'Panie Managerze,\n\nW imieniu Zarządu {CLUB} gratulujemy awansu do fazy grupowej Ligi Konferencji UEFA! To ważny krok w europejskiej rywalizacji i powód do dumy dla całego klubu. Liczymy na dalsze sukcesy!\n\nZ poważaniem,\nZarząd {CLUB}'
  },
  // --- EUROPEJSKIE GRATULACJE — 1/8 FINAŁU ---
  {
    id: 'board_european_advance_r16_cl',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Awans do 1/8 Finału Ligi Mistrzów!',
    body: 'Panie Managerze,\n\nZarząd {CLUB} składa gratulacje z okazji awansu do 1/8 finału Ligi Mistrzów! To wybitne osiągnięcie, które stawia {CLUB} w gronie europejskiej elity. Jesteśmy niezwykle dumni i z niecierpliwością oczekujemy kolejnych meczów.\n\nZ wyrazami uznania,\nZarząd {CLUB}'
  },
  {
    id: 'board_european_advance_r16_el',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Awans do 1/8 Finału Ligi Europy!',
    body: 'Szanowny Panie Managerze,\n\nGratulujemy awansu do 1/8 finału Ligi Europy! Wyjście z grupy to doskonały wynik potwierdzający jakość pracy całego sztabu. Zarząd {CLUB} jest pełen optymizmu i wierzy w dalsze postępy drużyny.\n\nZ poważaniem,\nZarząd {CLUB}'
  },
  {
    id: 'board_european_advance_r16_conf',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Awans do 1/8 Finału Ligi Konferencji!',
    body: 'Panie Managerze,\n\nGratulujemy awansu do fazy pucharowej Ligi Konferencji! Wyjście z grupy to potwierdzenie ciężkiej pracy całego sztabu szkoleniowego. Zarząd {CLUB} jest zadowolony z dotychczasowych wyników i liczy na kolejne sukcesy.\n\nZ poważaniem,\nZarząd {CLUB}'
  },
  // --- EUROPEJSKIE GRATULACJE — 1/4 FINAŁU ---
  {
    id: 'board_european_advance_qf_cl',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Awans do Ćwierćfinału Ligi Mistrzów!',
    body: 'Panie Managerze,\n\nSerdecznie gratulujemy niesamowitego osiągnięcia — {CLUB} awansował do ćwierćfinału Ligi Mistrzów! To historyczny wyczyn, który przejdzie do kronik naszego klubu. Cały zarząd, kibice i miasto są z Pana niezwykle dumni!\n\nZ ogromnym uznaniem,\nZarząd {CLUB}'
  },
  {
    id: 'board_european_advance_qf_el',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Awans do Ćwierćfinału Ligi Europy!',
    body: 'Szanowny Panie Managerze,\n\nGratulujemy awansu do ćwierćfinału Ligi Europy! To znakomity wynik, świadczący o doskonałej jakości pracy całego zespołu. Zarząd {CLUB} w pełni Pana popiera i oczekuje kolejnych emocji.\n\nZ poważaniem,\nZarząd {CLUB}'
  },
  {
    id: 'board_european_advance_qf_conf',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Awans do Ćwierćfinału Ligi Konferencji!',
    body: 'Panie Managerze,\n\nGratulujemy awansu do ćwierćfinału Ligi Konferencji! To kolejny krok naprzód w europejskiej przygodzie {CLUB}. Zarząd jest zadowolony z postawy drużyny i liczy na dalsze sukcesy.\n\nZ poważaniem,\nZarząd {CLUB}'
  },
  // --- EUROPEJSKIE GRATULACJE — 1/2 FINAŁU ---
  {
    id: 'board_european_advance_sf_cl',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Awans do Półfinału Ligi Mistrzów! Historyczne osiągnięcie!',
    body: 'Panie Managerze,\n\nJesteśmy w półfinale Ligi Mistrzów! To historyczne osiągnięcie {CLUB}, którego nikt nie zapomni. W imieniu zarządu, kibiców i całego miasta składamy Panu wyrazy najwyższego uznania. Jeden krok od wielkiego finału — wierzymy w Pana i drużynę!\n\nZ ogromną dumą,\nZarząd {CLUB}'
  },
  {
    id: 'board_european_advance_sf_el',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Awans do Półfinału Ligi Europy!',
    body: 'Szanowny Panie Managerze,\n\nZarząd {CLUB} z ogromną dumą gratuluje awansu do półfinału Ligi Europy! To znakomity wynik, który odzwierciedla ciężką pracę całego sztabu szkoleniowego. Do wielkiego finału brakuje jeszcze jednego kroku — liczymy na Pana!\n\nZ poważaniem,\nZarząd {CLUB}'
  },
  {
    id: 'board_european_advance_sf_conf',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Awans do Półfinału Ligi Konferencji!',
    body: 'Panie Managerze,\n\nSerdecznie gratulujemy awansu do półfinału Ligi Konferencji! {CLUB} udowadnia, że jest liczącą się siłą w europejskich rozgrywkach. Zarząd w pełni wierzy, że drużyna powalczy o najwyższe laury.\n\nZ poważaniem,\nZarząd {CLUB}'
  },
  // --- EUROPEJSKIE GRATULACJE — FINAŁ ---
  {
    id: 'board_european_advance_final_el',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: '{CLUB} w Finale Ligi Europy! Gratulacje!',
    body: 'Panie Managerze,\n\nGRATULACJE! {CLUB} awansował do Finału Ligi Europy! To jeden z największych momentów w historii naszego klubu. Cały kraj patrzy na Was z podziwem. Zarząd jest za Panem w 100% — idźcie po ten puchar!\n\nZ wyrazami najwyższego uznania,\nZarząd {CLUB}'
  },
  {
    id: 'board_european_advance_final_conf',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: '{CLUB} w Finale Ligi Konferencji! Gratulacje!',
    body: 'Panie Managerze,\n\nGRATULACJE! {CLUB} awansował do Finału Ligi Konferencji UEFA! To historyczny sukces, który przejdzie do annałów naszego klubu. Zarząd jest z Pana niezwykle dumny. Powodzenia w wielkim finale!\n\nZ wyrazami najwyższego uznania,\nZarząd {CLUB}'
  },

  // --- OFERTY TRANSFEROWE PRZYCHODZĄCE OD KLUBÓW AI ---
  {
    id: 'incoming_offer_initial',
    type: MailType.SYSTEM,
    sender: 'Dział Transferowy',
    role: 'Kierownik ds. Transferów',
    subject: 'Do rozpatrzenia: oferta za {PLAYER}',
    body: 'Panie Managerze,\n\nW zakładce "Oferty za moich" czeka na Pana nowa oferta transferowa od klubu {BUYER_CLUB} ({BUYER_LEAGUE}) za zawodnika {PLAYER}.\n\nSzczegóły oferty:\n- Proponowana kwota: {FEE} PLN\n- Termin przejścia: {TIMING}\n\n{BOARD_PRESSURE_NOTE}Proszę przejść do Aktywności Rynkowej i podjąć decyzję w ciągu 5 dni.\n\nPozdrawiam,\nDział Transferowy {CLUB}'
  },
  {
    id: 'incoming_offer_reminder',
    type: MailType.SYSTEM,
    sender: 'Dział Transferowy',
    role: 'Kierownik ds. Transferów',
    subject: 'PRZYPOMNIENIE: Oferta za {PLAYER} — zostały 3 dni',
    body: 'Panie Managerze,\n\nPrzypominamy, że nadal oczekuje na odpowiedź oferta transferowa klubu {BUYER_CLUB} za zawodnika {PLAYER} na kwotę {FEE} PLN.\n\nJeśli nie udzieli Pan odpowiedzi w ciągu 3 dni, oferta automatycznie wygaśnie.\n\nPozdrawiam,\nDział Transferowy {CLUB}'
  },
  {
    id: 'incoming_offer_expired',
    type: MailType.SYSTEM,
    sender: 'Dział Transferowy',
    role: 'Kierownik ds. Transferów',
    subject: 'Oferta za {PLAYER} wygasła',
    body: 'Panie Managerze,\n\nInformujemy, że oferta transferowa klubu {BUYER_CLUB} za zawodnika {PLAYER} wygasła z powodu braku odpowiedzi z naszej strony.\n\nJeśli zmieni Pan decyzję, {BUYER_CLUB} może złożyć nową ofertę w przyszłości.\n\nPozdrawiam,\nDział Transferowy {CLUB}'
  },
  {
    id: 'incoming_offer_ai_accepted_counter',
    type: MailType.SYSTEM,
    sender: 'Dział Transferowy',
    role: 'Kierownik ds. Transferów',
    subject: '{BUYER_CLUB} zaakceptował naszą cenę za {PLAYER}',
    body: 'Panie Managerze,\n\nKlub {BUYER_CLUB} zaakceptował naszą kwotę {FEE} PLN za zawodnika {PLAYER}.\n\nRozpoczęliśmy negocjacje z zawodnikiem. O wynikach poinformujemy Pana w ciągu kilku dni.\n\nPozdrawiam,\nDział Transferowy {CLUB}'
  },
  {
    id: 'incoming_offer_ai_countered',
    type: MailType.SYSTEM,
    sender: 'Dział Transferowy',
    role: 'Kierownik ds. Transferów',
    subject: '{BUYER_CLUB} złożył kontrofertę za {PLAYER}',
    body: 'Panie Managerze,\n\nKlub {BUYER_CLUB} nie zaakceptował naszej ceny i zaproponował kwotę {AI_COUNTER_FEE} PLN za zawodnika {PLAYER}.\n\nCzeka Pan na Pana decyzję (runda {ROUND}/3).\n\nPozdrawiam,\nDział Transferowy {CLUB}'
  },
  {
    id: 'incoming_offer_ai_rejected_counter',
    type: MailType.SYSTEM,
    sender: 'Dział Transferowy',
    role: 'Kierownik ds. Transferów',
    subject: '{BUYER_CLUB} odrzucił negocjacje za {PLAYER}',
    body: 'Panie Managerze,\n\nKlub {BUYER_CLUB} ostatecznie zrezygnował z transferu zawodnika {PLAYER}. Negocjacje zostały zakończone.\n\nPozdrawiam,\nDział Transferowy {CLUB}'
  },
  {
    id: 'incoming_offer_player_accepted_confirm',
    type: MailType.SYSTEM,
    sender: 'Dział Transferowy',
    role: 'Kierownik ds. Transferów',
    subject: '{PLAYER} wyraził zgodę — zatwierdź transfer',
    body: 'Panie Managerze,\n\nZawodnik {PLAYER} zaakceptował warunki kontraktu zaproponowane przez {BUYER_CLUB}.\n\nKwota transferu: {FEE} PLN\nTermin przejścia: {TIMING}\n\nCzekamy na Pana ostateczną decyzję — czy zatwierdza Pan ten transfer?\n\nPozdrawiam,\nDział Transferowy {CLUB}'
  },
  {
    id: 'incoming_offer_player_refused',
    type: MailType.SYSTEM,
    sender: 'Dział Transferowy',
    role: 'Kierownik ds. Transferów',
    subject: '{PLAYER} odrzucił ofertę {BUYER_CLUB}',
    body: 'Panie Managerze,\n\nInformujemy, że zawodnik {PLAYER} odmówił podjęcia rozmów z klubem {BUYER_CLUB}. Negocjacje zostały zakończone.\n\nZawodnik pozostaje w {CLUB}.\n\nPozdrawiam,\nDział Transferowy {CLUB}'
  },

  // ─── OBÓZ ZIMOWY ─────────────────────────────────────────────────────────────
  {
    id: 'winter_camp_invite',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Propozycja obozu zimowego dla {CLUB}',
    body: 'Panie Trenerze,\n\nZarząd {CLUB} rekomenduje zorganizowanie zimowego obozu przygotowawczego w ramach przerwy zimowej. Obóz potrwa od 2 do 15 stycznia.\n\nPrzygotowaliśmy propozycje destynacji wraz z szacunkowymi kosztami (wynajem boisk, zakwaterowanie, personel medyczny i logistyka). Prosimy o wybór lokalizacji do końca tygodnia.\n\nJeśli obóz nie zostanie zorganizowany, drużyna samodzielnie przygotuje się do drugiej części sezonu — jednak zarząd zaleca skorzystanie z tej możliwości.\n\nZ poważaniem,\nZarząd {CLUB}'
  },
  {
    id: 'winter_camp_assistant_fitness',
    type: MailType.STAFF,
    sender: 'Asystent Trenera',
    role: 'Pierwszy Asystent',
    subject: 'Sugestia programu obozu — kondycja priorytetem',
    body: 'Panie Trenerze,\n\nprzeanalizowałem parametry drużyny pod kątem programu obozu zimowego.\n\nNasza kondycja fizyczna — stamina i siła — wymaga zdecydowanej poprawy przed wiosną. Proponuję skoncentrowanie treningu na aspekcie kondycyjnym. Intensywność powinna być umiarkowana lub wysoka, jednak proszę pamiętać o zwiększonym ryzyku kontuzji przy zbyt intensywnym obciążeniu.\n\nOstateczna decyzja należy do Pana.\n\nZ poważaniem,\nAsystent Trenera'
  },
  {
    id: 'winter_camp_assistant_tactical',
    type: MailType.STAFF,
    sender: 'Asystent Trenera',
    role: 'Pierwszy Asystent',
    subject: 'Sugestia programu obozu — praca taktyczna',
    body: 'Panie Trenerze,\n\nprzeanalizowałem wyniki i parametry drużyny.\n\nZważywszy na nasze rezultaty w rundzie jesiennej, uważam, że największe rezerwy tkwią w organizacji taktycznej — mentality i ustawieniu zawodników. Obóz zimowy to idealna okazja na intensywną pracę nad tymi elementami bez presji wynikowej.\n\nProponuję program taktyczny z umiarkowaną intensywnością. Ostateczna decyzja należy do Pana.\n\nZ poważaniem,\nAsystent Trenera'
  },
  {
    id: 'winter_camp_report_success',
    type: MailType.STAFF,
    sender: 'Asystent Trenera',
    role: 'Pierwszy Asystent',
    subject: 'Raport z obozu zimowego — {CAMP_LOCATION}',
    body: 'Panie Trenerze,\n\nobóz zimowy {CLUB} w {CAMP_LOCATION} dobiegł końca.\n\nPodsumowanie:\n• Program: {CAMP_PROGRAM}\n• Intensywność: {CAMP_INTENSITY}\n• Zawodnicy z poprawą atrybutów: {IMPROVED_COUNT}\n• Kontuzje podczas obozu: {INJURY_COUNT}\n• Zmiana morale drużyny: {MORALE_CHANGE}\n\nDrużyna wróciła zmotywowana i lepiej przygotowana fizycznie. Widzę wyraźną poprawę w tych obszarach, na których się skupiliśmy.\n\nZ poważaniem,\nAsystent Trenera'
  },
  {
    id: 'winter_camp_report_declined',
    type: MailType.STAFF,
    sender: 'Asystent Trenera',
    role: 'Pierwszy Asystent',
    subject: 'Brak obozu zimowego — informacja o konsekwencjach',
    body: 'Panie Trenerze,\n\nzgodnie z Pana decyzją drużyna {CLUB} nie wzięła udziału w obozie zimowym.\n\nMuszę uczciwie poinformować, że zawodnicy odczuwają ten brak. Morale drużyny obniżyło się — piłkarze widzieli, jak inne zespoły wyjeżdżają na przygotowania, a my pozostaliśmy bez zorganizowanego programu treningowego.\n\nNiektórzy zawodnicy samodzielnie ograniczyli treningi w przerwie, co może mieć przełożenie na ich gotowość w drugiej części sezonu.\n\nZ poważaniem,\nAsystent Trenera'
  },
  // ─── OBÓZ LETNI ──────────────────────────────────────────────────────────────
  {
    id: 'summer_camp_invite',
    type: MailType.BOARD,
    sender: 'Zarząd Klubu',
    role: 'Prezes Zarządu',
    subject: 'Propozycja letniego obozu przygotowawczego — {CLUB}',
    body: 'Panie Trenerze,\n\nZarząd {CLUB} rekomenduje zorganizowanie letniego obozu przygotowawczego przed startem nowego sezonu. Obóz planowany jest na 18–28 czerwca.\n\nBiorąc pod uwagę wysokie temperatury w tym okresie, przygotowaliśmy propozycje destynacji w krajach o umiarkowanym klimacie: Polska, Czechy, Słowacja, Austria oraz Szwajcaria. Każda lokalizacja oferuje odpowiednią infrastrukturę treningową przy komfortowych warunkach pogodowych.\n\nProsimy o wybór lokalizacji do 19 maja.\n\nJeśli obóz nie zostanie zorganizowany, drużyna samodzielnie przygotuje się do nowego sezonu — zarząd jednak zaleca skorzystanie z tej możliwości.\n\nZ poważaniem,\nZarząd {CLUB}'
  },
  {
    id: 'summer_camp_assistant_fitness',
    type: MailType.STAFF,
    sender: 'Asystent Trenera',
    role: 'Pierwszy Asystent',
    subject: 'Sugestia programu obozu letniego — kondycja priorytetem',
    body: 'Panie Trenerze,\n\nprzeanalizowałem parametry drużyny pod kątem programu letniego obozu przygotowawczego.\n\nPrzed startem nowego sezonu kluczowe jest zbudowanie solidnej bazy kondycyjnej. Stamina i siła zawodników wymagają pracy, aby podołać wymagającemu harmonogramowi. Proponuję skoncentrowanie obozu na aspekcie kondycyjnym z umiarkowaną intensywnością.\n\nProszę pamiętać, że zbyt wysoka intensywność na początku przygotowań zwiększa ryzyko kontuzji. Ostateczna decyzja należy do Pana.\n\nZ poważaniem,\nAsystent Trenera'
  },
  {
    id: 'summer_camp_assistant_tactical',
    type: MailType.STAFF,
    sender: 'Asystent Trenera',
    role: 'Pierwszy Asystent',
    subject: 'Sugestia programu obozu letniego — praca taktyczna',
    body: 'Panie Trenerze,\n\nprzeanalizowałem wyniki minionego sezonu i aktualne parametry drużyny.\n\nUważam, że letni obóz przygotowawczy to idealna okazja do intensywnej pracy taktycznej bez presji wynikowej. Wyniki drużyny wskazują na rezerwy w organizacji gry i mentality zawodników — właśnie te elementy decydują o skuteczności w nowym sezonie.\n\nProponuję program taktyczny z umiarkowaną intensywnością. Ostateczna decyzja należy do Pana.\n\nZ poważaniem,\nAsystent Trenera'
  },
  {
    id: 'summer_camp_report_success',
    type: MailType.STAFF,
    sender: 'Asystent Trenera',
    role: 'Pierwszy Asystent',
    subject: 'Raport z obozu letniego — {CAMP_LOCATION}',
    body: 'Panie Trenerze,\n\nletni obóz przygotowawczy {CLUB} w {CAMP_LOCATION} dobiegł końca.\n\nPodsumowanie:\n• Program: {CAMP_PROGRAM}\n• Intensywność: {CAMP_INTENSITY}\n• Zawodnicy z poprawą atrybutów: {IMPROVED_COUNT}\n• Kontuzje podczas obozu: {INJURY_COUNT}\n• Zmiana morale drużyny: {MORALE_CHANGE}\n\nDrużyna wróciła gotowa na nowy sezon — widać wyraźną poprawę w obszarach, na których skupiło się nasze szkolenie. Zawodnicy są zmotywowani i dobrze przygotowani fizycznie do startu rozgrywek.\n\nZ poważaniem,\nAsystent Trenera'
  },
  {
    id: 'summer_camp_report_declined',
    type: MailType.STAFF,
    sender: 'Asystent Trenera',
    role: 'Pierwszy Asystent',
    subject: 'Brak obozu letniego — informacja o konsekwencjach',
    body: 'Panie Trenerze,\n\nzgodnie z Pana decyzją drużyna {CLUB} nie wzięła udziału w letnim obozie przygotowawczym.\n\nMuszę uczciwie poinformować, że zawodnicy odczuwają ten brak. Wiele drużyn z naszej ligi wyjechało na zorganizowane przygotowania, co może dać im przewagę na starcie sezonu. Morale drużyny obniżyło się, a indywidualne przygotowanie poszczególnych zawodników w przerwie letniej jest bardzo zróżnicowane.\n\nZ poważaniem,\nAsystent Trenera'
  },
  {
    id: 'staff_retirement',
    type: MailType.STAFF,
    sender: 'Dyrektor Sportowy',
    role: 'Dyrektor Sportowy',
    subject: 'Odejście na emeryturę – zmiany w sztabie szkoleniowym',
    body: 'Szanowny Panie Managerze,\n\nInformuję, że następujący członkowie naszego sztabu szkoleniowego postanowili zakończyć karierę zawodową i przejść na zasłużoną emeryturę:\n\n{STAFF_LIST}\n\nSerdecznie dziękujemy im za wkład w rozwój klubu i życzymy wszystkiego najlepszego.\n\nZ poważaniem,\nDyrektor Sportowy'
  }
]; // <--- ZAMKNIĘCIE TABLICY
