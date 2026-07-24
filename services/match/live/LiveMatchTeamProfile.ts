import { Coach, Lineup, Player, PlayerAttributes, PlayerPosition, WeatherSnapshot } from '../../../types';
import { PlayerMoraleService } from '../../PlayerMoraleService';

export type LiveMatchSide = 'HOME' | 'AWAY';

export type LiveMatchAttributeAverages = Record<keyof PlayerAttributes, number>;

export type LiveMatchLineProfiles = {
  goalkeeper: number;
  defense: number;
  midfield: number;
  attack: number;
};

export type LiveMatchCoachProfile = {
  experience: number;
  decisionMaking: number;
  motivation: number;
  training: number;
  tacticalRead: number;
  manManagement: number;
};

export type LiveMatchWeatherProfile = {
  heatStress: number;
  rainDisruption: number;
  windDisruption: number;
  intensity: number;
  technicalDifficulty: number;
  staminaDrain: number;
};

export type LiveMatchTeamProfile = {
  side: LiveMatchSide;
  activePlayers: Player[];
  outfieldPlayers: Player[];
  attributeAverages: LiveMatchAttributeAverages;
  lineProfiles: LiveMatchLineProfiles;
  overallAverage: number;
  moraleAverage: number;
  moraleMultiplierAverage: number;
  fatigueAverage: number;
  freshShare: number;
  tiredShare: number;
  exhaustedShare: number;
  coach: LiveMatchCoachProfile;
  weather: LiveMatchWeatherProfile;
  readiness: number;
  attackingReadiness: number;
  defensiveReadiness: number;
  transitionReadiness: number;
  setPieceReadiness: number;
};

export type BuildLiveMatchTeamProfileParams = {
  side: LiveMatchSide;
  players: Player[];
  lineup: Lineup;
  fatigue: Record<string, number>;
  coach?: Coach | null;
  weather?: WeatherSnapshot | null;
  sentOffIds?: string[];
};

const PLAYER_ATTRIBUTE_KEYS: Array<keyof PlayerAttributes> = [
  'strength',
  'stamina',
  'pace',
  'defending',
  'passing',
  'attacking',
  'finishing',
  'technique',
  'vision',
  'dribbling',
  'heading',
  'positioning',
  'goalkeeping',
  'freeKicks',
  'talent',
  'penalties',
  'corners',
  'aggression',
  'crossing',
  'leadership',
  'mentality',
  'workRate',
];

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const average = (values: number[], fallback: number): number => {
  if (values.length === 0) return fallback;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const getActivePlayers = (
  players: Player[],
  lineup: Lineup,
  sentOffIds: string[] = []
): Player[] => {
  const sentOff = new Set(sentOffIds);
  return lineup.startingXI
    .map(id => (id ? players.find(player => player.id === id) : null))
    .filter((player): player is Player => !!player && !sentOff.has(player.id));
};

const getAverageAttributes = (activePlayers: Player[]): LiveMatchAttributeAverages => {
  return PLAYER_ATTRIBUTE_KEYS.reduce((result, key) => {
    result[key] = average(activePlayers.map(player => player.attributes[key] ?? 50), 50);
    return result;
  }, {} as LiveMatchAttributeAverages);
};

const getPositionAverage = (
  activePlayers: Player[],
  position: PlayerPosition,
  keys: Array<keyof PlayerAttributes>,
  fallback: number
): number => {
  const line = activePlayers.filter(player => player.position === position);
  if (line.length === 0) return fallback;
  return average(
    line.map(player => average(keys.map(key => player.attributes[key] ?? 50), fallback)),
    fallback
  );
};

const buildCoachProfile = (coach?: Coach | null): LiveMatchCoachProfile => {
  const experience = coach?.attributes.experience ?? 50;
  const decisionMaking = coach?.attributes.decisionMaking ?? 50;
  const motivation = coach?.attributes.motivation ?? 50;
  const training = coach?.attributes.training ?? 50;

  return {
    experience,
    decisionMaking,
    motivation,
    training,
    tacticalRead: decisionMaking * 0.52 + experience * 0.34 + training * 0.14,
    manManagement: motivation * 0.58 + experience * 0.24 + training * 0.18,
  };
};

const buildWeatherProfile = (weather?: WeatherSnapshot | null): LiveMatchWeatherProfile => {
  const heatStress = weather ? clamp((weather.tempC - 22) / 16, 0, 1) : 0;
  const rainDisruption = weather ? clamp((weather.precipitationChance - 35) / 65, 0, 1) : 0;
  const windDisruption = weather ? clamp((weather.windKmh - 18) / 42, 0, 1) : 0;
  const intensity = clamp(weather?.weatherIntensity ?? (heatStress * 0.38 + rainDisruption * 0.34 + windDisruption * 0.28), 0, 1);

  return {
    heatStress,
    rainDisruption,
    windDisruption,
    intensity,
    technicalDifficulty: clamp(rainDisruption * 0.52 + windDisruption * 0.38 + heatStress * 0.10, 0, 1),
    staminaDrain: clamp(heatStress * 0.50 + rainDisruption * 0.22 + windDisruption * 0.12 + intensity * 0.16, 0, 1),
  };
};

/**
 * Match engine migration note
 *
 * What this builder does:
 * It creates a single, explicit profile for one team in a live match. The profile includes every
 * player attribute currently available in PlayerAttributes, live fatigue, morale, positional line
 * strength, coach quality, and weather pressure. The output is pure data: it does not mutate match
 * state, does not roll random numbers, and does not change any event probability by itself.
 *
 * Why this exists:
 * MatchLiveView currently calculates many of these values inline inside the minute loop. That makes
 * the engine difficult to compare, tune, and test because the same real-world concept can be rebuilt
 * with slightly different weights in several places. Centralizing the inputs into a profile gives
 * the future engine a stable vocabulary: attackingReadiness, defensiveReadiness, transitionReadiness,
 * setPieceReadiness, fatigueAverage, moraleMultiplierAverage, weather.technicalDifficulty, and coach
 * tactical/man-management scores.
 *
 * How it should be connected:
 * The next migration phase should build HOME and AWAY profiles once per simulated minute and pass them
 * into smaller event calculators. Existing formulas should be replaced one at a time, with golden-match
 * tests checking that scorelines, shot volumes, cards, injuries, fatigue drain, and AI interventions stay
 * inside expected ranges. This module is intentionally additive now so the first step remains safe.
 *
 * What each major output means:
 * readiness is the broad "can this XI execute football actions right now" score. attackingReadiness
 * weights finishing, attacking, technique, vision, crossing, pace, morale, and fatigue. defensiveReadiness
 * weights defending, positioning, strength, heading, goalkeeping, morale, and fatigue. transitionReadiness
 * emphasizes stamina, work rate, pace, passing, mentality, and coach tactical read. setPieceReadiness
 * emphasizes free kicks, corners, penalties, heading, crossing, and the stabilizing effect of mentality.
 */
export const buildLiveMatchTeamProfile = ({
  side,
  players,
  lineup,
  fatigue,
  coach,
  weather,
  sentOffIds = [],
}: BuildLiveMatchTeamProfileParams): LiveMatchTeamProfile => {
  const activePlayers = getActivePlayers(players, lineup, sentOffIds);
  const outfieldPlayers = activePlayers.filter(player => player.position !== PlayerPosition.GK);
  const attributeAverages = getAverageAttributes(activePlayers);
  const fatigueValues = activePlayers.map(player => fatigue[player.id] ?? 100);
  const moraleValues = activePlayers.map(player => player.morale ?? 50);
  const moraleMultipliers = activePlayers.map(player => PlayerMoraleService.getMatchMultiplier(player));
  const fatigueAverage = average(fatigueValues, 100);
  const moraleMultiplierAverage = average(moraleMultipliers, 1);
  const coachProfile = buildCoachProfile(coach);
  const weatherProfile = buildWeatherProfile(weather);

  const lineProfiles: LiveMatchLineProfiles = {
    goalkeeper: getPositionAverage(activePlayers, PlayerPosition.GK, ['goalkeeping', 'positioning', 'mentality', 'strength'], attributeAverages.goalkeeping),
    defense: getPositionAverage(activePlayers, PlayerPosition.DEF, ['defending', 'positioning', 'heading', 'strength', 'mentality'], attributeAverages.defending),
    midfield: getPositionAverage(activePlayers, PlayerPosition.MID, ['passing', 'technique', 'vision', 'workRate', 'stamina'], attributeAverages.passing),
    attack: getPositionAverage(activePlayers, PlayerPosition.FWD, ['finishing', 'attacking', 'pace', 'dribbling', 'heading'], attributeAverages.attacking),
  };

  const fatigueExecution = clamp(fatigueAverage / 100, 0.35, 1.05);
  const moraleExecution = clamp(moraleMultiplierAverage, 0.72, 1.18);
  const weatherExecution = clamp(1 - weatherProfile.technicalDifficulty * 0.10 - weatherProfile.staminaDrain * 0.08, 0.82, 1);
  const coachExecution = clamp(0.94 + (coachProfile.tacticalRead - 50) / 900 + (coachProfile.manManagement - 50) / 1200, 0.88, 1.10);

  const attackingBase =
    attributeAverages.finishing * 0.18 +
    attributeAverages.attacking * 0.18 +
    attributeAverages.technique * 0.15 +
    attributeAverages.vision * 0.12 +
    attributeAverages.dribbling * 0.10 +
    attributeAverages.crossing * 0.09 +
    attributeAverages.pace * 0.08 +
    lineProfiles.attack * 0.10;

  const defensiveBase =
    attributeAverages.defending * 0.20 +
    attributeAverages.positioning * 0.18 +
    attributeAverages.strength * 0.11 +
    attributeAverages.heading * 0.10 +
    attributeAverages.mentality * 0.10 +
    lineProfiles.defense * 0.16 +
    lineProfiles.goalkeeper * 0.15;

  const transitionBase =
    attributeAverages.stamina * 0.16 +
    attributeAverages.workRate * 0.16 +
    attributeAverages.pace * 0.14 +
    attributeAverages.passing * 0.14 +
    attributeAverages.technique * 0.12 +
    attributeAverages.mentality * 0.12 +
    lineProfiles.midfield * 0.16;

  const setPieceBase =
    attributeAverages.freeKicks * 0.18 +
    attributeAverages.corners * 0.16 +
    attributeAverages.penalties * 0.14 +
    attributeAverages.heading * 0.14 +
    attributeAverages.crossing * 0.12 +
    attributeAverages.technique * 0.10 +
    attributeAverages.mentality * 0.08 +
    attributeAverages.leadership * 0.08;

  const executionMultiplier = fatigueExecution * moraleExecution * weatherExecution * coachExecution;

  return {
    side,
    activePlayers,
    outfieldPlayers,
    attributeAverages,
    lineProfiles,
    overallAverage: average(activePlayers.map(player => player.overallRating), 50),
    moraleAverage: average(moraleValues, 50),
    moraleMultiplierAverage,
    fatigueAverage,
    freshShare: activePlayers.length === 0 ? 0 : fatigueValues.filter(value => value >= 90).length / activePlayers.length,
    tiredShare: activePlayers.length === 0 ? 0 : fatigueValues.filter(value => value < 82).length / activePlayers.length,
    exhaustedShare: activePlayers.length === 0 ? 0 : fatigueValues.filter(value => value < 70).length / activePlayers.length,
    coach: coachProfile,
    weather: weatherProfile,
    readiness: clamp(average([attackingBase, defensiveBase, transitionBase, setPieceBase], 50) * executionMultiplier, 1, 99),
    attackingReadiness: clamp(attackingBase * executionMultiplier, 1, 99),
    defensiveReadiness: clamp(defensiveBase * executionMultiplier, 1, 99),
    transitionReadiness: clamp(transitionBase * executionMultiplier, 1, 99),
    setPieceReadiness: clamp(setPieceBase * executionMultiplier, 1, 99),
  };
};
