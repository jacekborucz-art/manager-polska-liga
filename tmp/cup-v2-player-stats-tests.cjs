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

// tests/CupPlayerStatsAggregatorTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);

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

// services/match/engines/cupV2/CupMath.ts
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
var average = (values, fallback = 50) => values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;
var normalizeAttribute = (value) => clamp(value, 1, 100) / 100;
var fatigueMultiplier = (fatigue) => clamp(0.62 + normalizeAttribute(fatigue) * 0.45, 0.62, 1.07);
var moraleMultiplier = (morale) => clamp(0.88 + normalizeAttribute(morale) * 0.24, 0.88, 1.12);
var weightedScore = (values, weights, fallback = 50) => {
  let weighted = 0;
  let weightSum = 0;
  Object.entries(weights).forEach(([key, rawWeight]) => {
    const weight = typeof rawWeight === "number" ? rawWeight : 0;
    const value = values[key];
    if (typeof value !== "number" || weight <= 0) return;
    weighted += value * weight;
    weightSum += weight;
  });
  return weightSum > 0 ? weighted / weightSum : fallback;
};
var sigmoidProbability = (scoreDiff, scale = 14) => 1 / (1 + Math.exp(-scoreDiff / scale));
var contestProbability = (attackScore, defenseScore, base = 0.5, scale = 18) => clamp(base + (sigmoidProbability(attackScore - defenseScore, scale) - 0.5), 0.03, 0.97);
var stableHash = (seed) => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
var seededRandom = (seed, second, salt) => {
  let value = stableHash(`${seed}:${second}:${salt}`) + 1831565813;
  value = Math.imul(value ^ value >>> 15, value | 1);
  value ^= value + Math.imul(value ^ value >>> 7, value | 61);
  return ((value ^ value >>> 14) >>> 0) / 4294967296;
};
var pickWeighted = (options, roll) => {
  const total = options.reduce((sum, option) => sum + Math.max(0, option.weight), 0);
  if (total <= 0) return options[0].item;
  let cursor = roll * total;
  for (const option of options) {
    cursor -= Math.max(0, option.weight);
    if (cursor <= 0) return option.item;
  }
  return options[options.length - 1].item;
};

// services/match/engines/cupV2/CupTeamProfileService.ts
var activePlayers = (team) => {
  const ids = new Set(team.lineup.startingXI.filter((id) => Boolean(id)));
  return team.players.filter((player) => ids.has(player.id));
};
var byPosition = (players, position) => players.filter((player) => player.position === position);
var injuryMultiplier = (player, injuries) => {
  const severity = injuries[player.id];
  if (!severity) return 1;
  if (severity === "SEVERE") {
    return player.position === "GK" /* GK */ ? 0.46 : 0.38;
  }
  return player.position === "GK" /* GK */ ? 0.74 : 0.68;
};
var attr = (players, fatigue, injuries, weights, fallback = 50) => average(players.map(
  (player) => weightedScore(player.attributes, weights, fallback) * fatigueMultiplier(fatigue[player.id] ?? player.condition) * injuryMultiplier(player, injuries)
), fallback);
var shapeFromTactic = (team) => {
  const slots = team.tactic.slots;
  const avgX = average(slots.map((slot) => slot.x), 50);
  const avgY = average(slots.map((slot) => slot.y), 50);
  const width = average(slots.map((slot) => Math.abs(slot.x - avgX)), 20);
  return {
    tacticalWidth: clamp(35 + width * 1.2, 25, 85),
    lineHeight: clamp(avgY, 25, 85)
  };
};
var individualInstructionProfile = (team, active, fatigue) => {
  const instructions = team.individualInstructions ?? {};
  const instructed = active.map((player) => ({ player, instruction: instructions[player.id] })).filter((entry) => entry.instruction);
  if (instructed.length === 0) {
    return {
      buildUp: 1,
      midfieldControl: 1,
      progression: 1,
      chanceCreation: 1,
      finishing: 1,
      defensiveShape: 1,
      pressing: 1,
      counterThreat: 1,
      disciplineRisk: 1,
      lineHeightDelta: 0
    };
  }
  const teamWeight = Math.max(1, active.length);
  const weightedAverage = (score) => instructed.reduce((sum, entry) => {
    const liveFatigue = fatigue[entry.player.id] ?? entry.player.condition ?? 75;
    const playerInfluence = clamp((entry.player.attributes.mentality ?? 50) * 0.45 + (entry.player.attributes.workRate ?? 50) * 0.25 + liveFatigue * 0.3, 25, 100) / 100;
    return sum + score(entry) * playerInfluence;
  }, 0) / teamWeight;
  const attackingTilt = weightedAverage(
    ({ instruction }) => instruction?.mindset === "OFFENSIVE" ? 1 : instruction?.mindset === "DEFENSIVE" ? -1 : 0
  );
  const tempoTilt = weightedAverage(
    ({ instruction }) => instruction?.tempo === "FAST" ? 1 : instruction?.tempo === "SLOW" ? -1 : 0
  );
  const shortPassingTilt = weightedAverage(
    ({ instruction }) => instruction?.passing === "SHORT" ? 1 : instruction?.passing === "LONG" ? -1 : 0
  );
  const directPassingTilt = weightedAverage(
    ({ instruction }) => instruction?.passing === "LONG" ? 1 : instruction?.passing === "SHORT" ? -1 : 0
  );
  const pressingTilt = weightedAverage(({ instruction }) => instruction?.pressing === "PRESSING" ? 1 : 0);
  const markingTilt = weightedAverage(
    ({ instruction }) => instruction?.marking === "MAN" ? 1 : instruction?.marking === "NONE" ? -1 : 0
  );
  return {
    buildUp: clamp(1 + shortPassingTilt * 0.055 - tempoTilt * 0.018, 0.94, 1.07),
    midfieldControl: clamp(1 + shortPassingTilt * 0.05 - directPassingTilt * 0.018, 0.94, 1.07),
    progression: clamp(1 + tempoTilt * 0.05 + directPassingTilt * 0.03 + attackingTilt * 0.025, 0.93, 1.08),
    chanceCreation: clamp(1 + attackingTilt * 0.055 + directPassingTilt * 0.02, 0.93, 1.09),
    finishing: clamp(1 + attackingTilt * 0.026 + tempoTilt * 0.014, 0.96, 1.05),
    defensiveShape: clamp(1 - attackingTilt * 0.03 + markingTilt * 0.046, 0.93, 1.08),
    pressing: clamp(1 + pressingTilt * 0.105 + tempoTilt * 0.018, 0.96, 1.12),
    counterThreat: clamp(1 + directPassingTilt * 0.06 + tempoTilt * 0.04, 0.94, 1.1),
    disciplineRisk: clamp(1 + pressingTilt * 0.075 + markingTilt * 0.055 + Math.max(0, tempoTilt) * 0.028, 0.95, 1.13),
    lineHeightDelta: clamp(pressingTilt * 3.4 + attackingTilt * 2, -2.8, 5.2)
  };
};
var CupTeamProfileService = {
  /**
   * Profil drużyny jest warstwą agregującą atrybuty zawodników, taktykę,
   * kondycję i morale. Silnik nie powinien w kolejnych fazach liczyć
   * "surowej sumy" zawodników, bo to tworzy sztuczne przewagi formacji.
   * Zamiast tego każda faza dostaje jakość danej funkcji zespołu.
   */
  buildProfile: (team, fatigue, redCards, injuries = {}) => {
    const active = activePlayers(team).filter((player) => !redCards[player.id]);
    const goalkeeper = active.find((player) => player.position === "GK" /* GK */);
    const outfield = active.filter((player) => player.position !== "GK" /* GK */);
    const defenders = byPosition(active, "DEF" /* DEF */);
    const midfielders = byPosition(active, "MID" /* MID */);
    const forwards = byPosition(active, "FWD" /* FWD */);
    const moraleMod = moraleMultiplier(team.morale * 0.52 + team.preMatchMotivation * 0.32 + team.stadiumSupport * 0.16);
    const shape = shapeFromTactic(team);
    const injuredActiveCount = active.filter((player) => injuries[player.id]).length;
    const severeActiveCount = active.filter((player) => injuries[player.id] === "SEVERE").length;
    const unfitShapePenalty = clamp(1 - injuredActiveCount * 0.018 - severeActiveCount * 0.045, 0.72, 1);
    const individual = individualInstructionProfile(team, active, fatigue);
    const buildUp = attr([...defenders, ...midfielders, goalkeeper].filter(Boolean), fatigue, injuries, {
      passing: 0.28,
      technique: 0.18,
      vision: 0.16,
      positioning: 0.12,
      mentality: 0.14,
      workRate: 0.12
    }) * moraleMod;
    const midfieldControl = attr(midfielders.length > 0 ? midfielders : outfield, fatigue, injuries, {
      passing: 0.22,
      technique: 0.2,
      vision: 0.18,
      positioning: 0.12,
      stamina: 0.1,
      workRate: 0.12,
      mentality: 0.06
    }) * moraleMod;
    const progression = attr(outfield, fatigue, injuries, {
      pace: 0.13,
      passing: 0.17,
      technique: 0.18,
      dribbling: 0.16,
      vision: 0.13,
      workRate: 0.11,
      mentality: 0.07,
      strength: 0.05
    }) * moraleMod;
    const chanceCreation = attr([...midfielders, ...forwards], fatigue, injuries, {
      vision: 0.22,
      passing: 0.18,
      technique: 0.16,
      attacking: 0.14,
      crossing: 0.12,
      dribbling: 0.1,
      mentality: 0.08
    }) * moraleMod;
    const finishing = attr(forwards.length > 0 ? forwards : outfield, fatigue, injuries, {
      finishing: 0.28,
      attacking: 0.17,
      technique: 0.15,
      positioning: 0.13,
      mentality: 0.12,
      strength: 0.06,
      pace: 0.05,
      heading: 0.04
    }) * moraleMod;
    const defensiveShape = attr([...defenders, ...midfielders], fatigue, injuries, {
      defending: 0.28,
      positioning: 0.22,
      strength: 0.12,
      pace: 0.1,
      heading: 0.08,
      workRate: 0.1,
      mentality: 0.1
    }) * moraleMod;
    const pressing = attr(outfield, fatigue, injuries, {
      workRate: 0.23,
      stamina: 0.18,
      aggression: 0.16,
      pace: 0.14,
      defending: 0.11,
      positioning: 0.09,
      mentality: 0.09
    }) * (team.instructions.pressing === "PRESSING" ? 1.1 : 0.96);
    const tacticAttackMod = clamp(1 + (team.tactic.attackBias - 50) * 35e-4, 0.86, 1.16);
    const tacticDefenseMod = clamp(1 + (team.tactic.defenseBias - 50) * 38e-4, 0.84, 1.18);
    const tacticPressMod = clamp(1 + (team.tactic.pressingIntensity - 50) * 34e-4, 0.88, 1.16);
    const tempoBuildMod = team.instructions.tempo === "FAST" ? 1.035 : team.instructions.tempo === "SLOW" ? 0.972 : 1;
    const mindsetAttackMod = team.instructions.mindset === "OFFENSIVE" ? 1.055 : team.instructions.mindset === "DEFENSIVE" ? 0.952 : 1;
    const mindsetDefenseMod = team.instructions.mindset === "DEFENSIVE" ? 1.062 : team.instructions.mindset === "OFFENSIVE" ? 0.952 : 1;
    const intensityPressMod = team.instructions.intensity === "AGGRESSIVE" ? 1.085 : team.instructions.intensity === "CAUTIOUS" ? 0.928 : 1;
    const markingDefenseMod = team.instructions.marking === "MAN" ? 1.035 : team.instructions.marking === "NONE" ? 0.925 : 1;
    const markingDisciplineMod = team.instructions.marking === "MAN" ? 1.1 : team.instructions.marking === "NONE" ? 0.88 : 1;
    const passingProgressionMod = team.instructions.passing === "SHORT" ? 1.025 : team.instructions.passing === "LONG" ? 0.985 : 1;
    return {
      side: team.side,
      activePlayers: active,
      goalkeeper,
      outfieldPlayers: outfield,
      defenders,
      midfielders,
      forwards,
      buildUp: buildUp * tempoBuildMod * passingProgressionMod * individual.buildUp,
      midfieldControl: midfieldControl * (team.instructions.passing === "SHORT" ? 1.018 : 1) * individual.midfieldControl,
      progression: progression * tacticAttackMod * tempoBuildMod * passingProgressionMod * individual.progression,
      chanceCreation: chanceCreation * tacticAttackMod * mindsetAttackMod * individual.chanceCreation,
      finishing: finishing * individual.finishing,
      crossing: attr(outfield, fatigue, injuries, { crossing: 0.34, technique: 0.18, passing: 0.16, vision: 0.12, pace: 0.1, mentality: 0.1 }) * tacticAttackMod,
      aerialThreat: attr(outfield, fatigue, injuries, { heading: 0.32, strength: 0.22, positioning: 0.18, attacking: 0.12, mentality: 0.08, pace: 0.08 }),
      defensiveShape: defensiveShape * tacticDefenseMod * mindsetDefenseMod * markingDefenseMod * unfitShapePenalty * individual.defensiveShape,
      pressing: pressing * tacticPressMod * intensityPressMod * individual.pressing,
      counterThreat: attr([...midfielders, ...forwards], fatigue, injuries, { pace: 0.2, passing: 0.18, vision: 0.17, dribbling: 0.15, technique: 0.12, attacking: 0.11, mentality: 0.07 }) * individual.counterThreat,
      setPieces: attr(active, fatigue, injuries, { freeKicks: 0.26, corners: 0.22, crossing: 0.18, heading: 0.14, technique: 0.1, mentality: 0.1 }),
      goalkeeperQuality: goalkeeper ? weightedScore(goalkeeper.attributes, { goalkeeping: 0.38, positioning: 0.2, mentality: 0.14, strength: 0.08, pace: 0.06, passing: 0.06, technique: 0.04, leadership: 0.04 }) * fatigueMultiplier(fatigue[goalkeeper.id] ?? goalkeeper.condition) * injuryMultiplier(goalkeeper, injuries) : 35,
      disciplineRisk: attr(outfield, fatigue, injuries, { aggression: 0.32, mentality: -0.12, positioning: -0.1, defending: 0.08, workRate: 0.12 }, 50) * intensityPressMod * markingDisciplineMod * individual.disciplineRisk,
      staminaReserve: attr(active, fatigue, injuries, { stamina: 0.5, workRate: 0.25, mentality: 0.15, strength: 0.1 }),
      leadership: attr(active, fatigue, injuries, { leadership: 0.55, mentality: 0.25, workRate: 0.12, stamina: 0.08 }, 50),
      mentality: attr(active, fatigue, injuries, { mentality: 0.44, leadership: 0.18, workRate: 0.16, aggression: 0.07, stamina: 0.08, positioning: 0.07 }),
      tacticalWidth: shape.tacticalWidth,
      lineHeight: clamp(shape.lineHeight + individual.lineHeightDelta, 20, 88),
      individualInstructions: team.individualInstructions
    };
  }
};

// services/match/engines/cupV2/CupMomentumService.ts
var CupMomentumService = {
  /**
   * Momentum jest efektem gry, a nie generatorem goli. Zmienia jakość decyzji,
   * odwagę i presję, ale bramka nadal wymaga akcji, sytuacji i strzału.
   */
  updateMomentum: (state, homeProfile, awayProfile, eventDelta) => {
    const homeScorePressure = state.homeScore < state.awayScore ? 4 : state.homeScore > state.awayScore ? -2 : 0;
    const awayScorePressure = state.awayScore < state.homeScore ? 4 : state.awayScore > state.homeScore ? -2 : 0;
    const midfieldTilt = (homeProfile.midfieldControl - awayProfile.midfieldControl) * 0.018;
    const leadershipDamping = ((homeProfile.leadership + awayProfile.leadership) / 2 - 50) * 4e-3;
    const pressureTilt = homeScorePressure - awayScorePressure;
    const naturalDecay = state.momentum * (0.018 + Math.max(0, leadershipDamping));
    return clamp(state.momentum + midfieldTilt + pressureTilt * 0.03 + eventDelta - naturalDecay, -100, 100);
  },
  pressureForSide: (state, sideScore, opponentScore, profile) => {
    const losingPressure = sideScore < opponentScore ? clamp((opponentScore - sideScore) * 9, 0, 30) : 0;
    const latePressure = state.second > 75 * 60 && sideScore <= opponentScore ? 10 : 0;
    const mentalityShield = (profile.mentality - 50) * 0.18 + (profile.leadership - 50) * 0.12;
    return clamp(35 + losingPressure + latePressure - mentalityShield, 0, 100);
  }
};

// services/match/engines/cupV2/CupChanceCreationService.ts
var bestShooterPool = (profile) => {
  const attackers = [...profile.forwards, ...profile.midfielders, ...profile.outfieldPlayers];
  return attackers.length > 0 ? attackers : profile.activePlayers;
};
var playerShotInstructionMultiplier = (profile, player) => {
  const instruction = profile.individualInstructions?.[player.id];
  if (!instruction) return 1;
  const mindset = instruction.mindset === "OFFENSIVE" ? 1.16 : instruction.mindset === "DEFENSIVE" ? 0.82 : 1;
  const tempo = instruction.tempo === "FAST" ? 1.07 : instruction.tempo === "SLOW" ? 0.94 : 1;
  const passing = instruction.passing === "LONG" ? 1.05 : instruction.passing === "SHORT" ? 0.96 : 1;
  return mindset * tempo * passing;
};
var playerCreatorInstructionMultiplier = (profile, player) => {
  const instruction = profile.individualInstructions?.[player.id];
  if (!instruction) return 1;
  const passing = instruction.passing === "SHORT" ? 1.14 : instruction.passing === "LONG" ? 1.06 : 1;
  const tempo = instruction.tempo === "SLOW" ? 1.07 : instruction.tempo === "FAST" ? 0.98 : 1;
  const mindset = instruction.mindset === "OFFENSIVE" ? 1.08 : instruction.mindset === "DEFENSIVE" ? 0.9 : 1;
  return passing * tempo * mindset;
};
var shotWeight = (player, profile) => {
  const positionalBonus = player.position === "FWD" /* FWD */ ? 18 : player.position === "MID" /* MID */ ? 8 : player.position === "DEF" /* DEF */ ? -6 : -30;
  return Math.max(1, weightedScore(player.attributes, {
    finishing: 0.24,
    attacking: 0.18,
    positioning: 0.16,
    technique: 0.13,
    pace: 0.08,
    heading: 0.08,
    mentality: 0.08,
    strength: 0.05
  }) + positionalBonus) * playerShotInstructionMultiplier(profile, player);
};
var creatorWeight = (player, profile) => Math.max(1, weightedScore(player.attributes, {
  passing: 0.24,
  vision: 0.22,
  technique: 0.18,
  crossing: 0.13,
  dribbling: 0.1,
  mentality: 0.08,
  workRate: 0.05
})) * playerCreatorInstructionMultiplier(profile, player);
var CupChanceCreationService = {
  /**
   * Ta warstwa zamienia udaną progresję w konkretną sytuację. Nie każda akcja
   * w ostatniej tercji kończy się strzałem: obrona może zamknąć kąt, złapać
   * spalonego, wymusić dośrodkowanie z trudnej pozycji albo zablokować podanie.
   */
  createChance: ({
    side,
    intent,
    attacking,
    defending,
    zone,
    pressure,
    scoreDiff,
    roll
  }) => {
    const creationScore = attacking.chanceCreation * 0.34 + attacking.progression * 0.2 + attacking.finishing * 0.12 + attacking.crossing * intent.widthUse * 0.1 + attacking.aerialThreat * intent.verticality * 0.08 + attacking.mentality * 0.08 + attacking.counterThreat * (intent.pattern === "COUNTER" ? 0.12 : 0.04);
    const preventionScore = defending.defensiveShape * 0.42 + defending.pressing * 0.18 + defending.goalkeeperQuality * 0.1 + defending.mentality * 0.12 + defending.staminaReserve * 0.08;
    const zoneBonus = zone === "BOX" ? 0.16 : zone === "FINAL_THIRD" ? 0.06 : -0.08;
    const pressurePenalty = pressure * 25e-4;
    const leadingChanceDampener = scoreDiff >= 5 ? 0.54 : scoreDiff >= 4 ? 0.62 : scoreDiff >= 3 ? 0.72 : scoreDiff >= 2 ? 0.86 : scoreDiff >= 1 ? 0.95 : 1;
    const trailingUrgency = scoreDiff < 0 ? clamp(1 + Math.min(3, Math.abs(scoreDiff)) * 0.025, 1, 1.075) : 1;
    const chanceProbability = clamp(
      (contestProbability(creationScore, preventionScore, 0.205, 24) + zoneBonus - pressurePenalty) * leadingChanceDampener * trailingUrgency,
      0.012,
      0.52
    );
    if (roll(31) > chanceProbability) return null;
    const shooter = pickWeighted(bestShooterPool(attacking).map((player) => ({ item: player, weight: shotWeight(player, attacking) })), roll(32));
    const creatorCandidates = attacking.outfieldPlayers.filter((player) => player.id !== shooter.id);
    const creator = creatorCandidates.length > 0 ? pickWeighted(creatorCandidates.map((player) => ({ item: player, weight: creatorWeight(player, attacking) })), roll(33)) : void 0;
    const marker = defending.defenders.length > 0 ? pickWeighted(defending.defenders.map((player) => ({ item: player, weight: Math.max(1, player.attributes.defending + player.attributes.positioning) })), roll(34)) : void 0;
    const rawXg = 0.044 + (creationScore - preventionScore) * 18e-4 + (zone === "BOX" ? 0.112 : zone === "FINAL_THIRD" ? 0.044 : 0.018) + (intent.pattern === "COUNTER" ? 0.03 : 0) + (intent.pattern === "SET_PIECE" ? 0.018 : 0) - pressure * 9e-4;
    const leadingXgDampener = scoreDiff >= 5 ? 0.76 : scoreDiff >= 4 ? 0.82 : scoreDiff >= 3 ? 0.88 : scoreDiff >= 2 ? 0.94 : 1;
    const xG = clamp(clamp(rawXg, 0.015, 0.42) * leadingXgDampener, 0.012, 0.42);
    const kind = xG >= 0.3 ? "ONE_ON_ONE" : xG >= 0.21 ? "BIG_CHANCE" : xG >= 0.11 ? "GOOD_CHANCE" : xG >= 0.06 ? "HALF_CHANCE" : "DISTANCE";
    return {
      side,
      kind,
      zone,
      pattern: intent.pattern,
      shooter,
      creator,
      marker,
      xG,
      pressure,
      angle: clamp(0.25 + roll(35) * 0.65 + (zone === "BOX" ? 0.1 : 0), 0, 1),
      distance: zone === "BOX" ? 7 + roll(36) * 10 : 16 + roll(36) * 14
    };
  }
};

// services/match/engines/cupV2/CupDisciplineResolver.ts
var selectFouler = (profile, roll) => {
  const pool = profile.activePlayers.length > 0 ? profile.activePlayers : profile.outfieldPlayers;
  if (pool.length === 0) return void 0;
  return pickWeighted(pool.map((player) => ({
    item: player,
    weight: weightedScore(player.attributes, {
      aggression: 0.24,
      defending: 0.2,
      workRate: 0.16,
      strength: 0.13,
      pace: 0.09,
      positioning: 0.08,
      mentality: 0.06,
      stamina: 0.04
    }) + (player.position === "DEF" ? 12 : player.position === "MID" ? 7 : player.position === "FWD" ? 3 : -12)
  })), roll);
};
var selectFouledPlayer = (profile, roll) => {
  const pool = profile.outfieldPlayers.length > 0 ? profile.outfieldPlayers : profile.activePlayers;
  if (pool.length === 0) return void 0;
  return pickWeighted(pool.map((player) => ({
    item: player,
    weight: weightedScore(player.attributes, {
      dribbling: 0.22,
      pace: 0.18,
      technique: 0.16,
      attacking: 0.14,
      vision: 0.1,
      strength: 0.08,
      mentality: 0.07,
      workRate: 0.05
    }) + (player.position === "FWD" ? 12 : player.position === "MID" ? 8 : player.position === "DEF" ? 2 : -18)
  })), roll);
};
var CupDisciplineResolver = {
  /**
   * Faule i kartki wynikają z kontaktu w konkretnej fazie: pressingu,
   * kontrataku, pojedynku skrzydłowego albo ratowania sytuacji. Sędzia nie
   * generuje fauli sam z siebie, tylko interpretuje kontakt według własnych cech.
   */
  resolveContact: ({
    ctx,
    defending,
    attacking,
    danger,
    salt
  }) => {
    const referee = ctx.input.environment.referee;
    const strictness = referee.strictness / 100;
    const advantage = referee.advantageTendency / 100;
    const consistencyNoise = (1 - referee.consistency / 100) * (ctx.random(salt + 1) - 0.5) * 0.08;
    const foulChance = clamp(
      0.026 + defending.disciplineRisk * 7e-4 + defending.pressing * 32e-5 + danger * 0.045 + strictness * 0.018 - advantage * 0.012 + consistencyNoise,
      4e-3,
      0.16
    );
    if (ctx.random(salt + 2) > foulChance) return null;
    const yellowChance = clamp(0.11 + strictness * 0.22 + danger * 0.25 + defending.disciplineRisk * 9e-4, 0.06, 0.62);
    const redChance = clamp(4e-3 + strictness * 0.018 + Math.max(0, danger - 0.75) * 0.07, 2e-3, 0.12);
    const type = ctx.random(salt + 3) < redChance ? "RED_CARD" /* RED_CARD */ : ctx.random(salt + 4) < yellowChance ? "YELLOW_CARD" /* YELLOW_CARD */ : "FOUL" /* FOUL */;
    const fouler = selectFouler(defending, ctx.random(salt + 5));
    const fouled = selectFouledPlayer(attacking, ctx.random(salt + 6));
    const defendingTeamName = defending.side === "HOME" ? ctx.input.home.name : ctx.input.away.name;
    const foulerName = fouler ? fouler.lastName : defendingTeamName;
    const fouledName = fouled ? fouled.lastName : "rywala";
    return {
      id: `cupv2_contact_${ctx.state.second}_${salt}`,
      second: ctx.state.second,
      minute: Math.floor(ctx.state.second / 60) + 1,
      side: defending.side,
      type,
      playerId: fouler?.id,
      secondaryPlayerId: fouled?.id,
      text: `${foulerName} przerywa akcj\u0119 faulem na ${fouledName}.`,
      detail: {
        danger,
        refereeStrictness: referee.strictness,
        refereeConsistency: referee.consistency,
        attackingSide: attacking.side,
        foulerId: fouler?.id,
        fouledPlayerId: fouled?.id
      }
    };
  }
};

// services/match/engines/cupV2/CupInjuryResolver.ts
var CupInjuryResolver = {
  /**
   * Kontuzje powinny wynikać z obciążenia meczu: zmęczenia, pressingu,
   * intensywności pojedynków, pogody i jakości murawy. Nie losujemy ich
   * równomiernie co minutę, bo wtedy nie reagują na styl gry.
   */
  maybeCreateInjury: ({
    ctx,
    profile,
    contactIntensity,
    salt
  }) => {
    const pitchRisk = (100 - ctx.input.environment.pitchQuality) * 12e-5;
    const weatherRisk = (ctx.input.environment.weather?.weatherIntensity ?? 0) * 6e-3;
    const fatigueRisk = Math.max(0, 62 - profile.staminaReserve) * 55e-5;
    const injuryChance = clamp(15e-4 + pitchRisk + weatherRisk + fatigueRisk + contactIntensity * 0.01, 5e-4, 0.035);
    if (ctx.random(salt) > injuryChance || profile.activePlayers.length === 0) return null;
    const injured = pickWeighted(profile.activePlayers.map((player) => ({
      item: player,
      weight: Math.max(1, 105 - (ctx.state.fatigue[player.id] ?? player.condition) + contactIntensity * 20)
    })), ctx.random(salt + 1));
    const severe = ctx.random(salt + 2) < clamp(0.08 + contactIntensity * 0.16 + Math.max(0, 45 - injured.attributes.strength) * 2e-3, 0.04, 0.35);
    return {
      id: `cupv2_injury_${ctx.state.second}_${injured.id}`,
      second: ctx.state.second,
      minute: Math.floor(ctx.state.second / 60) + 1,
      side: profile.side,
      type: severe ? "INJURY_SEVERE" /* INJURY_SEVERE */ : "INJURY_LIGHT" /* INJURY_LIGHT */,
      playerId: injured.id,
      text: `${injured.lastName} potrzebuje pomocy medycznej po intensywnym starciu.`,
      detail: {
        contactIntensity,
        pitchQuality: ctx.input.environment.pitchQuality,
        weatherIntensity: ctx.input.environment.weather?.weatherIntensity ?? 0
      }
    };
  }
};

// services/match/engines/cupV2/CupOwnGoalResolver.ts
var CupOwnGoalResolver = {
  /**
   * Samobój nie powinien być osobnym "losowym golem". Może powstać tylko przy
   * realnym zagrożeniu: mocnym dośrodkowaniu, chaosie po stałym fragmencie,
   * odbiciu strzału albo desperackiej interwencji obrońcy.
   */
  maybeOwnGoal: ({
    chance,
    defending,
    roll
  }) => {
    const chaos = chance.pattern === "WING_PLAY" ? 0.012 : chance.pattern === "SET_PIECE" ? 0.018 : chance.kind === "BIG_CHANCE" || chance.kind === "ONE_ON_ONE" ? 0.01 : 4e-3;
    const pressureMod = chance.pressure * 18e-5;
    const ownGoalChance = clamp(chaos + pressureMod + Math.max(0, 52 - defending.defensiveShape) * 18e-5, 2e-3, 0.045);
    if (roll(701) > ownGoalChance || defending.defenders.length === 0) return null;
    const defender = pickWeighted(defending.defenders.map((player) => ({
      item: player,
      weight: Math.max(1, 100 - weightedScore(player.attributes, {
        defending: 0.3,
        positioning: 0.25,
        mentality: 0.15,
        heading: 0.1,
        strength: 0.1,
        technique: 0.05,
        workRate: 0.05
      }))
    })), roll(702));
    return {
      eventType: "GOAL" /* GOAL */,
      goal: true,
      onTarget: true,
      corner: false,
      save: false,
      xG: chance.xG,
      momentumDelta: 16,
      assistEligible: false,
      isOwnGoal: true,
      ownGoalPlayerId: defender.id,
      text: `${defender.lastName} niefortunnie kieruje pi\u0142k\u0119 do w\u0142asnej bramki.`
    };
  }
};

// services/match/engines/cupV2/CupShotResolver.ts
var CupShotResolver = {
  /**
   * Bramka nie jest losowana bezpośrednio. Najpierw istnieje CupChance z xG,
   * potem jakość strzału, potem reakcja bramkarza i dopiero ich różnica
   * rozstrzyga: gol, obrona, niecelny, blok, słupek, poprzeczka albo róg.
   */
  resolveShot: ({
    chance,
    attacking,
    defending,
    shooterFatigue,
    keeperFatigue,
    weatherPenalty,
    scoreDiff,
    roll
  }) => {
    const shooter = chance.shooter;
    const keeper = defending.goalkeeper;
    const marker = chance.marker;
    const shooterExecution = weightedScore(shooter.attributes, {
      finishing: 0.28,
      technique: 0.18,
      mentality: 0.14,
      attacking: 0.12,
      positioning: 0.1,
      strength: 0.07,
      heading: chance.pattern === "WING_PLAY" || chance.pattern === "SET_PIECE" ? 0.08 : 0.03,
      pace: chance.kind === "ONE_ON_ONE" ? 0.08 : 0.03
    }) * clamp(0.72 + shooterFatigue / 285, 0.72, 1.07) - chance.pressure * 0.1 - weatherPenalty;
    const markerPressure = marker ? weightedScore(marker.attributes, {
      defending: 0.28,
      positioning: 0.24,
      strength: 0.14,
      pace: 0.12,
      heading: 0.08,
      aggression: 0.07,
      mentality: 0.07
    }) : defending.defensiveShape;
    const keeperScore = keeper ? weightedScore(keeper.attributes, {
      goalkeeping: 0.38,
      positioning: 0.2,
      mentality: 0.12,
      strength: 0.08,
      pace: 0.08,
      leadership: 0.05,
      technique: 0.04,
      passing: 0.05
    }) * clamp(0.72 + keeperFatigue / 285, 0.72, 1.07) : defending.goalkeeperQuality;
    const shotQuality = clamp(
      chance.xG + (shooterExecution - 50) * 22e-4 - (markerPressure - 50) * 12e-4 + (chance.angle - 0.5) * 0.035 - Math.max(0, chance.distance - 13) * 3e-3,
      5e-3,
      0.55
    );
    const finishingEdge = attacking.finishing - defending.defensiveShape;
    const executionEdge = shooterExecution - keeperScore;
    const mismatchSoftener = clamp(1 - Math.max(0, finishingEdge - 12) * 6e-3, 0.82, 1);
    const leadDampener = scoreDiff >= 5 ? 0.42 : scoreDiff >= 4 ? 0.54 : scoreDiff >= 3 ? 0.68 : scoreDiff >= 2 ? 0.82 : 1;
    const goalChanceCap = scoreDiff >= 5 ? 0.16 : scoreDiff >= 4 ? 0.2 : scoreDiff >= 3 ? 0.25 : 0.34;
    const goalChance = clamp(
      (chance.xG * 1.04 * mismatchSoftener + clamp(executionEdge * 14e-4, -0.045, 0.055) + clamp(finishingEdge * 35e-5, -0.025, 0.03)) * leadDampener - weatherPenalty * 1e-3,
      4e-3,
      goalChanceCap
    );
    const scored = roll(40) < goalChance;
    const shotTempoDampener = clamp(1 - Math.max(0, scoreDiff - 2) * 0.055, 0.78, 1);
    const onTargetChance = clamp((0.24 + shotQuality * 1.25 + executionEdge * 12e-4) * shotTempoDampener, 0.14, 0.72);
    const isOnTarget = scored || roll(41) < onTargetChance;
    const postChance = clamp(0.012 + shotQuality * 0.055, 0.01, 0.045);
    const barChance = clamp(0.01 + shotQuality * 0.045, 8e-3, 0.04);
    const saveChance = isOnTarget ? clamp(0.72 - shotQuality * 1.55 + (keeperScore - shooterExecution) * 4e-3, 0.18, 0.88) : 0;
    if (scored) {
      return {
        eventType: chance.kind === "ONE_ON_ONE" ? "ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */ : "GOAL" /* GOAL */,
        goal: true,
        onTarget: true,
        corner: false,
        save: false,
        xG: chance.xG,
        momentumDelta: 18,
        text: `${shooter.lastName} ko\u0144czy akcj\u0119 strza\u0142em do siatki.`
      };
    }
    if (roll(43) < postChance) {
      return {
        eventType: "SHOT_POST" /* SHOT_POST */,
        goal: false,
        onTarget: false,
        corner: false,
        save: false,
        xG: chance.xG,
        momentumDelta: 5,
        text: `${shooter.lastName} trafia w s\u0142upek.`
      };
    }
    if (roll(44) < barChance) {
      return {
        eventType: "SHOT_BAR" /* SHOT_BAR */,
        goal: false,
        onTarget: false,
        corner: false,
        save: false,
        xG: chance.xG,
        momentumDelta: 5,
        text: `${shooter.lastName} uderza w poprzeczk\u0119.`
      };
    }
    if (isOnTarget && roll(45) < saveChance) {
      const corner = roll(46) < 0.18 + shotQuality * 0.25;
      return {
        eventType: chance.kind === "ONE_ON_ONE" ? "ONE_ON_ONE_SAVE" /* ONE_ON_ONE_SAVE */ : "SAVE" /* SAVE */,
        goal: false,
        onTarget: true,
        corner,
        save: true,
        xG: chance.xG,
        momentumDelta: corner ? 3 : 1,
        text: `${keeper?.lastName ?? "Bramkarz"} broni strza\u0142 zawodnika ${shooter.lastName}.`
      };
    }
    return {
      eventType: isOnTarget ? "SHOT_ON_TARGET" /* SHOT_ON_TARGET */ : "SHOT" /* SHOT */,
      goal: false,
      onTarget: isOnTarget,
      corner: !isOnTarget && roll(47) < 0.08 + attacking.crossing * 7e-4,
      save: false,
      xG: chance.xG,
      momentumDelta: isOnTarget ? 2 : 0.5,
      text: `${shooter.lastName} oddaje strza\u0142, ale akcja nie ko\u0144czy si\u0119 golem.`
    };
  }
};

// services/match/engines/cupV2/CupActionBuilder.ts
var opponentSide = (side) => side === "HOME" ? "AWAY" : "HOME";
var profileForSide = (ctx, side) => side === "HOME" ? ctx.homeProfile : ctx.awayProfile;
var nextZoneAfterProgression = (zone, roll, widthUse) => {
  if (zone === "GK") return "DEFENSE";
  if (zone === "DEFENSE") return "MIDFIELD";
  if (zone === "MIDFIELD") return widthUse > 0.58 && roll < 0.45 ? roll < 0.225 ? "WIDE_LEFT" : "WIDE_RIGHT" : "FINAL_THIRD";
  if (zone === "WIDE_LEFT" || zone === "WIDE_RIGHT") return roll < 0.55 ? "BOX" : "FINAL_THIRD";
  if (zone === "FINAL_THIRD") return roll < 0.42 ? "BOX" : "FINAL_THIRD";
  return "BOX";
};
var buildIntent = (ctx, attacking) => {
  const team = attacking.side === "HOME" ? ctx.input.home : ctx.input.away;
  const instructions = team.instructions;
  const activeCount = Math.max(1, attacking.activePlayers.length);
  const individual = team.individualInstructions ?? {};
  const individualTilt = attacking.activePlayers.reduce((acc, player) => {
    const playerInstructions = individual[player.id];
    if (!playerInstructions) return acc;
    return {
      tempo: acc.tempo + (playerInstructions.tempo === "FAST" ? 1 : playerInstructions.tempo === "SLOW" ? -1 : 0),
      risk: acc.risk + (playerInstructions.mindset === "OFFENSIVE" ? 1 : playerInstructions.mindset === "DEFENSIVE" ? -1 : 0),
      verticality: acc.verticality + (playerInstructions.passing === "LONG" ? 1 : playerInstructions.passing === "SHORT" ? -1 : 0),
      pressing: acc.pressing + (playerInstructions.pressing === "PRESSING" ? 1 : 0)
    };
  }, { tempo: 0, risk: 0, verticality: 0, pressing: 0 });
  const patternWeights = [
    { item: "BUILD_UP", weight: (instructions.passing === "SHORT" ? 38 : 24) + Math.max(0, -individualTilt.verticality) * 2.2 },
    { item: "DIRECT", weight: (instructions.passing === "LONG" ? 32 : 12) + Math.max(0, individualTilt.verticality) * 2.4 },
    { item: "COUNTER", weight: instructions.counterAttack === "COUNTER" ? 28 : 8 },
    { item: "WING_PLAY", weight: attacking.tacticalWidth > 58 ? 22 : 12 },
    { item: "SECOND_BALL", weight: (instructions.passing === "LONG" ? 14 : 7) + Math.max(0, individualTilt.verticality) * 1.1 }
  ];
  const individualTempo = clamp(individualTilt.tempo / activeCount, -0.25, 0.25);
  const individualRisk = clamp(individualTilt.risk / activeCount, -0.25, 0.25);
  const individualVerticality = clamp(individualTilt.verticality / activeCount, -0.25, 0.25);
  const tempo = (instructions.tempo === "FAST" ? 0.72 : instructions.tempo === "SLOW" ? 0.34 : 0.52) + individualTempo * 0.16;
  const risk = (instructions.mindset === "OFFENSIVE" ? 0.68 : instructions.mindset === "DEFENSIVE" ? 0.3 : 0.48) + individualRisk * 0.14;
  const verticality = (instructions.passing === "LONG" ? 0.72 : instructions.passing === "SHORT" ? 0.32 : 0.52) + individualVerticality * 0.18;
  const widthUse = clamp(attacking.tacticalWidth / 100 + (instructions.passing === "LONG" ? 0.05 : 0), 0.25, 0.85);
  const intensityTempo = instructions.intensity === "AGGRESSIVE" ? 0.04 : instructions.intensity === "CAUTIOUS" ? -0.04 : 0;
  const intensityRisk = instructions.intensity === "AGGRESSIVE" ? 0.05 : instructions.intensity === "CAUTIOUS" ? -0.05 : 0;
  return {
    side: attacking.side,
    pattern: pickWeighted(patternWeights, ctx.random(12)),
    risk: clamp(risk + intensityRisk, 0.18, 0.78),
    tempo: clamp(tempo + intensityTempo, 0.24, 0.8),
    verticality: clamp(verticality, 0.22, 0.8),
    widthUse
  };
};
var selectOffsideRunner = (attacking, roll) => {
  const pool = attacking.forwards.length > 0 ? [...attacking.forwards, ...attacking.forwards, ...attacking.midfielders] : attacking.outfieldPlayers;
  if (pool.length === 0) return void 0;
  return pickWeighted(pool.map((player) => ({
    item: player,
    weight: weightedScore(player.attributes, {
      pace: 0.22,
      attacking: 0.2,
      positioning: 0.18,
      finishing: 0.13,
      mentality: 0.1,
      workRate: 0.08,
      dribbling: 0.05,
      strength: 0.04
    }) + (player.position === "FWD" ? 14 : player.position === "MID" ? 6 : -8)
  })), roll);
};
var selectOffsidePasser = (attacking, runnerId, roll) => {
  const pool = attacking.outfieldPlayers.filter((player) => player.id !== runnerId);
  if (pool.length === 0) return void 0;
  return pickWeighted(pool.map((player) => ({
    item: player,
    weight: weightedScore(player.attributes, {
      passing: 0.24,
      vision: 0.22,
      technique: 0.17,
      crossing: 0.11,
      mentality: 0.1,
      attacking: 0.08,
      workRate: 0.08
    }) + (player.position === "MID" ? 12 : player.position === "FWD" ? 5 : player.position === "DEF" ? 2 : -12)
  })), roll);
};
var CupActionBuilder = {
  /**
   * Jeden tick symulacji. Ten blok nie zna wyniku końcowego meczu. Widzi tylko
   * aktualny stan piłki i rozstrzyga najbliższe kilka sekund: utrzymanie,
   * pressing, progresję, kontakt, sytuację i ewentualny strzał.
   */
  simulateTick: (ctx) => {
    const attacking = profileForSide(ctx, ctx.state.possession);
    const defending = profileForSide(ctx, opponentSide(ctx.state.possession));
    const intent = buildIntent(ctx, attacking);
    const events2 = [];
    const possessionStats = ctx.state.stats[attacking.side];
    possessionStats.possessionTicks += 1;
    const scoreDiff = attacking.side === "HOME" ? ctx.state.homeScore - ctx.state.awayScore : ctx.state.awayScore - ctx.state.homeScore;
    const leadingGameControlDampener = scoreDiff >= 5 ? 0.46 : scoreDiff >= 4 ? 0.55 : scoreDiff >= 3 ? 0.66 : scoreDiff >= 2 ? 0.8 : scoreDiff >= 1 ? 0.93 : 1;
    const trailingUrgency = scoreDiff < 0 ? clamp(1 + Math.min(3, Math.abs(scoreDiff)) * 0.035, 1, 1.105) : 1;
    const actionCadence = clamp(
      (0.19 + intent.tempo * 0.08 + intent.risk * 0.05 + Math.abs(ctx.state.momentum) * 45e-5) * leadingGameControlDampener * trailingUrgency,
      0.08,
      0.34
    );
    if (ctx.random(20) > actionCadence) {
      return {
        nextZone: ctx.state.ballZone,
        momentumDelta: 0,
        events: events2
      };
    }
    const pressure = ctx.state.pressure[attacking.side];
    const attackingOrganization = ctx.state.organization[attacking.side];
    const defendingOrganization = ctx.state.organization[defending.side];
    const pressingScore = defending.pressing * (defending.lineHeight > 55 ? 1.05 : 0.96);
    const buildScore = attacking.buildUp * 0.32 + attacking.midfieldControl * 0.23 + attacking.progression * 0.2 + attacking.mentality * 0.12 + attacking.staminaReserve * 0.08 + attackingOrganization * 0.04 - pressure * 0.1;
    const turnoverProbability = clamp(
      contestProbability(pressingScore, buildScore, 0.1, 28) + intent.risk * 0.045 + intent.tempo * 0.03,
      0.018,
      0.22
    );
    if (ctx.random(21) < turnoverProbability) {
      const contact = CupDisciplineResolver.resolveContact({ ctx, defending, attacking, danger: intent.risk, salt: 200 });
      if (contact) events2.push(contact);
      const injury = CupInjuryResolver.maybeCreateInjury({ ctx, profile: attacking, contactIntensity: intent.risk, salt: 215 });
      if (injury) events2.push(injury);
      events2.push({
        id: `cupv2_turnover_${ctx.state.second}`,
        second: ctx.state.second,
        minute: Math.floor(ctx.state.second / 60) + 1,
        side: defending.side,
        type: "MISPLACED_PASS" /* MISPLACED_PASS */,
        zone: ctx.state.ballZone,
        pattern: intent.pattern,
        text: `${defending.side === "HOME" ? ctx.input.home.name : ctx.input.away.name} odbiera pi\u0142k\u0119 po niedok\u0142adnym rozegraniu.`
      });
      return {
        nextPossession: defending.side,
        nextZone: ctx.state.ballZone === "BOX" || ctx.state.ballZone === "FINAL_THIRD" ? "DEFENSE" : "MIDFIELD",
        momentumDelta: defending.side === "HOME" ? 1.8 : -1.8,
        events: events2
      };
    }
    const progressionScore = attacking.progression * 0.34 + attacking.midfieldControl * 0.18 + attacking.chanceCreation * 0.15 + (intent.pattern === "COUNTER" ? attacking.counterThreat * 0.2 : 0) + intent.verticality * 12 + intent.tempo * 8;
    const defensiveScore = defending.defensiveShape * 0.38 + defending.midfieldControl * 0.18 + defending.pressing * 0.14 + defending.mentality * 0.12 + defendingOrganization * 0.05;
    const progressProbability = clamp(
      (contestProbability(progressionScore, defensiveScore, 0.38, 24) + intent.risk * 0.04) * leadingGameControlDampener * trailingUrgency,
      0.05,
      0.72
    );
    const progressed = ctx.random(22) < progressProbability;
    const nextZone = progressed ? nextZoneAfterProgression(ctx.state.ballZone, ctx.random(23), intent.widthUse) : ctx.state.ballZone;
    if (!progressed) {
      const eventType = ctx.random(24) < 0.1 ? "THROW_IN" /* THROW_IN */ : "MIDFIELD_CONTROL" /* MIDFIELD_CONTROL */;
      return {
        nextZone,
        momentumDelta: attacking.side === "HOME" ? 0.2 : -0.2,
        events: [{
          id: `cupv2_stalled_${ctx.state.second}`,
          second: ctx.state.second,
          minute: Math.floor(ctx.state.second / 60) + 1,
          side: attacking.side,
          type: eventType,
          zone: ctx.state.ballZone,
          pattern: intent.pattern,
          text: `${attacking.side === "HOME" ? ctx.input.home.name : ctx.input.away.name} utrzymuje pi\u0142k\u0119, ale akcja zwalnia.`
        }]
      };
    }
    if (nextZone !== "FINAL_THIRD" && nextZone !== "BOX" && nextZone !== "WIDE_LEFT" && nextZone !== "WIDE_RIGHT") {
      return { nextZone, momentumDelta: attacking.side === "HOME" ? 0.5 : -0.5, events: events2 };
    }
    const offsideChance = clamp(
      0.01 + intent.verticality * 0.02 + Math.max(0, defending.lineHeight - 58) * 5e-4 - attacking.mentality * 8e-5,
      2e-3,
      0.055
    );
    if (ctx.random(25) < offsideChance) {
      const offsideRunner = selectOffsideRunner(attacking, ctx.random(251));
      const offsidePasser = selectOffsidePasser(attacking, offsideRunner?.id, ctx.random(252));
      ctx.state.stats[attacking.side].offsides += 1;
      return {
        nextPossession: defending.side,
        nextZone: "DEFENSE",
        momentumDelta: attacking.side === "HOME" ? -0.8 : 0.8,
        events: [{
          id: `cupv2_offside_${ctx.state.second}`,
          second: ctx.state.second,
          minute: Math.floor(ctx.state.second / 60) + 1,
          side: attacking.side,
          type: "OFFSIDE" /* OFFSIDE */,
          zone: nextZone,
          pattern: intent.pattern,
          playerId: offsideRunner?.id,
          secondaryPlayerId: offsidePasser?.id,
          text: `${offsideRunner?.lastName ?? (attacking.side === "HOME" ? ctx.input.home.name : ctx.input.away.name)} \u0142apie si\u0119 na spalonym po pr\xF3bie zagrania za lini\u0119 obrony.`,
          detail: {
            runnerId: offsideRunner?.id,
            passerId: offsidePasser?.id,
            defensiveLineHeight: defending.lineHeight,
            verticality: intent.verticality
          }
        }]
      };
    }
    const chance = CupChanceCreationService.createChance({
      side: attacking.side,
      intent,
      attacking,
      defending,
      zone: nextZone,
      pressure,
      scoreDiff,
      roll: ctx.random
    });
    if (!chance) {
      const cornerChance = clamp(0.026 + attacking.crossing * 42e-5 + intent.widthUse * 0.024, 0.018, 0.095);
      if (ctx.random(26) < cornerChance) {
        ctx.state.stats[attacking.side].corners += 1;
        events2.push({
          id: `cupv2_corner_${ctx.state.second}`,
          second: ctx.state.second,
          minute: Math.floor(ctx.state.second / 60) + 1,
          side: attacking.side,
          type: "CORNER" /* CORNER */,
          zone: nextZone,
          pattern: intent.pattern,
          text: `${attacking.side === "HOME" ? ctx.input.home.name : ctx.input.away.name} wywalcza rzut ro\u017Cny po zablokowanej akcji.`
        });
      }
      return { nextZone, momentumDelta: attacking.side === "HOME" ? 0.7 : -0.7, events: events2 };
    }
    const ownGoal = CupOwnGoalResolver.maybeOwnGoal({
      chance,
      defending,
      roll: ctx.random
    });
    const shot = ownGoal ?? CupShotResolver.resolveShot({
      chance,
      attacking,
      defending,
      shooterFatigue: ctx.state.fatigue[chance.shooter.id] ?? chance.shooter.condition,
      keeperFatigue: defending.goalkeeper ? ctx.state.fatigue[defending.goalkeeper.id] ?? defending.goalkeeper.condition : 80,
      weatherPenalty: Math.max(0, (ctx.input.environment.weather?.weatherIntensity ?? 0) * 10.5),
      scoreDiff,
      roll: ctx.random
    });
    const stats2 = ctx.state.stats[attacking.side];
    stats2.shots += 1;
    stats2.xG += shot.xG;
    if (shot.onTarget) stats2.shotsOnTarget += 1;
    if (shot.goal) stats2.goals += 1;
    if (shot.corner) stats2.corners += 1;
    if (shot.save) ctx.state.stats[defending.side].saves += 1;
    if (shot.eventType === "SHOT_POST" /* SHOT_POST */) stats2.posts += 1;
    if (shot.eventType === "SHOT_BAR" /* SHOT_BAR */) stats2.bars += 1;
    events2.push({
      id: `cupv2_shot_${ctx.state.second}`,
      second: ctx.state.second,
      minute: Math.floor(ctx.state.second / 60) + 1,
      side: attacking.side,
      type: shot.eventType,
      zone: chance.zone,
      pattern: chance.pattern,
      playerId: shot.isOwnGoal ? shot.ownGoalPlayerId : chance.shooter.id,
      secondaryPlayerId: shot.assistEligible === false || shot.isOwnGoal ? void 0 : chance.creator?.id,
      text: shot.text,
      xG: shot.xG,
      detail: {
        chanceKind: chance.kind,
        pressure: chance.pressure,
        distance: chance.distance,
        angle: chance.angle,
        assistEligible: shot.assistEligible ?? Boolean(chance.creator),
        isOwnGoal: shot.isOwnGoal ?? false,
        ownGoalPlayerId: shot.ownGoalPlayerId,
        attackingShooterId: chance.shooter.id
      }
    });
    return {
      nextPossession: shot.goal ? defending.side : shot.corner ? attacking.side : defending.side,
      nextZone: shot.goal ? "MIDFIELD" : shot.corner ? "WIDE_LEFT" : "DEFENSE",
      momentumDelta: attacking.side === "HOME" ? shot.momentumDelta : -shot.momentumDelta,
      events: events2
    };
  }
};

// services/match/engines/cupV2/CupSubstitutionService.ts
var CupSubstitutionService = {
  /**
   * Zmiany są planowane przez tę warstwę, ale wykonanie powinno później
   * należeć do integracji z UI i aktualnym LineupService. W V2 najważniejsze
   * jest, żeby potrzeba zmiany wynikała z meczu: zmęczenia, urazu, kartek,
   * wyniku i dopasowania zawodnika z ławki.
   */
  proposeAiSubstitution: ({
    team,
    profile,
    state,
    maxSubstitutions
  }) => {
    if (state.substitutionsUsed[team.side] >= maxSubstitutions) return null;
    const alreadyLeftPitchIds = new Set(
      state.events.filter((event) => event.type === "SUBSTITUTION" /* SUBSTITUTION */).map((event) => event.secondaryPlayerId).filter((id) => Boolean(id))
    );
    const activeIds = new Set(team.lineup.startingXI.filter((id) => Boolean(id)));
    const bench = team.players.filter((player) => team.lineup.bench.includes(player.id) && !alreadyLeftPitchIds.has(player.id));
    if (bench.length === 0) return null;
    const tiredPlayers = profile.activePlayers.filter((player) => (state.fatigue[player.id] ?? player.condition) < 55);
    const injuredPlayers = profile.activePlayers.filter((player) => state.injuries[player.id]);
    const yellowRiskPlayers = profile.activePlayers.filter((player) => (state.yellowCards[player.id] ?? 0) > 0 && player.attributes.aggression > 65);
    const candidatesOut = injuredPlayers.length > 0 ? injuredPlayers : tiredPlayers.length > 0 ? tiredPlayers : yellowRiskPlayers;
    if (candidatesOut.length === 0) return null;
    const playerOut = pickWeighted(candidatesOut.map((player) => ({
      item: player,
      weight: state.injuries[player.id] ? 100 : Math.max(1, 100 - (state.fatigue[player.id] ?? player.condition))
    })), 0.42);
    const replacements = bench.filter((player) => !activeIds.has(player.id) && player.position === playerOut.position);
    const pool = replacements.length > 0 ? replacements : bench;
    const playerIn = pickWeighted(pool.map((player) => ({
      item: player,
      weight: weightedScore(player.attributes, {
        stamina: 0.22,
        workRate: 0.16,
        mentality: 0.14,
        pace: 0.1,
        technique: 0.1,
        passing: 0.08,
        defending: 0.08,
        attacking: 0.08,
        leadership: 0.04
      }) + player.overallRating * 0.25
    })), 0.58);
    return {
      side: team.side,
      playerOutId: playerOut.id,
      playerInId: playerIn.id,
      reason: state.injuries[playerOut.id] ? "INJURY" : (state.yellowCards[playerOut.id] ?? 0) > 0 ? "CARD_RISK" : "FATIGUE"
    };
  }
};

// services/match/engines/cupV2/CupPenaltyShootoutService.ts
var playerName = (player) => `${player.firstName} ${player.lastName}`.trim();
var takerWeight = (player, fatigue = player.condition, injury) => {
  const injuryPenalty = injury === "SEVERE" ? 0.56 : injury === "LIGHT" ? 0.82 : 1;
  return Math.max(1, weightedScore(player.attributes, {
    penalties: 0.34,
    finishing: 0.18,
    technique: 0.16,
    mentality: 0.18,
    leadership: 0.06,
    strength: 0.04,
    talent: 0.04
  }) * clamp(0.72 + fatigue / 285, 0.72, 1.07) * injuryPenalty);
};
var goalkeeperWeight = (player, fatigue = player?.condition ?? 70, injury) => {
  if (!player) return 42;
  const injuryPenalty = injury === "SEVERE" ? 0.62 : injury === "LIGHT" ? 0.86 : 1;
  return weightedScore(player.attributes, {
    goalkeeping: 0.42,
    positioning: 0.18,
    mentality: 0.16,
    pace: 0.08,
    strength: 0.08,
    leadership: 0.08
  }) * clamp(0.74 + fatigue / 310, 0.74, 1.06) * injuryPenalty;
};
var activePlayers2 = (team, redCards) => {
  const byId2 = new Map(team.players.map((player) => [player.id, player]));
  const active = team.lineup.startingXI.map((id) => id ? byId2.get(id) : void 0).filter((player) => Boolean(player && !redCards[player.id]));
  return active.length > 0 ? active : team.players.filter((player) => !redCards[player.id]);
};
var selectGoalkeeper = (players, redCards) => {
  const eligible = players.filter((player) => !redCards[player.id]);
  return eligible.find((player) => player.position === "GK") ?? eligible.map((player) => ({
    player,
    score: weightedScore(player.attributes, {
      goalkeeping: 0.55,
      positioning: 0.18,
      mentality: 0.12,
      strength: 0.08,
      leadership: 0.07
    })
  })).sort((a, b) => b.score - a.score)[0]?.player;
};
var buildTakerOrder = (candidates, fatigue, injuries, seed, salt) => {
  const remaining = [...candidates];
  const ordered = [];
  let pickIndex = 0;
  while (remaining.length > 0) {
    const picked = pickWeighted(
      remaining.map((player) => ({
        item: player,
        weight: takerWeight(player, fatigue[player.id] ?? player.condition, injuries[player.id]) * (0.82 + seededRandom(seed, 91e3 + pickIndex, salt + pickIndex) * 0.36)
      })),
      seededRandom(seed, 92e3 + pickIndex, salt + 100)
    );
    ordered.push(picked);
    remaining.splice(remaining.findIndex((player) => player.id === picked.id), 1);
    pickIndex += 1;
  }
  return ordered;
};
var CupPenaltyShootoutService = {
  /**
   * Seria karnych jest osobną fazą po dogrywce. Nie dolicza bramek do wyniku
   * meczu, ale generuje osobne zdarzenia wykonawców i bramkarzy dla raportu.
   */
  simulate: (input, fatigue, options = {}) => {
    const redCards = options.redCards ?? {};
    const injuries = options.injuries ?? {};
    const startSecond = options.startSecond ?? 120 * 60;
    const homeCandidates = activePlayers2(input.home, redCards);
    const awayCandidates = activePlayers2(input.away, redCards);
    const homeKeeper2 = selectGoalkeeper(homeCandidates, redCards);
    const awayKeeper2 = selectGoalkeeper(awayCandidates, redCards);
    const homeOrder = buildTakerOrder(homeCandidates, fatigue, injuries, input.seed, 31);
    const awayOrder = buildTakerOrder(awayCandidates, fatigue, injuries, input.seed, 47);
    let home = 0;
    let away = 0;
    let round = 0;
    let order = 0;
    const attempts = [];
    const events2 = [];
    const takePenalty = (side, taker, salt) => {
      const keeper = side === "HOME" ? awayKeeper2 : homeKeeper2;
      const takerScore = takerWeight(taker, fatigue[taker.id] ?? taker.condition, injuries[taker.id]);
      const keeperScore = goalkeeperWeight(keeper, keeper ? fatigue[keeper.id] ?? keeper.condition : 70, keeper ? injuries[keeper.id] : void 0);
      const chance = clamp(0.73 + (takerScore - keeperScore) * 3e-3, 0.55, 0.9);
      const scored = seededRandom(input.seed, 1e5 + round, salt) < chance;
      const saved = !scored && seededRandom(input.seed, 101e3 + round, salt) < clamp(0.43 + (keeperScore - takerScore) * 4e-3, 0.18, 0.72);
      return {
        id: `cupv2_shootout_${order}_${side.toLowerCase()}_${taker.id}`,
        round: round + 1,
        order,
        side,
        takerId: taker.id,
        goalkeeperId: keeper?.id,
        scored,
        saved,
        xG: Number(chance.toFixed(2)),
        takerScore: Number(takerScore.toFixed(2)),
        keeperScore: Number(keeperScore.toFixed(2))
      };
    };
    const pushAttempt = (attempt) => {
      attempts.push(attempt);
      if (attempt.side === "HOME" && attempt.scored) home += 1;
      if (attempt.side === "AWAY" && attempt.scored) away += 1;
      const team = attempt.side === "HOME" ? input.home : input.away;
      const taker = team.players.find((player) => player.id === attempt.takerId);
      const keeperTeam = attempt.side === "HOME" ? input.away : input.home;
      const keeper = attempt.goalkeeperId ? keeperTeam.players.find((player) => player.id === attempt.goalkeeperId) : void 0;
      const second = startSecond + attempt.order * 15;
      const penaltyScoreText = `${home}:${away}`;
      const resultText = attempt.scored ? `${taker ? playerName(taker) : "Zawodnik"} wykorzystuje rzut karny w serii.` : attempt.saved ? `${keeper ? playerName(keeper) : "Bramkarz"} broni rzut karny wykonywany przez ${taker ? playerName(taker) : "zawodnika"}.` : `${taker ? playerName(taker) : "Zawodnik"} nie trafia w serii rzut\xF3w karnych.`;
      events2.push({
        id: attempt.id,
        second,
        minute: Math.floor(second / 60) + 1,
        side: attempt.side,
        type: attempt.scored ? "PENALTY_SCORED" /* PENALTY_SCORED */ : "PENALTY_MISSED" /* PENALTY_MISSED */,
        playerId: attempt.takerId,
        secondaryPlayerId: attempt.goalkeeperId,
        text: resultText,
        xG: attempt.xG,
        detail: {
          isShootout: true,
          phase: "PENALTY_SHOOTOUT",
          shootoutRound: attempt.round,
          shootoutOrder: attempt.order,
          goalkeeperId: attempt.goalkeeperId,
          saved: attempt.saved,
          penaltyScoreHome: home,
          penaltyScoreAway: away,
          penaltyScore: penaltyScoreText
        }
      });
    };
    while (round < 5 || home === away) {
      const homeTaker = homeOrder[round % homeOrder.length];
      const awayTaker = awayOrder[round % awayOrder.length];
      pushAttempt(takePenalty("HOME", homeTaker, 11));
      order += 1;
      const remainingAfterHome = Math.max(0, 5 - round - 1);
      if (round < 5 && Math.abs(home - away) > remainingAfterHome + 1) break;
      pushAttempt(takePenalty("AWAY", awayTaker, 12));
      order += 1;
      round += 1;
      const remaining = Math.max(0, 5 - round);
      if (round >= 5 && home !== away) break;
      if (round < 5 && Math.abs(home - away) > remaining) break;
      if (round > 16 && home !== away) break;
    }
    return { winner: home >= away ? "HOME" : "AWAY", home, away, attempts, events: events2 };
  }
};

// services/match/engines/cupV2/CupPlayerRatingService.ts
var resultImpact = (sideScore, opponentScore) => {
  if (sideScore > opponentScore) return 0.22;
  if (sideScore === opponentScore) return 0.04;
  return -0.16;
};
var minutesImpact = (minutesPlayed) => {
  if (minutesPlayed <= 0) return -6;
  if (minutesPlayed < 15) return -0.22;
  if (minutesPlayed < 30) return -0.08;
  if (minutesPlayed >= 90) return 0.04;
  return 0;
};
var teamControlImpact = (teamStats, opponentStats) => {
  if (!teamStats || !opponentStats) return 0;
  return clamp(
    (teamStats.xG - opponentStats.xG) * 0.055 + (teamStats.shotsOnTarget - opponentStats.shotsOnTarget) * 0.018 + (teamStats.corners - opponentStats.corners) * 0.01 - teamStats.redCards * 0.035,
    -0.22,
    0.22
  );
};
var fatigueImpact = (minutesPlayed, finalFatigue) => {
  if (finalFatigue === void 0 || minutesPlayed < 45) return 0;
  if (finalFatigue < 25) return -0.14;
  if (finalFatigue < 38) return -0.07;
  if (finalFatigue > 72 && minutesPlayed >= 85) return 0.05;
  return 0;
};
var goalWeight = (entry) => {
  if (entry.position === "FWD" /* FWD */) return 0.92;
  if (entry.position === "MID" /* MID */) return 1.05;
  if (entry.position === "DEF" /* DEF */) return 1.2;
  return 1.28;
};
var assistWeight = (entry) => {
  if (entry.position === "MID" /* MID */) return 0.62;
  if (entry.position === "FWD" /* FWD */) return 0.48;
  if (entry.position === "DEF" /* DEF */) return 0.58;
  return 0.45;
};
var attackingImpact = (entry) => {
  const conversionImpact = clamp((entry.goals - entry.xG) * 0.3, -0.45, 0.55);
  const wastePenalty = entry.goals === 0 && entry.xG >= 0.7 ? clamp((entry.xG - 0.55) * 0.22, 0, 0.22) : 0;
  const shotSelectionPenalty = entry.shots >= 4 && entry.shotsOnTarget === 0 ? 0.12 : 0;
  return entry.goals * goalWeight(entry) + entry.assists * assistWeight(entry) + entry.shotsOnTarget * 0.075 - entry.shotsOffTarget * 0.035 + Math.min(0.34, entry.xG * 0.14) + conversionImpact - wastePenalty - shotSelectionPenalty + entry.posts * 0.05 + entry.bars * 0.05;
};
var creationImpact = (entry) => entry.chancesCreated * (entry.position === "MID" /* MID */ ? 0.095 : 0.075) + entry.keyPasses * (entry.position === "MID" /* MID */ ? 0.075 : 0.055) + entry.foulsWon * 0.035 - entry.offsides * 0.055;
var goalkeeperImpact = (entry, opponentScore) => {
  if (entry.position !== "GK" /* GK */) return 0;
  const shotsFaced = entry.saves + entry.goalsConceded;
  const saveRate = shotsFaced > 0 ? entry.saves / shotsFaced : 1;
  const cleanSheet = entry.minutesPlayed >= 60 && opponentScore === 0 ? 0.38 : 0;
  return entry.saves * 0.17 + clamp((saveRate - 0.68) * 0.55, -0.22, 0.28) + cleanSheet - entry.goalsConceded * 0.22 + entry.penaltiesSaved * 0.72;
};
var defensiveImpact = (entry, opponentScore) => {
  if (entry.position === "GK" /* GK */) return 0;
  const cleanSheet = opponentScore === 0 && entry.minutesPlayed >= 60 ? entry.position === "DEF" /* DEF */ ? 0.22 : entry.position === "MID" /* MID */ ? 0.08 : 0.02 : 0;
  const concessionPenalty = opponentScore >= 4 && entry.minutesPlayed >= 60 ? entry.position === "DEF" /* DEF */ ? 0.16 : entry.position === "MID" /* MID */ ? 0.08 : 0.03 : 0;
  return cleanSheet - concessionPenalty;
};
var disciplineImpact = (entry) => -entry.foulsCommitted * 0.045 - entry.yellowCards * 0.32 - entry.redCards * 1.22 - entry.ownGoals * 0.95 - entry.penaltiesMissed * 0.52 + entry.penaltiesScored * 0.08;
var healthImpact = (entry) => -entry.injuriesLight * 0.04 - entry.injuriesSevere * 0.12;
var CupPlayerRatingService = {
  /**
   * Ocena zawodnika jest modelem raportowym, nie generatorem meczu. Korzysta z
   * wyniku, roli, minut, statystyk indywidualnych, jakości okazji, bramkarza,
   * dyscypliny i zmęczenia po meczu.
   */
  calculate: ({
    entry,
    sideScore,
    opponentScore,
    teamStats,
    opponentStats,
    finalFatigue
  }) => {
    if (entry.minutesPlayed <= 0) return 0;
    const rating = 6 + resultImpact(sideScore, opponentScore) + minutesImpact(entry.minutesPlayed) + teamControlImpact(teamStats, opponentStats) + fatigueImpact(entry.minutesPlayed, finalFatigue) + attackingImpact(entry) + creationImpact(entry) + goalkeeperImpact(entry, opponentScore) + defensiveImpact(entry, opponentScore) + disciplineImpact(entry) + healthImpact(entry);
    return Number(clamp(rating, 1, 10).toFixed(1));
  }
};

// services/match/engines/cupV2/CupPlayerStatsAggregator.ts
var SHOT_TYPES = /* @__PURE__ */ new Set([
  "SHOT" /* SHOT */,
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
var formatName = (player) => `${player.firstName} ${player.lastName}`.trim();
var emptyTeamStats = () => ({});
var playerById = (match) => {
  const players = /* @__PURE__ */ new Map();
  match.home.players.forEach((player) => players.set(player.id, { player, side: "HOME" }));
  match.away.players.forEach((player) => players.set(player.id, { player, side: "AWAY" }));
  return players;
};
var activeLineups = (match, initialLineups) => ({
  HOME: initialLineups?.HOME ?? match.home.lineup.startingXI,
  AWAY: initialLineups?.AWAY ?? match.away.lineup.startingXI
});
var createPlayerStats = (player, side, starter) => ({
  playerId: player.id,
  name: formatName(player),
  side,
  clubId: player.clubId,
  position: player.position,
  starter,
  startedSecond: starter ? 0 : void 0,
  endedSecond: void 0,
  minutesPlayed: 0,
  goals: 0,
  ownGoals: 0,
  assists: 0,
  shots: 0,
  shotsOnTarget: 0,
  shotsOffTarget: 0,
  posts: 0,
  bars: 0,
  xG: 0,
  chancesCreated: 0,
  keyPasses: 0,
  foulsCommitted: 0,
  foulsWon: 0,
  offsides: 0,
  yellowCards: 0,
  redCards: 0,
  injuriesLight: 0,
  injuriesSevere: 0,
  substitutionsOn: starter ? 0 : 0,
  substitutionsOff: 0,
  saves: 0,
  goalsConceded: 0,
  penaltiesTaken: 0,
  penaltiesScored: 0,
  penaltiesMissed: 0,
  penaltiesSaved: 0,
  rating: 6
});
var ensureStats = (stats2, lookup, playerId, fallbackSide) => {
  const found = lookup.get(playerId);
  if (!found && !fallbackSide) return void 0;
  const side = found?.side ?? fallbackSide;
  const player = found?.player;
  if (!player) return void 0;
  if (!stats2[side][playerId]) {
    stats2[side][playerId] = createPlayerStats(player, side, false);
  }
  return stats2[side][playerId];
};
var opponentSide2 = (side) => side === "HOME" ? "AWAY" : "HOME";
var goalkeeperIdForSide = (match, side, lineups) => {
  const team = side === "HOME" ? match.home : match.away;
  const byId2 = new Map(team.players.map((player) => [player.id, player]));
  return lineups[side].map((id) => id ? byId2.get(id) : void 0).find((player) => player?.position === "GK" /* GK */)?.id;
};
var activeGoalkeeperAtSecond = (match, events2, side, lineups, second) => {
  let keeperId = goalkeeperIdForSide(match, side, lineups);
  const team = side === "HOME" ? match.home : match.away;
  const players = new Map(team.players.map((player) => [player.id, player]));
  events2.filter((event) => event.type === "SUBSTITUTION" /* SUBSTITUTION */ && event.side === side && event.second <= second).sort((a, b) => a.second - b.second).forEach((event) => {
    const playerIn = event.playerId ? players.get(event.playerId) : void 0;
    if (event.secondaryPlayerId === keeperId && playerIn) {
      keeperId = playerIn.id;
    }
  });
  return keeperId;
};
var markMinutes = (stats2, lookup, match, events2, finalSecond, lineups) => {
  ["HOME", "AWAY"].forEach((side) => {
    lineups[side].forEach((id) => {
      if (!id) return;
      const entry = ensureStats(stats2, lookup, id, side);
      if (!entry) return;
      entry.starter = true;
      entry.startedSecond = 0;
    });
  });
  events2.filter((event) => event.type === "SUBSTITUTION" /* SUBSTITUTION */).sort((a, b) => a.second - b.second).forEach((event) => {
    if (!event.side) return;
    const playerIn = event.playerId ? ensureStats(stats2, lookup, event.playerId, event.side) : void 0;
    const playerOut = event.secondaryPlayerId ? ensureStats(stats2, lookup, event.secondaryPlayerId, event.side) : void 0;
    if (playerIn) {
      playerIn.substitutionsOn += 1;
      if (playerIn.startedSecond === void 0) playerIn.startedSecond = event.second;
    }
    if (playerOut) {
      playerOut.substitutionsOff += 1;
      playerOut.endedSecond = Math.min(playerOut.endedSecond ?? event.second, event.second);
    }
  });
  Object.values(stats2).forEach((teamStats) => {
    Object.values(teamStats).forEach((entry) => {
      if (entry.startedSecond === void 0) return;
      const end = entry.endedSecond ?? finalSecond;
      entry.minutesPlayed = Math.max(0, Math.ceil((end - entry.startedSecond) / 60));
    });
  });
};
var detailBool = (event, key) => event.detail?.[key] === true;
var detailString = (event, key) => {
  const value = event.detail?.[key];
  return typeof value === "string" ? value : void 0;
};
var isOwnGoalEvent = (event) => detailBool(event, "isOwnGoal");
var isShootoutPenalty = (event) => detailBool(event, "isShootout");
var ownGoalPlayerId = (event) => detailString(event, "ownGoalPlayerId") ?? (isOwnGoalEvent(event) ? event.playerId : void 0);
var shouldCountAssist = (event) => GOAL_TYPES.has(event.type) && !isOwnGoalEvent(event) && event.type !== "PENALTY_SCORED" /* PENALTY_SCORED */ && event.detail?.assistEligible !== false && Boolean(event.secondaryPlayerId) && event.secondaryPlayerId !== event.playerId;
var CupPlayerStatsAggregator = {
  /**
   * Zamienia surowe zdarzenia V2 na statystyki indywidualne. Ten moduł nie
   * generuje nowych akcji, tylko księguje to, co wydarzyło się w symulacji:
   * strzały, gole, asysty, zmiany, urazy, kartki, pracę bramkarza i rating.
   */
  aggregate: ({
    match,
    events: events2,
    finalSecond,
    homeScore,
    awayScore,
    initialLineups,
    finalFatigue,
    teamStats
  }) => {
    const stats2 = {
      HOME: emptyTeamStats(),
      AWAY: emptyTeamStats()
    };
    const lookup = playerById(match);
    const lineups = activeLineups(match, initialLineups);
    markMinutes(stats2, lookup, match, events2, finalSecond, lineups);
    events2.forEach((event) => {
      const side = event.side;
      if (isShootoutPenalty(event)) {
        if (event.playerId && (event.type === "PENALTY_SCORED" /* PENALTY_SCORED */ || event.type === "PENALTY_MISSED" /* PENALTY_MISSED */)) {
          const taker = ensureStats(stats2, lookup, event.playerId, side);
          if (taker) {
            taker.penaltiesTaken += 1;
            if (event.type === "PENALTY_SCORED" /* PENALTY_SCORED */) taker.penaltiesScored += 1;
            if (event.type === "PENALTY_MISSED" /* PENALTY_MISSED */) taker.penaltiesMissed += 1;
          }
        }
        if (event.type === "PENALTY_MISSED" /* PENALTY_MISSED */ && detailBool(event, "saved")) {
          const keeperId = detailString(event, "goalkeeperId") ?? event.secondaryPlayerId;
          const keeper = keeperId ? ensureStats(stats2, lookup, keeperId) : void 0;
          if (keeper) keeper.penaltiesSaved += 1;
        }
        return;
      }
      if (SHOT_TYPES.has(event.type) && event.playerId) {
        const ownGoal = isOwnGoalEvent(event);
        const shooter = ownGoal ? void 0 : ensureStats(stats2, lookup, event.playerId, side);
        if (shooter) {
          shooter.shots += 1;
          shooter.xG += event.xG ?? 0;
          if (ON_TARGET_TYPES.has(event.type)) shooter.shotsOnTarget += 1;
          else shooter.shotsOffTarget += 1;
          if (event.type === "SHOT_POST" /* SHOT_POST */) shooter.posts += 1;
          if (event.type === "SHOT_BAR" /* SHOT_BAR */) shooter.bars += 1;
          if (event.type === "PENALTY_SCORED" /* PENALTY_SCORED */ || event.type === "PENALTY_MISSED" /* PENALTY_MISSED */) {
            shooter.penaltiesTaken += 1;
          }
          if (event.type === "PENALTY_SCORED" /* PENALTY_SCORED */) shooter.penaltiesScored += 1;
          if (event.type === "PENALTY_MISSED" /* PENALTY_MISSED */) shooter.penaltiesMissed += 1;
        }
        if (event.secondaryPlayerId && !ownGoal && event.secondaryPlayerId !== event.playerId) {
          const creator = ensureStats(stats2, lookup, event.secondaryPlayerId, side);
          if (creator) {
            creator.chancesCreated += 1;
            if ((event.xG ?? 0) >= 0.08 || ON_TARGET_TYPES.has(event.type)) creator.keyPasses += 1;
          }
        }
      }
      if (GOAL_TYPES.has(event.type)) {
        if (isOwnGoalEvent(event)) {
          const ownPlayerId = ownGoalPlayerId(event);
          const ownPlayer = ownPlayerId ? ensureStats(stats2, lookup, ownPlayerId) : void 0;
          if (ownPlayer) ownPlayer.ownGoals += 1;
        } else if (event.playerId) {
          const scorer = ensureStats(stats2, lookup, event.playerId, side);
          if (scorer) scorer.goals += 1;
        }
        if (shouldCountAssist(event) && event.secondaryPlayerId) {
          const assistant = ensureStats(stats2, lookup, event.secondaryPlayerId, side);
          if (assistant) assistant.assists += 1;
        }
        if (side) {
          const concedingSide = opponentSide2(side);
          const keeperId = activeGoalkeeperAtSecond(match, events2, concedingSide, lineups, event.second);
          const keeper = keeperId ? ensureStats(stats2, lookup, keeperId, concedingSide) : void 0;
          if (keeper) keeper.goalsConceded += 1;
        }
      }
      if (SAVE_TYPES.has(event.type) && side) {
        const keeperSide = opponentSide2(side);
        const keeperId = activeGoalkeeperAtSecond(match, events2, keeperSide, lineups, event.second);
        const keeper = keeperId ? ensureStats(stats2, lookup, keeperId, keeperSide) : void 0;
        if (keeper) keeper.saves += 1;
      }
      if (event.type === "PENALTY_MISSED" /* PENALTY_MISSED */ && side) {
        const keeperSide = opponentSide2(side);
        const keeperId = activeGoalkeeperAtSecond(match, events2, keeperSide, lineups, event.second);
        const keeper = keeperId ? ensureStats(stats2, lookup, keeperId, keeperSide) : void 0;
        if (keeper && detailBool(event, "saved")) keeper.penaltiesSaved += 1;
      }
      if (event.playerId) {
        const entry = ensureStats(stats2, lookup, event.playerId, side);
        if (entry) {
          if (event.type === "FOUL" /* FOUL */ || event.type === "YELLOW_CARD" /* YELLOW_CARD */ || event.type === "RED_CARD" /* RED_CARD */) {
            entry.foulsCommitted += 1;
          }
          if (event.type === "OFFSIDE" /* OFFSIDE */) entry.offsides += 1;
          if (event.type === "YELLOW_CARD" /* YELLOW_CARD */) entry.yellowCards += 1;
          if (event.type === "RED_CARD" /* RED_CARD */) {
            entry.redCards += 1;
            entry.endedSecond = Math.min(entry.endedSecond ?? event.second, event.second);
          }
          if (event.type === "INJURY_LIGHT" /* INJURY_LIGHT */) entry.injuriesLight += 1;
          if (event.type === "INJURY_SEVERE" /* INJURY_SEVERE */) entry.injuriesSevere += 1;
        }
      }
      if (event.secondaryPlayerId && (event.type === "FOUL" /* FOUL */ || event.type === "YELLOW_CARD" /* YELLOW_CARD */ || event.type === "RED_CARD" /* RED_CARD */)) {
        const fouled = ensureStats(stats2, lookup, event.secondaryPlayerId);
        if (fouled) fouled.foulsWon += 1;
      }
    });
    Object.values(stats2).forEach((teamStats2) => {
      Object.values(teamStats2).forEach((entry) => {
        if (entry.startedSecond !== void 0) {
          const end = entry.endedSecond ?? finalSecond;
          entry.minutesPlayed = Math.max(0, Math.ceil((end - entry.startedSecond) / 60));
        }
        entry.xG = Number(entry.xG.toFixed(2));
        entry.shotsOffTarget = Math.max(0, entry.shots - entry.shotsOnTarget);
        entry.rating = CupPlayerRatingService.calculate({
          entry,
          sideScore: entry.side === "HOME" ? homeScore : awayScore,
          opponentScore: entry.side === "HOME" ? awayScore : homeScore,
          teamStats: teamStats2?.[entry.side],
          opponentStats: teamStats2?.[opponentSide2(entry.side)],
          finalFatigue: finalFatigue?.[entry.playerId]
        });
      });
    });
    return stats2;
  }
};

// services/match/engines/cupV2/CupMatchLoop.ts
var emptyStats = () => ({
  possessionTicks: 0,
  shots: 0,
  shotsOnTarget: 0,
  goals: 0,
  xG: 0,
  corners: 0,
  fouls: 0,
  offsides: 0,
  yellowCards: 0,
  redCards: 0,
  injuries: 0,
  freeKicks: 0,
  penalties: 0,
  posts: 0,
  bars: 0,
  saves: 0
});
var initialFatigue = (input) => {
  const fatigue = {};
  [...input.home.players, ...input.away.players].forEach((player) => {
    fatigue[player.id] = player.condition;
  });
  return fatigue;
};
var createInitialCupRuntimeState = (input) => ({
  second: 0,
  phase: "FIRST_HALF",
  possession: seededRandom(input.seed, 0, 1) < 0.5 ? "HOME" : "AWAY",
  possessionReason: "KICK_OFF",
  ballZone: "MIDFIELD",
  attackPattern: "BUILD_UP",
  homeScore: 0,
  awayScore: 0,
  momentum: 0,
  pressure: { HOME: 35, AWAY: 35 },
  organization: { HOME: 72, AWAY: 72 },
  fatigue: initialFatigue(input),
  yellowCards: {},
  redCards: {},
  injuries: {},
  substitutionsUsed: { HOME: 0, AWAY: 0 },
  addedTimeSeconds: 0,
  stats: { HOME: emptyStats(), AWAY: emptyStats() },
  events: []
});
var updateFatigue = (state, input, config) => {
  const possessionSide = state.possession;
  const activeIds = [
    ...input.home.lineup.startingXI.filter((id) => Boolean(id)),
    ...input.away.lineup.startingXI.filter((id) => Boolean(id))
  ];
  activeIds.forEach((id) => {
    const player = [...input.home.players, ...input.away.players].find((item) => item.id === id);
    if (!player) return;
    const team = input.home.players.some((item) => item.id === id) ? input.home : input.away;
    const isPossessionTeam = team.side === possessionSide;
    const instructionCost = team.instructions.tempo === "FAST" ? 0.01 : team.instructions.tempo === "SLOW" ? 4e-3 : 6e-3;
    const pressingCost = team.instructions.pressing === "PRESSING" ? 6e-3 : 2e-3;
    const injuryCost = state.injuries[id] === "SEVERE" ? 0.03 : state.injuries[id] === "LIGHT" ? 0.012 : 0;
    const staminaShield = player.attributes.stamina * 65e-6 + player.attributes.workRate * 25e-6;
    const costPerTick = (instructionCost + pressingCost + injuryCost + (isPossessionTeam ? 1e-3 : 2e-3)) * (config.tickSeconds / 5);
    state.fatigue[id] = clamp((state.fatigue[id] ?? player.condition) - Math.max(1e-3, costPerTick - staminaShield), 15, 100);
  });
};
var applyEventToState = (state, eventType, side) => {
  if (!side) return;
  const stats2 = state.stats[side];
  if (eventType === "GOAL" /* GOAL */ || eventType === "ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */) {
    if (side === "HOME") state.homeScore += 1;
    else state.awayScore += 1;
  }
  if (eventType === "FOUL" /* FOUL */) stats2.fouls += 1;
  if (eventType === "YELLOW_CARD" /* YELLOW_CARD */) {
    stats2.fouls += 1;
    stats2.yellowCards += 1;
  }
  if (eventType === "RED_CARD" /* RED_CARD */) {
    stats2.fouls += 1;
    stats2.redCards += 1;
  }
  if (eventType === "INJURY_LIGHT" /* INJURY_LIGHT */ || eventType === "INJURY_SEVERE" /* INJURY_SEVERE */) {
    stats2.injuries += 1;
  }
};
var applyPlayerEventToState = (state, eventType, playerId) => {
  if (!playerId) return;
  if (eventType === "YELLOW_CARD" /* YELLOW_CARD */) {
    state.yellowCards[playerId] = (state.yellowCards[playerId] ?? 0) + 1;
  }
  if (eventType === "RED_CARD" /* RED_CARD */) {
    state.redCards[playerId] = true;
  }
  if (eventType === "INJURY_LIGHT" /* INJURY_LIGHT */) {
    state.injuries[playerId] = "LIGHT";
    state.fatigue[playerId] = Math.min(state.fatigue[playerId] ?? 58, 58);
  }
  if (eventType === "INJURY_SEVERE" /* INJURY_SEVERE */) {
    state.injuries[playerId] = "SEVERE";
    state.fatigue[playerId] = Math.min(state.fatigue[playerId] ?? 34, 34);
  }
};
var updateOrganization = (state, input, homeProfile, awayProfile) => {
  const calculate = (side, profile) => {
    const team = side === "HOME" ? input.home : input.away;
    const markingMod = team.instructions.marking === "ZONE" ? 4 : team.instructions.marking === "MAN" ? 1 : -7;
    const intensityMod = team.instructions.intensity === "AGGRESSIVE" ? -3 : team.instructions.intensity === "CAUTIOUS" ? 2 : 0;
    return clamp(
      43 + profile.defensiveShape * 0.2 + profile.midfieldControl * 0.08 + profile.leadership * 0.1 + profile.mentality * 0.1 + profile.staminaReserve * 0.1 - state.pressure[side] * 0.08 + markingMod + intensityMod,
      30,
      92
    );
  };
  state.organization.HOME = calculate("HOME", homeProfile);
  state.organization.AWAY = calculate("AWAY", awayProfile);
};
var maybeExecuteSubstitution = (input, state, side, profile, config) => {
  if (input.substitutionPolicy?.[side] === "MANUAL") return;
  const minute = Math.floor(state.second / 60);
  const team = side === "HOME" ? input.home : input.away;
  const hasInjuredStarter = team.lineup.startingXI.some((id) => Boolean(id && state.injuries[id]));
  const hasSevereInjuredStarter = team.lineup.startingXI.some((id) => Boolean(id && state.injuries[id] === "SEVERE"));
  if (!hasInjuredStarter && (minute < 55 || state.second % (5 * 60) !== 0)) return;
  if (!hasInjuredStarter && seededRandom(input.seed, state.second, side === "HOME" ? 811 : 812) > 0.54) return;
  if (hasInjuredStarter && !hasSevereInjuredStarter && seededRandom(input.seed, state.second, side === "HOME" ? 813 : 814) > 0.82) return;
  const proposal = CupSubstitutionService.proposeAiSubstitution({
    team,
    profile,
    state,
    maxSubstitutions: config.maxSubstitutions
  });
  if (!proposal) return;
  const slotIndex = team.lineup.startingXI.findIndex((id) => id === proposal.playerOutId);
  if (slotIndex < 0) return;
  team.lineup.startingXI[slotIndex] = proposal.playerInId;
  team.lineup.bench = team.lineup.bench.filter((id) => id !== proposal.playerInId);
  team.lineup.bench.push(proposal.playerOutId);
  state.substitutionsUsed[side] += 1;
  const playerOut = team.players.find((player) => player.id === proposal.playerOutId);
  const playerIn = team.players.find((player) => player.id === proposal.playerInId);
  state.events.push({
    id: `cupv2_substitution_${state.second}_${proposal.playerOutId}`,
    second: state.second,
    minute: minute + 1,
    side,
    type: "SUBSTITUTION" /* SUBSTITUTION */,
    playerId: proposal.playerInId,
    secondaryPlayerId: proposal.playerOutId,
    text: `${team.name} dokonuje zmiany: ${playerIn?.lastName ?? "rezerwowy"} za ${playerOut?.lastName ?? "zawodnika"}.`,
    detail: {
      reason: proposal.reason,
      substitutionsUsed: state.substitutionsUsed[side]
    }
  });
};
var CupMatchLoop = {
  /**
   * Główna pętla V2. Każdy przebieg reprezentuje kilka sekund meczu.
   * Warstwa nie generuje wyniku z góry: wynik jest skutkiem zdarzeń dodanych
   * przez CupActionBuilder oraz późniejsze moduły dogrywki/karnych.
   */
  runPeriod: (input, state, periodEndSecond, config = { ...DEFAULT_CUP_ENGINE_CONFIG, ...input.config }) => {
    while (state.second < periodEndSecond && state.phase !== "FINISHED" && state.phase !== "PENALTY_SHOOTOUT") {
      const homeProfile = CupTeamProfileService.buildProfile(input.home, state.fatigue, state.redCards, state.injuries);
      const awayProfile = CupTeamProfileService.buildProfile(input.away, state.fatigue, state.redCards, state.injuries);
      const random = (salt) => seededRandom(input.seed, state.second, salt);
      state.pressure.HOME = CupMomentumService.pressureForSide(state, state.homeScore, state.awayScore, homeProfile);
      state.pressure.AWAY = CupMomentumService.pressureForSide(state, state.awayScore, state.homeScore, awayProfile);
      updateOrganization(state, input, homeProfile, awayProfile);
      const outcome = CupActionBuilder.simulateTick({
        input,
        config,
        state,
        homeProfile,
        awayProfile,
        random
      });
      outcome.events.forEach((event) => {
        applyEventToState(state, event.type, event.side);
        applyPlayerEventToState(state, event.type, event.playerId);
        state.events.push(event);
      });
      state.momentum = CupMomentumService.updateMomentum(state, homeProfile, awayProfile, outcome.momentumDelta);
      if (outcome.nextPossession) state.possession = outcome.nextPossession;
      if (outcome.nextZone) state.ballZone = outcome.nextZone;
      updateFatigue(state, input, config);
      maybeExecuteSubstitution(input, state, "HOME", homeProfile, config);
      maybeExecuteSubstitution(input, state, "AWAY", awayProfile, config);
      state.second += config.tickSeconds;
    }
    return state;
  }
};

// services/match/engines/cupV2/CupMatchEngineV2.ts
var cloneTeam = (team) => ({
  ...team,
  lineup: {
    ...team.lineup,
    startingXI: [...team.lineup.startingXI],
    bench: [...team.lineup.bench],
    reserves: [...team.lineup.reserves]
  },
  instructions: { ...team.instructions }
});
var cloneInput = (input) => ({
  ...input,
  home: cloneTeam(input.home),
  away: cloneTeam(input.away),
  environment: { ...input.environment },
  config: input.config ? { ...input.config } : void 0,
  halfTimeTalks: input.halfTimeTalks ? { ...input.halfTimeTalks } : void 0,
  substitutionPolicy: input.substitutionPolicy ? { ...input.substitutionPolicy } : void 0
});
var activePlayers3 = (team) => {
  const byId2 = new Map(team.players.map((player) => [player.id, player]));
  return team.lineup.startingXI.map((id) => id ? byId2.get(id) : void 0).filter((player) => Boolean(player));
};
var teamMentalReceptivity = (team) => {
  const players = activePlayers3(team);
  if (players.length === 0) return 1;
  const mentalAverage = players.reduce((sum, player) => sum + weightedScore(player.attributes, {
    mentality: 0.42,
    leadership: 0.24,
    workRate: 0.16,
    stamina: 0.1,
    positioning: 0.08
  }), 0) / players.length;
  return clamp(0.82 + (mentalAverage - 50) * 6e-3, 0.72, 1.18);
};
var talkBaseImpact = (talk, scoreDiff) => {
  const intensity = clamp(talk.intensity ?? 0.65, 0, 1);
  const clarity = clamp(talk.clarity ?? 0.6, 0, 1);
  if (talk.style === "NONE") return { motivation: 0, organization: 0, fatigueRelief: 0, momentum: 0 };
  if (talk.style === "CALM") return { motivation: 2.5 + clarity * 1.5, organization: 4 + clarity * 4, fatigueRelief: 0.8, momentum: 1.5 };
  if (talk.style === "ENCOURAGE") return { motivation: 5 + intensity * 3, organization: 1.5 + clarity * 2, fatigueRelief: 0.6, momentum: 4 };
  if (talk.style === "DEMAND_MORE") {
    const trailingBonus = scoreDiff <= 0 ? 3 : 0;
    return { motivation: 4 + intensity * 5 + trailingBonus, organization: -2 + clarity * 3, fatigueRelief: -0.6, momentum: 5 };
  }
  if (talk.style === "PRAISE") {
    const leadingBonus = scoreDiff > 0 ? 3 : -1;
    return { motivation: 3 + leadingBonus + intensity * 2, organization: 1 + clarity * 2, fatigueRelief: 0.4, momentum: 2.5 };
  }
  return { motivation: 3 + clarity * 4, organization: 5 + clarity * 5, fatigueRelief: 0.3, momentum: 2 };
};
var applyHalfTimeTalk = (input, state) => {
  const talks = input.halfTimeTalks;
  if (!talks) return;
  ["HOME", "AWAY"].forEach((side) => {
    const talk = talks[side];
    if (!talk || talk.style === "NONE") return;
    const team = side === "HOME" ? input.home : input.away;
    const scoreDiff = side === "HOME" ? state.homeScore - state.awayScore : state.awayScore - state.homeScore;
    const receptivity = teamMentalReceptivity(team);
    const impact = talkBaseImpact(talk, scoreDiff);
    const motivationDelta = impact.motivation * receptivity;
    const organizationDelta = impact.organization * receptivity;
    const momentumDelta = impact.momentum * receptivity;
    team.preMatchMotivation = clamp(team.preMatchMotivation + motivationDelta, 0, 100);
    team.morale = clamp(team.morale + motivationDelta * 0.38, 0, 100);
    if (talk.style === "TACTICAL_RESET") {
      team.instructions.tempoResponseFactor = clamp(team.instructions.tempoResponseFactor + 0.08, 0.5, 1.4);
      team.instructions.mindsetResponseFactor = clamp(team.instructions.mindsetResponseFactor + 0.08, 0.5, 1.4);
      team.instructions.pressingResponseFactor = clamp(team.instructions.pressingResponseFactor + 0.05, 0.5, 1.4);
      team.instructions.markingResponseFactor = clamp((team.instructions.markingResponseFactor ?? 1) + 0.08, 0.5, 1.4);
    }
    activePlayers3(team).forEach((player) => {
      state.fatigue[player.id] = clamp((state.fatigue[player.id] ?? player.condition) + impact.fatigueRelief * receptivity, 15, 100);
    });
    state.organization[side] = clamp(state.organization[side] + organizationDelta, 30, 95);
    state.momentum = clamp(state.momentum + (side === "HOME" ? momentumDelta : -momentumDelta), -100, 100);
  });
};
var CupMatchEngineV2 = {
  /**
   * Publiczne wejście silnika. Na tym etapie moduł jest przeznaczony do
   * symulacji, testów balansu i późniejszego podłączenia do widoku Pucharu
   * Polski. Nie modyfikuje istniejącego silnika live.
   */
  simulate: (input) => {
    const runtimeInput = cloneInput(input);
    const initialLineups = {
      HOME: [...runtimeInput.home.lineup.startingXI],
      AWAY: [...runtimeInput.away.lineup.startingXI]
    };
    const config = { ...DEFAULT_CUP_ENGINE_CONFIG, ...runtimeInput.config };
    const state = createInitialCupRuntimeState(runtimeInput);
    state.phase = "FIRST_HALF";
    CupMatchLoop.runPeriod(runtimeInput, state, 45 * 60, config);
    applyHalfTimeTalk(runtimeInput, state);
    state.phase = "SECOND_HALF";
    CupMatchLoop.runPeriod(runtimeInput, state, config.normalTimeSeconds + state.addedTimeSeconds, config);
    if (state.homeScore === state.awayScore && config.enableExtraTime) {
      state.phase = "EXTRA_TIME_1";
      CupMatchLoop.runPeriod(runtimeInput, state, config.normalTimeSeconds + 15 * 60, config);
      state.phase = "EXTRA_TIME_2";
      CupMatchLoop.runPeriod(runtimeInput, state, config.normalTimeSeconds + config.extraTimeSeconds, config);
    }
    let decidedByPenalties = false;
    let penaltyScore;
    let penaltyShootout = void 0;
    let winner = state.homeScore > state.awayScore ? "HOME" : state.awayScore > state.homeScore ? "AWAY" : void 0;
    if (!winner && config.enablePenaltyShootout) {
      state.phase = "PENALTY_SHOOTOUT";
      const penalties = CupPenaltyShootoutService.simulate(runtimeInput, state.fatigue, {
        redCards: state.redCards,
        injuries: state.injuries,
        startSecond: state.second
      });
      decidedByPenalties = true;
      penaltyScore = { home: penalties.home, away: penalties.away };
      penaltyShootout = penalties.attempts;
      state.events.push(...penalties.events);
      winner = penalties.winner;
    }
    state.phase = "FINISHED";
    const playerStats = CupPlayerStatsAggregator.aggregate({
      match: runtimeInput,
      events: state.events,
      finalSecond: state.second,
      homeScore: state.homeScore,
      awayScore: state.awayScore,
      initialLineups,
      finalFatigue: state.fatigue,
      teamStats: state.stats
    });
    return {
      homeScore: state.homeScore,
      awayScore: state.awayScore,
      winner,
      decidedByPenalties,
      penaltyScore,
      penaltyShootout,
      stats: state.stats,
      playerStats,
      events: state.events,
      finalState: state
    };
  },
  /**
   * Wejście dla widoku na żywo: mecz nie jest liczony z góry w całości.
   * `createLiveMatch` tylko przygotowuje stan startowy (minuta 0). Kolejne
   * minuty dolicza `advanceLiveMatch`, wywoływane przez zegar UI.
   */
  createLiveMatch: (input) => {
    const runtimeInput = cloneInput(input);
    const initialLineups = {
      HOME: [...runtimeInput.home.lineup.startingXI],
      AWAY: [...runtimeInput.away.lineup.startingXI]
    };
    const initialBench = {
      HOME: [...runtimeInput.home.lineup.bench],
      AWAY: [...runtimeInput.away.lineup.bench]
    };
    const config = { ...DEFAULT_CUP_ENGINE_CONFIG, ...runtimeInput.config };
    const state = createInitialCupRuntimeState(runtimeInput);
    state.phase = "FIRST_HALF";
    return { input: runtimeInput, state, config, initialLineups, initialBench };
  },
  /**
   * Dolicza mecz do `targetSecond`. Zwraca `null`, jeśli mecz jeszcze trwa
   * (jeszcze nie dotarł do przerwy/końca/dogrywki w tym wywołaniu) — wtedy
   * `live.state` jest już zaktualizowany do najdalej osiągniętej sekundy.
   * Zwraca `CupMatchResult`, gdy mecz faktycznie się zakończył (łącznie z
   * ewentualnymi karnymi). Zmiana `live.input.home/away.instructions` albo
   * `.lineup` między wywołaniami wpływa tylko na kolejne, jeszcze
   * nierozegrane sekundy — to, co już jest w `live.state.events`, zostaje.
   */
  advanceLiveMatch: (live, targetSecond) => {
    const { input, state, config } = live;
    if (state.phase === "FIRST_HALF") {
      CupMatchLoop.runPeriod(input, state, Math.min(targetSecond, 45 * 60), config);
      if (state.second < 45 * 60) return null;
      applyHalfTimeTalk(input, state);
      state.phase = "SECOND_HALF";
    }
    if (state.phase === "SECOND_HALF") {
      const secondHalfEnd = config.normalTimeSeconds + state.addedTimeSeconds;
      CupMatchLoop.runPeriod(input, state, Math.min(targetSecond, secondHalfEnd), config);
      if (state.second < secondHalfEnd) return null;
      if (state.homeScore === state.awayScore && config.enableExtraTime) {
        state.phase = "EXTRA_TIME_1";
      } else {
        return CupMatchEngineV2.finalizeLiveMatch(live);
      }
    }
    if (state.phase === "EXTRA_TIME_1") {
      const extraTime1End = config.normalTimeSeconds + 15 * 60;
      CupMatchLoop.runPeriod(input, state, Math.min(targetSecond, extraTime1End), config);
      if (state.second < extraTime1End) return null;
      state.phase = "EXTRA_TIME_2";
    }
    if (state.phase === "EXTRA_TIME_2") {
      const extraTime2End = config.normalTimeSeconds + config.extraTimeSeconds;
      CupMatchLoop.runPeriod(input, state, Math.min(targetSecond, extraTime2End), config);
      if (state.second < extraTime2End) return null;
      return CupMatchEngineV2.finalizeLiveMatch(live);
    }
    return null;
  },
  /**
   * Buduje "wynik na teraz" z meczu, który jeszcze trwa — bez karnych, bez
   * ustalonego zwycięzcy. Używane przez UI do pokazania ocen/statystyk na
   * bieżącą minutę, bez zaglądania w przyszłość meczu.
   */
  snapshotLiveMatch: (live) => {
    const { input, state, initialLineups } = live;
    const playerStats = CupPlayerStatsAggregator.aggregate({
      match: input,
      events: state.events,
      finalSecond: state.second,
      homeScore: state.homeScore,
      awayScore: state.awayScore,
      initialLineups,
      finalFatigue: state.fatigue,
      teamStats: state.stats
    });
    return {
      homeScore: state.homeScore,
      awayScore: state.awayScore,
      winner: void 0,
      decidedByPenalties: false,
      stats: state.stats,
      playerStats,
      events: state.events,
      finalState: state
    };
  },
  finalizeLiveMatch: (live) => {
    const { input, state, initialLineups } = live;
    let decidedByPenalties = false;
    let penaltyScore;
    let penaltyShootout = void 0;
    let winner = state.homeScore > state.awayScore ? "HOME" : state.awayScore > state.homeScore ? "AWAY" : void 0;
    if (!winner && live.config.enablePenaltyShootout) {
      state.phase = "PENALTY_SHOOTOUT";
      const penalties = CupPenaltyShootoutService.simulate(input, state.fatigue, {
        redCards: state.redCards,
        injuries: state.injuries,
        startSecond: state.second
      });
      decidedByPenalties = true;
      penaltyScore = { home: penalties.home, away: penalties.away };
      penaltyShootout = penalties.attempts;
      state.events.push(...penalties.events);
      winner = penalties.winner;
    }
    state.phase = "FINISHED";
    const playerStats = CupPlayerStatsAggregator.aggregate({
      match: input,
      events: state.events,
      finalSecond: state.second,
      homeScore: state.homeScore,
      awayScore: state.awayScore,
      initialLineups,
      finalFatigue: state.fatigue,
      teamStats: state.stats
    });
    return {
      homeScore: state.homeScore,
      awayScore: state.awayScore,
      winner,
      decidedByPenalties,
      penaltyScore,
      penaltyShootout,
      stats: state.stats,
      playerStats,
      events: state.events,
      finalState: state
    };
  },
  /**
   * Wprowadza ręczną zmianę zawodnika w meczu na żywo: podmienia skład,
   * dopisuje zdarzenie ZMIANY (żeby licznik minut/ticker/oceny to widziały)
   * i zwiększa licznik wykorzystanych zmian danej strony.
   */
  applyManualSubstitution: (live, side, playerOutId, playerInId) => {
    const team = side === "HOME" ? live.input.home : live.input.away;
    const slotIndex = team.lineup.startingXI.findIndex((id) => id === playerOutId);
    if (slotIndex < 0 || !team.lineup.bench.includes(playerInId)) return false;
    if (live.state.redCards[playerOutId]) return false;
    const alreadyLeftPitch = live.state.events.some(
      (event) => event.type === "SUBSTITUTION" /* SUBSTITUTION */ && event.secondaryPlayerId === playerInId
    );
    if (alreadyLeftPitch) return false;
    team.lineup.startingXI[slotIndex] = playerInId;
    team.lineup.bench = team.lineup.bench.filter((id) => id !== playerInId);
    team.lineup.bench.push(playerOutId);
    live.state.substitutionsUsed[side] += 1;
    const playerOut = team.players.find((player) => player.id === playerOutId);
    const playerIn = team.players.find((player) => player.id === playerInId);
    const minute = Math.floor(live.state.second / 60);
    live.state.events.push({
      id: `cupv2_manual_substitution_${live.state.second}_${playerOutId}`,
      second: live.state.second,
      minute: minute + 1,
      side,
      type: "SUBSTITUTION" /* SUBSTITUTION */,
      playerId: playerInId,
      secondaryPlayerId: playerOutId,
      text: `${team.name} dokonuje zmiany: ${playerIn?.lastName ?? "rezerwowy"} za ${playerOut?.lastName ?? "zawodnika"}.`,
      detail: {
        reason: "TACTICAL",
        substitutionsUsed: live.state.substitutionsUsed[side]
      }
    });
    return true;
  }
};

// services/match/engines/cupV2/CupSampleMatchFactory.ts
var ATTRIBUTE_KEYS = [
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
var DEFAULT_INSTRUCTIONS = {
  tempo: "NORMAL",
  mindset: "NEUTRAL",
  intensity: "NORMAL",
  passing: "MIXED",
  pressing: "NORMAL",
  counterAttack: "NORMAL",
  marking: "ZONE",
  lastChangeMinute: 0,
  expiryMinute: -1,
  tempoExpiry: -1,
  mindsetExpiry: -1,
  intensityExpiry: -1,
  tempoCooldown: -1,
  mindsetCooldown: -1,
  intensityCooldown: -1,
  passingCooldown: -1,
  pressingCooldown: -1,
  counterAttackCooldown: -1,
  markingCooldown: -1,
  tempoResponseFactor: 1,
  mindsetResponseFactor: 1,
  intensityResponseFactor: 1,
  passingResponseFactor: 1,
  pressingResponseFactor: 1,
  counterAttackResponseFactor: 1,
  markingResponseFactor: 1
};
var makeTactic = (id, style) => {
  const attackBias = style === "ATTACK" ? 68 : style === "DEFENSE" ? 42 : style === "DIRECT" ? 58 : 54;
  const defenseBias = style === "DEFENSE" ? 70 : style === "ATTACK" ? 44 : style === "DIRECT" ? 50 : 56;
  const pressingIntensity = style === "ATTACK" ? 66 : style === "DEFENSE" ? 42 : style === "DIRECT" ? 55 : 52;
  return {
    id,
    name: `Cup V2 ${style}`,
    category: "cupV2-calibration",
    attackBias,
    defenseBias,
    pressingIntensity,
    slots: [
      { index: 0, role: "GK" /* GK */, x: 50, y: 8 },
      { index: 1, role: "DEF" /* DEF */, x: 18, y: 28 },
      { index: 2, role: "DEF" /* DEF */, x: 38, y: 25 },
      { index: 3, role: "DEF" /* DEF */, x: 62, y: 25 },
      { index: 4, role: "DEF" /* DEF */, x: 82, y: 28 },
      { index: 5, role: "MID" /* MID */, x: 34, y: 50 },
      { index: 6, role: "MID" /* MID */, x: 66, y: 50 },
      { index: 7, role: "MID" /* MID */, x: 22, y: 66 },
      { index: 8, role: "MID" /* MID */, x: 78, y: 66 },
      { index: 9, role: "FWD" /* FWD */, x: 42, y: 82 },
      { index: 10, role: "FWD" /* FWD */, x: 58, y: 84 }
    ]
  };
};
var positionBoosts = {
  ["GK" /* GK */]: { goalkeeping: 14, positioning: 8, mentality: 5, passing: 2 },
  ["DEF" /* DEF */]: { defending: 11, positioning: 8, heading: 6, strength: 5, aggression: 3 },
  ["MID" /* MID */]: { passing: 9, vision: 7, technique: 7, stamina: 5, workRate: 5 },
  ["FWD" /* FWD */]: { finishing: 11, attacking: 9, pace: 5, dribbling: 4, technique: 4 }
};
var makeAttributes = (seed, position, quality) => {
  const attrs = {};
  ATTRIBUTE_KEYS.forEach((key, index) => {
    const spread = (seededRandom(seed, index, 4) - 0.5) * 16;
    const positional = positionBoosts[position][key] ?? 0;
    attrs[key] = Math.round(clamp(quality + spread + positional, 18, 95));
  });
  if (position !== "GK" /* GK */) {
    attrs.goalkeeping = Math.round(12 + seededRandom(seed, 44, 7) * 20);
  }
  return attrs;
};
var calculateOverall = (position, attrs) => {
  const keysByPosition = {
    ["GK" /* GK */]: ["goalkeeping", "positioning", "mentality", "strength"],
    ["DEF" /* DEF */]: ["defending", "positioning", "heading", "strength", "pace"],
    ["MID" /* MID */]: ["passing", "vision", "technique", "stamina", "workRate"],
    ["FWD" /* FWD */]: ["finishing", "attacking", "pace", "technique", "positioning"]
  };
  const keys = keysByPosition[position];
  return Math.round(keys.reduce((sum, key) => sum + attrs[key], 0) / keys.length);
};
var makePlayer = (prefix, index, position, quality) => {
  const id = `${prefix}_${position}_${index}`;
  const attrs = makeAttributes(id, position, quality.base);
  const overallRating = calculateOverall(position, attrs);
  return {
    id,
    firstName: "Test",
    lastName: `${prefix}${index}`,
    age: 20 + Math.floor(seededRandom(id, 9, 9) * 15),
    clubId: prefix,
    nationality: "POLAND" /* POLAND */,
    position,
    overallRating,
    attributes: attrs,
    stats: {
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
      matchesPlayed: 12,
      minutesPlayed: 820,
      seasonalChanges: {},
      ratingHistory: [6.4, 6.6, 6.7, 6.5, 6.8]
    },
    health: { status: "HEALTHY" /* HEALTHY */ },
    condition: Math.round(clamp(quality.condition + (seededRandom(id, 10, 10) - 0.5) * 9, 55, 100)),
    suspensionMatches: 0,
    contractEndDate: "2028-06-30",
    annualSalary: 12e4,
    history: [],
    boardLockoutUntil: null,
    isUntouchable: false,
    negotiationStep: 0,
    negotiationLockoutUntil: null,
    contractLockoutUntil: null,
    fatigueDebt: 0,
    form: Math.round(clamp(50 + (seededRandom(id, 11, 11) - 0.5) * 24, 25, 85)),
    morale: quality.morale,
    isNegotiationPermanentBlocked: false,
    transferLockoutUntil: null,
    freeAgentLockoutUntil: null
  };
};
var makeSquad = (prefix, quality) => {
  const positions = [
    "GK" /* GK */,
    "GK" /* GK */,
    "DEF" /* DEF */,
    "DEF" /* DEF */,
    "DEF" /* DEF */,
    "DEF" /* DEF */,
    "DEF" /* DEF */,
    "MID" /* MID */,
    "MID" /* MID */,
    "MID" /* MID */,
    "MID" /* MID */,
    "MID" /* MID */,
    "FWD" /* FWD */,
    "FWD" /* FWD */,
    "FWD" /* FWD */,
    "FWD" /* FWD */
  ];
  return positions.map((position, index) => makePlayer(prefix, index, position, quality));
};
var buildLineup = (players, clubId, tacticId) => {
  const used = /* @__PURE__ */ new Set();
  const take = (position) => {
    const player = players.filter((candidate) => candidate.position === position && !used.has(candidate.id)).sort((a, b) => b.overallRating - a.overallRating)[0];
    if (!player) return null;
    used.add(player.id);
    return player.id;
  };
  const startingXI = [
    take("GK" /* GK */),
    take("DEF" /* DEF */),
    take("DEF" /* DEF */),
    take("DEF" /* DEF */),
    take("DEF" /* DEF */),
    take("MID" /* MID */),
    take("MID" /* MID */),
    take("MID" /* MID */),
    take("MID" /* MID */),
    take("FWD" /* FWD */),
    take("FWD" /* FWD */)
  ];
  return {
    clubId,
    tacticId,
    startingXI,
    bench: players.filter((player) => !used.has(player.id)).map((player) => player.id),
    reserves: []
  };
};
var makeReferee = (seed) => ({
  id: `cupv2_ref_${seed}`,
  firstName: "Arbiter",
  lastName: seed,
  age: 38,
  nationality: "POLAND" /* POLAND */,
  strictness: Math.round(35 + seededRandom(seed, 1, 40) * 45),
  consistency: Math.round(50 + seededRandom(seed, 2, 41) * 40),
  advantageTendency: Math.round(25 + seededRandom(seed, 3, 42) * 55),
  matchRatings: [],
  totalYellowCardsShown: 0,
  totalRedCardsShown: 0,
  experience: Math.round(45 + seededRandom(seed, 4, 43) * 45),
  isInternational: false
});
var makeTeam = ({
  side,
  prefix,
  name,
  quality,
  tactic,
  instructions,
  stadiumSupport
}) => {
  const players = makeSquad(prefix, quality);
  return {
    side,
    clubId: prefix,
    name,
    players,
    lineup: buildLineup(players, prefix, tactic.id),
    tactic,
    instructions,
    morale: quality.morale,
    preMatchMotivation: quality.motivation,
    stadiumSupport
  };
};
var scenarioQuality = (scenario, index) => {
  const smallSwing = (seededRandom(scenario, index, 88) - 0.5) * 3;
  if (scenario === "HOME_FAVORITE") {
    return {
      home: { base: 70 + smallSwing, morale: 62, condition: 93, motivation: 63 },
      away: { base: 65.5 - smallSwing, morale: 52, condition: 90, motivation: 58 }
    };
  }
  if (scenario === "AWAY_FAVORITE") {
    return {
      home: { base: 65.5 + smallSwing, morale: 55, condition: 91, motivation: 62 },
      away: { base: 70 - smallSwing, morale: 61, condition: 92, motivation: 60 }
    };
  }
  if (scenario === "LOWER_LEAGUE_HOME") {
    return {
      home: { base: 62.5 + smallSwing, morale: 68, condition: 94, motivation: 74 },
      away: { base: 67.5 - smallSwing, morale: 58, condition: 90, motivation: 56 }
    };
  }
  if (scenario === "FINAL_NEUTRAL") {
    return {
      home: { base: 72 + smallSwing, morale: 60, condition: 91, motivation: 68 },
      away: { base: 71 - smallSwing, morale: 60, condition: 91, motivation: 68 }
    };
  }
  return {
    home: { base: 67 + smallSwing, morale: 58, condition: 92, motivation: 60 },
    away: { base: 67 - smallSwing, morale: 58, condition: 92, motivation: 60 }
  };
};
var expectedFavoriteForScenario = (scenario) => {
  if (scenario === "HOME_FAVORITE") return "HOME";
  if (scenario === "AWAY_FAVORITE" || scenario === "LOWER_LEAGUE_HOME") return "AWAY";
  return void 0;
};
var scenarioInstructions = (scenario) => {
  if (scenario === "LOWER_LEAGUE_HOME") {
    return {
      home: { ...DEFAULT_INSTRUCTIONS, mindset: "DEFENSIVE", passing: "LONG", counterAttack: "COUNTER" },
      away: { ...DEFAULT_INSTRUCTIONS, mindset: "OFFENSIVE", tempo: "FAST", pressing: "PRESSING" },
      homeStyle: "DIRECT",
      awayStyle: "ATTACK"
    };
  }
  if (scenario === "HOME_FAVORITE") {
    return {
      home: { ...DEFAULT_INSTRUCTIONS, mindset: "OFFENSIVE", tempo: "FAST", pressing: "PRESSING" },
      away: { ...DEFAULT_INSTRUCTIONS, mindset: "DEFENSIVE", counterAttack: "COUNTER" },
      homeStyle: "ATTACK",
      awayStyle: "DEFENSE"
    };
  }
  if (scenario === "AWAY_FAVORITE") {
    return {
      home: { ...DEFAULT_INSTRUCTIONS, mindset: "DEFENSIVE", counterAttack: "COUNTER" },
      away: { ...DEFAULT_INSTRUCTIONS, mindset: "OFFENSIVE", tempo: "FAST", pressing: "PRESSING" },
      homeStyle: "DEFENSE",
      awayStyle: "ATTACK"
    };
  }
  return {
    home: DEFAULT_INSTRUCTIONS,
    away: DEFAULT_INSTRUCTIONS,
    homeStyle: "BALANCED",
    awayStyle: "BALANCED"
  };
};
var stadiumSupportForScenario = (scenario) => {
  if (scenario === "FINAL_NEUTRAL") return { home: 50, away: 50 };
  if (scenario === "LOWER_LEAGUE_HOME") return { home: 61, away: 39 };
  return { home: 52, away: 48 };
};
var CupSampleMatchFactory = {
  scenarios: ["EQUAL", "HOME_FAVORITE", "AWAY_FAVORITE", "LOWER_LEAGUE_HOME", "FINAL_NEUTRAL"],
  makeInput: (index, scenario) => {
    const seed = `cupv2_balance_${scenario}_${index}`;
    const quality = scenarioQuality(scenario, index);
    const instructions = scenarioInstructions(scenario);
    const stadiumSupport = stadiumSupportForScenario(scenario);
    return {
      seed,
      home: makeTeam({
        side: "HOME",
        prefix: `HOME_${scenario}_${index}`,
        name: `Gospodarze ${scenario}`,
        quality: quality.home,
        tactic: makeTactic(`home_${scenario}_${index}`, instructions.homeStyle),
        instructions: instructions.home,
        stadiumSupport: stadiumSupport.home
      }),
      away: makeTeam({
        side: "AWAY",
        prefix: `AWAY_${scenario}_${index}`,
        name: `Go\u015Bcie ${scenario}`,
        quality: quality.away,
        tactic: makeTactic(`away_${scenario}_${index}`, instructions.awayStyle),
        instructions: instructions.away,
        stadiumSupport: stadiumSupport.away
      }),
      environment: {
        pitchQuality: Math.round(68 + seededRandom(seed, 7, 90) * 28),
        stadiumCapacity: scenario === "FINAL_NEUTRAL" ? 56e3 : 9e3 + Math.round(seededRandom(seed, 8, 91) * 23e3),
        attendance: scenario === "FINAL_NEUTRAL" ? 48e3 : 5e3 + Math.round(seededRandom(seed, 9, 92) * 18e3),
        referee: makeReferee(seed),
        weather: {
          tempC: Math.round(4 + seededRandom(seed, 10, 93) * 20),
          precipitationChance: Math.round(seededRandom(seed, 11, 94) * 70),
          windKmh: Math.round(seededRandom(seed, 12, 95) * 32),
          description: "Warunki testowe",
          weatherIntensity: seededRandom(seed, 13, 96) * 0.65
        }
      },
      config: {
        calibrationMode: true,
        enableExtraTime: true,
        enablePenaltyShootout: true
      },
      calibration: {
        scenario,
        homeQuality: quality.home.base,
        awayQuality: quality.away.base,
        expectedFavorite: expectedFavoriteForScenario(scenario)
      }
    };
  },
  makeBatch: (matchesPerScenario) => CupSampleMatchFactory.scenarios.flatMap(
    (scenario) => Array.from(
      { length: matchesPerScenario },
      (_, index) => CupSampleMatchFactory.makeInput(index, scenario)
    )
  )
};

// tests/CupPlayerStatsAggregatorTests.ts
var sample = CupSampleMatchFactory.makeInput(21, "EQUAL");
var byId = (team) => new Map(team.players.map((player) => [player.id, player]));
var playerFromLineup = (team, position) => {
  const players = byId(team);
  const player = team.lineup.startingXI.map((id) => id ? players.get(id) : void 0).find((item) => item?.position === position);
  import_strict.default.ok(player, `Missing ${position} player in sample lineup`);
  return player;
};
var benchPlayer = (team) => {
  const players = byId(team);
  const player = team.lineup.bench.map((id) => players.get(id)).find(Boolean);
  import_strict.default.ok(player, "Missing bench player in sample team");
  return player;
};
var homeScorer = playerFromLineup(sample.home, "FWD" /* FWD */);
var homeCreator = playerFromLineup(sample.home, "MID" /* MID */);
var homeKeeper = playerFromLineup(sample.home, "GK" /* GK */);
var homeSub = benchPlayer(sample.home);
var awayAttacker = playerFromLineup(sample.away, "FWD" /* FWD */);
var awayKeeper = playerFromLineup(sample.away, "GK" /* GK */);
var awayOwnGoalDefender = playerFromLineup(sample.away, "DEF" /* DEF */);
var awayCardedDefender = sample.away.players.find(
  (player) => sample.away.lineup.startingXI.includes(player.id) && player.position === "DEF" /* DEF */ && player.id !== awayOwnGoalDefender.id
);
import_strict.default.ok(awayCardedDefender, "Missing second away defender in sample lineup");
var events = [
  {
    id: "shot_off_1",
    second: 300,
    minute: 5,
    side: "HOME",
    type: "SHOT" /* SHOT */,
    playerId: homeScorer.id,
    secondaryPlayerId: homeCreator.id,
    text: "Shot off target",
    xG: 0.05
  },
  {
    id: "shot_on_1",
    second: 600,
    minute: 10,
    side: "HOME",
    type: "SHOT_ON_TARGET" /* SHOT_ON_TARGET */,
    playerId: homeScorer.id,
    secondaryPlayerId: homeCreator.id,
    text: "Shot on target",
    xG: 0.09
  },
  {
    id: "goal_1",
    second: 1200,
    minute: 20,
    side: "HOME",
    type: "GOAL" /* GOAL */,
    playerId: homeScorer.id,
    secondaryPlayerId: homeCreator.id,
    text: "Goal with assist",
    xG: 0.25,
    detail: { assistEligible: true }
  },
  {
    id: "save_1",
    second: 1800,
    minute: 30,
    side: "AWAY",
    type: "SAVE" /* SAVE */,
    playerId: awayAttacker.id,
    text: "Keeper save",
    xG: 0.14
  },
  {
    id: "post_1",
    second: 2400,
    minute: 40,
    side: "HOME",
    type: "SHOT_POST" /* SHOT_POST */,
    playerId: homeScorer.id,
    text: "Post",
    xG: 0.07
  },
  {
    id: "offside_1",
    second: 3e3,
    minute: 50,
    side: "HOME",
    type: "OFFSIDE" /* OFFSIDE */,
    playerId: homeScorer.id,
    text: "Offside"
  },
  {
    id: "yellow_1",
    second: 3300,
    minute: 55,
    side: "HOME",
    type: "YELLOW_CARD" /* YELLOW_CARD */,
    playerId: homeScorer.id,
    secondaryPlayerId: awayAttacker.id,
    text: "Yellow card"
  },
  {
    id: "sub_1",
    second: 3600,
    minute: 60,
    side: "HOME",
    type: "SUBSTITUTION" /* SUBSTITUTION */,
    playerId: homeSub.id,
    secondaryPlayerId: homeScorer.id,
    text: "Substitution"
  },
  {
    id: "injury_1",
    second: 4200,
    minute: 70,
    side: "AWAY",
    type: "INJURY_SEVERE" /* INJURY_SEVERE */,
    playerId: awayAttacker.id,
    text: "Severe injury"
  },
  {
    id: "own_goal_1",
    second: 4800,
    minute: 80,
    side: "HOME",
    type: "GOAL" /* GOAL */,
    playerId: awayOwnGoalDefender.id,
    text: "Own goal",
    xG: 0.1,
    detail: {
      assistEligible: false,
      isOwnGoal: true,
      ownGoalPlayerId: awayOwnGoalDefender.id
    }
  },
  {
    id: "red_1",
    second: 5e3,
    minute: 84,
    side: "AWAY",
    type: "RED_CARD" /* RED_CARD */,
    playerId: awayCardedDefender.id,
    secondaryPlayerId: homeSub.id,
    text: "Red card"
  },
  {
    id: "penalty_goal_1",
    second: 5100,
    minute: 85,
    side: "AWAY",
    type: "PENALTY_SCORED" /* PENALTY_SCORED */,
    playerId: awayAttacker.id,
    text: "Penalty scored",
    xG: 0.76,
    detail: { assistEligible: false }
  },
  {
    id: "penalty_miss_1",
    second: 5300,
    minute: 89,
    side: "HOME",
    type: "PENALTY_MISSED" /* PENALTY_MISSED */,
    playerId: homeSub.id,
    text: "Penalty missed",
    xG: 0.76
  }
];
var stats = CupPlayerStatsAggregator.aggregate({
  match: sample,
  events,
  finalSecond: 90 * 60,
  homeScore: 2,
  awayScore: 1,
  initialLineups: {
    HOME: [...sample.home.lineup.startingXI],
    AWAY: [...sample.away.lineup.startingXI]
  }
});
var scorerStats = stats.HOME[homeScorer.id];
import_strict.default.equal(scorerStats.starter, true);
import_strict.default.equal(scorerStats.minutesPlayed, 60);
import_strict.default.equal(scorerStats.substitutionsOff, 1);
import_strict.default.equal(scorerStats.goals, 1);
import_strict.default.equal(scorerStats.assists, 0);
import_strict.default.equal(scorerStats.shots, 4);
import_strict.default.equal(scorerStats.shotsOnTarget, 2);
import_strict.default.equal(scorerStats.shotsOffTarget, 2);
import_strict.default.equal(scorerStats.posts, 1);
import_strict.default.equal(scorerStats.offsides, 1);
import_strict.default.equal(scorerStats.yellowCards, 1);
import_strict.default.equal(scorerStats.foulsCommitted, 1);
import_strict.default.equal(scorerStats.xG, 0.46);
var creatorStats = stats.HOME[homeCreator.id];
import_strict.default.equal(creatorStats.assists, 1);
import_strict.default.equal(creatorStats.chancesCreated, 3);
import_strict.default.equal(creatorStats.keyPasses, 2);
var subStats = stats.HOME[homeSub.id];
import_strict.default.equal(subStats.starter, false);
import_strict.default.equal(subStats.substitutionsOn, 1);
import_strict.default.equal(subStats.minutesPlayed, 30);
import_strict.default.equal(subStats.foulsWon, 1);
import_strict.default.equal(subStats.penaltiesTaken, 1);
import_strict.default.equal(subStats.penaltiesMissed, 1);
import_strict.default.equal(subStats.shots, 1);
import_strict.default.equal(subStats.shotsOffTarget, 1);
var homeKeeperStats = stats.HOME[homeKeeper.id];
import_strict.default.equal(homeKeeperStats.saves, 1);
import_strict.default.equal(homeKeeperStats.goalsConceded, 1);
var awayAttackerStats = stats.AWAY[awayAttacker.id];
import_strict.default.equal(awayAttackerStats.shots, 2);
import_strict.default.equal(awayAttackerStats.shotsOnTarget, 2);
import_strict.default.equal(awayAttackerStats.goals, 1);
import_strict.default.equal(awayAttackerStats.foulsWon, 1);
import_strict.default.equal(awayAttackerStats.penaltiesTaken, 1);
import_strict.default.equal(awayAttackerStats.penaltiesScored, 1);
import_strict.default.equal(awayAttackerStats.injuriesSevere, 1);
var ownGoalStats = stats.AWAY[awayOwnGoalDefender.id];
import_strict.default.equal(ownGoalStats.ownGoals, 1);
import_strict.default.equal(ownGoalStats.goals, 0);
var cardedStats = stats.AWAY[awayCardedDefender.id];
import_strict.default.equal(cardedStats.redCards, 1);
import_strict.default.equal(cardedStats.foulsCommitted, 1);
import_strict.default.equal(cardedStats.minutesPlayed, 84);
var awayKeeperStats = stats.AWAY[awayKeeper.id];
import_strict.default.equal(awayKeeperStats.goalsConceded, 2);
import_strict.default.ok(scorerStats.rating >= 6.5, `Scorer rating too low: ${scorerStats.rating}`);
import_strict.default.ok(homeKeeperStats.rating >= 6, `Keeper rating too low: ${homeKeeperStats.rating}`);
import_strict.default.ok(ownGoalStats.rating < 6.2, `Own goal should lower rating: ${ownGoalStats.rating}`);
var shootoutSample = CupSampleMatchFactory.makeInput(31, "EQUAL");
var redCardedShootoutPlayer = shootoutSample.home.players.find(
  (player) => shootoutSample.home.lineup.startingXI.includes(player.id) && player.position !== "GK" /* GK */
);
import_strict.default.ok(redCardedShootoutPlayer, "Missing red-card shootout candidate");
var shootoutFatigue = Object.fromEntries(
  [...shootoutSample.home.players, ...shootoutSample.away.players].map((player) => [player.id, player.condition])
);
var shootout = CupPenaltyShootoutService.simulate(shootoutSample, shootoutFatigue, {
  redCards: { [redCardedShootoutPlayer.id]: true },
  startSecond: 120 * 60
});
import_strict.default.equal(shootout.events.length, shootout.attempts.length);
import_strict.default.ok(shootout.attempts.length >= 6, "Shootout should contain multiple attempts");
import_strict.default.ok(shootout.events.every((event) => event.detail?.isShootout === true), "Shootout events should be marked explicitly");
import_strict.default.ok(shootout.events.every((event) => Boolean(event.playerId)), "Shootout event should have taker");
import_strict.default.ok(shootout.events.every((event) => Boolean(event.secondaryPlayerId)), "Shootout event should have goalkeeper");
import_strict.default.ok(
  shootout.attempts.every((attempt) => attempt.takerId !== redCardedShootoutPlayer.id),
  "Red-carded player must not take a shootout penalty"
);
["HOME", "AWAY"].forEach((side) => {
  const firstCycle = shootout.attempts.filter((attempt) => attempt.side === side).slice(0, 5).map((attempt) => attempt.takerId);
  import_strict.default.equal(new Set(firstCycle).size, firstCycle.length, `Shootout takers for ${side} should not repeat in first cycle`);
});
var shootoutStats = CupPlayerStatsAggregator.aggregate({
  match: shootoutSample,
  events: shootout.events,
  finalSecond: 120 * 60,
  homeScore: 0,
  awayScore: 0,
  initialLineups: {
    HOME: [...shootoutSample.home.lineup.startingXI],
    AWAY: [...shootoutSample.away.lineup.startingXI]
  }
});
shootout.attempts.forEach((attempt) => {
  const taker = shootoutStats[attempt.side][attempt.takerId];
  import_strict.default.ok(taker, "Shootout taker should exist in player stats");
  import_strict.default.ok(taker.penaltiesTaken >= 1, "Shootout taker should have penalty taken");
  if (attempt.scored) import_strict.default.ok(taker.penaltiesScored >= 1, "Scored shootout penalty should be counted");
  if (!attempt.scored) import_strict.default.ok(taker.penaltiesMissed >= 1, "Missed shootout penalty should be counted");
  if (attempt.saved && attempt.goalkeeperId) {
    const keeperSide = attempt.side === "HOME" ? "AWAY" : "HOME";
    const keeper = shootoutStats[keeperSide][attempt.goalkeeperId];
    import_strict.default.ok(keeper.penaltiesSaved >= 1, "Saved shootout penalty should be counted for goalkeeper");
  }
});
var simulated = CupMatchEngineV2.simulate({
  ...CupSampleMatchFactory.makeInput(22, "EQUAL"),
  config: {
    tickSeconds: 5,
    normalTimeSeconds: 90 * 60,
    enableExtraTime: false,
    enablePenaltyShootout: false
  }
});
var simulatedHomePlayers = Object.values(simulated.playerStats.HOME);
var simulatedAwayPlayers = Object.values(simulated.playerStats.AWAY);
import_strict.default.ok(simulatedHomePlayers.length >= 11, "Simulated result should include home player stats");
import_strict.default.ok(simulatedAwayPlayers.length >= 11, "Simulated result should include away player stats");
import_strict.default.ok(simulatedHomePlayers.some((player) => player.minutesPlayed > 0), "Home player minutes should be tracked");
import_strict.default.ok(simulatedAwayPlayers.some((player) => player.minutesPlayed > 0), "Away player minutes should be tracked");
console.log("CupPlayerStatsAggregatorTests: OK");
