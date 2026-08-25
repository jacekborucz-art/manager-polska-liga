import {
  Club,
  HealthStatus,
  Lineup,
  MatchEventType,
  MatchHistoryEntry,
  Player,
  PlayerAttributes,
  PlayerPosition,
  StaffMember,
  Tactic,
  TrainingIntensity,
} from '../types';
import { TacticRepository } from '../resources/tactics_db';
import { LineupService } from './LineupService';
import { FinanceService } from './FinanceService';

const RECENT_FORM_SAMPLE = 5;
const TACTIC_INJURY_LIMIT_DAYS = 10;
const MIN_TACTIC_CONDITION = 60;
const TALENT_CARE_MIN_AGE = 16;
const TALENT_CARE_MAX_AGE = 21;
const TALENT_CARE_MIN_TALENT = 70;
const EXIT_CANDIDATE_MIN_SQUAD_SIZE = 21;
const HIGH_REPUTATION_TACTIC_THRESHOLD = 75;

const POSITION_EXIT_MINIMUMS: Record<PlayerPosition, number> = {
  [PlayerPosition.GK]: 2,
  [PlayerPosition.DEF]: 5,
  [PlayerPosition.MID]: 5,
  [PlayerPosition.FWD]: 3,
};

const POSITION_LABELS: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'bramce',
  [PlayerPosition.DEF]: 'obronie',
  [PlayerPosition.MID]: 'pomocy',
  [PlayerPosition.FWD]: 'ataku',
};

const POSITION_SHORT_LABELS: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'GK',
  [PlayerPosition.DEF]: 'DEF',
  [PlayerPosition.MID]: 'MID',
  [PlayerPosition.FWD]: 'FWD',
};

const POSITION_NAME_LABELS: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'bramkarz',
  [PlayerPosition.DEF]: 'obrońca',
  [PlayerPosition.MID]: 'pomocnik',
  [PlayerPosition.FWD]: 'napastnik',
};

const POSITION_GROUP_LABELS: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'Bramkarze',
  [PlayerPosition.DEF]: 'Obroncy',
  [PlayerPosition.MID]: 'Pomocnicy',
  [PlayerPosition.FWD]: 'Napastnicy',
};

const ATTRIBUTE_LABELS: Record<keyof PlayerAttributes, string> = {
  strength: 'sila',
  stamina: 'wydolnosc',
  pace: 'szybkosc',
  defending: 'obrona',
  passing: 'podanie',
  attacking: 'gra w ataku',
  finishing: 'wykonczenie',
  technique: 'technika',
  vision: 'wizja gry',
  dribbling: 'drybling',
  heading: 'gra glowa',
  positioning: 'ustawianie sie',
  goalkeeping: 'gra na bramce',
  freeKicks: 'stale fragmenty',
  talent: 'talent',
  penalties: 'rzuty karne',
  corners: 'rzuty rozne',
  aggression: 'agresja',
  crossing: 'dosrodkowania',
  leadership: 'przywodztwo',
  mentality: 'mentalnosc',
  workRate: 'pracowitosc',
};

const TECHNICAL_ATTRIBUTE_KEYS: Array<keyof PlayerAttributes> = [
  'technique',
  'passing',
  'vision',
  'dribbling',
  'crossing',
  'finishing',
];

const POSITION_TRAINING_KEYS: Record<PlayerPosition, Array<keyof PlayerAttributes>> = {
  [PlayerPosition.GK]: ['goalkeeping', 'positioning', 'passing', 'mentality'],
  [PlayerPosition.DEF]: ['defending', 'positioning', 'heading', 'strength', 'passing'],
  [PlayerPosition.MID]: ['passing', 'vision', 'technique', 'dribbling', 'workRate'],
  [PlayerPosition.FWD]: ['finishing', 'attacking', 'technique', 'pace', 'heading'],
};

export interface TeamAnalysisInsightPlayer {
  player: Player;
  score: number;
  label: string;
  reasons: string[];
  availabilityNote: string;
}

export interface TeamAnalysisExitCandidate {
  player: Player;
  probability: number;
  actionLabel: string;
  reasons: string[];
  squadNote: string;
}

export interface TeamAnalysisContractCase {
  player: Player;
  urgency: number;
  actionLabel: string;
  reasons: string[];
  contractNote: string;
}

export interface TeamAnalysisAnalystNote {
  id: string;
  player: Player;
  actionLabel: string;
  title: string;
  explanation: string;
}

export interface TeamAnalysisTalent {
  player: Player;
  score: number;
  developmentPath: string;
  reasons: string[];
  warning: string;
}

export interface TeamAnalysisTacticOption {
  tacticId: string;
  tacticName: string;
  score: number;
  healthyPoolUsed: number;
  missingSlots: number;
  lineStrength: Record<PlayerPosition, number>;
  reasons: string[];
  projectedXI: Array<{
    slotIndex: number;
    role: PlayerPosition;
    player: Player | null;
    score: number;
  }>;
}

export interface TeamAnalysisCommentary {
  styleId: string;
  styleName: string;
  styleRole: string;
  paragraphs: string[];
}

export interface TeamTrainingWeakness {
  attributeKey: keyof PlayerAttributes;
  label: string;
  average: number;
  note: string;
}

export interface TeamTrainingLineFocus {
  position: PlayerPosition;
  positionLabel: string;
  weaknesses: TeamTrainingWeakness[];
  coachNote: string;
}

export interface TeamTrainingAnalysis {
  teamTechniqueAverage: number;
  weakestTechnicalAreas: TeamTrainingWeakness[];
  lineFocuses: TeamTrainingLineFocus[];
  summary: string[];
}

export interface TeamAnalysisSpecialist {
  player: Player;
  score: number;
  reason: string;
}

export interface TeamAnalysisAssistantLeaders {
  penalties: TeamAnalysisSpecialist[];
  freeKicks: TeamAnalysisSpecialist[];
  captains: TeamAnalysisSpecialist[];
}

export interface TeamAnalysisPlayerConcern {
  player: Player;
  score: number;
  label: string;
  detail: string;
  action: string;
}

export interface TeamAnalysisFormRecord {
  tacticId: string;
  tacticName: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface TeamAnalysisForm {
  sampleSize: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  averageRating: number | null;
  pointsPerMatch: number;
  shotsFor: number;
  shotsAgainst: number;
  recentForm: Array<'W' | 'D' | 'L'>;
  tacticRecords: TeamAnalysisFormRecord[];
  insights: string[];
}

export interface TeamAnalysisReadiness {
  ready: number;
  caution: number;
  unavailable: number;
  averageCondition: number;
  averageFatigueDebt: number;
  concerns: TeamAnalysisPlayerConcern[];
  summary: string[];
}

export interface TeamAnalysisDressingRoom {
  averageMorale: number;
  averageAdaptation: number;
  settledPlayers: number;
  concerns: TeamAnalysisPlayerConcern[];
  summary: string[];
}

export interface TeamAnalysisDevelopment {
  activeTrainingName: string;
  intensityLabel: string;
  facilityLevel: number | null;
  averageGrowth: number;
  improvingPlayers: number;
  decliningPlayers: number;
  focusMismatches: TeamAnalysisPlayerConcern[];
  summary: string[];
}

export interface TeamAnalysisTacticalProfile {
  currentTacticId: string | null;
  currentTacticName: string;
  pressingFit: number;
  counterAttackFit: number;
  highLineFit: number;
  notes: string[];
}

export interface TeamAnalysisExecutiveSummary {
  strengths: string[];
  risks: string[];
  actions: string[];
}

export interface TeamAnalysisAssistantModel {
  assistantId: string | null;
  generatedForWeek: string;
  /** Internal-only observation quality. The UI deliberately does not display reliability. */
  qualityScore: number;
  /** Internal-only seeded error; even the best assistant keeps the required 5% floor. */
  uncertaintyPercent: number;
}

export interface TeamAnalysisInput {
  club: Club;
  players: Player[];
  currentDate: Date;
  assistant?: StaffMember | null;
  lineup?: Lineup | null;
  matchHistory?: MatchHistoryEntry[];
  activeTrainingName?: string | null;
  activeIntensity?: TrainingIntensity | null;
}

export interface TeamAnalysisReport {
  generatedAt: string;
  injuryRule: string;
  squadSize: number;
  squadAverageOverall: number;
  availableCounts: Record<PlayerPosition, number>;
  trainingAnalysis: TeamTrainingAnalysis;
  assistantLeaders: TeamAnalysisAssistantLeaders;
  keyPlayers: TeamAnalysisInsightPlayer[];
  exitCandidates: TeamAnalysisExitCandidate[];
  exitCandidatesNote: string | null;
  contractCases: TeamAnalysisContractCase[];
  analystNotes: TeamAnalysisAnalystNote[];
  talents: TeamAnalysisTalent[];
  tacticalRecommendation: TeamAnalysisTacticOption;
  alternativeTactics: TeamAnalysisTacticOption[];
  commentary: TeamAnalysisCommentary;
  assistantModel: TeamAnalysisAssistantModel;
  executiveSummary: TeamAnalysisExecutiveSummary;
  formAnalysis: TeamAnalysisForm;
  readinessAnalysis: TeamAnalysisReadiness;
  dressingRoomAnalysis: TeamAnalysisDressingRoom;
  developmentAnalysis: TeamAnalysisDevelopment;
  tacticalProfile: TeamAnalysisTacticalProfile;
}

type Placement = TeamAnalysisTacticOption['projectedXI'][number];

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
};

const seededUnit = (seed: string): number => {
  const x = Math.sin(hashString(seed) + 1) * 10000;
  return x - Math.floor(x);
};

const seededRange = (seed: string, min: number, max: number): number => min + seededUnit(seed) * (max - min);
const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
const average = (values: number[]): number => values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
const formatPlayerName = (player: Player): string => `${player.firstName} ${player.lastName}`;

const getWeekKey = (date: Date): string => {
  const monday = new Date(date);
  const weekday = monday.getDay() || 7;
  monday.setDate(monday.getDate() - weekday + 1);
  return monday.toISOString().slice(0, 10);
};

/**
 * Staff attributes use the 1-20 scale, while report quality uses 0-100. The
 * weighting mirrors the assistant's actual responsibilities: tactical reading
 * leads, but communication, motivation and dressing-room work remain meaningful.
 */
export const getTeamAssistantQuality = (assistant?: StaffMember | null): number => {
  if (!assistant) return 20;
  const attribute = (key: string, fallback = 8): number => assistant.attributes[key] ?? fallback;
  const weighted =
    attribute('offensiveTactics') * 0.18 +
    attribute('defensiveTactics') * 0.18 +
    attribute('opponentAnalysis') * 0.14 +
    attribute('motivation') * 0.14 +
    attribute('communication') * 0.13 +
    attribute('dressingRoom') * 0.10 +
    attribute('individualWork') * 0.07 +
    attribute('experience') * 0.06;
  return Math.round(clamp(weighted * 5, 0, 100));
};

export const getTeamAssistantUncertainty = (qualityScore: number): number =>
  Math.round(clamp(28 - qualityScore * 0.23, 5, 28));

type TeamPerceiver = (channel: string, value: number, min?: number, max?: number) => number;

const makeTeamPerceiver = (
  clubId: string,
  weekKey: string,
  assistantId: string,
  uncertaintyPercent: number,
): TeamPerceiver => (channel, value, min = 0, max = 100) => {
  const swing = seededUnit(`${clubId}:${weekKey}:${assistantId}:${channel}`) * 2 - 1;
  return clamp(value * (1 + swing * uncertaintyPercent / 100), min, max);
};

const joinLabels = (labels: string[]): string => {
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} i ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')} i ${labels[labels.length - 1]}`;
};

const getTalentAttributeProfile = (player: Player): { strongest: string[]; improvements: string[] } => {
  const relevantKeys = POSITION_TRAINING_KEYS[player.position];
  const rankedAttributes = relevantKeys
    .map(attributeKey => ({
      key: attributeKey,
      label: ATTRIBUTE_LABELS[attributeKey],
      value: player.attributes[attributeKey] || 0,
    }))
    .sort((a, b) => b.value - a.value);

  const strongest = rankedAttributes.slice(0, 2).map(entry => entry.label);
  const improvementCandidates = [...rankedAttributes]
    .sort((a, b) => a.value - b.value)
    .slice(0, 2)
    .map(entry => entry.label);

  return {
    strongest,
    improvements: improvementCandidates,
  };
};

const getAttributeAverage = (players: Player[], attributeKey: keyof PlayerAttributes): number =>
  players.length === 0 ? 0 : average(players.map(player => player.attributes[attributeKey] || 0));

const getTrainingNote = (attributeKey: keyof PlayerAttributes): string => {
  switch (attributeKey) {
    case 'passing':
      return 'Na treningach trzeba poprawic podanie i tempo gry pilka.';
    case 'technique':
      return 'Na treningach trzeba poprawic technike i jakosc gry pilka.';
    case 'vision':
      return 'Na treningach trzeba poprawic wybór podan i przeglad pola.';
    case 'dribbling':
      return 'Na treningach trzeba poprawic prowadzenie pilki i gre 1 na 1.';
    case 'crossing':
      return 'Na treningach trzeba poprawic dosrodkowania.';
    case 'finishing':
      return 'Na treningach trzeba poprawic wykonczenie akcji.';
    case 'defending':
      return 'Na treningach trzeba poprawic odbior i krycie.';
    case 'positioning':
      return 'Na treningach trzeba poprawic ustawianie sie.';
    case 'strength':
      return 'Na treningach trzeba poprawic sile i pojedynki.';
    case 'stamina':
      return 'Na treningach trzeba poprawic wydolnosc.';
    case 'pace':
      return 'Na treningach trzeba poprawic szybkosc i dynamike.';
    case 'goalkeeping':
      return 'Na treningach bramkarskich trzeba poprawic interwencje i pewnosc w bramce.';
    case 'heading':
      return 'Na treningach trzeba poprawic gre glowa.';
    case 'attacking':
      return 'Na treningach trzeba poprawic ruch bez pilki i zachowanie w polu karnym.';
    case 'workRate':
      return 'Na treningach trzeba poprawic prace bez pilki.';
    case 'mentality':
      return 'Na treningach trzeba zwrocic uwage na koncentracje i reakcje w trudnych momentach.';
    default:
      return 'Na treningach trzeba poprawic ten element.';
  }
};

const formatContractLabel = (daysLeft: number): string => {
  if (daysLeft <= 30) return 'Temu zawodnikowi zaraz kończy się umowa.';
  if (daysLeft <= 120) return 'Temu zawodnikowi niedługo kończy się umowa.';
  if (daysLeft <= 365) return 'Temu zawodnikowi kończy się umowa w tym sezonie.';
  return 'Obecnie nie ma problemu z jego kontraktem.';
};

const getRecentAverageRating = (player: Player): number | null => {
  const recent = player.stats.ratingHistory?.slice(-RECENT_FORM_SAMPLE) ?? [];
  return recent.length > 0 ? average(recent) : null;
};

const getFormScore = (player: Player): number => {
  const avgRating = getRecentAverageRating(player);
  if (avgRating !== null) return (avgRating - 6.5) * 10;

  const gp = Math.max(1, player.stats.matchesPlayed);
  const rawContribution = player.position === PlayerPosition.FWD
    ? player.stats.goals / gp
    : player.position === PlayerPosition.MID
      ? (player.stats.goals + player.stats.assists) / gp
      : player.stats.cleanSheets / gp;

  return (player.overallRating - 68) * 0.7 + rawContribution * 10;
};

const getContributionScore = (player: Player): number => {
  const gp = Math.max(1, player.stats.matchesPlayed);
  switch (player.position) {
    case PlayerPosition.GK:
      return (player.stats.cleanSheets / gp) * 16;
    case PlayerPosition.DEF:
      return (player.stats.cleanSheets / gp) * 12 + (player.stats.assists / gp) * 6;
    case PlayerPosition.MID:
      return ((player.stats.goals + player.stats.assists) / gp) * 16;
    case PlayerPosition.FWD:
      return (player.stats.goals / gp) * 20 + (player.stats.assists / gp) * 7;
    default:
      return 0;
  }
};

const getInjuryDays = (player: Player): number =>
  player.health.status === HealthStatus.INJURED ? (player.health.injury?.daysRemaining ?? 0) : 0;

const canBeUsedForTactic = (player: Player): boolean => {
  if ((player.suspensionMatches || 0) > 0) return false;
  if (player.condition < MIN_TACTIC_CONDITION) return false;
  return getInjuryDays(player) <= TACTIC_INJURY_LIMIT_DAYS;
};

const getContractDaysLeft = (player: Player, currentDate: Date): number =>
  Math.floor((new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 86_400_000);

const buildAvailabilityNote = (player: Player): string => {
  if ((player.suspensionMatches || 0) > 0) return `zawieszony na ${player.suspensionMatches} mecz(e)`;

  const injuryDays = getInjuryDays(player);
  if (injuryDays > 0) {
    return injuryDays > TACTIC_INJURY_LIMIT_DAYS
      ? `długo niedostępny (${injuryDays} dni)`
      : `uraz do opanowania (${injuryDays} dni)`;
  }

  if (player.condition < MIN_TACTIC_CONDITION) {
    return `przemęczony (${Math.round(player.condition)}% kondycji)`;
  }

  return 'gotowy do regularnej gry';
};

const getSlotScore = (player: Player, role: PlayerPosition): number => {
  const fitScore = LineupService.calculateFitScore(player, role) / 4;
  const formScore = getFormScore(player);
  const contribution = getContributionScore(player);
  const conditionBonus = (player.condition - 70) * 0.28;
  const injuryPenalty = getInjuryDays(player) * 0.9;
  const sameRoleBonus = player.position === role ? 9 : -12;
  const talentBonus = Math.max(0, player.attributes.talent - 68) * 0.12;

  return player.overallRating * 0.82 + fitScore * 0.55 + formScore + contribution + conditionBonus + sameRoleBonus + talentBonus - injuryPenalty;
};

const getGoalkeeperCoreScore = (player: Player): number =>
  player.attributes.goalkeeping * 0.52 +
  player.attributes.positioning * 0.18 +
  player.attributes.mentality * 0.14 +
  player.attributes.passing * 0.09 +
  player.attributes.leadership * 0.07;

const getExitEvaluationScore = (player: Player): number => {
  const formAverage = getRecentAverageRating(player);
  const gp = Math.max(1, player.stats.matchesPlayed);

  if (player.position === PlayerPosition.GK) {
    return (
      getGoalkeeperCoreScore(player) +
      (formAverage !== null ? (formAverage - 6.5) * 7 : 0) +
      (player.stats.cleanSheets / gp) * 10 +
      (player.condition - 70) * 0.12
    );
  }

  return (
    player.overallRating * 0.82 +
    getFormScore(player) * 0.35 +
    getContributionScore(player) * 0.25 +
    (player.condition - 70) * 0.12
  );
};

const getGoalkeeperWeaknessLabels = (player: Player): string[] =>
  (['goalkeeping', 'positioning', 'mentality', 'passing'] as Array<keyof PlayerAttributes>)
    .map(attributeKey => ({
      attributeKey,
      label: ATTRIBUTE_LABELS[attributeKey],
      value: player.attributes[attributeKey] || 0,
    }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 2)
    .map(entry => entry.label);

const buildWeakPlayersSummary = (entries: TeamAnalysisExitCandidate[]): string => {
  const names = joinNames(entries.slice(0, 3).map(entry => entry.player));

  if (entries.length === 0) {
    return 'Na dziś nie widzę jednego wyraźnie słabego zawodnika, którego trzeba od razu odsunąć.';
  }

  if (entries.length === 1) {
    return `Uważam, że ${names} jest dziś słabszy od innych na swojej pozycji.`;
  }

  return `Uważam, że ${names} są dziś słabsi od innych na swoich pozycjach.`;
};

const pickProjectedLineup = (players: Player[], tactic: Tactic): Placement[] => {
  const eligiblePlayers = players.filter(canBeUsedForTactic);
  const usedIds = new Set<string>();

  return tactic.slots.map(slot => {
    const candidate = [...eligiblePlayers]
      .filter(player => !usedIds.has(player.id))
      .sort((a, b) => getSlotScore(b, slot.role) - getSlotScore(a, slot.role))[0] ?? null;

    if (candidate) usedIds.add(candidate.id);

    return {
      slotIndex: slot.index,
      role: slot.role,
      player: candidate,
      score: candidate ? getSlotScore(candidate, slot.role) : -45,
    };
  });
};

const getLineStrengthFromPlacement = (placement: Placement[]): Record<PlayerPosition, number> => {
  const result: Record<PlayerPosition, number> = {
    [PlayerPosition.GK]: 0,
    [PlayerPosition.DEF]: 0,
    [PlayerPosition.MID]: 0,
    [PlayerPosition.FWD]: 0,
  };

  (Object.keys(result) as PlayerPosition[]).forEach(position => {
    const lineScores = placement.filter(entry => entry.role === position && entry.player).map(entry => entry.score);
    result[position] = lineScores.length > 0 ? Math.round(average(lineScores)) : 0;
  });

  return result;
};

const buildTacticReasons = (
  tactic: Tactic,
  placement: Placement[],
  availableCounts: Record<PlayerPosition, number>
): string[] => {
  const tacticDemand = tactic.slots.reduce<Record<PlayerPosition, number>>((acc, slot) => {
    acc[slot.role] += 1;
    return acc;
  }, {
    [PlayerPosition.GK]: 0,
    [PlayerPosition.DEF]: 0,
    [PlayerPosition.MID]: 0,
    [PlayerPosition.FWD]: 0,
  });

  const shortages = (Object.keys(tacticDemand) as PlayerPosition[])
    .map(position => ({ position, diff: availableCounts[position] - tacticDemand[position] }))
    .sort((a, b) => b.diff - a.diff);

  const strongestFit = shortages[0];
  const secondFit = shortages[1];
  const missingSlots = placement.filter(entry => !entry.player).length;

  return [
    `Układ ${tactic.name} najlepiej pasuje do liczby dostępnych graczy w ${POSITION_LABELS[strongestFit.position]}.`,
    `W tym ustawieniu łatwiej wykorzystać zawodników z ${POSITION_LABELS[secondFit.position]}.`,
    missingSlots === 0
      ? 'Da się wystawić pełną jedenastkę bez przesuwania zawodników na siłę.'
      : `W tym ustawieniu nadal brakuje obsady na ${missingSlots} pozycji.`,
  ];
};

const getTacticProfileStrength = (players: Player[], position: PlayerPosition): number => {
  const positionPlayers = players
    .filter(player => player.position === position)
    .sort((a, b) => getSlotScore(b, position) - getSlotScore(a, position))
    .slice(0, position === PlayerPosition.GK ? 1 : position === PlayerPosition.FWD ? 3 : 4);

  return positionPlayers.length > 0 ? average(positionPlayers.map(player => getSlotScore(player, position))) : 0;
};

const getTacticStyleAdjustment = (
  club: Club,
  tactic: Tactic,
  strengths: Record<PlayerPosition, number>
): number => {
  if (tactic.id === '4-2-4') return -1000;
  if (club.reputation >= HIGH_REPUTATION_TACTIC_THRESHOLD && tactic.id === '6-3-1') return -1000;

  if (club.reputation < HIGH_REPUTATION_TACTIC_THRESHOLD) return 0;

  const controlProfile = strengths[PlayerPosition.DEF] >= strengths[PlayerPosition.FWD] + 5
    && strengths[PlayerPosition.MID] >= strengths[PlayerPosition.FWD] + 3
    && strengths[PlayerPosition.DEF] >= 72
    && strengths[PlayerPosition.MID] >= 72;

  if (tactic.attackBias >= 85) return -180;
  if (tactic.category === 'Offensive' || tactic.attackBias >= 65) return 18;
  if (tactic.category === 'Neutral' || (tactic.attackBias >= 45 && tactic.attackBias < 65)) return 10;
  if (tactic.category === 'Defensive' || tactic.attackBias < 45) return controlProfile ? -4 : -22;

  return 0;
};

const analyzeTactics = (club: Club, players: Player[]): {
  best: TeamAnalysisTacticOption;
  alternatives: TeamAnalysisTacticOption[];
  availableCounts: Record<PlayerPosition, number>;
} => {
  const eligiblePlayers = players.filter(canBeUsedForTactic);
  const availableCounts = eligiblePlayers.reduce<Record<PlayerPosition, number>>((acc, player) => {
    acc[player.position] += 1;
    return acc;
  }, {
    [PlayerPosition.GK]: 0,
    [PlayerPosition.DEF]: 0,
    [PlayerPosition.MID]: 0,
    [PlayerPosition.FWD]: 0,
  });

  const strengths = {
    [PlayerPosition.GK]: getTacticProfileStrength(eligiblePlayers, PlayerPosition.GK),
    [PlayerPosition.DEF]: getTacticProfileStrength(eligiblePlayers, PlayerPosition.DEF),
    [PlayerPosition.MID]: getTacticProfileStrength(eligiblePlayers, PlayerPosition.MID),
    [PlayerPosition.FWD]: getTacticProfileStrength(eligiblePlayers, PlayerPosition.FWD),
  };

  const scoredTactics = TacticRepository.getAll().filter(tactic => tactic.id !== '4-2-4').map(tactic => {
    const projectedXI = pickProjectedLineup(players, tactic);
    const missingSlots = projectedXI.filter(entry => !entry.player).length;
    const lineStrength = getLineStrengthFromPlacement(projectedXI);
    const healthyPoolUsed = projectedXI.filter(entry => !!entry.player).length;
    const rawScore = projectedXI.reduce((sum, entry) => sum + entry.score, 0);
    const styleAdjustment = getTacticStyleAdjustment(club, tactic, strengths);
    const score = Math.round(rawScore + healthyPoolUsed * 2.5 - missingSlots * 42 + styleAdjustment);

    return {
      tacticId: tactic.id,
      tacticName: tactic.name,
      score,
      healthyPoolUsed,
      missingSlots,
      lineStrength,
      reasons: buildTacticReasons(tactic, projectedXI, availableCounts),
      projectedXI,
    } satisfies TeamAnalysisTacticOption;
  }).sort((a, b) => b.score - a.score);

  return { best: scoredTactics[0], alternatives: scoredTactics.slice(1, 4), availableCounts };
};

const analyzeKeyPlayers = (players: Player[]): TeamAnalysisInsightPlayer[] => {
  const byPosition = players.reduce<Record<PlayerPosition, Player[]>>((acc, player) => {
    acc[player.position].push(player);
    return acc;
  }, {
    [PlayerPosition.GK]: [],
    [PlayerPosition.DEF]: [],
    [PlayerPosition.MID]: [],
    [PlayerPosition.FWD]: [],
  });

  return [...players]
    .sort((a, b) => {
      const scoreA = a.overallRating * 0.74 + getFormScore(a) + getContributionScore(a) + a.attributes.leadership * 0.14 - getInjuryDays(a) * 0.35;
      const scoreB = b.overallRating * 0.74 + getFormScore(b) + getContributionScore(b) + b.attributes.leadership * 0.14 - getInjuryDays(b) * 0.35;
      return scoreB - scoreA;
    })
    .slice(0, 5)
    .map(player => {
      const peers = [...byPosition[player.position]].sort((a, b) => b.overallRating - a.overallRating);
      const rankInPosition = peers.findIndex(candidate => candidate.id === player.id) + 1;
      const formAverage = getRecentAverageRating(player);

      return {
        player,
        score: Math.round(player.overallRating * 0.74 + getFormScore(player) + getContributionScore(player)),
        label: rankInPosition === 1 ? 'Filar drużyny' : rankInPosition === 2 ? 'Mocne ogniwo' : 'Ważny element',
        reasons: [
          rankInPosition === 1
            ? `To obecnie najlepszy ${POSITION_NAME_LABELS[player.position]} w klubie.`
            : `Jest w ścisłej czołówce klubowej na pozycji ${POSITION_SHORT_LABELS[player.position]}.`,
          formAverage !== null && formAverage >= 7
            ? `Trzyma wysoką formę meczową na poziomie ${formAverage.toFixed(1)}.`
            : 'Daje stabilny wkład nawet bez idealnej serii ocen.',
          getContributionScore(player) >= 8
            ? 'Statystyki meczowe realnie podnoszą jego wpływ na wynik zespołu.'
            : 'Jest ważny głównie przez jakość gry i swoją rolę w zespole.',
        ],
        availabilityNote: buildAvailabilityNote(player),
      };
    });
};

const analyzeExitCandidates = (
  players: Player[],
  club: Club,
  tacticalRecommendation: TeamAnalysisTacticOption,
  squadAverageOverall: number
): { candidates: TeamAnalysisExitCandidate[]; note: string | null } => {
  if (players.length < EXIT_CANDIDATE_MIN_SQUAD_SIZE) {
    return {
      candidates: [],
      note: `Nasza kadra liczy tylko ${players.length} zawodnikow. Warto uzupelnic kilka pozycji, bo przy wiekszej liczbie kontuzji albo kartek mozemy miec powazne problemy kadrowe.`,
    };
  }

  const positionGroups = players.reduce<Record<PlayerPosition, Player[]>>((acc, player) => {
    acc[player.position].push(player);
    return acc;
  }, {
    [PlayerPosition.GK]: [],
    [PlayerPosition.DEF]: [],
    [PlayerPosition.MID]: [],
    [PlayerPosition.FWD]: [],
  });

  (Object.keys(positionGroups) as PlayerPosition[]).forEach(position => {
    positionGroups[position].sort((a, b) => {
      const scoreA = getExitEvaluationScore(a);
      const scoreB = getExitEvaluationScore(b);
      return scoreB - scoreA;
    });
  });

  const requiredByBestTactic = tacticalRecommendation.projectedXI.reduce<Record<PlayerPosition, number>>((acc, slot) => {
    acc[slot.role] += 1;
    return acc;
  }, {
    [PlayerPosition.GK]: 0,
    [PlayerPosition.DEF]: 0,
    [PlayerPosition.MID]: 0,
    [PlayerPosition.FWD]: 0,
  });

  const currentPositionCounts = players.reduce<Record<PlayerPosition, number>>((acc, player) => {
    acc[player.position] += 1;
    return acc;
  }, {
    [PlayerPosition.GK]: 0,
    [PlayerPosition.DEF]: 0,
    [PlayerPosition.MID]: 0,
    [PlayerPosition.FWD]: 0,
  });

  const maxCandidates = players.length <= 23 ? 1 : players.length <= 26 ? 2 : 3;

  const rankedCandidates = players
    .filter(player => !player.isUntouchable)
    .map(player => {
      const positionRank = positionGroups[player.position].findIndex(candidate => candidate.id === player.id) + 1;
      const formAverage = getRecentAverageRating(player);
      const gp = Math.max(1, player.stats.matchesPlayed);
      const playerPositionGroup = positionGroups[player.position];
      const positionAverageScore = average(playerPositionGroup.map(getExitEvaluationScore));
      const positionQualityGap = clamp((positionAverageScore - getExitEvaluationScore(player)) * 1.25, 0, 16);
      const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
      const salaryPressure = player.annualSalary > 0
        ? ((player.annualSalary - fairSalary) / Math.max(1, fairSalary)) * 25
        : 0;

      const isLikelySurplus = positionRank > Math.max(2, requiredByBestTactic[player.position] + 1);
      const weakFormPenalty = formAverage !== null ? clamp((6.25 - formAverage) * 18, 0, 20) : 4;
      const weakOutputPenalty = player.position === PlayerPosition.GK
        ? clamp((0.24 - (player.stats.cleanSheets / gp)) * 55, 0, 16)
        : player.position === PlayerPosition.FWD
        ? clamp((0.16 - (player.stats.goals / gp)) * 70, 0, 18)
        : player.position === PlayerPosition.MID
          ? clamp((0.20 - ((player.stats.goals + player.stats.assists) / gp)) * 65, 0, 18)
          : 0;
      const goalkeeperAttributePenalty = player.position === PlayerPosition.GK
        ? clamp((67 - getGoalkeeperCoreScore(player)) * 1.35, 0, 24)
        : 0;
      const hasDevelopmentUpside = player.age <= 23 && player.attributes.talent >= player.overallRating + 4;
      const weakLevelSignal = positionQualityGap >= 8 || player.overallRating < squadAverageOverall - 5 || goalkeeperAttributePenalty >= 8;
      const weakFormSignal = (formAverage !== null && formAverage < 6.2) || weakOutputPenalty >= 8;
      const noPlanSignal = isLikelySurplus || salaryPressure >= 8 || (player.age >= 29 && player.attributes.talent <= 62);
      const signalCount = [weakLevelSignal, weakFormSignal, noPlanSignal].filter(Boolean).length;
      const probability = Math.round(clamp(
        18 +
        positionQualityGap +
        weakFormPenalty +
        weakOutputPenalty +
        goalkeeperAttributePenalty +
        (isLikelySurplus ? 18 : 0) +
        (player.age >= 29 && player.attributes.talent <= 62 ? 10 : 0) +
        (getInjuryDays(player) > 20 ? 8 : 0) +
        (player.overallRating < squadAverageOverall - 5 ? 10 : 0) +
        salaryPressure +
        seededRange(`${club.id}_${player.id}_exit`, -7, 7),
        8,
        94
      ));

      const reasons: string[] = [];
      if (isLikelySurplus) reasons.push(`Jest dopiero numerem ${positionRank} na swojej pozycji.`);
      if (formAverage !== null && formAverage < 6.2) reasons.push(`Forma z ostatnich meczów spadła do ${formAverage.toFixed(1)}.`);
      if (weakOutputPenalty >= 8) {
        reasons.push(player.position === PlayerPosition.GK
          ? 'Na bramce daje dziś za mało czystych kont i pewności.'
          : 'Liczby meczowe są poniżej oczekiwań dla tej roli.'
        );
      }
      if (player.position === PlayerPosition.GK && goalkeeperAttributePenalty >= 8) {
        reasons.push(`U bramkarza najsłabiej wyglądają dziś ${joinLabels(getGoalkeeperWeaknessLabels(player))}.`);
      }
      if (positionQualityGap >= 8) reasons.push('Na swojej pozycji odstaje dziś od reszty drużyny.');
      if (salaryPressure >= 8) reasons.push('Pensja jest wysoka w porównaniu z obecnym wkładem w grę.');
      if (reasons.length === 0) reasons.push('To zawodnik na granicy składu i trzeba podjąć wobec niego decyzję.');

      let actionLabel = 'Zostaw jako rezerwowego';
      let squadNote = 'Na dziś wygląda na słabszego od podstawowych zawodników.';

      if (hasDevelopmentUpside && player.stats.minutesPlayed < 900) {
        actionLabel = 'Daj trening indywidualny';
        squadNote = 'Ma jeszcze potencjał, więc lepiej go rozwijać niż od razu skreślać.';
      } else if (hasDevelopmentUpside && player.age <= 21) {
        actionLabel = 'Wypożycz';
        squadNote = 'Potrzebuje regularnej gry poza pierwszym składem.';
      } else if (probability >= 76) {
        actionLabel = 'Wystawmy go na listę transferową';
        squadNote = 'Uważam, że jest słabszy od innych i nie daje dziś wystarczająco dużo zespołowi.';
      } else if (probability >= 62) {
        actionLabel = 'Spróbuj sprzedać';
        squadNote = 'Jeśli pojawi się oferta, można spokojnie rozważyć sprzedaż.';
      }

      return {
        player,
        probability,
        actionLabel,
        reasons,
        squadNote,
        signalCount,
      };
    })
    .sort((a, b) => b.probability - a.probability)
    .filter(entry => entry.probability >= 50 && entry.signalCount >= 2);

  const remainingCounts = { ...currentPositionCounts };
  const pickedCandidates: TeamAnalysisExitCandidate[] = [];

  rankedCandidates.forEach(entry => {
    if (pickedCandidates.length >= maxCandidates) return;

    const minForPosition = Math.max(POSITION_EXIT_MINIMUMS[entry.player.position], requiredByBestTactic[entry.player.position] + 1);
    if (remainingCounts[entry.player.position] - 1 < minForPosition) return;
    if (players.length - pickedCandidates.length - 1 < EXIT_CANDIDATE_MIN_SQUAD_SIZE) return;

    remainingCounts[entry.player.position] -= 1;
    pickedCandidates.push({
      player: entry.player,
      probability: entry.probability,
      actionLabel: entry.actionLabel,
      reasons: entry.reasons,
      squadNote: entry.squadNote,
    });
  });

  return {
    candidates: pickedCandidates,
    note: pickedCandidates.length === 0
      ? 'Na teraz nie widze zawodnika, ktorego mozna bezpiecznie oddac bez oslabiania kadry.'
      : null,
  };
};

const analyzeContractCases = (
  players: Player[],
  currentDate: Date,
  squadAverageOverall: number
): TeamAnalysisContractCase[] => {
  return players
    .map(player => {
      const daysLeft = getContractDaysLeft(player, currentDate);
      const interestedCount = player.interestedClubs?.length || 0;
      const isImportantPlayer = player.overallRating >= squadAverageOverall + 3;
      const isTooGoodForClub = player.overallRating >= squadAverageOverall + 6;

      if (daysLeft > 540 && interestedCount === 0) return null;

      const urgency = Math.round(clamp(
        (daysLeft <= 90 ? 48 : daysLeft <= 180 ? 34 : daysLeft <= 365 ? 22 : 10) +
        (isImportantPlayer ? 16 : 0) +
        (isTooGoodForClub ? 12 : 0) +
        interestedCount * 8,
        10,
        95
      ));

      let actionLabel = 'Obecnie nie ma problemu z kontraktem';
      if (daysLeft <= 180 && isImportantPlayer) {
        actionLabel = 'Daj mu nowy kontrakt';
      } else if (daysLeft <= 365 && isTooGoodForClub) {
        actionLabel = 'Daj mu nowy kontrakt albo go sprzedaj';
      } else if (daysLeft <= 180) {
        actionLabel = 'Trzeba podjąć decyzję';
      } else if (interestedCount > 0) {
        actionLabel = 'Jeśli nie damy mu nowego kontraktu, może odejść';
      }

      const reasons: string[] = [];
      if (daysLeft <= 90) reasons.push('Temu zawodnikowi bardzo szybko kończy się umowa.');
      else if (daysLeft <= 180) reasons.push('Temu zawodnikowi niedługo kończy się umowa.');
      else if (daysLeft <= 365) reasons.push('Temu zawodnikowi kończy się umowa w tym sezonie.');

      if (isImportantPlayer) reasons.push('To ważny zawodnik dla obecnego składu.');
      if (isTooGoodForClub) reasons.push('To bardzo dobry zawodnik jak na obecny poziom drużyny.');
      if (interestedCount > 0) reasons.push(`Interesuje się nim już ${interestedCount} klub(y).`);

      return {
        player,
        urgency,
        actionLabel,
        reasons,
        contractNote: formatContractLabel(daysLeft),
      } satisfies TeamAnalysisContractCase;
    })
    .filter(Boolean)
    .sort((a, b) => (b as TeamAnalysisContractCase).urgency - (a as TeamAnalysisContractCase).urgency)
    .slice(0, 5) as TeamAnalysisContractCase[];
};

const analyzeTalents = (players: Player[], currentDate: Date, squadAverageOverall: number): TeamAnalysisTalent[] => {
  const youngPlayers = players.filter(player => player.age >= TALENT_CARE_MIN_AGE && player.age <= TALENT_CARE_MAX_AGE);
  const highTalentYoungPlayers = youngPlayers.filter(player => player.attributes.talent > TALENT_CARE_MIN_TALENT);
  const fallbackYoungPlayers = [...youngPlayers].sort((a, b) => {
    if (b.attributes.talent !== a.attributes.talent) return b.attributes.talent - a.attributes.talent;
    if (a.age !== b.age) return a.age - b.age;
    return b.overallRating - a.overallRating;
  });
  const emergencyFallbackPlayers = [...players].sort((a, b) => {
    if (a.age !== b.age) return a.age - b.age;
    if (b.attributes.talent !== a.attributes.talent) return b.attributes.talent - a.attributes.talent;
    return b.overallRating - a.overallRating;
  });

  const selectedPlayers = highTalentYoungPlayers.length > 0
    ? highTalentYoungPlayers
    : fallbackYoungPlayers.length > 0
      ? fallbackYoungPlayers
      : emergencyFallbackPlayers;

  return selectedPlayers
    .map(player => {
      const formAverage = getRecentAverageRating(player);
      const minutesFactor = clamp(player.stats.minutesPlayed / 900, 0, 1.4);
      const upside = Math.max(0, player.attributes.talent - player.overallRating);
      const contractDays = getContractDaysLeft(player, currentDate);
      const attributeProfile = getTalentAttributeProfile(player);
      const score = Math.round(
        player.attributes.talent * 0.95 +
        upside * 2.4 +
        (TALENT_CARE_MAX_AGE + 1 - Math.min(player.age, TALENT_CARE_MAX_AGE + 1)) * 4 +
        (formAverage ?? 6.4) * 3 +
        minutesFactor * 8
      );

      let developmentPath = 'Dawać regularne minuty z ławki i chronić obciążenia.';
      if (player.age <= 19 && player.stats.minutesPlayed < 500) {
        developmentPath = 'Wprowadzać etapami: końcówki, puchary i spokojny plan treningowy.';
      } else if (player.overallRating >= squadAverageOverall - 3) {
        developmentPath = 'Jest gotowy do regularnej rotacji z pierwszym składem.';
      } else if (player.age <= 21 && player.stats.minutesPlayed < 700) {
        developmentPath = 'Rozważyć wypożyczenie, jeśli w klubie nie dostanie regularnych minut.';
      }

      return {
        player,
        score,
        developmentPath,
        reasons: [
          player.attributes.talent > TALENT_CARE_MIN_TALENT
            ? `To jeden z najbardziej utalentowanych młodych zawodników w obecnej kadrze.`
            : `To jeden z młodszych zawodników, którym warto się przyjrzeć w obecnej kadrze.`,
          `Na swojej pozycji najmocniej wyglądają u niego ${joinLabels(attributeProfile.strongest)}.`,
          `Żeby wejść poziom wyżej, powinien poprawić ${joinLabels(attributeProfile.improvements)}.`,
          formAverage !== null
            ? `Ostatnie oceny (${formAverage.toFixed(1)}) są dobrym sygnałem na dziś.`
            : 'Ma jeszcze mało ocen meczowych, więc trzeba go dalej obserwować.',
          player.stats.minutesPlayed >= 900
            ? 'Już gra regularnie, więc można dalej spokojnie dawać mu minuty.'
            : 'Potrzebuje planu minut, żeby nie stać w miejscu.',
        ],
        warning: contractDays <= 540
          ? 'Jeśli nie damy mu nowego kontraktu, może odejść.'
          : player.condition < 65
            ? 'Nie warto go teraz przeciążać, bo kondycja może zahamować rozwój.'
            : 'Największy problem to zbyt mała liczba minut.',
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

const analyzeTraining = (players: Player[]): TeamTrainingAnalysis => {
  const outfieldPlayers = players.filter(player => player.position !== PlayerPosition.GK);
  const teamTechniqueAverage = Math.round(getAttributeAverage(outfieldPlayers, 'technique') * 10) / 10;

  const weakestTechnicalAreas = TECHNICAL_ATTRIBUTE_KEYS
    .map(attributeKey => ({
      attributeKey,
      label: ATTRIBUTE_LABELS[attributeKey],
      average: Math.round(getAttributeAverage(outfieldPlayers, attributeKey) * 10) / 10,
      note: getTrainingNote(attributeKey),
    }))
    .sort((a, b) => a.average - b.average)
    .slice(0, 3);

  const lineFocuses = (Object.values(PlayerPosition) as PlayerPosition[]).map(position => {
    const linePlayers = players.filter(player => player.position === position);
    const weaknesses = POSITION_TRAINING_KEYS[position]
      .map(attributeKey => ({
        attributeKey,
        label: ATTRIBUTE_LABELS[attributeKey],
        average: Math.round(getAttributeAverage(linePlayers, attributeKey) * 10) / 10,
        note: getTrainingNote(attributeKey),
      }))
      .sort((a, b) => a.average - b.average)
      .slice(0, 2);

    const coachNote = weaknesses.length > 0
      ? `${POSITION_GROUP_LABELS[position]} najslabiej wygladaja dzis w elemencie: ${weaknesses.map(entry => entry.label).join(' i ')}.`
      : `${POSITION_GROUP_LABELS[position]} nie wymagaja osobnej uwagi.`;

    return {
      position,
      positionLabel: POSITION_GROUP_LABELS[position],
      weaknesses,
      coachNote,
    };
  });

  const teamWeaknessText = weakestTechnicalAreas.length > 0
    ? `Patrząc na całą drużynę, najsłabiej wyglądają dziś ${joinLabels(weakestTechnicalAreas.slice(0, 2).map(area => area.label))}.`
    : 'Patrząc na całą drużynę, nie widać dziś jednego dużego problemu technicznego.';

  const mainTrainingText = weakestTechnicalAreas[0]
    ? `Na treningach w pierwszej kolejności poprawiłbym ${weakestTechnicalAreas[0].label}.`
    : 'Na treningach utrzymałbym obecny kierunek pracy.';

  const lineSummaryText = lineFocuses
    .map(line => {
      const weaknessLabels = joinLabels(line.weaknesses.slice(0, 2).map(weakness => weakness.label));
      if (!weaknessLabels) {
        return `${line.positionLabel} wyglądają dziś równo i nie mają jednego wyraźnego braku.`;
      }

      return `${line.positionLabel} najsłabiej wyglądają dziś w elemencie ${weaknessLabels}.`;
    })
    .join(' ');

  const summary = [
    `${teamWeaknessText} ${mainTrainingText} Osobno zwróciłbym uwagę na poszczególne formacje. ${lineSummaryText}`,
  ];

  return {
    teamTechniqueAverage,
    weakestTechnicalAreas,
    lineFocuses,
    summary,
  };
};

const getPenaltySpecialistScore = (player: Player): number => {
  const formAverage = getRecentAverageRating(player) ?? 6.4;
  const formBonus = (formAverage - 6.0) * 6;

  return (
    player.attributes.penalties * 0.42 +
    player.attributes.finishing * 0.2 +
    player.attributes.technique * 0.14 +
    player.attributes.mentality * 0.1 +
    player.attributes.attacking * 0.05 +
    player.attributes.leadership * 0.03 +
    player.overallRating * 0.05 +
    formBonus +
    player.condition * 0.03 -
    getInjuryDays(player) * 0.45
  );
};

const getFreeKickSpecialistScore = (player: Player): number => {
  const formAverage = getRecentAverageRating(player) ?? 6.4;
  const formBonus = (formAverage - 6.0) * 6;

  return (
    player.attributes.freeKicks * 0.42 +
    player.attributes.technique * 0.16 +
    player.attributes.passing * 0.13 +
    player.attributes.vision * 0.1 +
    player.attributes.crossing * 0.08 +
    player.attributes.attacking * 0.05 +
    player.overallRating * 0.05 +
    formBonus +
    player.condition * 0.03 -
    getInjuryDays(player) * 0.4
  );
};

const getCaptainCandidateScore = (player: Player): number => {
  const formAverage = getRecentAverageRating(player) ?? 6.4;
  const formBonus = (formAverage - 6.0) * 5;
  const matchReadiness = Math.min(player.stats.matchesPlayed, 34) / 34;

  return (
    player.attributes.leadership * 0.42 +
    player.attributes.mentality * 0.18 +
    player.attributes.workRate * 0.12 +
    player.overallRating * 0.12 +
    player.attributes.positioning * 0.04 +
    player.age * 0.16 +
    matchReadiness * 8 +
    formBonus +
    player.condition * 0.03 -
    getInjuryDays(player) * 0.45
  );
};

const getTopNamedAttributes = (
  entries: Array<{ label: string; value: number }>,
  limit = 2
): string[] => [...entries].sort((a, b) => b.value - a.value).slice(0, limit).map(entry => entry.label);

const buildPenaltyReason = (player: Player, rank: number): string => {
  const strongest = getTopNamedAttributes([
    { label: 'rzuty karne', value: player.attributes.penalties },
    { label: 'wykonczenie', value: player.attributes.finishing },
    { label: 'technike', value: player.attributes.technique },
    { label: 'mentalnosc', value: player.attributes.mentality },
  ]);

  if (rank === 0) {
    return `Na dzisiaj to pierwszy wybor do karnych. Najlepiej laczy ${joinLabels(strongest)}.`;
  }

  if (rank === 1) {
    return `Jesli pierwszy wykonawca nie bedzie gral, to od razu patrzylbym na niego. Ma dobre ${joinLabels(strongest)}.`;
  }

  return `To sensowna trzecia opcja do karnych. Dalej ma atuty w takich elementach jak ${joinLabels(strongest)}.`;
};

const buildFreeKickReason = (player: Player, rank: number): string => {
  const strongest = getTopNamedAttributes([
    { label: 'stale fragmenty', value: player.attributes.freeKicks },
    { label: 'technike', value: player.attributes.technique },
    { label: 'podanie', value: player.attributes.passing },
    { label: 'wizje gry', value: player.attributes.vision },
    { label: 'dosrodkowania', value: player.attributes.crossing },
  ]);

  if (rank === 0) {
    return `To moim zdaniem najlepszy wykonawca wolnych w tej kadrze. Wyroznia sie przez ${joinLabels(strongest)}.`;
  }

  if (rank === 1) {
    return `To dobra druga opcja do wolnych. Dobrze laczy ${joinLabels(strongest)}.`;
  }

  return `Jako trzeci wybor tez sie broni. W jego przypadku widac ${joinLabels(strongest)}.`;
};

const buildCaptainReason = (player: Player, rank: number): string => {
  const strongest = getTopNamedAttributes([
    { label: 'przywodztwo', value: player.attributes.leadership },
    { label: 'mentalnosc', value: player.attributes.mentality },
    { label: 'pracowitosc', value: player.attributes.workRate },
    { label: 'ustawianie sie', value: player.attributes.positioning },
  ]);

  if (rank === 0) {
    return `Jesli szukamy kapitana, to od niego bym zaczal. Ma mocne ${joinLabels(strongest)} i wyglada na naturalnego lidera.`;
  }

  if (rank === 1) {
    return `To bardzo dobra druga opcja na opaske. Wyróznia go ${joinLabels(strongest)}.`;
  }

  return `To kandydat, ktorego tez warto miec pod uwaga przy wyborze kapitana. Pomagaja mu ${joinLabels(strongest)}.`;
};

const analyzeAssistantLeaders = (players: Player[]): TeamAnalysisAssistantLeaders => {
  const availablePlayers = players.filter(player => (player.suspensionMatches || 0) === 0);
  const specialistPool = availablePlayers.length > 0 ? availablePlayers : players;

  const penalties = [...specialistPool]
    .sort((a, b) => getPenaltySpecialistScore(b) - getPenaltySpecialistScore(a))
    .slice(0, 3)
    .map((player, index) => ({
      player,
      score: Math.round(getPenaltySpecialistScore(player)),
      reason: buildPenaltyReason(player, index),
    }));

  const freeKicks = [...specialistPool]
    .sort((a, b) => getFreeKickSpecialistScore(b) - getFreeKickSpecialistScore(a))
    .slice(0, 3)
    .map((player, index) => ({
      player,
      score: Math.round(getFreeKickSpecialistScore(player)),
      reason: buildFreeKickReason(player, index),
    }));

  const captains = [...specialistPool]
    .sort((a, b) => getCaptainCandidateScore(b) - getCaptainCandidateScore(a))
    .slice(0, 3)
    .map((player, index) => ({
      player,
      score: Math.round(getCaptainCandidateScore(player)),
      reason: buildCaptainReason(player, index),
    }));

  return {
    penalties,
    freeKicks,
    captains,
  };
};

const perceiveAndSortSpecialists = (
  entries: TeamAnalysisSpecialist[],
  channel: string,
  perceive: TeamPerceiver,
): TeamAnalysisSpecialist[] => entries
  .map(entry => ({
    ...entry,
    score: Math.round(perceive(`${channel}:${entry.player.id}`, entry.score, 1, 100)),
  }))
  .sort((left, right) => right.score - left.score);

/**
 * Factual values (goals, dates, salaries and injuries) are never changed by RNG.
 * Only conclusions which belong to the assistant are perceived and reordered.
 * This keeps the simulation honest while allowing staff quality to matter.
 */
const applyAssistantPerception = (
  report: {
    tactics: TeamAnalysisTacticOption[];
    keyPlayers: TeamAnalysisInsightPlayer[];
    exitCandidates: TeamAnalysisExitCandidate[];
    contractCases: TeamAnalysisContractCase[];
    talents: TeamAnalysisTalent[];
    assistantLeaders: TeamAnalysisAssistantLeaders;
  },
  perceive: TeamPerceiver,
) => {
  const tactics = report.tactics
    .map(option => ({
      ...option,
      score: Math.round(perceive(`tactic:${option.tacticId}`, option.score, 0, 10_000)),
    }))
    .sort((left, right) => right.score - left.score);

  return {
    tactics,
    keyPlayers: report.keyPlayers
      .map(entry => ({
        ...entry,
        score: Math.round(perceive(`key:${entry.player.id}`, entry.score, 1, 100)),
      }))
      .sort((left, right) => right.score - left.score),
    exitCandidates: report.exitCandidates
      .map(entry => ({
        ...entry,
        probability: Math.round(perceive(`exit:${entry.player.id}`, entry.probability, 5, 95)),
      }))
      .sort((left, right) => right.probability - left.probability),
    contractCases: report.contractCases
      .map(entry => ({
        ...entry,
        urgency: Math.round(perceive(`contract:${entry.player.id}`, entry.urgency, 5, 95)),
      }))
      .sort((left, right) => right.urgency - left.urgency),
    talents: report.talents
      .map(entry => ({
        ...entry,
        score: Math.round(perceive(`talent:${entry.player.id}`, entry.score, 1, 160)),
      }))
      .sort((left, right) => right.score - left.score),
    assistantLeaders: {
      penalties: perceiveAndSortSpecialists(report.assistantLeaders.penalties, 'penalties', perceive),
      freeKicks: perceiveAndSortSpecialists(report.assistantLeaders.freeKicks, 'free-kicks', perceive),
      captains: perceiveAndSortSpecialists(report.assistantLeaders.captains, 'captains', perceive),
    },
  };
};

const analyzeRecentForm = (
  club: Club,
  matches: MatchHistoryEntry[],
  currentDate: Date,
): TeamAnalysisForm => {
  const recentMatches = matches
    .filter(match => (
      (match.homeTeamId === club.id || match.awayTeamId === club.id) &&
      new Date(match.date).getTime() <= currentDate.getTime()
    ))
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 10)
    .reverse();

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let cleanSheets = 0;
  let shotsFor = 0;
  let shotsAgainst = 0;
  const ratings: number[] = [];
  const recentForm: Array<'W' | 'D' | 'L'> = [];
  const tacticMap = new Map<string, TeamAnalysisFormRecord>();

  recentMatches.forEach(match => {
    const isHome = match.homeTeamId === club.id;
    const ownGoals = isHome ? match.homeScore : match.awayScore;
    const opponentGoals = isHome ? match.awayScore : match.homeScore;
    const result: 'W' | 'D' | 'L' = ownGoals > opponentGoals ? 'W' : ownGoals === opponentGoals ? 'D' : 'L';
    if (result === 'W') wins += 1;
    else if (result === 'D') draws += 1;
    else losses += 1;
    recentForm.push(result);
    goalsFor += ownGoals;
    goalsAgainst += opponentGoals;
    if (opponentGoals === 0) cleanSheets += 1;

    const ownSide = isHome ? 'HOME' : 'AWAY';
    const shotTypes = new Set([
      MatchEventType.SHOT,
      MatchEventType.SHOT_ON_TARGET,
      MatchEventType.SHOT_POST,
      MatchEventType.SHOT_BAR,
      MatchEventType.ONE_ON_ONE_MISS,
      MatchEventType.ONE_ON_ONE_SAVE,
    ]);
    (match.timeline ?? []).forEach(event => {
      if (!shotTypes.has(event.type as MatchEventType)) return;
      if (event.teamSide === ownSide) shotsFor += 1;
      else shotsAgainst += 1;
    });

    const ownLineup = (isHome ? match.homeLineup : match.awayLineup) ?? [];
    ownLineup.forEach(playerId => {
      const rating = match.ratings?.[playerId];
      if (Number.isFinite(rating)) ratings.push(rating!);
    });

    const tacticId = (isHome ? match.homeStartingTacticId : match.awayStartingTacticId)
      ?? (isHome ? match.homeTacticId : match.awayTacticId)
      ?? 'UNKNOWN';
    const existing = tacticMap.get(tacticId) ?? {
      tacticId,
      tacticName: TacticRepository.getById(tacticId)?.name ?? 'Brak danych',
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    };
    existing.matches += 1;
    existing.goalsFor += ownGoals;
    existing.goalsAgainst += opponentGoals;
    if (result === 'W') existing.wins += 1;
    else if (result === 'D') existing.draws += 1;
    else existing.losses += 1;
    tacticMap.set(tacticId, existing);
  });

  const sampleSize = recentMatches.length;
  const pointsPerMatch = sampleSize > 0 ? Math.round(((wins * 3 + draws) / sampleSize) * 100) / 100 : 0;
  const insights: string[] = [];
  if (sampleSize === 0) {
    insights.push('Brakuje jeszcze rozegranych spotkań, dlatego forma zespołu nie może zostać oceniona.');
  } else {
    insights.push(`Ostatnie ${sampleSize} spotkań dało ${wins} zwycięstw, ${draws} remisów i ${losses} porażek.`);
    insights.push(goalsFor > goalsAgainst
      ? `Bilans bramek ${goalsFor}:${goalsAgainst} potwierdza przewagę zespołu w analizowanym okresie.`
      : `Bilans bramek ${goalsFor}:${goalsAgainst} pokazuje, że zespół traci co najmniej tyle, ile strzela.`);
    if (shotsFor + shotsAgainst > 0) {
      insights.push(`Z zapisanych zdarzeń meczowych wynika ${shotsFor} prób zespołu przy ${shotsAgainst} próbach rywali.`);
    }
  }

  return {
    sampleSize,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    cleanSheets,
    averageRating: ratings.length > 0 ? Math.round(average(ratings) * 100) / 100 : null,
    pointsPerMatch,
    shotsFor,
    shotsAgainst,
    recentForm,
    tacticRecords: [...tacticMap.values()].sort((left, right) => right.matches - left.matches),
    insights,
  };
};

const analyzeReadiness = (players: Player[], perceive: TeamPerceiver): TeamAnalysisReadiness => {
  let ready = 0;
  let caution = 0;
  let unavailable = 0;

  const concerns = players.map(player => {
    const injuryDays = getInjuryDays(player);
    const isUnavailable = (player.suspensionMatches ?? 0) > 0 || injuryDays > TACTIC_INJURY_LIMIT_DAYS;
    const needsCaution = !isUnavailable && (
      injuryDays > 0 || player.condition < 75 || (player.fatigueDebt ?? 0) >= 28
    );
    if (isUnavailable) unavailable += 1;
    else if (needsCaution) caution += 1;
    else ready += 1;

    const rawRisk = clamp(
      (100 - player.condition) * 0.6 +
      (player.fatigueDebt ?? 0) * 0.8 +
      injuryDays * 1.8 +
      (player.suspensionMatches ?? 0) * 35,
      0,
      100,
    );
    if (rawRisk < 24) return null;

    const detail = (player.suspensionMatches ?? 0) > 0
      ? `Zawieszenie na ${player.suspensionMatches} mecz(e).`
      : injuryDays > 0
        ? `Uraz: ${injuryDays} dni, kondycja ${Math.round(player.condition)}%.`
        : `Kondycja ${Math.round(player.condition)}%, dług zmęczenia ${Math.round(player.fatigueDebt ?? 0)}.`;
    return {
      player,
      score: Math.round(perceive(`readiness:${player.id}`, rawRisk)),
      label: isUnavailable ? 'Niedostępny' : 'Ryzyko przeciążenia',
      detail,
      action: isUnavailable ? 'Przygotuj zastępstwo' : 'Ogranicz minuty lub zastosuj rotację',
    } satisfies TeamAnalysisPlayerConcern;
  }).filter(Boolean) as TeamAnalysisPlayerConcern[];

  const averageCondition = players.length > 0 ? Math.round(average(players.map(player => player.condition))) : 0;
  const averageFatigueDebt = players.length > 0
    ? Math.round(average(players.map(player => player.fatigueDebt ?? 0)) * 10) / 10
    : 0;

  return {
    ready,
    caution,
    unavailable,
    averageCondition,
    averageFatigueDebt,
    concerns: concerns.sort((left, right) => right.score - left.score).slice(0, 6),
    summary: [
      `${ready} zawodników jest gotowych, ${caution} wymaga ostrożności, a ${unavailable} jest niedostępnych.`,
      averageFatigueDebt >= 28
        ? 'Obciążenie zespołu jest wysokie i przed kolejnym meczem potrzebna jest rotacja lub regeneracja.'
        : 'Ogólne obciążenie kadry pozwala utrzymać normalny rytm pracy.',
    ],
  };
};

const analyzeDressingRoom = (players: Player[], perceive: TeamPerceiver): TeamAnalysisDressingRoom => {
  const moraleValues = players.map(player => player.morale ?? 70);
  const adaptationValues = players.map(player => player.clubAdaptation?.level ?? 100);
  const concerns = players.map(player => {
    const mindset = player.playerMindset;
    const morale = player.morale ?? 70;
    const adaptation = player.clubAdaptation?.level ?? 100;
    const conflict = mindset?.conflictLevel ?? 0;
    const transferOpenness = mindset?.transferOpenness ?? 0;
    const playingTime = mindset?.playingTimeSatisfaction ?? 70;
    const roleClarity = mindset?.roleClarity ?? 70;
    const belonging = mindset?.squadBelonging ?? 70;
    const rawRisk = clamp(
      (60 - morale) * 0.8 +
      (65 - adaptation) * 0.35 +
      conflict * 0.65 +
      transferOpenness * 0.25 +
      (55 - playingTime) * 0.35 +
      (55 - roleClarity) * 0.25 +
      (55 - belonging) * 0.2,
      0,
      100,
    );
    if (rawRisk < 22) return null;

    const causes: string[] = [];
    if (morale < 55) causes.push('niskie morale');
    if (adaptation < 60) causes.push('trwająca aklimatyzacja');
    if (playingTime < 50) causes.push('niezadowolenie z minut');
    if (roleClarity < 50) causes.push('niejasna rola');
    if (conflict >= 35) causes.push('narastający konflikt');
    if (transferOpenness >= 60) causes.push('otwartość na odejście');

    return {
      player,
      score: Math.round(perceive(`dressing:${player.id}`, rawRisk)),
      label: conflict >= 50 ? 'Pilna rozmowa' : 'Obserwuj sytuację',
      detail: causes.length > 0 ? `Sygnały: ${causes.join(', ')}.` : 'Zawodnik wysyła kilka słabszych sygnałów dotyczących swojej sytuacji.',
      action: playingTime < 50 ? 'Wyjaśnij rolę i plan minut' : 'Przeprowadź rozmowę indywidualną',
    } satisfies TeamAnalysisPlayerConcern;
  }).filter(Boolean) as TeamAnalysisPlayerConcern[];

  const averageMorale = moraleValues.length > 0 ? Math.round(average(moraleValues)) : 0;
  const averageAdaptation = adaptationValues.length > 0 ? Math.round(average(adaptationValues)) : 0;
  const settledPlayers = players.filter(player => (
    (player.morale ?? 70) >= 60 &&
    (player.clubAdaptation?.level ?? 100) >= 65 &&
    (player.playerMindset?.conflictLevel ?? 0) < 35
  )).length;

  return {
    averageMorale,
    averageAdaptation,
    settledPlayers,
    concerns: concerns.sort((left, right) => right.score - left.score).slice(0, 6),
    summary: [
      `Średnie morale wynosi ${averageMorale}/100, a średnia aklimatyzacja ${averageAdaptation}/100.`,
      concerns.length > 0
        ? `${concerns.length} zawodników wymaga obserwacji albo rozmowy dotyczącej roli, minut lub sytuacji w klubie.`
        : 'Nie widać obecnie poważnego napięcia w szatni.',
    ],
  };
};

const getPlayerDevelopmentTrend = (player: Player): number => {
  const important = POSITION_TRAINING_KEYS[player.position];
  const changes = player.stats.seasonalChanges ?? {};
  return Math.round(important.reduce((sum, key) => sum + (changes[key] ?? 0), 0) * 10) / 10;
};

const analyzeDevelopment = (
  club: Club,
  players: Player[],
  activeTrainingName: string | null | undefined,
  activeIntensity: TrainingIntensity | null | undefined,
  perceive: TeamPerceiver,
): TeamAnalysisDevelopment => {
  const trends = players.map(player => getPlayerDevelopmentTrend(player));
  const intensityLabel = activeIntensity === TrainingIntensity.HEAVY
    ? 'Wysoka'
    : activeIntensity === TrainingIntensity.LIGHT
      ? 'Lekka'
      : 'Normalna';

  const focusMismatches = players.map(player => {
    const focus = player.trainingFocus;
    const expected = POSITION_TRAINING_KEYS[player.position];
    const developmentTrend = getPlayerDevelopmentTrend(player);
    const youngWithoutFocus = player.age <= 21 && !focus;
    const unrelatedFocus = !!focus && !expected.includes(focus);
    const overload = activeIntensity === TrainingIntensity.HEAVY && (
      player.condition < 72 || (player.fatigueDebt ?? 0) >= 30
    );
    if (!youngWithoutFocus && !unrelatedFocus && !overload && developmentTrend >= 0) return null;

    const rawRisk = clamp(
      (youngWithoutFocus ? 38 : 0) +
      (unrelatedFocus ? 32 : 0) +
      (overload ? 42 : 0) +
      (developmentTrend < 0 ? Math.abs(developmentTrend) * 9 : 0),
      0,
      100,
    );
    const detail = overload
      ? `Wysokie obciążenie przy kondycji ${Math.round(player.condition)}% i długu zmęczenia ${Math.round(player.fatigueDebt ?? 0)}.`
      : youngWithoutFocus
        ? 'Młody zawodnik nie ma ustawionego indywidualnego celu treningowego.'
        : unrelatedFocus
          ? `Cel „${focus ? ATTRIBUTE_LABELS[focus] : 'brak'}” słabo odpowiada jego podstawowej pozycji.`
          : `Rozwój kluczowych atrybutów wynosi ${developmentTrend}.`;
    return {
      player,
      score: Math.round(perceive(`development:${player.id}`, rawRisk)),
      label: overload ? 'Ryzyko przeciążenia' : 'Plan do korekty',
      detail,
      action: overload ? 'Zmniejsz intensywność lub zaplanuj regenerację' : 'Ustaw właściwy cel indywidualny',
    } satisfies TeamAnalysisPlayerConcern;
  }).filter(Boolean) as TeamAnalysisPlayerConcern[];

  const averageGrowth = trends.length > 0 ? Math.round(average(trends) * 10) / 10 : 0;
  return {
    activeTrainingName: activeTrainingName ?? 'Brak wybranego cyklu',
    intensityLabel,
    facilityLevel: club.trainingFacilityLevel ?? null,
    averageGrowth,
    improvingPlayers: trends.filter(value => value > 0).length,
    decliningPlayers: trends.filter(value => value < 0).length,
    focusMismatches: focusMismatches.sort((left, right) => right.score - left.score).slice(0, 6),
    summary: [
      `Aktywny plan: ${activeTrainingName ?? 'brak wybranego cyklu'}, intensywność: ${intensityLabel.toLowerCase()}.`,
      averageGrowth > 0
        ? `Kluczowe atrybuty rosną średnio o ${averageGrowth}; ${trends.filter(value => value > 0).length} zawodników zanotowało postęp.`
        : 'Na razie nie widać wyraźnego wzrostu kluczowych atrybutów całej kadry.',
    ],
  };
};

const analyzeTacticalProfile = (
  players: Player[],
  lineup: Lineup | null | undefined,
  recommendation: TeamAnalysisTacticOption,
  perceive: TeamPerceiver,
): TeamAnalysisTacticalProfile => {
  const starters = lineup
    ? lineup.startingXI.map(id => players.find(player => player.id === id)).filter(Boolean) as Player[]
    : recommendation.projectedXI.map(slot => slot.player).filter(Boolean) as Player[];
  const sample = starters.length > 0 ? starters : [...players].sort((a, b) => b.overallRating - a.overallRating).slice(0, 11);
  const defenders = sample.filter(player => player.position === PlayerPosition.DEF);
  const pressingRaw = average(sample.map(player => average([
    player.attributes.stamina,
    player.attributes.workRate,
    player.attributes.pace,
    player.attributes.mentality,
  ])));
  const counterRaw = average(sample.map(player => average([
    player.attributes.pace,
    player.attributes.attacking,
    player.attributes.passing,
    player.attributes.vision,
  ])));
  const highLineRaw = defenders.length > 0 ? average(defenders.map(player => average([
    player.attributes.pace,
    player.attributes.positioning,
    player.attributes.defending,
  ]))) : 0;
  const pressingFit = Math.round(perceive('profile:pressing', pressingRaw, 1, 99));
  const counterAttackFit = Math.round(perceive('profile:counter', counterRaw, 1, 99));
  const highLineFit = Math.round(perceive('profile:high-line', highLineRaw, 1, 99));
  const currentTactic = lineup ? TacticRepository.getById(lineup.tacticId) : null;
  const notes = [
    pressingFit >= 70
      ? 'Kadra ma wytrzymałość i pracowitość potrzebną do regularnego pressingu.'
      : 'Stały wysoki pressing może zbyt szybko obciążać obecną jedenastkę.',
    counterAttackFit >= 70
      ? 'Szybkość, wizja i jakość podań pozwalają skutecznie grać z kontrataku.'
      : 'Kontratak nie powinien być jedynym planem, ponieważ przejście do ataku nie daje wyraźnej przewagi.',
    highLineFit >= 68
      ? 'Obrońcy mają profil pozwalający bezpieczniej ustawiać linię wyżej.'
      : 'Wysoka linia obrony zwiększa ryzyko podań za plecy defensorów.',
    currentTactic && currentTactic.id !== recommendation.tacticId
      ? `Aktualne ustawienie ${currentTactic.name} warto porównać z rekomendowanym ${recommendation.tacticName}.`
      : `Aktualne ustawienie jest zgodne z rekomendacją: ${recommendation.tacticName}.`,
  ];

  return {
    currentTacticId: lineup?.tacticId ?? null,
    currentTacticName: currentTactic?.name ?? 'Brak zapisanego ustawienia',
    pressingFit,
    counterAttackFit,
    highLineFit,
    notes,
  };
};

const buildExecutiveSummary = (
  report: {
    form: TeamAnalysisForm;
    readiness: TeamAnalysisReadiness;
    dressingRoom: TeamAnalysisDressingRoom;
    development: TeamAnalysisDevelopment;
    tactical: TeamAnalysisTacticalProfile;
    tactic: TeamAnalysisTacticOption;
    contracts: TeamAnalysisContractCase[];
  },
): TeamAnalysisExecutiveSummary => {
  const strengths = [
    report.form.sampleSize > 0 && report.form.pointsPerMatch >= 1.8
      ? `Forma zespołu daje ${report.form.pointsPerMatch} pkt na mecz w analizowanym okresie.`
      : null,
    report.tactical.pressingFit >= 70 ? 'Profil podstawowej jedenastki dobrze wspiera pressing.' : null,
    report.tactical.counterAttackFit >= 70 ? 'Kadra ma dobre warunki do szybkiego kontrataku.' : null,
    report.dressingRoom.averageMorale >= 68 ? 'Morale i stabilność szatni są obecnie atutem.' : null,
    report.readiness.ready >= 18 ? 'Większość kadry jest gotowa do gry.' : null,
  ].filter(Boolean) as string[];

  const risks = [
    report.readiness.unavailable > 0 ? `${report.readiness.unavailable} zawodników jest obecnie niedostępnych.` : null,
    report.readiness.averageFatigueDebt >= 28 ? 'Narasta zmęczenie wymagające rotacji.' : null,
    report.dressingRoom.concerns[0] ? `${formatPlayerName(report.dressingRoom.concerns[0].player)} wymaga uwagi w szatni.` : null,
    report.tactical.highLineFit < 60 ? 'Wysoka linia obrony jest ryzykowna dla obecnego profilu defensorów.' : null,
    report.form.sampleSize > 0 && report.form.goalsAgainst > report.form.goalsFor ? 'Ostatni bilans bramek wskazuje problem z równowagą zespołu.' : null,
  ].filter(Boolean) as string[];

  const actions = [
    report.readiness.concerns[0]
      ? `${report.readiness.concerns[0].action}: ${formatPlayerName(report.readiness.concerns[0].player)}.`
      : `Utrzymaj podstawę ustawienia ${report.tactic.tacticName}.`,
    report.dressingRoom.concerns[0]
      ? `${report.dressingRoom.concerns[0].action}: ${formatPlayerName(report.dressingRoom.concerns[0].player)}.`
      : 'Utrzymaj obecny porządek ról w szatni.',
    report.development.focusMismatches[0]
      ? `${report.development.focusMismatches[0].action}: ${formatPlayerName(report.development.focusMismatches[0].player)}.`
      : report.contracts[0]
        ? `${report.contracts[0].actionLabel}: ${formatPlayerName(report.contracts[0].player)}.`
        : 'Kontynuuj aktywny plan treningowy i ocenę po kolejnych meczach.',
  ];

  return {
    strengths: strengths.slice(0, 3).length > 0 ? strengths.slice(0, 3) : ['Najmocniejsze ogniwa kadry pozwalają zbudować pełną podstawową jedenastkę.'],
    risks: risks.slice(0, 3).length > 0 ? risks.slice(0, 3) : ['Brak pilnego zagrożenia; potrzebna jest dalsza obserwacja formy i obciążeń.'],
    actions,
  };
};

const joinNames = (players: Player[]): string => {
  const names = players.map(player => formatPlayerName(player));
  if (names.length === 0) return 'brakuje wyraźnych nazwisk';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} i ${names[1]}`;
  return `${names[0]}, ${names[1]} i ${names[2]}`;
};

const buildKeyPlayersStatement = (players: Player[]): string => {
  const names = joinNames(players);

  if (players.length <= 1) {
    return `${names} jest teraz jednym z najważniejszych i najlepszych zawodników w drużynie.`;
  }

  return `${names} są teraz najważniejszymi zawodnikami w tej drużynie.`;
};

const strongestPosition = (counts: Record<PlayerPosition, number>): PlayerPosition =>
  (Object.keys(counts) as PlayerPosition[]).sort((a, b) => counts[b] - counts[a])[0];

const weakestPosition = (counts: Record<PlayerPosition, number>): PlayerPosition =>
  (Object.keys(counts) as PlayerPosition[]).sort((a, b) => counts[a] - counts[b])[0];

const pickVariant = (seed: string, variants: string[]): string =>
  variants[hashString(seed) % variants.length];

const buildAnalystNotes = (
  report: Omit<TeamAnalysisReport, 'commentary' | 'analystNotes'>
): TeamAnalysisAnalystNote[] => {
  const notes: TeamAnalysisAnalystNote[] = [];
  const usedIds = new Set<string>();

  const pushNote = (note: TeamAnalysisAnalystNote | null) => {
    if (!note || usedIds.has(note.player.id)) return;
    usedIds.add(note.player.id);
    notes.push(note);
  };

  const topContract = report.contractCases[0];
  if (topContract) {
    const playerName = formatPlayerName(topContract.player);
    let title = `${playerName} - kontrakt`;
    let explanation = `Obecnie nie ma problemu z kontraktem zawodnika ${playerName}.`;

    if (topContract.actionLabel === 'Daj mu nowy kontrakt') {
      title = `${playerName} - daj mu lepszy kontrakt`;
      explanation = `Z tym zawodnikiem trzeba szybko usiąść do rozmów. To ważny gracz dla składu i nie warto czekać do końca umowy.`;
    } else if (topContract.actionLabel === 'Daj mu nowy kontrakt albo go sprzedaj') {
      title = `${playerName} - podejmij decyzję teraz`;
      explanation = `Temu zawodnikowi kończy się umowa, więc trzeba podjąć decyzję. Jeśli nie damy mu nowego kontraktu, lepiej sprzedać go teraz.`;
    } else if (topContract.actionLabel === 'Trzeba podjąć decyzję') {
      title = `${playerName} - kontrakt się kończy`;
      explanation = `Temu zawodnikowi kończy się umowa, więc trzeba podjąć decyzję. Nie ma sensu zostawiać tego na później.`;
    } else if (topContract.actionLabel === 'Jeśli nie damy mu nowego kontraktu, może odejść') {
      title = `${playerName} - może odejść`;
      explanation = `Jeśli nie damy temu zawodnikowi nowego kontraktu, może odejść. Trzeba mieć to z tyłu głowy.`;
    }

    pushNote({
      id: `contract_${topContract.player.id}`,
      player: topContract.player,
      actionLabel: topContract.actionLabel,
      title,
      explanation,
    });
  }

  report.exitCandidates.slice(0, 3).forEach((topExit) => {
    const playerName = formatPlayerName(topExit.player);
    let title = `${playerName} - decyzja sportowa`;
    let explanation = `Uważam, że ${playerName} jest dziś słabszy od innych na swojej pozycji. Trzeba podjąć wobec niego prostą decyzję sportową.`;

    if (topExit.player.position === PlayerPosition.GK) {
      explanation = `Uważam, że ${playerName} broni dziś słabiej od innych bramkarzy w klubie. Trzeba ocenić, czy dalej na niego stawiamy, czy szykujemy zmianę.`;
    }

    if (topExit.actionLabel === 'Wystawmy go na listę transferową') {
      title = `${playerName} - wystaw na listę transferową`;
      explanation = topExit.player.position === PlayerPosition.GK
        ? `Uważam, że ${playerName} jest dziś za słaby na rolę numeru jeden w bramce. Jeśli mamy lepszą opcję, wystawiłbym go na listę transferową.`
        : `Uważam, że ${playerName} jest słabszy od innych na swojej pozycji i nie daje dziś tyle, ile potrzebujemy. Dlatego wystawiłbym go na listę transferową.`;
    } else if (topExit.actionLabel === 'Spróbuj sprzedać') {
      title = `${playerName} - można go sprzedać`;
      explanation = `Myślę, że ${playerName} nie daje dziś przewagi nad innymi i jeśli pojawi się dobra oferta, można go sprzedać bez dużej straty dla składu.`;
    } else if (topExit.actionLabel === 'Daj trening indywidualny') {
      title = `${playerName} - daj mu trening indywidualny`;
      explanation = `Uważam, że ${playerName} nie jest dziś gotowy na dużą rolę, ale ma jeszcze coś do poprawy. Dałbym mu trening indywidualny i sprawdził, czy zrobi postęp.`;
    } else if (topExit.actionLabel === 'Wypożycz') {
      title = `${playerName} - wypożycz go`;
      explanation = `Myślę, że ${playerName} potrzebuje regularnej gry. U nas może jej nie dostać, więc wypożyczenie byłoby teraz najlepszym ruchem.`;
    } else if (topExit.actionLabel === 'Zostaw jako rezerwowego') {
      title = `${playerName} - zostaw go jako rezerwowego`;
      explanation = `Na dziś nie widzę ${playerName} w pierwszym składzie, ale może jeszcze dać coś z ławki. Zostawiłbym go w kadrze, ale bez większej roli.`;
    }

    pushNote({
      id: `exit_${topExit.player.id}`,
      player: topExit.player,
      actionLabel: topExit.actionLabel,
      title,
      explanation,
    });
  });

  const topTalent = report.talents[0];
  if (topTalent) {
    const playerName = formatPlayerName(topTalent.player);
    let explanation = `Uważam, że ${playerName} warto prowadzić spokojnie i regularnie dawać mu minuty, bo może nam jeszcze mocno pójść do góry.`;

    if (topTalent.developmentPath.includes('wypożyczenie')) {
      explanation = `Myślę, że ${playerName} potrzebuje regularnych minut. Jeśli nie damy mu ich u nas, najlepiej będzie go wypożyczyć.`;
    } else if (topTalent.developmentPath.includes('rotacji')) {
      explanation = `Uważam, że ${playerName} jest już blisko pierwszego składu. Dawałbym mu regularne wejścia i część meczów od początku.`;
    } else if (topTalent.developmentPath.includes('Wprowadzać etapami')) {
      explanation = `Myślę, że ${playerName} trzeba wprowadzać spokojnie. Końcówki meczów i puchary będą dla niego teraz najlepsze.`;
    }

    pushNote({
      id: `talent_${topTalent.player.id}`,
      player: topTalent.player,
      actionLabel: topTalent.developmentPath,
      title: `${playerName} - plan rozwoju`,
      explanation,
    });
  }

  const topLeader = report.keyPlayers[0];
  if (topLeader) {
    const playerName = formatPlayerName(topLeader.player);
    pushNote({
      id: `leader_${topLeader.player.id}`,
      player: topLeader.player,
      actionLabel: topLeader.label,
      title: `${playerName} - oprzyj na nim zespół`,
      explanation: `Uważam, że ${playerName} powinien być jednym z głównych punktów tej drużyny. To zawodnik, na którym warto oprzeć skład i dać mu ważną rolę.`,
    });
  }

  return notes.slice(0, 6);
};

const buildCommentary = (
  club: Club,
  report: Omit<TeamAnalysisReport, 'commentary' | 'analystNotes'>,
  assistant: StaffMember | null | undefined,
  weekKey: string,
): TeamAnalysisCommentary => {
  // The voice now belongs to the hired assistant. It no longer changes between
  // unrelated TV-expert/psychologist personas whenever the calendar advances.
  const assistantName = assistant ? `${assistant.firstName} ${assistant.lastName}` : 'Asystent zespołu';
  const style = {
    id: assistant?.id ?? 'assistant_default',
    name: assistantName,
    role: 'analiza drużyny',
  };
  const commentarySeed = `${club.id}_${style.id}_${weekKey}`;
  const topKeyPlayers = report.keyPlayers.slice(0, 3).map(entry => entry.player);
  const keyPlayersStatement = buildKeyPlayersStatement(topKeyPlayers);
  const weakPlayersSummary = buildWeakPlayersSummary(report.exitCandidates);
  const talentName = report.talents[0] ? formatPlayerName(report.talents[0].player) : '';
  const contractName = report.contractCases[0] ? formatPlayerName(report.contractCases[0].player) : 'nikt';
  const bestTactic = report.tacticalRecommendation.tacticName;
  const altTactic = report.alternativeTactics[0]?.tacticName ?? report.tacticalRecommendation.tacticName;
  const bestPosition = strongestPosition(report.availableCounts);
  const weakestPos = weakestPosition(report.availableCounts);
  const averageOverall = report.squadAverageOverall.toFixed(1);
  const technicalAreaOne = report.trainingAnalysis.weakestTechnicalAreas[0]?.label ?? 'technika';
  const technicalAreaTwo = report.trainingAnalysis.weakestTechnicalAreas[1]?.label ?? 'podanie';
  const topExit = report.exitCandidates[0];
  const topTalent = report.talents[0];
  const opening = pickVariant(`${commentarySeed}_opening`, [
    'Trenerze, skład nie jest zły, ale są 2-3 problemy, które trzeba ogarnąć teraz.',
    'Trenerze, ta kadra daje radę, ale nie na każdej pozycji wygląda dobrze.',
    'Ta drużyna jest wystarczająco silna, żeby wygrywać mecze, ale ma kilka słabych pozycji, które obniżają jej poziom.',
    'Widzę w tej drużynie kilka mocnych punktów, ale są też pozycje, które ciągną zespół w dół.',
  ]);

  const keyPlayersLine = pickVariant(`${commentarySeed}_leaders`, [
    `Najlepiej wygląda dziś ${POSITION_LABELS[bestPosition]}, a najsłabiej ${POSITION_LABELS[weakestPos]}. ${keyPlayersStatement}`,
    `Patrząc na skład, najmocniejsi jesteśmy dziś w ${POSITION_LABELS[bestPosition]}, a najwięcej problemów mamy w ${POSITION_LABELS[weakestPos]}. ${keyPlayersStatement}`,
    `Największa siła jest dziś w ${POSITION_LABELS[bestPosition]}, a najsłabsze miejsce mamy w ${POSITION_LABELS[weakestPos]}. ${keyPlayersStatement}`,
  ]);

  const squadShapeLine = pickVariant(`${commentarySeed}_shape`, [
    `Średni poziom kadry to ${averageOverall} OVR. To wystarczy do normalnej gry, ale różnice między pozycjami są duże.`,
    `Średni poziom zespołu wynosi ${averageOverall} OVR. Nie jest źle, ale nie wszędzie mamy dobrych zmienników.`,
    `Przy średniej ${averageOverall} OVR ta drużyna może być stabilna, ale nie każda formacja trzyma ten sam poziom.`,
  ]);

  const exitContextLine = topExit
    ? `${weakPlayersSummary} Moja rekomendacja: ${report.exitCandidates.slice(0, 3).map(entry => `${formatPlayerName(entry.player)} - ${entry.actionLabel.toLowerCase()}`).join('; ')}.`
    : 'Na dziś nie widzę jednego oczywistego zawodnika do odsunięcia, ale kilku graczy wymaga dalszej obserwacji.';

  const contractLine = report.contractCases[0]
    ? `Osobno zwracam uwagę na ${contractName}. W jego przypadku chodzi tylko o kontrakt, więc ten temat trzeba ocenić osobno.`
    : '';

  const talentLine = topTalent
    ? seededUnit(`${commentarySeed}_talent`) > 0.5
      ? `${formatPlayerName(topTalent.player)} to dziś najciekawszy młody zawodnik w kadrze. Powinien grać regularnie, ale nie trzeba go od razu wystawiać do pierwszego składu w każdym meczu.`
      : `Najciekawszym zawodnikiem do rozwoju jest ${talentName}. Warto dawać mu minuty i sprawdzać, jak szybko idzie do przodu.`
    : '';

  const trainingLine = `Patrząc na treningi, drużyna najsłabiej wygląda dziś w takich elementach jak ${technicalAreaOne} i ${technicalAreaTwo}. W najbliższych tygodniach trzeba na to zwrócić największą uwagę.`;

  const tacticLine = pickVariant(`${commentarySeed}_tactic`, [
    `Jeśli chodzi o ustawienie, najlepiej wygląda dziś ${bestTactic}. W tym systemie najłatwiej zmieścić najlepszych zdrowych zawodników. Drugą opcją jest ${altTactic}.`,
    `Na teraz postawiłbym na ${bestTactic}, bo w tym ustawieniu najlepiej wykorzystamy najmocniejszych i najbardziej gotowych do gry zawodników. Drugi wybór to ${altTactic}.`,
    `Moim zdaniem najlepszym wyborem na dziś jest ${bestTactic}. Ten system po prostu najlepiej pasuje do obecnej kadry. Jako druga opcja zostaje ${altTactic}.`,
  ]);

  const closeLine = pickVariant(`${commentarySeed}_close`, [
    'Podsumowując, oparłbym zespół na najlepszych zawodnikach, uporządkował skład i podjął potrzebne decyzje kontraktowe.',
    'Na dziś najważniejsze jest wybrać jedno główne ustawienie i jasno ustalić, kto ma w nim grać.',
    'Mówiąc prosto: ten zespół może dawać wyniki, jeśli będziemy grać najmocniejszym składem i nie przegapimy ważnych decyzji.',
  ]);

  const paragraphs = [
    `${opening} ${keyPlayersLine} ${squadShapeLine}`,
    [exitContextLine, contractLine, talentLine].filter(Boolean).join(' '),
    trainingLine,
    `${tacticLine} ${closeLine}`,
  ];

  return {
    styleId: style.id,
    styleName: style.name,
    styleRole: style.role,
    paragraphs,
  };
};

export const TeamAnalysisService = {
  analyzeSquad: ({
    club,
    players,
    currentDate,
    assistant,
    lineup,
    matchHistory = [],
    activeTrainingName,
    activeIntensity,
  }: TeamAnalysisInput): TeamAnalysisReport => {
    const weekKey = getWeekKey(currentDate);
    const qualityScore = getTeamAssistantQuality(assistant);
    const uncertaintyPercent = getTeamAssistantUncertainty(qualityScore);
    const perceive = makeTeamPerceiver(
      club.id,
      weekKey,
      assistant?.id ?? 'NO_ASSISTANT',
      uncertaintyPercent,
    );
    const squadAverageOverall = average(players.map(player => player.overallRating));
    const { best: rawBest, alternatives: rawAlternatives, availableCounts } = analyzeTactics(club, players);
    const { candidates: rawExitCandidates, note: exitCandidatesNote } = analyzeExitCandidates(players, club, rawBest, squadAverageOverall);
    const perceived = applyAssistantPerception({
      tactics: [rawBest, ...rawAlternatives],
      keyPlayers: analyzeKeyPlayers(players),
      exitCandidates: rawExitCandidates,
      contractCases: analyzeContractCases(players, currentDate, squadAverageOverall),
      talents: analyzeTalents(players, currentDate, squadAverageOverall),
      assistantLeaders: analyzeAssistantLeaders(players),
    }, perceive);
    const tacticalRecommendation = perceived.tactics[0];
    const alternativeTactics = perceived.tactics.slice(1, 4);
    const formAnalysis = analyzeRecentForm(club, matchHistory, currentDate);
    const readinessAnalysis = analyzeReadiness(players, perceive);
    const dressingRoomAnalysis = analyzeDressingRoom(players, perceive);
    const developmentAnalysis = analyzeDevelopment(
      club,
      players,
      activeTrainingName,
      activeIntensity,
      perceive,
    );
    const tacticalProfile = analyzeTacticalProfile(players, lineup, tacticalRecommendation, perceive);
    const executiveSummary = buildExecutiveSummary({
      form: formAnalysis,
      readiness: readinessAnalysis,
      dressingRoom: dressingRoomAnalysis,
      development: developmentAnalysis,
      tactical: tacticalProfile,
      tactic: tacticalRecommendation,
      contracts: perceived.contractCases,
    });
    const baseReport = {
      generatedAt: currentDate.toISOString(),
      injuryRule: `Analiza jest tworzona na danych zawodników zdrowych lub z urazem do ${TACTIC_INJURY_LIMIT_DAYS} dni oraz z kondycją co najmniej ${MIN_TACTIC_CONDITION}%.`,
      squadSize: players.length,
      squadAverageOverall: Math.round(squadAverageOverall * 10) / 10,
      availableCounts,
      trainingAnalysis: analyzeTraining(players),
      assistantLeaders: perceived.assistantLeaders,
      keyPlayers: perceived.keyPlayers,
      exitCandidates: perceived.exitCandidates,
      exitCandidatesNote,
      contractCases: perceived.contractCases,
      talents: perceived.talents,
      tacticalRecommendation,
      alternativeTactics,
      assistantModel: {
        assistantId: assistant?.id ?? null,
        generatedForWeek: weekKey,
        qualityScore,
        uncertaintyPercent,
      },
      executiveSummary,
      formAnalysis,
      readinessAnalysis,
      dressingRoomAnalysis,
      developmentAnalysis,
      tacticalProfile,
    };

    return {
      ...baseReport,
      analystNotes: buildAnalystNotes(baseReport),
      commentary: buildCommentary(club, baseReport, assistant, weekKey),
    };
  },
};
