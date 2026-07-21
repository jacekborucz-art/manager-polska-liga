import { AiFriendlyMatchReport, AiFriendlyPair, MailMessage, ReserveMatchResult } from '../types';

export const ARCHIVE_INTERVAL_SEASONS = 5;

const getValidDate = (value: Date | string): Date | null => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const SaveArchiveService = {
  shouldArchiveAfterSeason(completedSeasonNumber: number): boolean {
    return completedSeasonNumber > 0 && completedSeasonNumber % ARCHIVE_INTERVAL_SEASONS === 0;
  },

  archiveMessagesBefore(messages: MailMessage[], cutoff: Date): MailMessage[] {
    return messages.filter(mail => {
      const metadataType = mail.metadata?.type;
      if (metadataType === 'SEASON_SUMMARY') return true;
      const mailDate = getValidDate(mail.date);
      return !mailDate || mailDate >= cutoff;
    });
  },

  archiveReserveResultsBefore(results: ReserveMatchResult[], firstDetailedSeason: number): ReserveMatchResult[] {
    return results.filter(result => result.season >= firstDetailedSeason);
  },

  archiveAiFriendlyPairsBefore(pairs: AiFriendlyPair[], cutoff: Date): AiFriendlyPair[] {
    return pairs.filter(pair => {
      const date = getValidDate(pair.date);
      return !date || date >= cutoff;
    });
  },

  archiveAiFriendlyReportsBefore(reports: AiFriendlyMatchReport[], cutoff: Date): AiFriendlyMatchReport[] {
    return reports.filter(report => {
      const date = getValidDate(report.date);
      return !date || date >= cutoff;
    });
  },
};
