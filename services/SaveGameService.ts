
import { FinanceService } from './FinanceService';

export const SAVE_VERSION = '2.0';

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
  lineups: Record<string, any>;
  userTeamId: string | null;
  seasonTemplate: any;
  leagueSchedules: Record<any, any>;
  lastRecoveryDate: Date;
  coaches: Record<string, any>;
  staffMembers: Record<string, any>;
  roundResults: Record<string, any>;
  managerProfile: any;
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
  wcqPlayoffState: any;
  wcState: any;
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
  currentPolishChampionId: string;
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

function normalizeMatchHistory(matchHistory: unknown): any[] {
  return asArray(matchHistory).map((match: any) => ({
    ...match,
    date: asDateString(match?.date),
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

function normalizeSaveState(data: SaveState): SaveState {
  const normalizedMatchHistory = normalizeMatchHistory(data.matchHistory);
  const normalizedClubs = (data.clubs || []).map((club: any) => ({
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
  }));
  const normalizedPlayersBase = Object.fromEntries(
    Object.entries(asRecord<any[]>(data.players)).map(([clubId, squad]) => [
      clubId,
      asArray(squad).map((player: any) => ({
        ...player,
        history: asArray(player.history),
        boardLockoutUntil: player.boardLockoutUntil ?? null,
        isUntouchable: player.isUntouchable ?? false,
        negotiationStep: player.negotiationStep ?? 0,
        negotiationLockoutUntil: player.negotiationLockoutUntil ?? null,
        contractLockoutUntil: player.contractLockoutUntil ?? null,
        fatigueDebt: player.fatigueDebt ?? 0,
        isNegotiationPermanentBlocked: player.isNegotiationPermanentBlocked ?? false,
        transferLockoutUntil: player.transferLockoutUntil ?? null,
        freeAgentLockoutUntil: player.freeAgentLockoutUntil ?? null,
        freeAgentClubLockouts: player.freeAgentClubLockouts ?? {},
      })),
    ])
  );
  const normalizedPlayers = reconcileCupStatsFromHistory(
    normalizedPlayersBase,
    normalizedMatchHistory
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
    lineups: asRecord(data.lineups),
    seasonTemplate: normalizeSeasonTemplate(data.seasonTemplate),
    leagueSchedules: normalizeLeagueSchedules(data.leagueSchedules),
    lastRecoveryDate: asDate(data.lastRecoveryDate),
    coaches: asRecord(data.coaches),
    staffMembers: asRecord(data.staffMembers),
    roundResults: asRecord(data.roundResults),
    managerProfile: data.managerProfile ?? null,
    seasonNumber: Number.isFinite(data.seasonNumber) ? data.seasonNumber : 1,
    messages: normalizeMessages(data.messages),
    activeTrainingId: data.activeTrainingId ?? 'T_TACTICAL_PERIOD',
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
    wcqPlayoffState: data.wcqPlayoffState ?? null,
    wcState: data.wcState ?? null,
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
    reserveFixtures: asArray(data.reserveFixtures),
    reserveMatchResults: asArray(data.reserveMatchResults),
    supercupWinners: asArray(data.supercupWinners),
    matchHistory: normalizedMatchHistory,
    championshipHistory: asArray(data.championshipHistory),
    confR2QPolishTeamIds: data.confR2QPolishTeamIds ?? ['PL_JAGIELLONIA_BIALYSTOK', 'PL_RAKOW_CZESTOCHOWA'],
    lastUEFASuperCupResult: data.lastUEFASuperCupResult ?? null,
    currentPolishChampionId: data.currentPolishChampionId ?? 'PL_LECH_POZNAN',
    currentPolishCupWinnerId: data.currentPolishCupWinnerId ?? 'PL_LEGIA_WARSZAWA',
    currentCLWinnerId: data.currentCLWinnerId ?? 'EU_CL_PARIS_SAINT_GERMAIN',
    currentELWinnerId: data.currentELWinnerId ?? 'EU_CL_TOTTENHAM_HOTSPUR',
    winterCampInvitePending: data.winterCampInvitePending ?? false,
    winterCampProgramPending: data.winterCampProgramPending ?? false,
    summerCampInvitePending: data.summerCampInvitePending ?? false,
    summerCampProgramPending: data.summerCampProgramPending ?? false,
    lastNTMatchResults: data.lastNTMatchResults ?? null,
    aiFriendlyPairs: asArray(data.aiFriendlyPairs),
    aiFriendlyReports: asArray(data.aiFriendlyReports),
    pzpnDisciplinaryEvents: asArray(data.pzpnDisciplinaryEvents),
    sentMailIds: asArray(data.sentMailIds),
    lastProcessedLeagueDate: data.lastProcessedLeagueDate ?? null,
  };
}

export function exportSaveToFile(state: SaveState): void {
  const json = JSON.stringify({ ...state, version: SAVE_VERSION, savedAt: new Date().toISOString() });
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `futbol_manager_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importSaveFromFile(file: File): Promise<SaveState> {
  const text = await file.text();
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
