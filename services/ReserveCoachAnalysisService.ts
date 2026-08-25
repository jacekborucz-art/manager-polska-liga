import {
  Coach,
  HealthStatus,
  Player,
  PlayerAttributes,
  PlayerPosition,
  ReserveMatchResult,
} from '../types';

export type ReserveCoachCareerDecision =
  | 'WŁĄCZYĆ DO I ZESPOŁU'
  | 'ROZWIJAĆ W REZERWACH'
  | 'WYPOŻYCZYĆ'
  | 'PLAN NAPRAWCZY'
  | 'OBSERWOWAĆ';

export interface ReserveCoachCandle {
  label: string;
  open: number;
  close: number;
  high: number;
  low: number;
  estimated: boolean;
}

export interface ReserveCoachGrowthPoint {
  month: number;
  value: number;
  low: number;
  high: number;
}

export interface ReserveCoachTalentAnalysis {
  player: Player;
  perceivedOverall: number;
  perceivedTalent: number;
  potentialScore: number;
  potentialLabel: string;
  developmentTrend: number;
  formScore: number;
  averageRating: number | null;
  adaptationScore: number;
  adaptationLabel: string;
  behaviorScore: number;
  behaviorLabel: string;
  readinessScore: number;
  readinessLabel: string;
  focusAttribute: keyof PlayerAttributes;
  focusLabel: string;
  decision: ReserveCoachCareerDecision;
  horizon: string;
  observation: string;
  recommendation: string;
  candles: ReserveCoachCandle[];
  growthCurve: ReserveCoachGrowthPoint[];
}

export interface ReserveCoachPitchMarker {
  playerId: string;
  shortName: string;
  position: PlayerPosition;
  x: number;
  y: number;
  moveX: number;
  moveY: number;
  potentialScore: number;
}

export interface ReserveCoachAnalysisReport {
  generatedForWeek: string;
  coachQuality: number;
  uncertaintyPercent: number;
  confidenceLabel: string;
  executiveSummary: string;
  talents: ReserveCoachTalentAnalysis[];
  pitchMarkers: ReserveCoachPitchMarker[];
  positionDistribution: Record<PlayerPosition, number>;
  metrics: {
    highPotential: number;
    firstTeamReady: number;
    interventionNeeded: number;
    averageDevelopment: number;
  };
}

interface ReserveCoachAnalysisInput {
  players: Player[];
  coach: Coach | null;
  currentDate: Date;
  matchResults?: ReserveMatchResult[];
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
const round1 = (value: number): number => Math.round(value * 10) / 10;

const POSITION_KEY_ATTRIBUTES: Record<PlayerPosition, (keyof PlayerAttributes)[]> = {
  [PlayerPosition.GK]: ['goalkeeping', 'positioning', 'passing', 'vision', 'mentality'],
  [PlayerPosition.DEF]: ['defending', 'positioning', 'strength', 'heading', 'pace'],
  [PlayerPosition.MID]: ['passing', 'vision', 'technique', 'stamina', 'dribbling'],
  [PlayerPosition.FWD]: ['finishing', 'attacking', 'pace', 'positioning', 'technique'],
};

const ATTRIBUTE_LABELS: Record<keyof PlayerAttributes, string> = {
  strength: 'Siła',
  stamina: 'Wytrzymałość',
  pace: 'Szybkość',
  defending: 'Obrona',
  passing: 'Podania',
  attacking: 'Atak',
  finishing: 'Wykończenie',
  technique: 'Technika',
  vision: 'Wizja gry',
  dribbling: 'Drybling',
  heading: 'Gra głową',
  positioning: 'Ustawianie',
  goalkeeping: 'Bramkarstwo',
  freeKicks: 'Rzuty wolne',
  talent: 'Talent',
  penalties: 'Rzuty karne',
  corners: 'Rzuty rożne',
  aggression: 'Agresja',
  crossing: 'Dośrodkowania',
  leadership: 'Przywództwo',
  mentality: 'Mentalność',
  workRate: 'Pracowitość',
};

const hashUnit = (seed: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 0x1_0000_0000;
};

const getWeekKey = (date: Date): string => {
  const monday = new Date(date);
  const weekday = monday.getDay() || 7;
  monday.setDate(monday.getDate() - weekday + 1);
  return monday.toISOString().slice(0, 10);
};

/**
 * The reserve coach acts as observer, trainer and mentor at the same time. The
 * weighted score reflects those responsibilities instead of relying on one
 * arbitrary attribute. Decision making has the largest impact on talent
 * recognition; training and motivation matter more for development advice.
 */
export const getReserveCoachAnalysisQuality = (coach: Coach | null): number => {
  if (!coach) return 20;
  const attributes = coach.attributes;
  return Math.round(clamp(
    attributes.decisionMaking * 0.34
      + attributes.training * 0.29
      + attributes.experience * 0.22
      + attributes.motivation * 0.15,
    0,
    100,
  ));
};

/**
 * Reports never reveal the simulation with perfect certainty. A poor coach can
 * deviate by up to 28%, while the best possible coach still keeps the required
 * five-percent observation error. The weekly key makes the assessment evolve
 * over time but remain stable every time the same weekly report is reopened.
 */
export const getReserveCoachUncertainty = (coachQuality: number): number => (
  Math.round(clamp(28 - coachQuality * 0.23, 5, 28))
);

const getAverageRating = (player: Player): number | null => {
  if (player.reserveStats?.matches) {
    return player.reserveStats.totalRatingPoints / player.reserveStats.matches;
  }
  const ratings = player.stats.ratingHistory ?? [];
  if (!ratings.length) return null;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
};

const getDevelopmentTrend = (player: Player): number => {
  const changes = player.stats.seasonalChanges ?? {};
  const important = POSITION_KEY_ATTRIBUTES[player.position];
  return round1(important.reduce((sum, attribute) => sum + (changes[attribute] ?? 0), 0));
};

const getMatchNumbers = (player: Player) => {
  if (player.reserveStats) {
    return {
      matches: player.reserveStats.matches,
      goals: player.reserveStats.goals,
      assists: player.reserveStats.assists,
      yellowCards: player.reserveStats.yellowCards,
      redCards: player.reserveStats.redCards,
    };
  }
  return {
    matches: player.stats.matchesPlayed ?? 0,
    goals: player.stats.goals ?? 0,
    assists: player.stats.assists ?? 0,
    yellowCards: player.stats.yellowCards ?? 0,
    redCards: player.stats.redCards ?? 0,
  };
};

const getRecentRatingsByPlayer = (results: ReserveMatchResult[]): Map<string, number[]> => {
  const ratings = new Map<string, number[]>();
  [...results]
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    .forEach(result => {
      Object.entries(result.ratings ?? {}).forEach(([playerId, rating]) => {
        if (!Number.isFinite(rating)) return;
        ratings.set(playerId, [...(ratings.get(playerId) ?? []), rating].slice(-6));
      });
    });
  return ratings;
};

const makePerceiver = (weekKey: string, coachQuality: number, uncertaintyPercent: number) => (
  playerId: string,
  channel: string,
  value: number,
  min = 0,
  max = 100,
): number => {
  const swing = hashUnit(`${weekKey}:${coachQuality}:${playerId}:${channel}`) * 2 - 1;
  return clamp(value * (1 + swing * uncertaintyPercent / 100), min, max);
};

const getAdaptation = (player: Player, perceive: ReturnType<typeof makePerceiver>) => {
  const mindset = player.playerMindset;
  const formalAdaptation = player.clubAdaptation?.clubId === player.clubId
    ? player.clubAdaptation.level
    : 100;
  const belonging = mindset?.squadBelonging ?? 72;
  const happiness = mindset?.clubHappiness ?? player.morale ?? 65;
  const trust = mindset?.coachTrust ?? 65;
  const conflict = mindset?.conflictLevel ?? 0;
  const base = formalAdaptation * 0.42 + belonging * 0.24 + happiness * 0.18 + trust * 0.16 - conflict * 0.20;
  const score = Math.round(perceive(player.id, 'adaptation', clamp(base, 0, 100)));
  return {
    score,
    label: score >= 82 ? 'ZINTEGROWANY' : score >= 64 ? 'DOBRA' : score >= 44 ? 'W TOKU' : 'TRUDNA',
  };
};

const getBehavior = (player: Player, perceive: ReturnType<typeof makePerceiver>) => {
  const stats = getMatchNumbers(player);
  const cardRisk = stats.matches > 0
    ? ((stats.yellowCards + stats.redCards * 3) / stats.matches) * 55
    : 0;
  const base = clamp(
    55
      + player.attributes.workRate * 0.22
      + player.attributes.mentality * 0.19
      + player.attributes.leadership * 0.09
      - Math.max(0, player.attributes.aggression - 72) * 0.35
      - cardRisk,
    0,
    100,
  );
  const score = Math.round(perceive(player.id, 'behavior', base));
  return {
    score,
    label: score >= 80 ? 'WZOROWE' : score >= 62 ? 'STABILNE' : score >= 44 ? 'RYZYKOWNE' : 'PROBLEMATYCZNE',
  };
};

const getReadiness = (player: Player, perceive: ReturnType<typeof makePerceiver>) => {
  const healthPenalty = player.health.status === HealthStatus.HEALTHY ? 0 : 42;
  const base = clamp(
    (player.condition ?? 100) * 0.48
      + (100 - (player.fatigueDebt ?? 0)) * 0.22
      + (player.morale ?? 60) * 0.14
      + player.overallRating * 0.16
      - healthPenalty,
    0,
    100,
  );
  const score = Math.round(perceive(player.id, 'readiness', base));
  return {
    score,
    label: score >= 80 ? 'GOTOWY' : score >= 62 ? 'BLISKO' : score >= 44 ? 'OSTROŻNIE' : 'NIEGOTOWY',
  };
};

const getPotentialLabel = (score: number): string => {
  if (score >= 84) return 'ELITARNY TALENT';
  if (score >= 72) return 'DUŻY POTENCJAŁ';
  if (score >= 60) return 'PROJEKT ROZWOJOWY';
  return 'DO OBSERWACJI';
};

const chooseFocus = (player: Player, perceive: ReturnType<typeof makePerceiver>): keyof PlayerAttributes => (
  POSITION_KEY_ATTRIBUTES[player.position]
    .map(attribute => ({
      attribute,
      need: 100 - perceive(player.id, `focus:${attribute}`, player.attributes[attribute]),
    }))
    .sort((left, right) => right.need - left.need)[0].attribute
);

const buildCandles = (
  player: Player,
  ratings: number[],
  perceive: ReturnType<typeof makePerceiver>,
): ReserveCoachCandle[] => {
  const averageRating = getAverageRating(player) ?? clamp(4 + (player.form ?? 50) * 0.045, 4.5, 8.5);
  const source = ratings.length > 0 ? ratings.slice(-6) : Array.from({ length: 6 }, (_, index) => (
    perceive(player.id, `estimated-rating:${index}`, averageRating, 4, 10)
  ));

  return source.map((rating, index) => {
    const previous = index > 0 ? source[index - 1] : averageRating;
    const wick = 0.18 + hashUnit(`${player.id}:wick:${index}`) * 0.28;
    return {
      label: `M${index + 1}`,
      open: round1(clamp(previous, 1, 10)),
      close: round1(clamp(rating, 1, 10)),
      high: round1(clamp(Math.max(previous, rating) + wick, 1, 10)),
      low: round1(clamp(Math.min(previous, rating) - wick, 1, 10)),
      estimated: ratings.length === 0,
    };
  });
};

const buildGrowthCurve = (
  player: Player,
  perceivedOverall: number,
  perceivedTalent: number,
  uncertaintyPercent: number,
): ReserveCoachGrowthPoint[] => {
  const ageFactor = player.age <= 18 ? 1 : player.age <= 20 ? 0.84 : player.age <= 22 ? 0.62 : 0.35;
  const gap = Math.max(0, perceivedTalent - perceivedOverall);
  return [0, 3, 6, 9, 12].map(month => {
    // A quadratic ease-out curve communicates the expected early gains and the
    // natural slowdown as the player approaches the coach's perceived ceiling.
    const progress = 1 - Math.pow(1 - month / 12, 2);
    const value = perceivedOverall + gap * ageFactor * 0.46 * progress;
    const band = Math.max(1.2, value * uncertaintyPercent / 100 * 0.35);
    return {
      month,
      value: round1(clamp(value, 1, 99)),
      low: round1(clamp(value - band, 1, 99)),
      high: round1(clamp(value + band, 1, 99)),
    };
  });
};

const getCareerDecision = (
  player: Player,
  potentialScore: number,
  readinessScore: number,
  behaviorScore: number,
): { decision: ReserveCoachCareerDecision; horizon: string } => {
  const stats = getMatchNumbers(player);
  if (behaviorScore < 42 || player.health.status !== HealthStatus.HEALTHY) {
    return { decision: 'PLAN NAPRAWCZY', horizon: '2–4 tygodnie' };
  }
  if (readinessScore >= 80 && player.overallRating >= 64) {
    return { decision: 'WŁĄCZYĆ DO I ZESPOŁU', horizon: 'najbliższe 1–3 mecze' };
  }
  if (player.age <= 20 && potentialScore >= 70) {
    return { decision: 'ROZWIJAĆ W REZERWACH', horizon: '3–6 miesięcy' };
  }
  if (player.age >= 20 && potentialScore >= 62 && stats.matches < 8) {
    return { decision: 'WYPOŻYCZYĆ', horizon: 'najbliższe okno' };
  }
  return { decision: 'OBSERWOWAĆ', horizon: 'kolejne 4 tygodnie' };
};

const buildNarrative = (
  player: Player,
  potentialScore: number,
  focusLabel: string,
  adaptationLabel: string,
  behaviorLabel: string,
  decision: ReserveCoachCareerDecision,
): { observation: string; recommendation: string } => {
  const stats = getMatchNumbers(player);
  const rating = getAverageRating(player);
  const evidence = stats.matches > 0
    ? `${stats.matches} meczów, ${stats.goals} goli, ${stats.assists} asyst i średnia ${rating?.toFixed(2) ?? '–'}`
    : 'brak wystarczającej próbki meczowej';
  return {
    observation: `Ocena potencjału ${Math.round(potentialScore)}/100. Materiał dowodowy: ${evidence}. Aklimatyzacja: ${adaptationLabel.toLowerCase()}, zachowanie: ${behaviorLabel.toLowerCase()}.`,
    recommendation: `${decision}. Priorytet indywidualny: ${focusLabel}. Ponowna ocena po czterech tygodniach lub po trzech pełnych występach.`,
  };
};

const buildPitchMarkers = (talents: ReserveCoachTalentAnalysis[]): ReserveCoachPitchMarker[] => {
  const counters: Record<PlayerPosition, number> = {
    [PlayerPosition.GK]: 0,
    [PlayerPosition.DEF]: 0,
    [PlayerPosition.MID]: 0,
    [PlayerPosition.FWD]: 0,
  };
  const xSlots: Record<PlayerPosition, number[]> = {
    [PlayerPosition.GK]: [50],
    [PlayerPosition.DEF]: [20, 40, 60, 80],
    [PlayerPosition.MID]: [22, 42, 62, 82],
    [PlayerPosition.FWD]: [34, 66, 50],
  };
  const ySlots: Record<PlayerPosition, number> = {
    [PlayerPosition.GK]: 88,
    [PlayerPosition.DEF]: 68,
    [PlayerPosition.MID]: 47,
    [PlayerPosition.FWD]: 23,
  };

  return talents.slice(0, 8).map(talent => {
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
      moveY: clamp(y - (position === PlayerPosition.GK ? 8 : 13), 8, 92),
      potentialScore: talent.potentialScore,
    };
  });
};

export const ReserveCoachAnalysisService = {
  createReport({ players, coach, currentDate, matchResults = [] }: ReserveCoachAnalysisInput): ReserveCoachAnalysisReport {
    const generatedForWeek = getWeekKey(currentDate);
    const coachQuality = getReserveCoachAnalysisQuality(coach);
    const uncertaintyPercent = getReserveCoachUncertainty(coachQuality);
    const perceive = makePerceiver(generatedForWeek, coachQuality, uncertaintyPercent);
    const recentRatings = getRecentRatingsByPlayer(matchResults);

    const talents = players.map(player => {
      const stats = getMatchNumbers(player);
      const averageRating = getAverageRating(player);
      const developmentTrend = getDevelopmentTrend(player);
      const perceivedOverall = Math.round(perceive(player.id, 'overall', player.overallRating, 1, 99));
      const perceivedTalent = Math.round(perceive(player.id, 'talent', player.attributes.talent, 1, 99));
      const ageBonus = player.age <= 17 ? 12 : player.age <= 19 ? 9 : player.age <= 21 ? 6 : player.age <= 23 ? 3 : 0;
      const performanceBonus = averageRating === null ? 0 : (averageRating - 6.5) * 5;
      const basePotential = clamp(
        perceivedTalent * 0.50
          + perceivedOverall * 0.28
          + ageBonus
          + developmentTrend * 1.25
          + performanceBonus,
        1,
        99,
      );
      const potentialScore = round1(perceive(player.id, 'potential', basePotential, 1, 99));
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
        career.decision,
      );
      const formBase = player.form ?? (averageRating === null ? 50 : clamp((averageRating - 4) / 5 * 100, 0, 100));

      return {
        player,
        perceivedOverall,
        perceivedTalent,
        potentialScore,
        potentialLabel: getPotentialLabel(potentialScore),
        developmentTrend,
        formScore: Math.round(perceive(player.id, 'form', formBase)),
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
          perceive,
        ),
        growthCurve: buildGrowthCurve(player, perceivedOverall, perceivedTalent, uncertaintyPercent),
        matchSample: stats.matches,
      };
    })
      .sort((left, right) => (
        right.potentialScore - left.potentialScore
          || right.perceivedTalent - left.perceivedTalent
          || left.player.age - right.player.age
      ))
      .slice(0, 8)
      .map(({ matchSample: _matchSample, ...talent }) => talent);

    const positionDistribution = players.reduce<Record<PlayerPosition, number>>((total, player) => {
      total[player.position] += 1;
      return total;
    }, {
      [PlayerPosition.GK]: 0,
      [PlayerPosition.DEF]: 0,
      [PlayerPosition.MID]: 0,
      [PlayerPosition.FWD]: 0,
    });
    const highPotential = talents.filter(talent => talent.potentialScore >= 72).length;
    const firstTeamReady = talents.filter(talent => talent.decision === 'WŁĄCZYĆ DO I ZESPOŁU').length;
    const interventionNeeded = talents.filter(talent => (
      talent.decision === 'PLAN NAPRAWCZY' || talent.behaviorScore < 45 || talent.readinessScore < 45
    )).length;
    const averageDevelopment = players.length > 0
      ? round1(players.reduce((sum, player) => sum + getDevelopmentTrend(player), 0) / players.length)
      : 0;
    const confidenceLabel = coachQuality >= 84
      ? 'BARDZO WYSOKA'
      : coachQuality >= 66
        ? 'WYSOKA'
        : coachQuality >= 44
          ? 'UMIARKOWANA'
          : 'NISKA';
    const executiveSummary = highPotential > 0
      ? `W kadrze wyróżnia się ${highPotential} zawodników o dużym lub elitarnym potencjale. ${firstTeamReady > 0 ? `${firstTeamReady} jest gotowych do kontrolowanej próby w pierwszym zespole.` : 'Najlepsi nadal potrzebują regularnego planu rozwoju.'}`
      : 'Nie widzę jeszcze talentu gotowego do szybkiego awansu. Priorytetem pozostają regularne minuty, specjalizacja treningowa i ponowna ocena za cztery tygodnie.';

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
        averageDevelopment,
      },
    };
  },
};
