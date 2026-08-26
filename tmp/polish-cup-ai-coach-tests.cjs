globalThis.window=globalThis.window||{};

// tests/PolishCupAiCoachPreparationTests.ts
var import_node_assert = require("node:assert");

// services/PolandWeatherService.ts
var PolandWeatherService = {
  getWeather: (date, seedStr) => {
    const month = date.getMonth();
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const r1 = Math.abs(hash) % 1e4 / 1e4;
    const r2 = Math.abs(hash * 1664525 + 1013904223) % 1e4 / 1e4;
    const r3 = Math.abs(hash * 22695477 + 1) % 1e4 / 1e4;
    const tempConfigs = {
      0: { minT: -8, maxT: 3 },
      // Sty
      1: { minT: -6, maxT: 5 },
      // Lut
      2: { minT: -1, maxT: 10 },
      // Mar
      3: { minT: 4, maxT: 16 },
      // Kwi
      4: { minT: 9, maxT: 21 },
      // Maj
      5: { minT: 13, maxT: 25 },
      // Cze
      6: { minT: 15, maxT: 27 },
      // Lip
      7: { minT: 14, maxT: 26 },
      // Sie
      8: { minT: 9, maxT: 20 },
      // Wrz
      9: { minT: 4, maxT: 14 },
      // Paź
      10: { minT: 0, maxT: 8 },
      // Lis
      11: { minT: -4, maxT: 4 }
      // Gru
    };
    const tc = tempConfigs[month];
    const tempC = Math.floor(tc.minT + r2 * (tc.maxT - tc.minT));
    const windKmh = Math.floor(r3 * 55);
    let description;
    let precipitationChance;
    let weatherIntensity;
    if (month === 0 || month === 1 || month === 11) {
      if (r1 < 0.07) {
        description = "Zamie\u0107 \u015Bnie\u017Cna";
        precipitationChance = 100;
        weatherIntensity = 1;
      } else if (r1 < 0.2) {
        description = "Intensywne opady \u015Bniegu";
        precipitationChance = 100;
        weatherIntensity = 0.85;
      } else if (r1 < 0.37) {
        description = "Opady \u015Bniegu";
        precipitationChance = 100;
        weatherIntensity = 0.6;
      } else if (r1 < 0.5) {
        description = tempC <= -4 ? "Silny mr\xF3z" : "Mr\xF3z";
        precipitationChance = 0;
        weatherIntensity = tempC <= -5 ? 0.55 : 0.35;
      } else if (r1 < 0.6) {
        description = "G\u0119sta mg\u0142a";
        precipitationChance = 20;
        weatherIntensity = 0.4;
      } else if (r1 < 0.72) {
        description = windKmh > 30 ? "Silny wiatr, pochmurno" : "Pochmurno, zimno";
        precipitationChance = 0;
        weatherIntensity = windKmh > 35 ? 0.45 : 0.1;
      } else if (r1 < 0.88) {
        description = "Zachmurzenie umiarkowane";
        precipitationChance = 0;
        weatherIntensity = 0.05;
      } else {
        description = "S\u0142onecznie, mro\u017Ano";
        precipitationChance = 0;
        weatherIntensity = 0.1;
      }
    } else if (month === 2 || month === 3) {
      if (r1 < 0.05 && month === 2) {
        description = "Ostatnie opady \u015Bniegu";
        precipitationChance = 100;
        weatherIntensity = 0.5;
      } else if (r1 < 0.22) {
        description = windKmh > 30 ? "Deszcz ze silnym wiatrem" : "Deszcz";
        precipitationChance = 100;
        weatherIntensity = windKmh > 30 ? 0.55 : 0.38;
      } else if (r1 < 0.35) {
        description = "Lekki deszcz";
        precipitationChance = 100;
        weatherIntensity = 0.22;
      } else if (r1 < 0.47) {
        description = "Silny wiatr";
        precipitationChance = 0;
        weatherIntensity = 0.38;
      } else if (r1 < 0.62) {
        description = "Zachmurzenie umiarkowane";
        precipitationChance = 0;
        weatherIntensity = 0.05;
      } else if (r1 < 0.78) {
        description = "Pochmurno";
        precipitationChance = 0;
        weatherIntensity = 0;
      } else {
        description = "Bezchmurnie";
        precipitationChance = 0;
        weatherIntensity = 0;
      }
    } else if (month >= 4 && month <= 7) {
      const thunderChance = month === 5 || month === 6 ? 0.12 : 0.07;
      const heatChance = month === 6 || month === 7 ? 0.09 : 0.03;
      if (r1 < thunderChance) {
        description = "Burza z piorunami";
        precipitationChance = 100;
        weatherIntensity = 1;
      } else if (r1 < thunderChance + heatChance) {
        description = "Upa\u0142";
        precipitationChance = 0;
        weatherIntensity = 0.65;
      } else if (r1 < 0.32) {
        description = "Ulewny deszcz";
        precipitationChance = 100;
        weatherIntensity = 0.8;
      } else if (r1 < 0.5) {
        description = "Deszcz";
        precipitationChance = 100;
        weatherIntensity = 0.38;
      } else if (r1 < 0.62) {
        description = "Lekki deszcz";
        precipitationChance = 100;
        weatherIntensity = 0.2;
      } else if (r1 < 0.74) {
        description = "Zachmurzenie umiarkowane";
        precipitationChance = 0;
        weatherIntensity = 0;
      } else {
        description = "Bezchmurnie";
        precipitationChance = 0;
        weatherIntensity = 0;
      }
    } else {
      const fogChance = month === 10 ? 0.18 : month === 9 ? 0.12 : 0.06;
      const frostChance = month === 10 ? 0.1 : 0;
      if (r1 < frostChance) {
        description = "Pierwszy przymrozek";
        precipitationChance = 0;
        weatherIntensity = 0.3;
      } else if (r1 < frostChance + fogChance) {
        description = "G\u0119sta mg\u0142a";
        precipitationChance = 20;
        weatherIntensity = 0.4;
      } else if (r1 < 0.4) {
        description = windKmh > 30 ? "Deszcz ze silnym wiatrem" : "Deszcz";
        precipitationChance = 100;
        weatherIntensity = windKmh > 30 ? 0.62 : 0.4;
      } else if (r1 < 0.54) {
        description = "Lekki deszcz";
        precipitationChance = 100;
        weatherIntensity = 0.22;
      } else if (r1 < 0.65) {
        description = "Silny wiatr";
        precipitationChance = 0;
        weatherIntensity = windKmh > 35 ? 0.45 : 0.25;
      } else if (r1 < 0.78) {
        description = "Zachmurzenie umiarkowane";
        precipitationChance = 0;
        weatherIntensity = 0.05;
      } else {
        description = "Pochmurno";
        precipitationChance = 0;
        weatherIntensity = 0;
      }
    }
    return {
      tempC,
      precipitationChance,
      windKmh,
      description,
      weatherIntensity
    };
  }
};

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
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i) | 0;
  }
  return Math.abs(hash);
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
    function fDate(fixture2) {
      return fixture2.date instanceof Date ? fixture2.date : new Date(fixture2.date);
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

// services/PlayerPositionFitService.ts
var DEFAULT_SECONDARY_POSITION_RATING = 50;
var clamp4 = (value, min, max) => Math.max(min, Math.min(max, value));
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
    return clamp4(0.72 + rating / 99 * 0.28, 0.72, 1);
  }
  return clamp4(1 - getPositionFamilyDistance(player.position, role) * 0.42, 0.54, 0.78);
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
    const qualityDrop = clamp4((naturalOverall - roleOverall) / 24, -0.25, 1);
    if (useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role)) {
      const secondaryGap = 1 - PlayerPositionFitService.getSecondaryRating(player) / 99;
      const raw2 = qualityDrop * 0.58 + secondaryGap * 0.32 + (1 - familiarity) * 0.1;
      return clamp4(Math.pow(Math.max(0, raw2), 1.25), 0.02, 0.55);
    }
    const raw = qualityDrop * 0.68 + familyDistance * 0.24 + (1 - familiarity) * 0.08;
    return clamp4(Math.pow(Math.max(0, raw), 1.18), 0.08, 1);
  },
  getFitScoreBonus: (player, role, useSecondaryPosition = false) => {
    if (player.position === role) return 16;
    if (isGoalkeeperMismatch(player, role)) return -80;
    const roleOverall = PlayerPositionFitService.getRoleOverall(player, role);
    const naturalOverall = Math.max(1, player.overallRating || getRoleOverall(player, player.position));
    const familiarity = getRoleFamiliarity(player, role, useSecondaryPosition);
    const roleQualityDelta = clamp4(roleOverall - naturalOverall, -18, 12);
    const base = useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role) ? 16 * (PlayerPositionFitService.getSecondaryRating(player) / 99) : -10 * getPositionFamilyDistance(player.position, role);
    return clamp4(base + roleQualityDelta * 0.55 + (familiarity - 0.65) * 12, -24, 16);
  },
  getSecondaryRating: (player) => Math.max(1, Math.min(99, player.secondaryPositionRating ?? DEFAULT_SECONDARY_POSITION_RATING)),
  getRoleOverall,
  // Effective role overall is the number the match engine should use when team strength depends on
  // who is actually occupying each tactical slot during the live match.
  getEffectiveRoleOverall: (player, role, useSecondaryPosition = false) => {
    if (player.position === role) return clamp4(Math.round(player.overallRating || getRoleOverall(player, role)), 1, 99);
    if (isGoalkeeperMismatch(player, role)) return Math.max(1, Math.round(getRoleOverall(player, role) * 0.35));
    const roleOverall = getRoleOverall(player, role);
    const penaltyFactor = PlayerPositionFitService.getPenaltyFactor(player, role, useSecondaryPosition);
    const familiarityDrag = player.position === role ? 0 : penaltyFactor * 8;
    return clamp4(Math.round(roleOverall - familiarityDrag), 1, 99);
  }
};

// services/TeamFormImpactService.ts
var clamp5 = (value, min, max) => Math.max(min, Math.min(max, value));
var average2 = (values, fallback) => values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;
var getPlayerForm = (player) => player ? player.form ?? PlayerFormService.calculate(player).score : 50;
var getPlayersByIds = (players, ids) => {
  const playerMap = new Map(players.map((player) => [player.id, player]));
  return ids.map((id) => id ? playerMap.get(id) : void 0).filter((player) => !!player);
};
var getBaseFormMultiplier = (form) => {
  const centered = (clamp5(form, 0, 100) - 50) / 50;
  const curve = Math.sign(centered) * Math.pow(Math.abs(centered), 1.18);
  return clamp5(1 + curve * 0.18, 0.82, 1.18);
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
var adjustForQualityGap = (ownMultiplier, ownQuality, opponentQuality, options = {}) => {
  const qualityGap = Math.abs(ownQuality - opponentQuality);
  const isUnderdog = ownQuality < opponentQuality;
  const isFavorite = ownQuality > opponentQuality;
  if (qualityGap <= 12) return ownMultiplier;
  if (isUnderdog && ownMultiplier > 1) {
    const boost = ownMultiplier - 1;
    const minimumBoostFactor = options.preserveUnderdogForm ? 0.72 : 0.35;
    const reductionAtTwentyFive = options.preserveUnderdogForm ? 0.28 : 0.45;
    const boostFactor = qualityGap <= 25 ? 1 - (qualityGap - 12) / 13 * reductionAtTwentyFive : minimumBoostFactor;
    return 1 + boost * boostFactor;
  }
  if (isFavorite && ownMultiplier < 1) {
    const penalty = 1 - ownMultiplier;
    const minimumPenaltyFactor = options.preserveUnderdogForm ? 0.88 : 0.72;
    const reductionAtTwentyFive = options.preserveUnderdogForm ? 0.12 : 0.2;
    const penaltyFactor = qualityGap <= 25 ? 1 - (qualityGap - 12) / 13 * reductionAtTwentyFive : minimumPenaltyFactor;
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
    const awareness = clamp5(coachQuality / 100, 0.25, 1);
    const weight = 7 + awareness * 7;
    return clamp5((form - 50) / 50 * weight, -14, 14);
  },
  calculateMatchImpact(homePlayers2, awayPlayers2, homeLineup2, awayLineup, options = {}) {
    const homeQuality = getTeamQuality(homePlayers2, homeLineup2);
    const awayQuality = getTeamQuality(awayPlayers2, awayLineup);
    const homeForm = getTeamForm(homePlayers2, homeLineup2);
    const awayForm = getTeamForm(awayPlayers2, awayLineup);
    const homePerformance = adjustForQualityGap(getBaseFormMultiplier(homeForm), homeQuality, awayQuality, options);
    const awayPerformance = adjustForQualityGap(getBaseFormMultiplier(awayForm), awayQuality, homeQuality, options);
    const homeGoalChanceMultiplier = clamp5(homePerformance * getDefenseLeakMultiplier(awayPerformance), 0.72, 1.32);
    const awayGoalChanceMultiplier = clamp5(awayPerformance * getDefenseLeakMultiplier(homePerformance), 0.72, 1.32);
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
  const tactic2 = TacticRepository.getById(tacticId);
  const required = {};
  for (let i = 1; i < tactic2.slots.length; i++) {
    const role = tactic2.slots[i].role;
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
  const direct = TacticRepository.getAll().find((tactic2) => tactic2.id === value || tactic2.name === value);
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
  return TacticRepository.getAll().find((tactic2) => checkTacticFeasibility(players, tactic2.id))?.id ?? TacticRepository.getDefault().id;
};
var hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i) | 0;
  }
  return Math.abs(hash);
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
    const tactic2 = TacticRepository.getById(tacticId);
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
      const requiredRole = tactic2.slots[i].role;
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
    return { clubId, tacticId: tactic2.id, startingXI, bench, reserves };
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
    const tactic2 = TacticRepository.getById(lineup.tacticId);
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
      const role = tactic2.slots[i].role;
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
        const role = tactic2.slots[i].role;
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

// services/AiMatchPreparationService.ts
var AiMatchPreparationService = {
  getClubCoach: (club, coaches2) => club.coachId ? coaches2[club.coachId] ?? null : null,
  determineMatchIntent: (club, opponent, coach, isHome, aggregateGoalDifference) => {
    if (aggregateGoalDifference !== void 0) {
      if (aggregateGoalDifference <= -1) return "OFFENSIVE";
      if (aggregateGoalDifference >= 2) return "DEFENSIVE";
    }
    if (!opponent) return "NEUTRAL";
    const coachRead = coach ? ((coach.attributes.decisionMaking ?? 50) + (coach.attributes.experience ?? 50)) / 2 : 50;
    const adaptationThreshold = coachRead >= 80 ? 2 : coachRead >= 60 ? 3 : coachRead >= 40 ? 4 : 5;
    const strengthDifference = (club.reputation ?? 5) - (opponent.reputation ?? 5) + (isHome ? 0.75 : 0);
    if (strengthDifference >= adaptationThreshold) return "OFFENSIVE";
    if (strengthDifference <= -adaptationThreshold) return "DEFENSIVE";
    return "NEUTRAL";
  },
  prepareTeamForMatch: (club, opponent, squad, coach, fixture2, isHome, selectionSeed, aggregateGoalDifference, requireNaturalPositionFit = false) => {
    const competitionId = fixture2.leagueId;
    const matchEligibleSquad = LineupService.getMatchEligiblePlayers(squad, { competitionId });
    const readySquad = squad.filter((player) => player.condition >= 87);
    const analysisSquad = readySquad.length >= 14 ? readySquad : squad.filter((player) => player.condition >= 75);
    const tacticalSquad = requireNaturalPositionFit ? matchEligibleSquad : analysisSquad.length >= 11 ? analysisSquad : squad;
    const baselineTacticId = AiMatchPreparationService.determineBestStartingTactic(club, tacticalSquad);
    const intent = AiMatchPreparationService.determineMatchIntent(
      club,
      opponent,
      coach,
      isHome,
      aggregateGoalDifference
    );
    const tacticId = LineupService.resolveCoachTacticId(coach, tacticalSquad, intent, baselineTacticId);
    const lineup = LineupService.autoPickLineup(club.id, squad, tacticId, coach, {
      competitionId,
      formAware: true,
      selectionSeed,
      respectRequestedTactic: true
    });
    return requireNaturalPositionFit ? lineup : LineupService.repairLineup(lineup, squad, { competitionId });
  },
  // PERFORMANCE CONTRACT: fixtures/currentDate are optional because callers
  // which already own a small, explicitly filtered club list (for example a cup
  // or playoff processor) may pass only those participants. A caller must never
  // omit fixtures/currentDate while also passing the complete world. The Polish
  // Cup processor previously violated that contract on 12 July and prepared all
  // ~650 clubs for a two-team Super Cup; it now filters participants first.
  //
  // Jedyne miejsce, które faktycznie miało problem: BackgroundMatchProcessor.ts —
  // ta funkcja była tam wywoływana CODZIENNIE, bezwarunkowo, dla WSZYSTKICH ~650
  // klubów AI, bez żadnego stagger'u/cache'a (jedyne tak duże miejsce w całym
  // pipeline'ie AI, którego nie dotykaliśmy wcześniejszymi poprawkami). W środku,
  // determineBestStartingTactic → calculateTopLineStrength woła kosztowne
  // PlayerMoraleService.ensurePlayerState (pełny klon zawodnika + przeliczenie
  // całego mindsetu od zera) WEWNĄTRZ komparatora .sort() (2x na porównanie) i
  // jeszcze raz w reduce() zaraz potem dla tych samych zawodników — to był
  // prawdopodobnie główny, niewyjaśniony wcześniej wkład w setki tysięcy dziennych
  // wywołań ensurePlayerState/clamp widocznych w PerfProfilerService.
  //
  // FIX: skład drużyny ma realne znaczenie dopiero tuż przed meczem — nie ma
  // powodu przygotowywać go codziennie dla klubu, który gra za 2 tygodnie. Gdy
  // `fixtures`+`currentDate` są podane, funkcja przygotowuje skład TYLKO dla
  // klubów, które mają zaplanowany mecz DZIŚ LUB JUTRO. "Jutro" realizuje wymóg
  // "1 dzień przed meczem" — dzięki `{...currentLineups}` niżej, skład przygotowany
  // wczoraj (gdy dziś było dla tego klubu "jutro") zostaje zachowany i jest gotowy
  // na dzisiejszy mecz. "Dziś" to czysta siatka bezpieczeństwa (np. pierwszy dzień
  // gry, gdzie nie było "wczoraj") — symulacja meczu w tym samym pliku bezpośrednio
  // odczytuje newLineups[home.id]/[away.id] i CAŁKOWICIE POMIJA mecz, jeśli składu
  // brakuje (patrz `if (!hLineup || !aLineup) return;` w processLeagueEvent), więc
  // brak siatki bezpieczeństwa mógłby po cichu psuć symulację.
  prepareAllTeams: (clubs, playersMap, currentLineups, userTeamId, coaches2 = {}, fixtures, currentDate) => {
    const updatedLineups = { ...currentLineups };
    let relevantClubIds = null;
    const relevantFixturesByClubId = /* @__PURE__ */ new Map();
    if (fixtures && currentDate) {
      relevantClubIds = /* @__PURE__ */ new Set();
      const todayStr = currentDate.toDateString();
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toDateString();
      fixtures.forEach((f) => {
        if (f.status !== "SCHEDULED" /* SCHEDULED */) return;
        const fDateStr = f.date.toDateString();
        if (fDateStr !== todayStr && fDateStr !== tomorrowStr) return;
        relevantClubIds.add(f.homeTeamId);
        relevantClubIds.add(f.awayTeamId);
        const existingHomeFixture = relevantFixturesByClubId.get(f.homeTeamId);
        const existingAwayFixture = relevantFixturesByClubId.get(f.awayTeamId);
        if (!existingHomeFixture || f.date.getTime() < existingHomeFixture.date.getTime()) {
          relevantFixturesByClubId.set(f.homeTeamId, f);
        }
        if (!existingAwayFixture || f.date.getTime() < existingAwayFixture.date.getTime()) {
          relevantFixturesByClubId.set(f.awayTeamId, f);
        }
      });
    }
    clubs.forEach((club) => {
      if (club.id === userTeamId) return;
      if (relevantClubIds && !relevantClubIds.has(club.id)) return;
      const squad = playersMap[club.id];
      if (!squad || squad.length === 0) return;
      const clubCoach = club.coachId ? coaches2[club.coachId] ?? null : null;
      const fixture2 = relevantFixturesByClubId.get(club.id);
      if (fixture2) {
        const opponentId = fixture2.homeTeamId === club.id ? fixture2.awayTeamId : fixture2.homeTeamId;
        const opponent = clubs.find((candidate) => candidate.id === opponentId) ?? null;
        updatedLineups[club.id] = AiMatchPreparationService.prepareTeamForMatch(
          club,
          opponent,
          squad,
          clubCoach,
          fixture2,
          fixture2.homeTeamId === club.id,
          `${fixture2.id}_${club.id}_ai_match_preparation`
        );
        return;
      }
      const bestTacticId = AiMatchPreparationService.determineBestStartingTactic(club, squad);
      const tacticId = LineupService.resolveCoachTacticId(clubCoach, squad, "NEUTRAL", bestTacticId);
      const lineup = LineupService.autoPickLineup(club.id, squad, tacticId, clubCoach, {
        formAware: true,
        selectionSeed: `${club.id}_${tacticId}_ai_match_preparation`,
        respectRequestedTactic: true
      });
      updatedLineups[club.id] = LineupService.repairLineup(lineup, squad);
    });
    return updatedLineups;
  },
  /**
     * Analizuje kadrę i wybiera optymalną formację startową na podstawie reputacji klubu i siły linii.
     */
  determineBestStartingTactic: (club, players) => {
    const defStr = AiMatchPreparationService.calculateTopLineStrength(players, "DEF" /* DEF */, 5);
    const midStr = AiMatchPreparationService.calculateTopLineStrength(players, "MID" /* MID */, 5);
    const fwdStr = AiMatchPreparationService.calculateTopLineStrength(players, "FWD" /* FWD */, 3);
    if (club.reputation <= 4) {
      if (defStr > fwdStr) return "5-4-1";
      return "4-5-1";
    }
    if (club.reputation >= 8) {
      if (fwdStr > defStr) return "4-3-3";
      return "4-2-3-1";
    }
    if (midStr > defStr + 3 && midStr > fwdStr + 3) {
      return "3-5-2";
    }
    if (fwdStr > defStr + 5) {
      return "4-3-3";
    }
    if (defStr > fwdStr + 3) {
      return "4-1-4-1";
    }
    return "4-4-2";
  },
  calculateTopLineStrength: (players, pos, topN) => {
    const linePlayers = players.filter((p) => p.position === pos).sort(
      (a, b) => PlayerMoraleService.getEffectiveOverall(PlayerMoraleService.ensurePlayerState(b)) - PlayerMoraleService.getEffectiveOverall(PlayerMoraleService.ensurePlayerState(a))
    ).slice(0, topN);
    if (linePlayers.length === 0) return 0;
    const total = linePlayers.reduce((sum, p) => sum + PlayerMoraleService.getEffectiveOverall(PlayerMoraleService.ensurePlayerState(p)), 0);
    return total / linePlayers.length;
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

// services/GoalAttributionService.ts
var GoalAttributionService = {
  /**
   * Calculates if a shot results in a goal based on GK attributes and defensive pressure.
   * v4.6: Added dedicated penalty logic and removed "ghost defender" bias.
   */
  checkShotSuccess: (attacker, goalkeeper, defenders, isHeader, rng, isPenalty = false, scorerLiveFatigue = 100, gkLiveFatigue = 100, scorerFitMod = 1, gkFitMod = 1, defFatigueMap = {}) => {
    if (!attacker) return false;
    if (!goalkeeper) return rng() < 0.98;
    const progressiveMod = (fatigue) => {
      const f = Math.max(0, Math.min(100, fatigue)) / 100;
      return Math.max(0.45, 1 - Math.pow(1 - f, 2) * 0.55);
    };
    const attMoraleMod = PlayerMoraleService.getMatchContributionMultiplier(PlayerMoraleService.ensurePlayerState(attacker));
    const gkMoraleMod = PlayerMoraleService.getMatchContributionMultiplier(PlayerMoraleService.ensurePlayerState(goalkeeper));
    const attMod = progressiveMod(scorerLiveFatigue) * scorerFitMod * attMoraleMod;
    const gkMod = progressiveMod(gkLiveFatigue) * gkFitMod * gkMoraleMod;
    if (isPenalty) {
      if (rng() < 0.05) return false;
      const attackerScore = (attacker.attributes.penalties * 0.45 + attacker.attributes.finishing * 0.35 + attacker.attributes.mentality * 0.2) * attMod;
      const keeperScore = (goalkeeper.attributes.goalkeeping * 0.5 + goalkeeper.attributes.defending * 0.2 + goalkeeper.attributes.mentality * 0.3) * gkMod;
      const statInfluence = (attackerScore - keeperScore) / 200;
      return rng() < Math.max(0.12, Math.min(0.95, 0.76 + statInfluence));
    }
    let attackPower = isHeader ? attacker.attributes.heading * 1.1 : attacker.attributes.finishing * 1.05;
    attackPower += attacker.attributes.attacking * 0.35;
    attackPower *= attMod;
    let savePower = goalkeeper.attributes.goalkeeping * 1.2 + goalkeeper.attributes.positioning * 0.65;
    savePower *= gkMod;
    const topDefenders = defenders.sort((a, b) => b.attributes.defending - a.attributes.defending).slice(0, 2);
    const avgDef = topDefenders.length > 0 ? topDefenders.reduce((acc, d) => {
      const defFatigue = defFatigueMap[d.id] ?? 100;
      const defMoraleMod = PlayerMoraleService.getMatchContributionMultiplier(PlayerMoraleService.ensurePlayerState(d));
      return acc + d.attributes.defending * progressiveMod(defFatigue) * defMoraleMod;
    }, 0) / topDefenders.length : 0;
    const dribblingMod = 1 - attacker.attributes.dribbling / 100 * 0.3;
    attackPower -= avgDef * 0.25 * dribblingMod;
    const diff = attackPower - savePower;
    const goalProb = 0.5 + diff / 300;
    return rng() < Math.max(0.05, Math.min(0.9, goalProb));
  },
  pickScorer: (players, lineupIds, isCorner, rng) => {
    const candidates = players.filter((p) => lineupIds.includes(p.id));
    if (candidates.length === 0) return null;
    const weights = candidates.map((p) => {
      let w = 0.1;
      switch (p.position) {
        case "FWD" /* FWD */:
          w = 1.8;
          break;
        case "MID" /* MID */:
          w = 1;
          break;
        case "DEF" /* DEF */:
          w = 0.4;
          break;
        case "GK" /* GK */:
          w = 0.01;
          break;
      }
      if (isCorner) {
        w *= p.attributes.heading / 50 * 1.8;
        if (p.position === "DEF" /* DEF */) w *= 2.2;
      } else {
        w *= Math.pow(p.attributes.finishing / 50, 1.1) * Math.pow(p.attributes.attacking / 50, 0.8) * Math.pow(p.attributes.pace / 50, 0.5) * Math.pow(p.attributes.technique / 50, 0.4);
      }
      const recentRatings = p.stats?.ratingHistory?.slice(-5) ?? [];
      const avgRating = recentRatings.length > 0 ? recentRatings.reduce((a, b) => a + b, 0) / recentRatings.length : 6.5;
      let formMod = 1;
      if (avgRating >= 7) {
        formMod = 1 + Math.min(0.15, (avgRating - 7) * 0.08);
      } else if (avgRating < 6.5) {
        formMod = 1 - Math.min(0.15, (6.5 - avgRating) * 0.1);
      }
      w *= formMod;
      w *= PlayerMoraleService.getMatchContributionMultiplier(PlayerMoraleService.ensurePlayerState(p));
      return Math.max(0.01, w);
    });
    return GoalAttributionService.weightedRandom(candidates, weights, rng);
  },
  pickAssistant: (players, lineupIds, scorerId, isSetPiece, rng) => {
    let assistChance = isSetPiece ? 0.85 : 0.65;
    if (rng() > assistChance) return null;
    const candidates = players.filter((p) => lineupIds.includes(p.id) && p.id !== scorerId);
    const weights = candidates.map((p) => {
      let w = 0.2;
      switch (p.position) {
        case "MID" /* MID */:
          w = 1.4;
          break;
        case "FWD" /* FWD */:
          w = 0.8;
          break;
        case "DEF" /* DEF */:
          w = 0.6;
          break;
        case "GK" /* GK */:
          w = 0.1;
          break;
      }
      w *= p.attributes.passing / 50 * (p.attributes.vision / 50) * Math.pow(p.attributes.crossing / 50, 0.5);
      w *= PlayerMoraleService.getMatchContributionMultiplier(PlayerMoraleService.ensurePlayerState(p));
      return Math.max(0.01, w);
    });
    return GoalAttributionService.weightedRandom(candidates, weights, rng);
  },
  weightedRandom: (items, weights, rng) => {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = rng() * totalWeight;
    for (let i = 0; i < items.length; i++) {
      if (r < weights[i]) return items[i];
      r -= weights[i];
    }
    return items[items.length - 1];
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
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
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
      return eligible[Math.abs(hash) % eligible.length];
    }
    const eligibleAnyQuality = RefereeService.pool.filter(
      (r) => r.isInternational && isEuropean(r) && notConflict(r) && !usedRefereeIds.has(r.id)
    );
    if (eligibleAnyQuality.length > 0) {
      return eligibleAnyQuality[Math.abs(hash) % eligibleAnyQuality.length];
    }
    const polishFallback = RefereeService.pool.filter(
      (r) => r.isInternational && r.nationality === "POLAND" /* POLAND */ && !usedRefereeIds.has(r.id)
    );
    if (polishFallback.length > 0) {
      return polishFallback[Math.abs(hash) % polishFallback.length];
    }
    const anyAvailable = RefereeService.pool.filter((r) => r.isInternational && isEuropean(r));
    const lastResort = anyAvailable.length > 0 ? anyAvailable : RefereeService.pool;
    return lastResort[Math.abs(hash) % lastResort.length];
  },
  /**
   * Assigns a European referee for a national team match.
   * Referee must be European, from a different region than both teams, and not already used in this matchday.
   */
  assignEuropeanRefereeByRegion: (seedStr, homeRegion, awayRegion, usedRefereeIds = /* @__PURE__ */ new Set()) => {
    RefereeService.initializePool();
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
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
    if (eligible.length > 0) return eligible[Math.abs(hash) % eligible.length];
    const eligible2 = RefereeService.pool.filter(
      (r) => r.isInternational && isEuropean(r) && notConflict(r) && !usedRefereeIds.has(r.id)
    );
    if (eligible2.length > 0) return eligible2[Math.abs(hash) % eligible2.length];
    const eligible3 = RefereeService.pool.filter((r) => isEuropean(r) && !usedRefereeIds.has(r.id));
    if (eligible3.length > 0) return eligible3[Math.abs(hash) % eligible3.length];
    const anyEur = RefereeService.pool.filter((r) => isEuropean(r));
    const lastResort = anyEur.length > 0 ? anyEur : RefereeService.pool;
    return lastResort[Math.abs(hash) % lastResort.length];
  },
  /**
   * Assigns a Polish referee for domestic league and cup matches.
   */
  assignPolishReferee: (seedStr, importance) => {
    RefereeService.initializePool();
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const polishRefs = RefereeService.pool.filter((r) => r.nationality === "POLAND" /* POLAND */);
    const eligibleRefs = polishRefs.filter((r) => {
      if (importance >= 4) return r.consistency > 70;
      if (importance >= 3) return r.consistency > 50;
      return true;
    });
    const finalPool = eligibleRefs.length > 0 ? eligibleRefs : polishRefs;
    const index = Math.abs(hash) % finalPool.length;
    return finalPool[index];
  },
  /**
   * Deterministically assigns a referee based on match criteria.
   */
  assignReferee: (seedStr, importance) => {
    RefereeService.initializePool();
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const eligibleRefs = RefereeService.pool.filter((r) => {
      if (importance >= 4) return r.consistency > 70;
      if (importance >= 3) return r.consistency > 50;
      return true;
    });
    const finalPool = eligibleRefs.length > 0 ? eligibleRefs : RefereeService.pool;
    const index = Math.abs(hash) % finalPool.length;
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
var randomIntInclusive = (min, max, random) => min + Math.floor(random() * (max - min + 1));
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
    days: randomIntInclusive(picked.min, picked.max, random)
  };
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

// services/KitSelectionService.ts
var MIN_KIT_CONTRAST_DISTANCE = 120;
var hasVisibleShirtAccent = (pattern) => Boolean(pattern && pattern !== "solid");
var getVisibleShirtColors = (kit) => {
  const colors = [kit.primary];
  if (hasVisibleShirtAccent(kit.pattern) && kit.shirtSecondary) colors.push(kit.shirtSecondary);
  return [...new Set(colors)];
};
var toMatchKitColors = (kit) => ({
  primary: kit.shirt,
  shirtSecondary: kit.shirtSecondary,
  secondary: kit.shorts,
  pattern: kit.pattern,
  text: KitSelectionService.isColorLight(kit.shirt) ? "#000000" : "#ffffff"
});
var buildKitSelection = (homeKit, awayKit) => ({
  home: toMatchKitColors(homeKit),
  away: toMatchKitColors(awayKit)
});
var getKitPairScore = (homeKit, awayKit) => {
  const homeMatchKit = toMatchKitColors(homeKit);
  const awayMatchKit = toMatchKitColors(awayKit);
  const shirtDistance = KitSelectionService.getKitClashScore(homeMatchKit, awayMatchKit);
  const primaryDistance = KitSelectionService.getColorDistance(awayKit.shirt, homeKit.shirt);
  const shortsDistance = Math.min(
    KitSelectionService.getColorDistance(awayKit.shorts, homeKit.shirt),
    KitSelectionService.getColorDistance(awayKit.shirt, homeKit.shorts)
  );
  return {
    shirtDistance,
    primaryDistance,
    supportingScore: primaryDistance * 0.7 + shortsDistance * 0.3
  };
};
var isBetterKitPair = (candidate, current) => {
  const candidateHasContrast = candidate.shirtDistance >= MIN_KIT_CONTRAST_DISTANCE;
  const currentHasContrast = current.shirtDistance >= MIN_KIT_CONTRAST_DISTANCE;
  if (candidateHasContrast !== currentHasContrast) return candidateHasContrast;
  if (candidate.shirtDistance !== current.shirtDistance) return candidate.shirtDistance > current.shirtDistance;
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
  const defaultHomeKit = homeOptions[0];
  const defaultAwayKit = selectBestAwayKit(defaultHomeKit, awayOptions);
  if (getKitPairScore(defaultHomeKit, defaultAwayKit).shirtDistance >= MIN_KIT_CONTRAST_DISTANCE) {
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
    const colorsA = getVisibleShirtColors(kitA);
    const colorsB = getVisibleShirtColors(kitB);
    return Math.min(...colorsA.flatMap((a) => colorsB.map((b) => KitSelectionService.getColorDistance(a, b))));
  },
  hasKitClash: (kitA, kitB) => KitSelectionService.getKitClashScore(kitA, kitB) < MIN_KIT_CONTRAST_DISTANCE,
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
  selectOptimalNationalTeamKits: (home, away) => selectOptimalKitsFromVariants(getActiveNationalTeamKits(home), getActiveNationalTeamKits(away)),
  /**
   * Selects the opponent kit after the player explicitly changes their own kit.
   */
  selectOpponentKitForKit: (playerKit, opponent) => {
    const opponentKits = getActiveClubKits(opponent);
    const selectedKit = {
      id: "selected-player-kit",
      name: "Wybrany str\xF3j",
      shirt: playerKit.primary,
      shirtSecondary: playerKit.shirtSecondary,
      shorts: playerKit.secondary,
      socks: playerKit.secondary,
      pattern: playerKit.pattern ?? "solid",
      isActive: true
    };
    return toMatchKitColors(selectBestAwayKit(selectedKit, opponentKits));
  },
  /**
   * Selects the opponent kit that is furthest from the player's chosen shirt color.
   */
  selectOpponentKit: (playerKitHex, opponent) => {
    return KitSelectionService.selectOpponentKitForKit({
      primary: playerKitHex,
      secondary: playerKitHex,
      pattern: "solid",
      text: KitSelectionService.isColorLight(playerKitHex) ? "#000000" : "#ffffff"
    }, opponent);
  }
};

// services/PolishCupVenueService.ts
var POLISH_CUP_NEUTRAL_VENUE = {
  name: "PGE Narodowy, Warszawa",
  capacity: 58580
};
var isPolishCupFinal = (fixture2) => fixture2.id.toUpperCase().includes("FINA\u0141");
var PolishCupVenueService = {
  getVenue: (fixture2, homeClub2) => {
    const isNeutral = fixture2.leagueId === "SUPER_CUP" /* SUPER_CUP */ || isPolishCupFinal(fixture2);
    return isNeutral ? { ...POLISH_CUP_NEUTRAL_VENUE, isNeutral: true } : { name: homeClub2.stadiumName, capacity: homeClub2.stadiumCapacity, isNeutral: false };
  },
  getHistoryVenue: (match, homeClub2) => {
    const venue = PolishCupVenueService.getVenue(
      { id: match.matchId, leagueId: match.competition },
      homeClub2
    );
    return venue.isNeutral ? venue.name : match.venue || venue.name;
  }
};

// services/PolishCupDrawService.ts
var POLISH_CUP_BYE_TEAM_ID = "POLISH_CUP_BYE";

// services/BackgroundMatchProcessorPolishCup.ts
var formatPlayerReportName = (player) => {
  const lastName = player.lastName.trim();
  return lastName ? `${player.firstName.charAt(0)}. ${lastName}` : player.firstName;
};
var clamp6 = (value, min, max) => Math.max(min, Math.min(max, value));
var getPolishCupCoachMatchProfile = (coach) => {
  if (!coach) {
    return { attackingMultiplier: 1, defensiveMultiplier: 1, penaltyAdjustment: 0 };
  }
  const experience = coach.attributes.experience ?? 50;
  const decisionMaking = coach.attributes.decisionMaking ?? 50;
  const motivation = coach.attributes.motivation ?? 50;
  const training = coach.attributes.training ?? 50;
  const attackingScore = motivation * 0.4 + training * 0.35 + decisionMaking * 0.25;
  const defensiveScore = decisionMaking * 0.45 + experience * 0.35 + training * 0.2;
  const shootoutScore = motivation * 0.45 + decisionMaking * 0.35 + experience * 0.2;
  return {
    attackingMultiplier: clamp6(1 + (attackingScore - 50) * 8e-4, 0.96, 1.04),
    defensiveMultiplier: clamp6(1 + (defensiveScore - 50) * 8e-4, 0.96, 1.04),
    penaltyAdjustment: clamp6((shootoutScore - 50) * 7e-4, -0.035, 0.035)
  };
};
var simulateCupMatch = (home, away, hPlayers, aPlayers, hLineup, aLineup, homeCoach2, awayCoach2, seed, weatherEqualizer, isNeutralVenue) => {
  let rngState = (seed ^ 3735928559) >>> 0 || 1;
  const rng = () => {
    rngState = rngState * 1664525 + 1013904223 & 4294967295;
    return (rngState >>> 0) / 4294967295;
  };
  const referee = RefereeService.assignPolishReferee(`${home.id}_${away.id}_${seed}`, 3);
  const scorers = [];
  const cards = [];
  const injuries = [];
  const substitutions = [];
  const fatigue = {};
  const fatigueDebtMap = {};
  let homeXI = [...hLineup.startingXI];
  let awayXI = [...aLineup.startingXI];
  let homeRedCount = 0;
  let awayRedCount = 0;
  let homeGoals = 0;
  let awayGoals = 0;
  const usedGoalMinutes = /* @__PURE__ */ new Set();
  const getTeamStrength = (players, xi) => {
    const active = players.filter((p) => xi.includes(p.id));
    if (active.length === 0) return { att: 40, def: 40, gk: 40, overall: 40 };
    const att = active.reduce((s, p) => s + (p.attributes.attacking + p.attributes.finishing + p.attributes.passing) / 3, 0) / active.length;
    const def = active.reduce((s, p) => s + (p.attributes.defending + p.attributes.stamina) / 2, 0) / active.length;
    const gkPlayer = players.find((p) => p.id === xi[0]);
    const gk = gkPlayer?.attributes.goalkeeping || 40;
    const overall = (att + def + gk) / 3;
    return { att, def, gk, overall };
  };
  const hTactic = TacticRepository.getById(hLineup.tacticId);
  const aTactic = TacticRepository.getById(aLineup.tacticId);
  const homeCoachProfile = getPolishCupCoachMatchProfile(homeCoach2);
  const awayCoachProfile = getPolishCupCoachMatchProfile(awayCoach2);
  const homeCoachXGMultiplier = clamp6(
    homeCoachProfile.attackingMultiplier / awayCoachProfile.defensiveMultiplier,
    0.92,
    1.08
  );
  const awayCoachXGMultiplier = clamp6(
    awayCoachProfile.attackingMultiplier / homeCoachProfile.defensiveMultiplier,
    0.92,
    1.08
  );
  const homeAdvantageBonus = isNeutralVenue ? 0 : 22e-4;
  const homeDailyForm = (rng() - 0.5) * 0.3;
  const awayDailyForm = (rng() - 0.5) * 0.3;
  const redCardMultiplier = (redCount) => {
    if (redCount === 0) return 1;
    if (redCount === 1) return 0.6;
    if (redCount === 2) return 0.34;
    return 0.18;
  };
  const shortHandedGoalChance = (redCount) => {
    if (redCount >= 2) return 1e-3;
    if (redCount === 1) return 0.28;
    return 1;
  };
  const computeMinuteXG = () => {
    const hStr = getTeamStrength(hPlayers, homeXI);
    const aStr = getTeamStrength(aPlayers, awayXI);
    const baseXG = 0.014;
    const ATTR_FLOOR = 20;
    const homeAttEff = Math.max(ATTR_FLOOR, hStr.att) / Math.max(ATTR_FLOOR, aStr.def);
    const awayAttEff = Math.max(ATTR_FLOOR, aStr.att) / Math.max(ATTR_FLOOR, hStr.def);
    const avgAttEff = (homeAttEff + awayAttEff) / 2;
    const homeStrMult = Math.pow(homeAttEff / avgAttEff, 1.5);
    const awayStrMult = Math.pow(awayAttEff / avgAttEff, 1.5);
    const REP_FLOOR = 1;
    const repRatio = Math.pow(
      Math.max(REP_FLOOR, home.reputation) / Math.max(REP_FLOOR, away.reputation),
      0.3
    );
    const homeTacticBonus = (hTactic.attackBias - 50) / 5e3;
    const awayTacticBonus = (aTactic.attackBias - 50) / 5e3;
    const homeXGBase = baseXG * homeStrMult * repRatio + homeTacticBonus + homeAdvantageBonus + homeDailyForm * 2e-3;
    const awayXGBase = baseXG * awayStrMult / repRatio + awayTacticBonus + awayDailyForm * 2e-3;
    const homeXGAfterRed = homeXGBase * redCardMultiplier(homeRedCount) * (1 + awayRedCount * 0.28);
    const awayXGAfterRed = awayXGBase * redCardMultiplier(awayRedCount) * (1 + homeRedCount * 0.28);
    const homeXGWeather = homeXGAfterRed * weatherEqualizer * homeCoachXGMultiplier;
    const awayXGWeather = awayXGAfterRed * weatherEqualizer * awayCoachXGMultiplier;
    const formImpact = TeamFormImpactService.calculateMatchImpact(
      hPlayers,
      aPlayers,
      { ...hLineup, startingXI: homeXI },
      { ...aLineup, startingXI: awayXI }
    );
    return {
      home: Math.max(3e-3, homeXGWeather * formImpact.homeGoalChanceMultiplier),
      away: Math.max(3e-3, awayXGWeather * formImpact.awayGoalChanceMultiplier)
    };
  };
  const getChaosChance = () => {
    const hStr = getTeamStrength(hPlayers, homeXI);
    const aStr = getTeamStrength(aPlayers, awayXI);
    const strengthDiff = Math.abs(hStr.overall - aStr.overall);
    const DIFF_MAX = 25;
    const equalness = Math.max(0, 1 - strengthDiff / DIFF_MAX);
    const minChaos = 0.02 + equalness * 0.08;
    const maxChaos = 0.1 + equalness * 0.1;
    return (minChaos + rng() * (maxChaos - minChaos)) * experienceFactor;
  };
  const experienceFactor = 1 + (50 - (referee.experience || 50)) / 100;
  const getSaturationFactor = () => {
    const totalGoals = homeGoals + awayGoals;
    if (totalGoals <= 3) return 1;
    if (totalGoals === 4) return 0.6;
    if (totalGoals === 5) return 0.4;
    if (totalGoals === 6) return 0.28;
    if (totalGoals === 7) return 0.18;
    return 0.1;
  };
  const pickScorer = (players, xi, isHome) => {
    const activeIds = xi.filter((id) => id !== null);
    return GoalAttributionService.pickScorer(players, activeIds, false, rng);
  };
  const pickAssistant = (players, xi, scorerId) => {
    const activeIds = xi.filter((id) => id !== null);
    return GoalAttributionService.pickAssistant(players, activeIds, scorerId, false, rng);
  };
  const maybeGiveCard = (minute) => {
    const strictnessFactor = 1 + (referee.strictness - 50) / 100;
    const decisionFactor = 1 + (referee.consistency - 50) / 200;
    const YELLOW_CHANCE = 8e-3 * strictnessFactor * decisionFactor;
    const RED_DIRECT_CHANCE = 1e-3 * strictnessFactor * decisionFactor;
    for (const [side, xi, players] of [
      ["HOME", homeXI, hPlayers],
      ["AWAY", awayXI, aPlayers]
    ]) {
      const activeIds = xi.filter((id) => id !== null);
      if (activeIds.length === 0) continue;
      if (rng() < RED_DIRECT_CHANCE) {
        const victimId = activeIds[Math.floor(rng() * activeIds.length)];
        cards.push({ playerId: victimId, type: "RED_CARD" /* RED_CARD */, minute });
        if (side === "HOME") {
          homeXI = homeXI.map((id) => id === victimId ? null : id);
          homeRedCount++;
        } else {
          awayXI = awayXI.map((id) => id === victimId ? null : id);
          awayRedCount++;
        }
      } else if (rng() < YELLOW_CHANCE) {
        const victimId = activeIds[Math.floor(rng() * activeIds.length)];
        const existingYellows = cards.filter(
          (c) => c.playerId === victimId && c.type === "YELLOW_CARD" /* YELLOW_CARD */
        ).length;
        cards.push({ playerId: victimId, type: "YELLOW_CARD" /* YELLOW_CARD */, minute });
        if (existingYellows >= 1) {
          cards.push({ playerId: victimId, type: "RED_CARD" /* RED_CARD */, minute });
          if (side === "HOME") {
            homeXI = homeXI.map((id) => id === victimId ? null : id);
            homeRedCount++;
          } else {
            awayXI = awayXI.map((id) => id === victimId ? null : id);
            awayRedCount++;
          }
        }
      }
    }
  };
  const maybeGiveInjury = (minute) => {
    const experienceFactor2 = 1 + (50 - (referee.experience || 50)) / 100;
    const INJURY_CHANCE = 3e-3 * experienceFactor2;
    const sides = [
      [hPlayers, homeXI],
      [aPlayers, awayXI]
    ];
    for (const [players, xi] of sides) {
      if (rng() < INJURY_CHANCE) {
        const activeIds = xi.filter((id) => id !== null);
        if (activeIds.length === 0) continue;
        const healthyIds = activeIds.filter((id) => !injuries.find((inj) => inj.playerId === id));
        if (healthyIds.length === 0) continue;
        const victimId = healthyIds[Math.floor(rng() * healthyIds.length)];
        const isSevere = rng() < 0.15;
        const severity = isSevere ? "SEVERE" /* SEVERE */ : "LIGHT" /* LIGHT */;
        const { days, type } = rollInjuryBySeverity(severity, rng);
        injuries.push({
          playerId: victimId,
          minute,
          severity,
          days,
          type
        });
      }
    }
  };
  const maybeMakeSubstitution = (minute) => {
    const sides = [
      [hPlayers, hLineup, homeXI, home.id, (next) => {
        homeXI = next;
      }],
      [aPlayers, aLineup, awayXI, away.id, (next) => {
        awayXI = next;
      }]
    ];
    for (const [players, lineup, xi, teamId, setXi] of sides) {
      const activeIds = xi.filter((id) => !!id);
      const replacement = (lineup.bench ?? []).map((id) => players.find((player) => player.id === id)).filter((player) => !!player && !activeIds.includes(player.id) && player.condition >= 60).sort((a, b) => b.condition - a.condition)[0];
      const outgoing = xi.map((id, index) => ({ id, index, player: players.find((candidate) => candidate.id === id) })).filter((entry) => entry.index > 0 && !!entry.id && !!entry.player).sort((a, b) => (a.player?.condition ?? 100) - (b.player?.condition ?? 100))[0];
      if (!replacement || !outgoing?.id || !outgoing.player) continue;
      const nextXi = [...xi];
      nextXi[outgoing.index] = replacement.id;
      setXi(nextXi);
      substitutions.push({
        playerOutId: outgoing.player.id,
        playerOutName: formatPlayerReportName(outgoing.player),
        playerInId: replacement.id,
        playerInName: formatPlayerReportName(replacement),
        minute,
        teamId
      });
    }
  };
  const computeFatigue = (players, xi) => {
    xi.forEach((pId) => {
      if (!pId) return;
      const p = players.find((x) => x.id === pId);
      if (!p) return;
      const stamina = p.attributes.stamina || 50;
      const stamEff = Math.pow((100 - stamina) / 100, 1.2) * 10;
      let drain = 2.5 + rng() * 1.5 + stamEff * 0.5 + 1.5;
      if (p.position === "GK" /* GK */) drain *= 0.75 + stamina / 100 * 0.1;
      fatigue[pId] = drain;
      const gkDebtFactor = p.position === "GK" /* GK */ ? Math.max(0.7, Math.min(0.9, 0.75 + Math.max(0, (p.age - 27) * 4e-3) - stamina / 100 * 0.05)) : 1;
      fatigueDebtMap[pId] = (5 + (100 - stamina) * 0.15) * gkDebtFactor;
    });
  };
  const simulateMinutes = (fromMinute, toMinute) => {
    for (let minute = fromMinute; minute <= toMinute; minute++) {
      if (minute === 60 || minute === 75 || minute === 105) maybeMakeSubstitution(minute);
      maybeGiveCard(minute);
      maybeGiveInjury(minute);
      const xg = computeMinuteXG();
      const chaos = getChaosChance();
      const saturation = getSaturationFactor();
      const homeChance = xg.home * saturation * shortHandedGoalChance(homeRedCount) * (1 + (rng() < chaos ? rng() * 0.1 : 0));
      if (rng() < homeChance) {
        let goalMin = minute;
        while (usedGoalMinutes.has(goalMin) && goalMin <= toMinute + 5) goalMin++;
        usedGoalMinutes.add(goalMin);
        const scorer = pickScorer(hPlayers, homeXI, true);
        if (!scorer) {
          homeGoals++;
          continue;
        }
        const assistant = pickAssistant(hPlayers, homeXI, scorer.id);
        const isPenalty = rng() < 0.08;
        scorers.push({ playerId: scorer.id, assistId: assistant?.id, minute: goalMin, isPenalty });
        homeGoals++;
      }
      const awayChance = xg.away * saturation * shortHandedGoalChance(awayRedCount) * (1 + (rng() < chaos ? rng() * 0.1 : 0));
      if (rng() < awayChance) {
        let goalMin = minute;
        while (usedGoalMinutes.has(goalMin) && goalMin <= toMinute + 5) goalMin++;
        usedGoalMinutes.add(goalMin);
        const scorer = pickScorer(aPlayers, awayXI, false);
        if (!scorer) {
          awayGoals++;
          continue;
        }
        const assistant = pickAssistant(aPlayers, awayXI, scorer.id);
        const isPenalty = rng() < 0.08;
        scorers.push({ playerId: scorer.id, assistId: assistant?.id, minute: goalMin, isPenalty });
        awayGoals++;
      }
    }
  };
  simulateMinutes(1, 90);
  computeFatigue(hPlayers, hLineup.startingXI);
  computeFatigue(aPlayers, aLineup.startingXI);
  let wentToExtraTime = false;
  if (homeGoals === awayGoals) {
    wentToExtraTime = true;
    simulateMinutes(91, 120);
  }
  let penaltyHome;
  let penaltyAway;
  if (homeGoals === awayGoals) {
    const simulatePenaltySeries = (shooters, shooterXI, keeper, coachProfile) => {
      const activeShooters = shooterXI.filter((id) => id !== null).map((id) => shooters.find((p) => p.id === id)).filter((p) => !!p).slice(0, 5);
      let scored = 0;
      for (const shooter of activeShooters) {
        const finishing = shooter.attributes.finishing || 50;
        const keeperSave = keeper?.attributes.goalkeeping || 50;
        const penChance = 0.75 + (finishing - keeperSave) / 200 + coachProfile.penaltyAdjustment;
        if (rng() < Math.min(0.95, Math.max(0.4, penChance))) {
          scored++;
        }
      }
      return scored;
    };
    const homeGK = hPlayers.find((p) => p.id === homeXI[0]);
    const awayGK = aPlayers.find((p) => p.id === awayXI[0]);
    penaltyHome = simulatePenaltySeries(hPlayers, homeXI, awayGK, homeCoachProfile);
    penaltyAway = simulatePenaltySeries(aPlayers, awayXI, homeGK, awayCoachProfile);
    while (penaltyHome === penaltyAway) {
      const hShooter = hPlayers.find((p) => homeXI.includes(p.id) && p.position !== "GK" /* GK */);
      const aShooter = aPlayers.find((p) => awayXI.includes(p.id) && p.position !== "GK" /* GK */);
      const hFinishing = hShooter?.attributes.finishing || 50;
      const aFinishing = aShooter?.attributes.finishing || 50;
      const hSave = awayGK?.attributes.goalkeeping || 50;
      const aSave = homeGK?.attributes.goalkeeping || 50;
      const hScored = rng() < Math.min(0.95, Math.max(0.4, 0.75 + (hFinishing - hSave) / 200 + homeCoachProfile.penaltyAdjustment));
      const aScored = rng() < Math.min(0.95, Math.max(0.4, 0.75 + (aFinishing - aSave) / 200 + awayCoachProfile.penaltyAdjustment));
      if (hScored && !aScored) penaltyHome += 1;
      else if (!hScored && aScored) penaltyAway += 1;
    }
  }
  return {
    homeScore: homeGoals,
    awayScore: awayGoals,
    scorers,
    cards,
    injuries,
    substitutions,
    fatigue,
    fatigueDebtMap,
    penaltyHome,
    penaltyAway,
    wentToExtraTime,
    referee
  };
};
var BackgroundMatchProcessorPolishCup = {
  processCupEvent: (currentDate, userTeamId, fixtures, clubs, playersMap, lineups, careerSeed, seasonNumber, coaches2 = {}) => {
    const dateStr = currentDate.toDateString();
    const clubIds = new Set(clubs.map((club) => club.id));
    const hasBrokenCupFixtureToday = fixtures.some(
      (fixture2) => fixture2.date.toDateString() === dateStr && fixture2.status === "SCHEDULED" /* SCHEDULED */ && (fixture2.leagueId === "POLISH_CUP" /* POLISH_CUP */ || fixture2.leagueId === "SUPER_CUP" /* SUPER_CUP */) && (!clubIds.has(fixture2.homeTeamId) || !clubIds.has(fixture2.awayTeamId))
    );
    const repairedFixtures = hasBrokenCupFixtureToday ? fixtures.map((fixture2) => {
      const isTodayCupFixture = fixture2.date.toDateString() === dateStr && fixture2.status === "SCHEDULED" /* SCHEDULED */ && (fixture2.leagueId === "POLISH_CUP" /* POLISH_CUP */ || fixture2.leagueId === "SUPER_CUP" /* SUPER_CUP */);
      if (!isTodayCupFixture) return fixture2;
      const homeExists = clubIds.has(fixture2.homeTeamId);
      const awayExists = clubIds.has(fixture2.awayTeamId);
      if (homeExists && awayExists) return fixture2;
      const advancingClubId = homeExists ? fixture2.homeTeamId : awayExists ? fixture2.awayTeamId : POLISH_CUP_BYE_TEAM_ID;
      return {
        ...fixture2,
        homeTeamId: advancingClubId,
        awayTeamId: POLISH_CUP_BYE_TEAM_ID,
        homeScore: homeExists || awayExists ? 1 : 0,
        awayScore: 0,
        status: "FINISHED" /* FINISHED */
      };
    }) : fixtures;
    const todayCupFixtures = repairedFixtures.filter(
      (f) => f.date.toDateString() === dateStr && f.status === "SCHEDULED" /* SCHEDULED */ && (f.leagueId === "POLISH_CUP" /* POLISH_CUP */ || f.leagueId === "SUPER_CUP" /* SUPER_CUP */) && f.homeTeamId !== userTeamId && f.awayTeamId !== userTeamId && clubIds.has(f.homeTeamId) && clubIds.has(f.awayTeamId)
    );
    if (todayCupFixtures.length === 0) {
      return { updatedFixtures: repairedFixtures, updatedPlayers: playersMap, updatedLineups: lineups, updatedClubs: clubs };
    }
    let currentFixtures = [...repairedFixtures];
    let currentPlayers = { ...playersMap };
    let currentClubs = [...clubs];
    const newLineups = { ...lineups };
    todayCupFixtures.forEach((fixture2) => {
      const home = currentClubs.find((club) => club.id === fixture2.homeTeamId);
      const away = currentClubs.find((club) => club.id === fixture2.awayTeamId);
      if (!home || !away) return;
      const prepare = (club, opponent, isHome) => {
        const squad = currentPlayers[club.id] ?? [];
        if (squad.length === 0) return null;
        const coach = AiMatchPreparationService.getClubCoach(club, coaches2);
        return AiMatchPreparationService.prepareTeamForMatch(
          club,
          opponent,
          squad,
          coach,
          fixture2,
          isHome,
          `${fixture2.id}_${club.id}_polish_cup_background`,
          void 0,
          true
        );
      };
      const homeLineup2 = prepare(home, away, true);
      const awayLineup = prepare(away, home, false);
      if (homeLineup2) newLineups[home.id] = homeLineup2;
      if (awayLineup) newLineups[away.id] = awayLineup;
    });
    todayCupFixtures.forEach((fixture2) => {
      const home = currentClubs.find((c) => c.id === fixture2.homeTeamId);
      const away = currentClubs.find((c) => c.id === fixture2.awayTeamId);
      if (!home || !away) return;
      const hPlayers = currentPlayers[home.id] || [];
      const aPlayers = currentPlayers[away.id] || [];
      const hLineup = newLineups[home.id];
      const aLineup = newLineups[away.id];
      const homeCoach2 = AiMatchPreparationService.getClubCoach(home, coaches2);
      const awayCoach2 = AiMatchPreparationService.getClubCoach(away, coaches2);
      if (!hLineup || !aLineup) return;
      const clubSalt = home.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const matchHash = fixture2.id.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
      const seed = matchHash ^ clubSalt ^ (currentDate.getTime() / 1e3 | 0) ^ careerSeed;
      const weatherSeed = `${fixture2.id}_${currentDate.getTime()}`;
      const weather = PolandWeatherService.getWeather(currentDate, weatherSeed);
      const isBadWeather = weather.precipitationChance > 50 || weather.tempC < 2;
      const weatherEqualizer = isBadWeather ? 0.82 : 1;
      const venue = PolishCupVenueService.getVenue(fixture2, home);
      const isNeutralVenue = venue.isNeutral;
      const result2 = simulateCupMatch(
        home,
        away,
        hPlayers,
        aPlayers,
        hLineup,
        aLineup,
        homeCoach2,
        awayCoach2,
        seed,
        weatherEqualizer,
        isNeutralVenue
      );
      const finalHomeScore = result2.homeScore;
      const finalAwayScore = result2.awayScore;
      const penaltyHome = result2.penaltyHome;
      const penaltyAway = result2.penaltyAway;
      const allMatchPlayers = hPlayers.concat(aPlayers);
      const getPlayerName = (playerId) => {
        const player = allMatchPlayers.find((candidate) => candidate.id === playerId);
        return player ? formatPlayerReportName(player) : "Nieznany";
      };
      const goals = result2.scorers.map((s) => {
        const player = allMatchPlayers.find((candidate) => candidate.id === s.playerId);
        const assistant = s.assistId ? allMatchPlayers.find((candidate) => candidate.id === s.assistId) : void 0;
        return {
          playerId: s.playerId,
          playerName: getPlayerName(s.playerId),
          minute: s.minute,
          teamId: player?.clubId ?? "?",
          isPenalty: !!s.isPenalty,
          assistantId: assistant?.id,
          assistantName: assistant ? getPlayerName(assistant.id) : void 0
        };
      });
      const yellowCounts = {};
      const cards = [];
      result2.cards.forEach((card) => {
        if (card.type === "YELLOW_CARD" /* YELLOW_CARD */) {
          yellowCounts[card.playerId] = (yellowCounts[card.playerId] || 0) + 1;
          cards.push({
            playerId: card.playerId,
            playerName: getPlayerName(card.playerId),
            minute: card.minute,
            teamId: allMatchPlayers.find((candidate) => candidate.id === card.playerId)?.clubId ?? "?",
            type: yellowCounts[card.playerId] === 2 ? "SECOND_YELLOW" : "YELLOW"
          });
          return;
        }
        const isDuplicateSecondYellow = result2.cards.some(
          (candidate) => candidate.playerId === card.playerId && candidate.minute === card.minute && candidate.type === "YELLOW_CARD" /* YELLOW_CARD */
        );
        if (!isDuplicateSecondYellow) {
          cards.push({
            playerId: card.playerId,
            playerName: getPlayerName(card.playerId),
            minute: card.minute,
            teamId: allMatchPlayers.find((candidate) => candidate.id === card.playerId)?.clubId ?? "?",
            type: "RED"
          });
        }
      });
      const injuries = result2.injuries.map((injury) => ({
        playerId: injury.playerId,
        playerName: getPlayerName(injury.playerId),
        minute: injury.minute,
        teamId: allMatchPlayers.find((candidate) => candidate.id === injury.playerId)?.clubId ?? "?",
        severity: injury.severity,
        days: injury.days,
        type: injury.type
      }));
      const allStarters = [
        ...hLineup.startingXI.filter((id) => !!id),
        ...aLineup.startingXI.filter((id) => !!id)
      ];
      const ratings = Object.fromEntries(allStarters.map((id, index) => [id, 6.1 + (seed + index * 17) % 18 / 10]));
      const attendance = Math.round(venue.capacity * Math.min(0.98, 0.72 + (home.reputation + away.reputation) * 0.018));
      RefereeService.recordMatchStats(
        result2.referee.id,
        RefereeService.generateMatchRating(result2.referee),
        cards.filter((card) => card.type === "YELLOW" || card.type === "SECOND_YELLOW").length,
        cards.filter((card) => card.type === "RED" || card.type === "SECOND_YELLOW").length
      );
      MatchHistoryService.logMatch({
        matchId: fixture2.id,
        date: currentDate.toDateString(),
        competition: fixture2.leagueId,
        homeTeamId: home.id,
        season: seasonNumber,
        awayTeamId: away.id,
        homeScore: finalHomeScore,
        awayScore: finalAwayScore,
        homePenaltyScore: penaltyHome,
        awayPenaltyScore: penaltyAway,
        isExtraTime: result2.wentToExtraTime,
        attendance,
        venue: venue.name,
        weather,
        goals,
        cards,
        substitutions: result2.substitutions,
        injuries,
        timeline: [],
        refereeName: `${result2.referee.firstName} ${result2.referee.lastName}`,
        homeLineup: hLineup.startingXI.filter((id) => !!id),
        awayLineup: aLineup.startingXI.filter((id) => !!id),
        ratings,
        homeStartingTacticId: hLineup.tacticId,
        awayStartingTacticId: aLineup.tacticId,
        homeTacticId: hLineup.tacticId,
        awayTacticId: aLineup.tacticId,
        kits: KitSelectionService.selectOptimalKits(home, away)
      });
      currentFixtures = currentFixtures.map((f) => f.id === fixture2.id ? {
        ...f,
        homeScore: finalHomeScore,
        awayScore: finalAwayScore,
        homePenaltyScore: penaltyHome,
        awayPenaltyScore: penaltyAway,
        status: "FINISHED" /* FINISHED */
      } : f);
      const isHomeWinner = penaltyHome !== void 0 ? penaltyHome > penaltyAway : finalHomeScore > finalAwayScore;
      currentClubs = currentClubs.map((c) => {
        if (c.id === home.id) return { ...c, isInPolishCup: isHomeWinner };
        if (c.id === away.id) return { ...c, isInPolishCup: !isHomeWinner };
        return c;
      });
      const totalMinutes = result2.wentToExtraTime ? 120 : 90;
      const getMinutesPlayedMap = (lineup, teamId) => {
        const minutesMap = Object.fromEntries(
          lineup.startingXI.filter((id) => !!id).map((id) => [id, totalMinutes])
        );
        result2.substitutions.filter((substitution) => substitution.teamId === teamId).sort((a, b) => a.minute - b.minute).forEach((substitution) => {
          const remainingMinutes = Math.max(0, totalMinutes - substitution.minute);
          if (substitution.playerOutId) {
            minutesMap[substitution.playerOutId] = Math.max(0, (minutesMap[substitution.playerOutId] ?? totalMinutes) - remainingMinutes);
          }
          if (substitution.playerInId) {
            minutesMap[substitution.playerInId] = (minutesMap[substitution.playerInId] ?? 0) + remainingMinutes;
          }
        });
        return minutesMap;
      };
      const homeMinutesPlayed = getMinutesPlayedMap(hLineup, home.id);
      const awayMinutesPlayed = getMinutesPlayedMap(aLineup, away.id);
      const emptyS = () => ({ goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] });
      for (const [cId, minutesMap] of [[home.id, homeMinutesPlayed], [away.id, awayMinutesPlayed]]) {
        currentPlayers[cId] = currentPlayers[cId].map((p) => {
          const minutesPlayed = minutesMap[p.id];
          if (minutesPlayed === void 0) return p;
          const cup = { ...p.cupStats ?? emptyS() };
          cup.matchesPlayed += 1;
          cup.minutesPlayed += minutesPlayed;
          return { ...p, cupStats: cup };
        });
      }
      for (const cId of [home.id, away.id]) {
        currentPlayers[cId] = currentPlayers[cId].map((p) => ({
          ...p,
          cupSuspensionMatches: Math.max(0, (p.cupSuspensionMatches ?? 0) - 1)
        }));
      }
      result2.scorers.forEach((s) => {
        for (const cId of Object.keys(currentPlayers)) {
          currentPlayers[cId] = currentPlayers[cId].map((p) => {
            if (p.id === s.playerId) return { ...p, cupStats: { ...p.cupStats ?? emptyS(), goals: (p.cupStats?.goals ?? 0) + 1 } };
            if (s.assistId && p.id === s.assistId) return { ...p, cupStats: { ...p.cupStats ?? emptyS(), assists: (p.cupStats?.assists ?? 0) + 1 } };
            return p;
          });
        }
      });
      result2.cards.forEach((card) => {
        for (const cId of Object.keys(currentPlayers)) {
          currentPlayers[cId] = currentPlayers[cId].map((p) => {
            if (p.id !== card.playerId) return p;
            const cup = { ...p.cupStats ?? emptyS() };
            let cupSusp = p.cupSuspensionMatches ?? 0;
            if (card.type === "YELLOW_CARD" /* YELLOW_CARD */) {
              cup.yellowCards += 1;
              if (cup.yellowCards % 4 === 0) cupSusp += 1;
            }
            if (card.type === "RED_CARD" /* RED_CARD */) {
              cup.redCards += 1;
              const isSecondYellow = result2.cards.some(
                (candidate) => candidate.playerId === card.playerId && candidate.minute === card.minute && candidate.type === "YELLOW_CARD" /* YELLOW_CARD */
              );
              cupSusp += isSecondYellow ? 2 : 3;
            }
            return { ...p, cupStats: cup, cupSuspensionMatches: cupSusp };
          });
        }
      });
      for (const clubId of [home.id, away.id]) {
        currentPlayers[clubId] = currentPlayers[clubId].map((p) => {
          let updatedP = { ...p };
          if (result2.fatigue[p.id] !== void 0) {
            updatedP.condition = Math.max(0, updatedP.condition - result2.fatigue[p.id]);
          }
          if (result2.fatigueDebtMap[p.id]) {
            updatedP.fatigueDebt = Math.min(100, (updatedP.fatigueDebt || 0) + result2.fatigueDebtMap[p.id]);
          }
          const maxCap = 100 - (updatedP.fatigueDebt || 0);
          updatedP.condition = Math.min(maxCap, updatedP.condition);
          const injury = result2.injuries.find((inj) => inj.playerId === p.id);
          if (injury) {
            const injSeed = (seed + p.id.charCodeAt(0)) % 15;
            const basePenalty = injury.severity === "SEVERE" /* SEVERE */ ? 55 : 20;
            const condAfterPenalty = Math.max(0, updatedP.condition - (basePenalty + injSeed));
            updatedP.health = {
              status: "INJURED" /* INJURED */,
              injury: {
                type: injury.type,
                daysRemaining: injury.days,
                severity: injury.severity,
                injuryDate: currentDate.toISOString(),
                totalDays: injury.days,
                conditionAtInjury: condAfterPenalty
              }
            };
            updatedP.condition = condAfterPenalty;
          }
          return updatedP;
        });
      }
    });
    return {
      updatedFixtures: currentFixtures,
      updatedPlayers: currentPlayers,
      updatedLineups: newLineups,
      updatedClubs: currentClubs
    };
  }
};

// tests/PolishCupAiCoachPreparationTests.ts
var makePlayer = (clubId, id, position, level) => ({
  id,
  clubId,
  firstName: "Test",
  lastName: id,
  position,
  overallRating: level,
  condition: 100,
  morale: 75,
  suspensionMatches: 0,
  cupSuspensionMatches: 0,
  euroSuspensionMatches: 0,
  health: { status: "HEALTHY" /* HEALTHY */ },
  stats: { matchesPlayed: 0, minutesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, seasonalChanges: {}, ratingHistory: [] },
  attributes: {
    strength: level,
    stamina: level,
    pace: level,
    acceleration: level,
    defending: level,
    passing: level,
    attacking: level,
    finishing: level,
    technique: level,
    vision: level,
    dribbling: level,
    heading: level,
    positioning: level,
    goalkeeping: level,
    freeKicks: level,
    talent: level,
    penalties: level,
    corners: level,
    aggression: level,
    crossing: level,
    leadership: level,
    mentality: level,
    workRate: level
  }
});
var makeCoach = (id, clubId, quality, tactics) => ({
  id,
  firstName: "Coach",
  lastName: id,
  age: 48,
  nationality: "Polska",
  nationalityFlag: "PL",
  currentClubId: clubId,
  hiredDate: "2025-07-01",
  contractEndDate: "2027-06-30",
  annualSalary: 1,
  expPoints: 100,
  blacklist: {},
  attributes: { experience: quality, decisionMaking: quality, motivation: quality, training: quality },
  favoriteTactics: tactics,
  history: [],
  seasonStats: []
});
var homeClub = {
  id: "POLISH_CUP_HOME",
  name: "Pucharowi Gospodarze",
  coachId: "POLISH_CUP_HOME_COACH",
  leagueId: "L_PL_1",
  reputation: 10,
  stadiumName: "Stadion Testowy",
  stadiumCapacity: 2e4,
  stats: {}
};
var awayClub = {
  id: "POLISH_CUP_AWAY",
  name: "Pucharowi Go\u015Bcie",
  coachId: "POLISH_CUP_AWAY_COACH",
  leagueId: "L_PL_2",
  reputation: 5,
  stadiumName: "Stadion Go\u015Bci",
  stadiumCapacity: 1e4,
  stats: {}
};
var homeCoach = makeCoach(homeClub.coachId, homeClub.id, 90, {
  offensive: "4-3-3 Atak",
  neutral: "4-2-3-1",
  defensive: "5-4-1"
});
var awayCoach = makeCoach(awayClub.coachId, awayClub.id, 70, {
  offensive: "4-3-3 Atak",
  neutral: "4-4-2",
  defensive: "5-4-1"
});
var coaches = { [homeCoach.id]: homeCoach, [awayCoach.id]: awayCoach };
var homePlayers = [
  makePlayer(homeClub.id, "home_gk_1", "GK" /* GK */, 82),
  makePlayer(homeClub.id, "home_gk_2", "GK" /* GK */, 76),
  ...Array.from({ length: 4 }, (_, index) => makePlayer(homeClub.id, `home_def_${index}`, "DEF" /* DEF */, 80 - index)),
  ...Array.from({ length: 6 }, (_, index) => makePlayer(homeClub.id, `home_mid_${index}`, "MID" /* MID */, 81 - index)),
  makePlayer(homeClub.id, "home_fwd_fit", "FWD" /* FWD */, 80),
  { ...makePlayer(homeClub.id, "home_fwd_cup_suspended", "FWD" /* FWD */, 90), cupSuspensionMatches: 1 },
  {
    ...makePlayer(homeClub.id, "home_fwd_injured", "FWD" /* FWD */, 90),
    health: {
      status: "INJURED" /* INJURED */,
      injury: {
        type: "Test injury",
        daysRemaining: 20,
        totalDays: 20,
        injuryDate: "2025-08-01",
        severity: "SEVERE" /* SEVERE */
      }
    }
  },
  { ...makePlayer(homeClub.id, "home_fwd_unfit", "FWD" /* FWD */, 90), condition: 40 }
];
var awayPlayers = [
  makePlayer(awayClub.id, "away_gk_1", "GK" /* GK */, 72),
  makePlayer(awayClub.id, "away_gk_2", "GK" /* GK */, 68),
  ...Array.from({ length: 6 }, (_, index) => makePlayer(awayClub.id, `away_def_${index}`, "DEF" /* DEF */, 70 - index)),
  ...Array.from({ length: 6 }, (_, index) => makePlayer(awayClub.id, `away_mid_${index}`, "MID" /* MID */, 70 - index)),
  ...Array.from({ length: 2 }, (_, index) => makePlayer(awayClub.id, `away_fwd_${index}`, "FWD" /* FWD */, 70 - index))
];
var fixture = {
  id: "POLISH_CUP_AI_COACH_TEST",
  leagueId: "POLISH_CUP" /* POLISH_CUP */,
  homeTeamId: homeClub.id,
  awayTeamId: awayClub.id,
  date: new Date(2025, 7, 10),
  status: "SCHEDULED" /* SCHEDULED */,
  homeScore: null,
  awayScore: null
};
MatchHistoryService.clear();
var result = BackgroundMatchProcessorPolishCup.processCupEvent(
  new Date(fixture.date),
  null,
  [fixture],
  [homeClub, awayClub],
  { [homeClub.id]: homePlayers, [awayClub.id]: awayPlayers },
  {},
  123456,
  1,
  coaches
);
var homeLineup = result.updatedLineups[homeClub.id];
import_node_assert.strict.ok(homeLineup, "trener gospodarzy musi przygotowa\u0107 sk\u0142ad na mecz pucharowy");
import_node_assert.strict.equal(homeLineup.tacticId, "4-2-3-1", "brak dost\u0119pnych napastnik\xF3w musi odrzuci\u0107 ulubione 4-3-3 i wybra\u0107 wykonalne 4-2-3-1");
import_node_assert.strict.equal(homeLineup.startingXI.filter(Boolean).length, 11, "trener musi wystawi\u0107 pe\u0142n\u0105 jedenastk\u0119");
import_node_assert.strict.equal(homeLineup.startingXI.includes("home_fwd_cup_suspended"), false, "zawieszenie pucharowe musi wykluczy\u0107 zawodnika");
import_node_assert.strict.equal(homeLineup.startingXI.includes("home_fwd_injured"), false, "powa\u017Cna kontuzja musi wykluczy\u0107 zawodnika");
import_node_assert.strict.equal(homeLineup.startingXI.includes("home_fwd_unfit"), false, "zbyt niska kondycja musi wykluczy\u0107 zawodnika");
var tactic = TacticRepository.getById(homeLineup.tacticId);
homeLineup.startingXI.forEach((playerId, slotIndex) => {
  const player = homePlayers.find((candidate) => candidate.id === playerId);
  import_node_assert.strict.ok(player, `slot ${slotIndex} musi zawiera\u0107 zawodnika gospodarzy`);
  import_node_assert.strict.equal(player?.position, tactic.slots[slotIndex].role, `slot ${slotIndex} musi by\u0107 obsadzony naturaln\u0105 pozycj\u0105`);
});
var report = MatchHistoryService.getAll().find((entry) => entry.matchId === fixture.id);
import_node_assert.strict.ok(report, "mecz Pucharu Polski w tle musi utworzy\u0107 raport");
import_node_assert.strict.equal(report?.homeStartingTacticId, "4-2-3-1", "raport musi zapisa\u0107 rzeczywist\u0105 formacj\u0119 startow\u0105 trenera");
import_node_assert.strict.equal(report?.homeTacticId, "4-2-3-1", "raport nie mo\u017Ce wr\xF3ci\u0107 do domy\u015Blnego 4-4-2");
var brokenByeFixture = {
  ...fixture,
  id: "POLISH_CUP_BROKEN_BYE_TEST",
  date: new Date(2025, 8, 14),
  awayTeamId: void 0
};
var byeHomeClub = { ...homeClub, isInPolishCup: true };
var brokenByeResult = BackgroundMatchProcessorPolishCup.processCupEvent(
  new Date(brokenByeFixture.date),
  null,
  [brokenByeFixture],
  [byeHomeClub, awayClub],
  { [homeClub.id]: homePlayers, [awayClub.id]: awayPlayers },
  {},
  123456,
  1,
  coaches
);
var repairedByeFixture = brokenByeResult.updatedFixtures[0];
import_node_assert.strict.equal(repairedByeFixture.status, "FINISHED" /* FINISHED */, "niepe\u0142na para musi zosta\u0107 zamkni\u0119ta jako wolny los");
import_node_assert.strict.equal(repairedByeFixture.homeTeamId, homeClub.id, "istniej\u0105cy klub musi pozosta\u0107 zwyci\u0119zc\u0105 wolnego losu");
import_node_assert.strict.equal(repairedByeFixture.awayTeamId, POLISH_CUP_BYE_TEAM_ID, "brakuj\u0105cy identyfikator musi zosta\u0107 zast\u0105piony stabilnym znacznikiem");
import_node_assert.strict.equal(repairedByeFixture.homeScore, 1, "wolny los musi mie\u0107 techniczny wynik pozwalaj\u0105cy zamkn\u0105\u0107 terminarz");
import_node_assert.strict.equal(brokenByeResult.updatedClubs.find((club) => club.id === homeClub.id)?.isInPolishCup, true, "wolny los nie mo\u017Ce wyeliminowa\u0107 istniej\u0105cego klubu");
import_node_assert.strict.equal(MatchHistoryService.getAll().some((entry) => entry.matchId === brokenByeFixture.id), false, "wolny los nie mo\u017Ce tworzy\u0107 fikcyjnego raportu meczu");
var eliteProfile = getPolishCupCoachMatchProfile(homeCoach);
var weakProfile = getPolishCupCoachMatchProfile(makeCoach("WEAK_COACH", "WEAK_CLUB", 10, homeCoach.favoriteTactics));
import_node_assert.strict.ok(eliteProfile.attackingMultiplier > weakProfile.attackingMultiplier, "motywacja i trening lepszego trenera musz\u0105 wzmacnia\u0107 organizacj\u0119 ataku");
import_node_assert.strict.ok(eliteProfile.defensiveMultiplier > weakProfile.defensiveMultiplier, "decyzje i do\u015Bwiadczenie lepszego trenera musz\u0105 wzmacnia\u0107 organizacj\u0119 obrony");
import_node_assert.strict.ok(eliteProfile.penaltyAdjustment > weakProfile.penaltyAdjustment, "trener musi wp\u0142ywa\u0107 tak\u017Ce na przygotowanie serii rzut\xF3w karnych");
console.log("PolishCupAiCoachPreparationTests: OK");
