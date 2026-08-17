import { Club, ManagerContract, ManagerProfile, Player } from '../types';

export type FreeAgentBoardAppealAction =
  | 'SPORTING_ARGUMENT'
  | 'SEASON_TARGET'
  | 'PRESS_BOARD';

export interface FreeAgentBoardAppealResult {
  approved: boolean;
  chance: number;
  message: string;
  boardConfidenceDelta: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const stableHash = (input: string): number => {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

const seededRandom = (seed: number): number => {
  const value = Math.sin(seed * 7919) * 10000;
  return value - Math.floor(value);
};

const average = (values: number[], fallback: number): number =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;

/**
 * Rozstrzyga jednorazowe odwołanie od politycznego weta zarządu przy kontrakcie
 * wolnego zawodnika. Brak pieniędzy na bieżący sezon pozostaje poza tym serwisem
 * i nigdy nie może zostać ominięty rozmową.
 */
export const FreeAgentBoardAppealService = {
  evaluate(params: {
    player: Player;
    salary: number;
    bonus: number;
    years: number;
    squad: Player[];
    club: Club;
    managerProfile: ManagerProfile | null;
    managerContract: ManagerContract | null;
    currentDate: Date;
    action: FreeAgentBoardAppealAction;
  }): FreeAgentBoardAppealResult {
    const {
      player,
      salary,
      bonus,
      years,
      squad,
      club,
      managerProfile,
      managerContract,
      currentDate,
      action,
    } = params;

    const owner = club.management?.owner;
    const cfo = club.management?.cfo;
    const averageOverall = average(squad.map(candidate => candidate.overallRating), player.overallRating);
    const bestInPosition = squad
      .filter(candidate => candidate.position === player.position)
      .reduce((best, candidate) => Math.max(best, candidate.overallRating), averageOverall);
    const highestSalary = squad.reduce((highest, candidate) => Math.max(highest, candidate.annualSalary || 0), 0);
    const wageBill = squad.reduce((sum, candidate) => sum + (candidate.annualSalary || 0), 0);
    const currentSeasonCost = salary + bonus;
    const budgetUsage = currentSeasonCost / Math.max(1, club.transferBudget);
    const projectedWagePressure = (wageBill + salary) / Math.max(1, club.budget);
    const hierarchyRatio = salary / Math.max(100_000, highestSalary || salary);
    const sportingUpgrade = clamp(
      (player.overallRating - averageOverall) * 1.8 +
      (player.overallRating - bestInPosition) * 1.3,
      -16,
      28,
    );
    const target = managerContract?.clubId === club.id ? managerContract.terms.target : null;
    const targetPressure = target
      ? target.ambitionLevel * 2.2 + (target.leagueMaxRank <= 3 ? 6 : target.leagueMaxRank <= 6 ? 3 : 0)
      : 0;
    const managerLeverage = clamp(Math.log2(Math.max(1, managerProfile?.expPoints ?? 1) + 1) * 2.4, 0, 18);

    let chance = 16
      + sportingUpgrade
      + (owner?.ambicja ?? 10) * 0.8
      + (owner?.hojnosc ?? 10) * 0.55
      + (owner?.cierpliwosc ?? 10) * 0.25
      + (club.boardConfidence ?? 60) * 0.14
      + managerLeverage
      - (club.boardStrictness ?? 5) * 1.5
      - (cfo?.dyscyplinaFinansowa ?? 10) * 0.55
      - Math.max(0, budgetUsage - 0.45) * 38
      - Math.max(0, projectedWagePressure - 0.60) * 45
      - Math.max(0, hierarchyRatio - 2.5) * 6
      - Math.max(0, years - 3) * 4;

    if (action === 'SPORTING_ARGUMENT') {
      chance += Math.max(0, sportingUpgrade) * 0.55 + (club.sportingDirector?.footballKnowledge ?? 10) * 0.45;
    } else if (action === 'SEASON_TARGET') {
      chance += targetPressure + (club.sportingDirector?.ambition ?? 10) * 0.45;
    } else {
      chance += managerLeverage * 0.65 + (owner?.ambicja ?? 10) * 0.45 - (owner?.doswiadczenie ?? 10) * 0.65;
    }

    chance = clamp(chance, 4, action === 'PRESS_BOARD' ? 68 : 84);
    const actionOffset = action === 'SPORTING_ARGUMENT' ? 101 : action === 'SEASON_TARGET' ? 307 : 809;
    const seed = stableHash([
      club.id,
      player.id,
      salary,
      bonus,
      years,
      currentDate.toISOString().slice(0, 10),
      action,
    ].join('|'));
    const approved = seededRandom(seed + actionOffset) * 100 < chance;

    if (approved) {
      const justification = action === 'SPORTING_ARGUMENT'
        ? 'Przedstawiony plan sportowy uzasadnia odstępstwo od obecnej hierarchii płac.'
        : action === 'SEASON_TARGET'
          ? `Realizacja celu „${target?.label ?? 'poprawa pozycji zespołu'}” wymaga od klubu podjęcia kontrolowanego ryzyka.`
          : 'Zarząd przyjmuje odpowiedzialność za ryzyko, ale będzie szczegółowo oceniał skutki tego kontraktu.';
      return {
        approved: true,
        chance,
        message: `Po ponownej analizie Zarząd warunkowo zatwierdza proponowany kontrakt. ${justification}`,
        boardConfidenceDelta: action === 'PRESS_BOARD' ? -3 : 1,
      };
    }

    const rejection = budgetUsage > 0.70 || projectedWagePressure > 0.75
      ? 'Ryzyko finansowe pozostaje zbyt wysokie i mogłoby ograniczyć funkcjonowanie klubu w dalszej części sezonu.'
      : hierarchyRatio > 3
        ? 'Zarząd nie otrzymał wystarczających podstaw do tak dużej zmiany hierarchii wynagrodzeń.'
        : sportingUpgrade <= 0
          ? 'Zarząd nie widzi wystarczająco wyraźnego wzmocnienia sportowego w stosunku do kosztu kontraktu.'
          : 'Argumenty sportowe zostały uwzględnione, ale nie przeważyły nad oceną ryzyka całej operacji.';
    return {
      approved: false,
      chance,
      message: `Zarząd podtrzymuje weto. ${rejection}`,
      boardConfidenceDelta: action === 'PRESS_BOARD' ? -6 : -1,
    };
  },
};
