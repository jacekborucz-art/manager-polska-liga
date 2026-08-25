import { PolishVoivodeship } from '../../../types';

/**
 * Membership of the sixteen Polish voivodeship IV leagues for 2026/2027.
 *
 * These names are intentionally kept in a small, data-only file. IV liga is a
 * background competition, so creating full Player and Coach graphs for roughly
 * 270 clubs would waste memory. A club receives a generated senior squad only
 * after it wins promotion to one of the four III-liga groups.
 */
export const POLISH_FOURTH_LEAGUE_2026: Record<PolishVoivodeship, readonly string[]> = {
  'dolnośląskie': [
    'Cement Raciborowice', 'Piast Żmigród', 'Moto-Jelcz Oława', 'AKS Strzegom',
    'Iskra Księginice', 'Polonia Bielany Wrocławskie', 'WKS Wierzbice',
    'GKS Mirków/Długołęka', 'Górnik Złotoryja', 'Chrobry II Głogów',
    'Lechia Dzierżoniów', 'Piast Nowa Ruda', 'Błyskawica Gać',
    'Orzeł Ząbkowice Śląskie', 'Polonia Środa Śląska', 'Odra Ścinawa',
    'Polonia-Stal Świdnica', 'Prochowiczanka Prochowice',
  ],
  'kujawsko-pomorskie': [
    'Pogoń Mogilno', 'Tłuchowia Tłuchowo', 'Unia Solec Kujawski', 'Pomorzanin Toruń',
    'Unia Wąbrzeźno', 'Mustang Ostaszewo', 'Victoria Czernikowo', 'Kujawiak Kowal',
    'Wisła Dobrzyń nad Wisłą', 'Lech Rypin', 'Sparta Brodnica', 'Skrwa Skrwilno',
    'Rawys Raciąż', 'Start Pruszcz', 'Orlęta Aleksandrów Kujawski', 'Noteć Gębice',
    'Cuiavia Inowrocław', 'Łokietek Brześć Kujawski',
  ],
  'lubelskie': [
    'Lublinianka Lublin', 'Avia II Świdnik', 'Łada Biłgoraj', 'Orlęta Radzyń Podlaski',
    'Victoria Łukowa', 'Tur Milejów', 'Granit Bychawa', 'Tomasovia Tomaszów Lubelski',
    'Powiślak Końskowola', 'Bug Hanna', 'MKS Ryki', 'Lewart Lubartów',
    'Orlęta Łuków', 'Janowianka Janów Lubelski', 'Świdniczanka Świdnik',
    'Górnik II Łęczna',
  ],
  'lubuskie': [
    'Victoria Szczaniec', 'Korona Kożuchów', 'Czarni Żagań', 'Polonia Słubice',
    'Ilanka Rzepin', 'Odra Nietków', 'Piast Karnin', 'Celuloza Kostrzyn',
    'Róża Różanki', 'Pogoń Skwierzyna', 'Pogoń Świebodzin', 'Piast Iłowa',
    'Łucznik Strzelce Krajeńskie', 'Promień Żary', 'Sprotavia Szprotawa',
    'Lechia II Zielona Góra', 'Dozamet Nowa Sól', 'Stal Sulęcin',
  ],
  'łódzkie': [
    'RKS Radomsko', 'Zjednoczeni Stryków', 'Polonia Piotrków Trybunalski',
    'Boruta Zgierz', 'Orkan Buczek', 'AKS SMS Łódź', 'Ceramika Opoczno',
    'Stal Głowno', 'Włókniarz Pabianice', 'GKS Bełchatów',
    'Sokół Aleksandrów Łódzki', 'Zryw Wygoda', 'KS Kutno', 'Orzeł Parzęczew',
    'ŁKS III Łódź', 'Concordia Piotrków Trybunalski', 'Ekolog Wojsławice',
    'LZS Justynów',
  ],
  'małopolskie': [
    'Cracovia II', 'Unia Tarnów', 'Bocheński KS', 'Victoria Jaworzno',
    'Wolania Wola Rzędzińska', 'Poprad Muszyna', 'Glinik Gorlice',
    'Beskid Andrychów', 'Kalwarianka Kalwaria Zebrzydowska',
    'Termalica II Nieciecza', 'Pcimianka Pcim', 'Błękitni Modlnica',
    'Lubań Maniowy', 'Dalin Myślenice', 'Orzeł Ryczów', 'Hutnik II Kraków',
    'Limanovia Limanowa', 'Watra Białka Tatrzańska',
  ],
  'mazowieckie': [
    'Hutnik Warszawa', 'Legionovia Legionowo', 'Podlasie Sokołów Podlaski',
    'Polonia II Warszawa', 'Broń Radom', 'Makowianka Maków Mazowiecki',
    'Mazur Karczew', 'Ursus Warszawa', 'Mszczonowianka Mszczonów',
    'MKS Piaseczno', 'Energia Kozienice', 'Talent Warszawa', 'Błonianka Błonie',
    'KS Łomianki', 'Victoria Sulejówek', 'Oskar Przysucha',
    'Nadnarwianka Pułtusk', 'MKS Przasnysz',
  ],
  'opolskie': [
    'Odra II Opole', 'Ruch Zdzieszowice', 'LZS Domaszkowice', 'LZS Starościn',
    'LZS Starowice Dolne', 'Start Namysłów', 'Victoria Żyrowa', 'Śląsk Łubniany',
    'Małapanew Ozimek', 'LKS Kadłub', 'MKS Gogolin', 'Stal Zawadzkie',
    'Fortuna Głogówek', 'Porawie Większyce',
  ],
  'podkarpackie': [
    'Igloopol Dębica', 'KS Wiązownica', 'Ekoball Sanok', 'Izolator Boguchwała',
    'Błękitni Ropczyce', 'Sokół Nisko', 'Polonia Przemyśl', 'Stal II Rzeszów',
    'Legion Pilzno', 'Czarni Jasło', 'Sokół Sieniawa',
    'Pogoń-Sokół II Lubaczów', 'Górnik Strachocina', 'Wisłok Wiśniowa',
    'Radomyślanka Radomyśl', 'Pogoń Leżajsk', 'Strug Tyczyn', 'Stal Łańcut',
  ],
  'podlaskie': [
    'Warmia Grajewo', 'KS Wasilków', 'Promień Mońki', 'Wissa Szczuczyn',
    'ŁKS II Łomża', 'KS Michałowo', 'Hetman Tykocin', 'Pionier Brańsk',
    'Tur Bielsk Podlaski', 'Czarni Czarna Białostocka', 'Supraślanka Supraśl',
    'Krypnianka Krypno', 'KS Śniadowo', 'Ruch Wysokie Mazowieckie',
    'Pomorzanka Sejny', 'LZS Krynki',
  ],
  'pomorskie': [
    'Arka II Gdynia', 'Pogoń Lębork', 'Czarni Pruszcz Gdański',
    'Sokół Bożepole Wielkie', 'Gryf Wejherowo', 'Jaguar Gdańsk',
    'Cartusia Kartuzy', 'KP Starogard Gdański', 'Gryf Słupsk', 'Wierzyca Pelplin',
    'Radunia Stężyca', 'Stoczniowiec Gdańsk', 'Anioły Garczegorze',
    'Powiśle Dzierzgoń', 'Stolem Gniewino', 'Dolina Speranda Niepoględzie',
    'Chojniczanka II Chojnice', 'Sparta Sycewice',
  ],
  'śląskie': [
    'GKS II Katowice', 'MRKS Czechowice-Dziedzice', 'Przemsza Siewierz',
    'Ruch Radzionków', 'Ruch II Chorzów', 'Unia Turza Śląska',
    'Podlesianka Katowice', 'Szombierki Bytom', 'Spójnia Landek',
    'Podbeskidzie II', 'Polonia Łaziska Górne', 'Drama Zbrosławice',
    'Rozwój Katowice', 'Kuźnia Ustroń', 'Piast II Gliwice', 'LKS Bełk',
    'Gwarek Tarnowskie Góry', 'Victoria Częstochowa',
  ],
  'świętokrzyskie': [
    'Victoria Skalbmierz', 'Orlęta Kielce', 'Arka Pawłów',
    'Sparta Kazimierza Wielka', 'Neptun Końskie', 'Korona III Kielce',
    'KKP Korona Kielce', 'Spartakus Daleszyce', 'GKS Rudki',
    'Wicher Miedziana Góra', 'OKS Opatów', 'Klimontowianka Klimontów',
    'Granat Skarżysko-Kamienna', 'GKS Nowiny', 'Hetman Włoszczowa',
    'Alit Ożarów', 'Wierna Małogoszcz', 'Orlicz Suchedniów',
  ],
  'warmińsko-mazurskie': [
    'Stomil Olsztyn', 'Granica Kętrzyn', 'Rominta Gołdap', 'Concordia Elbląg',
    'Znicz Biała Piska', 'Pisa Barczewo', 'Tęcza Biskupiec', 'Mazur Ełk',
    'GKS Wikielec', 'Start Nidzica', 'Sokół Ostróda', 'Mamry Giżycko',
    'Naki Olsztyn', 'DKS Dobre Miasto', 'Zatoka Braniewo', 'Polonia Pasłęk',
  ],
  'wielkopolskie': [
    'Polonia Golina', 'Piast Kobylnica', 'Pogoń Nowe Skalmierzyce',
    'Obra Kościan', 'Polonia Leszno', 'Kania Gostyń', 'LKS Gołuchów',
    'Nielba Wągrowiec', 'Polonia Chodzież', 'Górnik Konin', 'Astra Krotoszyn',
    'Warta Śrem', 'Mieszko Gniezno', 'Avia Kamionki', 'Ostrovia Ostrów Wlkp.',
    'Kłos Budzyń', 'Meblorz Swarzędz', 'Huragan Pobiedziska',
  ],
  'zachodniopomorskie': [
    'Pogoń II Szczecin', 'Kotwica Kołobrzeg', 'Biali Sądów', 'Dąb Dębno',
    'Arkonia Szczecin', 'Świt II Szczecin', 'Astra Ustronie Morskie',
    'Chemik Police', 'Iskierka Szczecin', 'Wybrzeże Rewalskie Rewal',
    'Gwardia Koszalin', 'CRS Barlinek', 'Sparta Gryfice', 'GKS Manowo',
    'Ina Ińsko', 'Orzeł Wałcz',
  ],
};
