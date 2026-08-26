// tests/EuropeanBackgroundScoreDistributionTests.ts
var import_node_assert = require("node:assert");

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

// services/FinanceService.ts
var EUR_TO_PLN_NBP_2026 = 4.271;
var eurMillionsToPln = (amount) => Math.round(amount * EUR_TO_PLN_NBP_2026 * 1e6);
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

// services/PlayerMoraleService.ts
var DAY_MS = 24 * 60 * 60 * 1e3;

// services/PlayerAttributesGenerator.ts
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

// services/BackgroundMatchProcessorCL.ts
var makeSeededRng = (seed) => (offset) => {
  const x = Math.sin(seed + offset) * 1e4;
  return x - Math.floor(x);
};
var getEuropeanBackgroundProfile = (competitionId) => {
  const id = String(competitionId);
  const family = id.startsWith("CONF_") ? "CONF" : id.startsWith("EL_") ? "EL" : "CL";
  const stage = /_R[12]Q(?:_|$)/.test(id) ? "QUALIFYING" : id.includes("_GROUP_STAGE") ? "LEAGUE" : id.endsWith("_FINAL") ? "FINAL" : "KNOCKOUT";
  const isReturnLeg = id.endsWith("_RETURN");
  if (family === "CL") {
    return {
      family,
      stage,
      isReturnLeg,
      useLegacyChampionsLeagueModel: true,
      individualVariance: 0,
      quietMatchChance: 0,
      quietMatchMultiplier: 1,
      openMatchChance: 0,
      openMatchMultiplier: 1,
      upsetWindowChance: 0,
      collapseChance: 0,
      expectedGoalsCap: 3.8
    };
  }
  const isConference = family === "CONF";
  const stageSettings = {
    QUALIFYING: {
      individualVariance: isConference ? 0.24 : 0.21,
      quietMatchChance: 0.09,
      quietMatchMultiplier: 0.62,
      openMatchChance: isConference ? 0.075 : 0.065,
      openMatchMultiplier: isConference ? 1.44 : 1.4,
      upsetWindowChance: isConference ? 0.078 : 0.066,
      collapseChance: isConference ? 0.04 : 0.034,
      expectedGoalsCap: isConference ? 5.4 : 5.1
    },
    LEAGUE: {
      individualVariance: isConference ? 0.2 : 0.17,
      quietMatchChance: 0.1,
      quietMatchMultiplier: 0.64,
      openMatchChance: isConference ? 0.062 : 0.05,
      openMatchMultiplier: isConference ? 1.4 : 1.36,
      upsetWindowChance: isConference ? 0.066 : 0.055,
      collapseChance: isConference ? 0.03 : 0.023,
      expectedGoalsCap: isConference ? 4.9 : 4.6
    },
    KNOCKOUT: {
      individualVariance: isConference ? 0.17 : 0.15,
      quietMatchChance: 0.12,
      quietMatchMultiplier: 0.61,
      openMatchChance: isConference ? 0.05 : 0.04,
      openMatchMultiplier: isConference ? 1.36 : 1.32,
      upsetWindowChance: isConference ? 0.055 : 0.045,
      collapseChance: isConference ? 0.023 : 0.018,
      expectedGoalsCap: isConference ? 4.6 : 4.4
    },
    FINAL: {
      individualVariance: isConference ? 0.16 : 0.14,
      quietMatchChance: 0.13,
      quietMatchMultiplier: 0.6,
      openMatchChance: isConference ? 0.045 : 0.035,
      openMatchMultiplier: isConference ? 1.34 : 1.3,
      upsetWindowChance: isConference ? 0.05 : 0.04,
      collapseChance: isConference ? 0.02 : 0.015,
      expectedGoalsCap: isConference ? 4.4 : 4.2
    }
  };
  return {
    family,
    stage,
    isReturnLeg,
    useLegacyChampionsLeagueModel: false,
    ...stageSettings[stage]
  };
};
var sampleEuropeanBackgroundGoals = (expectedGoals, rng, offset) => {
  const lambda = Math.max(0.01, expectedGoals);
  const roll = rng(offset);
  let goals = 0;
  let probability = Math.exp(-lambda);
  let cumulative = probability;
  while (roll > cumulative && probability > Number.EPSILON) {
    goals++;
    probability *= lambda / goals;
    cumulative += probability;
  }
  return goals;
};
var simulateEuropeanBackgroundScore = (input) => {
  const profile = getEuropeanBackgroundProfile(input.competitionId);
  const rng = makeSeededRng(input.seed);
  let homeXg = Math.max(0.04, input.homeExpectedGoals);
  let awayXg = Math.max(0.04, input.awayExpectedGoals);
  const homeDayMultiplier = 1 + (rng(40101) + rng(40102) - 1) * profile.individualVariance;
  const awayDayMultiplier = 1 + (rng(40103) + rng(40104) - 1) * profile.individualVariance;
  homeXg *= Math.max(0.62, Math.min(1.45, homeDayMultiplier));
  awayXg *= Math.max(0.62, Math.min(1.45, awayDayMultiplier));
  const tempoRoll = rng(40110);
  const isQuietMatch = tempoRoll < profile.quietMatchChance;
  const isOpenMatch = !isQuietMatch && tempoRoll < profile.quietMatchChance + profile.openMatchChance;
  if (isQuietMatch) {
    homeXg *= profile.quietMatchMultiplier;
    awayXg *= profile.quietMatchMultiplier;
  } else if (isOpenMatch) {
    homeXg *= profile.openMatchMultiplier;
    awayXg *= profile.openMatchMultiplier;
  }
  const strengthGap = input.homeStrength - input.awayStrength;
  const absoluteStrengthGap = Math.abs(strengthGap);
  let upsetWindowApplied = false;
  if (absoluteStrengthGap >= 5) {
    const extremeGapReduction = Math.min(0.35, Math.max(0, absoluteStrengthGap - 18) / 70);
    const upsetChance = profile.upsetWindowChance * (1 - extremeGapReduction);
    if (rng(40120) < upsetChance) {
      upsetWindowApplied = true;
      const underdogBoost = 1.25 + rng(40121) * 0.32;
      const favoriteSlump = 0.72 + rng(40122) * 0.18;
      if (strengthGap > 0) {
        homeXg *= favoriteSlump;
        awayXg *= underdogBoost;
      } else {
        homeXg *= underdogBoost;
        awayXg *= favoriteSlump;
      }
    }
  }
  const gapRisk = Math.min(0.022, absoluteStrengthGap / 900);
  const homeCollapseChance = profile.collapseChance + (strengthGap < 0 ? gapRisk : 0);
  const awayCollapseChance = profile.collapseChance + (strengthGap > 0 ? gapRisk : 0);
  const homeCollapsed = rng(40130) < homeCollapseChance;
  const awayCollapsed = rng(40131) < awayCollapseChance;
  if (homeCollapsed) {
    homeXg *= 0.78 + rng(40132) * 0.1;
    awayXg *= 1.42 + rng(40133) * 0.48;
  }
  if (awayCollapsed) {
    awayXg *= 0.78 + rng(40134) * 0.1;
    homeXg *= 1.42 + rng(40135) * 0.48;
  }
  if (profile.stage === "KNOCKOUT" && !profile.isReturnLeg) {
    homeXg *= 0.94;
    awayXg *= 0.94;
  } else if (profile.isReturnLeg && input.leg1Diff !== void 0) {
    const currentHomeAggregateDiff = -input.leg1Diff;
    if (currentHomeAggregateDiff < 0) {
      homeXg *= 1 + Math.min(0.24, Math.abs(currentHomeAggregateDiff) * 0.08);
      awayXg *= 1.05;
    } else if (currentHomeAggregateDiff > 0) {
      awayXg *= 1 + Math.min(0.24, currentHomeAggregateDiff * 0.08);
      homeXg *= 1.05;
    }
  } else if (profile.stage === "FINAL") {
    homeXg *= 0.96;
    awayXg *= 0.96;
  }
  homeXg = Math.max(0.04, Math.min(profile.expectedGoalsCap, homeXg));
  awayXg = Math.max(0.04, Math.min(profile.expectedGoalsCap, awayXg));
  return {
    homeScore: sampleEuropeanBackgroundGoals(homeXg, rng, 40200),
    awayScore: sampleEuropeanBackgroundGoals(awayXg, rng, 40201),
    adjustedHomeExpectedGoals: homeXg,
    adjustedAwayExpectedGoals: awayXg,
    isOpenMatch,
    upsetWindowApplied,
    homeCollapsed,
    awayCollapsed
  };
};
var BACKGROUND_EUROPEAN_COMPETITIONS = /* @__PURE__ */ new Set([
  "CL_R1Q" /* CL_R1Q */,
  "CL_R1Q_RETURN" /* CL_R1Q_RETURN */,
  "CL_R2Q" /* CL_R2Q */,
  "CL_R2Q_RETURN" /* CL_R2Q_RETURN */,
  "CL_GROUP_STAGE" /* CL_GROUP_STAGE */,
  "CL_R16" /* CL_R16 */,
  "CL_R16_RETURN" /* CL_R16_RETURN */,
  "CL_QF" /* CL_QF */,
  "CL_QF_RETURN" /* CL_QF_RETURN */,
  "CL_SF" /* CL_SF */,
  "CL_SF_RETURN" /* CL_SF_RETURN */,
  "CL_FINAL" /* CL_FINAL */,
  "EL_R1Q" /* EL_R1Q */,
  "EL_R1Q_RETURN" /* EL_R1Q_RETURN */,
  "EL_R2Q" /* EL_R2Q */,
  "EL_R2Q_RETURN" /* EL_R2Q_RETURN */,
  "EL_GROUP_STAGE" /* EL_GROUP_STAGE */,
  "EL_R16" /* EL_R16 */,
  "EL_R16_RETURN" /* EL_R16_RETURN */,
  "EL_QF" /* EL_QF */,
  "EL_QF_RETURN" /* EL_QF_RETURN */,
  "EL_SF" /* EL_SF */,
  "EL_SF_RETURN" /* EL_SF_RETURN */,
  "EL_FINAL" /* EL_FINAL */,
  "CONF_R1Q" /* CONF_R1Q */,
  "CONF_R1Q_RETURN" /* CONF_R1Q_RETURN */,
  "CONF_R2Q" /* CONF_R2Q */,
  "CONF_R2Q_RETURN" /* CONF_R2Q_RETURN */,
  "CONF_GROUP_STAGE" /* CONF_GROUP_STAGE */,
  "CONF_R16" /* CONF_R16 */,
  "CONF_R16_RETURN" /* CONF_R16_RETURN */,
  "CONF_QF" /* CONF_QF */,
  "CONF_QF_RETURN" /* CONF_QF_RETURN */,
  "CONF_SF" /* CONF_SF */,
  "CONF_SF_RETURN" /* CONF_SF_RETURN */,
  "CONF_FINAL" /* CONF_FINAL */
]);
var BACKGROUND_CONFERENCE_COMPETITIONS = /* @__PURE__ */ new Set([
  "CONF_R1Q" /* CONF_R1Q */,
  "CONF_R1Q_RETURN" /* CONF_R1Q_RETURN */,
  "CONF_R2Q" /* CONF_R2Q */,
  "CONF_R2Q_RETURN" /* CONF_R2Q_RETURN */,
  "CONF_GROUP_STAGE" /* CONF_GROUP_STAGE */,
  "CONF_R16" /* CONF_R16 */,
  "CONF_R16_RETURN" /* CONF_R16_RETURN */,
  "CONF_QF" /* CONF_QF */,
  "CONF_QF_RETURN" /* CONF_QF_RETURN */,
  "CONF_SF" /* CONF_SF */,
  "CONF_SF_RETURN" /* CONF_SF_RETURN */,
  "CONF_FINAL" /* CONF_FINAL */
]);

// tests/EuropeanBackgroundScoreDistributionTests.ts
var SAMPLE_SIZE = 6e4;
var summarize = (scenario) => {
  let totalGoals = 0;
  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;
  let nilNils = 0;
  let sideFivePlus = 0;
  let sixPlusTotal = 0;
  let maximumTeamScore = 0;
  for (let seed = 1; seed <= SAMPLE_SIZE; seed++) {
    const result = simulateEuropeanBackgroundScore({
      competitionId: scenario.competitionId,
      homeExpectedGoals: scenario.homeExpectedGoals,
      awayExpectedGoals: scenario.awayExpectedGoals,
      homeStrength: scenario.homeStrength,
      awayStrength: scenario.awayStrength,
      seed: seed * 7919
    });
    const total = result.homeScore + result.awayScore;
    totalGoals += total;
    maximumTeamScore = Math.max(maximumTeamScore, result.homeScore, result.awayScore);
    if (result.homeScore > result.awayScore) homeWins++;
    else if (result.awayScore > result.homeScore) awayWins++;
    else draws++;
    if (total === 0) nilNils++;
    if (Math.max(result.homeScore, result.awayScore) >= 5) sideFivePlus++;
    if (total >= 6) sixPlusTotal++;
  }
  return {
    name: scenario.name,
    matches: SAMPLE_SIZE,
    averageGoals: totalGoals / SAMPLE_SIZE,
    homeWinShare: homeWins / SAMPLE_SIZE,
    drawShare: draws / SAMPLE_SIZE,
    awayWinShare: awayWins / SAMPLE_SIZE,
    nilNilShare: nilNils / SAMPLE_SIZE,
    sideFivePlusShare: sideFivePlus / SAMPLE_SIZE,
    sixPlusTotalShare: sixPlusTotal / SAMPLE_SIZE,
    maximumTeamScore
  };
};
var championsLeagueProfile = getEuropeanBackgroundProfile("CL_GROUP_STAGE" /* CL_GROUP_STAGE */);
var europaLeagueProfile = getEuropeanBackgroundProfile("EL_GROUP_STAGE" /* EL_GROUP_STAGE */);
var conferenceQualifierProfile = getEuropeanBackgroundProfile("CONF_R1Q" /* CONF_R1Q */);
import_node_assert.strict.equal(championsLeagueProfile.useLegacyChampionsLeagueModel, true, "Liga Mistrz\xF3w musi zachowa\u0107 dotychczasowy model");
import_node_assert.strict.equal(europaLeagueProfile.useLegacyChampionsLeagueModel, false, "Liga Europy musi korzysta\u0107 z nowego modelu");
import_node_assert.strict.ok(
  conferenceQualifierProfile.individualVariance > europaLeagueProfile.individualVariance,
  "kwalifikacje Ligi Konferencji powinny mie\u0107 wi\u0119ksz\u0105 zmienno\u015B\u0107 ni\u017C faza ligowa LE"
);
var uncappedPoissonResult = sampleEuropeanBackgroundGoals(3.2, () => 0.999999, 0);
import_node_assert.strict.ok(uncappedPoissonResult >= 10, `rozk\u0142ad Poissona zosta\u0142 nieoczekiwanie uci\u0119ty: ${uncappedPoissonResult}`);
var deterministicInput = {
  competitionId: "EL_GROUP_STAGE" /* EL_GROUP_STAGE */,
  homeExpectedGoals: 1.45,
  awayExpectedGoals: 1.05,
  homeStrength: 79,
  awayStrength: 76,
  seed: 20260825
};
import_node_assert.strict.deepEqual(
  simulateEuropeanBackgroundScore(deterministicInput),
  simulateEuropeanBackgroundScore(deterministicInput),
  "ten sam zapis i seed musz\u0105 zawsze dawa\u0107 identyczny wynik"
);
var equalEuropa = summarize({
  name: "EL_EQUAL_LEAGUE",
  competitionId: "EL_GROUP_STAGE" /* EL_GROUP_STAGE */,
  homeExpectedGoals: 1.35,
  awayExpectedGoals: 1.1,
  homeStrength: 80,
  awayStrength: 80
});
var equalConference = summarize({
  name: "CONF_EQUAL_LEAGUE",
  competitionId: "CONF_GROUP_STAGE" /* CONF_GROUP_STAGE */,
  homeExpectedGoals: 1.35,
  awayExpectedGoals: 1.1,
  homeStrength: 80,
  awayStrength: 80
});
var clearEuropaFavorite = summarize({
  name: "EL_CLEAR_FAVORITE",
  competitionId: "EL_GROUP_STAGE" /* EL_GROUP_STAGE */,
  homeExpectedGoals: 2.2,
  awayExpectedGoals: 0.65,
  homeStrength: 91,
  awayStrength: 70
});
var conferenceQualifierMismatch = summarize({
  name: "CONF_QUALIFIER_MISMATCH",
  competitionId: "CONF_R1Q" /* CONF_R1Q */,
  homeExpectedGoals: 2.8,
  awayExpectedGoals: 0.45,
  homeStrength: 94,
  awayStrength: 63
});
console.table([
  equalEuropa,
  equalConference,
  clearEuropaFavorite,
  conferenceQualifierMismatch
].map((summary) => ({
  ...summary,
  averageGoals: Number(summary.averageGoals.toFixed(3)),
  homeWinShare: Number((summary.homeWinShare * 100).toFixed(2)),
  drawShare: Number((summary.drawShare * 100).toFixed(2)),
  awayWinShare: Number((summary.awayWinShare * 100).toFixed(2)),
  nilNilShare: Number((summary.nilNilShare * 100).toFixed(2)),
  sideFivePlusShare: Number((summary.sideFivePlusShare * 100).toFixed(2)),
  sixPlusTotalShare: Number((summary.sixPlusTotalShare * 100).toFixed(2))
})));
for (const summary of [equalEuropa, equalConference]) {
  import_node_assert.strict.ok(summary.averageGoals >= 2 && summary.averageGoals <= 3.1, `${summary.name}: nierealistyczna \u015Brednia goli ${summary.averageGoals}`);
  import_node_assert.strict.ok(summary.nilNilShare >= 0.04 && summary.nilNilShare <= 0.16, `${summary.name}: z\u0142y udzia\u0142 0:0 ${summary.nilNilShare}`);
  import_node_assert.strict.ok(summary.sideFivePlusShare >= 4e-3 && summary.sideFivePlusShare <= 0.05, `${summary.name}: z\u0142y udzia\u0142 wynik\xF3w 5+ ${summary.sideFivePlusShare}`);
  import_node_assert.strict.ok(summary.maximumTeamScore >= 7, `${summary.name}: d\u0142ugi ogon wynik\xF3w nie osi\u0105gn\u0105\u0142 7 bramek`);
}
import_node_assert.strict.ok(clearEuropaFavorite.homeWinShare >= 0.67 && clearEuropaFavorite.homeWinShare <= 0.88, `faworyt LE ma z\u0142y udzia\u0142 zwyci\u0119stw ${clearEuropaFavorite.homeWinShare}`);
import_node_assert.strict.ok(clearEuropaFavorite.awayWinShare >= 0.035 && clearEuropaFavorite.awayWinShare <= 0.13, `outsider LE ma z\u0142y udzia\u0142 sensacji ${clearEuropaFavorite.awayWinShare}`);
import_node_assert.strict.ok(clearEuropaFavorite.sideFivePlusShare >= 0.04, "wyra\u017Any faworyt LE zbyt rzadko osi\u0105ga wynik 5+");
import_node_assert.strict.ok(
  conferenceQualifierMismatch.sideFivePlusShare > clearEuropaFavorite.sideFivePlusShare,
  "du\u017Ca r\xF3\u017Cnica si\u0142 w kwalifikacjach LK powinna cz\u0119\u015Bciej tworzy\u0107 wysokie wyniki"
);
import_node_assert.strict.ok(conferenceQualifierMismatch.awayWinShare >= 0.015, "skrajny outsider w kwalifikacjach nadal musi mie\u0107 niezerow\u0105, mierzaln\u0105 szans\u0119 sensacji");
console.log("EuropeanBackgroundScoreDistributionTests: OK");
