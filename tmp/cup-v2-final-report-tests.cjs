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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// tests/CupV2FinalReportSelectionTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);

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

// services/match/engines/cupV2/CupMatchTypes.ts
var DEFAULT_CUP_ENGINE_CONFIG = {
  tickSeconds: 5,
  normalTimeSeconds: 90 * 60,
  extraTimeSeconds: 30 * 60,
  maxSubstitutions: 5,
  enableExtraTime: true,
  enablePenaltyShootout: true,
  calibrationMode: false
};

// services/match/engines/cupV2/CupPlayerStatsAggregator.ts
var SHOT_TYPES = /* @__PURE__ */ new Set([
  "SHOT" /* SHOT */,
  "SHOT_BLOCKED" /* SHOT_BLOCKED */,
  "SHOT_ON_TARGET" /* SHOT_ON_TARGET */,
  "SAVE" /* SAVE */,
  "SHOT_POST" /* SHOT_POST */,
  "SHOT_BAR" /* SHOT_BAR */,
  "GOAL" /* GOAL */,
  "ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */,
  "ONE_ON_ONE_MISS" /* ONE_ON_ONE_MISS */,
  "ONE_ON_ONE_SAVE" /* ONE_ON_ONE_SAVE */,
  "PENALTY_SCORED" /* PENALTY_SCORED */,
  "PENALTY_MISSED" /* PENALTY_MISSED */
]);
var ON_TARGET_TYPES = /* @__PURE__ */ new Set([
  "SHOT_ON_TARGET" /* SHOT_ON_TARGET */,
  "SAVE" /* SAVE */,
  "GOAL" /* GOAL */,
  "ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */,
  "ONE_ON_ONE_SAVE" /* ONE_ON_ONE_SAVE */,
  "PENALTY_SCORED" /* PENALTY_SCORED */
]);
var GOAL_TYPES = /* @__PURE__ */ new Set([
  "GOAL" /* GOAL */,
  "ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */,
  "PENALTY_SCORED" /* PENALTY_SCORED */
]);
var SAVE_TYPES = /* @__PURE__ */ new Set([
  "SAVE" /* SAVE */,
  "ONE_ON_ONE_SAVE" /* ONE_ON_ONE_SAVE */
]);

// services/match/engines/cupV2/CupMatchLoop.ts
var RECEIVER_CARRIER_EVENTS = /* @__PURE__ */ new Set([
  "PASS_COMPLETED" /* PASS_COMPLETED */,
  "CROSS_NEAR_POST" /* CROSS_NEAR_POST */,
  "CROSS_FAR_POST" /* CROSS_FAR_POST */
]);
var ACTOR_CARRIER_EVENTS = /* @__PURE__ */ new Set([
  "BALL_CONTROL" /* BALL_CONTROL */,
  "DRIBBLING" /* DRIBBLING */,
  "TACKLE_WON" /* TACKLE_WON */,
  "MISPLACED_PASS" /* MISPLACED_PASS */,
  "REBOUND_WON" /* REBOUND_WON */,
  "SAVE" /* SAVE */,
  "ONE_ON_ONE_SAVE" /* ONE_ON_ONE_SAVE */,
  "GK_LONG_THROW" /* GK_LONG_THROW */,
  "GOAL_KICK" /* GOAL_KICK */,
  "KICK_OFF" /* KICK_OFF */
]);

// services/match/engines/cupV2/CupSampleMatchFactory.ts
var positionBoosts = {
  ["GK" /* GK */]: { goalkeeping: 14, positioning: 8, mentality: 5, passing: 2 },
  ["DEF" /* DEF */]: { defending: 11, positioning: 8, heading: 6, strength: 5, aggression: 3 },
  ["MID" /* MID */]: { passing: 9, vision: 7, technique: 7, stamina: 5, workRate: 5 },
  ["FWD" /* FWD */]: { finishing: 11, attacking: 9, pace: 5, dribbling: 4, technique: 4 }
};

// services/match/adapters/cupV2/CupMatchReportAdapter.ts
var GOAL_TYPES2 = /* @__PURE__ */ new Set([
  "GOAL" /* GOAL */,
  "ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */,
  "PENALTY_SCORED" /* PENALTY_SCORED */
]);
var IMPORTANT_TIMELINE_TYPES = /* @__PURE__ */ new Set([
  "GOAL" /* GOAL */,
  "ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */,
  "PENALTY_SCORED" /* PENALTY_SCORED */,
  "PENALTY_MISSED" /* PENALTY_MISSED */,
  "SHOT_POST" /* SHOT_POST */,
  "SHOT_BAR" /* SHOT_BAR */,
  "SAVE" /* SAVE */,
  "ONE_ON_ONE_SAVE" /* ONE_ON_ONE_SAVE */,
  "YELLOW_CARD" /* YELLOW_CARD */,
  "RED_CARD" /* RED_CARD */,
  "INJURY_LIGHT" /* INJURY_LIGHT */,
  "INJURY_SEVERE" /* INJURY_SEVERE */,
  "SUBSTITUTION" /* SUBSTITUTION */,
  "PENALTY_AWARDED" /* PENALTY_AWARDED */
]);

// services/match/adapters/cupV2/CupV2FinalReportSelectionService.ts
var CUP_V2_FINAL_REPORT_MODE_KEY = "cupV2FinalReport";
var sameNullableNumber = (left, right) => (left ?? void 0) === (right ?? void 0);
var isFiniteNumber = (value) => Number.isFinite(value);
var validateTeamStats = (label, stats) => {
  const warnings = [];
  const entries = [
    ["shots", stats.shots],
    ["shotsOnTarget", stats.shotsOnTarget],
    ["corners", stats.corners],
    ["fouls", stats.fouls],
    ["offsides", stats.offsides],
    ["yellowCards", stats.yellowCards],
    ["redCards", stats.redCards],
    ["possession", stats.possession]
  ];
  entries.forEach(([key, value]) => {
    if (!isFiniteNumber(value) || value < 0) warnings.push(`${label}.${key} is invalid`);
  });
  if (stats.shotsOnTarget > stats.shots) warnings.push(`${label}.shotsOnTarget exceeds shots`);
  if (stats.redCards > 5) warnings.push(`${label}.redCards is unrealistic`);
  if (stats.yellowCards > 9) warnings.push(`${label}.yellowCards is unrealistic`);
  return warnings;
};
var validateSummaryShape = (legacy2, candidate) => {
  const warnings = [];
  if (candidate.matchId !== legacy2.matchId) warnings.push("matchId mismatch");
  if (candidate.homeClub.id !== legacy2.homeClub.id) warnings.push("home club mismatch");
  if (candidate.awayClub.id !== legacy2.awayClub.id) warnings.push("away club mismatch");
  if (!isFiniteNumber(candidate.homeScore) || candidate.homeScore < 0) warnings.push("homeScore is invalid");
  if (!isFiniteNumber(candidate.awayScore) || candidate.awayScore < 0) warnings.push("awayScore is invalid");
  warnings.push(...validateTeamStats("home", candidate.homeStats));
  warnings.push(...validateTeamStats("away", candidate.awayStats));
  const possessionTotal = candidate.homeStats.possession + candidate.awayStats.possession;
  if (possessionTotal < 99 || possessionTotal > 101) warnings.push("possession does not add up to 100");
  const totalShots = candidate.homeStats.shots + candidate.awayStats.shots;
  const totalGoals = candidate.homeScore + candidate.awayScore;
  const totalOffsides = candidate.homeStats.offsides + candidate.awayStats.offsides;
  const totalCards = candidate.homeStats.yellowCards + candidate.awayStats.yellowCards + candidate.homeStats.redCards + candidate.awayStats.redCards;
  if (totalShots > 52) warnings.push("total shots are outside calibrated range");
  if (totalGoals > 8) warnings.push("total goals are outside football range");
  if (totalOffsides > 16) warnings.push("total offsides are outside calibrated range");
  if (totalCards > 18) warnings.push("total cards are outside calibrated range");
  if (candidate.homePlayers.length < 11) warnings.push("home player report is incomplete");
  if (candidate.awayPlayers.length < 11) warnings.push("away player report is incomplete");
  [...candidate.homePlayers, ...candidate.awayPlayers].forEach((player) => {
    if (!player.playerId) warnings.push("player report without playerId");
    if (typeof player.rating === "number" && (player.rating < 1 || player.rating > 10)) {
      warnings.push(`rating outside range for ${player.playerId}`);
    }
    if (player.fatigue < 0 || player.fatigue > 100) warnings.push(`fatigue outside range for ${player.playerId}`);
  });
  candidate.timeline.forEach((event) => {
    if (event.minute < 0 || event.minute > 130) warnings.push(`timeline minute outside range: ${event.minute}`);
    if (event.teamSide !== "HOME" && event.teamSide !== "AWAY") warnings.push("timeline event without valid side");
  });
  return Array.from(new Set(warnings));
};
var validateScoreParity = (legacy2, candidate) => {
  const warnings = [];
  if (candidate.homeScore !== legacy2.homeScore || candidate.awayScore !== legacy2.awayScore) {
    warnings.push("score differs from live legacy match");
  }
  if (!sameNullableNumber(candidate.homePenaltyScore, legacy2.homePenaltyScore) || !sameNullableNumber(candidate.awayPenaltyScore, legacy2.awayPenaltyScore)) {
    warnings.push("penalty score differs from live legacy match");
  }
  const compareGoals = (label, legacyGoals, candidateGoals) => {
    const signature = (goals) => goals.map((goal) => [
      goal.minute,
      goal.scorerId ?? goal.playerName,
      goal.assistantId ?? goal.assistantName ?? "",
      goal.isOwnGoal ? "OG" : "",
      goal.isPenalty ? "PEN" : ""
    ].join(":")).sort().join("|");
    if (signature(legacyGoals) !== signature(candidateGoals)) {
      warnings.push(`${label} goal list differs from live legacy match`);
    }
  };
  const compareStats = (label, legacyStats, candidateStats) => {
    const keys = [
      "shots",
      "shotsOnTarget",
      "corners",
      "fouls",
      "offsides",
      "yellowCards",
      "redCards",
      "possession"
    ];
    if (keys.some((key) => legacyStats[key] !== candidateStats[key])) {
      warnings.push(`${label} stats differ from live legacy match`);
    }
  };
  compareGoals("home", legacy2.homeGoals, candidate.homeGoals);
  compareGoals("away", legacy2.awayGoals, candidate.awayGoals);
  compareStats("home", legacy2.homeStats, candidate.homeStats);
  compareStats("away", legacy2.awayStats, candidate.awayStats);
  return warnings;
};
var CupV2FinalReportSelectionService = {
  resolveMode: (storage) => {
    const raw = storage?.getItem(CUP_V2_FINAL_REPORT_MODE_KEY)?.toLowerCase().trim();
    if (raw === "0" || raw === "off" || raw === "legacy") return "off";
    if (raw === "force" || raw === "2") return "force";
    return "safe";
  },
  selectFinalReport: ({
    legacySummary,
    v2Summary,
    mode = "safe"
  }) => {
    if (mode === "off") {
      return {
        summary: legacySummary,
        source: "legacy",
        mode,
        reason: "Cup V2 final report is disabled",
        warnings: []
      };
    }
    if (!v2Summary) {
      return {
        summary: legacySummary,
        source: "legacy",
        mode,
        reason: "Cup V2 final report is missing",
        warnings: ["missing v2 summary"]
      };
    }
    const shapeWarnings = validateSummaryShape(legacySummary, v2Summary);
    if (shapeWarnings.length > 0) {
      return {
        summary: legacySummary,
        source: "legacy",
        mode,
        reason: "Cup V2 final report failed validation",
        warnings: shapeWarnings
      };
    }
    const parityWarnings = validateScoreParity(legacySummary, v2Summary);
    if (mode === "safe" && parityWarnings.length > 0) {
      return {
        summary: legacySummary,
        source: "legacy",
        mode,
        reason: "Cup V2 final report differs from the live match result",
        warnings: parityWarnings
      };
    }
    return {
      summary: v2Summary,
      source: "cupV2",
      mode,
      reason: mode === "force" ? "Cup V2 final report forced by integration flag" : "Cup V2 final report passed safe validation",
      warnings: parityWarnings
    };
  }
};

// tests/CupV2FinalReportSelectionTests.ts
var makeClub = (id, name) => ({
  id,
  name,
  shortName: name,
  leagueId: "POLISH_CUP_TEST",
  tier: 1,
  colorsHex: ["#111827", "#f8fafc"],
  stadiumName: `${name} Arena`,
  stadiumCapacity: 12e3,
  reputation: 55,
  country: "POL",
  isDefaultActive: false,
  rosterIds: [],
  stats: {},
  budget: 0,
  transferBudget: 0,
  boardStrictness: 5,
  signingBonusPool: 0,
  morale: 60
});
var homeClub = makeClub("HOME_TEST", "Home Test");
var awayClub = makeClub("AWAY_TEST", "Away Test");
var makeStats = (overrides = {}) => ({
  shots: 11,
  shotsOnTarget: 4,
  corners: 5,
  fouls: 10,
  offsides: 2,
  yellowCards: 2,
  redCards: 0,
  possession: 50,
  ...overrides
});
var makePlayer = (prefix, index) => ({
  playerId: `${prefix}_${index}`,
  name: `${prefix} Player ${index}`,
  position: index === 0 ? "GK" /* GK */ : index < 5 ? "DEF" /* DEF */ : index < 9 ? "MID" /* MID */ : "FWD" /* FWD */,
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  missedPenalties: 0,
  savedPenalties: 0,
  healthStatus: "HEALTHY" /* HEALTHY */,
  fatigue: 74,
  rating: 6.7
});
var makePlayers = (prefix) => Array.from({ length: 11 }, (_, index) => makePlayer(prefix, index));
var makeSummary = (overrides = {}) => ({
  matchId: "PP_FINAL_REPORT_TEST",
  userTeamId: homeClub.id,
  homeClub,
  awayClub,
  homeScore: 1,
  awayScore: 1,
  homePenaltyScore: 4,
  awayPenaltyScore: 3,
  homeGoals: [],
  awayGoals: [],
  homeStats: makeStats({ possession: 51 }),
  awayStats: makeStats({ possession: 49 }),
  homePlayers: makePlayers("H"),
  awayPlayers: makePlayers("A"),
  timeline: [
    {
      minute: 12,
      type: "GOAL" /* GOAL */,
      playerName: "H Player 9",
      teamSide: "HOME",
      scoreAtMoment: "1:0"
    }
  ],
  ...overrides
});
var legacy = makeSummary();
var safeSelection = CupV2FinalReportSelectionService.selectFinalReport({
  legacySummary: legacy,
  v2Summary: makeSummary(),
  mode: "safe"
});
import_strict.default.equal(safeSelection.source, "cupV2");
import_strict.default.equal(safeSelection.summary.homeStats.shots, 11);
import_strict.default.deepEqual(safeSelection.warnings, []);
var statMismatchSelection = CupV2FinalReportSelectionService.selectFinalReport({
  legacySummary: legacy,
  v2Summary: makeSummary({
    homeStats: makeStats({ shots: 14, shotsOnTarget: 5, possession: 53 }),
    awayStats: makeStats({ shots: 8, shotsOnTarget: 3, possession: 47 })
  }),
  mode: "safe"
});
import_strict.default.equal(statMismatchSelection.source, "legacy");
import_strict.default.ok(statMismatchSelection.warnings.includes("home stats differ from live legacy match"));
import_strict.default.ok(statMismatchSelection.warnings.includes("away stats differ from live legacy match"));
var mismatchSelection = CupV2FinalReportSelectionService.selectFinalReport({
  legacySummary: legacy,
  v2Summary: makeSummary({ homeScore: 2, awayScore: 1 }),
  mode: "safe"
});
import_strict.default.equal(mismatchSelection.source, "legacy");
import_strict.default.equal(mismatchSelection.summary, legacy);
import_strict.default.ok(mismatchSelection.warnings.includes("score differs from live legacy match"));
var forcedSelection = CupV2FinalReportSelectionService.selectFinalReport({
  legacySummary: legacy,
  v2Summary: makeSummary({ homeScore: 2, awayScore: 1 }),
  mode: "force"
});
import_strict.default.equal(forcedSelection.source, "cupV2");
import_strict.default.equal(forcedSelection.summary.homeScore, 2);
import_strict.default.ok(forcedSelection.warnings.includes("score differs from live legacy match"));
var invalidSelection = CupV2FinalReportSelectionService.selectFinalReport({
  legacySummary: legacy,
  v2Summary: makeSummary({
    homeStats: makeStats({ shots: 3, shotsOnTarget: 6 })
  }),
  mode: "force"
});
import_strict.default.equal(invalidSelection.source, "legacy");
import_strict.default.ok(invalidSelection.warnings.includes("home.shotsOnTarget exceeds shots"));
var disabledSelection = CupV2FinalReportSelectionService.selectFinalReport({
  legacySummary: legacy,
  v2Summary: makeSummary(),
  mode: "off"
});
import_strict.default.equal(disabledSelection.source, "legacy");
import_strict.default.equal(disabledSelection.warnings.length, 0);
import_strict.default.equal(
  CupV2FinalReportSelectionService.resolveMode({
    getItem: (key) => key === CUP_V2_FINAL_REPORT_MODE_KEY ? "force" : null
  }),
  "force"
);
import_strict.default.equal(
  CupV2FinalReportSelectionService.resolveMode({
    getItem: (key) => key === CUP_V2_FINAL_REPORT_MODE_KEY ? "0" : null
  }),
  "off"
);
import_strict.default.equal(CupV2FinalReportSelectionService.resolveMode(null), "safe");
console.log("Cup V2 final report selection tests passed.");
