import { Club, Player, PlayerAttributes, PlayerPosition } from '../types';
import { FinanceService } from './FinanceService';
import { PlayerAttributesGenerator } from './PlayerAttributesGenerator';

export interface LoanDevelopmentInput {
  player: Player;
  destinationClub: Club | undefined;
  destinationSquad: Player[];
  matches: number;
  minutes: number;
  averageRating: number | null;
  reportDate: Date;
}

export interface LoanDevelopmentResult {
  player: Player;
  changed: boolean;
  attribute?: keyof PlayerAttributes;
  attributeLabel?: string;
  delta?: number;
  previousOverall: number;
  nextOverall: number;
  note: string;
}

const TRAINABLE_ATTRS: (keyof PlayerAttributes)[] = [
  'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking',
  'finishing', 'technique', 'vision', 'dribbling', 'heading', 'positioning',
  'goalkeeping', 'freeKicks', 'penalties', 'corners', 'aggression', 'crossing',
  'leadership', 'mentality', 'workRate'
];

const POSITION_GROWTH_ATTRS: Record<PlayerPosition, (keyof PlayerAttributes)[]> = {
  [PlayerPosition.GK]: ['goalkeeping', 'positioning', 'mentality', 'passing'],
  [PlayerPosition.DEF]: ['defending', 'positioning', 'heading', 'strength', 'passing', 'workRate'],
  [PlayerPosition.MID]: ['passing', 'vision', 'technique', 'workRate', 'positioning', 'stamina'],
  [PlayerPosition.FWD]: ['finishing', 'attacking', 'positioning', 'pace', 'technique', 'heading'],
};

const ATTRIBUTE_LABELS: Record<keyof PlayerAttributes, string> = {
  strength: 'siła',
  stamina: 'wytrzymałość',
  pace: 'szybkość',
  defending: 'obrona',
  passing: 'podania',
  attacking: 'atak',
  finishing: 'wykończenie',
  technique: 'technika',
  vision: 'wizja gry',
  dribbling: 'drybling',
  heading: 'gra głową',
  positioning: 'ustawianie',
  goalkeeping: 'bramkarstwo',
  freeKicks: 'rzuty wolne',
  talent: 'talent',
  penalties: 'rzuty karne',
  corners: 'rzuty rożne',
  aggression: 'agresja',
  crossing: 'dośrodkowania',
  leadership: 'przywództwo',
  mentality: 'mentalność',
  workRate: 'pracowitość',
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const seededUnit = (seed: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

const pickAttribute = (
  player: Player,
  direction: 1 | -1,
  seed: string
): keyof PlayerAttributes | null => {
  const preferred = direction > 0
    ? POSITION_GROWTH_ATTRS[player.position]
    : TRAINABLE_ATTRS.filter(attr => !['leadership', 'vision', 'mentality'].includes(attr));
  const candidates = preferred.filter(attr => {
    const value = player.attributes[attr];
    return direction > 0 ? value < 99 : value > 10;
  });
  if (candidates.length === 0) return null;
  return candidates[Math.floor(seededUnit(seed) * candidates.length)] ?? candidates[0];
};

const getDestinationFit = (player: Player, destinationSquad: Player[]): number => {
  const samePosition = destinationSquad.filter(p => p.position === player.position && p.id !== player.id);
  if (samePosition.length === 0) return 0.55;
  const averagePositionOvr = samePosition.reduce((sum, p) => sum + p.overallRating, 0) / samePosition.length;
  const levelDiff = player.overallRating - averagePositionOvr;
  if (levelDiff >= -1 && levelDiff <= 6) return 1.0;
  if (levelDiff > 6 && levelDiff <= 10) return 0.75;
  if (levelDiff < -1 && levelDiff >= -5) return 0.70;
  return 0.45;
};

export const LoanDevelopmentService = {
  applyMonthlyDevelopment(input: LoanDevelopmentInput): LoanDevelopmentResult {
    const { player, destinationClub, destinationSquad, matches, minutes, averageRating, reportDate } = input;
    const previousOverall = player.overallRating;
    const reportKey = reportDate.toISOString().split('T')[0];
    const ageBonus =
      player.age <= 19 ? 0.12 :
      player.age <= 21 ? 0.09 :
      player.age <= 23 ? 0.05 :
      player.age <= 25 ? 0.02 :
      -0.03;
    const talentGap = Math.max(0, player.attributes.talent - player.overallRating);
    const talentBonus = clamp(talentGap / 100, 0, 0.18);
    const minutesBonus =
      minutes >= 450 ? 0.18 :
      minutes >= 270 ? 0.13 :
      minutes >= 180 ? 0.08 :
      minutes >= 90 ? 0.03 :
      -0.08;
    const ratingBonus = averageRating === null
      ? 0
      : averageRating >= 7.4 ? 0.10
      : averageRating >= 7.0 ? 0.06
      : averageRating >= 6.6 ? 0.02
      : averageRating < 6.0 ? -0.08
      : -0.03;
    const environmentBonus = clamp(((destinationClub?.reputation ?? 45) - 45) / 400, -0.04, 0.09);
    const fitBonus = (getDestinationFit(player, destinationSquad) - 0.55) * 0.12;
    const growthChance = clamp(0.04 + ageBonus + talentBonus + minutesBonus + ratingBonus + environmentBonus + fitBonus, 0.01, 0.55);
    const regressionChance = clamp(
      (minutes < 90 ? 0.10 : 0) +
      (matches === 0 ? 0.07 : 0) +
      (averageRating !== null && averageRating < 6.0 ? 0.08 : 0) +
      (player.age >= 28 ? 0.04 : 0),
      0,
      0.22
    );

    const growthRoll = seededUnit(`${player.id}_${reportKey}_loan_growth`);
    const regressionRoll = seededUnit(`${player.id}_${reportKey}_loan_regression`);
    const seasonalChanges = { ...(player.stats.seasonalChanges || {}) };
    const attributes = { ...player.attributes };

    let changedAttribute: keyof PlayerAttributes | null = null;
    let delta: 1 | -1 | null = null;

    if (growthRoll < growthChance) {
      const attr = pickAttribute(player, 1, `${player.id}_${reportKey}_loan_attr_plus`);
      if (attr) {
        const currentChange = seasonalChanges[attr] || 0;
        if (currentChange < 4 && attributes[attr] < 99) {
          attributes[attr] += 1;
          seasonalChanges[attr] = currentChange + 1;
          changedAttribute = attr;
          delta = 1;
        }
      }
    } else if (regressionRoll < regressionChance) {
      const attr = pickAttribute(player, -1, `${player.id}_${reportKey}_loan_attr_minus`);
      if (attr) {
        const currentChange = seasonalChanges[attr] || 0;
        if (currentChange > -4 && attributes[attr] > 10) {
          attributes[attr] -= 1;
          seasonalChanges[attr] = currentChange - 1;
          changedAttribute = attr;
          delta = -1;
        }
      }
    }

    if (!changedAttribute || !delta) {
      const note = minutes >= 270
        ? 'rozwój stabilny, bez zmiany atrybutu w tym miesiącu'
        : minutes < 90
          ? 'za mało minut, rozwój praktycznie stoi'
          : 'okres neutralny rozwojowo';
      return { player, changed: false, previousOverall, nextOverall: previousOverall, note };
    }

    const nextOverall = PlayerAttributesGenerator.calculateOverall(attributes, player.position);
    const leagueTier = parseInt(destinationClub?.leagueId?.split('_')[2] || '1') || 1;
    const updatedPlayer: Player = {
      ...player,
      attributes,
      overallRating: nextOverall,
      stats: {
        ...player.stats,
        ratingHistory: player.stats.ratingHistory || [],
        seasonalChanges,
      },
      marketValue: FinanceService.calculateMarketValue(
        { ...player, attributes, overallRating: nextOverall },
        destinationClub?.reputation ?? 50,
        leagueTier,
        destinationClub?.country
      ),
    };

    return {
      player: updatedPlayer,
      changed: true,
      attribute: changedAttribute,
      attributeLabel: ATTRIBUTE_LABELS[changedAttribute],
      delta,
      previousOverall,
      nextOverall,
      note: `${delta > 0 ? '+' : '-'}1 ${ATTRIBUTE_LABELS[changedAttribute]}`,
    };
  },
};
