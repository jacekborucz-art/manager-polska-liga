
const SAVE_VERSION = '1.7';

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
}

function reviveDate(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return value;
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
  const normalizedPlayersBase = Object.fromEntries(
    Object.entries(data.players || {}).map(([clubId, squad]) => [
      clubId,
      (squad || []).map((player: any) => ({
        ...player,
        freeAgentClubLockouts: player.freeAgentClubLockouts ?? {},
      })),
    ])
  );
  const normalizedPlayers = reconcileCupStatsFromHistory(
    normalizedPlayersBase,
    data.matchHistory || []
  );

  return {
    ...data,
    version: data.version || SAVE_VERSION,
    players: normalizedPlayers,
    messages: data.messages || [],
    pendingNegotiations: data.pendingNegotiations || [],
    pendingFriendlyRequests: data.pendingFriendlyRequests || [],
    transferOffers: data.transferOffers || [],
    incomingOffers: data.incomingOffers || [],
    aiTransferLog: data.aiTransferLog || [],
    globalFixtures: data.globalFixtures || [],
    reserveFixtures: data.reserveFixtures || [],
    reserveMatchResults: data.reserveMatchResults || [],
    supercupWinners: data.supercupWinners || [],
    matchHistory: data.matchHistory || [],
    championshipHistory: data.championshipHistory || [],
    confR2QPolishTeamIds: data.confR2QPolishTeamIds ?? ['PL_JAGIELLONIA_BIALYSTOK', 'PL_RAKOW_CZESTOCHOWA'],
    lastUEFASuperCupResult: data.lastUEFASuperCupResult ?? null,
    currentPolishChampionId: data.currentPolishChampionId ?? 'PL_LECH_POZNAN',
    currentPolishCupWinnerId: data.currentPolishCupWinnerId ?? 'PL_LEGIA_WARSZAWA',
    currentCLWinnerId: data.currentCLWinnerId ?? 'EU_CL_PARIS_SAINT_GERMAIN',
    currentELWinnerId: data.currentELWinnerId ?? 'EU_CL_TOTTENHAM_HOTSPUR',
    activePlayoffMatch: data.activePlayoffMatch ?? null,
    winterCampInvitePending: data.winterCampInvitePending ?? false,
    winterCampProgramPending: data.winterCampProgramPending ?? false,
    summerCampInvitePending: data.summerCampInvitePending ?? false,
    summerCampProgramPending: data.summerCampProgramPending ?? false,
    lastNTMatchResults: data.lastNTMatchResults ?? null,
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
    !data.version ||
    !Array.isArray(data.clubs) ||
    !data.players ||
    data.userTeamId === undefined
  ) {
    throw new Error('Nieprawidłowy plik zapisu.');
  }
  return data;
}
