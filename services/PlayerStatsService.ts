import { Player, MatchEventType, PlayerStats } from '../types';
import { PlayerFormService } from './PlayerFormService';

const emptyStats = (): PlayerStats => ({
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  cleanSheets: 0,
  matchesPlayed: 0,
  minutesPlayed: 0,
  seasonalChanges: {},
  ratingHistory: [],
});

const withCompetitionStats = (
  player: Player,
  competitionId: string | undefined,
  update: (stats: PlayerStats) => PlayerStats
): Player => {
  if (!competitionId) return player;
  const current = player.competitionStats?.[competitionId] ?? emptyStats();
  return {
    ...player,
    competitionStats: {
      ...(player.competitionStats ?? {}),
      [competitionId]: update(current),
    },
  };
};

/**
 * Returns the smallest stable set of squad buckets that should be searched for
 * a match event. Match processors already know the two participating clubs, so
 * scanning every squad in the world (including FREE_AGENTS) after every goal or
 * card is unnecessary. The unscoped fallback is intentionally preserved for
 * older callers and non-standard competitions which cannot provide club ids.
 */
const getEventSearchClubIds = (
  players: Record<string, Player[]>,
  scopedClubIds?: readonly string[]
): string[] => {
  if (!scopedClubIds || scopedClubIds.length === 0) return Object.keys(players);
  return Array.from(new Set(scopedClubIds)).filter(clubId => Array.isArray(players[clubId]));
};

export const PlayerStatsService = {
  applyGoal: (
    players: Record<string, Player[]>,
    scorerId: string,
    assistId?: string,
    competitionId?: string,
    scopedClubIds?: readonly string[]
  ): Record<string, Player[]> => {
    let newPlayers = players;
    const foundPlayerIds = new Set<string>();

    const updateClub = (clubId: string): void => {
      const squad = newPlayers[clubId];
      if (!squad) return;
      let changed = false;
      const updatedSquad = squad.map(p => {
        if (p.id === scorerId) {
          foundPlayerIds.add(scorerId);
          changed = true;
          const aggregated = {
            ...p,
            stats: { ...p.stats, goals: p.stats.goals + 1 }
          };
          return PlayerFormService.withUpdatedForm(withCompetitionStats(
            aggregated,
            competitionId,
            stats => ({ ...stats, goals: stats.goals + 1 })
          ));
        }
        if (assistId && p.id === assistId) {
          foundPlayerIds.add(assistId);
          changed = true;
          const aggregated = {
            ...p,
            stats: { ...p.stats, assists: p.stats.assists + 1 }
          };
          return PlayerFormService.withUpdatedForm(withCompetitionStats(
            aggregated,
            competitionId,
            stats => ({ ...stats, assists: stats.assists + 1 })
          ));
        }
        return p;
      });

      if (changed) {
        if (newPlayers === players) newPlayers = { ...players };
        newPlayers[clubId] = updatedSquad;
      }
    };

    const primaryClubIds = getEventSearchClubIds(players, scopedClubIds);
    primaryClubIds.forEach(updateClub);

    // Defensive compatibility fallback: malformed or legacy match data can
    // occasionally point at a player outside the supplied fixture squads. In
    // that rare case, search the remaining buckets so statistics are never
    // silently lost. Normal matches never enter this branch.
    const requiredPlayerIds = new Set([scorerId, ...(assistId ? [assistId] : [])]);
    if (scopedClubIds && [...requiredPlayerIds].some(id => !foundPlayerIds.has(id))) {
      const primarySet = new Set(primaryClubIds);
      for (const clubId of Object.keys(players)) {
        if (primarySet.has(clubId)) continue;
        updateClub(clubId);
        if ([...requiredPlayerIds].every(id => foundPlayerIds.has(id))) break;
      }
    }

    return newPlayers;
  },

  applyCard: (
    players: Record<string, Player[]>,
    playerId: string,
    type: MatchEventType,
    competitionId?: string,
    scopedClubIds?: readonly string[]
  ): Record<string, Player[]> => {
    let newPlayers = players;
    let playerFound = false;

    const updateClub = (clubId: string): void => {
      const squad = newPlayers[clubId];
      if (!squad) return;
      let changed = false;
      const updatedSquad = squad.map(p => {
        if (p.id === playerId) {
          playerFound = true;
          changed = true;
          let yellowCards = p.stats.yellowCards;
          let redCards = p.stats.redCards;
          let suspensionMatches = p.suspensionMatches;

          if (type === MatchEventType.YELLOW_CARD) {
            yellowCards += 1;
            if (yellowCards % 4 === 0) {
              suspensionMatches += 1;
            }
          }
          
          if (type === MatchEventType.RED_CARD) {
            redCards += 1;
            suspensionMatches += 2;
          }

          const aggregated = {
            ...p,
            stats: { ...p.stats, yellowCards, redCards },
            suspensionMatches
          };
          return PlayerFormService.withUpdatedForm(withCompetitionStats(
            aggregated,
            competitionId,
            stats => ({
              ...stats,
              yellowCards: stats.yellowCards + (type === MatchEventType.YELLOW_CARD ? 1 : 0),
              redCards: stats.redCards + (type === MatchEventType.RED_CARD ? 1 : 0),
            })
          ));
        }
        return p;
      });

      if (changed) {
        if (newPlayers === players) newPlayers = { ...players };
        newPlayers[clubId] = updatedSquad;
      }
    };

    const primaryClubIds = getEventSearchClubIds(players, scopedClubIds);
    primaryClubIds.forEach(updateClub);

    // Keep the legacy world-search behaviour as a safety net for old saves or
    // unusual fixtures whose player ownership data is temporarily inconsistent.
    if (scopedClubIds && !playerFound) {
      const primarySet = new Set(primaryClubIds);
      for (const clubId of Object.keys(players)) {
        if (primarySet.has(clubId)) continue;
        updateClub(clubId);
        if (playerFound) break;
      }
    }

    return newPlayers;
  },

  /**
   * Wywoływane po zakończeniu meczu dla każdego klubu.
   * Redukuje kary zawieszenia i zwiększa licznik rozegranych meczów oraz minut.
   * Regeneracja odbywa się wyłącznie w RecoveryService.
   */
  processMatchDayEndForClub: (
    players: Record<string, Player[]>,
    clubId: string,
    participatingIds: string[],
    competitionId?: string,
    minutesByPlayer: Record<string, number> = {}
  ): Record<string, Player[]> => {
    const newPlayers = { ...players };
    const idSet = new Set(participatingIds);

    if (newPlayers[clubId]) {
      newPlayers[clubId] = newPlayers[clubId].map(p => {
        let updated = { ...p };
        
        // 1. Inkrementacja meczów i minut dla zawodników biorących udział
        if (idSet.has(p.id)) {
           const playedMinutes = Math.max(1, Math.min(120, Math.round(minutesByPlayer[p.id] ?? 90)));
           updated.stats = { 
             ...updated.stats, 
             matchesPlayed: updated.stats.matchesPlayed + 1,
             minutesPlayed: updated.stats.minutesPlayed + playedMinutes
           };
           // The aggregate remains useful to season-development systems, but
           // rankings use this exact competition bucket. Substitutes count as
           // appearances because the match engine includes them in playedPlayerIds.
           updated = withCompetitionStats(updated, competitionId, stats => ({
             ...stats,
             matchesPlayed: stats.matchesPlayed + 1,
             minutesPlayed: stats.minutesPlayed + playedMinutes,
           }));
           updated = PlayerFormService.withUpdatedForm(updated);
        }

        // 2. Redukcja zawieszenia
        if (updated.suspensionMatches > 0) {
           updated.suspensionMatches = Math.max(0, updated.suspensionMatches - 1);
        }

        return updated;
      });
    }

    return newPlayers;
  },

  applyCleanSheet: (players: Record<string, Player[]>, clubId: string, gkIds: string[], competitionId?: string): Record<string, Player[]> => {
    const newPlayers = { ...players };
    if (newPlayers[clubId]) {
      newPlayers[clubId] = newPlayers[clubId].map(p => {
        if (gkIds.includes(p.id)) {
          const aggregated = { ...p, stats: { ...p.stats, cleanSheets: (p.stats.cleanSheets || 0) + 1 } };
          return PlayerFormService.withUpdatedForm(withCompetitionStats(
            aggregated,
            competitionId,
            stats => ({ ...stats, cleanSheets: stats.cleanSheets + 1 })
          ));
        }
        return p;
      });
    }
    return newPlayers;
  },

  incrementMatchesPlayed: (players: Record<string, Player[]>, playerIds: string[]): Record<string, Player[]> => {
    const newPlayers = { ...players };
    const idSet = new Set(playerIds);

    for (const clubId in newPlayers) {
      newPlayers[clubId] = newPlayers[clubId].map(p => {
        if (idSet.has(p.id)) {
          return PlayerFormService.withUpdatedForm({
            ...p,
            stats: { ...p.stats, matchesPlayed: p.stats.matchesPlayed + 1 }
          });
        }
        return p;
      });
    }

    return newPlayers;
  }
};
