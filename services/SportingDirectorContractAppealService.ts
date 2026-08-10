import {
  Club,
  ManagerProfile,
  Player,
  SportingDirectorContractArgument,
  SportingDirectorContractReply,
  SportingDirectorContractVetoAction,
  SportingDirectorContractVetoState,
  TransferContractInput,
} from '../types';
import { IncomingTransferService } from './IncomingTransferService';
import type { SportingDirectorFreeAgentAssessment } from './SportingDirectorService';

/**
 * Resolves the interactive appeal against a sporting director's free-agent veto.
 *
 * Conversation flow:
 * 1. EXPLANATION: the manager selects the main sporting/business argument.
 * 2. COUNTER_ARGUMENT: the director responds and the manager chooses one reply.
 * 3. The deterministic appeal roll either resolves as DIRECTOR_APPROVED or moves
 *    the case to APPEAL_FAILED.
 * 4. After failure the manager can withdraw, or use the high-risk ULTIMATUM.
 * 5. An ultimatum is binary: the owner approves the contract or fires the manager.
 *
 * This module is pure: it does not mutate React state, finances, squads or mail.
 * GameContext owns those side effects after inspecting the returned flags.
 */

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const daysBetween = (left: Date, right: Date): number =>
  Math.abs(left.getTime() - right.getTime()) / 86_400_000;

const managerLeverage = (profile: ManagerProfile | null): number =>
  clamp(Math.log2(Math.max(1, profile?.expPoints ?? 1) + 1) * 2.5, 0, 20);

/*
 * First-round arguments reward different director attributes. This makes the
 * choice contextual: squad need works better for an obvious positional gap,
 * market opportunity works better for an affordable deal, and manager trust
 * relies on the existing working relationship instead of player quality alone.
 */
const argumentScore = (
  state: SportingDirectorContractVetoState,
  club: Club,
  argument: SportingDirectorContractArgument,
): number => {
  const director = club.sportingDirector;
  if (!director) return 20;

  switch (argument) {
    case 'SPORTING_QUALITY':
      return clamp(8 + Math.max(0, state.positionFit) * 0.9 + director.footballKnowledge * 0.7 + director.ambition * 0.35, 4, 40);
    case 'POSITION_NEED':
      return clamp(7 + Math.max(0, state.positionFit + 4) * 1.25 + director.footballKnowledge * 0.65, 3, 40);
    case 'MARKET_OPPORTUNITY':
      return clamp(9 + Math.max(0, 1 - state.budgetUsage) * 12 + director.negotiation * 0.55 - Math.max(0, state.salaryRatio - 1.5) * 5, 3, 40);
    case 'MANAGER_TRUST':
      return clamp(4 + director.relationshipWithManager * 0.28 + director.flexibility * 0.75 - director.control * 0.35, 2, 40);
  }
};

const directorCounter = (
  state: SportingDirectorContractVetoState,
  argument: SportingDirectorContractArgument,
  score: number,
): string => {
  const opening = score >= 28
    ? 'Rozumiem ten argument i przyznaję, że ma sportowe podstawy.'
    : score >= 18
      ? 'Widzę część Pańskich racji, ale nadal nie usuwa to mojego głównego zastrzeżenia.'
      : 'Ten argument mnie nie przekonuje i nie odpowiada na ryzyko, które wskazałem.';

  const concern = state.reasonCode === 'WAGE_STRUCTURE'
    ? `Nowa pensja wynosi ${state.salaryRatio.toFixed(2)} średniej pensji kadry. Muszę chronić hierarchię w szatni.`
    : state.reasonCode === 'BUDGET'
      ? `Łączne zobowiązanie wykorzystuje ${(state.budgetUsage * 100).toFixed(1)}% dostępnego budżetu transferowego.`
      : state.reasonCode === 'CONTRACT_LENGTH'
        ? `Ryzyko dotyczy przede wszystkim ${state.years}-letniego okresu umowy przy wieku zawodnika.`
        : state.reasonCode === 'POSITION'
          ? 'Nie widzę wystarczającej luki na tej pozycji, aby uzasadnić taki koszt.'
          : 'Potrzebuję spójnego uzasadnienia sportowego i finansowego dla odstępstwa od polityki klubu.';

  return `${opening} ${concern}`;
};

const replyScore = (
  state: SportingDirectorContractVetoState,
  club: Club,
  reply: SportingDirectorContractReply,
): number => {
  const director = club.sportingDirector;
  if (!director) return 10;
  const matchingBonus =
    reply === 'USE_DATA' && (state.selectedArgument === 'SPORTING_QUALITY' || state.selectedArgument === 'POSITION_NEED') ? 8 :
    reply === 'OFFER_COMPROMISE' && state.selectedArgument === 'MARKET_OPPORTUNITY' ? 8 :
    reply === 'TAKE_RESPONSIBILITY' && state.selectedArgument === 'MANAGER_TRUST' ? 8 : 0;

  if (reply === 'USE_DATA') return matchingBonus + director.footballKnowledge * 0.55;
  if (reply === 'OFFER_COMPROMISE') return matchingBonus + director.negotiation * 0.45 + director.flexibility * 0.35;
  return matchingBonus + director.relationshipWithManager * 0.12 + director.flexibility * 0.45 - director.control * 0.25;
};

export interface ContractAppealServiceResult {
  state: SportingDirectorContractVetoState;
  approved: boolean;
  fired: boolean;
  withdrawn: boolean;
  relationDelta: number;
  boardConfidenceDelta: number;
  chance: number;
  message: string;
}

export const SportingDirectorContractAppealService = {
  /**
   * Freeze all relevant financial and sporting facts at veto time. The seed is
   * also created here and persisted in the mail metadata. Later calls never read
   * Math.random, which closes the save/reopen reroll exploit.
   */
  createCase(params: {
    contractMailId: string;
    vetoMailId: string;
    club: Club;
    player: Player;
    contract: TransferContractInput;
    assessment: SportingDirectorFreeAgentAssessment;
    date: Date;
  }): SportingDirectorContractVetoState {
    const { contractMailId, vetoMailId, club, player, contract, assessment, date } = params;
    const lastUltimatumDate = club.lastContractUltimatumDate ? new Date(club.lastContractUltimatumDate) : null;
    const ultimatumAvailable = !lastUltimatumDate || Number.isNaN(lastUltimatumDate.getTime()) || daysBetween(date, lastUltimatumDate) >= 365;

    return {
      contractMailId,
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      playerOverall: player.overallRating,
      playerAge: player.age,
      position: player.position,
      salary: contract.salary,
      years: contract.years,
      bonus: contract.bonus,
      totalCommitment: assessment.totalCommitment,
      transferBudget: club.transferBudget,
      budgetUsage: assessment.budgetUsage,
      wageBillBefore: assessment.wageBillBefore,
      wageBillAfter: assessment.wageBillAfter,
      averageSalary: assessment.averageSalary,
      highestSalary: assessment.highestSalary,
      salaryRatio: assessment.salaryRatio,
      positionFit: assessment.positionFit,
      resistance: assessment.resistance,
      reasonCode: assessment.reasonCode,
      reason: assessment.reason,
      stage: 'EXPLANATION',
      seed: IncomingTransferService.hashString(`${vetoMailId}|${club.id}|${player.id}|${date.toISOString().slice(0, 10)}`),
      ultimatumAvailable,
    };
  },

  applyAction(params: {
    state: SportingDirectorContractVetoState;
    action: SportingDirectorContractVetoAction;
    club: Club;
    managerProfile: ManagerProfile | null;
  }): ContractAppealServiceResult {
    const { state, action, club, managerProfile } = params;
    const neutral = (nextState: SportingDirectorContractVetoState, message: string, chance = 0): ContractAppealServiceResult => ({
      state: nextState,
      approved: false,
      fired: false,
      withdrawn: false,
      relationDelta: 0,
      boardConfidenceDelta: 0,
      chance,
      message,
    });

    // Round one records the chosen argument and produces the director's counter.
    if (state.stage === 'EXPLANATION' && ['SPORTING_QUALITY', 'POSITION_NEED', 'MARKET_OPPORTUNITY', 'MANAGER_TRUST'].includes(action)) {
      const argument = action as SportingDirectorContractArgument;
      const score = argumentScore(state, club, argument);
      const response = directorCounter(state, argument, score);
      return neutral({
        ...state,
        stage: 'COUNTER_ARGUMENT',
        selectedArgument: argument,
        argumentScore: score,
        directorResponse: response,
      }, response);
    }

    /*
     * Round two performs the normal appeal. The chance is capped at 80% so even
     * an excellent relationship cannot guarantee approval, and floored at 5% so
     * a difficult but financially valid deal retains a small exceptional path.
     */
    if (state.stage === 'COUNTER_ARGUMENT' && ['USE_DATA', 'OFFER_COMPROMISE', 'TAKE_RESPONSIBILITY'].includes(action)) {
      const reply = action as SportingDirectorContractReply;
      const director = club.sportingDirector;
      const followUp = replyScore(state, club, reply);
      const chance = clamp(
        10 +
        (state.argumentScore ?? 0) * 0.9 +
        followUp +
        (director?.relationshipWithManager ?? 50) * 0.16 +
        (club.boardConfidence ?? 60) * 0.12 +
        (director?.flexibility ?? 10) * 0.7 +
        managerLeverage(managerProfile) -
        (director?.control ?? 10) * 0.55 -
        Math.max(0, state.resistance - 70) * 0.75 -
        Math.max(0, state.budgetUsage - 0.45) * 22,
        5,
        80,
      );
      // The fixed seed offset identifies the normal-appeal roll for this case.
      const approved = IncomingTransferService.seededRandom(state.seed + 101) * 100 < chance;
      const message = approved
        ? 'Przekonał mnie Pan. Warunkowo wycofuję weto i biorę odpowiedzialność za przedstawienie tej decyzji zarządowi.'
        : 'Wysłuchałem wszystkich argumentów, ale podtrzymuję weto. Ryzyko dla klubu pozostaje zbyt duże.';
      return {
        state: {
          ...state,
          stage: approved ? 'RESOLVED' : 'APPEAL_FAILED',
          appealSummary: message,
          outcome: approved ? 'DIRECTOR_APPROVED' : undefined,
        },
        approved,
        fired: false,
        withdrawn: false,
        relationDelta: approved ? 2 : -2,
        boardConfidenceDelta: 0,
        chance,
        message,
      };
    }

    /*
     * The ultimatum deliberately bypasses the director and escalates to ownership.
     * Ambition/generosity/patience, board confidence and manager leverage support
     * the manager; experienced owners and controlling directors resist coercion.
     * There is no harmless rejection: failure means immediate dismissal.
     */
    if (state.stage === 'APPEAL_FAILED' && action === 'ULTIMATUM' && state.ultimatumAvailable) {
      const owner = club.management?.owner;
      const director = club.sportingDirector;
      const sportingMerit = clamp(Math.max(0, state.positionFit) * 1.2 + Math.max(0, state.playerOverall - 55) * 0.35, 0, 24);
      const chance = clamp(
        8 +
        (owner?.ambicja ?? 10) * 1.2 +
        (owner?.hojnosc ?? 10) * 0.8 +
        (owner?.cierpliwosc ?? 10) * 0.45 +
        (club.boardConfidence ?? 60) * 0.3 +
        managerLeverage(managerProfile) +
        sportingMerit +
        (director?.relationshipWithManager ?? 50) * 0.08 -
        (owner?.doswiadczenie ?? 10) * 0.85 -
        (director?.control ?? 10) * 0.5 -
        Math.max(0, state.budgetUsage - 0.45) * 25,
        5,
        80,
      );
      // A separate stable offset prevents the appeal roll from leaking into this roll.
      const approved = IncomingTransferService.seededRandom(state.seed + 909) * 100 < chance;
      const message = approved
        ? 'Właściciel nie chce ryzykować odejścia trenera. Zarząd zatwierdza kontrakt mimo sprzeciwu dyrektora sportowego.'
        : 'Właściciel odrzuca ultimatum. Zarząd uznał szantaż za utratę zaufania i natychmiast kończy współpracę z trenerem.';
      return {
        state: {
          ...state,
          stage: 'RESOLVED',
          appealSummary: message,
          outcome: approved ? 'OWNER_APPROVED' : 'MANAGER_FIRED',
          ultimatumAvailable: false,
        },
        approved,
        fired: !approved,
        withdrawn: false,
        relationDelta: approved ? -15 : -25,
        boardConfidenceDelta: approved ? -8 : -20,
        chance,
        message,
      };
    }

    /*
     * Withdrawal is safe for the manager, but GameContext treats breaking an
     * already accepted agreement as an offence to the agent and applies a hidden
     * club-specific negotiation lockout for several months.
     */
    if ((state.stage === 'EXPLANATION' || state.stage === 'APPEAL_FAILED') && action === 'WITHDRAW') {
      const message = 'Trener wycofał się z transferu. Agent zawodnika został poinformowany o zakończeniu rozmów.';
      return {
        state: { ...state, stage: 'RESOLVED', appealSummary: message, outcome: 'WITHDRAWN' },
        approved: false,
        fired: false,
        withdrawn: true,
        relationDelta: 0,
        boardConfidenceDelta: 0,
        chance: 0,
        message,
      };
    }

    // Invalid/stale actions are no-ops, protecting against double clicks and old UI.
    return neutral(state, 'Ta odpowiedź nie jest dostępna na obecnym etapie rozmowy.');
  },
};
