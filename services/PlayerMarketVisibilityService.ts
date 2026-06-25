import { AcademyScoutMission, Club, Player, Region, Scout } from '../types';

const EUROPEAN_REGIONS = new Set<Region>([
  Region.POLAND,
  Region.BALKANS,
  Region.CZ_SK,
  Region.IBERIA,
  Region.SWEDEN,
  Region.SCANDINAVIA,
  Region.EX_USSR,
  Region.SPAIN,
  Region.ENGLAND,
  Region.GERMANY,
  Region.ITALY,
  Region.FRANCE,
  Region.TURKEY,
  Region.FINLAND,
  Region.GEORGIA,
  Region.ARMENIA,
  Region.ALBANIA,
  Region.ROMANIA,
  Region.BALTIC,
  Region.BENELUX,
  Region.HUNGARIAN,
  Region.MALTESE,
  Region.ISRAELI,
  Region.GREEK,
  Region.AZERBAIJANI,
  Region.KAZAKH,
]);

const NON_EUROPEAN_REGIONS = new Set<Region>([
  Region.SSA,
  Region.NORTH_AMERICA,
  Region.MEXICO,
  Region.OCEANIA,
  Region.JAPAN,
  Region.KOREA,
  Region.ARGENTINA,
  Region.BRAZIL,
  Region.ARABIA,
  Region.SOUTH_AMERICAN,
]);

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const PlayerMarketVisibilityService = {
  getStableNumber(value: string, max = 10_000): number {
    return hashString(value) % Math.max(1, max);
  },

  isEuropeanRegion(region?: Region | string): boolean {
    return !!region && EUROPEAN_REGIONS.has(region as Region);
  },

  isNonEuropeanRegion(region?: Region | string): boolean {
    return !!region && NON_EUROPEAN_REGIONS.has(region as Region);
  },

  isEuropeanClub(club?: Club | null): boolean {
    if (!club) return false;
    if (['L_ASIA', 'L_AFRICA', 'L_SA', 'L_NA'].includes(club.leagueId)) return false;
    if (club.leagueId?.startsWith('L_PL_')) return true;
    if (['L_CL', 'L_EL', 'L_CONF'].includes(club.leagueId)) return true;
    return true;
  },

  hasRegionalScoutAccess(
    region: Region | string | undefined,
    employedScouts: Scout[],
    activeMissions: AcademyScoutMission[] = []
  ): boolean {
    if (!region) return false;
    return (
      employedScouts.some(scout => scout.regionalSpecialty === region || scout.nationality === region) ||
      activeMissions.some(mission => mission.isRegionScouting && mission.regionFocus === region)
    );
  },

  getStablePlayerRoll(player: Player, userClubId?: string | null): number {
    return hashString(`${userClubId ?? 'NO_CLUB'}|${player.id}|market-visibility`) % 10_000;
  },

  getNonEuropeanFreeAgentSampleSize(userClub: Club | null, employedScouts: Scout[]): number {
    const reputationBonus = userClub ? Math.max(0, Math.min(6, Math.floor(userClub.reputation / 3))) : 0;
    const scoutBonus = Math.min(8, employedScouts.length * 2);
    return 14 + reputationBonus + scoutBonus;
  },

  isNaturallyVisiblePlayer(player: Player, sourceClub?: Club | null): boolean {
    if (PlayerMarketVisibilityService.isEuropeanRegion(player.nationality)) return true;
    if (PlayerMarketVisibilityService.isEuropeanClub(sourceClub)) return true;
    if (sourceClub && sourceClub.reputation >= 15) return true;
    return player.overallRating >= 82;
  },

  getHiddenNonEuropeanFreeAgents(
    freeAgents: Player[],
    userClub: Club | null,
    employedScouts: Scout[],
    activeMissions: AcademyScoutMission[] = [],
    userClubId?: string | null
  ): Player[] {
    const nonEuropeanFreeAgents = freeAgents.filter(player =>
      PlayerMarketVisibilityService.isNonEuropeanRegion(player.nationality) &&
      !PlayerMarketVisibilityService.hasRegionalScoutAccess(player.nationality, employedScouts, activeMissions)
    );
    const sampleSize = PlayerMarketVisibilityService.getNonEuropeanFreeAgentSampleSize(userClub, employedScouts);
    const visibleSampleIds = new Set(
      [...nonEuropeanFreeAgents]
        .sort((a, b) =>
          PlayerMarketVisibilityService.getStablePlayerRoll(a, userClubId) -
          PlayerMarketVisibilityService.getStablePlayerRoll(b, userClubId)
        )
        .slice(0, sampleSize)
        .map(player => player.id)
    );

    return nonEuropeanFreeAgents.filter(player => !visibleSampleIds.has(player.id));
  },

  isMysteryAgentHidden(player: Player): boolean {
    return player.clubId === 'FREE_AGENTS' && player.mysteryAgentHiddenUntilScouted === true;
  },

  selectAgentClientRecommendations(
    freeAgents: Player[],
    userSquad: Player[],
    userClub: Club | null,
    employedScouts: Scout[],
    activeMissions: AcademyScoutMission[] = [],
    userClubId?: string | null,
    seedKey = ''
  ): Player[] {
    if (userSquad.length === 0) return [];

    const squadAverage = Math.round(
      userSquad.reduce((sum, player) => sum + player.overallRating, 0) / userSquad.length
    );
    const hiddenFreeAgents = PlayerMarketVisibilityService.getHiddenNonEuropeanFreeAgents(
      freeAgents,
      userClub,
      employedScouts,
      activeMissions,
      userClubId
    );
    const candidates = hiddenFreeAgents.filter(player =>
      Math.abs(player.overallRating - squadAverage) <= 3
    );

    return candidates
      .sort((a, b) => {
        const aDiff = Math.abs(a.overallRating - squadAverage);
        const bDiff = Math.abs(b.overallRating - squadAverage);
        if (aDiff !== bDiff) return aDiff - bDiff;
        return PlayerMarketVisibilityService.getStableNumber(`${seedKey}|${a.id}|agent-client`) -
          PlayerMarketVisibilityService.getStableNumber(`${seedKey}|${b.id}|agent-client`);
      })
      .slice(0, 3);
  },
};
