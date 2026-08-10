import { Club, Player } from '../types';
import { SquadGeneratorService } from './SquadGeneratorService';

export interface DatapackSquadRepairResult {
  updatedClubs: Club[];
  updatedPlayers: Record<string, Player[]>;
  repairedClubIds: string[];
  generatedPlayerCount: number;
}

const POLISH_LEAGUES = new Set(['L_PL_1', 'L_PL_2', 'L_PL_3', 'L_PL_4']);
const FOREIGN_EUROPEAN_LEAGUES = new Set(['L_CL', 'L_EL', 'L_CONF']);
const MINIMUM_SQUAD_SIZE = 16;

const isPolishClub = (club: Club): boolean =>
  club.country === 'POL' || POLISH_LEAGUES.has(club.leagueId);

const getAuditScope = (date: Date): 'POLAND' | 'EUROPE' | null => {
  if (date.getFullYear() !== 2026 || date.getMonth() !== 6) return null;
  const day = date.getDate();
  if (day === 5 || day === 7) return 'POLAND';
  if (day === 4 || day === 8) return 'EUROPE';
  return null;
};

export const DatapackSeasonSquadRepairService = {
  shouldRun(date: Date, datapackCareerStartYear: number | null | undefined): boolean {
    return datapackCareerStartYear === 2026 && getAuditScope(date) !== null;
  },

  repair(
    clubs: Club[],
    players: Record<string, Player[]>,
    date: Date,
    datapackCareerStartYear: number | null | undefined
  ): DatapackSquadRepairResult {
    const scope = datapackCareerStartYear === 2026 ? getAuditScope(date) : null;
    if (!scope) {
      return { updatedClubs: clubs, updatedPlayers: players, repairedClubIds: [], generatedPlayerCount: 0 };
    }

    const eligibleClubs = clubs.filter(club => {
      if (scope === 'POLAND') return isPolishClub(club);
      return FOREIGN_EUROPEAN_LEAGUES.has(club.leagueId) && !isPolishClub(club);
    });
    let updatedPlayers = players;
    const repairedClubIds: string[] = [];
    let generatedPlayerCount = 0;

    eligibleClubs.forEach(club => {
      const currentSquad = updatedPlayers[club.id] ?? [];
      if (currentSquad.length >= MINIMUM_SQUAD_SIZE) return;

      const generated = SquadGeneratorService.generateYouthPlayersForClub(
        club,
        currentSquad,
        2026,
        MINIMUM_SQUAD_SIZE
      );
      if (generated.length === 0) return;

      if (updatedPlayers === players) updatedPlayers = { ...players };
      updatedPlayers[club.id] = [...currentSquad, ...generated];
      repairedClubIds.push(club.id);
      generatedPlayerCount += generated.length;
    });

    if (repairedClubIds.length === 0) {
      return { updatedClubs: clubs, updatedPlayers: players, repairedClubIds, generatedPlayerCount };
    }

    const repairedClubIdSet = new Set(repairedClubIds);
    const updatedClubs = clubs.map(club => repairedClubIdSet.has(club.id)
      ? { ...club, rosterIds: updatedPlayers[club.id].map(player => player.id) }
      : club
    );

    return { updatedClubs, updatedPlayers, repairedClubIds, generatedPlayerCount };
  },
};
