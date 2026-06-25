import {
  Club,
  HealthStatus,
  MysteryAgentBoardRequestResult,
  MysteryAgentContractOffer,
  MysteryAgentNegotiationResult,
  MysteryAgentOfferState,
  Player,
  PlayerPosition,
  Region,
} from '../types';
import { NameGeneratorService } from './NameGeneratorService';
import { PlayerAttributesGenerator } from './PlayerAttributesGenerator';
import { FinanceService } from './FinanceService';
import { pickNationalityForRegion } from './NationalityService';
import { calcReputacja } from './SquadGeneratorService';

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const roundMoney = (value: number, step = 1_000): number =>
  Math.max(0, Math.round(value / step) * step);

const nonEuropeanRegions: Region[] = [
  Region.SSA,
  Region.BRAZIL,
  Region.ARGENTINA,
  Region.SOUTH_AMERICAN,
  Region.MEXICO,
  Region.NORTH_AMERICA,
  Region.OCEANIA,
  Region.JAPAN,
  Region.KOREA,
  Region.ARABIA,
];

const positions: PlayerPosition[] = [
  PlayerPosition.GK,
  PlayerPosition.DEF,
  PlayerPosition.DEF,
  PlayerPosition.MID,
  PlayerPosition.MID,
  PlayerPosition.FWD,
];

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getRandomItem = <T,>(items: T[], seed: string): T =>
  items[hashString(seed) % items.length];

const getSquadAverageOverall = (squad: Player[]): number =>
  squad.length > 0
    ? Math.round(squad.reduce((sum, player) => sum + player.overallRating, 0) / squad.length)
    : 55;

const getHighestSalary = (squad: Player[]): number =>
  Math.max(80_000, ...squad.map(player => player.annualSalary || 0));

const buildContractEndDate = (currentDate: Date, years: number): string => {
  const end = new Date(currentDate);
  end.setFullYear(end.getFullYear() + years);
  return end.toISOString().split('T')[0];
};

const getTotalCost = (contract: MysteryAgentContractOffer): number =>
  contract.signingFee + contract.salary * contract.years;

export const MysteryAgentService = {
  getSeasonTriggerDate(seasonNumber: number, userClubId: string): string {
    const seasonStartYear = 2023 + Math.max(0, seasonNumber - 1);
    const seasonStart = new Date(seasonStartYear, 6, 15);
    const offsetDays = 20 + (hashString(`${seasonNumber}|${userClubId}|mystery-agent-day`) % 270);
    seasonStart.setDate(seasonStart.getDate() + offsetDays);
    return seasonStart.toISOString().split('T')[0];
  },

  shouldTriggerOffer(params: {
    currentDate: Date;
    seasonNumber: number;
    userClubId: string;
    existingOffer: MysteryAgentOfferState | null;
  }): boolean {
    if (params.existingOffer?.seasonNumber === params.seasonNumber) return false;
    if (params.currentDate.getMonth() === 5) return false;

    const today = params.currentDate.toISOString().split('T')[0];
    const triggerDate = MysteryAgentService.getSeasonTriggerDate(params.seasonNumber, params.userClubId);
    return today >= triggerDate;
  },

  createOffer(params: {
    seasonNumber: number;
    club: Club;
    squad: Player[];
    currentDate: Date;
  }): MysteryAgentOfferState {
    const seed = `${params.seasonNumber}|${params.club.id}|${params.currentDate.toISOString()}`;
    const position = getRandomItem(positions, `${seed}|position`);
    const region = getRandomItem(nonEuropeanRegions, `${seed}|region`);
    const name = NameGeneratorService.getRandomName(region);
    const age = 17 + (hashString(`${seed}|age`) % 5);
    const averageOverall = getSquadAverageOverall(params.squad);
    const hiddenOverallRating = clamp(
      averageOverall - 8 + (hashString(`${seed}|overall`) % 15),
      35,
      92
    );
    const genData = PlayerAttributesGenerator.generateAttributes(
      position,
      1,
      params.club.reputation,
      age,
      true,
      {
        minBase: clamp(hiddenOverallRating - 5, 1, 99),
        maxBase: clamp(hiddenOverallRating + 5, 1, 99),
        hardCap: 99,
      }
    );
    const attributes = { ...genData.attributes, talent: 99 };
    const highestSalary = getHighestSalary(params.squad);
    const salaryMultiplier = 0.5 + (hashString(`${seed}|salary`) % 201) / 100;
    const askingSalary = roundMoney(highestSalary * salaryMultiplier, 5_000);
    const minimumSalary = roundMoney(askingSalary * (0.78 + (hashString(`${seed}|min-salary`) % 8) / 100), 5_000);
    const askingSigningFee = roundMoney(askingSalary * (0.55 + (hashString(`${seed}|signing`) % 96) / 100), 5_000);
    const minimumSigningFee = roundMoney(askingSigningFee * (0.72 + (hashString(`${seed}|min-signing`) % 11) / 100), 5_000);

    const player: Player = {
      id: `MYSTERY_${params.seasonNumber}_${params.club.id}_${hashString(seed)}`,
      firstName: name.firstName,
      lastName: name.lastName,
      age,
      clubId: 'FREE_AGENTS',
      nationality: region,
      nationalityCountry: pickNationalityForRegion(region),
      position,
      overallRating: hiddenOverallRating,
      attributes,
      stats: {
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        cleanSheets: 0,
        matchesPlayed: 0,
        minutesPlayed: 0,
        seasonalChanges: {},
        ratingHistory: [],
      },
      health: { status: HealthStatus.HEALTHY },
      condition: 100,
      suspensionMatches: 0,
      contractEndDate: buildContractEndDate(params.currentDate, 2),
      annualSalary: 0,
      isOnTransferList: false,
      marketValue: FinanceService.calculateMarketValue(
        { overallRating: hiddenOverallRating, age } as Player,
        params.club.reputation,
        FinanceService.getClubTier(params.club),
        params.club.country
      ),
      history: [{
        clubName: 'Ukryta pula skautingu',
        clubId: 'FREE_AGENTS',
        fromYear: params.currentDate.getFullYear(),
        fromMonth: params.currentDate.getMonth() + 1,
        toYear: null,
        toMonth: null,
      }],
      boardLockoutUntil: null,
      isUntouchable: false,
      negotiationStep: 0,
      negotiationLockoutUntil: null,
      contractLockoutUntil: null,
      fatigueDebt: 0,
      reputacja: calcReputacja(hiddenOverallRating, params.club.reputation),
      lojalnosc: 20 + (hashString(`${seed}|loyalty`) % 80),
      isNegotiationPermanentBlocked: false,
      transferLockoutUntil: null,
      freeAgentLockoutUntil: null,
      freeAgentClubLockouts: {},
      mysteryAgentHiddenUntilScouted: true,
      mysteryAgentProspect: true,
    };

    return {
      id: `MYSTERY_AGENT_${params.seasonNumber}_${params.club.id}`,
      seasonNumber: params.seasonNumber,
      clubId: params.club.id,
      createdDate: params.currentDate.toISOString().split('T')[0],
      player,
      hiddenOverallRating,
      askingSigningFee,
      askingSalary,
      minimumSigningFee,
      minimumSalary,
      attemptsUsed: 0,
      maxAttempts: 3,
      status: 'ACTIVE',
      boardRequestUsed: false,
      lastAgentMessage: 'Mój klient ma talent 99. Nie pytaj skąd go znam. Pytaj, czy masz odwagę zaryzykować.',
    };
  },

  evaluateOffer(
    offer: MysteryAgentOfferState,
    contract: MysteryAgentContractOffer,
    currentDate: Date
  ): MysteryAgentNegotiationResult {
    if (offer.status !== 'ACTIVE') {
      return { accepted: false, ended: true, message: 'Ta rozmowa nie jest już aktywna.', nextOffer: offer };
    }

    const attemptsUsed = offer.attemptsUsed + 1;
    const salaryRatio = contract.salary / Math.max(offer.minimumSalary, 1);
    const signingRatio = contract.signingFee / Math.max(offer.minimumSigningFee, 1);
    const yearsScore = contract.years >= 3 ? 0.06 : contract.years === 2 ? 0.02 : -0.05;
    const bonusScore = ((contract.goalBonus ?? 0) + (contract.assistBonus ?? 0) + (contract.cleanSheetBonus ?? 0)) /
      Math.max(offer.askingSalary, 1) * 0.8;
    const score = salaryRatio * 0.58 + signingRatio * 0.36 + yearsScore + bonusScore;
    const isInsult = salaryRatio < 0.58 || signingRatio < 0.50 || score < 0.62;
    const accepted = score >= 1.0;
    const joinDate = new Date(currentDate);
    joinDate.setDate(joinDate.getDate() + 1);

    if (accepted) {
      return {
        accepted: true,
        ended: true,
        message: 'Agent milknie na chwilę, potem kiwa głową. Umowa jest gotowa, zawodnik pojawi się w klubie jutro.',
        nextOffer: {
          ...offer,
          status: 'AGREED',
          attemptsUsed,
          joinDate: joinDate.toISOString().split('T')[0],
          agreedContract: contract,
          lastAgentMessage: 'Umowa zaakceptowana.',
        },
      };
    }

    if (isInsult || attemptsUsed >= offer.maxAttempts) {
      return {
        accepted: false,
        ended: true,
        message: isInsult
          ? 'Agent uznaje ofertę za obraźliwą i kończy rozmowy. Zawodnik znika z radarów klubu.'
          : 'Trzecia propozycja nie przekonała agenta. Zawodnik trafia do ukrytej puli skautingu.',
        nextOffer: {
          ...offer,
          status: 'FAILED',
          attemptsUsed,
          lastAgentMessage: 'Rozmowy zakończone bez porozumienia.',
        },
      };
    }

    const pressure = attemptsUsed === 1
      ? 'Agent kręci głową. Mówi, że możesz spróbować jeszcze raz, ale czas ucieka.'
      : 'Agent robi się chłodny. To ostatnia szansa, żeby podnieść warunki.';

    return {
      accepted: false,
      ended: false,
      message: pressure,
      nextOffer: {
        ...offer,
        attemptsUsed,
        lastAgentMessage: pressure,
      },
    };
  },

  evaluateBoardRequest(
    offer: MysteryAgentOfferState,
    club: Club,
    squad: Player[],
    requestedShortfall: number
  ): MysteryAgentBoardRequestResult {
    if (offer.boardRequestUsed) {
      return {
        approved: false,
        ended: false,
        grantedAmount: 0,
        message: 'Zarząd już rozpatrzył ten wniosek.',
        nextOffer: offer,
      };
    }

    const highestSalary = getHighestSalary(squad);
    const boardFundCeiling = Math.max(club.reserveBudget ?? 0, Math.round((club.budget + club.transferBudget) * 0.25));
    if (requestedShortfall > boardFundCeiling) {
      return {
        approved: false,
        ended: true,
        grantedAmount: 0,
        message: 'Zarząd nie ma funduszy, żeby pokryć taką operację. Agent kończy rozmowy.',
        nextOffer: { ...offer, status: 'FAILED', boardRequestUsed: true, boardApproved: false },
      };
    }

    const confidence = club.boardConfidence ?? 65;
    const ambition = club.board?.ambicja === 'bardzo_wysoka' ? 14 : club.board?.ambicja === 'wysoka' ? 9 : 0;
    const greedPenalty = club.board?.chciwosc === 'bardzo_wysoka' ? 18 : club.board?.chciwosc === 'wysoka' ? 10 : 0;
    const costPressure = clamp((requestedShortfall / Math.max(highestSalary * 4, 1)) * 22, 0, 24);
    const roll = hashString(`${offer.id}|board|${requestedShortfall}|${club.boardBudgetRequestsThisSeason ?? 0}`) % 100;
    const threshold = clamp(42 + ambition + confidence * 0.22 - greedPenalty - costPressure, 18, 82);
    const approved = roll < threshold;

    if (!approved) {
      return {
        approved: false,
        ended: true,
        grantedAmount: 0,
        message: 'Zarząd odmawia. Uznaje ryzyko finansowe za zbyt duże, a agent natychmiast kończy rozmowy.',
        nextOffer: { ...offer, status: 'FAILED', boardRequestUsed: true, boardApproved: false },
      };
    }

    return {
      approved: true,
      ended: false,
      grantedAmount: requestedShortfall,
      message: 'Zarząd wyraża zgodę na jednorazowe wsparcie. Masz jeszcze swoje trzy propozycje dla agenta.',
      nextOffer: {
        ...offer,
        boardRequestUsed: true,
        boardApproved: true,
        boardSupportAmount: requestedShortfall,
      },
    };
  },

  getTotalCost,
};
