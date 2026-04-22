export type DebriefContext =
  | 'BIG_WIN'
  | 'WIN_STRONG'
  | 'WIN_WEAK'
  | 'WIN_NORMAL'
  | 'PENALTY_WIN'
  | 'PENALTY_LOSS'
  | 'DRAW_LAST_MIN_AGAINST'
  | 'DRAW_LAST_MIN_FOR'
  | 'DRAW_STRONG'
  | 'DRAW'
  | 'BIG_LOSS'
  | 'LOSS_STRONG'
  | 'LOSS_WEAK'
  | 'LAST_MIN_LOSS'
  | 'NARROW_LOSS'
  | 'RED_CARD_LOSS';

export type DebriefCommentType = 'PRAISE' | 'AGGRESSIVE' | 'CALM' | 'CRITICIZE' | 'SILENCE';

export interface DebriefComment {
  id: string;
  text: string;
  hiddenType: DebriefCommentType;
}

export const POST_MATCH_DEBRIEF: Record<DebriefContext, DebriefComment[]> = {

  BIG_WIN: [
    { id: 'bw_1', text: 'Brawo! Takiej gry właśnie od was oczekuję.', hiddenType: 'PRAISE' },
    { id: 'bw_2', text: 'Świetna robota. Każdy dał z siebie sto procent. Jestem z was dumny.', hiddenType: 'PRAISE' },
    { id: 'bw_3', text: 'Trzy punkty w kieszeni. Cieszmy się przez chwilę i wracamy do pracy.', hiddenType: 'CALM' },
    { id: 'bw_4', text: 'Dobry wynik. Teraz skupiamy się na kolejnym meczu.', hiddenType: 'CALM' },
    { id: 'bw_5', text: 'Doskonale! Ale nie wolno wam odpuścić! Każdy mecz to walka!', hiddenType: 'AGGRESSIVE' },
    { id: 'bw_6', text: 'Tak ma wyglądać wasza gra! Oczekuję tego samego za tydzień!', hiddenType: 'AGGRESSIVE' },
    { id: 'bw_7', text: 'Dobry wynik, ale gra mogła być lepsza. Kilka rzeczy musimy poprawić.', hiddenType: 'CRITICIZE' },
    { id: 'bw_8', text: 'Wygraliśmy wyraźnie, ale pamiętam te bezmyślne straty w środku pola.', hiddenType: 'CRITICIZE' },
    { id: 'bw_9', text: 'Dobry mecz. Gratuluje!', hiddenType: 'SILENCE' },
    { id: 'bw_10', text: 'Wynik mówi same za siebie.', hiddenType: 'SILENCE' },
  ],

  WIN_STRONG: [
    { id: 'ws_1', text: 'Niesamowite! Mecz top! Jestem z was dumny!', hiddenType: 'PRAISE' },
    { id: 'ws_2', text: 'Pokonaliśmy faworyta. Zapamiętajcie ten dzień. Zasłużyliście na każdy oklaski.', hiddenType: 'PRAISE' },
    { id: 'ws_3', text: 'Teraz widzę, co potrafimy! Chcę tej samej determinacji w każdym meczu!', hiddenType: 'AGGRESSIVE' },
    { id: 'ws_4', text: 'To nie był przypadek. Walczyliście jak lwy. Tego właśnie od was wymagam!', hiddenType: 'AGGRESSIVE' },
    { id: 'ws_5', text: 'Wykonaliśmy plan. Teraz nie ma miejsca na euforię, następny mecz czeka.', hiddenType: 'CALM' },
    { id: 'ws_6', text: 'Wygraliśmy z faworytem. To dobry znak, ale każdy mecz to nowa historia.', hiddenType: 'CALM' },
    { id: 'ws_7', text: 'Wygraliśmy, ale ta gra w drugiej połowie była do niczego. Musimy porozmawiać.', hiddenType: 'CRITICIZE' },
    { id: 'ws_8', text: 'Dobry wynik. Ale nie chcę słyszeć, że to był przypadek, bo tak nie było.', hiddenType: 'CRITICIZE' },
    { id: 'ws_9', text: 'Dobra robota.', hiddenType: 'SILENCE' },
    { id: 'ws_10', text: 'Wygraliśmy i to je dziś najważniejsze!', hiddenType: 'SILENCE' },
  ],

  WIN_WEAK: [
    { id: 'ww_1', text: 'Dobra robota. Skupiliśmy się i wygraliśmy, tego właśnie od Was oczekiwałem.', hiddenType: 'PRAISE' },
    { id: 'ww_2', text: 'Trzy punkty. Nie było spektakularnie, ale byliście skuteczni.', hiddenType: 'PRAISE' },
    { id: 'ww_3', text: 'Trzy punkty mamy w kieszeni.', hiddenType: 'CALM' },
    { id: 'ww_4', text: 'Dobra robota. Skupiamy się na kolejnym meczu.', hiddenType: 'CALM' },
    { id: 'ww_5', text: 'Wygraliśmy, ale nie był to mecz w wielkim stylu! Musicie się postarać następnym razem!', hiddenType: 'AGGRESSIVE' },
    { id: 'ww_6', text: 'Wygraiśmy ale graliśmy fatalnie. To się musi zmienić!', hiddenType: 'AGGRESSIVE' },
    { id: 'ww_7', text: 'Z takim rywalem powinniśmy grać dużo lepiej. Za mało pressing, za mało tempa.', hiddenType: 'CRITICIZE' },
    { id: 'ww_8', text: 'Wygraliśmy, ale te zmarnowane okazje w pierwszej połowie będą mi się snić po nocach.', hiddenType: 'CRITICIZE' },
    { id: 'ww_9', text: 'Wygraliśmy. Nie ma o czym gadać.', hiddenType: 'SILENCE' },
    { id: 'ww_10', text: 'Wygraliśmy i to je dziś najważniejsze!', hiddenType: 'SILENCE' },
  ],

  WIN_NORMAL: [
    { id: 'wn_1', text: 'Dobry mecz. Byliście zorganizowani i skuteczni. Brawo.', hiddenType: 'PRAISE' },
    { id: 'wn_2', text: 'Zdobyliśmy trzy punkty tylko dzięki waszej ciężkiej pracy. Doceniam wasze zaangażowanie.', hiddenType: 'PRAISE' },
    { id: 'wn_3', text: 'Tak właśnie mamy grać w każdym meczu.', hiddenType: 'CALM' },
    { id: 'wn_4', text: 'Wygraliśmy. Teraz odpoczywamy i od jutra skupiamy się na kolejnym rywalu.', hiddenType: 'CALM' },
    { id: 'wn_5', text: 'Dobry wynik, ale chcę więcej! Następny mecz zagramy na wyższych obrotach!', hiddenType: 'AGGRESSIVE' },
    { id: 'wn_6', text: 'Wygraliśmy ale ta gra w obronie pod koniec meczu była zbyt nerwowa.', hiddenType: 'AGGRESSIVE' },
    { id: 'wn_7', text: 'Wygraliśmy, ale w drugiej połowie kilka razy straciliśmy kontrolę. ', hiddenType: 'CRITICIZE' },
    { id: 'wn_8', text: 'Trzy punkty są, ale musimy poprawć grę w środku pola.', hiddenType: 'CRITICIZE' },
    { id: 'wn_9', text: 'Wygrana. Każdy wie, co zrobił dobrze, a co źle.', hiddenType: 'SILENCE' },
    { id: 'wn_10', text: 'Wygraliśmy i to je dziś najważniejsze!', hiddenType: 'SILENCE' },
  ],

  PENALTY_WIN: [
    { id: 'pw_1', text: 'Wytrzymaliście presję do samego końca. Szacunek Panowie!', hiddenType: 'PRAISE' },
    { id: 'pw_2', text: 'To był test nerwów i zdaliście go znakomicie. Jestem z was dumny.', hiddenType: 'PRAISE' },
    { id: 'pw_3', text: 'Rozstrzygnęliśmy to po karnych. Odpoczywamy chwilę i skupiamy się na kolejnym rywalu.', hiddenType: 'CALM' },
    { id: 'pw_4', text: 'Awans jest nasz. Sama seria karnych była spokojna, ale mamy kilka rzeczy do poprawy.', hiddenType: 'CALM' },
    { id: 'pw_5', text: 'Taka mentalność wygrywa mecze pucharowe! Chcę tej odwagi od pierwszej minuty!', hiddenType: 'AGGRESSIVE' },
    { id: 'pw_6', text: 'Nie pękliście pod presją. To ma być nasz standard w wielkich momentach!', hiddenType: 'AGGRESSIVE' },
    { id: 'pw_7', text: 'Wygraliśmy w karnych, ale nie powinniśmy dopuszczać do tak nerwowej końcówki.', hiddenType: 'CRITICIZE' },
    { id: 'pw_8', text: 'Karne nas uratowały. W regulaminowym czasie musimy być bardziej skuteczni.', hiddenType: 'CRITICIZE' },
    { id: 'pw_9', text: 'Wytrzymaliście presje i chwała Wam za to!', hiddenType: 'SILENCE' },
    { id: 'pw_10', text: 'Wygraliśmy i to je dziś najważniejsze!', hiddenType: 'SILENCE' },
  ],

  PENALTY_LOSS: [
    { id: 'pl_1', text: 'Taka przegrana boli, ale trzeba udźwignąć i iść dalej.', hiddenType: 'CALM' },
    { id: 'pl_2', text: 'Szkoda tej porażki ale przenalizujemy to spokojnie i wyciągamy wnioski na przyszłość.', hiddenType: 'CALM' },
    { id: 'pl_3', text: 'Byliśmy bardzo blisko, ale zabrakło nam trochę zimnej krwi.', hiddenType: 'CRITICIZE' },
    { id: 'pl_4', text: 'Nie możemy liczyć na szczęście w karnych. Ten mecz trzeba było zamknąć wcześniej.', hiddenType: 'CRITICIZE' },
    { id: 'pl_5', text: 'Takie porażki bolą najbardziej ale presja nie może nas paraliżować!', hiddenType: 'AGGRESSIVE' },
    { id: 'pl_6', text: 'Mieliśmy szansę i jej nie wykorzystaliśmy. Szkoda!', hiddenType: 'AGGRESSIVE' },
    { id: 'pl_7', text: 'Walczyliście do końca i Wasze zaangażowanie zostało docenione.', hiddenType: 'PRAISE' },
    { id: 'pl_8', text: 'Nie odpuszczaliście i pokazaliście dziś charakter. Głowy do góry, następnym razem wygramy!', hiddenType: 'PRAISE' },
    { id: 'pl_9', text: 'Nie mam teraz nic do dodania. Każdy wie, jak to się skończyło.', hiddenType: 'SILENCE' },
    { id: 'pl_10', text: 'Bez komentarza.', hiddenType: 'SILENCE' },
  ],

  DRAW_LAST_MIN_AGAINST: [
    { id: 'dlma_1', text: 'Prowadziliśmy i to zmarnowaliśmy. To jest niedopuszczalne.', hiddenType: 'CRITICIZE' },
    { id: 'dlma_2', text: 'Jak można stracić punkt w ostatniej minucie? To brak koncentracji i za to płacimy.', hiddenType: 'CRITICIZE' },
    { id: 'dlma_3', text: 'Tego nie akceptuję! Prowadziliśmy i pozwoliliśmy im wyrównać! Wstyd!', hiddenType: 'AGGRESSIVE' },
    { id: 'dlma_4', text: 'To po prostu katastrofa! W ostatniej minucie?! Czy wy spicie na boisku?!', hiddenType: 'AGGRESSIVE' },
    { id: 'dlma_5', text: 'Jeden punkt zamiast trzech. Boli, ale taka jest piłka. Musimy grać do końca.', hiddenType: 'CALM' },
    { id: 'dlma_6', text: 'Remis po takim meczu smakuje jak porażka. Ale wyciągamy wnioski na przyszłość.', hiddenType: 'CALM' },
    { id: 'dlma_7', text: 'Walczyliście przez cały mecz. Ta ostatnia bramka boli, ale wasza gra zasługuje na pochwałe.', hiddenType: 'PRAISE' },
    { id: 'dlma_8', text: 'Straciliśmy punkt, ale gra była solidna. Głowy do góry!', hiddenType: 'PRAISE' },
    { id: 'dlma_9', text: 'Każdy wie, co się stało. Nie mam nic do dodania.', hiddenType: 'SILENCE' },
    { id: 'dlma_10', text: 'Bez komentarza.', hiddenType: 'SILENCE' },
  ],

  DRAW_LAST_MIN_FOR: [
    { id: 'dlmf_1', text: 'Niesamowity charakter! Walczyliście do ostatniego gwizdka i wyrwaliście ten punkt!', hiddenType: 'PRAISE' },
    { id: 'dlmf_2', text: 'Nigdy nie odpuściliście. Ten punkt w ostatniej chwili to owoc waszego charakteru!', hiddenType: 'PRAISE' },
    { id: 'dlmf_3', text: 'To właśnie oczekuję! Walka do końca!', hiddenType: 'AGGRESSIVE' },
    { id: 'dlmf_4', text: 'Pokazaliście serce i charakter. Brawo!', hiddenType: 'AGGRESSIVE' },
    { id: 'dlmf_5', text: 'Wyrwaliśmy remis. To niby jeden punkt, ale zdobyty z sercem. Świetna robota Panowie!.', hiddenType: 'CALM' },
    { id: 'dlmf_6', text: 'Ten punkt cieszy. Nie poddaliśmy się i to jest najważniejsze.', hiddenType: 'CALM' },
    { id: 'dlmf_7', text: 'Wyrwaliśmy remis, ale przez większość spotkania graliśmy bardzo słabo.', hiddenType: 'CRITICIZE' },
    { id: 'dlmf_8', text: 'Zastanawiam się dlaczego tak późno zaczęliśmy grać?', hiddenType: 'CRITICIZE' },
    { id: 'dlmf_9', text: 'Walczyliście i to jest najważniejsze.', hiddenType: 'SILENCE' },
    { id: 'dlmf_10', text: 'Bez komentarza.', hiddenType: 'SILENCE' },
  ],

  DRAW_STRONG: [
    { id: 'ds_1', text: 'Fantastyczny punkt! Z takim rywalem zremisować to wielki sukces. Jestem z was dumny!', hiddenType: 'PRAISE' },
    { id: 'ds_2', text: 'Udowodniliście, że możemy grać z każdym. Świetna defensywa, świetna postawa!', hiddenType: 'PRAISE' },
    { id: 'ds_3', text: 'Dobry wynik, ale ja chcę więcej! Mogliśmy wygrać z każdym i Wy to wiecie najlepiej!', hiddenType: 'AGGRESSIVE' },
    { id: 'ds_4', text: 'Punkt z tym rywalem to szacunek. Ale następnym razem idzemy po zwycięstwo!', hiddenType: 'AGGRESSIVE' },
    { id: 'ds_5', text: 'Remis z faworytem. Wykonaliśmy plan. Teraz skupiamy się na kolejnym meczu.', hiddenType: 'CALM' },
    { id: 'ds_6', text: 'Jeden punkt z trudnego meczu. Przyjmujemy go i idziemy dalej.', hiddenType: 'CALM' },
    { id: 'ds_7', text: 'Mogliśmy wygrać ale chyba za bardzo się cofnęliśmy.', hiddenType: 'CRITICIZE' },
    { id: 'ds_8', text: 'Remis to dobry wynik, ale stracone bramki dają do myślenia.', hiddenType: 'CRITICIZE' },
    { id: 'ds_9', text: 'Dobra robota.', hiddenType: 'SILENCE' },
    { id: 'ds_10', text: 'Dla nas to dobry wynik.', hiddenType: 'SILENCE' },
  ],

  DRAW: [
    { id: 'd_1', text: 'Jeden punkt. To nie jest ideał. Pracujemy dalej.', hiddenType: 'CALM' },
    { id: 'd_2', text: 'Remis. Nie zrobiliśmy tego, co trzeba, żeby wygrać. Teraz skupiamy się na następnym meczu.', hiddenType: 'CALM' },
    { id: 'd_3', text: 'Remis, który smakuje jak porażka. Mieliśmy okazje i nie wykorzystaliśmy ich.', hiddenType: 'CRITICIZE' },
    { id: 'd_4', text: 'Jeden punkt zamiast trzech. Musimy być bardziej skuteczni pod bramką.', hiddenType: 'CRITICIZE' },
    { id: 'd_5', text: 'Walczyliście przez całe dziewięćdziesiąt minut. Doceniam waszą pracę.', hiddenType: 'PRAISE' },
    { id: 'd_6', text: 'To był dobry mecz, choć wynik nie odzwierciela przebiegu spotkania.', hiddenType: 'PRAISE' },
    { id: 'd_7', text: 'Remis to za mało! Chcę wygranej, nie podziału punktów!', hiddenType: 'AGGRESSIVE' },
    { id: 'd_8', text: 'Mogliśmy wygrać i to zmarnowaliśmy! Następnym razem bierzemy trzy punkty! Zrozumieliście?', hiddenType: 'AGGRESSIVE' },
    { id: 'd_9', text: 'Każdy z was wie, co mógł zrobić lepiej.', hiddenType: 'SILENCE' },
    { id: 'd_10', text: 'Bez komentarza.', hiddenType: 'SILENCE' },
  ],

  BIG_LOSS: [
    { id: 'bl_1', text: 'To było poniżej wszelkiego poziomu!!!.', hiddenType: 'CRITICIZE' },
    { id: 'bl_2', text: 'Ta przegrana boli i powinna boleć. Każdy z was musi spojrzeć w lustro.', hiddenType: 'CRITICIZE' },
    { id: 'bl_3', text: 'Co to było?! To jest skandal! Takich wyników w tym zespole nie akceptuję!', hiddenType: 'AGGRESSIVE' },
    { id: 'bl_4', text: 'Tak wygląda brak zaangażowania! Takie rzeczy tutaj mieć miejsca nie mogą!', hiddenType: 'AGGRESSIVE' },
    { id: 'bl_5', text: 'Analizujemy, wyciągamy wnioski i wracamy silniejsi.', hiddenType: 'CALM' },
    { id: 'bl_6', text: 'Ta przegrana boli, ale nie możemy się załamywać. Teraz skupiamy się na następnym meczu.', hiddenType: 'CALM' },
    { id: 'bl_7', text: 'Wiem, że daliście z siebie wszystko. Dzisiaj to nie wystarczyło. Głowy do góry.', hiddenType: 'PRAISE' },
    { id: 'bl_8', text: 'Nie zawsze można wygrać, ale wasza wola walki została doceniona.', hiddenType: 'PRAISE' },
    { id: 'bl_9', text: 'Każdy wie, co się stało. Nie ma sensu tego teraz analizować.', hiddenType: 'SILENCE' },
    { id: 'bl_10', text: 'Brak słów. Przemyślcie to.', hiddenType: 'SILENCE' },
  ],

  LOSS_STRONG: [
    { id: 'ls_1', text: 'Przegraliśmy z lepszym dziś rywalem. Nie ma wstydu!', hiddenType: 'CALM' },
    { id: 'ls_2', text: 'To był dla nas bardzo trudny mecz Nie wszystko wyszło, ale nasza postawa była przyzwoita.', hiddenType: 'CALM' },
    { id: 'ls_3', text: 'Walczyliście. To się liczy. Głowy do góry.', hiddenType: 'PRAISE' },
    { id: 'ls_4', text: 'Przegrana boli, ale widząc waszą determinację, wiem, że jesteśmy na dobrej drodze.', hiddenType: 'PRAISE' },
    { id: 'ls_5', text: 'Przegraliśmy z faworytem, ale niektóre decyzje taktyczne były zbyt bierne.', hiddenType: 'CRITICIZE' },
    { id: 'ls_6', text: 'Wynik nie ma znaczeniaale kilka błędów w obronie już tak.', hiddenType: 'CRITICIZE' },
    { id: 'ls_7', text: 'W piłce nie ma łatwych meczów! Walczymy dalej.', hiddenType: 'AGGRESSIVE' },
    { id: 'ls_8', text: 'Wynik to jedno, ale ta bezradność w drugiej połowie to element do poprawy!', hiddenType: 'AGGRESSIVE' },
    { id: 'ls_9', text: 'Przegraliśmy z lepszym. Nic nie mówię.', hiddenType: 'SILENCE' },
    { id: 'ls_10', text: 'Bez komentarza.', hiddenType: 'SILENCE' },
  ],

  LOSS_WEAK: [
    { id: 'lw_1', text: 'To jest niedopuszczalne. Przegrać z takim rywalem ?!! Wstyd!', hiddenType: 'CRITICIZE' },
    { id: 'lw_2', text: 'Wstyd. Kompletny wstyd. Co my tam robiliśmy przez dziewięćdziesiąt minut?', hiddenType: 'CRITICIZE' },
    { id: 'lw_3', text: 'To katastrofa! Z takim rywalem?! Oczekuję natychmiastowej poprawy w następnym meczu!', hiddenType: 'AGGRESSIVE' },
    { id: 'lw_4', text: 'Nie akceptuję takiego wyniku! Przegrywamy z takim rywalem? Wszyscy się z nas śmieją!', hiddenType: 'AGGRESSIVE' },
    { id: 'lw_5', text: 'Musimy przeanalizować, co poszło nie tak i poprawiamy to od następnego treningu.', hiddenType: 'CALM' },
    { id: 'lw_6', text: 'Trudny dzień. Ale nie możemy się rozklejać, wyciągamy wnioski i do przodu.', hiddenType: 'CALM' },
    { id: 'lw_7', text: 'Widziałem, że próbowaliście ale taka jest piłka. Głowy do góry.', hiddenType: 'PRAISE' },
    { id: 'lw_8', text: 'Nie wyszło. Ale wiem, że ten zespół potrafi dużo więcej!!!', hiddenType: 'PRAISE' },
    { id: 'lw_9', text: 'Brak słów. ', hiddenType: 'SILENCE' },
    { id: 'lw_10', text: 'Nie mam nic do powiedzenia.', hiddenType: 'SILENCE' },
  ],

  LAST_MIN_LOSS: [
    { id: 'lml_1', text: 'Prowadziliśmy i to zmarnowaliśmy. Popełniliśmy za dużo błędów w końcówce.', hiddenType: 'CRITICIZE' },
    { id: 'lml_2', text: 'Ktoś mi wyjaśn, co się stało w tych ostatnich minutach?!', hiddenType: 'CRITICIZE' },
    { id: 'lml_3', text: 'Mieliśmy ich na widelcu, a to oni nas zjedli. Jak to się stało ?', hiddenType: 'AGGRESSIVE' },
    { id: 'lml_4', text: 'Panowie! Fokus!!! W końcówce brakuje wam koncentracji!', hiddenType: 'AGGRESSIVE' },
    { id: 'lml_5', text: 'Taka jest piłka, musimy to przełkąć i gramy dalej.', hiddenType: 'CALM' },
    { id: 'lml_6', text: 'Straciliśmy trzy punkty w ostatniej chwili. Szkoda.', hiddenType: 'CALM' },
    { id: 'lml_7', text: 'Walczyliście świetnie przez większość meczu i dziękuje Wam za walkę.', hiddenType: 'PRAISE' },
    { id: 'lml_8', text: 'Piłka jest nieprzewidywalna. Dziś szczęście nie sprzyjało. Głowy do góry.', hiddenType: 'PRAISE' },
    { id: 'lml_9', text: 'Każdy wie, najlepiej, co się stało.', hiddenType: 'SILENCE' },
    { id: 'lml_10', text: 'Nie mam nic do powiedzenia.', hiddenType: 'SILENCE' },
  ],

  NARROW_LOSS: [
    { id: 'nl_1', text: 'Jeden gol różnicy. Byliśmy blisko. Wrócimy silniejsi.', hiddenType: 'CALM' },
    { id: 'nl_2', text: 'Przegrana o bramkę boli, ale taki jest sport. Skupiamy się na następnym meczu.', hiddenType: 'CALM' },
    { id: 'nl_3', text: 'Jeden gol, a ile zmarnowanych szans. Taka jest cena za nieskuteczność.', hiddenType: 'CRITICIZE' },
    { id: 'nl_4', text: 'Przegraliśmy o bramkę. Trochę bierze złość kiedy myślę o tych okazjach, które zmarnowaliśmy, .', hiddenType: 'CRITICIZE' },
    { id: 'nl_5', text: 'Walczyliście do końca. Dziękuję!.', hiddenType: 'PRAISE' },
    { id: 'nl_6', text: 'Nie udało się ale wasza postawa była dobra. Dziękuję za walkę!.', hiddenType: 'PRAISE' },
    { id: 'nl_7', text: 'Jeden gol i trzy punkty nam uciekły! Musimy być bardziej bezwzględni pod bramką!', hiddenType: 'AGGRESSIVE' },
    { id: 'nl_8', text: 'To jest nie do przyjęcia! Jeden głupia bramka i przegrywamy?! ', hiddenType: 'AGGRESSIVE' },
    { id: 'nl_9', text: 'Każdy wie, najlepiej, co się stało.', hiddenType: 'SILENCE' },
    { id: 'nl_10', text: 'Nie mam nic do powiedzenia.', hiddenType: 'SILENCE' },
  ],

  RED_CARD_LOSS: [
    { id: 'rcl_1', text: 'Czerwona kartka zrujnowała nasz plan. I powiem wprost, to było głupie zachowanie.', hiddenType: 'CRITICIZE' },
    { id: 'rcl_2', text: 'Uczulałem Was na braku dyscypliny na boisku.', hiddenType: 'CRITICIZE' },
    { id: 'rcl_3', text: 'Nieprzemyślane zachowanie kosztuje nas dziś punkty!', hiddenType: 'AGGRESSIVE' },
    { id: 'rcl_4', text: 'Wygrać w 10-tkę jest zawsze bardzo trudno!', hiddenType: 'AGGRESSIVE' },
    { id: 'rcl_5', text: 'Graliśmy w dziesiątkę. Wyciągamy wnioski i dbamy o dyscyplinę.', hiddenType: 'CALM' },
    { id: 'rcl_6', text: 'Czerwona kartka zmieniła mecz. Nie pozwólmy żeby się powtórzyło.', hiddenType: 'CALM' },
    { id: 'rcl_7', text: 'Walczyliście w dziesiątkę przez długi czas. To wymagało ogromnego wysiłku. Szacunek!', hiddenType: 'PRAISE' },
    { id: 'rcl_8', text: 'Dzięki za walkę.', hiddenType: 'PRAISE' },
    { id: 'rcl_9', text: 'Wiadomo, co się stało. Nic dodać nic ująć.', hiddenType: 'SILENCE' },
    { id: 'rcl_10', text: 'Nie mam nic do powiedzenia..', hiddenType: 'SILENCE' },
  ],
};
