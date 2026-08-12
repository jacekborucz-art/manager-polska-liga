globalThis.localStorage=globalThis.localStorage||{getItem:()=>null,setItem:()=>{},removeItem:()=>{}};

// tests/EuropeanClubHistoryTests.ts
var import_node_assert = require("node:assert");

// data/championship_history.ts
var STORAGE_KEY = "fm_championship_history";
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
      // Superpuchar domyślny (będzie zastąpiony gdy gracz wygra mecz)
      {
        season: "2023/2024",
        competition: "SUPERPUCHAR_POLSKI",
        winner: "Jagiellonia Bia\u0142ystok",
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
  static seedCareerStartEuropeanClubHistory(startYear) {
    if (startYear < 2026) return;
    this.addEuropeanClubChampion("2025/2026", "LIGA_MISTRZOW", "Paris Saint-Germain", 2026);
    this.addEuropeanClubChampion("2025/2026", "LIGA_EUROPY", "Aston Villa", 2026);
    this.addEuropeanClubChampion("2025/2026", "LIGA_KONFERENCJI", "Crystal Palace", 2026, "Rayo Vallecano");
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
ChampionshipHistoryService.seedCareerStartEuropeanClubHistory(2025);
import_node_assert.strict.equal(
  ChampionshipHistoryService.getAll().some((entry) => entry.year === 2026 && entry.competition === "LIGA_MISTRZOW"),
  false
);
ChampionshipHistoryService.clear();
ChampionshipHistoryService.seedCareerStartEuropeanClubHistory(2026);
var history2026 = ChampionshipHistoryService.getAll().filter((entry) => entry.season === "2025/2026");
import_node_assert.strict.equal(history2026.find((entry) => entry.competition === "LIGA_MISTRZOW")?.winner, "Paris Saint-Germain");
import_node_assert.strict.equal(history2026.find((entry) => entry.competition === "LIGA_EUROPY")?.winner, "Aston Villa");
import_node_assert.strict.equal(history2026.find((entry) => entry.competition === "LIGA_KONFERENCJI")?.winner, "Crystal Palace");
import_node_assert.strict.equal(history2026.find((entry) => entry.competition === "LIGA_KONFERENCJI")?.runnerUp, "Rayo Vallecano");
console.log("European club history tests passed.");
