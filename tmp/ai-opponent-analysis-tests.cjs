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

// services/TacticalMatchupService.ts
var clamp = (value, min, max) => Math.min(max, Math.max(min, value));
var getPlayersInXI = (players = [], startingXI = []) => {
  const ids = new Set(startingXI.filter((id) => !!id));
  return players.filter((player) => ids.has(player.id));
};
var averageAttributes = (players = [], startingXI = [], positions, attributes) => {
  const xi = getPlayersInXI(players, startingXI);
  const selected = positions ? xi.filter((player) => positions.includes(player.position)) : xi;
  const source = selected.length > 0 ? selected : xi;
  if (source.length === 0) return 55;
  return source.reduce((teamSum, player) => {
    const playerAvg = attributes.reduce((sum, attribute) => sum + player.attributes[attribute], 0) / attributes.length;
    return teamSum + playerAvg;
  }, 0) / source.length;
};
var TacticalMatchupService = {
  getTacticProfile: (tacticId) => {
    const tactic = TacticRepository.getById(tacticId);
    const slots = tactic.slots;
    const mids = slots.filter((slot) => slot.role === "MID" /* MID */);
    const defs = slots.filter((slot) => slot.role === "DEF" /* DEF */);
    const fwds = slots.filter((slot) => slot.role === "FWD" /* FWD */);
    const advanced = slots.filter((slot) => slot.role !== "GK" /* GK */ && slot.y <= 0.55);
    const wideThreat = advanced.filter((slot) => slot.x <= 0.2 || slot.x >= 0.8).length;
    const wideCover = slots.filter(
      (slot) => slot.role !== "GK" /* GK */ && slot.y >= 0.48 && (slot.x <= 0.18 || slot.x >= 0.82)
    ).length;
    const centralMids = mids.filter((slot) => slot.x >= 0.3 && slot.x <= 0.7).length;
    const holdingMids = mids.filter((slot) => slot.y >= 0.55).length;
    const centralAttackSlots = slots.filter(
      (slot) => slot.role !== "GK" /* GK */ && slot.x >= 0.3 && slot.x <= 0.7 && slot.y <= 0.55
    ).length;
    const xs = advanced.map((slot) => slot.x);
    const attackWidth = xs.length > 0 ? Math.max(...xs) - Math.min(...xs) : 0.45;
    const backLineY = defs.length > 0 ? defs.reduce((sum, slot) => sum + slot.y, 0) / defs.length : 0.75;
    return {
      tactic,
      midCount: mids.length,
      defCount: defs.length,
      fwdCount: fwds.length,
      wideThreat,
      wideCover,
      centralMids,
      holdingMids,
      centralAttackSlots,
      attackWidth,
      backLineY
    };
  },
  evaluateShotMatchup: (attackingTacticId, defendingTacticId, attackingPlayers = [], attackingXI = [], defendingPlayers = [], defendingXI = []) => {
    const attacking = TacticalMatchupService.getTacticProfile(attackingTacticId);
    const defending = TacticalMatchupService.getTacticProfile(defendingTacticId);
    const signals = [];
    const push = (id, modifier2, weight) => {
      if (Math.abs(modifier2) < 1e-3) return;
      signals.push({ id, modifier: modifier2, weight });
    };
    const attackingPace = averageAttributes(attackingPlayers, attackingXI, ["FWD" /* FWD */, "MID" /* MID */], ["pace", "acceleration"]);
    const attackingCentralTech = averageAttributes(attackingPlayers, attackingXI, ["MID" /* MID */], ["technique", "passing", "vision", "mentality"]);
    const defendingBackPace = averageAttributes(defendingPlayers, defendingXI, ["DEF" /* DEF */], ["pace", "acceleration", "positioning"]);
    const defendingPressQuality = averageAttributes(defendingPlayers, defendingXI, ["MID" /* MID */, "FWD" /* FWD */], ["workRate", "stamina", "aggression", "pace"]);
    if (attacking.wideThreat >= 2 && attacking.attackWidth >= 0.68 && defending.wideCover <= 2) {
      const exposure = defending.wideCover <= 1 ? 1 : 0.72;
      push("WIDE_OVERLOAD", 7e-3 * exposure, exposure);
    }
    if (attacking.centralAttackSlots >= 3 && defending.holdingMids === 0) {
      const centralWeight = clamp((attacking.centralAttackSlots - 2) / 3, 0.45, 1);
      push("CENTRAL_DM_GAP", 8e-3 * centralWeight, centralWeight);
    }
    if (attacking.centralMids - defending.centralMids >= 2 && defending.holdingMids <= 1) {
      const overloadWeight = clamp((attacking.centralMids - defending.centralMids) / 3, 0.45, 1);
      push("MIDFIELD_OVERLOAD", 55e-4 * overloadWeight, overloadWeight);
    }
    const highLinePressure = (defending.tactic.attackBias >= 70 ? 0.45 : 0) + (defending.tactic.pressingIntensity >= 72 ? 0.35 : 0) + (defending.backLineY <= 0.72 ? 0.2 : 0);
    const paceGap = attackingPace - defendingBackPace;
    if (highLinePressure > 0.35 && paceGap > 3) {
      const trapWeight = clamp((paceGap - 3) / 18, 0.25, 1) * clamp(highLinePressure, 0.35, 1);
      push("HIGH_LINE_PACE_TRAP", 0.01 * trapWeight, trapWeight);
    }
    const pressGap = defending.tactic.pressingIntensity - attacking.tactic.pressingIntensity;
    const resistanceGap = attackingCentralTech - defendingPressQuality;
    if (pressGap >= 18 && resistanceGap > 4) {
      const pressWeight = clamp((pressGap - 18) / 42, 0.25, 1) * clamp((resistanceGap - 4) / 20, 0.25, 1);
      push("PRESS_RESISTANCE", 7e-3 * pressWeight, pressWeight);
    }
    if (defending.tactic.defenseBias >= 82 && defending.defCount >= 5 && attacking.tactic.attackBias <= 62) {
      const blockWeight = clamp((defending.tactic.defenseBias - 78) / 18, 0.35, 1);
      push("LOW_BLOCK_STALE_POSSESSION", -8e-3 * blockWeight, blockWeight);
    }
    if (attacking.tactic.attackBias >= 78 && attacking.fwdCount >= 3 && defending.tactic.defenseBias >= 76 && defending.defCount >= 5) {
      const overcommitWeight = clamp((attacking.tactic.attackBias - 72) / 24, 0.35, 1);
      push("OVERCOMMITTED_FRONT", -6e-3 * overcommitWeight, overcommitWeight);
    }
    const modifier = clamp(signals.reduce((sum, signal) => sum + signal.modifier, 0), -0.018, 0.022);
    return { modifier, signals };
  },
  suggestCounterTactics: (opponentTacticId) => {
    const opponent = TacticalMatchupService.getTacticProfile(opponentTacticId);
    const tactic = opponent.tactic;
    if (opponent.holdingMids === 0 && opponent.centralAttackSlots >= 3) {
      return ["4-2-3-1", "4-3-3", "3-5-2", "4-5-1"];
    }
    if (opponent.wideCover <= 2 && opponent.attackWidth < 0.55) {
      return ["4-3-3", "4-2-3-1", "3-4-3", "4-4-2-OFF"];
    }
    if (tactic.attackBias >= 72 && tactic.pressingIntensity >= 72) {
      return ["4-4-2-DEF", "4-5-1", "5-3-2", "4-2-3-1"];
    }
    if (tactic.defenseBias >= 82 && opponent.defCount >= 5) {
      return ["3-5-2", "4-2-3-1", "4-3-3", "4-4-2-DIAMOND"];
    }
    if (opponent.midCount >= 5 && opponent.fwdCount <= 1 && opponent.holdingMids >= 1) {
      return ["4-2-3-1", "3-5-2", "4-3-3", "5-2-1-2", "4-4-2-DIAMOND"];
    }
    if (opponent.midCount <= 3) {
      return ["3-5-2", "4-2-3-1", "4-3-3"];
    }
    return [];
  }
};

// services/match/live/LiveMatchRandom.ts
var getLegacyMinuteSeededValue = (seed, minute, offset = 0) => {
  const x = Math.sin(seed + minute + offset) * 1e4;
  return x - Math.floor(x);
};
var getLegacySpreadOffsetSeededValue = (seed, offset = 0) => {
  const x = Math.sin(seed + offset * 9973) * 1e4;
  return x - Math.floor(x);
};

// services/AiOpponentAnalysisService.ts
var clamp2 = (value, min, max) => Math.max(min, Math.min(max, value));
var CAUTIOUS_START_THRESHOLD = 1.25;
var DEFENSIVE_START_THRESHOLD = 1.5;
var LOW_BLOCK_START_THRESHOLD = 1.75;
var isCautiousStartJustified = (opponentToAiPowerRatio) => opponentToAiPowerRatio !== void 0 && opponentToAiPowerRatio >= CAUTIOUS_START_THRESHOLD;
var getDefensiveStartProbability = (opponentToAiPowerRatio) => opponentToAiPowerRatio !== void 0 && opponentToAiPowerRatio >= DEFENSIVE_START_THRESHOLD ? 0.5 : 0;
var isDefensiveStartJustified = (opponentToAiPowerRatio, _environment = "DOMESTIC_LEAGUE") => getDefensiveStartProbability(opponentToAiPowerRatio) > 0;
var isLowBlockStartJustified = (opponentToAiPowerRatio, _environment = "DOMESTIC_LEAGUE") => opponentToAiPowerRatio !== void 0 && opponentToAiPowerRatio >= LOW_BLOCK_START_THRESHOLD;
var staffAttr = (member, key, fallback = 10) => clamp2(member?.attributes?.[key] ?? fallback, 1, 20) * 5;
var seededRng = getLegacySpreadOffsetSeededValue;
var hashString = (value) => value.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 17), 0);
var pickBestStaff = (staff, role, keys) => staff.filter((member) => member.role === role).sort((a, b) => {
  const score = (member) => keys.reduce((sum, key) => sum + (member.attributes[key] ?? 10), 0) / Math.max(1, keys.length);
  return score(b) - score(a);
})[0];
var staffTeamAttr = (members, key, fallback = 10) => {
  if (members.length === 0) return clamp2(fallback, 1, 20) * 5;
  const leadValue = clamp2(members[0].attributes[key] ?? fallback, 1, 20) * 5;
  const supportWeights = [0.1, 0.06];
  const supportBonus = members.slice(1, 3).reduce((sum, member, index) => {
    const supportValue = clamp2(member.attributes[key] ?? fallback, 1, 20) * 5;
    return sum + (supportValue - 50) * supportWeights[index];
  }, 0);
  return clamp2(leadValue + supportBonus, 5, 99);
};
var getStarters = (players, lineup) => lineup.startingXI.map((id) => id ? players.find((player) => player.id === id) : null).filter((player) => !!player);
var getTopLineAvg = (players, position, topN) => {
  const line = players.filter((player) => player.position === position).sort((a, b) => b.overallRating - a.overallRating).slice(0, topN);
  if (line.length === 0) return 60;
  return line.reduce((sum, player) => sum + player.overallRating, 0) / line.length;
};
var getPlayerPower = (player) => player.attributes.attacking + player.attributes.passing + player.attributes.defending + player.attributes.technique * 0.5;
var getAvailableSquadPower = (players) => {
  const available = players.filter(
    (player) => player.condition >= 60 && player.suspensionMatches <= 0 && (player.health.status !== "INJURED" /* INJURED */ || player.health.injury?.severity !== "SEVERE" /* SEVERE */)
  );
  const selected = [];
  const selectedIds = /* @__PURE__ */ new Set();
  const addBest = (position, count) => {
    available.filter((player) => player.position === position).sort((a, b) => getPlayerPower(b) - getPlayerPower(a)).slice(0, count).forEach((player) => {
      selected.push(player);
      selectedIds.add(player.id);
    });
  };
  addBest("GK" /* GK */, 1);
  addBest("DEF" /* DEF */, 4);
  addBest("MID" /* MID */, 4);
  addBest("FWD" /* FWD */, 2);
  if (selected.length < 11) {
    available.filter((player) => !selectedIds.has(player.id)).sort((a, b) => getPlayerPower(b) - getPlayerPower(a)).slice(0, 11 - selected.length).forEach((player) => selected.push(player));
  }
  return selected.reduce((sum, player) => sum + getPlayerPower(player), 0);
};
var isTacticFeasible = (players, tacticId) => {
  const tactic = TacticRepository.getById(tacticId);
  const available = players.filter(
    (player) => player.condition >= 60 && player.suspensionMatches <= 0 && (player.health.status !== "INJURED" /* INJURED */ || player.health.injury?.severity !== "SEVERE" /* SEVERE */)
  );
  const required = tactic.slots.slice(1).reduce((acc, slot) => {
    acc[slot.role] = (acc[slot.role] ?? 0) + 1;
    return acc;
  }, {});
  const counts = available.reduce((acc, player) => {
    if (player.position !== "GK" /* GK */) acc[player.position] = (acc[player.position] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(required).every(([position, count]) => (counts[position] ?? 0) >= count);
};
var addNoise = (value, errorPercent, seed, offset) => {
  const direction = seededRng(seed, offset) > 0.5 ? 1 : -1;
  const scale = 0.35 + seededRng(seed, offset + 13) * 0.65;
  return value * (1 + direction * (errorPercent / 100) * scale);
};
var getStyleFromTactic = (tacticId) => {
  const tactic = TacticRepository.getById(tacticId);
  if (!tactic) return "BALANCED";
  if (tactic.attackBias >= 65 && tactic.defenseBias <= 50) return "OFFENSIVE";
  if (tactic.defenseBias >= 65 && tactic.attackBias <= 50) return "DEFENSIVE";
  return "BALANCED";
};
var getWrongTactic = (actualTacticId, seed) => {
  const all = TacticRepository.getAll().filter((tactic) => tactic.id !== actualTacticId);
  if (all.length === 0) return actualTacticId;
  return all[Math.floor(seededRng(seed, 29) * all.length)]?.id ?? actualTacticId;
};
var getWeakness = (lines, fatigueLevel) => {
  if (fatigueLevel === "EXHAUSTED") return "FITNESS";
  const entries = [
    ["DEFENSE", lines.defense],
    ["MIDFIELD", lines.midfield],
    ["ATTACK", lines.attack]
  ];
  const weakest = entries.sort((a, b) => a[1] - b[1])[0];
  return weakest && weakest[1] < 66 ? weakest[0] : null;
};
var AiOpponentAnalysisService = {
  buildStaffProfile: (club, coach, staffMembers = {}) => {
    const clubStaff = (club.staffIds ?? []).map((id) => staffMembers[id]).filter((member) => !!member);
    const assistants = clubStaff.filter((member) => member.role === "ASSISTANT_COACH" /* ASSISTANT_COACH */).sort((a, b) => {
      const score = (member) => ((member.attributes.opponentAnalysis ?? 10) + (member.attributes.offensiveTactics ?? 10) + (member.attributes.defensiveTactics ?? 10) + (member.attributes.communication ?? 10) + (member.attributes.experience ?? 10)) / 5;
      return score(b) - score(a);
    });
    const analyst = pickBestStaff(clubStaff, "VIDEO_ANALYST" /* VIDEO_ANALYST */, [
      "videoAnalysis",
      "tactics",
      "statsAnalysis",
      "scouting",
      "reporting",
      "experience"
    ]);
    const fitness = pickBestStaff(clubStaff, "FITNESS_COACH" /* FITNESS_COACH */, [
      "fitnessTests",
      "periodization",
      "recovery",
      "experience"
    ]);
    const coachDecision = coach?.attributes.decisionMaking ?? 50;
    const coachExperience = coach?.attributes.experience ?? 50;
    const coachTraining = coach?.attributes.training ?? 50;
    const assistantAnalysis = staffTeamAttr(assistants, "opponentAnalysis");
    const assistantTactics = (staffTeamAttr(assistants, "offensiveTactics") + staffTeamAttr(assistants, "defensiveTactics")) / 2;
    const videoAnalysis = staffAttr(analyst, "videoAnalysis");
    const videoTactics = staffAttr(analyst, "tactics");
    const statsAnalysis = staffAttr(analyst, "statsAnalysis");
    const videoScouting = staffAttr(analyst, "scouting");
    const fitnessTests = staffAttr(fitness, "fitnessTests");
    const periodization = staffAttr(fitness, "periodization");
    return {
      analysisQuality: clamp2(
        coachDecision * 0.22 + coachExperience * 0.18 + assistantAnalysis * 0.22 + videoAnalysis * 0.16 + videoTactics * 0.1 + statsAnalysis * 0.07 + videoScouting * 0.05,
        1,
        99
      ),
      tacticalQuality: clamp2(
        coachDecision * 0.24 + coachExperience * 0.16 + assistantTactics * 0.25 + assistantAnalysis * 0.12 + videoTactics * 0.18 + videoAnalysis * 0.05,
        1,
        99
      ),
      fitnessQuality: clamp2(coachTraining * 0.25 + coachExperience * 0.15 + fitnessTests * 0.42 + periodization * 0.18, 1, 99),
      decisionQuality: clamp2(coachDecision * 0.55 + coachExperience * 0.25 + assistantTactics * 0.2, 1, 99)
    };
  },
  generateReport: (params) => {
    const {
      aiClub: aiClub2,
      aiCoach,
      aiStaffMembers = {},
      opponentClub: opponentClub2,
      aiPlayers = [],
      opponentPlayers,
      opponentLineup: opponentLineup2,
      seed,
      matchEnvironment = "DOMESTIC_LEAGUE"
    } = params;
    const profile = AiOpponentAnalysisService.buildStaffProfile(aiClub2, aiCoach, aiStaffMembers);
    const reportSeed = seed + hashString(aiClub2.id) * 11 + hashString(opponentClub2.id) * 17;
    const accuracy = clamp2((profile.analysisQuality * 0.55 + profile.tacticalQuality * 0.3 + profile.fitnessQuality * 0.15) / 100, 0.08, 0.98);
    const confidence = clamp2((profile.analysisQuality * 0.45 + profile.decisionQuality * 0.3 + profile.tacticalQuality * 0.25) / 100, 0.08, 0.98);
    const errorPercent = clamp2(34 - accuracy * 28, 3, 38);
    const starters = getStarters(opponentPlayers, opponentLineup2);
    const defense = addNoise(getTopLineAvg(starters, "DEF" /* DEF */, 4), errorPercent, reportSeed, 1);
    const midfield = addNoise(getTopLineAvg(starters, "MID" /* MID */, 4), errorPercent, reportSeed, 2);
    const attack = addNoise(getTopLineAvg(starters, "FWD" /* FWD */, 3), errorPercent, reportSeed, 3);
    const realPower = starters.reduce((sum, player) => {
      return sum + player.attributes.attacking + player.attributes.passing + player.attributes.defending + player.attributes.technique * 0.5;
    }, 0);
    const perceivedPower = Math.max(1, addNoise(realPower, errorPercent, reportSeed, 4));
    const aiPower = getAvailableSquadPower(aiPlayers);
    const perceivedOpponentToAiPowerRatio = aiPower > 0 ? perceivedPower / aiPower : void 0;
    const defensiveStartChance = getDefensiveStartProbability(perceivedOpponentToAiPowerRatio);
    const defensiveStartSelected = defensiveStartChance > 0 && seededRng(reportSeed, 44) < defensiveStartChance;
    const tacticMistakeChance = clamp2(0.38 - profile.tacticalQuality / 260, 0.03, 0.34);
    const predictedTacticId = seededRng(reportSeed, 5) < tacticMistakeChance ? getWrongTactic(opponentLineup2.tacticId, reportSeed) : opponentLineup2.tacticId;
    const predictedStyle = getStyleFromTactic(predictedTacticId);
    const avgCondition = starters.length > 0 ? starters.reduce((sum, player) => sum + player.condition, 0) / starters.length : 80;
    const conditionError = (seededRng(reportSeed, 6) * 2 - 1) * clamp2(18 - profile.fitnessQuality / 7, 2, 16);
    const perceivedCondition = clamp2(avgCondition + conditionError, 35, 100);
    const perceivedFatigueLevel = perceivedCondition >= 82 ? "FRESH" : perceivedCondition >= 67 ? "TIRED" : "EXHAUSTED";
    const lines = {
      defense: clamp2(defense, 35, 99),
      midfield: clamp2(midfield, 35, 99),
      attack: clamp2(attack, 35, 99)
    };
    const perceivedWeakness = getWeakness(lines, perceivedFatigueLevel);
    let recommendedApproach = "CONTROL";
    if (predictedStyle === "OFFENSIVE" || lines.attack > lines.defense + 5) recommendedApproach = "COUNTER";
    if (predictedStyle === "DEFENSIVE" || lines.defense < 64 || perceivedWeakness === "DEFENSE") recommendedApproach = "PRESS";
    if (perceivedWeakness === "FITNESS") recommendedApproach = "PRESS";
    if (perceivedWeakness === "MIDFIELD") recommendedApproach = "CONTROL";
    if (perceivedWeakness === "ATTACK" && predictedStyle !== "DEFENSIVE") recommendedApproach = "DIRECT";
    if (perceivedOpponentToAiPowerRatio !== void 0) {
      if (defensiveStartSelected && isLowBlockStartJustified(perceivedOpponentToAiPowerRatio, matchEnvironment)) {
        recommendedApproach = "LOW_BLOCK";
      } else if (isCautiousStartJustified(perceivedOpponentToAiPowerRatio)) {
        recommendedApproach = "COUNTER";
      } else if (perceivedOpponentToAiPowerRatio <= 0.92) {
        recommendedApproach = predictedStyle === "DEFENSIVE" || perceivedWeakness === "DEFENSE" || perceivedWeakness === "FITNESS" ? "PRESS" : "CONTROL";
      } else if (matchEnvironment === "DOMESTIC_LEAGUE" && !isCautiousStartJustified(perceivedOpponentToAiPowerRatio) && recommendedApproach === "COUNTER") {
        recommendedApproach = "CONTROL";
      }
    }
    return {
      accuracy,
      confidence,
      predictedTacticId,
      predictedStyle,
      perceivedPower,
      perceivedOpponentToAiPowerRatio,
      defensiveStartChance,
      defensiveStartSelected,
      matchEnvironment,
      perceivedLineStrengths: lines,
      perceivedFatigueLevel,
      perceivedWeakness,
      recommendedApproach
    };
  },
  recommendStartingTactic: (baseTacticId, report2, aiClub2, opponentClub2, aiPlayers = [], isAiAway = false, aiCoach = null) => {
    const confidenceGate = report2.confidence >= 0.48;
    if (!confidenceGate && !report2.coachPlanResolved) return baseTacticId;
    const current = TacticRepository.getById(baseTacticId);
    const alreadyDefensive = current.defenseBias >= 65;
    const alreadyOffensive = current.attackBias >= 65;
    const matchEnvironment = report2.matchEnvironment ?? "DOMESTIC_LEAGUE";
    const opponentToAiPowerRatio = report2.perceivedOpponentToAiPowerRatio ?? (() => {
      const aiPower = getAvailableSquadPower(aiPlayers);
      return aiPower > 0 ? report2.perceivedPower / aiPower : 1;
    })();
    const aiClearlyStronger = opponentToAiPowerRatio <= (isAiAway ? 0.92 : 0.95);
    const defensiveStartEligible = isDefensiveStartJustified(opponentToAiPowerRatio, matchEnvironment);
    const defensiveStartSelected = defensiveStartEligible && (report2.defensiveStartSelected ?? false);
    const lowBlockJustified = defensiveStartSelected && isLowBlockStartJustified(opponentToAiPowerRatio, matchEnvironment);
    const pickFeasible = (...tacticIds) => {
      if (aiPlayers.length === 0) return tacticIds[0] ?? baseTacticId;
      return tacticIds.find((tacticId) => isTacticFeasible(aiPlayers, tacticId)) ?? baseTacticId;
    };
    const tacticalCounters = TacticalMatchupService.suggestCounterTactics(report2.predictedTacticId).filter((tacticId) => tacticId !== baseTacticId);
    const balancedCounters = tacticalCounters.filter((tacticId) => {
      const tactic = TacticRepository.getById(tacticId);
      return tactic.defenseBias <= 65 && tactic.attackBias >= 45;
    });
    if (!defensiveStartSelected && alreadyDefensive) {
      const balancedTactic = pickFeasible(
        ...balancedCounters,
        "4-1-4-1",
        "4-2-3-1",
        "4-4-2-DIAMOND",
        "4-4-2",
        "4-3-2-1"
      );
      if (balancedTactic !== baseTacticId) return balancedTactic;
    }
    if (isCautiousStartJustified(opponentToAiPowerRatio) && !defensiveStartSelected && alreadyOffensive) {
      const balancedTactic = pickFeasible(
        ...balancedCounters,
        "4-2-3-1",
        "4-1-4-1",
        "4-4-2",
        "4-3-2-1"
      );
      if (balancedTactic !== baseTacticId) return balancedTactic;
    }
    if (aiClearlyStronger && (alreadyDefensive || report2.recommendedApproach === "LOW_BLOCK")) {
      const proactiveCounters = tacticalCounters.filter((tacticId) => {
        const tactic = TacticRepository.getById(tacticId);
        return tactic.attackBias >= 55 && tactic.defenseBias <= 65;
      });
      const proactiveTactic = pickFeasible(...proactiveCounters, "4-2-3-1", "4-3-3", "4-4-2-OFF", "4-4-2");
      if (proactiveTactic !== baseTacticId) return proactiveTactic;
    }
    if (report2.recommendedApproach === "LOW_BLOCK" && lowBlockJustified) {
      if (alreadyDefensive) return baseTacticId;
      return pickFeasible("5-4-1", "4-5-1", "4-4-2-DEF");
    }
    if (defensiveStartSelected && report2.recommendedApproach === "COUNTER") {
      if (alreadyDefensive) return baseTacticId;
      return pickFeasible("4-4-2-DEF", "5-2-1-2", "5-4-1");
    }
    if (tacticalCounters.length > 0 && report2.confidence >= 0.58) {
      const candidates = aiClearlyStronger || !defensiveStartSelected ? balancedCounters : tacticalCounters;
      const suggestedCounter = pickFeasible(...candidates);
      if (suggestedCounter !== baseTacticId) return suggestedCounter;
    }
    if (report2.recommendedApproach === "COUNTER" && !alreadyDefensive) {
      if (isCautiousStartJustified(opponentToAiPowerRatio)) return baseTacticId;
      const coachBoldness = ((aiCoach?.attributes.decisionMaking ?? 50) + (aiCoach?.attributes.experience ?? 50)) / 2;
      if (!isAiAway) {
        if (!alreadyOffensive && coachBoldness >= 60 && Math.random() < (coachBoldness - 55) / 45) {
          return pickFeasible("4-3-3", "4-2-3-1", "4-4-2-OFF");
        }
        return baseTacticId;
      }
      const offensiveRisk = Math.max(0, (coachBoldness - 45) / 55);
      if (!alreadyOffensive && Math.random() < offensiveRisk) {
        return pickFeasible("4-2-3-1", "4-3-3", "4-4-2-OFF");
      }
      if (coachBoldness < 45 && defensiveStartSelected) return pickFeasible("4-4-2-DEF", "4-5-1");
      return baseTacticId;
    }
    if (report2.recommendedApproach === "PRESS" && !alreadyOffensive) {
      return pickFeasible("4-2-3-1", "4-3-3", "4-4-2-OFF");
    }
    if (report2.recommendedApproach === "CONTROL") {
      return report2.perceivedLineStrengths.midfield < 66 ? pickFeasible("3-5-2", "4-2-3-1") : baseTacticId;
    }
    if (report2.recommendedApproach === "DIRECT" && !alreadyOffensive) {
      return pickFeasible("4-4-2-OFF", "4-3-3");
    }
    return baseTacticId;
  }
};

// services/TacticalInstructionMatrixService.ts
var clamp3 = (value, min, max) => Math.min(max, Math.max(min, value));
var getInstructionKey = (tempo, mindset) => `${tempo}_${mindset}`;
var normalize = (tempo, mindset, intensity) => {
  let nextTempo = tempo;
  let nextMindset = mindset;
  let nextIntensity = intensity;
  if (nextMindset === "DEFENSIVE" && nextTempo === "FAST") nextTempo = "NORMAL";
  if (nextMindset === "OFFENSIVE") {
    if (nextTempo === "SLOW") nextTempo = "NORMAL";
    if (nextIntensity === "CAUTIOUS") nextIntensity = "NORMAL";
  }
  return { tempo: nextTempo, mindset: nextMindset, intensity: nextIntensity };
};
var pickTransitionPassing = (paceGap, techGap) => {
  if (paceGap >= 3) return "LONG";
  if (techGap >= 4 || paceGap <= -4) return "SHORT";
  return "MIXED";
};
var BASE_MATRIX = {
  FAST_OFFENSIVE: {
    tempo: "NORMAL",
    mindset: "NEUTRAL",
    intensity: "NORMAL",
    passing: "MIXED",
    pressing: "NORMAL",
    counterAttack: "COUNTER"
  },
  NORMAL_OFFENSIVE: {
    tempo: "NORMAL",
    mindset: "NEUTRAL",
    intensity: "NORMAL",
    passing: "MIXED",
    pressing: "NORMAL",
    counterAttack: "COUNTER"
  },
  SLOW_OFFENSIVE: {
    tempo: "NORMAL",
    mindset: "NEUTRAL",
    intensity: "NORMAL",
    passing: "MIXED",
    pressing: "PRESSING",
    counterAttack: "NORMAL"
  },
  FAST_NEUTRAL: {
    tempo: "NORMAL",
    mindset: "NEUTRAL",
    intensity: "NORMAL",
    passing: "MIXED",
    pressing: "NORMAL",
    counterAttack: "COUNTER"
  },
  NORMAL_NEUTRAL: {
    tempo: "NORMAL",
    mindset: "NEUTRAL",
    intensity: "NORMAL",
    passing: "MIXED",
    pressing: "NORMAL",
    counterAttack: "NORMAL"
  },
  SLOW_NEUTRAL: {
    tempo: "NORMAL",
    mindset: "NEUTRAL",
    intensity: "NORMAL",
    passing: "MIXED",
    pressing: "PRESSING",
    counterAttack: "NORMAL"
  },
  FAST_DEFENSIVE: {
    tempo: "NORMAL",
    mindset: "OFFENSIVE",
    intensity: "NORMAL",
    passing: "MIXED",
    pressing: "PRESSING",
    counterAttack: "NORMAL"
  },
  NORMAL_DEFENSIVE: {
    tempo: "NORMAL",
    mindset: "OFFENSIVE",
    intensity: "NORMAL",
    passing: "MIXED",
    pressing: "NORMAL",
    counterAttack: "NORMAL"
  },
  SLOW_DEFENSIVE: {
    tempo: "NORMAL",
    mindset: "OFFENSIVE",
    intensity: "NORMAL",
    passing: "SHORT",
    pressing: "PRESSING",
    counterAttack: "NORMAL"
  }
};
var TacticalInstructionMatrixService = {
  getMatrixRecommendation: (context) => {
    const opponentKey = getInstructionKey(context.opponentTempo, context.opponentMindset);
    const base = BASE_MATRIX[opponentKey];
    const aiTactic = TacticRepository.getById(context.aiTacticId);
    const opponentTactic = TacticRepository.getById(context.opponentTacticId);
    const suggestedCounters = TacticalMatchupService.suggestCounterTactics(context.opponentTacticId);
    const isSuggestedCounter = suggestedCounters.includes(context.aiTacticId);
    const opponentOvercommits = context.opponentTempo === "FAST" && context.opponentMindset === "OFFENSIVE";
    const opponentSitsDeep = context.opponentMindset === "DEFENSIVE" || opponentTactic.defenseBias >= 78;
    const seriousFatigue = context.aiAvgFatigue < 67 || context.aiLowestFatigue < 46;
    const mustProtect = context.aiScoreDiff > 0 && context.minute >= 70;
    const mustChase = context.aiScoreDiff < 0 && context.minute >= 55;
    let tempo = base.tempo;
    let mindset = base.mindset;
    let intensity = base.intensity;
    let passing = pickTransitionPassing(context.paceGap, context.techGap);
    let pressing = base.pressing;
    let counterAttack = base.counterAttack;
    let reason = "base_matrix";
    let confidence = 0.42;
    if (opponentOvercommits) {
      tempo = context.paceGap >= 3 ? "FAST" : "NORMAL";
      mindset = mustChase ? "OFFENSIVE" : "NEUTRAL";
      passing = context.paceGap >= 2 ? "LONG" : pickTransitionPassing(context.paceGap, context.techGap);
      pressing = "NORMAL";
      counterAttack = "COUNTER";
      reason = "counter_overcommit";
      confidence += 0.24;
    } else if (context.opponentTempo === "SLOW" && context.opponentMindset === "OFFENSIVE") {
      tempo = context.techGap >= 3 ? "FAST" : "NORMAL";
      mindset = "NEUTRAL";
      passing = context.techGap >= 3 ? "SHORT" : "MIXED";
      pressing = seriousFatigue ? "NORMAL" : "PRESSING";
      counterAttack = "NORMAL";
      reason = "press_slow_attack";
      confidence += 0.16;
    } else if (opponentSitsDeep) {
      tempo = context.techGap >= 3 ? "NORMAL" : "FAST";
      mindset = mustProtect ? "NEUTRAL" : "OFFENSIVE";
      passing = context.techGap >= 3 ? "SHORT" : "MIXED";
      pressing = seriousFatigue ? "NORMAL" : "PRESSING";
      counterAttack = "NORMAL";
      reason = "break_low_block";
      confidence += 0.14;
    } else if (mustProtect) {
      tempo = "SLOW";
      mindset = "DEFENSIVE";
      intensity = seriousFatigue ? "CAUTIOUS" : "NORMAL";
      passing = "MIXED";
      pressing = "NORMAL";
      counterAttack = opponentTactic.attackBias >= 58 ? "COUNTER" : "NORMAL";
      reason = "protect_lead";
      confidence += 0.18;
    } else if (mustChase) {
      tempo = seriousFatigue ? "NORMAL" : "FAST";
      mindset = "OFFENSIVE";
      intensity = context.minute >= 78 && !seriousFatigue ? "AGGRESSIVE" : "NORMAL";
      passing = context.paceGap >= 2 ? "LONG" : pickTransitionPassing(context.paceGap, context.techGap);
      pressing = seriousFatigue ? "NORMAL" : "PRESSING";
      counterAttack = "NORMAL";
      reason = "chase_game";
      confidence += 0.18;
    } else if (context.opponentMindset === "NEUTRAL") {
      tempo = context.intendedTempo;
      mindset = context.intendedMindset;
      intensity = context.intendedIntensity;
      passing = pickTransitionPassing(context.paceGap, context.techGap);
      pressing = aiTactic.pressingIntensity >= 70 && !seriousFatigue ? "PRESSING" : base.pressing;
      counterAttack = base.counterAttack;
      reason = "control_neutral";
      confidence += 0.08;
    }
    if (isSuggestedCounter) confidence += 0.14;
    if (aiTactic.defenseBias >= 78 && opponentOvercommits) confidence += 0.06;
    if (aiTactic.attackBias >= 72 && opponentSitsDeep && !seriousFatigue) confidence += 0.06;
    if (context.aiMomentum <= -35 && !seriousFatigue) {
      pressing = pressing === "PRESSING" && context.aiAvgFatigue < 72 ? "NORMAL" : pressing;
      counterAttack = opponentTactic.attackBias >= 55 ? "COUNTER" : counterAttack;
    }
    if (seriousFatigue) {
      tempo = tempo === "FAST" ? "NORMAL" : tempo;
      intensity = intensity === "AGGRESSIVE" ? "NORMAL" : intensity;
      pressing = "NORMAL";
      reason = reason === "protect_lead" ? reason : "fatigue_safety";
      confidence -= 0.06;
    }
    const normalized = normalize(tempo, mindset, intensity);
    return {
      ...normalized,
      passing,
      pressing,
      counterAttack,
      confidence: clamp3(confidence + (context.pressureDrama ?? 0) * 0.05, 0.2, 0.92),
      reason
    };
  }
};

// services/AiCoachTacticsService.ts
var seededRng2 = getLegacyMinuteSeededValue;
var enforceConsistency = (m, t, i) => {
  let tempo = t, mindset = m, intensity = i;
  if (mindset === "DEFENSIVE" && tempo === "FAST") tempo = "NORMAL";
  if (mindset === "OFFENSIVE") {
    if (tempo === "SLOW") tempo = "NORMAL";
    if (intensity === "CAUTIOUS") intensity = "NORMAL";
  }
  return { tempo, mindset, intensity };
};
var getTopLineAvg2 = (players, pos, topN) => {
  const line = players.filter((p) => p.position === pos).sort((a, b) => b.overallRating - a.overallRating).slice(0, topN);
  if (line.length === 0) return 60;
  return line.reduce((s, p) => s + p.overallRating, 0) / line.length;
};
var getStakesWeight = (stakes) => {
  if (stakes === "TITLE_RACE") return 1;
  if (stakes === "RELEGATION_FIGHT") return 1.15;
  if (stakes === "EUROPE_RACE") return 0.78;
  if (stakes === "LOW_STAKES") return 0.16;
  return 0.42;
};
var pickInMatchPassing = (seed, minute, coachAccuracy, paceGap, techGap, accurateOffset, randomOffset) => {
  if (seededRng2(seed, minute, accurateOffset) < coachAccuracy) {
    if (paceGap >= 3) return "LONG";
    if (paceGap <= -3 || techGap >= 3) return "SHORT";
    return "MIXED";
  }
  const opts = ["SHORT", "MIXED", "LONG"];
  return opts[Math.floor(seededRng2(seed, minute, randomOffset) * 3)];
};
var AiCoachTacticsService = {
  // ─── ANALIZA PRZEDMECZOWA ─────────────────────────────────────────────────
  // Trener AI analizuje drużynę gracza i ustawia instrukcje startowe.
  // decisionMaking → jakość analizy; experience → zakres analizowanych sygnałów.
  decidePreMatchInstructions: (ownClub, ownCoach, ownPlayers, userClub, userPlayers, userTacticId, seed, opponentReport) => {
    const decisionMaking = ownCoach?.attributes.decisionMaking ?? 50;
    const experience = ownCoach?.attributes.experience ?? 50;
    const userFwdAvg = opponentReport?.perceivedLineStrengths.attack ?? getTopLineAvg2(userPlayers, "FWD" /* FWD */, 3);
    const userDefAvg = opponentReport?.perceivedLineStrengths.defense ?? getTopLineAvg2(userPlayers, "DEF" /* DEF */, 4);
    const userTacticDefBias = TacticRepository.getById(opponentReport?.predictedTacticId ?? userTacticId)?.defenseBias ?? 50;
    const repDiff = ownClub.reputation - userClub.reputation;
    const defensiveStartJustified = opponentReport ? !!opponentReport.defensiveStartSelected && isDefensiveStartJustified(
      opponentReport.perceivedOpponentToAiPowerRatio,
      opponentReport.matchEnvironment ?? "DOMESTIC_LEAGUE"
    ) : repDiff <= -3;
    let signalScore = 0;
    if (opponentReport) {
      if (opponentReport.recommendedApproach === "PRESS") signalScore += 2;
      if (opponentReport.recommendedApproach === "DIRECT") signalScore += 1;
      if (opponentReport.recommendedApproach === "CONTROL") signalScore += 0.5;
      if (opponentReport.recommendedApproach === "COUNTER") signalScore -= defensiveStartJustified ? 1.5 : 0.5;
      if (opponentReport.recommendedApproach === "LOW_BLOCK") signalScore -= defensiveStartJustified ? 2 : 0.25;
      if (defensiveStartJustified) signalScore -= 0.75;
      if (opponentReport.predictedStyle === "OFFENSIVE") signalScore -= defensiveStartJustified ? 1 : 0.25;
      if (opponentReport.predictedStyle === "DEFENSIVE") signalScore += 1;
      if (opponentReport.perceivedFatigueLevel === "EXHAUSTED") signalScore += 1.5;
      else if (opponentReport.perceivedFatigueLevel === "TIRED") signalScore += 0.75;
    } else if (experience < 40) {
      signalScore = repDiff >= 2 ? 1 : repDiff <= -2 ? -1 : 0;
    } else {
      if (userDefAvg < 58) signalScore += 2;
      else if (userDefAvg < 65) signalScore += 1;
      if (userFwdAvg > 72) signalScore -= 2;
      else if (userFwdAvg > 65) signalScore -= 1;
      if (userTacticDefBias > 65) signalScore += 1;
      if (userTacticDefBias < 40) signalScore -= 1;
      if (repDiff >= 3) signalScore += 2;
      else if (repDiff >= 1) signalScore += 1;
      else if (repDiff <= -3) signalScore -= 2;
      else if (repDiff <= -1) signalScore -= 1;
    }
    let mindset;
    let tempo;
    let intensity;
    if (signalScore >= 2) {
      mindset = "OFFENSIVE";
      tempo = "FAST";
      intensity = "NORMAL";
    } else if (signalScore <= -2) {
      mindset = "DEFENSIVE";
      tempo = "SLOW";
      intensity = "CAUTIOUS";
    } else {
      mindset = "NEUTRAL";
      tempo = "NORMAL";
      intensity = "NORMAL";
    }
    const decisionNoiseChance = opponentReport ? Math.max(0.03, 0.32 - opponentReport.confidence * 0.25) : decisionMaking < 40 ? 0.35 : 0;
    if (decisionNoiseChance > 0) {
      const rng1 = seededRng2(seed, 0, 301);
      if (rng1 < decisionNoiseChance) {
        const rng2 = seededRng2(seed, 0, 302);
        const opts = defensiveStartJustified ? ["DEFENSIVE", "NEUTRAL"] : ["NEUTRAL", "OFFENSIVE"];
        mindset = opts[Math.floor(rng2 * opts.length)];
      }
    }
    const consistent = enforceConsistency(mindset, tempo, intensity);
    const wantsCounter = opponentReport?.recommendedApproach === "COUNTER" || opponentReport?.recommendedApproach === "LOW_BLOCK";
    const wantsPressing = opponentReport?.recommendedApproach === "PRESS" && !wantsCounter && consistent.mindset !== "DEFENSIVE";
    const ownPaceAvg = ownPlayers.length > 0 ? ownPlayers.reduce((s, p) => s + p.attributes.pace, 0) / ownPlayers.length : 60;
    const ownTechAvg = ownPlayers.length > 0 ? ownPlayers.reduce((s, p) => s + p.attributes.technique, 0) / ownPlayers.length : 60;
    const ownHeadingAvg = ownPlayers.length > 0 ? ownPlayers.reduce((s, p) => s + p.attributes.heading, 0) / ownPlayers.length : 60;
    const ownAggAvg = ownPlayers.length > 0 ? ownPlayers.reduce((s, p) => s + p.attributes.aggression, 0) / ownPlayers.length : 60;
    const userPaceAvgPre = userPlayers.length > 0 ? userPlayers.reduce((s, p) => s + p.attributes.pace, 0) / userPlayers.length : 60;
    const userTechAvgPre = userPlayers.length > 0 ? userPlayers.reduce((s, p) => s + p.attributes.technique, 0) / userPlayers.length : 60;
    const userHeadingAvgPre = userPlayers.length > 0 ? userPlayers.reduce((s, p) => s + p.attributes.heading, 0) / userPlayers.length : 60;
    const userAggAvgPre = userPlayers.length > 0 ? userPlayers.reduce((s, p) => s + p.attributes.aggression, 0) / userPlayers.length : 60;
    const preCoachScore = (experience * 0.55 + decisionMaking * 0.45) / 100;
    const preCoachAccuracy = 0.35 + preCoachScore * 0.5;
    const prePaceGap = ownPaceAvg - userPaceAvgPre;
    const preTechGap = ownTechAvg - userTechAvgPre;
    const preHeadingGap = ownHeadingAvg - userHeadingAvgPre;
    const preAggGap = ownAggAvg - userAggAvgPre;
    let passScore = 0;
    if (prePaceGap >= 3) passScore += 2;
    if (prePaceGap <= -3) passScore -= 2;
    if (preTechGap >= 3) passScore -= 2;
    if (preTechGap <= -3) passScore += 2;
    if (preHeadingGap >= 3) passScore += 1;
    if (preHeadingGap <= -3) passScore -= 1;
    if (preAggGap <= -3) passScore -= 1;
    let prePassing = "MIXED";
    if (seededRng2(seed, 0, 303) < preCoachAccuracy) {
      if (passScore >= 2) prePassing = "LONG";
      else if (passScore <= -2) prePassing = "SHORT";
    } else {
      const opts = ["SHORT", "MIXED", "LONG"];
      prePassing = opts[Math.floor(seededRng2(seed, 0, 304) * 3)];
    }
    console.log(
      `[AI PRE] ${ownClub.name} | pace gap=${prePaceGap.toFixed(1)} tech gap=${preTechGap.toFixed(1)} heading gap=${preHeadingGap.toFixed(1)} agg gap=${preAggGap.toFixed(1)} | passScore=${passScore} acc=${preCoachAccuracy.toFixed(2)} \u2192 ${prePassing}`
    );
    return {
      ...consistent,
      pressing: wantsPressing ? "PRESSING" : "NORMAL",
      counterAttack: wantsCounter ? "COUNTER" : "NORMAL",
      passing: prePassing
    };
  },
  // ─── DECYZJA W TRAKCIE MECZU ─────────────────────────────────────────────
  // Co 10-20 min trener AI ocenia sytuację i aktualizuje instrukcje.
  // Zwraca null jeśli trener decyduje się nic nie zmieniać.
  decideInMatchInstructions: (aiScoreDiff, aiMomentum, minute, decisionMaking, experience, lastGoalBoostMinute, seed, userMindset, userTacticAttackBias, aiTacticDefenseBias, context) => {
    const rng1 = seededRng2(seed, minute, 401);
    const rng2 = seededRng2(seed, minute, 402);
    const rng3 = seededRng2(seed, minute, 403);
    const aiSentOffCount = context?.aiSentOffCount ?? 0;
    if (aiSentOffCount > 0) {
      const coachScore2 = (experience * 0.55 + decisionMaking * 0.45) / 100;
      const defensiveChance = 0.3 + coachScore2 * 0.62;
      const mindset2 = rng1 < defensiveChance ? "DEFENSIVE" : "NEUTRAL";
      const slowChance = 0.2 + experience / 100 * 0.68;
      const tempo2 = rng2 < slowChance ? "SLOW" : "NORMAL";
      const paceGap2 = (context?.aiPaceAvg ?? 60) - (context?.userPaceAvg ?? 60);
      const techGap2 = (context?.aiTechAvg ?? 60) - (context?.userTechAvg ?? 60);
      const coachAccuracy2 = 0.4 + coachScore2 * 0.5;
      let passing2 = "MIXED";
      if (rng3 < coachAccuracy2) {
        if (paceGap2 >= 3) passing2 = "LONG";
        else if (paceGap2 <= -3 || techGap2 >= 3) passing2 = "SHORT";
      } else {
        const opts = ["SHORT", "MIXED", "LONG"];
        passing2 = opts[Math.floor(seededRng2(seed, minute, 704) * 3)];
      }
      const base = enforceConsistency(mindset2, tempo2, "NORMAL");
      return { ...base, pressing: "NORMAL", counterAttack: "COUNTER", passing: passing2 };
    }
    const isSecondHalfDecisionWindow = minute >= 46 && minute <= 75;
    const aiAvgFatigue = context?.aiAvgFatigue ?? 100;
    const aiLowestFatigue = context?.aiLowestFatigue ?? 100;
    const aiShots = context?.aiShots ?? 0;
    const userShots = context?.userShots ?? 0;
    const aiShotsOnTarget = context?.aiShotsOnTarget ?? 0;
    const userShotsOnTarget = context?.userShotsOnTarget ?? 0;
    const aiSubsRemaining = context?.aiSubsRemaining ?? 5;
    const userAvgFatigue = context?.userAvgFatigue ?? 100;
    const userLowestFatigue = context?.userLowestFatigue ?? 100;
    const userSubsRemaining = context?.userSubsRemaining ?? 5;
    const userSentOffCount = context?.userSentOffCount ?? 0;
    const userGoalkeeperCrisis = context?.userGoalkeeperCrisis ?? false;
    const userTempo = context?.userTempo ?? "NORMAL";
    const aiStakes = context?.aiStakes ?? "MID_TABLE";
    const userStakes = context?.userStakes ?? "MID_TABLE";
    const aiRank = context?.aiRank ?? 10;
    const userRank = context?.userRank ?? 10;
    const isLateSeason = context?.isLateSeason ?? false;
    const rivalryMultiplier = context?.rivalryMultiplier ?? 1;
    const shotBalance = aiShots - userShots;
    const sotBalance = aiShotsOnTarget - userShotsOnTarget;
    const gameLooksGood = aiMomentum >= 16 || shotBalance >= 2 || sotBalance >= 1;
    const gameLooksBad = aiMomentum <= -24 || shotBalance <= -3 || sotBalance <= -2;
    const seriousFatigue = aiAvgFatigue < 67 || aiLowestFatigue < 46;
    const isFinalPhase = minute >= 76;
    const isLastStand = minute >= 84;
    const aiStakesWeight = getStakesWeight(aiStakes);
    const userStakesWeight = getStakesWeight(userStakes);
    const pressureDrama = (isLateSeason ? aiStakesWeight : aiStakesWeight * 0.45) * rivalryMultiplier;
    const tablePressure = aiRank <= 5 || aiRank >= 13 || userRank <= 5 || userRank >= 13;
    const mustProtect = aiScoreDiff > 0 && (pressureDrama >= 0.7 || userStakesWeight >= 0.75 || tablePressure);
    const mustChase = aiScoreDiff < 0 && (pressureDrama >= 0.7 || aiStakes !== "LOW_STAKES");
    const avoidCollapse = aiScoreDiff <= -2 && (pressureDrama >= 0.9 || aiStakes === "RELEGATION_FIGHT");
    const paceGap = (context?.aiPaceAvg ?? 60) - (context?.userPaceAvg ?? 60);
    const techGap = (context?.aiTechAvg ?? 60) - (context?.userTechAvg ?? 60);
    const coachScore = (experience * 0.55 + decisionMaking * 0.45) / 100;
    const coachAccuracy = 0.35 + coachScore * 0.5;
    const passingForExploit = pickInMatchPassing(seed, minute, coachAccuracy, paceGap, techGap, 601, 602);
    let exploitScore = 0;
    const userIsPushing = userMindset === "OFFENSIVE" || userTempo === "FAST" || userTacticAttackBias >= 68;
    if (userMindset === "OFFENSIVE" && userTempo === "FAST") exploitScore += 1.35;
    else if (userIsPushing) exploitScore += 0.45;
    if (userTacticAttackBias >= 76) exploitScore += 0.55;
    if (userAvgFatigue < 72) exploitScore += 0.55;
    if (userLowestFatigue < 50) exploitScore += 0.75;
    if (userSubsRemaining <= 1 && minute >= 60) exploitScore += 0.45;
    if (userSubsRemaining >= 4 && aiSubsRemaining <= 2 && minute >= 60) exploitScore += 0.85;
    if (userSubsRemaining >= 4 && aiSubsRemaining === 0 && minute >= 70) exploitScore += 0.35;
    if (userSentOffCount > 0 && userIsPushing) exploitScore += 1.2;
    if (userGoalkeeperCrisis) exploitScore += 1.8;
    if (shotBalance >= -1 && sotBalance >= -1 && userIsPushing) exploitScore += 0.4;
    if (aiMomentum > -18 && userIsPushing) exploitScore += 0.35;
    if (aiScoreDiff >= 0 && userIsPushing) exploitScore += 0.35;
    if (aiScoreDiff <= -2) exploitScore -= 0.4;
    if (seriousFatigue) exploitScore -= 1.2;
    if (aiSentOffCount > 0) exploitScore -= 2;
    const exploitThreshold = coachScore >= 0.78 ? 1.35 : coachScore >= 0.62 ? 1.9 : coachScore >= 0.46 ? 2.55 : 99;
    const exploitReadChance = Math.max(
      0,
      Math.min(0.96, 0.18 + coachScore * 0.72 + Math.max(0, exploitScore - exploitThreshold) * 0.12)
    );
    if (exploitScore >= exploitThreshold && aiAvgFatigue > 58 && aiScoreDiff > -3 && rng2 < exploitReadChance) {
      const duration = 5 + Math.round(coachScore * 5) + Math.floor(seededRng2(seed, minute, 701) * 4);
      return {
        mindset: "OFFENSIVE",
        tempo: "FAST",
        intensity: aiAvgFatigue > 72 ? "AGGRESSIVE" : "NORMAL",
        pressing: aiAvgFatigue > 66 && coachScore >= 0.55 ? "PRESSING" : "NORMAL",
        counterAttack: "NORMAL",
        passing: passingForExploit,
        exploitUntilMinute: Math.min(90, minute + duration)
      };
    }
    let noActionChance = decisionMaking < 40 ? 0.4 : decisionMaking < 60 ? 0.15 : 0.05;
    if (isSecondHalfDecisionWindow) {
      if (gameLooksGood && aiScoreDiff >= 0 && !seriousFatigue) noActionChance += 0.16;
      if (gameLooksBad || seriousFatigue || aiScoreDiff < 0) noActionChance -= 0.12;
      noActionChance = Math.max(0.03, Math.min(0.58, noActionChance));
    } else if (isFinalPhase) {
      if (aiScoreDiff === 0 && aiStakes === "LOW_STAKES" && !gameLooksBad) noActionChance += 0.18;
      if (mustChase || mustProtect || seriousFatigue || gameLooksBad) noActionChance -= 0.16 + pressureDrama * 0.08;
      if (isLastStand && mustChase) noActionChance -= 0.1;
      noActionChance = Math.max(0.02, Math.min(0.55, noActionChance));
    }
    if (userMindset === "OFFENSIVE" && userTempo === "FAST" && !seriousFatigue) {
      noActionChance = Math.max(0.02, noActionChance - 0.08);
    }
    if (rng1 < noActionChance) return null;
    const lateThreshold = experience > 70 ? 40 : experience > 50 ? 55 : 65;
    let mindset = "NEUTRAL";
    let tempo = "NORMAL";
    let intensity = "NORMAL";
    const recentContactGoal = lastGoalBoostMinute >= 0 && minute - lastGoalBoostMinute < 10 && aiScoreDiff === -1;
    if (recentContactGoal) {
      return enforceConsistency("OFFENSIVE", "FAST", "NORMAL");
    }
    if (isSecondHalfDecisionWindow) {
      if (aiScoreDiff < 0) {
        if (gameLooksGood && !seriousFatigue) {
          mindset = "OFFENSIVE";
          tempo = "NORMAL";
          intensity = "NORMAL";
        } else if (seriousFatigue && aiSubsRemaining > 0) {
          mindset = "OFFENSIVE";
          tempo = "NORMAL";
          intensity = "NORMAL";
        } else {
          mindset = "OFFENSIVE";
          tempo = "FAST";
          intensity = aiAvgFatigue > 70 ? "AGGRESSIVE" : "NORMAL";
        }
      } else if (aiScoreDiff > 0) {
        if (seriousFatigue || gameLooksBad) {
          mindset = "DEFENSIVE";
          tempo = "SLOW";
          intensity = "CAUTIOUS";
        } else if (gameLooksGood && aiMomentum >= 28 && decisionMaking < 58) {
          mindset = "NEUTRAL";
          tempo = "NORMAL";
          intensity = "NORMAL";
        } else {
          mindset = "DEFENSIVE";
          tempo = "SLOW";
          intensity = "NORMAL";
        }
      } else {
        if (gameLooksGood && !seriousFatigue) {
          mindset = decisionMaking >= 62 ? "NEUTRAL" : "OFFENSIVE";
          tempo = decisionMaking >= 62 ? "NORMAL" : "FAST";
          intensity = "NORMAL";
        } else if (gameLooksBad) {
          mindset = "OFFENSIVE";
          tempo = aiAvgFatigue > 68 ? "FAST" : "NORMAL";
          intensity = aiAvgFatigue > 72 ? "AGGRESSIVE" : "NORMAL";
        } else if (seriousFatigue) {
          mindset = "NEUTRAL";
          tempo = "SLOW";
          intensity = "CAUTIOUS";
        } else {
          return null;
        }
      }
    } else if (isFinalPhase) {
      if (aiScoreDiff < 0) {
        if (avoidCollapse && minute < 86 && gameLooksBad && aiAvgFatigue < 61) {
          mindset = "NEUTRAL";
          tempo = "NORMAL";
          intensity = "NORMAL";
        } else if (isLastStand && mustChase && aiAvgFatigue >= 58) {
          mindset = "OFFENSIVE";
          tempo = "FAST";
          intensity = "AGGRESSIVE";
        } else if (mustChase) {
          mindset = "OFFENSIVE";
          tempo = seriousFatigue ? "NORMAL" : "FAST";
          intensity = aiAvgFatigue > 66 ? "AGGRESSIVE" : "NORMAL";
        } else if (aiStakes === "LOW_STAKES" && aiScoreDiff <= -2 && gameLooksBad) {
          mindset = "NEUTRAL";
          tempo = "SLOW";
          intensity = "CAUTIOUS";
        } else {
          mindset = "OFFENSIVE";
          tempo = "NORMAL";
          intensity = "NORMAL";
        }
      } else if (aiScoreDiff > 0) {
        if (mustProtect || isLastStand) {
          mindset = "DEFENSIVE";
          tempo = "SLOW";
          intensity = seriousFatigue ? "CAUTIOUS" : "NORMAL";
        } else if (gameLooksGood && aiScoreDiff >= 2) {
          mindset = "NEUTRAL";
          tempo = "SLOW";
          intensity = "CAUTIOUS";
        } else {
          mindset = "DEFENSIVE";
          tempo = "SLOW";
          intensity = "NORMAL";
        }
      } else {
        if (aiStakes === "LOW_STAKES" && !gameLooksBad) {
          mindset = "NEUTRAL";
          tempo = "SLOW";
          intensity = "CAUTIOUS";
        } else if ((aiStakes === "TITLE_RACE" || aiStakes === "EUROPE_RACE") && gameLooksGood && !seriousFatigue) {
          mindset = "OFFENSIVE";
          tempo = "FAST";
          intensity = minute >= 84 ? "AGGRESSIVE" : "NORMAL";
        } else if (aiStakes === "RELEGATION_FIGHT" && userStakes === "RELEGATION_FIGHT") {
          mindset = gameLooksBad ? "DEFENSIVE" : "NEUTRAL";
          tempo = gameLooksBad ? "SLOW" : "NORMAL";
          intensity = seriousFatigue ? "CAUTIOUS" : "NORMAL";
        } else if (gameLooksBad && !seriousFatigue) {
          mindset = "OFFENSIVE";
          tempo = "FAST";
          intensity = "NORMAL";
        } else {
          return null;
        }
      }
    } else if (aiScoreDiff <= -2) {
      mindset = "OFFENSIVE";
      tempo = "FAST";
      intensity = "NORMAL";
    } else if (aiScoreDiff === -1 && minute >= lateThreshold) {
      mindset = "OFFENSIVE";
      tempo = "FAST";
      intensity = "AGGRESSIVE";
    } else if (aiScoreDiff === -1) {
      mindset = "OFFENSIVE";
      tempo = "NORMAL";
      intensity = "NORMAL";
    } else if (aiScoreDiff >= 3) {
      mindset = "NEUTRAL";
      tempo = "SLOW";
      intensity = "CAUTIOUS";
    } else if (aiScoreDiff === 1 && minute > 80) {
      mindset = "DEFENSIVE";
      tempo = "SLOW";
      intensity = "AGGRESSIVE";
    } else if (aiScoreDiff === 1 && minute > 70) {
      mindset = "DEFENSIVE";
      tempo = "SLOW";
      intensity = "NORMAL";
    } else if (aiMomentum < -67) {
      mindset = "NEUTRAL";
      tempo = "SLOW";
      intensity = "AGGRESSIVE";
    } else if (aiMomentum > 50 && aiScoreDiff === 0) {
      mindset = "OFFENSIVE";
      tempo = "FAST";
      intensity = "NORMAL";
    } else {
      return null;
    }
    if (decisionMaking < 50) {
      const deviationChance = (50 - decisionMaking) / 100;
      if (rng2 < deviationChance) {
        const which = Math.floor(rng3 * 3);
        if (which === 0) {
          const tempos = ["SLOW", "NORMAL", "FAST"];
          tempo = tempos[Math.floor(rng3 * 3)];
        } else if (which === 1) {
          const mindsets = ["DEFENSIVE", "NEUTRAL", "OFFENSIVE"];
          mindset = mindsets[Math.floor(rng3 * 3)];
        } else {
          const intensities = ["CAUTIOUS", "NORMAL", "AGGRESSIVE"];
          intensity = intensities[Math.floor(rng3 * 3)];
        }
      }
    }
    let pressing = "NORMAL";
    let counterAttack = "NORMAL";
    const aiIsDefensive = aiTacticDefenseBias >= 55 || aiScoreDiff > 0;
    const userIsOffensive = userTacticAttackBias >= 60 || userMindset === "OFFENSIVE";
    if (aiIsDefensive && userIsOffensive && mindset !== "OFFENSIVE") {
      let counterChance;
      if (experience >= 70 && decisionMaking >= 60) counterChance = 0.45;
      else if (experience >= 55) counterChance = 0.25;
      else if (experience >= 40) counterChance = 0.1;
      else counterChance = 0.04;
      if (seededRng2(seed, minute, 501) < counterChance) counterAttack = "COUNTER";
      else if (experience < 40 && seededRng2(seed, minute, 502) < 0.05) counterAttack = "COUNTER";
    }
    if (counterAttack !== "COUNTER") {
      const pressingCondition = mindset === "OFFENSIVE" && !seriousFatigue || aiMomentum > 30 && aiAvgFatigue > 66;
      if (pressingCondition) {
        let pressingChance;
        if (experience >= 70) pressingChance = 0.35;
        else if (experience >= 55) pressingChance = 0.2;
        else if (experience >= 40) pressingChance = 0.08;
        else pressingChance = 0.03;
        if (seededRng2(seed, minute, 503) < pressingChance) pressing = "PRESSING";
      } else if (experience < 40 && seededRng2(seed, minute, 504) < 0.04) {
        pressing = "PRESSING";
      }
    }
    if ((isSecondHalfDecisionWindow || isFinalPhase) && seriousFatigue && aiScoreDiff >= 0) {
      pressing = "NORMAL";
      counterAttack = aiScoreDiff > 0 && userIsOffensive ? "COUNTER" : counterAttack;
    }
    if (isFinalPhase && mustChase && !seriousFatigue && counterAttack !== "COUNTER" && aiAvgFatigue > 60) {
      pressing = experience >= 55 || pressureDrama >= 0.75 ? "PRESSING" : pressing;
    }
    let passing = pickInMatchPassing(seed, minute, coachAccuracy, paceGap, techGap, 601, 602);
    const aiTacticId = context?.aiTacticId;
    const userTacticId = context?.userTacticId;
    if (aiTacticId && userTacticId) {
      const matrix = TacticalInstructionMatrixService.getMatrixRecommendation({
        aiTacticId,
        opponentTacticId: userTacticId,
        opponentTempo: userTempo,
        opponentMindset: userMindset,
        intendedTempo: tempo,
        intendedMindset: mindset,
        intendedIntensity: intensity,
        aiScoreDiff,
        aiMomentum,
        aiAvgFatigue,
        aiLowestFatigue,
        paceGap,
        techGap,
        minute,
        pressureDrama
      });
      const matrixTrust = Math.max(
        0.2,
        Math.min(0.95, 0.25 + coachScore * 0.45 + matrix.confidence * 0.35)
      );
      const mustUseMatrix = matrix.reason === "counter_overcommit" || matrix.reason === "protect_lead" || matrix.reason === "chase_game" || matrix.reason === "fatigue_safety";
      if (mustUseMatrix || seededRng2(seed, minute, 606) < matrixTrust) {
        tempo = matrix.tempo;
        mindset = matrix.mindset;
        intensity = matrix.intensity;
        passing = matrix.passing;
        pressing = matrix.pressing;
        counterAttack = matrix.counterAttack;
      }
    }
    console.log(
      `[AI IN-MATCH min=${minute}] pace gap=${paceGap.toFixed(1)} tech gap=${techGap.toFixed(1)} acc=${coachAccuracy.toFixed(2)} \u2192 ${passing} | mindset=${mindset} tempo=${tempo}`
    );
    return { ...enforceConsistency(mindset, tempo, intensity), pressing, counterAttack, passing };
  }
};

// services/ManagerNegotiationInfluenceService.ts
var clamp4 = (value, min, max) => Math.min(max, Math.max(min, value));
var getExperience = (managerProfile) => {
  if (!managerProfile || !Number.isFinite(managerProfile.experience)) return 50;
  return clamp4(managerProfile.experience, 1, 99);
};
var ManagerNegotiationInfluenceService = {
  calculate(managerProfile) {
    const experience = getExperience(managerProfile);
    const normalized = clamp4((experience - 50) / 49, -1, 1);
    return {
      experience,
      normalized,
      scoreAdjustment: Math.round(normalized * 8),
      chanceAdjustment: normalized * 0.06,
      expectationMultiplier: clamp4(1 - normalized * 0.045, 0.955, 1.045),
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
var clamp5 = (value, min, max) => Math.max(min, Math.min(max, value));
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
      return 0.94 + clamp5(careerMatches / 260, 0, 1) * 0.2;
    case "GK" /* GK */:
      return 0.92 + clamp5(careerMatches / 240, 0, 1) * 0.24;
    default:
      return 0.94 + clamp5(careerMatches / 260, 0, 1) * 0.08;
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
  const sampleFactor = clamp5(minutesPlayed / 900, 0, 1);
  const ratingDelta = averageRating === null ? 0 : averageRating - 6.7;
  switch (player.position) {
    case "FWD" /* FWD */: {
      const goalsPer90 = goals / fullMatches;
      const assistsPer90 = assists / fullMatches;
      const goalsBoost = clamp5(goals / 20, 0, 1) * 0.2 + clamp5(goalsPer90 / 0.75, 0, 1) * 0.18;
      const assistsBoost = clamp5(assists / 10, 0, 1) * 0.07 + clamp5(assistsPer90 / 0.35, 0, 1) * 0.05;
      const ratingBoost = clamp5(ratingDelta * 0.1, -0.08, 0.1);
      return 1 + clamp5(sampleFactor * (goalsBoost + assistsBoost + ratingBoost), -0.1, 0.52);
    }
    case "MID" /* MID */: {
      const goalsPer90 = goals / fullMatches;
      const assistsPer90 = assists / fullMatches;
      const assistsBoost = clamp5(assists / 14, 0, 1) * 0.18 + clamp5(assistsPer90 / 0.45, 0, 1) * 0.15;
      const goalsBoost = clamp5(goals / 12, 0, 1) * 0.08 + clamp5(goalsPer90 / 0.35, 0, 1) * 0.06;
      const ratingBoost = clamp5(ratingDelta * 0.11, -0.08, 0.12);
      return 1 + clamp5(sampleFactor * (assistsBoost + goalsBoost + ratingBoost), -0.1, 0.46);
    }
    case "DEF" /* DEF */: {
      const matchFactor = clamp5(matchesPlayed / 30, 0, 1) * 0.1;
      const experienceBoost = clamp5(getCareerMatches(player) / 260, 0, 1) * 0.12;
      const ratingBoost = averageRating === null ? 0 : clamp5((averageRating - 6.6) * 0.18, -0.1, 0.22) * clamp5(matchesPlayed / 10, 0, 1);
      return 1 + clamp5(matchFactor + experienceBoost + ratingBoost, -0.1, 0.42);
    }
    case "GK" /* GK */: {
      const matchFactor = clamp5(matchesPlayed / 30, 0, 1) * 0.1;
      const experienceBoost = clamp5(getCareerMatches(player) / 240, 0, 1) * 0.14;
      const ratingBoost = averageRating === null ? 0 : clamp5((averageRating - 6.6) * 0.22, -0.1, 0.24) * clamp5(matchesPlayed / 8, 0, 1);
      return 1 + clamp5(matchFactor + experienceBoost + ratingBoost, -0.12, 0.46);
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
  const reputationFactor = 0.88 + clamp5(reputation, 1, 10) * 0.025;
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
  return clamp5(countryFactor * reputationFactor * stadiumFactor * competitionFactor / 1.45, 0.45, 2.6);
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
  const marketFactor = clamp5(0.5 + Math.sqrt(financeFactor / 1.45) * 0.55, 0.45, 1.1);
  const capScale = clamp5(marketFactor / 0.9, 0.55, 1.22);
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
  const reputationFactor = 0.9 + clamp5(reputation, 1, 20) * 0.015;
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
    const reputationFactor = clamp5((Math.max(1, Math.min(10, reputation)) - 4) / 6, 0, 1);
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
        return Math.round(clamp5(rawCost2, minFloor, maxCap));
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
      return Math.round(clamp5(rawCost2, 5e4, 8e7) / 1e3) * 1e3;
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
    return Math.round(clamp5(rawCost, tierMin, tierMax) / 1e3) * 1e3;
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
    const salaryCap = club.budget * 0.25;
    if (proposedSalary > salaryCap) {
      return { approved: false, reason: `DYREKTOR FINANSOWY: Proponowana pensja przekracza 25% naszego bud\u017Cetu transferowego (limit: ${Math.floor(salaryCap).toLocaleString()} PLN).` };
    }
    const highestSalary = squad.length > 0 ? Math.max(...squad.map((p) => p.annualSalary)) : 0;
    if (proposedSalary > highestSalary * 2 && highestSalary > 0 && player.overallRating < 82) {
      return {
        approved: false,
        reason: `PREZES: Ta oferta zniszczy nasz\u0105 hierarchi\u0119 w szatni! Nie damy nowemu graczowi dwa razy wi\u0119cej ni\u017C zarabia nasz najlepszy zawodnik (${highestSalary.toLocaleString()} PLN).`
      };
    }
    const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
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
    return Math.round(clamp5(maxPrice, 45, 420));
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
    const seasonTicketShare = clamp5(0.14 + marketIndex * 0.1 + club.reputation / 20 * 0.18, 0.16, 0.65);
    const ticketsSold = Math.floor(club.stadiumCapacity * seasonTicketShare);
    const singleMatchPrice = FinanceService.calculateTicketPriceForClub(club);
    const seasonDiscount = clamp5(0.68 + marketIndex * 0.05, 0.7, 0.82);
    const seasonTicketPrice = Math.round(clamp5(singleMatchPrice * 19 * seasonDiscount, 900, 8500));
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
var clamp6 = (value, min, max) => Math.max(min, Math.min(max, value));
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
    return clamp6(goalsPerMatch * 20 + assistsPerMatch * 8 - (goalsPerMatch === 0 ? 8 : 0), -10, 14);
  }
  if (player.position === "MID" /* MID */) {
    return clamp6(contributionsPerMatch * 18, -4, 12);
  }
  if (player.position === "GK" /* GK */) {
    return clamp6(cleanSheetRate * 18 - (cleanSheetRate === 0 ? 4 : 0), -8, 14);
  }
  return clamp6(contributionsPerMatch * 10, -4, 8);
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
      score += clamp6((seasonAverage - 6.5) * 10, -18, 22);
    }
    if (recent10Average !== null) {
      score += clamp6((recent10Average - 6.5) * 14, -22, 28);
    }
    if (recentAverage !== null) {
      score += clamp6((recentAverage - 6.5) * 8, -12, 16);
    }
    if (recentAverage !== null && previousAverage !== null) {
      score += clamp6((recentAverage - previousAverage) * 10, -10, 10);
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
    score += clamp6(((player.morale ?? 50) - 50) * 0.1, -5, 5);
    if (matches > 0 || recentAverage !== null) score += player.trainingFocus ? 2 : 0;
    if (player.health?.status === "INJURED" /* INJURED */) score -= 18;
    if ((player.condition ?? 100) < 60) score -= 8;
    if ((player.fatigueDebt ?? 0) > 55) score -= 6;
    return PlayerFormService.getInfo(Math.round(clamp6(score, 0, 100)));
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
      return clamp6(adjustment - strainPenalty, -9, 7);
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
    const safeScore = Math.round(clamp6(score, 0, 100));
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
var seededRng3 = (seed, offset) => {
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
  const randomPremium = seededRng3(seed, 29) * 0.05;
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
var getRandomSeasonSuccessLevelUpSteps = (seed, offset) => seededRng3(seed, offset) < 0.5 ? 1 : 2;
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
    const roll = Math.max(0, Math.min(0.999, seededRng3(seed, 3) + ageBias + mentalityBias));
    const stars = roll < 0.16 ? 1 : roll < 0.36 ? 2 : roll < 0.66 ? 3 : roll < 0.88 ? 4 : 5;
    const ranges = {
      1: [10, 20],
      2: [25, 35],
      3: [45, 64],
      4: [68, 79],
      5: [84, 95]
    };
    const [min, max] = ranges[stars] ?? ranges[3];
    const variation = Math.floor(seededRng3(seed, 11) * (max - min + 1));
    return PlayerMoraleService.clamp(min + variation);
  },
  getInitialPersonality: (player) => {
    const attrs = player.attributes;
    if ((attrs.workRate ?? 50) >= 75 && (attrs.mentality ?? 50) >= 68) return "PROFESSIONAL";
    if ((attrs.talent ?? 50) >= 78 || (attrs.attacking ?? 50) >= 76) return "AMBITIOUS";
    if ((attrs.leadership ?? 50) >= 76) return "CONFIDENT";
    if ((attrs.aggression ?? 50) >= 76) return "EGOIST";
    const index = Math.floor(seededRng3(stableHash(player.id), 7) * PERSONALITIES.length);
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
      history: existing.history ?? []
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
        history: [entry, ...current.history ?? []].slice(0, 16)
      }
    };
  },
  ensurePlayerState: (player) => ({
    ...player,
    form: typeof player.form === "number" ? player.form : PlayerFormService.calculate(player).score,
    morale: player.morale ?? PlayerMoraleService.getInitialMorale(player),
    moralePersonality: player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player),
    moraleHistory: player.moraleHistory ?? [],
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
    const gratitudeScore = (withMorale.morale ?? 50) * 0.14 + mindset.clubHappiness * 0.24 + mindset.squadBelonging * 0.18 + mindset.coachTrust * 0.1 - mindset.conflictLevel * 0.18 + (personality === "LOYAL" || personality === "PROFESSIONAL" ? 10 : 0) + (personality === "EGOIST" || personality === "AMBITIOUS" ? -4 : 0) + seededRng3(seed, 31) * 24;
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
    const roll = seededRng3(seed, 71);
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
      moraleHistory: [entry, ...withMorale.moraleHistory ?? []].slice(0, 12)
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
    const rng = seededRng3(seed + stableHash(player.id) + currentDate.getTime(), talkType.length);
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
    const swing = 1 + Math.floor(seededRng3(seed, talkType.charCodeAt(0)) * 3);
    const backfireRisk = 0.22 + (talkType === "CRITICIZE" || talkType === "DEMAND_WORK" ? 0.18 : 0) + (talkType === "PROMISE_MINUTES" ? 0.1 : 0) + (personality === "SENSITIVE" || personality === "NERVOUS" ? 0.18 : 0) + (personality === "EGOIST" ? 0.1 : 0);
    const backfireRoll = seededRng3(seed + stableHash(player.id), talkType.charCodeAt(0) + 31);
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
      const transferRandomFactor = Math.floor(seededRng3(stableHash(`${withMorale.id}_${dateKey}`), 43) * 13) - 6;
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
        const roll = seededRng3(seed, 19);
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
      const budgetNoise = (seededRng3(localSeed, 11) - 0.5) * 0.2 * (1.25 - accuracy);
      const perceivedBudget = Math.max(0, nextClub.budget * (1 + budgetNoise));
      const rawAmount = 2e4 + performanceScore * 650 + generosity * 5e3 + (seededRng3(localSeed, 17) - 0.5) * 2e4;
      const amount = roundOneTimeBonusAmount(rawAmount);
      const budgetScore = Math.max(0, Math.min(100, perceivedBudget / Math.max(1, amount) * 42));
      const rngScore = (seededRng3(localSeed, 23) - 0.5) * 20;
      const decisionScore = performanceScore * 0.55 + budgetScore * 0.25 + generosity * 6 + ambition * 4 - greed * 6 + rngScore;
      const seasonLimitReached = (nextClub.oneTimePlayerBonusesThisSeason ?? 0) >= 11;
      const alreadyAwarded = withMorale.oneTimeBonusAwardedSeason === seasonNumber;
      const hasEnoughBudget = nextClub.budget >= amount;
      const approved = !seasonLimitReached && !alreadyAwarded && hasEnoughBudget && performanceScore >= 48 && decisionScore >= 62;
      const ceoName = nextClub.management?.ceo ? `${nextClub.management.ceo.firstName} ${nextClub.management.ceo.lastName}` : "Zarz\u0105d Klubu";
      const statsLine = getOneTimeBonusStatsLine(withMorale, profile);
      const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
      if (approved) {
        const reactionRoll = seededRng3(localSeed, 37);
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
      const sellScore = boardAttributeScore(club.board?.chciwosc) * 2.5 + (club.transferBudget < marketValue * 0.35 ? 4 : 0) + (club.budget < marketValue * 0.2 ? 3 : 0) + Math.min(4, marketValue / Math.max(1, annualSalary * 3)) + seededRng3(seed, 17) * 9 - 4.5;
      const budgetCoversRaise = raiseRequest ? club.budget >= raiseRequest.salary * 0.5 : club.budget >= annualSalary * 1.3;
      const boardConfidence = club.boardConfidence ?? 60;
      const managerBonus = boardConfidence / 100 * seededRng3(seed, 7) * 5;
      const poorRelationBoost = boardConfidence < 40 ? (1 - boardConfidence / 100) * seededRng3(seed, 89) * 4 : 0;
      const raiseScore = boardAttributeScore(club.board?.hojnosc) * 2.2 + (budgetCoversRaise ? 3.5 : -2) + (rank <= 3 ? 2.5 : rank <= 6 ? 1.5 : 0) + managerBonus + seededRng3(seed, 31) * 7 - 3.5;
      const directorPersonalityMod = (() => {
        const p = club.sportingDirector?.personality;
        if (p === "CONTROLLER") return 3;
        if (p === "POLITICIAN") return 2;
        if (p === "ACCOUNTANT") return 1;
        if (p === "PARTNER") return -2;
        if (p === "TALENT_HUNTER") return -2;
        return 0;
      })();
      const vetoScore = boardAttributeScore(club.board?.cierpliwosc) * 2 + (club.sportingDirectorBoardInfluence ?? 50) / 100 * 6 + (boardConfidence > 70 ? 2 : boardConfidence > 50 ? 0 : -2) + directorPersonalityMod + poorRelationBoost + seededRng3(seed, 53) * 6 - 3;
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

// services/AiLeagueMatchPlanService.ts
var clamp7 = (value, min, max) => Math.max(min, Math.min(max, value));
var seededRng4 = getLegacySpreadOffsetSeededValue;
var getLineupPlayers = (players, lineup) => lineup.startingXI.map((id) => id ? players.find((player) => player.id === id) : null).filter((player) => !!player);
var getReadinessAverage = (players, lineup) => {
  const active = getLineupPlayers(players, lineup);
  if (active.length === 0) return 60;
  return active.reduce((sum, player) => sum + PlayerMoraleService.getEffectiveOverall(player), 0) / active.length;
};
var getMoraleAverage = (players, lineup) => {
  const active = getLineupPlayers(players, lineup);
  if (active.length === 0) return 50;
  return active.reduce((sum, player) => sum + (player.morale ?? 50), 0) / active.length;
};
var getStrength = (ratio) => {
  if (ratio <= 0.92) return "FAVORED";
  if (ratio < 1.25) return "EVEN";
  if (ratio < 1.5) return "CAUTIOUS";
  return "CLEAR_UNDERDOG";
};
var getApproach = (report2, ratio, defensiveStartSelected) => {
  if (defensiveStartSelected && isLowBlockStartJustified(ratio, report2.matchEnvironment)) return "LOW_BLOCK";
  if (isCautiousStartJustified(ratio)) return "COUNTER";
  if (ratio <= 0.92) {
    return report2.predictedStyle === "DEFENSIVE" || report2.perceivedWeakness === "DEFENSE" || report2.perceivedWeakness === "FITNESS" ? "PRESS" : "CONTROL";
  }
  if (report2.recommendedApproach === "LOW_BLOCK" || report2.recommendedApproach === "COUNTER") return "CONTROL";
  return report2.recommendedApproach;
};
var AiLeagueMatchPlanService = {
  createPlan: (params) => {
    const {
      report: report2,
      aiClub: aiClub2,
      aiCoach,
      aiPlayers,
      aiBaseLineup,
      userClub,
      userPlayers,
      userLineup,
      aiRank,
      userRank,
      isAiAway,
      seed
    } = params;
    const decisionMaking = aiCoach?.attributes.decisionMaking ?? 50;
    const experience = aiCoach?.attributes.experience ?? 50;
    const coachQuality = (decisionMaking * 0.52 + experience * 0.48) / 100;
    const reportTrustProbability = clamp7(0.24 + report2.confidence * 0.48 + coachQuality * 0.2, 0.28, 0.92);
    const source = seededRng4(seed, 910) < reportTrustProbability ? "REPORT" : "INTUITION";
    const aiReadiness = getReadinessAverage(aiPlayers, aiBaseLineup);
    const userReadiness = getReadinessAverage(userPlayers, userLineup);
    const aiMorale = getMoraleAverage(aiPlayers, aiBaseLineup);
    const userMorale = getMoraleAverage(userPlayers, userLineup);
    const observedRatio = aiReadiness > 0 ? userReadiness / aiReadiness : 1;
    const intuitionNoiseRange = 0.12 - coachQuality * 0.07;
    const intuitionNoise = (seededRng4(seed, 911) * 2 - 1) * intuitionNoiseRange;
    const rankGap = clamp7(userRank - aiRank, -10, 10);
    const rankConfidenceAdjustment = rankGap * -6e-3;
    const homeAdjustment = isAiAway ? 0.015 : -0.025;
    const intuitionRatio = observedRatio * (1 + intuitionNoise + rankConfidenceAdjustment + homeAdjustment);
    const reportRatio = report2.perceivedOpponentToAiPowerRatio ?? intuitionRatio;
    let effectiveRatio = source === "REPORT" ? reportRatio * 0.82 + intuitionRatio * 0.18 : intuitionRatio;
    const confidentStrongTeam = aiRank <= 5 && aiRank <= userRank && aiMorale >= 70 && observedRatio <= 1.1;
    if (confidentStrongTeam) effectiveRatio = Math.min(effectiveRatio, 1.24);
    effectiveRatio = clamp7(effectiveRatio, 0.55, 2.2);
    const defensiveStartChance = getDefensiveStartProbability(effectiveRatio);
    const defensiveStartSelected = defensiveStartChance > 0 && seededRng4(seed, 912) < defensiveStartChance;
    const recommendedApproach = getApproach(report2, effectiveRatio, defensiveStartSelected);
    const effectiveReport = {
      ...report2,
      perceivedOpponentToAiPowerRatio: effectiveRatio,
      defensiveStartChance,
      defensiveStartSelected,
      recommendedApproach,
      coachPlanResolved: true
    };
    const initialTacticId = AiOpponentAnalysisService.recommendStartingTactic(
      aiBaseLineup.tacticId,
      effectiveReport,
      aiClub2,
      userClub,
      aiPlayers,
      isAiAway,
      aiCoach
    );
    const initialInstructions = AiCoachTacticsService.decidePreMatchInstructions(
      aiClub2,
      aiCoach,
      aiPlayers,
      userClub,
      userPlayers,
      userLineup.tacticId,
      seed,
      effectiveReport
    );
    return {
      effectiveReport,
      plan: {
        source,
        reportTrustProbability,
        reportConfidence: report2.confidence,
        opponentToAiPowerRatio: effectiveRatio,
        strength: getStrength(effectiveRatio),
        recommendedApproach,
        defensiveStartChance,
        defensiveStartSelected,
        initialTacticId,
        initialInstructions,
        aiRank,
        userRank,
        aiMorale,
        userMorale
      }
    };
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
var clamp8 = (value, min, max) => Math.max(min, Math.min(max, value));
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
    return clamp8(0.72 + rating / 99 * 0.28, 0.72, 1);
  }
  return clamp8(1 - getPositionFamilyDistance(player.position, role) * 0.42, 0.54, 0.78);
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
    const qualityDrop = clamp8((naturalOverall - roleOverall) / 24, -0.25, 1);
    if (useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role)) {
      const secondaryGap = 1 - PlayerPositionFitService.getSecondaryRating(player) / 99;
      const raw2 = qualityDrop * 0.58 + secondaryGap * 0.32 + (1 - familiarity) * 0.1;
      return clamp8(Math.pow(Math.max(0, raw2), 1.25), 0.02, 0.55);
    }
    const raw = qualityDrop * 0.68 + familyDistance * 0.24 + (1 - familiarity) * 0.08;
    return clamp8(Math.pow(Math.max(0, raw), 1.18), 0.08, 1);
  },
  getFitScoreBonus: (player, role, useSecondaryPosition = false) => {
    if (player.position === role) return 16;
    if (isGoalkeeperMismatch(player, role)) return -80;
    const roleOverall = PlayerPositionFitService.getRoleOverall(player, role);
    const naturalOverall = Math.max(1, player.overallRating || getRoleOverall(player, player.position));
    const familiarity = getRoleFamiliarity(player, role, useSecondaryPosition);
    const roleQualityDelta = clamp8(roleOverall - naturalOverall, -18, 12);
    const base = useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role) ? 16 * (PlayerPositionFitService.getSecondaryRating(player) / 99) : -10 * getPositionFamilyDistance(player.position, role);
    return clamp8(base + roleQualityDelta * 0.55 + (familiarity - 0.65) * 12, -24, 16);
  },
  getSecondaryRating: (player) => Math.max(1, Math.min(99, player.secondaryPositionRating ?? DEFAULT_SECONDARY_POSITION_RATING)),
  getRoleOverall,
  // Effective role overall is the number the match engine should use when team strength depends on
  // who is actually occupying each tactical slot during the live match.
  getEffectiveRoleOverall: (player, role, useSecondaryPosition = false) => {
    if (player.position === role) return clamp8(Math.round(player.overallRating || getRoleOverall(player, role)), 1, 99);
    if (isGoalkeeperMismatch(player, role)) return Math.max(1, Math.round(getRoleOverall(player, role) * 0.35));
    const roleOverall = getRoleOverall(player, role);
    const penaltyFactor = PlayerPositionFitService.getPenaltyFactor(player, role, useSecondaryPosition);
    const familiarityDrag = player.position === role ? 0 : penaltyFactor * 8;
    return clamp8(Math.round(roleOverall - familiarityDrag), 1, 99);
  }
};

// services/TeamFormImpactService.ts
var clamp9 = (value, min, max) => Math.max(min, Math.min(max, value));
var average2 = (values, fallback) => values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;
var getPlayerForm = (player) => player ? player.form ?? PlayerFormService.calculate(player).score : 50;
var getPlayersByIds = (players, ids) => {
  const playerMap = new Map(players.map((player) => [player.id, player]));
  return ids.map((id) => id ? playerMap.get(id) : void 0).filter((player) => !!player);
};
var getBaseFormMultiplier = (form) => {
  const centered = (clamp9(form, 0, 100) - 50) / 50;
  const curve = Math.sign(centered) * Math.pow(Math.abs(centered), 1.18);
  return clamp9(1 + curve * 0.18, 0.82, 1.18);
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
    const awareness = clamp9(coachQuality / 100, 0.25, 1);
    const weight = 7 + awareness * 7;
    return clamp9((form - 50) / 50 * weight, -14, 14);
  },
  calculateMatchImpact(homePlayers, awayPlayers, homeLineup, awayLineup) {
    const homeQuality = getTeamQuality(homePlayers, homeLineup);
    const awayQuality = getTeamQuality(awayPlayers, awayLineup);
    const homeForm = getTeamForm(homePlayers, homeLineup);
    const awayForm = getTeamForm(awayPlayers, awayLineup);
    const homePerformance = adjustForQualityGap(getBaseFormMultiplier(homeForm), homeQuality, awayQuality);
    const awayPerformance = adjustForQualityGap(getBaseFormMultiplier(awayForm), awayQuality, homeQuality);
    const homeGoalChanceMultiplier = clamp9(homePerformance * getDefenseLeakMultiplier(awayPerformance), 0.72, 1.32);
    const awayGoalChanceMultiplier = clamp9(awayPerformance * getDefenseLeakMultiplier(homePerformance), 0.72, 1.32);
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
var hashString2 = (value) => {
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
  const roll = hashString2(`${seedKey}_${player.id}`) % 1e4 / 1e4;
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
var LineupService = {
  getSuspensionMatchesForCompetition,
  isUnavailableForLineup: (player, options = {}) => isUnavailableForLineup(player, options.competitionId),
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
      const preferred = [
        coach.favoriteTactics.neutral,
        coach.favoriteTactics.offensive,
        coach.favoriteTactics.defensive
      ];
      for (const favName of preferred) {
        const mappedId = FAVORITE_TACTIC_MAP[favName];
        if (mappedId && checkTacticFeasibility(players, mappedId)) {
          tacticId = mappedId;
          break;
        }
      }
    }
    const tactic = TacticRepository.getById(tacticId);
    const availablePlayers = players.filter(
      (p) => !isUnavailableForLineup(p, competitionId) && p.condition >= 60 && (p.health.status === "HEALTHY" /* HEALTHY */ || (p.health.injury?.daysRemaining ?? 0) <= 2)
    );
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

// tests/AiOpponentAnalysisTests.ts
var assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
var makePlayer = (id, position, level) => ({
  id,
  position,
  overallRating: level,
  condition: 100,
  morale: 82,
  suspensionMatches: 0,
  health: { status: "HEALTHY" /* HEALTHY */ },
  attributes: {
    strength: level,
    stamina: level,
    pace: level,
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
var makeSquad = (prefix, level) => [
  makePlayer(`${prefix}_gk_1`, "GK" /* GK */, level),
  makePlayer(`${prefix}_gk_2`, "GK" /* GK */, level - 2),
  ...Array.from({ length: 6 }, (_, index) => makePlayer(`${prefix}_def_${index}`, "DEF" /* DEF */, level - index % 2)),
  ...Array.from({ length: 7 }, (_, index) => makePlayer(`${prefix}_mid_${index}`, "MID" /* MID */, level - index % 2)),
  ...Array.from({ length: 4 }, (_, index) => makePlayer(`${prefix}_fwd_${index}`, "FWD" /* FWD */, level - index % 2))
];
var strongAi = makeSquad("ai", 88);
var weakerOpponent = makeSquad("opponent", 55);
var opponentLineup = LineupService.autoPickLineup("OPPONENT", weakerOpponent, "4-4-2-OFF", null, {
  respectRequestedTactic: true
});
var aiClub = { id: "AI", staffIds: [], reputation: 9 };
var opponentClub = { id: "OPPONENT", staffIds: [], reputation: 5 };
assert(!isCautiousStartJustified(1.24), "R\xF3\u017Cnica poni\u017Cej 25% nie powinna wymusza\u0107 ostro\u017Cnego startu.");
assert(isCautiousStartJustified(1.25), "R\xF3\u017Cnica od 25% powinna umo\u017Cliwia\u0107 ostro\u017Cniejszy start.");
assert(!isDefensiveStartJustified(1.49), "R\xF3\u017Cnica poni\u017Cej 50% nie powinna uruchamia\u0107 defensywnego losowania.");
assert(isDefensiveStartJustified(1.5), "R\xF3\u017Cnica od 50% powinna uruchamia\u0107 defensywne losowanie.");
assert(getDefensiveStartProbability(1.49) === 0, "Poni\u017Cej progu defensywnego prawdopodobie\u0144stwo musi wynosi\u0107 0%.");
assert(getDefensiveStartProbability(1.5) === 0.5, "Od progu defensywnego prawdopodobie\u0144stwo musi wynosi\u0107 50%.");
assert(!isLowBlockStartJustified(1.74), "Niski blok musi pozosta\u0107 skrajnym wyj\u0105tkiem.");
assert(isLowBlockStartJustified(1.75), "Bardzo du\u017Ca r\xF3\u017Cnica klasy mo\u017Ce umo\u017Cliwia\u0107 niski blok.");
var report = AiOpponentAnalysisService.generateReport({
  aiClub,
  aiCoach: null,
  aiPlayers: strongAi,
  opponentClub,
  opponentPlayers: weakerOpponent,
  opponentLineup,
  seed: 12345,
  matchEnvironment: "DOMESTIC_LEAGUE"
});
assert(report.perceivedOpponentToAiPowerRatio !== void 0, "Raport powinien por\xF3wnywa\u0107 si\u0142\u0119 obu dru\u017Cyn.");
assert(report.perceivedOpponentToAiPowerRatio < 0.92, "Mocniejsza dru\u017Cyna AI powinna zosta\u0107 rozpoznana jako faworyt.");
assert(report.recommendedApproach !== "LOW_BLOCK", "Wyra\u017Any faworyt nie powinien automatycznie wybiera\u0107 niskiego bloku.");
var defensiveCoach = {
  attributes: { decisionMaking: 75, experience: 75, training: 70 },
  favoriteTactics: {
    neutral: "5-3-2",
    offensive: "4-3-3 Atak",
    defensive: "5-4-1"
  }
};
var preparedLineup = LineupService.autoPickLineup("AI", strongAi, "4-3-3", defensiveCoach, {
  respectRequestedTactic: true
});
assert(preparedLineup.tacticId === "4-3-3", "Taktyka wybrana przez analiz\u0119 meczu nie mo\u017Ce zosta\u0107 nadpisana preferencj\u0105 trenera.");
var strongFavoriteReport = {
  ...report,
  confidence: 0.9,
  predictedTacticId: "4-4-2-OFF",
  predictedStyle: "OFFENSIVE",
  recommendedApproach: "LOW_BLOCK",
  perceivedOpponentToAiPowerRatio: 0.75,
  defensiveStartChance: 0,
  defensiveStartSelected: false
};
var recommendedTacticId = AiOpponentAnalysisService.recommendStartingTactic(
  "5-3-2",
  strongFavoriteReport,
  aiClub,
  opponentClub,
  strongAi,
  true,
  defensiveCoach
);
var recommendedTactic = TacticRepository.getById(recommendedTacticId);
assert(recommendedTactic.defenseBias <= 65, "Wyra\u017Any faworyt powinien odej\u015B\u0107 od defensywnej formacji startowej.");
assert(recommendedTactic.attackBias >= 55, "Wyra\u017Any faworyt powinien wybra\u0107 aktywniejsz\u0105 formacj\u0119.");
var normalDomesticReport = {
  ...strongFavoriteReport,
  perceivedOpponentToAiPowerRatio: 1.1,
  defensiveStartChance: 0,
  defensiveStartSelected: false,
  matchEnvironment: "DOMESTIC_LEAGUE"
};
var normalDomesticTacticId = AiOpponentAnalysisService.recommendStartingTactic(
  "5-3-2",
  normalDomesticReport,
  aiClub,
  opponentClub,
  strongAi,
  true,
  defensiveCoach
);
assert(
  TacticRepository.getById(normalDomesticTacticId).defenseBias <= 65,
  "W zwyk\u0142ym meczu ligi krajowej umiarkowana r\xF3\u017Cnica si\u0142y nie uzasadnia defensywnego startu."
);
var hugeEuropeanGapReport = {
  ...strongFavoriteReport,
  perceivedOpponentToAiPowerRatio: 1.8,
  defensiveStartChance: 0.5,
  defensiveStartSelected: true,
  matchEnvironment: "EUROPE"
};
var hugeEuropeanGapTacticId = AiOpponentAnalysisService.recommendStartingTactic(
  "4-4-2",
  hugeEuropeanGapReport,
  aiClub,
  opponentClub,
  strongAi,
  true,
  defensiveCoach
);
assert(
  TacticRepository.getById(hugeEuropeanGapTacticId).defenseBias >= 65,
  "Przy ogromnej r\xF3\u017Cnicy klasy w Europie defensywny start powinien pozosta\u0107 dost\u0119pny."
);
var fiftyFiftyDefensiveReport = {
  ...strongFavoriteReport,
  perceivedOpponentToAiPowerRatio: 1.55,
  defensiveStartChance: 0.5,
  defensiveStartSelected: true,
  recommendedApproach: "COUNTER"
};
var fiftyFiftyDefensiveTacticId = AiOpponentAnalysisService.recommendStartingTactic(
  "4-4-2",
  fiftyFiftyDefensiveReport,
  aiClub,
  opponentClub,
  strongAi,
  true,
  defensiveCoach
);
assert(
  TacticRepository.getById(fiftyFiftyDefensiveTacticId).defenseBias >= 65,
  "Wylosowana defensywna po\u0142owa wariantu 50/50 powinna wybra\u0107 defensywn\u0105 formacj\u0119."
);
var fiftyFiftyCautiousReport = {
  ...fiftyFiftyDefensiveReport,
  defensiveStartSelected: false
};
var fiftyFiftyCautiousTacticId = AiOpponentAnalysisService.recommendStartingTactic(
  "5-3-2",
  fiftyFiftyCautiousReport,
  aiClub,
  opponentClub,
  strongAi,
  true,
  defensiveCoach
);
assert(
  TacticRepository.getById(fiftyFiftyCautiousTacticId).defenseBias <= 65,
  "Niewylosowana po\u0142owa wariantu 50/50 powinna pozosta\u0107 ostro\u017Cna, ale zbalansowana."
);
var cautiousGapReport = {
  ...fiftyFiftyCautiousReport,
  perceivedOpponentToAiPowerRatio: 1.3
};
var cautiousGapTacticId = AiOpponentAnalysisService.recommendStartingTactic(
  "4-3-3",
  cautiousGapReport,
  aiClub,
  opponentClub,
  strongAi,
  true,
  defensiveCoach
);
assert(
  TacticRepository.getById(cautiousGapTacticId).attackBias < 65,
  "Przy r\xF3\u017Cnicy 25-50% wariant ostro\u017Cny nie powinien zmienia\u0107 si\u0119 w skrajnie ofensywny start."
);
var originalConsoleLog = console.log;
console.log = () => void 0;
try {
  for (let seed = 1; seed <= 50; seed += 1) {
    const instructions = AiCoachTacticsService.decidePreMatchInstructions(
      aiClub,
      defensiveCoach,
      strongAi,
      opponentClub,
      weakerOpponent,
      "4-4-2-OFF",
      seed,
      normalDomesticReport
    );
    assert(
      instructions.mindset !== "DEFENSIVE",
      "Losowy b\u0142\u0105d trenera nie mo\u017Ce wymusi\u0107 defensywnej postawy bez odpowiedniej r\xF3\u017Cnicy klas."
    );
    const europeanInstructions = AiCoachTacticsService.decidePreMatchInstructions(
      aiClub,
      defensiveCoach,
      strongAi,
      opponentClub,
      weakerOpponent,
      "4-4-2-OFF",
      seed,
      hugeEuropeanGapReport
    );
    assert(
      europeanInstructions.mindset !== "OFFENSIVE",
      "Losowy b\u0142\u0105d wielkiego europejskiego outsidera nie mo\u017Ce wymusi\u0107 skrajnie ofensywnej postawy."
    );
  }
  const strongAiBaseLineup = LineupService.autoPickLineup("AI", strongAi, "5-3-2", defensiveCoach, {
    respectRequestedTactic: true
  });
  const misleadingReport = {
    ...strongFavoriteReport,
    confidence: 0.25,
    perceivedOpponentToAiPowerRatio: 1.85,
    defensiveStartChance: 0.5,
    defensiveStartSelected: true,
    recommendedApproach: "LOW_BLOCK"
  };
  const protectedStrongTeamPlan = AiLeagueMatchPlanService.createPlan({
    report: misleadingReport,
    aiClub,
    aiCoach: defensiveCoach,
    aiPlayers: strongAi,
    aiBaseLineup: strongAiBaseLineup,
    userClub: opponentClub,
    userPlayers: weakerOpponent,
    userLineup: opponentLineup,
    aiRank: 3,
    userRank: 8,
    isAiAway: true,
    seed: 9182
  }).plan;
  assert(
    protectedStrongTeamPlan.opponentToAiPowerRatio < 1.25,
    "Trener ligowej czo\u0142\xF3wki z mocnym sk\u0142adem i wysokim morale nie mo\u017Ce uzna\u0107 s\u0142abszego rywala za wyra\u017Anego faworyta."
  );
  assert(
    !protectedStrongTeamPlan.defensiveStartSelected,
    "B\u0142\u0119dny raport nie mo\u017Ce wymusi\u0107 defensywnego startu mocnej dru\u017Cyny przeciw s\u0142abszemu rywalowi."
  );
  assert(
    protectedStrongTeamPlan.initialInstructions.mindset !== "DEFENSIVE",
    "Sp\xF3jny plan mocnej dru\u017Cyny nie mo\u017Ce zaczyna\u0107 od defensywnego nastawienia w takim meczu."
  );
  assert(
    TacticRepository.getById(protectedStrongTeamPlan.initialTacticId).defenseBias <= 65,
    "Formacja startowa mocnej dru\u017Cyny musi by\u0107 zgodna z niedefensywnymi instrukcjami."
  );
  const outsiderPlayers = makeSquad("outsider", 58);
  const elitePlayers = makeSquad("elite", 88);
  const outsiderLineup = LineupService.autoPickLineup("OUTSIDER", outsiderPlayers, "4-4-2", defensiveCoach, {
    respectRequestedTactic: true
  });
  const eliteLineup = LineupService.autoPickLineup("ELITE", elitePlayers, "4-3-3", null, {
    respectRequestedTactic: true
  });
  const outsiderClub = { id: "OUTSIDER", staffIds: [], reputation: 4 };
  const eliteClub = { id: "ELITE", staffIds: [], reputation: 10 };
  const outsiderReport = {
    ...strongFavoriteReport,
    perceivedOpponentToAiPowerRatio: 1.55,
    defensiveStartChance: 0.5,
    defensiveStartSelected: false,
    recommendedApproach: "COUNTER"
  };
  let defensiveStarts = 0;
  const observedSources = /* @__PURE__ */ new Set();
  for (let seed = 1; seed <= 200; seed += 1) {
    const plan = AiLeagueMatchPlanService.createPlan({
      report: outsiderReport,
      aiClub: outsiderClub,
      aiCoach: defensiveCoach,
      aiPlayers: outsiderPlayers,
      aiBaseLineup: outsiderLineup,
      userClub: eliteClub,
      userPlayers: elitePlayers,
      userLineup: eliteLineup,
      aiRank: 12,
      userRank: 2,
      isAiAway: true,
      seed
    }).plan;
    if (plan.defensiveStartSelected) defensiveStarts += 1;
    observedSources.add(plan.source);
  }
  assert(
    defensiveStarts >= 70 && defensiveStarts <= 130,
    `Przy r\xF3\u017Cnicy ponad 50% defensywny start powinien pozosta\u0107 losowaniem oko\u0142o 50/50; wynik: ${defensiveStarts}/200.`
  );
  assert(
    observedSources.has("REPORT") && observedSources.has("INTUITION"),
    "RNG trenera powinien czasem prowadzi\u0107 za raportem, a czasem za intuicj\u0105."
  );
} finally {
  console.log = originalConsoleLog;
}
console.log("AiOpponentAnalysisTests: OK");
