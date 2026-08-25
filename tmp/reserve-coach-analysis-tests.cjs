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

// tests/ReserveCoachAnalysisTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);

// services/ReserveCoachAnalysisService.ts
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
var round1 = (value) => Math.round(value * 10) / 10;
var POSITION_KEY_ATTRIBUTES = {
  ["GK" /* GK */]: ["goalkeeping", "positioning", "passing", "vision", "mentality"],
  ["DEF" /* DEF */]: ["defending", "positioning", "strength", "heading", "pace"],
  ["MID" /* MID */]: ["passing", "vision", "technique", "stamina", "dribbling"],
  ["FWD" /* FWD */]: ["finishing", "attacking", "pace", "positioning", "technique"]
};
var ATTRIBUTE_LABELS = {
  strength: "Si\u0142a",
  stamina: "Wytrzyma\u0142o\u015B\u0107",
  pace: "Szybko\u015B\u0107",
  defending: "Obrona",
  passing: "Podania",
  attacking: "Atak",
  finishing: "Wyko\u0144czenie",
  technique: "Technika",
  vision: "Wizja gry",
  dribbling: "Drybling",
  heading: "Gra g\u0142ow\u0105",
  positioning: "Ustawianie",
  goalkeeping: "Bramkarstwo",
  freeKicks: "Rzuty wolne",
  talent: "Talent",
  penalties: "Rzuty karne",
  corners: "Rzuty ro\u017Cne",
  aggression: "Agresja",
  crossing: "Do\u015Brodkowania",
  leadership: "Przyw\xF3dztwo",
  mentality: "Mentalno\u015B\u0107",
  workRate: "Pracowito\u015B\u0107"
};
var hashUnit = (seed) => {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
};
var getWeekKey = (date) => {
  const monday = new Date(date);
  const weekday = monday.getDay() || 7;
  monday.setDate(monday.getDate() - weekday + 1);
  return monday.toISOString().slice(0, 10);
};
var getReserveCoachAnalysisQuality = (coach) => {
  if (!coach) return 20;
  const attributes = coach.attributes;
  return Math.round(clamp(
    attributes.decisionMaking * 0.34 + attributes.training * 0.29 + attributes.experience * 0.22 + attributes.motivation * 0.15,
    0,
    100
  ));
};
var getReserveCoachUncertainty = (coachQuality) => Math.round(clamp(28 - coachQuality * 0.23, 5, 28));
var getAverageRating = (player) => {
  if (player.reserveStats?.matches) {
    return player.reserveStats.totalRatingPoints / player.reserveStats.matches;
  }
  const ratings = player.stats.ratingHistory ?? [];
  if (!ratings.length) return null;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
};
var getDevelopmentTrend = (player) => {
  const changes = player.stats.seasonalChanges ?? {};
  const important = POSITION_KEY_ATTRIBUTES[player.position];
  return round1(important.reduce((sum, attribute) => sum + (changes[attribute] ?? 0), 0));
};
var getMatchNumbers = (player) => {
  if (player.reserveStats) {
    return {
      matches: player.reserveStats.matches,
      goals: player.reserveStats.goals,
      assists: player.reserveStats.assists,
      yellowCards: player.reserveStats.yellowCards,
      redCards: player.reserveStats.redCards
    };
  }
  return {
    matches: player.stats.matchesPlayed ?? 0,
    goals: player.stats.goals ?? 0,
    assists: player.stats.assists ?? 0,
    yellowCards: player.stats.yellowCards ?? 0,
    redCards: player.stats.redCards ?? 0
  };
};
var getRecentRatingsByPlayer = (results) => {
  const ratings = /* @__PURE__ */ new Map();
  [...results].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()).forEach((result) => {
    Object.entries(result.ratings ?? {}).forEach(([playerId, rating]) => {
      if (!Number.isFinite(rating)) return;
      ratings.set(playerId, [...ratings.get(playerId) ?? [], rating].slice(-6));
    });
  });
  return ratings;
};
var makePerceiver = (weekKey, coachQuality, uncertaintyPercent) => (playerId, channel, value, min = 0, max = 100) => {
  const swing = hashUnit(`${weekKey}:${coachQuality}:${playerId}:${channel}`) * 2 - 1;
  return clamp(value * (1 + swing * uncertaintyPercent / 100), min, max);
};
var getAdaptation = (player, perceive) => {
  const mindset = player.playerMindset;
  const formalAdaptation = player.clubAdaptation?.clubId === player.clubId ? player.clubAdaptation.level : 100;
  const belonging = mindset?.squadBelonging ?? 72;
  const happiness = mindset?.clubHappiness ?? player.morale ?? 65;
  const trust = mindset?.coachTrust ?? 65;
  const conflict = mindset?.conflictLevel ?? 0;
  const base = formalAdaptation * 0.42 + belonging * 0.24 + happiness * 0.18 + trust * 0.16 - conflict * 0.2;
  const score = Math.round(perceive(player.id, "adaptation", clamp(base, 0, 100)));
  return {
    score,
    label: score >= 82 ? "ZINTEGROWANY" : score >= 64 ? "DOBRA" : score >= 44 ? "W TOKU" : "TRUDNA"
  };
};
var getBehavior = (player, perceive) => {
  const stats = getMatchNumbers(player);
  const cardRisk = stats.matches > 0 ? (stats.yellowCards + stats.redCards * 3) / stats.matches * 55 : 0;
  const base = clamp(
    55 + player.attributes.workRate * 0.22 + player.attributes.mentality * 0.19 + player.attributes.leadership * 0.09 - Math.max(0, player.attributes.aggression - 72) * 0.35 - cardRisk,
    0,
    100
  );
  const score = Math.round(perceive(player.id, "behavior", base));
  return {
    score,
    label: score >= 80 ? "WZOROWE" : score >= 62 ? "STABILNE" : score >= 44 ? "RYZYKOWNE" : "PROBLEMATYCZNE"
  };
};
var getReadiness = (player, perceive) => {
  const healthPenalty = player.health.status === "HEALTHY" /* HEALTHY */ ? 0 : 42;
  const base = clamp(
    (player.condition ?? 100) * 0.48 + (100 - (player.fatigueDebt ?? 0)) * 0.22 + (player.morale ?? 60) * 0.14 + player.overallRating * 0.16 - healthPenalty,
    0,
    100
  );
  const score = Math.round(perceive(player.id, "readiness", base));
  return {
    score,
    label: score >= 80 ? "GOTOWY" : score >= 62 ? "BLISKO" : score >= 44 ? "OSTRO\u017BNIE" : "NIEGOTOWY"
  };
};
var getPotentialLabel = (score) => {
  if (score >= 84) return "ELITARNY TALENT";
  if (score >= 72) return "DU\u017BY POTENCJA\u0141";
  if (score >= 60) return "PROJEKT ROZWOJOWY";
  return "DO OBSERWACJI";
};
var chooseFocus = (player, perceive) => POSITION_KEY_ATTRIBUTES[player.position].map((attribute) => ({
  attribute,
  need: 100 - perceive(player.id, `focus:${attribute}`, player.attributes[attribute])
})).sort((left, right) => right.need - left.need)[0].attribute;
var buildCandles = (player, ratings, perceive) => {
  const averageRating = getAverageRating(player) ?? clamp(4 + (player.form ?? 50) * 0.045, 4.5, 8.5);
  const source = ratings.length > 0 ? ratings.slice(-6) : Array.from({ length: 6 }, (_, index) => perceive(player.id, `estimated-rating:${index}`, averageRating, 4, 10));
  return source.map((rating, index) => {
    const previous = index > 0 ? source[index - 1] : averageRating;
    const wick = 0.18 + hashUnit(`${player.id}:wick:${index}`) * 0.28;
    return {
      label: `M${index + 1}`,
      open: round1(clamp(previous, 1, 10)),
      close: round1(clamp(rating, 1, 10)),
      high: round1(clamp(Math.max(previous, rating) + wick, 1, 10)),
      low: round1(clamp(Math.min(previous, rating) - wick, 1, 10)),
      estimated: ratings.length === 0
    };
  });
};
var buildGrowthCurve = (player, perceivedOverall, perceivedTalent, uncertaintyPercent) => {
  const ageFactor = player.age <= 18 ? 1 : player.age <= 20 ? 0.84 : player.age <= 22 ? 0.62 : 0.35;
  const gap = Math.max(0, perceivedTalent - perceivedOverall);
  return [0, 3, 6, 9, 12].map((month) => {
    const progress = 1 - Math.pow(1 - month / 12, 2);
    const value = perceivedOverall + gap * ageFactor * 0.46 * progress;
    const band = Math.max(1.2, value * uncertaintyPercent / 100 * 0.35);
    return {
      month,
      value: round1(clamp(value, 1, 99)),
      low: round1(clamp(value - band, 1, 99)),
      high: round1(clamp(value + band, 1, 99))
    };
  });
};
var getCareerDecision = (player, potentialScore, readinessScore, behaviorScore) => {
  const stats = getMatchNumbers(player);
  if (behaviorScore < 42 || player.health.status !== "HEALTHY" /* HEALTHY */) {
    return { decision: "PLAN NAPRAWCZY", horizon: "2\u20134 tygodnie" };
  }
  if (readinessScore >= 80 && player.overallRating >= 64) {
    return { decision: "W\u0141\u0104CZY\u0106 DO I ZESPO\u0141U", horizon: "najbli\u017Csze 1\u20133 mecze" };
  }
  if (player.age <= 20 && potentialScore >= 70) {
    return { decision: "ROZWIJA\u0106 W REZERWACH", horizon: "3\u20136 miesi\u0119cy" };
  }
  if (player.age >= 20 && potentialScore >= 62 && stats.matches < 8) {
    return { decision: "WYPO\u017BYCZY\u0106", horizon: "najbli\u017Csze okno" };
  }
  return { decision: "OBSERWOWA\u0106", horizon: "kolejne 4 tygodnie" };
};
var buildNarrative = (player, potentialScore, focusLabel, adaptationLabel, behaviorLabel, decision) => {
  const stats = getMatchNumbers(player);
  const rating = getAverageRating(player);
  const evidence = stats.matches > 0 ? `${stats.matches} mecz\xF3w, ${stats.goals} goli, ${stats.assists} asyst i \u015Brednia ${rating?.toFixed(2) ?? "\u2013"}` : "brak wystarczaj\u0105cej pr\xF3bki meczowej";
  return {
    observation: `Ocena potencja\u0142u ${Math.round(potentialScore)}/100. Materia\u0142 dowodowy: ${evidence}. Aklimatyzacja: ${adaptationLabel.toLowerCase()}, zachowanie: ${behaviorLabel.toLowerCase()}.`,
    recommendation: `${decision}. Priorytet indywidualny: ${focusLabel}. Ponowna ocena po czterech tygodniach lub po trzech pe\u0142nych wyst\u0119pach.`
  };
};
var buildPitchMarkers = (talents) => {
  const counters = {
    ["GK" /* GK */]: 0,
    ["DEF" /* DEF */]: 0,
    ["MID" /* MID */]: 0,
    ["FWD" /* FWD */]: 0
  };
  const xSlots = {
    ["GK" /* GK */]: [50],
    ["DEF" /* DEF */]: [20, 40, 60, 80],
    ["MID" /* MID */]: [22, 42, 62, 82],
    ["FWD" /* FWD */]: [34, 66, 50]
  };
  const ySlots = {
    ["GK" /* GK */]: 88,
    ["DEF" /* DEF */]: 68,
    ["MID" /* MID */]: 47,
    ["FWD" /* FWD */]: 23
  };
  return talents.slice(0, 8).map((talent) => {
    const position = talent.player.position;
    const slot = counters[position]++;
    const x = xSlots[position][slot % xSlots[position].length];
    const y = ySlots[position] - Math.floor(slot / xSlots[position].length) * 7;
    const lateral = slot % 2 === 0 ? -6 : 6;
    return {
      playerId: talent.player.id,
      shortName: talent.player.lastName.slice(0, 9),
      position,
      x,
      y,
      moveX: clamp(x + lateral, 10, 90),
      moveY: clamp(y - (position === "GK" /* GK */ ? 8 : 13), 8, 92),
      potentialScore: talent.potentialScore
    };
  });
};
var ReserveCoachAnalysisService = {
  createReport({ players: players2, coach, currentDate, matchResults = [] }) {
    const generatedForWeek = getWeekKey(currentDate);
    const coachQuality = getReserveCoachAnalysisQuality(coach);
    const uncertaintyPercent = getReserveCoachUncertainty(coachQuality);
    const perceive = makePerceiver(generatedForWeek, coachQuality, uncertaintyPercent);
    const recentRatings = getRecentRatingsByPlayer(matchResults);
    const talents = players2.map((player) => {
      const stats = getMatchNumbers(player);
      const averageRating = getAverageRating(player);
      const developmentTrend = getDevelopmentTrend(player);
      const perceivedOverall = Math.round(perceive(player.id, "overall", player.overallRating, 1, 99));
      const perceivedTalent = Math.round(perceive(player.id, "talent", player.attributes.talent, 1, 99));
      const ageBonus = player.age <= 17 ? 12 : player.age <= 19 ? 9 : player.age <= 21 ? 6 : player.age <= 23 ? 3 : 0;
      const performanceBonus = averageRating === null ? 0 : (averageRating - 6.5) * 5;
      const basePotential = clamp(
        perceivedTalent * 0.5 + perceivedOverall * 0.28 + ageBonus + developmentTrend * 1.25 + performanceBonus,
        1,
        99
      );
      const potentialScore = round1(perceive(player.id, "potential", basePotential, 1, 99));
      const adaptation = getAdaptation(player, perceive);
      const behavior = getBehavior(player, perceive);
      const readiness = getReadiness(player, perceive);
      const focusAttribute = chooseFocus(player, perceive);
      const focusLabel = ATTRIBUTE_LABELS[focusAttribute];
      const career = getCareerDecision(player, potentialScore, readiness.score, behavior.score);
      const narrative = buildNarrative(
        player,
        potentialScore,
        focusLabel,
        adaptation.label,
        behavior.label,
        career.decision
      );
      const formBase = player.form ?? (averageRating === null ? 50 : clamp((averageRating - 4) / 5 * 100, 0, 100));
      return {
        player,
        perceivedOverall,
        perceivedTalent,
        potentialScore,
        potentialLabel: getPotentialLabel(potentialScore),
        developmentTrend,
        formScore: Math.round(perceive(player.id, "form", formBase)),
        averageRating,
        adaptationScore: adaptation.score,
        adaptationLabel: adaptation.label,
        behaviorScore: behavior.score,
        behaviorLabel: behavior.label,
        readinessScore: readiness.score,
        readinessLabel: readiness.label,
        focusAttribute,
        focusLabel,
        decision: career.decision,
        horizon: career.horizon,
        observation: narrative.observation,
        recommendation: narrative.recommendation,
        // Official reserve matches expose per-match ratings through their result
        // records. Legacy reserve saves may only have ratingHistory, which is
        // still real match evidence and must be preferred over an estimate.
        candles: buildCandles(
          player,
          recentRatings.get(player.id) ?? (player.stats.ratingHistory ?? []).slice(-6),
          perceive
        ),
        growthCurve: buildGrowthCurve(player, perceivedOverall, perceivedTalent, uncertaintyPercent),
        matchSample: stats.matches
      };
    }).sort((left, right) => right.potentialScore - left.potentialScore || right.perceivedTalent - left.perceivedTalent || left.player.age - right.player.age).slice(0, 8).map(({ matchSample: _matchSample, ...talent }) => talent);
    const positionDistribution = players2.reduce((total, player) => {
      total[player.position] += 1;
      return total;
    }, {
      ["GK" /* GK */]: 0,
      ["DEF" /* DEF */]: 0,
      ["MID" /* MID */]: 0,
      ["FWD" /* FWD */]: 0
    });
    const highPotential = talents.filter((talent) => talent.potentialScore >= 72).length;
    const firstTeamReady = talents.filter((talent) => talent.decision === "W\u0141\u0104CZY\u0106 DO I ZESPO\u0141U").length;
    const interventionNeeded = talents.filter((talent) => talent.decision === "PLAN NAPRAWCZY" || talent.behaviorScore < 45 || talent.readinessScore < 45).length;
    const averageDevelopment = players2.length > 0 ? round1(players2.reduce((sum, player) => sum + getDevelopmentTrend(player), 0) / players2.length) : 0;
    const confidenceLabel = coachQuality >= 84 ? "BARDZO WYSOKA" : coachQuality >= 66 ? "WYSOKA" : coachQuality >= 44 ? "UMIARKOWANA" : "NISKA";
    const executiveSummary = highPotential > 0 ? `W kadrze wyr\xF3\u017Cnia si\u0119 ${highPotential} zawodnik\xF3w o du\u017Cym lub elitarnym potencjale. ${firstTeamReady > 0 ? `${firstTeamReady} jest gotowych do kontrolowanej pr\xF3by w pierwszym zespole.` : "Najlepsi nadal potrzebuj\u0105 regularnego planu rozwoju."}` : "Nie widz\u0119 jeszcze talentu gotowego do szybkiego awansu. Priorytetem pozostaj\u0105 regularne minuty, specjalizacja treningowa i ponowna ocena za cztery tygodnie.";
    return {
      generatedForWeek,
      coachQuality,
      uncertaintyPercent,
      confidenceLabel,
      executiveSummary,
      talents,
      pitchMarkers: buildPitchMarkers(talents),
      positionDistribution,
      metrics: {
        highPotential,
        firstTeamReady,
        interventionNeeded,
        averageDevelopment
      }
    };
  }
};

// tests/ReserveCoachAnalysisTests.ts
var baseAttributes = {
  strength: 58,
  stamina: 66,
  pace: 72,
  defending: 42,
  passing: 70,
  attacking: 65,
  finishing: 61,
  technique: 74,
  vision: 76,
  dribbling: 69,
  heading: 48,
  positioning: 64,
  goalkeeping: 8,
  freeKicks: 57,
  talent: 88,
  penalties: 55,
  corners: 61,
  aggression: 64,
  crossing: 62,
  leadership: 58,
  mentality: 71,
  workRate: 75
};
var makePlayer = (overrides) => ({
  id: "RESERVE_TALENT_A",
  firstName: "Jan",
  lastName: "Talent",
  age: 18,
  clubId: "RESERVE_CLUB",
  nationality: "POL",
  position: "MID" /* MID */,
  overallRating: 64,
  attributes: { ...baseAttributes },
  stats: {
    goals: 3,
    assists: 4,
    yellowCards: 1,
    redCards: 0,
    cleanSheets: 0,
    matchesPlayed: 8,
    minutesPlayed: 610,
    seasonalChanges: { passing: 2, technique: 1, vision: 1, stamina: 1 },
    ratingHistory: [6.4, 6.7, 6.9, 7.1, 7.3, 7.5]
  },
  reserveStats: {
    matches: 8,
    goals: 3,
    assists: 4,
    yellowCards: 1,
    redCards: 0,
    totalRatingPoints: 56.2
  },
  health: { status: "HEALTHY" /* HEALTHY */ },
  condition: 91,
  suspensionMatches: 0,
  contractEndDate: "2030-06-30",
  annualSalary: 8e4,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 12,
  morale: 78,
  clubAdaptation: {
    clubId: "RESERVE_CLUB",
    startedAt: "2026-07-01",
    lastUpdatedAt: "2026-08-24",
    durationDays: 90,
    initialLevel: 45,
    level: 79
  },
  playerMindset: {
    coachTrust: 82,
    clubHappiness: 80,
    squadBelonging: 78,
    roleClarity: 75,
    playingTimeSatisfaction: 74,
    developmentSatisfaction: 84,
    transferOpenness: 15,
    conflictLevel: 2
  },
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
  ...overrides
});
var makeCoach = (quality) => ({
  id: `RESERVE_COACH_${quality}`,
  firstName: "Adam",
  lastName: "Analityk",
  age: 48,
  nationality: "POL",
  nationalityFlag: "\u{1F1F5}\u{1F1F1}",
  attributes: {
    experience: quality,
    decisionMaking: quality,
    motivation: quality,
    training: quality
  },
  history: [],
  currentClubId: "RESERVE_CLUB",
  hiredDate: "2026-07-01",
  contractEndDate: "2028-06-30",
  annualSalary: 15e4,
  expPoints: 1,
  blacklist: {},
  favoriteTactics: { offensive: "4-3-3", neutral: "4-2-3-1", defensive: "5-3-2" },
  seasonStats: []
});
var eliteCoach = makeCoach(100);
var weakCoach = makeCoach(20);
var star = makePlayer({});
var prospect = makePlayer({
  id: "RESERVE_TALENT_B",
  firstName: "Piotr",
  lastName: "Projekt",
  age: 20,
  position: "FWD" /* FWD */,
  overallRating: 57,
  attributes: { ...baseAttributes, talent: 76, finishing: 68, attacking: 70 },
  reserveStats: { matches: 3, goals: 1, assists: 0, yellowCards: 0, redCards: 0, totalRatingPoints: 19.4 }
});
var squadPlayer = makePlayer({
  id: "RESERVE_SQUAD_C",
  firstName: "Marek",
  lastName: "Kadrowy",
  age: 24,
  position: "DEF" /* DEF */,
  overallRating: 55,
  attributes: { ...baseAttributes, talent: 58, defending: 62, positioning: 60 },
  reserveStats: { matches: 7, goals: 0, assists: 0, yellowCards: 5, redCards: 1, totalRatingPoints: 42.1 }
});
var players = [star, prospect, squadPlayer];
import_strict.default.equal(getReserveCoachAnalysisQuality(eliteCoach), 100);
import_strict.default.equal(getReserveCoachUncertainty(100), 5, "najlepszy trener nadal zachowuje 5% RNG");
import_strict.default.ok(getReserveCoachUncertainty(getReserveCoachAnalysisQuality(weakCoach)) > 5, "s\u0142abszy trener musi mie\u0107 wi\u0119kszy margines b\u0142\u0119du");
var input = { players, coach: eliteCoach, currentDate: /* @__PURE__ */ new Date("2026-08-25T12:00:00Z") };
var report = ReserveCoachAnalysisService.createReport(input);
var repeated = ReserveCoachAnalysisService.createReport(input);
var weakReport = ReserveCoachAnalysisService.createReport({ ...input, coach: weakCoach });
import_strict.default.deepEqual(report, repeated, "raport musi by\u0107 stabilny po ponownym otwarciu w tym samym tygodniu");
import_strict.default.equal(report.uncertaintyPercent, 5);
import_strict.default.ok(weakReport.uncertaintyPercent > report.uncertaintyPercent);
import_strict.default.equal(report.talents[0].player.id, star.id, "najwi\u0119kszy talent powinien trafi\u0107 na szczyt rankingu przy dobrym trenerze");
import_strict.default.equal(report.talents[0].candles.every((candle) => !candle.estimated), true, "historia ocen meczowych powinna zasila\u0107 wykres \u015Bwiecowy");
import_strict.default.ok(report.talents[0].growthCurve.every((point, index, list) => index === 0 || point.value >= list[index - 1].value), "prognoza rozwoju nie powinna cofa\u0107 si\u0119 bez ujemnego trendu");
import_strict.default.equal(report.pitchMarkers.length, report.talents.length);
import_strict.default.ok(report.pitchMarkers.every((marker) => marker.x >= 0 && marker.x <= 100 && marker.y >= 0 && marker.y <= 100));
import_strict.default.ok(report.talents.some((talent) => talent.behaviorLabel === "RYZYKOWNE" || talent.behaviorLabel === "PROBLEMATYCZNE"), "kartki i agresja musz\u0105 wp\u0142ywa\u0107 na ocen\u0119 zachowania");
import_strict.default.ok(report.talents[0].observation.includes("8 mecz\xF3w, 3 goli, 4 asyst"), "raport powinien wykorzystywa\u0107 prawdziwe statystyki rezerw");
var nextWeek = ReserveCoachAnalysisService.createReport({ ...input, currentDate: /* @__PURE__ */ new Date("2026-09-01T12:00:00Z") });
import_strict.default.notEqual(nextWeek.generatedForWeek, report.generatedForWeek);
import_strict.default.ok(
  nextWeek.talents.some((talent) => {
    const previous = report.talents.find((item) => item.player.id === talent.player.id);
    return previous && (previous.potentialScore !== talent.potentialScore || previous.formScore !== talent.formScore);
  }),
  "nowy tydzie\u0144 powinien otrzyma\u0107 now\u0105 pr\xF3bk\u0119 obserwacyjnego RNG"
);
console.log("ReserveCoachAnalysisTests: OK");
