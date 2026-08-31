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

// tests/MatchEngineV2ActionTrajectoryTests.ts
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
var fatigueMultiplier = (fatigue2) => clamp(0.62 + normalizeAttribute(fatigue2) * 0.45, 0.62, 1.07);
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
var attr = (players, fatigue2, injuries, weights, fallback = 50) => average(players.map(
  (player) => weightedScore(player.attributes, weights, fallback) * fatigueMultiplier(fatigue2[player.id] ?? player.condition) * injuryMultiplier(player, injuries)
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
var CupTeamProfileService = {
  /**
   * Profil drużyny jest warstwą agregującą atrybuty zawodników, taktykę,
   * kondycję i morale. Silnik nie powinien w kolejnych fazach liczyć
   * "surowej sumy" zawodników, bo to tworzy sztuczne przewagi formacji.
   * Zamiast tego każda faza dostaje jakość danej funkcji zespołu.
   */
  buildProfile: (team, fatigue2, redCards, injuries = {}) => {
    const active = activePlayers(team).filter((player) => !redCards[player.id]);
    const naturalGoalkeeper = active.find((player) => player.position === "GK" /* GK */);
    const emergencyGoalkeeper = naturalGoalkeeper ? void 0 : [...active].sort(
      (left, right) => weightedScore(right.attributes, { goalkeeping: 0.55, positioning: 0.2, mentality: 0.15, strength: 0.1 }) - weightedScore(left.attributes, { goalkeeping: 0.55, positioning: 0.2, mentality: 0.15, strength: 0.1 })
    )[0];
    const goalkeeper = naturalGoalkeeper ?? emergencyGoalkeeper;
    const outfield = active.filter((player) => player.id !== goalkeeper?.id);
    const defenders = byPosition(outfield, "DEF" /* DEF */);
    const midfielders = byPosition(outfield, "MID" /* MID */);
    const forwards = byPosition(outfield, "FWD" /* FWD */);
    const moraleMod = moraleMultiplier(team.morale * 0.52 + team.preMatchMotivation * 0.32 + team.stadiumSupport * 0.16);
    const shape = shapeFromTactic(team);
    const injuredActiveCount = active.filter((player) => injuries[player.id]).length;
    const severeActiveCount = active.filter((player) => injuries[player.id] === "SEVERE").length;
    const unfitShapePenalty = clamp(1 - injuredActiveCount * 0.018 - severeActiveCount * 0.045, 0.72, 1);
    const buildUp = attr([...defenders, ...midfielders, goalkeeper].filter(Boolean), fatigue2, injuries, {
      passing: 0.28,
      technique: 0.18,
      vision: 0.16,
      positioning: 0.12,
      mentality: 0.14,
      workRate: 0.12
    }) * moraleMod;
    const midfieldControl = attr(midfielders.length > 0 ? midfielders : outfield, fatigue2, injuries, {
      passing: 0.22,
      technique: 0.2,
      vision: 0.18,
      positioning: 0.12,
      stamina: 0.1,
      workRate: 0.12,
      mentality: 0.06
    }) * moraleMod;
    const progression = attr(outfield, fatigue2, injuries, {
      pace: 0.13,
      passing: 0.17,
      technique: 0.18,
      dribbling: 0.16,
      vision: 0.13,
      workRate: 0.11,
      mentality: 0.07,
      strength: 0.05
    }) * moraleMod;
    const chanceCreation = attr([...midfielders, ...forwards], fatigue2, injuries, {
      vision: 0.22,
      passing: 0.18,
      technique: 0.16,
      attacking: 0.14,
      crossing: 0.12,
      dribbling: 0.1,
      mentality: 0.08
    }) * moraleMod;
    const finishing = attr(forwards.length > 0 ? forwards : outfield, fatigue2, injuries, {
      finishing: 0.28,
      attacking: 0.17,
      technique: 0.15,
      positioning: 0.13,
      mentality: 0.12,
      strength: 0.06,
      pace: 0.05,
      heading: 0.04
    }) * moraleMod;
    const defensiveShape = attr([...defenders, ...midfielders], fatigue2, injuries, {
      defending: 0.28,
      positioning: 0.22,
      strength: 0.12,
      pace: 0.1,
      heading: 0.08,
      workRate: 0.1,
      mentality: 0.1
    }) * moraleMod;
    const pressing = attr(outfield, fatigue2, injuries, {
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
      buildUp: buildUp * tempoBuildMod * passingProgressionMod,
      midfieldControl: midfieldControl * (team.instructions.passing === "SHORT" ? 1.018 : 1),
      progression: progression * tacticAttackMod * tempoBuildMod * passingProgressionMod,
      chanceCreation: chanceCreation * tacticAttackMod * mindsetAttackMod,
      finishing,
      crossing: attr(outfield, fatigue2, injuries, { crossing: 0.34, technique: 0.18, passing: 0.16, vision: 0.12, pace: 0.1, mentality: 0.1 }) * tacticAttackMod,
      aerialThreat: attr(outfield, fatigue2, injuries, { heading: 0.32, strength: 0.22, positioning: 0.18, attacking: 0.12, mentality: 0.08, pace: 0.08 }),
      defensiveShape: defensiveShape * tacticDefenseMod * mindsetDefenseMod * markingDefenseMod * unfitShapePenalty,
      pressing: pressing * tacticPressMod * intensityPressMod,
      counterThreat: attr([...midfielders, ...forwards], fatigue2, injuries, { pace: 0.2, passing: 0.18, vision: 0.17, dribbling: 0.15, technique: 0.12, attacking: 0.11, mentality: 0.07 }),
      setPieces: attr(active, fatigue2, injuries, { freeKicks: 0.26, corners: 0.22, crossing: 0.18, heading: 0.14, technique: 0.1, mentality: 0.1 }),
      goalkeeperQuality: goalkeeper ? weightedScore(goalkeeper.attributes, { goalkeeping: 0.38, positioning: 0.2, mentality: 0.14, strength: 0.08, pace: 0.06, passing: 0.06, technique: 0.04, leadership: 0.04 }) * fatigueMultiplier(fatigue2[goalkeeper.id] ?? goalkeeper.condition) * injuryMultiplier(goalkeeper, injuries) : 35,
      disciplineRisk: attr(outfield, fatigue2, injuries, { aggression: 0.32, mentality: -0.12, positioning: -0.1, defending: 0.08, workRate: 0.12 }, 50) * intensityPressMod * markingDisciplineMod,
      staminaReserve: attr(active, fatigue2, injuries, { stamina: 0.5, workRate: 0.25, mentality: 0.15, strength: 0.1 }),
      leadership: attr(active, fatigue2, injuries, { leadership: 0.55, mentality: 0.25, workRate: 0.12, stamina: 0.08 }, 50),
      mentality: attr(active, fatigue2, injuries, { mentality: 0.44, leadership: 0.18, workRate: 0.16, aggression: 0.07, stamina: 0.08, positioning: 0.07 }),
      tacticalWidth: shape.tacticalWidth,
      lineHeight: shape.lineHeight
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
var shotWeight = (player) => {
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
  }) + positionalBonus);
};
var creatorWeight = (player) => Math.max(1, weightedScore(player.attributes, {
  passing: 0.24,
  vision: 0.22,
  technique: 0.18,
  crossing: 0.13,
  dribbling: 0.1,
  mentality: 0.08,
  workRate: 0.05
}));
var nearestOpponentDistance = (spatial, side, playerId) => {
  const point2 = spatial.players[playerId];
  if (!point2) return 8;
  const opponents = Object.values(spatial.players).filter((player) => player.isOnPitch && player.side !== side);
  return opponents.length > 0 ? Math.min(...opponents.map((player) => Math.hypot(player.x - point2.x, player.y - point2.y))) : 12;
};
var spatialShotWeight = (spatial, side, playerId) => {
  const point2 = spatial?.players[playerId];
  if (!spatial || !point2?.isOnPitch) return 1;
  const goalY = side === "HOME" ? spatial.pitchLength : 0;
  const distance = Math.hypot(point2.x - spatial.pitchWidth / 2, point2.y - goalY);
  const pressure = nearestOpponentDistance(spatial, side, playerId);
  return clamp((1.42 - distance / 95) * clamp(pressure / 5, 0.45, 1.22), 0.22, 1.42);
};
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
    spatial,
    preferredShooterId,
    preferredCreatorId,
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
    const shooter = pickWeighted(bestShooterPool(attacking).map((player) => ({
      item: player,
      weight: shotWeight(player) * spatialShotWeight(spatial, side, player.id) * (player.id === preferredShooterId ? 1.75 : 1)
    })), roll(32));
    const creatorCandidates = attacking.outfieldPlayers.filter((player) => player.id !== shooter.id);
    const creator = creatorCandidates.length > 0 ? pickWeighted(creatorCandidates.map((player) => ({
      item: player,
      weight: creatorWeight(player) * (player.id === preferredCreatorId ? 1.65 : 1)
    })), roll(33)) : void 0;
    const shooterPoint = spatial?.players[shooter.id];
    const marker = defending.defenders.length > 0 ? pickWeighted(defending.defenders.map((player) => {
      const markerPoint = spatial?.players[player.id];
      const distanceWeight = shooterPoint && markerPoint ? clamp(14 / Math.max(2, Math.hypot(markerPoint.x - shooterPoint.x, markerPoint.y - shooterPoint.y)), 0.35, 2.2) : 1;
      return {
        item: player,
        weight: Math.max(1, player.attributes.defending + player.attributes.positioning) * distanceWeight
      };
    }), roll(34)) : void 0;
    const goalY = side === "HOME" ? 105 : 0;
    const spatialDistance = shooterPoint ? clamp(Math.hypot(shooterPoint.x - 34, shooterPoint.y - goalY), 5, 36) : void 0;
    const spatialAngle = shooterPoint ? clamp(1 - Math.abs(shooterPoint.x - 34) / 34, 0.18, 1) : void 0;
    const rawXg = 0.044 + (creationScore - preventionScore) * 18e-4 + (zone === "BOX" ? 0.112 : zone === "FINAL_THIRD" ? 0.044 : 0.018) + (intent.pattern === "COUNTER" ? 0.03 : 0) + (intent.pattern === "SET_PIECE" ? 0.018 : 0) - pressure * 9e-4 + (spatialDistance !== void 0 ? clamp((20 - spatialDistance) * 22e-4, -0.035, 0.035) : 0);
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
      angle: spatialAngle ?? clamp(0.25 + roll(35) * 0.65 + (zone === "BOX" ? 0.1 : 0), 0, 1),
      distance: spatialDistance ?? (zone === "BOX" ? 7 + roll(36) * 10 : 16 + roll(36) * 14)
    };
  }
};

// services/match/engines/cupV2/CupMatchClockService.ts
var pad = (value) => String(Math.max(0, Math.floor(value))).padStart(2, "0");
var regulationHalfSeconds = (config) => Math.floor(config.normalTimeSeconds / 2);
var CupMatchClockService = {
  /**
   * The engine clock never moves backwards and includes every stoppage-time
   * second. Football presentation time does not: the second half starts at
   * 45:00 and extra time at 90:00. Keeping the conversion in one service
   * prevents UI clocks, commentary and reports from disagreeing.
   */
  getBoundaries: (state, config) => {
    const firstHalfRegulationEnd = regulationHalfSeconds(config);
    const firstHalfEnd = firstHalfRegulationEnd + state.firstHalfAddedTimeSeconds;
    const secondHalfRegulationEnd = firstHalfEnd + (config.normalTimeSeconds - firstHalfRegulationEnd);
    const normalTimeEnd = secondHalfRegulationEnd + state.secondHalfAddedTimeSeconds;
    return {
      firstHalfRegulationEnd,
      firstHalfEnd,
      secondHalfRegulationEnd,
      normalTimeEnd
    };
  },
  /** Converts the monotonic simulation clock to normal football match time. */
  toFootballSecond: (state, config) => {
    const boundaries = CupMatchClockService.getBoundaries(state, config);
    if (state.phase === "FIRST_HALF") return state.second;
    if (state.phase === "SECOND_HALF") {
      return Math.max(0, state.second - state.firstHalfAddedTimeSeconds);
    }
    if (state.phase === "EXTRA_TIME_1" || state.phase === "EXTRA_TIME_2" || state.phase === "PENALTY_SHOOTOUT" || state.second > boundaries.normalTimeEnd) {
      return Math.max(0, state.second - state.addedTimeSeconds);
    }
    return Math.max(0, state.second - state.firstHalfAddedTimeSeconds);
  },
  /** Minute stored on events and consumed by commentary/statistics views. */
  eventMinute: (state, config) => Math.floor(CupMatchClockService.toFootballSecond(state, config) / 60) + 1,
  /** Presentation-ready clock for the future SVG match view. */
  displayClock: (state, config) => {
    const footballSecond = CupMatchClockService.toFootballSecond(state, config);
    const minute = Math.floor(footballSecond / 60);
    const secondInMinute = footballSecond % 60;
    const phase = state.phase;
    const boundaries = CupMatchClockService.getBoundaries(state, config);
    const finishedAfterExtraTime = phase === "FINISHED" && state.second > boundaries.normalTimeEnd;
    const baseMinute = phase === "FIRST_HALF" ? 45 : phase === "SECOND_HALF" || phase === "FINISHED" && !finishedAfterExtraTime ? 90 : 120;
    const isStoppage = phase === "FIRST_HALF" && footballSecond >= 45 * 60 || (phase === "SECOND_HALF" || phase === "FINISHED" && !finishedAfterExtraTime) && footballSecond >= 90 * 60;
    const stoppageMinute = isStoppage ? Math.max(1, Math.ceil((footballSecond - baseMinute * 60 + 1) / 60)) : void 0;
    const label = stoppageMinute ? `${baseMinute}+${stoppageMinute}` : `${pad(minute)}:${pad(secondInMinute)}`;
    return { minute, secondInMinute, stoppageMinute, label };
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
      (0.026 + defending.disciplineRisk * 7e-4 + defending.pressing * 32e-5 + danger * 0.045 + strictness * 0.018 - consistencyNoise) * ctx.state.coachEffects[defending.side].foulMultiplier,
      4e-3,
      0.16
    );
    if (ctx.random(salt + 2) > foulChance) return null;
    const yellowChance = clamp(0.11 + strictness * 0.22 + danger * 0.25 + defending.disciplineRisk * 9e-4, 0.06, 0.62);
    const redChance = clamp(4e-3 + strictness * 0.018 + Math.max(0, danger - 0.75) * 0.07, 2e-3, 0.12);
    const initialType = ctx.random(salt + 3) < redChance ? "RED_CARD" /* RED_CARD */ : ctx.random(salt + 4) < yellowChance ? "YELLOW_CARD" /* YELLOW_CARD */ : "FOUL" /* FOUL */;
    const fouler = selectFouler(defending, ctx.random(salt + 5));
    const fouled = selectFouledPlayer(attacking, ctx.random(salt + 6));
    const advantageChance = clamp(advantage * 0.55 + danger * 0.18 - strictness * 0.1, 0.03, 0.68);
    const advantagePlayed = initialType === "FOUL" /* FOUL */ && ctx.random(salt + 7) < advantageChance;
    const secondYellow = initialType === "YELLOW_CARD" /* YELLOW_CARD */ && Boolean(fouler && (ctx.state.yellowCards[fouler.id] ?? 0) >= 1);
    const type = advantagePlayed ? "ADVANTAGE_PLAYED" /* ADVANTAGE_PLAYED */ : secondYellow ? "RED_CARD" /* RED_CARD */ : initialType;
    const defendingTeamName = defending.side === "HOME" ? ctx.input.home.name : ctx.input.away.name;
    const foulerName = fouler ? fouler.lastName : defendingTeamName;
    const fouledName = fouled ? fouled.lastName : "rywala";
    return {
      id: `cupv2_contact_${ctx.state.second}_${salt}`,
      second: ctx.state.second,
      minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
      side: defending.side,
      type,
      playerId: fouler?.id,
      secondaryPlayerId: fouled?.id,
      text: advantagePlayed ? `${foulerName} fauluje ${fouledName}, ale s\u0119dzia stosuje przywilej korzy\u015Bci.` : `${foulerName} przerywa akcj\u0119 faulem na ${fouledName}.`,
      detail: {
        danger,
        refereeStrictness: referee.strictness,
        refereeConsistency: referee.consistency,
        attackingSide: attacking.side,
        foulerId: fouler?.id,
        fouledPlayerId: fouled?.id,
        secondYellow,
        advantagePlayed
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
    const injuryChance = clamp(
      (15e-4 + pitchRisk + weatherRisk + fatigueRisk + contactIntensity * 0.01) * ctx.state.coachEffects[profile.side].injuryMultiplier,
      5e-4,
      0.035
    );
    const eligiblePlayers = profile.activePlayers.filter((player) => !ctx.state.injuries[player.id]);
    if (ctx.random(salt) > injuryChance || eligiblePlayers.length === 0) return null;
    const injured = pickWeighted(eligiblePlayers.map((player) => ({
      item: player,
      weight: Math.max(1, 105 - (ctx.state.fatigue[player.id] ?? player.condition) + contactIntensity * 20)
    })), ctx.random(salt + 1));
    const severe = ctx.random(salt + 2) < clamp(0.08 + contactIntensity * 0.16 + Math.max(0, 45 - injured.attributes.strength) * 2e-3, 0.04, 0.35);
    return {
      id: `cupv2_injury_${ctx.state.second}_${injured.id}`,
      second: ctx.state.second,
      minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
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

// services/match/engines/cupV2/CupActionSequenceService.ts
var baseEvent = (ctx, sequenceId, suffix) => ({
  id: `${sequenceId}_${suffix}`,
  second: ctx.state.second,
  minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
  detail: { sequenceId }
});
var isWideZone = (zone) => zone === "WIDE_LEFT" || zone === "WIDE_RIGHT";
var CupActionSequenceService = {
  /**
   * Builds the visible, player-attributed chain for successful progression.
   * These events describe an outcome already resolved by the calibrated team
   * model. They must never make a second hidden success roll or alter balance.
   */
  createProgressionEvents: ({
    ctx,
    attacking,
    intent,
    decision,
    sequenceId,
    fromZone,
    toZone
  }) => {
    const passer = decision.passer;
    const receiver = decision.receiver;
    if (!passer || !receiver) return [];
    if (decision.action === "DRIBBLE") {
      const dribbleBase = baseEvent(ctx, sequenceId, "carry");
      return [{
        ...dribbleBase,
        side: attacking.side,
        type: "DRIBBLING" /* DRIBBLING */,
        zone: toZone,
        pattern: intent.pattern,
        playerId: passer.id,
        secondaryPlayerId: decision.presser?.id,
        text: `${passer.lastName} rusza z pi\u0142k\u0105 i prowadzi akcj\u0119 do przodu.`,
        detail: {
          ...dribbleBase.detail,
          fromZone,
          toZone,
          succeeded: true,
          dribblingQuality: passer.attributes.dribbling,
          actionDecision: decision.action,
          startX: decision.spatial?.passerX,
          startY: decision.spatial?.passerY,
          endX: decision.spatial?.receiverX,
          endY: decision.spatial?.receiverY,
          passDistance: decision.spatial?.passDistance,
          laneClearance: decision.spatial?.laneClearance,
          receiverPressure: decision.spatial?.receiverPressure
        }
      }];
    }
    const eventBase = baseEvent(ctx, sequenceId, "delivery");
    const crossingDecision = decision.action === "CROSS" || isWideZone(fromZone) && (toZone === "BOX" || toZone === "FINAL_THIRD");
    const delivery = crossingDecision ? {
      ...eventBase,
      side: attacking.side,
      type: ctx.random(281) < 0.58 ? "CROSS_NEAR_POST" /* CROSS_NEAR_POST */ : "CROSS_FAR_POST" /* CROSS_FAR_POST */,
      zone: toZone,
      pattern: intent.pattern,
      playerId: passer.id,
      secondaryPlayerId: receiver.id,
      text: `${passer.lastName} do\u015Brodkowuje do ${receiver.lastName}.`,
      detail: {
        ...eventBase.detail,
        fromZone,
        toZone,
        completed: true,
        passerQuality: passer.attributes.crossing,
        receiverMovement: receiver.attributes.positioning,
        actionDecision: decision.action,
        startX: decision.spatial?.passerX,
        startY: decision.spatial?.passerY,
        endX: decision.spatial?.receiverX,
        endY: decision.spatial?.receiverY,
        passDistance: decision.spatial?.passDistance,
        laneClearance: decision.spatial?.laneClearance,
        receiverPressure: decision.spatial?.receiverPressure
      }
    } : {
      ...eventBase,
      side: attacking.side,
      type: "PASS_COMPLETED" /* PASS_COMPLETED */,
      zone: toZone,
      pattern: intent.pattern,
      playerId: passer.id,
      secondaryPlayerId: receiver.id,
      text: decision.action === "DIRECT_PASS" ? `${passer.lastName} zagrywa odwa\u017Cnie do przodu do ${receiver.lastName}.` : `${passer.lastName} podaje do ${receiver.lastName}.`,
      detail: {
        ...eventBase.detail,
        fromZone,
        toZone,
        passerQuality: passer.attributes.passing,
        receiverMovement: receiver.attributes.positioning,
        actionDecision: decision.action,
        startX: decision.spatial?.passerX,
        startY: decision.spatial?.passerY,
        endX: decision.spatial?.receiverX,
        endY: decision.spatial?.receiverY,
        passDistance: decision.spatial?.passDistance,
        laneClearance: decision.spatial?.laneClearance,
        receiverPressure: decision.spatial?.receiverPressure
      }
    };
    const controlBase = baseEvent(ctx, sequenceId, "control");
    const events = [delivery, {
      ...controlBase,
      side: attacking.side,
      type: "BALL_CONTROL" /* BALL_CONTROL */,
      zone: toZone,
      pattern: intent.pattern,
      playerId: receiver.id,
      secondaryPlayerId: passer.id,
      text: `${receiver.lastName} opanowuje pi\u0142k\u0119 i podtrzymuje akcj\u0119.`,
      detail: {
        ...controlBase.detail,
        controlQuality: receiver.attributes.technique,
        underPressureFromId: decision.presser?.id,
        startX: decision.spatial?.receiverX,
        startY: decision.spatial?.receiverY
      }
    }];
    const dribbleChance = clamp(
      0.06 + receiver.attributes.dribbling * 12e-4 + (intent.pattern === "COUNTER" ? 0.08 : 0),
      0.07,
      0.25
    );
    if (toZone !== "GK" && toZone !== "DEFENSE" && ctx.random(282) < dribbleChance) {
      const dribbleBase = baseEvent(ctx, sequenceId, "dribble");
      events.push({
        ...dribbleBase,
        side: attacking.side,
        type: "DRIBBLING" /* DRIBBLING */,
        zone: toZone,
        pattern: intent.pattern,
        playerId: receiver.id,
        secondaryPlayerId: decision.presser?.id,
        text: `${receiver.lastName} mija rywala z pi\u0142k\u0105 przy nodze.`,
        detail: {
          ...dribbleBase.detail,
          succeeded: true,
          dribblingQuality: receiver.attributes.dribbling,
          startX: decision.spatial?.receiverX,
          startY: decision.spatial?.receiverY
        }
      });
    }
    return events;
  },
  /** A turnover can be an interception or an actual tackle; both share one result. */
  createTurnoverEvent: ({
    ctx,
    attacking,
    defending,
    intent,
    decision,
    sequenceId
  }) => {
    const tackler = decision.presser;
    const loser = decision.passer;
    const tackleChance = clamp(0.3 + defending.pressing * 22e-4, 0.34, 0.56);
    const tackle = Boolean(tackler && loser && ctx.random(283) < tackleChance);
    const eventBase = baseEvent(ctx, sequenceId, tackle ? "tackle" : "interception");
    return {
      ...eventBase,
      side: defending.side,
      type: tackle ? "TACKLE_WON" /* TACKLE_WON */ : "MISPLACED_PASS" /* MISPLACED_PASS */,
      zone: ctx.state.ballZone,
      pattern: intent.pattern,
      playerId: tackler?.id,
      secondaryPlayerId: loser?.id,
      text: tackler && loser ? tackle ? `${tackler.lastName} wygrywa pojedynek z zawodnikiem ${loser.lastName}.` : `${tackler.lastName} przechwytuje niedok\u0142adne podanie zawodnika ${loser.lastName}.` : `${defending.side === "HOME" ? ctx.input.home.name : ctx.input.away.name} odbiera pi\u0142k\u0119.`,
      detail: {
        ...eventBase.detail,
        possessionWinnerId: tackler?.id,
        possessionLoserId: loser?.id,
        tackle
      }
    };
  },
  /**
   * A shot is preceded by the concrete final delivery and first touch. This is
   * what lets SVG replay one coherent goal rather than three unrelated cues.
   */
  createChanceBuildup: ({
    ctx,
    attacking,
    intent,
    sequenceId,
    chance
  }) => {
    const creator = chance.creator;
    const shooter = chance.shooter;
    const events = [];
    if (creator && creator.id !== shooter.id) {
      const deliveryBase = baseEvent(ctx, sequenceId, "chance_delivery");
      const cross = intent.pattern === "WING_PLAY" || isWideZone(ctx.state.ballZone);
      events.push({
        ...deliveryBase,
        side: attacking.side,
        type: cross ? ctx.random(284) < 0.58 ? "CROSS_NEAR_POST" /* CROSS_NEAR_POST */ : "CROSS_FAR_POST" /* CROSS_FAR_POST */ : "PASS_COMPLETED" /* PASS_COMPLETED */,
        zone: chance.zone,
        pattern: chance.pattern,
        playerId: creator.id,
        secondaryPlayerId: shooter.id,
        text: cross ? `${creator.lastName} posy\u0142a do\u015Brodkowanie do ${shooter.lastName}.` : `${creator.lastName} otwiera drog\u0119 do bramki podaniem do ${shooter.lastName}.`,
        detail: {
          ...deliveryBase.detail,
          fromZone: ctx.state.ballZone,
          toZone: chance.zone,
          completed: true,
          chanceCreatingDelivery: true,
          passerQuality: cross ? creator.attributes.crossing : creator.attributes.passing,
          receiverMovement: shooter.attributes.positioning
        }
      });
    }
    const controlBase = baseEvent(ctx, sequenceId, "chance_control");
    events.push({
      ...controlBase,
      side: attacking.side,
      type: "BALL_CONTROL" /* BALL_CONTROL */,
      zone: chance.zone,
      pattern: chance.pattern,
      playerId: shooter.id,
      secondaryPlayerId: creator?.id,
      text: `${shooter.lastName} przygotowuje sobie pozycj\u0119 do strza\u0142u.`,
      detail: {
        ...controlBase.detail,
        controlQuality: shooter.attributes.technique,
        shotPreparation: true
      }
    });
    if (chance.kind === "ONE_ON_ONE" || intent.pattern === "COUNTER") {
      const dribbleBase = baseEvent(ctx, sequenceId, "chance_dribble");
      events.push({
        ...dribbleBase,
        side: attacking.side,
        type: "DRIBBLING" /* DRIBBLING */,
        zone: chance.zone,
        pattern: chance.pattern,
        playerId: shooter.id,
        secondaryPlayerId: chance.marker?.id,
        text: `${shooter.lastName} prowadzi pi\u0142k\u0119 w kierunku bramki.`,
        detail: { ...dribbleBase.detail, succeeded: true }
      });
    }
    return events;
  }
};

// services/match/engines/cupV2/CupPlayerDecisionService.ts
var distanceToSegment = (point2, start2, end2) => {
  const segmentX = end2.x - start2.x;
  const segmentY = end2.y - start2.y;
  const lengthSquared = segmentX * segmentX + segmentY * segmentY;
  if (lengthSquared < 1e-3) return Math.hypot(point2.x - start2.x, point2.y - start2.y);
  const projection = clamp(
    ((point2.x - start2.x) * segmentX + (point2.y - start2.y) * segmentY) / lengthSquared,
    0,
    1
  );
  return Math.hypot(
    point2.x - (start2.x + segmentX * projection),
    point2.y - (start2.y + segmentY * projection)
  );
};
var pressureAt = (spatial, side, point2) => {
  const opponents = Object.values(spatial.players).filter((player) => player.isOnPitch && player.side !== side);
  if (opponents.length === 0) return 20;
  return Math.min(...opponents.map((player) => Math.hypot(player.x - point2.x, player.y - point2.y)));
};
var spatialConnection = (spatial, side, passer, receiver) => {
  if (!spatial || !passer) return void 0;
  const passerPoint = spatial.players[passer.id];
  if (!passerPoint?.isOnPitch) return void 0;
  const receiverPoint = receiver ? spatial.players[receiver.id] : void 0;
  const base = {
    passerX: passerPoint.x,
    passerY: passerPoint.y,
    passerPressure: pressureAt(spatial, side, passerPoint)
  };
  if (!receiverPoint?.isOnPitch) return base;
  const opponents = Object.values(spatial.players).filter((player) => player.isOnPitch && player.side !== side);
  const laneClearance = opponents.length > 0 ? Math.min(...opponents.map((player) => distanceToSegment(player, passerPoint, receiverPoint))) : 20;
  const direction = side === "HOME" ? 1 : -1;
  return {
    ...base,
    receiverX: receiverPoint.x,
    receiverY: receiverPoint.y,
    passDistance: Math.hypot(receiverPoint.x - passerPoint.x, receiverPoint.y - passerPoint.y),
    forwardProgress: (receiverPoint.y - passerPoint.y) * direction,
    laneClearance,
    receiverPressure: pressureAt(spatial, side, receiverPoint)
  };
};
var spatialReceiverWeight = (connection) => {
  if (!connection || connection.passDistance === void 0) return 1;
  const distanceFactor = connection.passDistance < 3 ? 0.22 : connection.passDistance <= 24 ? 1.18 : connection.passDistance <= 38 ? 0.92 : connection.passDistance <= 50 ? 0.48 : 0.12;
  const laneFactor = (connection.laneClearance ?? 20) < 1.8 ? 0.2 : (connection.laneClearance ?? 20) < 3.5 ? 0.52 : (connection.laneClearance ?? 20) > 7 ? 1.16 : 1;
  const pressureFactor = clamp((connection.receiverPressure ?? 8) / 6, 0.48, 1.18);
  const progressFactor = clamp(1 + (connection.forwardProgress ?? 0) / 90, 0.72, 1.24);
  return distanceFactor * laneFactor * pressureFactor * progressFactor;
};
var passerRoleWeight = (player, zone) => {
  if (zone === "GK") {
    return player.position === "GK" /* GK */ ? 1.8 : player.position === "DEF" /* DEF */ ? 1.2 : 0.25;
  }
  if (zone === "DEFENSE") {
    return player.position === "DEF" /* DEF */ ? 1.5 : player.position === "MID" /* MID */ ? 1 : player.position === "GK" /* GK */ ? 0.65 : 0.25;
  }
  if (zone === "MIDFIELD") {
    return player.position === "MID" /* MID */ ? 1.55 : player.position === "DEF" /* DEF */ ? 0.75 : player.position === "FWD" /* FWD */ ? 0.65 : 0.1;
  }
  return player.position === "MID" /* MID */ ? 1.35 : player.position === "FWD" /* FWD */ ? 1.1 : player.position === "DEF" /* DEF */ ? 0.4 : 0.05;
};
var receiverRoleWeight = (player, zone, pattern) => {
  const directBonus = pattern === "DIRECT" || pattern === "COUNTER" ? 0.35 : 0;
  if (zone === "GK" || zone === "DEFENSE") {
    return player.position === "DEF" /* DEF */ ? 1.2 : player.position === "MID" /* MID */ ? 1.15 : player.position === "FWD" /* FWD */ ? 0.35 + directBonus : 0.1;
  }
  if (zone === "MIDFIELD") {
    return player.position === "MID" /* MID */ ? 1.35 : player.position === "FWD" /* FWD */ ? 0.9 + directBonus : player.position === "DEF" /* DEF */ ? 0.55 : 0.05;
  }
  return player.position === "FWD" /* FWD */ ? 1.55 : player.position === "MID" /* MID */ ? 1.1 : player.position === "DEF" /* DEF */ ? 0.25 : 0.03;
};
var receiverConnectionWeight = (passer, receiver, zone, pattern) => {
  if (!passer) return 1;
  const advancedZone = zone === "FINAL_THIRD" || zone === "BOX" || zone === "WIDE_LEFT" || zone === "WIDE_RIGHT";
  const direct = pattern === "DIRECT" || pattern === "COUNTER";
  if (passer.position === "FWD" /* FWD */) {
    if (receiver.position === "FWD" /* FWD */) return 1.28;
    if (receiver.position === "MID" /* MID */) return 1.18;
    return advancedZone ? 0.015 : direct ? 0.1 : 0.28;
  }
  if (passer.position === "MID" /* MID */) {
    if (receiver.position === "MID" /* MID */) return 1.3;
    if (receiver.position === "FWD" /* FWD */) return direct ? 1.32 : 1.08;
    return advancedZone ? 0.24 : 0.72;
  }
  if (passer.position === "DEF" /* DEF */) {
    if (receiver.position === "MID" /* MID */) return 1.38;
    if (receiver.position === "DEF" /* DEF */) return 1.14;
    return direct ? 1.02 : 0.58;
  }
  return receiver.position === "DEF" /* DEF */ ? 1.45 : receiver.position === "MID" /* MID */ ? 1.12 : 0.3;
};
var fitnessFactor = (player, fatigue2) => clamp((fatigue2[player.id] ?? player.condition) / 100, 0.35, 1);
var selectWeighted = (players, score, roll) => {
  if (players.length === 0) return void 0;
  return pickWeighted(players.map((player) => ({
    item: player,
    weight: Math.max(0.1, score(player))
  })), roll);
};
var selectAction = (player, zone, pattern, instructions, spatial, roll) => {
  if (!player) return "PASS";
  const wideZone = zone === "WIDE_LEFT" || zone === "WIDE_RIGHT";
  const actualWidePosition = spatial ? spatial.passerX < 14 || spatial.passerX > 54 : wideZone;
  const closePressure = spatial ? (spatial.passerPressure ?? 8) < 3.2 : false;
  const openLane = spatial ? (spatial.laneClearance ?? 6) > 5 : false;
  const advancedZone = zone === "FINAL_THIRD" || zone === "BOX" || wideZone;
  const shortPassing = instructions.passing === "SHORT";
  const longPassing = instructions.passing === "LONG";
  const fastTempo = instructions.tempo === "FAST";
  const offensive = instructions.mindset === "OFFENSIVE";
  const passQuality = weightedScore(player.attributes, {
    passing: 0.34,
    vision: 0.24,
    mentality: 0.18,
    technique: 0.14,
    positioning: 0.1
  });
  const dribbleQuality = weightedScore(player.attributes, {
    dribbling: 0.34,
    technique: 0.24,
    pace: 0.18,
    mentality: 0.14,
    strength: 0.1
  });
  const crossQuality = weightedScore(player.attributes, {
    crossing: 0.42,
    technique: 0.2,
    vision: 0.16,
    passing: 0.12,
    mentality: 0.1
  });
  const directQuality = weightedScore(player.attributes, {
    passing: 0.3,
    vision: 0.28,
    mentality: 0.18,
    technique: 0.14,
    attacking: 0.1
  });
  return pickWeighted([
    {
      item: "PASS",
      weight: passQuality * (shortPassing ? 1.48 : 1) * (pattern === "BUILD_UP" ? 1.22 : 1) * (closePressure ? 1.18 : 1)
    },
    {
      item: "DIRECT_PASS",
      weight: directQuality * (longPassing ? 1.55 : 0.72) * (pattern === "DIRECT" || pattern === "COUNTER" ? 1.42 : 1) * (openLane ? 1.22 : 0.88)
    },
    {
      item: "DRIBBLE",
      weight: dribbleQuality * (advancedZone ? 1.18 : 0.76) * (fastTempo ? 1.17 : 1) * (pattern === "COUNTER" ? 1.3 : 1) * (closePressure ? 0.72 : 1.14)
    },
    {
      item: "CROSS",
      weight: crossQuality * (actualWidePosition ? 2.25 : pattern === "WING_PLAY" && advancedZone ? 1.45 : 0.08) * (offensive ? 1.12 : 1)
    }
  ], roll);
};
var CupPlayerDecisionService = {
  /**
   * Selects the footballers involved in one possession action. Selection uses
   * role suitability, technical/mental attributes and current fatigue. It does
   * not decide whether the team succeeds; the calibrated team duel still owns
   * that probability, avoiding a balance change during this attribution stage.
   */
  selectPossessionDecision: ({
    attacking,
    defending,
    zone,
    pattern,
    fatigue: fatigue2,
    currentCarrierId,
    instructions,
    spatial,
    roll
  }) => {
    const currentCarrier = attacking.activePlayers.find((player) => player.id === currentCarrierId);
    const passer = currentCarrier ?? selectWeighted(attacking.activePlayers, (player) => weightedScore(player.attributes, {
      passing: 0.34,
      vision: 0.22,
      technique: 0.18,
      mentality: 0.12,
      positioning: 0.08,
      workRate: 0.06
    }) * passerRoleWeight(player, zone) * fitnessFactor(player, fatigue2), roll(271));
    const allReceivers = attacking.outfieldPlayers.filter((player) => player.id !== passer?.id);
    const advancedForwardOptions = passer?.position === "FWD" /* FWD */ && (zone === "FINAL_THIRD" || zone === "BOX" || zone === "WIDE_LEFT" || zone === "WIDE_RIGHT") ? allReceivers.filter((player) => player.position === "FWD" /* FWD */ || player.position === "MID" /* MID */) : allReceivers;
    const receivers = advancedForwardOptions.length >= 2 ? advancedForwardOptions : allReceivers;
    const receiver = selectWeighted(receivers, (player) => weightedScore(player.attributes, {
      positioning: 0.25,
      pace: 0.18,
      technique: 0.16,
      attacking: 0.15,
      vision: 0.1,
      workRate: 0.09,
      strength: 0.07
    }) * receiverRoleWeight(player, zone, pattern) * receiverConnectionWeight(passer, player, zone, pattern) * spatialReceiverWeight(spatialConnection(spatial, attacking.side, passer, player)) * fitnessFactor(player, fatigue2), roll(272));
    const passerPoint = passer && spatial?.players[passer.id];
    const presser = selectWeighted(defending.outfieldPlayers, (player) => weightedScore(player.attributes, {
      defending: 0.25,
      positioning: 0.2,
      workRate: 0.17,
      pace: 0.13,
      strength: 0.12,
      mentality: 0.13
    }) * fitnessFactor(player, fatigue2) * (passerPoint && spatial?.players[player.id] ? clamp(18 / Math.max(2, Math.hypot(
      spatial.players[player.id].x - passerPoint.x,
      spatial.players[player.id].y - passerPoint.y
    )), 0.35, 2.2) : 1), roll(273));
    const connection = spatialConnection(spatial, attacking.side, passer, receiver);
    const action = selectAction(passer, zone, pattern, instructions, connection, roll(274));
    return { passer, receiver, presser, action, spatial: connection };
  },
  /**
   * Resolves who reaches a genuinely loose ball after a save, post or block.
   * The defending side receives a contextual advantage, while anticipation,
   * positioning, pace, strength and fatigue still select the actual player.
   */
  selectReboundWinner: ({
    attacking,
    defending,
    fatigue: fatigue2,
    sourceEventType,
    roll
  }) => {
    const attackingPool = [...attacking.forwards, ...attacking.midfielders];
    const defendingPool = [...defending.defenders, ...defending.midfielders, ...defending.goalkeeper ? [defending.goalkeeper] : []];
    const defenderAdvantage = sourceEventType === "SAVE" /* SAVE */ || sourceEventType === "ONE_ON_ONE_SAVE" /* ONE_ON_ONE_SAVE */ ? 1.52 : sourceEventType === "SHOT_BLOCKED" /* SHOT_BLOCKED */ ? 1.32 : 1.16;
    const candidates = [
      ...attackingPool.map((player) => ({ player, side: attacking.side, multiplier: 1 })),
      ...defendingPool.map((player) => ({ player, side: defending.side, multiplier: defenderAdvantage }))
    ];
    if (candidates.length === 0) return void 0;
    const selected = pickWeighted(candidates.map((candidate) => ({
      item: candidate,
      weight: Math.max(0.1, weightedScore(candidate.player.attributes, {
        positioning: 0.28,
        mentality: 0.18,
        pace: 0.15,
        strength: 0.14,
        workRate: 0.13,
        aggression: 0.12
      }) * fitnessFactor(candidate.player, fatigue2) * candidate.multiplier)
    })), roll);
    return { player: selected.player, side: selected.side };
  }
};

// services/match/engines/cupV2/CupSetPieceResolver.ts
var CupSetPieceResolver = {
  /**
   * Stałe fragmenty powinny powstawać z wcześniejszego zdarzenia: faulu,
   * wybicia na róg, ręki, zablokowanego dośrodkowania albo ostrego pressingu.
   * Ten moduł nie powinien sam zwiększać tempa meczu; ma tylko rozstrzygać
   * jakość już przyznanego stałego fragmentu.
   */
  createSetPieceChance: ({
    ctx,
    attacking,
    defending,
    kind
  }) => {
    const takers = attacking.activePlayers;
    const targets = attacking.outfieldPlayers;
    if (takers.length === 0 || targets.length === 0) return null;
    const taker = pickWeighted(takers.map((player) => ({
      item: player,
      weight: weightedScore(player.attributes, {
        freeKicks: kind === "FREE_KICK_DIRECT" ? 0.34 : 0.16,
        corners: kind === "CORNER" ? 0.32 : 0.1,
        crossing: 0.18,
        technique: 0.16,
        vision: 0.12,
        mentality: 0.1
      })
    })), ctx.random(501));
    const selectedTarget = pickWeighted(targets.map((player) => ({
      item: player,
      weight: weightedScore(player.attributes, {
        heading: kind === "CORNER" || kind === "FREE_KICK_WIDE" ? 0.28 : 0.08,
        positioning: 0.18,
        attacking: 0.16,
        finishing: 0.14,
        strength: 0.12,
        technique: 0.07,
        mentality: 0.05
      })
    })), ctx.random(502));
    const shooter = kind === "PENALTY" ? taker : selectedTarget;
    const delivery = weightedScore(taker.attributes, {
      freeKicks: 0.22,
      corners: kind === "CORNER" ? 0.24 : 0.08,
      crossing: 0.22,
      technique: 0.16,
      vision: 0.1,
      mentality: 0.06
    }) + attacking.setPieces * 0.25 - defending.defensiveShape * 0.16 - defending.goalkeeperQuality * 0.08;
    const chanceProbability = clamp(0.08 + delivery * 22e-4, 0.025, 0.34);
    if (ctx.random(503) > chanceProbability) return null;
    const baseXg = kind === "PENALTY" ? 0.76 : kind === "FREE_KICK_DIRECT" ? 0.075 : kind === "CORNER" ? 0.055 : 0.065;
    return {
      side: attacking.side,
      kind: "SET_PIECE",
      zone: kind === "PENALTY" ? "BOX" : "FINAL_THIRD",
      pattern: "SET_PIECE",
      shooter,
      creator: taker.id === shooter.id ? void 0 : taker,
      marker: defending.defenders[0],
      xG: clamp(baseXg + (delivery - 50) * 18e-4, 0.025, kind === "PENALTY" ? 0.82 : 0.22),
      pressure: ctx.state.pressure[attacking.side],
      angle: kind === "FREE_KICK_DIRECT" ? 0.44 : 0.62,
      distance: kind === "PENALTY" ? 11 : kind === "FREE_KICK_DIRECT" ? 22 : 9
    };
  },
  eventForAward: (ctx, side, kind) => ({
    id: `cupv2_setpiece_award_${ctx.state.second}_${kind}`,
    second: ctx.state.second,
    minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
    side,
    type: kind === "CORNER" ? "CORNER" /* CORNER */ : kind === "PENALTY" ? "PENALTY_AWARDED" /* PENALTY_AWARDED */ : kind === "FREE_KICK_DIRECT" ? "FREE_KICK_DANGEROUS" /* FREE_KICK_DANGEROUS */ : "FREE_KICK" /* FREE_KICK */,
    zone: kind === "CORNER" ? "WIDE_LEFT" : "FINAL_THIRD",
    pattern: "SET_PIECE",
    text: `${side === "HOME" ? ctx.input.home.name : ctx.input.away.name} otrzymuje sta\u0142y fragment gry.`
  })
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
    const goalChanceCap = chance.pattern === "SET_PIECE" && chance.xG >= 0.6 ? 0.84 : scoreDiff >= 5 ? 0.16 : scoreDiff >= 4 ? 0.2 : scoreDiff >= 3 ? 0.25 : 0.34;
    const goalChance = clamp(
      (chance.xG * 1.04 * mismatchSoftener + clamp(executionEdge * 14e-4, -0.045, 0.055) + clamp(finishingEdge * 35e-5, -0.025, 0.03)) * leadDampener - weatherPenalty * 1e-3,
      4e-3,
      goalChanceCap
    );
    const scored = roll(40) < goalChance;
    const isPenalty = chance.pattern === "SET_PIECE" && chance.xG >= 0.6;
    const shotTempoDampener = clamp(1 - Math.max(0, scoreDiff - 2) * 0.055, 0.78, 1);
    const onTargetChance = clamp((0.24 + shotQuality * 1.25 + executionEdge * 12e-4) * shotTempoDampener, 0.14, 0.72);
    const isOnTarget = scored || roll(41) < onTargetChance;
    const postChance = clamp(0.012 + shotQuality * 0.055, 0.01, 0.045);
    const barChance = clamp(0.01 + shotQuality * 0.045, 8e-3, 0.04);
    const saveChance = isOnTarget ? clamp(0.72 - shotQuality * 1.55 + (keeperScore - shooterExecution) * 4e-3, 0.18, 0.88) : 0;
    if (scored) {
      return {
        eventType: isPenalty ? "PENALTY_SCORED" /* PENALTY_SCORED */ : chance.kind === "ONE_ON_ONE" ? "ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */ : "GOAL" /* GOAL */,
        goal: true,
        onTarget: true,
        corner: false,
        save: false,
        xG: chance.xG,
        momentumDelta: 18,
        text: `${shooter.lastName} ko\u0144czy akcj\u0119 strza\u0142em do siatki.`
      };
    }
    if (isPenalty) {
      const saved = isOnTarget && roll(45) < saveChance;
      return {
        eventType: "PENALTY_MISSED" /* PENALTY_MISSED */,
        goal: false,
        onTarget: isOnTarget,
        corner: false,
        save: saved,
        xG: chance.xG,
        momentumDelta: -4,
        text: saved ? `${keeper?.lastName ?? "Bramkarz"} broni rzut karny zawodnika ${shooter.lastName}.` : `${shooter.lastName} nie wykorzystuje rzutu karnego.`
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
    const blockChance = marker ? clamp(0.08 + markerPressure * 17e-4 + chance.pressure * 11e-4, 0.1, 0.34) : 0;
    if (!isOnTarget && marker && roll(48) < blockChance) {
      const corner = roll(47) < 0.08 + attacking.crossing * 7e-4;
      return {
        eventType: "SHOT_BLOCKED" /* SHOT_BLOCKED */,
        goal: false,
        onTarget: false,
        corner,
        save: false,
        xG: chance.xG,
        momentumDelta: corner ? 3 : 1,
        text: `${marker.lastName} blokuje strza\u0142 zawodnika ${shooter.lastName}.`
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
var weatherShotPenalty = (ctx) => Math.max(0, (ctx.input.environment.weather?.weatherIntensity ?? 0) * 15.5);
var registerShotStats = (ctx, attacking, defending, shot) => {
  const stats = ctx.state.stats[attacking.side];
  stats.shots += 1;
  stats.xG += shot.xG;
  if (shot.onTarget) stats.shotsOnTarget += 1;
  if (shot.goal) stats.goals += 1;
  if (shot.corner) stats.corners += 1;
  if (shot.save) ctx.state.stats[defending.side].saves += 1;
  if (shot.eventType === "SHOT_POST" /* SHOT_POST */) stats.posts += 1;
  if (shot.eventType === "SHOT_BAR" /* SHOT_BAR */) stats.bars += 1;
};
var resolveSetPieceDelivery = ({
  ctx,
  attacking,
  defending,
  intent,
  sequenceId,
  kind,
  sourceContactId
}) => {
  const events = [];
  const chance = CupSetPieceResolver.createSetPieceChance({ ctx, attacking, defending, kind });
  if (!chance) {
    const clearedByDefender = kind === "CORNER" && ctx.random(504) < 0.3;
    return {
      nextPossession: clearedByDefender ? defending.side : attacking.side,
      nextZone: clearedByDefender ? "MIDFIELD" : kind === "PENALTY" ? "BOX" : "FINAL_THIRD",
      momentumDelta: clearedByDefender ? attacking.side === "HOME" ? -1.4 : 1.4 : attacking.side === "HOME" ? 1.4 : -1.4,
      events
    };
  }
  events.push(...CupActionSequenceService.createChanceBuildup({
    ctx,
    attacking,
    intent: { ...intent, pattern: "SET_PIECE" },
    sequenceId,
    chance
  }));
  const shot = CupShotResolver.resolveShot({
    chance,
    attacking,
    defending,
    shooterFatigue: ctx.state.fatigue[chance.shooter.id] ?? chance.shooter.condition,
    keeperFatigue: defending.goalkeeper ? ctx.state.fatigue[defending.goalkeeper.id] ?? defending.goalkeeper.condition : 80,
    weatherPenalty: weatherShotPenalty(ctx),
    scoreDiff: attacking.side === "HOME" ? ctx.state.homeScore - ctx.state.awayScore : ctx.state.awayScore - ctx.state.homeScore,
    roll: (salt) => ctx.random(500 + salt)
  });
  registerShotStats(ctx, attacking, defending, shot);
  const setPieceShotId = `${sequenceId}_set_piece_shot`;
  const setPieceShooterPoint = ctx.input.spatialDecisionContext?.players[chance.shooter.id];
  events.push({
    id: setPieceShotId,
    second: ctx.state.second,
    minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
    side: attacking.side,
    type: shot.eventType,
    zone: chance.zone,
    pattern: "SET_PIECE",
    playerId: chance.shooter.id,
    secondaryPlayerId: kind === "PENALTY" || shot.assistEligible === false ? void 0 : chance.creator?.id,
    text: shot.text,
    xG: shot.xG,
    detail: {
      sequenceId,
      sourceContactId,
      setPieceKind: kind,
      chanceKind: chance.kind,
      pressure: chance.pressure,
      distance: chance.distance,
      angle: chance.angle,
      assistEligible: kind === "PENALTY" ? false : Boolean(chance.creator),
      attackingShooterId: chance.shooter.id,
      goalkeeperId: defending.goalkeeper?.id,
      markerId: chance.marker?.id,
      saved: shot.save,
      startX: setPieceShooterPoint?.x,
      startY: setPieceShooterPoint?.y
    }
  });
  if (shot.corner) {
    const cornerAward = CupSetPieceResolver.eventForAward(ctx, attacking.side, "CORNER");
    cornerAward.id = `${cornerAward.id}_after_set_piece`;
    cornerAward.detail = { sequenceId, sourceShotId: setPieceShotId };
    events.push(cornerAward);
  }
  return {
    nextPossession: shot.goal ? defending.side : shot.corner ? attacking.side : defending.side,
    nextZone: shot.goal ? "MIDFIELD" : shot.corner ? "WIDE_LEFT" : "DEFENSE",
    nextPossessionReason: shot.goal ? "GOAL_RESTART" : shot.corner ? "CORNER" : shot.save ? "SAVE" : "GOAL_KICK",
    restartSourceEventId: shot.corner ? events.at(-1)?.id : setPieceShotId,
    momentumDelta: attacking.side === "HOME" ? shot.momentumDelta : -shot.momentumDelta,
    events
  };
};
var resolveFoulRestart = ({
  ctx,
  attacking,
  defending,
  intent,
  sequenceId,
  sourceContactId
}) => {
  const kind = ctx.state.ballZone === "BOX" ? "PENALTY" : ctx.state.ballZone === "WIDE_LEFT" || ctx.state.ballZone === "WIDE_RIGHT" ? "FREE_KICK_WIDE" : ctx.state.ballZone === "FINAL_THIRD" && ctx.random(295) < 0.46 ? "FREE_KICK_DIRECT" : "FREE_KICK_WIDE";
  const award = CupSetPieceResolver.eventForAward(ctx, attacking.side, kind);
  award.detail = { ...award.detail ?? {}, sequenceId, sourceContactId, setPieceKind: kind };
  const delivery = resolveSetPieceDelivery({ ctx, attacking, defending, intent, sequenceId, kind, sourceContactId });
  return { ...delivery, events: [award, ...delivery.events] };
};
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
  const patternWeights = [
    { item: "BUILD_UP", weight: instructions.passing === "SHORT" ? 38 : 24 },
    { item: "DIRECT", weight: instructions.passing === "LONG" ? 32 : 12 },
    { item: "COUNTER", weight: instructions.counterAttack === "COUNTER" ? 28 : 8 },
    { item: "WING_PLAY", weight: attacking.tacticalWidth > 58 ? 22 : 12 },
    { item: "SECOND_BALL", weight: instructions.passing === "LONG" ? 14 : 7 }
  ];
  const tempo = instructions.tempo === "FAST" ? 0.72 : instructions.tempo === "SLOW" ? 0.34 : 0.52;
  const risk = instructions.mindset === "OFFENSIVE" ? 0.68 : instructions.mindset === "DEFENSIVE" ? 0.3 : 0.48;
  const verticality = instructions.passing === "LONG" ? 0.72 : instructions.passing === "SHORT" ? 0.32 : 0.52;
  const widthUse = clamp(attacking.tacticalWidth / 100 + (instructions.passing === "LONG" ? 0.05 : 0), 0.25, 0.85);
  const intensityTempo = instructions.intensity === "AGGRESSIVE" ? 0.04 : instructions.intensity === "CAUTIOUS" ? -0.04 : 0;
  const intensityRisk = instructions.intensity === "AGGRESSIVE" ? 0.05 : instructions.intensity === "CAUTIOUS" ? -0.05 : 0;
  return {
    side: attacking.side,
    pattern: pickWeighted(patternWeights, ctx.random(12)),
    risk: clamp(risk + intensityRisk, 0.18, 0.78),
    tempo: clamp(tempo + intensityTempo, 0.24, 0.78),
    verticality,
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
    const events = [];
    const possessionStats = ctx.state.stats[attacking.side];
    possessionStats.possessionTicks += 1;
    if (ctx.state.possessionReason === "CORNER_DELIVERY") {
      const sequenceId2 = `cupv2_corner_delivery_${ctx.state.second}_${ctx.state.possession}`;
      return resolveSetPieceDelivery({ ctx, attacking, defending, intent, sequenceId: sequenceId2, kind: "CORNER" });
    }
    const scoreDiff = attacking.side === "HOME" ? ctx.state.homeScore - ctx.state.awayScore : ctx.state.awayScore - ctx.state.homeScore;
    const footballMinute2 = CupMatchClockService.eventMinute(ctx.state, ctx.config) - 1;
    const halfTimeResponseDecay = ctx.state.phase === "SECOND_HALF" ? clamp(1 - Math.max(0, footballMinute2 - 45) / 52, 0.12, 1) : 0;
    const halfTimeResponse = ctx.state.halfTimeResponse[attacking.side] * halfTimeResponseDecay;
    const attackingCoach = ctx.state.coachEffects[attacking.side];
    const defendingCoach = ctx.state.coachEffects[defending.side];
    const leadingGameControlDampener = scoreDiff >= 5 ? 0.46 : scoreDiff >= 4 ? 0.55 : scoreDiff >= 3 ? 0.66 : scoreDiff >= 2 ? 0.8 : scoreDiff >= 1 ? 0.93 : 1;
    const trailingUrgency = scoreDiff < 0 ? clamp(1 + Math.min(3, Math.abs(scoreDiff)) * 0.035, 1, 1.105) : 1;
    const actionCadence = clamp(
      (0.19 + intent.tempo * 0.08 + intent.risk * 0.05 + Math.abs(ctx.state.momentum) * 45e-5 + attackingCoach.initiativeModifier * 0.55) * leadingGameControlDampener * trailingUrgency,
      0.08,
      0.34
    );
    if (ctx.random(20) > actionCadence) {
      return {
        nextZone: ctx.state.ballZone,
        momentumDelta: 0,
        events
      };
    }
    const decision = CupPlayerDecisionService.selectPossessionDecision({
      attacking,
      defending,
      zone: ctx.state.ballZone,
      pattern: intent.pattern,
      fatigue: ctx.state.fatigue,
      currentCarrierId: ctx.state.ballCarrierId,
      instructions: attacking.side === "HOME" ? ctx.input.home.instructions : ctx.input.away.instructions,
      spatial: ctx.input.spatialDecisionContext,
      roll: ctx.random
    });
    const sequenceId = `cupv2_sequence_${ctx.state.second}_${attacking.side}`;
    const pressure = ctx.state.pressure[attacking.side];
    const attackingOrganization = ctx.state.organization[attacking.side];
    const defendingOrganization = ctx.state.organization[defending.side];
    const pressingScore = defending.pressing * (defending.lineHeight > 55 ? 1.05 : 0.96);
    const buildScore = attacking.buildUp * 0.32 + attacking.midfieldControl * 0.23 + attacking.progression * 0.2 + attacking.mentality * 0.12 + attacking.staminaReserve * 0.08 + attackingOrganization * 0.04 - pressure * 0.1 + halfTimeResponse * 0.38;
    const turnoverProbability = clamp(
      contestProbability(pressingScore, buildScore, 0.1, 28) + intent.risk * 0.045 + intent.tempo * 0.03 + attackingCoach.turnoverRiskModifier * 0.32,
      0.018,
      0.22
    );
    if (ctx.random(21) < turnoverProbability) {
      const contact = CupDisciplineResolver.resolveContact({ ctx, defending, attacking, danger: intent.risk, salt: 200 });
      if (contact) events.push(contact);
      const injury = CupInjuryResolver.maybeCreateInjury({ ctx, profile: attacking, contactIntensity: intent.risk, salt: 215 });
      if (injury) {
        events.push(injury, {
          id: `${injury.id}_medical_treatment`,
          second: ctx.state.second,
          minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
          side: injury.side,
          type: "MEDICAL_TREATMENT" /* MEDICAL_TREATMENT */,
          zone: ctx.state.ballZone,
          playerId: injury.playerId,
          text: `S\u0142u\u017Cby medyczne udzielaj\u0105 pomocy poszkodowanemu zawodnikowi.`,
          detail: {
            sourceInjuryId: injury.id,
            severity: injury.type === "INJURY_SEVERE" /* INJURY_SEVERE */ ? "SEVERE" : "LIGHT"
          }
        });
      }
      if (contact?.type === "ADVANTAGE_PLAYED" /* ADVANTAGE_PLAYED */) {
        return {
          nextPossession: attacking.side,
          nextZone: ctx.state.ballZone,
          nextPossessionReason: "OPEN_PLAY",
          momentumDelta: attacking.side === "HOME" ? 0.8 : -0.8,
          events
        };
      }
      if (contact) {
        const restart = resolveFoulRestart({
          ctx,
          attacking,
          defending,
          intent,
          sequenceId,
          sourceContactId: contact.id
        });
        return {
          ...restart,
          events: [...events, ...restart.events]
        };
      }
      events.push(CupActionSequenceService.createTurnoverEvent({
        ctx,
        attacking,
        defending,
        intent,
        decision,
        sequenceId
      }));
      return {
        nextPossession: defending.side,
        nextZone: ctx.state.ballZone === "BOX" || ctx.state.ballZone === "FINAL_THIRD" ? "DEFENSE" : "MIDFIELD",
        momentumDelta: defending.side === "HOME" ? 1.8 : -1.8,
        events
      };
    }
    const progressionScore = attacking.progression * 0.34 + attacking.midfieldControl * 0.18 + attacking.chanceCreation * 0.15 + (intent.pattern === "COUNTER" ? attacking.counterThreat * 0.2 : 0) + intent.verticality * 12 + intent.tempo * 8 + halfTimeResponse * 0.82;
    const defensiveScore = defending.defensiveShape * 0.38 + defending.midfieldControl * 0.18 + defending.pressing * 0.14 + defending.mentality * 0.12 + defendingOrganization * 0.05;
    const progressProbability = clamp(
      (contestProbability(progressionScore, defensiveScore, 0.38, 24) + intent.risk * 0.04 + attackingCoach.initiativeModifier * 0.45 + attackingCoach.ownShotModifier * 1.25 + defendingCoach.opponentShotModifier * 1.1) * leadingGameControlDampener * trailingUrgency,
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
          minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
          side: attacking.side,
          type: eventType,
          zone: ctx.state.ballZone,
          pattern: intent.pattern,
          playerId: decision.passer?.id,
          secondaryPlayerId: decision.receiver?.id,
          text: eventType === "THROW_IN" /* THROW_IN */ ? `${decision.passer?.lastName ?? (attacking.side === "HOME" ? ctx.input.home.name : ctx.input.away.name)} wznawia gr\u0119 z autu.` : `${attacking.side === "HOME" ? ctx.input.home.name : ctx.input.away.name} utrzymuje pi\u0142k\u0119, ale akcja zwalnia.`,
          detail: eventType === "THROW_IN" /* THROW_IN */ ? { sequenceId, restartReason: "THROW_IN" } : { sequenceId }
        }]
      };
    }
    if (nextZone !== "FINAL_THIRD" && nextZone !== "BOX" && nextZone !== "WIDE_LEFT" && nextZone !== "WIDE_RIGHT") {
      events.push(...CupActionSequenceService.createProgressionEvents({
        ctx,
        attacking,
        defending,
        intent,
        decision,
        sequenceId,
        fromZone: ctx.state.ballZone,
        toZone: nextZone
      }));
      return { nextZone, momentumDelta: attacking.side === "HOME" ? 0.5 : -0.5, events };
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
          minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
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
      spatial: ctx.input.spatialDecisionContext,
      preferredShooterId: decision.receiver?.id ?? decision.passer?.id,
      preferredCreatorId: decision.passer?.id,
      roll: ctx.random
    });
    if (!chance) {
      const cornerChance = clamp(0.026 + attacking.crossing * 42e-5 + intent.widthUse * 0.024, 0.018, 0.095);
      if (ctx.random(26) < cornerChance) {
        ctx.state.stats[attacking.side].corners += 1;
        if (decision.passer && decision.presser && (ctx.state.ballZone === "WIDE_LEFT" || ctx.state.ballZone === "WIDE_RIGHT" || intent.pattern === "WING_PLAY")) {
          events.push({
            id: `${sequenceId}_cross_blocked`,
            second: ctx.state.second,
            minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
            side: defending.side,
            type: "CROSS_BLOCKED" /* CROSS_BLOCKED */,
            zone: nextZone,
            pattern: intent.pattern,
            playerId: decision.presser.id,
            secondaryPlayerId: decision.passer.id,
            text: `${decision.presser.lastName} blokuje do\u015Brodkowanie zawodnika ${decision.passer.lastName}.`,
            detail: { sequenceId, completed: false }
          });
        }
        events.push({
          id: `cupv2_corner_${ctx.state.second}`,
          second: ctx.state.second,
          minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
          side: attacking.side,
          type: "CORNER" /* CORNER */,
          zone: nextZone,
          pattern: intent.pattern,
          playerId: decision.receiver?.id ?? decision.passer?.id,
          secondaryPlayerId: decision.passer?.id,
          text: `${attacking.side === "HOME" ? ctx.input.home.name : ctx.input.away.name} wywalcza rzut ro\u017Cny po zablokowanej akcji.`,
          detail: {
            sequenceId,
            sourceEventId: events.at(-1)?.id
          }
        });
      } else {
        events.push(...CupActionSequenceService.createProgressionEvents({
          ctx,
          attacking,
          defending,
          intent,
          decision,
          sequenceId,
          fromZone: ctx.state.ballZone,
          toZone: nextZone
        }));
      }
      const cornerEvent = events.find((event) => event.type === "CORNER" /* CORNER */);
      return {
        nextPossession: cornerEvent ? attacking.side : void 0,
        nextZone,
        nextPossessionReason: cornerEvent ? "CORNER" : void 0,
        restartSourceEventId: cornerEvent?.id,
        momentumDelta: attacking.side === "HOME" ? 0.7 : -0.7,
        events
      };
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
      weatherPenalty: weatherShotPenalty(ctx),
      scoreDiff,
      roll: ctx.random
    });
    events.push(...CupActionSequenceService.createChanceBuildup({
      ctx,
      attacking,
      intent,
      sequenceId,
      chance
    }));
    registerShotStats(ctx, attacking, defending, shot);
    const shotEventId = `cupv2_shot_${ctx.state.second}`;
    const shooterPoint = ctx.input.spatialDecisionContext?.players[chance.shooter.id];
    events.push({
      id: shotEventId,
      second: ctx.state.second,
      minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
      side: attacking.side,
      type: shot.eventType,
      zone: chance.zone,
      pattern: chance.pattern,
      playerId: shot.isOwnGoal ? shot.ownGoalPlayerId : chance.shooter.id,
      secondaryPlayerId: shot.assistEligible === false || shot.isOwnGoal ? void 0 : chance.creator?.id,
      text: shot.text,
      xG: shot.xG,
      detail: {
        sequenceId,
        chanceKind: chance.kind,
        pressure: chance.pressure,
        distance: chance.distance,
        angle: chance.angle,
        assistEligible: shot.assistEligible ?? Boolean(chance.creator),
        isOwnGoal: shot.isOwnGoal ?? false,
        ownGoalPlayerId: shot.ownGoalPlayerId,
        attackingShooterId: chance.shooter.id,
        goalkeeperId: defending.goalkeeper?.id,
        markerId: chance.marker?.id,
        startX: shooterPoint?.x,
        startY: shooterPoint?.y
      }
    });
    const producesLooseBall = shot.eventType === "SAVE" /* SAVE */ || shot.eventType === "ONE_ON_ONE_SAVE" /* ONE_ON_ONE_SAVE */ || shot.eventType === "SHOT_POST" /* SHOT_POST */ || shot.eventType === "SHOT_BAR" /* SHOT_BAR */ || shot.eventType === "SHOT_BLOCKED" /* SHOT_BLOCKED */;
    const rebound = producesLooseBall && !shot.corner ? CupPlayerDecisionService.selectReboundWinner({
      attacking,
      defending,
      fatigue: ctx.state.fatigue,
      sourceEventType: shot.eventType,
      roll: ctx.random(291)
    }) : void 0;
    if (rebound) {
      events.push({
        id: `${sequenceId}_rebound`,
        second: ctx.state.second,
        minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
        side: rebound.side,
        type: "REBOUND_WON" /* REBOUND_WON */,
        zone: chance.zone,
        pattern: chance.pattern,
        playerId: rebound.player.id,
        secondaryPlayerId: chance.shooter.id,
        text: `${rebound.player.lastName} jako pierwszy dopada do odbitej pi\u0142ki.`,
        detail: {
          sequenceId,
          sourceEventType: shot.eventType,
          attackingRebound: rebound.side === attacking.side
        }
      });
    }
    let finalShot = shot;
    let finalShotEventId = shotEventId;
    const followUpChance = rebound?.side === attacking.side && ctx.random(292) < 0.16;
    if (rebound && followUpChance) {
      const controlId = `${sequenceId}_rebound_control`;
      events.push({
        id: controlId,
        second: ctx.state.second,
        minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
        side: attacking.side,
        type: "BALL_CONTROL" /* BALL_CONTROL */,
        zone: "BOX",
        pattern: "SECOND_BALL",
        playerId: rebound.player.id,
        secondaryPlayerId: chance.shooter.id,
        text: `${rebound.player.lastName} opanowuje odbit\u0105 pi\u0142k\u0119 i natychmiast sk\u0142ada si\u0119 do dobicia.`,
        detail: { sequenceId, reboundControl: true }
      });
      const reboundChance = {
        side: attacking.side,
        kind: "HALF_CHANCE",
        zone: "BOX",
        pattern: "SECOND_BALL",
        shooter: rebound.player,
        marker: chance.marker,
        xG: clamp(chance.xG * 0.42, 0.025, 0.14),
        pressure: clamp(chance.pressure + 14, 0, 100),
        angle: clamp(chance.angle - 0.08, 0.18, 0.92),
        distance: clamp(chance.distance * 0.72, 5, 15)
      };
      const reboundShooterPoint = ctx.input.spatialDecisionContext?.players[rebound.player.id];
      const reboundShot = CupShotResolver.resolveShot({
        chance: reboundChance,
        attacking,
        defending,
        shooterFatigue: ctx.state.fatigue[rebound.player.id] ?? rebound.player.condition,
        keeperFatigue: defending.goalkeeper ? ctx.state.fatigue[defending.goalkeeper.id] ?? defending.goalkeeper.condition : 80,
        weatherPenalty: weatherShotPenalty(ctx),
        scoreDiff,
        // A salt namespace independent from the first shot prevents a replay of
        // the same keeper/finishing rolls within one action sequence.
        roll: (salt) => ctx.random(400 + salt)
      });
      registerShotStats(ctx, attacking, defending, reboundShot);
      finalShot = reboundShot;
      finalShotEventId = `${sequenceId}_rebound_shot`;
      events.push({
        id: finalShotEventId,
        second: ctx.state.second,
        minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
        side: attacking.side,
        type: reboundShot.eventType,
        zone: reboundChance.zone,
        pattern: reboundChance.pattern,
        playerId: rebound.player.id,
        text: reboundShot.text,
        xG: reboundShot.xG,
        detail: {
          sequenceId,
          chanceKind: reboundChance.kind,
          pressure: reboundChance.pressure,
          distance: reboundChance.distance,
          angle: reboundChance.angle,
          assistEligible: false,
          attackingShooterId: rebound.player.id,
          goalkeeperId: defending.goalkeeper?.id,
          markerId: reboundChance.marker?.id,
          reboundShot: true,
          startX: reboundShooterPoint?.x,
          startY: reboundShooterPoint?.y
        }
      });
    }
    let restartSourceEventId = finalShotEventId;
    if (finalShot.corner) {
      const cornerAward = CupSetPieceResolver.eventForAward(ctx, attacking.side, "CORNER");
      cornerAward.detail = {
        ...cornerAward.detail ?? {},
        sequenceId,
        sourceShotId: finalShotEventId
      };
      events.push(cornerAward);
      restartSourceEventId = cornerAward.id;
    }
    const combinedMomentumDelta = shot.momentumDelta + (finalShot === shot ? 0 : finalShot.momentumDelta * 0.65);
    return {
      nextPossession: finalShot.goal ? defending.side : finalShot.corner ? attacking.side : defending.side,
      nextZone: finalShot.goal ? "MIDFIELD" : finalShot.corner ? "WIDE_LEFT" : "DEFENSE",
      nextPossessionReason: finalShot.goal ? "GOAL_RESTART" : finalShot.corner ? "CORNER" : rebound ? void 0 : finalShot.save ? "SAVE" : finalShot.eventType === "SHOT_BLOCKED" /* SHOT_BLOCKED */ ? void 0 : "GOAL_KICK",
      restartSourceEventId,
      momentumDelta: attacking.side === "HOME" ? combinedMomentumDelta : -combinedMomentumDelta,
      events
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
    const activeIds2 = new Set(team.lineup.startingXI.filter((id) => Boolean(id)));
    const playersWhoAlreadyLeft = new Set(state.events.filter((event) => event.type === "SUBSTITUTION" /* SUBSTITUTION */ && event.side === team.side).map((event) => event.secondaryPlayerId).filter((id) => Boolean(id)));
    const bench = team.players.filter(
      (player) => team.lineup.bench.includes(player.id) && !playersWhoAlreadyLeft.has(player.id) && !state.redCards[player.id]
    );
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
    const replacements = bench.filter((player) => !activeIds2.has(player.id) && player.position === playerOut.position);
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

// services/match/engines/cupV2/CupExtraTimeService.ts
var CupExtraTimeService = {
  /**
   * Reguły pucharowe powinny być osobną warstwą nad symulacją gry. Dzięki temu
   * ta sama pętla ticków może obsługiwać pierwszą połowę, drugą połowę i
   * dogrywkę, a decyzja o karnych nie miesza się z generowaniem akcji.
   */
  shouldPlayExtraTime: (state, config) => config.enableExtraTime && state.homeScore === state.awayScore,
  shouldPlayPenaltyShootout: (state, config) => config.enablePenaltyShootout && state.homeScore === state.awayScore,
  getAddedTimeSeconds: (state, window = {}) => {
    const fromSecond = window.fromSecond ?? 0;
    const toSecond = window.toSecond ?? state.second;
    const periodEvents = state.events.filter((event) => event.second >= fromSecond && event.second < toSecond);
    const count = (type) => periodEvents.filter((event) => event.type === type).length;
    const goals = count("GOAL" /* GOAL */) + count("ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */) + count("PENALTY_SCORED" /* PENALTY_SCORED */);
    const injuries = count("INJURY_LIGHT" /* INJURY_LIGHT */) + count("INJURY_SEVERE" /* INJURY_SEVERE */);
    const eventsCost = goals * 35 + count("YELLOW_CARD" /* YELLOW_CARD */) * 18 + count("RED_CARD" /* RED_CARD */) * 45 + injuries * 55 + count("SUBSTITUTION" /* SUBSTITUTION */) * 25;
    return Math.max(60, Math.min(420, eventsCost));
  }
};

// services/match/engines/cupV2/CupPenaltyShootoutService.ts
var playerName = (player) => `${player.firstName} ${player.lastName}`.trim();
var takerWeight = (player, fatigue2 = player.condition, injury) => {
  const injuryPenalty = injury === "SEVERE" ? 0.56 : injury === "LIGHT" ? 0.82 : 1;
  return Math.max(1, weightedScore(player.attributes, {
    penalties: 0.34,
    finishing: 0.18,
    technique: 0.16,
    mentality: 0.18,
    leadership: 0.06,
    strength: 0.04,
    talent: 0.04
  }) * clamp(0.72 + fatigue2 / 285, 0.72, 1.07) * injuryPenalty);
};
var goalkeeperWeight = (player, fatigue2 = player?.condition ?? 70, injury) => {
  if (!player) return 42;
  const injuryPenalty = injury === "SEVERE" ? 0.62 : injury === "LIGHT" ? 0.86 : 1;
  return weightedScore(player.attributes, {
    goalkeeping: 0.42,
    positioning: 0.18,
    mentality: 0.16,
    pace: 0.08,
    strength: 0.08,
    leadership: 0.08
  }) * clamp(0.74 + fatigue2 / 310, 0.74, 1.06) * injuryPenalty;
};
var activePlayers2 = (team, redCards) => {
  const byId = new Map(team.players.map((player) => [player.id, player]));
  const active = team.lineup.startingXI.map((id) => id ? byId.get(id) : void 0).filter((player) => Boolean(player && !redCards[player.id]));
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
var buildTakerOrder = (candidates, fatigue2, injuries, seed, salt) => {
  const remaining = [...candidates];
  const ordered = [];
  let pickIndex = 0;
  while (remaining.length > 0) {
    const picked = pickWeighted(
      remaining.map((player) => ({
        item: player,
        weight: takerWeight(player, fatigue2[player.id] ?? player.condition, injuries[player.id]) * (0.82 + seededRandom(seed, 91e3 + pickIndex, salt + pickIndex) * 0.36)
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
  simulate: (input2, fatigue2, options = {}) => {
    const redCards = options.redCards ?? {};
    const injuries = options.injuries ?? {};
    const startSecond = options.startSecond ?? 120 * 60;
    const homeCandidates = activePlayers2(input2.home, redCards);
    const awayCandidates = activePlayers2(input2.away, redCards);
    const homeKeeper = selectGoalkeeper(homeCandidates, redCards);
    const awayKeeper = selectGoalkeeper(awayCandidates, redCards);
    const homeOrder = buildTakerOrder(homeCandidates, fatigue2, injuries, input2.seed, 31);
    const awayOrder = buildTakerOrder(awayCandidates, fatigue2, injuries, input2.seed, 47);
    let home = 0;
    let away = 0;
    let round = 0;
    let order = 0;
    const attempts = [];
    const events = [];
    const takePenalty = (side, taker, salt) => {
      const keeper = side === "HOME" ? awayKeeper : homeKeeper;
      const takerScore = takerWeight(taker, fatigue2[taker.id] ?? taker.condition, injuries[taker.id]);
      const keeperScore = goalkeeperWeight(keeper, keeper ? fatigue2[keeper.id] ?? keeper.condition : 70, keeper ? injuries[keeper.id] : void 0);
      const chance = clamp(0.73 + (takerScore - keeperScore) * 3e-3, 0.55, 0.9);
      const scored = seededRandom(input2.seed, 1e5 + round, salt) < chance;
      const saved = !scored && seededRandom(input2.seed, 101e3 + round, salt) < clamp(0.43 + (keeperScore - takerScore) * 4e-3, 0.18, 0.72);
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
      const team = attempt.side === "HOME" ? input2.home : input2.away;
      const taker = team.players.find((player) => player.id === attempt.takerId);
      const keeperTeam = attempt.side === "HOME" ? input2.away : input2.home;
      const keeper = attempt.goalkeeperId ? keeperTeam.players.find((player) => player.id === attempt.goalkeeperId) : void 0;
      const second = startSecond + attempt.order * 15;
      const penaltyScoreText = `${home}:${away}`;
      const resultText = attempt.scored ? `${taker ? playerName(taker) : "Zawodnik"} wykorzystuje rzut karny w serii.` : attempt.saved ? `${keeper ? playerName(keeper) : "Bramkarz"} broni rzut karny wykonywany przez ${taker ? playerName(taker) : "zawodnika"}.` : `${taker ? playerName(taker) : "Zawodnik"} nie trafia w serii rzut\xF3w karnych.`;
      events.push({
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
    return { winner: home >= away ? "HOME" : "AWAY", home, away, attempts, events };
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
var possessionImpact = (entry) => {
  const accuracy = entry.passesAttempted > 0 ? entry.passesCompleted / entry.passesAttempted : 0.72;
  const accuracyImpact = entry.passesAttempted >= 5 ? clamp((accuracy - 0.72) * 0.32, -0.18, 0.12) : 0;
  return accuracyImpact + Math.min(0.1, entry.passesCompleted * 2e-3) + entry.controls * 1e-3 + entry.dribblesCompleted * 0.02 - Math.max(0, entry.dribblesAttempted - entry.dribblesCompleted) * 0.018 + entry.crossesCompleted * 0.012 + entry.turnoversWon * 0.025 - entry.turnoversLost * 0.035;
};
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
  return cleanSheet - concessionPenalty + entry.tacklesWon * 0.025 + entry.shotsBlocked * 0.045 + entry.reboundsWon * 8e-3;
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
    const rating = 6 + resultImpact(sideScore, opponentScore) + minutesImpact(entry.minutesPlayed) + teamControlImpact(teamStats, opponentStats) + fatigueImpact(entry.minutesPlayed, finalFatigue) + attackingImpact(entry) + creationImpact(entry) + possessionImpact(entry) + goalkeeperImpact(entry, opponentScore) + defensiveImpact(entry, opponentScore) + disciplineImpact(entry) + healthImpact(entry);
    return Number(clamp(rating, 1, 10).toFixed(1));
  }
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
  passesAttempted: 0,
  passesCompleted: 0,
  controls: 0,
  dribblesAttempted: 0,
  dribblesCompleted: 0,
  tacklesAttempted: 0,
  tacklesWon: 0,
  crossesAttempted: 0,
  crossesCompleted: 0,
  shotsBlocked: 0,
  reboundsWon: 0,
  turnoversWon: 0,
  turnoversLost: 0,
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
var ensureStats = (stats, lookup, playerId, fallbackSide) => {
  const found = lookup.get(playerId);
  if (!found && !fallbackSide) return void 0;
  const side = found?.side ?? fallbackSide;
  const player = found?.player;
  if (!player) return void 0;
  if (!stats[side][playerId]) {
    stats[side][playerId] = createPlayerStats(player, side, false);
  }
  return stats[side][playerId];
};
var opponentSide2 = (side) => side === "HOME" ? "AWAY" : "HOME";
var goalkeeperIdForSide = (match, side, lineups) => {
  const team = side === "HOME" ? match.home : match.away;
  const byId = new Map(team.players.map((player) => [player.id, player]));
  return lineups[side].map((id) => id ? byId.get(id) : void 0).find((player) => player?.position === "GK" /* GK */)?.id;
};
var activeGoalkeeperAtSecond = (match, events, side, lineups, second) => {
  let keeperId = goalkeeperIdForSide(match, side, lineups);
  const team = side === "HOME" ? match.home : match.away;
  const players = new Map(team.players.map((player) => [player.id, player]));
  events.filter((event) => event.type === "SUBSTITUTION" /* SUBSTITUTION */ && event.side === side && event.second <= second).sort((a, b) => a.second - b.second).forEach((event) => {
    const playerIn = event.playerId ? players.get(event.playerId) : void 0;
    if (event.secondaryPlayerId === keeperId && playerIn) {
      keeperId = playerIn.id;
    }
  });
  return keeperId;
};
var markMinutes = (stats, lookup, match, events, finalSecond, lineups) => {
  ["HOME", "AWAY"].forEach((side) => {
    lineups[side].forEach((id) => {
      if (!id) return;
      const entry = ensureStats(stats, lookup, id, side);
      if (!entry) return;
      entry.starter = true;
      entry.startedSecond = 0;
    });
  });
  events.filter((event) => event.type === "SUBSTITUTION" /* SUBSTITUTION */).sort((a, b) => a.second - b.second).forEach((event) => {
    if (!event.side) return;
    const playerIn = event.playerId ? ensureStats(stats, lookup, event.playerId, event.side) : void 0;
    const playerOut = event.secondaryPlayerId ? ensureStats(stats, lookup, event.secondaryPlayerId, event.side) : void 0;
    if (playerIn) {
      playerIn.substitutionsOn += 1;
      if (playerIn.startedSecond === void 0) playerIn.startedSecond = event.second;
    }
    if (playerOut) {
      playerOut.substitutionsOff += 1;
      playerOut.endedSecond = Math.min(playerOut.endedSecond ?? event.second, event.second);
    }
  });
  Object.values(stats).forEach((teamStats) => {
    Object.values(teamStats).forEach((entry) => {
      if (entry.startedSecond === void 0) return;
      const end2 = entry.endedSecond ?? finalSecond;
      entry.minutesPlayed = Math.max(0, Math.ceil((end2 - entry.startedSecond) / 60));
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
    events,
    finalSecond,
    homeScore,
    awayScore,
    initialLineups,
    finalFatigue,
    teamStats
  }) => {
    const stats = {
      HOME: emptyTeamStats(),
      AWAY: emptyTeamStats()
    };
    const lookup = playerById(match);
    const lineups = activeLineups(match, initialLineups);
    markMinutes(stats, lookup, match, events, finalSecond, lineups);
    events.forEach((event) => {
      const side = event.side;
      if (event.type === "PASS_COMPLETED" /* PASS_COMPLETED */ && event.playerId) {
        const passer = ensureStats(stats, lookup, event.playerId, side);
        if (passer) {
          passer.passesAttempted += 1;
          passer.passesCompleted += 1;
        }
      }
      if (event.type === "MISPLACED_PASS" /* MISPLACED_PASS */) {
        const winner = event.playerId ? ensureStats(stats, lookup, event.playerId, side) : void 0;
        const loser = event.secondaryPlayerId ? ensureStats(stats, lookup, event.secondaryPlayerId) : void 0;
        if (winner) winner.turnoversWon += 1;
        if (loser) {
          loser.passesAttempted += 1;
          loser.turnoversLost += 1;
        }
      }
      if (event.type === "BALL_CONTROL" /* BALL_CONTROL */ && event.playerId) {
        const receiver = ensureStats(stats, lookup, event.playerId, side);
        if (receiver) receiver.controls += 1;
      }
      if (event.type === "DRIBBLING" /* DRIBBLING */ && event.playerId) {
        const dribbler = ensureStats(stats, lookup, event.playerId, side);
        if (dribbler) {
          dribbler.dribblesAttempted += 1;
          if (event.detail?.succeeded !== false) dribbler.dribblesCompleted += 1;
        }
      }
      if (event.type === "TACKLE_WON" /* TACKLE_WON */) {
        const tackler = event.playerId ? ensureStats(stats, lookup, event.playerId, side) : void 0;
        const dispossessed = event.secondaryPlayerId ? ensureStats(stats, lookup, event.secondaryPlayerId) : void 0;
        if (tackler) {
          tackler.tacklesAttempted += 1;
          tackler.tacklesWon += 1;
          tackler.turnoversWon += 1;
        }
        if (dispossessed) dispossessed.turnoversLost += 1;
      }
      if (event.type === "CROSS_NEAR_POST" /* CROSS_NEAR_POST */ || event.type === "CROSS_FAR_POST" /* CROSS_FAR_POST */) {
        const crosser = event.playerId ? ensureStats(stats, lookup, event.playerId, side) : void 0;
        if (crosser) {
          crosser.crossesAttempted += 1;
          if (event.detail?.completed !== false) crosser.crossesCompleted += 1;
        }
      }
      if (event.type === "CROSS_BLOCKED" /* CROSS_BLOCKED */ && event.secondaryPlayerId) {
        const crosser = ensureStats(stats, lookup, event.secondaryPlayerId);
        if (crosser) crosser.crossesAttempted += 1;
      }
      if (event.type === "SHOT_BLOCKED" /* SHOT_BLOCKED */) {
        const markerId = detailString(event, "markerId");
        const blocker = markerId ? ensureStats(stats, lookup, markerId) : void 0;
        if (blocker) blocker.shotsBlocked += 1;
      }
      if (event.type === "REBOUND_WON" /* REBOUND_WON */ && event.playerId) {
        const winner = ensureStats(stats, lookup, event.playerId, side);
        if (winner) winner.reboundsWon += 1;
      }
      if (isShootoutPenalty(event)) {
        if (event.playerId && (event.type === "PENALTY_SCORED" /* PENALTY_SCORED */ || event.type === "PENALTY_MISSED" /* PENALTY_MISSED */)) {
          const taker = ensureStats(stats, lookup, event.playerId, side);
          if (taker) {
            taker.penaltiesTaken += 1;
            if (event.type === "PENALTY_SCORED" /* PENALTY_SCORED */) taker.penaltiesScored += 1;
            if (event.type === "PENALTY_MISSED" /* PENALTY_MISSED */) taker.penaltiesMissed += 1;
          }
        }
        if (event.type === "PENALTY_MISSED" /* PENALTY_MISSED */ && detailBool(event, "saved")) {
          const keeperId = detailString(event, "goalkeeperId") ?? event.secondaryPlayerId;
          const keeper = keeperId ? ensureStats(stats, lookup, keeperId) : void 0;
          if (keeper) keeper.penaltiesSaved += 1;
        }
        return;
      }
      if (SHOT_TYPES.has(event.type) && event.playerId) {
        const ownGoal = isOwnGoalEvent(event);
        const shooter = ownGoal ? void 0 : ensureStats(stats, lookup, event.playerId, side);
        if (shooter) {
          shooter.shots += 1;
          shooter.xG += event.xG ?? 0;
          if (ON_TARGET_TYPES.has(event.type) || event.type === "PENALTY_MISSED" /* PENALTY_MISSED */ && detailBool(event, "saved")) shooter.shotsOnTarget += 1;
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
          const creator = ensureStats(stats, lookup, event.secondaryPlayerId, side);
          if (creator) {
            creator.chancesCreated += 1;
            if ((event.xG ?? 0) >= 0.08 || ON_TARGET_TYPES.has(event.type)) creator.keyPasses += 1;
          }
        }
      }
      if (GOAL_TYPES.has(event.type)) {
        if (isOwnGoalEvent(event)) {
          const ownPlayerId = ownGoalPlayerId(event);
          const ownPlayer = ownPlayerId ? ensureStats(stats, lookup, ownPlayerId) : void 0;
          if (ownPlayer) ownPlayer.ownGoals += 1;
        } else if (event.playerId) {
          const scorer = ensureStats(stats, lookup, event.playerId, side);
          if (scorer) scorer.goals += 1;
        }
        if (shouldCountAssist(event) && event.secondaryPlayerId) {
          const assistant = ensureStats(stats, lookup, event.secondaryPlayerId, side);
          if (assistant) assistant.assists += 1;
        }
        if (side) {
          const concedingSide = opponentSide2(side);
          const keeperId = activeGoalkeeperAtSecond(match, events, concedingSide, lineups, event.second);
          const keeper = keeperId ? ensureStats(stats, lookup, keeperId, concedingSide) : void 0;
          if (keeper) keeper.goalsConceded += 1;
        }
      }
      if (SAVE_TYPES.has(event.type) && side) {
        const keeperSide = opponentSide2(side);
        const keeperId = activeGoalkeeperAtSecond(match, events, keeperSide, lineups, event.second);
        const keeper = keeperId ? ensureStats(stats, lookup, keeperId, keeperSide) : void 0;
        if (keeper) keeper.saves += 1;
      }
      if (event.type === "PENALTY_MISSED" /* PENALTY_MISSED */ && side) {
        const keeperSide = opponentSide2(side);
        const keeperId = activeGoalkeeperAtSecond(match, events, keeperSide, lineups, event.second);
        const keeper = keeperId ? ensureStats(stats, lookup, keeperId, keeperSide) : void 0;
        if (keeper && detailBool(event, "saved")) keeper.penaltiesSaved += 1;
      }
      if (event.playerId) {
        const entry = ensureStats(stats, lookup, event.playerId, side);
        if (entry) {
          if (event.type === "FOUL" /* FOUL */ || event.type === "ADVANTAGE_PLAYED" /* ADVANTAGE_PLAYED */ || event.type === "YELLOW_CARD" /* YELLOW_CARD */ || event.type === "RED_CARD" /* RED_CARD */) {
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
      if (event.secondaryPlayerId && (event.type === "FOUL" /* FOUL */ || event.type === "ADVANTAGE_PLAYED" /* ADVANTAGE_PLAYED */ || event.type === "YELLOW_CARD" /* YELLOW_CARD */ || event.type === "RED_CARD" /* RED_CARD */)) {
        const fouled = ensureStats(stats, lookup, event.secondaryPlayerId);
        if (fouled) fouled.foulsWon += 1;
      }
    });
    Object.values(stats).forEach((teamStats2) => {
      Object.values(teamStats2).forEach((entry) => {
        if (entry.startedSecond !== void 0) {
          const end2 = entry.endedSecond ?? finalSecond;
          entry.minutesPlayed = Math.max(0, Math.ceil((end2 - entry.startedSecond) / 60));
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
    return stats;
  }
};

// services/match/engines/cupV2/CupMatchLoop.ts
var emptyStats = () => ({
  possessionTicks: 0,
  passesAttempted: 0,
  passesCompleted: 0,
  dribblesAttempted: 0,
  dribblesCompleted: 0,
  tacklesWon: 0,
  crossesAttempted: 0,
  crossesCompleted: 0,
  blocks: 0,
  reboundsWon: 0,
  turnoversWon: 0,
  turnoversLost: 0,
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
var initialFatigue = (input2) => {
  const fatigue2 = {};
  [...input2.home.players, ...input2.away.players].forEach((player) => {
    fatigue2[player.id] = player.condition;
  });
  return fatigue2;
};
var neutralCoachEffects = () => ({
  initiativeModifier: 0,
  ownShotModifier: 0,
  opponentShotModifier: 0,
  turnoverRiskModifier: 0,
  fatigueExtra: 0,
  foulMultiplier: 1,
  injuryMultiplier: 1
});
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
var createInitialCupRuntimeState = (input2) => ({
  second: 0,
  phase: "FIRST_HALF",
  possession: seededRandom(input2.seed, 0, 1) < 0.5 ? "HOME" : "AWAY",
  possessionReason: "KICK_OFF",
  ballCarrierId: void 0,
  ballZone: "MIDFIELD",
  attackPattern: "BUILD_UP",
  homeScore: 0,
  awayScore: 0,
  momentum: 0,
  pressure: { HOME: 35, AWAY: 35 },
  organization: { HOME: 72, AWAY: 72 },
  halfTimeResponse: { HOME: 0, AWAY: 0 },
  coachEffects: { HOME: neutralCoachEffects(), AWAY: neutralCoachEffects() },
  fatigue: initialFatigue(input2),
  yellowCards: {},
  redCards: {},
  injuries: {},
  substitutionsUsed: { HOME: 0, AWAY: 0 },
  firstHalfKickOffSide: seededRandom(input2.seed, 0, 1) < 0.5 ? "HOME" : "AWAY",
  restartSourceEventId: void 0,
  firstHalfAddedTimeSeconds: 0,
  secondHalfAddedTimeSeconds: 0,
  addedTimeSeconds: 0,
  stats: { HOME: emptyStats(), AWAY: emptyStats() },
  events: []
});
var selectRestartPlayer = (profile, reason) => {
  if (reason === "SAVE" || reason === "GOAL_KICK") return profile.goalkeeper;
  const preferred = reason === "CORNER" ? [...profile.midfielders, ...profile.forwards, ...profile.defenders] : [...profile.midfielders, ...profile.forwards, ...profile.defenders];
  return preferred[0] ?? profile.outfieldPlayers[0] ?? profile.goalkeeper;
};
var appendPendingRestart = (input2, state, config, homeProfile, awayProfile) => {
  const reason = state.possessionReason;
  if (reason === "OPEN_PLAY" || reason === "TURNOVER" || reason === "OUT_OF_PLAY") return;
  const profile = state.possession === "HOME" ? homeProfile : awayProfile;
  const team = state.possession === "HOME" ? input2.home : input2.away;
  const player = selectRestartPlayer(profile, reason);
  const type = reason === "CORNER" ? "CORNER_TAKEN" /* CORNER_TAKEN */ : reason === "GOAL_KICK" ? "GOAL_KICK" /* GOAL_KICK */ : reason === "SAVE" ? "GK_LONG_THROW" /* GK_LONG_THROW */ : "KICK_OFF" /* KICK_OFF */;
  const text = reason === "CORNER" ? `${player?.lastName ?? team.name} wykonuje rzut ro\u017Cny.` : reason === "GOAL_KICK" ? `${player?.lastName ?? "Bramkarz"} wznawia gr\u0119 od bramki.` : reason === "SAVE" ? `${player?.lastName ?? "Bramkarz"} szybko wprowadza pi\u0142k\u0119 do gry.` : reason === "HALF_START" ? `${team.name} rozpoczyna drug\u0105 po\u0142ow\u0119.` : reason === "GOAL_RESTART" ? `${team.name} wznawia gr\u0119 po straconej bramce.` : `${team.name} rozpoczyna spotkanie.`;
  const cornerSequenceId = `cupv2_corner_delivery_${state.second}_${state.possession}`;
  state.events.push({
    id: `cupv2_restart_${reason}_${state.second}_${state.possession}`,
    second: state.second,
    minute: CupMatchClockService.eventMinute(state, config),
    side: state.possession,
    type,
    zone: reason === "CORNER" ? "WIDE_LEFT" : reason === "GOAL_KICK" || reason === "SAVE" ? "GK" : "MIDFIELD",
    pattern: reason === "CORNER" ? "SET_PIECE" : "BUILD_UP",
    playerId: player?.id,
    text,
    detail: {
      restartReason: reason,
      sourceEventId: state.restartSourceEventId,
      sequenceId: reason === "CORNER" ? cornerSequenceId : void 0,
      setPieceKind: reason === "CORNER" ? "CORNER" : void 0
    }
  });
  state.ballCarrierId = player?.id;
  state.possessionReason = reason === "CORNER" ? "CORNER_DELIVERY" : "OPEN_PLAY";
  state.restartSourceEventId = void 0;
};
var updateFatigue = (state, input2, config) => {
  const possessionSide = state.possession;
  const activeIds2 = [
    ...input2.home.lineup.startingXI.filter((id) => Boolean(id)),
    ...input2.away.lineup.startingXI.filter((id) => Boolean(id))
  ].filter((id) => !state.redCards[id]);
  activeIds2.forEach((id) => {
    const player = [...input2.home.players, ...input2.away.players].find((item) => item.id === id);
    if (!player) return;
    const team = input2.home.players.some((item) => item.id === id) ? input2.home : input2.away;
    const isPossessionTeam = team.side === possessionSide;
    const instructionCost = team.instructions.tempo === "FAST" ? 0.01 : team.instructions.tempo === "SLOW" ? 4e-3 : 6e-3;
    const pressingCost = team.instructions.pressing === "PRESSING" ? 6e-3 : 2e-3;
    const coachCost = state.coachEffects[team.side].fatigueExtra * 0.24;
    const injuryCost = state.injuries[id] === "SEVERE" ? 0.03 : state.injuries[id] === "LIGHT" ? 0.012 : 0;
    const staminaShield = player.attributes.stamina * 65e-6 + player.attributes.workRate * 25e-6;
    const costPerTick = (instructionCost + pressingCost + coachCost + injuryCost + (isPossessionTeam ? 1e-3 : 2e-3)) * (config.tickSeconds / 5);
    state.fatigue[id] = clamp((state.fatigue[id] ?? player.condition) - Math.max(1e-3, costPerTick - staminaShield), 15, 100);
  });
};
var applyEventToState = (state, event) => {
  const { type: eventType, side } = event;
  if (!side) return;
  const stats = state.stats[side];
  const opponentStats = state.stats[side === "HOME" ? "AWAY" : "HOME"];
  if (eventType === "GOAL" /* GOAL */ || eventType === "ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */) {
    if (side === "HOME") state.homeScore += 1;
    else state.awayScore += 1;
  }
  if (eventType === "PENALTY_SCORED" /* PENALTY_SCORED */) {
    if (side === "HOME") state.homeScore += 1;
    else state.awayScore += 1;
  }
  if (eventType === "FREE_KICK" /* FREE_KICK */ || eventType === "FREE_KICK_DANGEROUS" /* FREE_KICK_DANGEROUS */) stats.freeKicks += 1;
  if (eventType === "PENALTY_AWARDED" /* PENALTY_AWARDED */) stats.penalties += 1;
  if (eventType === "FOUL" /* FOUL */) stats.fouls += 1;
  if (eventType === "ADVANTAGE_PLAYED" /* ADVANTAGE_PLAYED */) stats.fouls += 1;
  if (eventType === "YELLOW_CARD" /* YELLOW_CARD */) {
    stats.fouls += 1;
    stats.yellowCards += 1;
  }
  if (eventType === "RED_CARD" /* RED_CARD */) {
    stats.fouls += 1;
    stats.redCards += 1;
  }
  if (eventType === "INJURY_LIGHT" /* INJURY_LIGHT */ || eventType === "INJURY_SEVERE" /* INJURY_SEVERE */) {
    stats.injuries += 1;
  }
  if (eventType === "PASS_COMPLETED" /* PASS_COMPLETED */) {
    stats.passesAttempted += 1;
    stats.passesCompleted += 1;
  }
  if (eventType === "MISPLACED_PASS" /* MISPLACED_PASS */) {
    opponentStats.passesAttempted += 1;
    stats.turnoversWon += 1;
    opponentStats.turnoversLost += 1;
  }
  if (eventType === "DRIBBLING" /* DRIBBLING */) {
    stats.dribblesAttempted += 1;
    if (event.detail?.succeeded !== false) stats.dribblesCompleted += 1;
  }
  if (eventType === "TACKLE_WON" /* TACKLE_WON */) {
    stats.tacklesWon += 1;
    stats.turnoversWon += 1;
    opponentStats.turnoversLost += 1;
  }
  if (eventType === "CROSS_NEAR_POST" /* CROSS_NEAR_POST */ || eventType === "CROSS_FAR_POST" /* CROSS_FAR_POST */) {
    stats.crossesAttempted += 1;
    if (event.detail?.completed !== false) stats.crossesCompleted += 1;
  }
  if (eventType === "CROSS_BLOCKED" /* CROSS_BLOCKED */) {
    stats.blocks += 1;
    opponentStats.crossesAttempted += 1;
  }
  if (eventType === "SHOT_BLOCKED" /* SHOT_BLOCKED */) opponentStats.blocks += 1;
  if (eventType === "REBOUND_WON" /* REBOUND_WON */) stats.reboundsWon += 1;
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
var applyBallCarrierEvent = (state, event) => {
  if (RECEIVER_CARRIER_EVENTS.has(event.type) && event.secondaryPlayerId) {
    state.ballCarrierId = event.secondaryPlayerId;
    return;
  }
  if (ACTOR_CARRIER_EVENTS.has(event.type) && event.playerId) {
    state.ballCarrierId = event.playerId;
    return;
  }
  if (event.type === "GOAL" /* GOAL */ || event.type === "ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */ || event.type === "PENALTY_SCORED" /* PENALTY_SCORED */ || event.type === "SHOT" /* SHOT */ || event.type === "SHOT_ON_TARGET" /* SHOT_ON_TARGET */ || event.type === "SHOT_POST" /* SHOT_POST */ || event.type === "SHOT_BAR" /* SHOT_BAR */) {
    state.ballCarrierId = void 0;
  }
};
var updateOrganization = (state, input2, homeProfile, awayProfile) => {
  const calculate = (side, profile) => {
    const team = side === "HOME" ? input2.home : input2.away;
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
var maybeExecuteSubstitution = (input2, state, side, profile, config) => {
  const footballSecond = CupMatchClockService.toFootballSecond(state, config);
  const minute = Math.floor(footballSecond / 60);
  const team = side === "HOME" ? input2.home : input2.away;
  const hasInjuredStarter = team.lineup.startingXI.some((id) => Boolean(id && state.injuries[id]));
  const hasSevereInjuredStarter = team.lineup.startingXI.some((id) => Boolean(id && state.injuries[id] === "SEVERE"));
  if (!hasInjuredStarter && (minute < 55 || footballSecond % (5 * 60) !== 0)) return;
  if (!hasInjuredStarter && seededRandom(input2.seed, state.second, side === "HOME" ? 811 : 812) > 0.54) return;
  if (hasInjuredStarter && !hasSevereInjuredStarter && seededRandom(input2.seed, state.second, side === "HOME" ? 813 : 814) > 0.82) return;
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
  runPeriod: (input2, state, periodEndSecond, config = { ...DEFAULT_CUP_ENGINE_CONFIG, ...input2.config }) => {
    while (state.second < periodEndSecond && state.phase !== "FINISHED" && state.phase !== "PENALTY_SHOOTOUT") {
      const homeProfile = CupTeamProfileService.buildProfile(input2.home, state.fatigue, state.redCards, state.injuries);
      const awayProfile = CupTeamProfileService.buildProfile(input2.away, state.fatigue, state.redCards, state.injuries);
      const random = (salt) => seededRandom(input2.seed, state.second, salt);
      appendPendingRestart(input2, state, config, homeProfile, awayProfile);
      state.pressure.HOME = CupMomentumService.pressureForSide(state, state.homeScore, state.awayScore, homeProfile);
      state.pressure.AWAY = CupMomentumService.pressureForSide(state, state.awayScore, state.homeScore, awayProfile);
      updateOrganization(state, input2, homeProfile, awayProfile);
      const outcome = CupActionBuilder.simulateTick({
        input: input2,
        config,
        state,
        homeProfile,
        awayProfile,
        random
      });
      outcome.events.forEach((event) => {
        applyEventToState(state, event);
        applyPlayerEventToState(state, event.type, event.playerId);
        applyBallCarrierEvent(state, event);
        state.events.push(event);
      });
      state.momentum = CupMomentumService.updateMomentum(state, homeProfile, awayProfile, outcome.momentumDelta);
      if (outcome.nextPossession) {
        const nextTeam = outcome.nextPossession === "HOME" ? input2.home : input2.away;
        if (!nextTeam.players.some((player) => player.id === state.ballCarrierId)) {
          state.ballCarrierId = void 0;
        }
        state.possession = outcome.nextPossession;
      }
      if (outcome.nextZone) state.ballZone = outcome.nextZone;
      if (outcome.nextPossessionReason) {
        state.possessionReason = outcome.nextPossessionReason;
        state.restartSourceEventId = outcome.restartSourceEventId;
      } else if (outcome.nextPossession) {
        state.possessionReason = "TURNOVER";
        state.restartSourceEventId = void 0;
      }
      updateFatigue(state, input2, config);
      maybeExecuteSubstitution(input2, state, "HOME", homeProfile, config);
      maybeExecuteSubstitution(input2, state, "AWAY", awayProfile, config);
      state.second += config.tickSeconds;
    }
    return state;
  }
};

// services/match/engines/cupV2/CupMatchEngineV2.ts
var alignedAddedTime = (state, config, fromSecond) => {
  const rawSeconds = CupExtraTimeService.getAddedTimeSeconds(state, {
    fromSecond,
    toSecond: state.second
  });
  return Math.ceil(rawSeconds / config.tickSeconds) * config.tickSeconds;
};
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
var cloneInput = (input2) => ({
  ...input2,
  home: cloneTeam(input2.home),
  away: cloneTeam(input2.away),
  environment: { ...input2.environment },
  config: input2.config ? { ...input2.config } : void 0,
  halfTimeTalks: input2.halfTimeTalks ? { ...input2.halfTimeTalks } : void 0
});
var cloneLineup = (lineup) => ({
  ...lineup,
  startingXI: [...lineup.startingXI],
  bench: [...lineup.bench],
  reserves: [...lineup.reserves]
});
var activePlayers3 = (team) => {
  const byId = new Map(team.players.map((player) => [player.id, player]));
  return team.lineup.startingXI.map((id) => id ? byId.get(id) : void 0).filter((player) => Boolean(player));
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
var applyHalfTimeTalk = (input2, state) => {
  const talks = input2.halfTimeTalks;
  if (!talks) return;
  ["HOME", "AWAY"].forEach((side) => {
    const talk = talks[side];
    if (!talk || talk.style === "NONE") return;
    const team = side === "HOME" ? input2.home : input2.away;
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
    state.halfTimeResponse[side] = clamp(
      motivationDelta * 0.78 + Math.max(0, organizationDelta) * 0.22,
      0,
      12
    );
  });
};
var buildResult = (input2, state, initialLineup, shootout) => {
  const playerStats = CupPlayerStatsAggregator.aggregate({
    match: input2,
    events: state.events,
    finalSecond: state.second,
    homeScore: state.homeScore,
    awayScore: state.awayScore,
    initialLineups: {
      HOME: initialLineup.HOME.startingXI,
      AWAY: initialLineup.AWAY.startingXI
    },
    finalFatigue: state.fatigue,
    teamStats: state.stats
  });
  const winner = shootout?.winner ?? (state.homeScore > state.awayScore ? "HOME" : state.awayScore > state.homeScore ? "AWAY" : void 0);
  return {
    homeScore: state.homeScore,
    awayScore: state.awayScore,
    winner,
    decidedByPenalties: Boolean(shootout),
    penaltyScore: shootout?.penaltyScore,
    penaltyShootout: shootout?.attempts,
    stats: state.stats,
    playerStats,
    events: state.events,
    finalState: state
  };
};
var cloneResult = (result) => ({
  ...result,
  penaltyScore: result.penaltyScore ? { ...result.penaltyScore } : void 0,
  penaltyShootout: result.penaltyShootout?.map((attempt) => ({ ...attempt })),
  stats: {
    HOME: { ...result.stats.HOME },
    AWAY: { ...result.stats.AWAY }
  },
  playerStats: {
    HOME: Object.fromEntries(Object.entries(result.playerStats.HOME).map(([id, stats]) => [id, { ...stats }])),
    AWAY: Object.fromEntries(Object.entries(result.playerStats.AWAY).map(([id, stats]) => [id, { ...stats }]))
  },
  events: result.events.map((event) => ({
    ...event,
    detail: event.detail ? { ...event.detail } : void 0
  })),
  finalState: {
    ...result.finalState,
    pressure: { ...result.finalState.pressure },
    organization: { ...result.finalState.organization },
    halfTimeResponse: { ...result.finalState.halfTimeResponse },
    coachEffects: {
      HOME: { ...result.finalState.coachEffects.HOME },
      AWAY: { ...result.finalState.coachEffects.AWAY }
    },
    fatigue: { ...result.finalState.fatigue },
    yellowCards: { ...result.finalState.yellowCards },
    redCards: { ...result.finalState.redCards },
    injuries: { ...result.finalState.injuries },
    substitutionsUsed: { ...result.finalState.substitutionsUsed },
    stats: {
      HOME: { ...result.finalState.stats.HOME },
      AWAY: { ...result.finalState.stats.AWAY }
    },
    events: result.finalState.events.map((event) => ({
      ...event,
      detail: event.detail ? { ...event.detail } : void 0
    }))
  }
});
var finishLiveMatch = (live) => {
  if (live.finalResult) return live.finalResult;
  live.state.phase = "FINISHED";
  live.finalResult = buildResult(live.input, live.state, live.initialLineup);
  return live.finalResult;
};
var finishLiveMatchWithPenalties = (live) => {
  if (live.finalResult) return live.finalResult;
  live.state.phase = "PENALTY_SHOOTOUT";
  const penalties = CupPenaltyShootoutService.simulate(live.input, live.state.fatigue, {
    redCards: live.state.redCards,
    injuries: live.state.injuries,
    startSecond: live.state.second
  });
  live.state.events.push(...penalties.events);
  live.state.second = Math.max(live.state.second, ...penalties.events.map((event) => event.second));
  live.state.phase = "FINISHED";
  live.finalResult = buildResult(live.input, live.state, live.initialLineup, {
    penaltyScore: { home: penalties.home, away: penalties.away },
    attempts: penalties.attempts,
    winner: penalties.winner
  });
  return live.finalResult;
};
var CupMatchEngineV2 = {
  /**
   * Creates an advance-only live simulation. No match tick is executed here,
   * therefore the score, winner and future event list are unknown at kick-off.
   */
  createLiveMatch: (input2) => {
    const runtimeInput = cloneInput(input2);
    const config = { ...DEFAULT_CUP_ENGINE_CONFIG, ...runtimeInput.config };
    return {
      input: runtimeInput,
      config,
      state: createInitialCupRuntimeState(runtimeInput),
      initialLineup: {
        HOME: cloneLineup(runtimeInput.home.lineup),
        AWAY: cloneLineup(runtimeInput.away.lineup)
      },
      halfTimeTalkApplied: false
    };
  },
  /**
   * Advances only toward `targetSecond`. Requests behind the current clock are
   * ignored so a tactical change can never cause already played actions to be
   * simulated again. A non-null return value means the match has finished.
   */
  advanceLiveMatch: (live, targetSecond) => {
    if (live.finalResult) return live.finalResult;
    const requestedSecond = Math.max(live.state.second, Math.floor(targetSecond));
    const firstHalfRegulationEnd = Math.floor(live.config.normalTimeSeconds / 2);
    if (live.state.second < firstHalfRegulationEnd) {
      CupMatchLoop.runPeriod(live.input, live.state, Math.min(requestedSecond, firstHalfRegulationEnd), live.config);
      if (requestedSecond <= firstHalfRegulationEnd) return null;
    }
    if (live.state.firstHalfAddedTimeSeconds === 0) {
      live.state.firstHalfAddedTimeSeconds = alignedAddedTime(live.state, live.config, 0);
      live.state.addedTimeSeconds = live.state.firstHalfAddedTimeSeconds;
    }
    const firstHalfEnd = firstHalfRegulationEnd + live.state.firstHalfAddedTimeSeconds;
    if (live.state.second < firstHalfEnd) {
      CupMatchLoop.runPeriod(live.input, live.state, Math.min(requestedSecond, firstHalfEnd), live.config);
      if (requestedSecond < firstHalfEnd || live.state.second < firstHalfEnd) return null;
    }
    if (!live.halfTimeTalkApplied) {
      applyHalfTimeTalk(live.input, live.state);
      live.halfTimeTalkApplied = true;
      live.state.phase = "SECOND_HALF";
      live.state.possession = live.state.firstHalfKickOffSide === "HOME" ? "AWAY" : "HOME";
      live.state.possessionReason = "HALF_START";
      live.state.ballCarrierId = void 0;
      live.state.ballZone = "MIDFIELD";
    }
    const secondHalfRegulationEnd = firstHalfEnd + (live.config.normalTimeSeconds - firstHalfRegulationEnd);
    if (live.state.second < secondHalfRegulationEnd) {
      CupMatchLoop.runPeriod(live.input, live.state, Math.min(requestedSecond, secondHalfRegulationEnd), live.config);
      if (requestedSecond < secondHalfRegulationEnd || live.state.second < secondHalfRegulationEnd) return null;
    }
    if (live.state.secondHalfAddedTimeSeconds === 0) {
      live.state.secondHalfAddedTimeSeconds = alignedAddedTime(live.state, live.config, firstHalfEnd);
      live.state.addedTimeSeconds = live.state.firstHalfAddedTimeSeconds + live.state.secondHalfAddedTimeSeconds;
    }
    const normalTimeEnd = secondHalfRegulationEnd + live.state.secondHalfAddedTimeSeconds;
    if (live.state.second < normalTimeEnd) {
      CupMatchLoop.runPeriod(live.input, live.state, Math.min(requestedSecond, normalTimeEnd), live.config);
      if (requestedSecond < normalTimeEnd || live.state.second < normalTimeEnd) return null;
    }
    if (live.state.homeScore !== live.state.awayScore || !live.config.enableExtraTime) {
      return finishLiveMatch(live);
    }
    const extraTimeHalfEnd = normalTimeEnd + 15 * 60;
    if (live.state.second < extraTimeHalfEnd) {
      live.state.phase = "EXTRA_TIME_1";
      CupMatchLoop.runPeriod(live.input, live.state, Math.min(requestedSecond, extraTimeHalfEnd), live.config);
      if (requestedSecond < extraTimeHalfEnd || live.state.second < extraTimeHalfEnd) return null;
    }
    const extraTimeEnd = normalTimeEnd + live.config.extraTimeSeconds;
    if (live.state.second < extraTimeEnd) {
      live.state.phase = "EXTRA_TIME_2";
      CupMatchLoop.runPeriod(live.input, live.state, Math.min(requestedSecond, extraTimeEnd), live.config);
      if (requestedSecond < extraTimeEnd || live.state.second < extraTimeEnd) return null;
    }
    if (live.state.homeScore !== live.state.awayScore || !live.config.enablePenaltyShootout) {
      return finishLiveMatch(live);
    }
    return finishLiveMatchWithPenalties(live);
  },
  /**
   * Returns a detached report for the elapsed portion without advancing time.
   * The clone is intentional: a React view may sort or annotate its copy, but
   * it must never mutate the authoritative event history held by the engine.
   */
  snapshotLiveMatch: (live) => cloneResult(live.finalResult ?? buildResult(live.input, live.state, live.initialLineup)),
  /** Returns the committed result only after the live state reached full time. */
  finalizeLiveMatch: (live) => live.finalResult ?? null,
  /**
   * Applies a legal manual substitution in place. The event log is the source
   * of truth for players who already left the pitch, preventing illegal returns.
   */
  applyManualSubstitution: (live, side, playerOutId, playerInId) => {
    if (live.finalResult || playerOutId === playerInId) return false;
    if (live.state.substitutionsUsed[side] >= live.config.maxSubstitutions) return false;
    if (live.state.redCards[playerOutId] || live.state.redCards[playerInId]) return false;
    const team = side === "HOME" ? live.input.home : live.input.away;
    const slotIndex = team.lineup.startingXI.findIndex((id) => id === playerOutId);
    if (slotIndex < 0 || !team.lineup.bench.includes(playerInId)) return false;
    const alreadyLeftPitch = live.state.events.some(
      (event) => event.type === "SUBSTITUTION" /* SUBSTITUTION */ && event.secondaryPlayerId === playerInId
    );
    if (alreadyLeftPitch) return false;
    const playerOut = team.players.find((player) => player.id === playerOutId);
    const playerIn = team.players.find((player) => player.id === playerInId);
    if (!playerOut || !playerIn) return false;
    team.lineup.startingXI[slotIndex] = playerInId;
    team.lineup.bench = team.lineup.bench.filter((id) => id !== playerInId);
    team.lineup.bench.push(playerOutId);
    live.state.substitutionsUsed[side] += 1;
    live.state.fatigue[playerInId] = Math.min(
      playerIn.condition,
      live.state.fatigue[playerInId] ?? playerIn.condition
    );
    live.state.events.push({
      id: `cupv2_manual_substitution_${live.state.second}_${side}_${playerOutId}_${playerInId}`,
      second: live.state.second,
      minute: CupMatchClockService.eventMinute(live.state, live.config),
      side,
      type: "SUBSTITUTION" /* SUBSTITUTION */,
      playerId: playerInId,
      secondaryPlayerId: playerOutId,
      text: `${team.name} dokonuje zmiany: ${playerIn.lastName} za ${playerOut.lastName}.`,
      detail: {
        reason: "MANUAL",
        substitutionsUsed: live.state.substitutionsUsed[side]
      }
    });
    return true;
  },
  /**
   * Publiczne wejście silnika. Na tym etapie moduł jest przeznaczony do
   * symulacji, testów balansu i późniejszego podłączenia do widoku Pucharu
   * Polski. Nie modyfikuje istniejącego silnika live.
   */
  simulate: (input2) => {
    const runtimeInput = cloneInput(input2);
    const initialLineups = {
      HOME: [...runtimeInput.home.lineup.startingXI],
      AWAY: [...runtimeInput.away.lineup.startingXI]
    };
    const config = { ...DEFAULT_CUP_ENGINE_CONFIG, ...runtimeInput.config };
    const state = createInitialCupRuntimeState(runtimeInput);
    state.phase = "FIRST_HALF";
    const firstHalfRegulationEnd = Math.floor(config.normalTimeSeconds / 2);
    CupMatchLoop.runPeriod(runtimeInput, state, firstHalfRegulationEnd, config);
    state.firstHalfAddedTimeSeconds = alignedAddedTime(state, config, 0);
    state.addedTimeSeconds = state.firstHalfAddedTimeSeconds;
    const firstHalfEnd = firstHalfRegulationEnd + state.firstHalfAddedTimeSeconds;
    CupMatchLoop.runPeriod(runtimeInput, state, firstHalfEnd, config);
    applyHalfTimeTalk(runtimeInput, state);
    state.phase = "SECOND_HALF";
    state.possession = state.firstHalfKickOffSide === "HOME" ? "AWAY" : "HOME";
    state.possessionReason = "HALF_START";
    state.ballCarrierId = void 0;
    state.ballZone = "MIDFIELD";
    const secondHalfRegulationEnd = firstHalfEnd + (config.normalTimeSeconds - firstHalfRegulationEnd);
    CupMatchLoop.runPeriod(runtimeInput, state, secondHalfRegulationEnd, config);
    state.secondHalfAddedTimeSeconds = alignedAddedTime(state, config, firstHalfEnd);
    state.addedTimeSeconds = state.firstHalfAddedTimeSeconds + state.secondHalfAddedTimeSeconds;
    const normalTimeEnd = secondHalfRegulationEnd + state.secondHalfAddedTimeSeconds;
    CupMatchLoop.runPeriod(runtimeInput, state, normalTimeEnd, config);
    if (state.homeScore === state.awayScore && config.enableExtraTime) {
      state.phase = "EXTRA_TIME_1";
      CupMatchLoop.runPeriod(runtimeInput, state, normalTimeEnd + 15 * 60, config);
      state.phase = "EXTRA_TIME_2";
      CupMatchLoop.runPeriod(runtimeInput, state, normalTimeEnd + config.extraTimeSeconds, config);
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
      state.second = Math.max(state.second, ...penalties.events.map((event) => event.second));
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

// services/match/engines/v2/MatchEngineV2Rules.ts
var LEAGUE_MATCH_RULES_V2 = Object.freeze({
  id: "POLISH_LEAGUE_2026_27",
  normalTimeSeconds: 90 * 60,
  extraTimeSeconds: 0,
  maxSubstitutions: 5,
  allowDraw: true,
  enableExtraTime: false,
  enablePenaltyShootout: false
});
var KNOCKOUT_MATCH_RULES_V2 = Object.freeze({
  id: "KNOCKOUT_STANDARD",
  normalTimeSeconds: 90 * 60,
  extraTimeSeconds: 30 * 60,
  maxSubstitutions: 5,
  allowDraw: false,
  enableExtraTime: true,
  enablePenaltyShootout: true
});
var validateMatchEngineV2Rules = (rules) => {
  if (!rules.id.trim()) throw new Error("Match Engine V2 rules require an id.");
  if (rules.normalTimeSeconds <= 0) throw new Error("Normal time must be positive.");
  if (rules.maxSubstitutions < 0) throw new Error("Substitution limit cannot be negative.");
  if (rules.enablePenaltyShootout && rules.allowDraw) {
    throw new Error("A match cannot both allow a draw and require penalties.");
  }
  if (rules.enableExtraTime && rules.extraTimeSeconds <= 0) {
    throw new Error("Extra time must have a positive duration when enabled.");
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

// services/match/engines/v2/MatchEngineV2TeamPhaseService.ts
var TRANSITION_DURATION_SECONDS = 8;
var settledPhase = (side, possession, ballZone) => {
  if (side !== possession) return "DEFENSIVE_SHAPE";
  if (ballZone === "GK" || ballZone === "DEFENSE") return "BUILD_UP";
  if (ballZone === "FINAL_THIRD" || ballZone === "BOX" || ballZone === "WIDE_LEFT" || ballZone === "WIDE_RIGHT") {
    return "FINAL_THIRD";
  }
  return "ATTACK";
};
var createContext = (side, possession, ballZone, second) => {
  const phase = settledPhase(side, possession, ballZone);
  return {
    phase,
    previousPhase: phase,
    phaseChangedAtSecond: second
  };
};
var updateContext = (previous, side, possession, ballZone, second, possessionChanged) => {
  let phase;
  if (possessionChanged) {
    phase = side === possession ? "TRANSITION_ATTACK" : "TRANSITION_DEFEND";
  } else if ((previous.phase === "TRANSITION_ATTACK" || previous.phase === "TRANSITION_DEFEND") && second - previous.phaseChangedAtSecond < TRANSITION_DURATION_SECONDS) {
    phase = previous.phase;
  } else {
    phase = settledPhase(side, possession, ballZone);
  }
  if (phase === previous.phase) return previous;
  return {
    phase,
    previousPhase: previous.phase,
    phaseChangedAtSecond: second
  };
};
var MatchEngineV2TeamPhaseService = {
  createContext,
  updateContext,
  transitionDurationSeconds: TRANSITION_DURATION_SECONDS
};

// services/match/engines/v2/MatchEngineV2TeamShapeService.ts
var PITCH_LENGTH = 105;
var PITCH_WIDTH = 68;
var clamp2 = (value, min, max) => Math.min(max, Math.max(min, value));
var clampToMovementZone = (point2, player) => ({
  x: clamp2(point2.x, player.movementZone.minX, player.movementZone.maxX),
  y: clamp2(point2.y, player.movementZone.minY, player.movementZone.maxY)
});
var rolePhaseShift = (role, phase) => {
  const byPhase = {
    DEFENSIVE_SHAPE: { GK: 0, DEF: -3.2, MID: -4.5, FWD: -5.5 },
    BUILD_UP: { GK: 0, DEF: 1.2, MID: 0.5, FWD: -1.2 },
    ATTACK: { GK: 0, DEF: 2.5, MID: 5, FWD: 6.5 },
    FINAL_THIRD: { GK: 0, DEF: 4, MID: 7.5, FWD: 10 },
    TRANSITION_ATTACK: { GK: 0, DEF: 1.8, MID: 6.5, FWD: 11 },
    TRANSITION_DEFEND: { GK: 0, DEF: -4.5, MID: -7, FWD: -4 }
  };
  return byPhase[phase][role];
};
var widthScale = (phase, instructions) => {
  const base = {
    DEFENSIVE_SHAPE: 0.86,
    BUILD_UP: 1.05,
    ATTACK: 1.08,
    FINAL_THIRD: 1.1,
    TRANSITION_ATTACK: 1.04,
    TRANSITION_DEFEND: 0.9
  };
  const passingAdjustment = instructions.passing === "SHORT" ? -0.03 : instructions.passing === "LONG" ? 0.03 : 0;
  return clamp2(base[phase] + passingAdjustment, 0.8, 1.14);
};
var targetForPlayer = ({
  player,
  ball,
  phase,
  tactic,
  instructions,
  isPresser
}) => {
  const direction = player.side === "HOME" ? 1 : -1;
  const hasPossession = phase === "BUILD_UP" || phase === "ATTACK" || phase === "FINAL_THIRD" || phase === "TRANSITION_ATTACK";
  if (player.role === "GK" /* GK */) {
    const goalY = player.side === "HOME" ? 4.8 : PITCH_LENGTH - 4.8;
    const sweeperDepth = hasPossession ? 2.8 : 1.2;
    return {
      intent: "HOLD_SHAPE",
      point: clampToMovementZone({
        x: clamp2(PITCH_WIDTH / 2 + (ball.x - PITCH_WIDTH / 2) * 0.08, 30, 38),
        y: goalY + sweeperDepth * direction
      }, player)
    };
  }
  if (isPresser && !hasPossession) {
    return {
      intent: "PRESS",
      point: clampToMovementZone(ball, player)
    };
  }
  const ballProgressForSide = (ball.y - PITCH_LENGTH / 2) * direction;
  const ballLongitudinalShift = clamp2(ballProgressForSide * (hasPossession ? 0.14 : 0.1), -6.5, 6.5);
  const ballLateralShift = clamp2((ball.x - PITCH_WIDTH / 2) * (hasPossession ? 0.18 : 0.13), -5.5, 5.5);
  const roleShiftFactor = player.role === "DEF" /* DEF */ ? 0.72 : player.role === "MID" /* MID */ ? 0.9 : 1;
  const mindsetShift = instructions.mindset === "OFFENSIVE" ? 2 : instructions.mindset === "DEFENSIVE" ? -2 : 0;
  const tacticShift = clamp2((tactic.attackBias - tactic.defenseBias) / 18, -2.2, 2.2);
  const scaledAnchorX = PITCH_WIDTH / 2 + (player.anchor.x - PITCH_WIDTH / 2) * widthScale(phase, instructions);
  const centrality = clamp2(1 - Math.abs(player.anchor.x - PITCH_WIDTH / 2) / 30, 0.25, 1);
  const point2 = {
    x: scaledAnchorX + ballLateralShift * centrality,
    y: player.anchor.y + direction * (rolePhaseShift(player.role, phase) + ballLongitudinalShift * roleShiftFactor + mindsetShift + tacticShift)
  };
  const intent = phase === "TRANSITION_DEFEND" || phase === "DEFENSIVE_SHAPE" ? "RECOVER" : (phase === "FINAL_THIRD" || phase === "TRANSITION_ATTACK") && player.role === "FWD" /* FWD */ ? "RUN_BEHIND" : "SUPPORT";
  return {
    intent,
    point: clampToMovementZone(point2, player)
  };
};
var MatchEngineV2TeamShapeService = {
  targetForPlayer
};

// services/match/engines/v2/MatchEngineV2MotionService.ts
var MAX_INTEGRATION_SECONDS = 1.25;
var MAX_ACCELERATION = 3.2;
var MAX_BRAKING = 4.6;
var MAX_TURN_RADIANS_PER_SECOND = 2.8;
var ARRIVAL_DISTANCE = 0.18;
var clamp3 = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
var normaliseAngle = (angle) => {
  let result = angle;
  while (result > Math.PI) result -= Math.PI * 2;
  while (result < -Math.PI) result += Math.PI * 2;
  return result;
};
var urgentIntent = (intent) => intent === "PRESS" || intent === "RUN_BEHIND" || intent === "RECOVER";
var advancePlayer = ({
  player,
  proposedTarget,
  proposedIntent,
  matchSecond,
  elapsedSeconds,
  maximumStepMetres
}) => {
  const mayChangeIntent = proposedIntent === player.movementIntent || matchSecond >= player.intentCommittedUntilSecond || urgentIntent(proposedIntent);
  player.target = { ...proposedTarget };
  if (mayChangeIntent && proposedIntent !== player.movementIntent) {
    player.movementIntent = proposedIntent;
    player.intentCommittedUntilSecond = matchSecond + (urgentIntent(proposedIntent) ? 4 : 3);
  }
  const dx = player.target.x - player.position.x;
  const dy = player.target.y - player.position.y;
  const distance = Math.hypot(dx, dy);
  const dt = clamp3(elapsedSeconds, 0, MAX_INTEGRATION_SECONDS);
  if (dt <= 0) return;
  if (distance <= ARRIVAL_DISTANCE) {
    player.position = { ...player.target };
    player.velocity = { x: 0, y: 0 };
    player.movementState = "IDLE";
    return;
  }
  const currentSpeed = Math.hypot(player.velocity.x, player.velocity.y);
  const desiredHeading = Math.atan2(dy, dx);
  const headingDelta = normaliseAngle(desiredHeading - player.facingRadians);
  const maximumTurn = MAX_TURN_RADIANS_PER_SECOND * dt;
  const nextHeading = player.facingRadians + clamp3(headingDelta, -maximumTurn, maximumTurn);
  const stoppingLimitedSpeed = Math.sqrt(2 * MAX_BRAKING * distance);
  const desiredSpeed = Math.min(player.metresPerSecond, stoppingLimitedSpeed, distance / dt);
  const speedDelta = desiredSpeed - currentSpeed;
  const accelerationLimit = (speedDelta >= 0 ? MAX_ACCELERATION : MAX_BRAKING) * dt;
  const nextSpeed = clamp3(currentSpeed + clamp3(speedDelta, -accelerationLimit, accelerationLimit), 0, player.metresPerSecond);
  const step2 = Math.min(distance, maximumStepMetres, nextSpeed * dt);
  const directionX = Math.cos(nextHeading);
  const directionY = Math.sin(nextHeading);
  player.position = {
    x: player.position.x + directionX * step2,
    y: player.position.y + directionY * step2
  };
  player.velocity = {
    x: directionX * nextSpeed,
    y: directionY * nextSpeed
  };
  player.facingRadians = nextHeading;
  player.movementState = nextSpeed < currentSpeed - 0.05 ? "BRAKING" : nextSpeed < player.metresPerSecond * 0.72 ? "ACCELERATING" : "RUNNING";
};
var MatchEngineV2MotionService = {
  advancePlayer
};

// services/match/engines/v2/MatchEngineV2BallService.ts
var velocityBetween = (start2, end2, elapsedSeconds) => ({
  x: (end2.x - start2.x) / elapsedSeconds,
  y: (end2.y - start2.y) / elapsedSeconds,
  z: 0
});
var travellingKind = (cue) => cue.kind === "PASS" || cue.kind === "CROSS" || cue.kind === "SHOT" || cue.kind === "GOAL" || cue.kind === "BLOCK" || cue.kind === "SAVE";
var controlledKind = (cue) => cue.kind === "CONTROL" || cue.kind === "DRIBBLE" || cue.kind === "TACKLE" || cue.kind === "TURNOVER" || cue.kind === "REBOUND";
var resolve = ({
  previous,
  carrier,
  latestCue,
  fallback,
  second
}) => {
  const elapsed = Math.max(0.2, second - previous.lastUpdatedSecond);
  if (latestCue?.atSecond === second && travellingKind(latestCue)) {
    const target = latestCue.end;
    return {
      x: target.x,
      y: target.y,
      z: latestCue.kind === "SHOT" || latestCue.kind === "GOAL" ? 1.2 : 0.25,
      velocity: velocityBetween(previous, target, elapsed),
      intendedReceiverId: latestCue.kind === "PASS" || latestCue.kind === "CROSS" ? latestCue.secondaryPlayerId : void 0,
      lastTouchPlayerId: latestCue.actorId ?? previous.lastTouchPlayerId,
      lastUpdatedSecond: second,
      phase: "TRAVELLING"
    };
  }
  if (latestCue?.atSecond === second && latestCue.kind === "RESTART") {
    return {
      x: latestCue.end.x,
      y: latestCue.end.y,
      z: 0,
      velocity: { x: 0, y: 0, z: 0 },
      lastTouchPlayerId: latestCue.actorId ?? previous.lastTouchPlayerId,
      lastUpdatedSecond: second,
      phase: "DEAD"
    };
  }
  if (latestCue?.atSecond === second && controlledKind(latestCue)) {
    const ownerId = latestCue.actorId ?? carrier?.playerId;
    const ownerPoint = ownerId && carrier?.playerId === ownerId ? carrier.position : latestCue.end;
    return {
      x: ownerPoint.x,
      y: ownerPoint.y,
      z: 0,
      velocity: carrier?.playerId === ownerId ? { x: carrier.velocity.x, y: carrier.velocity.y, z: 0 } : velocityBetween(previous, ownerPoint, elapsed),
      ownerId,
      lastTouchPlayerId: ownerId ?? previous.lastTouchPlayerId,
      lastUpdatedSecond: second,
      phase: "CONTROLLED"
    };
  }
  if (carrier) {
    return {
      x: carrier.position.x,
      y: carrier.position.y,
      z: 0,
      velocity: { x: carrier.velocity.x, y: carrier.velocity.y, z: 0 },
      ownerId: carrier.playerId,
      lastTouchPlayerId: carrier.playerId,
      lastUpdatedSecond: second,
      phase: "CONTROLLED"
    };
  }
  return {
    x: fallback.x,
    y: fallback.y,
    z: 0,
    velocity: velocityBetween(previous, fallback, elapsed),
    lastTouchPlayerId: previous.lastTouchPlayerId,
    lastUpdatedSecond: second,
    phase: "LOOSE"
  };
};
var MatchEngineV2BallService = {
  resolve
};

// services/match/engines/v2/MatchEngineV2SpatialService.ts
var PITCH_LENGTH2 = 105;
var PITCH_WIDTH2 = 68;
var MAX_PLAYER_STEP_PER_TICK = 7.5;
var clamp4 = (value, min, max) => Math.min(max, Math.max(min, value));
var clonePoint = (point2) => ({ ...point2 });
var movementZoneForPlayer = (anchor, role) => {
  const halfWidth = role === "GK" /* GK */ ? 11 : role === "MID" /* MID */ || role === "FWD" /* FWD */ ? 14 : 12;
  const halfLength = role === "GK" /* GK */ ? 5.5 : role === "FWD" /* FWD */ ? 18 : role === "MID" /* MID */ ? 17 : 15;
  return {
    minX: clamp4(anchor.x - halfWidth, 2.5, PITCH_WIDTH2 - 2.5),
    maxX: clamp4(anchor.x + halfWidth, 2.5, PITCH_WIDTH2 - 2.5),
    minY: clamp4(anchor.y - halfLength, 2.5, PITCH_LENGTH2 - 2.5),
    maxY: clamp4(anchor.y + halfLength, 2.5, PITCH_LENGTH2 - 2.5)
  };
};
var clampToMovementZone2 = (point2, player) => ({
  x: clamp4(point2.x, player.movementZone.minX, player.movementZone.maxX),
  y: clamp4(point2.y, player.movementZone.minY, player.movementZone.maxY)
});
var anchorForSlot = (side, x, y) => {
  const homeY = clamp4(3 + (1 - y) * 81, 3, PITCH_LENGTH2 - 3);
  return {
    // Use more of the playable width as well. Wide tactical slots now sit close
    // enough to the touchline to be visually distinct without placing their
    // 36-pixel SVG marker outside the field.
    x: clamp4(-1 + x * 70, 2.5, PITCH_WIDTH2 - 2.5),
    y: side === "HOME" ? homeY : PITCH_LENGTH2 - homeY
  };
};
var createTeamPlayers = (team, side) => {
  const tactic = TacticRepository.getById(team.lineup.tacticId);
  const players = {};
  team.lineup.startingXI.forEach((playerId, index) => {
    if (!playerId) return;
    const slot = tactic.slots[index] ?? tactic.slots[0];
    const player = team.players.find((item) => item.id === playerId);
    if (!slot || !player) return;
    const tacticalAnchor = anchorForSlot(side, slot.x, slot.y);
    const anchor = player.position === "GK" /* GK */ ? { x: PITCH_WIDTH2 / 2, y: side === "HOME" ? 5.5 : PITCH_LENGTH2 - 5.5 } : tacticalAnchor;
    players[playerId] = {
      playerId,
      side,
      role: player.position,
      anchor,
      movementZone: movementZoneForPlayer(anchor, player.position),
      position: clonePoint(anchor),
      target: clonePoint(anchor),
      velocity: { x: 0, y: 0 },
      facingRadians: side === "HOME" ? Math.PI / 2 : -Math.PI / 2,
      // Pace controls visible travel speed, but the conservative range avoids
      // arcade-like teleporting and will later be calibrated against action time.
      metresPerSecond: clamp4(3.8 + player.attributes.pace * 0.055, 4.2, 9.3),
      isOnPitch: true,
      movementIntent: "HOLD_SHAPE",
      movementState: "IDLE",
      intentCommittedUntilSecond: 0,
      returningToMovementZone: false
    };
  });
  return players;
};
var placeInitialKickOff = (players, live) => {
  const side = live.state.firstHalfKickOffSide;
  const team = side === "HOME" ? live.input.home : live.input.away;
  const candidates = team.lineup.startingXI.filter((playerId) => Boolean(playerId)).map((playerId) => players[playerId]).filter((player) => Boolean(player) && player.role !== "GK");
  const kicker = candidates.find((player) => player.role === "MID") ?? candidates.find((player) => player.role === "FWD") ?? candidates[0];
  const support = candidates.find((player) => player.playerId !== kicker?.playerId && player.role === "FWD") ?? candidates.find((player) => player.playerId !== kicker?.playerId);
  if (!kicker) return;
  const direction = side === "HOME" ? 1 : -1;
  kicker.position = { x: PITCH_WIDTH2 / 2, y: PITCH_LENGTH2 / 2 };
  kicker.target = clonePoint(kicker.position);
  kicker.returningToMovementZone = true;
  if (support) {
    support.position = { x: PITCH_WIDTH2 / 2 - 4.2, y: PITCH_LENGTH2 / 2 - direction * 3.4 };
    support.target = clonePoint(support.position);
    support.returningToMovementZone = true;
  }
};
var zonePoint = (zone, possession) => {
  const attackingY = {
    GK: 8,
    DEFENSE: 27,
    MIDFIELD: 52.5,
    FINAL_THIRD: 76,
    BOX: 94,
    WIDE_LEFT: 68,
    WIDE_RIGHT: 68
  };
  const baseY = attackingY[zone];
  return {
    x: zone === "WIDE_LEFT" ? 8 : zone === "WIDE_RIGHT" ? 60 : 34,
    y: possession === "HOME" ? baseY : PITCH_LENGTH2 - baseY
  };
};
var moveTowards = (current, target, maxDistance) => {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= maxDistance || distance === 0) return clonePoint(target);
  const ratio = maxDistance / distance;
  return {
    x: current.x + dx * ratio,
    y: current.y + dy * ratio
  };
};
var applyPlayerSeparation = (players) => {
  const active = Object.values(players).filter((player) => player.isOnPitch);
  const minimumDistance = 5.3;
  for (let iteration = 0; iteration < 14; iteration += 1) {
    for (let firstIndex = 0; firstIndex < active.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < active.length; secondIndex += 1) {
        const first = active[firstIndex];
        const second = active[secondIndex];
        let dx = second.position.x - first.position.x;
        let dy = second.position.y - first.position.y;
        let distance = Math.hypot(dx, dy);
        if (distance >= minimumDistance) continue;
        if (distance < 1e-3) {
          const direction = first.playerId.localeCompare(second.playerId) <= 0 ? 1 : -1;
          dx = direction;
          dy = 0;
          distance = 1;
        }
        const correction = (minimumDistance - distance) / 2;
        const normalX = dx / distance;
        const normalY = dy / distance;
        const firstCorrection = {
          x: clamp4(first.position.x - normalX * correction, 1, PITCH_WIDTH2 - 1),
          y: clamp4(first.position.y - normalY * correction, 1, PITCH_LENGTH2 - 1)
        };
        const secondCorrection = {
          x: clamp4(second.position.x + normalX * correction, 1, PITCH_WIDTH2 - 1),
          y: clamp4(second.position.y + normalY * correction, 1, PITCH_LENGTH2 - 1)
        };
        first.position = first.returningToMovementZone ? firstCorrection : clampToMovementZone2(firstCorrection, first);
        second.position = second.returningToMovementZone ? secondCorrection : clampToMovementZone2(secondCorrection, second);
      }
    }
  }
};
var enforceGoalkeeperArea = (players) => {
  Object.values(players).forEach((player) => {
    if (!player.isOnPitch || player.role !== "GK") return;
    player.position.x = clamp4(player.position.x, 20, 48);
    player.position.y = player.side === "HOME" ? clamp4(player.position.y, 3.5, 11) : clamp4(player.position.y, PITCH_LENGTH2 - 11, PITCH_LENGTH2 - 3.5);
  });
};
var enforceMovementZones = (players) => {
  Object.values(players).forEach((player) => {
    if (!player.isOnPitch || player.role === "GK") return;
    player.target = clampToMovementZone2(player.target, player);
    if (!player.returningToMovementZone) {
      player.position = clampToMovementZone2(player.position, player);
      return;
    }
    const inside = player.position.x >= player.movementZone.minX && player.position.x <= player.movementZone.maxX && player.position.y >= player.movementZone.minY && player.position.y <= player.movementZone.maxY;
    if (inside) player.returningToMovementZone = false;
  });
};
var enforceMaximumTickTravel = (players, startPositions, elapsedSeconds) => {
  const maximumTravel = 9;
  Object.values(players).forEach((player) => {
    const start2 = startPositions[player.playerId];
    if (!start2 || !player.isOnPitch) return;
    const distance = Math.hypot(player.position.x - start2.x, player.position.y - start2.y);
    if (distance <= maximumTravel) return;
    player.position = moveTowards(start2, player.position, maximumTravel);
    const dx = player.position.x - start2.x;
    const dy = player.position.y - start2.y;
    const dt = Math.max(0.2, Math.min(1.25, elapsedSeconds));
    const speed = Math.min(player.metresPerSecond, Math.hypot(dx, dy) / dt);
    player.facingRadians = Math.atan2(dy, dx);
    player.velocity = {
      x: Math.cos(player.facingRadians) * speed,
      y: Math.sin(player.facingRadians) * speed
    };
  });
};
var nearestCarrier = (players, side, point2) => Object.values(players).filter((player) => player.side === side && player.isOnPitch).sort(
  (a, b) => Math.hypot(a.position.x - point2.x, a.position.y - point2.y) - Math.hypot(b.position.x - point2.x, b.position.y - point2.y)
)[0];
var synchronizeLineups = (spatial, live) => {
  ["HOME", "AWAY"].forEach((side) => {
    const team = side === "HOME" ? live.input.home : live.input.away;
    const active = new Set(team.lineup.startingXI.filter((id) => Boolean(id)));
    Object.values(spatial.players).forEach((player) => {
      if (player.side === side) {
        player.isOnPitch = active.has(player.playerId) && !live.state.redCards[player.playerId];
      }
    });
    const missingActivePlayer = [...active].filter((playerId) => !spatial.players[playerId]);
    if (!missingActivePlayer.length) return;
    const rebuilt = createTeamPlayers(team, side);
    missingActivePlayer.forEach((playerId) => {
      const player = rebuilt[playerId];
      if (player) spatial.players[playerId] = player;
    });
  });
};
var pressingPlayersForSide = (spatial, live, side, ball) => {
  if (side === live.state.possession) return /* @__PURE__ */ new Set();
  const team = side === "HOME" ? live.input.home : live.input.away;
  const phase = spatial.teamContexts[side].phase;
  const presserCount = team.instructions.pressing === "PRESSING" || phase === "TRANSITION_DEFEND" ? 2 : 1;
  return new Set(
    Object.values(spatial.players).filter((player) => player.side === side && player.isOnPitch && player.role !== "GK" /* GK */).sort(
      (first, second) => Math.hypot(first.position.x - ball.x, first.position.y - ball.y) - Math.hypot(second.position.x - ball.x, second.position.y - ball.y)
    ).slice(0, presserCount).map((player) => player.playerId)
  );
};
var cueKind = (type) => {
  if (type === "MISPLACED_PASS" /* MISPLACED_PASS */) return "TURNOVER";
  if (type === "BALL_CONTROL" /* BALL_CONTROL */) return "CONTROL";
  if (type === "DRIBBLING" /* DRIBBLING */) return "DRIBBLE";
  if (type === "TACKLE_WON" /* TACKLE_WON */) return "TACKLE";
  if (type === "CROSS_NEAR_POST" /* CROSS_NEAR_POST */ || type === "CROSS_FAR_POST" /* CROSS_FAR_POST */ || type === "CROSS_BLOCKED" /* CROSS_BLOCKED */) return "CROSS";
  if (type === "SHOT_BLOCKED" /* SHOT_BLOCKED */) return "BLOCK";
  if (type === "REBOUND_WON" /* REBOUND_WON */) return "REBOUND";
  if (type === "GOAL" /* GOAL */ || type === "ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */ || type === "PENALTY_SCORED" /* PENALTY_SCORED */) return "GOAL";
  if (type === "SHOT" /* SHOT */ || type === "SHOT_ON_TARGET" /* SHOT_ON_TARGET */ || type === "SHOT_POST" /* SHOT_POST */ || type === "SHOT_BAR" /* SHOT_BAR */ || type === "ONE_ON_ONE_MISS" /* ONE_ON_ONE_MISS */ || type === "PENALTY_MISSED" /* PENALTY_MISSED */) return "SHOT";
  if (type === "SAVE" /* SAVE */ || type === "ONE_ON_ONE_SAVE" /* ONE_ON_ONE_SAVE */) return "SAVE";
  if (type === "YELLOW_CARD" /* YELLOW_CARD */ || type === "RED_CARD" /* RED_CARD */) return "CARD";
  if (type === "INJURY_LIGHT" /* INJURY_LIGHT */ || type === "INJURY_SEVERE" /* INJURY_SEVERE */) return "INJURY";
  if (type === "MEDICAL_TREATMENT" /* MEDICAL_TREATMENT */) return "INJURY";
  if (type === "SUBSTITUTION" /* SUBSTITUTION */) return "SUBSTITUTION";
  if (type === "CORNER" /* CORNER */ || type === "CORNER_TAKEN" /* CORNER_TAKEN */ || type === "THROW_IN" /* THROW_IN */ || type === "KICK_OFF" /* KICK_OFF */ || type === "GOAL_KICK" /* GOAL_KICK */ || type === "GK_LONG_THROW" /* GK_LONG_THROW */ || type === "FREE_KICK" /* FREE_KICK */ || type === "FREE_KICK_DANGEROUS" /* FREE_KICK_DANGEROUS */ || type === "PENALTY_AWARDED" /* PENALTY_AWARDED */ || type === "OFFSIDE" /* OFFSIDE */) return "RESTART";
  if (type === "FOUL" /* FOUL */ || type === "ADVANTAGE_PLAYED" /* ADVANTAGE_PLAYED */ || type === "FOUL_JERSEY" /* FOUL_JERSEY */ || type === "FOUL_PUSH" /* FOUL_PUSH */ || type === "HANDBALL" /* HANDBALL */) return "FOUL";
  return "PASS";
};
var cueDuration = (kind) => {
  if (kind === "SHOT" || kind === "GOAL" || kind === "SAVE") return 850;
  if (kind === "CROSS") return 900;
  if (kind === "TACKLE" || kind === "BLOCK" || kind === "REBOUND") return 620;
  if (kind === "CONTROL") return 420;
  if (kind === "DRIBBLE") return 760;
  if (kind === "RESTART") return 1100;
  if (kind === "CARD" || kind === "INJURY" || kind === "SUBSTITUTION") return 1400;
  return 700;
};
var eventTarget = (event, side, fallbackZone) => {
  const kind = cueKind(event.type);
  const attackingGoalY = side === "HOME" ? PITCH_LENGTH2 : 0;
  const attackDirection = side === "HOME" ? 1 : -1;
  const setPieceKind = event.detail?.setPieceKind;
  if (kind === "SHOT" || kind === "GOAL" || kind === "SAVE") {
    return { x: PITCH_WIDTH2 / 2, y: side === "HOME" ? PITCH_LENGTH2 - 1 : 1 };
  }
  if (event.type === "PENALTY_AWARDED" /* PENALTY_AWARDED */ || setPieceKind === "PENALTY") {
    return { x: PITCH_WIDTH2 / 2, y: attackingGoalY - attackDirection * 11 };
  }
  if (event.type === "FREE_KICK_DANGEROUS" /* FREE_KICK_DANGEROUS */ || setPieceKind === "FREE_KICK_DIRECT") {
    return {
      x: 30 + stableHash(`${event.id}:direct-free-kick`) % 9,
      y: attackingGoalY - attackDirection * 23
    };
  }
  if (event.type === "FREE_KICK" /* FREE_KICK */ || setPieceKind === "FREE_KICK_WIDE") {
    const left = stableHash(`${event.id}:wide-free-kick`) % 2 === 0;
    return { x: left ? 11 : PITCH_WIDTH2 - 11, y: attackingGoalY - attackDirection * 27 };
  }
  const zone = event.zone ?? fallbackZone;
  const point2 = zonePoint(zone, side);
  if (event.type === "CORNER" /* CORNER */) {
    return {
      x: zone === "WIDE_LEFT" ? 0.5 : PITCH_WIDTH2 - 0.5,
      y: side === "HOME" ? PITCH_LENGTH2 - 0.5 : 0.5
    };
  }
  if (event.type === "CORNER_TAKEN" /* CORNER_TAKEN */) {
    return zonePoint("BOX", side);
  }
  if (event.type === "THROW_IN" /* THROW_IN */) {
    return { x: point2.x <= PITCH_WIDTH2 / 2 ? 0.5 : PITCH_WIDTH2 - 0.5, y: point2.y };
  }
  if (event.type === "GOAL_KICK" /* GOAL_KICK */ || event.type === "GK_LONG_THROW" /* GK_LONG_THROW */) {
    return zonePoint("DEFENSE", side);
  }
  return point2;
};
var actionTargetForZone = (event, side, fallbackZone, participant) => {
  const zone = event.zone ?? fallbackZone;
  const target = zonePoint(zone, side);
  if (zone === "WIDE_LEFT" || zone === "WIDE_RIGHT") return target;
  return {
    x: clamp4((participant?.position.x ?? target.x) * 0.68 + target.x * 0.32, 3, PITCH_WIDTH2 - 3),
    y: target.y
  };
};
var carryTarget = (start2, event, side, fallbackZone) => {
  const tacticalTarget = eventTarget(event, side, fallbackZone);
  const direction = side === "HOME" ? 1 : -1;
  const desired = {
    x: start2.x + (tacticalTarget.x - start2.x) * 0.38,
    y: start2.y + direction * (event.pattern === "COUNTER" ? 11 : 7.5)
  };
  return moveTowards(start2, {
    x: clamp4(desired.x, 2.5, PITCH_WIDTH2 - 2.5),
    y: clamp4(desired.y, 2.5, PITCH_LENGTH2 - 2.5)
  }, event.pattern === "COUNTER" ? 12 : 8.5);
};
var projectNewEvents = (spatial, live) => {
  const newEvents = live.state.events.slice(spatial.lastEventIndex);
  const cues = [];
  const workingPositions = Object.fromEntries(
    Object.entries(spatial.players).map(([id, player]) => [id, clonePoint(player.position)])
  );
  let ballCursor = { x: spatial.ball.x, y: spatial.ball.y };
  newEvents.forEach((event) => {
    const side = event.side ?? live.state.possession;
    const kind = cueKind(event.type);
    const primaryPlayer = event.playerId ? spatial.players[event.playerId] : void 0;
    const secondaryPlayer = event.secondaryPlayerId ? spatial.players[event.secondaryPlayerId] : void 0;
    const markerId = typeof event.detail?.markerId === "string" ? event.detail.markerId : void 0;
    const marker = markerId ? spatial.players[markerId] : void 0;
    const fallbackTarget = eventTarget(event, side, live.state.ballZone);
    const actor = primaryPlayer ?? nearestCarrier(spatial.players, side, fallbackTarget);
    const previousCue = cues.at(-1) ?? spatial.visualCues.at(-1);
    const sequenceId = typeof event.detail?.sequenceId === "string" ? event.detail.sequenceId : void 0;
    const continuesSequence = Boolean(sequenceId && previousCue?.sequenceId === sequenceId);
    const isBlockedCross = event.type === "CROSS_BLOCKED" /* CROSS_BLOCKED */;
    const receiverPoint = secondaryPlayer ? workingPositions[secondaryPlayer.playerId] ?? secondaryPlayer.position : void 0;
    const restartAtCentre = event.type === "KICK_OFF" /* KICK_OFF */;
    const restartAtGoal = event.type === "GOAL_KICK" /* GOAL_KICK */ || event.type === "GK_LONG_THROW" /* GK_LONG_THROW */;
    const restartFromThrowIn = event.type === "THROW_IN" /* THROW_IN */;
    const recordedStart = typeof event.detail?.startX === "number" && typeof event.detail?.startY === "number" ? { x: clamp4(event.detail.startX, 0, PITCH_WIDTH2), y: clamp4(event.detail.startY, 0, PITCH_LENGTH2) } : void 0;
    const recordedEnd = typeof event.detail?.endX === "number" && typeof event.detail?.endY === "number" ? { x: clamp4(event.detail.endX, 0, PITCH_WIDTH2), y: clamp4(event.detail.endY, 0, PITCH_LENGTH2) } : void 0;
    const start2 = restartAtCentre ? { x: PITCH_WIDTH2 / 2, y: PITCH_LENGTH2 / 2 } : restartAtGoal ? { x: PITCH_WIDTH2 / 2, y: side === "HOME" ? 5.5 : PITCH_LENGTH2 - 5.5 } : restartFromThrowIn ? clonePoint(fallbackTarget) : continuesSequence && previousCue ? clonePoint(previousCue.end) : clonePoint(recordedStart ?? ballCursor);
    let target;
    if (restartAtCentre) {
      target = { x: PITCH_WIDTH2 / 2, y: PITCH_LENGTH2 / 2 + (side === "HOME" ? 2.8 : -2.8) };
    } else if (restartAtGoal) {
      target = actionTargetForZone(event, side, "DEFENSE", secondaryPlayer ?? actor);
    } else if (restartFromThrowIn) {
      const receivingTarget = receiverPoint ?? {
        x: start2.x < PITCH_WIDTH2 / 2 ? 8 : PITCH_WIDTH2 - 8,
        y: clamp4(start2.y + (side === "HOME" ? 5 : -5), 6, PITCH_LENGTH2 - 6)
      };
      const thrownTarget = moveTowards(start2, {
        x: clamp4(receivingTarget.x, 5, PITCH_WIDTH2 - 5),
        y: clamp4(receivingTarget.y, 5, PITCH_LENGTH2 - 5)
      }, 10);
      target = secondaryPlayer ? clampToMovementZone2(thrownTarget, secondaryPlayer) : thrownTarget;
    } else if (kind === "DRIBBLE") {
      const carry = carryTarget(start2, event, side, live.state.ballZone);
      target = actor ? clampToMovementZone2(carry, actor) : carry;
    } else if ((kind === "PASS" || kind === "CROSS") && secondaryPlayer) {
      const tacticalReception = actionTargetForZone(event, side, live.state.ballZone, secondaryPlayer);
      const actionDecision = event.detail?.actionDecision;
      const maximumReceivingRun = kind === "CROSS" ? 9.5 : actionDecision === "DIRECT_PASS" || event.pattern === "COUNTER" ? 8.5 : 6.5;
      target = recordedEnd ? clampToMovementZone2(recordedEnd, secondaryPlayer) : clampToMovementZone2(
        moveTowards(receiverPoint ?? secondaryPlayer.position, tacticalReception, maximumReceivingRun),
        secondaryPlayer
      );
    } else if (isBlockedCross) {
      target = clonePoint(start2);
    } else if (kind === "TURNOVER" || kind === "TACKLE" || kind === "CONTROL" || kind === "REBOUND") {
      target = kind === "CONTROL" ? moveTowards(start2, fallbackTarget, 1.4) : clonePoint(start2);
    } else if (kind === "BLOCK" && marker) {
      target = clonePoint(workingPositions[marker.playerId] ?? marker.position);
    } else if (kind === "FOUL" || kind === "CARD" || kind === "INJURY" || kind === "SUBSTITUTION") {
      target = clonePoint(start2);
    } else {
      target = fallbackTarget;
    }
    cues.push({
      id: `visual_${event.id}`,
      sourceEventId: event.id,
      sequenceId,
      sourceEventType: event.type,
      setPieceKind: event.detail?.setPieceKind === "CORNER" || event.detail?.setPieceKind === "FREE_KICK_WIDE" || event.detail?.setPieceKind === "FREE_KICK_DIRECT" || event.detail?.setPieceKind === "PENALTY" ? event.detail.setPieceKind : event.type === "CORNER" /* CORNER */ || event.type === "CORNER_TAKEN" /* CORNER_TAKEN */ ? "CORNER" : event.type === "PENALTY_AWARDED" /* PENALTY_AWARDED */ ? "PENALTY" : event.type === "FREE_KICK_DANGEROUS" /* FREE_KICK_DANGEROUS */ ? "FREE_KICK_DIRECT" : event.type === "FREE_KICK" /* FREE_KICK */ ? "FREE_KICK_WIDE" : void 0,
      kind,
      atSecond: event.second,
      side: event.side,
      actorId: actor?.playerId,
      secondaryPlayerId: event.secondaryPlayerId,
      start: start2,
      end: target,
      durationMs: cueDuration(kind),
      xG: event.xG
    });
    ballCursor = clonePoint(target);
    if (actor) {
      if (kind === "DRIBBLE" || kind === "CONTROL" || kind === "REBOUND" || kind === "TACKLE" || kind === "TURNOVER") {
        workingPositions[actor.playerId] = clonePoint(target);
      } else if (restartAtCentre || restartAtGoal) {
        workingPositions[actor.playerId] = clonePoint(start2);
      }
    }
    if (secondaryPlayer && (kind === "PASS" || kind === "CROSS")) {
      workingPositions[secondaryPlayer.playerId] = clonePoint(target);
    }
  });
  spatial.lastEventIndex = live.state.events.length;
  spatial.visualCues = [...spatial.visualCues, ...cues].slice(-1200);
};
var MatchEngineV2SpatialService = {
  create: (live) => {
    const players = {
      ...createTeamPlayers(live.input.home, "HOME"),
      ...createTeamPlayers(live.input.away, "AWAY")
    };
    placeInitialKickOff(players, live);
    const ball = {
      x: PITCH_WIDTH2 / 2,
      y: PITCH_LENGTH2 / 2,
      z: 0,
      velocity: { x: 0, y: 0, z: 0 },
      lastUpdatedSecond: live.state.second,
      phase: "DEAD"
    };
    return {
      pitchLength: PITCH_LENGTH2,
      pitchWidth: PITCH_WIDTH2,
      lastSecond: live.state.second,
      players,
      ball,
      lastPossession: live.state.possession,
      teamContexts: {
        HOME: MatchEngineV2TeamPhaseService.createContext("HOME", live.state.possession, live.state.ballZone, live.state.second),
        AWAY: MatchEngineV2TeamPhaseService.createContext("AWAY", live.state.possession, live.state.ballZone, live.state.second)
      },
      lastEventIndex: 0,
      visualCues: []
    };
  },
  /**
   * Stage-one spatial projection. It gives the renderer stable, bounded and
   * formation-aware coordinates while the next engine stage replaces zone
   * projection with individual pass/run/shot trajectories.
   */
  synchronize: (spatial, live) => {
    synchronizeLineups(spatial, live);
    const startPositions = Object.fromEntries(Object.entries(spatial.players).map(([playerId, player]) => [
      playerId,
      clonePoint(player.position)
    ]));
    const elapsed = Math.max(0, live.state.second - spatial.lastSecond);
    const movementWindow = Math.min(5, elapsed);
    const ballTarget = zonePoint(live.state.ballZone, live.state.possession);
    const possessionChanged = spatial.lastPossession !== live.state.possession;
    ["HOME", "AWAY"].forEach((side) => {
      const previous = spatial.teamContexts[side];
      spatial.teamContexts[side] = MatchEngineV2TeamPhaseService.updateContext(
        previous,
        side,
        live.state.possession,
        live.state.ballZone,
        live.state.second,
        possessionChanged
      );
    });
    const pressingPlayers = {
      HOME: pressingPlayersForSide(spatial, live, "HOME", ballTarget),
      AWAY: pressingPlayersForSide(spatial, live, "AWAY", ballTarget)
    };
    Object.values(spatial.players).forEach((player) => {
      if (!player.isOnPitch) return;
      const team = player.side === "HOME" ? live.input.home : live.input.away;
      const movement = MatchEngineV2TeamShapeService.targetForPlayer({
        player,
        ball: ballTarget,
        phase: spatial.teamContexts[player.side].phase,
        tactic: team.tactic,
        instructions: team.instructions,
        isPresser: pressingPlayers[player.side].has(player.playerId)
      });
      MatchEngineV2MotionService.advancePlayer({
        player,
        proposedTarget: movement.point,
        proposedIntent: movement.intent,
        matchSecond: live.state.second,
        elapsedSeconds: movementWindow,
        maximumStepMetres: MAX_PLAYER_STEP_PER_TICK
      });
    });
    enforceMovementZones(spatial.players);
    applyPlayerSeparation(spatial.players);
    projectNewEvents(spatial, live);
    enforceMovementZones(spatial.players);
    applyPlayerSeparation(spatial.players);
    enforceGoalkeeperArea(spatial.players);
    enforceMaximumTickTravel(spatial.players, startPositions, movementWindow);
    enforceMovementZones(spatial.players);
    enforceGoalkeeperArea(spatial.players);
    applyPlayerSeparation(spatial.players);
    enforceMovementZones(spatial.players);
    enforceGoalkeeperArea(spatial.players);
    const authoritativeCarrier = live.state.ballCarrierId ? spatial.players[live.state.ballCarrierId] : void 0;
    const carrier = authoritativeCarrier?.isOnPitch && authoritativeCarrier.side === live.state.possession ? authoritativeCarrier : nearestCarrier(spatial.players, live.state.possession, ballTarget);
    spatial.ball = MatchEngineV2BallService.resolve({
      previous: spatial.ball,
      carrier,
      latestCue: spatial.visualCues.at(-1),
      fallback: ballTarget,
      second: live.state.second
    });
    spatial.lastPossession = live.state.possession;
    spatial.lastSecond = live.state.second;
  },
  clone: (spatial) => ({
    ...spatial,
    players: Object.fromEntries(Object.entries(spatial.players).map(([id, player]) => [id, {
      ...player,
      anchor: clonePoint(player.anchor),
      movementZone: { ...player.movementZone },
      position: clonePoint(player.position),
      target: clonePoint(player.target),
      velocity: clonePoint(player.velocity)
    }])),
    ball: { ...spatial.ball, velocity: { ...spatial.ball.velocity } },
    teamContexts: {
      HOME: { ...spatial.teamContexts.HOME },
      AWAY: { ...spatial.teamContexts.AWAY }
    },
    visualCues: spatial.visualCues.map((cue) => ({
      ...cue,
      start: clonePoint(cue.start),
      end: clonePoint(cue.end)
    }))
  })
};

// services/match/engines/v2/MatchEngineV2SpatialDecisionService.ts
var createContext2 = (spatial) => ({
  second: spatial.lastSecond,
  pitchLength: spatial.pitchLength,
  pitchWidth: spatial.pitchWidth,
  ball: {
    x: spatial.ball.x,
    y: spatial.ball.y,
    ownerId: spatial.ball.ownerId
  },
  players: Object.fromEntries(Object.values(spatial.players).map((player) => [player.playerId, {
    playerId: player.playerId,
    side: player.side,
    role: player.role,
    x: player.position.x,
    y: player.position.y,
    velocityX: player.velocity.x,
    velocityY: player.velocity.y,
    isOnPitch: player.isOnPitch
  }]))
});
var MatchEngineV2SpatialDecisionService = {
  createContext: createContext2
};

// services/match/engines/v2/MatchEngineV2TrajectoryService.ts
var PITCH_LENGTH3 = 105;
var PITCH_WIDTH3 = 68;
var smoothStep = (value) => value * value * (3 - 2 * value);
var arcHeight = (cue) => {
  if (cue.kind === "SHOT" || cue.kind === "GOAL" || cue.kind === "SAVE") return 1.8;
  if (cue.kind === "RESTART" || cue.kind === "CROSS") return 1.25;
  if (cue.kind === "PASS") return 0.45;
  return 0.08;
};
var controlPoint = (cue) => {
  const dx = cue.end.x - cue.start.x;
  const dy = cue.end.y - cue.start.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const curveDirection = stableHash(cue.id) % 2 === 0 ? 1 : -1;
  const curveStrength = cue.kind === "PASS" || cue.kind === "CROSS" || cue.kind === "RESTART" ? Math.min(5.5, distance * 0.12) : Math.min(2.2, distance * 0.05);
  return {
    x: clamp((cue.start.x + cue.end.x) / 2 + -dy / distance * curveStrength * curveDirection, 0, PITCH_WIDTH3),
    y: clamp((cue.start.y + cue.end.y) / 2 + dx / distance * curveStrength * curveDirection, 0, PITCH_LENGTH3)
  };
};
var quadratic = (start2, control, end2, progress) => {
  const inverse = 1 - progress;
  return inverse * inverse * start2 + 2 * inverse * progress * control + progress * progress * end2;
};
var MatchEngineV2TrajectoryService = {
  /**
   * Samples one deterministic ball path. SVG animation time changes only the
   * interpolation progress; it never requests RNG and cannot alter the match.
   */
  sampleCue: (cue, elapsedMs) => {
    const rawProgress = clamp(elapsedMs / Math.max(1, cue.durationMs), 0, 1);
    const progress = smoothStep(rawProgress);
    const control = controlPoint(cue);
    return {
      x: clamp(quadratic(cue.start.x, control.x, cue.end.x, progress), 0, PITCH_WIDTH3),
      y: clamp(quadratic(cue.start.y, control.y, cue.end.y, progress), 0, PITCH_LENGTH3),
      z: arcHeight(cue) * 4 * progress * (1 - progress),
      progress: rawProgress,
      finished: rawProgress >= 1
    };
  },
  /** Formation movement uses a restrained linear interpolation without RNG. */
  samplePlayerMovement: (start2, end2, elapsedMs, durationMs) => {
    const progress = smoothStep(clamp(elapsedMs / Math.max(1, durationMs), 0, 1));
    return {
      x: clamp(start2.x + (end2.x - start2.x) * progress, 0, PITCH_WIDTH3),
      y: clamp(start2.y + (end2.y - start2.y) * progress, 0, PITCH_LENGTH3)
    };
  }
};

// services/match/engines/v2/MatchEngineV2HighlightScriptService.ts
var point = (x, y, variant) => ({
  x: Math.max(2, Math.min(66, x + (variant % 5 - 2) * 1.35)),
  y: Math.max(2, Math.min(103, y + (variant % 2 === 0 ? 0.8 : -0.8)))
});
var step = (kind, actor, receiver, start2, end2, durationMs, behaviors) => ({ kind, actor, receiver, start: start2, end: end2, durationMs, ...behaviors });
var finalShotKind = (outcome) => outcome === "OFFSIDE" ? "OFFSIDE" : outcome === "FOUL" ? "FOUL" : "SHOT";
var finalCommentary = (outcome, shotTemplate) => outcome === "FOUL" ? "{actor} zostaje sfaulowany, s\u0119dzia przerywa akcj\u0119!" : outcome === "OFFSIDE" ? "{actor} wybiega za lini\u0119 obrony \u2014 s\u0119dzia liniowy sygnalizuje spalone!" : shotTemplate;
var attackFamilies = [
  {
    id: "DISTANCE_SHOT",
    title: "STRZA\u0141 Z DYSTANSU",
    steps: (v, o) => [
      step("PASS", "DEFENDER", "MIDFIELDER", point(24, 38, v), point(31, 52, v), 720, {
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        defendingGroupBehavior: "MIDFIELD_SHIFT_LEFT",
        commentaryTemplate: "{actor} rozpoczyna akcj\u0119 podaniem do {receiver}."
      }),
      step("CONTROL", "MIDFIELDER", void 0, point(31, 52, v), point(33, 57, v), 520, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} przyjmuje pi\u0142k\u0119 na \u015Brodku pola."
      }),
      step("DRIBBLE", "MIDFIELDER", void 0, point(33, 57, v), point(35, 72, v), 900, {
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} rusza z pi\u0142k\u0105 w kierunku pola karnego."
      }),
      step(finalShotKind(o), "SCORER", void 0, point(35, 72, v), point(34, 104, v), 760, {
        defendingGroupBehavior: "DEFENDERS_HOLD_LINE",
        commentaryTemplate: finalCommentary(o, "{actor} pr\xF3buje szcz\u0119\u015Bcia strza\u0142em z dystansu!")
      })
    ]
  },
  {
    id: "BOX_COMBINATION",
    title: "KOMBINACJA W POLU KARNYM",
    steps: (v, o) => [
      step("PASS", "MIDFIELDER", "FORWARD", point(22, 57, v), point(31, 75, v), 700, {
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} podaje do {receiver} pod polem karnym."
      }),
      step("PASS", "FORWARD", "SCORER", point(31, 75, v), point(40, 86, v), 620, {
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} zagrywa do {receiver}!"
      }),
      step("CONTROL", "SCORER", void 0, point(40, 86, v), point(39, 90, v), 430, {
        defendingGroupBehavior: "DEFENDERS_HOLD_LINE",
        commentaryTemplate: "{actor} przyjmuje pi\u0142k\u0119 pod bramk\u0105."
      }),
      step(finalShotKind(o), "SCORER", void 0, point(39, 90, v), point(34, 104, v), 650, {
        commentaryTemplate: finalCommentary(o, "{actor} STRZELA Z BLISKIEJ ODLEG\u0141O\u015ACI!")
      })
    ]
  },
  {
    id: "CORNER_HEADER",
    title: "DO\u015ARODKOWANIE Z RZUTU RO\u017BNEGO",
    steps: (v, o) => [
      step("CROSS", "WINGER", "FORWARD", point(v % 2 ? 67 : 1, 104, v), point(31, 94, v), 1050, {
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} do\u015Brodkowuje w pole karne."
      }),
      step("CONTROL", "FORWARD", void 0, point(31, 94, v), point(34, 96, v), 380, {
        defendingGroupBehavior: "DEFENDERS_HOLD_LINE",
        commentaryTemplate: "{actor} wychodzi w g\xF3r\u0119 po pi\u0142k\u0119..."
      }),
      step(finalShotKind(o), "SCORER", void 0, point(34, 96, v), point(34, 104, v), 560, {
        commentaryTemplate: finalCommentary(o, "{actor} UDERZA G\u0141OW\u0104!")
      })
    ]
  },
  {
    id: "ONE_ON_ONE",
    title: "SYTUACJA SAM NA SAM",
    steps: (v, o) => [
      step("PASS", "MIDFIELDER", "FORWARD", point(27, 48, v), point(35, 70, v), 820, {
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} zagrywa prostopadle do {receiver}!"
      }),
      step("DRIBBLE", "FORWARD", void 0, point(35, 70, v), point(36, 88, v), 1050, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} sam na sam z bramkarzem!"
      }),
      step(finalShotKind(o), "SCORER", void 0, point(36, 88, v), point(34, 103, v), 620, {
        commentaryTemplate: finalCommentary(o, "{actor} STRZELA!")
      })
    ]
  },
  {
    id: "WING_CROSS",
    title: "AKCJA SKRZYD\u0141EM",
    steps: (v, o) => {
      const right = v % 2 === 0;
      const x = right ? 59 : 9;
      return [
        step("PASS", "DEFENDER", "WINGER", point(right ? 47 : 21, 40, v), point(x, 59, v), 760, {
          attackingGroupBehavior: "TEAM_PUSH_FORWARD",
          defendingGroupBehavior: right ? "MIDFIELD_SHIFT_RIGHT" : "MIDFIELD_SHIFT_LEFT",
          commentaryTemplate: "{actor} zagrywa na skrzyd\u0142o do {receiver}."
        }),
        step("DRIBBLE", "WINGER", void 0, point(x, 59, v), point(right ? 62 : 6, 83, v), 980, {
          attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
          defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
          commentaryTemplate: "{actor} mija obro\u0144c\u0119 i rusza do przodu."
        }),
        step("CROSS", "WINGER", "SCORER", point(right ? 62 : 6, 83, v), point(35, 93, v), 920, {
          defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
          commentaryTemplate: "{actor} do\u015Brodkowuje do {receiver}!"
        }),
        step(finalShotKind(o), "SCORER", void 0, point(35, 93, v), point(34, 104, v), 580, {
          commentaryTemplate: finalCommentary(o, "{actor} STRZELA!")
        })
      ];
    }
  },
  {
    id: "SOLO_DRIBBLE",
    title: "INDYWIDUALNY RAJD",
    steps: (v, o) => [
      step("CONTROL", "SCORER", void 0, point(25, 48, v), point(27, 53, v), 480, {
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        commentaryTemplate: "{actor} przyjmuje pi\u0142k\u0119 na w\u0142asnej po\u0142owie..."
      }),
      step("DRIBBLE", "SCORER", void 0, point(27, 53, v), point(38, 69, v), 960, {
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} rusza indywidualnie!"
      }),
      step("DRIBBLE", "SCORER", void 0, point(38, 69, v), point(33, 88, v), 920, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} mija kolejnego rywala!"
      }),
      step(finalShotKind(o), "SCORER", void 0, point(33, 88, v), point(34, 104, v), 610, {
        commentaryTemplate: finalCommentary(o, "{actor} STRZELA!")
      })
    ]
  },
  {
    id: "COUNTER_ATTACK",
    title: "SZYBKI KONTRATAK",
    steps: (v, o) => [
      step("TACKLE", "DEFENDER", void 0, point(29, 31, v), point(31, 35, v), 520, {
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} odbiera pi\u0142k\u0119!"
      }),
      step("PASS", "DEFENDER", "MIDFIELDER", point(31, 35, v), point(42, 55, v), 760, {
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "Szybkie zagranie do {receiver}!"
      }),
      step("PASS", "MIDFIELDER", "SCORER", point(42, 55, v), point(36, 79, v), 820, {
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} p\u0119dzi z kontr\u0105 do {receiver}!"
      }),
      step("DRIBBLE", "SCORER", void 0, point(36, 79, v), point(34, 91, v), 680, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} sam przed obro\u0144cami!"
      }),
      step(finalShotKind(o), "SCORER", void 0, point(34, 91, v), point(34, 104, v), 590, {
        commentaryTemplate: finalCommentary(o, "{actor} STRZELA!")
      })
    ]
  },
  {
    id: "CUTBACK",
    title: "WYCOFANIE PI\u0141KI",
    steps: (v, o) => {
      const x = v % 2 === 0 ? 58 : 10;
      return [
        step("PASS", "MIDFIELDER", "WINGER", point(34, 58, v), point(x, 76, v), 780, {
          attackingGroupBehavior: "TEAM_PUSH_FORWARD",
          defendingGroupBehavior: x > 34 ? "MIDFIELD_SHIFT_RIGHT" : "MIDFIELD_SHIFT_LEFT",
          commentaryTemplate: "{actor} zagrywa do {receiver} na skrzydle."
        }),
        step("DRIBBLE", "WINGER", void 0, point(x, 76, v), point(x, 94, v), 760, {
          attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
          defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
          commentaryTemplate: "{actor} wbiega w pole karne od linii ko\u0144cowej."
        }),
        step("PASS", "WINGER", "SCORER", point(x, 94, v), point(34, 87, v), 650, {
          defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
          commentaryTemplate: "{actor} cofa pi\u0142k\u0119 do {receiver}!"
        }),
        step(finalShotKind(o), "SCORER", void 0, point(34, 87, v), point(34, 104, v), 620, {
          commentaryTemplate: finalCommentary(o, "{actor} STRZELA Z POWROTNEGO ZAGRANIA!")
        })
      ];
    }
  },
  {
    id: "FREE_KICK",
    title: "RZUT WOLNY",
    steps: (v, o) => [
      step("CONTROL", "SCORER", void 0, point(31, 79, v), point(32, 80, v), 560, {
        defendingGroupBehavior: "DEFENDERS_HOLD_LINE",
        commentaryTemplate: "{actor} ustawia pi\u0142k\u0119 na rzut wolny..."
      }),
      step(finalShotKind(o), "SCORER", void 0, point(32, 80, v), point(34, 104, v), 900, {
        commentaryTemplate: finalCommentary(o, "{actor} UDERZA Z RZUTU WOLNEGO!")
      })
    ]
  },
  {
    id: "SECOND_BALL",
    title: "DOBITKA PO ODBITEJ PI\u0141CE",
    steps: (v, o) => [
      step("CROSS", "WINGER", "FORWARD", point(9, 78, v), point(36, 91, v), 900, {
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} do\u015Brodkowuje w pole karne."
      }),
      step("BLOCK", "FORWARD", void 0, point(36, 91, v), point(31, 93, v), 520, {
        defendingGroupBehavior: "DEFENDERS_HOLD_LINE",
        commentaryTemplate: "Obrona blokuje uderzenie {actor}!"
      }),
      step("REBOUND", "SCORER", void 0, point(31, 93, v), point(38, 91, v), 480, {
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        commentaryTemplate: "{actor} pierwszy dopada do odbitej pi\u0142ki!"
      }),
      step(finalShotKind(o), "SCORER", void 0, point(38, 91, v), point(34, 104, v), 580, {
        commentaryTemplate: finalCommentary(o, "{actor} DOBIJA!")
      })
    ]
  },
  {
    id: "THROUGH_BALL",
    title: "PROSTOPAD\u0141E PODANIE",
    steps: (v, o) => [
      step("CONTROL", "MIDFIELDER", void 0, point(30, 44, v), point(30, 46, v), 460, {
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        commentaryTemplate: "{actor} rozgl\u0105da si\u0119 w poszukiwaniu podania za lini\u0119 obrony."
      }),
      step("PASS", "MIDFIELDER", "SCORER", point(30, 46, v), point(34, 78, v), 780, {
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} przebija obron\u0119 prostopad\u0142ym podaniem do {receiver}!"
      }),
      step("DRIBBLE", "SCORER", void 0, point(34, 78, v), point(35, 92, v), 780, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} wychodzi sam na sam z obro\u0144cami!"
      }),
      step(finalShotKind(o), "SCORER", void 0, point(35, 92, v), point(34, 104, v), 600, {
        commentaryTemplate: finalCommentary(o, "{actor} STRZELA!")
      })
    ]
  },
  {
    id: "HIGH_PRESS_TURNOVER",
    title: "ODBI\xD3R WYSOKO NA BOISKU",
    steps: (v, o) => [
      step("TACKLE", "MIDFIELDER", void 0, point(30, 76, v), point(32, 79, v), 480, {
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} odbiera pi\u0142k\u0119 wysoko na boisku po agresywnym pressingu!"
      }),
      step("PASS", "MIDFIELDER", "SCORER", point(32, 79, v), point(36, 88, v), 560, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "B\u0142yskawiczne zagranie do {receiver}!"
      }),
      step(finalShotKind(o), "SCORER", void 0, point(36, 88, v), point(34, 104, v), 560, {
        commentaryTemplate: finalCommentary(o, "{actor} NATYCHMIAST STRZELA!")
      })
    ]
  },
  {
    id: "LONG_BALL_HOLDUP",
    title: "GRA NA D\u0141UG\u0104 PI\u0141K\u0118",
    steps: (v, o) => [
      step("PASS", "DEFENDER", "FORWARD", point(30, 25, v), point(33, 68, v), 900, {
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} wybija d\u0142ug\u0105 pi\u0142k\u0119 w kierunku {receiver}."
      }),
      step("CONTROL", "FORWARD", void 0, point(33, 68, v), point(32, 70, v), 520, {
        defendingGroupBehavior: "DEFENDERS_HOLD_LINE",
        commentaryTemplate: "{actor} broni si\u0119 przy pi\u0142ce plecami do bramki."
      }),
      step("PASS", "FORWARD", "SCORER", point(32, 70, v), point(34, 78, v), 620, {
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        commentaryTemplate: "{actor} zgrywa pi\u0142k\u0119 do nadbiegaj\u0105cego {receiver}!"
      }),
      step(finalShotKind(o), "SCORER", void 0, point(34, 78, v), point(34, 104, v), 680, {
        commentaryTemplate: finalCommentary(o, "{actor} STRZELA Z DRUGIEJ LINII!")
      })
    ]
  }
];
var p = (x, y) => ({ x, y });
var authoredGoalFamilies = [
  {
    id: "THROUGH_PASS_CENTRAL",
    title: "PROSTOPAD\u0141E PODANIE \u015ARODKIEM",
    steps: () => [
      step("DRIBBLE", "MIDFIELDER", void 0, p(34, 62), p(32, 68), 700, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        defendingGroupBehavior: "DEFENDERS_HOLD_LINE",
        supportingRuns: [
          { role: "SCORER", roleIndex: 0, side: "ATTACKING", start: p(34, 80), end: p(30, 84) },
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(40, 80), end: p(48, 82) }
        ],
        commentaryTemplate: "{actor} prowadzi pi\u0142k\u0119 i szuka okazji do podania."
      }),
      step("PASS", "MIDFIELDER", "SCORER", p(32, 68), p(33, 86), 780, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        supportingRuns: [
          { role: "MIDFIELDER", roleIndex: 1, side: "ATTACKING", start: p(40, 66), end: p(38, 82) }
        ],
        commentaryTemplate: "{actor} przebija obron\u0119 prostopad\u0142ym podaniem do {receiver}!"
      }),
      step("DRIBBLE", "SCORER", void 0, p(33, 86), p(34, 96), 650, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        supportingRuns: [
          { role: "WINGER", roleIndex: 0, side: "ATTACKING", start: p(58, 66), end: p(56, 86) },
          { role: "WINGER", roleIndex: 1, side: "ATTACKING", start: p(10, 66), end: p(12, 86) }
        ],
        commentaryTemplate: "{actor} przyjmuje pi\u0142k\u0119 i rusza w kierunku bramki!"
      }),
      step("SHOT", "SCORER", void 0, p(34, 96), p(34, 104), 620, {
        commentaryTemplate: "{actor} STRZELA... GOOOL!"
      })
    ]
  },
  {
    id: "RIGHT_WING_CUTBACK",
    title: "AKCJA PRAWYM SKRZYD\u0141EM I PODANIE W POLE KARNE",
    steps: () => [
      step("DRIBBLE", "WINGER", void 0, p(50, 72), p(58, 80), 820, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        supportingRuns: [
          { role: "SCORER", roleIndex: 0, side: "ATTACKING", start: p(34, 78), end: p(30, 88) },
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(40, 80), end: p(46, 92) },
          { role: "DEFENDER", roleIndex: 0, side: "ATTACKING", start: p(50, 62), end: p(56, 76) }
        ],
        commentaryTemplate: "{actor} rusza praw\u0105 stron\u0105 w kierunku pola karnego."
      }),
      step("CROSS", "WINGER", "SCORER", p(58, 80), p(34, 90), 720, {
        actorRoleIndex: 0,
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} zagrywa pi\u0142k\u0119 po ziemi w pole karne do {receiver}!"
      }),
      step("SHOT", "SCORER", void 0, p(34, 90), p(34, 104), 580, {
        commentaryTemplate: "{actor} STRZELA... GOL!"
      })
    ]
  },
  {
    id: "BOX_ONE_TWO",
    title: "WYMIANA PODA\u0143 PRZED POLEM KARNYM",
    steps: () => [
      step("PASS", "MIDFIELDER", "MIDFIELDER", p(34, 80), p(32, 84), 650, {
        actorRoleIndex: 0,
        receiverRoleIndex: 1,
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        commentaryTemplate: "{actor} rozpoczyna akcj\u0119, podanie do {receiver}."
      }),
      step("DRIBBLE", "MIDFIELDER", void 0, p(32, 84), p(28, 85), 400, {
        supportingRuns: [
          { role: "SCORER", roleIndex: 0, side: "ATTACKING", start: p(34, 88), end: p(36, 82) },
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(30, 88), end: p(40, 86) }
        ],
        commentaryTemplate: "{actor} przesuwa si\u0119 z pi\u0142k\u0105."
      }),
      step("PASS", "MIDFIELDER", "SCORER", p(28, 85), p(36, 82), 550, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} podaje do cofaj\u0105cego si\u0119 {receiver}."
      }),
      step("PASS", "SCORER", "MIDFIELDER", p(36, 82), p(30, 84), 500, {
        receiverRoleIndex: 1,
        commentaryTemplate: "{actor} odgrywa do {receiver} i rusza do przodu!"
      }),
      step("PASS", "MIDFIELDER", "SCORER", p(30, 84), p(33, 90), 550, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} natychmiast znowu do {receiver}, kt\xF3ry wychodzi przed obron\u0119!"
      }),
      step("SHOT", "SCORER", void 0, p(33, 90), p(34, 104), 600, {
        commentaryTemplate: "{actor} STRZELA SPRZED POLA KARNEGO... GOOOL!"
      })
    ]
  },
  {
    id: "TURNOVER_COUNTER",
    title: "PRZEJ\u0118CIE PI\u0141KI I SZYBKI KONTRATAK",
    steps: () => [
      step("TACKLE", "MIDFIELDER", void 0, p(34, 45), p(35, 48), 480, {
        actorRoleIndex: 1,
        supportingRuns: [
          { role: "SCORER", roleIndex: 0, side: "ATTACKING", start: p(34, 60), end: p(34, 70) },
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(40, 60), end: p(44, 70) }
        ],
        commentaryTemplate: "{actor} przejmuje pi\u0142k\u0119!"
      }),
      step("DRIBBLE", "MIDFIELDER", void 0, p(35, 48), p(36, 54), 500, {
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} rusza do przodu z odzyskan\u0105 pi\u0142k\u0105."
      }),
      step("PASS", "MIDFIELDER", "SCORER", p(36, 54), p(34, 76), 700, {
        supportingRuns: [
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(44, 70), end: p(46, 78) }
        ],
        commentaryTemplate: "{actor} zagrywa do p\u0119dz\u0105cego {receiver}!"
      }),
      step("DRIBBLE", "SCORER", void 0, p(34, 76), p(34, 90), 600, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} p\u0119dzi \u015Brodkiem boiska!"
      }),
      step("SHOT", "SCORER", void 0, p(34, 90), p(34, 104), 580, {
        commentaryTemplate: "{actor} STRZELA... GOL!"
      })
    ]
  },
  {
    id: "LONG_RANGE_STRIKE",
    title: "STRZA\u0141 Z DYSTANSU",
    steps: () => [
      step("PASS", "MIDFIELDER", "SCORER", p(34, 75), p(32, 79), 600, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        supportingRuns: [
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(30, 82), end: p(28, 90) },
          { role: "FORWARD", roleIndex: 1, side: "ATTACKING", start: p(38, 82), end: p(40, 90) }
        ],
        commentaryTemplate: "{actor} podaje do {receiver}."
      }),
      step("CONTROL", "SCORER", void 0, p(32, 79), p(33, 81), 400, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} przyjmuje pi\u0142k\u0119 i rusza kilka krok\xF3w do przodu."
      }),
      step("SHOT", "SCORER", void 0, p(33, 81), p(34, 104), 750, {
        commentaryTemplate: "{actor} STRZELA Z DYSTANSU... GOOOOOL!"
      })
    ]
  }
];
var authoredSaveFamilies = [
  {
    id: "CENTRAL_LAYOFF_SAVE",
    title: "STRZA\u0141 NAPASTNIKA PO PODANIU \u015ARODKIEM",
    steps: () => [
      step("DRIBBLE", "MIDFIELDER", void 0, p(34, 70), p(33, 74), 650, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        defendingGroupBehavior: "DEFENDERS_HOLD_LINE",
        supportingRuns: [
          { role: "SCORER", roleIndex: 0, side: "ATTACKING", start: p(34, 82), end: p(36, 76) },
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(40, 82), end: p(48, 86) }
        ],
        commentaryTemplate: "{actor} prowadzi pi\u0142k\u0119 do przodu."
      }),
      step("PASS", "MIDFIELDER", "SCORER", p(33, 74), p(36, 76), 600, {
        actorRoleIndex: 0,
        commentaryTemplate: "{actor} zagrywa do {receiver}."
      }),
      step("CONTROL", "SCORER", void 0, p(36, 76), p(35, 78), 450, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} przyjmuje pi\u0142k\u0119 i odwraca si\u0119 z ni\u0105 w stron\u0119 bramki."
      }),
      step("DRIBBLE", "SCORER", void 0, p(35, 78), p(34, 86), 500, {
        commentaryTemplate: "{actor} rusza z pi\u0142k\u0105 sprzed pola karnego."
      }),
      step("SHOT", "SCORER", void 0, p(34, 86), p(34, 101), 600, {
        commentaryTemplate: "{actor} STRZELA... pewna interwencja bramkarza!"
      })
    ]
  },
  {
    id: "LEFT_WING_SAVE",
    title: "AKCJA LEWYM SKRZYD\u0141EM",
    steps: () => [
      step("DRIBBLE", "WINGER", void 0, p(10, 75), p(12, 80), 780, {
        actorRoleIndex: 1,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        supportingRuns: [
          { role: "SCORER", roleIndex: 0, side: "ATTACKING", start: p(34, 78), end: p(30, 88) },
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(40, 78), end: p(46, 90) }
        ],
        commentaryTemplate: "{actor} rusza lew\u0105 stron\u0105 w kierunku pola karnego."
      }),
      step("PASS", "WINGER", "SCORER", p(12, 80), p(30, 88), 700, {
        actorRoleIndex: 1,
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} zagrywa po ziemi do {receiver}!"
      }),
      step("SHOT", "SCORER", void 0, p(30, 88), p(32, 101), 550, {
        commentaryTemplate: "{actor} STRZELA! Bramkarz broni!"
      })
    ]
  },
  {
    id: "TWO_FORWARD_COUNTER_SAVE",
    title: "SZYBKI KONTRATAK DW\xD3CH NAPASTNIK\xD3W",
    steps: () => [
      step("TACKLE", "MIDFIELDER", void 0, p(34, 42), p(35, 45), 480, {
        actorRoleIndex: 1,
        supportingRuns: [
          { role: "SCORER", roleIndex: 0, side: "ATTACKING", start: p(40, 55), end: p(44, 64) },
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(30, 55), end: p(30, 64) }
        ],
        commentaryTemplate: "{actor} przejmuje pi\u0142k\u0119!"
      }),
      step("DRIBBLE", "MIDFIELDER", void 0, p(35, 45), p(36, 50), 480, {
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} rusza do przodu z odzyskan\u0105 pi\u0142k\u0105."
      }),
      step("PASS", "MIDFIELDER", "SCORER", p(36, 50), p(46, 66), 680, {
        supportingRuns: [
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(30, 64), end: p(32, 74) }
        ],
        commentaryTemplate: "{actor} zagrywa do {receiver} na praw\u0105 stron\u0119!"
      }),
      step("DRIBBLE", "SCORER", void 0, p(46, 66), p(36, 84), 700, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} prowadzi pi\u0142k\u0119 i schodzi z prawej strony do \u015Brodka."
      }),
      step("SHOT", "SCORER", void 0, p(36, 84), p(33, 101), 580, {
        commentaryTemplate: "{actor} STRZELA! Bramkarz nie daje si\u0119 zaskoczy\u0107!"
      })
    ]
  },
  {
    id: "MIDFIELD_ONE_TWO_LONG_SHOT_SAVE",
    title: "KOMBINACJA DW\xD3CH POMOCNIK\xD3W I STRZA\u0141 Z DYSTANSU",
    steps: () => [
      step("PASS", "SCORER", "MIDFIELDER", p(34, 75), p(40, 76), 550, {
        receiverRoleIndex: 1,
        commentaryTemplate: "{actor} podaje do {receiver}."
      }),
      step("DRIBBLE", "MIDFIELDER", void 0, p(40, 76), p(44, 78), 450, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        supportingRuns: [
          { role: "SCORER", roleIndex: 0, side: "ATTACKING", start: p(34, 76), end: p(30, 84) },
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(34, 84), end: p(28, 90) },
          { role: "FORWARD", roleIndex: 1, side: "ATTACKING", start: p(40, 84), end: p(46, 80) }
        ],
        commentaryTemplate: "{actor} przesuwa si\u0119 z pi\u0142k\u0105 w bok."
      }),
      step("PASS", "MIDFIELDER", "SCORER", p(44, 78), p(30, 84), 600, {
        receiverRoleIndex: 1,
        commentaryTemplate: "{actor} odgrywa do nadbiegaj\u0105cego {receiver}!"
      }),
      step("SHOT", "SCORER", void 0, p(30, 84), p(32, 101), 720, {
        commentaryTemplate: "{actor} STRZELA Z DYSTANSU! Bramkarz \u0142apie pi\u0142k\u0119."
      })
    ]
  },
  {
    id: "THROUGH_BALL_ONE_ON_ONE_SAVE",
    title: "PODANIE POMI\u0118DZY OBRO\u0143C\xD3W I SYTUACJA SAM NA SAM",
    steps: () => [
      step("DRIBBLE", "MIDFIELDER", void 0, p(34, 70), p(33, 74), 650, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        supportingRuns: [
          { role: "SCORER", roleIndex: 0, side: "ATTACKING", start: p(34, 84), end: p(30, 88) },
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(40, 84), end: p(48, 86) }
        ],
        commentaryTemplate: "{actor} prowadzi pi\u0142k\u0119 do przodu."
      }),
      step("PASS", "MIDFIELDER", "SCORER", p(33, 74), p(30, 88), 780, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} zagrywa prostopad\u0142e podanie do {receiver}!"
      }),
      step("DRIBBLE", "SCORER", void 0, p(30, 88), p(33, 96), 650, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} wychodzi sam na sam z bramkarzem!"
      }),
      step("SHOT", "SCORER", void 0, p(33, 96), p(34, 101), 600, {
        commentaryTemplate: "{actor} STRZELA! BRONI BRAMKARZ!"
      })
    ]
  }
];
var authoredMissFamilies = [
  {
    id: "LONG_RANGE_MISS",
    title: "STRZA\u0141 Z DYSTANSU",
    steps: () => [
      step("PASS", "MIDFIELDER", "SCORER", p(34, 75), p(32, 79), 600, {
        actorRoleIndex: 0,
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        supportingRuns: [
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(34, 84), end: p(30, 90) },
          { role: "FORWARD", roleIndex: 1, side: "ATTACKING", start: p(40, 84), end: p(44, 90) }
        ],
        commentaryTemplate: "{actor} podaje do {receiver}."
      }),
      step("DRIBBLE", "SCORER", void 0, p(32, 79), p(33, 81), 450, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} rusza kilka metr\xF3w z pi\u0142k\u0105 do przodu."
      }),
      step("SHOT", "SCORER", void 0, p(33, 81), p(34, 104), 700, {
        commentaryTemplate: "{actor} STRZELA... niecelnie!"
      })
    ]
  },
  {
    id: "WING_ACTION_MISS",
    title: "STRZA\u0141 PO AKCJI SKRZYD\u0141EM",
    steps: () => [
      step("DRIBBLE", "WINGER", void 0, p(50, 72), p(58, 80), 750, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        supportingRuns: [
          { role: "SCORER", roleIndex: 0, side: "ATTACKING", start: p(34, 78), end: p(30, 88) },
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(40, 78), end: p(44, 86) }
        ],
        commentaryTemplate: "{actor} rusza praw\u0105 stron\u0105."
      }),
      step("PASS", "WINGER", "SCORER", p(58, 80), p(30, 88), 700, {
        actorRoleIndex: 0,
        commentaryTemplate: "{actor} zagrywa do {receiver}."
      }),
      step("CONTROL", "SCORER", void 0, p(30, 88), p(31, 89), 380, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} przyjmuje pi\u0142k\u0119."
      }),
      step("SHOT", "SCORER", void 0, p(31, 89), p(34, 104), 500, {
        commentaryTemplate: "{actor} STRZELA! Obok bramki!"
      })
    ]
  },
  {
    id: "FAST_COUNTER_MISS",
    title: "SZYBKI KONTRATAK",
    steps: () => [
      step("TACKLE", "MIDFIELDER", void 0, p(34, 42), p(35, 45), 480, {
        actorRoleIndex: 1,
        supportingRuns: [
          { role: "SCORER", roleIndex: 0, side: "ATTACKING", start: p(34, 55), end: p(34, 65) },
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(40, 55), end: p(44, 65) }
        ],
        commentaryTemplate: "{actor} przejmuje pi\u0142k\u0119!"
      }),
      step("PASS", "MIDFIELDER", "SCORER", p(35, 45), p(34, 65), 650, {
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} podaje do {receiver}!"
      }),
      step("DRIBBLE", "SCORER", void 0, p(34, 65), p(34, 80), 550, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        supportingRuns: [
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(44, 65), end: p(40, 78) }
        ],
        commentaryTemplate: "{actor} rusza \u015Brodkiem boiska."
      }),
      step("SHOT", "SCORER", void 0, p(34, 80), p(34, 104), 600, {
        commentaryTemplate: "{actor} STRZELA! Nad bramk\u0105!"
      })
    ]
  },
  {
    id: "BOX_EDGE_COMBINATION_MISS",
    title: "KOMBINACJA PRZED POLEM KARNYM",
    steps: () => [
      step("PASS", "SCORER", "FORWARD", p(34, 86), p(30, 82), 550, {
        commentaryTemplate: "{actor} podaje do {receiver}."
      }),
      step("PASS", "FORWARD", "MIDFIELDER", p(30, 82), p(20, 84), 500, {
        receiverRoleIndex: 1,
        commentaryTemplate: "{actor} odgrywa do {receiver}."
      }),
      step("PASS", "MIDFIELDER", "SCORER", p(20, 84), p(30, 90), 550, {
        receiverRoleIndex: 1,
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        supportingRuns: [
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(30, 82), end: p(28, 92) }
        ],
        commentaryTemplate: "{actor} znowu do {receiver}!"
      }),
      step("SHOT", "SCORER", void 0, p(30, 90), p(34, 104), 600, {
        commentaryTemplate: "{actor} STRZELA! Minimalnie obok bramki!"
      })
    ]
  },
  {
    id: "DEFENSE_SPLITTING_RUN_MISS",
    title: "NAPASTNIK WYCHODZI ZA LINI\u0118 OBRONY",
    steps: () => [
      step("DRIBBLE", "MIDFIELDER", void 0, p(34, 70), p(33, 74), 650, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        supportingRuns: [
          { role: "SCORER", roleIndex: 0, side: "ATTACKING", start: p(34, 84), end: p(30, 88) },
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(40, 84), end: p(48, 86) }
        ],
        commentaryTemplate: "{actor} prowadzi pi\u0142k\u0119 do przodu."
      }),
      step("PASS", "MIDFIELDER", "SCORER", p(33, 74), p(30, 88), 780, {
        actorRoleIndex: 0,
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} \u015Bwietnie zagrywa mi\u0119dzy obro\u0144c\xF3w do {receiver}!"
      }),
      step("DRIBBLE", "SCORER", void 0, p(30, 88), p(33, 96), 650, {
        commentaryTemplate: "{actor} wychodzi na pozycj\u0119 i rusza na bramk\u0119!"
      }),
      step("SHOT", "SCORER", void 0, p(33, 96), p(34, 104), 600, {
        commentaryTemplate: "{actor} STRZELA! Nie trafia w bramk\u0119!"
      })
    ]
  }
];
var cornerShotFamilies = [
  {
    id: "CORNER_CROSS_AND_HEADER",
    title: "DO\u015ARODKOWANIE I STRZA\u0141 Z RZUTU RO\u017BNEGO",
    steps: () => [
      step("CONTROL", "WINGER", void 0, p(67, 104), p(67, 104), 2200, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENDERS_HOLD_LINE",
        commentaryTemplate: "Zawodnicy wbiegaj\u0105 w pole karne, {actor} czeka z pi\u0142k\u0105 przy ro\u017Cniku..."
      }),
      step("CROSS", "WINGER", "SCORER", p(67, 104), p(31, 94), 1050, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENDERS_HOLD_LINE",
        supportingRuns: [
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(40, 88), end: p(46, 96) },
          { role: "MIDFIELDER", roleIndex: 0, side: "ATTACKING", start: p(34, 80), end: p(34, 86) },
          { role: "MIDFIELDER", roleIndex: 1, side: "ATTACKING", start: p(34, 70), end: p(34, 76) },
          { role: "DEFENDER", roleIndex: 0, side: "ATTACKING", start: p(34, 50), end: p(34, 52) },
          { role: "DEFENDER", roleIndex: 0, side: "DEFENDING", start: p(30, 86), end: p(31, 90) },
          { role: "DEFENDER", roleIndex: 1, side: "DEFENDING", start: p(42, 86), end: p(45, 92) },
          { role: "MIDFIELDER", roleIndex: 0, side: "DEFENDING", start: p(34, 80), end: p(34, 84) }
        ],
        commentaryTemplate: "{actor} wykonuje rzut ro\u017Cny w pole karne..."
      }),
      step("CONTROL", "SCORER", void 0, p(31, 94), p(33, 96), 450, {
        defendingGroupBehavior: "DEFENDERS_HOLD_LINE",
        commentaryTemplate: "{actor}!"
      }),
      step("SHOT", "SCORER", void 0, p(33, 96), p(34, 104), 600, {
        commentaryTemplate: "{actor} \u2014 STRZA\u0141!"
      })
    ]
  },
  {
    id: "CORNER_FAR_POST_CROSS",
    title: "DO\u015ARODKOWANIE NA DALSZ\u0104 CZ\u0118\u015A\u0106 POLA KARNEGO",
    steps: () => [
      step("CONTROL", "WINGER", void 0, p(1, 104), p(1, 104), 2200, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "Zawodnicy ustawiaj\u0105 si\u0119 w polu karnym, {actor} czeka z pi\u0142k\u0105 przy ro\u017Cniku..."
      }),
      step("CROSS", "WINGER", "SCORER", p(1, 104), p(46, 92), 1050, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        supportingRuns: [
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(34, 90), end: p(30, 96) },
          { role: "MIDFIELDER", roleIndex: 0, side: "ATTACKING", start: p(34, 80), end: p(34, 84) },
          { role: "DEFENDER", roleIndex: 0, side: "DEFENDING", start: p(40, 86), end: p(44, 90) }
        ],
        commentaryTemplate: "{actor} zagrywa pi\u0142k\u0119 na dalsz\u0105 stron\u0119 pola karnego..."
      }),
      step("CONTROL", "SCORER", void 0, p(46, 92), p(44, 94), 450, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "{actor} dochodzi do pi\u0142ki..."
      }),
      step("SHOT", "SCORER", void 0, p(44, 94), p(34, 104), 600, {
        commentaryTemplate: "{actor} \u2014 STRZA\u0141!"
      })
    ]
  }
];
var freeKickShotFamilies = [
  {
    id: "FREE_KICK_DIRECT_SHOT",
    title: "BEZPO\u015AREDNI STRZA\u0141 Z RZUTU WOLNEGO",
    steps: () => [
      step("CONTROL", "SCORER", void 0, p(30, 80), p(30, 80), 2600, {
        defendingGroupBehavior: "DEFENDERS_HOLD_LINE",
        supportingRuns: [
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(28, 90), end: p(28, 92) },
          { role: "FORWARD", roleIndex: 1, side: "ATTACKING", start: p(40, 90), end: p(40, 92) },
          { role: "DEFENDER", roleIndex: 0, side: "DEFENDING", start: p(30, 84), end: p(30, 88) },
          { role: "DEFENDER", roleIndex: 1, side: "DEFENDING", start: p(33, 84), end: p(33, 88) },
          { role: "DEFENDER", roleIndex: 2, side: "DEFENDING", start: p(36, 84), end: p(36, 88) }
        ],
        commentaryTemplate: "Obrona ustawia mur... {actor} czeka na gwizdek s\u0119dziego, b\u0119dzie strzela\u0142 bezpo\u015Brednio..."
      }),
      step("CONTROL", "SCORER", void 0, p(30, 80), p(31, 81), 500, {
        commentaryTemplate: "S\u0119dzia gwi\u017Cd\u017Ce \u2014 {actor} rusza do pi\u0142ki!"
      }),
      step("SHOT", "SCORER", void 0, p(31, 81), p(34, 104), 700, {
        commentaryTemplate: "{actor} \u2014 STRZA\u0141!"
      })
    ]
  },
  {
    id: "FREE_KICK_LAYOFF_SHOT",
    title: "PODANIE DO DRUGIEGO ZAWODNIKA I STRZA\u0141",
    steps: () => [
      step("CONTROL", "MIDFIELDER", void 0, p(30, 75), p(30, 75), 2600, {
        actorRoleIndex: 0,
        defendingGroupBehavior: "DEFENDERS_HOLD_LINE",
        supportingRuns: [
          { role: "DEFENDER", roleIndex: 0, side: "DEFENDING", start: p(27, 71), end: p(30, 75) },
          { role: "DEFENDER", roleIndex: 1, side: "DEFENDING", start: p(33, 71), end: p(33, 75) }
        ],
        commentaryTemplate: "Obrona ustawia mur... {actor} czeka na gwizdek s\u0119dziego..."
      }),
      step("PASS", "MIDFIELDER", "SCORER", p(30, 75), p(38, 76), 600, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        supportingRuns: [
          { role: "DEFENDER", roleIndex: 0, side: "ATTACKING", start: p(20, 55), end: p(24, 64) },
          { role: "DEFENDER", roleIndex: 1, side: "ATTACKING", start: p(46, 55), end: p(42, 64) }
        ],
        commentaryTemplate: "{actor} nie strzela... podaje do {receiver}..."
      }),
      step("DRIBBLE", "SCORER", void 0, p(38, 76), p(34, 82), 550, {
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        supportingRuns: [
          { role: "DEFENDER", roleIndex: 0, side: "ATTACKING", start: p(24, 64), end: p(28, 74) },
          { role: "DEFENDER", roleIndex: 1, side: "ATTACKING", start: p(42, 64), end: p(38, 74) }
        ],
        commentaryTemplate: "{actor} ma miejsce..."
      }),
      step("SHOT", "SCORER", void 0, p(34, 82), p(34, 104), 700, {
        commentaryTemplate: "{actor} \u2014 STRZA\u0141!"
      })
    ]
  },
  {
    id: "FREE_KICK_CROSS_HEADER",
    title: "DO\u015ARODKOWANIE W POLE KARNE Z RZUTU WOLNEGO",
    steps: () => [
      step("CONTROL", "WINGER", void 0, p(8, 74), p(8, 74), 2600, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "Zawodnicy ustawiaj\u0105 si\u0119 w polu karnym, {actor} czeka na gwizdek s\u0119dziego..."
      }),
      step("CROSS", "WINGER", "SCORER", p(8, 74), p(31, 90), 900, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        supportingRuns: [
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(42, 86), end: p(46, 92) },
          { role: "MIDFIELDER", roleIndex: 0, side: "ATTACKING", start: p(34, 78), end: p(34, 82) },
          { role: "MIDFIELDER", roleIndex: 1, side: "ATTACKING", start: p(34, 68), end: p(34, 74) },
          { role: "DEFENDER", roleIndex: 0, side: "DEFENDING", start: p(30, 84), end: p(31, 88) }
        ],
        commentaryTemplate: "{actor} z rzutu wolnego... zagranie w pole karne..."
      }),
      step("CONTROL", "SCORER", void 0, p(31, 90), p(33, 93), 400, {
        commentaryTemplate: "{actor} dochodzi do pi\u0142ki..."
      }),
      step("SHOT", "SCORER", void 0, p(33, 93), p(34, 104), 600, {
        commentaryTemplate: "{actor} \u2014 STRZA\u0141!"
      })
    ]
  }
];
var cornerRestartFamilies = [
  {
    id: "CORNER_SHORT_COMBINATION",
    title: "KR\xD3TKO ROZEGRANY RZUT RO\u017BNY",
    steps: () => [
      step("CONTROL", "SCORER", void 0, p(67, 104), p(67, 104), 2200, {
        commentaryTemplate: "Zawodnicy ustawiaj\u0105 si\u0119 do rzutu ro\u017Cnego, {actor} czeka z pi\u0142k\u0105 przy ro\u017Cniku..."
      }),
      step("PASS", "SCORER", "MIDFIELDER", p(67, 104), p(60, 96), 550, {
        receiverRoleIndex: 0,
        commentaryTemplate: "{actor} rozgrywa rzut ro\u017Cny kr\xF3tko, do {receiver}..."
      }),
      step("DRIBBLE", "MIDFIELDER", void 0, p(60, 96), p(52, 92), 500, {
        actorRoleIndex: 0,
        supportingRuns: [
          { role: "SCORER", roleIndex: 0, side: "ATTACKING", start: p(66, 96), end: p(60, 88) },
          { role: "DEFENDER", roleIndex: 0, side: "DEFENDING", start: p(50, 90), end: p(54, 92) }
        ],
        commentaryTemplate: "{actor} prowadzi pi\u0142k\u0119 kilka metr\xF3w w stron\u0119 \u015Brodka..."
      }),
      step("PASS", "MIDFIELDER", "SCORER", p(52, 92), p(64, 90), 500, {
        actorRoleIndex: 0,
        commentaryTemplate: "{actor} odgrywa ponownie do {receiver}..."
      }),
      step("CROSS", "SCORER", "FORWARD", p(64, 90), p(31, 92), 750, {
        receiverRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        supportingRuns: [
          { role: "MIDFIELDER", roleIndex: 1, side: "ATTACKING", start: p(40, 86), end: p(44, 90) }
        ],
        commentaryTemplate: "{actor} zagrywa pi\u0142k\u0119 w pole karne!"
      })
    ]
  },
  {
    id: "CORNER_DEFENSIVE_CLEARANCE",
    title: "DO\u015ARODKOWANIE I WYBICIE PRZEZ OBRO\u0143C\u0118",
    steps: () => [
      step("CONTROL", "SCORER", void 0, p(1, 104), p(1, 104), 2200, {
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        commentaryTemplate: "Zawodnicy wbiegaj\u0105 w pole karne, {actor} czeka z pi\u0142k\u0105 przy ro\u017Cniku..."
      }),
      step("CROSS", "SCORER", "FORWARD", p(1, 104), p(32, 92), 950, {
        receiverRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENDERS_HOLD_LINE",
        supportingRuns: [
          { role: "MIDFIELDER", roleIndex: 1, side: "ATTACKING", start: p(40, 88), end: p(44, 92) }
        ],
        commentaryTemplate: "{actor} wykonuje rzut ro\u017Cny..."
      }),
      step("REBOUND", "MIDFIELDER", void 0, p(32, 92), p(30, 84), 550, {
        actorRoleIndex: 0,
        supportingRuns: [
          { role: "DEFENDER", roleIndex: 0, side: "DEFENDING", start: p(30, 90), end: p(28, 86) }
        ],
        commentaryTemplate: "Obrona wybija pi\u0142k\u0119, ale akcja jeszcze si\u0119 nie ko\u0144czy \u2014 {actor} rusza do niej!"
      })
    ]
  },
  {
    id: "CORNER_CLEARANCE_COUNTER",
    title: "WYBICIE I KONTRA PRZECIWNIKA",
    steps: () => [
      step("CONTROL", "SCORER", void 0, p(67, 104), p(67, 104), 2200, {
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        commentaryTemplate: "Wi\u0119kszo\u015B\u0107 dru\u017Cyny wbiega na po\u0142ow\u0119 przeciwnika, {actor} czeka z pi\u0142k\u0105 przy ro\u017Cniku..."
      }),
      step("CROSS", "SCORER", "FORWARD", p(67, 104), p(32, 90), 950, {
        receiverRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENDERS_HOLD_LINE",
        commentaryTemplate: "{actor} wykonuje rzut ro\u017Cny..."
      }),
      step("REBOUND", "FORWARD", void 0, p(32, 90), p(52, 86), 650, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        defendingGroupBehavior: "TEAM_PUSH_FORWARD",
        supportingRuns: [
          { role: "FORWARD", roleIndex: 0, side: "DEFENDING", start: p(46, 80), end: p(52, 84) },
          { role: "MIDFIELDER", roleIndex: 0, side: "ATTACKING", start: p(34, 80), end: p(34, 60) },
          { role: "MIDFIELDER", roleIndex: 1, side: "ATTACKING", start: p(34, 70), end: p(34, 55) }
        ],
        commentaryTemplate: "Obrona wybija pi\u0142k\u0119 na bok... zaczyna si\u0119 kontratak dru\u017Cyny przeciwnej!"
      })
    ]
  }
];
var freeKickRestartFamilies = [
  {
    id: "FREE_KICK_SHORT_COMBINATION",
    title: "KR\xD3TKIE ROZEGRANIE I AKCJA SKRZYD\u0141EM",
    steps: () => [
      step("CONTROL", "MIDFIELDER", void 0, p(5, 69), p(5, 69), 2600, {
        actorRoleIndex: 0,
        defendingGroupBehavior: "MIDFIELD_SHIFT_LEFT",
        commentaryTemplate: "{actor} czeka na gwizdek s\u0119dziego, zanim rozegra wolny kr\xF3tko..."
      }),
      step("PASS", "MIDFIELDER", "MIDFIELDER", p(5, 69), p(10, 72), 500, {
        actorRoleIndex: 0,
        receiverRoleIndex: 1,
        commentaryTemplate: "{actor} rozgrywa wolny kr\xF3tko, do {receiver}..."
      }),
      step("PASS", "MIDFIELDER", "MIDFIELDER", p(10, 72), p(14, 76), 500, {
        actorRoleIndex: 1,
        receiverRoleIndex: 0,
        commentaryTemplate: "{actor} odgrywa pi\u0142k\u0119 z powrotem do biegn\u0105cego {receiver}..."
      }),
      step("DRIBBLE", "MIDFIELDER", void 0, p(14, 76), p(18, 82), 500, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "TEAM_PUSH_FORWARD",
        defendingGroupBehavior: "MIDFIELD_SHIFT_LEFT",
        supportingRuns: [
          { role: "FORWARD", roleIndex: 0, side: "ATTACKING", start: p(30, 86), end: p(28, 90) },
          { role: "FORWARD", roleIndex: 1, side: "ATTACKING", start: p(38, 86), end: p(40, 90) }
        ],
        commentaryTemplate: "{actor} prowadzi pi\u0142k\u0119, jest miejsce na lewej stronie..."
      }),
      step("CROSS", "MIDFIELDER", "FORWARD", p(18, 82), p(30, 90), 700, {
        actorRoleIndex: 0,
        receiverRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        commentaryTemplate: "{actor} zagrywa pi\u0142k\u0119 w pole karne!"
      })
    ]
  },
  {
    id: "FREE_KICK_CLEARANCE_RECOVERY",
    title: "DO\u015ARODKOWANIE I WYBICIE OBRONY",
    steps: () => [
      step("CONTROL", "WINGER", void 0, p(60, 72), p(60, 72), 2600, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        commentaryTemplate: "Zawodnicy ustawiaj\u0105 si\u0119 w polu karnym, {actor} czeka na gwizdek s\u0119dziego..."
      }),
      step("CROSS", "WINGER", "FORWARD", p(60, 72), p(38, 90), 850, {
        actorRoleIndex: 0,
        receiverRoleIndex: 0,
        attackingGroupBehavior: "ATTACKERS_ENTER_BOX",
        defendingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        supportingRuns: [
          { role: "MIDFIELDER", roleIndex: 1, side: "ATTACKING", start: p(30, 86), end: p(28, 90) }
        ],
        commentaryTemplate: "{actor} zagrywa z rzutu wolnego... pi\u0142ka w pole karne..."
      }),
      step("REBOUND", "MIDFIELDER", void 0, p(38, 90), p(30, 80), 600, {
        actorRoleIndex: 0,
        attackingGroupBehavior: "DEFENSIVE_LINE_RETREAT",
        defendingGroupBehavior: "TEAM_PUSH_FORWARD",
        supportingRuns: [
          { role: "DEFENDER", roleIndex: 0, side: "DEFENDING", start: p(36, 88), end: p(32, 84) }
        ],
        commentaryTemplate: "Obrona wybija pi\u0142k\u0119 przed pole karne... {actor} rusza do niej!"
      })
    ]
  }
];
var offsideFamilies = attackFamilies.slice(0, 5);
var makeScripts = (outcome, families, variantsPerFamily) => families.flatMap(
  (family) => Array.from({ length: variantsPerFamily }, (_, variant) => ({
    id: `${outcome}_${family.id}_${variant + 1}`,
    outcome,
    family: family.id,
    title: family.title,
    steps: family.steps(variant, outcome)
  }))
);
var taggedScripts = (outcome, families, requiredSetPieceKind) => makeScripts(outcome, families, 1).map((script) => ({ ...script, requiredSetPieceKind }));
var MATCH_ENGINE_V2_GOAL_SCRIPTS = [
  ...makeScripts("GOAL", authoredGoalFamilies, 1),
  ...taggedScripts("GOAL", cornerShotFamilies, "CORNER"),
  ...taggedScripts("GOAL", freeKickShotFamilies, "FREE_KICK")
];
var MATCH_ENGINE_V2_OFFSIDE_SCRIPTS = makeScripts("OFFSIDE", offsideFamilies, 2);
var MATCH_ENGINE_V2_MISS_SCRIPTS = [
  ...makeScripts("MISS", authoredMissFamilies, 1),
  ...taggedScripts("MISS", cornerShotFamilies, "CORNER"),
  ...taggedScripts("MISS", freeKickShotFamilies, "FREE_KICK")
];
var MATCH_ENGINE_V2_SAVE_SCRIPTS = [
  ...makeScripts("SAVE", authoredSaveFamilies, 1),
  ...taggedScripts("SAVE", cornerShotFamilies, "CORNER"),
  ...taggedScripts("SAVE", freeKickShotFamilies, "FREE_KICK")
];
var MATCH_ENGINE_V2_FOUL_SCRIPTS = makeScripts("FOUL", attackFamilies, 2);
var MATCH_ENGINE_V2_CORNER_RESTART_SCRIPTS = makeScripts("CORNER_RESTART", cornerRestartFamilies, 1);
var MATCH_ENGINE_V2_FREE_KICK_RESTART_SCRIPTS = makeScripts("FREE_KICK_RESTART", freeKickRestartFamilies, 1);
var MATCH_ENGINE_V2_HIGHLIGHT_SCRIPTS = {
  GOAL: MATCH_ENGINE_V2_GOAL_SCRIPTS,
  OFFSIDE: MATCH_ENGINE_V2_OFFSIDE_SCRIPTS,
  MISS: MATCH_ENGINE_V2_MISS_SCRIPTS,
  SAVE: MATCH_ENGINE_V2_SAVE_SCRIPTS,
  FOUL: MATCH_ENGINE_V2_FOUL_SCRIPTS,
  CORNER_RESTART: MATCH_ENGINE_V2_CORNER_RESTART_SCRIPTS,
  FREE_KICK_RESTART: MATCH_ENGINE_V2_FREE_KICK_RESTART_SCRIPTS
};
var cueOutcome = (cue) => {
  if (cue.kind === "GOAL") return "GOAL";
  if (cue.sourceEventType === "OFFSIDE" /* OFFSIDE */) return "OFFSIDE";
  if (cue.kind === "SAVE" || cue.sourceEventType === "ONE_ON_ONE_SAVE" /* ONE_ON_ONE_SAVE */) return "SAVE";
  if (cue.kind === "FOUL") return "FOUL";
  if (cue.sourceEventType === "SHOT" /* SHOT */ || cue.sourceEventType === "SHOT_POST" /* SHOT_POST */ || cue.sourceEventType === "SHOT_BAR" /* SHOT_BAR */ || cue.sourceEventType === "ONE_ON_ONE_MISS" /* ONE_ON_ONE_MISS */ || cue.sourceEventType === "PENALTY_MISSED" /* PENALTY_MISSED */) return "MISS";
  if (cue.sourceEventType === "CORNER_TAKEN" /* CORNER_TAKEN */) return "CORNER_RESTART";
  if (cue.sourceEventType === "FREE_KICK" /* FREE_KICK */ || cue.sourceEventType === "FREE_KICK_DANGEROUS" /* FREE_KICK_DANGEROUS */) return "FREE_KICK_RESTART";
  return null;
};
var outcomePriority = {
  GOAL: 5,
  SAVE: 4,
  MISS: 3,
  OFFSIDE: 2,
  FOUL: 1,
  CORNER_RESTART: 0,
  FREE_KICK_RESTART: 0
};
var RESTART_ACTION_PRIORITY = 0;
var KEY_MOMENT_XG_THRESHOLD = 0.3;
var isStandaloneRestartAction = (cue) => cue.sourceEventType === "CORNER" /* CORNER */ || cue.sourceEventType === "CORNER_TAKEN" /* CORNER_TAKEN */ || cue.sourceEventType === "FREE_KICK" /* FREE_KICK */ || cue.sourceEventType === "FREE_KICK_DANGEROUS" /* FREE_KICK_DANGEROUS */ || cue.sourceEventType === "PENALTY_AWARDED" /* PENALTY_AWARDED */ || // Covers the initial kickoff, half-time restart and — the one the user
// actually asked for — the conceding side kicking off again after a goal.
// Without this a KICK_OFF cue matched no outcome and no other branch here,
// so it was silently dropped and never shown as a scene at all.
cue.sourceEventType === "KICK_OFF" /* KICK_OFF */;
var isKeyMoment = (cue, outcome) => {
  if (outcome === "GOAL") return true;
  if (outcome === "MISS") {
    return cue.sourceEventType === "PENALTY_MISSED" /* PENALTY_MISSED */ || cue.sourceEventType === "SHOT_POST" /* SHOT_POST */ || cue.sourceEventType === "SHOT_BAR" /* SHOT_BAR */ || (cue.xG ?? 0) >= KEY_MOMENT_XG_THRESHOLD;
  }
  if (outcome === "SAVE") return (cue.xG ?? 0) >= KEY_MOMENT_XG_THRESHOLD;
  return false;
};
var isKeyMomentCue = (cue) => {
  const outcome = cueOutcome(cue);
  return Boolean(outcome && isKeyMoment(cue, outcome));
};
var priorityFor = (cue) => {
  const outcome = cueOutcome(cue);
  return outcome ? outcomePriority[outcome] : RESTART_ACTION_PRIORITY;
};
var terminalCues = (mode, cues) => {
  if (mode === "COMMENTARY_ONLY") return [];
  if (mode === "FULL_MATCH") return [...cues];
  const candidates = cues.filter((cue) => {
    if (mode === "ALL_ACTIONS" && isStandaloneRestartAction(cue)) return true;
    const outcome = cueOutcome(cue);
    if (!outcome) return false;
    return mode === "ALL_ACTIONS" || isKeyMoment(cue, outcome);
  });
  const bestBySequence = /* @__PURE__ */ new Map();
  candidates.forEach((cue) => {
    const key = cue.sequenceId ?? `${cue.atSecond}:${cue.side ?? "NONE"}`;
    const previous = bestBySequence.get(key);
    if (!previous || priorityFor(cue) >= priorityFor(previous)) bestBySequence.set(key, cue);
  });
  return [...bestBySequence.values()].sort((left, right) => left.atSecond - right.atSecond || left.id.localeCompare(right.id));
};
var mirroredPoint = (value, away) => away ? { x: 68 - value.x, y: 105 - value.y } : { ...value };
var terminalEnd = (outcome, scriptStep, salt) => {
  if (outcome === "GOAL") return scriptStep.end;
  if (outcome === "SAVE") {
    const keeperSide = stableHash(`${salt}:save-side`) % 2 === 0 ? -1 : 1;
    return { x: 34 + keeperSide * (2.5 + stableHash(`${salt}:save-width`) % 4), y: 101.5 };
  }
  if (outcome === "MISS") {
    const missesLeft = stableHash(`${salt}:miss-side`) % 2 === 0;
    return { x: missesLeft ? 18 : 50, y: 105 };
  }
  if (outcome === "OFFSIDE") {
    return { x: scriptStep.start.x, y: Math.min(96, scriptStep.start.y + 7) };
  }
  if (outcome === "CORNER_RESTART" || outcome === "FREE_KICK_RESTART") return scriptStep.end;
  return scriptStep.start;
};
var eventTypeForStep = (kind) => {
  if (kind === "CONTROL") return "BALL_CONTROL" /* BALL_CONTROL */;
  if (kind === "DRIBBLE") return "DRIBBLING" /* DRIBBLING */;
  if (kind === "CROSS") return "CROSS_NEAR_POST" /* CROSS_NEAR_POST */;
  if (kind === "TACKLE") return "TACKLE_WON" /* TACKLE_WON */;
  if (kind === "BLOCK") return "SHOT_BLOCKED" /* SHOT_BLOCKED */;
  if (kind === "REBOUND") return "REBOUND_WON" /* REBOUND_WON */;
  if (kind === "FOUL") return "FOUL" /* FOUL */;
  if (kind === "OFFSIDE") return "OFFSIDE" /* OFFSIDE */;
  if (kind === "SHOT") return "SHOT" /* SHOT */;
  return "PASS_COMPLETED" /* PASS_COMPLETED */;
};
var cueKindForStep = (kind) => {
  if (kind === "CONTROL") return "CONTROL";
  if (kind === "DRIBBLE") return "DRIBBLE";
  if (kind === "CROSS") return "CROSS";
  if (kind === "TACKLE") return "TACKLE";
  if (kind === "BLOCK") return "BLOCK";
  if (kind === "REBOUND") return "REBOUND";
  if (kind === "FOUL") return "FOUL";
  if (kind === "OFFSIDE") return "RESTART";
  if (kind === "SHOT") return "SHOT";
  return "PASS";
};
var MatchEngineV2HighlightScriptService = {
  outcomeForCue: cueOutcome,
  selectTerminalCues: terminalCues,
  isKeyMomentCue,
  selectScript: (cue) => {
    const outcome = cueOutcome(cue);
    if (!outcome) return null;
    const pool = MATCH_ENGINE_V2_HIGHLIGHT_SCRIPTS[outcome];
    const setPieceCategory = cue.setPieceKind === "CORNER" ? "CORNER" : cue.setPieceKind === "FREE_KICK_WIDE" || cue.setPieceKind === "FREE_KICK_DIRECT" ? "FREE_KICK" : void 0;
    const matchingSetPiece = setPieceCategory ? pool.filter((script) => script.requiredSetPieceKind === setPieceCategory) : [];
    const candidates = matchingSetPiece.length > 0 ? matchingSetPiece : pool.filter((script) => !script.requiredSetPieceKind);
    if (candidates.length === 0) return null;
    return candidates[stableHash(`${cue.sourceEventId}:${cue.sequenceId ?? ""}:${outcome}`) % candidates.length];
  },
  materialize: (terminal, snapshot3) => {
    const script = MatchEngineV2HighlightScriptService.selectScript(terminal);
    const outcome = cueOutcome(terminal);
    if (!script || !outcome) return [];
    const attackingSide = outcome === "FOUL" ? terminal.side === "HOME" ? "AWAY" : "HOME" : terminal.side ?? "HOME";
    const activePlayers4 = Object.values(snapshot3.spatial.players).filter((player) => player.isOnPitch && player.side === attackingSide);
    const defendingSide = attackingSide === "HOME" ? "AWAY" : "HOME";
    const defendingActivePlayers = Object.values(snapshot3.spatial.players).filter((player) => player.isOnPitch && player.side === defendingSide);
    const defendingGoalkeeper = defendingActivePlayers.find((player) => player.role === "GK");
    const byRole = {
      FORWARD: activePlayers4.filter((player) => player.role === "FWD"),
      MIDFIELDER: activePlayers4.filter((player) => player.role === "MID"),
      DEFENDER: activePlayers4.filter((player) => player.role === "DEF"),
      WINGER: activePlayers4.filter((player) => player.role === "MID" || player.role === "FWD").sort((left, right) => Math.abs(right.anchor.x - 34) - Math.abs(left.anchor.x - 34))
    };
    const defendingByRole = {
      FORWARD: defendingActivePlayers.filter((player) => player.role === "FWD"),
      MIDFIELDER: defendingActivePlayers.filter((player) => player.role === "MID"),
      DEFENDER: defendingActivePlayers.filter((player) => player.role === "DEF"),
      WINGER: defendingActivePlayers.filter((player) => player.role === "MID" || player.role === "FWD").sort((left, right) => Math.abs(right.anchor.x - 34) - Math.abs(left.anchor.x - 34))
    };
    const recordedAttackerId = outcome === "FOUL" ? terminal.secondaryPlayerId : terminal.actorId;
    const scorer = recordedAttackerId && snapshot3.spatial.players[recordedAttackerId]?.side === attackingSide ? recordedAttackerId : byRole.FORWARD[0]?.playerId ?? byRole.MIDFIELDER[0]?.playerId;
    const actorFor = (slot, index, avoidId) => {
      if (slot === "SCORER") return scorer;
      const pool = byRole[slot];
      return pool.find((player, poolIndex) => poolIndex >= index % Math.max(1, pool.length) && player.playerId !== avoidId)?.playerId ?? pool.find((player) => player.playerId !== avoidId)?.playerId ?? scorer;
    };
    const resolveRunPlayer = (run) => {
      if (run.role === "SCORER") return scorer;
      const rawPool = run.side === "ATTACKING" ? byRole[run.role] : defendingByRole[run.role];
      const pool = run.side === "ATTACKING" ? rawPool.filter((player) => player.playerId !== scorer) : rawPool;
      return pool[run.roleIndex]?.playerId ?? pool[0]?.playerId;
    };
    const away = attackingSide === "AWAY";
    const sequenceId = `highlight_${terminal.id}_${script.id}`;
    let currentCarrierId;
    return script.steps.map((scriptStep, index) => {
      const last = index === script.steps.length - 1;
      const receivesLooseBall = scriptStep.kind === "REBOUND" || scriptStep.kind === "TACKLE";
      const actorId = last && scorer ? scorer : receivesLooseBall || !currentCarrierId ? actorFor(scriptStep.actor, scriptStep.actorRoleIndex ?? index) : currentCarrierId;
      const nextStep = script.steps[index + 1];
      const actionReceiverId = scriptStep.receiver ? nextStep?.actor === "SCORER" && scorer && scorer !== actorId ? scorer : actorFor(scriptStep.receiver, scriptStep.receiverRoleIndex ?? index + 1, actorId) : void 0;
      const secondaryPlayerId = last && outcome === "SAVE" ? defendingGoalkeeper?.playerId : actionReceiverId;
      if (scriptStep.kind === "PASS" || scriptStep.kind === "CROSS") {
        currentCarrierId = actionReceiverId ?? actorId;
      } else if (scriptStep.kind !== "BLOCK") {
        currentCarrierId = actorId;
      }
      return {
        id: `${sequenceId}_${index + 1}`,
        sourceEventId: last ? terminal.sourceEventId : `${terminal.sourceEventId}_script_${index + 1}`,
        sequenceId,
        sourceEventType: last ? terminal.sourceEventType : eventTypeForStep(scriptStep.kind),
        // Set-piece identity must survive materialisation. Without it a corner
        // or free-kick highlight was treated like open play, so defenders did
        // not form a wall/mark the box and player markers collapsed together.
        setPieceKind: terminal.setPieceKind,
        kind: last ? terminal.kind : cueKindForStep(scriptStep.kind),
        atSecond: terminal.atSecond,
        side: attackingSide,
        actorId,
        secondaryPlayerId,
        start: mirroredPoint(scriptStep.start, away),
        end: mirroredPoint(last ? terminalEnd(outcome, scriptStep, terminal.id) : scriptStep.end, away),
        durationMs: scriptStep.durationMs,
        highlightScriptId: script.id,
        highlightScriptTitle: script.title,
        highlightSceneIndex: index + 1,
        highlightSceneCount: script.steps.length,
        scriptedHighlight: true,
        attackingGroupBehavior: scriptStep.attackingGroupBehavior,
        defendingGroupBehavior: scriptStep.defendingGroupBehavior,
        commentaryTemplate: scriptStep.commentaryTemplate,
        supportingRuns: (scriptStep.supportingRuns ?? []).map((run) => {
          const playerId = resolveRunPlayer(run);
          return playerId ? { playerId, start: mirroredPoint(run.start, away), end: mirroredPoint(run.end, away) } : void 0;
        }).filter((run) => Boolean(run))
      };
    });
  }
};

// services/match/engines/v2/MatchEngineV2PlaybackService.ts
var MATCH_SECONDS_PER_MATCH_MINUTE = 60;
var MatchEngineV2PlaybackService = {
  create: (options) => ({
    exactSecond: 0,
    targetSecond: 0,
    paused: true,
    speed: options?.speed ?? 1,
    sceneSpeed: options?.sceneSpeed ?? 1,
    renderMode: options?.renderMode ?? "INTERACTIVE",
    // Key moments are the safe default for the prototype: quiet match time is
    // advanced quickly, while only goals and genuinely dangerous chances take
    // control of the pitch presentation. A user may still opt into every
    // action or the experimental full-match stream.
    transmissionMode: options?.transmissionMode ?? "KEY_MOMENTS",
    // Replays deliberately default to off. Otherwise the live finish and its
    // immediate replay can look like the same player taking two shots.
    goalReplays: options?.goalReplays ?? false
  }),
  /**
   * Converts wall-clock time into an engine target. Fractional seconds stay in
   * the controller so frequent animation frames do not lose time to rounding.
   */
  advance: (state, elapsedRealMs, matchEndSecond = 90 * 60) => {
    if (state.paused || elapsedRealMs <= 0) return { ...state };
    const exactSecond = clamp(
      state.exactSecond + elapsedRealMs / 1e3 * (MATCH_SECONDS_PER_MATCH_MINUTE / state.speed),
      0,
      matchEndSecond
    );
    return {
      ...state,
      exactSecond,
      targetSecond: Math.floor(exactSecond),
      paused: exactSecond >= matchEndSecond ? true : state.paused
    };
  },
  setPaused: (state, paused) => ({
    ...state,
    paused
  }),
  setSpeed: (state, speed) => ({
    ...state,
    speed
  }),
  setSceneSpeed: (state, sceneSpeed) => ({
    ...state,
    sceneSpeed
  }),
  setRenderMode: (state, renderMode) => ({
    ...state,
    renderMode
  }),
  setTransmissionMode: (state, transmissionMode) => ({
    ...state,
    transmissionMode
  }),
  setGoalReplays: (state, goalReplays) => ({
    ...state,
    goalReplays
  }),
  /**
   * Both modes filter presentation only. The authoritative engine still
   * calculates the complete match, including score, fatigue, cards, injuries
   * and statistics. A pre-authored cue is returned untouched for isolated SVG
   * controller tests and for an optional replay of an already built highlight.
   */
  selectVisibleCues: (state, cues) => {
    if (state.transmissionMode === "COMMENTARY_ONLY") return [];
    if (state.transmissionMode === "FULL_MATCH") return [...cues];
    const authored = cues.filter((cue) => cue.scriptedHighlight);
    if (authored.length > 0) {
      return state.transmissionMode === "KEY_MOMENTS" ? authored.filter((cue) => cue.kind === "GOAL" || MatchEngineV2HighlightScriptService.isKeyMomentCue(cue)) : authored;
    }
    return MatchEngineV2HighlightScriptService.selectTerminalCues(state.transmissionMode, cues);
  }
};

// services/match/live/LiveMatchRandom.ts
var getLegacyMinuteSeededValue = (seed, minute, offset = 0) => {
  const x = Math.sin(seed + minute + offset) * 1e4;
  return x - Math.floor(x);
};

// services/UserCoachInstructionService.ts
var clamp5 = (value, min, max) => Math.min(max, Math.max(min, value));
var USER_COACH_INSTRUCTION_OPTIONS = [
  { id: null, label: "BRAK POLECENIA" },
  { id: "NARROW", label: "ZAW\u0118\u0179CIE POLE" },
  { id: "WIDE", label: "GRAJCIE SZEROKO" },
  { id: "CALM_DOWN", label: "USPOK\xD3JCIE GR\u0118" },
  { id: "SPEED_UP", label: "PRZYSPIESZCIE GR\u0118" },
  { id: "KEEP_BALL", label: "SZANUJCIE PI\u0141K\u0118" },
  { id: "TAKE_RISKS", label: "WI\u0118CEJ RYZYKA" },
  { id: "CLOSE_DOWN", label: "DOSKOCZCIE DO NICH" },
  { id: "DROP_BACK", label: "COFNIJCIE SI\u0118" },
  { id: "ALL_FORWARD", label: "WSZYSCY DO PRZODU" },
  { id: "TIME_WASTE", label: "GRAJCIE NA CZAS" }
];
var getUserCoachInstructionLabel = (id) => USER_COACH_INSTRUCTION_OPTIONS.find((option) => option.id === (id ?? null))?.label ?? "BRAK POLECENIA";
var COMPATIBILITY_MATRIX = {
  NARROW: {
    mindset: { DEFENSIVE: 1, NEUTRAL: 1, OFFENSIVE: -1 },
    tempo: { SLOW: 1, NORMAL: 0, FAST: -1 },
    intensity: { CAUTIOUS: 1, NORMAL: 0, AGGRESSIVE: 0 },
    passing: { SHORT: 1, MIXED: 0, LONG: -1 },
    pressing: { NORMAL: 0, PRESSING: 1 },
    counterAttack: { NORMAL: 0, COUNTER: 1 },
    marking: { NONE: 0, ZONE: 2, MAN: -1 },
    weights: { marking: 1.6, mindset: 1.2 }
  },
  WIDE: {
    mindset: { DEFENSIVE: 0, NEUTRAL: 1, OFFENSIVE: 1 },
    tempo: { SLOW: 0, NORMAL: 1, FAST: 1 },
    intensity: { CAUTIOUS: 0, NORMAL: 1, AGGRESSIVE: 1 },
    passing: { SHORT: 0, MIXED: 1, LONG: 1 },
    pressing: { NORMAL: 0, PRESSING: 0 },
    counterAttack: { NORMAL: 0, COUNTER: 1 },
    marking: { NONE: 0, ZONE: 0, MAN: 0 },
    weights: { passing: 1.4, mindset: 1.2 }
  },
  CALM_DOWN: {
    mindset: { DEFENSIVE: 1, NEUTRAL: 2, OFFENSIVE: -1 },
    tempo: { SLOW: 2, NORMAL: 1, FAST: -2 },
    intensity: { CAUTIOUS: 2, NORMAL: 1, AGGRESSIVE: -2 },
    passing: { SHORT: 2, MIXED: 1, LONG: -1 },
    pressing: { NORMAL: 1, PRESSING: -2 },
    counterAttack: { NORMAL: 1, COUNTER: -1 },
    marking: { NONE: 0, ZONE: 1, MAN: -1 },
    weights: { tempo: 2, intensity: 1.6, passing: 1.3 }
  },
  SPEED_UP: {
    mindset: { DEFENSIVE: -1, NEUTRAL: 1, OFFENSIVE: 2 },
    tempo: { SLOW: -2, NORMAL: 1, FAST: 2 },
    intensity: { CAUTIOUS: -1, NORMAL: 1, AGGRESSIVE: 1 },
    passing: { SHORT: 0, MIXED: 1, LONG: 1 },
    pressing: { NORMAL: 0, PRESSING: 1 },
    counterAttack: { NORMAL: 0, COUNTER: 1 },
    marking: { NONE: 0, ZONE: 0, MAN: 0 },
    weights: { tempo: 2, mindset: 1.4 }
  },
  KEEP_BALL: {
    mindset: { DEFENSIVE: 1, NEUTRAL: 2, OFFENSIVE: 0 },
    tempo: { SLOW: 1, NORMAL: 1, FAST: -2 },
    intensity: { CAUTIOUS: 1, NORMAL: 1, AGGRESSIVE: -1 },
    passing: { SHORT: 2, MIXED: 1, LONG: -2 },
    pressing: { NORMAL: 0, PRESSING: 0 },
    counterAttack: { NORMAL: 1, COUNTER: -2 },
    marking: { NONE: 0, ZONE: 0, MAN: 0 },
    weights: { passing: 2, tempo: 1.5, counterAttack: 1.4 }
  },
  TAKE_RISKS: {
    mindset: { DEFENSIVE: -2, NEUTRAL: 1, OFFENSIVE: 2 },
    tempo: { SLOW: -1, NORMAL: 1, FAST: 1 },
    intensity: { CAUTIOUS: -2, NORMAL: 1, AGGRESSIVE: 2 },
    passing: { SHORT: 0, MIXED: 1, LONG: 1 },
    pressing: { NORMAL: 0, PRESSING: 1 },
    counterAttack: { NORMAL: 0, COUNTER: 1 },
    marking: { NONE: 0, ZONE: 0, MAN: 0 },
    weights: { mindset: 1.8, intensity: 1.5 }
  },
  CLOSE_DOWN: {
    mindset: { DEFENSIVE: -1, NEUTRAL: 1, OFFENSIVE: 1 },
    tempo: { SLOW: -1, NORMAL: 0, FAST: 1 },
    intensity: { CAUTIOUS: -2, NORMAL: 0, AGGRESSIVE: 2 },
    passing: { SHORT: 0, MIXED: 0, LONG: 0 },
    pressing: { NORMAL: -2, PRESSING: 2 },
    counterAttack: { NORMAL: 0, COUNTER: -2 },
    marking: { NONE: 0, ZONE: 0, MAN: 1 },
    weights: { pressing: 2, intensity: 1.6, counterAttack: 1.5 }
  },
  DROP_BACK: {
    mindset: { DEFENSIVE: 2, NEUTRAL: 1, OFFENSIVE: -2 },
    tempo: { SLOW: 1, NORMAL: 0, FAST: -1 },
    intensity: { CAUTIOUS: 1, NORMAL: 0, AGGRESSIVE: -2 },
    passing: { SHORT: -1, MIXED: 0, LONG: 1 },
    pressing: { NORMAL: 1, PRESSING: -2 },
    counterAttack: { NORMAL: 0, COUNTER: 2 },
    marking: { NONE: 0, ZONE: 2, MAN: -2 },
    weights: { mindset: 2, pressing: 1.6, counterAttack: 1.5, marking: 1.4 }
  },
  ALL_FORWARD: {
    mindset: { DEFENSIVE: -2, NEUTRAL: -1, OFFENSIVE: 2 },
    tempo: { SLOW: -2, NORMAL: 1, FAST: 2 },
    intensity: { CAUTIOUS: -2, NORMAL: 1, AGGRESSIVE: 2 },
    passing: { SHORT: -1, MIXED: 1, LONG: 1 },
    pressing: { NORMAL: -1, PRESSING: 1 },
    counterAttack: { NORMAL: 1, COUNTER: -2 },
    marking: { NONE: 0, ZONE: -1, MAN: -1 },
    weights: { mindset: 2, tempo: 1.6, intensity: 1.4 }
  },
  TIME_WASTE: {
    mindset: { DEFENSIVE: 2, NEUTRAL: 1, OFFENSIVE: -2 },
    tempo: { SLOW: 2, NORMAL: -1, FAST: -2 },
    intensity: { CAUTIOUS: 2, NORMAL: 0, AGGRESSIVE: -2 },
    passing: { SHORT: 1, MIXED: 0, LONG: -1 },
    pressing: { NORMAL: 1, PRESSING: -2 },
    counterAttack: { NORMAL: 1, COUNTER: -1 },
    marking: { NONE: 0, ZONE: 1, MAN: -1 },
    weights: { tempo: 2, mindset: 1.7, intensity: 1.5, pressing: 1.5 }
  }
};
var BASE_EFFECTS = {
  NARROW: { initiativeModifier: -3e-3, userShotModifier: -1e-3, opponentShotModifier: -45e-4, turnoverRiskModifier: -5e-3, fatigueExtra: 3e-3, foulMultiplier: 1.01, injuryMultiplier: 1 },
  WIDE: { initiativeModifier: 9e-3, userShotModifier: 4e-3, opponentShotModifier: 2e-3, turnoverRiskModifier: 0.018, fatigueExtra: 5e-3, foulMultiplier: 1, injuryMultiplier: 1.01 },
  CALM_DOWN: { initiativeModifier: -0.012, userShotModifier: -3e-3, opponentShotModifier: -2e-3, turnoverRiskModifier: -0.055, fatigueExtra: -0.01, foulMultiplier: 0.94, injuryMultiplier: 0.96 },
  SPEED_UP: { initiativeModifier: 0.016, userShotModifier: 5e-3, opponentShotModifier: 3e-3, turnoverRiskModifier: 0.05, fatigueExtra: 0.018, foulMultiplier: 1.02, injuryMultiplier: 1.04 },
  KEEP_BALL: { initiativeModifier: 4e-3, userShotModifier: -2e-3, opponentShotModifier: -3e-3, turnoverRiskModifier: -0.07, fatigueExtra: -4e-3, foulMultiplier: 0.98, injuryMultiplier: 0.98 },
  TAKE_RISKS: { initiativeModifier: 0.018, userShotModifier: 7e-3, opponentShotModifier: 6e-3, turnoverRiskModifier: 0.075, fatigueExtra: 9e-3, foulMultiplier: 1.04, injuryMultiplier: 1.03 },
  CLOSE_DOWN: { initiativeModifier: 0.017, userShotModifier: 4e-3, opponentShotModifier: -3e-3, turnoverRiskModifier: 0.01, fatigueExtra: 0.027, foulMultiplier: 1.12, injuryMultiplier: 1.08 },
  DROP_BACK: { initiativeModifier: -0.026, userShotModifier: -5e-3, opponentShotModifier: -65e-4, turnoverRiskModifier: 5e-3, fatigueExtra: -6e-3, foulMultiplier: 0.96, injuryMultiplier: 0.98 },
  ALL_FORWARD: { initiativeModifier: 0.036, userShotModifier: 9e-3, opponentShotModifier: 0.015, turnoverRiskModifier: 0.085, fatigueExtra: 0.026, foulMultiplier: 1.06, injuryMultiplier: 1.09 },
  TIME_WASTE: { initiativeModifier: -0.027, userShotModifier: -6e-3, opponentShotModifier: -4e-3, turnoverRiskModifier: -0.035, fatigueExtra: -9e-3, foulMultiplier: 1.06, injuryMultiplier: 0.97 }
};
var getTacticWidth = (tactic) => {
  const advancedSlots = tactic.slots.filter((slot) => slot.role !== "GK" && slot.y <= 0.65);
  if (advancedSlots.length === 0) return 0.5;
  return advancedSlots.reduce((sum, slot) => sum + Math.abs(slot.x - 0.5) * 2, 0) / advancedSlots.length;
};
var getMatrixCompatibility = (id, instructions, tactic) => {
  const row = COMPATIBILITY_MATRIX[id];
  const values = [
    ["mindset", row.mindset[instructions.mindset]],
    ["tempo", row.tempo[instructions.tempo]],
    ["intensity", row.intensity[instructions.intensity]],
    ["passing", row.passing[instructions.passing]],
    ["pressing", row.pressing[instructions.pressing]],
    ["counterAttack", row.counterAttack[instructions.counterAttack ?? "NORMAL"]],
    ["marking", row.marking[instructions.marking ?? "NONE"]]
  ];
  let weightedScore2 = 0;
  let totalWeight = 0;
  values.forEach(([dimension, value]) => {
    const weight = row.weights?.[dimension] ?? 1;
    weightedScore2 += value * weight;
    totalWeight += weight;
  });
  let formationAdjustment = 0;
  if (["DROP_BACK", "TIME_WASTE", "NARROW"].includes(id) && tactic.attackBias >= 72) formationAdjustment -= 0.45;
  if (["ALL_FORWARD", "TAKE_RISKS", "SPEED_UP"].includes(id) && tactic.defenseBias >= 75) formationAdjustment -= 0.5;
  if (id === "CLOSE_DOWN" && tactic.pressingIntensity >= 70) formationAdjustment += 0.3;
  if (id === "CLOSE_DOWN" && tactic.pressingIntensity <= 35) formationAdjustment -= 0.35;
  if (id === "WIDE") formationAdjustment += getTacticWidth(tactic) >= 0.58 ? 0.3 : -0.3;
  if (id === "NARROW") formationAdjustment += getTacticWidth(tactic) <= 0.46 ? 0.25 : 0;
  return clamp5(weightedScore2 / Math.max(1, totalWeight) + formationAdjustment, -2, 2);
};
var getContextCompatibility = ({
  id,
  minute,
  scoreDiff,
  opponentTactic,
  opponentTempo,
  opponentPassing
}) => {
  let score = 0;
  const late = minute >= 70;
  const veryLate = minute >= 80;
  if (id === "ALL_FORWARD") {
    if (scoreDiff < 0 && late) score += veryLate ? 1.25 : 0.85;
    if (scoreDiff === 0) score -= veryLate ? 0.25 : 0.65;
    if (scoreDiff > 0) score -= late ? 1.5 : 1;
  }
  if (id === "TIME_WASTE") {
    if (scoreDiff > 0 && minute >= 65) score += veryLate ? 1.25 : 0.8;
    if (scoreDiff <= 0) score -= scoreDiff < 0 ? 1.5 : 0.65;
    if (minute < 55) score -= 0.45;
  }
  if (id === "DROP_BACK") {
    if (scoreDiff > 0 && minute >= 60) score += 0.75;
    if (scoreDiff < 0 && late) score -= 1.1;
  }
  if (id === "CALM_DOWN" || id === "KEEP_BALL") {
    if (scoreDiff > 0 && minute >= 55) score += 0.55;
    if (scoreDiff < 0 && veryLate) score -= 0.75;
  }
  if (id === "SPEED_UP" || id === "TAKE_RISKS") {
    if (scoreDiff < 0 && minute >= 55) score += 0.65;
    if (scoreDiff > 0 && late) score -= 0.7;
  }
  if (id === "WIDE") {
    if (opponentTactic.defenseBias >= 72) score += 0.45;
    if (getTacticWidth(opponentTactic) >= 0.62) score -= 0.25;
  }
  if (id === "NARROW") {
    if (getTacticWidth(opponentTactic) <= 0.46 || opponentPassing === "SHORT") score += 0.35;
    if (getTacticWidth(opponentTactic) >= 0.62 || opponentPassing === "LONG") score -= 0.45;
  }
  if (id === "CLOSE_DOWN") {
    if (opponentTempo === "SLOW" || opponentPassing === "SHORT") score += 0.35;
    if (opponentTempo === "FAST" && opponentPassing === "LONG") score -= 0.35;
  }
  return clamp5(score, -1.5, 1.25);
};
var getActivePlayers = (players, startingXI) => {
  const ids = new Set(startingXI.filter((id) => id !== null));
  return players.filter((player) => ids.has(player.id));
};
var getExecutionFactor = (id, players, startingXI, fatigueMap) => {
  const activePlayers4 = getActivePlayers(players, startingXI);
  if (activePlayers4.length === 0) return { factor: 0.82, averageFatigue: 55 };
  const attributeWeights = {
    NARROW: { positioning: 0.38, mentality: 0.32, workRate: 0.3 },
    WIDE: { pace: 0.3, workRate: 0.24, passing: 0.22, vision: 0.14, mentality: 0.1 },
    CALM_DOWN: { mentality: 0.32, passing: 0.26, technique: 0.24, vision: 0.18 },
    SPEED_UP: { technique: 0.28, mentality: 0.24, pace: 0.2, workRate: 0.16, stamina: 0.12 },
    KEEP_BALL: { passing: 0.32, technique: 0.28, vision: 0.24, mentality: 0.16 },
    TAKE_RISKS: { vision: 0.3, technique: 0.25, mentality: 0.25, passing: 0.2 },
    CLOSE_DOWN: { workRate: 0.3, stamina: 0.26, aggression: 0.18, pace: 0.16, mentality: 0.1 },
    DROP_BACK: { positioning: 0.38, defending: 0.28, mentality: 0.22, workRate: 0.12 },
    ALL_FORWARD: { attacking: 0.3, stamina: 0.24, workRate: 0.22, mentality: 0.14, pace: 0.1 },
    TIME_WASTE: { mentality: 0.36, passing: 0.26, technique: 0.22, vision: 0.16 }
  };
  const entries = Object.entries(attributeWeights[id]);
  const quality = activePlayers4.reduce((teamSum, player) => teamSum + entries.reduce((sum, [key, weight]) => sum + player.attributes[key] * weight, 0), 0) / activePlayers4.length;
  const averageFatigue = activePlayers4.reduce((sum, player) => sum + (fatigueMap[player.id] ?? 100), 0) / activePlayers4.length;
  let factor = clamp5(0.82 + (quality - 50) / 50 * 0.28, 0.74, 1.16);
  if (["SPEED_UP", "CLOSE_DOWN", "TAKE_RISKS", "ALL_FORWARD"].includes(id) && averageFatigue < 68) {
    factor *= clamp5(0.72 + averageFatigue / 240, 0.72, 1);
  }
  return { factor: clamp5(factor, 0.68, 1.16), averageFatigue };
};
var INACTIVE_EFFECTS = {
  active: false,
  alignment: 0,
  misunderstood: false,
  label: "BRAK POLECENIA",
  initiativeModifier: 0,
  userShotModifier: 0,
  opponentShotModifier: 0,
  turnoverRiskModifier: 0,
  fatigueExtra: 0,
  foulMultiplier: 1,
  injuryMultiplier: 1
};
var UserCoachInstructionService = {
  issue: ({
    id,
    minute,
    sessionSeed,
    previousActive,
    memory
  }) => {
    const issueCount = (memory?.issueCount ?? 0) + 1;
    const optionIndex = Math.max(0, USER_COACH_INSTRUCTION_OPTIONS.findIndex((option) => option.id === id));
    const streamOffset = 12100 + optionIndex * 41 + issueCount * 7;
    const responseFactor = Number((0.7 + getLegacyMinuteSeededValue(sessionSeed, minute, streamOffset) * 0.55).toFixed(3));
    const delay = getLegacyMinuteSeededValue(sessionSeed, minute, streamOffset + 1) < 0.25 ? 1 : 0;
    const duration = 5 + Math.floor(getLegacyMinuteSeededValue(sessionSeed, minute, streamOffset + 2) * 5);
    const recentRepeat = memory?.lastId === id && minute - memory.lastIssuedMinute <= 12;
    const repeatCount = recentRepeat ? Math.min(3, (memory?.repeatCount ?? 0) + 1) : 0;
    const rapidOppositeChange = Boolean(
      previousActive && previousActive.id !== id && minute - previousActive.issuedMinute < 3
    );
    const startsMinute = minute + 1 + delay;
    const active = {
      id,
      issuedMinute: minute,
      startsMinute,
      expiryMinute: startsMinute + duration - 1,
      responseFactor,
      misunderstandingRoll: getLegacyMinuteSeededValue(sessionSeed, minute, streamOffset + 3),
      repeatCount,
      confusionUntilMinute: rapidOppositeChange ? minute + 2 : -1
    };
    return {
      active,
      memory: { lastId: id, lastIssuedMinute: minute, repeatCount, issueCount }
    };
  },
  getEffects: ({
    active,
    minute,
    instructions,
    tactic,
    opponentTactic,
    players,
    startingXI,
    fatigueMap,
    scoreDiff,
    opponentTempo = "NORMAL",
    opponentPassing = "MIXED"
  }) => {
    if (!active || minute < active.startsMinute || minute > active.expiryMinute) return INACTIVE_EFFECTS;
    const matrixCompatibility = getMatrixCompatibility(active.id, instructions, tactic);
    const contextCompatibility = getContextCompatibility({
      id: active.id,
      minute,
      scoreDiff,
      opponentTactic,
      opponentTempo,
      opponentPassing
    });
    const alignment = clamp5(matrixCompatibility * 0.72 + contextCompatibility * 0.62, -2, 2);
    const { factor: executionFactor, averageFatigue } = getExecutionFactor(
      active.id,
      players,
      startingXI,
      fatigueMap
    );
    const misunderstandingChance = clamp5(0.08 - alignment * 0.1, 0.03, 0.34);
    const isConfused = minute <= active.confusionUntilMinute;
    const misunderstood = isConfused || active.misunderstandingRoll < misunderstandingChance;
    const repeatFactor = Math.max(0.55, 1 - active.repeatCount * 0.15);
    let strength = active.responseFactor * executionFactor * repeatFactor * (0.72 + Math.max(0, alignment) * 0.18 - Math.max(0, -alignment) * 0.2);
    if (misunderstood) strength *= 0.3;
    strength = clamp5(strength, 0.18, 1.45);
    const conflict = Math.max(0, -alignment) + (misunderstood ? 0.75 : 0) + (isConfused ? 0.35 : 0);
    const base = BASE_EFFECTS[active.id];
    const fatigueFailure = ["SPEED_UP", "CLOSE_DOWN", "TAKE_RISKS", "ALL_FORWARD"].includes(active.id) ? clamp5((65 - averageFatigue) / 35, 0, 1) : 0;
    return {
      active: true,
      alignment,
      misunderstood,
      label: getUserCoachInstructionLabel(active.id),
      initiativeModifier: clamp5(base.initiativeModifier * strength - conflict * 0.014, -0.055, 0.05),
      userShotModifier: clamp5(base.userShotModifier * strength - conflict * 25e-4, -0.014, 0.012),
      opponentShotModifier: clamp5(base.opponentShotModifier * strength + conflict * 4e-3 + fatigueFailure * 3e-3, -0.01, 0.022),
      turnoverRiskModifier: clamp5(base.turnoverRiskModifier * strength + conflict * 0.03 + fatigueFailure * 0.02, -0.1, 0.16),
      fatigueExtra: clamp5(base.fatigueExtra * strength + conflict * 6e-3 + fatigueFailure * 0.01, -0.014, 0.055),
      foulMultiplier: clamp5(1 + (base.foulMultiplier - 1) * strength + conflict * 0.04, 0.9, 1.35),
      injuryMultiplier: clamp5(1 + (base.injuryMultiplier - 1) * strength + conflict * 0.025 + fatigueFailure * 0.04, 0.92, 1.3)
    };
  },
  getMatrixCompatibility,
  getSelectionAlignment: ({
    id,
    instructions,
    tactic,
    opponentTactic,
    minute,
    scoreDiff,
    opponentTempo = "NORMAL",
    opponentPassing = "MIXED"
  }) => clamp5(
    getMatrixCompatibility(id, instructions, tactic) * 0.72 + getContextCompatibility({ id, minute, scoreDiff, opponentTactic, opponentTempo, opponentPassing }) * 0.62,
    -2,
    2
  )
};

// services/UserCoachShoutService.ts
var clamp6 = (value, min, max) => Math.min(max, Math.max(min, value));
var USER_COACH_SHOUT_OPTIONS = [
  { id: null, label: "BRAK POLECENIA" },
  { id: "MOTIVATE", label: "ZMOTYWUJ" },
  { id: "PRAISE", label: "POCHWAL" },
  { id: "FOCUS", label: "SKUPCIE SI\u0118" },
  { id: "NO_PANIC", label: "BEZ PANIKI" },
  { id: "MORE_EFFORT", label: "WI\u0118CEJ ZAANGA\u017BOWANIA" },
  { id: "CALM_EMOTIONS", label: "OPANUJCIE EMOCJE" },
  { id: "DO_BETTER", label: "STA\u0106 WAS NA WI\u0118CEJ" },
  { id: "DONT_GIVE_UP", label: "NIE ODPUSZCZAJCIE" }
];
var getUserCoachShoutLabel = (id) => USER_COACH_SHOUT_OPTIONS.find((option) => option.id === (id ?? null))?.label ?? "BRAK POLECENIA";
var CONTEXT_MATRIX = {
  MOTIVATE: { LOSING_POORLY: 2, LOSING_WELL: 1, EVEN_MATCH: 1, LEADING_NARROWLY: 0, LEADING_COMFORTABLY: -1, JUST_CONCEDED: 1, JUST_SCORED: 0 },
  PRAISE: { LOSING_POORLY: -2, LOSING_WELL: 1, EVEN_MATCH: 0, LEADING_NARROWLY: 1, LEADING_COMFORTABLY: 2, JUST_CONCEDED: -1, JUST_SCORED: 2 },
  FOCUS: { LOSING_POORLY: 1, LOSING_WELL: 0, EVEN_MATCH: 1, LEADING_NARROWLY: 2, LEADING_COMFORTABLY: 1, JUST_CONCEDED: 2, JUST_SCORED: 1 },
  NO_PANIC: { LOSING_POORLY: 1, LOSING_WELL: 2, EVEN_MATCH: 1, LEADING_NARROWLY: 2, LEADING_COMFORTABLY: 0, JUST_CONCEDED: 2, JUST_SCORED: 0 },
  MORE_EFFORT: { LOSING_POORLY: 2, LOSING_WELL: 0, EVEN_MATCH: 1, LEADING_NARROWLY: 0, LEADING_COMFORTABLY: -1, JUST_CONCEDED: 1, JUST_SCORED: -1 },
  CALM_EMOTIONS: { LOSING_POORLY: 0, LOSING_WELL: 0, EVEN_MATCH: 0, LEADING_NARROWLY: 1, LEADING_COMFORTABLY: 0, JUST_CONCEDED: 1, JUST_SCORED: 0 },
  DO_BETTER: { LOSING_POORLY: 2, LOSING_WELL: -1, EVEN_MATCH: 1, LEADING_NARROWLY: -1, LEADING_COMFORTABLY: -2, JUST_CONCEDED: 1, JUST_SCORED: -1 },
  DONT_GIVE_UP: { LOSING_POORLY: 2, LOSING_WELL: 2, EVEN_MATCH: 1, LEADING_NARROWLY: 1, LEADING_COMFORTABLY: -1, JUST_CONCEDED: 2, JUST_SCORED: 1 }
};
var MENTAL_MATRIX = {
  MOTIVATE: { FLAT: 2, NERVOUS: 1, FRUSTRATED: 1, FOCUSED: 0, CONFIDENT: 0, COMPLACENT: 1, EXHAUSTED: -1 },
  PRAISE: { FLAT: 1, NERVOUS: 1, FRUSTRATED: -1, FOCUSED: 1, CONFIDENT: 2, COMPLACENT: -2, EXHAUSTED: 0 },
  FOCUS: { FLAT: 1, NERVOUS: 1, FRUSTRATED: 1, FOCUSED: 0, CONFIDENT: 0, COMPLACENT: 2, EXHAUSTED: -1 },
  NO_PANIC: { FLAT: 0, NERVOUS: 2, FRUSTRATED: 1, FOCUSED: 0, CONFIDENT: -1, COMPLACENT: -1, EXHAUSTED: 1 },
  MORE_EFFORT: { FLAT: 2, NERVOUS: -1, FRUSTRATED: 1, FOCUSED: 1, CONFIDENT: 0, COMPLACENT: 2, EXHAUSTED: -2 },
  CALM_EMOTIONS: { FLAT: -1, NERVOUS: 2, FRUSTRATED: 2, FOCUSED: 0, CONFIDENT: -1, COMPLACENT: -1, EXHAUSTED: 0 },
  DO_BETTER: { FLAT: 2, NERVOUS: -2, FRUSTRATED: -1, FOCUSED: -1, CONFIDENT: 0, COMPLACENT: 2, EXHAUSTED: -2 },
  DONT_GIVE_UP: { FLAT: 2, NERVOUS: 1, FRUSTRATED: 2, FOCUSED: 1, CONFIDENT: 0, COMPLACENT: 1, EXHAUSTED: -1 }
};
var BASE_EFFECTS2 = {
  MOTIVATE: { initiativeModifier: 0.012, userShotModifier: 3e-3, opponentShotModifier: 1e-3, turnoverRiskModifier: -8e-3, fatigueExtra: 5e-3, foulMultiplier: 1.01, injuryMultiplier: 1.01 },
  PRAISE: { initiativeModifier: 8e-3, userShotModifier: 4e-3, opponentShotModifier: 1e-3, turnoverRiskModifier: -0.012, fatigueExtra: 1e-3, foulMultiplier: 0.98, injuryMultiplier: 1 },
  FOCUS: { initiativeModifier: 3e-3, userShotModifier: 2e-3, opponentShotModifier: -4e-3, turnoverRiskModifier: -0.035, fatigueExtra: 1e-3, foulMultiplier: 0.96, injuryMultiplier: 0.99 },
  NO_PANIC: { initiativeModifier: -2e-3, userShotModifier: 1e-3, opponentShotModifier: -3e-3, turnoverRiskModifier: -0.045, fatigueExtra: -4e-3, foulMultiplier: 0.94, injuryMultiplier: 0.97 },
  MORE_EFFORT: { initiativeModifier: 0.02, userShotModifier: 5e-3, opponentShotModifier: -2e-3, turnoverRiskModifier: 0.012, fatigueExtra: 0.018, foulMultiplier: 1.1, injuryMultiplier: 1.06 },
  CALM_EMOTIONS: { initiativeModifier: -5e-3, userShotModifier: 1e-3, opponentShotModifier: -2e-3, turnoverRiskModifier: -0.025, fatigueExtra: -4e-3, foulMultiplier: 0.88, injuryMultiplier: 0.98 },
  DO_BETTER: { initiativeModifier: 0.016, userShotModifier: 5e-3, opponentShotModifier: 3e-3, turnoverRiskModifier: 0.018, fatigueExtra: 0.01, foulMultiplier: 1.04, injuryMultiplier: 1.03 },
  DONT_GIVE_UP: { initiativeModifier: 0.021, userShotModifier: 6e-3, opponentShotModifier: 4e-3, turnoverRiskModifier: 0.02, fatigueExtra: 0.016, foulMultiplier: 1.06, injuryMultiplier: 1.05 }
};
var mix32 = (value) => {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ mixed >>> 16, 73244475);
  mixed = Math.imul(mixed ^ mixed >>> 16, 73244475);
  return (mixed ^ mixed >>> 16) >>> 0;
};
var hashString = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
var unitFrom = (value) => mix32(value) / 4294967296;
var nextStreamValue = (state) => {
  let next = state.streamState >>> 0;
  if (next === 0) next = 1831565813;
  next ^= next << 13;
  next ^= next >>> 17;
  next ^= next << 5;
  next >>>= 0;
  return {
    value: next / 4294967296,
    state: { ...state, streamState: next, drawCount: state.drawCount + 1 }
  };
};
var secureUint32 = () => {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] >>> 0;
  }
  return mix32((Date.now() ^ Math.floor(Math.random() * 4294967295)) >>> 0);
};
var getContextCategory = (situation) => {
  if (situation.recentlyConceded) return "JUST_CONCEDED";
  if (situation.recentlyScored) return "JUST_SCORED";
  if (situation.scoreDiff < 0) {
    const performance = situation.shotDiff * 0.3 + situation.shotsOnTargetDiff * 0.55 + situation.userMomentum / 35;
    return performance >= 0 ? "LOSING_WELL" : "LOSING_POORLY";
  }
  if (situation.scoreDiff === 0) return "EVEN_MATCH";
  return situation.scoreDiff === 1 ? "LEADING_NARROWLY" : "LEADING_COMFORTABLY";
};
var getMentalState = (situation) => {
  if (situation.averageFatigue < 64) return "EXHAUSTED";
  if (situation.scoreDiff >= 2 && situation.shotDiff >= 4 && situation.userMomentum >= 22) return "COMPLACENT";
  if (situation.recentlyScored || situation.userMomentum >= 32) return "CONFIDENT";
  if (situation.recentlyConceded || situation.scoreDiff <= 0 && situation.userMomentum <= -28) return "NERVOUS";
  if (situation.yellowCardCount >= 3 || situation.scoreDiff < 0 && situation.shotDiff >= 3) return "FRUSTRATED";
  if (situation.userMomentum <= -18 || situation.averageMorale < 38) return "FLAT";
  return "FOCUSED";
};
var getPersonalityAdjustment = (id, personality) => {
  const adjustments = {
    MOTIVATE: { AMBITIOUS: 0.25, CONFIDENT: 0.18, PROFESSIONAL: 0.12, NERVOUS: -0.12 },
    PRAISE: { CONFIDENT: 0.24, EGOIST: 0.22, SENSITIVE: 0.15, AMBITIOUS: -0.08 },
    FOCUS: { PROFESSIONAL: 0.24, CALM: 0.18, EGOIST: -0.16 },
    NO_PANIC: { NERVOUS: 0.25, SENSITIVE: 0.22, CALM: 0.14, EGOIST: -0.12 },
    MORE_EFFORT: { AMBITIOUS: 0.28, PROFESSIONAL: 0.24, NERVOUS: -0.24, SENSITIVE: -0.16 },
    CALM_EMOTIONS: { CALM: 0.24, PROFESSIONAL: 0.15, EGOIST: -0.18, AMBITIOUS: -0.1 },
    DO_BETTER: { AMBITIOUS: 0.3, PROFESSIONAL: 0.25, SENSITIVE: -0.35, NERVOUS: -0.38, EGOIST: -0.2 },
    DONT_GIVE_UP: { AMBITIOUS: 0.28, LOYAL: 0.22, PROFESSIONAL: 0.14, EGOIST: -0.08 }
  };
  return adjustments[id]?.[personality] ?? 0;
};
var getPlayerMatchDayBias = (entropySeed, playerId) => {
  const roll = unitFrom(entropySeed ^ hashString(playerId) ^ 2654435769);
  if (roll < 0.08) return -0.72 - unitFrom(hashString(playerId) ^ entropySeed ^ 2738958700) * 0.3;
  if (roll > 0.94) return 0.55 + unitFrom(hashString(playerId) ^ entropySeed ^ 3355524772) * 0.25;
  return (roll - 0.51) * 0.62;
};
var INACTIVE_EFFECTS2 = {
  active: false,
  alignment: 0,
  averageResponse: 0,
  positiveShare: 0,
  negativeShare: 0,
  unexpectedShare: 0,
  label: "BRAK POLECENIA",
  initiativeModifier: 0,
  userShotModifier: 0,
  opponentShotModifier: 0,
  turnoverRiskModifier: 0,
  fatigueExtra: 0,
  foulMultiplier: 1,
  injuryMultiplier: 1
};
var UserCoachShoutService = {
  createRngState: (fixedEntropySeed) => {
    const entropySeed = (fixedEntropySeed ?? secureUint32()) >>> 0 || 2654435769;
    const streamSalt = fixedEntropySeed === void 0 ? secureUint32() : 608135816;
    const streamState = mix32(entropySeed ^ streamSalt) || 1831565813;
    return { entropySeed, streamState, drawCount: 0 };
  },
  issue: ({
    id,
    minute,
    rngState,
    situation,
    previousActive,
    memory
  }) => {
    let stream = rngState;
    const delayRoll = nextStreamValue(stream);
    stream = delayRoll.state;
    const durationRoll = nextStreamValue(stream);
    stream = durationRoll.state;
    const responseRoll = nextStreamValue(stream);
    stream = responseRoll.state;
    const unexpectedRoll = nextStreamValue(stream);
    stream = unexpectedRoll.state;
    const contextCategory = getContextCategory(situation);
    const mentalState = getMentalState(situation);
    const recentRepeat = memory?.lastId === id && minute - memory.lastIssuedMinute <= 12;
    const repeatCount = recentRepeat ? Math.min(3, (memory?.repeatCount ?? 0) + 1) : 0;
    const rapidChange = Boolean(previousActive && previousActive.id !== id && minute - previousActive.issuedMinute < 3);
    const startsMinute = minute + 1 + (delayRoll.value < 0.22 ? 1 : 0);
    const duration = 5 + Math.floor(durationRoll.value * 4);
    const issueCount = (memory?.issueCount ?? 0) + 1;
    return {
      active: {
        id,
        issuedMinute: minute,
        startsMinute,
        expiryMinute: startsMinute + duration - 1,
        responseSeed: Math.floor(responseRoll.value * 4294967295) >>> 0,
        unexpectedSeed: Math.floor(unexpectedRoll.value * 4294967295) >>> 0,
        repeatCount,
        confusionUntilMinute: rapidChange ? minute + 2 : -1,
        contextCategory,
        mentalState,
        contextFit: CONTEXT_MATRIX[id][contextCategory],
        mentalFit: MENTAL_MATRIX[id][mentalState]
      },
      memory: { lastId: id, lastIssuedMinute: minute, repeatCount, issueCount },
      rngState: stream
    };
  },
  getEffects: ({
    active,
    minute,
    rngState,
    players,
    startingXI,
    fatigueMap,
    yellowCards,
    actionContributions = {}
  }) => {
    if (!active || !rngState || minute < active.startsMinute || minute > active.expiryMinute) return INACTIVE_EFFECTS2;
    const ids = new Set(startingXI.filter((id) => id !== null));
    const activePlayers4 = players.filter((player) => ids.has(player.id));
    if (activePlayers4.length === 0) return INACTIVE_EFFECTS2;
    const alignment = clamp6(active.contextFit * 0.55 + active.mentalFit * 0.45, -2, 2);
    let positive = 0;
    let negative = 0;
    let unexpected = 0;
    let responseSum = 0;
    activePlayers4.forEach((player) => {
      const personality = player.moralePersonality ?? "CALM";
      const morale = player.morale ?? 50;
      const fatigue2 = fatigueMap[player.id] ?? 100;
      const mentality = player.attributes.mentality ?? 50;
      const contribution = actionContributions[player.id] ?? 0;
      const playerHash = hashString(player.id);
      const dayBias = getPlayerMatchDayBias(rngState.entropySeed, player.id);
      const responseNoise = (unitFrom(active.responseSeed ^ playerHash) + unitFrom(active.responseSeed ^ playerHash ^ 2246822507) - 1) * 0.72;
      const mentalityStability = (mentality - 50) / 180;
      const moraleAdjustment = morale < 35 ? -0.24 : morale > 75 ? 0.12 : 0;
      const fatigueAdjustment = fatigue2 < 62 ? -0.32 : fatigue2 < 75 ? -0.12 : 0;
      const cardAdjustment = (yellowCards[player.id] ?? 0) > 0 && ["MORE_EFFORT", "DONT_GIVE_UP"].includes(active.id) ? -0.15 : 0;
      const performanceAdjustment = clamp6(contribution * 0.08, -0.12, 0.18);
      const repeatAdjustment = active.repeatCount * -0.22;
      const confusionAdjustment = minute <= active.confusionUntilMinute ? -0.55 : 0;
      let responseScore = alignment + getPersonalityAdjustment(active.id, personality) + dayBias + responseNoise + mentalityStability + moraleAdjustment + fatigueAdjustment + cardAdjustment + performanceAdjustment + repeatAdjustment + confusionAdjustment;
      const instability = clamp6((55 - mentality) / 260 + (45 - morale) / 300 + (70 - fatigue2) / 350, -0.02, 0.1);
      const unexpectedChance = clamp6(0.035 + instability + (active.mentalState === "NERVOUS" || active.mentalState === "FRUSTRATED" ? 0.025 : 0), 0.02, 0.15);
      const unexpectedRoll = unitFrom(active.unexpectedSeed ^ playerHash ^ 668265263);
      if (unexpectedRoll < unexpectedChance) {
        unexpected += 1;
        const inversionStrength = 0.7 + unitFrom(active.unexpectedSeed ^ playerHash ^ 374761393) * 0.85;
        responseScore = responseScore >= 0 ? -inversionStrength : inversionStrength;
      }
      let response = 0;
      if (responseScore >= 1.25) response = 1.15;
      else if (responseScore >= 0.35) response = 0.76;
      else if (responseScore > -0.35) response = 0.2;
      else if (responseScore > -1.15) response = -0.45;
      else response = -0.82;
      if (response > 0.25) positive += 1;
      if (response < 0) negative += 1;
      responseSum += response;
    });
    const count = activePlayers4.length;
    const averageResponse = clamp6(responseSum / count, -0.82, 1.15);
    const base = BASE_EFFECTS2[active.id];
    return {
      active: true,
      alignment,
      averageResponse,
      positiveShare: positive / count,
      negativeShare: negative / count,
      unexpectedShare: unexpected / count,
      label: getUserCoachShoutLabel(active.id),
      initiativeModifier: clamp6(base.initiativeModifier * averageResponse, -0.026, 0.026),
      userShotModifier: clamp6(base.userShotModifier * averageResponse, -8e-3, 8e-3),
      opponentShotModifier: clamp6(base.opponentShotModifier * averageResponse, -8e-3, 9e-3),
      turnoverRiskModifier: clamp6(base.turnoverRiskModifier * averageResponse, -0.05, 0.05),
      fatigueExtra: clamp6(base.fatigueExtra * averageResponse, -9e-3, 0.022),
      foulMultiplier: clamp6(1 + (base.foulMultiplier - 1) * averageResponse, 0.88, 1.18),
      injuryMultiplier: clamp6(1 + (base.injuryMultiplier - 1) * averageResponse, 0.94, 1.12)
    };
  },
  getContextCategory,
  getMentalState,
  getPlayerMatchDayBias,
  getSelectionFit: (id, situation) => {
    const contextCategory = getContextCategory(situation);
    const mentalState = getMentalState(situation);
    const contextFit = CONTEXT_MATRIX[id][contextCategory];
    const mentalFit = MENTAL_MATRIX[id][mentalState];
    return {
      contextCategory,
      mentalState,
      contextFit,
      mentalFit,
      alignment: clamp6(contextFit * 0.55 + mentalFit * 0.45, -2, 2)
    };
  }
};

// services/AiCoachCommandService.ts
var clamp7 = (value, min, max) => Math.min(max, Math.max(min, value));
var INSTRUCTION_IDS = [
  "NARROW",
  "WIDE",
  "CALM_DOWN",
  "SPEED_UP",
  "KEEP_BALL",
  "TAKE_RISKS",
  "CLOSE_DOWN",
  "DROP_BACK",
  "ALL_FORWARD",
  "TIME_WASTE"
];
var SHOUT_IDS = [
  "MOTIVATE",
  "PRAISE",
  "FOCUS",
  "NO_PANIC",
  "MORE_EFFORT",
  "CALM_EMOTIONS",
  "DO_BETTER",
  "DONT_GIVE_UP"
];
var MAX_SHOUT_SILENCE_MINUTES = 14;
var createRandomCursor = (initialState) => {
  let state = initialState;
  return {
    get state() {
      return state;
    },
    next: () => {
      let next = state.streamState >>> 0;
      if (next === 0) next = 1831565813;
      next ^= next << 13;
      next ^= next >>> 17;
      next ^= next << 5;
      next >>>= 0;
      state = { ...state, streamState: next, drawCount: state.drawCount + 1 };
      return next / 4294967296;
    }
  };
};
var getCoachQuality = (attributes) => clamp7(
  attributes.decisionMaking * 0.45 + attributes.experience * 0.35 + attributes.motivation * 0.2,
  0,
  100
);
var isLogicalInstruction = ({
  id,
  alignment,
  minute,
  scoreDiff,
  averageFatigue
}) => {
  if (alignment < 0.1) return false;
  if (id === "ALL_FORWARD") return minute >= 65 && scoreDiff < 0 && averageFatigue >= 58;
  if (id === "TIME_WASTE") return minute >= 65 && scoreDiff > 0;
  if (id === "DROP_BACK" && scoreDiff < 0 && minute >= 65) return false;
  if ((id === "SPEED_UP" || id === "TAKE_RISKS") && scoreDiff > 0 && minute >= 70) return false;
  if ((id === "CALM_DOWN" || id === "KEEP_BALL") && scoreDiff < 0 && minute >= 80) return false;
  if (id === "CLOSE_DOWN" && averageFatigue < 58) return false;
  return true;
};
var isLogicalShout = ({
  id,
  alignment,
  situation
}) => {
  if (alignment < 0.15) return false;
  const fit = UserCoachShoutService.getSelectionFit(id, situation);
  if (id === "PRAISE" && (fit.contextCategory === "LOSING_POORLY" || fit.contextCategory === "JUST_CONCEDED")) return false;
  if (id === "DO_BETTER" && situation.scoreDiff > 0 && fit.mentalState !== "COMPLACENT") return false;
  if (id === "DONT_GIVE_UP" && situation.scoreDiff > 0 && !situation.recentlyConceded) return false;
  if (id === "MORE_EFFORT" && fit.mentalState === "EXHAUSTED") return false;
  if (id === "CALM_EMOTIONS" && !["NERVOUS", "FRUSTRATED"].includes(fit.mentalState) && situation.yellowCardCount < 2) return false;
  if (id === "NO_PANIC" && !["NERVOUS", "EXHAUSTED"].includes(fit.mentalState) && fit.contextCategory !== "LEADING_NARROWLY") return false;
  return true;
};
var AiCoachCommandService = {
  createRngState: (fixedEntropySeed) => UserCoachShoutService.createRngState(fixedEntropySeed),
  decide: ({
    minute,
    coachAttributes,
    rngState,
    aiInstructions,
    aiTactic,
    userTactic,
    aiScoreDiff,
    userTempo,
    userPassing,
    situation,
    previousInstruction,
    instructionMemory,
    previousShout,
    shoutMemory
  }) => {
    const rng = createRandomCursor(rngState);
    const quality = getCoachQuality(coachAttributes);
    const selectionNoise = 0.58 - quality * 45e-4;
    const aiAverageFatigue = situation.averageFatigue;
    const instructionCandidates = INSTRUCTION_IDS.map((id) => ({
      id,
      alignment: UserCoachInstructionService.getSelectionAlignment({
        id,
        instructions: aiInstructions,
        tactic: aiTactic,
        opponentTactic: userTactic,
        minute,
        scoreDiff: aiScoreDiff,
        opponentTempo: userTempo,
        opponentPassing: userPassing
      })
    })).filter((candidate) => isLogicalInstruction({
      id: candidate.id,
      alignment: candidate.alignment,
      minute,
      scoreDiff: aiScoreDiff,
      averageFatigue: aiAverageFatigue
    })).map((candidate) => ({ ...candidate, rankedScore: candidate.alignment + (rng.next() - 0.5) * selectionNoise * 2 })).sort((left, right) => right.rankedScore - left.rankedScore);
    const instructionChoice = instructionCandidates[0] ?? null;
    const instructionIssueChance = clamp7(0.58 + quality / 300 + Math.max(0, Math.abs(aiScoreDiff)) * 0.04, 0.58, 0.94);
    let instruction = null;
    let nextInstructionMemory = instructionMemory ?? {
      lastId: null,
      lastIssuedMinute: -99,
      repeatCount: 0,
      issueCount: 0
    };
    if (instructionChoice && rng.next() < instructionIssueChance) {
      const id = instructionChoice.id;
      const issueCount = nextInstructionMemory.issueCount + 1;
      const recentRepeat = nextInstructionMemory.lastId === id && minute - nextInstructionMemory.lastIssuedMinute <= 12;
      const repeatCount = recentRepeat ? Math.min(3, nextInstructionMemory.repeatCount + 1) : 0;
      const rapidChange = Boolean(previousInstruction && previousInstruction.id !== id && minute - previousInstruction.issuedMinute < 3);
      const delayChance = clamp7(0.44 - quality * 31e-4, 0.12, 0.44);
      const startsMinute = minute + 1 + (rng.next() < delayChance ? 1 : 0);
      const duration = 5 + Math.floor(rng.next() * 5);
      const coachEffectiveness = clamp7(0.66 + quality * 42e-4 + (rng.next() - 0.5) * 0.18, 0.58, 1.14);
      const advantageMultiplier = 1.01 + rng.next() * 0.09;
      instruction = {
        id,
        issuedMinute: minute,
        startsMinute,
        expiryMinute: startsMinute + duration - 1,
        responseFactor: coachEffectiveness,
        misunderstandingRoll: rng.next(),
        repeatCount,
        confusionUntilMinute: rapidChange ? minute + 2 : -1,
        coachEffectiveness,
        advantageMultiplier
      };
      nextInstructionMemory = { lastId: id, lastIssuedMinute: minute, repeatCount, issueCount };
    }
    const shoutCandidates = SHOUT_IDS.map((id) => ({ id, ...UserCoachShoutService.getSelectionFit(id, situation) })).filter((candidate) => isLogicalShout({ id: candidate.id, alignment: candidate.alignment, situation })).map((candidate) => ({ ...candidate, rankedScore: candidate.alignment + (rng.next() - 0.5) * selectionNoise * 2 })).sort((left, right) => right.rankedScore - left.rankedScore);
    const shoutChoice = shoutCandidates[0] ?? null;
    const emotionalUrgency = situation.recentlyConceded || aiScoreDiff < 0 || Math.abs(situation.userMomentum) >= 28;
    const shoutIssueChance = clamp7(0.42 + quality / 350 + (emotionalUrgency ? 0.18 : 0), 0.42, 0.88);
    let shout = null;
    let shoutAnnouncement = null;
    let nextShoutMemory = shoutMemory ?? {
      lastId: null,
      lastIssuedMinute: -99,
      repeatCount: 0,
      issueCount: 0
    };
    const shoutSilenceMinutes = minute - nextShoutMemory.lastIssuedMinute;
    const mustBreakShoutSilence = shoutSilenceMinutes >= MAX_SHOUT_SILENCE_MINUTES;
    if (shoutChoice && (mustBreakShoutSilence || rng.next() < shoutIssueChance)) {
      const id = shoutChoice.id;
      const issueCount = nextShoutMemory.issueCount + 1;
      const recentRepeat = nextShoutMemory.lastId === id && minute - nextShoutMemory.lastIssuedMinute <= 12;
      const repeatCount = recentRepeat ? Math.min(3, nextShoutMemory.repeatCount + 1) : 0;
      const rapidChange = Boolean(previousShout && previousShout.id !== id && minute - previousShout.issuedMinute < 3);
      const delayChance = clamp7(0.4 - quality * 28e-4, 0.1, 0.4);
      const startsMinute = minute + 1 + (rng.next() < delayChance ? 1 : 0);
      const duration = 5 + Math.floor(rng.next() * 4);
      const coachEffectiveness = clamp7(0.68 + quality * 38e-4 + (rng.next() - 0.5) * 0.16, 0.6, 1.12);
      const advantageMultiplier = 1.01 + rng.next() * 0.09;
      shout = {
        id,
        issuedMinute: minute,
        startsMinute,
        expiryMinute: startsMinute + duration - 1,
        responseSeed: Math.floor(rng.next() * 4294967295) >>> 0,
        unexpectedSeed: Math.floor(rng.next() * 4294967295) >>> 0,
        repeatCount,
        confusionUntilMinute: rapidChange ? minute + 2 : -1,
        contextCategory: shoutChoice.contextCategory,
        mentalState: shoutChoice.mentalState,
        contextFit: shoutChoice.contextFit,
        mentalFit: shoutChoice.mentalFit,
        coachEffectiveness,
        advantageMultiplier
      };
      nextShoutMemory = { lastId: id, lastIssuedMinute: minute, repeatCount, issueCount };
      shoutAnnouncement = {
        id: `ai-shout-${minute}-${rng.state.drawCount}`,
        text: getUserCoachShoutLabel(id)
      };
    }
    const urgent = aiScoreDiff < 0 && minute >= 65;
    const baseDelay = urgent ? 5 : Math.round(11 - quality * 0.035);
    const delayWindow = urgent ? 4 : 6;
    const routineNextDecisionMinute = minute + Math.max(4, baseDelay + Math.floor(rng.next() * delayWindow));
    const nextShoutDeadline = nextShoutMemory.lastIssuedMinute >= 0 ? nextShoutMemory.lastIssuedMinute + MAX_SHOUT_SILENCE_MINUTES : minute + 4;
    const nextDecisionMinute = Math.min(
      routineNextDecisionMinute,
      Math.max(minute + 4, nextShoutDeadline)
    );
    return {
      instruction,
      instructionMemory: nextInstructionMemory,
      shout,
      shoutMemory: nextShoutMemory,
      shoutAnnouncement,
      rngState: rng.state,
      nextDecisionMinute
    };
  },
  getCoachQuality,
  isLogicalInstruction,
  isLogicalShout
};

// services/match/engines/v2/MatchEngineV2CoachService.ts
var emptyMemory = () => ({
  lastId: null,
  lastIssuedMinute: -99,
  repeatCount: 0,
  issueCount: 0
});
var DEFAULT_COACH_ATTRIBUTES = {
  experience: 50,
  decisionMaking: 50,
  motivation: 50,
  training: 50
};
var footballMinute = (live) => Math.max(0, CupMatchClockService.eventMinute(live.state, live.config) - 1);
var teamFor = (live, side) => side === "HOME" ? live.input.home : live.input.away;
var scoreFor = (live, side) => side === "HOME" ? live.state.homeScore - live.state.awayScore : live.state.awayScore - live.state.homeScore;
var isGoal = (type) => type === "GOAL" /* GOAL */ || type === "ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */ || type === "PENALTY_SCORED" /* PENALTY_SCORED */;
var DECISION_REASON_LABELS = {
  SCHEDULED: "Planowa analiza przebiegu meczu",
  RED_CARD: "Reakcja po czerwonej kartce",
  INJURY: "Reakcja na uraz zawodnika",
  FORCED_SUBSTITUTION: "Korekta po wymuszonej zmianie",
  OPPONENT_DOMINANCE: "Reakcja na dominacj\u0119 przeciwnika"
};
var commandPresentation = (command, minute, label) => {
  if (!command || minute > command.expiryMinute) return null;
  return {
    id: command.id,
    label,
    status: minute < command.startsMinute ? "PENDING" : "ACTIVE",
    issuedMinute: command.issuedMinute,
    startsMinute: command.startsMinute,
    expiryMinute: command.expiryMinute,
    remainingMinutes: Math.max(0, command.expiryMinute - Math.max(minute, command.startsMinute) + 1)
  };
};
var getReactiveDecisionReason = (live, state, side, minute) => {
  const newEvents = live.state.events.slice(state.lastReviewedEventIndex);
  state.lastReviewedEventIndex = live.state.events.length;
  if (minute - state.lastReactiveDecisionMinute >= 2) {
    if (newEvents.some((event) => event.side === side && event.type === "RED_CARD" /* RED_CARD */)) {
      return "RED_CARD";
    }
    if (newEvents.some(
      (event) => event.side === side && (event.type === "INJURY_LIGHT" /* INJURY_LIGHT */ || event.type === "INJURY_SEVERE" /* INJURY_SEVERE */)
    )) {
      return "INJURY";
    }
    if (newEvents.some(
      (event) => event.side === side && event.type === "SUBSTITUTION" /* SUBSTITUTION */ && event.detail?.reason === "INJURY"
    )) {
      return "FORCED_SUBSTITUTION";
    }
  }
  const situation = situationFor(live, side);
  const sustainedDominance = minute >= 20 && (situation.shotDiff <= -5 && situation.shotsOnTargetDiff <= -3 || situation.userMomentum <= -42);
  if (sustainedDominance && minute - state.lastDominanceReactionMinute >= 12) {
    state.lastDominanceReactionMinute = minute;
    return "OPPONENT_DOMINANCE";
  }
  return null;
};
var situationFor = (live, side) => {
  const team = teamFor(live, side);
  const opponentSide3 = side === "HOME" ? "AWAY" : "HOME";
  const ownStats = live.state.stats[side];
  const opponentStats = live.state.stats[opponentSide3];
  const minute = footballMinute(live);
  const activeIds2 = team.lineup.startingXI.filter((id) => Boolean(id) && !live.state.redCards[id]);
  const activePlayers4 = team.players.filter((player) => activeIds2.includes(player.id));
  const averageFatigue = activeIds2.length ? activeIds2.reduce((sum, id) => sum + (live.state.fatigue[id] ?? 100), 0) / activeIds2.length : 100;
  const averageMorale = activePlayers4.length ? activePlayers4.reduce((sum, player) => sum + (player.morale ?? team.morale), 0) / activePlayers4.length : team.morale;
  const recentGoals = live.state.events.filter(
    (event) => isGoal(event.type) && event.detail?.isShootout !== true && minute - event.minute >= 0 && minute - event.minute <= 3
  );
  return {
    scoreDiff: scoreFor(live, side),
    shotDiff: ownStats.shots - opponentStats.shots,
    shotsOnTargetDiff: ownStats.shotsOnTarget - opponentStats.shotsOnTarget,
    userMomentum: side === "HOME" ? live.state.momentum : -live.state.momentum,
    recentlyScored: recentGoals.some((event) => event.side === side),
    recentlyConceded: recentGoals.some((event) => event.side === opponentSide3),
    averageFatigue,
    averageMorale,
    yellowCardCount: activeIds2.reduce((sum, id) => sum + Math.min(1, live.state.yellowCards[id] ?? 0), 0)
  };
};
var MatchEngineV2CoachService = {
  createState: (seed, side, options = {}) => ({
    activeInstruction: null,
    instructionMemory: emptyMemory(),
    activeShout: null,
    shoutMemory: emptyMemory(),
    // The V2 prototype must remain reproducible. Coach reaction RNG therefore
    // has its own deterministic stream, isolated from all football-action RNG.
    shoutRng: UserCoachShoutService.createRngState(stableHash(`${seed}:${side}:coach-shout`)),
    aiControlled: options.aiControlled ?? false,
    coachAttributes: options.coachAttributes ?? { ...DEFAULT_COACH_ATTRIBUTES },
    nextAiDecisionMinute: 7,
    lastReviewedEventIndex: 0,
    lastReactiveDecisionMinute: -99,
    lastDominanceReactionMinute: -99,
    lastDecisionReason: null
  }),
  issueInstruction: (live, state, side, instructionId) => {
    const minute = footballMinute(live);
    if (minute < 1) return false;
    if (!instructionId) {
      state.activeInstruction = null;
      return true;
    }
    const issued = UserCoachInstructionService.issue({
      id: instructionId,
      minute,
      sessionSeed: stableHash(`${live.input.seed}:${side}:instruction`),
      previousActive: state.activeInstruction,
      memory: state.instructionMemory
    });
    state.activeInstruction = issued.active;
    state.instructionMemory = issued.memory;
    return true;
  },
  issueShout: (live, state, side, shoutId) => {
    const minute = footballMinute(live);
    if (minute < 1) return false;
    if (!shoutId) {
      state.activeShout = null;
      return true;
    }
    const issued = UserCoachShoutService.issue({
      id: shoutId,
      minute,
      rngState: state.shoutRng,
      situation: situationFor(live, side),
      previousActive: state.activeShout,
      memory: state.shoutMemory
    });
    state.activeShout = issued.active;
    state.shoutMemory = issued.memory;
    state.shoutRng = issued.rngState;
    return true;
  },
  refreshEffects: (live, states) => {
    const minute = footballMinute(live);
    ["HOME", "AWAY"].forEach((side) => {
      const team = teamFor(live, side);
      const opponent = teamFor(live, side === "HOME" ? "AWAY" : "HOME");
      const state = states[side];
      if (state.activeInstruction && minute > state.activeInstruction.expiryMinute) state.activeInstruction = null;
      if (state.activeShout && minute > state.activeShout.expiryMinute) state.activeShout = null;
      const reactiveReason = state.aiControlled ? getReactiveDecisionReason(live, state, side, minute) : null;
      if (reactiveReason) state.nextAiDecisionMinute = Math.min(state.nextAiDecisionMinute, minute);
      if (state.aiControlled && minute >= state.nextAiDecisionMinute) {
        const decision = AiCoachCommandService.decide({
          minute,
          coachAttributes: state.coachAttributes,
          rngState: state.shoutRng,
          aiInstructions: team.instructions,
          aiTactic: team.tactic,
          userTactic: opponent.tactic,
          aiScoreDiff: scoreFor(live, side),
          userTempo: opponent.instructions.tempo,
          userPassing: opponent.instructions.passing,
          situation: situationFor(live, side),
          previousInstruction: state.activeInstruction,
          instructionMemory: state.instructionMemory,
          previousShout: state.activeShout,
          shoutMemory: state.shoutMemory
        });
        if (decision.instruction) state.activeInstruction = decision.instruction;
        if (decision.shout) state.activeShout = decision.shout;
        state.instructionMemory = decision.instructionMemory;
        state.shoutMemory = decision.shoutMemory;
        state.shoutRng = decision.rngState;
        state.nextAiDecisionMinute = decision.nextDecisionMinute;
        state.lastDecisionReason = reactiveReason ?? "SCHEDULED";
        if (reactiveReason) state.lastReactiveDecisionMinute = minute;
      }
      const instruction = UserCoachInstructionService.getEffects({
        active: state.activeInstruction,
        minute,
        instructions: team.instructions,
        tactic: team.tactic,
        opponentTactic: opponent.tactic,
        players: team.players,
        startingXI: team.lineup.startingXI,
        fatigueMap: live.state.fatigue,
        scoreDiff: scoreFor(live, side),
        opponentTempo: opponent.instructions.tempo,
        opponentPassing: opponent.instructions.passing
      });
      const shout = UserCoachShoutService.getEffects({
        active: state.activeShout,
        minute,
        rngState: state.shoutRng,
        players: team.players,
        startingXI: team.lineup.startingXI,
        fatigueMap: live.state.fatigue,
        yellowCards: live.state.yellowCards
      });
      const instructionScale = state.activeInstruction && "coachEffectiveness" in state.activeInstruction ? state.activeInstruction.coachEffectiveness * state.activeInstruction.advantageMultiplier : 1;
      const shoutScale = state.activeShout && "coachEffectiveness" in state.activeShout ? state.activeShout.coachEffectiveness * state.activeShout.advantageMultiplier : 1;
      const scaleNeutral = (value, scale) => 1 + (value - 1) * scale;
      live.state.coachEffects[side] = {
        initiativeModifier: instruction.initiativeModifier * instructionScale + shout.initiativeModifier * shoutScale,
        ownShotModifier: instruction.userShotModifier * instructionScale + shout.userShotModifier * shoutScale,
        opponentShotModifier: instruction.opponentShotModifier * instructionScale + shout.opponentShotModifier * shoutScale,
        turnoverRiskModifier: instruction.turnoverRiskModifier * instructionScale + shout.turnoverRiskModifier * shoutScale,
        fatigueExtra: instruction.fatigueExtra * instructionScale + shout.fatigueExtra * shoutScale,
        foulMultiplier: scaleNeutral(instruction.foulMultiplier, instructionScale) * scaleNeutral(shout.foulMultiplier, shoutScale),
        injuryMultiplier: scaleNeutral(instruction.injuryMultiplier, instructionScale) * scaleNeutral(shout.injuryMultiplier, shoutScale)
      };
    });
  },
  hasActiveCommand: (states) => Boolean(
    states.HOME.aiControlled || states.AWAY.aiControlled || states.HOME.activeInstruction || states.HOME.activeShout || states.AWAY.activeInstruction || states.AWAY.activeShout
  ),
  /**
   * Produces immutable Polish copy for the future coach ribbon. This method is
   * intentionally read-only: rendering a label can never consume RNG, issue a
   * command or alter the authoritative match state.
   */
  getPresentation: (live, state) => {
    const minute = footballMinute(live);
    const instruction = commandPresentation(
      state.activeInstruction,
      minute,
      getUserCoachInstructionLabel(state.activeInstruction?.id)
    );
    const shout = commandPresentation(
      state.activeShout,
      minute,
      getUserCoachShoutLabel(state.activeShout?.id)
    );
    const fragments = [];
    if (instruction) {
      fragments.push(instruction.status === "ACTIVE" ? `Polecenie aktywne: ${instruction.label}` : `Zesp\xF3\u0142 przygotowuje si\u0119 do polecenia: ${instruction.label}`);
    }
    if (shout) {
      fragments.push(shout.status === "ACTIVE" ? `Okrzyk aktywny: ${shout.label}` : `Zawodnicy reaguj\u0105 na okrzyk: ${shout.label}`);
    }
    const decisionReasonLabel = state.lastDecisionReason ? DECISION_REASON_LABELS[state.lastDecisionReason] : null;
    if (!fragments.length && decisionReasonLabel) fragments.push(decisionReasonLabel);
    return {
      instruction,
      shout,
      lastDecisionReason: state.lastDecisionReason,
      decisionReasonLabel,
      summary: fragments.join(" \u2022 ") || "Brak aktywnych polece\u0144"
    };
  }
};

// services/match/engines/v2/MatchEngineV2.ts
var activeIds = (team) => team.lineup.startingXI.filter((id) => Boolean(id));
var validateTeam = (team) => {
  const ids = activeIds(team);
  if (ids.length !== 11) throw new Error(`${team.name} must provide exactly 11 starters.`);
  if (new Set(ids).size !== ids.length) throw new Error(`${team.name} contains a duplicate starter.`);
  const squadIds = new Set(team.players.map((player) => player.id));
  const registeredIds = [...ids, ...team.lineup.bench];
  const missingId = registeredIds.find((id) => !squadIds.has(id));
  if (missingId) throw new Error(`${team.name} lineup references an unknown player: ${missingId}.`);
};
var toCupInput = (input2) => ({
  seed: input2.seed,
  home: input2.home,
  away: input2.away,
  environment: input2.environment,
  halfTimeTalks: input2.halfTimeTalks,
  calibration: input2.calibration,
  config: {
    tickSeconds: input2.config?.tickSeconds ?? 5,
    calibrationMode: input2.config?.calibrationMode ?? false,
    normalTimeSeconds: input2.rules.normalTimeSeconds,
    extraTimeSeconds: input2.rules.extraTimeSeconds,
    maxSubstitutions: input2.rules.maxSubstitutions,
    enableExtraTime: input2.rules.enableExtraTime,
    enablePenaltyShootout: input2.rules.enablePenaltyShootout
  }
});
var recordCommand = (runtime2, command, accepted, reason) => {
  const entry = {
    sequence: runtime2.commandLog.length + 1,
    command,
    accepted,
    reason
  };
  runtime2.commandLog.push(entry);
  return accepted;
};
var snapshot = (runtime2) => ({
  version: runtime2.version,
  second: runtime2.core.state.second,
  displayClock: CupMatchClockService.displayClock(runtime2.core.state, runtime2.core.config),
  phase: runtime2.core.state.phase,
  isFinished: runtime2.core.state.phase === "FINISHED",
  result: CupMatchEngineV2.snapshotLiveMatch(runtime2.core),
  commandLog: runtime2.commandLog.map((entry) => ({
    ...entry,
    command: entry.command.type === "UPDATE_INSTRUCTIONS" ? { ...entry.command, patch: { ...entry.command.patch } } : { ...entry.command }
  })),
  coachState: {
    HOME: {
      ...runtime2.coachState.HOME,
      instructionMemory: { ...runtime2.coachState.HOME.instructionMemory },
      shoutMemory: { ...runtime2.coachState.HOME.shoutMemory },
      shoutRng: { ...runtime2.coachState.HOME.shoutRng },
      activeInstruction: runtime2.coachState.HOME.activeInstruction ? { ...runtime2.coachState.HOME.activeInstruction } : null,
      activeShout: runtime2.coachState.HOME.activeShout ? { ...runtime2.coachState.HOME.activeShout } : null
    },
    AWAY: {
      ...runtime2.coachState.AWAY,
      instructionMemory: { ...runtime2.coachState.AWAY.instructionMemory },
      shoutMemory: { ...runtime2.coachState.AWAY.shoutMemory },
      shoutRng: { ...runtime2.coachState.AWAY.shoutRng },
      activeInstruction: runtime2.coachState.AWAY.activeInstruction ? { ...runtime2.coachState.AWAY.activeInstruction } : null,
      activeShout: runtime2.coachState.AWAY.activeShout ? { ...runtime2.coachState.AWAY.activeShout } : null
    }
  },
  coachPresentation: {
    HOME: MatchEngineV2CoachService.getPresentation(runtime2.core, runtime2.coachState.HOME),
    AWAY: MatchEngineV2CoachService.getPresentation(runtime2.core, runtime2.coachState.AWAY)
  },
  spatial: MatchEngineV2SpatialService.clone(runtime2.spatial)
});
var refreshSpatialDecisionContext = (runtime2) => {
  runtime2.core.input.spatialDecisionContext = MatchEngineV2SpatialDecisionService.createContext(runtime2.spatial);
};
var MatchEngineV2 = {
  /**
   * Creates a league/cup-neutral runtime without calculating future actions.
   * This is the boundary that the future Worker and SVG controller will use.
   */
  createMatch: (input2) => {
    validateMatchEngineV2Rules(input2.rules);
    validateTeam(input2.home);
    validateTeam(input2.away);
    const core = CupMatchEngineV2.createLiveMatch(toCupInput(input2));
    const spatial = MatchEngineV2SpatialService.create(core);
    core.input.spatialDecisionContext = MatchEngineV2SpatialDecisionService.createContext(spatial);
    return {
      version: "2.0-prototype",
      rules: { ...input2.rules },
      core,
      commandLog: [],
      coachState: {
        HOME: MatchEngineV2CoachService.createState(input2.seed, "HOME", {
          aiControlled: input2.coaching?.aiSides?.includes("HOME"),
          coachAttributes: input2.coaching?.coachAttributes?.HOME
        }),
        AWAY: MatchEngineV2CoachService.createState(input2.seed, "AWAY", {
          aiControlled: input2.coaching?.aiSides?.includes("AWAY"),
          coachAttributes: input2.coaching?.coachAttributes?.AWAY
        })
      },
      spatial
    };
  },
  /**
   * Advances monotonically. The clock is aligned to the simulation tick so UI
   * frame timing cannot introduce a different number of random decisions.
   */
  advanceTo: (runtime2, requestedSecond) => {
    const tick = runtime2.core.config.tickSeconds;
    const alignedSecond = Math.max(
      runtime2.core.state.second,
      Math.floor(Math.max(0, requestedSecond) / tick) * tick
    );
    while (runtime2.core.state.second < alignedSecond && runtime2.core.state.phase !== "FINISHED") {
      MatchEngineV2CoachService.refreshEffects(runtime2.core, runtime2.coachState);
      refreshSpatialDecisionContext(runtime2);
      CupMatchEngineV2.advanceLiveMatch(
        runtime2.core,
        Math.min(alignedSecond, runtime2.core.state.second + tick)
      );
      MatchEngineV2SpatialService.synchronize(runtime2.spatial, runtime2.core);
    }
    MatchEngineV2CoachService.refreshEffects(runtime2.core, runtime2.coachState);
    refreshSpatialDecisionContext(runtime2);
    return snapshot(runtime2);
  },
  /**
   * Applies a command only at the current authoritative clock. Future commands
   * will be queued by the controller later; accepting them here would silently
   * skip simulation time and make UI latency affect the match.
   */
  applyCommand: (runtime2, command) => {
    if (runtime2.core.state.phase === "FINISHED") {
      return recordCommand(runtime2, command, false, "MATCH_FINISHED");
    }
    if (command.atSecond !== runtime2.core.state.second) {
      return recordCommand(runtime2, command, false, "COMMAND_CLOCK_MISMATCH");
    }
    if (runtime2.coachState[command.side].aiControlled) {
      return recordCommand(runtime2, command, false, "SIDE_CONTROLLED_BY_AI");
    }
    if (command.type === "UPDATE_INSTRUCTIONS") {
      const team = command.side === "HOME" ? runtime2.core.input.home : runtime2.core.input.away;
      team.instructions = {
        ...team.instructions,
        ...command.patch,
        lastChangeMinute: Math.max(0, CupMatchClockService.eventMinute(runtime2.core.state, runtime2.core.config) - 1)
      };
      MatchEngineV2SpatialService.synchronize(runtime2.spatial, runtime2.core);
      return recordCommand(runtime2, command, true);
    }
    if (command.type === "TOUCHLINE_INSTRUCTION") {
      const applied2 = MatchEngineV2CoachService.issueInstruction(
        runtime2.core,
        runtime2.coachState[command.side],
        command.side,
        command.instructionId
      );
      MatchEngineV2CoachService.refreshEffects(runtime2.core, runtime2.coachState);
      return recordCommand(runtime2, command, applied2, applied2 ? void 0 : "COACH_COMMAND_TOO_EARLY");
    }
    if (command.type === "COACH_SHOUT") {
      const applied2 = MatchEngineV2CoachService.issueShout(
        runtime2.core,
        runtime2.coachState[command.side],
        command.side,
        command.shoutId
      );
      MatchEngineV2CoachService.refreshEffects(runtime2.core, runtime2.coachState);
      return recordCommand(runtime2, command, applied2, applied2 ? void 0 : "COACH_COMMAND_TOO_EARLY");
    }
    if (command.type === "SET_HALF_TIME_TALK") {
      if (runtime2.core.halfTimeTalkApplied || runtime2.core.state.second > 45 * 60) {
        return recordCommand(runtime2, command, false, "HALF_TIME_TALK_WINDOW_CLOSED");
      }
      runtime2.core.input.halfTimeTalks = {
        ...runtime2.core.input.halfTimeTalks,
        [command.side]: command.talk
      };
      return recordCommand(runtime2, command, true);
    }
    const applied = CupMatchEngineV2.applyManualSubstitution(
      runtime2.core,
      command.side,
      command.playerOutId,
      command.playerInId
    );
    if (applied) MatchEngineV2SpatialService.synchronize(runtime2.spatial, runtime2.core);
    return recordCommand(runtime2, command, applied, applied ? void 0 : "ILLEGAL_SUBSTITUTION");
  },
  snapshot,
  /** Finalization never advances time; it only exposes an already finished result. */
  finalize: (runtime2) => CupMatchEngineV2.finalizeLiveMatch(runtime2.core)
};

// tests/MatchEngineV2ActionTrajectoryTests.ts
var sample = CupSampleMatchFactory.makeInput(812, "EQUAL");
var input = {
  seed: "match_engine_v2_actions_812",
  home: sample.home,
  away: sample.away,
  environment: sample.environment,
  halfTimeTalks: sample.halfTimeTalks,
  calibration: sample.calibration,
  rules: LEAGUE_MATCH_RULES_V2,
  config: { tickSeconds: 5 }
};
var runtime = MatchEngineV2.createMatch(input);
var snapshot2 = MatchEngineV2.snapshot(runtime);
var narrowestOutfieldLengthSpan = Number.POSITIVE_INFINITY;
var narrowestOutfieldWidthSpan = Number.POSITIVE_INFINITY;
var smallestRenderedPlayerDistance = Number.POSITIVE_INFINITY;
var smallestRenderedPlayerDistanceContext = "";
for (let second = 5; second <= 90 * 60; second += 5) {
  snapshot2 = MatchEngineV2.advanceTo(runtime, second);
  const activePlayers4 = Object.values(snapshot2.spatial.players).filter((player) => player.isOnPitch);
  const redCardCount = Object.keys(snapshot2.result.finalState.redCards).length;
  import_strict.default.equal(activePlayers4.length, 22 - redCardCount);
  activePlayers4.forEach((player) => {
    import_strict.default.ok(player.position.x >= 0 && player.position.x <= snapshot2.spatial.pitchWidth);
    import_strict.default.ok(player.position.y >= 0 && player.position.y <= snapshot2.spatial.pitchLength);
    if (!player.returningToMovementZone) {
      import_strict.default.ok(player.position.x >= player.movementZone.minX && player.position.x <= player.movementZone.maxX);
      import_strict.default.ok(player.position.y >= player.movementZone.minY && player.position.y <= player.movementZone.maxY);
    }
  });
  const activeOutfieldPlayers = activePlayers4.filter((player) => player.role !== "GK");
  const lengthSpan = Math.max(...activeOutfieldPlayers.map((player) => player.position.y)) - Math.min(...activeOutfieldPlayers.map((player) => player.position.y));
  const widthSpan = Math.max(...activeOutfieldPlayers.map((player) => player.position.x)) - Math.min(...activeOutfieldPlayers.map((player) => player.position.x));
  narrowestOutfieldLengthSpan = Math.min(narrowestOutfieldLengthSpan, lengthSpan);
  narrowestOutfieldWidthSpan = Math.min(narrowestOutfieldWidthSpan, widthSpan);
  for (let firstIndex = 0; firstIndex < activePlayers4.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < activePlayers4.length; secondIndex += 1) {
      const firstPlayer = activePlayers4[firstIndex];
      const secondPlayer = activePlayers4[secondIndex];
      const renderedDistance = Math.hypot(
        (firstPlayer.position.x - secondPlayer.position.x) * 540 / 68,
        (firstPlayer.position.y - secondPlayer.position.y) * 720 / 105
      );
      if (renderedDistance < smallestRenderedPlayerDistance) {
        smallestRenderedPlayerDistance = renderedDistance;
        smallestRenderedPlayerDistanceContext = `${second}s: ${firstPlayer.playerId} ${JSON.stringify(firstPlayer.position)} / ${secondPlayer.playerId} ${JSON.stringify(secondPlayer.position)}`;
      }
    }
  }
  import_strict.default.ok(snapshot2.spatial.ball.x >= 0 && snapshot2.spatial.ball.x <= snapshot2.spatial.pitchWidth);
  import_strict.default.ok(snapshot2.spatial.ball.y >= 0 && snapshot2.spatial.ball.y <= snapshot2.spatial.pitchLength);
}
import_strict.default.ok(narrowestOutfieldLengthSpan >= 47, `Outfield collapsed vertically to ${narrowestOutfieldLengthSpan.toFixed(2)} m.`);
import_strict.default.ok(narrowestOutfieldWidthSpan >= 43, `Outfield collapsed horizontally to ${narrowestOutfieldWidthSpan.toFixed(2)} m.`);
import_strict.default.ok(
  smallestRenderedPlayerDistance >= 35.5,
  `SVG player markers overlap at ${smallestRenderedPlayerDistance.toFixed(2)} px (${smallestRenderedPlayerDistanceContext}).`
);
snapshot2 = MatchEngineV2.advanceTo(runtime, 120 * 60);
import_strict.default.equal(snapshot2.isFinished, true);
var passes = snapshot2.result.events.filter((event) => event.type === "PASS_COMPLETED" /* PASS_COMPLETED */);
var interceptions = snapshot2.result.events.filter((event) => event.type === "MISPLACED_PASS" /* MISPLACED_PASS */);
var tackles = snapshot2.result.events.filter((event) => event.type === "TACKLE_WON" /* TACKLE_WON */);
var turnovers = [...interceptions, ...tackles];
import_strict.default.ok(passes.length >= 20, `Expected visible completed passes, received ${passes.length}.`);
import_strict.default.ok(turnovers.length >= 5, `Expected attributed turnovers, received ${turnovers.length}.`);
passes.forEach((event) => {
  import_strict.default.ok(event.playerId, "A completed pass requires a passer.");
  import_strict.default.ok(event.secondaryPlayerId, "A completed pass requires a receiver.");
  import_strict.default.notEqual(event.playerId, event.secondaryPlayerId);
  import_strict.default.equal(typeof event.detail?.passerQuality, "number");
  import_strict.default.equal(typeof event.detail?.receiverMovement, "number");
});
turnovers.forEach((event) => {
  import_strict.default.ok(event.playerId, "A turnover requires the player who won possession.");
  import_strict.default.ok(event.secondaryPlayerId, "A turnover requires the player who lost possession.");
});
var allPlayerStats = [
  ...Object.values(snapshot2.result.playerStats.HOME),
  ...Object.values(snapshot2.result.playerStats.AWAY)
];
import_strict.default.equal(
  allPlayerStats.reduce((sum, entry) => sum + entry.passesCompleted, 0),
  passes.length
);
import_strict.default.equal(
  allPlayerStats.reduce((sum, entry) => sum + entry.turnoversWon, 0),
  turnovers.length
);
import_strict.default.equal(
  allPlayerStats.reduce((sum, entry) => sum + entry.turnoversLost, 0),
  turnovers.length
);
import_strict.default.equal(
  allPlayerStats.reduce((sum, entry) => sum + entry.tacklesWon, 0),
  tackles.length
);
import_strict.default.equal(
  allPlayerStats.reduce((sum, entry) => sum + entry.passesAttempted, 0),
  passes.length + interceptions.length
);
var passCue = snapshot2.spatial.visualCues.find((cue) => cue.sourceEventType === "PASS_COMPLETED" /* PASS_COMPLETED */);
import_strict.default.ok(passCue, "A completed pass must create an SVG cue.");
var throwInCue = snapshot2.spatial.visualCues.find((cue) => cue.sourceEventType === "THROW_IN" /* THROW_IN */);
import_strict.default.ok(throwInCue, "A throw-in must create an SVG cue.");
import_strict.default.ok(
  throwInCue.start.x <= 0.6 || throwInCue.start.x >= snapshot2.spatial.pitchWidth - 0.6,
  "A throw-in trajectory must start at the touchline."
);
import_strict.default.ok(
  throwInCue.end.x >= 5 && throwInCue.end.x <= snapshot2.spatial.pitchWidth - 5,
  "A throw-in must travel back inside the pitch to a teammate."
);
var start = MatchEngineV2TrajectoryService.sampleCue(passCue, 0);
var middle = MatchEngineV2TrajectoryService.sampleCue(passCue, passCue.durationMs / 2);
var end = MatchEngineV2TrajectoryService.sampleCue(passCue, passCue.durationMs);
import_strict.default.deepEqual({ x: start.x, y: start.y }, passCue.start);
import_strict.default.deepEqual({ x: end.x, y: end.y }, passCue.end);
import_strict.default.ok(middle.z > 0);
import_strict.default.equal(end.finished, true);
var repeatedMiddle = MatchEngineV2TrajectoryService.sampleCue(passCue, passCue.durationMs / 2);
import_strict.default.deepEqual(repeatedMiddle, middle, "Visual sampling must be deterministic.");
snapshot2.spatial.visualCues.forEach((cue) => {
  const samplePoint = MatchEngineV2TrajectoryService.sampleCue(cue, cue.durationMs * 0.63);
  import_strict.default.ok(samplePoint.x >= 0 && samplePoint.x <= snapshot2.spatial.pitchWidth);
  import_strict.default.ok(samplePoint.y >= 0 && samplePoint.y <= snapshot2.spatial.pitchLength);
  import_strict.default.ok(samplePoint.z >= 0);
});
var biasSample = CupSampleMatchFactory.makeInput(913, "EQUAL");
var midfieldStarterId = biasSample.home.lineup.startingXI.find(
  (id) => biasSample.home.players.find((player) => player.id === id)?.position === "MID"
);
import_strict.default.ok(midfieldStarterId);
biasSample.home.players = biasSample.home.players.map((player) => ({
  ...player,
  attributes: {
    ...player.attributes,
    passing: player.id === midfieldStarterId ? 100 : 8,
    vision: player.id === midfieldStarterId ? 100 : 8,
    technique: player.id === midfieldStarterId ? 100 : 8,
    mentality: player.id === midfieldStarterId ? 100 : 20
  }
}));
var fatigue = Object.fromEntries([
  ...biasSample.home.players,
  ...biasSample.away.players
].map((player) => [player.id, 100]));
var attackingProfile = CupTeamProfileService.buildProfile(biasSample.home, fatigue, {});
var defendingProfile = CupTeamProfileService.buildProfile(biasSample.away, fatigue, {});
var eliteSelections = 0;
var selectedActions = /* @__PURE__ */ new Set();
var decisionSamples = 500;
for (let index = 0; index < decisionSamples; index += 1) {
  const decision = CupPlayerDecisionService.selectPossessionDecision({
    attacking: attackingProfile,
    defending: defendingProfile,
    zone: "MIDFIELD",
    pattern: "BUILD_UP",
    fatigue,
    instructions: biasSample.home.instructions,
    roll: (salt) => seededRandom("player_decision_bias", index * 5, salt)
  });
  if (decision.passer?.id === midfieldStarterId) eliteSelections += 1;
  selectedActions.add(decision.action);
}
import_strict.default.ok(eliteSelections > decisionSamples * 0.35, `Elite passer selected only ${eliteSelections} times.`);
import_strict.default.ok(eliteSelections < decisionSamples, "Minimum RNG must leave room for other passers.");
import_strict.default.ok(selectedActions.has("PASS"));
import_strict.default.ok(selectedActions.has("DIRECT_PASS"));
import_strict.default.ok(selectedActions.has("DRIBBLE"));
var forwardCarrierId = attackingProfile.forwards[0]?.id;
import_strict.default.ok(forwardCarrierId);
for (let index = 0; index < 200; index += 1) {
  const decision = CupPlayerDecisionService.selectPossessionDecision({
    attacking: attackingProfile,
    defending: defendingProfile,
    zone: "FINAL_THIRD",
    pattern: "BUILD_UP",
    fatigue,
    currentCarrierId: forwardCarrierId,
    instructions: biasSample.home.instructions,
    roll: (salt) => seededRandom("advanced_forward_connection", index * 5, salt)
  });
  import_strict.default.notEqual(decision.receiver?.position, "DEF", "Napastnik w tercji ataku nie powinien podawa\u0107 bezpo\u015Brednio do g\u0142\u0119bokiego obro\u0144cy.");
  import_strict.default.notEqual(decision.receiver?.position, "GK");
}
var playback = MatchEngineV2PlaybackService.create({ renderMode: "INTERACTIVE" });
playback = MatchEngineV2PlaybackService.setPaused(playback, false);
playback = MatchEngineV2PlaybackService.advance(playback, 750 * 1e3);
import_strict.default.equal(playback.targetSecond, 90 * 60);
import_strict.default.equal(playback.paused, true);
var engineSecondBeforeViewChange = runtime.core.state.second;
playback = MatchEngineV2PlaybackService.setRenderMode(playback, "CLASSIC");
playback = MatchEngineV2PlaybackService.setTransmissionMode(playback, "ALL_ACTIONS");
import_strict.default.equal(runtime.core.state.second, engineSecondBeforeViewChange);
var highlights = MatchEngineV2PlaybackService.selectVisibleCues(playback, snapshot2.spatial.visualCues);
import_strict.default.ok(highlights.length > 0);
import_strict.default.ok(highlights.length < snapshot2.spatial.visualCues.length);
import_strict.default.ok(highlights.every((cue) => ["GOAL", "SAVE", "SHOT", "RESTART", "FOUL"].includes(cue.kind)));
console.log("MatchEngineV2ActionTrajectoryTests: OK", {
  score: `${snapshot2.result.homeScore}:${snapshot2.result.awayScore}`,
  passes: passes.length,
  interceptions: interceptions.length,
  tackles: tackles.length,
  visualCues: snapshot2.spatial.visualCues.length,
  elitePasserShare: Number((eliteSelections / decisionSamples).toFixed(3)),
  normalSpeedRealMinutes: 12.5,
  highlightCues: highlights.length,
  narrowestOutfieldLengthSpan: Number(narrowestOutfieldLengthSpan.toFixed(2)),
  narrowestOutfieldWidthSpan: Number(narrowestOutfieldWidthSpan.toFixed(2)),
  smallestRenderedPlayerDistance: Number(smallestRenderedPlayerDistance.toFixed(2))
});
