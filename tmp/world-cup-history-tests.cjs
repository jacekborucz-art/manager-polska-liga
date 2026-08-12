// tests/WorldCupHistoryBackfillTests.ts
var import_node_assert = require("node:assert");

// resources/NationalTeamSchedule.ts
var NT_SCHEDULE_BY_YEAR = {
  // ── Sezon 2025/26 — Kwalifikacje do Mistrzostw Świata 2026, Grupy A–L ───────
  // Polska (Gr. G): Holandia, Finlandia, Litwa, Malta
  // Kolejki 4–9 Gr. G / kolejki 1–6 Gr. A–F / kolejki 5–10 Gr. H–L
  2025: [
    {
      // 4 września 2025 — okno wrześniowe, mecz 1
      day: 4,
      month: 8,
      // wrzesień
      competitionLabel: "Kwalifikacje M\u015A 2026",
      matches: [
        { home: "Luksemburg", away: "Irlandia P\xF3\u0142nocna", group: "A" },
        { home: "S\u0142owacja", away: "Niemcy", group: "A" },
        { home: "Szwecja", away: "S\u0142owenia", group: "B" },
        { home: "Kosovo", away: "Szwajcaria", group: "B" },
        { home: "Bia\u0142oru\u015B", away: "Grecja", group: "C" },
        { home: "Dania", away: "Szkocja", group: "C" },
        { home: "Azerbejd\u017Can", away: "Islandia", group: "D" },
        { home: "Ukraina", away: "Francja", group: "D" },
        { home: "Bu\u0142garia", away: "Gruzja", group: "E" },
        { home: "Turcja", away: "Hiszpania", group: "E" },
        { home: "Armenia", away: "W\u0119gry", group: "F" },
        { home: "Irlandia", away: "Portugalia", group: "F" },
        { home: "Holandia", away: "Polska", group: "G", competitionLabel: "Kwalifikacje M\u015A 2026" },
        { home: "Litwa", away: "Malta", group: "G", competitionLabel: "Kwalifikacje M\u015A 2026" },
        { home: "Austria", away: "Rumunia", group: "H" },
        { home: "Bo\u015Bnia i Hercegowina", away: "San Marino", group: "H" },
        { home: "Izrael", away: "W\u0142ochy", group: "I" },
        { home: "Norwegia", away: "Estonia", group: "I" },
        { home: "Macedonia P\xF3\u0142nocna", away: "Belgia", group: "J" },
        { home: "Walia", away: "Liechtenstein", group: "J" },
        { home: "Albania", away: "Anglia", group: "K" },
        { home: "Serbia", away: "\u0141otwa", group: "K" },
        { home: "Gibraltar", away: "Chorwacja", group: "L" },
        { home: "Czechy", away: "Wyspy Owcze", group: "L" }
      ]
    },
    {
      // 7 września 2025 — okno wrześniowe, mecz 2
      day: 7,
      month: 8,
      // wrzesień
      competitionLabel: "Kwalifikacje M\u015A 2026",
      matches: [
        { home: "Luksemburg", away: "S\u0142owacja", group: "A" },
        { home: "Niemcy", away: "Irlandia P\xF3\u0142nocna", group: "A" },
        { home: "Szwecja", away: "Kosovo", group: "B" },
        { home: "Szwajcaria", away: "S\u0142owenia", group: "B" },
        { home: "Bia\u0142oru\u015B", away: "Dania", group: "C" },
        { home: "Szkocja", away: "Grecja", group: "C" },
        { home: "Azerbejd\u017Can", away: "Ukraina", group: "D" },
        { home: "Francja", away: "Islandia", group: "D" },
        { home: "Bu\u0142garia", away: "Turcja", group: "E" },
        { home: "Hiszpania", away: "Gruzja", group: "E" },
        { home: "Armenia", away: "Irlandia", group: "F" },
        { home: "Portugalia", away: "W\u0119gry", group: "F" },
        { home: "Polska", away: "Finlandia", group: "G", competitionLabel: "Kwalifikacje M\u015A 2026" },
        { home: "Litwa", away: "Holandia", group: "G", competitionLabel: "Kwalifikacje M\u015A 2026" },
        { home: "San Marino", away: "Rumunia", group: "H" },
        { home: "Cypr", away: "Bo\u015Bnia i Hercegowina", group: "H" },
        { home: "Estonia", away: "W\u0142ochy", group: "I" },
        { home: "Mo\u0142dawia", away: "Norwegia", group: "I" },
        { home: "Liechtenstein", away: "Belgia", group: "J" },
        { home: "Kazachstan", away: "Walia", group: "J" },
        { home: "\u0141otwa", away: "Anglia", group: "K" },
        { home: "Andora", away: "Serbia", group: "K" },
        { home: "Wyspy Owcze", away: "Chorwacja", group: "L" },
        { home: "Czarnog\xF3ra", away: "Czechy", group: "L" }
      ]
    },
    {
      // 8 października 2025 — okno październikowe, mecz 1
      day: 8,
      month: 9,
      // październik
      competitionLabel: "Kwalifikacje M\u015A 2026",
      matches: [
        { home: "Irlandia P\xF3\u0142nocna", away: "S\u0142owacja", group: "A" },
        { home: "Niemcy", away: "Luksemburg", group: "A" },
        { home: "S\u0142owenia", away: "Kosovo", group: "B" },
        { home: "Szwajcaria", away: "Szwecja", group: "B" },
        { home: "Grecja", away: "Dania", group: "C" },
        { home: "Szkocja", away: "Bia\u0142oru\u015B", group: "C" },
        { home: "Islandia", away: "Ukraina", group: "D" },
        { home: "Francja", away: "Azerbejd\u017Can", group: "D" },
        { home: "Gruzja", away: "Turcja", group: "E" },
        { home: "Hiszpania", away: "Bu\u0142garia", group: "E" },
        { home: "W\u0119gry", away: "Irlandia", group: "F" },
        { home: "Portugalia", away: "Armenia", group: "F" },
        { home: "Finlandia", away: "Litwa", group: "G", competitionLabel: "Kwalifikacje M\u015A 2026" },
        { home: "Malta", away: "Holandia", group: "G", competitionLabel: "Kwalifikacje M\u015A 2026" },
        { home: "Bo\u015Bnia i Hercegowina", away: "Austria", group: "H" },
        { home: "San Marino", away: "Cypr", group: "H" },
        { home: "Norwegia", away: "Izrael", group: "I" },
        { home: "Estonia", away: "Mo\u0142dawia", group: "I" },
        { home: "Walia", away: "Macedonia P\xF3\u0142nocna", group: "J" },
        { home: "Liechtenstein", away: "Kazachstan", group: "J" },
        { home: "Serbia", away: "Albania", group: "K" },
        { home: "\u0141otwa", away: "Andora", group: "K" },
        { home: "Czechy", away: "Gibraltar", group: "L" },
        { home: "Wyspy Owcze", away: "Czarnog\xF3ra", group: "L" }
      ]
    },
    {
      // 11 października 2025 — okno październikowe, mecz 2
      day: 11,
      month: 9,
      // październik
      competitionLabel: "Kwalifikacje M\u015A 2026",
      matches: [
        { home: "Irlandia P\xF3\u0142nocna", away: "Niemcy", group: "A" },
        { home: "S\u0142owacja", away: "Luksemburg", group: "A" },
        { home: "S\u0142owenia", away: "Szwajcaria", group: "B" },
        { home: "Kosovo", away: "Szwecja", group: "B" },
        { home: "Grecja", away: "Szkocja", group: "C" },
        { home: "Dania", away: "Bia\u0142oru\u015B", group: "C" },
        { home: "Islandia", away: "Francja", group: "D" },
        { home: "Ukraina", away: "Azerbejd\u017Can", group: "D" },
        { home: "Gruzja", away: "Hiszpania", group: "E" },
        { home: "Turcja", away: "Bu\u0142garia", group: "E" },
        { home: "W\u0119gry", away: "Portugalia", group: "F" },
        { home: "Irlandia", away: "Armenia", group: "F" },
        { home: "Holandia", away: "Finlandia", group: "G", competitionLabel: "Kwalifikacje M\u015A 2026" },
        { home: "Litwa", away: "Polska", group: "G", competitionLabel: "Kwalifikacje M\u015A 2026" },
        { home: "Cypr", away: "Austria", group: "H" },
        { home: "Rumunia", away: "Bo\u015Bnia i Hercegowina", group: "H" },
        { home: "Mo\u0142dawia", away: "Izrael", group: "I" },
        { home: "W\u0142ochy", away: "Norwegia", group: "I" },
        { home: "Kazachstan", away: "Macedonia P\xF3\u0142nocna", group: "J" },
        { home: "Belgia", away: "Walia", group: "J" },
        { home: "Andora", away: "Albania", group: "K" },
        { home: "Anglia", away: "Serbia", group: "K" },
        { home: "Czarnog\xF3ra", away: "Gibraltar", group: "L" },
        { home: "Chorwacja", away: "Czechy", group: "L" }
      ]
    },
    {
      // 14 listopada 2025 — okno listopadowe, mecz 1
      day: 14,
      month: 10,
      // listopad
      competitionLabel: "Kwalifikacje M\u015A 2026",
      matches: [
        { home: "Luksemburg", away: "Niemcy", group: "A" },
        { home: "S\u0142owacja", away: "Irlandia P\xF3\u0142nocna", group: "A" },
        { home: "Szwecja", away: "Szwajcaria", group: "B" },
        { home: "Kosovo", away: "S\u0142owenia", group: "B" },
        { home: "Bia\u0142oru\u015B", away: "Szkocja", group: "C" },
        { home: "Dania", away: "Grecja", group: "C" },
        { home: "Azerbejd\u017Can", away: "Francja", group: "D" },
        { home: "Ukraina", away: "Islandia", group: "D" },
        { home: "Bu\u0142garia", away: "Hiszpania", group: "E" },
        { home: "Turcja", away: "Gruzja", group: "E" },
        { home: "Armenia", away: "Portugalia", group: "F" },
        { home: "Irlandia", away: "W\u0119gry", group: "F" },
        { home: "Finlandia", away: "Malta", group: "G", competitionLabel: "Kwalifikacje M\u015A 2026" },
        { home: "Polska", away: "Holandia", group: "G", competitionLabel: "Kwalifikacje M\u015A 2026" },
        { home: "San Marino", away: "Austria", group: "H" },
        { home: "Rumunia", away: "Cypr", group: "H" },
        { home: "Estonia", away: "Izrael", group: "I" },
        { home: "W\u0142ochy", away: "Mo\u0142dawia", group: "I" },
        { home: "Liechtenstein", away: "Macedonia P\xF3\u0142nocna", group: "J" },
        { home: "Belgia", away: "Kazachstan", group: "J" },
        { home: "\u0141otwa", away: "Albania", group: "K" },
        { home: "Anglia", away: "Andora", group: "K" },
        { home: "Wyspy Owcze", away: "Gibraltar", group: "L" },
        { home: "Chorwacja", away: "Czarnog\xF3ra", group: "L" }
      ]
    },
    {
      // 17 listopada 2025 — okno listopadowe, mecz 2
      day: 17,
      month: 10,
      // listopad
      competitionLabel: "Kwalifikacje M\u015A 2026",
      matches: [
        { home: "Irlandia P\xF3\u0142nocna", away: "Luksemburg", group: "A" },
        { home: "Niemcy", away: "S\u0142owacja", group: "A" },
        { home: "S\u0142owenia", away: "Szwecja", group: "B" },
        { home: "Szwajcaria", away: "Kosovo", group: "B" },
        { home: "Grecja", away: "Bia\u0142oru\u015B", group: "C" },
        { home: "Szkocja", away: "Dania", group: "C" },
        { home: "Islandia", away: "Azerbejd\u017Can", group: "D" },
        { home: "Francja", away: "Ukraina", group: "D" },
        { home: "Gruzja", away: "Bu\u0142garia", group: "E" },
        { home: "Hiszpania", away: "Turcja", group: "E" },
        { home: "W\u0119gry", away: "Armenia", group: "F" },
        { home: "Portugalia", away: "Irlandia", group: "F" },
        { home: "Holandia", away: "Litwa", group: "G", competitionLabel: "Kwalifikacje M\u015A 2026" },
        { home: "Malta", away: "Polska", group: "G", competitionLabel: "Kwalifikacje M\u015A 2026" },
        { home: "Rumunia", away: "Austria", group: "H" },
        { home: "San Marino", away: "Bo\u015Bnia i Hercegowina", group: "H" },
        { home: "W\u0142ochy", away: "Izrael", group: "I" },
        { home: "Estonia", away: "Norwegia", group: "I" },
        { home: "Belgia", away: "Macedonia P\xF3\u0142nocna", group: "J" },
        { home: "Liechtenstein", away: "Walia", group: "J" },
        { home: "Anglia", away: "Albania", group: "K" },
        { home: "\u0141otwa", away: "Serbia", group: "K" },
        { home: "Chorwacja", away: "Gibraltar", group: "L" },
        { home: "Wyspy Owcze", away: "Czechy", group: "L" }
      ]
    },
    {
      // 29 listopada 2025 — Losowanie par baraży MŚ 2026 UEFA
      day: 29,
      month: 10,
      // listopad
      competitionLabel: "Bara\u017Ce M\u015A 2026 \u2013 Losowanie",
      eventType: "WCQ_PLAYOFF_DRAW",
      matches: []
    }
  ],
  // ── Sezon 2026 — Baraże MŚ 2026 (mecze w marcu 2026) ────────────────────────
  // Klucz: 2026 (rok kalendarzowy marca 2026; CalendarEngine używa getFullYear = 2026)
  2026: [
    {
      // 17 marca 2026 — Półfinały baraży
      day: 17,
      month: 2,
      // marzec
      competitionLabel: "Bara\u017Ce M\u015A 2026 \u2013 P\xF3\u0142fina\u0142y",
      eventType: "WCQ_PLAYOFF_SF",
      matches: []
    },
    {
      // 20 marca 2026 — Finały baraży
      day: 20,
      month: 2,
      // marzec
      competitionLabel: "Bara\u017Ce M\u015A 2026 \u2013 Fina\u0142y",
      eventType: "WCQ_PLAYOFF_FINAL",
      matches: []
    }
  ]
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

// resources/tactics_db.ts
var createSlot = (index, role, x, y) => ({ index, role, x, y });
var TACTICS_DB = [
  {
    id: "4-4-2",
    name: "4-4-2 Classic",
    category: "Neutral",
    attackBias: 50,
    defenseBias: 50,
    pressingIntensity: 50,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      // GK
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      // LB
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      // CB
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      // CB
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      // RB
      createSlot(5, "MID" /* MID */, 0.15, 0.45),
      // LM
      createSlot(6, "MID" /* MID */, 0.38, 0.45),
      // CM
      createSlot(7, "MID" /* MID */, 0.62, 0.45),
      // CM
      createSlot(8, "MID" /* MID */, 0.85, 0.45),
      // RM
      createSlot(9, "FWD" /* FWD */, 0.35, 0.2),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.65, 0.2)
      // ST
    ]
  },
  {
    id: "4-4-2-OFF",
    name: "4-4-2 Offensive",
    category: "Offensive",
    attackBias: 75,
    defenseBias: 35,
    pressingIntensity: 75,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.1, 0.3),
      // LM (Wysoko)
      createSlot(6, "MID" /* MID */, 0.4, 0.5),
      // CM
      createSlot(7, "MID" /* MID */, 0.6, 0.5),
      // CM
      createSlot(8, "MID" /* MID */, 0.9, 0.3),
      // RM (Wysoko)
      createSlot(9, "FWD" /* FWD */, 0.4, 0.15),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.6, 0.15)
      // ST
    ]
  },
  {
    id: "4-4-2-DEF",
    name: "4-4-2 Defensive",
    category: "Defensive",
    attackBias: 30,
    defenseBias: 80,
    pressingIntensity: 40,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.15, 0.51),
      // LM (Cofnięty)
      createSlot(6, "MID" /* MID */, 0.4, 0.61),
      // CDM
      createSlot(7, "MID" /* MID */, 0.6, 0.61),
      // CDM
      createSlot(8, "MID" /* MID */, 0.85, 0.51),
      // RM (Cofnięty)
      createSlot(9, "FWD" /* FWD */, 0.43, 0.3),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.57, 0.3)
      // ST
    ]
  },
  {
    id: "4-4-2-DIAMOND",
    name: "4-4-2 Diamond",
    category: "Technical",
    attackBias: 60,
    defenseBias: 55,
    pressingIntensity: 60,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.5, 0.65),
      // CDM
      createSlot(6, "MID" /* MID */, 0.25, 0.45),
      // CM (Lewy)
      createSlot(7, "MID" /* MID */, 0.75, 0.45),
      // CM (Prawy)
      createSlot(8, "MID" /* MID */, 0.5, 0.3),
      // CAM
      createSlot(9, "FWD" /* FWD */, 0.35, 0.15),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.65, 0.15)
      // ST
    ]
  },
  {
    id: "6-3-1",
    name: "6-3-1 Ultra Defensive",
    category: "Park Bus",
    attackBias: 5,
    defenseBias: 95,
    pressingIntensity: 20,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.08, 0.75),
      // LWB
      createSlot(2, "DEF" /* DEF */, 0.25, 0.8),
      // CB
      createSlot(3, "DEF" /* DEF */, 0.42, 0.82),
      // CB
      createSlot(4, "DEF" /* DEF */, 0.58, 0.82),
      // CB
      createSlot(5, "DEF" /* DEF */, 0.75, 0.8),
      // CB
      createSlot(6, "DEF" /* DEF */, 0.92, 0.75),
      // RWB
      createSlot(7, "MID" /* MID */, 0.25, 0.55),
      // CM
      createSlot(8, "MID" /* MID */, 0.5, 0.6),
      // CDM
      createSlot(9, "MID" /* MID */, 0.75, 0.55),
      // CM
      createSlot(10, "FWD" /* FWD */, 0.5, 0.3)
      // ST (Samotny)
    ]
  },
  {
    id: "4-2-4",
    name: "4-2-4 Brazilian",
    category: "Ultra-Offensive",
    attackBias: 90,
    defenseBias: 10,
    pressingIntensity: 85,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.35, 0.55),
      // CM
      createSlot(6, "MID" /* MID */, 0.65, 0.55),
      // CM
      createSlot(7, "FWD" /* FWD */, 0.1, 0.2),
      // LW
      createSlot(8, "FWD" /* FWD */, 0.4, 0.15),
      // ST
      createSlot(9, "FWD" /* FWD */, 0.6, 0.15),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.9, 0.2)
      // RW
    ]
  },
  {
    id: "4-3-3",
    name: "4-3-3 Offensive",
    category: "Offensive",
    attackBias: 75,
    defenseBias: 30,
    pressingIntensity: 80,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.5, 0.55),
      // CDM
      createSlot(6, "MID" /* MID */, 0.3, 0.45),
      // CM
      createSlot(7, "MID" /* MID */, 0.7, 0.45),
      // CM
      createSlot(8, "FWD" /* FWD */, 0.15, 0.2),
      // LW
      createSlot(9, "FWD" /* FWD */, 0.5, 0.15),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.85, 0.2)
      // RW
    ]
  },
  {
    id: "4-2-3-1",
    name: "4-2-3-1 Wide",
    category: "Neutral",
    attackBias: 60,
    defenseBias: 60,
    pressingIntensity: 60,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.4, 0.6),
      // CDM
      createSlot(6, "MID" /* MID */, 0.6, 0.6),
      // CDM
      createSlot(7, "MID" /* MID */, 0.15, 0.35),
      // LM/LW
      createSlot(8, "MID" /* MID */, 0.5, 0.35),
      // CAM
      createSlot(9, "MID" /* MID */, 0.85, 0.35),
      // RM/RW
      createSlot(10, "FWD" /* FWD */, 0.5, 0.15)
      // ST
    ]
  },
  {
    id: "3-5-2",
    name: "3-5-2 Possession",
    category: "Neutral",
    attackBias: 65,
    defenseBias: 45,
    pressingIntensity: 70,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.3, 0.75),
      // CB
      createSlot(2, "DEF" /* DEF */, 0.5, 0.75),
      // CB
      createSlot(3, "DEF" /* DEF */, 0.7, 0.75),
      // CB
      createSlot(4, "MID" /* MID */, 0.1, 0.5),
      // LWB
      createSlot(5, "MID" /* MID */, 0.35, 0.55),
      // CM
      createSlot(6, "MID" /* MID */, 0.5, 0.6),
      // CDM
      createSlot(7, "MID" /* MID */, 0.65, 0.55),
      // CM
      createSlot(8, "MID" /* MID */, 0.9, 0.5),
      // RWB
      createSlot(9, "FWD" /* FWD */, 0.4, 0.2),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.6, 0.2)
      // ST
    ]
  },
  {
    id: "5-3-2",
    name: "5-3-2 Fortress",
    category: "Defensive",
    attackBias: 20,
    defenseBias: 90,
    pressingIntensity: 30,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.1, 0.65),
      // LWB
      createSlot(2, "DEF" /* DEF */, 0.3, 0.75),
      // CB
      createSlot(3, "DEF" /* DEF */, 0.5, 0.75),
      // CB
      createSlot(4, "DEF" /* DEF */, 0.7, 0.75),
      // CB
      createSlot(5, "DEF" /* DEF */, 0.9, 0.65),
      // RWB
      createSlot(6, "MID" /* MID */, 0.35, 0.5),
      // CM
      createSlot(7, "MID" /* MID */, 0.5, 0.5),
      // CM
      createSlot(8, "MID" /* MID */, 0.65, 0.5),
      // CM
      createSlot(9, "FWD" /* FWD */, 0.4, 0.25),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.6, 0.25)
      // ST
    ]
  },
  {
    id: "4-5-1",
    name: "4-5-1 Park Bus",
    category: "Defensive",
    attackBias: 30,
    defenseBias: 85,
    pressingIntensity: 40,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.1, 0.5),
      // LM
      createSlot(6, "MID" /* MID */, 0.3, 0.55),
      // CM
      createSlot(7, "MID" /* MID */, 0.5, 0.55),
      // CM
      createSlot(8, "MID" /* MID */, 0.7, 0.55),
      // CM
      createSlot(9, "MID" /* MID */, 0.9, 0.5),
      // RM
      createSlot(10, "FWD" /* FWD */, 0.5, 0.25)
      // ST
    ]
  },
  {
    id: "4-1-4-1",
    name: "4-1-4-1 Control",
    category: "Neutral",
    attackBias: 55,
    defenseBias: 55,
    pressingIntensity: 65,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.5, 0.65),
      // CDM
      createSlot(6, "MID" /* MID */, 0.15, 0.45),
      // LM
      createSlot(7, "MID" /* MID */, 0.38, 0.45),
      // CM
      createSlot(8, "MID" /* MID */, 0.62, 0.45),
      // CM
      createSlot(9, "MID" /* MID */, 0.85, 0.45),
      // RM
      createSlot(10, "FWD" /* FWD */, 0.5, 0.2)
      // ST
    ]
  },
  {
    id: "3-4-3",
    name: "3-4-3 Total",
    category: "Offensive",
    attackBias: 85,
    defenseBias: 20,
    pressingIntensity: 90,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.25, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.5, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.75, 0.75),
      createSlot(4, "MID" /* MID */, 0.1, 0.5),
      // LM
      createSlot(5, "MID" /* MID */, 0.4, 0.5),
      // CM
      createSlot(6, "MID" /* MID */, 0.6, 0.5),
      // CM
      createSlot(7, "MID" /* MID */, 0.9, 0.5),
      // RM
      createSlot(8, "FWD" /* FWD */, 0.2, 0.2),
      // LW
      createSlot(9, "FWD" /* FWD */, 0.5, 0.15),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.8, 0.2)
      // RW
    ]
  },
  {
    id: "5-4-1",
    name: "5-4-1 Diamond",
    category: "Defensive",
    attackBias: 35,
    defenseBias: 80,
    pressingIntensity: 50,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.1, 0.65),
      // LWB
      createSlot(2, "DEF" /* DEF */, 0.3, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.5, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.7, 0.75),
      createSlot(5, "DEF" /* DEF */, 0.9, 0.65),
      // RWB
      createSlot(6, "MID" /* MID */, 0.5, 0.6),
      // CDM
      createSlot(7, "MID" /* MID */, 0.3, 0.5),
      // CM
      createSlot(8, "MID" /* MID */, 0.7, 0.5),
      // CM
      createSlot(9, "MID" /* MID */, 0.5, 0.4),
      // CAM
      createSlot(10, "FWD" /* FWD */, 0.5, 0.2)
      // ST
    ]
  },
  {
    id: "4-3-2-1",
    name: "4-3-2-1 Xmas Tree",
    category: "Neutral",
    attackBias: 60,
    defenseBias: 50,
    pressingIntensity: 55,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.3, 0.55),
      createSlot(6, "MID" /* MID */, 0.5, 0.55),
      createSlot(7, "MID" /* MID */, 0.7, 0.55),
      createSlot(8, "MID" /* MID */, 0.4, 0.35),
      // CAM
      createSlot(9, "MID" /* MID */, 0.6, 0.35),
      // CAM
      createSlot(10, "FWD" /* FWD */, 0.5, 0.2)
      // ST
    ]
  },
  {
    id: "3-4-2-1",
    name: "3-4-2-1 Box Control",
    category: "Technical",
    attackBias: 65,
    defenseBias: 40,
    pressingIntensity: 70,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.25, 0.75),
      // CB
      createSlot(2, "DEF" /* DEF */, 0.5, 0.78),
      // CB
      createSlot(3, "DEF" /* DEF */, 0.75, 0.75),
      // CB
      createSlot(4, "MID" /* MID */, 0.1, 0.5),
      // LWB
      createSlot(5, "MID" /* MID */, 0.38, 0.55),
      // CM
      createSlot(6, "MID" /* MID */, 0.62, 0.55),
      // CM
      createSlot(7, "MID" /* MID */, 0.9, 0.5),
      // RWB
      createSlot(8, "MID" /* MID */, 0.38, 0.35),
      // CAM
      createSlot(9, "MID" /* MID */, 0.62, 0.35),
      // CAM
      createSlot(10, "FWD" /* FWD */, 0.5, 0.15)
      // ST
    ]
  },
  {
    id: "4-3-3-F9",
    name: "4-3-3 False Nine",
    category: "Possession",
    attackBias: 80,
    defenseBias: 35,
    pressingIntensity: 75,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.5, 0.65),
      // CDM
      createSlot(6, "MID" /* MID */, 0.3, 0.45),
      // CM
      createSlot(7, "MID" /* MID */, 0.7, 0.45),
      // CM
      createSlot(8, "FWD" /* FWD */, 0.15, 0.25),
      // LW
      createSlot(9, "FWD" /* FWD */, 0.5, 0.35),
      // CF (False Nine)
      createSlot(10, "FWD" /* FWD */, 0.85, 0.25)
      // RW
    ]
  },
  {
    id: "5-2-1-2",
    name: "5-2-1-2 Vertical Counter",
    category: "Counter",
    attackBias: 45,
    defenseBias: 85,
    pressingIntensity: 45,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.1, 0.72),
      // LWB
      createSlot(2, "DEF" /* DEF */, 0.3, 0.78),
      // CB
      createSlot(3, "DEF" /* DEF */, 0.5, 0.82),
      // CB
      createSlot(4, "DEF" /* DEF */, 0.7, 0.78),
      // CB
      createSlot(5, "DEF" /* DEF */, 0.9, 0.72),
      // RWB
      createSlot(6, "MID" /* MID */, 0.4, 0.55),
      // CM
      createSlot(7, "MID" /* MID */, 0.6, 0.55),
      // CM
      createSlot(8, "MID" /* MID */, 0.5, 0.35),
      // CAM
      createSlot(9, "FWD" /* FWD */, 0.38, 0.18),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.62, 0.18)
      // ST
    ]
  }
];
var TacticRepository = {
  getAll: () => TACTICS_DB,
  getById: (id) => TACTICS_DB.find((t) => t.id === id) || TACTICS_DB[0],
  getDefault: () => TACTICS_DB[0]
  // 4-4-2
};

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
  { name: "Polonia Bydgoszcz", tier: 4, colors: ["#000000", "#FFFFFF", "#FF0000"], stadium: "Stadion im. Bronis\u0142awa Malinowskiego", capacity: 2500, reputation: 2 }
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
  // Oblicza rynkową wartość pensji dla danego OVR (punkt odniesienia dla Zarządu)
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
    const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
    const tier = FinanceService.getClubTier(club);
    const liquiditySalaryCap = club.budget * (tier >= 3 ? 0.35 : 0.3);
    if (proposedSalary > liquiditySalaryCap && proposedSalary > fairSalary * 1.15) {
      return {
        approved: false,
        reason: `DYREKTOR FINANSOWY: Ta pensja jest zbyt du\u017Cym obci\u0105\u017Ceniem dla got\xF3wki klubu. Przy obecnych finansach zarz\u0105d nie zaakceptuje kwoty powy\u017Cej oko\u0142o ${Math.floor(liquiditySalaryCap / 1e4) * 1e4} PLN rocznie.`
      };
    }
    const highestSalary = squad.length > 0 ? Math.max(...squad.map((p) => p.annualSalary)) : 0;
    const averageOverall = squad.length > 0 ? squad.reduce((sum, squadPlayer) => sum + squadPlayer.overallRating, 0) / squad.length : player.overallRating;
    const bestSamePositionOverall = squad.filter((squadPlayer) => squadPlayer.position === player.position).reduce((best, squadPlayer) => Math.max(best, squadPlayer.overallRating), 0);
    const isClearSportingUpgrade = player.overallRating >= averageOverall + 4 || player.overallRating >= bestSamePositionOverall + 2;
    const hierarchyMultiplier = isClearSportingUpgrade ? tier >= 3 ? 3.5 : 3.1 : player.overallRating >= averageOverall ? tier >= 3 ? 2.75 : 2.55 : tier >= 3 ? 2.4 : 2.25;
    const marketBasedHierarchyFloor = fairSalary * (tier >= 3 ? 0.72 : 0.68);
    const hierarchySalaryCap = Math.max(highestSalary * hierarchyMultiplier, marketBasedHierarchyFloor);
    if (highestSalary > 0 && proposedSalary > hierarchySalaryCap) {
      return {
        approved: false,
        reason: `PREZES: Mo\u017Cemy zgodzi\u0107 si\u0119 na najlepiej op\u0142acanego zawodnika w zespole, ale ta kwota zbyt mocno odbiega od poziomu sportowego i obecnej hierarchii p\u0142ac. Najwy\u017Csza pensja w kadrze wynosi ${highestSalary.toLocaleString("pl-PL")} PLN.`
      };
    }
    const overpayRatio = proposedSalary / fairSalary;
    const allowedOverpay = 1.2 + (10 - club.boardStrictness) / 10;
    if (overpayRatio > allowedOverpay) {
      return {
        approved: false,
        reason: `ZARZ\u0104D: Ta kwota to absurd! Sugerowana pensja rynkowa dla OVR ${player.overallRating} to ok. ${fairSalary.toLocaleString()} PLN. Nie pozwolimy na tak\u0105 niegospodarno\u015B\u0107.`
      };
    }
    if (proposedBonus > club.budget * 0.5) {
      return { approved: false, reason: "ZARZ\u0104D: Bonus za podpis jest zbyt wysoki w stosunku do wolnej got\xF3wki w klubie." };
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

// services/PlayerFormService.ts
var clamp3 = (value, min, max) => Math.max(min, Math.min(max, value));
var average = (values) => values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
var emptyStats = () => ({
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  cleanSheets: 0,
  matchesPlayed: 0,
  minutesPlayed: 0,
  seasonalChanges: {},
  ratingHistory: []
});
var combineStats = (player) => {
  const groups = [player.stats, player.cupStats, player.euroStats, player.friendlyStats, player.nationalStats].filter(Boolean);
  return groups.reduce((acc, stats) => ({
    ...acc,
    goals: acc.goals + (stats.goals ?? 0),
    assists: acc.assists + (stats.assists ?? 0),
    yellowCards: acc.yellowCards + (stats.yellowCards ?? 0),
    redCards: acc.redCards + (stats.redCards ?? 0),
    cleanSheets: acc.cleanSheets + (stats.cleanSheets ?? 0),
    matchesPlayed: acc.matchesPlayed + (stats.matchesPlayed ?? 0),
    minutesPlayed: acc.minutesPlayed + (stats.minutesPlayed ?? 0),
    ratingHistory: [...acc.ratingHistory, ...stats.ratingHistory ?? []]
  }), emptyStats());
};
var getOutputBonus = (player, stats) => {
  const matches = Math.max(1, stats.matchesPlayed || 0);
  const goalsPerMatch = (stats.goals ?? 0) / matches;
  const assistsPerMatch = (stats.assists ?? 0) / matches;
  const contributionsPerMatch = ((stats.goals ?? 0) + (stats.assists ?? 0)) / matches;
  const cleanSheetRate = (stats.cleanSheets ?? 0) / matches;
  if ((stats.matchesPlayed ?? 0) < 3) return 0;
  if (player.position === "FWD" /* FWD */) {
    return clamp3(goalsPerMatch * 20 + assistsPerMatch * 8 - (goalsPerMatch === 0 ? 8 : 0), -10, 14);
  }
  if (player.position === "MID" /* MID */) {
    return clamp3(contributionsPerMatch * 18, -4, 12);
  }
  if (player.position === "GK" /* GK */) {
    return clamp3(cleanSheetRate * 18 - (cleanSheetRate === 0 ? 4 : 0), -8, 14);
  }
  return clamp3(contributionsPerMatch * 10, -4, 8);
};
var PlayerFormService = {
  calculate(player) {
    const stats = combineStats(player);
    const ratings = stats.ratingHistory.filter((rating) => typeof rating === "number" && Number.isFinite(rating));
    const seasonAverage = average(ratings);
    const recent10Ratings = ratings.slice(-10);
    const recentRatings = ratings.slice(-5);
    const recent10Average = average(recent10Ratings);
    const previousRatings = ratings.slice(-10, -5);
    const recentAverage = average(recentRatings);
    const previousAverage = average(previousRatings);
    const goodRatingCount = ratings.filter((rating) => rating >= 7).length;
    let score = 50;
    if (seasonAverage !== null) {
      score += clamp3((seasonAverage - 6.5) * 10, -18, 22);
    }
    if (recent10Average !== null) {
      score += clamp3((recent10Average - 6.5) * 14, -22, 28);
    }
    if (recentAverage !== null) {
      score += clamp3((recentAverage - 6.5) * 8, -12, 16);
    }
    if (recentAverage !== null && previousAverage !== null) {
      score += clamp3((recentAverage - previousAverage) * 10, -10, 10);
    }
    const matches = stats.matchesPlayed ?? 0;
    const minutes = stats.minutesPlayed ?? 0;
    if (matches >= 6) score += 6;
    else if (matches >= 3) score += 3;
    else if (matches === 0) score += 0;
    else score -= 4;
    if (matches > 0) {
      const averageMinutes = minutes / matches;
      if (averageMinutes >= 70 && matches >= 10) score += 6;
      else if (averageMinutes >= 75) score += 5;
      else if (averageMinutes < 35) score -= 6;
      if (matches >= 10 && averageMinutes >= 70 && goodRatingCount >= 10 && (recent10Average ?? seasonAverage ?? 0) >= 7) {
        score += 6;
      }
    }
    score += getOutputBonus(player, stats);
    score += clamp3(((player.morale ?? 50) - 50) * 0.1, -5, 5);
    if (matches > 0 || recentAverage !== null) score += player.trainingFocus ? 2 : 0;
    if (player.health?.status === "INJURED" /* INJURED */) score -= 18;
    if ((player.condition ?? 100) < 60) score -= 8;
    if ((player.fatigueDebt ?? 0) > 55) score -= 6;
    return PlayerFormService.getInfo(Math.round(clamp3(score, 0, 100)));
  },
  getTrainingIntensityAdjustment(player, intensity) {
    const attributes = player.attributes;
    const responseScore = (attributes.workRate ?? 50) * 0.45 + (attributes.mentality ?? 50) * 0.35 + (attributes.stamina ?? 50) * 0.2;
    const fatigueDebt = player.fatigueDebt ?? 0;
    const condition = player.condition ?? 100;
    const strainPenalty = (fatigueDebt >= 70 ? 5 : fatigueDebt >= 55 ? 3 : fatigueDebt >= 40 ? 1 : 0) + (condition < 55 ? 5 : condition < 68 ? 3 : condition < 78 ? 1 : 0);
    if (intensity === "HEAVY" /* HEAVY */) {
      let adjustment = 0;
      if (responseScore >= 82) adjustment = 6;
      else if (responseScore >= 72) adjustment = 4;
      else if (responseScore >= 62) adjustment = 2;
      else if (responseScore < 45) adjustment = -6;
      else if (responseScore < 55) adjustment = -3;
      return clamp3(adjustment - strainPenalty, -9, 7);
    }
    if (intensity === "LIGHT" /* LIGHT */) {
      if (fatigueDebt >= 55 || condition < 68) return 4;
      if (responseScore >= 78 && condition >= 82) return -1;
      return 0;
    }
    if (responseScore >= 76 && condition >= 75 && fatigueDebt <= 45) return 1;
    if (condition < 60 || fatigueDebt >= 70) return -2;
    return 0;
  },
  withUpdatedForm(player, adjustment = 0) {
    return {
      ...player,
      form: PlayerFormService.getInfo(PlayerFormService.calculate(player).score + adjustment).score
    };
  },
  getInfo(score = 50) {
    const safeScore = Math.round(clamp3(score, 0, 100));
    if (safeScore >= 90) {
      return {
        score: safeScore,
        level: "VERY_HIGH",
        label: "Bardzo wysoka",
        colorClass: "text-emerald-300",
        borderClass: "border-emerald-400/35",
        bgClass: "bg-emerald-500/12"
      };
    }
    if (safeScore >= 75) {
      return {
        score: safeScore,
        level: "HIGH",
        label: "Wysoka",
        colorClass: "text-lime-300",
        borderClass: "border-lime-400/35",
        bgClass: "bg-lime-500/12"
      };
    }
    if (safeScore >= 51) {
      return {
        score: safeScore,
        level: "RISING",
        label: "Wzrastaj\u0105ca",
        colorClass: "text-lime-300",
        borderClass: "border-lime-400/35",
        bgClass: "bg-lime-500/12"
      };
    }
    if (safeScore >= 40) {
      return {
        score: safeScore,
        level: "STABLE",
        label: "Stabilna",
        colorClass: "text-slate-200",
        borderClass: "border-slate-300/25",
        bgClass: "bg-slate-400/10"
      };
    }
    if (safeScore >= 11) {
      return {
        score: safeScore,
        level: "FALLING",
        label: "Spadaj\u0105ca",
        colorClass: "text-orange-300",
        borderClass: "border-orange-400/35",
        bgClass: "bg-orange-500/12"
      };
    }
    return {
      score: safeScore,
      level: "VERY_LOW",
      label: "Bardzo niska",
      colorClass: "text-red-300",
      borderClass: "border-red-400/35",
      bgClass: "bg-red-500/12"
    };
  }
};

// services/PlayerMoraleService.ts
var DAY_MS = 24 * 60 * 60 * 1e3;
var PERSONALITIES = [
  "PROFESSIONAL",
  "AMBITIOUS",
  "SENSITIVE",
  "CONFIDENT",
  "NERVOUS",
  "LOYAL",
  "EGOIST",
  "CALM"
];
var seededRng = (seed, offset) => {
  const x = Math.sin(seed + offset * 9973) * 1e4;
  return x - Math.floor(x);
};
var dateOnly = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
var dayDiff = (from, to) => Math.floor((dateOnly(to).getTime() - dateOnly(from).getTime()) / DAY_MS);
var stableHash = (input) => {
  let hash2 = 0;
  for (let i = 0; i < input.length; i++) {
    hash2 = (hash2 << 5) - hash2 + input.charCodeAt(i) | 0;
  }
  return Math.abs(hash2);
};
var toDateKey = (date) => date.toISOString().split("T")[0];
var roleLabel = (role) => {
  if (role === "KEY_PLAYER") return "kluczowy zawodnik";
  if (role === "STARTER") return "podstawowa jedenastka";
  return "bez okre\u015Blonego statusu";
};
var boardAttributeScore = (level) => {
  if (level === "bardzo_wysoka") return 4;
  if (level === "wysoka") return 3;
  if (level === "przecietna") return 2;
  if (level === "niska") return 1;
  if (level === "bardzo_niska") return 0;
  return 2;
};
var roundTransferPrice = (value) => {
  const step = value >= 1e7 ? 5e5 : value >= 1e6 ? 1e5 : 25e3;
  return Math.max(step, Math.ceil(value / step) * step);
};
var roundContractMoney = (value) => {
  const step = value >= 1e6 ? 1e5 : value >= 1e5 ? 1e4 : 5e3;
  return Math.max(5e4, Math.ceil(value / step) * step);
};
var buildRaiseRequest = (player, club, squadAverage, rank) => {
  const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
  const currentSalary = Math.max(5e4, player.annualSalary || 0);
  const qualityPremium = Math.max(0, player.overallRating - squadAverage) * 0.025;
  const rolePremium = rank <= 3 ? 0.22 : rank <= 6 ? 0.14 : 0.08;
  const personalityPremium = player.moralePersonality === "EGOIST" ? 0.14 : player.moralePersonality === "AMBITIOUS" ? 0.1 : player.moralePersonality === "LOYAL" ? -0.05 : 0;
  const reputationPremium = club.reputation >= 10 ? 0.08 : club.reputation <= 5 ? -0.04 : 0;
  const expectedSalary = roundContractMoney(
    Math.max(fairSalary, currentSalary * 1.18) * (1.04 + qualityPremium + rolePremium + personalityPremium + reputationPremium)
  );
  const years = player.age <= 23 ? 4 : player.age <= 28 ? 4 : player.age <= 32 ? 3 : player.age <= 34 ? 2 : 1;
  const bonusMultiplier = player.age >= 33 ? 0.7 : player.age >= 28 ? 0.58 : player.age >= 24 ? 0.46 : 0.32;
  const bonus = roundContractMoney(expectedSalary * bonusMultiplier);
  return {
    salary: expectedSalary,
    bonus,
    years
  };
};
var getLastSeasonMatches = (player) => {
  const history = player.seasonHistory || [];
  if (history.length === 0) return getSeasonOutputProfile(player).matches;
  return history[history.length - 1]?.matchesPlayed ?? 0;
};
var getPromotionRaiseRequest = (player, club, squadAverage) => {
  const currentSalary = Math.max(5e4, player.annualSalary || 0);
  const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
  const matches = getLastSeasonMatches(player);
  const underpayPressure = Math.max(0, 1 - currentSalary / Math.max(1, fairSalary));
  const qualityPremium = Math.max(0, player.overallRating - squadAverage) * 0.015;
  const rolePremium = player.isUntouchable || player.squadRole === "KEY_PLAYER" ? 0.08 : player.squadRole === "STARTER" ? 0.05 : 0.02;
  const regularityPremium = matches >= 30 ? 0.06 : matches >= 24 ? 0.04 : matches >= 18 ? 0.02 : 0;
  const personalityPremium = player.moralePersonality === "EGOIST" ? 0.07 : player.moralePersonality === "AMBITIOUS" ? 0.06 : player.moralePersonality === "CONFIDENT" ? 0.04 : player.moralePersonality === "LOYAL" ? -0.03 : player.moralePersonality === "PROFESSIONAL" ? -0.01 : 0;
  const clubStepPremium = club.leagueId === "L_PL_1" ? 0.04 : club.leagueId === "L_PL_2" ? 0.03 : 0.02;
  const seed = stableHash(`${player.id}_${player.contractEndDate}_PROMOTION_RAISE`);
  const randomPremium = seededRng(seed, 29) * 0.05;
  const raisePct = Math.max(
    0.1,
    Math.min(
      0.5,
      0.1 + Math.min(0.16, underpayPressure * 0.42) + Math.min(0.1, qualityPremium) + rolePremium + regularityPremium + personalityPremium + clubStepPremium + randomPremium
    )
  );
  const salary = roundContractMoney(currentSalary * (1 + raisePct));
  const years = player.age <= 23 ? 4 : player.age <= 28 ? 4 : player.age <= 32 ? 3 : player.age <= 34 ? 2 : 1;
  const bonusMultiplier = player.age >= 33 ? 0.62 : player.age >= 28 ? 0.52 : player.age >= 24 ? 0.42 : 0.3;
  return {
    salary,
    bonus: roundContractMoney(salary * bonusMultiplier),
    years,
    reason: "PROMOTION_RAISE",
    raisePct: Math.round(raisePct * 100),
    matches
  };
};
var shouldRequestPromotionRaise = (player, club, squadAverage, currentDate) => {
  const currentSalary = player.annualSalary || 0;
  if (currentSalary <= 0) return false;
  if (PlayerMoraleService.isMoraleDemandLocked(player, currentDate) || PlayerMoraleService.hasActiveMoraleDemand(player)) return false;
  if (player.transferPendingClubId || player.contractRaiseRequest || player.contractRaiseDemandUntil) return false;
  const matches = getLastSeasonMatches(player);
  const playedRegularly = matches >= 18 || (player.squadRole === "STARTER" || player.squadRole === "KEY_PLAYER" || player.isUntouchable) && matches >= 12;
  if (!playedRegularly) return false;
  const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
  const financialRespectRatio = currentSalary / Math.max(1, fairSalary);
  const hasSportingArgument = player.overallRating >= squadAverage - 1 || player.squadRole === "STARTER" || player.squadRole === "KEY_PLAYER" || player.isUntouchable;
  return hasSportingArgument && (financialRespectRatio < 0.94 || player.overallRating >= squadAverage + 3);
};
var estimateProtectedExitPrice = (player, club, squadAverage) => {
  const marketValue = player.marketValue ?? Math.max(15e4, Math.round(player.overallRating * player.overallRating * 4200));
  const squadPremium = Math.max(0, player.overallRating - squadAverage) * 0.035;
  const clubPremium = Math.max(0, club.reputation - 7) * 0.025;
  const untouchablePremium = player.isUntouchable ? 0.28 : 0.12;
  return roundTransferPrice(marketValue * (1.15 + untouchablePremium + squadPremium + clubPremium));
};
var shouldBoardSupportProtectedExit = (player, club, squadAverage, transferRandomFactor) => {
  const marketValue = player.marketValue ?? 0;
  const annualSalary = player.annualSalary ?? 0;
  const saleLooksValuable = marketValue >= Math.max(5e5, annualSalary * 3) || player.overallRating >= squadAverage + 9;
  if (!saleLooksValuable) return false;
  const greedScore = boardAttributeScore(club.board?.chciwosc);
  const ambitionScore = boardAttributeScore(club.board?.ambicja);
  const financialPressure = club.transferBudget < marketValue * 0.35 ? 4 : club.budget < marketValue * 0.2 ? 3 : 0;
  const confidencePressure = (club.boardConfidence ?? 70) < 55 ? 3 : 0;
  const sportingResistance = ambitionScore >= 3 && player.overallRating >= squadAverage + 10 ? 3 : 0;
  return greedScore * 2 + financialPressure + confidencePressure + transferRandomFactor - sportingResistance >= 5;
};
var getSeasonOutputProfile = (player) => {
  const statGroups = [player.stats, player.cupStats, player.euroStats].filter(Boolean);
  const goals = statGroups.reduce((sum, stats) => sum + (stats?.goals ?? 0), 0);
  const assists = statGroups.reduce((sum, stats) => sum + (stats?.assists ?? 0), 0);
  const cleanSheets = statGroups.reduce((sum, stats) => sum + (stats?.cleanSheets ?? 0), 0);
  const matches = statGroups.reduce((sum, stats) => sum + (stats?.matchesPlayed ?? 0), 0);
  const ratings = statGroups.flatMap((stats) => stats?.ratingHistory ?? []);
  const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null;
  return {
    goals,
    assists,
    cleanSheets,
    goalContributions: goals + assists,
    matches,
    averageRating
  };
};
var roundOneTimeBonusAmount = (value) => Math.max(2e4, Math.min(1e5, Math.round(value / 5e3) * 5e3));
var getOneTimeBonusPerformanceScore = (player, profile) => {
  if (profile.matches < 20) return 0;
  const matchScore = Math.min(24, (profile.matches - 20) * 1.2);
  const ratingScore = profile.averageRating !== null ? Math.max(-8, Math.min(24, (profile.averageRating - 6.55) * 28)) : 0;
  if (player.position === "FWD" /* FWD */) {
    const goalsPerMatch = profile.goals / Math.max(1, profile.matches);
    return Math.max(0, Math.min(100, 38 + matchScore + ratingScore + goalsPerMatch * 70 + profile.assists / Math.max(1, profile.matches) * 18));
  }
  if (player.position === "MID" /* MID */) {
    const assistsPerMatch = profile.assists / Math.max(1, profile.matches);
    return Math.max(0, Math.min(100, 36 + matchScore + ratingScore + assistsPerMatch * 78 + profile.goals / Math.max(1, profile.matches) * 18));
  }
  if (player.position === "DEF" /* DEF */) {
    return Math.max(0, Math.min(100, 34 + matchScore + ratingScore * 1.25 + profile.goalContributions / Math.max(1, profile.matches) * 24));
  }
  const cleanSheetRate = profile.cleanSheets / Math.max(1, profile.matches);
  return Math.max(0, Math.min(100, 34 + matchScore + ratingScore + cleanSheetRate * 70));
};
var getOneTimeBonusStatsLine = (player, profile) => {
  const ratingPart = profile.averageRating !== null ? `, \u015Brednia ocen ${profile.averageRating.toFixed(2).replace(".", ",")}` : "";
  if (player.position === "GK" /* GK */) {
    return `${profile.matches} mecz\xF3w, ${profile.cleanSheets} czystych kont${ratingPart}`;
  }
  if (player.position === "FWD" /* FWD */) {
    return `${profile.matches} mecz\xF3w, ${profile.goals} goli${ratingPart}`;
  }
  if (player.position === "MID" /* MID */) {
    return `${profile.matches} mecz\xF3w, ${profile.assists} asyst${ratingPart}`;
  }
  return `${profile.matches} mecz\xF3w, \u015Brednia ocen ${profile.averageRating !== null ? profile.averageRating.toFixed(2).replace(".", ",") : "brak"}, ${profile.cleanSheets} czystych kont zespo\u0142u`;
};
var hasStandoutSeasonOutput = (player, profile) => {
  if (profile.matches < 10) return false;
  const excellentRatings = profile.matches >= 14 && (profile.averageRating ?? 0) >= 7.22;
  if (player.position === "FWD") {
    return profile.goals >= 14 || profile.goalContributions >= 20 || excellentRatings && profile.goalContributions >= 12;
  }
  if (player.position === "MID") {
    return profile.assists >= 10 || profile.goalContributions >= 16 || excellentRatings && profile.goalContributions >= 8;
  }
  if (player.position === "DEF") {
    return profile.goalContributions >= 8 || profile.matches >= 16 && (profile.averageRating ?? 0) >= 7.1;
  }
  return (player.stats.cleanSheets ?? 0) >= 10 || profile.matches >= 16 && (profile.averageRating ?? 0) >= 7.05;
};
var formatSeasonOutputSummary = (profile) => {
  const ratingPart = profile.averageRating !== null ? `, \u015Brednia ocen ${profile.averageRating.toFixed(2).replace(".", ",")}` : "";
  return `${profile.goals} goli, ${profile.assists} asyst${ratingPart}`;
};
var isAvailableForMinutesDemand = (player) => player.health.status === "HEALTHY" /* HEALTHY */ && player.condition >= 75 && (player.fatigueDebt ?? 0) <= 55;
var getContractDaysLeft = (player, currentDate) => {
  if (!player.contractEndDate) return 9999;
  const contractEnd = new Date(player.contractEndDate);
  if (Number.isNaN(contractEnd.getTime())) return 9999;
  return Math.floor((contractEnd.getTime() - currentDate.getTime()) / DAY_MS);
};
var getAgeTransferStabilityBias = (player) => {
  const isEliteLatePrime = player.age >= 26 && player.overallRating >= 85;
  if (player.age < 26) return 0;
  if (player.age <= 28) return isEliteLatePrime ? -1 : -4;
  if (player.age <= 31) return isEliteLatePrime ? -3 : -8;
  if (player.age <= 34) return isEliteLatePrime ? -8 : -14;
  return isEliteLatePrime ? -12 : -20;
};
var hasRealisticCareerStepUpside = (player, personality, hasHighReputationInterest) => {
  if (hasHighReputationInterest) return true;
  if (player.age <= 24) return true;
  if (player.age <= 27 && player.overallRating >= 72) return true;
  if (player.overallRating >= 78) return true;
  const hasUnrealisticAmbition = personality === "EGOIST" || personality === "AMBITIOUS";
  return hasUnrealisticAmbition && player.age <= 30 && player.overallRating >= 72;
};
var getMinutesDemandMindset = (personality) => {
  const mindsets = {
    PROFESSIONAL: { approach: "CALM", selfBeliefBias: 0, minimumMinutesGap: 0.18, readinessThreshold: 64, priority: 3, moraleDrop: -1 },
    AMBITIOUS: { approach: "ASSERTIVE", selfBeliefBias: 8, minimumMinutesGap: 0.12, readinessThreshold: 53, priority: 4, moraleDrop: -2 },
    SENSITIVE: { approach: "PATIENT", selfBeliefBias: -2, minimumMinutesGap: 0.22, readinessThreshold: 66, priority: 3, moraleDrop: -2 },
    CONFIDENT: { approach: "ASSERTIVE", selfBeliefBias: 7, minimumMinutesGap: 0.14, readinessThreshold: 55, priority: 4, moraleDrop: -2 },
    NERVOUS: { approach: "PATIENT", selfBeliefBias: -5, minimumMinutesGap: 0.25, readinessThreshold: 70, priority: 3, moraleDrop: -2 },
    LOYAL: { approach: "PATIENT", selfBeliefBias: -6, minimumMinutesGap: 0.24, readinessThreshold: 72, priority: 2, moraleDrop: -1 },
    EGOIST: { approach: "BRAZEN", selfBeliefBias: 12, minimumMinutesGap: 0.08, readinessThreshold: 46, priority: 5, moraleDrop: -3 },
    CALM: { approach: "PATIENT", selfBeliefBias: -4, minimumMinutesGap: 0.22, readinessThreshold: 69, priority: 2, moraleDrop: -1 }
  };
  return mindsets[personality];
};
var getMinutesDemandCopy = (player, approach, recentAverageRating) => {
  const formSentence = recentAverageRating !== null && recentAverageRating >= 7 ? `Moje ostatnie wyst\u0119py te\u017C daj\u0105 mi argumenty. \u015Arednia ocen z ostatnich mecz\xF3w to ${recentAverageRating.toFixed(1).replace(".", ",")}.` : "Czuj\u0119 si\u0119 gotowy, \u017Ceby da\u0107 dru\u017Cynie wi\u0119cej na boisku.";
  if (approach === "BRAZEN") {
    return {
      subject: `\u017B\u0105danie wi\u0119kszej liczby minut: ${player.lastName}`,
      body: `Trenerze,

Powiem wprost: przy mojej jako\u015Bci obecna liczba minut jest nie do zaakceptowania. Widz\u0119 zawodnik\xF3w, kt\xF3rzy dostaj\u0105 wi\u0119cej szans, cho\u0107 nie daj\u0105 dru\u017Cynie wi\u0119cej ode mnie. ${formSentence}

Oczekuj\u0119 realnej zmiany w najbli\u017Cszych tygodniach. Nie zamierzam bez ko\u0144ca czeka\u0107 na \u0142awce, gdy wiem, \u017Ce zas\u0142uguj\u0119 na gr\u0119.

${player.firstName} ${player.lastName}`
    };
  }
  if (approach === "ASSERTIVE") {
    return {
      subject: `Rozmowa o wi\u0119kszej liczbie minut: ${player.lastName}`,
      body: `Trenerze,

Chcia\u0142bym jasno porozmawia\u0107 o swojej sytuacji. Uwa\u017Cam, \u017Ce jestem gotowy na wi\u0119ksz\u0105 odpowiedzialno\u015B\u0107, a obecna liczba minut nie odpowiada mojej pozycji w kadrze. ${formSentence}

Prosz\u0119 o realn\u0105 szans\u0119 w najbli\u017Cszych tygodniach. Chc\u0119 udowodni\u0107 swoj\u0105 warto\u015B\u0107 na boisku, ale potrzebuj\u0119 do tego uczciwej okazji.

${player.firstName} ${player.lastName}`
    };
  }
  if (approach === "CALM") {
    return {
      subject: `Pro\u015Bba o wi\u0119cej wyst\u0119p\xF3w: ${player.lastName}`,
      body: `Trenerze,

Chcia\u0142bym spokojnie porozmawia\u0107 o swojej roli. Szanuj\u0119 decyzje sztabu, ale czuj\u0119, \u017Ce mog\u0119 da\u0107 dru\u017Cynie wi\u0119cej. ${formSentence}

Nie oczekuj\u0119 gwarancji miejsca w sk\u0142adzie. Prosz\u0119 jedynie o realn\u0105 mo\u017Cliwo\u015B\u0107 pokazania, \u017Ce zas\u0142uguj\u0119 na wi\u0119cej minut.

${player.firstName} ${player.lastName}`
    };
  }
  return {
    subject: `Pro\u015Bba o szans\u0119: ${player.lastName}`,
    body: `Trenerze,

Wiem, \u017Ce o miejsce w sk\u0142adzie trzeba cierpliwie walczy\u0107 i nie chc\u0119 stawia\u0107 sprawy na ostrzu no\u017Ca. Czuj\u0119 jednak, \u017Ce jestem gotowy, by pom\xF3c dru\u017Cynie cz\u0119\u015Bciej. ${formSentence}

Je\u015Bli pojawi si\u0119 okazja, prosz\u0119 da\u0107 mi szans\u0119. Chcia\u0142bym odpowiedzie\u0107 na boisku i pokaza\u0107, \u017Ce mo\u017Cna na mnie liczy\u0107.

${player.firstName} ${player.lastName}`
  };
};
var getDevelopmentExitDemandCopy = (player, personality, totalMinutes) => {
  const minutesLine = totalMinutes > 0 ? `W tym sezonie mam tylko ${totalMinutes} minut i to nie wystarcza, \u017Ceby si\u0119 rozwija\u0107.` : "W tym sezonie praktycznie nie dostaj\u0119 minut i nie mog\u0119 si\u0119 rozwija\u0107 bez gry.";
  const exitLine = player.age <= 23 ? "Jestem w wieku, w kt\xF3rym potrzebuj\u0119 regularnych wyst\u0119p\xF3w, a nie samego czekania na \u0142awce." : "Potrzebuj\u0119 regularnej gry, \u017Ceby utrzyma\u0107 rytm i swoj\u0105 pozycj\u0119 sportow\u0105.";
  if (personality === "EGOIST" || personality === "AMBITIOUS") {
    return {
      subject: `Pro\u015Bba o odej\u015Bcie albo wypo\u017Cyczenie: ${player.lastName}`,
      body: `Trenerze,

Rozmawiali\u015Bmy ju\u017C o minutach, ale moja sytuacja si\u0119 nie zmieni\u0142a. ${minutesLine} ${exitLine}

Je\u015Bli nie ma dla mnie realnego miejsca w zespole, prosz\u0119 o wystawienie mnie na list\u0119 transferow\u0105 albo zgod\u0119 na wypo\u017Cyczenie. Chc\u0119 gra\u0107, rozwija\u0107 si\u0119 i mie\u0107 jasn\u0105 drog\u0119 do kolejnego kroku.

Nie chc\u0119 przeci\u0105ga\u0107 tej sytuacji. Potrzebuj\u0119 konkretnej decyzji klubu.

${player.firstName} ${player.lastName}`,
      priority: 5,
      moraleDrop: -5
    };
  }
  if (personality === "LOYAL" || personality === "PROFESSIONAL" || personality === "CALM") {
    return {
      subject: `Pro\u015Bba o rozwi\u0105zanie sytuacji z minutami: ${player.lastName}`,
      body: `Trenerze,

Szanuj\u0119 decyzje sztabu, ale po mojej pro\u015Bbie o wi\u0119cej minut dalej nie dosta\u0142em realnej szansy. ${minutesLine} ${exitLine}

Je\u015Bli w najbli\u017Cszym czasie nie ma dla mnie miejsca w dru\u017Cynie, prosz\u0119 o zgod\u0119 na wypo\u017Cyczenie, a je\u015Bli to nie b\u0119dzie mo\u017Cliwe, o rozwa\u017Cenie transferu. Chc\u0119 zachowa\u0107 profesjonalizm, ale potrzebuj\u0119 gry.

${player.firstName} ${player.lastName}`,
      priority: 4,
      moraleDrop: -3
    };
  }
  return {
    subject: `Rozmowa o przysz\u0142o\u015Bci po braku minut: ${player.lastName}`,
    body: `Trenerze,

Po mojej pro\u015Bbie o wi\u0119cej wyst\u0119p\xF3w sytuacja si\u0119 nie zmieni\u0142a. ${minutesLine} ${exitLine}

Chcia\u0142bym porozmawia\u0107 o rozwi\u0105zaniu: albo dostan\u0119 realn\u0105 \u015Bcie\u017Ck\u0119 do gry tutaj, albo klub pozwoli mi odej\u015B\u0107 b\u0105d\u017A p\xF3j\u015B\u0107 na wypo\u017Cyczenie. Dla mojego rozwoju najwa\u017Cniejsze s\u0105 teraz regularne minuty.

${player.firstName} ${player.lastName}`,
    priority: 4,
    moraleDrop: -4
  };
};
var getTransferListDemandCopy = (player, personality, trigger, seasonOutputSummary) => {
  if (trigger === "STANDOUT_SEASON") {
    const outputSentence = seasonOutputSummary ? `Ten sezon daje mi konkretne argumenty: ${seasonOutputSummary}.` : "Ten sezon daje mi konkretne argumenty sportowe.";
    return {
      subject: `Pro\u015Bba po mocnym sezonie: ${player.lastName}`,
      body: `Trenerze,

Czuj\u0119, \u017Ce po takim sezonie powinienem zrobi\u0107 kolejny krok w karierze. ${outputSentence} Uwa\u017Cam, \u017Ce moja forma mo\u017Ce zainteresowa\u0107 mocniejsze kluby i nie chc\u0119 przegapi\u0107 tego momentu.

Prosz\u0119 o wystawienie mnie na list\u0119 transferow\u0105 albo jasn\u0105 deklaracj\u0119, \u017Ce klub b\u0119dzie got\xF3w rozmawia\u0107, je\u015Bli pojawi si\u0119 odpowiednia oferta. Chc\u0119 zachowa\u0107 profesjonalizm, ale potrzebuj\u0119 uczciwej drogi do rozwoju.

${player.firstName} ${player.lastName}`
    };
  }
  if (trigger === "STRONG_INTEREST") {
    return {
      subject: `Pro\u015Bba o zgod\u0119 na rozmowy: ${player.lastName}`,
      body: `Trenerze,

Wiem, \u017Ce interesuj\u0105 si\u0119 mn\u0105 kluby o wy\u017Cszej reputacji. Dla mnie to jasny sygna\u0142, \u017Ce mog\u0119 spr\xF3bowa\u0107 gry na wy\u017Cszym poziomie i chcia\u0142bym potraktowa\u0107 t\u0119 szans\u0119 powa\u017Cnie.

Prosz\u0119 o wystawienie mnie na list\u0119 transferow\u0105 albo zgod\u0119 na rozmowy przy odpowiedniej ofercie. Nie chc\u0119 odchodzi\u0107 w konflikcie, ale czuj\u0119, \u017Ce ten moment mo\u017Ce by\u0107 wa\u017Cny dla mojej kariery.

${player.firstName} ${player.lastName}`
    };
  }
  if (trigger === "HIGHER_REPUTATION") {
    return {
      subject: `Rozmowa o kolejnym kroku w karierze: ${player.lastName}`,
      body: `Trenerze,

Czuj\u0119, \u017Ce sportowo jestem gotowy na kolejny krok. Moja forma i poziom, kt\xF3ry pokazuj\u0119 na boisku, daj\u0105 mi przekonanie, \u017Ce powinienem spr\xF3bowa\u0107 gry w klubie o wy\u017Cszej reputacji i wi\u0119kszych ambicjach.

Szanuj\u0119 dru\u017Cyn\u0119 i nie chc\u0119 odchodzi\u0107 za wszelk\u0105 cen\u0119. Prosz\u0119 jednak o zgod\u0119 na odej\u015Bcie, je\u015Bli pojawi si\u0119 odpowiednia oferta z mocniejszego klubu. Chcia\u0142bym, \u017Ceby\u015Bmy uczciwie porozmawiali o mojej przysz\u0142o\u015Bci.

${player.firstName} ${player.lastName}`
    };
  }
  if (player.isUntouchable) {
    if (personality === "EGOIST" || personality === "AMBITIOUS" || personality === "CONFIDENT") {
      return {
        subject: `Rozmowa o mojej przysz\u0142o\u015Bci: ${player.lastName}`,
        body: `Trenerze,

Chcia\u0142bym porozmawia\u0107 o swojej przysz\u0142o\u015Bci. Wiem, \u017Ce klub oznaczy\u0142 mnie jako zawodnika \u201Enie na sprzeda\u017C\u201D, ale nie chc\u0119, \u017Ceby ten status zamkn\u0105\u0142 mi drog\u0119 do kolejnego kroku w karierze.

Czuj\u0119, \u017Ce jestem gotowy na nowe wyzwanie. Nie oczekuj\u0119 zgody na pierwszy przypadkowy transfer, ale chc\u0119 jasnej deklaracji, \u017Ce przy naprawd\u0119 dobrej ofercie klub b\u0119dzie gotowy usi\u0105\u015B\u0107 do rozm\xF3w.

${player.firstName} ${player.lastName}`
      };
    }
    return {
      subject: `Pro\u015Bba o rozmow\u0119 o przysz\u0142o\u015Bci: ${player.lastName}`,
      body: `Trenerze,

Doceniam, \u017Ce klub uwa\u017Ca mnie za wa\u017Cnego zawodnika. Chcia\u0142bym jednak spokojnie porozmawia\u0107 o statusie \u201Enie na sprzeda\u017C\u201D. W d\u0142u\u017Cszej perspektywie chcia\u0142bym mie\u0107 mo\u017Cliwo\u015B\u0107 zrobienia kolejnego kroku w karierze.

Nie zale\u017Cy mi na konflikcie ani odej\u015Bciu do przypadkowego zespo\u0142u. Prosz\u0119 tylko, aby klub pozosta\u0142 otwarty na naprawd\u0119 dobr\u0105 ofert\u0119 i potraktowa\u0142 moje ambicje powa\u017Cnie.

${player.firstName} ${player.lastName}`
    };
  }
  return {
    subject: `Pro\u015Bba o list\u0119 transferow\u0105: ${player.lastName}`,
    body: `Trenerze,

Nie czuj\u0119 si\u0119 ju\u017C dobrze w tej dru\u017Cynie. Mam poczucie, \u017Ce m\xF3j poziom sportowy i ambicje rozchodz\u0105 si\u0119 z miejscem, w kt\xF3rym obecnie jeste\u015Bmy jako zesp\xF3\u0142.

Prosz\u0119 o zgod\u0119 na wystawienie mnie na list\u0119 transferow\u0105. Chc\u0119 zachowa\u0107 profesjonalizm, ale potrzebuj\u0119 jasnej drogi do zmiany otoczenia.

${player.firstName} ${player.lastName}`
  };
};
var getPlayerTalkResponse = (talkType, isPositive) => {
  const responses = {
    PRAISE: {
      positive: "Dzi\u0119kuj\u0119, trenerze. Dobrze to s\u0142ysze\u0107. Postaram si\u0119 utrzyma\u0107 ten poziom.",
      negative: "Doceniam s\u0142owa, ale czuj\u0119, \u017Ce mog\u0142em da\u0107 dru\u017Cynie jeszcze wi\u0119cej."
    },
    MOTIVATE: {
      positive: "Jestem gotowy. Wyjd\u0119 na boisko z pe\u0142nym zaanga\u017Cowaniem.",
      negative: "Rozumiem, trenerze, ale potrzebuj\u0119 jeszcze chwili, \u017Ceby z\u0142apa\u0107 pewno\u015B\u0107."
    },
    SUPPORT: {
      positive: "Dzi\u0119ki za wsparcie. To dla mnie wa\u017Cne. Odpowiem na boisku.",
      negative: "Wiem, \u017Ce chcia\u0142 pan dobrze, ale dalej siedzi mi to w g\u0142owie."
    },
    CRITICIZE: {
      positive: "Przyjmuj\u0119 to. Wiem, \u017Ce musz\u0119 da\u0107 wi\u0119cej i popracuj\u0119 nad tym.",
      negative: "Rozumiem uwagi, ale czuj\u0119, \u017Ce ocena by\u0142a zbyt surowa."
    },
    PROMISE_MINUTES: {
      positive: "Dobrze, trenerze. B\u0119d\u0119 gotowy, kiedy dostan\u0119 swoj\u0105 szans\u0119.",
      negative: "Chc\u0119 w to wierzy\u0107, ale musz\u0119 zobaczy\u0107, \u017Ce naprawd\u0119 dostan\u0119 okazj\u0119."
    },
    PROMISE_ONE_TIME_BONUS: {
      positive: "Doceniam to, trenerze. Poczekam na decyzj\u0119 zarz\u0105du.",
      negative: "Rozumiem, ale sama rozmowa z zarz\u0105dem jeszcze niczego nie rozwi\u0105zuje."
    },
    DEMAND_WORK: {
      positive: "Ma pan racj\u0119. Podkr\u0119c\u0119 tempo na treningach.",
      negative: "Pracuj\u0119 ci\u0119\u017Cko, trenerze. Mam nadziej\u0119, \u017Ce te\u017C pan to zauwa\u017Cy."
    }
  };
  const response = responses[talkType];
  return isPositive ? response.positive : response.negative;
};
var isSameOrHigherRole = (currentRole, requestedRole) => {
  if (!requestedRole) return true;
  if (requestedRole === "STARTER") return currentRole === "STARTER" || currentRole === "KEY_PLAYER";
  return currentRole === "KEY_PLAYER";
};
var hasBrokenContractPromise = (player) => !!player.transferContractPromise?.broken;
var CLINCHED_CHAMPIONSHIP_MORALE_REASON = "Matematycznie zapewnione mistrzostwo kraju";
var CLINCHED_PROMOTION_MORALE_REASON = "Matematycznie zapewniony awans do wy\u017Cszej ligi";
var MAX_RECENT_MORALE_HISTORY_ENTRIES = 4;
var MAX_PROTECTED_MORALE_HISTORY_ENTRIES = 2;
var MAX_MINDSET_HISTORY_ENTRIES = 2;
var isProtectedMoraleHistoryEntry = (entry) => entry.reason === CLINCHED_CHAMPIONSHIP_MORALE_REASON || entry.reason === CLINCHED_PROMOTION_MORALE_REASON;
var compactMoraleHistory = (entries) => {
  const recent = entries.slice(0, MAX_RECENT_MORALE_HISTORY_ENTRIES);
  const recentIds = new Set(recent.map((entry) => entry.id));
  const protectedEntries = entries.filter((entry) => isProtectedMoraleHistoryEntry(entry) && !recentIds.has(entry.id)).slice(0, MAX_PROTECTED_MORALE_HISTORY_ENTRIES);
  return [...recent, ...protectedEntries];
};
var compactMindsetHistory = (entries) => entries.slice(0, MAX_MINDSET_HISTORY_ENTRIES);
var MORALE_BAND_FLOORS = [0, 25, 45, 60, 80, 100];
var getMoraleBandIndex = (morale) => {
  if (morale <= 19) return 0;
  if (morale <= 39) return 1;
  if (morale <= 59) return 2;
  if (morale <= 79) return 3;
  if (morale < 100) return 4;
  return 5;
};
var getMoraleFloorAfterBandSteps = (morale, steps) => {
  const targetIndex = Math.min(MORALE_BAND_FLOORS.length - 1, getMoraleBandIndex(morale) + Math.max(0, steps));
  return MORALE_BAND_FLOORS[targetIndex] ?? 100;
};
var getSeasonSuccessMoraleBoost = (currentMorale, baseBoost, levelUpSteps) => {
  if (levelUpSteps <= 0) return baseBoost;
  const targetMorale = getMoraleFloorAfterBandSteps(currentMorale, levelUpSteps);
  return Math.max(baseBoost, targetMorale - currentMorale);
};
var getRandomSeasonSuccessLevelUpSteps = (seed, offset) => seededRng(seed, offset) < 0.5 ? 1 : 2;
var getClinchedSeasonAchievementReason = (achievement) => achievement === "championship" ? CLINCHED_CHAMPIONSHIP_MORALE_REASON : CLINCHED_PROMOTION_MORALE_REASON;
var hasClinchedSeasonAchievementMorale = (player, achievement) => {
  const reason = getClinchedSeasonAchievementReason(achievement);
  return (player.moraleHistory ?? []).some((entry) => entry.reason === reason);
};
var PlayerMoraleService = {
  clamp: (morale) => Math.max(0, Math.min(100, Math.round(morale))),
  getInitialMorale: (player) => {
    const seed = stableHash(player.id);
    const mentality = player.attributes.mentality ?? 50;
    const ageBias = player.age <= 21 ? 0.04 : player.age >= 31 ? 0.02 : 0;
    const mentalityBias = (mentality - 50) / 500;
    const roll = Math.max(0, Math.min(0.999, seededRng(seed, 3) + ageBias + mentalityBias));
    const stars = roll < 0.16 ? 1 : roll < 0.36 ? 2 : roll < 0.66 ? 3 : roll < 0.88 ? 4 : 5;
    const ranges = {
      1: [10, 20],
      2: [25, 35],
      3: [45, 64],
      4: [68, 79],
      5: [84, 95]
    };
    const [min, max] = ranges[stars] ?? ranges[3];
    const variation = Math.floor(seededRng(seed, 11) * (max - min + 1));
    return PlayerMoraleService.clamp(min + variation);
  },
  getInitialPersonality: (player) => {
    const attrs = player.attributes;
    if ((attrs.workRate ?? 50) >= 75 && (attrs.mentality ?? 50) >= 68) return "PROFESSIONAL";
    if ((attrs.talent ?? 50) >= 78 || (attrs.attacking ?? 50) >= 76) return "AMBITIOUS";
    if ((attrs.leadership ?? 50) >= 76) return "CONFIDENT";
    if ((attrs.aggression ?? 50) >= 76) return "EGOIST";
    const index = Math.floor(seededRng(stableHash(player.id), 7) * PERSONALITIES.length);
    return PERSONALITIES[index] ?? "CALM";
  },
  getInitialMindset: (player) => {
    const morale = player.morale ?? PlayerMoraleService.getInitialMorale(player);
    const personality = player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player);
    const professionalBonus = personality === "PROFESSIONAL" ? 6 : personality === "LOYAL" ? 8 : personality === "EGOIST" ? -8 : 0;
    const ambitionPressure = personality === "AMBITIOUS" || personality === "EGOIST" ? 8 : personality === "CALM" ? -4 : 0;
    const hasRole = player.squadRole === "STARTER" || player.squadRole === "KEY_PLAYER";
    const youngDevelopmentNeed = player.age <= 23 ? 5 : 0;
    const ageStability = player.age >= 35 ? 16 : player.age >= 32 ? 11 : player.age >= 29 ? 7 : player.age >= 26 ? 3 : 0;
    return {
      coachTrust: PlayerMoraleService.clamp(morale + professionalBonus),
      clubHappiness: PlayerMoraleService.clamp(morale + Math.round(professionalBonus * 0.5)),
      squadBelonging: PlayerMoraleService.clamp(morale + (personality === "LOYAL" ? 10 : 0) - (player.isOnTransferList ? 18 : 0)),
      roleClarity: PlayerMoraleService.clamp(55 + (hasRole ? 12 : -4) + professionalBonus),
      playingTimeSatisfaction: PlayerMoraleService.clamp(morale + (hasRole ? 5 : -4)),
      developmentSatisfaction: PlayerMoraleService.clamp(morale - youngDevelopmentNeed + (player.trainingFocus ? 4 : 0)),
      transferOpenness: PlayerMoraleService.clamp(45 - morale + ambitionPressure - ageStability + (player.isOnTransferList ? 35 : 0) + (player.interestedClubs?.length ?? 0) * 5),
      conflictLevel: PlayerMoraleService.clamp(55 - morale + Math.max(0, ambitionPressure)),
      lastUpdatedAt: void 0,
      history: []
    };
  },
  normalizeMindset: (player) => {
    const initial = PlayerMoraleService.getInitialMindset(player);
    const existing = player.playerMindset;
    if (!existing) return initial;
    return {
      coachTrust: PlayerMoraleService.clamp(existing.coachTrust ?? initial.coachTrust),
      clubHappiness: PlayerMoraleService.clamp(existing.clubHappiness ?? initial.clubHappiness),
      squadBelonging: PlayerMoraleService.clamp(existing.squadBelonging ?? initial.squadBelonging),
      roleClarity: PlayerMoraleService.clamp(existing.roleClarity ?? initial.roleClarity),
      playingTimeSatisfaction: PlayerMoraleService.clamp(existing.playingTimeSatisfaction ?? initial.playingTimeSatisfaction),
      developmentSatisfaction: PlayerMoraleService.clamp(existing.developmentSatisfaction ?? initial.developmentSatisfaction),
      transferOpenness: PlayerMoraleService.clamp(existing.transferOpenness ?? initial.transferOpenness),
      conflictLevel: PlayerMoraleService.clamp(existing.conflictLevel ?? initial.conflictLevel),
      lastUpdatedAt: existing.lastUpdatedAt,
      history: compactMindsetHistory(existing.history ?? [])
    };
  },
  inferMindsetDelta: (reason, moraleDelta) => {
    const text = reason.toLowerCase();
    const impact = Math.max(1, Math.min(10, Math.abs(moraleDelta)));
    const sign = moraleDelta >= 0 ? 1 : -1;
    const deltas = {
      clubHappiness: sign * Math.max(1, Math.round(impact * 0.7)),
      conflictLevel: sign > 0 ? -Math.max(1, Math.round(impact * 0.6)) : Math.max(1, Math.round(impact * 0.8))
    };
    const add = (key, value) => {
      deltas[key] = (deltas[key] ?? 0) + value;
    };
    if (text.includes("rozmow") || text.includes("trener") || text.includes("obietnic")) {
      add("coachTrust", sign * Math.max(1, Math.round(impact * 0.9)));
    }
    if (text.includes("minut") || text.includes("wyst\u0119p") || text.includes("gry w nast\u0119pnym meczu")) {
      add("playingTimeSatisfaction", sign * Math.max(2, impact));
      add("coachTrust", sign * Math.max(1, Math.round(impact * 0.5)));
    }
    if (text.includes("rola") || text.includes("status") || text.includes("podstawowa") || text.includes("kluczowy")) {
      add("roleClarity", sign * Math.max(2, impact));
      add("coachTrust", sign * Math.max(1, Math.round(impact * 0.5)));
    }
    if (text.includes("rozw") || text.includes("wypo\u017Cyczenie") || text.includes("braku minut")) {
      add("developmentSatisfaction", sign * Math.max(2, impact));
    }
    if (text.includes("transfer") || text.includes("odej") || text.includes("sprzeda") || text.includes("ofert")) {
      add("transferOpenness", sign > 0 ? -Math.max(1, Math.round(impact * 0.7)) : Math.max(2, impact));
      add("coachTrust", sign * Math.max(1, Math.round(impact * 0.4)));
    }
    if (text.includes("rezerw")) {
      add("squadBelonging", sign * Math.max(2, impact));
      add("roleClarity", sign * Math.max(1, Math.round(impact * 0.6)));
    }
    if (text.includes("konflikt") || text.includes("zignorowan") || text.includes("odrzucon") || text.includes("niespe\u0142nion")) {
      add("conflictLevel", Math.max(2, impact));
      add("coachTrust", -Math.max(2, impact));
    }
    if (text.includes("naturalna stabilizacja")) {
      return {
        clubHappiness: sign,
        conflictLevel: sign > 0 ? -1 : 1
      };
    }
    return deltas;
  },
  withMindsetChange: (player, deltas, reason, date) => {
    const current = PlayerMoraleService.normalizeMindset(player);
    const next = { ...current };
    let changed = false;
    Object.entries(deltas).forEach(([key, delta]) => {
      if (!delta) return;
      const previousValue = next[key];
      const nextValue = PlayerMoraleService.clamp(previousValue + delta);
      if (nextValue === previousValue) return;
      next[key] = nextValue;
      changed = true;
    });
    if (!changed) return { ...player, playerMindset: current };
    const entry = {
      id: `MINDSET_${player.id}_${date.getTime()}_${stableHash(reason)}`,
      date: toDateKey(date),
      reason,
      deltas
    };
    return {
      ...player,
      playerMindset: {
        ...next,
        lastUpdatedAt: toDateKey(date),
        history: compactMindsetHistory([entry, ...current.history ?? []])
      }
    };
  },
  ensurePlayerState: (player) => ({
    ...player,
    form: typeof player.form === "number" ? player.form : PlayerFormService.calculate(player).score,
    morale: player.morale ?? PlayerMoraleService.getInitialMorale(player),
    moralePersonality: player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player),
    moraleHistory: compactMoraleHistory(player.moraleHistory ?? []),
    playerMindset: PlayerMoraleService.normalizeMindset(player),
    lastIndividualTalkDate: player.lastIndividualTalkDate ?? null,
    promisedMinutesUntil: player.promisedMinutesUntil ?? null,
    promisedMinutesBaseline: player.promisedMinutesBaseline ?? null,
    promisedRoleNextMatchFixtureId: player.promisedRoleNextMatchFixtureId ?? null,
    lastMoraleDemandDate: player.lastMoraleDemandDate ?? null,
    minutesDemandUntil: player.minutesDemandUntil ?? null,
    minutesDemandBaseline: player.minutesDemandBaseline ?? null,
    unresolvedMinutesDemandDate: player.unresolvedMinutesDemandDate ?? null,
    unresolvedMinutesDemandBaseline: player.unresolvedMinutesDemandBaseline ?? null,
    developmentExitDemandUntil: player.developmentExitDemandUntil ?? null,
    developmentExitDemandBaseline: player.developmentExitDemandBaseline ?? null,
    lastTemptingOfferConflictDate: player.lastTemptingOfferConflictDate ?? null,
    roleDemandUntil: player.roleDemandUntil ?? null,
    requestedSquadRole: player.requestedSquadRole ?? null,
    squadRoleMindsetLockUntil: player.squadRoleMindsetLockUntil ?? null,
    transferListDemandUntil: player.transferListDemandUntil ?? null,
    oneTimeBonusPromise: player.oneTimeBonusPromise ?? null,
    oneTimeBonusAwardedSeason: player.oneTimeBonusAwardedSeason ?? null,
    contractRaiseDemandUntil: player.contractRaiseDemandUntil ?? null,
    contractRaiseRequest: player.contractRaiseRequest ?? null,
    contractRaiseReminderUntil: player.contractRaiseReminderUntil ?? null,
    contractRaiseTeamMoraleDelta: player.contractRaiseTeamMoraleDelta ?? null,
    contractRaiseTeamMoraleReason: player.contractRaiseTeamMoraleReason ?? null,
    reserveProtestUntil: player.reserveProtestUntil ?? null,
    moraleDemandLockoutUntil: player.moraleDemandLockoutUntil ?? null,
    // ── Transfer Request Dialog (PlayerTransferRequestDialogService) ──────────
    transferContractPromise: player.transferContractPromise ?? null,
    transferAllowAfterSeason: player.transferAllowAfterSeason ?? false,
    transferAllowAfterSeasonDeadline: player.transferAllowAfterSeasonDeadline ?? null,
    transferRequestPendingResponse: player.transferRequestPendingResponse ?? null
  }),
  getMoraleDemandLockoutUntil: (currentDate) => {
    const lockoutUntil = new Date(currentDate);
    lockoutUntil.setFullYear(lockoutUntil.getFullYear() + 1);
    return lockoutUntil.toISOString();
  },
  isMoraleDemandLocked: (player, currentDate) => {
    if (!player.moraleDemandLockoutUntil) return false;
    const lockoutUntil = new Date(player.moraleDemandLockoutUntil);
    return !Number.isNaN(lockoutUntil.getTime()) && dateOnly(currentDate).getTime() < dateOnly(lockoutUntil).getTime();
  },
  hasActiveMoraleDemand: (player) => !!player.minutesDemandUntil || !!player.roleDemandUntil || !!player.transferListDemandUntil || !!player.developmentExitDemandUntil || !!player.contractRaiseDemandUntil || !!player.reserveProtestUntil || !!player.boardAppealDeadline,
  applyClinchedSeasonAchievementMorale: (player, achievement, currentDate) => {
    let withMorale = PlayerMoraleService.ensurePlayerState(player);
    if (hasClinchedSeasonAchievementMorale(withMorale, achievement)) return withMorale;
    const baseBoost = achievement === "championship" ? 8 : 7;
    const reason = getClinchedSeasonAchievementReason(achievement);
    const currentMorale = withMorale.morale ?? 50;
    const seed = stableHash(`${withMorale.id}_${toDateKey(currentDate)}_${achievement}_CLINCHED`);
    const achievementBoost = getSeasonSuccessMoraleBoost(
      currentMorale,
      baseBoost,
      getRandomSeasonSuccessLevelUpSteps(seed, 41)
    );
    const effectiveMoraleBoost = hasBrokenContractPromise(withMorale) ? Math.max(1, Math.round(achievementBoost * 0.35)) : achievementBoost;
    withMorale = PlayerMoraleService.withMoraleChange(withMorale, effectiveMoraleBoost, reason, currentDate);
    return PlayerMoraleService.withMindsetChange(
      withMorale,
      {
        clubHappiness: achievement === "championship" ? 10 : 8,
        squadBelonging: achievement === "championship" ? 9 : 7,
        developmentSatisfaction: achievement === "promotion" ? 7 : 4,
        transferOpenness: achievement === "championship" ? -16 : -14,
        conflictLevel: hasBrokenContractPromise(withMorale) ? 0 : -7
      },
      reason,
      currentDate
    );
  },
  applyPresidentTeamBonusMorale: (player, totalBonusAmount, squadSize, currentDate) => {
    let withMorale = PlayerMoraleService.ensurePlayerState(player);
    const mindset = PlayerMoraleService.normalizeMindset(withMorale);
    const personality = withMorale.moralePersonality ?? "CALM";
    const seed = stableHash(`${withMorale.id}_${toDateKey(currentDate)}_${totalBonusAmount}_PRESIDENT_TEAM_BONUS`);
    const shareValue = totalBonusAmount / Math.max(1, squadSize);
    const amountBonus = shareValue >= 1e5 ? 2 : shareValue >= 5e4 ? 1 : 0;
    const gratitudeScore = (withMorale.morale ?? 50) * 0.14 + mindset.clubHappiness * 0.24 + mindset.squadBelonging * 0.18 + mindset.coachTrust * 0.1 - mindset.conflictLevel * 0.18 + (personality === "LOYAL" || personality === "PROFESSIONAL" ? 10 : 0) + (personality === "EGOIST" || personality === "AMBITIOUS" ? -4 : 0) + seededRng(seed, 31) * 24;
    const moraleDelta = gratitudeScore >= 66 ? Math.min(6, 4 + amountBonus) : gratitudeScore >= 50 ? Math.min(4, 2 + amountBonus) : gratitudeScore >= 36 ? 1 : 0;
    const reason = moraleDelta > 0 ? "Premia dru\u017Cynowa prezesa poprawi\u0142a morale" : "Premia dru\u017Cynowa prezesa przyj\u0119ta neutralnie";
    if (moraleDelta > 0) {
      withMorale = PlayerMoraleService.withMoraleChange(withMorale, moraleDelta, reason, currentDate);
    }
    return PlayerMoraleService.withMindsetChange(
      withMorale,
      moraleDelta > 0 ? { clubHappiness: 4 + moraleDelta, squadBelonging: 2 + Math.ceil(moraleDelta / 2), conflictLevel: -2 } : { clubHappiness: 1, squadBelonging: 1 },
      reason,
      currentDate
    );
  },
  applyContractSigningMindflowReset: (player, currentDate) => ({
    ...player,
    playerMindset: PlayerMoraleService.withMindsetChange(
      PlayerMoraleService.ensurePlayerState(player),
      {
        coachTrust: 8,
        clubHappiness: 6,
        roleClarity: 4,
        transferOpenness: -12,
        conflictLevel: -12
      },
      "Podpisanie kontraktu i wyciszenie \u017C\u0105da\u0144",
      currentDate
    ).playerMindset,
    moraleDemandLockoutUntil: PlayerMoraleService.getMoraleDemandLockoutUntil(currentDate),
    lastMoraleDemandDate: null,
    promisedMinutesUntil: null,
    minutesDemandUntil: null,
    minutesDemandBaseline: null,
    unresolvedMinutesDemandDate: null,
    unresolvedMinutesDemandBaseline: null,
    developmentExitDemandUntil: null,
    developmentExitDemandBaseline: null,
    lastTemptingOfferConflictDate: null,
    promisedRoleNextMatchFixtureId: null,
    roleDemandUntil: null,
    requestedSquadRole: null,
    transferListDemandUntil: null,
    contractRaiseDemandUntil: null,
    contractRaiseRequest: null,
    contractRaiseReminderUntil: null,
    contractRaiseTeamMoraleDelta: null,
    contractRaiseTeamMoraleReason: null,
    reserveProtestUntil: null,
    // ── Transfer Request Dialog — czyść po podpisaniu kontraktu ──────────────
    // Podpisanie kontraktu = obietnica A została spełniona (lub nieaktualna)
    // PlayerTransferRequestDialogService zarządza tymi polami
    transferContractPromise: null,
    transferAllowAfterSeason: false,
    transferAllowAfterSeasonDeadline: null,
    transferRequestPendingResponse: null
  }),
  applySeasonOutcomeMindflow: (player, input) => {
    const { club, currentDate, squadAverage } = input;
    let withMorale = PlayerMoraleService.ensurePlayerState(player);
    const dateKey = toDateKey(currentDate);
    const personality = withMorale.moralePersonality ?? "CALM";
    const seed = stableHash(`${withMorale.id}_${dateKey}_SEASON_OUTCOME`);
    const roll = seededRng(seed, 71);
    const stayReasonParts = [
      input.isChampion ? "mistrzostwo kraju" : null,
      input.isPromoted ? "awans do wy\u017Cszej ligi" : null,
      input.qualifiedForEurope ? "gra w europejskich pucharach" : null,
      input.wonCup ? "zdobycie pucharu" : null
    ].filter(Boolean);
    if (stayReasonParts.length > 0) {
      const alreadyAppliedChampionshipMorale = input.isChampion && hasClinchedSeasonAchievementMorale(withMorale, "championship");
      const alreadyAppliedPromotionMorale = input.isPromoted && hasClinchedSeasonAchievementMorale(withMorale, "promotion");
      const alreadyAppliedMainAchievementMorale = !!alreadyAppliedChampionshipMorale || !!alreadyAppliedPromotionMorale;
      const personalityStayBias = personality === "LOYAL" ? 0.18 : personality === "PROFESSIONAL" ? 0.12 : personality === "CALM" ? 0.08 : personality === "AMBITIOUS" ? -0.02 : personality === "EGOIST" ? -0.1 : 0;
      const loyalty2 = Math.max(1, Math.min(99, Math.round(withMorale.lojalnosc ?? 50)));
      const loyaltyStayModifier = (loyalty2 - 50) / 49 * 0.16;
      const hadExitIntent = !!withMorale.isOnTransferList || !!withMorale.transferListDemandUntil || !!withMorale.developmentExitDemandUntil || !!withMorale.transferAllowAfterSeason;
      const successScore = (input.isChampion ? 0.24 : 0) + (input.isPromoted ? 0.2 : 0) + (input.qualifiedForEurope ? 0.22 : 0) + (input.wonCup ? 0.16 : 0);
      const roleBonus = withMorale.squadRole === "KEY_PLAYER" || withMorale.isUntouchable ? 0.08 : withMorale.squadRole === "STARTER" ? 0.04 : 0;
      const promotionReconsiderBonus = input.isPromoted && hadExitIntent ? 0.18 : 0;
      const stayChance = Math.max(0.18, Math.min(0.84, 0.24 + successScore + personalityStayBias + loyaltyStayModifier + roleBonus + promotionReconsiderBonus));
      const moraleBoost = alreadyAppliedMainAchievementMorale ? input.wonCup ? 5 : 0 : input.isChampion ? 8 : input.isPromoted ? 7 : input.qualifiedForEurope ? 6 : 5;
      const reason = `Sukces klubu zmienia nastawienie: ${stayReasonParts.join(", ")}`;
      const isContractPromiseConflict = hasBrokenContractPromise(withMorale);
      const currentMorale = withMorale.morale ?? 50;
      const shouldApplyMainAchievementMorale = !!input.isChampion && !alreadyAppliedChampionshipMorale || !!input.isPromoted && !alreadyAppliedPromotionMorale;
      const seasonAchievementBoost = getSeasonSuccessMoraleBoost(
        currentMorale,
        moraleBoost,
        shouldApplyMainAchievementMorale ? getRandomSeasonSuccessLevelUpSteps(seed, 83) : 0
      );
      const effectiveMoraleBoost = seasonAchievementBoost <= 0 ? 0 : isContractPromiseConflict ? Math.max(1, Math.round(seasonAchievementBoost * 0.35)) : seasonAchievementBoost;
      if (effectiveMoraleBoost > 0) {
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, effectiveMoraleBoost, reason, currentDate);
      }
      withMorale = PlayerMoraleService.withMindsetChange(
        withMorale,
        {
          clubHappiness: 8,
          squadBelonging: 7,
          developmentSatisfaction: input.qualifiedForEurope || input.isPromoted ? 6 : 3,
          transferOpenness: -Math.round(10 + successScore * 20),
          conflictLevel: isContractPromiseConflict ? 0 : -6
        },
        reason,
        currentDate
      );
      if (roll < stayChance) {
        const shouldWithdrawTransferIntent = input.isPromoted && hadExitIntent ? true : withMorale.isOnTransferList && roll < stayChance * 0.35;
        const nextIsOnTransferList = shouldWithdrawTransferIntent ? false : withMorale.isOnTransferList;
        withMorale = {
          ...withMorale,
          transferListDemandUntil: null,
          developmentExitDemandUntil: null,
          transferAllowAfterSeason: shouldWithdrawTransferIntent ? false : withMorale.transferAllowAfterSeason,
          transferAllowAfterSeasonDeadline: shouldWithdrawTransferIntent ? null : withMorale.transferAllowAfterSeasonDeadline,
          lastTemptingOfferConflictDate: null,
          isOnTransferList: nextIsOnTransferList,
          transferListPrice: nextIsOnTransferList ? withMorale.transferListPrice : void 0
        };
      }
      if (input.isPromoted && shouldRequestPromotionRaise(withMorale, club, squadAverage, currentDate)) {
        const deadline2 = new Date(currentDate);
        deadline2.setDate(deadline2.getDate() + 21);
        const deadlineKey2 = toDateKey(deadline2);
        const raiseRequest = getPromotionRaiseRequest(withMorale, club, squadAverage);
        const playerName2 = `${withMorale.firstName} ${withMorale.lastName}`;
        const mail2 = input.createMail ? {
          id: `PLAYER_PROMOTION_RAISE_REQUEST_${withMorale.id}_${dateKey}`,
          sender: playerName2,
          role: "Zawodnik",
          subject: `Pro\u015Bba po awansie: ${withMorale.lastName}`,
          body: [
            "Trenerze,",
            "",
            "Awans do wy\u017Cszej ligi to du\u017Cy krok dla klubu i ciesz\u0119 si\u0119, \u017Ce by\u0142em cz\u0119\u015Bci\u0105 tego sezonu.",
            `Rozegra\u0142em ${raiseRequest.matches} mecz\xF3w i czuj\u0119, \u017Ce moja rola w dru\u017Cynie powinna znale\u017A\u0107 odbicie w kontrakcie po wej\u015Bciu na wy\u017Cszy poziom.`,
            "",
            `Oczekuj\u0119 podwy\u017Cki o ${raiseRequest.raisePct}%: kontraktu na ${raiseRequest.years} ${raiseRequest.years === 1 ? "rok" : "lata"}, pensji ${raiseRequest.salary.toLocaleString("pl-PL")} PLN rocznie oraz ${raiseRequest.bonus.toLocaleString("pl-PL")} PLN za podpis.`,
            "",
            `Prosz\u0119 o odpowied\u017A do ${deadline2.toLocaleDateString("pl-PL")}. Chc\u0119 dalej i\u015B\u0107 z klubem, ale po awansie potrzebuj\u0119 jasnego sygna\u0142u, \u017Ce m\xF3j wk\u0142ad jest doceniany.`,
            "",
            playerName2
          ].join("\n"),
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: withMorale.squadRole === "KEY_PLAYER" || withMorale.isUntouchable ? 6 : 5,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "RAISE",
            requestedSalary: raiseRequest.salary,
            requestedBonus: raiseRequest.bonus,
            requestedYears: raiseRequest.years,
            responseDeadline: deadlineKey2
          }
        } : null;
        return {
          player: {
            ...PlayerMoraleService.withMoraleChange(withMorale, -1, "Zawodnik oczekuje podwy\u017Cki po awansie", currentDate),
            lastMoraleDemandDate: dateKey,
            contractRaiseDemandUntil: deadlineKey2,
            contractRaiseRequest: {
              salary: raiseRequest.salary,
              bonus: raiseRequest.bonus,
              years: raiseRequest.years,
              requestedAt: dateKey,
              deadline: deadlineKey2,
              reason: raiseRequest.reason,
              raisePct: raiseRequest.raisePct
            }
          },
          mail: mail2
        };
      }
      return { player: withMorale, mail: null };
    }
    if (!input.isRelegated) return { player: withMorale, mail: null };
    const contractDaysLeft = getContractDaysLeft(withMorale, currentDate);
    const isGoodEnoughForBetterClub = withMorale.overallRating >= Math.max(62, squadAverage + 5) && (withMorale.overallRating >= 68 || withMorale.marketValue >= Math.max(4e5, (withMorale.annualSalary ?? 0) * 3) || hasStandoutSeasonOutput(withMorale, getSeasonOutputProfile(withMorale)));
    const careerStageCanMove = withMorale.age <= 32 || withMorale.overallRating >= squadAverage + 9;
    const reputationCeilingPressure = Math.max(0, (withMorale.overallRating - 58) / 5 - club.reputation);
    const personalityExitBias = personality === "EGOIST" ? 0.18 : personality === "AMBITIOUS" ? 0.14 : personality === "CONFIDENT" ? 0.08 : personality === "LOYAL" ? -0.18 : personality === "PROFESSIONAL" ? -0.06 : 0;
    const loyalty = Math.max(1, Math.min(99, Math.round(withMorale.lojalnosc ?? 50)));
    const loyaltyExitModifier = (50 - loyalty) / 49 * 0.24;
    const exitChance = Math.max(
      0.08,
      Math.min(
        0.76,
        0.16 + personalityExitBias + loyaltyExitModifier + Math.max(0, withMorale.overallRating - squadAverage) * 0.025 + Math.min(0.16, reputationCeilingPressure * 0.04) + (contractDaysLeft > 365 ? 0.06 : -0.08)
      )
    );
    const relegationReason = "Spadek dru\u017Cyny zwi\u0119ksza presj\u0119 na odej\u015Bcie";
    withMorale = PlayerMoraleService.withMoraleChange(withMorale, -4, relegationReason, currentDate);
    withMorale = PlayerMoraleService.withMindsetChange(
      withMorale,
      {
        clubHappiness: -9,
        squadBelonging: -6,
        developmentSatisfaction: -8,
        transferOpenness: isGoodEnoughForBetterClub ? 18 : 7,
        conflictLevel: isGoodEnoughForBetterClub ? 7 : 3
      },
      relegationReason,
      currentDate
    );
    if (!isGoodEnoughForBetterClub || !careerStageCanMove || withMorale.isOnTransferList || withMorale.transferPendingClubId || PlayerMoraleService.isMoraleDemandLocked(withMorale, currentDate) || roll >= exitChance) {
      return { player: withMorale, mail: null };
    }
    const deadline = new Date(currentDate);
    deadline.setDate(deadline.getDate() + 45);
    const deadlineKey = toDateKey(deadline);
    const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
    const mail = input.createMail ? {
      id: `PLAYER_RELEGATION_EXIT_REQUEST_${withMorale.id}_${dateKey}`,
      sender: playerName,
      role: "Zawodnik",
      subject: `Pro\u015Bba po spadku: ${withMorale.lastName}`,
      body: [
        "Trenerze,",
        "",
        "Po spadku dru\u017Cyny musz\u0119 uczciwie spojrze\u0107 na swoj\u0105 przysz\u0142o\u015B\u0107. Szanuj\u0119 klub, ale czuj\u0119, \u017Ce m\xF3j poziom sportowy pozwala mi dalej gra\u0107 wy\u017Cej.",
        "",
        "Nie chc\u0119 odchodzi\u0107 w konflikcie ani za wszelk\u0105 cen\u0119. Prosz\u0119 jednak, \u017Ceby klub by\u0142 gotowy rozmawia\u0107 przy odpowiedniej ofercie i nie blokowa\u0142 mi wcze\u015Bniejszego odej\u015Bcia, je\u015Bli pojawi si\u0119 rozs\u0105dna propozycja.",
        "",
        playerName
      ].join("\n"),
      date: new Date(currentDate),
      isRead: false,
      type: "STAFF" /* STAFF */,
      priority: 5,
      metadata: {
        type: "PLAYER_MORALE_REQUEST",
        playerId: withMorale.id,
        requestType: "TRANSFER_LIST",
        responseDeadline: deadlineKey
      }
    } : null;
    return {
      player: {
        ...withMorale,
        isOnTransferList: true,
        isUntouchable: false,
        transferListPrice: withMorale.transferListPrice ?? void 0,
        transferLockoutUntil: null,
        transferOfferBanUntil: null,
        lastMoraleDemandDate: dateKey,
        transferListDemandUntil: deadlineKey
      },
      mail
    };
  },
  withMoraleChange: (player, delta, reason, date) => {
    const withMorale = PlayerMoraleService.ensurePlayerState(player);
    const previousMorale = withMorale.morale ?? 50;
    const rawNextMorale = PlayerMoraleService.clamp(previousMorale + delta);
    const nextMorale = hasBrokenContractPromise(withMorale) ? Math.min(rawNextMorale, 59) : rawNextMorale;
    if (delta === 0 || nextMorale === previousMorale) return withMorale;
    const entry = {
      id: `MORALE_${withMorale.id}_${date.getTime()}_${Math.abs(delta)}_${stableHash(reason)}`,
      date: toDateKey(date),
      delta: nextMorale - previousMorale,
      reason,
      moraleAfter: nextMorale
    };
    const withUpdatedMindset = PlayerMoraleService.withMindsetChange(
      withMorale,
      PlayerMoraleService.inferMindsetDelta(reason, nextMorale - previousMorale),
      reason,
      date
    );
    return PlayerFormService.withUpdatedForm({
      ...withMorale,
      playerMindset: withUpdatedMindset.playerMindset,
      morale: nextMorale,
      moraleHistory: compactMoraleHistory([entry, ...withMorale.moraleHistory ?? []])
    });
  },
  getInfo: (morale = 50) => {
    if (morale <= 19) {
      return { label: "Bardzo s\u0142abe", colorClass: "text-red-500", barClass: "bg-red-500", description: "Zawodnik gra spi\u0119ty i \u0142atwiej traci pewno\u015B\u0107 po b\u0142\u0119dzie." };
    }
    if (morale <= 39) {
      return { label: "S\u0142abe", colorClass: "text-orange-400", barClass: "bg-orange-500", description: "Potrzebuje dobrego wyst\u0119pu albo rozmowy, \u017Ceby wr\xF3ci\u0107 do rytmu." };
    }
    if (morale <= 59) {
      return { label: "Normalne", colorClass: "text-slate-200", barClass: "bg-slate-400", description: "Stabilne nastawienie bez wyra\u017Anych odchyle\u0144." };
    }
    if (morale <= 79) {
      return { label: "Wysokie", colorClass: "text-emerald-400", barClass: "bg-emerald-500", description: "Zawodnik jest pewniejszy w decyzjach i aktywniejszy w meczu." };
    }
    return { label: "Bardzo wysokie", colorClass: "text-yellow-400", barClass: "bg-yellow-400", description: "Zawodnik jest w \u015Bwietnym nastawieniu i mo\u017Ce gra\u0107 powy\u017Cej bazowej oceny." };
  },
  getPersonalityLabel: (personality = "CALM") => {
    const labels = {
      PROFESSIONAL: "Profesjonalista",
      AMBITIOUS: "Ambitny",
      SENSITIVE: "Wra\u017Cliwy",
      CONFIDENT: "Pewny siebie",
      NERVOUS: "Nerwowy",
      LOYAL: "Lojalny",
      EGOIST: "Egoista",
      CALM: "Spokojny"
    };
    return labels[personality];
  },
  canTalk: (player, currentDate) => {
    if (!player.lastIndividualTalkDate) return true;
    const last = new Date(player.lastIndividualTalkDate);
    if (Number.isNaN(last.getTime())) return true;
    return dayDiff(last, currentDate) >= 7;
  },
  getNextTalkDate: (player) => {
    if (!player.lastIndividualTalkDate) return null;
    const last = new Date(player.lastIndividualTalkDate);
    if (Number.isNaN(last.getTime())) return null;
    const next = new Date(last);
    next.setDate(next.getDate() + 7);
    return next;
  },
  calculateTalkResult: (player, talkType, currentDate, seed) => {
    const personality = player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player);
    const morale = player.morale ?? PlayerMoraleService.getInitialMorale(player);
    const recentRating = player.stats.ratingHistory?.at(-1) ?? 6.5;
    const rng = seededRng(seed + stableHash(player.id) + currentDate.getTime(), talkType.length);
    let base = 3;
    let successChance = 0.58;
    if (talkType === "PRAISE") {
      base = recentRating >= 7.2 ? 7 : 3;
      successChance = recentRating >= 7.2 ? 0.78 : 0.45;
      if (personality === "CONFIDENT" || personality === "EGOIST") successChance += 0.08;
    }
    if (talkType === "MOTIVATE") {
      base = 5;
      if (personality === "AMBITIOUS" || personality === "CONFIDENT") successChance += 0.12;
      if (personality === "CALM") successChance += 0.04;
    }
    if (talkType === "SUPPORT") {
      base = morale < 45 ? 7 : 4;
      successChance = 0.7;
      if (personality === "SENSITIVE" || personality === "NERVOUS") successChance += 0.12;
      if (personality === "EGOIST") successChance -= 0.08;
    }
    if (talkType === "CRITICIZE") {
      base = recentRating < 6.3 ? 6 : 2;
      successChance = recentRating < 6.3 ? 0.52 : 0.34;
      if (personality === "PROFESSIONAL" || personality === "AMBITIOUS") successChance += 0.18;
      if (personality === "SENSITIVE" || personality === "NERVOUS") successChance -= 0.22;
      if (personality === "EGOIST") successChance -= 0.15;
    }
    if (talkType === "PROMISE_MINUTES") {
      base = player.squadRole === "KEY_PLAYER" ? 2 : 6;
      successChance = 0.68;
      if (personality === "AMBITIOUS" || personality === "EGOIST") successChance += 0.08;
      if (personality === "LOYAL") successChance -= 0.05;
    }
    if (talkType === "PROMISE_ONE_TIME_BONUS") {
      base = 1;
      successChance = 0.72;
      if (personality === "LOYAL" || personality === "PROFESSIONAL") successChance += 0.08;
      if (personality === "EGOIST" || personality === "AMBITIOUS") successChance -= 0.08;
    }
    if (talkType === "DEMAND_WORK") {
      base = 4;
      successChance = 0.5;
      if (personality === "PROFESSIONAL" || personality === "AMBITIOUS") successChance += 0.18;
      if (personality === "SENSITIVE") successChance -= 0.16;
    }
    successChance = Math.max(0.12, Math.min(0.88, successChance));
    const isPositive = rng < successChance;
    const swing = 1 + Math.floor(seededRng(seed, talkType.charCodeAt(0)) * 3);
    const backfireRisk = 0.22 + (talkType === "CRITICIZE" || talkType === "DEMAND_WORK" ? 0.18 : 0) + (talkType === "PROMISE_MINUTES" ? 0.1 : 0) + (personality === "SENSITIVE" || personality === "NERVOUS" ? 0.18 : 0) + (personality === "EGOIST" ? 0.1 : 0);
    const backfireRoll = seededRng(seed + stableHash(player.id), talkType.charCodeAt(0) + 31);
    const severeBackfire = !isPositive && backfireRoll < Math.min(0.72, backfireRisk);
    const negativeDrop = 10 + base + swing * 3 + (severeBackfire ? 16 + Math.round(morale * 0.12) : 0);
    const rawMoraleDelta = isPositive ? base + swing : -negativeDrop;
    const rawNewMorale = PlayerMoraleService.clamp(morale + rawMoraleDelta);
    const newMorale = !isPositive && talkType === "CRITICIZE" ? Math.min(rawNewMorale, 39) : rawNewMorale;
    const moraleDelta = newMorale - morale;
    const reactionText = getPlayerTalkResponse(talkType, isPositive);
    return { moraleDelta, newMorale, isPositive, reactionText };
  },
  applyTrainingMood: (player, intensity) => {
    const personality = player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player);
    const fatigue = player.fatigueDebt ?? 0;
    let delta = 0;
    if (intensity === "HEAVY" /* HEAVY */) {
      delta = personality === "PROFESSIONAL" || personality === "AMBITIOUS" ? 1 : -1;
      if (fatigue > 45) delta -= 2;
      if (player.condition < 65) delta -= 1;
    } else if (intensity === "LIGHT" /* LIGHT */) {
      delta = fatigue > 35 || player.condition < 70 ? 2 : 0;
      if (personality === "AMBITIOUS" && fatigue < 20) delta -= 1;
    }
    return delta;
  },
  getMatchMultiplier: (player) => {
    const morale = player.morale ?? 50;
    if (morale <= 19) return 0.95;
    if (morale <= 39) return 0.98;
    if (morale <= 59) return 1;
    if (morale <= 79) return 1.015;
    return 1.03;
  },
  getMatchContributionMultiplier: (player) => {
    const morale = player.morale ?? 50;
    if (morale <= 19) return 0.78;
    if (morale <= 39) return 0.9;
    if (morale <= 59) return 1;
    if (morale <= 79) return 1.06;
    return 1.12;
  },
  getLineupReadinessMultiplier: (player) => {
    const morale = player.morale ?? 50;
    if (morale <= 19) return 0.8;
    if (morale <= 39) return 0.92;
    if (morale <= 59) return 1;
    if (morale <= 79) return 1.06;
    return 1.12;
  },
  getEffectiveOverall: (player) => Math.round(player.overallRating * PlayerMoraleService.getLineupReadinessMultiplier(player)),
  applyNaturalDrift: (player) => {
    const morale = player.morale ?? PlayerMoraleService.getInitialMorale(player);
    const drift = morale > 60 ? -1 : morale < 40 ? 1 : 0;
    return { ...player, morale: PlayerMoraleService.clamp(morale + drift) };
  },
  getMindsetMoraleFeedback: (player) => {
    const mindset = PlayerMoraleService.normalizeMindset(player);
    const morale = player.morale ?? 50;
    const low = (value, threshold, weight) => Math.max(0, threshold - value) * weight;
    const high = (value, threshold, weight) => Math.max(0, value - threshold) * weight;
    const pressure = low(mindset.coachTrust, 45, 0.05) + low(mindset.clubHappiness, 42, 0.04) + low(mindset.roleClarity, 40, 0.035) + low(mindset.playingTimeSatisfaction, 42, 0.045) + low(mindset.developmentSatisfaction, 42, 0.035) + high(mindset.transferOpenness, 60, 0.04) + high(mindset.conflictLevel, 55, 0.06);
    const comfort = high(mindset.coachTrust, 70, 0.035) + high(mindset.clubHappiness, 68, 0.04) + high(mindset.roleClarity, 65, 0.025) + high(mindset.playingTimeSatisfaction, 65, 0.03) + high(mindset.developmentSatisfaction, 68, 0.03) + low(mindset.transferOpenness, 35, 0.025) + low(mindset.conflictLevel, 30, 0.035);
    const personality = player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player);
    const negativePersonalityMod = personality === "SENSITIVE" || personality === "NERVOUS" ? 1.18 : personality === "EGOIST" || personality === "AMBITIOUS" ? 1.1 : personality === "PROFESSIONAL" || personality === "LOYAL" ? 0.86 : 1;
    const positivePersonalityMod = personality === "PROFESSIONAL" || personality === "LOYAL" || personality === "CALM" ? 1.12 : personality === "EGOIST" ? 0.88 : 1;
    const raw = comfort * positivePersonalityMod - pressure * negativePersonalityMod;
    const damped = raw > 0 && morale >= 80 ? raw * 0.6 : raw < 0 && morale <= 19 ? raw * 0.7 : raw;
    const delta = damped >= 2.2 ? 2 : damped >= 1.05 ? 1 : damped <= -3.2 ? -3 : damped <= -2 ? -2 : damped <= -0.9 ? -1 : 0;
    if (delta === 0) return null;
    return {
      delta,
      reason: delta > 0 ? "Pozytywny mindset stabilizuje morale" : "Negatywny mindset obni\u017Ca morale"
    };
  },
  getTotalMinutesPlayed: (player) => (player.stats?.minutesPlayed ?? 0) + (player.reserveStats?.matches ?? 0) * 90,
  reviewMinutePromise: (player, currentDate) => {
    const withMorale = PlayerMoraleService.ensurePlayerState(player);
    if (!withMorale.promisedMinutesUntil) {
      return { player: withMorale, fulfilled: false, expired: false, moraleDelta: 0 };
    }
    const baseline = withMorale.promisedMinutesBaseline ?? PlayerMoraleService.getTotalMinutesPlayed(withMorale);
    const currentMinutes = PlayerMoraleService.getTotalMinutesPlayed(withMorale);
    const deadline = new Date(withMorale.promisedMinutesUntil);
    const fulfilled = currentMinutes > baseline;
    const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
    if (fulfilled) {
      const moraleDelta = 3;
      return {
        player: {
          ...withMorale,
          ...PlayerMoraleService.withMoraleChange(withMorale, moraleDelta, "Obietnica minut spe\u0142niona", currentDate),
          promisedMinutesUntil: null,
          promisedMinutesBaseline: null,
          promisedRoleNextMatchFixtureId: null
        },
        fulfilled: true,
        expired: false,
        moraleDelta
      };
    }
    if (expired && !isAvailableForMinutesDemand(withMorale)) {
      return {
        player: {
          ...withMorale,
          promisedMinutesUntil: null,
          promisedMinutesBaseline: null,
          promisedRoleNextMatchFixtureId: null
        },
        fulfilled: false,
        expired: true,
        moraleDelta: 0
      };
    }
    if (expired) {
      const personality = withMorale.moralePersonality ?? "CALM";
      const isRoleNextMatchPromise = !!withMorale.promisedRoleNextMatchFixtureId;
      const moraleDelta = isRoleNextMatchPromise ? personality === "LOYAL" || personality === "CALM" ? -8 : personality === "AMBITIOUS" || personality === "EGOIST" ? -16 : -12 : personality === "LOYAL" || personality === "CALM" ? -6 : personality === "AMBITIOUS" || personality === "EGOIST" ? -12 : -9;
      return {
        player: {
          ...withMorale,
          ...PlayerMoraleService.withMoraleChange(
            withMorale,
            moraleDelta,
            isRoleNextMatchPromise ? "Niespe\u0142niona obietnica gry w nast\u0119pnym meczu" : "Niespe\u0142niona obietnica minut",
            currentDate
          ),
          promisedMinutesUntil: null,
          promisedMinutesBaseline: null,
          promisedRoleNextMatchFixtureId: null
        },
        fulfilled: false,
        expired: true,
        moraleDelta
      };
    }
    return { player: withMorale, fulfilled: false, expired: false, moraleDelta: 0 };
  },
  processPeriodicReview: (players, currentDate) => {
    const reviewedPlayers = players.map((player) => {
      const demandReview = PlayerMoraleService.reviewPlayerDemands(player, currentDate);
      const promiseReview = PlayerMoraleService.reviewMinutePromise(demandReview, currentDate);
      const mindsetFeedback = currentDate.getDay() === 1 ? PlayerMoraleService.getMindsetMoraleFeedback(promiseReview.player) : null;
      const afterMindsetFeedback = mindsetFeedback ? PlayerMoraleService.withMoraleChange(promiseReview.player, mindsetFeedback.delta, mindsetFeedback.reason, currentDate) : promiseReview.player;
      const drifted = PlayerMoraleService.applyNaturalDrift(afterMindsetFeedback);
      if ((drifted.morale ?? 50) !== (afterMindsetFeedback.morale ?? 50)) {
        return PlayerMoraleService.withMoraleChange(afterMindsetFeedback, (drifted.morale ?? 50) - (afterMindsetFeedback.morale ?? 50), "Naturalna stabilizacja morale", currentDate);
      }
      return drifted;
    });
    const teamMoraleEvents = reviewedPlayers.filter((player) => (player.contractRaiseTeamMoraleDelta ?? 0) < 0).map((player) => ({
      playerId: player.id,
      delta: player.contractRaiseTeamMoraleDelta ?? 0,
      reason: player.contractRaiseTeamMoraleReason ?? "Napi\u0119cie w szatni po odrzuconej podwy\u017Cce lidera"
    }));
    if (teamMoraleEvents.length === 0) return reviewedPlayers;
    return reviewedPlayers.map((player) => {
      let nextPlayer = player;
      for (const event of teamMoraleEvents) {
        if (event.playerId === nextPlayer.id) continue;
        nextPlayer = PlayerMoraleService.withMoraleChange(nextPlayer, event.delta, event.reason, currentDate);
      }
      if ((nextPlayer.contractRaiseTeamMoraleDelta ?? 0) < 0) {
        return {
          ...nextPlayer,
          contractRaiseTeamMoraleDelta: null,
          contractRaiseTeamMoraleReason: null
        };
      }
      return nextPlayer;
    });
  },
  processReserveProtestReviews: (players, currentDate, existingMessages = []) => {
    const mails = [];
    const dateKey = toDateKey(currentDate);
    const transferDeadline = new Date(currentDate);
    transferDeadline.setDate(transferDeadline.getDate() + 14);
    const transferDeadlineKey = toDateKey(transferDeadline);
    const reviewedPlayers = players.map((player) => {
      let withMorale = PlayerMoraleService.ensurePlayerState(player);
      if (!withMorale.reserveProtestUntil) return withMorale;
      const protestDeadline = new Date(withMorale.reserveProtestUntil);
      const expired = !Number.isNaN(protestDeadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(protestDeadline).getTime();
      if (withMorale.isOnTransferList) {
        return {
          ...PlayerMoraleService.withMoraleChange(
            withMorale,
            4,
            "Trener otworzy\u0142 drog\u0119 do transferu po prote\u015Bcie rezerw",
            currentDate
          ),
          reserveProtestUntil: null
        };
      }
      if (!expired) return withMorale;
      const contractDaysLeft = getContractDaysLeft(withMorale, currentDate);
      if (contractDaysLeft <= 365) {
        return { ...withMorale, reserveProtestUntil: null };
      }
      const personality = withMorale.moralePersonality ?? "CALM";
      const penalty = personality === "EGOIST" || personality === "AMBITIOUS" ? -14 : personality === "CONFIDENT" || personality === "NERVOUS" ? -11 : personality === "LOYAL" || personality === "PROFESSIONAL" ? -7 : -9;
      withMorale = PlayerMoraleService.withMoraleChange(
        withMorale,
        penalty,
        "Zignorowany protest po zes\u0142aniu do rezerw",
        currentDate
      );
      if (PlayerMoraleService.isMoraleDemandLocked(withMorale, currentDate)) {
        return {
          ...withMorale,
          reserveProtestUntil: null,
          lastMoraleDemandDate: dateKey
        };
      }
      const mailId = `PLAYER_RESERVE_PROTEST_ESCALATION_${withMorale.id}_${dateKey}`;
      const hasDuplicateMail = existingMessages.some((mail) => mail.id === mailId) || mails.some((mail) => mail.id === mailId);
      if (!hasDuplicateMail) {
        const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
        mails.push({
          id: mailId,
          sender: playerName,
          role: "Zawodnik",
          subject: `\u017B\u0105danie po braku reakcji: ${withMorale.lastName}`,
          body: [
            "Trenerze,",
            "",
            "Nie dosta\u0142em jasnej odpowiedzi po przesuni\u0119ciu mnie do rezerw. Odbieram to jako sygna\u0142, \u017Ce klub nie widzi mnie ju\u017C realnie w pierwszym zespole.",
            "",
            "W tej sytuacji prosz\u0119 o wystawienie mnie na list\u0119 transferow\u0105. Chc\u0119 mie\u0107 mo\u017Cliwo\u015B\u0107 znalezienia klubu, w kt\xF3rym b\u0119d\u0119 traktowany zgodnie z moim poziomem sportowym.",
            "",
            `Prosz\u0119 o decyzj\u0119 do ${transferDeadline.toLocaleDateString("pl-PL")}.`,
            "",
            playerName
          ].join("\n"),
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: 5,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "TRANSFER_LIST",
            responseDeadline: transferDeadlineKey
          }
        });
      }
      return {
        ...withMorale,
        reserveProtestUntil: null,
        transferListDemandUntil: withMorale.transferListDemandUntil ?? transferDeadlineKey,
        lastMoraleDemandDate: dateKey
      };
    });
    return { players: reviewedPlayers, mails };
  },
  processPlayerDemands: (club, squad, currentDate, existingMessages = [], fixtures, allClubs = []) => {
    if (squad.length === 0 || club.stats.played < 4 || currentDate.getDay() !== 1) {
      return { players: squad.map(PlayerMoraleService.ensurePlayerState), mails: [] };
    }
    const dateKey = toDateKey(currentDate);
    const deadline = new Date(currentDate);
    deadline.setDate(deadline.getDate() + 14);
    const deadlineKey = toDateKey(deadline);
    const sortedByQuality = [...squad].sort((a, b) => b.overallRating - a.overallRating);
    const squadAverage = squad.reduce((sum, player) => sum + player.overallRating, 0) / squad.length;
    const rankById = new Map(sortedByQuality.map((player, index) => [player.id, index + 1]));
    const byPosition = /* @__PURE__ */ new Map();
    squad.forEach((player) => {
      byPosition.set(player.position, [...byPosition.get(player.position) ?? [], player]);
    });
    byPosition.forEach((playersForPosition, position) => {
      byPosition.set(position, [...playersForPosition].sort((a, b) => b.overallRating - a.overallRating));
    });
    const hasRecentMail = (player, requestType) => existingMessages.some(
      (mail) => mail.metadata?.type === "PLAYER_MORALE_REQUEST" && mail.metadata.playerId === player.id && mail.metadata.requestType === requestType && new Date(mail.date).getTime() >= currentDate.getTime() - 21 * DAY_MS
    );
    const nextLeagueFixtureDuringDemandWindow = (fixtures ?? []).filter(
      (f) => f.status === "SCHEDULED" /* SCHEDULED */ && f.leagueId === club.leagueId && (f.homeTeamId === club.id || f.awayTeamId === club.id) && f.date.getTime() >= currentDate.getTime() && f.date.getTime() <= deadline.getTime()
    ).sort((a, b) => fDate(a).getTime() - fDate(b).getTime())[0] ?? null;
    const hasLeagueFixtureDuringDemandWindow = !!nextLeagueFixtureDuringDemandWindow;
    function fDate(fixture) {
      return fixture.date instanceof Date ? fixture.date : new Date(fixture.date);
    }
    const createdMails = [];
    const nextPlayers = squad.map((player) => {
      let withMorale = PlayerMoraleService.ensurePlayerState(player);
      const rank = rankById.get(player.id) ?? squad.length;
      const positionRank = (byPosition.get(player.position) ?? []).findIndex((posPlayer) => posPlayer.id === player.id) + 1 || 99;
      const totalMinutes = PlayerMoraleService.getTotalMinutesPlayed(withMorale);
      const possibleMinutes = Math.max(1, club.stats.played * 90);
      const minutesShare = totalMinutes / possibleMinutes;
      const personality = withMorale.moralePersonality ?? "CALM";
      const lastDemand = withMorale.lastMoraleDemandDate ? new Date(withMorale.lastMoraleDemandDate) : null;
      const demandCooldown = lastDemand && !Number.isNaN(lastDemand.getTime()) && dayDiff(lastDemand, currentDate) < 21;
      const isDemandLockedAfterContract = PlayerMoraleService.isMoraleDemandLocked(withMorale, currentDate);
      const hasActiveDemand = PlayerMoraleService.hasActiveMoraleDemand(withMorale);
      const isHealthyEnough = withMorale.health.status === "HEALTHY" /* HEALTHY */ || (withMorale.health.injury?.daysRemaining ?? 0) <= 3;
      const hasSportingArgument = withMorale.overallRating >= squadAverage - 1 && (rank <= Math.max(8, Math.ceil(squad.length * 0.35)) || positionRank <= 2);
      const pressureBonus = personality === "AMBITIOUS" || personality === "EGOIST" || personality === "CONFIDENT" ? 1 : 0;
      const ignoresStatusNoise = personality === "LOYAL" || personality === "CALM" || personality === "PROFESSIONAL";
      const contractDaysLeft = getContractDaysLeft(withMorale, currentDate);
      const isContractEndingSoon = contractDaysLeft <= 365;
      const fairSalary = FinanceService.getFairMarketSalary(withMorale.overallRating);
      const financialRespectRatio = (withMorale.annualSalary || 0) / Math.max(1, fairSalary);
      const salaryUnderpaid = financialRespectRatio < 0.86 || rank <= 5 && financialRespectRatio < 1.02;
      const contractRaiseRequest = buildRaiseRequest(withMorale, club, squadAverage, rank);
      const reminderDate = withMorale.contractRaiseReminderUntil ? new Date(withMorale.contractRaiseReminderUntil) : null;
      const raiseReminderCooldown = reminderDate && !Number.isNaN(reminderDate.getTime()) && dateOnly(currentDate).getTime() < dateOnly(reminderDate).getTime();
      const roleExpectation = rank <= 3 || positionRank === 1 && withMorale.overallRating >= squadAverage + 3 ? "KEY_PLAYER" : rank <= 8 || positionRank <= 2 ? "STARTER" : null;
      const shouldRequestRole = !!roleExpectation && !isSameOrHigherRole(withMorale.squadRole, roleExpectation) && hasSportingArgument && isHealthyEnough && !demandCooldown && !isDemandLockedAfterContract && !hasActiveDemand && !withMorale.transferPendingClubId && hasLeagueFixtureDuringDemandWindow && !hasRecentMail(withMorale, "ROLE") && (withMorale.morale ?? 50) <= (ignoresStatusNoise ? 34 : 48 + pressureBonus * 6);
      const expectedShare = withMorale.squadRole === "KEY_PLAYER" || roleExpectation === "KEY_PLAYER" ? 0.68 : withMorale.squadRole === "STARTER" || roleExpectation === "STARTER" ? 0.48 : 0.35;
      const minutesMindset = getMinutesDemandMindset(personality);
      const recentRatings = (withMorale.stats.ratingHistory ?? []).slice(-3);
      const recentAverageRating = recentRatings.length > 0 ? recentRatings.reduce((sum, rating) => sum + rating, 0) / recentRatings.length : null;
      const formArgument = recentAverageRating === null ? 0 : recentAverageRating >= 7.2 ? 12 : recentAverageRating >= 6.8 ? 7 : recentAverageRating < 6.2 ? -8 : 0;
      const positionOpportunity = positionRank === 1 ? 20 : positionRank === 2 ? 12 : positionRank === 3 ? 3 : -10;
      const squadOpportunity = rank <= 3 ? 14 : rank <= 8 ? 8 : rank <= Math.ceil(squad.length * 0.5) ? 2 : -8;
      const roleConfidence = withMorale.squadRole === "KEY_PLAYER" ? 12 : withMorale.squadRole === "STARTER" ? 7 : 0;
      const moraleUrgency = (withMorale.morale ?? 50) <= 25 ? 14 : (withMorale.morale ?? 50) <= 40 ? 8 : (withMorale.morale ?? 50) <= 55 ? 3 : 0;
      const perceivedReadiness = 38 + Math.round((withMorale.overallRating - squadAverage) * 3) + positionOpportunity + squadOpportunity + roleConfidence + formArgument + moraleUrgency + minutesMindset.selfBeliefBias;
      const minutesGap = expectedShare - minutesShare;
      const hasPerceivedSportingArgument = hasSportingArgument || (minutesMindset.approach === "ASSERTIVE" || minutesMindset.approach === "BRAZEN") && withMorale.overallRating >= squadAverage - 4 && positionRank <= 3;
      const shouldRequestMinutes = hasPerceivedSportingArgument && isAvailableForMinutesDemand(withMorale) && !demandCooldown && !isDemandLockedAfterContract && !hasActiveDemand && !withMorale.transferPendingClubId && hasLeagueFixtureDuringDemandWindow && !withMorale.minutesDemandUntil && !hasRecentMail(withMorale, "MINUTES") && minutesGap >= minutesMindset.minimumMinutesGap && perceivedReadiness >= minutesMindset.readinessThreshold;
      const shouldRequestDevelopmentExit = !!withMorale.unresolvedMinutesDemandDate && isAvailableForMinutesDemand(withMorale) && !demandCooldown && !isDemandLockedAfterContract && !hasActiveDemand && !withMorale.isOnTransferList && !withMorale.isAvailableForLoan && !withMorale.loan && !withMorale.transferPendingClubId && !withMorale.developmentExitDemandUntil && !hasRecentMail(withMorale, "DEVELOPMENT_EXIT") && (totalMinutes <= (withMorale.unresolvedMinutesDemandBaseline ?? totalMinutes) || minutesShare < Math.max(0.12, expectedShare * 0.45));
      const shouldRequestRaise = isHealthyEnough && hasSportingArgument && salaryUnderpaid && rank <= Math.max(8, Math.ceil(squad.length * 0.32)) && !demandCooldown && !isDemandLockedAfterContract && !hasActiveDemand && !raiseReminderCooldown && !withMorale.transferPendingClubId && !withMorale.contractRaiseDemandUntil && !withMorale.contractRaiseRequest && !hasRecentMail(withMorale, "RAISE") && contractRaiseRequest.salary >= (withMorale.annualSalary || 0) * 1.12 && ((withMorale.morale ?? 50) <= 62 || recentAverageRating !== null && recentAverageRating >= 6.95 || rank <= 4 || withMorale.squadRole === "KEY_PLAYER");
      const prominentRoleWithoutMinutes = (withMorale.squadRole === "KEY_PLAYER" || withMorale.squadRole === "STARTER") && isAvailableForMinutesDemand(withMorale) && !demandCooldown && !isDemandLockedAfterContract && !hasActiveDemand && !withMorale.transferPendingClubId && hasLeagueFixtureDuringDemandWindow && !hasRecentMail(withMorale, "ROLE_PLAYTIME") && totalMinutes === 0;
      const isClearlyAboveSquadLevel = withMorale.overallRating >= squadAverage + 7 && rank <= Math.max(3, Math.ceil(squad.length * 0.12));
      const transferAmbitionBias = personality === "EGOIST" ? 12 : personality === "AMBITIOUS" ? 9 : personality === "CONFIDENT" ? 6 : personality === "PROFESSIONAL" ? -2 : personality === "LOYAL" ? -9 : personality === "CALM" ? -6 : -3;
      const ageTransferStabilityBias = getAgeTransferStabilityBias(withMorale);
      const eliteLatePrimeMoveBoost = withMorale.age >= 26 && withMorale.overallRating >= 85 && club.reputation < 16 ? 7 : 0;
      const transferMoodPressure = (withMorale.morale ?? 50) <= 24 ? 12 : (withMorale.morale ?? 50) <= 39 ? 7 : (withMorale.morale ?? 50) <= 54 ? 3 : 0;
      const transferRandomFactor = Math.floor(seededRng(stableHash(`${withMorale.id}_${dateKey}`), 43) * 13) - 6;
      const hasExcellentForm = recentAverageRating !== null && recentAverageRating >= 7;
      const seasonOutput = getSeasonOutputProfile(withMorale);
      const hasStandoutSeason = hasStandoutSeasonOutput(withMorale, seasonOutput);
      const interestedClubs = (withMorale.interestedClubs ?? []).map((clubId) => allClubs.find((candidateClub) => candidateClub.id === clubId)).filter((candidateClub) => !!candidateClub && candidateClub.id !== club.id);
      const highestInterestedClubReputation = interestedClubs.reduce(
        (maxReputation, interestedClub) => Math.max(maxReputation, interestedClub.reputation),
        0
      );
      const highReputationInterestDelta = highestInterestedClubReputation - club.reputation;
      const hasHighReputationInterest = highReputationInterestDelta >= 3;
      const hasCareerStepUpside = hasRealisticCareerStepUpside(withMorale, personality, hasHighReputationInterest);
      const reputationStepUpPressure = Math.max(0, 12 - club.reputation) * 2;
      const wantsHigherReputationMove = hasCareerStepUpside && isClearlyAboveSquadLevel && hasExcellentForm && club.reputation < 12 && reputationStepUpPressure + transferAmbitionBias + ageTransferStabilityBias + eliteLatePrimeMoveBoost + transferRandomFactor >= 13;
      const wantsBreakoutSeasonMove = hasCareerStepUpside && hasStandoutSeason && club.reputation < 14 && (withMorale.overallRating >= squadAverage + 2 || rank <= Math.max(8, Math.ceil(squad.length * 0.35))) && reputationStepUpPressure + transferAmbitionBias + ageTransferStabilityBias + eliteLatePrimeMoveBoost + transferRandomFactor + (hasHighReputationInterest ? 9 : 0) >= 10;
      const wantsHighReputationInterestMove = hasHighReputationInterest && (isClearlyAboveSquadLevel || hasStandoutSeason || withMorale.overallRating >= squadAverage + 3) && highReputationInterestDelta * 3 + transferAmbitionBias + ageTransferStabilityBias + eliteLatePrimeMoveBoost + transferRandomFactor >= (personality === "LOYAL" ? 13 : 9);
      const protectedExitPressure = Math.round((withMorale.overallRating - squadAverage) * 2) + (rank <= 3 ? 10 : 4) + reputationStepUpPressure + transferAmbitionBias + ageTransferStabilityBias + eliteLatePrimeMoveBoost + transferMoodPressure + transferRandomFactor;
      const wantsProtectedExitConversation = !!withMorale.isUntouchable && protectedExitPressure >= 22;
      const boardSupportsProtectedExit = wantsProtectedExitConversation && (wantsHigherReputationMove || wantsBreakoutSeasonMove || wantsHighReputationInterestMove) && shouldBoardSupportProtectedExit(withMorale, club, squadAverage, transferRandomFactor);
      const protectedExitPrice = boardSupportsProtectedExit ? estimateProtectedExitPrice(withMorale, club, squadAverage) : void 0;
      const transferListMoraleThreshold = personality === "LOYAL" ? 28 : personality === "PROFESSIONAL" ? 34 : 44 + pressureBonus * 6;
      const wantsExitBecauseUnhappy = (withMorale.morale ?? 50) <= transferListMoraleThreshold && (personality !== "LOYAL" || (withMorale.morale ?? 50) <= 24 || transferMoodPressure + transferRandomFactor >= 10);
      const shouldRequestTransferList = (isClearlyAboveSquadLevel || wantsExitBecauseUnhappy || wantsBreakoutSeasonMove || wantsHighReputationInterestMove) && isHealthyEnough && !demandCooldown && !isDemandLockedAfterContract && !hasActiveDemand && !isContractEndingSoon && !withMorale.isOnTransferList && !withMorale.transferPendingClubId && !withMorale.transferListDemandUntil && !hasRecentMail(withMorale, "TRANSFER_LIST") && (wantsProtectedExitConversation || wantsHigherReputationMove || wantsBreakoutSeasonMove || wantsHighReputationInterestMove || wantsExitBecauseUnhappy);
      if (createdMails.length >= 2) return withMorale;
      if (prominentRoleWithoutMinutes) {
        const mailId = `PLAYER_ROLE_PLAYTIME_REQUEST_${withMorale.id}_${dateKey}`;
        const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
        const currentRoleLabel = roleLabel(withMorale.squadRole);
        createdMails.push({
          id: mailId,
          sender: playerName,
          role: "Zawodnik",
          subject: `ZAWODNIK ${playerName} prosi o rozmow\u0119 w sprawie jego roli w zespole`,
          body: [
            "Trenerze,",
            "",
            `Chcia\u0142bym porozmawia\u0107 o mojej roli w zespole. Jestem oznaczony jako ${currentRoleLabel}, jestem zdrowy i gotowy do gry, ale mimo to nie dostaj\u0119 minut.`,
            "",
            "Potrzebuj\u0119 jasnej informacji, czy nadal widzi mnie Pan w tej roli. Chc\u0119 gra\u0107 wi\u0119cej i pokaza\u0107 na boisku, \u017Ce mog\u0119 pom\xF3c dru\u017Cynie.",
            "",
            "Nie chc\u0119 robi\u0107 konfliktu, ale ta sytuacja zaczyna wp\u0142ywa\u0107 na moje nastawienie.",
            "",
            playerName
          ].join("\n"),
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: withMorale.squadRole === "KEY_PLAYER" ? 5 : 4,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "ROLE_PLAYTIME",
            requestedRole: withMorale.squadRole,
            nextFixtureId: nextLeagueFixtureDuringDemandWindow?.id,
            responseDeadline: deadlineKey
          }
        });
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, -2, "Wa\u017Cny zawodnik prosi o rozmow\u0119 po braku minut", currentDate);
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          minutesDemandUntil: deadlineKey,
          minutesDemandBaseline: totalMinutes
        };
      }
      if (shouldRequestDevelopmentExit) {
        const mailId = `PLAYER_DEVELOPMENT_EXIT_REQUEST_${withMorale.id}_${dateKey}`;
        const demandCopy = getDevelopmentExitDemandCopy(withMorale, personality, totalMinutes);
        createdMails.push({
          id: mailId,
          sender: `${withMorale.firstName} ${withMorale.lastName}`,
          role: "Zawodnik",
          subject: demandCopy.subject,
          body: demandCopy.body,
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: demandCopy.priority,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "DEVELOPMENT_EXIT",
            responseDeadline: deadlineKey
          }
        });
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, demandCopy.moraleDrop, "Brak minut eskaluje do pro\u015Bby o odej\u015Bcie lub wypo\u017Cyczenie", currentDate);
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          unresolvedMinutesDemandDate: null,
          unresolvedMinutesDemandBaseline: null,
          developmentExitDemandUntil: deadlineKey,
          developmentExitDemandBaseline: totalMinutes
        };
      }
      if (shouldRequestRaise) {
        const mailId = `PLAYER_RAISE_REQUEST_${withMorale.id}_${dateKey}`;
        const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
        createdMails.push({
          id: mailId,
          sender: playerName,
          role: "Zawodnik",
          subject: `Pro\u015Bba o podwy\u017Ck\u0119: ${withMorale.lastName}`,
          body: [
            "Trenerze,",
            "",
            "Chcia\u0142bym porozmawia\u0107 o nowym kontrakcie. Moja pozycja w dru\u017Cynie i obecna forma daj\u0105 mi podstawy, \u017Ceby oczekiwa\u0107 lepszych warunk\xF3w.",
            "",
            `Oczekuj\u0119 kontraktu na ${contractRaiseRequest.years} ${contractRaiseRequest.years === 1 ? "rok" : "lata"}: pensja ${contractRaiseRequest.salary.toLocaleString("pl-PL")} PLN rocznie oraz ${contractRaiseRequest.bonus.toLocaleString("pl-PL")} PLN za podpis.`,
            "",
            `Prosz\u0119 o odpowied\u017A do ${deadline.toLocaleDateString("pl-PL")}. Je\u015Bli klub nie widzi tematu teraz, b\u0119d\u0119 musia\u0142 przemy\u015Ble\u0107 swoje nastawienie i przysz\u0142o\u015B\u0107.`,
            "",
            playerName
          ].join("\n"),
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: rank <= 5 ? 5 : 4,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "RAISE",
            requestedSalary: contractRaiseRequest.salary,
            requestedBonus: contractRaiseRequest.bonus,
            requestedYears: contractRaiseRequest.years,
            responseDeadline: deadlineKey
          }
        });
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, -1, "Zawodnik oczekuje podwy\u017Cki", currentDate);
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          contractRaiseDemandUntil: deadlineKey,
          contractRaiseRequest: {
            ...contractRaiseRequest,
            requestedAt: dateKey,
            deadline: deadlineKey
          }
        };
      }
      if (shouldRequestTransferList) {
        const mailId = `PLAYER_TRANSFER_LIST_REQUEST_${withMorale.id}_${dateKey}`;
        const transferDemandTrigger = wantsHighReputationInterestMove ? "STRONG_INTEREST" : wantsBreakoutSeasonMove ? "STANDOUT_SEASON" : wantsHigherReputationMove ? "HIGHER_REPUTATION" : "DEFAULT";
        const demandCopy = getTransferListDemandCopy(
          withMorale,
          personality,
          transferDemandTrigger,
          hasStandoutSeason ? formatSeasonOutputSummary(seasonOutput) : void 0
        );
        createdMails.push({
          id: mailId,
          sender: `${withMorale.firstName} ${withMorale.lastName}`,
          role: "Zawodnik",
          subject: demandCopy.subject,
          body: demandCopy.body,
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: 4,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "TRANSFER_LIST",
            responseDeadline: deadlineKey
          }
        });
        if (boardSupportsProtectedExit && protectedExitPrice && createdMails.length < 2) {
          createdMails.push({
            id: `BOARD_PROTECTED_EXIT_SUPPORT_${withMorale.id}_${dateKey}`,
            sender: "Zarz\u0105d Klubu",
            role: "Zarz\u0105d",
            subject: `Zarz\u0105d jest got\xF3w rozwa\u017Cy\u0107 sprzeda\u017C: ${withMorale.lastName}`,
            body: [
              "Trenerze,",
              "",
              `${withMorale.firstName} ${withMorale.lastName} zg\u0142osi\u0142 sprzeciw wobec statusu \u201Enie na sprzeda\u017C\u201D i uwa\u017Ca, \u017Ce jest gotowy na gr\u0119 w klubie o wy\u017Cszej reputacji.`,
              "",
              `Po analizie sytuacji zarz\u0105d uwa\u017Ca, \u017Ce przy odpowiednio wysokiej ofercie sprzeda\u017C mo\u017Ce by\u0107 korzystna dla klubu. Dlatego zdejmujemy status \u201Enie na sprzeda\u017C\u201D i dopuszczamy rozmowy od kwoty oko\u0142o ${protectedExitPrice.toLocaleString("pl-PL")} PLN.`,
              "",
              "To nie oznacza zgody na dowoln\u0105 ofert\u0119, ale chcemy zostawi\u0107 klubowi realn\u0105 drog\u0119 do dobrej transakcji i jednocze\u015Bnie ograniczy\u0107 konflikt z zawodnikiem."
            ].join("\n"),
            date: new Date(currentDate),
            isRead: false,
            type: "BOARD" /* BOARD */,
            priority: 5
          });
        }
        withMorale = PlayerMoraleService.withMoraleChange(
          withMorale,
          boardSupportsProtectedExit ? 1 : -3,
          boardSupportsProtectedExit ? "Zarz\u0105d otwiera drog\u0119 do sprzeda\u017Cy po sprzeciwie zawodnika" : "Zawodnik prosi o wystawienie na list\u0119 transferow\u0105",
          currentDate
        );
        if (boardSupportsProtectedExit && protectedExitPrice) {
          return {
            ...withMorale,
            lastMoraleDemandDate: dateKey,
            transferListDemandUntil: null,
            isUntouchable: false,
            isOnTransferList: true,
            transferListPrice: protectedExitPrice,
            squadRole: null,
            isAvailableForLoan: false
          };
        }
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          transferListDemandUntil: deadlineKey
        };
      }
      if (shouldRequestRole && roleExpectation) {
        const mailId = `PLAYER_ROLE_REQUEST_${withMorale.id}_${dateKey}`;
        createdMails.push({
          id: mailId,
          sender: `${withMorale.firstName} ${withMorale.lastName}`,
          role: "Zawodnik",
          subject: `Rozmowa o statusie: ${withMorale.lastName}`,
          body: `Trenerze,

Chcia\u0142bym porozmawia\u0107 o mojej roli w dru\u017Cynie. Patrz\u0105c na moj\u0105 pozycj\u0119 w kadrze i poziom sportowy, uwa\u017Cam, \u017Ce powinienem mie\u0107 status: ${roleLabel(roleExpectation)}.

Nie chodzi mi o konflikt, ale o jasny sygna\u0142, \u017Ce klub widzi mnie zgodnie z moj\u0105 warto\u015Bci\u0105 dla zespo\u0142u. Je\u015Bli sytuacja si\u0119 nie zmieni, trudno b\u0119dzie mi utrzyma\u0107 pe\u0142ne zaanga\u017Cowanie.

${withMorale.firstName} ${withMorale.lastName}`,
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: roleExpectation === "KEY_PLAYER" ? 4 : 3,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "ROLE",
            requestedRole: roleExpectation,
            responseDeadline: deadlineKey
          }
        });
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, -2, `Zawodnik domaga si\u0119 statusu: ${roleLabel(roleExpectation)}`, currentDate);
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          roleDemandUntil: deadlineKey,
          requestedSquadRole: roleExpectation
        };
      }
      if (shouldRequestMinutes) {
        const mailId = `PLAYER_MINUTES_REQUEST_${withMorale.id}_${dateKey}`;
        const demandCopy = getMinutesDemandCopy(withMorale, minutesMindset.approach, recentAverageRating);
        createdMails.push({
          id: mailId,
          sender: `${withMorale.firstName} ${withMorale.lastName}`,
          role: "Zawodnik",
          subject: demandCopy.subject,
          body: demandCopy.body,
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: minutesMindset.priority,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "MINUTES",
            responseDeadline: deadlineKey
          }
        });
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, minutesMindset.moraleDrop, "Zawodnik domaga si\u0119 wi\u0119kszej liczby wyst\u0119p\xF3w", currentDate);
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          minutesDemandUntil: deadlineKey,
          minutesDemandBaseline: totalMinutes
        };
      }
      return withMorale;
    });
    return { players: nextPlayers, mails: createdMails };
  },
  reviewPlayerDemands: (player, currentDate) => {
    let withMorale = PlayerMoraleService.ensurePlayerState(player);
    if (withMorale.contractRaiseDemandUntil && withMorale.contractRaiseRequest) {
      const deadline = new Date(withMorale.contractRaiseDemandUntil);
      const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
      const request = withMorale.contractRaiseRequest;
      const isPromotionRaiseRequest = request.reason === "PROMOTION_RAISE";
      const fulfilled = (withMorale.annualSalary || 0) >= request.salary && getContractDaysLeft(withMorale, currentDate) > 365;
      if (fulfilled) {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(
            withMorale,
            isPromotionRaiseRequest ? 9 : 7,
            isPromotionRaiseRequest ? "Klub spe\u0142ni\u0142 pro\u015Bb\u0119 o podwy\u017Ck\u0119 po awansie" : "Klub spe\u0142ni\u0142 pro\u015Bb\u0119 o podwy\u017Ck\u0119",
            currentDate
          ),
          contractRaiseDemandUntil: null,
          contractRaiseRequest: null,
          contractRaiseTeamMoraleDelta: null,
          contractRaiseTeamMoraleReason: null
        };
      } else if (expired) {
        const personality = withMorale.moralePersonality ?? "CALM";
        const leadership = withMorale.attributes?.leadership ?? 50;
        const seed = stableHash(`${withMorale.id}_${toDateKey(currentDate)}_RAISE_REJECTED`);
        const roll = seededRng(seed, 19);
        const frustrationScore = (personality === "EGOIST" ? 28 : personality === "AMBITIOUS" ? 22 : personality === "CONFIDENT" ? 15 : personality === "LOYAL" ? -10 : personality === "PROFESSIONAL" ? -4 : 0) + Math.max(0, withMorale.overallRating - 66) + Math.max(0, request.salary / Math.max(1, withMorale.annualSalary || 1) - 1) * 18 + ((withMorale.morale ?? 50) <= 45 ? 8 : 0) + (isPromotionRaiseRequest ? 8 : 0) + roll * 18;
        if (frustrationScore >= 34 && getContractDaysLeft(withMorale, currentDate) > 365) {
          const boardLockoutActive = !!withMorale.boardLockoutUntil && dateOnly(currentDate).getTime() < dateOnly(new Date(withMorale.boardLockoutUntil)).getTime();
          const appealCooldownOk = !withMorale.boardAppealSentAt || dayDiff(new Date(withMorale.boardAppealSentAt), currentDate) > 180;
          if (boardLockoutActive && appealCooldownOk && !withMorale.boardAppealDeadline) {
            const appealDeadline = new Date(currentDate);
            appealDeadline.setDate(appealDeadline.getDate() + 14);
            withMorale = {
              ...PlayerMoraleService.withMoraleChange(
                withMorale,
                isPromotionRaiseRequest ? -8 : -6,
                isPromotionRaiseRequest ? "Zablokowana podwy\u017Cka po awansie przez dyrektora \u2014 zawodnik apeluje do zarz\u0105du" : "Zablokowana podwy\u017Cka przez dyrektora \u2014 zawodnik apeluje do zarz\u0105du",
                currentDate
              ),
              contractRaiseDemandUntil: null,
              contractRaiseRequest: null,
              boardAppealSentAt: toDateKey(currentDate),
              boardAppealType: "RAISE",
              boardAppealDeadline: toDateKey(appealDeadline)
            };
          } else {
            const transferDeadline = new Date(currentDate);
            transferDeadline.setDate(transferDeadline.getDate() + 14);
            withMorale = {
              ...PlayerMoraleService.withMoraleChange(
                withMorale,
                isPromotionRaiseRequest ? -15 : -12,
                isPromotionRaiseRequest ? "Odrzucona podwy\u017Cka po awansie eskaluje do \u017C\u0105dania listy transferowej" : "Odrzucona podwy\u017Cka eskaluje do \u017C\u0105dania listy transferowej",
                currentDate
              ),
              contractRaiseDemandUntil: null,
              contractRaiseRequest: null,
              transferListDemandUntil: toDateKey(transferDeadline),
              isUntouchable: false
            };
          }
        } else if (frustrationScore >= 18 || personality === "SENSITIVE" || personality === "NERVOUS") {
          const ownPenalty = (personality === "LOYAL" || personality === "PROFESSIONAL" ? -5 : personality === "EGOIST" || personality === "AMBITIOUS" ? -12 : -8) - (isPromotionRaiseRequest ? 2 : 0);
          const teamDelta = (leadership >= 82 ? -4 : leadership >= 72 ? -3 : leadership >= 62 ? -2 : leadership >= 52 ? -1 : 0) - (isPromotionRaiseRequest && leadership >= 62 ? 1 : 0);
          withMorale = {
            ...PlayerMoraleService.withMoraleChange(
              withMorale,
              ownPenalty,
              isPromotionRaiseRequest ? "Odrzucona pro\u015Bba o podwy\u017Ck\u0119 po awansie" : "Odrzucona pro\u015Bba o podwy\u017Ck\u0119",
              currentDate
            ),
            contractRaiseDemandUntil: null,
            contractRaiseRequest: null,
            contractRaiseTeamMoraleDelta: teamDelta,
            contractRaiseTeamMoraleReason: teamDelta < 0 ? isPromotionRaiseRequest ? `Wp\u0142yw lidera po odrzuconej podwy\u017Cce po awansie: ${withMorale.firstName} ${withMorale.lastName}` : `Wp\u0142yw lidera po odrzuconej podwy\u017Cce: ${withMorale.firstName} ${withMorale.lastName}` : null
          };
        } else {
          const reminderUntil = new Date(currentDate);
          reminderUntil.setMonth(reminderUntil.getMonth() + 3);
          withMorale = {
            ...withMorale,
            contractRaiseDemandUntil: null,
            contractRaiseRequest: null,
            contractRaiseReminderUntil: toDateKey(reminderUntil),
            lastMoraleDemandDate: toDateKey(currentDate)
          };
        }
      }
    }
    if (withMorale.transferListDemandUntil) {
      const deadline = new Date(withMorale.transferListDemandUntil);
      const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
      if (withMorale.isOnTransferList) {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, 8, "Trener zgodzi\u0142 si\u0119 na list\u0119 transferow\u0105", currentDate),
          transferListDemandUntil: null
        };
      } else if (expired) {
        const personality = withMorale.moralePersonality ?? "CALM";
        const penalty = personality === "LOYAL" || personality === "PROFESSIONAL" ? -8 : personality === "EGOIST" || personality === "AMBITIOUS" ? -16 : -12;
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, penalty, "Odrzucona pro\u015Bba o list\u0119 transferow\u0105", currentDate),
          transferListDemandUntil: null
        };
      }
    }
    if (withMorale.minutesDemandUntil) {
      const deadline = new Date(withMorale.minutesDemandUntil);
      const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
      const baseline = withMorale.minutesDemandBaseline ?? PlayerMoraleService.getTotalMinutesPlayed(withMorale);
      const hasPlayed = PlayerMoraleService.getTotalMinutesPlayed(withMorale) > baseline;
      if (hasPlayed) {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, 4, "Dosta\u0142 szans\u0119 po pro\u015Bbie o minuty", currentDate),
          minutesDemandUntil: null,
          minutesDemandBaseline: null,
          unresolvedMinutesDemandDate: null,
          unresolvedMinutesDemandBaseline: null
        };
      } else if (expired && !isAvailableForMinutesDemand(withMorale)) {
        withMorale = {
          ...withMorale,
          minutesDemandUntil: null,
          minutesDemandBaseline: null
        };
      } else if (expired) {
        const personality = withMorale.moralePersonality ?? "CALM";
        const penalty = personality === "LOYAL" || personality === "CALM" ? -6 : personality === "EGOIST" || personality === "AMBITIOUS" ? -12 : -9;
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, penalty, "Zignorowana pro\u015Bba o wi\u0119cej wyst\u0119p\xF3w", currentDate),
          minutesDemandUntil: null,
          minutesDemandBaseline: null,
          unresolvedMinutesDemandDate: toDateKey(currentDate),
          unresolvedMinutesDemandBaseline: PlayerMoraleService.getTotalMinutesPlayed(withMorale)
        };
      }
    }
    if (withMorale.developmentExitDemandUntil) {
      const deadline = new Date(withMorale.developmentExitDemandUntil);
      const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
      const fulfilled = !!withMorale.isOnTransferList || !!withMorale.isAvailableForLoan || !!withMorale.loan;
      if (fulfilled) {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, 6, "Klub zgodzi\u0142 si\u0119 na transfer lub wypo\u017Cyczenie po braku minut", currentDate),
          developmentExitDemandUntil: null,
          developmentExitDemandBaseline: null,
          unresolvedMinutesDemandDate: null,
          unresolvedMinutesDemandBaseline: null
        };
      } else if (expired) {
        const personality = withMorale.moralePersonality ?? "CALM";
        const penalty = personality === "LOYAL" || personality === "PROFESSIONAL" ? -10 : personality === "EGOIST" || personality === "AMBITIOUS" ? -18 : -14;
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, penalty, "Zignorowana pro\u015Bba o odej\u015Bcie lub wypo\u017Cyczenie po braku minut", currentDate),
          developmentExitDemandUntil: null,
          developmentExitDemandBaseline: null,
          unresolvedMinutesDemandDate: null,
          unresolvedMinutesDemandBaseline: null
        };
      }
    }
    if (withMorale.roleDemandUntil && withMorale.requestedSquadRole) {
      const deadline = new Date(withMorale.roleDemandUntil);
      const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
      const fulfilled = isSameOrHigherRole(withMorale.squadRole, withMorale.requestedSquadRole);
      if (fulfilled) {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, withMorale.requestedSquadRole === "KEY_PLAYER" ? 6 : 4, "Otrzyma\u0142 oczekiwany status w dru\u017Cynie", currentDate),
          roleDemandUntil: null,
          requestedSquadRole: null
        };
      } else if (expired) {
        const personality = withMorale.moralePersonality ?? "CALM";
        const penalty = personality === "PROFESSIONAL" || personality === "LOYAL" ? -5 : personality === "EGOIST" || personality === "AMBITIOUS" ? -13 : -9;
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, penalty, "Zignorowana pro\u015Bba o wy\u017Cszy status", currentDate),
          roleDemandUntil: null,
          requestedSquadRole: null
        };
      }
    }
    return withMorale;
  },
  getOneTimeBonusRequestBlockReason: (player, club, seasonNumber) => {
    const withMorale = PlayerMoraleService.ensurePlayerState(player);
    const profile = getSeasonOutputProfile(withMorale);
    if (profile.matches < 20) {
      return `Zawodnik musi rozegra\u0107 co najmniej 20 mecz\xF3w w sezonie. Teraz ma ${profile.matches}.`;
    }
    if (withMorale.oneTimeBonusAwardedSeason === seasonNumber) {
      return "Ten zawodnik dosta\u0142 ju\u017C jednorazow\u0105 premi\u0119 w tym sezonie.";
    }
    if (withMorale.oneTimeBonusPromise?.seasonNumber === seasonNumber) {
      return "Wniosek o premi\u0119 dla tego zawodnika jest ju\u017C u zarz\u0105du.";
    }
    if ((club.oneTimePlayerBonusesThisSeason ?? 0) >= 11) {
      return "Zarz\u0105d wykorzysta\u0142 ju\u017C limit 11 jednorazowych premii dla zawodnik\xF3w w tym sezonie.";
    }
    return null;
  },
  createOneTimeBonusPromise: (player, currentDate, seasonNumber) => {
    const decisionDueAt = new Date(currentDate);
    decisionDueAt.setDate(decisionDueAt.getDate() + 3);
    const withMorale = PlayerMoraleService.withMoraleChange(
      PlayerMoraleService.ensurePlayerState(player),
      1,
      "Trener obieca\u0142 rozmow\u0119 z zarz\u0105dem o jednorazowej premii",
      currentDate
    );
    return PlayerMoraleService.withMindsetChange(
      {
        ...withMorale,
        oneTimeBonusPromise: {
          requestedAt: toDateKey(currentDate),
          decisionDueAt: toDateKey(decisionDueAt),
          seasonNumber
        }
      },
      { coachTrust: 2, clubHappiness: 1 },
      "Obietnica rozmowy z zarz\u0105dem o premii",
      currentDate
    );
  },
  reviewOneTimeBonusPromises: (club, squad, currentDate, seasonNumber, seed) => {
    const dateKey = toDateKey(currentDate);
    let nextClub = club;
    const mails = [];
    const nextPlayers = squad.map((player) => {
      let withMorale = PlayerMoraleService.ensurePlayerState(player);
      const promise = withMorale.oneTimeBonusPromise;
      if (!promise || promise.seasonNumber !== seasonNumber) return withMorale;
      const decisionDate = new Date(promise.decisionDueAt);
      const decisionDue = !Number.isNaN(decisionDate.getTime()) && dateOnly(currentDate).getTime() >= dateOnly(decisionDate).getTime();
      if (!decisionDue) return withMorale;
      const profile = getSeasonOutputProfile(withMorale);
      const performanceScore = getOneTimeBonusPerformanceScore(withMorale, profile);
      const boardCompetence = boardAttributeScore(nextClub.board?.kompetencja);
      const generosity = boardAttributeScore(nextClub.board?.hojnosc);
      const ambition = boardAttributeScore(nextClub.board?.ambicja);
      const greed = boardAttributeScore(nextClub.board?.chciwosc);
      const localSeed = seed + stableHash(`${withMorale.id}_${dateKey}_ONE_TIME_BONUS`);
      const accuracy = 0.58 + boardCompetence * 0.09;
      const budgetNoise = (seededRng(localSeed, 11) - 0.5) * 0.2 * (1.25 - accuracy);
      const perceivedBudget = Math.max(0, nextClub.budget * (1 + budgetNoise));
      const rawAmount = 2e4 + performanceScore * 650 + generosity * 5e3 + (seededRng(localSeed, 17) - 0.5) * 2e4;
      const amount = roundOneTimeBonusAmount(rawAmount);
      const budgetScore = Math.max(0, Math.min(100, perceivedBudget / Math.max(1, amount) * 42));
      const rngScore = (seededRng(localSeed, 23) - 0.5) * 20;
      const decisionScore = performanceScore * 0.55 + budgetScore * 0.25 + generosity * 6 + ambition * 4 - greed * 6 + rngScore;
      const seasonLimitReached = (nextClub.oneTimePlayerBonusesThisSeason ?? 0) >= 11;
      const alreadyAwarded = withMorale.oneTimeBonusAwardedSeason === seasonNumber;
      const hasEnoughBudget = nextClub.budget >= amount;
      const approved = !seasonLimitReached && !alreadyAwarded && hasEnoughBudget && performanceScore >= 48 && decisionScore >= 62;
      const ceoName = nextClub.management?.ceo ? `${nextClub.management.ceo.firstName} ${nextClub.management.ceo.lastName}` : "Zarz\u0105d Klubu";
      const statsLine = getOneTimeBonusStatsLine(withMorale, profile);
      const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
      if (approved) {
        const reactionRoll = seededRng(localSeed, 37);
        const mindset = PlayerMoraleService.normalizeMindset(withMorale);
        const personality = withMorale.moralePersonality ?? "CALM";
        const gratitudeScore = (withMorale.morale ?? 50) * 0.22 + mindset.coachTrust * 0.22 + mindset.clubHappiness * 0.24 - mindset.conflictLevel * 0.18 + (personality === "LOYAL" || personality === "PROFESSIONAL" ? 12 : 0) + (personality === "EGOIST" || personality === "AMBITIOUS" ? -6 : 0) + reactionRoll * 18;
        const delighted = gratitudeScore >= 58;
        const pleased = gratitudeScore >= 44;
        const moraleDelta = delighted ? 6 : pleased ? 3 : 0;
        const bonusReactionReason = delighted ? "Zawodnik zadowolony z jednorazowej premii" : pleased ? "Zawodnik pozytywnie przyj\u0105\u0142 jednorazow\u0105 premi\u0119" : "Zawodnik neutralnie przyj\u0105\u0142 jednorazow\u0105 premi\u0119";
        withMorale = PlayerMoraleService.withMindsetChange(
          PlayerMoraleService.withMoraleChange(
            {
              ...withMorale,
              oneTimeBonusPromise: null,
              oneTimeBonusAwardedSeason: seasonNumber
            },
            moraleDelta,
            bonusReactionReason,
            currentDate
          ),
          delighted ? { clubHappiness: 8, coachTrust: 5, conflictLevel: -4, transferOpenness: -3 } : pleased ? { clubHappiness: 5, coachTrust: 3, conflictLevel: -2, transferOpenness: -1 } : { clubHappiness: 1, coachTrust: 1 },
          "Decyzja zarz\u0105du o jednorazowej premii",
          currentDate
        );
        nextClub = {
          ...nextClub,
          budget: nextClub.budget - amount,
          oneTimePlayerBonusesThisSeason: (nextClub.oneTimePlayerBonusesThisSeason ?? 0) + 1,
          financeHistory: [{
            id: `ONE_TIME_BONUS_${withMorale.id}_${dateKey}`,
            date: dateKey,
            amount: -amount,
            type: "EXPENSE",
            description: `Jednorazowa premia dla zawodnika: ${playerName}`,
            previousBalance: nextClub.budget
          }, ...nextClub.financeHistory || []].slice(0, 50)
        };
      } else {
        const reason = alreadyAwarded ? "zawodnik otrzyma\u0142 ju\u017C premi\u0119 w tym sezonie" : seasonLimitReached ? "klub wykorzysta\u0142 limit 11 premii w sezonie" : !hasEnoughBudget ? "zarz\u0105d uzna\u0142, \u017Ce bud\u017Cet nie pozwala na dodatkowy wydatek" : performanceScore < 48 ? "zarz\u0105d uzna\u0142, \u017Ce wk\u0142ad sportowy nie uzasadnia premii" : "zarz\u0105d nie zatwierdzi\u0142 wniosku po analizie sportowej i finansowej";
        const personality = withMorale.moralePersonality ?? "CALM";
        const moralePenalty = personality === "EGOIST" || personality === "AMBITIOUS" ? -5 : personality === "SENSITIVE" || personality === "NERVOUS" ? -4 : -2;
        withMorale = PlayerMoraleService.withMindsetChange(
          PlayerMoraleService.withMoraleChange(
            {
              ...withMorale,
              oneTimeBonusPromise: null
            },
            moralePenalty,
            "Zarz\u0105d odrzuci\u0142 pro\u015Bb\u0119 o jednorazow\u0105 premi\u0119",
            currentDate
          ),
          { clubHappiness: -7, coachTrust: -2, conflictLevel: 4 },
          "Odrzucona pro\u015Bba o jednorazow\u0105 premi\u0119",
          currentDate
        );
        mails.push({
          id: `ONE_TIME_BONUS_REJECTED_${withMorale.id}_${dateKey}`,
          sender: ceoName,
          role: "Zarz\u0105d",
          subject: `PREMIA ODRZUCONA: ${withMorale.lastName}`,
          body: [
            "Trenerze,",
            "",
            `Przeanalizowali\u015Bmy wniosek o jednorazow\u0105 premi\u0119 dla zawodnika ${playerName}.`,
            `Liczby zawodnika: ${statsLine}.`,
            "",
            `Decyzja: odmowa, poniewa\u017C ${reason}.`,
            "",
            ceoName,
            `Zarz\u0105d ${nextClub.name}`
          ].join("\n"),
          date: new Date(currentDate),
          isRead: false,
          type: "BOARD" /* BOARD */,
          priority: 6,
          metadata: {
            type: "ONE_TIME_BONUS_DECISION",
            playerId: withMorale.id,
            approved: false,
            amount: 0,
            seasonNumber
          }
        });
        return withMorale;
      }
      mails.push({
        id: `ONE_TIME_BONUS_APPROVED_${withMorale.id}_${dateKey}`,
        sender: ceoName,
        role: "Zarz\u0105d",
        subject: `PREMIA ZATWIERDZONA: ${withMorale.lastName}`,
        body: [
          "Trenerze,",
          "",
          `Przeanalizowali\u015Bmy wniosek o jednorazow\u0105 premi\u0119 dla zawodnika ${playerName}.`,
          `Liczby zawodnika: ${statsLine}.`,
          "",
          `Decyzja: zgoda na premi\u0119 w wysoko\u015Bci ${amount.toLocaleString("pl-PL")} PLN.`,
          "Kwota zosta\u0142a odj\u0119ta z bud\u017Cetu klubu.",
          "",
          ceoName,
          `Zarz\u0105d ${nextClub.name}`
        ].join("\n"),
        date: new Date(currentDate),
        isRead: false,
        type: "BOARD" /* BOARD */,
        priority: 7,
        metadata: {
          type: "ONE_TIME_BONUS_DECISION",
          playerId: withMorale.id,
          approved: true,
          amount,
          seasonNumber
        }
      });
      return withMorale;
    });
    return { club: nextClub, players: nextPlayers, mails };
  },
  processBoardAppeals: (club, squad, currentDate, existingMessages = []) => {
    if (squad.length === 0 || club.stats.played < 4 || currentDate.getDay() !== 1) {
      return { players: squad, mails: [] };
    }
    const dateKey = toDateKey(currentDate);
    const mails = [];
    const squadAverage = squad.reduce((sum, p) => sum + p.overallRating, 0) / squad.length;
    const sortedByQuality = [...squad].sort((a, b) => b.overallRating - a.overallRating);
    const rankById = new Map(sortedByQuality.map((p, i) => [p.id, i + 1]));
    const hasBoardAppealMail = (player) => existingMessages.some(
      (m) => m.metadata?.type === "PLAYER_BOARD_APPEAL" && m.metadata.playerId === player.id
    );
    const hasBoardDecisionMail = (player) => existingMessages.some(
      (m) => m.metadata?.type === "BOARD_APPEAL_DECISION" && m.metadata.playerId === player.id && new Date(m.date).getTime() >= currentDate.getTime() - 60 * DAY_MS
    );
    const nextPlayers = squad.map((player) => {
      let withMorale = PlayerMoraleService.ensurePlayerState(player);
      if (!withMorale.boardAppealSentAt || !withMorale.boardAppealDeadline) return withMorale;
      const appealType = withMorale.boardAppealType ?? "RAISE";
      const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
      if (!hasBoardAppealMail(withMorale)) {
        const subjectSuffix = appealType === "RAISE" ? "PODWY\u017BKA" : "ZGODA NA ODEJ\u015ACIE";
        const bodyRaise = [
          "Trenerze,",
          "",
          "Dyrektor sportowy zablokowa\u0142 negocjacje dotycz\u0105ce mojego kontraktu.",
          "Rozumiem struktur\u0119 decyzji w klubie, ale moje oczekiwania s\u0105 uzasadnione",
          "na tle mojego wk\u0142adu w gr\u0119 zespo\u0142u.",
          "",
          "Zwr\xF3ci\u0142em si\u0119 bezpo\u015Brednio do zarz\u0105du z pro\u015Bb\u0105 o ponowne rozpatrzenie tej sprawy.",
          "Poinformuj\u0119 Pana o ich decyzji.",
          "",
          playerName
        ].join("\n");
        const bodyTransfer = [
          "Trenerze,",
          "",
          "Dyrektor sportowy nie pozwala mi odej\u015B\u0107 mimo moich wyra\u017Anych oczekiwa\u0144.",
          "Czuj\u0119, \u017Ce moja przysz\u0142o\u015B\u0107 w tym klubie jest zablokowana decyzj\u0105 jednej osoby.",
          "",
          "Postanowi\u0142em zwr\xF3ci\u0107 si\u0119 bezpo\u015Brednio do zarz\u0105du z pro\u015Bb\u0105 o zgod\u0119 na odej\u015Bcie.",
          "Poinformuj\u0119 Pana o ich odpowiedzi.",
          "",
          playerName
        ].join("\n");
        mails.push({
          id: `PLAYER_BOARD_APPEAL_${withMorale.id}_${dateKey}`,
          sender: playerName,
          role: "Zawodnik",
          subject: `APEL DO ZARZ\u0104DU: ${withMorale.lastName} \u2014 ${subjectSuffix}`,
          body: appealType === "RAISE" ? bodyRaise : bodyTransfer,
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: 6,
          metadata: {
            type: "PLAYER_BOARD_APPEAL",
            playerId: withMorale.id,
            appealType,
            decisionDeadline: withMorale.boardAppealDeadline
          }
        });
      }
      const decisionDeadlineDate = new Date(withMorale.boardAppealDeadline);
      const decisionDue = !Number.isNaN(decisionDeadlineDate.getTime()) && dateOnly(currentDate).getTime() > dateOnly(decisionDeadlineDate).getTime();
      if (!decisionDue || hasBoardDecisionMail(withMorale)) return withMorale;
      const seed = stableHash(`${withMorale.id}_${dateKey}_BOARD_APPEAL`);
      const rank = rankById.get(withMorale.id) ?? squad.length;
      const marketValue = withMorale.marketValue ?? 0;
      const annualSalary = withMorale.annualSalary ?? 0;
      const raiseRequest = withMorale.contractRaiseRequest;
      const sellScore = boardAttributeScore(club.board?.chciwosc) * 2.5 + (club.transferBudget < marketValue * 0.35 ? 4 : 0) + (club.budget < marketValue * 0.2 ? 3 : 0) + Math.min(4, marketValue / Math.max(1, annualSalary * 3)) + seededRng(seed, 17) * 9 - 4.5;
      const budgetCoversRaise = raiseRequest ? club.budget >= raiseRequest.salary * 0.5 : club.budget >= annualSalary * 1.3;
      const boardConfidence = club.boardConfidence ?? 60;
      const managerBonus = boardConfidence / 100 * seededRng(seed, 7) * 5;
      const poorRelationBoost = boardConfidence < 40 ? (1 - boardConfidence / 100) * seededRng(seed, 89) * 4 : 0;
      const raiseScore = boardAttributeScore(club.board?.hojnosc) * 2.2 + (budgetCoversRaise ? 3.5 : -2) + (rank <= 3 ? 2.5 : rank <= 6 ? 1.5 : 0) + managerBonus + seededRng(seed, 31) * 7 - 3.5;
      const directorPersonalityMod = (() => {
        const p = club.sportingDirector?.personality;
        if (p === "CONTROLLER") return 3;
        if (p === "POLITICIAN") return 2;
        if (p === "ACCOUNTANT") return 1;
        if (p === "PARTNER") return -2;
        if (p === "TALENT_HUNTER") return -2;
        return 0;
      })();
      const vetoScore = boardAttributeScore(club.board?.cierpliwosc) * 2 + (club.sportingDirectorBoardInfluence ?? 50) / 100 * 6 + (boardConfidence > 70 ? 2 : boardConfidence > 50 ? 0 : -2) + directorPersonalityMod + poorRelationBoost + seededRng(seed, 53) * 6 - 3;
      const decision = sellScore > raiseScore && sellScore > vetoScore ? "SELL" : raiseScore > vetoScore ? "RAISE" : "VETO";
      const ceoName = club.management?.ceo ? `${club.management.ceo.firstName} ${club.management.ceo.lastName}` : "Zarz\u0105d Klubu";
      const bodyDecision = (() => {
        if (decision === "SELL") {
          const price = estimateProtectedExitPrice(withMorale, club, squadAverage);
          return [
            "Trenerze,",
            "",
            `Po analizie sytuacji zawodnika ${playerName}`,
            `zarz\u0105d postanowi\u0142 umie\u015Bci\u0107 go na li\u015Bcie transferowej z cen\u0105 wywo\u0142awcz\u0105 ${price.toLocaleString("pl-PL")} PLN.`,
            "",
            "Decyzja dyrektora sportowego zosta\u0142a w tym przypadku nadpisana przez zarz\u0105d.",
            "",
            ceoName,
            `Zarz\u0105d ${club.name}`
          ].join("\n");
        }
        if (decision === "RAISE") {
          return [
            "Trenerze,",
            "",
            `Po przeanalizowaniu sprawy ${playerName}`,
            "zarz\u0105d zdecydowa\u0142 si\u0119 odblokowa\u0107 negocjacje kontraktowe.",
            "",
            "Mo\u017Ce Pan ponownie przes\u0142a\u0107 ofert\u0119 kontraktow\u0105 temu zawodnikowi.",
            "",
            ceoName,
            `Zarz\u0105d ${club.name}`
          ].join("\n");
        }
        return [
          "Trenerze,",
          "",
          `Po przeanalizowaniu sprawy zarz\u0105d podtrzymuje stanowisko dyrektora sportowego`,
          `w kwestii ${playerName}.`,
          "",
          "Apel zawodnika zosta\u0142 odrzucony.",
          "",
          ceoName,
          `Zarz\u0105d ${club.name}`
        ].join("\n");
      })();
      const subjectDecision = decision === "SELL" ? `ZARZ\u0104D WYRAZI\u0141 ZGOD\u0118 NA SPRZEDA\u017B: ${withMorale.lastName}` : decision === "RAISE" ? `ZARZ\u0104D ODBLOKOWA\u0141 NEGOCJACJE KONTRAKTU: ${withMorale.lastName}` : `ZARZ\u0104D PODTRZYMA\u0141 DECYZJ\u0118 DYREKTORA: ${withMorale.lastName}`;
      mails.push({
        id: `BOARD_APPEAL_DECISION_${withMorale.id}_${dateKey}`,
        sender: ceoName,
        role: "Zarz\u0105d",
        subject: subjectDecision,
        body: bodyDecision,
        date: new Date(currentDate),
        isRead: false,
        type: "BOARD" /* BOARD */,
        priority: 7,
        metadata: {
          type: "BOARD_APPEAL_DECISION",
          playerId: withMorale.id,
          decision,
          appealType
        }
      });
      if (decision === "SELL") {
        const askingPrice = estimateProtectedExitPrice(withMorale, club, squadAverage);
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, 6, "Zarz\u0105d wyrazi\u0142 zgod\u0119 na sprzeda\u017C po apelu zawodnika", currentDate),
          isOnTransferList: true,
          transferListPrice: askingPrice,
          boardLockoutUntil: null,
          boardAppealSentAt: null,
          boardAppealType: null,
          boardAppealDeadline: null
        };
      } else if (decision === "RAISE") {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, 4, "Zarz\u0105d odblokowa\u0142 negocjacje kontraktu po apelu zawodnika", currentDate),
          boardLockoutUntil: null,
          boardAppealSentAt: null,
          boardAppealType: null,
          boardAppealDeadline: null
        };
      } else {
        withMorale = {
          ...PlayerMoraleService.withMindsetChange(
            PlayerMoraleService.withMoraleChange(withMorale, -12, "Zarz\u0105d podtrzyma\u0142 decyzj\u0119 dyrektora \u2014 apel odrzucony", currentDate),
            { conflictLevel: 20, clubHappiness: -15 },
            "Apel do zarz\u0105du odrzucony",
            currentDate
          ),
          boardAppealSentAt: null,
          boardAppealType: null,
          boardAppealDeadline: null
        };
      }
      return withMorale;
    });
    return { players: nextPlayers, mails };
  }
};

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
  { id: "L_PL_4", name: "Liga Regionalna", level: "TIER_4_HIDDEN" /* TIER_4_HIDDEN */, teamIds: [] },
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
var clubsTier4 = loadClubsForTier(4, "L_PL_4", 100);
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
  if (leagueId === "L_PL_4") return 0.18;
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
var stableHash2 = (value) => {
  let hash2 = 0;
  for (let i = 0; i < value.length; i++) {
    hash2 = (hash2 << 5) - hash2 + value.charCodeAt(i) | 0;
  }
  return Math.abs(hash2);
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
var calculatePerformancePressure = (club, rank, expPoints) => {
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
  const expectedRank = Math.max(1, baseExpected + ambicjaOffset);
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
    return stableHash2(`${coach.id}|${club.id}|${renewalKey}|contract-renewal`) % 2 === 0;
  },
  getPerformancePressure: (club, rank, expPoints) => calculatePerformancePressure(club, rank, expPoints),
  findReplacementCoach: (coaches, club, hireDate, excludedCoachId) => {
    const hireKey = hireDate.toISOString().split("T")[0];
    const candidates = Object.values(coaches).filter(
      (coach) => !coach.currentClubId && coach.id !== excludedCoachId && (!coach.blacklist?.[club.id] || coach.blacklist[club.id] <= hireDate.getFullYear())
    );
    if (candidates.length === 0) return void 0;
    if (club.reputation < 12) {
      return candidates.sort((a, b) => b.attributes.experience - a.attributes.experience)[0];
    }
    const shouldSearchEurope = stableHash2(`${club.id}|${hireKey}|coach-market-region`) % 100 < 99;
    const preferredCandidates = candidates.filter(isPreferredEuropeanCoach);
    const alternativeCandidates = candidates.filter((candidate) => !isPreferredEuropeanCoach(candidate));
    const pool = shouldSearchEurope ? preferredCandidates.length > 0 ? preferredCandidates : candidates : alternativeCandidates.length > 0 ? alternativeCandidates : candidates;
    const sorted = [...pool].sort(sortByCoachExp);
    if (club.reputation >= 17) {
      return sorted[0];
    }
    return sorted.find(
      (candidate) => stableHash2(`${candidate.id}|${club.id}|${hireKey}|coach-hire-agreement`) % 2 === 0
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
  applyNationalTeamExpForResults: (coaches, nationalTeams2, results) => {
    const teamById = new Map(nationalTeams2.map((team) => [team.id, team]));
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

// services/PlayerAttributesGenerator.ts
var TIER_CONFIG = {
  1: { minBase: 58, maxBase: 71, hardCap: 77 },
  2: { minBase: 50, maxBase: 64, hardCap: 71 },
  3: { minBase: 42, maxBase: 56, hardCap: 66 },
  4: { minBase: 30, maxBase: 48, hardCap: 56 }
};
var EUROPEAN_TIER_CONFIG = {
  1: { minBase: 80, maxBase: 92, hardCap: 99 },
  2: { minBase: 60, maxBase: 76, hardCap: 87 },
  3: { minBase: 50, maxBase: 66, hardCap: 77 },
  4: { minBase: 38, maxBase: 54, hardCap: 67 },
  5: { minBase: 28, maxBase: 44, hardCap: 57 }
};
var POLISH_GK_ATTRIBUTE_CAPS = {
  goalkeeping: 87,
  defending: 87,
  positioning: 90,
  mentality: 90,
  talent: 99
};
var capInitialGoalkeeperAttributes = (attributes, position, isEuropean = false) => {
  if (position !== "GK" /* GK */ || isEuropean) return attributes;
  const capped = { ...attributes };
  Object.keys(capped).forEach((key) => {
    const cap = POLISH_GK_ATTRIBUTE_CAPS[key];
    if (cap !== void 0) {
      capped[key] = Math.max(1, Math.min(cap, capped[key]));
    }
  });
  return capped;
};
var REGION_PROFILE = {
  // Elite
  ["SPAIN" /* SPAIN */]: { baseOffset: 0, starChance: 0.1 },
  ["FRANCE" /* FRANCE */]: { baseOffset: 0, starChance: 0.1 },
  ["ENGLAND" /* ENGLAND */]: { baseOffset: 0, starChance: 0.1 },
  ["GERMANY" /* GERMANY */]: { baseOffset: 0, starChance: 0.1 },
  ["ITALY" /* ITALY */]: { baseOffset: 0, starChance: 0.1 },
  ["BRAZIL" /* BRAZIL */]: { baseOffset: 0, starChance: 0.1 },
  ["ARGENTINA" /* ARGENTINA */]: { baseOffset: 0, starChance: 0.1 },
  // Wysoki
  ["IBERIA" /* IBERIA */]: { baseOffset: -2, starChance: 0.06 },
  ["MEXICO" /* MEXICO */]: { baseOffset: -2, starChance: 0.06 },
  ["SWEDEN" /* SWEDEN */]: { baseOffset: -4, starChance: 0.04 },
  ["BENELUX" /* BENELUX */]: { baseOffset: 0, starChance: 0.1 },
  // Dobry
  ["SCANDINAVIA" /* SCANDINAVIA */]: { baseOffset: -4, starChance: 0.04 },
  ["CZ_SK" /* CZ_SK */]: { baseOffset: -4, starChance: 0.04 },
  ["SSA" /* SSA */]: { baseOffset: -4, starChance: 0.04 },
  ["KOREA" /* KOREA */]: { baseOffset: -4, starChance: 0.04 },
  ["NORTH_AMERICA" /* NORTH_AMERICA */]: { baseOffset: -5, starChance: 0.03 },
  // Średnio
  ["POLAND" /* POLAND */]: { baseOffset: -6, starChance: 0.03 },
  ["BALKANS" /* BALKANS */]: { baseOffset: -6, starChance: 0.03 },
  ["EX_USSR" /* EX_USSR */]: { baseOffset: -6, starChance: 0.03 },
  ["TURKEY" /* TURKEY */]: { baseOffset: -6, starChance: 0.03 },
  ["JAPAN" /* JAPAN */]: { baseOffset: -6, starChance: 0.03 },
  ["OCEANIA" /* OCEANIA */]: { baseOffset: -8, starChance: 0.02 },
  // Poniżej Średnio
  ["GREEK" /* GREEK */]: { baseOffset: -8, starChance: 0.02 },
  ["ROMANIA" /* ROMANIA */]: { baseOffset: -8, starChance: 0.02 },
  ["HUNGARIAN" /* HUNGARIAN */]: { baseOffset: -8, starChance: 0.02 },
  ["ISRAELI" /* ISRAELI */]: { baseOffset: -8, starChance: 0.02 },
  ["FINLAND" /* FINLAND */]: { baseOffset: -8, starChance: 0.02 },
  // Niski
  ["ARABIA" /* ARABIA */]: { baseOffset: -10, starChance: 0.015 },
  ["GEORGIA" /* GEORGIA */]: { baseOffset: -10, starChance: 0.015 },
  ["ALBANIA" /* ALBANIA */]: { baseOffset: -10, starChance: 0.015 },
  ["ARMENIA" /* ARMENIA */]: { baseOffset: -10, starChance: 0.015 },
  ["BALTIC" /* BALTIC */]: { baseOffset: -10, starChance: 0.015 },
  // Bardzo niski
  ["AZERBAIJANI" /* AZERBAIJANI */]: { baseOffset: -13, starChance: 0.01 },
  ["KAZAKH" /* KAZAKH */]: { baseOffset: -13, starChance: 0.01 },
  // Dno
  ["MALTESE" /* MALTESE */]: { baseOffset: -16, starChance: 5e-3 }
};
var PROFILES = {
  ["GK" /* GK */]: {
    goalkeeping: 1,
    positioning: 0.8,
    strength: 0.7,
    passing: 0.4,
    pace: 0.3,
    finishing: 0.1,
    attacking: 0.1,
    defending: 0.2,
    freeKicks: 0.1,
    talent: 0.5,
    penalties: 0.4,
    corners: 0.1,
    aggression: 0.5,
    crossing: 0.1,
    leadership: 0.5,
    mentality: 0.8,
    workRate: 0.7
  },
  ["DEF" /* DEF */]: {
    defending: 1,
    strength: 0.9,
    stamina: 0.8,
    positioning: 0.8,
    heading: 0.8,
    pace: 0.6,
    passing: 0.5,
    technique: 0.4,
    vision: 0.3,
    finishing: 0.15,
    attacking: 0.1,
    goalkeeping: 0.05,
    freeKicks: 0.45,
    talent: 0.5,
    penalties: 0.4,
    corners: 0.3,
    aggression: 0.8,
    crossing: 0.4,
    leadership: 0.6,
    mentality: 0.7,
    workRate: 0.8
  },
  ["MID" /* MID */]: {
    passing: 1,
    vision: 0.9,
    technique: 0.9,
    stamina: 0.9,
    dribbling: 0.8,
    positioning: 0.7,
    attacking: 0.7,
    pace: 0.6,
    defending: 0.5,
    finishing: 0.5,
    goalkeeping: 0.05,
    freeKicks: 0.7,
    talent: 0.7,
    penalties: 0.5,
    corners: 0.7,
    aggression: 0.6,
    crossing: 0.8,
    leadership: 0.7,
    mentality: 0.8,
    workRate: 0.9
  },
  ["FWD" /* FWD */]: {
    finishing: 1,
    attacking: 0.9,
    pace: 0.9,
    dribbling: 0.8,
    heading: 0.7,
    technique: 0.7,
    positioning: 0.8,
    stamina: 0.6,
    strength: 0.6,
    passing: 0.5,
    defending: 0.2,
    goalkeeping: 0.05,
    freeKicks: 0.6,
    talent: 0.8,
    penalties: 0.8,
    corners: 0.4,
    aggression: 0.7,
    crossing: 0.4,
    leadership: 0.5,
    mentality: 0.7,
    workRate: 0.7
  }
};
var OVR_WEIGHTS = {
  ["GK" /* GK */]: {
    goalkeeping: 0.5,
    positioning: 0.15,
    mentality: 0.15,
    strength: 0.15,
    passing: 0.04,
    workRate: 0.06,
    leadership: 5e-3,
    aggression: 0.02,
    pace: 0.04,
    stamina: 0.04,
    talent: 0.11,
    penalties: 1e-3,
    technique: 0.02,
    vision: 0.02,
    defending: 0.2
  },
  ["DEF" /* DEF */]: {
    defending: 0.5,
    positioning: 0.22,
    strength: 0.2,
    heading: 0.2,
    stamina: 0.2,
    workRate: 0.07,
    mentality: 0.11,
    aggression: 0.12,
    pace: 0.12,
    passing: 0.05,
    leadership: 1e-3,
    technique: 0.02,
    crossing: 0.01,
    vision: 0.01,
    freeKicks: 5e-3,
    talent: 0.02,
    corners: 1e-3,
    penalties: 1e-3,
    dribbling: 5e-3,
    attacking: 2e-3
  },
  ["MID" /* MID */]: {
    passing: 0.5,
    vision: 0.11,
    technique: 0.3,
    stamina: 0.09,
    dribbling: 0.2,
    mentality: 0.07,
    workRate: 0.07,
    attacking: 0.15,
    positioning: 0.05,
    crossing: 0.15,
    pace: 0.2,
    freeKicks: 0.15,
    corners: 0.15,
    leadership: 0.01,
    defending: 0.01,
    finishing: 0.05,
    talent: 0.02,
    strength: 0.01,
    heading: 0.01,
    aggression: 0.01,
    penalties: 0.01
  },
  ["FWD" /* FWD */]: {
    finishing: 0.3,
    attacking: 0.3,
    pace: 0.2,
    positioning: 0.1,
    mentality: 0.1,
    dribbling: 0.12,
    heading: 0.1,
    technique: 0.1,
    strength: 0.05,
    stamina: 0.04,
    workRate: 0.04,
    talent: 0.03,
    penalties: 0.07,
    freeKicks: 0.01,
    passing: 0.01,
    crossing: 2e-3,
    aggression: 2e-3,
    leadership: 2e-3,
    corners: 1e-3
  }
};
var PlayerAttributesGenerator = {
  capInitialGoalkeeperAttributes,
  generateAttributes: (position, leagueTier, clubReputation, age, isEuropean = false, talentConfig, regionProfile) => {
    const configTable = isEuropean ? EUROPEAN_TIER_CONFIG : TIER_CONFIG;
    const config = talentConfig ?? (configTable[leagueTier] || configTable[4]);
    const repBonus = Math.min(5, Math.max(0, clubReputation - 2));
    const tierBase = config.minBase + Math.random() * (config.maxBase - config.minBase) + repBonus + (regionProfile?.baseOffset ?? 0);
    const profile = PROFILES[position];
    const generated = {};
    const isDefFreeKickSpecialist = position === "DEF" /* DEF */ && Math.random() < 0.1;
    const isDefPenaltySpecialist = position === "DEF" /* DEF */ && Math.random() < 0.05;
    const allKeys = [
      "strength",
      "stamina",
      "pace",
      "defending",
      "passing",
      "attacking",
      "finishing",
      "technique",
      "vision",
      "dribbling",
      "heading",
      "positioning",
      "goalkeeping",
      "freeKicks",
      "talent",
      "penalties",
      "corners",
      "aggression",
      "crossing",
      "leadership",
      "mentality",
      "workRate"
    ];
    allKeys.forEach((key) => {
      if (["pace", "strength", "stamina"].includes(key)) {
        let val = 45 + Math.floor(Math.random() * 55);
        const weight2 = profile[key] || 0.5;
        if (weight2 >= 0.8) val += 5;
        if (weight2 <= 0.3) val -= 10;
        if (age >= 35) val = Math.min(val, 80);
        else if (age > 33) val = Math.min(val, 87);
        else if (age > 30) val = Math.min(val, 91);
        const physicalCap = 99;
        generated[key] = Math.max(45, Math.min(physicalCap, val));
        return;
      }
      if (position === "GK" /* GK */ && ["dribbling", "heading", "attacking", "finishing"].includes(key)) {
        generated[key] = Math.floor(Math.random() * 32) + 1;
        return;
      }
      if (position === "GK" /* GK */ && key === "penalties") {
        generated[key] = Math.floor(Math.random() * 35) + 1;
        return;
      }
      if (key === "goalkeeping" && position !== "GK" /* GK */) {
        generated[key] = Math.floor(Math.random() * 15) + 1;
        return;
      }
      if (position === "DEF" /* DEF */ && key === "freeKicks" && isDefFreeKickSpecialist) {
        generated[key] = Math.floor(60 + Math.random() * 26);
        return;
      }
      if (position === "DEF" /* DEF */ && key === "penalties" && isDefPenaltySpecialist) {
        generated[key] = Math.floor(55 + Math.random() * 31);
        return;
      }
      const weight = profile[key] !== void 0 ? profile[key] : 0.5;
      let value = tierBase;
      if (weight >= 0.8) {
        value += Math.random() * 12;
      } else if (weight >= 0.5) {
        value += Math.random() * 8 - 4;
      } else if (weight >= 0.35) {
        value -= Math.random() * 15 + 5;
      } else {
        const multiplier = 0.4 + weight * 0.5;
        value = tierBase * multiplier + (Math.random() * 10 - 5);
      }
      const baseAttrCap = position === "DEF" /* DEF */ && (key === "freeKicks" || key === "penalties") ? 85 : config.hardCap;
      const attrCap = position === "GK" /* GK */ && !isEuropean ? POLISH_GK_ATTRIBUTE_CAPS[key] ?? baseAttrCap : baseAttrCap;
      value = Math.max(1, Math.min(Math.floor(value), attrCap));
      if (Math.random() < (regionProfile?.starChance ?? 0.04)) {
        value = Math.min(attrCap, value + Math.floor(Math.random() * 12) + 3);
      }
      generated[key] = value;
    });
    const finalAttributes = capInitialGoalkeeperAttributes(generated, position, isEuropean);
    const overall = PlayerAttributesGenerator.calculateOverall(finalAttributes, position);
    return { attributes: finalAttributes, overall };
  },
  calculateOverall: (attrs, position) => {
    const weights = OVR_WEIGHTS[position];
    let weightedSum = 0;
    let totalWeight = 0;
    Object.entries(weights).forEach(([key, w]) => {
      const k = key;
      const weightVal = w || 0;
      weightedSum += attrs[k] * weightVal;
      totalWeight += weightVal;
    });
    if (totalWeight === 0) return 50;
    return Math.round(weightedSum / totalWeight);
  }
};

// resources/ClubKits.ts
var FALLBACK_COLORS = ["#111111", "#ffffff", "#ff0000", "#facc15"];
var DEFAULT_KIT_PATTERN = "solid";
var inferDefaultHomePattern = (club) => {
  const name = club.name.toLowerCase();
  if (name.includes("barcelona") || name.includes("inter mediolan") || name.includes("inter milan") || name.includes("ac milan") || name.includes("atletico") || name.includes("juventus") || name.includes("psv") || name.includes("feyenoord") || name.includes("athletic bilbao") || name.includes("real sociedad")) {
    return "vertical_stripes";
  }
  if (name.includes("celtic") || name.includes("sporting cp") || name.includes("sporting lizbona")) {
    return "horizontal_stripes";
  }
  return DEFAULT_KIT_PATTERN;
};
var normalizeKitColor = (value, fallback) => {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  return fallback;
};
var normalizeKitPattern = (value) => {
  if (value === "horizontal_stripes" || value === "vertical_stripes" || value === "diagonal_stripe" || value === "center_band" || value === "center_vertical_stripe") return value;
  return DEFAULT_KIT_PATTERN;
};
var createDefaultClubKits = (colorsHex = []) => {
  const colors = [
    normalizeKitColor(colorsHex[0], FALLBACK_COLORS[0]),
    normalizeKitColor(colorsHex[1], FALLBACK_COLORS[1]),
    normalizeKitColor(colorsHex[2], FALLBACK_COLORS[2]),
    normalizeKitColor(colorsHex[3], FALLBACK_COLORS[3])
  ];
  return [
    {
      id: "home",
      name: "Domowy",
      shirt: colors[0],
      shirtSecondary: colors[1],
      shorts: colors[0],
      socks: colors[0],
      pattern: DEFAULT_KIT_PATTERN,
      isActive: true
    },
    {
      id: "away",
      name: "Wyjazdowy",
      shirt: colors[1],
      shirtSecondary: colors[0],
      shorts: colors[1],
      socks: colors[1],
      pattern: DEFAULT_KIT_PATTERN,
      isActive: true
    },
    {
      id: "third",
      name: "Trzeci",
      shirt: colors[2],
      shirtSecondary: colors[0],
      shorts: colors[2],
      socks: colors[2],
      pattern: DEFAULT_KIT_PATTERN,
      isActive: Boolean(colorsHex[2])
    },
    {
      id: "fourth",
      name: "Czwarty",
      shirt: colors[3],
      shirtSecondary: colors[0],
      shorts: colors[3],
      socks: colors[3],
      pattern: DEFAULT_KIT_PATTERN,
      isActive: Boolean(colorsHex[3])
    }
  ];
};
var getClubKits = (club) => {
  const fallback = createDefaultClubKits(club.colorsHex);
  fallback[0] = { ...fallback[0], pattern: inferDefaultHomePattern(club) };
  const source = club.kits && club.kits.length >= 2 ? club.kits : fallback;
  return [0, 1, 2, 3].map((index) => {
    const base = fallback[index];
    const kit = source[index];
    return {
      id: kit?.id || base.id,
      name: kit?.name || base.name,
      shirt: normalizeKitColor(kit?.shirt, base.shirt),
      shirtSecondary: normalizeKitColor(kit?.shirtSecondary, base.shirtSecondary ?? base.shorts),
      shorts: normalizeKitColor(kit?.shorts, base.shorts),
      socks: normalizeKitColor(kit?.socks, base.socks),
      pattern: kit?.pattern ? normalizeKitPattern(kit.pattern) : base.pattern,
      isActive: index < 2 ? true : Boolean(kit?.isActive)
    };
  });
};
var getActiveClubKits = (club) => getClubKits(club).filter((kit, index) => index < 2 || kit.isActive);
var createDefaultNationalTeamKits = (colorsHex = []) => createDefaultClubKits(colorsHex).slice(0, 3).map((kit, index) => ({
  ...kit,
  name: index === 0 ? "Domowy" : index === 1 ? "Wyjazdowy" : "Rezerwowy",
  isActive: true
}));
var getNationalTeamKits = (team) => {
  const fallback = createDefaultNationalTeamKits(team.colorsHex);
  const source = team.kits && team.kits.length >= 3 ? team.kits : fallback;
  return [0, 1, 2].map((index) => {
    const base = fallback[index];
    const kit = source[index];
    return {
      id: kit?.id || base.id,
      name: kit?.name || base.name,
      shirt: normalizeKitColor(kit?.shirt, base.shirt),
      shirtSecondary: normalizeKitColor(kit?.shirtSecondary, base.shirtSecondary ?? base.shorts),
      shorts: normalizeKitColor(kit?.shorts, base.shorts),
      socks: normalizeKitColor(kit?.socks, base.socks),
      pattern: kit?.pattern ? normalizeKitPattern(kit.pattern) : base.pattern,
      isActive: true
    };
  });
};
var getActiveNationalTeamKits = (team) => getNationalTeamKits(team);

// services/UefaNationalRankingService.ts
var INITIAL_ACCESS_ORDER = [
  "Portugalia",
  "Hiszpania",
  "Francja",
  "Niemcy",
  "Holandia",
  "W\u0142ochy",
  "Dania",
  "Chorwacja",
  "Anglia",
  "Belgia",
  "Turcja",
  "Serbia",
  "Norwegia",
  "Walia",
  "Grecja",
  "Czechy",
  "Szwajcaria",
  "Austria",
  "Szkocja",
  "Ukraina",
  "Szwecja",
  "Polska",
  "W\u0119gry",
  "Rumunia",
  "Bo\u015Bnia i Hercegowina",
  "Irlandia",
  "Izrael",
  "S\u0142owenia",
  "Gruzja",
  "Albania",
  "Macedonia P\xF3\u0142nocna",
  "Kosovo",
  "S\u0142owacja",
  "Irlandia P\xF3\u0142nocna",
  "Bu\u0142garia",
  "Islandia",
  "Finlandia",
  "Czarnog\xF3ra",
  "Armenia",
  "Bia\u0142oru\u015B",
  "Luksemburg",
  "Wyspy Owcze",
  "Kazachstan",
  "Estonia",
  "Cypr",
  "Litwa",
  "\u0141otwa",
  "Mo\u0142dawia",
  "Azerbejd\u017Can",
  "Malta",
  "Andora",
  "Gibraltar",
  "Liechtenstein",
  "San Marino"
];
var RANKING_SOURCE = "Startowa lista dost\u0119pu Ligi Narod\xF3w UEFA 2026/27";
var LEAGUE_PHASE_SOURCE = "Ranking og\xF3lny UEFA po fazie ligowej Ligi Narod\xF3w";
var FINAL_SOURCE = "Ranking og\xF3lny UEFA po fina\u0142ach Ligi Narod\xF3w";
var TIER_ORDER = ["A", "B", "C", "D"];
var normalize = (value) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
var tierForRank = (rank) => {
  if (rank <= 16) return "A";
  if (rank <= 32) return "B";
  if (rank <= 48) return "C";
  return "D";
};
var getEuropeanTeams = (nationalTeams2) => nationalTeams2.filter((team) => team.continent === "Europe" && team.name !== "Rosja").map((team) => team.name);
var createAccessOrderedTeams = (nationalTeams2) => {
  const europeanTeams = getEuropeanTeams(nationalTeams2);
  const byNormalizedName = new Map(europeanTeams.map((name) => [normalize(name), name]));
  const used = /* @__PURE__ */ new Set();
  const orderedTeams = [];
  INITIAL_ACCESS_ORDER.forEach((name) => {
    const resolved = byNormalizedName.get(normalize(name));
    if (resolved && !used.has(resolved)) {
      used.add(resolved);
      orderedTeams.push(resolved);
    }
  });
  europeanTeams.filter((name) => !used.has(name)).sort((a, b) => a.localeCompare(b)).forEach((name) => orderedTeams.push(name));
  return orderedTeams;
};
var getAccessRankMap = (state, nationalTeams2) => {
  const teams = state?.entries?.length ? state.entries.map((entry) => entry.teamName) : nationalTeams2 ? createAccessOrderedTeams(nationalTeams2) : INITIAL_ACCESS_ORDER;
  return new Map(teams.map((teamName, index) => [teamName, index + 1]));
};
var createEntry = (teamName, rank, previousRank, basis, stats, totalTeams = 54) => ({
  teamName,
  rank,
  previousRank: previousRank ?? rank,
  points: stats?.points ?? Math.max(1, totalTeams - rank + 1),
  leagueTier: stats?.leagueTier ?? tierForRank(rank),
  lastDelta: (previousRank ?? rank) - rank,
  rankingBasis: basis,
  groupPosition: stats?.groupPosition,
  played: stats?.played,
  wins: stats?.wins,
  draws: stats?.draws,
  losses: stats?.losses,
  goalsFor: stats?.goalsFor,
  goalsAgainst: stats?.goalsAgainst,
  goalDifference: stats?.goalDifference
});
var countAwayStats = (teamName, fixtures) => {
  let awayGoals = 0;
  let awayWins = 0;
  fixtures.forEach((fixture) => {
    if (!fixture.played || fixture.away !== teamName) return;
    awayGoals += fixture.awayGoals ?? 0;
    if ((fixture.awayGoals ?? 0) > (fixture.homeGoals ?? 0)) awayWins += 1;
  });
  return { awayGoals, awayWins };
};
var compareRows = (accessRanks) => (a, b) => a.groupPosition - b.groupPosition || b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || b.awayGoals - a.awayGoals || b.wins - a.wins || b.awayWins - a.awayWins || (accessRanks.get(a.teamName) ?? 999) - (accessRanks.get(b.teamName) ?? 999) || a.teamName.localeCompare(b.teamName);
var buildLeaguePhaseRows = (nationsLeagueState, accessRanks) => {
  const rows = nationsLeagueState.groups.flatMap((group) => {
    const groupFixtures = nationsLeagueState.fixtures.filter((fixture) => fixture.groupId === group.id);
    return group.standings.map((standing, index) => ({
      ...standing,
      leagueTier: group.tier,
      groupId: group.id,
      groupPosition: index + 1,
      ...countAwayStats(standing.teamName, groupFixtures)
    }));
  });
  return TIER_ORDER.flatMap(
    (tier) => rows.filter((row) => row.leagueTier === tier).sort(compareRows(accessRanks))
  );
};
var moveFinalFourToTop = (rows, finals) => {
  if (!finals?.champion || !finals.runnerUp || !finals.thirdPlace || !finals.fourthPlace) return rows;
  const finalOrder = [finals.champion, finals.runnerUp, finals.thirdPlace, finals.fourthPlace];
  const byTeam = new Map(rows.map((row) => [row.teamName, row]));
  const topRows = finalOrder.map((team) => byTeam.get(team)).filter((row) => !!row);
  const remaining = rows.filter((row) => !finalOrder.includes(row.teamName));
  return [...topRows, ...remaining];
};
var sortByInterimOrder = (rows, interimOrder) => [...rows].sort(
  (a, b) => (interimOrder.get(a.teamName) ?? 999) - (interimOrder.get(b.teamName) ?? 999) || a.teamName.localeCompare(b.teamName)
);
var rowsForTeams = (rowsByTeam, teamNames, interimOrder) => sortByInterimOrder(
  teamNames.map((teamName) => rowsByTeam.get(teamName)).filter((row) => !!row),
  interimOrder
);
var playoffWinners = (state, level) => (state.playoffs ?? []).filter((tie) => tie.level === level && tie.winner).map((tie) => tie.winner);
var playoffLosers = (state, level) => (state.playoffs ?? []).filter((tie) => tie.level === level && tie.loser).map((tie) => tie.loser);
var buildFinalOverallRows = (leagueRows, state) => {
  const interimOrder = new Map(leagueRows.map((row, index) => [row.teamName, index + 1]));
  const rowsByTeam = new Map(leagueRows.map((row) => [row.teamName, row]));
  const byTier = (tier) => leagueRows.filter((row) => row.leagueTier === tier);
  const byTierAndPosition = (tier, groupPosition) => byTier(tier).filter((row) => row.groupPosition === groupPosition);
  const finalFour = [
    state.finals?.champion,
    state.finals?.runnerUp,
    state.finals?.thirdPlace,
    state.finals?.fourthPlace
  ].filter((teamName) => !!teamName);
  const qfLosers = (state.quarterFinalists ?? []).filter((teamName) => !finalFour.includes(teamName));
  const promotedB = byTierAndPosition("B", 1).map((row) => row.teamName);
  const promotedC = byTierAndPosition("C", 1).map((row) => row.teamName);
  const promotedD = byTierAndPosition("D", 1).map((row) => row.teamName);
  const relegatedA = byTierAndPosition("A", 4).map((row) => row.teamName);
  const relegatedB = byTierAndPosition("B", 4).map((row) => row.teamName);
  const cFourths = byTierAndPosition("C", 4);
  const cPlayoffTeams = cFourths.slice(0, 2).map((row) => row.teamName);
  const relegatedC = cFourths.slice(-2).map((row) => row.teamName);
  const cRemaining = byTierAndPosition("C", 3).map((row) => row.teamName);
  const dRemaining = byTier("D").filter((row) => row.groupPosition === 3 || !promotedD.includes(row.teamName) && !playoffLosers(state, "CD").includes(row.teamName) && !playoffWinners(state, "CD").includes(row.teamName)).map((row) => row.teamName);
  const buckets = [
    finalFour,
    qfLosers,
    [...promotedB, ...playoffWinners(state, "AB")],
    [...relegatedA, ...playoffLosers(state, "AB")],
    [...promotedC, ...playoffWinners(state, "BC")],
    [...relegatedB, ...playoffLosers(state, "BC")],
    cRemaining,
    [...promotedD, ...playoffWinners(state, "CD")],
    [...relegatedC, ...playoffLosers(state, "CD")],
    dRemaining
  ];
  const used = /* @__PURE__ */ new Set();
  const ordered = buckets.flatMap((bucket) => {
    const rows = rowsForTeams(rowsByTeam, bucket, interimOrder).filter((row) => !used.has(row.teamName));
    rows.forEach((row) => used.add(row.teamName));
    return rows;
  });
  const leftovers = leagueRows.filter((row) => !used.has(row.teamName));
  return [...ordered, ...leftovers];
};
var buildEntriesFromRows = (rows, state, basis, nationalTeams2) => {
  const previousRanks = new Map(state.entries.map((entry) => [entry.teamName, entry.rank]));
  const used = new Set(rows.map((row) => row.teamName));
  const fallbackTeams = nationalTeams2 ? createAccessOrderedTeams(nationalTeams2) : state.entries.map((entry) => entry.teamName);
  const orderedRows = [
    ...rows,
    ...fallbackTeams.filter((teamName) => !used.has(teamName)).map((teamName, index) => ({
      teamName,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      leagueTier: tierForRank(rows.length + index + 1),
      groupId: "",
      groupPosition: void 0,
      awayGoals: 0,
      awayWins: 0
    }))
  ];
  return orderedRows.map(
    (row, index) => createEntry(row.teamName, index + 1, previousRanks.get(row.teamName), basis, row, orderedRows.length)
  );
};
var UefaNationalRankingService = {
  createInitialState(nationalTeams2) {
    const orderedTeams = createAccessOrderedTeams(nationalTeams2);
    const entries = orderedTeams.map(
      (teamName, index) => createEntry(teamName, index + 1, index + 1, "ACCESS_LIST", void 0, orderedTeams.length)
    );
    return {
      entries,
      source: RANKING_SOURCE,
      lastUpdatedIso: (/* @__PURE__ */ new Date()).toISOString()
    };
  },
  ensureState(state, nationalTeams2) {
    if (state?.entries?.length) return state;
    return UefaNationalRankingService.createInitialState(nationalTeams2);
  },
  getRankedEuropeanTeams(state, nationalTeams2) {
    const ensured = UefaNationalRankingService.ensureState(state, nationalTeams2);
    const available = new Set(getEuropeanTeams(nationalTeams2));
    const ranked = ensured.entries.map((entry) => entry.teamName).filter((name) => available.has(name));
    const missing = [...available].filter((name) => !ranked.includes(name)).sort((a, b) => a.localeCompare(b));
    return [...ranked, ...missing];
  },
  updateFromNationsLeagueState(state, nationsLeagueState, nationalTeams2) {
    const accessRanks = getAccessRankMap(state, nationalTeams2);
    const leagueRows = buildLeaguePhaseRows(nationsLeagueState, accessRanks);
    const basis = nationsLeagueState.completed ? "FINAL" : "LEAGUE_PHASE";
    const rows = nationsLeagueState.completed ? buildFinalOverallRows(moveFinalFourToTop(leagueRows, nationsLeagueState.finals), nationsLeagueState) : leagueRows;
    return {
      entries: buildEntriesFromRows(rows, state, basis, nationalTeams2),
      source: nationsLeagueState.completed ? `${FINAL_SOURCE} ${nationsLeagueState.editionLabel}` : `${LEAGUE_PHASE_SOURCE} ${nationsLeagueState.editionLabel}`,
      lastUpdatedIso: (/* @__PURE__ */ new Date()).toISOString()
    };
  },
  applyResults(state, _results) {
    return state;
  }
};

// services/NationsLeagueService.ts
var LEAGUE_PHASE_DATES = [
  { day: 4, month: 8 },
  { day: 7, month: 8 },
  { day: 8, month: 9 },
  { day: 11, month: 9 },
  { day: 14, month: 10 },
  { day: 17, month: 10 }
];
var QUARTER_FINAL_DATES = [
  { day: 17, month: 2 },
  { day: 20, month: 2 }
];
var FINALS_DATES = [
  { day: 7, month: 5 },
  { day: 11, month: 5 }
];
var EMPTY_STANDING = (teamName) => ({
  teamName,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0
});
var Rng = class {
  constructor(seed) {
    this.seed = seed >>> 0 || 1;
  }
  next() {
    this.seed = this.seed * 1664525 + 1013904223 >>> 0;
    return this.seed / 4294967296;
  }
  shuffle(items) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
};
var getSeasonStartYear = (date) => date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
var isNationsLeagueSeason = (seasonStartYear) => seasonStartYear >= 2026 && (seasonStartYear - 2026) % 2 === 0;
var normalize2 = (value) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
var getPlayedGroupFixtures = (fixtures) => fixtures.filter((fixture) => fixture.played && fixture.homeGoals !== void 0 && fixture.awayGoals !== void 0);
var getExtraStats = (teamName, fixtures) => {
  let awayGoals = 0;
  let awayWins = 0;
  fixtures.forEach((fixture) => {
    if (fixture.away !== teamName) return;
    awayGoals += fixture.awayGoals ?? 0;
    if ((fixture.awayGoals ?? 0) > (fixture.homeGoals ?? 0)) awayWins += 1;
  });
  return { awayGoals, awayWins };
};
var buildHeadToHeadStanding = (teamName, tiedTeams, fixtures) => {
  const row = EMPTY_STANDING(teamName);
  fixtures.filter((fixture) => tiedTeams.has(fixture.home) && tiedTeams.has(fixture.away)).forEach((fixture) => {
    const isHome = fixture.home === teamName;
    const isAway = fixture.away === teamName;
    if (!isHome && !isAway) return;
    const goalsFor = isHome ? fixture.homeGoals ?? 0 : fixture.awayGoals ?? 0;
    const goalsAgainst = isHome ? fixture.awayGoals ?? 0 : fixture.homeGoals ?? 0;
    row.played += 1;
    row.goalsFor += goalsFor;
    row.goalsAgainst += goalsAgainst;
    if (goalsFor > goalsAgainst) {
      row.wins += 1;
      row.points += 3;
    } else if (goalsFor < goalsAgainst) {
      row.losses += 1;
    } else {
      row.draws += 1;
      row.points += 1;
    }
  });
  row.goalDifference = row.goalsFor - row.goalsAgainst;
  return row;
};
var sortStandings = (standings, groupFixtures = []) => {
  const playedFixtures = getPlayedGroupFixtures(groupFixtures);
  const byPoints = /* @__PURE__ */ new Map();
  standings.forEach((row) => {
    byPoints.set(row.points, [...byPoints.get(row.points) ?? [], row]);
  });
  return [...standings].sort((a, b) => {
    const basePoints = b.points - a.points;
    if (basePoints !== 0) return basePoints;
    const tiedRows = byPoints.get(a.points) ?? [];
    if (tiedRows.length > 1) {
      const tiedTeams = new Set(tiedRows.map((row) => row.teamName));
      const aHead = buildHeadToHeadStanding(a.teamName, tiedTeams, playedFixtures);
      const bHead = buildHeadToHeadStanding(b.teamName, tiedTeams, playedFixtures);
      const headToHead = bHead.points - aHead.points || bHead.goalDifference - aHead.goalDifference || bHead.goalsFor - aHead.goalsFor;
      if (headToHead !== 0) return headToHead;
    }
    const aExtra = getExtraStats(a.teamName, playedFixtures);
    const bExtra = getExtraStats(b.teamName, playedFixtures);
    return b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || bExtra.awayGoals - aExtra.awayGoals || b.wins - a.wins || bExtra.awayWins - aExtra.awayWins || a.teamName.localeCompare(b.teamName);
  });
};
var compareLeagueRankRows = (a, b) => a.groupPosition - b.groupPosition || b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || b.awayGoals - a.awayGoals || b.wins - a.wins || b.awayWins - a.awayWins || a.teamName.localeCompare(b.teamName);
var getLeagueRankRows = (state, tier) => state.groups.filter((group) => group.tier === tier).flatMap((group) => {
  const fixtures = state.fixtures.filter((fixture) => fixture.groupId === group.id);
  return group.standings.map((standing, index) => ({
    ...standing,
    tier,
    groupId: group.id,
    groupPosition: index + 1,
    ...getExtraStats(standing.teamName, getPlayedGroupFixtures(fixtures))
  }));
}).sort(compareLeagueRankRows);
var uniqueTeams = (teams) => teams.filter((team, index, arr) => !!team && arr.indexOf(team) === index);
var buildGroupsForTier = (tier, teams, groupCount, rng) => {
  const groups = Array.from({ length: groupCount }, (_, index) => ({
    id: `${tier}${index + 1}`,
    tier,
    teams: [],
    standings: []
  }));
  for (let start = 0; start < teams.length; start += groupCount) {
    const pot = rng.shuffle(teams.slice(start, start + groupCount));
    pot.forEach((team, index) => {
      groups[index % groupCount].teams.push(team);
    });
  }
  return groups.filter((group) => group.teams.length >= 3).map((group) => ({ ...group, standings: group.teams.map(EMPTY_STANDING) }));
};
var buildInitialGroups = (nationalTeams2, editionStartYear, rankingState, previousEdition) => {
  const europe = nationalTeams2.filter((team) => team.continent === "Europe" && team.name !== "Rosja");
  const byNormalizedName = new Map(europe.map((team) => [normalize2(team.name), team.name]));
  const rankedTeams = uniqueTeams(
    UefaNationalRankingService.getRankedEuropeanTeams(rankingState, nationalTeams2).map((name) => byNormalizedName.get(normalize2(name))).filter((name) => !!name)
  );
  const rankedIndex = new Map(rankedTeams.map((team, index) => [team, index]));
  const teamsByTier = previousEdition?.completed ? buildTeamsAfterPromotionAndRelegation(previousEdition, rankedTeams) : null;
  const rng = new Rng(editionStartYear ^ 7696122);
  const leagueA = teamsByTier?.A ?? rankedTeams.slice(0, 16);
  const leagueB = teamsByTier?.B ?? rankedTeams.slice(16, 32);
  const leagueC = teamsByTier?.C ?? rankedTeams.slice(32, 48);
  const leagueD = teamsByTier?.D ?? rankedTeams.slice(48);
  const byRank = (a, b) => (rankedIndex.get(a) ?? 999) - (rankedIndex.get(b) ?? 999);
  return [
    ...buildGroupsForTier("A", [...leagueA].sort(byRank), 4, rng),
    ...buildGroupsForTier("B", [...leagueB].sort(byRank), 4, rng),
    ...buildGroupsForTier("C", [...leagueC].sort(byRank), 4, rng),
    ...buildGroupsForTier("D", [...leagueD].sort(byRank), Math.max(1, Math.ceil(leagueD.length / 3)), rng)
  ];
};
var getTierTeams = (state, tier) => uniqueTeams(state.groups.filter((group) => group.tier === tier).flatMap((group) => group.teams));
var getGroupWinners = (state, tier) => state.groups.filter((group) => group.tier === tier).map((group) => group.standings[0]?.teamName).filter((team) => !!team);
var getGroupBottomTeams = (state, tier) => state.groups.filter((group) => group.tier === tier).map((group) => group.standings[group.standings.length - 1]).filter((row) => !!row).sort(
  (a, b) => a.points - b.points || a.goalDifference - b.goalDifference || a.goalsFor - b.goalsFor || a.teamName.localeCompare(b.teamName)
).map((row) => row.teamName);
var withoutTeams = (teams, removed) => teams.filter((team) => !removed.includes(team));
var getPlayoffWinners = (state, level) => (state.playoffs ?? []).filter((tie) => tie.level === level && tie.winner).map((tie) => tie.winner);
var getPlayoffLosers = (state, level) => (state.playoffs ?? []).filter((tie) => tie.level === level && tie.loser).map((tie) => tie.loser);
var buildTeamsAfterPromotionAndRelegation = (previousEdition, rankedTeams) => {
  const available = new Set(rankedTeams);
  const leagueA = getTierTeams(previousEdition, "A").filter((team) => available.has(team));
  const leagueB = getTierTeams(previousEdition, "B").filter((team) => available.has(team));
  const leagueC = getTierTeams(previousEdition, "C").filter((team) => available.has(team));
  const leagueD = getTierTeams(previousEdition, "D").filter((team) => available.has(team));
  const promotedB = getGroupWinners(previousEdition, "B").filter((team) => available.has(team));
  const promotedC = getGroupWinners(previousEdition, "C").filter((team) => available.has(team));
  const promotedD = getGroupWinners(previousEdition, "D").filter((team) => available.has(team));
  const relegatedA = getGroupBottomTeams(previousEdition, "A").slice(0, 4).filter((team) => available.has(team));
  const relegatedB = getGroupBottomTeams(previousEdition, "B").slice(0, 4).filter((team) => available.has(team));
  const leagueCFourths = getLeagueRankRows(previousEdition, "C").filter((row) => row.groupPosition === 4);
  const relegatedC = leagueCFourths.slice(-2).map((row) => row.teamName).filter((team) => available.has(team));
  const playoffABWinners = getPlayoffWinners(previousEdition, "AB").filter((team) => available.has(team));
  const playoffABLosers = getPlayoffLosers(previousEdition, "AB").filter((team) => available.has(team));
  const playoffBCWinners = getPlayoffWinners(previousEdition, "BC").filter((team) => available.has(team));
  const playoffBCLosers = getPlayoffLosers(previousEdition, "BC").filter((team) => available.has(team));
  const playoffCDWinners = getPlayoffWinners(previousEdition, "CD").filter((team) => available.has(team));
  const playoffCDLosers = getPlayoffLosers(previousEdition, "CD").filter((team) => available.has(team));
  const next = {
    A: uniqueTeams([...withoutTeams(withoutTeams(leagueA, relegatedA), playoffABLosers), ...promotedB, ...playoffABWinners]),
    B: uniqueTeams([...withoutTeams(withoutTeams(withoutTeams(withoutTeams(leagueB, promotedB), relegatedB), playoffABWinners), playoffBCLosers), ...relegatedA, ...playoffABLosers, ...promotedC, ...playoffBCWinners]),
    C: uniqueTeams([...withoutTeams(withoutTeams(withoutTeams(withoutTeams(leagueC, promotedC), relegatedC), playoffBCWinners), playoffCDLosers), ...relegatedB, ...playoffBCLosers, ...promotedD, ...playoffCDWinners]),
    D: uniqueTeams([...withoutTeams(withoutTeams(leagueD, promotedD), playoffCDWinners), ...relegatedC, ...playoffCDLosers])
  };
  const assigned = new Set(Object.values(next).flat());
  rankedTeams.forEach((team) => {
    if (assigned.has(team)) return;
    const target = next.A.length < 16 ? "A" : next.B.length < 16 ? "B" : next.C.length < 16 ? "C" : "D";
    next[target].push(team);
    assigned.add(team);
  });
  return next;
};
var buildGroupFixtures = (group) => {
  const teams = group.teams;
  const pairRounds4 = [
    [[0, 1], [2, 3]],
    [[0, 2], [3, 1]],
    [[0, 3], [1, 2]],
    [[1, 0], [3, 2]],
    [[2, 0], [1, 3]],
    [[3, 0], [2, 1]]
  ];
  const pairRounds3 = [
    [[0, 1]],
    [[1, 2]],
    [[2, 0]],
    [[1, 0]],
    [[2, 1]],
    [[0, 2]]
  ];
  const rounds = teams.length === 3 ? pairRounds3 : pairRounds4;
  return rounds.flatMap((pairs, roundIndex) => {
    const date = LEAGUE_PHASE_DATES[roundIndex];
    return pairs.filter(([homeIdx, awayIdx]) => teams[homeIdx] && teams[awayIdx]).map(([homeIdx, awayIdx], pairIndex) => ({
      id: `UNL_${group.id}_MD${roundIndex + 1}_${pairIndex + 1}`,
      stage: "LEAGUE_PHASE",
      round: roundIndex + 1,
      day: date.day,
      month: date.month,
      home: teams[homeIdx],
      away: teams[awayIdx],
      groupId: group.id,
      tier: group.tier,
      played: false
    }));
  });
};
var markFixturePlayed = (fixture, result) => ({
  ...fixture,
  played: true,
  matchId: result.matchId,
  homeGoals: result.homeGoals,
  awayGoals: result.awayGoals,
  homePenaltyScore: result.homePenaltyScore,
  awayPenaltyScore: result.awayPenaltyScore,
  isExtraTime: result.isExtraTime
});
var rebuildLeaguePhaseStandings = (state, fixtures = state.fixtures, touchTimestamp = false) => {
  const groups = state.groups.map((group) => ({
    ...group,
    standings: group.teams.map(EMPTY_STANDING)
  }));
  const standingByGroup = new Map(groups.map((group) => [group.id, new Map(group.standings.map((row) => [row.teamName, row]))]));
  getPlayedGroupFixtures(fixtures).forEach((fixture) => {
    if (!fixture.groupId) return;
    const table = standingByGroup.get(fixture.groupId);
    const home = table?.get(fixture.home);
    const away = table?.get(fixture.away);
    if (!home || !away) return;
    const homeGoals = fixture.homeGoals ?? 0;
    const awayGoals = fixture.awayGoals ?? 0;
    home.played += 1;
    away.played += 1;
    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;
    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;
    if (homeGoals > awayGoals) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (awayGoals > homeGoals) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  });
  return {
    ...state,
    groups: groups.map((group) => ({
      ...group,
      standings: sortStandings(group.standings, fixtures.filter((fixture) => fixture.groupId === group.id))
    })),
    fixtures,
    lastUpdatedIso: touchTimestamp ? (/* @__PURE__ */ new Date()).toISOString() : state.lastUpdatedIso
  };
};
var refreshStandingsFromResults = (state, results) => {
  if (results.length === 0) return state;
  const fixtures = state.fixtures.map((fixture) => ({ ...fixture }));
  results.forEach((result) => {
    const resultRound = Number(result.competitionLabel.match(/Kolejka (\d+)/)?.[1] ?? 0);
    const fixtureIndex = fixtures.findIndex(
      (item) => item.home === result.home && item.away === result.away && item.groupId === result.group && (resultRound > 0 ? item.round === resultRound : !item.played)
    );
    const fixture = fixtureIndex >= 0 ? fixtures[fixtureIndex] : void 0;
    if (!fixture?.groupId) return;
    fixtures[fixtureIndex] = markFixturePlayed(fixture, result);
  });
  return rebuildLeaguePhaseStandings(state, fixtures, true);
};
var getLeaguePhaseMatchDay = (state, date) => {
  const fixtures = state.fixtures.filter(
    (fixture) => fixture.stage === "LEAGUE_PHASE" && fixture.day === date.getDate() && fixture.month === date.getMonth() && !fixture.played
  );
  if (fixtures.length === 0) return null;
  const round = fixtures[0].round;
  return {
    day: date.getDate(),
    month: date.getMonth(),
    competitionLabel: `Liga Narod\xF3w UEFA ${state.editionLabel} - Kolejka ${round}`,
    matches: fixtures.map((fixture) => ({
      home: fixture.home,
      away: fixture.away,
      group: fixture.groupId,
      competitionLabel: `Liga Narod\xF3w UEFA ${state.editionLabel} - ${fixture.groupId} - Kolejka ${round}`
    }))
  };
};
var buildQuarterFinalFixtures = (state) => {
  const leagueAGroups = state.groups.filter((group) => group.tier === "A");
  const winners = leagueAGroups.map((group) => group.standings[0]?.teamName).filter(Boolean);
  const runnersUp = leagueAGroups.map((group) => group.standings[1]?.teamName).filter(Boolean);
  const pairs = winners.map((winner, index) => ({ winner, runnerUp: runnersUp[(index + 1) % runnersUp.length] })).filter((pair) => pair.winner && pair.runnerUp);
  return pairs.flatMap((pair, index) => [
    {
      id: `UNL_QF_${index + 1}_L1`,
      stage: "QUARTER_FINALS",
      round: 1,
      day: QUARTER_FINAL_DATES[0].day,
      month: QUARTER_FINAL_DATES[0].month,
      home: pair.runnerUp,
      away: pair.winner,
      tier: "A",
      played: false
    },
    {
      id: `UNL_QF_${index + 1}_L2`,
      stage: "QUARTER_FINALS",
      round: 2,
      day: QUARTER_FINAL_DATES[1].day,
      month: QUARTER_FINAL_DATES[1].month,
      home: pair.winner,
      away: pair.runnerUp,
      tier: "A",
      played: false
    }
  ]);
};
var createPlayoffTie = (level, index, highLeagueTeam, lowLeagueTeam) => {
  if (!highLeagueTeam || !lowLeagueTeam) return null;
  const id = `UNL_PO_${level}_${index + 1}`;
  const firstLegId = `${id}_L1`;
  const secondLegId = `${id}_L2`;
  const tier = level === "AB" ? "A" : level === "BC" ? "B" : "C";
  return {
    tie: {
      id,
      level,
      highLeagueTeam,
      lowLeagueTeam,
      firstLegId,
      secondLegId
    },
    fixtures: [
      {
        id: firstLegId,
        stage: "PLAYOFFS",
        round: 1,
        day: QUARTER_FINAL_DATES[0].day,
        month: QUARTER_FINAL_DATES[0].month,
        home: lowLeagueTeam,
        away: highLeagueTeam,
        tier,
        playoffTieId: id,
        playoffLevel: level,
        played: false
      },
      {
        id: secondLegId,
        stage: "PLAYOFFS",
        round: 2,
        day: QUARTER_FINAL_DATES[1].day,
        month: QUARTER_FINAL_DATES[1].month,
        home: highLeagueTeam,
        away: lowLeagueTeam,
        tier,
        playoffTieId: id,
        playoffLevel: level,
        played: false
      }
    ]
  };
};
var buildPlayoffTiesAndFixtures = (state) => {
  const aThirds = getLeagueRankRows(state, "A").filter((row) => row.groupPosition === 3);
  const bRunnersUp = getLeagueRankRows(state, "B").filter((row) => row.groupPosition === 2);
  const bThirds = getLeagueRankRows(state, "B").filter((row) => row.groupPosition === 3);
  const cRunnersUp = getLeagueRankRows(state, "C").filter((row) => row.groupPosition === 2);
  const cFourths = getLeagueRankRows(state, "C").filter((row) => row.groupPosition === 4).slice(0, 2);
  const dRunnersUp = getLeagueRankRows(state, "D").filter((row) => row.groupPosition === 2);
  const created = [
    ...aThirds.map((row, index) => createPlayoffTie("AB", index, row.teamName, bRunnersUp[index]?.teamName)),
    ...bThirds.map((row, index) => createPlayoffTie("BC", index, row.teamName, cRunnersUp[index]?.teamName)),
    ...cFourths.map((row, index) => createPlayoffTie("CD", index, row.teamName, dRunnersUp[index]?.teamName))
  ].filter((item) => !!item);
  return {
    ties: created.map((item) => item.tie),
    fixtures: created.flatMap((item) => item.fixtures)
  };
};
var getFirstLegForFixture = (state, fixture) => {
  if (fixture.round !== 2) return void 0;
  if (fixture.stage === "PLAYOFFS") {
    const tie = state.playoffs?.find((item) => item.secondLegId === fixture.id);
    return tie ? state.fixtures.find((item) => item.id === tie.firstLegId) : void 0;
  }
  if (fixture.stage === "QUARTER_FINALS") {
    return state.fixtures.find(
      (item) => item.stage === "QUARTER_FINALS" && item.round === 1 && item.home === fixture.away && item.away === fixture.home
    );
  }
  return void 0;
};
var getKnockoutContextForFixture = (state, fixture) => {
  if (fixture.stage === "FINALS") {
    return { type: "SINGLE_MATCH" };
  }
  const firstLeg = getFirstLegForFixture(state, fixture);
  if (!firstLeg || firstLeg.homeGoals === void 0 || firstLeg.awayGoals === void 0) return void 0;
  return {
    type: "AGGREGATE_SECOND_LEG",
    firstLegHome: firstLeg.home,
    firstLegAway: firstLeg.away,
    firstLegHomeGoals: firstLeg.homeGoals,
    firstLegAwayGoals: firstLeg.awayGoals
  };
};
var getKnockoutMatchDay = (state, date) => {
  const fixtures = state.fixtures.filter(
    (fixture) => (fixture.stage === "QUARTER_FINALS" || fixture.stage === "PLAYOFFS" || fixture.stage === "FINALS") && fixture.day === date.getDate() && fixture.month === date.getMonth() && !fixture.played
  );
  if (fixtures.length === 0) return null;
  const hasFinals = fixtures.some((fixture) => fixture.stage === "FINALS");
  const hasQuarterFinals = fixtures.some((fixture) => fixture.stage === "QUARTER_FINALS");
  const hasPlayoffs = fixtures.some((fixture) => fixture.stage === "PLAYOFFS");
  const label = hasFinals ? `Liga Narod\xF3w UEFA ${state.editionLabel} - Fina\u0142y` : hasQuarterFinals && hasPlayoffs ? `Liga Narod\xF3w UEFA ${state.editionLabel} - \u0106wier\u0107fina\u0142y i bara\u017Ce` : hasQuarterFinals ? `Liga Narod\xF3w UEFA ${state.editionLabel} - \u0106wier\u0107fina\u0142y` : `Liga Narod\xF3w UEFA ${state.editionLabel} - Bara\u017Ce`;
  return {
    day: date.getDate(),
    month: date.getMonth(),
    competitionLabel: label,
    matches: fixtures.map((fixture) => ({
      home: fixture.home,
      away: fixture.away,
      group: fixture.stage === "QUARTER_FINALS" ? "QF" : fixture.stage === "PLAYOFFS" ? fixture.playoffLevel : "FINALS",
      competitionLabel: fixture.stage === "PLAYOFFS" ? `Liga Narod\xF3w UEFA ${state.editionLabel} - Bara\u017C ${fixture.playoffLevel} - Mecz ${fixture.round}` : label,
      knockoutContext: getKnockoutContextForFixture(state, fixture)
    }))
  };
};
var getWinner = (result) => result.homePenaltyScore !== void 0 && result.awayPenaltyScore !== void 0 ? result.homePenaltyScore > result.awayPenaltyScore ? result.home : result.away : result.homeGoals >= result.awayGoals ? result.home : result.away;
var getLoser = (result) => getWinner(result) === result.home ? result.away : result.home;
var getAggregateWinner = (firstLeg, secondLeg) => {
  const firstHomeGoals = firstLeg.homeGoals ?? 0;
  const firstAwayGoals = firstLeg.awayGoals ?? 0;
  const secondHomeGoals = secondLeg.homeGoals ?? 0;
  const secondAwayGoals = secondLeg.awayGoals ?? 0;
  const secondLegHomeAggregate = firstAwayGoals + secondHomeGoals;
  const secondLegAwayAggregate = firstHomeGoals + secondAwayGoals;
  if (secondLegHomeAggregate > secondLegAwayAggregate) return secondLeg.home;
  if (secondLegAwayAggregate > secondLegHomeAggregate) return secondLeg.away;
  if (secondLeg.homePenaltyScore !== void 0 && secondLeg.awayPenaltyScore !== void 0) {
    return secondLeg.homePenaltyScore > secondLeg.awayPenaltyScore ? secondLeg.home : secondLeg.away;
  }
  return secondLeg.home;
};
var refreshKnockout = (state, date, results) => {
  if (results.length === 0) return state;
  let fixtures = state.fixtures.map((fixture) => ({ ...fixture }));
  results.forEach((result) => {
    const fixtureIndex = fixtures.findIndex(
      (item) => item.home === result.home && item.away === result.away && item.day === date.getDate() && item.month === date.getMonth() && !item.played
    );
    if (fixtureIndex >= 0) fixtures[fixtureIndex] = markFixturePlayed(fixtures[fixtureIndex], result);
  });
  let nextState = { ...state, fixtures, lastUpdatedIso: (/* @__PURE__ */ new Date()).toISOString() };
  const playoffSecondLegs = fixtures.filter((fixture) => fixture.stage === "PLAYOFFS" && fixture.round === 2);
  if (playoffSecondLegs.length > 0 && playoffSecondLegs.every((fixture) => fixture.played)) {
    const playoffs = (nextState.playoffs ?? []).map((tie) => {
      if (tie.winner && tie.loser) return tie;
      const firstLeg = fixtures.find((fixture) => fixture.id === tie.firstLegId);
      const secondLeg = fixtures.find((fixture) => fixture.id === tie.secondLegId);
      if (!firstLeg || !secondLeg || !firstLeg.played || !secondLeg.played) return tie;
      const winner = getAggregateWinner(firstLeg, secondLeg);
      return {
        ...tie,
        winner,
        loser: winner === tie.highLeagueTeam ? tie.lowLeagueTeam : tie.highLeagueTeam
      };
    });
    nextState = { ...nextState, playoffs };
  }
  const qfSecondLegs = fixtures.filter((fixture) => fixture.stage === "QUARTER_FINALS" && fixture.round === 2);
  if (qfSecondLegs.length > 0 && qfSecondLegs.every((fixture) => fixture.played) && nextState.semiFinalists.length === 0) {
    const winners = qfSecondLegs.map((secondLeg) => {
      const firstLeg = fixtures.find(
        (fixture) => fixture.stage === "QUARTER_FINALS" && fixture.round === 1 && fixture.home === secondLeg.away && fixture.away === secondLeg.home
      );
      return firstLeg ? getAggregateWinner(firstLeg, secondLeg) : secondLeg.home;
    });
    const semiFixtures2 = [
      {
        id: "UNL_SF_1",
        stage: "FINALS",
        round: 1,
        day: FINALS_DATES[0].day,
        month: FINALS_DATES[0].month,
        home: winners[0],
        away: winners[3] ?? winners[1],
        tier: "A",
        played: false
      },
      {
        id: "UNL_SF_2",
        stage: "FINALS",
        round: 1,
        day: FINALS_DATES[0].day,
        month: FINALS_DATES[0].month,
        home: winners[1],
        away: winners[2],
        tier: "A",
        played: false
      }
    ].filter((fixture) => fixture.home && fixture.away);
    fixtures = [...fixtures, ...semiFixtures2];
    nextState = {
      ...nextState,
      stage: "FINALS",
      semiFinalists: winners,
      finals: {
        semiFinalists: winners,
        finalists: [],
        thirdPlaceTeams: []
      },
      fixtures
    };
  }
  const semiFixtures = nextState.fixtures.filter((fixture) => fixture.stage === "FINALS" && fixture.round === 1);
  if (semiFixtures.length > 0 && semiFixtures.every((fixture) => fixture.played) && nextState.finals && nextState.finals.finalists.length === 0) {
    const semiResults = results.filter((result) => semiFixtures.some((fixture) => fixture.home === result.home && fixture.away === result.away));
    const finalists = semiResults.map(getWinner);
    const thirdPlaceTeams = semiResults.map(getLoser);
    const finalFixtures2 = [
      {
        id: "UNL_THIRD",
        stage: "FINALS",
        round: 2,
        day: FINALS_DATES[1].day,
        month: FINALS_DATES[1].month,
        home: thirdPlaceTeams[0],
        away: thirdPlaceTeams[1],
        tier: "A",
        played: false
      },
      {
        id: "UNL_FINAL",
        stage: "FINALS",
        round: 2,
        day: FINALS_DATES[1].day,
        month: FINALS_DATES[1].month,
        home: finalists[0],
        away: finalists[1],
        tier: "A",
        played: false
      }
    ].filter((fixture) => fixture.home && fixture.away);
    nextState = {
      ...nextState,
      finals: {
        ...nextState.finals,
        finalists,
        thirdPlaceTeams
      },
      fixtures: [...nextState.fixtures, ...finalFixtures2]
    };
  }
  const finalFixtures = nextState.fixtures.filter((fixture) => fixture.stage === "FINALS" && fixture.round === 2);
  if (finalFixtures.length > 0 && finalFixtures.every((fixture) => fixture.played) && nextState.finals && !nextState.finals.champion) {
    const finalFixture = finalFixtures.find((fixture) => fixture.id === "UNL_FINAL");
    const thirdFixture = finalFixtures.find((fixture) => fixture.id === "UNL_THIRD");
    const finalResult = results.find((result) => result.home === finalFixture?.home && result.away === finalFixture?.away);
    const thirdResult = results.find((result) => result.home === thirdFixture?.home && result.away === thirdFixture?.away);
    nextState = {
      ...nextState,
      stage: "COMPLETE",
      completed: true,
      finals: {
        ...nextState.finals,
        champion: finalResult ? getWinner(finalResult) : void 0,
        runnerUp: finalResult ? getLoser(finalResult) : void 0,
        thirdPlace: thirdResult ? getWinner(thirdResult) : void 0,
        fourthPlace: thirdResult ? getLoser(thirdResult) : void 0
      }
    };
  }
  return nextState;
};
var NationsLeagueService = {
  isNationsLeagueSeason,
  repairLeaguePhaseStandings(state) {
    return rebuildLeaguePhaseStandings(state);
  },
  isPotentialMatchDate(date) {
    const seasonStartYear = getSeasonStartYear(date);
    if (!isNationsLeagueSeason(seasonStartYear)) return false;
    const day = date.getDate();
    const month = date.getMonth();
    return [...LEAGUE_PHASE_DATES, ...QUARTER_FINAL_DATES, ...FINALS_DATES].some(
      (slot) => slot.day === day && slot.month === month
    );
  },
  createInitialState(nationalTeams2, editionStartYear, rankingState, previousEdition) {
    const groups = buildInitialGroups(nationalTeams2, editionStartYear, rankingState, previousEdition);
    const fixtures = groups.flatMap(buildGroupFixtures);
    return {
      editionStartYear,
      editionLabel: `${editionStartYear}/${String(editionStartYear + 1).slice(2)}`,
      stage: "LEAGUE_PHASE",
      groups,
      fixtures,
      playoffs: [],
      quarterFinalists: [],
      semiFinalists: [],
      finals: null,
      completed: false
    };
  },
  ensureState(state, date, nationalTeams2, rankingState, previousEdition) {
    const seasonStartYear = getSeasonStartYear(date);
    if (!isNationsLeagueSeason(seasonStartYear)) return state;
    if (state?.editionStartYear === seasonStartYear) return state;
    return NationsLeagueService.createInitialState(nationalTeams2, seasonStartYear, rankingState, previousEdition ?? state);
  },
  getMatchDayForDate(state, date) {
    if (!state || state.completed) return null;
    const seasonStartYear = getSeasonStartYear(date);
    if (seasonStartYear !== state.editionStartYear) return null;
    if (state.stage === "LEAGUE_PHASE") return getLeaguePhaseMatchDay(state, date);
    return getKnockoutMatchDay(state, date);
  },
  applyResults(state, date, results) {
    if (state.stage === "LEAGUE_PHASE") {
      const next = refreshStandingsFromResults(state, results);
      const leagueFixtures = next.fixtures.filter((fixture) => fixture.stage === "LEAGUE_PHASE");
      if (leagueFixtures.length > 0 && leagueFixtures.every((fixture) => fixture.played)) {
        const qfFixtures = buildQuarterFinalFixtures(next);
        const playoffData = buildPlayoffTiesAndFixtures(next);
        return {
          ...next,
          stage: "QUARTER_FINALS",
          quarterFinalists: uniqueTeams(qfFixtures.flatMap((fixture) => [fixture.home, fixture.away])),
          playoffs: playoffData.ties,
          fixtures: [...next.fixtures, ...qfFixtures, ...playoffData.fixtures]
        };
      }
      return next;
    }
    return refreshKnockout(state, date, results);
  }
};

// services/EuroQualifiersService.ts
var GROUP_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
var EURO_HOSTS_BY_YEAR = {
  2028: ["Anglia", "Irlandia", "Szkocja", "Walia"],
  2032: ["Turcja", "W\u0142ochy"],
  2036: ["Szwecja", "Norwegia"]
};
var EURO_HOST_ANNOUNCEMENT_YEARS_BEFORE = 6;
var FIVE_TEAM_GROUP_COUNT = 6;
var MATCH_DATES = [
  { yearOffset: -1, day: 17, month: 2 },
  { yearOffset: -1, day: 20, month: 2 },
  { yearOffset: -1, day: 7, month: 5 },
  { yearOffset: -1, day: 11, month: 5 },
  { yearOffset: -1, day: 4, month: 8 },
  { yearOffset: -1, day: 7, month: 8 },
  { yearOffset: -1, day: 8, month: 9 },
  { yearOffset: -1, day: 11, month: 9 },
  { yearOffset: -1, day: 14, month: 10 },
  { yearOffset: -1, day: 17, month: 10 }
];
var FOUR_TEAM_GROUP_DATE_INDEXES = [4, 5, 6, 7, 8, 9];
var PLAYOFF_DATES = [
  { day: 17, month: 2 },
  { day: 20, month: 2 }
];
var LEGACY_GROUP_RECOVERY_DAYS = [18, 19, 20, 21];
var Rng2 = class {
  constructor(seed) {
    this.seed = seed >>> 0 || 1;
  }
  next() {
    this.seed = this.seed * 1664525 + 1013904223 >>> 0;
    return this.seed / 4294967296;
  }
  shuffle(items) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
};
var EMPTY_STANDING2 = (teamName) => ({
  teamName,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0
});
var normalize3 = (value) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
var uniqueTeams2 = (teams) => teams.filter((team, index, arr) => !!team && arr.indexOf(team) === index);
var isEuroTournamentYear = (year) => year >= 2028 && (year - 2028) % 4 === 0;
var getTournamentYearForDate = (date) => {
  let year = date.getFullYear();
  while (!isEuroTournamentYear(year)) year += 1;
  return year;
};
var getHostsForTournament = (tournamentYear, nationalTeams2) => {
  const hostNames = EURO_HOSTS_BY_YEAR[tournamentYear] ?? [];
  if (hostNames.length === 0) return [];
  const available = new Map(nationalTeams2.map((team) => [normalize3(team.name), team.name]));
  return hostNames.map((name) => available.get(normalize3(name))).filter((name) => !!name);
};
var getAnnouncedHostsForTournament = (tournamentYear, nationalTeams2, hostAnnouncements = []) => {
  const announced = hostAnnouncements.find((entry) => entry.tournamentYear === tournamentYear)?.hosts ?? [];
  if (announced.length > 0) {
    const available = new Map(nationalTeams2.map((team) => [normalize3(team.name), team.name]));
    return announced.map((name) => available.get(normalize3(name))).filter((name) => !!name);
  }
  return getHostsForTournament(tournamentYear, nationalTeams2);
};
var createHostAnnouncement = (nationalTeams2, tournamentYear, existingAnnouncements = []) => {
  const presetHosts = getHostsForTournament(tournamentYear, nationalTeams2);
  if (presetHosts.length > 0) {
    return {
      tournamentYear,
      hosts: presetHosts,
      announcedIso: new Date(tournamentYear - EURO_HOST_ANNOUNCEMENT_YEARS_BEFORE, 11, 6).toISOString()
    };
  }
  const recentlyHosted = new Set(
    existingAnnouncements.filter((entry) => entry.tournamentYear < tournamentYear && entry.tournamentYear >= tournamentYear - 12).flatMap((entry) => entry.hosts)
  );
  const rng = new Rng2(tournamentYear ^ 920128);
  const candidates = nationalTeams2.filter((team) => team.continent === "Europe" && team.name !== "Rosja" && !recentlyHosted.has(team.name)).sort((a, b) => {
    const bScore = (b.reputation ?? 0) * 1e5 + (b.capacity ?? 0);
    const aScore = (a.reputation ?? 0) * 1e5 + (a.capacity ?? 0);
    return bScore - aScore || a.name.localeCompare(b.name);
  });
  const fallbackCandidates = nationalTeams2.filter((team) => team.continent === "Europe" && team.name !== "Rosja").sort((a, b) => (b.reputation ?? 0) - (a.reputation ?? 0) || a.name.localeCompare(b.name));
  const pool = candidates.length >= 2 ? candidates : fallbackCandidates;
  const hostCountRoll = rng.next();
  const hostCount = hostCountRoll < 0.18 ? 1 : hostCountRoll < 0.92 ? 2 : 4;
  const hosts = rng.shuffle(pool.slice(0, Math.max(12, hostCount * 4))).slice(0, hostCount).map((team) => team.name);
  return {
    tournamentYear,
    hosts,
    announcedIso: new Date(tournamentYear - EURO_HOST_ANNOUNCEMENT_YEARS_BEFORE, 11, 6).toISOString()
  };
};
var buildBlockedDates = (nationsLeagueState) => {
  const blocked = /* @__PURE__ */ new Map();
  (nationsLeagueState?.fixtures ?? []).filter((fixture) => !fixture.played).forEach((fixture) => {
    const key = `${fixture.day}-${fixture.month}`;
    if (!blocked.has(key)) blocked.set(key, /* @__PURE__ */ new Set());
    blocked.get(key)?.add(fixture.home);
    blocked.get(key)?.add(fixture.away);
  });
  return blocked;
};
var hasDateBlock = (blocked, day, month, team) => blocked.get(`${day}-${month}`)?.has(team) ?? false;
var isLegacyGroupRecoveryDate = (date, tournamentYear) => date.getFullYear() === tournamentYear - 1 && date.getMonth() === 10 && LEGACY_GROUP_RECOVERY_DAYS.includes(date.getDate());
var getTimeForFixture = (fixture) => new Date(fixture.year, fixture.month, fixture.day).getTime();
var getGroupStageCutoffTime = (state) => {
  const groupFixtureTimes = state.fixtures.filter((fixture) => (fixture.stage ?? "GROUP_STAGE") === "GROUP_STAGE").map(getTimeForFixture);
  const latestScheduledTime = groupFixtureTimes.length > 0 ? Math.max(...groupFixtureTimes) : new Date(state.tournamentYear - 1, 10, 17).getTime();
  const latestRecoveryTime = new Date(
    state.tournamentYear - 1,
    10,
    Math.max(...LEGACY_GROUP_RECOVERY_DAYS)
  ).getTime();
  return Math.max(latestScheduledTime, latestRecoveryTime);
};
var shouldForceResolveGroupStage = (state, date) => state.stage === "GROUP_STAGE" && state.drawCompleted && date.getTime() > getGroupStageCutoffTime(state);
var countBlockedMatchDates = (blocked, team) => MATCH_DATES.filter((slot) => hasDateBlock(blocked, slot.day, slot.month, team)).length;
var createGroups = (rankedTeams, hostTeams, blocked, seed) => {
  const rng = new Rng2(seed ^ 925736);
  const targetSizes = GROUP_LABELS.map((label, index) => ({
    id: label,
    targetSize: index < FIVE_TEAM_GROUP_COUNT ? 5 : 4,
    teams: [],
    hostTeams: []
  }));
  const hostSet = new Set(hostTeams);
  const blockedScore = new Map(rankedTeams.map((team) => [team, countBlockedMatchDates(blocked, team)]));
  const ordered = uniqueTeams2([
    ...hostTeams,
    ...rankedTeams.filter((team) => !hostSet.has(team)).sort((a, b) => (blockedScore.get(b) ?? 0) - (blockedScore.get(a) ?? 0))
  ]);
  ordered.forEach((team) => {
    const isHost = hostSet.has(team);
    const prefersSmallGroup = isHost || (blockedScore.get(team) ?? 0) > 0;
    const candidates = targetSizes.filter((group) => group.teams.length < group.targetSize).filter((group) => !isHost || group.hostTeams.length === 0).sort((a, b) => {
      const aSmall = a.targetSize === 4 ? 0 : 1;
      const bSmall = b.targetSize === 4 ? 0 : 1;
      const groupSizePreference = prefersSmallGroup ? aSmall - bSmall : b.targetSize - a.targetSize;
      return groupSizePreference || a.teams.length - b.teams.length || a.id.localeCompare(b.id);
    });
    const selected = candidates[0] ?? targetSizes.find((group) => group.teams.length < group.targetSize);
    if (!selected) return;
    selected.teams.push(team);
    if (isHost) selected.hostTeams.push(team);
  });
  return targetSizes.map((group) => ({
    id: group.id,
    teams: rng.shuffle(group.teams),
    hostTeams: group.hostTeams,
    standings: group.teams.map(EMPTY_STANDING2)
  }));
};
var buildRoundRobinRounds = (teams, rng) => {
  const shuffled = rng.shuffle(teams);
  const rotation = shuffled.length % 2 === 0 ? shuffled : [...shuffled, null];
  const firstLeg = [];
  for (let roundIndex = 0; roundIndex < rotation.length - 1; roundIndex += 1) {
    const matches = [];
    for (let pairIndex = 0; pairIndex < rotation.length / 2; pairIndex += 1) {
      const first = rotation[pairIndex];
      const second = rotation[rotation.length - 1 - pairIndex];
      if (!first || !second) continue;
      const reverse = (roundIndex + pairIndex) % 2 === 1;
      matches.push(reverse ? { home: second, away: first } : { home: first, away: second });
    }
    firstLeg.push(matches);
    rotation.splice(1, 0, rotation.pop());
  }
  const secondLeg = firstLeg.map((round) => round.map((match) => ({ home: match.away, away: match.home })));
  return [...firstLeg, ...secondLeg];
};
var assignRoundsToDates = (rounds, allowedDateIndexes, blocked) => {
  const assigned = new Array(allowedDateIndexes.length);
  const usedRounds = /* @__PURE__ */ new Set();
  const isCompatible = (round, dateIndex) => {
    const slot = MATCH_DATES[allowedDateIndexes[dateIndex]];
    return round.every(
      (match) => !hasDateBlock(blocked, slot.day, slot.month, match.home) && !hasDateBlock(blocked, slot.day, slot.month, match.away)
    );
  };
  const fill = () => {
    if (usedRounds.size === rounds.length) return true;
    let selectedDateIndex = -1;
    let selectedCandidates = [];
    for (let dateIndex = 0; dateIndex < allowedDateIndexes.length; dateIndex += 1) {
      if (assigned[dateIndex]) continue;
      const candidates = rounds.map((_, roundIndex) => roundIndex).filter((roundIndex) => !usedRounds.has(roundIndex) && isCompatible(rounds[roundIndex], dateIndex));
      if (candidates.length === 0) return false;
      if (selectedDateIndex < 0 || candidates.length < selectedCandidates.length) {
        selectedDateIndex = dateIndex;
        selectedCandidates = candidates;
      }
    }
    for (const roundIndex of selectedCandidates) {
      assigned[selectedDateIndex] = rounds[roundIndex];
      usedRounds.add(roundIndex);
      if (fill()) return true;
      usedRounds.delete(roundIndex);
      assigned[selectedDateIndex] = void 0;
    }
    return false;
  };
  return fill() ? assigned : null;
};
var buildFixturesForGroup = (group, tournamentYear, blocked, seed) => {
  const rng = new Rng2(seed ^ group.id.charCodeAt(0));
  const allowedDateIndexes = group.teams.length <= 4 ? FOUR_TEAM_GROUP_DATE_INDEXES : MATCH_DATES.map((_, index) => index);
  const generatedRounds = buildRoundRobinRounds(group.teams, rng);
  const scheduledRounds = assignRoundsToDates(generatedRounds, allowedDateIndexes, blocked) ?? generatedRounds;
  return scheduledRounds.flatMap((matches, roundIndex) => {
    const slot = MATCH_DATES[allowedDateIndexes[roundIndex]];
    return matches.map((match, matchIndex2) => ({
      id: `EUROQ_${tournamentYear}_${group.id}_R${roundIndex + 1}_${matchIndex2 + 1}`,
      year: tournamentYear + slot.yearOffset,
      day: slot.day,
      month: slot.month,
      round: roundIndex + 1,
      home: match.home,
      away: match.away,
      groupId: group.id,
      stage: "GROUP_STAGE",
      played: false
    }));
  });
};
var compareStandings = (a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || b.wins - a.wins || a.teamName.localeCompare(b.teamName);
var getWinner2 = (result) => result.homePenaltyScore !== void 0 && result.awayPenaltyScore !== void 0 ? result.homePenaltyScore > result.awayPenaltyScore ? result.home : result.away : result.homeGoals >= result.awayGoals ? result.home : result.away;
var getLoser2 = (result) => getWinner2(result) === result.home ? result.away : result.home;
var markFixturePlayed2 = (fixture, result) => ({
  ...fixture,
  played: true,
  matchId: result.matchId,
  homeGoals: result.homeGoals,
  awayGoals: result.awayGoals,
  homePenaltyScore: result.homePenaltyScore,
  awayPenaltyScore: result.awayPenaltyScore,
  isExtraTime: result.isExtraTime,
  winner: getWinner2(result),
  loser: getLoser2(result)
});
var resolveAggregateWinner = (firstLeg, secondLeg) => {
  if (firstLeg.homeGoals === void 0 || firstLeg.awayGoals === void 0 || secondLeg.homeGoals === void 0 || secondLeg.awayGoals === void 0) {
    return {};
  }
  const aggregateFirstLegHome = firstLeg.homeGoals + secondLeg.awayGoals;
  const aggregateFirstLegAway = firstLeg.awayGoals + secondLeg.homeGoals;
  if (aggregateFirstLegHome > aggregateFirstLegAway) return { winner: firstLeg.home, loser: firstLeg.away };
  if (aggregateFirstLegAway > aggregateFirstLegHome) return { winner: firstLeg.away, loser: firstLeg.home };
  if (secondLeg.homePenaltyScore !== void 0 && secondLeg.awayPenaltyScore !== void 0) {
    const winner = secondLeg.homePenaltyScore > secondLeg.awayPenaltyScore ? secondLeg.home : secondLeg.away;
    return { winner, loser: winner === firstLeg.home ? firstLeg.away : firstLeg.home };
  }
  return { winner: secondLeg.winner, loser: secondLeg.loser };
};
var refreshStandings = (state, results) => {
  const fixtures = state.fixtures.map((fixture) => ({ ...fixture }));
  const groups = state.groups.map((group) => ({
    ...group,
    standings: group.teams.map(EMPTY_STANDING2)
  }));
  const standingsByGroup = new Map(groups.map((group) => [group.id, new Map(group.standings.map((row) => [row.teamName, row]))]));
  results.forEach((result) => {
    const fixtureIndex = fixtures.findIndex(
      (fixture) => !fixture.played && fixture.home === result.home && fixture.away === result.away && fixture.groupId === result.group
    );
    if (fixtureIndex < 0) return;
    fixtures[fixtureIndex] = markFixturePlayed2(fixtures[fixtureIndex], result);
  });
  fixtures.forEach((fixture) => {
    if (fixture.stage !== "GROUP_STAGE" || !fixture.played) return;
    if (fixture.homeGoals === void 0 || fixture.awayGoals === void 0) return;
    const table = standingsByGroup.get(fixture.groupId);
    const home = table?.get(fixture.home);
    const away = table?.get(fixture.away);
    if (!home || !away) return;
    home.played += 1;
    away.played += 1;
    home.goalsFor += fixture.homeGoals;
    home.goalsAgainst += fixture.awayGoals;
    away.goalsFor += fixture.awayGoals;
    away.goalsAgainst += fixture.homeGoals;
    if (fixture.homeGoals > fixture.awayGoals) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (fixture.awayGoals > fixture.homeGoals) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  });
  return {
    ...state,
    fixtures,
    groups: groups.map((group) => ({
      ...group,
      standings: [...group.standings].sort(compareStandings)
    })),
    lastUpdatedIso: (/* @__PURE__ */ new Date()).toISOString()
  };
};
var bestRows = (rows) => [...rows].sort(compareStandings);
var buildPathPlayoffData = (state, playoffTeams, pathCount) => {
  const selectedTeams = playoffTeams.slice(0, pathCount * 4);
  const paths = [];
  const fixtures = [];
  for (let pathIndex = 0; pathIndex < pathCount; pathIndex += 1) {
    const teams = selectedTeams.slice(pathIndex * 4, pathIndex * 4 + 4);
    if (teams.length < 4) continue;
    const label = String.fromCharCode(65 + pathIndex);
    const id = `EUROQ_PO_${state.tournamentYear}_${label}`;
    const sf1Id = `${id}_SF1`;
    const sf2Id = `${id}_SF2`;
    paths.push({
      id,
      label,
      mode: "PATH",
      teams,
      semiFinalFixtureIds: [sf1Id, sf2Id]
    });
    fixtures.push(
      {
        id: sf1Id,
        year: state.tournamentYear,
        day: PLAYOFF_DATES[0].day,
        month: PLAYOFF_DATES[0].month,
        round: 1,
        home: teams[0],
        away: teams[3],
        groupId: label,
        stage: "PLAYOFFS",
        playoffPathId: id,
        played: false
      },
      {
        id: sf2Id,
        year: state.tournamentYear,
        day: PLAYOFF_DATES[0].day,
        month: PLAYOFF_DATES[0].month,
        round: 1,
        home: teams[1],
        away: teams[2],
        groupId: label,
        stage: "PLAYOFFS",
        playoffPathId: id,
        played: false
      }
    );
  }
  return { paths, fixtures };
};
var buildTiePlayoffData = (state, playoffTeams) => {
  const selectedTeams = playoffTeams.slice(0, 8);
  const paths = [];
  const fixtures = [];
  for (let tieIndex = 0; tieIndex < 4; tieIndex += 1) {
    const homeSeed = selectedTeams[tieIndex];
    const awaySeed = selectedTeams[selectedTeams.length - 1 - tieIndex];
    if (!homeSeed || !awaySeed) continue;
    const label = String.fromCharCode(65 + tieIndex);
    const id = `EUROQ_PO_${state.tournamentYear}_${label}`;
    const firstLegId = `${id}_L1`;
    const secondLegId = `${id}_L2`;
    paths.push({
      id,
      label,
      mode: "TIE",
      teams: [homeSeed, awaySeed],
      semiFinalFixtureIds: [],
      tieFixtureIds: [firstLegId, secondLegId]
    });
    fixtures.push(
      {
        id: firstLegId,
        year: state.tournamentYear,
        day: PLAYOFF_DATES[0].day,
        month: PLAYOFF_DATES[0].month,
        round: 1,
        home: awaySeed,
        away: homeSeed,
        groupId: label,
        stage: "PLAYOFFS",
        playoffPathId: id,
        played: false
      },
      {
        id: secondLegId,
        year: state.tournamentYear,
        day: PLAYOFF_DATES[1].day,
        month: PLAYOFF_DATES[1].month,
        round: 2,
        home: homeSeed,
        away: awaySeed,
        groupId: label,
        stage: "PLAYOFFS",
        playoffPathId: id,
        played: false
      }
    );
  }
  return { paths, fixtures };
};
var finalizeGroupStage = (state, rankingState) => {
  const winners = state.groups.map((group) => group.standings[0]?.teamName).filter((team) => !!team);
  const runnersUp = bestRows(state.groups.map((group) => group.standings[1]).filter((row) => !!row));
  const directRunnersUp = runnersUp.slice(0, 8).map((row) => row.teamName);
  const directQualifiers = uniqueTeams2([...winners, ...directRunnersUp]);
  const hostReservedQualifiers = state.hostTeams.filter((team) => !directQualifiers.includes(team)).sort(
    (a, b) => (rankingState?.entries.find((entry) => entry.teamName === a)?.rank ?? 999) - (rankingState?.entries.find((entry) => entry.teamName === b)?.rank ?? 999)
  ).slice(0, 2);
  const qualifiedTeams = uniqueTeams2([...directQualifiers, ...hostReservedQualifiers]);
  const runnerUpPlayoffPool = runnersUp.slice(8).map((row) => row.teamName);
  const rankingFallback = (rankingState?.entries ?? []).map((entry) => entry.teamName).filter((team) => !qualifiedTeams.includes(team) && !runnerUpPlayoffPool.includes(team));
  const remainingSlots = Math.max(0, 24 - qualifiedTeams.length);
  const usesTwoLeggedTies = hostReservedQualifiers.length === 0;
  const playoffTeamCount = usesTwoLeggedTies ? 8 : remainingSlots * 4;
  const playoffTeams = uniqueTeams2([...runnerUpPlayoffPool, ...rankingFallback]).slice(0, playoffTeamCount);
  const playoffData = usesTwoLeggedTies ? buildTiePlayoffData(state, playoffTeams) : buildPathPlayoffData(state, playoffTeams, remainingSlots);
  return {
    ...state,
    stage: "PLAYOFFS",
    directQualifiers,
    hostReservedQualifiers,
    qualifiedTeams,
    playoffTeams,
    playoffPaths: playoffData.paths,
    fixtures: [
      ...state.fixtures.filter((fixture) => (fixture.stage ?? "GROUP_STAGE") === "GROUP_STAGE"),
      ...playoffData.fixtures
    ],
    completed: false,
    lastUpdatedIso: (/* @__PURE__ */ new Date()).toISOString()
  };
};
var refreshPlayoffs = (state, results) => {
  if (results.length === 0) return state;
  let fixtures = state.fixtures.map((fixture) => ({ ...fixture }));
  results.forEach((result) => {
    const fixtureIndex = fixtures.findIndex(
      (fixture) => fixture.stage === "PLAYOFFS" && !fixture.played && fixture.home === result.home && fixture.away === result.away
    );
    if (fixtureIndex >= 0) fixtures[fixtureIndex] = markFixturePlayed2(fixtures[fixtureIndex], result);
  });
  let playoffPaths = state.playoffPaths.map((path) => ({ ...path }));
  const tiePaths = playoffPaths.filter((path) => path.mode === "TIE");
  if (tiePaths.length > 0) {
    playoffPaths = playoffPaths.map((path) => {
      if (path.mode !== "TIE" || path.winner) return path;
      const [firstLegId, secondLegId] = path.tieFixtureIds ?? [];
      const firstLeg = fixtures.find((fixture) => fixture.id === firstLegId);
      const secondLeg = fixtures.find((fixture) => fixture.id === secondLegId);
      if (!firstLeg?.played || !secondLeg?.played) return path;
      const { winner, loser } = resolveAggregateWinner(firstLeg, secondLeg);
      if (winner && secondLeg.winner !== winner) {
        fixtures = fixtures.map((fixture) => fixture.id === secondLeg.id ? { ...fixture, winner, loser } : fixture);
      }
      return winner ? { ...path, winner } : path;
    });
    const tiesComplete = playoffPaths.filter((path) => path.mode === "TIE").every((path) => !!path.winner);
    if (tiesComplete) {
      const playoffWinners2 = playoffPaths.map((path) => path.winner).filter((team) => !!team);
      return {
        ...state,
        stage: "COMPLETE",
        fixtures,
        playoffPaths,
        qualifiedTeams: uniqueTeams2([...state.qualifiedTeams, ...playoffWinners2]),
        completed: true,
        lastUpdatedIso: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    return {
      ...state,
      fixtures,
      playoffPaths,
      lastUpdatedIso: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  const semiFixtures = fixtures.filter((fixture) => fixture.stage === "PLAYOFFS" && fixture.round === 1);
  const semiComplete = semiFixtures.length > 0 && semiFixtures.every((fixture) => fixture.played);
  if (semiComplete) {
    const existingFinals = fixtures.filter((fixture) => fixture.stage === "PLAYOFFS" && fixture.round === 2);
    const finalFixtures2 = [];
    playoffPaths = playoffPaths.map((path) => {
      if (path.finalFixtureId) return path;
      const semis = path.semiFinalFixtureIds.map((id) => fixtures.find((fixture) => fixture.id === id)).filter((fixture) => !!fixture && !!fixture.winner);
      if (semis.length < 2) return path;
      const finalId = `${path.id}_FINAL`;
      if (!existingFinals.some((fixture) => fixture.id === finalId)) {
        finalFixtures2.push({
          id: finalId,
          year: state.tournamentYear,
          day: PLAYOFF_DATES[1].day,
          month: PLAYOFF_DATES[1].month,
          round: 2,
          home: semis[0].winner,
          away: semis[1].winner,
          groupId: path.label,
          stage: "PLAYOFFS",
          playoffPathId: path.id,
          played: false
        });
      }
      return { ...path, finalFixtureId: finalId };
    });
    fixtures = [...fixtures, ...finalFixtures2];
  }
  const finalFixtures = fixtures.filter((fixture) => fixture.stage === "PLAYOFFS" && fixture.round === 2);
  const finalsComplete = finalFixtures.length > 0 && finalFixtures.every((fixture) => fixture.played);
  if (finalsComplete) {
    playoffPaths = playoffPaths.map((path) => {
      if (path.winner) return path;
      const finalFixture = fixtures.find((fixture) => fixture.id === path.finalFixtureId);
      return finalFixture?.winner ? { ...path, winner: finalFixture.winner } : path;
    });
    const playoffWinners2 = playoffPaths.map((path) => path.winner).filter((team) => !!team);
    return {
      ...state,
      stage: "COMPLETE",
      fixtures,
      playoffPaths,
      qualifiedTeams: uniqueTeams2([...state.qualifiedTeams, ...playoffWinners2]),
      completed: true,
      lastUpdatedIso: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  return {
    ...state,
    fixtures,
    playoffPaths,
    lastUpdatedIso: (/* @__PURE__ */ new Date()).toISOString()
  };
};
var EuroQualifiersService = {
  isEuroTournamentYear,
  isDrawDay(date) {
    const tournamentYear = getTournamentYearForDate(date);
    return date.getFullYear() === tournamentYear - 2 && date.getMonth() === 11 && date.getDate() === 6;
  },
  isPotentialMatchDate(date) {
    const tournamentYear = getTournamentYearForDate(date);
    const isGroupDate = date.getFullYear() === tournamentYear - 1 && MATCH_DATES.some(
      (slot) => slot.day === date.getDate() && slot.month === date.getMonth()
    );
    const isLegacyRecoveryDate = isLegacyGroupRecoveryDate(date, tournamentYear);
    const isPlayoffDate = date.getFullYear() === tournamentYear && PLAYOFF_DATES.some(
      (slot) => slot.day === date.getDate() && slot.month === date.getMonth()
    );
    return isGroupDate || isLegacyRecoveryDate || isPlayoffDate;
  },
  createInitialState(nationalTeams2, tournamentYear, rankingState, nationsLeagueState, hostAnnouncements = []) {
    const europe = nationalTeams2.filter((team) => team.continent === "Europe" && team.name !== "Rosja");
    const byNormalizedName = new Map(europe.map((team) => [normalize3(team.name), team.name]));
    const rankedTeams = uniqueTeams2(
      UefaNationalRankingService.getRankedEuropeanTeams(rankingState, nationalTeams2).map((name) => byNormalizedName.get(normalize3(name))).filter((name) => !!name)
    );
    const hostTeams = getAnnouncedHostsForTournament(tournamentYear, nationalTeams2, hostAnnouncements);
    const blocked = buildBlockedDates(nationsLeagueState);
    const groups = createGroups(rankedTeams, hostTeams, blocked, tournamentYear);
    const fixtures = groups.flatMap((group) => buildFixturesForGroup(group, tournamentYear, blocked, tournamentYear));
    return {
      tournamentYear,
      editionLabel: `EURO ${tournamentYear}`,
      stage: "GROUP_STAGE",
      drawCompleted: true,
      groups,
      fixtures,
      playoffPaths: [],
      hostTeams,
      qualifiedTeams: [],
      directQualifiers: [],
      hostReservedQualifiers: [],
      playoffTeams: [],
      completed: false,
      lastUpdatedIso: (/* @__PURE__ */ new Date()).toISOString()
    };
  },
  isHostAnnouncementDay(date) {
    const tournamentYear = date.getFullYear() + EURO_HOST_ANNOUNCEMENT_YEARS_BEFORE;
    return isEuroTournamentYear(tournamentYear) && date.getMonth() === 11 && date.getDate() === 6;
  },
  getTournamentYearForHostAnnouncement(date) {
    const tournamentYear = date.getFullYear() + EURO_HOST_ANNOUNCEMENT_YEARS_BEFORE;
    return isEuroTournamentYear(tournamentYear) && date.getMonth() === 11 && date.getDate() === 6 ? tournamentYear : null;
  },
  createHostAnnouncement,
  ensurePlayoffsReady(state, date, rankingState) {
    if (!state || state.stage !== "GROUP_STAGE") return state;
    const groupFixtures = state.fixtures.filter((fixture) => (fixture.stage ?? "GROUP_STAGE") === "GROUP_STAGE");
    const allGroupFixturesPlayed = groupFixtures.length > 0 && groupFixtures.every((fixture) => fixture.played);
    if (!allGroupFixturesPlayed && !shouldForceResolveGroupStage(state, date)) return state;
    const refreshed = refreshStandings(state, []);
    return finalizeGroupStage(refreshed, rankingState);
  },
  getMatchDayForDate(state, date) {
    if (!state || state.completed) return null;
    let fixtures = state.fixtures.filter(
      (fixture) => !fixture.played && fixture.year === date.getFullYear() && fixture.day === date.getDate() && fixture.month === date.getMonth()
    );
    if (fixtures.length === 0 && state.stage === "GROUP_STAGE" && isLegacyGroupRecoveryDate(date, state.tournamentYear)) {
      const recoveryCandidates = state.fixtures.filter(
        (fixture) => (fixture.stage ?? "GROUP_STAGE") === "GROUP_STAGE" && !fixture.played && new Date(fixture.year, fixture.month, fixture.day).getTime() < date.getTime()
      ).sort((a, b) => a.year - b.year || a.month - b.month || a.day - b.day || a.round - b.round);
      const usedTeams = /* @__PURE__ */ new Set();
      fixtures = recoveryCandidates.filter((fixture) => {
        if (usedTeams.has(fixture.home) || usedTeams.has(fixture.away)) return false;
        usedTeams.add(fixture.home);
        usedTeams.add(fixture.away);
        return true;
      });
    }
    if (fixtures.length === 0) return null;
    const round = fixtures[0].round;
    if (state.stage === "PLAYOFFS") {
      const hasTiePlayoffs = state.playoffPaths.some((path) => path.mode === "TIE");
      const isFinal = !hasTiePlayoffs && fixtures.some((fixture) => fixture.round === 2);
      return {
        day: date.getDate(),
        month: date.getMonth(),
        competitionLabel: hasTiePlayoffs ? `Eliminacje ${state.editionLabel} - Bara\u017Ce dwumeczowe` : `Eliminacje ${state.editionLabel} - Bara\u017Ce ${isFinal ? "fina\u0142y" : "p\xF3\u0142fina\u0142y"}`,
        matches: fixtures.map((fixture) => {
          const path = state.playoffPaths.find((item) => item.id === fixture.playoffPathId);
          const firstLeg = path?.mode === "TIE" ? state.fixtures.find((item) => item.id === path.tieFixtureIds?.[0]) : void 0;
          const knockoutContext = path?.mode === "TIE" ? fixture.round === 2 && firstLeg?.played && firstLeg.homeGoals !== void 0 && firstLeg.awayGoals !== void 0 ? {
            type: "AGGREGATE_SECOND_LEG",
            firstLegHome: firstLeg.home,
            firstLegAway: firstLeg.away,
            firstLegHomeGoals: firstLeg.homeGoals,
            firstLegAwayGoals: firstLeg.awayGoals
          } : void 0 : { type: "SINGLE_MATCH" };
          const stageLabel = path?.mode === "TIE" ? `Mecz ${fixture.round}` : fixture.round === 2 ? "Fina\u0142" : "P\xF3\u0142fina\u0142";
          return {
            home: fixture.home,
            away: fixture.away,
            group: fixture.groupId,
            competitionLabel: `Eliminacje ${state.editionLabel} - Bara\u017C ${fixture.groupId} - ${stageLabel}`,
            knockoutContext
          };
        })
      };
    }
    return {
      day: date.getDate(),
      month: date.getMonth(),
      competitionLabel: `Eliminacje ${state.editionLabel} - Kolejka ${round}`,
      matches: fixtures.map((fixture) => ({
        home: fixture.home,
        away: fixture.away,
        group: fixture.groupId,
        competitionLabel: `Eliminacje ${state.editionLabel} - Grupa ${fixture.groupId} - Kolejka ${fixture.round}`
      }))
    };
  },
  applyResults(state, results, rankingState) {
    if (state.stage === "PLAYOFFS") return refreshPlayoffs(state, results);
    const next = refreshStandings(state, results);
    const allPlayed = next.fixtures.length > 0 && next.fixtures.every((fixture) => fixture.played);
    return allPlayed ? finalizeGroupStage(next, rankingState) : next;
  }
};

// resources/WorldCupTournamentData.ts
var OFFICIAL_WORLD_CUP_HOSTS_BY_YEAR = {
  2026: ["Meksyk", "Kanada", "Stany Zjednoczone"],
  2030: ["Maroko", "Portugalia", "Hiszpania", "Argentyna", "Paragwaj", "Urugwaj"],
  2034: ["Arabia Saudyjska"]
};
var WORLD_CUP_HOST_CONFEDERATION_BY_NAME = {
  Meksyk: "CONCACAF",
  Kanada: "CONCACAF",
  "Stany Zjednoczone": "CONCACAF",
  Maroko: "CAF",
  Portugalia: "UEFA",
  Hiszpania: "UEFA",
  Argentyna: "CONMEBOL",
  Paragwaj: "CONMEBOL",
  Urugwaj: "CONMEBOL",
  "Arabia Saudyjska": "AFC"
};
var WORLD_CUP_STADIUMS_BY_COUNTRY = {
  Meksyk: [
    { name: "Estadio Azteca", city: "Meksyk", country: "Meksyk", capacity: 87e3 },
    { name: "Estadio BBVA", city: "Monterrey", country: "Meksyk", capacity: 53500 },
    { name: "Estadio Akron", city: "Guadalajara", country: "Meksyk", capacity: 48e3 }
  ],
  Kanada: [
    { name: "BC Place", city: "Vancouver", country: "Kanada", capacity: 54500 },
    { name: "BMO Field", city: "Toronto", country: "Kanada", capacity: 45e3 }
  ],
  "Stany Zjednoczone": [
    { name: "MetLife Stadium", city: "East Rutherford", country: "Stany Zjednoczone", capacity: 82500 },
    { name: "SoFi Stadium", city: "Inglewood", country: "Stany Zjednoczone", capacity: 70240 },
    { name: "AT&T Stadium", city: "Arlington", country: "Stany Zjednoczone", capacity: 8e4 },
    { name: "Mercedes-Benz Stadium", city: "Atlanta", country: "Stany Zjednoczone", capacity: 71e3 },
    { name: "Hard Rock Stadium", city: "Miami Gardens", country: "Stany Zjednoczone", capacity: 65326 },
    { name: "Lumen Field", city: "Seattle", country: "Stany Zjednoczone", capacity: 68740 },
    { name: "Levi\u2019s Stadium", city: "Santa Clara", country: "Stany Zjednoczone", capacity: 68500 }
  ],
  Maroko: [
    { name: "Grand Stade Hassan II", city: "Casablanca", country: "Maroko", capacity: 115e3 },
    { name: "Stade Prince Moulay Abdellah", city: "Rabat", country: "Maroko", capacity: 69500 },
    { name: "Grand Stade de Tanger", city: "Tanger", country: "Maroko", capacity: 75500 },
    { name: "Stade de F\xE8s", city: "Fez", country: "Maroko", capacity: 55800 },
    { name: "Grand Stade d\u2019Agadir", city: "Agadir", country: "Maroko", capacity: 46e3 },
    { name: "Grand Stade de Marrakech", city: "Marrakesz", country: "Maroko", capacity: 45860 }
  ],
  Portugalia: [
    { name: "Est\xE1dio da Luz", city: "Lizbona", country: "Portugalia", capacity: 7e4 },
    { name: "Est\xE1dio Jos\xE9 Alvalade", city: "Lizbona", country: "Portugalia", capacity: 52095 },
    { name: "Est\xE1dio do Drag\xE3o", city: "Porto", country: "Portugalia", capacity: 50033 }
  ],
  Hiszpania: [
    { name: "Santiago Bernab\xE9u", city: "Madryt", country: "Hiszpania", capacity: 83186 },
    { name: "Metropolitano", city: "Madryt", country: "Hiszpania", capacity: 70692 },
    { name: "Camp Nou", city: "Barcelona", country: "Hiszpania", capacity: 105e3 },
    { name: "RCDE Stadium", city: "Barcelona", country: "Hiszpania", capacity: 40500 },
    { name: "San Mam\xE9s", city: "Bilbao", country: "Hiszpania", capacity: 53331 },
    { name: "Estadio de Gran Canaria", city: "Las Palmas", country: "Hiszpania", capacity: 44500 },
    { name: "Estadio de Anoeta", city: "San Sebasti\xE1n", country: "Hiszpania", capacity: 42300 },
    { name: "La Cartuja", city: "Sewilla", country: "Hiszpania", capacity: 7e4 },
    { name: "Nou Mestalla", city: "Walencja", country: "Hiszpania", capacity: 70044 },
    { name: "Estadio de Bala\xEDdos", city: "Vigo", country: "Hiszpania", capacity: 44e3 },
    { name: "Nueva Romareda", city: "Saragossa", country: "Hiszpania", capacity: 43110 }
  ],
  Argentyna: [
    { name: "Estadio Monumental", city: "Buenos Aires", country: "Argentyna", capacity: 1e5 }
  ],
  Paragwaj: [
    { name: "Estadio Osvaldo Dom\xEDnguez Dibb", city: "Asunci\xF3n", country: "Paragwaj", capacity: 46e3 }
  ],
  Urugwaj: [
    { name: "Estadio Centenario", city: "Montevideo", country: "Urugwaj", capacity: 62782 }
  ],
  "Arabia Saudyjska": [
    { name: "King Salman International Stadium", city: "Rijad", country: "Arabia Saudyjska", capacity: 92760 },
    { name: "King Fahd Sports City Stadium", city: "Rijad", country: "Arabia Saudyjska", capacity: 70200 },
    { name: "King Abdullah Sports City Stadium", city: "D\u017Cudda", country: "Arabia Saudyjska", capacity: 62345 },
    { name: "South Riyadh Stadium", city: "Rijad", country: "Arabia Saudyjska", capacity: 47060 },
    { name: "Prince Mohammed bin Salman Stadium", city: "Rijad", country: "Arabia Saudyjska", capacity: 46979 },
    { name: "Prince Faisal bin Fahd Sports City Stadium", city: "Rijad", country: "Arabia Saudyjska", capacity: 46865 },
    { name: "King Saud University Stadium", city: "Rijad", country: "Arabia Saudyjska", capacity: 46319 },
    { name: "New Murabba Stadium", city: "Rijad", country: "Arabia Saudyjska", capacity: 46010 },
    { name: "ROSHN Stadium", city: "Rijad", country: "Arabia Saudyjska", capacity: 46e3 },
    { name: "Qiddiya Coast Stadium", city: "D\u017Cudda", country: "Arabia Saudyjska", capacity: 46096 },
    { name: "Jeddah Central Development Stadium", city: "D\u017Cudda", country: "Arabia Saudyjska", capacity: 45794 },
    { name: "King Abdullah Economic City Stadium", city: "D\u017Cudda", country: "Arabia Saudyjska", capacity: 45700 },
    { name: "Aramco Stadium", city: "Al Khobar", country: "Arabia Saudyjska", capacity: 46096 },
    { name: "NEOM Stadium", city: "Neom", country: "Arabia Saudyjska", capacity: 46010 },
    { name: "King Khalid University Stadium", city: "Abha", country: "Arabia Saudyjska", capacity: 45428 }
  ],
  Anglia: [
    { name: "Wembley", city: "Londyn", country: "Anglia", capacity: 9e4 },
    { name: "Old Trafford", city: "Manchester", country: "Anglia", capacity: 74140 },
    { name: "Tottenham Hotspur Stadium", city: "Londyn", country: "Anglia", capacity: 62850 },
    { name: "London Stadium", city: "Londyn", country: "Anglia", capacity: 62500 },
    { name: "Etihad Stadium", city: "Manchester", country: "Anglia", capacity: 53400 }
  ],
  Niemcy: [
    { name: "Olympiastadion Berlin", city: "Berlin", country: "Niemcy", capacity: 74475 },
    { name: "Allianz Arena", city: "Monachium", country: "Niemcy", capacity: 75e3 },
    { name: "Signal Iduna Park", city: "Dortmund", country: "Niemcy", capacity: 81365 },
    { name: "Volksparkstadion", city: "Hamburg", country: "Niemcy", capacity: 57e3 }
  ],
  W\u0142ochy: [
    { name: "Stadio Olimpico", city: "Rzym", country: "W\u0142ochy", capacity: 70634 },
    { name: "San Siro", city: "Mediolan", country: "W\u0142ochy", capacity: 75923 },
    { name: "Allianz Stadium", city: "Turyn", country: "W\u0142ochy", capacity: 41507 },
    { name: "Stadio Diego Armando Maradona", city: "Neapol", country: "W\u0142ochy", capacity: 54726 }
  ],
  Brazylia: [
    { name: "Maracan\xE3", city: "Rio de Janeiro", country: "Brazylia", capacity: 78838 },
    { name: "Man\xE9 Garrincha", city: "Bras\xEDlia", country: "Brazylia", capacity: 72788 },
    { name: "Arena Corinthians", city: "S\xE3o Paulo", country: "Brazylia", capacity: 49205 },
    { name: "Mineir\xE3o", city: "Belo Horizonte", country: "Brazylia", capacity: 61846 }
  ],
  Japonia: [
    { name: "National Stadium", city: "Tokio", country: "Japonia", capacity: 68e3 },
    { name: "Saitama Stadium", city: "Saitama", country: "Japonia", capacity: 63700 },
    { name: "Nissan Stadium", city: "Jokohama", country: "Japonia", capacity: 72327 }
  ],
  "Korea P\u0141D": [
    { name: "Seoul World Cup Stadium", city: "Seul", country: "Korea P\u0141D", capacity: 66806 },
    { name: "Busan Asiad Stadium", city: "Busan", country: "Korea P\u0141D", capacity: 53864 },
    { name: "Daegu Stadium", city: "Daegu", country: "Korea P\u0141D", capacity: 66422 }
  ],
  Australia: [
    { name: "Stadium Australia", city: "Sydney", country: "Australia", capacity: 83500 },
    { name: "Melbourne Cricket Ground", city: "Melbourne", country: "Australia", capacity: 100024 },
    { name: "Lang Park", city: "Brisbane", country: "Australia", capacity: 52500 }
  ],
  "Nowa Zelandia": [
    { name: "Eden Park", city: "Auckland", country: "Nowa Zelandia", capacity: 5e4 },
    { name: "Sky Stadium", city: "Wellington", country: "Nowa Zelandia", capacity: 34500 }
  ],
  Egipt: [
    { name: "Cairo International Stadium", city: "Kair", country: "Egipt", capacity: 75e3 },
    { name: "Borg El Arab Stadium", city: "Aleksandria", country: "Egipt", capacity: 86e3 }
  ],
  Nigeria: [
    { name: "Moshood Abiola Stadium", city: "Abud\u017Ca", country: "Nigeria", capacity: 6e4 },
    { name: "Godswill Akpabio Stadium", city: "Uyo", country: "Nigeria", capacity: 3e4 }
  ],
  Turcja: [
    { name: "Atat\xFCrk Olympic", city: "Stambu\u0142", country: "Turcja", capacity: 76092 },
    { name: "Rams Park", city: "Stambu\u0142", country: "Turcja", capacity: 52280 },
    { name: "\u015E\xFCkr\xFC Saraco\u011Flu Stadium", city: "Stambu\u0142", country: "Turcja", capacity: 47834 }
  ]
};
var GENERATED_WORLD_CUP_HOST_BIDS = [
  { id: "ENGLAND", hosts: ["Anglia"], confederations: ["UEFA"], stadiums: WORLD_CUP_STADIUMS_BY_COUNTRY.Anglia },
  { id: "GERMANY", hosts: ["Niemcy"], confederations: ["UEFA"], stadiums: WORLD_CUP_STADIUMS_BY_COUNTRY.Niemcy },
  { id: "ITALY", hosts: ["W\u0142ochy"], confederations: ["UEFA"], stadiums: WORLD_CUP_STADIUMS_BY_COUNTRY.W\u0142ochy },
  { id: "BRAZIL", hosts: ["Brazylia"], confederations: ["CONMEBOL"], stadiums: WORLD_CUP_STADIUMS_BY_COUNTRY.Brazylia },
  { id: "JAPAN_KOREA", hosts: ["Japonia", "Korea P\u0141D"], confederations: ["AFC"], stadiums: [...WORLD_CUP_STADIUMS_BY_COUNTRY.Japonia, ...WORLD_CUP_STADIUMS_BY_COUNTRY["Korea P\u0141D"]] },
  { id: "AUSTRALIA_NEW_ZEALAND", hosts: ["Australia", "Nowa Zelandia"], confederations: ["AFC", "OFC"], stadiums: [...WORLD_CUP_STADIUMS_BY_COUNTRY.Australia, ...WORLD_CUP_STADIUMS_BY_COUNTRY["Nowa Zelandia"]] },
  { id: "EGYPT_NIGERIA", hosts: ["Egipt", "Nigeria"], confederations: ["CAF"], stadiums: [...WORLD_CUP_STADIUMS_BY_COUNTRY.Egipt, ...WORLD_CUP_STADIUMS_BY_COUNTRY.Nigeria] },
  { id: "TURKEY", hosts: ["Turcja"], confederations: ["UEFA"], stadiums: WORLD_CUP_STADIUMS_BY_COUNTRY.Turcja }
];
var WorldCupDataRng = class {
  constructor(seed) {
    this.seed = seed >>> 0 || 1;
  }
  next() {
    this.seed = this.seed * 1664525 + 1013904223 >>> 0;
    return this.seed / 4294967296;
  }
  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
};
var hashWorldCupData = (value) => {
  let hash2 = 0;
  for (let i = 0; i < value.length; i += 1) hash2 = (hash2 << 5) - hash2 + value.charCodeAt(i) | 0;
  return hash2 >>> 0;
};
var isWorldCupYear = (year) => year >= 2026 && (year - 2026) % 4 === 0;
var getWorldCupHostConfederationForName = (host) => {
  const official = WORLD_CUP_HOST_CONFEDERATION_BY_NAME[host];
  if (official) return official;
  const generatedBid = GENERATED_WORLD_CUP_HOST_BIDS.find((bid) => bid.hosts.includes(host));
  return generatedBid?.confederations[0] ?? "INTERCONT";
};
var getGeneratedWorldCupHostBidForYear = (year) => {
  const rng = new WorldCupDataRng(hashWorldCupData(`GENERATED_WORLD_CUP_HOST_${year}`));
  const recentHostConfs = [
    ...getWorldCupHostsForYear(year - 4).map(getWorldCupHostConfederationForName),
    ...getWorldCupHostsForYear(year - 8).map(getWorldCupHostConfederationForName)
  ];
  const recentSet = new Set(recentHostConfs.filter((conf) => conf !== "INTERCONT"));
  const preferredBids = GENERATED_WORLD_CUP_HOST_BIDS.filter((bid) => !bid.confederations.some((conf) => recentSet.has(conf)));
  const pool = preferredBids.length > 0 ? preferredBids : GENERATED_WORLD_CUP_HOST_BIDS;
  return pool[rng.int(0, pool.length - 1)];
};
var getWorldCupHostsForYear = (year) => {
  if (!isWorldCupYear(year)) return [];
  const officialHosts = OFFICIAL_WORLD_CUP_HOSTS_BY_YEAR[year];
  if (officialHosts) return [...officialHosts];
  return [...getGeneratedWorldCupHostBidForYear(year).hosts];
};
var getWorldCupStadiumsForYear = (year) => {
  const officialHosts = OFFICIAL_WORLD_CUP_HOSTS_BY_YEAR[year];
  if (officialHosts) {
    return officialHosts.flatMap((host) => WORLD_CUP_STADIUMS_BY_COUNTRY[host] ?? []);
  }
  return getGeneratedWorldCupHostBidForYear(year).stadiums;
};
var pickWorldCupStadiumForMatch = (year, matchKey) => {
  const stadiums = getWorldCupStadiumsForYear(year);
  if (stadiums.length === 0) return null;
  const rng = new WorldCupDataRng(hashWorldCupData(`WORLD_CUP_VENUE_${year}_${matchKey}`));
  return stadiums[rng.int(0, stadiums.length - 1)];
};

// services/WorldCupQualifiersService.ts
var GROUP_LABELS2 = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
var UEFA_WORLD_CUP_SLOTS = 16;
var MATCH_DATES2 = [
  { yearOffset: -1, day: 17, month: 2 },
  { yearOffset: -1, day: 20, month: 2 },
  { yearOffset: -1, day: 7, month: 5 },
  { yearOffset: -1, day: 11, month: 5 },
  { yearOffset: -1, day: 4, month: 8 },
  { yearOffset: -1, day: 7, month: 8 },
  { yearOffset: -1, day: 8, month: 9 },
  { yearOffset: -1, day: 11, month: 9 },
  { yearOffset: -1, day: 14, month: 10 },
  { yearOffset: -1, day: 17, month: 10 }
];
var FOUR_TEAM_GROUP_DATE_INDEXES2 = [4, 5, 6, 7, 8, 9];
var PLAYOFF_DATES2 = [
  { day: 17, month: 2 },
  { day: 20, month: 2 }
];
var Rng3 = class {
  constructor(seed) {
    this.seed = seed >>> 0 || 1;
  }
  next() {
    this.seed = this.seed * 1664525 + 1013904223 >>> 0;
    return this.seed / 4294967296;
  }
  shuffle(items) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
};
var normalize4 = (value) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
var uniqueTeams3 = (teams) => teams.filter((team, index, arr) => !!team && arr.indexOf(team) === index);
var emptyStanding = (teamName) => ({
  teamName,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0
});
var compareStandings2 = (a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || b.wins - a.wins || a.teamName.localeCompare(b.teamName);
var isWorldCupYear2 = (year) => year >= 2026 && (year - 2026) % 4 === 0;
var getTournamentYearForDate2 = (date) => {
  let year = date.getFullYear();
  while (!isWorldCupYear2(year)) year += 1;
  return year;
};
var getHostsForTournament2 = (tournamentYear, nationalTeams2) => {
  const hostNames = getWorldCupHostsForYear(tournamentYear);
  const available = new Map(nationalTeams2.map((team) => [normalize4(team.name), team.name]));
  return hostNames.map((name) => available.get(normalize4(name))).filter((name) => !!name);
};
var getEuropeanHostsForTournament = (tournamentYear, nationalTeams2) => {
  const europe = new Set(nationalTeams2.filter((team) => team.continent === "Europe").map((team) => team.name));
  return getHostsForTournament2(tournamentYear, nationalTeams2).filter((name) => europe.has(name));
};
var pairKey = (home, away) => `${home}__${away}`;
var buildPairPool = (teams, rng) => {
  const pairs = [];
  teams.forEach((home, homeIndex) => {
    teams.forEach((away, awayIndex) => {
      if (homeIndex !== awayIndex) pairs.push({ home, away });
    });
  });
  return rng.shuffle(pairs);
};
var createGroups2 = (rankedTeams, europeanHosts, seed) => {
  const rng = new Rng3(seed ^ 8240);
  const hostSet = new Set(europeanHosts);
  const candidates = rankedTeams.filter((team) => !hostSet.has(team));
  const fourTeamCapacity = GROUP_LABELS2.length * 4;
  const fiveTeamGroupCount = Math.max(0, Math.min(GROUP_LABELS2.length, candidates.length - fourTeamCapacity));
  const targetSizes = GROUP_LABELS2.map((label, index) => ({
    id: label,
    targetSize: index < fiveTeamGroupCount ? 5 : 4,
    teams: []
  }));
  candidates.forEach((team) => {
    const selected = targetSizes.filter((group) => group.teams.length < group.targetSize).sort((a, b) => b.targetSize - a.targetSize || a.teams.length - b.teams.length || a.id.localeCompare(b.id))[0];
    selected?.teams.push(team);
  });
  return targetSizes.map((group) => ({
    id: group.id,
    teams: rng.shuffle(group.teams),
    hostTeams: [],
    standings: group.teams.map(emptyStanding)
  }));
};
var buildFixturesForGroup2 = (group, tournamentYear, seed) => {
  const rng = new Rng3(seed ^ group.id.charCodeAt(0));
  const pairs = buildPairPool(group.teams, rng);
  const allowedDateIndexes = group.teams.length <= 4 ? FOUR_TEAM_GROUP_DATE_INDEXES2 : MATCH_DATES2.map((_, index) => index);
  const fixtures = [];
  const usedPairs = /* @__PURE__ */ new Set();
  let round = 1;
  allowedDateIndexes.forEach((dateIndex) => {
    const slot = MATCH_DATES2[dateIndex];
    const usedTeams = /* @__PURE__ */ new Set();
    let matchesOnDate = 0;
    pairs.forEach((pair) => {
      if (matchesOnDate >= Math.floor(group.teams.length / 2)) return;
      if (usedPairs.has(pairKey(pair.home, pair.away))) return;
      if (usedTeams.has(pair.home) || usedTeams.has(pair.away)) return;
      usedPairs.add(pairKey(pair.home, pair.away));
      usedTeams.add(pair.home);
      usedTeams.add(pair.away);
      fixtures.push({
        id: `WCQ_${tournamentYear}_${group.id}_R${round}_${matchesOnDate + 1}`,
        year: tournamentYear + slot.yearOffset,
        day: slot.day,
        month: slot.month,
        round,
        home: pair.home,
        away: pair.away,
        groupId: group.id,
        stage: "GROUP_STAGE",
        played: false
      });
      matchesOnDate += 1;
    });
    round += 1;
  });
  pairs.filter((pair) => !usedPairs.has(pairKey(pair.home, pair.away))).forEach((pair) => {
    const slot = MATCH_DATES2[allowedDateIndexes[fixtures.length % allowedDateIndexes.length]];
    fixtures.push({
      id: `WCQ_${tournamentYear}_${group.id}_EX${fixtures.length + 1}`,
      year: tournamentYear + slot.yearOffset,
      day: slot.day,
      month: slot.month,
      round: Math.min(10, fixtures.length + 1),
      home: pair.home,
      away: pair.away,
      groupId: group.id,
      stage: "GROUP_STAGE",
      played: false
    });
  });
  return fixtures.sort(
    (a, b) => a.year - b.year || a.month - b.month || a.day - b.day || a.groupId.localeCompare(b.groupId)
  );
};
var getWinner3 = (result) => result.homePenaltyScore !== void 0 && result.awayPenaltyScore !== void 0 ? result.homePenaltyScore > result.awayPenaltyScore ? result.home : result.away : result.homeGoals >= result.awayGoals ? result.home : result.away;
var getLoser3 = (result) => getWinner3(result) === result.home ? result.away : result.home;
var markFixturePlayed3 = (fixture, result) => ({
  ...fixture,
  played: true,
  matchId: result.matchId,
  homeGoals: result.homeGoals,
  awayGoals: result.awayGoals,
  homePenaltyScore: result.homePenaltyScore,
  awayPenaltyScore: result.awayPenaltyScore,
  isExtraTime: result.isExtraTime,
  winner: getWinner3(result),
  loser: getLoser3(result)
});
var refreshStandings2 = (state, results) => {
  if (results.length === 0) return state;
  const fixtures = state.fixtures.map((fixture) => ({ ...fixture }));
  const groups = state.groups.map((group) => ({
    ...group,
    standings: group.teams.map(emptyStanding)
  }));
  const standingsByGroup = new Map(groups.map((group) => [group.id, new Map(group.standings.map((row) => [row.teamName, row]))]));
  results.forEach((result) => {
    const fixtureIndex = fixtures.findIndex(
      (fixture) => !fixture.played && fixture.home === result.home && fixture.away === result.away && fixture.groupId === result.group
    );
    if (fixtureIndex < 0) return;
    fixtures[fixtureIndex] = markFixturePlayed3(fixtures[fixtureIndex], result);
  });
  fixtures.forEach((fixture) => {
    if (fixture.stage !== "GROUP_STAGE" || !fixture.played) return;
    if (fixture.homeGoals === void 0 || fixture.awayGoals === void 0) return;
    const table = standingsByGroup.get(fixture.groupId);
    const home = table?.get(fixture.home);
    const away = table?.get(fixture.away);
    if (!home || !away) return;
    home.played += 1;
    away.played += 1;
    home.goalsFor += fixture.homeGoals;
    home.goalsAgainst += fixture.awayGoals;
    away.goalsFor += fixture.awayGoals;
    away.goalsAgainst += fixture.homeGoals;
    if (fixture.homeGoals > fixture.awayGoals) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (fixture.awayGoals > fixture.homeGoals) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  });
  return {
    ...state,
    fixtures,
    groups: groups.map((group) => ({
      ...group,
      standings: [...group.standings].sort(compareStandings2)
    })),
    lastUpdatedIso: (/* @__PURE__ */ new Date()).toISOString()
  };
};
var buildPathPlayoffData2 = (state, playoffTeams, pathCount) => {
  const selectedTeams = playoffTeams.slice(0, pathCount * 4);
  const paths = [];
  const fixtures = [];
  for (let pathIndex = 0; pathIndex < pathCount; pathIndex += 1) {
    const teams = selectedTeams.slice(pathIndex * 4, pathIndex * 4 + 4);
    if (teams.length < 4) continue;
    const label = String.fromCharCode(65 + pathIndex);
    const id = `WCQ_PO_${state.tournamentYear}_${label}`;
    const sf1Id = `${id}_SF1`;
    const sf2Id = `${id}_SF2`;
    paths.push({
      id,
      label,
      mode: "PATH",
      teams,
      semiFinalFixtureIds: [sf1Id, sf2Id]
    });
    fixtures.push(
      {
        id: sf1Id,
        year: state.tournamentYear,
        day: PLAYOFF_DATES2[0].day,
        month: PLAYOFF_DATES2[0].month,
        round: 1,
        home: teams[0],
        away: teams[3],
        groupId: label,
        stage: "PLAYOFFS",
        playoffPathId: id,
        played: false
      },
      {
        id: sf2Id,
        year: state.tournamentYear,
        day: PLAYOFF_DATES2[0].day,
        month: PLAYOFF_DATES2[0].month,
        round: 1,
        home: teams[1],
        away: teams[2],
        groupId: label,
        stage: "PLAYOFFS",
        playoffPathId: id,
        played: false
      }
    );
  }
  return { paths, fixtures };
};
var finalizeGroupStage2 = (state, rankingState) => {
  const winners = state.groups.map((group) => group.standings[0]?.teamName).filter((team) => !!team);
  const europeanHostCount = state.hostTeams.length;
  const playoffWinnerSlots = Math.max(0, UEFA_WORLD_CUP_SLOTS - europeanHostCount - winners.length);
  const qualifiedTeams = uniqueTeams3([...state.hostTeams, ...winners]);
  const runnerUpRows = state.groups.map((group) => group.standings[1]).filter((row) => !!row).sort(compareStandings2);
  const rankingFallback = (rankingState?.entries ?? []).map((entry) => entry.teamName).filter((team) => !qualifiedTeams.includes(team) && !runnerUpRows.some((row) => row.teamName === team));
  const playoffTeams = uniqueTeams3([...runnerUpRows.map((row) => row.teamName), ...rankingFallback]).slice(0, playoffWinnerSlots * 4);
  const playoffData = buildPathPlayoffData2(state, playoffTeams, playoffWinnerSlots);
  return {
    ...state,
    stage: playoffData.paths.length > 0 ? "PLAYOFFS" : "COMPLETE",
    directQualifiers: winners,
    hostReservedQualifiers: state.hostTeams,
    qualifiedTeams: playoffData.paths.length > 0 ? qualifiedTeams : uniqueTeams3([...qualifiedTeams, ...playoffTeams]),
    playoffTeams,
    playoffPaths: playoffData.paths,
    fixtures: [...state.fixtures, ...playoffData.fixtures],
    completed: playoffData.paths.length === 0,
    lastUpdatedIso: (/* @__PURE__ */ new Date()).toISOString()
  };
};
var refreshPlayoffs2 = (state, results) => {
  if (results.length === 0) return state;
  let fixtures = state.fixtures.map((fixture) => ({ ...fixture }));
  results.forEach((result) => {
    const fixtureIndex = fixtures.findIndex(
      (fixture) => fixture.stage === "PLAYOFFS" && !fixture.played && fixture.home === result.home && fixture.away === result.away
    );
    if (fixtureIndex >= 0) fixtures[fixtureIndex] = markFixturePlayed3(fixtures[fixtureIndex], result);
  });
  let playoffPaths = state.playoffPaths.map((path) => ({ ...path }));
  const semiFixtures = fixtures.filter((fixture) => fixture.stage === "PLAYOFFS" && fixture.round === 1);
  const semiComplete = semiFixtures.length > 0 && semiFixtures.every((fixture) => fixture.played);
  if (semiComplete) {
    const existingFinals = fixtures.filter((fixture) => fixture.stage === "PLAYOFFS" && fixture.round === 2);
    const finalFixtures2 = [];
    playoffPaths = playoffPaths.map((path) => {
      if (path.finalFixtureId) return path;
      const semis = path.semiFinalFixtureIds.map((id) => fixtures.find((fixture) => fixture.id === id)).filter((fixture) => !!fixture && !!fixture.winner);
      if (semis.length < 2) return path;
      const finalId = `${path.id}_FINAL`;
      if (!existingFinals.some((fixture) => fixture.id === finalId)) {
        finalFixtures2.push({
          id: finalId,
          year: state.tournamentYear,
          day: PLAYOFF_DATES2[1].day,
          month: PLAYOFF_DATES2[1].month,
          round: 2,
          home: semis[0].winner,
          away: semis[1].winner,
          groupId: path.label,
          stage: "PLAYOFFS",
          playoffPathId: path.id,
          played: false
        });
      }
      return { ...path, finalFixtureId: finalId };
    });
    fixtures = [...fixtures, ...finalFixtures2];
  }
  const finalFixtures = fixtures.filter((fixture) => fixture.stage === "PLAYOFFS" && fixture.round === 2);
  const finalsComplete = finalFixtures.length > 0 && finalFixtures.every((fixture) => fixture.played);
  if (finalsComplete) {
    playoffPaths = playoffPaths.map((path) => {
      if (path.winner) return path;
      const finalFixture = fixtures.find((fixture) => fixture.id === path.finalFixtureId);
      return finalFixture?.winner ? { ...path, winner: finalFixture.winner } : path;
    });
    const playoffWinners2 = playoffPaths.map((path) => path.winner).filter((team) => !!team);
    return {
      ...state,
      stage: "COMPLETE",
      fixtures,
      playoffPaths,
      qualifiedTeams: uniqueTeams3([...state.qualifiedTeams, ...playoffWinners2]),
      completed: true,
      lastUpdatedIso: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  return {
    ...state,
    fixtures,
    playoffPaths,
    lastUpdatedIso: (/* @__PURE__ */ new Date()).toISOString()
  };
};
var WorldCupQualifiersService = {
  isWorldCupYear: isWorldCupYear2,
  getHostsForTournament: getHostsForTournament2,
  getEuropeanHostsForTournament,
  isDrawDay(date) {
    const tournamentYear = date.getFullYear() + 2;
    return isWorldCupYear2(tournamentYear) && tournamentYear >= 2030 && date.getMonth() === 11 && date.getDate() === 6;
  },
  isPotentialMatchDate(date) {
    const tournamentYear = getTournamentYearForDate2(date);
    if (tournamentYear < 2030) return false;
    const isGroupDate = date.getFullYear() === tournamentYear - 1 && MATCH_DATES2.some(
      (slot) => slot.day === date.getDate() && slot.month === date.getMonth()
    );
    const isPlayoffDate = date.getFullYear() === tournamentYear && PLAYOFF_DATES2.some(
      (slot) => slot.day === date.getDate() && slot.month === date.getMonth()
    );
    return isGroupDate || isPlayoffDate;
  },
  createInitialState(nationalTeams2, tournamentYear, rankingState) {
    const europe = nationalTeams2.filter((team) => team.continent === "Europe" && team.name !== "Rosja");
    const byNormalizedName = new Map(europe.map((team) => [normalize4(team.name), team.name]));
    const rankedTeams = uniqueTeams3(
      UefaNationalRankingService.getRankedEuropeanTeams(rankingState, nationalTeams2).map((name) => byNormalizedName.get(normalize4(name))).filter((name) => !!name)
    );
    const hostTeams = getEuropeanHostsForTournament(tournamentYear, nationalTeams2);
    const groups = createGroups2(rankedTeams, hostTeams, tournamentYear);
    const fixtures = groups.flatMap((group) => buildFixturesForGroup2(group, tournamentYear, tournamentYear));
    return {
      tournamentYear,
      editionLabel: `M\u015A ${tournamentYear}`,
      stage: "GROUP_STAGE",
      drawCompleted: true,
      groups,
      fixtures,
      playoffPaths: [],
      hostTeams,
      qualifiedTeams: hostTeams,
      directQualifiers: [],
      hostReservedQualifiers: hostTeams,
      playoffTeams: [],
      completed: false,
      lastUpdatedIso: (/* @__PURE__ */ new Date()).toISOString()
    };
  },
  getMatchDayForDate(state, date) {
    if (!state || state.completed) return null;
    const fixtures = state.fixtures.filter(
      (fixture) => !fixture.played && fixture.year === date.getFullYear() && fixture.day === date.getDate() && fixture.month === date.getMonth()
    );
    if (fixtures.length === 0) return null;
    const round = fixtures[0].round;
    if (state.stage === "PLAYOFFS") {
      const isFinal = fixtures.some((fixture) => fixture.round === 2);
      return {
        day: date.getDate(),
        month: date.getMonth(),
        competitionLabel: `Eliminacje ${state.editionLabel} - Bara\u017Ce ${isFinal ? "fina\u0142y" : "p\xF3\u0142fina\u0142y"}`,
        matches: fixtures.map((fixture) => ({
          home: fixture.home,
          away: fixture.away,
          group: fixture.groupId,
          competitionLabel: `Eliminacje ${state.editionLabel} - Bara\u017C ${fixture.groupId} - ${fixture.round === 2 ? "Fina\u0142" : "P\xF3\u0142fina\u0142"}`,
          knockoutContext: { type: "SINGLE_MATCH" }
        }))
      };
    }
    return {
      day: date.getDate(),
      month: date.getMonth(),
      competitionLabel: `Eliminacje ${state.editionLabel} - Kolejka ${round}`,
      matches: fixtures.map((fixture) => ({
        home: fixture.home,
        away: fixture.away,
        group: fixture.groupId,
        competitionLabel: `Eliminacje ${state.editionLabel} - Grupa ${fixture.groupId} - Kolejka ${fixture.round}`
      }))
    };
  },
  applyResults(state, results, rankingState) {
    if (state.stage === "PLAYOFFS") return refreshPlayoffs2(state, results);
    const next = refreshStandings2(state, results);
    const groupFixtures = next.fixtures.filter((fixture) => (fixture.stage ?? "GROUP_STAGE") === "GROUP_STAGE");
    const allPlayed = groupFixtures.length > 0 && groupFixtures.every((fixture) => fixture.played);
    return allPlayed ? finalizeGroupStage2(next, rankingState) : next;
  }
};

// services/NationalTeamService.ts
var NT_GK = 3;
var NT_DEF = 8;
var NT_MID = 8;
var NT_FWD = 6;
var NT_TIER_OVR_CAP = {
  1: 99,
  2: 95,
  3: 90,
  4: 80,
  5: 70
};
var NT_CAP_DISABLED = true;
var KNOWN_CLUBS = [
  ...STATIC_CLUBS,
  ...STATIC_CL_CLUBS,
  ...STATIC_EL_CLUBS,
  ...STATIC_CONF_CLUBS,
  ...STATIC_ASIAN_CLUBS,
  ...STATIC_AFRICAN_CLUBS,
  ...STATIC_NA_CLUBS,
  ...STATIC_SA_CLUBS
];
var CLUB_COUNTRY_BY_ID = new Map(
  KNOWN_CLUBS.flatMap((club) => club.country ? [[club.id, club.country]] : [])
);
var CLUB_REPUTATION_BY_ID = new Map(
  KNOWN_CLUBS.map((club) => [club.id, club.reputation])
);
var CLUB_LEAGUE_ID_BY_ID = new Map(
  KNOWN_CLUBS.map((club) => [club.id, club.leagueId])
);
var FREE_AGENT_CLUB_ID = "FREE_AGENTS";
var isFreeAgentPlayer = (player) => player?.clubId === FREE_AGENT_CLUB_ID;
var clampSelectionValue = (value, min, max) => Math.min(max, Math.max(min, value));
var calcNationalTeamSelectionScore = (team, player, coach) => {
  const clubRep = CLUB_REPUTATION_BY_ID.get(player.clubId) ?? 1;
  const playerReputation = clampSelectionValue(player.reputacja ?? 50, 1, 99);
  const experience = coach?.attributes.experience ?? 50;
  const decisionMaking = coach?.attributes.decisionMaking ?? 50;
  const motivation = coach?.attributes.motivation ?? 50;
  const training = coach?.attributes.training ?? 50;
  const reputationTrust = clampSelectionValue(
    0.1 + (experience - 50) * 6e-3 + (motivation - 50) * 3e-3 - (decisionMaking - 50) * 3e-3,
    0.02,
    0.55
  );
  const talentAssessment = clampSelectionValue(
    0.08 + (training - 50) * 3e-3 + (decisionMaking - 50) * 4e-3,
    0.02,
    0.4
  );
  const playerReputationBonus = (playerReputation - 50) * reputationTrust;
  const clubReputationBonus = clubRep * (team.region === "POLAND" /* POLAND */ ? 1 : 0.45 + experience / 220);
  const technicalTrustBonus = (player.overallRating - 65) * talentAssessment;
  const jitter = Math.floor(Math.random() * 7) - 3;
  return player.overallRating * 2 + clubReputationBonus + playerReputationBonus + technicalTrustBonus + jitter;
};
var TEAM_SELECTION_RULES = {
  Liechtenstein: { maxOverall: 55, starThreshold: 55, maxStars: 0, fallbackMaxOverall: 55 },
  "San Marino": { maxOverall: 52, starThreshold: 52, maxStars: 0, fallbackMaxOverall: 52 },
  Luksemburg: { maxOverall: 55, starThreshold: 55, maxStars: 1 },
  Norwegia: { minStars: 3, maxStars: 5 },
  Walia: { maxStars: 2 },
  Irlandia: { maxStars: 2 },
  "Irlandia P\xF3\u0142nocna": { maxOverall: 69, starThreshold: 68, maxStars: 1 },
  Szkocja: { maxStars: 2 },
  Jamajka: { maxOverall: 74, starThreshold: 72, maxStars: 2 },
  "Nowa Zelandia": { maxOverall: 72, starThreshold: 70, maxStars: 2 },
  Iran: { maxStars: 1 }
};
var sortTeamsByPriority = (teams) => [...teams].sort((a, b) => b.reputation - a.reputation || a.name.localeCompare(b.name));
var getTeamRule = (team) => TEAM_SELECTION_RULES[team.name];
var getTeamOvrCap = (team) => {
  if (team.tier === 5 && team.continent !== "Europe") return 55;
  if (NT_CAP_DISABLED) return 99;
  let cap = NT_TIER_OVR_CAP[team.tier] ?? 62;
  if (team.continent === "Africa") {
    if (team.reputation < 8) cap = Math.min(cap, 67);
    else if (team.reputation < 10) cap = Math.min(cap, 70);
    else if (team.reputation < 13) cap = Math.min(cap, 74);
  }
  if (team.continent === "Oceania") {
    cap = Math.min(cap, team.name === "Australia" ? 76 : team.name === "Nowa Zelandia" ? 72 : 64);
  }
  const rule = getTeamRule(team);
  if (rule?.maxOverall !== void 0) {
    cap = Math.min(cap, rule.maxOverall);
  }
  return cap;
};
var isTeamStarPlayer = (team, player) => {
  const rule = getTeamRule(team);
  if (rule?.starThreshold !== void 0 && player.overallRating >= rule.starThreshold) return true;
  return player.overallRating > getTeamOvrCap(team);
};
var getCoachStarAllowance = (coachExp) => {
  if (coachExp >= 75) return 3;
  if (coachExp >= 40) return 2;
  return 1;
};
var getMaxStarsForTeam = (team, coachExp = 50) => {
  if (team.tier === 5 && team.continent !== "Europe") return 3;
  if (NT_CAP_DISABLED) return 99;
  const rule = getTeamRule(team);
  if (!rule) return getCoachStarAllowance(coachExp);
  if (rule.minStars !== void 0) {
    const minStars = rule.minStars;
    const maxStars = rule.maxStars ?? minStars;
    if (coachExp >= 75) return maxStars;
    if (coachExp >= 40) return Math.min(maxStars, minStars + 1);
    return minStars;
  }
  return rule.maxStars ?? getCoachStarAllowance(coachExp);
};
var isTierFiveNonEuropeanTeam = (team) => team.tier === 5 && team.continent !== "Europe";
var getSyntheticRegionProfile = (teamName, region) => {
  if (teamName === "Luksemburg") return { baseOffset: -4, starChance: 0.04 };
  if (teamName === "Liechtenstein") return { baseOffset: -12, starChance: 8e-3 };
  if (teamName === "San Marino") return { baseOffset: -18, starChance: 3e-3 };
  return REGION_PROFILE[region];
};
var getSyntheticFallbackAverage = (team) => clampSelectionValue(Math.round(45 + team.reputation * 2.2), 42, 88);
var getSyntheticAnchorAverage = (team, currentSquadPlayers) => {
  if (currentSquadPlayers.length === 0) return getSyntheticFallbackAverage(team);
  return currentSquadPlayers.reduce((sum, player) => sum + player.overallRating, 0) / currentSquadPlayers.length;
};
var calibrateGeneratedNationalPlayer = (player, team, currentSquadPlayers) => {
  const averageOverall = getSyntheticAnchorAverage(team, currentSquadPlayers);
  const offset = Math.floor(Math.random() * 13) - 10;
  const calibratedOverall = clampSelectionValue(Math.round(averageOverall + offset), 35, 99);
  return { ...player, overallRating: calibratedOverall };
};
var isEligibleForTeam = (team, player, squadIds = [], assignedPlayerIds, options = {}) => {
  if (assignedPlayerIds?.has(player.id)) return false;
  if (squadIds.includes(player.id)) return false;
  if (player.assignedNationalTeamId && player.assignedNationalTeamId !== team.id) return false;
  if (!options.bypassOverallCap && player.overallRating > getTeamOvrCap(team)) return false;
  if (team.name === "Liechtenstein") {
    if (player.nationalityCountry) return player.nationalityCountry === "Liechtenstein";
    const clubCountry = CLUB_COUNTRY_BY_ID.get(player.clubId);
    return clubCountry === "LIE";
  }
  if (team.name === "Korea P\u0141N") {
    return player.nationalityCountry === "Korea P\u0141N";
  }
  if (player.nationalityCountry) {
    if (player.nationalityCountry !== team.name) return false;
  } else {
    if (player.nationality !== team.region) return false;
  }
  if (team.region === "POLAND" /* POLAND */) {
    const clubLeagueId = CLUB_LEAGUE_ID_BY_ID.get(player.clubId);
    const isEkstraklasa = clubLeagueId === "L_PL_1";
    const isTopForeign = clubLeagueId === "L_CL" || clubLeagueId === "L_EL" || clubLeagueId === "L_CONF";
    if (!isEkstraklasa && !isTopForeign) return false;
  }
  if (team.reputation >= 14 && team.region !== "POLAND" /* POLAND */) {
    const clubLeagueId = CLUB_LEAGUE_ID_BY_ID.get(player.clubId);
    if (clubLeagueId && clubLeagueId.startsWith("L_PL_") && clubLeagueId !== "L_PL_1") return false;
  }
  return true;
};
var NT_FREEZE_DAYS = 7;
var getNationalCoachExpRange = (rep) => {
  if (rep >= 18) return [85, 99];
  if (rep >= 14) return [65, 84];
  if (rep >= 10) return [40, 64];
  if (rep >= 6) return [20, 39];
  return [5, 19];
};
var NATIONAL_COACH_REGION_GROUPS = [
  ["SPAIN" /* SPAIN */, "IBERIA" /* IBERIA */],
  ["ENGLAND" /* ENGLAND */, "SCANDINAVIA" /* SCANDINAVIA */, "SWEDEN" /* SWEDEN */],
  ["GERMANY" /* GERMANY */, "BENELUX" /* BENELUX */, "HUNGARIAN" /* HUNGARIAN */],
  ["ITALY" /* ITALY */, "MALTESE" /* MALTESE */, "GREEK" /* GREEK */],
  ["FRANCE" /* FRANCE */, "BENELUX" /* BENELUX */, "IBERIA" /* IBERIA */],
  ["BALKANS" /* BALKANS */, "ALBANIA" /* ALBANIA */, "ROMANIA" /* ROMANIA */, "GREEK" /* GREEK */],
  ["CZ_SK" /* CZ_SK */, "POLAND" /* POLAND */, "HUNGARIAN" /* HUNGARIAN */],
  ["EX_USSR" /* EX_USSR */, "GEORGIA" /* GEORGIA */, "ARMENIA" /* ARMENIA */, "AZERBAIJANI" /* AZERBAIJANI */, "KAZAKH" /* KAZAKH */],
  ["TURKEY" /* TURKEY */, "ARABIA" /* ARABIA */, "AZERBAIJANI" /* AZERBAIJANI */],
  ["ARGENTINA" /* ARGENTINA */, "BRAZIL" /* BRAZIL */, "SOUTH_AMERICAN" /* SOUTH_AMERICAN */, "IBERIA" /* IBERIA */],
  ["NORTH_AMERICA" /* NORTH_AMERICA */, "MEXICO" /* MEXICO */],
  ["JAPAN" /* JAPAN */, "KOREA" /* KOREA */],
  ["SSA" /* SSA */, "ARABIA" /* ARABIA */],
  ["OCEANIA" /* OCEANIA */, "NORTH_AMERICA" /* NORTH_AMERICA */]
];
var getCompatibleNationalCoachRegions = (team) => {
  const compatible = /* @__PURE__ */ new Set([team.region]);
  NATIONAL_COACH_REGION_GROUPS.forEach((group) => {
    if (group.includes(team.region)) {
      group.forEach((region) => compatible.add(region));
    }
  });
  return compatible;
};
var scoreNationalCoachCandidate = (coach, team, currentClub, hiredDate, source) => {
  const [minExp, maxExp] = getNationalCoachExpRange(team.reputation);
  const exp = coach.attributes.experience;
  const quality = exp * 1.2 + coach.attributes.decisionMaking + coach.attributes.motivation * 0.85 + coach.attributes.training * 0.45 + (coach.expPoints ?? 1) / 12;
  const expFit = exp >= minExp && exp <= maxExp ? 22 : -Math.min(30, Math.abs(exp < minExp ? minExp - exp : exp - maxExp) * 1.4);
  const locality = coach.nationality === team.region ? 70 : getCompatibleNationalCoachRegions(team).has(coach.nationality) ? 22 : -120;
  const clubResistance = currentClub ? Math.max(0, (currentClub.reputation ?? 1) - team.reputation) * 6 + 12 : 0;
  const sourceBonus = source === "FREE" ? 10 : 0;
  const stableNoise2 = (coach.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) + hiredDate.getDate()) % 7;
  return quality + expFit + locality + sourceBonus + stableNoise2 - clubResistance;
};
var createFallbackNationalCoach = (team, hiredDate) => {
  const [minExp, maxExp] = getNationalCoachExpRange(team.reputation);
  const namePair = NameGeneratorService.getRandomName(team.region);
  const exp = minExp + Math.floor(Math.random() * (Math.max(minExp, maxExp) - minExp + 1));
  return {
    id: `NT_COACH_LOCAL_${team.id}_${hiredDate.getTime()}_${Math.random().toString(36).slice(2, 7)}`,
    firstName: namePair.firstName,
    lastName: namePair.lastName,
    age: 38 + Math.floor(Math.random() * 24),
    nationality: team.region,
    nationalityFlag: team.region === "POLAND" /* POLAND */ ? "PL" : "INT",
    currentClubId: null,
    currentNationalTeamId: null,
    isNationalTeamCoach: true,
    hiredDate: hiredDate.toISOString(),
    contractEndDate: CoachService.getDefaultContractEndDate(hiredDate.toISOString()),
    annualSalary: 0,
    expPoints: Math.max(1, team.reputation * 8),
    blacklist: {},
    attributes: {
      experience: exp,
      decisionMaking: Math.max(20, Math.min(99, exp - 8 + Math.floor(Math.random() * 22))),
      motivation: Math.max(25, Math.min(99, exp - 5 + Math.floor(Math.random() * 25))),
      training: Math.max(20, Math.min(99, exp - 12 + Math.floor(Math.random() * 24)))
    },
    favoriteTactics: {
      offensive: "",
      neutral: "",
      defensive: ""
    },
    history: [],
    seasonStats: []
  };
};
var NationalTeamService = {
  // ─── 1. INICJALIZACJA ────────────────────────────────────────────────────────
  initializeNationalTeams: () => {
    const sources = [
      { prefix: "NT_EUR", data: NATIONAL_TEAMS_EUROPE },
      { prefix: "NT_AFR", data: NATIONAL_TEAMS_AFRICA },
      { prefix: "NT_SAM", data: NATIONAL_TEAMS_CONMEBOL },
      { prefix: "NT_NAM", data: NATIONAL_TEAMS_CONCACAF },
      { prefix: "NT_ASI", data: NATIONAL_TEAMS_AFC },
      { prefix: "NT_OFC", data: NATIONAL_TEAMS_OFC }
    ];
    const result = [];
    sources.forEach(({ prefix, data }) => {
      data.forEach((entry, index) => {
        result.push({
          id: `${prefix}_${index}`,
          name: entry.name,
          continent: entry.continent,
          tier: entry.tier,
          colorsHex: entry.colors,
          kits: createDefaultNationalTeamKits(entry.colors),
          stadiumName: entry.stadium,
          stadiumCapacity: entry.capacity,
          reputation: entry.reputation,
          region: entry.region,
          coachId: null,
          squadPlayerIds: [],
          tacticId: null
        });
      });
    });
    return result;
  },
  // ─── 2. WYBÓR TAKTYKI ────────────────────────────────────────────────────────
  selectTacticForCoach: (coach) => {
    const hash2 = coach.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const dm = coach.attributes.decisionMaking;
    let pool = TACTICS_DB;
    if (dm >= 70) {
      const specialized = TACTICS_DB.filter((t) => t.attackBias > 60 || t.defenseBias > 60);
      if (specialized.length > 0) pool = specialized;
    } else {
      const neutral = TACTICS_DB.filter((t) => t.attackBias >= 40 && t.attackBias <= 65);
      if (neutral.length > 0) pool = neutral;
    }
    return pool[hash2 % pool.length].id;
  },
  selectTacticForSquad: (squad, coach, teamId) => {
    const { experience, decisionMaking } = coach.attributes;
    const { offensive, neutral, defensive } = coach.favoriteTactics;
    const topAvg = (pos, n) => {
      const arr = squad.filter((p) => p.position === pos).sort((a, b) => b.overallRating - a.overallRating).slice(0, n);
      return arr.length > 0 ? arr.reduce((s, p) => s + p.overallRating, 0) / arr.length : 60;
    };
    const fwdAvg = topAvg("FWD" /* FWD */, 3);
    const defAvg = topAvg("DEF" /* DEF */, 4);
    const midAvg = topAvg("MID" /* MID */, 4);
    const attackAdvantage = (fwdAvg - 65) * 1.2 - (defAvg - 65) * 0.8 + (midAvg - 65) * 0.3;
    const idealTacticId = attackAdvantage > 5 ? offensive : attackAdvantage < -5 ? defensive : neutral;
    if (experience >= 70 || decisionMaking >= 65) return idealTacticId;
    const squadHash = squad.reduce((acc, p) => acc + p.overallRating, 0);
    const seed = teamId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) + squadHash;
    const favorites = [offensive, neutral, defensive];
    if (experience >= 40) {
      return seed % 10 < 7 ? idealTacticId : favorites[seed % 3];
    }
    return favorites[seed % 3];
  },
  // ─── 3. PRZYPISANIE TRENERÓW ─────────────────────────────────────────────────
  assignCoachesToNationalTeams: (nationalTeams2, ntCoachList) => {
    const coachesMap = {};
    ntCoachList.forEach((c) => {
      coachesMap[c.id] = { ...c };
    });
    const updatedTeams = nationalTeams2.map((t) => ({ ...t }));
    const getExpRange = (rep) => {
      if (rep >= 18) return [85, 99];
      if (rep >= 14) return [65, 84];
      if (rep >= 10) return [40, 64];
      if (rep >= 6) return [20, 39];
      return [5, 19];
    };
    const sortedByRep = [...updatedTeams].sort((a, b) => b.reputation - a.reputation);
    for (const team of sortedByRep) {
      const [minExp, maxExp] = getExpRange(team.reputation);
      const available = Object.values(coachesMap).filter((c) => !c.currentNationalTeamId);
      let coach = available.find(
        (c) => c.nationality === team.region && c.attributes.experience >= minExp && c.attributes.experience <= maxExp
      );
      if (!coach) {
        coach = available.find(
          (c) => c.attributes.experience >= minExp && c.attributes.experience <= maxExp
        );
      }
      if (!coach) {
        coach = available.find(
          (c) => c.attributes.experience >= Math.max(0, minExp - 10) && c.attributes.experience <= Math.min(99, maxExp + 10)
        );
      }
      if (!coach) {
        coach = available[0];
      }
      if (coach) {
        coachesMap[coach.id].currentNationalTeamId = team.id;
        coachesMap[coach.id].contractEndDate = coachesMap[coach.id].contractEndDate || CoachService.getDefaultContractEndDate(coachesMap[coach.id].hiredDate);
        coachesMap[coach.id].annualSalary = CoachService.calculateAnnualSalaryForNationalTeam(team, coachesMap[coach.id]);
        team.coachId = coach.id;
        team.tacticId = NationalTeamService.selectTacticForCoach(coach);
      }
    }
    Object.keys(coachesMap).forEach((id) => {
      coachesMap[id] = CoachService.normalizeCoachContract(coachesMap[id], null, null);
    });
    return { updatedTeams, updatedCoaches: coachesMap };
  },
  // ─── 4. GENEROWANIE ZAWODNIKA NT ─────────────────────────────────────────────
  ensureNationalTeamCoaches: (nationalTeams2, coaches, clubs, hiredDate, userTeamId) => {
    if (nationalTeams2.length === 0) {
      return { updatedTeams: nationalTeams2, updatedCoaches: coaches, updatedClubs: clubs, appointedCount: 0, appointments: [] };
    }
    const updatedTeams = nationalTeams2.map((team) => ({ ...team }));
    const updatedCoaches = { ...coaches };
    const updatedClubs = clubs.map((club) => ({ ...club }));
    const teamIds = new Set(updatedTeams.map((team) => team.id));
    const teamByCoachId = new Map(updatedTeams.filter((team) => team.coachId).map((team) => [team.coachId, team.id]));
    const clubById = new Map(updatedClubs.map((club) => [club.id, club]));
    let appointedCount = 0;
    const appointments = [];
    Object.keys(updatedCoaches).forEach((id) => {
      const coach = updatedCoaches[id];
      if (coach.currentNationalTeamId && (!teamIds.has(coach.currentNationalTeamId) || teamByCoachId.get(id) !== coach.currentNationalTeamId)) {
        updatedCoaches[id] = { ...coach, currentNationalTeamId: null };
      }
    });
    const findCandidate = (team) => {
      const compatibleRegions = getCompatibleNationalCoachRegions(team);
      const allAvailable = Object.values(updatedCoaches).filter((coach) => !coach.currentNationalTeamId && coach.age < 70);
      const freeSameRegion = allAvailable.filter((coach) => !coach.currentClubId && coach.nationality === team.region);
      const freeCompatible = allAvailable.filter((coach) => !coach.currentClubId && compatibleRegions.has(coach.nationality));
      const clubSameRegion = allAvailable.filter((coach) => coach.currentClubId && coach.currentClubId !== userTeamId && coach.nationality === team.region).map((coach) => ({ coach, club: clubById.get(coach.currentClubId) })).filter((entry) => !!entry.club && entry.club.coachId === entry.coach.id);
      const clubCompatible = allAvailable.filter((coach) => coach.currentClubId && coach.currentClubId !== userTeamId && compatibleRegions.has(coach.nationality)).map((coach) => ({ coach, club: clubById.get(coach.currentClubId) })).filter((entry) => !!entry.club && entry.club.coachId === entry.coach.id);
      const rankFree = (pool) => [...pool].sort(
        (a, b) => scoreNationalCoachCandidate(b, team, void 0, hiredDate, "FREE") - scoreNationalCoachCandidate(a, team, void 0, hiredDate, "FREE")
      )[0];
      const rankClub = (pool) => [...pool].sort(
        (a, b) => scoreNationalCoachCandidate(b.coach, team, b.club, hiredDate, "CLUB") - scoreNationalCoachCandidate(a.coach, team, a.club, hiredDate, "CLUB")
      )[0];
      const freeLocal = rankFree(freeSameRegion);
      if (freeLocal) return { coach: freeLocal, source: "FREE" };
      const clubLocal = rankClub(clubSameRegion);
      if (clubLocal && scoreNationalCoachCandidate(clubLocal.coach, team, clubLocal.club, hiredDate, "CLUB") >= 120) {
        return { coach: clubLocal.coach, source: "CLUB", club: clubLocal.club };
      }
      const freeNearby = rankFree(freeCompatible);
      if (freeNearby) return { coach: freeNearby, source: "FREE" };
      const clubNearby = rankClub(clubCompatible);
      if (clubNearby && scoreNationalCoachCandidate(clubNearby.coach, team, clubNearby.club, hiredDate, "CLUB") >= 130) {
        return { coach: clubNearby.coach, source: "CLUB", club: clubNearby.club };
      }
      return null;
    };
    sortTeamsByPriority(updatedTeams).forEach((team) => {
      const currentCoach = team.coachId ? updatedCoaches[team.coachId] : null;
      if (currentCoach?.currentNationalTeamId === team.id) return;
      if (team.coachId && updatedCoaches[team.coachId]) {
        updatedCoaches[team.coachId] = { ...updatedCoaches[team.coachId], currentNationalTeamId: null };
      }
      const candidate = findCandidate(team);
      const coach = candidate?.coach ?? createFallbackNationalCoach(team, hiredDate);
      if (!candidate) updatedCoaches[coach.id] = coach;
      if (candidate?.club) {
        const club = clubById.get(candidate.club.id);
        if (club?.coachId === coach.id) club.coachId = void 0;
      }
      const closedHistory = (coach.history ?? []).map(
        (entry, index, list) => index === list.length - 1 && entry.toYear === null ? { ...entry, toYear: hiredDate.getFullYear(), toMonth: hiredDate.getMonth() + 1 } : entry
      );
      const hiredDateIso = hiredDate.toISOString();
      const appointedCoach = {
        ...coach,
        currentClubId: null,
        currentNationalTeamId: team.id,
        isNationalTeamCoach: true,
        hiredDate: hiredDateIso,
        contractEndDate: CoachService.getDefaultContractEndDate(hiredDateIso),
        annualSalary: CoachService.calculateAnnualSalaryForNationalTeam(team, coach),
        favoritePlayerIds: void 0,
        history: [
          ...closedHistory,
          {
            clubId: team.id,
            clubName: `Reprezentacja ${team.name}`,
            fromYear: hiredDate.getFullYear(),
            fromMonth: hiredDate.getMonth() + 1,
            toYear: null,
            toMonth: null
          }
        ]
      };
      updatedCoaches[appointedCoach.id] = CoachService.normalizeCoachContract(appointedCoach, null, team);
      team.coachId = appointedCoach.id;
      team.tacticId = NationalTeamService.selectTacticForCoach(appointedCoach);
      appointedCount += 1;
      appointments.push({
        teamId: team.id,
        teamName: team.name,
        teamReputation: team.reputation,
        coachId: appointedCoach.id,
        coachName: `${appointedCoach.firstName} ${appointedCoach.lastName}`
      });
    });
    return { updatedTeams, updatedCoaches, updatedClubs, appointedCount, appointments };
  },
  generatePlayerForNT: (teamId, region, teamName, position, teamReputation, index, usedNames, overallCap) => {
    let tier;
    if (teamReputation >= 16) tier = 1;
    else if (teamReputation >= 12) tier = 2;
    else if (teamReputation >= 7) tier = 3;
    else tier = 4;
    const regionProfile = getSyntheticRegionProfile(teamName, region);
    const buildCandidate = () => {
      const age2 = 18 + Math.floor(Math.random() * 16);
      const genData2 = PlayerAttributesGenerator.generateAttributes(position, tier, teamReputation, age2, tier <= 2, void 0, regionProfile);
      return { age: age2, genData: genData2 };
    };
    let candidate = buildCandidate();
    if (overallCap !== void 0) {
      let bestCandidate = candidate;
      for (let attempt = 0; attempt < 10; attempt++) {
        const nextCandidate = buildCandidate();
        if (nextCandidate.genData.overall <= overallCap) {
          candidate = nextCandidate;
          break;
        }
        if (nextCandidate.genData.overall < bestCandidate.genData.overall) {
          bestCandidate = nextCandidate;
        }
        candidate = bestCandidate;
      }
    }
    let namePair = NameGeneratorService.getRandomName(region);
    let fullName = `${namePair.firstName} ${namePair.lastName}`;
    let attempts = 0;
    while (usedNames.has(fullName) && attempts < 50) {
      namePair = NameGeneratorService.getRandomName(region);
      fullName = `${namePair.firstName} ${namePair.lastName}`;
      attempts++;
    }
    usedNames.add(fullName);
    const { age, genData } = candidate;
    return {
      id: `NT_${teamId}_${String(index).padStart(3, "0")}`,
      firstName: namePair.firstName,
      lastName: namePair.lastName,
      clubId: "FREE_AGENTS",
      position,
      nationality: region,
      nationalityCountry: teamName,
      age,
      fatigueDebt: 0,
      overallRating: overallCap !== void 0 ? Math.min(genData.overall, overallCap) : genData.overall,
      attributes: genData.attributes,
      stats: {
        matchesPlayed: 0,
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        cleanSheets: 0,
        seasonalChanges: {},
        ratingHistory: []
      },
      cupStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
      euroStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
      nationalStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
      cupSuspensionMatches: 0,
      euroSuspensionMatches: 0,
      nationalSuspensionMatches: 0,
      health: { status: "HEALTHY" /* HEALTHY */ },
      condition: 100,
      suspensionMatches: 0,
      contractEndDate: new Date(2028, 5, 30).toISOString(),
      annualSalary: 0,
      history: [],
      boardLockoutUntil: null,
      isUntouchable: false,
      negotiationStep: 0,
      negotiationLockoutUntil: null,
      contractLockoutUntil: null,
      freeAgentLockoutUntil: null,
      freeAgentClubLockouts: {},
      isNegotiationPermanentBlocked: false,
      lojalnosc: Math.floor(Math.random() * 99) + 1,
      transferLockoutUntil: null
    };
  },
  // ─── 5. GENEROWANIE SKŁADU DLA JEDNEJ DRUŻYNY ───────────────────────────────
  generateSquadForTeam: (team, coach, allPlayers, assignedPlayerIds) => {
    const allPlayersList = Object.entries(allPlayers).filter(([key]) => key !== FREE_AGENT_CLUB_ID).flatMap(([, arr]) => arr);
    const ovrCap = getTeamOvrCap(team);
    const byPos = (pos) => allPlayersList.filter((p) => {
      if (p.position !== pos) return false;
      return isEligibleForTeam(team, p, [], assignedPlayerIds, { bypassOverallCap: true });
    }).map((p) => ({ player: p, score: calcNationalTeamSelectionScore(team, p, coach) })).sort((a, b) => b.score - a.score).map((x) => x.player);
    const poolGK = byPos("GK" /* GK */);
    const poolDEF = byPos("DEF" /* DEF */);
    const poolMID = byPos("MID" /* MID */);
    const poolFWD = byPos("FWD" /* FWD */);
    const coachExp = coach ? coach.attributes.experience : 50;
    const windowFactor = 0.4 + 0.6 * (coachExp / 99);
    const squadPlayerIds = [];
    const newPlayers = [];
    const selectedPlayerIds = [];
    const playerById = new Map(allPlayersList.map((player) => [player.id, player]));
    const usedNames = /* @__PURE__ */ new Set();
    let genIndex = 0;
    let selectedStarCount = 0;
    const maxStars = getMaxStarsForTeam(team, coachExp);
    const process = (pool, needed, pos) => {
      const topWindow = Math.max(needed, Math.ceil(pool.length * windowFactor));
      const candidatePool = pool.slice(0, topWindow);
      const acceptedPlayers = [];
      for (const player of candidatePool) {
        if (isTeamStarPlayer(team, player) && selectedStarCount >= maxStars) continue;
        acceptedPlayers.push(player);
        if (acceptedPlayers.length >= needed) break;
      }
      acceptedPlayers.forEach((player) => {
        squadPlayerIds.push(player.id);
        selectedPlayerIds.push(player.id);
        assignedPlayerIds.add(player.id);
        if (isTeamStarPlayer(team, player)) selectedStarCount++;
      });
      const missing = Math.max(0, needed - acceptedPlayers.length);
      for (let i = 0; i < missing; i++) {
        const syntheticCap = selectedStarCount >= maxStars && getTeamRule(team)?.starThreshold !== void 0 ? Math.min(ovrCap, (getTeamRule(team)?.starThreshold ?? ovrCap) - 1) : ovrCap;
        const np = NationalTeamService.generatePlayerForNT(
          team.id,
          team.region,
          team.name,
          pos,
          team.reputation,
          genIndex++,
          usedNames,
          syntheticCap
        );
        const calibratedPlayer = calibrateGeneratedNationalPlayer(
          np,
          team,
          squadPlayerIds.map((id) => playerById.get(id)).filter((player) => !!player)
        );
        calibratedPlayer.assignedNationalTeamId = team.id;
        if (isTeamStarPlayer(team, calibratedPlayer)) selectedStarCount++;
        newPlayers.push(calibratedPlayer);
        playerById.set(calibratedPlayer.id, calibratedPlayer);
        squadPlayerIds.push(calibratedPlayer.id);
        assignedPlayerIds.add(calibratedPlayer.id);
      }
    };
    process(poolGK, NT_GK, "GK" /* GK */);
    process(poolDEF, NT_DEF, "DEF" /* DEF */);
    process(poolMID, NT_MID, "MID" /* MID */);
    process(poolFWD, NT_FWD, "FWD" /* FWD */);
    return { squadPlayerIds, newPlayers, selectedPlayerIds };
  },
  // ─── 6. GENEROWANIE SKŁADÓW DLA WSZYSTKICH DRUŻYN ───────────────────────────
  generateAllSquads: (nationalTeams2, ntCoaches, allPlayers) => {
    const updatedTeams = [];
    const allNewPlayers = [];
    const allPlayerUpdates = [];
    const assignedPlayerIds = /* @__PURE__ */ new Set();
    for (const team of sortTeamsByPriority(nationalTeams2)) {
      const coach = team.coachId ? ntCoaches[team.coachId] : null;
      const { squadPlayerIds, newPlayers, selectedPlayerIds } = NationalTeamService.generateSquadForTeam(
        team,
        coach,
        allPlayers,
        assignedPlayerIds
      );
      selectedPlayerIds.forEach((id) => allPlayerUpdates.push({ id, assignedNationalTeamId: team.id }));
      updatedTeams.push({ ...team, squadPlayerIds });
      allNewPlayers.push(...newPlayers);
    }
    const updatedById = new Map(updatedTeams.map((team) => [team.id, team]));
    return {
      updatedTeams: nationalTeams2.map((team) => updatedById.get(team.id) ?? team),
      newPlayers: allNewPlayers,
      playerUpdates: allPlayerUpdates
    };
  },
  // ─── 7. MIESIĘCZNY PRZEGLĄD KADRY ───────────────────────────────────────────
  reviewMonthlySquad: (nationalTeams2, coaches, allPlayers) => {
    const clubPlayersList = Object.entries(allPlayers).filter(([key]) => key !== FREE_AGENT_CLUB_ID).flatMap(([, arr]) => arr).filter((p) => !p.id.startsWith("NT_"));
    const freeAgentsList = (allPlayers[FREE_AGENT_CLUB_ID] ?? []).filter((p) => !!p.nationalityCountry && (!p.id.startsWith("NT_") || p.id.startsWith("NTFA_")));
    const playerMap = {};
    Object.values(allPlayers).flat().forEach((p) => {
      playerMap[p.id] = p;
    });
    const usedPlayerIds = new Set(Object.keys(playerMap));
    const updatedTeams = [];
    const allNewPlayers = [];
    const allPlayerUpdates = [];
    const calledUpFromClub = [];
    const getThreshold = (exp) => {
      if (exp >= 80) return 1;
      if (exp >= 60) return 2;
      if (exp >= 40) return 3;
      return 5;
    };
    const POSITIONS = ["GK" /* GK */, "DEF" /* DEF */, "MID" /* MID */, "FWD" /* FWD */];
    for (const team of sortTeamsByPriority(nationalTeams2)) {
      const coach = team.coachId ? coaches[team.coachId] : null;
      const coachExp = coach ? coach.attributes.experience : 50;
      const threshold = getThreshold(coachExp);
      const teamMaxStars = getMaxStarsForTeam(team, coachExp);
      const seenSquadIds = /* @__PURE__ */ new Set();
      const squadIds = team.squadPlayerIds.filter((id) => {
        if (!playerMap[id] || seenSquadIds.has(id)) return false;
        seenSquadIds.add(id);
        return true;
      });
      let genIndex = team.squadPlayerIds.length;
      const usedNames = /* @__PURE__ */ new Set();
      let changed = squadIds.length !== team.squadPlayerIds.length;
      const generateUniqueSyntheticPlayer = (pos, overallCap) => {
        let np = NationalTeamService.generatePlayerForNT(
          team.id,
          team.region,
          team.name,
          pos,
          team.reputation,
          genIndex++,
          usedNames,
          overallCap
        );
        while (usedPlayerIds.has(np.id)) {
          np = NationalTeamService.generatePlayerForNT(
            team.id,
            team.region,
            team.name,
            pos,
            team.reputation,
            genIndex++,
            usedNames,
            overallCap
          );
        }
        usedPlayerIds.add(np.id);
        return np;
      };
      const starEntries = squadIds.map((id) => ({ id, player: playerMap[id] })).filter((entry) => !!entry.player && isTeamStarPlayer(team, entry.player)).sort((a, b) => b.player.overallRating - a.player.overallRating);
      if (starEntries.length > teamMaxStars) {
        const allowedStarIds = new Set(starEntries.slice(0, teamMaxStars).map((entry) => entry.id));
        for (let i = squadIds.length - 1; i >= 0; i--) {
          const player = playerMap[squadIds[i]];
          if (!player || !isTeamStarPlayer(team, player) || allowedStarIds.has(player.id)) continue;
          allPlayerUpdates.push({ id: player.id, assignedNationalTeamId: null });
          squadIds.splice(i, 1);
          changed = true;
        }
      }
      for (const pos of POSITIONS) {
        const REQUIRED = {
          ["GK" /* GK */]: NT_GK,
          ["DEF" /* DEF */]: NT_DEF,
          ["MID" /* MID */]: NT_MID,
          ["FWD" /* FWD */]: NT_FWD
        };
        const required = REQUIRED[pos] ?? 0;
        const squadAtPos = squadIds.map((id, idx) => ({ id, idx, player: playerMap[id] })).filter((entry) => entry.player?.position === pos);
        const missing = required - squadAtPos.length;
        if (missing > 0) {
          let selectedStarCount = squadIds.map((id) => playerMap[id]).filter((player) => !!player).filter((player) => isTeamStarPlayer(team, player)).length;
          const isEligibleFiller = (p) => {
            if (p.position !== pos) return false;
            if (p.health.status !== "HEALTHY" /* HEALTHY */) return false;
            return isEligibleForTeam(team, p, squadIds, void 0, { bypassOverallCap: true });
          };
          const fillers = clubPlayersList.filter(isEligibleFiller).map((p) => ({ player: p, score: calcNationalTeamSelectionScore(team, p, coach) })).sort((a, b) => b.score - a.score).map((x) => x.player);
          const acceptedFillers = [];
          for (const filler of fillers) {
            if (isTeamStarPlayer(team, filler) && selectedStarCount >= teamMaxStars) continue;
            acceptedFillers.push(filler);
            if (isTeamStarPlayer(team, filler)) selectedStarCount++;
            if (acceptedFillers.length >= missing) break;
          }
          acceptedFillers.forEach((p) => {
            squadIds.push(p.id);
            allPlayerUpdates.push({ id: p.id, assignedNationalTeamId: team.id });
            calledUpFromClub.push({ playerId: p.id, teamName: team.name });
            changed = true;
          });
          let stillMissing = missing - acceptedFillers.length;
          if (stillMissing > 0) {
            const faFillers = freeAgentsList.filter(isEligibleFiller).map((p) => ({ player: p, score: p.overallRating })).sort((a, b) => b.score - a.score).map((x) => x.player);
            const acceptedFA = [];
            for (const filler of faFillers) {
              if (isTeamStarPlayer(team, filler) && selectedStarCount >= teamMaxStars) continue;
              acceptedFA.push(filler);
              if (isTeamStarPlayer(team, filler)) selectedStarCount++;
              if (acceptedFA.length >= stillMissing) break;
            }
            acceptedFA.forEach((p) => {
              squadIds.push(p.id);
              allPlayerUpdates.push({ id: p.id, assignedNationalTeamId: team.id });
              calledUpFromClub.push({ playerId: p.id, teamName: team.name });
              changed = true;
            });
            stillMissing -= acceptedFA.length;
          }
          for (let i = 0; i < stillMissing; i++) {
            const syntheticCap = selectedStarCount >= teamMaxStars && getTeamRule(team)?.starThreshold !== void 0 ? Math.min(getTeamOvrCap(team), (getTeamRule(team)?.starThreshold ?? getTeamOvrCap(team)) - 1) : getTeamOvrCap(team);
            const np = calibrateGeneratedNationalPlayer(
              generateUniqueSyntheticPlayer(pos, syntheticCap),
              team,
              squadIds.map((id) => playerMap[id]).filter((player) => !!player)
            );
            np.assignedNationalTeamId = team.id;
            playerMap[np.id] = np;
            allNewPlayers.push(np);
            squadIds.push(np.id);
            changed = true;
          }
        }
        if (squadAtPos.length === 0) continue;
        const weakest = squadAtPos.sort(
          (a, b) => (a.player?.overallRating ?? 0) - (b.player?.overallRating ?? 0)
        )[0];
        const freeAgentInSquad = squadAtPos.filter((entry) => isFreeAgentPlayer(entry.player)).sort((a, b) => (a.player?.overallRating ?? 0) - (b.player?.overallRating ?? 0))[0] ?? null;
        const replacementTarget = freeAgentInSquad ?? weakest;
        const replacementTargetPlayer = replacementTarget.player ?? null;
        const replacementTargetOvr = replacementTargetPlayer?.overallRating ?? 0;
        const replacementTargetScore = replacementTargetPlayer ? calcNationalTeamSelectionScore(team, replacementTargetPlayer, coach) : 0;
        const isEligible = (p) => {
          if (p.position !== pos) return false;
          if (p.health.status !== "HEALTHY" /* HEALTHY */) return false;
          return isEligibleForTeam(team, p, squadIds, void 0, { bypassOverallCap: true });
        };
        const starsWithoutWeakest = squadIds.filter((id) => id !== replacementTarget.id).map((id) => playerMap[id]).filter((player) => !!player).filter((player) => isTeamStarPlayer(team, player)).length;
        const candidate = clubPlayersList.filter(isEligible).map((p) => ({ player: p, score: calcNationalTeamSelectionScore(team, p, coach) })).sort((a, b) => b.score - a.score).map((x) => x.player).find((player) => !isTeamStarPlayer(team, player) || starsWithoutWeakest < teamMaxStars) ?? null;
        if (!candidate) continue;
        const candidateIsStar = isTeamStarPlayer(team, candidate);
        const canUseOpenStarSlot = isTierFiveNonEuropeanTeam(team) && candidateIsStar && starsWithoutWeakest < teamMaxStars && candidate.overallRating > replacementTargetOvr;
        const candidateScore = calcNationalTeamSelectionScore(team, candidate, coach);
        const reputationOverride = candidateScore - replacementTargetScore >= Math.max(2, threshold * 1.6) && candidate.overallRating >= replacementTargetOvr - 2;
        if (!freeAgentInSquad && !canUseOpenStarSlot && candidate.overallRating - replacementTargetOvr < threshold && !reputationOverride) continue;
        squadIds[replacementTarget.idx] = candidate.id;
        allPlayerUpdates.push({ id: replacementTarget.id, assignedNationalTeamId: null });
        allPlayerUpdates.push({ id: candidate.id, assignedNationalTeamId: team.id });
        calledUpFromClub.push({ playerId: candidate.id, teamName: team.name });
        changed = true;
      }
      const ntCoach = team.coachId ? coaches[team.coachId] : null;
      let finalTeam = changed ? { ...team, squadPlayerIds: squadIds } : team;
      if (ntCoach) {
        const newTacticId = NationalTeamService.selectTacticForSquad(
          squadIds.map((id) => playerMap[id]).filter((p) => !!p),
          ntCoach,
          team.id
        );
        if (newTacticId !== finalTeam.tacticId) {
          finalTeam = { ...finalTeam, tacticId: newTacticId };
        }
      }
      updatedTeams.push(finalTeam);
    }
    const updatedById = new Map(updatedTeams.map((team) => [team.id, team]));
    return {
      updatedTeams: nationalTeams2.map((team) => updatedById.get(team.id) ?? team),
      newPlayers: allNewPlayers,
      playerUpdates: allPlayerUpdates,
      calledUpFromClub
    };
  },
  // ─── 8. DZIENNY PRZEGLĄD KONTUZJI ────────────────────────────────────────────
  reviewDailyInjuries: (nationalTeams2, allPlayers, _currentDate) => {
    const allPlayersList = Object.entries(allPlayers).filter(([key]) => key !== FREE_AGENT_CLUB_ID).flatMap(([, arr]) => arr);
    const playerMap = {};
    allPlayersList.forEach((p) => {
      playerMap[p.id] = p;
    });
    const updatedTeams = [];
    const allNewPlayers = [];
    const allPlayerUpdates = [];
    for (const team of sortTeamsByPriority(nationalTeams2)) {
      const squadIds = [...team.squadPlayerIds];
      let genIndex = team.squadPlayerIds.length;
      const usedNames = /* @__PURE__ */ new Set();
      let changed = false;
      for (let i = 0; i < squadIds.length; i++) {
        const player = playerMap[squadIds[i]];
        if (!player) continue;
        if (player.health.status !== "INJURED" /* INJURED */) continue;
        const starsWithoutInjured = squadIds.filter((_, idx) => idx !== i).map((id) => playerMap[id]).filter((candidate) => !!candidate).filter((candidate) => isTeamStarPlayer(team, candidate)).length;
        const replacement = allPlayersList.filter(
          (p) => p.position === player.position && p.health.status === "HEALTHY" /* HEALTHY */ && isEligibleForTeam(team, p, squadIds, void 0, { bypassOverallCap: true })
        ).sort((a, b) => b.overallRating - a.overallRating).find((candidate) => !isTeamStarPlayer(team, candidate) || starsWithoutInjured < getMaxStarsForTeam(team)) ?? null;
        if (replacement) {
          squadIds[i] = replacement.id;
          allPlayerUpdates.push({ id: replacement.id, assignedNationalTeamId: team.id });
        } else {
          const syntheticCap = starsWithoutInjured >= getMaxStarsForTeam(team) && getTeamRule(team)?.starThreshold !== void 0 ? Math.min(getTeamOvrCap(team), (getTeamRule(team)?.starThreshold ?? getTeamOvrCap(team)) - 1) : getTeamOvrCap(team);
          const np = NationalTeamService.generatePlayerForNT(
            team.id,
            team.region,
            team.name,
            player.position,
            team.reputation,
            genIndex++,
            usedNames,
            syntheticCap
          );
          const calibratedPlayer = calibrateGeneratedNationalPlayer(
            np,
            team,
            squadIds.map((id) => playerMap[id]).filter((candidate) => !!candidate)
          );
          calibratedPlayer.assignedNationalTeamId = team.id;
          allNewPlayers.push(calibratedPlayer);
          squadIds[i] = calibratedPlayer.id;
        }
        changed = true;
      }
      updatedTeams.push(changed ? { ...team, squadPlayerIds: squadIds } : team);
    }
    const updatedById = new Map(updatedTeams.map((team) => [team.id, team]));
    return {
      updatedTeams: nationalTeams2.map((team) => updatedById.get(team.id) ?? team),
      newPlayers: allNewPlayers,
      playerUpdates: allPlayerUpdates
    };
  },
  // ─── 9. SPRAWDZENIE OKNA ZAMROŻENIA KADRY ────────────────────────────────────
  // ─── 10. UZUPEŁNIENIE PULI WOLNYCH AGENTÓW (8 LIPCA) ────────────────────────
  // Generates missing players for any national team with fewer than 25 squad members
  // and adds them to the free agent pool so the coach has enough candidates to call up.
  topUpFreeAgentPool: (nationalTeams2, allPlayers, year) => {
    const NT_SQUAD_TARGET = 25;
    const NT_POS_TARGETS = [
      ["GK" /* GK */, NT_GK],
      ["DEF" /* DEF */, NT_DEF],
      ["MID" /* MID */, NT_MID],
      ["FWD" /* FWD */, NT_FWD]
    ];
    const allPlayersList = Object.values(allPlayers).flat();
    const playerById = new Map(allPlayersList.map((player) => [player.id, player]));
    const usedPlayerIds = new Set(allPlayersList.map((player) => player.id));
    const newPlayers = [];
    const usedNames = /* @__PURE__ */ new Set();
    for (const team of nationalTeams2) {
      const seenSquadIds = /* @__PURE__ */ new Set();
      const squadPlayers = team.squadPlayerIds.filter((id) => {
        if (seenSquadIds.has(id)) return false;
        seenSquadIds.add(id);
        return true;
      }).map((id) => playerById.get(id)).filter((p) => p !== void 0);
      const maxStars = getMaxStarsForTeam(team);
      const starPlayers = squadPlayers.filter((player) => isTeamStarPlayer(team, player)).sort((a, b) => b.overallRating - a.overallRating);
      const allowedStarIds = new Set(starPlayers.slice(0, maxStars).map((player) => player.id));
      const legalSquadPlayers = squadPlayers.filter(
        (player) => !isTeamStarPlayer(team, player) || allowedStarIds.has(player.id)
      );
      const posCount = {};
      legalSquadPlayers.forEach((p) => {
        posCount[p.position] = (posCount[p.position] ?? 0) + 1;
      });
      if (legalSquadPlayers.length >= NT_SQUAD_TARGET && NT_POS_TARGETS.every(([pos, target]) => (posCount[pos] ?? 0) >= target)) continue;
      const ovrCap = getTeamOvrCap(team);
      let genIdx = 0;
      for (const [pos, target] of NT_POS_TARGETS) {
        const missing = Math.max(0, target - (posCount[pos] ?? 0));
        for (let i = 0; i < missing; i++) {
          let playerId = `NTFA_${team.id}_${year}_${genIdx}`;
          while (usedPlayerIds.has(playerId)) {
            genIdx++;
            playerId = `NTFA_${team.id}_${year}_${genIdx}`;
          }
          const player = NationalTeamService.generatePlayerForNT(
            team.id,
            team.region,
            team.name,
            pos,
            team.reputation,
            genIdx,
            usedNames,
            ovrCap
          );
          const calibratedPlayer = calibrateGeneratedNationalPlayer(player, team, legalSquadPlayers);
          calibratedPlayer.id = playerId;
          usedPlayerIds.add(calibratedPlayer.id);
          genIdx++;
          newPlayers.push(calibratedPlayer);
        }
      }
    }
    return { newPlayers };
  },
  isSquadFrozen: (currentDate, seasonStartYear) => {
    const schedule = NT_SCHEDULE_BY_YEAR[seasonStartYear];
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    const limitMs = today.getTime() + NT_FREEZE_DAYS * 24 * 60 * 60 * 1e3;
    const fixedScheduleFrozen = (schedule ?? []).some((md) => {
      const calYear = md.month >= 6 ? seasonStartYear : seasonStartYear + 1;
      const matchDate = new Date(calYear, md.month, md.day);
      matchDate.setHours(0, 0, 0, 0);
      const matchMs = matchDate.getTime();
      return matchMs >= today.getTime() && matchMs <= limitMs;
    });
    if (fixedScheduleFrozen) return true;
    for (let offset = 0; offset <= NT_FREEZE_DAYS; offset += 1) {
      const probe = new Date(today);
      probe.setDate(today.getDate() + offset);
      if (NationsLeagueService.isPotentialMatchDate(probe)) return true;
      if (EuroQualifiersService.isPotentialMatchDate(probe)) return true;
      if (WorldCupQualifiersService.isPotentialMatchDate(probe)) return true;
    }
    return false;
  }
};

// services/MatchHistoryService.ts
var matchHistory = [];
var matchIndex = /* @__PURE__ */ new Map();
var indexKey = (season, matchId) => `${season}::${matchId}`;
var toArchivedSummary = (entry) => ({
  matchId: entry.matchId,
  date: entry.date,
  season: entry.season,
  archived: true,
  competition: entry.competition,
  homeTeamId: entry.homeTeamId,
  awayTeamId: entry.awayTeamId,
  homeScore: entry.homeScore,
  awayScore: entry.awayScore,
  homePenaltyScore: entry.homePenaltyScore,
  awayPenaltyScore: entry.awayPenaltyScore,
  isExtraTime: entry.isExtraTime,
  attendance: entry.attendance,
  venue: entry.venue,
  goals: [],
  cards: []
});
var MatchHistoryService = {
  // Funkcja dodająca nowy wpis
  logMatch: (entry) => {
    const duplicateIndex = matchIndex.get(indexKey(entry.season, entry.matchId));
    if (duplicateIndex !== void 0) {
      matchHistory = matchHistory.map(
        (existing, index) => index === duplicateIndex ? entry : existing
      );
      console.log(`[MatchHistory] Zaktualizowano mecz: ${entry.homeTeamId} vs ${entry.awayTeamId}`);
      return;
    }
    matchHistory.push(entry);
    matchIndex.set(indexKey(entry.season, entry.matchId), matchHistory.length - 1);
    console.log(`[MatchHistory] Zapisano mecz: ${entry.homeTeamId} vs ${entry.awayTeamId}`);
  },
  updateMatch: (matchId, updates) => {
    matchHistory = matchHistory.map(
      (entry) => entry.matchId === matchId ? { ...entry, ...updates } : entry
    );
  },
  // Funkcja pobierająca całą historię
  getAll: () => [...matchHistory],
  // Funkcja pobierająca mecze konkretnej drużyny
  getTeamHistory: (teamId) => {
    return matchHistory.filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId);
  },
  archiveBeforeSeason: (firstDetailedSeason) => {
    let archivedCount = 0;
    matchHistory = matchHistory.map((entry) => {
      if (entry.season >= firstDetailedSeason || entry.archived) return entry;
      archivedCount += 1;
      return toArchivedSummary(entry);
    });
    return archivedCount;
  },
  // PERF/ROZMIAR ZAPISU (dodane 2026-08-01): zwraca historię meczów przeznaczoną
  // do ZAPISU DO PLIKU — mecze starsze niż `detailSeasons` pełnych sezonów wstecz
  // dostają wersję "podglądową" (bez goals[]/cards[]), dokładnie tym samym
  // przekształceniem (toArchivedSummary) co archiveBeforeSeason powyżej — zero
  // nowej logiki, tylko reużycie istniejącej funkcji.
  //
  // KLUCZOWA RÓŻNICA względem archiveBeforeSeason: ta funkcja NIE mutuje żywej
  // tablicy `matchHistory` w pamięci (buduje nową tablicę przez .map(), nie
  // przypisuje do `matchHistory`). Rozgrywka w bieżącej sesji (widok "Historia
  // meczów", statystyki na żywo) nadal widzi pełne szczegóły niezależnie od wieku
  // meczu — przycięcie dotyczy WYŁĄCZNIE tego, co trafia do pliku zapisu. Dopiero
  // wczytanie takiego zapisu pokaże stare mecze bez szczegółów (bo to fizycznie
  // jedyne dane, jakie w nim wtedy będą).
  getAllForSave: (currentSeasonNumber, detailSeasons = 2) => {
    const firstDetailedSeason = currentSeasonNumber - (detailSeasons - 1);
    return matchHistory.map((entry) => {
      if (entry.season >= firstDetailedSeason || entry.archived) return entry;
      return toArchivedSummary(entry);
    });
  },
  // Funkcja czyszcząca (np. przy nowej grze)
  clear: () => {
    matchHistory = [];
    matchIndex.clear();
  }
};

// services/PlayerPositionFitService.ts
var DEFAULT_SECONDARY_POSITION_RATING = 50;
var clamp5 = (value, min, max) => Math.max(min, Math.min(max, value));
var isGoalkeeperMismatch = (player, role) => player.position === "GK" /* GK */ ? role !== "GK" /* GK */ : role === "GK" /* GK */;
var getPositionFamilyDistance = (from, to) => {
  if (from === to) return 0;
  if (from === "GK" /* GK */ || to === "GK" /* GK */) return 1;
  if (from === "DEF" /* DEF */ && to === "FWD" /* FWD */ || from === "FWD" /* FWD */ && to === "DEF" /* DEF */) return 0.95;
  if (from === "DEF" /* DEF */ && to === "MID" /* MID */ || from === "MID" /* MID */ && to === "DEF" /* DEF */) return 0.55;
  if (from === "MID" /* MID */ && to === "FWD" /* FWD */ || from === "FWD" /* FWD */ && to === "MID" /* MID */) return 0.48;
  return 0.7;
};
var getRoleOverall = (player, role) => PlayerAttributesGenerator.calculateOverall(player.attributes, role);
var getRoleFamiliarity = (player, role, useSecondaryPosition = false) => {
  if (player.position === role) return 1;
  if (isGoalkeeperMismatch(player, role)) return 0;
  if (useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role)) {
    const rating = PlayerPositionFitService.getSecondaryRating(player);
    return clamp5(0.72 + rating / 99 * 0.28, 0.72, 1);
  }
  return clamp5(1 - getPositionFamilyDistance(player.position, role) * 0.42, 0.54, 0.78);
};
var PlayerPositionFitService = {
  hasSecondaryPosition: (player, role) => !isGoalkeeperMismatch(player, role) && player.secondaryPosition === role && player.secondaryPosition !== player.position,
  matchesRole: (player, role, useSecondaryPosition = false) => player.position === role || useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role),
  getPenaltyFactor: (player, role, useSecondaryPosition = false) => {
    if (player.position === role) return 0;
    if (isGoalkeeperMismatch(player, role)) return 1;
    const naturalOverall = Math.max(1, player.overallRating || getRoleOverall(player, player.position));
    const roleOverall = PlayerPositionFitService.getRoleOverall(player, role);
    const familyDistance = getPositionFamilyDistance(player.position, role);
    const familiarity = getRoleFamiliarity(player, role, useSecondaryPosition);
    const qualityDrop = clamp5((naturalOverall - roleOverall) / 24, -0.25, 1);
    if (useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role)) {
      const secondaryGap = 1 - PlayerPositionFitService.getSecondaryRating(player) / 99;
      const raw2 = qualityDrop * 0.58 + secondaryGap * 0.32 + (1 - familiarity) * 0.1;
      return clamp5(Math.pow(Math.max(0, raw2), 1.25), 0.02, 0.55);
    }
    const raw = qualityDrop * 0.68 + familyDistance * 0.24 + (1 - familiarity) * 0.08;
    return clamp5(Math.pow(Math.max(0, raw), 1.18), 0.08, 1);
  },
  getFitScoreBonus: (player, role, useSecondaryPosition = false) => {
    if (player.position === role) return 16;
    if (isGoalkeeperMismatch(player, role)) return -80;
    const roleOverall = PlayerPositionFitService.getRoleOverall(player, role);
    const naturalOverall = Math.max(1, player.overallRating || getRoleOverall(player, player.position));
    const familiarity = getRoleFamiliarity(player, role, useSecondaryPosition);
    const roleQualityDelta = clamp5(roleOverall - naturalOverall, -18, 12);
    const base = useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role) ? 16 * (PlayerPositionFitService.getSecondaryRating(player) / 99) : -10 * getPositionFamilyDistance(player.position, role);
    return clamp5(base + roleQualityDelta * 0.55 + (familiarity - 0.65) * 12, -24, 16);
  },
  getSecondaryRating: (player) => Math.max(1, Math.min(99, player.secondaryPositionRating ?? DEFAULT_SECONDARY_POSITION_RATING)),
  getRoleOverall,
  // Effective role overall is the number the match engine should use when team strength depends on
  // who is actually occupying each tactical slot during the live match.
  getEffectiveRoleOverall: (player, role, useSecondaryPosition = false) => {
    if (player.position === role) return clamp5(Math.round(player.overallRating || getRoleOverall(player, role)), 1, 99);
    if (isGoalkeeperMismatch(player, role)) return Math.max(1, Math.round(getRoleOverall(player, role) * 0.35));
    const roleOverall = getRoleOverall(player, role);
    const penaltyFactor = PlayerPositionFitService.getPenaltyFactor(player, role, useSecondaryPosition);
    const familiarityDrag = player.position === role ? 0 : penaltyFactor * 8;
    return clamp5(Math.round(roleOverall - familiarityDrag), 1, 99);
  }
};

// services/TeamFormImpactService.ts
var clamp6 = (value, min, max) => Math.max(min, Math.min(max, value));
var average2 = (values, fallback) => values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;
var getPlayerForm = (player) => player ? player.form ?? PlayerFormService.calculate(player).score : 50;
var getPlayersByIds = (players, ids) => {
  const playerMap = new Map(players.map((player) => [player.id, player]));
  return ids.map((id) => id ? playerMap.get(id) : void 0).filter((player) => !!player);
};
var getBaseFormMultiplier = (form) => {
  const centered = (clamp6(form, 0, 100) - 50) / 50;
  const curve = Math.sign(centered) * Math.pow(Math.abs(centered), 1.18);
  return clamp6(1 + curve * 0.18, 0.82, 1.18);
};
var getTeamQuality = (players, lineup) => {
  const starters = getPlayersByIds(players, lineup.startingXI);
  return average2(starters.map((player) => player.overallRating ?? 50), 50);
};
var getTeamForm = (players, lineup) => {
  const starters = getPlayersByIds(players, lineup.startingXI);
  const bench = getPlayersByIds(players, lineup.bench ?? []);
  const starterForm = average2(starters.map(getPlayerForm), 50);
  const benchForm = average2(bench.map(getPlayerForm), starterForm);
  return starterForm * 0.88 + benchForm * 0.12;
};
var adjustForQualityGap = (ownMultiplier, ownQuality, opponentQuality) => {
  const qualityGap = Math.abs(ownQuality - opponentQuality);
  const isUnderdog = ownQuality < opponentQuality;
  const isFavorite = ownQuality > opponentQuality;
  if (qualityGap <= 12) return ownMultiplier;
  if (isUnderdog && ownMultiplier > 1) {
    const boost = ownMultiplier - 1;
    const boostFactor = qualityGap <= 25 ? 1 - (qualityGap - 12) / 13 * 0.45 : 0.35;
    return 1 + boost * boostFactor;
  }
  if (isFavorite && ownMultiplier < 1) {
    const penalty = 1 - ownMultiplier;
    const penaltyFactor = qualityGap <= 25 ? 1 - (qualityGap - 12) / 13 * 0.2 : 0.72;
    return 1 - penalty * penaltyFactor;
  }
  return ownMultiplier;
};
var getDefenseLeakMultiplier = (opponentMultiplier) => {
  if (opponentMultiplier < 1) return 1 + (1 - opponentMultiplier) * 0.35;
  return 1 - (opponentMultiplier - 1) * 0.16;
};
var TeamFormImpactService = {
  getPlayerForm,
  getSelectionFormBonus(player, coachQuality) {
    const form = getPlayerForm(player);
    const awareness = clamp6(coachQuality / 100, 0.25, 1);
    const weight = 7 + awareness * 7;
    return clamp6((form - 50) / 50 * weight, -14, 14);
  },
  calculateMatchImpact(homePlayers, awayPlayers, homeLineup, awayLineup) {
    const homeQuality = getTeamQuality(homePlayers, homeLineup);
    const awayQuality = getTeamQuality(awayPlayers, awayLineup);
    const homeForm = getTeamForm(homePlayers, homeLineup);
    const awayForm = getTeamForm(awayPlayers, awayLineup);
    const homePerformance = adjustForQualityGap(getBaseFormMultiplier(homeForm), homeQuality, awayQuality);
    const awayPerformance = adjustForQualityGap(getBaseFormMultiplier(awayForm), awayQuality, homeQuality);
    const homeGoalChanceMultiplier = clamp6(homePerformance * getDefenseLeakMultiplier(awayPerformance), 0.72, 1.32);
    const awayGoalChanceMultiplier = clamp6(awayPerformance * getDefenseLeakMultiplier(homePerformance), 0.72, 1.32);
    return {
      home: {
        teamForm: homeForm,
        teamQuality: homeQuality,
        performanceMultiplier: homePerformance
      },
      away: {
        teamForm: awayForm,
        teamQuality: awayQuality,
        performanceMultiplier: awayPerformance
      },
      homeGoalChanceMultiplier,
      awayGoalChanceMultiplier
    };
  }
};

// services/LineupService.ts
var FAVORITE_TACTIC_MAP = {
  "4-3-3 Atak": "4-3-3",
  "3-4-3": "3-4-3",
  "Wysoki Pressing": "4-3-3",
  "Total Football": "3-4-3",
  "4-1-2-1-2": "4-4-2-DIAMOND",
  "4-4-2": "4-4-2",
  "4-3-3 Zr\xF3wnowa\u017Cona": "4-3-3",
  "3-5-2": "3-5-2",
  "4-5-1": "4-1-4-1",
  "4-2-3-1": "4-2-3-1",
  "5-3-2": "5-3-2",
  "5-4-1": "5-4-1",
  "5-3-2 Blok": "5-3-2",
  "4-4-2 Kontratak": "4-4-2-DEF",
  "Niski Blok": "6-3-1",
  "4-5-1 Defensywna": "4-5-1",
  "3-6-1": "6-3-1"
};
var checkTacticFeasibility = (players, tacticId) => {
  if (players.length < 11 || !players.some((player) => player.position === "GK" /* GK */)) return false;
  const tactic = TacticRepository.getById(tacticId);
  const required = {};
  for (let i = 1; i < tactic.slots.length; i++) {
    const role = tactic.slots[i].role;
    required[role] = (required[role] || 0) + 1;
  }
  const available = {};
  players.forEach((p) => {
    if (p.position !== "GK" /* GK */) {
      available[p.position] = (available[p.position] || 0) + 1;
    }
  });
  return Object.entries(required).every(([pos, count]) => (available[pos] || 0) >= count);
};
var normalizeCoachTacticId = (value) => {
  if (!value) return null;
  const mapped = FAVORITE_TACTIC_MAP[value];
  if (mapped) return mapped;
  const direct = TacticRepository.getAll().find((tactic) => tactic.id === value || tactic.name === value);
  return direct?.id ?? null;
};
var resolveCoachTacticId = (coach, players, intent, fallbackTacticId) => {
  const preferenceOrder = intent === "OFFENSIVE" ? ["offensive", "neutral", "defensive"] : intent === "DEFENSIVE" ? ["defensive", "neutral", "offensive"] : ["neutral", "offensive", "defensive"];
  if (coach?.favoriteTactics) {
    for (const preference of preferenceOrder) {
      const tacticId = normalizeCoachTacticId(coach.favoriteTactics[preference]);
      if (tacticId && checkTacticFeasibility(players, tacticId)) return tacticId;
    }
  }
  const normalizedFallback = normalizeCoachTacticId(fallbackTacticId) ?? fallbackTacticId;
  if (checkTacticFeasibility(players, normalizedFallback)) return normalizedFallback;
  return TacticRepository.getAll().find((tactic) => checkTacticFeasibility(players, tactic.id))?.id ?? TacticRepository.getDefault().id;
};
var hashString = (value) => {
  let hash2 = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash2 = (hash2 << 5) - hash2 + value.charCodeAt(i) | 0;
  }
  return Math.abs(hash2);
};
var getCoachQuality = (coach) => {
  if (!coach) return 50;
  return (coach.attributes.experience ?? 50) * 0.4 + (coach.attributes.decisionMaking ?? 50) * 0.4 + (coach.attributes.training ?? 50) * 0.2;
};
var getSelectionNoise = (player, coachQuality, seedKey) => {
  const range = Math.max(1.8, 9 - coachQuality * 0.065);
  const roll = hashString(`${seedKey}_${player.id}`) % 1e4 / 1e4;
  return (roll - 0.5) * 2 * range;
};
var getInstructionProfileFit = (player, profile, coachQuality) => {
  if (!profile || player.position === "GK" /* GK */) return 0;
  const a = player.attributes;
  let score = 0;
  if (profile.tempo === "FAST") {
    score += (a.pace - 60) * 0.03;
    score += (a.acceleration - 60) * 0.024;
    score += (a.stamina - 60) * 0.026;
    if (player.position === "FWD" /* FWD */) score += (a.finishing - 60) * 0.018;
  } else if (profile.tempo === "SLOW") {
    score += (a.passing - 60) * 0.024;
    score += (a.technique - 60) * 0.024;
    score += (a.vision - 60) * 0.02;
    score += (a.mentality - 60) * 0.014;
  }
  if (profile.mindset === "OFFENSIVE") {
    score += (a.attacking - 60) * 0.03;
    score += (a.technique - 60) * 0.018;
    if (player.position === "FWD" /* FWD */) score += (a.finishing - 60) * 0.032;
    if (player.position === "MID" /* MID */) score += (a.vision - 60) * 0.018;
  } else if (profile.mindset === "DEFENSIVE") {
    score += (a.defending - 60) * 0.032;
    score += (a.positioning - 60) * 0.026;
    score += (a.strength - 60) * 0.014;
    if (player.position === "DEF" /* DEF */ || player.position === "MID" /* MID */) {
      score += (a.mentality - 60) * 0.014;
    }
  }
  if (profile.passing === "SHORT") {
    score += (a.passing - 60) * 0.03;
    score += (a.technique - 60) * 0.024;
    score += (a.vision - 60) * 0.018;
  } else if (profile.passing === "LONG") {
    score += (a.passing - 60) * 0.024;
    score += (a.vision - 60) * 0.018;
    score += (a.strength - 60) * 0.01;
    if (player.position === "FWD" /* FWD */) score += (a.pace - 60) * 0.024;
  }
  if (profile.pressing === "PRESSING") {
    score += (a.workRate - 60) * 0.03;
    score += (a.stamina - 60) * 0.026;
    score += (a.aggression - 60) * 0.02;
    score += (a.pace - 60) * 0.014;
  }
  if (profile.counterAttack === "COUNTER") {
    score += (a.pace - 60) * 0.03;
    score += (a.acceleration - 60) * 0.02;
    score += (a.passing - 60) * 0.018;
    if (player.position === "FWD" /* FWD */) score += (a.finishing - 60) * 0.024;
  }
  if (profile.intensity === "AGGRESSIVE") {
    score += (a.stamina - 60) * 0.022;
    score += (a.workRate - 60) * 0.02;
    score += (a.aggression - 60) * 0.014;
  } else if (profile.intensity === "CAUTIOUS") {
    score += (a.positioning - 60) * 0.02;
    score += (a.mentality - 60) * 0.018;
  }
  const coachStyleRead = Math.max(0, Math.min(1, (coachQuality - 42) / 42));
  return Math.max(-4.5, Math.min(5.5, score * coachStyleRead));
};
var getSelectionScore = (player, coach = null, seedKey = "lineup", formAware = false, instructionProfile) => {
  const moralePlayer = PlayerMoraleService.ensurePlayerState(player);
  const moraleScore = PlayerMoraleService.getEffectiveOverall(moralePlayer);
  const roleBonus = player.squadRole === "KEY_PLAYER" ? 1.2 : player.squadRole === "STARTER" ? 0.7 : 0;
  const coachQuality = getCoachQuality(coach);
  const formBonus = formAware ? TeamFormImpactService.getSelectionFormBonus(player, coachQuality) : 0;
  const noise = formAware ? getSelectionNoise(player, coachQuality, seedKey) : 0;
  const instructionFit = getInstructionProfileFit(player, instructionProfile, coachQuality);
  return moraleScore + roleBonus + formBonus + instructionFit + noise;
};
var isEuropeanCompetition = (competitionId) => {
  if (!competitionId) return false;
  return competitionId === "EURO_CUP" || competitionId === "UEFA_SUPER_CUP" || competitionId.startsWith("CL_") || competitionId.startsWith("EL_") || competitionId.startsWith("CONF_");
};
var getSuspensionMatchesForCompetition = (player, competitionId) => {
  if (competitionId === "POLISH_CUP" || competitionId === "SUPER_CUP") {
    return player.cupSuspensionMatches ?? 0;
  }
  if (isEuropeanCompetition(competitionId)) {
    return player.euroSuspensionMatches ?? 0;
  }
  return player.suspensionMatches ?? 0;
};
var isUnavailableForLineup = (player, competitionId) => {
  const injuryDays = player.health.injury?.daysRemaining ?? 0;
  return getSuspensionMatchesForCompetition(player, competitionId) > 0 || player.health.status === "INJURED" /* INJURED */ && (player.health.injury?.severity === "SEVERE" /* SEVERE */ || injuryDays > 2);
};
var isMatchEligibleForLineup = (player, competitionId) => !isUnavailableForLineup(player, competitionId) && player.condition >= 60 && (player.health.status === "HEALTHY" /* HEALTHY */ || (player.health.injury?.daysRemaining ?? 0) <= 2);
var LineupService = {
  getSuspensionMatchesForCompetition,
  resolveCoachTacticId: (coach, players, intent, fallbackTacticId = "4-4-2") => resolveCoachTacticId(coach, players, intent, fallbackTacticId),
  isUnavailableForLineup: (player, options = {}) => isUnavailableForLineup(player, options.competitionId),
  getMatchEligiblePlayers: (players, options = {}) => players.filter((player) => isMatchEligibleForLineup(player, options.competitionId)),
  isTacticFeasible: (players, tacticId) => checkTacticFeasibility(players, tacticId),
  /**
   * Deterministyczny wybór składu.
   */
  autoPickLineup: (clubId, players, tacticId = "4-4-2", coach = null, options = {}) => {
    const useSecondaryPositions = options.useSecondaryPositions ?? false;
    const competitionId = options.competitionId;
    const formAware = options.formAware ?? false;
    const selectionSeed = options.selectionSeed ?? `${clubId}_${tacticId}`;
    const instructionProfile = options.instructionProfile;
    if (coach?.favoriteTactics && !options.respectRequestedTactic) {
      tacticId = resolveCoachTacticId(coach, players, "NEUTRAL", tacticId);
    }
    const tactic = TacticRepository.getById(tacticId);
    const availablePlayers = players.filter((p) => isMatchEligibleForLineup(p, competitionId));
    const COND_XI = 90;
    const COND_BENCH = 85;
    const sortedAll = [...availablePlayers].sort(
      (a, b) => getSelectionScore(b, coach, selectionSeed, formAware, instructionProfile) - getSelectionScore(a, coach, selectionSeed, formAware, instructionProfile)
    );
    const poolXI = sortedAll.filter((p) => p.condition >= COND_XI);
    const poolBench = sortedAll.filter((p) => p.condition >= COND_BENCH && p.condition < COND_XI);
    const poolRest = sortedAll.filter((p) => p.condition < COND_BENCH);
    const sortedPlayers = sortedAll;
    const startingXI = new Array(11).fill(null);
    const bench = [];
    const reserves = [];
    const usedPlayerIds = /* @__PURE__ */ new Set();
    const gkXI = poolXI.find((p) => p.position === "GK" /* GK */);
    const gkBench = poolBench.find((p) => p.position === "GK" /* GK */);
    const gkRest = poolRest.find((p) => p.position === "GK" /* GK */);
    const bestGK = gkXI ?? gkBench ?? gkRest;
    if (bestGK) {
      startingXI[0] = bestGK.id;
      usedPlayerIds.add(bestGK.id);
    }
    for (let i = 1; i < 11; i++) {
      const requiredRole = tactic.slots[i].role;
      const candidate = poolXI.find((p) => !usedPlayerIds.has(p.id) && p.position === requiredRole) ?? poolBench.find((p) => !usedPlayerIds.has(p.id) && p.position === requiredRole) ?? poolRest.find((p) => !usedPlayerIds.has(p.id) && p.position === requiredRole) ?? (useSecondaryPositions ? poolXI.find((p) => !usedPlayerIds.has(p.id) && PlayerPositionFitService.hasSecondaryPosition(p, requiredRole)) : void 0) ?? (useSecondaryPositions ? poolBench.find((p) => !usedPlayerIds.has(p.id) && PlayerPositionFitService.hasSecondaryPosition(p, requiredRole)) : void 0) ?? (useSecondaryPositions ? poolRest.find((p) => !usedPlayerIds.has(p.id) && PlayerPositionFitService.hasSecondaryPosition(p, requiredRole)) : void 0) ?? poolXI.find((p) => !usedPlayerIds.has(p.id)) ?? poolBench.find((p) => !usedPlayerIds.has(p.id)) ?? poolRest.find((p) => !usedPlayerIds.has(p.id));
      if (candidate) {
        startingXI[i] = candidate.id;
        usedPlayerIds.add(candidate.id);
      }
    }
    const benchEligible = [...poolXI, ...poolBench];
    const addToBench = (p) => {
      bench.push(p.id);
      usedPlayerIds.add(p.id);
    };
    const findBench = (pos) => benchEligible.find((p) => !usedPlayerIds.has(p.id) && (pos === null || p.position === pos)) ?? poolRest.find((p) => !usedPlayerIds.has(p.id) && (pos === null || p.position === pos)) ?? (useSecondaryPositions ? benchEligible.find((p) => !usedPlayerIds.has(p.id) && pos !== null && PlayerPositionFitService.hasSecondaryPosition(p, pos)) : void 0) ?? (useSecondaryPositions ? poolRest.find((p) => !usedPlayerIds.has(p.id) && pos !== null && PlayerPositionFitService.hasSecondaryPosition(p, pos)) : void 0);
    const bGK = findBench("GK" /* GK */);
    if (bGK) addToBench(bGK);
    const mandatoryPositions = ["DEF" /* DEF */, "DEF" /* DEF */, "DEF" /* DEF */, "MID" /* MID */, "MID" /* MID */, "MID" /* MID */, "FWD" /* FWD */, "FWD" /* FWD */];
    for (const pos of mandatoryPositions) {
      if (bench.length >= 9) break;
      const p = findBench(pos);
      if (p) addToBench(p);
    }
    for (const p of benchEligible) {
      if (bench.length >= 9) break;
      if (!usedPlayerIds.has(p.id) && p.position !== "GK" /* GK */) addToBench(p);
    }
    for (const p of poolRest) {
      if (bench.length >= 9) break;
      if (!usedPlayerIds.has(p.id) && p.position !== "GK" /* GK */) addToBench(p);
    }
    for (const p of [...benchEligible, ...poolRest]) {
      if (bench.length >= 9) break;
      if (!usedPlayerIds.has(p.id)) addToBench(p);
    }
    const allIds = players.map((p) => p.id);
    allIds.forEach((id) => {
      if (!usedPlayerIds.has(id)) {
        reserves.push(id);
      }
    });
    return { clubId, tacticId: tactic.id, startingXI, bench, reserves };
  },
  calculateFitScore: (player, role, options = {}) => {
    const attr = player.attributes;
    const isGkPlayer = player.position === "GK" /* GK */;
    const isGkRole = role === "GK" /* GK */;
    const moraleFit = (PlayerMoraleService.getLineupReadinessMultiplier(PlayerMoraleService.ensurePlayerState(player)) - 1) * 45;
    const positionFitBonus = PlayerPositionFitService.getFitScoreBonus(player, role, options.useSecondaryPositions ?? false);
    const effectiveRoleOverall = PlayerPositionFitService.getEffectiveRoleOverall(player, role, options.useSecondaryPositions ?? false);
    const roleOverallAdjustment = (effectiveRoleOverall - player.overallRating) * 1.15;
    if (isGkPlayer && !isGkRole || !isGkPlayer && isGkRole) {
      return -2e3 + getSelectionScore(player);
    }
    switch (role) {
      case "GK" /* GK */:
        return attr.goalkeeping * 2 + attr.positioning + moraleFit + positionFitBonus + roleOverallAdjustment;
      case "DEF" /* DEF */:
        return attr.defending * 1.5 + attr.strength + attr.positioning + moraleFit + positionFitBonus + roleOverallAdjustment;
      case "MID" /* MID */:
        return attr.passing * 1.2 + attr.vision + attr.technique + moraleFit + positionFitBonus + roleOverallAdjustment;
      case "FWD" /* FWD */:
        return attr.finishing * 1.5 + attr.attacking + attr.pace * 0.5 + moraleFit + positionFitBonus + roleOverallAdjustment;
      default:
        return getSelectionScore(player);
    }
  },
  /**
     * Naprawia skład używając Systemu Kaskadowego (Stage 1 PRO).
     * Priorytet: Świeżość > Pozycja > Rating.
     */
  repairLineup: (lineup, players, options = {}) => {
    const AI_FRESH_THRESHOLD = 87;
    const tactic = TacticRepository.getById(lineup.tacticId);
    const canPlay = (p) => !isUnavailableForLineup(p, options.competitionId) && p.condition >= 60;
    const allAvailable = players.filter(canPlay);
    const freshPool = allAvailable.filter((p) => p.condition >= AI_FRESH_THRESHOLD).sort((a, b) => getSelectionScore(b) - getSelectionScore(a));
    const tiredPool = allAvailable.filter((p) => p.condition < AI_FRESH_THRESHOLD).sort((a, b) => getSelectionScore(b) - getSelectionScore(a));
    let usedIds = /* @__PURE__ */ new Set();
    const newXI = new Array(11).fill(null);
    const freshGk = freshPool.find((p) => p.position === "GK" /* GK */);
    const bestGk = freshGk || tiredPool.find((p) => p.position === "GK" /* GK */);
    if (bestGk) {
      newXI[0] = bestGk.id;
      usedIds.add(bestGk.id);
    }
    for (let i = 1; i < 11; i++) {
      const role = tactic.slots[i].role;
      const match = freshPool.find((p) => p.position === role && !usedIds.has(p.id));
      if (match) {
        newXI[i] = match.id;
        usedIds.add(match.id);
      }
    }
    for (let i = 1; i < 11; i++) {
      if (!newXI[i]) {
        const match = freshPool.find((p) => p.position !== "GK" /* GK */ && !usedIds.has(p.id));
        if (match) {
          newXI[i] = match.id;
          usedIds.add(match.id);
        }
      }
    }
    for (let i = 1; i < 11; i++) {
      if (!newXI[i]) {
        const role = tactic.slots[i].role;
        const match = tiredPool.find((p) => p.position === role && !usedIds.has(p.id));
        if (match) {
          newXI[i] = match.id;
          usedIds.add(match.id);
        }
      }
    }
    for (let i = 1; i < 11; i++) {
      if (!newXI[i]) {
        const match = allAvailable.find((p) => !usedIds.has(p.id));
        if (match) {
          newXI[i] = match.id;
          usedIds.add(match.id);
        }
      }
    }
    const newBench = [];
    const benchTarget = ["GK" /* GK */, "DEF" /* DEF */, "DEF" /* DEF */, "DEF" /* DEF */, "MID" /* MID */, "MID" /* MID */, "MID" /* MID */, "FWD" /* FWD */, "FWD" /* FWD */];
    benchTarget.forEach((pos) => {
      if (newBench.length >= 9) return;
      const sub = freshPool.find((p) => p.position === pos && !usedIds.has(p.id)) || freshPool.find((p) => !usedIds.has(p.id)) || tiredPool.find((p) => p.position === pos && !usedIds.has(p.id)) || tiredPool.find((p) => !usedIds.has(p.id));
      if (sub) {
        newBench.push(sub.id);
        usedIds.add(sub.id);
      }
    });
    const newReserves = players.map((p) => p.id).filter((id) => !usedIds.has(id));
    return { ...lineup, startingXI: newXI, bench: newBench, reserves: newReserves };
  },
  evictSuspendedPlayers: (lineup, players, options = {}) => {
    const newLineup = { ...lineup, startingXI: [...lineup.startingXI], bench: [...lineup.bench], reserves: [...lineup.reserves] };
    const isRestricted = (id) => {
      const p = players.find((x) => x.id === id);
      if (!p) return false;
      return isUnavailableForLineup(p, options.competitionId);
    };
    newLineup.startingXI = newLineup.startingXI.map((id) => {
      if (id && isRestricted(id)) {
        if (!newLineup.reserves.includes(id)) newLineup.reserves.push(id);
        return null;
      }
      return id;
    });
    newLineup.bench = newLineup.bench.filter((id) => {
      if (isRestricted(id)) {
        if (!newLineup.reserves.includes(id)) newLineup.reserves.push(id);
        return false;
      }
      return true;
    });
    return newLineup;
  },
  validateLineup: (lineup, allClubPlayers, options = {}) => {
    const missingCount = lineup.startingXI.filter((id) => id === null).length;
    if (missingCount > 0) return { valid: false, error: `Sk\u0142ad niekompletny! Brakuje ${missingCount} zawodnik\xF3w.` };
    if (lineup.bench.length > 9) return { valid: false, error: "Zbyt wielu zawodnik\xF3w na \u0142awce" };
    const startPlayers = allClubPlayers.filter((p) => lineup.startingXI.includes(p.id));
    const hasGK = startPlayers.some((p) => p.position === "GK" /* GK */);
    if (!hasGK) return { valid: false, error: "Brak bramkarza w podstawowej jedenastce!" };
    if (startPlayers.some((p) => getSuspensionMatchesForCompetition(p, options.competitionId) > 0)) return { valid: false, error: "W wyj\u015Bciowym sk\u0142adzie znajduje si\u0119 zawieszony zawodnik!" };
    if (startPlayers.some((p) => p.health.status === "INJURED" /* INJURED */ && (p.health.injury?.severity === "SEVERE" /* SEVERE */ || (p.health.injury?.daysRemaining ?? 0) > 2))) return { valid: false, error: "W wyj\u015Bciowym sk\u0142adzie znajduje si\u0119 kontuzjowany zawodnik!" };
    return { valid: true };
  },
  assignToSlot: (lineup, playerId, slotIdx) => {
    const newLineup = { ...lineup, startingXI: [...lineup.startingXI], bench: [...lineup.bench], reserves: [...lineup.reserves] };
    newLineup.startingXI = newLineup.startingXI.map((id) => id === playerId ? null : id);
    newLineup.bench = newLineup.bench.filter((id) => id !== playerId);
    newLineup.reserves = newLineup.reserves.filter((id) => id !== playerId);
    const oldOccupant = newLineup.startingXI[slotIdx];
    if (oldOccupant) newLineup.reserves.push(oldOccupant);
    newLineup.startingXI[slotIdx] = playerId;
    return newLineup;
  },
  swapPlayers: (lineup, sourceId, targetId, sourceIdx, targetIdx) => {
    const nextLineup = {
      ...lineup,
      startingXI: [...lineup.startingXI],
      bench: [...lineup.bench],
      reserves: [...lineup.reserves]
    };
    for (let i = 0; i < 11; i++) {
      if (sourceIdx === i || sourceId !== null && nextLineup.startingXI[i] === sourceId) nextLineup.startingXI[i] = null;
      else if (targetIdx === i || targetId !== null && nextLineup.startingXI[i] === targetId) nextLineup.startingXI[i] = null;
    }
    if (sourceId) {
      nextLineup.bench = nextLineup.bench.filter((id) => id !== sourceId);
      nextLineup.reserves = nextLineup.reserves.filter((id) => id !== sourceId);
    }
    if (targetId) {
      nextLineup.bench = nextLineup.bench.filter((id) => id !== targetId);
      nextLineup.reserves = nextLineup.reserves.filter((id) => id !== targetId);
    }
    if (targetIdx !== void 0 && targetIdx < 11) {
      nextLineup.startingXI[targetIdx] = sourceId;
    } else if (targetId && lineup.bench.includes(targetId)) {
      if (sourceId) nextLineup.bench.push(sourceId);
    } else {
      if (sourceId) nextLineup.reserves.push(sourceId);
    }
    if (sourceIdx !== void 0 && sourceIdx < 11) {
      nextLineup.startingXI[sourceIdx] = targetId;
    } else if (sourceId && lineup.bench.includes(sourceId)) {
      if (targetId) nextLineup.bench.push(targetId);
    } else {
      if (targetId) nextLineup.reserves.push(targetId);
    }
    nextLineup.bench = Array.from(new Set(nextLineup.bench));
    nextLineup.reserves = Array.from(new Set(nextLineup.reserves));
    while (nextLineup.bench.length > 9) {
      const extra = nextLineup.bench.pop();
      if (extra) nextLineup.reserves.push(extra);
    }
    return nextLineup;
  }
};

// services/NationalTeamEnvironmentService.ts
var CLIMATE_BY_CONTINENT = {
  europe: {
    winter: [-6, 6],
    spring: [4, 18],
    summer: [14, 30],
    autumn: [3, 18],
    rainBias: 0.22,
    windBias: 0.18
  },
  africa: {
    winter: [13, 29],
    spring: [18, 34],
    summer: [20, 38],
    autumn: [17, 33],
    rainBias: 0.14,
    windBias: 0.14
  },
  asia: {
    winter: [-3, 16],
    spring: [8, 27],
    summer: [18, 36],
    autumn: [7, 25],
    rainBias: 0.18,
    windBias: 0.16
  },
  "north america": {
    winter: [-4, 13],
    spring: [7, 24],
    summer: [17, 34],
    autumn: [6, 22],
    rainBias: 0.17,
    windBias: 0.19
  },
  "south america": {
    winter: [8, 24],
    spring: [13, 29],
    summer: [19, 34],
    autumn: [12, 28],
    rainBias: 0.18,
    windBias: 0.13
  },
  oceania: {
    winter: [7, 18],
    spring: [11, 23],
    summer: [17, 29],
    autumn: [10, 22],
    rainBias: 0.19,
    windBias: 0.17
  }
};
var DEFAULT_PROFILE = {
  winter: [2, 12],
  spring: [8, 21],
  summer: [16, 30],
  autumn: [7, 19],
  rainBias: 0.18,
  windBias: 0.16
};
var hashString2 = (value) => {
  let hash2 = 0;
  for (let i = 0; i < value.length; i++) {
    hash2 = (hash2 << 5) - hash2 + value.charCodeAt(i) | 0;
  }
  return hash2 >>> 0;
};
var createSeeded = (seed) => {
  let state = hashString2(seed) || 1;
  return () => {
    state = state * 1664525 + 1013904223 >>> 0;
    return state / 4294967296;
  };
};
var getSeasonKey = (month) => {
  if (month === 11 || month <= 1) return "winter";
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  return "autumn";
};
var clamp7 = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};
var NationalTeamEnvironmentService = {
  getWeather: (date, homeTeam, awayTeam, competitionLabel, seed) => {
    const rng = createSeeded([
      seed,
      homeTeam.name,
      awayTeam.name,
      competitionLabel,
      date.toISOString()
    ].join("|"));
    const profile = CLIMATE_BY_CONTINENT[homeTeam.continent.toLowerCase()] ?? DEFAULT_PROFILE;
    const seasonKey = getSeasonKey(date.getMonth());
    const [minTemp, maxTemp] = profile[seasonKey];
    const tempC = Math.round(minTemp + rng() * (maxTemp - minTemp));
    const windKmh = Math.round(4 + rng() * (18 + profile.windBias * 80));
    const wetRoll = rng();
    const stormRoll = rng();
    let description = "Clear sky";
    let precipitationChance = 0;
    let weatherIntensity = 0;
    if (stormRoll < profile.rainBias * 0.14) {
      description = tempC <= 1 ? "Snow storm" : "Thunderstorm";
      precipitationChance = 100;
      weatherIntensity = 1;
    } else if (wetRoll < profile.rainBias) {
      description = tempC <= 1 ? "Snowfall" : "Heavy rain";
      precipitationChance = 100;
      weatherIntensity = 0.72;
    } else if (wetRoll < profile.rainBias + 0.18) {
      description = tempC <= 1 ? "Sleet" : "Light rain";
      precipitationChance = 85;
      weatherIntensity = 0.36;
    } else if (windKmh >= 34) {
      description = "Strong wind";
      precipitationChance = 15;
      weatherIntensity = 0.28;
    } else if (tempC >= 31) {
      description = "Heat";
      precipitationChance = 0;
      weatherIntensity = 0.48;
    } else if (tempC <= -3) {
      description = "Frost";
      precipitationChance = 0;
      weatherIntensity = 0.32;
    } else if (rng() < 0.25) {
      description = "Cloudy";
      precipitationChance = 10;
      weatherIntensity = 0.06;
    }
    return {
      tempC,
      precipitationChance,
      windKmh,
      description,
      weatherIntensity
    };
  },
  estimateAttendance: (homeTeam, awayTeam, competitionLabel, weather, seed) => {
    const rng = createSeeded([
      seed,
      homeTeam.name,
      awayTeam.name,
      competitionLabel,
      weather.description
    ].join("|"));
    const repFactor = clamp7((homeTeam.reputation + awayTeam.reputation) / 38, 0.45, 0.95);
    const prestigeBonus = /world cup|mś|euro|liga narodow|nations/i.test(competitionLabel) ? 0.12 : 0.04;
    const weatherPenalty = weather.weatherIntensity && weather.weatherIntensity >= 0.7 ? 0.18 : weather.weatherIntensity && weather.weatherIntensity >= 0.35 ? 0.08 : 0;
    const fillRatio = clamp7(
      0.42 + repFactor * 0.42 + prestigeBonus - weatherPenalty + (rng() - 0.5) * 0.12,
      0.22,
      0.98
    );
    return Math.max(1e3, Math.round(homeTeam.stadiumCapacity * fillRatio));
  }
};

// services/NationalTeamLineupService.ts
var pickBestFromXi = (squad, lineup, scoreFn) => {
  const xiPlayers = lineup.startingXI.map((id) => squad.find((player) => player.id === id) ?? null).filter(Boolean);
  if (xiPlayers.length === 0) {
    return null;
  }
  return [...xiPlayers].sort((a, b) => scoreFn(b) - scoreFn(a))[0]?.id ?? null;
};
var NationalTeamLineupService = {
  buildMatchSelection: (team, squad, coach) => {
    const tacticId = team.tacticId || "4-4-2";
    const initialLineup = LineupService.autoPickLineup(team.id, squad, tacticId, coach);
    const lineup = LineupService.repairLineup(initialLineup, squad);
    return {
      lineup,
      captainId: pickBestFromXi(
        squad,
        lineup,
        (player) => player.attributes.leadership * 1.9 + player.attributes.mentality * 1.3 + player.attributes.workRate * 0.7 + player.overallRating * 0.6
      ),
      penaltyTakerId: pickBestFromXi(
        squad,
        lineup,
        (player) => player.attributes.penalties * 2.1 + player.attributes.finishing * 1.2 + player.attributes.technique * 0.9 + player.attributes.mentality * 0.8
      ),
      freeKickTakerId: pickBestFromXi(
        squad,
        lineup,
        (player) => player.attributes.freeKicks * 2 + player.attributes.technique * 1.1 + player.attributes.passing * 0.8 + player.attributes.vision * 0.7
      )
    };
  }
};

// services/RefereeService.ts
var clampRating = (value) => Math.max(1, Math.min(10, Math.round(value * 10) / 10));
var stableNoise = (seed, refereeId) => {
  const idHash = refereeId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const raw = Math.sin((seed + idHash) * 12.9898) * 43758.5453;
  return raw - Math.floor(raw);
};
var RefereeService = {
  pool: [],
  /**
   * Generates a fixed pool of referees:
   * - 150 Polish (domestic)
   * - ~300 European (UEFA countries, excl. Poland)
   * - ~400 International (non-European)
   */
  initializePool: () => {
    if (RefereeService.pool.length > 0) return;
    for (let i = 0; i < 150; i++) {
      const names = NameGeneratorService.getRandomName("POLAND" /* POLAND */);
      RefereeService.pool.push({
        id: `REF_${i}`,
        firstName: names.firstName,
        lastName: names.lastName,
        age: 30 + Math.floor(Math.random() * 25),
        nationality: "POLAND" /* POLAND */,
        strictness: 20 + Math.floor(Math.random() * 70),
        consistency: 30 + Math.floor(Math.random() * 60),
        advantageTendency: 10 + Math.floor(Math.random() * 80),
        experience: 30 + Math.floor(Math.random() * 70),
        matchRatings: [],
        totalYellowCardsShown: 0,
        totalRedCardsShown: 0,
        isInternational: false
      });
    }
    const polishRefs = RefereeService.pool.filter((r) => r.nationality === "POLAND" /* POLAND */);
    const top25Polish = [...polishRefs].sort((a, b) => b.consistency * 0.6 + b.experience * 0.4 - (a.consistency * 0.6 + a.experience * 0.4)).slice(0, 25).map((r) => r.id);
    top25Polish.forEach((id) => {
      const ref = RefereeService.pool.find((r) => r.id === id);
      if (ref) ref.isInternational = true;
    });
    const EUR_REGIONS = [
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
      "ISRAELI" /* ISRAELI */,
      "GREEK" /* GREEK */,
      "AZERBAIJANI" /* AZERBAIJANI */,
      "KAZAKH" /* KAZAKH */
    ];
    let eurIdx = 0;
    EUR_REGIONS.forEach((region) => {
      for (let j = 0; j < 12; j++) {
        const names = NameGeneratorService.getRandomName(region);
        RefereeService.pool.push({
          id: `REF_EUR_${eurIdx++}`,
          firstName: names.firstName,
          lastName: names.lastName,
          age: 28 + Math.floor(Math.random() * 27),
          nationality: region,
          strictness: 20 + Math.floor(Math.random() * 70),
          consistency: 30 + Math.floor(Math.random() * 60),
          advantageTendency: 10 + Math.floor(Math.random() * 80),
          experience: 25 + Math.floor(Math.random() * 75),
          matchRatings: [],
          totalYellowCardsShown: 0,
          totalRedCardsShown: 0,
          isInternational: true
          // Arbiter UEFA
        });
      }
    });
    const INTL_REGIONS = [
      "SSA" /* SSA */,
      "MEXICO" /* MEXICO */,
      "JAPAN" /* JAPAN */,
      "KOREA" /* KOREA */,
      "ARGENTINA" /* ARGENTINA */,
      "BRAZIL" /* BRAZIL */,
      "ARABIA" /* ARABIA */,
      "SOUTH_AMERICAN" /* SOUTH_AMERICAN */
    ];
    let intlIdx = 0;
    INTL_REGIONS.forEach((region) => {
      for (let j = 0; j < 50; j++) {
        const names = NameGeneratorService.getRandomName(region);
        RefereeService.pool.push({
          id: `REF_INTL_${intlIdx++}`,
          firstName: names.firstName,
          lastName: names.lastName,
          age: 28 + Math.floor(Math.random() * 27),
          nationality: region,
          strictness: 20 + Math.floor(Math.random() * 70),
          consistency: 30 + Math.floor(Math.random() * 60),
          advantageTendency: 10 + Math.floor(Math.random() * 80),
          experience: 20 + Math.floor(Math.random() * 80),
          matchRatings: [],
          totalYellowCardsShown: 0,
          totalRedCardsShown: 0,
          isInternational: true
          // Arbiter FIFA
        });
      }
    });
  },
  /**
   * Assigns an INTERNATIONAL referee (FIFA/UEFA) for a CL/EL/CONF match.
   * Referee must be from a different country than both competing teams.
   */
  assignInternationalReferee: (seedStr, homeCountry, awayCountry, usedRefereeIds = /* @__PURE__ */ new Set()) => {
    RefereeService.initializePool();
    const COUNTRY_REGION = {
      "POL": "POLAND" /* POLAND */,
      "ENG": "ENGLAND" /* ENGLAND */,
      "GBR": "ENGLAND" /* ENGLAND */,
      "ESP": "SPAIN" /* SPAIN */,
      "GER": "GERMANY" /* GERMANY */,
      "DEU": "GERMANY" /* GERMANY */,
      "ITA": "ITALY" /* ITALY */,
      "FRA": "FRANCE" /* FRANCE */,
      "TUR": "TURKEY" /* TURKEY */,
      "SWE": "SWEDEN" /* SWEDEN */,
      "NOR": "SCANDINAVIA" /* SCANDINAVIA */,
      "DNK": "SCANDINAVIA" /* SCANDINAVIA */,
      "ISL": "SCANDINAVIA" /* SCANDINAVIA */,
      "RUS": "EX_USSR" /* EX_USSR */,
      "UKR": "EX_USSR" /* EX_USSR */,
      "BLR": "EX_USSR" /* EX_USSR */,
      "SRB": "BALKANS" /* BALKANS */,
      "HRV": "BALKANS" /* BALKANS */,
      "BIH": "BALKANS" /* BALKANS */,
      "SVN": "BALKANS" /* BALKANS */,
      "MNE": "BALKANS" /* BALKANS */,
      "MKD": "BALKANS" /* BALKANS */,
      "CZE": "CZ_SK" /* CZ_SK */,
      "SVK": "CZ_SK" /* CZ_SK */,
      "POR": "IBERIA" /* IBERIA */,
      "PRT": "IBERIA" /* IBERIA */,
      "FIN": "FINLAND" /* FINLAND */,
      "GEO": "GEORGIA" /* GEORGIA */,
      "ARM": "ARMENIA" /* ARMENIA */,
      "ALB": "ALBANIA" /* ALBANIA */,
      "ROU": "ROMANIA" /* ROMANIA */,
      "LTU": "BALTIC" /* BALTIC */,
      "LVA": "BALTIC" /* BALTIC */,
      "EST": "BALTIC" /* BALTIC */,
      "BEL": "BENELUX" /* BENELUX */,
      "NLD": "BENELUX" /* BENELUX */,
      "LUX": "BENELUX" /* BENELUX */,
      "HUN": "HUNGARIAN" /* HUNGARIAN */,
      "MLT": "MALTESE" /* MALTESE */,
      "ISR": "ISRAELI" /* ISRAELI */,
      "GRC": "GREEK" /* GREEK */,
      "AZE": "AZERBAIJANI" /* AZERBAIJANI */,
      "KAZ": "KAZAKH" /* KAZAKH */,
      "JPN": "JAPAN" /* JAPAN */,
      "KOR": "KOREA" /* KOREA */,
      "ARG": "ARGENTINA" /* ARGENTINA */,
      "BRA": "BRAZIL" /* BRAZIL */,
      "MEX": "MEXICO" /* MEXICO */,
      "SAU": "ARABIA" /* ARABIA */,
      "UAE": "ARABIA" /* ARABIA */,
      "QAT": "ARABIA" /* ARABIA */,
      "EGY": "ARABIA" /* ARABIA */,
      "NGA": "SSA" /* SSA */,
      "GHA": "SSA" /* SSA */,
      "CMR": "SSA" /* SSA */,
      "SEN": "SSA" /* SSA */,
      "COL": "SOUTH_AMERICAN" /* SOUTH_AMERICAN */,
      "CHL": "SOUTH_AMERICAN" /* SOUTH_AMERICAN */,
      "URU": "SOUTH_AMERICAN" /* SOUTH_AMERICAN */,
      "PER": "SOUTH_AMERICAN" /* SOUTH_AMERICAN */
    };
    const homeRegion = COUNTRY_REGION[homeCountry?.toUpperCase()];
    const awayRegion = COUNTRY_REGION[awayCountry?.toUpperCase()];
    let hash2 = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash2 = (hash2 << 5) - hash2 + seedStr.charCodeAt(i);
      hash2 |= 0;
    }
    const notConflict = (r) => (!homeRegion || r.nationality !== homeRegion) && (!awayRegion || r.nationality !== awayRegion);
    const EUR_ONLY = [
      "POLAND" /* POLAND */,
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
      "ISRAELI" /* ISRAELI */,
      "GREEK" /* GREEK */,
      "AZERBAIJANI" /* AZERBAIJANI */,
      "KAZAKH" /* KAZAKH */
    ];
    const isEuropean = (r) => EUR_ONLY.includes(r.nationality);
    const eligible = RefereeService.pool.filter(
      (r) => r.isInternational && isEuropean(r) && r.consistency > 55 && notConflict(r) && !usedRefereeIds.has(r.id)
    );
    if (eligible.length > 0) {
      return eligible[Math.abs(hash2) % eligible.length];
    }
    const eligibleAnyQuality = RefereeService.pool.filter(
      (r) => r.isInternational && isEuropean(r) && notConflict(r) && !usedRefereeIds.has(r.id)
    );
    if (eligibleAnyQuality.length > 0) {
      return eligibleAnyQuality[Math.abs(hash2) % eligibleAnyQuality.length];
    }
    const polishFallback = RefereeService.pool.filter(
      (r) => r.isInternational && r.nationality === "POLAND" /* POLAND */ && !usedRefereeIds.has(r.id)
    );
    if (polishFallback.length > 0) {
      return polishFallback[Math.abs(hash2) % polishFallback.length];
    }
    const anyAvailable = RefereeService.pool.filter((r) => r.isInternational && isEuropean(r));
    const lastResort = anyAvailable.length > 0 ? anyAvailable : RefereeService.pool;
    return lastResort[Math.abs(hash2) % lastResort.length];
  },
  /**
   * Assigns a European referee for a national team match.
   * Referee must be European, from a different region than both teams, and not already used in this matchday.
   */
  assignEuropeanRefereeByRegion: (seedStr, homeRegion, awayRegion, usedRefereeIds = /* @__PURE__ */ new Set()) => {
    RefereeService.initializePool();
    let hash2 = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash2 = (hash2 << 5) - hash2 + seedStr.charCodeAt(i);
      hash2 |= 0;
    }
    const EUR_ONLY = [
      "POLAND" /* POLAND */,
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
      "ISRAELI" /* ISRAELI */,
      "GREEK" /* GREEK */,
      "AZERBAIJANI" /* AZERBAIJANI */,
      "KAZAKH" /* KAZAKH */
    ];
    const isEuropean = (r) => EUR_ONLY.includes(r.nationality);
    const notConflict = (r) => r.nationality !== homeRegion && r.nationality !== awayRegion;
    const eligible = RefereeService.pool.filter(
      (r) => r.isInternational && isEuropean(r) && r.consistency > 55 && notConflict(r) && !usedRefereeIds.has(r.id)
    );
    if (eligible.length > 0) return eligible[Math.abs(hash2) % eligible.length];
    const eligible2 = RefereeService.pool.filter(
      (r) => r.isInternational && isEuropean(r) && notConflict(r) && !usedRefereeIds.has(r.id)
    );
    if (eligible2.length > 0) return eligible2[Math.abs(hash2) % eligible2.length];
    const eligible3 = RefereeService.pool.filter((r) => isEuropean(r) && !usedRefereeIds.has(r.id));
    if (eligible3.length > 0) return eligible3[Math.abs(hash2) % eligible3.length];
    const anyEur = RefereeService.pool.filter((r) => isEuropean(r));
    const lastResort = anyEur.length > 0 ? anyEur : RefereeService.pool;
    return lastResort[Math.abs(hash2) % lastResort.length];
  },
  /**
   * Assigns a Polish referee for domestic league and cup matches.
   */
  assignPolishReferee: (seedStr, importance) => {
    RefereeService.initializePool();
    let hash2 = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash2 = (hash2 << 5) - hash2 + seedStr.charCodeAt(i);
      hash2 |= 0;
    }
    const polishRefs = RefereeService.pool.filter((r) => r.nationality === "POLAND" /* POLAND */);
    const eligibleRefs = polishRefs.filter((r) => {
      if (importance >= 4) return r.consistency > 70;
      if (importance >= 3) return r.consistency > 50;
      return true;
    });
    const finalPool = eligibleRefs.length > 0 ? eligibleRefs : polishRefs;
    const index = Math.abs(hash2) % finalPool.length;
    return finalPool[index];
  },
  /**
   * Deterministically assigns a referee based on match criteria.
   */
  assignReferee: (seedStr, importance) => {
    RefereeService.initializePool();
    let hash2 = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash2 = (hash2 << 5) - hash2 + seedStr.charCodeAt(i);
      hash2 |= 0;
    }
    const eligibleRefs = RefereeService.pool.filter((r) => {
      if (importance >= 4) return r.consistency > 70;
      if (importance >= 3) return r.consistency > 50;
      return true;
    });
    const finalPool = eligibleRefs.length > 0 ? eligibleRefs : RefereeService.pool;
    const index = Math.abs(hash2) % finalPool.length;
    return finalPool[index];
  },
  /**
   * Losuje ocenę 1-10. Wyższy consistency = szansa na wyższą ocenę.
   */
  generateMatchRating: (referee) => {
    const maxRating = Math.min(10, 4 + Math.floor(referee.consistency / 15));
    return Math.floor(1 + Math.random() * maxRating);
  },
  generateLiveMatchRating: (input) => {
    const { referee, homeScore, awayScore, homeStats, awayStats, timeline = [], seed = 0 } = input;
    const totalFouls = homeStats.fouls + awayStats.fouls;
    const totalYellows = homeStats.yellowCards + awayStats.yellowCards;
    const totalReds = homeStats.redCards + awayStats.redCards;
    const scoreDiff = Math.abs(homeScore - awayScore);
    const isCloseMatch = scoreDiff <= 1;
    const varDisallowedGoals = timeline.filter(
      (event) => event.varDisallowed === true && (event.type === "GOAL" || event.type === "PENALTY_SCORED")
    ).length;
    const varPenaltyNoCalls = timeline.filter(
      (event) => typeof event.text === "string" && event.text.includes("VAR: Nie ma karnego")
    ).length;
    let rating = 6.6 + (referee.consistency - 50) * 0.018 + (referee.experience - 50) * 0.012;
    const matchDifficulty = Math.min(0.35, totalFouls * 6e-3 + totalReds * 0.06 + (isCloseMatch ? 0.08 : 0));
    rating += matchDifficulty;
    if (totalFouls >= 18 && totalYellows <= 1) rating -= 0.45;
    if (totalFouls >= 24 && totalYellows <= 2) rating -= 0.35;
    if (totalFouls <= 10 && totalYellows >= 5) rating -= 0.45;
    if (totalYellows > totalFouls * 0.55 + 2) rating -= 0.25;
    rating -= totalReds * (isCloseMatch ? 0.22 : 0.12);
    rating -= varDisallowedGoals * (isCloseMatch ? 0.55 : 0.25);
    rating -= varPenaltyNoCalls * (isCloseMatch ? 0.65 : 0.3);
    if (varDisallowedGoals === 0 && varPenaltyNoCalls === 0 && totalReds === 0 && totalFouls >= 12) {
      rating += 0.18;
    }
    rating += (stableNoise(seed, referee.id) - 0.5) * 0.25;
    return clampRating(rating);
  },
  recordMatchStats: (refereeId, rating, yellowCards, redCards) => {
    const ref = RefereeService.pool.find((r) => r.id === refereeId);
    if (!ref) return;
    ref.matchRatings.push(rating);
    ref.totalYellowCardsShown += yellowCards;
    ref.totalRedCardsShown += redCards;
  },
  getAverageRating: (referee) => {
    if (referee.matchRatings.length === 0) return null;
    const sum = referee.matchRatings.reduce((a, b) => a + b, 0);
    return Math.round(sum / referee.matchRatings.length * 10) / 10;
  },
  applyEndOfSeasonAdjustments: () => {
    RefereeService.pool.forEach((ref) => {
      if (ref.matchRatings.length <= 5) return;
      const avg = RefereeService.getAverageRating(ref);
      const attrs = ["strictness", "consistency", "advantageTendency"];
      if (avg < 6) {
        const penalty = Math.floor(Math.random() * 3) + 1;
        attrs.forEach((attr) => {
          ref[attr] = Math.max(5, ref[attr] - penalty);
        });
      } else if (avg > 6.5) {
        const bonus = Math.floor(Math.random() * 3) + 1;
        attrs.forEach((attr) => {
          ref[attr] = Math.min(99, ref[attr] + bonus);
        });
      }
    });
  },
  resetSeasonStats: () => {
    RefereeService.pool.forEach((ref) => {
      ref.matchRatings = [];
      ref.totalYellowCardsShown = 0;
      ref.totalRedCardsShown = 0;
    });
  }
};

// services/InjuryCatalog.ts
var LIGHT_INJURY_POOL = [
  { type: "Skurcz mi\u0119\u015Bnia udowego", min: 1, max: 5 },
  { type: "St\u0142uczenie palca stopy", min: 3, max: 14 },
  { type: "Skr\u0119cenie kostki I\xB0", min: 2, max: 10 },
  { type: "Skr\u0119cenie palca stopy", min: 5, max: 21 },
  { type: "Uraz stawu skokowego I\xB0", min: 5, max: 14 },
  { type: "St\u0142uczenie mi\u0119\u015Bnia", min: 3, max: 14 },
  { type: "St\u0142uczenie \u0142ydki", min: 5, max: 14 },
  { type: "St\u0142uczenie \u017Cebra", min: 7, max: 28 },
  { type: "St\u0142uczenie kolana", min: 7, max: 28 },
  { type: "Skr\u0119cenie nadgarstka", min: 7, max: 21 },
  { type: "Uraz g\u0142owy (\u0142agodny)", min: 7, max: 21 },
  { type: "Z\u0142amanie nosa", min: 14, max: 42 },
  { type: "B\xF3l plec\xF3w (ostry)", min: 7, max: 28 },
  { type: "Naderwanie mi\u0119\u015Bnia I\xB0", min: 7, max: 21 },
  { type: "Uraz uda (lekki)", min: 7, max: 14 }
];
var SEVERE_INJURY_POOL = [
  { type: "Naci\u0105gni\u0119cie wi\u0119zade\u0142 kolanowych", min: 14, max: 42, weight: 16 },
  { type: "Skr\u0119cenie kolana (wi\u0119zad\u0142a poboczne)", min: 14, max: 56, weight: 13 },
  { type: "Naci\u0105gni\u0119cie mi\u0119\u015Bnia dwug\u0142owego uda", min: 10, max: 56, weight: 12 },
  { type: "Skr\u0119cenie kostki II-III\xB0", min: 10, max: 90, weight: 10 },
  { type: "Z\u0142amanie nosa (ci\u0119\u017Ckie)", min: 21, max: 56, weight: 7 },
  { type: "Z\u0142amanie \u017Cebra", min: 28, max: 84, weight: 7 },
  { type: "Wstrz\u0105s m\xF3zgu (powa\u017Cny)", min: 21, max: 90, weight: 5 },
  { type: "Z\u0142amanie palca stopy", min: 21, max: 56, weight: 5 },
  { type: "Uszkodzenie \u0142\u0105kotki", min: 30, max: 270, weight: 5 },
  { type: "Uszkodzenie chrz\u0105stki kolana", min: 60, max: 180, weight: 4 },
  { type: "Z\u0142amanie ko\u015Bci \u015Br\xF3dstopia", min: 42, max: 168, weight: 4 },
  { type: "Z\u0142amanie ko\u015Bci strza\u0142kowej", min: 42, max: 168, weight: 4 },
  { type: "Zwichni\u0119cie barku", min: 28, max: 180, weight: 3 },
  { type: "Z\u0142amanie obojczyka", min: 42, max: 90, weight: 2 },
  { type: "Powa\u017Cny uraz wi\u0119zade\u0142 bocznych kolana", min: 42, max: 112, weight: 2 },
  { type: "Z\u0142amanie nadgarstka", min: 42, max: 112, weight: 1 },
  { type: "Uszkodzenie wi\u0119zade\u0142 krzy\u017Cowych (ACL)", min: 180, max: 365, weight: 0.5 },
  { type: "Zerwanie \u015Bci\u0119gna Achillesa", min: 150, max: 270, weight: 0.5 }
];
var randomIntInclusive2 = (min, max, random) => min + Math.floor(random() * (max - min + 1));
var pickLightInjury = (random) => LIGHT_INJURY_POOL[Math.floor(random() * LIGHT_INJURY_POOL.length)] ?? LIGHT_INJURY_POOL[0];
var pickSevereInjury = (random) => {
  const total = SEVERE_INJURY_POOL.reduce((sum, item) => sum + (item.weight ?? 0), 0);
  let roll = random() * total;
  for (const item of SEVERE_INJURY_POOL) {
    roll -= item.weight ?? 0;
    if (roll <= 0) return item;
  }
  return SEVERE_INJURY_POOL[SEVERE_INJURY_POOL.length - 1];
};
var rollInjuryBySeverity = (severity, random = Math.random) => {
  const picked = severity === "SEVERE" /* SEVERE */ ? pickSevereInjury(random) : pickLightInjury(random);
  return {
    type: picked.type,
    days: randomIntInclusive2(picked.min, picked.max, random)
  };
};

// services/KitSelectionService.ts
var MIN_PRIMARY_SHIRT_DISTANCE = 120;
var buildKitSelection = (homeKit, awayKit) => ({
  home: {
    primary: homeKit.shirt,
    shirtSecondary: homeKit.shirtSecondary,
    secondary: homeKit.shorts,
    pattern: homeKit.pattern,
    text: KitSelectionService.isColorLight(homeKit.shirt) ? "#000000" : "#ffffff"
  },
  away: {
    primary: awayKit.shirt,
    shirtSecondary: awayKit.shirtSecondary,
    secondary: awayKit.shorts,
    pattern: awayKit.pattern,
    text: KitSelectionService.isColorLight(awayKit.shirt) ? "#000000" : "#ffffff"
  }
});
var getKitPairScore = (homeKit, awayKit) => {
  const primaryDistance = KitSelectionService.getColorDistance(awayKit.shirt, homeKit.shirt);
  const accentDistance = Math.min(
    awayKit.shirtSecondary ? KitSelectionService.getColorDistance(awayKit.shirtSecondary, homeKit.shirt) : primaryDistance,
    homeKit.shirtSecondary ? KitSelectionService.getColorDistance(awayKit.shirt, homeKit.shirtSecondary) : primaryDistance
  );
  const shortsDistance = Math.min(
    KitSelectionService.getColorDistance(awayKit.shorts, homeKit.shirt),
    KitSelectionService.getColorDistance(awayKit.shirt, homeKit.shorts)
  );
  return {
    primaryDistance,
    supportingScore: accentDistance * 0.55 + shortsDistance * 0.25
  };
};
var isBetterKitPair = (candidate, current) => {
  const candidateHasContrast = candidate.primaryDistance >= MIN_PRIMARY_SHIRT_DISTANCE;
  const currentHasContrast = current.primaryDistance >= MIN_PRIMARY_SHIRT_DISTANCE;
  if (candidateHasContrast !== currentHasContrast) return candidateHasContrast;
  if (candidate.primaryDistance !== current.primaryDistance) return candidate.primaryDistance > current.primaryDistance;
  return candidate.supportingScore > current.supportingScore;
};
var selectBestAwayKit = (homeKit, awayOptions) => {
  let bestAwayKit = awayOptions[0];
  let bestScore = getKitPairScore(homeKit, bestAwayKit);
  for (const awayKit of awayOptions.slice(1)) {
    const score = getKitPairScore(homeKit, awayKit);
    if (isBetterKitPair(score, bestScore)) {
      bestAwayKit = awayKit;
      bestScore = score;
    }
  }
  return bestAwayKit;
};
var selectOptimalKitsFromVariants = (homeOptions, awayOptions) => {
  const homeKit = homeOptions[0];
  return buildKitSelection(homeKit, selectBestAwayKit(homeKit, awayOptions));
};
var selectOptimalNationalTeamKitsFromVariants = (homeOptions, awayOptions) => {
  const defaultHomeKit = homeOptions[0];
  const defaultAwayKit = selectBestAwayKit(defaultHomeKit, awayOptions);
  if (getKitPairScore(defaultHomeKit, defaultAwayKit).primaryDistance >= MIN_PRIMARY_SHIRT_DISTANCE) {
    return buildKitSelection(defaultHomeKit, defaultAwayKit);
  }
  let bestHomeKit = defaultHomeKit;
  let bestAwayKit = defaultAwayKit;
  let bestScore = getKitPairScore(bestHomeKit, bestAwayKit);
  for (const homeKit of homeOptions) {
    for (const awayKit of awayOptions) {
      const score = getKitPairScore(homeKit, awayKit);
      if (isBetterKitPair(score, bestScore)) {
        bestHomeKit = homeKit;
        bestAwayKit = awayKit;
        bestScore = score;
      }
    }
  }
  return buildKitSelection(bestHomeKit, bestAwayKit);
};
var KitSelectionService = {
  /**
   * Calculates perceptual color distance between two hex colors.
   * Uses weighted Euclidean distance for better human perception approximation.
   */
  getColorDistance: (hex1, hex2) => {
    const r1 = parseInt(hex1.substring(1, 3), 16);
    const g1 = parseInt(hex1.substring(3, 5), 16);
    const b1 = parseInt(hex1.substring(5, 7), 16);
    const r2 = parseInt(hex2.substring(1, 3), 16);
    const g2 = parseInt(hex2.substring(3, 5), 16);
    const b2 = parseInt(hex2.substring(5, 7), 16);
    const rmean = (r1 + r2) / 2;
    const r = r1 - r2;
    const g = g1 - g2;
    const b = b1 - b2;
    return Math.sqrt(((512 + rmean) * r * r >> 8) + 4 * g * g + ((767 - rmean) * b * b >> 8));
  },
  getKitClashScore: (kitA, kitB) => {
    const colorsA = [kitA.primary, kitA.shirtSecondary, kitA.secondary].filter(Boolean);
    const colorsB = [kitB.primary, kitB.shirtSecondary, kitB.secondary].filter(Boolean);
    return Math.min(...colorsA.flatMap((a) => colorsB.map((b) => KitSelectionService.getColorDistance(a, b))));
  },
  /**
   * Determines if a color is light or dark for text contrast.
   */
  isColorLight: (hex) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1e3;
    return brightness > 155;
  },
  /**
   * Selects the best possible combination from real club kit variants.
   */
  selectOptimalKits: (home, away) => {
    const homeOptions = getActiveClubKits(home);
    const awayOptions = getActiveClubKits(away);
    return selectOptimalKitsFromVariants(homeOptions, awayOptions);
  },
  selectOptimalNationalTeamKits: (home, away) => selectOptimalNationalTeamKitsFromVariants(getActiveNationalTeamKits(home), getActiveNationalTeamKits(away)),
  /**
   * Selects the opponent kit that is furthest from the player's chosen shirt color.
   */
  selectOpponentKit: (playerKitHex, opponent) => {
    const oppKits = getActiveClubKits(opponent);
    let bestIdx = 0;
    let maxDist = -1;
    for (let i = 0; i < oppKits.length; i++) {
      const dist = KitSelectionService.getColorDistance(playerKitHex, oppKits[i].shirt);
      if (dist > maxDist) {
        maxDist = dist;
        bestIdx = i;
      }
    }
    const kit = oppKits[bestIdx];
    return {
      primary: kit.shirt,
      shirtSecondary: kit.shirtSecondary,
      secondary: kit.shorts,
      pattern: kit.pattern,
      text: KitSelectionService.isColorLight(kit.shirt) ? "#000000" : "#ffffff"
    };
  }
};

// services/NationalTeamSimulator.ts
var Rng4 = class {
  constructor(seed) {
    this.s = seed >>> 0 || 1;
  }
  next() {
    this.s = this.s * 1664525 + 1013904223 >>> 0;
    return this.s / 4294967296;
  }
  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
};
var clamp8 = (v, min, max) => Math.max(min, Math.min(max, v));
var hash = (v) => {
  let h = 0;
  for (let i = 0; i < v.length; i++) h = (h << 5) - h + v.charCodeAt(i) | 0;
  return h >>> 0;
};
var nameOf = (p) => p ? `${p.firstName} ${p.lastName}` : "Unknown";
var fatMul = (f) => 0.52 + 0.48 * Math.pow(clamp8(f, 0, 100) / 100, 1.25);
var DAY_MS2 = 864e5;
var NT_RECOVERY_DAYS = 3;
var getNationalTeamRecoveryUntil = (date) => {
  const recoveryUntil = new Date(date);
  recoveryUntil.setHours(0, 0, 0, 0);
  recoveryUntil.setTime(recoveryUntil.getTime() + NT_RECOVERY_DAYS * DAY_MS2);
  return recoveryUntil.toISOString();
};
var isMajorNationalTournament = (competitionLabel) => competitionLabel === "FIFA World Cup" || competitionLabel === "UEFA EURO";
var playerOverall = (p) => {
  if (p.position === "GK" /* GK */) {
    return clamp8((p.attributes.goalkeeping * 6 + p.attributes.positioning * 2 + p.attributes.mentality + p.attributes.passing) / 10, 0, 100);
  }
  const a = p.attributes;
  return clamp8((a.attacking + a.finishing + a.defending + a.passing + a.positioning + a.mentality + a.technique + a.pace + a.vision + a.stamina) / 10, 0, 100);
};
var clonePlayer = (p) => ({
  ...p,
  stats: { ...p.stats },
  health: { ...p.health, injury: p.health.injury ? { ...p.health.injury } : void 0 },
  history: [...p.history],
  freeAgentClubLockouts: p.freeAgentClubLockouts ? { ...p.freeAgentClubLockouts } : void 0
});
var cloneMap = (m) => {
  const out = {};
  for (const [k, v] of Object.entries(m)) out[k] = [...v];
  return out;
};
var locMap = (m) => {
  const out = {};
  for (const [clubId, squad] of Object.entries(m)) squad.forEach((p, index) => {
    out[p.id] = { clubId, index };
  });
  return out;
};
var fallbackCoach = (teamId) => ({
  id: `NT_COACH_${teamId}`,
  firstName: "National",
  lastName: "Coach",
  age: 50,
  nationality: "INT",
  nationalityFlag: "",
  attributes: { experience: 50, decisionMaking: 50, motivation: 50, training: 50 },
  history: [],
  currentClubId: null,
  currentNationalTeamId: teamId,
  isNationalTeamCoach: true,
  hiredDate: new Date(2025, 0, 1).toISOString(),
  contractEndDate: new Date(2027, 0, 1).toISOString(),
  annualSalary: 0,
  expPoints: 1,
  blacklist: {},
  favoriteTactics: { offensive: "4-3-3 Atak", neutral: "4-4-2", defensive: "5-3-2" },
  seasonStats: []
});
var NT_EMERGENCY_CLUB_ID = "__NT_EMERGENCY__";
var emptyStats2 = () => ({ goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] });
var buildEmergencyAttributes = (position, overall, rng) => {
  const attr = (delta = 0) => clamp8(Math.round(overall + delta + rng.int(-5, 5)), 28, 88);
  const base = {
    strength: attr(),
    stamina: attr(2),
    pace: attr(),
    defending: attr(),
    passing: attr(),
    attacking: attr(),
    finishing: attr(-2),
    technique: attr(),
    vision: attr(),
    dribbling: attr(),
    heading: attr(),
    positioning: attr(2),
    goalkeeping: attr(-18),
    freeKicks: attr(-6),
    talent: attr(-2),
    penalties: attr(-4),
    corners: attr(-5),
    aggression: attr(),
    crossing: attr(-2),
    leadership: attr(-4),
    mentality: attr(2),
    workRate: attr(3)
  };
  if (position === "GK" /* GK */) {
    return { ...base, goalkeeping: attr(9), positioning: attr(6), passing: attr(-7), attacking: attr(-18), finishing: attr(-22), dribbling: attr(-14), crossing: attr(-18) };
  }
  if (position === "DEF" /* DEF */) {
    return { ...base, defending: attr(8), positioning: attr(5), heading: attr(4), attacking: attr(-8), finishing: attr(-11), crossing: attr(-2) };
  }
  if (position === "MID" /* MID */) {
    return { ...base, passing: attr(6), vision: attr(5), technique: attr(5), workRate: attr(5), defending: attr(1), finishing: attr(-5) };
  }
  return { ...base, attacking: attr(7), finishing: attr(7), positioning: attr(5), pace: attr(3), defending: attr(-12), passing: attr(-2) };
};
var createEmergencyPlayer = (team, position, overall, index, date, rng) => {
  const id = `NT_EMERGENCY_${team.id}_${date.getTime()}_${position}_${index}`;
  return {
    id,
    firstName: "Rezerwowy",
    lastName: `${team.name} ${index}`,
    age: rng.int(22, 31),
    clubId: NT_EMERGENCY_CLUB_ID,
    nationality: team.region,
    nationalityCountry: team.name,
    position,
    secondaryPosition: position === "GK" /* GK */ ? null : position === "DEF" /* DEF */ ? "MID" /* MID */ : position === "MID" /* MID */ ? "DEF" /* DEF */ : "MID" /* MID */,
    secondaryPositionRating: 62,
    overallRating: overall,
    attributes: buildEmergencyAttributes(position, overall, rng),
    stats: emptyStats2(),
    health: { status: "HEALTHY" /* HEALTHY */ },
    condition: 100,
    suspensionMatches: 0,
    contractEndDate: date.toISOString(),
    annualSalary: 0,
    history: [],
    seasonHistory: [],
    boardLockoutUntil: null,
    isUntouchable: false,
    negotiationStep: 0,
    negotiationLockoutUntil: null,
    contractLockoutUntil: null,
    fatigueDebt: 0,
    morale: 58,
    isNegotiationPermanentBlocked: false,
    transferLockoutUntil: null,
    freeAgentLockoutUntil: null,
    assignedNationalTeamId: team.id,
    nationalStats: emptyStats2()
  };
};
var ensureEmergencyMatchSquad = (team, squad, date, seed, updated, locs) => {
  const targetByPosition = {
    ["GK" /* GK */]: 2,
    ["DEF" /* DEF */]: 6,
    ["MID" /* MID */]: 6,
    ["FWD" /* FWD */]: 4
  };
  const nextSquad = [...squad];
  if (nextSquad.length >= 11 && nextSquad.some((p) => p.position === "GK" /* GK */)) return nextSquad;
  const rng = new Rng4(hash(`${team.id}|${date.toDateString()}|${seed}|EMERGENCY_SQUAD`));
  const baseOverall = nextSquad.length > 0 ? Math.round(nextSquad.reduce((sum, player) => sum + player.overallRating, 0) / nextSquad.length) : clamp8(Math.round(42 + (team.reputation ?? 40) * 0.45), 38, 78);
  const addPlayer = (position) => {
    const player = createEmergencyPlayer(team, position, clamp8(baseOverall + rng.int(-4, 3), 35, 84), nextSquad.length + 1, date, rng);
    if (!updated[NT_EMERGENCY_CLUB_ID]) updated[NT_EMERGENCY_CLUB_ID] = [];
    updated[NT_EMERGENCY_CLUB_ID].push(player);
    locs[player.id] = { clubId: NT_EMERGENCY_CLUB_ID, index: updated[NT_EMERGENCY_CLUB_ID].length - 1 };
    nextSquad.push(player);
  };
  Object.keys(targetByPosition).forEach((position) => {
    while (nextSquad.filter((player) => player.position === position).length < targetByPosition[position]) addPlayer(position);
  });
  while (nextSquad.length < 18) addPlayer(["DEF" /* DEF */, "MID" /* MID */, "FWD" /* FWD */][rng.int(0, 2)]);
  return nextSquad;
};
var activePlayers = (lt) => lt.activeXI.map((id) => lt.squad.find((p) => p.id === id) ?? null).filter(Boolean);
var moraleMul = (p) => PlayerMoraleService.getMatchContributionMultiplier(PlayerMoraleService.ensurePlayerState(p));
var slotIndex = (lt, playerId) => lt.activeXI.findIndex((id) => id === playerId);
var slotRole = (lt, playerId) => {
  const idx = slotIndex(lt, playerId);
  return idx >= 0 ? TacticRepository.getById(lt.tacticId).slots[idx]?.role ?? "MID" /* MID */ : "MID" /* MID */;
};
var weighted = (players, rng, score) => {
  const items = players.map((p) => ({ p, s: Math.max(0, score(p)) })).filter((x) => x.s > 0);
  if (!items.length) return null;
  const total = items.reduce((a, b) => a + b.s, 0);
  let roll = rng.next() * total;
  for (const item of items) {
    roll -= item.s;
    if (roll <= 0) return item.p;
  }
  return items[items.length - 1].p;
};
var metrics = (lt) => {
  const act = activePlayers(lt);
  if (!act.length) return { att: 20, build: 20, create: 20, def: 20, press: 20, gk: 20, ment: 20, aggr: 20, avgFat: 0, active: 0 };
  let att = 0;
  let build = 0;
  let create = 0;
  let def = 0;
  let press = 0;
  let gk = 0;
  let ment = 0;
  let aggr = 0;
  let fat = 0;
  act.forEach((p) => {
    const f = lt.fatigue[p.id] ?? p.condition ?? 100;
    const m = fatMul(f);
    const morale = moraleMul(p);
    const role = slotRole(lt, p.id);
    const ra = role === "FWD" /* FWD */ ? 1.2 : role === "MID" /* MID */ ? 1 : role === "DEF" /* DEF */ ? 0.72 : 0.18;
    const rd = role === "DEF" /* DEF */ ? 1.2 : role === "MID" /* MID */ ? 0.96 : role === "FWD" /* FWD */ ? 0.62 : 0.4;
    const rm = role === "MID" /* MID */ ? 1.18 : role === "DEF" /* DEF */ ? 0.82 : role === "FWD" /* FWD */ ? 0.88 : 0.25;
    att += (p.attributes.attacking * 0.19 + p.attributes.finishing * 0.23 + p.attributes.positioning * 0.14 + p.attributes.technique * 0.11 + p.attributes.dribbling * 0.1 + p.attributes.pace * 0.08 + p.attributes.heading * 0.07 + p.attributes.passing * 0.04 + p.attributes.vision * 0.04) * m * morale * ra;
    build += (p.attributes.passing * 0.2 + p.attributes.vision * 0.18 + p.attributes.technique * 0.16 + p.attributes.dribbling * 0.1 + p.attributes.workRate * 0.11 + p.attributes.stamina * 0.08 + p.attributes.crossing * 0.08 + p.attributes.mentality * 0.09) * m * morale * rm;
    create += (p.attributes.vision * 0.2 + p.attributes.technique * 0.17 + p.attributes.passing * 0.16 + p.attributes.dribbling * 0.13 + p.attributes.attacking * 0.09 + p.attributes.crossing * 0.1 + p.attributes.mentality * 0.08 + p.attributes.workRate * 0.07) * m * morale * rm;
    def += (p.attributes.defending * 0.24 + p.attributes.positioning * 0.18 + p.attributes.strength * 0.11 + p.attributes.stamina * 0.1 + p.attributes.heading * 0.08 + p.attributes.pace * 0.08 + p.attributes.aggression * 0.08 + p.attributes.mentality * 0.08 + p.attributes.workRate * 0.05) * m * morale * rd;
    press += (p.attributes.workRate * 0.22 + p.attributes.stamina * 0.18 + p.attributes.aggression * 0.17 + p.attributes.pace * 0.14 + p.attributes.mentality * 0.13 + p.attributes.leadership * 0.08 + p.attributes.strength * 0.08) * m * morale;
    if (role === "GK" /* GK */ || p.position === "GK" /* GK */) gk += (p.attributes.goalkeeping * 0.62 + p.attributes.positioning * 0.18 + p.attributes.mentality * 0.1 + p.attributes.passing * 0.1) * m * morale;
    ment += (p.attributes.mentality * 0.58 + p.attributes.leadership * 0.22 + p.attributes.workRate * 0.2) * m * morale;
    aggr += p.attributes.aggression * m * morale;
    fat += f;
  });
  const missingPlayers = Math.max(0, 11 - act.length);
  if (missingPlayers > 0) {
    att *= Math.max(0.34, 1 - missingPlayers * 0.16);
    build *= Math.max(0.38, 1 - missingPlayers * 0.14);
    create *= Math.max(0.34, 1 - missingPlayers * 0.15);
    def *= Math.max(0.42, 1 - missingPlayers * 0.12);
    press *= Math.max(0.36, 1 - missingPlayers * 0.15);
    ment *= Math.max(0.7, 1 - missingPlayers * 0.06);
  }
  if (lt.redCardPenalty < 1) {
    att *= lt.redCardPenalty;
    build *= lt.redCardPenalty;
    create *= lt.redCardPenalty;
    def *= lt.redCardPenalty;
    press *= lt.redCardPenalty;
    ment *= lt.redCardPenalty;
  }
  return { att, build, create, def, press, gk: gk || 24, ment, aggr, avgFat: fat / act.length, active: act.length };
};
var eventPush = (timeline, minute, teamSide, type, text, primaryPlayerId, secondaryPlayerId) => {
  timeline.push({ minute, teamSide, type, text, primaryPlayerId, secondaryPlayerId });
};
var goalEntry = (scorer, teamId, minute, isPenalty, assistant) => ({
  playerId: scorer.id,
  playerName: nameOf(scorer),
  minute,
  teamId,
  isPenalty,
  assistantId: assistant?.id,
  assistantName: assistant ? nameOf(assistant) : void 0
});
var pickCreator = (lt, rng) => weighted(activePlayers(lt).filter((p) => p.position !== "GK" /* GK */), rng, (p) => {
  const role = slotRole(lt, p.id);
  const rb = role === "MID" /* MID */ ? 1.18 : role === "FWD" /* FWD */ ? 1.08 : 0.9;
  return (p.attributes.passing * 1.45 + p.attributes.vision * 1.4 + p.attributes.technique * 1.25 + p.attributes.dribbling * 0.95 + p.attributes.crossing * 0.82 + p.attributes.attacking * 0.7 + p.attributes.workRate * 0.45) * fatMul(lt.fatigue[p.id] ?? 100) * moraleMul(p) * rb;
});
var pickShooter = (lt, rng) => weighted(activePlayers(lt).filter((p) => p.position !== "GK" /* GK */), rng, (p) => {
  const role = slotRole(lt, p.id);
  const rb = role === "FWD" /* FWD */ ? 1.22 : role === "MID" /* MID */ ? 0.95 : 0.7;
  return (p.attributes.finishing * 1.65 + p.attributes.attacking * 1.35 + p.attributes.positioning * 1.15 + p.attributes.technique * 0.9 + p.attributes.heading * 0.7 + p.attributes.pace * 0.55 + p.attributes.mentality * 0.45) * fatMul(lt.fatigue[p.id] ?? 100) * moraleMul(p) * rb;
});
var pickDefender = (lt, rng) => weighted(activePlayers(lt).filter((p) => p.position !== "GK" /* GK */), rng, (p) => (p.attributes.defending * 1.45 + p.attributes.positioning * 1.2 + p.attributes.strength * 0.8 + p.attributes.pace * 0.72 + p.attributes.aggression * 0.68 + p.attributes.heading * 0.55 + p.attributes.mentality * 0.55) * fatMul(lt.fatigue[p.id] ?? 100) * moraleMul(p));
var pickKeeper = (lt) => lt.squad.find((p) => p.id === lt.activeXI[0]) ?? null;
var pickPenalty = (lt, rng) => {
  const act = activePlayers(lt).filter((p) => p.position !== "GK" /* GK */);
  const fixed = lt.penaltyTakerId ? act.find((p) => p.id === lt.penaltyTakerId) ?? null : null;
  return fixed ?? weighted(act, rng, (p) => (p.attributes.penalties * 2.2 + p.attributes.finishing * 1.1 + p.attributes.technique * 0.9 + p.attributes.mentality * 0.8) * fatMul(lt.fatigue[p.id] ?? 100) * moraleMul(p));
};
var removeFromPitch = (lt, playerId) => {
  lt.activeXI = lt.activeXI.map((id) => id === playerId ? null : id);
};
var applyRedCardPenalty = (lt, expelled) => {
  const overall = playerOverall(expelled);
  const penalty = 0.08 + overall / 100 * 0.06;
  lt.redCardPenalty = Math.max(0.65, lt.redCardPenalty * (1 - penalty));
};
var shortHandedGoalChance = (sentOffCount) => {
  if (sentOffCount >= 2) return 1e-3;
  if (sentOffCount === 1) return 0.28;
  return 1;
};
var benchReplacement = (lt, requiredRole, minute, losing) => {
  const bench = lt.bench.map((id) => lt.squad.find((p) => p.id === id) ?? null).filter(Boolean);
  if (!bench.length) return null;
  const sorted = [...bench].sort((a, b) => {
    const sa = LineupService.calculateFitScore(a, requiredRole) + (lt.fatigue[a.id] ?? a.condition ?? 100) * 0.75 + (losing && a.position === "FWD" /* FWD */ ? 10 : 0) + (losing && a.position === "MID" /* MID */ ? 6 : 0);
    const sb = LineupService.calculateFitScore(b, requiredRole) + (lt.fatigue[b.id] ?? b.condition ?? 100) * 0.75 + (losing && b.position === "FWD" /* FWD */ ? 10 : 0) + (losing && b.position === "MID" /* MID */ ? 6 : 0);
    return sb - sa;
  });
  return sorted.find((p) => p.position === requiredRole) ?? (minute >= 72 && losing ? sorted.find((p) => p.position !== "GK" /* GK */) ?? sorted[0] : sorted[0]);
};
var doSub = (lt, slotIdx, incoming, minute, subs, timeline) => {
  const outId = lt.activeXI[slotIdx];
  const outgoing = lt.squad.find((p) => p.id === outId) ?? null;
  lt.activeXI[slotIdx] = incoming.id;
  lt.bench = lt.bench.filter((id) => id !== incoming.id);
  lt.subs += 1;
  lt.minutes[incoming.id] = lt.minutes[incoming.id] ?? 0;
  subs.push({ playerOutId: outgoing?.id, playerOutName: nameOf(outgoing), playerInId: incoming.id, playerInName: nameOf(incoming), minute, teamId: lt.team.id });
  eventPush(timeline, minute, lt.side, "SUBSTITUTION" /* SUBSTITUTION */, `${lt.team.name}: ${nameOf(incoming)} for ${nameOf(outgoing)}`, incoming.id, outgoing?.id);
};
var maybeSub = (lt, minute, homeScore, awayScore, subs, timeline, rng) => {
  if (lt.subs >= 5 || !lt.bench.length || minute < 46) return;
  const act = activePlayers(lt).filter((p) => p.position !== "GK" /* GK */);
  if (!act.length) return;
  const ownScore = lt.side === "HOME" ? homeScore : awayScore;
  const opponentScore = lt.side === "HOME" ? awayScore : homeScore;
  const scoreDiff = ownScore - opponentScore;
  const losing = scoreDiff < 0;
  const winning = scoreDiff > 0;
  const coachDecision = lt.coach.attributes.decisionMaking ?? 50;
  const plannedSubLimit = coachDecision >= 72 ? 4 : coachDecision >= 42 ? 3 : 2;
  const lateSubLimit = winning && minute >= 84 ? Math.min(5, plannedSubLimit + 1) : plannedSubLimit;
  const candidates = act.map((player) => {
    const idx = slotIndex(lt, player.id);
    const requiredRole = idx >= 0 ? TacticRepository.getById(lt.tacticId).slots[idx]?.role ?? player.position : player.position;
    const incoming = benchReplacement(lt, requiredRole, minute, losing);
    if (!incoming || idx < 0) return null;
    const fatigue = lt.fatigue[player.id] ?? player.condition ?? 100;
    const incomingFatigue = lt.fatigue[incoming.id] ?? incoming.condition ?? 100;
    const currentPower = LineupService.calculateFitScore(player, requiredRole) * fatMul(fatigue);
    const incomingPower = LineupService.calculateFitScore(incoming, requiredRole) * fatMul(incomingFatigue);
    const fatiguePressure = Math.max(0, 78 - fatigue) * 1.25;
    const yellowPressure = (lt.yellows[player.id] ?? 0) > 0 && minute >= 68 ? 11 + player.attributes.aggression * 0.13 + Math.max(0, 76 - fatigue) * 0.35 : 0;
    const tacticalPressure = losing ? requiredRole === "DEF" /* DEF */ ? 7 : requiredRole === "MID" /* MID */ ? 3 : 0 : winning ? requiredRole === "FWD" /* FWD */ ? 6 : requiredRole === "MID" /* MID */ ? 2 : 0 : 0;
    const benchUpgrade = clamp8((incomingPower - currentPower) / 6, -8, 12);
    const urgency = fatiguePressure + yellowPressure + tacticalPressure + benchUpgrade;
    return { player, idx, incoming, fatigue, currentPower, incomingPower, urgency, yellowPressure };
  }).filter(Boolean);
  const target = [...candidates].sort((a, b) => b.urgency - a.urgency)[0];
  if (!target) return;
  const forcedByExhaustion = target.fatigue < 45;
  const forcedByCardRisk = target.yellowPressure >= 22;
  const canMakePlannedSub = minute >= 58 && lt.subs < lateSubLimit;
  const phaseChance = minute >= 84 ? 0.82 : minute >= 75 ? 0.72 : minute >= 67 ? 0.58 : 0.42;
  const coachChance = (coachDecision - 50) * 3e-3;
  const scoreChance = losing ? 0.12 : winning && minute >= 75 ? 0.08 : 0;
  const plannedChance = clamp8(phaseChance + coachChance + scoreChance, 0.25, 0.95);
  const urgencyThreshold = minute >= 84 ? 3 : minute >= 75 ? 6 : 10;
  if (!forcedByExhaustion && !forcedByCardRisk) {
    if (!canMakePlannedSub || target.urgency < urgencyThreshold || rng.next() >= plannedChance) return;
    if (target.incomingPower < target.currentPower * (losing ? 0.78 : 0.86)) return;
  }
  doSub(lt, target.idx, target.incoming, minute, subs, timeline);
};
var fatigueTick = (lt, minute, weatherInt, trailing) => {
  lt.activeXI.forEach((id, idx) => {
    if (!id) return;
    const p = lt.squad.find((x) => x.id === id);
    if (!p) return;
    const role = TacticRepository.getById(lt.tacticId).slots[idx]?.role ?? p.position;
    let drain = 0.18;
    if (role === "DEF" /* DEF */) drain *= 1.18;
    if (role === "MID" /* MID */) drain *= 1.25;
    if (role === "FWD" /* FWD */) drain *= 1.14;
    if (role === "GK" /* GK */) drain *= 0.22;
    drain *= 0.85 + p.attributes.workRate / 100 * 0.35;
    drain *= 1.28 - Math.pow((p.attributes.stamina || 50) / 100, 1.15) * 0.42;
    drain *= 1 + weatherInt * 0.22;
    drain *= 1 + lt.sentOff.size * 0.09;
    if (trailing && minute >= 70) drain *= 1.06;
    lt.fatigue[id] = clamp8((lt.fatigue[id] ?? p.condition ?? 100) - drain, 0, 100);
    const debtRoleFactor = role === "GK" /* GK */ ? 0.35 : 1;
    lt.debt[id] = (lt.debt[id] ?? 0) + (drain * 0.22 + (100 - p.attributes.stamina) * 13e-4) * debtRoleFactor;
    lt.minutes[id] = (lt.minutes[id] ?? 0) + 1;
  });
};
var maybeInjury = (lt, minute, weatherInt, homeScore, awayScore, rng, injuries, subs, timeline, lightInjuryMultiplier = 1) => {
  const act = activePlayers(lt).filter((p) => p.position !== "GK" /* GK */);
  if (!act.length) return;
  const avgFat = act.reduce((s, p) => s + (lt.fatigue[p.id] ?? 100), 0) / act.length;
  const chance = 32e-4 + weatherInt * 2e-3 + Math.max(0, 68 - avgFat) * 6e-5;
  if (rng.next() >= chance) return;
  const injured = weighted(act, rng, (p) => (100 - (lt.fatigue[p.id] ?? 100)) * 1.2 + p.attributes.workRate * 0.42 + (100 - p.attributes.stamina) * 0.7 + (p.fatigueDebt || 0) * 0.5);
  if (!injured) return;
  const f = lt.fatigue[injured.id] ?? 100;
  const severe = rng.next() < 0.2 + Math.max(0, 52 - f) * 8e-3 + weatherInt * 0.1;
  if (!severe && lightInjuryMultiplier < 1 && rng.next() >= lightInjuryMultiplier) return;
  const { days, type } = rollInjuryBySeverity(severe ? "SEVERE" /* SEVERE */ : "LIGHT" /* LIGHT */, () => rng.next());
  injuries.push({ playerId: injured.id, playerName: nameOf(injured), minute, teamId: lt.team.id, severity: severe ? "SEVERE" /* SEVERE */ : "LIGHT" /* LIGHT */, days, type });
  eventPush(timeline, minute, lt.side, severe ? "INJURY_SEVERE" /* INJURY_SEVERE */ : "INJURY_LIGHT" /* INJURY_LIGHT */, `${nameOf(injured)} injured for ${lt.team.name}`, injured.id);
  if (!severe && f > 46 && minute < 82) return;
  const idx = slotIndex(lt, injured.id);
  const req = idx >= 0 ? TacticRepository.getById(lt.tacticId).slots[idx]?.role ?? injured.position : injured.position;
  const losing = lt.side === "HOME" ? homeScore < awayScore : awayScore < homeScore;
  const incoming = lt.subs < 5 ? benchReplacement(lt, req, minute, losing) : null;
  if (incoming && idx >= 0) doSub(lt, idx, incoming, minute, subs, timeline);
  else removeFromPitch(lt, injured.id);
};
var maybeCardOrPenalty = (att, def, minute, weatherInt, rng, goals, cards, timeline, homeRef, awayRef, referee) => {
  const creator = pickCreator(att, rng);
  const defender = pickDefender(def, rng);
  if (!creator || !defender) return;
  const refExpFactor = 1 + (50 - (referee.experience || 50)) / 100;
  const strictnessMod = clamp8(referee.strictness / 50, 0.5, 1.8);
  const defenderFatigue = def.fatigue[defender.id] ?? 100;
  const defTrailing = def.side === "HOME" ? homeRef.value < awayRef.value : awayRef.value < homeRef.value;
  const lateChasing = defTrailing && minute >= 65;
  const creatorCtl = (creator.attributes.dribbling * 1.12 + creator.attributes.technique * 1.02 + creator.attributes.pace * 0.82 + creator.attributes.attacking * 0.7 + creator.attributes.mentality * 0.45) * moraleMul(creator);
  const defenderMorale = moraleMul(defender);
  const defenderCtl = (defender.attributes.defending * 1.1 + defender.attributes.positioning * 0.95 + defender.attributes.aggression * 0.42 + defender.attributes.strength * 0.58 + defender.attributes.mentality * 0.44) * defenderMorale;
  const alreadyBooked = (def.yellows[defender.id] ?? 0) > 0;
  const duelEdge = clamp8((creatorCtl - defenderCtl) / 180, -0.18, 0.32);
  const fatigueRisk = clamp8((72 - defenderFatigue) / 90, 0, 0.32);
  const recklessness = clamp8(
    defender.attributes.aggression / 100 * 0.36 + (100 - defender.attributes.mentality) / 100 * 0.24 + (100 - defender.attributes.defending) / 100 * 0.08 + Math.max(0, 1 - defenderMorale) * 0.18 + fatigueRisk + weatherInt * 0.1 + (lateChasing ? 0.06 : 0),
    0.08,
    0.92
  );
  const foulChance = clamp8(
    0.12 + Math.max(0, duelEdge) * 0.28 + recklessness * 0.18,
    0.1,
    0.3
  );
  if (rng.next() >= foulChance) return;
  const foulSeverity = clamp8(
    0.2 + Math.max(0, duelEdge) * 0.44 + recklessness * 0.4 + (alreadyBooked ? 0.02 : 0),
    0.14,
    0.98
  );
  const cardChance = clamp8(
    (0.1 + Math.max(0, foulSeverity - 0.24) * 0.42) * strictnessMod * refExpFactor,
    0.06,
    0.42
  );
  const directRedChance = clamp8(
    (16e-4 + Math.max(0, foulSeverity - 0.84) * 0.03 + weatherInt * 15e-4) * strictnessMod * refExpFactor,
    8e-4,
    0.016
  );
  const directRed = rng.next() < directRedChance;
  if (directRed) {
    cards.push({ playerId: defender.id, playerName: nameOf(defender), minute, teamId: def.team.id, type: "RED" });
    eventPush(timeline, minute, def.side, "RED_CARD" /* RED_CARD */, `${nameOf(defender)} sent off for ${def.team.name}`, defender.id);
    def.sentOff.add(defender.id);
    removeFromPitch(def, defender.id);
    applyRedCardPenalty(def, defender);
  } else if (rng.next() < cardChance) {
    if (alreadyBooked) {
      cards.push({ playerId: defender.id, playerName: nameOf(defender), minute, teamId: def.team.id, type: "SECOND_YELLOW" });
      eventPush(timeline, minute, def.side, "RED_CARD" /* RED_CARD */, `${nameOf(defender)} sent off for ${def.team.name}`, defender.id);
      def.sentOff.add(defender.id);
      removeFromPitch(def, defender.id);
      applyRedCardPenalty(def, defender);
    } else {
      def.yellows[defender.id] = (def.yellows[defender.id] ?? 0) + 1;
      cards.push({ playerId: defender.id, playerName: nameOf(defender), minute, teamId: def.team.id, type: "YELLOW" });
      eventPush(timeline, minute, def.side, "YELLOW_CARD" /* YELLOW_CARD */, `${nameOf(defender)} booked for ${def.team.name}`, defender.id);
    }
  }
  const homeBias = att.side === "HOME" ? -(referee.advantageTendency / 5e3) : referee.advantageTendency / 1e4;
  const penChance = clamp8(
    (9e-3 + Math.max(0, creator.attributes.pace + creator.attributes.dribbling + creator.attributes.attacking - defender.attributes.positioning - defender.attributes.pace - defender.attributes.defending) / 3e3 + Math.max(0, foulSeverity - 0.5) * 0.014 + weatherInt * 3e-3) * strictnessMod * refExpFactor + homeBias,
    4e-3,
    0.04
  );
  if (rng.next() >= penChance) return;
  const taker = pickPenalty(att, rng);
  const keeper = pickKeeper(def);
  if (!taker || !keeper) return;
  if (rng.next() > shortHandedGoalChance(att.sentOff.size)) return;
  const scoreChance = clamp8(0.63 + ((taker.attributes.penalties * 1.6 + taker.attributes.finishing * 0.8 + taker.attributes.mentality * 0.7 + taker.attributes.technique * 0.55) * moraleMul(taker) - (keeper.attributes.goalkeeping * 1.42 + keeper.attributes.positioning * 0.82 + keeper.attributes.mentality * 0.56) * moraleMul(keeper)) / 360 + (att.side === "HOME" ? 0.02 : 0) - weatherInt * 0.03, 0.12, 0.9);
  eventPush(timeline, minute, att.side, "PENALTY_AWARDED" /* PENALTY_AWARDED */, `Penalty for ${att.team.name}`, taker.id, defender.id);
  if (rng.next() < scoreChance) {
    goals.push(goalEntry(taker, att.team.id, minute, true));
    eventPush(timeline, minute, att.side, "PENALTY_SCORED" /* PENALTY_SCORED */, `${nameOf(taker)} scores the penalty for ${att.team.name}`, taker.id);
    if (att.side === "HOME") homeRef.value += 1;
    else awayRef.value += 1;
  } else {
    eventPush(timeline, minute, att.side, "PENALTY_MISSED" /* PENALTY_MISSED */, `${nameOf(taker)} misses the penalty for ${att.team.name}`, taker.id);
  }
};
var maybeGoal = (att, def, minute, weatherInt, rng, goals, timeline, attM, defM, scoreRef) => {
  const creator = pickCreator(att, rng);
  const shooter = pickShooter(att, rng);
  const defender = pickDefender(def, rng);
  const keeper = pickKeeper(def);
  if (!creator || !shooter || !defender || !keeper) return;
  const prog = (creator.attributes.passing * 0.78 + creator.attributes.vision * 0.74 + creator.attributes.technique * 0.64 + creator.attributes.dribbling * 0.58) * moraleMul(creator) + attM.build * 0.018 + attM.create * 0.016 + (att.coach?.attributes.decisionMaking ?? 50) * 0.18;
  const disrupt = (defender.attributes.defending * 0.72 + defender.attributes.positioning * 0.68 + defender.attributes.pace * 0.42) * moraleMul(defender) + defM.def * 0.02 + defM.press * 0.01 + (def.coach?.attributes.decisionMaking ?? 50) * 0.16;
  const numbersAdvantage = def.sentOff.size - att.sentOff.size;
  const overallAtt = attM.att + attM.build + attM.create + attM.def + attM.press;
  const overallDef = defM.att + defM.build + defM.create + defM.def + defM.press;
  const dominanceFactor = clamp8(overallAtt / Math.max(1, overallDef), 0.25, 3.2);
  const dominanceEdge = Math.max(0, dominanceFactor - 1);
  const underdogGap = Math.max(0, 1 - dominanceFactor);
  const attackQualityModifier = clamp8(Math.pow(dominanceFactor, 0.45), 0.58, 1.2);
  const accuracyQualityModifier = clamp8(Math.pow(dominanceFactor, 0.25), 0.78, 1.08);
  const finishingQualityModifier = clamp8(Math.pow(dominanceFactor, 0.35), 0.7, 1.15);
  const attackShortHanded = shortHandedGoalChance(att.sentOff.size);
  const phaseFloor = clamp8(0.07 - underdogGap * 0.075, 0.028, 0.07);
  const phaseCeiling = clamp8(0.28 + dominanceEdge * 0.035, 0.28, 0.34);
  const phaseChance = clamp8(
    clamp8(0.14 + (prog - disrupt) / 980 + (att.side === "HOME" ? 0.015 : 0) - weatherInt * 0.025, phaseFloor, phaseCeiling) * attackQualityModifier * att.redCardPenalty * attackShortHanded + Math.max(0, numbersAdvantage) * 0.03 * dominanceFactor,
    0,
    0.48
  );
  if (rng.next() >= phaseChance) return;
  const shot = (shooter.attributes.finishing * 0.92 + shooter.attributes.attacking * 0.75 + shooter.attributes.positioning * 0.65 + shooter.attributes.technique * 0.56 + shooter.attributes.heading * 0.26) * moraleMul(shooter) + (creator.attributes.vision * 0.18 + creator.attributes.passing * 0.18) * moraleMul(creator) + attM.att * 0.022 + attM.create * 0.015 + (att.coach?.attributes.motivation ?? 50) * 0.18;
  const prev = (keeper.attributes.goalkeeping * 0.94 + keeper.attributes.positioning * 0.58) * moraleMul(keeper) + defM.def * 0.022 + (defender.attributes.defending * 0.32 + defender.attributes.positioning * 0.22) * moraleMul(defender) + weatherInt * 4;
  const onTargetFloor = clamp8(0.1 - underdogGap * 0.07, 0.055, 0.1);
  const onTargetCeiling = clamp8(0.42 + dominanceEdge * 0.025, 0.42, 0.47);
  const onTarget = clamp8(
    clamp8(0.2 + (shot - prev) / 920 + Math.max(0, 100 - (att.fatigue[shooter.id] ?? 100)) * -1e-3 - weatherInt * 0.035, onTargetFloor, onTargetCeiling) * accuracyQualityModifier,
    0.04,
    0.55
  );
  if (rng.next() >= onTarget) return;
  const goalFloor = clamp8(0.05 - underdogGap * 0.04, 0.02, 0.05);
  const goalCeiling = clamp8(0.24 + dominanceEdge * 0.035, 0.24, 0.3);
  const goalChance = clamp8(
    clamp8(0.1 + (shot - prev) / 760 + (att.side === "HOME" ? 0.01 : 0) - weatherInt * 0.02, goalFloor, goalCeiling) * finishingQualityModifier * att.redCardPenalty * attackShortHanded + Math.max(0, numbersAdvantage) * 0.04 * dominanceFactor,
    0,
    0.44
  );
  if (rng.next() < goalChance) {
    const assistant = creator.id !== shooter.id ? creator : null;
    goals.push(goalEntry(shooter, att.team.id, minute, false, assistant));
    eventPush(timeline, minute, att.side, "GOAL" /* GOAL */, `${nameOf(shooter)} scores for ${att.team.name}`, shooter.id, assistant?.id);
    scoreRef.value += 1;
  }
};
var buildRatings = (home, away, homeScore, awayScore, goals, cards, injuries, seed) => {
  const ratings = {};
  const rateTeam = (lt, opponentGoals, won, draw) => {
    const ids = /* @__PURE__ */ new Set([...Object.keys(lt.minutes), ...lt.activeXI.filter(Boolean)]);
    ids.forEach((id) => {
      const player = lt.squad.find((p) => p.id === id);
      if (!player) return;
      const mins = lt.minutes[id] ?? 0;
      if (mins <= 0 && !lt.activeXI.includes(id)) return;
      const r = new Rng4(hash(`${seed}|RATING|${id}`)).next();
      let score = won ? 6.5 + r * 1.1 : draw ? 5.9 + r * 1 : 5.1 + r * 1.1;
      score += Math.min(0.4, mins / 225);
      score += goals.filter((g) => g.playerId === id && !g.isMiss && !g.varDisallowed).length * 1;
      score += goals.filter((g) => g.assistantId === id && !g.isMiss && !g.varDisallowed).length * 0.6;
      if (player.position === "GK" /* GK */ || player.position === "DEF" /* DEF */) {
        score += opponentGoals === 0 ? 0.8 : -opponentGoals * 0.25;
      }
      cards.filter((c) => c.playerId === id).forEach((card) => {
        score -= card.type === "YELLOW" ? 0.35 : 1.6;
      });
      if (injuries.some((injury) => injury.playerId === id && injury.severity === "SEVERE" /* SEVERE */)) score -= 0.25;
      ratings[id] = Number(clamp8(score, 1, 10).toFixed(1));
    });
  };
  const homeWin = homeScore > awayScore;
  const awayWin = awayScore > homeScore;
  rateTeam(home, awayScore, homeWin, !homeWin && !awayWin);
  rateTeam(away, homeScore, awayWin, !homeWin && !awayWin);
  return ratings;
};
var updatePlayers = (updated, locs, date, home, away, goals, cards, injuries, ratings, majorTournamentRecovery = false) => {
  const goalBy = {};
  const assistBy = {};
  const yellowBy = {};
  const redBy = {};
  const injBy = {};
  goals.forEach((g) => {
    if (g.playerId) goalBy[g.playerId] = (goalBy[g.playerId] ?? 0) + 1;
    if (g.assistantId) assistBy[g.assistantId] = (assistBy[g.assistantId] ?? 0) + 1;
  });
  cards.forEach((c) => {
    if (!c.playerId) return;
    if (c.type === "YELLOW") yellowBy[c.playerId] = (yellowBy[c.playerId] ?? 0) + 1;
    else if (c.type === "SECOND_YELLOW") {
      yellowBy[c.playerId] = (yellowBy[c.playerId] ?? 0) + 1;
      redBy[c.playerId] = (redBy[c.playerId] ?? 0) + 1;
    } else redBy[c.playerId] = (redBy[c.playerId] ?? 0) + 1;
  });
  injuries.forEach((i) => {
    if (i.playerId) injBy[i.playerId] = i;
  });
  [home, away].forEach((lt) => {
    const ids = /* @__PURE__ */ new Set([...Object.keys(lt.minutes), ...lt.activeXI.filter(Boolean)]);
    ids.forEach((id) => {
      const loc = locs[id];
      if (!loc || !updated[loc.clubId]?.[loc.index]) return;
      const next = clonePlayer(updated[loc.clubId][loc.index]);
      const mins = lt.minutes[id] ?? 0;
      if (!next.nationalStats) next.nationalStats = { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] };
      if (mins > 0) {
        next.nationalStats.matchesPlayed += 1;
        next.nationalStats.minutesPlayed += mins;
      }
      next.nationalStats.goals += goalBy[id] ?? 0;
      next.nationalStats.assists += assistBy[id] ?? 0;
      next.nationalStats.yellowCards += yellowBy[id] ?? 0;
      next.nationalStats.redCards += redBy[id] ?? 0;
      if (ratings[id] !== void 0) next.nationalStats.ratingHistory = [...next.nationalStats.ratingHistory ?? [], ratings[id]];
      next.nationalSuspensionMatches = Math.max(0, (next.nationalSuspensionMatches ?? 0) - 1);
      if ((yellowBy[id] ?? 0) > 0 && next.nationalStats.yellowCards % 4 === 0) next.nationalSuspensionMatches += 1;
      if ((redBy[id] ?? 0) > 0) next.nationalSuspensionMatches += 2;
      if (lt.fatigue[id] !== void 0) next.condition = clamp8(lt.fatigue[id], 0, 100);
      if (lt.debt[id] !== void 0) {
        next.fatigueDebt = clamp8((next.fatigueDebt ?? 0) + lt.debt[id], 0, 100);
        next.condition = Math.min(next.condition, 100 - next.fatigueDebt);
      }
      if (mins > 0) {
        const recoveryUntil = getNationalTeamRecoveryUntil(date);
        next.nationalTeamRecoveryUntil = recoveryUntil;
        if (majorTournamentRecovery) next.nationalTeamMajorTournamentRecoveryUntil = recoveryUntil;
      }
      if (injBy[id]) {
        const injury = injBy[id];
        next.health = { status: "INJURED" /* INJURED */, injury: { type: injury.type, daysRemaining: injury.days, severity: injury.severity, injuryDate: date.toISOString(), totalDays: injury.days, conditionAtInjury: next.condition } };
      }
      updated[loc.clubId][loc.index] = next;
    });
  });
};
function simulateSinglePlayoffMatch(homeTeamName, awayTeamName, competitionLabel, matchDate, seed, nationalTeams2, players, coaches, season = 0, usedRefereeIds = /* @__PURE__ */ new Set()) {
  const byName = new Map(nationalTeams2.map((t) => [t.name, t]));
  const updatedPlayers = cloneMap(players);
  const locs = locMap(updatedPlayers);
  const fakeMatch = {
    home: homeTeamName,
    away: awayTeamName,
    competitionLabel
  };
  const fakeMd = {
    day: matchDate.getDate(),
    month: matchDate.getMonth(),
    competitionLabel,
    matches: [fakeMatch]
  };
  const homeTeam = byName.get(homeTeamName) ?? null;
  const awayTeam = byName.get(awayTeamName) ?? null;
  if (!homeTeam || !awayTeam) {
    const rng2 = new Rng4(hash(`${seed}|${homeTeamName}|${awayTeamName}|FALLBACK`));
    const h = rng2.int(0, 3);
    const a = rng2.int(0, 3);
    if (h !== a) return { homeGoals: h, awayGoals: a };
    const pk = rng2.next() < 0.5 ? homeTeamName : awayTeamName;
    return { homeGoals: h, awayGoals: a, penaltyWinner: pk };
  }
  const squadOf = (team) => team.squadPlayerIds.map((id) => {
    const loc = locs[id];
    return loc ? updatedPlayers[loc.clubId]?.[loc.index] ?? null : null;
  }).filter(Boolean);
  const homeSquad = ensureEmergencyMatchSquad(homeTeam, squadOf(homeTeam), matchDate, seed, updatedPlayers, locs);
  const awaySquad = ensureEmergencyMatchSquad(awayTeam, squadOf(awayTeam), matchDate, seed + 17, updatedPlayers, locs);
  const emergencyPlayers = [...updatedPlayers[NT_EMERGENCY_CLUB_ID] ?? []];
  const homeCoach = homeTeam.coachId ? coaches[homeTeam.coachId] ?? fallbackCoach(homeTeam.id) : fallbackCoach(homeTeam.id);
  const awayCoach = awayTeam.coachId ? coaches[awayTeam.coachId] ?? fallbackCoach(awayTeam.id) : fallbackCoach(awayTeam.id);
  const hs = NationalTeamLineupService.buildMatchSelection(homeTeam, homeSquad, homeCoach);
  const as = NationalTeamLineupService.buildMatchSelection(awayTeam, awaySquad, awayCoach);
  const kits = KitSelectionService.selectOptimalNationalTeamKits(homeTeam, awayTeam);
  const envSeed = `${seed}|${homeTeam.id}|${awayTeam.id}`;
  const weather = NationalTeamEnvironmentService.getWeather(matchDate, homeTeam, awayTeam, competitionLabel, envSeed);
  const attendance = NationalTeamEnvironmentService.estimateAttendance(homeTeam, awayTeam, competitionLabel, weather, envSeed);
  const playoffReferee = RefereeService.assignEuropeanRefereeByRegion(`${envSeed}|PLAYOFF_REF`, homeTeam.region, awayTeam.region, usedRefereeIds);
  usedRefereeIds.add(playoffReferee.id);
  const refereeName = `${playoffReferee.firstName} ${playoffReferee.lastName}`;
  const rng = new Rng4(hash(`${envSeed}|PLAYOFF`));
  const home = { side: "HOME", team: homeTeam, coach: homeCoach, squad: homeSquad, activeXI: [...hs.lineup.startingXI], bench: [...hs.lineup.bench], tacticId: hs.lineup.tacticId, fatigue: Object.fromEntries(homeSquad.map((p) => [p.id, p.condition ?? 100])), debt: {}, minutes: {}, yellows: {}, sentOff: /* @__PURE__ */ new Set(), subs: 0, redCardPenalty: 1, penaltyTakerId: hs.penaltyTakerId };
  const away = { side: "AWAY", team: awayTeam, coach: awayCoach, squad: awaySquad, activeXI: [...as.lineup.startingXI], bench: [...as.lineup.bench], tacticId: as.lineup.tacticId, fatigue: Object.fromEntries(awaySquad.map((p) => [p.id, p.condition ?? 100])), debt: {}, minutes: {}, yellows: {}, sentOff: /* @__PURE__ */ new Set(), subs: 0, redCardPenalty: 1, penaltyTakerId: as.penaltyTakerId };
  const goals = [];
  const cards = [];
  const substitutions = [];
  const timeline = [];
  const homeScore = { value: 0 };
  const awayScore = { value: 0 };
  const runMinutes = (from, to) => {
    let stop = 0.5;
    let addedTime = 2;
    for (let minute = from; minute <= to + addedTime; minute++) {
      if (minute === 46 || minute === 106 || minute >= 58 && minute <= 88 && minute % 7 === 0 || minute >= 108 && minute <= 118 && minute % 5 === 0) {
        maybeSub(home, minute, homeScore.value, awayScore.value, substitutions, timeline, rng);
        maybeSub(away, minute, homeScore.value, awayScore.value, substitutions, timeline, rng);
      }
      const hm = metrics(home);
      const am = metrics(away);
      const phases = 1 + (rng.next() < clamp8(0.06 + (hm.press + am.press) / 5200 + (homeCoach.attributes.motivation + awayCoach.attributes.motivation) / 1200, 0.08, 0.34) ? 1 : 0);
      for (let i = 0; i < phases; i++) {
        const homeInit = clamp8(0.48 + (hm.build - am.press) / 2400 + (hm.create - am.def) / 2600 + (hm.ment - am.ment) / 3e3 + (homeCoach.attributes.decisionMaking - awayCoach.attributes.decisionMaking) / 900 + (home.redCardPenalty - away.redCardPenalty) * 0.4 + 0.045, 0.22, 0.78);
        const att = rng.next() < homeInit ? home : away;
        const def = att.side === "HOME" ? away : home;
        const attM = att.side === "HOME" ? hm : am;
        const defM = def.side === "HOME" ? hm : am;
        const duelChance = clamp8(0.065 + (attM.press + defM.aggr) / 16e3 + (weather.weatherIntensity ?? 0) * 0.01, 0.065, 0.14);
        if (rng.next() < duelChance) {
          maybeCardOrPenalty(att, def, minute, weather.weatherIntensity ?? 0, rng, goals, cards, timeline, homeScore, awayScore, playoffReferee);
          stop += 0.08;
        } else {
          maybeGoal(att, def, minute, weather.weatherIntensity ?? 0, rng, goals, timeline, attM, defM, att.side === "HOME" ? homeScore : awayScore);
          const last = timeline[timeline.length - 1];
          if (last?.minute === minute && (last.type === "GOAL" /* GOAL */ || last.type === "PENALTY_SCORED" /* PENALTY_SCORED */)) stop += 0.22;
        }
      }
      fatigueTick(home, minute, weather.weatherIntensity ?? 0, homeScore.value < awayScore.value);
      fatigueTick(away, minute, weather.weatherIntensity ?? 0, awayScore.value < homeScore.value);
      addedTime = clamp8(2 + Math.floor(stop), 2, 7);
    }
  };
  runMinutes(1, 90);
  const goalsAfter90 = { home: homeScore.value, away: awayScore.value };
  if (homeScore.value === awayScore.value) {
    runMinutes(91, 120);
  }
  const goalsAfterAET = { home: homeScore.value, away: awayScore.value };
  const ratings = buildRatings(home, away, goalsAfterAET.home, goalsAfterAET.away, goals, cards, [], seed);
  updatePlayers(updatedPlayers, locs, matchDate, home, away, goals, cards, [], ratings, isMajorNationalTournament(competitionLabel));
  delete updatedPlayers[NT_EMERGENCY_CLUB_ID];
  if (homeScore.value === awayScore.value) {
    const pkRng = new Rng4(hash(`${seed}|PK_SHOOTOUT`));
    let homePK = 0;
    let awayPK = 0;
    const hRep = homeTeam.reputation ?? 10;
    const aRep = awayTeam.reputation ?? 10;
    const hRate = clamp8(0.76 + (hRep - aRep) / 200, 0.7, 0.83);
    const aRate = clamp8(0.76 + (aRep - hRep) / 200, 0.7, 0.83);
    for (let round = 0; round < 5; round++) {
      if (pkRng.next() < hRate) homePK++;
      if (pkRng.next() < aRate) awayPK++;
      const remaining = 4 - round;
      if (homePK + remaining < awayPK) break;
      if (awayPK + remaining < homePK) break;
    }
    if (homePK === awayPK) {
      for (let sd = 0; sd < 20 && homePK === awayPK; sd++) {
        if (pkRng.next() < hRate) homePK++;
        if (pkRng.next() < aRate) awayPK++;
      }
    }
    const pkWinner = homePK > awayPK ? homeTeamName : awayPK > homePK ? awayTeamName : pkRng.next() < 0.5 ? homeTeamName : awayTeamName;
    const matchId2 = `PLAYOFF_${homeTeam.id}_${awayTeam.id}_${seed}`;
    const sortedGoals2 = [...goals].sort((a, b) => a.minute - b.minute);
    const sortedCards2 = [...cards].sort((a, b) => a.minute - b.minute);
    const matchHistoryEntry2 = {
      matchId: matchId2,
      date: matchDate.toDateString(),
      season,
      competition: competitionLabel,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeScore: goalsAfterAET.home,
      awayScore: goalsAfterAET.away,
      homePenaltyScore: homePK,
      awayPenaltyScore: awayPK,
      isExtraTime: true,
      attendance,
      venue: homeTeam.stadiumName,
      weather,
      goals: sortedGoals2,
      cards: sortedCards2,
      substitutions: [...substitutions].sort((a, b) => a.minute - b.minute),
      injuries: [],
      timeline: [...timeline].sort((a, b) => a.minute - b.minute),
      refereeName,
      emergencyPlayers: emergencyPlayers.length > 0 ? emergencyPlayers : void 0,
      homeLineup: hs.lineup.startingXI.filter(Boolean),
      awayLineup: as.lineup.startingXI.filter(Boolean),
      ratings,
      homeTacticId: hs.lineup.tacticId,
      awayTacticId: as.lineup.tacticId,
      kits
    };
    return {
      homeGoals: goalsAfter90.home,
      awayGoals: goalsAfter90.away,
      homeGoalsAET: goalsAfterAET.home,
      awayGoalsAET: goalsAfterAET.away,
      penaltyWinner: pkWinner,
      homePenaltyGoals: homePK,
      awayPenaltyGoals: awayPK,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      goals: sortedGoals2,
      cards: sortedCards2,
      venue: homeTeam.stadiumName,
      attendance,
      weather,
      refereeName,
      matchHistoryEntry: matchHistoryEntry2,
      updatedPlayers
    };
  }
  const matchId = `PLAYOFF_${homeTeam.id}_${awayTeam.id}_${seed}`;
  const sortedGoals = [...goals].sort((a, b) => a.minute - b.minute);
  const sortedCards = [...cards].sort((a, b) => a.minute - b.minute);
  const wentToET = goalsAfter90.home === goalsAfter90.away;
  const matchHistoryEntry = {
    matchId,
    date: matchDate.toDateString(),
    season,
    competition: competitionLabel,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeScore: goalsAfterAET.home,
    awayScore: goalsAfterAET.away,
    isExtraTime: wentToET,
    attendance,
    venue: homeTeam.stadiumName,
    weather,
    goals: sortedGoals,
    cards: sortedCards,
    substitutions: [...substitutions].sort((a, b) => a.minute - b.minute),
    injuries: [],
    timeline: [...timeline].sort((a, b) => a.minute - b.minute),
    refereeName,
    emergencyPlayers: emergencyPlayers.length > 0 ? emergencyPlayers : void 0,
    homeLineup: hs.lineup.startingXI.filter(Boolean),
    awayLineup: as.lineup.startingXI.filter(Boolean),
    ratings,
    homeTacticId: hs.lineup.tacticId,
    awayTacticId: as.lineup.tacticId,
    kits
  };
  return {
    homeGoals: goalsAfter90.home,
    awayGoals: goalsAfter90.away,
    homeGoalsAET: goalsAfterAET.home,
    awayGoalsAET: goalsAfterAET.away,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    goals: sortedGoals,
    cards: sortedCards,
    venue: homeTeam.stadiumName,
    attendance,
    weather,
    refereeName,
    matchHistoryEntry,
    updatedPlayers
  };
}
function simulateWCGroupMatch(homeTeamName, awayTeamName, matchDate, seed, nationalTeams2, players, coaches) {
  const byName = new Map(nationalTeams2.map((t) => [t.name, t]));
  const updatedPlayers = cloneMap(players);
  const locs = locMap(updatedPlayers);
  const homeTeam = byName.get(homeTeamName) ?? null;
  const awayTeam = byName.get(awayTeamName) ?? null;
  if (!homeTeam || !awayTeam) {
    const rng2 = new Rng4(hash(`${seed}|${homeTeamName}|${awayTeamName}|WC_FB`));
    return { homeGoals: rng2.int(0, 3), awayGoals: rng2.int(0, 3), goals: [], cards: [] };
  }
  const squadOf = (team) => team.squadPlayerIds.map((id) => {
    const loc = locs[id];
    return loc ? updatedPlayers[loc.clubId]?.[loc.index] ?? null : null;
  }).filter(Boolean);
  const homeSquad = ensureEmergencyMatchSquad(homeTeam, squadOf(homeTeam), matchDate, seed, updatedPlayers, locs);
  const awaySquad = ensureEmergencyMatchSquad(awayTeam, squadOf(awayTeam), matchDate, seed + 17, updatedPlayers, locs);
  const homeCoach = homeTeam.coachId ? coaches[homeTeam.coachId] ?? fallbackCoach(homeTeam.id) : fallbackCoach(homeTeam.id);
  const awayCoach = awayTeam.coachId ? coaches[awayTeam.coachId] ?? fallbackCoach(awayTeam.id) : fallbackCoach(awayTeam.id);
  const hs = NationalTeamLineupService.buildMatchSelection(homeTeam, homeSquad, homeCoach);
  const as = NationalTeamLineupService.buildMatchSelection(awayTeam, awaySquad, awayCoach);
  const kits = KitSelectionService.selectOptimalNationalTeamKits(homeTeam, awayTeam);
  const envSeed = `${seed}|${homeTeam.id}|${awayTeam.id}`;
  const weather = NationalTeamEnvironmentService.getWeather(matchDate, homeTeam, awayTeam, "FIFA World Cup", envSeed);
  const attendance = NationalTeamEnvironmentService.estimateAttendance(homeTeam, awayTeam, "FIFA World Cup", weather, envSeed);
  const wcReferee = RefereeService.assignEuropeanRefereeByRegion(`${envSeed}|WC`, homeTeam.region, awayTeam.region, /* @__PURE__ */ new Set());
  const refereeName = `${wcReferee.firstName} ${wcReferee.lastName}`;
  const rng = new Rng4(hash(`${envSeed}|WC_GROUP`));
  const home = { side: "HOME", team: homeTeam, coach: homeCoach, squad: homeSquad, activeXI: [...hs.lineup.startingXI], bench: [...hs.lineup.bench], tacticId: hs.lineup.tacticId, fatigue: Object.fromEntries(homeSquad.map((p) => [p.id, p.condition ?? 100])), debt: {}, minutes: {}, yellows: {}, sentOff: /* @__PURE__ */ new Set(), subs: 0, redCardPenalty: 1, penaltyTakerId: hs.penaltyTakerId };
  const away = { side: "AWAY", team: awayTeam, coach: awayCoach, squad: awaySquad, activeXI: [...as.lineup.startingXI], bench: [...as.lineup.bench], tacticId: as.lineup.tacticId, fatigue: Object.fromEntries(awaySquad.map((p) => [p.id, p.condition ?? 100])), debt: {}, minutes: {}, yellows: {}, sentOff: /* @__PURE__ */ new Set(), subs: 0, redCardPenalty: 1, penaltyTakerId: as.penaltyTakerId };
  const goals = [];
  const cards = [];
  const injuries = [];
  const substitutions = [];
  const timeline = [];
  const homeScore = { value: 0 };
  const awayScore = { value: 0 };
  let addedTime = 2;
  let stop = 0.5;
  for (let minute = 1; minute <= 90 + addedTime; minute++) {
    if (minute === 46 || minute >= 58 && minute <= 88 && minute % 7 === 0) {
      maybeSub(home, minute, homeScore.value, awayScore.value, substitutions, timeline, rng);
      maybeSub(away, minute, homeScore.value, awayScore.value, substitutions, timeline, rng);
    }
    const hm = metrics(home);
    const am = metrics(away);
    const phases = 1 + (rng.next() < clamp8(0.06 + (hm.press + am.press) / 5200 + (homeCoach.attributes.motivation + awayCoach.attributes.motivation) / 1200, 0.08, 0.34) ? 1 : 0);
    for (let i = 0; i < phases; i++) {
      const homeInit = clamp8(0.48 + (hm.build - am.press) / 2400 + (hm.create - am.def) / 2600 + (hm.ment - am.ment) / 3e3 + (homeCoach.attributes.decisionMaking - awayCoach.attributes.decisionMaking) / 900 + (home.redCardPenalty - away.redCardPenalty) * 0.4 + 0.045, 0.22, 0.78);
      const att = rng.next() < homeInit ? home : away;
      const def = att.side === "HOME" ? away : home;
      const attM = att.side === "HOME" ? hm : am;
      const defM = def.side === "HOME" ? hm : am;
      const duelChance = clamp8(0.065 + (attM.press + defM.aggr) / 16e3 + (weather.weatherIntensity ?? 0) * 0.01, 0.065, 0.14);
      if (rng.next() < duelChance) {
        maybeCardOrPenalty(att, def, minute, weather.weatherIntensity ?? 0, rng, goals, cards, timeline, homeScore, awayScore, wcReferee);
        stop += 0.08;
      } else {
        maybeGoal(att, def, minute, weather.weatherIntensity ?? 0, rng, goals, timeline, attM, defM, att.side === "HOME" ? homeScore : awayScore);
        const last = timeline[timeline.length - 1];
        if (last?.minute === minute && (last.type === "GOAL" /* GOAL */ || last.type === "PENALTY_SCORED" /* PENALTY_SCORED */)) stop += 0.22;
      }
    }
    maybeInjury(home, minute, weather.weatherIntensity ?? 0, homeScore.value, awayScore.value, rng, injuries, substitutions, timeline, 0.5);
    maybeInjury(away, minute, weather.weatherIntensity ?? 0, homeScore.value, awayScore.value, rng, injuries, substitutions, timeline, 0.5);
    fatigueTick(home, minute, weather.weatherIntensity ?? 0, homeScore.value < awayScore.value);
    fatigueTick(away, minute, weather.weatherIntensity ?? 0, awayScore.value < homeScore.value);
    addedTime = clamp8(2 + Math.floor(stop), 2, 7);
  }
  const ratings = buildRatings(home, away, homeScore.value, awayScore.value, goals, cards, injuries, seed);
  updatePlayers(updatedPlayers, locs, matchDate, home, away, goals, cards, injuries, ratings, true);
  const emergencyPlayers = [...updatedPlayers[NT_EMERGENCY_CLUB_ID] ?? []];
  delete updatedPlayers[NT_EMERGENCY_CLUB_ID];
  const matchId = ["WC_GROUP", matchDate.getFullYear(), String(matchDate.getMonth() + 1).padStart(2, "0"), String(matchDate.getDate()).padStart(2, "0"), homeTeam.id, awayTeam.id, seed].join("_");
  const sortedGoals = [...goals].sort((a, b) => a.minute - b.minute);
  const sortedCards = [...cards].sort((a, b) => a.minute - b.minute);
  const matchHistoryEntry = {
    matchId,
    date: matchDate.toDateString(),
    season: matchDate.getFullYear(),
    competition: "FIFA World Cup",
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeScore: homeScore.value,
    awayScore: awayScore.value,
    attendance,
    venue: homeTeam.stadiumName,
    weather,
    addedTime,
    goals: sortedGoals,
    cards: sortedCards,
    substitutions: [...substitutions].sort((a, b) => a.minute - b.minute),
    injuries: [...injuries].sort((a, b) => a.minute - b.minute),
    timeline: [...timeline].sort((a, b) => a.minute - b.minute),
    refereeName,
    homeLineup: hs.lineup.startingXI.filter(Boolean),
    awayLineup: as.lineup.startingXI.filter(Boolean),
    ratings,
    emergencyPlayers: emergencyPlayers.length > 0 ? emergencyPlayers : void 0,
    homeTacticId: hs.lineup.tacticId,
    awayTacticId: as.lineup.tacticId,
    kits
  };
  return {
    matchId,
    homeGoals: homeScore.value,
    awayGoals: awayScore.value,
    goals: sortedGoals,
    cards: sortedCards,
    venue: homeTeam.stadiumName,
    attendance,
    weather,
    refereeName,
    matchHistoryEntry,
    updatedPlayers
  };
}

// services/WCQPlayoffService.ts
var clonePlayersMap = (players) => Object.fromEntries(Object.entries(players).map(([clubId, squad]) => [clubId, [...squad]]));
var Rng5 = class {
  constructor(seed) {
    this.s = seed >>> 0 || 1;
  }
  next() {
    this.s = this.s * 1664525 + 1013904223 >>> 0;
    return this.s / 4294967296;
  }
  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  shuffle(arr) {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
};
function strHash(v) {
  let h = 0;
  for (let i = 0; i < v.length; i++) h = (h << 5) - h + v.charCodeAt(i) | 0;
  return h >>> 0;
}
var GROUP_TEAMS = {
  A: ["Niemcy", "S\u0142owacja", "Irlandia P\xF3\u0142nocna", "Luksemburg"],
  B: ["Szwajcaria", "Kosovo", "S\u0142owenia", "Szwecja"],
  C: ["Szkocja", "Dania", "Grecja", "Bia\u0142oru\u015B"],
  D: ["Francja", "Ukraina", "Islandia", "Azerbejd\u017Can"],
  E: ["Hiszpania", "Turcja", "Gruzja", "Bu\u0142garia"],
  F: ["Portugalia", "Irlandia", "W\u0119gry", "Armenia"],
  G: ["Polska", "Holandia", "Finlandia", "Litwa", "Malta"],
  H: ["Austria", "Bo\u015Bnia i Hercegowina", "Rumunia", "Cypr", "San Marino"],
  I: ["Norwegia", "W\u0142ochy", "Izrael", "Estonia", "Mo\u0142dawia"],
  J: ["Belgia", "Walia", "Macedonia P\xF3\u0142nocna", "Kazachstan", "Liechtenstein"],
  K: ["Anglia", "Albania", "Serbia", "\u0141otwa", "Andora"],
  L: ["Chorwacja", "Czechy", "Wyspy Owcze", "Czarnog\xF3ra", "Gibraltar"]
};
var PREGAME_BY_GROUP = {
  G: [
    { home: "Malta", away: "Finlandia", homeGoals: 0, awayGoals: 1 },
    { home: "Polska", away: "Litwa", homeGoals: 1, awayGoals: 0 },
    { home: "Polska", away: "Malta", homeGoals: 2, awayGoals: 0 },
    { home: "Litwa", away: "Finlandia", homeGoals: 2, awayGoals: 2 },
    { home: "Finlandia", away: "Holandia", homeGoals: 0, awayGoals: 2 },
    { home: "Malta", away: "Litwa", homeGoals: 0, awayGoals: 0 },
    { home: "Finlandia", away: "Polska", homeGoals: 2, awayGoals: 1 },
    { home: "Holandia", away: "Malta", homeGoals: 8, awayGoals: 0 }
  ],
  H: [
    { home: "Rumunia", away: "San Marino", homeGoals: 7, awayGoals: 1 },
    { home: "Bo\u015Bnia i Hercegowina", away: "Cypr", homeGoals: 2, awayGoals: 1 },
    { home: "Austria", away: "Bo\u015Bnia i Hercegowina", homeGoals: 2, awayGoals: 0 },
    { home: "Cypr", away: "San Marino", homeGoals: 2, awayGoals: 0 },
    { home: "Austria", away: "Cypr", homeGoals: 1, awayGoals: 0 },
    { home: "Bo\u015Bnia i Hercegowina", away: "Rumunia", homeGoals: 3, awayGoals: 1 },
    { home: "Austria", away: "San Marino", homeGoals: 10, awayGoals: 0 },
    { home: "Cypr", away: "Rumunia", homeGoals: 2, awayGoals: 2 }
  ],
  I: [
    { home: "W\u0142ochy", away: "Estonia", homeGoals: 5, awayGoals: 0 },
    { home: "Norwegia", away: "Mo\u0142dawia", homeGoals: 11, awayGoals: 1 },
    { home: "Izrael", away: "Norwegia", homeGoals: 2, awayGoals: 4 },
    { home: "Mo\u0142dawia", away: "Estonia", homeGoals: 2, awayGoals: 3 },
    { home: "Izrael", away: "Mo\u0142dawia", homeGoals: 1, awayGoals: 1 },
    { home: "Norwegia", away: "W\u0142ochy", homeGoals: 3, awayGoals: 0 },
    { home: "Izrael", away: "Estonia", homeGoals: 2, awayGoals: 1 },
    { home: "Mo\u0142dawia", away: "W\u0142ochy", homeGoals: 0, awayGoals: 2 }
  ],
  J: [
    { home: "Belgia", away: "Liechtenstein", homeGoals: 7, awayGoals: 0 },
    { home: "Walia", away: "Kazachstan", homeGoals: 3, awayGoals: 1 },
    { home: "Macedonia P\xF3\u0142nocna", away: "Walia", homeGoals: 1, awayGoals: 1 },
    { home: "Kazachstan", away: "Liechtenstein", homeGoals: 4, awayGoals: 0 },
    { home: "Macedonia P\xF3\u0142nocna", away: "Kazachstan", homeGoals: 1, awayGoals: 1 },
    { home: "Walia", away: "Belgia", homeGoals: 1, awayGoals: 1 },
    { home: "Macedonia P\xF3\u0142nocna", away: "Liechtenstein", homeGoals: 5, awayGoals: 0 },
    { home: "Kazachstan", away: "Belgia", homeGoals: 1, awayGoals: 1 }
  ],
  K: [
    { home: "Anglia", away: "\u0141otwa", homeGoals: 3, awayGoals: 0 },
    { home: "Serbia", away: "Andora", homeGoals: 3, awayGoals: 0 },
    { home: "Albania", away: "Serbia", homeGoals: 1, awayGoals: 1 },
    { home: "Andora", away: "\u0141otwa", homeGoals: 0, awayGoals: 1 },
    { home: "Albania", away: "Andora", homeGoals: 3, awayGoals: 0 },
    { home: "Serbia", away: "Anglia", homeGoals: 0, awayGoals: 5 },
    { home: "Albania", away: "\u0141otwa", homeGoals: 1, awayGoals: 0 },
    { home: "Andora", away: "Anglia", homeGoals: 0, awayGoals: 1 }
  ],
  L: [
    { home: "Chorwacja", away: "Wyspy Owcze", homeGoals: 3, awayGoals: 1 },
    { home: "Czechy", away: "Czarnog\xF3ra", homeGoals: 2, awayGoals: 0 },
    { home: "Gibraltar", away: "Czechy", homeGoals: 0, awayGoals: 4 },
    { home: "Czarnog\xF3ra", away: "Wyspy Owcze", homeGoals: 2, awayGoals: 2 },
    { home: "Gibraltar", away: "Czarnog\xF3ra", homeGoals: 1, awayGoals: 2 },
    { home: "Czechy", away: "Chorwacja", homeGoals: 1, awayGoals: 5 },
    { home: "Gibraltar", away: "Wyspy Owcze", homeGoals: 0, awayGoals: 1 },
    { home: "Czarnog\xF3ra", away: "Chorwacja", homeGoals: 2, awayGoals: 3 }
  ]
};
function getReputation(name, nationalTeams2) {
  return nationalTeams2.find((t) => t.name === name)?.reputation ?? 8;
}
function applyMatchToStandings(standings, home, away, hg, ag) {
  if (!standings[home] || !standings[away]) return;
  standings[home].gf += hg;
  standings[home].gd += hg - ag;
  standings[away].gf += ag;
  standings[away].gd += ag - hg;
  if (hg > ag) {
    standings[home].pts += 3;
  } else if (hg === ag) {
    standings[home].pts += 1;
    standings[away].pts += 1;
  } else {
    standings[away].pts += 3;
  }
}
function sortStandings2(standings) {
  return Object.values(standings).sort(
    (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf
  );
}
function computeGroupFromActualData(groupLetter, nationalTeams2, seasonNumber) {
  const teams = GROUP_TEAMS[groupLetter];
  if (!teams) return { winner: "?", runnerUp: "?", thirdPlace: "?" };
  const standings = {};
  teams.forEach((t) => {
    standings[t] = { teamName: t, pts: 0, gd: 0, gf: 0 };
  });
  for (const m of PREGAME_BY_GROUP[groupLetter] ?? []) {
    applyMatchToStandings(standings, m.home, m.away, m.homeGoals, m.awayGoals);
  }
  const teamSet = new Set(teams);
  const teamNameById = new Map(
    nationalTeams2.filter((t) => teamSet.has(t.name)).map((t) => [t.id, t.name])
  );
  const inGameMatches = MatchHistoryService.getAll().filter(
    (m) => m.season === seasonNumber && m.competition.includes("Kwalifikacje") && teamNameById.has(m.homeTeamId) && teamNameById.has(m.awayTeamId)
  );
  for (const m of inGameMatches) {
    const home = teamNameById.get(m.homeTeamId);
    const away = teamNameById.get(m.awayTeamId);
    applyMatchToStandings(standings, home, away, m.homeScore, m.awayScore);
  }
  const sorted = sortStandings2(standings);
  return {
    winner: sorted[0]?.teamName ?? "?",
    runnerUp: sorted[1]?.teamName ?? "?",
    thirdPlace: sorted[2]?.teamName ?? "?"
  };
}
function buildPlayoffField(nationalTeams2, seasonNumber) {
  const groupLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  const runnerUps = [];
  const groupWinners = [];
  const thirdPlaces = [];
  for (const letter of groupLetters) {
    const result = computeGroupFromActualData(letter, nationalTeams2, seasonNumber);
    groupWinners.push(result.winner);
    runnerUps.push(result.runnerUp);
    thirdPlaces.push(result.thirdPlace);
  }
  const extras = thirdPlaces.filter((name) => name !== "?").sort((a, b) => getReputation(b, nationalTeams2) - getReputation(a, nationalTeams2)).slice(0, 4);
  return { all16: [...runnerUps, ...extras], groupWinners };
}
function runPlayoffMatch(homeTeam, awayTeam, nationalTeams2, players, coaches, seed, season = 0, matchDate = new Date(2026, 2, 17), usedRefereeIds = /* @__PURE__ */ new Set()) {
  const label = "Bara\u017Ce M\u015A 2026";
  const res = simulateSinglePlayoffMatch(homeTeam, awayTeam, label, matchDate, seed, nationalTeams2, players, coaches, season, usedRefereeIds);
  if (res.matchHistoryEntry) {
    MatchHistoryService.logMatch(res.matchHistoryEntry);
  }
  return {
    updatedPlayers: res.updatedPlayers ?? players,
    result: {
      homeTeam,
      awayTeam,
      homeGoals: res.homeGoalsAET ?? res.homeGoals,
      awayGoals: res.awayGoalsAET ?? res.awayGoals,
      penaltyWinner: res.penaltyWinner,
      homePenaltyGoals: res.homePenaltyGoals,
      awayPenaltyGoals: res.awayPenaltyGoals,
      wentToExtraTime: res.homeGoals === res.awayGoals,
      refereeName: res.refereeName,
      homeTeamId: res.homeTeamId,
      awayTeamId: res.awayTeamId,
      goals: res.goals,
      cards: res.cards,
      venue: res.venue,
      attendance: res.attendance,
      weather: res.weather
    }
  };
}
function resolveSFWinner(result) {
  if (result.penaltyWinner) return { winner: result.penaltyWinner, penaltyWinner: result.penaltyWinner };
  if (result.homeGoals > result.awayGoals) return { winner: result.homeTeam };
  if (result.homeGoals < result.awayGoals) return { winner: result.awayTeam };
  return { winner: result.homeTeam };
}
var WCQPlayoffService = {
  /**
   * Zwraca podsumowanie fazy grupowej: zwycięzcy, wicemistrzowie i 4 dodatkowe
   * drużyny z 3. miejsc zakwalifikowane do baraży.
   * Używane do generowania emaila-podsumowania po ostatniej kolejce (17 listopada).
   */
  getWCQGroupSummary(nationalTeams2, seasonNumber) {
    const groupLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    const groups = groupLetters.map((letter) => {
      const result = computeGroupFromActualData(letter, nationalTeams2, seasonNumber);
      return { group: letter, winner: result.winner, runnerUp: result.runnerUp, thirdPlace: result.thirdPlace };
    });
    const directQualifiers = groups.map((g) => g.winner);
    const runnerUps = groups.map((g) => g.runnerUp);
    const thirdPlaces = groups.map((g) => g.thirdPlace).filter((name) => name !== "?");
    const extras = [...thirdPlaces].sort((a, b) => getReputation(b, nationalTeams2) - getReputation(a, nationalTeams2)).slice(0, 4);
    return { groups, directQualifiers, runnerUps, extras };
  },
  /**
   * Przeprowadza losowanie baraży — zwraca gotowy WCQPlayoffState z 4 ścieżkami.
   *
   * @param nationalTeams  - lista wszystkich reprezentacji z GameContext
   * @param seasonYear     - rok kalendarzowy (np. 2025) — do wyświetlania
   * @param seasonNumber   - numer sezonu gry (do filtrowania historii meczów)
   * @param seed           - ziarno RNG (zwykle dateToProcess.getTime())
   */
  conductDraw(nationalTeams2, seasonYear, seasonNumber, seed) {
    const { all16 } = buildPlayoffField(nationalTeams2, seasonNumber);
    const sorted16 = [...all16].sort(
      (a, b) => getReputation(b, nationalTeams2) - getReputation(a, nationalTeams2)
    );
    const pot1 = sorted16.slice(0, 8);
    const pot2 = sorted16.slice(8);
    const rng = new Rng5(seed ^ strHash("PLAYOFF_DRAW"));
    const shuffledPot1 = rng.shuffle(pot1);
    const shuffledPot2 = rng.shuffle(pot2);
    const pathLabels = ["A", "B", "C", "D"];
    const paths = pathLabels.map((label, idx) => ({
      pathLabel: label,
      sf1Home: shuffledPot1[idx * 2],
      sf1Away: shuffledPot2[idx * 2],
      sf2Home: shuffledPot1[idx * 2 + 1],
      sf2Away: shuffledPot2[idx * 2 + 1]
    }));
    return {
      seasonYear,
      drawCompleted: true,
      sfCompleted: false,
      finalCompleted: false,
      paths
    };
  },
  /**
   * Symuluje półfinały wszystkich 4 ścieżek.
   * Uzupełnia sf1Result, sf2Result, sf1Winner, sf2Winner, finalHome, finalAway.
   */
  simulateSF(state, nationalTeams2, players, coaches, seed) {
    const sfDate = new Date(2026, 2, 17);
    const usedRefereeIds = /* @__PURE__ */ new Set();
    let updatedPlayers = clonePlayersMap(players);
    const newPaths = state.paths.map((path) => {
      const sf1Seed = seed ^ strHash(`SF1_${path.pathLabel}`);
      const sf2Seed = seed ^ strHash(`SF2_${path.pathLabel}`);
      const sf1Simulation = runPlayoffMatch(path.sf1Home, path.sf1Away, nationalTeams2, updatedPlayers, coaches, sf1Seed, state.seasonYear, sfDate, usedRefereeIds);
      updatedPlayers = sf1Simulation.updatedPlayers;
      const sf2Simulation = runPlayoffMatch(path.sf2Home, path.sf2Away, nationalTeams2, updatedPlayers, coaches, sf2Seed, state.seasonYear, sfDate, usedRefereeIds);
      updatedPlayers = sf2Simulation.updatedPlayers;
      const sf1Result = sf1Simulation.result;
      const sf2Result = sf2Simulation.result;
      const sf1Resolved = resolveSFWinner(sf1Result);
      const sf2Resolved = resolveSFWinner(sf2Result);
      const sf1Winner = sf1Resolved.winner;
      const sf2Winner = sf2Resolved.winner;
      const sf1WonHome = sf1Winner === path.sf1Home;
      const sf2WonHome = sf2Winner === path.sf2Home;
      let finalHome;
      let finalAway;
      if (sf1WonHome && !sf2WonHome) {
        finalHome = sf2Winner;
        finalAway = sf1Winner;
      } else if (!sf1WonHome && sf2WonHome) {
        finalHome = sf1Winner;
        finalAway = sf2Winner;
      } else {
        const coinRng = new Rng5(seed ^ strHash(`COIN_${path.pathLabel}`));
        finalHome = coinRng.next() < 0.5 ? sf1Winner : sf2Winner;
        finalAway = finalHome === sf1Winner ? sf2Winner : sf1Winner;
      }
      return { ...path, sf1Result, sf2Result, sf1Winner, sf2Winner, finalHome, finalAway };
    });
    return { state: { ...state, paths: newPaths, sfCompleted: true }, updatedPlayers };
  },
  /**
   * Symuluje finały wszystkich 4 ścieżek.
   * Uzupełnia finalResult i qualifier.
   */
  simulateFinal(state, nationalTeams2, players, coaches, seed) {
    const usedRefereeIds = /* @__PURE__ */ new Set();
    let updatedPlayers = clonePlayersMap(players);
    const newPaths = state.paths.map((path) => {
      if (!path.finalHome || !path.finalAway) return path;
      const finalSeed = seed ^ strHash(`FINAL_${path.pathLabel}`);
      const finalDate = new Date(2026, 2, 20);
      const finalSimulation = runPlayoffMatch(path.finalHome, path.finalAway, nationalTeams2, updatedPlayers, coaches, finalSeed, state.seasonYear, finalDate, usedRefereeIds);
      updatedPlayers = finalSimulation.updatedPlayers;
      const finalResult = finalSimulation.result;
      const finalResolved = resolveSFWinner(finalResult);
      const qualifier = finalResolved.winner;
      return { ...path, finalResult, qualifier };
    });
    return { state: { ...state, paths: newPaths, finalCompleted: true }, updatedPlayers };
  }
};

// services/RecoveryService.ts
var seededRange = (seed, min, max) => {
  let hash2 = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash2 ^= seed.charCodeAt(i);
    hash2 = Math.imul(hash2, 16777619);
  }
  const normalized = (hash2 >>> 0) / 4294967295;
  return min + (max - min) * normalized;
};
var getPlayerHealingDelayFactor = (player) => {
  const strength = Math.max(1, Math.min(99, player.attributes.strength || 1));
  const injurySeed = `${player.id}_${player.health.injury?.injuryDate ?? ""}_${player.health.injury?.type ?? ""}`;
  const strengthRandomTolerance = seededRange(`${injurySeed}_strength`, 5e-3, 0.01);
  const strengthDeficitSteps = Math.max(0, (99 - strength) / 9);
  const strengthDelay = Math.pow(strengthDeficitSteps, 1.22) * strengthRandomTolerance;
  const ageRandomTolerance = seededRange(`${injurySeed}_age`, 6e-3, 0.012);
  const agePenaltySteps = Math.max(0, (player.age - 30) / 4);
  const ageDelay = Math.pow(agePenaltySteps, 1.18) * ageRandomTolerance;
  return 1 + strengthDelay + ageDelay;
};
var RecoveryService = {
  /**
   * Wykonuje dobową regenerację dla wszystkich zawodników.
   * daysCount: pozwala na precyzyjne odliczanie czasu.
   */
  applyDailyRecovery: (playersMap, currentDate, intensity, daysCount = 1, recoveryMult = 1, medicalQuality, userTeamId) => {
    const updatedMap = { ...playersMap };
    for (const clubId in updatedMap) {
      const effectiveMedicalQuality = userTeamId && clubId === userTeamId ? medicalQuality : void 0;
      const medicalSpeedFactor = (() => {
        if (!effectiveMedicalQuality) return 1;
        const q = effectiveMedicalQuality;
        if (q >= 17) return 1.2 + (q - 17) / 3 * 0.1;
        if (q >= 14) return 1.12 + (q - 14) / 3 * 0.08;
        if (q >= 10) return 1.05 + (q - 10) / 4 * 0.07;
        return 1 + (q - 1) / 9 * 0.05;
      })();
      updatedMap[clubId] = updatedMap[clubId].map((player) => {
        const updated = { ...player };
        const recoveryUntil = player.nationalTeamRecoveryUntil ? new Date(player.nationalTeamRecoveryUntil).setHours(23, 59, 59, 999) : 0;
        const majorTournamentRecoveryUntil = player.nationalTeamMajorTournamentRecoveryUntil ? new Date(player.nationalTeamMajorTournamentRecoveryUntil).setHours(23, 59, 59, 999) : 0;
        const currentRecoveryDay = new Date(currentDate).setHours(0, 0, 0, 0);
        const isInjured = player.health.status === "INJURED" /* INJURED */;
        const hasNationalTeamRecovery = !isInjured && recoveryUntil >= currentRecoveryDay;
        const hasMajorTournamentRecovery = !isInjured && majorTournamentRecoveryUntil >= currentRecoveryDay;
        const nationalTeamDebtRecoveryMult = hasMajorTournamentRecovery ? 3 : hasNationalTeamRecovery ? 2 : 1;
        const nationalTeamConditionRecoveryMult = hasMajorTournamentRecovery ? 1.85 : hasNationalTeamRecovery ? 1.35 : 1;
        if (player.nationalTeamRecoveryUntil && !hasNationalTeamRecovery) {
          updated.nationalTeamRecoveryUntil = null;
        }
        if (player.nationalTeamMajorTournamentRecoveryUntil && !hasMajorTournamentRecovery) {
          updated.nationalTeamMajorTournamentRecoveryUntil = null;
        }
        let ageModifier = 1;
        if (player.age <= 24) ageModifier = 0.8;
        else if (player.age <= 29) ageModifier = 0.6;
        else {
          const normalizedCond = Math.max(0, Math.min(1, (player.condition - 50) / 49));
          const normalizedStr = Math.max(0, Math.min(1, (player.attributes.strength - 50) / 49));
          const physicalFactor = (normalizedCond + normalizedStr) / 2;
          ageModifier = 0.3 + 0.3 * physicalFactor;
        }
        const injuryModifier = isInjured ? 0.5 : 1;
        const debtRecoveryBase = 1.5 + player.attributes.strength * 0.02;
        const totalDebtRecovered = debtRecoveryBase * ageModifier * injuryModifier * daysCount * nationalTeamDebtRecoveryMult;
        updated.fatigueDebt = Math.max(0, (updated.fatigueDebt || 0) - totalDebtRecovered);
        const maxConditionCap = 100 - updated.fatigueDebt;
        const strengthFactor = player.attributes.strength / 100;
        const staminaFactor = player.attributes.stamina / 100;
        let dailyRate = (2.45 + strengthFactor * 1.5 + staminaFactor * 1.5) * recoveryMult * nationalTeamConditionRecoveryMult;
        if (intensity === "LIGHT" /* LIGHT */) {
          dailyRate += 0.5;
        } else if (intensity === "HEAVY" /* HEAVY */) {
          dailyRate -= 2;
        }
        if (updated.condition < 60) {
          dailyRate *= 0.5;
        }
        if (updated.health.status === "INJURED" /* INJURED */ && updated.health.injury?.injuryDate && (updated.health.injury.totalDays || 0) > 1) {
          const condAtInjury = updated.health.injury.conditionAtInjury ?? updated.condition;
          const injStart = new Date(updated.health.injury.injuryDate).setHours(0, 0, 0, 0);
          const simDay = new Date(currentDate).setHours(0, 0, 0, 0);
          const daysPassed = Math.max(0, Math.floor((simDay - injStart) / (1e3 * 60 * 60 * 24)));
          const healingDelayFactor = getPlayerHealingDelayFactor(updated);
          const effTotalDays = Math.max(2, Math.round((updated.health.injury.totalDays || 1) * healingDelayFactor / medicalSpeedFactor));
          const targetCond = condAtInjury + (99 - condAtInjury) * (daysPassed / (effTotalDays - 1));
          updated.condition = Math.min(99, Math.max(condAtInjury, targetCond));
        } else {
          const totalConditionChange = dailyRate * ageModifier * injuryModifier * daysCount;
          updated.condition = Math.max(0, Math.min(maxConditionCap, updated.condition + totalConditionChange * 0.88));
        }
        if (updated.health.status === "INJURED" /* INJURED */ && updated.health.injury?.injuryDate) {
          const injuryStart = new Date(updated.health.injury.injuryDate).setHours(0, 0, 0, 0);
          const currentSimDate = new Date(currentDate).setHours(0, 0, 0, 0);
          const diffMs = currentSimDate - injuryStart;
          const totalDaysPassed = Math.max(0, Math.floor(diffMs / (1e3 * 60 * 60 * 24)));
          const rawTotalDays = updated.health.injury.totalDays || updated.health.injury.daysRemaining;
          const healingDelayFactor = getPlayerHealingDelayFactor(updated);
          const effTotalDays2 = Math.max(1, Math.round(rawTotalDays * healingDelayFactor / medicalSpeedFactor));
          const actualRemaining = effTotalDays2 - totalDaysPassed;
          if (actualRemaining <= 0) {
            updated.health = { status: "HEALTHY" /* HEALTHY */ };
          } else {
            updated.health.injury.daysRemaining = actualRemaining;
            updated.fatigueDebt = Math.min(90, Math.round(actualRemaining * 20 / 7));
            if (updated.health.injury.severity === "LIGHT" /* LIGHT */ && actualRemaining > 14) {
              updated.health.injury.severity = "SEVERE" /* SEVERE */;
            }
          }
        }
        if (updated.negotiationLockoutUntil) {
          const lockoutDate = new Date(updated.negotiationLockoutUntil).setHours(0, 0, 0, 0);
          const currentSimDate = new Date(currentDate).setHours(0, 0, 0, 0);
          if (currentSimDate >= lockoutDate) {
            updated.negotiationLockoutUntil = null;
          }
        }
        if (updated.freeAgentClubLockouts) {
          const currentSimDate = new Date(currentDate).setHours(0, 0, 0, 0);
          updated.freeAgentClubLockouts = Object.fromEntries(
            Object.entries(updated.freeAgentClubLockouts).filter(
              ([, lockoutUntil]) => new Date(lockoutUntil).setHours(0, 0, 0, 0) > currentSimDate
            )
          );
        }
        return updated;
      });
    }
    return updatedMap;
  }
};

// services/WorldCupService.ts
var Rng6 = class {
  constructor(seed) {
    this.s = seed >>> 0 || 1;
  }
  next() {
    this.s = this.s * 1664525 + 1013904223 >>> 0;
    return this.s / 4294967296;
  }
  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  shuffle(arr) {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
};
function strHash2(v) {
  let h = 0;
  for (let i = 0; i < v.length; i++) h = (h << 5) - h + v.charCodeAt(i) | 0;
  return h >>> 0;
}
var WC_HOST_GROUPS_2026 = {
  Meksyk: 0,
  Kanada: 1,
  "Stany Zjednoczone": 3
};
var formatWorldCupVenue = (stadium) => `${stadium.name} (${stadium.city}, ${stadium.country})`;
var estimateWorldCupVenueAttendance = (capacity, year, matchKey) => {
  const rng = new Rng6(strHash2(`WORLD_CUP_ATTENDANCE_${year}_${matchKey}`));
  return Math.max(0, Math.round(capacity * (0.78 + rng.next() * 0.19)));
};
var applyWorldCupTournamentVenue = (result, year, matchKey) => {
  const stadium = pickWorldCupStadiumForMatch(year, matchKey);
  if (!stadium) return result;
  const venue = formatWorldCupVenue(stadium);
  const attendance = estimateWorldCupVenueAttendance(stadium.capacity, year, matchKey);
  return {
    ...result,
    venue,
    attendance,
    matchHistoryEntry: result.matchHistoryEntry ? { ...result.matchHistoryEntry, venue, attendance } : result.matchHistoryEntry
  };
};
function poissonSample(lambda, rng) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng.next();
  } while (p > L && k < 10);
  return Math.max(0, k - 1);
}
function simulateGroupMatchResult(homeRep, awayRep, rng) {
  const total = homeRep + awayRep;
  const homeStrength = homeRep / total;
  const homeExpected = 2.6 * homeStrength + 0.15;
  const awayExpected = 2.6 * (1 - homeStrength);
  const homeGoals = poissonSample(homeExpected, rng);
  const awayGoals = poissonSample(awayExpected, rng);
  return { homeGoals, awayGoals };
}
function simulateKnockoutMatchResult(homeRep, awayRep, rng) {
  const { homeGoals, awayGoals } = simulateGroupMatchResult(homeRep, awayRep, rng);
  if (homeGoals !== awayGoals) {
    return {
      homeGoals,
      awayGoals,
      wentToET: false,
      wentToPenalties: false,
      winner: homeGoals > awayGoals ? "home" : "away"
    };
  }
  const etHome = rng.next() < homeRep / (homeRep + awayRep) + 0.05 ? rng.next() < 0.35 ? 1 : 0 : 0;
  const etAway = rng.next() < awayRep / (homeRep + awayRep) + 0.05 ? rng.next() < 0.35 ? 1 : 0 : 0;
  const homeAET = homeGoals + etHome;
  const awayAET = awayGoals + etAway;
  if (homeAET !== awayAET) {
    return {
      homeGoals,
      awayGoals,
      homeGoalsAET: homeAET,
      awayGoalsAET: awayAET,
      wentToET: true,
      wentToPenalties: false,
      winner: homeAET > awayAET ? "home" : "away"
    };
  }
  const homePKProb = 0.73 + (homeRep - awayRep) * 3e-3;
  const awayPKProb = 0.73 + (awayRep - homeRep) * 3e-3;
  let homePK = 0, awayPK = 0;
  let round = 0;
  while (round < 5) {
    if (rng.next() < Math.min(0.9, Math.max(0.55, homePKProb))) homePK++;
    if (rng.next() < Math.min(0.9, Math.max(0.55, awayPKProb))) awayPK++;
    round++;
  }
  let extraRound = 0;
  while (homePK === awayPK && extraRound < 20) {
    const h = rng.next() < Math.min(0.9, Math.max(0.55, homePKProb)) ? 1 : 0;
    const a = rng.next() < Math.min(0.9, Math.max(0.55, awayPKProb)) ? 1 : 0;
    homePK += h;
    awayPK += a;
    if (h !== a) break;
    extraRound++;
  }
  if (homePK === awayPK) homePK++;
  return {
    homeGoals,
    awayGoals,
    homeGoalsAET: homeAET,
    awayGoalsAET: awayAET,
    homePenalties: homePK,
    awayPenalties: awayPK,
    wentToET: true,
    wentToPenalties: true,
    winner: homePK > awayPK ? "home" : "away"
  };
}
function computeGroupStandings(group) {
  const map = {};
  group.teams.forEach((t) => {
    map[t] = { name: t, M: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, pts: 0 };
  });
  for (const m of group.matches) {
    if (!map[m.home] || !map[m.away]) continue;
    const h = map[m.home];
    const a = map[m.away];
    h.M++;
    a.M++;
    h.GF += m.homeGoals;
    h.GA += m.awayGoals;
    a.GF += m.awayGoals;
    a.GA += m.homeGoals;
    if (m.homeGoals > m.awayGoals) {
      h.W++;
      a.L++;
      h.pts += 3;
    } else if (m.homeGoals < m.awayGoals) {
      a.W++;
      h.L++;
      a.pts += 3;
    } else {
      h.D++;
      a.D++;
      h.pts++;
      a.pts++;
    }
  }
  return Object.values(map).sort(
    (a, b) => b.pts - a.pts || b.GF - b.GA - (a.GF - a.GA) || b.GF - a.GF
  );
}
function weightedPick(pool, count, rng, exclude, getName, power = 6) {
  const available = pool.filter((t) => !exclude.has(getName(t)));
  const result = [];
  const remaining = [...available];
  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalRep = remaining.reduce((s, t) => s + Math.pow(Math.max(1, t.reputation), power), 0);
    let pick = rng.next() * totalRep;
    let chosen = remaining[0];
    for (const t of remaining) {
      pick -= Math.pow(Math.max(1, t.reputation), power);
      if (pick <= 0) {
        chosen = t;
        break;
      }
    }
    result.push(chosen);
    const idx = remaining.indexOf(chosen);
    remaining.splice(idx, 1);
  }
  return result;
}
function qualifiedPick(pool, count, rng, exclude, getName, options = {}) {
  const available = pool.filter((t) => !exclude.has(getName(t))).sort((a, b) => b.reputation - a.reputation);
  const minReputation = options.minReputation ?? 1;
  const shortlistSize = Math.max(count, options.shortlistSize ?? count * 2);
  const shortlist = available.filter((t) => t.reputation >= minReputation).slice(0, shortlistSize);
  const candidatePool = shortlist.length >= count ? shortlist : available.slice(0, Math.max(count, shortlistSize));
  const picked = weightedPick(candidatePool, count, rng, exclude, getName, 7);
  if (picked.length >= count) return picked;
  const pickedNames = new Set(picked.map(getName));
  return [
    ...picked,
    ...available.filter((t) => !pickedNames.has(getName(t))).slice(0, count - picked.length)
  ];
}
var WorldCupService = {
  isWorldCupYear(year) {
    return year >= 2026 && (year - 2026) % 4 === 0;
  },
  getHosts(year) {
    return getWorldCupHostsForYear(year);
  },
  /**
   * Zbiera 48 drużyn na MŚ:
   *  UEFA (16) — z WCQPlayoffService (12 zwycięzców grup + 4 zwycięzców baraży)
   *  CAF (9), AFC (8), CONMEBOL (6), CONCACAF (6), OFC (1) — losowanie ważone reputacją z shortlisty
   *  Intercont (2) — najlepsze dostępne drużyny z pozostałych
   */
  assembleTeams(nationalTeams2, wcqPlayoffState, seasonNumber, year, seed, worldCupQualifiersState) {
    const rng = new Rng6(seed ^ strHash2(`WC_ASSEMBLE_${year}`));
    const usedNames = /* @__PURE__ */ new Set();
    const teams = [];
    const getNTColors = (name) => nationalTeams2.find((t) => t.name === name)?.colorsHex ?? ["#CCCCCC", "#FFFFFF", "#CCCCCC"];
    const addTeam = (name, conf, rep, isHost = false) => {
      if (usedNames.has(name) || name === "?") return;
      usedNames.add(name);
      teams.push({ name, confederation: conf, reputation: rep, colors: getNTColors(name), isHost });
    };
    if (worldCupQualifiersState?.tournamentYear === year) {
      const hostSet = new Set(WorldCupService.getHosts(year));
      for (const qualifier of worldCupQualifiersState.qualifiedTeams) {
        if (hostSet.has(qualifier)) continue;
        const rep = nationalTeams2.find((t) => t.name === qualifier)?.reputation ?? 10;
        addTeam(qualifier, "UEFA", rep);
      }
    } else {
      const summary = WCQPlayoffService.getWCQGroupSummary(nationalTeams2, seasonNumber);
      for (const winner of summary.directQualifiers) {
        const rep = nationalTeams2.find((t) => t.name === winner)?.reputation ?? 10;
        addTeam(winner, "UEFA", rep);
      }
    }
    if (worldCupQualifiersState?.tournamentYear !== year && wcqPlayoffState) {
      for (const path of wcqPlayoffState.paths) {
        if (path.qualifier) {
          const rep = nationalTeams2.find((t) => t.name === path.qualifier)?.reputation ?? 10;
          addTeam(path.qualifier, "UEFA", rep);
        }
      }
    }
    const uefaHostCount = WorldCupService.getHosts(year).filter((h) => getWorldCupHostConfederationForName(h) === "UEFA" && !usedNames.has(h)).length;
    const uefaCount = teams.filter((t) => t.confederation === "UEFA").length + uefaHostCount;
    if (uefaCount < 16) {
      const euFallback = NATIONAL_TEAMS_EUROPE.filter((t) => !usedNames.has(t.name)).sort((a, b) => b.reputation - a.reputation).slice(0, 16 - uefaCount);
      euFallback.forEach((t) => addTeam(t.name, "UEFA", t.reputation));
    }
    const hosts = WorldCupService.getHosts(year);
    for (const h of hosts) {
      const conf = getWorldCupHostConfederationForName(h);
      const ntHost = nationalTeams2.find((t) => t.name === h);
      addTeam(h, conf, ntHost?.reputation ?? 12, true);
    }
    const cafNeeded = 9 - hosts.filter((h) => getWorldCupHostConfederationForName(h) === "CAF").length;
    const cafPicks = qualifiedPick(NATIONAL_TEAMS_AFRICA, Math.max(0, cafNeeded), rng, usedNames, (t) => t.name, { minReputation: 7, shortlistSize: 18 });
    cafPicks.forEach((t) => addTeam(t.name, "CAF", t.reputation));
    const afcNeeded = 8 - hosts.filter((h) => getWorldCupHostConfederationForName(h) === "AFC").length;
    const afcPicks = qualifiedPick(NATIONAL_TEAMS_AFC, Math.max(0, afcNeeded), rng, usedNames, (t) => t.name, { minReputation: 8, shortlistSize: 16 });
    afcPicks.forEach((t) => addTeam(t.name, "AFC", t.reputation));
    const conmebolNeeded = 6 - hosts.filter((h) => getWorldCupHostConfederationForName(h) === "CONMEBOL").length;
    const saPicks = qualifiedPick(NATIONAL_TEAMS_CONMEBOL, Math.max(0, conmebolNeeded), rng, usedNames, (t) => t.name, { minReputation: 9, shortlistSize: 10 });
    saPicks.forEach((t) => addTeam(t.name, "CONMEBOL", t.reputation));
    const concacacNeeded = 6 - hosts.filter((h) => getWorldCupHostConfederationForName(h) === "CONCACAF").length;
    if (concacacNeeded > 0) {
      const concPicks = qualifiedPick(NATIONAL_TEAMS_CONCACAF, concacacNeeded, rng, usedNames, (t) => t.name, { minReputation: 8, shortlistSize: 10 });
      concPicks.forEach((t) => addTeam(t.name, "CONCACAF", t.reputation));
    }
    const ofcNeeded = 1 - hosts.filter((h) => getWorldCupHostConfederationForName(h) === "OFC").length;
    const ofcPicks = qualifiedPick(NATIONAL_TEAMS_OFC, Math.max(0, ofcNeeded), rng, usedNames, (t) => t.name, { minReputation: 8, shortlistSize: 3 });
    ofcPicks.forEach((t) => addTeam(t.name, "OFC", t.reputation));
    const allConfedTeams = [
      ...NATIONAL_TEAMS_AFRICA,
      ...NATIONAL_TEAMS_AFC,
      ...NATIONAL_TEAMS_CONMEBOL,
      ...NATIONAL_TEAMS_CONCACAF,
      ...NATIONAL_TEAMS_OFC
    ];
    const interContPicks = allConfedTeams.filter((t) => !usedNames.has(t.name)).sort((a, b) => b.reputation - a.reputation).slice(0, Math.max(0, 48 - teams.length));
    interContPicks.forEach((t) => addTeam(t.name, "INTERCONT", t.reputation));
    return teams.slice(0, 48);
  },
  /**
   * Losowanie 12 grup po 4 drużyny z podziałem na koszyki (pot-seeding).
   * Koszyk 1: 12 najlepszych drużyn UEFA + hosty
   * Koszyk 2: następne 12 wg reputacji
   * Koszyk 3: następne 12
   * Koszyk 4: ostatnie 12
   */
  drawGroups(teams, seed, year) {
    const rng = new Rng6(seed ^ strHash2(`WC_DRAW_${year}`));
    const LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    const sorted = [...teams].sort((a, b) => {
      if (a.isHost !== b.isHost) return a.isHost ? -1 : 1;
      return b.reputation - a.reputation;
    });
    const pot1 = sorted.slice(0, 12);
    const pot2 = rng.shuffle(sorted.slice(12, 24));
    const pot3 = rng.shuffle(sorted.slice(24, 36));
    const pot4 = rng.shuffle(sorted.slice(36, 48));
    const groupTeams = LABELS.map(() => []);
    pot1.forEach((t, i) => groupTeams[i].push(t.name));
    pot2.forEach((t, i) => groupTeams[i].push(t.name));
    pot3.forEach((t, i) => groupTeams[i].push(t.name));
    pot4.forEach((t, i) => groupTeams[i].push(t.name));
    return LABELS.map((label, i) => ({
      label,
      teams: groupTeams[i],
      matches: []
    }));
  },
  /**
   * Symuluje mecze grupowe na dany dzień turnieju.
   * Zwraca zaktualizowane grupy ze wstawionymi wynikami.
   */
  simulateGroupDay(groups, teams, day, month, year, seed, nationalTeams2, players, coaches) {
    const schedule = getGroupDaySchedule(day, month);
    if (!schedule) return { groups, updatedPlayers: players };
    const getTeamRep = (name) => teams.find((t) => t.name === name)?.reputation ?? 8;
    const newGroups = groups.map((g) => ({ ...g, matches: [...g.matches] }));
    let updatedPlayers = players;
    const matchDate = new Date(year, month - 1, day);
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    for (const { groupLabel, round } of schedule) {
      const groupIdx = newGroups.findIndex((g) => g.label === groupLabel);
      if (groupIdx === -1) continue;
      const group = newGroups[groupIdx];
      const matchups = getGroupRoundMatchups(group.teams, round);
      for (const [homeIdx, awayIdx] of matchups) {
        const home = group.teams[homeIdx];
        const away = group.teams[awayIdx];
        const matchSeed = seed ^ strHash2(`WC_GROUP_${groupLabel}_R${round}_${home}_${away}`);
        if (nationalTeams2 && updatedPlayers && coaches) {
          const full = applyWorldCupTournamentVenue(
            simulateWCGroupMatch(home, away, matchDate, matchSeed, nationalTeams2, updatedPlayers, coaches),
            year,
            `GROUP_${groupLabel}_R${round}_${home}_${away}_${dateStr}`
          );
          updatedPlayers = full.updatedPlayers ?? updatedPlayers;
          if (full.matchHistoryEntry) MatchHistoryService.logMatch(full.matchHistoryEntry);
          group.matches.push({
            matchId: full.matchId,
            home,
            away,
            homeGoals: full.homeGoals,
            awayGoals: full.awayGoals,
            date: dateStr,
            goals: full.goals,
            cards: full.cards,
            venue: full.venue,
            attendance: full.attendance,
            weather: full.weather,
            refereeName: full.refereeName
          });
        } else {
          const rng = new Rng6(matchSeed);
          const result = simulateGroupMatchResult(getTeamRep(home), getTeamRep(away), rng);
          group.matches.push({ home, away, homeGoals: result.homeGoals, awayGoals: result.awayGoals, date: dateStr });
        }
      }
    }
    return { groups: newGroups, updatedPlayers };
  },
  /**
   * Buduje pusty bracket 1/16 finału na podstawie kwalifikantów z fazy grupowej.
   * Rozstawianie: zwycięzcy grup (1-12) + wicemistrzowie (13-24) + najlepsze 3. miejsca (25-32).
   * Parowanie: seed 1 vs seed 32, seed 2 vs seed 31, itd.
   */
  buildKnockoutBracket(groups, year) {
    const standings = groups.map((g) => computeGroupStandings(g));
    const winners = standings.map((s, i) => ({
      name: s[0]?.name ?? "?",
      group: groups[i].label,
      tier: 0,
      pts: s[0]?.pts ?? 0,
      gd: (s[0]?.GF ?? 0) - (s[0]?.GA ?? 0),
      gf: s[0]?.GF ?? 0
    }));
    const runnersUp = standings.map((s, i) => ({
      name: s[1]?.name ?? "?",
      group: groups[i].label,
      tier: 1,
      pts: s[1]?.pts ?? 0,
      gd: (s[1]?.GF ?? 0) - (s[1]?.GA ?? 0),
      gf: s[1]?.GF ?? 0
    }));
    const thirds = standings.map((s, i) => ({
      name: s[2]?.name ?? "?",
      group: groups[i].label,
      tier: 2,
      pts: s[2]?.pts ?? 0,
      gd: (s[2]?.GF ?? 0) - (s[2]?.GA ?? 0),
      gf: s[2]?.GF ?? 0
    })).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf).slice(0, 8);
    const seeded = [
      ...winners.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf),
      ...runnersUp.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf),
      ...thirds
    ];
    const R32_DATES = [
      ...Array(4).fill(`${year}-06-15`),
      ...Array(4).fill(`${year}-06-16`),
      ...Array(4).fill(`${year}-06-17`),
      ...Array(4).fill(`${year}-06-18`)
    ];
    const matches = [];
    for (let i = 0; i < 16; i++) {
      const high = seeded[i];
      const low = seeded[31 - i];
      matches.push({
        id: `R32_${String(i + 1).padStart(2, "0")}`,
        round: "R32",
        home: high?.name ?? null,
        away: low?.name ?? null,
        date: R32_DATES[i]
      });
    }
    return matches;
  },
  /**
   * Symuluje mecze pucharowe na dany dzień.
   * Dla gotowych meczów (home i away znane) oblicza wynik.
   * Kolejne rundy są uzupełniane po zakończeniu poprzedniej.
   */
  simulateKnockoutDay(wcState, teams, day, month, year, seed, nationalTeams2, players, coaches) {
    const matchDate = new Date(year, month - 1, day);
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const getTeamRep = (name) => name ? teams.find((t) => t.name === name)?.reputation ?? 8 : 8;
    let updatedPlayers = players;
    const newMatches = wcState.knockoutMatches.map((m) => {
      if (m.date !== dateStr || m.winner) return m;
      if (!m.home || !m.away) return m;
      const matchSeed = seed ^ strHash2(`WC_KO_${m.id}_${m.home}_${m.away}`);
      if (nationalTeams2 && updatedPlayers && coaches) {
        const full = applyWorldCupTournamentVenue(
          simulateSinglePlayoffMatch(m.home, m.away, "FIFA World Cup", matchDate, matchSeed, nationalTeams2, updatedPlayers, coaches, year),
          year,
          `KO_${m.id}_${m.home}_${m.away}_${dateStr}`
        );
        updatedPlayers = full.updatedPlayers ?? updatedPlayers;
        if (full.matchHistoryEntry) MatchHistoryService.logMatch(full.matchHistoryEntry);
        const wentToET = full.homeGoals === full.awayGoals;
        const wentToPenalties = full.penaltyWinner !== void 0;
        const winner = full.penaltyWinner ?? (wentToET ? (full.homeGoalsAET ?? 0) > (full.awayGoalsAET ?? 0) ? m.home : m.away : full.homeGoals > full.awayGoals ? m.home : m.away);
        return {
          ...m,
          matchId: full.matchHistoryEntry?.matchId,
          homeGoals: full.homeGoals,
          awayGoals: full.awayGoals,
          homeGoalsAET: full.homeGoalsAET,
          awayGoalsAET: full.awayGoalsAET,
          homePenalties: full.homePenaltyGoals,
          awayPenalties: full.awayPenaltyGoals,
          wentToET,
          wentToPenalties,
          winner,
          goals: full.goals,
          cards: full.cards,
          venue: full.venue,
          attendance: full.attendance,
          weather: full.weather,
          refereeName: full.refereeName
        };
      }
      const rng = new Rng6(matchSeed);
      const res = simulateKnockoutMatchResult(getTeamRep(m.home), getTeamRep(m.away), rng);
      return {
        ...m,
        homeGoals: res.homeGoals,
        awayGoals: res.awayGoals,
        homeGoalsAET: res.homeGoalsAET,
        awayGoalsAET: res.awayGoalsAET,
        homePenalties: res.homePenalties,
        awayPenalties: res.awayPenalties,
        wentToET: res.wentToET,
        wentToPenalties: res.wentToPenalties,
        winner: res.winner === "home" ? m.home : m.away
      };
    });
    return { matches: propagateWinners(newMatches, year), updatedPlayers };
  },
  /**
   * Symuluje cały turniej od razu (tryb Skip to Final).
   */
  simulateFullTournament(wcState, seed, nationalTeams2, players, coaches) {
    let state = { ...wcState };
    let updatedPlayers = players;
    let previousMatchDate = null;
    const recoverBeforeMatchDay = (day, month) => {
      const matchDate = new Date(state.year, month - 1, day);
      if (updatedPlayers && previousMatchDate) {
        const daysBetween = Math.max(1, Math.round((matchDate.getTime() - previousMatchDate.getTime()) / 864e5));
        updatedPlayers = RecoveryService.applyDailyRecovery(updatedPlayers, matchDate, "NORMAL" /* NORMAL */, daysBetween);
      }
      previousMatchDate = matchDate;
    };
    const groupDays = [
      [2, 6],
      [3, 6],
      [4, 6],
      [5, 6],
      [6, 6],
      [7, 6],
      [8, 6],
      [9, 6],
      [10, 6],
      [11, 6],
      [12, 6]
    ];
    for (const [day, month] of groupDays) {
      recoverBeforeMatchDay(day, month);
      const groupSimulation = WorldCupService.simulateGroupDay(state.groups, state.teams, day, month, state.year, seed, nationalTeams2, updatedPlayers, coaches);
      updatedPlayers = groupSimulation.updatedPlayers ?? updatedPlayers;
      state = {
        ...state,
        groups: groupSimulation.groups
      };
    }
    state.groupStageComplete = true;
    const knockoutMatches = WorldCupService.buildKnockoutBracket(state.groups, state.year);
    state = { ...state, knockoutMatches };
    const koDays = [
      [15, 6],
      [16, 6],
      [17, 6],
      [18, 6],
      [19, 6],
      [20, 6],
      [21, 6],
      [22, 6],
      [23, 6],
      [24, 6],
      [26, 6],
      [27, 6],
      [29, 6],
      [30, 6]
    ];
    for (const [day, month] of koDays) {
      recoverBeforeMatchDay(day, month);
      const knockoutSimulation = WorldCupService.simulateKnockoutDay(state, state.teams, day, month, state.year, seed, nationalTeams2, updatedPlayers, coaches);
      updatedPlayers = knockoutSimulation.updatedPlayers ?? updatedPlayers;
      state = {
        ...state,
        knockoutMatches: knockoutSimulation.matches
      };
    }
    state.knockoutComplete = true;
    const finalMatch = state.knockoutMatches.find((m) => m.round === "FINAL");
    const thirdMatch = state.knockoutMatches.find((m) => m.round === "THIRD");
    state.champion = finalMatch?.winner ?? void 0;
    state.runnerUp = finalMatch?.winner === finalMatch?.home ? finalMatch?.away : finalMatch?.home;
    state.thirdPlace = thirdMatch?.winner ?? void 0;
    state.fourthPlace = thirdMatch?.winner === thirdMatch?.home ? thirdMatch?.away : thirdMatch?.home;
    return { state, updatedPlayers };
  },
  /**
   * Tworzy pusty WCState dla danego roku i zebranych drużyn.
   */
  createInitialState(teams, groups, year) {
    return {
      year,
      teams,
      groups,
      knockoutMatches: [],
      playerEffects: [],
      groupStageComplete: false,
      knockoutComplete: false
    };
  },
  /**
   * Oblicza efekty MŚ na zawodników drużyny gracza.
   * Kontuzje, morale mistrza, zmęczenie po wielu meczach.
   */
  computePlayerEffects(wcState, players, seed) {
    const rng = new Rng6(seed ^ strHash2(`WC_EFFECTS_${wcState.year}`));
    const effects = [];
    if (!wcState.knockoutComplete) return effects;
    const champion = wcState.champion;
    for (const player of players) {
      const ntName = player.nationality;
      if (!ntName) continue;
      const groupMatchCount = wcState.groups.flatMap((g) => g.matches).filter((m) => m.home === ntName || m.away === ntName).length;
      const koMatchCount = wcState.knockoutMatches.filter((m) => m.winner && (m.home === ntName || m.away === ntName)).length;
      const totalMatches = groupMatchCount + koMatchCount;
      if (totalMatches === 0) continue;
      if (totalMatches >= 6) {
        effects.push({ playerId: player.id, type: "FATIGUE", value: 10 });
      } else if (totalMatches >= 4) {
        effects.push({ playerId: player.id, type: "FATIGUE", value: 5 });
      }
      if (rng.next() < 0.03) {
        effects.push({ playerId: player.id, type: "INJURY", value: rng.int(5, 21) });
      }
      if (champion && ntName === champion) {
        effects.push({ playerId: player.id, type: "MORALE_BOOST", value: 15 });
      }
    }
    return effects;
  },
  /**
   * Zbiera 42 znane drużyny na losowanie MŚ.
   * Pozostałe 6 miejsc to 4 placeholdery baraży UEFA i 2 placeholdery play-off FIFA.
   * Wywoływane 5 grudnia roku poprzedzającego MŚ.
   */
  assembleTeamsForDraw(nationalTeams2, seasonNumber, year, seed, worldCupQualifiersState) {
    const rng = new Rng6(seed ^ strHash2(`WC_DRAW_ASSEMBLE_${year}`));
    const usedNames = /* @__PURE__ */ new Set();
    const teams = [];
    const getNTColors = (name) => nationalTeams2.find((t) => t.name === name)?.colorsHex ?? ["#CCCCCC", "#FFFFFF", "#CCCCCC"];
    const addTeam = (name, conf, rep, isHost = false, isPlayoffSlot = false) => {
      if (usedNames.has(name) || name === "?") return;
      usedNames.add(name);
      teams.push({ name, confederation: conf, reputation: rep, colors: getNTColors(name), isHost, isPlayoffSlot });
    };
    if (worldCupQualifiersState?.tournamentYear === year) {
      const hostSet = new Set(WorldCupService.getHosts(year));
      for (const winner of worldCupQualifiersState.directQualifiers) {
        if (hostSet.has(winner)) continue;
        const rep = nationalTeams2.find((t) => t.name === winner)?.reputation ?? 10;
        addTeam(winner, "UEFA", rep);
      }
    } else {
      const summary = WCQPlayoffService.getWCQGroupSummary(nationalTeams2, seasonNumber);
      for (const winner of summary.directQualifiers) {
        const rep = nationalTeams2.find((t) => t.name === winner)?.reputation ?? 10;
        addTeam(winner, "UEFA", rep);
      }
    }
    const uefaPlayoffPathLabels = worldCupQualifiersState?.tournamentYear === year && worldCupQualifiersState.playoffPaths.length > 0 ? worldCupQualifiersState.playoffPaths.map((path) => path.label) : ["A", "B", "C", "D"];
    for (const path of uefaPlayoffPathLabels) {
      const tbdName = `TBD_PATH_${path}`;
      usedNames.add(tbdName);
      teams.push({ name: tbdName, confederation: "UEFA", reputation: 0, colors: ["#475569", "#64748b", "#475569"], isHost: false, isPlayoffSlot: true });
    }
    for (const path of ["1", "2"]) {
      const tbdName = `TBD_FIFA_PO_${path}`;
      usedNames.add(tbdName);
      teams.push({ name: tbdName, confederation: "INTERCONT", reputation: 0, colors: ["#475569", "#64748b", "#475569"], isHost: false, isPlayoffSlot: true });
    }
    const hosts = WorldCupService.getHosts(year);
    for (const h of hosts) {
      const conf = getWorldCupHostConfederationForName(h);
      const ntHost = nationalTeams2.find((t) => t.name === h);
      addTeam(h, conf, ntHost?.reputation ?? 12, true);
    }
    const cafNeeded = 9 - hosts.filter((h) => getWorldCupHostConfederationForName(h) === "CAF").length;
    const cafPicks = qualifiedPick(NATIONAL_TEAMS_AFRICA, Math.max(0, cafNeeded), rng, usedNames, (t) => t.name, { minReputation: 7, shortlistSize: 18 });
    cafPicks.forEach((t) => addTeam(t.name, "CAF", t.reputation));
    const afcNeeded = 8 - hosts.filter((h) => getWorldCupHostConfederationForName(h) === "AFC").length;
    const afcPicks = qualifiedPick(NATIONAL_TEAMS_AFC, Math.max(0, afcNeeded), rng, usedNames, (t) => t.name, { minReputation: 8, shortlistSize: 16 });
    afcPicks.forEach((t) => addTeam(t.name, "AFC", t.reputation));
    const conmebolNeeded = 6 - hosts.filter((h) => getWorldCupHostConfederationForName(h) === "CONMEBOL").length;
    const saPicks = qualifiedPick(NATIONAL_TEAMS_CONMEBOL, Math.max(0, conmebolNeeded), rng, usedNames, (t) => t.name, { minReputation: 9, shortlistSize: 10 });
    saPicks.forEach((t) => addTeam(t.name, "CONMEBOL", t.reputation));
    const concacacNeeded = 6 - hosts.filter((h) => getWorldCupHostConfederationForName(h) === "CONCACAF").length;
    if (concacacNeeded > 0) {
      const concPicks = qualifiedPick(NATIONAL_TEAMS_CONCACAF, concacacNeeded, rng, usedNames, (t) => t.name, { minReputation: 8, shortlistSize: 10 });
      concPicks.forEach((t) => addTeam(t.name, "CONCACAF", t.reputation));
    }
    const ofcNeeded = 1 - hosts.filter((h) => getWorldCupHostConfederationForName(h) === "OFC").length;
    const ofcPicks = qualifiedPick(NATIONAL_TEAMS_OFC, Math.max(0, ofcNeeded), rng, usedNames, (t) => t.name, { minReputation: 8, shortlistSize: 3 });
    ofcPicks.forEach((t) => addTeam(t.name, "OFC", t.reputation));
    return teams;
  },
  /**
   * Losowanie grup z zasadami FIFA:
   *  Pot 1: hosty pre-przypisane do A/B/D + 9 najlepszych do wolnych grup
   *  Pot 2-3: kolejne 12 wg reputacji, randomowo do grup
   *  Pot 4: ostatnie drużyny + 6 TBD (4 UEFA + 2 play-off FIFA)
   * Ograniczenia: max 1 drużyna per konfederacja (poza UEFA), max 2 UEFA per grupa.
   * Zwraca grupy z polem pots do wyświetlenia w ceremonii.
   */
  drawGroupsWithFIFARules(teams, seed, year) {
    const rng = new Rng6(seed ^ strHash2(`WC_FIFADRAW_${year}`));
    const LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    const groupTeams = LABELS.map(() => []);
    const groupConfs = LABELS.map(() => []);
    const countUEFA = (gIdx) => groupConfs[gIdx].filter((c) => c === "UEFA").length;
    const placeInGroup = (team, gIdx) => {
      groupTeams[gIdx].push(team.name);
      groupConfs[gIdx].push(team.confederation);
    };
    const hostsOrdered = teams.filter((t) => t.isHost);
    hostsOrdered.forEach((h, i) => {
      const hostGroup = year === 2026 ? WC_HOST_GROUPS_2026[h.name] : i;
      if (hostGroup !== void 0 && hostGroup < LABELS.length) placeInGroup(h, hostGroup);
    });
    const nonHostPot1Slots = Math.max(0, LABELS.length - Math.min(hostsOrdered.length, LABELS.length));
    const nonHostPot1 = [...teams].filter((t) => !t.isHost && !t.isPlayoffSlot).sort((a, b) => b.reputation - a.reputation).slice(0, nonHostPot1Slots);
    const pot1Shuffled = rng.shuffle(nonHostPot1);
    const freePot1Groups = LABELS.map((_, i) => i).filter((i) => groupTeams[i].length === 0);
    pot1Shuffled.forEach((t, i) => placeInGroup(t, freePot1Groups[i]));
    const usedInPot1Names = /* @__PURE__ */ new Set([...hostsOrdered.map((t) => t.name), ...nonHostPot1.map((t) => t.name)]);
    const remaining = teams.filter((t) => !usedInPot1Names.has(t.name) && !t.isPlayoffSlot).sort((a, b) => b.reputation - a.reputation);
    const pot2 = rng.shuffle(remaining.slice(0, 12));
    const pot3 = rng.shuffle(remaining.slice(12, 24));
    const pot4Real = rng.shuffle(remaining.slice(24));
    const tbdTeams = [...teams.filter((t) => t.isPlayoffSlot)].sort((a, b) => a.name.localeCompare(b.name));
    const pot4 = rng.shuffle([...pot4Real, ...tbdTeams]);
    const pots = [
      [...hostsOrdered, ...nonHostPot1],
      pot2,
      pot3,
      pot4
    ];
    const canPlaceInGroup = (team, gIdx) => {
      if (groupTeams[gIdx].length >= 4) return false;
      if (team.confederation === "UEFA" && countUEFA(gIdx) >= 2) return false;
      if (team.confederation !== "UEFA" && groupConfs[gIdx].includes(team.confederation)) return false;
      if (team.confederation !== "UEFA" && countUEFA(gIdx) === 0 && groupTeams[gIdx].length === 3) return false;
      return true;
    };
    const placePotTeams = (potTeams) => {
      const placed = [];
      const usedGroups = /* @__PURE__ */ new Set();
      const tryPlace = (idx) => {
        if (idx >= potTeams.length) return true;
        const team = potTeams[idx];
        const groupOrder = rng.shuffle([...Array(12).keys()]);
        for (const gIdx of groupOrder) {
          if (usedGroups.has(gIdx)) continue;
          if (!canPlaceInGroup(team, gIdx)) continue;
          placeInGroup(team, gIdx);
          usedGroups.add(gIdx);
          placed.push({ groupIdx: gIdx });
          if (tryPlace(idx + 1)) return true;
          placed.pop();
          usedGroups.delete(gIdx);
          groupTeams[gIdx].pop();
          groupConfs[gIdx].pop();
        }
        return false;
      };
      const success = tryPlace(0);
      if (success) return true;
      while (placed.length > 0) {
        const last = placed.pop();
        usedGroups.delete(last.groupIdx);
        groupTeams[last.groupIdx].pop();
        groupConfs[last.groupIdx].pop();
      }
      return false;
    };
    const findValidGroup = (team, shuffledOrder) => {
      for (const gIdx of shuffledOrder) {
        if (canPlaceInGroup(team, gIdx)) return gIdx;
      }
      return shuffledOrder.find((g) => groupTeams[g].length < 4) ?? 0;
    };
    if (!placePotTeams(pot2)) {
      const groupOrder2 = rng.shuffle([...Array(12).keys()]);
      pot2.forEach((team) => placeInGroup(team, findValidGroup(team, groupOrder2)));
    }
    if (!placePotTeams(pot3)) {
      const groupOrder3 = rng.shuffle([...Array(12).keys()]);
      pot3.forEach((team) => placeInGroup(team, findValidGroup(team, groupOrder3)));
    }
    if (!placePotTeams(pot4)) {
      const groupOrder4 = rng.shuffle([...Array(12).keys()]);
      pot4.forEach((team) => placeInGroup(team, findValidGroup(team, groupOrder4)));
    }
    const groups = LABELS.map((label, i) => ({
      label,
      teams: groupTeams[i],
      matches: []
    }));
    return { groups, pots };
  },
  /**
   * Wypełnia placeholdery zwycięzcami baraży UEFA i play-off FIFA.
   * Wywoływane 21 marca roku MŚ po zakończeniu finałów baraży.
   */
  fillPlayoffSlots(wcState, winners, nationalTeams2) {
    const getNTColors = (name) => nationalTeams2.find((t) => t.name === name)?.colorsHex ?? ["#CCCCCC", "#FFFFFF", "#CCCCCC"];
    const newTeams = [...wcState.teams];
    const newGroups = wcState.groups.map((g) => ({ ...g, teams: [...g.teams] }));
    const uefaSlots = newTeams.filter((t) => t.isPlayoffSlot && t.name.startsWith("TBD_PATH_"));
    uefaSlots.forEach((tbd, i) => {
      const winner = winners[i];
      if (!winner) return;
      const rep = nationalTeams2.find((t) => t.name === winner)?.reputation ?? 10;
      const idx = newTeams.findIndex((t) => t.name === tbd.name);
      if (idx !== -1) {
        newTeams[idx] = { name: winner, confederation: "UEFA", reputation: rep, colors: getNTColors(winner), isHost: false, isPlayoffSlot: false };
      }
      for (const g of newGroups) {
        const ti = g.teams.indexOf(tbd.name);
        if (ti !== -1) g.teams[ti] = winner;
      }
    });
    const usedNames = new Set(newTeams.filter((t) => !t.isPlayoffSlot).map((t) => t.name));
    const intercontinentalCandidates = [
      ...NATIONAL_TEAMS_AFRICA.map((t) => ({ ...t, confederation: "CAF" })),
      ...NATIONAL_TEAMS_AFC.map((t) => ({ ...t, confederation: "AFC" })),
      ...NATIONAL_TEAMS_CONMEBOL.map((t) => ({ ...t, confederation: "CONMEBOL" })),
      ...NATIONAL_TEAMS_CONCACAF.map((t) => ({ ...t, confederation: "CONCACAF" })),
      ...NATIONAL_TEAMS_OFC.map((t) => ({ ...t, confederation: "OFC" }))
    ].filter((t) => !usedNames.has(t.name)).sort((a, b) => b.reputation - a.reputation);
    const fifaSlots = newTeams.filter((t) => t.isPlayoffSlot && t.name.startsWith("TBD_FIFA_PO_"));
    fifaSlots.forEach((tbd) => {
      const group = newGroups.find((g) => g.teams.includes(tbd.name));
      const groupConfs = group ? group.teams.map((name) => newTeams.find((t) => t.name === name)?.confederation).filter((conf) => !!conf && conf !== "INTERCONT") : [];
      const winner = intercontinentalCandidates.find((t) => !usedNames.has(t.name) && !groupConfs.includes(t.confederation));
      if (!winner) return;
      usedNames.add(winner.name);
      const idx = newTeams.findIndex((t) => t.name === tbd.name);
      if (idx !== -1) {
        newTeams[idx] = { name: winner.name, confederation: winner.confederation, reputation: winner.reputation, colors: getNTColors(winner.name), isHost: false, isPlayoffSlot: false };
      }
      if (group) {
        const ti = group.teams.indexOf(tbd.name);
        if (ti !== -1) group.teams[ti] = winner.name;
      }
    });
    return { ...wcState, teams: newTeams, groups: newGroups, playoffSlotsResolved: true };
  }
};
function getGroupDaySchedule(day, month) {
  if (month !== 6) return null;
  switch (day) {
    case 2:
      return [{ groupLabel: "A", round: 1 }, { groupLabel: "B", round: 1 }, { groupLabel: "C", round: 1 }];
    case 3:
      return [{ groupLabel: "D", round: 1 }, { groupLabel: "E", round: 1 }, { groupLabel: "F", round: 1 }];
    case 4:
      return [{ groupLabel: "G", round: 1 }, { groupLabel: "H", round: 1 }, { groupLabel: "I", round: 1 }];
    case 5:
      return [
        { groupLabel: "J", round: 1 },
        { groupLabel: "K", round: 1 },
        { groupLabel: "L", round: 1 },
        { groupLabel: "A", round: 2 },
        { groupLabel: "B", round: 2 },
        { groupLabel: "C", round: 2 }
      ];
    case 6:
      return [{ groupLabel: "D", round: 2 }, { groupLabel: "E", round: 2 }, { groupLabel: "F", round: 2 }];
    case 7:
      return [{ groupLabel: "G", round: 2 }, { groupLabel: "H", round: 2 }, { groupLabel: "I", round: 2 }];
    case 8:
      return [{ groupLabel: "J", round: 2 }, { groupLabel: "K", round: 2 }, { groupLabel: "L", round: 2 }];
    case 9:
      return [{ groupLabel: "A", round: 3 }, { groupLabel: "B", round: 3 }, { groupLabel: "C", round: 3 }];
    case 10:
      return [{ groupLabel: "D", round: 3 }, { groupLabel: "E", round: 3 }, { groupLabel: "F", round: 3 }];
    case 11:
      return [{ groupLabel: "G", round: 3 }, { groupLabel: "H", round: 3 }, { groupLabel: "I", round: 3 }];
    case 12:
      return [{ groupLabel: "J", round: 3 }, { groupLabel: "K", round: 3 }, { groupLabel: "L", round: 3 }];
    default:
      return null;
  }
}
function getGroupRoundMatchups(teams, round) {
  if (teams.length < 4) return [];
  switch (round) {
    case 1:
      return [[0, 1], [2, 3]];
    case 2:
      return [[0, 2], [1, 3]];
    case 3:
      return [[0, 3], [1, 2]];
    default:
      return [];
  }
}
var R16_DATES = [
  `{Y}-06-19`,
  `{Y}-06-19`,
  `{Y}-06-20`,
  `{Y}-06-20`,
  `{Y}-06-21`,
  `{Y}-06-21`,
  `{Y}-06-22`,
  `{Y}-06-22`
];
var QF_DATES = [
  `{Y}-06-23`,
  `{Y}-06-23`,
  `{Y}-06-24`,
  `{Y}-06-24`
];
function propagateWinners(matches, year) {
  const byId = new Map(matches.map((m) => [m.id, m]));
  let updated = [...matches];
  const yearStr = String(year);
  const r32Complete = updated.filter((m) => m.round === "R32" && m.winner);
  if (r32Complete.length === 16 && !updated.some((m) => m.round === "R16")) {
    for (let i = 0; i < 8; i++) {
      const m1 = updated.find((m) => m.id === `R32_${String(i * 2 + 1).padStart(2, "0")}`);
      const m2 = updated.find((m) => m.id === `R32_${String(i * 2 + 2).padStart(2, "0")}`);
      if (!m1?.winner || !m2?.winner) continue;
      updated.push({
        id: `R16_${String(i + 1).padStart(2, "0")}`,
        round: "R16",
        home: m1.winner,
        away: m2.winner,
        date: R16_DATES[i].replace("{Y}", yearStr)
      });
    }
  }
  const r16Complete = updated.filter((m) => m.round === "R16" && m.winner);
  if (r16Complete.length === 8 && !updated.some((m) => m.round === "QF")) {
    for (let i = 0; i < 4; i++) {
      const m1 = r16Complete.find((m) => m.id === `R16_${String(i * 2 + 1).padStart(2, "0")}`);
      const m2 = r16Complete.find((m) => m.id === `R16_${String(i * 2 + 2).padStart(2, "0")}`);
      if (!m1?.winner || !m2?.winner) continue;
      updated.push({
        id: `QF_${i + 1}`,
        round: "QF",
        home: m1.winner,
        away: m2.winner,
        date: QF_DATES[i].replace("{Y}", yearStr)
      });
    }
  }
  const qfComplete = updated.filter((m) => m.round === "QF" && m.winner);
  if (qfComplete.length === 4 && !updated.some((m) => m.round === "SF")) {
    const qf1 = qfComplete.find((m) => m.id === "QF_1");
    const qf2 = qfComplete.find((m) => m.id === "QF_2");
    const qf3 = qfComplete.find((m) => m.id === "QF_3");
    const qf4 = qfComplete.find((m) => m.id === "QF_4");
    if (qf1?.winner && qf2?.winner) {
      updated.push({ id: "SF_1", round: "SF", home: qf1.winner, away: qf2.winner, date: `${year}-06-26` });
    }
    if (qf3?.winner && qf4?.winner) {
      updated.push({ id: "SF_2", round: "SF", home: qf3.winner, away: qf4.winner, date: `${year}-06-27` });
    }
  }
  const sfComplete = updated.filter((m) => m.round === "SF" && m.winner);
  if (sfComplete.length === 2 && !updated.some((m) => m.round === "FINAL")) {
    const sf1 = sfComplete.find((m) => m.id === "SF_1");
    const sf2 = sfComplete.find((m) => m.id === "SF_2");
    const loser1 = sf1 ? sf1.winner === sf1.home ? sf1.away : sf1.home : null;
    const loser2 = sf2 ? sf2.winner === sf2.home ? sf2.away : sf2.home : null;
    if (loser1 && loser2) {
      updated.push({ id: "THIRD_1", round: "THIRD", home: loser1, away: loser2, date: `${year}-06-29` });
    }
    if (sf1?.winner && sf2?.winner) {
      updated.push({ id: "FINAL_1", round: "FINAL", home: sf1.winner, away: sf2.winner, date: `${year}-06-30` });
    }
  }
  return updated;
}

// services/WorldCupHistoryBackfillService.ts
var HISTORICAL_WORLD_CUP_CHAMPIONS = {
  2026: "Hiszpania"
};
function applyHistoricalWorldCupOutcome(state) {
  const historicalChampion = HISTORICAL_WORLD_CUP_CHAMPIONS[state.year];
  const simulatedChampion = state.champion;
  if (!historicalChampion || !simulatedChampion || historicalChampion === simulatedChampion) return state;
  const replaceHistoricalChampionInPlacement = (team) => team === historicalChampion ? simulatedChampion : team;
  return {
    ...state,
    champion: historicalChampion,
    runnerUp: replaceHistoricalChampionInPlacement(state.runnerUp),
    thirdPlace: replaceHistoricalChampionInPlacement(state.thirdPlace),
    fourthPlace: replaceHistoricalChampionInPlacement(state.fourthPlace)
  };
}
function buildWorldCupMessage(state, careerStartDate) {
  const champion = state.champion ?? "nieznany zwyci\u0119zca";
  const thirdPlace = state.thirdPlace ? ` Trzecie miejsce zajmuje ${state.thirdPlace}.` : "";
  return {
    id: `world-cup-backfill-${state.year}`,
    sender: "FIFA",
    role: "Organizator rozgrywek",
    subject: `Uzupe\u0142niono histori\u0119 M\u015A ${state.year}: ${champion}`,
    body: `Poniewa\u017C kariera rozpoczyna si\u0119 po zako\u0144czeniu turnieju, Mistrzostwa \u015Awiata ${state.year} zosta\u0142y zasymulowane w tle. Mistrzem \u015Bwiata zostaje ${champion}.${thirdPlace} Szczeg\xF3\u0142y turnieju s\u0105 dost\u0119pne w widoku historii M\u015A.`,
    date: careerStartDate,
    isRead: false,
    type: "SYSTEM" /* SYSTEM */,
    priority: 2
  };
}
function createSeededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = value * 1664525 + 1013904223 >>> 0;
    return value / 4294967296;
  };
}
function pickWeightedEuropeanQualifiers(nationalTeams2, seed, count) {
  const random = createSeededRandom(seed);
  const candidates = nationalTeams2.filter((team) => team.continent === "Europe").map((team) => ({
    team,
    score: team.reputation + random() * 8
  })).sort((a, b) => b.score - a.score);
  return candidates.slice(0, count).map((candidate) => candidate.team);
}
function applyRandomizedUefaQualifiers(teams, nationalTeams2, seed) {
  const uefaSlots = teams.map((team, index) => ({ team, index })).filter((entry) => entry.team.confederation === "UEFA").slice(0, 16);
  const qualifiers = pickWeightedEuropeanQualifiers(nationalTeams2, seed, uefaSlots.length);
  const nextTeams = [...teams];
  uefaSlots.forEach((slot, slotIndex2) => {
    const qualifier = qualifiers[slotIndex2];
    if (!qualifier) return;
    nextTeams[slot.index] = {
      ...slot.team,
      name: qualifier.name,
      reputation: qualifier.reputation,
      colors: qualifier.colorsHex,
      isHost: false,
      isPlayoffSlot: false
    };
  });
  return nextTeams;
}
var WorldCupHistoryBackfillService = {
  simulateSkippedWorldCups(careerStartYear, nationalTeams2, seed) {
    const careerStartDate = new Date(careerStartYear, 6, 1);
    const messages = [];
    const worldCupStates = [];
    let latestWorldCupState = null;
    for (let year = 2026; year <= careerStartYear; year += 4) {
      if (!WorldCupService.isWorldCupYear(year)) continue;
      const tournamentEndDate = new Date(year, 5, 30);
      if (careerStartDate <= tournamentEndDate) continue;
      const wcSeed = seed ^ year * 7919;
      const baseTeams = WorldCupService.assembleTeams(nationalTeams2, null, 1, year, wcSeed);
      const teams = applyRandomizedUefaQualifiers(baseTeams, nationalTeams2, wcSeed ^ 5370362);
      const groups = WorldCupService.drawGroups(teams, wcSeed, year);
      const initialState = WorldCupService.createInitialState(teams, groups, year);
      const simulation = WorldCupService.simulateFullTournament(initialState, wcSeed);
      latestWorldCupState = applyHistoricalWorldCupOutcome({
        ...simulation.state,
        drawComplete: true,
        playoffSlotsResolved: true,
        groupStageComplete: true,
        knockoutComplete: true
      });
      worldCupStates.push(latestWorldCupState);
      messages.push(buildWorldCupMessage(latestWorldCupState, careerStartDate));
    }
    return { latestWorldCupState, worldCupStates, messages };
  }
};

// tests/WorldCupHistoryBackfillTests.ts
var nationalTeams = NationalTeamService.initializeNationalTeams();
var beforeTournament = WorldCupHistoryBackfillService.simulateSkippedWorldCups(2025, nationalTeams, 12345);
import_node_assert.strict.equal(beforeTournament.worldCupStates.length, 0);
import_node_assert.strict.equal(beforeTournament.latestWorldCupState, null);
var season2026Start = WorldCupHistoryBackfillService.simulateSkippedWorldCups(2026, nationalTeams, 12345);
import_node_assert.strict.equal(season2026Start.worldCupStates.length, 1);
import_node_assert.strict.equal(season2026Start.latestWorldCupState?.year, 2026);
import_node_assert.strict.equal(season2026Start.latestWorldCupState?.champion, "Hiszpania");
import_node_assert.strict.equal(season2026Start.worldCupStates[0]?.champion, "Hiszpania");
import_node_assert.strict.match(season2026Start.messages[0]?.subject ?? "", /Hiszpania/);
import_node_assert.strict.match(season2026Start.messages[0]?.body ?? "", /Hiszpania/);
var finalPlacements = [
  season2026Start.latestWorldCupState?.champion,
  season2026Start.latestWorldCupState?.runnerUp,
  season2026Start.latestWorldCupState?.thirdPlace,
  season2026Start.latestWorldCupState?.fourthPlace
].filter(Boolean);
import_node_assert.strict.equal(new Set(finalPlacements).size, finalPlacements.length);
console.log("World Cup history backfill tests passed.");
