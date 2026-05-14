import { Club } from '../types';
import { FinanceService } from './FinanceService';

export interface BudgetMonitorResult {
  action: 'REDUCE' | 'RESTORE' | 'NONE';
  newBudget: number;
  newTransferBudget: number;
  newState: 'NORMAL' | 'ALERT' | 'SURPLUS';
  amountChanged: number;
  ratio: number;
  mailSubject: string;
  mailBody: string;
}

export const BoardFinanceMonitorService = {
  check: (club: Club): BudgetMonitorResult => {
    const projectedIncome = FinanceService.calculateInitialBudget(club.tier, club.reputation);
    const ratio = projectedIncome > 0 ? club.budget / projectedIncome : 0;
    const currentState = club.boardBudgetMonitorState ?? 'NORMAL';
    const transferBudgetCap = FinanceService.calculateTransferBudgetCap(club.budget, club.reputation);
    const transferBudgetGap = Math.max(0, transferBudgetCap - club.transferBudget);
    const newState: 'NORMAL' | 'ALERT' | 'SURPLUS' = ratio <= 0.08
      ? 'ALERT'
      : ratio >= 0.32 && transferBudgetGap >= Math.max(250_000, projectedIncome * 0.015)
        ? 'SURPLUS'
        : 'NORMAL';

    if (currentState === newState) {
      return {
        action: 'NONE',
        newBudget: club.budget,
        newTransferBudget: club.transferBudget,
        newState,
        amountChanged: 0,
        ratio,
        mailSubject: '',
        mailBody: ''
      };
    }

    if (newState === 'ALERT') {
      const severity = Math.min(1, ratio <= 0 ? 1 : 1 - (ratio / 0.08));
      const reductionFraction = ratio <= 0
        ? 1
        : ratio <= 0.02
          ? 0.85
          : ratio <= 0.04
            ? 0.65
            : 0.30 + severity * 0.25;
      const amountTaken = Math.min(club.transferBudget, Math.floor(club.transferBudget * reductionFraction));
      const newTransferBudget = Math.max(0, club.transferBudget - amountTaken);
      const newBudget = club.budget + amountTaken;
      const ratioPercent = (ratio * 100).toFixed(1);

      return {
        action: 'REDUCE',
        newBudget,
        newTransferBudget,
        newState,
        amountChanged: amountTaken,
        ratio,
        mailSubject: 'Pilne: Zarząd przesuwa środki z budżetu transferowego',
        mailBody: `Szanowny Panie Managerze,\n\nBieżąca sytuacja finansowa klubu wymaga natychmiastowej reakcji.\n\nAktualny stan kasy (${club.budget.toLocaleString('pl-PL')} PLN) stanowi jedynie ${ratioPercent}% oczekiwanych przychodów sezonu (${projectedIncome.toLocaleString('pl-PL')} PLN). Jest to poziom alarmowy.\n\nZarząd podjął decyzję o przesunięciu ${amountTaken.toLocaleString('pl-PL')} PLN z budżetu transferowego na saldo główne klubu.\n\nNowe saldo klubu: ${newBudget.toLocaleString('pl-PL')} PLN.\nNowy dostępny budżet transferowy: ${newTransferBudget.toLocaleString('pl-PL')} PLN.\n\nProsimy o powściągliwość w wydatkach do czasu poprawy sytuacji finansowej.\n\nZ poważaniem,\nDyrektor Finansowy, ${club.name}`,
      };
    }

    if (newState === 'NORMAL') {
      return {
        action: 'NONE',
        newBudget: club.budget,
        newTransferBudget: club.transferBudget,
        newState,
        amountChanged: 0,
        ratio,
        mailSubject: '',
        mailBody: ''
      };
    }

    const recoveryFactor = Math.min(1, Math.max(0, (ratio - 0.18) / 0.60));
    const amountRestored = Math.min(
      transferBudgetGap,
      Math.floor(club.budget * (0.04 + recoveryFactor * 0.08))
    );

    if (amountRestored <= 0) {
      return {
        action: 'NONE',
        newBudget: club.budget,
        newTransferBudget: club.transferBudget,
        newState,
        amountChanged: 0,
        ratio,
        mailSubject: '',
        mailBody: ''
      };
    }

    const newBudget = Math.max(0, club.budget - amountRestored);
    const newTransferBudget = club.transferBudget + amountRestored;

    return {
      action: 'RESTORE',
      newBudget,
      newTransferBudget,
      newState,
      amountChanged: amountRestored,
      ratio,
      mailSubject: 'Informacja finansowa: przelew na budżet transferowy',
      mailBody: `Szanowny Panie Managerze,\n\nSytuacja finansowa klubu uległa znaczącej poprawie. Po analizie salda oraz prognoz sezonowych Zarząd zdecydował o przesunięciu części wolnych środków na budżet transferowy.\n\nKwota przelewu: ${amountRestored.toLocaleString('pl-PL')} PLN.\nNowe saldo klubu: ${newBudget.toLocaleString('pl-PL')} PLN.\nNowy dostępny budżet transferowy: ${newTransferBudget.toLocaleString('pl-PL')} PLN.\n\nZ poważaniem,\nDyrektor Finansowy, ${club.name}`,
    };
  },
};
