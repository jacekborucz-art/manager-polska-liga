import { Club, Player } from '../types';
import { PlayerMoraleService } from './PlayerMoraleService';
import { PolishLeagueSeasonService } from './PolishLeagueSeasonService';
import { SquadGeneratorService } from './SquadGeneratorService';

const POLISH_LEAGUE_PREFIX = 'L_PL_';

const isPolishClub = (club: Pick<Club, 'id'> & Partial<Pick<Club, 'leagueId' | 'country'>>): boolean =>
  club.id.startsWith('PL_') ||
  club.country === 'POL' ||
  club.leagueId?.startsWith(POLISH_LEAGUE_PREFIX) === true;

const omitPolishLeagueStructure = (club: Club): Partial<Club> => {
  if (!isPolishClub(club)) return { ...club };

  const {
    leagueId: _leagueId,
    tier: _tier,
    isDefaultActive: _isDefaultActive,
    ...datapackFields
  } = club;
  return {
    ...datapackFields,
    country: club.country ?? 'POL',
  };
};

const generateSquad = (club: Club): Player[] => {
  const tier = Math.max(1, club.tier ?? 4);
  const reputation = Math.max(1, club.reputation ?? 1);
  const country = club.country ?? 'POL';

  if (isPolishClub(club)) {
    return SquadGeneratorService.generateSquadForClub(club.id, club);
  }
  if (club.leagueId === 'L_SA') {
    return SquadGeneratorService.generateSouthAmericanSquad(club.id, tier, reputation, country);
  }
  if (club.leagueId === 'L_ASIA') {
    return SquadGeneratorService.generateIntercontinentalSquad(club.id, tier, reputation, country, 'Asia');
  }
  if (club.leagueId === 'L_AFRICA') {
    return SquadGeneratorService.generateIntercontinentalSquad(club.id, tier, reputation, country, 'Africa');
  }
  if (club.leagueId === 'L_NA') {
    return SquadGeneratorService.generateIntercontinentalSquad(club.id, tier, reputation, country, 'North America');
  }
  return SquadGeneratorService.generateEuropeanSquad(club.id, tier, reputation, country);
};

export const DatapackClubService = {
  isPolishClub,

  prepareClubForExport(club: Club): Partial<Club> {
    return omitPolishLeagueStructure(club);
  },

  applyCareerStartStructure(baseClubs: Club[], importedClubs: Club[], startYear: number): Club[] {
    const importedById = new Map(importedClubs.map(club => [club.id, club]));
    const baseIds = new Set(baseClubs.map(club => club.id));

    const mergedBaseClubs = baseClubs.map(baseClub => {
      const importedClub = importedById.get(baseClub.id);
      if (!importedClub) return { ...baseClub };
      if (!isPolishClub(baseClub) && !isPolishClub(importedClub)) {
        return { ...baseClub, ...importedClub, id: baseClub.id };
      }

      return {
        ...baseClub,
        ...omitPolishLeagueStructure(importedClub),
        id: baseClub.id,
        leagueId: baseClub.leagueId,
        tier: baseClub.tier,
        isDefaultActive: baseClub.isDefaultActive,
      } as Club;
    });

    const customClubs = importedClubs
      .filter(club => !baseIds.has(club.id))
      .map(club => isPolishClub(club)
        ? {
            ...omitPolishLeagueStructure(club),
            id: club.id,
            leagueId: 'L_PL_4',
            tier: 4,
            isDefaultActive: true,
          } as Club
        : { ...club }
      );

    const mergedClubs = [...mergedBaseClubs, ...customClubs];
    const polishClubs = mergedClubs.filter(isPolishClub);
    const otherClubs = mergedClubs.filter(club => !isPolishClub(club));

    return [
      ...PolishLeagueSeasonService.buildClubsForCareerStart(polishClubs, startYear),
      ...otherClubs,
    ];
  },

  ensureSquads(
    clubs: Club[],
    sourcePlayers: Record<string, Player[]>,
    excludedClubIds: ReadonlySet<string> = new Set()
  ): { clubs: Club[]; players: Record<string, Player[]>; generatedClubIds: string[] } {
    const players: Record<string, Player[]> = { ...sourcePlayers };
    const usedPlayerIds = new Set(Object.values(players).flat().map(player => player.id));
    const generatedClubIds: string[] = [];

    clubs.forEach(club => {
      if (excludedClubIds.has(club.id) || (players[club.id]?.length ?? 0) > 0) return;

      const generatedSquad = generateSquad(club).map(rawPlayer => {
        let playerId = rawPlayer.id;
        let suffix = 1;
        while (usedPlayerIds.has(playerId)) {
          playerId = `${rawPlayer.id}_DATAPACK_${suffix}`;
          suffix += 1;
        }
        usedPlayerIds.add(playerId);
        return PlayerMoraleService.ensurePlayerState({
          ...rawPlayer,
          id: playerId,
          clubId: club.id,
        });
      });

      if (generatedSquad.length > 0) {
        players[club.id] = generatedSquad;
        generatedClubIds.push(club.id);
      }
    });

    return {
      players,
      generatedClubIds,
      clubs: clubs.map(club => ({
        ...club,
        rosterIds: Array.isArray(players[club.id])
          ? players[club.id].map(player => player.id)
          : club.rosterIds,
      })),
    };
  },
};
