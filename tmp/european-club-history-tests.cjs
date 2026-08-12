globalThis.localStorage=globalThis.localStorage||{getItem:()=>null,setItem:()=>{},removeItem:()=>{}};

// tests/EuropeanClubHistoryTests.ts
var import_node_assert = require("node:assert");

// data/championship_history.ts
var STORAGE_KEY = "fm_championship_history";
var buildSeasonHistory = (competition, results) => results.map(([season, winner, runnerUp]) => ({
  season,
  competition,
  winner,
  runnerUp,
  year: Number(season.split("/")[1])
}));
var buildTournamentHistory = (competition, results) => results.map(([year, winner, runnerUp, thirdPlace, fourthPlace]) => ({
  season: String(year),
  competition,
  winner,
  runnerUp,
  thirdPlace,
  fourthPlace,
  year
}));
var HISTORICAL_CHAMPIONSHIP_ARCHIVE = [
  ...buildSeasonHistory("EKSTRAKLASA", [
    ["1999/2000", "Polonia Warszawa", "Wis\u0142a Krak\xF3w"],
    ["2000/2001", "Wis\u0142a Krak\xF3w", "Pogo\u0144 Szczecin"],
    ["2001/2002", "Legia Warszawa", "Wis\u0142a Krak\xF3w"],
    ["2002/2003", "Wis\u0142a Krak\xF3w", "Dyskobolia Grodzisk Wielkopolski"],
    ["2003/2004", "Wis\u0142a Krak\xF3w", "Legia Warszawa"],
    ["2004/2005", "Wis\u0142a Krak\xF3w", "Dyskobolia Grodzisk Wielkopolski"],
    ["2005/2006", "Legia Warszawa", "Wis\u0142a Krak\xF3w"],
    ["2006/2007", "Zag\u0142\u0119bie Lubin", "GKS Be\u0142chat\xF3w"],
    ["2007/2008", "Wis\u0142a Krak\xF3w", "Legia Warszawa"],
    ["2008/2009", "Wis\u0142a Krak\xF3w", "Legia Warszawa"],
    ["2009/2010", "Lech Pozna\u0144", "Wis\u0142a Krak\xF3w"],
    ["2010/2011", "Wis\u0142a Krak\xF3w", "\u015Al\u0105sk Wroc\u0142aw"],
    ["2011/2012", "\u015Al\u0105sk Wroc\u0142aw", "Ruch Chorz\xF3w"],
    ["2012/2013", "Legia Warszawa", "Lech Pozna\u0144"],
    ["2013/2014", "Legia Warszawa", "Lech Pozna\u0144"],
    ["2014/2015", "Lech Pozna\u0144", "Legia Warszawa"],
    ["2015/2016", "Legia Warszawa", "Piast Gliwice"],
    ["2016/2017", "Legia Warszawa", "Jagiellonia Bia\u0142ystok"],
    ["2017/2018", "Legia Warszawa", "Jagiellonia Bia\u0142ystok"],
    ["2018/2019", "Piast Gliwice", "Legia Warszawa"],
    ["2019/2020", "Legia Warszawa", "Lech Pozna\u0144"],
    ["2020/2021", "Legia Warszawa", "Rak\xF3w Cz\u0119stochowa"],
    ["2021/2022", "Lech Pozna\u0144", "Rak\xF3w Cz\u0119stochowa"],
    ["2022/2023", "Rak\xF3w Cz\u0119stochowa", "Legia Warszawa"],
    ["2023/2024", "Jagiellonia Bia\u0142ystok", "\u015Al\u0105sk Wroc\u0142aw"],
    ["2024/2025", "Lech Pozna\u0144", "Rak\xF3w Cz\u0119stochowa"],
    ["2025/2026", "Lech Pozna\u0144", "G\xF3rnik Zabrze"]
  ]),
  ...buildSeasonHistory("PUCHAR_POLSKI", [
    ["1999/2000", "Amica Wronki", "Wis\u0142a Krak\xF3w"],
    ["2000/2001", "Polonia Warszawa", "G\xF3rnik Zabrze"],
    ["2001/2002", "Wis\u0142a Krak\xF3w", "Amica Wronki"],
    ["2002/2003", "Wis\u0142a Krak\xF3w", "Wis\u0142a P\u0142ock"],
    ["2003/2004", "Lech Pozna\u0144", "Legia Warszawa"],
    ["2004/2005", "Dyskobolia Grodzisk Wielkopolski", "Zag\u0142\u0119bie Lubin"],
    ["2005/2006", "Wis\u0142a P\u0142ock", "Zag\u0142\u0119bie Lubin"],
    ["2006/2007", "Dyskobolia Grodzisk Wielkopolski", "Korona Kielce"],
    ["2007/2008", "Legia Warszawa", "Wis\u0142a Krak\xF3w"],
    ["2008/2009", "Lech Pozna\u0144", "Ruch Chorz\xF3w"],
    ["2009/2010", "Jagiellonia Bia\u0142ystok", "Pogo\u0144 Szczecin"],
    ["2010/2011", "Legia Warszawa", "Lech Pozna\u0144"],
    ["2011/2012", "Legia Warszawa", "Ruch Chorz\xF3w"],
    ["2012/2013", "Legia Warszawa", "\u015Al\u0105sk Wroc\u0142aw"],
    ["2013/2014", "Zawisza Bydgoszcz", "Zag\u0142\u0119bie Lubin"],
    ["2014/2015", "Legia Warszawa", "Lech Pozna\u0144"],
    ["2015/2016", "Legia Warszawa", "Lech Pozna\u0144"],
    ["2016/2017", "Arka Gdynia", "Lech Pozna\u0144"],
    ["2017/2018", "Legia Warszawa", "Arka Gdynia"],
    ["2018/2019", "Lechia Gda\u0144sk", "Jagiellonia Bia\u0142ystok"],
    ["2019/2020", "Cracovia", "Lechia Gda\u0144sk"],
    ["2020/2021", "Rak\xF3w Cz\u0119stochowa", "Arka Gdynia"],
    ["2021/2022", "Rak\xF3w Cz\u0119stochowa", "Lech Pozna\u0144"],
    ["2022/2023", "Legia Warszawa", "Rak\xF3w Cz\u0119stochowa"],
    ["2023/2024", "Wis\u0142a Krak\xF3w", "Pogo\u0144 Szczecin"],
    ["2024/2025", "Legia Warszawa", "Pogo\u0144 Szczecin"],
    ["2025/2026", "G\xF3rnik Zabrze", "Rak\xF3w Cz\u0119stochowa"]
  ]),
  ...buildSeasonHistory("SUPERPUCHAR_POLSKI", [
    ["2000/2001", "Polonia Warszawa", "Amica Wronki"],
    ["2001/2002", "Wis\u0142a Krak\xF3w", "Polonia Warszawa"],
    ["2004/2005", "Lech Pozna\u0144", "Wis\u0142a Krak\xF3w"],
    ["2006/2007", "Wis\u0142a P\u0142ock", "Legia Warszawa"],
    ["2007/2008", "Zag\u0142\u0119bie Lubin", "GKS Be\u0142chat\xF3w"],
    ["2008/2009", "Legia Warszawa", "Wis\u0142a Krak\xF3w"],
    ["2009/2010", "Lech Pozna\u0144", "Wis\u0142a Krak\xF3w"],
    ["2010/2011", "Jagiellonia Bia\u0142ystok", "Lech Pozna\u0144"],
    ["2012/2013", "\u015Al\u0105sk Wroc\u0142aw", "Legia Warszawa"],
    ["2014/2015", "Zawisza Bydgoszcz", "Legia Warszawa"],
    ["2015/2016", "Lech Pozna\u0144", "Legia Warszawa"],
    ["2016/2017", "Lech Pozna\u0144", "Legia Warszawa"],
    ["2017/2018", "Arka Gdynia", "Legia Warszawa"],
    ["2018/2019", "Arka Gdynia", "Legia Warszawa"],
    ["2019/2020", "Lechia Gda\u0144sk", "Piast Gliwice"],
    ["2020/2021", "Cracovia", "Legia Warszawa"],
    ["2021/2022", "Rak\xF3w Cz\u0119stochowa", "Legia Warszawa"],
    ["2022/2023", "Rak\xF3w Cz\u0119stochowa", "Lech Pozna\u0144"],
    ["2023/2024", "Legia Warszawa", "Rak\xF3w Cz\u0119stochowa"],
    ["2024/2025", "Jagiellonia Bia\u0142ystok", "Wis\u0142a Krak\xF3w"],
    ["2025/2026", "Legia Warszawa", "Lech Pozna\u0144"]
  ]),
  ...buildSeasonHistory("LIGA_MISTRZOW", [
    ["1999/2000", "Real Madryt", "Valencia"],
    ["2000/2001", "Bayern Monachium", "Valencia"],
    ["2001/2002", "Real Madryt", "Bayer Leverkusen"],
    ["2002/2003", "AC Milan", "Juventus"],
    ["2003/2004", "FC Porto", "AS Monaco"],
    ["2004/2005", "Liverpool", "AC Milan"],
    ["2005/2006", "FC Barcelona", "Arsenal"],
    ["2006/2007", "AC Milan", "Liverpool"],
    ["2007/2008", "Manchester United", "Chelsea"],
    ["2008/2009", "FC Barcelona", "Manchester United"],
    ["2009/2010", "Inter Mediolan", "Bayern Monachium"],
    ["2010/2011", "FC Barcelona", "Manchester United"],
    ["2011/2012", "Chelsea", "Bayern Monachium"],
    ["2012/2013", "Bayern Monachium", "Borussia Dortmund"],
    ["2013/2014", "Real Madryt", "Atl\xE9tico Madryt"],
    ["2014/2015", "FC Barcelona", "Juventus"],
    ["2015/2016", "Real Madryt", "Atl\xE9tico Madryt"],
    ["2016/2017", "Real Madryt", "Juventus"],
    ["2017/2018", "Real Madryt", "Liverpool"],
    ["2018/2019", "Liverpool", "Tottenham Hotspur"],
    ["2019/2020", "Bayern Monachium", "Paris Saint-Germain"],
    ["2020/2021", "Chelsea", "Manchester City"],
    ["2021/2022", "Real Madryt", "Liverpool"],
    ["2022/2023", "Manchester City", "Inter Mediolan"],
    ["2023/2024", "Real Madryt", "Borussia Dortmund"],
    ["2024/2025", "Paris Saint-Germain", "Inter Mediolan"],
    ["2025/2026", "Paris Saint-Germain", "Arsenal"]
  ]),
  ...buildSeasonHistory("LIGA_EUROPY", [
    ["1999/2000", "Galatasaray", "Arsenal"],
    ["2000/2001", "Liverpool", "Deportivo Alav\xE9s"],
    ["2001/2002", "Feyenoord", "Borussia Dortmund"],
    ["2002/2003", "FC Porto", "Celtic"],
    ["2003/2004", "Valencia", "Olympique Marsylia"],
    ["2004/2005", "CSKA Moskwa", "Sporting CP"],
    ["2005/2006", "Sevilla", "Middlesbrough"],
    ["2006/2007", "Sevilla", "Espanyol"],
    ["2007/2008", "Zenit Petersburg", "Rangers"],
    ["2008/2009", "Szachtar Donieck", "Werder Brema"],
    ["2009/2010", "Atl\xE9tico Madryt", "Fulham"],
    ["2010/2011", "FC Porto", "SC Braga"],
    ["2011/2012", "Atl\xE9tico Madryt", "Athletic Bilbao"],
    ["2012/2013", "Chelsea", "Benfica"],
    ["2013/2014", "Sevilla", "Benfica"],
    ["2014/2015", "Sevilla", "Dnipro"],
    ["2015/2016", "Sevilla", "Liverpool"],
    ["2016/2017", "Manchester United", "Ajax"],
    ["2017/2018", "Atl\xE9tico Madryt", "Olympique Marsylia"],
    ["2018/2019", "Chelsea", "Arsenal"],
    ["2019/2020", "Sevilla", "Inter Mediolan"],
    ["2020/2021", "Villarreal", "Manchester United"],
    ["2021/2022", "Eintracht Frankfurt", "Rangers"],
    ["2022/2023", "Sevilla", "AS Roma"],
    ["2023/2024", "Atalanta", "Bayer Leverkusen"],
    ["2024/2025", "Tottenham Hotspur", "Manchester United"],
    ["2025/2026", "Aston Villa", "SC Freiburg"]
  ]),
  ...buildSeasonHistory("LIGA_KONFERENCJI", [
    ["2021/2022", "AS Roma", "Feyenoord"],
    ["2022/2023", "West Ham United", "Fiorentina"],
    ["2023/2024", "Olympiakos", "Fiorentina"],
    ["2024/2025", "Chelsea", "Real Betis"],
    ["2025/2026", "Crystal Palace", "Rayo Vallecano"]
  ]),
  ...buildSeasonHistory("SUPERPUCHAR_EUROPY", [
    ["2000/2001", "Galatasaray", "Real Madryt"],
    ["2001/2002", "Liverpool", "Bayern Monachium"],
    ["2002/2003", "Real Madryt", "Feyenoord"],
    ["2003/2004", "AC Milan", "FC Porto"],
    ["2004/2005", "Valencia", "FC Porto"],
    ["2005/2006", "Liverpool", "CSKA Moskwa"],
    ["2006/2007", "Sevilla", "FC Barcelona"],
    ["2007/2008", "AC Milan", "Sevilla"],
    ["2008/2009", "Zenit Petersburg", "Manchester United"],
    ["2009/2010", "FC Barcelona", "Szachtar Donieck"],
    ["2010/2011", "Atl\xE9tico Madryt", "Inter Mediolan"],
    ["2011/2012", "FC Barcelona", "FC Porto"],
    ["2012/2013", "Atl\xE9tico Madryt", "Chelsea"],
    ["2013/2014", "Bayern Monachium", "Chelsea"],
    ["2014/2015", "Real Madryt", "Sevilla"],
    ["2015/2016", "FC Barcelona", "Sevilla"],
    ["2016/2017", "Real Madryt", "Sevilla"],
    ["2017/2018", "Real Madryt", "Manchester United"],
    ["2018/2019", "Atl\xE9tico Madryt", "Real Madryt"],
    ["2019/2020", "Liverpool", "Chelsea"],
    ["2020/2021", "Bayern Monachium", "Sevilla"],
    ["2021/2022", "Chelsea", "Villarreal"],
    ["2022/2023", "Real Madryt", "Eintracht Frankfurt"],
    ["2023/2024", "Manchester City", "Sevilla"],
    ["2024/2025", "Real Madryt", "Atalanta"],
    ["2025/2026", "Paris Saint-Germain", "Tottenham Hotspur"]
  ]),
  ...buildTournamentHistory("WORLD_CUP", [
    [2002, "Brazylia", "Niemcy", "Turcja", "Korea Po\u0142udniowa"],
    [2006, "W\u0142ochy", "Francja", "Niemcy", "Portugalia"],
    [2010, "Hiszpania", "Holandia", "Niemcy", "Urugwaj"],
    [2014, "Niemcy", "Argentyna", "Holandia", "Brazylia"],
    [2018, "Francja", "Chorwacja", "Belgia", "Anglia"],
    [2022, "Argentyna", "Francja", "Chorwacja", "Maroko"],
    [2026, "Hiszpania", "Argentyna", "Anglia", "Francja"]
  ]),
  ...buildTournamentHistory("EURO_CHAMPIONSHIP", [
    [2e3, "Francja", "W\u0142ochy"],
    [2004, "Grecja", "Portugalia"],
    [2008, "Hiszpania", "Niemcy"],
    [2012, "Hiszpania", "W\u0142ochy"],
    [2016, "Portugalia", "Francja"],
    [2020, "W\u0142ochy", "Anglia"],
    [2024, "Hiszpania", "Anglia"]
  ])
];
var ChampionshipHistoryService = class {
  static getHistory() {
    try {
      const stored = localStorage?.getItem(STORAGE_KEY);
      console.log("\u{1F4C2} ChampionshipHistoryService.getHistory() - localStorage data:", stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("\u2713 Parsed from localStorage:", parsed);
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load championship history:", e);
    }
    const defaultData = [
      {
        season: "2023/2024",
        competition: "EKSTRAKLASA",
        winner: "Jagiellonia Bia\u0142ystok",
        runnerUp: "\u015Al\u0105sk Wroc\u0142aw",
        year: 2024
      },
      {
        season: "2024/2025",
        competition: "EKSTRAKLASA",
        winner: "Lech Pozna\u0144",
        runnerUp: "Rak\xF3w Cz\u0119stochowa",
        year: 2025
      },
      {
        season: "2023/2024",
        competition: "PUCHAR_POLSKI",
        winner: "Wis\u0142a Krak\xF3w",
        runnerUp: "Pogo\u0144 Szczecin",
        year: 2024
      },
      {
        season: "2024/2025",
        competition: "PUCHAR_POLSKI",
        winner: "Legia Warszawa",
        runnerUp: "Pogo\u0144 Szczecin",
        year: 2025
      },
      {
        season: "2023/2024",
        competition: "LIGA_MISTRZOW",
        winner: "Real Madryt",
        runnerUp: "Borussia Dortmund",
        year: 2024
      },
      {
        season: "2024/2025",
        competition: "LIGA_MISTRZOW",
        winner: "Paris Saint-Germain",
        runnerUp: "Inter Mediolan",
        year: 2025
      },
      // Superpuchar domyślny (będzie uzupełniony pełnym archiwum przy starcie kariery)
      {
        season: "2023/2024",
        competition: "SUPERPUCHAR_POLSKI",
        winner: "Legia Warszawa",
        runnerUp: "Rak\xF3w Cz\u0119stochowa",
        year: 2024
      }
    ];
    return defaultData;
  }
  static saveHistory(history) {
    try {
      const json = JSON.stringify(history);
      console.log("\u{1F4BE} saveHistory - saving to localStorage:", json);
      localStorage?.setItem(STORAGE_KEY, json);
      console.log("   \u2713 Saved successfully");
    } catch (e) {
      console.error("Failed to save championship history:", e);
    }
  }
  static getAll() {
    return this.getHistory();
  }
  static getByCompetition(competition) {
    return this.getHistory().filter((c) => c.competition === competition).sort((a, b) => b.year - a.year);
  }
  static addChampion(entry) {
    console.log("\u{1F539} addChampion called:", entry);
    const history = this.getHistory();
    console.log("   Current history before add:", history);
    const existingIndex = history.findIndex(
      (h) => h.season === entry.season && h.competition === entry.competition
    );
    if (existingIndex >= 0) {
      console.log("   Updating existing entry at index", existingIndex);
      history[existingIndex] = entry;
    } else {
      console.log("   Adding new entry");
      history.push(entry);
    }
    console.log("   History after add:", history);
    this.saveHistory(history.sort((a, b) => b.year - a.year));
    console.log("   \u2713 Saved");
  }
  static addChampionIfMissing(entry) {
    const alreadyExists = this.getHistory().some(
      (historyEntry) => historyEntry.season === entry.season && historyEntry.competition === entry.competition
    );
    if (!alreadyExists) this.addChampion(entry);
  }
  static addEkstraklasaChampion(season, winner, runnerUp, year) {
    this.addChampion({
      season,
      competition: "EKSTRAKLASA",
      winner,
      runnerUp,
      year
    });
  }
  static addCupChampion(season, competition, winner, year) {
    console.log("\u{1F538} addCupChampion called:", { season, competition, winner, year });
    this.addChampion({
      season,
      competition,
      winner,
      year
    });
  }
  static addCLChampion(season, winner, year, runnerUp) {
    this.addChampion({
      season,
      competition: "LIGA_MISTRZOW",
      winner,
      runnerUp,
      year
    });
  }
  static addEuropeanClubChampion(season, competition, winner, year, runnerUp) {
    this.addChampion({
      season,
      competition,
      winner,
      runnerUp,
      year
    });
  }
  static seedCareerStartDomesticHistory(startYear) {
    const domesticCompetitions = /* @__PURE__ */ new Set([
      "EKSTRAKLASA",
      "PUCHAR_POLSKI",
      "SUPERPUCHAR_POLSKI"
    ]);
    HISTORICAL_CHAMPIONSHIP_ARCHIVE.filter((entry) => entry.year <= startYear && domesticCompetitions.has(entry.competition)).forEach((entry) => this.addChampionIfMissing(entry));
  }
  static seedCareerStartEuropeanClubHistory(startYear) {
    const europeanCompetitions = /* @__PURE__ */ new Set([
      "LIGA_MISTRZOW",
      "LIGA_EUROPY",
      "LIGA_KONFERENCJI",
      "SUPERPUCHAR_EUROPY"
    ]);
    HISTORICAL_CHAMPIONSHIP_ARCHIVE.filter((entry) => entry.year <= startYear && europeanCompetitions.has(entry.competition)).forEach((entry) => this.addChampionIfMissing(entry));
  }
  static seedCareerStartInternationalHistory(startYear) {
    const internationalCompetitions = /* @__PURE__ */ new Set([
      "WORLD_CUP",
      "EURO_CHAMPIONSHIP"
    ]);
    HISTORICAL_CHAMPIONSHIP_ARCHIVE.filter((entry) => entry.year <= startYear && internationalCompetitions.has(entry.competition)).forEach((entry) => this.addChampionIfMissing(entry));
  }
  static addWorldCupResult(year, winner, runnerUp, thirdPlace, fourthPlace) {
    this.addChampion({
      season: String(year),
      competition: "WORLD_CUP",
      winner,
      runnerUp,
      thirdPlace,
      fourthPlace,
      year
    });
  }
  static addEuroChampion(year, winner, runnerUp) {
    this.addChampion({
      season: String(year),
      competition: "EURO_CHAMPIONSHIP",
      winner,
      runnerUp,
      year
    });
  }
  static restore(entries) {
    try {
      localStorage?.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error("Failed to restore championship history:", e);
    }
  }
  static clear() {
    try {
      localStorage?.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear championship history:", e);
    }
  }
};
var championshipHistory = ChampionshipHistoryService.getAll();

// tests/EuropeanClubHistoryTests.ts
var storage = /* @__PURE__ */ new Map();
Object.assign(globalThis, {
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key)
  }
});
ChampionshipHistoryService.clear();
ChampionshipHistoryService.seedCareerStartDomesticHistory(2025);
ChampionshipHistoryService.seedCareerStartEuropeanClubHistory(2025);
ChampionshipHistoryService.seedCareerStartInternationalHistory(2025);
import_node_assert.strict.equal(
  ChampionshipHistoryService.getAll().some((entry) => entry.year === 2026 && entry.competition === "LIGA_MISTRZOW"),
  false
);
ChampionshipHistoryService.clear();
ChampionshipHistoryService.seedCareerStartDomesticHistory(2026);
ChampionshipHistoryService.seedCareerStartEuropeanClubHistory(2026);
ChampionshipHistoryService.seedCareerStartInternationalHistory(2026);
var history2026 = ChampionshipHistoryService.getAll().filter((entry) => entry.season === "2025/2026");
var ekstraklasa2026 = history2026.find((entry) => entry.competition === "EKSTRAKLASA");
import_node_assert.strict.equal(ekstraklasa2026?.winner, "Lech Pozna\u0144");
import_node_assert.strict.equal(ekstraklasa2026?.runnerUp, "G\xF3rnik Zabrze");
import_node_assert.strict.equal(history2026.find((entry) => entry.competition === "PUCHAR_POLSKI")?.winner, "G\xF3rnik Zabrze");
import_node_assert.strict.equal(history2026.find((entry) => entry.competition === "LIGA_MISTRZOW")?.winner, "Paris Saint-Germain");
import_node_assert.strict.equal(history2026.find((entry) => entry.competition === "LIGA_EUROPY")?.winner, "Aston Villa");
import_node_assert.strict.equal(history2026.find((entry) => entry.competition === "LIGA_KONFERENCJI")?.winner, "Crystal Palace");
import_node_assert.strict.equal(history2026.find((entry) => entry.competition === "LIGA_KONFERENCJI")?.runnerUp, "Rayo Vallecano");
import_node_assert.strict.equal(history2026.find((entry) => entry.competition === "SUPERPUCHAR_EUROPY")?.winner, "Paris Saint-Germain");
var polishSupercups = ChampionshipHistoryService.getByCompetition("SUPERPUCHAR_POLSKI");
import_node_assert.strict.equal(polishSupercups.length, 21);
import_node_assert.strict.equal(polishSupercups[0]?.winner, "Legia Warszawa");
import_node_assert.strict.equal(polishSupercups.some((entry) => entry.season === "2002/2003"), false);
import_node_assert.strict.equal(polishSupercups.at(-1)?.season, "2000/2001");
var uefaSupercups = ChampionshipHistoryService.getByCompetition("SUPERPUCHAR_EUROPY");
import_node_assert.strict.equal(uefaSupercups.length, 26);
import_node_assert.strict.equal(uefaSupercups[2]?.winner, "Manchester City");
import_node_assert.strict.equal(uefaSupercups.at(-1)?.winner, "Galatasaray");
var worldCups = ChampionshipHistoryService.getByCompetition("WORLD_CUP");
import_node_assert.strict.equal(worldCups.length, 7);
import_node_assert.strict.deepEqual(
  [worldCups[0]?.winner, worldCups[0]?.runnerUp, worldCups[0]?.thirdPlace, worldCups[0]?.fourthPlace],
  ["Hiszpania", "Argentyna", "Anglia", "Francja"]
);
import_node_assert.strict.equal(worldCups.at(-1)?.winner, "Brazylia");
var euros = ChampionshipHistoryService.getByCompetition("EURO_CHAMPIONSHIP");
import_node_assert.strict.equal(euros.length, 7);
import_node_assert.strict.equal(euros[0]?.winner, "Hiszpania");
import_node_assert.strict.equal(euros.at(-1)?.winner, "Francja");
var championsLeague = ChampionshipHistoryService.getByCompetition("LIGA_MISTRZOW");
import_node_assert.strict.equal(championsLeague.length, 27);
import_node_assert.strict.equal(championsLeague.at(-1)?.season, "1999/2000");
var europaLeague = ChampionshipHistoryService.getByCompetition("LIGA_EUROPY");
import_node_assert.strict.equal(europaLeague.length, 27);
import_node_assert.strict.equal(europaLeague.at(-1)?.winner, "Galatasaray");
var conferenceLeague = ChampionshipHistoryService.getByCompetition("LIGA_KONFERENCJI");
import_node_assert.strict.equal(conferenceLeague.length, 5);
import_node_assert.strict.equal(conferenceLeague.at(-1)?.season, "2021/2022");
var ekstraklasa = ChampionshipHistoryService.getByCompetition("EKSTRAKLASA");
import_node_assert.strict.equal(ekstraklasa.length, 27);
import_node_assert.strict.equal(ekstraklasa.at(-1)?.winner, "Polonia Warszawa");
var polishCup = ChampionshipHistoryService.getByCompetition("PUCHAR_POLSKI");
import_node_assert.strict.equal(polishCup.length, 27);
import_node_assert.strict.equal(polishCup.at(-1)?.winner, "Amica Wronki");
console.log("Career start history tests passed.");
