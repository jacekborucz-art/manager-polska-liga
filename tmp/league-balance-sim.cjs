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

// services/LiveMatchInstructionBalanceService.ts
var clamp = (value, min, max) => Math.min(max, Math.max(min, value));
var getSelectedPlayers = (players, startingXI, positions) => {
  const ids = new Set(startingXI.filter((id) => id !== null));
  return players.filter((player) => ids.has(player.id) && (!positions || positions.includes(player.position)));
};
var getAverage = (players, startingXI, attributes, positions) => {
  const selectedPlayers = getSelectedPlayers(players, startingXI, positions);
  if (selectedPlayers.length === 0) return 55;
  return selectedPlayers.reduce((teamSum, player) => {
    const playerAverage = attributes.reduce((sum, attribute) => sum + player.attributes[attribute], 0) / attributes.length;
    return teamSum + playerAverage;
  }, 0) / selectedPlayers.length;
};
var getWeightedAverage = (players, startingXI, attributes, positions) => {
  const positionPlayers = getSelectedPlayers(players, startingXI, positions);
  const selectedPlayers = positionPlayers.length > 0 ? positionPlayers : getSelectedPlayers(players, startingXI);
  if (selectedPlayers.length === 0) return 55;
  const entries = Object.entries(attributes);
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  return selectedPlayers.reduce((teamSum, player) => {
    const weightedValue = entries.reduce((sum, [attribute, weight]) => sum + player.attributes[attribute] * weight, 0);
    return teamSum + weightedValue / totalWeight;
  }, 0) / selectedPlayers.length;
};
var getProgressiveModifier = (gap, neutralBand, maxPositive, maxNegative, fullEffectGap) => {
  if (gap > neutralBand) {
    return clamp((gap - neutralBand) / (fullEffectGap - neutralBand), 0, 1) * maxPositive;
  }
  if (gap < -neutralBand) {
    return -clamp((-gap - neutralBand) / (fullEffectGap - neutralBand), 0, 1) * maxNegative;
  }
  return 0;
};
var LiveMatchInstructionBalanceService = {
  getFastTempoDefensiveExposure: (opponentTacticDefBias, teamTechnique) => {
    const exposure = 6e-3 + clamp((opponentTacticDefBias - 50) / 35, 0, 1) * 6e-3;
    const techSafetyMod = teamTechnique > 72 ? 0.8 : teamTechnique > 62 ? 0.9 : 1;
    return exposure * techSafetyMod;
  },
  getOffensiveMindsetDefensiveExposure: (opponentTacticDefBias) => {
    return 7e-3 + clamp((opponentTacticDefBias - 55) / 30, 0, 1) * 7e-3;
  },
  getBuildUpAccuracyProfile: (userPlayers, userStartingXI, opponentPlayers, opponentStartingXI, passing = "MIXED", tempo = "NORMAL", opponentPressing = "NORMAL", fatigueMap = {}) => {
    const builders = ["DEF" /* DEF */, "MID" /* MID */];
    const receivers = ["MID" /* MID */, "FWD" /* FWD */];
    const opponentBlock = ["MID" /* MID */, "FWD" /* FWD */];
    const activePlayers = getSelectedPlayers(userPlayers, userStartingXI, builders);
    const activeCount = Math.max(1, activePlayers.length);
    const avgFatigue = activePlayers.reduce((sum, player) => sum + (fatigueMap[player.id] ?? 100), 0) / activeCount;
    const fatigueDrag = clamp((82 - avgFatigue) / 55, 0, 1);
    const buildQuality = getWeightedAverage(userPlayers, userStartingXI, {
      passing: 0.34,
      technique: 0.25,
      vision: 0.18,
      mentality: 0.13,
      workRate: 0.1
    }, builders);
    const receivingQuality = getWeightedAverage(userPlayers, userStartingXI, {
      technique: 0.3,
      passing: 0.24,
      vision: 0.18,
      dribbling: 0.14,
      positioning: 0.14
    }, receivers);
    const pressResistance = buildQuality * 0.68 + receivingQuality * 0.32 - fatigueDrag * 9;
    const opponentPressQuality = getWeightedAverage(opponentPlayers, opponentStartingXI, {
      workRate: 0.27,
      stamina: 0.23,
      aggression: 0.18,
      pace: 0.14,
      mentality: 0.1,
      positioning: 0.08
    }, opponentBlock);
    const tempoRisk = tempo === "FAST" ? 5.5 : tempo === "SLOW" ? -3.5 : 0;
    const passStyleRisk = passing === "SHORT" ? -1.8 : passing === "LONG" ? 3.2 : 0;
    const opponentPressingRisk = opponentPressing === "PRESSING" ? 5.5 : 0;
    const rawSecurity = pressResistance - opponentPressQuality - tempoRisk - passStyleRisk - opponentPressingRisk;
    const qualityGap = buildQuality - opponentPressQuality;
    const positiveControl = getProgressiveModifier(rawSecurity, 2, 0.011, 8e-3, 28);
    const turnoverDrag = getProgressiveModifier(rawSecurity, 2, 8e-3, 0.018, 28);
    const styleBonus = passing === "SHORT" && qualityGap > 4 && tempo !== "FAST" ? clamp((qualityGap - 4) / 24, 0, 1) * 4e-3 : 0;
    const rushedLongBallPenalty = passing === "LONG" && receivingQuality < opponentPressQuality - 5 ? -clamp((opponentPressQuality - receivingQuality - 5) / 24, 0, 1) * 6e-3 : 0;
    const shotModifier = clamp(positiveControl + turnoverDrag + styleBonus + rushedLongBallPenalty, -0.024, 0.017);
    const turnoverRisk = clamp((-rawSecurity - 2) / 55, 0, 1);
    return {
      buildQuality,
      pressResistance,
      opponentPressQuality,
      rawSecurity,
      shotModifier,
      turnoverRisk
    };
  },
  getIntensityRiskModifiers: (intensity, players, startingXI, intensityResponseFactor = 1) => {
    const averageAggression = getAverage(players, startingXI, ["aggression"]);
    const aggressionGap = (averageAggression - 50) / 50;
    const aggressionSensitivity = intensity === "AGGRESSIVE" ? 1.25 : intensity === "CAUTIOUS" ? 0.65 : 1;
    const aggressionFoulMod = clamp(1 + aggressionGap * 0.18 * aggressionSensitivity, 0.78, 1.28);
    const aggressionPenaltyMod = clamp(1 + aggressionGap * 0.1 * aggressionSensitivity, 0.88, 1.15);
    const aggressionInjuryMod = clamp(1 + aggressionGap * 0.06 * aggressionSensitivity, 0.94, 1.1);
    const instructionFoulMod = intensity === "AGGRESSIVE" ? 1 + 0.3 * intensityResponseFactor : intensity === "CAUTIOUS" ? 1 - 0.28 * intensityResponseFactor : 1;
    const instructionPenaltyMod = intensity === "AGGRESSIVE" ? 1 + 0.25 * intensityResponseFactor : intensity === "CAUTIOUS" ? 1 - 0.3 * intensityResponseFactor : 1;
    const instructionInjuryMod = intensity === "AGGRESSIVE" ? 1 + 0.28 * intensityResponseFactor : intensity === "CAUTIOUS" ? 1 - 0.3 * intensityResponseFactor : 1;
    return {
      averageAggression,
      aggressionFoul: aggressionFoulMod,
      aggressionPenalty: aggressionPenaltyMod,
      aggressionInjury: aggressionInjuryMod,
      foul: instructionFoulMod * aggressionFoulMod,
      penalty: instructionPenaltyMod * aggressionPenaltyMod,
      injury: instructionInjuryMod * aggressionInjuryMod
    };
  },
  getCombinationModifier: (tempo, mindset, pressing, counterAttack, isAttacking) => {
    let modifier = 0;
    if (tempo === "FAST" && mindset === "OFFENSIVE") modifier += isAttacking ? 3e-3 : 6e-3;
    if (tempo === "SLOW" && mindset === "DEFENSIVE") modifier += isAttacking ? -2e-3 : -3e-3;
    if (tempo === "FAST" && mindset === "DEFENSIVE") modifier += isAttacking ? -2e-3 : 2e-3;
    if (tempo === "SLOW" && mindset === "OFFENSIVE") modifier += isAttacking ? -2e-3 : 1e-3;
    if (pressing === "PRESSING" && tempo === "FAST") modifier += isAttacking ? 2e-3 : -1e-3;
    if (pressing === "PRESSING" && tempo === "SLOW") modifier += isAttacking ? -2e-3 : 0;
    if (pressing === "PRESSING" && counterAttack === "COUNTER") modifier += isAttacking ? -2e-3 : 2e-3;
    return clamp(modifier, -6e-3, 6e-3);
  },
  getInstructionFatigueExtra: (tempo, intensity, pressing, tempoResponseFactor = 1, intensityResponseFactor = 1, pressingResponseFactor = 1) => {
    const tempoCost = tempo === "FAST" ? 0.065 * tempoResponseFactor : 0;
    const intensityCost = intensity === "AGGRESSIVE" ? 0.018 * intensityResponseFactor : intensity === "CAUTIOUS" ? -0.012 * intensityResponseFactor : 0;
    const pressingCost = pressing === "PRESSING" ? 0.015 * pressingResponseFactor : 0;
    const fastPressingCost = tempo === "FAST" && pressing === "PRESSING" ? 4e-3 : 0;
    return tempoCost + intensityCost + pressingCost + fastPressingCost;
  },
  getInstructionShotModifier: (instructions, userPlayers, userStartingXI, opponentPlayers, opponentStartingXI, opponentTacticDefBias, isAttacking, pressRf = 1) => {
    const pressing = instructions.pressing ?? "NORMAL";
    let modifier = 0;
    if (instructions.tempo === "FAST") {
      if (isAttacking) {
        modifier += 0.012;
      } else {
        const userTechnique = getAverage(userPlayers, userStartingXI, ["technique"]);
        modifier += LiveMatchInstructionBalanceService.getFastTempoDefensiveExposure(
          opponentTacticDefBias,
          userTechnique
        );
      }
    } else if (instructions.tempo === "SLOW" && isAttacking) {
      modifier += LiveMatchInstructionBalanceService.getSlowTempoModifier(
        userPlayers,
        userStartingXI,
        opponentPlayers,
        opponentStartingXI
      );
    }
    if (instructions.mindset === "OFFENSIVE") {
      if (isAttacking) modifier += 0.015;
      else modifier += LiveMatchInstructionBalanceService.getOffensiveMindsetDefensiveExposure(
        opponentTacticDefBias
      );
    } else if (instructions.mindset === "DEFENSIVE") {
      if (!isAttacking) {
        modifier -= LiveMatchInstructionBalanceService.getDefensiveMindsetModifier(
          userPlayers,
          userStartingXI,
          opponentPlayers,
          opponentStartingXI
        );
      } else {
        modifier -= 5e-3;
      }
    }
    if (pressing === "PRESSING") {
      const pressingModifier = LiveMatchInstructionBalanceService.getPressingModifier(
        userPlayers,
        userStartingXI,
        opponentPlayers,
        opponentStartingXI
      ) * pressRf;
      modifier += isAttacking ? pressingModifier : -pressingModifier;
    }
    return modifier + LiveMatchInstructionBalanceService.getCombinationModifier(
      instructions.tempo,
      instructions.mindset,
      pressing,
      instructions.counterAttack,
      isAttacking
    );
  },
  getSlowTempoModifier: (userPlayers, userStartingXI, opponentPlayers, opponentStartingXI) => {
    const controllers = ["DEF" /* DEF */, "MID" /* MID */];
    const disruptors = ["MID" /* MID */, "FWD" /* FWD */];
    const controlQuality = getWeightedAverage(userPlayers, userStartingXI, {
      passing: 0.3,
      technique: 0.25,
      vision: 0.2,
      mentality: 0.15,
      positioning: 0.1
    }, controllers);
    const opponentDisruption = getWeightedAverage(opponentPlayers, opponentStartingXI, {
      defending: 0.25,
      positioning: 0.2,
      aggression: 0.18,
      workRate: 0.17,
      pace: 0.1,
      mentality: 0.1
    }, disruptors);
    return getProgressiveModifier(controlQuality - opponentDisruption, 2, 0.015, 9e-3, 30);
  },
  getDefensiveMindsetModifier: (userPlayers, userStartingXI, opponentPlayers, opponentStartingXI) => {
    const blockPlayers = ["DEF" /* DEF */, "MID" /* MID */];
    const attackers = ["MID" /* MID */, "FWD" /* FWD */];
    const defensiveBlock = getWeightedAverage(userPlayers, userStartingXI, {
      defending: 0.3,
      positioning: 0.25,
      mentality: 0.17,
      workRate: 0.13,
      strength: 0.1,
      stamina: 0.05
    }, blockPlayers);
    const opponentAttack = getWeightedAverage(opponentPlayers, opponentStartingXI, {
      attacking: 0.22,
      finishing: 0.2,
      technique: 0.15,
      vision: 0.15,
      pace: 0.13,
      dribbling: 0.1,
      mentality: 0.05
    }, attackers);
    const qualityModifier = getProgressiveModifier(defensiveBlock - opponentAttack, 2, 0.011, 3e-3, 30);
    return clamp(3e-3 + qualityModifier, 0, 0.014);
  },
  getShortPassingModifier: (userPlayers, userStartingXI, opponentPlayers, opponentStartingXI, isFastTempo) => {
    const positions = ["MID" /* MID */, "FWD" /* FWD */];
    const userQuality = getAverage(userPlayers, userStartingXI, ["technique", "passing"], positions);
    const opponentQuality = getAverage(opponentPlayers, opponentStartingXI, ["technique", "passing"], positions);
    const qualityGap = userQuality - opponentQuality;
    const baseModifier = getProgressiveModifier(qualityGap, 2, 0.016, 0.012, 30);
    if (!isFastTempo) return baseModifier;
    const fastTempoSynergy = getProgressiveModifier(qualityGap, 5, 8e-3, 5e-3, 30);
    return clamp(baseModifier + fastTempoSynergy, -0.017, 0.024);
  },
  getLongPassingModifier: (userPlayers, userStartingXI, opponentPlayers, opponentStartingXI, isFastTempo) => {
    const distributors = ["DEF" /* DEF */, "MID" /* MID */];
    const targets = ["MID" /* MID */, "FWD" /* FWD */];
    const defenders = ["DEF" /* DEF */];
    const distributionQuality = getWeightedAverage(userPlayers, userStartingXI, {
      passing: 0.38,
      technique: 0.22,
      crossing: 0.2,
      vision: 0.2
    }, distributors);
    const targetQuality = getWeightedAverage(userPlayers, userStartingXI, {
      heading: 0.27,
      strength: 0.21,
      pace: 0.22,
      attacking: 0.18,
      positioning: 0.12
    }, targets);
    const opponentControl = getWeightedAverage(opponentPlayers, opponentStartingXI, {
      heading: 0.27,
      strength: 0.21,
      pace: 0.22,
      defending: 0.18,
      positioning: 0.12
    }, defenders);
    const longBallScore = (distributionQuality - 55) * 0.35 + (targetQuality - opponentControl) * 0.75;
    const baseModifier = getProgressiveModifier(longBallScore, 2, 0.018, 0.014, 30);
    if (!isFastTempo) return baseModifier;
    const userTargetPace = getAverage(userPlayers, userStartingXI, ["pace"], targets);
    const opponentDefenderPace = getAverage(opponentPlayers, opponentStartingXI, ["pace"], defenders);
    const fastTempoSynergy = getProgressiveModifier(userTargetPace - opponentDefenderPace, 4, 7e-3, 4e-3, 25);
    return clamp(baseModifier + fastTempoSynergy, -0.018, 0.025);
  },
  getPressingModifier: (userPlayers, userStartingXI, opponentPlayers, opponentStartingXI) => {
    const userQuality = getWeightedAverage(userPlayers, userStartingXI, {
      workRate: 0.26,
      stamina: 0.22,
      aggression: 0.18,
      pace: 0.14,
      mentality: 0.12,
      strength: 0.08
    });
    const opponentResistance = getWeightedAverage(opponentPlayers, opponentStartingXI, {
      passing: 0.25,
      technique: 0.23,
      vision: 0.18,
      mentality: 0.12,
      pace: 0.12,
      strength: 0.1
    });
    return getProgressiveModifier(userQuality - opponentResistance, 2.5, 0.015, 0.012, 30);
  },
  getCounterAttackModifier: (userPlayers, userStartingXI, opponentPlayers, opponentStartingXI) => {
    const transitionPlayers = ["MID" /* MID */, "FWD" /* FWD */];
    const recoveryPlayers = ["DEF" /* DEF */, "MID" /* MID */];
    const transitionQuality = getWeightedAverage(userPlayers, userStartingXI, {
      pace: 0.3,
      passing: 0.2,
      vision: 0.17,
      technique: 0.13,
      attacking: 0.12,
      mentality: 0.08
    }, transitionPlayers);
    const opponentRecovery = getWeightedAverage(opponentPlayers, opponentStartingXI, {
      pace: 0.25,
      positioning: 0.25,
      defending: 0.22,
      workRate: 0.13,
      stamina: 0.1,
      mentality: 0.05
    }, recoveryPlayers);
    return getProgressiveModifier(transitionQuality - opponentRecovery, 2, 8e-3, 5e-3, 30);
  }
};

// services/MatchFormService.ts
var NEUTRAL_CLUB_FORM_IMPACT = {
  recent: [],
  sampleSize: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  points: 0,
  score: 0,
  momentumBonus: 0,
  initiativeModifier: 0,
  shotModifier: 0,
  shotResistanceModifier: 0,
  finishingMultiplier: 1,
  goalkeepingMultiplier: 1,
  isDeepSlump: false
};
var clamp2 = (value, min, max) => Math.max(min, Math.min(max, value));
var getStreak = (recent, target) => {
  let streak = 0;
  for (let i = recent.length - 1; i >= 0; i -= 1) {
    if (recent[i] !== target) break;
    streak += 1;
  }
  return streak;
};
var getCoachSlumpAdjustment = (coach) => {
  const motivation = coach?.attributes?.motivation ?? 50;
  const experience = coach?.attributes?.experience ?? 50;
  const coachControl = ((motivation - 50) * 0.6 + (experience - 50) * 0.4) / 50;
  return clamp2(1 - coachControl * 0.35, 0.72, 1.24);
};
var analyzeClubFormImpact = (form = [], coach) => {
  const recent = form.slice(-5);
  const sampleSize = recent.length;
  if (sampleSize === 0) return NEUTRAL_CLUB_FORM_IMPACT;
  const wins = recent.filter((result) => result === "W").length;
  const draws = recent.filter((result) => result === "R").length;
  const losses = recent.filter((result) => result === "P").length;
  const points = wins * 3 + draws;
  const sampleWeight = clamp2(sampleSize / 5, 0, 1);
  const pointsRatio = points / (sampleSize * 3);
  const normalizedPoints = (pointsRatio - 0.5) * 2;
  const resultBalance = (wins - losses) / sampleSize;
  const winStreak = getStreak(recent, "W");
  const lossStreak = getStreak(recent, "P");
  let score = normalizedPoints * 0.65 + resultBalance * 0.35;
  if (wins >= 3) score += 0.12 + Math.max(0, wins - 3) * 0.06;
  if (losses >= 3) score -= 0.18 + Math.max(0, losses - 3) * 0.08;
  if (winStreak >= 2) score += Math.min(0.18, (winStreak - 1) * 0.07);
  if (lossStreak >= 2) score -= Math.min(0.24, (lossStreak - 1) * 0.1);
  if (sampleSize === 5 && points <= 2) score -= 0.12;
  if (sampleSize === 5 && points >= 13) score += 0.08;
  score = clamp2(score * sampleWeight, -1.25, 1.05);
  if (score < 0) {
    score = clamp2(score * getCoachSlumpAdjustment(coach), -1.25, 1.05);
  }
  return {
    recent,
    sampleSize,
    wins,
    draws,
    losses,
    points,
    score,
    momentumBonus: clamp2(score * 5.5, -7, 7),
    initiativeModifier: clamp2(score * 0.018, -0.026, 0.018),
    shotModifier: clamp2(score * 9e-3, -0.013, 0.01),
    shotResistanceModifier: clamp2(score * 8e-3, -0.011, 9e-3),
    finishingMultiplier: clamp2(1 + score * 0.025, 0.96, 1.03),
    goalkeepingMultiplier: clamp2(1 + score * 0.022, 0.965, 1.025),
    isDeepSlump: sampleSize === 5 && losses >= 4
  };
};

// data/match_prep_focuses_pl.ts
var MATCH_PREP_FOCUSES = [
  {
    id: "FOCUS_FINISHING",
    name: "Wyko\u0144czenie",
    icon: "\u26BD",
    description: "Intensywna praca nad skuteczno\u015Bci\u0105 przed bramk\u0105. Dru\u017Cyna wchodzi na muraw\u0119 z wyostrzonymi instynktami strzeleckimi.",
    finishingMultiplierBase: 0.03,
    shotModifierBase: 0.01,
    initiativeModifierBase: 0,
    shotResistanceModifierBase: 0,
    goalkeepingMultiplierBase: 0,
    isRecovery: false,
    recoveryPenaltyMax: 0
  },
  {
    id: "FOCUS_SET_PIECES",
    name: "Sta\u0142e fragmenty",
    icon: "\u{1F3AF}",
    description: "Wielogodzinne \u0107wiczenia rzut\xF3w wolnych i ro\u017Cnych. Ka\u017Cda sta\u0142a pi\u0142ka to potencjalnie gol.",
    finishingMultiplierBase: 0.02,
    shotModifierBase: 0.012,
    initiativeModifierBase: 0,
    shotResistanceModifierBase: 0,
    goalkeepingMultiplierBase: 0,
    isRecovery: false,
    recoveryPenaltyMax: 0
  },
  {
    id: "FOCUS_PRESSING",
    name: "Pressing",
    icon: "\u{1F525}",
    description: "Agresywne odbiory i wysoki pressing. Przeciwnik nie b\u0119dzie mia\u0142 czasu na my\u015Blenie.",
    finishingMultiplierBase: 0,
    shotModifierBase: 0,
    initiativeModifierBase: 0.015,
    shotResistanceModifierBase: 0.018,
    goalkeepingMultiplierBase: 0,
    isRecovery: false,
    recoveryPenaltyMax: 0
  },
  {
    id: "FOCUS_COUNTER",
    name: "Gra z kontry",
    icon: "\u26A1",
    description: "Szybkie przej\u015Bcia i b\u0142yskawiczne ataki po odbiorze. Jeden moment wystarczy.",
    finishingMultiplierBase: 0,
    shotModifierBase: 0.02,
    initiativeModifierBase: 0,
    shotResistanceModifierBase: 0,
    goalkeepingMultiplierBase: 0,
    isRecovery: false,
    recoveryPenaltyMax: 0
  },
  {
    id: "FOCUS_TIKITAKA",
    name: "Tiki-taka",
    icon: "\u{1F504}",
    description: "Kombinacyjna gra kr\xF3tk\u0105 pi\u0142k\u0105 i dominacja posiadania. Kontroluj tempo meczu.",
    finishingMultiplierBase: 0,
    shotModifierBase: 0,
    initiativeModifierBase: 0.025,
    shotResistanceModifierBase: 0,
    goalkeepingMultiplierBase: 0,
    isRecovery: false,
    recoveryPenaltyMax: 0
  },
  {
    id: "FOCUS_MARKING",
    name: "Krycie",
    icon: "\u{1F6E1}\uFE0F",
    description: "Szczeg\xF3\u0142owa analiza przeciwnika i \u0107wiczenia krycia indywidualnego. Neutralizacja zagro\u017Ce\u0144.",
    finishingMultiplierBase: 0,
    shotModifierBase: 0,
    initiativeModifierBase: 0,
    shotResistanceModifierBase: 0.022,
    goalkeepingMultiplierBase: 0.02,
    isRecovery: false,
    recoveryPenaltyMax: 0
  },
  {
    id: "FOCUS_PASSING",
    name: "Podania",
    icon: "\u{1F3AF}",
    description: "Precyzja poda\u0144 i ruch bez pi\u0142ki. Dru\u017Cyna kontroluje gr\u0119 przez jako\u015B\u0107 rozegrania.",
    finishingMultiplierBase: 0,
    shotModifierBase: 0,
    initiativeModifierBase: 0.018,
    shotResistanceModifierBase: 0,
    goalkeepingMultiplierBase: 0,
    isRecovery: false,
    recoveryPenaltyMax: 0
  },
  {
    id: "FOCUS_AERIAL",
    name: "Gra g\u0142ow\u0105",
    icon: "\u2708\uFE0F",
    description: "Dominacja w powietrzu przy sta\u0142ych fragmentach i do\u015Brodkowaniach. Si\u0142a fizyczna robi r\xF3\u017Cnic\u0119.",
    finishingMultiplierBase: 0.015,
    shotModifierBase: 0.01,
    initiativeModifierBase: 0,
    shotResistanceModifierBase: 0.01,
    goalkeepingMultiplierBase: 0,
    isRecovery: false,
    recoveryPenaltyMax: 0
  },
  {
    id: "FOCUS_RECOVERY",
    name: "Regeneracja",
    icon: "\u{1F4A4}",
    description: "Tydzie\u0144 skupiony na odnowie biologicznej. Zawodnicy wchodz\u0105 wypocz\u0119ci, ale mentalnie mniej nastawieni na atak.",
    finishingMultiplierBase: 0,
    shotModifierBase: 0,
    initiativeModifierBase: 0,
    shotResistanceModifierBase: 0,
    goalkeepingMultiplierBase: 0,
    isRecovery: true,
    recoveryPenaltyMax: 0.022
  }
];

// services/MatchPrepFocusService.ts
var REQUIRED_DAYS = 5;
var seededRng = (seed, offset) => {
  const x = Math.sin(seed + offset) * 1e4;
  return x - Math.floor(x);
};
var isFocusReady = (club, currentDate) => {
  if (!club.matchPrepFocusId || !club.matchPrepFocusStartDate) return false;
  const start = new Date(club.matchPrepFocusStartDate).setHours(0, 0, 0, 0);
  const now = new Date(currentDate).setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now - start) / 864e5);
  return diffDays >= REQUIRED_DAYS;
};
var calcEffectiveness = (reputation, seed) => {
  const qualityFactor = Math.min(1, Math.max(0, (reputation - 1) / 9));
  const base = 0.35 + qualityFactor * 0.65;
  const offset = (seededRng(seed, 17) - 0.5) * 0.2;
  return Math.min(1, Math.max(0.25, base + offset));
};
var getAIWeeklyTrainingModifier = (club, currentDate) => {
  const state = club.aiWeeklyTraining;
  if (!state) return 1;
  const now = new Date(currentDate).setHours(0, 0, 0, 0);
  const validUntil = new Date(state.validUntil).setHours(23, 59, 59, 999);
  if (Number.isNaN(validUntil) || now > validUntil) return 1;
  return Math.min(1.025, Math.max(0.97, state.matchModifier || 1));
};
var applyFocusToFormImpact = (impact, club, currentDate, seed, applyUnpreparedPenalty = false, unpreparedPenaltyMultiplier = 1) => {
  const aiTrainingModifier = getAIWeeklyTrainingModifier(club, currentDate);
  const applyAITraining = (impactToAdjust) => {
    if (aiTrainingModifier === 1) return impactToAdjust;
    const delta = aiTrainingModifier - 1;
    return {
      ...impactToAdjust,
      finishingMultiplier: Math.min(1.07, Math.max(0.935, impactToAdjust.finishingMultiplier * aiTrainingModifier)),
      goalkeepingMultiplier: Math.min(1.06, Math.max(0.94, impactToAdjust.goalkeepingMultiplier * (1 + delta * 0.75))),
      initiativeModifier: Math.min(0.038, Math.max(-0.03, impactToAdjust.initiativeModifier + delta * 0.4)),
      shotModifier: Math.min(0.022, Math.max(-0.016, impactToAdjust.shotModifier + delta * 0.18)),
      shotResistanceModifier: Math.min(0.022, Math.max(-0.016, impactToAdjust.shotResistanceModifier + delta * 0.14))
    };
  };
  if (!isFocusReady(club, currentDate)) {
    if (!applyUnpreparedPenalty) return applyAITraining(impact);
    const hasAnyFocus = !!club.matchPrepFocusId && !!club.matchPrepFocusStartDate;
    const penaltyScale = Math.max(0.5, Math.min(1.65, (hasAnyFocus ? 0.7 : 1) * unpreparedPenaltyMultiplier));
    return applyAITraining({
      ...impact,
      score: impact.score - 0.32 * penaltyScale,
      momentumBonus: Math.max(-7, impact.momentumBonus - 2.4 * penaltyScale),
      initiativeModifier: Math.max(-0.03, impact.initiativeModifier - 0.01 * penaltyScale),
      shotModifier: Math.max(-0.018, impact.shotModifier - 6e-3 * penaltyScale),
      shotResistanceModifier: Math.max(-0.016, impact.shotResistanceModifier - 4e-3 * penaltyScale),
      finishingMultiplier: Math.max(0.935, impact.finishingMultiplier - 0.018 * penaltyScale),
      goalkeepingMultiplier: Math.max(0.94, impact.goalkeepingMultiplier - 0.012 * penaltyScale)
    });
  }
  const focus = MATCH_PREP_FOCUSES.find((f) => f.id === club.matchPrepFocusId);
  if (!focus) return applyAITraining(impact);
  const eff = calcEffectiveness(club.reputation, seed);
  if (focus.isRecovery) {
    const penalty = 5e-3 + seededRng(seed, 77) * focus.recoveryPenaltyMax;
    return applyAITraining({
      ...impact,
      finishingMultiplier: Math.max(0.94, impact.finishingMultiplier - penalty)
    });
  }
  return applyAITraining({
    ...impact,
    finishingMultiplier: Math.min(1.06, impact.finishingMultiplier + focus.finishingMultiplierBase * eff),
    shotModifier: Math.min(0.02, impact.shotModifier + focus.shotModifierBase * eff),
    initiativeModifier: Math.min(0.035, impact.initiativeModifier + focus.initiativeModifierBase * eff),
    shotResistanceModifier: Math.min(0.02, impact.shotResistanceModifier + focus.shotResistanceModifierBase * eff),
    goalkeepingMultiplier: Math.min(1.05, impact.goalkeepingMultiplier + focus.goalkeepingMultiplierBase * eff)
  });
};

// services/CoachPreMatchMoraleService.ts
var clamp3 = (value, min, max) => Math.max(min, Math.min(max, value));
var getCoachExpPointsRating = (coach) => {
  const expPoints = Math.max(1, Number(coach?.expPoints ?? 1));
  return clamp3(Math.log10(expPoints + 1) / Math.log10(501) * 100, 0, 100);
};
var CoachPreMatchMoraleService = {
  getEffectiveExperience: (coach) => {
    const attributeExperience = clamp3(Number(coach?.attributes?.experience ?? 50), 1, 99);
    const expPointsRating = getCoachExpPointsRating(coach);
    return attributeExperience * 0.75 + expPointsRating * 0.25;
  },
  getPreMatchMoraleBonus: (coach) => {
    const effectiveExperience = CoachPreMatchMoraleService.getEffectiveExperience(coach);
    return Math.round(clamp3((effectiveExperience - 50) / 50 * 4, -3, 4));
  },
  getEffectivePreMatchMorale: (club, coach) => {
    const baseMorale = Number(club.morale ?? 50);
    return clamp3(baseMorale + CoachPreMatchMoraleService.getPreMatchMoraleBonus(coach), 5, 95);
  },
  getPreMatchMoraleMultiplier: (club, coach) => {
    const effectiveMorale = CoachPreMatchMoraleService.getEffectivePreMatchMorale(club, coach);
    return clamp3(0.94 + effectiveMorale / 50 * 0.06, 0.94, 1.06);
  }
};

// services/MomentumService.ts
var MomentumService = {
  /**
   * Zwraca wartość natychmiastowego przesunięcia paska na podstawie typu zdarzenia.
   */
  getEventImpulse: (type, side) => {
    const power = side === "HOME" ? 1 : -1;
    switch (type) {
      case "GOAL" /* GOAL */:
        return 45 * power;
      case "SHOT_ON_TARGET" /* SHOT_ON_TARGET */:
        return 15 * power;
      case "SHOT_POST" /* SHOT_POST */:
      case "SHOT_BAR" /* SHOT_BAR */:
        return 20 * power;
      case "PRESSURE" /* PRESSURE */:
        return 12 * power;
      case "CORNER" /* CORNER */:
        return 8 * power;
      case "BLUNDER" /* BLUNDER */:
        return -25 * power;
      case "STUMBLE" /* STUMBLE */:
      case "MISPLACED_PASS" /* MISPLACED_PASS */:
        return -10 * power;
      case "RED_CARD" /* RED_CARD */:
        return -40 * power;
      case "YELLOW_CARD" /* YELLOW_CARD */:
        return -5 * power;
      case "GK_LONG_THROW" /* GK_LONG_THROW */:
        return 5 * power;
      case "DRIBBLING" /* DRIBBLING */:
        return 7 * power;
      case "PENALTY_AWARDED" /* PENALTY_AWARDED */:
        return 30 * power;
      case "PENALTY_SCORED" /* PENALTY_SCORED */:
        return 40 * power;
      case "PENALTY_MISSED" /* PENALTY_MISSED */:
        return -35 * power;
      default:
        return 0;
    }
  },
  /**
   * Computes the "Natural Target" for momentum based on stats and tactics.
   * v2.8: forma klubu liczona na pełnym oknie ostatnich 5 spotkań.
   */
  calculateNaturalTarget: (ctx, state) => {
    let target = (ctx.homeClub.reputation - ctx.awayClub.reputation) * 0.5;
    if (ctx.homeAdvantage) target += 5;
    const getTeamTechPower = (players, lineupIds) => {
      const active = players.filter((p) => lineupIds.includes(p.id));
      if (active.length === 0) return 50;
      const sum = active.reduce(
        (acc, p) => acc + (p.attributes.technique * 0.4 + p.attributes.passing * 0.4 + p.attributes.pace * 0.2),
        0
      );
      return sum / active.length;
    };
    const homePower = getTeamTechPower(ctx.homePlayers, state.homeLineup.startingXI);
    const awayPower = getTeamTechPower(ctx.awayPlayers, state.awayLineup.startingXI);
    target += (homePower - awayPower) * 1.2;
    const homeTactic = TacticRepository.getById(state.homeLineup.tacticId);
    const awayTactic = TacticRepository.getById(state.awayLineup.tacticId);
    target += (homeTactic.attackBias - awayTactic.attackBias) * 0.4;
    const techGap = homePower - awayPower;
    if (homeTactic.attackBias > 65 && techGap < -8) target += techGap < -15 ? -12 : -6;
    if (homeTactic.defenseBias > 65 && techGap < -8) target += techGap < -15 ? 8 : 4;
    if (awayTactic.attackBias > 65 && techGap > 8) target += techGap > 15 ? 12 : 6;
    if (awayTactic.defenseBias > 65 && techGap > 8) target += techGap > 15 ? -8 : -4;
    const homeRedCount = state.sentOffIds.filter((id) => ctx.homePlayers.some((p) => p.id === id)).length;
    const awayRedCount = state.sentOffIds.filter((id) => ctx.awayPlayers.some((p) => p.id === id)).length;
    const getRedCardMomentumPenalty = (redCount, tactic) => {
      if (redCount <= 0) return 0;
      const overreach = Math.max(0, Math.min(1, (tactic.attackBias - 50) / 45));
      const defensiveCover = tactic.defenseBias >= 68 && tactic.attackBias <= 50 ? 0.65 : 1;
      return redCount * (10 + overreach * 8) * defensiveCover;
    };
    target -= getRedCardMomentumPenalty(homeRedCount, homeTactic);
    target += getRedCardMomentumPenalty(awayRedCount, awayTactic);
    const matchDateStr = ctx.fixture.date instanceof Date ? ctx.fixture.date.toISOString().split("T")[0] : String(ctx.fixture.date);
    const matchSeed = new Date(matchDateStr).getTime() / 1e5;
    const homeFormImpact = applyFocusToFormImpact(analyzeClubFormImpact(ctx.homeClub.stats.form, ctx.homeCoach), ctx.homeClub, matchDateStr, matchSeed);
    const awayFormImpact = applyFocusToFormImpact(analyzeClubFormImpact(ctx.awayClub.stats.form, ctx.awayCoach), ctx.awayClub, matchDateStr, matchSeed + 1);
    target += homeFormImpact.momentumBonus - awayFormImpact.momentumBonus;
    const homeMorale = CoachPreMatchMoraleService.getEffectivePreMatchMorale(ctx.homeClub, ctx.homeCoach);
    const awayMorale = CoachPreMatchMoraleService.getEffectivePreMatchMorale(ctx.awayClub, ctx.awayCoach);
    const homeMoraleBonus = (homeMorale - 50) / 50 * 6;
    const awayMoraleBonus = (awayMorale - 50) / 50 * 6;
    target += homeMoraleBonus - awayMoraleBonus;
    const homeDeepSlump = homeFormImpact.isDeepSlump;
    const awayDeepSlump = awayFormImpact.isDeepSlump;
    const lowerBound = homeDeepSlump && !awayDeepSlump ? -92 : awayDeepSlump && !homeDeepSlump ? -78 : -85;
    const upperBound = awayDeepSlump && !homeDeepSlump ? 92 : homeDeepSlump && !awayDeepSlump ? 78 : 85;
    const getDefAvgRating = (players, xi) => {
      const defList = players.filter((p) => xi.includes(p.id) && p.position === "DEF");
      if (defList.length === 0) return 6.5;
      const avgRatings = defList.map((p) => {
        const recent = p.stats?.ratingHistory?.slice(-5) ?? [];
        return recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : 6.5;
      });
      return avgRatings.reduce((a, b) => a + b, 0) / avgRatings.length;
    };
    const homeDefAvg = getDefAvgRating(ctx.homePlayers, state.homeLineup.startingXI);
    const awayDefAvg = getDefAvgRating(ctx.awayPlayers, state.awayLineup.startingXI);
    let homeDefBonus = 0;
    if (homeDefAvg >= 7) homeDefBonus = Math.min(4, (homeDefAvg - 7) * 2);
    else if (homeDefAvg < 6.4) homeDefBonus = Math.max(-4, (homeDefAvg - 6.4) * 2);
    let awayDefBonus = 0;
    if (awayDefAvg >= 7) awayDefBonus = Math.min(4, (awayDefAvg - 7) * 2);
    else if (awayDefAvg < 6.4) awayDefBonus = Math.max(-4, (awayDefAvg - 6.4) * 2);
    target += homeDefBonus - awayDefBonus;
    const homeCaptain = ctx.homeClub.captainId ? ctx.homePlayers.find((p) => p.id === ctx.homeClub.captainId) : null;
    const awayCaptain = ctx.awayClub.captainId ? ctx.awayPlayers.find((p) => p.id === ctx.awayClub.captainId) : null;
    const homeCaptainOnPitch = homeCaptain ? state.homeLineup.startingXI.includes(homeCaptain.id) : false;
    const awayCaptainOnPitch = awayCaptain ? state.awayLineup.startingXI.includes(awayCaptain.id) : false;
    const homeCaptainLeadership = homeCaptainOnPitch ? homeCaptain.attributes.leadership : 50;
    const awayCaptainLeadership = awayCaptainOnPitch ? awayCaptain.attributes.leadership : 50;
    target += (homeCaptainLeadership - awayCaptainLeadership) / 100 * 6;
    return Math.max(lowerBound, Math.min(upperBound, target));
  },
  /**
   * Dynamiczny silnik Momentum v2.6 - Zmęczenie drużyny wpływa na pasek momentum.
   */
  computeMomentum: (ctx, state, lastEventType, lastEventSide, homeFatigueMap, awayFatigueMap, weather) => {
    const naturalTarget = MomentumService.calculateNaturalTarget(ctx, state);
    const precipDampen = weather && weather.precipitationChance > 60 ? 1 - Math.min(0.22, (weather.precipitationChance - 60) / 180) : 1;
    const windJitter = weather && weather.windKmh > 40 ? Math.min(1, (weather.windKmh - 40) / 80) * (Math.random() - 0.5) * 3 : 0;
    const heatFatigueAmp = weather && weather.tempC > 30 ? 1 + Math.min(0.4, (weather.tempC - 30) / 25) : 1;
    let impulse = 0;
    if (lastEventType && lastEventSide) {
      impulse = MomentumService.getEventImpulse(lastEventType, lastEventSide);
    }
    const dominanceConfidence = Math.min(1, Math.abs(naturalTarget) / 70);
    const upsetNoiseFactor = 1 - dominanceConfidence * 0.45;
    const jitter = (Math.random() - 0.5) * 3 * upsetNoiseFactor + windJitter;
    const homeIds = state.homeLineup.startingXI.filter((id) => id !== null);
    const awayIds = state.awayLineup.startingXI.filter((id) => id !== null);
    const homeAvgMentality = homeIds.reduce((acc, id) => {
      const player = ctx.homePlayers.find((x) => x.id === id);
      return acc + (player?.attributes.mentality ?? 50);
    }, 0) / Math.max(1, homeIds.length);
    const awayAvgMentality = awayIds.reduce((acc, id) => {
      const player = ctx.awayPlayers.find((x) => x.id === id);
      return acc + (player?.attributes.mentality ?? 50);
    }, 0) / Math.max(1, awayIds.length);
    const activeMentality = lastEventSide === "HOME" ? homeAvgMentality : awayAvgMentality;
    const mentalityErrorMod = 1 - (activeMentality - 50) / 100 * 0.4;
    const humanError = Math.random() < 0.015 * mentalityErrorMod * upsetNoiseFactor ? (Math.random() - 0.5) * 16 * mentalityErrorMod * upsetNoiseFactor : 0;
    const getAvgFatigue = (lineup, fatigueMap) => {
      const ids = lineup.filter((id) => id !== null);
      if (ids.length === 0) return 100;
      return ids.reduce((acc, id) => acc + (fatigueMap[id] ?? 100), 0) / ids.length;
    };
    const homeAvg = homeFatigueMap ? getAvgFatigue(state.homeLineup.startingXI, homeFatigueMap) : 100;
    const awayAvg = awayFatigueMap ? getAvgFatigue(state.awayLineup.startingXI, awayFatigueMap) : 100;
    const fatiguePenalty = (avg2) => {
      if (avg2 < 35) return 8;
      if (avg2 < 50) return 5;
      if (avg2 < 70) return 2;
      return 0;
    };
    const fatigueBalance = (fatiguePenalty(awayAvg) - fatiguePenalty(homeAvg)) * heatFatigueAmp;
    const current = state.momentum + impulse;
    const lerpFactor = 0.08;
    const nextVal = current + (naturalTarget * precipDampen - current) * lerpFactor + jitter + humanError + fatigueBalance;
    return Math.max(-100, Math.min(100, nextVal));
  }
};

// services/MatchEngineService.ts
var MatchEngineService = {
  calculateFatigueStep: (state, ctx, weather) => {
    const homeFatigue = { ...state.homeFatigue };
    const awayFatigue = { ...state.awayFatigue };
    const homePressureFactor = state.momentum < -75 ? 1.35 : 1;
    const awayPressureFactor = state.momentum > 75 ? 1.35 : 1;
    const homeTacticPressing = TacticRepository.getById(state.homeLineup.tacticId);
    const awayTacticPressing = TacticRepository.getById(state.awayLineup.tacticId);
    const homePressingMod = 0.94 + homeTacticPressing.pressingIntensity / 100 * 0.12;
    const awayPressingMod = 0.94 + awayTacticPressing.pressingIntensity / 100 * 0.12;
    const _redFatMod = (redCount) => {
      if (redCount === 0) return 1;
      if (redCount === 1) return 1.12;
      if (redCount === 2) return 1.27;
      return 1.45;
    };
    const homeRedCount = state.sentOffIds.filter((id) => ctx.homePlayers.some((p) => p.id === id)).length;
    const awayRedCount = state.sentOffIds.filter((id) => ctx.awayPlayers.some((p) => p.id === id)).length;
    const homeRedFatMod = _redFatMod(homeRedCount);
    const awayRedFatMod = _redFatMod(awayRedCount);
    const getRotationFatigueMod = (minute, subsUsed) => {
      if (minute < 55) return 1;
      const lateFactor = Math.min(1, (minute - 55) / 35);
      const missingRotation = Math.max(0, 4 - subsUsed);
      return 1 + missingRotation * 0.075 * lateFactor;
    };
    const homeRotationFatMod = getRotationFatigueMod(state.minute, state.subsCountHome);
    const awayRotationFatMod = getRotationFatigueMod(state.minute, state.subsCountAway);
    const update = (players, fatigueMap, sideLineup, pressureFactor, pressingMod, redFatigueMod, rotationFatigueMod) => {
      players.forEach((p) => {
        if (!sideLineup.includes(p.id)) return;
        const current = fatigueMap[p.id] !== void 0 ? fatigueMap[p.id] : 100;
        let drain = 0.19 * pressureFactor;
        if (p.position === "DEF" /* DEF */) drain *= 1.35;
        if (p.position === "MID" /* MID */) drain *= 1.35;
        if (p.position === "FWD" /* FWD */) drain *= 1.2;
        if (p.position === "GK" /* GK */) drain *= 0.75 + (p.attributes.stamina || 50) / 100 * 0.1;
        const intensityChaos = 0.8 + Math.random() * 0.4;
        drain *= intensityChaos;
        const staminaBonus = Math.pow((p.attributes.stamina || 50) / 100, 2);
        const efficiency = 1.3 - staminaBonus * 0.6;
        drain *= efficiency;
        const workRateMod = 0.85 + p.attributes.workRate / 100 * 0.3;
        drain *= workRateMod;
        drain *= pressingMod;
        drain *= redFatigueMod;
        drain *= rotationFatigueMod;
        if (weather && weather.precipitationChance > 0) drain *= 1.08;
        if (weather && weather.tempC > 30) drain *= 1.1;
        fatigueMap[p.id] = Math.max(0, current - drain);
      });
    };
    update(ctx.homePlayers, homeFatigue, state.homeLineup.startingXI, homePressureFactor, homePressingMod, homeRedFatMod, homeRotationFatMod);
    update(ctx.awayPlayers, awayFatigue, state.awayLineup.startingXI, awayPressureFactor, awayPressingMod, awayRedFatMod, awayRotationFatMod);
    return { home: homeFatigue, away: awayFatigue };
  },
  generateCommentary: (minute, seed, homeFull, awayFull) => {
    if (minute % 5 !== 0 || minute === 0) return null;
    const phrases = [
      "{TEAM} kontroluje tempo gry dzi\u0119ki \u015Bwietnej technice w \u015Brodku pola.",
      "Defensywa {TEAM} czyta gr\u0119 bezb\u0142\u0119dnie, blokuj\u0105c ka\u017Cd\u0105 pr\xF3b\u0119 ataku.",
      "Si\u0142a fizyczna zawodnik\xF3w {TEAM} pozwala im wygrywa\u0107 wi\u0119kszo\u015B\u0107 pojedynk\xF3w.",
      "{TEAM} szuka szybkich skrzyde\u0142, wykorzystuj\u0105c szybko\u015B\u0107 swoich napastnik\xF3w.",
      "Bramkarz {TEAM} dyryguje obron\u0105, \u015Bwietnie si\u0119 ustawiaj\u0105c.",
      "Wizja gry pomocnik\xF3w {TEAM} imponuje, szukaj\u0105 prostopad\u0142ych poda\u0144.",
      "Mocny pressing {TEAM} zmusza rywala do b\u0142\u0119d\xF3w technicznych.",
      "{TEAM} dominuje fizycznie, spychaj\u0105c przeciwnika pod w\u0142asne pole karne.",
      "Elegancka gra {TEAM}, pi\u0142ka chodzi od nogi do nogi jak po sznurku.",
      "Znakomite ustawienie defensywne {TEAM} uniemo\u017Cliwia oddanie strza\u0142u."
    ];
    const teamSide = (minute + seed) % 2 === 0 ? "HOME" : "AWAY";
    const teamName = teamSide === "HOME" ? homeFull : awayFull;
    const idx = (minute + seed) % phrases.length;
    const text = phrases[idx].replace("{TEAM}", teamName);
    return {
      id: `LOG_GENERIC_${minute}_${seed}`,
      minute,
      text,
      teamSide,
      type: "GENERIC" /* GENERIC */
    };
  }
};

// services/PlayerFormService.ts
var clamp4 = (value, min, max) => Math.max(min, Math.min(max, value));
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
    return clamp4(goalsPerMatch * 20 + assistsPerMatch * 8 - (goalsPerMatch === 0 ? 8 : 0), -10, 14);
  }
  if (player.position === "MID" /* MID */) {
    return clamp4(contributionsPerMatch * 18, -4, 12);
  }
  if (player.position === "GK" /* GK */) {
    return clamp4(cleanSheetRate * 18 - (cleanSheetRate === 0 ? 4 : 0), -8, 14);
  }
  return clamp4(contributionsPerMatch * 10, -4, 8);
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
      score += clamp4((seasonAverage - 6.5) * 10, -18, 22);
    }
    if (recent10Average !== null) {
      score += clamp4((recent10Average - 6.5) * 14, -22, 28);
    }
    if (recentAverage !== null) {
      score += clamp4((recentAverage - 6.5) * 8, -12, 16);
    }
    if (recentAverage !== null && previousAverage !== null) {
      score += clamp4((recentAverage - previousAverage) * 10, -10, 10);
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
    score += clamp4(((player.morale ?? 50) - 50) * 0.18, -9, 9);
    if (matches > 0 || recentAverage !== null) score += player.trainingFocus ? 4 : -3;
    if (player.health?.status === "INJURED" /* INJURED */) score -= 18;
    if ((player.condition ?? 100) < 60) score -= 8;
    if ((player.fatigueDebt ?? 0) > 55) score -= 6;
    return PlayerFormService.getInfo(Math.round(clamp4(score, 0, 100)));
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
      return clamp4(adjustment - strainPenalty, -9, 7);
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
    const safeScore = Math.round(clamp4(score, 0, 100));
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

// services/TeamFormImpactService.ts
var clamp5 = (value, min, max) => Math.max(min, Math.min(max, value));
var average2 = (values, fallback) => values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;
var getPlayerForm = (player) => player ? player.form ?? PlayerFormService.calculate(player).score : 50;
var getPlayersByIds = (players, ids) => {
  const playerMap = new Map(players.map((player) => [player.id, player]));
  return ids.map((id) => id ? playerMap.get(id) : void 0).filter((player) => !!player);
};
var getBaseFormMultiplier = (form) => {
  if (form <= 10) return 0.62 + form * 8e-3;
  if (form <= 25) return 0.7 + (form - 10) * 8e-3;
  if (form <= 40) return 0.82 + (form - 25) * 87e-4;
  if (form <= 60) return 0.95 + (form - 40) * 5e-3;
  if (form <= 75) return 1.05 + (form - 60) * 6e-3;
  if (form <= 90) return 1.14 + (form - 75) * 53e-4;
  return 1.22 + (form - 90) * 3e-3;
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
  if (opponentMultiplier < 1) return 1 + (1 - opponentMultiplier) * 0.72;
  return 1 - (opponentMultiplier - 1) * 0.28;
};
var TeamFormImpactService = {
  getPlayerForm,
  getSelectionFormBonus(player, coachQuality) {
    const form = getPlayerForm(player);
    const awareness = clamp5(coachQuality / 100, 0.25, 1);
    const weight = 7 + awareness * 7;
    return clamp5((form - 50) / 50 * weight, -14, 14);
  },
  calculateMatchImpact(homePlayers, awayPlayers, homeLineup, awayLineup) {
    const homeQuality = getTeamQuality(homePlayers, homeLineup);
    const awayQuality = getTeamQuality(awayPlayers, awayLineup);
    const homeForm = getTeamForm(homePlayers, homeLineup);
    const awayForm = getTeamForm(awayPlayers, awayLineup);
    const homePerformance = adjustForQualityGap(getBaseFormMultiplier(homeForm), homeQuality, awayQuality);
    const awayPerformance = adjustForQualityGap(getBaseFormMultiplier(awayForm), awayQuality, homeQuality);
    const homeGoalChanceMultiplier = clamp5(homePerformance * getDefenseLeakMultiplier(awayPerformance), 0.42, 1.78);
    const awayGoalChanceMultiplier = clamp5(awayPerformance * getDefenseLeakMultiplier(homePerformance), 0.42, 1.78);
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

// services/ManagerNegotiationInfluenceService.ts
var clamp6 = (value, min, max) => Math.min(max, Math.max(min, value));
var getExperience = (managerProfile) => {
  if (!managerProfile || !Number.isFinite(managerProfile.experience)) return 50;
  return clamp6(managerProfile.experience, 1, 99);
};
var ManagerNegotiationInfluenceService = {
  calculate(managerProfile) {
    const experience = getExperience(managerProfile);
    const normalized = clamp6((experience - 50) / 49, -1, 1);
    return {
      experience,
      normalized,
      scoreAdjustment: Math.round(normalized * 8),
      chanceAdjustment: normalized * 0.06,
      expectationMultiplier: clamp6(1 - normalized * 0.045, 0.955, 1.045),
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
var clamp7 = (value, min, max) => Math.max(min, Math.min(max, value));
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
      return 0.94 + clamp7(careerMatches / 260, 0, 1) * 0.2;
    case "GK" /* GK */:
      return 0.92 + clamp7(careerMatches / 240, 0, 1) * 0.24;
    default:
      return 0.94 + clamp7(careerMatches / 260, 0, 1) * 0.08;
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
  const sampleFactor = clamp7(minutesPlayed / 900, 0, 1);
  const ratingDelta = averageRating === null ? 0 : averageRating - 6.7;
  switch (player.position) {
    case "FWD" /* FWD */: {
      const goalsPer90 = goals / fullMatches;
      const assistsPer90 = assists / fullMatches;
      const goalsBoost = clamp7(goals / 20, 0, 1) * 0.2 + clamp7(goalsPer90 / 0.75, 0, 1) * 0.18;
      const assistsBoost = clamp7(assists / 10, 0, 1) * 0.07 + clamp7(assistsPer90 / 0.35, 0, 1) * 0.05;
      const ratingBoost = clamp7(ratingDelta * 0.1, -0.08, 0.1);
      return 1 + clamp7(sampleFactor * (goalsBoost + assistsBoost + ratingBoost), -0.1, 0.52);
    }
    case "MID" /* MID */: {
      const goalsPer90 = goals / fullMatches;
      const assistsPer90 = assists / fullMatches;
      const assistsBoost = clamp7(assists / 14, 0, 1) * 0.18 + clamp7(assistsPer90 / 0.45, 0, 1) * 0.15;
      const goalsBoost = clamp7(goals / 12, 0, 1) * 0.08 + clamp7(goalsPer90 / 0.35, 0, 1) * 0.06;
      const ratingBoost = clamp7(ratingDelta * 0.11, -0.08, 0.12);
      return 1 + clamp7(sampleFactor * (assistsBoost + goalsBoost + ratingBoost), -0.1, 0.46);
    }
    case "DEF" /* DEF */: {
      const matchFactor = clamp7(matchesPlayed / 30, 0, 1) * 0.1;
      const experienceBoost = clamp7(getCareerMatches(player) / 260, 0, 1) * 0.12;
      const ratingBoost = averageRating === null ? 0 : clamp7((averageRating - 6.6) * 0.18, -0.1, 0.22) * clamp7(matchesPlayed / 10, 0, 1);
      return 1 + clamp7(matchFactor + experienceBoost + ratingBoost, -0.1, 0.42);
    }
    case "GK" /* GK */: {
      const matchFactor = clamp7(matchesPlayed / 30, 0, 1) * 0.1;
      const experienceBoost = clamp7(getCareerMatches(player) / 240, 0, 1) * 0.14;
      const ratingBoost = averageRating === null ? 0 : clamp7((averageRating - 6.6) * 0.22, -0.1, 0.24) * clamp7(matchesPlayed / 8, 0, 1);
      return 1 + clamp7(matchFactor + experienceBoost + ratingBoost, -0.12, 0.46);
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
  const reputationFactor = 0.88 + clamp7(reputation, 1, 10) * 0.025;
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
  return clamp7(countryFactor * reputationFactor * stadiumFactor * competitionFactor / 1.45, 0.45, 2.6);
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
  const marketFactor = clamp7(0.5 + Math.sqrt(financeFactor / 1.45) * 0.55, 0.45, 1.1);
  const capScale = clamp7(marketFactor / 0.9, 0.55, 1.22);
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
  const reputationFactor = 0.9 + clamp7(reputation, 1, 20) * 0.015;
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
    const reputationFactor = clamp7((Math.max(1, Math.min(10, reputation)) - 4) / 6, 0, 1);
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
        return Math.round(clamp7(rawCost2, minFloor, maxCap));
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
      return Math.round(clamp7(rawCost2, 5e4, 8e7) / 1e3) * 1e3;
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
    return Math.round(clamp7(rawCost, tierMin, tierMax) / 1e3) * 1e3;
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
    return Math.round(clamp7(maxPrice, 45, 420));
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
    const seasonTicketShare = clamp7(0.14 + marketIndex * 0.1 + club.reputation / 20 * 0.18, 0.16, 0.65);
    const ticketsSold = Math.floor(club.stadiumCapacity * seasonTicketShare);
    const singleMatchPrice = FinanceService.calculateTicketPriceForClub(club);
    const seasonDiscount = clamp7(0.68 + marketIndex * 0.05, 0.7, 0.82);
    const seasonTicketPrice = Math.round(clamp7(singleMatchPrice * 19 * seasonDiscount, 900, 8500));
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
  getSponsorCheckProbability: (avg2) => {
    const f = Math.floor(Math.max(1, Math.min(20, avg2)));
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
  getSponsorAmount: (avg2) => {
    const MIN = 1e5;
    const MAX = 1e8;
    const clamped = Math.max(1, Math.min(20, avg2));
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
var seededRng2 = (seed, offset) => {
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
  const randomPremium = seededRng2(seed, 29) * 0.05;
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
var getRandomSeasonSuccessLevelUpSteps = (seed, offset) => seededRng2(seed, offset) < 0.5 ? 1 : 2;
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
    const roll = Math.max(0, Math.min(0.999, seededRng2(seed, 3) + ageBias + mentalityBias));
    const stars = roll < 0.16 ? 1 : roll < 0.36 ? 2 : roll < 0.66 ? 3 : roll < 0.88 ? 4 : 5;
    const ranges = {
      1: [10, 20],
      2: [25, 35],
      3: [45, 64],
      4: [68, 79],
      5: [84, 95]
    };
    const [min, max] = ranges[stars] ?? ranges[3];
    const variation = Math.floor(seededRng2(seed, 11) * (max - min + 1));
    return PlayerMoraleService.clamp(min + variation);
  },
  getInitialPersonality: (player) => {
    const attrs = player.attributes;
    if ((attrs.workRate ?? 50) >= 75 && (attrs.mentality ?? 50) >= 68) return "PROFESSIONAL";
    if ((attrs.talent ?? 50) >= 78 || (attrs.attacking ?? 50) >= 76) return "AMBITIOUS";
    if ((attrs.leadership ?? 50) >= 76) return "CONFIDENT";
    if ((attrs.aggression ?? 50) >= 76) return "EGOIST";
    const index = Math.floor(seededRng2(stableHash(player.id), 7) * PERSONALITIES.length);
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
    const gratitudeScore = (withMorale.morale ?? 50) * 0.14 + mindset.clubHappiness * 0.24 + mindset.squadBelonging * 0.18 + mindset.coachTrust * 0.1 - mindset.conflictLevel * 0.18 + (personality === "LOYAL" || personality === "PROFESSIONAL" ? 10 : 0) + (personality === "EGOIST" || personality === "AMBITIOUS" ? -4 : 0) + seededRng2(seed, 31) * 24;
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
    const roll = seededRng2(seed, 71);
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
    const rng = seededRng2(seed + stableHash(player.id) + currentDate.getTime(), talkType.length);
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
    const swing = 1 + Math.floor(seededRng2(seed, talkType.charCodeAt(0)) * 3);
    const backfireRisk = 0.22 + (talkType === "CRITICIZE" || talkType === "DEMAND_WORK" ? 0.18 : 0) + (talkType === "PROMISE_MINUTES" ? 0.1 : 0) + (personality === "SENSITIVE" || personality === "NERVOUS" ? 0.18 : 0) + (personality === "EGOIST" ? 0.1 : 0);
    const backfireRoll = seededRng2(seed + stableHash(player.id), talkType.charCodeAt(0) + 31);
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
    if (morale <= 19) return 0.92;
    if (morale <= 39) return 0.96;
    if (morale <= 59) return 1;
    if (morale <= 79) return 1.03;
    return 1.06;
  },
  getMatchContributionMultiplier: (player) => {
    const morale = player.morale ?? 50;
    if (morale <= 19) return 0.22;
    if (morale <= 39) return 0.55;
    if (morale <= 59) return 1;
    if (morale <= 79) return 1.18;
    return 1.35;
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
      const transferRandomFactor = Math.floor(seededRng2(stableHash(`${withMorale.id}_${dateKey}`), 43) * 13) - 6;
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
        const roll = seededRng2(seed, 19);
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
      const budgetNoise = (seededRng2(localSeed, 11) - 0.5) * 0.2 * (1.25 - accuracy);
      const perceivedBudget = Math.max(0, nextClub.budget * (1 + budgetNoise));
      const rawAmount = 2e4 + performanceScore * 650 + generosity * 5e3 + (seededRng2(localSeed, 17) - 0.5) * 2e4;
      const amount = roundOneTimeBonusAmount(rawAmount);
      const budgetScore = Math.max(0, Math.min(100, perceivedBudget / Math.max(1, amount) * 42));
      const rngScore = (seededRng2(localSeed, 23) - 0.5) * 20;
      const decisionScore = performanceScore * 0.55 + budgetScore * 0.25 + generosity * 6 + ambition * 4 - greed * 6 + rngScore;
      const seasonLimitReached = (nextClub.oneTimePlayerBonusesThisSeason ?? 0) >= 11;
      const alreadyAwarded = withMorale.oneTimeBonusAwardedSeason === seasonNumber;
      const hasEnoughBudget = nextClub.budget >= amount;
      const approved = !seasonLimitReached && !alreadyAwarded && hasEnoughBudget && performanceScore >= 48 && decisionScore >= 62;
      const ceoName = nextClub.management?.ceo ? `${nextClub.management.ceo.firstName} ${nextClub.management.ceo.lastName}` : "Zarz\u0105d Klubu";
      const statsLine = getOneTimeBonusStatsLine(withMorale, profile);
      const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
      if (approved) {
        const reactionRoll = seededRng2(localSeed, 37);
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
      const sellScore = boardAttributeScore(club.board?.chciwosc) * 2.5 + (club.transferBudget < marketValue * 0.35 ? 4 : 0) + (club.budget < marketValue * 0.2 ? 3 : 0) + Math.min(4, marketValue / Math.max(1, annualSalary * 3)) + seededRng2(seed, 17) * 9 - 4.5;
      const budgetCoversRaise = raiseRequest ? club.budget >= raiseRequest.salary * 0.5 : club.budget >= annualSalary * 1.3;
      const boardConfidence = club.boardConfidence ?? 60;
      const managerBonus = boardConfidence / 100 * seededRng2(seed, 7) * 5;
      const poorRelationBoost = boardConfidence < 40 ? (1 - boardConfidence / 100) * seededRng2(seed, 89) * 4 : 0;
      const raiseScore = boardAttributeScore(club.board?.hojnosc) * 2.2 + (budgetCoversRaise ? 3.5 : -2) + (rank <= 3 ? 2.5 : rank <= 6 ? 1.5 : 0) + managerBonus + seededRng2(seed, 31) * 7 - 3.5;
      const directorPersonalityMod = (() => {
        const p = club.sportingDirector?.personality;
        if (p === "CONTROLLER") return 3;
        if (p === "POLITICIAN") return 2;
        if (p === "ACCOUNTANT") return 1;
        if (p === "PARTNER") return -2;
        if (p === "TALENT_HUNTER") return -2;
        return 0;
      })();
      const vetoScore = boardAttributeScore(club.board?.cierpliwosc) * 2 + (club.sportingDirectorBoardInfluence ?? 50) / 100 * 6 + (boardConfidence > 70 ? 2 : boardConfidence > 50 ? 0 : -2) + directorPersonalityMod + poorRelationBoost + seededRng2(seed, 53) * 6 - 3;
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

// services/MatchActionService.ts
var clamp8 = (value, min, max) => Math.max(min, Math.min(max, value));
var avg = (values, fallback = 50) => values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;
var fatigueMod = (fatigue) => clamp8(0.72 + fatigue / 100 * 0.35, 0.72, 1.07);
var getActive = (players, lineup) => {
  const activeIds = new Set(lineup.startingXI.filter((id) => id !== null));
  return players.filter((player) => activeIds.has(player.id));
};
var roleScore = (player, fatigueMap) => {
  const f = fatigueMod(fatigueMap[player.id] ?? 100);
  switch (player.position) {
    case "GK" /* GK */:
      return (player.attributes.goalkeeping * 0.7 + player.attributes.positioning * 0.3) * f;
    case "DEF" /* DEF */:
      return (player.attributes.defending * 0.48 + player.attributes.positioning * 0.25 + player.attributes.strength * 0.17 + player.attributes.pace * 0.1) * f;
    case "MID" /* MID */:
      return (player.attributes.passing * 0.3 + player.attributes.technique * 0.25 + player.attributes.vision * 0.22 + player.attributes.workRate * 0.13 + player.attributes.stamina * 0.1) * f;
    case "FWD" /* FWD */:
      return (player.attributes.finishing * 0.36 + player.attributes.attacking * 0.24 + player.attributes.pace * 0.16 + player.attributes.dribbling * 0.14 + player.attributes.technique * 0.1) * f;
    default:
      return player.overallRating * f;
  }
};
var addContribution = (map, playerId, amount) => {
  if (!playerId || amount === 0) return;
  map[playerId] = (map[playerId] ?? 0) + amount;
};
var MatchActionService = {
  evaluateOpenPlayAction: ({
    attackingPlayers,
    defendingPlayers,
    attackingLineup,
    defendingLineup,
    attackingTactic,
    defendingTactic,
    attackingFatigue,
    defendingFatigue,
    scorer,
    assistant,
    isCounterAttack = false,
    rng
  }) => {
    const attackers = getActive(attackingPlayers, attackingLineup);
    const defenders = getActive(defendingPlayers, defendingLineup);
    const attackingMids = attackers.filter((player) => player.position === "MID" /* MID */);
    const attackingForwards = attackers.filter((player) => player.position === "FWD" /* FWD */);
    const defendingMids = defenders.filter((player) => player.position === "MID" /* MID */);
    const defendingBacks = defenders.filter((player) => player.position === "DEF" /* DEF */);
    const midfieldBuild = avg(attackingMids.map(
      (player) => (player.attributes.passing * 0.34 + player.attributes.technique * 0.26 + player.attributes.vision * 0.25 + player.attributes.workRate * 0.15) * fatigueMod(attackingFatigue[player.id] ?? 100)
    ));
    const midfieldPressure = avg(defendingMids.map(
      (player) => (player.attributes.defending * 0.32 + player.attributes.positioning * 0.22 + player.attributes.workRate * 0.2 + player.attributes.stamina * 0.14 + player.attributes.aggression * 0.12) * fatigueMod(defendingFatigue[player.id] ?? 100)
    ));
    const progression = avg(attackers.filter((player) => player.position !== "GK" /* GK */).map(
      (player) => (player.attributes.pace * 0.2 + player.attributes.dribbling * 0.22 + player.attributes.technique * 0.2 + player.attributes.passing * 0.18 + player.attributes.vision * 0.12 + player.attributes.strength * 0.08) * fatigueMod(attackingFatigue[player.id] ?? 100)
    ));
    const defensiveShape = avg(defenders.filter((player) => player.position !== "GK" /* GK */).map(
      (player) => (player.attributes.defending * 0.35 + player.attributes.positioning * 0.25 + player.attributes.strength * 0.15 + player.attributes.pace * 0.12 + player.attributes.mentality * 0.13) * fatigueMod(defendingFatigue[player.id] ?? 100)
    ));
    const creator = assistant ?? attackingMids.sort((a, b) => roleScore(b, attackingFatigue) - roleScore(a, attackingFatigue))[0] ?? scorer;
    const creatorScore = (creator.attributes.passing * 0.26 + creator.attributes.vision * 0.26 + creator.attributes.technique * 0.2 + creator.attributes.crossing * 0.14 + creator.attributes.dribbling * 0.14) * fatigueMod(attackingFatigue[creator.id] ?? 100);
    const scorerScore = (scorer.attributes.finishing * 0.34 + scorer.attributes.attacking * 0.22 + scorer.attributes.positioning * 0.16 + scorer.attributes.technique * 0.12 + scorer.attributes.pace * 0.1 + scorer.attributes.mentality * 0.06) * fatigueMod(attackingFatigue[scorer.id] ?? 100);
    const bestDefender = defendingBacks.sort((a, b) => roleScore(b, defendingFatigue) - roleScore(a, defendingFatigue))[0];
    const bestDefenderScore = bestDefender ? roleScore(bestDefender, defendingFatigue) : 35;
    const tacticIntent = (attackingTactic.attackBias - defendingTactic.defenseBias) * 0.16 + (attackingTactic.pressingIntensity - 50) * 0.05 - Math.max(0, defendingTactic.defenseBias - 70) * 0.06;
    const counterBoost = isCounterAttack ? 8 + Math.max(0, defendingTactic.attackBias - 55) * 0.12 : 0;
    const randomness = (rng() - 0.5) * 8;
    const rawQuality = (midfieldBuild - midfieldPressure) * 0.22 + (progression - defensiveShape) * 0.24 + (creatorScore - bestDefenderScore) * 0.16 + (scorerScore - bestDefenderScore) * 0.18 + tacticIntent + counterBoost + randomness;
    const quality = clamp8(1 + rawQuality / 95, 0.72, 1.28);
    const finishingFitMod = clamp8(1 + (quality - 1) * 0.2, 0.92, 1.08);
    const shotOnTargetBoost = clamp8((quality - 1) * 0.24, -0.08, 0.08);
    const dangerLabel = quality >= 1.18 ? "big" : quality >= 1.08 ? "clear" : quality <= 0.86 ? "chaotic" : "normal";
    const contributions = {};
    addContribution(contributions, scorer.id, 0.1 + Math.max(0, quality - 0.9) * 0.3);
    addContribution(contributions, creator.id, creator.id === scorer.id ? 0.04 : 0.08 + Math.max(0, quality - 1) * 0.18);
    if (bestDefender && quality < 1.04) {
      addContribution(contributions, bestDefender.id, 0.05 + (1.04 - quality) * 0.16);
    }
    return { quality, finishingFitMod, shotOnTargetBoost, dangerLabel, contributions };
  },
  mergeContributions: (base, extra) => {
    const merged = { ...base ?? {} };
    Object.entries(extra).forEach(([playerId, value]) => {
      merged[playerId] = (merged[playerId] ?? 0) + value;
    });
    return merged;
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
var clamp9 = (value, min, max) => Math.max(min, Math.min(max, value));
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
    return clamp9(0.72 + rating / 99 * 0.28, 0.72, 1);
  }
  return clamp9(1 - getPositionFamilyDistance(player.position, role) * 0.42, 0.54, 0.78);
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
    const qualityDrop = clamp9((naturalOverall - roleOverall) / 24, -0.25, 1);
    if (useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role)) {
      const secondaryGap = 1 - PlayerPositionFitService.getSecondaryRating(player) / 99;
      const raw2 = qualityDrop * 0.58 + secondaryGap * 0.32 + (1 - familiarity) * 0.1;
      return clamp9(Math.pow(Math.max(0, raw2), 1.25), 0.02, 0.55);
    }
    const raw = qualityDrop * 0.68 + familyDistance * 0.24 + (1 - familiarity) * 0.08;
    return clamp9(Math.pow(Math.max(0, raw), 1.18), 0.08, 1);
  },
  getFitScoreBonus: (player, role, useSecondaryPosition = false) => {
    if (player.position === role) return 16;
    if (isGoalkeeperMismatch(player, role)) return -80;
    const roleOverall = PlayerPositionFitService.getRoleOverall(player, role);
    const naturalOverall = Math.max(1, player.overallRating || getRoleOverall(player, player.position));
    const familiarity = getRoleFamiliarity(player, role, useSecondaryPosition);
    const roleQualityDelta = clamp9(roleOverall - naturalOverall, -18, 12);
    const base = useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role) ? 16 * (PlayerPositionFitService.getSecondaryRating(player) / 99) : -10 * getPositionFamilyDistance(player.position, role);
    return clamp9(base + roleQualityDelta * 0.55 + (familiarity - 0.65) * 12, -24, 16);
  },
  getSecondaryRating: (player) => Math.max(1, Math.min(99, player.secondaryPositionRating ?? DEFAULT_SECONDARY_POSITION_RATING)),
  getRoleOverall,
  // Effective role overall is the number the match engine should use when team strength depends on
  // who is actually occupying each tactical slot during the live match.
  getEffectiveRoleOverall: (player, role, useSecondaryPosition = false) => {
    if (player.position === role) return clamp9(Math.round(player.overallRating || getRoleOverall(player, role)), 1, 99);
    if (isGoalkeeperMismatch(player, role)) return Math.max(1, Math.round(getRoleOverall(player, role) * 0.35));
    const roleOverall = getRoleOverall(player, role);
    const penaltyFactor = PlayerPositionFitService.getPenaltyFactor(player, role, useSecondaryPosition);
    const familiarityDrag = player.position === role ? 0 : penaltyFactor * 8;
    return clamp9(Math.round(roleOverall - familiarityDrag), 1, 99);
  }
};

// services/TacticalMatchupService.ts
var clamp10 = (value, min, max) => Math.min(max, Math.max(min, value));
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
      const centralWeight = clamp10((attacking.centralAttackSlots - 2) / 3, 0.45, 1);
      push("CENTRAL_DM_GAP", 8e-3 * centralWeight, centralWeight);
    }
    if (attacking.centralMids - defending.centralMids >= 2 && defending.holdingMids <= 1) {
      const overloadWeight = clamp10((attacking.centralMids - defending.centralMids) / 3, 0.45, 1);
      push("MIDFIELD_OVERLOAD", 55e-4 * overloadWeight, overloadWeight);
    }
    const highLinePressure = (defending.tactic.attackBias >= 70 ? 0.45 : 0) + (defending.tactic.pressingIntensity >= 72 ? 0.35 : 0) + (defending.backLineY <= 0.72 ? 0.2 : 0);
    const paceGap = attackingPace - defendingBackPace;
    if (highLinePressure > 0.35 && paceGap > 3) {
      const trapWeight = clamp10((paceGap - 3) / 18, 0.25, 1) * clamp10(highLinePressure, 0.35, 1);
      push("HIGH_LINE_PACE_TRAP", 0.01 * trapWeight, trapWeight);
    }
    const pressGap = defending.tactic.pressingIntensity - attacking.tactic.pressingIntensity;
    const resistanceGap = attackingCentralTech - defendingPressQuality;
    if (pressGap >= 18 && resistanceGap > 4) {
      const pressWeight = clamp10((pressGap - 18) / 42, 0.25, 1) * clamp10((resistanceGap - 4) / 20, 0.25, 1);
      push("PRESS_RESISTANCE", 7e-3 * pressWeight, pressWeight);
    }
    if (defending.tactic.defenseBias >= 82 && defending.defCount >= 5 && attacking.tactic.attackBias <= 62) {
      const blockWeight = clamp10((defending.tactic.defenseBias - 78) / 18, 0.35, 1);
      push("LOW_BLOCK_STALE_POSSESSION", -8e-3 * blockWeight, blockWeight);
    }
    if (attacking.tactic.attackBias >= 78 && attacking.fwdCount >= 3 && defending.tactic.defenseBias >= 76 && defending.defCount >= 5) {
      const overcommitWeight = clamp10((attacking.tactic.attackBias - 72) / 24, 0.35, 1);
      push("OVERCOMMITTED_FRONT", -6e-3 * overcommitWeight, overcommitWeight);
    }
    const modifier = clamp10(signals.reduce((sum, signal) => sum + signal.modifier, 0), -0.018, 0.022);
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

// services/TacticalInstructionMatrixService.ts
var clamp11 = (value, min, max) => Math.min(max, Math.max(min, value));
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
      confidence: clamp11(confidence + (context.pressureDrama ?? 0) * 0.05, 0.2, 0.92),
      reason
    };
  }
};

// services/AiCoachTacticsService.ts
var seededRng3 = (seed, minute, offset = 0) => {
  let s = seed + minute + offset;
  const x = Math.sin(s) * 1e4;
  return x - Math.floor(x);
};
var enforceConsistency = (m, t, i) => {
  let tempo = t, mindset = m, intensity = i;
  if (mindset === "DEFENSIVE" && tempo === "FAST") tempo = "NORMAL";
  if (mindset === "OFFENSIVE") {
    if (tempo === "SLOW") tempo = "NORMAL";
    if (intensity === "CAUTIOUS") intensity = "NORMAL";
  }
  return { tempo, mindset, intensity };
};
var getTopLineAvg = (players, pos, topN) => {
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
  if (seededRng3(seed, minute, accurateOffset) < coachAccuracy) {
    if (paceGap >= 3) return "LONG";
    if (paceGap <= -3 || techGap >= 3) return "SHORT";
    return "MIXED";
  }
  const opts = ["SHORT", "MIXED", "LONG"];
  return opts[Math.floor(seededRng3(seed, minute, randomOffset) * 3)];
};
var AiCoachTacticsService = {
  // ─── ANALIZA PRZEDMECZOWA ─────────────────────────────────────────────────
  // Trener AI analizuje drużynę gracza i ustawia instrukcje startowe.
  // decisionMaking → jakość analizy; experience → zakres analizowanych sygnałów.
  decidePreMatchInstructions: (ownClub, ownCoach, ownPlayers, userClub, userPlayers, userTacticId, seed, opponentReport) => {
    const decisionMaking = ownCoach?.attributes.decisionMaking ?? 50;
    const experience = ownCoach?.attributes.experience ?? 50;
    const userFwdAvg = opponentReport?.perceivedLineStrengths.attack ?? getTopLineAvg(userPlayers, "FWD" /* FWD */, 3);
    const userDefAvg = opponentReport?.perceivedLineStrengths.defense ?? getTopLineAvg(userPlayers, "DEF" /* DEF */, 4);
    const userTacticDefBias = TacticRepository.getById(opponentReport?.predictedTacticId ?? userTacticId)?.defenseBias ?? 50;
    const repDiff = ownClub.reputation - userClub.reputation;
    let signalScore = 0;
    if (opponentReport) {
      if (opponentReport.recommendedApproach === "PRESS") signalScore += 2;
      if (opponentReport.recommendedApproach === "DIRECT") signalScore += 1;
      if (opponentReport.recommendedApproach === "CONTROL") signalScore += 0.5;
      if (opponentReport.recommendedApproach === "COUNTER") signalScore -= 1.5;
      if (opponentReport.recommendedApproach === "LOW_BLOCK") signalScore -= 2;
      if (opponentReport.predictedStyle === "OFFENSIVE") signalScore -= 1;
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
      const rng1 = seededRng3(seed, 0, 301);
      if (rng1 < decisionNoiseChance) {
        const rng2 = seededRng3(seed, 0, 302);
        const opts = ["DEFENSIVE", "NEUTRAL", "OFFENSIVE"];
        mindset = opts[Math.floor(rng2 * 3)];
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
    if (seededRng3(seed, 0, 303) < preCoachAccuracy) {
      if (passScore >= 2) prePassing = "LONG";
      else if (passScore <= -2) prePassing = "SHORT";
    } else {
      const opts = ["SHORT", "MIXED", "LONG"];
      prePassing = opts[Math.floor(seededRng3(seed, 0, 304) * 3)];
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
    const rng1 = seededRng3(seed, minute, 401);
    const rng2 = seededRng3(seed, minute, 402);
    const rng3 = seededRng3(seed, minute, 403);
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
        passing2 = opts[Math.floor(seededRng3(seed, minute, 704) * 3)];
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
      const duration = 5 + Math.round(coachScore * 5) + Math.floor(seededRng3(seed, minute, 701) * 4);
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
      if (seededRng3(seed, minute, 501) < counterChance) counterAttack = "COUNTER";
      else if (experience < 40 && seededRng3(seed, minute, 502) < 0.05) counterAttack = "COUNTER";
    }
    if (counterAttack !== "COUNTER") {
      const pressingCondition = mindset === "OFFENSIVE" && !seriousFatigue || aiMomentum > 30 && aiAvgFatigue > 66;
      if (pressingCondition) {
        let pressingChance;
        if (experience >= 70) pressingChance = 0.35;
        else if (experience >= 55) pressingChance = 0.2;
        else if (experience >= 40) pressingChance = 0.08;
        else pressingChance = 0.03;
        if (seededRng3(seed, minute, 503) < pressingChance) pressing = "PRESSING";
      } else if (experience < 40 && seededRng3(seed, minute, 504) < 0.04) {
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
      if (mustUseMatrix || seededRng3(seed, minute, 606) < matrixTrust) {
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

// data/prematch_briefing_pl.ts
var PREMATCH_BRIEFINGS = [
  {
    id: "PB_1",
    text: "Nikt w nas nie wierzy. Dzisiaj poka\u017Cemy im, \u017Ce pi\u0142ka jest okr\u0105g\u0142a. Nie mamy nic do stracenia, a wiele do zyskania!",
    hiddenType: "UPRISING"
  },
  {
    id: "PB_2",
    text: "Oddajmy im pi\u0142k\u0119 ale kontrolujmy to spotkanie i grajmy ostro\u017Cnie z ty\u0142u. Wystarczy jedna kontra i ten mecz jest nasz.",
    hiddenType: "FORTRESS"
  },
  {
    id: "PB_3",
    text: "Widzia\u0142em, co o nas pisali w prasie. Widzia\u0142em ich miny na konferencji. Poka\u017Cemy im na boisku, \u017Ce si\u0119 myl\u0105.",
    hiddenType: "WOUNDED_PRIDE"
  },
  {
    id: "PB_4",
    text: "Dzi\u015B nie ma taktyki, nie ma planu B. Jest tylko serce. Gramy swoje i nie odpuszczamy ani sekundy!",
    hiddenType: "KAMIKAZE"
  },
  {
    id: "PB_5",
    text: "Wiemy o nich wszystko. Trzymajmy si\u0119 tylko planu. Je\u015Bli nie damy si\u0119 ponie\u015B\u0107 emocjom to zwyci\u0119stwo samo do nas przyjdzie.",
    hiddenType: "TACTICIAN"
  },
  {
    id: "PB_6",
    text: "Zaczynamy ostro od samego pocz\u0105tku. Wychodzimy i atakujemy od pierwszych minut zanim oni zd\u0105\u017C\u0105 wej\u015B\u0107 w ten mecz. Zrozumiano ?!",
    hiddenType: "BLITZ"
  },
  {
    id: "PB_7",
    text: "Pami\u0119tajcie, \u017Ce mecz trwa dziewi\u0119\u0107dziesi\u0105t minut. Nie biegamy bez sensu. Gramy spokojnie i precyzyjnie, a efekty przyjd\u0105 same.",
    hiddenType: "PATIENCE"
  },
  {
    id: "PB_8",
    text: "Szanujemy rywala ale gramy swoje i nie odpuszczamy. Bez kombinowania, bez g\u0142upich b\u0142\u0119d\xF3w i pe\u0142na koncentracja przez dziewi\u0119\u0107dziesi\u0105t minut.",
    hiddenType: "PROFESSIONALISM"
  },
  {
    id: "PB_9",
    text: "Spokojnie Panowie! To rutynowy mecz. Oszcz\u0119dzamy si\u0142y, gramy spokojnie bez nerw\xF3w. Oni i tak nie maj\u0105 z nami szans. Jestem pewien, \u017Ce to b\u0119dzie \u0142atwa wygrana.",
    hiddenType: "LOOSE"
  },
  {
    id: "PB_10",
    text: "Jedziemy z nimi po ca\u0142o\u015Bci. Gramy pi\u0142k\u0105 i nie odpuszczamy. Pressing, szybkie wyj\u015Bcia i du\u017Co walki.",
    hiddenType: "DOMINANCE"
  }
];

// services/PreMatchBriefingService.ts
var detectScenario = (userRep, oppRep) => {
  const gap = oppRep - userRep;
  if (gap >= 4) return "UNDERDOG";
  if (gap <= -4) return "FAVORITE";
  return "EQUAL";
};
var BRIEFING_SCENARIO_RULES = {
  UPRISING: ["UNDERDOG"],
  FORTRESS: ["UNDERDOG", "EQUAL"],
  WOUNDED_PRIDE: ["UNDERDOG", "EQUAL"],
  KAMIKAZE: ["UNDERDOG", "EQUAL"],
  TACTICIAN: ["UNDERDOG", "EQUAL", "FAVORITE"],
  BLITZ: ["UNDERDOG", "EQUAL", "FAVORITE"],
  PATIENCE: ["UNDERDOG", "EQUAL", "FAVORITE"],
  PROFESSIONALISM: ["UNDERDOG", "EQUAL", "FAVORITE"],
  LOOSE: ["FAVORITE"],
  DOMINANCE: ["EQUAL", "FAVORITE"]
};
var FRIENDLY_PREMATCH_BRIEFINGS = [
  { id: "FR_PB_1", text: "To sparing, ale nie spacer. Chc\u0119 zobaczy\u0107 odwag\u0119, zaanga\u017Cowanie i reakcj\u0119 na mocniejszego rywala.", hiddenType: "UPRISING" },
  { id: "FR_PB_2", text: "Gramy odpowiedzialnie. Najwa\u017Cniejsze s\u0105 organizacja, asekuracja i dobre nawyki bez niepotrzebnego ryzyka.", hiddenType: "FORTRESS" },
  { id: "FR_PB_3", text: "To dobry moment, \u017Ceby pokaza\u0107 charakter. Nie gramy o punkty, ale gramy o zaufanie i miejsce w zespole.", hiddenType: "WOUNDED_PRIDE" },
  { id: "FR_PB_4", text: "Chc\u0119 intensywno\u015Bci od pierwszej minuty. Sparing ma nam da\u0107 odpowied\u017A, kto jest gotowy na wi\u0119ksze obci\u0105\u017Cenia.", hiddenType: "KAMIKAZE" },
  { id: "FR_PB_5", text: "Trzymamy si\u0119 planu. Testujemy za\u0142o\u017Cenia, podejmujemy dobre decyzje i uczymy si\u0119 z ka\u017Cdej sytuacji.", hiddenType: "TACTICIAN" },
  { id: "FR_PB_6", text: "Zacznijmy wysoko i aktywnie. Chc\u0119 zobaczy\u0107 pressing, szybki odbi\xF3r i energi\u0119 po stracie pi\u0142ki.", hiddenType: "BLITZ" },
  { id: "FR_PB_7", text: "Nie forsujemy tempa bez sensu. Budujemy akcje cierpliwie, utrzymujemy rytm i dbamy o jako\u015B\u0107 poda\u0144.", hiddenType: "PATIENCE" },
  { id: "FR_PB_8", text: "Pe\u0142na koncentracja. Sparing ma by\u0107 profesjonalny: bez prostych strat, bez g\u0142upich fauli, bez chaosu.", hiddenType: "PROFESSIONALISM" },
  { id: "FR_PB_9", text: "Podejd\u017Amy do tego spokojnie. Minuty, rytm i zdrowie s\u0105 dzi\u015B r\xF3wnie wa\u017Cne jak sam wynik.", hiddenType: "LOOSE" },
  { id: "FR_PB_10", text: "Narzucamy sw\xF3j styl. Chc\u0119 widzie\u0107 pewno\u015B\u0107, tempo i zawodnik\xF3w, kt\xF3rzy bior\u0105 odpowiedzialno\u015B\u0107 za gr\u0119.", hiddenType: "DOMINANCE" }
];
var CUP_PREMATCH_BRIEFINGS = {
  CUP: [
    { id: "CUP_PB_1", text: "To jest puchar. Tu nie ma tabeli, nie ma kalkulacji. Jeden mecz mo\u017Ce zmieni\u0107 wszystko.", hiddenType: "UPRISING" },
    { id: "CUP_PB_2", text: "Gramy m\u0105drze i cierpliwie. Puchar wygrywa ten, kto najlepiej znosi presj\u0119.", hiddenType: "FORTRESS" },
    { id: "CUP_PB_3", text: "Nie patrzymy na nazw\u0119 rywala. Dzisiaj liczy si\u0119 tylko awans i nasza odpowied\u017A na boisku.", hiddenType: "WOUNDED_PRIDE" },
    { id: "CUP_PB_4", text: "Od pierwszego gwizdka chc\u0119 widzie\u0107 walk\u0119 o ka\u017Cd\u0105 pi\u0142k\u0119. W pucharze nie ma drugiej szansy.", hiddenType: "KAMIKAZE" },
    { id: "CUP_PB_5", text: "Plan jest jasny. Nie dajemy si\u0119 ponie\u015B\u0107 emocjom i cierpliwie szukamy momentu.", hiddenType: "TACTICIAN" },
    { id: "CUP_PB_6", text: "Zaczynamy agresywnie. Niech od razu poczuj\u0105, \u017Ce ten mecz b\u0119dzie dla nich ci\u0119\u017Cki.", hiddenType: "BLITZ" },
    { id: "CUP_PB_7", text: "Puchar potrafi by\u0107 nerwowy. Zachowujemy spok\xF3j, gramy dok\u0142adnie i czekamy na swoje szanse.", hiddenType: "PATIENCE" },
    { id: "CUP_PB_8", text: "Pe\u0142na koncentracja przez ca\u0142e spotkanie. Bez prostych strat, bez prezent\xF3w, bez paniki.", hiddenType: "PROFESSIONALISM" },
    { id: "CUP_PB_9", text: "Jeste\u015Bmy mocniejsi, ale puchar karze pych\u0119. Kontrola, spok\xF3j i szacunek do rywala.", hiddenType: "LOOSE" },
    { id: "CUP_PB_10", text: "Narzu\u0107my im nasze tempo. Niech od pierwszej minuty wiedz\u0105, kto chce gra\u0107 dalej.", hiddenType: "DOMINANCE" }
  ],
  CUP_SEMIFINAL: [
    { id: "SF_PB_1", text: "Jeste\u015Bmy o krok od fina\u0142u. Nikt nie odda nam tego miejsca, musimy je sobie zabra\u0107.", hiddenType: "UPRISING" },
    { id: "SF_PB_2", text: "P\xF3\u0142fina\u0142 wygrywa si\u0119 g\u0142ow\u0105. Bronimy razem, atakujemy razem i nie tracimy struktury.", hiddenType: "FORTRESS" },
    { id: "SF_PB_3", text: "Przez ca\u0142y sezon pracowali\u015Bmy, \u017Ceby by\u0107 w takim meczu. Teraz poka\u017Cmy, \u017Ce tu nale\u017Cymy.", hiddenType: "WOUNDED_PRIDE" },
    { id: "SF_PB_4", text: "To p\xF3\u0142fina\u0142. Ka\u017Cdy sprint, ka\u017Cdy w\u015Blizg i ka\u017Cda decyzja ma prowadzi\u0107 nas do fina\u0142u.", hiddenType: "KAMIKAZE" },
    { id: "SF_PB_5", text: "Wiemy, gdzie s\u0105 ich s\u0142abo\u015Bci. Trzymamy si\u0119 planu i nie pozwalamy emocjom przej\u0105\u0107 meczu.", hiddenType: "TACTICIAN" },
    { id: "SF_PB_6", text: "Uderzamy od startu. W p\xF3\u0142finale trzeba pokaza\u0107 odwag\u0119 zanim rywal z\u0142apie rytm.", hiddenType: "BLITZ" },
    { id: "SF_PB_7", text: "Fina\u0142 nie musi przyj\u015B\u0107 w pierwszych minutach. Gramy spokojnie, cierpliwie i konsekwentnie.", hiddenType: "PATIENCE" },
    { id: "SF_PB_8", text: "P\xF3\u0142fina\u0142 wymaga dojrza\u0142o\u015Bci. Zero g\u0142upich fauli, zero rozkojarzenia, pe\u0142na odpowiedzialno\u015B\u0107.", hiddenType: "PROFESSIONALISM" },
    { id: "SF_PB_9", text: "Mamy jako\u015B\u0107, \u017Ceby wej\u015B\u0107 do fina\u0142u. Nie podpalamy si\u0119, robimy swoje.", hiddenType: "LOOSE" },
    { id: "SF_PB_10", text: "To jest nasza szansa na fina\u0142. Narzucamy tempo, wygrywamy pojedynki i idziemy po swoje.", hiddenType: "DOMINANCE" }
  ],
  CUP_FINAL: [
    { id: "FINAL_PB_1", text: "To jest fina\u0142. Dzisiaj mo\u017Cecie zrobi\u0107 co\u015B, co zostanie z tym klubem na lata.", hiddenType: "UPRISING" },
    { id: "FINAL_PB_2", text: "Fina\u0142y wygrywa si\u0119 dyscyplin\u0105. Ka\u017Cdy metr boiska bronimy razem i bez paniki.", hiddenType: "FORTRESS" },
    { id: "FINAL_PB_3", text: "Niewa\u017Cne, co by\u0142o przed tym meczem. Dzisiaj macie szans\u0119 udowodni\u0107 wszystko jednym wyst\u0119pem.", hiddenType: "WOUNDED_PRIDE" },
    { id: "FINAL_PB_4", text: "Dzisiaj zostawiamy na boisku wszystko. Fina\u0142 nie wybacza p\xF3\u0142\u015Brodk\xF3w.", hiddenType: "KAMIKAZE" },
    { id: "FINAL_PB_5", text: "Trofeum wygrywa dru\u017Cyna, kt\xF3ra ufa planowi. Ch\u0142odna g\u0142owa, czyste decyzje, pe\u0142na koncentracja.", hiddenType: "TACTICIAN" },
    { id: "FINAL_PB_6", text: "Pierwsze minuty maj\u0105 nale\u017Ce\u0107 do nas. Niech od razu poczuj\u0105, \u017Ce przyszli\u015Bmy po puchar.", hiddenType: "BLITZ" },
    { id: "FINAL_PB_7", text: "Fina\u0142 mo\u017Ce trwa\u0107 d\u0142ugo. Nie szarpiemy, nie panikujemy, cierpliwie budujemy przewag\u0119.", hiddenType: "PATIENCE" },
    { id: "FINAL_PB_8", text: "To mecz o trofeum. Ka\u017Cda decyzja ma by\u0107 odpowiedzialna, ka\u017Cda strata naprawiona natychmiast.", hiddenType: "PROFESSIONALISM" },
    { id: "FINAL_PB_9", text: "Jeste\u015Bmy gotowi na ten fina\u0142. Spokojnie, z klas\u0105, bez lekcewa\u017Cenia rywala.", hiddenType: "LOOSE" },
    { id: "FINAL_PB_10", text: "Dzisiaj nie tylko gramy fina\u0142. Dzisiaj mamy go wygra\u0107. Odwa\u017Cnie, wysoko, bez cofania si\u0119.", hiddenType: "DOMINANCE" }
  ]
};
var LEAGUE_STAKES_PREMATCH_BRIEFINGS = {
  LAST_ROUND_GENERAL: [
    { id: "LG_LAST_PB_1", text: "To ostatni mecz sezonu. Zamykamy go z godno\u015Bci\u0105, koncentracj\u0105 i pe\u0142nym profesjonalizmem.", hiddenType: "PROFESSIONALISM" },
    { id: "LG_LAST_PB_2", text: "Niewa\u017Cne, co m\xF3wi tabela. Ostatni gwizdek sezonu ma pokaza\u0107, kim jeste\u015Bmy jako dru\u017Cyna.", hiddenType: "WOUNDED_PRIDE" },
    { id: "LG_LAST_PB_3", text: "Nie szarpiemy si\u0119 bez sensu. Gramy dojrzale, cierpliwie i ko\u0144czymy sezon dobr\u0105 pi\u0142k\u0105.", hiddenType: "PATIENCE" },
    { id: "LG_LAST_PB_4", text: "Ostatnia kolejka cz\u0119sto zostaje w pami\u0119ci. Dajcie kibicom pow\xF3d, \u017Ceby bili wam brawo.", hiddenType: "DOMINANCE" }
  ],
  TITLE_OR_PROMOTION_SECURED: [
    { id: "LG_DONE_PB_1", text: "Cel jest ju\u017C osi\u0105gni\u0119ty, ale mistrzowie i dru\u017Cyny awansuj\u0105ce nie odpuszczaj\u0105 standard\xF3w.", hiddenType: "PROFESSIONALISM" },
    { id: "LG_DONE_PB_2", text: "Mo\u017Cemy czu\u0107 dum\u0119, ale nie samozadowolenie. Wyjd\u017Acie i poka\u017Ccie, dlaczego jeste\u015Bmy na szczycie.", hiddenType: "DOMINANCE" },
    { id: "LG_DONE_PB_3", text: "Bez g\u0142upiego ryzyka. Gramy spokojnie, z klas\u0105 i szacunkiem do pracy wykonanej przez ca\u0142y sezon.", hiddenType: "PATIENCE" },
    { id: "LG_DONE_PB_4", text: "To ma by\u0107 \u015Bwi\u0119to, ale \u015Bwi\u0119to z pi\u0142k\u0105 przy nodze i kontrol\u0105 nad meczem.", hiddenType: "TACTICIAN" }
  ],
  TITLE_DECIDER: [
    { id: "LG_TITLE_PB_1", text: "Dzisiaj mo\u017Cemy zosta\u0107 mistrzami. Nie czekamy na cudze wyniki. Bierzemy to na boisku.", hiddenType: "DOMINANCE" },
    { id: "LG_TITLE_PB_2", text: "Mistrzostwo wygrywa si\u0119 g\u0142ow\u0105. Ka\u017Cde podanie, ka\u017Cdy odbi\xF3r, ka\u017Cda decyzja ma znaczenie.", hiddenType: "TACTICIAN" },
    { id: "LG_TITLE_PB_3", text: "Remis mo\u017Ce wystarczy\u0107, ale nie wychodzimy po remis. Wychodzimy po pewno\u015B\u0107 i kontrol\u0119.", hiddenType: "PROFESSIONALISM" },
    { id: "LG_TITLE_PB_4", text: "Przez ca\u0142y sezon pracowali\u015Bcie na t\u0119 chwil\u0119. Teraz nie wolno zrobi\u0107 kroku w ty\u0142.", hiddenType: "KAMIKAZE" }
  ],
  DIRECT_PROMOTION_DECIDER: [
    { id: "LG_PROMO_PB_1", text: "Dzisiejszy mecz mo\u017Ce da\u0107 nam awans. Nie odk\u0142adamy marze\u0144 na p\xF3\u017Aniej, za\u0142atwiamy to teraz.", hiddenType: "DOMINANCE" },
    { id: "LG_PROMO_PB_2", text: "Awans wymaga ch\u0142odnej g\u0142owy. Niech presja pracuje dla nas, nie przeciwko nam.", hiddenType: "TACTICIAN" },
    { id: "LG_PROMO_PB_3", text: "Ka\u017Cdy z was wie, ile kosztowa\u0142 ten sezon. Jeszcze dziewi\u0119\u0107dziesi\u0105t minut pe\u0142nej odpowiedzialno\u015Bci.", hiddenType: "PROFESSIONALISM" },
    { id: "LG_PROMO_PB_4", text: "Nie patrzcie na tabel\u0119. Patrzcie na pi\u0142k\u0119, na rywala i na przestrze\u0144, kt\xF3r\u0105 mamy wykorzysta\u0107.", hiddenType: "PATIENCE" }
  ],
  PLAYOFF_PLACE_DECIDER: [
    { id: "LG_PLAYOFF_PB_1", text: "To mecz o bara\u017Ce. Jedno spotkanie mo\u017Ce przed\u0142u\u017Cy\u0107 nasze marzenia o awansie.", hiddenType: "WOUNDED_PRIDE" },
    { id: "LG_PLAYOFF_PB_2", text: "Nie ma kalkulowania. Musimy by\u0107 odwa\u017Cni, ale m\u0105drzy. Bara\u017Ce trzeba sobie wyrwa\u0107.", hiddenType: "KAMIKAZE" },
    { id: "LG_PLAYOFF_PB_3", text: "Taki mecz wygrywa dru\u017Cyna, kt\xF3ra nie traci struktury pod presj\u0105. Trzymamy plan.", hiddenType: "TACTICIAN" },
    { id: "LG_PLAYOFF_PB_4", text: "Od pierwszej minuty niech wiedz\u0105, \u017Ce walczymy o co\u015B wi\u0119kszego ni\u017C trzy punkty.", hiddenType: "BLITZ" }
  ],
  RELEGATION_DECIDER: [
    { id: "LG_STAY_PB_1", text: "To jest walka o utrzymanie. Nie gramy pi\u0119knie dla ocen, gramy o \u017Cycie tego klubu w lidze.", hiddenType: "KAMIKAZE" },
    { id: "LG_STAY_PB_2", text: "Presja jest ogromna, ale panika nic nam nie da. Dyscyplina, asekuracja i walka do ko\u0144ca.", hiddenType: "FORTRESS" },
    { id: "LG_STAY_PB_3", text: "Ka\u017Cdy metr boiska ma znaczenie. Je\u015Bli trzeba cierpie\u0107, cierpimy razem.", hiddenType: "WOUNDED_PRIDE" },
    { id: "LG_STAY_PB_4", text: "Nie pozw\xF3lcie, \u017Ceby strach prowadzi\u0142 ten mecz. Prowadzi\u0107 ma plan i charakter.", hiddenType: "TACTICIAN" }
  ],
  EUROPE_PLACE_DECIDER: [
    { id: "LG_EUROPE_PB_1", text: "Dzisiaj gramy o miejsce, kt\xF3re mo\u017Ce otworzy\u0107 klubowi Europ\u0119. To jest konkretna stawka.", hiddenType: "DOMINANCE" },
    { id: "LG_EUROPE_PB_2", text: "Puchary zdobywa si\u0119 dojrza\u0142o\u015Bci\u0105. Bez chaosu, bez prezent\xF3w, z pe\u0142n\u0105 koncentracj\u0105.", hiddenType: "PROFESSIONALISM" },
    { id: "LG_EUROPE_PB_3", text: "To jest mecz dla zawodnik\xF3w, kt\xF3rzy chc\u0105 gra\u0107 na wi\u0119kszej scenie. Poka\u017Ccie t\u0119 ambicj\u0119.", hiddenType: "WOUNDED_PRIDE" },
    { id: "LG_EUROPE_PB_4", text: "Narzu\u0107my tempo od pocz\u0105tku. Niech rywal poczuje, \u017Ce to my chcemy Europy bardziej.", hiddenType: "BLITZ" }
  ],
  ALREADY_RELEGATED: [
    { id: "LG_DOWN_PB_1", text: "Spadek jest przes\u0105dzony, ale herb nadal jest na koszulce. Ostatnie mecze poka\u017C\u0105 nasz charakter.", hiddenType: "WOUNDED_PRIDE" },
    { id: "LG_DOWN_PB_2", text: "Nie odzyskamy tabeli jednym meczem, ale mo\u017Cemy odzyska\u0107 troch\u0119 dumy i zaufania kibic\xF3w.", hiddenType: "PROFESSIONALISM" },
    { id: "LG_DOWN_PB_3", text: "Gramy spokojnie, odpowiedzialnie i bez rozsypywania si\u0119. To pierwszy krok do odbudowy.", hiddenType: "PATIENCE" },
    { id: "LG_DOWN_PB_4", text: "Nie uciekamy od b\xF3lu tego sezonu. Wychodzimy i walczymy, bo klub zas\u0142uguje na reakcj\u0119.", hiddenType: "KAMIKAZE" }
  ]
};
var getBriefingPool = (matchStage) => matchStage === "FRIENDLY" ? FRIENDLY_PREMATCH_BRIEFINGS : matchStage === "LEAGUE" ? PREMATCH_BRIEFINGS : CUP_PREMATCH_BRIEFINGS[matchStage];
var getBriefingsForScenario = (scenario, matchStage = "LEAGUE", leagueMotivationContext) => (matchStage === "LEAGUE" && leagueMotivationContext ? LEAGUE_STAKES_PREMATCH_BRIEFINGS[leagueMotivationContext] : getBriefingPool(matchStage)).map((speech, originalIndex) => ({ ...speech, originalIndex })).filter((speech) => BRIEFING_SCENARIO_RULES[speech.hiddenType].includes(scenario));
var seededRng4 = (seed, offset) => {
  const s = seed + offset * 7919;
  const x = Math.sin(s) * 1e4;
  return x - Math.floor(x);
};
var REACTION_POOL = {
  POSITIVE: [
    "Szatnia ca\u0142a w emocjach. Zawodnicy wstaj\u0105, a w ich oczach wida\u0107 ogromn\u0105 determinacj\u0119",
    "Kapitan motywuje druzyn\u0119. Wszyscy s\u0142uchaj\u0105 w milczeniu.",
    "Zawodnicy wychodz\u0105 na boisko gotowi na wszystko.",
    "Determinacja na twarzach. Dru\u017Cyna jest gotowa."
  ],
  NEUTRAL: [
    "Zawodnicy kiwaj\u0105 g\u0142owami. Trudno powiedzie\u0107, czy co\u015B do nich dotar\u0142o.",
    "Kilka os\xF3b wymienia spojrzenia. Cisza.",
    "Dru\u017Cyna wygl\u0105da na skupion\u0105, ale trudno wyczu\u0107 emocje.",
    "Ka\u017Cdy zabiera si\u0119 za w\u0142asne my\u015Bli. Brak wyra\u017Anej reakcji."
  ],
  NEGATIVE: [
    "Kilku zawodnik\xF3w patrzy ze zdziwieniem. Co\u015B tu nie gra.",
    "Ta przemowa chyba nie za bardzo trafi\u0142a do nich.  Wida\u0107 lekk\u0105 konsternacj\u0119.",
    "Jeden z zawodnik\xF3w kr\u0119ci g\u0142ow\u0105. Napi\u0119cie w szatni wyra\u017Anie wzros\u0142o.",
    "W szatni zapanowa\u0142a cisza. Tak jakby kto\u015B powiedzia\u0142 troch\u0119 za du\u017Co lub za ma\u0142o."
  ],
  SURPRISE_POS: [
    "Zawodnicy krzycz\u0105, wstaj\u0105, i s\u0105 wyra\u017Anie podbudowani.",
    "To by\u0142o mocne przem\xF3wienie.",
    "Atomosfera poprawia si\u0119. To nie by\u0142a zwyyk\u0142a motywacja. To co\u015B zupe\u0142nie innego."
  ],
  SURPRISE_NEG: [
    "Zbyt wiele naraz. Wida\u0107, \u017Ce kilku zawodnik\xF3w my\u015Bli za du\u017Co i nie jest skoncentrowanych na meczu.",
    "Cisza taka, jakby kto\u015B powiedzia\u0142 co\u015B w nieodpowiednim momencie.",
    "Co\u015B posz\u0142o nie tak. Kilku zawodnik\xF3w ma nieprzeniknione miny."
  ]
};
var pickReaction = (quality, rng) => {
  const pool = REACTION_POOL[quality];
  return pool[Math.floor(rng * pool.length)];
};
var calculateBriefingEffect = (hiddenType, scenario, seed, optionIndex) => {
  const rng1 = seededRng4(seed, optionIndex + 1);
  const rng2 = seededRng4(seed, optionIndex + 2);
  const rng3 = seededRng4(seed, optionIndex + 3);
  const getEffectDef = () => {
    if (hiddenType === "UPRISING") {
      if (scenario === "UNDERDOG") return {
        actionMod: 0.04,
        goalMod: 0.03,
        momentumBonus: 18,
        expiryMinute: 35,
        fatigueMult: 1,
        rivalBoost: 0,
        label: "NICZEGO DO STRACENIA",
        quality: "POSITIVE",
        surpriseChance: 0.2,
        surpriseEffect: { actionMod: 0.08, goalMod: 0.06, momentumBonus: 28, expiryMinute: 55, fatigueMult: 1, rivalBoost: 0, label: "TRANS BOJOWY", quality: "SURPRISE_POS" }
      };
      if (scenario === "EQUAL") return {
        actionMod: 0.01,
        goalMod: 0.01,
        momentumBonus: 5,
        expiryMinute: 20,
        fatigueMult: 1,
        rivalBoost: 0,
        label: "LEKKA MOBILIZACJA",
        quality: "NEUTRAL",
        surpriseChance: 0,
        surpriseEffect: { actionMod: 0.01, goalMod: 0.01, momentumBonus: 5, expiryMinute: 20, fatigueMult: 1, rivalBoost: 0, label: "LEKKA MOBILIZACJA", quality: "NEUTRAL" }
      };
      return {
        actionMod: -0.025,
        goalMod: -0.02,
        momentumBonus: -8,
        expiryMinute: 25,
        fatigueMult: 1,
        rivalBoost: 0,
        label: "DEZORIENTACJA",
        quality: "NEGATIVE",
        surpriseChance: 0,
        surpriseEffect: { actionMod: -0.025, goalMod: -0.02, momentumBonus: -8, expiryMinute: 25, fatigueMult: 1, rivalBoost: 0, label: "DEZORIENTACJA", quality: "NEGATIVE" }
      };
    }
    if (hiddenType === "FORTRESS") {
      if (scenario === "UNDERDOG") return {
        actionMod: 0.02,
        goalMod: 0.015,
        momentumBonus: 8,
        expiryMinute: 90,
        fatigueMult: 0.97,
        rivalBoost: -0.25,
        label: "MUR DEFENSYWNY",
        quality: "POSITIVE",
        surpriseChance: 0.15,
        surpriseEffect: { actionMod: 0.02, goalMod: 0.015, momentumBonus: 8, expiryMinute: 90, fatigueMult: 0.96, rivalBoost: -0.45, label: "MUR DEFENSYWNY+", quality: "SURPRISE_POS" }
      };
      if (scenario === "EQUAL") return {
        actionMod: 0.01,
        goalMod: 5e-3,
        momentumBonus: 0,
        expiryMinute: 50,
        fatigueMult: 0.98,
        rivalBoost: 0,
        label: "OSTRO\u017BNA GRA",
        quality: "NEUTRAL",
        surpriseChance: 0,
        surpriseEffect: { actionMod: 0.01, goalMod: 5e-3, momentumBonus: 0, expiryMinute: 50, fatigueMult: 0.98, rivalBoost: 0, label: "OSTRO\u017BNA GRA", quality: "NEUTRAL" }
      };
      return {
        actionMod: -0.01,
        goalMod: 0,
        momentumBonus: -5,
        expiryMinute: 30,
        fatigueMult: 0.98,
        rivalBoost: 0,
        label: "ZBY ZACHOWAWCZE",
        quality: "NEGATIVE",
        surpriseChance: 0,
        surpriseEffect: { actionMod: -0.01, goalMod: 0, momentumBonus: -5, expiryMinute: 30, fatigueMult: 0.98, rivalBoost: 0, label: "ZBY ZACHOWAWCZE", quality: "NEGATIVE" }
      };
    }
    if (hiddenType === "WOUNDED_PRIDE") {
      if (scenario === "UNDERDOG") return {
        actionMod: 0.05,
        goalMod: 0.035,
        momentumBonus: 14,
        expiryMinute: 25,
        fatigueMult: 1,
        rivalBoost: 0,
        label: "Z\u0141O\u015A\u0106 I AMBICJA",
        quality: "POSITIVE",
        surpriseChance: 0.25,
        surpriseEffect: { actionMod: -0.02, goalMod: -0.01, momentumBonus: -12, expiryMinute: 20, fatigueMult: 1, rivalBoost: 0, label: "BACKFIRE \u2014 ZA DU\u017BO EMOCJI", quality: "SURPRISE_NEG" }
      };
      if (scenario === "EQUAL") return {
        actionMod: 0.025,
        goalMod: 0.02,
        momentumBonus: 8,
        expiryMinute: 20,
        fatigueMult: 1,
        rivalBoost: 0,
        label: "MOTYWACJA PRZEZ Z\u0141O\u015A\u0106",
        quality: "POSITIVE",
        surpriseChance: 0.15,
        surpriseEffect: { actionMod: -0.015, goalMod: 0, momentumBonus: -8, expiryMinute: 15, fatigueMult: 1, rivalBoost: 0, label: "BACKFIRE \u2014 EMOCJE", quality: "SURPRISE_NEG" }
      };
      return {
        actionMod: -0.03,
        goalMod: -0.015,
        momentumBonus: -5,
        expiryMinute: 20,
        fatigueMult: 1,
        rivalBoost: 0,
        label: "AROGANCJA",
        quality: "NEGATIVE",
        surpriseChance: 0,
        surpriseEffect: { actionMod: -0.03, goalMod: -0.015, momentumBonus: -5, expiryMinute: 20, fatigueMult: 1, rivalBoost: 0, label: "AROGANCJA", quality: "NEGATIVE" }
      };
    }
    if (hiddenType === "KAMIKAZE") {
      if (scenario === "UNDERDOG") return {
        actionMod: 0.06,
        goalMod: 0.045,
        momentumBonus: 22,
        expiryMinute: 38,
        fatigueMult: 1.1,
        rivalBoost: 0,
        label: "SERCE NA D\u0141ONI",
        quality: "POSITIVE",
        surpriseChance: 0.3,
        surpriseEffect: { actionMod: 0.06, goalMod: 0.045, momentumBonus: 22, expiryMinute: 28, fatigueMult: 1.22, rivalBoost: 0, label: "SERCE NA D\u0141ONI \u2014 WYPALENIE", quality: "SURPRISE_NEG" }
      };
      if (scenario === "EQUAL") return {
        actionMod: 0.02,
        goalMod: 0.015,
        momentumBonus: 8,
        expiryMinute: 25,
        fatigueMult: 1.05,
        rivalBoost: 0,
        label: "INTENSYWNA GRA",
        quality: "NEUTRAL",
        surpriseChance: 0.2,
        surpriseEffect: { actionMod: 0.04, goalMod: 0.03, momentumBonus: 15, expiryMinute: 30, fatigueMult: 1.08, rivalBoost: 0, label: "INTENSYWNA GRA+", quality: "SURPRISE_POS" }
      };
      return {
        actionMod: -0.01,
        goalMod: 0,
        momentumBonus: 0,
        expiryMinute: 20,
        fatigueMult: 1.05,
        rivalBoost: 0,
        label: "NIEPOTRZEBNE RYZYKO",
        quality: "NEUTRAL",
        surpriseChance: 0,
        surpriseEffect: { actionMod: -0.01, goalMod: 0, momentumBonus: 0, expiryMinute: 20, fatigueMult: 1.05, rivalBoost: 0, label: "NIEPOTRZEBNE RYZYKO", quality: "NEUTRAL" }
      };
    }
    if (hiddenType === "TACTICIAN") {
      if (scenario === "UNDERDOG") return {
        actionMod: 5e-3,
        goalMod: 5e-3,
        momentumBonus: 0,
        expiryMinute: 40,
        fatigueMult: 1,
        rivalBoost: 0,
        label: "ZIMNA G\u0141OWA",
        quality: "NEUTRAL",
        surpriseChance: 0,
        surpriseEffect: { actionMod: 5e-3, goalMod: 5e-3, momentumBonus: 0, expiryMinute: 40, fatigueMult: 1, rivalBoost: 0, label: "ZIMNA G\u0141OWA", quality: "NEUTRAL" }
      };
      if (scenario === "EQUAL") return {
        actionMod: 0.025,
        goalMod: 0.02,
        momentumBonus: 5,
        expiryMinute: 90,
        fatigueMult: 0.98,
        rivalBoost: 0,
        label: "TAKTYCZNA WY\u017BSZO\u015A\u0106",
        quality: "POSITIVE",
        surpriseChance: 0.1,
        surpriseEffect: { actionMod: 0.025, goalMod: 0.02, momentumBonus: 5, expiryMinute: 90, fatigueMult: 0.96, rivalBoost: 0, label: "TAKTYCZNA WY\u017BSZO\u015A\u0106+", quality: "SURPRISE_POS" }
      };
      return {
        actionMod: 0.02,
        goalMod: 0.015,
        momentumBonus: 5,
        expiryMinute: 90,
        fatigueMult: 0.98,
        rivalBoost: -0.1,
        label: "KONTROLA MECZU",
        quality: "POSITIVE",
        surpriseChance: 0.1,
        surpriseEffect: { actionMod: 0.02, goalMod: 0.015, momentumBonus: 5, expiryMinute: 90, fatigueMult: 0.975, rivalBoost: -0.15, label: "KONTROLA MECZU+", quality: "SURPRISE_POS" }
      };
    }
    if (hiddenType === "BLITZ") {
      if (scenario === "UNDERDOG") return {
        actionMod: 0.045,
        goalMod: 0.035,
        momentumBonus: 22,
        expiryMinute: 20,
        fatigueMult: 1,
        rivalBoost: 0,
        label: "B\u0141YSKAWICZNY START",
        quality: "POSITIVE",
        surpriseChance: 0.15,
        surpriseEffect: { actionMod: 0.045, goalMod: 0.035, momentumBonus: 22, expiryMinute: 20, fatigueMult: 1.1, rivalBoost: 0, label: "B\u0141YSKAWICZNY START \u2014 WYCZERPANIE", quality: "SURPRISE_NEG" }
      };
      if (scenario === "EQUAL") return {
        actionMod: 0.07,
        goalMod: 0.05,
        momentumBonus: 25,
        expiryMinute: 18,
        fatigueMult: 1,
        rivalBoost: 0,
        label: "UDERZENIE NA WEJ\u015ACIE",
        quality: "POSITIVE",
        surpriseChance: 0.2,
        surpriseEffect: { actionMod: 0.07, goalMod: 0.05, momentumBonus: 25, expiryMinute: 18, fatigueMult: 1.08, rivalBoost: 0, label: "UDERZENIE NA WEJ\u015ACIE \u2014 WYPALENIE", quality: "SURPRISE_NEG" }
      };
      return {
        actionMod: 0.03,
        goalMod: 0.02,
        momentumBonus: 12,
        expiryMinute: 20,
        fatigueMult: 1,
        rivalBoost: 0,
        label: "SZYBKI START",
        quality: "POSITIVE",
        surpriseChance: 0,
        surpriseEffect: { actionMod: 0.03, goalMod: 0.02, momentumBonus: 12, expiryMinute: 20, fatigueMult: 1, rivalBoost: 0, label: "SZYBKI START", quality: "POSITIVE" }
      };
    }
    if (hiddenType === "PATIENCE") {
      return {
        actionMod: 0.01,
        goalMod: 8e-3,
        momentumBonus: 0,
        expiryMinute: 90,
        fatigueMult: 0.95,
        rivalBoost: 0,
        label: "CIERPLIWO\u015A\u0106",
        quality: "NEUTRAL",
        surpriseChance: 0.05,
        surpriseEffect: { actionMod: 0, goalMod: 0, momentumBonus: -5, expiryMinute: 20, fatigueMult: 0.95, rivalBoost: 0, label: "BRAK MOBILIZACJI", quality: "SURPRISE_NEG" }
      };
    }
    if (hiddenType === "PROFESSIONALISM") {
      if (scenario === "UNDERDOG") return {
        actionMod: 5e-3,
        goalMod: 5e-3,
        momentumBonus: 0,
        expiryMinute: 50,
        fatigueMult: 1,
        rivalBoost: 0,
        label: "SPOKOJNE NASTAWIENIE",
        quality: "NEUTRAL",
        surpriseChance: 0,
        surpriseEffect: { actionMod: 5e-3, goalMod: 5e-3, momentumBonus: 0, expiryMinute: 50, fatigueMult: 1, rivalBoost: 0, label: "SPOKOJNE NASTAWIENIE", quality: "NEUTRAL" }
      };
      if (scenario === "EQUAL") return {
        actionMod: 0.015,
        goalMod: 0.01,
        momentumBonus: 3,
        expiryMinute: 70,
        fatigueMult: 1,
        rivalBoost: -0.1,
        label: "PROFESJONALIZM",
        quality: "POSITIVE",
        surpriseChance: 0,
        surpriseEffect: { actionMod: 0.015, goalMod: 0.01, momentumBonus: 3, expiryMinute: 70, fatigueMult: 1, rivalBoost: -0.1, label: "PROFESJONALIZM", quality: "POSITIVE" }
      };
      return {
        actionMod: 0.025,
        goalMod: 0.02,
        momentumBonus: 5,
        expiryMinute: 90,
        fatigueMult: 1,
        rivalBoost: -0.2,
        label: "KLASA I SPOK\xD3J",
        quality: "POSITIVE",
        surpriseChance: 0.05,
        surpriseEffect: { actionMod: 0.03, goalMod: 0.025, momentumBonus: 8, expiryMinute: 90, fatigueMult: 1, rivalBoost: -0.3, label: "KLASA I SPOK\xD3J+", quality: "SURPRISE_POS" }
      };
    }
    if (hiddenType === "LOOSE") {
      if (scenario === "UNDERDOG") return {
        actionMod: 5e-3,
        goalMod: 0,
        momentumBonus: 0,
        expiryMinute: 60,
        fatigueMult: 0.94,
        rivalBoost: 0,
        label: "OSZCZ\u0118DNO\u015A\u0106 SI\u0141",
        quality: "NEUTRAL",
        surpriseChance: 0,
        surpriseEffect: { actionMod: 5e-3, goalMod: 0, momentumBonus: 0, expiryMinute: 60, fatigueMult: 0.94, rivalBoost: 0, label: "OSZCZ\u0118DNO\u015A\u0106 SI\u0141", quality: "NEUTRAL" }
      };
      if (scenario === "EQUAL") return {
        actionMod: -0.01,
        goalMod: -5e-3,
        momentumBonus: -5,
        expiryMinute: 60,
        fatigueMult: 0.94,
        rivalBoost: 0,
        label: "ZA DU\u017BY RELAKS",
        quality: "NEUTRAL",
        surpriseChance: 0.25,
        surpriseEffect: { actionMod: -0.025, goalMod: -0.02, momentumBonus: -12, expiryMinute: 45, fatigueMult: 0.94, rivalBoost: 0.2, label: "BRAK SKUPIENIA", quality: "SURPRISE_NEG" }
      };
      const isBackfire = rng1 < 0.4;
      if (isBackfire) return {
        actionMod: -0.04,
        goalMod: -0.03,
        momentumBonus: -18,
        expiryMinute: 90,
        fatigueMult: 0.94,
        rivalBoost: 0.4,
        label: "ZLEKCEWA\u017BENIE RYWALA",
        quality: "SURPRISE_NEG",
        surpriseChance: 0,
        surpriseEffect: { actionMod: -0.04, goalMod: -0.03, momentumBonus: -18, expiryMinute: 90, fatigueMult: 0.94, rivalBoost: 0.4, label: "ZLEKCEWA\u017BENIE RYWALA", quality: "SURPRISE_NEG" }
      };
      return {
        actionMod: 0,
        goalMod: 0,
        momentumBonus: 0,
        expiryMinute: 90,
        fatigueMult: 0.9,
        rivalBoost: 0,
        label: "OSZCZ\u0118DNO\u015A\u0106 SI\u0141",
        quality: "NEUTRAL",
        surpriseChance: 0,
        surpriseEffect: { actionMod: 0, goalMod: 0, momentumBonus: 0, expiryMinute: 90, fatigueMult: 0.9, rivalBoost: 0, label: "OSZCZ\u0118DNO\u015A\u0106 SI\u0141", quality: "NEUTRAL" }
      };
    }
    if (hiddenType === "DOMINANCE") {
      if (scenario === "UNDERDOG") return {
        actionMod: -0.015,
        goalMod: -0.01,
        momentumBonus: -8,
        expiryMinute: 25,
        fatigueMult: 1,
        rivalBoost: 0,
        label: "Z\u0141A MOWA",
        quality: "NEGATIVE",
        surpriseChance: 0,
        surpriseEffect: { actionMod: -0.015, goalMod: -0.01, momentumBonus: -8, expiryMinute: 25, fatigueMult: 1, rivalBoost: 0, label: "Z\u0141A MOWA", quality: "NEGATIVE" }
      };
      if (scenario === "EQUAL") return {
        actionMod: 0.015,
        goalMod: 0.01,
        momentumBonus: 8,
        expiryMinute: 35,
        fatigueMult: 1,
        rivalBoost: 0,
        label: "DETERMINACJA",
        quality: "POSITIVE",
        surpriseChance: 0,
        surpriseEffect: { actionMod: 0.015, goalMod: 0.01, momentumBonus: 8, expiryMinute: 35, fatigueMult: 1, rivalBoost: 0, label: "DETERMINACJA", quality: "POSITIVE" }
      };
      return {
        actionMod: 0.03,
        goalMod: 0.025,
        momentumBonus: 16,
        expiryMinute: 45,
        fatigueMult: 1,
        rivalBoost: 0,
        label: "DOMINACJA",
        quality: "POSITIVE",
        surpriseChance: 0.3,
        surpriseEffect: { actionMod: 0.025, goalMod: 0.02, momentumBonus: 10, expiryMinute: 45, fatigueMult: 1.05, rivalBoost: 0.5, label: "RYWAL ZMOBILIZOWANY", quality: "SURPRISE_NEG" }
      };
    }
    return {
      actionMod: 0,
      goalMod: 0,
      momentumBonus: 0,
      expiryMinute: 0,
      fatigueMult: 1,
      rivalBoost: 0,
      label: "BRAK EFEKTU",
      quality: "NEUTRAL",
      surpriseChance: 0,
      surpriseEffect: { actionMod: 0, goalMod: 0, momentumBonus: 0, expiryMinute: 0, fatigueMult: 1, rivalBoost: 0, label: "BRAK EFEKTU", quality: "NEUTRAL" }
    };
  };
  const def = getEffectDef();
  const isSurprise = def.surpriseChance > 0 && rng2 < def.surpriseChance;
  const chosen = isSurprise ? def.surpriseEffect : def;
  return {
    actionMod: chosen.actionMod,
    goalMod: chosen.goalMod,
    momentumBonus: chosen.momentumBonus,
    expiryMinute: chosen.expiryMinute,
    fatigueMult: chosen.fatigueMult,
    rivalBoost: chosen.rivalBoost,
    label: chosen.label,
    reactionText: pickReaction(chosen.quality, rng3),
    wasSurprise: isSurprise
  };
};
var getSilenceEffect = () => ({
  actionMod: 0,
  goalMod: 0,
  momentumBonus: 0,
  expiryMinute: 0,
  fatigueMult: 1,
  rivalBoost: 0,
  label: "MILCZENIE",
  reactionText: "Szatnia w ciszy. Ka\u017Cdy przygotowuje si\u0119 sam.",
  wasSurprise: false
});
var calculateAiCoachBriefingEffect = (ownRep, opponentRep, coachAttributes, seed, matchStage = "LEAGUE", leagueMotivationContext) => {
  const motivation = coachAttributes?.motivation ?? 50;
  const decisionMaking = coachAttributes?.decisionMaking ?? 50;
  const experience = coachAttributes?.experience ?? 50;
  const realScenario = detectScenario(ownRep, opponentRep);
  const rngContext = seededRng4(seed, 701);
  const rngType = seededRng4(seed, 702);
  const rngNoise = seededRng4(seed, 703);
  const readChance = Math.min(
    0.92,
    Math.max(
      0.3,
      0.35 + decisionMaking / 100 * 0.28 + experience / 100 * 0.22 + motivation / 100 * 0.12
    )
  );
  const scenarios = ["UNDERDOG", "EQUAL", "FAVORITE"];
  const selectedScenario = rngContext < readChance ? realScenario : scenarios[Math.floor(rngContext * scenarios.length)];
  const options = getBriefingsForScenario(selectedScenario, matchStage, leagueMotivationContext);
  if (options.length === 0) return getSilenceEffect();
  const pressureBias = (motivation - 50) / 50;
  const controlBias = ((decisionMaking + experience) / 2 - 50) / 50;
  const preferredTypes = realScenario === "UNDERDOG" ? pressureBias > 0.25 ? ["UPRISING", "WOUNDED_PRIDE", "KAMIKAZE"] : ["FORTRESS", "TACTICIAN", "PATIENCE"] : realScenario === "FAVORITE" ? controlBias > 0.15 ? ["PROFESSIONALISM", "TACTICIAN", "DOMINANCE"] : ["LOOSE", "DOMINANCE", "BLITZ"] : pressureBias > 0.2 ? ["BLITZ", "DOMINANCE", "WOUNDED_PRIDE"] : ["TACTICIAN", "PROFESSIONALISM", "PATIENCE"];
  const preferred = options.filter((option) => preferredTypes.includes(option.hiddenType));
  const pool = preferred.length > 0 && rngType < readChance ? preferred : options;
  const chosen = pool[Math.floor(rngType * pool.length)];
  const effectSeed = seed + Math.round((motivation + decisionMaking + experience) * 13) + Math.floor(rngNoise * 1e3);
  return calculateBriefingEffect(chosen.hiddenType, realScenario, effectSeed, chosen.originalIndex);
};

// tests/LeagueMatchBalanceSim.ts
var clampNumber = (v, min, max) => Math.min(max, Math.max(min, v));
var seededRng5 = (seed, minute, offset = 0) => {
  const s = seed + minute + offset;
  const x = Math.sin(s) * 1e4;
  return x - Math.floor(x);
};
var mulberry32 = (a) => () => {
  a |= 0;
  a = a + 1831565813 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
var ATTR_KEYS = [
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
var makePlayer = (id, pos, rng, opts) => {
  const base = opts.quality ?? 64;
  const attributes = {};
  for (const key of ATTR_KEYS) {
    attributes[key] = Math.round(clampNumber(base + (rng() - 0.5) * 14, 42, 84));
  }
  attributes.goalkeeping = pos === "GK" /* GK */ ? Math.round(clampNumber(base + 6 + (rng() - 0.5) * 8, 50, 84)) : Math.round(20 + rng() * 15);
  if (pos === "DEF" /* DEF */) {
    attributes.defending = Math.round(clampNumber(base + 7 + (rng() - 0.5) * 8, 48, 86));
    attributes.positioning = Math.round(clampNumber(base + 4 + (rng() - 0.5) * 8, 48, 86));
    attributes.heading = Math.round(clampNumber(base + 4 + (rng() - 0.5) * 8, 48, 86));
  }
  if (pos === "MID" /* MID */) {
    attributes.passing = Math.round(clampNumber(base + 6 + (rng() - 0.5) * 8, 48, 86));
    attributes.vision = Math.round(clampNumber(base + 4 + (rng() - 0.5) * 8, 48, 86));
    attributes.technique = Math.round(clampNumber(base + 4 + (rng() - 0.5) * 8, 48, 86));
  }
  if (pos === "FWD" /* FWD */) {
    attributes.finishing = Math.round(clampNumber(base + 7 + (rng() - 0.5) * 8, 48, 86));
    attributes.attacking = Math.round(clampNumber(base + 6 + (rng() - 0.5) * 8, 48, 86));
    attributes.pace = Math.round(clampNumber(base + 4 + (rng() - 0.5) * 8, 48, 86));
  }
  const coreByPos = {
    GK: ["goalkeeping", "positioning", "strength"],
    DEF: ["defending", "positioning", "heading", "strength"],
    MID: ["passing", "vision", "technique", "stamina"],
    FWD: ["finishing", "attacking", "pace", "technique"]
  };
  const core = coreByPos[pos];
  const overall = Math.round(core.reduce((s, k) => s + attributes[k], 0) / core.length);
  return {
    id,
    firstName: "Sim",
    lastName: id,
    position: pos,
    age: 25,
    overallRating: overall,
    attributes,
    condition: 100,
    morale: opts.morale ?? 50,
    form: opts.form ?? 50,
    fatigueDebt: 0,
    health: { status: "HEALTHY" },
    stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 10, minutesPlayed: 900, seasonalChanges: {}, ratingHistory: [6.5, 6.5, 6.5, 6.5, 6.5] }
  };
};
var SQUAD_SHAPE = [
  ["GK" /* GK */, 2],
  ["DEF" /* DEF */, 5],
  ["MID" /* MID */, 5],
  ["FWD" /* FWD */, 4]
];
var makeSquad = (prefix, seed, opts) => {
  const rng = mulberry32(seed);
  const players = [];
  let n = 0;
  for (const [pos, count] of SQUAD_SHAPE) {
    for (let i = 0; i < count; i++) {
      players.push(makePlayer(`${prefix}_${pos}_${i}`, pos, rng, opts));
      n++;
    }
  }
  return players;
};
var mirrorSquad = (squad, prefix, opts) => squad.map((p) => ({
  ...p,
  id: p.id.replace(/^[^_]+/, prefix),
  lastName: p.id.replace(/^[^_]+/, prefix),
  morale: opts.morale ?? 50,
  form: opts.form ?? 50,
  attributes: { ...p.attributes },
  stats: { ...p.stats, ratingHistory: [...p.stats.ratingHistory] }
}));
var buildLineup = (players, tacticId) => {
  const tactic = TacticRepository.getById(tacticId);
  const pools = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const p of players) pools[p.position].push(p);
  for (const k of Object.keys(pools)) pools[k].sort((a, b) => b.overallRating - a.overallRating);
  const used = /* @__PURE__ */ new Set();
  const startingXI = tactic.slots.map((slot) => {
    const pool = pools[slot.role] ?? [];
    const pick = pool.find((p) => !used.has(p.id)) ?? players.filter((p) => !used.has(p.id) && p.position !== "GK" /* GK */).sort((a, b) => b.overallRating - a.overallRating)[0];
    if (!pick) return null;
    used.add(pick.id);
    return pick.id;
  });
  const bench = players.filter((p) => !used.has(p.id)).map((p) => p.id);
  return { tacticId, startingXI, bench };
};
var makeClub = (id, name, reputation) => ({
  id,
  name,
  shortName: name,
  reputation,
  morale: 50,
  stats: { points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, form: ["R", "R", "R", "R", "R"] },
  captainId: null,
  coachId: null,
  freeKickTakerId: null,
  leagueId: "L1"
});
var makeCoach = (id, dm, exp, mot) => ({
  id,
  firstName: "Coach",
  lastName: id,
  attributes: { decisionMaking: dm, experience: exp, motivation: mot, tactical: 60, training: 60, manManagement: 60 }
});
var getQualityGapCurve = (gap) => {
  const absGap = Math.abs(gap);
  if (absGap <= 2) return 0;
  const normalized = Math.min(1, (absGap - 2) / 18);
  return Math.sign(gap) * Math.pow(normalized, 1.35);
};
var getEffectiveXIStrength = (playersList, lineup) => {
  const tactic = TacticRepository.getById(lineup.tacticId);
  const activeRoleOveralls = lineup.startingXI.map((id, idx) => {
    if (!id) return null;
    const player = playersList.find((p) => p.id === id);
    const role = tactic.slots[idx]?.role ?? player?.position;
    return player && role ? PlayerPositionFitService.getEffectiveRoleOverall(player, role, true) : null;
  }).filter((v) => v !== null);
  if (activeRoleOveralls.length === 0) return 62;
  const avgOverall = activeRoleOveralls.reduce((s, o) => s + o, 0) / activeRoleOveralls.length;
  const structureFactor = Math.min(1, activeRoleOveralls.length / 11);
  return avgOverall * structureFactor;
};
var getMidfieldControl = (playersList, xi) => {
  const ids = xi.filter((id) => id !== null);
  const midfielders = playersList.filter((p) => ids.includes(p.id) && p.position === "MID" /* MID */);
  if (midfielders.length === 0) return 60;
  return midfielders.reduce((acc, p) => acc + (p.attributes.technique + p.attributes.passing) / 2, 0) / midfielders.length;
};
var _fatiguePenalty = (avgFat) => {
  if (avgFat >= 94) return 0;
  const depth = (94 - avgFat) / 94;
  return -(Math.pow(depth, 1.25) * 0.42);
};
var getLiveInstructionFatigueMultiplier = (minute, tempo, intensity, pressing, subsUsed, startingXI, fatigueMap) => {
  const ids = startingXI.filter((id) => id !== null);
  if (ids.length === 0) return 1;
  const avgFatigue = ids.reduce((s, id) => s + (fatigueMap[id] ?? 100), 0) / ids.length;
  const tiredShare = ids.filter((id) => (fatigueMap[id] ?? 100) < 82).length / ids.length;
  const exhaustedShare = ids.filter((id) => (fatigueMap[id] ?? 100) < 70).length / ids.length;
  const exertionRaw = (tempo === "FAST" ? 1 : tempo === "SLOW" ? -0.35 : 0) + (intensity === "AGGRESSIVE" ? 0.75 : intensity === "CAUTIOUS" ? -0.3 : 0) + (pressing === "PRESSING" ? 0.6 : 0);
  const exertionFactor = clampNumber(exertionRaw / 2.35, 0, 1);
  if (exertionFactor <= 0) return 1;
  const lateFactor = minute < 55 ? 0 : clampNumber((minute - 55) / 35, 0, 1);
  const rotationPressure = Math.max(0, 4 - subsUsed) / 4 * lateFactor;
  const averageFatiguePressure = clampNumber((84 - avgFatigue) / 22, 0, 1);
  const individualFatiguePressure = clampNumber(tiredShare * 0.75 + exhaustedShare * 0.55, 0, 1);
  return clampNumber(
    1 + exertionFactor * (0.07 + rotationPressure * 0.26 + averageFatiguePressure * 0.18 + individualFatiguePressure * 0.22),
    1,
    1.85
  );
};
var NEUTRAL_INSTR = {
  tempo: "NORMAL",
  mindset: "NEUTRAL",
  intensity: "NORMAL",
  passing: "MIXED",
  pressing: "NORMAL",
  counterAttack: "NORMAL"
};
var simulateMatch = (sc, matchIdx) => {
  const currentSeed = 1e5 + matchIdx * 7919;
  const userSide = matchIdx % 2 === 0 ? "HOME" : "AWAY";
  const userOpts = { quality: sc.userQuality ?? 64, form: sc.userForm ?? 50, morale: sc.userMorale ?? 50 };
  const aiOpts = { quality: sc.aiQuality ?? 64, form: sc.aiForm ?? 50, morale: sc.aiMorale ?? 50 };
  const userSquad = makeSquad("U", 555 + matchIdx * 17, userOpts);
  const aiSquad = sc.mirror ? mirrorSquad(userSquad, "A", aiOpts) : makeSquad("A", 999 + matchIdx * 17, aiOpts);
  const homePlayers = userSide === "HOME" ? userSquad : aiSquad;
  const awayPlayers = userSide === "HOME" ? aiSquad : userSquad;
  const userTacticId = sc.userTactic ?? "4-4-2";
  const aiTacticId = sc.aiTactic ?? "4-4-2";
  const homeLineup = buildLineup(homePlayers, userSide === "HOME" ? userTacticId : aiTacticId);
  const awayLineup = buildLineup(awayPlayers, userSide === "HOME" ? aiTacticId : userTacticId);
  const homeClub = makeClub("H", "Home SC", 60);
  const awayClub = makeClub("A", "Away SC", 60);
  const userCoach = makeCoach("UC", 60, 60, 55);
  const aiCoach = makeCoach("AC", sc.aiCoachDM ?? 62, sc.aiCoachEXP ?? 62, 55);
  const ctx = {
    fixture: { id: `SIM_${matchIdx}`, date: /* @__PURE__ */ new Date("2026-04-04"), leagueId: "L1" },
    homeClub,
    awayClub,
    homePlayers,
    awayPlayers,
    homeCoach: userSide === "HOME" ? userCoach : aiCoach,
    awayCoach: userSide === "HOME" ? aiCoach : userCoach,
    homeAdvantage: true,
    competition: "LEAGUE"
  };
  const matchDateStr = "2026-04-04";
  const matchSeed = new Date(matchDateStr).getTime() / 1e5;
  const homeFormImpact = applyFocusToFormImpact(analyzeClubFormImpact(homeClub.stats.form, ctx.homeCoach), homeClub, matchDateStr, matchSeed);
  const awayFormImpact = applyFocusToFormImpact(analyzeClubFormImpact(awayClub.stats.form, ctx.awayCoach), awayClub, matchDateStr, matchSeed + 1);
  let userBriefing = getSilenceEffect();
  if (sc.userBriefingType) {
    const type = sc.userBriefingType === "RANDOM" ? ["UPRISING", "FORTRESS", "WOUNDED_PRIDE", "KAMIKAZE", "TACTICIAN", "BLITZ", "PATIENCE", "PROFESSIONALISM", "DOMINANCE"][matchIdx % 9] : sc.userBriefingType;
    userBriefing = calculateBriefingEffect(type, "EQUAL", currentSeed, 3);
  }
  const aiBriefing = sc.aiBriefing ? calculateAiCoachBriefingEffect(60, 60, aiCoach.attributes, currentSeed + 7, "LEAGUE") : getSilenceEffect();
  const uInstr = {
    ...NEUTRAL_INSTR,
    ...sc.userInstr ?? {},
    tempoResponseFactor: 1,
    mindsetResponseFactor: 1,
    intensityResponseFactor: 1,
    passingResponseFactor: 1,
    pressingResponseFactor: 1,
    counterAttackResponseFactor: 1
  };
  if (uInstr.tempo !== "NORMAL") uInstr.tempoResponseFactor = parseFloat((0.6 + seededRng5(currentSeed, 0, 21) * 0.8).toFixed(2));
  if (uInstr.mindset !== "NEUTRAL") uInstr.mindsetResponseFactor = parseFloat((0.6 + seededRng5(currentSeed, 0, 22) * 0.8).toFixed(2));
  if (uInstr.intensity !== "NORMAL") uInstr.intensityResponseFactor = parseFloat((0.6 + seededRng5(currentSeed, 0, 23) * 0.8).toFixed(2));
  if (uInstr.passing !== "MIXED") uInstr.passingResponseFactor = parseFloat((0.6 + seededRng5(currentSeed, 0, 24) * 0.8).toFixed(2));
  if (uInstr.pressing === "PRESSING") uInstr.pressingResponseFactor = parseFloat((0.6 + seededRng5(currentSeed, 0, 25) * 0.8).toFixed(2));
  let aiActiveShout = null;
  if (sc.aiBrain !== false) {
    const preMatchInstr = AiCoachTacticsService.decidePreMatchInstructions(
      userSide === "HOME" ? awayClub : homeClub,
      aiCoach,
      aiSquad,
      userSide === "HOME" ? homeClub : awayClub,
      userSquad,
      userTacticId,
      currentSeed
    );
    aiActiveShout = { id: "pre_match", ...preMatchInstr, expiryMinute: 999 };
  }
  let aiNextInstructionMinute = 10 + Math.floor(seededRng5(currentSeed, 0, 77) * 11);
  let aiExploitUntilMinute = -1;
  let homeScore = 0, awayScore = 0;
  let momentum = 0, momentumSum = 0, momentumTicks = 0;
  const homeFatigue = {};
  const awayFatigue = {};
  homePlayers.forEach((p) => {
    homeFatigue[p.id] = p.condition;
  });
  awayPlayers.forEach((p) => {
    awayFatigue[p.id] = p.condition;
  });
  const liveStats = {
    home: { shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, offsides: 0 },
    away: { shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, offsides: 0 }
  };
  let subsCountHome = 0, subsCountAway = 0;
  let activeTacticalBoost = 0, tacticalBoostExpiry = -1, lastGoalBoostMinute = -1;
  let nextHomeLineup = { ...homeLineup, startingXI: [...homeLineup.startingXI], bench: [...homeLineup.bench] };
  let nextAwayLineup = { ...awayLineup, startingXI: [...awayLineup.startingXI], bench: [...awayLineup.bench] };
  const firstZeroShotCheckMinute = 34 + Math.floor(seededRng5(currentSeed, 0, 641) * 12);
  const secondZeroShotCheckMinute = 61 + Math.floor(seededRng5(currentSeed, 0, 642) * 30);
  const satietyRoll = seededRng5(currentSeed, 0, 999);
  const SUB_MINUTES = [58, 68, 78];
  for (let nextMinute = 1; nextMinute <= 90; nextMinute++) {
    const localHomeFatigue = homeFatigue;
    const localAwayFatigue = awayFatigue;
    const rngEvent = seededRng5(currentSeed, nextMinute, 500);
    const _getAvgFatigue = (lineup, map) => {
      const ids = lineup.filter((id) => id !== null);
      if (ids.length === 0) return 100;
      return ids.reduce((a, id) => a + (map[id] ?? 100), 0) / ids.length;
    };
    const avgFatigueHome = _getAvgFatigue(nextHomeLineup.startingXI, localHomeFatigue);
    const avgFatigueAway = _getAvgFatigue(nextAwayLineup.startingXI, localAwayFatigue);
    const _rotationPenalty = (lineup, map, ownSubs, oppSubs) => {
      if (nextMinute < 60 || ownSubs >= 2) return 0;
      const ids = lineup.filter((id) => id !== null);
      if (ids.length === 0) return 0;
      const tiredShare = ids.filter((id) => (map[id] ?? 100) < 84).length / ids.length;
      const lateFactor = Math.min(1, (nextMinute - 60) / 30);
      const rotationGap = Math.max(0, oppSubs - ownSubs);
      const pressure = (2 - ownSubs) * 0.012 + tiredShare * 0.052 + rotationGap * 0.01;
      return -Math.min(0.085, pressure * lateFactor);
    };
    const homeFatPenalty = _fatiguePenalty(avgFatigueHome) + _rotationPenalty(nextHomeLineup.startingXI, localHomeFatigue, subsCountHome, subsCountAway);
    const awayFatPenalty = _fatiguePenalty(avgFatigueAway) + _rotationPenalty(nextAwayLineup.startingXI, localAwayFatigue, subsCountAway, subsCountHome);
    const playerFormImpact = TeamFormImpactService.calculateMatchImpact(homePlayers, awayPlayers, nextHomeLineup, nextAwayLineup);
    const getFormStackingMultiplier = (side) => {
      const sideMomentum = side === "HOME" ? momentum : -momentum;
      if (sideMomentum <= 10) return 1;
      return 1 - Math.min(0.45, (sideMomentum - 10) / 90 * 0.45);
    };
    const homeFormStacking = getFormStackingMultiplier("HOME");
    const awayFormStacking = getFormStackingMultiplier("AWAY");
    const homeScoreDiff = homeScore - awayScore;
    const userScoreDiff = userSide === "HOME" ? homeScoreDiff : -homeScoreDiff;
    const homeMidfieldControl = getMidfieldControl(homePlayers, nextHomeLineup.startingXI);
    const awayMidfieldControl = getMidfieldControl(awayPlayers, nextAwayLineup.startingXI);
    const midfieldControlDiff = homeMidfieldControl - awayMidfieldControl;
    const midfieldInitiativeMod = Math.abs(midfieldControlDiff) <= 2 ? 0 : Math.max(-0.026, Math.min(0.026, midfieldControlDiff * 14e-4));
    const homeAvgOverallLive = getEffectiveXIStrength(homePlayers, nextHomeLineup);
    const awayAvgOverallLive = getEffectiveXIStrength(awayPlayers, nextAwayLineup);
    const homeQualityGapLive = homeAvgOverallLive - awayAvgOverallLive;
    const qualityInitiativeMod = getQualityGapCurve(homeQualityGapLive) * 0.055;
    const shotGapLive = liveStats.home.shots - liveStats.away.shots;
    const shotDominanceInitiativeMod = nextMinute < 25 || Math.abs(shotGapLive) < 8 ? 0 : -Math.sign(shotGapLive) * Math.min(0.055, (Math.abs(shotGapLive) - 7) * 6e-3) * (Math.sign(shotGapLive) === Math.sign(homeQualityGapLive) && Math.abs(homeQualityGapLive) > 8 ? 0.45 : 1);
    const fatInitiativeMod = (homeFatPenalty - awayFatPenalty) * 3;
    const formInitiativeMod = homeFormImpact.initiativeModifier * homeFormStacking - awayFormImpact.initiativeModifier * awayFormStacking;
    const playerFormInitiativeMod = clampNumber(
      (playerFormImpact.homeGoalChanceMultiplier - playerFormImpact.awayGoalChanceMultiplier) * 0.055,
      -0.06,
      0.06
    );
    const homeAttackChance = Math.min(0.72, Math.max(
      0.28,
      0.5 + momentum / 280 + fatInitiativeMod + formInitiativeMod + playerFormInitiativeMod + midfieldInitiativeMod + qualityInitiativeMod + shotDominanceInitiativeMod
    ));
    let activeSide = seededRng5(currentSeed, nextMinute, 600) < homeAttackChance ? "HOME" : "AWAY";
    const isZeroShotCheckMinute = nextMinute === firstZeroShotCheckMinute || nextMinute === secondZeroShotCheckMinute;
    const shouldRescue = (side) => {
      const sideStats = side === "HOME" ? liveStats.home : liveStats.away;
      if (!isZeroShotCheckMinute || sideStats.shots > 0) return false;
      const sideAttackChance = side === "HOME" ? homeAttackChance : 1 - homeAttackChance;
      const sideQualityGap = side === "HOME" ? homeQualityGapLive : -homeQualityGapLive;
      if (sideAttackChance < 0.3 || sideQualityGap < -16) return false;
      const lateCheck = nextMinute === secondZeroShotCheckMinute;
      if (sideQualityGap >= -8 && sideAttackChance >= 0.34) return true;
      return lateCheck && sideQualityGap >= -11 && sideAttackChance >= 0.35;
    };
    let forceZeroShotChance = false;
    const homeRescue = shouldRescue("HOME");
    const awayRescue = shouldRescue("AWAY");
    if (homeRescue || awayRescue) {
      activeSide = homeRescue && awayRescue ? activeSide : homeRescue ? "HOME" : "AWAY";
      forceZeroShotChance = true;
    }
    const userCounterTactic = TacticRepository.getById(userSide === "HOME" ? nextHomeLineup.tacticId : nextAwayLineup.tacticId);
    const opponentCounterTactic = TacticRepository.getById(userSide === "HOME" ? nextAwayLineup.tacticId : nextHomeLineup.tacticId);
    const opponentPressure = userSide === "HOME" ? Math.max(0, -momentum) : Math.max(0, momentum);
    const userPressure = userSide === "HOME" ? Math.max(0, momentum) : Math.max(0, -momentum);
    const counterAttackEnabled = uInstr.counterAttack === "COUNTER";
    const counterShape = uInstr.mindset === "DEFENSIVE" || userCounterTactic.defenseBias >= 62 || userCounterTactic.attackBias <= 45;
    const opponentPushes = opponentPressure >= 35 || opponentCounterTactic.attackBias >= 62 || userScoreDiff > 0;
    let counterAttackTriggered = false, counterAttackShotBonus = 0;
    const uPlayersList = userSide === "HOME" ? homePlayers : awayPlayers;
    const uXIList = userSide === "HOME" ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
    const oPlayersList = userSide === "HOME" ? awayPlayers : homePlayers;
    const oXIList = userSide === "HOME" ? nextAwayLineup.startingXI : nextHomeLineup.startingXI;
    if (activeSide !== userSide && counterAttackEnabled && counterShape && opponentPushes) {
      const pressureFactor = clampNumber((opponentPressure - 25) / 75, 0, 1);
      const shapeFactor = clampNumber((userCounterTactic.defenseBias - 50) / 40, 0, 1);
      const opponentRiskFactor = clampNumber((opponentCounterTactic.attackBias - 50) / 45, 0, 1);
      const scoreFactor = userScoreDiff > 0 ? 0.03 : 0;
      const rf = uInstr.counterAttackResponseFactor ?? 1;
      const counterChance = clampNumber((0.023 + pressureFactor * 0.054 + shapeFactor * 0.022 + opponentRiskFactor * 0.022 + scoreFactor) * rf, 0, 0.14);
      if (seededRng5(currentSeed, nextMinute, 631) < counterChance) {
        activeSide = userSide;
        counterAttackTriggered = true;
        const q = LiveMatchInstructionBalanceService.getCounterAttackModifier(uPlayersList, uXIList, oPlayersList, oXIList);
        counterAttackShotBonus = clampNumber(0.011 + pressureFactor * 9e-3 + opponentRiskFactor * 5e-3 + q, 6e-3, 0.028);
      }
    }
    let aiCounterAttackTriggered = false, aiCounterAttackShotBonus = 0;
    const aiSideForCounter = userSide === "HOME" ? "AWAY" : "HOME";
    const aiCounterAttackEnabled = aiActiveShout?.counterAttack === "COUNTER";
    const aiCounterShoutMinute = aiActiveShout?.id?.startsWith("ai_") ? parseInt(aiActiveShout.id.replace("ai_", "")) : 0;
    const aiCounterResponseFactor = aiCounterAttackEnabled ? parseFloat((0.6 + seededRng5(currentSeed, aiCounterShoutMinute, 806) * 0.8).toFixed(2)) : 1;
    const aiCounterTacticObj = TacticRepository.getById(userSide === "HOME" ? nextAwayLineup.tacticId : nextHomeLineup.tacticId);
    const aiScoreDiffForCounter = -userScoreDiff;
    const aiCounterShape = aiCounterTacticObj.defenseBias >= 55 || aiActiveShout?.mindset === "DEFENSIVE" || aiScoreDiffForCounter > 0;
    const userPushes = uInstr.mindset === "OFFENSIVE" || userCounterTactic.attackBias >= 60 || userScoreDiff < 0;
    if (!counterAttackTriggered && activeSide === userSide && aiCounterAttackEnabled && aiCounterShape && userPushes) {
      const userPressFactor = clampNumber((userPressure - 25) / 75, 0, 1);
      const aiShapeFactor = clampNumber((aiCounterTacticObj.defenseBias - 50) / 40, 0, 1);
      const userRiskFactor = clampNumber((userCounterTactic.attackBias - 50) / 45, 0, 1);
      const aiScoreFactor = aiScoreDiffForCounter > 0 ? 0.03 : 0;
      const aiCounterChance = clampNumber((0.023 + userPressFactor * 0.054 + aiShapeFactor * 0.022 + userRiskFactor * 0.022 + aiScoreFactor) * aiCounterResponseFactor, 0, 0.14);
      if (seededRng5(currentSeed, nextMinute, 641) < aiCounterChance) {
        activeSide = aiSideForCounter;
        aiCounterAttackTriggered = true;
        const q = LiveMatchInstructionBalanceService.getCounterAttackModifier(oPlayersList, oXIList, uPlayersList, uXIList);
        aiCounterAttackShotBonus = clampNumber(0.011 + userPressFactor * 9e-3 + userRiskFactor * 5e-3 + q, 6e-3, 0.028);
      }
    }
    let shotThreshold = 0.11;
    const goalDiffAbs = Math.abs(homeScore - awayScore);
    const leads = activeSide === "HOME" && homeScore > awayScore || activeSide === "AWAY" && awayScore > homeScore;
    if (leads && goalDiffAbs >= 3) {
      const satietyWeight = 0.3 + satietyRoll * 0.3;
      shotThreshold /= 1 + (goalDiffAbs - 1) * satietyWeight;
    }
    const defendingLineup2 = activeSide === "HOME" ? nextAwayLineup : nextHomeLineup;
    const defendingTactic2 = TacticRepository.getById(defendingLineup2.tacticId);
    const defBiasPenalty = defendingTactic2.defenseBias / 100 * 0.045;
    const attackingTeamPlayers2 = activeSide === "HOME" ? homePlayers : awayPlayers;
    const attackingXI2 = (activeSide === "HOME" ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).filter((id) => id !== null);
    const topStriker = attackingTeamPlayers2.filter((p) => attackingXI2.includes(p.id) && p.position === "FWD" /* FWD */).sort((a, b) => b.attributes.finishing - a.attributes.finishing)[0];
    const strikerBonus = topStriker ? Math.max(0, (topStriker.attributes.finishing * PlayerMoraleService.getMatchMultiplier(topStriker) - 55) / (77 - 55)) * 0.012 : 0;
    let moraleTeamPenalty = 0;
    attackingXI2.forEach((id) => {
      const player = attackingTeamPlayers2.find((p) => p.id === id);
      if (!player) return;
      const morale = player.morale ?? 50;
      const baseDebuff = morale <= 19 ? 0.097 : morale <= 39 ? 0.062 : 0;
      if (baseDebuff === 0) return;
      const mentalityResistance = (player.attributes.mentality ?? 50) / 100;
      moraleTeamPenalty += baseDebuff * (1 - mentalityResistance * 0.6) * (1 + (Math.random() * 0.1 - 0.05));
    });
    const moraleDebuffMultiplier = Math.max(0.15, 1 - moraleTeamPenalty);
    const activeFormImpact = activeSide === "HOME" ? homeFormImpact : awayFormImpact;
    const defendingFormImpact = activeSide === "HOME" ? awayFormImpact : homeFormImpact;
    const activePlayerFormImpact = activeSide === "HOME" ? playerFormImpact.home : playerFormImpact.away;
    const defendingPlayerFormImpact = activeSide === "HOME" ? playerFormImpact.away : playerFormImpact.home;
    const activePlayerFormChanceMultiplier = activeSide === "HOME" ? playerFormImpact.homeGoalChanceMultiplier : playerFormImpact.awayGoalChanceMultiplier;
    const activeFormStacking = activeSide === "HOME" ? homeFormStacking : awayFormStacking;
    const defendingFormStacking = activeSide === "HOME" ? awayFormStacking : homeFormStacking;
    const activeFatPenalty = activeSide === "HOME" ? homeFatPenalty : awayFatPenalty;
    const activeAvgFatigue = activeSide === "HOME" ? avgFatigueHome : avgFatigueAway;
    const defendingAvgFatigue = activeSide === "HOME" ? avgFatigueAway : avgFatigueHome;
    const relativeFreshnessShotSwing = clampNumber((activeAvgFatigue - defendingAvgFatigue) / 100 * 0.18, -0.026, 0.026);
    const attackingTacticObj = TacticRepository.getById(activeSide === "HOME" ? nextHomeLineup.tacticId : nextAwayLineup.tacticId);
    const defendingTacticObj = defendingTactic2;
    const attackingFatigueMap = activeSide === "HOME" ? localHomeFatigue : localAwayFatigue;
    const defendingFatigueMap = activeSide === "HOME" ? localAwayFatigue : localHomeFatigue;
    const attackingXIIds = attackingXI2;
    const defendingXIIds = (activeSide === "HOME" ? nextAwayLineup.startingXI : nextHomeLineup.startingXI).filter((id) => id !== null);
    const tiredAttackers = attackingXIIds.filter((id) => (attackingFatigueMap[id] ?? 100) < 82).length;
    const exhaustedAttackers = attackingXIIds.filter((id) => (attackingFatigueMap[id] ?? 100) < 70).length;
    const tiredDefenders = defendingXIIds.filter((id) => (defendingFatigueMap[id] ?? 100) < 82).length;
    const exhaustedDefenders = defendingXIIds.filter((id) => (defendingFatigueMap[id] ?? 100) < 70).length;
    const freshDefenders = defendingXIIds.filter((id) => (defendingFatigueMap[id] ?? 100) > 82).length;
    const criticalFatPenalty = Math.min(0.06, tiredAttackers * 6e-3 + exhaustedAttackers * 0.01);
    const freshDefBonus = tiredAttackers >= 2 ? Math.min(0.04, freshDefenders * 6e-3) : 0;
    const attackingSubsUsed = activeSide === "HOME" ? subsCountHome : subsCountAway;
    const defendingSubsUsed = activeSide === "HOME" ? subsCountAway : subsCountHome;
    const noRotationShotPenalty = nextMinute >= 60 && attackingSubsUsed <= 1 ? Math.min(0.035, (2 - attackingSubsUsed) * 6e-3 + tiredAttackers * 4e-3 + exhaustedAttackers * 7e-3) * Math.min(1, (nextMinute - 60) / 30) : 0;
    const rotationMismatchAttackBonus = nextMinute >= 60 && attackingSubsUsed >= 3 && defendingSubsUsed <= 1 ? Math.min(0.024, 6e-3 + Math.max(0, attackingSubsUsed - defendingSubsUsed - 1) * 3e-3 + tiredDefenders * 3e-3 + exhaustedDefenders * 5e-3) * Math.min(1, (nextMinute - 60) / 30) : 0;
    const lateFatigueShotDrag = nextMinute >= 60 ? Math.min(0.052, noRotationShotPenalty * 0.75 + criticalFatPenalty * 0.35) : 0;
    const fatiguedShotFloor = Math.max(0.055, 0.1 - noRotationShotPenalty - criticalFatPenalty * 0.25);
    shotThreshold = Math.max(
      fatiguedShotFloor,
      shotThreshold - defBiasPenalty + strikerBonus + activeFatPenalty + relativeFreshnessShotSwing + activeFormImpact.shotModifier * activeFormStacking - defendingFormImpact.shotResistanceModifier * defendingFormStacking + rotationMismatchAttackBonus - criticalFatPenalty - freshDefBonus - noRotationShotPenalty
    );
    shotThreshold = Math.max(fatiguedShotFloor, shotThreshold * moraleDebuffMultiplier);
    const attackingAvgRating = activeSide === "HOME" ? homeAvgOverallLive : awayAvgOverallLive;
    const defendingAvgRating = activeSide === "HOME" ? awayAvgOverallLive : homeAvgOverallLive;
    const ratingGap = attackingAvgRating - defendingAvgRating;
    shotThreshold += Math.max(-0.014, Math.min(0.02, getQualityGapCurve(ratingGap) * 0.02));
    const activeShotsSoFar = activeSide === "HOME" ? liveStats.home.shots : liveStats.away.shots;
    const defendingShotsSoFar = activeSide === "HOME" ? liveStats.away.shots : liveStats.home.shots;
    const activeShotGap = activeShotsSoFar - defendingShotsSoFar;
    const shotVolumeDrag = nextMinute < 25 || activeShotGap < 8 ? 0 : Math.min(0.034, (activeShotGap - 7) * 26e-4) * (ratingGap > 10 ? 0.4 : ratingGap > 6 ? 0.65 : 1);
    shotThreshold += Math.max(-0.016, Math.min(0.016, (attackingTacticObj.attackBias - 50) / 100 * 0.04));
    shotThreshold += TacticalMatchupService.evaluateShotMatchup(
      attackingTacticObj.id,
      defendingTacticObj.id,
      attackingTeamPlayers2,
      activeSide === "HOME" ? nextHomeLineup.startingXI : nextAwayLineup.startingXI,
      activeSide === "HOME" ? awayPlayers : homePlayers,
      defendingLineup2.startingXI
    ).modifier;
    const activeMidfieldControlDiff = activeSide === "HOME" ? midfieldControlDiff : -midfieldControlDiff;
    if (activeMidfieldControlDiff > 2) shotThreshold += Math.min(6e-3, activeMidfieldControlDiff * 45e-5);
    else if (activeMidfieldControlDiff < -4) shotThreshold -= Math.min(4e-3, Math.abs(activeMidfieldControlDiff) * 3e-4);
    const hasMomentumAdvantage = activeSide === "HOME" && momentum > 0 || activeSide === "AWAY" && momentum < 0;
    if (hasMomentumAdvantage) shotThreshold += Math.abs(momentum) / 100 * 0.012;
    shotThreshold += attackingTacticObj.pressingIntensity / 100 * 8e-3;
    const isUserAttacking = activeSide === userSide;
    const _getXIAvgAttr = (playersList, xi, attr) => {
      const ids = xi.filter((id) => id !== null);
      const active = playersList.filter((p) => ids.includes(p.id));
      if (active.length === 0) return 60;
      return active.reduce((acc, p) => acc + p.attributes[attr], 0) / active.length;
    };
    const uAvgTech = _getXIAvgAttr(uPlayersList, uXIList, "technique");
    const oAvgTech = _getXIAvgAttr(oPlayersList, oXIList, "technique");
    const uAvgPace = _getXIAvgAttr(uPlayersList, uXIList, "pace");
    const oAvgPace = _getXIAvgAttr(oPlayersList, oXIList, "pace");
    const oppTacticDefBias = TacticRepository.getById(userSide === "HOME" ? nextAwayLineup.tacticId : nextHomeLineup.tacticId).defenseBias;
    const aiOppTacticDefBias = TacticRepository.getById(userSide === "HOME" ? nextHomeLineup.tacticId : nextAwayLineup.tacticId).defenseBias;
    if (uInstr.tempo === "FAST") {
      const rf = uInstr.tempoResponseFactor ?? 1;
      if (isUserAttacking) shotThreshold += 0.012 * rf;
      else {
        const counterBonus = oppTacticDefBias > 60 ? 0.01 : 4e-3;
        shotThreshold += counterBonus * (uAvgTech > 62 ? 0.5 : 1) * rf;
      }
    } else if (uInstr.tempo === "SLOW") {
      const rf = uInstr.tempoResponseFactor ?? 1;
      if (isUserAttacking) shotThreshold += LiveMatchInstructionBalanceService.getSlowTempoModifier(uPlayersList, uXIList, oPlayersList, oXIList) * rf;
    }
    if (uInstr.mindset === "OFFENSIVE") {
      const rf = uInstr.mindsetResponseFactor ?? 1;
      if (isUserAttacking) shotThreshold += 0.015 * rf;
      else if (oppTacticDefBias > 65) shotThreshold += 0.012 * rf;
    } else if (uInstr.mindset === "DEFENSIVE") {
      const rf = uInstr.mindsetResponseFactor ?? 1;
      if (!isUserAttacking) shotThreshold -= LiveMatchInstructionBalanceService.getDefensiveMindsetModifier(uPlayersList, uXIList, oPlayersList, oXIList) * rf;
      else shotThreshold -= 5e-3 * rf;
    }
    const userIntensityRisk = LiveMatchInstructionBalanceService.getIntensityRiskModifiers(
      uInstr.intensity,
      uPlayersList,
      uXIList,
      uInstr.intensityResponseFactor ?? 1
    );
    if (uInstr.passing === "SHORT") {
      const rf = uInstr.passingResponseFactor ?? 1;
      const modifier = LiveMatchInstructionBalanceService.getShortPassingModifier(uPlayersList, uXIList, oPlayersList, oXIList, uInstr.tempo === "FAST") * rf;
      shotThreshold += isUserAttacking ? modifier : -modifier;
    } else if (uInstr.passing === "LONG") {
      const rf = uInstr.passingResponseFactor ?? 1;
      const modifier = LiveMatchInstructionBalanceService.getLongPassingModifier(uPlayersList, uXIList, oPlayersList, oXIList, uInstr.tempo === "FAST") * rf;
      shotThreshold += isUserAttacking ? modifier : -modifier;
    }
    if (uInstr.pressing === "PRESSING") {
      const rf = uInstr.pressingResponseFactor ?? 1;
      const modifier = LiveMatchInstructionBalanceService.getPressingModifier(uPlayersList, uXIList, oPlayersList, oXIList) * rf;
      shotThreshold += isUserAttacking ? modifier : -modifier;
    }
    shotThreshold += LiveMatchInstructionBalanceService.getCombinationModifier(
      uInstr.tempo,
      uInstr.mindset,
      uInstr.pressing,
      uInstr.counterAttack,
      isUserAttacking
    );
    if (counterAttackTriggered && isUserAttacking) shotThreshold += counterAttackShotBonus;
    if (aiCounterAttackTriggered && !isUserAttacking) shotThreshold += aiCounterAttackShotBonus;
    if (sc.aiBrain !== false && nextMinute >= aiNextInstructionMinute) {
      const aiScoreDiff = -userScoreDiff;
      const aiMomentum = userSide === "HOME" ? -momentum : momentum;
      const aiXIForDecision = oXIList;
      const aiFatMap = userSide === "HOME" ? localAwayFatigue : localHomeFatigue;
      const aiFats = aiXIForDecision.filter((id) => id !== null).map((id) => aiFatMap[id] ?? 100);
      const aiAvgFat = aiFats.length ? aiFats.reduce((a, b) => a + b, 0) / aiFats.length : 100;
      const aiLowestFat = aiFats.length ? Math.min(...aiFats) : 100;
      const userFatMap = userSide === "HOME" ? localHomeFatigue : localAwayFatigue;
      const userFats = uXIList.filter((id) => id !== null).map((id) => userFatMap[id] ?? 100);
      const userAvgFat = userFats.length ? userFats.reduce((a, b) => a + b, 0) / userFats.length : 100;
      const userLowestFat = userFats.length ? Math.min(...userFats) : 100;
      const aiSubsUsed = userSide === "HOME" ? subsCountAway : subsCountHome;
      const userSubsUsed = userSide === "HOME" ? subsCountHome : subsCountAway;
      const aiStats = userSide === "HOME" ? liveStats.away : liveStats.home;
      const userStats = userSide === "HOME" ? liveStats.home : liveStats.away;
      const decision = AiCoachTacticsService.decideInMatchInstructions(
        aiScoreDiff,
        aiMomentum,
        nextMinute,
        aiCoach.attributes.decisionMaking,
        aiCoach.attributes.experience,
        lastGoalBoostMinute,
        currentSeed,
        uInstr.mindset,
        userCounterTactic.attackBias,
        aiCounterTacticObj.defenseBias,
        {
          aiAvgFatigue: aiAvgFat,
          aiLowestFatigue: aiLowestFat,
          aiShots: aiStats.shots,
          userShots: userStats.shots,
          aiShotsOnTarget: aiStats.shotsOnTarget,
          userShotsOnTarget: userStats.shotsOnTarget,
          aiSubsRemaining: 5 - aiSubsUsed,
          userAvgFatigue: userAvgFat,
          userLowestFatigue: userLowestFat,
          userSubsRemaining: 5 - userSubsUsed,
          userSentOffCount: 0,
          userGoalkeeperCrisis: false,
          userTempo: uInstr.tempo,
          aiStakes: "MID_TABLE",
          userStakes: "MID_TABLE",
          aiRank: 10,
          userRank: 10,
          isLateSeason: false,
          rivalryMultiplier: 1,
          aiSentOffCount: 0,
          aiPaceAvg: oAvgPace,
          aiTechAvg: oAvgTech,
          userPaceAvg: uAvgPace,
          userTechAvg: uAvgTech,
          aiTacticId: aiCounterTacticObj.id,
          userTacticId: userCounterTactic.id
        }
      );
      if (aiExploitUntilMinute > 0 && nextMinute > aiExploitUntilMinute) aiExploitUntilMinute = -1;
      const shouldHoldExploit = !decision && aiExploitUntilMinute >= nextMinute && aiActiveShout?.mindset === "OFFENSIVE" && aiActiveShout?.tempo === "FAST" && aiAvgFat > 55 && aiScoreDiff > -3;
      if (decision) {
        const { exploitUntilMinute, ...decisionShout } = decision;
        aiActiveShout = { id: `ai_${nextMinute}`, ...decisionShout, expiryMinute: -1 };
        aiExploitUntilMinute = exploitUntilMinute ?? -1;
      } else if (!shouldHoldExploit) {
        aiActiveShout = null;
        aiExploitUntilMinute = -1;
      }
      const coachReadiness = (aiCoach.attributes.decisionMaking + aiCoach.attributes.experience) / 2;
      const baseDelay = nextMinute >= 46 && nextMinute <= 75 ? Math.max(5, Math.round(12 - coachReadiness * 0.06)) : 10;
      const randomDelay = Math.floor(seededRng5(currentSeed, nextMinute, 77) * (nextMinute >= 46 && nextMinute <= 75 ? 6 : 11));
      aiNextInstructionMinute = nextMinute + baseDelay + randomDelay;
    }
    const aiShoutMinute = aiActiveShout?.id?.startsWith("ai_") ? parseInt(aiActiveShout.id.replace("ai_", "")) : 0;
    const aiTempoRf = aiActiveShout ? parseFloat(((0.6 + seededRng5(currentSeed, aiShoutMinute, 801) * 0.8) * (aiActiveShout.tempoResponseFactor ?? 1)).toFixed(2)) : 1;
    const aiMindsetRf = aiActiveShout ? parseFloat(((0.6 + seededRng5(currentSeed, aiShoutMinute, 802) * 0.8) * (aiActiveShout.mindsetResponseFactor ?? 1)).toFixed(2)) : 1;
    const aiPassingRf = aiActiveShout ? parseFloat((0.6 + seededRng5(currentSeed, aiShoutMinute, 803) * 0.8).toFixed(2)) : 1;
    const aiPressingRf = aiActiveShout ? parseFloat((0.6 + seededRng5(currentSeed, aiShoutMinute, 804) * 0.8).toFixed(2)) : 1;
    const aiIntensityRf = aiActiveShout ? parseFloat(((0.6 + seededRng5(currentSeed, aiShoutMinute, 805) * 0.8) * (aiActiveShout.intensityResponseFactor ?? 1)).toFixed(2)) : 1;
    const isAiAttacking = !isUserAttacking;
    if (aiActiveShout) {
      if (aiActiveShout.tempo === "FAST") {
        if (isAiAttacking) shotThreshold += 0.012 * aiTempoRf;
        else {
          const counterBonus = aiOppTacticDefBias > 60 ? 0.01 : 4e-3;
          shotThreshold += counterBonus * (oAvgTech > 62 ? 0.5 : 1) * aiTempoRf;
        }
      } else if (aiActiveShout.tempo === "SLOW" && isAiAttacking) {
        shotThreshold += LiveMatchInstructionBalanceService.getSlowTempoModifier(oPlayersList, oXIList, uPlayersList, uXIList) * aiTempoRf;
      }
      if (aiActiveShout.mindset === "OFFENSIVE") {
        if (isAiAttacking) shotThreshold += 0.015 * aiMindsetRf;
        else if (aiOppTacticDefBias > 65) shotThreshold += 0.012 * aiMindsetRf;
      } else if (aiActiveShout.mindset === "DEFENSIVE") {
        if (!isAiAttacking) shotThreshold -= LiveMatchInstructionBalanceService.getDefensiveMindsetModifier(oPlayersList, oXIList, uPlayersList, uXIList) * aiMindsetRf;
        else shotThreshold -= 5e-3 * aiMindsetRf;
      }
      if (aiActiveShout.pressing === "PRESSING") {
        const modifier = LiveMatchInstructionBalanceService.getPressingModifier(oPlayersList, oXIList, uPlayersList, uXIList) * aiPressingRf;
        shotThreshold += isAiAttacking ? modifier : -modifier;
      }
      shotThreshold += LiveMatchInstructionBalanceService.getCombinationModifier(
        aiActiveShout.tempo,
        aiActiveShout.mindset,
        aiActiveShout.pressing ?? "NORMAL",
        aiActiveShout.counterAttack,
        isAiAttacking
      );
      if (aiActiveShout.passing === "SHORT") {
        const modifier = LiveMatchInstructionBalanceService.getShortPassingModifier(oPlayersList, oXIList, uPlayersList, uXIList, aiActiveShout.tempo === "FAST") * aiPassingRf;
        shotThreshold += isAiAttacking ? modifier : -modifier;
      } else if (aiActiveShout.passing === "LONG") {
        const modifier = LiveMatchInstructionBalanceService.getLongPassingModifier(oPlayersList, oXIList, uPlayersList, uXIList, aiActiveShout.tempo === "FAST") * aiPassingRf;
        shotThreshold += isAiAttacking ? modifier : -modifier;
      }
    }
    const uFatigueMap = userSide === "HOME" ? localHomeFatigue : localAwayFatigue;
    const oFatigueMap = userSide === "HOME" ? localAwayFatigue : localHomeFatigue;
    const userBuildUpProfile = LiveMatchInstructionBalanceService.getBuildUpAccuracyProfile(
      uPlayersList,
      uXIList,
      oPlayersList,
      oXIList,
      uInstr.passing,
      uInstr.tempo,
      aiActiveShout?.pressing ?? "NORMAL",
      uFatigueMap
    );
    const aiBuildUpProfile = LiveMatchInstructionBalanceService.getBuildUpAccuracyProfile(
      oPlayersList,
      oXIList,
      uPlayersList,
      uXIList,
      aiActiveShout?.passing ?? "MIXED",
      aiActiveShout?.tempo ?? "NORMAL",
      uInstr.pressing,
      oFatigueMap
    );
    const activeBuildUpProfile = isUserAttacking ? userBuildUpProfile : aiBuildUpProfile;
    shotThreshold += activeBuildUpProfile.shotModifier;
    const opponentPressingNow = isUserAttacking ? aiActiveShout?.pressing === "PRESSING" : uInstr.pressing === "PRESSING";
    shotThreshold -= activeBuildUpProfile.turnoverRisk * (opponentPressingNow ? 6e-3 : 2e-3);
    const aiIntensityRisk = LiveMatchInstructionBalanceService.getIntensityRiskModifiers(
      aiActiveShout?.intensity ?? "NORMAL",
      oPlayersList,
      oXIList,
      aiIntensityRf
    );
    if (activeTacticalBoost !== 0 && nextMinute <= tacticalBoostExpiry) {
      const boostSide = activeTacticalBoost > 0 ? "HOME" : "AWAY";
      if (boostSide === activeSide) shotThreshold += Math.abs(activeTacticalBoost);
    }
    const activeBriefing = userBriefing.expiryMinute >= nextMinute ? userBriefing : null;
    const activeAiBriefing = aiBriefing.expiryMinute >= nextMinute ? aiBriefing : null;
    const briefingFinishingFitMod = activeBriefing ? Math.max(0.96, Math.min(1.05, 1 + activeBriefing.goalMod * 1.25)) : 1;
    const aiBriefingFinishingFitMod = activeAiBriefing ? Math.max(0.96, Math.min(1.05, 1 + activeAiBriefing.goalMod * 1.25)) : 1;
    const briefingFreshnessDelta = activeBriefing ? Math.max(-3, Math.min(3, (1 - activeBriefing.fatigueMult) * 45)) : 0;
    const aiBriefingFreshnessDelta = activeAiBriefing ? Math.max(-3, Math.min(3, (1 - activeAiBriefing.fatigueMult) * 45)) : 0;
    if (activeBriefing) {
      if (isUserAttacking) {
        shotThreshold += activeBriefing.actionMod * 0.12;
        shotThreshold += (1 - activeBriefing.fatigueMult) * 0.04;
      } else if (activeBriefing.rivalBoost !== 0) {
        shotThreshold += activeBriefing.rivalBoost * 0.012;
      }
    }
    if (activeAiBriefing) {
      if (isAiAttacking) {
        shotThreshold += activeAiBriefing.actionMod * 0.12;
        shotThreshold += (1 - activeAiBriefing.fatigueMult) * 0.04;
      } else if (activeAiBriefing.rivalBoost !== 0) {
        shotThreshold += activeAiBriefing.rivalBoost * 0.012;
      }
    }
    if (nextMinute === 1 && activeBriefing?.momentumBonus && isUserAttacking) shotThreshold += activeBriefing.momentumBonus / 100 * 0.014;
    if (nextMinute === 1 && activeAiBriefing?.momentumBonus && isAiAttacking) shotThreshold += activeAiBriefing.momentumBonus / 100 * 0.014;
    shotThreshold = Math.max(
      Math.max(0.05, fatiguedShotFloor - 0.01),
      Math.min(
        0.155,
        (shotThreshold - lateFatigueShotDrag - shotVolumeDrag) * clampNumber(activePlayerFormChanceMultiplier, 0.66, 1.34)
      )
    );
    const statShotGapDrag = activeShotsSoFar >= 14 ? Math.min(0.035, (activeShotsSoFar - 13) * 7e-3) : 0;
    const statPressureChance = Math.max(0.075, Math.min(
      0.205,
      0.145 + Math.max(-0.018, Math.min(0.024, getQualityGapCurve(ratingGap) * 0.022)) + Math.max(-0.014, Math.min(0.018, (attackingTacticObj.attackBias - 50) / 100 * 0.045)) + (activeMidfieldControlDiff > 0 ? Math.min(0.014, activeMidfieldControlDiff * 1e-3) : -Math.min(0.012, Math.abs(activeMidfieldControlDiff) * 9e-4)) + (hasMomentumAdvantage ? Math.abs(momentum) / 100 * 7e-3 : 0) - lateFatigueShotDrag * 0.35 - statShotGapDrag
    ));
    const statPressureLimit = Math.min(0.42, shotThreshold + statPressureChance);
    let immediateEventType;
    const activeIntensityRisk = isUserAttacking ? userIntensityRisk : aiIntensityRisk;
    const uFoulThreshold = 0.043 * activeIntensityRisk.foul;
    const activeStats = activeSide === "HOME" ? liveStats.home : liveStats.away;
    if (!forceZeroShotChance && rngEvent < uFoulThreshold) {
      activeStats.fouls++;
      immediateEventType = "FOUL" /* FOUL */;
    } else if (forceZeroShotChance || rngEvent < shotThreshold) {
      const team = activeSide === "HOME" ? homePlayers : awayPlayers;
      const xi = activeSide === "HOME" ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
      const oppTeam = activeSide === "HOME" ? awayPlayers : homePlayers;
      const oppXi = activeSide === "HOME" ? nextAwayLineup.startingXI : nextHomeLineup.startingXI;
      const scorer = GoalAttributionService.pickScorer(team, xi, false, () => seededRng5(currentSeed, nextMinute, 700));
      if (scorer) {
        const assistant = GoalAttributionService.pickAssistant(team, xi, scorer.id, false, () => seededRng5(currentSeed, nextMinute, 720));
        const gk = oppTeam.find((p) => p.id === oppXi[0]);
        const defs = oppTeam.filter((p) => oppXi.slice(1, 6).includes(p.id));
        const oppFatigueMapS = activeSide === "HOME" ? localAwayFatigue : localHomeFatigue;
        const myFatigueMapS = activeSide === "HOME" ? localHomeFatigue : localAwayFatigue;
        const scorerLiveFatigue = myFatigueMapS[scorer.id] ?? 100;
        const gkLiveFatigue = gk ? oppFatigueMapS[gk.id] ?? 100 : 100;
        const attackingLineupS = activeSide === "HOME" ? nextHomeLineup : nextAwayLineup;
        const defendingLineupS = activeSide === "HOME" ? nextAwayLineup : nextHomeLineup;
        const attackingTacticS = TacticRepository.getById(attackingLineupS.tacticId);
        const defendingTacticS = TacticRepository.getById(defendingLineupS.tacticId);
        const scorerSlotIdx = attackingLineupS.startingXI.indexOf(scorer.id);
        const scorerSlotRole = scorerSlotIdx !== -1 ? attackingTacticS.slots[scorerSlotIdx].role : scorer.position;
        const penaltyFactor = PlayerPositionFitService.getPenaltyFactor(scorer, scorerSlotRole, true);
        let scorerFitMod = 1;
        if (penaltyFactor !== 0) {
          const gkMismatch = scorer.position === "GK" /* GK */ || scorerSlotRole === "GK" /* GK */;
          if (gkMismatch) scorerFitMod = 0.45;
          else {
            const baseMod = scorer.position === "DEF" /* DEF */ && scorerSlotRole === "FWD" /* FWD */ || scorer.position === "FWD" /* FWD */ && scorerSlotRole === "DEF" /* DEF */ ? 0.75 : 0.88;
            scorerFitMod = 1 - (1 - baseMod) * penaltyFactor;
          }
        }
        const gkFitMod = gk ? gk.position === "GK" /* GK */ ? 1 : 0.45 : 0.01;
        const scorerBriefingFatigue = activeSide === userSide ? clampNumber(scorerLiveFatigue + briefingFreshnessDelta, 0, 100) : clampNumber(scorerLiveFatigue + aiBriefingFreshnessDelta, 0, 100);
        const scorerBriefingFitMod = activeSide === userSide ? scorerFitMod * briefingFinishingFitMod : scorerFitMod * aiBriefingFinishingFitMod;
        const scorerCounterFitMod = counterAttackTriggered && activeSide === userSide || aiCounterAttackTriggered && activeSide !== userSide ? scorerBriefingFitMod * 1.06 : scorerBriefingFitMod;
        const scorerFormBoost = 1 + (activeFormImpact.finishingMultiplier - 1) * activeFormStacking;
        const gkFormBoost = 1 + (defendingFormImpact.goalkeepingMultiplier - 1) * defendingFormStacking;
        const playerFormFinishingBoost = clampNumber(activePlayerFormImpact.performanceMultiplier, 0.78, 1.22);
        const playerFormGoalkeepingBoost = clampNumber(defendingPlayerFormImpact.performanceMultiplier, 0.82, 1.18);
        const actionProfile = MatchActionService.evaluateOpenPlayAction({
          attackingPlayers: team,
          defendingPlayers: oppTeam,
          attackingLineup: attackingLineupS,
          defendingLineup: defendingLineupS,
          attackingTactic: attackingTacticS,
          defendingTactic: defendingTacticS,
          attackingFatigue: myFatigueMapS,
          defendingFatigue: oppFatigueMapS,
          scorer,
          assistant,
          isCounterAttack: counterAttackTriggered && activeSide === userSide || aiCounterAttackTriggered && activeSide !== userSide,
          rng: () => seededRng5(currentSeed, nextMinute, 760)
        });
        const scorerTeamFormFitMod = scorerCounterFitMod * scorerFormBoost * playerFormFinishingBoost * actionProfile.finishingFitMod;
        const gkTeamFormFitMod = gkFitMod * gkFormBoost * playerFormGoalkeepingBoost;
        const isGoal = GoalAttributionService.checkShotSuccess(
          scorer,
          gk,
          defs,
          false,
          () => seededRng5(currentSeed, nextMinute, 750),
          false,
          scorerBriefingFatigue,
          gkLiveFatigue,
          scorerTeamFormFitMod,
          gkTeamFormFitMod,
          oppFatigueMapS
        );
        if (isGoal) {
          if (activeSide === "HOME") {
            homeScore++;
            liveStats.home.shots++;
            liveStats.home.shotsOnTarget++;
          } else {
            awayScore++;
            liveStats.away.shots++;
            liveStats.away.shotsOnTarget++;
          }
          immediateEventType = "GOAL" /* GOAL */;
          const prevScoringScore = activeSide === "HOME" ? homeScore - 1 : awayScore - 1;
          const prevOppScore = activeSide === "HOME" ? awayScore : homeScore;
          if (prevScoringScore < prevOppScore) {
            const newDiff = prevOppScore - prevScoringScore - 1;
            const baseBoost = newDiff === 0 ? 0.02 : newDiff === 1 ? 0.013 : 7e-3;
            const scoringPlayers = activeSide === "HOME" ? homePlayers : awayPlayers;
            const scoringXI = (activeSide === "HOME" ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).filter((id) => id !== null);
            const avgRating = scoringXI.length > 0 ? scoringPlayers.filter((p) => scoringXI.includes(p.id)).reduce((acc, p) => acc + p.overallRating * PlayerMoraleService.getMatchMultiplier(p), 0) / scoringXI.length : 60;
            const teamFactor = 0.75 + clampNumber((avgRating - 55) / 25, 0, 1) * 0.5;
            activeTacticalBoost = (activeSide === "HOME" ? 1 : -1) * parseFloat((baseBoost * teamFactor).toFixed(4));
            tacticalBoostExpiry = nextMinute + 5 + Math.floor(seededRng5(currentSeed, nextMinute, 9901) * 11);
            lastGoalBoostMinute = nextMinute;
          }
        } else {
          const failRng = seededRng5(currentSeed, nextMinute, 780);
          let failType = "SHOT_ON_TARGET" /* SHOT_ON_TARGET */;
          if (failRng < 0.08) failType = "SHOT_POST" /* SHOT_POST */;
          else if (failRng < 0.16) failType = "SHOT_BAR" /* SHOT_BAR */;
          else if (failRng < 0.26) failType = "ONE_ON_ONE_SAVE" /* ONE_ON_ONE_SAVE */;
          else if (failRng < 0.36) failType = "ONE_ON_ONE_MISS" /* ONE_ON_ONE_MISS */;
          else if (failRng < 0.44) failType = "SAVE" /* SAVE */;
          else if (failRng < 0.54) failType = "WINGER_STOPPED" /* WINGER_STOPPED */;
          else if (failRng > 0.85) failType = "SHOT" /* SHOT */;
          if (actionProfile.dangerLabel === "big" && failType === "SHOT" /* SHOT */) failType = "ONE_ON_ONE_MISS" /* ONE_ON_ONE_MISS */;
          if (actionProfile.dangerLabel === "clear" && failType === "WINGER_STOPPED" /* WINGER_STOPPED */) failType = "SHOT_ON_TARGET" /* SHOT_ON_TARGET */;
          if (actionProfile.dangerLabel === "chaotic" && failType === "SHOT_ON_TARGET" /* SHOT_ON_TARGET */) failType = "SHOT" /* SHOT */;
          const shotAccuracyRoll = seededRng5(currentSeed, nextMinute, 790);
          const sotBoost = actionProfile.shotOnTargetBoost ?? 0;
          if (sotBoost > 0 && failType === "SHOT" /* SHOT */ && shotAccuracyRoll < sotBoost * 3) failType = "SHOT_ON_TARGET" /* SHOT_ON_TARGET */;
          else if (sotBoost < 0 && failType !== "SHOT" /* SHOT */ && shotAccuracyRoll < Math.abs(sotBoost) * 2) failType = "SHOT" /* SHOT */;
          if (activeSide === "HOME") {
            liveStats.home.shots++;
            if (failType !== "SHOT" /* SHOT */) liveStats.home.shotsOnTarget++;
          } else {
            liveStats.away.shots++;
            if (failType !== "SHOT" /* SHOT */) liveStats.away.shotsOnTarget++;
          }
          immediateEventType = failType;
        }
      }
    } else if (rngEvent < statPressureLimit) {
      const statRng = seededRng5(currentSeed, nextMinute, 910);
      const statTeam = activeSide === "HOME" ? homePlayers : awayPlayers;
      const statLineup = activeSide === "HOME" ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
      const statActiveIds = statLineup.filter((id) => id !== null);
      const statPlayerId = statActiveIds[Math.floor(seededRng5(currentSeed, nextMinute, 914) * statActiveIds.length)];
      const statPlayer = statTeam.find((p) => p.id === statPlayerId);
      const chaosShotShare = activeStats.shots < 5 ? 0.24 : activeStats.shots < 9 ? 0.16 : activeStats.shots < 13 ? 0.09 : 0.04;
      const cornerShare = 0.26 + Math.max(0, Math.min(0.05, (activeStats.shots - activeStats.corners) * 6e-3));
      const foulShare = 0.12 + Math.max(0, Math.min(0.06, (70 - attackingTacticObj.defenseBias) * 15e-4));
      if (statRng < chaosShotShare) {
        activeStats.shots++;
        const strengthEdge = Math.max(-1, Math.min(1, ratingGap / 18));
        const chaosGoalChance = Math.max(0.012, Math.min(0.064, 0.032 + strengthEdge * 0.022));
        const isChaosGoal = seededRng5(currentSeed, nextMinute, 920) < chaosGoalChance;
        const onTargetChance = 0.24 + seededRng5(currentSeed, nextMinute, 916) * 0.16 + strengthEdge * 0.04;
        const shotType = isChaosGoal || seededRng5(currentSeed, nextMinute, 918) < onTargetChance ? "SHOT_ON_TARGET" /* SHOT_ON_TARGET */ : "SHOT" /* SHOT */;
        if (shotType === "SHOT_ON_TARGET" /* SHOT_ON_TARGET */) activeStats.shotsOnTarget++;
        immediateEventType = shotType;
        if (isChaosGoal && statPlayer) {
          if (activeSide === "HOME") homeScore++;
          else awayScore++;
          immediateEventType = "GOAL" /* GOAL */;
        }
      } else if (statRng < chaosShotShare + cornerShare) {
        activeStats.corners++;
        immediateEventType = "CORNER" /* CORNER */;
      } else if (statRng < chaosShotShare + cornerShare + foulShare) {
        activeStats.fouls++;
        immediateEventType = "FOUL" /* FOUL */;
      } else {
        activeStats.offsides++;
        immediateEventType = "OFFSIDE" /* OFFSIDE */;
      }
    } else if (rngEvent < 0.32) {
      const flavorRng = seededRng5(currentSeed, nextMinute, 900);
      let type = "MIDFIELD_CONTROL" /* MIDFIELD_CONTROL */;
      if (flavorRng < 0.25) type = "CORNER" /* CORNER */;
      else if (flavorRng < 0.26) type = "MISPLACED_PASS" /* MISPLACED_PASS */;
      else if (flavorRng < 0.32) type = "BLUNDER" /* BLUNDER */;
      else if (flavorRng < 0.4) type = "PLAY_LEFT" /* PLAY_LEFT */;
      else if (flavorRng < 0.48) type = "PLAY_RIGHT" /* PLAY_RIGHT */;
      else if (flavorRng < 0.54) type = "PLAY_BACK" /* PLAY_BACK */;
      else if (flavorRng < 0.6) type = "PLAY_SIDE" /* PLAY_SIDE */;
      else if (flavorRng < 0.66) type = "STUMBLE" /* STUMBLE */;
      else if (flavorRng < 0.72) type = "OFFSIDE" /* OFFSIDE */;
      else if (flavorRng < 0.78) type = "PRESSURE" /* PRESSURE */;
      else if (flavorRng < 0.84) type = "FREE_KICK" /* FREE_KICK */;
      else if (flavorRng < 0.9) type = "FOUL_PUSH" /* FOUL_PUSH */;
      else if (flavorRng < 0.95) type = "FOUL_JERSEY" /* FOUL_JERSEY */;
      else type = "GK_LONG_THROW" /* GK_LONG_THROW */;
      immediateEventType = type;
      if (type === "CORNER" /* CORNER */) {
        activeStats.corners++;
        const cornerTakers = (activeSide === "HOME" ? homePlayers : awayPlayers).filter((p) => (activeSide === "HOME" ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).includes(p.id));
        const bestCornerAttr = cornerTakers.length > 0 ? Math.max(...cornerTakers.map((p) => p.attributes.corners)) : 50;
        const cornerShotChance = 0.1 + bestCornerAttr / 100 * 0.3;
        if (seededRng5(currentSeed, nextMinute, 3300) < cornerShotChance) {
          const cornerTeam = activeSide === "HOME" ? homePlayers : awayPlayers;
          const cornerXI = (activeSide === "HOME" ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).filter((id) => id !== null);
          const cornerOppTeam = activeSide === "HOME" ? awayPlayers : homePlayers;
          const cornerOppXI = (activeSide === "HOME" ? nextAwayLineup.startingXI : nextHomeLineup.startingXI).filter((id) => id !== null);
          const headerScorer = GoalAttributionService.pickScorer(cornerTeam, cornerXI, true, () => seededRng5(currentSeed, nextMinute, 3400));
          if (headerScorer) {
            const cornerGk = cornerOppTeam.find((p) => p.id === cornerOppXI[0]);
            const cornerDefs = cornerOppTeam.filter((p) => cornerOppXI.slice(1, 6).includes(p.id));
            const hScorerFat = (activeSide === "HOME" ? localHomeFatigue : localAwayFatigue)[headerScorer.id] ?? 100;
            const hGkFat = cornerGk ? (activeSide === "HOME" ? localAwayFatigue : localHomeFatigue)[cornerGk.id] ?? 100 : 100;
            const hGkFitMod = cornerGk ? cornerGk.position === "GK" /* GK */ ? 1 : 0.45 : 0.01;
            const cornerOppFatigue = activeSide === "HOME" ? localAwayFatigue : localHomeFatigue;
            const headerBriefingFatigue = activeSide === userSide ? clampNumber(hScorerFat + briefingFreshnessDelta, 0, 100) : clampNumber(hScorerFat + aiBriefingFreshnessDelta, 0, 100);
            const headerBriefingFitMod = activeSide === userSide ? briefingFinishingFitMod : aiBriefingFinishingFitMod;
            const headerFormBoost = 1 + (activeFormImpact.finishingMultiplier - 1) * activeFormStacking;
            const headerGkBoost = 1 + (defendingFormImpact.goalkeepingMultiplier - 1) * defendingFormStacking;
            const headerTeamFormFitMod = headerBriefingFitMod * headerFormBoost * clampNumber(activePlayerFormImpact.performanceMultiplier, 0.8, 1.2);
            const headerGkFormFitMod = hGkFitMod * headerGkBoost * clampNumber(defendingPlayerFormImpact.performanceMultiplier, 0.84, 1.16);
            const isHeaderGoal = GoalAttributionService.checkShotSuccess(
              headerScorer,
              cornerGk,
              cornerDefs,
              true,
              () => seededRng5(currentSeed, nextMinute, 3500),
              false,
              headerBriefingFatigue,
              hGkFat,
              headerTeamFormFitMod,
              headerGkFormFitMod,
              cornerOppFatigue
            );
            if (isHeaderGoal) {
              if (activeSide === "HOME") {
                homeScore++;
                liveStats.home.shots++;
                liveStats.home.shotsOnTarget++;
              } else {
                awayScore++;
                liveStats.away.shots++;
                liveStats.away.shotsOnTarget++;
              }
              immediateEventType = "GOAL" /* GOAL */;
            } else {
              if (activeSide === "HOME") liveStats.home.shots++;
              else liveStats.away.shots++;
            }
          }
        }
      }
    }
    const stateLike = {
      minute: nextMinute,
      momentum,
      homeLineup: nextHomeLineup,
      awayLineup: nextAwayLineup,
      sentOffIds: [],
      homeFatigue: localHomeFatigue,
      awayFatigue: localAwayFatigue,
      subsCountHome,
      subsCountAway
    };
    const briefingMomentumImpulse = nextMinute === 1 ? (activeBriefing?.momentumBonus ?? 0) * (userSide === "HOME" ? 1 : -1) + (activeAiBriefing?.momentumBonus ?? 0) * (userSide === "HOME" ? -1 : 1) : 0;
    const rawMomentum = MomentumService.computeMomentum(ctx, stateLike, immediateEventType, activeSide, localHomeFatigue, localAwayFatigue, void 0);
    momentum = clampNumber(rawMomentum + briefingMomentumImpulse, -100, 100);
    momentumSum += momentum;
    momentumTicks++;
    const fatigue = MatchEngineService.calculateFatigueStep({
      ...stateLike,
      momentum,
      homeLineup: nextHomeLineup,
      awayLineup: nextAwayLineup
    }, ctx, void 0);
    Object.assign(homeFatigue, fatigue.home);
    Object.assign(awayFatigue, fatigue.away);
    const uFatExtra = LiveMatchInstructionBalanceService.getInstructionFatigueExtra(
      uInstr.tempo,
      uInstr.intensity,
      uInstr.pressing,
      uInstr.tempoResponseFactor ?? 1,
      uInstr.intensityResponseFactor ?? 1,
      uInstr.pressingResponseFactor ?? 1
    );
    if (uFatExtra !== 0) {
      const uXIForFat = userSide === "HOME" ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
      const uFatTarget = userSide === "HOME" ? homeFatigue : awayFatigue;
      const uSubsUsed = userSide === "HOME" ? subsCountHome : subsCountAway;
      const mult = uFatExtra > 0 ? getLiveInstructionFatigueMultiplier(nextMinute, uInstr.tempo, uInstr.intensity, uInstr.pressing, uSubsUsed, uXIForFat, uFatTarget) : 1;
      uXIForFat.filter((id) => id !== null).forEach((id) => {
        uFatTarget[id] = clampNumber((uFatTarget[id] ?? 100) - uFatExtra * mult, 0, 100);
      });
    }
    const aiFatExtra = aiActiveShout ? LiveMatchInstructionBalanceService.getInstructionFatigueExtra(
      aiActiveShout.tempo,
      aiActiveShout.intensity,
      aiActiveShout.pressing ?? "NORMAL",
      aiTempoRf,
      aiIntensityRf,
      aiPressingRf
    ) : 0;
    if (aiFatExtra !== 0) {
      const aiXIForFat = userSide === "HOME" ? nextAwayLineup.startingXI : nextHomeLineup.startingXI;
      const aiFatTarget = userSide === "HOME" ? awayFatigue : homeFatigue;
      const aiSubsUsed = userSide === "HOME" ? subsCountAway : subsCountHome;
      const mult = aiFatExtra > 0 && aiActiveShout ? getLiveInstructionFatigueMultiplier(nextMinute, aiActiveShout.tempo, aiActiveShout.intensity, aiActiveShout.pressing ?? "NORMAL", aiSubsUsed, aiXIForFat, aiFatTarget) : 1;
      aiXIForFat.filter((id) => id !== null).forEach((id) => {
        aiFatTarget[id] = clampNumber((aiFatTarget[id] ?? 100) - aiFatExtra * mult, 0, 100);
      });
    }
    if (SUB_MINUTES.includes(nextMinute)) {
      const doSub = (lineup, players, fatMap) => {
        const starters = lineup.startingXI.map((id, idx) => ({ id, idx })).filter((s) => s.id !== null && players.find((p) => p.id === s.id)?.position !== "GK" /* GK */);
        starters.sort((a, b) => (fatMap[a.id] ?? 100) - (fatMap[b.id] ?? 100));
        const tired = starters[0];
        if (!tired) return false;
        const tiredPlayer = players.find((p) => p.id === tired.id);
        const benchPick = lineup.bench.map((id) => players.find((p) => p.id === id)).filter((p) => p && p.position === tiredPlayer.position).sort((a, b) => (fatMap[b.id] ?? 100) - (fatMap[a.id] ?? 100))[0];
        if (!benchPick) return false;
        lineup.startingXI[tired.idx] = benchPick.id;
        lineup.bench = lineup.bench.filter((id) => id !== benchPick.id);
        return true;
      };
      if (doSub(nextHomeLineup, homePlayers, homeFatigue)) subsCountHome++;
      if (doSub(nextAwayLineup, awayPlayers, awayFatigue)) subsCountAway++;
    }
  }
  const userGoals = userSide === "HOME" ? homeScore : awayScore;
  const aiGoals = userSide === "HOME" ? awayScore : homeScore;
  const userShots = userSide === "HOME" ? liveStats.home.shots : liveStats.away.shots;
  const aiShots = userSide === "HOME" ? liveStats.away.shots : liveStats.home.shots;
  const userMomentumAvg = (userSide === "HOME" ? 1 : -1) * (momentumSum / Math.max(1, momentumTicks));
  return { userGoals, aiGoals, userShots, aiShots, userMomentumAvg, userSide };
};
var MATCHES = Number(process.env.SIM_MATCHES ?? 50);
var SCENARIOS = [
  {
    id: "S0-mirror-passive",
    desc: "SANITY: lustrzane sk\u0142ady, obaj pasywni (bez briefingu, AI brain OFF) \u2014 oczekiwane ~50/50 + przewaga gospodarza",
    mirror: true,
    aiBrain: false,
    aiBriefing: false,
    userBriefingType: null
  },
  {
    id: "S1-baseline",
    desc: "Gracz PASYWNY (neutralne instrukcje, milczenie), AI pe\u0142ny m\xF3zg + briefing \u2014 r\xF3wne sk\u0142ady",
    aiBrain: true,
    aiBriefing: true,
    userBriefingType: null
  },
  {
    id: "S2-fast-offensive",
    desc: "Gracz: tylko TEMPO=FAST + NASTAWIENIE=OFFENSIVE (reszta neutralna)",
    aiBrain: true,
    aiBriefing: true,
    userBriefingType: null,
    userInstr: { tempo: "FAST", mindset: "OFFENSIVE" }
  },
  {
    id: "S3-full-meta",
    desc: "Gracz: FAST + OFFENSIVE + PRESSING + SHORT (pe\u0142ny meta-stack)",
    aiBrain: true,
    aiBriefing: true,
    userBriefingType: null,
    userInstr: { tempo: "FAST", mindset: "OFFENSIVE", pressing: "PRESSING", passing: "SHORT" }
  },
  {
    id: "S4-briefing-blitz",
    desc: "Gracz: neutralne instrukcje + briefing BLITZ (najsilniejszy w EQUAL)",
    aiBrain: true,
    aiBriefing: true,
    userBriefingType: "BLITZ"
  },
  {
    id: "S5-briefing-random",
    desc: 'Gracz: neutralne instrukcje + briefing LOSOWY ("byle co") \u2014 czy nadal daje przewag\u0119?',
    aiBrain: true,
    aiBriefing: true,
    userBriefingType: "RANDOM"
  },
  {
    id: "S6-form-gap",
    desc: "Forma/morale: gracz form 62 + morale 68 (trening/morale zarz\u0105dzane) vs AI form 44 + morale 50 (brak trainingFocus)",
    aiBrain: true,
    aiBriefing: true,
    userBriefingType: null,
    userForm: 62,
    userMorale: 68,
    aiForm: 44,
    aiMorale: 50
  },
  {
    id: "S7-all-in",
    desc: "Wszystko naraz: FAST+OFFENSIVE + briefing BLITZ + przewaga formy/morale",
    aiBrain: true,
    aiBriefing: true,
    userBriefingType: "BLITZ",
    userInstr: { tempo: "FAST", mindset: "OFFENSIVE" },
    userForm: 62,
    userMorale: 68,
    aiForm: 44,
    aiMorale: 50
  },
  {
    id: "S8-ai-stronger",
    desc: "AI SILNIEJSZE o ~4 OVR, gracz pasywny \u2014 czy silniejsza dru\u017Cyna AI wygrywa?",
    aiBrain: true,
    aiBriefing: true,
    userBriefingType: null,
    userQuality: 62,
    aiQuality: 66
  },
  {
    id: "S9-ai-stronger-vs-meta",
    desc: 'AI SILNIEJSZE o ~4 OVR vs gracz FAST+OFFENSIVE + briefing BLITZ ("czy meta bije klas\u0119?")',
    aiBrain: true,
    aiBriefing: true,
    userBriefingType: "BLITZ",
    userInstr: { tempo: "FAST", mindset: "OFFENSIVE" },
    userQuality: 62,
    aiQuality: 66
  }
];
var realLog = console.log;
var silenceLogs = () => {
  console.log = () => {
  };
};
var restoreLogs = () => {
  console.log = realLog;
};
var pct = (n, total) => `${(n / total * 100).toFixed(0)}%`;
realLog(`
\u2550\u2550\u2550 LEAGUE MATCH BALANCE SIM \u2014 ${MATCHES} mecz\xF3w na scenariusz \u2550\u2550\u2550
`);
for (const sc of SCENARIOS) {
  let w = 0, d = 0, l = 0, gf = 0, ga = 0, sf = 0, sa = 0, momSum = 0;
  silenceLogs();
  try {
    for (let i = 0; i < (sc.matches ?? MATCHES); i++) {
      const r = simulateMatch(sc, i);
      if (r.userGoals > r.aiGoals) w++;
      else if (r.userGoals === r.aiGoals) d++;
      else l++;
      gf += r.userGoals;
      ga += r.aiGoals;
      sf += r.userShots;
      sa += r.aiShots;
      momSum += r.userMomentumAvg;
    }
  } finally {
    restoreLogs();
  }
  const n = sc.matches ?? MATCHES;
  realLog(`\u2500\u2500 ${sc.id}`);
  realLog(`   ${sc.desc}`);
  realLog(`   GRACZ: ${w}W ${d}D ${l}L  (${pct(w, n)} zwyci\u0119stw, pkt/mecz ${((w * 3 + d) / n).toFixed(2)})`);
  realLog(`   Gole: ${(gf / n).toFixed(2)} : ${(ga / n).toFixed(2)}   Strza\u0142y: ${(sf / n).toFixed(1)} : ${(sa / n).toFixed(1)}   \u015Ar. momentum gracza: ${(momSum / n).toFixed(1)}
`);
}
realLog("Uwaga: pomini\u0119to symetrycznie kartki/karne/kontuzje/FK/pogod\u0119/przerw\u0119 \u2014 patrz nag\u0142\xF3wek pliku.");
