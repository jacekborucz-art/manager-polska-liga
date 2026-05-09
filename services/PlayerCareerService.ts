import { Player, PlayerCareerStatsSnapshot, PlayerHistoryEntry } from '../types';

interface CareerEntryTarget {
  clubId: string | 'FREE_AGENTS';
  clubName: string;
}

export const PlayerCareerService = {
  buildStatsSnapshot(player: Player): PlayerCareerStatsSnapshot {
    const ratingHistory = player.stats?.ratingHistory || [];
    const averageRating = ratingHistory.length > 0
      ? parseFloat((ratingHistory.reduce((sum, rating) => sum + rating, 0) / ratingHistory.length).toFixed(1))
      : null;

    return {
      matchesPlayed: player.stats?.matchesPlayed || 0,
      goals: player.stats?.goals || 0,
      assists: player.stats?.assists || 0,
      yellowCards: player.stats?.yellowCards || 0,
      redCards: player.stats?.redCards || 0,
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
