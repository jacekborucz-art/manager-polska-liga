import {
  BoardAttributeLevel,
  Club,
  TrainingFacilityLevel,
  TrainingFacilityUpgradePhase,
  TrainingFacilityUpgradeProject,
} from '../types';

export interface TrainingFacilityEligibility {
  eligible: boolean;
  reasons: string[];
  nextLevel?: TrainingFacilityLevel;
  estimatedCost?: number;
  estimatedCostRange?: { min: number; max: number };
  minimumCashRequired?: number;
}

export interface TrainingFacilityDevelopmentProfile {
  level: TrainingFacilityLevel;
  growthChanceMultiplier: number;
  regressionChanceMultiplier: number;
  extraSeasonalGrowthCap: number;
  peakSeasonOverallGain: number;
  typicalSeasonOverallGain: number;
  facilityUtilization: number;
  staffQuality: number;
}

export interface TrainingFacilityAdvanceEvent {
  projectId: string;
  newPhase: TrainingFacilityUpgradePhase;
  subject: string;
  body: string;
  isGoodNews: boolean;
  costDeducted?: number;
}

export interface TrainingFacilityAdvanceDayResult {
  updatedClub: Club;
  events: TrainingFacilityAdvanceEvent[];
}

export const TRAINING_FACILITY_UPGRADE_COSTS: Record<number, number> = {
  1: 1_500_000,
  2: 4_000_000,
  3: 9_000_000,
  4: 18_000_000,
  5: 32_000_000,
  6: 55_000_000,
  7: 85_000_000,
  8: 125_000_000,
  9: 180_000_000,
};

export const TRAINING_FACILITY_UPGRADE_COST_RANGES: Record<number, [number, number]> = {
  1: [1_200_000, 2_200_000],
  2: [3_200_000, 5_400_000],
  3: [7_000_000, 12_000_000],
  4: [14_000_000, 24_000_000],
  5: [25_000_000, 42_000_000],
  6: [43_000_000, 70_000_000],
  7: [65_000_000, 110_000_000],
  8: [96_000_000, 160_000_000],
  9: [135_000_000, 235_000_000],
};

const TRAINING_FACILITY_CONSTRUCTION_DAYS: Record<number, [number, number]> = {
  1: [75, 105],
  2: [90, 135],
  3: [120, 180],
  4: [150, 225],
  5: [180, 270],
  6: [240, 330],
  7: [300, 390],
  8: [360, 480],
  9: [420, 540],
};

const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const hashSeed = (str: string): number => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(Math.sin(h) * 10000) % 1;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const clampLevel = (level?: number): TrainingFacilityLevel =>
  clamp(Math.round(level ?? 1), 1, 10) as TrainingFacilityLevel;

const levelToScore = (level?: BoardAttributeLevel): number => {
  const scores: Record<BoardAttributeLevel, number> = {
    bardzo_niska: 1,
    niska: 2,
    przecietna: 3,
    wysoka: 4,
    bardzo_wysoka: 5,
  };
  return level ? (scores[level] ?? 3) : 3;
};

const normalizeStaffQuality = (quality?: number): number => {
  if (quality === undefined || Number.isNaN(quality)) return 10;
  return quality > 20 ? clamp(quality / 5, 1, 20) : clamp(quality, 1, 20);
};

const getClubCostScale = (club: Club): number => {
  const reputationPressure = 0.90 + clamp(club.reputation, 1, 20) / 20 * 0.24;
  const tierPressure = club.tier ? clamp(1.08 - club.tier * 0.035, 0.88, 1.05) : 1;
  const boardCompetenceDiscount = 1 - (levelToScore(club.board?.kompetencja) - 3) * 0.025;
  const ambitionPremium = 1 + Math.max(0, levelToScore(club.board?.ambicja) - 3) * 0.025;
  const strictnessDiscount = 1 - clamp(club.boardStrictness ?? 50, 0, 100) / 100 * 0.04;
  return clamp(reputationPressure * tierPressure * boardCompetenceDiscount * ambitionPremium * strictnessDiscount, 0.82, 1.24);
};

const getClubUpgradeCostRange = (club: Club, fromLevel: TrainingFacilityLevel): { min: number; max: number } => {
  const [baseMin, baseMax] = TRAINING_FACILITY_UPGRADE_COST_RANGES[fromLevel] ?? [0, 0];
  const scale = getClubCostScale(club);
  const localComplexity = 0.94 + hashSeed(`${club.id}_${club.name}_${fromLevel}_facility_market`) * 0.16;
  return {
    min: Math.round(baseMin * scale * localComplexity),
    max: Math.round(baseMax * scale * localComplexity),
  };
};

const getBoardValuationCost = (
  club: Club,
  fromLevel: TrainingFacilityLevel,
  projectId: string,
): { cost: number; range: { min: number; max: number }; minimumCashRequired: number } => {
  const range = getClubUpgradeCostRange(club, fromLevel);
  const quoteSeed = hashSeed(`${projectId}_${club.id}_${fromLevel}_board_valuation`);
  const boardQuality = levelToScore(club.board?.kompetencja);
  const negotiationDiscount = (boardQuality - 3) * 0.025;
  const quotedCost = Math.round((range.min + quoteSeed * (range.max - range.min)) * (1 - negotiationDiscount));
  const cost = Math.round(clamp(quotedCost, range.min * 0.92, range.max * 1.04));
  const minimumCashRequired = Math.round(cost * (0.14 + Math.max(0, 4 - levelToScore(club.board?.hojnosc)) * 0.025));
  return { cost, range, minimumCashRequired };
};

const getProjectCostBasis = (club: Club, project: TrainingFacilityUpgradeProject): number => {
  if (project.estimatedCost > 0) return project.estimatedCost;
  if ((project.boardValuationCost ?? 0) > 0) return project.boardValuationCost ?? 0;
  return getBoardValuationCost(club, project.fromLevel, project.id).cost;
};

const getConstructionDays = (fromLevel: TrainingFacilityLevel, seed: number): number => {
  const [minDays, maxDays] = TRAINING_FACILITY_CONSTRUCTION_DAYS[fromLevel] ?? [180, 270];
  return minDays + Math.floor(seed * (maxDays - minDays + 1));
};

const getPhaseLabel = (phase: TrainingFacilityUpgradePhase): string => {
  const labels: Record<TrainingFacilityUpgradePhase, string> = {
    BOARD_REVIEW: 'Rozpatrzenie przez zarząd',
    TECHNICAL_AUDIT: 'Audyt techniczny',
    PLANNING_PERMISSION: 'Pozwolenia i uzgodnienia',
    PROCUREMENT: 'Przetarg i zakupy',
    CONSTRUCTION: 'Budowa i instalacje',
    QUALITY_INSPECTION: 'Odbiór jakościowy',
    COMPLETED: 'Zakończone',
    REJECTED: 'Odrzucone',
  };
  return labels[phase];
};

const advancePhase = (
  club: Club,
  project: TrainingFacilityUpgradeProject,
  currentDate: string,
): { updatedProject: TrainingFacilityUpgradeProject; updatedClub: Club; event: TrainingFacilityAdvanceEvent } | null => {
  const s1 = hashSeed(project.id + project.phase + 'outcome');
  const s2 = hashSeed(project.id + project.phase + 'duration');
  const levelLabel = `Poziom ${project.fromLevel} → ${project.targetLevel}`;

  switch (project.phase) {
    case 'BOARD_REVIEW': {
      const valuation = getBoardValuationCost(club, project.fromLevel, project.id);
      const projectWithValuation: TrainingFacilityUpgradeProject = {
        ...project,
        estimatedCost: valuation.cost,
        boardValuationCost: valuation.cost,
        initialCostRangeMin: project.initialCostRangeMin ?? valuation.range.min,
        initialCostRangeMax: project.initialCostRangeMax ?? valuation.range.max,
        minimumCashRequired: valuation.minimumCashRequired,
      };
      const boardScore = levelToScore(club.board?.ambicja) + levelToScore(club.board?.kompetencja) + levelToScore(club.board?.hojnosc);
      const budgetPressure = valuation.cost / Math.max(1, club.budget);
      const canFundPreparation = club.budget >= valuation.minimumCashRequired;
      const approvalChance = clamp(0.44 + boardScore * 0.042 + club.reputation * 0.016 - Math.max(0, budgetPressure - 2.5) * 0.08, 0.16, 0.86);
      if (!canFundPreparation || s1 > approvalChance) {
        const updatedProject: TrainingFacilityUpgradeProject = {
          ...projectWithValuation,
          phase: 'REJECTED',
          phaseEndDate: currentDate,
          log: [...project.log, {
            date: currentDate,
            message: canFundPreparation
              ? `Zarząd wykonał wycenę (${valuation.cost.toLocaleString('pl-PL')} PLN), ale odrzucił wniosek o rozbudowę bazy treningowej.`
              : `Zarząd wykonał wycenę (${valuation.cost.toLocaleString('pl-PL')} PLN) i uznał, że klub nie ma wymaganych wolnych środków (${valuation.minimumCashRequired.toLocaleString('pl-PL')} PLN).`,
            type: 'WARNING'
          }],
        };
        return {
          updatedProject,
          updatedClub: {
            ...club,
            trainingFacilityUpgradeProjects: (club.trainingFacilityUpgradeProjects ?? []).map(p => p.id === project.id ? updatedProject : p),
          },
          event: {
            projectId: project.id,
            newPhase: 'REJECTED',
            subject: `Wycena bazy treningowej odrzucona — ${levelLabel}`,
            body: canFundPreparation
              ? `Szanowny Panie Menedżerze,\n\nZarząd zakończył wstępną wycenę rozbudowy bazy treningowej (${levelLabel}).\n\nWycena klubowa: ${valuation.cost.toLocaleString('pl-PL')} PLN.\nWidełki dla naszego klubu: ${valuation.range.min.toLocaleString('pl-PL')} - ${valuation.range.max.toLocaleString('pl-PL')} PLN.\n\nPo analizie zarząd uznał, że obecny moment finansowy lub sportowy nie uzasadnia tej inwestycji. Do tematu można wrócić po poprawie budżetu albo wyników zespołu.\n\nZ poważaniem,\nZarząd Klubu`
              : `Szanowny Panie Menedżerze,\n\nZarząd zakończył wstępną wycenę rozbudowy bazy treningowej (${levelLabel}).\n\nWycena klubowa: ${valuation.cost.toLocaleString('pl-PL')} PLN.\nMinimalne wolne środki wymagane do uruchomienia procedury: ${valuation.minimumCashRequired.toLocaleString('pl-PL')} PLN.\nAktualny budżet klubu: ${club.budget.toLocaleString('pl-PL')} PLN.\n\nZarząd uznał, że klubu nie stać teraz na bezpieczne rozpoczęcie procesu, dlatego wniosek został odrzucony.\n\nZ poważaniem,\nZarząd Klubu`,
            isGoodNews: false,
          },
        };
      }

      const auditDays = 28 + Math.floor(s2 * 28);
      const updatedProject: TrainingFacilityUpgradeProject = {
        ...projectWithValuation,
        phase: 'TECHNICAL_AUDIT',
        phaseEndDate: addDays(currentDate, auditDays),
        log: [...project.log, { date: currentDate, message: `Zarząd zakończył wycenę (${valuation.cost.toLocaleString('pl-PL')} PLN) i zaakceptował wniosek. Rozpoczynamy audyt techniczny i analizę zakresu prac.`, type: 'SUCCESS' }],
      };
      return {
        updatedProject,
        updatedClub: {
          ...club,
          trainingFacilityUpgradeProjects: (club.trainingFacilityUpgradeProjects ?? []).map(p => p.id === project.id ? updatedProject : p),
        },
        event: {
          projectId: project.id,
          newPhase: 'TECHNICAL_AUDIT',
          subject: `Wycena bazy zaakceptowana — ${levelLabel}`,
          body: `Szanowny Panie Menedżerze,\n\nZarząd zakończył wstępną wycenę rozbudowy bazy treningowej (${levelLabel}).\n\nWycena klubowa: ${valuation.cost.toLocaleString('pl-PL')} PLN.\nWidełki dla naszego klubu: ${valuation.range.min.toLocaleString('pl-PL')} - ${valuation.range.max.toLocaleString('pl-PL')} PLN.\nMinimalne wolne środki wymagane do uruchomienia procedury: ${valuation.minimumCashRequired.toLocaleString('pl-PL')} PLN.\n\nZarząd wyraził zgodę na rozpoczęcie procedury. Pierwszy etap to audyt techniczny boisk, siłowni, zaplecza medycznego i infrastruktury analitycznej. Potrwa około ${Math.round(auditDays / 7)} tygodni.\n\nZ poważaniem,\nZarząd Klubu`,
          isGoodNews: true,
        },
      };
    }

    case 'TECHNICAL_AUDIT': {
      const costBasis = getProjectCostBasis(club, project);
      const auditCost = Math.round(clamp(costBasis * (0.012 + s1 * 0.014), 80_000, 1_800_000));
      if (club.budget < auditCost) {
        const updatedProject: TrainingFacilityUpgradeProject = {
          ...project,
          phase: 'REJECTED',
          phaseEndDate: currentDate,
          technicalAuditCost: auditCost,
          log: [...project.log, { date: currentDate, message: 'Audyt został wstrzymany z powodu braku środków na koszty przygotowawcze.', type: 'WARNING' }],
        };
        return {
          updatedProject,
          updatedClub: {
            ...club,
            trainingFacilityUpgradeProjects: (club.trainingFacilityUpgradeProjects ?? []).map(p => p.id === project.id ? updatedProject : p),
          },
          event: {
            projectId: project.id,
            newPhase: 'REJECTED',
            subject: `Brak środków na audyt — ${levelLabel}`,
            body: `Szanowny Panie Menedżerze,\n\nRozbudowa bazy treningowej została wstrzymana, ponieważ klub nie ma środków na pokrycie kosztu audytu technicznego (${auditCost.toLocaleString('pl-PL')} PLN).\n\nZ poważaniem,\nZarząd Klubu`,
            isGoodNews: false,
          },
        };
      }

      const permissionDays = 42 + Math.floor(s2 * 63);
      const updatedProject: TrainingFacilityUpgradeProject = {
        ...project,
        phase: 'PLANNING_PERMISSION',
        phaseEndDate: addDays(currentDate, permissionDays),
        technicalAuditCost: auditCost,
        log: [...project.log, { date: currentDate, message: `Audyt techniczny zakończony. Koszt: ${auditCost.toLocaleString('pl-PL')} PLN. Składamy wnioski o pozwolenia i uzgodnienia.`, type: 'COST' }],
      };
      return {
        updatedProject,
        updatedClub: {
          ...club,
          budget: club.budget - auditCost,
          trainingFacilityUpgradeProjects: (club.trainingFacilityUpgradeProjects ?? []).map(p => p.id === project.id ? updatedProject : p),
        },
        event: {
          projectId: project.id,
          newPhase: 'PLANNING_PERMISSION',
          subject: `Audyt bazy treningowej gotowy — ${levelLabel}`,
          body: `Szanowny Panie Menedżerze,\n\nAudyt techniczny zakończył się pozytywnie.\n\nKoszt przygotowawczy: ${auditCost.toLocaleString('pl-PL')} PLN.\nKolejny etap to pozwolenia budowlane, uzgodnienia środowiskowe oraz harmonogram prac treningowych podczas inwestycji.\n\nZ poważaniem,\nZarząd Klubu`,
          isGoodNews: true,
          costDeducted: auditCost,
        },
      };
    }

    case 'PLANNING_PERMISSION': {
      const outcome = s1 < 0.76 ? 'APPROVED' : s1 < 0.90 ? 'CONDITIONAL' : 'REJECTED';
      if (outcome === 'REJECTED') {
        const updatedProject: TrainingFacilityUpgradeProject = {
          ...project,
          phase: 'REJECTED',
          phaseEndDate: currentDate,
          log: [...project.log, { date: currentDate, message: 'Urzędowe pozwolenia i uzgodnienia nie zostały wydane.', type: 'WARNING' }],
        };
        return {
          updatedProject,
          updatedClub: {
            ...club,
            trainingFacilityUpgradeProjects: (club.trainingFacilityUpgradeProjects ?? []).map(p => p.id === project.id ? updatedProject : p),
          },
          event: {
            projectId: project.id,
            newPhase: 'REJECTED',
            subject: `Brak pozwoleń na bazę treningową — ${levelLabel}`,
            body: `Szanowny Panie Menedżerze,\n\nNie otrzymaliśmy wymaganych pozwoleń dla rozbudowy bazy treningowej (${levelLabel}). Projekt zostaje zamknięty na obecnym etapie.\n\nZ poważaniem,\nZarząd Klubu`,
            isGoodNews: false,
          },
        };
      }

      const procurementDays = 21 + Math.floor(s2 * 35);
      const conditionMultiplier = outcome === 'CONDITIONAL' ? 1.06 + hashSeed(project.id + 'conditions') * 0.08 : 1;
      const costBasis = getProjectCostBasis(club, project);
      const updatedProject: TrainingFacilityUpgradeProject = {
        ...project,
        phase: 'PROCUREMENT',
        phaseEndDate: addDays(currentDate, procurementDays),
        estimatedCost: Math.round(costBasis * conditionMultiplier),
        log: [...project.log, {
          date: currentDate,
          message: outcome === 'CONDITIONAL'
            ? 'Pozwolenia wydano warunkowo. Zakres prac zostaje utrzymany, ale rosną koszty zabezpieczeń i organizacji placu budowy.'
            : 'Pozwolenia wydane. Rozpoczynamy przetarg i zamówienia wyposażenia.',
          type: 'SUCCESS',
        }],
      };
      return {
        updatedProject,
        updatedClub: {
          ...club,
          trainingFacilityUpgradeProjects: (club.trainingFacilityUpgradeProjects ?? []).map(p => p.id === project.id ? updatedProject : p),
        },
        event: {
          projectId: project.id,
          newPhase: 'PROCUREMENT',
          subject: `Pozwolenia uzyskane — ${levelLabel}`,
          body: `Szanowny Panie Menedżerze,\n\nOtrzymaliśmy wymagane pozwolenia dla rozbudowy bazy treningowej (${levelLabel}).\n\nPrzechodzimy do przetargu, wyboru wykonawców oraz zamówienia wyposażenia treningowego.\n\nZ poważaniem,\nZarząd Klubu`,
          isGoodNews: true,
        },
      };
    }

    case 'PROCUREMENT': {
      const totalCost = Math.round(getProjectCostBasis(club, project) * (0.94 + s1 * 0.18));
      if (club.budget < totalCost) {
        const updatedProject: TrainingFacilityUpgradeProject = {
          ...project,
          phase: 'REJECTED',
          phaseEndDate: currentDate,
          totalCost,
          log: [...project.log, { date: currentDate, message: `Po przetargu koszt wyniósł ${totalCost.toLocaleString('pl-PL')} PLN. Klub nie ma środków na rozpoczęcie prac.`, type: 'WARNING' }],
        };
        return {
          updatedProject,
          updatedClub: {
            ...club,
            trainingFacilityUpgradeProjects: (club.trainingFacilityUpgradeProjects ?? []).map(p => p.id === project.id ? updatedProject : p),
          },
          event: {
            projectId: project.id,
            newPhase: 'REJECTED',
            subject: `Finansowanie bazy wstrzymane — ${levelLabel}`,
            body: `Szanowny Panie Menedżerze,\n\nPrzetarg zakończył się kwotą ${totalCost.toLocaleString('pl-PL')} PLN. Obecny budżet klubu nie pozwala bezpiecznie rozpocząć budowy, dlatego projekt został wstrzymany.\n\nZ poważaniem,\nZarząd Klubu`,
            isGoodNews: false,
          },
        };
      }

      const constructionDays = getConstructionDays(project.fromLevel, s2);
      const updatedProject: TrainingFacilityUpgradeProject = {
        ...project,
        phase: 'CONSTRUCTION',
        phaseEndDate: addDays(currentDate, constructionDays),
        totalCost,
        log: [...project.log, { date: currentDate, message: `Wybrano wykonawcę. Koszt inwestycji: ${totalCost.toLocaleString('pl-PL')} PLN. Czas prac: około ${Math.round(constructionDays / 30)} mies.`, type: 'COST' }],
      };
      return {
        updatedProject,
        updatedClub: {
          ...club,
          budget: club.budget - totalCost,
          trainingFacilityUpgradeProjects: (club.trainingFacilityUpgradeProjects ?? []).map(p => p.id === project.id ? updatedProject : p),
        },
        event: {
          projectId: project.id,
          newPhase: 'CONSTRUCTION',
          subject: `Rozbudowa bazy rozpoczęta — ${levelLabel}`,
          body: `Szanowny Panie Menedżerze,\n\nWybrano wykonawcę rozbudowy bazy treningowej (${levelLabel}).\n\nKoszt inwestycji: ${totalCost.toLocaleString('pl-PL')} PLN.\nSzacowany czas prac: około ${Math.round(constructionDays / 30)} miesięcy.\n\nKwota została pobrana z budżetu klubu.\n\nZ poważaniem,\nZarząd Klubu`,
          isGoodNews: true,
          costDeducted: totalCost,
        },
      };
    }

    case 'CONSTRUCTION': {
      const delaySeed = hashSeed(project.id + 'construction-delay' + currentDate);
      if (delaySeed < 0.10) {
        const delayDays = 14 + Math.floor(hashSeed(project.id + 'delay-days' + currentDate) * 35);
        const updatedProject: TrainingFacilityUpgradeProject = {
          ...project,
          phaseEndDate: addDays(project.phaseEndDate, delayDays),
          log: [...project.log, { date: currentDate, message: `Opóźnienie prac o ${delayDays} dni z powodu problemów z dostawą wyposażenia.`, type: 'DELAY' }],
        };
        return {
          updatedProject,
          updatedClub: {
            ...club,
            trainingFacilityUpgradeProjects: (club.trainingFacilityUpgradeProjects ?? []).map(p => p.id === project.id ? updatedProject : p),
          },
          event: {
            projectId: project.id,
            newPhase: 'CONSTRUCTION',
            subject: `Opóźnienie bazy treningowej — ${levelLabel}`,
            body: `Szanowny Panie Menedżerze,\n\nWykonawca zgłosił opóźnienie w rozbudowie bazy treningowej (${levelLabel}). Termin przesuwa się o ${delayDays} dni.\n\nZ poważaniem,\nZarząd Klubu`,
            isGoodNews: false,
          },
        };
      }

      const updatedProject: TrainingFacilityUpgradeProject = {
        ...project,
        phase: 'QUALITY_INSPECTION',
        phaseEndDate: addDays(currentDate, 14),
        log: [...project.log, { date: currentDate, message: 'Prace budowlane zakończone. Rozpoczyna się odbiór jakościowy i certyfikacja sprzętu.', type: 'SUCCESS' }],
      };
      return {
        updatedProject,
        updatedClub: {
          ...club,
          trainingFacilityUpgradeProjects: (club.trainingFacilityUpgradeProjects ?? []).map(p => p.id === project.id ? updatedProject : p),
        },
        event: {
          projectId: project.id,
          newPhase: 'QUALITY_INSPECTION',
          subject: `Odbiór bazy treningowej — ${levelLabel}`,
          body: `Szanowny Panie Menedżerze,\n\nPrace przy bazie treningowej zostały zakończone. Trwa odbiór jakościowy boisk, siłowni, stref regeneracji oraz narzędzi analitycznych.\n\nZ poważaniem,\nZarząd Klubu`,
          isGoodNews: true,
        },
      };
    }

    case 'QUALITY_INSPECTION': {
      const updatedProject: TrainingFacilityUpgradeProject = {
        ...project,
        phase: 'COMPLETED',
        phaseEndDate: currentDate,
        log: [...project.log, { date: currentDate, message: `Odbiór jakościowy pozytywny. Baza treningowa osiągnęła Poziom ${project.targetLevel}.`, type: 'SUCCESS' }],
      };
      return {
        updatedProject,
        updatedClub: {
          ...club,
          trainingFacilityLevel: project.targetLevel,
          trainingFacilityUpgradeProjects: (club.trainingFacilityUpgradeProjects ?? []).map(p => p.id === project.id ? updatedProject : p),
        },
        event: {
          projectId: project.id,
          newPhase: 'COMPLETED',
          subject: `Baza treningowa gotowa — Poziom ${project.targetLevel}`,
          body: `Szanowny Panie Menedżerze,\n\nRozbudowa bazy treningowej została zakończona i odebrana. Klub ma teraz bazę treningową na Poziomie ${project.targetLevel}.\n\nLepsze boiska, zaplecze motoryczne, regeneracja i analiza treningu od następnego tygodnia będą wspierać rozwój zawodników.\n\nZ poważaniem,\nZarząd Klubu`,
          isGoodNews: true,
        },
      };
    }

    default:
      return null;
  }
};

export class TrainingFacilityService {
  static getEffectiveLevel(club?: Pick<Club, 'trainingFacilityLevel'> | null): TrainingFacilityLevel {
    return clampLevel(club?.trainingFacilityLevel);
  }

  static getPhaseLabel(phase: TrainingFacilityUpgradePhase): string {
    return getPhaseLabel(phase);
  }

  static getUpgradeCost(currentLevel: number): number | null {
    return TRAINING_FACILITY_UPGRADE_COSTS[clampLevel(currentLevel)] ?? null;
  }

  static getUpgradeCostRange(club: Club, currentLevel: number): { min: number; max: number } | null {
    const level = clampLevel(currentLevel);
    if (level >= 10) return null;
    return getClubUpgradeCostRange(club, level);
  }

  static getUpgradeCostTable(club?: Club): Array<{ fromLevel: TrainingFacilityLevel; targetLevel: TrainingFacilityLevel; cost: number; minCost: number; maxCost: number }> {
    return Object.entries(TRAINING_FACILITY_UPGRADE_COST_RANGES).map(([fromLevel, range]) => {
      const level = Number(fromLevel) as TrainingFacilityLevel;
      const clubRange = club ? getClubUpgradeCostRange(club, level) : { min: range[0], max: range[1] };
      return {
        fromLevel: level,
        targetLevel: (Number(fromLevel) + 1) as TrainingFacilityLevel,
        cost: Math.round((clubRange.min + clubRange.max) / 2),
        minCost: clubRange.min,
        maxCost: clubRange.max,
      };
    });
  }

  static getDevelopmentProfile(level: number, staffQuality?: number): TrainingFacilityDevelopmentProfile {
    const normalizedLevel = clampLevel(level);
    const facilityIndex = (normalizedLevel - 1) / 9;
    const normalizedStaffQuality = normalizeStaffQuality(staffQuality);
    const staffIndex = (normalizedStaffQuality - 1) / 19;

    // Modern infrastructure only helps when the staff can actually use its tools.
    const staffRequirement = 0.42 + facilityIndex * 0.58;
    const facilityUtilization = clamp((staffIndex + 0.10) / staffRequirement, 0.18, 1);
    const mismanagedComplexity = facilityIndex * (1 - facilityUtilization);
    const synergy = clamp(facilityIndex * facilityUtilization, 0, 1);

    const growthChanceMultiplier = clamp(
      0.84 + staffIndex * 0.18 + Math.pow(facilityIndex, 0.86) * 0.58 * facilityUtilization - mismanagedComplexity * 0.55,
      0.55,
      1.62
    );
    const regressionChanceMultiplier = clamp(
      1.10 - staffIndex * 0.10 - Math.pow(facilityIndex, 0.9) * 0.24 * facilityUtilization - synergy * 0.10 + mismanagedComplexity * 0.58,
      0.68,
      1.65
    );
    const rawCap = 1 + Math.pow(facilityIndex, 1.08) * 14;
    const extraSeasonalGrowthCap = Math.round(clamp(rawCap * (0.35 + facilityUtilization * 0.65), 1, 18));
    const peakSeasonOverallGain = Math.round(clamp(1 + Math.pow(synergy, 0.9) * 6 - mismanagedComplexity * 2.2, 0, 7));
    const typicalSeasonOverallGain = Math.round(clamp(Math.pow(synergy, 1.05) * 4 - mismanagedComplexity * 1.1 + 1, 0, 4));

    return {
      level: normalizedLevel,
      growthChanceMultiplier,
      regressionChanceMultiplier,
      extraSeasonalGrowthCap,
      peakSeasonOverallGain,
      typicalSeasonOverallGain,
      facilityUtilization,
      staffQuality: normalizedStaffQuality,
    };
  }

  static getAcademyDevelopmentMultiplier(level: number): number {
    const facilityIndex = (clampLevel(level) - 1) / 9;
    return 1 + Math.pow(facilityIndex, 0.9) * 0.08;
  }

  static checkEligibility(club: Club): TrainingFacilityEligibility {
    const currentLevel = TrainingFacilityService.getEffectiveLevel(club);
    if (currentLevel >= 10) {
      return { eligible: false, reasons: ['Baza treningowa ma już maksymalny poziom.'] };
    }

    const active = (club.trainingFacilityUpgradeProjects ?? [])
      .some(project => project.phase !== 'COMPLETED' && project.phase !== 'REJECTED');
    if (active) {
      return { eligible: false, reasons: ['Rozbudowa bazy treningowej już jest w toku.'] };
    }

    const estimatedCostRange = TrainingFacilityService.getUpgradeCostRange(club, currentLevel) ?? undefined;
    const reasons: string[] = [];

    return {
      eligible: reasons.length === 0,
      reasons,
      nextLevel: (currentLevel + 1) as TrainingFacilityLevel,
      estimatedCostRange,
    };
  }

  static createRequest(clubId: string, club: Club, currentDate: string): TrainingFacilityUpgradeProject {
    const fromLevel = TrainingFacilityService.getEffectiveLevel(club);
    const targetLevel = clampLevel(fromLevel + 1);
    const estimatedCostRange = TrainingFacilityService.getUpgradeCostRange(club, fromLevel) ?? { min: 0, max: 0 };
    const id = `tf_${clubId}_${fromLevel}_${targetLevel}_${Date.now()}`;
    return {
      id,
      fromLevel,
      targetLevel,
      phase: 'BOARD_REVIEW',
      startDate: currentDate,
      phaseEndDate: addDays(currentDate, 14 + Math.floor(hashSeed(id) * 14)),
      initialCostRangeMin: estimatedCostRange.min,
      initialCostRangeMax: estimatedCostRange.max,
      estimatedCost: 0,
      log: [{ date: currentDate, message: 'Wniosek o rozbudowę bazy treningowej złożony do zarządu. Zarząd przygotuje klubową wycenę przed decyzją finansową.', type: 'INFO' }],
    };
  }

  static advanceDay(club: Club, currentDate: string): TrainingFacilityAdvanceDayResult {
    const projects = club.trainingFacilityUpgradeProjects;
    if (!projects || projects.length === 0) return { updatedClub: club, events: [] };

    const active = projects.filter(project => project.phase !== 'COMPLETED' && project.phase !== 'REJECTED');
    if (active.length === 0) return { updatedClub: club, events: [] };

    let updatedClub = { ...club };
    const events: TrainingFacilityAdvanceEvent[] = [];

    for (const project of active) {
      if (currentDate < project.phaseEndDate) continue;
      const result = advancePhase(updatedClub, project, currentDate);
      if (result) {
        updatedClub = result.updatedClub;
        events.push(result.event);
      }
    }

    return { updatedClub, events };
  }
}
