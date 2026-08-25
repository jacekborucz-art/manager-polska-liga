// tests/ReserveTeamSquadMovementTests.ts
var import_node_assert = require("node:assert");

// resources/static_db/clubs/pl_clubs.ts
var generateClubId = (name) => {
  const slug = name.replace(/ł/g, "l").replace(/Ł/g, "L").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  return `PL_${slug}`;
};
var RAW_PL_CLUBS = [
  // --- TIER 1 (Ekstraklasa) - 18 Teams ---004d00
  { name: "Legia Warszawa", tier: 1, colors: ["#007a25", "#ffffff", "#a80e0e"], stadium: "Stadion Wojska Polskiego", capacity: 31103, reputation: 10, logoFile: "legia-warsaw-2019-logo.png" },
  { name: "Lech Pozna\u0144", tier: 1, colors: ["#0000FF", "#FFFFFF", "#FFFF00"], stadium: "Enea Stadion", capacity: 41609, reputation: 10, logoFile: "lech-poznan-2022-logo.png" },
  { name: "Jagiellonia Bia\u0142ystok", tier: 1, colors: ["#FFFF00", "#FF0000", "#FFFFFF"], stadium: "Stadion Miejski w Bia\u0142ymstoku", capacity: 22372, reputation: 8, logoFile: "jagiellonia-bialystok-2024-logo.png" },
  { name: "Rak\xF3w Cz\u0119stochowa", tier: 1, colors: ["#0000FF", "#FF0000", "#FFFFFF"], stadium: "Stadion Miejski w Cz\u0119stochowie", capacity: 5500, reputation: 8, logoFile: "rakow-czestochowa-2014-logo.png" },
  { name: "Pogo\u0144 Szczecin", tier: 1, colors: ["#000080", "#800000", "#FFFFFF"], stadium: "Stadion Miejski im. Floriana Krygiera", capacity: 21163, reputation: 7, logoFile: "pogon_szczecin.png" },
  { name: "G\xF3rnik Zabrze", tier: 1, colors: ["#0519ca", "#ffffff", "#FF0000"], stadium: "Stadion im. Ernesta Pohla", capacity: 24563, reputation: 8, logoFile: "Gornik_zabrze.png" },
  { name: "Cracovia", tier: 1, colors: ["#ff0000", "#ffffff", "#000000"], stadium: "Stadion im. J\xF3zefa Pi\u0142sudskiego", capacity: 15016, reputation: 8, logoFile: "cracovia-2024-logo.png" },
  { name: "Zag\u0142\u0119bie Lubin", tier: 1, colors: ["#FF5F1F", "#FFFFFF", "#008000"], stadium: "Dialog Arena", capacity: 16068, reputation: 7, logoFile: "zaglebie-lubin-2022-logo.png" },
  { name: "Widzew \u0141\xF3d\u017A", tier: 1, colors: ["#FF0000", "#FFFFFF", "#FF0000"], stadium: "Stadion Widzewa", capacity: 18018, reputation: 10, logoFile: "widzew-lodz.png" },
  { name: "Lechia Gda\u0144sk", tier: 1, colors: ["#008000", "#FFFFFF", "#008000"], stadium: "Polsat Plus Arena Gda\u0144sk", capacity: 41620, reputation: 7, logoFile: "lechia_gdansk.png" },
  { name: "Piast Gliwice", tier: 1, colors: ["#0000FF", "#FF0000", "#FFFFFF"], stadium: "Stadion Miejski w Gliwicach", capacity: 9913, reputation: 6, logoFile: "piast-gliwice-1997-logo.png" },
  { name: "Arka Gdynia", tier: 1, colors: ["#FFFF00", "#0000FF", "#FFFFFF"], stadium: "Stadion Miejski w Gdyni", capacity: 15139, reputation: 6, logoFile: "arka-gdynia-2009-logo.png" },
  { name: "Korona Kielce", tier: 1, colors: ["#FFFF00", "#FF0000", "#FFFFFF"], stadium: "Suzuki Arena", capacity: 15500, reputation: 7, logoFile: "korona-kielce-2024-logo.png" },
  { name: "Radomiak Radom", tier: 1, colors: ["#008000", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski w Radomiu", capacity: 15e3, reputation: 6, logoFile: "RKS_Radomiak_Radom.png" },
  { name: "Motor Lublin", tier: 1, colors: ["#FFFF00", "#FFFFFF", "#0000FF"], stadium: "Arena Lublin", capacity: 15500, reputation: 6, logoFile: "motor-lublin-2023-logo.png" },
  { name: "GKS Katowice", tier: 1, colors: ["#FFFF00", "#0a6102", "#000000"], stadium: "Stadion GKS Katowice", capacity: 6710, reputation: 6, logoFile: "gks-katowice-logo.png" },
  { name: "Termalica Nieciecza", tier: 1, colors: ["#FF5F1F", "#FFFF00", "#0000FF"], stadium: "Stadion Bruk-Bet", capacity: 4595, reputation: 5, logoFile: "bruk-bet-termalica-nieciecza-2021-logo.png" },
  { name: "Wis\u0142a P\u0142ock", tier: 1, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion im. Kazimierza G\xF3rskiego", capacity: 12800, reputation: 6, logoFile: "wisla-plock-2006-logo.png" },
  // --- TIER 2 (1. Liga) - 18 Teams ---
  { name: "Wis\u0142a Krak\xF3w", tier: 2, colors: ["#fa0101", "#0026ff", "#ffffff"], stadium: "Stadion im. Henryka Reymana", capacity: 33326, reputation: 10, logoFile: "wisla-krakow-logo.png" },
  { name: "Pogo\u0144 Grodzisk Mazowiecki", tier: 2, colors: ["#FF0000", "#FFFFFF", "#0000FF"], stadium: "Stadion Miejski w Grodzisku Mazowieckim", capacity: 1500, reputation: 4, logoFile: "pogon-grodzisk-mazowiecki.png" },
  { name: "Polonia Bytom", tier: 2, colors: ["#0000FF", "#FF0000", "#FFFFFF"], stadium: "Stadion im. Edwardw Szymkowiaka", capacity: 5500, reputation: 7, logoFile: "Polonia_Bytom.png" },
  { name: "Chrobry G\u0142og\xF3w", tier: 2, colors: ["#FF5F1F", "#000000", "#FFFFFF"], stadium: "Stadion Miejski w G\u0142ogowie", capacity: 3e3, reputation: 5, logoFile: "chrobry_glogow.png" },
  { name: "Stal Rzesz\xF3w", tier: 2, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Stadion Miejski w Rzeszowie", capacity: 11500, reputation: 6, logoFile: "stal-rzeszow-2025-logo.png" },
  { name: "\u015Al\u0105sk Wroc\u0142aw", tier: 2, colors: ["#008000", "#FFFFFF", "#FF0000"], stadium: "Tarczy\u0144ski Arena", capacity: 42771, reputation: 10, logoFile: "Slask_Wroclaw.png" },
  { name: "Polonia Warszawa", tier: 2, colors: ["#000000", "#FFFFFF", "#ff0000e9"], stadium: "Stadion Im. Gen. Kazimierza Sosnowskiego", capacity: 7150, reputation: 8, logoFile: "Polonia_warszawa.png", stadiumSeatColors: ["#111111", "#cc0000", "#ffffff"] },
  { name: "Wieczysta Krak\xF3w", tier: 2, colors: ["#FFFF00", "#FF0000", "#000000"], stadium: "Stadion Pr\u0105dniczanki", capacity: 2e3, reputation: 5, logoFile: "wieczysta-krakow-logo.png" },
  { name: "Ruch Chorz\xF3w", tier: 2, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski w Chorzowie", capacity: 9300, reputation: 9, logoFile: "ruch-chorzow-2021-logo.png" },
  { name: "Mied\u017A Legnica", tier: 2, colors: ["#008000", "#FF0000", "#0000FF"], stadium: "Stadion Or\u0142a Bia\u0142ego", capacity: 6194, reputation: 8, logoFile: "miedz-legnica-2022-logo.png" },
  { name: "\u0141KS \u0141\xF3d\u017A", tier: 2, colors: ["#FFFFFF", "#FF0000", "#FFFFFF"], stadium: "Stadion Kr\xF3la", capacity: 18029, reputation: 9, logoFile: "lks_lodz.png" },
  { name: "Pogo\u0144 Siedlce", tier: 2, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion ROSRRiT", capacity: 2900, reputation: 4, logoFile: "pogon_siedlce.png" },
  { name: "Odra Opole", tier: 2, colors: ["#0000FF", "#FF0000", "#FFFFFF"], stadium: "Stadion Odry", capacity: 4800, reputation: 6, logoFile: "odra-opole.png" },
  { name: "Puszcza Niepo\u0142omice", tier: 2, colors: ["#FFFFFF", "#0000FF", "#008000"], stadium: "Stadion w Niepo\u0142omicach", capacity: 2118, reputation: 6, logoFile: "puszcza-niepolomice-2013-logo.png" },
  { name: "Znicz Pruszk\xF3w", tier: 2, colors: ["#FFFF00", "#FF0000", "#FFFFFF"], stadium: "Stadion MZOS", capacity: 2100, reputation: 4, logoFile: "znicz-pruszkow.png" },
  { name: "Stal Mielec", tier: 2, colors: ["#0817ee", "#e2e611", "#ffffff"], stadium: "Stadion MOSiR w Mielcu", capacity: 6864, reputation: 7, logoFile: "stal-mielec.png" },
  { name: "GKS Tychy", tier: 2, colors: ["#008000", "#000000", "#FF0000"], stadium: "Stadion Miejski w Tychach", capacity: 15300, reputation: 6, logoFile: "gks_tychy.png" },
  { name: "G\xF3rnik \u0141\u0119czna", tier: 2, colors: ["#008000", "#000000", "#FFFFFF"], stadium: "Stadion G\xF3rnika", capacity: 7200, reputation: 6, logoFile: "gornik_leczna.png" },
  // --- TIER 3 (2. Liga) - 18 Teams ---
  { name: "Zag\u0142\u0119bie Sosnowiec", tier: 3, colors: ["#008000", "#FFFFFF", "#FF0000"], stadium: "ArcelorMittal Park", capacity: 11600, reputation: 6, logoFile: "Zaglebie_Sosnowiec.png" },
  { name: "Podbeskidzie Bielsko-Bia\u0142a", tier: 3, colors: ["#FF0000", "#FFFFFF", "#0000FF"], stadium: "Stadion Miejski w Bielsku-Bia\u0142ej", capacity: 15100, reputation: 4, logoFile: "Podbeskidzie_bielsko_biala.png" },
  { name: "Warta Pozna\u0144", tier: 3, colors: ["#008000", "#FFFFFF", "#000000"], stadium: "Stadion Miejski w Pozaniu", capacity: 4600, reputation: 4, logoFile: "warta-poznan.png" },
  { name: "Zawisza Bydgoszcz", tier: 3, colors: ["#0000FF", "#000000", "#FFFFFF"], stadium: "Stadion im. Zdzis\u0142awa Krzyszkowiaka", capacity: 20247, reputation: 7, logoFile: "zawisza-bydgoszcz.png" },
  { name: "Stal Stalowa Wola", tier: 3, colors: ["#008000", "#000000", "#FFFFFF"], stadium: "Podkarpackie Centrum Pi\u0142ki No\u017Cnej", capacity: 3800, reputation: 3, logoFile: "stal-stalowa-wola-2024-logo.png" },
  { name: "Resovia", tier: 3, colors: ["#FFFFFF", "#FF0000", "#0000FF"], stadium: "Stadion Miejski w Rzeszowie", capacity: 3500, reputation: 3, logoFile: "Resovia.png" },
  { name: "Hutnik Krak\xF3w", tier: 3, colors: ["#5EB6E4", "#FFFFFF", "#FF0000"], stadium: "Stadion Suche Stawy", capacity: 6500, reputation: 3, logoFile: "Hutnik_krakow.png" },
  { name: "Olimpia Grudzi\u0105dz", tier: 3, colors: ["#FFFFFF", "#FF0000", "#008000"], stadium: "Stadion Miejski w Grudzi\u0105dzu", capacity: 5e3, reputation: 3, logoFile: "olimpia_grudziadz.png" },
  { name: "Sandecja Nowy S\u0105cz", tier: 3, colors: ["#FFFFFF", "#000000", "#0000FF"], stadium: "Stadion Miejski w Nowym S\u0105czu", capacity: 4500, reputation: 3, logoFile: "Sandecja_Nowy_sacz.png" },
  { name: "Chojniczanka Chojnice", tier: 3, colors: ["#FFFF00", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski w Chojnicach", capacity: 3500, reputation: 3, logoFile: "Chojniczanka_chojnice.png" },
  { name: "Elana Toru\u0144", tier: 3, colors: ["#FFFF00", "#0000FF", "#FFFFFF"], stadium: "Stadion Miejski w Toruniu", capacity: 4200, reputation: 3, logoFile: "Elana_Torun.png" },
  { name: "KKS 1925 Kalisz", tier: 3, colors: ["#FFFFFF", "#008000", "#0000FF"], stadium: "Stadion Miejski w Kaliszu", capacity: 8e3, reputation: 3, logoFile: "kks-1925-kalisz.png" },
  { name: "GKS Jastrz\u0119bie", tier: 3, colors: ["#008000", "#000000", "#FFFF00"], stadium: "Stadion Miejski w Jastrz\u0119biu-Zdroju", capacity: 5600, reputation: 3, logoFile: "GKS_Jastrz\u0119bie.png" },
  { name: "Unia Skierniewice", tier: 3, colors: ["#FFFFFF", "#0000FF", "#FFFF00"], stadium: "Stadion Miejski w Skierniewicach", capacity: 2500, reputation: 2, logoFile: "Unia_Skierniewice.png" },
  { name: "Podhale Nowy Targ", tier: 3, colors: ["#FF0000", "#0000FF", "#FFFF00"], stadium: "Stadion Miejski w Nowym Targu", capacity: 3e3, reputation: 2, logoFile: "Podhale_Nowy_Targ.png" },
  { name: "\u015Awit Szczecin", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski w Szczecinie", capacity: 2e3, reputation: 2, logoFile: "swit_szczecin.png" },
  { name: "Sok\xF3\u0142 Kleczew", tier: 3, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Stadion Miejski w Kleczewie", capacity: 1e3, reputation: 2, logoFile: "sokol-kleczew-logo.png" },
  { name: "Rekord Bielsko-Bia\u0142a", tier: 3, colors: ["#FFFFFF", "#008000", "#FFFF00"], stadium: "Stadion Miejski", capacity: 800, reputation: 2, logoFile: "Rekord_Bielsko-Bia\u0142a.png" },
  // --- TIER 4 (3. Liga i niższe) ---
  // Drużyny rezerw są osobnymi klubami AI. Integracja sportowa i kadrowa z
  // pierwszym zespołem zostanie dodana w osobnym etapie.
  { name: "Legia Warszawa II", tier: 4, colors: ["#007a25", "#ffffff", "#a80e0e"], stadium: "Legia Training Center", capacity: 1e3, reputation: 3, logoFile: "legia-warsaw-2019-logo.png" },
  { name: "\u015Al\u0105sk Wroc\u0142aw II", tier: 4, colors: ["#008000", "#FFFFFF", "#FF0000"], stadium: "Stadion Oporowska", capacity: 8346, reputation: 3, logoFile: "Slask_Wroclaw.png" },
  { name: "\u0141KS II \u0141\xF3d\u017A", tier: 4, colors: ["#FFFFFF", "#FF0000", "#FFFFFF"], stadium: "Akademia \u0141KS", capacity: 3e3, reputation: 3, logoFile: "lks_lodz.png" },
  { name: "GKS Be\u0142chat\xF3w", tier: 4, colors: ["#06830c", "#ffffff", "#000000"], stadium: "GIEKSA Arena", capacity: 5264, reputation: 5, logoFile: "gksbelchatow.png" },
  { name: "Wigry Suwa\u0142ki", tier: 4, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Stadion Miejski w Suwa\u0142kach", capacity: 3060, reputation: 3 },
  { name: "Olimpia Elbl\u0105g", tier: 4, colors: ["#FFFF00", "#FFFFFF", "#0000FF"], stadium: "Stadion Miejski w Elbl\u0105gu", capacity: 3e3, reputation: 3 },
  { name: "Avia \u015Awidnik", tier: 4, colors: ["#FFFF00", "#0000FF", "#FFFFFF"], stadium: "Stadion Miejski w \u015Awidniku", capacity: 2800, reputation: 2 },
  { name: "KSZO Ostrowiec", tier: 4, colors: ["#FF5F1F", "#000000", "#FFFFFF"], stadium: "Stadion KSZO", capacity: 7430, reputation: 5, logoFile: "kszo-ostrowiec-swietokrzyski.png" },
  { name: "Siarka Tarnobrzeg", tier: 4, colors: ["#008000", "#000000", "#FFFF00"], stadium: "Stadion Miejski w Tarnobrzegu", capacity: 3770, reputation: 2, logoFile: "siarka-tarnobrzeg-logo.png" },
  { name: "Wis\u0142oka D\u0119bica", tier: 4, colors: ["#FFFFFF", "#008000", "#FF0000"], stadium: "Stadion Wis\u0142oki w D\u0119bicy", capacity: 2840, reputation: 2 },
  { name: "Lechia Zielona G\xF3ra", tier: 4, colors: ["#FFFFFF", "#008000", "#FFFF00"], stadium: "Stadion MOSiR w Zielonej G\xF3rze", capacity: 5e3, reputation: 2 },
  { name: "MKS Flota \u015Awinouj\u015Bcie", tier: 4, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Stadion Miejski w \u015Awinouj\u015Bciu", capacity: 3070, reputation: 2 },
  { name: "\u015Awit Nowy Dw\xF3r Mazowiecki", tier: 4, colors: ["#FFFFFF", "#008000", "#000000"], stadium: "Stadion Miejski w Nowym Dworze Mazowieckim", capacity: 3e3, reputation: 2 },
  { name: "Lechia Tomasz\xF3w Mazowiecki", tier: 4, colors: ["#008000", "#FF0000", "#FFFFFF"], stadium: "Stadion Miejski w Tomaszowie Mazowieckim", capacity: 2500, reputation: 2 },
  { name: "G\xF3rnik Polkowice", tier: 4, colors: ["#008000", "#000000", "#FFFFFF"], stadium: "Stadion Miejski w Polkowicach", capacity: 2500, reputation: 2 },
  { name: "MKS Kluczbork", tier: 4, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Stadion Miejski w Kluczborku", capacity: 2500, reputation: 2 },
  { name: "Che\u0142mianka Che\u0142m", tier: 4, colors: ["#FFFFFF", "#008000", "#FF0000"], stadium: "Stadion Miejski w Che\u0142mie", capacity: 3e3, reputation: 2 },
  { name: "Star Starachowice", tier: 4, colors: ["#008000", "#000000", "#FFFFFF"], stadium: "Stadion Miejski w Starachowicach", capacity: 5e3, reputation: 2 },
  { name: "B\u0142\u0119kitni Stargard", tier: 4, colors: ["#87CEEB", "#FFFFFF", "#000000"], stadium: "Stadion Miejski w Stargardzie", capacity: 2850, reputation: 2 },
  { name: "Warta Gorz\xF3w Wielkopolski", tier: 4, colors: ["#000080", "#800000", "#FFFFFF"], stadium: "Stadion OSiR w Gorzowie Wielkopolskim", capacity: 4e3, reputation: 2 },
  { name: "Bro\u0144 Radom", tier: 4, colors: ["#FFFFFF", "#FF0000", "#0000FF"], stadium: "Stadion Miejski w Radomiu", capacity: 4e3, reputation: 2, logoFile: "bron-radom-2020-logo.png" },
  { name: "M\u0142awianka M\u0142awa", tier: 4, colors: ["#008000", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski w M\u0142awie", capacity: 4e3, reputation: 2 },
  { name: "Warta Sieradz", tier: 4, colors: ["#FFFFFF", "#008000", "#FF0000"], stadium: "Stadion Miejski w Sieradzu", capacity: 2e3, reputation: 2 },
  { name: "Polonia Nysa", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski w Nysie", capacity: 2e3, reputation: 2 },
  { name: "FKS Stal Kra\u015Bnik", tier: 4, colors: ["#0000FF", "#FFFF00", "#FFFFFF"], stadium: "Stadion Miejski w Kra\u015Bniku", capacity: 2e3, reputation: 2 },
  { name: "\u015Al\u0119za Wroc\u0142aw", tier: 4, colors: ["#FFFF00", "#FF0000", "#FFFFFF"], stadium: "Stadion Miejski", capacity: 2e3, reputation: 2 },
  { name: "Z\u0105bkovia Z\u0105bki", tier: 4, colors: ["#FFFFFF", "#FF0000", "#000080"], stadium: "Stadion Miejski w Z\u0105bkach", capacity: 2e3, reputation: 2, logoFile: "zabkovia-zabki-2018-logo.png" },
  { name: "Pogo\u0144-Sok\xF3\u0142 Lubacz\xF3w", tier: 4, colors: ["#FF0000", "#FFFFFF", "#0000FF"], stadium: "Stadion Miejski w Lubaczowie", capacity: 2500, reputation: 1 },
  { name: "LKS Gocza\u0142kowice-Zdr\xF3j", tier: 4, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Stadion Miejski", capacity: 1e3, reputation: 1, logoFile: "lks-goczalkowice-zdroj-2025-logo.png" },
  { name: "MKP Carina Gubin", tier: 4, colors: ["#008000", "#000000", "#FFFFFF"], stadium: "Stadion Miejski w Gubinie", capacity: 1500, reputation: 1 },
  { name: "SKRA Cz\u0119stochowa", tier: 4, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Stadion Miejski", capacity: 1e3, reputation: 1, logoFile: "skra-czestochowa-2023-logo.png" },
  { name: "Karkonosze Jelenia G\xF3ra", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski w Jeleniej G\xF3rze", capacity: 3e3, reputation: 1 },
  { name: "S\u0142owianin Wolib\xF3rz", tier: 4, colors: ["#008000", "#FF0000", "#000000"], stadium: "Stadion Miejski", capacity: 500, reputation: 1 },
  { name: "Pni\xF3wek Paw\u0142owice \u015Al\u0105skie", tier: 4, colors: ["#008000", "#000000", "#FFFF00"], stadium: "Stadion Miejski", capacity: 1200, reputation: 1 },
  { name: "LZS Starowice", tier: 4, colors: ["#0000FF", "#FF0000", "#FFFFFF"], stadium: "Stadion Miejski", capacity: 800, reputation: 1 },
  { name: "MKS Stal Jasie\u0144", tier: 4, colors: ["#FFFF00", "#0000FF", "#FFFFFF"], stadium: "Stadion Miejski", capacity: 500, reputation: 1 },
  { name: "\u0141KS \u0141om\u017Ca", tier: 4, colors: ["#FFFFFF", "#FF0000", "#0000FF"], stadium: "Stadion Miejski w \u0141om\u017Cy", capacity: 3e3, reputation: 1 },
  { name: "KS CK Troszyn", tier: 4, colors: ["#008000", "#FFFFFF", "#000000"], stadium: "Stadion Miejski", capacity: 500, reputation: 1 },
  { name: "KS Wasilk\xF3w", tier: 4, colors: ["#0000FF", "#FF0000", "#008000"], stadium: "Stadion Miejski w Wasilkowie", capacity: 1e3, reputation: 1 },
  { name: "MLKS Znicz Bia\u0142a Piska", tier: 4, colors: ["#FF0000", "#008000", "#FFFFFF"], stadium: "Stadion Miejski w Bia\u0142ej Piskiej", capacity: 800, reputation: 1 },
  { name: "Polonia \u015Aroda Wielkopolska", tier: 4, colors: ["#800000", "#FFFFFF", "#0000FF"], stadium: "Stadion Miejski w \u015Arodzie Wielkopolskiej", capacity: 1500, reputation: 1 },
  { name: "KTS-K Luzino", tier: 4, colors: ["#FFFFFF", "#FF0000", "#0000FF"], stadium: "Stadion Miejski", capacity: 800, reputation: 1 },
  { name: "Cartusia Kartuzy", tier: 4, colors: ["#0000FF", "#FFFFFF", "#000000"], stadium: "Stadion Miejski w Kartuzach", capacity: 1200, reputation: 1 },
  { name: "KS Lipno St\u0119szew", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski", capacity: 1e3, reputation: 1 },
  { name: "WDA \u015Awiecie", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski w \u015Awieciu", capacity: 3e3, reputation: 1 },
  { name: "Note\u0107 Czarnk\xF3w", tier: 4, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Stadion Miejski w Czarnkowie", capacity: 1500, reputation: 2 },
  { name: "ZKS Kluczevia Stargard", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FFFF00"], stadium: "Stadion Miejski", capacity: 1e3, reputation: 1 },
  { name: "Pogo\u0144 Nowe Skalmierzyce", tier: 4, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Stadion Miejski", capacity: 1500, reputation: 1 },
  { name: "SKS Unia Swarz\u0119dz", tier: 4, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Stadion Miejski w Swarz\u0119dzu", capacity: 1500, reputation: 1 },
  { name: "MKS Viktoria Wrze\u015Bnia", tier: 4, colors: ["#FFFFFF", "#008000", "#FF0000"], stadium: "Stadion Miejski we Wrze\u015Bni", capacity: 1e3, reputation: 1 },
  { name: "GZS Tluchovia T\u0142uchowo", tier: 4, colors: ["#0000FF", "#FFFF00", "#FF0000"], stadium: "Stadion Miejski", capacity: 500, reputation: 1 },
  { name: "LKS Wybrze\u017Ce Rewalskie Rewal", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski", capacity: 1e3, reputation: 1 },
  { name: "Wi\u015Blanie Ja\u015Bkowice", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000080"], stadium: "Stadion Miejski", capacity: 800, reputation: 1 },
  { name: "MKS Podlasie Bia\u0142a Podlaska", tier: 4, colors: ["#FFFFFF", "#008000", "#FFFF00"], stadium: "Stadion Miejski w Bia\u0142ej Piskiej", capacity: 1500, reputation: 1 },
  { name: "MKS Czarni Po\u0142aniec", tier: 4, colors: ["#FFFF00", "#000000", "#FFFFFF"], stadium: "Stadion Miejski w Po\u0142a\u0144cu", capacity: 900, reputation: 1 },
  { name: "KS Naprz\xF3d J\u0119drzej\xF3w", tier: 4, colors: ["#FFFF00", "#000000", "#FFFFFF"], stadium: "Stadion Miejski w J\u0119drzejowie", capacity: 1200, reputation: 1 },
  { name: "\u015Awidniczanka \u015Awidnik", tier: 4, colors: ["#008000", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski", capacity: 1e3, reputation: 1 },
  { name: "Sok\xF3\u0142 Kolbuszowa Dolna", tier: 4, colors: ["#FF0000", "#FFFF00", "#008000"], stadium: "Stadion Miejski", capacity: 800, reputation: 1 },
  { name: "Sparta Kazimierza Wielka", tier: 4, colors: ["#FF0000", "#FFFFFF", "#0000FF"], stadium: "Stadion Miejski", capacity: 800, reputation: 1 },
  { name: "BKS Sparta Katowice", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski", capacity: 1e3, reputation: 1 },
  { name: "Wikielec", tier: 4, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Stadion Miejski", capacity: 600, reputation: 1 },
  { name: "Kotwica Ko\u0142obrzeg", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski w Ko\u0142obrzegu", capacity: 3e3, reputation: 3 },
  { name: "Olimpia Zambr\xF3w", tier: 4, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Stadion Miejski w Zambrowie", capacity: 2e3, reputation: 2 },
  { name: "Stomil Olsztyn", tier: 4, colors: ["#1f68d6", "#FFFFFF", "#0c53bd"], stadium: "Stadion Miejski w Olsztynie", capacity: 4500, reputation: 5 },
  { name: "Gwardia Koszalin", tier: 4, colors: ["#FF0000", "#FFFFFF", "#0000FF"], stadium: "Stadion Miejski w Koszalinie", capacity: 2500, reputation: 2 },
  { name: "Ba\u0142tyk Gdynia", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski w Gdyni (Ba\u0142tyk)", capacity: 2e3, reputation: 3, logoFile: "baltyk_gdynia.png" },
  { name: "Vineta Wolin", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FFFF00"], stadium: "Stadion Miejski w Wolinie", capacity: 1500, reputation: 2 },
  { name: "Chemik Police", tier: 4, colors: ["#008000", "#FFFFFF", "#000000"], stadium: "Stadion Miejski w Policach", capacity: 2e3, reputation: 2 },
  { name: "Lechia Dzier\u017Coni\xF3w", tier: 4, colors: ["#008000", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski w Dzier\u017Coniowie", capacity: 2500, reputation: 2 },
  { name: "Foto-Higiena Ga\u0107", tier: 4, colors: ["#FF0000", "#FFFFFF", "#0000FF"], stadium: "Stadion Miejski w Gaci", capacity: 800, reputation: 1 },
  { name: "Unia Janikowo", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski w Janikowie", capacity: 2e3, reputation: 2 },
  { name: "W\u0142\xF3kniarz Cz\u0119stochowa", tier: 4, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Stadion Miejski w Cz\u0119stochowie", capacity: 1500, reputation: 2 },
  { name: "Victoria Cz\u0119stochowa", tier: 4, colors: ["#008000", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski", capacity: 1e3, reputation: 1 },
  { name: "KTS Wesz\u0142o Warszawa", tier: 4, colors: ["#FF0000", "#FFFFFF", "#0000FF"], stadium: "Stadion Miejski", capacity: 1200, reputation: 1 },
  { name: "Sok\xF3\u0142 Ostr\xF3da", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion Miejski w Ostr\xF3dzie", capacity: 3e3, reputation: 2 },
  { name: "Mazovia Mi\u0144sk Mazowiecki", tier: 4, colors: ["#FF0000", "#FFFFFF", "#0000FF"], stadium: "Stadion Miejski w Mi\u0144sku Mazowieckim", capacity: 1500, reputation: 1 },
  { name: "Polonia Bydgoszcz", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Stadion im. Bronis\u0142awa Malinowskiego", capacity: 2500, reputation: 2 },
  // 2026/27 III-liga expansion -------------------------------------------------
  // These records complete the official four-group membership used by a new
  // 2026/27 career. They intentionally live in the normal Polish club database:
  // the regular squad, finance, transfer and injury systems can then treat them
  // exactly like every other AI club instead of relying on special placeholders.
  { name: "Widzew \u0141\xF3d\u017A II", tier: 4, colors: ["#C8102E", "#FFFFFF"], stadium: "O\u015Brodek Treningowy Widzewa", capacity: 1e3, reputation: 2 },
  { name: "Pelikan \u0141owicz", tier: 4, colors: ["#00843D", "#FFFFFF"], stadium: "Stadion Miejski w \u0141owiczu", capacity: 2100, reputation: 2 },
  { name: "Wis\u0142a P\u0142ock II", tier: 4, colors: ["#0057B8", "#FFFFFF"], stadium: "Stadion Wis\u0142y II", capacity: 1e3, reputation: 2 },
  { name: "Jagiellonia Bia\u0142ystok II", tier: 4, colors: ["#F5D000", "#D71920"], stadium: "O\u015Brodek Treningowy Jagiellonii", capacity: 1e3, reputation: 2 },
  { name: "Polonia Lidzbark Warmi\u0144ski", tier: 4, colors: ["#000000", "#FFFFFF", "#D71920"], stadium: "Stadion Miejski w Lidzbarku Warmi\u0144skim", capacity: 1200, reputation: 1 },
  { name: "Wik\u0119d Luzino", tier: 4, colors: ["#D71920", "#FFFFFF"], stadium: "Stadion Gminny w Luzinie", capacity: 1e3, reputation: 1 },
  { name: "Lech Pozna\u0144 II", tier: 4, colors: ["#0057B8", "#FFFFFF"], stadium: "Stadion Akademii Lecha", capacity: 1500, reputation: 3 },
  { name: "Gedania Gda\u0144sk", tier: 4, colors: ["#D71920", "#FFFFFF"], stadium: "Stadion Gedanii", capacity: 1e3, reputation: 1 },
  { name: "Chemik Bydgoszcz", tier: 4, colors: ["#0057B8", "#FFFFFF"], stadium: "Stadion im. Czes\u0142awa Kobusa", capacity: 1500, reputation: 1 },
  { name: "Ba\u0142tyk Koszalin", tier: 4, colors: ["#0057B8", "#FFFFFF"], stadium: "Stadion Ba\u0142tyku", capacity: 1500, reputation: 1 },
  { name: "Grom Nowy Staw", tier: 4, colors: ["#00843D", "#FFFFFF"], stadium: "Stadion Miejski w Nowym Stawie", capacity: 800, reputation: 1 },
  { name: "Kotwica K\xF3rnik", tier: 4, colors: ["#00843D", "#FFFFFF"], stadium: "Stadion Miejski w K\xF3rniku", capacity: 1e3, reputation: 1 },
  { name: "Odra Bytom Odrza\u0144ski", tier: 4, colors: ["#0057B8", "#FFFFFF"], stadium: "Stadion Miejski w Bytomiu Odrza\u0144skim", capacity: 1e3, reputation: 1 },
  { name: "Zag\u0142\u0119bie Lubin II", tier: 4, colors: ["#F58220", "#FFFFFF", "#00843D"], stadium: "Akademia Zag\u0142\u0119bia Lubin", capacity: 1e3, reputation: 3 },
  { name: "Barycz Su\u0142\xF3w", tier: 4, colors: ["#000000", "#FFFFFF"], stadium: "Stadion w Su\u0142owie", capacity: 800, reputation: 1 },
  { name: "ROW Rybnik", tier: 4, colors: ["#00843D", "#000000"], stadium: "Stadion Miejski w Rybniku", capacity: 1e4, reputation: 3 },
  { name: "Stal Brzeg", tier: 4, colors: ["#0057B8", "#FFFFFF"], stadium: "Stadion Miejski w Brzegu", capacity: 2500, reputation: 2 },
  { name: "Stilon Gorz\xF3w", tier: 4, colors: ["#0057B8", "#FFFFFF"], stadium: "Stadion OSiR w Gorzowie Wielkopolskim", capacity: 5e3, reputation: 3 },
  { name: "Mied\u017A Legnica II", tier: 4, colors: ["#00843D", "#D71920", "#0057B8"], stadium: "Akademia Miedzi Legnica", capacity: 1e3, reputation: 2 },
  { name: "Rak\xF3w Cz\u0119stochowa II", tier: 4, colors: ["#0057B8", "#D71920"], stadium: "Centrum Treningowe Rakowa", capacity: 1e3, reputation: 3 },
  { name: "Wi\u015Blanie Skawina", tier: 4, colors: ["#D71920", "#FFFFFF"], stadium: "Stadion Miejski w Skawinie", capacity: 1e3, reputation: 1 },
  { name: "Wis\u0142a Krak\xF3w II", tier: 4, colors: ["#D71920", "#0057B8", "#FFFFFF"], stadium: "Baza Treningowa Wis\u0142y", capacity: 1e3, reputation: 3 },
  { name: "Wieczysta Krak\xF3w II", tier: 4, colors: ["#F5D000", "#D71920"], stadium: "Stadion Pr\u0105dniczanki", capacity: 1e3, reputation: 2 },
  { name: "JKS Jaros\u0142aw", tier: 4, colors: ["#0057B8", "#FFFFFF"], stadium: "Stadion Miejski w Jaros\u0142awiu", capacity: 2500, reputation: 2 },
  { name: "Hetman Zamo\u015B\u0107", tier: 4, colors: ["#00843D", "#D71920", "#FFFFFF"], stadium: "Stadion OSiR w Zamo\u015Bciu", capacity: 16e3, reputation: 3 },
  { name: "Moravia Morawica", tier: 4, colors: ["#0057B8", "#FFFFFF"], stadium: "Stadion Miejski w Morawicy", capacity: 1e3, reputation: 1 },
  { name: "AKS 1947 Busko-Zdr\xF3j", tier: 4, colors: ["#D71920", "#FFFFFF", "#000000"], stadium: "Stadion Miejski w Busku-Zdroju", capacity: 1500, reputation: 1 },
  { name: "Korona Kielce II", tier: 4, colors: ["#F5D000", "#D71920"], stadium: "Centrum Treningowe Korony", capacity: 1e3, reputation: 2 },
  { name: "Wis\u0142a Pu\u0142awy", tier: 4, colors: ["#0057B8", "#FFFFFF"], stadium: "Stadion MOSiR w Pu\u0142awach", capacity: 4418, reputation: 3 }
];

// resources/static_db/clubs/ChampionsLeagueTeams.tsx
var RAW_CHAMPIONS_LEAGUE_CLUBS = [
  { name: "Ajax Amsterdam", country: "NED", tier: 2, colors: ["#FFFFFF", "#ED0000", "#000000"], stadium: "Johan Cruijff Arena", capacity: 54744, reputation: 16 },
  { name: "Arsenal Londyn", country: "ENG", tier: 1, colors: ["#EF0107", "#FFFFFF", "#023474"], stadium: "Emirates Stadium", capacity: 60260, reputation: 18 },
  { name: "Atalanta Bergamo", country: "ITA", tier: 2, colors: ["#000000", "#1E90FF", "#000000"], stadium: "Gewiss Stadium", capacity: 24500, reputation: 15 },
  { name: "Athletic Bilbao", country: "ESP", tier: 2, colors: ["#D50032", "#FFFFFF", "#000000"], stadium: "San Mam\xE9s", capacity: 53e3, reputation: 15 },
  { name: "Atl\xE9tico Madryt", country: "ESP", tier: 1, colors: ["#C8102E", "#FFFFFF", "#1F3C88"], stadium: "C\xEDvitas Metropolitano", capacity: 68456, reputation: 17 },
  { name: "Bayer Leverkusen", country: "GER", tier: 1, colors: ["#E32219", "#000000", "#FFFFFF"], stadium: "BayArena", capacity: 30750, reputation: 17 },
  { name: "Bayern Monachium", country: "GER", tier: 1, colors: ["#DC052D", "#FFFFFF", "#0066B2"], stadium: "Allianz Arena", capacity: 75e3, reputation: 20 },
  { name: "Benfica Lizbona", country: "POR", tier: 1, colors: ["#E10600", "#FFFFFF", "#E10600"], stadium: "Est\xE1dio da Luz", capacity: 65e3, reputation: 17 },
  { name: "Bod\xF8/Glimt", country: "NOR", tier: 3, colors: ["#FFD200", "#000000", "#FFD200"], stadium: "Aspmyra Stadion", capacity: 8270, reputation: 12 },
  { name: "Borussia Dortmund", country: "GER", tier: 1, colors: ["#FDE100", "#000000", "#FDE100"], stadium: "Signal Iduna Park", capacity: 81365, reputation: 18 },
  { name: "Celtic Glasgow", country: "SCO", tier: 2, colors: ["#009A44", "#FFFFFF", "#009A44"], stadium: "Celtic Park", capacity: 60832, reputation: 15 },
  { name: "Chelsea Londyn", country: "ENG", tier: 1, colors: ["#034694", "#FFFFFF", "#034694"], stadium: "Stamford Bridge", capacity: 41798, reputation: 18 },
  { name: "Club Brugge", country: "BEL", tier: 2, colors: ["#003DA5", "#000000", "#003DA5"], stadium: "Jan Breydel Stadium", capacity: 29500, reputation: 14 },
  { name: "Crvena Zvezda Belgrad", country: "SRB", tier: 3, colors: ["#D50032", "#FFFFFF", "#D50032"], stadium: "Rajko Miti\u0107 Stadium", capacity: 53200, reputation: 14 },
  { name: "Dinamo Kij\xF3w", country: "UKR", tier: 2, colors: ["#0057B8", "#FFFFFF", "#0057B8"], stadium: "Olimpijski", capacity: 70050, reputation: 14 },
  { name: "Dinamo Zagrzeb", country: "CRO", tier: 2, colors: ["#0046AD", "#FFFFFF", "#0046AD"], stadium: "Maksimir", capacity: 35e3, reputation: 13 },
  { name: "FC Barcelona", country: "ESP", tier: 1, colors: ["#A50044", "#004D98", "#FDB913"], stadium: "Camp Nou", capacity: 99354, reputation: 20 },
  { name: "FC Kopenhaga", country: "DEN", tier: 3, colors: ["#9D2235", "#FFFFFF", "#9D2235"], stadium: "Parken", capacity: 38065, reputation: 14 },
  { name: "Fenerbah\xE7e Stambu\u0142", country: "TUR", tier: 2, colors: ["#0A1E3F", "#FCD116", "#D21034"], stadium: "\u015E\xFCkr\xFC Saraco\u011Flu", capacity: 50509, reputation: 15 },
  { name: "Galatasaray Stambu\u0142", country: "TUR", tier: 1, colors: ["#A50034", "#FDCB0A", "#A50034"], stadium: "RAMS Park", capacity: 52652, reputation: 16 },
  { name: "Inter Mediolan", country: "ITA", tier: 1, colors: ["#00529B", "#000000", "#00529B"], stadium: "San Siro", capacity: 80018, reputation: 18 },
  { name: "Juventus Turyn", country: "ITA", tier: 1, colors: ["#FFFFFF", "#000000", "#FFFFFF"], stadium: "Allianz Stadium", capacity: 41507, reputation: 18 },
  { name: "Lazio Rzym", country: "ITA", tier: 2, colors: ["#A7C7E7", "#FFFFFF", "#A7C7E7"], stadium: "Stadio Olimpico", capacity: 70634, reputation: 15 },
  { name: "Liverpool FC", country: "ENG", tier: 1, colors: ["#C8102E", "#FFFFFF", "#C8102E"], stadium: "Anfield", capacity: 54074, reputation: 18 },
  { name: "Manchester City", country: "ENG", tier: 1, colors: ["#6CABDD", "#FFFFFF", "#6CABDD"], stadium: "Etihad Stadium", capacity: 55017, reputation: 20 },
  { name: "Manchester United", country: "ENG", tier: 1, colors: ["#DA291C", "#FFFFFF", "#DA291C"], stadium: "Old Trafford", capacity: 74879, reputation: 18 },
  { name: "Milan AC", country: "ITA", tier: 1, colors: ["#A50034", "#000000", "#A50034"], stadium: "San Siro", capacity: 80018, reputation: 18 },
  { name: "Napoli", country: "ITA", tier: 1, colors: ["#1C6ED5", "#FFFFFF", "#1C6ED5"], stadium: "Stadio Diego Armando Maradona", capacity: 54726, reputation: 16 },
  { name: "Olympiakos Pireus", country: "GRE", tier: 2, colors: ["#E41F26", "#FFFFFF", "#E41F26"], stadium: "Karaiskakis Stadium", capacity: 32115, reputation: 14 },
  { name: "Paris Saint-Germain", country: "FRA", tier: 1, colors: ["#004170", "#FFFFFF", "#E30613"], stadium: "Parc des Princes", capacity: 47929, reputation: 19 },
  { name: "FC Porto", country: "POR", tier: 1, colors: ["#0033A0", "#FFFFFF", "#0033A0"], stadium: "Est\xE1dio do Drag\xE3o", capacity: 50033, reputation: 17 },
  { name: "PSV Eindhoven", country: "NED", tier: 2, colors: ["#FF0000", "#FFFFFF", "#FF0000"], stadium: "Philips Stadion", capacity: 35600, reputation: 16 },
  { name: "Real Madryt", country: "ESP", tier: 1, colors: ["#FFFFFF", "rgba(5, 40, 179, 0.96)", "#767b80"], stadium: "Santiago Bernab\xE9u", capacity: 81044, reputation: 20 },
  { name: "AS Roma", country: "ITA", tier: 2, colors: ["#8E1B3D", "#F7B500", "#8E1B3D"], stadium: "Stadio Olimpico", capacity: 70634, reputation: 15 },
  { name: "Red Bull Salzburg", country: "AUT", tier: 3, colors: ["#FFFFFF", "#E20613", "#FFD200"], stadium: "Red Bull Arena", capacity: 31895, reputation: 13 },
  { name: "Sevilla FC", country: "ESP", tier: 2, colors: ["#D00027", "#FFFFFF", "#D00027"], stadium: "Ram\xF3n S\xE1nchez-Pizju\xE1n", capacity: 43883, reputation: 16 },
  { name: "Szachtar Donieck", country: "UKR", tier: 2, colors: ["#FF7A00", "#000000", "#FF7A00"], stadium: "Donbas Arena", capacity: 52400, reputation: 14 },
  { name: "Sporting Lizbona", country: "POR", tier: 2, colors: ["#006633", "#FFFFFF", "#006633"], stadium: "Est\xE1dio Jos\xE9 Alvalade", capacity: 50095, reputation: 15 },
  { name: "Tottenham Hotspur", country: "ENG", tier: 1, colors: ["#132257", "#FFFFFF", "#132257"], stadium: "Tottenham Hotspur Stadium", capacity: 62850, reputation: 17 },
  { name: "Union Berlin", country: "GER", tier: 2, colors: ["#E30613", "#FFFFFF", "#E30613"], stadium: "Stadion An der Alten F\xF6rsterei", capacity: 22012, reputation: 14 },
  { name: "Villarreal CF", country: "ESP", tier: 2, colors: ["#FFE000", "#00529F", "#FFE000"], stadium: "Estadio de la Cer\xE1mica", capacity: 23500, reputation: 15 },
  { name: "Young Boys Berno", country: "SUI", tier: 3, colors: ["#FFD100", "#000000", "#FFD100"], stadium: "Stadion Wankdorf", capacity: 31783, reputation: 13 },
  { name: "Zenit Petersburg", country: "RUS", tier: 1, colors: ["#009EE0", "#FFFFFF", "#009EE0"], stadium: "Gazprom Arena", capacity: 68134, reputation: 13 },
  { name: "RB Lipsk", country: "GER", tier: 1, colors: ["#FFFFFF", "#DD0741", "#002D62"], stadium: "Red Bull Arena Leipzig", capacity: 47069, reputation: 14 },
  { name: "Slavia Praga", country: "CZE", tier: 3, colors: ["#D7141A", "#FFFFFF", "#D7141A"], stadium: "Eden Arena", capacity: 19370, reputation: 14 },
  { name: "AS Monaco", country: "FRA", tier: 2, colors: ["#FFFFFF", "#E30613", "#FFFFFF"], stadium: "Stade Louis II", capacity: 18523, reputation: 15 },
  { name: "Borussia M\xF6nchengladbach", country: "GER", tier: 2, colors: ["#FFFFFF", "#000000", "#FFFFFF"], stadium: "Borussia-Park", capacity: 54057, reputation: 13 },
  { name: "FC Basel", country: "SUI", tier: 3, colors: ["#D00027", "#FFFFFF", "#002F6C"], stadium: "St. Jakob-Park", capacity: 38512, reputation: 11 },
  { name: "Ludogorec Razgrad", country: "BUL", tier: 3, colors: ["#2E8B57", "#FFFFFF", "#2E8B57"], stadium: "Huvepharma Arena", capacity: 10422, reputation: 11 },
  { name: "Qaraba\u011F A\u011Fdam", country: "AZE", tier: 3, colors: ["#000000", "#FFFFFF", "#000000"], stadium: "Azersun Arena", capacity: 5800, reputation: 11 },
  { name: "Sheriff Tiraspol", country: "MDA", tier: 3, colors: ["#FFD700", "#000000", "#FFD700"], stadium: "Sheriff Stadium", capacity: 12900, reputation: 9 },
  { name: "Slovan Bratys\u0142awa", country: "SVK", tier: 3, colors: ["#5B2D8B", "#FFFFFF", "#5B2D8B"], stadium: "Teheln\xE9 pole", capacity: 22500, reputation: 10 },
  { name: "Ferencv\xE1ros Budapeszt", country: "HUN", tier: 3, colors: ["#008000", "#FFFFFF", "#008000"], stadium: "Groupama Arena", capacity: 23700, reputation: 9 },
  { name: "Malm\xF6 FF", country: "SWE", tier: 3, colors: ["#5BA4E5", "#FFFFFF", "#5BA4E5"], stadium: "Eleda Stadion", capacity: 22500, reputation: 11 },
  { name: "APOEL Nikozja", country: "CYP", tier: 3, colors: ["#003A8F", "#FFD200", "#003A8F"], stadium: "GSP Stadium", capacity: 22859, reputation: 11 },
  { name: "HJK Helsinki", country: "FIN", tier: 3, colors: ["#0057B8", "#FFFFFF", "#0057B8"], stadium: "Bolt Arena", capacity: 10770, reputation: 11 },
  { name: "\u017Dalgiris Wilno", country: "LTU", tier: 4, colors: ["#006633", "#FFFFFF", "#006633"], stadium: "LFF Stadium", capacity: 5400, reputation: 5 },
  { name: "Flora Tallinn", country: "EST", tier: 4, colors: ["#2E8B57", "#FFFFFF", "#2E8B57"], stadium: "A. Le Coq Arena", capacity: 14500, reputation: 6 },
  { name: "K\xCD Klaksv\xEDk", country: "FRO", tier: 4, colors: ["#003A8F", "#FFFFFF", "#003A8F"], stadium: "Vi\xF0 Dj\xFApum\xFDrar", capacity: 3e3, reputation: 8 },
  { name: "Lincoln Red Imps", country: "GIB", tier: 4, colors: ["#D50032", "#FFFFFF", "#D50032"], stadium: "Victoria Stadium", capacity: 5028, reputation: 4 },
  { name: "Swift Hesperange", country: "LUX", tier: 4, colors: ["#D50032", "#FFFFFF", "#D50032"], stadium: "Stade Alphonse Theis", capacity: 7800, reputation: 4 },
  { name: "V\xEDkingur Reykjav\xEDk", country: "ISL", tier: 3, colors: ["#D50032", "#000000", "#D50032"], stadium: "V\xEDkingsv\xF6llur", capacity: 1200, reputation: 8 },
  { name: "Struga Trim-Lum", country: "MKD", tier: 4, colors: ["#1E90FF", "#FFFFFF", "#1E90FF"], stadium: "Gradska Pla\u017Ea", capacity: 8e3, reputation: 7 },
  { name: "Celje", country: "SVN", tier: 3, colors: ["#0057B8", "#FFD200", "#0057B8"], stadium: "Stadion Z'de\u017Eele", capacity: 13059, reputation: 9 },
  { name: "RFS Ryga", country: "LAT", tier: 4, colors: ["#003A8F", "#FFFFFF", "#003A8F"], stadium: "LNK Sporta Parks", capacity: 2500, reputation: 6 },
  { name: "H\xE4cken", country: "SWE", tier: 3, colors: ["#FFD200", "#000000", "#FFD200"], stadium: "Bravida Arena", capacity: 6500, reputation: 9 },
  { name: "Zrinjski Mostar", country: "BIH", tier: 3, colors: ["#D50032", "#FFFFFF", "#D50032"], stadium: "Stadion Pod Bijelim Brijegom", capacity: 9e3, reputation: 9 },
  { name: "Partizani Tirana", country: "ALB", tier: 4, colors: ["#D50032", "#FFFFFF", "#000000"], stadium: "Air Albania Stadium", capacity: 22500, reputation: 9 },
  { name: "Astana", country: "KAZ", tier: 3, colors: ["#00AEEF", "#FFD200", "#00AEEF"], stadium: "Astana Arena", capacity: 3e4, reputation: 11 },
  { name: "Dinamo Tbilisi", country: "GEO", tier: 4, colors: ["#0057B8", "#FFFFFF", "#0057B8"], stadium: "Boris Paichadze Dinamo Arena", capacity: 54900, reputation: 10 },
  { name: "Shamrock Rovers", country: "IRL", tier: 4, colors: ["#007A33", "#FFFFFF", "#007A33"], stadium: "Tallaght Stadium", capacity: 1e4, reputation: 7 },
  { name: "Hapoel Be'er Sheva", country: "ISR", tier: 3, colors: ["#E30613", "#FFFFFF", "#E30613"], stadium: "Turner Stadium", capacity: 16126, reputation: 10 },
  { name: "Linfield Belfast", country: "NIR", tier: 4, colors: ["#003A8F", "#FFFFFF", "#003A8F"], stadium: "Windsor Park", capacity: 18234, reputation: 6 },
  { name: "The New Saints", country: "WAL", tier: 4, colors: ["#00A650", "#FFFFFF", "#00A650"], stadium: "Park Hall", capacity: 2034, reputation: 7 },
  { name: "Brei\xF0ablik", country: "ISL", tier: 4, colors: ["#006633", "#FFFFFF", "#006633"], stadium: "K\xF3pavogsv\xF6llur", capacity: 5501, reputation: 8 },
  { name: "CSKA Moskwa", country: "RUS", tier: 3, colors: ["#fc0101", "#001aff", "#ff0000"], stadium: "VEB Arena", capacity: 3e4, reputation: 12 },
  { name: "BATE Borisov", country: "BLR", tier: 3, colors: ["#f2ff00", "#1e00ff", "#ffffff"], stadium: "BATE Area", capacity: 13126, reputation: 12 },
  { name: "Spartak Moskwa", country: "RUS", tier: 2, colors: ["#ff0000", "#ffffff", "#ff0000"], stadium: "Otkritie Arena", capacity: 45e3, reputation: 12 }
];
var generateEuropeanClubId = (name) => {
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  return `EU_CL_${slug}`;
};

// resources/static_db/clubs/EuropeLeagueTeams.tsx
var RAW_EUROPA_LEAGUE_CLUBS = [
  // Albania (ALB)
  { name: "Tirana", country: "ALB", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Air Albania Stadium", capacity: 22500, reputation: 6 },
  { name: "Egnatia", country: "ALB", tier: 4, colors: ["#FFFFFF", "#000000", "#FF0000"], stadium: "Arena Egnatia", capacity: 4e3, reputation: 7 },
  { name: "Vllaznia Szkodra", country: "ALB", tier: 4, colors: ["#0000FF", "#FFFFFF", "#000000"], stadium: "Loro Bori\xE7i Stadium", capacity: 16e3, reputation: 7 },
  // Anglia (ENG) 
  { name: "Crystal Palace", country: "ENG", tier: 2, colors: ["#1E22AA", "#C41230", "#FFFFFF"], stadium: "Selhurst Park", capacity: 25486, reputation: 14 },
  { name: "Brighton & Hove Albion", country: "ENG", tier: 2, colors: ["#0057B8", "#FFFFFF", "#FFCD00"], stadium: "Falmer Stadium", capacity: 31876, reputation: 14 },
  { name: "Wolverhampton Wanderers", country: "ENG", tier: 2, colors: ["#FDB913", "#000000", "#FFFFFF"], stadium: "Molineux Stadium", capacity: 32050, reputation: 14 },
  { name: "Newcastle United", country: "ENG", tier: 2, colors: ["#000000", "#FFFFFF", "#41B6E6"], stadium: "St James' Park", capacity: 52305, reputation: 12 },
  { name: "Everton FC", country: "ENG", tier: 2, colors: ["#003399", "#FFFFFF", "#FF0000"], stadium: "Goodison Park", capacity: 39214, reputation: 12 },
  { name: "Aston Villa", country: "ENG", tier: 3, colors: ["#882525", "#134ac0", "#ffffff"], stadium: "Villa Park", capacity: 42682, reputation: 10 },
  { name: "Nottingham Forest", country: "ENG", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "City Ground", capacity: 3e4, reputation: 9 },
  // Armenia (ARM)
  { name: "Ararat-Armenia", country: "ARM", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "FFA Academy Stadium", capacity: 1400, reputation: 6 },
  { name: "Noah Erywa\u0144", country: "ARM", tier: 4, colors: ["#000000", "#FFD700", "#FFFFFF"], stadium: "Abovyan City Stadium", capacity: 5320, reputation: 6 },
  { name: "Pyunik Erywa\u0144", country: "ARM", tier: 4, colors: ["#FF0000", "#000000", "#FFFFFF"], stadium: "Republican Stadium after Vazgen Sargsyan", capacity: 14403, reputation: 6 },
  // Azerbejdżan (AZE)
  { name: "Neft\xE7i Baku", country: "AZE", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Bak\u0131 Olimpiya Stadionu", capacity: 68700, reputation: 7 },
  { name: "Sabah FK", country: "AZE", tier: 4, colors: ["#0033A0", "#FFFFFF", "#FFD700"], stadium: "Bank Respublika Arena", capacity: 13e3, reputation: 7 },
  { name: "Zira FK", country: "AZE", tier: 4, colors: ["#000000", "#FFFFFF", "#FF6600"], stadium: "Zir\u0259 Sport Kompleksi", capacity: 1500, reputation: 7 },
  // Austria (AUT)
  { name: "Rapid Wiede\u0144", country: "AUT", tier: 2, colors: ["#006600", "#FFFFFF", "#000000"], stadium: "Allianz Stadion", capacity: 28345, reputation: 13 },
  { name: "Austria Wiede\u0144", country: "AUT", tier: 2, colors: ["#FFFFFF", "#000000", "#990000"], stadium: "Generali Arena", capacity: 17800, reputation: 13 },
  { name: "LASK Linz", country: "AUT", tier: 2, colors: ["#000000", "#FFFFFF", "#FFCC00"], stadium: "Raiffeisen Arena", capacity: 19009, reputation: 13 },
  { name: "Sturm Graz", country: "AUT", tier: 2, colors: ["#FFFFFF", "#000000", "#FF0000"], stadium: "Merkur Arena", capacity: 16e3, reputation: 12 },
  // Belgia (BEL) – 
  { name: "Royal Antwerp", country: "BEL", tier: 2, colors: ["#FFFFFF", "#C8102E", "#000000"], stadium: "Bosuilstadion", capacity: 23057, reputation: 12 },
  { name: "Gent", country: "BEL", tier: 2, colors: ["#006633", "#FFFFFF", "#FFCC00"], stadium: "Ghelamco Arena", capacity: 2e4, reputation: 13 },
  { name: "Standard Li\xE8ge", country: "BEL", tier: 2, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Stade Maurice Dufrasne", capacity: 30023, reputation: 13 },
  { name: "Anderlecht Bruksela", country: "BEL", tier: 2, colors: ["#FFFFFF", "#0033A0", "#FF0000"], stadium: "Lotto Park", capacity: 21e3, reputation: 15 },
  { name: "KRC Genk", country: "BEL", tier: 2, colors: ["#0033A0", "#FFFFFF", "#FF0000"], stadium: "Luminus Arena", capacity: 24956, reputation: 12 },
  // Białoruś (BLR)
  { name: "Dinamo Mi\u0144sk", country: "BLR", tier: 3, colors: ["#FFFFFF", "#0033A0", "#FF0000"], stadium: "Dinamo Stadium", capacity: 22346, reputation: 7 },
  { name: "Torpedo-BelAZ \u017Bodzino", country: "BLR", tier: 3, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Torpedo Stadium", capacity: 6524, reputation: 7 },
  { name: "Neman Grodno", country: "BLR", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Neman Stadium", capacity: 8500, reputation: 7 },
  // Bośnia i Hercegowina (BIH) – 
  { name: "Borac Banja Luka", country: "BIH", tier: 3, colors: ["#C8102E", "#FFFFFF", "#000000"], stadium: "Gradski Stadion Banja Luka", capacity: 9730, reputation: 8 },
  { name: "FK Sarajevo", country: "BIH", tier: 3, colors: ["#0033A0", "#FFFFFF", "#FF0000"], stadium: "Asim Ferhatovi\u0107 Hase", capacity: 34500, reputation: 7 },
  { name: "\u017Deljezni\u010Dar Sarajewo", country: "BIH", tier: 3, colors: ["#0033A0", "#FFFFFF", "#000000"], stadium: "Grbavica", capacity: 13349, reputation: 7 },
  // Bułgaria (BUL) – 
  { name: "Levski Sofia", country: "BUL", tier: 3, colors: ["#0000FF", "#FFFFFF", "#000000"], stadium: "Georgi Asparuhov Stadium", capacity: 18341, reputation: 9 },
  { name: "CSKA Sofia", country: "BUL", tier: 3, colors: ["#C8102E", "#FFFFFF", "#000000"], stadium: "Balgarska Armiya Stadium", capacity: 18191, reputation: 8 },
  { name: "Lokomotiv P\u0142owdiw", country: "BUL", tier: 3, colors: ["#000000", "#FFFFFF", "#C8102E"], stadium: "Lokomotiv Stadium", capacity: 13e3, reputation: 7 },
  // Chorwacja (CRO) – 
  { name: "Hajduk Split", country: "CRO", tier: 3, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Poljud", capacity: 34198, reputation: 10 },
  { name: "HNK Rijeka", country: "CRO", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion Rujevica", capacity: 8279, reputation: 9 },
  { name: "NK Osijek", country: "CRO", tier: 3, colors: ["#FFFFFF", "#0033A0", "#FFCC00"], stadium: "Opus Arena", capacity: 13005, reputation: 9 },
  // Cypr (CYP) – 
  { name: "Omonia Nikozja", country: "CYP", tier: 3, colors: ["#00A651", "#FFFFFF", "#000000"], stadium: "GSP Stadium", capacity: 22859, reputation: 8 },
  { name: "AEK Larnaka", country: "CYP", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FFFF00"], stadium: "AEK Arena", capacity: 7380, reputation: 9 },
  { name: "Aris Limassol", country: "CYP", tier: 3, colors: ["#00AEEF", "#FFFFFF", "#000000"], stadium: "Alphamega Stadium", capacity: 11e3, reputation: 9 },
  // Czechy (CZE) – 
  { name: "Sparta Praga", country: "CZE", tier: 2, colors: ["#000000", "#FF0000", "#FFFFFF"], stadium: "Generali \u010Cesk\xE1 poji\u0161\u0165ovna Arena", capacity: 19316, reputation: 14 },
  { name: "Viktoria Pilzno", country: "CZE", tier: 2, colors: ["#FF6600", "#000000", "#FFFFFF"], stadium: "Doosan Arena", capacity: 11700, reputation: 10 },
  { name: "Ban\xEDk Ostrawa", country: "CZE", tier: 2, colors: ["#000000", "#FFA500", "#FFFFFF"], stadium: "M\u011Bstsk\xFD stadion v Ostrav\u011B-V\xEDtkovic\xEDch", capacity: 15275, reputation: 9 },
  // Czarnogóra (MNE) – typowe pucharowicze z 1. CFL (poziom EL/ECL qualifiers)
  { name: "Budu\u0107nost Podgorica", country: "MNE", tier: 3, colors: ["#0033A0", "#FFFFFF", "#FFCC00"], stadium: "Gradski stadion Podgorica", capacity: 15230, reputation: 7 },
  { name: "Sutjeska Nik\u0161i\u0107", country: "MNE", tier: 3, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Gradski stadion Nik\u0161i\u0107", capacity: 5184, reputation: 6 },
  { name: "De\u010Di\u0107 Tuzi", country: "MNE", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Tu\u0161ko Polje", capacity: 3e3, reputation: 7 },
  // Dania (DEN) – po FC Kopenhaga
  { name: "FC Midtjylland", country: "DEN", tier: 3, colors: ["#000000", "#FF0000", "#FFFFFF"], stadium: "MCH Arena", capacity: 11432, reputation: 9 },
  { name: "Br\xF8ndby IF", country: "DEN", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FFFF00"], stadium: "Br\xF8ndby Stadium", capacity: 28e3, reputation: 12 },
  { name: "FC Nordsj\xE6lland", country: "DEN", tier: 3, colors: ["#FF0000", "#000000", "#FFFFFF"], stadium: "Right to Dream Park", capacity: 10300, reputation: 11 },
  //ESTONIA (EST) – więc solidni pucharowicze z Meistriliiga
  { name: "Levadia Tallinn", country: "EST", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Kadriorg Stadium", capacity: 5e3, reputation: 5 },
  { name: "N\xF5mme Kalju", country: "EST", tier: 3, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Hiiu Stadium", capacity: 800, reputation: 5 },
  { name: "Paide Linnameeskond", country: "EST", tier: 3, colors: ["#0033A0", "#FFFFFF", "#FFD700"], stadium: "Paide linnastaadion", capacity: 268, reputation: 5 },
  // Finlandia (FIN) 
  { name: "KuPS Kuopio", country: "FIN", tier: 3, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Savon Sanomat Areena", capacity: 4700, reputation: 7 },
  { name: "SJK Sein\xE4joki", country: "FIN", tier: 3, colors: ["#FFFFFF", "#0000FF", "#FFCC00"], stadium: "OmaSP Stadion", capacity: 4300, reputation: 6 },
  { name: "Ilves Tampere", country: "FIN", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Tammela Stadion", capacity: 8012, reputation: 7 },
  // Francja (FRA) – 
  { name: "Lille OSC", country: "FRA", tier: 2, colors: ["#C8102E", "#FFFFFF", "#000000"], stadium: "Decathlon Arena - Stade Pierre-Mauroy", capacity: 5e4, reputation: 13 },
  { name: "OGC Nice", country: "FRA", tier: 2, colors: ["#FF0000", "#000000", "#FFFFFF"], stadium: "Allianz Riviera", capacity: 35624, reputation: 13 },
  { name: "RC Lens", country: "FRA", tier: 2, colors: ["#FFD700", "#000000", "#FF0000"], stadium: "Stade Bollaert-Delelis", capacity: 38223, reputation: 13 },
  { name: "Olympique Lyon", country: "FRA", tier: 2, colors: ["#FFFFFF", "#C8102E", "#000000"], stadium: "Groupama Stadium", capacity: 59186, reputation: 14 },
  { name: "Olympique Marsylia", country: "FRA", tier: 2, colors: ["#00AEEF", "#FFFFFF", "#000000"], stadium: "Stade V\xE9lodrome", capacity: 67394, reputation: 14 },
  // Gruzja (GEO) – 
  { name: "Dinamo Batumi", country: "GEO", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Batumi Stadium", capacity: 2e4, reputation: 6 },
  { name: "Dila Gori", country: "GEO", tier: 4, colors: ["#006633", "#FFFFFF", "#FFD700"], stadium: "Tengiz Burjanadze Stadium", capacity: 5e3, reputation: 6 },
  { name: "Torpedo Kutaisi", country: "GEO", tier: 4, colors: ["#0000FF", "#FFFFFF", "#000000"], stadium: "Ramaz Shengelia Stadium", capacity: 11978, reputation: 6 },
  // Grecja (GRE) – po Olympiakos (z CL)
  { name: "PAOK Saloniki", country: "GRE", tier: 2, colors: ["#000000", "#FFFFFF", "#000000"], stadium: "Toumba Stadium", capacity: 28803, reputation: 12 },
  { name: "AEK Ateny", country: "GRE", tier: 2, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "OPAP Arena", capacity: 32500, reputation: 14 },
  { name: "Panathinaikos Ateny", country: "GRE", tier: 2, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Apostolos Nikolaidis Stadium", capacity: 68703, reputation: 14 },
  // Holandia (NED)  
  { name: "Feyenoord Rotterdam", country: "NED", tier: 2, colors: ["#FFFFFF", "#FF0000", "#000000"], stadium: "De Kuip", capacity: 51177, reputation: 14 },
  { name: "AZ Alkmaar", country: "NED", tier: 2, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "AFAS Stadion", capacity: 19e3, reputation: 11 },
  { name: "Twente Enschede", country: "NED", tier: 2, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "De Grolsch Veste", capacity: 3e4, reputation: 11 },
  // Węgry (HUN) – po Ferencváros (z CL)
  { name: "Mol Feh\xE9rv\xE1r FC", country: "HUN", tier: 3, colors: ["#0033A0", "#FFFFFF", "#FF0000"], stadium: "MOL Ar\xE9na S\xF3st\xF3", capacity: 14300, reputation: 7 },
  { name: "Pusk\xE1s Akad\xE9mia", country: "HUN", tier: 3, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Pusk\xE1s Ar\xE9na", capacity: 67215, reputation: 8 },
  // grają tam mecze, ale stadion akademii mniejszy
  { name: "\xDAjpest FC", country: "HUN", tier: 3, colors: ["#9932CC", "#FFFFFF", "#000000"], stadium: "Szusza Ferenc Stadion", capacity: 13500, reputation: 9 },
  // Islandia (ISL)
  { name: "V\xEDkingur Reykjav\xEDk", country: "ISL", tier: 4, colors: ["#D50032", "#000000", "#D50032"], stadium: "V\xEDkingsv\xF6llur", capacity: 1200, reputation: 7 },
  { name: "Brei\xF0ablik K\xF3pavogur", country: "ISL", tier: 4, colors: ["#006633", "#FFFFFF", "#006633"], stadium: "K\xF3pavogsv\xF6llur", capacity: 5501, reputation: 6 },
  { name: "FH Hafnarfj\xF6r\xF0ur", country: "ISL", tier: 4, colors: ["#0000FF", "#FFFFFF", "#000000"], stadium: "Kaplakrikav\xF6llur", capacity: 6450, reputation: 5 },
  // Irlandia (IRL)
  { name: "Shamrock Rovers", country: "IRL", tier: 4, colors: ["#007A33", "#FFFFFF", "#007A33"], stadium: "Tallaght Stadium", capacity: 8e3, reputation: 4 },
  { name: "St Patrick's Athletic", country: "IRL", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Richmond Park", capacity: 5347, reputation: 5 },
  { name: "Derry City", country: "IRL", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Brandywell Stadium", capacity: 7700, reputation: 5 },
  // Izrael (ISR)  top Ligat ha'Al
  { name: "Maccabi Tel Awiw", country: "ISR", tier: 3, colors: ["#FFD700", "#0000FF", "#FFFFFF"], stadium: "Bloomfield Stadium", capacity: 29300, reputation: 7 },
  { name: "Hapoel Beer Szewa", country: "ISR", tier: 3, colors: ["#E30613", "#FFFFFF", "#E30613"], stadium: "Turner Stadium", capacity: 16126, reputation: 8 },
  // jeśli nie w CL w Twojej liście – solidny
  { name: "Maccabi Hajfa", country: "ISR", tier: 3, colors: ["#FFFFFF", "#006633", "#000000"], stadium: "Sammy Ofer Stadium", capacity: 30800, reputation: 10 },
  // Włochy (ITA) –  Serie A
  { name: "Bologna FC", country: "ITA", tier: 2, colors: ["#00529B", "#FFFFFF", "#FF0000"], stadium: "Stadio Renato Dall'Ara", capacity: 36462, reputation: 13 },
  { name: "Udinese Calcio", country: "ITA", tier: 2, colors: ["#000000", "#FFFFFF", "#FFCC00"], stadium: "Bluenergy Stadium", capacity: 25132, reputation: 12 },
  // Kazachstan (KAZ)  top Premier Liga
  { name: "Kairat A\u0142maty", country: "KAZ", tier: 4, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Central Stadium Almaty", capacity: 23804, reputation: 4 },
  { name: "Ordabasy Szymkent", country: "KAZ", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Kazybek-Bi Stadium", capacity: 16400, reputation: 5 },
  { name: "Tobo\u0142 Kostanaj", country: "KAZ", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Central Stadium Kostanay", capacity: 8320, reputation: 6 },
  // Kosowo (KOS) – top Superliga e Kosovës (najmocniejsze kluby w pucharach)
  { name: "FC Ballkani", country: "KOS", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Stadiumi Fadil Vokrri", capacity: 13500, reputation: 4 },
  { name: "FC Drita", country: "KOS", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Gjilan City Stadium", capacity: 1e4, reputation: 4 },
  { name: "FC Prishtina", country: "KOS", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadiumi Fadil Vokrri", capacity: 13500, reputation: 4 },
  // Łotwa (LAT) – top Virslīga (po RFS Ryga z CL? – unikamy dubli, więc reszta top)
  { name: "FK Riga", country: "LAT", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Skonto Stadium", capacity: 8083, reputation: 5 },
  { name: "FK Auda", country: "LAT", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Skonto Stadium", capacity: 8083, reputation: 6 },
  { name: "FK Liep\u0101ja", country: "LAT", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Daugava Stadium Liep\u0101ja", capacity: 8e3, reputation: 5 },
  // Litwa (LTU) – top A Lyga (po Žalgiris Wilno z CL – unikamy, reszta top)
  { name: "FK Kauno \u017Dalgiris", country: "LTU", tier: 4, colors: ["#006633", "#FFFFFF", "#FFD700"], stadium: "Darius and Gir\u0117nas Stadium", capacity: 15315, reputation: 6 },
  { name: "FK \u017Dalgiris Vilnius", country: "LTU", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "LFF Stadium", capacity: 5400, reputation: 6 },
  { name: "FK Banga Garg\u017Edai", country: "LTU", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Garg\u017Edai Stadium", capacity: 2300, reputation: 6 },
  // Luksemburg (LUX) – top BGL Ligue (Differdange, Dudelange, UNA Strassen itp.)
  { name: "F91 Dudelange", country: "LUX", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Jos Nosbaum", capacity: 2550, reputation: 5 },
  { name: "FC Differdange 03", country: "LUX", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stade Parc des Sports", capacity: 2400, reputation: 3 },
  { name: "UNA Strassen", country: "LUX", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Complexe Sportif Jean Wirtz", capacity: 2e3, reputation: 4 },
  // Macedonia Północna (MKD) – top 1. MFL (Vardar, Shkendija, Struga dominują w 2025/26)
  { name: "FK Vardar Skopje", country: "MKD", tier: 4, colors: ["#FF0000", "#000000", "#FFFFFF"], stadium: "To\u0161e Proeski Arena", capacity: 33e3, reputation: 5 },
  { name: "KF Shk\xEBndija Tetovo", country: "MKD", tier: 4, colors: ["#FF0000", "#000000", "#FFFFFF"], stadium: "Ecolog Arena", capacity: 15e3, reputation: 5 },
  { name: "FC Struga Trim-Lum", country: "MKD", tier: 4, colors: ["#1E90FF", "#FFFFFF", "#1E90FF"], stadium: "Gradska Pla\u017Ea", capacity: 8e3, reputation: 5 },
  // Malta (MLT) – top Premier League (Hamrun, Floriana, Valletta, Marsaxlokk itp.)
  { name: "Hamrun Spartans", country: "MLT", tier: 4, colors: ["#FF0000", "#000000", "#FFFFFF"], stadium: "Victor Tedesco Stadium", capacity: 6e3, reputation: 5 },
  { name: "Floriana FC", country: "MLT", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Independence Ground", capacity: 3e3, reputation: 5 },
  { name: "Valletta FC", country: "MLT", tier: 4, colors: ["#FFFFFF", "#FF0000", "#000000"], stadium: "Centenary Stadium", capacity: 2e3, reputation: 6 },
  // Mołdawia (MDA) – top Super Liga (Petrocub, Zimbru, Sheriff, Milsami w 2025/26)
  { name: "FC Petrocub H\xEEnce\u0219ti", country: "MDA", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadionul Municipal H\xEEnce\u0219ti", capacity: 1500, reputation: 5 },
  { name: "FC Zimbru Chi\u0219in\u0103u", country: "MDA", tier: 4, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Stadionul Zimbru", capacity: 10500, reputation: 5 },
  { name: "FC Milsami Orhei", country: "MDA", tier: 4, colors: ["#0033A0", "#FFFFFF", "#FFCC00"], stadium: "Complexul Sportiv Raional Orhei", capacity: 2500, reputation: 4 },
  // Norwegia (NOR) – top Eliteserien (Bodø/Glimt już w CL, więc reszta mocnych: Molde, Viking, Brann, Rosenborg, Lillestrøm itp.)
  { name: "Molde FK", country: "NOR", tier: 4, colors: ["#FFFFFF", "#0000FF", "#000000"], stadium: "Aker Stadion", capacity: 11249, reputation: 10 },
  { name: "SK Brann Bergen", country: "NOR", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Brann Stadion", capacity: 17767, reputation: 9 },
  { name: "Rosenborg BK", country: "NOR", tier: 4, colors: ["#000000", "#FFFFFF", "#000000"], stadium: "Lerkendal Stadion", capacity: 21421, reputation: 9 },
  // Rumunia (ROU) – top Liga I / SuperLiga (aktualnie liderzy: U Craiova, Rapid, U Cluj, Dinamo, CFR itd.)
  { name: "Universitatea Craiova", country: "ROU", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Ion Oblemenco Stadium", capacity: 3e4, reputation: 9 },
  { name: "FC Rapid Bucure\u0219ti", country: "ROU", tier: 3, colors: ["#000000", "#FFFFFF", "#C8102E"], stadium: "Rapid-Giule\u0219ti Stadium", capacity: 14047, reputation: 9 },
  { name: "Universitatea Cluj", country: "ROU", tier: 3, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Cluj Arena", capacity: 30201, reputation: 8 },
  // Szkocja (SCO) – top Premiership (aktualnie Hearts lider, Celtic/Rangers blisko, Motherwell, Hibs itd.; Celtic w CL?)
  { name: "Heart of Midlothian", country: "SCO", tier: 3, colors: ["#8B0000", "#FFFFFF", "#FFD700"], stadium: "Tynecastle Park", capacity: 20099, reputation: 9 },
  { name: "Motherwell FC", country: "SCO", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Fir Park", capacity: 13677, reputation: 8 },
  { name: "Hibernian FC", country: "SCO", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Easter Road", capacity: 20421, reputation: 8 },
  { name: "Glasgow Rangers", country: "SCO", tier: 2, colors: ["#0000FF", "#FFFFFF", "#000000"], stadium: "Ibrox Stadium", capacity: 5e4, reputation: 13 },
  // Słowacja (SVK) – top Super Liga (Slovan w CL? – unikamy, reszta: DAC, Žilina, Spartak Trnava, Podbrezová)
  { name: "FC DAC 1904 Dunajsk\xE1 Streda", country: "SVK", tier: 3, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "MOL Ar\xE9na", capacity: 12500, reputation: 8 },
  { name: "M\u0160K \u017Dilina", country: "SVK", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "\u0160tadi\xF3n pod Dub\u0148om", capacity: 11258, reputation: 8 },
  { name: "Spartak Trnava", country: "SVK", tier: 3, colors: ["#FFFFFF", "#FF0000", "#000000"], stadium: "City Arena \u2013 \u0160tadi\xF3n Antona Malatinsk\xE9ho", capacity: 19200, reputation: 8 },
  // Portugalia (POR) – top Primeira Liga (Porto/Benfica/Sporting w CL, więc mid-top: Braga, Gil Vicente, Famalicão, Moreirense, Estoril)
  { name: "SC Braga", country: "POR", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Est\xE1dio Municipal de Braga", capacity: 30186, reputation: 12 },
  { name: "FC Famalic\xE3o", country: "POR", tier: 3, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Est\xE1dio Municipal 22 de Junho", capacity: 5307, reputation: 13 },
  { name: "Moreirense FC", country: "POR", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Est\xE1dio Comendador Joaquim de Almeida Freitas", capacity: 6153, reputation: 12 },
  // Rosja (RUS) – mocne kluby z RPL poza Zenit/CSKA/Spartak
  { name: "FK Krasnodar", country: "RUS", tier: 2, colors: ["#000000", "#FFFFFF", "#006633"], stadium: "Krasnodar Stadium", capacity: 35574, reputation: 13 },
  { name: "Lokomotiw Moskwa", country: "RUS", tier: 2, colors: ["#FF0000", "#000000", "#FFFFFF"], stadium: "RZD Arena", capacity: 28800, reputation: 12 },
  { name: "Dynamo Moskwa", country: "RUS", tier: 2, colors: ["#0033A0", "#FFFFFF", "#000000"], stadium: "VTB Arena", capacity: 26047, reputation: 12 },
  // Szwecja (SWE) – po Malmö FF i Häcken (z CL), aktualnie mocne: Mjällby, Hammarby, GAIS, Elfsborg, Djurgården itd.
  { name: "Mj\xE4llby AIF", country: "SWE", tier: 4, colors: ["#000000", "#FFFFFF", "#FFD700"], stadium: "Strandvallen", capacity: 7500, reputation: 10 },
  { name: "Hammarby IF", country: "SWE", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "3Arena", capacity: 33e3, reputation: 10 },
  { name: "GAIS G\xF6teborg", country: "SWE", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Gamla Ullevi", capacity: 18454, reputation: 9 },
  // Szwajcaria (SUI) – po Young Boys i Basel (z CL), aktualnie liderzy: Thun, St. Gallen, Lugano, Sion
  { name: "FC Thun", country: "SUI", tier: 4, colors: ["#006633", "#FFFFFF", "#FFD700"], stadium: "Arena Thun", capacity: 10300, reputation: 10 },
  { name: "FC St. Gallen", country: "SUI", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Kybunpark", capacity: 19456, reputation: 10 },
  { name: "FC Lugano", country: "SUI", tier: 4, colors: ["#000000", "#FFFFFF", "#0000FF"], stadium: "Cornaredo Stadium", capacity: 6310, reputation: 9 },
  // Turcja (TUR) – po Galatasaray, Fenerbahçe (z CL), aktualnie top: Trabzonspor, Beşiktaş, Başakşehir, Göztepe
  { name: "Trabzonspor", country: "TUR", tier: 4, colors: ["#C8102E", "#FFFFFF", "#000000"], stadium: "\u015Eenol G\xFCne\u015F Spor Kompleksi", capacity: 40882, reputation: 11 },
  { name: "Be\u015Fikta\u015F JK", country: "TUR", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Vodafone Park", capacity: 41588, reputation: 11 },
  { name: "\u0130stanbul Ba\u015Fak\u015Fehir", country: "TUR", tier: 4, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Ba\u015Fak\u015Fehir Fatih Terim Stadium", capacity: 17319, reputation: 10 },
  // Ukraina (UKR) – po Szachtar i Dynamo (z CL), aktualnie mocne: LNZ Cherkasy, Polissya Zhytomyr, Kryvbas, Metalist 1925
  { name: "LNZ Cherkasy", country: "UKR", tier: 4, colors: ["#0000FF", "#FFFFFF", "#000000"], stadium: "Cherkasy Arena", capacity: 10321, reputation: 8 },
  { name: "Polissya Zhytomyr", country: "UKR", tier: 4, colors: ["#006633", "#FFFFFF", "#FFD700"], stadium: "Stadion im. O. Oleksandriya", capacity: 5926, reputation: 8 },
  { name: "Kryvbas Kryvyj Rih", country: "UKR", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Hirnyk Stadium", capacity: 2500, reputation: 8 },
  // Walia (WAL) – top Cymru Premier (liderzy: The New Saints, Connah's Quay, Penybont, Colwyn Bay, Caernarfon)
  { name: "The New Saints", country: "WAL", tier: 4, colors: ["#00A650", "#FFFFFF", "#00A650"], stadium: "Park Hall", capacity: 2034, reputation: 5 },
  { name: "Connah's Quay Nomads", country: "WAL", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Deeside Stadium", capacity: 1500, reputation: 5 },
  { name: "Penybont FC", country: "WAL", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "SDA Wales Stadium", capacity: 1e3, reputation: 4 },
  // Andora (AND) – najsłabsza federacja, reputacja max 4–5
  { name: "FC Santa Coloma", country: "AND", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Camp Nou Municipal d'Andorra", capacity: 500, reputation: 2 },
  { name: "Inter Club d'Escaldes", country: "AND", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Camp de Futbol d'Aixovall", capacity: 1e3, reputation: 2 },
  { name: "Atl\xE8tic Club d'Escaldes", country: "AND", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Camp de Futbol d'Aixovall", capacity: 1e3, reputation: 2 },
  // Gibraltar (GIB) – po Lincoln Red Imps (z CL)
  { name: "Europa FC", country: "GIB", tier: 4, colors: ["#000000", "#FFFFFF", "#FFD700"], stadium: "Victoria Stadium", capacity: 5e3, reputation: 1 },
  { name: "Bruno's Magpies", country: "GIB", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Victoria Stadium", capacity: 5e3, reputation: 1 },
  { name: "Manchester 62", country: "GIB", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Victoria Stadium", capacity: 5e3, reputation: 1 },
  // Liechtenstein (LIE) – tylko jedna liga (w Szwajcarii), ale pucharowicze
  { name: "FC Vaduz", country: "LIE", tier: 4, colors: ["#FF0000", "#000000", "#FFFFFF"], stadium: "Rheinpark Stadion", capacity: 7838, reputation: 2 },
  { name: "USV Eschen/Mauren", country: "LIE", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Sportpark Eschen-Mauren", capacity: 2e3, reputation: 2 },
  { name: "FC Balzers", country: "LIE", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Sportanlage Rheinau", capacity: 2e3, reputation: 2 },
  // San Marino (SMR) – najsłabsza federacja w Europie
  { name: "La Fiorita", country: "SMR", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Stadio Olimpico di Serravalle", capacity: 7e3, reputation: 1 },
  { name: "Tre Penne", country: "SMR", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadio Olimpico di Serravalle", capacity: 7e3, reputation: 1 },
  { name: "Virtus Acquaviva", country: "SMR", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Stadio Olimpico di Serravalle", capacity: 7e3, reputation: 1 },
  // Wyspy Owcze (FRO) – po KÍ Klaksvík (z CL)
  { name: "HB T\xF3rshavn", country: "FRO", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "T\xF3rsv\xF8llur", capacity: 6e3, reputation: 1 },
  { name: "V\xEDkingur G\xF8ta", country: "FRO", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Sarpuger\xF0i", capacity: 3e3, reputation: 1 },
  { name: "B36 T\xF3rshavn", country: "FRO", tier: 4, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Gundadalur", capacity: 5e3, reputation: 1 },
  // Niemcy (GER) – mid-table Bundesliga (po Bayern, Dortmund, Leverkusen, RB Lipsk, Union Berlin, Gladbach z CL)
  { name: "VfB Stuttgart", country: "GER", tier: 2, colors: ["#FFFFFF", "#FF0000", "#000000"], stadium: "MHPArena", capacity: 60449, reputation: 13 },
  { name: "Eintracht Frankfurt", country: "GER", tier: 2, colors: ["#000000", "#FFFFFF", "#E1001A"], stadium: "Deutsche Bank Park", capacity: 51500, reputation: 13 },
  // już był w CL, ale jeśli chcesz mid
  { name: "SC Freiburg", country: "GER", tier: 2, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Europa-Park Stadion", capacity: 34700, reputation: 12 },
  { name: "1. FC K\xF6ln", country: "GER", tier: 2, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "RheinEnergieStadion", capacity: 5e4, reputation: 12 },
  { name: "VfL Wolfsburg", country: "GER", tier: 2, colors: ["#00A650", "#FFFFFF", "#000000"], stadium: "Volkswagen Arena", capacity: 3e4, reputation: 12 },
  // Hiszpania (ESP) – mid-table La Liga (po Real, Barca, Atletico, Athletic, Sevilla, Villarreal z CL)
  { name: "Real Sociedad", country: "ESP", tier: 2, colors: ["#0033A0", "#FFFFFF", "#FF0000"], stadium: "Reale Arena", capacity: 4e4, reputation: 14 },
  { name: "Valencia CF", country: "ESP", tier: 2, colors: ["#FFFFFF", "#FF0000", "#000000"], stadium: "Mestalla", capacity: 49e3, reputation: 13 },
  { name: "Real Betis", country: "ESP", tier: 2, colors: ["#006633", "#FFFFFF", "#FFD700"], stadium: "Benito Villamar\xEDn", capacity: 60720, reputation: 13 },
  { name: "Osasuna", country: "ESP", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "El Sadar", capacity: 23189, reputation: 12 },
  // Słowenia (SVN) – mocne z PrvaLiga Telemach
  { name: "NK Koper", country: "SVN", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "\u0160tadion Bonifika", capacity: 4010, reputation: 8 },
  { name: "NK Aluminij", country: "SVN", tier: 3, colors: ["#FFFFFF", "#000000", "#FF0000"], stadium: "Aluminij Sports Park", capacity: 1200, reputation: 8 },
  { name: "NS Mura", country: "SVN", tier: 3, colors: ["#000000", "#FFFFFF", "#FFD700"], stadium: "Fazanerija City Stadium", capacity: 4120, reputation: 8 },
  // Serbia (SRB) – mocne z SuperLiga Srbije (po Crvena Zvezda, Partizan)
  { name: "FK Vojvodina Novi Sad", country: "SRB", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Kara\u0111or\u0111e Stadium", capacity: 14458, reputation: 8 },
  { name: "FK Novi Pazar", country: "SRB", tier: 3, colors: ["#006633", "#FFFFFF", "#FFD700"], stadium: "Stadion Novi Pazar", capacity: 12e3, reputation: 8 },
  { name: "Partizan Belgrad", country: "SRB", tier: 3, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Stadion Partizana", capacity: 32e3, reputation: 10 }
];
var generateELClubId = (name) => {
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  return `EU_EL_${slug}`;
};

// resources/static_db/clubs/ConferenceLeagueTeams.tsx
var RAW_CONFERENCE_LEAGUE_CLUBS = [
  // Andora (AND) – najsłabsza federacja
  { name: "FC Santa Coloma", country: "AND", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Camp Nou Municipal d'Andorra", capacity: 500, reputation: 1 },
  { name: "Inter Club d'Escaldes", country: "AND", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Camp de Futbol d'Aixovall", capacity: 1e3, reputation: 1 },
  { name: "Atl\xE8tic Club d'Escaldes", country: "AND", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Camp de Futbol d'Aixovall", capacity: 1e3, reputation: 1 },
  // Gibraltar (GIB)
  { name: "Europa FC", country: "GIB", tier: 4, colors: ["#000000", "#FFFFFF", "#FFD700"], stadium: "Victoria Stadium", capacity: 5e3, reputation: 2 },
  { name: "Bruno's Magpies", country: "GIB", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Victoria Stadium", capacity: 5e3, reputation: 2 },
  // Liechtenstein (LIE) – tylko puchar Liechtensteinu, kluby grają w szwajcarskiej lidze
  { name: "USV Eschen/Mauren", country: "LIE", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Sportpark Eschen-Mauren", capacity: 2e3, reputation: 3 },
  { name: "FC Balzers", country: "LIE", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Sportanlage Rheinau", capacity: 2e3, reputation: 2 },
  { name: "FC Ruggell", country: "LIE", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Rheinpark Stadion", capacity: 7838, reputation: 2 },
  // San Marino (SMR)
  { name: "Tre Penne", country: "SMR", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadio Olimpico di Serravalle", capacity: 7e3, reputation: 1 },
  { name: "Virtus Acquaviva", country: "SMR", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Stadio Olimpico di Serravalle", capacity: 7e3, reputation: 1 },
  { name: "Folgore/Falciano", country: "SMR", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Stadio Olimpico di Serravalle", capacity: 7e3, reputation: 1 },
  // Wyspy Owcze (FRO) – bardzo nisko, nawet HB i Víkingur rzadko przechodzą rundy
  { name: "HB T\xF3rshavn", country: "FRO", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "T\xF3rsv\xF8llur", capacity: 6e3, reputation: 1 },
  { name: "V\xEDkingur G\xF8ta", country: "FRO", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Sarpuger\xF0i", capacity: 3e3, reputation: 1 },
  { name: "B36 T\xF3rshavn", country: "FRO", tier: 4, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Gundadalur", capacity: 5e3, reputation: 1 },
  // Malta (MLT)
  { name: "Floriana FC", country: "MLT", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Independence Ground", capacity: 3e3, reputation: 3 },
  { name: "Valletta FC", country: "MLT", tier: 4, colors: ["#FFFFFF", "#FF0000", "#000000"], stadium: "Centenary Stadium", capacity: 2e3, reputation: 2 },
  { name: "G\u017Cira United", country: "MLT", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Centenary Stadium", capacity: 2e3, reputation: 2 },
  // Luksemburg (LUX)
  { name: "UNA Strassen", country: "LUX", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Complexe Sportif Jean Wirtz", capacity: 2e3, reputation: 3 },
  { name: "FC Progr\xE8s Niederkorn", country: "LUX", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Stade Jos Haupert", capacity: 1800, reputation: 2 },
  { name: "Fola Esch", country: "LUX", tier: 4, colors: ["#000000", "#FFFFFF", "#FFD700"], stadium: "Stade \xC9mile Mayrisch", capacity: 3826, reputation: 2 },
  // Kosowo (KOS)
  { name: "KF Llapi", country: "KOS", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Fadil Vokrri Stadium", capacity: 13500, reputation: 5 },
  { name: "KF Malisheva", country: "KOS", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Malisheva Stadium", capacity: 2e3, reputation: 5 },
  { name: "KF Dukagjini", country: "KOS", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "P\xEBrparim Tha\xE7i Stadium", capacity: 2e3, reputation: 5 },
  // Łotwa (LAT)
  { name: "FK Auda", country: "LAT", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Skonto Stadium", capacity: 8083, reputation: 5 },
  { name: "FK Liep\u0101ja", country: "LAT", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Daugava Stadium Liep\u0101ja", capacity: 8e3, reputation: 5 },
  { name: "FK Metta", country: "LAT", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Daugava Stadium", capacity: 10800, reputation: 5 },
  // Litwa (LTU)
  { name: "FK Hegelmann", country: "LTU", tier: 4, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Hegelmann Arena", capacity: 3500, reputation: 5 },
  { name: "FK D\u017Eiugas Tel\u0161iai", country: "LTU", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Tel\u0161iai Central Stadium", capacity: 2400, reputation: 6 },
  // Albania (ALB) – po Tirana, Egnatia, Vllaznia (już w EL)
  { name: "KF Teuta Durr\xEBs", country: "ALB", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadiumi Niko Dovana", capacity: 12e3, reputation: 4 },
  { name: "KF Bylis Ballsh", country: "ALB", tier: 4, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Adush Mu\xE7a Stadium", capacity: 5e3, reputation: 4 },
  { name: "KF La\xE7i", country: "ALB", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Stadiumi La\xE7i", capacity: 5e3, reputation: 4 },
  // Armenia (ARM) – po Ararat-Armenia, Noah, Pyunik (już w EL)
  { name: "FC Urartu", country: "ARM", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Urartu Stadium", capacity: 7e3, reputation: 4 },
  { name: "FC Alashkert", country: "ARM", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Alashkert Stadium", capacity: 6850, reputation: 4 },
  { name: "FC Van", country: "ARM", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Charentsavan City Stadium", capacity: 5e3, reputation: 4 },
  // Austria (AUT) – po Rapid, Austria Wiedeń, LASK (już w EL)
  { name: "SCR Altach", country: "AUT", tier: 3, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Cashpoint Arena", capacity: 8500, reputation: 8 },
  { name: "TSV Hartberg", country: "AUT", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Profertil Arena Hartberg", capacity: 4635, reputation: 8 },
  { name: "Wolfsberger AC", country: "AUT", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Lavanttal-Arena", capacity: 8100, reputation: 8 },
  // Azerbejdżan (AZE) – po Neftçi, Sabah, Zira (już w EL)
  { name: "Sumgayit FK", country: "AZE", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Kapital Bank Arena", capacity: 1600, reputation: 4 },
  { name: "Kapaz PFK", country: "AZE", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Ganja City Stadium", capacity: 15e3, reputation: 4 },
  { name: "Sabail FK", country: "AZE", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Bayil Arena", capacity: 3e3, reputation: 4 },
  // Białoruś (BLR)
  { name: "FK Isloch Mi\u0144sk", country: "BLR", tier: 4, colors: ["#FFFFFF", "#0000FF", "#FF0000"], stadium: "Stadion FC Minsk", capacity: 3100, reputation: 6 },
  { name: "FK Slutsk", country: "BLR", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Stadion Haradski", capacity: 2150, reputation: 5 },
  { name: "FK Smolevichi", country: "BLR", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Ozyorny Stadium", capacity: 1500, reputation: 5 },
  // Bośnia i Hercegowina (BIH)
  { name: "FK Igman Konjic", country: "BIH", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Gradski stadion Igman", capacity: 5e3, reputation: 6 },
  { name: "FK Posu\u0161je", country: "BIH", tier: 4, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Stadion Mokri Dolac", capacity: 8e3, reputation: 5 },
  { name: "FK Sloga Meridian", country: "BIH", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Stadion Tu\u0161anj", capacity: 7e3, reputation: 5 },
  // Bułgaria (BUL)
  { name: "FK Arda Kardzhali", country: "BUL", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Arena Arda", capacity: 12500, reputation: 6 },
  { name: "FK Beroe Stara Zagora", country: "BUL", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Beroe Stadium", capacity: 12128, reputation: 6 },
  { name: "FK Hebar Pazardzhik", country: "BUL", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Stadion Georgi Benkovski", capacity: 13128, reputation: 5 },
  { name: "PFC Slavia Sofia", country: "BUL", tier: 3, colors: ["#FFFFFF", "#000000", "#FF0000"], stadium: "Ovcha Kupel Stadium", capacity: 25e3, reputation: 6 },
  { name: "PFC Lokomotiv Sofia 1929", country: "BUL", tier: 3, colors: ["#ca0707", "#000000", "#FF0000"], stadium: "Lokomotiv Stadium Sofia", capacity: 22e3, reputation: 6 },
  { name: "PFC Septemvri Sofia", country: "BUL", tier: 3, colors: ["#FFFFFF", "#000000", "#FF0000"], stadium: "Stadion Dragalevtsi", capacity: 1e3, reputation: 5 },
  // Chorwacja (CRO)
  { name: "NK Istra 1961", country: "CRO", tier: 3, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Stadion Aldo Drosina", capacity: 9921, reputation: 6 },
  { name: "NK \u0160ibenik", country: "CRO", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion \u0160ubi\u0107evac", capacity: 3928, reputation: 5 },
  { name: "HNK Gorica", country: "CRO", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Stadion HNK Gorica", capacity: 4826, reputation: 5 },
  // Cypr (CYP) – 
  { name: "Anorthosis Famagusta", country: "CYP", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Antonis Papadopoulos Stadium", capacity: 10800, reputation: 6 },
  { name: "Apollon Limassol", country: "CYP", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Tsirio Stadium", capacity: 13261, reputation: 6 },
  { name: "Pafos FC", country: "CYP", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Stadio Stelios Kyriakides", capacity: 9394, reputation: 5 },
  // Czechy (CZE) 
  { name: "FK Jablonec", country: "CZE", tier: 3, colors: ["#006633", "#FFFFFF", "#FFD700"], stadium: "Stadion St\u0159elnice", capacity: 6108, reputation: 6 },
  { name: "FK Teplice", country: "CZE", tier: 3, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Na St\xEDnadlech", capacity: 18221, reputation: 5 },
  { name: "FK Mlad\xE1 Boleslav", country: "CZE", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Lokotrans Ar\xE9na", capacity: 5e3, reputation: 5 },
  // Dania (DEN) 
  { name: "Aarhus GF", country: "DEN", tier: 3, colors: ["#FFFFFF", "#000000", "#FF0000"], stadium: "Ceres Park & Arena", capacity: 19433, reputation: 6 },
  { name: "Randers FC", country: "DEN", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Cepheus Park Randers", capacity: 10300, reputation: 5 },
  { name: "Viborg FF", country: "DEN", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Viborg Stadion", capacity: 9600, reputation: 5 },
  // Estonia (EST) 
  { name: "JK Tammeka Tartu", country: "EST", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Tamme staadion", capacity: 1600, reputation: 5 },
  { name: "JK Narva Trans", country: "EST", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Kreenholmi staadion", capacity: 1800, reputation: 5 },
  { name: "FC Kuressaare", country: "EST", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Kuressaare linnastaadion", capacity: 2e3, reputation: 4 },
  // Finlandia (FIN) 
  { name: "FC Honka Espoo", country: "FIN", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Tapiolan Urheilupuisto", capacity: 6e3, reputation: 6 },
  { name: "FC Inter Turku", country: "FIN", tier: 3, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Veritas Stadion", capacity: 9300, reputation: 6 },
  { name: "AC Oulu", country: "FIN", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Raatin stadion", capacity: 4900, reputation: 5 },
  // Gruzja (GEO) 
  { name: "FC Telavi", country: "GEO", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Municipal Stadium Telavi", capacity: 12e3, reputation: 6 },
  { name: "FC Samtredia", country: "GEO", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Erosi Manjgaladze Stadium", capacity: 15e3, reputation: 5 },
  { name: "FC Gagra", country: "GEO", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Gagra Stadium", capacity: 2e3, reputation: 5 },
  // Irlandia (IRL) 
  { name: "Dundalk FC", country: "IRL", tier: 4, colors: ["#FFFFFF", "#000000", "#FF0000"], stadium: "Oriel Park", capacity: 4500, reputation: 6 },
  { name: "Sligo Rovers", country: "IRL", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "The Showgrounds", capacity: 5500, reputation: 5 },
  { name: "Waterford FC", country: "IRL", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "RSC", capacity: 5500, reputation: 5 },
  // Irlandia Północna (NIR)
  { name: "Cliftonville FC", country: "NIR", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Solitude", capacity: 2462, reputation: 6 },
  { name: "Crusaders FC", country: "NIR", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Seaview", capacity: 3383, reputation: 5 },
  { name: "Glentoran FC", country: "NIR", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "The Oval", capacity: 26556, reputation: 5 },
  // Islandia (ISL) – po Víkingur, Breiðablik, FH, Stjarnan (już w CL/EL)
  { name: "KR Reykjav\xEDk", country: "ISL", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "KR-v\xF6llur", capacity: 6450, reputation: 6 },
  { name: "Valur Reykjav\xEDk", country: "ISL", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Hl\xED\xF0arendi", capacity: 3e3, reputation: 6 },
  { name: "Fram Reykjav\xEDk", country: "ISL", tier: 4, colors: ["#FFFFFF", "#000000", "#FF0000"], stadium: "Framv\xF6llur \xDAlfars\xE1rdal", capacity: 1500, reputation: 5 },
  // Izrael (ISR) – kluby z Ligat ha'Al (najwyższa liga)
  { name: "Hapoel Tel Aviv", country: "ISR", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Bloomfield Stadium", capacity: 29300, reputation: 6 },
  { name: "Ironi Tiberias", country: "ISR", tier: 4, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Tiberias Municipal Stadium", capacity: 8e3, reputation: 5 },
  { name: "Maccabi Bnei Raina", country: "ISR", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Green Stadium", capacity: 3800, reputation: 5 },
  // Kazachstan (KAZ) – kluby z Premier League (najwyższa liga)
  { name: "FC Aktobe", country: "KAZ", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Central Stadium Aktobe", capacity: 13500, reputation: 7 },
  { name: "FC Kairat Almaty", country: "KAZ", tier: 4, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Central Stadium Almaty", capacity: 23804, reputation: 6 },
  { name: "FC Ordabasy Shymkent", country: "KAZ", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Kazybek-Bi Stadium", capacity: 16400, reputation: 6 },
  // Macedonia Północna (MKD)
  { name: "FK Tikvesh Kavadarci", country: "MKD", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Gradski Stadion Kavadarci", capacity: 7500, reputation: 6 },
  { name: "FK Shkupi", country: "MKD", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "\u010Cair Stadium", capacity: 6e3, reputation: 6 },
  { name: "KF Gostivar", country: "MKD", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Gostivar Stadium", capacity: 1e3, reputation: 5 },
  // Mołdawia (MDA) – po Sheriff, Petrocub, Zimbru (już w CL/EL)
  { name: "FC Milsami Orhei", country: "MDA", tier: 4, colors: ["#0033A0", "#FFFFFF", "#FFCC00"], stadium: "Complexul Sportiv Raional Orhei", capacity: 2500, reputation: 6 },
  { name: "FC Spartanii Selemet", country: "MDA", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Stadionul Orhei", capacity: 2500, reputation: 5 },
  { name: "FC Flore\u0219ti", country: "MDA", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Stadionul Flore\u0219ti", capacity: 1e3, reputation: 5 },
  // Niemcy 
  { name: "1. FC Kaiserslautern", country: "GER", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Fritz-Walter-Stadion", capacity: 49780, reputation: 10 },
  { name: "Hannover 96", country: "GER", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "HDI-Arena", capacity: 49200, reputation: 10 },
  { name: "Karlsruher SC", country: "GER", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "BBBank Wildpark", capacity: 28762, reputation: 9 },
  { name: "St. Pauli", country: "GER", tier: 3, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Millerntor-Stadion", capacity: 29e3, reputation: 9 },
  { name: "1. FC N\xFCrnberg", country: "GER", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Max-Morlock-Stadion", capacity: 5e4, reputation: 9 },
  { name: "Eintracht Braunschweig", country: "GER", tier: 3, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Eintracht-Stadion", capacity: 25e3, reputation: 8 },
  { name: "Mainz 05", country: "GER", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Mewa Arena", capacity: 34e3, reputation: 8 },
  // Norwegia (NOR) – tier 4
  { name: "Viking FK", country: "NOR", tier: 3, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "SR-Bank Arena", capacity: 15600, reputation: 6 },
  { name: "Sarpsborg 08 FF", country: "NOR", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Sarpsborg Stadion", capacity: 8e3, reputation: 5 },
  { name: "HamKam", country: "NOR", tier: 3, colors: ["#FFFFFF", "#000000", "#FF0000"], stadium: "Briskeby Arena", capacity: 7800, reputation: 5 },
  // Portugalia (POR) – tier 3, mid-table / niższe Primeira Liga
  { name: "Gil Vicente FC", country: "POR", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Est\xE1dio Cidade de Barcelos", capacity: 12046, reputation: 8 },
  { name: "Estoril Praia", country: "POR", tier: 3, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Est\xE1dio Ant\xF3nio Coimbra da Mota", capacity: 8e3, reputation: 9 },
  { name: "Rio Ave FC", country: "POR", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Est\xE1dio dos Arcos", capacity: 9065, reputation: 9 },
  // Rumunia (ROU) – tier 4
  { name: "FC Hermannstadt", country: "ROU", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Municipal Stadium Sibiu", capacity: 14400, reputation: 6 },
  { name: "FC UTA Arad", country: "ROU", tier: 3, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Stadionul Francisc Neuman", capacity: 12800, reputation: 5 },
  { name: "FC Politehnica Ia\u0219i", country: "ROU", tier: 3, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Stadionul Emil Alexandrescu", capacity: 12800, reputation: 5 },
  // Szkocja (SCO)
  { name: "Livingston FC", country: "SCO", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Tony Macaroni Arena", capacity: 9528, reputation: 6 },
  { name: "Raith Rovers", country: "SCO", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Stark's Park", capacity: 8798, reputation: 5 },
  { name: "Partick Thistle", country: "SCO", tier: 3, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Firhill Stadium", capacity: 10102, reputation: 5 },
  // Słowacja (SVK)
  { name: "FK Ko\u0161ice", country: "SVK", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Futbal Tatran Ar\xE9na", capacity: 12458, reputation: 6 },
  { name: "MFK Zempl\xEDn Michalovce", country: "SVK", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "\u0160tadi\xF3n pod Zoborom", capacity: 7200, reputation: 5 },
  { name: "MFK Skalica", country: "SVK", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Futbalov\xFD \u0161tadi\xF3n Skalica", capacity: 4e3, reputation: 5 },
  // Szwecja (SWE)
  { name: "IK Sirius", country: "SWE", tier: 3, colors: ["#0000FF", "#FFFFFF", "#000000"], stadium: "Studenternas IP", capacity: 10522, reputation: 6 },
  { name: "IF Brommapojkarna", country: "SWE", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Grimsta IP", capacity: 5e3, reputation: 5 },
  { name: "Degerfors IF", country: "SWE", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Stora Valla", capacity: 12500, reputation: 5 },
  // Szwajcaria (SUI)
  { name: "FC Winterthur", country: "SUI", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Sch\xFCtzenwiese", capacity: 8500, reputation: 6 },
  { name: "FC Sion", country: "SUI", tier: 3, colors: ["#FFFFFF", "#000000", "#FF0000"], stadium: "Stade de Tourbillon", capacity: 14283, reputation: 6 },
  { name: "FC Schaffhausen", country: "SUI", tier: 3, colors: ["#000000", "#FFFFFF", "#FFD700"], stadium: "Wefox Arena Schaffhausen", capacity: 8200, reputation: 5 },
  // Turcja (TUR)
  { name: "Konyaspor", country: "TUR", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Konya B\xFCy\xFCk\u015Fehir Stadium", capacity: 42076, reputation: 6 },
  { name: "Adana Demirspor", country: "TUR", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Yeni Adana Stadium", capacity: 33500, reputation: 6 },
  { name: "Alanyaspor", country: "TUR", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Bah\xE7e\u015Fehir Okullar\u0131 Stadium", capacity: 10842, reputation: 5 },
  { name: "Gaziantep FK", country: "TUR", tier: 3, colors: ["#e41919", "#FFFFFF", "#000000"], stadium: "Gaziantep Atat\xFCrk Stadium", capacity: 42222, reputation: 6 },
  { name: "Kocaelispor", country: "TUR", tier: 3, colors: ["#00590c", "#000000", "#ffffff"], stadium: "\u0130zmit Stadium", capacity: 34400, reputation: 5 },
  // Ukraina (UKR)
  { name: "FC Oleksandriya", country: "UKR", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "CSC Nika Stadium", capacity: 5682, reputation: 6 },
  { name: "FC Veres Rivne", country: "UKR", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Avanhard Stadium", capacity: 7200, reputation: 5 },
  { name: "FC Inhulets Petrove", country: "UKR", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Inhulets Stadium", capacity: 1720, reputation: 5 },
  // Walia (WAL)
  { name: "Connah's Quay Nomads", country: "WAL", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Deeside Stadium", capacity: 1500, reputation: 5 },
  { name: "Bala Town FC", country: "WAL", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Maes Tegid", capacity: 3e3, reputation: 4 },
  { name: "Caernarfon Town", country: "WAL", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "The Oval", capacity: 3e3, reputation: 4 },
  // Rosja (RUS)
  { name: "FK Ural Jekaterynburg", country: "RUS", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Central Stadium", capacity: 35061, reputation: 6 },
  { name: "FK Orenburg", country: "RUS", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Gazovik Stadium", capacity: 7500, reputation: 5 },
  { name: "FK Akhmat Grozny", country: "RUS", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Akhmat-Arena", capacity: 30597, reputation: 6 },
  // Włochy (ITA) – tier 3, reputacja 8–11 (mid/niższe Serie A lub spadkowicze / solidni z Serie B)
  { name: "Torino FC", country: "ITA", tier: 3, colors: ["#FF0000", "#000000", "#FFFFFF"], stadium: "Stadio Olimpico Grande Torino", capacity: 27994, reputation: 10 },
  { name: "Genoa CFC", country: "ITA", tier: 3, colors: ["#FF0000", "#000000", "#FFFFFF"], stadium: "Stadio Luigi Ferraris", capacity: 36585, reputation: 9 },
  { name: "Palermo", country: "ITA", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Stadio Renzo Barbera", capacity: 36e3, reputation: 8 },
  // Węgry (HUN) – tier 4
  { name: "MTK Budapest", country: "HUN", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Hidegkuti N\xE1ndor Stadion", capacity: 5322, reputation: 6 },
  { name: "Di\xF3sgy\u0151ri VTK", country: "HUN", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Di\xF3sgy\u0151ri Stadion", capacity: 9680, reputation: 5 },
  { name: "Kecskem\xE9ti TE", country: "HUN", tier: 3, colors: ["#006633", "#FFFFFF", "#FFD700"], stadium: "Sz\xE9kt\xF3i Stadion", capacity: 6300, reputation: 5 },
  // Anglia (ENG) – najniżej sklasyfikowane w Premier League w danym sezonie
  { name: "Ipswich Town", country: "ENG", tier: 3, colors: ["#0000FF", "#FFFFFF", "#000000"], stadium: "Portman Road", capacity: 30311, reputation: 10 },
  { name: "Southampton FC", country: "ENG", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "St Mary's Stadium", capacity: 32384, reputation: 10 },
  { name: "Leicester City", country: "ENG", tier: 3, colors: ["#0033A0", "#FFFFFF", "#FFCC00"], stadium: "King Power Stadium", capacity: 32312, reputation: 11 },
  { name: "Leeds United", country: "ENG", tier: 3, colors: ["#FFFFFF", "#1E90FF", "#FFD700"], stadium: "Elland Road", capacity: 53e3, reputation: 10 },
  { name: "West Ham United", country: "ENG", tier: 3, colors: ["#7A263A", "#FFFFFF", "#000000"], stadium: "London Stadium", capacity: 6e4, reputation: 10 },
  { name: "Fulham", country: "ENG", tier: 3, colors: ["#FFFFFF", "#000000", "#FF0000"], stadium: "Craven Cottage", capacity: 25700, reputation: 9 },
  { name: "Sunderland AFC", country: "ENG", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Stadium of Light", capacity: 49e3, reputation: 9 },
  { name: "Bournemouth AFC", country: "ENG", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Vitality Stadium", capacity: 11e3, reputation: 8 },
  { name: "QPR", country: "ENG", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Loftus Road", capacity: 18800, reputation: 8 },
  { name: "Hull City", country: "ENG", tier: 3, colors: ["#ff8800", "#FFFFFF", "#000000"], stadium: "KCOM Stadium", capacity: 25e3, reputation: 8 },
  // Belgia (BEL) – niższe miejsce w Jupiler Pro League
  { name: "KVC Westerlo", country: "BEL", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Het Kuipje", capacity: 8035, reputation: 6 },
  { name: "KV Mechelen", country: "BEL", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "AFAS Stadion", capacity: 16700, reputation: 7 },
  { name: "Sint-Truidense VV", country: "BEL", tier: 3, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Stayen", capacity: 14500, reputation: 7 },
  // Czarnogóra (MNE) – najwyższa liga (1. CFL)
  { name: "FK Jezero Plav", country: "MNE", tier: 4, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Stadion pod Golubinjem", capacity: 5e3, reputation: 5 },
  { name: "FK Arsenal Tivat", country: "MNE", tier: 4, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Stadion u Parku", capacity: 2e3, reputation: 5 },
  { name: "OFK Petrovac", country: "MNE", tier: 4, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stadion pod Malim brdom", capacity: 1630, reputation: 4 },
  // Francja (FRA) – niższe miejsce w Ligue 1 / Ligue 2 spadkowicze
  { name: "Le Havre AC", country: "FRA", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stade Oceane", capacity: 25178, reputation: 7 },
  { name: "Stade de Reims", country: "FRA", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Stade Auguste-Delaune", capacity: 21684, reputation: 7 },
  { name: "FC Lorient", country: "FRA", tier: 3, colors: ["#FF6600", "#000000", "#FFFFFF"], stadium: "Stade du Moustoir", capacity: 18970, reputation: 7 },
  { name: "Strasbourg", country: "FRA", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Stade de la Meinau", capacity: 29e3, reputation: 8 },
  { name: "Stade Rennais", country: "FRA", tier: 3, colors: ["#FF0000", "#000000", "#ffffff"], stadium: "Stade de la Mosqu\xE9e", capacity: 38512, reputation: 8 },
  // Grecja (GRE) – niższe miejsce w Super League
  { name: "Panetolikos GFS", country: "GRE", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "Panetolikos Stadium", capacity: 7321, reputation: 6 },
  { name: "Panserraikos FC", country: "GRE", tier: 3, colors: ["#FFFFFF", "#000000", "#FF0000"], stadium: "Serres Municipal Stadium", capacity: 9500, reputation: 7 },
  { name: "Kallithea FC", country: "GRE", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FFD700"], stadium: "Grigorios Lambrakis Stadium", capacity: 4e3, reputation: 7 },
  // Hiszpania (ESP) – niższe miejsce w La Liga
  { name: "CD Legan\xE9s", country: "ESP", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Estadio Municipal de Butarque", capacity: 12450, reputation: 7 },
  { name: "Real Valladolid", country: "ESP", tier: 3, colors: ["#FFFFFF", "#000000", "#FF6600"], stadium: "Estadio Jos\xE9 Zorrilla", capacity: 26512, reputation: 8 },
  { name: "UD Las Palmas", country: "ESP", tier: 3, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Estadio Gran Canaria", capacity: 32200, reputation: 8 },
  { name: "Espanyol FC", country: "ESP", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Estadio de Cornell\xE0-El Prat", capacity: 4e4, reputation: 9 },
  { name: "Rayo Vallecano", country: "ESP", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Campo de F\xFAtbol de Vallecas", capacity: 14950, reputation: 8 },
  { name: "Mallorca FC", country: "ESP", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "Visit Mallorca Stadium", capacity: 23e3, reputation: 8 },
  // Holandia (NED) – niższe miejsce w Eredivisie
  { name: "FC Volendam", country: "NED", tier: 3, colors: ["#FF6600", "#FFFFFF", "#000000"], stadium: "Kras Stadion", capacity: 7384, reputation: 6 },
  { name: "Almere City FC", country: "NED", tier: 3, colors: ["#0000FF", "#FFFFFF", "#FF0000"], stadium: "Yanmar Stadion", capacity: 4501, reputation: 5 },
  { name: "RKC Waalwijk", country: "NED", tier: 3, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "Mandemakers Stadion", capacity: 7500, reputation: 5 },
  // Słowenia (SVN)
  { name: "NK Bravo", country: "SVN", tier: 3, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "\u0160tadion Sto\u017Eice", capacity: 16152, reputation: 6 },
  { name: "NK Celje", country: "SVN", tier: 3, colors: ["#0057B8", "#FFD200", "#0057B8"], stadium: "Stadion Z'de\u017Eele", capacity: 13059, reputation: 6 },
  { name: "NK Dom\u017Eale", country: "SVN", tier: 3, colors: ["#FFD700", "#000000", "#FFFFFF"], stadium: "\u0160portni park Dom\u017Eale", capacity: 2341, reputation: 5 },
  // Serbia (SRB)
  { name: "FK \u010Cukari\u010Dki", country: "SRB", tier: 3, colors: ["#FFFFFF", "#000000", "#FF0000"], stadium: "Stadion na Banovom brdu", capacity: 4070, reputation: 6 },
  { name: "FK Radni\u010Dki 1923", country: "SRB", tier: 3, colors: ["#FF0000", "#FFFFFF", "#000000"], stadium: "\u010Cika Da\u010Da Stadium", capacity: 15100, reputation: 6 },
  { name: "FK TSC Ba\u010Dka Topola", country: "SRB", tier: 3, colors: ["#006633", "#FFFFFF", "#000000"], stadium: "TSC Arena", capacity: 4500, reputation: 6 }
];
var generateCONFClubId = (name) => {
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  return `EU_CONF_${slug}`;
};

// resources/static_db/clubs/SouthamericanTeams.tsx
var CLUBS_SOUTH_AMERICA = [
  // Argentyna
  {
    name: "River Plate",
    country: "ARG",
    tier: 1,
    colors: ["#FFFFFF", "#E30613", "#000000"],
    stadium: "Estadio M\xE1s Monumental",
    capacity: 85018,
    reputation: 16
  },
  {
    name: "Boca Juniors",
    country: "ARG",
    tier: 1,
    colors: ["#003087", "#F5C518", "#FFFFFF"],
    stadium: "La Bombonera",
    capacity: 57200,
    reputation: 15
  },
  {
    name: "Racing Club",
    country: "ARG",
    tier: 2,
    colors: ["#003087", "#FFFFFF", "#E30613"],
    stadium: "Estadio Presidente Per\xF3n",
    capacity: 55e3,
    reputation: 13
  },
  {
    name: "Independiente",
    country: "ARG",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Estadio Libertadores de Am\xE9rica",
    capacity: 42e3,
    reputation: 15
  },
  {
    name: "San Lorenzo",
    country: "ARG",
    tier: 2,
    colors: ["#E30613", "#000000", "#FFFFFF"],
    stadium: "Estadio Pedro Bidegain",
    capacity: 47e3,
    reputation: 14
  },
  // Brazylia
  {
    name: "Flamengo",
    country: "BRA",
    tier: 1,
    colors: ["#E30613", "#000000", "#F5C518"],
    stadium: "Maracan\xE3",
    capacity: 78838,
    reputation: 16
  },
  {
    name: "Palmeiras",
    country: "BRA",
    tier: 1,
    colors: ["#006633", "#FFFFFF"],
    stadium: "Allianz Parque",
    capacity: 43713,
    reputation: 15
  },
  {
    name: "S\xE3o Paulo",
    country: "BRA",
    tier: 2,
    colors: ["#E30613", "#FFFFFF", "#000000"],
    stadium: "Morumbi",
    capacity: 66795,
    reputation: 15
  },
  {
    name: "Fluminense",
    country: "BRA",
    tier: 2,
    colors: ["#E30613", "#008000", "#FFFFFF"],
    stadium: "Maracan\xE3",
    capacity: 78838,
    reputation: 16
  },
  {
    name: "Botafogo",
    country: "BRA",
    tier: 2,
    colors: ["#000000", "#FFFFFF"],
    stadium: "Nilton Santos",
    capacity: 46e3,
    reputation: 15
  },
  {
    name: "Atl\xE9tico Mineiro",
    country: "BRA",
    tier: 2,
    colors: ["#000000", "#FFFFFF", "#E30613"],
    stadium: "Arena MRV",
    capacity: 47e3,
    reputation: 15
  },
  // Urugwaj
  {
    name: "Pe\xF1arol",
    country: "URU",
    tier: 2,
    colors: ["#000000", "#F5C518"],
    stadium: "Estadio Campe\xF3n del Siglo",
    capacity: 42e3,
    reputation: 15
  },
  {
    name: "Nacional",
    country: "URU",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Estadio Gran Parque Central",
    capacity: 34e3,
    reputation: 14
  },
  // Kolumbia
  {
    name: "Atl\xE9tico Nacional",
    country: "COL",
    tier: 2,
    colors: ["#008000", "#FFFFFF"],
    stadium: "Atanasio Girardot",
    capacity: 40500,
    reputation: 13
  },
  {
    name: "Millonarios",
    country: "COL",
    tier: 2,
    colors: ["#003087", "#FFFFFF"],
    stadium: "El Camp\xEDn",
    capacity: 36e3,
    reputation: 13
  },
  // Ekwador
  {
    name: "LDU Quito",
    country: "ECU",
    tier: 2,
    colors: ["#003087", "#FFFFFF", "#E30613"],
    stadium: "Rodrigo Paz Delgado",
    capacity: 41083,
    reputation: 13
  },
  {
    name: "Barcelona SC",
    country: "ECU",
    tier: 2,
    colors: ["#F5C518", "#003087"],
    stadium: "Monumental Banco Pichincha",
    capacity: 57e3,
    reputation: 12
  },
  {
    name: "Independiente del Valle",
    country: "ECU",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Banco Guayaquil",
    capacity: 12e3,
    reputation: 13
  },
  // Pozostałe kraje
  {
    name: "Olimpia",
    country: "PAR",
    tier: 2,
    colors: ["#000000", "#FFFFFF"],
    stadium: "Defensores del Chaco",
    capacity: 42e3,
    reputation: 11
  },
  {
    name: "Colo-Colo",
    country: "CHI",
    tier: 2,
    colors: ["#000000", "#FFFFFF"],
    stadium: "Monumental David Arellano",
    capacity: 47347,
    reputation: 12
  },
  {
    name: "Universitario",
    country: "PER",
    tier: 4,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Estadio Monumental",
    capacity: 80093,
    reputation: 10
  },
  {
    name: "Bol\xEDvar",
    country: "BOL",
    tier: 2,
    colors: ["#003087", "#FFFFFF"],
    stadium: "Hernando Siles",
    capacity: 41e3,
    reputation: 8
  }
];
var generateSAClubId = (name) => "SA_" + name.toUpperCase().replace(/[^A-Z0-9]/g, "_");

// resources/static_db/clubs/asian_teams.tsx
var CLUBS_ASIAN = [
  // === Arabia Saudyjska – absolutna czołówka (reputacja do 10) ===
  { name: "Neom SC", country: "KSA", tier: 2, colors: ["#0022ff", "#FFFFFF", "#0022ff"], stadium: "Neom Stadium", capacity: 22e3, reputation: 10 },
  {
    name: "Al-Hilal",
    country: "KSA",
    tier: 2,
    colors: ["#0033A0", "#FFFFFF"],
    stadium: "Kingdom Arena",
    capacity: 26e3,
    reputation: 10
  },
  {
    name: "Al-Nassr",
    country: "KSA",
    tier: 2,
    colors: ["#1E3A8A", "#FACC15"],
    stadium: "Al-Awwal Park",
    capacity: 25e3,
    reputation: 10
  },
  {
    name: "Al-Ahli",
    country: "KSA",
    tier: 2,
    colors: ["#1E3A8A", "#FFFFFF"],
    stadium: "King Abdullah Sports City",
    capacity: 62345,
    reputation: 9
  },
  {
    name: "Al-Ittihad",
    country: "KSA",
    tier: 2,
    colors: ["#FFD700", "#000000"],
    stadium: "King Abdullah Sports City",
    capacity: 62345,
    reputation: 9
  },
  // === ZEA ===
  {
    name: "Al Ain",
    country: "UAE",
    tier: 2,
    colors: ["#003087", "#F4C300"],
    stadium: "Hazza bin Zayed Stadium",
    capacity: 25100,
    reputation: 9
  },
  {
    name: "Shabab Al Ahli",
    country: "UAE",
    tier: 2,
    colors: ["#C8102E", "#FFFFFF"],
    stadium: "Rashid Stadium",
    capacity: 12e3,
    reputation: 8
  },
  {
    name: "Al-Wahda",
    country: "UAE",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Al Nahyan Stadium",
    capacity: 12e3,
    reputation: 8
  },
  // === Katar ===
  {
    name: "Al Sadd",
    country: "QAT",
    tier: 2,
    colors: ["#FFFFFF", "#000000"],
    stadium: "Jassim Bin Hamad Stadium",
    capacity: 15e3,
    reputation: 9
  },
  {
    name: "Al-Duhail",
    country: "QAT",
    tier: 2,
    colors: ["#C8102E", "#FFFFFF"],
    stadium: "Abdullah bin Khalifa Stadium",
    capacity: 10221,
    reputation: 8
  },
  // === Japonia ===
  {
    name: "Urawa Red Diamonds",
    country: "JPN",
    tier: 2,
    colors: ["#E30613", "#000000"],
    stadium: "Saitama Stadium 2002",
    capacity: 63700,
    reputation: 9
  },
  {
    name: "Vissel Kobe",
    country: "JPN",
    tier: 2,
    colors: ["#E30613", "#000000"],
    stadium: "Noevir Stadium Kobe",
    capacity: 30132,
    reputation: 9
  },
  {
    name: "Kashima Antlers",
    country: "JPN",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Kashima Soccer Stadium",
    capacity: 40728,
    reputation: 9
  },
  {
    name: "Yokohama F. Marinos",
    country: "JPN",
    tier: 2,
    colors: ["#00AEEF", "#FFFFFF"],
    stadium: "Nissan Stadium",
    capacity: 72327,
    reputation: 8
  },
  {
    name: "Sanfrecce Hiroshima",
    country: "JPN",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Edion Stadium Hiroshima",
    capacity: 36e3,
    reputation: 8
  },
  // === Korea Południowa ===
  {
    name: "Jeonbuk Hyundai Motors",
    country: "KOR",
    tier: 2,
    colors: ["#00AEEF", "#FFFFFF"],
    stadium: "Jeonju World Cup Stadium",
    capacity: 42477,
    reputation: 9
  },
  {
    name: "Ulsan HD",
    country: "KOR",
    tier: 2,
    colors: ["#E30613", "#000000"],
    stadium: "Ulsan Munsu Football Stadium",
    capacity: 44102,
    reputation: 9
  },
  // === Iran ===
  {
    name: "Persepolis",
    country: "IRN",
    tier: 2,
    colors: ["#C8102E", "#FFFFFF"],
    stadium: "Azadi Stadium",
    capacity: 78450,
    reputation: 9
  },
  {
    name: "Esteghlal",
    country: "IRN",
    tier: 2,
    colors: ["#003087", "#FFFFFF"],
    stadium: "Azadi Stadium",
    capacity: 78450,
    reputation: 8
  },
  {
    name: "Tractor",
    country: "IRN",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Yadegar-e Emam Stadium",
    capacity: 66e3,
    reputation: 8
  },
  // === Chiny ===
  {
    name: "Shanghai Port",
    country: "CHN",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Shanghai Stadium",
    capacity: 72e3,
    reputation: 8
  },
  {
    name: "Shanghai Shenhua",
    country: "CHN",
    tier: 2,
    colors: ["#003087", "#FFFFFF"],
    stadium: "Shanghai Stadium",
    capacity: 72e3,
    reputation: 8
  },
  // === Tajlandia ===
  {
    name: "Buriram United",
    country: "THA",
    tier: 3,
    colors: ["#E30613", "#000000"],
    stadium: "Chang Arena",
    capacity: 32600,
    reputation: 8
  },
  {
    name: "Bangkok United",
    country: "THA",
    tier: 3,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Thammasat Stadium",
    capacity: 25e3,
    reputation: 7
  },
  // === Malezja ===
  {
    name: "Johor Darul Ta'zim",
    country: "MAS",
    tier: 3,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Sultan Ibrahim Stadium",
    capacity: 4e4,
    reputation: 8
  },
  // === Australia ===
  {
    name: "Melbourne City",
    country: "AUS",
    tier: 3,
    colors: ["#00AEEF", "#FFFFFF"],
    stadium: "AAMI Park",
    capacity: 30050,
    reputation: 7
  }
];
var generateAsianClubId = (name) => "ASIA_" + name.toUpperCase().replace(/[^A-Z0-9]/g, "_");

// resources/static_db/clubs/african_teams.tsx
var CLUBS_AFRICAN = [
  // === Egipt – najsilniejsza reprezentacja ===
  {
    name: "Al Ahly",
    country: "EGY",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Cairo International Stadium",
    capacity: 75e3,
    reputation: 10
  },
  {
    name: "Pyramids FC",
    country: "EGY",
    tier: 2,
    colors: ["#E30613", "#000000"],
    stadium: "30 June Stadium",
    capacity: 75e3,
    reputation: 10
  },
  {
    name: "Zamalek",
    country: "EGY",
    tier: 1,
    colors: ["#FFFFFF", "#E30613"],
    stadium: "Cairo International Stadium",
    capacity: 75e3,
    reputation: 9
  },
  // === Południowa Afryka ===
  {
    name: "Mamelodi Sundowns",
    country: "RSA",
    tier: 2,
    colors: ["#003087", "#FFD700"],
    stadium: "Loftus Versfeld Stadium",
    capacity: 51900,
    reputation: 10
  },
  {
    name: "Orlando Pirates",
    country: "RSA",
    tier: 2,
    colors: ["#000000", "#E30613"],
    stadium: "Orlando Stadium",
    capacity: 4e4,
    reputation: 9
  },
  {
    name: "Kaizer Chiefs",
    country: "RSA",
    tier: 2,
    colors: ["#000000", "#FFD700"],
    stadium: "FNB Stadium (Soccer City)",
    capacity: 94736,
    reputation: 9
  },
  // === Maroko ===
  {
    name: "Wydad AC",
    country: "MAR",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Stade Mohammed V",
    capacity: 68e3,
    reputation: 9
  },
  {
    name: "Raja Club Athletic",
    country: "MAR",
    tier: 2,
    colors: ["#009900", "#FFFFFF"],
    stadium: "Stade Mohammed V",
    capacity: 68e3,
    reputation: 9
  },
  {
    name: "RS Berkane",
    country: "MAR",
    tier: 2,
    colors: ["#E30613", "#FFD700"],
    stadium: "Stade Municipal de Berkane",
    capacity: 15e3,
    reputation: 8
  },
  {
    name: "AS FAR Rabat",
    country: "MAR",
    tier: 2,
    colors: ["#003087", "#E30613"],
    stadium: "Prince Moulay Abdellah Stadium",
    capacity: 52e3,
    reputation: 8
  },
  // === Tunezja ===
  {
    name: "Esp\xE9rance de Tunis",
    country: "TUN",
    tier: 2,
    colors: ["#E30613", "#FFD700"],
    stadium: "Stade Olympique de Rad\xE8s",
    capacity: 65e3,
    reputation: 9
  },
  {
    name: "Club Africain",
    country: "TUN",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Stade Olympique de Rad\xE8s",
    capacity: 65e3,
    reputation: 8
  },
  // === Algieria ===
  {
    name: "USM Alger",
    country: "ALG",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Stade du 5 Juillet 1962",
    capacity: 64e3,
    reputation: 8
  },
  {
    name: "CR Belouizdad",
    country: "ALG",
    tier: 2,
    colors: ["#E30613", "#000000"],
    stadium: "Stade du 20 Ao\xFBt 1955",
    capacity: 2e4,
    reputation: 8
  },
  {
    name: "MC Alger",
    country: "ALG",
    tier: 2,
    colors: ["#008000", "#FFFFFF"],
    stadium: "Stade du 5 Juillet 1962",
    capacity: 64e3,
    reputation: 8
  },
  // === Inne mocne kluby z Afryki (regularnie w CAF) ===
  {
    name: "Simba SC",
    country: "TZA",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Benjamin Mkapa Stadium",
    capacity: 6e4,
    reputation: 8
  },
  {
    name: "Young Africans (Yanga)",
    country: "TZA",
    tier: 2,
    colors: ["#00AEEF", "#FFD700"],
    stadium: "Benjamin Mkapa Stadium",
    capacity: 6e4,
    reputation: 8
  },
  {
    name: "TP Mazembe",
    country: "COD",
    tier: 2,
    colors: ["#000000", "#FFFFFF"],
    stadium: "Stade TP Mazembe",
    capacity: 18e3,
    reputation: 8
  }
];
var generateAfricanClubId = (name) => "AFR_" + name.toUpperCase().replace(/[^A-Z0-9]/g, "_");

// resources/static_db/clubs/northAME_teams.tsx
var CLUBS_NORTH_AMERICA = [
  // === Meksyk - Liga MX (najsilniejsza liga w CONCACAF) ===
  {
    name: "Club Am\xE9rica",
    country: "MEX",
    tier: 2,
    colors: ["#FFCC00", "#000000"],
    stadium: "Estadio Azteca",
    capacity: 87428,
    reputation: 10
  },
  {
    name: "Cruz Azul",
    country: "MEX",
    tier: 2,
    colors: ["#004B9F", "#FFFFFF"],
    stadium: "Estadio Azteca",
    capacity: 87428,
    reputation: 10
  },
  {
    name: "Tigres UANL",
    country: "MEX",
    tier: 2,
    colors: ["#E30613", "#FFD700"],
    stadium: "Estadio Universitario",
    capacity: 41890,
    reputation: 10
  },
  {
    name: "CF Monterrey",
    country: "MEX",
    tier: 2,
    colors: ["#003087", "#FFFFFF"],
    stadium: "Estadio BBVA",
    capacity: 53500,
    reputation: 9
  },
  {
    name: "Deportivo Toluca",
    country: "MEX",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Estadio Nemesio D\xEDez",
    capacity: 3e4,
    reputation: 9
  },
  {
    name: "Chivas Guadalajara",
    country: "MEX",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "Estadio Akron",
    capacity: 49850,
    reputation: 9
  },
  {
    name: "Pumas UNAM",
    country: "MEX",
    tier: 2,
    colors: ["#003087", "#FFD700"],
    stadium: "Estadio Ol\xEDmpico Universitario",
    capacity: 72e3,
    reputation: 9
  },
  {
    name: "Pachuca",
    country: "MEX",
    tier: 2,
    colors: ["#003087", "#FFFFFF"],
    stadium: "Estadio Hidalgo",
    capacity: 3e4,
    reputation: 8
  },
  // === USA - MLS (główna siła) ===
  {
    name: "Inter Miami CF",
    country: "USA",
    tier: 2,
    colors: ["#FF6F00", "#000000"],
    stadium: "Chase Stadium",
    capacity: 21550,
    reputation: 11
  },
  {
    name: "LAFC",
    country: "USA",
    tier: 2,
    colors: ["#000000", "#E30613"],
    stadium: "BMO Stadium",
    capacity: 22e3,
    reputation: 9
  },
  {
    name: "LA Galaxy",
    country: "USA",
    tier: 2,
    colors: ["#003087", "#FFD700"],
    stadium: "Dignity Health Sports Park",
    capacity: 27e3,
    reputation: 11
  },
  {
    name: "Seattle Sounders FC",
    country: "USA",
    tier: 2,
    colors: ["#00AEEF", "#003087"],
    stadium: "Lumen Field",
    capacity: 68740,
    reputation: 8
  },
  {
    name: "FC Cincinnati",
    country: "USA",
    tier: 2,
    colors: ["#E30613", "#003087"],
    stadium: "TQL Stadium",
    capacity: 26e3,
    reputation: 8
  },
  {
    name: "Columbus Crew",
    country: "USA",
    tier: 2,
    colors: ["#FFD700", "#000000"],
    stadium: "Lower.com Field",
    capacity: 20500,
    reputation: 8
  },
  {
    name: "Nashville SC",
    country: "USA",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "GEODIS Park",
    capacity: 3e4,
    reputation: 8
  },
  {
    name: "New York City FC",
    country: "USA",
    tier: 2,
    colors: ["#00AEEF", "#FFFFFF"],
    stadium: "Yankee Stadium",
    capacity: 47300,
    reputation: 7
  },
  {
    name: "Philadelphia Union",
    country: "USA",
    tier: 3,
    colors: ["#003087", "#E30613"],
    stadium: "Subaru Park",
    capacity: 18500,
    reputation: 7
  },
  {
    name: "Orlando City SC",
    country: "USA",
    tier: 3,
    colors: ["#003087", "#E30613"],
    stadium: "Inter&Co Stadium",
    capacity: 25500,
    reputation: 7
  },
  // === Kanada - MLS + CPL (tak, Kanada ma dobre drużyny!) ===
  {
    name: "Vancouver Whitecaps FC",
    country: "CAN",
    tier: 2,
    colors: ["#003087", "#FFFFFF"],
    stadium: "BC Place",
    capacity: 22120,
    reputation: 8
  },
  {
    name: "Toronto FC",
    country: "CAN",
    tier: 2,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "BMO Field",
    capacity: 28500,
    reputation: 8
  },
  {
    name: "CF Montr\xE9al",
    country: "CAN",
    tier: 3,
    colors: ["#003087", "#E30613"],
    stadium: "Stade Saputo",
    capacity: 19619,
    reputation: 7
  },
  // Canadian Premier League (CPL) - popularne i utytułowane drużyny
  {
    name: "Forge FC",
    country: "CAN",
    tier: 3,
    colors: ["#E30613", "#000000"],
    stadium: "Tim Hortons Field",
    capacity: 23e3,
    reputation: 7
  },
  {
    name: "Cavalry FC",
    country: "CAN",
    tier: 3,
    colors: ["#003087", "#FFD700"],
    stadium: "ATCO Field",
    capacity: 6e3,
    reputation: 7
  },
  {
    name: "Chicago Fire FC",
    country: "USA",
    tier: 3,
    colors: ["#E30613", "#003087"],
    stadium: "Soldier Field",
    capacity: 61500,
    reputation: 7
  },
  {
    name: "Atl\xE9tico Ottawa",
    country: "CAN",
    tier: 3,
    colors: ["#E30613", "#FFFFFF"],
    stadium: "TD Place Stadium",
    capacity: 24e3,
    reputation: 6
  }
];
var generateNorthAmericaClubId = (name) => "NA_" + name.toUpperCase().replace(/[^A-Z0-9]/g, "_");

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
    const isPolishClub = playerClubId.startsWith("PL_") || normalizedCountry === "POL";
    if (isPolishClub) {
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
  evaluateContractLogic: (player, newSalary, newBonus, newEndDate, currentDate, clubReputation, clubTier, managerProfile) => {
    const now = currentDate.getTime();
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

// resources/static_db/NationalTeams/NationalTeamsEurope.tsx
var NATIONAL_TEAMS_EUROPE = [
  { name: "Albania", continent: "Europe", tier: 4, colors: ["#E41E20", "#000000", "#E41E20"], stadium: "Air Albania Stadium", capacity: 22500, reputation: 9, region: "ALBANIA" /* ALBANIA */ },
  { name: "Andora", continent: "Europe", tier: 5, colors: ["#0032A0", "#FEDD00", "#D52B1E"], stadium: "Estadi Nacional", capacity: 3306, reputation: 2, region: "IBERIA" /* IBERIA */ },
  { name: "Armenia", continent: "Europe", tier: 4, colors: ["#D90012", "#0033A0", "#F2A800"], stadium: "Republican Stadium", capacity: 14200, reputation: 7, region: "ARMENIA" /* ARMENIA */ },
  { name: "Austria", continent: "Europe", tier: 2, colors: ["#ED2939", "#FFFFFF", "#ED2939"], stadium: "Ernst-Happel-Stadion", capacity: 50708, reputation: 14, region: "GERMANY" /* GERMANY */ },
  { name: "Azerbejd\u017Can", continent: "Europe", tier: 4, colors: ["#00B9E4", "#ED2939", "#3F9C35"], stadium: "Baku Olympic Stadium", capacity: 69870, reputation: 6, region: "AZERBAIJANI" /* AZERBAIJANI */ },
  { name: "Belgia", continent: "Europe", tier: 1, colors: ["#000000", "#FFD100", "#EF3340"], stadium: "King Baudouin Stadium", capacity: 50093, reputation: 17, region: "BENELUX" /* BENELUX */ },
  { name: "Bia\u0142oru\u015B", continent: "Europe", tier: 4, colors: ["#D22730", "#00AF66", "#FFFFFF"], stadium: "Dinamo Stadium", capacity: 22346, reputation: 6, region: "EX_USSR" /* EX_USSR */ },
  { name: "Bo\u015Bnia i Hercegowina", continent: "Europe", tier: 3, colors: ["#002395", "#FECB00", "#002395"], stadium: "Bilino Polje", capacity: 15292, reputation: 9, region: "BALKANS" /* BALKANS */ },
  { name: "Bu\u0142garia", continent: "Europe", tier: 4, colors: ["#FFFFFF", "#00966E", "#D62612"], stadium: "Vasil Levski", capacity: 43230, reputation: 8, region: "BALKANS" /* BALKANS */ },
  { name: "Chorwacja", continent: "Europe", tier: 2, colors: ["#FF0000", "#FFFFFF", "#0000FF"], stadium: "Maksimir", capacity: 35e3, reputation: 17, region: "BALKANS" /* BALKANS */ },
  { name: "Cypr", continent: "Europe", tier: 4, colors: ["#FFFFFF", "#D57800", "#FFFFFF"], stadium: "GSP Stadium", capacity: 22859, reputation: 6, region: "GREEK" /* GREEK */ },
  { name: "Czarnog\xF3ra", continent: "Europe", tier: 3, colors: ["#C40308", "#FFD700", "#C40308"], stadium: "Pod Goricom", capacity: 17e3, reputation: 7, region: "BALKANS" /* BALKANS */ },
  { name: "Czechy", continent: "Europe", tier: 2, colors: ["#11457E", "#FFFFFF", "#D7141A"], stadium: "Eden Arena", capacity: 20800, reputation: 13, region: "CZ_SK" /* CZ_SK */ },
  { name: "Dania", continent: "Europe", tier: 2, colors: ["#C60C30", "#FFFFFF", "#C60C30"], stadium: "Parken", capacity: 38065, reputation: 15, region: "SCANDINAVIA" /* SCANDINAVIA */ },
  { name: "Estonia", continent: "Europe", tier: 5, colors: ["#4891D9", "#000000", "#FFFFFF"], stadium: "A. Le Coq Arena", capacity: 14336, reputation: 5, region: "BALTIC" /* BALTIC */ },
  { name: "Finlandia", continent: "Europe", tier: 3, colors: ["#FFFFFF", "#003580", "#FFFFFF"], stadium: "Olympic Stadium Helsinki", capacity: 36300, reputation: 9, region: "FINLAND" /* FINLAND */ },
  { name: "Francja", continent: "Europe", tier: 1, colors: ["#0055A4", "#FFFFFF", "#EF4135"], stadium: "Stade de France", capacity: 8e4, reputation: 20, region: "FRANCE" /* FRANCE */ },
  { name: "Gibraltar", continent: "Europe", tier: 5, colors: ["#D40000", "#FFFFFF", "#D40000"], stadium: "Victoria Stadium", capacity: 5e3, reputation: 2, region: "IBERIA" /* IBERIA */ },
  { name: "Grecja", continent: "Europe", tier: 2, colors: ["#0D5EAF", "#FFFFFF", "#0D5EAF"], stadium: "Olympic Stadium Athens", capacity: 69618, reputation: 12, region: "GREEK" /* GREEK */ },
  { name: "Gruzja", continent: "Europe", tier: 4, colors: ["#FFFFFF", "#E41E20", "#FFFFFF"], stadium: "Boris Paichadze", capacity: 54949, reputation: 9, region: "GEORGIA" /* GEORGIA */ },
  { name: "Hiszpania", continent: "Europe", tier: 1, colors: ["#AA151B", "#F1BF00", "#AA151B"], stadium: "Santiago Bernab\xE9u", capacity: 81044, reputation: 20, region: "SPAIN" /* SPAIN */ },
  { name: "Holandia", continent: "Europe", tier: 1, colors: ["#FF4F00", "#FFFFFF", "#0000FF"], stadium: "Johan Cruijff Arena", capacity: 55500, reputation: 18, region: "BENELUX" /* BENELUX */ },
  { name: "Irlandia", continent: "Europe", tier: 3, colors: ["#169B62", "#FFFFFF", "#FF883E"], stadium: "Aviva Stadium", capacity: 51711, reputation: 11, region: "ENGLAND" /* ENGLAND */ },
  { name: "Irlandia P\xF3\u0142nocna", continent: "Europe", tier: 4, colors: ["#007A37", "#FFFFFF", "#007A37"], stadium: "Windsor Park", capacity: 18500, reputation: 7, region: "ENGLAND" /* ENGLAND */ },
  { name: "Islandia", continent: "Europe", tier: 3, colors: ["#02529C", "#FFFFFF", "#DC1E35"], stadium: "Laugardalsv\xF6llur", capacity: 15e3, reputation: 9, region: "SCANDINAVIA" /* SCANDINAVIA */ },
  { name: "Izrael", continent: "Europe", tier: 3, colors: ["#0038B8", "#FFFFFF", "#0038B8"], stadium: "Sammy Ofer Stadium", capacity: 30858, reputation: 12, region: "ISRAELI" /* ISRAELI */ },
  { name: "Kazachstan", continent: "Europe", tier: 4, colors: ["#00AFCA", "#FEC50C", "#00AFCA"], stadium: "Astana Arena", capacity: 3e4, reputation: 7, region: "KAZAKH" /* KAZAKH */ },
  { name: "Kosovo", continent: "Europe", tier: 3, colors: ["#244AA5", "#D0A650", "#244AA5"], stadium: "Fadil Vokrri Stadium", capacity: 13800, reputation: 8, region: "ALBANIA" /* ALBANIA */ },
  { name: "Liechtenstein", continent: "Europe", tier: 5, colors: ["#002B7F", "#CE1126", "#FFD100"], stadium: "Rheinpark Stadion", capacity: 7838, reputation: 2, region: "GERMANY" /* GERMANY */ },
  { name: "Litwa", continent: "Europe", tier: 5, colors: ["#FDB913", "#006A44", "#C1272D"], stadium: "LFF Stadium", capacity: 5067, reputation: 5, region: "BALTIC" /* BALTIC */ },
  { name: "Luksemburg", continent: "Europe", tier: 5, colors: ["#00A3E0", "#FFFFFF", "#EF3340"], stadium: "Stade de Luxembourg", capacity: 9385, reputation: 4, region: "BENELUX" /* BENELUX */ },
  { name: "\u0141otwa", continent: "Europe", tier: 5, colors: ["#9E3039", "#FFFFFF", "#9E3039"], stadium: "Daugava Stadium", capacity: 1e4, reputation: 5, region: "BALTIC" /* BALTIC */ },
  { name: "Macedonia P\xF3\u0142nocna", continent: "Europe", tier: 4, colors: ["#D20000", "#FFD700", "#D20000"], stadium: "To\u0161e Proeski Arena", capacity: 33500, reputation: 8, region: "BALKANS" /* BALKANS */ },
  { name: "Malta", continent: "Europe", tier: 5, colors: ["#FFFFFF", "#CF142B", "#FFFFFF"], stadium: "Ta' Qali", capacity: 17797, reputation: 3, region: "MALTESE" /* MALTESE */ },
  { name: "Mo\u0142dawia", continent: "Europe", tier: 5, colors: ["#0033A0", "#FFD100", "#CE1126"], stadium: "Zimbru", capacity: 10400, reputation: 6, region: "EX_USSR" /* EX_USSR */ },
  { name: "Niemcy", continent: "Europe", tier: 1, colors: ["#000000", "#DD0000", "#FFCE00"], stadium: "Olympiastadion Berlin", capacity: 74475, reputation: 20, region: "GERMANY" /* GERMANY */ },
  { name: "Norwegia", continent: "Europe", tier: 2, colors: ["#BA0C2F", "#FFFFFF", "#00205B"], stadium: "Ullevaal", capacity: 28e3, reputation: 11, region: "SCANDINAVIA" /* SCANDINAVIA */ },
  { name: "Polska", continent: "Europe", tier: 2, colors: ["#FFFFFF", "#DC143C", "#FFFFFF"], stadium: "Stadion Narodowy", capacity: 58580, reputation: 14, region: "POLAND" /* POLAND */ },
  { name: "Portugalia", continent: "Europe", tier: 1, colors: ["#006600", "#FF0000", "#006600"], stadium: "Est\xE1dio da Luz", capacity: 64642, reputation: 18, region: "IBERIA" /* IBERIA */ },
  { name: "Rosja", continent: "Europe", tier: 2, colors: ["#FFFFFF", "#0039A6", "#D52B1E"], stadium: "Luzhniki Stadium", capacity: 81e3, reputation: 13, region: "EX_USSR" /* EX_USSR */ },
  { name: "Rumunia", continent: "Europe", tier: 3, colors: ["#002B7F", "#FCD116", "#CE1126"], stadium: "Arena Na\u021Bional\u0103", capacity: 55634, reputation: 12, region: "ROMANIA" /* ROMANIA */ },
  { name: "San Marino", continent: "Europe", tier: 5, colors: ["#5EB6E4", "#FFFFFF", "#5EB6E4"], stadium: "San Marino Stadium", capacity: 6664, reputation: 1, region: "ITALY" /* ITALY */ },
  { name: "Serbia", continent: "Europe", tier: 2, colors: ["#C6363C", "#0C4076", "#FFFFFF"], stadium: "Rajko Miti\u0107", capacity: 53530, reputation: 14, region: "BALKANS" /* BALKANS */ },
  { name: "S\u0142owacja", continent: "Europe", tier: 3, colors: ["#FFFFFF", "#0B4EA2", "#EF3340"], stadium: "Teheln\xE9 pole", capacity: 22500, reputation: 10, region: "CZ_SK" /* CZ_SK */ },
  { name: "S\u0142owenia", continent: "Europe", tier: 3, colors: ["#FFFFFF", "#005DA4", "#ED1C24"], stadium: "Sto\u017Eice", capacity: 16038, reputation: 10, region: "BALKANS" /* BALKANS */ },
  { name: "Szkocja", continent: "Europe", tier: 2, colors: ["#0065BD", "#FFFFFF", "#0065BD"], stadium: "Hampden Park", capacity: 51866, reputation: 12, region: "ENGLAND" /* ENGLAND */ },
  { name: "Szwajcaria", continent: "Europe", tier: 2, colors: ["#FF0000", "#FFFFFF", "#FF0000"], stadium: "St. Jakob-Park", capacity: 38512, reputation: 15, region: "GERMANY" /* GERMANY */ },
  { name: "Szwecja", continent: "Europe", tier: 2, colors: ["#006AA7", "#FECC00", "#006AA7"], stadium: "Friends Arena", capacity: 5e4, reputation: 15, region: "SWEDEN" /* SWEDEN */ },
  { name: "Turcja", continent: "Europe", tier: 2, colors: ["#E30A17", "#FFFFFF", "#E30A17"], stadium: "Atat\xFCrk Olympic", capacity: 76092, reputation: 16, region: "TURKEY" /* TURKEY */ },
  { name: "Ukraina", continent: "Europe", tier: 2, colors: ["#005BBB", "#FFD500", "#005BBB"], stadium: "NSK Olimpiyskiy", capacity: 70050, reputation: 13, region: "EX_USSR" /* EX_USSR */ },
  { name: "Walia", continent: "Europe", tier: 3, colors: ["#FFFFFF", "#D30731", "#006400"], stadium: "Millennium Stadium", capacity: 74500, reputation: 11, region: "ENGLAND" /* ENGLAND */ },
  { name: "W\u0119gry", continent: "Europe", tier: 3, colors: ["#CD2A3E", "#FFFFFF", "#436F4D"], stadium: "Pusk\xE1s Ar\xE9na", capacity: 67215, reputation: 12, region: "HUNGARIAN" /* HUNGARIAN */ },
  { name: "W\u0142ochy", continent: "Europe", tier: 1, colors: ["#009246", "#FFFFFF", "#CE2B37"], stadium: "Stadio Olimpico", capacity: 70634, reputation: 19, region: "ITALY" /* ITALY */ },
  { name: "Wyspy Owcze", continent: "Europe", tier: 5, colors: ["#FFFFFF", "#0035AD", "#D21034"], stadium: "T\xF3rsv\xF8llur", capacity: 6040, reputation: 3, region: "SCANDINAVIA" /* SCANDINAVIA */ },
  { name: "Anglia", continent: "Europe", tier: 1, colors: ["#FFFFFF", "#C8102E", "#FFFFFF"], stadium: "Wembley", capacity: 9e4, reputation: 20, region: "ENGLAND" /* ENGLAND */ }
];

// resources/static_db/NationalTeams/NationalTeamsAfrica.tsx
var NATIONAL_TEAMS_AFRICA = [
  { name: "Algieria", continent: "Africa", tier: 3, colors: ["#006233", "#FFFFFF", "#D21034"], stadium: "Stade du 5 Juillet", capacity: 8e4, reputation: 12, region: "ARABIA" /* ARABIA */ },
  { name: "Angola", continent: "Africa", tier: 5, colors: ["#CE1126", "#000000", "#FCD116"], stadium: "Est\xE1dio 11 de Novembro", capacity: 5e4, reputation: 8, region: "SSA" /* SSA */ },
  { name: "Benin", continent: "Africa", tier: 5, colors: ["#008751", "#FCD116", "#E8112D"], stadium: "Stade de l'Amiti\xE9", capacity: 4e4, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Botswana", continent: "Africa", tier: 5, colors: ["#75AADB", "#000000", "#FFFFFF"], stadium: "Obed Itani Chilume Stadium", capacity: 26e3, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Burkina Faso", continent: "Africa", tier: 4, colors: ["#EF2B2D", "#FCD116", "#009E49"], stadium: "Stade du 4 Ao\xFBt", capacity: 35e3, reputation: 9, region: "SSA" /* SSA */ },
  { name: "Burundi", continent: "Africa", tier: 5, colors: ["#CE1126", "#FFFFFF", "#1EB53A"], stadium: "Stade Prince Louis Rwagasore", capacity: 22e3, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Czad", continent: "Africa", tier: 5, colors: ["#002664", "#FECB00", "#C60C30"], stadium: "Stade Idriss Mahamat Ouya", capacity: 3e4, reputation: 4, region: "SSA" /* SSA */ },
  { name: "D\u017Cibuti", continent: "Africa", tier: 5, colors: ["#6AB2E7", "#FFFFFF", "#12AD2B"], stadium: "Stade du Ville", capacity: 2e4, reputation: 3, region: "ARABIA" /* ARABIA */ },
  { name: "Egipt", continent: "Africa", tier: 2, colors: ["#CE1126", "#FFFFFF", "#000000"], stadium: "Cairo International Stadium", capacity: 75e3, reputation: 12, region: "ARABIA" /* ARABIA */ },
  { name: "Erytrea", continent: "Africa", tier: 5, colors: ["#EA0437", "#0B5ED7", "#0A7E38"], stadium: "Cicero Stadium", capacity: 2e4, reputation: 3, region: "SSA" /* SSA */ },
  { name: "Eswatini", continent: "Africa", tier: 5, colors: ["#3E5EB9", "#FFD100", "#B10C2E"], stadium: "Somhlolo National Stadium", capacity: 2e4, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Etiopia", continent: "Africa", tier: 5, colors: ["#078930", "#FCDD09", "#DA121A"], stadium: "Addis Ababa Stadium", capacity: 35e3, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Gabon", continent: "Africa", tier: 5, colors: ["#009E60", "#FCD116", "#3A75C4"], stadium: "Stade de l'Amiti\xE9", capacity: 4e4, reputation: 8, region: "SSA" /* SSA */ },
  { name: "Gambia", continent: "Africa", tier: 5, colors: ["#CE1126", "#0C1C8C", "#3A7728"], stadium: "Independence Stadium", capacity: 3e4, reputation: 6, region: "SSA" /* SSA */ },
  { name: "Ghana", continent: "Africa", tier: 2, colors: ["#CE1126", "#FCD116", "#006B3F"], stadium: "Accra Sports Stadium", capacity: 40500, reputation: 11, region: "SSA" /* SSA */ },
  { name: "Gwinea", continent: "Africa", tier: 5, colors: ["#CE1126", "#FCD116", "#009460"], stadium: "Stade du 28 Septembre", capacity: 5e4, reputation: 8, region: "SSA" /* SSA */ },
  { name: "Gwinea Bissau", continent: "Africa", tier: 5, colors: ["#CE1126", "#FCD116", "#009460"], stadium: "Est\xE1dio 24 de Setembro", capacity: 2e4, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Gwinea R\xF3wnikowa", continent: "Africa", tier: 5, colors: ["#3E9A00", "#FFFFFF", "#D21034"], stadium: "Nuevo Estadio de Malabo", capacity: 15e3, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Kamerun", continent: "Africa", tier: 2, colors: ["#007A5E", "#CE1126", "#FCD116"], stadium: "Stade Ahmadou Ahidjo", capacity: 42e3, reputation: 11, region: "SSA" /* SSA */ },
  { name: "Kenia", continent: "Africa", tier: 5, colors: ["#000000", "#CE1126", "#006600"], stadium: "Nyayo National Stadium", capacity: 3e4, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Komory", continent: "Africa", tier: 5, colors: ["#3D8E33", "#FFFFFF", "#FFC61E"], stadium: "Stade Omnisports de Malouzini", capacity: 6e3, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Kongo", continent: "Africa", tier: 5, colors: ["#009543", "#FBDE4A", "#DC241F"], stadium: "Stade Alphonse Massamba-D\xE9bat", capacity: 33e3, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Demokratyczna Republika Konga", continent: "Africa", tier: 2, colors: ["#00A3E0", "#CE1126", "#FCD116"], stadium: "Stade des Martyrs", capacity: 8e4, reputation: 9, region: "SSA" /* SSA */ },
  { name: "Lesotho", continent: "Africa", tier: 5, colors: ["#00209F", "#FFFFFF", "#009543"], stadium: "Setsoto Stadium", capacity: 2e4, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Liberia", continent: "Africa", tier: 5, colors: ["#BF0A30", "#FFFFFF", "#002868"], stadium: "Samuel Kanyon Doe Stadium", capacity: 35e3, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Libia", continent: "Africa", tier: 5, colors: ["#E70013", "#000000", "#239E46"], stadium: "Martyrs of February Stadium", capacity: 45e3, reputation: 7, region: "ARABIA" /* ARABIA */ },
  { name: "Madagaskar", continent: "Africa", tier: 5, colors: ["#FFFFFF", "#FC3D32", "#007E3A"], stadium: "Stade Municipal de Mahamasina", capacity: 22e3, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Malawi", continent: "Africa", tier: 5, colors: ["#000000", "#CE1126", "#007A3D"], stadium: "Bingu National Stadium", capacity: 4e4, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Mali", continent: "Africa", tier: 3, colors: ["#14B53A", "#FCD116", "#CE1126"], stadium: "Stade du 26 Mars", capacity: 5e4, reputation: 8, region: "SSA" /* SSA */ },
  { name: "Maroko", continent: "Africa", tier: 2, colors: ["#C1272D", "#006233", "#C1272D"], stadium: "Stade Mohammed V", capacity: 67e3, reputation: 13, region: "ARABIA" /* ARABIA */ },
  { name: "Mauretania", continent: "Africa", tier: 5, colors: ["#006233", "#FFD100", "#006233"], stadium: "Stade Olympique Nouakchott", capacity: 2e4, reputation: 6, region: "ARABIA" /* ARABIA */ },
  { name: "Mauritius", continent: "Africa", tier: 5, colors: ["#EA2839", "#1A206D", "#FFD500"], stadium: "Stade George V", capacity: 5e3, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Mozambik", continent: "Africa", tier: 5, colors: ["#007A3D", "#000000", "#FCD116"], stadium: "Est\xE1dio do Zimpeto", capacity: 42e3, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Namibia", continent: "Africa", tier: 5, colors: ["#003580", "#D21034", "#009543"], stadium: "Independence Stadium", capacity: 25e3, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Niger", continent: "Africa", tier: 5, colors: ["#E05206", "#FFFFFF", "#0DB02B"], stadium: "Stade G\xE9n\xE9ral Seyni Kountch\xE9", capacity: 35e3, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Nigeria", continent: "Africa", tier: 2, colors: ["#008753", "#FFFFFF", "#008753"], stadium: "Moshood Abiola Stadium", capacity: 6e4, reputation: 12, region: "SSA" /* SSA */ },
  { name: "Republika Po\u0142udniowej Afryki", continent: "Africa", tier: 3, colors: ["#007A4D", "#FFB612", "#000000"], stadium: "FNB Stadium", capacity: 94736, reputation: 8, region: "SSA" /* SSA */ },
  { name: "Republika \u015Arodkowoafryka\u0144ska", continent: "Africa", tier: 5, colors: ["#003082", "#FFFFFF", "#289728"], stadium: "Stade Barth\xE9lemy Boganda", capacity: 2e4, reputation: 4, region: "SSA" /* SSA */ },
  { name: "Rwanda", continent: "Africa", tier: 5, colors: ["#00A1DE", "#FAD201", "#20603D"], stadium: "Amahoro Stadium", capacity: 45e3, reputation: 6, region: "SSA" /* SSA */ },
  { name: "Senegal", continent: "Africa", tier: 2, colors: ["#00853F", "#FDEF42", "#E31B23"], stadium: "Stade Abdoulaye Wade", capacity: 5e4, reputation: 14, region: "SSA" /* SSA */ },
  { name: "Seszele", continent: "Africa", tier: 5, colors: ["#003F87", "#FCD116", "#CE1126"], stadium: "Stade Linite", capacity: 1e4, reputation: 3, region: "SSA" /* SSA */ },
  { name: "Sierra Leone", continent: "Africa", tier: 5, colors: ["#1EB53A", "#FFFFFF", "#0072C6"], stadium: "Siaka Stevens Stadium", capacity: 36e3, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Somalia", continent: "Africa", tier: 5, colors: ["#4189DD", "#FFFFFF", "#4189DD"], stadium: "Mogadishu Stadium", capacity: 65e3, reputation: 3, region: "SSA" /* SSA */ },
  { name: "Sudan", continent: "Africa", tier: 5, colors: ["#D21034", "#FFFFFF", "#000000"], stadium: "Al-Merrikh Stadium", capacity: 43e3, reputation: 6, region: "ARABIA" /* ARABIA */ },
  { name: "Sudan Po\u0142udniowy", continent: "Africa", tier: 5, colors: ["#000000", "#CE1126", "#078930"], stadium: "Juba National Stadium", capacity: 3e4, reputation: 4, region: "SSA" /* SSA */ },
  { name: "Wyspy \u015Awi\u0119tego Tomasza i Ksi\u0105\u017C\u0119ca", continent: "Africa", tier: 5, colors: ["#009E49", "#FCD116", "#CE1126"], stadium: "Est\xE1dio Nacional 12 de Julho", capacity: 6500, reputation: 3, region: "SSA" /* SSA */ },
  { name: "Tanzania", continent: "Africa", tier: 5, colors: ["#1EB53A", "#FCD116", "#00A3DD"], stadium: "Benjamin Mkapa Stadium", capacity: 6e4, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Togo", continent: "Africa", tier: 5, colors: ["#006A4E", "#FCD116", "#D21034"], stadium: "Stade de K\xE9gu\xE9", capacity: 3e4, reputation: 6, region: "SSA" /* SSA */ },
  { name: "Tunezja", continent: "Africa", tier: 2, colors: ["#E70013", "#FFFFFF", "#E70013"], stadium: "Stade Olympique de Rad\xE8s", capacity: 6e4, reputation: 11, region: "ARABIA" /* ARABIA */ },
  { name: "Uganda", continent: "Africa", tier: 5, colors: ["#000000", "#FCD116", "#CE1126"], stadium: "Mandela National Stadium", capacity: 45e3, reputation: 8, region: "SSA" /* SSA */ },
  { name: "Wybrze\u017Ce Ko\u015Bci S\u0142oniowej", continent: "Africa", tier: 2, colors: ["#F77F00", "#FFFFFF", "#009E60"], stadium: "Stade Olympique d'Ebimp\xE9", capacity: 6e4, reputation: 14, region: "SSA" /* SSA */ },
  { name: "Wyspy Zielonego Przyl\u0105dka", continent: "Africa", tier: 2, colors: ["#003893", "#FFFFFF", "#CF2027"], stadium: "Est\xE1dio Nacional de Cabo Verde", capacity: 15e3, reputation: 8, region: "SSA" /* SSA */ },
  { name: "Zambia", continent: "Africa", tier: 5, colors: ["#198A00", "#EF3340", "#000000"], stadium: "National Heroes Stadium", capacity: 6e4, reputation: 9, region: "SSA" /* SSA */ },
  { name: "Zimbabwe", continent: "Africa", tier: 5, colors: ["#006400", "#FFD100", "#D21034"], stadium: "National Sports Stadium", capacity: 6e4, reputation: 7, region: "SSA" /* SSA */ }
];

// resources/static_db/NationalTeams/NationalTeamsAFC.tsx
var NATIONAL_TEAMS_AFC = [
  { name: "Arabia Saudyjska", continent: "Asia", tier: 4, colors: ["#006C35", "#FFFFFF", "#006C35"], stadium: "King Fahd International Stadium", capacity: 68752, reputation: 12, region: "ARABIA" /* ARABIA */ },
  { name: "Bahrajn", continent: "Asia", tier: 4, colors: ["#CE1126", "#FFFFFF", "#CE1126"], stadium: "Bahrain National Stadium", capacity: 24e3, reputation: 7, region: "ARABIA" /* ARABIA */ },
  { name: "Irak", continent: "Asia", tier: 3, colors: ["#CE1126", "#FFFFFF", "#000000"], stadium: "Basra International Stadium", capacity: 65e3, reputation: 10, region: "ARABIA" /* ARABIA */ },
  { name: "Iran", continent: "Asia", tier: 3, colors: ["#239F40", "#FFFFFF", "#DA0000"], stadium: "Azadi Stadium", capacity: 78116, reputation: 11, region: "ARABIA" /* ARABIA */ },
  { name: "Jemen", continent: "Asia", tier: 5, colors: ["#CE1126", "#FFFFFF", "#000000"], stadium: "Al-Thawra Stadium", capacity: 3e4, reputation: 5, region: "ARABIA" /* ARABIA */ },
  { name: "Jordania", continent: "Asia", tier: 3, colors: ["#000000", "#FFFFFF", "#007A3D"], stadium: "Amman International Stadium", capacity: 25e3, reputation: 9, region: "ARABIA" /* ARABIA */ },
  { name: "Katar", continent: "Asia", tier: 4, colors: ["#8A1538", "#FFFFFF", "#8A1538"], stadium: "Lusail Stadium", capacity: 88966, reputation: 12, region: "ARABIA" /* ARABIA */ },
  { name: "Kuwejt", continent: "Asia", tier: 4, colors: ["#007A3D", "#FFFFFF", "#CE1126"], stadium: "Jaber Al-Ahmad International Stadium", capacity: 6e4, reputation: 9, region: "ARABIA" /* ARABIA */ },
  { name: "Liban", continent: "Asia", tier: 4, colors: ["#CE1126", "#FFFFFF", "#CE1126"], stadium: "Beirut Municipal Stadium", capacity: 22e3, reputation: 7, region: "ARABIA" /* ARABIA */ },
  { name: "Oman", continent: "Asia", tier: 4, colors: ["#D21034", "#FFFFFF", "#009543"], stadium: "Sultan Qaboos Sports Complex", capacity: 39e3, reputation: 9, region: "ARABIA" /* ARABIA */ },
  { name: "Palestyna", continent: "Asia", tier: 5, colors: ["#000000", "#FFFFFF", "#007A3D"], stadium: "Faisal Al-Husseini Stadium", capacity: 12e3, reputation: 7, region: "ARABIA" /* ARABIA */ },
  { name: "Syria", continent: "Asia", tier: 4, colors: ["#CE1126", "#FFFFFF", "#000000"], stadium: "Abbasiyyin Stadium", capacity: 3e4, reputation: 8, region: "ARABIA" /* ARABIA */ },
  { name: "ZEA", continent: "Asia", tier: 3, colors: ["#00732F", "#FFFFFF", "#000000"], stadium: "Zayed Sports City Stadium", capacity: 43e3, reputation: 10, region: "ARABIA" /* ARABIA */ },
  { name: "Australia", continent: "Asia", tier: 2, colors: ["#1F8A43", "#FFD100", "#1F8A43"], stadium: "Stadium Australia", capacity: 83500, reputation: 13, region: "OCEANIA" /* OCEANIA */ },
  { name: "Chiny", continent: "Asia", tier: 4, colors: ["#DE2910", "#FFDE00", "#DE2910"], stadium: "Workers' Stadium", capacity: 68e3, reputation: 10, region: "JAPAN" /* JAPAN */ },
  { name: "Filipiny", continent: "Asia", tier: 5, colors: ["#0038A8", "#FFFFFF", "#CE1126"], stadium: "Rizal Memorial Stadium", capacity: 12e3, reputation: 7, region: "JAPAN" /* JAPAN */ },
  { name: "Indonezja", continent: "Asia", tier: 5, colors: ["#CE1126", "#FFFFFF", "#CE1126"], stadium: "Gelora Bung Karno", capacity: 77e3, reputation: 9, region: "JAPAN" /* JAPAN */ },
  { name: "Japonia", continent: "Asia", tier: 2, colors: ["#BC002D", "#FFFFFF", "#BC002D"], stadium: "Saitama Stadium", capacity: 63700, reputation: 14, region: "JAPAN" /* JAPAN */ },
  { name: "Kambod\u017Ca", continent: "Asia", tier: 5, colors: ["#032EA1", "#E00025", "#032EA1"], stadium: "Morodok Techo National Stadium", capacity: 6e4, reputation: 5, region: "JAPAN" /* JAPAN */ },
  { name: "Korea P\u0141D", continent: "Asia", tier: 2, colors: ["#FFFFFF", "#C60C30", "#FFFFFF"], stadium: "Seoul World Cup Stadium", capacity: 66806, reputation: 14, region: "KOREA" /* KOREA */ },
  { name: "Korea P\u0141N", continent: "Asia", tier: 5, colors: ["#024FA2", "#ED1C27", "#024FA2"], stadium: "Kim Il-sung Stadium", capacity: 5e4, reputation: 9, region: "KOREA" /* KOREA */ },
  { name: "Laos", continent: "Asia", tier: 5, colors: ["#CE1126", "#002868", "#CE1126"], stadium: "New Laos National Stadium", capacity: 25e3, reputation: 4, region: "JAPAN" /* JAPAN */ },
  { name: "Malezja", continent: "Asia", tier: 5, colors: ["#010066", "#FFCC00", "#CE1126"], stadium: "Bukit Jalil National Stadium", capacity: 87411, reputation: 6, region: "JAPAN" /* JAPAN */ },
  {
    name: "Macau",
    continent: "Asia",
    tier: 5,
    colors: ["#006600", "#FFD700", "#FFFFFF"],
    stadium: "Centro Desportivo Ol\xEDmpico - Est\xE1dio",
    capacity: 16272,
    reputation: 3,
    region: "JAPAN" /* JAPAN */
  },
  { name: "Mjanma", continent: "Asia", tier: 5, colors: ["#FECB00", "#34B233", "#EA2839"], stadium: "Thuwunna Stadium", capacity: 32e3, reputation: 6, region: "JAPAN" /* JAPAN */ },
  { name: "Singapur", continent: "Asia", tier: 5, colors: ["#EF3340", "#FFFFFF", "#EF3340"], stadium: "National Stadium", capacity: 55e3, reputation: 8, region: "JAPAN" /* JAPAN */ },
  { name: "Tajlandia", continent: "Asia", tier: 5, colors: ["#CE1126", "#002868", "#CE1126"], stadium: "Rajamangala Stadium", capacity: 49e3, reputation: 7, region: "JAPAN" /* JAPAN */ },
  { name: "Timor Wschodni", continent: "Asia", tier: 5, colors: ["#DA121A", "#000000", "#FCD116"], stadium: "Est\xE1dio Nacional de Dili", capacity: 3e4, reputation: 4, region: "JAPAN" /* JAPAN */ },
  { name: "Wietnam", continent: "Asia", tier: 5, colors: ["#DA251D", "#FFDE00", "#DA251D"], stadium: "M\u1EF9 \u0110\xECnh National Stadium", capacity: 40192, reputation: 9, region: "JAPAN" /* JAPAN */ },
  { name: "Afganistan", continent: "Asia", tier: 5, colors: ["#000000", "#DA0000", "#007A36"], stadium: "Ghazi Stadium", capacity: 25e3, reputation: 5, region: "ARABIA" /* ARABIA */ },
  { name: "Bangladesz", continent: "Asia", tier: 5, colors: ["#006A4E", "#F42A41", "#006A4E"], stadium: "Bangabandhu National Stadium", capacity: 36e3, reputation: 3, region: "ARABIA" /* ARABIA */ },
  { name: "Bhutan", continent: "Asia", tier: 5, colors: ["#FFCC00", "#FFFFFF", "#FF6600"], stadium: "Changlimithang Stadium", capacity: 25e3, reputation: 3, region: "JAPAN" /* JAPAN */ },
  { name: "Hongkong", continent: "Asia", tier: 5, colors: ["#DE2910", "#FFFFFF", "#DE2910"], stadium: "Hong Kong Stadium", capacity: 4e4, reputation: 4, region: "JAPAN" /* JAPAN */ },
  { name: "Indie", continent: "Asia", tier: 5, colors: ["#FF9933", "#FFFFFF", "#138808"], stadium: "Salt Lake Stadium", capacity: 85e3, reputation: 8, region: "ARABIA" /* ARABIA */ },
  { name: "Kirgistan", continent: "Asia", tier: 5, colors: ["#E8112D", "#FFD100", "#E8112D"], stadium: "Dolen Omurzakov Stadium", capacity: 23e3, reputation: 8, region: "KAZAKH" /* KAZAKH */ },
  { name: "Malediwy", continent: "Asia", tier: 5, colors: ["#D21034", "#007A3D", "#D21034"], stadium: "National Football Stadium", capacity: 7e3, reputation: 5, region: "ARABIA" /* ARABIA */ },
  { name: "Mongolia", continent: "Asia", tier: 5, colors: ["#C4272F", "#0033A0", "#F9CF02"], stadium: "MFF Football Centre", capacity: 5e3, reputation: 3, region: "JAPAN" /* JAPAN */ },
  { name: "Nepal", continent: "Asia", tier: 5, colors: ["#DC143C", "#003893", "#DC143C"], stadium: "Dasarath Rangasala", capacity: 15e3, reputation: 5, region: "ARABIA" /* ARABIA */ },
  { name: "Pakistan", continent: "Asia", tier: 5, colors: ["#01411C", "#FFFFFF", "#01411C"], stadium: "Jinnah Sports Stadium", capacity: 3e4, reputation: 5, region: "ARABIA" /* ARABIA */ },
  { name: "Sri Lanka", continent: "Asia", tier: 5, colors: ["#8D153A", "#F9E547", "#1C4FA1"], stadium: "Racecourse Stadium", capacity: 35e3, reputation: 5, region: "ARABIA" /* ARABIA */ },
  { name: "Tad\u017Cykistan", continent: "Asia", tier: 5, colors: ["#CE1126", "#FFFFFF", "#007A3D"], stadium: "Central Republican Stadium", capacity: 23e3, reputation: 9, region: "EX_USSR" /* EX_USSR */ },
  { name: "Turkmenistan", continent: "Asia", tier: 5, colors: ["#009E60", "#FFFFFF", "#CE1126"], stadium: "Ashgabat Stadium", capacity: 2e4, reputation: 7, region: "KAZAKH" /* KAZAKH */ },
  { name: "Uzbekistan", continent: "Asia", tier: 4, colors: ["#0099B5", "#FFFFFF", "#1EB53A"], stadium: "Milliy Stadium", capacity: 34e3, reputation: 12, region: "KAZAKH" /* KAZAKH */ },
  {
    name: "Brunei",
    continent: "Asia",
    tier: 5,
    colors: ["#000000", "#FFFFFF", "#CF1126"],
    stadium: "Hassanal Bolkiah National Stadium",
    capacity: 28e3,
    reputation: 4,
    region: "JAPAN" /* JAPAN */
  },
  {
    name: "Chinese Taipei",
    continent: "Asia",
    tier: 5,
    colors: ["#002868", "#FFFFFF", "#CE1126"],
    stadium: "Kaohsiung National Stadium",
    capacity: 55e3,
    reputation: 6,
    region: "JAPAN" /* JAPAN */
  },
  {
    name: "Guam",
    continent: "Asia",
    tier: 5,
    colors: ["#0033A0", "#FFFFFF", "#CE1126"],
    stadium: "Guam National Football Stadium",
    capacity: 3500,
    reputation: 3,
    region: "JAPAN" /* JAPAN */
  }
];

// resources/static_db/NationalTeams/NationalTeamsCONCACAF.tsx
var NATIONAL_TEAMS_CONCACAF = [
  { name: "Stany Zjednoczone", continent: "North America", tier: 3, colors: ["#B22234", "#FFFFFF", "#3C3B6E"], stadium: "MetLife Stadium", capacity: 82500, reputation: 13, region: "NORTH_AMERICA" /* NORTH_AMERICA */ },
  { name: "Meksyk", continent: "North America", tier: 2, colors: ["#006847", "#FFFFFF", "#CE1126"], stadium: "Estadio Azteca", capacity: 87e3, reputation: 14, region: "MEXICO" /* MEXICO */ },
  { name: "Kanada", continent: "North America", tier: 3, colors: ["#D52B1E", "#FFFFFF", "#D52B1E"], stadium: "BMO Field", capacity: 3e4, reputation: 12, region: "NORTH_AMERICA" /* NORTH_AMERICA */ },
  { name: "Kostaryka", continent: "North America", tier: 2, colors: ["#002B7F", "#FFFFFF", "#CE1126"], stadium: "Estadio Nacional", capacity: 35e3, reputation: 12, region: "IBERIA" /* IBERIA */ },
  { name: "Panama", continent: "North America", tier: 2, colors: ["#0052A5", "#FFFFFF", "#EF3340"], stadium: "Estadio Rommel Fern\xE1ndez", capacity: 32e3, reputation: 12, region: "IBERIA" /* IBERIA */ },
  { name: "Honduras", continent: "North America", tier: 5, colors: ["#0073CF", "#FFFFFF", "#0073CF"], stadium: "Estadio Ol\xEDmpico Metropolitano", capacity: 38e3, reputation: 10, region: "IBERIA" /* IBERIA */ },
  { name: "Salwador", continent: "North America", tier: 4, colors: ["#0F47AF", "#FFFFFF", "#0F47AF"], stadium: "Estadio Cuscatl\xE1n", capacity: 53e3, reputation: 9, region: "IBERIA" /* IBERIA */ },
  { name: "Gwatemala", continent: "North America", tier: 5, colors: ["#4997D0", "#FFFFFF", "#4997D0"], stadium: "Estadio Doroteo Guamuch Flores", capacity: 26e3, reputation: 8, region: "IBERIA" /* IBERIA */ },
  { name: "Nikaragua", continent: "North America", tier: 5, colors: ["#0067C6", "#FFFFFF", "#0067C6"], stadium: "Estadio Nacional de F\xFAtbol", capacity: 15e3, reputation: 7, region: "IBERIA" /* IBERIA */ },
  { name: "Belize", continent: "North America", tier: 5, colors: ["#003F87", "#FFFFFF", "#CE1126"], stadium: "FFB Stadium", capacity: 5e3, reputation: 4, region: "ENGLAND" /* ENGLAND */ },
  { name: "Jamajka", continent: "North America", tier: 3, colors: ["#009B3A", "#FED100", "#000000"], stadium: "Independence Park", capacity: 35e3, reputation: 10, region: "NORTH_AMERICA" /* NORTH_AMERICA */ },
  { name: "Trynidad i Tobago", continent: "North America", tier: 3, colors: ["#CE1126", "#FFFFFF", "#000000"], stadium: "Hasely Crawford Stadium", capacity: 23e3, reputation: 9, region: "ENGLAND" /* ENGLAND */ },
  { name: "Haiti", continent: "North America", tier: 3, colors: ["#00209F", "#D21034", "#FFFFFF"], stadium: "Stade Sylvio Cator", capacity: 15e3, reputation: 9, region: "FRANCE" /* FRANCE */ },
  { name: "Cura\xE7ao", continent: "North America", tier: 3, colors: ["#0033A0", "#FFD100", "#CE1126"], stadium: "Ergilio Hato Stadium", capacity: 15e3, reputation: 9, region: "BENELUX" /* BENELUX */ },
  { name: "Surinam", continent: "North America", tier: 5, colors: ["#377E3F", "#FFFFFF", "#B40A2D"], stadium: "Andr\xE9 Kamperveen Stadium", capacity: 6e3, reputation: 7, region: "BENELUX" /* BENELUX */ },
  { name: "Kuba", continent: "North America", tier: 5, colors: ["#002A8F", "#FFFFFF", "#CF142B"], stadium: "Estadio Pedro Marrero", capacity: 3e4, reputation: 8, region: "IBERIA" /* IBERIA */ },
  { name: "Republika Dominikany", continent: "North America", tier: 5, colors: ["#002D62", "#FFFFFF", "#CE1126"], stadium: "Estadio Cibao FC", capacity: 14e3, reputation: 8, region: "IBERIA" /* IBERIA */ },
  { name: "Antigua i Barbuda", continent: "North America", tier: 5, colors: ["#000000", "#CE1126", "#FFFFFF"], stadium: "Sir Vivian Richards Stadium", capacity: 1e4, reputation: 5, region: "ENGLAND" /* ENGLAND */ },
  { name: "Aruba", continent: "North America", tier: 5, colors: ["#418FDE", "#FFD100", "#CE1126"], stadium: "Guillermo Prospero Trinidad Stadium", capacity: 8e3, reputation: 5, region: "BENELUX" /* BENELUX */ },
  { name: "Bahamy", continent: "North America", tier: 5, colors: ["#00ABC9", "#FFD100", "#000000"], stadium: "Thomas A. Robinson Stadium", capacity: 15e3, reputation: 4, region: "ENGLAND" /* ENGLAND */ },
  { name: "Barbados", continent: "North America", tier: 5, colors: ["#00267F", "#FFD100", "#000000"], stadium: "Wildey Turf", capacity: 3e3, reputation: 5, region: "ENGLAND" /* ENGLAND */ },
  { name: "Bermudy", continent: "North America", tier: 5, colors: ["#CE1126", "#FFFFFF", "#00247D"], stadium: "National Sports Centre", capacity: 8e3, reputation: 6, region: "ENGLAND" /* ENGLAND */ },
  { name: "Dominika", continent: "North America", tier: 5, colors: ["#006B3F", "#FFD100", "#000000"], stadium: "Windsor Park", capacity: 12e3, reputation: 4, region: "ENGLAND" /* ENGLAND */ },
  { name: "Grenada", continent: "North America", tier: 5, colors: ["#CE1126", "#FFD100", "#006B3F"], stadium: "Kirani James Athletic Stadium", capacity: 8e3, reputation: 5, region: "ENGLAND" /* ENGLAND */ },
  { name: "Kajmany", continent: "North America", tier: 5, colors: ["#00247D", "#FFFFFF", "#CF142B"], stadium: "Truman Bodden Sports Complex", capacity: 3e3, reputation: 4, region: "ENGLAND" /* ENGLAND */ },
  { name: "Montserrat", continent: "North America", tier: 5, colors: ["#00247D", "#FFFFFF", "#CF142B"], stadium: "Blakes Estate Stadium", capacity: 3e3, reputation: 3, region: "ENGLAND" /* ENGLAND */ },
  { name: "Saint Kitts i Nevis", continent: "North America", tier: 5, colors: ["#009E60", "#FCD116", "#CE1126"], stadium: "Warner Park Stadium", capacity: 8e3, reputation: 5, region: "ENGLAND" /* ENGLAND */ },
  { name: "Saint Lucia", continent: "North America", tier: 5, colors: ["#6CF", "#FFD100", "#000000"], stadium: "Daren Sammy Cricket Ground", capacity: 15e3, reputation: 5, region: "ENGLAND" /* ENGLAND */ },
  { name: "Saint Vincent i Grenadyny", continent: "North America", tier: 5, colors: ["#0052A5", "#FFD100", "#009E60"], stadium: "Arnos Vale Stadium", capacity: 18e3, reputation: 5, region: "ENGLAND" /* ENGLAND */ },
  { name: "Turks i Caicos", continent: "North America", tier: 5, colors: ["#00247D", "#FFFFFF", "#CF142B"], stadium: "TCIFA National Academy", capacity: 3e3, reputation: 3, region: "ENGLAND" /* ENGLAND */ },
  {
    name: "Anguilla",
    continent: "North America",
    tier: 5,
    colors: ["#FFFFFF", "#CE1126", "#00247D"],
    stadium: "Raymond E. Lee Football Field",
    capacity: 2500,
    reputation: 5,
    region: "ENGLAND" /* ENGLAND */
  },
  {
    name: "Brytyjskie Wyspy Dziewicze",
    continent: "North America",
    tier: 5,
    colors: ["#FFFFFF", "#00247D", "#CE1126"],
    stadium: "A.O. Shirley Recreation Ground",
    capacity: 5e3,
    reputation: 5,
    region: "ENGLAND" /* ENGLAND */
  },
  {
    name: "Francuska Gujana",
    continent: "North America",
    tier: 5,
    colors: ["#002395", "#FFFFFF", "#ED2939"],
    stadium: "Stade de Badminton",
    capacity: 7e3,
    reputation: 6,
    region: "FRANCE" /* FRANCE */
  },
  {
    name: "Gujana",
    continent: "North America",
    tier: 5,
    colors: ["#009E49", "#FFD100", "#CE1126"],
    stadium: "Providence Stadium",
    capacity: 15e3,
    reputation: 6,
    region: "ENGLAND" /* ENGLAND */
  },
  {
    name: "Portoryko",
    continent: "North America",
    tier: 5,
    colors: ["#002D62", "#FFFFFF", "#CE1126"],
    stadium: "Estadio Juan Ram\xF3n Loubriel",
    capacity: 22e3,
    reputation: 7,
    region: "IBERIA" /* IBERIA */
  },
  {
    name: "Stany Zjednoczone Wyspy Dziewicze",
    continent: "North America",
    tier: 5,
    colors: ["#FFFFFF", "#0033A0", "#CE1126"],
    stadium: "Lionel Roberts Stadium",
    capacity: 3500,
    reputation: 3,
    region: "ENGLAND" /* ENGLAND */
  },
  {
    name: "Bonaire",
    continent: "North America",
    tier: 5,
    colors: ["#FFFFFF", "#E30613", "#002395"],
    stadium: "Stadion Kralendijk",
    capacity: 3e3,
    reputation: 4,
    region: "BENELUX" /* BENELUX */
  },
  {
    name: "Gwadelupa",
    continent: "North America",
    tier: 5,
    colors: ["#002395", "#FFFFFF", "#ED2939"],
    stadium: "Stade Jos\xE9phine-Charlotte",
    capacity: 18e3,
    reputation: 6,
    region: "FRANCE" /* FRANCE */
  },
  {
    name: "Martynika",
    continent: "North America",
    tier: 5,
    colors: ["#002395", "#FFFFFF", "#ED2939"],
    stadium: "Stade Pierre-Aliker",
    capacity: 18e3,
    reputation: 7,
    region: "FRANCE" /* FRANCE */
  },
  {
    name: "Saint-Martin",
    continent: "North America",
    tier: 5,
    colors: ["#002395", "#FFFFFF", "#ED2939"],
    stadium: "Stade de Marigot",
    capacity: 2e3,
    reputation: 3,
    region: "FRANCE" /* FRANCE */
  },
  {
    name: "Sint Maarten",
    continent: "North America",
    tier: 5,
    colors: ["#CE1126", "#FFFFFF", "#00247D"],
    stadium: "Raoul Illidge Sports Complex",
    capacity: 3e3,
    reputation: 3,
    region: "BENELUX" /* BENELUX */
  }
];

// resources/static_db/NationalTeams/NationalTeamsCONMEBOL.tsx
var NATIONAL_TEAMS_CONMEBOL = [
  { name: "Argentyna", continent: "South America", tier: 1, colors: ["#75AADB", "#FFFFFF", "#75AADB"], stadium: "Estadio Monumental", capacity: 84567, reputation: 20, region: "ARGENTINA" /* ARGENTINA */ },
  { name: "Brazylia", continent: "South America", tier: 1, colors: ["#009C3B", "#FFDF00", "#002776"], stadium: "Maracan\xE3", capacity: 78838, reputation: 20, region: "BRAZIL" /* BRAZIL */ },
  { name: "Urugwaj", continent: "South America", tier: 2, colors: ["#6CACE4", "#FFFFFF", "#6CACE4"], stadium: "Estadio Centenario", capacity: 60235, reputation: 15, region: "ARGENTINA" /* ARGENTINA */ },
  { name: "Kolumbia", continent: "South America", tier: 2, colors: ["#FCD116", "#003893", "#CE1126"], stadium: "Estadio Metropolitano", capacity: 46e3, reputation: 14, region: "IBERIA" /* IBERIA */ },
  { name: "Chile", continent: "South America", tier: 2, colors: ["#0039A6", "#FFFFFF", "#D52B1E"], stadium: "Estadio Nacional", capacity: 48665, reputation: 13, region: "IBERIA" /* IBERIA */ },
  { name: "Peru", continent: "South America", tier: 3, colors: ["#D91023", "#FFFFFF", "#D91023"], stadium: "Estadio Nacional", capacity: 43086, reputation: 13, region: "IBERIA" /* IBERIA */ },
  { name: "Ekwador", continent: "South America", tier: 3, colors: ["#FCD116", "#003893", "#CE1126"], stadium: "Estadio Rodrigo Paz Delgado", capacity: 41575, reputation: 12, region: "IBERIA" /* IBERIA */ },
  { name: "Paragwaj", continent: "South America", tier: 3, colors: ["#D52B1E", "#FFFFFF", "#0038A8"], stadium: "Estadio Defensores del Chaco", capacity: 42e3, reputation: 11, region: "IBERIA" /* IBERIA */ },
  { name: "Boliwia", continent: "South America", tier: 3, colors: ["#D52B1E", "#FCD116", "#007A33"], stadium: "Estadio Hernando Siles", capacity: 41e3, reputation: 9, region: "IBERIA" /* IBERIA */ },
  { name: "Wenezuela", continent: "South America", tier: 3, colors: ["#F4C300", "#003DA5", "#C8102E"], stadium: "Estadio Ol\xEDmpico UCV", capacity: 24e3, reputation: 9, region: "IBERIA" /* IBERIA */ }
];

// resources/static_db/NationalTeams/NationalTeamsOFC.tsx
var NATIONAL_TEAMS_OFC = [
  { name: "Nowa Zelandia", continent: "Oceania", tier: 2, colors: ["#00247D", "#FFFFFF", "#CF142B"], stadium: "Eden Park", capacity: 5e4, reputation: 10, region: "OCEANIA" /* OCEANIA */ },
  { name: "Fid\u017Ci", continent: "Oceania", tier: 5, colors: ["#68BFE5", "#FFFFFF", "#CE1126"], stadium: "HFC Bank Stadium", capacity: 15e3, reputation: 5, region: "OCEANIA" /* OCEANIA */ },
  { name: "Wyspy Salomona", continent: "Oceania", tier: 5, colors: ["#215B33", "#0051BA", "#FCD116"], stadium: "Lawson Tama Stadium", capacity: 2e4, reputation: 5, region: "OCEANIA" /* OCEANIA */ },
  { name: "Papua-Nowa Gwinea", continent: "Oceania", tier: 5, colors: ["#000000", "#CE1126", "#FCD116"], stadium: "National Football Stadium", capacity: 15e3, reputation: 4, region: "OCEANIA" /* OCEANIA */ },
  { name: "Tahiti", continent: "Oceania", tier: 5, colors: ["#CE1126", "#FFFFFF", "#CE1126"], stadium: "Stade Pater", capacity: 1e4, reputation: 5, region: "OCEANIA" /* OCEANIA */ },
  { name: "Nowa Kaledonia", continent: "Oceania", tier: 5, colors: ["#0035AD", "#ED2939", "#009543"], stadium: "Stade Numa-Daly Magenta", capacity: 16e3, reputation: 5, region: "OCEANIA" /* OCEANIA */ },
  { name: "Vanuatu", continent: "Oceania", tier: 5, colors: ["#D21034", "#000000", "#009543"], stadium: "Korman Stadium", capacity: 6500, reputation: 5, region: "OCEANIA" /* OCEANIA */ },
  { name: "Samoa", continent: "Oceania", tier: 5, colors: ["#002B7F", "#CE1126", "#FFFFFF"], stadium: "Apia Park", capacity: 12e3, reputation: 4, region: "OCEANIA" /* OCEANIA */ },
  { name: "Samoa Ameryka\u0144skie", continent: "Oceania", tier: 5, colors: ["#002B7F", "#FFFFFF", "#CE1126"], stadium: "Pago Park Soccer Stadium", capacity: 2e3, reputation: 2, region: "OCEANIA" /* OCEANIA */ },
  { name: "Tonga", continent: "Oceania", tier: 5, colors: ["#CE1126", "#FFFFFF", "#CE1126"], stadium: "Teufaiva Sport Stadium", capacity: 1e4, reputation: 3, region: "OCEANIA" /* OCEANIA */ },
  { name: "Wyspy Cooka", continent: "Oceania", tier: 5, colors: ["#00247D", "#FFFFFF", "#CF142B"], stadium: "National Stadium (Rarotonga)", capacity: 3e3, reputation: 3, region: "OCEANIA" /* OCEANIA */ }
];

// services/PlayerMoraleService.ts
var DAY_MS = 24 * 60 * 60 * 1e3;

// constants.ts
var BOARD_LEVELS = ["bardzo_niska", "niska", "przecietna", "wysoka", "bardzo_wysoka"];
var generateRandomBoard = () => ({
  hojnosc: BOARD_LEVELS[Math.floor(Math.random() * 5)],
  ambicja: BOARD_LEVELS[Math.floor(Math.random() * 5)],
  cierpliwosc: BOARD_LEVELS[Math.floor(Math.random() * 5)],
  chciwosc: BOARD_LEVELS[Math.floor(Math.random() * 5)],
  oczekiwania: BOARD_LEVELS[Math.floor(Math.random() * 5)],
  kompetencja: BOARD_LEVELS[Math.floor(Math.random() * 5)]
});
var REGION_NATIONALITY_LABEL = {
  ["POLAND" /* POLAND */]: "Polska",
  ["GERMANY" /* GERMANY */]: "Niemcy",
  ["SPAIN" /* SPAIN */]: "Hiszpania",
  ["ENGLAND" /* ENGLAND */]: "Anglia",
  ["ITALY" /* ITALY */]: "W\u0142ochy",
  ["FRANCE" /* FRANCE */]: "Francja",
  ["BALKANS" /* BALKANS */]: "Ba\u0142kany",
  ["CZ_SK" /* CZ_SK */]: "Czechy/S\u0142owacja",
  ["SSA" /* SSA */]: "Afryka Subsaharyjska",
  ["IBERIA" /* IBERIA */]: "P\xF3\u0142wysep Iberyjski",
  ["NORTH_AMERICA" /* NORTH_AMERICA */]: "Ameryka P\xF3\u0142nocna",
  ["MEXICO" /* MEXICO */]: "Meksyk",
  ["OCEANIA" /* OCEANIA */]: "Oceania",
  ["SWEDEN" /* SWEDEN */]: "Szwecja",
  ["SCANDINAVIA" /* SCANDINAVIA */]: "Skandynawia",
  ["EX_USSR" /* EX_USSR */]: "Europa Wschodnia",
  ["JAPAN" /* JAPAN */]: "Japonia",
  ["KOREA" /* KOREA */]: "Korea",
  ["ARGENTINA" /* ARGENTINA */]: "Argentyna",
  ["BRAZIL" /* BRAZIL */]: "Brazylia",
  ["TURKEY" /* TURKEY */]: "Turcja",
  ["ARABIA" /* ARABIA */]: "Arabia",
  ["FINLAND" /* FINLAND */]: "Finlandia",
  ["GEORGIA" /* GEORGIA */]: "Gruzja",
  ["ARMENIA" /* ARMENIA */]: "Armenia",
  ["ALBANIA" /* ALBANIA */]: "Albania",
  ["ROMANIA" /* ROMANIA */]: "Rumunia",
  ["BALTIC" /* BALTIC */]: "Kraje Ba\u0142tyckie",
  ["BENELUX" /* BENELUX */]: "Benelux",
  ["HUNGARIAN" /* HUNGARIAN */]: "W\u0119gry",
  ["MALTESE" /* MALTESE */]: "Malta",
  ["ISRAELI" /* ISRAELI */]: "Izrael",
  ["GREEK" /* GREEK */]: "Grecja",
  ["AZERBAIJANI" /* AZERBAIJANI */]: "Azerbejd\u017Can",
  ["KAZAKH" /* KAZAKH */]: "Kazachstan",
  ["SOUTH_AMERICAN" /* SOUTH_AMERICAN */]: "Ameryka Po\u0142udniowa"
};
var generateNTId = (name) => `NT_${name.toUpperCase().replace(/\s+/g, "_")}`;
var processNT = (data) => data.map((t) => ({
  ...t,
  id: generateNTId(t.name),
  colorsHex: t.colors,
  stadiumName: t.stadium,
  stadiumCapacity: t.capacity
}));
var STATIC_NATIONAL_TEAMS = [
  ...processNT(NATIONAL_TEAMS_EUROPE),
  ...processNT(NATIONAL_TEAMS_AFRICA),
  ...processNT(NATIONAL_TEAMS_CONCACAF),
  ...processNT(NATIONAL_TEAMS_CONMEBOL),
  ...processNT(NATIONAL_TEAMS_OFC),
  ...processNT(NATIONAL_TEAMS_AFC)
];
var STATIC_LEAGUES = [
  { id: "L_PL_1", name: "Ekstraklasa", level: "TIER_1" /* TIER_1 */, teamIds: [] },
  { id: "L_PL_2", name: "1. Liga", level: "TIER_2" /* TIER_2 */, teamIds: [] },
  { id: "L_PL_3", name: "2. Liga", level: "TIER_3" /* TIER_3 */, teamIds: [] },
  { id: "L_PL_4", name: "Liga Regionalna (starsze kariery)", level: "TIER_4_HIDDEN" /* TIER_4_HIDDEN */, teamIds: [] },
  { id: "L_PL_4_G1", name: "Betclic 3. Liga \u2013 Grupa 1", level: "TIER_4_HIDDEN" /* TIER_4_HIDDEN */, teamIds: [] },
  { id: "L_PL_4_G2", name: "Betclic 3. Liga \u2013 Grupa 2", level: "TIER_4_HIDDEN" /* TIER_4_HIDDEN */, teamIds: [] },
  { id: "L_PL_4_G3", name: "Betclic 3. Liga \u2013 Grupa 3", level: "TIER_4_HIDDEN" /* TIER_4_HIDDEN */, teamIds: [] },
  { id: "L_PL_4_G4", name: "Betclic 3. Liga \u2013 Grupa 4", level: "TIER_4_HIDDEN" /* TIER_4_HIDDEN */, teamIds: [] },
  { id: "L_PL_5", name: "Regionalna pula IV lig", level: "TIER_4_HIDDEN" /* TIER_4_HIDDEN */, teamIds: [] },
  { id: "L_CL", name: "UEFA Champions League", level: "EUROPEAN" /* EUROPEAN */, teamIds: [] },
  { id: "L_EL", name: "UEFA Europa League", level: "EUROPEAN" /* EUROPEAN */, teamIds: [] },
  { id: "L_CONF", name: "UEFA Conference League", level: "EUROPEAN" /* EUROPEAN */, teamIds: [] }
];
var generatePlaceholderClub = (leagueId, index, tier) => {
  const id = `PL_TIER${tier}_PLACEHOLDER_${String(index).padStart(3, "0")}`;
  const budget = FinanceService.calculateInitialBudget(tier, 1);
  return {
    id,
    name: `Klub Placeholder ${index}`,
    shortName: `P${index}`,
    leagueId,
    tier,
    colorsHex: ["#808080", "#FFFFFF", "#000000"],
    budget,
    stadiumName: "Stadion Miejski TBD",
    stadiumCapacity: 1e3,
    reputation: 1,
    isDefaultActive: true,
    colorPrimary: "#808080",
    colorSecondary: "#FFFFFF",
    rosterIds: [],
    stats: {
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      played: 0,
      form: []
    },
    boardStrictness: Math.floor(Math.random() * 10) + 1,
    transferBudget: FinanceService.calculateInitialTransferBudget(budget, 1),
    reserveBudget: FinanceService.calculateInitialReserveBudget(budget, 1),
    boardBudgetRequestsThisSeason: 0,
    signingBonusPool: 0,
    board: generateRandomBoard(),
    boardConfidence: 75
  };
};
var loadClubsForTier = (tier, leagueId, limit) => {
  const rawClubs = RAW_PL_CLUBS.filter((c) => c.tier === tier);
  const clubs = [];
  rawClubs.forEach((raw, index) => {
    const isActive = index < limit;
    const assignedLeagueId = isActive ? leagueId : "NONE";
    const budget = FinanceService.calculateInitialBudget(tier, raw.reputation);
    const club = {
      id: generateClubId(raw.name),
      name: raw.name,
      shortName: raw.name.substring(0, 3).toUpperCase(),
      leagueId: assignedLeagueId,
      tier: raw.tier,
      colorsHex: raw.colors,
      stadiumName: raw.stadium,
      stadiumCapacity: raw.capacity,
      reputation: raw.reputation,
      isDefaultActive: isActive,
      budget,
      transferBudget: FinanceService.calculateInitialTransferBudget(budget, raw.reputation),
      reserveBudget: FinanceService.calculateInitialReserveBudget(budget, raw.reputation),
      boardBudgetRequestsThisSeason: 0,
      boardStrictness: Math.floor(Math.random() * 10) + 1,
      signingBonusPool: FinanceService.calculateInitialSigningPool(
        budget,
        raw.reputation
      ),
      logoFile: raw.logoFile,
      stadiumSeatColors: raw.stadiumSeatColors,
      board: generateRandomBoard(),
      boardConfidence: 75,
      colorPrimary: raw.colors[0],
      colorSecondary: raw.colors[1] || "#FFFFFF",
      rosterIds: [],
      stats: {
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        played: 0,
        form: []
      }
    };
    clubs.push(club);
  });
  if (tier < 4) {
    const activeCount = clubs.filter((c) => c.isDefaultActive).length;
    if (activeCount < limit) {
      const missing = limit - activeCount;
      for (let i = 0; i < missing; i++) {
        clubs.push(generatePlaceholderClub(leagueId, i + 1, tier));
      }
    }
  }
  return clubs;
};
var clubsTier1 = loadClubsForTier(1, "L_PL_1", 18);
var clubsTier2 = loadClubsForTier(2, "L_PL_2", 18);
var clubsTier3 = loadClubsForTier(3, "L_PL_3", 18);
var clubsTier4 = loadClubsForTier(4, "L_PL_5", 100);
var STATIC_CLUBS = [
  ...clubsTier1,
  ...clubsTier2,
  ...clubsTier3,
  ...clubsTier4
];
var STATIC_CL_CLUBS = RAW_CHAMPIONS_LEAGUE_CLUBS.map((raw) => {
  const budget = FinanceService.calculateEuropeanInitialBudget(raw.tier, raw.reputation, raw.country, raw.name, raw.capacity);
  return {
    id: generateEuropeanClubId(raw.name),
    name: raw.name,
    shortName: raw.name.split(" ").pop()?.substring(0, 6).toUpperCase() || raw.name.substring(0, 6).toUpperCase(),
    leagueId: "L_CL",
    tier: raw.tier,
    colorsHex: raw.colors,
    stadiumName: raw.stadium,
    stadiumCapacity: raw.capacity,
    reputation: raw.reputation,
    country: raw.country,
    isDefaultActive: true,
    colorPrimary: raw.colors[0],
    colorSecondary: raw.colors[1] || "#FFFFFF",
    rosterIds: [],
    budget,
    transferBudget: FinanceService.calculateInitialTransferBudget(budget, raw.reputation),
    reserveBudget: FinanceService.calculateInitialReserveBudget(budget, raw.reputation),
    boardBudgetRequestsThisSeason: 0,
    boardStrictness: 5,
    signingBonusPool: FinanceService.calculateInitialSigningPool(budget, raw.reputation),
    stats: { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 0, form: [] },
    isInPolishCup: false,
    board: generateRandomBoard(),
    boardConfidence: 75
  };
});
var STATIC_EL_CLUBS = RAW_EUROPA_LEAGUE_CLUBS.map((raw) => {
  const budget = FinanceService.calculateEuropeanInitialBudget(raw.tier, raw.reputation, raw.country, raw.name, raw.capacity);
  return {
    id: generateELClubId(raw.name),
    name: raw.name,
    shortName: raw.name.split(" ").pop()?.substring(0, 6).toUpperCase() || raw.name.substring(0, 6).toUpperCase(),
    leagueId: "L_EL",
    tier: raw.tier,
    colorsHex: raw.colors,
    stadiumName: raw.stadium,
    stadiumCapacity: raw.capacity,
    reputation: raw.reputation,
    country: raw.country,
    isDefaultActive: true,
    colorPrimary: raw.colors[0],
    colorSecondary: raw.colors[1] || "#FFFFFF",
    rosterIds: [],
    budget,
    transferBudget: FinanceService.calculateInitialTransferBudget(budget, raw.reputation),
    reserveBudget: FinanceService.calculateInitialReserveBudget(budget, raw.reputation),
    boardBudgetRequestsThisSeason: 0,
    boardStrictness: 5,
    signingBonusPool: FinanceService.calculateInitialSigningPool(budget, raw.reputation),
    stats: { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 0, form: [] },
    isInPolishCup: false,
    board: generateRandomBoard(),
    boardConfidence: 75
  };
});
var STATIC_CONF_CLUBS = RAW_CONFERENCE_LEAGUE_CLUBS.map((raw) => {
  const budget = FinanceService.calculateEuropeanInitialBudget(raw.tier, raw.reputation, raw.country, raw.name, raw.capacity);
  return {
    id: generateCONFClubId(raw.name),
    name: raw.name,
    shortName: raw.name.split(" ").pop()?.substring(0, 6).toUpperCase() || raw.name.substring(0, 6).toUpperCase(),
    leagueId: "L_CONF",
    tier: raw.tier,
    colorsHex: raw.colors,
    stadiumName: raw.stadium,
    stadiumCapacity: raw.capacity,
    reputation: raw.reputation,
    country: raw.country,
    isDefaultActive: true,
    colorPrimary: raw.colors[0],
    colorSecondary: raw.colors[1] || "#FFFFFF",
    rosterIds: [],
    budget,
    transferBudget: FinanceService.calculateInitialTransferBudget(budget, raw.reputation),
    reserveBudget: FinanceService.calculateInitialReserveBudget(budget, raw.reputation),
    boardBudgetRequestsThisSeason: 0,
    boardStrictness: 5,
    signingBonusPool: FinanceService.calculateInitialSigningPool(budget, raw.reputation),
    stats: { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 0, form: [] },
    isInPolishCup: false
  };
});
var buildInternationalClub = (raw, id, leagueId) => {
  const budget = FinanceService.calculateInitialBudget(raw.tier, raw.reputation);
  return {
    id,
    name: raw.name,
    shortName: raw.name.split(" ").pop()?.substring(0, 6).toUpperCase() || raw.name.substring(0, 6).toUpperCase(),
    leagueId,
    tier: raw.tier,
    colorsHex: raw.colors,
    stadiumName: raw.stadium,
    stadiumCapacity: raw.capacity,
    reputation: raw.reputation,
    country: raw.country,
    isDefaultActive: true,
    colorPrimary: raw.colors[0],
    colorSecondary: raw.colors[1] || "#FFFFFF",
    rosterIds: [],
    budget,
    transferBudget: FinanceService.calculateInitialTransferBudget(budget, raw.reputation),
    reserveBudget: FinanceService.calculateInitialReserveBudget(budget, raw.reputation),
    boardBudgetRequestsThisSeason: 0,
    boardStrictness: 5,
    signingBonusPool: FinanceService.calculateInitialSigningPool(budget, raw.reputation),
    stats: { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 0, form: [] },
    isInPolishCup: false,
    board: generateRandomBoard(),
    boardConfidence: 75
  };
};
var STATIC_SA_CLUBS = CLUBS_SOUTH_AMERICA.map(
  (raw) => buildInternationalClub(raw, generateSAClubId(raw.name), "L_SA")
);
var STATIC_ASIAN_CLUBS = CLUBS_ASIAN.map(
  (raw) => buildInternationalClub(raw, generateAsianClubId(raw.name), "L_ASIA")
);
var STATIC_AFRICAN_CLUBS = CLUBS_AFRICAN.map(
  (raw) => buildInternationalClub(raw, generateAfricanClubId(raw.name), "L_AFRICA")
);
var STATIC_NA_CLUBS = CLUBS_NORTH_AMERICA.map(
  (raw) => buildInternationalClub(raw, generateNorthAmericaClubId(raw.name), "L_NA")
);
STATIC_LEAGUES.forEach((l) => {
  l.teamIds = [...STATIC_CLUBS, ...STATIC_CL_CLUBS, ...STATIC_EL_CLUBS, ...STATIC_CONF_CLUBS].filter((c) => c.leagueId === l.id && c.isDefaultActive).map((c) => c.id);
});

// services/PolishThirdLeagueService.ts
var THIRD_LEAGUE_GROUP_IDS = [
  "L_PL_4_G1",
  "L_PL_4_G2",
  "L_PL_4_G3",
  "L_PL_4_G4"
];
var GROUP_BY_VOIVODESHIP = {
  "\u0142\xF3dzkie": "L_PL_4_G1",
  "mazowieckie": "L_PL_4_G1",
  "podlaskie": "L_PL_4_G1",
  "warmi\u0144sko-mazurskie": "L_PL_4_G1",
  "kujawsko-pomorskie": "L_PL_4_G2",
  "pomorskie": "L_PL_4_G2",
  "wielkopolskie": "L_PL_4_G2",
  "zachodniopomorskie": "L_PL_4_G2",
  "dolno\u015Bl\u0105skie": "L_PL_4_G3",
  "lubuskie": "L_PL_4_G3",
  "opolskie": "L_PL_4_G3",
  "\u015Bl\u0105skie": "L_PL_4_G3",
  "lubelskie": "L_PL_4_G4",
  "ma\u0142opolskie": "L_PL_4_G4",
  "podkarpackie": "L_PL_4_G4",
  "\u015Bwi\u0119tokrzyskie": "L_PL_4_G4"
};
var PolishThirdLeagueService = {
  isThirdLeagueId(leagueId) {
    return THIRD_LEAGUE_GROUP_IDS.includes(leagueId);
  },
  isThirdLeagueClub(club) {
    return this.isThirdLeagueId(club.leagueId);
  },
  getGroupForVoivodeship(voivodeship) {
    return GROUP_BY_VOIVODESHIP[voivodeship];
  },
  getGroupForClub(club) {
    if (!club.polishVoivodeship) {
      throw new Error(`Club ${club.id} cannot be routed to III liga: polishVoivodeship is missing.`);
    }
    return GROUP_BY_VOIVODESHIP[club.polishVoivodeship];
  },
  getPolishTier(leagueId) {
    if (this.isThirdLeagueId(leagueId) || leagueId === "L_PL_4") return 4;
    if (leagueId === "L_PL_5") return 5;
    const match = /^L_PL_([1-3])$/.exec(leagueId ?? "");
    return match ? Number(match[1]) : null;
  }
};

// services/PolishLeagueSeasonService.ts
var SEASON_2025_26 = {
  L_PL_1: [
    "PL_LEGIA_WARSZAWA",
    "PL_LECH_POZNAN",
    "PL_JAGIELLONIA_BIALYSTOK",
    "PL_RAKOW_CZESTOCHOWA",
    "PL_POGON_SZCZECIN",
    "PL_GORNIK_ZABRZE",
    "PL_CRACOVIA",
    "PL_ZAGLEBIE_LUBIN",
    "PL_WIDZEW_LODZ",
    "PL_LECHIA_GDANSK",
    "PL_PIAST_GLIWICE",
    "PL_ARKA_GDYNIA",
    "PL_KORONA_KIELCE",
    "PL_RADOMIAK_RADOM",
    "PL_MOTOR_LUBLIN",
    "PL_GKS_KATOWICE",
    "PL_TERMALICA_NIECIECZA",
    "PL_WISLA_PLOCK"
  ],
  L_PL_2: [
    "PL_WISLA_KRAKOW",
    "PL_POGON_GRODZISK_MAZOWIECKI",
    "PL_POLONIA_BYTOM",
    "PL_CHROBRY_GLOGOW",
    "PL_STAL_RZESZOW",
    "PL_SLASK_WROCLAW",
    "PL_POLONIA_WARSZAWA",
    "PL_WIECZYSTA_KRAKOW",
    "PL_RUCH_CHORZOW",
    "PL_MIEDZ_LEGNICA",
    "PL_LKS_LODZ",
    "PL_POGON_SIEDLCE",
    "PL_ODRA_OPOLE",
    "PL_PUSZCZA_NIEPOLOMICE",
    "PL_ZNICZ_PRUSZKOW",
    "PL_STAL_MIELEC",
    "PL_GKS_TYCHY",
    "PL_GORNIK_LECZNA"
  ],
  L_PL_3: [
    "PL_UNIA_SKIERNIEWICE",
    "PL_WARTA_POZNAN",
    "PL_OLIMPIA_GRUDZIADZ",
    "PL_PODBESKIDZIE_BIELSKO_BIALA",
    "PL_SLASK_WROCLAW_II",
    "PL_SANDECJA_NOWY_SACZ",
    "PL_PODHALE_NOWY_TARG",
    "PL_CHOJNICZANKA_CHOJNICE",
    "PL_REKORD_BIELSKO_BIALA",
    "PL_STAL_STALOWA_WOLA",
    "PL_HUTNIK_KRAKOW",
    "PL_SWIT_SZCZECIN",
    "PL_RESOVIA",
    "PL_SOKOL_KLECZEW",
    "PL_ZAGLEBIE_SOSNOWIEC",
    "PL_KKS_1925_KALISZ",
    "PL_LKS_II_LODZ",
    "PL_GKS_JASTRZEBIE"
  ]
};
var SEASON_2026_27 = {
  L_PL_1: [
    "PL_LEGIA_WARSZAWA",
    "PL_JAGIELLONIA_BIALYSTOK",
    "PL_LECH_POZNAN",
    "PL_WISLA_PLOCK",
    "PL_GKS_KATOWICE",
    "PL_GORNIK_ZABRZE",
    "PL_POGON_SZCZECIN",
    "PL_WISLA_KRAKOW",
    "PL_SLASK_WROCLAW",
    "PL_ZAGLEBIE_LUBIN",
    "PL_PIAST_GLIWICE",
    "PL_RADOMIAK_RADOM",
    "PL_WIDZEW_LODZ",
    "PL_MOTOR_LUBLIN",
    "PL_CRACOVIA",
    "PL_KORONA_KIELCE",
    "PL_RAKOW_CZESTOCHOWA",
    "PL_WIECZYSTA_KRAKOW"
  ],
  L_PL_2: [
    "PL_ARKA_GDYNIA",
    "PL_POGON_GRODZISK_MAZOWIECKI",
    "PL_POLONIA_WARSZAWA",
    "PL_TERMALICA_NIECIECZA",
    "PL_MIEDZ_LEGNICA",
    "PL_STAL_MIELEC",
    "PL_LKS_LODZ",
    "PL_CHROBRY_GLOGOW",
    "PL_WARTA_POZNAN",
    "PL_POLONIA_BYTOM",
    "PL_ODRA_OPOLE",
    "PL_PODBESKIDZIE_BIELSKO_BIALA",
    "PL_POGON_SIEDLCE",
    "PL_PUSZCZA_NIEPOLOMICE",
    "PL_UNIA_SKIERNIEWICE",
    "PL_RUCH_CHORZOW",
    "PL_LECHIA_GDANSK",
    "PL_STAL_RZESZOW"
  ],
  L_PL_3: [
    "PL_AVIA_SWIDNIK",
    "PL_GKS_TYCHY",
    "PL_ZNICZ_PRUSZKOW",
    "PL_REKORD_BIELSKO_BIALA",
    "PL_HUTNIK_KRAKOW",
    "PL_SANDECJA_NOWY_SACZ",
    "PL_PODHALE_NOWY_TARG",
    "PL_SLASK_WROCLAW_II",
    "PL_STAL_STALOWA_WOLA",
    "PL_GORNIK_LECZNA",
    "PL_LECHIA_ZIELONA_GORA",
    "PL_SOKOL_KLECZEW",
    "PL_OLIMPIA_GRUDZIADZ",
    "PL_ZAWISZA_BYDGOSZCZ",
    "PL_LEGIA_WARSZAWA_II",
    "PL_SWIT_SZCZECIN",
    "PL_CHOJNICZANKA_CHOJNICE",
    "PL_RESOVIA"
  ],
  L_PL_4_G1: [
    "PL_KTS_WESZLO_WARSZAWA",
    "PL_WIDZEW_LODZ_II",
    "PL_MAZOVIA_MINSK_MAZOWIECKI",
    "PL_PELIKAN_LOWICZ",
    "PL_LECHIA_TOMASZOW_MAZOWIECKI",
    "PL_WIGRY_SUWALKI",
    "PL_OLIMPIA_ZAMBROW",
    "PL_SWIT_NOWY_DWOR_MAZOWIECKI",
    "PL_WISLA_PLOCK_II",
    "PL_JAGIELLONIA_BIALYSTOK_II",
    "PL_OLIMPIA_ELBLAG",
    "PL_WARTA_SIERADZ",
    "PL_ZABKOVIA_ZABKI",
    "PL_MLAWIANKA_MLAWA",
    "PL_LKS_LOMZA",
    "PL_POLONIA_LIDZBARK_WARMINSKI",
    "PL_KS_CK_TROSZYN",
    "PL_LKS_II_LODZ"
  ],
  L_PL_4_G2: [
    "PL_POLONIA_SRODA_WIELKOPOLSKA",
    "PL_WDA_SWIECIE",
    "PL_WIKED_LUZINO",
    "PL_MKS_FLOTA_SWINOUJSCIE",
    "PL_LECH_POZNAN_II",
    "PL_ZKS_KLUCZEVIA_STARGARD",
    "PL_NOTEC_CZARNKOW",
    "PL_KKS_1925_KALISZ",
    "PL_BLEKITNI_STARGARD",
    "PL_GEDANIA_GDANSK",
    "PL_SKS_UNIA_SWARZEDZ",
    "PL_ELANA_TORUN",
    "PL_CHEMIK_BYDGOSZCZ",
    "PL_BALTYK_KOSZALIN",
    "PL_GROM_NOWY_STAW",
    "PL_MKS_VIKTORIA_WRZESNIA",
    "PL_KS_LIPNO_STESZEW",
    "PL_KOTWICA_KORNIK"
  ],
  L_PL_4_G3: [
    "PL_ODRA_BYTOM_ODRZANSKI",
    "PL_ZAGLEBIE_LUBIN_II",
    "PL_ZAGLEBIE_SOSNOWIEC",
    "PL_BARYCZ_SULOW",
    "PL_BKS_SPARTA_KATOWICE",
    "PL_ROW_RYBNIK",
    "PL_STAL_BRZEG",
    "PL_KARKONOSZE_JELENIA_GORA",
    "PL_GORNIK_POLKOWICE",
    "PL_WARTA_GORZOW_WIELKOPOLSKI",
    "PL_STILON_GORZOW",
    "PL_MKS_KLUCZBORK",
    "PL_POLONIA_NYSA",
    "PL_LKS_GOCZALKOWICE_ZDROJ",
    "PL_MKP_CARINA_GUBIN",
    "PL_SLEZA_WROCLAW",
    "PL_MIEDZ_LEGNICA_II",
    "PL_RAKOW_CZESTOCHOWA_II"
  ],
  L_PL_4_G4: [
    "PL_CHELMIANKA_CHELM",
    "PL_WISLANIE_SKAWINA",
    "PL_KSZO_OSTROWIEC",
    "PL_WISLA_KRAKOW_II",
    "PL_MKS_CZARNI_POLANIEC",
    "PL_WIECZYSTA_KRAKOW_II",
    "PL_JKS_JAROSLAW",
    "PL_WISLOKA_DEBICA",
    "PL_MKS_PODLASIE_BIALA_PODLASKA",
    "PL_HETMAN_ZAMOSC",
    "PL_MORAVIA_MORAWICA",
    "PL_KS_NAPRZOD_JEDRZEJOW",
    "PL_SOKOL_KOLBUSZOWA_DOLNA",
    "PL_AKS_1947_BUSKO_ZDROJ",
    "PL_STAR_STARACHOWICE",
    "PL_SIARKA_TARNOBRZEG",
    "PL_KORONA_KIELCE_II",
    "PL_POGON_SOKOL_LUBACZOW"
  ]
};
var MEMBERSHIPS_BY_START_YEAR = {
  2025: SEASON_2025_26,
  2026: SEASON_2026_27
};
var leagueTier = (leagueId) => THIRD_LEAGUE_GROUP_IDS.includes(leagueId) ? 4 : Number(leagueId.slice(-1));
var DEFAULT_GROUP_VOIVODESHIP = {
  L_PL_4_G1: "mazowieckie",
  L_PL_4_G2: "wielkopolskie",
  L_PL_4_G3: "\u015Bl\u0105skie",
  L_PL_4_G4: "ma\u0142opolskie"
};
var CLUB_VOIVODESHIPS = {
  PL_LEGIA_WARSZAWA: "mazowieckie",
  PL_POLONIA_WARSZAWA: "mazowieckie",
  PL_RADOMIAK_RADOM: "mazowieckie",
  PL_POGON_GRODZISK_MAZOWIECKI: "mazowieckie",
  PL_POGON_SIEDLCE: "mazowieckie",
  PL_ZNICZ_PRUSZKOW: "mazowieckie",
  PL_LEGIA_WARSZAWA_II: "mazowieckie",
  PL_LECH_POZNAN: "wielkopolskie",
  PL_WARTA_POZNAN: "wielkopolskie",
  PL_SOKOL_KLECZEW: "wielkopolskie",
  PL_KKS_1925_KALISZ: "wielkopolskie",
  PL_UNIA_SKIERNIEWICE: "\u0142\xF3dzkie",
  PL_WIDZEW_LODZ: "\u0142\xF3dzkie",
  PL_LKS_LODZ: "\u0142\xF3dzkie",
  PL_LKS_II_LODZ: "\u0142\xF3dzkie",
  PL_JAGIELLONIA_BIALYSTOK: "podlaskie",
  PL_WISLA_PLOCK: "mazowieckie",
  PL_ARKA_GDYNIA: "pomorskie",
  PL_LECHIA_GDANSK: "pomorskie",
  PL_CHOJNICZANKA_CHOJNICE: "pomorskie",
  PL_OLIMPIA_GRUDZIADZ: "kujawsko-pomorskie",
  PL_ZAWISZA_BYDGOSZCZ: "kujawsko-pomorskie",
  PL_POGON_SZCZECIN: "zachodniopomorskie",
  PL_SWIT_SZCZECIN: "zachodniopomorskie",
  PL_SLASK_WROCLAW: "dolno\u015Bl\u0105skie",
  PL_SLASK_WROCLAW_II: "dolno\u015Bl\u0105skie",
  PL_ZAGLEBIE_LUBIN: "dolno\u015Bl\u0105skie",
  PL_MIEDZ_LEGNICA: "dolno\u015Bl\u0105skie",
  PL_CHROBRY_GLOGOW: "dolno\u015Bl\u0105skie",
  PL_LECHIA_ZIELONA_GORA: "lubuskie",
  PL_ODRA_OPOLE: "opolskie",
  PL_GORNIK_ZABRZE: "\u015Bl\u0105skie",
  PL_GKS_KATOWICE: "\u015Bl\u0105skie",
  PL_GKS_TYCHY: "\u015Bl\u0105skie",
  PL_PIAST_GLIWICE: "\u015Bl\u0105skie",
  PL_RUCH_CHORZOW: "\u015Bl\u0105skie",
  PL_REKORD_BIELSKO_BIALA: "\u015Bl\u0105skie",
  PL_PODBESKIDZIE_BIELSKO_BIALA: "\u015Bl\u0105skie",
  PL_POLONIA_BYTOM: "\u015Bl\u0105skie",
  PL_CRACOVIA: "ma\u0142opolskie",
  PL_WISLA_KRAKOW: "ma\u0142opolskie",
  PL_WIECZYSTA_KRAKOW: "ma\u0142opolskie",
  PL_TERMALICA_NIECIECZA: "ma\u0142opolskie",
  PL_PUSZCZA_NIEPOLOMICE: "ma\u0142opolskie",
  PL_HUTNIK_KRAKOW: "ma\u0142opolskie",
  PL_SANDECJA_NOWY_SACZ: "ma\u0142opolskie",
  PL_PODHALE_NOWY_TARG: "ma\u0142opolskie",
  PL_RAKOW_CZESTOCHOWA: "\u015Bl\u0105skie",
  PL_MOTOR_LUBLIN: "lubelskie",
  PL_GORNIK_LECZNA: "lubelskie",
  PL_AVIA_SWIDNIK: "lubelskie",
  PL_STAL_RZESZOW: "podkarpackie",
  PL_STAL_MIELEC: "podkarpackie",
  PL_STAL_STALOWA_WOLA: "podkarpackie",
  PL_RESOVIA: "podkarpackie",
  PL_KORONA_KIELCE: "\u015Bwi\u0119tokrzyskie",
  PL_GKS_BELCHATOW: "\u0142\xF3dzkie",
  PL_BRON_RADOM: "mazowieckie",
  PL_WIKIELEC: "warmi\u0144sko-mazurskie",
  PL_STOMIL_OLSZTYN: "warmi\u0144sko-mazurskie",
  PL_SOKOL_OSTRODA: "warmi\u0144sko-mazurskie",
  PL_KS_WASILKOW: "podlaskie",
  PL_MLKS_ZNICZ_BIALA_PISKA: "warmi\u0144sko-mazurskie",
  PL_CARTUSIA_KARTUZY: "pomorskie",
  PL_POGON_NOWE_SKALMIERZYCE: "wielkopolskie",
  PL_GZS_TLUCHOVIA_TLUCHOWO: "kujawsko-pomorskie",
  PL_LKS_WYBRZEZE_REWALSKIE_REWAL: "zachodniopomorskie",
  PL_GWARDIA_KOSZALIN: "zachodniopomorskie",
  PL_BALTYK_GDYNIA: "pomorskie",
  PL_VINETA_WOLIN: "zachodniopomorskie",
  PL_CHEMIK_POLICE: "zachodniopomorskie",
  PL_UNIA_JANIKOWO: "kujawsko-pomorskie",
  PL_POLONIA_BYDGOSZCZ: "kujawsko-pomorskie",
  PL_SKRA_CZESTOCHOWA: "\u015Bl\u0105skie",
  PL_SLOWIANIN_WOLIBORZ: "dolno\u015Bl\u0105skie",
  PL_PNIOWEK_PAWLOWICE_SLASKIE: "\u015Bl\u0105skie",
  PL_LZS_STAROWICE: "opolskie",
  PL_MKS_STAL_JASIEN: "lubuskie",
  PL_LECHIA_DZIERZONIOW: "dolno\u015Bl\u0105skie",
  PL_FOTO_HIGIENA_GAC: "dolno\u015Bl\u0105skie",
  PL_WLOKNIARZ_CZESTOCHOWA: "\u015Bl\u0105skie",
  PL_VICTORIA_CZESTOCHOWA: "\u015Bl\u0105skie",
  PL_FKS_STAL_KRASNIK: "lubelskie",
  PL_SWIDNICZANKA_SWIDNIK: "lubelskie",
  PL_SPARTA_KAZIMIERZA_WIELKA: "\u015Bwi\u0119tokrzyskie",
  PL_WISLANIE_JASKOWICE: "ma\u0142opolskie",
  PL_WISLA_PULAWY: "lubelskie"
};
var PolishLeagueSeasonService = {
  getMembership(startYear) {
    return MEMBERSHIPS_BY_START_YEAR[startYear] ?? null;
  },
  buildClubsForCareerStart(sourceClubs, startYear) {
    const membership = this.getMembership(startYear);
    if (!membership) return sourceClubs.map((club) => ({ ...club }));
    const clubById = new Map(sourceClubs.map((club) => [club.id, club]));
    const configuredIds = Object.values(membership).flatMap((clubIds) => clubIds ?? []);
    const uniqueConfiguredIds = new Set(configuredIds);
    if (uniqueConfiguredIds.size !== configuredIds.length) {
      throw new Error(`Konfiguracja polskich lig ${startYear}/${startYear + 1} zawiera powt\xF3rzone kluby.`);
    }
    const missingIds = configuredIds.filter((clubId) => !clubById.has(clubId));
    if (missingIds.length > 0) {
      throw new Error(`Brak klub\xF3w wymaganych dla sezonu ${startYear}/${startYear + 1}: ${missingIds.join(", ")}`);
    }
    const configuredClubs = Object.entries(membership).flatMap(([leagueId, clubIds]) => clubIds.map((clubId) => {
      const groupFallback = THIRD_LEAGUE_GROUP_IDS.includes(leagueId) ? DEFAULT_GROUP_VOIVODESHIP[leagueId] : void 0;
      return {
        ...clubById.get(clubId),
        leagueId,
        tier: leagueTier(leagueId),
        polishVoivodeship: CLUB_VOIVODESHIPS[clubId] ?? clubById.get(clubId).polishVoivodeship ?? groupFallback,
        isDefaultActive: true
      };
    }));
    const remainingClubs = sourceClubs.filter((club) => !uniqueConfiguredIds.has(club.id)).map((club) => ({
      ...club,
      polishVoivodeship: CLUB_VOIVODESHIPS[club.id] ?? club.polishVoivodeship,
      // Only the 72 configured clubs receive a full III-liga schedule in a
      // 2026/27 career. Every other regional club is retained as a transfer
      // and future-promotion candidate in the lightweight feeder pool.
      leagueId: startYear >= 2026 ? "L_PL_5" : "L_PL_4",
      tier: startYear >= 2026 ? 5 : 4,
      isDefaultActive: true
    }));
    return [...configuredClubs, ...remainingClubs];
  }
};

// services/PlayerCareerService.ts
var PlayerCareerService = {
  emptyStats() {
    return {
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
      matchesPlayed: 0,
      minutesPlayed: 0,
      seasonalChanges: {},
      ratingHistory: []
    };
  },
  resetClubStatsForNewEntry(player) {
    return {
      ...player,
      stats: this.emptyStats(),
      cupStats: this.emptyStats(),
      euroStats: this.emptyStats(),
      friendlyStats: this.emptyStats(),
      reserveStats: void 0
    };
  },
  buildStatsSnapshot(player) {
    const matchesPlayed = (player.stats?.matchesPlayed || 0) + (player.cupStats?.matchesPlayed || 0) + (player.euroStats?.matchesPlayed || 0);
    const ratingHistory = [
      ...player.stats?.ratingHistory || [],
      ...player.cupStats?.ratingHistory || [],
      ...player.euroStats?.ratingHistory || []
    ].slice(-(matchesPlayed || 0));
    const averageRating = matchesPlayed > 0 && ratingHistory.length > 0 ? parseFloat((ratingHistory.reduce((sum, rating) => sum + rating, 0) / ratingHistory.length).toFixed(1)) : null;
    return {
      matchesPlayed,
      goals: (player.stats?.goals || 0) + (player.cupStats?.goals || 0) + (player.euroStats?.goals || 0),
      assists: (player.stats?.assists || 0) + (player.cupStats?.assists || 0) + (player.euroStats?.assists || 0),
      yellowCards: (player.stats?.yellowCards || 0) + (player.cupStats?.yellowCards || 0) + (player.euroStats?.yellowCards || 0),
      redCards: (player.stats?.redCards || 0) + (player.cupStats?.redCards || 0) + (player.euroStats?.redCards || 0),
      averageRating
    };
  },
  buildLoanStatsSnapshot(player) {
    const loan = player.loan;
    const ratingHistory = player.stats?.ratingHistory || [];
    const baselineRatingCount = loan?.reportBaselineRatingCount ?? 0;
    const loanRatings = ratingHistory.slice(baselineRatingCount);
    const averageRating = loanRatings.length > 0 ? parseFloat((loanRatings.reduce((sum, rating) => sum + rating, 0) / loanRatings.length).toFixed(1)) : null;
    return {
      matchesPlayed: Math.max(0, (player.stats?.matchesPlayed || 0) - (loan?.reportBaselineMatches ?? 0)),
      goals: Math.max(0, (player.stats?.goals || 0) - (loan?.reportBaselineGoals ?? 0)),
      assists: Math.max(0, (player.stats?.assists || 0) - (loan?.reportBaselineAssists ?? 0)),
      yellowCards: Math.max(0, (player.stats?.yellowCards || 0) - (loan?.reportBaselineYellowCards ?? 0)),
      redCards: Math.max(0, (player.stats?.redCards || 0) - (loan?.reportBaselineRedCards ?? 0)),
      averageRating
    };
  },
  closeCurrentEntry(history, player, year, month) {
    if (history.length === 0) return [];
    const updatedHistory = [...history];
    const lastEntry = updatedHistory[updatedHistory.length - 1];
    updatedHistory[updatedHistory.length - 1] = {
      ...lastEntry,
      toYear: year,
      toMonth: month,
      statsSnapshot: lastEntry.statsSnapshot ?? this.buildStatsSnapshot(player)
    };
    return updatedHistory;
  },
  startNewEntry(history, target, year, month, transferFee) {
    return [
      ...history,
      {
        clubName: target.clubName,
        clubId: target.clubId,
        fromYear: year,
        fromMonth: month,
        toYear: null,
        toMonth: null,
        ...transferFee !== void 0 && { transferFee }
      }
    ];
  },
  startLoanEntry(history, loan, year, month, loanFee) {
    return [
      ...history,
      {
        clubName: loan.destinationClubName,
        clubId: loan.destinationClubId,
        fromYear: year,
        fromMonth: month,
        toYear: null,
        toMonth: null,
        isLoan: true,
        parentClubId: loan.parentClubId,
        parentClubName: loan.parentClubName,
        loanEndDate: loan.endDate,
        ...loanFee !== void 0 && { transferFee: loanFee }
      }
    ];
  },
  closeLoanEntry(history, player, year, month) {
    if (!player.loan) return history;
    const loanIndex = [...history].reverse().findIndex(
      (entry) => entry.isLoan && entry.toYear === null && entry.clubId === player.loan?.destinationClubId && entry.parentClubId === player.loan?.parentClubId
    );
    if (loanIndex < 0) return history;
    const actualIndex = history.length - 1 - loanIndex;
    return history.map((entry, index) => index === actualIndex ? {
      ...entry,
      toYear: year,
      toMonth: month,
      statsSnapshot: this.buildLoanStatsSnapshot(player)
    } : entry);
  },
  reopenOrCreateEntry(history, player, target, year, month) {
    const closeIdx = history.findIndex((e) => e.clubId !== target.clubId && e.toYear === null);
    let closed = closeIdx >= 0 ? history.map((e, i) => i === closeIdx ? { ...e, toYear: year, toMonth: month, statsSnapshot: e.statsSnapshot ?? this.buildStatsSnapshot(player) } : e) : [...history];
    const existingIdx = closed.findIndex((e) => e.clubId === target.clubId && e.clubName === target.clubName);
    if (existingIdx >= 0) {
      return closed.map((e, i) => i === existingIdx ? { ...e, toYear: null, toMonth: null, statsSnapshot: void 0 } : e);
    }
    return this.startNewEntry(closed, target, year, month);
  },
  movePlayer(player, target, year, month, currentClubInfo, transferFee) {
    let history = player.history || [];
    if (history.length === 0 && currentClubInfo) {
      history = [{
        clubName: currentClubInfo.clubName,
        clubId: currentClubInfo.clubId,
        fromYear: year - 1,
        fromMonth: 7,
        toYear: null,
        toMonth: null
      }];
    }
    const closedHistory = this.closeCurrentEntry(history, player, year, month);
    return this.startNewEntry(closedHistory, target, year, month, transferFee);
  }
};

// services/ReserveTeamLeagueService.ts
var RESERVE_PARENT_CLUB_BY_ID = {
  PL_LEGIA_WARSZAWA_II: "PL_LEGIA_WARSZAWA",
  PL_SLASK_WROCLAW_II: "PL_SLASK_WROCLAW",
  PL_LKS_II_LODZ: "PL_LKS_LODZ",
  PL_WIDZEW_LODZ_II: "PL_WIDZEW_LODZ",
  PL_WISLA_PLOCK_II: "PL_WISLA_PLOCK",
  PL_JAGIELLONIA_BIALYSTOK_II: "PL_JAGIELLONIA_BIALYSTOK",
  PL_LECH_POZNAN_II: "PL_LECH_POZNAN",
  PL_ZAGLEBIE_LUBIN_II: "PL_ZAGLEBIE_LUBIN",
  PL_MIEDZ_LEGNICA_II: "PL_MIEDZ_LEGNICA",
  PL_RAKOW_CZESTOCHOWA_II: "PL_RAKOW_CZESTOCHOWA",
  PL_WISLA_KRAKOW_II: "PL_WISLA_KRAKOW",
  PL_WIECZYSTA_KRAKOW_II: "PL_WIECZYSTA_KRAKOW",
  PL_KORONA_KIELCE_II: "PL_KORONA_KIELCE"
};
var PLAYABLE_POLISH_LEAGUE_IDS = /* @__PURE__ */ new Set([
  "L_PL_1",
  "L_PL_2",
  "L_PL_3",
  ...THIRD_LEAGUE_GROUP_IDS
]);
var getLeagueId = (clubId, clubs, projectedLeagueByClubId) => projectedLeagueByClubId?.get(clubId) ?? clubs.find((club) => club.id === clubId)?.leagueId;
var ReserveTeamLeagueService = {
  createLeagueProjection(clubs, changes = []) {
    const projection = new Map(clubs.map((club) => [club.id, club.leagueId]));
    changes.forEach((change) => {
      for (const clubId of change.clubIds) projection.set(clubId, change.targetLeagueId);
    });
    return projection;
  },
  applyLeagueProjection(projection, clubIds, targetLeagueId) {
    for (const clubId of clubIds) projection.set(clubId, targetLeagueId);
  },
  getParentClubId(reserveClubId) {
    return RESERVE_PARENT_CLUB_BY_ID[reserveClubId] ?? null;
  },
  /**
   * Resolves the configured reserve-club relationship without deciding if the
   * reserve side participates in the currently selected season. Callers which
   * control the player's reserve screen must use getPlayableReserveClubId;
   * promotion, finance and ownership rules may still need this raw relation
   * even while the reserve team temporarily plays below the simulated leagues.
   */
  getReserveClubId(parentClubId) {
    const pair = Object.entries(RESERVE_PARENT_CLUB_BY_ID).find(([, configuredParentClubId]) => configuredParentClubId === parentClubId);
    return pair?.[0] ?? null;
  },
  /**
   * Resolves an official reserve side only when it is an actual participant in
   * a simulated league for the current career state. This is intentionally a
   * runtime check against the supplied clubs rather than a static season list:
   * promotions and relegations can make the answer change in later seasons.
   *
   * When the configured reserve club is missing or sits only in the L_PL_5
   * feeder pool, null instructs GameContext to keep using generated reserves. A
   * club with no configured database reserve side, such as Polonia Warszawa,
   * naturally follows the same fallback path.
   */
  getPlayableReserveClubId(parentClubId, clubs) {
    const reserveClubId = this.getReserveClubId(parentClubId);
    if (!reserveClubId) return null;
    const reserveClub = clubs.find((club) => club.id === reserveClubId);
    if (!reserveClub || !PLAYABLE_POLISH_LEAGUE_IDS.has(reserveClub.leagueId)) return null;
    return reserveClubId;
  },
  /**
   * Official reserve teams are database-controlled development sides, not
   * independent career entry points. The defensive predicate is shared by
   * the selection screen and GameContext so a future UI regression cannot
   * bypass the restriction by calling selectUserTeam directly.
   */
  canBeSelectedAsUserClub(clubId) {
    return !this.isReserveClub(clubId);
  },
  /**
   * Returns every configured parent/reserve relationship as immutable-looking
   * value objects. Squad-integration services use this method instead of
   * duplicating club ids, so promotion restrictions, finances and internal
   * player movement always refer to the same source of truth.
   */
  getParentReservePairs() {
    return Object.entries(RESERVE_PARENT_CLUB_BY_ID).map(([reserveClubId, parentClubId]) => ({
      reserveClubId,
      parentClubId
    }));
  },
  isReserveClub(clubId) {
    return Object.prototype.hasOwnProperty.call(RESERVE_PARENT_CLUB_BY_ID, clubId);
  },
  /**
   * Reports whether a club may act as a buyer in a club-to-club transaction.
   * Reserve teams return false because they may sell players and sign free
   * agents, but they are not allowed to purchase or loan players from clubs.
   * Source-specific parent/reserve validation belongs to canRecruitPlayerFrom.
   */
  canParticipateAsTransferBuyer(clubId) {
    return !this.isReserveClub(clubId);
  },
  /**
   * Central market-eligibility rule shared by permanent transfers, loans,
   * pre-contracts, scouting and final transfer execution.
   *
   * The order of these checks is intentional:
   * 1. Reserve teams may still sign free agents because no selling club is
   *    involved and this is their only permitted recruitment channel.
   * 2. A reserve team may never act as a buyer on the club-to-club market.
   * 3. A first team may not buy or loan a player from its own reserve team.
   *    Such a move belongs to the future internal squad-integration system
   *    and must not create a fee, negotiation or market transfer record.
   *
   * Players owned by a reserve team may still be sold to every unrelated
   * club. This preserves the rule that reserve teams can sell players even
   * though they cannot purchase players from other clubs.
   */
  canRecruitPlayerFrom(buyerClubId, sellerClubId) {
    if (sellerClubId === "FREE_AGENTS") return true;
    if (!this.canParticipateAsTransferBuyer(buyerClubId)) return false;
    return this.getParentClubId(sellerClubId) !== buyerClubId;
  },
  canEnterLeague(clubId, targetLeagueId, clubs, projectedLeagueByClubId) {
    const parentClubId = this.getParentClubId(clubId);
    if (!parentClubId) return true;
    if (targetLeagueId === "L_PL_1") return false;
    const parentLeagueId = getLeagueId(parentClubId, clubs, projectedLeagueByClubId);
    return PolishThirdLeagueService.getPolishTier(parentLeagueId) !== PolishThirdLeagueService.getPolishTier(targetLeagueId);
  },
  selectPromotionPlaces(standings, targetLeagueId, clubs, directPlaceCount = 2, playoffPlaceCount = 4, projectedLeagueByClubId) {
    const eligible = this.getEligibleCandidates(standings, targetLeagueId, clubs, projectedLeagueByClubId);
    return {
      direct: eligible.slice(0, directPlaceCount),
      playoffs: eligible.slice(directPlaceCount, directPlaceCount + playoffPlaceCount)
    };
  },
  getEligibleCandidates(standings, targetLeagueId, clubs, projectedLeagueByClubId) {
    return standings.map((club, index) => ({ club, tablePosition: index + 1 })).filter((candidate) => this.canEnterLeague(candidate.club.id, targetLeagueId, clubs, projectedLeagueByClubId));
  },
  findSameLeagueConflicts(clubs, projectedLeagueByClubId) {
    return Object.entries(RESERVE_PARENT_CLUB_BY_ID).flatMap(([reserveClubId, parentClubId]) => {
      const reserveLeagueId = getLeagueId(reserveClubId, clubs, projectedLeagueByClubId);
      const parentLeagueId = getLeagueId(parentClubId, clubs, projectedLeagueByClubId);
      const reserveTier = PolishThirdLeagueService.getPolishTier(reserveLeagueId);
      const parentTier = PolishThirdLeagueService.getPolishTier(parentLeagueId);
      if (!reserveLeagueId || reserveTier === null || reserveTier !== parentTier || reserveTier > 4) {
        return [];
      }
      return [{ reserveClubId, parentClubId, leagueId: reserveLeagueId }];
    });
  },
  resolvePlayoffWinner(result, targetLeagueId, clubs, excludedClubIds = /* @__PURE__ */ new Set(), projectedLeagueByClubId) {
    if (!result) return null;
    const loserId = result.winnerId === result.homeId ? result.awayId : result.homeId;
    return [result.winnerId, loserId].find(
      (clubId) => !excludedClubIds.has(clubId) && this.canEnterLeague(clubId, targetLeagueId, clubs, projectedLeagueByClubId)
    ) ?? null;
  }
};

// services/ReserveTeamSquadMovementService.ts
var FIRST_TEAM_MINIMUMS = {
  ["GK" /* GK */]: 3,
  ["DEF" /* DEF */]: 8,
  ["MID" /* MID */]: 8,
  ["FWD" /* FWD */]: 4
};
var RESERVE_TEAM_MINIMUMS = {
  ["GK" /* GK */]: 2,
  ["DEF" /* DEF */]: 5,
  ["MID" /* MID */]: 5,
  ["FWD" /* FWD */]: 3
};
var EMERGENCY_AVAILABLE_MINIMUMS = {
  ["GK" /* GK */]: 1,
  ["DEF" /* DEF */]: 4,
  ["MID" /* MID */]: 4,
  ["FWD" /* FWD */]: 2
};
var FIRST_TEAM_TARGET_SIZE = 28;
var INTERNAL_MOVE_COOLDOWN_DAYS = 60;
var EMERGENCY_CALL_UP_COOLDOWN_DAYS = 14;
var SURPLUS_MARKET_EXPOSURE_DAYS = 30;
var MS_PER_DAY = 864e5;
var POSITIONS = [
  "GK" /* GK */,
  "DEF" /* DEF */,
  "MID" /* MID */,
  "FWD" /* FWD */
];
var toDayStart = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};
var toMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
var daysSince = (isoDate, currentDate) => {
  if (!isoDate) return Number.POSITIVE_INFINITY;
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return Number.POSITIVE_INFINITY;
  return Math.floor((toDayStart(currentDate).getTime() - toDayStart(parsed).getTime()) / MS_PER_DAY);
};
var countByPosition = (squad, predicate = () => true) => {
  const counts = {
    ["GK" /* GK */]: 0,
    ["DEF" /* DEF */]: 0,
    ["MID" /* MID */]: 0,
    ["FWD" /* FWD */]: 0
  };
  squad.forEach((player) => {
    if (predicate(player)) counts[player.position] += 1;
  });
  return counts;
};
var isAvailableToday = (player) => !player.loan && player.health?.status !== "INJURED" /* INJURED */ && (player.suspensionMatches ?? 0) <= 0;
var hasActiveExternalTransferLock = (player, currentDate) => {
  if (!player.transferLockoutUntil) return false;
  const lockDate = new Date(player.transferLockoutUntil);
  return !Number.isNaN(lockDate.getTime()) && currentDate < lockDate;
};
var canMoveInternally = (player, currentDate, requireAvailability) => {
  if (player.loan || player.transferPendingClubId || player.aiNegotiationClubId) return false;
  if (hasActiveExternalTransferLock(player, currentDate)) return false;
  if (daysSince(player.lastInternalSquadMoveDate, currentDate) < INTERNAL_MOVE_COOLDOWN_DAYS) return false;
  if (requireAvailability && !isAvailableToday(player)) return false;
  const contractEnd = new Date(player.contractEndDate);
  if (!Number.isNaN(contractEnd.getTime()) && contractEnd < toDayStart(currentDate)) return false;
  return true;
};
var averageRecentRating = (player) => {
  const ratings = player.stats?.ratingHistory ?? [];
  if (ratings.length === 0) return 0;
  const recent = ratings.slice(-5);
  return recent.reduce((sum, rating) => sum + rating, 0) / recent.length;
};
var promotionScore = (player) => player.overallRating * 100 + averageRecentRating(player) * 10 + Math.max(0, 24 - player.age) * 2;
var sortPromotionCandidates = (candidates) => [...candidates].sort(
  (a, b) => promotionScore(b) - promotionScore(a) || a.id.localeCompare(b.id)
);
var getShortagePositions = (squad, minimums, availableOnly) => {
  const counts = countByPosition(squad, availableOnly ? isAvailableToday : () => true);
  return POSITIONS.filter((position) => counts[position] < minimums[position]).sort(
    (a, b) => minimums[b] - counts[b] - (minimums[a] - counts[a]) || POSITIONS.indexOf(a) - POSITIONS.indexOf(b)
  );
};
var reserveCanReleasePosition = (reserveSquad, position, minimums) => countByPosition(reserveSquad)[position] > minimums[position];
var findCallUpForPositions = (reserveSquad, shortagePositions, currentDate, reserveMinimums) => {
  for (const position of shortagePositions) {
    if (!reserveCanReleasePosition(reserveSquad, position, reserveMinimums)) continue;
    const candidate = sortPromotionCandidates(
      reserveSquad.filter(
        (player) => player.position === position && canMoveInternally(player, currentDate, true)
      )
    )[0];
    if (candidate) return candidate;
  }
  return null;
};
var findStandoutMonthlyCallUp = (firstTeamSquad, reserveSquad, currentDate) => {
  if (firstTeamSquad.length >= FIRST_TEAM_TARGET_SIZE) return null;
  const reserveCounts = countByPosition(reserveSquad);
  const candidates = reserveSquad.filter((player) => {
    if (!canMoveInternally(player, currentDate, true)) return false;
    if (reserveCounts[player.position] <= RESERVE_TEAM_MINIMUMS[player.position]) return false;
    const samePosition = firstTeamSquad.filter((firstPlayer) => firstPlayer.position === player.position);
    if (samePosition.length === 0) return true;
    const weakestOverall = Math.min(...samePosition.map((firstPlayer) => firstPlayer.overallRating));
    return player.overallRating >= weakestOverall + (player.age <= 23 ? 2 : 4);
  });
  return sortPromotionCandidates(candidates)[0] ?? null;
};
var hasNoMarketInterest = (player) => (player.isOnTransferList || player.isAvailableForLoan) && (player.interestedClubs?.length ?? 0) === 0 && !player.transferPendingClubId && !player.aiNegotiationClubId;
var isRarelyUsedByFirstTeam = (player, parentClub) => {
  const clubMatches = Math.max(1, parentClub.stats?.played ?? 0);
  const appearanceShare = (player.stats?.matchesPlayed ?? 0) / clubMatches;
  const minuteShare = (player.stats?.minutesPlayed ?? 0) / (clubMatches * 90);
  return appearanceShare < 0.35 && minuteShare < 0.3;
};
var canFirstTeamReleasePlayer = (player, firstTeamSquad) => {
  const counts = countByPosition(firstTeamSquad);
  const minimumTotal = Object.values(FIRST_TEAM_MINIMUMS).reduce((sum, count) => sum + count, 0);
  return firstTeamSquad.length > minimumTotal && counts[player.position] > FIRST_TEAM_MINIMUMS[player.position];
};
var updateSurplusTimers = (parentClub, firstTeamSquad, currentDate) => firstTeamSquad.map((player) => {
  const eligible = canMoveInternally(player, currentDate, false) && !player.isUntouchable && player.squadRole !== "KEY_PLAYER" && player.squadRole !== "STARTER" && player.health?.status !== "INJURED" /* INJURED */ && canFirstTeamReleasePlayer(player, firstTeamSquad) && isRarelyUsedByFirstTeam(player, parentClub) && hasNoMarketInterest(player);
  if (!eligible) {
    return player.firstTeamSurplusSince ? { ...player, firstTeamSurplusSince: null } : player;
  }
  return player.firstTeamSurplusSince ? player : { ...player, firstTeamSurplusSince: currentDate.toISOString() };
});
var findMonthlyDemotion = (parentClub, firstTeamSquad, reserveSquad, currentDate) => {
  if (reserveSquad.length >= FIRST_TEAM_TARGET_SIZE) return null;
  const candidates = firstTeamSquad.filter(
    (player) => canMoveInternally(player, currentDate, false) && !player.isUntouchable && player.squadRole !== "KEY_PLAYER" && player.squadRole !== "STARTER" && player.health?.status !== "INJURED" /* INJURED */ && canFirstTeamReleasePlayer(player, firstTeamSquad) && isRarelyUsedByFirstTeam(player, parentClub) && hasNoMarketInterest(player) && daysSince(player.firstTeamSurplusSince, currentDate) >= SURPLUS_MARKET_EXPOSURE_DAYS
  );
  return [...candidates].sort(
    (a, b) => (a.stats?.minutesPlayed ?? 0) - (b.stats?.minutesPlayed ?? 0) || a.overallRating - b.overallRating || b.age - a.age || a.id.localeCompare(b.id)
  )[0] ?? null;
};
var markLatestHistoryEntryAsInternal = (history) => history.map(
  (entry, index) => index === history.length - 1 ? { ...entry, movementType: "INTERNAL_RESERVE" } : entry
);
var movePlayerBetweenLinkedSquads = (clubs, playersMap, player, sourceClub, destinationClub, direction, reason, currentDate) => {
  const history = PlayerCareerService.movePlayer(
    player,
    { clubId: destinationClub.id, clubName: destinationClub.name },
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    { clubId: sourceClub.id, clubName: sourceClub.name }
  );
  const playerWithResetStats = PlayerCareerService.resetClubStatsForNewEntry(player);
  const movedPlayer = {
    ...playerWithResetStats,
    clubId: destinationClub.id,
    history: markLatestHistoryEntryAsInternal(history),
    clubAdaptation: null,
    lastInternalSquadMoveDate: currentDate.toISOString(),
    lastInternalSquadMoveDirection: direction,
    firstTeamSurplusSince: null,
    squadRole: null,
    isUntouchable: false,
    ...direction === "TO_FIRST_TEAM" ? {
      isOnTransferList: false,
      transferListPrice: void 0,
      isAvailableForLoan: false,
      interestedClubs: []
    } : {}
  };
  const updatedPlayers = {
    ...playersMap,
    [sourceClub.id]: (playersMap[sourceClub.id] ?? []).filter((sourcePlayer) => sourcePlayer.id !== player.id),
    [destinationClub.id]: [
      ...(playersMap[destinationClub.id] ?? []).filter((destinationPlayer) => destinationPlayer.id !== player.id),
      movedPlayer
    ]
  };
  const updatedClubs = clubs.map((club) => {
    if (club.id === sourceClub.id) {
      return { ...club, rosterIds: club.rosterIds.filter((playerId) => playerId !== player.id) };
    }
    if (club.id === destinationClub.id) {
      return { ...club, rosterIds: [...club.rosterIds.filter((playerId) => playerId !== player.id), player.id] };
    }
    return club;
  });
  return {
    clubs: updatedClubs,
    playersMap: updatedPlayers,
    movement: {
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      parentClubId: direction === "TO_FIRST_TEAM" ? destinationClub.id : sourceClub.id,
      reserveClubId: direction === "TO_FIRST_TEAM" ? sourceClub.id : destinationClub.id,
      sourceClubId: sourceClub.id,
      destinationClubId: destinationClub.id,
      direction,
      reason,
      position: player.position,
      date: currentDate.toISOString()
    }
  };
};
var updateParentMetadata = (clubs, parentClubId, fields) => clubs.map((club) => club.id === parentClubId ? { ...club, ...fields } : club);
var ReserveTeamSquadMovementService = {
  /**
   * Runs an idempotent daily review for every configured AI parent/reserve pair.
   *
   * Priority order:
   * 1. Emergency call-up when the first team lacks available match-day depth.
   * 2. On day one of a month, a structural or standout call-up.
   * 3. If no call-up is justified, one unused player may be moved down after a
   *    full 30-day market-exposure period with no interest.
   *
   * A pair involving the user-controlled club is skipped because the game has a
   * separate `reserves` state and manual management flow for the user. Treating
   * that array and a database club such as Legia II as one squad would duplicate
   * players until those two systems are explicitly unified.
   */
  processDailyAiMovements(clubs, playersMap, currentDateInput, userTeamId) {
    const currentDate = toDayStart(currentDateInput);
    const monthKey = toMonthKey(currentDate);
    let updatedClubs = clubs.map((club) => ({ ...club, rosterIds: [...club.rosterIds] }));
    let updatedPlayers = Object.fromEntries(
      Object.entries(playersMap).map(([clubId, squad]) => [clubId, [...squad ?? []]])
    );
    const movements = [];
    for (const pair of ReserveTeamLeagueService.getParentReservePairs()) {
      if (pair.parentClubId === userTeamId || pair.reserveClubId === userTeamId) continue;
      let parentClub = updatedClubs.find((club) => club.id === pair.parentClubId);
      let reserveClub = updatedClubs.find((club) => club.id === pair.reserveClubId);
      if (!parentClub || !reserveClub) continue;
      let firstTeamSquad = updatedPlayers[parentClub.id] ?? [];
      let reserveSquad = updatedPlayers[reserveClub.id] ?? [];
      if (firstTeamSquad.length === 0 || reserveSquad.length === 0) continue;
      const emergencyCooldownComplete = daysSince(parentClub.reserveSquadLastEmergencyMoveDate, currentDate) >= EMERGENCY_CALL_UP_COOLDOWN_DAYS;
      const emergencyShortages = getShortagePositions(
        firstTeamSquad,
        EMERGENCY_AVAILABLE_MINIMUMS,
        true
      );
      const emergencyCandidate = emergencyCooldownComplete ? findCallUpForPositions(
        reserveSquad,
        emergencyShortages,
        currentDate,
        EMERGENCY_AVAILABLE_MINIMUMS
      ) : null;
      if (emergencyCandidate) {
        const execution = movePlayerBetweenLinkedSquads(
          updatedClubs,
          updatedPlayers,
          emergencyCandidate,
          reserveClub,
          parentClub,
          "TO_FIRST_TEAM",
          "EMERGENCY_CALL_UP",
          currentDate
        );
        updatedClubs = updateParentMetadata(execution.clubs, parentClub.id, {
          reserveSquadLastReviewMonth: monthKey,
          reserveSquadLastEmergencyMoveDate: currentDate.toISOString()
        });
        updatedPlayers = execution.playersMap;
        movements.push(execution.movement);
        continue;
      }
      if (currentDate.getDate() !== 1 || parentClub.reserveSquadLastReviewMonth === monthKey) continue;
      firstTeamSquad = updateSurplusTimers(parentClub, firstTeamSquad, currentDate);
      updatedPlayers = { ...updatedPlayers, [parentClub.id]: firstTeamSquad };
      const structuralShortages = getShortagePositions(firstTeamSquad, FIRST_TEAM_MINIMUMS, false);
      const structuralCallUp = findCallUpForPositions(
        reserveSquad,
        structuralShortages,
        currentDate,
        RESERVE_TEAM_MINIMUMS
      );
      const monthlyCallUp = structuralCallUp ?? findStandoutMonthlyCallUp(firstTeamSquad, reserveSquad, currentDate);
      if (monthlyCallUp) {
        const execution = movePlayerBetweenLinkedSquads(
          updatedClubs,
          updatedPlayers,
          monthlyCallUp,
          reserveClub,
          parentClub,
          "TO_FIRST_TEAM",
          "MONTHLY_CALL_UP",
          currentDate
        );
        updatedClubs = updateParentMetadata(execution.clubs, parentClub.id, {
          reserveSquadLastReviewMonth: monthKey,
          reserveSquadLastEmergencyMoveDate: parentClub.reserveSquadLastEmergencyMoveDate
        });
        updatedPlayers = execution.playersMap;
        movements.push(execution.movement);
        continue;
      }
      const monthlyDemotion = findMonthlyDemotion(parentClub, firstTeamSquad, reserveSquad, currentDate);
      if (monthlyDemotion) {
        const execution = movePlayerBetweenLinkedSquads(
          updatedClubs,
          updatedPlayers,
          monthlyDemotion,
          parentClub,
          reserveClub,
          "TO_RESERVES",
          "MONTHLY_DEMOTION",
          currentDate
        );
        updatedClubs = execution.clubs;
        updatedPlayers = execution.playersMap;
        movements.push(execution.movement);
      }
      updatedClubs = updateParentMetadata(updatedClubs, parentClub.id, {
        reserveSquadLastReviewMonth: monthKey,
        reserveSquadLastEmergencyMoveDate: parentClub.reserveSquadLastEmergencyMoveDate
      });
    }
    return { updatedClubs, updatedPlayers, movements };
  }
};

// tests/ReserveTeamSquadMovementTests.ts
var emptyStats = (matchesPlayed = 0, minutesPlayed = 0) => ({
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  cleanSheets: 0,
  matchesPlayed,
  minutesPlayed,
  seasonalChanges: {},
  ratingHistory: []
});
var makePlayer = (options) => ({
  id: options.id,
  firstName: "Test",
  lastName: options.id,
  age: options.age ?? 24,
  clubId: options.clubId,
  nationality: "POLAND" /* POLAND */,
  position: options.position,
  overallRating: options.overall ?? 60,
  attributes: {},
  stats: emptyStats(options.matchesPlayed, options.minutesPlayed),
  health: { status: options.healthStatus ?? "HEALTHY" /* HEALTHY */ },
  condition: 100,
  suspensionMatches: 0,
  contractEndDate: "2030-06-30T00:00:00.000Z",
  annualSalary: 1e5,
  history: [{
    clubName: options.clubId,
    clubId: options.clubId,
    fromYear: 2025,
    fromMonth: 7,
    toYear: null,
    toMonth: null
  }],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 0,
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
  isOnTransferList: options.isOnTransferList,
  isAvailableForLoan: options.isAvailableForLoan,
  interestedClubs: [],
  firstTeamSurplusSince: options.firstTeamSurplusSince ?? null,
  lastInternalSquadMoveDate: options.lastInternalSquadMoveDate ?? null
});
var buildSquad = (clubId, counts, overall = 65) => Object.entries(counts).flatMap(
  ([position, count]) => Array.from({ length: count }, (_, index) => makePlayer({
    id: `${clubId}_${position}_${index}`,
    clubId,
    position,
    overall
  }))
);
var buildLegiaPair = () => {
  const seasonClubs = PolishLeagueSeasonService.buildClubsForCareerStart(STATIC_CLUBS, 2026);
  const parentSource = seasonClubs.find((club) => club.id === "PL_LEGIA_WARSZAWA");
  const reserveSource = seasonClubs.find((club) => club.id === "PL_LEGIA_WARSZAWA_II");
  import_node_assert.strict.ok(parentSource && reserveSource, "Legia parent/reserve test pair must exist in the 2026 database");
  const parent = { ...parentSource, rosterIds: [], stats: { ...parentSource.stats, played: 10 } };
  const reserve = { ...reserveSource, rosterIds: [], stats: { ...reserveSource.stats, played: 10 } };
  return { clubs: [parent, reserve], parent, reserve };
};
var parentMinimumCounts = {
  ["GK" /* GK */]: 3,
  ["DEF" /* DEF */]: 8,
  ["MID" /* MID */]: 8,
  ["FWD" /* FWD */]: 4
};
var reserveMinimumCounts = {
  ["GK" /* GK */]: 2,
  ["DEF" /* DEF */]: 5,
  ["MID" /* MID */]: 5,
  ["FWD" /* FWD */]: 3
};
{
  const { clubs, parent, reserve } = buildLegiaPair();
  const parentSquad = buildSquad(parent.id, { ...parentMinimumCounts, ["GK" /* GK */]: 2 });
  const reserveSquad = buildSquad(reserve.id, { ...reserveMinimumCounts, ["GK" /* GK */]: 3 }, 58);
  const date = /* @__PURE__ */ new Date("2026-09-01T12:00:00.000Z");
  const firstRun = ReserveTeamSquadMovementService.processDailyAiMovements(
    clubs,
    { [parent.id]: parentSquad, [reserve.id]: reserveSquad },
    date,
    null
  );
  import_node_assert.strict.equal(firstRun.movements.length, 1, "monthly review should execute one internal move");
  import_node_assert.strict.equal(firstRun.movements[0].reason, "MONTHLY_CALL_UP");
  import_node_assert.strict.equal(firstRun.movements[0].position, "GK" /* GK */);
  import_node_assert.strict.equal(firstRun.updatedPlayers[parent.id].filter((player) => player.position === "GK" /* GK */).length, 3);
  import_node_assert.strict.equal(firstRun.updatedClubs.find((club) => club.id === parent.id)?.reserveSquadLastReviewMonth, "2026-09");
  const promoted = firstRun.updatedPlayers[parent.id].find((player) => player.lastInternalSquadMoveDirection === "TO_FIRST_TEAM");
  import_node_assert.strict.equal(promoted?.history.at(-1)?.movementType, "INTERNAL_RESERVE");
  import_node_assert.strict.equal(promoted?.clubAdaptation, null, "an internal move must not start club adaptation");
  const replay = ReserveTeamSquadMovementService.processDailyAiMovements(
    firstRun.updatedClubs,
    firstRun.updatedPlayers,
    date,
    null
  );
  import_node_assert.strict.equal(replay.movements.length, 0, "the same monthly review must be idempotent");
}
{
  const { clubs, parent, reserve } = buildLegiaPair();
  const parentSquad = buildSquad(parent.id, parentMinimumCounts);
  parentSquad.filter((player) => player.position === "FWD" /* FWD */).forEach((player) => {
    player.health = { status: "INJURED" /* INJURED */ };
  });
  const reserveSquad = buildSquad(reserve.id, { ...reserveMinimumCounts, ["FWD" /* FWD */]: 4 }, 57);
  const emergency = ReserveTeamSquadMovementService.processDailyAiMovements(
    clubs,
    { [parent.id]: parentSquad, [reserve.id]: reserveSquad },
    /* @__PURE__ */ new Date("2026-09-15T12:00:00.000Z"),
    null
  );
  import_node_assert.strict.equal(emergency.movements.length, 1);
  import_node_assert.strict.equal(emergency.movements[0].reason, "EMERGENCY_CALL_UP");
  import_node_assert.strict.equal(emergency.movements[0].position, "FWD" /* FWD */);
  const nextDay = ReserveTeamSquadMovementService.processDailyAiMovements(
    emergency.updatedClubs,
    emergency.updatedPlayers,
    /* @__PURE__ */ new Date("2026-09-16T12:00:00.000Z"),
    null
  );
  import_node_assert.strict.equal(nextDay.movements.length, 0, "emergency cooldown must block repeated daily call-ups");
}
{
  const { clubs, parent, reserve } = buildLegiaPair();
  const parentSquad = buildSquad(parent.id, { ...parentMinimumCounts, ["FWD" /* FWD */]: 5 }, 67);
  const surplusPlayer = parentSquad.find((player) => player.position === "FWD" /* FWD */);
  surplusPlayer.overallRating = 54;
  surplusPlayer.isOnTransferList = true;
  surplusPlayer.isAvailableForLoan = true;
  const reserveSquad = buildSquad(reserve.id, reserveMinimumCounts, 48);
  const exposureStart = ReserveTeamSquadMovementService.processDailyAiMovements(
    clubs,
    { [parent.id]: parentSquad, [reserve.id]: reserveSquad },
    /* @__PURE__ */ new Date("2026-09-01T12:00:00.000Z"),
    null
  );
  import_node_assert.strict.equal(exposureStart.movements.length, 0, "the first review must give the market time to react");
  import_node_assert.strict.ok(
    exposureStart.updatedPlayers[parent.id].find((player) => player.id === surplusPlayer.id)?.firstTeamSurplusSince,
    "the first eligible review must start the market-exposure timer"
  );
  const demotion = ReserveTeamSquadMovementService.processDailyAiMovements(
    exposureStart.updatedClubs,
    exposureStart.updatedPlayers,
    /* @__PURE__ */ new Date("2026-10-01T12:00:00.000Z"),
    null
  );
  import_node_assert.strict.equal(demotion.movements.length, 1);
  import_node_assert.strict.equal(demotion.movements[0].reason, "MONTHLY_DEMOTION");
  const demoted = demotion.updatedPlayers[reserve.id].find((player) => player.id === surplusPlayer.id);
  import_node_assert.strict.ok(demoted, "the unused player must move into the linked reserve squad");
  import_node_assert.strict.equal(demoted?.isOnTransferList, true, "reserve assignment must not cancel an ongoing sale attempt");
  import_node_assert.strict.equal(demoted?.isAvailableForLoan, true, "reserve assignment must not cancel an ongoing loan attempt");
  const cooldownReview = ReserveTeamSquadMovementService.processDailyAiMovements(
    demotion.updatedClubs,
    demotion.updatedPlayers,
    /* @__PURE__ */ new Date("2026-11-01T12:00:00.000Z"),
    null
  );
  import_node_assert.strict.ok(
    cooldownReview.updatedPlayers[reserve.id].some((player) => player.id === surplusPlayer.id),
    "the 60-day player cooldown must prevent an immediate call-up after demotion"
  );
}
{
  const { clubs, parent, reserve } = buildLegiaPair();
  const parentSquad = buildSquad(parent.id, { ...parentMinimumCounts, ["GK" /* GK */]: 2 });
  const reserveSquad = buildSquad(reserve.id, { ...reserveMinimumCounts, ["GK" /* GK */]: 3 });
  const skipped = ReserveTeamSquadMovementService.processDailyAiMovements(
    clubs,
    { [parent.id]: parentSquad, [reserve.id]: reserveSquad },
    /* @__PURE__ */ new Date("2026-09-01T12:00:00.000Z"),
    parent.id
  );
  import_node_assert.strict.equal(skipped.movements.length, 0);
  import_node_assert.strict.equal(skipped.updatedClubs.find((club) => club.id === parent.id)?.reserveSquadLastReviewMonth, void 0);
}
console.log("ReserveTeamSquadMovementTests: OK");
