import { AiFriendlyMatchReport, AiFriendlyPair, MailMessage, ReserveMatchResult } from '../types';

export const FULL_DETAIL_SEASONS = 5;

const getValidDate = (value: Date | string): Date | null => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const SaveArchiveService = {
  getFirstDetailedSeason(currentSeasonNumber: number): number {
    return Math.max(1, currentSeasonNumber - FULL_DETAIL_SEASONS + 1);
  },

  getMailAndReportCutoff(currentDate: Date): Date {
    const seasonStartYear = currentDate.getMonth() >= 6
      ? currentDate.getFullYear()
      : currentDate.getFullYear() - 1;
    return new Date(seasonStartYear - FULL_DETAIL_SEASONS + 1, 6, 1);
  },

  pruneMessages(messages: MailMessage[], currentDate: Date): MailMessage[] {
    const cutoff = this.getMailAndReportCutoff(currentDate);
    return messages.filter(mail => {
      const metadataType = mail.metadata?.type;
      if (metadataType === 'SEASON_SUMMARY') return true;
      const mailDate = getValidDate(mail.date);
      return !mailDate || mailDate >= cutoff;
    });
  },

  pruneReserveResults(results: ReserveMatchResult[], currentSeasonNumber: number): ReserveMatchResult[] {
    const firstDetailedSeason = this.getFirstDetailedSeason(currentSeasonNumber);
    return results.filter(result => result.season >= firstDetailedSeason);
  },

  pruneAiFriendlyPairs(pairs: AiFriendlyPair[], currentDate: Date): AiFriendlyPair[] {
    const cutoff = this.getMailAndReportCutoff(currentDate);
    return pairs.filter(pair => {
      const date = getValidDate(pair.date);
      return !date || date >= cutoff;
    });
  },

  pruneAiFriendlyReports(reports: AiFriendlyMatchReport[], currentDate: Date): AiFriendlyMatchReport[] {
    const cutoff = this.getMailAndReportCutoff(currentDate);
    return reports.filter(report => {
      const date = getValidDate(report.date);
      return !date || date >= cutoff;
    });
  },
};
