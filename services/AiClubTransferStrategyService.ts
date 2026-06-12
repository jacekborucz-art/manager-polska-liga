import { Club, Player } from '../types';
import { FinanceService } from './FinanceService';

export type AiTransferAgeProfile = 'YOUTH' | 'PRIME' | 'EXPERIENCED' | 'BALANCED';

export interface AiClubTransferStrategy {
  ageProfile: AiTransferAgeProfile;
  budgetAggression: number;
  maxOverpayMultiplier: number;
  patience: number;
  panicBuyChance: number;
  youthPreference: number;
  primePreference: number;
  experiencePreference: number;
  reputationPreference: number;
  financialDiscipline: number;
  protectYouth: boolean;
  sellVeterans: boolean;
}

interface CandidateContext {
  needUrgency?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  isShortage?: boolean;
  isTransferListed?: boolean;
  askingPrice?: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const levelScore: Record<string, number> = {
  bardzo_niska: 3,
  niska: 6,
  przecietna: 10,
  wysoka: 14,
  bardzo_wysoka: 18,
};

const getDirector = (club: Club) => club.sportingDirector;
const getOwner = (club: Club) => club.management?.owner;
const getCfo = (club: Club) => club.management?.cfo;

export const AiClubTransferStrategyService = {
  buildStrategy(club: Club): AiClubTransferStrategy {
    const director = getDirector(club);
    const owner = getOwner(club);
    const cfo = getCfo(club);
    const board = club.board;

    const ambition = director?.ambition ?? owner?.ambicja ?? levelScore[board?.ambicja ?? 'przecietna'];
    const flexibility = director?.flexibility ?? 10;
    const financialDisciplineRaw = Math.max(
      director?.financialDiscipline ?? 10,
      cfo?.dyscyplinaFinansowa ?? 10,
      21 - levelScore[board?.chciwosc ?? 'przecietna']
    );
    const developmentVision = director?.developmentVision ?? 10;
    const footballKnowledge = director?.footballKnowledge ?? 10;
    const negotiation = director?.negotiation ?? 10;
    const generosity = owner?.hojnosc ?? levelScore[board?.hojnosc ?? 'przecietna'];
    const ownerAmbition = owner?.ambicja ?? ambition;
    const patienceRaw = Math.max(owner?.cierpliwosc ?? 10, levelScore[board?.cierpliwosc ?? 'przecietna']);

    const financialDiscipline = clamp(financialDisciplineRaw / 20, 0.2, 1);
    const ambitionScore = clamp((ambition + ownerAmbition) / 40, 0.15, 1);
    const generosityScore = clamp(generosity / 20, 0.1, 1);
    const knowledgeScore = clamp(footballKnowledge / 20, 0.15, 1);
    const negotiationScore = clamp(negotiation / 20, 0.15, 1);
    const patience = clamp(patienceRaw / 20, 0.1, 1);

    const personality = director?.personality;
    let ageProfile: AiTransferAgeProfile = 'BALANCED';
    if (personality === 'TALENT_HUNTER' || developmentVision >= 15) ageProfile = 'YOUTH';
    else if (personality === 'ACCOUNTANT' || financialDisciplineRaw >= 16) ageProfile = 'PRIME';
    else if (personality === 'CONTROLLER' && ambition >= 14) ageProfile = 'EXPERIENCED';

    const budgetAggression = clamp(
      0.85 +
        ambitionScore * 0.22 +
        generosityScore * 0.16 +
        negotiationScore * 0.10 -
        financialDiscipline * 0.18,
      0.75,
      1.32
    );

    return {
      ageProfile,
      budgetAggression,
      maxOverpayMultiplier: clamp(1.04 + ambitionScore * 0.22 + negotiationScore * 0.14 - financialDiscipline * 0.16, 0.95, 1.35),
      patience,
      panicBuyChance: clamp(0.14 + ambitionScore * 0.16 - patience * 0.18, 0.02, 0.24),
      youthPreference: clamp((developmentVision / 20) + (personality === 'TALENT_HUNTER' ? 0.25 : 0), 0.15, 1.25),
      primePreference: clamp(0.55 + knowledgeScore * 0.35 + financialDiscipline * 0.15, 0.2, 1.1),
      experiencePreference: clamp(0.35 + ambitionScore * 0.30 + (personality === 'CONTROLLER' ? 0.16 : 0), 0.1, 1.0),
      reputationPreference: clamp(0.25 + ambitionScore * 0.40 + generosityScore * 0.15, 0.05, 1.05),
      financialDiscipline,
      protectYouth: developmentVision >= 14 || personality === 'TALENT_HUNTER',
      sellVeterans: financialDisciplineRaw >= 14 || personality === 'ACCOUNTANT',
    };
  },

  candidateScore(player: Player, club: Club, strategy: AiClubTransferStrategy, context: CandidateContext = {}): number {
    const talentGap = Math.max(0, (player.attributes?.talent ?? player.overallRating) - player.overallRating);
    const reputation = player.reputacja ?? 50;
    const ageScore =
      player.age <= 22 ? strategy.youthPreference * 8 :
      player.age <= 26 ? strategy.primePreference * 6 :
      player.age <= 30 ? strategy.primePreference * 4 :
      player.age <= 33 ? strategy.experiencePreference * 3 :
      -strategy.financialDiscipline * 5;
    const profileBonus =
      strategy.ageProfile === 'YOUTH' && player.age <= 23 ? 5 :
      strategy.ageProfile === 'PRIME' && player.age >= 24 && player.age <= 29 ? 4 :
      strategy.ageProfile === 'EXPERIENCED' && player.age >= 29 && player.age <= 33 ? 3 :
      0;
    const urgencyBonus =
      context.needUrgency === 'CRITICAL' ? 5 :
      context.needUrgency === 'HIGH' ? 3 :
      context.needUrgency === 'LOW' ? -1 :
      0;
    const bargainBonus = context.isTransferListed ? 3 * (1 - strategy.financialDiscipline * 0.25) : 0;
    const pricePenalty = context.askingPrice
      ? Math.max(0, context.askingPrice / Math.max(1, club.budget) - 0.25) * 18 * strategy.financialDiscipline
      : 0;

    return (
      player.overallRating +
      talentGap * strategy.youthPreference * 0.35 +
      ((reputation - 50) / 10) * strategy.reputationPreference +
      ageScore +
      profileBonus +
      urgencyBonus +
      bargainBonus -
      pricePenalty
    );
  },

  budgetCap(baseCap: number, strategy: AiClubTransferStrategy, context: CandidateContext = {}): number {
    const urgencyBoost = context.needUrgency === 'CRITICAL' || context.isShortage ? 0.10 : context.needUrgency === 'HIGH' ? 0.05 : 0;
    return clamp(baseCap * strategy.budgetAggression + urgencyBoost, 0.20, 0.94);
  },

  shouldRelaxForPanic(strategy: AiClubTransferStrategy, seed: number, needUrgency?: CandidateContext['needUrgency']): boolean {
    if (needUrgency !== 'HIGH' && needUrgency !== 'CRITICAL') return false;
    const x = Math.sin(seed + 17) * 10000;
    const roll = x - Math.floor(x);
    return roll < strategy.panicBuyChance;
  },

  outgoingScore(player: Player, club: Club, strategy: AiClubTransferStrategy): number {
    const salaryPressure = player.annualSalary / Math.max(1, FinanceService.getFairMarketSalary(player.overallRating));
    const talentGap = Math.max(0, (player.attributes?.talent ?? player.overallRating) - player.overallRating);
    const youthProtection = strategy.protectYouth && player.age <= 23 ? talentGap * 0.55 + 5 : 0;
    const veteranPressure = strategy.sellVeterans && player.age >= 31 ? (player.age - 30) * 1.5 : 0;
    const reputationProtection = Math.max(0, (player.reputacja ?? 50) - 60) * strategy.reputationPreference * 0.12;

    return (
      salaryPressure * 2.5 +
      veteranPressure +
      (player.age >= 30 ? strategy.financialDiscipline * 2 : 0) -
      youthProtection -
      reputationProtection -
      (club.sportingDirectorPolicy?.protectedPlayers.some(item => item.playerId === player.id) ? 8 : 0) +
      (club.sportingDirectorPolicy?.sellCandidates.some(item => item.playerId === player.id) ? 8 : 0)
    );
  },
};
