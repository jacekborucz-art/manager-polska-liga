var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target2) => (target2 = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target2, "default", { value: mod, enumerable: true }) : target2,
  mod
));

// tests/BoardMailRecoveryTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);

// types.ts
var Newspaper = /* @__PURE__ */ ((Newspaper2) => {
  Newspaper2["GAZETA_SPORTOWA"] = "GAZETA_SPORTOWA";
  Newspaper2["DWIE_BRAMKI"] = "DWIE_BRAMKI";
  Newspaper2["PILKA_NOZNA"] = "PILKA_NOZNA";
  Newspaper2["FUTBOL_NAD_WISLA"] = "FUTBOL_NAD_WISLA";
  Newspaper2["DZIENNIK_SPORTOWY"] = "DZIENNIK_SPORTOWY";
  return Newspaper2;
})(Newspaper || {});

// data/mail_templates_pl.ts
var MAIL_TEMPLATES = [
  // --- WELCOME MESSAGES ---
  {
    id: "board_welcome_elite",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Obj\u0119cie stanowiska Pierwszego Trenera. Przesy\u0142amy oczekiwania Zarz\u0105du klubu",
    body: "Szanowny Trenerze,\nW imieniu Zarz\u0105du {CLUB} serdecznie witamy Pana w naszym klubie i \u017Cyczymy powodzenia w pracy z pierwszym zespo\u0142em.\n\nCieszymy si\u0119, \u017Ce do\u0142\u0105cza Pan do naszej organizacji. Liczymy, \u017Ce Pa\u0144skie do\u015Bwiadczenie, wiedza oraz podej\u015Bcie do prowadzenia dru\u017Cyny pozwol\u0105 nam realizowa\u0107 cele sportowe wyznaczone na ten sezon.\n\nOczekiwania Zarz\u0105du s\u0105 jednoznaczne: Mistrzostwo Polski oraz Puchar Polski to cele minimalne, kt\xF3re traktujemy jako obowi\u0105zek. Dysponuje Pan kadr\u0105 o najwy\u017Cszym potencjale w lidze i oczekujemy, \u017Ce zostanie ona w pe\u0142ni wykorzystana.\n\nInformujemy, \u017Ce bud\u017Cet transferowy przeznaczony na obecny sezon wynosi {TRANSFER_BUDGET} PLN. \u015Arodki te maj\u0105 wspiera\u0107 budow\u0119 kadry zdolnej do realizacji tych ambitnych cel\xF3w.\n\nLiczymy na owocn\u0105 wsp\xF3\u0142prac\u0119, profesjonalizm oraz pe\u0142ne zaanga\u017Cowanie w realizacji wsp\xF3lnego celu.\n\nZ powa\u017Caniem,\n{BOARD_SIGNATORY_NAME}\n{BOARD_SIGNATORY_ROLE}, {CLUB}"
  },
  {
    id: "board_welcome_pro",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Witamy w {CLUB}. Oto nasze cele na nadchodz\u0105cy sezon",
    body: "Szanowny Trenerze,\n\nW imieniu Zarz\u0105du {CLUB} serdecznie witamy Pana w naszym klubie i \u017Cyczymy powodzenia w pracy z pierwszym zespo\u0142em.\n\nCieszymy si\u0119, \u017Ce do\u0142\u0105cza Pan do naszej organizacji w tak wa\u017Cnym momencie. Liczymy, \u017Ce Pa\u0144skie do\u015Bwiadczenie, wiedza oraz podej\u015Bcie do prowadzenia dru\u017Cyny pomog\u0105 nam w realizacji cel\xF3w sportowych wyznaczonych na obecny sezon.\n\nG\u0142\xF3wnym oczekiwaniem Zarz\u0105du jest regularna rywalizacja o miejsca w europejskich pucharach oraz realna walka o Puchar Polski. Jest to priorytet sportowy klubu na ten sezon.\n\nInformujemy, \u017Ce bud\u017Cet transferowy przeznaczony na obecny sezon wynosi {TRANSFER_BUDGET} PLN. \u015Arodki te maj\u0105 wspiera\u0107 budow\u0119 konkurencyjnej kadry, zgodnej z potrzebami dru\u017Cyny oraz strategi\u0105 sportow\u0105 klubu.\n\nLiczymy na owocn\u0105 wsp\xF3\u0142prac\u0119, profesjonalizm oraz pe\u0142ne zaanga\u017Cowanie w realizacji wsp\xF3lnego celu.\n\nZ powa\u017Caniem,\n{BOARD_SIGNATORY_NAME}\n{BOARD_SIGNATORY_ROLE}, {CLUB}"
  },
  {
    id: "board_welcome_elite_promotion",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Obj\u0119cie stanowiska Pierwszego Trenera.",
    body: "Szanowny Trenerze,\n\nW imieniu Zarz\u0105du {CLUB} serdecznie witamy Pana w naszym klubie i \u017Cyczymy powodzenia w pracy z pierwszym zespo\u0142em.\n\nCieszymy si\u0119, \u017Ce do\u0142\u0105cza Pan do naszej organizacji w tak wa\u017Cnym momencie. Liczymy, \u017Ce Pa\u0144skie do\u015Bwiadczenie, wiedza oraz podej\u015Bcie do prowadzenia dru\u017Cyny pozwol\u0105 nam zrealizowa\u0107 cel, kt\xF3ry jest dla {CLUB} priorytetem absolutnym.\n\nOczekiwania Zarz\u0105du s\u0105 jednoznaczne: awans do {TARGET_LEAGUE} w tym sezonie. Obecny szczebel rozgrywkowy jest stanem przej\u015Bciowym, kt\xF3ry nie odpowiada ani historii, ani ambicjom klubu. Dysponuje Pan kadr\u0105 znacz\u0105co przewy\u017Cszaj\u0105c\u0105 poziom tej ligi.\n\nInformujemy, \u017Ce bud\u017Cet transferowy przeznaczony na obecny sezon wynosi {TRANSFER_BUDGET} PLN. \u015Arodki te maj\u0105 wspiera\u0107 budow\u0119 kadry zdolnej do realizacji tego celu.\n\nLiczymy na owocn\u0105 wsp\xF3\u0142prac\u0119, profesjonalizm oraz pe\u0142ne zaanga\u017Cowanie w realizacji wsp\xF3lnego celu.\n\nZ powa\u017Caniem,\n{BOARD_SIGNATORY_NAME}\n{BOARD_SIGNATORY_ROLE}, {CLUB}"
  },
  {
    id: "board_welcome_pro_promotion",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Dyrektor Sportowy",
    subject: "Witamy w {CLUB} . Lista priorytet\xF3w nadchodz\u0105cego sezonu",
    body: "Szanowny Trenerze,\n\nW imieniu Zarz\u0105du {CLUB} serdecznie witamy Pana w naszym klubie i \u017Cyczymy powodzenia w pracy z pierwszym zespo\u0142em.\n\nCieszymy si\u0119, \u017Ce do\u0142\u0105cza Pan do naszej organizacji w tak wa\u017Cnym momencie. Liczymy, \u017Ce Pa\u0144skie do\u015Bwiadczenie, wiedza oraz podej\u015Bcie do prowadzenia dru\u017Cyny pomog\u0105 nam w realizacji cel\xF3w sportowych wyznaczonych na obecny sezon.\n\nG\u0142\xF3wnym oczekiwaniem Zarz\u0105du jest zaj\u0119cie miejsca gwarantuj\u0105cego awans do {TARGET_LEAGUE}. Jest to priorytet sportowy klubu na ten sezon.\n\nInformujemy, \u017Ce bud\u017Cet transferowy przeznaczony na obecny sezon wynosi {TRANSFER_BUDGET} PLN. \u015Arodki te maj\u0105 wspiera\u0107 budow\u0119 konkurencyjnej kadry, zgodnej z potrzebami dru\u017Cyny oraz strategi\u0105 sportow\u0105 klubu.\n\nLiczymy na owocn\u0105 wsp\xF3\u0142prac\u0119, profesjonalizm oraz pe\u0142ne zaanga\u017Cowanie w realizacji wsp\xF3lnego celu.\n\nZ powa\u017Caniem,\n{BOARD_SIGNATORY_NAME}\n{BOARD_SIGNATORY_ROLE}, {CLUB}"
  },
  {
    id: "board_welcome_mid",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Dyrektor Sportowy",
    subject: "Witamy w {CLUB}",
    body: "Szanowny Trenerze,\n\nW imieniu Zarz\u0105du {CLUB} serdecznie witamy Pana w naszym klubie i \u017Cyczymy powodzenia w pracy z pierwszym zespo\u0142em.\n\nCieszymy si\u0119, \u017Ce do\u0142\u0105cza Pan do naszej organizacji. Liczymy, \u017Ce Pa\u0144skie do\u015Bwiadczenie, wiedza oraz podej\u015Bcie do prowadzenia dru\u017Cyny pomog\u0105 nam w realizacji cel\xF3w sportowych wyznaczonych na obecny sezon.\n\nG\u0142\xF3wnym oczekiwaniem Zarz\u0105du jest zapewnienie stabilnej pozycji w \u015Brodku tabeli. Klub przechodzi etap budowania i konsolidacji kadry \u2014 zale\u017Cy nam na stworzeniu solidnych fundament\xF3w, kt\xF3re pozwol\u0105 na ambitniejsze plany w kolejnych rozgrywkach.\n\nInformujemy, \u017Ce bud\u017Cet transferowy przeznaczony na obecny sezon wynosi {TRANSFER_BUDGET} PLN. \u015Arodki te maj\u0105 wspiera\u0107 budow\u0119 sp\xF3jnej i stabilnej kadry.\n\nLiczymy na owocn\u0105 wsp\xF3\u0142prac\u0119, profesjonalizm oraz pe\u0142ne zaanga\u017Cowanie w realizacji wsp\xF3lnego celu.\n\nZ powa\u017Caniem,\n{BOARD_SIGNATORY_NAME}\n{BOARD_SIGNATORY_ROLE}, {CLUB}"
  },
  {
    id: "board_welcome_relegation",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "W\u0142a\u015Bciciel Klubu",
    subject: "Witamy w {CLUB}. Pilne!",
    body: "Szanowny Trenerze,\n\nW imieniu Zarz\u0105du {CLUB} serdecznie witamy Pana w naszym klubie i \u017Cyczymy powodzenia w pracy z pierwszym zespo\u0142em.\n\nDoceniamy gotowo\u015B\u0107 do podj\u0119cia tego wyzwania w trudnym momencie dla klubu. Liczymy, \u017Ce Pa\u0144skie do\u015Bwiadczenie i podej\u015Bcie do prowadzenia dru\u017Cyny pomog\u0105 nam wyj\u015B\u0107 z obecnej sytuacji.\n\nPriorytetem absolutnym na ten sezon jest utrzymanie miejsca w lidze. Sytuacja sportowa jest powa\u017Cna i wymaga natychmiastowych dzia\u0142a\u0144 \u2014 ka\u017Cdy zdobyty punkt ma dla nas kluczowe znaczenie.\n\nInformujemy, \u017Ce bud\u017Cet transferowy przeznaczony na obecny sezon wynosi {TRANSFER_BUDGET} PLN. Prosimy o przemy\u015Blane zarz\u0105dzanie tymi \u015Brodkami w celu stabilizacji sytuacji kadrowej.\n\nLiczymy na owocn\u0105 wsp\xF3\u0142prac\u0119, profesjonalizm oraz pe\u0142ne zaanga\u017Cowanie w realizacji wsp\xF3lnego celu.\n\nZ powa\u017Caniem,\n{BOARD_SIGNATORY_NAME}\n{BOARD_SIGNATORY_ROLE}, {CLUB}"
  },
  // --- PERFORMANCE TRACKING (BOARD) ---
  {
    id: "board_winning_streak",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Imponuj\u0105ca seria zwyci\u0119stw!",
    body: "Jeste\u015Bmy pod ogromnym wra\u017Ceniem ostatnich wynik\xF3w. Seria wygranych mecz\xF3w napawa nas dum\u0105 i buduje \u015Bwietn\u0105 atmosfer\u0119 wok\xF3\u0142 klubu. Prosz\u0119 utrzyma\u0107 t\u0119 koncentracj\u0119. Premie dla sztabu s\u0105 ju\u017C przygotowane."
  },
  {
    id: "board_losing_streak",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Dyrektor Sportowy",
    subject: "G\u0142\u0119boki niepok\xF3j zarz\u0105du",
    body: "Ostatnia seria pora\u017Cek jest dla nas nieakceptowalna. Rozumiemy trudno\u015Bci, ale {CLUB} nie mo\u017Ce pozwala\u0107 sobie na takie przestoje. Oczekujemy natychmiastowej reakcji w najbli\u017Cszym spotkaniu. Nasz kredyt zaufania drastrocznie maleje."
  },
  {
    id: "board_excellent_position",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Aktualna pozycja w tabeli",
    body: "Z du\u017C\u0105 satysfakcj\u0105 spogl\u0105damy na tabel\u0119 ligow\u0105. Miejsce, kt\xF3re obecnie zajmujemy, przewy\u017Csza nasze przedsezonowe za\u0142o\u017Cenia. To dow\xF3d na Pana \u015Bwietn\u0105 prac\u0119 z zespo\u0142em. Tak trzyma\u0107!"
  },
  {
    id: "board_bad_position",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "W\u0142a\u015Bciciel Klubu",
    subject: "Niezadowolenie z miejsca w tabeli",
    body: "Obecna lokata {CLUB} w tabeli jest upokarzaj\u0105ca dla marki o takiej reputacji. Nie po to inwestujemy w kadr\u0119, by ogl\u0105da\u0107 plecy znacznie s\u0142abszych zespo\u0142\xF3w. Oczekujemy jak najszybszej poprawy wynik\xF3w."
  },
  {
    id: "board_recovery_progress",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Wyra\u017Any post\u0119p dru\u017Cyny",
    body: "Panie Trenerze,\n\nCho\u0107 obecna pozycja {CLUB} w tabeli nadal odbiega od naszych oczekiwa\u0144, Zarz\u0105d dostrzega wyra\u017An\u0105 popraw\u0119 wynik\xF3w od momentu obj\u0119cia przez Pana zespo\u0142u. Dru\u017Cyna regularnie zdobywa punkty i skutecznie odrabia strat\u0119 powsta\u0142\u0105 we wcze\u015Bniejszej cz\u0119\u015Bci sezonu.\n\nDoceniamy wykonan\u0105 prac\u0119 oraz kierunek zmian. Prosimy o utrzymanie obecnej koncentracji i konsekwencji \u2014 tabela potrzebuje czasu, aby w pe\u0142ni odzwierciedli\u0107 ten post\u0119p.\n\nZ wyrazami uznania,\nZarz\u0105d Klubu"
  },
  {
    id: "board_watching_patience",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Obserwujemy sytuacj\u0119 w tabeli",
    body: "Zarz\u0105d uwa\u017Cnie \u015Bledzi poczynania {CLUB} na boisku i w tabeli. Zdajemy sobie spraw\u0119, \u017Ce sezon jest jeszcze w toku, dlatego cierpliwie czekamy na prze\u0142om. Liczymy jednak, \u017Ce w nadchodz\u0105cych kolejkach dru\u017Cyna potwierdzi sw\xF3j potencja\u0142 i zacznie wspina\u0107 si\u0119 w klasyfikacji."
  },
  // --- WINTER BREAK FORM EMAILS (STYCZEŃ) ---
  {
    id: "board_winter_form_excellent",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Imponuj\u0105ca seria przed przerw\u0105 zimow\u0105!",
    body: "Panie Trenerze,\n\nKorzystamy z przerwy zimowej, aby przekaza\u0107 Panu s\u0142owa najwy\u017Cszego uznania. Forma, jak\u0105 {CLUB} zaprezentowa\u0142 w ostatnich kolejkach przed pauz\u0105, jest absolutnie imponuj\u0105ca. Seria wygranych mecz\xF3w buduje znakomit\u0105 atmosfer\u0119 w klubie i napawa nas optymizmem przed drug\u0105 rund\u0105 sezonu.\n\nZarz\u0105d jest przekonany, \u017Ce kontynuacja tej drogi zaowocuje znakomitym wynikiem ko\u0144cowym. Prosz\u0119 utrzyma\u0107 t\u0119 koncentracj\u0119 i motywacj\u0119 podczas obozu zimowego.\n\nZ wyrazami uznania,\nZarz\u0105d Klubu"
  },
  {
    id: "board_winter_form_good",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Dobra forma {CLUB} przed przerw\u0105 zimow\u0105",
    body: "Panie Trenerze,\n\nPrzed przerw\u0105 zimow\u0105 chcieliby\u015Bmy podsumowa\u0107 ostatnie tygodnie. Wyniki {CLUB} s\u0105 zadowalaj\u0105ce \u2014 dru\u017Cyna prezentuje dobr\u0105 form\u0119, a punkty zdobywane s\u0105 regularnie. To solidna podstawa do pracy w drugiej cz\u0119\u015Bci sezonu.\n\nLiczymy, \u017Ce ob\xF3z zimowy zostanie dobrze wykorzystany, a dru\u017Cyna wr\xF3ci na boisko jeszcze mocniejsza.\n\nPozdrawienia,\nZarz\u0105d Klubu"
  },
  {
    id: "board_winter_form_mixed",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Dyrektor Sportowy",
    subject: "Analiza formy przed przerw\u0105 zimow\u0105",
    body: "Panie Trenerze,\n\nPrzerwa zimowa to dobry moment na szczer\u0105 ocen\u0119 sytuacji. Ostatnie wyniki {CLUB} s\u0105 nier\xF3wne \u2014 kilka zwyci\u0119stw przeplatanych stratami punkt\xF3w, na kt\xF3re nie mo\u017Cemy sobie pozwoli\u0107. Wida\u0107 potencja\u0142, ale brakuje regularno\u015Bci.\n\nProsimy o przeanalizowanie taktyki i ustawieniu dru\u017Cyny podczas obozu zimowego. Oczekujemy zdecydowanie lepszej konsekwencji po powrocie z przerwy.\n\nZ powa\u017Caniem,\nDyrektor Sportowy"
  },
  {
    id: "board_winter_form_poor",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "W\u0142a\u015Bciciel Klubu",
    subject: "Pilna rozmowa po wynikach przed przerw\u0105",
    body: "Panie Trenerze,\n\nPrzerwa zimowa powinna zosta\u0107 przez Pana potraktowana jako ostatnie ostrze\u017Cenie. Wyniki {CLUB} w ostatnich kolejkach s\u0105 g\u0142\u0119boko niezadowalaj\u0105ce i budz\u0105 powa\u017Cne obawy o dalszy przebieg sezonu.\n\nOczekuj\u0119 gruntownej analizy przyczyn tak s\u0142abej dyspozycji i konkretnych zmian, kt\xF3re przynios\u0105 efekty ju\u017C w pierwszych meczach rundy wiosennej. Zarz\u0105d bacznie obserwuje sytuacj\u0119.\n\nZ ca\u0142\u0105 powag\u0105,\nW\u0142a\u015Bciciel Klubu"
  },
  // --- BOARD WEEKLY PRESSURE MAILS ---
  {
    id: "board_pressure_concern",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Dyrektor Sportowy",
    subject: "Obecna pozycja w tabeli",
    body: "Panie Trenerze,\n\nChcieliby\u015Bmy zwr\xF3ci\u0107 Pana uwag\u0119 na obecn\u0105 sytuacj\u0119 {CLUB} w tabeli ligowej. Pozycja, kt\xF3r\u0105 aktualnie zajmujemy, odbiega od naszych oczekiwa\u0144. Jeste\u015Bmy przekonani, \u017Ce dru\u017Cyna ma potencja\u0142, by wypracowa\u0107 lepszy wynik, jednak czas gra na niekorzy\u015B\u0107. Oczekujemy wyra\u017Anej poprawy w najbli\u017Cszych kolejkach.\n\nZarz\u0105d Klubu"
  },
  {
    id: "board_pressure_warning",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Wyniki poni\u017Cej oczekiwa\u0144",
    body: "Panie Trenerze,\n\nPrzesy\u0142amy niniejsze pismo jako formalne wyra\u017Cenie niezadowolenia zarz\u0105du z obecnych wynik\xF3w sportowych {CLUB}. Jeste\u015Bmy powa\u017Cnie zaniepokojeni tempem i jako\u015Bci\u0105 pracy. Pozycja w tabeli jest nie do zaakceptowania i wymaga natychmiastowej, zdecydowanej reakcji z Pana strony.\n\nNasz kredyt zaufania maleje. Zarz\u0105d Klubu"
  },
  {
    id: "board_pressure_critical",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "W\u0142a\u015Bciciel Klubu",
    subject: "PILNE: Wymagane dzia\u0142ania",
    body: "Panie Trenerze,\n\nSytuacja sportowa {CLUB} osi\u0105gn\u0119\u0142a punkt krytyczny. Obecna pozycja w tabeli jest katastrofalna i stanowi zagro\u017Cenie dla cel\xF3w ca\u0142ego klubu. Zarz\u0105d jest zdecydowany podj\u0105\u0107 wszelkie niezb\u0119dne kroki, by odwr\xF3ci\u0107 t\u0119 sytuacj\u0119.\n\nOczekujemy NATYCHMIASTOWEJ poprawy. Je\u015Bli wyniki nie zmieni\u0105 si\u0119 w ci\u0105gu najbli\u017Cszych kolejek, zarz\u0105d b\u0119dzie zmuszony rozwa\u017Cy\u0107 radykalne decyzje kadrowe.\n\nZ ca\u0142\u0105 powag\u0105,\nZarz\u0105d Klubu"
  },
  // --- MATCH EVENTS (FIXED LOGIC) ---
  {
    id: "board_high_win_praise",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "To byl mecz jaki chcieliby\u015Bmy widzie\u0107 w ka\u017Cdej kolejce!",
    body: " W imieniu ca\u0142ego Zarz\u0105du chcemy bardzo podzi\u0119kowa\u0107 za dostarczone emocje i pi\u0119kny styl tego spotkania. Zwyci\u0119stwo przy tak du\u017Cej liczbie zdobytych bramek to najlepsza reklama naszego klubu. Kibice s\u0105 zachwyceni ofensywnym stylem gry. Gratulujemy spektakularnego wyniku."
  },
  {
    id: "fans_bitter_loss_high_score",
    type: "FANS" /* FANS */,
    sender: "Stowarzyszenie Kibic\xF3w",
    role: "Gniazdowy",
    subject: "Serce boli po takim meczu...",
    body: "Strzelili\u015Bmy tyle goli, a i tak wracamy z niczym. Jak mo\u017Cna tak fatalnie gra\u0107 w obronie?! To bolesna lekcja, \u017Ce sam atak meczu nie wygrywa. Oczekujemy poprawy gry defensywnej, bo serca nam p\u0119kn\u0105 od takich wynik\xF3w."
  },
  {
    id: "fans_furious_loss",
    type: "FANS" /* FANS */,
    sender: "Stowarzyszenie Kibic\xF3w",
    role: "Gniazdowy",
    subject: "Wstyd i ha\u0144ba!",
    body: "To co pokazali\u015Bcie w dzisiejszym meczu to obraza dla tych barw. Brak walki, brak ambicji. My nie wymagamy samych wygranych, my wymagamy gryzienia trawy! Nast\u0119pnym razem nie b\u0119dzie tak mi\u0142o."
  },
  // --- LEAGUE NEWS (INJURIES) ---
  {
    id: "media_league_star_injured",
    type: "MEDIA" /* MEDIA */,
    sender: "Przegl\u0105d Ligowy",
    role: "Redakcja",
    subject: "Dramat gwiazdy ligi! {PLAYER} wypada z gry.",
    body: "Szokuj\u0105ce wie\u015Bci z obozu {OTHER_CLUB}. Ich kluczowy zawodnik, {PLAYER}, dozna\u0142 fatalnej kontuzji, kt\xF3ra wyklucza go z gry na co najmniej {DAYS} dni. To mo\u017Ce by\u0107 punkt zwrotny w walce o czo\u0142owe lokaty w tym sezonie."
  },
  // --- STAFF (FATIGUE & HEALTH) ---
  {
    id: "staff_fatigue_check",
    type: "STAFF" /* STAFF */,
    sender: "Sztab Medyczny",
    role: "Fizjoterapeuta",
    subject: "Raport kondycyjny: {PLAYER}",
    body: "Trenerze, rzuci\u0142em okiem na wyniki pomiar\xF3w {PLAYER} i wygl\u0105da na to, \u017Ce ch\u0142opak zaczyna odczuwa\u0107 zm\u0119czenie. Nic alarmuj\u0105cego na ten moment, ale warto mie\u0107 to z ty\u0142u g\u0142owy przy ustalaniu sk\u0142adu. Mo\u017Ce warto da\u0107 mu chwil\u0119 oddechu zanim zaczniemy go znowu regularnie wystawia\u0107?"
  },
  {
    id: "staff_fatigue_warning",
    type: "STAFF" /* STAFF */,
    sender: "Sztab Medyczny",
    role: "Fizjoterapeuta",
    subject: "Raport kondycyjny: {PLAYER}",
    body: "Trenerze, musz\u0119 by\u0107 z Panem szczery \u2014 kondycja {PLAYER} jest teraz naprawd\u0119 na granicy. Wystawianie go do gry w tym stanie to spore ryzyko. Organizm wyra\u017Anie sygnalizuje, \u017Ce potrzebuje przerwy. Prosz\u0119 powa\u017Cnie rozwa\u017Cy\u0107 danie mu wolnego przy najbli\u017Cszej okazji, zanim dopadnie go co\u015B powa\u017Cniejszego."
  },
  {
    id: "staff_severe_injury",
    type: "STAFF" /* STAFF */,
    sender: "Szef Sztabu Medycznego",
    role: "Lekarz Klubowy",
    subject: "Raport medyczny: {PLAYER}",
    body: "Niestety, badania potwierdzi\u0142y uraz u zawodnika {PLAYER}. Przewidywany rozbrat z futbollem to oko\u0142o {DAYS} dni. To spore wyzwanie dla sk\u0142adu, ale rozpoczynamy intensywn\u0105 rehabilitacj\u0119."
  },
  {
    id: "staff_emergency_gk_hired",
    type: "STAFF" /* STAFF */,
    sender: "Sztab Szkoleniowy",
    role: "Asystent Trenera",
    subject: "Awaryjny bramkarz: {PLAYER} do\u0142\u0105czy\u0142 do sk\u0142adu",
    body: "Trenerze, ze wzgl\u0119du na brak dost\u0119pnych bramkarzy tymczasowo do\u0142\u0105czyli\u015Bmy do sk\u0142adu juniora {PLAYER}. B\u0119dzie do dyspozycji do czasu powrotu podstawowego golkipera do pe\u0142nej sprawno\u015Bci."
  },
  {
    id: "staff_emergency_gk_fired",
    type: "STAFF" /* STAFF */,
    sender: "Sztab Szkoleniowy",
    role: "Asystent Trenera",
    subject: "Powr\xF3t bramkarza \u2014 {PLAYER} odchodzi",
    body: "Trenerze, podstawowy bramkarz wr\xF3ci\u0142 do pe\u0142nej sprawno\u015Bci. Awaryjny junior {PLAYER} opu\u015Bci\u0142 sk\u0142ad i wr\xF3ci\u0142 do akademii."
  },
  {
    id: "board_league_champion",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Gratulacje z okazji zdobycia tytu\u0142u Mistrza Polski",
    body: "Szanowny Panie Trenerze,\n\nw imieniu Zarz\u0105du Klubu sk\u0142adamy serdeczne gratulacje z okazji zdobycia tytu\u0142u Mistrza Polski.\n\nTo wyj\u0105tkowe osi\u0105gni\u0119cie jest potwierdzeniem Pana profesjonalizmu, wiedzy, konsekwencji oraz ogromnego zaanga\u017Cowania w rozw\xF3j dru\u017Cyny. Sukces ten jest r\xF3wnie\u017C efektem umiej\u0119tnego prowadzenia zespo\u0142u, podejmowania trafnych decyzji oraz budowania atmosfery sprzyjaj\u0105cej osi\u0105ganiu najwy\u017Cszych cel\xF3w.\n\nDzi\u0119kujemy za wykonan\u0105 prac\u0119, determinacj\u0119 i wk\u0142ad w ten historyczny sukces. Zdobycie Mistrzostwa Polski stanowi pow\xF3d do dumy dla ca\u0142ego Klubu, jego zawodnik\xF3w, pracownik\xF3w oraz kibic\xF3w.\n\n\u017Byczymy kolejnych sukces\xF3w, dalszego rozwoju oraz wielu niezapomnianych chwil zwi\u0105zanych z prowadzeniem naszej dru\u017Cyny.\n\nZ wyrazami uznania,\n\nZarz\u0105d Klubu"
  },
  {
    id: "board_cup_victory",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "PUCHAR JEST NASZ! \u{1F3C6} HISTORIA NAPISANA NA NOWO!",
    body: "Brakuje nam s\u0142\xF3w, by opisa\u0107 dum\u0119, jak\u0105 czujemy. Zdobycie Pucharu Polski to moment, kt\xF3ry na zawsze zostanie zapisany z\u0142otymi zg\u0142oskami w historii {CLUB}. Pokona\u0142 Pan {OPPONENT} w finale na Narodowym, udowadniaj\u0105c, \u017Ce nasza wizja rozwoju klubu by\u0142a s\u0142uszna. Miasto dzi\u015B nie za\u015Bnie, a trofeum trafia do naszej gabloty. Gratulujemy wielkiego sukcesu!"
  },
  {
    id: "board_cup_final_loss",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Dyrektor Sportowy",
    subject: "G\u0142owa do g\xF3ry - dzi\u0119kujemy za walk\u0119 w finale",
    body: "Panie Managerze, mimo goryczy pora\u017Cki w finale z {OPPONENT}, chcemy Panu podzi\u0119kowa\u0107 za niesamowit\u0105 przygod\u0119 w tegorocznym Pucharze Polski. Sam awans na PGE Narodowy by\u0142 dla nas wielkim wydarzeniem. Dzi\u015B zabrak\u0142o niewiele, by\u0107 mo\u017Ce odrobiny szcz\u0119\u015Bcia w kluczowych momentach. Prosz\u0119 przekaza\u0107 zawodnikom, \u017Ce zarz\u0105d docenia ich trud. Teraz musimy skupi\u0107 si\u0119 na lidze i wyci\u0105gn\u0105\u0107 wnioski z tego spotkania."
  },
  {
    id: "system_cup_news",
    type: "SYSTEM" /* SYSTEM */,
    sender: "Sekretariat PZPN",
    role: "Biuro Prasowe",
    subject: "Fina\u0142 Pucharu Polski rozstrzygni\u0119ty!",
    body: "Byli\u015Bmy \u015Bwiadkami pasjonuj\u0105cego fina\u0142u na Stadionie Narodowym w Warszawie. Po zaci\u0119tym spotkaniu, nowym triumfatorem Pucharu Polski zosta\u0142a dru\u017Cyna {WINNER}, kt\xF3ra pokona\u0142a {LOSER} wynikiem {SCORE}. Trofeum w\u0119druje do nowej siedziby, a kibice zwyci\u0119zc\xF3w rozpocz\u0119li \u015Bwi\u0119towanie sukcesu."
  },
  {
    id: "fans_welcome",
    type: "FANS" /* FANS */,
    sender: "Stowarzyszenie Kibic\xF3w",
    role: "Przewodnicz\u0105cy",
    subject: "Wsparcie z trybun. Liczymy na walk\u0119!",
    body: "Witamy w naszym ukochanym klubie. My, kibice {CLUB}, nie oczekujemy od Pana cud\xF3w, ale wymagamy jednego: pe\u0142nego zaanga\u017Cowania i walki o ka\u017Cdy centymetr murawy. Liczymy, \u017Ce potrafi Pan zmotywowa\u0107 tych ch\u0142opak\xF3w tak, aby po meczu mogli spojrze\u0107 nam w oczy. {TRANSFER_DEMAND} Jeste\u015Bmy z wami!"
  },
  {
    id: "board_bie_approved",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Biuro Finansowe",
    subject: "Zatwierdzenie wniosku: {PLAYER}",
    body: "Szanowny Panie, informujemy, \u017Ce Pana wniosek o rozwi\u0105zanie kontraktu z zawodnikiem {PLAYER} zosta\u0142 rozpatrzony pozytywnie. Finanse klubu pozwalaj\u0105 na wyp\u0142at\u0119 odszkodowania. Prosz\u0119 kontynuowa\u0107 proces w panelu kadrowym."
  },
  {
    id: "board_bie_veto",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "KATEGORYCZNE ODRZUCENIE WNIOSKU: {PLAYER}",
    body: "Jestem g\u0142\u0119boko rozczarowany Pana pr\xF3b\u0105 pozbycia si\u0119 tak kluczowego ogniwa jak {PLAYER}. Ten ruch narazi\u0142by nas na \u015Bmieszno\u015B\u0107 w mediach i zniszczy\u0142 bud\u017Cet na transfery. Kolejna taka pro\u015Bba zostanie uznana za dzia\u0142anie na szkod\u0119 klubu. Prosz\u0119 natychmiast porzuci\u0107 ten temat."
  },
  // --- SUPERCUP TEMPLATES ---
  {
    id: "board_supercup_win",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Superpuchar jest nasz!",
    body: "Szanowny Panie, gratulujemy zdobycia Superpucharu Polski po zwyci\u0119stwie nad {OPPONENT} ({SCORE}). To trofeum jest dowodem na Pana znakomity warsztat i \u015Bwietne przygotowanie zespo\u0142u do sezonu. Na konto klubu wp\u0142yn\u0119\u0142a premia w wysoko\u015Bci {BONUS} PLN. Oby tak dalej!"
  },
  {
    id: "board_supercup_loss_1",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Dyrektor Sportowy",
    subject: "Pora\u017Cka w Superpucharze ({SCORE})",
    body: "Niestety, przegrywamy walk\u0119 o trofeum z {OPPONENT}. Mimo wyniku, w Pana grze wida\u0107 by\u0142o pozytywne aspekty. Prosz\u0119 wyci\u0105gn\u0105\u0107 wnioski i skupi\u0107 si\u0119 na nadchodz\u0105cym starcie ligi."
  },
  {
    id: "board_supercup_loss_2",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Dyrektor Sportowy",
    subject: "Rozczarowanie po finale Superpucharu",
    body: "Zarz\u0105d nie jest zadowolony z wyniku meczu z {OPPONENT}. Oczekiwaliby\u015Bmy lepszej organizacji gry, szczeg\xF3lnie w formacji obronnej. Liczymy na szybk\u0105 popraw\u0119 przed pierwsz\u0105 kolejk\u0105."
  },
  {
    id: "board_supercup_loss_3",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Dyrektor Sportowy",
    subject: "S\u0142aby wyst\u0119p zespo\u0142u w Superpucharze",
    body: "Jeste\u015Bmy zaniepokojeni postaw\u0105 dru\u017Cyny w dzisiejszym starciu. {OPPONENT} obna\u017Cy\u0142 nasze braki. Oczekujemy od Pana szczeg\xF3\u0142owego raportu i planu naprawczego."
  },
  {
    id: "board_supercup_loss_high",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "W\u0142a\u015Bciciel Klubu",
    subject: "KATASTROFA w Superpucharze",
    body: "Wynik {SCORE} z {OPPONENT} to kompromitacja naszego klubu. Nie po to inwestujemy w kadr\u0119, by ogl\u0105da\u0107 taki antyfutbol. Pana kredyt zaufania zosta\u0142 drastycznie uszczuplony."
  },
  {
    id: "fans_supercup_furious",
    type: "FANS" /* FANS */,
    sender: "Kibice",
    role: "Stowarzyszenie",
    subject: "AMBICJA! WALKA!",
    body: "To co pokazali\u015Bcie dzisiaj to naplucie nam w twarz. Przegra\u0107 w taki spos\xF3b mecz o trofeum?! Je\u015Bli w lidze b\u0119dzie to samo, to nie mamy o czym rozmawia\u0107."
  },
  {
    id: "media_supercup_news",
    type: "MEDIA" /* MEDIA */,
    sender: "Prasa Sportowa",
    role: "Redaktor",
    subject: "Echa fina\u0142u Superpucharu",
    body: "{MEDIA_COMMENT}"
  },
  // <--- TUTAJ BYŁ BRAK PRZECINKA
  {
    id: "media_coach_fired",
    type: "MEDIA" /* MEDIA */,
    sender: "G\u0142os Ligowy",
    role: "Redakcja Sportowa",
    subject: "Trz\u0119sienie ziemi w {CLUB}! {COACH} zwolniony.",
    body: "Oficjalnie: Zarz\u0105d klubu {CLUB} podj\u0105\u0142 decyzj\u0119 o natychmiastowym rozwi\u0105zaniu kontraktu z trenerem {COACH}. Powodem dymisji jest rozczarowuj\u0105ca postawa zespo\u0142u i odleg\u0142a pozycja w tabeli ({RANK}. miejsce). Media spekuluj\u0105, \u017Ce czara goryczy przela\u0142a si\u0119 po ostatnich wynikach, kt\xF3re nie dawa\u0142y nadziei na realizacj\u0119 celu."
  },
  {
    id: "press_winless_streak",
    type: "MEDIA" /* MEDIA */,
    sender: "Gazeta Sportowa",
    role: "Redakcja Sportowa",
    subject: "Sytuacja w {CLUB} staje si\u0119 coraz bardziej niepokoj\u0105ca",
    body: "Sytuacja w {CLUB} staje si\u0119 coraz bardziej niepokoj\u0105ca. Zesp\xF3\u0142 pozostaje bez zwyci\u0119stwa od co najmniej pi\u0119ciu spotka\u0144, a rosn\u0105ca presja ze strony kibic\xF3w i ekspert\xF3w zaczyna odbija\u0107 si\u0119 na atmosferze wok\xF3\u0142 dru\u017Cyny.\n\nOstatnie tygodnie nie nale\u017C\u0105 do udanych dla zespo\u0142u, kt\xF3ry jeszcze niedawno uchodzi\u0142 za jednego z kandydat\xF3w do walki o czo\u0142owe lokaty w tabeli. Zamiast punkt\xF3w i stabilnej formy, dru\u017Cyna notuje kolejne rozczarowuj\u0105ce rezultaty, trac\u0105c cenne punkty zar\xF3wno w meczach domowych, jak i wyjazdowych.\n\nNiepok\xF3j budzi przede wszystkim styl gry zespo\u0142u. Coraz cz\u0119\u015Bciej pojawiaj\u0105 si\u0119 r\xF3wnie\u017C pytania dotycz\u0105ce decyzji sztabu szkoleniowego oraz przygotowania mentalnego zawodnik\xF3w.\n\nCho\u0107 przedstawiciele klubu publicznie apeluj\u0105 o spok\xF3j i podkre\u015Blaj\u0105, \u017Ce dru\u017Cyna przechodzi jedynie trudniejszy moment sezonu, cierpliwo\u015B\u0107 kibic\xF3w wydaje si\u0119 coraz mniejsza. Po ostatnim spotkaniu na trybunach pojawi\u0142y si\u0119 pierwsze oznaki frustracji, a w mediach spo\u0142eczno\u015Bciowych nie brakuje g\u0142os\xF3w domagaj\u0105cych si\u0119 zmian.\n\nNajbli\u017Csze mecze mog\u0105 okaza\u0107 si\u0119 kluczowe dla przysz\u0142o\u015Bci zespo\u0142u oraz pozycji sztabu szkoleniowego. Je\u015Bli seria bez zwyci\u0119stwa b\u0119dzie si\u0119 wyd\u0142u\u017Ca\u0107, presja wok\xF3\u0142 {CLUB} mo\u017Ce osi\u0105gn\u0105\u0107 poziom, kt\xF3ry trudno b\u0119dzie zignorowa\u0107."
  },
  {
    id: "board_coach_warning",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "OSTRZE\u017BENIE - Ultimatum Zarz\u0105du",
    body: "Szanowny Panie, nasza cierpliwo\u015B\u0107 dobieg\u0142a ko\u0144ca. Obecna lokata zespo\u0142u ({RANK}) drastycznie odbiega od Pana obietnic. Je\u015Bli w najbli\u017Cszym czasie nie zobaczymy wyra\u017Anej poprawy punktowej, b\u0119dziemy zmuszeni podj\u0105\u0107 radykalne kroki. Prosz\u0119 traktowa\u0107 t\u0119 wiadomo\u015B\u0107 jako oficjalne ostrze\u017Cenie."
  },
  {
    id: "board_season_ticket_report",
    type: "BOARD" /* BOARD */,
    sender: "Dzia\u0142 Marketingu",
    role: "Dyrektor ds. Sprzeda\u017Cy",
    subject: "Raport przedsprzeda\u017Cy karnet\xF3w. Sezon {SEASON}",
    body: "Szanowny Panie Managerze,\n\nZ przyjemno\u015Bci\u0105 przedstawiamy raport z przedsprzeda\u017Cy karnet\xF3w sezonowych dla {CLUB} przed startem nowych rozgrywek.\n\n\u{1F3DF}\uFE0F STADION: {STADIUM}\n\u{1F4CA} POJEMNO\u015A\u0106: {CAPACITY} miejsc\n\n--- WYNIKI PRZEDSPRZEDA\u017BY ---\n\n\u{1F3AB} Sprzedane karnety: {TICKETS_SOLD} szt.\n\u{1F4B0} Przych\xF3d netto: {REVENUE}\n\u{1F4B3} Cena karnetu: {TICKET_PRICE}\n\nZainteresowanie kibic\xF3w przed tym sezonem oceniamy jako {DEMAND_LEVEL}. Pieni\u0105dze z przedsprzeda\u017Cy zosta\u0142y doliczone do bud\u017Cetu klubu.\n\nZ powa\u017Caniem,\nDzia\u0142 Marketingu {CLUB}"
  },
  // --- EUROPEJSKIE GRATULACJE — FAZA GRUPOWA ---
  {
    id: "board_european_advance_group_cl",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Awans do Fazy Grupowej Ligi Mistrz\xF3w \u2014 Gratulacje!",
    body: "Panie Managerze,\n\nW imieniu ca\u0142ego Zarz\u0105du {CLUB} sk\u0142adamy serdeczne gratulacje z okazji awansu do fazy grupowej Ligi Mistrz\xF3w! To historyczny moment dla naszego klubu. Europejskie areny czekaj\u0105 \u2014 liczymy na godne zaprezentowanie barw {CLUB}. Zarz\u0105d w pe\u0142ni Pana wspiera.\n\nZ wyrazami uznania,\nZarz\u0105d {CLUB}"
  },
  {
    id: "board_european_advance_group_el",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Awans do Fazy Grupowej Ligi Europy. Gratulacje!",
    body: "Szanowny Panie Managerze,\n\nZ wielk\u0105 przyjemno\u015Bci\u0105 gratulujemy awansu do fazy grupowej Ligi Europy! To znakomity wynik, kt\xF3ry potwierdza rosn\u0105c\u0105 si\u0142\u0119 {CLUB} na arenie europejskiej. Ca\u0142y klub jest z Pana dumny \u2014 powodzenia w dalszych zmaganiach!\n\nZ powa\u017Caniem,\nZarz\u0105d {CLUB}"
  },
  {
    id: "board_european_advance_group_conf",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Awans do Fazy Grupowej Ligi Konferencji. Gratulacje!",
    body: "Panie Managerze,\n\nW imieniu Zarz\u0105du {CLUB} gratulujemy awansu do fazy grupowej Ligi Konferencji UEFA! To wa\u017Cny krok w europejskiej rywalizacji i pow\xF3d do dumy dla ca\u0142ego klubu. Liczymy na dalsze sukcesy!\n\nZ powa\u017Caniem,\nZarz\u0105d {CLUB}"
  },
  // --- EUROPEJSKIE GRATULACJE — 1/8 FINAŁU ---
  {
    id: "board_european_advance_r16_cl",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Awans do 1/8 Fina\u0142u Ligi Mistrz\xF3w!",
    body: "Panie Managerze,\n\nZarz\u0105d {CLUB} sk\u0142ada gratulacje z okazji awansu do 1/8 fina\u0142u Ligi Mistrz\xF3w! To wybitne osi\u0105gni\u0119cie, kt\xF3re stawia {CLUB} w gronie europejskiej elity. Jeste\u015Bmy niezwykle dumni i z niecierpliwo\u015Bci\u0105 oczekujemy kolejnych mecz\xF3w.\n\nZ wyrazami uznania,\nZarz\u0105d {CLUB}"
  },
  {
    id: "board_european_advance_r16_el",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Awans do 1/8 Fina\u0142u Ligi Europy!",
    body: "Szanowny Panie Managerze,\n\nGratulujemy awansu do 1/8 fina\u0142u Ligi Europy! Wyj\u015Bcie z grupy to doskona\u0142y wynik potwierdzaj\u0105cy jako\u015B\u0107 pracy ca\u0142ego sztabu. Zarz\u0105d {CLUB} jest pe\u0142en optymizmu i wierzy w dalsze post\u0119py dru\u017Cyny.\n\nZ powa\u017Caniem,\nZarz\u0105d {CLUB}"
  },
  {
    id: "board_european_advance_r16_conf",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Awans do 1/8 Fina\u0142u Ligi Konferencji!",
    body: "Panie Managerze,\n\nGratulujemy awansu do fazy pucharowej Ligi Konferencji! Wyj\u015Bcie z grupy to potwierdzenie ci\u0119\u017Ckiej pracy ca\u0142ego sztabu szkoleniowego. Zarz\u0105d {CLUB} jest zadowolony z dotychczasowych wynik\xF3w i liczy na kolejne sukcesy.\n\nZ powa\u017Caniem,\nZarz\u0105d {CLUB}"
  },
  // --- EUROPEJSKIE GRATULACJE — 1/4 FINAŁU ---
  {
    id: "board_european_advance_qf_cl",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Awans do \u0106wier\u0107fina\u0142u Ligi Mistrz\xF3w!",
    body: "Panie Managerze,\n\nSerdecznie gratulujemy niesamowitego osi\u0105gni\u0119cia \u2014 {CLUB} awansowa\u0142 do \u0107wier\u0107fina\u0142u Ligi Mistrz\xF3w! To historyczny wyczyn, kt\xF3ry przejdzie do kronik naszego klubu. Ca\u0142y zarz\u0105d, kibice i miasto s\u0105 z Pana niezwykle dumni!\n\nZ ogromnym uznaniem,\nZarz\u0105d {CLUB}"
  },
  {
    id: "board_european_advance_qf_el",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Awans do \u0106wier\u0107fina\u0142u Ligi Europy!",
    body: "Szanowny Panie Managerze,\n\nGratulujemy awansu do \u0107wier\u0107fina\u0142u Ligi Europy! To znakomity wynik, \u015Bwiadcz\u0105cy o doskona\u0142ej jako\u015Bci pracy ca\u0142ego zespo\u0142u. Zarz\u0105d {CLUB} w pe\u0142ni Pana popiera i oczekuje kolejnych emocji.\n\nZ powa\u017Caniem,\nZarz\u0105d {CLUB}"
  },
  {
    id: "board_european_advance_qf_conf",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Awans do \u0106wier\u0107fina\u0142u Ligi Konferencji!",
    body: "Panie Managerze,\n\nGratulujemy awansu do \u0107wier\u0107fina\u0142u Ligi Konferencji! To kolejny krok naprz\xF3d w europejskiej przygodzie {CLUB}. Zarz\u0105d jest zadowolony z postawy dru\u017Cyny i liczy na dalsze sukcesy.\n\nZ powa\u017Caniem,\nZarz\u0105d {CLUB}"
  },
  // --- EUROPEJSKIE GRATULACJE — 1/2 FINAŁU ---
  {
    id: "board_european_advance_sf_cl",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Awans do P\xF3\u0142fina\u0142u Ligi Mistrz\xF3w! Historyczne osi\u0105gni\u0119cie!",
    body: "Panie Managerze,\n\nJeste\u015Bmy w p\xF3\u0142finale Ligi Mistrz\xF3w! To historyczne osi\u0105gni\u0119cie {CLUB}, kt\xF3rego nikt nie zapomni. W imieniu zarz\u0105du, kibic\xF3w i ca\u0142ego miasta sk\u0142adamy Panu wyrazy najwy\u017Cszego uznania. Jeden krok od wielkiego fina\u0142u \u2014 wierzymy w Pana i dru\u017Cyn\u0119!\n\nZ ogromn\u0105 dum\u0105,\nZarz\u0105d {CLUB}"
  },
  {
    id: "board_european_advance_sf_el",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Awans do P\xF3\u0142fina\u0142u Ligi Europy!",
    body: "Szanowny Panie Managerze,\n\nZarz\u0105d {CLUB} z ogromn\u0105 dum\u0105 gratuluje awansu do p\xF3\u0142fina\u0142u Ligi Europy! To znakomity wynik, kt\xF3ry odzwierciedla ci\u0119\u017Ck\u0105 prac\u0119 ca\u0142ego sztabu szkoleniowego. Do wielkiego fina\u0142u brakuje jeszcze jednego kroku \u2014 liczymy na Pana!\n\nZ powa\u017Caniem,\nZarz\u0105d {CLUB}"
  },
  {
    id: "board_european_advance_sf_conf",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Awans do P\xF3\u0142fina\u0142u Ligi Konferencji!",
    body: "Panie Managerze,\n\nSerdecznie gratulujemy awansu do p\xF3\u0142fina\u0142u Ligi Konferencji! {CLUB} udowadnia, \u017Ce jest licz\u0105c\u0105 si\u0119 si\u0142\u0105 w europejskich rozgrywkach. Zarz\u0105d w pe\u0142ni wierzy, \u017Ce dru\u017Cyna powalczy o najwy\u017Csze laury.\n\nZ powa\u017Caniem,\nZarz\u0105d {CLUB}"
  },
  // --- EUROPEJSKIE GRATULACJE — FINAŁ ---
  {
    id: "board_european_advance_final_el",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "{CLUB} w Finale Ligi Europy! Gratulacje!",
    body: "Panie Managerze,\n\nGRATULACJE! {CLUB} awansowa\u0142 do Fina\u0142u Ligi Europy! To jeden z najwi\u0119kszych moment\xF3w w historii naszego klubu. Ca\u0142y kraj patrzy na Was z podziwem. Zarz\u0105d jest za Panem w 100% \u2014 id\u017Acie po ten puchar!\n\nZ wyrazami najwy\u017Cszego uznania,\nZarz\u0105d {CLUB}"
  },
  {
    id: "board_european_advance_final_conf",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "{CLUB} w Finale Ligi Konferencji! Gratulacje!",
    body: "Panie Managerze,\n\nGRATULACJE! {CLUB} awansowa\u0142 do Fina\u0142u Ligi Konferencji UEFA! To historyczny sukces, kt\xF3ry przejdzie do anna\u0142\xF3w naszego klubu. Zarz\u0105d jest z Pana niezwykle dumny. Powodzenia w wielkim finale!\n\nZ wyrazami najwy\u017Cszego uznania,\nZarz\u0105d {CLUB}"
  },
  // --- OFERTY TRANSFEROWE PRZYCHODZĄCE OD KLUBÓW AI ---
  {
    id: "incoming_offer_initial",
    type: "SYSTEM" /* SYSTEM */,
    sender: "Dzia\u0142 Transferowy",
    role: "Kierownik ds. Transfer\xF3w",
    subject: "Do rozpatrzenia: oferta za {PLAYER}",
    body: 'Panie Managerze,\n\nW zak\u0142adce "Oferty za moich" czeka na Pana nowa oferta transferowa od klubu {BUYER_CLUB} ({BUYER_LEAGUE}) za zawodnika {PLAYER}.\n\nSzczeg\xF3\u0142y oferty:\n- Proponowana kwota: {FEE} PLN\n- Termin przej\u015Bcia: {TIMING}\n\n{BOARD_PRESSURE_NOTE}Prosz\u0119 przej\u015B\u0107 do Aktywno\u015Bci Rynkowej i podj\u0105\u0107 decyzj\u0119 w ci\u0105gu 5 dni.\n\nPozdrawiam,\nDzia\u0142 Transferowy {CLUB}'
  },
  {
    id: "incoming_offer_reminder",
    type: "SYSTEM" /* SYSTEM */,
    sender: "Dzia\u0142 Transferowy",
    role: "Kierownik ds. Transfer\xF3w",
    subject: "PRZYPOMNIENIE: Oferta za {PLAYER} \u2014 zosta\u0142y 3 dni",
    body: "Panie Managerze,\n\nPrzypominamy, \u017Ce nadal oczekuje na odpowied\u017A oferta transferowa klubu {BUYER_CLUB} za zawodnika {PLAYER} na kwot\u0119 {FEE} PLN.\n\nJe\u015Bli nie udzieli Pan odpowiedzi w ci\u0105gu 3 dni, oferta automatycznie wyga\u015Bnie.\n\nPozdrawiam,\nDzia\u0142 Transferowy {CLUB}"
  },
  {
    id: "incoming_offer_expired",
    type: "SYSTEM" /* SYSTEM */,
    sender: "Dzia\u0142 Transferowy",
    role: "Kierownik ds. Transfer\xF3w",
    subject: "Oferta za {PLAYER} wygas\u0142a",
    body: "Panie Managerze,\n\nInformujemy, \u017Ce oferta transferowa klubu {BUYER_CLUB} za zawodnika {PLAYER} wygas\u0142a z powodu braku odpowiedzi z naszej strony.\n\nJe\u015Bli zmieni Pan decyzj\u0119, {BUYER_CLUB} mo\u017Ce z\u0142o\u017Cy\u0107 now\u0105 ofert\u0119 w przysz\u0142o\u015Bci.\n\nPozdrawiam,\nDzia\u0142 Transferowy {CLUB}"
  },
  {
    id: "incoming_offer_ai_accepted_counter",
    type: "SYSTEM" /* SYSTEM */,
    sender: "Dzia\u0142 Transferowy",
    role: "Kierownik ds. Transfer\xF3w",
    subject: "{BUYER_CLUB} zaakceptowa\u0142 nasz\u0105 cen\u0119 za {PLAYER}",
    body: "Panie Managerze,\n\nKlub {BUYER_CLUB} zaakceptowa\u0142 nasz\u0105 kwot\u0119 {FEE} PLN za zawodnika {PLAYER}.\n\nRozpocz\u0119li\u015Bmy negocjacje z zawodnikiem. O wynikach poinformujemy Pana w ci\u0105gu kilku dni.\n\nPozdrawiam,\nDzia\u0142 Transferowy {CLUB}"
  },
  {
    id: "incoming_offer_ai_countered",
    type: "SYSTEM" /* SYSTEM */,
    sender: "Dzia\u0142 Transferowy",
    role: "Kierownik ds. Transfer\xF3w",
    subject: "{BUYER_CLUB} z\u0142o\u017Cy\u0142 kontrofert\u0119 za {PLAYER}",
    body: "Panie Managerze,\n\nKlub {BUYER_CLUB} nie zaakceptowa\u0142 naszej ceny i zaproponowa\u0142 kwot\u0119 {AI_COUNTER_FEE} PLN za zawodnika {PLAYER}.\n\nCzeka Pan na Pana decyzj\u0119 (runda {ROUND}/3).\n\nPozdrawiam,\nDzia\u0142 Transferowy {CLUB}"
  },
  {
    id: "incoming_offer_ai_rejected_counter",
    type: "SYSTEM" /* SYSTEM */,
    sender: "Dzia\u0142 Transferowy",
    role: "Kierownik ds. Transfer\xF3w",
    subject: "{BUYER_CLUB} odrzuci\u0142 negocjacje za {PLAYER}",
    body: "Panie Managerze,\n\nKlub {BUYER_CLUB} ostatecznie zrezygnowa\u0142 z transferu zawodnika {PLAYER}. Negocjacje zosta\u0142y zako\u0144czone.\n\nPozdrawiam,\nDzia\u0142 Transferowy {CLUB}"
  },
  {
    id: "incoming_offer_player_accepted_confirm",
    type: "SYSTEM" /* SYSTEM */,
    sender: "Dzia\u0142 Transferowy",
    role: "Kierownik ds. Transfer\xF3w",
    subject: "{PLAYER} wyrazi\u0142 zgod\u0119 \u2014 zatwierd\u017A transfer",
    body: "Panie Managerze,\n\nZawodnik {PLAYER} zaakceptowa\u0142 warunki kontraktu zaproponowane przez {BUYER_CLUB}.\n\nKwota transferu: {FEE} PLN\nTermin przej\u015Bcia: {TIMING}\n\nCzekamy na Pana ostateczn\u0105 decyzj\u0119 \u2014 czy zatwierdza Pan ten transfer?\n\nPozdrawiam,\nDzia\u0142 Transferowy {CLUB}"
  },
  {
    id: "incoming_offer_player_refused",
    type: "SYSTEM" /* SYSTEM */,
    sender: "Dzia\u0142 Transferowy",
    role: "Kierownik ds. Transfer\xF3w",
    subject: "{PLAYER} odrzuci\u0142 ofert\u0119 {BUYER_CLUB}",
    body: "Panie Managerze,\n\nInformujemy, \u017Ce zawodnik {PLAYER} odm\xF3wi\u0142 podj\u0119cia rozm\xF3w z klubem {BUYER_CLUB}. Negocjacje zosta\u0142y zako\u0144czone.\n\nZawodnik pozostaje w {CLUB}.\n\nPozdrawiam,\nDzia\u0142 Transferowy {CLUB}"
  },
  // ─── OBÓZ ZIMOWY ─────────────────────────────────────────────────────────────
  {
    id: "winter_camp_invite",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Propozycja obozu zimowego dla {CLUB}",
    body: "Panie Trenerze,\n\nZarz\u0105d {CLUB} rekomenduje zorganizowanie zimowego obozu przygotowawczego w ramach przerwy zimowej. Ob\xF3z potrwa od 2 do 15 stycznia.\n\nPrzygotowali\u015Bmy propozycje destynacji wraz z szacunkowymi kosztami (wynajem boisk, zakwaterowanie, personel medyczny i logistyka). Prosimy o wyb\xF3r lokalizacji do ko\u0144ca tygodnia.\n\nJe\u015Bli ob\xF3z nie zostanie zorganizowany, dru\u017Cyna samodzielnie przygotuje si\u0119 do drugiej cz\u0119\u015Bci sezonu \u2014 jednak zarz\u0105d zaleca skorzystanie z tej mo\u017Cliwo\u015Bci.\n\nZ powa\u017Caniem,\nZarz\u0105d {CLUB}"
  },
  {
    id: "winter_camp_assistant_fitness",
    type: "STAFF" /* STAFF */,
    sender: "Asystent Trenera",
    role: "Pierwszy Asystent",
    subject: "Sugestia programu obozu \u2014 kondycja priorytetem",
    body: "Panie Trenerze,\n\nprzeanalizowa\u0142em parametry dru\u017Cyny pod k\u0105tem programu obozu zimowego.\n\nNasza kondycja fizyczna \u2014 stamina i si\u0142a \u2014 wymaga zdecydowanej poprawy przed wiosn\u0105. Proponuj\u0119 skoncentrowanie treningu na aspekcie kondycyjnym. Intensywno\u015B\u0107 powinna by\u0107 umiarkowana lub wysoka, jednak prosz\u0119 pami\u0119ta\u0107 o zwi\u0119kszonym ryzyku kontuzji przy zbyt intensywnym obci\u0105\u017Ceniu.\n\nOstateczna decyzja nale\u017Cy do Pana.\n\nZ powa\u017Caniem,\nAsystent Trenera"
  },
  {
    id: "winter_camp_assistant_tactical",
    type: "STAFF" /* STAFF */,
    sender: "Asystent Trenera",
    role: "Pierwszy Asystent",
    subject: "Sugestia programu obozu \u2014 praca taktyczna",
    body: "Panie Trenerze,\n\nprzeanalizowa\u0142em wyniki i parametry dru\u017Cyny.\n\nZwa\u017Cywszy na nasze rezultaty w rundzie jesiennej, uwa\u017Cam, \u017Ce najwi\u0119ksze rezerwy tkwi\u0105 w organizacji taktycznej \u2014 mentality i ustawieniu zawodnik\xF3w. Ob\xF3z zimowy to idealna okazja na intensywn\u0105 prac\u0119 nad tymi elementami bez presji wynikowej.\n\nProponuj\u0119 program taktyczny z umiarkowan\u0105 intensywno\u015Bci\u0105. Ostateczna decyzja nale\u017Cy do Pana.\n\nZ powa\u017Caniem,\nAsystent Trenera"
  },
  {
    id: "winter_camp_report_success",
    type: "STAFF" /* STAFF */,
    sender: "Asystent Trenera",
    role: "Pierwszy Asystent",
    subject: "Raport z obozu zimowego \u2014 {CAMP_LOCATION}",
    body: "Panie Trenerze,\n\nob\xF3z zimowy {CLUB} w {CAMP_LOCATION} dobieg\u0142 ko\u0144ca.\n\nPodsumowanie:\n\u2022 Program: {CAMP_PROGRAM}\n\u2022 Intensywno\u015B\u0107: {CAMP_INTENSITY}\n\u2022 Zawodnicy z popraw\u0105 atrybut\xF3w: {IMPROVED_COUNT}\n\u2022 Kontuzje podczas obozu: {INJURY_COUNT}\n\u2022 Zmiana morale dru\u017Cyny: {MORALE_CHANGE}\n\nDru\u017Cyna wr\xF3ci\u0142a zmotywowana i lepiej przygotowana fizycznie. Widz\u0119 wyra\u017An\u0105 popraw\u0119 w tych obszarach, na kt\xF3rych si\u0119 skupili\u015Bmy.\n\nZ powa\u017Caniem,\nAsystent Trenera"
  },
  {
    id: "winter_camp_report_declined",
    type: "STAFF" /* STAFF */,
    sender: "Asystent Trenera",
    role: "Pierwszy Asystent",
    subject: "Brak obozu zimowego \u2014 informacja o konsekwencjach",
    body: "Panie Trenerze,\n\nzgodnie z Pana decyzj\u0105 dru\u017Cyna {CLUB} nie wzi\u0119\u0142a udzia\u0142u w obozie zimowym.\n\nMusz\u0119 uczciwie poinformowa\u0107, \u017Ce zawodnicy odczuwaj\u0105 ten brak. Morale dru\u017Cyny obni\u017Cy\u0142o si\u0119 \u2014 pi\u0142karze widzieli, jak inne zespo\u0142y wyje\u017Cd\u017Caj\u0105 na przygotowania, a my pozostali\u015Bmy bez zorganizowanego programu treningowego.\n\nNiekt\xF3rzy zawodnicy samodzielnie ograniczyli treningi w przerwie, co mo\u017Ce mie\u0107 prze\u0142o\u017Cenie na ich gotowo\u015B\u0107 w drugiej cz\u0119\u015Bci sezonu.\n\nZ powa\u017Caniem,\nAsystent Trenera"
  },
  // ─── OBÓZ LETNI ──────────────────────────────────────────────────────────────
  {
    id: "summer_camp_invite",
    type: "BOARD" /* BOARD */,
    sender: "Zarz\u0105d Klubu",
    role: "Prezes Zarz\u0105du",
    subject: "Propozycja letniego obozu przygotowawczego \u2014 {CLUB}",
    body: "Panie Trenerze,\n\nZarz\u0105d {CLUB} rekomenduje zorganizowanie letniego obozu przygotowawczego przed startem nowego sezonu. Ob\xF3z planowany jest na 18\u201328 czerwca.\n\nBior\u0105c pod uwag\u0119 wysokie temperatury w tym okresie, przygotowali\u015Bmy propozycje destynacji w krajach o umiarkowanym klimacie: Polska, Czechy, S\u0142owacja, Austria oraz Szwajcaria. Ka\u017Cda lokalizacja oferuje odpowiedni\u0105 infrastruktur\u0119 treningow\u0105 przy komfortowych warunkach pogodowych.\n\nProsimy o wyb\xF3r lokalizacji do 19 maja.\n\nJe\u015Bli ob\xF3z nie zostanie zorganizowany, dru\u017Cyna samodzielnie przygotuje si\u0119 do nowego sezonu \u2014 zarz\u0105d jednak zaleca skorzystanie z tej mo\u017Cliwo\u015Bci.\n\nZ powa\u017Caniem,\nZarz\u0105d {CLUB}"
  },
  {
    id: "summer_camp_assistant_fitness",
    type: "STAFF" /* STAFF */,
    sender: "Asystent Trenera",
    role: "Pierwszy Asystent",
    subject: "Sugestia programu obozu letniego \u2014 kondycja priorytetem",
    body: "Panie Trenerze,\n\nprzeanalizowa\u0142em parametry dru\u017Cyny pod k\u0105tem programu letniego obozu przygotowawczego.\n\nPrzed startem nowego sezonu kluczowe jest zbudowanie solidnej bazy kondycyjnej. Stamina i si\u0142a zawodnik\xF3w wymagaj\u0105 pracy, aby podo\u0142a\u0107 wymagaj\u0105cemu harmonogramowi. Proponuj\u0119 skoncentrowanie obozu na aspekcie kondycyjnym z umiarkowan\u0105 intensywno\u015Bci\u0105.\n\nProsz\u0119 pami\u0119ta\u0107, \u017Ce zbyt wysoka intensywno\u015B\u0107 na pocz\u0105tku przygotowa\u0144 zwi\u0119ksza ryzyko kontuzji. Ostateczna decyzja nale\u017Cy do Pana.\n\nZ powa\u017Caniem,\nAsystent Trenera"
  },
  {
    id: "summer_camp_assistant_tactical",
    type: "STAFF" /* STAFF */,
    sender: "Asystent Trenera",
    role: "Pierwszy Asystent",
    subject: "Sugestia programu obozu letniego \u2014 praca taktyczna",
    body: "Panie Trenerze,\n\nprzeanalizowa\u0142em wyniki minionego sezonu i aktualne parametry dru\u017Cyny.\n\nUwa\u017Cam, \u017Ce letni ob\xF3z przygotowawczy to idealna okazja do intensywnej pracy taktycznej bez presji wynikowej. Wyniki dru\u017Cyny wskazuj\u0105 na rezerwy w organizacji gry i mentality zawodnik\xF3w \u2014 w\u0142a\u015Bnie te elementy decyduj\u0105 o skuteczno\u015Bci w nowym sezonie.\n\nProponuj\u0119 program taktyczny z umiarkowan\u0105 intensywno\u015Bci\u0105. Ostateczna decyzja nale\u017Cy do Pana.\n\nZ powa\u017Caniem,\nAsystent Trenera"
  },
  {
    id: "summer_camp_report_success",
    type: "STAFF" /* STAFF */,
    sender: "Asystent Trenera",
    role: "Pierwszy Asystent",
    subject: "Raport z obozu letniego \u2014 {CAMP_LOCATION}",
    body: "Panie Trenerze,\n\nletni ob\xF3z przygotowawczy {CLUB} w {CAMP_LOCATION} dobieg\u0142 ko\u0144ca.\n\nPodsumowanie:\n\u2022 Program: {CAMP_PROGRAM}\n\u2022 Intensywno\u015B\u0107: {CAMP_INTENSITY}\n\u2022 Zawodnicy z popraw\u0105 atrybut\xF3w: {IMPROVED_COUNT}\n\u2022 Kontuzje podczas obozu: {INJURY_COUNT}\n\u2022 Zmiana morale dru\u017Cyny: {MORALE_CHANGE}\n\nDru\u017Cyna wr\xF3ci\u0142a gotowa na nowy sezon \u2014 wida\u0107 wyra\u017An\u0105 popraw\u0119 w obszarach, na kt\xF3rych skupi\u0142o si\u0119 nasze szkolenie. Zawodnicy s\u0105 zmotywowani i dobrze przygotowani fizycznie do startu rozgrywek.\n\nZ powa\u017Caniem,\nAsystent Trenera"
  },
  {
    id: "summer_camp_report_declined",
    type: "STAFF" /* STAFF */,
    sender: "Asystent Trenera",
    role: "Pierwszy Asystent",
    subject: "Brak obozu letniego \u2014 informacja o konsekwencjach",
    body: "Panie Trenerze,\n\nzgodnie z Pana decyzj\u0105 dru\u017Cyna {CLUB} nie wzi\u0119\u0142a udzia\u0142u w letnim obozie przygotowawczym.\n\nMusz\u0119 uczciwie poinformowa\u0107, \u017Ce zawodnicy odczuwaj\u0105 ten brak. Wiele dru\u017Cyn z naszej ligi wyjecha\u0142o na zorganizowane przygotowania, co mo\u017Ce da\u0107 im przewag\u0119 na starcie sezonu. Morale dru\u017Cyny obni\u017Cy\u0142o si\u0119, a indywidualne przygotowanie poszczeg\xF3lnych zawodnik\xF3w w przerwie letniej jest bardzo zr\xF3\u017Cnicowane.\n\nZ powa\u017Caniem,\nAsystent Trenera"
  },
  {
    id: "staff_retirement",
    type: "STAFF" /* STAFF */,
    sender: "Dyrektor Sportowy",
    role: "Dyrektor Sportowy",
    subject: "Odej\u015Bcie na emerytur\u0119 \u2013 zmiany w sztabie szkoleniowym",
    body: "Szanowny Panie Managerze,\n\nInformuj\u0119, \u017Ce nast\u0119puj\u0105cy cz\u0142onkowie naszego sztabu szkoleniowego postanowili zako\u0144czy\u0107 karier\u0119 zawodow\u0105 i przej\u015B\u0107 na zas\u0142u\u017Con\u0105 emerytur\u0119:\n\n{STAFF_LIST}\n\nSerdecznie dzi\u0119kujemy im za wk\u0142ad w rozw\xF3j klubu i \u017Cyczymy wszystkiego najlepszego.\n\nZ powa\u017Caniem,\nDyrektor Sportowy"
  }
];

// services/ManagerNegotiationInfluenceService.ts
var clamp = (value, min, max) => Math.min(max, Math.max(min, value));
var getExperience = (managerProfile) => {
  if (!managerProfile || !Number.isFinite(managerProfile.experience)) return 50;
  return clamp(managerProfile.experience, 1, 99);
};
var ManagerNegotiationInfluenceService = {
  calculate(managerProfile) {
    const experience = getExperience(managerProfile);
    const normalized = clamp((experience - 50) / 49, -1, 1);
    return {
      experience,
      normalized,
      scoreAdjustment: Math.round(normalized * 8),
      chanceAdjustment: normalized * 0.06,
      expectationMultiplier: clamp(1 - normalized * 0.045, 0.955, 1.045),
      realisticCeilingBonus: normalized * 3.5
    };
  }
};

// services/FinanceService.ts
var MATCHDAY_ADDITIONAL_REVENUE_PARAMS = {
  //                             tier: [  0,    1,    2,    3,    4 ]
  cateringPerFan: [0, 4.5, 2, 0.8, 0.5],
  merchandisingPerFan: [0, 2, 0.8, 0.22, 0.15],
  programsPerFan: [0, 0.6, 0.3, 0.15, 0.07],
  parkingPerFan: [0, 0.7, 0.4, 0.16, 0.1]
};
var VIP_BOX_REVENUE_PARAMS = {
  base: 15e4,
  repScale: 2e5,
  // * (rep / 10)
  capacityScale: 6e4,
  // * (capacity / 40 000)
  minRevenue: 24e4,
  maxRevenue: 5e5
};
var MATCHDAY_COST_PARAMS = {
  home: {
    //                       tier: [  0,       1,       2,      3,     4  ]
    baseCost: [0, 5e4, 15e3, 5e3, 1500],
    perFanCost: [0, 9, 4.5, 2, 0.8],
    // PLN za kibica
    repScale: [0, 12e3, 4e3, 1200, 400],
    // PLN * reputacja
    minFloor: [0, 2e5, 4e4, 1e4, 3500],
    // minim. koszt meczu u siebie
    maxCap: [0, 7e5, 22e4, 7e4, 2e4]
    // maks. koszt meczu u siebie
  },
  away: {
    baseCost: [0, 35e3, 12e3, 5e3, 1500],
    // koszty bazy wyjazdu
    repScale: [0, 3500, 1500, 600, 150],
    // wkład reputacji w koszty
    maxCap: [0, 14e4, 55e3, 2e4, 7e3]
    // maks. koszt wyjazdu
  }
};
var EUR_TO_PLN_NBP_2026 = 4.271;
var eurMillionsToPln = (amount) => Math.round(amount * EUR_TO_PLN_NBP_2026 * 1e6);
var EUROPEAN_TIER_BASE_REVENUE_EUR_M = {
  1: 190,
  2: 90,
  3: 50,
  4: 8
};
var EUROPEAN_COUNTRY_FINANCE_FACTOR = {
  ENG: 2.4,
  ESP: 1.7,
  GER: 1.8,
  ITA: 1.45,
  FRA: 1.15,
  POR: 1,
  NED: 0.95,
  BEL: 0.75,
  SCO: 0.7,
  TUR: 0.8,
  AUT: 0.55,
  SUI: 0.6,
  CZE: 0.45,
  DEN: 0.45,
  GRE: 0.45,
  NOR: 0.35,
  CRO: 0.3,
  SRB: 0.3,
  UKR: 0.3,
  RUS: 0.45,
  SWE: 0.3,
  ISR: 0.28,
  CYP: 0.25,
  HUN: 0.2,
  AZE: 0.2,
  KAZ: 0.2,
  SVK: 0.18,
  SVN: 0.18,
  BUL: 0.18,
  BIH: 0.14,
  MNE: 0.12,
  MKD: 0.1,
  ALB: 0.1,
  ARM: 0.09,
  GEO: 0.09,
  BLR: 0.09,
  KOS: 0.09,
  MDA: 0.08,
  FIN: 0.14,
  LTU: 0.08,
  LAT: 0.08,
  EST: 0.08,
  IRL: 0.1,
  NIR: 0.08,
  WAL: 0.06,
  ISL: 0.08,
  FRO: 0.06,
  AND: 0.04,
  GIB: 0.05,
  LIE: 0.04,
  SMR: 0.04,
  MLT: 0.06,
  LUX: 0.07
};
var EUROPEAN_CLUB_REVENUE_OVERRIDE_PLN = {
  "Real Madryt": eurMillionsToPln(1161),
  "FC Barcelona": eurMillionsToPln(893),
  "Bayern Monachium": eurMillionsToPln(860.6),
  "Paris Saint-Germain": eurMillionsToPln(837),
  "Liverpool FC": eurMillionsToPln(836.1),
  "Manchester City": eurMillionsToPln(829.3),
  "Arsenal Londyn": eurMillionsToPln(821.7),
  "Manchester United": eurMillionsToPln(793.1),
  "Tottenham Hotspur": eurMillionsToPln(672.6),
  "Chelsea Londyn": eurMillionsToPln(584.1),
  "Borussia Dortmund": eurMillionsToPln(531.3),
  "Inter Mediolan": eurMillionsToPln(537.5),
  "Atl\xE9tico Madryt": eurMillionsToPln(454.5),
  "Milan AC": eurMillionsToPln(410.4),
  "Juventus Turyn": eurMillionsToPln(401.7),
  "Newcastle United": eurMillionsToPln(398.4),
  "Benfica Lizbona": eurMillionsToPln(283.4)
};
var EUROPEAN_COMMERCIAL_LEAGUES = /* @__PURE__ */ new Set(["L_CL", "L_EL", "L_CONF"]);
var isEuropeanCommercialClub = (club) => EUROPEAN_COMMERCIAL_LEAGUES.has(club.leagueId);
var clamp2 = (value, min, max) => Math.max(min, Math.min(max, value));
var POLISH_MARKET_CAP_BY_TIER = {
  1: 21e6,
  2: 65e5,
  3: 18e5,
  4: 35e4,
  5: 175e3
};
var getPolishAgeMarketCap = (player, tier) => {
  const tierScale = {
    1: 1,
    2: 0.34,
    3: 0.11,
    4: 0.035,
    5: 0.018
  }[tier] ?? 0.018;
  let ekstraklasaCap = 0;
  switch (player.position) {
    case "GK" /* GK */:
      if (player.age <= 23) ekstraklasaCap = 8e6;
      else if (player.age <= 29) ekstraklasaCap = 11e6;
      else if (player.age <= 32) ekstraklasaCap = 65e5;
      else if (player.age <= 34) ekstraklasaCap = 38e5;
      else ekstraklasaCap = 22e5;
      break;
    case "DEF" /* DEF */:
      if (player.age <= 21) ekstraklasaCap = 1e7;
      else if (player.age <= 24) ekstraklasaCap = 13e6;
      else if (player.age <= 29) ekstraklasaCap = 11e6;
      else if (player.age <= 32) ekstraklasaCap = 65e5;
      else if (player.age <= 34) ekstraklasaCap = 38e5;
      else ekstraklasaCap = 22e5;
      break;
    default:
      if (player.age <= 21) ekstraklasaCap = 16e6;
      else if (player.age <= 24) ekstraklasaCap = 18e6;
      else if (player.age <= 29) ekstraklasaCap = 14e6;
      else if (player.age <= 32) ekstraklasaCap = 55e5;
      else if (player.age <= 34) ekstraklasaCap = 28e5;
      else ekstraklasaCap = 17e5;
      break;
  }
  return ekstraklasaCap * tierScale;
};
var getRecentAverageRating = (player, sampleSize = 10) => {
  const history = player.stats?.ratingHistory?.slice(-sampleSize) ?? [];
  if (history.length === 0) return null;
  return history.reduce((sum, rating) => sum + rating, 0) / history.length;
};
var getCareerMatches = (player) => {
  const currentMatches = player.stats?.matchesPlayed || 0;
  const historicalMatches = (player.history || []).reduce(
    (sum, entry) => sum + (entry.statsSnapshot?.matchesPlayed || 0),
    0
  );
  return currentMatches + historicalMatches;
};
var getPolishBaseMarketValue = (ovr) => {
  if (ovr >= 82) return 125e5 + (ovr - 82) * 14e5;
  if (ovr >= 78) return 88e5 + (ovr - 78) * 9e5;
  if (ovr >= 74) return 58e5 + (ovr - 74) * 75e4;
  if (ovr >= 70) return 34e5 + (ovr - 70) * 6e5;
  if (ovr >= 65) return 17e5 + (ovr - 65) * 34e4;
  if (ovr >= 60) return 65e4 + (ovr - 60) * 21e4;
  return 1e5 + Math.max(0, ovr - 40) * 27500;
};
var getPolishAgeFactor = (player) => {
  switch (player.position) {
    case "DEF" /* DEF */:
      if (player.age <= 20) return 0.94;
      if (player.age <= 23) return 1;
      if (player.age <= 27) return 1.08;
      if (player.age <= 30) return 1.02;
      if (player.age === 31) return 0.92;
      if (player.age === 32) return 0.8;
      if (player.age === 33) return 0.68;
      if (player.age === 34) return 0.56;
      if (player.age === 35) return 0.46;
      if (player.age === 36) return 0.36;
      return 0.28;
    case "GK" /* GK */:
      if (player.age <= 21) return 0.96;
      if (player.age <= 25) return 1;
      if (player.age <= 30) return 1.06;
      if (player.age <= 32) return 1.02;
      if (player.age === 33) return 0.94;
      if (player.age === 34) return 0.84;
      if (player.age === 35) return 0.74;
      if (player.age === 36) return 0.62;
      if (player.age === 37) return 0.5;
      return 0.4;
    default:
      if (player.age <= 19) return 1.16;
      if (player.age <= 21) return 1.12;
      if (player.age <= 24) return 1.08;
      if (player.age <= 28) return 1;
      if (player.age === 29) return 0.94;
      if (player.age === 30) return 0.86;
      if (player.age === 31) return 0.74;
      if (player.age === 32) return 0.6;
      if (player.age === 33) return 0.48;
      if (player.age === 34) return 0.36;
      if (player.age === 35) return 0.27;
      if (player.age === 36) return 0.2;
      return 0.15;
  }
};
var getPolishExperienceFactor = (player) => {
  const careerMatches = getCareerMatches(player);
  switch (player.position) {
    case "DEF" /* DEF */:
      return 0.94 + clamp2(careerMatches / 260, 0, 1) * 0.2;
    case "GK" /* GK */:
      return 0.92 + clamp2(careerMatches / 240, 0, 1) * 0.24;
    default:
      return 0.94 + clamp2(careerMatches / 260, 0, 1) * 0.08;
  }
};
var getPolishVeteranUsageFactor = (player) => {
  const minutesPlayed = Math.max(0, player.stats?.minutesPlayed || 0);
  if (player.age <= 32) return 1;
  switch (player.position) {
    case "GK" /* GK */:
    case "DEF" /* DEF */:
      if (minutesPlayed >= 1800) return 1;
      if (minutesPlayed >= 900) return 0.9;
      if (minutesPlayed >= 450) return 0.78;
      return 0.64;
    default:
      if (minutesPlayed >= 1800) return 1;
      if (minutesPlayed >= 900) return 0.86;
      if (minutesPlayed >= 450) return 0.72;
      return 0.55;
  }
};
var getPolishPerformanceFactor = (player) => {
  const minutesPlayed = Math.max(0, player.stats?.minutesPlayed || 0);
  const matchesPlayed = Math.max(0, player.stats?.matchesPlayed || 0);
  const goals = Math.max(0, player.stats?.goals || 0);
  const assists = Math.max(0, player.stats?.assists || 0);
  const averageRating = getRecentAverageRating(player);
  const fullMatches = Math.max(1, minutesPlayed / 90);
  const sampleFactor = clamp2(minutesPlayed / 900, 0, 1);
  const ratingDelta = averageRating === null ? 0 : averageRating - 6.7;
  switch (player.position) {
    case "FWD" /* FWD */: {
      const goalsPer90 = goals / fullMatches;
      const assistsPer90 = assists / fullMatches;
      const goalsBoost = clamp2(goals / 20, 0, 1) * 0.2 + clamp2(goalsPer90 / 0.75, 0, 1) * 0.18;
      const assistsBoost = clamp2(assists / 10, 0, 1) * 0.07 + clamp2(assistsPer90 / 0.35, 0, 1) * 0.05;
      const ratingBoost = clamp2(ratingDelta * 0.1, -0.08, 0.1);
      return 1 + clamp2(sampleFactor * (goalsBoost + assistsBoost + ratingBoost), -0.1, 0.52);
    }
    case "MID" /* MID */: {
      const goalsPer90 = goals / fullMatches;
      const assistsPer90 = assists / fullMatches;
      const assistsBoost = clamp2(assists / 14, 0, 1) * 0.18 + clamp2(assistsPer90 / 0.45, 0, 1) * 0.15;
      const goalsBoost = clamp2(goals / 12, 0, 1) * 0.08 + clamp2(goalsPer90 / 0.35, 0, 1) * 0.06;
      const ratingBoost = clamp2(ratingDelta * 0.11, -0.08, 0.12);
      return 1 + clamp2(sampleFactor * (assistsBoost + goalsBoost + ratingBoost), -0.1, 0.46);
    }
    case "DEF" /* DEF */: {
      const matchFactor = clamp2(matchesPlayed / 30, 0, 1) * 0.1;
      const experienceBoost = clamp2(getCareerMatches(player) / 260, 0, 1) * 0.12;
      const ratingBoost = averageRating === null ? 0 : clamp2((averageRating - 6.6) * 0.18, -0.1, 0.22) * clamp2(matchesPlayed / 10, 0, 1);
      return 1 + clamp2(matchFactor + experienceBoost + ratingBoost, -0.1, 0.42);
    }
    case "GK" /* GK */: {
      const matchFactor = clamp2(matchesPlayed / 30, 0, 1) * 0.1;
      const experienceBoost = clamp2(getCareerMatches(player) / 240, 0, 1) * 0.14;
      const ratingBoost = averageRating === null ? 0 : clamp2((averageRating - 6.6) * 0.22, -0.1, 0.24) * clamp2(matchesPlayed / 8, 0, 1);
      return 1 + clamp2(matchFactor + experienceBoost + ratingBoost, -0.12, 0.46);
    }
    default:
      return 1;
  }
};
var calculatePolishMarketValue = (player, reputation, tier) => {
  const baseValue = getPolishBaseMarketValue(player.overallRating);
  const tierMultiplier = {
    1: 1,
    2: 0.38,
    3: 0.14,
    4: 0.05,
    5: 0.025
  }[tier] ?? 0.05;
  const reputationFactor = 0.88 + clamp2(reputation, 1, 10) * 0.025;
  const ageFactor = getPolishAgeFactor(player);
  const experienceFactor = getPolishExperienceFactor(player);
  const performanceFactor = getPolishPerformanceFactor(player);
  const veteranUsageFactor = getPolishVeteranUsageFactor(player);
  const randomFactor = 0.985 + Math.random() * 0.03;
  const tierCap = Math.min(
    POLISH_MARKET_CAP_BY_TIER[tier] ?? 175e3,
    getPolishAgeMarketCap(player, tier)
  );
  const rawValue = baseValue * tierMultiplier * reputationFactor * ageFactor * experienceFactor * performanceFactor * veteranUsageFactor * randomFactor;
  const cappedValue = Math.min(rawValue, tierCap);
  const step = cappedValue >= 1e7 ? 25e4 : cappedValue >= 1e6 ? 1e5 : cappedValue >= 1e5 ? 25e3 : 1e4;
  return Math.round(cappedValue / step) * step;
};
var getEuropeanCommercialIndex = (club) => {
  const countryFactorRaw = EUROPEAN_COUNTRY_FINANCE_FACTOR[club.country || ""] ?? 0.1;
  const countryFactor = 0.4 + Math.sqrt(Math.max(0.01, countryFactorRaw));
  const reputationFactor = 0.7 + Math.pow(Math.max(1, Math.min(20, club.reputation)) / 20, 1.2) * 0.9;
  const stadiumFactor = 0.78 + Math.pow(Math.max(2e3, Math.min(1e5, club.stadiumCapacity)) / 1e5, 0.8) * 0.42;
  const competitionFactor = club.leagueId === "L_CL" ? 1.12 : club.leagueId === "L_EL" ? 1 : 0.92;
  return clamp2(countryFactor * reputationFactor * stadiumFactor * competitionFactor / 1.45, 0.45, 2.6);
};
var INTERNATIONAL_DEFAULT_TIER_CAPS = {
  1: 9e7,
  2: 22e6,
  3: 6e6,
  4: 15e5,
  5: 5e5
};
var INTERNATIONAL_MARKET_PROFILE_BY_COUNTRY = {
  ENG: {
    marketFactor: 1.28,
    tierCaps: { 1: 22e7, 2: 7e7, 3: 18e6, 4: 4e6, 5: 12e5 }
  },
  ESP: {
    marketFactor: 1.18,
    tierCaps: { 1: 2e8, 2: 45e6, 3: 12e6, 4: 3e6, 5: 1e6 }
  },
  GER: {
    marketFactor: 1.08,
    tierCaps: { 1: 15e7, 2: 4e7, 3: 1e7, 4: 25e5, 5: 8e5 }
  },
  ITA: {
    marketFactor: 1,
    tierCaps: { 1: 11e7, 2: 28e6, 3: 8e6, 4: 2e6, 5: 7e5 }
  },
  FRA: {
    marketFactor: 0.97,
    tierCaps: { 1: 12e7, 2: 24e6, 3: 7e6, 4: 18e5, 5: 6e5 }
  },
  POR: {
    marketFactor: 0.78,
    tierCaps: { 1: 6e7, 2: 15e6, 3: 4e6, 4: 1e6, 5: 35e4 }
  },
  DEN: {
    marketFactor: 0.43,
    tierCaps: { 1: 22e6, 2: 1e7, 3: 35e5, 4: 1e6, 5: 325e3 }
  },
  NOR: {
    marketFactor: 0.3,
    tierCaps: { 1: 11e6, 2: 6e6, 3: 22e5, 4: 65e4, 5: 225e3 }
  },
  SWE: {
    marketFactor: 0.22,
    tierCaps: { 1: 65e5, 2: 35e5, 3: 13e5, 4: 4e5, 5: 15e4 }
  },
  FIN: {
    marketFactor: 0.07,
    tierCaps: { 1: 12e5, 2: 7e5, 3: 3e5, 4: 1e5, 5: 4e4 }
  },
  ISL: {
    marketFactor: 0.035,
    tierCaps: { 1: 6e5, 2: 35e4, 3: 15e4, 4: 5e4, 5: 2e4 }
  },
  GRE: {
    marketFactor: 0.52,
    tierCaps: { 1: 25e6, 2: 12e6, 3: 4e6, 4: 11e5, 5: 35e4 }
  },
  CRO: {
    marketFactor: 0.34,
    tierCaps: { 1: 15e6, 2: 8e6, 3: 3e6, 4: 85e4, 5: 275e3 }
  },
  SRB: {
    marketFactor: 0.32,
    tierCaps: { 1: 12e6, 2: 7e6, 3: 28e5, 4: 8e5, 5: 25e4 }
  },
  ROU: {
    marketFactor: 0.28,
    tierCaps: { 1: 1e7, 2: 6e6, 3: 24e5, 4: 7e5, 5: 225e3 }
  },
  BUL: {
    marketFactor: 0.22,
    tierCaps: { 1: 55e5, 2: 35e5, 3: 15e5, 4: 45e4, 5: 15e4 }
  },
  SVN: {
    marketFactor: 0.14,
    tierCaps: { 1: 28e5, 2: 18e5, 3: 8e5, 4: 25e4, 5: 9e4 }
  },
  BIH: {
    marketFactor: 0.11,
    tierCaps: { 1: 22e5, 2: 14e5, 3: 65e4, 4: 2e5, 5: 7e4 }
  },
  MNE: {
    marketFactor: 0.06,
    tierCaps: { 1: 1e6, 2: 65e4, 3: 3e5, 4: 1e5, 5: 4e4 }
  },
  MKD: {
    marketFactor: 0.07,
    tierCaps: { 1: 12e5, 2: 75e4, 3: 35e4, 4: 12e4, 5: 45e3 }
  },
  ALB: {
    marketFactor: 0.09,
    tierCaps: { 1: 16e5, 2: 1e6, 3: 45e4, 4: 15e4, 5: 55e3 }
  },
  BRA: {
    marketFactor: 0.72,
    tierCaps: { 1: 42e6, 2: 18e6, 3: 6e6, 4: 15e5, 5: 5e5 }
  },
  ARG: {
    marketFactor: 0.58,
    tierCaps: { 1: 28e6, 2: 12e6, 3: 4e6, 4: 11e5, 5: 35e4 }
  },
  URU: {
    marketFactor: 0.24,
    tierCaps: { 1: 8e6, 2: 5e6, 3: 18e5, 4: 5e5, 5: 175e3 }
  },
  COL: {
    marketFactor: 0.27,
    tierCaps: { 1: 9e6, 2: 55e5, 3: 18e5, 4: 5e5, 5: 175e3 }
  },
  ECU: {
    marketFactor: 0.3,
    tierCaps: { 1: 11e6, 2: 6e6, 3: 2e6, 4: 6e5, 5: 2e5 }
  },
  PAR: {
    marketFactor: 0.23,
    tierCaps: { 1: 7e6, 2: 4e6, 3: 14e5, 4: 4e5, 5: 15e4 }
  },
  CHI: {
    marketFactor: 0.26,
    tierCaps: { 1: 75e5, 2: 4e6, 3: 14e5, 4: 4e5, 5: 15e4 }
  },
  PER: {
    marketFactor: 0.18,
    tierCaps: { 1: 45e5, 2: 25e5, 3: 9e5, 4: 25e4, 5: 1e5 }
  },
  BOL: {
    marketFactor: 0.12,
    tierCaps: { 1: 25e5, 2: 15e5, 3: 5e5, 4: 15e4, 5: 6e4 }
  },
  KSA: {
    marketFactor: 1.2,
    tierCaps: { 1: 9e7, 2: 4e7, 3: 12e6, 4: 3e6, 5: 9e5 }
  },
  UAE: {
    marketFactor: 0.48,
    tierCaps: { 1: 18e6, 2: 12e6, 3: 4e6, 4: 11e5, 5: 35e4 }
  },
  QAT: {
    marketFactor: 0.64,
    tierCaps: { 1: 22e6, 2: 16e6, 3: 5e6, 4: 15e5, 5: 5e5 }
  },
  JPN: {
    marketFactor: 0.3,
    tierCaps: { 1: 1e7, 2: 6e6, 3: 2e6, 4: 6e5, 5: 2e5 }
  },
  KOR: {
    marketFactor: 0.22,
    tierCaps: { 1: 7e6, 2: 45e5, 3: 15e5, 4: 45e4, 5: 15e4 }
  },
  IRN: {
    marketFactor: 0.26,
    tierCaps: { 1: 8e6, 2: 5e6, 3: 18e5, 4: 5e5, 5: 175e3 }
  },
  CHN: {
    marketFactor: 0.28,
    tierCaps: { 1: 9e6, 2: 6e6, 3: 2e6, 4: 6e5, 5: 2e5 }
  },
  THA: {
    marketFactor: 0.17,
    tierCaps: { 1: 5e6, 2: 3e6, 3: 18e5, 4: 5e5, 5: 15e4 }
  },
  MAS: {
    marketFactor: 0.16,
    tierCaps: { 1: 45e5, 2: 28e5, 3: 16e5, 4: 45e4, 5: 15e4 }
  },
  AUS: {
    marketFactor: 0.2,
    tierCaps: { 1: 6e6, 2: 35e5, 3: 2e6, 4: 6e5, 5: 2e5 }
  },
  EGY: {
    marketFactor: 0.3,
    tierCaps: { 1: 1e7, 2: 6e6, 3: 2e6, 4: 6e5, 5: 2e5 }
  },
  RSA: {
    marketFactor: 0.21,
    tierCaps: { 1: 7e6, 2: 4e6, 3: 15e5, 4: 45e4, 5: 15e4 }
  },
  MAR: {
    marketFactor: 0.24,
    tierCaps: { 1: 8e6, 2: 5e6, 3: 18e5, 4: 5e5, 5: 175e3 }
  },
  TUN: {
    marketFactor: 0.15,
    tierCaps: { 1: 45e5, 2: 3e6, 3: 11e5, 4: 35e4, 5: 12e4 }
  },
  ALG: {
    marketFactor: 0.14,
    tierCaps: { 1: 4e6, 2: 28e5, 3: 1e6, 4: 3e5, 5: 1e5 }
  },
  TZA: {
    marketFactor: 0.1,
    tierCaps: { 1: 25e5, 2: 18e5, 3: 7e5, 4: 22e4, 5: 8e4 }
  },
  COD: {
    marketFactor: 0.09,
    tierCaps: { 1: 22e5, 2: 16e5, 3: 6e5, 4: 2e5, 5: 7e4 }
  }
};
var normalizeMarketCountry = (country) => {
  if (!country) return null;
  const normalized = country.trim().toUpperCase();
  return normalized.length >= 3 ? normalized.slice(0, 3) : normalized;
};
var getInternationalMarketProfile = (country) => {
  const normalizedCountry = normalizeMarketCountry(country);
  if (normalizedCountry && INTERNATIONAL_MARKET_PROFILE_BY_COUNTRY[normalizedCountry]) {
    return INTERNATIONAL_MARKET_PROFILE_BY_COUNTRY[normalizedCountry];
  }
  const financeFactor = EUROPEAN_COUNTRY_FINANCE_FACTOR[normalizedCountry || ""] ?? 0.25;
  const marketFactor = clamp2(0.5 + Math.sqrt(financeFactor / 1.45) * 0.55, 0.45, 1.1);
  const capScale = clamp2(marketFactor / 0.9, 0.55, 1.22);
  return {
    marketFactor,
    tierCaps: Object.fromEntries(
      Object.entries(INTERNATIONAL_DEFAULT_TIER_CAPS).map(([tierKey, value]) => [
        Number(tierKey),
        Math.round(value * capScale)
      ])
    )
  };
};
var getInternationalBaseMarketValue = (ovr) => {
  if (ovr >= 92) return 155e6 + (ovr - 92) * 15e6;
  if (ovr >= 89) return 105e6 + (ovr - 89) * 16e6;
  if (ovr >= 86) return 68e6 + (ovr - 86) * 12e6;
  if (ovr >= 83) return 4e7 + (ovr - 83) * 9e6;
  if (ovr >= 80) return 24e6 + (ovr - 80) * 5e6;
  if (ovr >= 76) return 11e6 + (ovr - 76) * 3e6;
  if (ovr >= 72) return 5e6 + (ovr - 72) * 15e5;
  if (ovr >= 68) return 18e5 + (ovr - 68) * 8e5;
  if (ovr >= 60) return 35e4 + (ovr - 60) * 18e4;
  return 5e4 + Math.max(0, ovr - 40) * 15e3;
};
var getInternationalAgeFactor = (player) => {
  switch (player.position) {
    case "DEF" /* DEF */:
      if (player.age <= 20) return 1.08;
      if (player.age <= 24) return 1.04;
      if (player.age <= 29) return 1;
      if (player.age <= 31) return 0.94;
      if (player.age <= 33) return 0.82;
      if (player.age <= 35) return 0.68;
      if (player.age <= 37) return 0.52;
      return 0.4;
    case "GK" /* GK */:
      if (player.age <= 21) return 1.02;
      if (player.age <= 25) return 1;
      if (player.age <= 31) return 1.05;
      if (player.age <= 34) return 0.96;
      if (player.age <= 36) return 0.82;
      if (player.age <= 38) return 0.66;
      return 0.52;
    default:
      if (player.age <= 20) return 1.18;
      if (player.age <= 23) return 1.1;
      if (player.age <= 27) return 1;
      if (player.age <= 29) return 0.94;
      if (player.age <= 31) return 0.82;
      if (player.age <= 33) return 0.68;
      if (player.age <= 35) return 0.54;
      if (player.age <= 37) return 0.4;
      return 0.28;
  }
};
var calculateInternationalMarketValue = (player, reputation, tier, country) => {
  const baseValue = getInternationalBaseMarketValue(player.overallRating);
  const tierMultiplier = {
    1: 1,
    2: 0.36,
    3: 0.16,
    4: 0.06,
    5: 0.03
  }[tier] ?? 0.08;
  const reputationFactor = 0.9 + clamp2(reputation, 1, 20) * 0.015;
  const ageFactor = getInternationalAgeFactor(player);
  const marketProfile = getInternationalMarketProfile(country);
  const randomFactor = 0.97 + Math.random() * 0.06;
  const tierCap = marketProfile.tierCaps[tier] ?? INTERNATIONAL_DEFAULT_TIER_CAPS[5];
  const rawValue = baseValue * tierMultiplier * marketProfile.marketFactor * reputationFactor * ageFactor * randomFactor;
  const cappedValue = Math.min(rawValue, tierCap);
  const step = cappedValue >= 1e8 ? 1e6 : cappedValue >= 25e6 ? 5e5 : cappedValue >= 1e7 ? 25e4 : cappedValue >= 1e6 ? 1e5 : cappedValue >= 1e5 ? 25e3 : 1e4;
  return Math.round(cappedValue / step) * step;
};
var FinanceService = {
  /**
   * Oblicza budżet początkowy na podstawie poziomu ligi i reputacji (1-10)
   */
  calculateInitialBudget: (tier, reputation) => {
    let min = 0;
    let max = 0;
    switch (tier) {
      case 1:
        min = 5e7;
        max = 217e6;
        break;
      case 2:
        min = 128e5;
        max = 448e5;
        break;
      case 3:
        min = 28e5;
        max = 128e5;
        break;
      case 4:
        min = 8e5;
        max = 1e7;
        break;
      default:
        min = 1e6;
        max = 5e6;
    }
    const reputationFactor = (Math.min(10, Math.max(1, reputation)) - 1) / 9;
    const baseBudget = min + (max - min) * reputationFactor;
    const variability = 0.95 + Math.random() * 0.1;
    return Math.floor(baseBudget * variability);
  },
  calculateTransferBudgetCap: (budget, reputation, wageBill = 0) => {
    if (!Number.isFinite(budget) || budget <= 0) return 0;
    const rep = Math.max(1, Math.min(20, reputation || 1));
    const wagePressure = wageBill > 0 ? wageBill / Math.max(1, budget) : 0;
    let ratio = 0.34 + Math.min(0.14, rep * 7e-3);
    if (wagePressure >= 0.85) ratio -= 0.14;
    else if (wagePressure >= 0.65) ratio -= 0.09;
    else if (wagePressure >= 0.45) ratio -= 0.04;
    const cappedRatio = Math.max(0.18, Math.min(0.52, ratio));
    return Math.floor(budget * cappedRatio);
  },
  calculateInitialTransferBudget: (budget, reputation) => {
    const cap = FinanceService.calculateTransferBudgetCap(budget, reputation);
    const rep = Math.max(1, Math.min(20, reputation || 1));
    const allocationRatio = 0.52 + Math.min(0.28, rep * 0.018) + Math.random() * 0.14;
    return Math.floor(cap * Math.min(0.95, allocationRatio));
  },
  calculateInitialReserveBudget: (budget, reputation) => {
    if (!Number.isFinite(budget) || budget <= 0) return 0;
    const rep = Math.max(1, Math.min(20, reputation || 1));
    const reserveRatio = 0.045 + Math.min(0.08, rep * 4e-3);
    return Math.floor(budget * reserveRatio);
  },
  normalizeTransferBudget: (budget, transferBudget, reputation, wageBill = 0) => {
    const cap = FinanceService.calculateTransferBudgetCap(budget, reputation, wageBill);
    return Math.max(0, Math.min(Math.floor(transferBudget || 0), cap));
  },
  getClubTier: (club) => {
    if (!club) return 4;
    if (typeof club.tier === "number" && Number.isFinite(club.tier)) {
      return club.tier;
    }
    const parsedTier = parseInt((club.leagueId || "").split("_")[2] || "4", 10);
    return Number.isFinite(parsedTier) ? parsedTier : 4;
  },
  calculateEuropeanInitialBudget: (tier, reputation, country, clubName, stadiumCapacity = 15e3) => {
    if (clubName && EUROPEAN_CLUB_REVENUE_OVERRIDE_PLN[clubName]) {
      return EUROPEAN_CLUB_REVENUE_OVERRIDE_PLN[clubName];
    }
    const baseRevenueEurM = EUROPEAN_TIER_BASE_REVENUE_EUR_M[tier] ?? EUROPEAN_TIER_BASE_REVENUE_EUR_M[4];
    const countryFactor = EUROPEAN_COUNTRY_FINANCE_FACTOR[country] ?? 0.1;
    const cappedReputation = Math.max(1, Math.min(20, reputation));
    const cappedCapacity = Math.max(2e3, Math.min(1e5, stadiumCapacity));
    const reputationFactor = 0.62 + Math.pow(cappedReputation / 20, 1.35) * 0.98;
    const stadiumFactor = 0.85 + (cappedCapacity - 2e3) / 98e3 * 0.3;
    const continentalPremium = tier === 1 ? 1.08 : tier === 2 ? 1 : tier === 3 ? 0.96 : 0.92;
    const variability = 0.97 + Math.random() * 0.06;
    const estimatedRevenueEurM = baseRevenueEurM * countryFactor * reputationFactor * stadiumFactor * continentalPremium * variability;
    return eurMillionsToPln(estimatedRevenueEurM);
  },
  getWagePool: (totalBudget) => {
    return totalBudget * 0.45;
  },
  calculatePolishLeagueSalaryCeiling: (tier, reputation) => {
    if (tier !== 2) return null;
    const reputationFactor = clamp2((Math.max(1, Math.min(10, reputation)) - 4) / 6, 0, 1);
    const ceiling = 12e4 + 24e4 * reputationFactor;
    return Math.round(ceiling / 1e4) * 1e4;
  },
  normalizePolishLeagueAnnualSalary: (rawSalary, tier, reputation) => {
    const salary = Math.max(0, Math.floor(rawSalary));
    const ceiling = FinanceService.calculatePolishLeagueSalaryCeiling(tier, reputation);
    return ceiling ? Math.min(salary, ceiling) : salary;
  },
  calculateTotalSalaries: (squad) => {
    return squad.reduce((sum, p) => sum + (p.annualSalary || 0), 0);
  },
  calculateAvailableFunds: (totalBudget, squad) => {
    const expenses = FinanceService.calculateTotalSalaries(squad);
    return totalBudget - expenses;
  },
  calculateSalaryWeight: (ovr, age) => {
    const baseWeight = Math.pow(Math.max(1, ovr - 35), 1.5);
    const ageMod = age < 20 ? 0.8 : 1;
    return baseWeight * ageMod;
  },
  calculateNewgenSalary: (clubBudget, overall, age) => {
    const wagePool = FinanceService.getWagePool(clubBudget);
    const avgSquadSalary = wagePool / 31;
    const youthDiscount = age <= 17 ? 0.38 : age <= 19 ? 0.46 : age <= 21 ? 0.58 : 0.72;
    const overallModifier = Math.min(1.2, Math.max(0.55, 0.55 + (overall - 45) * 0.03));
    let salary = avgSquadSalary * youthDiscount * overallModifier;
    if (overall >= 70) {
      const starBonus = 1.12 + Math.min(0.18, (overall - 70) * 0.02);
      salary *= starBonus;
    }
    const fairMarketSalary = FinanceService.getFairMarketSalary(overall);
    const fairMarketCapMultiplier = overall >= 70 ? 0.55 : 0.4;
    const cappedSalary = Math.min(salary, fairMarketSalary * fairMarketCapMultiplier);
    const salaryStep = cappedSalary >= 1e6 ? 1e5 : cappedSalary >= 1e5 ? 1e4 : 5e3;
    return Math.max(15e3, Math.round(cappedSalary / salaryStep) * salaryStep);
  },
  // Koszty organizacji meczu — progresywna formuła wg. ligi, reputacji i frekwencji
  // attendance (opcjonalne) — liczba kibiców na trybunach (dla meczów u siebie)
  calculateMatchdayExpenses: (club, isHome, attendance) => {
    const cfoFactor = 1.15 - (club.management?.cfo?.dyscyplinaFinansowa ?? 10) / 20 * 0.3;
    if (isEuropeanCommercialClub(club)) {
      const marketIndex = getEuropeanCommercialIndex(club);
      if (isHome) {
        const att = attendance ?? 0;
        const fillRate = club.stadiumCapacity > 0 ? att / club.stadiumCapacity : 0;
        const fillMultiplier = fillRate >= 0.95 ? 1.3 : fillRate >= 0.85 ? 1.18 : fillRate >= 0.7 ? 1.08 : 1;
        const rawCost2 = (18e4 + club.stadiumCapacity * (5.5 + marketIndex * 1.8) + att * (7 + marketIndex * 2.4) + club.reputation * (16e3 + marketIndex * 8e3)) * fillMultiplier * cfoFactor;
        const minFloor = 18e4 + club.stadiumCapacity * (2 + marketIndex * 0.8);
        const maxCap = 35e4 + club.stadiumCapacity * (14 + marketIndex * 4);
        return Math.round(clamp2(rawCost2, minFloor, maxCap));
      }
      const awayRaw = (12e4 + club.stadiumCapacity * (1 + marketIndex * 0.35) + club.reputation * (7e3 + marketIndex * 3e3)) * cfoFactor;
      const awayCap = 22e4 + club.stadiumCapacity * (3.5 + marketIndex);
      return Math.round(Math.min(awayRaw, awayCap));
    }
    const tier = Math.min(4, Math.max(1, parseInt(club.leagueId.split("_")[2] || "4")));
    const p = MATCHDAY_COST_PARAMS;
    if (isHome) {
      const att = attendance ?? 0;
      const fillRate = club.stadiumCapacity > 0 ? att / club.stadiumCapacity : 0;
      const fillMultiplier = fillRate >= 0.95 ? 1.5 : fillRate >= 0.85 ? 1.3 : fillRate >= 0.7 ? 1.1 : 1;
      const rawCost2 = (p.home.baseCost[tier] + att * p.home.perFanCost[tier] + club.reputation * p.home.repScale[tier]) * fillMultiplier * cfoFactor;
      return Math.min(
        p.home.maxCap[tier],
        Math.max(p.home.minFloor[tier], Math.floor(rawCost2))
      );
    }
    const rawCost = (p.away.baseCost[tier] + club.reputation * p.away.repScale[tier]) * cfoFactor;
    return Math.min(p.away.maxCap[tier], Math.floor(rawCost));
  },
  calculateManagementMonthlySalary: (club) => {
    if (!club.management) return 0;
    const { owner, ceo, cfo, coo, marketingDirector, academyDirector } = club.management;
    return owner.monthlySalary + (ceo?.monthlySalary ?? 0) + cfo.monthlySalary + coo.monthlySalary + marketingDirector.monthlySalary + (academyDirector?.monthlySalary ?? 0);
  },
  calculateMonthlyOperationalCosts: (club) => {
    const KOMPETENCJA_MULTIPLIER = {
      bardzo_niska: 1.35,
      niska: 1.2,
      przecietna: 1.05,
      wysoka: 0.95,
      bardzo_wysoka: 0.85
    };
    const kompetencja = club.board?.kompetencja ?? "przecietna";
    const kompetencjaFactor = KOMPETENCJA_MULTIPLIER[kompetencja] ?? 1.05;
    const cfoFactor = 1.15 - (club.management?.cfo?.dyscyplinaFinansowa ?? 10) / 20 * 0.3;
    if (isEuropeanCommercialClub(club)) {
      const tier2 = Math.min(4, Math.max(1, club.tier ?? 1));
      const monthlyFactor = { 1: 0.015, 2: 0.012, 3: 0.01, 4: 8e-3 }[tier2] ?? 0.01;
      const rawCost2 = club.budget * monthlyFactor * kompetencjaFactor * cfoFactor;
      return Math.round(clamp2(rawCost2, 5e4, 8e7) / 1e3) * 1e3;
    }
    const tier = Math.min(4, Math.max(1, parseInt(club.leagueId.split("_")[2] || "4")));
    const cappedCapacity = Math.max(500, Math.min(8e4, club.stadiumCapacity));
    const cappedRep = Math.max(1, Math.min(10, club.reputation));
    const costPerSeat = { 1: 18, 2: 9, 3: 4.5, 4: 2 }[tier] ?? 2;
    const opsBase = { 1: 35e4, 2: 65e3, 3: 16e3, 4: 5e3 }[tier] ?? 5e3;
    const opsPerRep = { 1: 65e3, 2: 16e3, 3: 4500, 4: 1500 }[tier] ?? 1500;
    const tierMin = { 1: 35e4, 2: 7e4, 3: 18e3, 4: 5e3 }[tier] ?? 5e3;
    const tierMax = { 1: 3e6, 2: 9e5, 3: 18e4, 4: 55e3 }[tier] ?? 55e3;
    const stadiumCost = cappedCapacity * costPerSeat;
    const opsCost = opsBase + cappedRep * opsPerRep;
    const rawCost = (stadiumCost + opsCost) * 1.3 * kompetencjaFactor * cfoFactor;
    return Math.round(clamp2(rawCost, tierMin, tierMax) / 1e3) * 1e3;
  },
  calculateSeasonalIncome: (tier, reputation, rank, sponsorshipMult = 1) => {
    const cappedReputation = Math.max(1, Math.min(10, reputation));
    if (tier === 3) {
      const tvRights2 = 2e6;
      const sponsorship2 = cappedReputation * 5e5 * sponsorshipMult;
      const prizeMoney2 = Math.max(0, (19 - rank) * 15e4);
      return Math.floor(tvRights2 + sponsorship2 + prizeMoney2);
    }
    if (tier === 4) {
      const tvRights2 = 75e4;
      const sponsorship2 = cappedReputation * 15e4 * sponsorshipMult;
      const prizeMoney2 = Math.max(0, (20 - rank) * 4e4);
      return Math.floor(tvRights2 + sponsorship2 + prizeMoney2);
    }
    const tvRights = [0, 35e6, 15e6, 6e6, 2e6][tier] || 1e6;
    const sponsorship = cappedReputation * 4e6 * sponsorshipMult;
    const prizeMoney = Math.max(0, (19 - rank) * 15e5);
    return Math.floor(tvRights + sponsorship + prizeMoney);
  },
  calculateMarketValue: (player, reputation, tier, clubCountry) => {
    const playerClubId = player.clubId ?? "";
    if (playerClubId === "FREE_AGENTS") return 0;
    const ovr = player.overallRating;
    const normalizedCountry = normalizeMarketCountry(clubCountry);
    const isPolishClub2 = playerClubId.startsWith("PL_") || normalizedCountry === "POL";
    if (isPolishClub2) {
      return calculatePolishMarketValue(player, reputation, tier);
    }
    return calculateInternationalMarketValue(player, reputation, tier, normalizedCountry);
  },
  /**
   * Board Intervention Engine (BIE)
   * Oblicza WOZ (Wskaźnik Oporu Zarządu)
   */
  evaluateReleaseRequest: (player, club, squad) => {
    const penalty = Math.floor(player.annualSalary * 0.4);
    const budget = club.budget;
    const financialPain = penalty / budget * 100;
    let financialScore = financialPain * 4;
    if (financialPain > 20) financialScore += 50;
    const avgOvr = squad.reduce((acc, p) => acc + p.overallRating, 0) / squad.length;
    const starGap = player.overallRating - avgOvr;
    let sportScore = 0;
    if (starGap > 10) sportScore = 95;
    else if (starGap > 5) sportScore = 50;
    else if (starGap < -5) sportScore = -20;
    const strictnessScore = (club.boardStrictness - 5) * 10;
    const chaosScore = Math.random() * 20 - 10;
    let woz = Math.max(0, Math.min(100, financialScore * 0.45 + sportScore * 0.4 + strictnessScore * 0.1 + chaosScore));
    const top11Ids = [...squad].sort((a, b) => b.overallRating - a.overallRating).slice(0, 11).map((p) => p.id);
    const isPillar = top11Ids.includes(player.id);
    if (isPillar && Math.random() > 0.05) {
      woz = Math.max(woz, 90);
    }
    if (player.isUntouchable && Math.random() > 0.01) {
      woz = 100;
    }
    if (woz < 30) return { status: "APPROVED", woz, reason: "Zarz\u0105d akceptuje Pana decyzj\u0119. Koszty s\u0105 akceptowalne, a zawodnik nie jest kluczowy dla wizerunku klubu." };
    if (woz < 60) return { status: "WARNING", woz, reason: "Zarz\u0105d ma pewne w\u0105tpliwo\u015Bci co do op\u0142acalno\u015Bci tego ruchu. Ostatecznie ufa Pana os\u0105dowi, ale oczekuje wynik\xF3w." };
    if (woz < 85) return { status: "SOFT_BLOCK", woz, reason: "Wniosek odrzucony. Obecnie nie mo\u017Cemy sobie pozwoli\u0107 na tak\u0105 strat\u0119 finansow\u0105. Prosz\u0119 spr\xF3bowa\u0107 za 3 miesi\u0105ce." };
    return { status: "VETO", woz, reason: "ABSOLUTNE VETO! Ten zawodnik jest ikon\u0105 klubu, a koszty jego zwolnienia zrujnowa\u0142yby nasz bud\u017Cet transferowy!" };
  },
  /**
   * Oblicza ile klub ma w puli na bonusy za podpis (5-10% budżetu)
   */
  calculateInitialSigningPool: (budget, reputation) => {
    const repFactor = reputation / 10 * 0.05;
    const finalPercent = 0.05 + repFactor;
    return Math.floor(budget * finalPercent);
  },
  /**
   * Oblicza ile zawodnik żąda za sam podpis (25-100% pensji)
   */
  calculatePlayerBonusDemand: (player, proposedSalary, clubReputation) => {
    const salaryBase = player.annualSalary > 0 ? player.annualSalary : proposedSalary;
    const ovr = player.overallRating;
    let baseMultiplier;
    if (ovr >= 90) baseMultiplier = 2.1;
    else if (ovr >= 85) baseMultiplier = 1.7;
    else if (ovr >= 80) baseMultiplier = 1.4;
    else if (ovr >= 75) baseMultiplier = 1.15;
    else if (ovr >= 70) baseMultiplier = 0.95;
    else if (ovr >= 65) baseMultiplier = 0.8;
    else baseMultiplier = 0.6;
    const age = player.age;
    let ageModifier;
    if (age >= 34) ageModifier = 1.35;
    else if (age >= 30) ageModifier = 1.15;
    else if (age <= 22) ageModifier = 0.75;
    else ageModifier = 1;
    const personality = player.moralePersonality;
    let personalityModifier = 1;
    if (personality === "EGOIST") personalityModifier = 1.35;
    else if (personality === "AMBITIOUS") personalityModifier = 1.2;
    else if (personality === "CONFIDENT") personalityModifier = 1.1;
    else if (personality === "LOYAL") personalityModifier = 0.7;
    else if (personality === "PROFESSIONAL") personalityModifier = 0.85;
    else if (personality === "CALM") personalityModifier = 0.9;
    const repModifier = clubReputation > 8 ? 1.15 : clubReputation < 5 ? 0.9 : 1;
    const variation = 0.85 + Math.random() * 0.3;
    const demand = salaryBase * baseMultiplier * ageModifier * personalityModifier * repModifier * variation;
    const step = demand >= 5e5 ? 25e3 : demand >= 1e5 ? 1e4 : demand >= 2e4 ? 5e3 : 1e3;
    return Math.round(demand / step) * step;
  },
  /**
   * Sprawdza czy oferta nie jest "manipulacją" (poniżej 40% żądań)
   */
  isOfferInsulting: (proposedBonus, demand) => {
    return proposedBonus < demand * 0.4;
  },
  /**
   * Główny silnik prawdopodobieństwa akceptacji (FM HARDCORE MODE)
   */
  evaluateContractLogic: (player, newSalary, newBonus, newEndDate, currentDate2, clubReputation, clubTier, managerProfile) => {
    const now = currentDate2.getTime();
    const currentEnd = new Date(player.contractEndDate).getTime();
    const newEnd = new Date(newEndDate).getTime();
    const rawExpectedSalary = player.annualSalary > 0 ? player.annualSalary : FinanceService.getFairMarketSalary(player.overallRating);
    const salaryCeiling = clubTier ? FinanceService.calculatePolishLeagueSalaryCeiling(clubTier, clubReputation) : null;
    const managerInfluence = ManagerNegotiationInfluenceService.calculate(managerProfile);
    const managerExpectationMultiplier = managerProfile ? managerInfluence.expectationMultiplier : 1;
    const expectedSalaryBase = salaryCeiling ? Math.min(rawExpectedSalary, salaryCeiling) : rawExpectedSalary;
    const expectedSalary = Math.max(5e4, Math.round(expectedSalaryBase * managerExpectationMultiplier / 5e3) * 5e3);
    const expectedBonus = Math.max(0, Math.round(FinanceService.calculatePlayerBonusDemand(player, expectedSalary, clubReputation) * managerExpectationMultiplier / 5e3) * 5e3);
    const isSalaryWithin15Percent = newSalary >= expectedSalary * 0.85;
    const isBonusWithin15Percent = newBonus >= expectedBonus * 0.85;
    if (isSalaryWithin15Percent && isBonusWithin15Percent && Math.random() < 0.1) {
      return {
        accepted: true,
        reason: "M\xF3j klient liczy\u0142 na nieco lepsze warunki, ale po namy\u015Ble uznali\u015Bmy, \u017Ce ten zesp\xF3\u0142 jest wart pewnych ust\u0119pstw finansowych. Podpisujemy!",
        demands: null
      };
    }
    const salaryScore = newSalary / expectedSalary;
    const bonusScore = expectedBonus > 0 ? newBonus / expectedBonus : 1.1;
    const salarySurplus = Math.max(0, salaryScore - 1);
    const effectiveBonusScore = bonusScore + salarySurplus * 2.5;
    const bonusSurplus = Math.max(0, bonusScore - 1);
    const effectiveSalaryScore = salaryScore + bonusSurplus * 0.12;
    if (effectiveSalaryScore < 0.65) {
      return {
        accepted: false,
        reason: "Nie traktujecie mnie powaznie wiec nie b\u0119dziemy o niczym rozmawiac. Do widzenia!",
        demands: null
      };
    }
    if (newBonus < expectedBonus * 0.2 && effectiveSalaryScore < 1.15) {
      return {
        accepted: false,
        reason: "M\xF3j agent uwa\u017Ca, \u017Ce kwota za sam podpis jest zdecydowanie za niska. Prosz\u0119 o przedstawienie nowej oferty uwzgl\u0119dniaj\u0105cej godny bonus.",
        demands: { salary: Math.ceil(expectedSalary * 1.05), bonus: expectedBonus }
      };
    }
    let wSal = 0.6, wBon = 0.3, wLen = 0.1;
    if (player.age >= 32) {
      wSal = 0.4;
      wBon = 0.5;
      wLen = 0.1;
    } else if (player.age <= 23) {
      wSal = 0.7;
      wBon = 0.1;
      wLen = 0.2;
    }
    const proposedYears = (newEnd - now) / (365 * 24 * 60 * 60 * 1e3);
    const remainingYears = (currentEnd - now) / (365 * 24 * 60 * 60 * 1e3);
    let lengthScore = 1;
    if (proposedYears < remainingYears) lengthScore = 0.5;
    if (player.age > 33 && proposedYears >= 2) lengthScore = 1.3;
    const finalScore = effectiveSalaryScore * wSal + effectiveBonusScore * wBon + lengthScore * wLen;
    const isDemandingHigher = Math.random() < 0.9;
    let demandSalary = expectedSalary;
    let demandBonus = expectedBonus;
    if (isDemandingHigher) {
      const multiplier = 1.05 + Math.random() * 0.15;
      demandSalary = Math.ceil(expectedSalary * multiplier);
      demandBonus = Math.ceil(expectedBonus * multiplier);
    } else {
      demandSalary = expectedSalary;
      demandBonus = expectedBonus;
    }
    if (salaryCeiling) {
      demandSalary = Math.min(demandSalary, salaryCeiling);
    }
    const demands = {
      salary: demandSalary,
      bonus: demandBonus
    };
    if (finalScore >= 0.98) {
      return { accepted: true, reason: "Zgadzam si\u0119 na te warunki.", demands: null };
    }
    if (finalScore >= 0.7) {
      return {
        accepted: false,
        reason: "Jeste\u015Bmy blisko porozumienia, ale m\xF3j klient oczekuje lepszych kwot, bior\u0105c pod uwag\u0119 jego status w zespole. Oto nasze oczekiwania.",
        demands
      };
    }
    return {
      accepted: false,
      reason: "Z ca\u0142ym szacunkiem, ale te warunki s\u0105 nieakceptowalne. Prosz\u0119 o przedstawienie oferty godnej zawodnika tej klasy.",
      demands: finalScore > 0.4 ? demands : null
    };
  },
  // Oblicza sumę wszystkich pensji w drużynie
  calculateCurrentWageBill: (squad) => {
    return squad.reduce((sum, p) => sum + (p.annualSalary || 0), 0);
  },
  /**
   * Full guaranteed value used to compare the offer with the agent's expectations.
   * Contract length belongs here because a longer deal is genuinely worth more to
   * the player, even though the club does not prepay every future season at signing.
   */
  calculateFreeAgentContractCommitment: (annualSalary, years, signingBonus) => Math.max(0, annualSalary) * Math.max(1, years) + Math.max(0, signingBonus),
  /**
   * Immediate charge against the current season's transfer/contract budget.
   * Future annual salaries are funded from future season budgets, so only the first
   * annual salary and the one-time signing bonus are reserved when the deal is signed.
   */
  calculateFreeAgentCurrentSeasonCost: (annualSalary, signingBonus) => Math.max(0, annualSalary) + Math.max(0, signingBonus),
  calculateRemainingContractBudget: (availableBudget, annualSalary, _years, signingBonus) => Math.max(0, availableBudget - FinanceService.calculateFreeAgentCurrentSeasonCost(annualSalary, signingBonus)),
  // Orientacyjna wartość używana przez agentów i symulację rynku; nie jest limitem zarządu.
  getFairMarketSalary: (ovr) => {
    const base = Math.pow(ovr / 50, 4) * 125e3;
    const step = base >= 1e6 ? 1e5 : base >= 1e5 ? 1e4 : 5e3;
    return Math.round(base / step) * step;
  },
  calculateFAExpectations: (player, clubReputation, avgSquadSalary) => {
    const base = Math.pow(player.overallRating, 2.9) * 0.45;
    const repTax = (10 - clubReputation) * 0.05;
    const anchor = avgSquadSalary * 0.3 + base * 0.7;
    const chaos = 0.85 + Math.random() * 0.3;
    return Math.floor(anchor * (1 + repTax) * chaos);
  },
  evaluateFASigningBoardDecision: (player, proposedSalary, proposedBonus, squad, club) => {
    const tier = FinanceService.getClubTier(club);
    const wageBill = FinanceService.calculateTotalSalaries(squad);
    const projectedWageBill = wageBill + Math.max(0, proposedSalary);
    const liquiditySalaryCap = club.budget * (tier >= 3 ? 0.35 : 0.3);
    const projectedWagePressure = projectedWageBill / Math.max(1, club.budget);
    if (proposedSalary > liquiditySalaryCap || projectedWagePressure > 0.82) {
      return {
        approved: false,
        reason: "Dyrektor finansowy ocenia, \u017Ce ten kontrakt zbyt mocno obci\u0105\u017Cy roczne finanse klubu i ograniczy mo\u017Cliwo\u015B\u0107 wykonania kolejnych ruch\xF3w kadrowych.",
        reasonCode: "LIQUIDITY",
        appealable: true
      };
    }
    const highestSalary = squad.length > 0 ? Math.max(...squad.map((p) => p.annualSalary)) : 0;
    const averageOverall = squad.length > 0 ? squad.reduce((sum, squadPlayer) => sum + squadPlayer.overallRating, 0) / squad.length : player.overallRating;
    const bestSamePositionOverall = squad.filter((squadPlayer) => squadPlayer.position === player.position).reduce((best, squadPlayer) => Math.max(best, squadPlayer.overallRating), 0);
    const isClearSportingUpgrade = player.overallRating >= averageOverall + 4 || player.overallRating >= bestSamePositionOverall + 2;
    const hierarchyMultiplier = isClearSportingUpgrade ? tier >= 3 ? 3.5 : 3.1 : player.overallRating >= averageOverall ? tier >= 3 ? 2.75 : 2.55 : tier >= 3 ? 2.4 : 2.25;
    const financialStructureFloor = club.budget * (tier === 1 ? 0.045 : tier === 2 ? 0.035 : tier === 3 ? 0.025 : 0.02);
    const hierarchySalaryCap = Math.max(highestSalary * hierarchyMultiplier, financialStructureFloor);
    if (highestSalary > 0 && proposedSalary > hierarchySalaryCap) {
      return {
        approved: false,
        reason: `Prezes uwa\u017Ca, \u017Ce proponowana pensja zbyt gwa\u0142townie zmieni obecn\u0105 hierarchi\u0119 wynagrodze\u0144. Najwy\u017Csza pensja w kadrze wynosi obecnie ${highestSalary.toLocaleString("pl-PL")} PLN, dlatego zarz\u0105d oczekuje dodatkowego uzasadnienia dla ustanowienia nowego poziomu p\u0142ac.`,
        reasonCode: "WAGE_STRUCTURE",
        appealable: true
      };
    }
    if (proposedBonus > club.budget * 0.5) {
      return {
        approved: false,
        reason: "Zarz\u0105d uwa\u017Ca, \u017Ce jednorazowy bonus za podpis jest zbyt wysoki w stosunku do wolnych \u015Brodk\xF3w klubu.",
        reasonCode: "SIGNING_BONUS",
        appealable: true
      };
    }
    return { approved: true, reason: "" };
  },
  evaluateRenewalBoardDecision: (player, proposedSalary, proposedBonus, squad, club) => {
    if (Math.random() < 1 / 365) {
      return { approved: true, reason: "PREZES: Wiecie co, id\u0119 na ca\u0142o\u015B\u0107. Podpisujemy!" };
    }
    const currentWageBill = FinanceService.calculateCurrentWageBill(squad);
    const wageBillAfter = currentWageBill - player.annualSalary + proposedSalary;
    if (wageBillAfter > club.budget * 0.65) {
      return {
        approved: false,
        reason: "DYREKTOR FINANSOWY: \u0141\u0105czny fundusz p\u0142ac po tej podwy\u017Cce przekroczy\u0142by nasze mo\u017Cliwo\u015Bci bud\u017Cetowe."
      };
    }
    if (proposedSalary > player.annualSalary * 2 && player.annualSalary > 0) {
      return {
        approved: false,
        reason: `PREZES: Podwojenie pensji to za du\u017Cy skok naraz. Zawodnik zarabia teraz ${player.annualSalary.toLocaleString()} PLN \u2014 wr\xF3\u0107cie z rozs\u0105dniejsz\u0105 propozycj\u0105.`
      };
    }
    const highestSalary = squad.length > 0 ? Math.max(...squad.map((p) => p.annualSalary)) : 0;
    if (proposedSalary > highestSalary * 1.5 && highestSalary > 0 && player.overallRating < 80) {
      return {
        approved: false,
        reason: `PREZES: Ten zawodnik zarabia\u0142by wi\u0119cej ni\u017C 1.5x tyle co najlepiej op\u0142acany gracz w zespole (${highestSalary.toLocaleString()} PLN). Szatnia tego nie zaakceptuje.`
      };
    }
    if (proposedBonus > club.budget * 0.3) {
      return {
        approved: false,
        reason: "DYREKTOR FINANSOWY: Bonus za podpis jest zbyt wysoki wobec aktualnych rezerw got\xF3wkowych klubu."
      };
    }
    return { approved: true, reason: "" };
  },
  classifyFAOffer: (proposed, expected) => {
    const ratio = proposed / expected;
    if (ratio >= 1.1) return "IDEAL";
    if (ratio >= 0.9) return "ATTRACTIVE";
    if (ratio >= 0.7) return "AVERAGE";
    if (ratio >= 0.45) return "WEAK";
    return "INSULT";
  },
  compareMultipleOffers: (offers, clubs) => {
    return [...offers].sort((a, b) => {
      const clubA = clubs.find((c) => c.id === a.clubId);
      const clubB = clubs.find((c) => c.id === b.clubId);
      const repA = clubA ? clubA.reputation : 1;
      const repB = clubB ? clubB.reputation : 1;
      const scoreA = a.salary + a.bonus / 2 + repA * 5e4;
      const scoreB = b.salary + b.bonus / 2 + repB * 5e4;
      return scoreB - scoreA;
    })[0];
  },
  evaluateReleaseVsList: (player) => {
    const marketValue = player.marketValue || 0;
    const releaseCost = player.annualSalary * 0.4;
    if (marketValue > player.annualSalary * 0.5) {
      return "TRANSFER_LIST";
    }
    return "RELEASE";
  },
  // Funkcja zwraca cenę biletu jednorazowego w zależności od ligi i reputacji
  calculateTicketPrice: (tier, reputation) => {
    let basePrice = 0;
    switch (tier) {
      case 1:
        basePrice = 20 + reputation / 10 * 160;
        break;
      case 2:
        const ekstraPrice = 20 + reputation / 10 * 160;
        basePrice = ekstraPrice * (0.4 + reputation / 10 * 0.2);
        break;
      case 3:
        const refPrice = 20 + reputation / 10 * 160;
        basePrice = refPrice * (0.15 + reputation / 10 * 0.25);
        break;
      case 4:
        basePrice = 8 + reputation / 10 * 16;
        break;
      default:
        basePrice = 12;
    }
    if (tier === 3) {
      basePrice = 8 + reputation / 10 * 18;
    }
    return Math.floor(basePrice);
  },
  calculateTicketPriceForClub: (club) => {
    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      return FinanceService.calculateTicketPrice(tier, club.reputation);
    }
    const marketIndex = getEuropeanCommercialIndex(club);
    const maxPrice = 18 + marketIndex * 110 + club.reputation / 20 * 85;
    return Math.round(clamp2(maxPrice, 45, 420));
  },
  // Przychód z biletów jednorazowych
  calculateMatchTicketRevenue: (attendance, tier, reputation) => {
    const maxPrice = FinanceService.calculateTicketPrice(tier, reputation);
    const minPrice = maxPrice <= 20 ? Math.max(5, Math.floor(maxPrice * 0.65)) : 20;
    const avgPrice = maxPrice <= minPrice ? maxPrice : Math.floor(minPrice + Math.random() * (maxPrice - minPrice));
    return { revenue: Math.floor(attendance * avgPrice), avgPrice };
  },
  calculateMatchTicketRevenueForClub: (attendance, club) => {
    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      return FinanceService.calculateMatchTicketRevenue(attendance, tier, club.reputation);
    }
    const maxPrice = FinanceService.calculateTicketPriceForClub(club);
    const avgPrice = Math.round(maxPrice * (0.58 + Math.random() * 0.2));
    return { revenue: Math.floor(attendance * avgPrice), avgPrice };
  },
  // Przychód z karnetów na sezon (tylko dla gospodarza)
  calculateSeasonTicketRevenue: (stadiumCapacity, reputation, tier) => {
    let percentageOfCapacity = 0.1 + reputation / 10 * 0.2;
    const singlePrice = FinanceService.calculateTicketPrice(tier, reputation);
    const matchesPerSeason = 19;
    const seasonTicketPrice = singlePrice * matchesPerSeason;
    const minSeasonPrice = 200;
    const maxSeasonPrice = 1300;
    const finalSeasonPrice = Math.max(minSeasonPrice, Math.min(maxSeasonPrice, seasonTicketPrice));
    const seasonTicketsSold = Math.floor(stadiumCapacity * percentageOfCapacity);
    return Math.floor(seasonTicketsSold * finalSeasonPrice);
  },
  calculateSeasonTicketPackageForClub: (club) => {
    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      const revenue = FinanceService.calculateSeasonTicketRevenue(club.stadiumCapacity, club.reputation, tier);
      const ticketsSold2 = Math.floor(club.stadiumCapacity * (0.1 + club.reputation / 10 * 0.2));
      const ticketPrice = FinanceService.calculateTicketPrice(tier, club.reputation);
      const seasonTicketPrice2 = Math.max(200, Math.min(1300, ticketPrice * 19));
      return { revenue, ticketsSold: ticketsSold2, seasonTicketPrice: seasonTicketPrice2 };
    }
    const marketIndex = getEuropeanCommercialIndex(club);
    const seasonTicketShare = clamp2(0.14 + marketIndex * 0.1 + club.reputation / 20 * 0.18, 0.16, 0.65);
    const ticketsSold = Math.floor(club.stadiumCapacity * seasonTicketShare);
    const singleMatchPrice = FinanceService.calculateTicketPriceForClub(club);
    const seasonDiscount = clamp2(0.68 + marketIndex * 0.05, 0.7, 0.82);
    const seasonTicketPrice = Math.round(clamp2(singleMatchPrice * 19 * seasonDiscount, 900, 8500));
    return {
      revenue: ticketsSold * seasonTicketPrice,
      ticketsSold,
      seasonTicketPrice
    };
  },
  // Dodatkowe przychody dnia meczowego per mecz domowy:
  // catering, merchandising, programy/LED, parkingi — proporcjonalne do frekwencji
  calculateMatchdayAdditionalRevenues: (attendance, tier, reputation) => {
    const t = Math.min(4, Math.max(1, tier));
    const p = MATCHDAY_ADDITIONAL_REVENUE_PARAMS;
    const repMultiplier = 0.8 + reputation / 10 * 0.4;
    const rand = () => 0.8 + Math.random() * 0.4;
    const catering = Math.floor(attendance * p.cateringPerFan[t] * repMultiplier * rand());
    const merchandising = Math.floor(attendance * p.merchandisingPerFan[t] * repMultiplier * rand());
    const programs = Math.floor(attendance * p.programsPerFan[t] * repMultiplier * rand());
    const parking = Math.floor(attendance * p.parkingPerFan[t] * repMultiplier * rand());
    return { catering, merchandising, programs, parking };
  },
  calculateMatchdayAdditionalRevenuesForClub: (attendance, club) => {
    const mktFactor = 0.85 + (club.management?.marketingDirector?.zdolnosciMarketingowe ?? 10) / 20 * 0.3;
    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      const base = FinanceService.calculateMatchdayAdditionalRevenues(attendance, tier, club.reputation);
      return {
        catering: Math.floor(base.catering * mktFactor),
        merchandising: Math.floor(base.merchandising * mktFactor),
        programs: Math.floor(base.programs * mktFactor),
        parking: Math.floor(base.parking * mktFactor)
      };
    }
    const marketIndex = getEuropeanCommercialIndex(club);
    const repMultiplier = 0.9 + club.reputation / 20 * 0.45;
    const rand = () => 0.82 + Math.random() * 0.36;
    const catering = Math.floor(attendance * (2.5 + marketIndex * 2.6) * repMultiplier * rand() * mktFactor);
    const merchandising = Math.floor(attendance * (0.9 + marketIndex * 1.4) * repMultiplier * rand() * mktFactor);
    const programs = Math.floor(attendance * (0.3 + marketIndex * 0.45) * repMultiplier * rand() * mktFactor);
    const parking = Math.floor(attendance * (0.4 + marketIndex * 0.65) * repMultiplier * rand() * mktFactor);
    return { catering, merchandising, programs, parking };
  },
  // Roczny przychód z wynajmu stref VIP i lóż (Skybox).
  // Warunki: tier === 1 (Ekstraklasa) ORAZ stadiumCapacity > 15 000
  calculateVIPBoxRevenue: (stadiumCapacity, reputation) => {
    const p = VIP_BOX_REVENUE_PARAMS;
    const raw = p.base + reputation / 10 * p.repScale + stadiumCapacity / 4e4 * p.capacityScale;
    const jitter = 0.85 + Math.random() * 0.3;
    return Math.min(p.maxRevenue, Math.max(p.minRevenue, Math.floor(raw * jitter)));
  },
  calculateVIPBoxRevenueForClub: (club) => {
    const mktFactor = 0.85 + (club.management?.marketingDirector?.zdolnosciMarketingowe ?? 10) / 20 * 0.3;
    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      if (tier !== 1 || club.stadiumCapacity <= 15e3) return 0;
      return Math.floor(FinanceService.calculateVIPBoxRevenue(club.stadiumCapacity, club.reputation) * mktFactor);
    }
    if (club.stadiumCapacity < 4e3) return 0;
    const marketIndex = getEuropeanCommercialIndex(club);
    const suitesSold = Math.max(4, Math.round(club.stadiumCapacity / 2200));
    const avgSuitePrice = 25e3 + marketIndex * 12e4 + club.reputation / 20 * 1e5;
    const occupancyFactor = club.leagueId === "L_CL" ? 1 : club.leagueId === "L_EL" ? 0.92 : 0.86;
    const jitter = 0.9 + Math.random() * 0.2;
    return Math.round(suitesSold * avgSuitePrice * occupancyFactor * jitter * mktFactor);
  },
  // Bonusy za pozycję końcową w lidze (Ekstraklasa)
  calculateLeagueFinishBonus: (position, tier) => {
    if (tier !== 1) return 0;
    const bonuses = {
      1: 35e6 + Math.random() * 3e6,
      // 35-38 mln
      2: 28e6 + Math.random() * 4e6,
      // 28-32 mln
      3: 24e6 + Math.random() * 4e6,
      // 24-28 mln
      4: 2e7 + Math.random() * 5e6
      // 20-25 mln
    };
    if (bonuses[position]) return Math.floor(bonuses[position]);
    if (position > 4) {
      const baseBonus = 1e7;
      const decrement = 5e5 * (position - 4);
      return Math.max(0, Math.floor(baseBonus - decrement));
    }
    return 0;
  },
  // Bonusy za Puchar Polski
  calculatePolishCupBonus: (cupPosition) => {
    const bonuses = {
      "WINNER": 5e6,
      "FINALIST": 1e6,
      "SEMIFINALIST": 38e4,
      "QUARTERFINALIST": 19e4,
      "ROUND_8": 9e4,
      "ROUND_16": 45e3,
      "ROUND_32": 2e4,
      "ROUND_64": 1e4
    };
    return bonuses[cupPosition] || 0;
  },
  // Bonus za Superpuchar Polski
  calculateSuperCupBonus: (isWinner) => {
    return isWinner ? 2e5 : 1e5;
  },
  // Premie UEFA za Puchary Europejskie (sezon 2025/26, przeliczone na PLN wg kursu 4,25 EUR/PLN)
  calculateEuropeanPrizeMoney: (competition, event) => {
    const EUR_PLN = 4.25;
    const prizes = {
      CL: {
        Q1_ADVANCE: Math.round(4e5 * EUR_PLN),
        //   1 700 000
        Q2_ADVANCE: Math.round(1e6 * EUR_PLN),
        //   4 250 000
        GROUP_STAGE_ENTRY: Math.round(1862e4 * EUR_PLN),
        //  79 135 000
        WIN: Math.round(21e5 * EUR_PLN),
        //   8 925 000
        DRAW: Math.round(7e5 * EUR_PLN),
        //   2 975 000
        KO_PLAYOFF: Math.round(11e5 * EUR_PLN),
        //   4 675 000
        R16: Math.round(11e6 * EUR_PLN),
        //  46 750 000
        QF: Math.round(125e5 * EUR_PLN),
        //  53 125 000
        SF: Math.round(15e6 * EUR_PLN),
        //  63 750 000
        FINALIST: Math.round(185e5 * EUR_PLN),
        //  78 625 000
        WINNER: Math.round(25e6 * EUR_PLN)
        // 106 250 000
      },
      EL: {
        Q1_ADVANCE: Math.round(1e5 * EUR_PLN),
        //     425 000
        Q2_ADVANCE: Math.round(25e4 * EUR_PLN),
        //   1 062 500
        GROUP_STAGE_ENTRY: Math.round(431e4 * EUR_PLN),
        //  18 317 500
        WIN: Math.round(63e4 * EUR_PLN),
        //   2 677 500
        DRAW: Math.round(21e4 * EUR_PLN),
        //     892 500
        KO_PLAYOFF: Math.round(5e5 * EUR_PLN),
        //   2 125 000
        R16: Math.round(15e5 * EUR_PLN),
        //   6 375 000
        QF: Math.round(22e5 * EUR_PLN),
        //   9 350 000
        SF: Math.round(39e5 * EUR_PLN),
        //  16 575 000
        FINALIST: Math.round(61e5 * EUR_PLN),
        //  25 925 000
        WINNER: Math.round(52e5 * EUR_PLN)
        //  22 100 000
      },
      CONF: {
        Q1_ADVANCE: Math.round(75e3 * EUR_PLN),
        //     318 750
        Q2_ADVANCE: Math.round(15e4 * EUR_PLN),
        //     637 500
        GROUP_STAGE_ENTRY: Math.round(317e4 * EUR_PLN),
        //  13 472 500
        WIN: Math.round(4e5 * EUR_PLN),
        //   1 700 000
        DRAW: Math.round(133e3 * EUR_PLN),
        //     565 250
        KO_PLAYOFF: Math.round(2e5 * EUR_PLN),
        //     850 000
        R16: Math.round(8e5 * EUR_PLN),
        //   3 400 000
        QF: Math.round(13e5 * EUR_PLN),
        //   5 525 000
        SF: Math.round(25e5 * EUR_PLN),
        //  10 625 000
        FINALIST: Math.round(4e6 * EUR_PLN),
        //  17 000 000
        WINNER: Math.round(3e6 * EUR_PLN)
        //  12 750 000
      }
    };
    return prizes[competition]?.[event] ?? 0;
  },
  // Premie dla zawodników i sztabu za osiągnięcia — wypłacane z budżetu klubu
  calculateAchievementBonus: (achievement, reputation, hojnosc) => {
    const BASE_RANGES = {
      CHAMPION: [15e5, 25e5],
      RUNNER_UP: [8e5, 14e5],
      THIRD: [5e5, 9e5],
      FOURTH: [2e5, 5e5],
      PROMOTE_L2_L1: [6e5, 1e6],
      PROMOTE_L3_L2: [2e5, 4e5],
      CUP_WINNER: [7e5, 12e5],
      CUP_FINALIST: [2e5, 5e5],
      CUP_SEMI: [5e4, 15e4]
    };
    const REP_MULTIPLIER = reputation >= 7 ? 3 : reputation >= 4 ? 1.5 : 1;
    const HOJNOSC_MULTIPLIER = {
      bardzo_wysoka: 2,
      wysoka: 1.5,
      przecietna: 1,
      niska: 0.6,
      bardzo_niska: 0.3
    };
    const [min, max] = BASE_RANGES[achievement] ?? [0, 0];
    const base = min + Math.random() * (max - min);
    const hMult = HOJNOSC_MULTIPLIER[hojnosc] ?? 1;
    return Math.floor(base * REP_MULTIPLIER * hMult);
  },
  getSponsorCheckProbability: (avg) => {
    const f = Math.floor(Math.max(1, Math.min(20, avg)));
    if (f >= 20) return 0.5;
    if (f === 19) return 0.4;
    if (f === 18) return 0.35;
    if (f === 17) return 0.3;
    if (f === 16) return 0.25;
    if (f === 15) return 0.2;
    if (f === 14) return 0.15;
    if (f === 13) return 0.1;
    if (f === 12) return 0.05;
    if (f === 11) return 0.035;
    if (f === 10) return 0.025;
    if (f === 9) return 0.018;
    if (f === 8) return 0.012;
    if (f === 7) return 8e-3;
    if (f === 6) return 5e-3;
    if (f === 5) return 3e-3;
    if (f === 4) return 2e-3;
    if (f === 3) return 1e-3;
    if (f === 2) return 5e-4;
    return 2e-4;
  },
  getSponsorAmount: (avg) => {
    const MIN = 1e5;
    const MAX = 1e8;
    const clamped = Math.max(1, Math.min(20, avg));
    const exponent = 0.5 + (20 - clamped) * 0.175;
    const biasedR = Math.pow(Math.random(), exponent);
    const raw = MIN + (MAX - MIN) * biasedR;
    return Math.round(raw / 1e5) * 1e5;
  },
  getOwnerRescueProbability: (hojnosc) => {
    const h = Math.floor(Math.max(1, Math.min(20, hojnosc)));
    if (h >= 18) return 0.9;
    if (h >= 16) return 0.75;
    if (h >= 14) return 0.6;
    if (h >= 12) return 0.45;
    if (h >= 10) return 0.3;
    if (h >= 8) return 0.18;
    if (h >= 6) return 0.1;
    if (h >= 4) return 0.05;
    if (h >= 2) return 0.02;
    return 0.01;
  },
  getOwnerRescueBonus: (hojnosc) => {
    const h = Math.max(1, Math.min(20, hojnosc));
    if (Math.random() >= h / 20) return 0;
    const raw = 1e5 + Math.random() * h * 25e4;
    return Math.round(raw / 1e5) * 1e5;
  }
};

// services/rivalries.data.ts
var directRivalries = [
  {
    clubs: ["Legia Warszawa", "Polonia Warszawa"],
    tier: "DERBY",
    label: "DERBY STOLICY",
    attendanceBoost: 0.18,
    pressureBoost: 0.055,
    briefingBoost: 0.2,
    minimumAttendancePct: 0.84
  },
  {
    clubs: ["Legia Warszawa", "Lech Poznan"],
    tier: "CLASSIC",
    label: "KLASYCZNY HIT",
    attendanceBoost: 0.2,
    pressureBoost: 0.065,
    briefingBoost: 0.24,
    minimumAttendancePct: 0.9
  },
  {
    clubs: ["Wisla Krakow", "Cracovia"],
    tier: "DERBY",
    label: "DERBY KRAKOWA",
    attendanceBoost: 0.18,
    pressureBoost: 0.055,
    briefingBoost: 0.2,
    minimumAttendancePct: 0.86
  },
  {
    clubs: ["Wisla Krakow", "Hutnik Krakow"],
    tier: "DERBY",
    label: "DERBY KRAKOWA",
    attendanceBoost: 0.14,
    pressureBoost: 0.045,
    briefingBoost: 0.16,
    minimumAttendancePct: 0.74
  },
  {
    clubs: ["Cracovia", "Hutnik Krakow"],
    tier: "DERBY",
    label: "DERBY KRAKOWA",
    attendanceBoost: 0.13,
    pressureBoost: 0.04,
    briefingBoost: 0.15,
    minimumAttendancePct: 0.7
  },
  {
    clubs: ["Lechia Gdansk", "Arka Gdynia"],
    tier: "DERBY",
    label: "DERBY POMORZA",
    attendanceBoost: 0.17,
    pressureBoost: 0.05,
    briefingBoost: 0.18,
    minimumAttendancePct: 0.8
  },
  {
    clubs: ["Lechia Gdansk", "Pogon Szczecin"],
    tier: "DERBY",
    label: "DERBY POMORZA",
    attendanceBoost: 0.12,
    pressureBoost: 0.034,
    briefingBoost: 0.12,
    minimumAttendancePct: 0.64
  },
  {
    clubs: ["Arka Gdynia", "Pogon Szczecin"],
    tier: "DERBY",
    label: "DERBY POMORZA",
    attendanceBoost: 0.11,
    pressureBoost: 0.032,
    briefingBoost: 0.11,
    minimumAttendancePct: 0.6
  },
  {
    clubs: ["Lech Poznan", "Pogon Szczecin"],
    tier: "RIVAL",
    label: "KLASYCZNY MECZ WROGOW",
    attendanceBoost: 0.1,
    pressureBoost: 0.028,
    briefingBoost: 0.1,
    minimumAttendancePct: 0.62
  },
  {
    clubs: ["Widzew Lodz", "LKS Lodz"],
    tier: "DERBY",
    label: "DERBY LODZI",
    attendanceBoost: 0.18,
    pressureBoost: 0.055,
    briefingBoost: 0.2,
    minimumAttendancePct: 0.86
  },
  {
    clubs: ["Miedz Legnica", "Zaglebie Lubin"],
    tier: "DERBY",
    label: "DERBY DOLNEGO SLASKA",
    attendanceBoost: 0.14,
    pressureBoost: 0.042,
    briefingBoost: 0.15,
    minimumAttendancePct: 0.72
  },
  {
    clubs: ["Miedz Legnica", "Chrobry Glogow"],
    tier: "RIVAL",
    label: "MECZ WROGOW",
    attendanceBoost: 0.1,
    pressureBoost: 0.028,
    briefingBoost: 0.1,
    minimumAttendancePct: 0.6
  }
];
var rivalryGroups = [
  {
    clubs: ["Lech Poznan", "Legia Warszawa", "Widzew Lodz", "Gornik Zabrze", "Pogon Szczecin", "Wisla Krakow"],
    tier: "RIVAL",
    label: "MECZ WROGOW",
    attendanceBoost: 0.08,
    pressureBoost: 0.022,
    briefingBoost: 0.08,
    minimumAttendancePct: 0.58
  },
  {
    clubs: ["Ruch Chorzow", "Gornik Zabrze", "GKS Katowice", "Piast Gliwice", "GKS Tychy"],
    tier: "DERBY",
    label: "DERBY WIELKIEGO SLASKA",
    attendanceBoost: 0.13,
    pressureBoost: 0.038,
    briefingBoost: 0.14,
    minimumAttendancePct: 0.68
  },
  {
    clubs: ["Zaglebie Lubin", "Slask Wroclaw", "Gornik Zabrze", "Pogon Szczecin"],
    tier: "RIVAL",
    label: "MECZ PODWY\u017BSZONEGO RYZYKA",
    attendanceBoost: 0.07,
    pressureBoost: 0.02,
    briefingBoost: 0.08,
    minimumAttendancePct: 0.54
  },
  {
    clubs: ["Polonia Warszawa", "Legia Warszawa", "Znicz Pruszkow", "Pogon Siedlce", "Pogon Grodzisk Mazowiecki", "Wisla Krakow", "LKS Lodz", "Slask Wroclaw", "Ruch Chorzow", "Pogon Szczecin"],
    tier: "RIVAL",
    label: "MECZ PODWY\u017BSZONEGO RYZYKA",
    attendanceBoost: 0.08,
    pressureBoost: 0.024,
    briefingBoost: 0.1,
    minimumAttendancePct: 0.56
  }
];

// services/RivalryService.ts
var clamp3 = (value, min, max) => Math.max(min, Math.min(max, value));
var normalizeClubName = (value) => value.trim().toUpperCase().replace(/Ł/g, "L").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]+/g, " ").replace(/\s+/g, " ").trim();
var pairKey = (a, b) => [normalizeClubName(a), normalizeClubName(b)].sort().join("::");
var marqueeClubWeights = {
  [normalizeClubName("Legia Warszawa")]: 1,
  [normalizeClubName("Lech Poznan")]: 1,
  [normalizeClubName("Widzew Lodz")]: 0.78,
  [normalizeClubName("Gornik Zabrze")]: 0.74,
  [normalizeClubName("Jagiellonia Bialystok")]: 0.68
};
var directRivalryMap = new Map(
  directRivalries.map((def) => [pairKey(def.clubs[0], def.clubs[1]), def])
);
var tierPriority = {
  NONE: 0,
  RIVAL: 1,
  DERBY: 2,
  CLASSIC: 3
};
var resolveGroupRivalry = (homeName, awayName) => {
  const normalizedHome = normalizeClubName(homeName);
  const normalizedAway = normalizeClubName(awayName);
  let bestMatch = null;
  for (const group of rivalryGroups) {
    const normalizedGroup = group.clubs.map(normalizeClubName);
    if (!normalizedGroup.includes(normalizedHome) || !normalizedGroup.includes(normalizedAway)) continue;
    if (!bestMatch || tierPriority[group.tier] > tierPriority[bestMatch.tier]) {
      bestMatch = group;
    }
  }
  return bestMatch;
};
var getMarqueeBoost = (homeName, awayName) => {
  const homeWeight = marqueeClubWeights[normalizeClubName(homeName)] ?? 0;
  const awayWeight = marqueeClubWeights[normalizeClubName(awayName)] ?? 0;
  if (homeWeight === 0 && awayWeight === 0) return 0;
  return clamp3(homeWeight * 0.022 + awayWeight * 0.03, 0, 0.075);
};
var getContextFromNames = (homeName, awayName) => {
  const directMatch = directRivalryMap.get(pairKey(homeName, awayName));
  const groupMatch = resolveGroupRivalry(homeName, awayName);
  const baseMatch = directMatch ?? groupMatch;
  const marqueeBoost = getMarqueeBoost(homeName, awayName);
  if (!baseMatch && marqueeBoost <= 0) {
    return {
      tier: "NONE",
      label: null,
      isRivalry: false,
      isDerby: false,
      attendanceBoost: 0,
      pressureBoost: 0,
      briefingBoost: 0,
      marqueeBoost: 0,
      minimumAttendancePct: 0
    };
  }
  return {
    tier: baseMatch?.tier ?? "NONE",
    label: baseMatch?.label ?? (marqueeBoost > 0 ? "HIT KOLEJKI" : null),
    isRivalry: Boolean(baseMatch),
    isDerby: baseMatch?.tier === "DERBY" || baseMatch?.tier === "CLASSIC",
    attendanceBoost: baseMatch?.attendanceBoost ?? 0,
    pressureBoost: baseMatch?.pressureBoost ?? 0,
    briefingBoost: baseMatch?.briefingBoost ?? 0,
    marqueeBoost,
    minimumAttendancePct: baseMatch?.minimumAttendancePct ?? 0
  };
};
var RivalryService = {
  normalizeClubName,
  getMatchContext(homeClub, awayClub) {
    return getContextFromNames(homeClub.name, awayClub.name);
  },
  getMatchContextByNames(homeClubName, awayClubName) {
    return getContextFromNames(homeClubName, awayClubName);
  },
  amplifyBriefingEffect(effect, rivalry) {
    if (!rivalry.isRivalry) return effect;
    const amp = 1 + rivalry.briefingBoost;
    const fatigueAmp = 1 + rivalry.briefingBoost * 0.8;
    return {
      ...effect,
      actionMod: clamp3(effect.actionMod * amp, -0.1, 0.12),
      goalMod: clamp3(effect.goalMod * amp, -0.09, 0.11),
      momentumBonus: Math.round(clamp3(effect.momentumBonus * amp, -36, 42)),
      fatigueMult: clamp3(1 + (effect.fatigueMult - 1) * fatigueAmp, 0.84, 1.18),
      rivalBoost: clamp3(effect.rivalBoost + rivalry.pressureBoost * 2.4, -0.1, 1),
      /**
       * Rivalry intensity makes repeated tactical habits easier to punish because both
       * staffs prepare harder and players are more emotionally keyed into known patterns.
       * The cap is deliberately low: this number is a direct chance-creation drag.
       */
      userActionSuppression: effect.userActionSuppression !== void 0 ? clamp3(effect.userActionSuppression * amp, 0, 0.024) : void 0,
      tacticalReadActionMod: effect.tacticalReadActionMod !== void 0 ? clamp3(effect.tacticalReadActionMod * amp, 0, 0.026) : void 0,
      tacticalReadGoalMod: effect.tacticalReadGoalMod !== void 0 ? clamp3(effect.tacticalReadGoalMod * amp, 0, 0.013) : void 0,
      tacticalReadMomentumBonus: effect.tacticalReadMomentumBonus !== void 0 ? Math.round(clamp3(effect.tacticalReadMomentumBonus * amp, 0, 13)) : void 0
    };
  }
};

// data/media_interviews_pl.ts
var INTERVIEW_POOL = {
  ["GAZETA_SPORTOWA" /* GAZETA_SPORTOWA */]: [
    {
      id: "GS_OBJECIE_01",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Co przekona\u0142o Pana do obj\u0119cia stanowiska trenera w {clubName} w\u0142a\u015Bnie teraz?"
      ],
      answers: [
        {
          id: "GS_OBJECIE_01_A1",
          text: "To klub z du\u017Cym potencja\u0142em i wierz\u0119, \u017Ce mo\u017Cemy wsp\xF3lnie osi\u0105gn\u0105\u0107 co\u015B wa\u017Cnego.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 2, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 3, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_01_A2",
          text: "Po rozmowach z zarz\u0105dem uzna\u0142em, \u017Ce wizja rozwoju klubu jest zgodna z moj\u0105 filozofi\u0105 pracy.",
          relationshipDelta: 3,
          score: { morale: 0, kibice: 1, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 1, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_01_A3",
          text: "Lubi\u0119 wyzwania, a {clubName} to projekt, kt\xF3ry bardzo mnie zainteresowa\u0142.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_01_A4",
          text: "Uzna\u0142em, \u017Ce to w\u0142a\u015Bciwy moment w mojej karierze na taki krok.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 1, zarzad: 1, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_01_A5",
          text: "Widz\u0119 w tej dru\u017Cynie jako\u015B\u0107 wi\u0119ksz\u0105 ni\u017C pokazuj\u0105 ostatnie wyniki.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 3, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "GS_OBJECIE_01_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: 0, kibice: -1, zarzad: -1, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "GS_OBJECIE_02",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jak ocenia Pan obecny potencja\u0142 kadry {clubName}?"
      ],
      answers: [
        {
          id: "GS_OBJECIE_02_A1",
          text: "Widz\u0119 sporo jako\u015Bci i wierz\u0119, \u017Ce ten zesp\xF3\u0142 mo\u017Ce osi\u0105ga\u0107 lepsze wyniki.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 3, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "GS_OBJECIE_02_A2",
          text: "Kadrowo mamy solidne fundamenty, ale oczywi\u015Bcie jest miejsce na popraw\u0119.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_02_A3",
          text: "To grupa z potencja\u0142em, cho\u0107 wymaga jeszcze du\u017Co pracy.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_02_A4",
          text: "Na pe\u0142n\u0105 ocen\u0119 przyjdzie czas po kilku tygodniach pracy z zespo\u0142em.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 0, zarzad: 1, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_02_A5",
          text: "Uwa\u017Cam, \u017Ce mo\u017Cliwo\u015Bci tej dru\u017Cyny s\u0105 wi\u0119ksze ni\u017C obecna sytuacja sugeruje.",
          relationshipDelta: 5,
          score: { morale: 3, kibice: 2, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 3, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "GS_OBJECIE_02_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: 0, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -2 }
        }
      ]
    },
    {
      id: "GS_OBJECIE_03",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "W\u0142odarze {clubName} oczekuj\u0105 od Pana {boardExpectations}. Czy uwa\u017Ca Pan te cele za realistyczne?"
      ],
      answers: [
        {
          id: "GS_OBJECIE_03_A1",
          text: "Tak, uwa\u017Cam, \u017Ce s\u0105 ambitne, ale mo\u017Cliwe do osi\u0105gni\u0119cia.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 2, realizm: 1, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 1, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_03_A2",
          text: "Ka\u017Cdy klub powinien mie\u0107 wysokie ambicje i nie boj\u0119 si\u0119 takich oczekiwa\u0144.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 3, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 3, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 1, ambicja: 3, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_03_A3",
          text: "Cele s\u0105 wymagaj\u0105ce, ale w\u0142a\u015Bnie dlatego podj\u0105\u0142em si\u0119 tej pracy.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_03_A4",
          text: "Najpierw skupmy si\u0119 na codziennej pracy \u2014 wyniki b\u0119d\u0105 jej efektem.",
          relationshipDelta: 2,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_03_A5",
          text: "Oczekiwania s\u0105 jasne i w pe\u0142ni je rozumiem.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 1, zarzad: 2, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_03_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: -2, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: -1, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "GS_OBJECIE_04",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jakim stylem gry chcia\u0142by Pan, aby wyr\xF3\u017Cnia\u0142 si\u0119 {clubName}?"
      ],
      answers: [
        {
          id: "GS_OBJECIE_04_A1",
          text: "Chc\u0119 dru\u017Cyny odwa\u017Cnej, dobrze zorganizowanej i graj\u0105cej intensywnie.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 3, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_04_A2",
          text: "Najwa\u017Cniejsza b\u0119dzie r\xF3wnowaga mi\u0119dzy skuteczno\u015Bci\u0105 a atrakcyjnym futbolem.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_04_A3",
          text: "Chc\u0119, aby kibice widzieli zesp\xF3\u0142 walcz\u0105cy od pierwszej do ostatniej minuty.",
          relationshipDelta: 5,
          score: { morale: 2, kibice: 3, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 2, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_04_A4",
          text: "Styl gry musi by\u0107 dopasowany do potencja\u0142u zawodnik\xF3w.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "GS_OBJECIE_04_A5",
          text: "Priorytetem b\u0119dzie skuteczno\u015B\u0107 \u2014 pi\u0119kna gra ma sens, je\u015Bli id\u0105 za ni\u0105 punkty.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 1, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_04_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -2, zarzad: 0, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "GS_OBJECIE_05",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Czy kibice mog\u0105 spodziewa\u0107 si\u0119 szybkich zmian w dru\u017Cynie?"
      ],
      answers: [
        {
          id: "GS_OBJECIE_05_A1",
          text: "Postaramy si\u0119 poprawi\u0107 kilka rzeczy mo\u017Cliwie szybko.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_05_A2",
          text: "Ka\u017Cda zmiana wymaga czasu, ale chcemy dzia\u0142a\u0107 od pierwszego dnia.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 1, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_05_A3",
          text: "Nie obiecuj\u0119 cud\xF3w z dnia na dzie\u0144, ale ci\u0119\u017Ck\u0105 prac\u0119 na pewno.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_05_A4",
          text: "Najwa\u017Cniejsza b\u0119dzie stabilizacja i stopniowy rozw\xF3j.",
          relationshipDelta: 2,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_05_A5",
          text: "Pierwsze efekty powinny by\u0107 widoczne stosunkowo szybko.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 3, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 3, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_05_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -2, zarzad: -1, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -3, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "GS_OBJECIE_06",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jak ocenia Pan prac\u0119 wykonan\u0105 przez {previousManager}?"
      ],
      answers: [
        {
          id: "GS_OBJECIE_06_A1",
          text: "Mam du\u017Cy szacunek do pracy mojego poprzednika.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 3, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: -1, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_06_A2",
          text: "Nie jestem tutaj, by ocenia\u0107 innych \u2014 skupiam si\u0119 na przysz\u0142o\u015Bci.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 3, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: -1, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_06_A3",
          text: "Ka\u017Cdy trener ma w\u0142asn\u0105 wizj\u0119 i teraz zaczyna si\u0119 nowy etap.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_06_A4",
          text: "Doceniam to, co zosta\u0142o zbudowane, ale chc\u0119 doda\u0107 co\u015B od siebie.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_06_A5",
          text: "Nie analizuj\u0119 przesz\u0142o\u015Bci \u2014 patrz\u0119 wy\u0142\u0105cznie do przodu.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 1, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_06_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: 0, kibice: -1, zarzad: -1, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "GS_OBJECIE_07",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jakie elementy wymagaj\u0105 natychmiastowej poprawy?"
      ],
      answers: [
        {
          id: "GS_OBJECIE_07_A1",
          text: "Organizacja gry i wi\u0119ksza konsekwencja.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_07_A2",
          text: "Mentalno\u015B\u0107 oraz pewno\u015B\u0107 siebie zespo\u0142u.",
          relationshipDelta: 3,
          score: { morale: 3, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 2, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "GS_OBJECIE_07_A3",
          text: "Kilka aspekt\xF3w taktycznych wymaga poprawy.",
          relationshipDelta: 2,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_07_A4",
          text: "Najpierw musz\u0119 lepiej pozna\u0107 dru\u017Cyn\u0119, zanim wydam jednoznaczn\u0105 ocen\u0119.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 0, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_07_A5",
          text: "Najwa\u017Cniejsze b\u0119dzie zwi\u0119kszenie regularno\u015Bci wynik\xF3w.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_07_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: -1, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "GS_OBJECIE_08",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Czy planuje Pan zmiany kadrowe lub transfery?"
      ],
      answers: [
        {
          id: "GS_OBJECIE_08_A1",
          text: "Analizujemy sytuacj\u0119 i b\u0119dziemy reagowa\u0107, je\u015Bli zajdzie potrzeba.",
          relationshipDelta: 3,
          score: { morale: 0, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_08_A2",
          text: "Jest za wcze\u015Bnie, by m\xF3wi\u0107 o konkretnych nazwiskach.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 1, zarzad: 1, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_08_A3",
          text: "Najpierw chc\u0119 dobrze pozna\u0107 obecnych zawodnik\xF3w.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "GS_OBJECIE_08_A4",
          text: "Ka\u017Cdy trener chce wzmacnia\u0107 dru\u017Cyn\u0119, ale decyzje musz\u0105 by\u0107 rozs\u0105dne.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_08_A5",
          text: "Transfery s\u0105 cz\u0119\u015Bci\u0105 futbolu, ale nie wszystko rozwi\u0105zuje rynek.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_08_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: -1, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "GS_OBJECIE_09",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Czy obecna kadra jest gotowa walczy\u0107 o {clubObjective}?"
      ],
      answers: [
        {
          id: "GS_OBJECIE_09_A1",
          text: "Uwa\u017Cam, \u017Ce mamy potencja\u0142, aby podj\u0105\u0107 tak\u0105 walk\u0119.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_09_A2",
          text: "To poka\u017Ce boisko, ale jestem optymist\u0105.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 3, realizm: 0, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_09_A3",
          text: "Mamy jako\u015B\u0107, jednak potrzebujemy stabilno\u015Bci.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_09_A4",
          text: "Najpierw chc\u0119 zobaczy\u0107 dru\u017Cyn\u0119 w treningu i meczach.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 0, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_09_A5",
          text: "Wierz\u0119, \u017Ce mo\u017Cemy pozytywnie zaskoczy\u0107.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 3, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 3, realizm: 0, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_09_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -2, zarzad: -2, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: -1, ambicja: -2, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "GS_OBJECIE_10",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jak wa\u017Cna b\u0119dzie rola {captainName} w Pana projekcie?"
      ],
      answers: [
        {
          id: "GS_OBJECIE_10_A1",
          text: "Kapitan odgrywa kluczow\u0105 rol\u0119 w budowie atmosfery.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "GS_OBJECIE_10_A2",
          text: "Liderzy w szatni s\u0105 bardzo wa\u017Cni dla ka\u017Cdego trenera.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "GS_OBJECIE_10_A3",
          text: "Rozmawia\u0142em ju\u017C z nim i licz\u0119 na jego wsparcie.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 3 }
        },
        {
          id: "GS_OBJECIE_10_A4",
          text: "Ka\u017Cdy zawodnik zaczyna od zera, ale do\u015Bwiadczenie zawsze ma znaczenie.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_10_A5",
          text: "Chc\u0119 silnej grupy lider\xF3w, nie tylko jednego nazwiska.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "GS_OBJECIE_10_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: 0, zarzad: 0, zawodnicy: -2 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -2 }
        }
      ]
    },
    {
      id: "GS_OBJECIE_11",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jak\u0105 rol\u0119 odegra m\u0142odzie\u017C i zawodnicy tacy jak {youngPlayer}?"
      ],
      answers: [
        {
          id: "GS_OBJECIE_11_A1",
          text: "Je\u015Bli kto\u015B zas\u0142u\u017Cy form\u0105, b\u0119dzie gra\u0142 niezale\u017Cnie od wieku.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "GS_OBJECIE_11_A2",
          text: "Akademia i m\u0142odzi zawodnicy s\u0105 bardzo wa\u017Cni dla rozwoju klubu.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 3, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 1, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "GS_OBJECIE_11_A3",
          text: "M\u0142odzi musz\u0105 by\u0107 gotowi sportowo, nie b\u0119dziemy nikogo wystawia\u0107 na si\u0142\u0119.",
          relationshipDelta: 2,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_11_A4",
          text: "Chc\u0119 stworzy\u0107 \u015Brodowisko, w kt\xF3rym m\u0142odzie\u017C mo\u017Ce si\u0119 rozwija\u0107.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "GS_OBJECIE_11_A5",
          text: "Drzwi s\u0105 otwarte dla ka\u017Cdego.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "GS_OBJECIE_11_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: 0, kibice: -1, zarzad: -1, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "GS_OBJECIE_12",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jak chce Pan odbudowa\u0107 zaufanie kibic\xF3w?"
      ],
      answers: [
        {
          id: "GS_OBJECIE_12_A1",
          text: "Najlepsz\u0105 odpowiedzi\u0105 b\u0119d\u0105 wyniki i zaanga\u017Cowanie dru\u017Cyny.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 3, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 2, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_12_A2",
          text: "Chc\u0119, aby kibice byli dumni z postawy zespo\u0142u.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 3, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 3, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_12_A3",
          text: "Rozumiem emocje kibic\xF3w i chcemy odzyska\u0107 ich zaufanie.",
          relationshipDelta: 5,
          score: { morale: 1, kibice: 3, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 3, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_12_A4",
          text: "Najpierw musimy pokaza\u0107 charakter na boisku.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_12_A5",
          text: "Kibice zas\u0142uguj\u0105 na dru\u017Cyn\u0119 walcz\u0105c\u0105 w ka\u017Cdym meczu.",
          relationshipDelta: 5,
          score: { morale: 2, kibice: 3, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 3, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_12_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -3, zarzad: 0, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -3, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "GS_OBJECIE_13",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jak wa\u017Cna b\u0119dzie dyscyplina w szatni?"
      ],
      answers: [
        {
          id: "GS_OBJECIE_13_A1",
          text: "Dyscyplina to fundament ka\u017Cdej dobrze funkcjonuj\u0105cej dru\u017Cyny.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 2, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_13_A2",
          text: "Ka\u017Cdy b\u0119dzie zna\u0142 swoje obowi\u0105zki.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 1, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 2, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_13_A3",
          text: "Szacunek i profesjonalizm s\u0105 dla mnie bardzo wa\u017Cne.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_13_A4",
          text: "Wymagam du\u017Co, ale r\xF3wnie du\u017Co daj\u0119 od siebie.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 1, zarzad: 2, zawodnicy: 3 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 2, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 1, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "GS_OBJECIE_13_A5",
          text: "Najwa\u017Cniejsza jest odpowiedzialno\u015B\u0107 za zesp\xF3\u0142.",
          relationshipDelta: 3,
          score: { morale: 3, kibice: 1, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "GS_OBJECIE_13_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -2, kibice: -1, zarzad: -1, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -2 }
        }
      ]
    },
    {
      id: "GS_OBJECIE_14",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Po czym poznamy za kilka miesi\u0119cy, \u017Ce {clubName} idzie w dobr\u0105 stron\u0119?"
      ],
      answers: [
        {
          id: "GS_OBJECIE_14_A1",
          text: "Po regularno\u015Bci wynik\xF3w i stylu gry.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 2, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_14_A2",
          text: "Po wi\u0119kszej pewno\u015Bci siebie dru\u017Cyny.",
          relationshipDelta: 3,
          score: { morale: 3, kibice: 2, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "GS_OBJECIE_14_A3",
          text: "Po tym, \u017Ce kibice zn\xF3w b\u0119d\u0105 wierzy\u0107 w ten zesp\xF3\u0142.",
          relationshipDelta: 5,
          score: { morale: 1, kibice: 3, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 3, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_14_A4",
          text: "Po rozwoju indywidualnym zawodnik\xF3w.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "GS_OBJECIE_14_A5",
          text: "Po miejscu w tabeli \u2014 futbol ostatecznie rozlicza wyniki.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 1, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_14_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: 0, kibice: -1, zarzad: -1, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "GS_OBJECIE_15",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jakie s\u0105 Pana pierwsze cele na najbli\u017Csze tygodnie?"
      ],
      answers: [
        {
          id: "GS_OBJECIE_15_A1",
          text: "Dobrze pozna\u0107 dru\u017Cyn\u0119 i ustabilizowa\u0107 wyniki.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "GS_OBJECIE_15_A2",
          text: "Wprowadzi\u0107 jasne zasady pracy i poprawi\u0107 organizacj\u0119 gry.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_15_A3",
          text: "Zbudowa\u0107 odpowiedni\u0105 mentalno\u015B\u0107 w zespole.",
          relationshipDelta: 3,
          score: { morale: 3, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "GS_OBJECIE_15_A4",
          text: "Przygotowa\u0107 dru\u017Cyn\u0119 do realizacji {clubObjective}.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 1, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_15_A5",
          text: "Krok po kroku budowa\u0107 co\u015B trwa\u0142ego.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "GS_OBJECIE_15_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: -1, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    }
  ],
  ["DWIE_BRAMKI" /* DWIE_BRAMKI */]: [
    {
      id: "DB_OBJECIE_01",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Wielu uwa\u017Ca, \u017Ce obejmuje Pan bardzo wymagaj\u0105cy projekt. Dlaczego zdecydowa\u0142 si\u0119 Pan przyj\u0105\u0107 ofert\u0119 {clubName}?"
      ],
      answers: [
        {
          id: "DB_OBJECIE_01_A1",
          text: "Widz\u0119 w tym klubie du\u017Cy potencja\u0142 i chc\u0119 by\u0107 cz\u0119\u015Bci\u0105 czego\u015B ambitnego.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 2, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_01_A2",
          text: "Lubi\u0119 wyzwania i wierz\u0119, \u017Ce wsp\xF3lnie mo\u017Cemy osi\u0105gn\u0105\u0107 dobre rzeczy.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_01_A3",
          text: "Rozmowy z zarz\u0105dem przekona\u0142y mnie, \u017Ce to w\u0142a\u015Bciwe miejsce dla mnie.",
          relationshipDelta: 3,
          score: { morale: 0, kibice: 1, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 1, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_01_A4",
          text: "Uzna\u0142em, \u017Ce to odpowiedni moment w mojej karierze na taki krok.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 1, zarzad: 1, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_01_A5",
          text: "To klub z ambicjami, a takie projekty zawsze mnie interesowa\u0142y.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 2, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_01_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: 0, kibice: -1, zarzad: -1, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "DB_OBJECIE_02",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "W\u0142odarze {clubName} oczekuj\u0105 od Pana {boardExpectations}. Czy nie uwa\u017Ca Pan, \u017Ce to du\u017Ca presja ju\u017C od pierwszego dnia?"
      ],
      answers: [
        {
          id: "DB_OBJECIE_02_A1",
          text: "W takim klubie wysokie oczekiwania s\u0105 czym\u015B naturalnym.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 1, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_02_A2",
          text: "Presja jest cz\u0119\u015Bci\u0105 pracy trenera i jestem na ni\u0105 gotowy.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 3, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_02_A3",
          text: "Cele s\u0105 ambitne, ale wierz\u0119, \u017Ce mo\u017Cemy je osi\u0105gn\u0105\u0107.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 1, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_02_A4",
          text: "Najpierw skupmy si\u0119 na codziennej pracy \u2014 wyniki przyjd\u0105 z czasem.",
          relationshipDelta: 2,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_02_A5",
          text: "Nie obawiam si\u0119 oczekiwa\u0144, bo w\u0142a\u015Bnie dla takich wyzwa\u0144 pracuje si\u0119 w futbolu.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 3, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 1, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_02_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: -2, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: -1, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "DB_OBJECIE_03",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Kibice maj\u0105 du\u017Ce oczekiwania przed nowym sezonem. Co chcia\u0142by im Pan powiedzie\u0107 ju\u017C dzi\u015B?"
      ],
      answers: [
        {
          id: "DB_OBJECIE_03_A1",
          text: "Chcemy stworzy\u0107 dru\u017Cyn\u0119, z kt\xF3rej kibice b\u0119d\u0105 dumni.",
          relationshipDelta: 5,
          score: { morale: 1, kibice: 3, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 3, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_03_A2",
          text: "Nie b\u0119d\u0119 sk\u0142ada\u0142 wielkich obietnic, ale gwarantuj\u0119 ci\u0119\u017Ck\u0105 prac\u0119.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_03_A3",
          text: "Potrzebujemy wsparcia kibic\xF3w \u2014 razem mo\u017Cemy osi\u0105gn\u0105\u0107 wi\u0119cej.",
          relationshipDelta: 5,
          score: { morale: 2, kibice: 3, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 3, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_03_A4",
          text: "Nowy sezon to nowy pocz\u0105tek dla wszystkich.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_03_A5",
          text: "Chcemy, aby {clubName} kojarzy\u0142 si\u0119 z walk\u0105 i zaanga\u017Cowaniem.",
          relationshipDelta: 5,
          score: { morale: 2, kibice: 3, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 2, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_03_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -3, zarzad: 0, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -3, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "DB_OBJECIE_04",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        'Czy s\u0105 zawodnicy, kt\xF3rzy ju\u017C dzi\u015B mog\u0105 czu\u0107, \u017Ce zaczynaj\u0105 z \u201Eczyst\u0105 kart\u0105"?'
      ],
      answers: [
        {
          id: "DB_OBJECIE_04_A1",
          text: "Ka\u017Cdy zawodnik dostanie swoj\u0105 szans\u0119.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "DB_OBJECIE_04_A2",
          text: "Nie interesuje mnie przesz\u0142o\u015B\u0107 \u2014 liczy si\u0119 to, co kto\u015B poka\u017Ce teraz.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "DB_OBJECIE_04_A3",
          text: "Wszyscy zaczynaj\u0105 od zera i b\u0119d\u0105 oceniani uczciwie.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "DB_OBJECIE_04_A4",
          text: "Najwa\u017Cniejsza b\u0119dzie forma i podej\u015Bcie do pracy.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_04_A5",
          text: "Ka\u017Cdy b\u0119dzie mia\u0142 mo\u017Cliwo\u015B\u0107 pokazania swojej warto\u015Bci.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "DB_OBJECIE_04_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: 0, zarzad: 0, zawodnicy: -2 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -2 }
        }
      ]
    },
    {
      id: "DB_OBJECIE_05",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Czy zamierza Pan budowa\u0107 zesp\xF3\u0142 wok\xF3\u0142 {starPlayer}, czy wszyscy b\u0119d\u0105 mieli r\xF3wne szanse?"
      ],
      answers: [
        {
          id: "DB_OBJECIE_05_A1",
          text: "Ka\u017Cdy zawodnik jest wa\u017Cny, ale liderzy zawsze maj\u0105 szczeg\xF3ln\u0105 rol\u0119.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_05_A2",
          text: "Nie buduj\u0119 zespo\u0142u wok\xF3\u0142 jednego nazwiska.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "DB_OBJECIE_05_A3",
          text: "Je\u015Bli kto\u015B ma jako\u015B\u0107, naturalnie stanie si\u0119 wa\u017Cn\u0105 postaci\u0105 dru\u017Cyny.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_05_A4",
          text: "Najwa\u017Cniejszy b\u0119dzie kolektyw i wsp\xF3lna odpowiedzialno\u015B\u0107.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "DB_OBJECIE_05_A5",
          text: "Boisko poka\u017Ce, kto b\u0119dzie liderem zespo\u0142u.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_05_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: 0, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "DB_OBJECIE_06",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Niekt\xF3rzy eksperci twierdz\u0105, \u017Ce {clubName} potrzebuje du\u017Cych zmian. Podziela Pan t\u0119 opini\u0119?"
      ],
      answers: [
        {
          id: "DB_OBJECIE_06_A1",
          text: "Ka\u017Cdy trener wnosi w\u0142asn\u0105 wizj\u0119 i pewne zmiany s\u0105 naturalne.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_06_A2",
          text: "Najpierw chc\u0119 dobrze pozna\u0107 dru\u017Cyn\u0119, zanim wyci\u0105gn\u0119 takie wnioski.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 0, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_06_A3",
          text: "Nie zawsze potrzebna jest rewolucja \u2014 czasem wystarcz\u0105 dobre decyzje.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_06_A4",
          text: "Na pewno b\u0119dziemy pracowa\u0107 nad popraw\u0105 kilku element\xF3w.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_06_A5",
          text: "Najwa\u017Cniejsze jest znalezienie odpowiedniego balansu.",
          relationshipDelta: 2,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_06_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: -1, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "DB_OBJECIE_07",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jak chce Pan przekona\u0107 kibic\xF3w, \u017Ce to w\u0142a\u015Bnie Pan jest odpowiednim trenerem dla {clubName}?"
      ],
      answers: [
        {
          id: "DB_OBJECIE_07_A1",
          text: "Prac\u0105 i wynikami \u2014 to najlepsza odpowied\u017A.",
          relationshipDelta: 5,
          score: { morale: 2, kibice: 3, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 2, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_07_A2",
          text: "Kibice maj\u0105 prawo ocenia\u0107, ale potrzebujemy troch\u0119 czasu.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_07_A3",
          text: "Chc\u0119, aby dru\u017Cyna pokazywa\u0142a charakter od pierwszego meczu.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 3, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 2, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_07_A4",
          text: "Nie zamierzam du\u017Co m\xF3wi\u0107 \u2014 wol\u0119 dzia\u0142a\u0107.",
          relationshipDelta: 5,
          score: { morale: 2, kibice: 3, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 3, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 2, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_07_A5",
          text: "Mam \u015Bwiadomo\u015B\u0107 odpowiedzialno\u015Bci i zrobi\u0119 wszystko dla dobra klubu.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
        },
        {
          id: "DB_OBJECIE_07_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -3, zarzad: -1, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -3, zaufanieSzatni: -1 }
        }
      ]
    }
  ],
  ["PILKA_NOZNA" /* PILKA_NOZNA */]: [
    {
      id: "PN_OBJECIE_01",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jakie by\u0142y Pana pierwsze wnioski po analizie zespo\u0142u {clubName}?"
      ],
      answers: [
        {
          id: "PN_OBJECIE_01_A1",
          text: "Widz\u0119 dru\u017Cyn\u0119 z du\u017Cym potencja\u0142em, ale tak\u017Ce kilka obszar\xF3w wymagaj\u0105cych poprawy.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_01_A2",
          text: "To zesp\xF3\u0142, kt\xF3ry ma swoje mocne strony i chcemy je jeszcze bardziej rozwin\u0105\u0107.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "PN_OBJECIE_01_A3",
          text: "Pierwsze analizy by\u0142y pozytywne, ale prawdziwa ocena przyjdzie po treningach.",
          relationshipDelta: 3,
          score: { morale: 0, kibice: 0, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_01_A4",
          text: "Potrzebuj\u0119 jeszcze czasu, by dok\u0142adnie pozna\u0107 wszystkich zawodnik\xF3w.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 0, zarzad: 1, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_01_A5",
          text: "Widz\u0119 fundament, na kt\xF3rym mo\u017Cna budowa\u0107 co\u015B warto\u015Bciowego.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 2, realizm: 1, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_01_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: -1, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "PN_OBJECIE_02",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "W\u0142odarze {clubName} oczekuj\u0105 od Pana {boardExpectations}. Jak zamierza Pan prze\u0142o\u017Cy\u0107 te cele na codzienn\u0105 prac\u0119 zespo\u0142u?"
      ],
      answers: [
        {
          id: "PN_OBJECIE_02_A1",
          text: "Najwa\u017Cniejsza b\u0119dzie konsekwencja i dobrze zaplanowany proces.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 1, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 1, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_02_A2",
          text: "Du\u017Ce cele osi\u0105ga si\u0119 ma\u0142ymi krokami ka\u017Cdego dnia.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 1, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_02_A3",
          text: "Skupimy si\u0119 na poprawie jako\u015Bci gry i organizacji zespo\u0142u.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_02_A4",
          text: "Najpierw chcemy stworzy\u0107 odpowiednie fundamenty pod wyniki.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_02_A5",
          text: "Oczekiwania s\u0105 jasne i b\u0119dziemy robi\u0107 wszystko, aby im sprosta\u0107.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 2, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_02_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: -2, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: -1, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "PN_OBJECIE_03",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Czy kibice mog\u0105 spodziewa\u0107 si\u0119 zmiany stylu gry wzgl\u0119dem poprzedniego sezonu?"
      ],
      answers: [
        {
          id: "PN_OBJECIE_03_A1",
          text: "Ka\u017Cdy trener wnosi w\u0142asne pomys\u0142y i pewne zmiany na pewno b\u0119d\u0105 widoczne.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_03_A2",
          text: "Styl gry musi pasowa\u0107 do charakterystyki zawodnik\xF3w.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "PN_OBJECIE_03_A3",
          text: "Chcemy gra\u0107 nowocze\u015Bnie i skutecznie.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 2, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_03_A4",
          text: "Najwa\u017Cniejsze b\u0119dzie znalezienie odpowiedniego balansu.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_03_A5",
          text: "Priorytetem b\u0119d\u0105 wyniki, ale chcemy te\u017C gra\u0107 futbol atrakcyjny dla kibic\xF3w.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 2, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_03_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -2, zarzad: -1, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "PN_OBJECIE_04",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jak wa\u017Cn\u0105 rol\u0119 w Pana projekcie odegraj\u0105 zawodnicy m\u0142odzi, tacy jak {youngPlayer}?"
      ],
      answers: [
        {
          id: "PN_OBJECIE_04_A1",
          text: "Je\u015Bli kto\u015B prezentuje odpowiedni poziom, wiek nie ma znaczenia.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "PN_OBJECIE_04_A2",
          text: "Akademia i rozw\xF3j m\u0142odych zawodnik\xF3w s\u0105 bardzo wa\u017Cne.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 3, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 1, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_04_A3",
          text: "M\u0142odzi musz\u0105 zas\u0142u\u017Cy\u0107 na miejsce, ale szanse na pewno dostan\u0105.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_04_A4",
          text: "Chcemy budowa\u0107 zdrow\u0105 rywalizacj\u0119 niezale\u017Cnie od wieku.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "PN_OBJECIE_04_A5",
          text: "Drzwi do pierwszego sk\u0142adu s\u0105 otwarte dla ka\u017Cdego.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "PN_OBJECIE_04_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: 0, kibice: -1, zarzad: -1, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "PN_OBJECIE_05",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Czy obecna kadra zosta\u0142a zbudowana pod styl gry, kt\xF3ry Pan preferuje?"
      ],
      answers: [
        {
          id: "PN_OBJECIE_05_A1",
          text: "Ka\u017Cdy trener ma w\u0142asne wymagania, ale widz\u0119 tu spory potencja\u0142.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_05_A2",
          text: "To zbyt wcze\u015Bnie na jednoznaczn\u0105 ocen\u0119.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 0, zarzad: 1, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_05_A3",
          text: "B\u0119dziemy pracowa\u0107 nad maksymalnym wykorzystaniem mo\u017Cliwo\u015Bci obecnych zawodnik\xF3w.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "PN_OBJECIE_05_A4",
          text: "Kadry nigdy nie buduje si\u0119 idealnie pod jednego cz\u0142owieka.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_05_A5",
          text: "Z czasem zobaczymy, czy potrzebne b\u0119d\u0105 korekty.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 0, zarzad: 1, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_05_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: -1, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "PN_OBJECIE_06",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jak\u0105 rol\u0119 odegra {captainName} w budowie nowego {clubName}?"
      ],
      answers: [
        {
          id: "PN_OBJECIE_06_A1",
          text: "Kapitan jest bardzo wa\u017Cnym ogniwem ka\u017Cdej dru\u017Cyny.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "PN_OBJECIE_06_A2",
          text: "Liderzy szatni zawsze odgrywaj\u0105 istotn\u0105 rol\u0119.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "PN_OBJECIE_06_A3",
          text: "Rozmawia\u0142em ju\u017C z nim i licz\u0119 na jego do\u015Bwiadczenie.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 3 }
        },
        {
          id: "PN_OBJECIE_06_A4",
          text: "Ka\u017Cdy lider musi dawa\u0107 przyk\u0142ad codzienn\u0105 prac\u0105.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "PN_OBJECIE_06_A5",
          text: "Chc\u0119 mie\u0107 siln\u0105 grup\u0119 lider\xF3w, nie tylko jedn\u0105 osob\u0119.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "PN_OBJECIE_06_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: 0, zarzad: 0, zawodnicy: -2 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -2 }
        }
      ]
    },
    {
      id: "PN_OBJECIE_07",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jak zdefiniowa\u0142by Pan sukces pierwszych miesi\u0119cy pracy w {clubName}?"
      ],
      answers: [
        {
          id: "PN_OBJECIE_07_A1",
          text: "Regularna poprawa jako\u015Bci gry i wynik\xF3w.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 2, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_07_A2",
          text: "Zbudowanie dobrze funkcjonuj\u0105cego zespo\u0142u.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 1, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "PN_OBJECIE_07_A3",
          text: "Widoczny rozw\xF3j dru\u017Cyny z meczu na mecz.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 2, realizm: 1, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_07_A4",
          text: "Stworzenie odpowiedniej mentalno\u015Bci i organizacji.",
          relationshipDelta: 3,
          score: { morale: 3, kibice: 1, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "PN_OBJECIE_07_A5",
          text: "Realizacja pierwszych cel\xF3w, kt\xF3re wyznaczyli\u015Bmy sobie jako klub.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 2, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "PN_OBJECIE_07_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: -2, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: -1, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    }
  ],
  ["FUTBOL_NAD_WISLA" /* FUTBOL_NAD_WISLA */]: [
    {
      id: "FNW_OBJECIE_01",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jakie emocje towarzysz\u0105 Panu przy obj\u0119ciu stanowiska trenera {clubName}?"
      ],
      answers: [
        {
          id: "FNW_OBJECIE_01_A1",
          text: "To dla mnie du\u017Ce wyr\xF3\u017Cnienie i ogromna motywacja.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_01_A2",
          text: "Czuj\u0119 ekscytacj\u0119, ale te\u017C du\u017C\u0105 odpowiedzialno\u015B\u0107.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 2, realizm: 1, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_01_A3",
          text: "Jestem bardzo zmotywowany, aby rozpocz\u0105\u0107 prac\u0119.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_01_A4",
          text: "To wa\u017Cny moment w mojej karierze.",
          relationshipDelta: 2,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_01_A5",
          text: "Wchodz\u0119 w ten projekt z du\u017C\u0105 energi\u0105 i wiar\u0105.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 3, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_01_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: -1, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "FNW_OBJECIE_02",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "W\u0142odarze {clubName} oczekuj\u0105 od Pana {boardExpectations}. Jak chce Pan odpowiedzie\u0107 na te oczekiwania?"
      ],
      answers: [
        {
          id: "FNW_OBJECIE_02_A1",
          text: "Ci\u0119\u017Ck\u0105 prac\u0105 i konsekwencj\u0105 ka\u017Cdego dnia.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_02_A2",
          text: "Cele s\u0105 ambitne, ale po to tu jestem.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 1, ambicja: 3, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_02_A3",
          text: "Najpierw chcemy stworzy\u0107 dobrze funkcjonuj\u0105cy zesp\xF3\u0142.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "FNW_OBJECIE_02_A4",
          text: "Zdaj\u0119 sobie spraw\u0119 z odpowiedzialno\u015Bci i nie uciekam od niej.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_02_A5",
          text: "W futbolu wszystko trzeba wypracowa\u0107 na boisku.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_02_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: -2, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: -1, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "FNW_OBJECIE_03",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jak wa\u017Cna b\u0119dzie dla Pana relacja z kibicami {clubName}?"
      ],
      answers: [
        {
          id: "FNW_OBJECIE_03_A1",
          text: "Kibice s\u0105 sercem ka\u017Cdego klubu i chcemy gra\u0107 r\xF3wnie\u017C dla nich.",
          relationshipDelta: 5,
          score: { morale: 1, kibice: 3, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 3, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_03_A2",
          text: "Relacja z kibicami jest bardzo wa\u017Cna \u2014 chcemy budowa\u0107 co\u015B razem.",
          relationshipDelta: 5,
          score: { morale: 1, kibice: 3, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 3, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_03_A3",
          text: "Najlepszy kontakt z kibicami buduje si\u0119 postaw\u0105 na boisku.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 2, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_03_A4",
          text: "Liczymy na wsparcie od pierwszego meczu sezonu.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 3, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 2, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_03_A5",
          text: "Chcemy stworzy\u0107 dru\u017Cyn\u0119, z kt\xF3r\u0105 kibice b\u0119d\u0105 si\u0119 uto\u017Csamia\u0107.",
          relationshipDelta: 5,
          score: { morale: 1, kibice: 3, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 3, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_03_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -3, zarzad: 0, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -3, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "FNW_OBJECIE_04",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Czy planuje Pan mocniej postawi\u0107 na wychowank\xF3w i zawodnik\xF3w zwi\u0105zanych z klubem?"
      ],
      answers: [
        {
          id: "FNW_OBJECIE_04_A1",
          text: "Je\u015Bli kto\u015B b\u0119dzie gotowy sportowo, dostanie swoj\u0105 szans\u0119.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "FNW_OBJECIE_04_A2",
          text: "Akademia jest bardzo wa\u017Cnym elementem przysz\u0142o\u015Bci klubu.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 2, zarzad: 3, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 1, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_04_A3",
          text: "Nie patrz\u0119 na nazwiska \u2014 liczy si\u0119 jako\u015B\u0107.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_04_A4",
          text: "M\u0142odzi zawodnicy musz\u0105 czu\u0107, \u017Ce droga do pierwszej dru\u017Cyny istnieje.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "FNW_OBJECIE_04_A5",
          text: "Ka\u017Cdy b\u0119dzie oceniany sprawiedliwie.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_04_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: 0, kibice: -1, zarzad: -1, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "FNW_OBJECIE_05",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Co chcia\u0142by Pan zmieni\u0107 w mentalno\u015Bci dru\u017Cyny ju\u017C od pierwszych tygodni?"
      ],
      answers: [
        {
          id: "FNW_OBJECIE_05_A1",
          text: "Chc\u0119 zespo\u0142u pewnego siebie i odpowiedzialnego.",
          relationshipDelta: 4,
          score: { morale: 3, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_05_A2",
          text: "Najwa\u017Cniejsza b\u0119dzie wiara we w\u0142asne mo\u017Cliwo\u015Bci.",
          relationshipDelta: 4,
          score: { morale: 3, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 3, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_05_A3",
          text: "Chcemy stworzy\u0107 mentalno\u015B\u0107 zwyci\u0119zc\xF3w.",
          relationshipDelta: 5,
          score: { morale: 3, kibice: 2, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 3, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 3, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_05_A4",
          text: "Liczy si\u0119 charakter, szczeg\xF3lnie w trudnych momentach.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_05_A5",
          text: "Najwa\u017Cniejsza b\u0119dzie konsekwencja i odpowiedzialno\u015B\u0107.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 1, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_05_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -2, kibice: -1, zarzad: -1, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -2 }
        }
      ]
    },
    {
      id: "FNW_OBJECIE_06",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jak wa\u017Cne dla Pana b\u0119d\u0105 mecze z rywalami, takimi jak {rivalClub}?"
      ],
      answers: [
        {
          id: "FNW_OBJECIE_06_A1",
          text: "Ka\u017Cdy mecz jest wa\u017Cny, ale rozumiem znaczenie takich spotka\u0144 dla kibic\xF3w.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 3, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 2, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_06_A2",
          text: "Derby czy mecze z rywalami zawsze maj\u0105 wyj\u0105tkowy charakter.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 3, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 2, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_06_A3",
          text: "Chcemy by\u0107 konkurencyjni w ka\u017Cdym spotkaniu.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_06_A4",
          text: "Rozumiem emocje zwi\u0105zane z takimi meczami.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_06_A5",
          text: "Najpierw skupiamy si\u0119 na budowie zespo\u0142u, ale takie mecze zawsze maj\u0105 wag\u0119.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_06_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -2, zarzad: 0, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "FNW_OBJECIE_07",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jak przebieg\u0142o pierwsze spotkanie z dru\u017Cyn\u0105?"
      ],
      answers: [
        {
          id: "FNW_OBJECIE_07_A1",
          text: "By\u0142o bardzo pozytywne i pe\u0142ne dobrej energii.",
          relationshipDelta: 5,
          score: { morale: 3, kibice: 1, zarzad: 1, zawodnicy: 3 },
          profileScore: { optymizm: 3, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "FNW_OBJECIE_07_A2",
          text: "Rozmawiali\u015Bmy o celach i zasadach pracy.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "FNW_OBJECIE_07_A3",
          text: "To dopiero pocz\u0105tek, ale widz\u0119 dobre nastawienie.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "FNW_OBJECIE_07_A4",
          text: "Najwa\u017Cniejsze by\u0142o wzajemne poznanie i pierwsze rozmowy.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_07_A5",
          text: "Mam dobre pierwsze wra\u017Cenia po spotkaniu z zespo\u0142em.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "FNW_OBJECIE_07_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -2, kibice: -1, zarzad: -1, zawodnicy: -2 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -2 }
        }
      ]
    },
    {
      id: "FNW_OBJECIE_08",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Co chcia\u0142by Pan, aby kibice m\xF3wili o {clubName} za kilka miesi\u0119cy?"
      ],
      answers: [
        {
          id: "FNW_OBJECIE_08_A1",
          text: "\u017Be widz\u0105 dru\u017Cyn\u0119 walcz\u0105c\u0105 w ka\u017Cdym meczu.",
          relationshipDelta: 5,
          score: { morale: 2, kibice: 3, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 2, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_08_A2",
          text: "\u017Be zesp\xF3\u0142 zrobi\u0142 wyra\u017Any krok do przodu.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_08_A3",
          text: "\u017Be mog\u0105 by\u0107 dumni z postawy dru\u017Cyny.",
          relationshipDelta: 5,
          score: { morale: 1, kibice: 3, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 3, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_08_A4",
          text: "\u017Be {clubName} zn\xF3w ma charakter i to\u017Csamo\u015B\u0107.",
          relationshipDelta: 5,
          score: { morale: 2, kibice: 3, zarzad: 2, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 3, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_08_A5",
          text: "\u017Be warto przychodzi\u0107 na stadion i wspiera\u0107 ten zesp\xF3\u0142.",
          relationshipDelta: 5,
          score: { morale: 1, kibice: 3, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 3, zaufanieSzatni: 0 }
        },
        {
          id: "FNW_OBJECIE_08_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -3, zarzad: -1, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -3, zaufanieSzatni: -1 }
        }
      ]
    }
  ],
  ["DZIENNIK_SPORTOWY" /* DZIENNIK_SPORTOWY */]: [
    {
      id: "DS_OBJECIE_01",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Wielu ekspert\xF3w uwa\u017Ca, \u017Ce obejmuje Pan bardzo trudny projekt. Czy nie obawia si\u0119 Pan pora\u017Cki?"
      ],
      answers: [
        {
          id: "DS_OBJECIE_01_A1",
          text: "W futbolu nie mo\u017Cna ba\u0107 si\u0119 wyzwa\u0144.",
          relationshipDelta: 5,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 3, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_01_A2",
          text: "Ka\u017Cdy projekt niesie ryzyko, ale wierz\u0119 w t\u0119 dru\u017Cyn\u0119.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 1, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_01_A3",
          text: "Skupiam si\u0119 na pracy, nie na czarnych scenariuszach.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_01_A4",
          text: "Presja jest cz\u0119\u015Bci\u0105 tego zawodu i trzeba umie\u0107 z ni\u0105 \u017Cy\u0107.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_01_A5",
          text: "Przychodz\u0119 tutaj z przekonaniem, \u017Ce mo\u017Cemy osi\u0105gn\u0105\u0107 dobre rzeczy.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_01_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -2, kibice: -2, zarzad: -1, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "DS_OBJECIE_02",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "W\u0142odarze {clubName} oczekuj\u0105 od Pana {boardExpectations}. Co je\u015Bli sezon nie p\xF3jdzie zgodnie z planem?"
      ],
      answers: [
        {
          id: "DS_OBJECIE_02_A1",
          text: "W futbolu wszyscy jeste\u015Bmy rozliczani z wynik\xF3w.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 1, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_02_A2",
          text: "Najpierw skupmy si\u0119 na pracy, a p\xF3\u017Aniej oceniajmy efekty.",
          relationshipDelta: 2,
          score: { morale: 1, kibice: 0, zarzad: 1, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_02_A3",
          text: "Mam \u015Bwiadomo\u015B\u0107 odpowiedzialno\u015Bci, jaka wi\u0105\u017Ce si\u0119 z tym stanowiskiem.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 1, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_02_A4",
          text: "Nie wybiegam tak daleko w przysz\u0142o\u015B\u0107.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 0, zarzad: 1, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_02_A5",
          text: "Zrobimy wszystko, aby zrealizowa\u0107 wyznaczone cele.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 2, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 2, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_02_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: -2, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: -2, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "DS_OBJECIE_03",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Czy dosta\u0142 Pan od zarz\u0105du odpowiednie wsparcie i bud\u017Cet, by zbudowa\u0107 zesp\xF3\u0142 wed\u0142ug w\u0142asnej wizji?"
      ],
      answers: [
        {
          id: "DS_OBJECIE_03_A1",
          text: "Rozmowy z zarz\u0105dem by\u0142y bardzo konkretne i konstruktywne.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 1, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 1, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_03_A2",
          text: "Jeste\u015Bmy zgodni co do kierunku rozwoju dru\u017Cyny.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 1, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 2, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_03_A3",
          text: "Ka\u017Cdy klub dzia\u0142a w okre\u015Blonych realiach finansowych.",
          relationshipDelta: 3,
          score: { morale: 0, kibice: 1, zarzad: 2, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_03_A4",
          text: "Najpierw chc\u0119 dobrze pozna\u0107 obecn\u0105 kadr\u0119.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 0, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "DS_OBJECIE_03_A5",
          text: "B\u0119dziemy podejmowa\u0107 rozs\u0105dne decyzje.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 0, zarzad: 1, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_03_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: 0, kibice: -1, zarzad: -2, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: -2, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "DS_OBJECIE_04",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        'Czy kibice zobacz\u0105 \u201Enowy {clubName}" ju\u017C od pierwszego meczu sezonu?'
      ],
      answers: [
        {
          id: "DS_OBJECIE_04_A1",
          text: "Chcemy, aby pierwsze zmiany by\u0142y widoczne mo\u017Cliwie szybko.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_04_A2",
          text: "Ka\u017Cdy proces wymaga czasu, ale b\u0119dziemy ci\u0119\u017Cko pracowa\u0107.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_04_A3",
          text: "Nie obiecuj\u0119 rewolucji od pierwszego dnia.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_04_A4",
          text: "Najwa\u017Cniejsze b\u0119dzie stworzenie stabilnych fundament\xF3w.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_04_A5",
          text: "Mam nadziej\u0119, \u017Ce kibice szybko zauwa\u017C\u0105 odpowiedni\u0105 energi\u0119 w zespole.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_04_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -2, zarzad: -1, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -3, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "DS_OBJECIE_05",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Czy {starPlayer} b\u0119dzie centraln\u0105 postaci\u0105 Pana projektu?"
      ],
      answers: [
        {
          id: "DS_OBJECIE_05_A1",
          text: "Ka\u017Cdy dobry zawodnik jest wa\u017Cny dla zespo\u0142u.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "DS_OBJECIE_05_A2",
          text: "Nie budujemy dru\u017Cyny wok\xF3\u0142 jednej osoby.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "DS_OBJECIE_05_A3",
          text: "Liderzy s\u0105 istotni, ale najwa\u017Cniejszy jest kolektyw.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "DS_OBJECIE_05_A4",
          text: "Ka\u017Cdy zawodnik b\u0119dzie mia\u0142 swoj\u0105 rol\u0119.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "DS_OBJECIE_05_A5",
          text: "Boisko poka\u017Ce, kto stanie si\u0119 liderem tego zespo\u0142u.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 2, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "DS_OBJECIE_05_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: 0, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -2 }
        }
      ]
    },
    {
      id: "DS_OBJECIE_06",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Czy planuje Pan sprowadzi\u0107 zawodnik\xF3w, kt\xF3rych zna Pan z poprzednich klub\xF3w?"
      ],
      answers: [
        {
          id: "DS_OBJECIE_06_A1",
          text: "Za wcze\u015Bnie na takie rozmowy.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 0, zarzad: 1, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_06_A2",
          text: "Najpierw chc\u0119 oceni\u0107 obecnych pi\u0142karzy.",
          relationshipDelta: 3,
          score: { morale: 0, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "DS_OBJECIE_06_A3",
          text: "Transfery zawsze zale\u017C\u0105 od wielu czynnik\xF3w.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 0, zarzad: 1, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_06_A4",
          text: "Je\u015Bli zajdzie potrzeba, b\u0119dziemy analizowa\u0107 r\xF3\u017Cne opcje.",
          relationshipDelta: 3,
          score: { morale: 0, kibice: 1, zarzad: 2, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_06_A5",
          text: "Skupiam si\u0119 przede wszystkim na obecnej dru\u017Cynie.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 2 }
        },
        {
          id: "DS_OBJECIE_06_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: -1, zawodnicy: -1 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "DS_OBJECIE_07",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Niekt\xF3rzy kibice s\u0105 sceptyczni wobec tego wyboru trenera. Co chcia\u0142by im Pan odpowiedzie\u0107?"
      ],
      answers: [
        {
          id: "DS_OBJECIE_07_A1",
          text: "Rozumiem r\xF3\u017Cne opinie i szanuj\u0119 je.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 3, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_07_A2",
          text: "Najlepsz\u0105 odpowiedzi\u0105 b\u0119dzie moja praca.",
          relationshipDelta: 5,
          score: { morale: 2, kibice: 3, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 3, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_07_A3",
          text: "Ka\u017Cdy trener musi zapracowa\u0107 na zaufanie.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_07_A4",
          text: "Chc\u0119 przekona\u0107 kibic\xF3w postaw\u0105 dru\u017Cyny na boisku.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 3, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 2, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_07_A5",
          text: "Mam \u015Bwiadomo\u015B\u0107 oczekiwa\u0144 i odpowiedzialno\u015Bci.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 1, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_07_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -3, zarzad: -1, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -3, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "DS_OBJECIE_08",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jak du\u017Ca by\u0142a rola zarz\u0105du w przekonaniu Pana do obj\u0119cia {clubName}?"
      ],
      answers: [
        {
          id: "DS_OBJECIE_08_A1",
          text: "Rozmowy by\u0142y bardzo profesjonalne.",
          relationshipDelta: 3,
          score: { morale: 0, kibice: 0, zarzad: 2, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 1, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_08_A2",
          text: "Przekona\u0142a mnie wsp\xF3lna wizja rozwoju klubu.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 1, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 2, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_08_A3",
          text: "Wa\u017Cne by\u0142o dla mnie poczucie, \u017Ce wszyscy patrzymy w tym samym kierunku.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 1, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 3, presjaZespol: 0, presjaZarzad: 1, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_08_A4",
          text: "Decyzj\u0119 podj\u0105\u0142em po dok\u0142adnej analizie sytuacji.",
          relationshipDelta: 3,
          score: { morale: 0, kibice: 0, zarzad: 2, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_08_A5",
          text: "To by\u0142a przemy\u015Blana decyzja z obu stron.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_08_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: 0, kibice: -1, zarzad: -2, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: -2, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "DS_OBJECIE_09",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Jakie ryzyko bierze Pan na siebie, obejmuj\u0105c {clubName}?"
      ],
      answers: [
        {
          id: "DS_OBJECIE_09_A1",
          text: "Ka\u017Cda praca trenera wi\u0105\u017Ce si\u0119 z odpowiedzialno\u015Bci\u0105.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 1, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_09_A2",
          text: "Nie my\u015Bl\u0119 o tym w kategorii ryzyka, tylko szansy.",
          relationshipDelta: 5,
          score: { morale: 2, kibice: 2, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 3, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_09_A3",
          text: "Presja to naturalny element futbolu.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_09_A4",
          text: "Wierz\u0119 w ten projekt i dlatego tutaj jestem.",
          relationshipDelta: 4,
          score: { morale: 2, kibice: 2, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 1, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_09_A5",
          text: "Najwa\u017Cniejsze jest skupienie na pracy.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 2, pewnoscSiebie: 1, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_09_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -2, kibice: -1, zarzad: -1, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    },
    {
      id: "DS_OBJECIE_10",
      situation: "OBJECIE_STANOWISKA",
      questionVariants: [
        "Za rok \u2014 jaki wynik uzna Pan za udany pierwszy sezon w {clubName}?"
      ],
      answers: [
        {
          id: "DS_OBJECIE_10_A1",
          text: "Taki, kt\xF3ry spe\u0142ni oczekiwania klubu i kibic\xF3w.",
          relationshipDelta: 3,
          score: { morale: 1, kibice: 2, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 1, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_10_A2",
          text: "Najwa\u017Cniejszy b\u0119dzie widoczny rozw\xF3j dru\u017Cyny.",
          relationshipDelta: 3,
          score: { morale: 2, kibice: 1, zarzad: 1, zawodnicy: 2 },
          profileScore: { optymizm: 1, realizm: 2, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
        },
        {
          id: "DS_OBJECIE_10_A3",
          text: "Chcemy walczy\u0107 o cele, kt\xF3re wyznaczy\u0142 klub.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 2, zarzad: 3, zawodnicy: 1 },
          profileScore: { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 2, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_10_A4",
          text: "Ocen\u0119 zostawmy na koniec sezonu.",
          relationshipDelta: 2,
          score: { morale: 0, kibice: 0, zarzad: 1, zawodnicy: 0 },
          profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_10_A5",
          text: "Licz\u0119, \u017Ce b\u0119dziemy w miejscu, z kt\xF3rego wszyscy b\u0119d\u0105 zadowoleni.",
          relationshipDelta: 4,
          score: { morale: 1, kibice: 2, zarzad: 2, zawodnicy: 1 },
          profileScore: { optymizm: 1, realizm: 0, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
        },
        {
          id: "DS_OBJECIE_10_NC",
          text: "Bez komentarza.",
          relationshipDelta: -5,
          score: { morale: -1, kibice: -1, zarzad: -2, zawodnicy: 0 },
          profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: -2, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
        }
      ]
    }
  ]
};
var seasonAnswerScores = {
  balanced: {
    relationshipDelta: 3,
    score: { morale: 1, kibice: 1, zarzad: 1, zawodnicy: 1 },
    profileScore: { optymizm: 1, realizm: 2, pewnoscSiebie: 0, dyplomacja: 1, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 1 }
  },
  ambitious: {
    relationshipDelta: 4,
    score: { morale: 2, kibice: 2, zarzad: 2, zawodnicy: 1 },
    profileScore: { optymizm: 2, realizm: 0, pewnoscSiebie: 2, dyplomacja: 0, presjaZespol: 1, presjaZarzad: 1, ambicja: 2, ryzykoKonfliktu: 0, zaufanieKibicow: 1, zaufanieSzatni: 0 }
  },
  cautious: {
    relationshipDelta: 2,
    score: { morale: 0, kibice: 0, zarzad: 1, zawodnicy: 1 },
    profileScore: { optymizm: 0, realizm: 3, pewnoscSiebie: 0, dyplomacja: 2, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
  },
  noComment: {
    relationshipDelta: -5,
    score: { morale: -1, kibice: -1, zarzad: -1, zawodnicy: -1 },
    profileScore: { optymizm: -2, realizm: 0, pewnoscSiebie: -1, dyplomacja: -2, presjaZespol: 0, presjaZarzad: 0, ambicja: -1, ryzykoKonfliktu: 1, zaufanieKibicow: -2, zaufanieSzatni: -1 }
  }
};
var makeSeasonQuestion = (id, situation, question, balanced, ambitious, cautious) => ({
  id,
  situation,
  questionVariants: [question],
  answers: [
    { id: `${id}_BAL`, text: balanced, ...seasonAnswerScores.balanced },
    { id: `${id}_AMB`, text: ambitious, ...seasonAnswerScores.ambitious },
    { id: `${id}_CAU`, text: cautious, ...seasonAnswerScores.cautious },
    { id: `${id}_NC`, text: "Bez komentarza.", ...seasonAnswerScores.noComment }
  ]
});
var NEXT_SEASON_INTERVIEWS = [
  makeSeasonQuestion(
    "SEZON_AWANS_01",
    "SEZON_AWANS",
    "Po awansie do wy\u017Cszej ligi oczekiwania wobec {clubName} mocno wzros\u0142y. Jaki jest plan na nowy sezon?",
    "Najpierw musimy ustabilizowa\u0107 dru\u017Cyn\u0119 i szybko dostosowa\u0107 si\u0119 do wy\u017Cszego poziomu.",
    "Nie awansowali\u015Bmy po to, \u017Ceby tylko si\u0119 broni\u0107. Chcemy pokaza\u0107, \u017Ce zas\u0142ugujemy na t\u0119 lig\u0119.",
    "Awans daje rado\u015B\u0107, ale te\u017C obowi\u0105zek rozs\u0105dnych decyzji. Ka\u017Cdy punkt b\u0119dzie mia\u0142 znaczenie."
  ),
  makeSeasonQuestion(
    "SEZON_AWANS_02",
    "SEZON_AWANS",
    "Czy kadra {clubName} jest gotowa na wi\u0119ksze wymagania po awansie?",
    "Trzon zespo\u0142u zas\u0142u\u017Cy\u0142 na zaufanie, ale musimy m\u0105drze wzmocni\u0107 kilka pozycji.",
    "Wierz\u0119 w t\u0119 grup\u0119. Je\u017Celi zachowamy charakter, mo\u017Cemy sprawi\u0107 w tej lidze sporo problem\xF3w.",
    "Nie chc\u0119 sk\u0142ada\u0107 wielkich deklaracji. Musimy pracowa\u0107 i reagowa\u0107 na to, co poka\u017Ce boisko."
  ),
  makeSeasonQuestion(
    "SEZON_MISTRZ_01",
    "SEZON_MISTRZ",
    "{clubName} zdoby\u0142 mistrzostwo Polski. Jak obroni\u0107 pozycj\u0119 najlepszej dru\u017Cyny w kraju?",
    "Najtrudniejsze jest utrzymanie standard\xF3w, dlatego zaczynamy od dyscypliny i codziennej pracy.",
    "Chcemy dalej wygrywa\u0107. Tytu\u0142 nie zamyka projektu, tylko podnosi nasze ambicje.",
    "Musimy pami\u0119ta\u0107, \u017Ce ka\u017Cdy b\u0119dzie gra\u0142 z mistrzem podw\xF3jnie zmotywowany."
  ),
  makeSeasonQuestion(
    "SEZON_MISTRZ_02",
    "SEZON_MISTRZ",
    "Czy mistrzostwo zmienia presj\u0119 wok\xF3\u0142 {clubName} przed startem nowego sezonu?",
    "Presja jest wi\u0119ksza, ale klub musi nauczy\u0107 si\u0119 z ni\u0105 funkcjonowa\u0107.",
    "Presja to przywilej najlepszych. Chcemy j\u0105 wykorzysta\u0107 jako paliwo.",
    "Nie mo\u017Cemy \u017Cy\u0107 poprzednim sezonem. Liczy si\u0119 najbli\u017Cszy mecz i forma dru\u017Cyny."
  ),
  makeSeasonQuestion(
    "SEZON_PUCHAR_01",
    "SEZON_PUCHAR",
    "Puchar Polski trafi\u0142 do {clubName}. Co ten sukces znaczy dla dru\u017Cyny przed nowym sezonem?",
    "To wa\u017Cny dow\xF3d, \u017Ce potrafimy gra\u0107 pod presj\u0105 i wygrywa\u0107 mecze o du\u017C\u0105 stawk\u0119.",
    "Ten puchar ma by\u0107 pocz\u0105tkiem wi\u0119kszych rzeczy. Dru\u017Cyna zobaczy\u0142a, \u017Ce sta\u0107 j\u0105 na trofea.",
    "Cieszymy si\u0119, ale puchar nie gwarantuje punkt\xF3w w lidze. Trzeba zacz\u0105\u0107 od nowa."
  ),
  makeSeasonQuestion(
    "SEZON_PUCHAR_02",
    "SEZON_PUCHAR",
    "Czy zdobycie Pucharu Polski podnosi oczekiwania wobec {clubName}?",
    "Naturalnie, ale oczekiwania musz\u0105 i\u015B\u0107 w parze ze spokojem i planem.",
    "Tak, i bardzo dobrze. Klub, kt\xF3ry wygrywa puchar, powinien chcie\u0107 wi\u0119cej.",
    "Nie mo\u017Cemy da\u0107 si\u0119 ponie\u015B\u0107 euforii. Sukces wymaga teraz potwierdzenia."
  ),
  makeSeasonQuestion(
    "SEZON_DUBLET_01",
    "SEZON_DUBLET",
    "Mistrzostwo Polski i Puchar Polski w jednym sezonie. Jak utrzyma\u0107 g\u0142\xF3d zwyci\u0119stw po dublecie?",
    "Najwa\u017Cniejsze b\u0119dzie odci\u0119cie si\u0119 od samozadowolenia i postawienie nowych cel\xF3w.",
    "Dublet pokaza\u0142 si\u0142\u0119 {clubName}. Chcemy zbudowa\u0107 dru\u017Cyn\u0119, kt\xF3ra b\u0119dzie dominowa\u0107 d\u0142u\u017Cej.",
    "To by\u0142 wyj\u0105tkowy sezon, ale powt\xF3rzenie go b\u0119dzie jeszcze trudniejsze."
  ),
  makeSeasonQuestion(
    "SEZON_DUBLET_02",
    "SEZON_DUBLET",
    "Czy po dublecie {clubName} ma obowi\u0105zek celowa\u0107 jeszcze wy\u017Cej?",
    "Obowi\u0105zkiem jest utrzyma\u0107 profesjonalizm i nie zgubi\u0107 fundament\xF3w, kt\xF3re da\u0142y nam sukces.",
    "Tak. Po takim sezonie nie mo\u017Cna chowa\u0107 ambicji. Chcemy kolejnych trofe\xF3w.",
    "Ambicja jest potrzebna, ale musimy pilnowa\u0107 r\xF3wnowagi i jako\u015Bci kadry."
  ),
  makeSeasonQuestion(
    "SEZON_BRAK_AWANSU_01",
    "SEZON_BRAK_AWANSU",
    "{clubName} nie wywalczy\u0142 awansu. Co musi si\u0119 zmieni\u0107, \u017Ceby kolejny sezon by\u0142 lepszy?",
    "Musimy poprawi\u0107 regularno\u015B\u0107 i lepiej reagowa\u0107 na trudne momenty w sezonie.",
    "Cel pozostaje jasny. Chcemy wr\xF3ci\u0107 silniejsi i od pocz\u0105tku bi\u0107 si\u0119 o awans.",
    "Nie wszystko da si\u0119 naprawi\u0107 jednym ruchem. Potrzebna jest cierpliwa korekta."
  ),
  makeSeasonQuestion(
    "SEZON_BRAK_AWANSU_02",
    "SEZON_BRAK_AWANSU",
    "Czy brak awansu jest dla Pana osobistym rozczarowaniem?",
    "Tak, ale rozczarowanie musi prze\u0142o\u017Cy\u0107 si\u0119 na konkretn\u0105 prac\u0119, a nie puste s\u0142owa.",
    "Boli mnie to, bo wiem, \u017Ce mogli\u015Bmy zrobi\u0107 wi\u0119cej. W nowym sezonie chc\u0119 innej energii.",
    "Trzeba uczciwie przeanalizowa\u0107 sezon i wyci\u0105gn\u0105\u0107 wnioski bez szukania wym\xF3wek."
  ),
  makeSeasonQuestion(
    "SEZON_EUROPEJSKIE_PUCHARY_01",
    "SEZON_EUROPEJSKIE_PUCHARY",
    "{clubName} zaj\u0105\u0142 miejsce daj\u0105ce udzia\u0142 w europejskich pucharach. Jak po\u0142\u0105czy\u0107 lig\u0119 z gr\u0105 w Europie?",
    "Kluczowa b\u0119dzie g\u0142\u0119bia kadry, rotacja i dobre zarz\u0105dzanie energi\u0105 zawodnik\xF3w.",
    "Europa to wielka szansa. Chcemy pokaza\u0107, \u017Ce polski klub mo\u017Ce gra\u0107 odwa\u017Cnie.",
    "Musimy zachowa\u0107 rozs\u0105dek, bo dodatkowe mecze szybko weryfikuj\u0105 organizacj\u0119 klubu."
  ),
  makeSeasonQuestion(
    "SEZON_EUROPEJSKIE_PUCHARY_02",
    "SEZON_EUROPEJSKIE_PUCHARY",
    "Czy awans do puchar\xF3w europejskich zmienia cele {clubName}?",
    "Zmienia skal\u0119 wyzwania, ale ligowa stabilno\u015B\u0107 nadal b\u0119dzie bardzo wa\u017Cna.",
    "Chcemy wykorzysta\u0107 ten moment i zrobi\u0107 krok naprz\xF3d sportowo oraz mentalnie.",
    "Najpierw musimy dobrze przygotowa\u0107 zesp\xF3\u0142. Same puchary nie wygraj\u0105 nam mecz\xF3w."
  ),
  makeSeasonQuestion(
    "SEZON_UNIWERSALNY_01",
    "SEZON_UNIWERSALNY",
    "Za {clubName} spokojniejszy sezon bez wielkich sukces\xF3w i katastrof. Co jest priorytetem teraz?",
    "Priorytetem jest konsekwentny rozw\xF3j dru\u017Cyny i poprawa tych element\xF3w, kt\xF3re kosztowa\u0142y nas punkty.",
    "Chc\u0119, \u017Ceby\u015Bmy byli odwa\u017Cniejsi. Stabilno\u015B\u0107 jest dobra, ale klub musi i\u015B\u0107 do przodu.",
    "Najwa\u017Cniejsze b\u0119dzie m\u0105dre przygotowanie i spokojne wej\u015Bcie w sezon."
  ),
  makeSeasonQuestion(
    "SEZON_UNIWERSALNY_02",
    "SEZON_UNIWERSALNY",
    "Czego kibice {clubName} mog\u0105 oczekiwa\u0107 w nowym sezonie?",
    "Dru\u017Cyny bardziej uporz\u0105dkowanej, lepiej przygotowanej i \u015Bwiadomej swoich cel\xF3w.",
    "Wi\u0119kszej ambicji. Chcemy da\u0107 kibicom wi\u0119cej powod\xF3w do dumy.",
    "Nie obiecuj\u0119 rewolucji. Obiecuj\u0119 prac\u0119 i uczciwe podej\u015Bcie do ka\u017Cdego meczu."
  )
];
Object.values(Newspaper).forEach((newspaper) => {
  INTERVIEW_POOL[newspaper].push(...NEXT_SEASON_INTERVIEWS);
});

// data/press_articles_pl.ts
var PRESS_ARTICLES = {
  PRAGMATYK: {
    headline: (m, c) => `${m} tonuje nastroje w ${c}. \u201ENajpierw praca, p\xF3\u017Aniej deklaracje"`,
    body: (m, c) => `Nowy trener ${c} podczas pierwszych rozm\xF3w z mediami sprawia\u0142 wra\u017Cenie cz\u0142owieka twardo st\u0105paj\u0105cego po ziemi. ${m} unika\u0142 wielkich obietnic i zamiast g\u0142o\u015Bnych deklaracji m\xF3wi\u0142 g\u0142\xF3wnie o systematycznej pracy, organizacji oraz potrzebie spokojnego budowania zespo\u0142u.

Cho\u0107 cz\u0119\u015B\u0107 kibic\xF3w mog\u0142a oczekiwa\u0107 bardziej zdecydowanych zapowiedzi, w klubie taki ton mo\u017Ce by\u0107 odebrany jako sygna\u0142 profesjonalnego podej\u015Bcia. Nowy szkoleniowiec zdaje si\u0119 nie ulega\u0107 emocjom pocz\u0105tku sezonu i jasno komunikuje, \u017Ce sukces b\u0119dzie efektem procesu, a nie pojedynczych decyzji.

Pozostaje pytanie, czy cierpliwo\u015Bci wystarczy zar\xF3wno w\u0142adzom klubu, jak i kibicom ${c}.`
  },
  OPTYMISTA: {
    headline: (m, c) => `Du\u017Ce ambicje ${m}. W ${c} wierz\u0105 w nowy pocz\u0105tek`,
    body: (m, c) => `Pierwsze wyst\u0105pienie medialne nowego szkoleniowca ${c} pozostawi\u0142o po sobie sporo optymizmu. ${m} nie ukrywa\u0142 wiary w potencja\u0142 zespo\u0142u i wielokrotnie podkre\u015Bla\u0142, \u017Ce klub mo\u017Ce osi\u0105gn\u0105\u0107 wi\u0119cej, ni\u017C wielu dzi\u015B zak\u0142ada.

Nowy trener emanowa\u0142 spokojn\u0105 pewno\u015Bci\u0105 siebie, przekonuj\u0105c, \u017Ce odpowiednia organizacja i konsekwencja mog\u0105 szybko przynie\u015B\u0107 pozytywne efekty. W\u015Br\xF3d kibic\xF3w da si\u0119 wyczu\u0107 ostro\u017Cny entuzjazm, cho\u0107 eksperci przypominaj\u0105, \u017Ce ambitne deklaracje bardzo szybko podlegaj\u0105 weryfikacji przez boisko.

Jedno jest pewne \u2014 wraz z przyj\u015Bciem ${m} oczekiwania wok\xF3\u0142 ${c} wyra\u017Anie wzros\u0142y.`
  },
  WIZJONER: {
    headline: (m, c) => `Nowa wizja dla ${c}. ${m} zapowiada zmiany`,
    body: (m, c) => `Podczas pierwszej konferencji prasowej ${m} wielokrotnie m\xF3wi\u0142 o d\u0142ugofalowej budowie zespo\u0142u, to\u017Csamo\u015Bci gry oraz zmianie mentalno\u015Bci w ${c}. Nowy trener sprawia wra\u017Cenie szkoleniowca, kt\xF3ry patrzy dalej ni\u017C najbli\u017Csze tygodnie.

Wypowiedzi nowego opiekuna zespo\u0142u sugeruj\u0105, \u017Ce klub mo\u017Ce przej\u015B\u0107 stopniow\u0105 transformacj\u0119 \u2014 zar\xF3wno pod wzgl\u0119dem stylu gry, jak i funkcjonowania szatni. Nie zabrak\u0142o tak\u017Ce odniesie\u0144 do rozwoju zawodnik\xF3w i budowy stabilnych fundament\xF3w.

Pytanie pozostaje jedno: czy kibice oraz zarz\u0105d ${c} b\u0119d\u0105 gotowi da\u0107 czas projektowi, kt\xF3rego efekty mog\u0105 nie przyj\u015B\u0107 natychmiast.`
  },
  TWARDY_LIDER: {
    headline: (m, c) => `Nowe porz\u0105dki w ${c}? ${m} stawia spraw\u0119 jasno`,
    body: (m, c) => `Pierwsze wypowiedzi ${m} sugeruj\u0105, \u017Ce w ${c} mo\u017Ce nadej\u015B\u0107 czas wi\u0119kszych wymaga\u0144 i dyscypliny. Nowy szkoleniowiec du\u017Co m\xF3wi\u0142 o odpowiedzialno\u015Bci, zaanga\u017Cowaniu i konieczno\u015Bci codziennej pracy.

Cho\u0107 trener unika\u0142 personalnych deklaracji, mi\u0119dzy wierszami mo\u017Cna by\u0142o wyczyta\u0107, \u017Ce miejsce w sk\u0142adzie nie b\u0119dzie nikomu dane z g\xF3ry. Wszystko wskazuje na to, \u017Ce w dru\u017Cynie zacznie obowi\u0105zywa\u0107 jasna zasada: forma i podej\u015Bcie b\u0119d\u0105 wa\u017Cniejsze od nazwiska.

Taki styl zarz\u0105dzania mo\u017Ce szybko uporz\u0105dkowa\u0107 szatni\u0119, cho\u0107 r\xF3wnie \u0142atwo doprowadzi\u0107 do pierwszych napi\u0119\u0107.`
  },
  SHOWMAN: {
    headline: (m, c) => `Odwa\u017Cne s\u0142owa ${m}. Czy ${c} naprawd\u0119 sta\u0107 na wi\u0119cej?`,
    body: (m, c) => `Nowy trener ${c} nie zamierza chowa\u0107 si\u0119 za ostro\u017Cnymi deklaracjami. Ju\u017C podczas pierwszych rozm\xF3w z mediami ${m} jasno dawa\u0142 do zrozumienia, \u017Ce wierzy w mo\u017Cliwo\u015Bci zespo\u0142u i nie boi si\u0119 wysokich oczekiwa\u0144.

Pewno\u015B\u0107 siebie szkoleniowca mo\u017Ce imponowa\u0107 kibicom, ale jednocze\u015Bnie automatycznie zwi\u0119ksza presj\u0119 przed startem sezonu. Futbol szybko rozlicza odwa\u017Cne zapowiedzi, dlatego pierwsze tygodnie pracy b\u0119d\u0105 szczeg\xF3lnie uwa\u017Cnie obserwowane.

Je\u015Bli wyniki szybko przyjd\u0105, ${m} mo\u017Ce sta\u0107 si\u0119 bohaterem trybun. Je\u015Bli nie \u2014 media r\xF3wnie szybko przypomn\u0105 pierwsze deklaracje.`
  },
  ZBYT_DYPLOMATYCZNY: {
    headline: (m, c) => `Spokojny start ${m}. Ale jaki w\u0142a\u015Bciwie ma plan dla ${c}?`,
    body: (m, c) => `Pierwsze wyst\u0105pienie nowego szkoleniowca ${c} pozostawi\u0142o po sobie mieszane odczucia. ${m} cz\u0119sto unika\u0142 jednoznacznych deklaracji, podkre\u015Blaj\u0105c potrzeb\u0119 czasu, analiz i spokojnej pracy.

Z jednej strony mo\u017Cna to odbiera\u0107 jako rozs\u0105dek i ostro\u017Cno\u015B\u0107, z drugiej \u2014 cz\u0119\u015B\u0107 kibic\xF3w mog\u0142a liczy\u0107 na bardziej konkretne sygna\u0142y dotycz\u0105ce przysz\u0142o\u015Bci zespo\u0142u.

Czy to przejaw profesjonalizmu i ch\u0142odnej kalkulacji, czy mo\u017Ce brak wyra\u017Anej wizji? Na odpowied\u017A przyjdzie jeszcze czas.`
  },
  ZBYTNI_OPTYMISTA: {
    headline: (m, c) => `Za du\u017Co wiary? ${m} wysoko ocenia mo\u017Cliwo\u015Bci ${c}`,
    body: (m, c) => `Podczas pierwszych wywiad\xF3w nowy trener ${c} sprawia\u0142 wra\u017Cenie cz\u0142owieka mocno przekonanego o potencjale obecnej kadry. ${m} wielokrotnie podkre\u015Bla\u0142, \u017Ce dru\u017Cyna mo\u017Ce osi\u0105gn\u0105\u0107 wi\u0119cej, ni\u017C obecnie przewiduj\u0105 eksperci.

Taki optymizm mo\u017Ce budowa\u0107 morale wok\xF3\u0142 zespo\u0142u, ale r\xF3wnocze\u015Bnie niesie ryzyko zwi\u0119kszenia oczekiwa\u0144 jeszcze przed pierwszym gwizdkiem sezonu. Kibice z pewno\u015Bci\u0105 chc\u0105 wierzy\u0107 w ambitny projekt, cho\u0107 futbol nieraz pokaza\u0142, \u017Ce nadmierna pewno\u015B\u0107 siebie szybko zostaje zweryfikowana.

Pierwsze kolejki poka\u017C\u0105, czy szkoleniowiec trafnie oceni\u0142 potencja\u0142 ${c}.`
  },
  ODMOWA_NEUTRALNA: {
    headline: (m, c) => `${m} bez konferencji. Trener skupia si\u0119 na pracy w ${c}`,
    body: (m, c) => `Nowy szkoleniowiec ${c} zdecydowa\u0142 si\u0119 nie udziela\u0107 szerszych wypowiedzi mediom po obj\u0119ciu stanowiska. Klub poinformowa\u0142 jedynie, \u017Ce ${m} chce w pierwszych dniach w pe\u0142ni skoncentrowa\u0107 si\u0119 na poznaniu dru\u017Cyny oraz przygotowaniach do sezonu.

Cho\u0107 cz\u0119\u015B\u0107 kibic\xF3w liczy\u0142a na pierwsze deklaracje i poznanie wizji nowego szkoleniowca, inni podchodz\u0105 do decyzji ze zrozumieniem. W ko\u0144cu w futbolu najwa\u017Cniejsze odpowiedzi i tak padaj\u0105 na boisku.

W najbli\u017Cszych tygodniach oczy kibic\xF3w b\u0119d\u0105 zwr\xF3cone przede wszystkim na pierwsze decyzje nowego sztabu.`
  },
  ODMOWA_NEGATYWNA: {
    headline: (m, c) => `Milczenie ${m}. Dlaczego nowy trener ${c} unika pyta\u0144?`,
    body: (m, c) => `Obj\u0119cie stanowiska przez nowego szkoleniowca ${c} mia\u0142o by\u0107 pocz\u0105tkiem nowego rozdzia\u0142u, jednak kibice wci\u0105\u017C nie poznali wizji ${m}. Trener odm\xF3wi\u0142 udzia\u0142u w szerszych rozmowach z mediami, pozostawiaj\u0105c wi\u0119cej pyta\u0144 ni\u017C odpowiedzi.

Czy to ch\u0142odna kalkulacja i pe\u0142ne skupienie na pracy, czy mo\u017Ce ostro\u017Cno\u015B\u0107 wynikaj\u0105ca z trudnej sytuacji klubu? Tego dzi\u015B nie wiadomo.

Jedno jest pewne \u2014 brak deklaracji oznacza, \u017Ce oczekiwania wobec pierwszych mecz\xF3w b\u0119d\u0105 jeszcze wi\u0119ksze.`
  },
  ODMOWA_POZYTYWNA: {
    headline: (m, c) => `${m} stawia na cisz\u0119 przed sezonem. \u201ENajpierw praca, p\xF3\u017Aniej s\u0142owa\u201D`,
    body: (m, c) => `Bez wielkich deklaracji, bez medialnych obietnic i bez g\u0142o\u015Bnych zapowiedzi \u2014 tak rozpocz\u0105\u0142 prac\u0119 w ${c} nowy trener ${m}. Szkoleniowiec zdecydowa\u0142 si\u0119 ograniczy\u0107 kontakty z mediami, koncentruj\u0105c si\u0119 na pierwszych tygodniach pracy z zespo\u0142em.

Taka postawa mo\u017Ce sugerowa\u0107 pragmatyczne podej\u015Bcie oraz ch\u0119\u0107 unikni\u0119cia niepotrzebnej presji przed startem sezonu. W \u015Brodowisku pi\u0142karskim nie brakuje trener\xF3w, kt\xF3rzy wol\u0105 m\xF3wi\u0107 wynikami ni\u017C s\u0142owami.

Kibice z pewno\u015Bci\u0105 szybko oceni\u0105, czy milczenie nowego szkoleniowca by\u0142o cz\u0119\u015Bci\u0105 dobrze przemy\u015Blanego planu.`
  },
  NIEPRZYCHYLNE_AUTORYTET: {
    headline: (m, c) => `Pierwsze zgrzyty w ${c}? Nie wszyscy maj\u0105 by\u0107 przekonani do metod ${m}`,
    body: (m, c) => `Cho\u0107 od obj\u0119cia stanowiska przez ${m} min\u0119\u0142o niewiele czasu, wok\xF3\u0142 ${c} zaczynaj\u0105 pojawia\u0107 si\u0119 pierwsze pytania dotycz\u0105ce atmosfery w szatni.

Wed\u0142ug informacji docieraj\u0105cych do naszej redakcji cz\u0119\u015B\u0107 zawodnik\xF3w ma nie by\u0107 w pe\u0142ni przekonana do nowych metod pracy oraz zmian wprowadzanych przez sztab szkoleniowy. Nie chodzi jeszcze o otwarty konflikt, ale \u2014 jak s\u0142yszymy \u2014 nie wszyscy r\xF3wnie entuzjastycznie przyj\u0119li nowy porz\u0105dek.

W klubie oficjalnie nikt problemu nie dostrzega. Jednak je\u015Bli wyniki szybko nie przyjd\u0105, takie sygna\u0142y mog\u0105 zacz\u0105\u0107 narasta\u0107.`
  },
  NIEPRZYCHYLNE_SZATNIA: {
    headline: (_m, c) => `Dwie grupy w szatni ${c}? Atmosfera wok\xF3\u0142 zespo\u0142u budzi pytania`,
    body: (m, c) => `Coraz cz\u0119\u015Bciej m\xF3wi si\u0119, \u017Ce w ${c} nie wszystko wygl\u0105da tak spokojnie, jak mog\u0142oby si\u0119 wydawa\u0107 z zewn\u0105trz. Wed\u0142ug nieoficjalnych informacji w dru\u017Cynie maj\u0105 pojawia\u0107 si\u0119 r\xF3\u017Cnice zda\u0144 dotycz\u0105ce kierunku, w kt\xF3rym zmierza zesp\xF3\u0142 pod wodz\u0105 ${m}.

Cz\u0119\u015B\u0107 pi\u0142karzy ma pozytywnie ocenia\u0107 nowe standardy pracy i wi\u0119ksze wymagania, jednak inni \u2014 jak s\u0142yszymy \u2014 podchodz\u0105 do zmian znacznie bardziej sceptycznie.

Na tym etapie trudno m\xF3wi\u0107 o kryzysie, ale pytanie o jedno\u015B\u0107 szatni mo\u017Ce wraca\u0107 coraz cz\u0119\u015Bciej, szczeg\xF3lnie je\u015Bli wyniki nie b\u0119d\u0105 satysfakcjonuj\u0105ce.`
  },
  NIEPRZYCHYLNE_KRYZYS: {
    headline: (m, c) => `Nerwowo w ${c}? Coraz wi\u0119cej pyta\u0144 o atmosfer\u0119 wok\xF3\u0142 ${m}`,
    body: (m, c) => `Cho\u0107 sezon dopiero nabiera rozp\u0119du, wok\xF3\u0142 ${c} zaczyna robi\u0107 si\u0119 coraz bardziej nerwowo. Nieoficjalnie m\xF3wi si\u0119 o rosn\u0105cym napi\u0119ciu w szatni oraz zawodnikach, kt\xF3rzy nie do ko\u0144ca rozumiej\u0105 decyzje podejmowane przez ${m}.

W ostatnich dniach pojawiaj\u0105 si\u0119 tak\u017Ce g\u0142osy, \u017Ce cz\u0119\u015B\u0107 bardziej do\u015Bwiadczonych pi\u0142karzy nie jest zachwycona zmianami dotycz\u0105cymi trening\xF3w oraz zarz\u0105dzania zespo\u0142em.

Oczywi\u015Bcie w klubie nikt publicznie nie m\xF3wi o problemach. Ale w futbolu plotki rzadko pojawiaj\u0105 si\u0119 bez powodu \u2014 szczeg\xF3lnie wtedy, gdy wyniki nie id\u0105 w parze z oczekiwaniami.`
  },
  PRZYCHYLNE_DOBRY_START: {
    headline: (m, c) => `Udany pocz\u0105tek ${m}. W ${c} czu\u0107 now\u0105 energi\u0119`,
    body: (_m, c) => `Pierwsze tygodnie pracy zdaj\u0105 si\u0119 przynosi\u0107 pozytywne efekty. Wed\u0142ug informacji z otoczenia klubu atmosfera w zespole ma by\u0107 bardzo dobra, a zawodnicy pozytywnie reaguj\u0105 na nowe metody pracy.

W szatni m\xF3wi si\u0119 o wi\u0119kszej organizacji, jasnych zasadach i rosn\u0105cym przekonaniu, \u017Ce dru\u017Cyna mo\u017Ce zrobi\u0107 krok naprz\xF3d wzgl\u0119dem poprzedniego sezonu. Co wa\u017Cne, sztab szkoleniowy ma cieszy\u0107 si\u0119 zaufaniem zar\xF3wno bardziej do\u015Bwiadczonych pi\u0142karzy, jak i m\u0142odszych zawodnik\xF3w.

Cho\u0107 sezon dopiero si\u0119 rozpoczyna, wok\xF3\u0142 ${c} coraz cz\u0119\u015Bciej pojawia si\u0119 s\u0142owo: stabilizacja.`
  },
  PRZYCHYLNE_ZWYCIESKI_START: {
    headline: (m, _c, context) => `Obiecuj\u0105cy pocz\u0105tek ${m}. Wygrana z ${context?.opponentName ?? "rywalem"} daje nadziej\u0119 kibicom`,
    body: (m, c, context) => `Lepszego pocz\u0105tku trudno by\u0142o sobie wymarzy\u0107. ${c} pod wodz\u0105 ${m} rozpocz\u0119\u0142a nowy etap od zwyci\u0119stwa nad ${context?.opponentName ?? "rywalem"} ${context?.venueLabel ?? "w lidze"}, a wok\xF3\u0142 zespo\u0142u wyra\u017Anie poprawi\u0142y si\u0119 nastroje.

Cho\u0107 to dopiero pierwszy wa\u017Cniejszy sprawdzian nowego szkoleniowca, kibice maj\u0105 powody do umiarkowanego optymizmu. Dru\u017Cyna wygl\u0105da\u0142a na dobrze przygotowan\u0105, zaanga\u017Cowan\u0105 i przede wszystkim pewn\u0105 swoich za\u0142o\u017Ce\u0144.

Sam trener studzi emocje, ale trudno nie zauwa\u017Cy\u0107, \u017Ce pierwsze tygodnie pracy w ${c} mog\u0105 budowa\u0107 solidny fundament pod dalszy rozw\xF3j.`
  },
  PRZYCHYLNE_DOBRA_FORMA: {
    headline: (m, _c, context) => context?.latestResultType === "WIN" ? `${m} \u0142apie rytm. Wygrana z ${context?.opponentName ?? "rywalem"} wzmacnia wiar\u0119 kibic\xF3w` : `${m} \u0142apie rytm. Wynik z ${context?.opponentName ?? "rywalem"} potwierdza stabilizacj\u0119`,
    body: (m, c, context) => {
      const closingLine = context?.seasonPhase === "LATE" ? `Sam trener zachowuje ostro\u017Cno\u015B\u0107, ale wok\xF3\u0142 ${c} da si\u0119 wyczu\u0107 przekonanie, \u017Ce zesp\xF3\u0142 mo\u017Ce podej\u015B\u0107 do finiszu sezonu z wi\u0119ksz\u0105 pewno\u015Bci\u0105 siebie.` : `Sam trener zachowuje ostro\u017Cno\u015B\u0107, ale wok\xF3\u0142 ${c} da si\u0119 wyczu\u0107 przekonanie, \u017Ce zesp\xF3\u0142 mo\u017Ce wej\u015B\u0107 w drug\u0105 cz\u0119\u015B\u0107 sezonu z wi\u0119ksz\u0105 pewno\u015Bci\u0105 siebie.`;
      return context?.latestResultType === "WIN" ? `${c} pod wodz\u0105 ${m} dopisa\u0142a kolejne wa\u017Cne zwyci\u0119stwo, pokonuj\u0105c ${context?.opponentName ?? "rywala"} ${context?.venueLabel ?? "w lidze"}. Po wielu tygodniach pracy coraz wyra\u017Aniej wida\u0107, \u017Ce zesp\xF3\u0142 ma w\u0142asny rytm i coraz lepiej rozumie za\u0142o\u017Cenia sztabu.

To nie jest ju\u017C etap pierwszych wra\u017Ce\u0144, lecz moment, w kt\xF3rym kibice zaczynaj\u0105 ocenia\u0107 dru\u017Cyn\u0119 przez pryzmat regularno\u015Bci. Ostatni wynik daje argumenty tym, kt\xF3rzy uwa\u017Caj\u0105, \u017Ce obrany kierunek przynosi konkretne efekty.

${closingLine}` : `${c} pod wodz\u0105 ${m} utrzyma\u0142a pozytywny rytm w meczu z ${context?.opponentName ?? "rywalem"} ${context?.venueLabel ?? "w lidze"}. Cho\u0107 tym razem nie uda\u0142o si\u0119 dopisa\u0107 kompletu punkt\xF3w, po wielu tygodniach pracy coraz wyra\u017Aniej wida\u0107, \u017Ce zesp\xF3\u0142 lepiej rozumie za\u0142o\u017Cenia sztabu.

To nie jest ju\u017C etap pierwszych wra\u017Ce\u0144, lecz moment, w kt\xF3rym kibice zaczynaj\u0105 ocenia\u0107 dru\u017Cyn\u0119 przez pryzmat regularno\u015Bci. Ostatni wynik nie zamyka dyskusji, ale daje argumenty tym, kt\xF3rzy uwa\u017Caj\u0105, \u017Ce obrany kierunek przynosi konkretne efekty.

${closingLine}`;
    }
  },
  PRZYCHYLNE_SZATNIA: {
    headline: (m, c) => `Pi\u0142karze po stronie ${m}. W ${c} m\xF3wi si\u0119 o bardzo dobrej atmosferze`,
    body: (m, c) => `Coraz wi\u0119cej sygna\u0142\xF3w wskazuje na to, \u017Ce ${m} bardzo szybko zyska\u0142 zaufanie szatni ${c}. Wed\u0142ug os\xF3b zbli\u017Conych do klubu zawodnicy maj\u0105 pozytywnie ocenia\u0107 komunikacj\u0119 nowego szkoleniowca oraz spos\xF3b prowadzenia dru\u017Cyny.

Wewn\u0105trz zespo\u0142u ma panowa\u0107 dobra atmosfera, a pi\u0142karze doceniaj\u0105 jasne zasady oraz wi\u0119ksz\u0105 przejrzysto\u015B\u0107 w podejmowaniu decyzji. Co istotne, nie s\u0142ycha\u0107 o wi\u0119kszych napi\u0119ciach czy niezadowoleniu w\u015Br\xF3d lider\xF3w dru\u017Cyny.

Oczywi\u015Bcie najlepsz\u0105 ocen\u0105 pozostan\u0105 wyniki, jednak pocz\u0105tek pracy ${m} mo\u017Ce napawa\u0107 kibic\xF3w ${c} ostro\u017Cnym optymizmem.`
  },
  PRZYCHYLNE_SLABY_OPTYMIZM: {
    headline: (m) => `Wyniki jeszcze nie przysz\u0142y, ale s\u0105 pozytywne sygna\u0142y dla ${m}`,
    body: (m, c) => `Cho\u0107 pierwsze rezultaty ${c} pod wodz\u0105 ${m} mog\u0105 pozostawia\u0107 niedosyt, nie brakuje opinii, \u017Ce obraz gry wygl\u0105da lepiej, ni\u017C sugeruje tabela.

W kilku spotkaniach dru\u017Cyna mia\u0142a momenty dobrej organizacji, wi\u0119kszej intensywno\u015Bci oraz odwagi w grze. Problemem pozostaje skuteczno\u015B\u0107 i brak stabilno\u015Bci, ale cz\u0119\u015B\u0107 obserwator\xF3w zwraca uwag\u0119, \u017Ce fundamenty pod popraw\u0119 mog\u0105 ju\u017C by\u0107 widoczne.

W pi\u0142ce no\u017Cnej nie zawsze pierwsze tygodnie oddaj\u0105 realny potencja\u0142 projektu. W ${c} wci\u0105\u017C wierz\u0105, \u017Ce cierpliwo\u015B\u0107 mo\u017Ce si\u0119 op\u0142aci\u0107.`
  },
  PRZYCHYLNE_SLABY_SZATNIA: {
    headline: (m, c) => `Mimo s\u0142abego startu szatnia wspiera ${m}. W ${c} nie ma paniki`,
    body: (m, c) => `S\u0142abszy pocz\u0105tek sezonu nie musi oznacza\u0107 kryzysu. Wed\u0142ug informacji z otoczenia ${c} nowy trener ${m} nadal cieszy si\u0119 du\u017Cym wsparciem ze strony zawodnik\xF3w.

W klubie ma panowa\u0107 przekonanie, \u017Ce obecne problemy wynikaj\u0105 bardziej z czasu potrzebnego na wdro\u017Cenie nowych rozwi\u0105za\u0144 ni\u017C g\u0142\u0119bszych problem\xF3w wewn\u0105trz dru\u017Cyny. Pi\u0142karze podobno pozytywnie oceniaj\u0105 komunikacj\u0119 sztabu oraz codzienn\u0105 organizacj\u0119 pracy.

Oczywi\u015Bcie cierpliwo\u015B\u0107 w futbolu ma swoje granice, ale na dzi\u015B w ${c} nie wida\u0107 oznak wi\u0119kszej nerwowo\u015Bci.`
  },
  PRZYCHYLNE_TRUDNY_OKRES: {
    headline: (m, c) => `${c} bez fajerwerk\xF3w, ale wok\xF3\u0142 ${m} wci\u0105\u017C wida\u0107 spok\xF3j`,
    body: (m, c) => `Ostatnie wyniki ${c} nie daj\u0105 powod\xF3w do pe\u0142nej satysfakcji, ale w klubie nie wida\u0107 atmosfery paniki. Wed\u0142ug os\xF3b zbli\u017Conych do dru\u017Cyny ${m} nadal ma wsparcie szatni, a zawodnicy wierz\u0105, \u017Ce konsekwencja w pracy mo\u017Ce prze\u0142o\u017Cy\u0107 si\u0119 na stabilniejsz\u0105 form\u0119.

Kibice oczekiwaliby zapewne wi\u0119kszej regularno\u015Bci, zw\u0142aszcza na tym etapie sezonu, jednak obraz gry nie jest jednoznacznie negatywny. Zesp\xF3\u0142 ma fragmenty dobrej organizacji, cho\u0107 wci\u0105\u017C brakuje mu skuteczno\u015Bci i spokojniejszego domykania spotka\u0144.

Najbli\u017Csze tygodnie poka\u017C\u0105, czy ${c} potrafi zamieni\u0107 cierpliwo\u015B\u0107 w punkty, ale na razie projekt nie wygl\u0105da na taki, kt\xF3ry traci zaufanie od \u015Brodka.`
  },
  TOTALNA_DEMOLKA: {
    headline: () => "TOTALNA DEMOLKA! RYWAL BEZ \u017BADNYCH SZANS",
    body: (_m, c) => `Dru\u017Cyna ${c} urz\u0105dzi\u0142a rywalom prawdziwy pi\u0142karski nokaut. Od pierwszego gwizdka ca\u0142kowicie zdominowa\u0142a wydarzenia na boisku, bezlito\u015Bnie wykorzystywa\u0142a kolejne b\u0142\u0119dy przeciwnika i raz za razem trafia\u0142a do siatki.

Rywal nie by\u0142 w stanie znale\u017A\u0107 \u017Cadnej odpowiedzi na tempo, skuteczno\u015B\u0107 i ofensywn\u0105 si\u0142\u0119 zespo\u0142u. Kolejne bramki tylko potwierdza\u0142y ogromn\u0105 r\xF3\u017Cnic\u0119 klas, a ko\u0144cowy wynik nie pozostawia \u017Cadnych w\u0105tpliwo\u015Bci \u2014 tego dnia na boisku istnia\u0142a tylko jedna dru\u017Cyna.

To nie by\u0142o zwyk\u0142e zwyci\u0119stwo. To by\u0142a demonstracja si\u0142y, bezwzgl\u0119dna dominacja i totalna demolka przeciwnika.`
  },
  TOTALNA_KOMPROMITACJA: {
    headline: (m, _c, context) => `TOTALNA KOMPROMITACJA! DRU\u017BYNA ${context?.managerFullName ?? m} ROZBITA NA BOISKU`,
    body: (m, _c, context) => {
      const managerFullName = context?.managerFullName ?? m;
      return `Dru\u017Cyna prowadzona przez ${managerFullName} ponios\u0142a druzgoc\u0105c\u0105 pora\u017Ck\u0119, prezentuj\u0105c si\u0119 zdecydowanie poni\u017Cej oczekiwa\u0144. Od pierwszych minut rywale przej\u0119li pe\u0142n\u0105 kontrol\u0119 nad spotkaniem, bezlito\u015Bnie wykorzystywali kolejne b\u0142\u0119dy i raz za razem trafiali do siatki.

Zesp\xF3\u0142 ${m} nie potrafi\u0142 znale\u017A\u0107 \u017Cadnej odpowiedzi na przewag\u0119 przeciwnika. Brak organizacji, nieskuteczna gra oraz powa\u017Cne problemy w defensywie sprawi\u0142y, \u017Ce r\xF3\u017Cnica mi\u0119dzy dru\u017Cynami z ka\u017Cd\u0105 kolejn\u0105 minut\u0105 stawa\u0142a si\u0119 coraz bardziej widoczna.

Ko\u0144cowy wynik nie pozostawia miejsca na wym\xF3wki. To nie by\u0142a zwyk\u0142a pora\u017Cka \u2014 to by\u0142 pi\u0142karski nokaut i totalna kompromitacja dru\u017Cyny prowadzonej przez ${managerFullName}.`;
    }
  },
  VAR_KONTROWERSJE: {
    headline: (_m, _c, context) => `Kontrowersje po meczu z ${context?.opponentName ?? "rywalem"}. VAR zn\xF3w w centrum uwagi`,
    body: (_m, _c, context) => {
      const teamName = context?.varControversyTeamName ?? "jedna z dru\u017Cyn";
      const teamRole = context?.varControversyTeamRole ?? "gospodarzy";
      return `Spotkanie zako\u0144czy\u0142o si\u0119 w atmosferze du\u017Cych kontrowersji zwi\u0105zanych z decyzjami s\u0119dziego. Dru\u017Cyna ${teamName} nie mog\u0142a pogodzi\u0107 si\u0119 z nieuznaniem zdobytej bramki, mimo \u017Ce sytuacja zosta\u0142a przeanalizowana z wykorzystaniem systemu VAR. Sztab szkoleniowy oraz zawodnicy ${teamRole} otwarcie protestowali przeciwko tej decyzji, podkre\u015Blaj\u0105c, \u017Ce ich zdaniem gol powinien zosta\u0107 uznany.

Ca\u0142a sytuacja wywo\u0142a\u0142a wiele emocji zar\xF3wno na boisku, jak i na trybunach, a decyzja arbitra mia\u0142a znacz\u0105cy wp\u0142yw na przebieg oraz ko\u0144cowy wynik spotkania. Kontrowersje zwi\u0105zane z prac\u0105 zespo\u0142u s\u0119dziowskiego z pewno\u015Bci\u0105 b\u0119d\u0105 jeszcze d\u0142ugo komentowane przez ekspert\xF3w i kibic\xF3w.`;
    }
  },
  CZERWONA_KARTKA_KONTROWERSJE: {
    headline: (_m, _c, context) => `Kontrowersyjna czerwona kartka w meczu z ${context?.opponentName ?? "rywalem"}`,
    body: (_m, _c, context) => {
      const teamName = context?.redCardControversyTeamName ?? "dru\u017Cyny rywali";
      return `Spotkanie zako\u0144czy\u0142o si\u0119 w atmosferze du\u017Cych emocji po kontrowersyjnej decyzji s\u0119dziego o pokazaniu czerwonej kartki zawodnikowi dru\u017Cyny ${teamName}. Decyzja arbitra znacz\u0105co wp\u0142yn\u0119\u0142a na przebieg meczu, zmuszaj\u0105c zesp\xF3\u0142 do gry w os\u0142abieniu przez znaczn\u0105 cz\u0119\u015B\u0107 spotkania.

Sztab szkoleniowy oraz pi\u0142karze dru\u017Cyny ${teamName} nie kryli swojego niezadowolenia z decyzji s\u0119dziego, argumentuj\u0105c, \u017Ce wykluczenie by\u0142o zbyt surowe. Gra w os\u0142abieniu wyra\u017Anie utrudni\u0142a realizacj\u0119 za\u0142o\u017Ce\u0144 taktycznych, co zosta\u0142o wykorzystane przez rywali i mia\u0142o istotny wp\u0142yw na ko\u0144cowy rezultat spotkania.`;
    }
  },
  NIEPRZYZNANY_KARNY_KONTROWERSJE: {
    headline: (_m, _c, context) => `Karny, kt\xF3ry m\xF3g\u0142 odmieni\u0107 losy meczu z ${context?.opponentName ?? "rywalem"}`,
    body: (_m, _c, context) => {
      const teamName = context?.penaltyNoCallControversyTeamName ?? "dru\u017Cyny rywali";
      return `Spotkanie zako\u0144czy\u0142o si\u0119 w cieniu kontrowersyjnej decyzji s\u0119dziego, kt\xF3ry nie podyktowa\u0142 rzutu karnego dla dru\u017Cyny ${teamName} mimo protest\xF3w zawodnik\xF3w i sztabu szkoleniowego. Arbiter przeanalizowa\u0142 ca\u0142\u0105 sytuacj\u0119 z wykorzystaniem systemu VAR, jednak podtrzyma\u0142 swoj\u0105 pierwotn\u0105 decyzj\u0119.

Nieprzyznanie rzutu karnego wywo\u0142a\u0142o wiele emocji zar\xF3wno na boisku, jak i na trybunach. Przedstawiciele dru\u017Cyny ${teamName} przekonywali, \u017Ce ich zesp\xF3\u0142 zosta\u0142 pozbawiony znakomitej okazji do zdobycia bramki, a decyzja s\u0119dziego mog\u0142a mie\u0107 istotny wp\u0142yw na przebieg oraz ko\u0144cowy rezultat spotkania.`;
    }
  },
  NISKA_OCENA_SEDZIEGO: {
    headline: (_m, _c, context) => `Praca arbitra po meczu z ${context?.opponentName ?? "rywalem"} pod lup\u0105 ekspert\xF3w`,
    body: (_m, _c, context) => {
      const refereeLead = context?.refereeName ? `S\u0119dzia ${context.refereeName}` : "Arbiter";
      return `Spotkanie obfitowa\u0142o w kontrowersje zwi\u0105zane z prac\u0105 zespo\u0142u s\u0119dziowskiego. ${refereeLead} przez wi\u0119ksz\u0105 cz\u0119\u015B\u0107 meczu mia\u0142 wyra\u017Ane problemy z utrzymaniem kontroli nad wydarzeniami na boisku, a jego decyzje wielokrotnie spotyka\u0142y si\u0119 z protestami zawodnik\xF3w i sztab\xF3w obu dru\u017Cyn.

Zdaniem wielu obserwator\xF3w kilka kluczowych decyzji s\u0119dziego mia\u0142o wp\u0142yw na przebieg spotkania, co dodatkowo podgrza\u0142o atmosfer\u0119 rywalizacji. Liczne przerwy, dyskusje z pi\u0142karzami oraz narastaj\u0105ce napi\u0119cie sprawi\u0142y, \u017Ce praca arbitra sta\u0142a si\u0119 jednym z g\u0142\xF3wnych temat\xF3w pomeczowych analiz.`;
    }
  },
  TRENER_AI_KRYTYKUJE_VAR_PO_ANULOWANEJ_BRAMCE: {
    headline: (_m, _c, context) => `Trener ${context?.aiVarCriticismTeamName ?? "rywali"} krytykuje VAR po meczu z ${context?.opponentName ?? "rywalem"}`,
    body: (_m, _c, context) => {
      const teamName = context?.aiVarCriticismTeamName ?? "rywali";
      return `Po zako\u0144czeniu spotkania trener dru\u017Cyny ${teamName} nie kry\u0142 rozczarowania prac\u0105 zespo\u0142u s\u0119dziowskiego. Podczas pomeczowej konferencji prasowej otwarcie skrytykowa\u0142 decyzje arbitra, podkre\u015Blaj\u0105c, \u017Ce jego zdaniem mia\u0142y one znacz\u0105cy wp\u0142yw na przebieg meczu.

Szkoleniowiec zwr\xF3ci\u0142 r\xF3wnie\u017C uwag\u0119 na rol\u0119 systemu VAR, stawiaj\u0105c pytanie o zasadno\u015B\u0107 jego wykorzystywania w obecnej formie. Jak zaznaczy\u0142, skoro identyczne lub bardzo podobne sytuacje s\u0105 interpretowane w r\xF3\u017Cny spos\xF3b, trudno m\xF3wi\u0107 o zachowaniu pe\u0142nej sp\xF3jno\u015Bci i przewidywalno\u015Bci decyzji. Wed\u0142ug trenera technologia powinna pomaga\u0107 w eliminowaniu b\u0142\u0119d\xF3w, tymczasem wci\u0105\u017C pozostawia wiele miejsca na odmienne interpretacje przepis\xF3w.

Wypowied\u017A szkoleniowca wywo\u0142a\u0142a szerok\u0105 dyskusj\u0119 w\u015Br\xF3d ekspert\xF3w i kibic\xF3w, po raz kolejny rozpoczynaj\u0105c debat\u0119 na temat skuteczno\u015Bci systemu VAR oraz sposobu jego wykorzystywania podczas najwa\u017Cniejszych spotka\u0144.`;
    }
  }
};

// services/MediaInterviewService.ts
var NEWSPAPER_DISPLAY_NAMES = {
  ["GAZETA_SPORTOWA" /* GAZETA_SPORTOWA */]: "Gazeta Sportowa",
  ["DWIE_BRAMKI" /* DWIE_BRAMKI */]: "Dwie Bramki",
  ["PILKA_NOZNA" /* PILKA_NOZNA */]: "Pi\u0142ka No\u017Cna",
  ["FUTBOL_NAD_WISLA" /* FUTBOL_NAD_WISLA */]: "Futbol nad Wis\u0142\u0105",
  ["DZIENNIK_SPORTOWY" /* DZIENNIK_SPORTOWY */]: "Dziennik Sportowy"
};
var INITIAL_RELATIONSHIP = 50;
var MIN_RELATIONSHIP = 0;
var MAX_RELATIONSHIP = 100;
var MIN_PRESS_SURNAME_LENGTH = 3;
var DENIED_PRESS_OUTCOMES = [
  { variant: "ODMOWA_NEGATYWNA", relationshipDelta: -12, weight: 70 },
  { variant: "ODMOWA_NEUTRALNA", relationshipDelta: -6, weight: 15 },
  { variant: "ODMOWA_POZYTYWNA", relationshipDelta: -2, weight: 15 }
];
var UNFRIENDLY_RELATIONSHIP_THRESHOLD = 38;
var UNFRIENDLY_SEASON_PRESS_VARIANTS = [
  "NIEPRZYCHYLNE_AUTORYTET",
  "NIEPRZYCHYLNE_SZATNIA",
  "NIEPRZYCHYLNE_KRYZYS"
];
var FRIENDLY_RELATIONSHIP_THRESHOLD = 62;
var FRIENDLY_GOOD_RESULTS_PRESS_VARIANTS = [
  "PRZYCHYLNE_DOBRY_START",
  "PRZYCHYLNE_ZWYCIESKI_START",
  "PRZYCHYLNE_SZATNIA"
];
var FRIENDLY_GOOD_RESULTS_MID_SEASON_PRESS_VARIANTS = [
  "PRZYCHYLNE_DOBRA_FORMA"
];
var FRIENDLY_WEAK_START_PRESS_VARIANTS = [
  "PRZYCHYLNE_SZATNIA",
  "PRZYCHYLNE_SLABY_OPTYMIZM",
  "PRZYCHYLNE_SLABY_SZATNIA"
];
var FRIENDLY_WEAK_MID_SEASON_PRESS_VARIANTS = [
  "PRZYCHYLNE_TRUDNY_OKRES"
];
var MediaInterviewService = class _MediaInterviewService {
  static getTakingOverInterviewMailId(userClub2, currentDate2) {
    const dateKey = currentDate2.toISOString().split("T")[0];
    return `MEDIA_INTERVIEW_OBJECIE_${userClub2.id}_${dateKey}`;
  }
  static getPressManagerLabel(managerName) {
    const normalized = managerName?.trim().replace(/\s+/g, " ");
    if (!normalized) return "nowego trenera";
    const parts = normalized.split(" ");
    const lastPart = parts[parts.length - 1] ?? "";
    if (lastPart.length >= MIN_PRESS_SURNAME_LENGTH) return lastPart;
    if (parts.length > 1) return normalized;
    return "nowego trenera";
  }
  static initRelationships() {
    const result = {};
    for (const newspaper of Object.values(Newspaper)) {
      result[newspaper] = INITIAL_RELATIONSHIP;
    }
    return result;
  }
  static pickQuestion(newspaper) {
    const pool = INTERVIEW_POOL[newspaper];
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  static pickQuestionVariant(question) {
    const { questionVariants } = question;
    return questionVariants[Math.floor(Math.random() * questionVariants.length)];
  }
  static updateRelationship(mediaRelationships, newspaper, delta) {
    const current = mediaRelationships[newspaper] ?? INITIAL_RELATIONSHIP;
    const updated = Math.min(MAX_RELATIONSHIP, Math.max(MIN_RELATIONSHIP, current + delta));
    return { ...mediaRelationships, [newspaper]: updated };
  }
  static calculateTotalScore(answers) {
    return answers.reduce(
      (acc, a) => ({
        morale: acc.morale + a.score.morale,
        kibice: acc.kibice + a.score.kibice,
        zarzad: acc.zarzad + a.score.zarzad,
        zawodnicy: acc.zawodnicy + a.score.zawodnicy
      }),
      { morale: 0, kibice: 0, zarzad: 0, zawodnicy: 0 }
    );
  }
  static getRivalClubName(clubName) {
    const direct = directRivalries.find((r) => r.clubs.includes(clubName));
    if (direct) {
      return direct.clubs.find((c) => c !== clubName) ?? "rywal";
    }
    const group = rivalryGroups.find((r) => r.clubs.includes(clubName));
    if (group) {
      return group.clubs.find((c) => c !== clubName) ?? "rywal";
    }
    return "rywal";
  }
  static buildPlaceholders(userClub2, squad, managerName) {
    const captain = userClub2.captainId ? squad.find((p) => p.id === userClub2.captainId) : null;
    const captainName = captain ? `${captain.firstName} ${captain.lastName}` : squad.length > 0 ? `${squad[0].firstName} ${squad[0].lastName}` : "kapitan";
    const sorted = [...squad].sort((a, b) => b.overallRating - a.overallRating);
    const starPlayer = sorted[0];
    const starPlayerName = starPlayer ? `${starPlayer.firstName} ${starPlayer.lastName}` : "lider dru\u017Cyny";
    const sortedByAge = [...squad].sort((a, b) => a.age - b.age);
    const youngPlayer = sortedByAge[0];
    const youngPlayerName = youngPlayer ? `${youngPlayer.firstName} ${youngPlayer.lastName}` : "m\u0142ody zawodnik";
    const rivalClubName = _MediaInterviewService.getRivalClubName(userClub2.name);
    const objective = userClub2.sportingDirectorObjective?.title ?? "";
    const boardExpectations = objective || "realizacj\u0119 cel\xF3w sezonowych";
    const clubObjective = objective || "awans w rozgrywkach";
    return {
      clubName: userClub2.name,
      previousManager: "poprzedni trener",
      captainName,
      starPlayer: starPlayerName,
      youngPlayer: youngPlayerName,
      rivalClub: rivalClubName,
      boardExpectations,
      clubObjective,
      managerName
    };
  }
  static generateTakingOverInterviewMail(userClub2, squad, managerName, currentDate2) {
    const newspapers = Object.values(Newspaper);
    const newspaper = newspapers[Math.floor(Math.random() * newspapers.length)];
    const displayName = NEWSPAPER_DISPLAY_NAMES[newspaper];
    const pool = INTERVIEW_POOL[newspaper].filter(
      (q) => q.situation === "OBJECIE_STANOWISKA" && q.answers.length > 0
    );
    const count = Math.min(pool.length, Math.floor(Math.random() * 5) + 6);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const questionIds = shuffled.slice(0, count).map((q) => q.id);
    const placeholders = _MediaInterviewService.buildPlaceholders(userClub2, squad, managerName);
    const deadline = new Date(currentDate2);
    deadline.setDate(deadline.getDate() + 7);
    return {
      id: _MediaInterviewService.getTakingOverInterviewMailId(userClub2, currentDate2),
      sender: displayName,
      role: "Dziennikarz",
      subject: `${managerName} trenerem ${userClub2.name}`,
      body: `Redakcja ${displayName} zwraca si\u0119 z pro\u015Bb\u0105 o udzielenie wywiadu w zwi\u0105zku z obj\u0119ciem stanowiska trenera ${userClub2.name}.

Termin odpowiedzi: ${deadline.toLocaleDateString("pl-PL")}.`,
      date: new Date(currentDate2),
      isRead: false,
      type: "MEDIA" /* MEDIA */,
      priority: 60,
      metadata: {
        type: "INTERVIEW_REQUEST",
        newspaper,
        questionIds,
        placeholders,
        deadline: deadline.toISOString(),
        interviewKind: "TAKING_OVER"
      }
    };
  }
  static generateSeasonInterviewMail(userClub2, squad, managerName, currentDate2, situation) {
    const newspapers = Object.values(Newspaper);
    const newspaper = newspapers[Math.floor(Math.random() * newspapers.length)];
    const displayName = NEWSPAPER_DISPLAY_NAMES[newspaper];
    const pool = INTERVIEW_POOL[newspaper].filter(
      (q) => q.situation === situation && q.answers.length > 0
    );
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const questionIds = shuffled.slice(0, Math.min(pool.length, 6)).map((q) => q.id);
    const placeholders = _MediaInterviewService.buildPlaceholders(userClub2, squad, managerName);
    const deadline = new Date(currentDate2);
    deadline.setDate(deadline.getDate() + 7);
    const subjectBySituation = {
      SEZON_AWANS: `Nowy sezon po awansie ${userClub2.name}`,
      SEZON_MISTRZ: `${userClub2.name} zaczyna sezon jako mistrz Polski`,
      SEZON_PUCHAR: `${userClub2.name} po zdobyciu Pucharu Polski`,
      SEZON_DUBLET: `${userClub2.name} po historycznym dublecie`,
      SEZON_BRAK_AWANSU: `${userClub2.name} przed kolejn\u0105 pr\xF3b\u0105 awansu`,
      SEZON_EUROPEJSKIE_PUCHARY: `${userClub2.name} przed gr\u0105 w Europie`,
      SEZON_UNIWERSALNY: `${userClub2.name} przed nowym sezonem`
    };
    return {
      id: `MEDIA_INTERVIEW_SEASON_${situation}_${currentDate2.getFullYear()}_${userClub2.id}`,
      sender: displayName,
      role: "Dziennikarz",
      subject: subjectBySituation[situation],
      body: `Redakcja ${displayName} zwraca si\u0119 z pro\u015Bb\u0105 o udzielenie wywiadu przed startem nowego sezonu.

Termin odpowiedzi: ${deadline.toLocaleDateString("pl-PL")}.`,
      date: new Date(currentDate2),
      isRead: false,
      type: "MEDIA" /* MEDIA */,
      priority: 55,
      metadata: {
        type: "INTERVIEW_REQUEST",
        newspaper,
        questionIds,
        placeholders,
        deadline: deadline.toISOString(),
        interviewKind: "SEASON"
      }
    };
  }
  static generateInterviewRequestMail(newspaper, currentDate2, question) {
    const displayName = NEWSPAPER_DISPLAY_NAMES[newspaper];
    const questionText = _MediaInterviewService.pickQuestionVariant(question);
    return {
      id: `INTERVIEW_REQUEST_${newspaper}_${currentDate2.getTime()}`,
      sender: displayName,
      role: "Dziennikarz",
      subject: `Pro\u015Bba o wywiad \u2014 ${displayName}`,
      body: `Redakcja ${displayName} zwraca si\u0119 z pro\u015Bb\u0105 o udzielenie wywiadu.

Pytanie: ${questionText}`,
      date: new Date(currentDate2),
      isRead: false,
      type: "MEDIA" /* MEDIA */,
      priority: 30,
      metadata: {
        type: "INTERVIEW_REQUEST",
        newspaper,
        questionIds: [question.id],
        placeholders: {},
        deadline: new Date(currentDate2.getTime() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
        interviewKind: "GENERAL"
      }
    };
  }
  static sumProfileScore(answers) {
    return answers.reduce(
      (acc, a) => ({
        optymizm: acc.optymizm + a.profileScore.optymizm,
        realizm: acc.realizm + a.profileScore.realizm,
        pewnoscSiebie: acc.pewnoscSiebie + a.profileScore.pewnoscSiebie,
        dyplomacja: acc.dyplomacja + a.profileScore.dyplomacja,
        presjaZespol: acc.presjaZespol + a.profileScore.presjaZespol,
        presjaZarzad: acc.presjaZarzad + a.profileScore.presjaZarzad,
        ambicja: acc.ambicja + a.profileScore.ambicja,
        ryzykoKonfliktu: acc.ryzykoKonfliktu + a.profileScore.ryzykoKonfliktu,
        zaufanieKibicow: acc.zaufanieKibicow + a.profileScore.zaufanieKibicow,
        zaufanieSzatni: acc.zaufanieSzatni + a.profileScore.zaufanieSzatni
      }),
      { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
    );
  }
  static determinePressVariant(total) {
    if (total.optymizm >= 9 && total.ambicja >= 5 && total.realizm <= 2)
      return "ZBYTNI_OPTYMISTA";
    if (total.pewnoscSiebie >= 8 && total.ambicja >= 5 && total.optymizm >= 5 && total.realizm <= 5)
      return "SHOWMAN";
    if (total.presjaZespol >= 2 && total.pewnoscSiebie >= 4 && total.ryzykoKonfliktu >= 3)
      return "TWARDY_LIDER";
    if (total.dyplomacja >= 9 && total.pewnoscSiebie <= 3 && total.ambicja <= 3 && total.optymizm <= 4)
      return "ZBYT_DYPLOMATYCZNY";
    if (total.dyplomacja >= 7 && total.realizm >= 4 && total.ambicja >= 4 && total.pewnoscSiebie >= 3)
      return "WIZJONER";
    if (total.realizm >= 7 && total.dyplomacja >= 3 && total.optymizm <= 6 && total.ryzykoKonfliktu <= 3)
      return "PRAGMATYK";
    return "OPTYMISTA";
  }
  static determineDeniedPressOutcome() {
    const totalWeight = DENIED_PRESS_OUTCOMES.reduce((sum, outcome) => sum + outcome.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const outcome of DENIED_PRESS_OUTCOMES) {
      roll -= outcome.weight;
      if (roll <= 0) {
        return {
          variant: outcome.variant,
          relationshipDelta: outcome.relationshipDelta
        };
      }
    }
    const fallback = DENIED_PRESS_OUTCOMES[0];
    return {
      variant: fallback.variant,
      relationshipDelta: fallback.relationshipDelta
    };
  }
  static pickUnfriendlyNewspaper(mediaRelationships) {
    const unfriendlyNewspapers = Object.values(Newspaper).filter(
      (newspaper) => (mediaRelationships[newspaper] ?? INITIAL_RELATIONSHIP) <= UNFRIENDLY_RELATIONSHIP_THRESHOLD
    );
    if (unfriendlyNewspapers.length === 0) return null;
    return unfriendlyNewspapers[Math.floor(Math.random() * unfriendlyNewspapers.length)];
  }
  static pickFriendlyNewspaper(mediaRelationships) {
    const friendlyNewspapers = Object.values(Newspaper).filter(
      (newspaper) => (mediaRelationships[newspaper] ?? INITIAL_RELATIONSHIP) >= FRIENDLY_RELATIONSHIP_THRESHOLD
    );
    if (friendlyNewspapers.length === 0) return null;
    return friendlyNewspapers[Math.floor(Math.random() * friendlyNewspapers.length)];
  }
  static determineUnfriendlySeasonPressVariant() {
    return UNFRIENDLY_SEASON_PRESS_VARIANTS[Math.floor(Math.random() * UNFRIENDLY_SEASON_PRESS_VARIANTS.length)];
  }
  static determineFriendlySeasonPressVariant(hasGoodResults, latestWasWin = true, isEarlySeason = true) {
    const baseVariants = hasGoodResults ? isEarlySeason ? FRIENDLY_GOOD_RESULTS_PRESS_VARIANTS : FRIENDLY_GOOD_RESULTS_MID_SEASON_PRESS_VARIANTS : isEarlySeason ? FRIENDLY_WEAK_START_PRESS_VARIANTS : FRIENDLY_WEAK_MID_SEASON_PRESS_VARIANTS;
    const variants = baseVariants.filter(
      (variant) => latestWasWin || variant !== "PRZYCHYLNE_ZWYCIESKI_START"
    );
    return variants[Math.floor(Math.random() * variants.length)];
  }
  static generatePressArticleMail(variant, newspaper, managerLastName, clubName, currentDate2, context) {
    const displayName = NEWSPAPER_DISPLAY_NAMES[newspaper];
    const article = PRESS_ARTICLES[variant];
    const deliveryDate = new Date(currentDate2);
    deliveryDate.setDate(deliveryDate.getDate() + 2 + Math.floor(Math.random() * 2));
    return {
      id: `PRESS_ARTICLE_${newspaper}_${currentDate2.getTime()}`,
      sender: displayName,
      role: "Dziennikarz",
      subject: article.headline(managerLastName, clubName, context),
      body: article.body(managerLastName, clubName, context),
      date: deliveryDate,
      isRead: false,
      type: "PRESS" /* PRESS */,
      priority: 45
    };
  }
};

// resources/static_db/names/pl_data.ts
var PL_MALE_FIRSTNAMES = [
  "Adam",
  "Adrian",
  "Alan",
  "Albert",
  "Aleks",
  "Aleksander",
  "Aleksy",
  "Amadeusz",
  "Andrzej",
  "Antoni",
  "Arkadiusz",
  "Artur",
  "Augustyn",
  "Bartek",
  "Bart\u0142omiej",
  "Bartosz",
  "Bazyli",
  "Beniamin",
  "B\u0142a\u017Cej",
  "Bogdan",
  "Boles\u0142aw",
  "Bonifacy",
  "Borys",
  "Bronis\u0142aw",
  "Bruno",
  "Cezary",
  "Cyprian",
  "Czes\u0142aw",
  "Damian",
  "Daniel",
  "Dariusz",
  "Dawid",
  "Denis",
  "Dionizy",
  "Dobromi\u0142",
  "Dominik",
  "Emil",
  "Eryk",
  "Euzebiusz",
  "Fabian",
  "Feliks",
  "Filip",
  "Florian",
  "Franciszek",
  "Fryderyk",
  "Gabriel",
  "Gerard",
  "Grzegorz",
  "Gustaw",
  "Henryk",
  "Hubert",
  "Hugo",
  "Igor",
  "Ignacy",
  "Ireneusz",
  "Iwo",
  "Izaak",
  "Jacek",
  "Jakub",
  "Jan",
  "Janusz",
  "Jaromir",
  "Jaros\u0142aw",
  "Jeremi",
  "Jerzy",
  "J\u0119drzej",
  "Joachim",
  "Jonasz",
  "J\xF3zef",
  "Julian",
  "Juliusz",
  "Justyn",
  "Kacper",
  "Kajetan",
  "Kamil",
  "Karol",
  "Kasper",
  "Klemens",
  "Konrad",
  "Kornel",
  "Korneliusz",
  "Krystian",
  "Krzysztof",
  "Ksawery",
  "Kuba",
  "Lech",
  "Leon",
  "Leonard",
  "Leszek",
  "Lucjan",
  "Ludwik",
  "\u0141ukasz",
  "Maciej",
  "Maksym",
  "Maksymilian",
  "Marcel",
  "Marceli",
  "Marcin",
  "Marek",
  "Mariusz",
  "Mateusz",
  "Maurycy",
  "Micha\u0142",
  "Mieczys\u0142aw",
  "Mieszko",
  "Miko\u0142aj",
  "Mi\u0142osz",
  "Natan",
  "Nataniel",
  "Nikodem",
  "Norbert",
  "Olaf",
  "Olgierd",
  "Oliwier",
  "Oskar",
  "Patryk",
  "Pawe\u0142",
  "Piotr",
  "Przemys\u0142aw",
  "Rados\u0142aw",
  "Radomi\u0142",
  "Rafa\u0142",
  "Remigiusz",
  "Robert",
  "Roch",
  "Roman",
  "Ryszard",
  "Sebastian",
  "Sergiusz",
  "Seweryn",
  "S\u0142awomir",
  "Stanis\u0142aw",
  "Stefan",
  "Sylwester",
  "Szymon",
  "Tadeusz",
  "Teodor",
  "Tobiasz",
  "Tomasz",
  "Tymon",
  "Tymoteusz",
  "Tytus",
  "Wac\u0142aw",
  "Waldemar",
  "Wawrzyniec",
  "Wiktor",
  "Wit",
  "Witold",
  "W\u0142adys\u0142aw",
  "W\u0142odzimierz",
  "Wojciech",
  "Zbigniew",
  "Zbyszko",
  "Zdzis\u0142aw",
  "Zenon",
  "Zygfryd",
  "Zygmunt",
  "\u017Belis\u0142aw"
];
var PL_MALE_LASTNAMES = [
  "Nowak",
  "Kowalski",
  "Wi\u015Bniewski",
  "W\xF3jcik",
  "Kowalczyk",
  "Kami\u0144ski",
  "Lewandowski",
  "Zieli\u0144ski",
  "Szyma\u0144ski",
  "Wo\u017Aniak",
  "D\u0105browski",
  "Koz\u0142owski",
  "Jankowski",
  "Mazur",
  "Wojciechowski",
  "Kwiatkowski",
  "Krawczyk",
  "Kaczmarek",
  "Piotrowski",
  "Grabowski",
  "Nowakowski",
  "Paw\u0142owski",
  "Michalski",
  "Kr\xF3l",
  "Wr\xF3bel",
  "Jab\u0142o\u0144ski",
  "Majewski",
  "Olszewski",
  "Jaworski",
  "Malinowski",
  "Pawlak",
  "Witkowski",
  "Walczak",
  "St\u0119pie\u0144",
  "G\xF3rski",
  "Rutkowski",
  "Michalak",
  "Sikora",
  "Baran",
  "Szewczyk",
  "Ostrowski",
  "Tomaszewski",
  "Pietrzak",
  "Marciniak",
  "Wr\xF3blewski",
  "Zalewski",
  "Jakubowski",
  "Jasi\u0144ski",
  "Zawadzki",
  "Sadowski",
  "B\u0105k",
  "Chmielewski",
  "W\u0142odarczyk",
  "Borkowski",
  "Czarnecki",
  "Sawicki",
  "Soko\u0142owski",
  "Urba\u0144ski",
  "Kubiak",
  "Maciejewski",
  "Szczepa\u0144ski",
  "Kucharski",
  "Wilk",
  "Kali\u0144ski",
  "Wysocki",
  "Adamski",
  "Sobczak",
  "Czerwi\u0144ski",
  "Andrzejewski",
  "Cie\u015Blak",
  "G\u0142owacki",
  "Zakrzewski",
  "Ko\u0142odziej",
  "Sikorski",
  "Krajewski",
  "Zaj\u0105c",
  "Szulc",
  "Baranowski",
  "Laskowski",
  "Brzezi\u0144ski",
  "Makowski",
  "Przybylski",
  "Duda",
  "Pawlik",
  "Kruk",
  "J\xF3\u017Awiak",
  "Kurek",
  "Olszak",
  "Mr\xF3z",
  "Ka\u017Amierczak",
  "Sobolewski",
  "Kaczmarczyk",
  "Zi\xF3\u0142kowski",
  "Markowski",
  "Tomczak",
  "Weso\u0142owski",
  "Kurowski",
  "Krupa",
  "Lis",
  "Mazurek",
  "Klimczak",
  "Wasilewski",
  "Zawistowski",
  "Konieczny",
  "Fr\u0105ckowiak",
  "\u017Bukowski",
  "Doma\u0144ski",
  "Or\u0142owski",
  "Wieczorek",
  "M\u0142ynarczyk",
  "Bednarek",
  "Bielecki",
  "Rogowski",
  "Kowalewski",
  "Sowa",
  "Czajkowski",
  "Gajewski",
  "Lipski",
  "Zarzycki",
  "Szymczak",
  "Cichy",
  "Janicki",
  "Leszczy\u0144ski",
  "Kowal",
  "Paj\u0105k",
  "Wojtas",
  "Kozak",
  "Piotrowicz",
  "Stankiewicz",
  "K\u0119dzierski",
  "Dziedzic",
  "Kuczy\u0144ski",
  "B\u0142aszczyk",
  "Ratajczak",
  "Chojnacki",
  "K\u0142os",
  "Kubicki",
  "Wojtkowiak",
  "Romanowski",
  "Kowalik",
  "Kaczy\u0144ski",
  "Witek",
  "Kozio\u0142",
  "Pietrzyk",
  "Janik",
  "Cie\u015Blik",
  "Dudek",
  "Koprowski",
  "Grzelak",
  "Nowicki",
  "Mroczek",
  "Sroka",
  "Wojtczak",
  "Kozakiewicz",
  "Wierzbicki",
  "Kaczor",
  "Banach",
  "Bara\u0144ski",
  "Bielecki",
  "B\u0142aszczak",
  "Bobrowski",
  "Borowski",
  "Brzozowski",
  "Budzy\u0144ski",
  "Cebula",
  "Chmura",
  "Cicho\u0144",
  "Ciesielski",
  "Cybulski",
  "Dobrowolski",
  "Domaga\u0142a",
  "Dudek",
  "Fabisiak",
  "Falkowski",
  "G\u0105sior",
  "Gajewski",
  "Graczyk",
  "Gruszczy\u0144ski",
  "Grzyb",
  "Guzik",
  "Hajduk",
  "J\u0119drzejczak",
  "J\u0119drzejewski",
  "Jurkiewicz",
  "Kaleta",
  "Karpi\u0144ski",
  "Kasprzak",
  "Kaszuba",
  "Kawecki",
  "K\u0119dziora",
  "Kie\u0142basa",
  "Kmiecik",
  "Ko\u0142akowski",
  "Komorowski",
  "Kopczy\u0144ski",
  "Korzeniowski",
  "Kosowski",
  "Kostrzewa",
  "Kot",
  "Kotowski",
  "Krawiec",
  "Krzemi\u0144ski",
  "Kujawa",
  "Kujawski",
  "Kulig",
  "Lach",
  "Lenart",
  "Lisiak",
  "Lisiecki",
  "\u0141api\u0144ski",
  "\u0141uczak",
  "\u0141ukasiewicz",
  "Madej",
  "Madejski",
  "Majchrzak",
  "Marczak",
  "Markiewicz",
  "Marsza\u0142ek",
  "Marzec",
  "Mas\u0142owski",
  "Matusiak",
  "Matuszewski",
  "Matysiak",
  "Mazurkiewicz",
  "Michalik",
  "Mierzejewski",
  "Mika",
  "Miko\u0142ajczak",
  "Miko\u0142ajczyk",
  "Milewski",
  "Mi\u0142ek",
  "Modzelewski",
  "Morawski",
  "Murawski",
  "Musia\u0142",
  "Muszy\u0144ski",
  "Nadolski",
  "Noga",
  "Olejniczak",
  "Olejnik",
  "Orzechowski",
  "Owczarek",
  "Paciorek",
  "Panek",
  "Paszkiewicz",
  "Pawlicki",
  "Pawlikowski",
  "P\u0119kala",
  "Pi\u0105tek",
  "Piekarski",
  "Pieczy\u0144ski",
  "Pietras",
  "Pilch",
  "Piwowarczyk",
  "Podg\xF3rski",
  "Polak",
  "Pola\u0144ski",
  "Pop\u0142awski",
  "Por\u0119bski",
  "Prus",
  "Przyby\u0142a",
  "Pucha\u0142a",
  "Pyka",
  "Raczy\u0144ski",
  "Radomski",
  "Rakowski",
  "Rataj",
  "Reczek",
  "Rogala",
  "Rogalski",
  "Rojek",
  "Roszak",
  "Rudnicki",
  "Rybak",
  "Rybarczyk",
  "Rybi\u0144ski",
  "Rzepka",
  "Sajdak",
  "Salamon",
  "Sasin",
  "Serafin",
  "Sidor",
  "Sienkiewicz",
  "Skiba",
  "Skowron",
  "Skrzypczak",
  "Skrzypek",
  "S\u0142awik",
  "S\u0142o\u0144ski",
  "Smoli\u0144ski",
  "Sobczyk",
  "Sobiech",
  "Sochacki",
  "Solecki",
  "Sowi\u0144ski",
  "Stachowiak",
  "Stachura",
  "Stanek",
  "Staszewski",
  "Sta\u0144czyk",
  "Stolarski",
  "Strzelecki",
  "Strzelczyk",
  "Suchodolski",
  "Surma",
  "Szablewski",
  "Szadkowski",
  "Szarek",
  "Szcze\u015Bniak",
  "Szczotka",
  "Szczygie\u0142",
  "Szpak",
  "Szuba",
  "Szyd\u0142owski",
  "\u015Aliwa",
  "\u015Aliwi\u0144ski",
  "\u015Awi\u0105tek",
  "\u015Awiderski",
  "Taras",
  "Tatarek",
  "Tokarski",
  "Tomczyk",
  "Tracz",
  "Trzci\u0144ski",
  "Turowski",
  "Twardowski",
  "Urbanek",
  "Walkowiak",
  "Wcis\u0142o",
  "Wicher",
  "Wilczek",
  "Wilczy\u0144ski",
  "Wnuk",
  "W\xF3jcicki",
  "Wrzesi\u0144ski",
  "Zaborowski",
  "Zag\xF3rski",
  "Zaremba",
  "Zborowski",
  "Zi\u0119ba",
  "Zi\u0119tek",
  "Zych",
  "\u017Bak",
  "\u017Bbikowski",
  "\u017Bebrowski",
  "\u017Belazny",
  "\u017Bmuda",
  "\u017Buk",
  "\u017Burawski",
  "\u017Burek"
];

// resources/static_db/names/balkan_data.ts
var BALKAN_MALE_FIRSTNAMES = [
  "Luka",
  "Marko",
  "Ivan",
  "Nikola",
  "Milo\u0161",
  "Dragan",
  "Stefan",
  "Damir",
  "Zoran",
  "Darko",
  "Vedran",
  "Ante",
  "Josip",
  "Tomislav",
  "Filip",
  "Mateo",
  "Dominik",
  "Petar",
  "Aleksandar",
  "Dejan",
  "Mirko",
  "Slobodan",
  "Goran",
  "Nenad",
  "Bojan",
  "Milan",
  "Viktor",
  "Kristijan",
  "Andrej",
  "Mihael",
  "Alen",
  "Emir",
  "Amar",
  "Haris",
  "Armin",
  "Edin",
  "Admir",
  "Besmir",
  "Ilir",
  "Arben",
  "Sokol",
  "Valon",
  "Liridon",
  "Mergim",
  "Faton",
  "Blendi",
  "Elvin",
  "Arijan",
  "Ezgjan",
  "Visar",
  "Ahmed",
  "Daris",
  "Davud",
  "Adin",
  "Hamza",
  "Ali",
  "Harun",
  "Eman",
  "Ajnur",
  "Imran",
  "Tarik",
  "Emin",
  "D\u017Ean",
  "Omar",
  "Ajdin",
  "Muhamed",
  "Vedad",
  "Bilal",
  "Benjamin",
  "Arslan",
  "Mak",
  "Faris",
  "Danin",
  "Kerim",
  "Jusuf",
  "Mahir",
  "Rejjan",
  "Fatih",
  "Mirza",
  "Rocco",
  "Simon",
  "Joseph",
  "David",
  "Jakov",
  "Toma",
  "Niko",
  "Vasilije",
  "Vuka\u0161in",
  "Vuk",
  "Vukan",
  "Bogdan",
  "Lazar",
  "Aleksa",
  "Strahinja",
  "Uro\u0161",
  "Andrija",
  "Jovan",
  "\u0110or\u0111e",
  "Kosta",
  "Sava",
  "Teodor",
  "Vojin"
];
var BALKAN_MALE_LASTNAMES = [
  "Kova\u010Di\u0107",
  "Petrovi\u0107",
  "Jovanovi\u0107",
  "Popovi\u0107",
  "Horvat",
  "Babi\u0107",
  "Vukovi\u0107",
  "Radi\u0107",
  "\u0160ari\u0107",
  "Peri\u0107",
  "Mati\u0107",
  "Pavlovi\u0107",
  "Markovi\u0107",
  "Ili\u0107",
  "\u0110uri\u0107",
  "Kova\u010Devi\u0107",
  "Nikoli\u0107",
  "Stojanovi\u0107",
  "Milo\u0161evi\u0107",
  "Luki\u0107",
  "Tomi\u0107",
  "Bla\u017Eevi\u0107",
  "\u010Covi\u0107",
  "Hod\u017Ei\u0107",
  "Halilovi\u0107",
  "Ahmetovi\u0107",
  "Muji\u0107",
  "Deli\u0107",
  "\u0160i\u0161i\u0107",
  "Berisha",
  "Krasniqi",
  "Gashi",
  "Tahiri",
  "Hyseni",
  "Rexhepi",
  "Jashari",
  "Aliu",
  "Veliu",
  "Demiri",
  "Osmani",
  "Ristovski",
  "Trajkovski",
  "Pandevski",
  "Spirovski",
  "Stojkovi\u0107",
  "Marjanovi\u0107",
  "Dragi\u0107",
  "Vuli\u0107",
  "Zori\u0107",
  "\u0110or\u0111evi\u0107",
  "Stankovi\u0107",
  "Ivanovi\u0107",
  "Kne\u017Eevi\u0107",
  "Filipovi\u0107",
  "Juri\u0107",
  "Anti\u0107",
  "Bojani\u0107",
  "Cvetkovi\u0107",
  "Dimitrijevi\u0107",
  "Grgi\u0107",
  "Had\u017Ei\u0107",
  "Ibrahimovi\u0107",
  "Hasanovi\u0107",
  "Mehmedovi\u0107",
  "Kelmendi",
  "Shkreli",
  "Mustafa",
  "Hoxha",
  "Prifti",
  "Dervishi",
  "Ivanov",
  "Georgiev",
  "Dimitrov",
  "Popov",
  "Hristov",
  "Angelov",
  "Vasilev",
  "Petrov",
  "Iliev",
  "Todorov",
  "Marinov",
  "Popescu",
  "Ionescu",
  "Constantinescu",
  "Georgescu",
  "Radu",
  "Dumitrescu",
  "Novak",
  "Kova\u010D",
  "Zupan",
  "Krajnc",
  "Ho\u010Devar",
  "Begi\u0107",
  "Suba\u0161i\u0107",
  "Zlatar",
  "Kolar",
  "Vlah",
  "Mirkovi\u0107"
];

// resources/static_db/names/czsk_data.ts
var CZSK_MALE_FIRSTNAMES = [
  "Tom\xE1\u0161",
  "Jakub",
  "Jan",
  "Luk\xE1\u0161",
  "Ond\u0159ej",
  "Adam",
  "Mat\u011Bj",
  "Filip",
  "Petr",
  "Ji\u0159\xED",
  "Martin",
  "David",
  "Michal",
  "Pavel",
  "Marek",
  "V\xE1clav",
  "Josef",
  "Daniel",
  "Patrik",
  "Dominik",
  "\u0160t\u011Bp\xE1n",
  "Roman",
  "Milan",
  "Franti\u0161ek",
  "Karel",
  "Vojt\u011Bch",
  "Radim",
  "Zden\u011Bk",
  "Miroslav",
  "Jaroslav",
  "Lubo\u0161",
  "Radek",
  "Ale\u0161",
  "Vladim\xEDr",
  "Richard",
  "Samuel",
  "Kristi\xE1n",
  "Erik",
  "Denis",
  "Peter",
  "Juraj",
  "Branislav",
  "Matej",
  "Stanislav",
  "Jozef",
  "Ladislav",
  "Du\u0161an",
  "Ivan",
  "Tibor",
  "Oliver",
  "Mat\xFA\u0161",
  "Samuel",
  "Michal",
  "Tom\xE1\u0161",
  "Jakub",
  "Adam",
  "Martin",
  "Luk\xE1\u0161",
  "Filip",
  "Matej",
  "Dominik",
  "Richard",
  "Nikolas",
  "Tom\xE1\u0161",
  "Alex",
  "Marko",
  "Timotej",
  "J\xE1n",
  "Miroslav",
  "Jozef",
  "Vladim\xEDr",
  "Milan",
  "Peter",
  "Andrej",
  "Marek",
  "Daniel",
  "R\xF3bert",
  "Patrik",
  "Martin",
  "Michal",
  "Luk\xE1\u0161",
  "Tom\xE1\u0161",
  "Jakub",
  "Adam",
  "Mat\u011Bj",
  "Filip",
  "Ond\u0159ej",
  "Vojt\u011Bch",
  "Ji\u0159\xED",
  "Petr",
  "Josef",
  "David",
  "Michal",
  "Pavel",
  "V\xE1clav",
  "Roman",
  "Milan",
  "Franti\u0161ek",
  "Karel",
  "Radim",
  "Zden\u011Bk",
  "Miroslav",
  "Jaroslav",
  "Lubo\u0161"
];
var CZSK_MALE_LASTNAMES = [
  "Nov\xE1k",
  "Svoboda",
  "Novotn\xFD",
  "Dvo\u0159\xE1k",
  "\u010Cern\xFD",
  "Proch\xE1zka",
  "Ku\u010Dera",
  "Vesel\xFD",
  "Horv\xE1th",
  "Kov\xE1\u010D",
  "N\u011Bmec",
  "Pokorn\xFD",
  "H\xE1jek",
  "Jel\xEDnek",
  "Kr\xE1l",
  "R\u016F\u017Ei\u010Dka",
  "Bene\u0161",
  "Fiala",
  "Sedl\xE1\u010Dek",
  "Dole\u017Eal",
  "Zeman",
  "Kol\xE1\u0159",
  "Navr\xE1til",
  "\u010Cerm\xE1k",
  "Va\u0161\xED\u010Dek",
  "Urban",
  "Van\u011Bk",
  "Barto\u0161",
  "Posp\xED\u0161il",
  "Kopeck\xFD",
  "Mal\xFD",
  "\u0158\xEDha",
  "Bla\u017Eek",
  "K\u0159\xED\u017E",
  "Toman",
  "M\xE1lek",
  "Pol\xE1k",
  "\u0160imek",
  "Bar\xE1k",
  "Soukup",
  "Vacek",
  "Hru\u0161ka",
  "Strnad",
  "Moravec",
  "Valenta",
  "Varga",
  "Bal\xE1\u017E",
  "Moln\xE1r",
  "Hrn\u010D\xE1r",
  "Kov\xE1\u010Dik",
  "Szab\xF3",
  "Oravec",
  "Hud\xE1k",
  "Kov\xE1\u010D",
  "Hal\xE1sz",
  "T\xF3th",
  "Nagy",
  "Kiss",
  "Szabo",
  "Horv\xE1th",
  "Varga",
  "Bal\xE1\u017E",
  "Moln\xE1r",
  "Kov\xE1\u010Dik",
  "Kov\xE1\u010D",
  "Farkas",
  "Luk\xE1\u010D",
  "Hlav\xE1\u010D",
  "Kopeck\xFD",
  "\u0160vec",
  "Kov\xE1\u0159",
  "Zahradn\xEDk",
  "\u0160t\u011Bp\xE1nek",
  "Vl\u010Dek",
  "Kadlec",
  "\u0160ulc",
  "Musil",
  "\u0160im\xE1nek",
  "Hru\u0161ka",
  "Dudek",
  "S\xFDkora",
  "Havel",
  "Hol\xEDk",
  "\u0160pa\u010Dek",
  "Dvo\u0159\xE1\u010Dek",
  "V\xE1vra",
  "Kub\xED\u010Dek",
  "Pavl\xED\u010Dek",
  "\u0160t\u011Bp\xE1n",
  "\u010Cech",
  "Vondr\xE1\u010Dek",
  "Bure\u0161",
  "Mach",
  "\u010C\xED\u017Eek",
  "B\xEDlek",
  "Kov\xE1\u0159\xEDk",
  "\u0160t\u011Bp\xE1nek",
  "Vl\u010Dek",
  "Kadlec",
  "\u0160vec",
  "Kov\xE1\u0159"
];

// resources/static_db/names/ssa_data.ts
var SSA_MALE_FIRSTNAMES = [
  "Kwame",
  "Kofi",
  "Yao",
  "Ibrahim",
  "Mohammed",
  "Abdoulaye",
  "Moussa",
  "Amadou",
  "Sekou",
  "Ousmane",
  "Chukwuemeka",
  "Olumide",
  "Tunde",
  "Adebayo",
  "Chidera",
  "Siphiwe",
  "Thabo",
  "Lerato",
  "Katlego",
  "Themba",
  "Bongani",
  "Sibusiso",
  "Mpho",
  "Tumelo",
  "Ayanda",
  "Njabulo",
  "Khalid",
  "Youssef",
  "Jean-Pierre",
  "Kalusha",
  "Mohamed",
  "Ahmed",
  "Jean",
  "Joseph",
  "David",
  "John",
  "Michael",
  "Samuel",
  "Daniel",
  "Emmanuel",
  "Paul",
  "Peter",
  "James",
  "Isaac",
  "Abraham",
  "Jacob",
  "Joshua",
  "Benjamin",
  "Matthew",
  "Mark",
  "Luke",
  "Thomas",
  "Simon",
  "Andrew",
  "Philip",
  "Stephen",
  "Francis",
  "Patrick",
  "Anthony",
  "Charles",
  "George",
  "William",
  "Henry",
  "Edward",
  "Victor",
  "Felix",
  "Bernard",
  "Christopher",
  "Nicholas",
  "Raphael",
  "Gabriel",
  "Michael",
  "Omar",
  "Ali",
  "Hassan",
  "Yusuf",
  "Abubakar",
  "Haruna",
  "Sani",
  "Musa",
  "Adamu",
  "Bello",
  "Usman",
  "Idris",
  "Suleiman",
  "Aminu",
  "Chinedu",
  "Chukwudi",
  "Obinna",
  "Emeka",
  "Oluwaseun",
  "Babatunde",
  "Taiwo",
  "Keita",
  "Diallo",
  "Camara",
  "Ndiaye",
  "Mensah",
  "Osei"
];
var SSA_MALE_LASTNAMES = [
  "Traor\xE9",
  "Konat\xE9",
  "Diarra",
  "Coulibaly",
  "Camara",
  "Tour\xE9",
  "Keita",
  "Diallo",
  "Bah",
  "Sow",
  "Ndiaye",
  "Adeyemi",
  "Okafor",
  "Eze",
  "Chukwuebuka",
  "Mokoena",
  "Zungu",
  "Zwane",
  "Shabangu",
  "Nkosi",
  "Dlamini",
  "Mahlangu",
  "Ndlovu",
  "Khoza",
  "Buthelezi",
  "Mensah",
  "Boateng",
  "Appiah",
  "Ayew",
  "Banda",
  "Mwangi",
  "Ochieng",
  "Otieno",
  "Kiprop",
  "Mutai",
  "Kimani",
  "Omondi",
  "Wanjala",
  "Ibrahim",
  "Mohamed",
  "Musa",
  "Abdi",
  "Hassan",
  "Ali",
  "Ahmed",
  "Tesfaye",
  "Kebede",
  "Alemu",
  "Getachew",
  "Yohannes",
  "Bekele",
  "Assefa",
  "Mensah",
  "Osei",
  "Acheampong",
  "Owusu",
  "Agyemang",
  "Asante",
  "Yeboah",
  "Adjei",
  "Opoku",
  "Amoah",
  "Nkrumah",
  "Okonkwo",
  "Okafor",
  "Eze",
  "Adebayo",
  "Afolabi",
  "Obi",
  "Ibrahim",
  "Sani",
  "Yusuf",
  "Abubakar",
  "Lawal",
  "Bello",
  "Usman",
  "Mohammed",
  "Adamu",
  "Rakotomalala",
  "Randriamanantsoa",
  "Andriantsitohaina",
  "Rakotoarivony",
  "Rakoto",
  "Nkurunziza",
  "Manirakiza",
  "Habimana",
  "Uwimana",
  "Ndayishimiye",
  "Moyo",
  "Sibanda",
  "Ncube",
  "Maphosa",
  "Mudzonga",
  "Chigumbura"
];

// resources/static_db/names/iberia_data.ts
var IBERIA_MALE_FIRSTNAMES = [
  "Hugo",
  "Mateo",
  "Mart\xEDn",
  "Leo",
  "Lucas",
  "Manuel",
  "Alejandro",
  "Pablo",
  "Daniel",
  "\xC1lvaro",
  "Enzo",
  "Mario",
  "Adri\xE1n",
  "Diego",
  "Thiago",
  "Bruno",
  "Oliver",
  "David",
  "Alex",
  "Marco",
  "Gonzalo",
  "Marcos",
  "Nicol\xE1s",
  "Antonio",
  "Izan",
  "Miguel",
  "Javier",
  "Luca",
  "Liam",
  "Gael",
  "Marc",
  "Dylan",
  "Juan",
  "\xC1ngel",
  "Carlos",
  "Jos\xE9",
  "Gabriel",
  "Sergio",
  "Eric",
  "Jorge",
  "Dar\xEDo",
  "Adam",
  "Samuel",
  "H\xE9ctor",
  "Rodrigo",
  "Iker",
  "Pau",
  "Jes\xFAs",
  "Guillermo",
  "Jaime",
  "Luis",
  "Ian",
  "Francisco",
  "Noah",
  "Aaron",
  "V\xEDctor",
  "Mohamed",
  "Rafael",
  "Francisco",
  "Louren\xE7o",
  "Tom\xE1s",
  "Vicente",
  "Jo\xE3o",
  "Duarte",
  "Afonso",
  "Gabriel",
  "Miguel",
  "Santiago",
  "Rodrigo",
  "Martim",
  "Gon\xE7alo",
  "Pedro",
  "Diogo",
  "Rafael",
  "Tom\xE1s",
  "Afonso",
  "Rodrigo",
  "Jo\xE3o",
  "Miguel",
  "Gon\xE7alo",
  "Bernardo",
  "Salvador",
  "Teodoro",
  "Vicente",
  "Andr\xE9",
  "Tiago",
  "Henrique",
  "Leonardo",
  "Guilherme",
  "Mateus",
  "Daniel",
  "David",
  "Ant\xF3nio",
  "Eduardo",
  "Filipe",
  "Jorge",
  "Lu\xEDs",
  "Nuno",
  "Rui",
  "V\xEDtor"
];
var IBERIA_MALE_LASTNAMES = [
  "Garc\xEDa",
  "Rodr\xEDguez",
  "Gonz\xE1lez",
  "Fern\xE1ndez",
  "L\xF3pez",
  "Mart\xEDnez",
  "S\xE1nchez",
  "P\xE9rez",
  "G\xF3mez",
  "Jim\xE9nez",
  "Ruiz",
  "Hern\xE1ndez",
  "D\xEDaz",
  "Moreno",
  "\xC1lvarez",
  "Mu\xF1oz",
  "Romero",
  "Alonso",
  "Guti\xE9rrez",
  "Navarro",
  "Torres",
  "Dom\xEDnguez",
  "V\xE1zquez",
  "Ramos",
  "Gil",
  "Ram\xEDrez",
  "Serrano",
  "Blanco",
  "Molina",
  "Morales",
  "Su\xE1rez",
  "Ortega",
  "Delgado",
  "Castro",
  "Ortiz",
  "Rubio",
  "Mar\xEDn",
  "N\xFA\xF1ez",
  "Medina",
  "Iglesias",
  "Cortes",
  "Castillo",
  "Santos",
  "Silva",
  "Ferreira",
  "Pereira",
  "Costa",
  "Rodrigues",
  "Oliveira",
  "Alves",
  "Moreira",
  "Sousa",
  "Carvalho",
  "Mendes",
  "Nogueira",
  "Vieira",
  "Lopes",
  "Soares",
  "Fernandes",
  "Martins",
  "Gon\xE7alves",
  "Ribeiro",
  "Dias",
  "Rocha",
  "Pinto",
  "Cardoso",
  "Teixeira",
  "Correia",
  "Monteiro",
  "Ara\xFAjo",
  "Cunha",
  "Barbosa",
  "Tavares",
  "Freitas",
  "Melo",
  "Coelho",
  "Pires",
  "Cruz",
  "Nunes",
  "Macedo",
  "Magalh\xE3es",
  "Reis",
  "Figueiredo",
  "Campos",
  "Andrade",
  "Fonseca",
  "Marques",
  "Miranda",
  "Vaz",
  "Leite",
  "Batista",
  "Faria",
  "Henriques",
  "Machado",
  "Antunes",
  "Baptista",
  "Coutinho",
  "Gomes",
  "Moura"
];

// resources/static_db/names/scandinavia_data.ts
var SCANDINAVIA_MALE_LASTNAMES = [
  "Hansen",
  "Johansen",
  "Olsen",
  "Larsen",
  "Andersen",
  "Nielsen",
  "Pedersen",
  "Nilsson",
  "Eriksson",
  "Karlsson",
  "Larsson",
  "Olsson",
  "Persson",
  "Svensson",
  "Gustafsson",
  "Berg",
  "J\xF8rgensen",
  "Kristiansen",
  "Jensen",
  "Mogensen",
  "Poulsen",
  "Mortensen",
  "Christiansen",
  "Thomsen",
  "Kj\xE6r",
  "Dahl",
  "Holm",
  "Vestergaard",
  "M\xF8ller",
  "Jakobsen",
  "Petersen",
  "Johansson",
  "Andersson",
  "Lindberg",
  "Lindstr\xF6m",
  "Lindgren",
  "Lund",
  "Hansson",
  "Forsberg",
  "Danielsson",
  "Jonsson",
  "H\xE5kansson",
  "Fredriksson",
  "Bj\xF6rk",
  "Nystr\xF6m",
  "Olofsson",
  "Samuelsson",
  "Bengtsson",
  "Axelsson",
  "Wikstr\xF6m",
  "Haaland",
  "\xD8degaard",
  "Solberg",
  "Haugen",
  "Johnsen",
  "Karlsen",
  "Eide",
  "Bakken",
  "Halvorsen",
  "Eriksen",
  "Henriksen",
  "Mathisen",
  "Andreassen",
  "Paulsen",
  "Moen",
  "Gundersen",
  "Evensen",
  "Str\xF8m",
  "Lie",
  "Thorsen",
  "Rasmussen",
  "Jenssen",
  "Nilsen",
  "S\xF8rensen",
  "Jeppesen",
  "Villadsen",
  "Lauridsen",
  "Dinesen",
  "Br\xF8ndum",
  "Kjeldsen",
  "Toft",
  "Bjerregaard",
  "Fisker",
  "Dam",
  "Skov",
  "Krag",
  "Frost",
  "Vinther",
  "Thygesen",
  "Busk",
  "Lassen",
  "Hedegaard",
  "Gregersen",
  "Bay",
  "Due",
  "Elkj\xE6r",
  "H\xF8j",
  "Lundgaard",
  "Rosendal",
  "Skaarup",
  "Wulff"
];
var SCANDINAVIA_MALE_FIRSTNAMES = [
  "Emil",
  "Lucas",
  "William",
  "Oliver",
  "Noah",
  "Elias",
  "Oscar",
  "Victor",
  "Alexander",
  "Magnus",
  "Erik",
  "Rasmus",
  "Kasper",
  "Jakob",
  "Mads",
  "Jonas",
  "Martin",
  "Andreas",
  "Frederik",
  "Isak",
  "Liam",
  "Matheo",
  "Theodor",
  "Hugo",
  "Adam",
  "August",
  "Nils",
  "Leo",
  "Otto",
  "Alfred",
  "Carl",
  "Axel",
  "Arvid",
  "Malte",
  "Olle",
  "Sigge",
  "Hjalmar",
  "Noah",
  "Liam",
  "Johannes",
  "Filip",
  "Anton",
  "Elliot",
  "Arthur",
  "Ludvig",
  "Felix",
  "Vincent",
  "Benjamin",
  "Matias",
  "Oskar",
  "Theo",
  "Mohammad",
  "Harald",
  "Henrik",
  "Sander",
  "Olav",
  "Tor",
  "Bj\xF8rn",
  "Per",
  "Jan",
  "Lars",
  "Anders",
  "Johan",
  "Peter",
  "Daniel",
  "Mikael",
  "Thomas",
  "Christian",
  "S\xF8ren",
  "Jens",
  "Niels",
  "Morten",
  "Henning",
  "Kjeld",
  "Bent",
  "Leif",
  "Gunnar",
  "Sigurd",
  "Einar",
  "Knut",
  "Arne",
  "Sven",
  "Ingvar",
  "Rune",
  "Vidar",
  "Thor",
  "H\xE5kon",
  "Trygve",
  "Roar",
  "Geir",
  "Stian",
  "Espen",
  "J\xF8rgen",
  "Kristian",
  "Petter",
  "Ivar",
  "Dag",
  "Even",
  "Joakim",
  "Nikolai",
  "Sebastian",
  "Tobias",
  "Valdemar"
];

// resources/static_db/names/swedish_data.ts
var SWEDISH_MALE_FIRSTNAMES = [
  "Noah",
  "William",
  "Hugo",
  "Liam",
  "Adam",
  "August",
  "Nils",
  "Leo",
  "Oliver",
  "Otto",
  "Sam",
  "Alfred",
  "Elias",
  "Lucas",
  "Alexander",
  "Emil",
  "Oscar",
  "Filip",
  "Axel",
  "Benjamin",
  "Theo",
  "Charlie",
  "Max",
  "Gabriel",
  "Isaac",
  "Leon",
  "Arvid",
  "Viggo",
  "Sebastian",
  "Milton",
  "Casper",
  "Viktor",
  "Henry",
  "Elliot",
  "Alvin",
  "Samuel",
  "Adrian",
  "Ludvig",
  "Erik",
  "Anton",
  "Felix",
  "Linus",
  "Simon",
  "Theodor",
  "Malte",
  "Gustav",
  "Oskar",
  "Albin",
  "Sixten",
  "Ebbe",
  "Frans",
  "Hjalmar",
  "Ivar",
  "Kasper",
  "Loke",
  "Melker",
  "Rasmus",
  "Sigge",
  "Tor",
  "Wilmer",
  "Anders",
  "Johan",
  "Lars",
  "Mikael",
  "Peter",
  "Daniel",
  "Jan",
  "Per",
  "Fredrik",
  "Henrik",
  "Magnus",
  "Bj\xF6rn",
  "Karl",
  "Stefan",
  "Thomas",
  "Andreas",
  "Jonas",
  "Mattias",
  "Niklas",
  "Patrik",
  "Robin",
  "Tobias",
  "Christian",
  "David",
  "Jonathan",
  "Marcus",
  "Martin",
  "Robert",
  "Sebastian",
  "Victor",
  "Emmanuel",
  "Isak",
  "Jakob",
  "Joel",
  "Kevin",
  "Liam",
  "Lucas",
  "Matteo",
  "Noah",
  "Oliver",
  "Philip",
  "Rasmus",
  "Samuel",
  "Tim",
  "Vincent",
  "Wilhelm",
  "\xC5ke",
  "Arne",
  "Bengt",
  "Bo",
  "Claes",
  "Elof",
  "Gunnar",
  "Hannes",
  "Ingvar",
  "Jesper",
  "Kjell",
  "Leif",
  "Mats",
  "Nils",
  "Olof",
  "Pelle",
  "Quintus",
  "Ragnar",
  "Staffan",
  "Tomas",
  "Ulf",
  "Valdemar",
  "Xavier",
  "Yngve",
  "Zacharias",
  "Algot",
  "Birger",
  "Dag",
  "Edvin",
  "Folke",
  "Greger",
  "Harald",
  "Ivar",
  "Joakim",
  "Kristian",
  "Lennart",
  "Morgan",
  "Nicklas",
  "Oskar",
  "Pontus",
  "Rikard",
  "Stig",
  "Torbj\xF6rn",
  "Urban",
  "Ville",
  "Wilfred",
  "Xander",
  "Yngvar",
  "Zlatan"
];
var SWEDISH_MALE_LASTNAMES = [
  "Andersson",
  "Johansson",
  "Karlsson",
  "Nilsson",
  "Eriksson",
  "Larsson",
  "Olsson",
  "Persson",
  "Svensson",
  "Gustafsson",
  "Pettersson",
  "Jonsson",
  "Jansson",
  "Hansson",
  "Bengtsson",
  "Carlsson",
  "Lindberg",
  "Magnusson",
  "Lindstr\xF6m",
  "Berg",
  "Axelsson",
  "Bergstr\xF6m",
  "Nilsson",
  "Fredriksson",
  "Sandberg",
  "Sj\xF6berg",
  "Lindgren",
  "Eriksson",
  "Forsberg",
  "Bergman",
  "Holm",
  "Lundberg",
  "Engstr\xF6m",
  "Lindqvist",
  "H\xE5kansson",
  "Danielsson",
  "Eklund",
  "Lundgren",
  "Bj\xF6rk",
  "Bergqvist",
  "Fransson",
  "Nystr\xF6m",
  "Isaksson",
  "Arvidsson",
  "S\xF6derberg",
  "Blom",
  "Ekstr\xF6m",
  "Martinsson",
  "Str\xF6m",
  "Wikstr\xF6m",
  "M\xE5nsson",
  "\xC5berg",
  "Wallin",
  "Samuelsson",
  "Bj\xF6rklund",
  "Norberg",
  "Mattsson",
  "Gunnarsson",
  "Nordstr\xF6m",
  "Holmberg",
  "Eliasson",
  "Viklund",
  "Sundberg",
  "Claesson",
  "L\xF6fgren",
  "Hedlund",
  "Jakobsson",
  "Andreasson",
  "Palm",
  "M\xE5rtensson",
  "Sandstr\xF6m",
  "Olofsson",
  "Hellstr\xF6m",
  "\xC5kesson",
  "Blomberg",
  "Lundqvist",
  "Ek",
  "S\xF6derstr\xF6m",
  "Nordin",
  "Hansson",
  "Dahl",
  "Falk",
  "Gr\xF6nberg",
  "Hedberg",
  "Ingvarsson",
  "J\xF6nsson",
  "Karlsson",
  "Lind",
  "Malm",
  "Nord",
  "Olsson",
  "P\xE5lsson",
  "Qvist",
  "Rydberg",
  "Sj\xF6gren",
  "T\xF6rnqvist",
  "Ullman",
  "Vallin",
  "Wahlberg",
  "Zetterberg",
  "Alm",
  "Backman",
  "Cederberg",
  "Dahlberg",
  "Edstr\xF6m",
  "Fagerstr\xF6m",
  "Granberg",
  "Hagberg",
  "Ivarsson",
  "Johansson",
  "Karlsson",
  "Lagerberg",
  "Malmberg",
  "Nor\xE9n",
  "Oskarsson",
  "Persson",
  "Qvarnstr\xF6m",
  "Ros\xE9n",
  "Sundstr\xF6m",
  "Tengberg",
  "Ulfsson",
  "Vik",
  "Westerberg",
  "Ylven",
  "Zander",
  "\xC5str\xF6m",
  "\xD6berg",
  "\xD6stberg",
  "\xD6sterberg",
  "Abrahamsson",
  "Beckman",
  "Cedervall",
  "Dahlgren",
  "Ekman",
  "Falkenberg",
  "Granath",
  "Hult",
  "Isaksson",
  "Jansson",
  "Kling",
  "Ljung",
  "Melin",
  "Nyman",
  "Olausson",
  "Pettersson",
  "Qvist",
  "Rasmusson",
  "Svensson",
  "Thulin",
  "Ullberg",
  "Vester",
  "Wahlgren",
  "Xenon",
  "Ytterberg",
  "Zetterlund"
];

// resources/static_db/names/exussr_data.ts
var EXUSSR_MALE_FIRSTNAMES = [
  "Aleksandr",
  "Artem",
  "Maksim",
  "Dmitrij",
  "Ivan",
  "Michai\u0142",
  "Nikita",
  "Ilja",
  "Kiry\u0142",
  "W\u0142adis\u0142aw",
  "Danii\u0142",
  "Andriej",
  "Roman",
  "Siergiej",
  "W\u0142adimir",
  "Jewgienij",
  "Pawie\u0142",
  "Anton",
  "Denis",
  "Igor",
  "Wiktor",
  "Jurij",
  "Wasilij",
  "Oleg",
  "Stanis\u0142aw",
  "Bohdan",
  "Wo\u0142odymyr",
  "O\u0142eksandr",
  "Witalij",
  "Myko\u0142a",
  "Jaros\u0142aw",
  "Taras",
  "Rus\u0142an",
  "Andrij",
  "Nazar",
  "Matviy",
  "Lev",
  "Mark",
  "Matvey",
  "Timofey",
  "Miron",
  "Makar",
  "Danylo",
  "Tymofiy",
  "Mukhammad",
  "Alikhan",
  "Aisultan",
  "Omar",
  "Aldiyar",
  "Amir",
  "Islam",
  "Arsen",
  "Alan",
  "Miras",
  "Rasul",
  "Nurislam",
  "Alinur",
  "Erasyl",
  "Sanzhar",
  "Ibrahim",
  "J\u0101nis",
  "Roberts",
  "Arturs",
  "Kristaps",
  "Edgars",
  "M\u0101ris",
  "Aivars",
  "Jurijs",
  "Andris",
  "Kaspars",
  "Rihards",
  "Dainis",
  "Gatis",
  "Martins",
  "Markuss",
  "Rokas",
  "Domantas",
  "Matas",
  "Lukas",
  "Dovydas",
  "Art\u016Bras",
  "Jonas",
  "Tadas",
  "Vytautas",
  "Mindaugas",
  "Petras",
  "Algirdas",
  "Saulius",
  "Darius",
  "Mantas",
  "Aurimas",
  "Deividas",
  "Paulius",
  "Tomas",
  "Karolis",
  "Ar\u016Bnas",
  "Giedrius",
  "\u017Dilvinas",
  "Eimantas"
];
var EXUSSR_MALE_LASTNAMES = [
  "Ivanov",
  "Smirnov",
  "Kuzniecow",
  "Popow",
  "Wasiljew",
  "Pietrow",
  "Sidorow",
  "Michaj\u0142ow",
  "Fiodorow",
  "Soko\u0142ow",
  "Jakowlew",
  "Paw\u0142ow",
  "Aleksiejew",
  "Morozow",
  "Nowikow",
  "Wo\u0142kow",
  "Romanow",
  "Sawicki",
  "Bielski",
  "Kuznetsov",
  "Shevchenko",
  "Bondarenko",
  "Melnyk",
  "Kovalenko",
  "Boyko",
  "Tkachenko",
  "Kravchenko",
  "Lysenko",
  "Marchenko",
  "Kovalchuk",
  "Novak",
  "Koval",
  "Ivanov",
  "Petrov",
  "Novikov",
  "Volkov",
  "Kozlov",
  "Moroz",
  "Lebedev",
  "Zhukov",
  "Kovalev",
  "Novik",
  "Zhuk",
  "Kotov",
  "Kovalevich",
  "Melnik",
  "Petrovich",
  "Ivanovich",
  "Smirnov",
  "Kuznetsov",
  "Popovich",
  "Petrauskas",
  "Jankauskas",
  "Kazlauskas",
  "Vasiliauskas",
  "Butkus",
  "B\u0113rzi\u0146\u0161",
  "Ozoli\u0146\u0161",
  "Kalni\u0146\u0161",
  "Jansons",
  "P\u0113tersons",
  "Ivanovs",
  "Ozols",
  "Liepi\u0146\u0161",
  "Kask",
  "Tamm",
  "M\xE4gi",
  "Sepp",
  "Karimov",
  "Abdullaev",
  "Rahmonov",
  "Sharipov",
  "Ismailov",
  "Aliev",
  "Mukhammadiev",
  "Bekov",
  "Yusupov",
  "Saidov",
  "Tojiboev",
  "Abdugafforov",
  "Rustamov",
  "Kurbanov",
  "Nazarov",
  "Ergashev",
  "Mirzayev",
  "Tursunov",
  "Umarov",
  "Hasanov",
  "Sattorov",
  "Rakhimov",
  "Akhmedov",
  "Jumayev",
  "Sobirov",
  "Mamatov"
];

// resources/static_db/names/es_data.ts
var ES_MALE_FIRSTNAMES = [
  "Carlos",
  "Sergio",
  "Alejandro",
  "Pablo",
  "David",
  "Daniel",
  "Diego",
  "Adrian",
  "Alvaro",
  "Javier",
  "Antonio",
  "Miguel",
  "Marcos",
  "Gonzalo",
  "Raul",
  "Inigo",
  "Iker",
  "Fernando",
  "Borja",
  "Mikel",
  "Jon",
  "Unai",
  "Aitor",
  "Asier",
  "Ruben",
  "Victor",
  "Roberto",
  "Cristian",
  "Rodrigo",
  "Jesus",
  "Andres",
  "Hector",
  "Oscar",
  "Manuel",
  "Alberto",
  "Juanmi",
  "Gerard",
  "Marc",
  "Jordi",
  "Sergi",
  "Juan",
  "Jose",
  "Francisco",
  "Luis",
  "Mario",
  "Jorge",
  "Rafael",
  "Pedro",
  "Alfonso",
  "Eduardo",
  "Ricardo",
  "Ramon",
  "Enrique",
  "Felipe",
  "Alvaro",
  "Ivan",
  "Angel",
  "Julio",
  "Santiago",
  "Hugo",
  "Nacho",
  "Ismael",
  "Victor",
  "Emilio",
  "Tomas",
  "Martin",
  "Mateo",
  "Nicolas",
  "Samuel",
  "Lucas",
  "Bruno",
  "Gabriel",
  "Adan",
  "Joel",
  "Izan",
  "Pol",
  "Oriol",
  "Xavi",
  "Xavier",
  "Pau",
  "Marcelo",
  "Cesar",
  "Hernan",
  "Octavio",
  "Sebastian",
  "Agustin",
  "Alvaro",
  "Guillermo",
  "Rogelio",
  "Elias",
  "Nestor",
  "Fermin",
  "Carmelo",
  "Salvador",
  "Vicente",
  "Arturo",
  "Humberto",
  "Leandro",
  "Fabian",
  "Cristobal"
];
var ES_MALE_LASTNAMES = [
  "Garcia",
  "Martinez",
  "Lopez",
  "Sanchez",
  "Gonzalez",
  "Rodriguez",
  "Fernandez",
  "Perez",
  "Gomez",
  "Martin",
  "Jimenez",
  "Ruiz",
  "Hernandez",
  "Diaz",
  "Moreno",
  "Alvarez",
  "Munoz",
  "Romero",
  "Alonso",
  "Gutierrez",
  "Navarro",
  "Torres",
  "Dominguez",
  "Vazquez",
  "Ramos",
  "Gil",
  "Serrano",
  "Molina",
  "Blanco",
  "Morales",
  "Suarez",
  "Ortega",
  "Delgado",
  "Castro",
  "Ortiz",
  "Rubio",
  "Marin",
  "Sanz",
  "Iglesias",
  "Medina",
  "Herrera",
  "Vega",
  "Cruz",
  "Flores",
  "Reyes",
  "Aguilar",
  "Campos",
  "Carrasco",
  "Mendez",
  "Fuentes",
  "Cortes",
  "Calvo",
  "Rojas",
  "Pascual",
  "Guerrero",
  "Cano",
  "Santos",
  "Nunez",
  "Prieto",
  "Soler",
  "Vidal",
  "Mora",
  "Santana",
  "Cabrera",
  "Arias",
  "Pardo",
  "Bravo",
  "Ferrer",
  "Moya",
  "Carmona",
  "Ibarra",
  "Soria",
  "Marquez",
  "Lorenzo",
  "Valencia",
  "Duran",
  "Montes",
  "Pena",
  "Rios",
  "Caceres",
  "Benitez",
  "Nieto",
  "Padilla",
  "Vargas",
  "Crespo",
  "Maldonado",
  "Esteban",
  "Pineda",
  "Rosales",
  "Montoya",
  "Avila",
  "Escudero",
  "Villanueva",
  "Cuevas",
  "Bautista",
  "Pacheco",
  "Salas",
  "Cordero",
  "Cifuentes",
  "Aranda"
];

// resources/static_db/names/en_data.ts
var EN_MALE_FIRSTNAMES = [
  "Noah",
  "Theo",
  "Freddie",
  "Leo",
  "Luca",
  "Archie",
  "Arthur",
  "Oliver",
  "Oscar",
  "Arlo",
  "George",
  "Alfie",
  "Charlie",
  "Elijah",
  "Jude",
  "Henry",
  "Teddy",
  "Albie",
  "Reggie",
  "Oakley",
  "Lucas",
  "Harry",
  "Jack",
  "Tommy",
  "Roman",
  "Rory",
  "Finley",
  "Theodore",
  "Ezra",
  "Isaac",
  "Rowan",
  "Ronnie",
  "Reuben",
  "Jacob",
  "Hudson",
  "Ethan",
  "Louie",
  "Max",
  "Vinnie",
  "Thomas",
  "James",
  "Alexander",
  "Hugo",
  "Sonny",
  "Kai",
  "Adam",
  "Mason",
  "Frankie",
  "Hunter",
  "Harrison",
  "Logan",
  "Finn",
  "Miles",
  "Yusuf",
  "Louis",
  "Riley",
  "Edward",
  "Jaxon",
  "Nathan",
  "Musa",
  "William",
  "Harley",
  "Jasper",
  "Ruben",
  "Yahya",
  "Toby",
  "Alex",
  "Elias",
  "Brody",
  "Enzo",
  "Grayson",
  "Elliot",
  "Billy",
  "Ollie",
  "Stanley",
  "Otis",
  "Levi",
  "Liam",
  "Jesse",
  "Michael",
  "Muhammad",
  "Austin",
  "Albert",
  "Sebastian",
  "Joshua",
  "Jax",
  "Caleb",
  "Daniel",
  "Zachary",
  "Milo",
  "Bobby",
  "Gabriel",
  "Jenson",
  "Samuel",
  "Hamza",
  "Carter",
  "Cooper",
  "Ibrahim",
  "Lenny",
  "Dylan"
];
var EN_MALE_LASTNAMES = [
  "Smith",
  "Jones",
  "Williams",
  "Taylor",
  "Brown",
  "Davies",
  "Evans",
  "Thomas",
  "Wilson",
  "Johnson",
  "Roberts",
  "Robinson",
  "Thompson",
  "Wright",
  "Walker",
  "White",
  "Edwards",
  "Hughes",
  "Green",
  "Hall",
  "Lewis",
  "Harris",
  "Clarke",
  "Patel",
  "Jackson",
  "Wood",
  "Turner",
  "Martin",
  "Cooper",
  "Hill",
  "Morris",
  "Ward",
  "Moore",
  "Clark",
  "Baker",
  "Harrison",
  "King",
  "Morgan",
  "Lee",
  "Allen",
  "James",
  "Phillips",
  "Scott",
  "Watson",
  "Davis",
  "Parker",
  "Bennett",
  "Price",
  "Griffiths",
  "Young",
  "Khan",
  "Mitchell",
  "Cook",
  "Bailey",
  "Carter",
  "Richardson",
  "Shaw",
  "Kelly",
  "Collins",
  "Bell",
  "Hussain",
  "Richards",
  "Cox",
  "Miller",
  "Begum",
  "Murphy",
  "Ali",
  "Marshall",
  "Simpson",
  "Anderson",
  "Ellis",
  "Adams",
  "Wilkinson",
  "Ahmed",
  "Foster",
  "Powell",
  "Chapman",
  "Singh",
  "Webb",
  "Rogers",
  "Mason",
  "Gray",
  "Hunt",
  "Owen",
  "Matthews",
  "Palmer",
  "Holmes",
  "Mills",
  "Campbell",
  "Lloyd",
  "Barnes",
  "Knight",
  "Butler",
  "Russell",
  "Barker",
  "Stevens",
  "Jenkins",
  "Dixon",
  "Fisher",
  "Harvey"
];

// resources/static_db/names/de_data.ts
var DE_MALE_FIRSTNAMES = [
  "Felix",
  "August",
  "Emmerich",
  "Friedrich",
  "Anselm",
  "Leopold",
  "Heinrich",
  "Matteo",
  "Carl",
  "Louis",
  "Theodor",
  "Reinhard",
  "Fritz",
  "Wolfgang",
  "Lenz",
  "Isidor",
  "Hans",
  "Rafael",
  "Noah",
  "Dieter",
  "Siegfried",
  "Johann",
  "Adam",
  "Andreas",
  "Arnold",
  "Bruno",
  "Hartwin",
  "Albert",
  "Alexander",
  "Gregor",
  "Wolf",
  "Marcel",
  "Armin",
  "Dennis",
  "Christoph",
  "Volker",
  "Rudolf",
  "Werner",
  "Dietrich",
  "Christian",
  "Anton",
  "Cornelius",
  "Walter",
  "Niko",
  "Daniel",
  "Emil",
  "Aaron",
  "Edgar",
  "Hermann",
  "Wilhelm",
  "Archibald",
  "Oswald",
  "Alois",
  "Franz",
  "Karl",
  "Siegmund",
  "Arend",
  "Engelbert",
  "Ludolf",
  "Rainer",
  "Josef",
  "Otto",
  "Arne",
  "Clemens",
  "Klaus",
  "Maximilian",
  "Oskar",
  "Frank",
  "Gunter",
  "Ben",
  "Ansgar",
  "Lennart",
  "Konrad",
  "Alwin",
  "Elias",
  "Severin",
  "Erwin",
  "Rolf",
  "Ignaz",
  "Eckhart",
  "Aldo",
  "Hans",
  "Friedemann",
  "Sascha",
  "Claus",
  "Ulrich",
  "Robert",
  "Leo",
  "Alwin",
  "Gustav",
  "Hermann",
  "Sigmar",
  "Luther",
  "Philipp",
  "Norbert",
  "Ludwig",
  "Paul",
  "Rupert",
  "Hagen",
  "Moritz"
];
var DE_MALE_LASTNAMES = [
  // Twoja oryginalna lista (bez zmian)
  "Muller",
  "Schmidt",
  "Schneider",
  "Fischer",
  "Weber",
  "Schaefer",
  "Meyer",
  "Wagner",
  "Becker",
  "Bauer",
  "Hoffmann",
  "Schulz",
  "Koch",
  "Richter",
  "Klein",
  "Wolf",
  "Schroeder",
  "Neumann",
  "Braun",
  "Werner",
  "Schwarz",
  "Hofmann",
  "Zimmermann",
  "Schmitt",
  "Hartmann",
  "Schmid",
  "Weiss",
  "Schmitz",
  "Krueger",
  "Lange",
  "Meier",
  "Walter",
  "Koehler",
  "Maier",
  "Beck",
  "Koenig",
  "Krause",
  "Schulze",
  "Huber",
  "Mayer",
  "Frank",
  "Lehmann",
  "Kaiser",
  "Fuchs",
  "Herrmann",
  "Lang",
  "Thomas",
  "Peters",
  "Stein",
  "Jung",
  "Moeller",
  "Berger",
  "Martin",
  "Friedrich",
  "Scholz",
  "Keller",
  "Gross",
  "Hahn",
  "Roth",
  "Guenther",
  "Vogel",
  "Schubert",
  "Winkler",
  "Schuster",
  "Lorenz",
  "Ludwig",
  "Baumann",
  "Heinrich",
  "Otto",
  "Simon",
  "Graf",
  "Kraus",
  "Kraemer",
  "Boehm",
  "Schulte",
  "Albrecht",
  "Franke",
  "Winter",
  "Schumacher",
  "Vogt",
  "Haas",
  "Sommer",
  "Schreiber",
  "Engel",
  "Ziegler",
  "Dietrich",
  "Brandt",
  "Seidel",
  "Kuhn",
  "Busch",
  "Horn",
  "Arnold",
  "Kuehn",
  "Bergmann",
  "Pohl",
  "Pfeiffer",
  "Wolff",
  "Voigt",
  "Sauer",
  "Goldschmidt",
  // Nowo dodane – popularne i typowo niemieckie (kolejność mniej więcej od częstszych)
  "Mueller",
  "Schafer",
  "Schroder",
  "Krueger",
  "Kruger",
  "Schmitz",
  "Hartmann",
  "Hofmann",
  "Schmitt",
  "Schmid",
  "Lange",
  "Meier",
  "Maier",
  "Mayer",
  "Koehler",
  "Schulze",
  "Huber",
  "Lehmann",
  "Herrmann",
  "Friedrich",
  "Scholz",
  "Gross",
  "Guenther",
  "Schubert",
  "Winkler",
  "Schuster",
  "Lorenz",
  "Ludwig",
  "Baumann",
  "Heinrich",
  "Kraus",
  "Kraemer",
  "Boehm",
  "Schulte",
  "Albrecht",
  "Franke",
  "Schumacher",
  "Haas",
  "Sommer",
  "Schreiber",
  "Ziegler",
  "Dietrich",
  "Brandt",
  "Seidel",
  "Kuhn",
  "Kuehn",
  "Busch",
  "Horn",
  "Arnold",
  "Bergmann",
  "Pfeiffer",
  "Voigt",
  "Sauer",
  // Kolejne popularne niemieckie nazwiska
  "Schafers",
  "Bauer",
  "Hoffman",
  "Schultze",
  "Koch",
  "Richter",
  "Wolf",
  "Neumann",
  "Braun",
  "Werner",
  "Schwarz",
  "Zimmermann",
  "Weiss",
  "Krueger",
  "Lange",
  "Walter",
  "Beck",
  "Koenig",
  "Krause",
  "Mayer",
  "Frank",
  "Kaiser",
  "Fuchs",
  "Lang",
  "Thomas",
  "Peters",
  "Stein",
  "Jung",
  "Moeller",
  "Berger",
  "Martin",
  "Keller",
  "Hahn",
  "Roth",
  "Vogel",
  "Baumann",
  "Heinrich",
  "Otto",
  "Simon",
  "Graf",
  "Kraus",
  "Kraemer",
  "Boehm",
  "Albrecht",
  "Franke",
  "Winter",
  "Vogt",
  "Haas",
  "Sommer",
  "Engel",
  "Ziegler",
  "Dietrich",
  "Seidel",
  "Kuhn",
  "Busch",
  "Horn",
  "Arnold",
  "Bergmann",
  "Pohl",
  "Pfeiffer",
  "Wolff",
  "Sauer",
  "Goldschmidt",
  // Rozszerzenie – kolejne typowo niemieckie (z różnych regionów)
  "Ackermann",
  "Adam",
  "Adler",
  "Bach",
  "Bachmann",
  "Baer",
  "Barth",
  "Bauer",
  "Baum",
  "Bayer",
  "Behr",
  "Behrens",
  "Bender",
  "Berg",
  "Betz",
  "Bischoff",
  "Bock",
  "Bode",
  "Boerner",
  "Bohn",
  "Brand",
  "Braun",
  "Breuer",
  "Brinkmann",
  "Brock",
  "Bruns",
  "Buchholz",
  "Buck",
  "Buehler",
  "Buehner",
  "Burkhardt",
  "Busch",
  "Christ",
  "Conrad",
  "Dahl",
  "Damm",
  "Daniel",
  "Decker",
  "Diehl",
  "Dittmann",
  "Dorn",
  "Drescher",
  "Ebert",
  "Eckert",
  "Ehlers",
  "Ehrlich",
  "Eichler",
  "Eilers",
  "Ernst",
  "Fahr",
  "Feldmann",
  "Fiedler",
  "Fink",
  "Fischer",
  "Fleischer",
  "Foerster",
  "Frank",
  "Freund",
  "Frey",
  "Friedrich",
  "Fritz",
  "Froehlich",
  "Fuchs",
  "Fuhr",
  "Gebhardt",
  "Geiger",
  "Gerber",
  "Gerlach",
  "Geyer",
  "Glaser",
  "Goetz",
  "Graf",
  "Grimm",
  "Grosse",
  "Grunwald",
  "Haag",
  "Haas",
  "Hahn",
  "Haller",
  "Hamm",
  "Hammer",
  "Hansen",
  "Hartwig",
  "Hase",
  "Hass",
  "Haupt",
  "Hecht",
  "Heil",
  "Hein",
  "Heinemann",
  "Heinrich",
  "Heinz",
  "Heller",
  "Hennig",
  "Henning",
  "Hentschel",
  "Herbst",
  "Hermann",
  "Herzog",
  "Hess",
  "Hildebrandt",
  "Hinrichs",
  "Hofer",
  "Hoffmann",
  "Hofmann",
  "Hohmann",
  "Holz",
  "Holzapfel",
  "Horn",
  "Huber",
  "Hummel",
  "Jager",
  "Jahn",
  "Jakob",
  "Jansen",
  "Jensen",
  "Jung",
  "Kaiser",
  "Kalb",
  "Kapp",
  "Kaufmann",
  "Keller",
  "Kern",
  "Kessler",
  "Kirchhoff",
  "Kirchner",
  "Klaus",
  "Klein",
  "Kling",
  "Klotz",
  "Koch",
  "Koeppen",
  "Kohl",
  "Kohler",
  "Konig",
  "Kopp",
  "Korte",
  "Kramer",
  "Krause",
  "Krebs",
  "Kretschmer",
  "Kreuzer",
  "Kroll",
  "Krone",
  "Krug",
  "Kruger",
  "Kuhlmann",
  "Kuhn",
  "Kunze",
  "Kurz",
  "Lamm",
  "Lang",
  "Lange",
  "Lehmann",
  "Lehr",
  "Leicht",
  "Leistner",
  "Lemke",
  "Lenz",
  "Lindemann",
  "Link",
  "Loch",
  "Loeffler",
  "Lohmann",
  "Lorenz",
  "Ludwig",
  "Maier",
  "Mann",
  "Marek",
  "Marx",
  "Mayer",
  "Meier",
  "Meissner",
  "Menzel",
  "Merkel",
  "Mertens",
  "Metzger",
  "Meyer",
  "Michael",
  "Michels",
  "Mielke",
  "Miller",
  "Moebius",
  "Moeller",
  "Mohr",
  "Morgenstern",
  "Moser",
  "Mueller",
  "Muller",
  "Nagel",
  "Neubauer",
  "Neumann",
  "Niemann",
  "Noll",
  "Nowak",
  "Ober",
  "Ochs",
  "Otto",
  "Papke",
  "Paul",
  "Peters",
  "Pfeifer",
  "Pfeiffer",
  "Pfister",
  "Pohl",
  "Poll",
  "Preuss",
  "Probst",
  "Rabe",
  "Rauch",
  "Reich",
  "Reichel",
  "Reichert",
  "Reimann",
  "Reinhardt",
  "Reiter",
  "Renz",
  "Richter",
  "Riedel",
  "Ritter",
  "Roehm",
  "Roth",
  "Rott",
  "Rupp",
  "Sander",
  "Sauer",
  "Schaaf",
  "Schaefer",
  "Schaper",
  "Scheffler",
  "Schenk",
  "Schilling",
  "Schindler",
  "Schirmer",
  "Schlegel",
  "Schlicht",
  "Schlosser",
  "Schmid",
  "Schmidt",
  "Schmitt",
  "Schmitz",
  "Schneider",
  "Schnell",
  "Schoen",
  "Scholz",
  "Schott",
  "Schreiber",
  "Schroeder",
  "Schubert",
  "Schulz",
  "Schulze",
  "Schumacher",
  "Schuster",
  "Schwarz",
  "Seidel",
  "Seifert",
  "Seitz",
  "Siebert",
  "Simon",
  "Singer",
  "Sommer",
  "Sorg",
  "Specht",
  "Stark",
  "Stein",
  "Steiner",
  "Stoll",
  "Strauss",
  "Strobel",
  "Sturm",
  "Suss",
  "Thiel",
  "Thomas",
  "Thomsen",
  "Timm",
  "Ulrich",
  "Urban",
  "Vetter",
  "Vogel",
  "Vogt",
  "Voigt",
  "Volk",
  "Wagner",
  "Walter",
  "Weber",
  "Weidner",
  "Weiss",
  "Wenzel",
  "Werner",
  "Westermann",
  "Wiedemann",
  "Wiese",
  "Wild",
  "Wilhelm",
  "Winkler",
  "Winter",
  "Witt",
  "Witte",
  "Wolf",
  "Wolff",
  "Wulff",
  "Zander",
  "Ziegler",
  "Zimmermann"
];

// resources/static_db/names/it_data.ts
var IT_MALE_FIRSTNAMES = [
  "Lorenzo",
  "Francesco",
  "Alessandro",
  "Andrea",
  "Matteo",
  "Marco",
  "Luca",
  "Davide",
  "Federico",
  "Nicolo",
  "Simone",
  "Antonio",
  "Giuseppe",
  "Giovanni",
  "Roberto",
  "Stefano",
  "Riccardo",
  "Fabio",
  "Daniele",
  "Emanuele",
  "Filippo",
  "Giacomo",
  "Leonardo",
  "Edoardo",
  "Gabriele",
  "Mattia",
  "Diego",
  "Manuel",
  "Christian",
  "Salvatore",
  "Angelo",
  "Vincenzo",
  "Dario",
  "Claudio",
  "Paolo",
  "Giorgio",
  "Massimo",
  "Gianluca",
  "Sergio",
  "Alberto",
  "Pietro",
  "Enrico",
  "Michele",
  "Cristiano",
  "Tommaso",
  "Guglielmo",
  "Umberto",
  "Raffaele",
  "Cesare",
  "Giulio",
  "Alessio",
  "Samuele",
  "Edoardo",
  "Elia",
  "Noah",
  "Enea",
  "Nicola",
  "Saverio",
  "Ruggero",
  "Amedeo",
  "Bruno",
  "Igor",
  "Ivan",
  "Mauro",
  "Carmine",
  "Gaetano",
  "Domenico",
  "Pasquale",
  "Ciro",
  "Rocco",
  "Pio",
  "Emilio",
  "Alfonso",
  "Gennaro",
  "Luigi",
  "Mario",
  "Pierluigi",
  "Gianmarco",
  "Gianfranco",
  "Gianpiero",
  "Giancarlo",
  "Vittorio",
  "Valerio",
  "Franco",
  "Sandro",
  "Renato",
  "Piero",
  "Simeone",
  "Tiziano",
  "Leandro",
  "Mirko",
  "Eros",
  "Nerio",
  "Loris",
  "Gioele",
  "Matias"
];
var IT_MALE_LASTNAMES = [
  "Rossi",
  "Ferrari",
  "Esposito",
  "Bianchi",
  "Romano",
  "Colombo",
  "Ricci",
  "Marino",
  "Greco",
  "Bruno",
  "Gallo",
  "Conti",
  "Mancini",
  "Costa",
  "Giordano",
  "Rizzo",
  "Lombardi",
  "Moretti",
  "Barbieri",
  "Fontana",
  "Santoro",
  "Marini",
  "Rinaldi",
  "Caruso",
  "Ferrara",
  "Galli",
  "Martini",
  "Leone",
  "Longo",
  "Gentile",
  "Palumbo",
  "Martinelli",
  "Valenti",
  "Russo",
  "De Luca",
  "Ferretti",
  "Sorrentino",
  "Sala",
  "Fabbri",
  "Villa",
  "De Santis",
  "Vitale",
  "Serra",
  "D Angelo",
  "Riva",
  "Palmieri",
  "Monti",
  "Testa",
  "Grassi",
  "Ferraro",
  "Fiore",
  "Messina",
  "Lombardo",
  "Parisi",
  "Amato",
  "Sanna",
  "Fusco",
  "Coppola",
  "Ruggiero",
  "De Rosa",
  "Marchetti",
  "Pellegrini",
  "Bianco",
  "Bernardi",
  "Orlando",
  "Costanzo",
  "Piras",
  "Mazza",
  "Puglisi",
  "Battaglia",
  "Farina",
  "Basile",
  "Ferri",
  "Cattaneo",
  "Pagano",
  "Neri",
  "Graziani",
  "Guidi",
  "Pace",
  "Milani",
  "Benedetti",
  "Rossetti",
  "Caputo",
  "Sartori",
  "Gatti",
  "Gatti",
  "De Angelis",
  "La Rosa",
  "Mariani",
  "Ramosi",
  "Donati",
  "Rossiello",
  "Bernasconi",
  "Moro",
  "De Maio",
  "Pastore",
  "Bellini",
  "Fiorentino",
  "Negri",
  "Corsi",
  "Raimondi",
  "Pini",
  "Morelli",
  "Napoletano"
];

// resources/static_db/names/fr_data.ts
var FR_MALE_FIRSTNAMES = [
  "Lucas",
  "Hugo",
  "Mathis",
  "Nathan",
  "Tom",
  "Baptiste",
  "Theo",
  "Alexis",
  "Arthur",
  "Leo",
  "Jules",
  "Timeo",
  "Quentin",
  "Romain",
  "Antoine",
  "Pierre",
  "Louis",
  "Clement",
  "Maxime",
  "Nicolas",
  "Julien",
  "Sebastien",
  "Kylian",
  "Karim",
  "Moussa",
  "Ousmane",
  "Youssef",
  "Mehdi",
  "Amine",
  "Samir",
  "Kevin",
  "Jordan",
  "Olivier",
  "Vincent",
  "Damien",
  "Gauthier",
  "Florian",
  "Adrien",
  "Benoit",
  "Guillaume",
  "Jean",
  "Paul",
  "Marc",
  "Thomas",
  "Benjamin",
  "Alexandre",
  "Samuel",
  "Ethan",
  "Enzo",
  "Noah",
  "Gabriel",
  "Raphael",
  "Maxence",
  "Corentin",
  "Matteo",
  "Sacha",
  "Axel",
  "Valentin",
  "Dylan",
  "Yanis",
  "Ilyes",
  "Anis",
  "Rayan",
  "Yassine",
  "Mohamed",
  "Ibrahim",
  "Idris",
  "Nassim",
  "Bilal",
  "Walid",
  "Farid",
  "Tariq",
  "Rachid",
  "Mustapha",
  "Alain",
  "Patrick",
  "Christophe",
  "Frederic",
  "Jerome",
  "Laurent",
  "Philippe",
  "Stephane",
  "Gerard",
  "Bernard",
  "Michel",
  "Jacques",
  "Daniel",
  "Eric",
  "Franck",
  "Cedric",
  "Remy",
  "Loic",
  "Mickael",
  "Jonathan",
  "Yohan",
  "Gael",
  "Bruno",
  "Lionel",
  "Bastien",
  "Tristan"
];
var FR_MALE_LASTNAMES = [
  "Martin",
  "Bernard",
  "Dubois",
  "Thomas",
  "Robert",
  "Richard",
  "Petit",
  "Durand",
  "Leroy",
  "Moreau",
  "Simon",
  "Laurent",
  "Lefebvre",
  "Michel",
  "Garcia",
  "David",
  "Bertrand",
  "Roux",
  "Vincent",
  "Fournier",
  "Morel",
  "Girard",
  "Andre",
  "Lefevre",
  "Mercier",
  "Dupont",
  "Lambert",
  "Bonnet",
  "Francois",
  "Martinez",
  "Legrand",
  "Garnier",
  "Faure",
  "Rousseau",
  "Blanc",
  "Guerin",
  "Muller",
  "Henry",
  "Roussel",
  "Nicolas",
  "Mathieu",
  "Boyer",
  "Lemaire",
  "Lopez",
  "Meunier",
  "Gauthier",
  "Chevalier",
  "Pereira",
  "Robin",
  "Leclerc",
  "Leroux",
  "Barbier",
  "Vidal",
  "Caron",
  "Picard",
  "Roger",
  "Renard",
  "Schmitt",
  "Lefort",
  "Boucher",
  "Lecomte",
  "Giraud",
  "Colin",
  "Perrin",
  "Masson",
  "Dufour",
  "Fernandez",
  "Morin",
  "Girault",
  "Dumont",
  "Marie",
  "Noel",
  "Clement",
  "Benoit",
  "Gilles",
  "Bourgeois",
  "Delattre",
  "Marchand",
  "Deschamps",
  "Charpentier",
  "Hubert",
  "Brun",
  "Rey",
  "Riviere",
  "Delaunay",
  "Pasquier",
  "Paul",
  "Leger",
  "Leveque",
  "Guillot",
  "Payet",
  "Adam",
  "Pichon",
  "Cousin",
  "Pelletier",
  "Remy",
  "Aubert",
  "Lemoine",
  "Rolland",
  "Olivier"
];

// resources/static_db/names/Japanese_data.ts
var JAPANESE_MALE_FIRSTNAMES = [
  "Haruto",
  "Minato",
  "Yuma",
  "Sota",
  "Hiroto",
  "Ren",
  "Itsuki",
  "Riku",
  "Haruki",
  "Yuto",
  "Kaito",
  "Daiki",
  "Takumi",
  "Ryusei",
  "Shota",
  "Kenta",
  "Yuki",
  "Ryota",
  "Taiga",
  "Soma",
  "Aoi",
  "Hinata",
  "Asahi",
  "Yuito",
  "Ritsu",
  "Kai",
  "Sho",
  "Kenji",
  "Kenzo",
  "Akira",
  "Hiroshi",
  "Takashi",
  "Satoshi",
  "Tatsuya",
  "Kazuki",
  "Masato",
  "Naoki",
  "Shinji",
  "Daisuke",
  "Koji",
  "Yoshiki",
  "Tsubasa",
  "Hayato",
  "Rei",
  "Sora",
  "Koki",
  "Arata",
  "Kei",
  "Ryo",
  "Tomoya",
  "Shun",
  "Yuya",
  "Seiji",
  "Hikaru",
  "Makoto",
  "Takeshi",
  "Jun",
  "Kiyoshi",
  "Noboru",
  "Osamu",
  "Susumu",
  "Tsuyoshi",
  "Yasuo",
  "Akihiko",
  "Kazuhiro",
  "Masahiro",
  "Toshiro",
  "Yoshio",
  "Goro",
  "Hachiro",
  "Jiro",
  "Saburo",
  "Ichiro",
  "Daichi",
  "Haruma",
  "Kota",
  "Nagi",
  "Ryoma",
  "So",
  "Toma",
  "Yusei",
  "Ayato",
  "Eita",
  "Fuma",
  "Gaku",
  "Hiroki",
  "Iori",
  "Kairi",
  "Mao",
  "Nao",
  "Raito",
  "Shion",
  "Taichi",
  "Yuichi",
  "Yuma",
  "Zen",
  "Aoto",
  "Haru",
  "Kazu",
  "Rui",
  "Takeru"
];
var JAPANESE_MALE_SURNAMES = [
  "Sato",
  "Suzuki",
  "Takahashi",
  "Tanaka",
  "Watanabe",
  "Ito",
  "Yamamoto",
  "Nakamura",
  "Kobayashi",
  "Kato",
  "Yoshida",
  "Yamada",
  "Sasaki",
  "Yamaguchi",
  "Matsumoto",
  "Saito",
  "Inoue",
  "Kimura",
  "Hayashi",
  "Shimizu",
  "Yamazaki",
  "Ikeda",
  "Abe",
  "Hashimoto",
  "Yamashita",
  "Mori",
  "Ishikawa",
  "Nakajima",
  "Maeda",
  "Ogawa",
  "Fujita",
  "Okada",
  "Goto",
  "Hasegawa",
  "Murakami",
  "Ishii",
  "Kondo",
  "Sakamoto",
  "Endo",
  "Aoki",
  "Fujii",
  "Nishimura",
  "Fukuda",
  "Ota",
  "Miura",
  "Fujiwara",
  "Okamoto",
  "Matsuda",
  "Nakagawa",
  "Nakano",
  "Harada",
  "Ono",
  "Saito",
  "Takeuchi",
  "Tamura",
  "Kaneko",
  "Wada",
  "Nakayama",
  "Ishida",
  "Ueda",
  "Morita",
  "Shibata",
  "Hara",
  "Sakai",
  "Kudo",
  "Miyazaki",
  "Yokoyama",
  "Miyamoto",
  "Uchida",
  "Takagi",
  "Ando",
  "Taniguchi",
  "Ono",
  "Maruyama",
  "Takada",
  "Imai",
  "Kawano",
  "Kojima",
  "Fujimoto",
  "Takeda",
  "Murata",
  "Ueno",
  "Sugiyama",
  "Masuda",
  "Koyama",
  "Sugawara",
  "Hirano",
  "Otsuka",
  "Kubo",
  "Chiba",
  "Matsui",
  "Iwasaki",
  "Noguchi",
  "Kinoshita",
  "Matsuo",
  "Kikuchi",
  "Nomura",
  "Sano",
  "Watabe",
  "Arai"
];

// resources/static_db/names/korean_data.ts
var KOREAN_MALE_FIRSTNAMES = [
  "Min-jun",
  "Seo-jun",
  "Ha-jun",
  "Do-yun",
  "Eun-woo",
  "Si-woo",
  "Ji-ho",
  "Ye-jun",
  "Yu-jun",
  "Joo-won",
  "Su-ho",
  "Ji-hu",
  "Jun-seo",
  "Do-hyun",
  "Tae-o",
  "Seon-woo",
  "I-jun",
  "Ha-yoon",
  "Ji-woo",
  "Min-ho",
  "Hyun-woo",
  "Tae-joon",
  "Seung-ho",
  "Jae-min",
  "Dong-hyun",
  "Sang-hoon",
  "Woo-jin",
  "Jin-woo",
  "Hyeon-jun",
  "Jun-ho",
  "Sung-min",
  "Young-ho",
  "Jae-hyuk",
  "Min-seok",
  "Tae-min",
  "Hyun-seok",
  "Seung-min",
  "Ji-yong",
  "Chang-ho",
  "Kyung-ho",
  "Beom-seok",
  "Dae-hyun",
  "Kang-min",
  "Ho-jun",
  "Seok-jin",
  "Jin-hyuk",
  "Yong-jun",
  "Hoon",
  "Jae-joon",
  "Min-kyu",
  "Seung-jun",
  "Tae-hyung",
  "Ji-seok",
  "Hyun-tae",
  "Woo-seok",
  "Sang-min",
  "Dong-woo",
  "Joon-hyuk",
  "Seung-hyun",
  "Young-min",
  "Jae-won",
  "Min-woo",
  "Hyun-jin",
  "Do-won",
  "Eun-ho",
  "Si-on",
  "Ha-min",
  "Jun-young",
  "Tae-woo",
  "Seo-ho",
  "Ji-an",
  "Yu-han",
  "Seon-min",
  "Hyeon-woo",
  "Kang-woo",
  "Jin-seok",
  "Min-seong",
  "Woo-bin",
  "Jae-sung",
  "Dong-jun",
  "Sung-hoon",
  "Tae-sik",
  "Hyun-soo",
  "Seung-woo",
  "Young-joon",
  "Jae-beom",
  "Min-tae",
  "Ho-young",
  "Chang-min",
  "Kyung-min",
  "Beom-jun",
  "Dae-jun",
  "Sang-woo",
  "Jin-ho",
  "Seok-min",
  "Woo-jun",
  "Ji-hyeon",
  "Min-sik",
  "Tae-sung",
  "Hyun-min"
];
var KOREAN_MALE_SURNAMES = [
  "Kim",
  "Lee",
  "Park",
  "Choi",
  "Jung",
  "Kang",
  "Jo",
  "Yoon",
  "Jang",
  "Lim",
  "Han",
  "Oh",
  "Shin",
  "Seo",
  "Kwon",
  "Hwang",
  "Ahn",
  "Song",
  "Ryu",
  "Hong",
  "Jeon",
  "Yang",
  "Bae",
  "Son",
  "Baek",
  "Go",
  "Moon",
  "Yoo",
  "Cha",
  "Jeong",
  "Nam",
  "Sim",
  "Yeo",
  "Kwak",
  "Seong",
  "Ha",
  "Woo",
  "Im",
  "Byun",
  "Heo",
  "Yun",
  "Na",
  "Min",
  "Ji",
  "Um",
  "Jin",
  "Jwa",
  "Chae",
  "Ma",
  "Bang",
  "Ko",
  "Lee",
  "Park",
  "Kim",
  "Choi",
  "Jung",
  "Kang",
  "Yoon",
  "Jang",
  "Lim",
  "Han",
  "Oh",
  "Shin",
  "Seo",
  "Kwon",
  "Hwang",
  "Ahn",
  "Song",
  "Ryu",
  "Hong",
  "Jeon",
  "Yang",
  "Bae",
  "Son",
  "Baek",
  "Go",
  "Moon",
  "Yoo",
  "Cha",
  "Jeong",
  "Nam",
  "Sim",
  "Yeo",
  "Kwak",
  "Seong",
  "Ha",
  "Woo",
  "Im",
  "Byun",
  "Heo",
  "Yun",
  "Na",
  "Min",
  "Ji",
  "Um",
  "Jin",
  "Jwa",
  "Chae",
  "Ma",
  "Bang"
];

// resources/static_db/names/argentinian_data.ts
var ARGENTINIAN_MALE_FIRSTNAMES = [
  "Juan",
  "Carlos",
  "Luis",
  "Jorge",
  "Miguel",
  "Roberto",
  "Pedro",
  "Jos\xE9",
  "Antonio",
  "Francisco",
  "Diego",
  "Fernando",
  "Ricardo",
  "Pablo",
  "Andr\xE9s",
  "Nicol\xE1s",
  "Santiago",
  "Mat\xEDas",
  "Tom\xE1s",
  "Lucas",
  "Facundo",
  "Gonzalo",
  "Emiliano",
  "Javier",
  "Mart\xEDn",
  "Alejandro",
  "Leonardo",
  "Sebasti\xE1n",
  "Gabriel",
  "Manuel",
  "Agust\xEDn",
  "Federico",
  "Hern\xE1n",
  "Ignacio",
  "Eduardo",
  "Marcelo",
  "Ra\xFAl",
  "Hugo",
  "Oscar",
  "Daniel",
  "Adri\xE1n",
  "Gustavo",
  "Sergio",
  "Ram\xF3n",
  "Esteban",
  "Mariano",
  "Claudio",
  "V\xEDctor",
  "Enrique",
  "Alberto",
  "Mauricio",
  "Rub\xE9n",
  "Patricio",
  "Cristian",
  "David",
  "Maximiliano",
  "Benjam\xEDn",
  "Joaqu\xEDn",
  "Thiago",
  "Mateo",
  "Valent\xEDn",
  "Lautaro",
  "Franco",
  "Bruno",
  "Nicol\xE1s",
  "Santino",
  "Liam",
  "Thiago",
  "Felipe",
  "Matteo",
  "Noah",
  "Dante",
  "Jer\xF3nimo",
  "Tob\xEDas",
  "Ramiro",
  "Ezequiel",
  "Leandro",
  "Nahuel",
  "Facundo",
  "Gonzalo",
  "Emiliano",
  "Javier",
  "Mart\xEDn",
  "Alejandro",
  "Leonardo",
  "Sebasti\xE1n",
  "Gabriel",
  "Manuel",
  "Agust\xEDn",
  "Federico",
  "Hern\xE1n",
  "Ignacio",
  "Eduardo",
  "Marcelo",
  "Ra\xFAl",
  "Hugo",
  "Oscar",
  "Daniel",
  "Adri\xE1n",
  "Gustavo",
  "Sergio",
  "Ram\xF3n",
  "Esteban",
  "Mariano",
  "Claudio",
  "V\xEDctor",
  "Enrique",
  "Alberto",
  "Mauricio",
  "Rub\xE9n",
  "Patricio",
  "Cristian",
  "David",
  "Maximiliano",
  "Benjam\xEDn",
  "Joaqu\xEDn",
  "Thiago",
  "Mateo",
  "Valent\xEDn",
  "Lautaro",
  "Franco",
  "Bruno",
  "Santino",
  "Liam",
  "Felipe",
  "Matteo",
  "Noah",
  "Dante",
  "Jer\xF3nimo",
  "Tob\xEDas",
  "Ramiro",
  "Ezequiel",
  "Leandro",
  "Nahuel",
  "Alexis",
  "Brian",
  "C\xE9sar",
  "Dami\xE1n",
  "El\xEDas",
  "Fabio",
  "Gast\xF3n",
  "H\xE9ctor",
  "Iv\xE1n",
  "Julio",
  "Kevin",
  "Luciano",
  "Mat\xEDas",
  "Nicol\xE1s",
  "Octavio",
  "Pablo",
  "Quint\xEDn",
  "Rodrigo",
  "Santiago",
  "Tom\xE1s",
  "Ulises",
  "V\xEDctor",
  "Walter",
  "Xavier",
  "Yago",
  "Zacar\xEDas",
  "Abel",
  "Adolfo",
  "\xC1lvaro",
  "Amado",
  "An\xEDbal",
  "Armando",
  "Arturo",
  "Atilio",
  "Augusto",
  "Bartolom\xE9",
  "Benjam\xEDn",
  "Bernardo",
  "Blas",
  "Braulio",
  "Camilo",
  "C\xE1ndido",
  "C\xE9sar",
  "Crist\xF3bal",
  "Dami\xE1n",
  "Dar\xEDo",
  "Domingo",
  "Donato",
  "Edgardo",
  "Eduardo",
  "Elio",
  "Emilio",
  "Enrique",
  "Ernesto",
  "Eugenio",
  "Fabian",
  "Fausto",
  "Felipe",
  "Ferm\xEDn",
  "Fernando",
  "Fidel",
  "Francisco",
  "Franco",
  "Gabriel",
  "Gast\xF3n",
  "Gerardo",
  "Germ\xE1n",
  "Gilberto",
  "Gonzalo",
  "Gregorio",
  "Guillermo",
  "Gustavo",
  "H\xE9ctor",
  "Hern\xE1n",
  "Horacio",
  "Hugo",
  "Humberto",
  "Ignacio",
  "Ildefonso",
  "Ismael",
  "Jacinto",
  "Jaime",
  "Javier",
  "Jes\xFAs",
  "Jorge",
  "Jos\xE9",
  "Juan",
  "Julio",
  "Justo",
  "Lautaro",
  "Leandro",
  "Leonardo",
  "Leopoldo",
  "Lino",
  "Lorenzo",
  "Lucas",
  "Luciano",
  "Luis",
  "Manuel",
  "Marcelo",
  "Marco",
  "Marcos",
  "Mariano",
  "Mario",
  "Mart\xEDn",
  "Mateo",
  "Mat\xEDas",
  "Mauricio",
  "M\xE1ximo",
  "Miguel",
  "Milton",
  "Mois\xE9s",
  "Nahuel",
  "N\xE9stor",
  "Nicol\xE1s",
  "Norberto",
  "Octavio",
  "Omar",
  "Oscar",
  "Pablo",
  "Patricio",
  "Pedro",
  "Rafael",
  "Ram\xF3n",
  "Ra\xFAl",
  "Ren\xE9",
  "Ricardo",
  "Roberto",
  "Rodrigo",
  "Rom\xE1n",
  "Rub\xE9n",
  "Rufino",
  "Salvador",
  "Santiago",
  "Sebasti\xE1n",
  "Sergio",
  "Sim\xF3n",
  "Teodoro",
  "Tom\xE1s",
  "Ulises",
  "Uriel",
  "Valent\xEDn",
  "Vicente",
  "V\xEDctor",
  "Walter",
  "Xavier",
  "Yago",
  "Zacar\xEDas",
  "Abelardo",
  "Adalberto",
  "Ad\xE1n",
  "Agust\xEDn",
  "Albano",
  "Alejandro",
  "Alfonso",
  "Alfredo",
  "Alonso",
  "\xC1lvaro",
  "Amancio",
  "Anselmo",
  "Antonio",
  "Ariel",
  "Armando",
  "Arturo",
  "Augusto",
  "Aurelio",
  "Baltasar",
  "Bartolom\xE9",
  "Basilio",
  "Benito",
  "Bernardo",
  "Blas",
  "Bonifacio",
  "Bruno",
  "Camilo",
  "Carlos",
  "C\xE9sar",
  "Cristian",
  "Crist\xF3bal",
  "Dami\xE1n",
  "Daniel",
  "Dar\xEDo",
  "David",
  "Diego",
  "Domingo",
  "Donato",
  "Edgardo",
  "Eduardo",
  "El\xEDas",
  "Emiliano",
  "Emilio",
  "Enrique",
  "Ernesto",
  "Esteban",
  "Eugenio",
  "Fabio",
  "Facundo",
  "Federico",
  "Felipe",
  "Fernando",
  "Francisco",
  "Franco",
  "Gabriel",
  "Gast\xF3n",
  "Gerardo",
  "Germ\xE1n",
  "Gonzalo",
  "Gregorio",
  "Guillermo",
  "Gustavo",
  "H\xE9ctor",
  "Hern\xE1n",
  "Horacio",
  "Hugo",
  "Ignacio",
  "Ismael",
  "Iv\xE1n",
  "Jacinto",
  "Jaime",
  "Javier",
  "Jer\xF3nimo",
  "Jes\xFAs",
  "Joaqu\xEDn",
  "Jorge",
  "Jos\xE9",
  "Juan",
  "Julio",
  "Lautaro",
  "Leandro",
  "Leonardo",
  "Lucas",
  "Luciano",
  "Luis",
  "Manuel",
  "Marcelo",
  "Marco",
  "Mariano",
  "Mario",
  "Mart\xEDn",
  "Mateo",
  "Mat\xEDas",
  "Mauricio",
  "Maximiliano",
  "Miguel",
  "Nahuel",
  "Nicol\xE1s",
  "Octavio",
  "Oscar",
  "Pablo",
  "Patricio",
  "Pedro",
  "Rafael",
  "Ram\xF3n",
  "Ra\xFAl",
  "Ricardo",
  "Roberto",
  "Rodrigo",
  "Rom\xE1n",
  "Rub\xE9n",
  "Salvador",
  "Santiago",
  "Sebasti\xE1n",
  "Sergio",
  "Sim\xF3n",
  "Tom\xE1s",
  "Ulises",
  "Valent\xEDn",
  "V\xEDctor",
  "Walter",
  "Xavier"
];
var ARGENTINIAN_MALE_LASTNAMES = [
  "Garc\xEDa",
  "Rodr\xEDguez",
  "L\xF3pez",
  "Mart\xEDnez",
  "P\xE9rez",
  "Gonz\xE1lez",
  "S\xE1nchez",
  "Romero",
  "Fern\xE1ndez",
  "D\xEDaz",
  "Moreno",
  "\xC1lvarez",
  "Torres",
  "Ruiz",
  "Ram\xEDrez",
  "Flores",
  "Acosta",
  "Molina",
  "Su\xE1rez",
  "Castro",
  "Rojas",
  "Ortiz",
  "Silva",
  "Navarro",
  "Vargas",
  "Morales",
  "Herrera",
  "Medina",
  "Aguirre",
  "Guti\xE9rrez",
  "Ramos",
  "Jim\xE9nez",
  "Mendoza",
  "Delgado",
  "V\xE1zquez",
  "Cruz",
  "Castillo",
  "Sosa",
  "Alvarez",
  "Vega",
  "Pereyra",
  "R\xEDos",
  "Luna",
  "Mu\xF1oz",
  "Blanco",
  "Soto",
  "Campos",
  "Ibarra",
  "Peralta",
  "Ben\xEDtez",
  "M\xE9ndez",
  "Ferrari",
  "Paz",
  "Godoy",
  "Carrizo",
  "Quiroga",
  "Rivera",
  "Cort\xE9s",
  "Cabrera",
  "Vera",
  "C\xE1ceres",
  "Figueroa",
  "Dom\xEDnguez",
  "Reyes",
  "Guerrero",
  "Montes",
  "Santana",
  "Maldonado",
  "Correa",
  "Valdez",
  "Espinoza",
  "M\xE1rquez",
  "Santos",
  "Ponce",
  "Villalba",
  "Arias",
  "Ojeda",
  "Salazar",
  "Miranda",
  "Leiva",
  "Barrios",
  "Galv\xE1n",
  "Aguilera",
  "P\xE1ez",
  "Escobar",
  "Montero",
  "Alonso",
  "Contreras",
  "Barreto",
  "Duarte",
  "Palacios",
  "Serrano",
  "Pe\xF1a",
  "Carrasco",
  "Gallardo",
  "Rueda",
  "Vidal",
  "Arce",
  "Guzm\xE1n",
  "Fuentes",
  "Salas",
  "Vallejos",
  "Coronel",
  "Bustos",
  "Ledesma",
  "Franco",
  "Cardozo",
  "Lucero",
  "Nieto",
  "Rold\xE1n",
  "Villanueva",
  "Sandoval",
  "Z\xE1rate",
  "Bianchi",
  "Morel",
  "Lombardi",
  "Russo",
  "Ferrari",
  "Romano",
  "Marino",
  "Conte",
  "Bruno",
  "Rossi",
  "Bianchi",
  "Moretti",
  "Esp\xF3sito",
  "De Luca",
  "Rizzo",
  "Barbieri",
  "Colombo",
  "Gallo",
  "Gentile",
  "Greco",
  "Lombardi",
  "Marchetti",
  "Martini",
  "Mazza",
  "Monti",
  "Neri",
  "Orlando",
  "Pellegrini",
  "Ricci",
  "Rinaldi",
  "Rossi",
  "Russo",
  "Santoro",
  "Serra",
  "Sorrentino",
  "Valentini",
  "Vitale",
  "Abad",
  "Acosta",
  "Aguilar",
  "Alonso",
  "\xC1lvarez",
  "Andrade",
  "Arias",
  "Arrieta",
  "B\xE1ez",
  "Barrios",
  "Ben\xEDtez",
  "Blanco",
  "Bustos",
  "Cabrera",
  "Campos",
  "C\xE1ceres",
  "Carrizo",
  "Castillo",
  "Castro",
  "Correa",
  "Cort\xE9s",
  "Cruz",
  "Delgado",
  "D\xEDaz",
  "Dom\xEDnguez",
  "Duarte",
  "Escobar",
  "Espinoza",
  "Fern\xE1ndez",
  "Figueroa",
  "Flores",
  "Franco",
  "Fuentes",
  "Galv\xE1n",
  "Garc\xEDa",
  "Godoy",
  "G\xF3mez",
  "Gonz\xE1lez",
  "Guerrero",
  "Guti\xE9rrez",
  "Herrera",
  "Ibarra",
  "Jim\xE9nez",
  "Ledesma",
  "Leiva",
  "L\xF3pez",
  "Luna",
  "Maldonado",
  "M\xE1rquez",
  "Mart\xEDnez",
  "Medina",
  "M\xE9ndez",
  "Mendoza",
  "Miranda",
  "Molina",
  "Montero",
  "Montes",
  "Morales",
  "Moreno",
  "Mu\xF1oz",
  "Navarro",
  "Nieto",
  "Ojeda",
  "Ortiz",
  "P\xE1ez",
  "Palacios",
  "Paz",
  "Pe\xF1a",
  "Peralta",
  "P\xE9rez",
  "Ponce",
  "Quiroga",
  "Ram\xEDrez",
  "Ramos",
  "Reyes",
  "R\xEDos",
  "Rivera",
  "Rojas",
  "Rold\xE1n",
  "Romero",
  "Ruiz",
  "Salas",
  "Salazar",
  "S\xE1nchez",
  "Sandoval",
  "Santana",
  "Santos",
  "Serrano",
  "Silva",
  "Sosa",
  "Soto",
  "Su\xE1rez",
  "Torres",
  "Valdez",
  "Vallejos",
  "Vargas",
  "V\xE1zquez",
  "Vega",
  "Vera",
  "Villalba",
  "Villanueva",
  "Z\xE1rate",
  "Acu\xF1a",
  "Alarc\xF3n",
  "Almada",
  "Almir\xF3n",
  "Altamirano",
  "Amaya",
  "Arce",
  "Ardiles",
  "Arellano",
  "Ayala",
  "B\xE1ez",
  "Barreto",
  "Basualdo",
  "Battaglia",
  "Beltr\xE1n",
  "Berm\xFAdez",
  "Bogado",
  "Bonifacio",
  "Bord\xF3n",
  "Brizuela",
  "Bustos",
  "C\xE1ceres",
  "Calder\xF3n",
  "C\xE1mera",
  "Cantero",
  "Cardozo",
  "Carrizo",
  "Casco",
  "Cejas",
  "Centuri\xF3n",
  "Ch\xE1vez",
  "Coronel",
  "Corval\xE1n",
  "Crespo",
  "De la Cruz",
  "Dom\xEDnguez",
  "Duarte",
  "Encina",
  "Escobar",
  "Esp\xEDnola",
  "Falc\xF3n",
  "Far\xEDas",
  "Ferreira",
  "Flores",
  "Franco",
  "Galarza",
  "Gallardo",
  "Gim\xE9nez",
  "G\xF3mez",
  "Gonz\xE1lez",
  "Guerra",
  "Guerrero",
  "Guzm\xE1n",
  "Heredia",
  "Hern\xE1ndez",
  "Ibarra",
  "Insfr\xE1n",
  "Jara",
  "Ledesma",
  "Leiva",
  "Lencina",
  "L\xF3pez",
  "Lozano",
  "Lucero",
  "Lugo",
  "Maldonado",
  "Mar\xEDn",
  "Mart\xEDnez",
  "M\xE9ndez",
  "Mendoza",
  "Merlo",
  "Miranda",
  "Montiel",
  "Morales",
  "Moreno",
  "N\xFA\xF1ez",
  "Ojeda",
  "Oliva",
  "Ortiz",
  "Oviedo",
  "P\xE1ez",
  "Palacios",
  "Paredes",
  "Paz",
  "Pe\xF1a",
  "Peralta",
  "P\xE9rez",
  "Ponce",
  "Portillo",
  "Qui\xF1ones",
  "Quiroga",
  "Ram\xEDrez",
  "Ramos",
  "Reyes",
  "R\xEDos",
  "Rivero",
  "Rojas",
  "Romero",
  "Ruiz",
  "Salas",
  "Salazar",
  "S\xE1nchez",
  "Sandoval",
  "Santos",
  "Serrano",
  "Sosa",
  "Soto",
  "Su\xE1rez",
  "Tapia",
  "Torres",
  "Valdez",
  "Vallejos",
  "Vargas",
  "V\xE1zquez",
  "Vega",
  "Vera",
  "Villalba",
  "Villanueva",
  "Z\xE1rate",
  "Zelaya"
];

// resources/static_db/names/brazilian_data.ts
var BRAZILIAN_MALE_FIRSTNAMES = [
  "Jos\xE9",
  "Jo\xE3o",
  "Antonio",
  "Francisco",
  "Carlos",
  "Paulo",
  "Pedro",
  "Lucas",
  "Luiz",
  "Marcos",
  "Miguel",
  "Gabriel",
  "Arthur",
  "Heitor",
  "Davi",
  "Bernardo",
  "Jo\xE3o Miguel",
  "Jo\xE3o Pedro",
  "Enzo",
  "Enzo Gabriel",
  "Rafael",
  "Felipe",
  "Rodrigo",
  "Mateus",
  "Matheus",
  "Gustavo",
  "Bruno",
  "Eduardo",
  "Daniel",
  "Marcelo",
  "Thiago",
  "Tiago",
  "Andr\xE9",
  "Fernando",
  "Ricardo",
  "Roberto",
  "Jorge",
  "Alexandre",
  "Vinicius",
  "Leonardo",
  "Henrique",
  "Caio",
  "Cau\xE3",
  "Cau\xEA",
  "Kaique",
  "Kauan",
  "Luan",
  "Ryan",
  "Samuel",
  "Theo",
  "Noah",
  "Ben\xEDcio",
  "Levi",
  "Ravi",
  "Gael",
  "Matteo",
  "Bento",
  "Est\xEAv\xE3o",
  "Felipe",
  "Francisco",
  "Afonso",
  "Alejandro",
  "Alvaro",
  "Amarildo",
  "Anderson",
  "\xC2ngelo",
  "Ant\xF4nio",
  "Arnaldo",
  "Augusto",
  "Breno",
  "Caetano",
  "C\xE9sar",
  "Cl\xE1udio",
  "Cristiano",
  "Davi Lucas",
  "Diego",
  "Diogo",
  "Dion\xEDsio",
  "Douglas",
  "Edson",
  "Eduardo",
  "Elton",
  "Emerson",
  "Enrico",
  "Eric",
  "Erik",
  "F\xE1bio",
  "Fabr\xEDcio",
  "Fausto",
  "Filipe",
  "Fl\xE1vio",
  "Frederico",
  "Gabriel",
  "Gilberto",
  "Giovanni",
  "Guilherme",
  "H\xE9lio",
  "Hugo",
  "Igor",
  "\xCDtalo",
  "Ivan",
  "Jair",
  "Jo\xE3o Lucas",
  "Jo\xE3o Vitor",
  "Jonas",
  "J\xFAlio",
  "J\xFAnior",
  "Ladislau",
  "Lauro",
  "Leandro",
  "Le\xF4nidas",
  "L\xE9o",
  "Louren\xE7o",
  "Luciano",
  "Lu\xEDs",
  "Manoel",
  "Manuel",
  "Marcel",
  "M\xE1rcio",
  "Marco",
  "M\xE1rio",
  "Maur\xEDcio",
  "Murilo",
  "Natan",
  "Nelson",
  "Nicolas",
  "N\xEDcolas",
  "Ot\xE1vio",
  "Pablo",
  "Patrick",
  "Paulo Henrique",
  "Pedro Henrique",
  "Philippe",
  "Raimundo",
  "Raul",
  "Renan",
  "Renato",
  "Rian",
  "Richard",
  "Roberto",
  "Robson",
  "Rodrigo",
  "Rog\xE9rio",
  "Rom\xE1rio",
  "R\xF4mulo",
  "Ronaldo",
  "R\xFAben",
  "Sandro",
  "Sebasti\xE3o",
  "S\xE9rgio",
  "Silas",
  "Sim\xE3o",
  "Tadeu",
  "Tarc\xEDsio",
  "Thales",
  "Th\xE9o",
  "Thiago",
  "Thomas",
  "Tom\xE1s",
  "Valdir",
  "Valter",
  "Vanderlei",
  "Vitor",
  "Vit\xF3ria",
  "Wagner",
  "Waldir",
  "Washington",
  "Wesley",
  "William",
  "Xavier",
  "Yago",
  "Yuri",
  "Z\xE9",
  "Zeca",
  "Abel",
  "Adalberto",
  "Ad\xE3o",
  "Ademir",
  "Adriano",
  "A\xE9cio",
  "Ailton",
  "Airton",
  "Alan",
  "Alberto",
  "Alcides",
  "Aldo",
  "Alex",
  "Allan",
  "Alo\xEDsio",
  "Alu\xEDsio",
  "Amadeu",
  "Am\xE9rico",
  "Anselmo",
  "Antenor",
  "Aparecido",
  "Arlindo",
  "Armando",
  "Arnaldo",
  "Artur",
  "Ata\xEDde",
  "Aureliano",
  "Aur\xE9lio",
  "Baltazar",
  "Bartolomeu",
  "Bas\xEDlio",
  "Batista",
  "Belmiro",
  "Benedito",
  "Benjamim",
  "Bento",
  "Bernardo",
  "Boanerges",
  "Bonif\xE1cio",
  "Breno",
  "Caetano",
  "C\xE2ndido",
  "C\xE1ssio",
  "Celso",
  "C\xEDcero",
  "Cl\xE1udio",
  "Clodomiro",
  "Cl\xF3vis",
  "Constantino",
  "Cristiano",
  "Crist\xF3v\xE3o",
  "Dami\xE3o",
  "Dante",
  "D\xE1rio",
  "Davi",
  "D\xE9cio",
  "Dem\xE9trio",
  "Denis",
  "Deusdedit",
  "Djalma",
  "Domingos",
  "Donato",
  "Dorival",
  "Du\xEDlio",
  "Durval",
  "Edilson",
  "Edmar",
  "Edmilson",
  "Edson",
  "Eduardo",
  "El\xE1dio",
  "Elias",
  "El\xEDsio",
  "Elton",
  "Emanuel",
  "Em\xEDlio",
  "En\xE9as",
  "Ernesto",
  "Est\xE1cio",
  "Eug\xEAnio",
  "Eurico",
  "Evaristo",
  "Everaldo",
  "Expedito",
  "F\xE1bio",
  "Fabricio",
  "Faustino",
  "Fausto",
  "Feliciano",
  "F\xE9lix",
  "Fernandes",
  "Firmino",
  "Fl\xE1vio",
  "Flor\xEAncio",
  "Fortunato",
  "Francisco",
  "Franco",
  "Frederico",
  "Gabriel",
  "Geraldo",
  "Germano",
  "Get\xFAlio",
  "Gide\xE3o",
  "Gil",
  "Gilberto",
  "Glauber",
  "Glauco",
  "Gon\xE7alo",
  "Greg\xF3rio",
  "Guilherme",
  "Gustavo",
  "Hamilton",
  "Haroldo",
  "H\xE9lio",
  "Henrique",
  "Hermes",
  "Hil\xE1rio",
  "Humberto",
  "Ibrahim",
  "Idal\xEDcio",
  "In\xE1cio",
  "Irineu",
  "Isa\xEDas",
  "Ismael",
  "Israel",
  "Ivan",
  "Ivo",
  "Jacinto",
  "Jackson",
  "Jaime",
  "Jair",
  "Jairo",
  "James",
  "J\xE2nio",
  "Jardel",
  "Jarbas",
  "Jeferson",
  "Jer\xF4nimo",
  "Jesu\xEDno",
  "Jo\xE3o",
  "Joaquim",
  "Joel",
  "Jonas",
  "Jorge",
  "Jos\xE9",
  "Josu\xE9",
  "Joviano",
  "Juarez",
  "J\xFAlio",
  "J\xFAnior",
  "Juraci",
  "Justiniano",
  "Juvenal",
  "Kl\xE9ber",
  "Laerte",
  "Lauro",
  "Leandro",
  "Le\xF4ncio",
  "Leopoldo",
  "L\xEDdio",
  "Lino",
  "Louren\xE7o",
  "Lucas",
  "Luciano",
  "Lu\xEDs",
  "Maciel",
  "Manoel",
  "Manuel",
  "Marcelo",
  "M\xE1rcio",
  "Marco",
  "Marcos",
  "M\xE1rio",
  "Martinho",
  "Mateus",
  "Matheus",
  "Maur\xEDcio",
  "Mauro",
  "M\xE1ximo",
  "Melqu\xEDades",
  "Micael",
  "Miguel",
  "Milton",
  "Moacir",
  "Moises",
  "Murilo",
  "Nabor",
  "Nataniel",
  "N\xE9lio",
  "Nelson",
  "Nestor",
  "Newton",
  "Nicolau",
  "Nilo",
  "Nilton",
  "Nivaldo",
  "Norberto",
  "Olavo",
  "Ol\xEDmpio",
  "Onofre",
  "Oriovaldo",
  "Oscar",
  "Osman",
  "Osmar",
  "Osvaldo",
  "Otac\xEDlio",
  "Ot\xE1vio",
  "Otoniel",
  "Ovaldo",
  "Ozeias",
  "Pablo",
  "Pascoal",
  "Patr\xEDcio",
  "Paulo",
  "Pedro",
  "Pel\xE9",
  "Percival",
  "P\xE9ricles",
  "Pierre",
  "Pl\xEDnio",
  "Policarpo",
  "Prudente",
  "Quintino",
  "Rafael",
  "Raimundo",
  "Ramiro",
  "Ra\xFAl",
  "Reginaldo",
  "Reinaldo",
  "Renan",
  "Renato",
  "Ricardo",
  "Roberto",
  "Robson",
  "Rodolfo",
  "Rodrigo",
  "Rog\xE9rio",
  "Rom\xE1rio",
  "R\xF4mulo",
  "Ronald",
  "Ronaldo",
  "Roque",
  "Rui",
  "Ruy",
  "S\xE1lvio",
  "Samuel",
  "Sandoval",
  "Sandro",
  "Santiago",
  "Saulo",
  "Sebasti\xE3o",
  "S\xE9rgio",
  "Severino",
  "Sidney",
  "Silas",
  "Silvestre",
  "Sim\xE3o",
  "Sime\xE3o",
  "S\xEDlvio",
  "Sim\xE3o",
  "Sotero",
  "Stanislau",
  "Tadeu",
  "Tarc\xEDsio",
  "Tasso",
  "Teodoro",
  "Te\xF3filo",
  "Ter\xEAncio",
  "Thales",
  "Th\xE9o",
  "Thiago",
  "Thomas",
  "Thomaz",
  "Tib\xE9rio",
  "Tim\xF3teo",
  "Tobias",
  "Tom\xE1s",
  "Trist\xE3o",
  "Ubirajara",
  "Ubiratan",
  "Ulisses",
  "Urbano",
  "Valdemar",
  "Valdir",
  "Valter",
  "Vanderlei",
  "Vasco",
  "Ven\xE2ncio",
  "Venceslau",
  "Vicente",
  "Victor",
  "Vidal",
  "Vin\xEDcius",
  "Virg\xEDlio",
  "V\xEDtor",
  "Wagner",
  "Waldemar",
  "Waldir",
  "Washington",
  "Wellington",
  "Wesley",
  "William",
  "Wilson",
  "Xavier",
  "Yago",
  "Yuri",
  "Zacarias",
  "Zeno",
  "Z\xE9",
  "Zeca"
];
var BRAZILIAN_MALE_LASTNAMES = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Pereira",
  "Ferreira",
  "Lima",
  "Alves",
  "Rodrigues",
  "Costa",
  "Sousa",
  "Gomes",
  "Nascimento",
  "Araujo",
  "Ribeiro",
  "Almeida",
  "Jesus",
  "Barbosa",
  "Soares",
  "Carvalho",
  "Martins",
  "Rocha",
  "Dias",
  "Nunes",
  "Freitas",
  "Conceicao",
  "Melo",
  "Moreira",
  "Cardoso",
  "Reis",
  "Cruz",
  "Goncalves",
  "Andrade",
  "Mendes",
  "Teixeira",
  "Vieira",
  "Machado",
  "Marques",
  "Fernandes",
  "Lopes",
  "Santana",
  "Bezerra",
  "Campos",
  "Moraes",
  "Borges",
  "Monteiro",
  "Moura",
  "Miranda",
  "Castro",
  "Sampaio",
  "Siqueira",
  "Azevedo",
  "Cavalcante",
  "Coelho",
  "Correia",
  "Duarte",
  "Figueiredo",
  "Fonseca",
  "Garcia",
  "Leite",
  "Macedo",
  "Medeiros",
  "Moraes",
  "Morais",
  "Neves",
  "Pinto",
  "Queiroz",
  "Ramos",
  "Santos",
  "Silveira",
  "Torres",
  "Vargas",
  "Vieira",
  "Xavier",
  "Abreu",
  "Aguiar",
  "Amaral",
  "Amorim",
  "Andrade",
  "Anjos",
  "Antunes",
  "Aparecido",
  "Araujo",
  "Assis",
  "Azevedo",
  "Baptista",
  "Barreto",
  "Batista",
  "Borges",
  "Brandao",
  "Brito",
  "Bueno",
  "Cabral",
  "Caldas",
  "Caldeira",
  "Camargo",
  "Campos",
  "Cardoso",
  "Carneiro",
  "Carvalho",
  "Castilho",
  "Castro",
  "Cavalcanti",
  "Chaves",
  "Clemente",
  "Coelho",
  "Conceicao",
  "Correa",
  "Costa",
  "Coutinho",
  "Cruz",
  "Cunha",
  "Dantas",
  "Dias",
  "Diniz",
  "Domingues",
  "Duarte",
  "Farias",
  "Fernandes",
  "Ferreira",
  "Figueira",
  "Figueiredo",
  "Fonseca",
  "Franco",
  "Freitas",
  "Furtado",
  "Gama",
  "Garcia",
  "Gomes",
  "Goncalves",
  "Guerra",
  "Guimaraes",
  "Henrique",
  "Jesus",
  "Leal",
  "Leite",
  "Lima",
  "Lopes",
  "Loureiro",
  "Luz",
  "Macedo",
  "Machado",
  "Magalhaes",
  "Marques",
  "Martins",
  "Medeiros",
  "Melo",
  "Mendes",
  "Mendonca",
  "Miranda",
  "Monteiro",
  "Montes",
  "Moraes",
  "Morais",
  "Moreira",
  "Moura",
  "Muniz",
  "Nascimento",
  "Neves",
  "Nogueira",
  "Nunes",
  "Oliveira",
  "Pacheco",
  "Paiva",
  "Peixoto",
  "Pereira",
  "Pimentel",
  "Pinheiro",
  "Pinto",
  "Pires",
  "Queiroz",
  "Ramos",
  "Reis",
  "Rezende",
  "Ribeiro",
  "Rocha",
  "Rodrigues",
  "Romao",
  "Sampaio",
  "Santana",
  "Santiago",
  "Santos",
  "Saraiva",
  "Silva",
  "Silveira",
  "Siqueira",
  "Soares",
  "Sobrinho",
  "Sousa",
  "Souza",
  "Tavares",
  "Teixeira",
  "Torres",
  "Valente",
  "Valeriano",
  "Vargas",
  "Vasconcelos",
  "Ventura",
  "Vieira",
  "Xavier",
  "Afonso",
  "Aguiar",
  "Albuquerque",
  "Alencar",
  "Almeida",
  "Alves",
  "Amaral",
  "Andrade",
  "Antunes",
  "Araujo",
  "Assuncao",
  "Azevedo",
  "Barbosa",
  "Barros",
  "Batista",
  "Bezerra",
  "Bittencourt",
  "Borges",
  "Brandao",
  "Brito",
  "Bueno",
  "Cabral",
  "Caldas",
  "Camargo",
  "Campos",
  "Cardoso",
  "Carneiro",
  "Carvalho",
  "Castro",
  "Cavalcanti",
  "Chaves",
  "Clemente",
  "Coelho",
  "Conceicao",
  "Correa",
  "Costa",
  "Couto",
  "Cruz",
  "Cunha",
  "Dantas",
  "Dias",
  "Diniz",
  "Domingues",
  "Duarte",
  "Farias",
  "Fernandes",
  "Ferreira",
  "Figueiredo",
  "Fonseca",
  "Franco",
  "Freitas",
  "Furtado",
  "Gama",
  "Garcia",
  "Gomes",
  "Goncalves",
  "Guimaraes",
  "Henriques",
  "Jesus",
  "Leal",
  "Leite",
  "Lima",
  "Lopes",
  "Loureiro",
  "Machado",
  "Magalhaes",
  "Marques",
  "Martins",
  "Medeiros",
  "Melo",
  "Mendes",
  "Mendonca",
  "Miranda",
  "Monteiro",
  "Moraes",
  "Moreira",
  "Moura",
  "Nascimento",
  "Neves",
  "Nogueira",
  "Nunes",
  "Oliveira",
  "Pacheco",
  "Paiva",
  "Peixoto",
  "Pereira",
  "Pimentel",
  "Pinheiro",
  "Pinto",
  "Pires",
  "Queiroz",
  "Ramos",
  "Reis",
  "Ribeiro",
  "Rocha",
  "Rodrigues",
  "Sampaio",
  "Santana",
  "Santos",
  "Silva",
  "Silveira",
  "Soares",
  "Sousa",
  "Souza",
  "Tavares",
  "Teixeira",
  "Torres",
  "Valente",
  "Vieira",
  "Xavier",
  "Abreu",
  "Aguiar",
  "Alencar",
  "Almeida",
  "Alves",
  "Amaral",
  "Andrade",
  "Araujo",
  "Azevedo",
  "Barbosa",
  "Barros",
  "Batista",
  "Bezerra",
  "Borges",
  "Brandao",
  "Brito",
  "Cabral",
  "Campos",
  "Cardoso",
  "Carvalho",
  "Castro",
  "Cavalcanti",
  "Coelho",
  "Correa",
  "Costa",
  "Cruz",
  "Cunha",
  "Dias",
  "Duarte",
  "Fernandes",
  "Ferreira",
  "Fonseca",
  "Freitas",
  "Garcia",
  "Gomes",
  "Goncalves",
  "Guimaraes",
  "Jesus",
  "Leite",
  "Lima",
  "Lopes",
  "Machado",
  "Marques",
  "Martins",
  "Medeiros",
  "Melo",
  "Mendes",
  "Miranda",
  "Monteiro",
  "Moraes",
  "Moreira",
  "Moura",
  "Nascimento",
  "Neves",
  "Nogueira",
  "Nunes",
  "Oliveira",
  "Pereira",
  "Pinheiro",
  "Pinto",
  "Ramos",
  "Reis",
  "Ribeiro",
  "Rocha",
  "Rodrigues",
  "Santos",
  "Silva",
  "Silveira",
  "Soares",
  "Souza",
  "Teixeira",
  "Torres",
  "Vieira",
  "Xavier"
];

// resources/static_db/names/turkish_data.ts
var TURKISH_MALE_FIRSTNAMES = [
  "Ahmet",
  "Mehmet",
  "Mustafa",
  "Ali",
  "Huseyin",
  "Hasan",
  "Ibrahim",
  "Yusuf",
  "Osman",
  "Omer",
  "Emre",
  "Burak",
  "Furkan",
  "Murat",
  "Kaan",
  "Can",
  "Eren",
  "Baris",
  "Deniz",
  "Onur",
  "Serkan",
  "Tolga",
  "Umut",
  "Yasin",
  "Batuhan",
  "Berat",
  "Cagan",
  "Dogan",
  "Efe",
  "Fatih",
  "Gokhan",
  "Halil",
  "Ismail",
  "Kerem",
  "Levent",
  "Mert",
  "Nihat",
  "Okan",
  "Polat",
  "Riza",
  "Selim",
  "Taha",
  "Ugur",
  "Volkan",
  "Yilmaz",
  "Zafer",
  "Adem",
  "Berk",
  "Cem",
  "Derya",
  "Ege",
  "Ferhat",
  "Gokce",
  "Hakan",
  "Ilker",
  "Kemal",
  "Lutfi",
  "Muhammed",
  "Necati",
  "Orhan",
  "Poyraz",
  "Recep",
  "Salih",
  "Tuncay",
  "Ufuk",
  "Vedat",
  "Yusuf",
  "Ziya",
  "Arda",
  "Bora",
  "Cihan",
  "Doruk",
  "Efe",
  "Firat",
  "Gokturk",
  "Harun",
  "Ilhan",
  "Kadir",
  "Levent",
  "Mete",
  "Nihat",
  "Oguz",
  "Pelin",
  "Rauf",
  "Sefa",
  "Tayfun",
  "Ulas",
  "Veli",
  "Yalcin",
  "Zeki",
  "Alp",
  "Baran",
  "Cemil",
  "Davut",
  "Ekin",
  "Fikret",
  "Gurkan",
  "Hamza",
  "Isik",
  "Jan",
  "Kaan",
  "Lale",
  "Murat",
  "Nazim",
  "Ozan",
  "Pinar",
  "Rasim",
  "Serdar",
  "Tamer",
  "Ugur",
  "Veysel",
  "Yavuz",
  "Zeynel",
  "Ahmet",
  "Mehmet",
  "Mustafa",
  "Ali",
  "Huseyin",
  "Hasan",
  "Ibrahim",
  "Yusuf",
  "Osman",
  "Omer",
  "Emre",
  "Burak",
  "Furkan",
  "Murat",
  "Kaan",
  "Can",
  "Eren",
  "Baris",
  "Deniz",
  "Onur",
  "Serkan",
  "Tolga",
  "Umut",
  "Yasin",
  "Batuhan",
  "Berat",
  "Cagan",
  "Dogan",
  "Efe",
  "Fatih",
  "Gokhan",
  "Halil",
  "Ismail",
  "Kerem",
  "Levent",
  "Mert",
  "Nihat",
  "Okan",
  "Polat",
  "Riza",
  "Selim",
  "Taha",
  "Ugur",
  "Volkan",
  "Yilmaz",
  "Zafer",
  "Adem",
  "Berk",
  "Cem",
  "Derya",
  "Ege",
  "Ferhat",
  "Gokce",
  "Hakan",
  "Ilker",
  "Kemal",
  "Lutfi",
  "Muhammed",
  "Necati",
  "Orhan",
  "Poyraz",
  "Recep",
  "Salih",
  "Tuncay",
  "Ufuk",
  "Vedat",
  "Yusuf",
  "Ziya",
  "Arda",
  "Bora",
  "Cihan",
  "Doruk",
  "Efe",
  "Firat",
  "Gokturk",
  "Harun",
  "Ilhan",
  "Kadir",
  "Levent",
  "Mete",
  "Nihat",
  "Oguz",
  "Rauf",
  "Sefa",
  "Tayfun",
  "Ulas",
  "Veli",
  "Yalcin",
  "Zeki",
  "Alp",
  "Baran",
  "Cemil",
  "Davut",
  "Ekin",
  "Fikret",
  "Gurkan",
  "Hamza",
  "Isik",
  "Jan",
  "Kaan",
  "Lale",
  "Murat",
  "Nazim",
  "Ozan",
  "Rasim",
  "Serdar",
  "Tamer",
  "Ugur",
  "Veysel",
  "Yavuz",
  "Zeynel",
  "Abdullah",
  "Bilal",
  "Cahit",
  "Demir",
  "Enes",
  "Feyyaz",
  "Guven",
  "Hayri",
  "Idris",
  "Kivanc",
  "Latif",
  "Metehan",
  "Nurettin",
  "Oktay",
  "Peker",
  "Ramazan",
  "Savas",
  "Tarkan",
  "Utku",
  "Vural",
  "Yasin",
  "Zulfikar",
  "Akin",
  "Bulent",
  "Cengiz",
  "Dursun",
  "Ekrem",
  "Fikri",
  "Gokalp",
  "Huda",
  "Izzet",
  "Korkut",
  "Mahmut",
  "Naci",
  "Ozgur",
  "Ridvan",
  "Suleyman",
  "Talat",
  "Umit",
  "Vedat",
  "Yener",
  "Zekeriya",
  "Alper",
  "Baris",
  "Caner",
  "Deniz",
  "Eray",
  "Fatih",
  "Gursel",
  "Hakan",
  "Ismail",
  "Kaan",
  "Levent",
  "Mert",
  "Nihat",
  "Okan",
  "Polat",
  "Riza",
  "Selim",
  "Taha",
  "Ugur",
  "Volkan",
  "Yilmaz",
  "Zafer",
  "Adem"
];
var TURKISH_MALE_LASTNAMES = [
  "Yilmaz",
  "Kaya",
  "Demir",
  "Sahin",
  "Celik",
  "Ozturk",
  "Aydin",
  "Ozdemir",
  "Arslan",
  "Dogan",
  "Kilic",
  "Aslan",
  "Tas",
  "Kaplan",
  "Cetin",
  "Koc",
  "Kurt",
  "Polat",
  "Ozkan",
  "Simsek",
  "Erdogan",
  "Aksoy",
  "Bulut",
  "Gunes",
  "Yildiz",
  "Tekin",
  "Guler",
  "Aktas",
  "Kara",
  "Yalcin",
  "Er",
  "Sari",
  "Keskin",
  "Ozer",
  "Turk",
  "Ucar",
  "Acar",
  "Korkmaz",
  "Sen",
  "Yildirim",
  "Boz",
  "Oz",
  "Ak",
  "Gok",
  "Deniz",
  "Eren",
  "Yavuz",
  "Sonmez",
  "Cakir",
  "Ozcelik",
  "Karaca",
  "Turan",
  "Gunduz",
  "Akgun",
  "Colak",
  "Sert",
  "Bayraktar",
  "Karahan",
  "Ozkan",
  "Demirel",
  "Karakas",
  "Kilic",
  "Sahin",
  "Koc",
  "Yilmaz",
  "Demir",
  "Kaya",
  "Arslan",
  "Aydin",
  "Ozturk",
  "Ozdemir",
  "Celik",
  "Dogan",
  "Kaplan",
  "Tas",
  "Polat",
  "Kurt",
  "Erdogan",
  "Aksoy",
  "Bulut",
  "Gunes",
  "Yildiz",
  "Tekin",
  "Guler",
  "Aktas",
  "Kara",
  "Yalcin",
  "Er",
  "Sari",
  "Keskin",
  "Ozer",
  "Turk",
  "Ucar",
  "Acar",
  "Korkmaz",
  "Sen",
  "Yildirim",
  "Boz",
  "Oz",
  "Ak",
  "Gok",
  "Deniz",
  "Eren",
  "Yavuz",
  "Sonmez",
  "Cakir",
  "Ozcelik",
  "Karaca",
  "Turan",
  "Gunduz",
  "Akgun",
  "Colak",
  "Sert",
  "Bayraktar",
  "Karahan",
  "Demirel",
  "Karakas",
  "Kilic",
  "Sahin",
  "Koc",
  "Yilmaz",
  "Demir",
  "Kaya",
  "Arslan",
  "Aydin",
  "Ozturk",
  "Ozdemir",
  "Celik",
  "Dogan",
  "Kaplan",
  "Tas",
  "Polat",
  "Kurt",
  "Erdogan",
  "Aksoy",
  "Bulut",
  "Gunes",
  "Yildiz",
  "Tekin",
  "Guler",
  "Aktas",
  "Kara",
  "Yalcin",
  "Er",
  "Sari",
  "Keskin",
  "Ozer",
  "Turk",
  "Ucar",
  "Acar",
  "Korkmaz",
  "Sen",
  "Yildirim",
  "Boz",
  "Oz",
  "Ak",
  "Gok",
  "Deniz",
  "Eren",
  "Yavuz",
  "Sonmez",
  "Cakir",
  "Ozcelik",
  "Karaca",
  "Turan",
  "Gunduz",
  "Akgun",
  "Colak",
  "Sert",
  "Bayraktar",
  "Karahan",
  "Demirel",
  "Karakas",
  "Kilic",
  "Sahin",
  "Koc",
  "Yilmaz",
  "Demir",
  "Kaya",
  "Arslan",
  "Aydin",
  "Ozturk",
  "Ozdemir",
  "Celik",
  "Dogan",
  "Kaplan",
  "Tas",
  "Polat",
  "Kurt",
  "Erdogan",
  "Aksoy",
  "Bulut",
  "Gunes",
  "Yildiz",
  "Tekin",
  "Guler",
  "Aktas",
  "Kara",
  "Yalcin",
  "Er",
  "Sari",
  "Keskin",
  "Ozer",
  "Turk",
  "Ucar",
  "Acar",
  "Korkmaz",
  "Sen",
  "Yildirim",
  "Boz",
  "Oz",
  "Ak",
  "Gok",
  "Deniz",
  "Eren",
  "Yavuz",
  "Sonmez",
  "Cakir",
  "Ozcelik",
  "Karaca",
  "Turan",
  "Gunduz",
  "Akgun",
  "Colak",
  "Sert",
  "Bayraktar",
  "Karahan",
  "Demirel",
  "Karakas",
  "Kilic",
  "Sahin",
  "Koc",
  "Yilmaz",
  "Demir",
  "Kaya",
  "Arslan",
  "Aydin",
  "Ozturk",
  "Ozdemir",
  "Celik",
  "Dogan",
  "Kaplan",
  "Tas",
  "Polat",
  "Kurt",
  "Erdogan",
  "Aksoy",
  "Bulut",
  "Gunes",
  "Yildiz",
  "Tekin",
  "Guler",
  "Aktas",
  "Kara",
  "Yalcin",
  "Er",
  "Sari",
  "Keskin",
  "Ozer",
  "Turk",
  "Ucar",
  "Acar",
  "Korkmaz",
  "Sen",
  "Yildirim",
  "Boz",
  "Oz",
  "Ak",
  "Gok",
  "Deniz",
  "Eren",
  "Yavuz",
  "Sonmez",
  "Cakir",
  "Ozcelik",
  "Karaca",
  "Turan",
  "Gunduz",
  "Akgun",
  "Colak",
  "Sert",
  "Bayraktar",
  "Karahan",
  "Demirel"
];

// resources/static_db/names/arabic_data.ts
var ARABIC_MALE_FIRSTNAMES = [
  "Ahmed",
  "Mohammed",
  "Ali",
  "Omar",
  "Abdullah",
  "Hassan",
  "Hussein",
  "Ibrahim",
  "Yusuf",
  "Hamza",
  "Amir",
  "Khalid",
  "Faisal",
  "Zayd",
  "Bilal",
  "Anas",
  "Adam",
  "Yahya",
  "Zakariya",
  "Imran",
  "Musa",
  "Isa",
  "Dawoud",
  "Sulaiman",
  "Harun",
  "Idris",
  "Ayman",
  "Karim",
  "Malik",
  "Nasser",
  "Rashid",
  "Saif",
  "Tariq",
  "Zain",
  "Farhan",
  "Jamal",
  "Khalil",
  "Mahmoud",
  "Mustafa",
  "Nabil",
  "Qasim",
  "Rami",
  "Sami",
  "Tamer",
  "Waleed",
  "Yasser",
  "Zaki",
  "Abbas",
  "Adel",
  "Akram",
  "Amin",
  "Ashraf",
  "Basil",
  "Daniyal",
  "Ehsan",
  "Fahad",
  "Ghaith",
  "Hadi",
  "Ihsan",
  "Jabir",
  "Kamil",
  "Latif",
  "Mansur",
  "Nadeem",
  "Osman",
  "Qadir",
  "Rafiq",
  "Saber",
  "Talib",
  "Umar",
  "Waqas",
  "Younus",
  "Zahir",
  "Abdulaziz",
  "Abdulrahman",
  "Abdulhamid",
  "Abdurrahman",
  "Ahmad",
  "Ameer",
  "Ammar",
  "Arif",
  "Asad",
  "Ayyub",
  "Badr",
  "Bakr",
  "Bassam",
  "Bilal",
  "Daoud",
  "Fadi",
  "Firas",
  "Ghassan",
  "Habib",
  "Hakim",
  "Hani",
  "Harith",
  "Haytham",
  "Hilal",
  "Hisham",
  "Ilyas",
  "Ismail",
  "Jafar",
  "Jalal",
  "Jasim",
  "Jawad",
  "Kareem",
  "Kays",
  "Khaled",
  "Luay",
  "Maher",
  "Majid",
  "Marwan",
  "Mazen",
  "Mikhail",
  "Mubarak",
  "Muhammed",
  "Munir",
  "Murad",
  "Nader",
  "Naeem",
  "Najib",
  "Nasir",
  "Nawaf",
  "Nizar",
  "Othman",
  "Qais",
  "Raed",
  "Raheem",
  "Rahim",
  "Rayan",
  "Riyad",
  "Saad",
  "Saber",
  "Sadiq",
  "Saeed",
  "Salah",
  "Saleh",
  "Salim",
  "Samir",
  "Saud",
  "Shadi",
  "Shakir",
  "Sherif",
  "Sufyan",
  "Taha",
  "Tawfiq",
  "Tayyib",
  "Uthman",
  "Wael",
  "Yacoub",
  "Yasin",
  "Yazid",
  "Zafar",
  "Ziad",
  "Ziyad",
  "Abdul",
  "Abdulkarim",
  "Abdulqadir",
  "Abdurrahim",
  "Adnan",
  "Aftab",
  "Ahab",
  "Akil",
  "Alaa",
  "Alim",
  "Amjad",
  "Anwar",
  "Aqeel",
  "Arslan",
  "Asim",
  "Ata",
  "Atef",
  "Aziz",
  "Bahir",
  "Baha",
  "Barak",
  "Bashir",
  "Bassem",
  "Bayram",
  "Burhan",
  "Dahir",
  "Daud",
  "Dhia",
  "Diyar",
  "Emad",
  "Fadel",
  "Fahd",
  "Farid",
  "Fathi",
  "Fawzi",
  "Fayez",
  "Fayyad",
  "Fuad",
  "Gamal",
  "Ghazi",
  "Hafez",
  "Hafiz",
  "Hajjaj",
  "Halim",
  "Hamid",
  "Hamza",
  "Hanif",
  "Haqqi",
  "Harbi",
  "Hashem",
  "Hatim",
  "Hayder",
  "Hazem",
  "Husam",
  "Hussam",
  "Ihab",
  "Ilyan",
  "Imad",
  "Irfan",
  "Iskandar",
  "Izz",
  "Jabbar",
  "Jaber",
  "Jibril",
  "Juma",
  "Kadar",
  "Kadir",
  "Kais",
  "Kamran",
  "Kasim",
  "Kassim",
  "Kayyum",
  "Khair",
  "Khalaf",
  "Khayyam",
  "Lutfi",
  "Madi",
  "Mahdi",
  "Mahir",
  "Mahmud",
  "Mansoor",
  "Maruf",
  "Masoud",
  "Mazin",
  "Mehdi",
  "Mishal",
  "Mokhtar",
  "Momin",
  "Mubashir",
  "Muhamad",
  "Muhib",
  "Muin",
  "Mujtaba",
  "Mukhtar",
  "Munther",
  "Musab",
  "Musharraf",
  "Mutasim",
  "Nabil",
  "Nadir",
  "Nafi",
  "Najm",
  "Nasim",
  "Nassim",
  "Nawaz",
  "Nazir",
  "Nihad",
  "Noman",
  "Nur",
  "Nuri",
  "Omar",
  "Qamar",
  "Qasim",
  "Qusay",
  "Rachid",
  "Radwan",
  "Rafat",
  "Rahman",
  "Raihan",
  "Rais",
  "Rajab",
  "Ramadan",
  "Ramez",
  "Rami",
  "Ramzi",
  "Rani",
  "Raouf",
  "Rauf",
  "Rayan",
  "Reda",
  "Riad",
  "Riyadh",
  "Rizwan",
  "Rohan",
  "Saad",
  "Sabbah",
  "Sabir",
  "Sabri",
  "Saeed",
  "Safwan",
  "Sahil",
  "Sahir",
  "Sajid",
  "Sajjad",
  "Sakib",
  "Salahuddin",
  "Salam",
  "Salem",
  "Sami",
  "Samir",
  "Sana",
  "Saud",
  "Sayeed",
  "Shaban",
  "Shafiq",
  "Shahid",
  "Shamil",
  "Sharif",
  "Shayan",
  "Sherif",
  "Shuaib",
  "Siddiq",
  "Siraj",
  "Sohail",
  "Sufian",
  "Suhail",
  "Suleiman",
  "Tahir",
  "Taimur",
  "Talal",
  "Talha",
  "Tamim",
  "Taqi",
  "Tarik",
  "Tawfik",
  "Tayeb",
  "Taysir",
  "Thabit",
  "Thamer",
  "Ubaid",
  "Umar",
  "Usama",
  "Usman",
  "Wadud",
  "Wafi",
  "Wahab",
  "Wahid",
  "Wajdi",
  "Wajih",
  "Walid",
  "Waqar",
  "Wasim",
  "Yahia",
  "Yakub",
  "Yaman",
  "Yamin",
  "Yasir",
  "Yassin",
  "Younis",
  "Yunis",
  "Yusri",
  "Zafir",
  "Zahid",
  "Zaid",
  "Zain",
  "Zaki",
  "Zaman",
  "Zameer",
  "Ziyad",
  "Zubair",
  "Zuhair"
];
var ARABIC_MALE_LASTNAMES = [
  "Ahmed",
  "Mohammed",
  "Ali",
  "Hassan",
  "Hussein",
  "Ibrahim",
  "Abdullah",
  "Khan",
  "Al-Ahmad",
  "Al-Ali",
  "Al-Masri",
  "Al-Saud",
  "Abdul",
  "Abdullah",
  "Ahmad",
  "Al-Farsi",
  "Al-Haddad",
  "Al-Hussein",
  "Al-Masri",
  "Al-Qadi",
  "Al-Saadi",
  "Al-Tamimi",
  "Abbas",
  "Abboud",
  "Abadi",
  "Abd al-Rashid",
  "Abdelhamid",
  "Abdelkrim",
  "Abdellatif",
  "Abdelrahman",
  "Abdulaziz",
  "Abdulkarim",
  "Abdulrahman",
  "Ahmad",
  "Akram",
  "Al-Amin",
  "Al-Aziz",
  "Al-Baghdadi",
  "Al-Bakri",
  "Al-Dawoodi",
  "Al-Fayed",
  "Al-Ghamdi",
  "Al-Hakim",
  "Al-Harbi",
  "Al-Jabari",
  "Al-Juhani",
  "Al-Khatib",
  "Al-Mahmoud",
  "Al-Najjar",
  "Al-Naimi",
  "Al-Qasimi",
  "Al-Rashid",
  "Al-Sayed",
  "Al-Sharif",
  "Al-Shehri",
  "Al-Zahrani",
  "Ansari",
  "Awad",
  "Ayad",
  "Aziz",
  "Badawi",
  "Bakir",
  "Bishara",
  "Darwish",
  "El-Sayed",
  "Fahmy",
  "Farouk",
  "Ghanem",
  "Habib",
  "Haddad",
  "Hakim",
  "Hamdan",
  "Hamid",
  "Hanna",
  "Hashem",
  "Hassan",
  "Husseini",
  "Ibrahim",
  "Isa",
  "Jabbar",
  "Jaber",
  "Jalil",
  "Jamal",
  "Karam",
  "Khalaf",
  "Khalid",
  "Khalil",
  "Khoury",
  "Mahmoud",
  "Malik",
  "Mansour",
  "Marwan",
  "Masri",
  "Matta",
  "Moussa",
  "Mustafa",
  "Nader",
  "Najjar",
  "Nasr",
  "Nassar",
  "Nawaf",
  "Nazari",
  "Omar",
  "Osman",
  "Qasim",
  "Qureshi",
  "Rahman",
  "Rashid",
  "Rizk",
  "Saad",
  "Sabri",
  "Saeed",
  "Said",
  "Salah",
  "Saleh",
  "Salim",
  "Samir",
  "Sayed",
  "Shaaban",
  "Shafiq",
  "Shah",
  "Sharif",
  "Sheikh",
  "Suleiman",
  "Taha",
  "Tawfik",
  "Yassin",
  "Younes",
  "Zaid",
  "Zaki",
  "Zaman",
  "Zayed",
  "Zubair",
  "Abaza",
  "Abbas",
  "Abdallah",
  "Abdelnour",
  "Abdelqader",
  "Abdi",
  "Abdo",
  "Abdulhamid",
  "Abdulqadir",
  "Abdurrahim",
  "Adel",
  "Adnan",
  "Afif",
  "Agha",
  "Ahmad",
  "Akel",
  "Alam",
  "Alami",
  "Alawi",
  "Alayyan",
  "Alfarsi",
  "Alhassan",
  "Alkhatib",
  "Allam",
  "Almasri",
  "Alqadi",
  "Alsaadi",
  "Altamimi",
  "Amin",
  "Amir",
  "Ammar",
  "Ansari",
  "Antar",
  "Arafat",
  "Arabi",
  "Arif",
  "Asfour",
  "Ashour",
  "Aslan",
  "Assaf",
  "Atiyeh",
  "Attar",
  "Awad",
  "Ayoub",
  "Azar",
  "Aziz",
  "Badr",
  "Bahri",
  "Bakri",
  "Barakat",
  "Bassam",
  "Baydoun",
  "Bazzi",
  "Bechara",
  "Bishara",
  "Bitar",
  "Boulos",
  "Chahine",
  "Daher",
  "Dahman",
  "Darwish",
  "Dawood",
  "Deeb",
  "Diab",
  "Dib",
  "Eid",
  "Elhage",
  "Elkhoury",
  "Essa",
  "Fadel",
  "Fahad",
  "Fakhry",
  "Faraj",
  "Farhat",
  "Faris",
  "Fawaz",
  "Fayad",
  "Fayyad",
  "Fekry",
  "Fouad",
  "Gaber",
  "Gad",
  "Gamal",
  "Ghaleb",
  "Ghanem",
  "Ghazi",
  "Habashi",
  "Haddad",
  "Hajjar",
  "Hakim",
  "Halabi",
  "Hamed",
  "Hamid",
  "Hamza",
  "Hanna",
  "Harb",
  "Hassan",
  "Hatem",
  "Hayek",
  "Hazan",
  "Hindi",
  "Hossain",
  "Hussein",
  "Ibrahim",
  "Idris",
  "Isa",
  "Ismail",
  "Jabour",
  "Jadallah",
  "Jafar",
  "Jalil",
  "Jamal",
  "Jamil",
  "Jawad",
  "Kadi",
  "Kahil",
  "Kanaan",
  "Karim",
  "Kassab",
  "Kattan",
  "Kawash",
  "Khalaf",
  "Khalid",
  "Khalife",
  "Khalil",
  "Khatib",
  "Khayat",
  "Khoury",
  "Kobrosly",
  "Lahoud",
  "Latif",
  "Louca",
  "Maalouf",
  "Madi",
  "Mahfouz",
  "Mahmoud",
  "Makhoul",
  "Malek",
  "Mansour",
  "Maroun",
  "Masri",
  "Matta",
  "Melhem",
  "Mikhail",
  "Mokbel",
  "Moussa",
  "Mukhtar",
  "Musa",
  "Mustafa",
  "Nabil",
  "Nader",
  "Naeem",
  "Najjar",
  "Nasr",
  "Nassar",
  "Nawfal",
  "Nazarian",
  "Nour",
  "Obeid",
  "Omar",
  "Osman",
  "Othman",
  "Qadri",
  "Qasim",
  "Qureshi",
  "Raad",
  "Rachid",
  "Radwan",
  "Rahal",
  "Rahman",
  "Raji",
  "Ramadan",
  "Rami",
  "Rashed",
  "Rashid",
  "Rizk",
  "Saab",
  "Saad",
  "Sabbagh",
  "Sabri",
  "Sadek",
  "Saeed",
  "Safadi",
  "Said",
  "Sakr",
  "Salama",
  "Saleh",
  "Salim",
  "Sami",
  "Samman",
  "Sarkis",
  "Semaan",
  "Shaar",
  "Shaban",
  "Shadi",
  "Shafik",
  "Shahid",
  "Shahin",
  "Shalhoub",
  "Shamoun",
  "Sharaf",
  "Sharif",
  "Shatila",
  "Shawky",
  "Shehadeh",
  "Sheikh",
  "Shoukry",
  "Sleiman",
  "Suleiman",
  "Taha",
  "Tamer",
  "Tamim",
  "Tarazi",
  "Tawil",
  "Tayyar",
  "Touma",
  "Wahba",
  "Wahid",
  "Yacoub",
  "Yaghi",
  "Yahya",
  "Yakoub",
  "Yassin",
  "Younes",
  "Youssef",
  "Zaatari",
  "Zahran",
  "Zaid",
  "Zain",
  "Zakar",
  "Zaki",
  "Zaman",
  "Zammar",
  "Zoghbi",
  "Zoubi",
  "Zubair",
  "Zureikat"
];

// resources/static_db/names/finnish_data.ts
var FINNISH_MALE_FIRSTNAMES = [
  "Oliver",
  "Eino",
  "V\xE4in\xF6",
  "Leo",
  "Elias",
  "Onni",
  "Toivo",
  "Oiva",
  "Olavi",
  "Juhani",
  "Johannes",
  "Mikael",
  "Antero",
  "Tapani",
  "Kalevi",
  "Tapio",
  "Ilmari",
  "Matias",
  "Eeli",
  "Emil",
  "Aapo",
  "Aarne",
  "Akseli",
  "Aleksi",
  "Antti",
  "Armas",
  "Arttu",
  "Aukusti",
  "Eero",
  "Eetu",
  "Elias",
  "Erkki",
  "Esa",
  "Hannes",
  "Harri",
  "Heikki",
  "Henrik",
  "Ilkka",
  "Iiro",
  "Jaakko",
  "Jalmari",
  "Jani",
  "Janne",
  "Jari",
  "Jere",
  "Jesse",
  "Joakim",
  "Joel",
  "Joni",
  "Juha",
  "Juhani",
  "Jukka",
  "Juuso",
  "Kalle",
  "Kari",
  "Kasper",
  "Kimmo",
  "Lauri",
  "Leevi",
  "Lukas",
  "Marko",
  "Markus",
  "Martti",
  "Matti",
  "Mikko",
  "Niklas",
  "Niko",
  "Olli",
  "Oskari",
  "Otto",
  "Paavo",
  "Panu",
  "Pekka",
  "Pentti",
  "Petri",
  "Raimo",
  "Rami",
  "Risto",
  "Sakari",
  "Sami",
  "Samu",
  "Samuli",
  "Sampo",
  "Seppo",
  "Simo",
  "Teemu",
  "Tero",
  "Timo",
  "Tomi",
  "Tommi",
  "Tuomas",
  "Tuomo",
  "Tuukka",
  "Urho",
  "Veikko",
  "Veli",
  "Ville",
  "Vilho",
  "Viljami",
  "Yrj\xF6",
  "Aatu",
  "Ahti",
  "Aimo",
  "Aki",
  "Anto",
  "Arto",
  "Atte",
  "Aulis",
  "Eemeli",
  "Eino",
  "Eliel",
  "Elmo",
  "Ensio",
  "Erik",
  "Hannu",
  "Heimo",
  "Helmer",
  "Iisakki",
  "Ilpo",
  "Immo",
  "Isto",
  "Jarkko",
  "Jarmo",
  "Jouni",
  "Kauko",
  "Keijo",
  "Kosti",
  "Lasse",
  "Lauri",
  "Lempi"
];
var FINNISH_MALE_LASTNAMES = [
  "Korhonen",
  "Virtanen",
  "M\xE4kinen",
  "Nieminen",
  "M\xE4kel\xE4",
  "Laine",
  "H\xE4m\xE4l\xE4inen",
  "Koskinen",
  "Heikkinen",
  "J\xE4rvinen",
  "Lehtonen",
  "Lehtinen",
  "Saarinen",
  "Salminen",
  "Heinonen",
  "Niemi",
  "Kallio",
  "Salonen",
  "Tuominen",
  "Laitinen",
  "Rantanen",
  "Turunen",
  "Kinnunen",
  "Karjalainen",
  "Mattila",
  "Pulkkinen",
  "Ojala",
  "Hakala",
  "Laaksonen",
  "Lindholm",
  "Jokinen",
  "Aalto",
  "Miettinen",
  "Mustonen",
  "Lahtinen",
  "Peltonen",
  "R\xE4is\xE4nen",
  "Ahonen",
  "Kangas",
  "V\xE4is\xE4nen",
  "Toivonen",
  "Keto",
  "Pekkanen",
  "Anttila",
  "Salo",
  "Savolainen",
  "Koivisto",
  "Nurmi",
  "Rossi",
  "Huttunen",
  "Kekkonen",
  "Pesonen",
  "Huhtala",
  "Autio",
  "Halonen",
  "Kivinen",
  "Partanen",
  "Paananen",
  "Rissanen",
  "Sallinen",
  "Sepp\xE4l\xE4",
  "Soininen",
  "Suominen",
  "Tikka",
  "Tolonen",
  "Uusitalo",
  "Vanhanen",
  "Vehvil\xE4inen",
  "Viitanen",
  "Vuori",
  "Yl\xF6nen",
  "Aaltonen",
  "Ahola",
  "Ahtisaari",
  "Alatalo",
  "Asikainen",
  "Eskola",
  "Forsman",
  "Haapala",
  "Hakkarainen",
  "Hannula",
  "Harju",
  "Heino",
  "Helminen",
  "Hietanen",
  "Hirvonen",
  "Huovinen",
  "Jokela",
  "Jussila",
  "Kankaanp\xE4\xE4",
  "Kari",
  "Karppinen",
  "Kauppinen",
  "Kemppainen",
  "Kettunen",
  "Kivim\xE4ki",
  "Koponen",
  "Korpi",
  "Koskela",
  "Kukkonen"
];

// resources/static_db/names/georgian_data.ts
var GEORGIAN_MALE_FIRSTNAMES = [
  "Giorgi",
  "Davit",
  "Aleksandre",
  "Demetre",
  "Noe",
  "Luka",
  "Toma",
  "Dachi",
  "Ioane",
  "Vache",
  "Zurab",
  "Levan",
  "Irakli",
  "Nika",
  "Saba",
  "Archil",
  "Vakhtang",
  "Guram",
  "Tamaz",
  "Zaza",
  "Gvantsa",
  "Mate",
  "Lazare",
  "Giorgi",
  "Andria",
  "Daniel",
  "Gabriel",
  "Mikheil",
  "Nikoloz",
  "Tengiz",
  "Bakur",
  "Beka",
  "Giga",
  "Givi",
  "Gocha",
  "Kakha",
  "Koba",
  "Lasha",
  "Merab",
  "Nugzar",
  "Otar",
  "Paata",
  "Ramaz",
  "Rezo",
  "Roin",
  "Shalva",
  "Tedo",
  "Tornike",
  "Ushangi",
  "Vano",
  "Akaki",
  "Avtandil",
  "Baadur",
  "Bagrat",
  "Besik",
  "Elguja",
  "Gela",
  "Giuli",
  "Ioseb",
  "Jemal",
  "Kakhaber",
  "Levan",
  "Mamuka",
  "Malkhaz",
  "Nodar",
  "Oleg",
  "Petre",
  "Rati",
  "Revaz",
  "Roman",
  "Sandro",
  "Sergo",
  "Shota",
  "Soso",
  "Temur",
  "Teimuraz",
  "Tite",
  "Ucha",
  "Vakhtang",
  "Vano",
  "Vazha",
  "Vladimer",
  "Zviad",
  "Abesalom",
  "Adam",
  "Aleksandre",
  "Anzor",
  "Arsen",
  "Badri",
  "Besiki",
  "Dato",
  "Dato",
  "Edisher",
  "Erekle",
  "Gia",
  "Giorgi",
  "Guram",
  "Iakob",
  "Ilia",
  "Irine",
  "Kakhi",
  "Kote",
  "Lado",
  "Levan",
  "Mamuka",
  "Merab",
  "Mikheil",
  "Nika",
  "Nugzar",
  "Otar",
  "Paata",
  "Ramaz",
  "Revaz",
  "Roin",
  "Shalva",
  "Tamaz",
  "Tedo",
  "Temur",
  "Tornike",
  "Zurab"
];
var GEORGIAN_MALE_LASTNAMES = [
  "Beridze",
  "Kapanadze",
  "Gelashvili",
  "Maisuradze",
  "Giorgadze",
  "Lomidze",
  "Tsiklauri",
  "Bolkvadze",
  "Nozadze",
  "Chikhladze",
  "Kvaratskhelia",
  "Abashidze",
  "Dadeshkeliani",
  "Japaridze",
  "Machabeli",
  "Orbeliani",
  "Bagrationi",
  "Dadiani",
  "Tarkhan-Mouravi",
  "Chavchavadze",
  "Tsereteli",
  "Eristavi",
  "Mukhranbatoni",
  "Amirejibi",
  "Andronikashvili",
  "Abuladze",
  "Adamia",
  "Akhvlediani",
  "Batiashvili",
  "Chubinidze",
  "Davitashvili",
  "Gagoshidze",
  "Gogoberidze",
  "Gogitidze",
  "Iashvili",
  "Javakhishvili",
  "Kiknadze",
  "Kobalia",
  "Kochakidze",
  "Kutateladze",
  "Liparteliani",
  "Maghalashvili",
  "Makharadze",
  "Mchedlishvili",
  "Melikishvili",
  "Metreveli",
  "Mikadze",
  "Nadareishvili",
  "Nakashidze",
  "Narimanidze",
  "Papashvili",
  "Petriashvili",
  "Pipia",
  "Razmadze",
  "Rukhadze",
  "Saginashvili",
  "Shengelia",
  "Shubitidze",
  "Sikharulidze",
  "Tabagari",
  "Tavadze",
  "Tskitishvili",
  "Tskhvediani",
  "Tumanishvili",
  "Vachnadze",
  "Vardanidze",
  "Zhvania",
  "Zoidze",
  "Zukakishvili",
  "Abesadze",
  "Akobia",
  "Alavidze",
  "Aptsiauri",
  "Arveladze",
  "Avalishvili",
  "Bakradze",
  "Baramidze",
  "Basilaia",
  "Begiashvili",
  "Berdzenishvili",
  "Bezhanidze",
  "Chachanidze",
  "Chanturia",
  "Charkviani",
  "Chkhaidze",
  "Chkheidze",
  "Dvali",
  "Dzidziguri",
  "Gachechiladze",
  "Gagnidze",
  "Gakhokidze",
  "Gamkrelidze",
  "Gaprindashvili",
  "Gedenidze",
  "Ghviniashvili",
  "Gogoladze",
  "Gogua",
  "Gulua",
  "Iakobidze",
  "Iremashvili",
  "Jishkariani",
  "Kalandadze",
  "Kapanadze",
  "Kavtaradze",
  "Kereselidze",
  "Khachidze",
  "Khatiskatsi",
  "Khmaladze",
  "Khomeriki",
  "Kikabidze",
  "Kikaleishvili",
  "Kobakhidze",
  "Kobuladze",
  "Kochladze",
  "Kvaratskhelia",
  "Labadze",
  "Lomidze",
  "Maisuradze",
  "Mamidze",
  "Manchkhashvili"
];

// resources/static_db/names/armenian_data.ts
var ARMENIAN_MALE_FIRSTNAMES = [
  "Davit",
  "Narek",
  "Hayk",
  "Tigran",
  "Areg",
  "Mark",
  "Armen",
  "Aram",
  "Levon",
  "Gevorg",
  "Hakob",
  "Grigor",
  "Sargis",
  "Hovhannes",
  "Karen",
  "Vardan",
  "Arsen",
  "Gagik",
  "Vahe",
  "Samvel",
  "Andranik",
  "Ashot",
  "Artur",
  "Gor",
  "Mher",
  "Harutyun",
  "Vahan",
  "Edgar",
  "Ruben",
  "Alex",
  "Aren",
  "Monte",
  "Robert",
  "Daniel",
  "Leo",
  "Erik",
  "Artiom",
  "Albert",
  "Van",
  "Suren",
  "Raphael",
  "Max",
  "Henry",
  "Noy",
  "Menua",
  "Ara",
  "Arakel",
  "Ararat",
  "Arman",
  "Avet",
  "Bedros",
  "Garnik",
  "Hrant",
  "Ishkhan",
  "Jirair",
  "Kamo",
  "Krikor",
  "Levon",
  "Manvel",
  "Mesrop",
  "Mikael",
  "Nerses",
  "Norayr",
  "Petros",
  "Rafael",
  "Raffi",
  "Ruben",
  "Sevan",
  "Stepan",
  "Taron",
  "Vache",
  "Vigen",
  "Yervand",
  "Zaven",
  "Zareh",
  "Abgar",
  "Aghvan",
  "Antranig",
  "Aramayis",
  "Arshak",
  "Artashes",
  "Artavazd",
  "Avedis",
  "Bagrat",
  "Barsegh",
  "Derenik",
  "Garegin",
  "Gurgen",
  "Hamazasp",
  "Hovsep",
  "Karapet",
  "Mkrtich",
  "Poghos",
  "Smbat",
  "Tatev",
  "Toros",
  "Vazgen",
  "Yeghishe",
  "Zhirayr",
  "Zoravar"
];
var ARMENIAN_MALE_LASTNAMES = [
  "Grigoryan",
  "Sargsyan",
  "Harutyunyan",
  "Hovhannisyan",
  "Khachatryan",
  "Hakobyan",
  "Petrosyan",
  "Vardanyan",
  "Gevorgyan",
  "Karapetyan",
  "Stepanyan",
  "Abrahamyan",
  "Manukyan",
  "Davtyan",
  "Mkrtchyan",
  "Poghosyan",
  "Martirosyan",
  "Sahakyan",
  "Minasyan",
  "Avagyan",
  "Arakelyan",
  "Baghdasaryan",
  "Barseghyan",
  "Danielyan",
  "Ghazaryan",
  "Hambardzumyan",
  "Hayrapetyan",
  "Kocharyan",
  "Melikyan",
  "Nazaryan",
  "Ohanyan",
  "Papikyan",
  "Simonyan",
  "Tadevosyan",
  "Voskanyan",
  "Yeritsyan",
  "Zakaryan",
  "Abajian",
  "Adamyan",
  "Agopian",
  "Alexanian",
  "Andonian",
  "Aprahamian",
  "Arsenyan",
  "Artinian",
  "Asatryan",
  "Avedisian",
  "Babayan",
  "Bagratuni",
  "Balian",
  "Boghossian",
  "Boyajian",
  "Chahinian",
  "Darbinyan",
  "Demirchyan",
  "DerBedrosian",
  "Djanbazian",
  "Epremian",
  "Gasparyan",
  "Gulian",
  "Hakopian",
  "Hovsepian",
  "Ishkhanian",
  "Jamgochian",
  "Kantardjian",
  "Kevorkian",
  "Krikorian",
  "Levoniyan",
  "Mardoyan",
  "Markarian",
  "Matossian",
  "Mikaelian",
  "Mirakyan",
  "Mouradian",
  "Nalbandian",
  "Nersesian",
  "Oganesian",
  "Ohanessian",
  "Parseghian",
  "Patrikian",
  "Piloyan",
  "Rafaelian",
  "Sarkisian",
  "Soghomonian",
  "Tashjian",
  "Terzian",
  "Tovmasyan",
  "Vartanian",
  "Yaghoubian",
  "Zadikian",
  "Zarehian",
  "Zartarian",
  "Abelyan",
  "Aghajanian",
  "Aramian",
  "Aroyan",
  "Aslanian",
  "Avoyan",
  "Babajanyan",
  "Baghdassarian"
];

// resources/static_db/names/albanian_data.ts
var ALBANIAN_MALE_FIRSTNAMES = [
  "Arben",
  "Ilir",
  "Agim",
  "Fatmir",
  "Besnik",
  "Altin",
  "Dritan",
  "Ardit",
  "Erion",
  "Klodian",
  "Gentian",
  "Endrit",
  "Fatlum",
  "Bujar",
  "Burim",
  "Dardan",
  "Afrim",
  "Agron",
  "Alban",
  "Arber",
  "Arlind",
  "Armend",
  "Artan",
  "Artur",
  "Besart",
  "Besian",
  "Besmir",
  "Bledar",
  "Blendi",
  "Bora",
  "Dashamir",
  "Dashnor",
  "Defrim",
  "Dhimiter",
  "Drilon",
  "Edon",
  "Edvin",
  "Elton",
  "Endi",
  "Engjell",
  "Enver",
  "Ergest",
  "Ervin",
  "Fation",
  "Fisnik",
  "Flamur",
  "Florian",
  "Genc",
  "Gent",
  "G\xEBzim",
  "Gjergj",
  "Gjon",
  "Haki",
  "Ilirian",
  "Ismail",
  "Jetmir",
  "Jon",
  "Julian",
  "Kastriot",
  "Kreshnik",
  "Kujtim",
  "Ledion",
  "Leotrim",
  "Liridon",
  "Lorik",
  "Luan",
  "Lumturi",
  "Mariglen",
  "Mirlind",
  "Mufit",
  "Muhamet",
  "Nderim",
  "Noel",
  "Oltion",
  "Orges",
  "Petrit",
  "Qemal",
  "Redon",
  "Rezart",
  "Rilind",
  "Rinor",
  "Rrezon",
  "Shk\xEBlzen",
  "Shp\xEBtim",
  "Sokol",
  "Taulant",
  "Valon",
  "Veton",
  "Visar",
  "Vjollca",
  "Xhavit",
  "Ylli",
  "Zamir",
  "Zef",
  "Zgjim",
  "Zoran",
  "Adem",
  "Adrian",
  "Arian",
  "Arjan",
  "Arsen",
  "Artin",
  "Bajram",
  "Bardhyl",
  "Bashkim",
  "Behar",
  "Bekim",
  "Blerim",
  "Dalmat",
  "Dren",
  "Edi",
  "Eduart",
  "Ermir",
  "Fitore",
  "Gjergji",
  "Jonuz",
  "Klevis",
  "Kliton",
  "Kristaq",
  "Kujtim",
  "Laz\xEBr",
  "Leandro",
  "Leke",
  "Lind",
  "Lindor",
  "Llesh",
  "Lorenc",
  "Luan",
  "Lulzim",
  "Mikel",
  "Milot",
  "Naim",
  "Ndue",
  "Pjet\xEBr",
  "Preng",
  "Ramiz",
  "Rei",
  "Renis",
  "Roland",
  "Saimir",
  "Sazan",
  "Shaban",
  "Shpend",
  "Sk\xEBnder",
  "Sokol",
  "Tahir",
  "Toni",
  "Trim",
  "Valdet",
  "Valmir",
  "Vangjel",
  "Viktor",
  "Vllaznim",
  "Xhelal",
  "Ylber",
  "Zef",
  "Zoti"
];
var ALBANIAN_MALE_LASTNAMES = [
  "Hoxha",
  "\xC7ela",
  "Kurti",
  "Marku",
  "Mu\xE7a",
  "Shehu",
  "Dervishi",
  "Kola",
  "Prifti",
  "Elezi",
  "Leka",
  "Gjoni",
  "Sula",
  "Basha",
  "Krasniqi",
  "Mehmeti",
  "Aliu",
  "Brahimi",
  "Ismaili",
  "Osmani",
  "Abazi",
  "Ademi",
  "Agolli",
  "Ahmeti",
  "Alia",
  "Arifi",
  "Bajrami",
  "Balliu",
  "Begaj",
  "Berisha",
  "Bytyqi",
  "Caka",
  "Cela",
  "Deda",
  "Demiri",
  "Duka",
  "Durmishi",
  "Fazliu",
  "Gashi",
  "Gega",
  "Hajdari",
  "Halili",
  "Hasani",
  "Hyseni",
  "Ibrahimi",
  "Jashari",
  "Jusufi",
  "Kadriu",
  "Kaleci",
  "Kamberi",
  "Kastrati",
  "Koci",
  "Kodra",
  "Krasniqi",
  "Kryeziu",
  "Lala",
  "Lleshi",
  "Lulaj",
  "Lusha",
  "Mala",
  "Mati",
  "Mehmeti",
  "Mema",
  "Mesi",
  "Meta",
  "Mucaj",
  "Murati",
  "Mustafa",
  "Myftiu",
  "Nallbani",
  "Neziri",
  "Nikolli",
  "Osmani",
  "Palaj",
  "Papa",
  "Pasha",
  "Peci",
  "P\xEBrnaska",
  "Petro",
  "Prifti",
  "Qorri",
  "Rama",
  "Rexhepi",
  "Rrahmani",
  "Rugova",
  "Rushiti",
  "Saliu",
  "Selimi",
  "Shala",
  "Shatri",
  "Shehu",
  "Shkreli",
  "Shyti",
  "Sina",
  "Sokolaj",
  "Spahiu",
  "Syla",
  "Tafa",
  "Tahiraj",
  "Tola",
  "Topi",
  "Toska",
  "Uka",
  "Vata",
  "Veliu",
  "Veseli",
  "Xhaferi",
  "Xhemali",
  "Ylli",
  "Zeqiri",
  "Zogu",
  "Zymberi",
  "Abdullahu",
  "Agalliu",
  "Ahmetaj",
  "Alban",
  "Arditi",
  "Bajraktari",
  "Balluku",
  "Bardhi",
  "Begolli",
  "Bektashi",
  "Biba",
  "Brahimi",
  "Cakaj",
  "\xC7ipi",
  "Dauti",
  "Demaj",
  "Dervishi",
  "Dibra",
  "Domi",
  "Dragusha",
  "Dreshaj",
  "Dukagjini",
  "Duraku",
  "Durr\xEBs",
  "Fazli",
  "Gegaj",
  "Gjonaj",
  "Gjoka",
  "Gjonbalaj",
  "Hoxhaj",
  "Hysenaj",
  "Imeri",
  "Isufaj",
  "Jasharaj",
  "Kadri",
  "Kajtazi",
  "Kallaba",
  "Kameri",
  "Kapllani",
  "Kastrati",
  "Kelmendi",
  "Koci",
  "Kola",
  "Krasniqi",
  "Kryeziu",
  "Laj\xE7i",
  "Leka",
  "Lleshi",
  "Lulaj",
  "Lushaj",
  "Maliqi",
  "Markaj",
  "Mehmetaj",
  "Mema",
  "Mhillaj",
  "Miftari",
  "Molla",
  "Morina",
  "Muci"
];

// resources/static_db/names/romanian_data.ts
var ROMANIAN_MALE_FIRSTNAMES = [
  "Andrei",
  "Alexandru",
  "David",
  "Matei",
  "\u0218tefan",
  "Gabriel",
  "Mihai",
  "Ion",
  "George",
  "Cristian",
  "Daniel",
  "Florin",
  "Adrian",
  "Bogdan",
  "C\u0103t\u0103lin",
  "Darius",
  "Emil",
  "Filip",
  "Gheorghe",
  "Horia",
  "Ionu\u021B",
  "Iulian",
  "Lauren\u021Biu",
  "Lucian",
  "Marius",
  "Nicolae",
  "Ovidiu",
  "Paul",
  "Radu",
  "Robert",
  "Sebastian",
  "Tudor",
  "Valentin",
  "Victor",
  "Vlad",
  "Alex",
  "Anton",
  "Beniamin",
  "Ciprian",
  "Claudiu",
  "Constantin",
  "Cornel",
  "Cosmin",
  "Dorin",
  "Drago\u0219",
  "Dumitru",
  "Eduard",
  "Eugen",
  "Flavius",
  "Gelu",
  "Hora\u021Biu",
  "Ilie",
  "Ionel",
  "Iosif",
  "Iustin",
  "Ladislau",
  "Liviu",
  "Luca",
  "Marcel",
  "Marian",
  "Marin",
  "Mircea",
  "Octavian",
  "Petru",
  "Rare\u0219",
  "R\u0103zvan",
  "Romeo",
  "Sabin",
  "Sorin",
  "Teodor",
  "Traian",
  "Valeriu",
  "Vasile",
  "Viorel",
  "Vladimir",
  "Zoltan",
  "Adi",
  "Albert",
  "Alexe",
  "Alin",
  "Amariei",
  "Aurel",
  "B\u0103nel",
  "Barbu",
  "Cezar",
  "Codru\u021B",
  "Corneliu",
  "Costel",
  "Cristi",
  "Dan",
  "D\u0103nu\u021B",
  "Dinu",
  "Dorel",
  "Doru",
  "Drago",
  "Elvis",
  "Emanoil",
  "Emanuel",
  "Eric",
  "Eusebiu",
  "F\u0103nel",
  "Felix",
  "Florentin",
  "Francisc",
  "Gabi",
  "Gheorghi\u021B\u0103",
  "Grigore",
  "Haralamb",
  "Iancu",
  "Ieronim",
  "Igor",
  "Ioan",
  "Ionu\u021B",
  "Irimia",
  "Iuliu",
  "Jean",
  "Lauren\u021Biu",
  "Laz\u0103r",
  "Leonard",
  "Lic\u0103",
  "Lorin",
  "M\u0103d\u0103lin",
  "Manole",
  "Mihail",
  "Miron",
  "Mitic\u0103",
  "Mitic\u0103",
  "Mugur",
  "Nae",
  "Nelu",
  "Nicu",
  "Nicu\u0219or",
  "Octav",
  "Pavel",
  "Petre",
  "Petric\u0103",
  "Radu",
  "Rare\u0219",
  "Raul",
  "Remus",
  "Romeo",
  "Sandu",
  "Sergiu",
  "Silviu",
  "Simion",
  "Stelian",
  "Tiberiu",
  "Titu",
  "Toma",
  "Valer",
  "Vasile",
  "Vasilica",
  "Victor",
  "Viorel",
  "Virgil",
  "Vlad",
  "Vladu",
  "Zaharia",
  "Zamfir",
  "Zeno"
];
var ROMANIAN_MALE_LASTNAMES = [
  "Popescu",
  "Pop",
  "Ionescu",
  "Dumitrescu",
  "Georgescu",
  "Stan",
  "Constantinescu",
  "Stoica",
  "Nicolae",
  "Mihai",
  "Cristea",
  "Marin",
  "Toma",
  "Munteanu",
  "Dinu",
  "Dobre",
  "Preda",
  "Radu",
  "Florea",
  "Vasilescu",
  "B\u0103lan",
  "Barbu",
  "C\xEErstea",
  "Diaconu",
  "Enache",
  "Florescu",
  "Gheorghe",
  "Hanganu",
  "Ilie",
  "Iordache",
  "Jianu",
  "Lungu",
  "Manea",
  "Neagu",
  "Oprea",
  "P\u0103un",
  "Petrescu",
  "Rusu",
  "Sava",
  "Tudor",
  "Ursu",
  "Voicu",
  "Zaharia",
  "Alexandrescu",
  "Andreescu",
  "Antonescu",
  "Ardelean",
  "Badea",
  "B\u0103descu",
  "B\u0103nic\u0103",
  "Bercea",
  "B\xEErl\u0103deanu",
  "Blaga",
  "Boboc",
  "Bogdan",
  "Botezatu",
  "Br\u0103nescu",
  "Bratu",
  "Bucur",
  "Bunea",
  "Cazacu",
  "Cercel",
  "Chiriac",
  "Ciobanu",
  "Cojocaru",
  "Coman",
  "Constantin",
  "Cornea",
  "Costache",
  "Costea",
  "Cre\u021Bu",
  "Cristescu",
  "Danciu",
  "Dasc\u0103lu",
  "David",
  "Dinu",
  "Dobre",
  "Dobrescu",
  "Dr\u0103gan",
  "Dr\u0103ghici",
  "Dumitru",
  "Ene",
  "Faur",
  "Filip",
  "Ganea",
  "Gheorghiu",
  "Grigorescu",
  "Grigore",
  "Groza",
  "Hristea",
  "Iancu",
  "Iftimie",
  "Ion",
  "Ionescu",
  "Ioni\u021B\u0103",
  "Iordache",
  "Iorga",
  "Istrate",
  "Ivan",
  "Laz\u0103r",
  "Luca",
  "Lupu",
  "M\u0103nescu",
  "Manole",
  "Marcu",
  "Matei",
  "Mih\u0103ilescu",
  "Mih\u0103il\u0103",
  "Miron",
  "Mocanu",
  "Moldovan",
  "Moraru",
  "Muntean",
  "Mu\u0219at",
  "Neac\u0219u",
  "Necula",
  "Negoescu",
  "Nistor",
  "Olteanu",
  "Onea",
  "Panaite",
  "Pascu",
  "P\u0103tra\u0219cu",
  "Pavel",
  "Petre",
  "Petrov",
  "Pintilie",
  "Popa",
  "Popovici",
  "Predoiu",
  "Prodan",
  "Puiu",
  "R\u0103ducanu",
  "Roman",
  "Rotaru",
  "Sabin",
  "S\xE2rbu",
  "Sava",
  "Simionescu",
  "S\xEErbu",
  "\u0218erban",
  "\u0218tefan",
  "\u0218tef\u0103nescu",
  "T\u0103nase",
  "T\u0103n\u0103sescu",
  "Toma",
  "Tudose",
  "Ungureanu",
  "V\u0103duva",
  "Varga",
  "Vasile",
  "Vasiliu",
  "Vintil\u0103",
  "Vlad",
  "Voinea",
  "Z\u0103bav\u0103",
  "Zamfir",
  "Z\u0103rnescu",
  "Zavala",
  "Zlate"
];

// resources/static_db/names/baltic_data.ts
var BALTIC_MALE_FIRSTNAMES = [
  "Markas",
  "Benas",
  "Jonas",
  "Motiejus",
  "Matas",
  "Nojus",
  "Lukas",
  "Jok\u016Bbas",
  "Leonas",
  "Adomas",
  "Herkus",
  "Dominykas",
  "Augustas",
  "Dovydas",
  "Kajus",
  "Mantas",
  "Vytautas",
  "Algirdas",
  "Gediminas",
  "Mindaugas",
  "Tomas",
  "Paulius",
  "Andrius",
  "Marius",
  "Ar\u016Bnas",
  "Darius",
  "Gintaras",
  "K\u0119stutis",
  "Rimas",
  "Saulius",
  "Tauras",
  "Vilius",
  "\u017Dygimantas",
  "Aivaras",
  "Antanas",
  "Art\u016Bras",
  "Edvinas",
  "Eimantas",
  "Ignas",
  "Justinas",
  "Karolis",
  "Linas",
  "Naglis",
  "Oskaras",
  "Povilas",
  "Raimundas",
  "Rolandas",
  "Simonas",
  "Tadas",
  "Vaidas",
  "Vaidotas",
  "Valdas",
  "Vygantas",
  "\u017Dilvinas",
  "\u0104\u017Euolas",
  "Rytis",
  "Vytis",
  "Girius",
  "Rokas",
  "Deividas",
  "Olivers",
  "Roberts",
  "Marks",
  "Gustavs",
  "Em\u012Bls",
  "Daniels",
  "Markuss",
  "Adri\u0101ns",
  "K\u0101rlis",
  "Aleksandrs",
  "J\u0113kabs",
  "Ernests",
  "Ralfs",
  "Dominiks",
  "Tomass",
  "Art\u016Brs",
  "Ri\u010Dards",
  "Maksims",
  "Toms",
  "Teodors",
  "J\u0101nis",
  "Reinis",
  "Kristers",
  "L\u016Bkass",
  "Edgars",
  "M\u0101ris",
  "Aivars",
  "Andris",
  "Juris",
  "Artjoms",
  "Nikolajs",
  "Oskars",
  "Pauls",
  "Rihards",
  "Valters",
  "Viktors",
  "Zigurds",
  "Dainis",
  "Gatis",
  "Ivars",
  "Kaspars",
  "M\u0101rti\u0146\u0161",
  "P\u0113teris",
  "Raitis",
  "Sandis",
  "Uldis",
  "Viesturs",
  "Ziedonis",
  "Edijs",
  "\u0122irts",
  "Ingus",
  "Kri\u0161j\u0101nis",
  "Lauris",
  "Mihails",
  "Niks",
  "R\u016Bdolfs",
  "T\u0101lis",
  "Agnis",
  "Aigars",
  "Ain\u0101rs",
  "Aivis",
  "Alberts",
  "Andrejs",
  "Georgs",
  "Mark",
  "Hugo",
  "Robin",
  "Miron",
  "Lucas",
  "Karl",
  "Aron",
  "Mattias",
  "Sebastian",
  "Oskar",
  "Artur",
  "Leon",
  "Oliver",
  "Rasmus",
  "Kristofer",
  "Henri",
  "Nikita",
  "Jakob",
  "Martin",
  "Aleksandr",
  "Sergei",
  "Vladimir",
  "Andrei",
  "Andres",
  "Toomas",
  "Margus",
  "Indrek",
  "Peeter",
  "Priit",
  "Marko",
  "Jaan",
  "J\xFCri",
  "Mihkel",
  "Mati",
  "Ivo",
  "Ott",
  "Otto",
  "Hendrik",
  "Erik",
  "Felix",
  "Gregor",
  "Johannes",
  "Kaspar",
  "Timur",
  "Romet",
  "Jasper",
  "Joosep",
  "Konrad",
  "Mikk",
  "Kristjan",
  "Taavi",
  "Siim",
  "Rauno",
  "Mart",
  "Tanel",
  "Kevin",
  "Maksim",
  "Dmitri",
  "Igor",
  "Anton",
  "Deniss",
  "Bruno",
  "Feliks",
  "Osvald",
  "Aivar",
  "Ain",
  "Aleksei",
  "Vlad",
  "Yegor",
  "Antero",
  "Kaarel",
  "Silvar",
  "Ken",
  "Paul",
  "Jakob",
  "Matilde"
];
var BALTIC_MALE_LASTNAMES = [
  "Jankauskas",
  "Kazlauskas",
  "Petrauskas",
  "Stankevi\u010Dius",
  "Vasiliauskas",
  "Butkus",
  "Urbonas",
  "Kavaliauskas",
  "\u017Dukauskas",
  "Bal\u010Di\u016Bnas",
  "\u010Cerniauskas",
  "Grigali\u016Bnas",
  "Kairys",
  "Paulauskas",
  "Ramanauskas",
  "Sakalauskas",
  "Vaitkus",
  "Zinkevi\u010Dius",
  "Adomaitis",
  "Baranauskas",
  "Daug\u0117la",
  "Gedvilas",
  "Ivanauskas",
  "Jonaitis",
  "Klimas",
  "Laurinavi\u010Dius",
  "Ma\u017Eeika",
  "Navickas",
  "Petkevi\u010Dius",
  "Rimkus",
  "Simutis",
  "Tamulevi\u010Dius",
  "Valaitis",
  "Venckus",
  "\u017Demaitis",
  "B\u0113rzi\u0146\u0161",
  "Kalni\u0146\u0161",
  "Ozoli\u0146\u0161",
  "Jansons",
  "Ozols",
  "Liepi\u0146\u0161",
  "Kr\u016Bmi\u0146\u0161",
  "Balodis",
  "Egl\u012Btis",
  "Sili\u0146\u0161",
  "Skuja",
  "Strazdi\u0146\u0161",
  "Rieksti\u0146\u0161",
  "Saul\u012Btis",
  "Priede",
  "Vanags",
  "Vilci\u0146\u0161",
  "Za\u0137is",
  "Puri\u0146\u0161",
  "K\u013Cavi\u0146\u0161",
  "\u0100boli\u0146\u0161",
  "Kalni\u0146\u0161",
  "Berzins",
  "Ivanovs",
  "Kalnins",
  "Tamm",
  "Saar",
  "Sepp",
  "Kask",
  "M\xE4gi",
  "Kukk",
  "Rebane",
  "Koppel",
  "Karu",
  "Ilves",
  "Lepik",
  "P\xE4rn",
  "Kivi",
  "Kuusk",
  "J\xE4rv",
  "P\xF5der",
  "Lepp",
  "Laas",
  "Oja",
  "Kangur",
  "Raid",
  "Roots",
  "Sild",
  "Toom",
  "Vare",
  "Aasm\xE4e",
  "Allik",
  "Eesti",
  "Haas",
  "J\xF5gi",
  "Kallas",
  "K\xF5iv",
  "Lille",
  "Mets",
  "N\xF5mm",
  "Puu",
  "Raud",
  "Soo",
  "Tammik",
  "Vesi",
  "Aleksejev",
  "Ivanov",
  "Petrov",
  "Smirnov",
  "Popov",
  "Sokolov",
  "Morozov",
  "Volkov",
  "Lebedev",
  "Kuznetsov",
  "Novikov",
  "Mihhailov",
  "Fedorov",
  "Stepanov",
  "Nikolaev",
  "Andreev",
  "Petrenko",
  "Kovalenko",
  "Bondarenko",
  "Tkachenko",
  "Shevchenko",
  "Kovalchuk",
  "Melnyk",
  "Kravchenko",
  "Savchenko",
  "Boyko",
  "Marchenko",
  "Lysenko",
  "Koval",
  "Pavlenko",
  "Litvin",
  "Zaitsev",
  "Orlov",
  "Kozlov",
  "Novak",
  "Kovalyov",
  "Moroz",
  "Pavlov",
  "Semenov",
  "Ermakov",
  "Dmitriev",
  "Antonov",
  "Gusev",
  "Tikhonov",
  "Frolov",
  "Sergeev",
  "Romanov",
  "Zaharov",
  "Borisov",
  "Maksimov",
  "Sidorov",
  "Osipov",
  "Belov",
  "Vorobyov",
  "Solovyov",
  "Kolesnikov",
  "Karpov",
  "Afanasiev",
  "Vlasov",
  "Maslov",
  "Isakov",
  "Tarasov",
  "Martynov",
  "Sviridov",
  "Yakovlev",
  "Polyakov",
  "Ponomarev",
  "Gorbunov",
  "Kudryavtsev",
  "Krylov",
  "Belyaev",
  "Bogdanov",
  "Voronin",
  "Vinogradov",
  "Medvedev",
  "Abramov",
  "Krasnov",
  "Sobolev",
  "Titov",
  "Makarov",
  "Gavrilov",
  "Antipov",
  "Filippov",
  "Grigoriev",
  "Kuzmin",
  "Davydov",
  "Melnikov",
  "Denisov",
  "Gromov",
  "Fomin",
  "Klimov",
  "Petukhov",
  "Kochetkov",
  "Gorbachev",
  "Kryukov",
  "Belyakov",
  "Alekseev",
  "Savin",
  "Rybakov",
  "Suvorov"
];

// resources/static_db/names/benelux_data.ts
var BENELUX_MALE_FIRSTNAMES = [
  "Lucas",
  "Liam",
  "Noah",
  "Finn",
  "Milan",
  "Daan",
  "Levi",
  "Sem",
  "Bram",
  "Jesse",
  "Thomas",
  "Thijs",
  "Jayden",
  "Tim",
  "Max",
  "Ruben",
  "Stijn",
  "Seppe",
  "Lars",
  "Jasper",
  "Mathias",
  "Arthur",
  "Vince",
  "Quinten",
  "Wout",
  "Louis",
  "Victor",
  "Alexander",
  "Elias",
  "Hugo",
  "Jack",
  "James",
  "Oliver",
  "Benjamin",
  "Henry",
  "William",
  "Samuel",
  "Daniel",
  "Matthew",
  "Joseph",
  "David",
  "Michael",
  "Andrew",
  "Charles",
  "Edward",
  "George",
  "Robert",
  "John",
  "Peter",
  "Paul",
  "Mark",
  "Simon",
  "Adam",
  "Nathan",
  "Ryan",
  "Jake",
  "Luke",
  "Ethan",
  "Oscar",
  "Theo",
  "Felix",
  "Gabriel",
  "Julian",
  "Leo",
  "Mason",
  "Logan",
  "Aiden",
  "Jackson",
  "Mateo",
  "Luca",
  "Jules",
  "Louis",
  "Victor",
  "Emile",
  "Gustave",
  "Henri",
  "Antoine",
  "Nicolas",
  "Pierre",
  "Jean",
  "Fran\xE7ois",
  "Philippe",
  "Laurent",
  "Mathieu",
  "Alexandre",
  "S\xE9bastien",
  "Baptiste",
  "Cl\xE9ment",
  "Th\xE9o",
  "Rapha\xEBl",
  "Hugo",
  "L\xE9on",
  "Marius",
  "\xC9tienne",
  "Charles",
  "Auguste",
  "Marcel",
  "Ren\xE9",
  "Georges",
  "Albert",
  "Maurice",
  "\xC9mile",
  "Jules",
  "Alfred",
  "Gaston",
  "Fernand",
  "Lucien",
  "Raymond",
  "Andr\xE9",
  "Roger",
  "Bernard",
  "Michel",
  "Jacques",
  "Daniel",
  "Patrick",
  "Christian",
  "Didier",
  "Olivier",
  "Christophe",
  "Laurent",
  "St\xE9phane",
  "Philippe",
  "Nicolas",
  "Julien",
  "S\xE9bastien",
  "Fr\xE9d\xE9ric",
  "Thomas",
  "Antoine",
  "Guillaume",
  "Vincent",
  "Benjamin",
  "Samuel",
  "Alexis",
  "Mathis",
  "Evan",
  "Lukas",
  "Robin",
  "Jonas",
  "Senne",
  "Brent",
  "Jelle",
  "Kobe",
  "Niels",
  "Jens",
  "Maarten",
  "Pieter",
  "Sander",
  "Bas",
  "Joost",
  "Dirk",
  "Henk",
  "Jan",
  "Kees",
  "Gert",
  "Hans",
  "Peter",
  "Rob",
  "Tom",
  "Willem",
  "Bart",
  "Dennis",
  "Erik",
  "Frank",
  "Gerard",
  "Herman",
  "Johan",
  "Klaas",
  "Marcel",
  "Martijn",
  "Nico",
  "Oscar",
  "Paul",
  "Quinten",
  "Rein",
  "Stefan",
  "Theo",
  "Uwe",
  "Victor",
  "Wim",
  "Yves",
  "Zeger",
  "Arjen",
  "Boudewijn",
  "Cas",
  "Diederik",
  "Ewout",
  "Floris",
  "Gijs",
  "Hidde",
  "Ivo",
  "Joris",
  "Koen",
  "Lennart",
  "Mees",
  "Noud",
  "Olaf",
  "Pepijn",
  "Quinten",
  "Rutger",
  "Siem",
  "Teun",
  "Ulysse",
  "Viktor",
  "Wouter",
  "Xander",
  "Yannick",
  "Zion"
];
var BENELUX_MALE_LASTNAMES = [
  "Janssens",
  "Peeters",
  "Maes",
  "Jacobs",
  "Mertens",
  "Willems",
  "Claes",
  "Goossens",
  "Vermeulen",
  "De Smet",
  "Smets",
  "Vandermeulen",
  "De Clercq",
  "Desmet",
  "Vermeersch",
  "Michiels",
  "Vandenberghe",
  "De Vos",
  "Declercq",
  "Wouters",
  "Coppens",
  "Verstraeten",
  "Vanhove",
  "Verhelst",
  "Lemmens",
  "Stevens",
  "Pauwels",
  "Segers",
  "Hermans",
  "Martens",
  "De Bruyn",
  "De Jong",
  "Janssen",
  "de Vries",
  "Bakker",
  "Jansen",
  "Visser",
  "Smit",
  "Meijer",
  "de Boer",
  "Mulder",
  "de Groot",
  "Bos",
  "Vos",
  "Peters",
  "Hendriks",
  "van Dijk",
  "Dekker",
  "van Leeuwen",
  "Brouwer",
  "de Wit",
  "Dijkstra",
  "Smits",
  "de Graaf",
  "van der Meer",
  "van den Berg",
  "van der Linden",
  "van der Heijden",
  "van der Veen",
  "van den Heuvel",
  "van der Velden",
  "van den Broek",
  "van der Hoek",
  "van der Laan",
  "van der Wal",
  "van der Molen",
  "van der Horst",
  "van der Meulen",
  "van der Sluis",
  "van der Woude",
  "van der Zee",
  "van der Poel",
  "van der Voort",
  "van der Werf",
  "van der Zwaan",
  "van der Aa",
  "van der Baan",
  "van der Burg",
  "van der Does",
  "van der Eijk",
  "van der Gouw",
  "van der Hoeven",
  "van der Kamp",
  "van der Kooij",
  "van der Kroon",
  "van der Leek",
  "van der Linden",
  "van der Lugt",
  "van der Maat",
  "van der Meij",
  "van der Ploeg",
  "van der Putten",
  "van der Sande",
  "van der Schoot",
  "van der Steen",
  "van der Veer",
  "van der Vliet",
  "van der Voort",
  "van der Walle",
  "van der Weide",
  "van der Wiel",
  "van der Wijk",
  "van der Wilt",
  "van der Wolf",
  "van der Zanden",
  "van Dijk",
  "van Doorn",
  "van Egmond",
  "van Gelder",
  "van Gent",
  "van Gogh",
  "van Houten",
  "van Kessel",
  "van Loon",
  "van Nistelrooy",
  "van Oosterom",
  "van Rijn",
  "van Rooij",
  "van Rossum",
  "van Schaik",
  "van Schijndel",
  "van Veen",
  "van Vliet",
  "van Wijk",
  "van Wingerden",
  "van Zanten",
  "Verbeek",
  "Verhoeven",
  "Vermeer",
  "Verschoor",
  "Vink",
  "Visser",
  "Vliet",
  "Vos",
  "Willems",
  "Wouters",
  "Zuidema",
  "Zwart",
  "Aerts",
  "Baert",
  "Bogaert",
  "Bonte",
  "Bossuyt",
  "Bourgeois",
  "Braeckman",
  "Bracke",
  "Callens",
  "Callewaert",
  "Christiaens",
  "Coene",
  "Cools",
  "Cornelis",
  "Daems",
  "Dauwe",
  "De Backer",
  "De Baets",
  "De Block",
  "De Boeck",
  "De Bondt",
  "De Bruyne",
  "De Coninck",
  "De Corte",
  "De Decker",
  "De Groote",
  "De Haes",
  "De Herdt",
  "De Keyser",
  "De Maeyer",
  "De Meyer",
  "De Moor",
  "De Neve",
  "De Pauw",
  "De Ridder",
  "De Roeck",
  "De Sutter",
  "De Vriendt",
  "De Wilde",
  "Decoster",
  "Delaere",
  "Demey",
  "Deprez",
  "Dierickx",
  "Dirkx",
  "Dumont",
  "Dupont",
  "Eeckhout",
  "Geerts",
  "Gielen",
  "Govaerts",
  "Heylen",
  "Hoste",
  "Huybrechts",
  "Joris",
  "Lauwers",
  "Lef\xE8vre",
  "Lemaire",
  "Luyten",
  "Maertens",
  "Matthys",
  "Meeus",
  "Meyers",
  "Moens",
  "Moreau",
  "Naessens",
  "Nijs",
  "Nuyts",
  "Opsomer",
  "Pauwels",
  "Peeters",
  "Penninckx",
  "Pieters",
  "Piron",
  "Rijckaert",
  "Roels",
  "Rombouts",
  "Saeys",
  "Schoenmakers",
  "Smet",
  "Smolders",
  "Steen",
  "Steyaert",
  "Stroobants",
  "Swinnen",
  "Thijs",
  "Timmermans",
  "Van Acker",
  "Van Balen",
  "Van Camp",
  "Van Damme",
  "Van de Velde",
  "Van den Bossche",
  "Van den Broeck",
  "Van den Eynde",
  "Van der Auwera",
  "Van Hecke",
  "Van Hoof",
  "Van Hove",
  "Van Impe",
  "Van Looy",
  "Van Meir",
  "Van Neste",
  "Van Nieuwenhuyse",
  "Van Nuffel",
  "Van Rompaey",
  "Van Roy",
  "Van Steen",
  "Van Waes",
  "Van Wijnsberghe",
  "Vanden Abeele",
  "Vandenbroucke",
  "Vanderlinden",
  "Vanhoutte",
  "Verbruggen",
  "Vercauteren",
  "Verhaegen",
  "Verhaeghe",
  "Verheyden",
  "Vermeiren",
  "Verschueren",
  "Vervoort",
  "Veys",
  "Vrancken",
  "Wauters",
  "Willems",
  "Wuyts",
  "Zaman"
];

// resources/static_db/names/hungarian_data.ts
var HUNGARIAN_MALE_FIRSTNAMES = [
  "Bence",
  "M\xE1t\xE9",
  "Levente",
  "D\xE1vid",
  "\xC1d\xE1m",
  "Bal\xE1zs",
  "Krist\xF3f",
  "Tam\xE1s",
  "Gerg\u0151",
  "Attila",
  "Zolt\xE1n",
  "P\xE9ter",
  "L\xE1szl\xF3",
  "Istv\xE1n",
  "J\xE1nos",
  "G\xE1bor",
  "Andr\xE1s",
  "Ferenc",
  "S\xE1ndor",
  "J\xF3zsef",
  "Mih\xE1ly",
  "Kriszti\xE1n",
  "Csaba",
  "Zsolt",
  "Imre",
  "Gy\xF6rgy",
  "Viktor",
  "M\xE1rk",
  "\xC1ron",
  "Benedek",
  "Botond",
  "D\xE1niel",
  "Dominik",
  "Endre",
  "Erik",
  "Gell\xE9rt",
  "Henrik",
  "Hubert",
  "Ign\xE1c",
  "Jen\u0151",
  "K\xE1lm\xE1n",
  "L\xF3r\xE1nt",
  "Mikl\xF3s",
  "N\xE1ndor",
  "Oliv\xE9r",
  "Patrik",
  "Rich\xE1rd",
  "R\xF3bert",
  "Roland",
  "Rudolf",
  "Soma",
  "Szabolcs",
  "Szil\xE1rd",
  "Tibor",
  "Vencel",
  "Vilmos",
  "Zsombor",
  "\xC1bel",
  "\xC1kos",
  "\xC1rmin",
  "Barnab\xE1s",
  "Bertalan",
  "Boldizs\xE1r",
  "D\xE9nes",
  "Dezs\u0151",
  "Elek",
  "Elem\xE9r",
  "Emil",
  "Ern\u0151",
  "Farkas",
  "F\xFCl\xF6p",
  "Guszt\xE1v",
  "Gyula",
  "Hug\xF3",
  "Iv\xE1n",
  "J\xE1cint",
  "K\xE1roly",
  "Korn\xE9l",
  "Lajos",
  "Lip\xF3t",
  "M\xE1ty\xE1s",
  "Mih\xE1ly",
  "M\xF3zes",
  "No\xE9",
  "\xD6d\xF6n",
  "P\xE1l",
  "Pongr\xE1c",
  "Rafael",
  "Rezs\u0151",
  "Sebesty\xE9n",
  "Simon",
  "Szilveszter",
  "Tivadar",
  "Vendel",
  "Vince",
  "Z\xE9n\xF3",
  "Zsigmond",
  "\xC1goston",
  "Alad\xE1r",
  "Alfr\xE9d",
  "Antal",
  "\xC1rp\xE1d",
  "B\xE9la",
  "Bertold",
  "B\xE9res",
  "Csongor",
  "Don\xE1t",
  "Ede",
  "Edv\xE1rd",
  "Egon",
  "Elek",
  "Ervin",
  "F\xE1bi\xE1n",
  "F\xE9lix",
  "Frigyes",
  "G\xE9za",
  "Gy\u0151z\u0151",
  "Hajnalka",
  "Hektor",
  "Hug\xF3",
  "Idrisz",
  "Ill\xE9s",
  "Imre",
  "Istv\xE1n",
  "Jakab",
  "J\xE1nos",
  "J\xF3zsef",
  "Judit",
  "Kelemen",
  "Kende",
  "Kereszt\xE9ly",
  "Korn\xE9l",
  "L\xE1szl\xF3",
  "L\xE9n\xE1rd",
  "L\xF3r\xE1nt",
  "M\xE1rton",
  "M\xE1t\xE9",
  "Menyh\xE9rt",
  "Mih\xE1ly",
  "Mikl\xF3s",
  "M\xF3ric",
  "N\xE1ndor",
  "Norbert",
  "\xD6rs",
  "P\xE1l",
  "P\xE9ter",
  "R\xF3bert",
  "S\xE1muel",
  "Seb\u0151",
  "Sebesty\xE9n",
  "Simon",
  "Szabolcs",
  "Szent",
  "Tam\xE1s",
  "Tibor",
  "Tiham\xE9r",
  "Vajk",
  "Val\xE9r",
  "Vencel",
  "Vidor",
  "Viktor",
  "Vilmos",
  "Vince",
  "Zolt\xE1n",
  "Zsombor",
  "Zsolt"
];
var HUNGARIAN_MALE_LASTNAMES = [
  "Nagy",
  "Kov\xE1cs",
  "T\xF3th",
  "Szab\xF3",
  "Horv\xE1th",
  "Varga",
  "Kiss",
  "Moln\xE1r",
  "N\xE9meth",
  "Farkas",
  "Papp",
  "Tak\xE1cs",
  "Juh\xE1sz",
  "Lakatos",
  "M\xE9sz\xE1ros",
  "Simon",
  "R\xE1cz",
  "Balogh",
  "S\xE1ndor",
  "Fekete",
  "Kis",
  "Szil\xE1gyi",
  "Pint\xE9r",
  "Katona",
  "G\xE1l",
  "B\xEDr\xF3",
  "Kir\xE1ly",
  "L\xE1szl\xF3",
  "Jakab",
  "Bal\xE1zs",
  "Fodor",
  "V\xE1radi",
  "Antal",
  "Borb\xE9ly",
  "Somogyi",
  "Heged\u0171s",
  "Ill\xE9s",
  "Guly\xE1s",
  "Kocsis",
  "Veres",
  "Barta",
  "Boros",
  "Csonka",
  "De\xE1k",
  "Dud\xE1s",
  "Farag\xF3",
  "Feh\xE9r",
  "G\xE1sp\xE1r",
  "Hal\xE1sz",
  "Heged\xFCs",
  "Herczeg",
  "Husz\xE1r",
  "K\xE1lm\xE1n",
  "Kelemen",
  "Kerekes",
  "Kert\xE9sz",
  "Kocsis",
  "Kov\xE1cs",
  "Lengyel",
  "Luk\xE1cs",
  "Magyar",
  "M\xE1rton",
  "M\xE1t\xE9",
  "Mih\xE1ly",
  "Mikl\xF3s",
  "Nagy",
  "N\xE9meth",
  "Nov\xE1k",
  "Ol\xE1h",
  "Orb\xE1n",
  "Orosz",
  "P\xE1l",
  "P\xE1sztor",
  "Pataki",
  "P\xE9ter",
  "Pint\xE9r",
  "Popovics",
  "R\xE1cz",
  "R\xE1kosi",
  "S\xE1rk\xF6zi",
  "Sipos",
  "So\xF3s",
  "S\xF6r\xF6s",
  "Szab\xF3",
  "Szalai",
  "Szekeres",
  "Szil\xE1gyi",
  "Sz\u0171cs",
  "Tam\xE1s",
  "T\xF3th",
  "T\xF6r\xF6k",
  "Varga",
  "V\xE1radi",
  "Vass",
  "V\xE9gh",
  "Vincze",
  "Vir\xE1g",
  "Zal\xE1n",
  "Z\xE1mbori",
  "Zolt\xE1n",
  "\xC1cs",
  "\xC1d\xE1m",
  "\xC1goston",
  "Bajnok",
  "Bakos",
  "B\xE1lint",
  "B\xE1n",
  "Barna",
  "Barta",
  "Bart\xF3k",
  "Beke",
  "Bencsik",
  "Bende",
  "Berecz",
  "Bodn\xE1r",
  "Bogn\xE1r",
  "Borb\xE1s",
  "Boros",
  "Budai",
  "Buz\xE1s",
  "Cseh",
  "Csik\xF3s",
  "Csizmadia",
  "Csord\xE1s",
  "Dank\xF3",
  "D\xE1vid",
  "D\xE9nes",
  "Dobos",
  "Domonkos",
  "Dud\xE1s",
  "Egresi",
  "Egyed",
  "F\xE1bi\xE1n",
  "Fazekas",
  "Fekete",
  "Fodor",
  "F\xF6ldi",
  "G\xE1bor",
  "G\xE1l",
  "G\xE1sp\xE1r",
  "Gergely",
  "Guly\xE1s",
  "Gy\u0151ri",
  "Hajdu",
  "Hal\xE1sz",
  "Heged\u0171s",
  "Herczeg",
  "Holl\xF3",
  "Horv\xE1th",
  "Ill\xE9s",
  "Imre",
  "Jakab",
  "Juh\xE1sz",
  "K\xE1d\xE1r",
  "K\xE1lm\xE1n",
  "Kelemen",
  "Kerekes",
  "Kir\xE1ly",
  "Kiss",
  "Kocsis",
  "Kov\xE1cs",
  "Kozma",
  "Kuti",
  "Lakatos",
  "L\xE1szl\xF3",
  "Lengyel",
  "Lipt\xE1k",
  "Luk\xE1cs",
  "Magyar",
  "M\xE1rkus",
  "M\xE1t\xE9",
  "M\xE9sz\xE1ros",
  "Moln\xE1r",
  "Nagy",
  "N\xE9meth",
  "Nov\xE1k",
  "Ol\xE1h",
  "Orb\xE1n",
  "Orosz",
  "P\xE1l",
  "Papp",
  "Pataki",
  "Pint\xE9r",
  "R\xE1cz",
  "R\xE1k\xF3czi",
  "S\xE1ndor",
  "Simon",
  "Somogyi",
  "So\xF3s",
  "Szab\xF3",
  "Szalai",
  "Szekeres",
  "Szil\xE1gyi",
  "Sz\u0171cs",
  "Tak\xE1cs",
  "Tam\xE1s",
  "T\xF3th",
  "T\xF6r\xF6k",
  "Varga",
  "Vass",
  "Veres",
  "Vincze",
  "Vir\xE1g",
  "Zolt\xE1n",
  "Zsigmond"
];

// resources/static_db/names/maltese_data.ts
var MALTESE_MALE_FIRSTNAMES = [
  "Joseph",
  "John",
  "Mark",
  "Mario",
  "David",
  "Paul",
  "Michael",
  "Anthony",
  "Luke",
  "Luca",
  "Matthew",
  "Jacob",
  "Zachary",
  "Nathan",
  "Andrew",
  "Andreas",
  "Andre",
  "Andy",
  "Samuel",
  "Adam",
  "Noah",
  "Liam",
  "Oliver",
  "Benjamin",
  "Daniel",
  "Gabriel",
  "Isaac",
  "Julian",
  "Thomas",
  "Jake",
  "Anton",
  "An\u0121lu",
  "Alessandru",
  "Alfred",
  "Alwi\u0121i",
  "Andrija",
  "Antnin",
  "Arturo",
  "Baldassar",
  "Bernard",
  "Bertu",
  "\u010Aensu",
  "\u010Aikku",
  "\u010Aharlu",
  "Dumniku",
  "Dwardu",
  "Duminku",
  "Fran\u0121isk",
  "\u0120akbu",
  "\u0120akobb",
  "\u0120anni",
  "\u0120or\u0121",
  "\u0120u\u017Ceppi",
  "\u0120u\u017C\xE8",
  "\u0120wann",
  "\u0120wanni",
  "Girgor",
  "Indri",
  "Karmenu",
  "Lawrenz",
  "Leli",
  "Manwel",
  "Mikiel",
  "Ninu",
  "Pawlu",
  "Pinu",
  "Publiju",
  "Roccu",
  "Salvu",
  "Saverju",
  "Spiru",
  "Stiefnu",
  "Tumas",
  "Wenzu",
  "Wistin",
  "Xandru",
  "Xmun",
  "\u017Baren",
  "Aaron",
  "Aiden",
  "Alex",
  "Angelo",
  "Carmel",
  "Charles",
  "Christopher",
  "Dominic",
  "Edward",
  "Emanuel",
  "Emmanuel",
  "Francis",
  "George",
  "Henry",
  "James",
  "Lawrence",
  "Louis",
  "Nicholas",
  "Patrick",
  "Philip",
  "Raymond",
  "Robert",
  "Stephen",
  "Victor",
  "Vincent",
  "William"
];
var MALTESE_MALE_LASTNAMES = [
  "Borg",
  "Vella",
  "Camilleri",
  "Farrugia",
  "Zammit",
  "Galea",
  "Micallef",
  "Grech",
  "Attard",
  "Spiteri",
  "Azzopardi",
  "Cassar",
  "Agius",
  "Caruana",
  "Mifsud",
  "Pace",
  "Galea",
  "Xuereb",
  "Buttigieg",
  "Calleja",
  "Gatt",
  "Mallia",
  "Mizzi",
  "Busuttil",
  "Falzon",
  "Cumbo",
  "Brincat",
  "Cauchi",
  "Zahra",
  "Ellul",
  "Xerri",
  "Teuma",
  "Stivala",
  "Ciappara",
  "Fiteni",
  "Cini",
  "Galdes",
  "Gristi",
  "Parnis",
  "Xiriha",
  "Abdilla",
  "Abela",
  "Azzopardi",
  "Bajada",
  "Baldacchino",
  "Bonello",
  "Bondin",
  "Bonici",
  "Borg",
  "Briffa",
  "Busietta",
  "Cachia",
  "Calafato",
  "Carabott",
  "Cardona",
  "Cassar",
  "Caucci",
  "Chetcuti",
  "Chircop",
  "Cini",
  "Cortis",
  "Cuschieri",
  "Cutajar",
  "Dalli",
  "Debono",
  "Degiorgio",
  "Delia",
  "Dimech",
  "Dingli",
  "Doublet",
  "Ellul",
  "Farrugia",
  "Fenech",
  "Ferriggi",
  "Formosa",
  "Frendo",
  "Galea",
  "Gatt",
  "Grech",
  "Grima",
  "Gauci",
  "Haber",
  "Hili",
  "Lanzon",
  "Lia",
  "Magri",
  "Mallia",
  "Mamo",
  "Mangion",
  "Mercieca",
  "Micallef",
  "Mifsud",
  "Mizzi",
  "Muscat",
  "Pace",
  "Pisani",
  "Portelli",
  "Psaila",
  "Pullicino",
  "Rapa",
  "Rizzo",
  "Saliba",
  "Sammut",
  "Sant",
  "Sciberras",
  "Scicluna",
  "Serracino",
  "Sultana",
  "Tabone",
  "Tanti",
  "Tonna",
  "Vassallo",
  "Vella",
  "Xuereb",
  "Zahra",
  "Zammit",
  "Zarb"
];

// resources/static_db/names/israeli_data.ts
var ISRAELI_MALE_FIRSTNAMES = [
  "David",
  "Yosef",
  "Moshe",
  "Avraham",
  "Yitzhak",
  "Yaakov",
  "Aharon",
  "Yehuda",
  "Shimon",
  "Levi",
  "Yehoshua",
  "Yonatan",
  "Daniel",
  "Eitan",
  "Noam",
  "Ariel",
  "Omer",
  "Itay",
  "Uri",
  "Nadav",
  "Eyal",
  "Gilad",
  "Amir",
  "Barak",
  "Ido",
  "Liran",
  "Shahar",
  "Tal",
  "Ron",
  "Matan",
  "Shai",
  "Nimrod",
  "Ziv",
  "Ori",
  "Alon",
  "Dvir",
  "Ofir",
  "Roi",
  "Guy",
  "Ben",
  "Yair",
  "Asaf",
  "Tomer",
  "Yoav",
  "Yuval",
  "Erez",
  "Hillel",
  "Boaz",
  "Elad",
  "Gal",
  "Itamar",
  "Lior",
  "Nir",
  "Ran",
  "Shaked",
  "Shlomi",
  "Sagi",
  "Yogev",
  "Yotam",
  "Ze'ev",
  "Adam",
  "Aviv",
  "Bar",
  "Doron",
  "Eli",
  "Gideon",
  "Hadar",
  "Ilan",
  "Kfir",
  "Lev",
  "Maor",
  "Natan",
  "Omri",
  "Peleg",
  "Raz",
  "Shmuel",
  "Tzur",
  "Udi",
  "Vered",
  "Yarden",
  "Zohar",
  "Amit",
  "Benny",
  "Carmel",
  "Dani",
  "Eden",
  "Elisha",
  "Eran",
  "Gadi",
  "Haim",
  "Imri",
  "Jared",
  "Kobi",
  "Lavi",
  "Meir",
  "Naor",
  "Oded",
  "Paz",
  "Rafi",
  "Sagiv",
  "Shimon",
  "Tali",
  "Uriel",
  "Yehiel",
  "Zack",
  "Aaron",
  "Abraham",
  "Adi",
  "Akiva",
  "Amos",
  "Avi",
  "Aviel",
  "Aviad",
  "Avishai",
  "Avner",
  "Ayal",
  "Baruch",
  "Ben Zion",
  "Binyamin",
  "Chaim",
  "Dovid",
  "Dov",
  "Efraim",
  "Ehud",
  "Elazar",
  "Eliav",
  "Eliyahu",
  "Ephraim",
  "Ezra",
  "Gershon",
  "Hagai",
  "Hanan",
  "Harel",
  "Hashim",
  "Hershel",
  "Hillel",
  "Isaac",
  "Ishai",
  "Israel",
  "Itzik",
  "Jacob",
  "Jonathan",
  "Judah",
  "Kahana",
  "Koby",
  "Leib",
  "Menashe",
  "Menachem",
  "Mordechai",
  "Moti",
  "Nachman",
  "Naftali",
  "Netanel",
  "Nissim",
  "Noach",
  "Noy",
  "Oren",
  "Pinchas",
  "Rafael",
  "Reuven",
  "Ronni",
  "Rotem",
  "Saul",
  "Shalom",
  "Shaul",
  "Shlomo",
  "Shmuel",
  "Shneur",
  "Shraga",
  "Shuki",
  "Simcha",
  "Solomon",
  "Tanhum",
  "Tuvia",
  "Tzvi",
  "Uzi",
  "Yaacov",
  "Yanky",
  "Yaron",
  "Yehoshua",
  "Yehuda",
  "Yishai",
  "Yisrael",
  "Yitzchak",
  "Yochanan",
  "Yoni",
  "Yossi",
  "Zalman",
  "Zev",
  "Zvi",
  "Arik",
  "Asher",
  "Avihu",
  "Avraham",
  "Benaya",
  "Binyamin",
  "Chanan",
  "Daniyel",
  "Eitan",
  "Elchanan",
  "Eli",
  "Elyakim",
  "Emanuel",
  "Erez",
  "Gavriel",
  "Gershon",
  "Haim",
  "Hanan",
  "Hod",
  "Idan",
  "Ilay",
  "Inbar",
  "Itay",
  "Keren",
  "Liel",
  "Matityahu",
  "Meidad",
  "Menachem",
  "Michal",
  "Mordechai",
  "Moshe",
  "Nadav",
  "Naftali",
  "Netanel",
  "Nir",
  "Noam",
  "Ofer",
  "Ophir",
  "Ori",
  "Orr",
  "Oshri",
  "Otniel",
  "Oz",
  "Pinchas",
  "Rami",
  "Ronen",
  "Rotem",
  "Roy",
  "Shai",
  "Shalom",
  "Shaul",
  "Shay",
  "Shimon",
  "Shlomi",
  "Shmuel",
  "Shoham",
  "Shuki",
  "Tal",
  "Tamir",
  "Tomer",
  "Tzion",
  "Uriel",
  "Yair",
  "Yaki",
  "Yaron",
  "Yehiel",
  "Yehonatan",
  "Yehoshua",
  "Yehuda",
  "Yishai",
  "Yitzhak",
  "Yoav",
  "Yonatan",
  "Yosef",
  "Yossi",
  "Yuval",
  "Ziv"
];
var ISRAELI_MALE_LASTNAMES = [
  "Cohen",
  "Levy",
  "Mizrachi",
  "Peretz",
  "Bitton",
  "Azoulay",
  "David",
  "Mor",
  "Klein",
  "Friedman",
  "Goldberg",
  "Levin",
  "Shapiro",
  "Rosenberg",
  "Weiss",
  "Roth",
  "Kaplan",
  "Abramov",
  "Katz",
  "Ben David",
  "Ben Ezra",
  "Ben Zion",
  "Ben Yosef",
  "Ben Ari",
  "Ben Moshe",
  "Ben Shimon",
  "Ben Gurion",
  "Dayan",
  "Elias",
  "Farkash",
  "Golan",
  "Halevy",
  "Harari",
  "Hasson",
  "Hayun",
  "Herman",
  "Hoffman",
  "Israeli",
  "Kadosh",
  "Kahlon",
  "Kedem",
  "Keren",
  "Lahav",
  "Landau",
  "Lavi",
  "Lazar",
  "Levi",
  "Maman",
  "Maoz",
  "Marom",
  "Mashiach",
  "Mizrahi",
  "Morag",
  "Moshe",
  "Nagar",
  "Nahum",
  "Navon",
  "Neeman",
  "Nissan",
  "Ohana",
  "Oren",
  "Ovadia",
  "Paz",
  "Peled",
  "Perez",
  "Porat",
  "Rabin",
  "Rabinovich",
  "Rahamim",
  "Ram",
  "Rapaport",
  "Ravid",
  "Raz",
  "Regev",
  "Reuven",
  "Romano",
  "Rosen",
  "Rotem",
  "Saada",
  "Sabag",
  "Saban",
  "Sagi",
  "Salomon",
  "Sasson",
  "Schwartz",
  "Shalom",
  "Shamir",
  "Shapira",
  "Sharon",
  "Shemesh",
  "Shilo",
  "Shimon",
  "Shoham",
  "Shulman",
  "Silver",
  "Sinai",
  "Stern",
  "Suissa",
  "Tadmor",
  "Tal",
  "Tamir",
  "Tevet",
  "Toledano",
  "Tzur",
  "Vaknin",
  "Wasser",
  "Weinstein",
  "Yadin",
  "Yahav",
  "Yarkoni",
  "Yitzhaki",
  "Yosef",
  "Zadok",
  "Zamir",
  "Zohar",
  "Zuckerman",
  "Abadi",
  "Abecassis",
  "Abergel",
  "Abulafia",
  "Adler",
  "Aharoni",
  "Almog",
  "Amar",
  "Amram",
  "Arad",
  "Arbel",
  "Ashkenazi",
  "Avidan",
  "Avital",
  "Ayalon",
  "Azaria",
  "Barak",
  "Bar Ilan",
  "Bar Lev",
  "Barak",
  "Bass",
  "Ben Artzi",
  "Ben Haim",
  "Ben Harush",
  "Ben Ishay",
  "Ben Natan",
  "Ben Porat",
  "Ben Shalom",
  "Ben Yair",
  "Ben Yishai",
  "Berkowitz",
  "Bloch",
  "Blum",
  "Bouskila",
  "Braverman",
  "Chaim",
  "Cohen",
  "Dahan",
  "Dankner",
  "Dar",
  "Doron",
  "Eden",
  "Efrati",
  "Eisenberg",
  "Elbaz",
  "Eliezer",
  "Elkayam",
  "Elmaliach",
  "Elyashiv",
  "Eshkol",
  "Farkas",
  "Fogel",
  "Frankel",
  "Freund",
  "Gabai",
  "Gabay",
  "Gafni",
  "Gal",
  "Ganon",
  "Gavrieli",
  "Gefen",
  "Gershon",
  "Gil",
  "Golan",
  "Gold",
  "Goldman",
  "Gottlieb",
  "Greenberg",
  "Gross",
  "Gur",
  "Hadar",
  "Haim",
  "Halperin",
  "Harel",
  "Hasson",
  "Haziza",
  "Hershkovitz",
  "Hirsch",
  "Hofman",
  "Horowitz",
  "Idan",
  "Ilan",
  "Israeli",
  "Kadosh",
  "Kahan",
  "Kahana",
  "Kahn",
  "Kaminer",
  "Kantor",
  "Katz",
  "Kedar",
  "Kenan",
  "Keren",
  "Kessler",
  "Kfir",
  "Kishon",
  "Klausner",
  "Koch",
  "Kohn",
  "Kopel",
  "Koren",
  "Kramer",
  "Kushnir",
  "Lahav",
  "Landau",
  "Lapid",
  "Laufer",
  "Lavi",
  "Leibowitz",
  "Leibson",
  "Leitner",
  "Lerner",
  "Levi",
  "Levin",
  "Levy",
  "Lieberman",
  "Lifshitz",
  "Lior",
  "Lipschitz",
  "Lobel",
  "Lustig",
  "Magen",
  "Maimon",
  "Malchi",
  "Malka",
  "Malkin",
  "Manor",
  "Maoz",
  "Marom",
  "Mass",
  "Matz",
  "Mayer",
  "Medina",
  "Meir",
  "Melamed",
  "Mendel",
  "Meshulam",
  "Mizrahi",
  "Mor",
  "Mordechai",
  "Moshe",
  "Nagar",
  "Nahmani",
  "Naim",
  "Namir",
  "Natan",
  "Navon",
  "Neeman",
  "Negev",
  "Nir",
  "Nissan",
  "Noam",
  "Noy",
  "Ohana",
  "Ophir",
  "Oren",
  "Orlev",
  "Ovadia",
  "Paz",
  "Peled",
  "Peres",
  "Peretz",
  "Perez",
  "Porat",
  "Rabin",
  "Rabinowitz",
  "Rahamim",
  "Ram",
  "Ravid",
  "Raz",
  "Regev",
  "Reich",
  "Reuveni",
  "Rimon",
  "Ronen",
  "Rosen",
  "Rosenberg",
  "Rosenblum",
  "Roth",
  "Rubin",
  "Sabag",
  "Sadan",
  "Sagi",
  "Salem",
  "Salomon",
  "Samocha",
  "Sasson",
  "Schwartz",
  "Segal",
  "Shachar",
  "Shaked",
  "Shalom",
  "Shamir",
  "Shapira",
  "Sharon",
  "Shechter",
  "Shemesh",
  "Shenhav",
  "Shilo",
  "Shimon",
  "Shmuel",
  "Shoham",
  "Shpigel",
  "Shtark",
  "Sidi",
  "Silver",
  "Siman Tov",
  "Sinai",
  "Sofer",
  "Sokol",
  "Stern",
  "Suissa",
  "Swisa",
  "Tadmor",
  "Tal",
  "Tamir",
  "Tayar",
  "Tevet",
  "Toledano",
  "Tzafir",
  "Tzur",
  "Vaknin",
  "Vardi",
  "Wagner",
  "Weiss",
  "Wolf",
  "Yadin",
  "Yahav",
  "Yarkoni",
  "Yechezkel",
  "Yehoshua",
  "Yehuda",
  "Yishai",
  "Yitzhaki",
  "Yosef",
  "Zadok",
  "Zamir",
  "Zohar",
  "Zuckerman"
];

// resources/static_db/names/greek_data.ts
var GREEK_MALE_FIRSTNAMES = [
  "Giorgos",
  "Dimitris",
  "Nikos",
  "Christos",
  "Panagiotis",
  "Ioannis",
  "Konstantinos",
  "Alexandros",
  "Michalis",
  "Antonis",
  "Stavros",
  "Vassilis",
  "Thanasis",
  "Petros",
  "Sotiris",
  "Kostas",
  "Spyros",
  "Manolis",
  "Lefteris",
  "Yiannis",
  "Andreas",
  "Theodoros",
  "Pavlos",
  "Marios",
  "Savvas",
  "Kyriakos",
  "Charalambos",
  "Evangelos",
  "Filippos",
  "Stefanos",
  "Loukas",
  "Elias",
  "Achilleas",
  "Aristides",
  "Athanasios",
  "Dionysios",
  "Eleftherios",
  "Epaminondas",
  "Eustathios",
  "Georgios",
  "Ilias",
  "Konstantinos",
  "Lambros",
  "Leonidas",
  "Makarios",
  "Marinos",
  "Menelaos",
  "Neophytos",
  "Odysseas",
  "Orestis",
  "Pambos",
  "Panayiotis",
  "Paraskevas",
  "Phivos",
  "Photios",
  "Prokopis",
  "Rafail",
  "Sokratis",
  "Spyridon",
  "Stelios",
  "Stylianos",
  "Symeon",
  "Tassos",
  "Themistoklis",
  "Theofanis",
  "Thomas",
  "Timotheos",
  "Titos",
  "Vasileios",
  "Xenophon",
  "Zinon",
  "Adonis",
  "Agapios",
  "Akis",
  "Alexis",
  "Alkis",
  "Anastasios",
  "Andreas",
  "Angelos",
  "Antonis",
  "Apostolos",
  "Aris",
  "Aristarchos",
  "Aristodemos",
  "Aristofanis",
  "Aristos",
  "Athos",
  "Avgoustinos",
  "Avraam",
  "Charis",
  "Chariton",
  "Christakis",
  "Christodoulos",
  "Christoforos",
  "Chrysanthos",
  "Chrysostomos",
  "Damianos",
  "Demetrios",
  "Dimos",
  "Dionisis",
  "Doros",
  "Efthymios",
  "Elpidoforos",
  "Emmanouil",
  "Ermis",
  "Ermogenis",
  "Eugenios",
  "Eustathios",
  "Evripidis",
  "Filippos",
  "Fivos",
  "Fotios",
  "Fragkiskos",
  "Gavriel",
  "Gregoris",
  "Haralambos",
  "Haris",
  "Heraklis",
  "Iakovos",
  "Iason",
  "Ippokratis",
  "Isidoros",
  "Kleanthis",
  "Kostas",
  "Kyprianos",
  "Kyriakos",
  "Lambis",
  "Lambros",
  "Lazaros",
  "Lefkos",
  "Leon",
  "Leontios",
  "Loucas",
  "Louizos",
  "Loukis",
  "Makis",
  "Manos",
  "Manthos",
  "Markos",
  "Martinos",
  "Matthaios",
  "Melis",
  "Michail",
  "Mihalis",
  "Miltos",
  "Minas",
  "Nearchos",
  "Neoklis",
  "Nestor",
  "Nicos",
  "Odysseas",
  "Orestis",
  "Pambos",
  "Panos",
  "Pantelis",
  "Paris",
  "Parmenion",
  "Paschalis",
  "Petros",
  "Philippos",
  "Phivos",
  "Pieris",
  "Polycarpos",
  "Prodromos",
  "Rafail",
  "Renos",
  "Sakis",
  "Savvas",
  "Semos",
  "Sokratis",
  "Sotiris",
  "Spyridon",
  "Stavros",
  "Stefanos",
  "Stelios",
  "Stylianos",
  "Symeon",
  "Takis",
  "Tassos",
  "Thanasis",
  "Themistoklis",
  "Theodoros",
  "Theofanis",
  "Thomas",
  "Titos",
  "Tomas",
  "Vangelis",
  "Vasilis",
  "Vassilis",
  "Viktor",
  "Vlassis",
  "Xanthos",
  "Xenios",
  "Xenophon",
  "Yiannakis",
  "Yiannis",
  "Zinon",
  "Adam",
  "Alekos",
  "Alex",
  "Alexandros",
  "Alkis",
  "Anastasios",
  "Andreas",
  "Angelos",
  "Antonis",
  "Apostolos",
  "Aris",
  "Aristides",
  "Aristodemos",
  "Athanasios",
  "Charalampos",
  "Charis",
  "Christodoulos",
  "Christoforos",
  "Chrysanthos",
  "Demetrios",
  "Dionysios",
  "Doros",
  "Efthymios",
  "Eleftherios",
  "Emmanouil",
  "Ermis",
  "Eugenios",
  "Evangelos",
  "Filippos",
  "Fotios",
  "Georgios",
  "Giorgos",
  "Gregoris",
  "Haralambos",
  "Haris",
  "Heraklis",
  "Ilias",
  "Ioannis",
  "Ippokratis",
  "Kleanthis",
  "Konstantinos",
  "Kostas",
  "Kyriakos",
  "Lambros",
  "Leonidas",
  "Loukas",
  "Makarios",
  "Manolis",
  "Marinos",
  "Matthaios",
  "Michalis",
  "Miltos",
  "Neophytos",
  "Nikolaos",
  "Odysseas",
  "Orestis",
  "Panagiotis",
  "Pantelis",
  "Paraskevas",
  "Petros",
  "Philippos",
  "Rafail",
  "Sokratis",
  "Sotiris",
  "Spyridon",
  "Stavros",
  "Stefanos",
  "Stelios",
  "Stylianos",
  "Symeon",
  "Theodoros",
  "Thomas",
  "Timotheos",
  "Vassilis",
  "Xenophon",
  "Yiannis",
  "Zinon",
  "Achilleas",
  "Adonis",
  "Agapios",
  "Alexis",
  "Alkis",
  "Anastasios",
  "Andreas",
  "Angelos",
  "Antonis",
  "Apostolos",
  "Aris",
  "Aristides",
  "Athanasios",
  "Charalampos",
  "Christodoulos",
  "Christos",
  "Demetrios",
  "Dionysios",
  "Eleftherios",
  "Emmanouil",
  "Evangelos",
  "Filippos",
  "Fotios",
  "Georgios",
  "Giorgos",
  "Ilias",
  "Ioannis",
  "Konstantinos",
  "Kostas",
  "Kyriakos",
  "Lambros",
  "Leonidas",
  "Loukas",
  "Manolis",
  "Michalis",
  "Nikolaos",
  "Panagiotis",
  "Pantelis",
  "Petros",
  "Sotiris",
  "Spyridon",
  "Stavros",
  "Stelios",
  "Theodoros",
  "Thomas",
  "Vassilis",
  "Yiannis",
  "Zinon"
];
var GREEK_MALE_LASTNAMES = [
  "Papadopoulos",
  "Papadopoulou",
  "Georgiou",
  "Papageorgiou",
  "Nikolaou",
  "Ioannou",
  "Christodoulou",
  "Konstantinou",
  "Michailidis",
  "Panagiotou",
  "Dimitriou",
  "Alexandrou",
  "Vasilopoulos",
  "Kostas",
  "Spyropoulos",
  "Antoniou",
  "Stavropoulos",
  "Theodorou",
  "Pavlou",
  "Sotiriou",
  "Kyriakou",
  "Charalambous",
  "Evangelou",
  "Filippos",
  "Manolopoulos",
  "Lefteris",
  "Yiannis",
  "Andreas",
  "Theodoridis",
  "Panagiotidis",
  "Savvas",
  "Kyriakos",
  "Marios",
  "Stelios",
  "Lambrou",
  "Petridis",
  "Athanasiou",
  "Eleftheriou",
  "Panayiotou",
  "Christou",
  "Vasilou",
  "Markou",
  "Evangelou",
  "Paraskevas",
  "Stylianou",
  "Neophytou",
  "Kostas",
  "Louca",
  "Mavrou",
  "Hadjigeorgiou",
  "Hadjichristodoulou",
  "Hadjipavlou",
  "Hadjimichael",
  "Hadjinicolaou",
  "Hadjipetrou",
  "Hadjisavvas",
  "Hadjikostis",
  "Hadjimichael",
  "Hadjistyllis",
  "Hadjipetrou",
  "Andreou",
  "Antoniou",
  "Charalambous",
  "Christodoulou",
  "Constantinou",
  "Demetriou",
  "Eleftheriou",
  "Evangelou",
  "Georgiou",
  "Ioannou",
  "Kleanthous",
  "Kyriacou",
  "Lambrou",
  "Louca",
  "Markou",
  "Michael",
  "Nicolaou",
  "Panagiotou",
  "Papadopoulos",
  "Pavlou",
  "Petrides",
  "Savva",
  "Socratous",
  "Spyrou",
  "Stavrou",
  "Stylianou",
  "Theodorou",
  "Vasilou",
  "Zachariou",
  "Zenonos",
  "Agathangelou",
  "Alexandrou",
  "Anastasiou",
  "Aristidou",
  "Avraam",
  "Bakirtzis",
  "Charalambides",
  "Charitou",
  "Christofides",
  "Chrysanthou",
  "Chrysostomou",
  "Constantinides",
  "Demetriades",
  "Dimitriou",
  "Efthymiou",
  "Eliades",
  "Ellinas",
  "Erotokritou",
  "Fotiou",
  "Frangou",
  "Georgiadis",
  "Georgiades",
  "Gregoriou",
  "Hadjidemetriou",
  "Hadjinicolaou",
  "Hadjipavlou",
  "Hadjisavvas",
  "Hadjitheodorou",
  "Hadjikyriakou",
  "Iacovou",
  "Ioannides",
  "Kakoullis",
  "Kallis",
  "Kalogirou",
  "Karageorgiou",
  "Karamallis",
  "Katsaros",
  "Kleanthous",
  "Konstantinou",
  "Koumi",
  "Kourou",
  "Kyriakides",
  "Kyriakou",
  "Lambrou",
  "Leontiou",
  "Loizou",
  "Loucaides",
  "Makedonas",
  "Mallis",
  "Manoli",
  "Markides",
  "Matsas",
  "Mavrommatis",
  "Michaelides",
  "Mina",
  "Mitsis",
  "Moullos",
  "Neophytou",
  "Nikolaides",
  "Nikolaou",
  "Papageorgiou",
  "Papantoniou",
  "Paphitis",
  "Paraskevas",
  "Patsalides",
  "Pericleous",
  "Petrakis",
  "Philippou",
  "Pierides",
  "Pitsillides",
  "Polyviou",
  "Prodromou",
  "Psaltis",
  "Raptis",
  "Savidis",
  "Savvides",
  "Sideris",
  "Sofocleous",
  "Soteriou",
  "Stavrides",
  "Stylianides",
  "Symeou",
  "Symeonides",
  "Themistocleous",
  "Theocharous",
  "Theodorides",
  "Theofanous",
  "Tofarides",
  "Toma",
  "Tsiakkiros",
  "Tsikkos",
  "Tsolakis",
  "Varnava",
  "Vasileiou",
  "Vassiliou",
  "Xenophontos",
  "Yiallouris",
  "Zachariades",
  "Zembylas",
  "Zenios",
  "Zervos",
  "Adamopoulos",
  "Alexopoulos",
  "Anagnostou",
  "Anastasiadis",
  "Andreopoulos",
  "Angelopoulos",
  "Antoniadis",
  "Argyropoulos",
  "Athanasopoulos",
  "Christopoulos",
  "Diamantis",
  "Dimitriadis",
  "Economou",
  "Efthymiadis",
  "Fotiadis",
  "Georgiadis",
  "Giannakopoulos",
  "Giannopoulos",
  "Grigoriadis",
  "Hadjipavlou",
  "Ioannidis",
  "Kalogeropoulos",
  "Karagiannis",
  "Karamanlis",
  "Karamouzis",
  "Katsouris",
  "Kefalas",
  "Konstantinidis",
  "Kostopoulos",
  "Koulouris",
  "Kouris",
  "Kyriakidis",
  "Lazaridis",
  "Leontidis",
  "Makridis",
  "Manolakis",
  "Markopoulos",
  "Mavridis",
  "Michailidis",
  "Nikolaidis",
  "Panagiotidis",
  "Papadakis",
  "Papadimitriou",
  "Papakonstantinou",
  "Papathanasiou",
  "Pappas",
  "Paraskevopoulos",
  "Pavlidis",
  "Petridis",
  "Raptis",
  "Samaras",
  "Sideris",
  "Sotiropoulos",
  "Stavridis",
  "Stefanidis",
  "Stylianou",
  "Theodoridis",
  "Tsakiris",
  "Tsoukalas",
  "Vasilakis",
  "Vasilopoulos",
  "Vlachos",
  "Voulgaris",
  "Zafeiriou",
  "Zisis",
  "Zografos"
];

// resources/static_db/names/azerbaijani_data.ts
var AZERBAIJANI_MALE_FIRSTNAMES = [
  "Elchin",
  "Ramin",
  "Farid",
  "Ilgar",
  "Anar",
  "Rashad",
  "Eldar",
  "Tural",
  "Orkhan",
  "Fuad",
  "Vugar",
  "Emil",
  "Kamran",
  "Elman",
  "Rovshan",
  "Nizami",
  "Murad",
  "Eldaniz",
  "Aydin",
  "Samir",
  "Ilkin",
  "Rufat",
  "Zaur",
  "Elvin",
  "Nadir",
  "Sabir",
  "Vidadi",
  "Yusif",
  "Bakhtiyar",
  "Parviz",
  "Gurban",
  "Islam",
  "Rahman",
  "Seymur",
  "Tofig",
  "Vahid",
  "Zakir",
  "Arif",
  "Asif",
  "Bayram",
  "Chingiz",
  "Davud",
  "Emin",
  "Fikret",
  "Gafar",
  "Hikmet",
  "Isa",
  "Javid",
  "Kamal",
  "Latif",
  "Mahir",
  "Nabi",
  "Nijat",
  "Osman",
  "Rasim",
  "Sahil",
  "Tahir",
  "Ulvi",
  "Vasif",
  "Yasar",
  "Zeynal",
  "Abbas",
  "Adil",
  "Aghasi",
  "Akif",
  "Alakbar",
  "Alim",
  "Alish",
  "Allahverdi",
  "Amir",
  "Anvar",
  "Arastun",
  "Araz",
  "Arslan",
  "Ashraf",
  "Aydan",
  "Azer",
  "Babek",
  "Bahram",
  "Balagardash",
  "Barat",
  "Bahruz",
  "Bala",
  "Bilal",
  "Bunyad",
  "Ceyhun",
  "Dadash",
  "Dayanat",
  "Elbrus",
  "Elchin",
  "Eldar",
  "Elmir",
  "Elshan",
  "Elvin",
  "Emil",
  "Emin",
  "Elnur",
  "Elshan",
  "Elvin",
  "Emin",
  "Farhad",
  "Farman",
  "Fazil",
  "Fikret",
  "Firudin",
  "Fuad",
  "Gabil",
  "Gahraman",
  "Ganjali",
  "Garib",
  "Gazanfar",
  "Gulali",
  "Gulhuseyn",
  "Gurban",
  "Habil",
  "Hafiz",
  "Hajibala",
  "Hajimurad",
  "Hakim",
  "Hamid",
  "Hasan",
  "Heydar",
  "Hidayat",
  "Hikmat",
  "Huseyn",
  "Ibrahim",
  "Ilgar",
  "Ilham",
  "Ilkin",
  "Ilqar",
  "Imran",
  "Isa",
  "Isfandiyar",
  "Islam",
  "Ismayil",
  "Jabir",
  "Jahangir",
  "Jalal",
  "Jamil",
  "Javad",
  "Kamal",
  "Kamran",
  "Karim",
  "Khalid",
  "Khalil",
  "Khudayar",
  "Latif",
  "Mahammad",
  "Mahir",
  "Mammad",
  "Mansur",
  "Mehdi",
  "Meyxan",
  "Mikayil",
  "Mirza",
  "Mubariz",
  "Muhammed",
  "Musa",
  "Mustafa",
  "Nadir",
  "Nail",
  "Nariman",
  "Nazim",
  "Nijat",
  "Nizami",
  "Nurlan",
  "Nuraddin",
  "Nusret",
  "Ogtay",
  "Orkhan",
  "Osman",
  "Parviz",
  "Ramil",
  "Rashad",
  "Rauf",
  "Rovshan",
  "Rufat",
  "Ruslan",
  "Sabir",
  "Sahib",
  "Sahil",
  "Said",
  "Salim",
  "Samir",
  "Sanan",
  "Sarkhan",
  "Sattar",
  "Sevindik",
  "Shahbaz",
  "Shahriyar",
  "Shamil",
  "Shirin",
  "Shukur",
  "Tahir",
  "Talib",
  "Tofiq",
  "Tural",
  "Ulvi",
  "Umid",
  "Vagif",
  "Vahid",
  "Vakil",
  "Vali",
  "Vasif",
  "Vidadi",
  "Vugar",
  "Yadigar",
  "Yashar",
  "Yusif",
  "Zahid",
  "Zaur",
  "Zeynal",
  "Ziya",
  "Zohrab"
];
var AZERBAIJANI_MALE_LASTNAMES = [
  "Aliyev",
  "Huseynov",
  "Mammadov",
  "Hasanov",
  "Guliyev",
  "Ibrahimov",
  "Abbasov",
  "Rzayev",
  "Safarov",
  "Ahmadov",
  "Ismayilov",
  "Jafarov",
  "Rahimov",
  "Quliyev",
  "Hajiyev",
  "Musayev",
  "Seyidov",
  "Mirzayev",
  "Abdullayev",
  "Bayramov",
  "Nabiyev",
  "Aslanov",
  "Mammadli",
  "Qasimov",
  "Huseynli",
  "Orujov",
  "Salimov",
  "Karimov",
  "Farhadov",
  "Rustamov",
  "Aghayev",
  "Alasgarov",
  "Allahverdiyev",
  "Alizade",
  "Amirov",
  "Amiraslanov",
  "Arifov",
  "Asadov",
  "Asgarov",
  "Azerov",
  "Babayev",
  "Badalov",
  "Baghirov",
  "Bakhtiyarov",
  "Balayev",
  "Bayramli",
  "Bunyadov",
  "Dadashov",
  "Dayanov",
  "Eldarov",
  "Elchinov",
  "Emilov",
  "Farajov",
  "Fazli",
  "Gafarov",
  "Gahramanov",
  "Ganjaliyev",
  "Garayev",
  "Gasimov",
  "Guliyev",
  "Hajiyev",
  "Hakimzade",
  "Hamidov",
  "Hasanov",
  "Heydarov",
  "Hidayatzade",
  "Huseynov",
  "Ibrahimov",
  "Ilhamov",
  "Ilkinov",
  "Isayev",
  "Isfandiyarov",
  "Ismayilov",
  "Jabbarov",
  "Jafarov",
  "Jalilov",
  "Jamilov",
  "Javadov",
  "Kamalov",
  "Karimov",
  "Khalilov",
  "Khanlarov",
  "Khudaverdiyev",
  "Latifov",
  "Maharramov",
  "Mahmudov",
  "Mammadov",
  "Mansurov",
  "Mehraliyev",
  "Mehdiyev",
  "Mikayilov",
  "Mirzayev",
  "Mubarizov",
  "Muhammedov",
  "Muradov",
  "Mustafayev",
  "Nabiyev",
  "Nadirli",
  "Naghiyev",
  "Narimanov",
  "Nasibov",
  "Nazimov",
  "Nematov",
  "Niyazov",
  "Novruzov",
  "Nuriyev",
  "Nurlanov",
  "Orujov",
  "Osmanov",
  "Pashayev",
  "Qadirov",
  "Qahramanov",
  "Qarayev",
  "Qasimov",
  "Quliyev",
  "Rahimov",
  "Rasulov",
  "Rzayev",
  "Safarov",
  "Salimov",
  "Samadov",
  "Samedov",
  "Seyidov",
  "Shahbazov",
  "Shahverdiyev",
  "Shamilov",
  "Sharifov",
  "Shirinov",
  "Soltanov",
  "Suleymanov",
  "Taghiyev",
  "Tahirov",
  "Tahirli",
  "Talibov",
  "Turalov",
  "Usubov",
  "Vahabov",
  "Vahidov",
  "Vakilov",
  "Valiyev",
  "Vasifov",
  "Vidadiyev",
  "Vugarov",
  "Yadigarov",
  "Yagubov",
  "Yusifov",
  "Zahidov",
  "Zamanov",
  "Zeynalov",
  "Ziyadov",
  "Zohrabov",
  "Abbasli",
  "Abdullazade",
  "Aghalarov",
  "Ahmadli",
  "Akhundov",
  "Alakbarov",
  "Aliyev",
  "Allahverdiyev",
  "Almazov",
  "Amiraslanov",
  "Arzumanov",
  "Asgarov",
  "Aydinli",
  "Azimov",
  "Babazade",
  "Bagirov",
  "Bakhtiyarli",
  "Balayev",
  "Bayramov",
  "Dadashli",
  "Eldarov",
  "Elmanov",
  "Farajov",
  "Fikretov",
  "Gahramanli",
  "Garibov",
  "Guliyev",
  "Hajiyev",
  "Hasanli",
  "Huseynli",
  "Ibrahimli",
  "Ilgarli",
  "Ismayilzade",
  "Jabbarli",
  "Jafarli",
  "Kamilov",
  "Karimli",
  "Khalilli",
  "Khanov",
  "Khalafov",
  "Latifli",
  "Mahammadli",
  "Mammadli",
  "Mansimli",
  "Mehdiyev",
  "Mirzazade",
  "Mushfigov",
  "Mustafazade",
  "Nabiyev",
  "Nadirli",
  "Narimanli",
  "Nasirli",
  "Nazirli",
  "Novruzli",
  "Nurullayev",
  "Orujzade",
  "Pashazade",
  "Rahimli",
  "Rasulzade",
  "Rzayev",
  "Sabirzade",
  "Safarli",
  "Salimli",
  "Samadli",
  "Seyidli",
  "Shahbazli",
  "Shukurlu",
  "Soltanli",
  "Suleymanli",
  "Taghizade",
  "Tahirli",
  "Talibli",
  "Turalov",
  "Usubov",
  "Vagifov",
  "Vahabov",
  "Vahidli",
  "Valiyev",
  "Vasifli",
  "Vidadiyev",
  "Vugarli",
  "Yusifli",
  "Zahidov",
  "Zeynalov"
];

// resources/static_db/names/kazakh_data.ts
var KAZAKH_MALE_FIRSTNAMES = [
  "Aidar",
  "Aidos",
  "Aisultan",
  "Alikhan",
  "Alim",
  "Almas",
  "Almat",
  "Aman",
  "Amanat",
  "Amir",
  "Anuar",
  "Arlan",
  "Arman",
  "Arsen",
  "Arystan",
  "Asan",
  "Asat",
  "Askar",
  "Aslan",
  "Asset",
  "Ayan",
  "Azamat",
  "Azat",
  "Bakhyt",
  "Bakir",
  "Bakyt",
  "Bauyrzhan",
  "Bek",
  "Bekzat",
  "Berik",
  "Bolat",
  "Daniyar",
  "Daulet",
  "Dauren",
  "Dauyr",
  "Dias",
  "Dilmukhamed",
  "Dmitriy",
  "Dosym",
  "Edil",
  "Eldar",
  "Eldos",
  "Erbol",
  "Erbolat",
  "Erden",
  "Erdos",
  "Erlan",
  "Ermek",
  "Ermurat",
  "Ernar",
  "Ernur",
  "Ersultan",
  "Galym",
  "Galymzhan",
  "Gani",
  "Gulmurat",
  "Ilyas",
  "Islam",
  "Ismail",
  "Iskander",
  "Kairat",
  "Kaisar",
  "Kaldybek",
  "Kanat",
  "Karamat",
  "Kasym",
  "Kenes",
  "Kenzhebek",
  "Kuanysh",
  "Kuat",
  "Madi",
  "Madiyar",
  "Maksat",
  "Mansur",
  "Marat",
  "Margulan",
  "Miras",
  "Mirlan",
  "Murat",
  "Musa",
  "Nartay",
  "Nazar",
  "Nurlan",
  "Nursultan",
  "Nurtas",
  "Nurzhan",
  "Olzhas",
  "Omar",
  "Rakhat",
  "Ramazan",
  "Rasul",
  "Rauan",
  "Rinat",
  "Rishat",
  "Rustam",
  "Sadyk",
  "Sagynysh",
  "Saken",
  "Sanzhar",
  "Sapar",
  "Sardar",
  "Sarsen",
  "Sartay",
  "Serik",
  "Serikbay",
  "Serikzhan",
  "Shakhzod",
  "Shamil",
  "Shyngys",
  "Sultan",
  "Syrgak",
  "Tair",
  "Talgar",
  "Talip",
  "Tamerlan",
  "Taras",
  "Temir",
  "Temirlan",
  "Tengiz",
  "Timur",
  "Tolegen",
  "Toleu",
  "Tomas",
  "Tursyn",
  "Ulan",
  "Umar",
  "Yerbol",
  "Yerkebulan",
  "Yermek",
  "Yermurat",
  "Yernar",
  "Yernur",
  "Yersultan",
  "Yerzhan",
  "Yessen",
  "Yusup",
  "Zhanat",
  "Zhandos",
  "Zhanibek",
  "Zhanuzak",
  "Zhaslan",
  "Zhasulan",
  "Zhasur",
  "Zhassulan",
  "Zhasyr",
  "Zhetpis",
  "Zhomart",
  "Zhumas",
  "Zhyrgal",
  "Ziyad",
  "Abay",
  "Abzal",
  "Adil",
  "Adilet",
  "Adilzhan",
  "Aidos",
  "Akhmet",
  "Akmaral",
  "Aktan",
  "Alen",
  "Ali",
  "Alibek",
  "Alik",
  "Alisher",
  "Almas",
  "Altyn",
  "Amangeldy",
  "Amirzhan",
  "Anuarbek",
  "Ardak",
  "Arman",
  "Arsen",
  "Artyom",
  "Asanali",
  "Asel",
  "Askhat",
  "Aslanbek",
  "Aybek",
  "Aydar",
  "Ayman",
  "Aysultan",
  "Azamat",
  "Azat",
  "Bakhytzhan",
  "Bakir",
  "Baktybek",
  "Bauyrzhan",
  "Bekbolat",
  "Beknur",
  "Bekzat",
  "Berik",
  "Bolatbek",
  "Daniil",
  "Daniyar",
  "Darkhan",
  "Dauletbek",
  "Dauren",
  "Dauyrzhan",
  "Dias",
  "Dilmurat",
  "Dmitry",
  "Dos",
  "Duman",
  "Edige",
  "Eldar",
  "Elkhan",
  "Elman",
  "Elnur",
  "Eraly",
  "Erbolat",
  "Erdaulet",
  "Erden",
  "Erdos",
  "Erlan",
  "Ermek",
  "Ermurat",
  "Ernar",
  "Ernur",
  "Ersain",
  "Ersultan",
  "Erzhan",
  "Galym",
  "Gani",
  "Ibragim",
  "Ilias",
  "Ilyas",
  "Islam",
  "Ismail",
  "Kairat",
  "Kaisar",
  "Kanat",
  "Karamat",
  "Kasym",
  "Kenes",
  "Kenzhe",
  "Kuanysh",
  "Kuat",
  "Madi",
  "Madiyar",
  "Maksat",
  "Marat",
  "Margulan",
  "Miras",
  "Mirlan",
  "Murat",
  "Musa",
  "Nartay",
  "Nazar",
  "Nurlan",
  "Nursultan",
  "Nurtas",
  "Nurzhan",
  "Olzhas",
  "Omar",
  "Rakhat",
  "Ramazan",
  "Rasul",
  "Rauan",
  "Rinat",
  "Rishat",
  "Rustam",
  "Sagynysh",
  "Saken",
  "Sanzhar",
  "Sapar",
  "Sardar",
  "Serik",
  "Serikzhan",
  "Shakhzod",
  "Shamil",
  "Shyngys",
  "Sultan",
  "Syrgak",
  "Tair",
  "Talgar",
  "Talip",
  "Tamerlan",
  "Temir",
  "Temirlan",
  "Tengiz",
  "Timur",
  "Tolegen",
  "Tursyn",
  "Ulan",
  "Umar",
  "Yerbol",
  "Yerkebulan",
  "Yermek",
  "Yermurat",
  "Yernar",
  "Yernur",
  "Yersultan",
  "Yerzhan",
  "Yessen",
  "Yusup",
  "Zhanat",
  "Zhandos",
  "Zhanibek",
  "Zhaslan",
  "Zhasulan",
  "Zhasur",
  "Zhassulan",
  "Zhyrgal",
  "Ziyad"
];
var KAZAKH_MALE_LASTNAMES = [
  "Abdrakhmanov",
  "Abilov",
  "Akhmetov",
  "Akhmetzhanov",
  "Aliev",
  "Alimbekov",
  "Alimzhanov",
  "Altynbekov",
  "Amanov",
  "Amanzholov",
  "Amirbekov",
  "Amirkhanov",
  "Artykbayev",
  "Asanov",
  "Askarov",
  "Aslanov",
  "Aubakirov",
  "Auezov",
  "Auyezov",
  "Baimbetov",
  "Baimenov",
  "Baitursynov",
  "Baktybayev",
  "Balapanov",
  "Balgimbayev",
  "Balmagambetov",
  "Balmukhanov",
  "Baltabayev",
  "Batyrov",
  "Bauyrzhanov",
  "Bekbolatov",
  "Bekmuratov",
  "Bekov",
  "Bekzhanov",
  "Berdibekov",
  "Berdikulov",
  "Berdybekov",
  "Biyashev",
  "Bolatov",
  "Boranbayev",
  "Bozhbanov",
  "Burkitbayev",
  "Daulenov",
  "Dauletov",
  "Dauletbayev",
  "Dauletbekov",
  "Dauletov",
  "Doszhanov",
  "Duisenov",
  "Dusenov",
  "Elemesov",
  "Ermekov",
  "Ermolov",
  "Erzhanov",
  "Esengeldiyev",
  "Esenov",
  "Esirkepov",
  "Gabdullin",
  "Galiyev",
  "Gulimov",
  "Ibraev",
  "Ibragimov",
  "Ibrayev",
  "Ilyasov",
  "Imashev",
  "Isayev",
  "Iskakov",
  "Iskanderov",
  "Ismagulov",
  "Ismailov",
  "Jabayev",
  "Jaksybekov",
  "Jandarbekov",
  "Jangeldin",
  "Japarov",
  "Jumabaev",
  "Kabylbekov",
  "Kairatov",
  "Kairbekov",
  "Kaliev",
  "Kalmakhanov",
  "Kalmuratov",
  "Kamalov",
  "Kambarov",
  "Kambarov",
  "Kanagatov",
  "Kanatov",
  "Karashev",
  "Karimov",
  "Kasymov",
  "Kassymov",
  "Kenzhebayev",
  "Kenzhebekov",
  "Kenzhegulov",
  "Khamitov",
  "Khairullin",
  "Khasenov",
  "Khasenuly",
  "Khatimov",
  "Khozhamzharov",
  "Kozhakhmetov",
  "Kozhamkulov",
  "Kudaibergenov",
  "Kudaibergenuly",
  "Kulanov",
  "Kulmanov",
  "Kurmangaliyev",
  "Kusainov",
  "Kussainov",
  "Kydyrmanov",
  "Madenov",
  "Madiyev",
  "Maksutov",
  "Mamytov",
  "Maratov",
  "Mashrapov",
  "Mataev",
  "Matayev",
  "Mukhtarov",
  "Mukushev",
  "Muratov",
  "Mussin",
  "Mussinov",
  "Myrzabayev",
  "Myrzakhmetov",
  "Nabiyev",
  "Nurgaliyev",
  "Nurgazin",
  "Nurkasymov",
  "Nurkenov",
  "Nurlanov",
  "Nurlybayev",
  "Nurmoldin",
  "Nurmukhamedov",
  "Nurpeisov",
  "Nursultanov",
  "Nurymov",
  "Nusupov",
  "Omarov",
  "Orazbayev",
  "Orazov",
  "Orynbayev",
  "Orynbekov",
  "Ospanov",
  "Ospanuly",
  "Otegenov",
  "Otepbergenov",
  "Oteuliyev",
  "Otkeldiyev",
  "Otynshiyev",
  "Pavlov",
  "Rakhimov",
  "Rakhmanov",
  "Rakhmetov",
  "Ramazanov",
  "Ryskulov",
  "Sabirov",
  "Sadykov",
  "Sagimbayev",
  "Sagindykov",
  "Sakenov",
  "Salgaraev",
  "Salmaganbetov",
  "Salykov",
  "Samatov",
  "Saparov",
  "Sarbayev",
  "Sarsenbayev",
  "Sarsenov",
  "Sarybayev",
  "Satpayev",
  "Sautov",
  "Serikbayev",
  "Serikov",
  "Shaikenov",
  "Shaimardanov",
  "Shakenov",
  "Shalabayev",
  "Shamshiyev",
  "Sharipov",
  "Shayakhmetov",
  "Shaydullin",
  "Shaymerdenov",
  "Shegenov",
  "Shukurov",
  "Smailov",
  "Smagulov",
  "Smanov",
  "Smaylov",
  "Sultanov",
  "Sydykov",
  "Taimasov",
  "Tazhibayev",
  "Tazhiyev",
  "Temirbekov",
  "Temirgaliev",
  "Tleubayev",
  "Tleugabylov",
  "Tleulessov",
  "Tolegenov",
  "Toleuov",
  "Toleubayev",
  "Tulegenov",
  "Tulepov",
  "Tuleubayev",
  "Tursunov",
  "Ualiyev",
  "Ulanov",
  "Umarov",
  "Urazbayev",
  "Urazov",
  "Utegenov",
  "Uteuliyev",
  "Uzbekov",
  "Yakubov",
  "Yerzhanov",
  "Yessimov",
  "Yessengeldiyev",
  "Yessimov",
  "Yusupov",
  "Zhanabayev",
  "Zhanatov",
  "Zhandarbekov",
  "Zhanibekov",
  "Zhanuzakov",
  "Zhasuzakov",
  "Zhaylauov",
  "Zholdasov",
  "Zholdybayev",
  "Zhumashev",
  "Zhussupov",
  "Zhunisov",
  "Zhunusov",
  "Ziyabekov",
  "Zhumagaliyev",
  "Zhumabayev",
  "Zhumagulov",
  "Zhumaliev",
  "Zhumartov",
  "Zhumatov"
];

// resources/static_db/names/southamerican_data.ts
var SOUTH_AMERICAN_MALE_FIRSTNAMES = [
  "Mateo",
  "Santiago",
  "Lucas",
  "Liam",
  "Thiago",
  "Benjam\xEDn",
  "Gaspar",
  "Facundo",
  "Vicente",
  "Gael",
  "Mat\xEDas",
  "Sebasti\xE1n",
  "Alejandro",
  "Nicol\xE1s",
  "Mart\xEDn",
  "Emiliano",
  "Joaqu\xEDn",
  "Diego",
  "Gabriel",
  "Juan",
  "Jos\xE9",
  "Carlos",
  "Luis",
  "Jorge",
  "Miguel",
  "Roberto",
  "Pedro",
  "Francisco",
  "Antonio",
  "Andr\xE9s",
  "Pablo",
  "Fernando",
  "Ricardo",
  "Leonardo",
  "Gonzalo",
  "Hern\xE1n",
  "Ignacio",
  "Eduardo",
  "Marcelo",
  "Ra\xFAl",
  "Hugo",
  "Oscar",
  "Daniel",
  "Adri\xE1n",
  "Gustavo",
  "Sergio",
  "Ram\xF3n",
  "Esteban",
  "Mariano",
  "Claudio",
  "V\xEDctor",
  "Enrique",
  "Alberto",
  "Mauricio",
  "Rub\xE9n",
  "Patricio",
  "Cristian",
  "David",
  "Maximiliano",
  "Valent\xEDn",
  "Lautaro",
  "Franco",
  "Bruno",
  "Santino",
  "Felipe",
  "Matteo",
  "Noah",
  "Dante",
  "Jer\xF3nimo",
  "Tob\xEDas",
  "Ramiro",
  "Ezequiel",
  "Leandro",
  "Nahuel",
  "Alexis",
  "Brian",
  "C\xE9sar",
  "Dami\xE1n",
  "El\xEDas",
  "Fabio",
  "Gast\xF3n",
  "H\xE9ctor",
  "Iv\xE1n",
  "Julio",
  "Kevin",
  "Luciano",
  "Octavio",
  "Quint\xEDn",
  "Rodrigo",
  "Ulises",
  "Walter",
  "Xavier",
  "Yago",
  "Zacar\xEDas",
  "Abel",
  "Adolfo",
  "\xC1lvaro",
  "Amado",
  "An\xEDbal",
  "Armando",
  "Arturo",
  "Atilio",
  "Augusto",
  "Bartolom\xE9",
  "Bernardo",
  "Blas",
  "Braulio",
  "Camilo",
  "C\xE1ndido",
  "Crist\xF3bal",
  "Dar\xEDo",
  "Domingo",
  "Donato",
  "Edgardo",
  "Elio",
  "Emilio",
  "Ernesto",
  "Eugenio",
  "Fabian",
  "Fausto",
  "Ferm\xEDn",
  "Fidel",
  "Gerardo",
  "Germ\xE1n",
  "Gilberto",
  "Gregorio",
  "Guillermo",
  "Horacio",
  "Humberto",
  "Ismael",
  "Jacinto",
  "Jaime",
  "Jes\xFAs",
  "Justo",
  "Leopoldo",
  "Lino",
  "Lorenzo",
  "Manuel",
  "Marco",
  "Marcos",
  "Mario",
  "M\xE1ximo",
  "Milton",
  "Mois\xE9s",
  "N\xE9stor",
  "Norberto",
  "Omar",
  "Rafael",
  "Ren\xE9",
  "Rom\xE1n",
  "Rufino",
  "Salvador",
  "Sim\xF3n",
  "Teodoro",
  "Tom\xE1s",
  "Uriel",
  "Vicente",
  "Abelardo",
  "Adalberto",
  "Ad\xE1n",
  "Agust\xEDn",
  "Albano",
  "Alfonso",
  "Alfredo",
  "Alonso",
  "Amancio",
  "Anselmo",
  "Ariel",
  "Aurelio",
  "Baltasar",
  "Basilio",
  "Benito",
  "Bonifacio",
  "C\xE1ssio",
  "Celso",
  "C\xEDcero",
  "Constantino",
  "Crist\xF3v\xE3o",
  "Dami\xE3o",
  "D\xE9cio",
  "Dem\xE9trio",
  "Denis",
  "Dorival",
  "Du\xEDlio",
  "Durval",
  "Edilson",
  "Edmar",
  "Edmilson",
  "El\xE1dio",
  "El\xEDsio",
  "En\xE9as",
  "Evaristo",
  "Everaldo",
  "Expedito",
  "Feliciano",
  "F\xE9lix",
  "Firmino",
  "Flor\xEAncio",
  "Fortunato",
  "Franco",
  "Geraldo",
  "Get\xFAlio",
  "Gide\xE3o",
  "Glauber",
  "Glauco",
  "Gon\xE7alo",
  "Hamilton",
  "Haroldo",
  "Hermes",
  "Hil\xE1rio",
  "Ibrahim",
  "Idal\xEDcio",
  "In\xE1cio",
  "Irineu",
  "Isa\xEDas",
  "Israel",
  "Ivo",
  "Jackson",
  "Jair",
  "Jairo",
  "James",
  "J\xE2nio",
  "Jardel",
  "Jarbas",
  "Jeferson",
  "Jer\xF4nimo",
  "Jesu\xEDno",
  "Jonas",
  "Josu\xE9",
  "Joviano",
  "Juarez",
  "J\xFAlio",
  "Juraci",
  "Justiniano",
  "Juvenal",
  "Kl\xE9ber",
  "Laerte",
  "Lauro",
  "Le\xF4ncio",
  "L\xEDdio",
  "Maciel",
  "Manoel",
  "Martinho",
  "Melqu\xEDades",
  "Micael",
  "Moacir",
  "Nabor",
  "Nataniel",
  "N\xE9lio",
  "Newton",
  "Nicolau",
  "Nilo",
  "Nilton",
  "Nivaldo",
  "Olavo",
  "Ol\xEDmpio",
  "Onofre",
  "Oriovaldo",
  "Osman",
  "Osmar",
  "Osvaldo",
  "Otac\xEDlio",
  "Otoniel",
  "Ovaldo",
  "Ozeias",
  "Pascoal",
  "Patr\xEDcio",
  "Pel\xE9",
  "Percival",
  "P\xE9ricles",
  "Pierre",
  "Pl\xEDnio",
  "Policarpo",
  "Prudente",
  "Quintino",
  "Raimundo",
  "Ramiro",
  "Reginaldo",
  "Reinaldo",
  "Richard",
  "Robson",
  "Rodolfo",
  "Rog\xE9rio",
  "Rom\xE1rio",
  "R\xF4mulo",
  "Ronald",
  "Ronaldo",
  "Roque",
  "Rui",
  "Ruy",
  "S\xE1lvio",
  "Sandoval",
  "Saulo",
  "Severino",
  "Sidney",
  "Silas",
  "Silvestre",
  "Sime\xE3o",
  "S\xEDlvio",
  "Sotero",
  "Stanislau",
  "Tadeu",
  "Tarc\xEDsio",
  "Tasso",
  "Te\xF3filo",
  "Ter\xEAncio",
  "Thales",
  "Th\xE9o",
  "Thomas",
  "Thomaz",
  "Tib\xE9rio",
  "Tim\xF3teo",
  "Tobias",
  "Trist\xE3o",
  "Ubirajara",
  "Ubiratan",
  "Ulisses",
  "Urbano",
  "Valdemar",
  "Valdir",
  "Valter",
  "Vanderlei",
  "Vasco",
  "Ven\xE2ncio",
  "Venceslau",
  "Vidal",
  "Vin\xEDcius",
  "Virg\xEDlio",
  "V\xEDtor",
  "Wagner",
  "Waldemar",
  "Waldir",
  "Washington",
  "Wellington",
  "Wesley",
  "William",
  "Wilson",
  "Zeno",
  "Z\xE9",
  "Zeca",
  "Josue",
  "Edison",
  "Darwin",
  "Jairo",
  "Henry",
  "Edwin",
  "Jonathan",
  "Gary",
  "Michael",
  "Cristopher",
  "Erick",
  "Bryam",
  "Jefferson",
  "Byron",
  "Geovanny",
  "Andre",
  "Fabio",
  "Eduar",
  "Juan Manuel",
  "Alfredo",
  "Sebastian",
  "Ernesto",
  "Victor",
  "Pedro",
  "Walter",
  "Nemine",
  "Sonny",
  "Fernando",
  "Louis",
  "Charlie",
  "Jhonny",
  "Reginald",
  "Adonis",
  "Franklin",
  "Mario",
  "John",
  "Roy",
  "Kleber",
  "Will",
  "Angel",
  "Nicolas",
  "Robert",
  "Emilio",
  "Keysi",
  "Yandri",
  "Steven",
  "Pablo",
  "Jordy",
  "Adriel",
  "Isaac",
  "Eithan",
  "Enzo",
  "Luciano",
  "Mathias",
  "Marcelo",
  "Cristian",
  "Julian",
  "Simon",
  "Ian",
  "Amaro",
  "Leon",
  "Alonso",
  "Jose",
  "Cristobal",
  "Diego",
  "Juan",
  "Nicolas",
  "Sebastian",
  "Felipe",
  "Tomas"
];
var SOUTH_AMERICAN_MALE_LASTNAMES = [
  "Rodr\xEDguez",
  "G\xF3mez",
  "Gonz\xE1lez",
  "Mart\xEDnez",
  "Garc\xEDa",
  "L\xF3pez",
  "Hern\xE1ndez",
  "S\xE1nchez",
  "P\xE9rez",
  "Ram\xEDrez",
  "Torres",
  "Flores",
  "Morales",
  "Rojas",
  "Ortiz",
  "Silva",
  "Navarro",
  "Vargas",
  "Castro",
  "Mendoza",
  "Ruiz",
  "Jim\xE9nez",
  "Moreno",
  "\xC1lvarez",
  "Romero",
  "Fern\xE1ndez",
  "D\xEDaz",
  "Acosta",
  "Molina",
  "Su\xE1rez",
  "Delgado",
  "V\xE1zquez",
  "Cruz",
  "Castillo",
  "Sosa",
  "Vega",
  "Pereyra",
  "R\xEDos",
  "Luna",
  "Mu\xF1oz",
  "Blanco",
  "Soto",
  "Campos",
  "Ibarra",
  "Peralta",
  "Ben\xEDtez",
  "M\xE9ndez",
  "Ferrari",
  "Paz",
  "Godoy",
  "Carrizo",
  "Quiroga",
  "Rivera",
  "Cort\xE9s",
  "Cabrera",
  "Vera",
  "C\xE1ceres",
  "Figueroa",
  "Dom\xEDnguez",
  "Reyes",
  "Guerrero",
  "Montes",
  "Santana",
  "Maldonado",
  "Correa",
  "Valdez",
  "Espinoza",
  "M\xE1rquez",
  "Santos",
  "Ponce",
  "Villalba",
  "Arias",
  "Ojeda",
  "Salazar",
  "Miranda",
  "Leiva",
  "Barrios",
  "Galv\xE1n",
  "Aguilera",
  "P\xE1ez",
  "Escobar",
  "Montero",
  "Alonso",
  "Contreras",
  "Barreto",
  "Duarte",
  "Palacios",
  "Serrano",
  "Pe\xF1a",
  "Carrasco",
  "Gallardo",
  "Rueda",
  "Vidal",
  "Arce",
  "Guzm\xE1n",
  "Fuentes",
  "Salas",
  "Vallejos",
  "Coronel",
  "Bustos",
  "Ledesma",
  "Franco",
  "Cardozo",
  "Lucero",
  "Nieto",
  "Rold\xE1n",
  "Villanueva",
  "Sandoval",
  "Z\xE1rate",
  "Bianchi",
  "Morel",
  "Lombardi",
  "Russo",
  "Romano",
  "Marino",
  "Conte",
  "Bruno",
  "Rossi",
  "Moretti",
  "Esp\xF3sito",
  "De Luca",
  "Rizzo",
  "Barbieri",
  "Colombo",
  "Gallo",
  "Gentile",
  "Greco",
  "Marchetti",
  "Martini",
  "Mazza",
  "Monti",
  "Neri",
  "Orlando",
  "Pellegrini",
  "Ricci",
  "Rinaldi",
  "Santoro",
  "Serra",
  "Sorrentino",
  "Valentini",
  "Vitale",
  "Abad",
  "Aguilar",
  "Andrade",
  "Arrieta",
  "B\xE1ez",
  "Battaglia",
  "Beltr\xE1n",
  "Berm\xFAdez",
  "Bogado",
  "Bonifacio",
  "Bord\xF3n",
  "Brizuela",
  "Calder\xF3n",
  "C\xE1mera",
  "Cantero",
  "Casco",
  "Cejas",
  "Centuri\xF3n",
  "Ch\xE1vez",
  "Corval\xE1n",
  "Crespo",
  "De la Cruz",
  "Encina",
  "Esp\xEDnola",
  "Falc\xF3n",
  "Far\xEDas",
  "Ferreira",
  "Galarza",
  "Gim\xE9nez",
  "Guerra",
  "Heredia",
  "Insfr\xE1n",
  "Jara",
  "Lencina",
  "Lozano",
  "Lugo",
  "Mar\xEDn",
  "Merlo",
  "Montiel",
  "N\xFA\xF1ez",
  "Oliva",
  "Oviedo",
  "Paredes",
  "Portillo",
  "Qui\xF1ones",
  "Rivero",
  "Tapia",
  "Zelaya",
  "Quispe",
  "Mamani",
  "Araya",
  "Vergara",
  "Z\xFA\xF1iga",
  "Jaramillo",
  "Restrepo",
  "Montoya",
  "Valencia",
  "Giraldo",
  "Pab\xF3n",
  "Ramos",
  "Le\xF3n",
  "Soto",
  "Cruz",
  "Torres",
  "Ortiz",
  "Medina",
  "Herrera",
  "Gutierrez",
  "Ch\xE1vez",
  "Reyes",
  "Morales",
  "Vargas",
  "Castro",
  "Flores",
  "Rojas",
  "Acosta",
  "Molina",
  "Su\xE1rez",
  "Delgado",
  "V\xE1zquez",
  "Castillo",
  "Sosa",
  "Vega",
  "Pereyra",
  "R\xEDos",
  "Luna",
  "Mu\xF1oz",
  "Blanco",
  "Campos",
  "Ibarra",
  "Peralta",
  "Ben\xEDtez",
  "M\xE9ndez",
  "Paz",
  "Godoy",
  "Quiroga",
  "Rivera",
  "Cort\xE9s",
  "Cabrera",
  "Vera",
  "Figueroa",
  "Dom\xEDnguez",
  "Reyes",
  "Guerrero",
  "Santana",
  "Maldonado",
  "Correa",
  "Valdez",
  "Espinoza",
  "M\xE1rquez",
  "Ponce",
  "Arias",
  "Ojeda",
  "Salazar",
  "Miranda",
  "Leiva",
  "Barrios",
  "Galv\xE1n",
  "Escobar",
  "Montero",
  "Contreras",
  "Duarte",
  "Palacios",
  "Serrano",
  "Pe\xF1a",
  "Carrasco",
  "Gallardo",
  "Vidal",
  "Guzm\xE1n",
  "Fuentes",
  "Salas",
  "Bustos",
  "Ledesma",
  "Franco",
  "Lucero",
  "Nieto",
  "Rold\xE1n",
  "Sandoval",
  "Z\xE1rate",
  "Abad",
  "Aguilar",
  "Andrade",
  "B\xE1ez",
  "Beltr\xE1n",
  "Calder\xF3n",
  "Ch\xE1vez",
  "Crespo",
  "Far\xEDas",
  "Gim\xE9nez",
  "Heredia",
  "Jara",
  "Lozano",
  "Mar\xEDn",
  "Montiel",
  "N\xFA\xF1ez",
  "Oliva",
  "Paredes",
  "Tapia",
  "Zelaya",
  "Quispe",
  "Mamani",
  "Araya",
  "Vergara",
  "Jaramillo",
  "Restrepo",
  "Montoya",
  "Valencia",
  "Giraldo",
  "Pab\xF3n",
  "Le\xF3n",
  "Medina",
  "Herrera",
  "Gutierrez",
  "Ramos",
  "Cruz",
  "Torres",
  "Ortiz",
  "Vargas",
  "Flores",
  "Rojas",
  "Acosta",
  "Molina",
  "Su\xE1rez",
  "Delgado",
  "V\xE1zquez",
  "Castillo",
  "Sosa",
  "Vega",
  "Pereyra",
  "R\xEDos",
  "Luna",
  "Mu\xF1oz",
  "Blanco",
  "Campos",
  "Ibarra",
  "Peralta",
  "Ben\xEDtez",
  "M\xE9ndez",
  "Paz",
  "Godoy",
  "Quiroga",
  "Rivera",
  "Cort\xE9s",
  "Cabrera",
  "Vera",
  "Figueroa",
  "Dom\xEDnguez",
  "Reyes",
  "Guerrero",
  "Santana",
  "Maldonado",
  "Correa",
  "Valdez",
  "Espinoza",
  "M\xE1rquez",
  "Ponce",
  "Arias",
  "Ojeda",
  "Salazar",
  "Miranda",
  "Leiva",
  "Barrios",
  "Galv\xE1n",
  "Escobar",
  "Montero",
  "Contreras",
  "Duarte",
  "Palacios",
  "Serrano",
  "Pe\xF1a",
  "Carrasco",
  "Gallardo",
  "Vidal",
  "Guzm\xE1n",
  "Fuentes",
  "Salas",
  "Bustos",
  "Ledesma",
  "Franco",
  "Lucero",
  "Nieto",
  "Rold\xE1n",
  "Sandoval",
  "Z\xE1rate"
];

// resources/static_db/names/mexican_data.ts
var MEXICAN_MALE_FIRSTNAMES = [
  "Santiago",
  "Mateo",
  "Sebasti\xE1n",
  "Leonardo",
  "Emiliano",
  "Mat\xEDas",
  "Diego",
  "Daniel",
  "Alejandro",
  "Miguel",
  "Liam",
  "Thiago",
  "Gael",
  "Noah",
  "Alexander",
  "Jes\xFAs",
  "\xC1ngel",
  "David",
  "Emmanuel",
  "Luis",
  "Rodrigo",
  "Fernando",
  "Maximiliano",
  "Jos\xE9",
  "Gabriel",
  "Eduardo",
  "Juan",
  "Rafael",
  "Isaac",
  "Samuel",
  "Axel",
  "Nicol\xE1s",
  "Emilio",
  "Dami\xE1n",
  "Leonel",
  "El\xEDas",
  "Ricardo",
  "Adri\xE1n",
  "Mauricio",
  "Antonio",
  "Alan",
  "Jonathan",
  "Francisco",
  "Carlos",
  "Juan Pablo",
  "Miguel \xC1ngel",
  "Jos\xE9 \xC1ngel",
  "Jos\xE9 Luis",
  "Luis \xC1ngel",
  "Valent\xEDn",
  "Lucas",
  "Benjam\xEDn",
  "Joaqu\xEDn",
  "Andr\xE9s",
  "Pablo",
  "Hugo",
  "Alonso",
  "Jorge",
  "Manuel",
  "Pedro",
  "Enrique",
  "Felipe",
  "Arturo",
  "Oscar",
  "Erick",
  "Fabian",
  "Gustavo",
  "Salvador",
  "Gerardo",
  "Ram\xF3n",
  "Armando",
  "H\xE9ctor",
  "Roberto",
  "V\xEDctor",
  "Alberto",
  "Mario",
  "Iker",
  "Bruno",
  "Juli\xE1n",
  "Andr\xE9s",
  "Rafael",
  "Axel",
  "Iv\xE1n",
  "Mauricio",
  "Dante",
  "Camilo",
  "Fabi\xE1n",
  "Rodrigo",
  "Samuel",
  "Emilio",
  "Alejandro",
  "Fernando",
  "Mart\xEDn",
  "Lorenzo",
  "Tom\xE1s",
  "Agust\xEDn",
  "Ignacio",
  "\xC1lvaro",
  "Cristian",
  "Esteban",
  "Francisco Javier",
  "Guillermo",
  "H\xE9ctor",
  "Ismael",
  "Javier",
  "Kevin",
  "Luis Fernando",
  "Marco",
  "Nicol\xE1s",
  "Orlando",
  "Patricio",
  "Quint\xEDn",
  "Ra\xFAl",
  "Sergio",
  "Tom\xE1s",
  "Ulises",
  "Vicente",
  "Xavier",
  "Yair",
  "Zacar\xEDas",
  "Ad\xE1n",
  "Braulio",
  "C\xE9sar",
  "Domingo",
  "Ernesto",
  "Fidel",
  "Gonzalo",
  "Hugo",
  "Israel",
  "Jaime",
  "Kelvin",
  "L\xE1zaro",
  "Marcelo",
  "Norberto",
  "Octavio",
  "Pascual",
  "Quintiliano",
  "Renato",
  "Sim\xF3n",
  "Teodoro",
  "Uriel",
  "Valerio",
  "Wilfredo",
  "Ximeno",
  "Yeray",
  "Zacarias"
];
var MEXICAN_MALE_LASTNAMES = [
  "Hern\xE1ndez",
  "Garc\xEDa",
  "Mart\xEDnez",
  "Gonz\xE1lez",
  "L\xF3pez",
  "Rodr\xEDguez",
  "P\xE9rez",
  "S\xE1nchez",
  "Ram\xEDrez",
  "Flores",
  "Cruz",
  "G\xF3mez",
  "D\xEDaz",
  "Morales",
  "Ortiz",
  "Torres",
  "Reyes",
  "Jim\xE9nez",
  "Ruiz",
  "V\xE1zquez",
  "Castillo",
  "Mendoza",
  "Guerrero",
  "\xC1lvarez",
  "Romero",
  "Herrera",
  "Medina",
  "Aguilar",
  "Castro",
  "Vargas",
  "Rivera",
  "Silva",
  "Ramos",
  "Navarro",
  "Molina",
  "Delgado",
  "Campos",
  "Rojas",
  "Vel\xE1zquez",
  "Soto",
  "Cabrera",
  "Pe\xF1a",
  "Sol\xEDs",
  "Santos",
  "Mora",
  "Contreras",
  "Estrada",
  "N\xFA\xF1ez",
  "Figueroa",
  "M\xE9ndez",
  "Ch\xE1vez",
  "Vega",
  "Guadarrama",
  "Ibarra",
  "Ju\xE1rez",
  "Salazar",
  "Trevi\xF1o",
  "Zamora",
  "Cort\xE9s",
  "Lara",
  "Pacheco",
  "Dom\xEDnguez",
  "Carrillo",
  "\xC1vila",
  "Fuentes",
  "Espinoza",
  "R\xEDos",
  "Valdez",
  "Aguirre",
  "Salinas",
  "Acosta",
  "Gallegos",
  "Barrera",
  "Padilla",
  "Rosales",
  "Escobar",
  "Miranda",
  "Serrano",
  "Villarreal",
  "Rangel",
  "Guti\xE9rrez",
  "Alvarado",
  "Olivares",
  "Sandoval",
  "Pineda",
  "Mej\xEDa",
  "Arellano",
  "Cervantes",
  "Le\xF3n",
  "Galv\xE1n",
  "Tapia",
  "Sosa",
  "Blanco",
  "Valencia",
  "Z\xFA\xF1iga",
  "Cano",
  "Rico",
  "Quiroz",
  "Palacios",
  "Arroyo",
  "Calder\xF3n",
  "Bautista",
  "Ochoa",
  "Luna",
  "Montoya",
  "Orozco",
  "Santana",
  "Valladares",
  "Su\xE1rez",
  "Armenta",
  "Berm\xFAdez",
  "C\xE1rdenas",
  "Corona",
  "Duarte",
  "Escalante",
  "Fajardo",
  "Guzm\xE1n",
  "Huerta",
  "Islas",
  "Lozano",
  "Mar\xEDn",
  "Nava",
  "Ponce",
  "Quintana",
  "Robles",
  "Salgado",
  "Toledo",
  "Uribe",
  "Vera",
  "Zavala",
  "Aranda",
  "Beltr\xE1n",
  "Cordero",
  "D\xE1vila",
  "Espinosa",
  "Fierro",
  "G\xE1lvez",
  "Hidalgo",
  "I\xF1iguez",
  "Jaramillo",
  "Landeros",
  "Mac\xEDas",
  "Nieto",
  "Olvera",
  "Peralta",
  "Quezada",
  "Rivas",
  "Saucedo",
  "T\xE9llez",
  "Urrutia",
  "Villanueva",
  "Xochitl",
  "Y\xE1\xF1ez",
  "Zepeda"
];

// resources/static_db/names/oceanian_data.ts
var OCEANIAN_MALE_FIRSTNAMES = [
  "Oliver",
  "Noah",
  "Jack",
  "William",
  "Leo",
  "Lucas",
  "Henry",
  "Charlie",
  "Thomas",
  "James",
  "Liam",
  "Alexander",
  "Harrison",
  "Ethan",
  "Mason",
  "Lachlan",
  "Hunter",
  "Arlo",
  "Hugo",
  "Cooper",
  "Oscar",
  "Elijah",
  "Hudson",
  "Archie",
  "Levi",
  "Luca",
  "Theodore",
  "Benjamin",
  "Samuel",
  "Daniel",
  "Matthew",
  "Michael",
  "David",
  "Joseph",
  "John",
  "Robert",
  "George",
  "Arthur",
  "Ryan",
  "Jacob",
  "Joshua",
  "Luke",
  "Isaac",
  "Sebastian",
  "Xavier",
  "Kai",
  "Malakai",
  "Koa",
  "Manaia",
  "Ariki",
  "Te Ariki",
  "Sione",
  "Tevita",
  "Viliami",
  "Paula",
  "Etuate",
  "Keanu",
  "Tai",
  "Kainoa",
  "Lani",
  "Moana",
  "Tane",
  "Wiremu",
  "Anaru",
  "Nikau",
  "Aroha",
  "Mana",
  "Rangi",
  "Tama",
  "Atamai",
  "Kelekolio",
  "Malachi",
  "Jone",
  "Mohammed",
  "John",
  "Peter",
  "Thomas",
  "James",
  "Michael",
  "David",
  "Joseph",
  "Matthew",
  "Andrew",
  "Mark",
  "Luke",
  "Paul",
  "Steven",
  "Daniel",
  "Christopher",
  "Joshua",
  "Ryan",
  "Ethan",
  "Jacob",
  "Samuel",
  "Benjamin",
  "William",
  "Henry",
  "Jack",
  "Oliver",
  "Noah",
  "Leo",
  "Lucas",
  "Charlie",
  "Thomas",
  "James",
  "Liam",
  "Alexander",
  "Harrison",
  "Mason",
  "Lachlan",
  "Hunter",
  "Arlo",
  "Hugo",
  "Cooper",
  "Oscar",
  "Elijah",
  "Hudson",
  "Archie",
  "Levi",
  "Luca",
  "Theodore",
  "Benjamin",
  "Samuel",
  "Daniel",
  "Matthew",
  "Michael",
  "David",
  "Joseph",
  "John",
  "Robert",
  "George",
  "Arthur",
  "Ryan",
  "Jacob",
  "Joshua",
  "Luke",
  "Isaac",
  "Sebastian",
  "Xavier",
  "Kai",
  "Malakai",
  "Koa",
  "Manaia",
  "Ariki",
  "Te Ariki",
  "Sione",
  "Tevita",
  "Viliami",
  "Paula",
  "Etuate",
  "Keanu",
  "Tai",
  "Kainoa",
  "Lani",
  "Tane",
  "Wiremu",
  "Anaru",
  "Nikau",
  "Rangi",
  "Tama",
  "Atamai",
  "Kelekolio",
  "Jone",
  "Peter",
  "Thomas",
  "James",
  "Michael",
  "David",
  "Joseph",
  "Matthew",
  "Andrew",
  "Mark",
  "Luke",
  "Paul",
  "Steven",
  "Daniel",
  "Christopher",
  "Joshua",
  "Ryan",
  "Ethan",
  "Jacob",
  "Samuel",
  "Benjamin",
  "William",
  "Henry",
  "Jack",
  "Oliver",
  "Noah",
  "Leo",
  "Lucas",
  "Charlie",
  "Thomas",
  "James",
  "Liam",
  "Alexander",
  "Harrison",
  "Mason",
  "Lachlan",
  "Hunter",
  "Arlo",
  "Hugo",
  "Cooper",
  "Oscar",
  "Elijah",
  "Hudson",
  "Archie",
  "Levi",
  "Luca",
  "Theodore",
  "Benjamin",
  "Samuel",
  "Daniel",
  "Matthew",
  "Michael",
  "David",
  "Joseph",
  "John",
  "Robert",
  "George",
  "Arthur",
  "Ryan",
  "Jacob",
  "Joshua",
  "Luke",
  "Isaac",
  "Sebastian",
  "Xavier",
  "Kai",
  "Malakai",
  "Koa",
  "Manaia",
  "Ariki",
  "Te Ariki",
  "Sione",
  "Tevita",
  "Viliami",
  "Paula",
  "Etuate",
  "Keanu",
  "Tai",
  "Kainoa",
  "Tane",
  "Wiremu",
  "Anaru",
  "Nikau",
  "Rangi",
  "Tama",
  "Atamai",
  "Kelekolio",
  "Mana",
  "Moana",
  "Aroha",
  "Ranginui",
  "Kiwa",
  "Kawe",
  "Te Koha",
  "Taniora",
  "Manuka",
  "Ahi",
  "Ari",
  "Matiu",
  "Wiremu",
  "Hemi",
  "Tama",
  "Kahu",
  "Rua",
  "Tahu",
  "Teina",
  "Whaka",
  "Mikaere",
  "Rawiri",
  "Hirini",
  "Hohepa",
  "Rewi",
  "Tawhiri",
  "Kereama",
  "Maui",
  "Kupe",
  "Tonga",
  "Samoa",
  "Fiji",
  "Vanuatu",
  "Solomon",
  "Brandon",
  "Caleb",
  "Eddie",
  "Rex",
  "Clinton",
  "Ryan",
  "Daniel",
  "Michael",
  "David",
  "John",
  "Shaun",
  "Bobby",
  "Fabian",
  "Arnold",
  "Nelson",
  "Jesse",
  "Danny",
  "Spencer",
  "Damien",
  "Jackson",
  "Mike",
  "Patrick",
  "Samson",
  "Elvis",
  "Perry",
  "Nigel",
  "Marc",
  "Ben",
  "Greydon",
  "Nollen",
  "Iven",
  "Oko",
  "Silkarni",
  "Paka"
];
var OCEANIAN_MALE_LASTNAMES = [
  "Smith",
  "Jones",
  "Williams",
  "Brown",
  "Wilson",
  "Taylor",
  "Johnson",
  "White",
  "Martin",
  "Anderson",
  "Thompson",
  "Jackson",
  "Harris",
  "Thomas",
  "Clark",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Green",
  "Baker",
  "Adams",
  "Nelson",
  "Hill",
  "Campbell",
  "Mitchell",
  "Roberts",
  "Carter",
  "Phillips",
  "Evans",
  "Turner",
  "Collins",
  "Edwards",
  "Stewart",
  "Morris",
  "Murphy",
  "Cook",
  "Rogers",
  "Morgan",
  "Peterson",
  "Cooper",
  "Reed",
  "Bailey",
  "Bell",
  "Kelly",
  "Howard",
  "Ward",
  "Cox",
  "Richardson",
  "Watson",
  "Brooks",
  "Wood",
  "James",
  "Bennett",
  "Gray",
  "Hughes",
  "Price",
  "Foster",
  "Sanders",
  "Ross",
  "Powell",
  "Long",
  "Perry",
  "Russell",
  "Henderson",
  "Coleman",
  "Jenkins",
  "Perry",
  "Powell",
  "Long",
  "Patterson",
  "Hughes",
  "Flores",
  "Washington",
  "Butler",
  "Simmons",
  "Foster",
  "Gonzalez",
  "Bryant",
  "Alexander",
  "Russell",
  "Griffin",
  "Diaz",
  "Hayes",
  "Myers",
  "Ford",
  "Hamilton",
  "Graham",
  "Sullivan",
  "Wallace",
  "Woods",
  "Cole",
  "West",
  "Jordan",
  "Owens",
  "Reynolds",
  "Fisher",
  "Ellis",
  "Harrison",
  "Gibson",
  "Mcdonald",
  "Cruz",
  "Marshall",
  "Ortiz",
  "Gomez",
  "Murray",
  "Freeman",
  "Wells",
  "Webb",
  "Simpson",
  "Stevens",
  "Tucker",
  "Porter",
  "Hunter",
  "Hicks",
  "Crawford",
  "Henry",
  "Boyd",
  "Mason",
  "Morales",
  "Kennedy",
  "Warren",
  "Dixon",
  "Ramos",
  "Reyes",
  "Burns",
  "Gordon",
  "Shaw",
  "Holmes",
  "Rice",
  "Robertson",
  "Hunt",
  "Black",
  "Daniels",
  "Palmer",
  "Mills",
  "Nichols",
  "Grant",
  "Knight",
  "Ferguson",
  "Rose",
  "Stone",
  "Hawkins",
  "Dunn",
  "Perkins",
  "Hudson",
  "Spencer",
  "Gardner",
  "Stephens",
  "Payne",
  "Pierce",
  "Berry",
  "Matthews",
  "Arnold",
  "Wagner",
  "Willis",
  "Ray",
  "Watkins",
  "Olson",
  "Carroll",
  "Duncan",
  "Snyder",
  "Hart",
  "Cunningham",
  "Bradley",
  "Lane",
  "Andrews",
  "Ruiz",
  "Harper",
  "Fox",
  "Riley",
  "Armstrong",
  "Carpenter",
  "Weaver",
  "Greene",
  "Lawrence",
  "Elliott",
  "Chavez",
  "Sims",
  "Austin",
  "Peters",
  "Kelley",
  "Franklin",
  "Lawson",
  "Fields",
  "Gutierrez",
  "Ryan",
  "Schmidt",
  "Carr",
  "Vasquez",
  "Castillo",
  "Wheeler",
  "Chapman",
  "Oliver",
  "Montgomery",
  "Richards",
  "Williamson",
  "Johnston",
  "Banks",
  "Meyer",
  "Bishop",
  "Mccoy",
  "Howell",
  "Alvarez",
  "Morrison",
  "Hansen",
  "Fernandez",
  "Garza",
  "Harvey",
  "Little",
  "Burton",
  "Stanley",
  "Nguyen",
  "George",
  "Jacobs",
  "Reid",
  "Kim",
  "Fuller",
  "Lynch",
  "Dean",
  "Gilbert",
  "Garrett",
  "Romero",
  "Welch",
  "Larson",
  "Frazier",
  "Burke",
  "Hanson",
  "Day",
  "Mendoza",
  "Moreno",
  "Bowman",
  "Medina",
  "Fowler",
  "Brewer",
  "Hoffman",
  "Carlson",
  "Silva",
  "Pearson",
  "Holland",
  "Douglas",
  "Fleming",
  "Jensen",
  "Vargas",
  "Byrd",
  "Davidson",
  "Hopkins",
  "May",
  "Terrell",
  "Terry",
  "Herrera",
  "Wade",
  "Soto",
  "Walters",
  "Curtis",
  "Neal",
  "Caldwell",
  "Lowe",
  "Jennings",
  "Barnett",
  "Graves",
  "Jimenez",
  "Horton",
  "Shelton",
  "Barrett",
  "Obrien",
  "Castro",
  "Sutton",
  "Gregory",
  "Mckinney",
  "Lucas",
  "Miles",
  "Craig",
  "Rodriquez",
  "Chambers",
  "Holt",
  "Lambert",
  "Fletcher",
  "Watts",
  "Bates",
  "Hale",
  "Rhodes",
  "Pena",
  "Beck",
  "Newman",
  "Haynes",
  "McDaniel",
  "Mendez",
  "Bush",
  "Vaughn",
  "Parks",
  "Dawson",
  "Santiago",
  "Norris",
  "Hardy",
  "Love",
  "Steele",
  "Curry",
  "Powers",
  "Schultz",
  "Barker",
  "Guzman",
  "Page",
  "Munoz",
  "Ball",
  "Keller",
  "Chandler",
  "Weber",
  "Leonard",
  "Walsh",
  "Lyons",
  "Ramsey",
  "Wolfe",
  "Schneider",
  "Mullins",
  "Benson",
  "Sharp",
  "Bowen",
  "Daniel",
  "Barber",
  "Cummings",
  "Hines",
  "Baldwin",
  "Griffith",
  "Valdez",
  "Hubbard",
  "Salazar",
  "Reeves",
  "Warner",
  "Stevenson",
  "Burgess",
  "Santos",
  "Tate",
  "Cross",
  "Garner",
  "Mann",
  "Mack",
  "Moss",
  "Thornton",
  "Dennis",
  "Mcgee",
  "Farmer",
  "Delacruz",
  "Little",
  "Walton",
  "Bates",
  "John",
  "Peter",
  "Thomas",
  "James",
  "Paul",
  "Mark",
  "Luke",
  "Matthew",
  "Andrew",
  "Joseph",
  "David",
  "Michael",
  "Steven",
  "Christopher",
  "Daniel",
  "Joshua",
  "Ryan",
  "Jacob",
  "Nicholas",
  "Tyler",
  "Brandon",
  "Austin",
  "Benjamin",
  "Samuel",
  "Nathan",
  "Logan",
  "Christian",
  "Jonathan",
  "Caleb",
  "Dylan",
  "Isaac",
  "Gavin",
  "Jackson",
  "Eli",
  "Jordan",
  "Hunter",
  "Luke",
  "Angel",
  "Kevin",
  "Jack",
  "Cody",
  "Asher",
  "Cameron",
  "Chase",
  "Cooper",
  "Xavier",
  "Parker",
  "Jace",
  "Miles",
  "Blake",
  "Aiden",
  "Leo",
  "Theo",
  "Kai",
  "Malakai",
  "Koa",
  "Manaia",
  "Ariki",
  "Te Ariki",
  "Sione",
  "Tevita",
  "Viliami",
  "Paula",
  "Etuate",
  "Keanu",
  "Tai",
  "Kainoa",
  "Tane",
  "Wiremu",
  "Anaru",
  "Nikau",
  "Rangi",
  "Tama",
  "Atamai",
  "Kelekolio",
  "Aiono",
  "Faamausili",
  "Fatialofa",
  "Fepuleai",
  "Fuamatu",
  "Laulala",
  "Lealamanua",
  "Nuuausala",
  "Palamo",
  "Palepoi",
  "Salavea",
  "Savea",
  "Vaai",
  "Tuilaepa",
  "Ah Mu",
  "Alofaituli",
  "Faleafa",
  "Gatoloai",
  "Singh",
  "Kaur",
  "Patel",
  "Kumar",
  "Sharma",
  "Wong",
  "Lee",
  "Chen",
  "Zhang",
  "Liu",
  "Li",
  "Wang",
  "Yang",
  "Maori",
  "Tawhiri",
  "Te Hira",
  "Mabo",
  "Fatnowna",
  "Lui",
  "Mose",
  "Solomon",
  "Tonga",
  "Saukuru",
  "Quakawoot",
  "Mussing",
  "Minniecon",
  "Budby"
];

// resources/static_db/names/northamerican_data.ts
var NORTH_AMERICAN_MALE_FIRSTNAMES = [
  "James",
  "John",
  "Robert",
  "Michael",
  "William",
  "David",
  "Richard",
  "Joseph",
  "Thomas",
  "Charles",
  "Christopher",
  "Daniel",
  "Matthew",
  "Anthony",
  "Mark",
  "Paul",
  "Steven",
  "Andrew",
  "Kenneth",
  "Joshua",
  "Kevin",
  "Brian",
  "George",
  "Edward",
  "Ronald",
  "Timothy",
  "Jason",
  "Jeffrey",
  "Ryan",
  "Jacob",
  "Gary",
  "Nicholas",
  "Eric",
  "Jonathan",
  "Stephen",
  "Larry",
  "Justin",
  "Scott",
  "Brandon",
  "Benjamin",
  "Samuel",
  "Gregory",
  "Alexander",
  "Frank",
  "Patrick",
  "Raymond",
  "Jack",
  "Dennis",
  "Jerry",
  "Tyler",
  "Aaron",
  "Jose",
  "Adam",
  "Nathan",
  "Henry",
  "Zachary",
  "Douglas",
  "Peter",
  "Kyle",
  "Noah",
  "Ethan",
  "Jeremy",
  "Christian",
  "Walter",
  "Keith",
  "Roger",
  "Terry",
  "Austin",
  "Sean",
  "Gerald",
  "Carl",
  "Dylan",
  "Harold",
  "Jordan",
  "Jesse",
  "Bryan",
  "Lawrence",
  "Arthur",
  "Gabriel",
  "Bruce",
  "Logan",
  "Caleb",
  "Mason",
  "Elijah",
  "Oliver",
  "Lucas",
  "Liam",
  "Alexander",
  "Jackson",
  "Aiden",
  "Logan",
  "Jacob",
  "Michael",
  "Matthew",
  "Ethan",
  "Andrew",
  "Daniel",
  "William",
  "Joseph",
  "David",
  "Noah",
  "Anthony",
  "Ryan",
  "Christopher",
  "Tyler",
  "Joshua",
  "Benjamin",
  "Samuel",
  "Henry",
  "Jack",
  "Owen",
  "Luke",
  "Gabriel",
  "Isaac",
  "Levi",
  "Nathan",
  "Eli",
  "Caleb",
  "Isaiah",
  "Christian",
  "Jonathan",
  "Aaron",
  "Thomas",
  "Hunter",
  "Cameron",
  "Connor",
  "Wyatt",
  "Carter",
  "Jayden",
  "Brayden",
  "Grayson",
  "Leo",
  "Jaxon",
  "Lincoln",
  "Asher",
  "Ezra",
  "Hudson",
  "Miles",
  "Theo",
  "Miles",
  "Theo",
  "Kai",
  "Roman",
  "Axel",
  "Sawyer",
  "Ryder",
  "Micah",
  "Colton",
  "Cooper",
  "Easton",
  "Carson",
  "Chase",
  "Beau",
  "Maverick",
  "Kingston",
  "Weston",
  "Everett",
  "Bennett",
  "Emmett",
  "Parker",
  "Kaiden",
  "Rowan",
  "Declan",
  "Waylon",
  "Eli",
  "Colt",
  "River",
  "Finn",
  "Tucker",
  "Zane",
  "Dawson",
  "Karter",
  "Nash",
  "Beckett",
  "Knox",
  "Hayden",
  "Jace",
  "Emerson",
  "Atlas",
  "Emery",
  "Amari",
  "Zion",
  "Malachi",
  "Ali",
  "Jamal",
  "Malik",
  "Darius",
  "Jaylen",
  "Isaiah",
  "Xavier",
  "Jalen",
  "Khalil",
  "Tristan",
  "Devin",
  "Bryson",
  "Trevor",
  "Derek",
  "Blake",
  "Corey",
  "Shane",
  "Cody",
  "Dakota",
  "Tanner",
  "Collin",
  "Brady",
  "Jake",
  "Seth",
  "Gavin",
  "Caden",
  "Riley",
  "Cole",
  "Brody",
  "Max",
  "Luke",
  "Owen",
  "Aidan",
  "Evan",
  "Nathaniel",
  "Dominic",
  "Hayes",
  "Holden",
  "Ryker",
  "Grady",
  "Phoenix",
  "Cash",
  "Reid",
  "Zander",
  "Chance",
  "Tyson",
  "Bodhi",
  "Gunner",
  "Cohen",
  "Crew",
  "Apollo",
  "Romeo",
  "Zayn",
  "Jett",
  "Judah",
  "Soren",
  "Orion",
  "Aziel",
  "Koa",
  "Kyson",
  "Ronan",
  "Wilder",
  "Archer",
  "Remington",
  "Prince",
  "Santana",
  "Legend",
  "Dante",
  "Kane",
  "Brock",
  "Drake",
  "Zackary",
  "Quentin",
  "Reed",
  "Porter",
  "Sullivan",
  "Trent",
  "Keegan",
  "Finley",
  "Benson",
  "Callan",
  "Daxton",
  "Enzo",
  "Jonas",
  "Kieran",
  "Lucian",
  "Nolan"
];
var NORTH_AMERICAN_MALE_LASTNAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
  "Gomez",
  "Phillips",
  "Evans",
  "Turner",
  "Diaz",
  "Parker",
  "Cruz",
  "Edwards",
  "Collins",
  "Reyes",
  "Stewart",
  "Morris",
  "Morales",
  "Murphy",
  "Cook",
  "Rogers",
  "Gutierrez",
  "Ortiz",
  "Morgan",
  "Cooper",
  "Peterson",
  "Bailey",
  "Reed",
  "Kelly",
  "Howard",
  "Ramos",
  "Kim",
  "Cox",
  "Ward",
  "Richardson",
  "Watson",
  "Brooks",
  "Chavez",
  "Wood",
  "James",
  "Bennett",
  "Gray",
  "Mendoza",
  "Ruiz",
  "Hughes",
  "Price",
  "Alvarez",
  "Castillo",
  "Sanders",
  "Patel",
  "Myers",
  "Long",
  "Ross",
  "Foster",
  "Jimenez",
  "Powell",
  "Jenkins",
  "Perry",
  "Russell",
  "Sullivan",
  "Bell",
  "Coleman",
  "Butler",
  "Henderson",
  "Barnes",
  "Gonzales",
  "Fisher",
  "Vasquez",
  "Simmons",
  "Romero",
  "Jordan",
  "Patterson",
  "Alexander",
  "Hamilton",
  "Graham",
  "Reynolds",
  "Griffin",
  "Wallace",
  "Moreno",
  "West",
  "Cole",
  "Hayes",
  "Bryant",
  "Herrera",
  "Gibson",
  "Ellis",
  "Tran",
  "Medina",
  "Aguilar",
  "Stevens",
  "Murray",
  "Ford",
  "Castro",
  "Marshall",
  "Owens",
  "Mcdonald",
  "Harrison",
  "Ruiz",
  "Kennedy",
  "Wells",
  "Alvarez",
  "Woods",
  "Washington",
  "Barnes",
  "Freeman",
  "Webb",
  "Simpson",
  "Stevens",
  "Tucker",
  "Porter",
  "Hunter",
  "Hicks",
  "Crawford",
  "Henry",
  "Boyd",
  "Mason",
  "Morales",
  "Kennedy",
  "Warren",
  "Dixon",
  "Ramos",
  "Reyes",
  "Burns",
  "Gordon",
  "Shaw",
  "Holmes",
  "Rice",
  "Robertson",
  "Hunt",
  "Black",
  "Daniels",
  "Palmer",
  "Mills",
  "Nichols",
  "Grant",
  "Knight",
  "Ferguson",
  "Rose",
  "Stone",
  "Hawkins",
  "Dunn",
  "Perkins",
  "Hudson",
  "Spencer",
  "Gardner",
  "Stephens",
  "Payne",
  "Pierce",
  "Berry",
  "Matthews",
  "Arnold",
  "Wagner",
  "Willis",
  "Ray",
  "Watkins",
  "Olson",
  "Carroll",
  "Duncan",
  "Snyder",
  "Hart",
  "Cunningham",
  "Bradley",
  "Lane",
  "Andrews",
  "Ruiz",
  "Harper",
  "Fox",
  "Riley",
  "Armstrong",
  "Carpenter",
  "Weaver",
  "Greene",
  "Lawrence",
  "Elliott",
  "Chavez",
  "Sims",
  "Austin",
  "Peters",
  "Kelley",
  "Franklin",
  "Lawson",
  "Fields",
  "Gutierrez",
  "Ryan",
  "Schmidt",
  "Carr",
  "Vasquez",
  "Castillo",
  "Wheeler",
  "Chapman",
  "Oliver",
  "Montgomery",
  "Richards",
  "Williamson",
  "Johnston",
  "Banks",
  "Meyer",
  "Bishop",
  "Mccoy",
  "Howell",
  "Alvarez",
  "Morrison",
  "Hansen",
  "Fernandez",
  "Garza",
  "Harvey",
  "Little",
  "Burton",
  "Stanley",
  "Nguyen",
  "George",
  "Jacobs",
  "Reid",
  "Kim",
  "Fuller",
  "Lynch",
  "Dean",
  "Gilbert",
  "Garrett",
  "Romero",
  "Welch",
  "Larson",
  "Frazier",
  "Burke",
  "Hanson",
  "Day",
  "Mendoza",
  "Moreno",
  "Bowman",
  "Medina",
  "Fowler",
  "Brewer",
  "Hoffman",
  "Carlson",
  "Silva",
  "Pearson",
  "Holland",
  "Douglas",
  "Fleming",
  "Jensen",
  "Vargas",
  "Byrd",
  "Davidson",
  "Hopkins",
  "May",
  "Terrell",
  "Terry",
  "Herrera",
  "Wade",
  "Soto",
  "Walters",
  "Curtis",
  "Neal",
  "Caldwell",
  "Lowe",
  "Jennings",
  "Barnett",
  "Graves",
  "Jimenez",
  "Horton",
  "Shelton",
  "Barrett",
  "Obrien",
  "Castro",
  "Sutton",
  "Gregory",
  "Mckinney",
  "Lucas",
  "Miles",
  "Craig",
  "Rodriquez",
  "Chambers",
  "Holt",
  "Lambert",
  "Fletcher",
  "Watts",
  "Bates",
  "Hale",
  "Rhodes",
  "Pena",
  "Beck",
  "Newman",
  "Haynes",
  "McDaniel",
  "Mendez",
  "Bush",
  "Vaughn",
  "Parks",
  "Dawson",
  "Santiago",
  "Norris",
  "Hardy",
  "Love",
  "Steele",
  "Curry",
  "Powers",
  "Schultz",
  "Barker",
  "Guzman",
  "Page",
  "Munoz",
  "Ball",
  "Keller",
  "Chandler",
  "Weber",
  "Leonard",
  "Walsh",
  "Lyons",
  "Ramsey",
  "Wolfe",
  "Schneider",
  "Mullins",
  "Benson",
  "Sharp",
  "Bowen",
  "Daniel",
  "Barber",
  "Cummings",
  "Hines",
  "Baldwin",
  "Griffith",
  "Valdez",
  "Hubbard",
  "Salazar",
  "Reeves",
  "Warner",
  "Stevenson",
  "Burgess",
  "Santos",
  "Tate",
  "Cross",
  "Garner",
  "Mann",
  "Mack",
  "Moss",
  "Thornton",
  "Dennis",
  "Mcgee",
  "Farmer",
  "Delacruz",
  "Walton",
  "Bates",
  "John",
  "Peter",
  "Thomas",
  "James",
  "Paul",
  "Mark",
  "Luke",
  "Matthew",
  "Andrew",
  "Joseph",
  "David",
  "Michael",
  "Steven",
  "Christopher",
  "Daniel",
  "Joshua",
  "Ryan",
  "Jacob",
  "Nicholas",
  "Tyler",
  "Brandon",
  "Austin",
  "Benjamin",
  "Samuel",
  "Nathan",
  "Logan",
  "Christian",
  "Jonathan",
  "Caleb",
  "Dylan",
  "Isaac",
  "Gavin",
  "Jackson",
  "Eli",
  "Jordan",
  "Hunter",
  "Luke",
  "Angel",
  "Kevin",
  "Jack",
  "Cody",
  "Asher",
  "Cameron",
  "Chase",
  "Cooper",
  "Xavier",
  "Parker",
  "Jace",
  "Miles",
  "Blake",
  "Aiden",
  "Leo",
  "Theo"
];

// services/NameGeneratorService.ts
var getRandomElement = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};
var NameGeneratorService = {
  getRandomName(region) {
    switch (region) {
      case "POLAND" /* POLAND */:
        return {
          firstName: getRandomElement(PL_MALE_FIRSTNAMES),
          lastName: getRandomElement(PL_MALE_LASTNAMES)
        };
      case "BALKANS" /* BALKANS */:
        return {
          firstName: getRandomElement(BALKAN_MALE_FIRSTNAMES),
          lastName: getRandomElement(BALKAN_MALE_LASTNAMES)
        };
      case "CZ_SK" /* CZ_SK */:
        return {
          firstName: getRandomElement(CZSK_MALE_FIRSTNAMES),
          lastName: getRandomElement(CZSK_MALE_LASTNAMES)
        };
      case "SSA" /* SSA */:
        return {
          firstName: getRandomElement(SSA_MALE_FIRSTNAMES),
          lastName: getRandomElement(SSA_MALE_LASTNAMES)
        };
      case "IBERIA" /* IBERIA */:
        return {
          firstName: getRandomElement(IBERIA_MALE_FIRSTNAMES),
          lastName: getRandomElement(IBERIA_MALE_LASTNAMES)
        };
      case "NORTH_AMERICA" /* NORTH_AMERICA */:
        return {
          firstName: getRandomElement(NORTH_AMERICAN_MALE_FIRSTNAMES),
          lastName: getRandomElement(NORTH_AMERICAN_MALE_LASTNAMES)
        };
      case "MEXICO" /* MEXICO */:
        return {
          firstName: getRandomElement(MEXICAN_MALE_FIRSTNAMES),
          lastName: getRandomElement(MEXICAN_MALE_LASTNAMES)
        };
      case "OCEANIA" /* OCEANIA */:
        return {
          firstName: getRandomElement(OCEANIAN_MALE_FIRSTNAMES),
          lastName: getRandomElement(OCEANIAN_MALE_LASTNAMES)
        };
      case "SWEDEN" /* SWEDEN */:
        return {
          firstName: getRandomElement(SWEDISH_MALE_FIRSTNAMES),
          lastName: getRandomElement(SWEDISH_MALE_LASTNAMES)
        };
      case "SCANDINAVIA" /* SCANDINAVIA */:
        return {
          firstName: getRandomElement(SCANDINAVIA_MALE_FIRSTNAMES),
          lastName: getRandomElement(SCANDINAVIA_MALE_LASTNAMES)
        };
      case "EX_USSR" /* EX_USSR */:
        return {
          firstName: getRandomElement(EXUSSR_MALE_FIRSTNAMES),
          lastName: getRandomElement(EXUSSR_MALE_LASTNAMES)
        };
      case "SPAIN" /* SPAIN */:
        return { firstName: getRandomElement(ES_MALE_FIRSTNAMES), lastName: getRandomElement(ES_MALE_LASTNAMES) };
      case "ENGLAND" /* ENGLAND */:
        return { firstName: getRandomElement(EN_MALE_FIRSTNAMES), lastName: getRandomElement(EN_MALE_LASTNAMES) };
      case "GERMANY" /* GERMANY */:
        return { firstName: getRandomElement(DE_MALE_FIRSTNAMES), lastName: getRandomElement(DE_MALE_LASTNAMES) };
      case "ITALY" /* ITALY */:
        return { firstName: getRandomElement(IT_MALE_FIRSTNAMES), lastName: getRandomElement(IT_MALE_LASTNAMES) };
      case "FRANCE" /* FRANCE */:
        return { firstName: getRandomElement(FR_MALE_FIRSTNAMES), lastName: getRandomElement(FR_MALE_LASTNAMES) };
      case "JAPAN" /* JAPAN */:
        return { firstName: getRandomElement(JAPANESE_MALE_FIRSTNAMES), lastName: getRandomElement(JAPANESE_MALE_SURNAMES) };
      case "KOREA" /* KOREA */:
        return { firstName: getRandomElement(KOREAN_MALE_FIRSTNAMES), lastName: getRandomElement(KOREAN_MALE_SURNAMES) };
      case "ARGENTINA" /* ARGENTINA */:
        return { firstName: getRandomElement(ARGENTINIAN_MALE_FIRSTNAMES), lastName: getRandomElement(ARGENTINIAN_MALE_LASTNAMES) };
      case "BRAZIL" /* BRAZIL */:
        return { firstName: getRandomElement(BRAZILIAN_MALE_FIRSTNAMES), lastName: getRandomElement(BRAZILIAN_MALE_LASTNAMES) };
      case "TURKEY" /* TURKEY */:
        return { firstName: getRandomElement(TURKISH_MALE_FIRSTNAMES), lastName: getRandomElement(TURKISH_MALE_LASTNAMES) };
      case "ARABIA" /* ARABIA */:
        return { firstName: getRandomElement(ARABIC_MALE_FIRSTNAMES), lastName: getRandomElement(ARABIC_MALE_LASTNAMES) };
      case "FINLAND" /* FINLAND */:
        return { firstName: getRandomElement(FINNISH_MALE_FIRSTNAMES), lastName: getRandomElement(FINNISH_MALE_LASTNAMES) };
      case "GEORGIA" /* GEORGIA */:
        return { firstName: getRandomElement(GEORGIAN_MALE_FIRSTNAMES), lastName: getRandomElement(GEORGIAN_MALE_LASTNAMES) };
      case "ARMENIA" /* ARMENIA */:
        return { firstName: getRandomElement(ARMENIAN_MALE_FIRSTNAMES), lastName: getRandomElement(ARMENIAN_MALE_LASTNAMES) };
      case "ALBANIA" /* ALBANIA */:
        return { firstName: getRandomElement(ALBANIAN_MALE_FIRSTNAMES), lastName: getRandomElement(ALBANIAN_MALE_LASTNAMES) };
      case "ROMANIA" /* ROMANIA */:
        return { firstName: getRandomElement(ROMANIAN_MALE_FIRSTNAMES), lastName: getRandomElement(ROMANIAN_MALE_LASTNAMES) };
      case "BALTIC" /* BALTIC */:
        return { firstName: getRandomElement(BALTIC_MALE_FIRSTNAMES), lastName: getRandomElement(BALTIC_MALE_LASTNAMES) };
      case "BENELUX" /* BENELUX */:
        return { firstName: getRandomElement(BENELUX_MALE_FIRSTNAMES), lastName: getRandomElement(BENELUX_MALE_LASTNAMES) };
      case "HUNGARIAN" /* HUNGARIAN */:
        return { firstName: getRandomElement(HUNGARIAN_MALE_FIRSTNAMES), lastName: getRandomElement(HUNGARIAN_MALE_LASTNAMES) };
      case "MALTESE" /* MALTESE */:
        return { firstName: getRandomElement(MALTESE_MALE_FIRSTNAMES), lastName: getRandomElement(MALTESE_MALE_LASTNAMES) };
      case "ISRAELI" /* ISRAELI */:
        return { firstName: getRandomElement(ISRAELI_MALE_FIRSTNAMES), lastName: getRandomElement(ISRAELI_MALE_LASTNAMES) };
      case "GREEK" /* GREEK */:
        return { firstName: getRandomElement(GREEK_MALE_FIRSTNAMES), lastName: getRandomElement(GREEK_MALE_LASTNAMES) };
      case "AZERBAIJANI" /* AZERBAIJANI */:
        return { firstName: getRandomElement(AZERBAIJANI_MALE_FIRSTNAMES), lastName: getRandomElement(AZERBAIJANI_MALE_LASTNAMES) };
      case "KAZAKH" /* KAZAKH */:
        return { firstName: getRandomElement(KAZAKH_MALE_FIRSTNAMES), lastName: getRandomElement(KAZAKH_MALE_LASTNAMES) };
      case "SOUTH_AMERICAN" /* SOUTH_AMERICAN */:
        return { firstName: getRandomElement(SOUTH_AMERICAN_MALE_FIRSTNAMES), lastName: getRandomElement(SOUTH_AMERICAN_MALE_LASTNAMES) };
      default:
        return {
          firstName: getRandomElement(PL_MALE_FIRSTNAMES),
          lastName: getRandomElement(PL_MALE_LASTNAMES)
        };
    }
  },
  getRandomForeignRegion() {
    const foreignRegions = [
      "BALKANS" /* BALKANS */,
      "CZ_SK" /* CZ_SK */,
      "SSA" /* SSA */,
      "IBERIA" /* IBERIA */,
      "SCANDINAVIA" /* SCANDINAVIA */,
      "EX_USSR" /* EX_USSR */,
      "SPAIN" /* SPAIN */,
      "ENGLAND" /* ENGLAND */,
      "GERMANY" /* GERMANY */,
      "ITALY" /* ITALY */,
      "FRANCE" /* FRANCE */,
      "JAPAN" /* JAPAN */,
      "KOREA" /* KOREA */,
      "ARGENTINA" /* ARGENTINA */,
      "BRAZIL" /* BRAZIL */,
      "TURKEY" /* TURKEY */,
      "ARABIA" /* ARABIA */,
      "FINLAND" /* FINLAND */,
      "GEORGIA" /* GEORGIA */,
      "ARMENIA" /* ARMENIA */,
      "ALBANIA" /* ALBANIA */,
      "ROMANIA" /* ROMANIA */,
      "BALTIC" /* BALTIC */,
      "BENELUX" /* BENELUX */,
      "HUNGARIAN" /* HUNGARIAN */,
      "MALTESE" /* MALTESE */,
      "ISRAELI" /* ISRAELI */,
      "GREEK" /* GREEK */,
      "AZERBAIJANI" /* AZERBAIJANI */,
      "KAZAKH" /* KAZAKH */
    ];
    return foreignRegions[Math.floor(Math.random() * foreignRegions.length)];
  }
};

// services/CoachService.ts
var TACTICS_OFFENSIVE = ["4-3-3 Atak", "3-4-3", "Wysoki Pressing", "Total Football", "4-1-2-1-2"];
var TACTICS_NEUTRAL = ["4-4-2", "4-3-3 Zr\xF3wnowa\u017Cona", "3-5-2", "4-5-1", "4-2-3-1", "5-3-2"];
var TACTICS_DEFENSIVE = ["5-4-1", "5-3-2 Blok", "4-4-2 Kontratak", "Niski Blok", "4-5-1 Defensywna", "3-6-1"];
var randomTactic = (list) => list[Math.floor(Math.random() * list.length)];
var DEFAULT_HIRED_DATE = (/* @__PURE__ */ new Date("2025-07-01")).toISOString();
var DEFAULT_CONTRACT_YEARS = 2;
var addYears = (dateIso, years) => {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return new Date(2027, 6, 1).toISOString();
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString();
};
var roundSalary = (value) => Math.max(5e4, Math.round(value / 1e4) * 1e4);
var coachQualityMultiplier = (coach) => {
  const attrs = coach.attributes;
  const avg = (attrs.experience * 1.25 + attrs.decisionMaking + attrs.motivation * 0.85 + attrs.training * 0.7) / 3.8;
  return 0.72 + Math.max(0, Math.min(99, avg)) / 99 * 0.72;
};
var getClubSalaryBase = (club) => {
  const rep = club.reputation;
  if (rep >= 18) return 55e5;
  if (rep >= 15) return 3e6;
  if (rep >= 12) return 15e5;
  if (rep >= 9) return 85e4;
  if (rep >= 7) return 48e4;
  if (rep >= 4) return 22e4;
  return 9e4;
};
var getLeagueSalaryMultiplier = (leagueId) => {
  if (leagueId === "L_CL") return 1.35;
  if (leagueId === "L_EL") return 1.15;
  if (leagueId === "L_CONF") return 0.95;
  if (leagueId === "L_PL_1") return 1;
  if (leagueId === "L_PL_2") return 0.55;
  if (leagueId === "L_PL_3") return 0.32;
  if (leagueId === "L_PL_4" || leagueId?.startsWith("L_PL_4_G")) return 0.18;
  if (leagueId === "L_SA") return 1.05;
  if (leagueId === "L_ASIA") return 0.9;
  if (leagueId === "L_NA") return 0.8;
  if (leagueId === "L_AFRICA") return 0.45;
  return 0.7;
};
var getFallbackSalary = (coach) => {
  const attrs = coach.attributes;
  const avg = (attrs.experience + attrs.decisionMaking + attrs.motivation + attrs.training) / 4;
  return roundSalary(6e4 + avg * 8500);
};
var stableHash = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i) | 0;
  }
  return Math.abs(hash);
};
var isPolishClub = (club) => club.country === "POL" || club.leagueId.startsWith("L_PL_") || club.id.startsWith("PL_");
var getFixtureOutcome = (fixture, clubId) => {
  if (fixture.homeScore === null || fixture.awayScore === null) return null;
  const isHome = fixture.homeTeamId === clubId;
  const isAway = fixture.awayTeamId === clubId;
  if (!isHome && !isAway) return null;
  const goalsFor = isHome ? fixture.homeScore : fixture.awayScore;
  const goalsAgainst = isHome ? fixture.awayScore : fixture.homeScore;
  if (goalsFor > goalsAgainst) return "WIN";
  if (goalsFor < goalsAgainst) return "LOSS";
  const homePens = fixture.homePenaltyScore;
  const awayPens = fixture.awayPenaltyScore;
  if (typeof homePens === "number" && typeof awayPens === "number" && homePens !== awayPens) {
    const wonPens = isHome ? homePens > awayPens : awayPens > homePens;
    return wonPens ? "WIN" : "LOSS";
  }
  return "DRAW";
};
var getExpDelta = (club, outcome, userTeamId) => {
  const polish = isPolishClub(club);
  if (polish && club.id === userTeamId) return 0;
  if (!polish) {
    if (outcome === "WIN") return 5;
    if (outcome === "DRAW") return 1;
    return -1;
  }
  if (outcome === "WIN") return 1;
  if (outcome === "DRAW") return 0.5;
  return -0.5;
};
var getNationalTeamExpDelta = (team, outcome) => {
  const polish = team.region === "POLAND" /* POLAND */ || team.name === "Polska";
  if (!polish) {
    if (outcome === "WIN") return 5;
    if (outcome === "DRAW") return 1;
    return -1;
  }
  if (outcome === "WIN") return 1;
  if (outcome === "DRAW") return 0.5;
  return -0.5;
};
var getNationalTeamOutcome = (result, teamId) => {
  const isHome = result.homeTeamId === teamId;
  const isAway = result.awayTeamId === teamId;
  if (!isHome && !isAway) return null;
  const goalsFor = isHome ? result.homeGoals : result.awayGoals;
  const goalsAgainst = isHome ? result.awayGoals : result.homeGoals;
  if (goalsFor > goalsAgainst) return "WIN";
  if (goalsFor < goalsAgainst) return "LOSS";
  return "DRAW";
};
var LEAGUE_PREFERRED_REGIONS = {
  "L_ASIA": ["JAPAN" /* JAPAN */, "KOREA" /* KOREA */, "ARABIA" /* ARABIA */, "TURKEY" /* TURKEY */, "KAZAKH" /* KAZAKH */, "AZERBAIJANI" /* AZERBAIJANI */],
  "L_AFRICA": ["SSA" /* SSA */, "ARABIA" /* ARABIA */],
  "L_SA": ["ARGENTINA" /* ARGENTINA */, "BRAZIL" /* BRAZIL */, "SOUTH_AMERICAN" /* SOUTH_AMERICAN */, "IBERIA" /* IBERIA */],
  "L_NA": ["NORTH_AMERICA" /* NORTH_AMERICA */, "MEXICO" /* MEXICO */]
};
var EUROPEAN_COACH_REGIONS = /* @__PURE__ */ new Set([
  "BALKANS" /* BALKANS */,
  "CZ_SK" /* CZ_SK */,
  "IBERIA" /* IBERIA */,
  "SWEDEN" /* SWEDEN */,
  "SCANDINAVIA" /* SCANDINAVIA */,
  "EX_USSR" /* EX_USSR */,
  "SPAIN" /* SPAIN */,
  "ENGLAND" /* ENGLAND */,
  "GERMANY" /* GERMANY */,
  "ITALY" /* ITALY */,
  "FRANCE" /* FRANCE */,
  "TURKEY" /* TURKEY */,
  "FINLAND" /* FINLAND */,
  "GEORGIA" /* GEORGIA */,
  "ARMENIA" /* ARMENIA */,
  "ALBANIA" /* ALBANIA */,
  "ROMANIA" /* ROMANIA */,
  "BALTIC" /* BALTIC */,
  "BENELUX" /* BENELUX */,
  "HUNGARIAN" /* HUNGARIAN */,
  "MALTESE" /* MALTESE */,
  "GREEK" /* GREEK */,
  "AZERBAIJANI" /* AZERBAIJANI */,
  "KAZAKH" /* KAZAKH */
]);
var getCoachExpPoints = (coach) => Math.max(1, typeof coach.expPoints === "number" ? coach.expPoints : 1);
var randomIntInclusive = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
var clamp4 = (value, min, max) => Math.max(min, Math.min(max, value));
var BOARD_LEVEL_SCORE = {
  bardzo_niska: 1,
  niska: 2,
  przecietna: 3,
  wysoka: 4,
  bardzo_wysoka: 5
};
var getExperienceRatingFromPoints = (expPoints) => {
  if (!Number.isFinite(expPoints ?? NaN)) return 35;
  const safePoints = Math.max(1, expPoints ?? 1);
  const rating = 1 + 98 * (1 - Math.exp(-safePoints / 1500));
  return clamp4(Math.round(rating), 1, 99);
};
var getExperienceTrustMultiplier = (expPoints) => {
  const rating = getExperienceRatingFromPoints(expPoints);
  return clamp4(1.18 - rating * 42e-4, 0.76, 1.18);
};
var calculatePerformancePressure = (club, rank, expPoints, expectedRankOverride) => {
  const board = club.board;
  const EXPECTED_RANK_FROM_BOARD = {
    bardzo_wysoka: 3,
    wysoka: 6,
    przecietna: 12,
    niska: 15,
    bardzo_niska: 18
  };
  const boardExpected = board ? EXPECTED_RANK_FROM_BOARD[board.oczekiwania] : 12;
  const repExpected = Math.max(1, 15 - club.reputation);
  const baseExpected = Math.max(boardExpected, repExpected);
  const AMBICJA_OFFSET = {
    bardzo_wysoka: -2,
    wysoka: -1,
    przecietna: 0,
    niska: 2,
    bardzo_niska: 4
  };
  const ambicjaOffset = board ? AMBICJA_OFFSET[board.ambicja] : 0;
  const expectedRank = expectedRankOverride != null ? Math.max(1, expectedRankOverride) : Math.max(1, baseExpected + ambicjaOffset);
  const gap = rank - expectedRank;
  let baseChance;
  if (gap <= 0) baseChance = 0;
  else if (gap <= 2) baseChance = 0.02;
  else if (gap <= 4) baseChance = 0.08;
  else if (gap <= 6) baseChance = 0.2;
  else if (gap <= 9) baseChance = 0.35;
  else baseChance = 0.55;
  const played = Math.max(0, club.stats.played);
  const ppg = played > 0 ? club.stats.points / played : 0;
  const expectedPpg = expectedRank <= 3 ? 1.9 : expectedRank <= 6 ? 1.6 : expectedRank <= 12 ? 1.25 : expectedRank <= 15 ? 1.05 : 0.85;
  const ppgPressure = clamp4((expectedPpg - ppg) * 0.2, 0, 0.22);
  const recentForm = club.stats.form.slice(-5);
  const recentLosses = recentForm.filter((result) => result === "P").length;
  const recentWins = recentForm.filter((result) => result === "W").length;
  const recentPressure = recentForm.length >= 3 ? recentLosses * 0.035 + (recentWins === 0 ? 0.06 : 0) : 0;
  const goalDiffPerMatch = played > 0 ? club.stats.goalDifference / played : 0;
  const goalDiffPressure = clamp4(-goalDiffPerMatch * 0.05, 0, 0.1);
  const embarrassmentPressure = rank >= 16 && club.reputation >= 7 ? 0.2 : 0;
  const PATIENCE_MULTIPLIER = {
    bardzo_wysoka: 0.25,
    wysoka: 0.55,
    przecietna: 1,
    niska: 1.3,
    bardzo_niska: 1.8
  };
  const patience = board?.cierpliwosc ?? "przecietna";
  const multiplier = PATIENCE_MULTIPLIER[patience];
  const REVIEW_WINDOW = {
    bardzo_wysoka: { firstLook: 10, fullReview: 22 },
    wysoka: { firstLook: 8, fullReview: 17 },
    przecietna: { firstLook: 6, fullReview: 13 },
    niska: { firstLook: 4, fullReview: 9 },
    bardzo_niska: { firstLook: 3, fullReview: 6 }
  };
  const window = REVIEW_WINDOW[patience];
  const pressureBeforeReadiness = baseChance + ppgPressure + recentPressure + goalDiffPressure + embarrassmentPressure;
  const experienceTrustMultiplier = getExperienceTrustMultiplier(expPoints);
  const patienceScore = BOARD_LEVEL_SCORE[patience];
  const catastrophic = played >= 3 && gap >= 7 && (rank >= 16 || ppg <= 0.75 || recentLosses >= 4 || club.stats.goalDifference <= -10);
  const earlyReviewAllowed = played >= window.firstLook && pressureBeforeReadiness >= (patienceScore >= 4 ? 0.58 : patienceScore === 3 ? 0.42 : 0.3);
  if (played < window.firstLook && !catastrophic) {
    return { expectedRank, gap, finalChance: 0, reviewReadiness: 0, earlyReviewAllowed: false, experienceTrustMultiplier, reason: "" };
  }
  const readiness = catastrophic ? 1 : clamp4((played - window.firstLook + 1) / Math.max(1, window.fullReview - window.firstLook + 1), 0.2, 1.15);
  const rawFinalChance = gap > 0 ? Math.min(0.95, pressureBeforeReadiness * multiplier * readiness) : 0;
  const finalChance = catastrophic ? rawFinalChance : Math.min(0.95, rawFinalChance * experienceTrustMultiplier);
  let reason = "Zarz\u0105d straci\u0142 cierpliwo\u015B\u0107 do obecnego szkoleniowca.";
  if (rank >= 16 && club.reputation >= 7) reason = "Kompromituj\u0105ca pozycja w tabeli wzgl\u0119dem potencja\u0142u klubu.";
  else if (gap >= 7) reason = "Brak wynik\xF3w sportowych i niezadowolenie kibic\xF3w.";
  else if (recentLosses >= 4 || ppgPressure >= 0.16) reason = "Seria s\u0142abych wynik\xF3w przyspieszy\u0142a reakcj\u0119 zarz\u0105du.";
  else if (gap >= 4) reason = "Wyniki poni\u017Cej oczekiwa\u0144 zarz\u0105du przez zbyt d\u0142ugi okres.";
  return { expectedRank, gap, finalChance, reviewReadiness: readiness, earlyReviewAllowed: earlyReviewAllowed || catastrophic, experienceTrustMultiplier, reason };
};
var getInitialCoachExpRangeForClub = (club) => {
  const reputation = club?.reputation ?? 5;
  if (reputation >= 18) return { min: 100, max: 200 };
  if (reputation >= 15) return { min: 75, max: 100 };
  if (reputation >= 11) return { min: 50, max: 75 };
  return { min: 1, max: 50 };
};
var getInitialCoachExpForClub = (club) => {
  const range = getInitialCoachExpRangeForClub(club);
  return randomIntInclusive(range.min, range.max);
};
var getInitialCoachExpForImportedCoach = (coach, club) => {
  const range = getInitialCoachExpRangeForClub(club);
  const width = range.max - range.min;
  const experience = Math.max(20, Math.min(99, coach.attributes?.experience ?? 50));
  const experienceRatio = (experience - 20) / 79;
  const jitter = Math.max(1, Math.round(width * 0.1));
  const value = Math.round(range.min + width * experienceRatio) + randomIntInclusive(-jitter, jitter);
  return Math.max(range.min, Math.min(range.max, value));
};
var sortByCoachExp = (a, b) => getCoachExpPoints(b) - getCoachExpPoints(a) || b.attributes.experience - a.attributes.experience || b.attributes.decisionMaking - a.attributes.decisionMaking;
var isPreferredEuropeanCoach = (coach) => EUROPEAN_COACH_REGIONS.has(coach.nationality);
var CoachService = {
  getDefaultContractEndDate: (hiredDate = DEFAULT_HIRED_DATE) => addYears(hiredDate, DEFAULT_CONTRACT_YEARS),
  generateInitialExpPointsForImportedCoach: (coach, club) => getInitialCoachExpForImportedCoach(coach, club),
  calculateAnnualSalaryForClub: (club, coach) => {
    const base = getClubSalaryBase(club) * getLeagueSalaryMultiplier(club.leagueId);
    return roundSalary(base * coachQualityMultiplier(coach));
  },
  calculateAnnualSalaryForNationalTeam: (team, coach) => {
    const base = getClubSalaryBase(team);
    return roundSalary(base * 0.75 * coachQualityMultiplier(coach));
  },
  calculateRenewedAnnualSalary: (coach) => {
    const currentSalary = typeof coach.annualSalary === "number" && coach.annualSalary > 0 ? coach.annualSalary : getFallbackSalary(coach);
    return roundSalary(currentSalary * 1.1);
  },
  shouldRefuseContractExtension: (coach, club, renewalDate) => {
    if ((coach.expPoints ?? 1) <= 200) return false;
    if (club.reputation >= 17) return false;
    const renewalKey = renewalDate.toISOString().split("T")[0];
    return stableHash(`${coach.id}|${club.id}|${renewalKey}|contract-renewal`) % 2 === 0;
  },
  getPerformancePressure: (club, rank, expPoints, expectedRankOverride) => calculatePerformancePressure(club, rank, expPoints, expectedRankOverride),
  findReplacementCoach: (coaches, club, hireDate, excludedCoachId) => {
    const hireKey = hireDate.toISOString().split("T")[0];
    const candidates = Object.values(coaches).filter(
      (coach) => !coach.currentClubId && coach.id !== excludedCoachId && (!coach.blacklist?.[club.id] || coach.blacklist[club.id] <= hireDate.getFullYear())
    );
    if (candidates.length === 0) return void 0;
    if (club.reputation < 12) {
      return candidates.sort((a, b) => b.attributes.experience - a.attributes.experience)[0];
    }
    const shouldSearchEurope = stableHash(`${club.id}|${hireKey}|coach-market-region`) % 100 < 99;
    const preferredCandidates = candidates.filter(isPreferredEuropeanCoach);
    const alternativeCandidates = candidates.filter((candidate) => !isPreferredEuropeanCoach(candidate));
    const pool = shouldSearchEurope ? preferredCandidates.length > 0 ? preferredCandidates : candidates : alternativeCandidates.length > 0 ? alternativeCandidates : candidates;
    const sorted = [...pool].sort(sortByCoachExp);
    if (club.reputation >= 17) {
      return sorted[0];
    }
    return sorted.find(
      (candidate) => stableHash(`${candidate.id}|${club.id}|${hireKey}|coach-hire-agreement`) % 2 === 0
    );
  },
  normalizeCoachContract: (coach, club, nationalTeam) => {
    const hiredDate = coach.hiredDate || DEFAULT_HIRED_DATE;
    const annualSalary = typeof coach.annualSalary === "number" && coach.annualSalary > 0 ? coach.annualSalary : club ? CoachService.calculateAnnualSalaryForClub(club, coach) : nationalTeam ? CoachService.calculateAnnualSalaryForNationalTeam(nationalTeam, coach) : getFallbackSalary(coach);
    return {
      ...coach,
      hiredDate,
      contractEndDate: coach.contractEndDate || CoachService.getDefaultContractEndDate(hiredDate),
      annualSalary,
      expPoints: Math.max(1, typeof coach.expPoints === "number" ? coach.expPoints : 1)
    };
  },
  applyMatchExpForFinishedFixtures: (coaches, clubs, updatedFixtures, previousFixtures, userTeamId) => {
    const previousById = new Map(previousFixtures.map((fixture) => [fixture.id, fixture]));
    const clubById = new Map(clubs.map((club) => [club.id, club]));
    let nextCoaches = coaches;
    const applyForClub = (fixture, clubId) => {
      const club = clubById.get(clubId);
      if (!club?.coachId) return;
      const coach = nextCoaches[club.coachId];
      if (!coach) return;
      const outcome = getFixtureOutcome(fixture, clubId);
      if (!outcome) return;
      const delta = getExpDelta(club, outcome, userTeamId);
      if (delta === 0) return;
      if (nextCoaches === coaches) nextCoaches = { ...coaches };
      nextCoaches[coach.id] = {
        ...coach,
        expPoints: Math.max(1, (typeof coach.expPoints === "number" ? coach.expPoints : 1) + delta)
      };
    };
    updatedFixtures.forEach((fixture) => {
      const previous = previousById.get(fixture.id);
      if (fixture.status !== "FINISHED" /* FINISHED */ || previous?.status === "FINISHED" /* FINISHED */) return;
      applyForClub(fixture, fixture.homeTeamId);
      applyForClub(fixture, fixture.awayTeamId);
    });
    return nextCoaches;
  },
  applyNationalTeamExpForResults: (coaches, nationalTeams, results) => {
    const teamById = new Map(nationalTeams.map((team) => [team.id, team]));
    let nextCoaches = coaches;
    const applyForTeam = (result, teamId) => {
      if (!teamId) return;
      const team = teamById.get(teamId);
      if (!team?.coachId) return;
      const coach = nextCoaches[team.coachId];
      if (!coach) return;
      const outcome = getNationalTeamOutcome(result, team.id);
      if (!outcome) return;
      const delta = getNationalTeamExpDelta(team, outcome);
      if (delta === 0) return;
      if (nextCoaches === coaches) nextCoaches = { ...coaches };
      nextCoaches[coach.id] = {
        ...coach,
        expPoints: Math.max(1, (typeof coach.expPoints === "number" ? coach.expPoints : 1) + delta)
      };
    };
    results.forEach((result) => {
      applyForTeam(result, result.homeTeamId);
      applyForTeam(result, result.awayTeamId);
    });
    return nextCoaches;
  },
  generateInitialCoaches: (clubs) => {
    const coaches = {};
    const coachList = [];
    for (let i = 0; i < 1500; i++) {
      coachList.push(CoachService.createRandomCoach(i < 180));
    }
    const updatedClubs = [...clubs];
    coachList.forEach((c) => {
      coaches[c.id] = c;
    });
    updatedClubs.forEach((club) => {
      let minExp = 0;
      let maxExp = 55;
      if (club.leagueId === "L_CL" || club.leagueId === "L_EL" || club.leagueId === "L_CONF") {
        if (club.reputation >= 18) {
          minExp = 80;
          maxExp = 99;
        } else if (club.reputation >= 15) {
          minExp = 70;
          maxExp = 88;
        } else if (club.reputation >= 12) {
          minExp = 48;
          maxExp = 75;
        } else {
          minExp = 10;
          maxExp = 60;
        }
      } else {
        if (club.reputation >= 7) maxExp = 72;
        else if (club.reputation >= 4) maxExp = 65;
      }
      const excludePolish = (club.leagueId === "L_CL" || club.leagueId === "L_EL" || club.leagueId === "L_CONF") && club.reputation >= 12;
      const isPolishClub2 = club.leagueId.startsWith("L_PL_");
      const preferredRegions = LEAGUE_PREFERRED_REGIONS[club.leagueId];
      const polishCandidates = isPolishClub2 ? coachList.filter(
        (c) => c.attributes.experience >= minExp && c.attributes.experience <= maxExp && c.currentClubId === null && c.nationality === "POLAND" /* POLAND */
      ) : [];
      const regionalCandidates = preferredRegions ? coachList.filter(
        (c) => c.attributes.experience >= minExp && c.attributes.experience <= maxExp && c.currentClubId === null && preferredRegions.includes(c.nationality)
      ) : [];
      const generalCandidates = coachList.filter(
        (c) => c.attributes.experience >= minExp && c.attributes.experience <= maxExp && c.currentClubId === null && (!excludePolish || c.nationality !== "POLAND" /* POLAND */)
      );
      const candidates = polishCandidates.length > 0 ? polishCandidates : regionalCandidates.length > 0 ? regionalCandidates : generalCandidates;
      let finalCandidates = candidates;
      let searchMinExp = minExp;
      while (finalCandidates.length === 0 && searchMinExp > 0) {
        searchMinExp = Math.max(0, searchMinExp - 5);
        finalCandidates = coachList.filter(
          (c) => c.attributes.experience >= searchMinExp && c.attributes.experience <= maxExp && c.currentClubId === null && (!excludePolish || c.nationality !== "POLAND" /* POLAND */)
        );
      }
      const coach = finalCandidates.length > 0 ? finalCandidates[Math.floor(Math.random() * finalCandidates.length)] : coachList.find((c) => c.currentClubId === null);
      if (coach) {
        const hiredDate = DEFAULT_HIRED_DATE;
        coach.currentClubId = club.id;
        coach.hiredDate = hiredDate;
        coach.contractEndDate = CoachService.getDefaultContractEndDate(hiredDate);
        coach.annualSalary = CoachService.calculateAnnualSalaryForClub(club, coach);
        coach.expPoints = getInitialCoachExpForClub(club);
        coach.history.push({
          clubId: club.id,
          clubName: club.name,
          fromYear: 2025,
          fromMonth: 7,
          toYear: null,
          toMonth: null
        });
        club.coachId = coach.id;
        if ((club.leagueId === "L_CL" || club.leagueId === "L_EL" || club.leagueId === "L_CONF") && club.reputation >= 18) {
          const attrs = coach.attributes;
          const keys = ["experience", "decisionMaking", "motivation", "training"];
          keys.forEach((key) => {
            if (attrs[key] < 80) {
              attrs[key] = 80 + Math.floor(Math.random() * 20);
            }
          });
        }
      }
    });
    coachList.forEach((coach) => {
      if (!coach.contractEndDate) coach.contractEndDate = CoachService.getDefaultContractEndDate(coach.hiredDate);
      if (!coach.annualSalary || coach.annualSalary <= 0) coach.annualSalary = getFallbackSalary(coach);
    });
    return { coaches, updatedClubs };
  },
  createRandomCoach: (isPolish) => {
    const region = isPolish ? "POLAND" /* POLAND */ : NameGeneratorService.getRandomForeignRegion();
    const namePair = NameGeneratorService.getRandomName(region);
    return {
      id: `COACH_${Math.random().toString(36).substr(2, 9)}`,
      firstName: namePair.firstName,
      lastName: namePair.lastName,
      age: 35 + Math.floor(Math.random() * 35),
      nationality: region,
      nationalityFlag: isPolish ? "\u{1F1F5}\u{1F1F1}" : "\u{1F30D}",
      currentClubId: null,
      currentNationalTeamId: null,
      isNationalTeamCoach: false,
      hiredDate: DEFAULT_HIRED_DATE,
      // Domyślna data startu sezonu
      contractEndDate: CoachService.getDefaultContractEndDate(DEFAULT_HIRED_DATE),
      annualSalary: 0,
      expPoints: 1,
      blacklist: {},
      attributes: {
        experience: 20 + Math.floor(Math.random() * 75),
        decisionMaking: 30 + Math.floor(Math.random() * 60),
        motivation: 40 + Math.floor(Math.random() * 55),
        training: 35 + Math.floor(Math.random() * 60)
      },
      favoriteTactics: {
        offensive: randomTactic(TACTICS_OFFENSIVE),
        neutral: randomTactic(TACTICS_NEUTRAL),
        defensive: randomTactic(TACTICS_DEFENSIVE)
      },
      history: [],
      seasonStats: []
    };
  },
  generateNationalTeamCoaches: () => {
    const tiers = [
      { minExp: 85, maxExp: 99, count: 100 },
      // rep 18-20: światowe potęgi
      { minExp: 65, maxExp: 84, count: 100 },
      // rep 14-17: silne reprezentacje
      { minExp: 40, maxExp: 64, count: 120 },
      // rep 10-13: średnie reprezentacje
      { minExp: 20, maxExp: 39, count: 100 },
      // rep 6-9:  słabe reprezentacje
      { minExp: 5, maxExp: 19, count: 80 }
      // rep 1-5:  najsłabsze reprezentacje
    ];
    const result = [];
    tiers.forEach(({ minExp, maxExp, count }) => {
      for (let i = 0; i < count; i++) {
        const region = NameGeneratorService.getRandomForeignRegion();
        const namePair = NameGeneratorService.getRandomName(region);
        const exp = minExp + Math.floor(Math.random() * (maxExp - minExp + 1));
        result.push({
          id: `NT_COACH_${Math.random().toString(36).substr(2, 9)}`,
          firstName: namePair.firstName,
          lastName: namePair.lastName,
          age: 35 + Math.floor(Math.random() * 35),
          nationality: region,
          nationalityFlag: "\u{1F30D}",
          currentClubId: null,
          currentNationalTeamId: null,
          isNationalTeamCoach: true,
          hiredDate: DEFAULT_HIRED_DATE,
          contractEndDate: CoachService.getDefaultContractEndDate(DEFAULT_HIRED_DATE),
          annualSalary: 0,
          expPoints: 1,
          blacklist: {},
          attributes: {
            experience: exp,
            decisionMaking: 20 + Math.floor(Math.random() * 79),
            motivation: 20 + Math.floor(Math.random() * 79),
            training: 20 + Math.floor(Math.random() * 79)
          },
          favoriteTactics: {
            offensive: randomTactic(TACTICS_OFFENSIVE),
            neutral: randomTactic(TACTICS_NEUTRAL),
            defensive: randomTactic(TACTICS_DEFENSIVE)
          },
          history: [],
          seasonStats: []
        });
      }
    });
    return result;
  },
  evaluatePerformance: (club, coach, rank) => {
    const pressure = calculatePerformancePressure(club, rank, coach.expPoints);
    const finalChance = pressure.finalChance;
    if (finalChance <= 0) return { fire: false, reason: "" };
    if (Math.random() < finalChance) {
      return { fire: true, reason: pressure.reason };
    }
    return { fire: false, reason: "" };
  }
};

// services/PolishThirdLeagueService.ts
var THIRD_LEAGUE_GROUP_IDS = [
  "L_PL_4_G1",
  "L_PL_4_G2",
  "L_PL_4_G3",
  "L_PL_4_G4"
];

// services/ReserveTeamLeagueService.ts
var PLAYABLE_POLISH_LEAGUE_IDS = /* @__PURE__ */ new Set([
  "L_PL_1",
  "L_PL_2",
  "L_PL_3",
  ...THIRD_LEAGUE_GROUP_IDS
]);

// services/ManagerJobService.ts
function getLeagueTier(club) {
  const tier = Number.parseInt(String(club.leagueId).split("_")[2] || "", 10);
  return Number.isFinite(tier) ? tier : club.tier ?? 4;
}
function getRequiredManagerExp(club) {
  const tier = getLeagueTier(club);
  const reputation = club.reputation ?? 5;
  if (tier === 1) return Math.round(130 + reputation * 18);
  if (tier === 2) return Math.round(35 + reputation * 9);
  return Math.max(1, Math.round(reputation * 4));
}

// services/ManagerContractService.ts
var DAY_MS = 864e5;
var BOARD_LEVEL = {
  bardzo_niska: 1,
  niska: 2,
  przecietna: 3,
  wysoka: 4,
  bardzo_wysoka: 5
};
var clamp5 = (value, min, max) => Math.max(min, Math.min(max, value));
var SALARY_MODEL_VERSION = 4;
var SALARY_STEP = 5e5;
var MANAGER_SALARY_NEGOTIATION_STEP = 1e5;
var RELEGATION_MANAGER_SURVIVAL_CHANCE = 0.05;
var roundSalary2 = (value) => Math.max(SALARY_STEP, Math.round(value / SALARY_STEP) * SALARY_STEP);
var normalizeNegotiatedSalary = (value) => Math.max(MANAGER_SALARY_NEGOTIATION_STEP, Math.round(value / MANAGER_SALARY_NEGOTIATION_STEP) * MANAGER_SALARY_NEGOTIATION_STEP);
var getTier = (club) => {
  const parsed = Number.parseInt(String(club.leagueId).split("_")[2] || "", 10);
  return Number.isFinite(parsed) ? parsed : Math.max(1, club.tier ?? 3);
};
var getLeagueSize = (club, clubs) => Math.max(16, clubs.filter((candidate) => candidate.leagueId === club.leagueId).length);
var getDayTimestamp = (value) => {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return Number.NaN;
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};
function getManagerTenureSnapshot(contract, club, fixtures, currentDate2) {
  if (!contract || contract.clubId !== club.id) {
    return {
      daysInRole: Number.POSITIVE_INFINITY,
      leagueMatchesManaged: Math.max(0, club.stats.played ?? 0),
      pressureStage: "FULL",
      dismissalEligible: true
    };
  }
  const signedAt2 = getDayTimestamp(contract.signedAt || contract.terms.startDate);
  const currentDay = getDayTimestamp(currentDate2);
  if (!Number.isFinite(signedAt2) || !Number.isFinite(currentDay)) {
    return { daysInRole: 0, leagueMatchesManaged: 0, pressureStage: "NONE", dismissalEligible: false };
  }
  const leagueMatchesManaged = fixtures.filter((fixture) => {
    if (fixture.status !== "FINISHED" /* FINISHED */ || fixture.leagueId !== club.leagueId) return false;
    if (fixture.homeTeamId !== club.id && fixture.awayTeamId !== club.id) return false;
    const fixtureDay = getDayTimestamp(fixture.date);
    return Number.isFinite(fixtureDay) && fixtureDay >= signedAt2 && fixtureDay <= currentDay;
  }).length;
  const daysInRole = Math.max(0, Math.floor((currentDay - signedAt2) / DAY_MS));
  const pressureStage = daysInRole < 21 || leagueMatchesManaged < 3 ? "NONE" : daysInRole < 42 || leagueMatchesManaged < 6 ? "CONCERN" : "FULL";
  return {
    daysInRole,
    leagueMatchesManaged,
    pressureStage,
    dismissalEligible: daysInRole >= 60 && leagueMatchesManaged >= 8
  };
}
function getManagerPolishChampionshipCount(profile) {
  if (!profile) return 0;
  const achievementTitles = new Set(
    (profile.achievements ?? []).filter((entry) => entry.competition === "Ekstraklasa" && /^Mistrz Polski\b/i.test(entry.title)).map((entry) => entry.seasonLabel || entry.id)
  );
  const expHistoryTitles = new Set(
    (profile.expHistory ?? []).filter((entry) => entry.label === "Mistrzostwo Polski").map((entry) => String(entry.season))
  );
  return Math.max(achievementTitles.size, expHistoryTitles.size);
}
function calculateClubManagerSalaryBenchmark(club) {
  const tier = getTier(club);
  const reputation = clamp5(club.reputation ?? 5, 1, 20);
  if (tier === 1) return roundSalary2(clamp5(2e6 + reputation * 3e5, 25e5, 5e6));
  if (tier === 2) return roundSalary2(clamp5(7e5 + reputation * 16e4, 1e6, 25e5));
  if (tier === 3) return roundSalary2(clamp5(4e5 + reputation * 9e4, 5e5, 15e5));
  return roundSalary2(clamp5(25e4 + reputation * 5e4, 5e5, 1e6));
}
function calculateManagerNegotiationSalaryCeiling(club, profile) {
  const clubSalaryBenchmark = calculateClubManagerSalaryBenchmark(club);
  const tier = getTier(club);
  const requiredExp = Math.max(1, getRequiredManagerExp(club));
  const managerExp = Math.max(1, profile?.expPoints ?? 1);
  const experienceRatio = managerExp / requiredExp;
  const polishChampionships = getManagerPolishChampionshipCount(profile);
  const careerSeasons = Math.max(0, profile?.careerHistory?.length ?? 0);
  const experienceGrowth = clamp5(Math.log2(Math.max(1, experienceRatio)) * 0.025, 0, 0.22);
  const honoursGrowth = clamp5(Math.max(0, polishChampionships - 1) * 0.07, 0, 0.28);
  const longevityGrowth = clamp5(Math.max(0, careerSeasons - 3) * 0.015, 0, 0.08);
  const managerGrowth = experienceGrowth + honoursGrowth + longevityGrowth;
  const financialStrength = Math.max(0, club.budget ?? 0) + Math.max(0, club.transferBudget ?? 0) * 0.35;
  const wealthThreshold = tier === 1 ? 6e7 : tier === 2 ? 18e6 : tier === 3 ? 6e6 : 2e6;
  const wealthRange = tier === 1 ? 3e8 : tier === 2 ? 9e7 : tier === 3 ? 3e7 : 12e6;
  const financialGrowthCapacity = clamp5((financialStrength - wealthThreshold) / wealthRange, 0, 0.55);
  const dynamicGrowth = Math.min(managerGrowth, financialGrowthCapacity);
  return normalizeNegotiatedSalary(clubSalaryBenchmark * (1 + dynamicGrowth));
}
function getManagerSalaryLeverage(club, profile) {
  const requiredExp = Math.max(1, getRequiredManagerExp(club));
  const managerExp = Math.max(1, profile?.expPoints ?? 1);
  const ratio = clamp5(managerExp / requiredExp, 0, 1.5);
  const polishChampionships = getManagerPolishChampionshipCount(profile);
  const careerSeasons = Math.max(0, profile?.careerHistory?.length ?? 0);
  const clubSalaryBenchmark = calculateClubManagerSalaryBenchmark(club);
  const negotiationSalaryCeiling = calculateManagerNegotiationSalaryCeiling(club, profile);
  const experienceContribution = clamp5((ratio - 0.1) / 0.9, 0, 1) * 0.06;
  const offerMultiplier = clamp5(
    0.5 + Math.min(3, polishChampionships) * 0.12 + experienceContribution + Math.min(5, careerSeasons) * 8e-3,
    0.5,
    0.94
  );
  const maxNegotiatedPremium = clamp5(
    0.08 + Math.min(3, polishChampionships) * 0.085 + Math.min(1, ratio) * 0.04,
    0.08,
    0.38
  );
  return {
    requiredExp,
    managerExp,
    polishChampionships,
    clubSalaryBenchmark,
    negotiationSalaryCeiling,
    offerMultiplier,
    maxNegotiatedPremium,
    isDiscountedOffer: offerMultiplier < 0.8
  };
}
var getSeasonEnd = (startDate, durationYears) => {
  return new Date(startDate.getFullYear() + durationYears, 5, 30, 12, 0, 0, 0);
};
var target = (club, clubs, type, label, description, ambitionLevel, leagueMaxRank, requiresPolishCup = false) => ({
  id: `${club.leagueId}:${type}:${leagueMaxRank}:${requiresPolishCup ? "CUP" : "LEAGUE"}`,
  type,
  label,
  description,
  ambitionLevel,
  leagueMaxRank: clamp5(leagueMaxRank, 1, getLeagueSize(club, clubs)),
  requiresPolishCup
});
function getAvailableTargets(club, clubs) {
  const tier = getTier(club);
  const leagueSize = getLeagueSize(club, clubs);
  const survivalRank = Math.max(10, leagueSize - 3);
  const middleRank = Math.max(8, Math.ceil(leagueSize * 0.58));
  if (tier >= 2) {
    const promotionDestination = tier === 2 ? "Ekstraklasy" : tier === 3 ? "1. ligi" : "wy\u017Cszej ligi";
    return [
      target(club, clubs, "SURVIVAL", "Utrzymanie w lidze", "Zesp\xF3\u0142 ma utrzyma\u0107 si\u0119 w lidze i zako\u0144czy\u0107 sezon poza stref\u0105 spadkow\u0105.", 1, survivalRank),
      target(club, clubs, "MID_TABLE", "Bezpieczny \u015Brodek tabeli", "Celem jest spokojny sezon i stabilna pozycja w \u015Brodku tabeli.", 2, middleRank),
      target(club, clubs, "PROMOTION_PLAYOFFS", "Miejsce bara\u017Cowe", "Dru\u017Cyna ma zakwalifikowa\u0107 si\u0119 do bara\u017Cy o awans.", 3, 6),
      target(club, clubs, "PROMOTION", `Awans do ${promotionDestination}`, `Celem jest wywalczenie bezpo\u015Bredniego awansu do ${promotionDestination}.`, 4, 2),
      target(club, clubs, "POLISH_CUP", "Zdobycie Pucharu Polski", `Zesp\xF3\u0142 ma utrzyma\u0107 bezpieczn\u0105 pozycj\u0119 ligow\u0105 i zdoby\u0107 Puchar Polski.`, 5, middleRank, true),
      target(club, clubs, "PROMOTION_AND_CUP", `Awans do ${promotionDestination} i Puchar Polski`, `Celem jest bezpo\u015Bredni awans do ${promotionDestination} oraz zdobycie Pucharu Polski w tym samym sezonie.`, 7, 2, true)
    ];
  }
  return [
    target(club, clubs, "SURVIVAL", "Utrzymanie w Ekstraklasie", "Zesp\xF3\u0142 ma unikn\u0105\u0107 spadku i zachowa\u0107 miejsce w Ekstraklasie.", 1, survivalRank),
    target(club, clubs, "MID_TABLE", "\u015Arodek tabeli", "Celem jest stabilna pozycja w \u015Brodku tabeli.", 2, middleRank),
    target(club, clubs, "TOP_SIX", "G\xF3rna sz\xF3stka", "Celem jest zako\u0144czenie sezonu w g\xF3rnej cz\u0119\u015Bci tabeli.", 3, 6),
    target(club, clubs, "TOP_THREE", "Podium", "Celem jest miejsce na podium i walka o europejskie puchary.", 4, 3),
    target(club, clubs, "CHAMPION", "Mistrzostwo Polski", "Celem jest zdobycie Mistrzostwa Polski.", 5, 1),
    target(club, clubs, "POLISH_CUP", "Zdobycie Pucharu Polski", "Zesp\xF3\u0142 ma utrzyma\u0107 stabiln\u0105 pozycj\u0119 ligow\u0105 i zdoby\u0107 Puchar Polski.", 5, middleRank, true),
    target(club, clubs, "LEAGUE_AND_CUP", "Mistrzostwo i Puchar Polski", "Celem jest zdobycie Mistrzostwa Polski oraz Pucharu Polski w tym samym sezonie.", 7, 1, true)
  ];
}
function getBoardPreferredTarget(club, clubs) {
  const options = getAvailableTargets(club, clubs);
  const expectation = BOARD_LEVEL[club.board?.oczekiwania ?? "przecietna"];
  const ambition = BOARD_LEVEL[club.board?.ambicja ?? "przecietna"];
  const reputationBoost = (club.reputation ?? 5) >= 9 ? 1 : 0;
  const preferredAmbition = clamp5(Math.round(expectation * 0.65 + ambition * 0.35 + reputationBoost), 1, 5);
  return [...options].filter((option) => option.type !== "POLISH_CUP" && option.type !== "LEAGUE_AND_CUP" && option.type !== "PROMOTION_AND_CUP").sort((a, b) => Math.abs(a.ambitionLevel - preferredAmbition) - Math.abs(b.ambitionLevel - preferredAmbition))[0];
}
var normalizeTargetForClub = (currentTarget, club, clubs) => {
  const availableTargets = getAvailableTargets(club, clubs);
  const exactTarget = availableTargets.find((option) => option.type === currentTarget.type);
  if (exactTarget) return exactTarget;
  const tier = getTier(club);
  const replacementType = tier >= 2 ? currentTarget.type === "CHAMPION" ? "PROMOTION" : currentTarget.type === "LEAGUE_AND_CUP" ? "PROMOTION_AND_CUP" : null : currentTarget.type === "PROMOTION_AND_CUP" ? "LEAGUE_AND_CUP" : null;
  const replacement = replacementType ? availableTargets.find((option) => option.type === replacementType) : null;
  if (replacement) return replacement;
  return [...availableTargets].sort(
    (a, b) => Math.abs(a.ambitionLevel - currentTarget.ambitionLevel) - Math.abs(b.ambitionLevel - currentTarget.ambitionLevel)
  )[0];
};
function normalizeManagerContractTargets(contract, club, clubs) {
  return {
    ...contract,
    terms: {
      ...contract.terms,
      target: normalizeTargetForClub(contract.terms.target, club, clubs)
    }
  };
}
function normalizeManagerContractNegotiationTargets(negotiation, club, clubs) {
  const availableTargets = getAvailableTargets(club, clubs);
  return {
    ...negotiation,
    availableTargets,
    clubTerms: {
      ...negotiation.clubTerms,
      target: normalizeTargetForClub(negotiation.clubTerms.target, club, clubs)
    },
    agreedTerms: negotiation.agreedTerms ? {
      ...negotiation.agreedTerms,
      target: normalizeTargetForClub(negotiation.agreedTerms.target, club, clubs)
    } : void 0
  };
}
function getBoardMinimumTarget(club, clubs) {
  const preferred = getBoardPreferredTarget(club, clubs);
  const minimumAmbition = Math.max(1, preferred.ambitionLevel - 1);
  const leagueTargets = getAvailableTargets(club, clubs).filter((option) => !option.requiresPolishCup).sort((a, b) => a.ambitionLevel - b.ambitionLevel);
  return leagueTargets.find((option) => option.ambitionLevel >= minimumAmbition) ?? preferred;
}
function calculateBaseSalary(club, profile) {
  const leverage = getManagerSalaryLeverage(club, profile);
  return roundSalary2(leverage.clubSalaryBenchmark * leverage.offerMultiplier);
}
function calculateSalaryForTarget(club, clubs, profile, selectedTarget) {
  const preferred = getBoardPreferredTarget(club, clubs);
  const ambitionDelta = selectedTarget.ambitionLevel - preferred.ambitionLevel;
  const multiplier = ambitionDelta >= 0 ? 1 + ambitionDelta * 0.13 : 1 + ambitionDelta * 0.09;
  const salaryCeiling = calculateManagerNegotiationSalaryCeiling(club, profile);
  return Math.min(salaryCeiling, roundSalary2(calculateBaseSalary(club, profile) * clamp5(multiplier, 0.72, 1.85)));
}
function createTerms(club, clubs, profile, startDate, selectedTarget = getBoardPreferredTarget(club, clubs), durationYears = 2) {
  return {
    startDate: startDate.toISOString(),
    endDate: getSeasonEnd(startDate, durationYears).toISOString(),
    durationYears,
    annualSalary: calculateSalaryForTarget(club, clubs, profile, selectedTarget),
    target: selectedTarget,
    salaryModelVersion: SALARY_MODEL_VERSION,
    salaryReviewAfterOneSeason: getManagerSalaryLeverage(club, profile).isDiscountedOffer
  };
}
function createNegotiation(club, clubs, profile, startDate, source, jobOfferId, proposedTerms) {
  const availableTargets = getAvailableTargets(club, clubs);
  const clubTerms = proposedTerms?.salaryModelVersion === SALARY_MODEL_VERSION ? proposedTerms : createTerms(club, clubs, profile, startDate);
  return {
    id: `MANAGER_CONTRACT_NEGOTIATION_${club.id}_${startDate.toISOString()}_${Math.random().toString(36).slice(2, 8)}`,
    clubId: club.id,
    source,
    jobOfferId,
    status: "NEGOTIATING",
    roundsUsed: 0,
    maxRounds: 4 + Math.floor(Math.random() * 4),
    availableTargets,
    clubTerms,
    message: source === "RENEWAL" ? "Zarz\u0105d chce om\xF3wi\u0107 warunki dalszej wsp\xF3\u0142pracy." : source === "RENEGOTIATION" ? "Zarz\u0105d zgodzi\u0142 si\u0119 rozpocz\u0105\u0107 renegocjacj\u0119 obowi\u0105zuj\u0105cego kontraktu." : "Zarz\u0105d przedstawi\u0142 warunki obj\u0119cia pierwszego zespo\u0142u.",
    lastResponseType: "INFO",
    startedAt: startDate.toISOString()
  };
}
var getNegotiationAcceptanceChance = (negotiation, club, proposedTerms, profile) => {
  const currentAmbition = negotiation.clubTerms.target.ambitionLevel;
  const requestedAmbition = proposedTerms.target.ambitionLevel;
  const delta = requestedAmbition - currentAmbition;
  const board = club.board;
  const ambition = BOARD_LEVEL[board?.ambicja ?? "przecietna"];
  const generosity = BOARD_LEVEL[board?.hojnosc ?? "przecietna"];
  const greed = BOARD_LEVEL[board?.chciwosc ?? "przecietna"];
  const patience = BOARD_LEVEL[board?.cierpliwosc ?? "przecietna"];
  const competence = BOARD_LEVEL[board?.kompetencja ?? "przecietna"];
  const expBonus = Math.min(12, Math.log10(Math.max(1, profile?.expPoints ?? 1) + 9) * 4);
  const salaryLeverage = getManagerSalaryLeverage(club, profile);
  const salaryRatio = proposedTerms.annualSalary / Math.max(1, negotiation.clubTerms.annualSalary);
  const salaryPremium = Math.max(0, salaryRatio - 1);
  const salaryDiscount = Math.max(0, 1 - salaryRatio);
  let chance = 82 + expBonus;
  if (delta > 0) {
    chance = 44 + ambition * 7 + generosity * 5 - greed * 4 - delta * 10 + expBonus;
  } else if (delta < 0) {
    chance = 48 + patience * 5 + greed * 3 - ambition * 8 - Math.abs(delta) * 9 + expBonus;
  }
  const premiumTolerance = 1 + salaryLeverage.maxNegotiatedPremium * 1.8;
  chance -= salaryPremium / premiumTolerance * (45 + greed * 5 - generosity * 3);
  chance += salaryDiscount * (8 + generosity * 2);
  if (proposedTerms.durationYears === 3) chance += patience * 2 - greed * 2;
  if (proposedTerms.durationYears === 1) chance += greed * 2 - patience;
  chance += competence * 1.5;
  return clamp5(Math.round(chance), 8, 94);
};
var getExceptionalSalaryAcceptanceChance = (negotiation, club, proposedTerms, standardSalaryLimit, profile) => {
  const leverage = getManagerSalaryLeverage(club, profile);
  if (proposedTerms.annualSalary > leverage.negotiationSalaryCeiling) return 0;
  const generosity = BOARD_LEVEL[club.board?.hojnosc ?? "przecietna"];
  const ambition = BOARD_LEVEL[club.board?.ambicja ?? "przecietna"];
  const excessRatio = proposedTerms.annualSalary / Math.max(1, standardSalaryLimit) - 1;
  const targetBonus = Math.max(0, proposedTerms.target.ambitionLevel - negotiation.clubTerms.target.ambitionLevel) * 0.45;
  const chance = 0.6 + generosity * 0.35 + ambition * 0.15 + leverage.polishChampionships * 0.55 + targetBonus - excessRatio * 3.5;
  return clamp5(chance, 0.35, 6);
};
var counterTarget = (negotiation, requestedTarget) => {
  const ordered = [...negotiation.availableTargets].sort((a, b) => a.ambitionLevel - b.ambitionLevel);
  const currentIndex = ordered.findIndex((option) => option.id === negotiation.clubTerms.target.id);
  const requestedIndex = ordered.findIndex((option) => option.id === requestedTarget.id);
  if (currentIndex < 0 || requestedIndex < 0 || currentIndex === requestedIndex) return negotiation.clubTerms.target;
  const step = requestedIndex > currentIndex ? 1 : -1;
  return ordered[clamp5(currentIndex + step, 0, ordered.length - 1)];
};
function negotiate(negotiation, club, clubs, profile, targetId, durationYears, proposedAnnualSalary) {
  if (negotiation.status !== "NEGOTIATING") return negotiation;
  const selectedTarget = negotiation.availableTargets.find((option) => option.id === targetId) ?? negotiation.clubTerms.target;
  const startDate = new Date(negotiation.clubTerms.startDate);
  const calculatedTerms = createTerms(club, clubs, profile, startDate, selectedTarget, durationYears);
  const requestedTerms = {
    ...calculatedTerms,
    annualSalary: Number.isFinite(proposedAnnualSalary) ? normalizeNegotiatedSalary(proposedAnnualSalary) : calculatedTerms.annualSalary
  };
  const roundsUsed = negotiation.roundsUsed + 1;
  const preferredTarget = getBoardPreferredTarget(club, clubs);
  const minimumTarget = getBoardMinimumTarget(club, clubs);
  const hardVeto = selectedTarget.ambitionLevel < minimumTarget.ambitionLevel;
  const salaryLeverage = getManagerSalaryLeverage(club, profile);
  const standardSalaryLimit = Math.min(
    salaryLeverage.negotiationSalaryCeiling,
    normalizeNegotiatedSalary(calculatedTerms.annualSalary * (1 + salaryLeverage.maxNegotiatedPremium))
  );
  if (hardVeto) {
    const vetoMessage = `Veto zarz\u0105du: cel \u201E${selectedTarget.label}\u201D jest nie do przyj\u0119cia. Ambicj\u0105 klubu jest \u201E${preferredTarget.label}\u201D, a najni\u017Cszy cel, o kt\xF3rym zarz\u0105d mo\u017Ce rozmawia\u0107, to \u201E${minimumTarget.label}\u201D. Klub podtrzymuje swoj\u0105 propozycj\u0119 i oczekuje wyra\u017Anie ambitniejszego planu.`;
    if (roundsUsed >= negotiation.maxRounds) {
      return {
        ...negotiation,
        roundsUsed,
        status: "FAILED",
        lastResponseType: "FAILED",
        message: `${vetoMessage} Zarz\u0105d zako\u0144czy\u0142 negocjacje z powodu zbyt du\u017Cej r\xF3\u017Cnicy w ocenie potencja\u0142u dru\u017Cyny.`
      };
    }
    return {
      ...negotiation,
      roundsUsed,
      clubTerms: createTerms(club, clubs, profile, startDate, preferredTarget, negotiation.clubTerms.durationYears),
      lastResponseType: "VETO",
      message: vetoMessage
    };
  }
  if (requestedTerms.annualSalary > standardSalaryLimit) {
    const exceptionalChance = getExceptionalSalaryAcceptanceChance(
      negotiation,
      club,
      requestedTerms,
      standardSalaryLimit,
      profile
    );
    const exceptionalAccepted = exceptionalChance > 0 && negotiation.roundsUsed > 0 && Math.random() * 100 <= exceptionalChance;
    if (exceptionalAccepted) {
      return {
        ...negotiation,
        roundsUsed,
        status: "AGREED",
        agreedTerms: requestedTerms,
        lastResponseType: "ACCEPTED",
        message: "Zarz\u0105d wyj\u0105tkowo zaakceptowa\u0142 proponowane warunki finansowe. Kontrakt jest gotowy do podpisania."
      };
    }
    const aboveClubCeiling = requestedTerms.annualSalary > salaryLeverage.negotiationSalaryCeiling;
    const salaryMessage = aboveClubCeiling ? `Proponowane wynagrodzenie przekracza obecne mo\u017Cliwo\u015Bci finansowe klubu oraz poziom warunk\xF3w uzasadniony Pana dotychczasowym dorobkiem. Zarz\u0105d mo\u017Ce obecnie rozmawia\u0107 o stawce do ${salaryLeverage.negotiationSalaryCeiling.toLocaleString("pl-PL")} PLN rocznie.` : salaryLeverage.managerExp < salaryLeverage.requiredExp ? `Po przeanalizowaniu Pana dotychczasowego do\u015Bwiadczenia Zarz\u0105d uzna\u0142, \u017Ce proponowane wynagrodzenie znacz\u0105co wykracza poza standardowe warunki. Klub podtrzymuje ofert\u0119 w wysoko\u015Bci ${standardSalaryLimit.toLocaleString("pl-PL")} PLN rocznie. Wy\u017Csza stawka mo\u017Ce zosta\u0107 zaakceptowana wy\u0142\u0105cznie w drodze wyj\u0105tkowej decyzji Zarz\u0105du. Po zako\u0144czeniu pe\u0142nego sezonu pracy b\u0119dzie Pan m\xF3g\u0142 wyst\u0105pi\u0107 o renegocjacj\u0119 warunk\xF3w kontraktu.` : `Zarz\u0105d wysoko ocenia Pana do\u015Bwiadczenie, jednak proponowane wynagrodzenie wykracza poza standardowe warunki. Klub podtrzymuje ofert\u0119 w wysoko\u015Bci ${standardSalaryLimit.toLocaleString("pl-PL")} PLN rocznie.`;
    if (roundsUsed >= negotiation.maxRounds) {
      return {
        ...negotiation,
        roundsUsed,
        status: "FAILED",
        lastResponseType: "FAILED",
        message: `${salaryMessage} Zarz\u0105d zako\u0144czy\u0142 negocjacje.`
      };
    }
    return {
      ...negotiation,
      roundsUsed,
      clubTerms: { ...negotiation.clubTerms, annualSalary: standardSalaryLimit },
      lastResponseType: "VETO",
      message: salaryMessage
    };
  }
  const proposalDiffersFromClubTerms = selectedTarget.id !== negotiation.clubTerms.target.id || durationYears !== negotiation.clubTerms.durationYears || requestedTerms.annualSalary !== negotiation.clubTerms.annualSalary;
  const requiresOpeningCounter = negotiation.roundsUsed === 0 && proposalDiffersFromClubTerms;
  const accepted = !requiresOpeningCounter && Math.random() * 100 <= getNegotiationAcceptanceChance(negotiation, club, requestedTerms, profile);
  if (accepted) {
    return {
      ...negotiation,
      roundsUsed,
      status: "AGREED",
      agreedTerms: requestedTerms,
      lastResponseType: "ACCEPTED",
      message: "Zarz\u0105d zaakceptowa\u0142 proponowane warunki. Kontrakt jest gotowy do podpisania."
    };
  }
  if (roundsUsed >= negotiation.maxRounds) {
    return {
      ...negotiation,
      roundsUsed,
      status: "FAILED",
      lastResponseType: "FAILED",
      message: "Zarz\u0105d zako\u0144czy\u0142 rozmowy. Nie uda\u0142o si\u0119 osi\u0105gn\u0105\u0107 porozumienia."
    };
  }
  const proposedCounterTarget = counterTarget(negotiation, selectedTarget);
  const nextTarget = proposedCounterTarget.ambitionLevel < minimumTarget.ambitionLevel ? minimumTarget : proposedCounterTarget;
  const counterDuration = Math.random() < 0.55 ? durationYears : negotiation.clubTerms.durationYears;
  const baseCounter = createTerms(club, clubs, profile, startDate, nextTarget, counterDuration);
  const salaryBlend = roundSalary2(baseCounter.annualSalary * 0.72 + requestedTerms.annualSalary * 0.28);
  const clubTerms = { ...baseCounter, annualSalary: salaryBlend };
  return {
    ...negotiation,
    roundsUsed,
    clubTerms,
    lastResponseType: "COUNTER",
    message: requiresOpeningCounter ? `Zarz\u0105d nie podpisze zmienionych warunk\xF3w bez negocjacji. Klub przedstawia kontrofert\u0119: cel \u201E${clubTerms.target.label}\u201D, umowa na ${clubTerms.durationYears} ${clubTerms.durationYears === 1 ? "rok" : "lata"} i wynagrodzenie ${clubTerms.annualSalary.toLocaleString("pl-PL")} PLN rocznie.` : selectedTarget.ambitionLevel > negotiation.clubTerms.target.ambitionLevel ? "Zarz\u0105d docenia ambicj\u0119, ale proponuje ostro\u017Cniejszy cel i skorygowan\u0105 stawk\u0119." : selectedTarget.ambitionLevel < negotiation.clubTerms.target.ambitionLevel ? `Zarz\u0105d uwa\u017Ca cel \u201E${selectedTarget.label}\u201D za zbyt zachowawczy. Klub przedstawia kontrofert\u0119 opart\u0105 na celu \u201E${clubTerms.target.label}\u201D.` : "Zarz\u0105d nie zaakceptowa\u0142 wszystkich warunk\xF3w i przedstawi\u0142 now\u0105 ofert\u0119."
  };
}
function createSignedContract(negotiation, signedAt2) {
  if (negotiation.status !== "AGREED" || !negotiation.agreedTerms) return null;
  return {
    id: `MANAGER_CONTRACT_${negotiation.clubId}_${signedAt2.toISOString()}_${Math.random().toString(36).slice(2, 7)}`,
    clubId: negotiation.clubId,
    signedAt: signedAt2.toISOString(),
    source: negotiation.source,
    status: "ACTIVE",
    terms: negotiation.agreedTerms,
    standardRenewalMonths: 3 + Math.floor(Math.random() * 4),
    earlyRenewalChecked: false
  };
}
function createLegacyContract(club, clubs, profile, seasonStartDate) {
  const stableSeed = `${club.id}:${seasonStartDate.getFullYear()}`.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const terms = createTerms(club, clubs, profile, seasonStartDate, void 0, 2);
  return {
    id: `MANAGER_CONTRACT_LEGACY_${club.id}_${seasonStartDate.getFullYear()}`,
    clubId: club.id,
    signedAt: seasonStartDate.toISOString(),
    source: "CAREER_START",
    status: "ACTIVE",
    terms,
    standardRenewalMonths: 3 + stableSeed % 4,
    earlyRenewalChecked: false
  };
}
function getLeagueRank(club, clubs) {
  const leagueClubs = clubs.filter((candidate) => candidate.leagueId === club.leagueId);
  const sorted = [...leagueClubs].sort(
    (a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference || b.stats.goalsFor - a.stats.goalsFor
  );
  const rank = sorted.findIndex((candidate) => candidate.id === club.id) + 1;
  return rank > 0 ? rank : getLeagueSize(club, clubs);
}
var getPolishCupState = (clubId, fixtures) => {
  const cupFixtures = fixtures.filter((fixture) => fixture.leagueId === "POLISH_CUP" /* POLISH_CUP */);
  if (cupFixtures.length === 0) return "NOT_STARTED";
  const final = cupFixtures.find((fixture) => fixture.status === "FINISHED" /* FINISHED */ && /FINAŁ|FINAL/i.test(fixture.id));
  if (final) {
    const winnerId = (final.homeScore ?? 0) !== (final.awayScore ?? 0) ? (final.homeScore ?? 0) > (final.awayScore ?? 0) ? final.homeTeamId : final.awayTeamId : (final.homePenaltyScore ?? 0) > (final.awayPenaltyScore ?? 0) ? final.homeTeamId : final.awayTeamId;
    return winnerId === clubId ? "WON" : "OUT";
  }
  if (cupFixtures.some((fixture) => fixture.status === "SCHEDULED" /* SCHEDULED */ && (fixture.homeTeamId === clubId || fixture.awayTeamId === clubId))) return "ALIVE";
  if (cupFixtures.some((fixture) => fixture.status === "FINISHED" /* FINISHED */ && (fixture.homeTeamId === clubId || fixture.awayTeamId === clubId))) return "OUT";
  return "NOT_STARTED";
};
function evaluateContractPerformance(contract, club, clubs, fixtures) {
  const rank = getLeagueRank(club, clubs);
  const target2 = contract.terms.target;
  const played = Math.max(0, club.stats.played);
  const rankGap = rank - target2.leagueMaxRank;
  const leagueScore = played < 3 ? 55 : clamp5(88 - rankGap * 10 + Math.max(0, -rankGap) * 3, 5, 100);
  const cupState = getPolishCupState(club.id, fixtures);
  const cupScore = !target2.requiresPolishCup ? 100 : cupState === "WON" ? 100 : cupState === "ALIVE" ? 68 : cupState === "NOT_STARTED" ? 55 : 15;
  const score = target2.requiresPolishCup ? Math.round(leagueScore * 0.58 + cupScore * 0.42) : Math.round(leagueScore);
  const targetMet = rank <= target2.leagueMaxRank && (!target2.requiresPolishCup || cupState === "WON");
  return {
    score,
    rank,
    cupState,
    targetMet,
    summary: `Aktualna pozycja: ${rank}. Cel kontraktowy: ${target2.label}.`
  };
}
function shouldOfferRenewal(contract, club, clubs, fixtures, early) {
  const performance = evaluateContractPerformance(contract, club, clubs, fixtures);
  const patience = BOARD_LEVEL[club.board?.cierpliwosc ?? "przecietna"];
  const ambition = BOARD_LEVEL[club.board?.ambicja ?? "przecietna"];
  const competence = BOARD_LEVEL[club.board?.kompetencja ?? "przecietna"];
  const threshold = early ? 78 : 48 + ambition * 4 - patience * 2;
  const rngChance = clamp5(28 + performance.score * 0.58 + patience * 4 + competence * 3 - ambition * 3, 8, 96);
  return performance.score >= threshold && Math.random() * 100 <= rngChance;
}
function daysUntilContractEnd(contract, date) {
  return Math.ceil((new Date(contract.terms.endDate).getTime() - date.getTime()) / DAY_MS);
}
function getManagerContractRenegotiationEligibility(contract, date) {
  if (!contract || contract.status !== "ACTIVE") {
    return { eligible: false, reason: "Brak aktywnego kontraktu trenera." };
  }
  if (contract.renewalDecision) {
    return {
      eligible: false,
      reason: "Decyzja dotycz\u0105ca dalszej wsp\xF3\u0142pracy zosta\u0142a ju\u017C podj\u0119ta w ramach obecnego cyklu kontraktowego."
    };
  }
  const eligibleAt = new Date(contract.signedAt);
  eligibleAt.setFullYear(eligibleAt.getFullYear() + 1);
  if (date.getTime() < eligibleAt.getTime()) {
    return {
      eligible: false,
      eligibleAt,
      reason: `Renegocjacja b\u0119dzie mo\u017Cliwa po pe\u0142nym roku pracy, od ${eligibleAt.toLocaleDateString("pl-PL")}.`
    };
  }
  if (contract.lastRenegotiationRequestAt) {
    const retryAt = new Date(contract.lastRenegotiationRequestAt);
    retryAt.setDate(retryAt.getDate() + 90);
    if (date.getTime() < retryAt.getTime()) {
      return {
        eligible: false,
        retryAt,
        reason: `Zarz\u0105d wr\xF3ci do kolejnego wniosku najwcze\u015Bniej ${retryAt.toLocaleDateString("pl-PL")}.`
      };
    }
  }
  return { eligible: true, eligibleAt, reason: "Mo\u017Cesz wyst\u0105pi\u0107 do zarz\u0105du o renegocjacj\u0119 kontraktu." };
}
function shouldDismissManagerAfterRelegation(randomValue = Math.random()) {
  return clamp5(randomValue, 0, 1) >= RELEGATION_MANAGER_SURVIVAL_CHANCE;
}
var ManagerContractService = {
  SALARY_MODEL_VERSION,
  MANAGER_SALARY_NEGOTIATION_STEP,
  RELEGATION_MANAGER_SURVIVAL_CHANCE,
  normalizeNegotiatedSalary,
  getManagerPolishChampionshipCount,
  calculateClubManagerSalaryBenchmark,
  calculateManagerNegotiationSalaryCeiling,
  getManagerSalaryLeverage,
  getManagerTenureSnapshot,
  getAvailableTargets,
  normalizeManagerContractTargets,
  normalizeManagerContractNegotiationTargets,
  getBoardPreferredTarget,
  getBoardMinimumTarget,
  calculateBaseSalary,
  calculateSalaryForTarget,
  createTerms,
  createNegotiation,
  negotiate,
  createSignedContract,
  createLegacyContract,
  getLeagueRank,
  evaluateContractPerformance,
  shouldOfferRenewal,
  daysUntilContractEnd,
  getManagerContractRenegotiationEligibility,
  shouldDismissManagerAfterRelegation
};

// services/MailService.ts
var formatSeasonMovementRoute = (from, to) => {
  const leagueDisplayName = {
    "ekstraklasy": "Ekstraklasa",
    "1. ligi": "1. Liga",
    "2. ligi": "2. Liga",
    "regionalna": "Liga Regionalna",
    "regionalnej": "Liga Regionalna"
  };
  const normalizeLeagueName = (name) => leagueDisplayName[name.trim().toLocaleLowerCase("pl-PL")] ?? name;
  return `${normalizeLeagueName(from)} -> ${normalizeLeagueName(to)}`;
};
var getWCQPlayoffWinner = (result) => {
  if (result.penaltyWinner) return result.penaltyWinner;
  return result.homeGoals > result.awayGoals ? result.homeTeam : result.awayTeam;
};
var formatWCQPlayoffScore = (result) => {
  const baseScore = `${result.homeGoals}:${result.awayGoals}`;
  if (result.penaltyWinner && result.homePenaltyGoals !== void 0 && result.awayPenaltyGoals !== void 0) {
    return `${baseScore} (${result.homePenaltyGoals}:${result.awayPenaltyGoals} k.)`;
  }
  if (result.wentToExtraTime) return `${baseScore} po dogr.`;
  return baseScore;
};
var formatWCQPlayoffScoreForTeam = (result, teamName) => {
  if (result.homeTeam !== teamName && result.awayTeam !== teamName) {
    return formatWCQPlayoffScore(result);
  }
  const teamIsHome = result.homeTeam === teamName;
  const teamGoals = teamIsHome ? result.homeGoals : result.awayGoals;
  const opponentGoals = teamIsHome ? result.awayGoals : result.homeGoals;
  const baseScore = `${teamGoals}:${opponentGoals}`;
  if (result.penaltyWinner && result.homePenaltyGoals !== void 0 && result.awayPenaltyGoals !== void 0) {
    const teamPens = teamIsHome ? result.homePenaltyGoals : result.awayPenaltyGoals;
    const opponentPens = teamIsHome ? result.awayPenaltyGoals : result.homePenaltyGoals;
    return `${baseScore} (${teamPens}:${opponentPens} k.)`;
  }
  if (result.wentToExtraTime) return `${baseScore} po dogr.`;
  return baseScore;
};
var startOfDay = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized.getTime();
};
var getDayDifference = (from, to) => Math.round((startOfDay(to) - startOfDay(from)) / 864e5);
var getYearMonthKey = (date) => `${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, "0")}`;
var getFixturePointsForClub = (fixture, clubId) => {
  const isHome = fixture.homeTeamId === clubId;
  const goalsFor = isHome ? fixture.homeScore : fixture.awayScore;
  const goalsAgainst = isHome ? fixture.awayScore : fixture.homeScore;
  if (goalsFor == null || goalsAgainst == null) return 0;
  if (goalsFor > goalsAgainst) return 3;
  if (goalsFor === goalsAgainst) return 1;
  return 0;
};
var getManagerLeagueFormTrend = (managerContract2, club, fixtures, currentDate2) => {
  const emptyTrend = {
    matchesManaged: 0,
    recentMatches: 0,
    recentPoints: 0,
    recentWins: 0,
    recentLosses: 0,
    currentWinStreak: 0,
    currentUnbeatenStreak: 0,
    isClearRecovery: false
  };
  if (!managerContract2 || managerContract2.clubId !== club.id) return emptyTrend;
  const contractStart = startOfDay(new Date(managerContract2.signedAt || managerContract2.terms.startDate));
  const currentDay = startOfDay(currentDate2);
  if (!Number.isFinite(contractStart) || !Number.isFinite(currentDay)) return emptyTrend;
  const managedFixtures = fixtures.filter(
    (fixture) => fixture.status === "FINISHED" /* FINISHED */ && fixture.leagueId === club.leagueId && (fixture.homeTeamId === club.id || fixture.awayTeamId === club.id) && startOfDay(fixture.date) >= contractStart && startOfDay(fixture.date) <= currentDay
  ).sort((a, b) => startOfDay(a.date) - startOfDay(b.date));
  if (managedFixtures.length === 0) return emptyTrend;
  const points = managedFixtures.map((fixture) => getFixturePointsForClub(fixture, club.id));
  const recentPointsList = points.slice(-5);
  const recentPoints = recentPointsList.reduce((sum, value) => sum + value, 0);
  const recentWins = recentPointsList.filter((value) => value === 3).length;
  const recentLosses = recentPointsList.filter((value) => value === 0).length;
  let currentWinStreak = 0;
  for (let index = points.length - 1; index >= 0 && points[index] === 3; index--) currentWinStreak++;
  let currentUnbeatenStreak = 0;
  for (let index = points.length - 1; index >= 0 && points[index] > 0; index--) currentUnbeatenStreak++;
  const isClearRecovery = currentWinStreak >= 3 || recentPointsList.length >= 4 && recentPoints >= 10 || recentPointsList.length >= 5 && recentWins >= 3 && recentLosses === 0;
  return {
    matchesManaged: managedFixtures.length,
    recentMatches: recentPointsList.length,
    recentPoints,
    recentWins,
    recentLosses,
    currentWinStreak,
    currentUnbeatenStreak,
    isClearRecovery
  };
};
var STAR_INJURY_DRAMA_MIN_DAYS = 90;
var getVarControversyArticleContext = (matchHistory, fixture, allClubs2) => {
  const match = matchHistory.find((entry) => entry.matchId === fixture.id);
  if (!match) return null;
  const disallowedGoal = match.goals.find((goal) => goal.varDisallowed === true && !goal.isMiss);
  const disallowedTimelineEvent = (match.timeline ?? []).find((event) => {
    const eventAny = event;
    return eventAny.varDisallowed === true && (eventAny.type === "GOAL" || eventAny.type === "PENALTY_SCORED");
  });
  const teamId = disallowedGoal?.teamId ?? (disallowedTimelineEvent?.teamSide === "HOME" ? match.homeTeamId : disallowedTimelineEvent?.teamSide === "AWAY" ? match.awayTeamId : void 0);
  if (!teamId) return null;
  return {
    teamName: allClubs2.find((club) => club.id === teamId)?.name ?? "jedna z dru\u017Cyn",
    teamRole: teamId === match.homeTeamId ? "gospodarzy" : "go\u015Bci"
  };
};
var getAiRedCardControversyArticleContext = (matchHistory, fixture, userClub2, allClubs2) => {
  const match = matchHistory.find((entry) => entry.matchId === fixture.id);
  if (!match) return null;
  const userIsHome = fixture.homeTeamId === userClub2.id;
  const aiTeamId = userIsHome ? fixture.awayTeamId : fixture.homeTeamId;
  const userScore = userIsHome ? fixture.homeScore ?? match.homeScore ?? 0 : fixture.awayScore ?? match.awayScore ?? 0;
  const aiScore = userIsHome ? fixture.awayScore ?? match.awayScore ?? 0 : fixture.homeScore ?? match.homeScore ?? 0;
  if (aiScore > userScore) return null;
  const aiRedCard = (match.cards ?? []).find(
    (card) => card.teamId === aiTeamId && (card.type === "RED" || card.type === "SECOND_YELLOW")
  );
  if (!aiRedCard) return null;
  return {
    teamName: allClubs2.find((club) => club.id === aiTeamId)?.name ?? "dru\u017Cyny rywali"
  };
};
var getAiPenaltyNoCallControversyArticleContext = (matchHistory, fixture, userClub2, allClubs2) => {
  const match = matchHistory.find((entry) => entry.matchId === fixture.id);
  if (!match) return null;
  const userIsHome = fixture.homeTeamId === userClub2.id;
  const aiTeamId = userIsHome ? fixture.awayTeamId : fixture.homeTeamId;
  const aiSide = aiTeamId === match.homeTeamId ? "HOME" : "AWAY";
  const userScore = userIsHome ? fixture.homeScore ?? match.homeScore ?? 0 : fixture.awayScore ?? match.awayScore ?? 0;
  const aiScore = userIsHome ? fixture.awayScore ?? match.awayScore ?? 0 : fixture.homeScore ?? match.homeScore ?? 0;
  const goalDiffForUser = userScore - aiScore;
  if (goalDiffForUser < 0 || goalDiffForUser > 1) return null;
  const aiPenaltyNoCall = (match.timeline ?? []).find((event) => {
    const eventAny = event;
    return eventAny.teamSide === aiSide && eventAny.type === "GENERIC" && typeof eventAny.text === "string" && eventAny.text.includes("VAR: Nie ma karnego");
  });
  if (!aiPenaltyNoCall) return null;
  return {
    teamName: allClubs2.find((club) => club.id === aiTeamId)?.name ?? "dru\u017Cyny rywali"
  };
};
var getLowRefereeRatingArticleContext = (matchHistory, fixture) => {
  const match = matchHistory.find((entry) => entry.matchId === fixture.id);
  if (!match || match.refereeRating === void 0 || match.refereeRating >= 6) return null;
  return {
    refereeName: match.refereeName
  };
};
var getAiTwoGoalLossVarCriticismArticleContext = (matchHistory, fixture, userClub2, allClubs2) => {
  const match = matchHistory.find((entry) => entry.matchId === fixture.id);
  if (!match) return null;
  const userIsHome = fixture.homeTeamId === userClub2.id;
  const aiTeamId = userIsHome ? fixture.awayTeamId : fixture.homeTeamId;
  const aiSide = aiTeamId === match.homeTeamId ? "HOME" : "AWAY";
  const userScore = userIsHome ? fixture.homeScore ?? match.homeScore ?? 0 : fixture.awayScore ?? match.awayScore ?? 0;
  const aiScore = userIsHome ? fixture.awayScore ?? match.awayScore ?? 0 : fixture.homeScore ?? match.homeScore ?? 0;
  if (userScore - aiScore !== 2) return null;
  const aiDisallowedGoal = (match.goals ?? []).some(
    (goal) => goal.teamId === aiTeamId && goal.varDisallowed === true && !goal.isMiss
  );
  const aiDisallowedTimelineGoal = (match.timeline ?? []).some((event) => {
    const eventAny = event;
    return eventAny.teamSide === aiSide && eventAny.varDisallowed === true && (eventAny.type === "GOAL" || eventAny.type === "PENALTY_SCORED");
  });
  if (!aiDisallowedGoal && !aiDisallowedTimelineGoal) return null;
  return {
    teamName: allClubs2.find((club) => club.id === aiTeamId)?.name ?? "rywali"
  };
};
var getMailDate = (mail) => {
  const mailDate = mail.date instanceof Date ? mail.date : new Date(mail.date);
  return Number.isNaN(mailDate.getTime()) ? null : mailDate;
};
var isBeforeLeagueSeasonEnd = (date) => {
  const seasonEndYear = date.getMonth() >= 7 ? date.getFullYear() + 1 : date.getFullYear();
  return startOfDay(date) <= new Date(seasonEndYear, 4, 23).getTime();
};
var getClubBoardSignatory = (club, templateRole) => {
  const formatName = (person) => person ? `${person.firstName} ${person.lastName}` : null;
  if (templateRole === "Prezes Zarz\u0105du") {
    const ceoName = formatName(club.management?.ceo);
    if (ceoName) return { name: ceoName, role: "Prezes Zarz\u0105du" };
    const ownerName = formatName(club.management?.owner);
    if (ownerName) return { name: ownerName, role: "W\u0142a\u015Bciciel" };
  }
  if (templateRole === "Dyrektor Sportowy") {
    const sportingDirectorName = formatName(club.sportingDirector);
    if (sportingDirectorName) return { name: sportingDirectorName, role: "Dyrektor Sportowy" };
  }
  if (templateRole === "W\u0142a\u015Bciciel Klubu") {
    const ownerName = formatName(club.management?.owner);
    if (ownerName) return { name: ownerName, role: "W\u0142a\u015Bciciel" };
  }
  return { name: "Zarz\u0105d Klubu", role: templateRole };
};
var buildRivalryWarningMail = (currentDate2, userClub2, allClubs2, nextFixture) => {
  if (!nextFixture || nextFixture.status !== "SCHEDULED" /* SCHEDULED */) return null;
  const daysUntilKickoff = getDayDifference(currentDate2, nextFixture.date);
  if (daysUntilKickoff < 0 || daysUntilKickoff > 1) return null;
  const opponentId = nextFixture.homeTeamId === userClub2.id ? nextFixture.awayTeamId : nextFixture.homeTeamId;
  const opponentClub = allClubs2.find((club) => club.id === opponentId);
  if (!opponentClub) return null;
  const rivalryContext = RivalryService.getMatchContext(userClub2, opponentClub);
  if (!rivalryContext.isRivalry) return null;
  const intro = rivalryContext.tier === "CLASSIC" || rivalryContext.tier === "DERBY" ? "Dla kibic\xF3w ten mecz to \u015Bwi\u0119ta wojna." : "Dla kibic\xF3w ten mecz jest spraw\u0105 honoru.";
  const pressureLine = rivalryContext.tier === "CLASSIC" ? "Tu nie wystarczy poprawny wyst\u0119p. Oczekujemy dru\u017Cyny gotowej odda\u0107 wszystko, bo takie mecze buduj\u0105 pozycj\u0119 klubu na lata." : rivalryContext.tier === "DERBY" ? "W derbach nie ma miejsca na alibi. Oczekujemy walki o ka\u017Cd\u0105 pi\u0142k\u0119, ostro\u015Bci w pojedynkach i pe\u0142nego zaanga\u017Cowania od pierwszej do ostatniej minuty." : "To nie jest zwyk\u0142a kolejka. Oczekujemy pe\u0142nego zaanga\u017Cowania, charakteru i gotowo\u015Bci do gry na granicy sportowej intensywno\u015Bci.";
  return {
    id: `FANS_RIVALRY_WARNING_${nextFixture.id}`,
    sender: `Stowarzyszenie Kibic\xF3w ${userClub2.name}`,
    role: "G\u0142os Trybun",
    subject: `${rivalryContext.label ?? "Wielki mecz"}: kibice oczekuj\u0105 pe\u0142nego zaanga\u017Cowania`,
    body: [
      "Trenerze,",
      "",
      `Przed meczem z ${opponentClub.name} chcemy powiedzie\u0107 to jasno: ${intro}`,
      "",
      pressureLine,
      "",
      "Nie prosimy o \u0142adny futbol za wszelk\u0105 cen\u0119. Chcemy zobaczy\u0107 zesp\xF3\u0142, kt\xF3ry rozumie wag\u0119 tego spotkania, nie cofa nogi i walczy dla herbu oraz dla ludzi na trybunach.",
      "",
      "Kibice ponios\u0105 dru\u017Cyn\u0119, ale teraz pi\u0142karze musz\u0105 pokaza\u0107, \u017Ce czuj\u0105 temperatur\u0119 tego starcia i s\u0105 gotowi odpowiedzie\u0107 na ni\u0105 na boisku.",
      "",
      `Jutro liczy si\u0119 tylko jedno: zostawi\u0107 serce na murawie przeciwko ${opponentClub.name}.`,
      "",
      `Stowarzyszenie Kibic\xF3w ${userClub2.name}`
    ].join("\n"),
    date: new Date(currentDate2),
    isRead: false,
    type: "FANS" /* FANS */,
    priority: rivalryContext.tier === "CLASSIC" ? 99 : rivalryContext.tier === "DERBY" ? 97 : 94
  };
};
var MailService = {
  /**
   * Generuje wiadomość powitalną od zarządu na start kariery.
   */
  generateWelcomeMail: (userClub2, squad, gameDate, managerContract2) => {
    const topPlayers = [...squad].sort((a, b) => b.overallRating - a.overallRating).slice(0, 15);
    const avgSquadOvr = topPlayers.reduce((acc, p) => acc + p.overallRating, 0) / topPlayers.length;
    let tierBaseline = 60;
    if (userClub2.leagueId === "L_PL_1") tierBaseline = 66;
    else if (userClub2.leagueId === "L_PL_2") tierBaseline = 59;
    else if (userClub2.leagueId === "L_PL_3") tierBaseline = 52;
    const strengthFactor = avgSquadOvr / tierBaseline * 5;
    const expectationIndex = userClub2.reputation * 0.3 + strengthFactor * 0.7;
    const isTopTier = userClub2.leagueId === "L_PL_1";
    let targetLeagueName = "wy\u017Cszej ligi";
    if (userClub2.leagueId === "L_PL_2") targetLeagueName = "Ekstraklasy";
    if (userClub2.leagueId === "L_PL_3") targetLeagueName = "1. Ligi";
    let templateId = "board_welcome_mid";
    if (userClub2.reputation >= 9) {
      templateId = isTopTier ? "board_welcome_elite" : "board_welcome_elite_promotion";
    } else if (expectationIndex >= 7.6) {
      templateId = isTopTier ? "board_welcome_elite" : "board_welcome_elite_promotion";
    } else if (expectationIndex >= 6.1 || userClub2.reputation >= 7) {
      templateId = isTopTier ? "board_welcome_pro" : "board_welcome_pro_promotion";
    } else if (expectationIndex <= 4) {
      templateId = "board_welcome_relegation";
    }
    if (!isTopTier && (userClub2.leagueId === "L_PL_2" || userClub2.leagueId === "L_PL_3")) {
      const oczekiwania = userClub2.board?.oczekiwania;
      if (oczekiwania === "bardzo_wysoka") templateId = "board_welcome_elite_promotion";
      else if (oczekiwania === "wysoka" || oczekiwania === "przecietna") templateId = "board_welcome_pro_promotion";
      else if (oczekiwania === "bardzo_niska") templateId = "board_welcome_relegation";
      else templateId = "board_welcome_mid";
    }
    const template = MAIL_TEMPLATES.find((t) => t.id === templateId);
    const signatory = getClubBoardSignatory(userClub2, template.role);
    const subject = template.subject.replace(/\{CLUB\}/g, userClub2.name).replace(/\{TARGET_LEAGUE\}/g, targetLeagueName);
    let body = template.body.replace(/\{CLUB\}/g, userClub2.name).replace(/\{TARGET_LEAGUE\}/g, targetLeagueName).replace(/\{TRANSFER_BUDGET\}/g, userClub2.transferBudget.toLocaleString("pl-PL")).replace(/\{BOARD_SIGNATORY_NAME\}/g, signatory.name).replace(/\{BOARD_SIGNATORY_ROLE\}/g, signatory.role);
    if (managerContract2?.clubId === userClub2.id) {
      const terms = managerContract2.terms;
      body = [
        "Szanowny Panie Trenerze,",
        "",
        `W imieniu Zarz\u0105du ${userClub2.name} witamy Pana w klubie i potwierdzamy warunki podpisanego kontraktu.`,
        "",
        `Uzgodniony cel sportowy: ${terms.target.label}.`,
        terms.target.description,
        "",
        `Umowa obowi\u0105zuje do ${new Date(terms.endDate).toLocaleDateString("pl-PL")}.`,
        `Wynagrodzenie roczne wynosi ${terms.annualSalary.toLocaleString("pl-PL")} PLN.`,
        "",
        `Bud\u017Cet transferowy na obecny sezon wynosi ${userClub2.transferBudget.toLocaleString("pl-PL")} PLN.`,
        "",
        "Ocena pracy sztabu b\u0119dzie prowadzona wzgl\u0119dem uzgodnionego celu, aktualnych wynik\xF3w oraz sytuacji sportowej dru\u017Cyny.",
        "",
        "Z powa\u017Caniem,",
        signatory.name,
        `${signatory.role}, ${userClub2.name}`
      ].join("\n");
    }
    return {
      id: `WELCOME_MAIL_${Date.now()}`,
      sender: template.sender,
      role: signatory.role,
      subject,
      body,
      date: gameDate ? new Date(gameDate) : /* @__PURE__ */ new Date(),
      isRead: false,
      type: template.type,
      priority: 100
    };
  },
  /**
     * Generuje wiadomość powitalną od Stowarzyszenia Kibiców z analizą składu.
     */
  generateFanWelcomeMail: (userClub2, squad, gameDate) => {
    const topPlayers = [...squad].sort((a, b) => b.overallRating - a.overallRating).slice(0, 15);
    const avgSquadOvr = topPlayers.reduce((acc, p) => acc + p.overallRating, 0) / topPlayers.length;
    let tierBaseline = 52;
    if (userClub2.leagueId === "L_PL_1") tierBaseline = 66;
    else if (userClub2.leagueId === "L_PL_2") tierBaseline = 59;
    const needsTransfers = avgSquadOvr < tierBaseline;
    const transferDemand = needsTransfers ? "Niepokoi nas jednak g\u0142\u0119bia sk\u0142adu. Przy obecnych brakach kadrowych ci\u0119\u017Cko b\u0119dzie o stabilne wyniki \u2013 liczymy, \u017Ce jeszcze w tym oknie transferowym sprowadzi Pan kogo\u015B, kto realnie podniesie jako\u015B\u0107 tej dru\u017Cyny." : "Patrz\u0105c na ch\u0142opak\xF3w w szatni, wierzymy, \u017Ce ta grupa pod Pana wodz\u0105 mo\u017Ce zwojowa\u0107 t\u0119 lig\u0119 bez wi\u0119kszych posi\u0142k\xF3w.";
    const template = MAIL_TEMPLATES.find((t) => t.id === "fans_welcome");
    return {
      id: `FAN_WELCOME_${Date.now()}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject,
      body: template.body.replace("{CLUB}", userClub2.name).replace("{TRANSFER_DEMAND}", transferDemand),
      date: gameDate ? new Date(gameDate) : /* @__PURE__ */ new Date(),
      isRead: false,
      type: template.type,
      priority: 90
    };
  },
  generateBoardDecisionMail: (player, club, decision) => {
    let templateId = "board_bie_approved";
    if (decision.status === "VETO" || decision.status === "SOFT_BLOCK") templateId = "board_bie_veto";
    return MailService.createFromTemplate(templateId, {
      "PLAYER": `${player.firstName} ${player.lastName}`,
      "CLUB": club.name
    });
  },
  /**
   * Generuje wielki raport podsumowujący miniony sezon.
   */
  generateTrainingInjuryMail: (player, currentDate2) => {
    const playerName = `${player.firstName} ${player.lastName}`;
    const days = player.health.injury?.daysRemaining ?? 0;
    const injuryType = player.health.injury?.type ?? "uraz";
    return {
      id: `TRAINING_INJURY_${player.id}_${currentDate2.toISOString().split("T")[0]}`,
      sender: "Sztab Medyczny",
      role: "Lekarz klubowy",
      subject: `Kontuzja na treningu: ${playerName}`,
      body: [
        "Trenerze,",
        "",
        `Podczas dzisiejszego treningu ${playerName} dozna\u0142 kontuzji: ${injuryType}.`,
        "",
        `Zawodnik b\u0119dzie pauzowa\u0142 przez oko\u0142o ${days} dni.`,
        "",
        "Nale\u017Cy dokona\u0107 korekty w sk\u0142adzie na nadchodz\u0105cy mecz.",
        "",
        "Sztab medyczny b\u0119dzie monitorowa\u0142 proces leczenia i poinformuje o post\u0119pach rehabilitacji."
      ].join("\n"),
      date: new Date(currentDate2),
      isRead: false,
      type: "STAFF" /* STAFF */,
      priority: 85
    };
  },
  generateSeasonSummaryMail: (data) => {
    const separator = "------------------------------------------";
    const seasonLabel = `${data.year}/${(data.year + 1).toString().slice(2)}`;
    let body = `Szanowny Panie Managerze,

Przedstawiamy oficjalny raport z zako\u0144czenia sezonu ${seasonLabel}.
`;
    body += `${separator}

`;
    body += `MISTRZ POLSKI
`;
    body += `    ${data.championName.toUpperCase()}
`;
    body += `
${separator}

`;
    body += `AWANS
`;
    const promotionGroups = data.promotions.filter((p) => p.teams.length > 0);
    if (promotionGroups.length > 0) {
      promotionGroups.forEach((p) => {
        body += `    ${formatSeasonMovementRoute(p.from, p.to)}: ${p.teams.join(", ")}
`;
      });
    } else {
      body += `    Brak awans\xF3w
`;
    }
    body += `
`;
    body += `SPADKOWICZE
`;
    const relegationGroups = data.relegations.filter((r) => r.teams.length > 0);
    if (relegationGroups.length > 0) {
      relegationGroups.forEach((r) => {
        body += `    ${formatSeasonMovementRoute(r.from, r.to)}: ${r.teams.join(", ")}
`;
      });
    } else {
      body += `    Brak spadk\xF3w
`;
    }
    body += `
${separator}

`;
    body += `NAGRODY INDYWIDUALNE
`;
    data.leagueAwards.forEach((a) => {
      body += `
  [${a.leagueName.toUpperCase()}]
`;
      body += `    Kr\xF3l strzelc\xF3w: ${a.topScorer.name}${a.topScorer.clubName ? ` \u2014 ${a.topScorer.clubName}` : ""} (${a.topScorer.goals} goli)
`;
      body += `    Kr\xF3l asyst: ${a.topAssistant.name}${a.topAssistant.clubName ? ` \u2014 ${a.topAssistant.clubName}` : ""} (${a.topAssistant.assists} asyst)
`;
    });
    body += `
${separator}

`;
    body += `Zarz\u0105d oraz kibice dzi\u0119kuj\u0105 za emocje dostarczone w ubieg\u0142ym sezonie.
Teraz czas na nowe wyzwania. Powodzenia w kolejnym!`;
    return {
      id: `SEASON_SUMMARY_${data.year}`,
      sender: "Polska Liga Futbolu",
      role: "PZPM",
      subject: `OFICJALNY RAPORT: Podsumowanie Sezonu ${seasonLabel}`,
      body,
      date: new Date(data.year + 1, 5, 28),
      isRead: false,
      type: "SYSTEM" /* SYSTEM */,
      priority: 150,
      metadata: {
        type: "SEASON_SUMMARY",
        championName: data.championName,
        promotions: data.promotions,
        relegations: data.relegations,
        leagueAwards: data.leagueAwards
      }
    };
  },
  generateCupFinalMail: (homeName, awayName, score, userTeamId, winnerId, homeDisplayName, awayDisplayName) => {
    const isUserHome = homeName === userTeamId;
    const isUserWinner = winnerId === userTeamId;
    const isUserInFinal = homeName === userTeamId || awayName === userTeamId;
    let templateId = "system_cup_news";
    let replacements = {
      "WINNER": winnerId === homeName ? homeDisplayName ?? homeName : awayDisplayName ?? awayName,
      "LOSER": winnerId === homeName ? awayDisplayName ?? awayName : homeDisplayName ?? homeName,
      "SCORE": score
    };
    if (isUserInFinal) {
      templateId = isUserWinner ? "board_cup_victory" : "board_cup_final_loss";
      replacements = {
        "CLUB": isUserHome ? homeDisplayName ?? userTeamId ?? "" : awayDisplayName ?? userTeamId ?? "",
        "OPPONENT": isUserHome ? awayDisplayName ?? awayName : homeDisplayName ?? homeName
      };
    }
    const template = MAIL_TEMPLATES.find((t) => t.id === templateId);
    let body = template.body;
    let subject = template.subject;
    Object.entries(replacements).forEach(([key, val]) => {
      const regex = new RegExp(`{${key}}`, "g");
      body = body.replace(regex, val);
      subject = subject.replace(regex, val);
    });
    return {
      id: `CUP_FINAL_${Date.now()}`,
      sender: template.sender,
      role: template.role,
      subject,
      body,
      date: /* @__PURE__ */ new Date(),
      isRead: false,
      type: template.type,
      priority: 150
    };
  },
  generateSuperCupMail: (winnerName, opponentName, score) => {
    return MailService.createFromTemplate("board_supercup_win", {
      "CLUB": winnerName,
      "OPPONENT": opponentName,
      "SCORE": score,
      "BONUS": "250 000"
    });
  },
  generateSuperCupLossMails: (userClub2, opponentName, userScore, oppScore) => {
    const isPenaltyShootout = userScore === oppScore;
    const diff = isPenaltyShootout ? 1 : oppScore - userScore;
    const scoreStr = `${userScore}:${oppScore}`;
    const mails = [];
    let boardTemplate = "board_supercup_loss_1";
    let poolIndex = 0;
    if (diff === 1) {
      boardTemplate = "board_supercup_loss_1";
      poolIndex = 0;
    } else if (diff === 2) {
      boardTemplate = "board_supercup_loss_2";
      poolIndex = 1;
    } else if (diff === 3) {
      boardTemplate = "board_supercup_loss_3";
      poolIndex = 2;
    } else {
      boardTemplate = "board_supercup_loss_high";
      poolIndex = 3;
      mails.push(MailService.createFromTemplate("fans_supercup_furious", { "CLUB": userClub2.name }));
    }
    mails.push(MailService.createFromTemplate(boardTemplate, { "CLUB": userClub2.name, "SCORE": scoreStr, "OPPONENT": opponentName }));
    const pools = [
      [
        "Minimalna pora\u017Cka po bardzo wyr\xF3wnanym spotkaniu, w kt\xF3rym {CLUB} przez wi\u0119kszo\u015B\u0107 czasu dotrzymywa\u0142 kroku rywalom. O losach Superpucharu zadecydowa\u0142 jeden moment dekoncentracji w ko\u0144c\xF3wce, kt\xF3ry zosta\u0142 natychmiast bezlito\u015Bnie wykorzystany. Media podkre\u015Blaj\u0105 jednak, \u017Ce styl gry i organizacja zespo\u0142u daj\u0105 solidne podstawy do optymizmu na przysz\u0142o\u015B\u0107.",
        "Jedna bramka przes\u0105dzi\u0142a o wyniku, cho\u0107 przebieg meczu absolutnie nie wskazywa\u0142 na wyra\u017An\u0105 przewag\u0119 kt\xF3rejkolwiek ze stron. Zesp\xF3\u0142 {CLUB} stworzy\u0142 sobie kilka sytuacji, ale zabrak\u0142o ch\u0142odnej g\u0142owy przy wyko\u0144czeniu. Prasa pisze o straconej szansie, lecz jednocze\u015Bnie chwali charakter i intensywno\u015B\u0107 gry.",
        "Spotkanie mog\u0142o zako\u0144czy\u0107 si\u0119 w ka\u017Cd\u0105 stron\u0119, bo oba zespo\u0142y gra\u0142y odwa\u017Cnie i z du\u017C\u0105 determinacj\u0105. Ostatecznie to rywale zachowali wi\u0119cej spokoju w kluczowym fragmencie meczu. Dla {CLUB} to bolesna, ale pouczaj\u0105ca lekcja na starcie sezonu.",
        "Trener mo\u017Ce mie\u0107 mieszane uczucia po ko\u0144cowym gwizdku. Z jednej strony wynik boli, z drugiej postawa dru\u017Cyny pokazuje, \u017Ce fundamenty pod dobry sezon s\u0105 ju\u017C widoczne. Jeden b\u0142\u0105d zadecydowa\u0142 o utracie trofeum, ale og\xF3lny obraz gry napawa umiarkowanym optymizmem.",
        "Jednobramkowa pora\u017Cka to najni\u017Cszy mo\u017Cliwy wymiar kary w tak presti\u017Cowym meczu. {CLUB} nie by\u0142 zespo\u0142em gorszym, lecz mniej skutecznym w decyduj\u0105cych momentach. Komentatorzy zgodnie twierdz\u0105, \u017Ce przy odrobinie szcz\u0119\u015Bcia wynik m\xF3g\u0142by wygl\u0105da\u0107 zupe\u0142nie inaczej."
      ],
      [
        "Dwie stracone bramki obna\u017Cy\u0142y problemy {CLUB} w defensywie i organizacji gry w kluczowych fazach spotkania. Przez d\u0142ugie fragmenty mecz by\u0142 wyr\xF3wnany, jednak rywale potrafili lepiej wykorzysta\u0107 swoje okazje. Eksperci m\xF3wi\u0105 o potrzebie szybkich korekt przed startem rozgrywek ligowych.",
        "Pora\u017Cka r\xF3\u017Cnic\u0105 dw\xF3ch goli pokazuje, \u017Ce dru\u017Cynie wci\u0105\u017C brakuje automatyzm\xF3w i odpowiedniego zgrania formacji. Kilka prostych strat i sp\xF3\u017Anione reakcje w obronie kosztowa\u0142y utrat\u0119 kontroli nad meczem. Sztab szkoleniowy ma materia\u0142 do powa\u017Cnej analizy.",
        "Faworyci wygrali w spos\xF3b spokojny i do\u015B\u0107 kontrolowany, nie pozwalaj\u0105c {CLUB} na rozwini\u0119cie skrzyde\u0142. Cho\u0107 momentami wida\u0107 by\u0142o ambicj\u0119 i wol\u0119 walki, brakowa\u0142o konkret\xF3w pod bramk\u0105 rywala. Media okre\u015Blaj\u0105 ten wynik jako solidne ostrze\u017Cenie przed nadchodz\u0105cym sezonem.",
        "Dwubramkowa pora\u017Cka to sygna\u0142, \u017Ce projekt sportowy jest wci\u0105\u017C w fazie budowy. Zesp\xF3\u0142 mia\u0142 swoje momenty, ale brak konsekwencji i koncentracji w obronie przes\u0105dzi\u0142 o losach trofeum. Trener podkre\u015Bla potrzeb\u0119 cierpliwo\u015Bci i dalszej pracy nad struktur\u0105 gry.",
        "Superpuchar uciek\u0142, bo rywale byli dzi\u015B dojrzalsi taktycznie i bardziej bezwzgl\u0119dni w polu karnym. {CLUB} zaprezentowa\u0142 si\u0119 poprawnie, lecz bez b\u0142ysku, kt\xF3ry pozwoli\u0142by przechyli\u0107 szal\u0119 zwyci\u0119stwa. Prasa m\xF3wi o wyniku sprawiedliwym, cho\u0107 nie druzgoc\u0105cym."
      ],
      [
        "Trzy stracone gole wywo\u0142a\u0142y pierwsz\u0105 fal\u0119 powa\u017Cnych w\u0105tpliwo\u015Bci wobec nowego szkoleniowca. Dru\u017Cyna wygl\u0105da\u0142a na zagubion\u0105 taktycznie i nie potrafi\u0142a zareagowa\u0107 na zmiany w grze rywali. Eksperci zaczynaj\u0105 zadawa\u0107 pytania, czy obrany kierunek rozwoju jest w\u0142a\u015Bciwy.",
        "Styl gry {CLUB} w tym meczu by\u0142 daleki od oczekiwa\u0144 kibic\xF3w i komentator\xF3w. Brak sp\xF3jnego planu, chaos w ustawieniu i bierna postawa w defensywie doprowadzi\u0142y do wysokiej pora\u017Cki. W studiach telewizyjnych coraz g\u0142o\u015Bniej m\xF3wi si\u0119 o presji, kt\xF3ra szybko zaczyna ci\u0105\u017Cy\u0107 na trenerze.",
        "R\xF3\u017Cnica trzech bramek to ju\u017C nie przypadek, a wyra\u017Any sygna\u0142 alarmowy. Zesp\xF3\u0142 sprawia\u0142 wra\u017Cenie nieprzygotowanego do gry o stawk\u0119, a reakcje z \u0142awki by\u0142y sp\xF3\u017Anione i nieskuteczne. Dziennikarze zastanawiaj\u0105 si\u0119, czy ten projekt ma solidne fundamenty.",
        "Pora\u017Cka obna\u017Cy\u0142a braki zar\xF3wno w przygotowaniu fizycznym, jak i mentalnym dru\u017Cyny. {CLUB} nie potrafi\u0142a podnie\u015B\u0107 si\u0119 po stracie pierwszego gola, a kolejne ciosy tylko pog\u0142\u0119bia\u0142y chaos. Coraz cz\u0119\u015Bciej pojawiaj\u0105 si\u0119 g\u0142osy o potrzebie szybkiej korekty kursu.",
        "To by\u0142 mecz, kt\xF3ry zamiast nadziei przyni\xF3s\u0142 niepok\xF3j. Trzy stracone bramki i brak wyra\u017Anej reakcji zespo\u0142u sprawi\u0142y, \u017Ce atmosfera wok\xF3\u0142 trenera sta\u0142a si\u0119 wyra\u017Anie ci\u0119\u017Csza. Eksperci nie wykluczaj\u0105, \u017Ce kolejne spotkania b\u0119d\u0105 dla niego prawdziwym testem przetrwania."
      ],
      [
        "To by\u0142a prawdziwa katastrofa i jeden z najbardziej bolesnych wyst\u0119p\xF3w {CLUB} w ostatnich latach. Dru\u017Cyna zosta\u0142a ca\u0142kowicie zdominowana i nie by\u0142a w stanie nawi\u0105za\u0107 r\xF3wnorz\u0119dnej walki. Kibice opuszczali stadion w ciszy, a media m\xF3wi\u0105 o kompromitacji na wszystkich p\u0142aszczyznach.",
        "Wysoka pora\u017Cka w Superpucharze mia\u0142a znamiona sportowej egzekucji. Chaos w obronie, brak organizacji i bezradno\u015B\u0107 w ataku sprawi\u0142y, \u017Ce wynik szybko wymkn\u0105\u0142 si\u0119 spod kontroli. Komentatorzy nie maj\u0105 w\u0105tpliwo\u015Bci, \u017Ce to jeden z najgorszych debiut\xF3w trenerskich ostatniej dekady.",
        "Rywal zrobi\u0142 z {CLUB} wszystko, co chcia\u0142, a r\xF3\u017Cnica klas by\u0142a widoczna go\u0142ym okiem. Zesp\xF3\u0142 nie potrafi\u0142 odpowiedzie\u0107 ani taktycznie, ani mentalnie, co tylko pog\u0142\u0119bia\u0142o rozmiary kl\u0119ski. Prasa pisze o wstrz\u0105sie, kt\xF3ry mo\u017Ce mie\u0107 d\u0142ugofalowe konsekwencje.",
        "To spotkanie przejdzie do historii jako symbol totalnego rozk\u0142adu gry i braku przygotowania. Ka\u017Cda formacja zawiod\u0142a, a b\u0142\u0119dy indywidualne mno\u017Cy\u0142y si\u0119 z minuty na minut\u0119. W klubie zapowiada si\u0119 gor\u0105cy okres pe\u0142en trudnych rozm\xF3w i decyzji.",
        "Kompromitacja by\u0142a pe\u0142na i bezdyskusyjna. {CLUB} zosta\u0142 rozbity zar\xF3wno pi\u0142karsko, jak i mentalnie, nie pokazuj\u0105c ani charakteru, ani planu na odwr\xF3cenie los\xF3w meczu. Eksperci m\xF3wi\u0105 wprost: taki wyst\u0119p wymaga natychmiastowej reakcji w\u0142adz klubu."
      ]
    ];
    const randomComment = pools[poolIndex][Math.floor(Math.random() * 5)];
    const processedComment = randomComment.replace(/{CLUB}/g, userClub2.name);
    mails.push(MailService.createFromTemplate("media_supercup_news", {
      "CLUB": userClub2.name,
      "MEDIA_COMMENT": processedComment
    }));
    return mails;
  },
  createFromTemplate: (templateId, replacements) => {
    const template = MAIL_TEMPLATES.find((t) => t.id === templateId);
    let body = template.body;
    let subject = template.subject;
    const clubName = replacements["CLUB"] || "";
    const finalReplacements = { ...replacements };
    Object.entries(finalReplacements).forEach(([key, val]) => {
      if (typeof val === "string") {
        finalReplacements[key] = val.replace(/{CLUB}/g, clubName);
      }
    });
    Object.entries(finalReplacements).forEach(([key, val]) => {
      const regex = new RegExp(`{${key}}`, "g");
      body = body.replace(regex, val);
      subject = subject.replace(regex, val);
    });
    return {
      id: `${templateId}_${Date.now()}_${Math.random()}`,
      sender: template.sender,
      role: template.role,
      subject,
      body,
      date: /* @__PURE__ */ new Date(),
      isRead: false,
      type: template.type,
      priority: 85
    };
  },
  generateSeasonTicketMail: (club, seasonLabel, gameDate) => {
    const ticketPackage = FinanceService.calculateSeasonTicketPackageForClub({
      id: club.name,
      name: club.name,
      shortName: club.name,
      leagueId: club.leagueId,
      colorsHex: [],
      stadiumName: club.stadiumName,
      stadiumCapacity: club.stadiumCapacity,
      reputation: club.reputation,
      isDefaultActive: true,
      colorPrimary: "#000000",
      colorSecondary: "#FFFFFF",
      rosterIds: [],
      budget: 0,
      transferBudget: 0,
      boardStrictness: 5,
      signingBonusPool: 0,
      stats: { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 0, form: [] },
      country: club.country
    });
    const demandLevel = club.reputation >= 8 ? "bardzo wysokie" : club.reputation >= 6 ? "dobre" : club.reputation >= 4 ? "umiarkowane" : "niskie";
    const formatPLN = (n) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(n);
    return MailService.createFromTemplate("board_season_ticket_report", {
      CLUB: club.name,
      SEASON: seasonLabel,
      STADIUM: club.stadiumName,
      CAPACITY: club.stadiumCapacity.toLocaleString("pl-PL"),
      TICKETS_SOLD: ticketPackage.ticketsSold.toLocaleString("pl-PL"),
      REVENUE: formatPLN(ticketPackage.revenue),
      TICKET_PRICE: formatPLN(ticketPackage.seasonTicketPrice),
      DEMAND_LEVEL: demandLevel
    });
  },
  generateRetirementReportMail: (retirements, clubName) => {
    const title = `Raport Kadry ${clubName}`;
    const hasRetirements = retirements.length > 0;
    let body = hasRetirements ? `Szanowny Panie,\r
Po zako\u0144czeniu sezonu nast\u0119puj\u0105cy zawodnicy postanowili zako\u0144czy\u0107 kariery, a w ich miejsce do kadry w\u0142\u0105czeni zostali m\u0142odzi zawodnicy z naszej Akademii:

` : `Szanowny Panie,\r
Po zako\u0144czeniu sezonu przygotowali\u015Bmy kr\xF3tk\u0105 aktualizacj\u0119 kadrow\u0105.

`;
    if (!hasRetirements) {
      body += "Po ostatnim sezonie \u017Caden z pi\u0142karzy naszej kadry nie zdecydowa\u0142 si\u0119 zako\u0144czy\u0107 kariery.";
    } else {
      retirements.forEach((r) => {
        body += `\u{1F396}\uFE0F ${r.oldPlayerName} (${r.oldPlayerAge} lat) - Zako\u0144czy\u0142 karier\u0119.
`;
        body += `\u{1F331} Zast\u0105pi\u0142 go: ${r.newPlayerName} (Potencja\u0142 OVR: ${r.newPlayerOverall})\r
`;
      });
    }
    body += hasRetirements ? `
\u017Byczymy powodzenia w pracy z nowymi zawodnikami!

Dyrektor Sportowy` : `

Dyrektor Sportowy`;
    return {
      id: `RETIREMENT_${Date.now()}`,
      sender: "Dyrektor Sportowy",
      role: "Sztab Szkoleniowy",
      subject: title,
      body,
      date: /* @__PURE__ */ new Date(),
      isRead: false,
      type: "STAFF" /* STAFF */,
      priority: 95
    };
  },
  generateStaffRetirementMail: (retired) => {
    const staffList = retired.map((r) => `\u2022 ${r.name} (${r.age} lat) \u2013 ${r.roleLabel}`).join("\n");
    return MailService.createFromTemplate("staff_retirement", { "STAFF_LIST": staffList });
  },
  /**
     * Generuje email-newsa po zakończeniu fazy grupowej kwalifikacji MŚ 2026 (17 listopada).
     * Format: artykuł z dziennika sportowego z listą awansujących i uczestników baraży.
     */
  generateWCQGroupsSummaryMail: (groups, extras, date) => {
    const sep = "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500";
    const polandWon = groups.find((g) => g.winner === "Polska");
    const polandRU = groups.find((g) => g.runnerUp === "Polska");
    const polandExtra = extras.includes("Polska");
    let lead = "Europejskie kwalifikacje do Mistrzostw \u015Awiata 2026 dobieg\u0142y ko\u0144ca. Dwana\u015Bcie grup, tygodnie zaciek\u0142ych batalii \u2014 Europa zna ju\u017C komplet uczestnik\xF3w mundialu oraz szesna\u015Bcioro \u015Bmia\u0142k\xF3w, kt\xF3rzy powalcz\u0105 o ostatnie bilety w marcowych bara\u017Cach.";
    if (polandWon) {
      lead = `TO JEST TO! POLSKA JEDZIE NA MUNDIAL! Bia\u0142o-Czerwoni wygrali Grup\u0119 ${polandWon.group} i zapewnili sobie bezpo\u015Bredni awans do Mistrzostw \u015Awiata 2026. Europejskie kwalifikacje zako\u0144czy\u0142y si\u0119 dla nas w najlepszy mo\u017Cliwy spos\xF3b.`;
    } else if (polandRU) {
      lead = `Bia\u0142o-Czerwoni ko\u0144cz\u0105 faz\u0119 grupow\u0105 kwalifikacji z 2. miejsca w Grupie ${polandRU.group}. Bezpo\u015Bredni awans uciek\u0142, ale Polska zagra w marcowych bara\u017Cach i walka o M\u015A 2026 jest wci\u0105\u017C otwarta!`;
    } else if (polandExtra) {
      lead = `Polska z 3. miejsca w grupie wywalczy\u0142a jedno z czterech dodatkowych miejsc bara\u017Cowych. Bia\u0142o-Czerwoni b\u0119d\u0105 jednym z szesnastu uczestnik\xF3w bara\u017C\xF3w o M\u015A 2026 \u2014 losowanie ju\u017C 29 listopada.`;
    }
    let body = `\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
`;
    body += `  SPORT EXPRESS  \u2014  WYDANIE SPECJALNE
`;
    body += `  KWALIFIKACJE M\u015A 2026 \u2014 KONIEC FAZY GRUPOWEJ
`;
    body += `\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

`;
    body += `${lead}

`;
    body += `${sep}
`;
    body += `  \u{1F3C6}  BEZPO\u015AREDNI AWANS \u2014 ZWYCI\u0118ZCY 12 GRUP
`;
    body += `${sep}

`;
    groups.forEach((g) => {
      const star = g.winner === "Polska" ? "  \u2605  POLSKA!" : "";
      body += `  Gr. ${g.group.padEnd(2)}  \u25CF  ${g.winner}${star}
`;
    });
    body += `
${sep}
`;
    body += `  \u{1F94A}  BARA\u017BE M\u015A 2026 \u2014 16 UCZESTNIK\xD3W
`;
    body += `${sep}

`;
    body += `  Wicemistrzowie grup (miejsca 2.):

`;
    groups.forEach((g) => {
      const star = g.runnerUp === "Polska" ? "  \u2605  POLSKA!" : "";
      body += `  Gr. ${g.group.padEnd(2)}  \u2192  ${g.runnerUp}${star}
`;
    });
    if (extras.length > 0) {
      body += `
  Najlepsze 4 dru\u017Cyny z 3. miejsc (dodatkowe bilety):

`;
      extras.forEach((name) => {
        const star = name === "Polska" ? "  \u2605  POLSKA!" : "";
        body += `  \u25CF  ${name}${star}
`;
      });
    }
    body += `
${sep}

`;
    body += `  \u{1F4C5}  LOSOWANIE DRABINKI BARA\u017BOWEJ: 29 listopada 2025, Nyon

`;
    body += `UEFA wyznaczy 4 \u015Bcie\u017Cki eliminacyjne \u2014 ka\u017Cda z p\xF3\u0142fina\u0142em i fina\u0142em
`;
    body += `w marcu 2026. Czterej triumfatorzy uzyskaj\u0105 ostatnie europejskie bilety
`;
    body += `do USA, Meksyku i Kanady.

`;
    body += `${sep}
`;
    body += `  \xA9 Sport Express / Redakcja Sport Express`;
    const polandInvolved = polandWon || polandRU || polandExtra;
    const subject = polandWon ? "\u{1F3C6} POLSKA NA MUNDIALU! Komplet awans\xF3w z kwalifikacji do M\u015A 2026" : polandRU || polandExtra ? "\u{1F94A} Polska zagra w bara\u017Cach! Faza grupowa kwalifikacji zako\u0144czona" : "Kwalifikacje M\u015A 2026 \u2014 Europa wy\u0142oni\u0142a 12 bezpo\u015Brednich uczestnik\xF3w mundialu";
    return {
      id: `WCQ_GROUPS_NEWS_${date.getFullYear()}`,
      sender: "Sport Express",
      role: "Redakcja Sportowa",
      subject,
      body,
      date: new Date(date),
      isRead: false,
      type: "MEDIA" /* MEDIA */,
      priority: polandInvolved ? 140 : 110
    };
  },
  generateWCQPlayoffPolandMail: (playoffState, stage, date) => {
    const polandPath = playoffState.paths.find((path) => {
      if (stage === "SF") {
        return [path.sf1Result, path.sf2Result].some(
          (result2) => !!result2 && (result2.homeTeam === "Polska" || result2.awayTeam === "Polska")
        );
      }
      return !!path.finalResult && (path.finalResult.homeTeam === "Polska" || path.finalResult.awayTeam === "Polska");
    });
    if (!polandPath) return null;
    const result = stage === "SF" ? [polandPath.sf1Result, polandPath.sf2Result].find(
      (match) => !!match && (match.homeTeam === "Polska" || match.awayTeam === "Polska")
    ) : polandPath.finalResult;
    if (!result) return null;
    const opponent = result.homeTeam === "Polska" ? result.awayTeam : result.homeTeam;
    const polandWon = getWCQPlayoffWinner(result) === "Polska";
    const scoreForPoland = formatWCQPlayoffScoreForTeam(result, "Polska");
    const sep = "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500";
    const stageLabel = stage === "SF" ? "P\xD3\u0141FINA\u0141 BARA\u017BY" : "FINA\u0141 BARA\u017BY";
    let subject;
    let lead;
    if (stage === "SF") {
      subject = polandWon ? "Polska w finale bara\u017Cy do M\u015A ! Sport Express po p\xF3\u0142finale" : "Polska odpada w p\xF3\u0142finale bara\u017Cy do M\u015A";
      lead = polandWon ? `Reprezentacja Polski odnios\u0142a wa\u017Cne zwyci\u0119stwo w p\xF3\u0142finale bara\u017Cy o awans do Mistrzostw \u015Awiata, pokonuj\u0105c reprezentacj\u0119 ${opponent} wynikiem ${scoreForPoland}. Dzi\u0119ki temu sukcesowi Bia\u0142o-Czerwoni zachowali szanse na udzia\u0142 w najwa\u017Cniejszym turnieju pi\u0142karskim globu i wykonali kolejny krok w kierunku mundialu.` : `Reprezentacja Polski nie awansowa\u0142a do Mistrzostw \u015Awiata po pora\u017Cce w meczu bara\u017Cowym z reprezentacj\u0105 ${opponent}. Spotkanie zako\u0144czy\u0142o si\u0119 wynikiem ${scoreForPoland} na korzy\u015B\u0107 rywali, co przekre\u015Bli\u0142o szanse Bia\u0142o-Czerwonych na udzia\u0142 w nadchodz\u0105cym mundialu.`;
    } else {
      subject = polandWon ? "POLSKA JEDZIE NA MUNDIAL! Zwyci\u0119stwo w finale bara\u017Cy!!!" : "Polska przegrywa fina\u0142 bara\u017Cy. Mundial bez Bia\u0142o-Czerwonych";
      lead = polandWon ? `Reprezentacja Polski wygrywa fina\u0142 \u015Bcie\u017Cki ${polandPath.pathLabel}, pokonuj\u0105c ${opponent} ${scoreForPoland}, i wywalczy\u0142a awans na Mistrzostwa \u015Awiata. Bia\u0142o-Czerwoni wracaj\u0105 na najwi\u0119ksz\u0105 scen\u0119 futbolu.` : `Reprezentacja Polski nie awansowa\u0142a do Mistrzostw \u015Awiata po pora\u017Cce w meczu bara\u017Cowym z reprezentacj\u0105 ${opponent}. Spotkanie zako\u0144czy\u0142o si\u0119 wynikiem ${scoreForPoland} na korzy\u015B\u0107 rywali, co przekre\u015Bli\u0142o szanse Bia\u0142o-Czerwonych na udzia\u0142 w nadchodz\u0105cym mundialu.`;
    }
    const finalOpponent = polandWon && stage === "SF" ? [polandPath.finalHome, polandPath.finalAway].find((team) => team && team !== "Polska") : null;
    let body = `\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
`;
    body += `  SPORT EXPRESS  \u2014  WYDANIE SPECJALNE
`;
    body += `  BARA\u017BE M\u015A  \u2014  ${stageLabel}
`;
    body += `\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

`;
    body += `${lead}

`;
    body += `${sep}
`;
    body += `  WYNIK MECZU
`;
    body += `${sep}

`;
    body += `  Polska \u2014 ${opponent}
`;
    body += `  ${scoreForPoland}

`;
    if (stage === "SF" && polandWon && finalOpponent) {
      body += `${sep}
`;
      body += `  CO DALEJ?
`;
      body += `${sep}

`;
      body += `  W finale \u015Bcie\u017Cki ${polandPath.pathLabel} Polska zagra z reprezentacj\u0105 ${finalOpponent}.
`;
      body += `  Stawk\u0105 tego spotkania b\u0119dzie bezpo\u015Bredni awans na mundial.

`;
    }
    if (stage === "FINAL") {
      body += `${sep}
`;
      body += `  STAWKA ROZSTRZYGNI\u0118TA
`;
      body += `${sep}

`;
      body += polandWon ? `  Bia\u0142o-Czerwoni wygrali bara\u017Cow\u0105 \u015Bcie\u017Ck\u0119 ${polandPath.pathLabel} i do\u0142\u0105czyli do grona uczestnik\xF3w M\u015A .

` : `  Zwyci\u0119zca \u015Bcie\u017Cki ${polandPath.pathLabel} pojedzie na M\u015A, a Polska ko\u0144czy eliminacje na etapie fina\u0142u bara\u017Cy.

`;
    }
    body += `${sep}
`;
    body += `  \xA9 Sport Express / Redakcja Sport Express`;
    return {
      id: `WCQ_PLAYOFF_POLAND_${stage}_${playoffState.seasonYear}_${polandPath.pathLabel}`,
      sender: "Sport Express",
      role: "Redakcja Sportowa",
      subject,
      body,
      date: new Date(date),
      isRead: false,
      type: "MEDIA" /* MEDIA */,
      priority: stage === "FINAL" ? 155 : 145,
      metadata: {
        type: "WCQ_PLAYOFF_POLAND",
        stage,
        pathLabel: polandPath.pathLabel,
        homeTeam: result.homeTeam,
        awayTeam: result.awayTeam,
        homeScore: result.homeGoals,
        awayScore: result.awayGoals,
        scoreLabel: scoreForPoland,
        polandWon,
        lead,
        finalOpponent,
        penaltyWinner: result.penaltyWinner,
        homePenaltyGoals: result.homePenaltyGoals,
        awayPenaltyGoals: result.awayPenaltyGoals,
        wentToExtraTime: result.wentToExtraTime
      }
    };
  },
  generateCoachFiredMail: (clubName, coachName, rank) => {
    return MailService.createFromTemplate("media_coach_fired", {
      "CLUB": clubName,
      "COACH": coachName,
      "RANK": rank.toString()
    });
  },
  generateBoardWarningMail: (rank) => {
    return MailService.createFromTemplate("board_coach_warning", {
      "RANK": rank.toString()
    });
  },
  /**
   * Codzienne generowanie poczty z zachowaniem logiki realizmu futbolowego.
   */
  generateDailyMails: (currentDate2, userClub2, allPlayers, allClubs2, rank, boardConfidence, recentFixture, nextFixture, existingMails = [], userLineup, allFixtures2, managerName, managerExpPoints, mediaRelationships = {}, sentUnfriendlyPressMonths = [], sentFriendlyPressMonths = [], seasonNumber = 1, matchHistory = [], managerExpectedRank, managerContract2) => {
    const newMails = [];
    const played = userClub2.stats.played;
    const userSquad = allPlayers[userClub2.id] || [];
    const createMail = (templateId, replacements = {}) => {
      const template = MAIL_TEMPLATES.find((t) => t.id === templateId) || MAIL_TEMPLATES[0];
      let body = template.body;
      let subject = template.subject;
      Object.entries(replacements).forEach(([key, val]) => {
        const regex = new RegExp(`{${key}}`, "g");
        body = body.replace(regex, val);
        subject = subject.replace(regex, val);
      });
      return {
        id: `MAIL_${currentDate2.getTime()}_${templateId}_${Math.random()}`,
        sender: template.sender,
        role: template.role,
        subject,
        body,
        date: new Date(currentDate2),
        isRead: false,
        type: template.type,
        priority: template.type === "BOARD" /* BOARD */ ? 10 : 5
      };
    };
    if (recentFixture && recentFixture.status === "FINISHED" /* FINISHED */) {
      const isUserHome = recentFixture.homeTeamId === userClub2.id;
      const userScore = isUserHome ? recentFixture.homeScore : recentFixture.awayScore;
      const oppScore = isUserHome ? recentFixture.awayScore : recentFixture.homeScore;
      if (userScore !== null && oppScore !== null) {
        if (userScore >= 4 && userScore > oppScore) {
          newMails.push(createMail("board_high_win_praise", { "CLUB": userClub2.name }));
        } else if (userScore >= 4 && userScore < oppScore) {
          newMails.push(createMail("fans_bitter_loss_high_score", { "CLUB": userClub2.name }));
        } else if (oppScore - userScore >= 3) {
          newMails.push(createMail("fans_furious_loss", { "CLUB": userClub2.name }));
        }
      }
    }
    const rivalryWarningMail = buildRivalryWarningMail(currentDate2, userClub2, allClubs2, nextFixture);
    if (rivalryWarningMail && !existingMails.some((mail) => mail.id === rivalryWarningMail.id)) {
      newMails.push(rivalryWarningMail);
    }
    const rng = Math.random();
    const month = currentDate2.getMonth() + 1;
    const day = currentDate2.getDate();
    const isBeforeLastLeagueMatch = isBeforeLeagueSeasonEnd(currentDate2);
    const isWinterBreak = month === 12 && day >= 18 || month === 1;
    const boardPositionMonthKey = getYearMonthKey(currentDate2);
    const boardPositionTemplateIds = /* @__PURE__ */ new Set([
      "board_excellent_position",
      "board_bad_position",
      "board_watching_patience",
      "board_recovery_progress"
    ]);
    const alreadySentBoardPositionThisMonth = existingMails.some((mail) => {
      const mailDate = getMailDate(mail);
      if (!mailDate || getYearMonthKey(mailDate) !== boardPositionMonthKey) return false;
      return [...boardPositionTemplateIds].some((templateId) => mail.id.includes(`_${templateId}_`));
    });
    const alreadySentRecoveryThisMonth = existingMails.some((mail) => {
      const mailDate = getMailDate(mail);
      return !!mailDate && getYearMonthKey(mailDate) === boardPositionMonthKey && (mail.id.includes("_board_recovery_progress_") || mail.subject === "Wyra\u017Any post\u0119p dru\u017Cyny");
    });
    const alreadySentWinningStreakThisMonth = existingMails.some((mail) => {
      const mailDate = getMailDate(mail);
      if (!mailDate || getYearMonthKey(mailDate) !== boardPositionMonthKey) return false;
      return mail.id.includes("board_winning_streak") || mail.subject === "Imponuj\u0105ca seria zwyci\u0119stw!";
    });
    const remainingUserLeagueMatches = allFixtures2 ? allFixtures2.filter(
      (f) => f.status === "SCHEDULED" /* SCHEDULED */ && f.leagueId === userClub2.leagueId && (f.homeTeamId === userClub2.id || f.awayTeamId === userClub2.id) && startOfDay(f.date) >= startOfDay(currentDate2)
    ).length : Number.POSITIVE_INFINITY;
    const canSendLateSeasonBoardPressure = remainingUserLeagueMatches >= 3;
    const managerTenure = ManagerContractService.getManagerTenureSnapshot(
      managerContract2,
      userClub2,
      allFixtures2 ?? [],
      currentDate2
    );
    const managerFormTrend = getManagerLeagueFormTrend(
      managerContract2,
      userClub2,
      allFixtures2 ?? [],
      currentDate2
    );
    if (played >= 3 && managerTenure.leagueMatchesManaged >= 3 && isBeforeLastLeagueMatch && !isWinterBreak) {
      const expectedRank = Math.max(1, Math.round(19 - userClub2.reputation * 1.7));
      const isHighRepClub = userClub2.reputation >= 8;
      const isFirstHalf = played < 17;
      if (!alreadySentRecoveryThisMonth && rank >= expectedRank + 4 && managerFormTrend.isClearRecovery) {
        newMails.push(createMail("board_recovery_progress", { "CLUB": userClub2.name }));
      } else if (!alreadySentBoardPositionThisMonth && rng < 0.15) {
        if (rank <= expectedRank - 3) {
          newMails.push(createMail("board_excellent_position", { "CLUB": userClub2.name }));
        } else if (rank >= expectedRank + 4 && managerTenure.pressureStage !== "NONE") {
          if (managerTenure.pressureStage === "CONCERN" || isHighRepClub && isFirstHalf) {
            newMails.push(createMail("board_watching_patience", { "CLUB": userClub2.name }));
          } else {
            newMails.push(createMail("board_bad_position", { "CLUB": userClub2.name }));
          }
        }
      }
      const form = userClub2.stats.form;
      const currentWinStreak = managerFormTrend.matchesManaged > 0 ? managerFormTrend.currentWinStreak : (() => {
        let streak = 0;
        for (let i = form.length - 1; i >= 0 && form[i] === "W"; i--) streak++;
        return streak;
      })();
      let currentLossStreak = 0;
      for (let i = form.length - 1; i >= 0 && form[i] === "P"; i--) currentLossStreak++;
      if (managerTenure.pressureStage === "FULL" && boardConfidence < 35 && rng < 0.2 && currentLossStreak >= 3) {
        newMails.push(createMail("board_losing_streak", { "CLUB": userClub2.name }));
      } else if (!managerFormTrend.isClearRecovery && boardConfidence > 85 && rng < 0.1 && currentWinStreak >= 3 && !alreadySentWinningStreakThisMonth) {
        newMails.push(createMail("board_winning_streak", { "CLUB": userClub2.name }));
      }
    }
    if (month === 1 && played >= 5 && managerTenure.leagueMatchesManaged >= 5) {
      const alreadySentWinterForm = existingMails.some((m) => m.id.includes("WINTER_FORM"));
      if (!alreadySentWinterForm) {
        const recentForm = userClub2.stats.form.slice(-5);
        const wins = recentForm.filter((r) => r === "W").length;
        const templateByTone = [
          "board_winter_form_poor",
          "board_winter_form_mixed",
          "board_winter_form_good",
          "board_winter_form_excellent"
        ];
        const formTone = wins >= 4 ? 3 : wins === 3 ? 2 : wins === 2 ? 1 : 0;
        const rankToneFloor = rank === 1 ? 2 : rank <= 3 ? 1 : 0;
        const winterTemplateId = templateByTone[Math.max(formTone, rankToneFloor)];
        const winterMail = createMail(winterTemplateId, { "CLUB": userClub2.name });
        winterMail.id = `WINTER_FORM_${currentDate2.getFullYear()}`;
        newMails.push(winterMail);
      }
    }
    if (allFixtures2 && allFixtures2.length > 0) {
      const NON_COMPETITIVE = ["FRIENDLY", "BREAK", "OFF_SEASON", "TRANSFER_WINDOW", "BOARD"];
      const competitiveFixtures = allFixtures2.filter(
        (f) => f.status === "FINISHED" /* FINISHED */ && (f.homeTeamId === userClub2.id || f.awayTeamId === userClub2.id) && !NON_COMPETITIVE.includes(f.leagueId) && !f.leagueId.includes("DRAW")
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const isUserWin = (f) => {
        const isHome = f.homeTeamId === userClub2.id;
        const userScore = isHome ? f.homeScore ?? 0 : f.awayScore ?? 0;
        const oppScore = isHome ? f.awayScore ?? 0 : f.homeScore ?? 0;
        return userScore > oppScore;
      };
      const isUserLoss = (f) => {
        const isHome = f.homeTeamId === userClub2.id;
        const userScore = isHome ? f.homeScore ?? 0 : f.awayScore ?? 0;
        const oppScore = isHome ? f.awayScore ?? 0 : f.homeScore ?? 0;
        return userScore < oppScore;
      };
      const latestCompetitiveFixture = competitiveFixtures[competitiveFixtures.length - 1];
      const latestCompetitiveWasPlayedToday = latestCompetitiveFixture ? startOfDay(latestCompetitiveFixture.date) === startOfDay(currentDate2) : false;
      if (latestCompetitiveFixture && latestCompetitiveWasPlayedToday) {
        const varControversyContext = getVarControversyArticleContext(matchHistory, latestCompetitiveFixture, allClubs2);
        if (varControversyContext && Math.random() < 0.3) {
          const varMailId = `PRESS_VAR_CONTROVERSY_${latestCompetitiveFixture.id}`;
          const alreadySentVarArticle = existingMails.some((m) => m.id === varMailId) || newMails.some((m) => m.id === varMailId);
          if (!alreadySentVarArticle) {
            const isHome = latestCompetitiveFixture.homeTeamId === userClub2.id;
            const opponentId = isHome ? latestCompetitiveFixture.awayTeamId : latestCompetitiveFixture.homeTeamId;
            const opponentName = allClubs2.find((club) => club.id === opponentId)?.name ?? "rywalem";
            const venueLabel = isHome ? "w domu" : "na wyje\u017Adzie";
            const newspapers = Object.values(Newspaper);
            const newspaper = newspapers[Math.floor(Math.random() * newspapers.length)];
            const managerLastName = MediaInterviewService.getPressManagerLabel(managerName);
            const varMail = MediaInterviewService.generatePressArticleMail(
              "VAR_KONTROWERSJE",
              newspaper,
              managerLastName,
              userClub2.name,
              currentDate2,
              {
                opponentName,
                venueLabel,
                varControversyTeamName: varControversyContext.teamName,
                varControversyTeamRole: varControversyContext.teamRole
              }
            );
            varMail.id = varMailId;
            varMail.date = new Date(currentDate2);
            varMail.priority = 58;
            newMails.push(varMail);
          }
        }
        const aiTwoGoalLossVarCriticismContext = getAiTwoGoalLossVarCriticismArticleContext(matchHistory, latestCompetitiveFixture, userClub2, allClubs2);
        if (aiTwoGoalLossVarCriticismContext && Math.random() < 0.2) {
          const aiTwoGoalLossVarMailId = `PRESS_AI_TWO_GOAL_LOSS_VAR_CRITICISM_${latestCompetitiveFixture.id}`;
          const alreadySentAiTwoGoalLossVarArticle = existingMails.some((m) => m.id === aiTwoGoalLossVarMailId) || newMails.some((m) => m.id === aiTwoGoalLossVarMailId);
          if (!alreadySentAiTwoGoalLossVarArticle) {
            const isHome = latestCompetitiveFixture.homeTeamId === userClub2.id;
            const opponentId = isHome ? latestCompetitiveFixture.awayTeamId : latestCompetitiveFixture.homeTeamId;
            const opponentName = allClubs2.find((club) => club.id === opponentId)?.name ?? "rywalem";
            const venueLabel = isHome ? "w domu" : "na wyje\u017Adzie";
            const newspapers = Object.values(Newspaper);
            const newspaper = newspapers[Math.floor(Math.random() * newspapers.length)];
            const managerLastName = MediaInterviewService.getPressManagerLabel(managerName);
            const aiTwoGoalLossVarMail = MediaInterviewService.generatePressArticleMail(
              "TRENER_AI_KRYTYKUJE_VAR_PO_ANULOWANEJ_BRAMCE",
              newspaper,
              managerLastName,
              userClub2.name,
              currentDate2,
              {
                opponentName,
                venueLabel,
                aiVarCriticismTeamName: aiTwoGoalLossVarCriticismContext.teamName
              }
            );
            aiTwoGoalLossVarMail.id = aiTwoGoalLossVarMailId;
            aiTwoGoalLossVarMail.date = new Date(currentDate2);
            aiTwoGoalLossVarMail.priority = 57;
            newMails.push(aiTwoGoalLossVarMail);
          }
        }
        const redCardControversyContext = getAiRedCardControversyArticleContext(matchHistory, latestCompetitiveFixture, userClub2, allClubs2);
        if (redCardControversyContext && Math.random() < 0.3) {
          const redCardMailId = `PRESS_RED_CARD_CONTROVERSY_${latestCompetitiveFixture.id}`;
          const alreadySentRedCardArticle = existingMails.some((m) => m.id === redCardMailId) || newMails.some((m) => m.id === redCardMailId);
          if (!alreadySentRedCardArticle) {
            const isHome = latestCompetitiveFixture.homeTeamId === userClub2.id;
            const opponentId = isHome ? latestCompetitiveFixture.awayTeamId : latestCompetitiveFixture.homeTeamId;
            const opponentName = allClubs2.find((club) => club.id === opponentId)?.name ?? "rywalem";
            const venueLabel = isHome ? "w domu" : "na wyje\u017Adzie";
            const newspapers = Object.values(Newspaper);
            const newspaper = newspapers[Math.floor(Math.random() * newspapers.length)];
            const managerLastName = MediaInterviewService.getPressManagerLabel(managerName);
            const redCardMail = MediaInterviewService.generatePressArticleMail(
              "CZERWONA_KARTKA_KONTROWERSJE",
              newspaper,
              managerLastName,
              userClub2.name,
              currentDate2,
              {
                opponentName,
                venueLabel,
                redCardControversyTeamName: redCardControversyContext.teamName
              }
            );
            redCardMail.id = redCardMailId;
            redCardMail.date = new Date(currentDate2);
            redCardMail.priority = 57;
            newMails.push(redCardMail);
          }
        }
        const penaltyNoCallControversyContext = getAiPenaltyNoCallControversyArticleContext(matchHistory, latestCompetitiveFixture, userClub2, allClubs2);
        if (penaltyNoCallControversyContext && Math.random() < 0.3) {
          const penaltyNoCallMailId = `PRESS_PENALTY_NO_CALL_CONTROVERSY_${latestCompetitiveFixture.id}`;
          const alreadySentPenaltyNoCallArticle = existingMails.some((m) => m.id === penaltyNoCallMailId) || newMails.some((m) => m.id === penaltyNoCallMailId);
          if (!alreadySentPenaltyNoCallArticle) {
            const isHome = latestCompetitiveFixture.homeTeamId === userClub2.id;
            const opponentId = isHome ? latestCompetitiveFixture.awayTeamId : latestCompetitiveFixture.homeTeamId;
            const opponentName = allClubs2.find((club) => club.id === opponentId)?.name ?? "rywalem";
            const venueLabel = isHome ? "w domu" : "na wyje\u017Adzie";
            const newspapers = Object.values(Newspaper);
            const newspaper = newspapers[Math.floor(Math.random() * newspapers.length)];
            const managerLastName = MediaInterviewService.getPressManagerLabel(managerName);
            const penaltyNoCallMail = MediaInterviewService.generatePressArticleMail(
              "NIEPRZYZNANY_KARNY_KONTROWERSJE",
              newspaper,
              managerLastName,
              userClub2.name,
              currentDate2,
              {
                opponentName,
                venueLabel,
                penaltyNoCallControversyTeamName: penaltyNoCallControversyContext.teamName
              }
            );
            penaltyNoCallMail.id = penaltyNoCallMailId;
            penaltyNoCallMail.date = new Date(currentDate2);
            penaltyNoCallMail.priority = 56;
            newMails.push(penaltyNoCallMail);
          }
        }
        const lowRefereeRatingContext = getLowRefereeRatingArticleContext(matchHistory, latestCompetitiveFixture);
        if (lowRefereeRatingContext && Math.random() < 0.2) {
          const lowRefereeRatingMailId = `PRESS_LOW_REFEREE_RATING_${latestCompetitiveFixture.id}`;
          const alreadySentLowRefereeRatingArticle = existingMails.some((m) => m.id === lowRefereeRatingMailId) || newMails.some((m) => m.id === lowRefereeRatingMailId);
          if (!alreadySentLowRefereeRatingArticle) {
            const isHome = latestCompetitiveFixture.homeTeamId === userClub2.id;
            const opponentId = isHome ? latestCompetitiveFixture.awayTeamId : latestCompetitiveFixture.homeTeamId;
            const opponentName = allClubs2.find((club) => club.id === opponentId)?.name ?? "rywalem";
            const venueLabel = isHome ? "w domu" : "na wyje\u017Adzie";
            const newspapers = Object.values(Newspaper);
            const newspaper = newspapers[Math.floor(Math.random() * newspapers.length)];
            const managerLastName = MediaInterviewService.getPressManagerLabel(managerName);
            const lowRefereeRatingMail = MediaInterviewService.generatePressArticleMail(
              "NISKA_OCENA_SEDZIEGO",
              newspaper,
              managerLastName,
              userClub2.name,
              currentDate2,
              {
                opponentName,
                venueLabel,
                refereeName: lowRefereeRatingContext.refereeName
              }
            );
            lowRefereeRatingMail.id = lowRefereeRatingMailId;
            lowRefereeRatingMail.date = new Date(currentDate2);
            lowRefereeRatingMail.priority = 55;
            newMails.push(lowRefereeRatingMail);
          }
        }
      }
      const userLeagueFixtures = competitiveFixtures.filter((f) => f.leagueId === userClub2.leagueId);
      const latestLeagueFixture = userLeagueFixtures[userLeagueFixtures.length - 1];
      const latestLeagueWasPlayedToday = latestLeagueFixture ? startOfDay(latestLeagueFixture.date) === startOfDay(currentDate2) : false;
      if (latestLeagueFixture && userLeagueFixtures.length >= 3 && latestLeagueWasPlayedToday) {
        const isHome = latestLeagueFixture.homeTeamId === userClub2.id;
        const latestUserScore = isHome ? latestLeagueFixture.homeScore ?? 0 : latestLeagueFixture.awayScore ?? 0;
        const latestOpponentScore = isHome ? latestLeagueFixture.awayScore ?? 0 : latestLeagueFixture.homeScore ?? 0;
        const latestGoalDiff = latestUserScore - latestOpponentScore;
        const opponentId = isHome ? latestLeagueFixture.awayTeamId : latestLeagueFixture.homeTeamId;
        const opponentName = allClubs2.find((club) => club.id === opponentId)?.name ?? "rywalem";
        const venueLabel = isHome ? "w domu" : "na wyje\u017Adzie";
        const managerFullName = managerName?.trim().replace(/\s+/g, " ") || "nowego trenera";
        if (latestGoalDiff >= 6) {
          const demolitionMailId = `PRESS_DEMOLITION_${latestLeagueFixture.id}`;
          const alreadySentDemolition = existingMails.some((m) => m.id === demolitionMailId);
          if (!alreadySentDemolition) {
            const newspapers = Object.values(Newspaper);
            const newspaper = newspapers[Math.floor(Math.random() * newspapers.length)];
            const managerLastName = MediaInterviewService.getPressManagerLabel(managerName);
            const demolitionMail = MediaInterviewService.generatePressArticleMail(
              "TOTALNA_DEMOLKA",
              newspaper,
              managerLastName,
              userClub2.name,
              currentDate2,
              { opponentName, venueLabel, latestResultType: "WIN" }
            );
            demolitionMail.id = demolitionMailId;
            demolitionMail.date = new Date(currentDate2);
            demolitionMail.priority = 65;
            newMails.push(demolitionMail);
          }
        }
        if (latestGoalDiff <= -6) {
          const humiliationMailId = `PRESS_HUMILIATION_${latestLeagueFixture.id}`;
          const alreadySentHumiliation = existingMails.some((m) => m.id === humiliationMailId);
          if (!alreadySentHumiliation) {
            const newspapers = Object.values(Newspaper);
            const newspaper = newspapers[Math.floor(Math.random() * newspapers.length)];
            const managerLastName = MediaInterviewService.getPressManagerLabel(managerName);
            const humiliationMail = MediaInterviewService.generatePressArticleMail(
              "TOTALNA_KOMPROMITACJA",
              newspaper,
              managerLastName,
              userClub2.name,
              currentDate2,
              { opponentName, venueLabel, latestResultType: "LOSS", managerFullName }
            );
            humiliationMail.id = humiliationMailId;
            humiliationMail.date = new Date(currentDate2);
            humiliationMail.priority = 66;
            newMails.push(humiliationMail);
          }
        }
        const friendlyPressMonthKey = getYearMonthKey(currentDate2);
        const alreadySentFriendlyThisMonth = sentFriendlyPressMonths.includes(friendlyPressMonthKey) || existingMails.some((m) => m.id.startsWith(`PRESS_FRIENDLY_START_${friendlyPressMonthKey}_`));
        if (Math.abs(latestGoalDiff) < 6 && !alreadySentFriendlyThisMonth) {
          const friendlyNewspaper = MediaInterviewService.pickFriendlyNewspaper(mediaRelationships);
          if (friendlyNewspaper) {
            const recentLeagueFixtures = userLeagueFixtures.slice(-3);
            const recentWins = recentLeagueFixtures.filter(isUserWin).length;
            const recentLosses = recentLeagueFixtures.filter(isUserLoss).length;
            const latestWasWin = isUserWin(latestLeagueFixture);
            const latestWasLoss = isUserLoss(latestLeagueFixture);
            const latestResultType = latestWasWin ? "WIN" : latestWasLoss ? "LOSS" : "DRAW";
            const hasGoodResults = latestWasWin || recentWins >= 2 || recentLosses === 0;
            const isEarlyLeagueSeason = userLeagueFixtures.length <= 5;
            const seasonPhase = userLeagueFixtures.length <= 5 ? "EARLY" : userLeagueFixtures.length >= 28 ? "LATE" : "MID";
            const friendlyMailId = `PRESS_FRIENDLY_START_${friendlyPressMonthKey}_${latestLeagueFixture.id}_${friendlyNewspaper}`;
            const alreadySentFriendly = existingMails.some((m) => m.id === friendlyMailId);
            if (!alreadySentFriendly) {
              const managerLastName = MediaInterviewService.getPressManagerLabel(managerName);
              const variant = MediaInterviewService.determineFriendlySeasonPressVariant(
                hasGoodResults,
                latestWasWin,
                isEarlyLeagueSeason
              );
              const friendlyMail = MediaInterviewService.generatePressArticleMail(
                variant,
                friendlyNewspaper,
                managerLastName,
                userClub2.name,
                currentDate2,
                { opponentName, venueLabel, latestResultType, seasonPhase }
              );
              friendlyMail.id = friendlyMailId;
              friendlyMail.date = new Date(currentDate2);
              friendlyMail.priority = 52;
              newMails.push(friendlyMail);
            }
          }
        }
      }
      if (competitiveFixtures.length >= 5) {
        const last5 = competitiveFixtures.slice(-5);
        const last6th = competitiveFixtures.length >= 6 ? competitiveFixtures[competitiveFixtures.length - 6] : null;
        const allLast5NonWin = last5.every((f) => !isUserWin(f));
        const prev6thWasWin = last6th === null || isUserWin(last6th);
        if (allLast5NonWin && prev6thWasWin) {
          const streakMailId = `PRESS_WINLESS_5_${new Date(last5[last5.length - 1].date).getTime()}`;
          const alreadySent = existingMails.some((m) => m.id === streakMailId);
          if (!alreadySent) {
            const streakMail = createMail("press_winless_streak", { "CLUB": userClub2.name });
            streakMail.id = streakMailId;
            newMails.push(streakMail);
          }
        }
        const unfriendlyPressMonthKey = getYearMonthKey(currentDate2);
        const alreadySentUnfriendlyThisMonth = sentUnfriendlyPressMonths.includes(unfriendlyPressMonthKey) || existingMails.some((m) => m.id.startsWith(`PRESS_UNFRIENDLY_LOSS_${unfriendlyPressMonthKey}_`));
        if (latestLeagueFixture && userLeagueFixtures.length > 5 && latestLeagueWasPlayedToday && isUserLoss(latestLeagueFixture) && !alreadySentUnfriendlyThisMonth) {
          const unfriendlyNewspaper = MediaInterviewService.pickUnfriendlyNewspaper(mediaRelationships);
          if (unfriendlyNewspaper) {
            const criticalMailId = `PRESS_UNFRIENDLY_LOSS_${unfriendlyPressMonthKey}_${latestLeagueFixture.id}_${unfriendlyNewspaper}`;
            const alreadySentCritical = existingMails.some((m) => m.id === criticalMailId);
            if (!alreadySentCritical) {
              const managerLastName = MediaInterviewService.getPressManagerLabel(managerName);
              const variant = MediaInterviewService.determineUnfriendlySeasonPressVariant();
              const criticalMail = MediaInterviewService.generatePressArticleMail(
                variant,
                unfriendlyNewspaper,
                managerLastName,
                userClub2.name,
                currentDate2
              );
              criticalMail.id = criticalMailId;
              criticalMail.date = new Date(currentDate2);
              criticalMail.priority = 55;
              newMails.push(criticalMail);
            }
          }
        }
      }
    }
    if (currentDate2.getDay() === 1 && userClub2.leagueId !== "NONE" && played > 0 && isBeforeLastLeagueMatch && canSendLateSeasonBoardPressure && managerTenure.pressureStage !== "NONE" && !managerFormTrend.isClearRecovery) {
      const board = userClub2.board;
      if (board) {
        const pressure = CoachService.getPerformancePressure(userClub2, rank, managerExpPoints, managerExpectedRank);
        const gap = pressure.gap;
        if ((pressure.finalChance > 0 || pressure.earlyReviewAllowed) && gap > 0) {
          if (managerTenure.pressureStage === "CONCERN") {
            newMails.push(createMail("board_pressure_concern", { "CLUB": userClub2.name }));
          } else if (gap >= 7 || rank >= 16 && userClub2.reputation >= 7) {
            newMails.push(createMail("board_pressure_critical", { "CLUB": userClub2.name }));
          } else if (gap >= 4) {
            newMails.push(createMail("board_pressure_warning", { "CLUB": userClub2.name }));
          } else if (gap >= 2) {
            newMails.push(createMail("board_pressure_concern", { "CLUB": userClub2.name }));
          }
        }
      }
    }
    if (rng < 0.2) {
      const leagueId = userClub2.leagueId;
      const otherClubs = allClubs2.filter((c) => c.leagueId === leagueId && c.id !== userClub2.id);
      let victim = null;
      let victimClub = null;
      for (const club of otherClubs) {
        const squad = allPlayers[club.id] || [];
        const injuredStar = squad.find(
          (p) => p.health.status === "INJURED" /* INJURED */ && p.health.injury?.severity === "SEVERE" /* SEVERE */ && p.overallRating >= 75 && (p.health.injury?.daysRemaining ?? 0) >= STAR_INJURY_DRAMA_MIN_DAYS
        );
        if (injuredStar) {
          victim = injuredStar;
          victimClub = club;
          break;
        }
      }
      if (victim && victimClub) {
        const alreadySent = existingMails.some(
          (m) => m.subject.includes(victim.lastName)
        );
        if (!alreadySent) {
          newMails.push(createMail("media_league_star_injured", {
            "PLAYER": victim.lastName,
            "OTHER_CLUB": victimClub.name,
            "DAYS": victim.health.injury?.daysRemaining.toString() || "30"
          }));
        }
      }
    }
    const squadIds = /* @__PURE__ */ new Set([
      ...userLineup?.startingXI.filter(Boolean) ?? [],
      ...userLineup?.bench ?? []
    ]);
    const isInSquad = (p) => squadIds.size === 0 || squadIds.has(p.id);
    const mildFatiguePlayer = userSquad.find(
      (p) => p.condition < 85 && p.condition >= 80 && isInSquad(p) && p.health.status !== "INJURED" /* INJURED */
    );
    if (mildFatiguePlayer && rng < 0.3) {
      const alreadySentMild = existingMails.some(
        (m) => m.subject.includes(mildFatiguePlayer.lastName)
      );
      if (!alreadySentMild) {
        newMails.push(createMail("staff_fatigue_check", { "PLAYER": mildFatiguePlayer.lastName }));
      }
    }
    const overworkedPlayer = userSquad.find(
      (p) => p.condition < 80 && isInSquad(p) && p.health.status !== "INJURED" /* INJURED */
    );
    if (overworkedPlayer && rng < 0.3) {
      const alreadySentFatigue = existingMails.some(
        (m) => m.subject.includes(overworkedPlayer.lastName)
      );
      if (!alreadySentFatigue) {
        newMails.push(createMail("staff_fatigue_warning", { "PLAYER": overworkedPlayer.lastName }));
      }
    }
    const severeInjury = userSquad.find((p) => p.health.status === "INJURED" /* INJURED */ && p.health.injury?.severity === "SEVERE" /* SEVERE */ && p.health.injury.daysRemaining >= 12);
    if (severeInjury && rng < 0.15) {
      const alreadySentSevere = existingMails.some(
        (m) => m.subject.includes(severeInjury.lastName)
      );
      if (!alreadySentSevere) {
        newMails.push(createMail("staff_severe_injury", {
          "PLAYER": severeInjury.lastName,
          "DAYS": severeInjury.health.injury?.daysRemaining.toString() || "30"
        }));
      }
    }
    if (seasonNumber === 1 && month === 7 && day === 3) {
      const interviewMailId = MediaInterviewService.getTakingOverInterviewMailId(userClub2, currentDate2);
      const legacyInterviewMailId = `MEDIA_INTERVIEW_OBJECIE_${currentDate2.getFullYear()}`;
      const alreadySent = existingMails.some(
        (m) => m.id === interviewMailId || m.id === legacyInterviewMailId && m.metadata?.type === "INTERVIEW_REQUEST" && m.metadata.placeholders.clubName === userClub2.name
      );
      if (!alreadySent) {
        const mail = MediaInterviewService.generateTakingOverInterviewMail(
          userClub2,
          userSquad,
          managerName ?? `${userClub2.name} trener`,
          currentDate2
        );
        newMails.push(mail);
      }
    }
    return newMails;
  },
  generateIncomingOfferMail(player, buyerClubName, buyerLeagueName, fee, timing, sellerClubName, boardPressure, currentDate2, offerId) {
    const playerName = `${player.firstName} ${player.lastName}`;
    const responseDeadline = new Date(currentDate2);
    responseDeadline.setDate(responseDeadline.getDate() + 5);
    const deadlineLabel = responseDeadline.toLocaleDateString("pl-PL");
    return {
      id: `incoming_offer_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: "Dzial Transferowy",
      role: "Kierownik ds. Transferow",
      subject: `Pilne: Oficjalna oferta transferowa - ${playerName}`,
      body: [
        "Szanowny Trenerze,",
        "",
        `Informuje, ze do klubu wplynela oficjalna oferta transferowa za ${playerName} zlozona przez ${buyerClubName}.`,
        "",
        "Zarzad oraz pion sportowy prosza o Trenera opinie dotyczaca tej propozycji. Prosimy o przeanalizowanie oferty pod katem sportowym oraz roli zawodnika w kadrze w nadchodzacym czasie.",
        "",
        "Kluczowe informacje:",
        "",
        `Zainteresowany klub: ${buyerClubName}`,
        "",
        `Termin rozpatrzenia: Mamy 5 dni na udzielenie oficjalnej odpowiedzi (do dnia ${deadlineLabel}).`,
        "",
        "Bede wdzieczny za informacje zwrotna lub propozycje krotkiego spotkania, abysmy mogli wspolnie wypracowac ostateczne stanowisko klubu w tej sprawie.",
        "",
        "Z powazaniem,",
        "",
        `Dzial Transferowy ${sellerClubName}`
      ].join("\n"),
      date: currentDate2,
      isRead: false,
      type: "SYSTEM" /* SYSTEM */,
      priority: boardPressure ? 2 : 1,
      metadata: { type: "INCOMING_TRANSFER_OFFER", offerId }
    };
    const boardNote = boardPressure ? "UWAGA: Zarz\u0105d rozwa\u017Ca sprzeda\u017C ze wzgl\u0119d\xF3w finansowych lub atrakcyjno\u015Bci oferty. Odrzucenie mo\u017Ce negatywnie wp\u0142yn\u0105\u0107 na zaufanie zarz\u0105du.\n\n" : "";
    const template = MAIL_TEMPLATES.find((t) => t.id === "incoming_offer_initial");
    const body = template.body.replace("{PLAYER}", `${player.firstName} ${player.lastName}`).replace("{BUYER_CLUB}", buyerClubName).replace("{BUYER_LEAGUE}", buyerLeagueName).replace("{FEE}", fee.toLocaleString("pl-PL")).replace("{TIMING}", timing).replace("{BOARD_PRESSURE_NOTE}", boardNote).replace(/{CLUB}/g, sellerClubName);
    return {
      id: `incoming_offer_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject.replace("{PLAYER}", `${player.firstName} ${player.lastName}`),
      body,
      date: currentDate2,
      isRead: false,
      type: template.type,
      priority: boardPressure ? 2 : 1,
      metadata: { type: "INCOMING_TRANSFER_OFFER", offerId }
    };
  },
  generateIncomingLoanOfferMail(player, buyerClubName, buyerLeagueName, loanFee, loanDuration, wageCoveragePercent, sellerClubName, currentDate2, offerId) {
    const playerName = `${player.firstName} ${player.lastName}`;
    const responseDeadline = new Date(currentDate2);
    responseDeadline.setDate(responseDeadline.getDate() + 5);
    const deadlineLabel = responseDeadline.toLocaleDateString("pl-PL");
    return {
      id: `incoming_loan_offer_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: "Dzia\u0142 Transferowy",
      role: "Kierownik ds. Wypo\u017Cycze\u0144",
      subject: `Oferta wypo\u017Cyczenia - ${playerName}`,
      body: [
        "Szanowny Trenerze,",
        "",
        `Do klubu wp\u0142yn\u0119\u0142a oficjalna oferta wypo\u017Cyczenia zawodnika ${playerName}.`,
        "",
        "ZAINTERESOWANY KLUB",
        `${buyerClubName} (${buyerLeagueName})`,
        "",
        "UZASADNIENIE OFERTY",
        "Klub argumentuje, \u017Ce zawodnik by\u0142by realnym wzmocnieniem ich kadry i deklaruje gotowo\u015B\u0107 do przej\u0119cia cz\u0119\u015Bci koszt\xF3w kontraktu.",
        "",
        "WARUNKI PROPOZYCJI",
        `\u2022 Okres: ${loanDuration}`,
        `\u2022 Pokrycie kontraktu: ${wageCoveragePercent}%`,
        `\u2022 Op\u0142ata za wypo\u017Cyczenie: ${loanFee.toLocaleString("pl-PL")} PLN`,
        "",
        "DECYZJA",
        `Termin rozpatrzenia: do dnia ${deadlineLabel}.`,
        "Decyzj\u0119 mo\u017Cna podj\u0105\u0107 bez oczekiwania na kolejn\u0105 tur\u0119 negocjacji.",
        "",
        "Z powa\u017Caniem,",
        `Dzia\u0142 Transferowy ${sellerClubName}`
      ].join("\n"),
      date: currentDate2,
      isRead: false,
      type: "SYSTEM" /* SYSTEM */,
      priority: 1,
      metadata: { type: "INCOMING_TRANSFER_OFFER", offerId }
    };
  },
  generateIncomingOfferReminderMail(player, buyerClubName, fee, sellerClubName, currentDate2, offerId) {
    const template = MAIL_TEMPLATES.find((t) => t.id === "incoming_offer_reminder");
    const body = template.body.replace("{PLAYER}", `${player.firstName} ${player.lastName}`).replace("{BUYER_CLUB}", buyerClubName).replace("{FEE}", fee.toLocaleString("pl-PL")).replace(/{CLUB}/g, sellerClubName);
    return {
      id: `incoming_reminder_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject.replace("{PLAYER}", `${player.firstName} ${player.lastName}`),
      body,
      date: currentDate2,
      isRead: false,
      type: template.type,
      priority: 2,
      metadata: { type: "INCOMING_TRANSFER_OFFER", offerId }
    };
  },
  generateIncomingOfferExpiredMail(player, buyerClubName, sellerClubName, currentDate2) {
    const template = MAIL_TEMPLATES.find((t) => t.id === "incoming_offer_expired");
    const body = template.body.replace("{PLAYER}", `${player.firstName} ${player.lastName}`).replace(/{BUYER_CLUB}/g, buyerClubName).replace(/{CLUB}/g, sellerClubName);
    return {
      id: `incoming_expired_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject.replace("{PLAYER}", `${player.firstName} ${player.lastName}`),
      body,
      date: currentDate2,
      isRead: false,
      type: template.type,
      priority: 0
    };
  },
  generateAIAcceptedCounterMail(player, buyerClubName, fee, sellerClubName, currentDate2, offerId) {
    const template = MAIL_TEMPLATES.find((t) => t.id === "incoming_offer_ai_accepted_counter");
    const body = template.body.replace("{PLAYER}", `${player.firstName} ${player.lastName}`).replace("{BUYER_CLUB}", buyerClubName).replace("{FEE}", fee.toLocaleString("pl-PL")).replace(/{CLUB}/g, sellerClubName);
    return {
      id: `incoming_ai_acc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject.replace("{BUYER_CLUB}", buyerClubName).replace("{PLAYER}", `${player.firstName} ${player.lastName}`),
      body,
      date: currentDate2,
      isRead: false,
      type: template.type,
      priority: 2,
      metadata: { type: "INCOMING_TRANSFER_OFFER", offerId }
    };
  },
  generateAICounteredMail(player, buyerClubName, aiCounterFee, round, sellerClubName, currentDate2, offerId) {
    const template = MAIL_TEMPLATES.find((t) => t.id === "incoming_offer_ai_countered");
    const body = template.body.replace("{PLAYER}", `${player.firstName} ${player.lastName}`).replace("{BUYER_CLUB}", buyerClubName).replace("{AI_COUNTER_FEE}", aiCounterFee.toLocaleString("pl-PL")).replace("{ROUND}", round.toString()).replace(/{CLUB}/g, sellerClubName);
    return {
      id: `incoming_ai_ctr_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject.replace("{BUYER_CLUB}", buyerClubName).replace("{PLAYER}", `${player.firstName} ${player.lastName}`),
      body,
      date: currentDate2,
      isRead: false,
      type: template.type,
      priority: 2,
      metadata: { type: "INCOMING_TRANSFER_OFFER", offerId }
    };
  },
  generateAIRejectedCounterMail(player, buyerClubName, sellerClubName, currentDate2) {
    const template = MAIL_TEMPLATES.find((t) => t.id === "incoming_offer_ai_rejected_counter");
    const body = template.body.replace("{PLAYER}", `${player.firstName} ${player.lastName}`).replace("{BUYER_CLUB}", buyerClubName).replace(/{CLUB}/g, sellerClubName);
    return {
      id: `incoming_ai_rej_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject.replace("{BUYER_CLUB}", buyerClubName).replace("{PLAYER}", `${player.firstName} ${player.lastName}`),
      body,
      date: currentDate2,
      isRead: false,
      type: template.type,
      priority: 1
    };
  },
  generatePlayerAcceptedConfirmMail(player, buyerClubName, fee, timing, sellerClubName, currentDate2, offerId) {
    const template = MAIL_TEMPLATES.find((t) => t.id === "incoming_offer_player_accepted_confirm");
    const body = template.body.replace("{PLAYER}", `${player.firstName} ${player.lastName}`).replace("{BUYER_CLUB}", buyerClubName).replace("{FEE}", fee.toLocaleString("pl-PL")).replace("{TIMING}", timing).replace(/{CLUB}/g, sellerClubName);
    return {
      id: `incoming_plr_acc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject.replace("{PLAYER}", `${player.firstName} ${player.lastName}`),
      body,
      date: currentDate2,
      isRead: false,
      type: template.type,
      priority: 3,
      metadata: { type: "INCOMING_TRANSFER_OFFER", offerId }
    };
  },
  generatePlayerRefusedMail(player, buyerClubName, sellerClubName, currentDate2) {
    const template = MAIL_TEMPLATES.find((t) => t.id === "incoming_offer_player_refused");
    const body = template.body.replace("{PLAYER}", `${player.firstName} ${player.lastName}`).replace("{BUYER_CLUB}", buyerClubName).replace(/{CLUB}/g, sellerClubName);
    return {
      id: `incoming_plr_ref_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject.replace("{PLAYER}", `${player.firstName} ${player.lastName}`).replace("{BUYER_CLUB}", buyerClubName),
      body,
      date: currentDate2,
      isRead: false,
      type: template.type,
      priority: 1
    };
  },
  generateAgentClientsOfferMail(candidates, clubName, currentDate2, seasonNumber) {
    const candidateLines = candidates.map((player, index) => {
      const nationality = player.nationalityCountry || player.nationality || "nieznany rynek";
      return `${index + 1}. ${player.firstName} ${player.lastName} - ${player.age} lat, ${player.position}, ${player.overallRating} OVR, ${nationality}`;
    });
    return {
      id: `AGENT_CLIENTS_${seasonNumber}_${currentDate2.toISOString().split("T")[0]}_${candidates.map((player) => player.id).join("_")}`,
      sender: "Niezale\u017Cny agent pi\u0142karski",
      role: "Agent zawodnik\xF3w",
      subject: `Propozycja agenta: ${candidates.length} ${candidates.length === 1 ? "wolny zawodnik" : "wolnych zawodnik\xF3w"}`,
      body: [
        "Trenerze,",
        "",
        `Reprezentuj\u0119 kilku wolnych zawodnik\xF3w, kt\xF3rzy nie pojawiaj\u0105 si\u0119 w standardowej bazie rynku pracy ${clubName}. To gracze z dalszych rynk\xF3w, wi\u0119c normalnie wymagaj\u0105 kontakt\xF3w skautingowych albo r\u0119cznego szukania poza Europ\u0105.`,
        "",
        "Moim zdaniem mog\u0105 pasowa\u0107 poziomem do obecnej kadry:",
        "",
        ...candidateLines,
        "",
        "Je\u017Celi kt\xF3ry\u015B profil Pana interesuje, warto szybko sprawdzi\u0107 kart\u0119 zawodnika i rozpocz\u0105\u0107 rozmowy kontraktowe. Nie gwarantuj\u0119, \u017Ce b\u0119d\u0119 m\xF3g\u0142 utrzyma\u0107 ich dost\u0119pno\u015B\u0107 d\u0142ugo.",
        "",
        "Z powa\u017Caniem,",
        "Niezale\u017Cny agent"
      ].join("\n"),
      date: new Date(currentDate2),
      isRead: false,
      type: "STAFF" /* STAFF */,
      priority: 4,
      metadata: {
        type: "AGENT_CLIENTS_OFFER",
        seasonNumber,
        playerIds: candidates.map((player) => player.id),
        candidates: candidates.map((player) => ({
          playerId: player.id,
          playerName: `${player.firstName} ${player.lastName}`,
          position: player.position,
          age: player.age,
          overallRating: player.overallRating,
          nationalityLabel: player.nationalityCountry || String(player.nationality || "")
        }))
      }
    };
  },
  generateNTCallUpMail: (player, nationalTeamName, date) => {
    return {
      id: `NT_CALLUP_${player.id}_${date.getFullYear()}_${date.getMonth()}`,
      sender: "Biuro Ligowe",
      role: "Administrator rozgrywek",
      subject: `Powo\u0142anie reprezentacyjne: ${player.firstName} ${player.lastName}`,
      body: `Informujemy, \u017Ce Tw\xF3j zawodnik ${player.firstName} ${player.lastName} (${player.position}, ${player.overallRating} OVR) zosta\u0142 powo\u0142any do reprezentacji narodowej ${nationalTeamName}.

W terminach zgrupowa\u0144 i mecz\xF3w reprezentacyjnych zawodnik b\u0119dzie niedost\u0119pny dla Twojego klubu.`,
      date,
      isRead: false,
      type: "STAFF" /* STAFF */,
      priority: 70
    };
  }
};

// tests/BoardMailRecoveryTests.ts
var makeClub = (id, name) => ({
  id,
  name,
  shortName: name,
  leagueId: "L_PL_1",
  tier: 1,
  reputation: 8,
  budget: 2e7,
  transferBudget: 5e6,
  colorsHex: ["#0f5ca8", "#ffffff"],
  stats: {
    played: 25,
    wins: 5,
    draws: 3,
    losses: 17,
    goalsFor: 22,
    goalsAgainst: 48,
    goalDifference: -26,
    points: 18,
    form: ["P", "P", "W", "W", "W"]
  },
  board: {
    hojnosc: "przecietna",
    ambicja: "wysoka",
    cierpliwosc: "przecietna",
    chciwosc: "przecietna",
    oczekiwania: "wysoka",
    kompetencja: "wysoka"
  }
});
var userClub = makeClub("USER_CLUB", "Wis\u0142a P\u0142ock");
var opponents = Array.from({ length: 11 }, (_, index) => makeClub(`OPPONENT_${index + 1}`, `Rywal ${index + 1}`));
var allClubs = [userClub, ...opponents];
var signedAt = /* @__PURE__ */ new Date("2026-12-01T12:00:00.000Z");
var currentDate = /* @__PURE__ */ new Date("2027-03-01T12:00:00.000Z");
var managerContract = {
  id: "RECOVERY_CONTRACT",
  clubId: userClub.id,
  signedAt: signedAt.toISOString(),
  source: "JOB_MARKET",
  status: "ACTIVE",
  terms: { startDate: signedAt.toISOString() },
  standardRenewalMonths: 6
};
var makeFinishedFixture = (index, won) => ({
  id: `FIXTURE_${index + 1}`,
  leagueId: userClub.leagueId,
  homeTeamId: userClub.id,
  awayTeamId: opponents[index].id,
  date: new Date(2026, 11, 5 + index * 10),
  status: "FINISHED" /* FINISHED */,
  homeScore: won ? 2 : 0,
  awayScore: won ? 0 : 2
});
var recoveryFixtures = Array.from({ length: 8 }, (_, index) => makeFinishedFixture(index, index >= 5));
var scheduledFixtures = Array.from({ length: 3 }, (_, index) => ({
  ...makeFinishedFixture(index + 8, false),
  id: `SCHEDULED_${index + 1}`,
  date: new Date(2027, 2, 8 + index * 7),
  status: "SCHEDULED" /* SCHEDULED */,
  homeScore: null,
  awayScore: null
}));
var allFixtures = [...recoveryFixtures, ...scheduledFixtures];
var trend = getManagerLeagueFormTrend(managerContract, userClub, allFixtures, currentDate);
import_strict.default.equal(trend.matchesManaged, 8, "trend powinien uwzgl\u0119dnia\u0107 wy\u0142\u0105cznie mecze rozegrane przez aktualnego trenera");
import_strict.default.equal(trend.currentWinStreak, 3, "silnik powinien rozpozna\u0107 trzy kolejne zwyci\u0119stwa po przej\u0119ciu zespo\u0142u");
import_strict.default.equal(trend.isClearRecovery, true, "trzy kolejne zwyci\u0119stwa powinny zosta\u0107 uznane za wyra\u017An\u0105 popraw\u0119");
var originalRandom = Math.random;
try {
  Math.random = () => 0;
  const recoveryMails = MailService.generateDailyMails(
    currentDate,
    userClub,
    {},
    allClubs,
    18,
    40,
    void 0,
    void 0,
    [],
    void 0,
    allFixtures,
    void 0,
    1,
    {},
    [],
    [],
    1,
    [],
    void 0,
    managerContract
  );
  import_strict.default.ok(recoveryMails.some((mail) => mail.subject === "Wyra\u017Any post\u0119p dru\u017Cyny"), "zarz\u0105d powinien pochwali\u0107 odbudow\u0119 mimo nadal niskiego miejsca w tabeli");
  import_strict.default.equal(recoveryMails.some((mail) => mail.subject === "Niezadowolenie z miejsca w tabeli"), false, "dobra seria nie mo\u017Ce jednocze\u015Bnie wywo\u0142ywa\u0107 krytyki pozycji w tabeli");
  import_strict.default.equal(recoveryMails.some((mail) => mail.subject === "PILNE: Wymagane dzia\u0142ania"), false, "dobra seria musi wstrzyma\u0107 cotygodniowy krytyczny nacisk zarz\u0105du");
  const poorFixtures = Array.from({ length: 8 }, (_, index) => makeFinishedFixture(index, false));
  const poorMails = MailService.generateDailyMails(
    currentDate,
    { ...userClub, stats: { ...userClub.stats, form: ["P", "P", "P", "P", "P"] } },
    {},
    allClubs,
    18,
    25,
    void 0,
    void 0,
    [],
    void 0,
    [...poorFixtures, ...scheduledFixtures],
    void 0,
    1,
    {},
    [],
    [],
    1,
    [],
    void 0,
    managerContract
  );
  import_strict.default.ok(
    poorMails.some((mail) => mail.subject === "Niezadowolenie z miejsca w tabeli" || mail.subject === "PILNE: Wymagane dzia\u0142ania"),
    "bez poprawy wynik\xF3w ostrzegawcza komunikacja zarz\u0105du powinna nadal dzia\u0142a\u0107"
  );
} finally {
  Math.random = originalRandom;
}
console.log("BoardMailRecoveryTests: OK");
