import { Player, PlayerCareerStatsSnapshot, PlayerHistoryEntry, PlayerLoanInfo, PlayerStats } from '../types';

interface CareerEntryTarget {
  clubId: string | 'FREE_AGENTS';
  clubName: string;
}

export const PlayerCareerService = {
  emptyStats(): PlayerStats {
    return {
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
      matchesPlayed: 0,
      minutesPlayed: 0,
      seasonalChanges: {},
      ratingHistory: []
    };
  },

  resetClubStatsForNewEntry(player: Player): Player {
    return {
      ...player,
      stats: this.emptyStats(),
      cupStats: this.emptyStats(),
      euroStats: this.emptyStats(),
      friendlyStats: this.emptyStats(),
      reserveStats: undefined
    };
  },

  buildStatsSnapshot(player: Player): PlayerCareerStatsSnapshot {
    const ratingHistory = player.stats?.ratingHistory || [];
    const averageRating = ratingHistory.length > 0
      ? parseFloat((ratingHistory.reduce((sum, rating) => sum + rating, 0) / ratingHistory.length).toFixed(1))
      : null;

    return {
      matchesPlayed: (player.stats?.matchesPlayed || 0) + (player.cupStats?.matchesPlayed || 0) + (player.euroStats?.matchesPlayed || 0),
      goals: (player.stats?.goals || 0) + (player.cupStats?.goals || 0) + (player.euroStats?.goals || 0),
      assists: (player.stats?.assists || 0) + (player.cupStats?.assists || 0) + (player.euroStats?.assists || 0),
      yellowCards: (player.stats?.yellowCards || 0) + (player.cupStats?.yellowCards || 0) + (player.euroStats?.yellowCards || 0),
      redCards: (player.stats?.redCards || 0) + (player.cupStats?.redCards || 0) + (player.euroStats?.redCards || 0),
      averageRating
    };
  },

  buildLoanStatsSnapshot(player: Player): PlayerCareerStatsSnapshot {
    const loan = player.loan;
    const ratingHistory = player.stats?.ratingHistory || [];
    const baselineRatingCount = loan?.reportBaselineRatingCount ?? 0;
    const loanRatings = ratingHistory.slice(baselineRatingCount);
    const averageRating = loanRatings.length > 0
      ? parseFloat((loanRatings.reduce((sum, rating) => sum + rating, 0) / loanRatings.length).toFixed(1))
      : null;

    return {
      matchesPlayed: Math.max(0, (player.stats?.matchesPlayed || 0) - (loan?.reportBaselineMatches ?? 0)),
      goals: Math.max(0, (player.stats?.goals || 0) - (loan?.reportBaselineGoals ?? 0)),
      assists: Math.max(0, (player.stats?.assists || 0) - (loan?.reportBaselineAssists ?? 0)),
      yellowCards: Math.max(0, (player.stats?.yellowCards || 0) - (loan?.reportBaselineYellowCards ?? 0)),
      redCards: Math.max(0, (player.stats?.redCards || 0) - (loan?.reportBaselineRedCards ?? 0)),
      averageRating
    };
  },

  closeCurrentEntry(
    history: PlayerHistoryEntry[],
    player: Player,
    year: number,
    month: number
  ): PlayerHistoryEntry[] {
    if (history.length === 0) return [];

    const updatedHistory = [...history];
    const lastEntry = updatedHistory[updatedHistory.length - 1];

    updatedHistory[updatedHistory.length - 1] = {
      ...lastEntry,
      toYear: year,
      toMonth: month,
      statsSnapshot: lastEntry.statsSnapshot ?? this.buildStatsSnapshot(player)
    };

    return updatedHistory;
  },

  startNewEntry(
    history: PlayerHistoryEntry[],
    target: CareerEntryTarget,
    year: number,
    month: number,
    transferFee?: number
  ): PlayerHistoryEntry[] {
    return [
      ...history,
      {
        clubName: target.clubName,
        clubId: target.clubId,
        fromYear: year,
        fromMonth: month,
        toYear: null,
        toMonth: null,
        ...(transferFee !== undefined && { transferFee })
      }
    ];
  },

  startLoanEntry(
    history: PlayerHistoryEntry[],
    loan: PlayerLoanInfo,
    year: number,
    month: number,
    loanFee?: number
  ): PlayerHistoryEntry[] {
    return [
      ...history,
      {
        clubName: loan.destinationClubName,
        clubId: loan.destinationClubId,
        fromYear: year,
        fromMonth: month,
        toYear: null,
        toMonth: null,
        isLoan: true,
        parentClubId: loan.parentClubId,
        parentClubName: loan.parentClubName,
        loanEndDate: loan.endDate,
        ...(loanFee !== undefined && { transferFee: loanFee })
      }
    ];
  },

  closeLoanEntry(
    history: PlayerHistoryEntry[],
    player: Player,
    year: number,
    month: number
  ): PlayerHistoryEntry[] {
    if (!player.loan) return history;
    const loanIndex = [...history]
      .reverse()
      .findIndex(entry =>
        entry.isLoan &&
        entry.toYear === null &&
        entry.clubId === player.loan?.destinationClubId &&
        entry.parentClubId === player.loan?.parentClubId
      );
    if (loanIndex < 0) return history;

    const actualIndex = history.length - 1 - loanIndex;
    return history.map((entry, index) => index === actualIndex
      ? {
          ...entry,
          toYear: year,
          toMonth: month,
          statsSnapshot: this.buildLoanStatsSnapshot(player)
        }
      : entry);
  },

  reopenOrCreateEntry(
    history: PlayerHistoryEntry[],
    player: Player,
    target: CareerEntryTarget,
    year: number,
    month: number
  ): PlayerHistoryEntry[] {
    const closeIdx = history.findIndex(e => e.clubId !== target.clubId && e.toYear === null);
    let closed = closeIdx >= 0
      ? history.map((e, i) => i === closeIdx
          ? { ...e, toYear: year, toMonth: month, statsSnapshot: e.statsSnapshot ?? this.buildStatsSnapshot(player) }
          : e)
      : [...history];

    const existingIdx = closed.findIndex(e => e.clubId === target.clubId && e.clubName === target.clubName);
    if (existingIdx >= 0) {
      return closed.map((e, i) => i === existingIdx
        ? { ...e, toYear: null, toMonth: null, statsSnapshot: undefined }
        : e);
    }

    return this.startNewEntry(closed, target, year, month);
  },

  movePlayer(
    player: Player,
    target: CareerEntryTarget,
    year: number,
    month: number,
    currentClubInfo?: CareerEntryTarget,
    transferFee?: number
  ): PlayerHistoryEntry[] {
    let history = player.history || [];
    if (history.length === 0 && currentClubInfo) {
      history = [{
        clubName: currentClubInfo.clubName,
        clubId: currentClubInfo.clubId,
        fromYear: year - 1,
        fromMonth: 7,
        toYear: null,
        toMonth: null
      }];
    }
    const closedHistory = this.closeCurrentEntry(history, player, year, month);
    return this.startNewEntry(closedHistory, target, year, month, transferFee);
  }
};
