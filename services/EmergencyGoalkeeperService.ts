import { Club, HealthStatus, Lineup, Player, PlayerPosition } from '../types';
import { SeasonTransitionService } from './SeasonTransitionService';

export interface EmergencyGoalkeeperResult {
  updatedClubs: Club[];
  updatedPlayers: Record<string, Player[]>;
  updatedLineups: Record<string, Lineup>;
  action: 'HIRED' | 'RELEASED' | null;
  emergencyGoalkeeper: Player | null;
}

const isEmergencyGoalkeeper = (player: Player): boolean =>
  player.id.startsWith('EMERGENCY_GK_');

export const EmergencyGoalkeeperService = {
  process(
    clubs: Club[],
    players: Record<string, Player[]>,
    lineups: Record<string, Lineup>,
    userTeamId: string | null,
    currentDate: Date,
    isResigned: boolean,
    restoredEmergencyLastName?: string
  ): EmergencyGoalkeeperResult {
    if (!userTeamId || isResigned) {
      return { updatedClubs: clubs, updatedPlayers: players, updatedLineups: lineups, action: null, emergencyGoalkeeper: null };
    }

    const userClub = clubs.find(club => club.id === userTeamId);
    if (!userClub) {
      return { updatedClubs: clubs, updatedPlayers: players, updatedLineups: lineups, action: null, emergencyGoalkeeper: null };
    }

    const userSquad = players[userTeamId] ?? [];
    const realGoalkeepers = userSquad.filter(player =>
      player.position === PlayerPosition.GK && !isEmergencyGoalkeeper(player)
    );
    const availableRealGoalkeepers = realGoalkeepers.filter(player =>
      player.health?.status === HealthStatus.HEALTHY && player.suspensionMatches === 0
    );
    const emergencyGoalkeeper = userSquad.find(isEmergencyGoalkeeper) ?? null;

    if (availableRealGoalkeepers.length === 0 && !emergencyGoalkeeper) {
      const parsedTier = Number.parseInt(userClub.leagueId.split('_')[2] || '4', 10);
      const tier = Number.isFinite(parsedTier) ? parsedTier : (userClub.tier ?? 4);
      const generatedJunior = SeasonTransitionService.generateEmergencyGK(
        userTeamId,
        tier,
        userClub.reputation,
        undefined,
        currentDate
      );
      const newJunior = restoredEmergencyLastName
        ? { ...generatedJunior, lastName: restoredEmergencyLastName }
        : generatedJunior;
      const updatedSquad = [...userSquad, newJunior];
      const currentLineup = lineups[userTeamId];
      const updatedLineups = currentLineup
        ? {
            ...lineups,
            [userTeamId]: {
              ...currentLineup,
              startingXI: [newJunior.id, ...currentLineup.startingXI.slice(1)],
            },
          }
        : lineups;

      return {
        updatedPlayers: { ...players, [userTeamId]: updatedSquad },
        updatedClubs: clubs.map(club => club.id === userTeamId
          ? { ...club, rosterIds: updatedSquad.map(player => player.id) }
          : club
        ),
        updatedLineups,
        action: 'HIRED',
        emergencyGoalkeeper: newJunior,
      };
    }

    const recoveredRealGoalkeeper = realGoalkeepers.some(player =>
      player.health?.status === HealthStatus.HEALTHY &&
      player.suspensionMatches === 0 &&
      player.condition >= 90
    );
    if (emergencyGoalkeeper && recoveredRealGoalkeeper) {
      const updatedSquad = userSquad.filter(player => player.id !== emergencyGoalkeeper.id);
      const currentLineup = lineups[userTeamId];
      const updatedLineups = currentLineup
        ? {
            ...lineups,
            [userTeamId]: {
              ...currentLineup,
              startingXI: currentLineup.startingXI.map(playerId =>
                playerId === emergencyGoalkeeper.id ? null : playerId
              ),
            },
          }
        : lineups;

      return {
        updatedPlayers: { ...players, [userTeamId]: updatedSquad },
        updatedClubs: clubs.map(club => club.id === userTeamId
          ? { ...club, rosterIds: updatedSquad.map(player => player.id) }
          : club
        ),
        updatedLineups,
        action: 'RELEASED',
        emergencyGoalkeeper,
      };
    }

    return { updatedClubs: clubs, updatedPlayers: players, updatedLineups: lineups, action: null, emergencyGoalkeeper };
  },
};
