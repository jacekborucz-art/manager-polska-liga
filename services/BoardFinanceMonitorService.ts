import { Club } from '../types';
import { FinanceService } from './FinanceService';

export interface BudgetMonitorResult {
  action: 'REDUCE' | 'RESTORE' | 'RESERVE_SUPPORT' | 'NONE';
  newBudget: number;
  newTransferBudget: number;
  newReserveBudget: number;
  newState: 'NORMAL' | 'ALERT' | 'SURPLUS';
  amountChanged: number;
  ratio: number;
  mailSubject: string;
  mailBody: string;
}

export const BoardFinanceMonitorService = {
  check: (club: Club, date: Date = new Date()): BudgetMonitorResult => {
    const projectedIncome = FinanceService.calculateInitialBudget(club.tier, club.reputation);
    const ratio = projectedIncome > 0 ? club.budget / projectedIncome : 0;
    const reserveBudget = Math.max(0, club.reserveBudget ?? FinanceService.calculateInitialReserveBudget(club.budget, club.reputation));
    const currentState = club.boardBudgetMonitorState ?? 'NORMAL';
    const daysSinceShift = (action: 'REDUCE' | 'RESTORE'): number | null => {
      if (club.boardBudgetLastShiftAction !== action || !club.boardBudgetLastShiftDate) return null;
      return Math.floor((date.getTime() - new Date(club.boardBudgetLastShiftDate).getTime()) / 86_400_000);
    };
    const transferBudgetCap = FinanceService.calculateTransferBudgetCap(club.budget, club.reputation);
    const transferBudgetTarget = Math.floor(transferBudgetCap * 0.72);
    const transferBudgetGap = Math.max(0, transferBudgetTarget - club.transferBudget);
    const newState: 'NORMAL' | 'ALERT' | 'SURPLUS' = ratio <= 0.08
      ? 'ALERT'
      : ratio >= 0.32 && reserveBudget >= Math.max(250_000, projectedIncome * 0.01) && transferBudgetGap >= Math.max(250_000, projectedIncome * 0.015)
        ? 'SURPLUS'
        : 'NORMAL';

    if (currentState === newState) {
      return {
        action: 'NONE',
        newBudget: club.budget,
        newTransferBudget: club.transferBudget,
        newReserveBudget: reserveBudget,
        newState,
        amountChanged: 0,
        ratio,
        mailSubject: '',
        mailBody: ''
      };
    }

    if (newState === 'ALERT') {
      const daysSinceReduce = daysSinceShift('REDUCE');
      if (daysSinceReduce !== null && daysSinceReduce < 14) {
        return {
          action: 'NONE',
          newBudget: club.budget,
          newTransferBudget: club.transferBudget,
          newReserveBudget: reserveBudget,
          newState,
          amountChanged: 0,
          ratio,
          mailSubject: '',
          mailBody: ''
        };
      }

      const severity = Math.min(1, ratio <= 0 ? 1 : 1 - (ratio / 0.08));
      const reductionFraction = ratio <= 0
        ? 1
        : ratio <= 0.02
          ? 0.85
          : ratio <= 0.04
            ? 0.65
            : 0.30 + severity * 0.25;
      const targetSupport = Math.max(0, Math.floor(projectedIncome * 0.095 - club.budget));
      const amountFromReserve = Math.min(reserveBudget, targetSupport);
      const transferPressure = Math.max(0, targetSupport - amountFromReserve);
      const amountTaken = Math.min(
        club.transferBudget,
        Math.max(transferPressure, Math.floor(club.transferBudget * reductionFraction))
      );
      const newTransferBudget = Math.max(0, club.transferBudget - amountTaken);
      const newBudget = club.budget + amountFromReserve + amountTaken;
      const newReserveBudget = reserveBudget - amountFromReserve;
      const ratioPercent = (ratio * 100).toFixed(1);

      return {
        action: amountTaken > 0 ? 'REDUCE' : 'RESERVE_SUPPORT',
        newBudget,
        newTransferBudget,
        newReserveBudget,
        newState,
        amountChanged: amountFromReserve + amountTaken,
        ratio,
        mailSubject: amountTaken > 0
          ? 'Pilne: Zarząd przesuwa środki awaryjne'
          : 'Pilne: Zarząd uruchamia rezerwę finansową',
        mailBody: `Szanowny Panie Managerze,\n\nBieżąca sytuacja finansowa klubu wymaga natychmiastowej reakcji.\n\nAktualny stan kasy (${club.budget.toLocaleString('pl-PL')} PLN) stanowi jedynie ${ratioPercent}% oczekiwanych przychodów sezonu (${projectedIncome.toLocaleString('pl-PL')} PLN). Jest to poziom alarmowy.\n\nZarząd podjął decyzję o przesunięciu ${amountFromReserve.toLocaleString('pl-PL')} PLN z rezerwy zarządu${amountTaken > 0 ? ` oraz ${amountTaken.toLocaleString('pl-PL')} PLN z budżetu transferowego` : ''} na saldo główne klubu.\n\nNowe saldo klubu: ${newBudget.toLocaleString('pl-PL')} PLN.\nPozostała rezerwa zarządu: ${newReserveBudget.toLocaleString('pl-PL')} PLN.\nNowy dostępny budżet transferowy: ${newTransferBudget.toLocaleString('pl-PL')} PLN.\n\nProsimy o powściągliwość w wydatkach do czasu poprawy sytuacji finansowej.\n\nZ poważaniem,\nDyrektor Finansowy, ${club.name}`,
      };
    }

    if (newState === 'NORMAL') {
      return {
        action: 'NONE',
        newBudget: club.budget,
        newTransferBudget: club.transferBudget,
        newReserveBudget: reserveBudget,
        newState,
        amountChanged: 0,
        ratio,
        mailSubject: '',
        mailBody: ''
      };
    }

    const daysSinceRestore = daysSinceShift('RESTORE');
    if (daysSinceRestore !== null && daysSinceRestore < 45) {
      return {
        action: 'NONE',
        newBudget: club.budget,
        newTransferBudget: club.transferBudget,
        newReserveBudget: reserveBudget,
        newState,
        amountChanged: 0,
        ratio,
        mailSubject: '',
        mailBody: ''
      };
    }

    const daysSinceReduce = daysSinceShift('REDUCE');
    const restoredAfterRecentCut = daysSinceReduce !== null && daysSinceReduce <= 90;
    const recoveryFactor = Math.min(1, Math.max(0, (ratio - 0.18) / 0.60));
    const amountRestored = Math.min(
      reserveBudget,
      transferBudgetGap,
      Math.floor(reserveBudget * (restoredAfterRecentCut ? 0.42 : 0.24) * recoveryFactor)
    );

    if (amountRestored <= 0) {
      return {
        action: 'NONE',
        newBudget: club.budget,
        newTransferBudget: club.transferBudget,
        newReserveBudget: reserveBudget,
        newState,
        amountChanged: 0,
        ratio,
        mailSubject: '',
        mailBody: ''
      };
    }

    const newBudget = club.budget;
    const newTransferBudget = club.transferBudget + amountRestored;
    const newReserveBudget = reserveBudget - amountRestored;

    return {
      action: 'RESTORE',
      newBudget,
      newTransferBudget,
      newReserveBudget,
      newState,
      amountChanged: amountRestored,
      ratio,
      mailSubject: 'Informacja finansowa: przelew na budżet transferowy',
      mailBody: `Szanowny Panie Managerze,\n\nSytuacja finansowa klubu uległa znaczącej poprawie. Po analizie salda, rezerwy zarządu oraz prognoz sezonowych Zarząd zdecydował o przesunięciu części środków rezerwowych na budżet transferowy.\n\nKwota przelewu: ${amountRestored.toLocaleString('pl-PL')} PLN.\nSaldo klubu bez zmian: ${newBudget.toLocaleString('pl-PL')} PLN.\nPozostała rezerwa zarządu: ${newReserveBudget.toLocaleString('pl-PL')} PLN.\nNowy dostępny budżet transferowy: ${newTransferBudget.toLocaleString('pl-PL')} PLN.\n\nZ poważaniem,\nDyrektor Finansowy, ${club.name}`,
    };
  },
};
