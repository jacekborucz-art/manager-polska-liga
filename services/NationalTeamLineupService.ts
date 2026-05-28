import { Coach, Lineup, NationalTeam, Player } from '../types';
import { getNTMatchDayForDate } from '../resources/NationalTeamSchedule';
import { LineupService } from './LineupService';

export interface NationalTeamMatchSelection {
  lineup: Lineup;
  captainId: string | null;
  penaltyTakerId: string | null;
  freeKickTakerId: string | null;
}

const pickBestFromXi = (
  squad: Player[],
  lineup: Lineup,
  scoreFn: (player: Player) => number
): string | null => {
  const xiPlayers = lineup.startingXI
    .map(id => squad.find(player => player.id === id) ?? null)
    .filter(Boolean) as Player[];

  if (xiPlayers.length === 0) {
    return null;
  }

  return [...xiPlayers]
    .sort((a, b) => scoreFn(b) - scoreFn(a))[0]
    ?.id ?? null;
};

const DAY_MS = 86_400_000;
const NT_PRE_MATCH_RECOVERY_DAYS = 3;
const NT_PRE_MATCH_MIN_CONDITION_RECOVERY = 25;
const clampCondition = (value: number): number => Math.max(0, Math.min(100, value));

const getUpcomingMatchTeamIds = (currentDate: Date, nationalTeams: NationalTeam[]): Set<string> => {
  const matchDate = new Date(currentDate);
  matchDate.setHours(0, 0, 0, 0);
  matchDate.setTime(matchDate.getTime() + NT_PRE_MATCH_RECOVERY_DAYS * DAY_MS);

  const matchDay = getNTMatchDayForDate(matchDate, matchDate.getFullYear());
  if (!matchDay || matchDay.matches.length === 0) {
    return new Set<string>();
  }

  const teamByName = new Map(nationalTeams.map(team => [team.name, team]));
  const teamIds = new Set<string>();

  matchDay.matches.forEach(match => {
    const homeTeam = teamByName.get(match.home);
    const awayTeam = teamByName.get(match.away);
    if (homeTeam) teamIds.add(homeTeam.id);
    if (awayTeam) teamIds.add(awayTeam.id);
  });

  return teamIds;
};

export const NationalTeamLineupService = {
  applyPreMatchSquadRecovery: (
    playersMap: Record<string, Player[]>,
    nationalTeams: NationalTeam[],
    currentDate: Date
  ): Record<string, Player[]> => {
    const matchTeamIds = getUpcomingMatchTeamIds(currentDate, nationalTeams);
    if (matchTeamIds.size === 0) {
      return playersMap;
    }

    const squadPlayerIds = new Set<string>();
    nationalTeams.forEach(team => {
      if (!matchTeamIds.has(team.id)) return;
      team.squadPlayerIds.forEach(playerId => squadPlayerIds.add(playerId));
    });

    if (squadPlayerIds.size === 0) {
      return playersMap;
    }

    let changed = false;
    const updatedPlayersMap: Record<string, Player[]> = {};

    for (const [clubId, squad] of Object.entries(playersMap)) {
      let squadChanged = false;
      const updatedSquad = squad.map(player => {
        if (!squadPlayerIds.has(player.id)) {
          return player;
        }

        const nextCondition = clampCondition(player.condition + NT_PRE_MATCH_MIN_CONDITION_RECOVERY);
        if (nextCondition === player.condition) {
          return player;
        }

        squadChanged = true;
        changed = true;
        return { ...player, condition: nextCondition };
      });

      updatedPlayersMap[clubId] = squadChanged ? updatedSquad : squad;
    }

    return changed ? updatedPlayersMap : playersMap;
  },

  buildMatchSelection: (
    team: NationalTeam,
    squad: Player[],
    coach: Coach | null
  ): NationalTeamMatchSelection => {
    const tacticId = team.tacticId || '4-4-2';
    const initialLineup = LineupService.autoPickLineup(team.id, squad, tacticId, coach);
    const lineup = LineupService.repairLineup(initialLineup, squad);

    return {
      lineup,
      captainId: pickBestFromXi(
        squad,
        lineup,
        player => (
          player.attributes.leadership * 1.9 +
          player.attributes.mentality * 1.3 +
          player.attributes.workRate * 0.7 +
          player.overallRating * 0.6
        )
      ),
      penaltyTakerId: pickBestFromXi(
        squad,
        lineup,
        player => (
          player.attributes.penalties * 2.1 +
          player.attributes.finishing * 1.2 +
          player.attributes.technique * 0.9 +
          player.attributes.mentality * 0.8
        )
      ),
      freeKickTakerId: pickBestFromXi(
        squad,
        lineup,
        player => (
          player.attributes.freeKicks * 2.0 +
          player.attributes.technique * 1.1 +
          player.attributes.passing * 0.8 +
          player.attributes.vision * 0.7
        )
      ),
    };
  },
};
