
import { FinanceService } from './FinanceService';
import { ManagerExperienceService } from './ManagerExperienceService';
import { PlayerFormService } from './PlayerFormService';

export const SAVE_VERSION = '3.0';

export interface SaveState {
  version: string;
  savedAt: string;
  currentDate: Date;
  sessionSeed: number;
  clubs: any[];
  leagues: any[];
  players: Record<string, any[]>;
  reserves: any[];
  reserveCoachId: string | null;
  reserveFixtures: any[];
  reserveMatchResults: any[];
  academy: any;
  scoutPool: any[];
  scoutMarket: any[];
  scoutMarketRefreshDate: string;
  scoutMarketManualRefreshCount: number;
  scoutMarketPeriodStart: string;
  mysteryAgentOffer?: any;
  lineups: Record<string, any>;
  userTeamId: string | null;
  seasonTemplate: any;
  leagueSchedules: Record<any, any>;
  lastRecoveryDate: Date;
  coaches: Record<string, any>;
  staffMembers: Record<string, any>;
  roundResults: Record<string, any>;
  managerProfile: any;
  managerJobOffers?: any[];
  seasonNumber: number;
  messages: any[];
  activeTrainingId: string | null;
  activeIntensity: any;
  trainingProgressHistory: number[];
  reserveProgressHistory: any[];
  pendingNegotiations: any[];
  pendingFriendlyRequests: any[];
  activeFriendlyFixtureId: string | null;
  activeFriendlyConditions: any;
  transferOffers: any[];
  incomingOffers: any[];
  aiTransferLog: any[];
  europeanStatus: Record<string, any>;
  nationalTeams: any[];
  nationsLeagueState: any;
  nationsLeagueArchive: any[];
  euroHostAnnouncements: any[];
  euroQualifiersState: any;
  worldCupQualifiersState: any;
  uefaNationalRankingState: any;
  wcqPlayoffState: any;
  wcState: any;
  euroState: any;
  cupParticipants: string[];
  activeCupDraw: any;
  activeGroupDraw: any;
  activePlayoffDraw: any;
  relegationPlayoffFirstLegResults: any;
  relegationPlayoffFinalResult: any;
  promotionPlayoffSemiResults: any;
  promotionPlayoffFinalResults: any;
  activePlayoffMatch: any;
  clGroups: string[][] | null;
  activeELGroupDraw: any;
  elGroups: string[][] | null;
  activeConfGroupDraw: any;
  confGroups: string[][] | null;
  elHistoryInitialRound: string | null;
  confHistoryInitialRound: string | null;
  processedDrawIds: string[];
  globalFixtures: any[];
  isResigned: boolean;
  managerEmploymentStatus?: import('../types').ManagerEmploymentStatus;
  currentPolishChampionId: string;
  currentPolishViceChampionId?: string | null;
  currentPolishCupWinnerId: string;
  currentCLWinnerId: string;
  currentELWinnerId: string;
  lastUEFASuperCupResult: any;
  confR2QPolishTeamIds: string[];
  supercupWinners: { season: string; winner: string; year: number; }[];
  matchHistory: any[];
  championshipHistory: any[];
  winterCampInvitePending: boolean;
  winterCampProgramPending: boolean;
  summerCampInvitePending: boolean;
  summerCampProgramPending: boolean;
  lastNTMatchResults: any;
  aiFriendlyPairs: any[];
  aiFriendlyReports: any[];
  pzpnDisciplinaryEvents?: any[];
  sentMailIds?: string[];
  lastProcessedLeagueDate?: string | null;
  mediaRelationships?: Record<string, number>;
  sentUnfriendlyPressMonths?: string[];
  sentFriendlyPressMonths?: string[];
  pendingPressArticles?: { mail: import('../types').MailMessage; deliveryDate: string }[];
  completedPressConferenceFixtureIds?: string[];
  pressConferenceEffects?: Record<string, import('./PreMatchPressConferenceService').PressConferenceMatchEffect>;
}

export interface SaveExportResult {
  compressed: boolean;
  fileName: string;
  originalBytes: number;
  savedBytes: number;
}

const DEFAULT_START_DATE = new Date('2025-07-01');

function asArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function asRecord<T = any>(value: unknown): Record<string, T> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, T> : {};
}

function asDate(value: unknown, fallback: Date = DEFAULT_START_DATE): Date {
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return fallback;
}

function asDateString(value: unknown, fallback = ''): string {
  if (value instanceof Date && !isNaN(value.getTime())) return value.toISOString();
  if (typeof value === 'string') return value;
  return fallback;
}

function asDateOnlyString(value: unknown, fallback = ''): string {
  if (value instanceof Date && !isNaN(value.getTime())) return value.toISOString().split('T')[0];
  if (typeof value === 'string') return value.includes('T') ? value.split('T')[0] : value;
  return fallback;
}

function asPositiveNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
}

function asClampedRating(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(1, Math.min(99, value))
    : undefined;
}

function reviveDate(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return value;
}

function normalizeFixture(fixture: any): any {
  if (!fixture || typeof fixture !== 'object') return fixture;
  return {
    ...fixture,
    date: asDate(fixture.date),
  };
}

function normalizeDraw(draw: any): any {
  if (!draw || typeof draw !== 'object') return draw ?? null;
  return {
    ...draw,
    date: asDate(draw.date),
    pairs: Array.isArray(draw.pairs) ? draw.pairs.map(normalizeFixture) : draw.pairs,
  };
}

function normalizeNationsLeagueState(state: any): any {
  if (!state || typeof state !== 'object') return null;
  return {
    ...state,
    groups: asArray(state.groups).map((group: any) => ({
      ...group,
      teams: asArray<string>(group?.teams),
      standings: asArray(group?.standings),
    })),
    fixtures: asArray(state.fixtures),
    playoffs: asArray(state.playoffs),
    quarterFinalists: asArray<string>(state.quarterFinalists),
    semiFinalists: asArray<string>(state.semiFinalists),
    finals: state.finals
      ? {
          ...state.finals,
          semiFinalists: asArray<string>(state.finals.semiFinalists),
          finalists: asArray<string>(state.finals.finalists),
          thirdPlaceTeams: asArray<string>(state.finals.thirdPlaceTeams),
        }
      : null,
    completed: state.completed ?? false,
  };
}

function normalizeEuroQualifiersState(state: any): any {
  if (!state || typeof state !== 'object') return null;
  return {
    ...state,
    groups: asArray(state.groups).map((group: any) => ({
      ...group,
      teams: asArray<string>(group?.teams),
      hostTeams: asArray<string>(group?.hostTeams),
      standings: asArray(group?.standings),
    })),
    fixtures: asArray(state.fixtures),
    playoffPaths: asArray(state.playoffPaths).map((path: any) => ({
      ...path,
      teams: asArray<string>(path?.teams),
      semiFinalFixtureIds: asArray<string>(path?.semiFinalFixtureIds),
      tieFixtureIds: path?.tieFixtureIds ? asArray<string>(path.tieFixtureIds) : undefined,
    })),
    hostTeams: asArray<string>(state.hostTeams),
    qualifiedTeams: asArray<string>(state.qualifiedTeams),
    directQualifiers: asArray<string>(state.directQualifiers),
    hostReservedQualifiers: asArray<string>(state.hostReservedQualifiers),
    playoffTeams: asArray<string>(state.playoffTeams),
    drawCompleted: state.drawCompleted ?? false,
    completed: state.completed ?? false,
  };
}

function normalizeTournamentState(state: any): any {
  if (!state || typeof state !== 'object') return null;
  return {
    ...state,
    teams: asArray(state.teams),
    groups: asArray(state.groups).map((group: any) => ({
      ...group,
      teams: asArray<string>(group?.teams),
      matches: asArray(group?.matches),
    })),
    knockoutMatches: asArray(state.knockoutMatches),
    playerEffects: asArray(state.playerEffects),
    groupStageComplete: state.groupStageComplete ?? false,
    knockoutComplete: state.knockoutComplete ?? false,
  };
}

function normalizeNTMatchResults(results: any): any {
  return results == null ? null : asArray(results);
}

function normalizeSeasonTemplate(template: any): any {
  if (!template || typeof template !== 'object') return null;
  return {
    ...template,
    careerStartDate: asDate(template.careerStartDate),
    slots: asArray(template.slots).map((slot: any) => ({
      ...slot,
      start: asDate(slot.start),
      end: asDate(slot.end),
    })),
  };
}

function normalizeLeagueSchedules(schedules: unknown): Record<any, any> {
  return Object.fromEntries(
    Object.entries(asRecord<any>(schedules)).map(([key, schedule]) => [
      key,
      {
        ...schedule,
        matchdays: asArray(schedule?.matchdays).map((matchday: any) => ({
          ...matchday,
          start: asDate(matchday.start),
          end: asDate(matchday.end),
          fixtures: asArray(matchday.fixtures).map(normalizeFixture),
        })),
      },
    ])
  );
}

function normalizeMessages(messages: unknown): any[] {
  return asArray(messages).map((message: any) => ({
    ...message,
    date: asDate(message?.date),
  }));
}

function normalizeClubManagementSource(club: any): any {
  const management = club?.management;
  if (!management || typeof management !== 'object' || Array.isArray(management)) return club;

  const { sportingDirector: legacySportingDirector, ...managementWithoutSportingDirector } = management;
  return {
    ...club,
    sportingDirector: club.sportingDirector ?? legacySportingDirector,
    management: managementWithoutSportingDirector,
  };
}

function getBoardSignatoryForRole(club: any, templateRole: string): { name: string; role: string } | null {
  const formatName = (person?: { firstName?: string; lastName?: string }): string | null =>
    person?.firstName && person?.lastName ? `${person.firstName} ${person.lastName}` : null;

  if (templateRole === 'Prezes Zarządu') {
    const ceoName = formatName(club?.management?.ceo);
    if (ceoName) return { name: ceoName, role: 'Prezes Zarządu' };

    const ownerName = formatName(club?.management?.owner);
    if (ownerName) return { name: ownerName, role: 'Właściciel' };
  }

  if (templateRole === 'Dyrektor Sportowy') {
    const sportingDirectorName = formatName(club?.sportingDirector);
    if (sportingDirectorName) return { name: sportingDirectorName, role: 'Dyrektor Sportowy' };
  }

  if (templateRole === 'Właściciel Klubu') {
    const ownerName = formatName(club?.management?.owner);
    if (ownerName) return { name: ownerName, role: 'Właściciel' };
  }

  return null;
}

export function migrateWelcomeMailSignatories(messages: any[], clubs: any[], userTeamId: string | null): any[] {
  const userClub = clubs.find((club: any) => club?.id === userTeamId);
  if (!userClub?.name) return messages;
  const escapedClubName = String(userClub.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const legacySignatures = [
    { name: 'Wojciech Marcin Jankowski', role: 'Prezes Zarządu' },
    { name: 'Marcin Wiśniewski', role: 'Prezes Zarządu' },
    { name: 'Tomasz Adamski', role: 'Prezes Zarządu' },
    { name: 'Paweł Nowak', role: 'Dyrektor Sportowy' },
    { name: 'Krzysztof Mazurek', role: 'Dyrektor Sportowy' },
    { name: 'Andrzej Karpowicz', role: 'Właściciel' },
  ];

  return messages.map((message: any) => {
    if (!String(message?.id ?? '').startsWith('WELCOME_MAIL_') || typeof message?.body !== 'string') {
      return message;
    }

    const legacy = legacySignatures.find(signature =>
      message.body.includes(`${signature.name}\n${signature.role}, ${userClub.name}`)
    );
    const signatory = getBoardSignatoryForRole(userClub, message.role) ?? (legacy ? getBoardSignatoryForRole(userClub, legacy.role) : null);
    if (!signatory) return message;

    const body = message.body.replace(
      new RegExp(`Z poważaniem,\\n[^\\n]+\\n[^\\n]+, ${escapedClubName}`),
      `Z poważaniem,\n${signatory.name}\n${signatory.role}, ${userClub.name}`
    );

    if (body === message.body && message.role === signatory.role) return message;

    return {
      ...message,
      role: signatory.role,
      body,
    };
  });
}

function normalizeMatchHistory(matchHistory: unknown): any[] {
  return asArray(matchHistory).map((match: any) => ({
    ...match,
    date: asDateString(match?.date),
    goals: asArray(match?.goals),
    cards: asArray(match?.cards),
  }));
}

function reconcileCupStatsFromHistory(players: Record<string, any[]>, matchHistory: any[]): Record<string, any[]> {
  const cupCompetitions = new Set(['POLISH_CUP', 'SUPER_CUP']);
  const playerCupTotals = new Map<string, { goals: number; assists: number }>();

  const ensureTotals = (playerId: string) => {
    if (!playerCupTotals.has(playerId)) playerCupTotals.set(playerId, { goals: 0, assists: 0 });
    return playerCupTotals.get(playerId)!;
  };

  (matchHistory || []).forEach(match => {
    if (!cupCompetitions.has(String(match?.competition || ''))) return;
    (match.goals || []).forEach((goal: any) => {
      const scorerId = goal.playerId || goal.scorerId;
      if (scorerId) ensureTotals(scorerId).goals += 1;
      if (goal.assistantId) ensureTotals(goal.assistantId).assists += 1;
    });
  });

  if (playerCupTotals.size === 0) return players;

  return Object.fromEntries(
    Object.entries(players).map(([clubId, squad]) => [
      clubId,
      (squad || []).map((player: any) => {
        const totals = playerCupTotals.get(player.id);
        if (!totals) return player;
        const currentCup = player.cupStats ?? {
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          matchesPlayed: 0,
          minutesPlayed: 0,
          seasonalChanges: {},
          ratingHistory: [],
        };
        return {
          ...player,
          cupStats: {
            ...currentCup,
            goals: Math.max(currentCup.goals ?? 0, totals.goals),
            assists: Math.max(currentCup.assists ?? 0, totals.assists),
          },
        };
      }),
    ])
  );
}

const emptyPlayerStats = () => ({
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

function reconcileFriendlyStatsFromHistory(players: Record<string, any[]>, matchHistory: any[], seasonNumber: number): Record<string, any[]> {
  const playerFriendlyTotals = new Map<string, ReturnType<typeof emptyPlayerStats>>();

  const ensureTotals = (playerId: string) => {
    if (!playerFriendlyTotals.has(playerId)) playerFriendlyTotals.set(playerId, emptyPlayerStats());
    return playerFriendlyTotals.get(playerId)!;
  };

  (matchHistory || []).forEach(match => {
    if (String(match?.competition || '') !== 'FRIENDLY') return;
    if (Number(match?.season) !== seasonNumber) return;

    const homePlayedIds = new Set<string>([
      ...asArray<string>(match.homeLineup).filter(Boolean),
      ...asArray<any>(match.substitutions).filter(sub => sub?.teamId === match.homeTeamId).map(sub => sub.playerInId).filter(Boolean),
    ]);
    const awayPlayedIds = new Set<string>([
      ...asArray<string>(match.awayLineup).filter(Boolean),
      ...asArray<any>(match.substitutions).filter(sub => sub?.teamId === match.awayTeamId).map(sub => sub.playerInId).filter(Boolean),
    ]);

    const applyPlayed = (playerId: string) => {
      const totals = ensureTotals(playerId);
      totals.matchesPlayed += 1;
      totals.minutesPlayed += 90;
      const rating = match.ratings?.[playerId];
      if (typeof rating === 'number') totals.ratingHistory.push(rating);
    };

    homePlayedIds.forEach(applyPlayed);
    awayPlayedIds.forEach(applyPlayed);

    asArray<any>(match.goals).forEach(goal => {
      if (goal?.isMiss) return;
      const scorerId = goal.playerId || goal.scorerId;
      if (scorerId) ensureTotals(scorerId).goals += 1;
      if (goal.assistantId) ensureTotals(goal.assistantId).assists += 1;
    });

    asArray<any>(match.cards).forEach(card => {
      if (!card?.playerId) return;
      const totals = ensureTotals(card.playerId);
      if (card.type === 'RED' || card.type === 'RED_CARD') totals.redCards += 1;
      if (card.type === 'YELLOW' || card.type === 'YELLOW_CARD' || card.type === 'SECOND_YELLOW') totals.yellowCards += 1;
    });
  });

  if (playerFriendlyTotals.size === 0) return players;

  return Object.fromEntries(
    Object.entries(players).map(([clubId, squad]) => [
      clubId,
      (squad || []).map((player: any) => {
        const totals = playerFriendlyTotals.get(player.id);
        if (!totals) return player;
        const currentFriendly = player.friendlyStats ?? emptyPlayerStats();
        if ((currentFriendly.matchesPlayed ?? 0) >= totals.matchesPlayed) return player;
        return {
          ...player,
          friendlyStats: {
            ...currentFriendly,
            matchesPlayed: totals.matchesPlayed,
            minutesPlayed: totals.minutesPlayed,
            goals: totals.goals,
            assists: totals.assists,
            yellowCards: totals.yellowCards,
            redCards: totals.redCards,
            cleanSheets: Math.max(currentFriendly.cleanSheets ?? 0, totals.cleanSheets),
            ratingHistory: totals.ratingHistory,
          },
        };
      }),
    ])
  );
}

function isEuropeanCupCompetition(competition: unknown): boolean {
  const value = String(competition || '');
  return value === 'UEFA_SUPER_CUP' ||
    value.startsWith('CL_') ||
    value.startsWith('EL_') ||
    value.startsWith('CONF_');
}

function reconcileEuroRatingHistoryFromHistory(players: Record<string, any[]>, matchHistory: any[], seasonNumber: number): Record<string, any[]> {
  const playerRatings = new Map<string, number[]>();

  (matchHistory || []).forEach(match => {
    if (!isEuropeanCupCompetition(match?.competition)) return;
    if (Number(match?.season) !== seasonNumber) return;

    const playedIds = new Set<string>([
      ...asArray<string>(match.homeLineup).filter(Boolean),
      ...asArray<string>(match.awayLineup).filter(Boolean),
      ...asArray<any>(match.substitutions).map(sub => sub?.playerInId).filter(Boolean),
      ...asArray<any>(match.substitutions).map(sub => sub?.playerOutId).filter(Boolean),
      ...Object.keys(asRecord(match.ratings)),
    ]);

    playedIds.forEach(playerId => {
      const rating = match.ratings?.[playerId];
      if (typeof rating !== 'number' || !Number.isFinite(rating)) return;
      if (!playerRatings.has(playerId)) playerRatings.set(playerId, []);
      playerRatings.get(playerId)!.push(rating);
    });
  });

  if (playerRatings.size === 0) return players;

  return Object.fromEntries(
    Object.entries(players).map(([clubId, squad]) => [
      clubId,
      (squad || []).map((player: any) => {
        const ratings = playerRatings.get(player.id);
        if (!ratings || ratings.length === 0) return player;
        const currentEuro = player.euroStats ?? emptyPlayerStats();
        const currentHistory = asArray<number>(currentEuro.ratingHistory).filter(rating => typeof rating === 'number' && Number.isFinite(rating));
        if (currentHistory.length >= ratings.length) return player;
        return {
          ...player,
          euroStats: {
            ...currentEuro,
            ratingHistory: ratings,
          },
        };
      }),
    ])
  );
}

function normalizeSaveState(data: SaveState): SaveState {
  const normalizedMatchHistory = normalizeMatchHistory(data.matchHistory);
  const normalizedClubs = (data.clubs || []).map((rawClub: any) => {
    const club = normalizeClubManagementSource(rawClub);
    return {
      ...club,
      rosterIds: asArray<string>(club.rosterIds),
      stats: club.stats ?? { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 0, form: [] },
      budget: Number.isFinite(club.budget) ? club.budget : 0,
      transferBudget: Number.isFinite(club.transferBudget) ? Math.max(0, club.transferBudget) : 0,
      reserveBudget: Number.isFinite(club.reserveBudget)
        ? Math.max(0, club.reserveBudget)
        : FinanceService.calculateInitialReserveBudget(club.budget || 0, club.reputation || 1),
      boardBudgetRequestsThisSeason: club.boardBudgetRequestsThisSeason ?? 0,
      boardExceptionalContractApprovals: club.boardExceptionalContractApprovals ?? 0,
      boardBudgetMonitorState: club.boardBudgetMonitorState ?? 'NORMAL',
      signingBonusPool: club.signingBonusPool ?? 0,
      financeHistory: asArray(club.financeHistory),
      stadiumExpansionProjects: asArray(club.stadiumExpansionProjects),
    };
  });
  const normalizedPlayersBase = Object.fromEntries(
    Object.entries(asRecord<any[]>(data.players)).map(([clubId, squad]) => [
      clubId,
      asArray(squad).map((player: any) => {
        const secondaryPosition = typeof player.secondaryPosition === 'string' && player.secondaryPosition !== player.position
          ? player.secondaryPosition
          : null;
        const hasPendingTransfer = typeof player.transferPendingClubId === 'string' && player.transferPendingClubId.length > 0;

        const normalizedPlayer = {
          ...player,
          clubId: typeof player.clubId === 'string' && player.clubId.length > 0 ? player.clubId : clubId,
          secondaryPosition,
          secondaryPositionRating: secondaryPosition ? asClampedRating(player.secondaryPositionRating) : undefined,
          friendlyStats: player.friendlyStats ?? {
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 0,
            matchesPlayed: 0,
            minutesPlayed: 0,
            seasonalChanges: {},
            ratingHistory: [],
          },
          history: asArray(player.history),
          boardLockoutUntil: player.boardLockoutUntil ?? null,
          isUntouchable: player.isUntouchable ?? false,
          negotiationStep: player.negotiationStep ?? 0,
          negotiationLockoutUntil: player.negotiationLockoutUntil ?? null,
          contractLockoutUntil: player.contractLockoutUntil ?? null,
          moraleDemandLockoutUntil: player.moraleDemandLockoutUntil ?? null,
          transferListRemovalPromiseDeadline: player.transferListRemovalPromiseDeadline ?? null,
          fatigueDebt: player.fatigueDebt ?? 0,
          isNegotiationPermanentBlocked: player.isNegotiationPermanentBlocked ?? false,
          transferLockoutUntil: player.transferLockoutUntil ?? null,
          transferClubLockouts: player.transferClubLockouts ?? {},
          transferPendingSalary: hasPendingTransfer ? asPositiveNumber(player.transferPendingSalary) : undefined,
          transferPendingBonus: hasPendingTransfer ? asPositiveNumber(player.transferPendingBonus) : undefined,
          transferPendingContractYears: hasPendingTransfer ? asPositiveNumber(player.transferPendingContractYears) : undefined,
          freeAgentLockoutUntil: player.freeAgentLockoutUntil ?? null,
          freeAgentClubLockouts: player.freeAgentClubLockouts ?? {},
          reputacja: player.reputacja ?? 50,
          lojalnosc: (typeof player.lojalnosc === 'number' && player.lojalnosc >= 1) ? player.lojalnosc : Math.floor(Math.random() * 99) + 1,
        };
        return PlayerFormService.withUpdatedForm(normalizedPlayer as any);
      }),
    ])
  );
  const normalizedPlayersWithCup = reconcileCupStatsFromHistory(
    normalizedPlayersBase,
    normalizedMatchHistory
  );
  const normalizedPlayersWithFriendlies = reconcileFriendlyStatsFromHistory(
    normalizedPlayersWithCup,
    normalizedMatchHistory,
    Number.isFinite(data.seasonNumber) ? data.seasonNumber : 1
  );
  const normalizedPlayers = reconcileEuroRatingHistoryFromHistory(
    normalizedPlayersWithFriendlies,
    normalizedMatchHistory,
    Number.isFinite(data.seasonNumber) ? data.seasonNumber : 1
  );

  return {
    ...data,
    version: SAVE_VERSION,
    savedAt: asDateString(data.savedAt, new Date().toISOString()),
    currentDate: asDate(data.currentDate),
    sessionSeed: Number.isFinite(data.sessionSeed) ? data.sessionSeed : Date.now(),
    clubs: normalizedClubs,
    leagues: asArray(data.leagues),
    players: normalizedPlayers,
    reserves: asArray(data.reserves),
    reserveCoachId: data.reserveCoachId ?? null,
    academy: data.academy ?? null,
    scoutPool: asArray(data.scoutPool),
    scoutMarket: asArray(data.scoutMarket),
    scoutMarketRefreshDate: asDateOnlyString(data.scoutMarketRefreshDate),
    scoutMarketManualRefreshCount: data.scoutMarketManualRefreshCount ?? 0,
    scoutMarketPeriodStart: asDateOnlyString(data.scoutMarketPeriodStart),
    mysteryAgentOffer: data.mysteryAgentOffer ?? null,
    lineups: asRecord(data.lineups),
    seasonTemplate: normalizeSeasonTemplate(data.seasonTemplate),
    leagueSchedules: normalizeLeagueSchedules(data.leagueSchedules),
    lastRecoveryDate: asDate(data.lastRecoveryDate),
    coaches: asRecord(data.coaches),
    staffMembers: asRecord(data.staffMembers),
    roundResults: asRecord(data.roundResults),
    managerProfile: ManagerExperienceService.ensureManagerExperience(data.managerProfile),
    managerJobOffers: asArray((data as any).managerJobOffers),
    seasonNumber: Number.isFinite(data.seasonNumber) ? data.seasonNumber : 1,
    messages: migrateWelcomeMailSignatories(normalizeMessages(data.messages), normalizedClubs, data.userTeamId ?? null),
    activeTrainingId: typeof data.activeTrainingId === 'string' ? data.activeTrainingId : null,
    activeIntensity: data.activeIntensity ?? 'NORMAL',
    trainingProgressHistory: asArray(data.trainingProgressHistory),
    reserveProgressHistory: asArray(data.reserveProgressHistory),
    pendingNegotiations: data.pendingNegotiations || [],
    pendingFriendlyRequests: data.pendingFriendlyRequests || [],
    activeFriendlyFixtureId: data.activeFriendlyFixtureId ?? null,
    activeFriendlyConditions: data.activeFriendlyConditions ?? null,
    transferOffers: data.transferOffers || [],
    incomingOffers: data.incomingOffers || [],
    aiTransferLog: data.aiTransferLog || [],
    europeanStatus: asRecord(data.europeanStatus),
    nationalTeams: asArray(data.nationalTeams),
    nationsLeagueState: normalizeNationsLeagueState(data.nationsLeagueState),
    nationsLeagueArchive: asArray(data.nationsLeagueArchive).map(normalizeNationsLeagueState).filter(Boolean),
    euroHostAnnouncements: asArray((data as any).euroHostAnnouncements),
    euroQualifiersState: normalizeEuroQualifiersState(data.euroQualifiersState),
    worldCupQualifiersState: normalizeEuroQualifiersState((data as any).worldCupQualifiersState),
    uefaNationalRankingState: data.uefaNationalRankingState ?? null,
    wcqPlayoffState: data.wcqPlayoffState ?? null,
    wcState: normalizeTournamentState(data.wcState),
    euroState: normalizeTournamentState((data as any).euroState),
    cupParticipants: asArray(data.cupParticipants),
    activeCupDraw: normalizeDraw(data.activeCupDraw),
    activeGroupDraw: normalizeDraw(data.activeGroupDraw),
    activePlayoffDraw: data.activePlayoffDraw ?? null,
    relegationPlayoffFirstLegResults: data.relegationPlayoffFirstLegResults ?? null,
    relegationPlayoffFinalResult: data.relegationPlayoffFinalResult ?? null,
    promotionPlayoffSemiResults: data.promotionPlayoffSemiResults ?? null,
    promotionPlayoffFinalResults: data.promotionPlayoffFinalResults ?? null,
    activePlayoffMatch: data.activePlayoffMatch ?? null,
    clGroups: data.clGroups ?? null,
    activeELGroupDraw: normalizeDraw(data.activeELGroupDraw),
    elGroups: data.elGroups ?? null,
    activeConfGroupDraw: normalizeDraw(data.activeConfGroupDraw),
    confGroups: data.confGroups ?? null,
    elHistoryInitialRound: data.elHistoryInitialRound ?? null,
    confHistoryInitialRound: data.confHistoryInitialRound ?? null,
    processedDrawIds: asArray(data.processedDrawIds),
    globalFixtures: asArray(data.globalFixtures).map(normalizeFixture),
    isResigned: data.isResigned ?? false,
    managerEmploymentStatus: (data as any).managerEmploymentStatus === 'FIRED' || (data as any).managerEmploymentStatus === 'RESIGNED' || (data as any).managerEmploymentStatus === 'EMPLOYED'
      ? (data as any).managerEmploymentStatus
      : data.isResigned
        ? 'RESIGNED'
        : 'EMPLOYED',
    reserveFixtures: asArray(data.reserveFixtures),
    reserveMatchResults: asArray(data.reserveMatchResults),
    supercupWinners: asArray(data.supercupWinners),
    matchHistory: normalizedMatchHistory,
    championshipHistory: asArray(data.championshipHistory),
    confR2QPolishTeamIds: data.confR2QPolishTeamIds ?? ['PL_JAGIELLONIA_BIALYSTOK', 'PL_POGON_SZCZECIN'],
    lastUEFASuperCupResult: data.lastUEFASuperCupResult ?? null,
    currentPolishChampionId: data.currentPolishChampionId ?? 'PL_LECH_POZNAN',
    currentPolishViceChampionId: data.currentPolishViceChampionId ?? null,
    currentPolishCupWinnerId: data.currentPolishCupWinnerId ?? 'PL_LEGIA_WARSZAWA',
    currentCLWinnerId: data.currentCLWinnerId ?? 'EU_CL_PARIS_SAINT_GERMAIN',
    currentELWinnerId: data.currentELWinnerId ?? 'EU_CL_TOTTENHAM_HOTSPUR',
    winterCampInvitePending: data.winterCampInvitePending ?? false,
    winterCampProgramPending: data.winterCampProgramPending ?? false,
    summerCampInvitePending: data.summerCampInvitePending ?? false,
    summerCampProgramPending: data.summerCampProgramPending ?? false,
    lastNTMatchResults: normalizeNTMatchResults(data.lastNTMatchResults),
    aiFriendlyPairs: asArray(data.aiFriendlyPairs),
    aiFriendlyReports: asArray(data.aiFriendlyReports),
    pzpnDisciplinaryEvents: asArray(data.pzpnDisciplinaryEvents),
    sentMailIds: asArray(data.sentMailIds),
    lastProcessedLeagueDate: data.lastProcessedLeagueDate ?? null,
    mediaRelationships: asRecord(data.mediaRelationships),
    sentUnfriendlyPressMonths: asArray<string>(data.sentUnfriendlyPressMonths),
    sentFriendlyPressMonths: asArray<string>(data.sentFriendlyPressMonths),
    pendingPressArticles: asArray(data.pendingPressArticles),
    completedPressConferenceFixtureIds: asArray<string>(data.completedPressConferenceFixtureIds),
    pressConferenceEffects: asRecord(data.pressConferenceEffects),
  };
}

export function serializeSaveState(state: SaveState, savedAt = new Date()): string {
  return JSON.stringify({ ...state, version: SAVE_VERSION, savedAt: savedAt.toISOString() });
}

export function getSaveFileName(savedAt = new Date()): string {
  return `futbol_manager_${savedAt.toISOString().slice(0, 10)}.json`;
}

export async function exportSaveToFile(state: SaveState): Promise<SaveExportResult> {
  const json = serializeSaveState(state);
  const originalBytes = new TextEncoder().encode(json).byteLength;
  const blob = new Blob([json], { type: 'application/json' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = getSaveFileName();
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  return {
    compressed: false,
    fileName,
    originalBytes,
    savedBytes: blob.size,
  };
}

export async function importSaveFromFile(file: File): Promise<SaveState> {
  const source = new Uint8Array(await file.arrayBuffer());
  const isGzip = source.length >= 2 && source[0] === 0x1f && source[1] === 0x8b;
  let text: string;

  if (isGzip) {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('Ta przeglądarka nie obsługuje skompresowanych zapisów GZIP.');
    }
    const decompressedStream = new Blob([source]).stream().pipeThrough(new DecompressionStream('gzip'));
    text = await new Response(decompressedStream).text();
  } else {
    text = new TextDecoder().decode(source);
  }

  const rawData = JSON.parse(text, reviveDate) as SaveState;
  const data = normalizeSaveState(rawData);
  if (
    !data ||
    typeof data !== 'object' ||
    !Array.isArray(data.clubs) ||
    !data.players ||
    data.userTeamId === undefined
  ) {
    throw new Error('Nieprawidłowy plik zapisu.');
  }
  return data;
}
