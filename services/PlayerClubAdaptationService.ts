import {
  InjurySeverity,
  MatchEventType,
  MatchLogEntry,
  Player,
  PlayerClubAdaptation,
  SubstitutionRecord,
} from '../types';

export type ClubAdaptationCompetition = 'LEAGUE' | 'CUP' | 'EUROPE' | 'FRIENDLY';

const DAY_MS = 86_400_000;
const MAX_ADAPTATION_PENALTY = 0.20;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const formatLocalDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const toDateKey = (value: Date | string): string => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return formatLocalDateKey(new Date());
  return formatLocalDateKey(date);
};

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededUnit = (seed: string): number => hashString(seed) / 0x1_0000_0000;

const rollInteger = (seed: string, min: number, max: number): number =>
  min + Math.floor(seededUnit(seed) * (max - min + 1));

const rollDurationDays = (seed: string): number => {
  const bucket = seededUnit(`${seed}:duration-bucket`);
  if (bucket < 0.20) return rollInteger(`${seed}:duration-value`, 14, 30);
  if (bucket < 0.55) return rollInteger(`${seed}:duration-value`, 31, 90);
  if (bucket < 0.83) return rollInteger(`${seed}:duration-value`, 91, 180);
  if (bucket < 0.95) return rollInteger(`${seed}:duration-value`, 181, 270);
  return rollInteger(`${seed}:duration-value`, 271, 365);
};

const getMoraleMultiplier = (morale = 50): number => {
  if (morale >= 70) return 1.10;
  if (morale >= 45) return 1.00;
  if (morale >= 25) return 0.80;
  return 0.60;
};

const getInjuryMultiplier = (player: Player): number => {
  if (!player.health?.injury) return 1;
  if (player.health.injury.severity === InjurySeverity.SEVERE) return 0.35;
  if (player.health.injury.severity === InjurySeverity.LIGHT) return 0.70;
  return 0.50;
};

const getCompetitionMultiplier = (competition: ClubAdaptationCompetition): number =>
  competition === 'FRIENDLY' ? 0.70 : 1.00;

const getBaseDailyGain = (adaptation: PlayerClubAdaptation): number =>
  (100 - adaptation.initialLevel) / Math.max(1, adaptation.durationDays);

const getDayDifference = (from: string, to: string): number => {
  const parseDayNumber = (dateKey: string): number | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateKey);
    if (!match) return null;
    return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  };
  const fromDay = parseDayNumber(from);
  const toDay = parseDayNumber(to);
  if (fromDay === null || toDay === null) return 0;
  return Math.max(0, Math.floor((toDay - fromDay) / DAY_MS));
};

export const PlayerClubAdaptationService = {
  beginForClub(player: Player, clubId: string, date: Date | string): Player {
    if (!clubId || clubId === 'FREE_AGENTS') {
      return { ...player, clubAdaptation: null };
    }

    const dateKey = toDateKey(date);
    const seed = `${player.id}:${clubId}:${dateKey}`;
    const initialLevel = rollInteger(`${seed}:initial-level`, 10, 55);
    const adaptation: PlayerClubAdaptation = {
      clubId,
      startedAt: dateKey,
      lastUpdatedAt: dateKey,
      durationDays: rollDurationDays(seed),
      initialLevel,
      level: initialLevel,
    };

    return { ...player, clubAdaptation: adaptation };
  },

  advanceDaily(player: Player, date: Date | string): Player {
    const adaptation = player.clubAdaptation;
    if (!adaptation || adaptation.clubId !== player.clubId || adaptation.level >= 100) return player;

    const dateKey = toDateKey(date);
    const elapsedDays = getDayDifference(adaptation.lastUpdatedAt, dateKey);
    if (elapsedDays <= 0) return player;

    const gain = getBaseDailyGain(adaptation)
      * elapsedDays
      * getMoraleMultiplier(player.morale)
      * getInjuryMultiplier(player);

    return {
      ...player,
      clubAdaptation: {
        ...adaptation,
        level: clamp(adaptation.level + gain, 0, 100),
        lastUpdatedAt: dateKey,
      },
    };
  },

  applyMatchMinutes(
    player: Player,
    minutesPlayed: number,
    competition: ClubAdaptationCompetition,
    date: Date | string
  ): Player {
    const dailyUpdated = this.advanceDaily(player, date);
    const adaptation = dailyUpdated.clubAdaptation;
    if (!adaptation || adaptation.clubId !== dailyUpdated.clubId || adaptation.level >= 100 || minutesPlayed <= 0) {
      return dailyUpdated;
    }

    const matchGain = getBaseDailyGain(adaptation)
      * (clamp(minutesPlayed, 0, 120) / 90)
      * getCompetitionMultiplier(competition)
      * getMoraleMultiplier(dailyUpdated.morale);

    return {
      ...dailyUpdated,
      clubAdaptation: {
        ...adaptation,
        level: clamp(adaptation.level + matchGain, 0, 100),
      },
    };
  },

  applyMatchToPlayers(
    players: Record<string, Player[]>,
    minutesByPlayerId: Record<string, number>,
    competition: ClubAdaptationCompetition,
    date: Date | string
  ): Record<string, Player[]> {
    const nextPlayers: Record<string, Player[]> = {};
    Object.entries(players).forEach(([clubId, squad]) => {
      nextPlayers[clubId] = squad.map(player => {
        const minutes = minutesByPlayerId[player.id] ?? 0;
        return minutes > 0 ? this.applyMatchMinutes(player, minutes, competition, date) : player;
      });
    });
    return nextPlayers;
  },

  getLevel(player: Player): number {
    const adaptation = player.clubAdaptation;
    if (!adaptation || adaptation.clubId !== player.clubId) return 100;
    return clamp(adaptation.level, 0, 100);
  },

  getEffectiveOverall(player: Player, roleOverall: number): number {
    const level = this.getLevel(player);
    const multiplier = (1 - MAX_ADAPTATION_PENALTY) + MAX_ADAPTATION_PENALTY * (level / 100);
    return clamp(roleOverall * multiplier, 1, 99);
  },

  buildMinutesByPlayerId(
    finalStartingXI: Array<string | null>,
    substitutions: SubstitutionRecord[],
    totalMinutes: number,
    forcedExitMinutes: Record<string, number> = {}
  ): Record<string, number> {
    const safeTotal = clamp(totalMinutes, 1, 120);
    const participantIds = new Set<string>();
    finalStartingXI.forEach(id => { if (id) participantIds.add(id); });
    substitutions.forEach(substitution => {
      if (substitution.playerOutId) participantIds.add(substitution.playerOutId);
      if (substitution.playerInId) participantIds.add(substitution.playerInId);
    });
    Object.keys(forcedExitMinutes).forEach(playerId => participantIds.add(playerId));

    const minutesByPlayerId: Record<string, number> = {};
    participantIds.forEach(playerId => {
      const entryMinute = substitutions
        .filter(substitution => substitution.playerInId === playerId)
        .reduce((earliest, substitution) => Math.min(earliest, substitution.minute), safeTotal);
      const enteredFromBench = entryMinute < safeTotal;
      const startMinute = enteredFromBench ? entryMinute : 0;
      const substitutionExitMinute = substitutions
        .filter(substitution => substitution.playerOutId === playerId && substitution.minute >= startMinute)
        .reduce((earliest, substitution) => Math.min(earliest, substitution.minute), safeTotal);
      const exitMinute = Math.min(
        substitutionExitMinute,
        clamp(forcedExitMinutes[playerId] ?? safeTotal, startMinute, safeTotal)
      );
      minutesByPlayerId[playerId] = clamp(exitMinute - startMinute, 0, safeTotal);
    });

    return minutesByPlayerId;
  },

  buildSentOffExitMinutes(
    sentOffIds: string[],
    logs: MatchLogEntry[],
    players: Player[],
    teamSide: 'HOME' | 'AWAY'
  ): Record<string, number> {
    const exitMinutes: Record<string, number> = {};
    sentOffIds.forEach(playerId => {
      const player = players.find(candidate => candidate.id === playerId);
      if (!player) return;

      const exitMinute = logs
        .filter(log =>
          log.type === MatchEventType.RED_CARD
          && log.teamSide === teamSide
          && (log.playerId === playerId || (!log.playerId && log.playerName === player.lastName))
        )
        .reduce((earliest, log) => Math.min(earliest, log.minute), Number.POSITIVE_INFINITY);

      if (Number.isFinite(exitMinute)) exitMinutes[playerId] = exitMinute;
    });
    return exitMinutes;
  },
};
