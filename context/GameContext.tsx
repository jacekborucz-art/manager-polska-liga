import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  ViewState, Club, League, Player, Lineup, Fixture, FinanceLog,
  SeasonTemplate, LeagueSchedule, PlayerNextEvent, EventKind, MatchSummary, LeagueRoundResults, ManagerProfile, MatchLiveState,
  MailMessage, MatchStatus, MailType, CompetitionType,
Coach, TrainingIntensity, IndividualTalkType,
PendingNegotiation, NegotiationStatus, PendingFriendlyRequest, FriendlyMatchConditions,
HealthStatus, InjurySeverity,
PlayerPosition, EuropeanStatus, NationalTeam, NTMatchResult, ReserveProgressPoint,
TransferOffer, TransferClubBidInput, TransferContractInput, TransferOfferStatus, TransferOfferSubmissionResult, TransferTiming,
IncomingTransferOffer, IncomingOfferStatus,
ActivePlayoffDraw,
RelegationPlayoffFirstLegResults,
RelegationPlayoffFinalResult,
RelegationPlayoffPairOutcome,
RelegationPlayoffLegResult,
PromotionPlayoffSemiResults,
PromotionPlayoffFinalResults,
PromotionPlayoffSingleMatchResult,
ActivePlayoffMatchData,
ClubAcademy,
AcademyScoutMission,
Region,
YouthPlayer,
Scout,
MatchHistoryEntry,
WCQPlayoffState,
WCState,
CoachSeasonStats,
AiTransferLogEntry,
WinterCampLocation,
WinterCampProgram,
WinterCampIntensity,
WinterCampState,
SummerCampLocation,
SummerCampProgram,
SummerCampIntensity,
SummerCampState,
StadiumStand,
StaffMember,
StaffRole,
BoardClubRequestType,
AiFriendlyPair,
AiFriendlyMatchReport,
} from '../types';
import { StadiumExpansionService } from '../services/StadiumExpansionService';
import { AiFriendlyGeneratorService } from '../services/AiFriendlyGeneratorService';
import { AiFriendlyMatchSimulator } from '../services/AiFriendlyMatchSimulator';
import { KitSelection } from '../services/KitSelectionService';
import { AcademyService, CLUBS_WITH_PRESET_ACADEMY, ACADEMY_MAX_SLOTS } from '../services/AcademyService';
import { ScoutService } from '../services/ScoutService';
import { NationalTeamService } from '../services/NationalTeamService';
import { RAW_CHAMPIONS_LEAGUE_CLUBS, generateEuropeanClubId } from '../resources/static_db/clubs/ChampionsLeagueTeams';
import { RAW_EUROPA_LEAGUE_CLUBS, generateELClubId } from '../resources/static_db/clubs/EuropeLeagueTeams';
import { ELDrawService } from '../LECupEngine/ELDrawService';
import { CONFDrawService } from '../LECupEngine/CONFDrawService';
import { RAW_CONFERENCE_LEAGUE_CLUBS, generateCONFClubId } from '../resources/static_db/clubs/ConferenceLeagueTeams';
import { CLUBS_SOUTH_AMERICA, generateSAClubId } from '../resources/static_db/clubs/SouthamericanTeams';
import { CLUBS_ASIAN, generateAsianClubId } from '../resources/static_db/clubs/asian_teams';
import { CLUBS_AFRICAN, generateAfricanClubId } from '../resources/static_db/clubs/african_teams';
import { CLUBS_NORTH_AMERICA, generateNorthAmericaClubId } from '../resources/static_db/clubs/northAME_teams';
import { STATIC_CLUBS, STATIC_LEAGUES, STATIC_CL_CLUBS, STATIC_EL_CLUBS, STATIC_CONF_CLUBS, STATIC_SA_CLUBS, STATIC_ASIAN_CLUBS, STATIC_AFRICAN_CLUBS, STATIC_NA_CLUBS, START_DATE, UNEMPLOYED_MANAGER_CLUB, UNEMPLOYED_MANAGER_CLUB_ID, generateRandomBoard, computeBoardFromManagement } from '../constants';
import { SeasonTemplateGenerator } from '../services/SeasonTemplateGenerator';
import { LeagueScheduleGenerator } from '../services/LeagueScheduleGenerator';
import { CalendarEngine } from '../services/CalendarEngine';
import { SquadGeneratorService } from '../services/SquadGeneratorService';
import { LineupService } from '../services/LineupService';
import { BackgroundMatchProcessor } from '../services/BackgroundMatchProcessor';
import { RelegationPlayoffSimulator } from '../services/RelegationPlayoffSimulator';
import { BackgroundPlayOffMatchPolishCup } from '../services/BackgroundPlayOffMatchPolishCup';
import { DebugLoggerService } from '../services/DebugLoggerService';
import { BackgroundMatchProcessorPolishCup } from '../services/BackgroundMatchProcessorPolishCup';
import { RecoveryService } from '../services/RecoveryService';
import { isRecoveryFocusReady } from '../services/MatchPrepFocusService';
import { MailService, SeasonSummaryData } from '../services/MailService';
import { TrainingService } from '../services/TrainingService';
import { TrainingAssistantService } from '../services/TrainingAssistantService';
import { AiWeeklyTrainingService } from '../services/AiWeeklyTrainingService';
import { WeeklyMotivationService } from '../services/WeeklyMotivationService';
import { SeasonTransitionService } from '../services/SeasonTransitionService';
import { LeagueStatsService } from '../services/LeagueStatsService';
import { FinanceService } from '../services/FinanceService';
import { BoardFinanceMonitorService } from '../services/BoardFinanceMonitorService';
import { PolishCupDrawService } from '../services/PolishCupDrawService';
import { CLDrawService } from '../services/CLDrawService';
import { SuperCupService } from '../services/SuperCupService';
import { UEFASuperCupService } from '../services/UEFASuperCupService';
import { CoachService } from '../services/CoachService';
import { StaffGenerationService } from '../services/StaffGenerationService';
import { ClubManagementService } from '../services/ClubManagementService';
import { SportingDirectorService } from '../services/SportingDirectorService';
import { RefereeService } from '../services/RefereeService';
import { FreeAgentService } from '../services/FreeAgentService';
import { AiContractService } from '@/services/AiContractService';
import { AiScoutingService } from '../services/AiScoutingService';
import { AiTransferDecisionService } from '../services/AiTransferDecisionService';
import { BackgroundMatchProcessorCL } from '../services/BackgroundMatchProcessorCL';
import { BackgroundMatchUEFASuperCup } from '../services/BackgroundMatchUEFASuperCup';
import { MatchHistoryService } from '../services/MatchHistoryService';
import { ScoutAssistantService } from '../services/ScoutAssistantService';
import { ChampionshipHistoryService } from '../data/championship_history';
import { TransferBuyerLogicService } from '../services/TransferBuyerLogicService';
import { TransferSellerLogicService } from '../services/TransferSellerLogicService';
import { TransferPlayerDecisionService } from '../services/TransferPlayerDecisionService';
import { TransferExecutionService } from '../services/TransferExecutionService';
import { IncomingTransferService } from '../services/IncomingTransferService';
import { FreeAgentNegotiationService } from '../services/FreeAgentNegotiationService';
import { NationalTeamSimulator } from '../services/NationalTeamSimulator';
import { getNTMatchDayForDate } from '../resources/NationalTeamSchedule';
import { WCQPlayoffService } from '../services/WCQPlayoffService';
import { WorldCupService } from '../services/WorldCupService';
import { PlayerCareerService } from '../services/PlayerCareerService';
import { PlayerContractMindflowService } from '../services/PlayerContractMindflowService';
import { SAVE_VERSION, SaveState } from '../services/SaveGameService';
import { generateLocationPrices, generateSpaCost, applyWinterCampEffects, getAssistantSuggestion } from '../services/WinterCampService';
import { generateSummerLocationPrices, generateSummerSpaCost, applySummerCampEffects, getSummerAssistantSuggestion } from '../services/SummerCampService';
import { ReserveScheduleService } from '../services/ReserveScheduleService';
import { ReserveOpponentGeneratorService } from '../services/ReserveOpponentGeneratorService';
import { ReserveMatchEngine } from '../services/ReserveMatchEngine';
import { ReserveFixture, ReserveMatchResult, ReserveSeasonStats } from '../types';
import { PlayerAttributesGenerator } from '../services/PlayerAttributesGenerator';
import { pickNationalityForRegion } from '../services/NationalityService';
import { IndividualTalkResult, PlayerMoraleService } from '../services/PlayerMoraleService';

export interface ImportedSquadPlayer {
  firstName: string;
  lastName: string;
  age: number;
  position: PlayerPosition;
  nationality?: Region;
  nationalityCountry?: string;
  annualSalary?: number;
  marketValue?: number;
  contractEndDate?: string;
  attributes: {
    strength: number; stamina: number; pace: number; defending: number;
    passing: number; attacking: number; finishing: number; technique: number;
    vision: number; dribbling: number; heading: number; positioning: number;
    goalkeeping: number; freeKicks: number; talent: number; penalties: number;
    corners: number; aggression: number; crossing: number; leadership: number;
    mentality: number; workRate: number;
  };
}

const generateRuntimeSeed = (): number => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const seedBuffer = new Uint32Array(1);
    globalThis.crypto.getRandomValues(seedBuffer);
    return seedBuffer[0] >>> 0;
  }

  return Math.floor(Math.random() * 0x100000000) >>> 0;
};

interface SimulationOutput {
  updatedFixtures: Fixture[];
  updatedClubs: Club[];
  updatedPlayers: Record<string, Player[]>;
  updatedLineups: Record<string, Lineup>;
  // TUTAJ WSTAW TEN KOD
  newOffers: PendingNegotiation[];
  ratings?: Record<string, number>;
  // KONIEC KODU
  seasonNumber: number;
  roundResults: LeagueRoundResults | null;
  aiTransferLogEntries?: AiTransferLogEntry[];
}

type GameNotificationTone = 'success' | 'info' | 'warning' | 'error';

interface GameNotificationState {
  title: string;
  message: string;
  tone: GameNotificationTone;
}

interface GameContextType {
  currentDate: Date;
  viewState: ViewState;
  sessionSeed: number;
  previousViewState: ViewState | null;
  clubs: Club[];
  leagues: League[];
  players: Record<string, Player[]>;
  lineups: Record<string, Lineup>;
  fixtures: Fixture[];
  userTeamId: string | null;
  seasonTemplate: SeasonTemplate | null;
  leagueSchedules: Record<number, LeagueSchedule>;
  nextEvent: PlayerNextEvent | null;
  viewedClubId: string | null;
  viewedPlayerId: string | null;
  viewedCoachId: string | null;
  viewedRefereeId: string | null;
  lastRecoveryDate: Date;
  lastMatchSummary: MatchSummary | null;
  coaches: Record<string, Coach>;
  staffMembers: Record<string, StaffMember>;
  roundResults: Record<string, LeagueRoundResults>;
  isJumping: boolean;
  managerProfile: ManagerProfile | null;
  seasonNumber: number;
  activeMatchState: MatchLiveState | null;
  messages: MailMessage[];
  activeTrainingId: string | null;
  cupParticipants: string[];
    activeCupDraw: { id: string, label: string, date: Date, pairs: Fixture[] } | null;
  activeGroupDraw: { id: string, label: string, date: Date, groups: string[][] } | null;
  activePlayoffDraw: ActivePlayoffDraw | null;
  confirmPlayoffDraw: () => void;
  // ── BARAŻE O UTRZYMANIE ─────────────────────────────────────────────────
  relegationPlayoffFirstLegResults: RelegationPlayoffFirstLegResults | null;  // wyniki 26 maja
  relegationPlayoffFinalResult: RelegationPlayoffFinalResult | null;           // wyniki 29 maja (finalne)
  confirmRelegationPlayoffMatch1: () => void; // przycisk "Dalej" po 26 maja
  confirmRelegationPlayoffMatch2: () => void; // przycisk "Dalej" po 29 maja
  promotionPlayoffSemiResults: PromotionPlayoffSemiResults | null;   // wyniki półfinałów z 31 maja
  promotionPlayoffFinalResults: PromotionPlayoffFinalResults | null; // wyniki finałów z 4 czerwca
  confirmPromotionPlayoffSemi: () => void;  // przycisk "Dalej" po 31 maja
  confirmPromotionPlayoffFinal: () => void; // przycisk "Dalej" po 4 czerwca
  // ── BARAŻE — INTERAKTYWNY MECZ GRACZA ───────────────────────────────────
  activePlayoffMatch: ActivePlayoffMatchData | null;
  setActivePlayoffMatch: React.Dispatch<React.SetStateAction<ActivePlayoffMatchData | null>>;
  setRelegationPlayoffFirstLegResults: React.Dispatch<React.SetStateAction<RelegationPlayoffFirstLegResults | null>>;
  setRelegationPlayoffFinalResult: React.Dispatch<React.SetStateAction<RelegationPlayoffFinalResult | null>>;
  setPromotionPlayoffSemiResults: React.Dispatch<React.SetStateAction<PromotionPlayoffSemiResults | null>>;
  setPromotionPlayoffFinalResults: React.Dispatch<React.SetStateAction<PromotionPlayoffFinalResults | null>>;
  clGroups: string[][] | null;
  activeELGroupDraw: { id: string, label: string, date: Date, groups: string[][] } | null;
  elGroups: string[][] | null;
  activeConfGroupDraw: { id: string, label: string, date: Date, groups: string[][] } | null;
  confGroups: string[][] | null;
  supercupWinners: { season: string; winner: string; year: number; }[];
  addSupercupWinner: (season: string, winner: string, year: number) => void;
  currentCLWinnerId: string;
  currentELWinnerId: string;
  lastUEFASuperCupResult: MatchHistoryEntry | null;
  setLastUEFASuperCupResult: React.Dispatch<React.SetStateAction<MatchHistoryEntry | null>>;

  activeIntensity: TrainingIntensity;
  setTrainingIntensity: (intensity: TrainingIntensity) => void;
  trainingProgressHistory: number[];
  reserveProgressHistory: ReserveProgressPoint[];

  startNewGame: () => void;
  getSaveState: () => SaveState;
  loadGameFromFile: (data: SaveState) => void;
  saveManagerProfile: (profile: ManagerProfile) => void;
  selectUserTeam: (clubId: string) => void;
  advanceDay: () => void;
  jumpToDate: (date: Date) => void;
  jumpToNextEvent: () => void;
  navigateTo: (view: ViewState) => void;
  navigateWithoutHistory: (view: ViewState) => void;
  pendingMatchKits: KitSelection | null;
  setPendingMatchKits: React.Dispatch<React.SetStateAction<KitSelection | null>>;
  updateLineup: (clubId: string, lineup: Lineup) => void;
  viewClubDetails: (clubId: string) => void;
  viewPlayerDetails: (playerId: string) => void;
   viewCoachDetails: (coachId: string) => void;
  viewRefereeDetails: (refId: string) => void;
  getOrGenerateSquad: (clubId: string) => Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Record<string, Player[]>>>;
  setLastMatchSummary: (summary: MatchSummary | null) => void;
   setClubs: React.Dispatch<React.SetStateAction<Club[]>>;
  addRoundResults: (results: LeagueRoundResults) => void;
  applySimulationResult: (result: SimulationOutput) => void;
  setActiveMatchState: React.Dispatch<React.SetStateAction<MatchLiveState | null>>;
  setMessages: React.Dispatch<React.SetStateAction<MailMessage[]>>;
  markMessageRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  setActiveTrainingId: (id: string | null) => void;
  confirmCupDraw: (pairs: Fixture[]) => void;
  confirmCLDraw: (pairs: Fixture[]) => void;
  confirmELDraw: (pairs: Fixture[]) => void;
  confirmELR2QDraw: (pairs: Fixture[]) => void;
  confirmCLGroupDraw: () => void;
  confirmELGroupDraw: () => void;
  confirmELR16Draw: () => void;
    confirmCLR16Draw: () => void;
  confirmCLQFDraw: () => void;
  confirmCLSFDraw: () => void;
  confirmELQFDraw: () => void;
  confirmELSFDraw: () => void;
  confirmELFinalDraw: () => void;
  confirmCONFDraw: (pairs: Fixture[]) => void;
  confirmCONFR2QDraw: (pairs: Fixture[]) => void;
  confirmCONFGroupDraw: () => void;
  confirmCONFR16Draw: () => void;
  confirmCONFQFDraw: () => void;
  confirmCONFSFDraw: () => void;
  confirmCONFFinalDraw: () => void;
  confirmSeasonEnd: () => void;
  elHistoryInitialRound: string | null;
  setElHistoryInitialRound: (round: string | null) => void;
  confHistoryInitialRound: string | null;
  setConfHistoryInitialRound: (round: string | null) => void;

  processBackgroundCupMatches: () => void;
    processCLMatchDay: () => void;
  updatePlayer: (clubId: string, playerId: string, newData: Partial<Player>) => void;
  importSquad: (entries: { clubId: string; players: ImportedSquadPlayer[] }[]) => void;
  toggleTransferList: (playerId: string, price?: number) => void;
  toggleUntouchable: (playerId: string) => void;
  setSquadRole: (playerId: string, role: 'STARTER' | 'KEY_PLAYER' | null) => void;
  pendingOpenTalk: boolean;
  setPendingOpenTalk: (v: boolean) => void;
  pendingNegotiations: PendingNegotiation[];
setPendingNegotiations: React.Dispatch<React.SetStateAction<PendingNegotiation[]>>;
  pendingFriendlyRequests: PendingFriendlyRequest[];
  addFriendlyRequest: (req: Omit<PendingFriendlyRequest, 'id'>) => void;
  cancelFriendly: (fixtureId: string) => void;
  aiFriendlyPairs: AiFriendlyPair[];
  aiFriendlyReports: AiFriendlyMatchReport[];
  activeFriendlyFixtureId: string | null;
  activeFriendlyConditions: FriendlyMatchConditions | null;
  setActiveFriendlyConditions: React.Dispatch<React.SetStateAction<FriendlyMatchConditions | null>>;
finalizeFreeAgentContract: (mailId: string) => void;
  transferOffers: TransferOffer[];
  submitTransferOffer: (playerId: string, offer: TransferClubBidInput) => TransferOfferSubmissionResult;
  finalizeTransferNegotiation: (offerId: string, contract: TransferContractInput, bypassBoardCheck?: boolean) => TransferOfferSubmissionResult;
  incomingOffers: IncomingTransferOffer[];
  viewedIncomingOfferId: string | null;
  respondToIncomingOffer: (offerId: string, response: 'accept' | 'counter' | 'reject', counterFee?: number) => void;
  confirmIncomingTransfer: (offerId: string, confirm: boolean) => void;
  navigateToIncomingOffer: (offerId: string) => void;
  transferNewsActiveTab: 'scouting' | 'released' | 'activity' | 'completed' | 'incoming';
  setTransferNewsActiveTab: React.Dispatch<React.SetStateAction<'scouting' | 'released' | 'activity' | 'completed' | 'incoming'>>;
  contractManagementInitialMode: 'RELEASE' | 'NEGOTIATE';
  setContractManagementInitialMode: React.Dispatch<React.SetStateAction<'RELEASE' | 'NEGOTIATE'>>;
  aiTransferLog: AiTransferLogEntry[];

 europeanStatus: Record<string, EuropeanStatus>;
  setEuropeanStatus: React.Dispatch<React.SetStateAction<Record<string, EuropeanStatus>>>;
  addFinanceLog: (clubId: string, description: string, amount: number, date?: Date, previousBalance?: number) => void;
  nationalTeams: NationalTeam[];
  setNationalTeams: React.Dispatch<React.SetStateAction<NationalTeam[]>>;
  europeanViewTab: 'clubs' | 'nt';
  setEuropeanViewTab: React.Dispatch<React.SetStateAction<'clubs' | 'nt'>>;
  selectedNTId: string | null;
  setSelectedNTId: React.Dispatch<React.SetStateAction<string | null>>;
  isResigned: boolean;
  resignFromClub: () => void;
  gameNotification: GameNotificationState | null;
  showGameNotification: (notification: { title: string; message: string; tone?: GameNotificationTone }) => void;
  clearGameNotification: () => void;
  respondToSportingDirectorObjective: (response: import('../types').SportingDirectorObjectiveResponse) => void;
  requestStadiumExpansion: (stand: StadiumStand, requestedIncrease: number) => void;
  submitBoardClubRequest: (requestType: BoardClubRequestType) => void;
  // Ostatnie wyniki meczów reprezentacji (symulacja w tle) — wyświetlane w NationalTeamResultsView
  lastNTMatchResults: NTMatchResult[] | null;
  setLastNTMatchResults: React.Dispatch<React.SetStateAction<NTMatchResult[] | null>>;
  // Baraże MŚ 2026
  wcqPlayoffState: WCQPlayoffState | null;
  setWcqPlayoffState: React.Dispatch<React.SetStateAction<WCQPlayoffState | null>>;
  wcState: WCState | null;
  setWcState: React.Dispatch<React.SetStateAction<WCState | null>>;
  reserves: Player[];
  setReserves: React.Dispatch<React.SetStateAction<Player[]>>;
  reserveCoachId: string | null;
  reserveFixtures: ReserveFixture[];
  setReserveFixtures: React.Dispatch<React.SetStateAction<ReserveFixture[]>>;
  reserveMatchResults: ReserveMatchResult[];
  setReserveMatchResults: React.Dispatch<React.SetStateAction<ReserveMatchResult[]>>;
  academy: ClubAcademy | null;
  initAcademy: () => void;
  submitUpgradeProposal: () => void;
  startAcademyUpgrade: () => void;
  promoteYouthPlayer: (youthId: string, target: 'RESERVES' | 'FIRST_TEAM') => void;
  dismissYouthPlayer: (youthId: string) => void;
  setYouthFocus: (youthId: string, attr: keyof import('../types').PlayerAttributes | null) => void;
  startScoutMission: (targetYouthPlayerId?: string, regionFocus?: Region, positionFilter?: import('../types').PlayerPosition, ageMin?: number, ageMax?: number, scoutId?: string) => boolean;
  setAcademyRegionFocus: (region: Region | undefined) => void;
  setAcademyOperationalBudget: (amount: number) => void;
  signYouthPlayerContract: (youthId: string) => void;
  scoutPool: Scout[];
  scoutMarket: Scout[];
  employedScouts: Scout[];
  hireScout: (scoutId: string) => boolean;
  fireScout: (scoutId: string) => void;
  refreshScoutMarket: () => void;
  scoutMarketRefreshDate: string;
  scoutMarketManualRefreshCount: number;
  scoutMarketPeriodStart: string;
  applyWeeklyMotivation: (moraleDelta: number) => void;
  conductIndividualTalk: (playerId: string, talkType: IndividualTalkType) => IndividualTalkResult | null;
  fireStaffMember: (staffId: string) => { success: boolean; message: string; cost?: number };
  extendStaffContract: (staffId: string, years: number) => void;
  negotiateStaffContract: (staffId: string, newSalary: number, years: number) => void;
  hireStaffMember: (staffId: string, salary: number, years: number, kaucja: number) => { success: boolean; message: string };
  winterCampInvitePending: boolean;
  winterCampProgramPending: boolean;
  clearWinterCampInvitePending: () => void;
  clearWinterCampProgramPending: () => void;
  reopenWinterCampInvite: () => void;
  saveWinterCampLocation: (location: import('../types').WinterCampLocation | null, cost: number, spaOption: boolean) => void;
  saveWinterCampProgram: (program: import('../types').WinterCampProgram, intensity: import('../types').WinterCampIntensity) => void;
  summerCampInvitePending: boolean;
  summerCampProgramPending: boolean;
  clearSummerCampInvitePending: () => void;
  clearSummerCampProgramPending: () => void;
  saveSummerCampLocation: (location: import('../types').SummerCampLocation | null, cost: number, spaOption: boolean) => void;
  saveSummerCampProgram: (program: import('../types').SummerCampProgram, intensity: import('../types').SummerCampIntensity) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState<Date>(START_DATE);
  const [sessionSeed, setSessionSeed] = useState<number>(() => generateRuntimeSeed());
  const [viewState, setViewState] = useState<ViewState>(ViewState.START_MENU);
  const [previousViewState, setPreviousViewState] = useState<ViewState | null>(null);
  const [clubs, setClubs] = useState<Club[]>([...STATIC_CLUBS, ...STATIC_CL_CLUBS, ...STATIC_EL_CLUBS, ...STATIC_CONF_CLUBS, ...STATIC_SA_CLUBS, ...STATIC_ASIAN_CLUBS, ...STATIC_AFRICAN_CLUBS, ...STATIC_NA_CLUBS, UNEMPLOYED_MANAGER_CLUB]);
  const [leagues, setLeagues] = useState<League[]>(STATIC_LEAGUES);
  const [players, setPlayers] = useState<Record<string, Player[]>>({});
  const [reserves, setReserves] = useState<Player[]>([]);
  const [reserveCoachId, setReserveCoachId] = useState<string | null>(null);
  const [reserveFixtures, setReserveFixtures] = useState<ReserveFixture[]>([]);
  const [reserveMatchResults, setReserveMatchResults] = useState<ReserveMatchResult[]>([]);
  const [academy, setAcademy] = useState<ClubAcademy | null>(null);
  const [scoutPool, setScoutPool] = useState<Scout[]>([]);
  const [scoutMarket, setScoutMarket] = useState<Scout[]>([]);
  const [scoutMarketRefreshDate, setScoutMarketRefreshDate] = useState<string>('');
  const [scoutMarketManualRefreshCount, setScoutMarketManualRefreshCount] = useState<number>(0);
  const [scoutMarketPeriodStart, setScoutMarketPeriodStart] = useState<string>('');
  const [lineups, setLineups] = useState<Record<string, Lineup>>({});
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [seasonTemplate, setSeasonTemplate] = useState<SeasonTemplate | null>(null);
  const [leagueSchedules, setLeagueSchedules] = useState<Record<number, LeagueSchedule>>({});
  const [nextEvent, setNextEvent] = useState<PlayerNextEvent | null>(null);
  const [viewedClubId, setViewedClubId] = useState<string | null>(null);
  const [viewedPlayerId, setViewedPlayerId] = useState<string | null>(null);
  const [viewedCoachId, setViewedCoachId] = useState<string | null>(null);
  const [viewedRefereeId, setViewedRefereeId] = useState<string | null>(null);
  const [lastRecoveryDate, setLastRecoveryDate] = useState<Date>(START_DATE);
  const [lastMatchSummary, setLastMatchSummary] = useState<MatchSummary | null>(null);
  const [coaches, setCoaches] = useState<Record<string, Coach>>({});
  const [staffMembers, setStaffMembers] = useState<Record<string, StaffMember>>({});
  const [roundResults, setRoundResults] = useState<Record<string, LeagueRoundResults>>({});
  const [managerProfile, setManagerProfile] = useState<ManagerProfile | null>(null);
  const [seasonNumber, setSeasonNumber] = useState<number>(1);
  const [activeMatchState, setActiveMatchState] = useState<MatchLiveState | null>(null);
  const [pendingMatchKits, setPendingMatchKits] = useState<KitSelection | null>(null);
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [targetJumpTime, setTargetJumpTime] = useState<number | null>(null);
  const [activeTrainingId, setActiveTrainingId] = useState<string | null>('T_TACTICAL_PERIOD');

const [activeIntensity, setActiveIntensity] = useState<TrainingIntensity>(TrainingIntensity.NORMAL);
const [trainingProgressHistory, setTrainingProgressHistory] = useState<number[]>([]);
const [reserveProgressHistory, setReserveProgressHistory] = useState<ReserveProgressPoint[]>([]);
 const [pendingOpenTalk, setPendingOpenTalk] = useState(false);
 const [pendingNegotiations, setPendingNegotiations] = useState<PendingNegotiation[]>([]);
 const [pendingFriendlyRequests, setPendingFriendlyRequests] = useState<PendingFriendlyRequest[]>([]);
 const [activeFriendlyFixtureId, setActiveFriendlyFixtureId] = useState<string | null>(null);
 const [activeFriendlyConditions, setActiveFriendlyConditions] = useState<FriendlyMatchConditions | null>(null);
 const [aiFriendlyPairs, setAiFriendlyPairs] = useState<AiFriendlyPair[]>([]);
 const [aiFriendlyReports, setAiFriendlyReports] = useState<AiFriendlyMatchReport[]>([]);
 const [transferOffers, setTransferOffers] = useState<TransferOffer[]>([]);
 const [incomingOffers, setIncomingOffers] = useState<IncomingTransferOffer[]>([]);
 const [viewedIncomingOfferId, setViewedIncomingOfferId] = useState<string | null>(null);
 const [transferNewsActiveTab, setTransferNewsActiveTab] = useState<'scouting' | 'released' | 'activity' | 'completed' | 'incoming'>('activity');
 const [aiTransferLog, setAiTransferLog] = useState<AiTransferLogEntry[]>([]);
 const [contractManagementInitialMode, setContractManagementInitialMode] = useState<'RELEASE' | 'NEGOTIATE'>('NEGOTIATE');
 const [europeanStatus, setEuropeanStatus] = useState<Record<string, EuropeanStatus>>({});
  const [nationalTeams, setNationalTeams] = useState<NationalTeam[]>([]);
  // Przechowuje wyniki ostatniego dnia meczowego reprezentacji (wszystkie mecze grupy)
  const [lastNTMatchResults, setLastNTMatchResults] = useState<NTMatchResult[] | null>(null);
  // Baraże MŚ 2026
  const [wcqPlayoffState, setWcqPlayoffState] = useState<WCQPlayoffState | null>(null);
  const [wcState, setWcState] = useState<WCState | null>(null);
  const [europeanViewTab, setEuropeanViewTab] = useState<'clubs' | 'nt'>('clubs');
  const [selectedNTId, setSelectedNTId] = useState<string | null>(null);
  const [gameNotification, setGameNotification] = useState<GameNotificationState | null>(null);
  // Polish Cup & Persistent Events State
  const [cupParticipants, setCupParticipants] = useState<string[]>([]);
  const [activeCupDraw, setActiveCupDraw] = useState<{ id: string, label: string, date: Date, pairs: Fixture[] } | null>(null);
  const [activeGroupDraw, setActiveGroupDraw] = useState<{ id: string, label: string, date: Date, groups: string[][] } | null>(null);
  const [activePlayoffDraw, setActivePlayoffDraw] = useState<ActivePlayoffDraw | null>(null);
  // ── BARAŻE O UTRZYMANIE — stan wyników ──────────────────────────────────
  const [relegationPlayoffFirstLegResults, setRelegationPlayoffFirstLegResults] = useState<RelegationPlayoffFirstLegResults | null>(null);
  const [relegationPlayoffFinalResult, setRelegationPlayoffFinalResult] = useState<RelegationPlayoffFinalResult | null>(null);
  const [promotionPlayoffSemiResults, setPromotionPlayoffSemiResults] = useState<PromotionPlayoffSemiResults | null>(null);
  const [promotionPlayoffFinalResults, setPromotionPlayoffFinalResults] = useState<PromotionPlayoffFinalResults | null>(null);
  const [activePlayoffMatch, setActivePlayoffMatch] = useState<ActivePlayoffMatchData | null>(null);
  const [clGroups, setClGroups] = useState<string[][] | null>(null);
  const [activeELGroupDraw, setActiveELGroupDraw] = useState<{ id: string, label: string, date: Date, groups: string[][] } | null>(null);
  const [elGroups, setElGroups] = useState<string[][] | null>(null);
  const [activeConfGroupDraw, setActiveConfGroupDraw] = useState<{ id: string, label: string, date: Date, groups: string[][] } | null>(null);
  const [confGroups, setConfGroups] = useState<string[][] | null>(null);
  const [processedDrawIds, setProcessedDrawIds] = useState<string[]>([]);
  const [globalFixtures, setGlobalFixtures] = useState<Fixture[]>([]);
  const [elHistoryInitialRound, setElHistoryInitialRound] = useState<string | null>(null);
  const [confHistoryInitialRound, setConfHistoryInitialRound] = useState<string | null>(null);
  const [isResigned, setIsResigned] = useState(false);
  const [winterCampInvitePending, setWinterCampInvitePending] = useState(false);
  const [winterCampProgramPending, setWinterCampProgramPending] = useState(false);
  const [summerCampInvitePending, setSummerCampInvitePending] = useState(false);
  const [summerCampProgramPending, setSummerCampProgramPending] = useState(false);
 const [currentPolishChampionId, setCurrentPolishChampionId] = useState<string>('PL_LECH_POZNAN');
 const [currentPolishCupWinnerId, setCurrentPolishCupWinnerId] = useState<string>('PL_LEGIA_WARSZAWA');
 const [currentCLWinnerId, setCurrentCLWinnerId] = useState<string>('EU_CL_PARIS_SAINT_GERMAIN');
 const [currentELWinnerId, setCurrentELWinnerId] = useState<string>('EU_CL_TOTTENHAM_HOTSPUR');
 const [lastUEFASuperCupResult, setLastUEFASuperCupResult] = useState<MatchHistoryEntry | null>(null);
 // Polskie drużyny do CONF R2Q: sezon 1 = Jagiellonia + Raków, kolejne sezony = 2. i 3. miejsce Ekstraklasy z zabezpieczeniem PP
 const [confR2QPolishTeamIds, setConfR2QPolishTeamIds] = useState<string[]>(['PL_JAGIELLONIA_BIALYSTOK', 'PL_RAKOW_CZESTOCHOWA']);
 const [supercupWinners, setSupercupWinners] = useState<{ season: string; winner: string; year: number; }[]>(() => {
    // Załaduj z localStorage przy inicjalizacji
    try {
      const stored = localStorage?.getItem('fm_championship_history');
      if (stored) {
        const all = JSON.parse(stored) as any[];
        return all.filter(e => e.competition === 'SUPERPUCHAR_POLSKI') || [];
      }
    } catch (e) {
      console.error('Failed to load supercup winners from localStorage:', e);
    }
    // Fallback na dane domyślne
    return [
      { season: '2023/2024', winner: 'Jagiellonia Białystok', year: 2024 }
    ];
  });

  // Guard: zapobiega wielokrotnemu uruchomieniu processLeagueEvent dla tej samej daty
  const lastProcessedLeagueDateRef = React.useRef<string | null>(null);

  // Helper do dodawania logów finansowych
  const addFinanceLog = useCallback((clubId: string, description: string, amount: number, date?: Date, previousBalance?: number) => {
    const logDate = (date || currentDate).toISOString().split('T')[0];
    
    // Jeśli previousBalance nie podany, pobierz z klubu
    let prevBalance = previousBalance;
    if (prevBalance === undefined) {
      const club = clubs.find(c => c.id === clubId);
      // Jeśli operacja zwiększała budżet, to poprzednie saldo = obecne - kwota
      // Jeśli operacja zmniejszała budżet, to poprzednie saldo = obecne - (-kwota) = obecne + kwota
      prevBalance = club ? club.budget - amount : 0;
    }
    
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: logDate,
      amount: amount,
      type: amount >= 0 ? 'INCOME' as const : 'EXPENSE' as const,
      description: description,
      previousBalance: prevBalance
    };

    setClubs(prev => prev.map(c => 
      c.id === clubId 
        ? { ...c, financeHistory: [newLog, ...(c.financeHistory || [])].slice(0, 50) } 
        : c
    ));
  }, [currentDate, clubs]);

  const showGameNotification = useCallback((notification: { title: string; message: string; tone?: GameNotificationTone }) => {
    setGameNotification({
      title: notification.title,
      message: notification.message,
      tone: notification.tone || 'info'
    });
  }, []);

  const clearGameNotification = useCallback(() => {
    setGameNotification(null);
  }, []);

  useEffect(() => {
    if (!gameNotification) return;

    const timer = window.setTimeout(() => {
      setGameNotification(null);
    }, 4200);

    return () => window.clearTimeout(timer);
  }, [gameNotification]);

  const addSupercupWinner = useCallback((season: string, winner: string, year: number) => {
    setSupercupWinners(prev => {
      const exists = prev.some(w => w.season === season);
      if (exists) {
        return prev.map(w => w.season === season ? { season, winner, year } : w);
      }
      return [...prev, { season, winner, year }];
    });
  }, []);

  // Guard: śledzi ID maili już wysłanych w trakcie sesji (by nie duplikować przy stale closure)
  const sentMailIdsRef = React.useRef<Set<string>>(new Set());
  const sportingDirectorObjectiveResponseLockRef = React.useRef<string | null>(null);

  const buildMailFingerprint = useCallback((mail: MailMessage): string => {
    const dateKey = mail.date instanceof Date ? mail.date.toISOString() : new Date(mail.date).toISOString();
    return [
      mail.id,
      mail.sender,
      mail.role,
      mail.subject,
      mail.body,
      mail.type,
      dateKey,
      mail.metadata ? JSON.stringify(mail.metadata) : '',
    ].join('||');
  }, []);

  const prependUniqueMessages = useCallback((incoming: MailMessage[], directorOnly = false) => {
    if (incoming.length === 0) return;

    setMessages(prev => {
      const existing = new Set(prev.map(buildMailFingerprint));
      const nextUnique = incoming.filter(mail => {
        if (directorOnly && mail.role !== 'Dyrektor sportowy') return true;
        const fingerprint = buildMailFingerprint(mail);
        if (existing.has(fingerprint)) return false;
        existing.add(fingerprint);
        return true;
      });

      if (nextUnique.length === 0) return prev;
      return [...nextUnique, ...prev];
    });
  }, [buildMailFingerprint]);

  const buildContractStaffAlert = useCallback((
    club: Club,
    squad: Player[],
    date: Date,
    lineup?: Lineup
  ): MailMessage | null => {
    if (squad.length === 0) return null;

    const daysLeft = (player: Player): number =>
      Math.floor((new Date(player.contractEndDate).getTime() - date.getTime()) / 86_400_000);

    const played = (player: Player): number =>
      (player.stats?.matchesPlayed || 0) +
      (player.cupStats?.matchesPlayed || 0) +
      (player.euroStats?.matchesPlayed || 0);

    const minutes = (player: Player): number =>
      (player.stats?.minutesPlayed || 0) +
      (player.cupStats?.minutesPlayed || 0) +
      (player.euroStats?.minutesPlayed || 0);

    const averageRating = (player: Player): number | null => {
      const ratings = [
        ...(player.stats?.ratingHistory || []),
        ...(player.cupStats?.ratingHistory || []),
        ...(player.euroStats?.ratingHistory || []),
      ];
      return ratings.length > 0
        ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
        : null;
    };

    const lineupIds = new Set<string>([
      ...(lineup?.startingXI.filter(Boolean) as string[] || []),
      ...(lineup?.bench || []),
    ]);
    const squadAverage = squad.reduce((sum, player) => sum + player.overallRating, 0) / squad.length;
    const samePositionAverage = (position: PlayerPosition): number => {
      const group = squad.filter(player => player.position === position);
      return group.length > 0
        ? group.reduce((sum, player) => sum + player.overallRating, 0) / group.length
        : squadAverage;
    };

    const expiring = squad
      .map(player => {
        const left = daysLeft(player);
        if (left <= 0 || left > 425 || player.transferPendingClubId) return null;

        const matchCount = played(player);
        const minutesCount = minutes(player);
        const rating = averageRating(player);
        const positionAverage = samePositionAverage(player.position);
        const importantByRole = player.squadRole === 'KEY_PLAYER' || player.squadRole === 'STARTER' || player.isUntouchable || lineupIds.has(player.id);
        const strongForTeam = player.overallRating >= squadAverage + 3 || player.overallRating >= positionAverage + 4;
        const tooGoodForClub = player.overallRating >= squadAverage + 7 && player.age >= 22 && player.age <= 31 && club.reputation < 78;
        const wantsBetterMove = tooGoodForClub || (player.interestedClubs?.length || 0) >= 2 || player.isNegotiationPermanentBlocked;
        const retirementRisk = player.age >= 36 || (player.age >= 34 && matchCount < 8 && minutesCount < 500);
        const usefulVeteran = player.age >= 32 && player.overallRating >= squadAverage + 2 && matchCount >= 10;
        const poorSeason = rating !== null ? rating < 6.3 : matchCount >= 10 && minutesCount < 700;
        const fringe = !importantByRole && matchCount < 8 && minutesCount < 500;
        const youngUpside = player.age <= 23 && player.attributes.talent >= player.overallRating + 8;

        let recommendation = 'Porozmawiać o przedłużeniu kontraktu';
        if (wantsBetterMove) recommendation = 'Nowy kontrakt albo sprzedaż, zanim stracimy kontrolę';
        else if (retirementRisk) recommendation = 'Krótka rozmowa: rok kontraktu albo plan następcy';
        else if (fringe && !youngUpside) recommendation = 'Rozważyć sprzedaż lub odejście po sezonie';
        else if (youngUpside) recommendation = 'Przedłużyć i zabezpieczyć rozwój';
        else if (poorSeason && !strongForTeam) recommendation = 'Nie spieszyć się z podwyżką, sprawdzić rynek';
        else if (importantByRole || strongForTeam || usefulVeteran) recommendation = 'Przedłużyć możliwie szybko';

        const reasons = [
          left <= 90 ? `zostało tylko ${left} dni kontraktu` : left <= 365 ? `kontrakt kończy się za ${Math.ceil(left / 30)} mies.` : `za około ${Math.ceil((left - 365) / 30)} mies. zacznie się ostatni rok kontraktu`,
          player.squadRole === 'KEY_PLAYER' ? 'status: kluczowy zawodnik' : player.squadRole === 'STARTER' ? 'status: pierwszy skład' : importantByRole ? 'jest w planach meczowych' : 'rola w kadrze jest mniejsza',
          `OVR ${player.overallRating}`,
          matchCount > 0 ? `${matchCount} mecz(e), śr. ocena ${rating ?? 'brak'}` : 'brak większej próbki meczowej',
          wantsBetterMove ? 'może chcieć mocniejszego projektu' : null,
          retirementRisk ? 'ryzyko końca kariery lub spadku roli' : null,
        ].filter(Boolean);

        const urgency =
          (left <= 90 ? 45 : left <= 180 ? 32 : 20) +
          (importantByRole ? 18 : 0) +
          (strongForTeam ? 14 : 0) +
          (wantsBetterMove ? 18 : 0) +
          (retirementRisk ? 10 : 0) +
          (youngUpside ? 10 : 0) -
          (fringe ? 8 : 0);

        return { player, left, recommendation, reasons, urgency };
      })
      .filter(Boolean)
      .sort((a, b) => (b!.urgency - a!.urgency) || (a!.left - b!.left))
      .slice(0, 5);

    if (expiring.length === 0) return null;

    const dateKey = date.toISOString().split('T')[0];
    const signature = expiring.map(entry => `${entry!.player.id}_${entry!.left <= 90 ? '90' : entry!.left <= 180 ? '180' : '365'}`).join('_');
    const lines = expiring.map(entry => {
      const item = entry!;
      return `- ${item.player.firstName} ${item.player.lastName} (${item.player.position}, ${item.player.age} lat): ${item.recommendation}. Powody: ${item.reasons.join(', ')}.`;
    });

    return {
      id: `STAFF_CONTRACT_ALERT_${club.id}_${dateKey}_${signature}`,
      sender: 'Sztab trenera',
      role: 'Asystent trenera',
      subject: 'Przegląd kontraktów: decyzje przed końcem umów',
      body: `Trenerze,\n\nsprawdziliśmy zawodników, którym zostało maksymalnie 14 miesięcy kontraktu. To są sprawy, których nie warto odkładać, bo na 12 miesięcy przed końcem umowy inne kluby mogą zacząć rozmawiać z zawodnikiem o przejściu po wygaśnięciu kontraktu.\n\n${lines.join('\n')}\n\nMoja rekomendacja: przy kluczowych graczach zaczynamy rozmowy teraz, przy zawodnikach z ambicją na większy klub rozważamy też sprzedaż, a przy starszych lub rzadko grających równolegle szukamy następcy.`,
      date: new Date(date),
      isRead: false,
      type: MailType.STAFF,
      priority: 88,
    };
  }, []);

  // Memoized allFixtures
  const allFixtures = useMemo(() => {
    const allLeagueFixtures = Object.values(leagueSchedules).flatMap(s => s.matchdays.flatMap(m => m.fixtures));
    return [...allLeagueFixtures, ...globalFixtures];
  }, [leagueSchedules, globalFixtures]);

const getOrGenerateSquad = useCallback((clubId: string): Player[] => {
    if (players[clubId]) return players[clubId];
    const withMoraleState = (squad: Player[]) => squad.map(PlayerMoraleService.ensurePlayerState);

    // Sprawdź czy to klub europejski (CL)
    const rawCL = RAW_CHAMPIONS_LEAGUE_CLUBS.find(c => generateEuropeanClubId(c.name) === clubId);
    if (rawCL) {
        const newSquad = withMoraleState(SquadGeneratorService.generateEuropeanSquad(clubId, rawCL.tier, rawCL.reputation, rawCL.country));
        setPlayers(prev => ({ ...prev, [clubId]: newSquad }));
        return newSquad;
    }

    const rawEL = RAW_EUROPA_LEAGUE_CLUBS.find(c => generateELClubId(c.name) === clubId);
    if (rawEL) {
        const newSquad = withMoraleState(SquadGeneratorService.generateEuropeanSquad(clubId, rawEL.tier, rawEL.reputation, rawEL.country));
        setPlayers(prev => ({ ...prev, [clubId]: newSquad }));
        return newSquad;
    }

    const rawCONF = RAW_CONFERENCE_LEAGUE_CLUBS.find(c => generateCONFClubId(c.name) === clubId);
    if (rawCONF) {
        const newSquad = withMoraleState(SquadGeneratorService.generateEuropeanSquad(clubId, rawCONF.tier, rawCONF.reputation, rawCONF.country));
        setPlayers(prev => ({ ...prev, [clubId]: newSquad }));
        return newSquad;
    }

    const rawSA = CLUBS_SOUTH_AMERICA.find(c => generateSAClubId(c.name) === clubId);
    if (rawSA) {
        const newSquad = withMoraleState(SquadGeneratorService.generateSouthAmericanSquad(clubId, rawSA.tier, rawSA.reputation, rawSA.country));
        setPlayers(prev => ({ ...prev, [clubId]: newSquad }));
        return newSquad;
    }

    const rawAsian = CLUBS_ASIAN.find(c => generateAsianClubId(c.name) === clubId);
    if (rawAsian) {
        const newSquad = withMoraleState(SquadGeneratorService.generateIntercontinentalSquad(clubId, rawAsian.tier, rawAsian.reputation, rawAsian.country, 'Asia'));
        setPlayers(prev => ({ ...prev, [clubId]: newSquad }));
        return newSquad;
    }

    const rawAfrican = CLUBS_AFRICAN.find(c => generateAfricanClubId(c.name) === clubId);
    if (rawAfrican) {
        const newSquad = withMoraleState(SquadGeneratorService.generateIntercontinentalSquad(clubId, rawAfrican.tier, rawAfrican.reputation, rawAfrican.country, 'Africa'));
        setPlayers(prev => ({ ...prev, [clubId]: newSquad }));
        return newSquad;
    }

    const rawNorthAmerica = CLUBS_NORTH_AMERICA.find(c => generateNorthAmericaClubId(c.name) === clubId);
    if (rawNorthAmerica) {
        const newSquad = withMoraleState(SquadGeneratorService.generateIntercontinentalSquad(clubId, rawNorthAmerica.tier, rawNorthAmerica.reputation, rawNorthAmerica.country, 'North America'));
        setPlayers(prev => ({ ...prev, [clubId]: newSquad }));
        return newSquad;
    }

    const newSquad = withMoraleState(SquadGeneratorService.generateSquadForClub(clubId));
    setPlayers(prev => ({ ...prev, [clubId]: newSquad }));
    return newSquad;
}, [players]);

  const navigateTo = useCallback((view: ViewState) => {
    setPreviousViewState(viewState);
    setViewState(view);
  }, [viewState]);

  const navigateWithoutHistory = useCallback((view: ViewState) => {
    setViewState(view);
  }, []);

  useEffect(() => {
    if (!userTeamId) {
      sportingDirectorObjectiveResponseLockRef.current = null;
      return;
    }

    const objective = clubs.find(club => club.id === userTeamId)?.sportingDirectorObjective;
    if (!objective || objective.status !== 'ACTIVE') {
      sportingDirectorObjectiveResponseLockRef.current = null;
      return;
    }

    if (sportingDirectorObjectiveResponseLockRef.current && sportingDirectorObjectiveResponseLockRef.current !== objective.id) {
      sportingDirectorObjectiveResponseLockRef.current = null;
    }
  }, [clubs, userTeamId]);

  const generateSchedules = (template: SeasonTemplate, currentClubs: Club[]): Record<number, LeagueSchedule> => {
    const schedules: Record<number, LeagueSchedule> = {};
    [1, 2, 3].forEach(tier => {
      const league = STATIC_LEAGUES.find(l => l.id === `L_PL_${tier}`);
      if (league) {
        const tierClubs = currentClubs.filter(c => c.leagueId === league.id);
        schedules[tier] = LeagueScheduleGenerator.generate(tierClubs, template, tier, league.id);
      }
    });
    return schedules;
  };

  const startNewGame = () => {
    const startYear = 2025;
    setIsResigned(false);
    MatchHistoryService.clear();
    ChampionshipHistoryService.clear();
    setSessionSeed(generateRuntimeSeed());
    const template = SeasonTemplateGenerator.generate(startYear);
    // -> tutaj wstaw kod
    const coachData = CoachService.generateInitialCoaches([...STATIC_CLUBS, ...STATIC_CL_CLUBS, ...STATIC_EL_CLUBS, ...STATIC_CONF_CLUBS, ...STATIC_SA_CLUBS, ...STATIC_ASIAN_CLUBS, ...STATIC_AFRICAN_CLUBS, ...STATIC_NA_CLUBS]);
    setCoaches(coachData.coaches);
   


 const initialFreeAgents = FreeAgentService.generatePool(99);
    setPlayers(prev => ({ ...prev, 'FREE_AGENTS': initialFreeAgents }));


    setSeasonTemplate(template);
    setSeasonNumber(1);
    const initialSchedules = generateSchedules(template, STATIC_CLUBS);
    setLeagueSchedules(initialSchedules);

 // Generuj składy dla klubów Ligi Mistrzów
    const europeanPlayers: Record<string, Player[]> = {};
    RAW_CHAMPIONS_LEAGUE_CLUBS.forEach(club => {
      const clubId = generateEuropeanClubId(club.name);
            europeanPlayers[clubId] = SquadGeneratorService.generateEuropeanSquad(clubId, club.tier, club.reputation, club.country);
    });
    RAW_EUROPA_LEAGUE_CLUBS.forEach(club => {
      const clubId = generateELClubId(club.name);
      europeanPlayers[clubId] = SquadGeneratorService.generateEuropeanSquad(clubId, club.tier, club.reputation, club.country);
    });
    RAW_CONFERENCE_LEAGUE_CLUBS.forEach(club => {
      const clubId = generateCONFClubId(club.name);
      europeanPlayers[clubId] = SquadGeneratorService.generateEuropeanSquad(clubId, club.tier, club.reputation, club.country);
    });
    CLUBS_SOUTH_AMERICA.forEach(club => {
      const clubId = generateSAClubId(club.name);
      europeanPlayers[clubId] = SquadGeneratorService.generateSouthAmericanSquad(clubId, club.tier, club.reputation, club.country);
    });
    CLUBS_ASIAN.forEach(club => {
      const clubId = generateAsianClubId(club.name);
      europeanPlayers[clubId] = SquadGeneratorService.generateIntercontinentalSquad(clubId, club.tier, club.reputation, club.country, 'Asia');
    });
    CLUBS_AFRICAN.forEach(club => {
      const clubId = generateAfricanClubId(club.name);
      europeanPlayers[clubId] = SquadGeneratorService.generateIntercontinentalSquad(clubId, club.tier, club.reputation, club.country, 'Africa');
    });
    CLUBS_NORTH_AMERICA.forEach(club => {
      const clubId = generateNorthAmericaClubId(club.name);
      europeanPlayers[clubId] = SquadGeneratorService.generateIntercontinentalSquad(clubId, club.tier, club.reputation, club.country, 'North America');
    });
    setPlayers(prev => ({ ...prev, ...europeanPlayers }));

    // ── Inicjalizacja reprezentacji narodowych ─────────────────────────────────
    const allNationalTeams = NationalTeamService.initializeNationalTeams();
    const ntCoachList = CoachService.generateNationalTeamCoaches();
    const { updatedTeams: teamsWithCoaches, updatedCoaches: assignedNtCoaches } =
      NationalTeamService.assignCoachesToNationalTeams(allNationalTeams, ntCoachList);
    const polishPlayers: Record<string, Player[]> = {};
    STATIC_CLUBS.forEach(club => {
      polishPlayers[club.id] = SquadGeneratorService.generateSquadForClub(club.id);
    });
    setPlayers(prev => ({ ...prev, ...polishPlayers }));

    const allPlayersForNT: Record<string, Player[]> = {
      'FREE_AGENTS': initialFreeAgents,
      ...europeanPlayers,
      ...polishPlayers
    };
    const ntSquadResult = NationalTeamService.generateAllSquads(
      teamsWithCoaches, assignedNtCoaches, allPlayersForNT
    );
    if (ntSquadResult.newPlayers.length > 0) {
      setPlayers(prev => ({
        ...prev,
        'FREE_AGENTS': [...(prev['FREE_AGENTS'] || []), ...ntSquadResult.newPlayers]
      }));
    }
    if (ntSquadResult.playerUpdates.length > 0) {
      const updateMap: Record<string, string> = {};
      ntSquadResult.playerUpdates.forEach(u => { updateMap[u.id] = u.assignedNationalTeamId; });
      setPlayers(prev => {
        const updated: Record<string, Player[]> = {};
        for (const [clubId, squad] of Object.entries(prev)) {
          updated[clubId] = squad.map(p =>
            updateMap[p.id] ? { ...p, assignedNationalTeamId: updateMap[p.id] } : p
          );
        }
        return updated;
      });
    }
    setCoaches(prev => ({ ...prev, ...assignedNtCoaches }));
    setNationalTeams(ntSquadResult.updatedTeams);
    // ── Koniec inicjalizacji reprezentacji ────────────────────────────────────

    setMessages([]);
    setProcessedDrawIds([]);
    const initialSuperCup = SuperCupService.generateFixture(2025, STATIC_CLUBS);
    const initialUEFASuperCup = UEFASuperCupService.generateFixture(2025, STATIC_CLUBS);
    setGlobalFixtures([initialSuperCup, initialUEFASuperCup]);
    const finalClubs = [...STATIC_CLUBS.map(c => ({ ...c, isInPolishCup: false })), ...STATIC_CL_CLUBS, ...STATIC_EL_CLUBS, ...STATIC_CONF_CLUBS, ...STATIC_SA_CLUBS, ...STATIC_ASIAN_CLUBS, ...STATIC_AFRICAN_CLUBS, ...STATIC_NA_CLUBS, UNEMPLOYED_MANAGER_CLUB];
    const staffData = StaffGenerationService.generateInitialStaff(finalClubs);
    setStaffMembers(staffData.staffMembers);
    const clubsWithManagement = ClubManagementService.generateForAllClubs(staffData.updatedClubs);
    setClubs(clubsWithManagement);
    navigateTo(ViewState.MANAGER_CREATION);
  };

  const startNextSeason = useCallback((newYear: number) => {
    // 1. Zidentyfikuj Mistrza i zdobywcę Pucharu PRZED zresetowaniem stanu
    const standingsL1 = [...clubs]
      .filter(c => c.leagueId === 'L_PL_1')
      .sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference || b.stats.goalsFor - a.stats.goalsFor);
    
    const champion = standingsL1[0];

    // Szukamy Finału Pucharu Polski w rozegranych meczach (CompetitionType.POLISH_CUP)
    const cupFinal = allFixtures.find(f => 
      f.leagueId === CompetitionType.POLISH_CUP && 
      f.status === MatchStatus.FINISHED &&
      f.id.includes("CUP_Puchar_Polski:_FINAŁ")
    );
    
    let cupWinnerId: string | undefined;
    let cupLoserId: string | undefined;
    if (cupFinal) {
     const hScore = cupFinal.homeScore || 0;
      const aScore = cupFinal.awayScore || 0;
      let homeWin = hScore > aScore;

      // Jeśli w regulaminowym czasie był remis, sprawdź rzuty karne
      if (hScore === aScore && cupFinal.homePenaltyScore !== undefined) {
        homeWin = cupFinal.homePenaltyScore > (cupFinal.awayPenaltyScore || 0);
      }
      cupWinnerId = homeWin ? cupFinal.homeTeamId : cupFinal.awayTeamId;
      cupLoserId = homeWin ? cupFinal.awayTeamId : cupFinal.homeTeamId;
    }

    // 2. Logika awansów i spadków
    const standingsL2 = [...clubs].filter(c => c.leagueId === 'L_PL_2').sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
    const standingsL3 = [...clubs].filter(c => c.leagueId === 'L_PL_3').sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
    const potentialL4 = clubs.filter(c => c.leagueId === 'L_PL_4');

    const relegatedTeamsL1 = standingsL1.slice(15, 18);
    const promotedTeamsL2 = standingsL2.slice(0, 2);
    const relegatedTeamsL2 = standingsL2.slice(15, 18);
    const promotedTeamsL3 = standingsL3.slice(0, 2);
    const relegatedTeamsL3 = standingsL3.slice(14, 18); // miejsca 15-18 — automatyczny spadek

    // ── BARAŻE O UTRZYMANIE — integracja z awansami/spadkami ────────────────
    // Wynik barażów (miejsca 13-14 w 2.Lidze vs los. drużyny 3.Ligi) jest znany po 29 maja.
    // relegationPlayoffFinalResult.pair0/pair1.loserId = drużyna spadająca do L_PL_4 (lub zostająca w L_PL_3)
    const playoffRelegatedL3Ids: string[] = [];  // kluby z L_PL_3 przegrywające baraże → L_PL_4
    const playoffPromotedL4Ids: string[] = [];   // kluby z L_PL_4 wygrywające baraże → L_PL_3
    if (relegationPlayoffFinalResult) {
      [relegationPlayoffFinalResult.pair0, relegationPlayoffFinalResult.pair1].forEach(outcome => {
        const loserClub = clubs.find(c => c.id === outcome.loserId);
        const winnerClub = clubs.find(c => c.id === outcome.winnerId);
        // Jeśli przegrany to klub z L_PL_3 → spada do L_PL_4
        if (loserClub?.leagueId === 'L_PL_3') playoffRelegatedL3Ids.push(outcome.loserId);
        // Jeśli wygrany to klub z L_PL_4 → awansuje do L_PL_3
        if (winnerClub?.leagueId === 'L_PL_4') playoffPromotedL4Ids.push(outcome.winnerId);
      });
    }

    // Losowanie z L_PL_4: 4 automatyczne awanse + dodatkowi zwycięzcy baraży.
    const remainingL4Pool = potentialL4.filter(c => !playoffPromotedL4Ids.includes(c.id));
    const randomPromotionsNeeded = 4;
    const promotedFromL4Teams = [...remainingL4Pool].sort(() => Math.random() - 0.5).slice(0, randomPromotionsNeeded);

    const relegateFromL1Ids = relegatedTeamsL1.map(c => c.id);
    const promoteFromL2Ids = promotedTeamsL2.map(c => c.id);
    const relegateFromL2Ids = relegatedTeamsL2.map(c => c.id);
    const promoteFromL3Ids = promotedTeamsL3.map(c => c.id);
    if (promotionPlayoffFinalResults) {
      const ekstraklasaWinnerId = promotionPlayoffFinalResults.ekstraklasaFinal.winnerId;
      const ligaOneWinnerId = promotionPlayoffFinalResults.ligaOneFinal.winnerId;
      if (!promoteFromL2Ids.includes(ekstraklasaWinnerId)) promoteFromL2Ids.push(ekstraklasaWinnerId);
      if (!promoteFromL3Ids.includes(ligaOneWinnerId)) promoteFromL3Ids.push(ligaOneWinnerId);
    }
    const relegateFromL3Ids = [...relegatedTeamsL3.map(c => c.id), ...playoffRelegatedL3Ids]; // 15-18 + barażowi przegrani
    const promoteFromL4Ids = [...promotedFromL4Teams.map(c => c.id), ...playoffPromotedL4Ids]; // losowi + barażowi zwycięzcy

    // 3. Budowa raportu
    const getAwards = (leagueId: string, leagueName: string) => {
      const rows = LeagueStatsService.getPlayersForLeague(leagueId, clubs, players);
      const topScorer = LeagueStatsService.getTopScorers(rows, 1)[0]?.player;
      const topAssistant = LeagueStatsService.getTopAssists(rows, 1)[0]?.player;
      return {
        leagueName,
        topScorer: { name: topScorer ? `${topScorer.firstName} ${topScorer.lastName}` : 'Brak', goals: topScorer?.stats.goals || 0 },
        topAssistant: { name: topAssistant ? `${topAssistant.firstName} ${topAssistant.lastName}` : 'Brak', assists: topAssistant?.stats.assists || 0 }
      };
    };

    const promotionToEkstraklasaNames = [...new Set(promoteFromL2Ids
      .map(id => clubs.find(c => c.id === id)?.name)
      .filter((name): name is string => !!name))];
    const promotionToLigaOneNames = [...new Set(promoteFromL3Ids
      .map(id => clubs.find(c => c.id === id)?.name)
      .filter((name): name is string => !!name))];
    const promotionToLigaTwoNames = [...new Set(promoteFromL4Ids
      .map(id => clubs.find(c => c.id === id)?.name)
      .filter((name): name is string => !!name))];

    const summaryData: SeasonSummaryData = {
      year: newYear - 1,
      championName: champion?.name || 'Nieznany',
      promotions: [
        { from: '1. Liga', to: 'Ekstraklasy', teams: promotionToEkstraklasaNames },
        { from: '2. Liga', to: '1. Ligi', teams: promotionToLigaOneNames },
        { from: 'Regionalna', to: '2. Ligi', teams: promotionToLigaTwoNames }
      ],
      relegations: [
        { from: 'Ekstraklasy', to: '1. Ligi', teams: relegatedTeamsL1.map(t => t.name) },
        { from: '1. Ligi', to: '2. Ligi', teams: relegatedTeamsL2.map(t => t.name) },
        { from: '2. Ligi', to: 'Regionalnej', teams: [...new Set(relegateFromL3Ids
          .map(id => clubs.find(c => c.id === id)?.name)
          .filter((name): name is string => !!name))] }
      ],
      leagueAwards: [getAwards('L_PL_1', 'Ekstraklasa'), getAwards('L_PL_2', '1. Liga'), getAwards('L_PL_3', '2. Liga')]
    };

    const summaryMail = MailService.generateSeasonSummaryMail(summaryData);
    setMessages(prev => [summaryMail, ...prev]);

    // 4. Aktualizacja Klubów i Lig
// 4. Aktualizacja Klubów i Trenerów (Nagrody i Kary)
    const updatedCoaches = { ...coaches };
    
    // Funkcja pomocnicza do zmiany parametrów trenera (per-atrybut)
    const adjustCoachIndividual = (coachId: string | undefined, exp: number, dec: number, mot: number, tra: number) => {
      if (!coachId || !updatedCoaches[coachId]) return;
      const c = updatedCoaches[coachId];
      c.attributes.experience     = Math.max(1, Math.min(99, c.attributes.experience     + exp));
      c.attributes.decisionMaking = Math.max(1, Math.min(99, c.attributes.decisionMaking + dec));
      c.attributes.motivation     = Math.max(1, Math.min(99, c.attributes.motivation     + mot));
      c.attributes.training       = Math.max(1, Math.min(99, c.attributes.training       + tra));
    };

    // Pomocnicza: ustal najgłębszą rundę pucharu na podstawie historii meczów
    const getCupReached = (clubId: string): CoachSeasonStats['cupReached'] => {
      if (clubId === cupWinnerId) return 'WINNER';
      const cupFixtures = allFixtures.filter(f =>
        f.leagueId === CompetitionType.POLISH_CUP &&
        f.status === MatchStatus.FINISHED &&
        (f.homeTeamId === clubId || f.awayTeamId === clubId)
      );
      if (cupFixtures.length === 0) return 'NONE';
      const roundPriority: Array<[string, CoachSeasonStats['cupReached']]> = [
        ['FINAŁ', 'FINAL'],
        ['1/2',   'SEMI'],
        ['1/4',   'QUARTER'],
        ['1/8',   'R8'],
        ['1/16',  'R16'],
        ['1/32',  'R32'],
        ['1/64',  'R64'],
      ];
      for (const [keyword, level] of roundPriority) {
        if (cupFixtures.some(f => f.id.includes(keyword))) return level;
      }
      return 'NONE';
    };

    // Zapis statystyk sezonu do trenera (przed resetem club.stats)
    clubs.forEach(club => {
      if (!club.coachId || !updatedCoaches[club.coachId]) return;
      if (club.leagueId !== 'L_PL_1' && club.leagueId !== 'L_PL_2' && club.leagueId !== 'L_PL_3') return;
      const leagueClubs = clubs.filter(c => c.leagueId === club.leagueId);
      const sorted = [...leagueClubs].sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
      const finalRank = sorted.findIndex(c => c.id === club.id) + 1;
      const stat: CoachSeasonStats = {
        season: newYear - 1,
        wins: club.stats.wins, draws: club.stats.draws, losses: club.stats.losses,
        goalsFor: club.stats.goalsFor, goalsAgainst: club.stats.goalsAgainst,
        finalRank, leagueId: club.leagueId, cupReached: getCupReached(club.id)
      };
      const c = updatedCoaches[club.coachId];
      c.seasonStats = [...(c.seasonStats || []).slice(-4), stat];
    });

    const updatedClubs = clubs.map(club => {
      let newLeagueId = club.leagueId;
      let newReputation = club.reputation;
      const isUser = club.id === userTeamId;

      // Logika awansów / spadków i kar/nagród dla trenerów AI
      if (relegateFromL1Ids.includes(club.id)) {
        newLeagueId = 'L_PL_2'; newReputation = Math.max(1, newReputation - 1);
        if (!isUser) adjustCoachIndividual(club.coachId, -1, -1, -2, 0);
      }
      else if (promoteFromL2Ids.includes(club.id)) {
        newLeagueId = 'L_PL_1'; newReputation = Math.min(10, newReputation + 1);
        if (!isUser) adjustCoachIndividual(club.coachId, 2, 1, 2, 1);
      }
      else if (relegateFromL2Ids.includes(club.id)) {
        newLeagueId = 'L_PL_3'; newReputation = Math.max(1, newReputation - 1);
        if (!isUser) adjustCoachIndividual(club.coachId, -1, -1, -2, 0);
      }
      else if (promoteFromL3Ids.includes(club.id)) {
        newLeagueId = 'L_PL_2'; newReputation = Math.min(10, newReputation + 1);
        if (!isUser) adjustCoachIndividual(club.coachId, 2, 1, 2, 1);
      }
      else if (relegateFromL3Ids.includes(club.id)) {
        newLeagueId = 'L_PL_4'; newReputation = Math.max(1, newReputation - 1);
        if (!isUser) adjustCoachIndividual(club.coachId, -1, -1, -2, 0);
      }
      else if (promoteFromL4Ids.includes(club.id)) {
        newLeagueId = 'L_PL_3'; newReputation = Math.min(10, newReputation + 1);
        if (!isUser) adjustCoachIndividual(club.coachId, 2, 1, 2, 1);
      }

      // Nagroda za Mistrzostwo i Puchar
      if (!isUser) {
        if (club.id === champion?.id) adjustCoachIndividual(club.coachId, 3, 2, 3, 1);
        if (club.id === cupWinnerId) adjustCoachIndividual(club.coachId, 2, 1, 3, 1);
      }

      // Ewaluacja per-statystyki (tylko AI, ligi polskie)
      if (!isUser && club.coachId && (club.leagueId === 'L_PL_1' || club.leagueId === 'L_PL_2' || club.leagueId === 'L_PL_3')) {
        const leagueClubs = clubs.filter(c => c.leagueId === club.leagueId);
        const sorted = [...leagueClubs].sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
        const rank = sorted.findIndex(c => c.id === club.id) + 1;
        const teamCount = leagueClubs.length;
        const expectedRank = Math.max(1, 15 - club.reputation);
        const overperform = expectedRank - rank;
        const played = club.stats.played || 34;
        const winRate = played > 0 ? club.stats.wins / played : 0;

        // Doświadczenie: +1 za przeżycie pełnego sezonu
        if (played >= 25) adjustCoachIndividual(club.coachId, 1, 0, 0, 0);

        // Decyzyjność: rank vs oczekiwany
        if (overperform >= 5 && Math.random() < 0.5)  adjustCoachIndividual(club.coachId, 0, 1, 0, 0);
        if (overperform <= -5 && Math.random() < 0.5) adjustCoachIndividual(club.coachId, 0, -1, 0, 0);

        // Motywacja: win rate
        if (winRate >= 0.55) adjustCoachIndividual(club.coachId, 0, 0, 1, 0);
        if (winRate <= 0.30) adjustCoachIndividual(club.coachId, 0, 0, -1, 0);

        // Trening: bramki zdobyte vs średnia ligowa
        const tierGoalAvg = club.leagueId === 'L_PL_1' ? 35 : club.leagueId === 'L_PL_2' ? 30 : 28;
        if (club.stats.goalsFor >= tierGoalAvg * 1.2) adjustCoachIndividual(club.coachId, 0, 0, 0, 1);
        if (club.stats.goalsFor <= tierGoalAvg * 0.8) adjustCoachIndividual(club.coachId, 0, 0, 0, -1);

        // Top 3 bez awansu — losowy bonus motywacji
        const alreadyPromoted = promoteFromL2Ids.includes(club.id) || promoteFromL3Ids.includes(club.id) || promoteFromL4Ids.includes(club.id);
        if (rank <= 3 && !alreadyPromoted && Math.random() < 0.5) adjustCoachIndividual(club.coachId, 0, 0, 1, 0);

        // Ostatnie 3 bez spadku — losowa kara
        const alreadyRelegated = relegateFromL1Ids.includes(club.id) || relegateFromL2Ids.includes(club.id) || relegateFromL3Ids.includes(club.id);
        if (rank >= teamCount - 2 && !alreadyRelegated && Math.random() < 0.5) adjustCoachIndividual(club.coachId, 0, -1, -1, 0);

        // Puchar — bonusy i kary na podstawie getCupReached
        const coachStat = updatedCoaches[club.coachId]?.seasonStats?.slice(-1)[0];
        if (coachStat) {
          // Kara dla silnej drużyny za wylot w 1. rundzie
          if (club.reputation >= 7 && coachStat.cupReached === 'R64' && Math.random() < 0.4) {
            adjustCoachIndividual(club.coachId, 0, 0, -1, 0);
          }
          // Bonus dla słabej drużyny za finał lub półfinał
          if (club.reputation <= 3 && (coachStat.cupReached === 'FINAL' || coachStat.cupReached === 'SEMI') && Math.random() < 0.7) {
            adjustCoachIndividual(club.coachId, 1, 1, 1, 0);
          }
          // Bonus za dotarcie do finału (finalista, nie zwycięzca)
          if (coachStat.cupReached === 'FINAL' && Math.random() < 0.5) {
            adjustCoachIndividual(club.coachId, 1, 0, 1, 0);
          }
        }
      }

      const newTier = parseInt(newLeagueId.split('_')[2]) || 4;
      
      // Obliczanie rankingu klubu w nowej lidze (po potencjalnym awansie/spadku)
      let leagueRanking = 10;
      let currentLeagueStandings: Club[] = [];
      
      if (newLeagueId === 'L_PL_1') {
        currentLeagueStandings = standingsL1;
      } else if (newLeagueId === 'L_PL_2') {
        currentLeagueStandings = standingsL2;
      } else if (newLeagueId === 'L_PL_3') {
        currentLeagueStandings = standingsL3;
      }
      
      if (currentLeagueStandings.length > 0) {
        leagueRanking = currentLeagueStandings.findIndex(c => c.id === club.id) + 1 || leagueRanking;
      }
      
      const seasonalAwardRank = leagueRanking;
      const sponsorshipMult = 0.85 + ((club.management?.marketingDirector?.zdolnosciMarketingowe ?? 10) / 20) * 0.30;
      let nextSeasonInjection = FinanceService.calculateSeasonalIncome(newTier, newReputation, seasonalAwardRank, sponsorshipMult);
      
      // Bonusy ligowe (tylko dla Ekstraklasy - tier 1)
      let leagueBonusAmount = 0;
      if (newTier === 1 && newLeagueId === 'L_PL_1') {
        leagueBonusAmount = FinanceService.calculateLeagueFinishBonus(leagueRanking, newTier);
        nextSeasonInjection += leagueBonusAmount;
      }
      
      // Bonusy za Puchar Polski
      let cupBonusAmount = 0;
      if (club.id === cupWinnerId) {
        cupBonusAmount = FinanceService.calculatePolishCupBonus('WINNER');
        nextSeasonInjection += cupBonusAmount;
      }

      // Tworzymy logi finansowe dla bonusów
      const financeLogsToAdd: any[] = [];
      let currentBalance = club.budget;

      const seasonalLog = {
        id: Math.random().toString(36).substring(2, 9),
        date: currentDate.toISOString().split('T')[0],
        amount: nextSeasonInjection,
        type: 'INCOME' as const,
        description: `Zastrzyk finansowy (TV, Sponsoring, Nagrody)`,
        previousBalance: currentBalance
      };
      financeLogsToAdd.push(seasonalLog);

      // Jeśli są bonusy ligowe lub pucharowe, dodaj je jako osobne wpisy
      if (leagueBonusAmount > 0) {
        currentBalance += nextSeasonInjection - leagueBonusAmount; // Uwzględniamy inne przychody
        financeLogsToAdd.push({
          id: Math.random().toString(36).substring(2, 9),
          date: currentDate.toISOString().split('T')[0],
          amount: leagueBonusAmount,
          type: 'INCOME' as const,
          description: `Nagroda za ${leagueRanking === 1 ? 'Mistrzostwo Polski' : (leagueRanking === 2 ? '2. miejsce w Ekstraklasie' : (leagueRanking === 3 ? '3. miejsce w Ekstraklasie' : (leagueRanking === 4 ? '4. miejsce w Ekstraklasie' : `${leagueRanking}. miejsce w Ekstraklasie`)))}`,
          previousBalance: currentBalance
        });
      }
      
      if (cupBonusAmount > 0) {
        currentBalance = currentBalance - (leagueBonusAmount > 0 ? leagueBonusAmount : 0) + nextSeasonInjection;
        financeLogsToAdd.push({
          id: Math.random().toString(36).substring(2, 9),
          date: currentDate.toISOString().split('T')[0],
          amount: cupBonusAmount,
          type: 'INCOME' as const,
          description: `Nagroda za zwycięstwo w Pucharze Polski`,
          previousBalance: currentBalance
        });
      }

      // Premie za osiągnięcia wypłacane z budżetu (koszt dla klubu)
      const hojnosc = club.board?.hojnosc ?? 'przecietna';
      let achievementBonusCost = 0;
      let achievementDesc = '';

      if (club.leagueId === 'L_PL_1') {
        if (club.id === champion?.id) {
          achievementBonusCost = FinanceService.calculateAchievementBonus('CHAMPION', club.reputation, hojnosc);
          achievementDesc = 'Premia dla sztabu za Mistrzostwo Polski';
        } else if (leagueRanking === 2) {
          achievementBonusCost = FinanceService.calculateAchievementBonus('RUNNER_UP', club.reputation, hojnosc);
          achievementDesc = 'Premia dla sztabu za 2. miejsce w Ekstraklasie';
        } else if (leagueRanking === 3) {
          achievementBonusCost = FinanceService.calculateAchievementBonus('THIRD', club.reputation, hojnosc);
          achievementDesc = 'Premia dla sztabu za 3. miejsce w Ekstraklasie';
        } else if (leagueRanking === 4) {
          achievementBonusCost = FinanceService.calculateAchievementBonus('FOURTH', club.reputation, hojnosc);
          achievementDesc = 'Premia dla sztabu za 4. miejsce w Ekstraklasie';
        }
      }
      if (promoteFromL2Ids.includes(club.id)) {
        achievementBonusCost += FinanceService.calculateAchievementBonus('PROMOTE_L2_L1', club.reputation, hojnosc);
        achievementDesc = achievementDesc || 'Premia dla sztabu za awans do Ekstraklasy';
      } else if (promoteFromL3Ids.includes(club.id)) {
        achievementBonusCost += FinanceService.calculateAchievementBonus('PROMOTE_L3_L2', club.reputation, hojnosc);
        achievementDesc = achievementDesc || 'Premia dla sztabu za awans do 1. Ligi';
      }
      if (club.id === cupWinnerId) {
        achievementBonusCost += FinanceService.calculateAchievementBonus('CUP_WINNER', club.reputation, hojnosc);
        achievementDesc = achievementDesc || 'Premia dla sztabu za Puchar Polski';
      } else if (club.id === cupLoserId) {
        achievementBonusCost += FinanceService.calculateAchievementBonus('CUP_FINALIST', club.reputation, hojnosc);
        achievementDesc = achievementDesc || 'Premia dla sztabu za finał Pucharu Polski';
      } else {
        const cupReached = getCupReached(club.id);
        if (cupReached === 'SEMI') {
          achievementBonusCost += FinanceService.calculateAchievementBonus('CUP_SEMI', club.reputation, hojnosc);
          achievementDesc = achievementDesc || 'Premia dla sztabu za półfinał Pucharu Polski';
        }
      }

      if (achievementBonusCost > 0) {
        const balanceAfterInjection = club.budget + nextSeasonInjection;
        financeLogsToAdd.push({
          id: Math.random().toString(36).substring(2, 9),
          date: currentDate.toISOString().split('T')[0],
          amount: -achievementBonusCost,
          type: 'EXPENSE' as const,
          description: achievementDesc,
          previousBalance: balanceAfterInjection
        });
      }

      return {
        ...club,
        leagueId: newLeagueId,
        reputation: newReputation,
        budget: club.budget + nextSeasonInjection - achievementBonusCost,
        reserveBudget: Math.max(
          0,
          (club.reserveBudget ?? FinanceService.calculateInitialReserveBudget(club.budget, club.reputation)) +
          FinanceService.calculateInitialReserveBudget(nextSeasonInjection, newReputation)
        ),
        transferBudget: (() => {
          const KOMPETENCJA_BUDGET_MULT: Record<string, number> = {
            bardzo_wysoka: 1.25, wysoka: 1.12, przecietna: 1.00, niska: 0.90, bardzo_niska: 0.80,
          };
          const kompMult = club.board ? (KOMPETENCJA_BUDGET_MULT[club.board.kompetencja] ?? 1.00) : 1.00;
          const boostedInjection = nextSeasonInjection * kompMult;
          const nextBudget = club.budget + boostedInjection - achievementBonusCost;
          return FinanceService.calculateInitialTransferBudget(nextBudget, newReputation);
        })(),
        boardBudgetRequestsThisSeason: 0,
        financeHistory: [...financeLogsToAdd, ...(club.financeHistory || [])].slice(0, 50),
        stats: { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 0, form: [] },
        europeanBonusPoints: 0,
        isInPolishCup: false,
        board: club.management ? computeBoardFromManagement(club.management) : generateRandomBoard(),
        boardConfidence: 75,
        sponsorAcquiredThisSeason: false,
        nextSponsorCheckDate: undefined,
        ownerRescueThisSeason: false
      };
    });

    setCoaches(updatedCoaches);
    setClubs(updatedClubs);

// Reset europejskiego statusu — wszyscy z powrotem biorą udział w LM na nowy sezon
    const freshEuropeanStatus: Record<string, EuropeanStatus> = {};
    RAW_CHAMPIONS_LEAGUE_CLUBS.forEach(club => {
      const clubId = generateEuropeanClubId(club.name);
      freshEuropeanStatus[clubId] = {
        isInChampionsLeague: true,
        isInEuropeanLeague: false,
        isInConferenceLeague: false,
        isInChampionsLeagueNextPhase: false,
        isInEuropeanLeagueNextPhase: false,
        isInConferenceLeagueNextPhase: false,
      };
    });
    setEuropeanStatus(freshEuropeanStatus);

    setLeagues(prevLeagues => prevLeagues.map(l => ({
      ...l,
      teamIds: updatedClubs.filter(c => c.leagueId === l.id && c.isDefaultActive).map(c => c.id)
    })));

    setSeasonNumber(prev => prev + 1);
    const newTemplate = SeasonTemplateGenerator.generate(newYear);
    setSeasonTemplate(newTemplate);
    const newSchedules = generateSchedules(newTemplate, updatedClubs);
    setLeagueSchedules(newSchedules);

    // 5. Generowanie meczu Superpucharu na nowy sezon
    const nextSuperCup = SuperCupService.generateFixture(newYear, updatedClubs, champion?.id, cupWinnerId);
    const nextUEFASuperCup = UEFASuperCupService.generateFixture(newYear, updatedClubs, currentCLWinnerId, currentELWinnerId);
    setGlobalFixtures([nextSuperCup, nextUEFASuperCup]); // Czyścimy stare puchary, zostawiamy Superpuchary na nowy sezon
    if (champion?.id) setCurrentPolishChampionId(champion.id);

    // Ustal kto idzie do LE R2Q: zwycięzca PP, chyba że jest też mistrzem — wtedy przegrany finału
    if (cupWinnerId) {
      const polishCupR2QId = (cupWinnerId === champion?.id && cupLoserId) ? cupLoserId : cupWinnerId;
      setCurrentPolishCupWinnerId(polishCupR2QId);
    }

    // Ustal 2 polskie drużyny do CONF R2Q: 2. i 3. miejsce Ekstraklasy
    // Jeśli drużyna z 2. lub 3. miejsca wygrała PP (gra w LE), zastępujemy ją 4. miejscem
    {
      const lePolishTeamId = cupWinnerId
        ? ((cupWinnerId === champion?.id && cupLoserId) ? cupLoserId : cupWinnerId)
        : null;

      const candidates: string[] = [];
      let replacementIndex = 3; // index 3 = 4. miejsce (0-based)

      for (let i = 1; i < standingsL1.length && candidates.length < 2; i++) {
        const candidateId = standingsL1[i].id;
        if (candidateId === lePolishTeamId) {
          // Ta drużyna idzie do LE — pomijamy, bierzemy następną z listy
          const replacement = standingsL1[replacementIndex];
          if (replacement && !candidates.includes(replacement.id) && replacement.id !== lePolishTeamId) {
            candidates.push(replacement.id);
            replacementIndex++;
          }
        } else {
          candidates.push(candidateId);
        }
      }

      if (candidates.length > 0) {
        setConfR2QPolishTeamIds(candidates.slice(0, 2));
      }
    }


        const seasonEndDate = new Date(newYear - 1, 5, 30); // 30 czerwca kończącego się sezonu
    const transitionResult = SeasonTransitionService.processSquadTransition(players, updatedClubs, seasonEndDate, userTeamId);
    setPlayers(transitionResult.updatedPlayers);

    // Zwolnieni zawodnicy → wolni agenci
    if (transitionResult.releasedPlayers.length > 0) {
      setPlayers(prev => ({
        ...prev,
        'FREE_AGENTS': [...(prev['FREE_AGENTS'] || []), ...transitionResult.releasedPlayers]
      }));
    }

if (userTeamId) {
      const myRetirements = transitionResult.retirementLogs.filter(log => log.clubId === userTeamId);
      const userClub = updatedClubs.find(c => c.id === userTeamId);
      const retirementMail = MailService.generateRetirementReportMail(myRetirements, userClub?.name || "");
      setMessages(prev => [retirementMail, ...prev]);
    }

    const staffRetirementResult = SeasonTransitionService.processStaffRetirement(staffMembers, coaches, updatedClubs, userTeamId);
    setStaffMembers(staffRetirementResult.updatedStaff);
    setCoaches(staffRetirementResult.updatedCoaches);
    setClubs(prev => prev.map(c => {
      const upd = staffRetirementResult.clubStaffUpdates[c.id];
      if (!upd) return c;
      return {
        ...c,
        staffIds: upd.staffIds,
        coachId: upd.coachId === null ? undefined : (upd.coachId ?? c.coachId),
      };
    }));
    if (userTeamId && staffRetirementResult.retiredFromUserTeam.length > 0) {
      const staffRetireMail = MailService.generateStaffRetirementMail(staffRetirementResult.retiredFromUserTeam);
      setMessages(prev => [staffRetireMail, ...prev]);
    }

    // 6. Poczta
    if (userTeamId) {
      const newEndMails: MailMessage[] = [];

      // Email jeśli gracz wygrał ligę
      if (champion?.id === userTeamId) {
        const userClub = clubs.find(c => c.id === userTeamId);
        const leagueChampionMail = MailService.createFromTemplate('board_league_champion', {
          'CLUB': userClub?.name || ''
        });
        newEndMails.push(leagueChampionMail);
      }

      if (newEndMails.length > 0) {
        setMessages(prev => [...newEndMails, ...prev]);
      }
    }
    RefereeService.applyEndOfSeasonAdjustments();
    RefereeService.resetSeasonStats();
    
    // Zapisz zwycięzców do historii
    const seasonKey = `${newYear - 1}/${newYear}`;
    if (champion?.name) {
      // Znajdź drugie miejsce w Ekstraklasie
      const secondPlace = standingsL1[1];
      ChampionshipHistoryService.addEkstraklasaChampion(
        seasonKey,
        champion.name,
        secondPlace?.name || 'Nieznany',
        newYear
      );
    }
    
    if (cupWinnerId) {
      const cupWinner = updatedClubs.find(c => c.id === cupWinnerId);
      if (cupWinner?.name) {
        ChampionshipHistoryService.addCupChampion(seasonKey, 'PUCHAR_POLSKI', cupWinner.name, newYear);
      }
    }
    // Superpuchar będzie uzupełniany po meczu (na razie tylko zwycięzcy ligi i pucharu)
    
    setRoundResults({});
    sentMailIdsRef.current = new Set();
    lastProcessedLeagueDateRef.current = null;

    // Czyścimy fazy grupowe europejskich pucharów, aby nowy sezon startował od pustego widoku.
    setClGroups(null);
    setActiveGroupDraw(null);
    setElGroups(null);
    setActiveELGroupDraw(null);
    setConfGroups(null);
    setActiveConfGroupDraw(null);
    setElHistoryInitialRound(null);
    setConfHistoryInitialRound(null);
  }, [clubs, players, userTeamId, allFixtures, coaches, relegationPlayoffFinalResult, promotionPlayoffFinalResults]);

  const getSaveState = (): SaveState => ({
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    currentDate,
    sessionSeed,
    clubs,
    leagues,
    players,
    reserves,
    reserveCoachId,
    reserveFixtures,
    reserveMatchResults,
    academy,
    scoutPool,
    scoutMarket,
    scoutMarketRefreshDate,
    lineups,
    userTeamId,
    seasonTemplate,
    leagueSchedules,
    lastRecoveryDate,
    coaches,
    staffMembers,
    roundResults,
    managerProfile,
    seasonNumber,
    messages,
    activeTrainingId,
    activeIntensity,
    trainingProgressHistory,
    reserveProgressHistory,
    pendingNegotiations,
    pendingFriendlyRequests,
    activeFriendlyFixtureId,
    activeFriendlyConditions,
    transferOffers,
    incomingOffers,
    aiTransferLog,
    europeanStatus,
    nationalTeams,
    wcqPlayoffState,
    wcState,
    cupParticipants,
    activeCupDraw,
    activeGroupDraw,
    activePlayoffDraw,
    relegationPlayoffFirstLegResults,
    relegationPlayoffFinalResult,
    promotionPlayoffSemiResults,
    promotionPlayoffFinalResults,
    activePlayoffMatch,
    clGroups,
    activeELGroupDraw,
    elGroups,
    activeConfGroupDraw,
    confGroups,
    elHistoryInitialRound,
    confHistoryInitialRound,
    processedDrawIds,
    globalFixtures,
    isResigned,
    currentPolishChampionId,
    currentPolishCupWinnerId,
    currentCLWinnerId,
    currentELWinnerId,
    lastUEFASuperCupResult,
    confR2QPolishTeamIds,
    supercupWinners,
    matchHistory: MatchHistoryService.getAll(),
    championshipHistory: ChampionshipHistoryService.getAll(),
    winterCampInvitePending,
    winterCampProgramPending,
    summerCampInvitePending,
    summerCampProgramPending,
    lastNTMatchResults,
    aiFriendlyPairs,
    aiFriendlyReports,
  });

  const loadGameFromFile = (data: SaveState): void => {
    const loadedClubs = SportingDirectorService.ensureForUserClub(data.clubs, data.userTeamId);
    setCurrentDate(data.currentDate);
    setSessionSeed(data.sessionSeed);
    setClubs(loadedClubs);
    setLeagues(data.leagues);
    setPlayers(data.players);
    setReserves(data.reserves);
    setReserveCoachId(data.reserveCoachId);
    setReserveFixtures(data.reserveFixtures ?? []);
    setReserveMatchResults(data.reserveMatchResults ?? []);
    setAcademy(data.academy);
    setScoutPool(data.scoutPool);
    setScoutMarket(data.scoutMarket);
    setScoutMarketRefreshDate(data.scoutMarketRefreshDate);
    setScoutMarketManualRefreshCount(data.scoutMarketManualRefreshCount ?? 0);
    setScoutMarketPeriodStart(data.scoutMarketPeriodStart ?? '');
    setLineups(data.lineups);
    setUserTeamId(data.userTeamId);
    setSeasonTemplate(data.seasonTemplate);
    setLeagueSchedules(data.leagueSchedules);
    setLastRecoveryDate(data.lastRecoveryDate);
    setCoaches(data.coaches);
    setStaffMembers(data.staffMembers ?? {});
    setRoundResults(data.roundResults);
    setManagerProfile(data.managerProfile);
    setSeasonNumber(data.seasonNumber);
    setMessages(data.messages);
    setActiveTrainingId(data.activeTrainingId);
    setActiveIntensity(data.activeIntensity);
    setTrainingProgressHistory(data.trainingProgressHistory);
    setReserveProgressHistory(data.reserveProgressHistory);
    setPendingNegotiations(data.pendingNegotiations);
    setPendingFriendlyRequests(data.pendingFriendlyRequests);
    setActiveFriendlyFixtureId(data.activeFriendlyFixtureId);
    setActiveFriendlyConditions(data.activeFriendlyConditions);
    setTransferOffers(data.transferOffers);
    setIncomingOffers(data.incomingOffers);
    setAiTransferLog(data.aiTransferLog);
    setEuropeanStatus(data.europeanStatus);
    setNationalTeams(data.nationalTeams);
    setWcqPlayoffState(data.wcqPlayoffState);
    setWcState(data.wcState ?? null);
    setCupParticipants(data.cupParticipants);
    setActiveCupDraw(data.activeCupDraw);
    setActiveGroupDraw(data.activeGroupDraw);
    setActivePlayoffDraw(data.activePlayoffDraw);
    setRelegationPlayoffFirstLegResults(data.relegationPlayoffFirstLegResults);
    setRelegationPlayoffFinalResult(data.relegationPlayoffFinalResult);
    setPromotionPlayoffSemiResults(data.promotionPlayoffSemiResults);
    setPromotionPlayoffFinalResults(data.promotionPlayoffFinalResults);
    setActivePlayoffMatch(data.activePlayoffMatch);
    setClGroups(data.clGroups);
    setActiveELGroupDraw(data.activeELGroupDraw);
    setElGroups(data.elGroups);
    setActiveConfGroupDraw(data.activeConfGroupDraw);
    setConfGroups(data.confGroups);
    setElHistoryInitialRound(data.elHistoryInitialRound ?? null);
    setConfHistoryInitialRound(data.confHistoryInitialRound ?? null);
    setProcessedDrawIds(data.processedDrawIds);
    setGlobalFixtures(data.globalFixtures);
    setIsResigned(data.isResigned);
    setCurrentPolishChampionId(data.currentPolishChampionId);
    setCurrentPolishCupWinnerId(data.currentPolishCupWinnerId);
    setCurrentCLWinnerId(data.currentCLWinnerId);
    setCurrentELWinnerId(data.currentELWinnerId);
    setLastUEFASuperCupResult(data.lastUEFASuperCupResult);
    setConfR2QPolishTeamIds(data.confR2QPolishTeamIds);
    setSupercupWinners(data.supercupWinners);
    setWinterCampInvitePending(data.winterCampInvitePending ?? false);
    setWinterCampProgramPending(data.winterCampProgramPending ?? false);
    setSummerCampInvitePending(data.summerCampInvitePending ?? false);
    setSummerCampProgramPending(data.summerCampProgramPending ?? false);
    setLastNTMatchResults(data.lastNTMatchResults ?? null);
    setAiFriendlyPairs(data.aiFriendlyPairs || []);
    setAiFriendlyReports(data.aiFriendlyReports || []);
    MatchHistoryService.clear();
    (data.matchHistory || []).forEach((e: any) => MatchHistoryService.logMatch(e));
    ChampionshipHistoryService.clear();
    ChampionshipHistoryService.restore(data.championshipHistory || []);
    setViewState(ViewState.DASHBOARD);
  };

  const saveManagerProfile = (profile: ManagerProfile) => {
    setManagerProfile(profile);
    navigateTo(ViewState.TEAM_SELECTION);
  };

const selectUserTeam = (clubId: string) => {
    setUserTeamId(clubId);
    const club = clubs.find(c => c.id === clubId)!;
    const squad = getOrGenerateSquad(clubId);
    const sportingDirector = club.sportingDirector ?? SportingDirectorService.generateForClub(club);
    if (club.coachId) {
      setCoaches(prev => {
        const prev_coach = prev[club.coachId!];
        if (!prev_coach) return prev;
        return { ...prev, [club.coachId!]: { ...prev_coach, currentClubId: null } };
      });
    }
    setClubs(prev => prev.map(c => c.id === clubId ? { ...c, coachId: undefined, sportingDirector } : c));

    const leagueTier = club?.leagueId === 'L_PL_1' ? 1 : club?.leagueId === 'L_PL_2' ? 2 : club?.leagueId === 'L_PL_3' ? 3 : 4;
    const generatedReserves = SquadGeneratorService.generateReservesSquad(clubId, club?.name || '', leagueTier, club?.reputation || 5, club?.budget || 5000000);
    setReserves(generatedReserves);

    // Generuj trenera rezerw: 75% szansy na Polaka, 25% na zagranicznego
    const isPolish = Math.random() < 0.75;
    const newReserveCoach = CoachService.createRandomCoach(isPolish);
    const reserveCoachWithClub = { ...newReserveCoach, currentClubId: clubId };
    setCoaches(prev => ({ ...prev, [newReserveCoach.id]: reserveCoachWithClub }));
    setReserveCoachId(newReserveCoach.id);

    const presetLevel = CLUBS_WITH_PRESET_ACADEMY[clubId] as ClubAcademy['level'] | undefined;
    if (presetLevel) {
      setAcademy({
        level: presetLevel,
        youthPlayers: [],
        lastIntakeYear: 0,
        operationalBudgetWeekly: AcademyService.getDefaultOperationalBudget(presetLevel),
        upgradeInProgress: false,
        upgradeCompletionDate: undefined,
        regionFocus: undefined,
        activeMissions: [],
        promotedHistory: [],
      });
    } else {
      setAcademy(null);
    }

    // Inicjalizacja puli skautów
    const pool = ScoutService.generateScoutPool(Date.now());
    setScoutPool(pool);
    const userClub = clubs.find(c => c.id === clubId);
    const market = ScoutService.generateMarket(pool, userClub?.reputation ?? 5, userClub?.board?.kompetencja);
    setScoutMarket(market);
    setScoutMarketRefreshDate(new Date().toISOString().split('T')[0]);

    const lineup = LineupService.autoPickLineup(clubId, squad);
    setLineups(prev => ({ ...prev, [clubId]: lineup }));
    
    const otherLineups: Record<string, Lineup> = {};
    STATIC_CLUBS.filter(c => c.isDefaultActive && c.id !== clubId).forEach(c => {
      const s = getOrGenerateSquad(c.id);
      const clubCoach = c.coachId ? (coaches[c.coachId] ?? null) : null;
      otherLineups[c.id] = LineupService.autoPickLineup(c.id, s, '4-4-2', clubCoach);
    });
    setLineups(prev => ({ ...prev, ...otherLineups }));

   const welcomeMail = MailService.generateWelcomeMail(club, squad, currentDate);
const fanMail = MailService.generateFanWelcomeMail(club, squad, currentDate); // Tę funkcję zaraz dopiszemy
setMessages([welcomeMail, fanMail]);

    navigateTo(ViewState.SQUAD_IMPORT);
  };

  const resignFromClub = () => {
    setIsResigned(true);
    setUserTeamId(UNEMPLOYED_MANAGER_CLUB_ID);
    setIncomingOffers([]);
  };

  const updateLineup = (clubId: string, lineup: Lineup) => {
    setLineups(prev => ({ ...prev, [clubId]: lineup }));
  };

  const addRoundResults = useCallback((results: LeagueRoundResults) => {
    DebugLoggerService.log('ROUND_SAVE', `dateKey=${results.dateKey} | L1=${results.league1Results.length} | L2=${results.league2Results.length} | L3=${results.league3Results.length}`, true);
    setRoundResults(prev => ({ ...prev, [results.dateKey]: results }));
  }, []);

  const applySimulationResult = useCallback((simulation: SimulationOutput) => {
    if (simulation.aiTransferLogEntries && simulation.aiTransferLogEntries.length > 0) {
      setAiTransferLog(prev => [...simulation.aiTransferLogEntries!, ...prev].slice(0, 1000));
    }
    let finalClubs = simulation.updatedClubs;

   let finalPlayers = simulation.updatedPlayers;
    let fitnessCoachQuality: number | undefined = undefined;

 if (simulation.ratings) {
      for (const clubId in finalPlayers) {
        finalPlayers[clubId] = finalPlayers[clubId].map(p => {
          if (simulation.ratings && simulation.ratings[p.id]) {
            const hist = p.stats.ratingHistory || [];
            return { ...p, stats: { ...p.stats, ratingHistory: [...hist, simulation.ratings[p.id]] } };
          }
          return p;
        });
      }
    }


    if (userTeamId) {
      // TUTAJ WSTAW TEN KOD
      const userClub = finalClubs.find(c => c.id === userTeamId);
      const tier = parseInt(userClub?.leagueId.split('_')[2] || '1');
      
      const gkCoachMember = (userClub?.staffIds ?? [])
        .map(id => staffMembers[id])
        .find(s => s?.role === StaffRole.GOALKEEPER_COACH);
      const gkCoachQuality = gkCoachMember ? Math.round(
        ((gkCoachMember.attributes.gkTechnique ?? 10) +
         (gkCoachMember.attributes.positioning ?? 10) +
         (gkCoachMember.attributes.footwork ?? 10)) / 3
      ) : undefined;
      const assistantCoachMembers = (userClub?.staffIds ?? [])
        .map(id => staffMembers[id])
        .filter((s): s is StaffMember => s?.role === StaffRole.ASSISTANT_COACH);
      const assistantCoachQuality = assistantCoachMembers.length > 0
        ? Math.round(
            assistantCoachMembers.reduce((sum, s) =>
              sum + ((s.attributes.offensiveTactics ?? 10) +
                     (s.attributes.defensiveTactics ?? 10) +
                     (s.attributes.motivation ?? 10)) / 3,
              0
            ) / assistantCoachMembers.length
          )
        : undefined;
      const fitnessCoachMembers = (userClub?.staffIds ?? [])
        .map(id => staffMembers[id])
        .filter((s): s is StaffMember => s?.role === StaffRole.FITNESS_COACH);
      fitnessCoachQuality = fitnessCoachMembers.length > 0
        ? Math.round(
            fitnessCoachMembers.reduce((sum, s) =>
              sum + ((s.attributes.periodization ?? 10) +
                     (s.attributes.fitnessTests ?? 10) +
                     (s.attributes.nutrition ?? 10)) / 3,
              0
            ) / fitnessCoachMembers.length
          )
        : undefined;

      finalPlayers = TrainingService.processTrainingEffects(
        finalPlayers,
        userTeamId,
        activeTrainingId,
        lastMatchSummary,
        userClub?.reputation || 5,
        tier,
        activeIntensity,
        userClub?.country,
        gkCoachQuality,
        assistantCoachQuality,
        fitnessCoachQuality
      );
      // KONIEC WSTAWKI

      // Zapis tygodniowego progresu treningowego (średni OVR drużyny)
      const teamAfterTraining = finalPlayers[userTeamId] || [];
      if (teamAfterTraining.length > 0) {
        const avgOvr = Math.round(
          teamAfterTraining.reduce((sum, p) => sum + p.overallRating, 0) / teamAfterTraining.length
        );
        setTrainingProgressHistory(prev => [...prev.slice(-19), avgOvr]);
      }

      // Trening rezerw — automatyczny plan trenera rezerw
      if (reserves.length > 0) {
        const reserveCoach = reserveCoachId ? coaches[reserveCoachId] : null;
        const coachTrainingAttr = reserveCoach?.attributes.training ?? 50;
        const coachExperience = reserveCoach?.attributes.experience ?? 50;
        const coachDecision = reserveCoach?.attributes.decisionMaking ?? 50;
        const individualWork = Math.round((coachExperience + coachDecision) / 10);
        const weekSeed = Math.floor(currentDate.getTime() / (7 * 86400000));
        let rngOffset = 1;
        const weekRng = () => { const x = Math.sin(weekSeed * 9301 + rngOffset++ * 49297 + 233) * 1000; return x - Math.floor(x); };
        const reservePlan = TrainingAssistantService.buildPlan(reserves, weekRng, individualWork);
        const updatedReserves = TrainingService.processReserveTrainingEffects(
          reserves,
          reservePlan.cycleId,
          reservePlan.playerFocuses,
          coachTrainingAttr,
          userClub?.reputation || 5,
          tier,
          userClub?.country
        );
        const reviewedReserves = PlayerMoraleService.processPeriodicReview(updatedReserves, currentDate);
        setReserves(reviewedReserves);
        if (reviewedReserves.length > 0) {
          const avgOvrRes = Math.round(
            reviewedReserves.reduce((sum, p) => sum + p.overallRating, 0) / reviewedReserves.length
          );
          setReserveProgressHistory(prev => [
            ...prev.slice(-19),
            { date: currentDate.toISOString(), overall: avgOvrRes },
          ]);
        }
      }
    }

    const aiTrainingUpdate = AiWeeklyTrainingService.processWeeklyTraining(
      finalPlayers,
      finalClubs,
      coaches,
      userTeamId,
      currentDate,
      simulation.updatedFixtures,
      sessionSeed,
      staffMembers
    );
    finalPlayers = aiTrainingUpdate.updatedPlayers;
    finalClubs = aiTrainingUpdate.updatedClubs;

    const userSquadBeforeTrainingInjuries = userTeamId ? (finalPlayers[userTeamId] || []) : [];

    finalPlayers = TrainingService.processWeeklyTrainingInjuries(
      finalPlayers,
      currentDate,
      simulation.updatedFixtures,
      fitnessCoachQuality,
      userTeamId ?? undefined
    );

    if (userTeamId && userSquadBeforeTrainingInjuries.length > 0) {
      const beforeById = new Map(userSquadBeforeTrainingInjuries.map(player => [player.id, player]));
      const trainingInjuryMails = (finalPlayers[userTeamId] || [])
        .filter(player => {
          const before = beforeById.get(player.id);
          return before?.health.status !== HealthStatus.INJURED && player.health.status === HealthStatus.INJURED;
        })
        .map(player => MailService.generateTrainingInjuryMail(player, currentDate));

      if (trainingInjuryMails.length > 0) {
        setMessages(prev => [...trainingInjuryMails, ...prev]);
      }
    }

    setClubs(finalClubs);

    finalPlayers = Object.fromEntries(
      Object.entries(finalPlayers).map(([clubId, squad]) => [
        clubId,
        PlayerMoraleService.processPeriodicReview(squad, currentDate),
      ])
    );

    if (userTeamId) {
      const userClub = finalClubs.find(c => c.id === userTeamId);
      const userSquad = finalPlayers[userTeamId] || [];
      if (userClub && userSquad.length > 0) {
        const demandResult = PlayerMoraleService.processPlayerDemands(userClub, userSquad, currentDate, messages);
        finalPlayers = {
          ...finalPlayers,
          [userTeamId]: demandResult.players,
        };
        if (demandResult.mails.length > 0) {
          prependUniqueMessages(demandResult.mails);
        }
      }
    }

    setPlayers(prev => {
      return { ...prev, ...finalPlayers };
    });
    
     const refinedLineups = { ...lineups };
    if (simulation.updatedLineups && Object.keys(simulation.updatedLineups).length > 0) {
      Object.assign(refinedLineups, simulation.updatedLineups);
    }
    Object.keys(refinedLineups).forEach(clubId => {
      const squad = finalPlayers[clubId];
      if (squad) {
        if (clubId === userTeamId) {
          refinedLineups[clubId] = LineupService.evictSuspendedPlayers(refinedLineups[clubId], squad);
        } else {
          refinedLineups[clubId] = LineupService.repairLineup(refinedLineups[clubId], squad);
        }
      }
    });
    setLineups(refinedLineups);
    
    if (simulation.roundResults) {
      addRoundResults(simulation.roundResults);
    }

    setLeagueSchedules(prevSchedules => {
      const updatedSchedules: Record<number, LeagueSchedule> = { ...prevSchedules };
      Object.keys(updatedSchedules).forEach(tier => {
        const t = parseInt(tier);
        const sched = updatedSchedules[t];
        if (sched) {
          updatedSchedules[t] = {
            ...sched,
            matchdays: sched.matchdays.map(md => ({
              ...md,
              fixtures: md.fixtures.map(f => {
                const updated = simulation.updatedFixtures.find(uf => uf.id === f.id);
                return updated || f;
              })
            }))
          };
        }
      });
      return updatedSchedules;
    });
    setGlobalFixtures(prev => prev.map(f => {
      const updated = simulation.updatedFixtures.find(uf => uf.id === f.id);
      if (!updated) return f;
      if (f.status === MatchStatus.FINISHED && updated.status === MatchStatus.SCHEDULED) return f;
      return updated;
    }));
  }, [addRoundResults, userTeamId, activeTrainingId, lastMatchSummary, lineups, coaches, currentDate, sessionSeed]);

  const processBackgroundCupMatches = useCallback(() => {
    // Added sessionSeed as the 7th argument
    const result = BackgroundMatchProcessorPolishCup.processCupEvent(currentDate, userTeamId, allFixtures, clubs, players, lineups, sessionSeed, seasonNumber);
    
    setGlobalFixtures(prev => prev.map(f => result.updatedFixtures.find(uf => uf.id === f.id) || f));
    setPlayers(result.updatedPlayers);
    setLineups(result.updatedLineups);
    setClubs(result.updatedClubs);
  }, [currentDate, userTeamId, allFixtures, clubs, players, lineups, sessionSeed]);

  const processCLMatchDay = useCallback(() => {
    // null zamiast userTeamId — gracz kliknął "Symuluj", więc symulujemy WSZYSTKIE mecze
    // łącznie z drużyną gracza (brak trybu live dla CL)
    const clResult = BackgroundMatchProcessorCL.processChampionsLeagueEvent(
      currentDate, null, allFixtures, clubs, players, lineups, seasonNumber, sessionSeed, coaches
    );
    setGlobalFixtures(prev => {
      const clMap = new Map(clResult.updatedFixtures.map(f => [f.id, f]));
      return prev.map(f => {
        const clF = clMap.get(f.id);
        if (clF && (
          clF.status !== f.status ||
          clF.homeScore !== f.homeScore ||
          clF.awayScore !== f.awayScore ||
          clF.homePenaltyScore !== f.homePenaltyScore ||
          clF.awayPenaltyScore !== f.awayPenaltyScore
        )) {
          return clF;
        }
        return f;
      });
    });
    setPlayers(prev => ({ ...prev, ...clResult.updatedPlayers }));
    clResult.matchHistoryEntries.forEach(entry => MatchHistoryService.logMatch(entry));
  }, [currentDate, userTeamId, allFixtures, clubs, players, lineups, seasonNumber, sessionSeed]);

    const processNegotiationResponses = (simDate: Date) => {
    const today = new Date(simDate).setHours(0,0,0,0);
    const finished = pendingNegotiations.filter(n => new Date(n.responseDate).setHours(0,0,0,0) <= today);
    
    if (finished.length === 0) return;

    finished.forEach(neg => {
      const player = Object.values(players).flat().find(p => p.id === neg.playerId);
      const userClub = clubs.find(c => c.id === userTeamId);
      
      if (!player || !userClub) return;

      const decision = FinanceService.evaluateContractLogic(
        player, neg.salary, neg.bonus, 
        new Date(simDate.getFullYear() + neg.years, 5, 30).toISOString(), 
        simDate, userClub.reputation, FinanceService.getClubTier(userClub)
      );

      const mail: MailMessage = {
        id: `MAIL_NEG_${neg.id}`,
        sender: `Agent gracza ${player.lastName}`,
        role: 'Agencja Menadżerska',
        subject: decision.accepted ? 'Decyzja w sprawie kontraktu: ZGODA' : 'Decyzja w sprawie kontraktu: ODMOWA',
        body: `${decision.reason}${decision.demands ? `\n\nOczekiwana pensja roczna: ${decision.demands.salary.toLocaleString('pl-PL')} PLN\nOczekiwany bonus za podpis: ${decision.demands.bonus.toLocaleString('pl-PL')} PLN` : ''}`,
        date: new Date(simDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 95,
        metadata: {
          type: 'CONTRACT_OFFER',
          negotiationId: neg.id,
          accepted: decision.accepted,
          acceptanceExpiryDate: decision.accepted ? (() => { const d = new Date(simDate); d.setDate(d.getDate() + 4); return d.toISOString(); })() : undefined,
          salary: neg.salary,
          years: neg.years,
          bonus: neg.bonus,
          goalBonus: neg.goalBonus,
          assistBonus: neg.assistBonus,
          cleanSheetBonus: neg.cleanSheetBonus,
           responseDate: neg.responseDate,
          status: decision.accepted ? NegotiationStatus.ACCEPTED : NegotiationStatus.REJECTED,
          isAiOffer: false,
          playerId: player.id,
          demands: decision.demands
        }
      };

 setMessages(prev => [mail, ...prev]);

    // JEŚLI OFERTA ZOSTAŁA ODRZUCONA (metadata.accepted jest false) I JEST TO WOLNY AGENT
      if (!decision.accepted && player.clubId === 'FREE_AGENTS') {
        const lockoutDate = new Date(simDate);
        lockoutDate.setMonth(lockoutDate.getMonth() + 3);
        
        setPlayers(prevPlayers => {
          const updated = { ...prevPlayers };
          updated['FREE_AGENTS'] = (updated['FREE_AGENTS'] || []).map(p => 
            p.id === player.id ? {
              ...p,
              freeAgentLockoutUntil: null,
              isNegotiationPermanentBlocked: false,
              freeAgentClubLockouts: FreeAgentNegotiationService.buildClubLockouts(
                p.freeAgentClubLockouts,
                neg.clubId,
                lockoutDate.toISOString()
              )
            } : p
          );
          return updated;
        });
      }
    });

    setPendingNegotiations(prev => prev.filter(n => !finished.find(f => f.id === n.id)));
  };

  const processExpiredAcceptances = (simDate: Date) => {
    const today = new Date(simDate).setHours(0,0,0,0);
    const expired = messages.filter(m =>
      m.metadata?.type === 'CONTRACT_OFFER' &&
      m.metadata?.accepted === true &&
      m.metadata?.acceptanceExpiryDate &&
      new Date(m.metadata.acceptanceExpiryDate).setHours(0,0,0,0) <= today
    );

    if (expired.length === 0) return;

    expired.forEach(mail => {
      const { playerId } = mail.metadata as { playerId: string };
      const player = (players['FREE_AGENTS'] || []).find(p => p.id === playerId);

      if (!player) return;

      const lockoutDate = new Date(simDate);
      lockoutDate.setMonth(lockoutDate.getMonth() + 3);

      setPlayers(prevPlayers => {
        const updated = { ...prevPlayers };
        updated['FREE_AGENTS'] = (updated['FREE_AGENTS'] || []).map(p =>
          p.id === playerId ? {
            ...p,
            freeAgentClubLockouts: FreeAgentNegotiationService.buildClubLockouts(
              p.freeAgentClubLockouts,
              userTeamId!,
              lockoutDate.toISOString()
            )
          } : p
        );
        return updated;
      });

      const withdrawalMail: MailMessage = {
        id: `MAIL_EXPIRED_${mail.id}`,
        sender: `Agent gracza ${player.lastName}`,
        role: 'Agencja Menadżerska',
        subject: `Wycofanie zgody na transfer: ${player.lastName}`,
        body: `Zawodnik ${player.firstName} ${player.lastName} wycofał swoją zgodę. Brak odpowiedzi z Państwa strony w ciągu 4 dni został potraktowany jako brak poważnego zainteresowania. Dalsze rozmowy są niemożliwe przez 3 miesiące.`,
        date: new Date(simDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 90,
        metadata: undefined
      };

      setMessages(prev => [withdrawalMail, ...prev.filter(m2 => m2.id !== mail.id)]);
    });
  };

  // ── SPARINGI — propozycje i odpowiedzi ──────────────────────────────────────

  const addFriendlyRequest = useCallback((req: Omit<PendingFriendlyRequest, 'id'>) => {
    const id = `FRIENDLY_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setPendingFriendlyRequests(prev => [...prev, { ...req, id }]);
  }, []);

  const cancelFriendly = useCallback((fixtureId: string) => {
    setGlobalFixtures(prev => prev.filter(f => f.id !== fixtureId));
  }, []);

  const processFriendlyRequests = (simDate: Date) => {
    const todayMs = new Date(simDate).setHours(0, 0, 0, 0);
    const due = pendingFriendlyRequests.filter(r =>
      new Date(r.responseDate).setHours(0, 0, 0, 0) <= todayMs
    );
    if (due.length === 0) return;

    const venueLabelMap: Record<string, string> = {
      HOME: 'u siebie', AWAY: 'na wyjeździe', NEUTRAL: 'na terenie neutralnym',
    };

    due.forEach(req => {
      const opponent = clubs.find(c => c.id === req.opponentClubId);
      if (!opponent) return;

      const [fy, fm, fd] = req.proposedDate.split('-').map(Number);
      const matchDateStr = new Date(fy, fm - 1, fd).toLocaleDateString('pl-PL', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });

      // ── Sprawdź czy rywal ma już zaplanowany sparing AI w tym dniu ──────────
      const matchDay = new Date(fy, fm - 1, fd); matchDay.setHours(0, 0, 0, 0);
      const aiPairConflict = aiFriendlyPairs.some(p => {
        if (p.homeTeamId !== req.opponentClubId && p.awayTeamId !== req.opponentClubId) return false;
        const pDate = p.date instanceof Date ? p.date : new Date(p.date);
        pDate.setHours(0, 0, 0, 0);
        return pDate.getTime() === matchDay.getTime();
      });
      if (aiPairConflict) {
        setMessages(prev => [{
          id: `MAIL_FRIENDLY_AI_CONFLICT_${req.id}`,
          sender: opponent.name,
          role: 'Koordynator Rozgrywek',
          subject: `❌ Sparing odrzucony — ${opponent.name}`,
          body: `Drużyna ${opponent.name} niestety nie może rozegrać sparingu w zaproponowanym terminie.\n\nData sparingu: ${matchDateStr}\n\nPowód: Klub ma już zaplanowany mecz sparingowy w tym dniu.\n\nProponujemy wybranie innej daty lub innego rywala.`,
          date: new Date(simDate),
          isRead: false,
          type: MailType.SYSTEM,
          priority: 80,
        }, ...prev]);
        setPendingFriendlyRequests(prev => prev.filter(r => r.id !== req.id));
        return;
      }

      // ── Sprawdź konflikt kalendarza rywala (okno ±2 dni od daty sparingu) ──
      const rangeStart = new Date(matchDay); rangeStart.setDate(rangeStart.getDate() - 2);
      const rangeEnd   = new Date(matchDay); rangeEnd.setDate(rangeEnd.getDate() + 2);
      const allFix = Object.values(leagueSchedules)
        .flatMap(s => s.matchdays.flatMap(m => m.fixtures))
        .concat(globalFixtures);
      const conflict = allFix.find(f => {
        if (f.homeTeamId !== req.opponentClubId && f.awayTeamId !== req.opponentClubId) return false;
        if (f.leagueId === CompetitionType.FRIENDLY) return false; // inne sparingi nie blokują
        const fDay = new Date(f.date); fDay.setHours(0, 0, 0, 0);
        return fDay >= rangeStart && fDay <= rangeEnd;
      });

      if (conflict) {
        const conflictDateStr = new Date(conflict.date).toLocaleDateString('pl-PL', {
          weekday: 'long', day: 'numeric', month: 'long',
        });
        setMessages(prev => [{
          id: `MAIL_FRIENDLY_CONFLICT_${req.id}`,
          sender: opponent.name,
          role: 'Koordynator Rozgrywek',
          subject: `❌ Sparing odwołany — ${opponent.name}`,
          body: `Niestety drużyna ${opponent.name} musi odwołać sparing w zaproponowanym terminie.\n\nData sparingu: ${matchDateStr}\n\nPowód: ${opponent.name} rozgrywa mecz ${conflictDateStr}, co koliduje z terminem sparingu (wymagany bufor 2 dni).\n\nProponujemy wybranie innej daty lub innego rywala.`,
          date: new Date(simDate),
          isRead: false,
          type: MailType.SYSTEM,
          priority: 80,
        }, ...prev]);
        return;
      }

      const roll = Math.random() * 100;
      const accepted = roll < req.chance;

      if (accepted) {
        const matchDate = new Date(fy, fm - 1, fd, 15, 0);
        const isNeutral = req.venue === 'NEUTRAL';
        const homeTeamId = req.venue === 'AWAY' ? req.opponentClubId : (userTeamId ?? '');
        const awayTeamId = req.venue === 'AWAY' ? (userTeamId ?? '') : req.opponentClubId;
        const fixture: Fixture = {
          id: `FRIENDLY_${req.id}`,
          leagueId: CompetitionType.FRIENDLY,
          homeTeamId,
          awayTeamId,
          date: matchDate,
          status: MatchStatus.SCHEDULED,
          homeScore: null,
          awayScore: null,
          neutralVenue: isNeutral || undefined,
        };
        setGlobalFixtures(prev => [...prev, fixture]);

        setMessages(prev => [{
          id: `MAIL_FRIENDLY_OK_${req.id}`,
          sender: opponent.name,
          role: 'Koordynator Rozgrywek',
          subject: `✅ Sparing zaakceptowany — ${opponent.name}`,
          body: `Drużyna ${opponent.name} zaakceptowała Waszą propozycję sparingu.\n\nData: ${matchDateStr}\nMiejsce: ${venueLabelMap[req.venue]}\n\nMecz został automatycznie dodany do kalendarza.`,
          date: new Date(simDate),
          isRead: false,
          type: MailType.SYSTEM,
          priority: 80,
        }, ...prev]);
      } else {
        setMessages(prev => [{
          id: `MAIL_FRIENDLY_NO_${req.id}`,
          sender: opponent.name,
          role: 'Koordynator Rozgrywek',
          subject: `❌ Sparing odrzucony — ${opponent.name}`,
          body: `Drużyna ${opponent.name} odrzuciła Waszą propozycję sparingu ${venueLabelMap[req.venue]}.\n\nData: ${matchDateStr}\n\nKlub nie mógł dopasować terminu lub nie wyraził zainteresowania. Możecie spróbować z innym terminem lub wybrać inną drużynę.`,
          date: new Date(simDate),
          isRead: false,
          type: MailType.SYSTEM,
          priority: 80,
        }, ...prev]);
      }
    });

    setPendingFriendlyRequests(prev => prev.filter(r => !due.find(d => d.id === r.id)));
  };

  // ── AKADEMIA — akcje ────────────────────────────────────────────────────────

  const initAcademy = useCallback(() => {
    if (academy) return;
    const newAcademy: ClubAcademy = {
      level: 1,
      youthPlayers: [],
      lastIntakeYear: 0,
      operationalBudgetWeekly: AcademyService.getDefaultOperationalBudget(1),
      upgradeInProgress: false,
      regionFocus: undefined,
      activeMissions: [],
      promotedHistory: [],
    };
    setAcademy(newAcademy);
    const infoMail: MailMessage = {
      id: `ACADEMY_INIT_${Date.now()}`,
      sender: 'Dyrektor Akademii',
      role: 'Akademia Piłkarska',
      subject: 'Otwarto Akademię Piłkarską Pierwszego Stopnia.',
      body: 'Gratulacje! Akademia Piłkarska Pierwszego Stopnia jest gotowa. Co roku przyjmiemy nowych wychowanków. Proszę monitorować ich rozwój i zlecić skautom ocenę talentów i awansować najlepszych do rezerw lub pierwszego składu.',
      date: new Date(currentDate),
      isRead: false,
      type: MailType.BOARD,
      priority: 80,
    };
    setMessages(prev => [infoMail, ...prev]);
  }, [academy, currentDate]);

  const submitUpgradeProposal = useCallback(() => {
    if (!academy || academy.level >= 5) return;
    if (academy.upgradeInProgress) return;
    if (academy.upgradeProposalStatus === 'PENDING') return;
    if (academy.upgradeProposalStatus === 'APPROVED') return;
    if (academy.upgradeProposalRejectedUntil) {
      const rejectedUntil = new Date(academy.upgradeProposalRejectedUntil);
      if (new Date(currentDate) < rejectedUntil) return;
    }
    const decisionDate = AcademyService.getProposalDecisionDate(academy.level, currentDate);
    setAcademy(prev => prev ? {
      ...prev,
      upgradeProposalStatus: 'PENDING',
      upgradeProposalDate: new Date(currentDate).toISOString().split('T')[0],
      upgradeProposalDecisionDate: decisionDate,
    } : prev);
    const userClub = clubs.find(c => c.id === userTeamId);
    const cost = AcademyService.getUpgradeCostForClub(academy.level, userClub?.reputation ?? 5);
    const proposalMail: MailMessage = {
      id: `ACAD_PROPOSAL_${Date.now()}`,
      sender: 'Dyrektor Akademii',
      role: 'Akademia Piłkarska',
      subject: `Propozycja rozbudowy Akademii (Poziom ${academy.level} → ${academy.level + 1})`,
      body: `Złożono formalny wniosek do właściciela klubu o zgodę na rozbudowę Akademii do Poziomu ${academy.level + 1}. Szacowany koszt: ${cost?.toLocaleString('pl-PL') ?? '—'} PLN. Zarząd zapozna się z sytuacją finansową i sportową klubu i wyda decyzję do dnia ${decisionDate}.`,
      date: new Date(currentDate),
      isRead: false,
      type: MailType.BOARD,
      priority: 70,
    };
    setMessages(prev => [proposalMail, ...prev]);
  }, [academy, currentDate, clubs, userTeamId]);

  const startAcademyUpgrade = useCallback(() => {
    if (!academy || academy.upgradeInProgress || academy.level >= 5) return;
    if (academy.upgradeProposalStatus !== 'APPROVED') return;
    const userClub = clubs.find(c => c.id === userTeamId);
    const cost = AcademyService.getUpgradeCostForClub(academy.level, userClub?.reputation ?? 5);
    const days = AcademyService.getUpgradeDays(academy.level);
    if (!cost || !days || !userTeamId) return;
    if (!userClub || userClub.budget < cost) return;
    const completionDate = new Date(currentDate);
    completionDate.setDate(completionDate.getDate() + days);
    setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, budget: c.budget - cost } : c));
    addFinanceLog(userTeamId, `Modernizacja Akademii (Poziom ${academy.level} → ${academy.level + 1})`, -cost, currentDate);
    setAcademy(prev => prev ? {
      ...prev,
      upgradeInProgress: true,
      upgradeCompletionDate: completionDate.toISOString().split('T')[0],
      upgradeProposalStatus: undefined,
      upgradeProposalDate: undefined,
      upgradeProposalDecisionDate: undefined,
    } : prev);
  }, [academy, clubs, userTeamId, currentDate, addFinanceLog]);

  const promoteYouthPlayer = useCallback((youthId: string, target: 'RESERVES' | 'FIRST_TEAM') => {
    if (!academy || !userTeamId) return;
    const youth = academy.youthPlayers.find(yp => yp.id === youthId);
    if (!youth) return;
    const club = clubs.find(c => c.id === userTeamId);
    const promoted = AcademyService.promoteToPlayer(
      youth,
      userTeamId,
      currentDate,
      club?.reputation ?? 5,
      club?.tier ?? 1,
      club?.country
    );
    const overallKeys: (keyof import('../types').PlayerAttributes)[] = [
      'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking',
      'finishing', 'technique', 'vision', 'dribbling', 'heading', 'positioning',
      'goalkeeping', 'freeKicks', 'penalties', 'aggression', 'crossing', 'leadership', 'mentality', 'workRate',
    ];
    const overallRating = Math.round(
      overallKeys.reduce((s, k) => s + youth.attributes[k], 0) / overallKeys.length
    );
    if (target === 'RESERVES') {
      setReserves(prev => [...prev, promoted]);
    } else {
      setPlayers(prev => ({ ...prev, [userTeamId]: [...(prev[userTeamId] ?? []), promoted] }));
    }
    setAcademy(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        youthPlayers: prev.youthPlayers.filter(yp => yp.id !== youthId),
        promotedHistory: [
          {
            id: promoted.id,
            firstName: youth.firstName,
            lastName: youth.lastName,
            position: youth.position,
            promotedYear: currentDate.getFullYear(),
            promotedTo: target,
            overallAtPromotion: overallRating,
          },
          ...prev.promotedHistory,
        ].slice(0, 30),
      };
    });
    const infoMail: MailMessage = {
      id: `ACAD_PROMOTED_${Date.now()}`,
      sender: 'Dyrektor Akademii',
      role: 'Akademia Piłkarska',
      subject: `Awans wychowanka: ${youth.firstName} ${youth.lastName}`,
      body: `${youth.firstName} ${youth.lastName} (${youth.age} l.) awansował do ${target === 'RESERVES' ? 'rezerw' : 'pierwszego składu'}. Ogólna ocena: ${overallRating}. Życzymy powodzenia!`,
      date: new Date(currentDate),
      isRead: false,
      type: MailType.STAFF,
      priority: 60,
    };
    setMessages(prev => [infoMail, ...prev]);
  }, [academy, userTeamId, currentDate]);

  const dismissYouthPlayer = useCallback((youthId: string) => {
    if (!academy) return;
    setAcademy(prev => prev ? {
      ...prev,
      youthPlayers: prev.youthPlayers.filter(yp => yp.id !== youthId),
    } : prev);
  }, [academy]);

  const signYouthPlayerContract = useCallback((youthId: string) => {
    setAcademy(prev => prev ? {
      ...prev,
      youthPlayers: prev.youthPlayers.map(yp =>
        yp.id === youthId ? { ...yp, contractSigned: true } : yp
      ),
    } : prev);
  }, []);

  const setYouthFocus = useCallback((youthId: string, attr: keyof import('../types').PlayerAttributes | null) => {
    if (!academy) return;
    setAcademy(prev => prev ? {
      ...prev,
      youthPlayers: prev.youthPlayers.map(yp =>
        yp.id === youthId ? { ...yp, developmentFocus: attr ?? undefined } : yp
      ),
    } : prev);
  }, [academy]);

  const startScoutMission = useCallback((targetYouthPlayerId?: string, regionFocus?: Region, positionFilter?: import('../types').PlayerPosition, ageMin?: number, ageMax?: number, scoutId?: string): boolean => {
    if (!academy || !userTeamId) return false;
    const mission = AcademyService.buildScoutMission(
      targetYouthPlayerId,
      regionFocus ?? academy.regionFocus,
      academy.level,
      currentDate,
      positionFilter,
      ageMin,
      ageMax,
    );
    if (scoutId) mission.scoutId = scoutId;
    const userClub = clubs.find(c => c.id === userTeamId);
    if (!userClub || userClub.budget < mission.cost) return false;
    setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, budget: c.budget - mission.cost } : c));
    addFinanceLog(userTeamId, 'Misja skautingowa akademii', -mission.cost, currentDate);
    setAcademy(prev => prev ? { ...prev, activeMissions: [...prev.activeMissions, mission] } : prev);
    if (scoutId) setScoutPool(prev => prev.map(s => s.id === scoutId ? { ...s, isOnMission: true } : s));
    return true;
  }, [academy, userTeamId, clubs, currentDate, addFinanceLog]);

  const setAcademyRegionFocus = useCallback((region: Region | undefined) => {
    setAcademy(prev => prev ? { ...prev, regionFocus: region } : prev);
  }, []);

  const setAcademyOperationalBudget = useCallback((amount: number) => {
    setAcademy(prev => prev ? { ...prev, operationalBudgetWeekly: Math.max(0, amount) } : prev);
  }, []);

  const employedScouts = scoutPool.filter(s => s.employedByClubId === userTeamId);

  const refreshScoutMarket = useCallback(() => {
    if (!userTeamId) return;
    const userClub = clubs.find(c => c.id === userTeamId);
    if (!userClub) return;

    const today = new Date(currentDate).toISOString().split('T')[0];
    let currentCount = scoutMarketManualRefreshCount;
    let periodStart = scoutMarketPeriodStart;

    if (!periodStart) {
      periodStart = today;
      currentCount = 0;
      setScoutMarketPeriodStart(today);
      setScoutMarketManualRefreshCount(0);
    } else {
      const daysSince = Math.floor((new Date(today).getTime() - new Date(periodStart).getTime()) / 86400000);
      if (daysSince >= 90) {
        periodStart = today;
        currentCount = 0;
        setScoutMarketPeriodStart(today);
        setScoutMarketManualRefreshCount(0);
      }
    }

    if (currentCount >= 3) {
      const resetDate = new Date(periodStart);
      resetDate.setDate(resetDate.getDate() + 90);
      showGameNotification({
        title: 'Limit odświeżeń',
        message: `Wykorzystano 3/3 odświeżeń w tym kwartale. Kolejne odświeżenie dostępne od ${resetDate.toISOString().split('T')[0]}.`,
        tone: 'warning'
      });
      return;
    }

    const market = ScoutService.generateMarket(scoutPool, userClub.reputation ?? 5, userClub.board?.kompetencja);
    setScoutMarket(market);
    setScoutMarketRefreshDate(today);
    setScoutMarketManualRefreshCount(currentCount + 1);
  }, [scoutPool, userTeamId, clubs, currentDate, scoutMarketManualRefreshCount, scoutMarketPeriodStart, showGameNotification]);

  const hireScout = useCallback((scoutId: string): boolean => {
    if (!academy || !userTeamId) return false;
    const maxScouts = ScoutService.getMaxScouts(academy.level);
    const currentEmployed = scoutPool.filter(s => s.employedByClubId === userTeamId).length;
    if (currentEmployed >= maxScouts) return false;
    const scout = scoutPool.find(s => s.id === scoutId);
    if (!scout || scout.employedByClubId) return false;
    const hiringFee = scout.weeklySalary * 4;
    const userClub = clubs.find(c => c.id === userTeamId);
    if (!userClub || userClub.budget < hiringFee) return false;
    setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, budget: c.budget - hiringFee } : c));
    addFinanceLog(userTeamId, `Zatrudnienie skauta: ${scout.firstName} ${scout.lastName}`, -hiringFee, currentDate);
    setScoutPool(prev => prev.map(s => s.id === scoutId ? { ...s, employedByClubId: userTeamId } : s));
    setScoutMarket(prev => prev.filter(s => s.id !== scoutId));
    return true;
  }, [academy, userTeamId, scoutPool, clubs, currentDate, addFinanceLog]);

  const fireScout = useCallback((scoutId: string) => {
    if (!userTeamId) return;
    setScoutPool(prev => prev.map(s => s.id === scoutId ? { ...s, employedByClubId: undefined, isOnMission: false } : s));
    setAcademy(prev => prev ? { ...prev, activeMissions: prev.activeMissions.filter(m => m.scoutId !== scoutId) } : prev);
  }, [userTeamId]);

  // ── END AKADEMIA ────────────────────────────────────────────────────────────

  const fireStaffMember = useCallback((staffId: string): { success: boolean; message: string; cost?: number } => {
    if (!userTeamId) return { success: false, message: 'Brak drużyny' };
    const member = staffMembers[staffId];
    if (!member) return { success: false, message: 'Nie znaleziono pracownika' };
    const userClub = clubs.find(c => c.id === userTeamId);
    if (!userClub) return { success: false, message: 'Brak drużyny' };
    const attrValues = Object.values(member.attributes);
    const staffAvg = attrValues.length > 0 ? attrValues.reduce((a, b) => a + b, 0) / attrValues.length : 0;
    const rep = userClub.reputation;
    const blockThreshold = rep <= 3 ? 8 : rep <= 6 ? 11 : rep <= 9 ? 14 : rep <= 14 ? 17 : 19;
    if (staffAvg >= blockThreshold) {
      return { success: false, message: 'Zarząd zablokował zwolnienie — pracownik jest zbyt wartościowy dla poziomu klubu.' };
    }
    const severance = Math.round((member.salary / 12) * 3);
    if (userClub.budget < severance) {
      return { success: false, message: `Brak funduszy na odprawę (${severance.toLocaleString('pl-PL')} PLN).` };
    }
    setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, budget: c.budget - severance, staffIds: (c.staffIds ?? []).filter(id => id !== staffId) } : c));
    setStaffMembers(prev => ({ ...prev, [staffId]: { ...prev[staffId], currentClubId: null } }));
    addFinanceLog(userTeamId, `Odprawa: ${member.firstName} ${member.lastName}`, -severance, currentDate);
    return { success: true, message: `Pracownik zwolniony. Odprawa: ${severance.toLocaleString('pl-PL')} PLN.`, cost: severance };
  }, [userTeamId, staffMembers, clubs, currentDate, addFinanceLog]);

  const extendStaffContract = useCallback((staffId: string, years: number): void => {
    setStaffMembers(prev => {
      const member = prev[staffId];
      if (!member) return prev;
      const d = new Date(member.contractEndDate);
      d.setFullYear(d.getFullYear() + years);
      return { ...prev, [staffId]: { ...member, contractEndDate: d.toISOString() } };
    });
  }, []);

  const negotiateStaffContract = useCallback((staffId: string, newSalary: number, years: number): void => {
    const negotiationDate = currentDate instanceof Date ? currentDate.toISOString() : new Date(currentDate).toISOString();
    setStaffMembers(prev => {
      const member = prev[staffId];
      if (!member) return prev;
      const d = new Date(member.contractEndDate);
      d.setFullYear(d.getFullYear() + years);
      return { ...prev, [staffId]: { ...member, salary: newSalary, contractEndDate: d.toISOString(), lastNegotiationDate: negotiationDate } };
    });
  }, [currentDate]);

  const hireStaffMember = useCallback((staffId: string, salary: number, years: number, kaucja: number): { success: boolean; message: string } => {
    if (!userTeamId) return { success: false, message: 'Brak drużyny.' };
    const userClub = clubs.find(c => c.id === userTeamId);
    if (!userClub) return { success: false, message: 'Nie znaleziono klubu.' };
    if (userClub.budget < kaucja) return { success: false, message: `Brak środków na kaucję (${kaucja.toLocaleString('pl-PL')} PLN).` };
    const member = staffMembers[staffId];
    if (!member) return { success: false, message: 'Nie znaleziono pracownika.' };
    const now = currentDate instanceof Date ? currentDate : new Date(currentDate);
    const contractEnd = new Date(now);
    contractEnd.setFullYear(contractEnd.getFullYear() + years);
    const prevClubId = member.currentClubId;
    const prevClub = prevClubId ? clubs.find(c => c.id === prevClubId) : null;
    const historyEntry = { clubId: userTeamId, clubName: userClub.name, fromYear: now.getFullYear(), fromMonth: now.getMonth() + 1, toYear: null, toMonth: null };

    // Szukanie zastępcy dla starego klubu — wolni agenci tej samej roli
    let replacementId: string | null = null;
    let replacementUpdate: Record<string, typeof member> = {};
    if (prevClubId && prevClub) {
      const candidates = Object.values(staffMembers).filter(s =>
        s.currentClubId === null && s.role === member.role && s.id !== staffId
      );
      if (candidates.length > 0) {
        // Wybierz spośród top-5 wg doświadczenia
        const sorted = [...candidates].sort((a, b) => (b.attributes['experience'] ?? 0) - (a.attributes['experience'] ?? 0));
        const pick = sorted[Math.floor(Math.random() * Math.min(5, sorted.length))];
        replacementId = pick.id;
        const repYears = 1 + Math.floor(Math.random() * 2);
        const repEnd = new Date(now);
        repEnd.setFullYear(repEnd.getFullYear() + repYears);
        const attrVals = Object.values(pick.attributes);
        const avg = attrVals.length > 0 ? attrVals.reduce((a, b) => a + b, 0) / attrVals.length : 8;
        const repSalary = Math.round((20_000 + (avg / 20) * 180_000) / 10_000) * 10_000;
        const repHistory = { clubId: prevClubId, clubName: prevClub.name, fromYear: now.getFullYear(), fromMonth: now.getMonth() + 1, toYear: null, toMonth: null };
        replacementUpdate[pick.id] = { ...pick, currentClubId: prevClubId, salary: repSalary, contractEndDate: repEnd.toISOString(), history: [...(pick.history ?? []), repHistory] };
      }
    }

    setStaffMembers(prev => ({
      ...prev,
      [staffId]: { ...prev[staffId], currentClubId: userTeamId, salary, contractEndDate: contractEnd.toISOString(), history: [...(prev[staffId].history ?? []), historyEntry] },
      ...replacementUpdate,
    }));
    setClubs(prev => prev.map(c => {
      if (c.id === userTeamId) return { ...c, budget: c.budget - kaucja, staffIds: [...(c.staffIds ?? []), staffId] };
      if (prevClubId && c.id === prevClubId) {
        const filtered = (c.staffIds ?? []).filter(id => id !== staffId);
        return { ...c, staffIds: replacementId ? [...filtered, replacementId] : filtered };
      }
      return c;
    }));
    if (kaucja > 0) addFinanceLog(userTeamId, `Kaucja transferowa: ${member.firstName} ${member.lastName}`, -kaucja, currentDate);
    return { success: true, message: `${member.firstName} ${member.lastName} dołączył do sztabu.` };
  }, [userTeamId, clubs, staffMembers, currentDate, addFinanceLog]);

  const applyWeeklyMotivation = useCallback((moraleDelta: number) => {
    if (!userTeamId) return;
    setClubs(prev => prev.map(c => {
      if (c.id !== userTeamId) return c;
      const newMorale = Math.max(5, Math.min(95, (c.morale ?? 50) + moraleDelta));
      const todayIso = currentDate.toISOString().split('T')[0];
      return {
        ...c,
        morale: newMorale,
        lastMotivationDate: todayIso,
        motivationMonitoringStartDate: todayIso,
        motivationNeglectLevel: 0,
      };
    }));
  }, [userTeamId, currentDate]);

  const conductIndividualTalk = useCallback((playerId: string, talkType: IndividualTalkType): IndividualTalkResult | null => {
    if (!userTeamId) return null;

    const todayIso = currentDate.toISOString().split('T')[0];
    const seed = (sessionSeed ?? 1) + currentDate.getTime();
    const promiseDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 21).toISOString().split('T')[0];
    const firstTeamPlayer = (players[userTeamId] || []).find(p => p.id === playerId);
    const reservePlayer = reserves.find(p => p.id === playerId);
    const target = firstTeamPlayer ?? reservePlayer;

    if (!target) return null;

    const withMorale = PlayerMoraleService.ensurePlayerState(target);
    if (!PlayerMoraleService.canTalk(withMorale, currentDate)) return null;

    const result = PlayerMoraleService.calculateTalkResult(withMorale, talkType, currentDate, seed);
    const withTalkHistory = PlayerMoraleService.withMoraleChange(
      withMorale,
      result.newMorale - (withMorale.morale ?? 50),
      result.isPositive ? 'Indywidualna rozmowa z trenerem' : 'Nieudana rozmowa z trenerem',
      currentDate
    );
    const updatedPlayer: Player = {
      ...withTalkHistory,
      lastIndividualTalkDate: todayIso,
      promisedMinutesUntil: talkType === 'PROMISE_MINUTES'
        ? promiseDate
        : withTalkHistory.promisedMinutesUntil ?? null,
      promisedMinutesBaseline: talkType === 'PROMISE_MINUTES'
        ? PlayerMoraleService.getTotalMinutesPlayed(withTalkHistory)
        : withTalkHistory.promisedMinutesBaseline ?? null,
    };

    if (firstTeamPlayer) {
      setPlayers(prev => ({
        ...prev,
        [userTeamId]: (prev[userTeamId] || []).map(p => p.id === playerId ? updatedPlayer : p),
      }));
    } else {
      setReserves(prev => prev.map(p => p.id === playerId ? updatedPlayer : p));
    }

    return result;
  }, [currentDate, players, reserves, sessionSeed, userTeamId]);

  const ensureWinterCampInviteState = useCallback((baseDate: Date = currentDate) => {
    if (!userTeamId) return;

    setClubs(prev => prev.map(c => {
      if (c.id !== userTeamId || c.winterCamp) return c;

      const priceSeed = sessionSeed + baseDate.getTime() % 100000;
      return {
        ...c,
        winterCamp: {
          location: null,
          cost: 0,
          program: null,
          intensity: null,
          spaOption: false,
          isDeclined: false,
          locationPrices: generateLocationPrices(priceSeed),
          spaCost: generateSpaCost(priceSeed),
          inviteSent: true,
          programChosen: false,
          effectsApplied: false,
        },
      };
    }));
  }, [currentDate, sessionSeed, userTeamId]);

  const clearWinterCampInvitePending = useCallback(() => setWinterCampInvitePending(false), []);
  const clearWinterCampProgramPending = useCallback(() => setWinterCampProgramPending(false), []);
  const reopenWinterCampInvite = useCallback(() => {
    ensureWinterCampInviteState();
    setWinterCampInvitePending(true);
  }, [ensureWinterCampInviteState]);

  const saveWinterCampLocation = useCallback((location: WinterCampLocation | null, cost: number, spaOption: boolean) => {
    if (!userTeamId) return;
    setClubs(prev => prev.map(c => {
      if (c.id !== userTeamId || !c.winterCamp) return c;
      return { ...c, winterCamp: { ...c.winterCamp, location, cost, spaOption, isDeclined: location === null } };
    }));
    setWinterCampInvitePending(false);
  }, [userTeamId]);

  const saveWinterCampProgram = useCallback((program: WinterCampProgram, intensity: WinterCampIntensity) => {
    if (!userTeamId) return;
    setClubs(prev => prev.map(c => {
      if (c.id !== userTeamId || !c.winterCamp) return c;
      return { ...c, winterCamp: { ...c.winterCamp, program, intensity, programChosen: true } };
    }));
    setWinterCampProgramPending(false);
  }, [userTeamId]);

  const clearSummerCampInvitePending = useCallback(() => setSummerCampInvitePending(false), []);
  const clearSummerCampProgramPending = useCallback(() => setSummerCampProgramPending(false), []);

  const saveSummerCampLocation = useCallback((location: SummerCampLocation | null, cost: number, spaOption: boolean) => {
    if (!userTeamId) return;
    setClubs(prev => prev.map(c => {
      if (c.id !== userTeamId || !c.summerCamp) return c;
      return { ...c, summerCamp: { ...c.summerCamp, location, cost, spaOption, isDeclined: location === null } };
    }));
    setSummerCampInvitePending(false);
  }, [userTeamId]);

  const saveSummerCampProgram = useCallback((program: SummerCampProgram, intensity: SummerCampIntensity) => {
    if (!userTeamId) return;
    setClubs(prev => prev.map(c => {
      if (c.id !== userTeamId || !c.summerCamp) return c;
      return { ...c, summerCamp: { ...c.summerCamp, program, intensity, programChosen: true } };
    }));
    setSummerCampProgramPending(false);
  }, [userTeamId]);

  const advanceDay = useCallback(() => {
    if (viewState === ViewState.CUP_DRAW || viewState === ViewState.CL_DRAW || viewState === ViewState.EL_DRAW || viewState === ViewState.EL_R2Q_DRAW || viewState === ViewState.CONF_DRAW || viewState === ViewState.CONF_R2Q_DRAW || viewState === ViewState.CONF_GROUP_DRAW || viewState === ViewState.CONF_R16_DRAW || viewState === ViewState.CONF_QF_DRAW || viewState === ViewState.CONF_SF_DRAW || viewState === ViewState.PLAYOFF_DRAW) return;

    const dateToProcess = new Date(currentDate);
    // Czy to automatyczny skok (jumpToDate/jumpToNextEvent) — NIE ręczny klik gracza?
    const isAutoJumping = targetJumpTime !== null;

    processNegotiationResponses(dateToProcess);
    processExpiredAcceptances(dateToProcess);
    processFriendlyRequests(dateToProcess);

    let pendingBoardMonitorUpdate: {
      action: 'REDUCE' | 'RESTORE' | 'RESERVE_SUPPORT' | 'NONE';
      newBudget: number;
      newTransferBudget: number;
      newReserveBudget: number;
      newState: 'NORMAL' | 'ALERT' | 'SURPLUS';
      amountChanged: number;
      dateKey: string;
    } | null = null;

// --- BOARD FINANCE MONITOR ---
    if (userTeamId && !isResigned) {
      const currentUserClub = clubs.find(c => c.id === userTeamId);
      if (currentUserClub) {
        const monitorResult = BoardFinanceMonitorService.check(currentUserClub, dateToProcess);
        if (
          monitorResult.action !== 'NONE' ||
          (currentUserClub.boardBudgetMonitorState ?? 'NORMAL') !== monitorResult.newState
        ) {
          pendingBoardMonitorUpdate = {
            action: monitorResult.action,
            newBudget: monitorResult.newBudget,
            newTransferBudget: monitorResult.newTransferBudget,
            newReserveBudget: monitorResult.newReserveBudget,
            newState: monitorResult.newState,
            amountChanged: monitorResult.amountChanged,
            dateKey: dateToProcess.toISOString().split('T')[0],
          };
        }
      }
      setClubs(prev => {
        const userClub = prev.find(c => c.id === userTeamId);
        if (!userClub) return prev;
        const monitorResult = BoardFinanceMonitorService.check(userClub, dateToProcess);
        if (monitorResult.action === 'NONE') {
          if ((userClub.boardBudgetMonitorState ?? 'NORMAL') === monitorResult.newState) return prev;
          return prev.map(c => c.id === userTeamId ? {
            ...c,
            boardBudgetMonitorState: monitorResult.newState,
          } as Club : c);
        }
        const monitorDateKey = dateToProcess.toISOString().split('T')[0];
        const monitorMailKey = `BOARD_BUDGET_${userTeamId}_${monitorResult.action}_${monitorResult.newState}_${monitorDateKey}`;
        const budgetMail: MailMessage = {
          id: monitorMailKey,
          sender: 'Zarząd Klubu',
          role: 'Dyrektor Finansowy',
          subject: monitorResult.mailSubject,
          body: monitorResult.mailBody,
          date: new Date(dateToProcess),
          isRead: false,
          type: MailType.BOARD,
          priority: 95,
        };
        if (!sentMailIdsRef.current.has(monitorMailKey)) {
          sentMailIdsRef.current.add(monitorMailKey);
          setMessages(prev => {
            const withoutDuplicates = prev.filter(message =>
              !(message.subject === budgetMail.subject &&
                message.body === budgetMail.body &&
                new Date(message.date).toISOString().split('T')[0] === monitorDateKey)
            );
            return [budgetMail, ...withoutDuplicates];
          });
        }
        return prev.map(c => c.id === userTeamId ? {
          ...c,
          budget: monitorResult.newBudget,
          transferBudget: monitorResult.newTransferBudget,
          reserveBudget: monitorResult.newReserveBudget,
          boardBudgetMonitorState: monitorResult.newState,
          boardBudgetLastShiftDate: monitorDateKey,
          boardBudgetLastShiftAction: monitorResult.action,
          financeHistory: monitorResult.amountChanged > 0 && !(c.financeHistory || []).some(item => item.id === `BOARD_SHIFT_${monitorDateKey}_${monitorResult.action}`) ? [
            {
              id: `BOARD_SHIFT_${monitorDateKey}_${monitorResult.action}`,
              date: monitorDateKey,
              amount: monitorResult.action === 'RESTORE' ? -monitorResult.amountChanged : monitorResult.amountChanged,
              type: monitorResult.action === 'RESTORE' ? 'EXPENSE' as const : 'INCOME' as const,
              description: monitorResult.action === 'RESTORE'
                ? 'Przesunięcie środków z rezerwy zarządu na budżet transferowy'
                : monitorResult.action === 'RESERVE_SUPPORT'
                  ? 'Awaryjne wsparcie salda z rezerwy zarządu'
                  : 'Awaryjne wsparcie salda z rezerwy zarządu i budżetu transferowego',
              previousBalance: c.budget,
            },
            ...(c.financeHistory || [])
          ].slice(0, 50) : c.financeHistory,
        } as Club : c);
      });
    }

// --- EMERGENCY GK PROTOCOL (STAGE 1 PRO) ---
    if (userTeamId && !isResigned) {
      const userSquad = players[userTeamId] || [];
      const realGks = userSquad.filter(p => p.position === PlayerPosition.GK && !p.id.startsWith('EMERGENCY_GK_'));
      const availableRealGks = realGks.filter(p => p.health.status === HealthStatus.HEALTHY && p.suspensionMatches === 0);
      const emergencyGk = userSquad.find(p => p.id.startsWith('EMERGENCY_GK_'));

      // 1. Wykrycie kryzysu (Brak GK)
      if (availableRealGks.length === 0 && !emergencyGk) {
         const userClub = clubs.find(c => c.id === userTeamId)!;
         const tier = parseInt(userClub.leagueId.split('_')[2] || '4');
         const newJunior = SeasonTransitionService.generateEmergencyGK(userTeamId, tier, userClub.reputation);
         
         setPlayers(prev => ({ ...prev, [userTeamId]: [...(prev[userTeamId] || []), newJunior] }));
         
         // Automatyczne wstawienie do składu, aby odblokować przycisk meczu
         const currentLineup = lineups[userTeamId];
         if (currentLineup) {
           updateLineup(userTeamId, {
             ...currentLineup,
             startingXI: [newJunior.id, ...currentLineup.startingXI.slice(1)]
           });
         }

         const hireMail = MailService.createFromTemplate('staff_emergency_gk_hired', { 'PLAYER': newJunior.lastName });
         setMessages(prev => [hireMail, ...prev]);
      }
      
      // 2. Powrót do normalności (Cleanup)
      // Warunek: Realny GK zdrowy, bez kartek i kondycja >= 90%
      if (emergencyGk && realGks.some(p => p.health.status === HealthStatus.HEALTHY && p.suspensionMatches === 0 && p.condition >= 90)) {
         setPlayers(prev => ({ ...prev, [userTeamId]: (prev[userTeamId] || []).filter(p => p.id !== emergencyGk.id) }));
         
         const currentLineup = lineups[userTeamId];
         if (currentLineup) {
           updateLineup(userTeamId, {
             ...currentLineup,
             startingXI: currentLineup.startingXI.map(id => id === emergencyGk.id ? null : id)
           });
         }

         const fireMail = MailService.createFromTemplate('staff_emergency_gk_fired', { 'PLAYER': emergencyGk.lastName });
         setMessages(prev => [fireMail, ...prev]);
      }
    }
    // --- END OF EMERGENCY GK PROTOCOL ---

    // ── Dzienny przegląd kontuzji w reprezentacjach narodowych ────────────────
    if (nationalTeams.length > 0) {
      const ntReview = NationalTeamService.reviewDailyInjuries(nationalTeams, players, dateToProcess);
      const anyChanged = ntReview.updatedTeams.some((t, i) => t !== nationalTeams[i]);
      if (anyChanged) setNationalTeams(ntReview.updatedTeams);
      if (ntReview.newPlayers.length > 0) {
        setPlayers(prev => ({
          ...prev,
          'FREE_AGENTS': [...(prev['FREE_AGENTS'] || []), ...ntReview.newPlayers]
        }));
      }
      if (ntReview.playerUpdates.length > 0) {
        const updateMap: Record<string, string> = {};
        ntReview.playerUpdates.forEach(u => { updateMap[u.id] = u.assignedNationalTeamId; });
        setPlayers(prev => {
          const updated: Record<string, Player[]> = {};
          for (const [clubId, squad] of Object.entries(prev)) {
            updated[clubId] = squad.map(p =>
              updateMap[p.id] ? { ...p, assignedNationalTeamId: updateMap[p.id] } : p
            );
          }
          return updated;
        });
      }

      // ── Tygodniowy przegląd kadry (każdy poniedziałek, poza oknem zamrożenia NT) ─
      const ntSeasonYear = dateToProcess.getMonth() >= 6 ? dateToProcess.getFullYear() : dateToProcess.getFullYear() - 1;
      if (dateToProcess.getDay() === 1 && !NationalTeamService.isSquadFrozen(dateToProcess, ntSeasonYear)) {
        const ntMonthly = NationalTeamService.reviewMonthlySquad(nationalTeams, coaches, players);
        const monthlyAnyChanged = ntMonthly.updatedTeams.some((t, i) => t !== nationalTeams[i]);
        if (monthlyAnyChanged) setNationalTeams(ntMonthly.updatedTeams);
        if (ntMonthly.playerUpdates.length > 0) {
          const monthlyUpdateMap: Record<string, string | null> = {};
          ntMonthly.playerUpdates.forEach(u => { monthlyUpdateMap[u.id] = u.assignedNationalTeamId; });
          setPlayers(prev => {
            const updated: Record<string, Player[]> = {};
            for (const [clubId, squad] of Object.entries(prev)) {
              updated[clubId] = squad.map(p =>
                p.id in monthlyUpdateMap ? { ...p, assignedNationalTeamId: monthlyUpdateMap[p.id] } : p
              );
            }
            return updated;
          });
        }
        if (userTeamId && ntMonthly.calledUpFromClub.length > 0) {
          const userSquad = players[userTeamId] || [];
          const callupMails: MailMessage[] = [];
          ntMonthly.calledUpFromClub.forEach(({ playerId, teamName }) => {
            const player = userSquad.find(p => p.id === playerId);
            if (player) {
              callupMails.push(MailService.generateNTCallUpMail(player, teamName, dateToProcess));
            }
          });
          if (callupMails.length > 0) {
            setMessages(prev => [...callupMails, ...prev]);
          }
        }
      }
    }
    // ── Koniec przeglądu kontuzji NT ─────────────────────────────────────────

        // ── Email o finale Pucharu Polski (wysyłany dzień po finale) ─────────────
    if (userTeamId) {
      const cupFinalFixture = allFixtures.find(f =>
        f.id.includes('CUP_Puchar_Polski:_FINAŁ') &&
        f.status === MatchStatus.FINISHED
      );
      if (cupFinalFixture) {
        const dayAfterFinal = new Date(cupFinalFixture.date);
        dayAfterFinal.setDate(dayAfterFinal.getDate() + 1);
        if (dayAfterFinal.toDateString() === dateToProcess.toDateString()) {
          const cupFinalMailKey = 'CUP_FINAL_SENT';
          if (!sentMailIdsRef.current.has(cupFinalMailKey)) {
            const hScore = cupFinalFixture.homeScore || 0;
            const aScore = cupFinalFixture.awayScore || 0;
            let homeWin = hScore > aScore;
            if (hScore === aScore && cupFinalFixture.homePenaltyScore !== undefined) {
              homeWin = cupFinalFixture.homePenaltyScore > (cupFinalFixture.awayPenaltyScore || 0);
            }
            const cupWinnerIdLocal = homeWin ? cupFinalFixture.homeTeamId : cupFinalFixture.awayTeamId;
            const penScore = cupFinalFixture.homePenaltyScore !== undefined
              ? `${hScore}:${aScore} (${cupFinalFixture.homePenaltyScore}:${cupFinalFixture.awayPenaltyScore} k.)`
              : `${hScore}:${aScore}`;
            const cupMail = MailService.generateCupFinalMail(
              cupFinalFixture.homeTeamId,
              cupFinalFixture.awayTeamId,
              penScore,
              userTeamId,
              cupWinnerIdLocal
            );
            sentMailIdsRef.current.add(cupFinalMailKey);
            setMessages(prev => [cupMail, ...prev]);
          }
        }
      }
    }

    // Automatyczne generowanie finału Pucharu po wyłonieniu finalistów
    // (zawsze w okolicach daty 9 kwietnia, ale sprawdzamy na bieżąco)
    if (!globalFixtures.some(f => f.id.includes('FINAŁ'))) {
      const finalists = clubs.filter(c => c.isInPolishCup);
      if (finalists.length === 2) {
        // Data finału: 2 maja danego roku
        const finalDate = new Date(dateToProcess.getFullYear(), 4, 2);
        if (finalDate > dateToProcess) {
          const finalFixture: Fixture = {
            id: 'CUP_Puchar_Polski:_FINAŁ_AUTO',
            leagueId: CompetitionType.POLISH_CUP,
            homeTeamId: finalists[0].id,
            awayTeamId: finalists[1].id,
            date: finalDate,
            status: MatchStatus.SCHEDULED,
            homeScore: null,
            awayScore: null
          };
          setGlobalFixtures(prev => [...prev, finalFixture]);
        }
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FRIENDLY MATCH CHECK: Jeśli dziś gracz ma zaplanowany sparing, zatrzymaj
    // ─────────────────────────────────────────────────────────────────────────
    if (userTeamId && !isResigned) {
      const friendlyToday = allFixtures.find(f =>
        f.leagueId === CompetitionType.FRIENDLY &&
        f.date.toDateString() === dateToProcess.toDateString() &&
        (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId) &&
        f.status === MatchStatus.SCHEDULED
      );
      if (friendlyToday) {
        setActiveFriendlyFixtureId(friendlyToday.id);
        setActiveFriendlyConditions(null); // reset warunków — gracz ustali je na widoku
        setTargetJumpTime(null);
        navigateTo(ViewState.PRE_MATCH_FRIENDLY_STUDIO);
        return; // nie przesuwaj dnia
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CALENDAR ENGINE: Jedyne źródło prawdy — co dzieje się dziś?
    // ─────────────────────────────────────────────────────────────────────────
    const dayEvents = CalendarEngine.getEventsForDate(
      dateToProcess, seasonTemplate, allFixtures, userTeamId, clubs
    );
    const primaryEvent = dayEvents.find(e => e.participation !== 'info') ?? null;
    const hasCompetitionToday = (competition: CompetitionType): boolean =>
      dayEvents.some(e => e.slot.competition === competition);

    // skipDayAdvance = true oznacza że data NIE zostanie przesunięta
    // (gracz musi jeszcze zagrać mecz lub potwierdzić akcję tego dnia)
    let skipDayAdvance = false;

    const applyWorldCupEffectsAndMail = (completedState: WCState, wcYear: number) => {
      const wcEffectsKey = `WC_EFFECTS_${wcYear}`;
      if (sentMailIdsRef.current.has(wcEffectsKey)) return;

      sentMailIdsRef.current.add(wcEffectsKey);
      const allPlayers = Object.values(players).flat();
      const effects = WorldCupService.computePlayerEffects(completedState, allPlayers, sessionSeed);
      completedState.playerEffects = effects;

      if (effects.length > 0) {
        setPlayers(prev => {
          if (!userTeamId) return prev;
          const updatedSquad = (prev[userTeamId] || []).map(player => {
            const pEffects = effects.filter(e => e.playerId === player.id);
            if (pEffects.length === 0) return player;

            let updated = { ...player };
            const injuryEffect = pEffects.find(e => e.type === 'INJURY');
            const fatigueEffect = pEffects.find(e => e.type === 'FATIGUE');

            if (injuryEffect) {
              updated = {
                ...updated,
                health: {
                  status: HealthStatus.INJURED,
                  injury: {
                    type: 'Zmeczenie po MS',
                    daysRemaining: injuryEffect.value,
                    severity: InjurySeverity.LIGHT,
                    injuryDate: dateToProcess.toISOString().split('T')[0],
                    totalDays: injuryEffect.value,
                  },
                },
              };
            }

            if (fatigueEffect) {
              updated = { ...updated, fatigueDebt: Math.min(100, (updated.fatigueDebt ?? 0) + fatigueEffect.value) };
            }

            return updated;
          });

          return { ...prev, [userTeamId]: updatedSquad };
        });
      }

      setWcState(prev => prev ? { ...prev, playerEffects: effects } : prev);

      if (completedState.champion) {
        const champMail: MailMessage = {
          id: wcEffectsKey,
          sender: 'FIFA',
          role: 'Biuro Rozgrywek FIFA',
          subject: `Mistrz Swiata ${wcYear}: ${completedState.champion}!`,
          body: `Mistrzostwa Swiata ${wcYear} zakonczyly sie. Mistrzem Swiata zostaje ${completedState.champion}! Otworz widok Mistrzostw Swiata, aby zobaczyc pelne wyniki.`,
          date: new Date(dateToProcess),
          isRead: false,
          type: MailType.SYSTEM,
          priority: 100,
        };
        setMessages(prev => [champMail, ...prev]);
      }
    };

    const processWorldCupDay = () => {
      if (!WorldCupService.isWorldCupYear(dateToProcess.getFullYear())) return;

      const wcMonth = dateToProcess.getMonth() + 1;
      const wcDay = dateToProcess.getDate();
      const wcYear = dateToProcess.getFullYear();
      const newProcessedIds: string[] = [];
      let nextWcState = wcState;
      let wcChanged = false;

      if (wcMonth === 3 && wcDay === 21 && nextWcState && !nextWcState.playoffSlotsResolved) {
        const wcFillKey = `WC_FILL_SLOTS_${wcYear}`;
        if (!sentMailIdsRef.current.has(wcFillKey) && wcqPlayoffState?.finalCompleted) {
          const winners = wcqPlayoffState.paths
            .map(p => p.qualifier)
            .filter((q): q is string => !!q);

          if (winners.length > 0) {
            sentMailIdsRef.current.add(wcFillKey);
            nextWcState = WorldCupService.fillPlayoffSlots(nextWcState, winners, nationalTeams);
            wcChanged = true;
            const fillMail: MailMessage = {
              id: wcFillKey,
              sender: 'FIFA',
              role: 'Biuro Rozgrywek FIFA',
              subject: `MS ${wcYear} - Grupy kompletne!`,
              body: `Zwyciezcy barazy UEFA uzupelnili wszystkie grupy Mistrzostw Swiata ${wcYear}. Sklad wszystkich 12 grup jest juz znany!`,
              date: new Date(dateToProcess),
              isRead: false,
              type: MailType.SYSTEM,
              priority: 90,
            };
            setMessages(prev => [fillMail, ...prev]);
          }
        }
      }

      if (wcMonth === 6 && wcDay === 2 && !nextWcState) {
        const wcStartFallbackKey = `WC_START_FALLBACK_${wcYear}`;
        if (!sentMailIdsRef.current.has(wcStartFallbackKey)) {
          sentMailIdsRef.current.add(wcStartFallbackKey);
          const wcTeams = WorldCupService.assembleTeams(nationalTeams, wcqPlayoffState, seasonNumber, wcYear, sessionSeed);
          const wcGroups = WorldCupService.drawGroups(wcTeams, sessionSeed, wcYear);
          nextWcState = WorldCupService.createInitialState(wcTeams, wcGroups, wcYear);
          wcChanged = true;
        }
      }

      if (wcMonth === 6 && wcDay === 2) {
        const wcStartKey = `WC_START_${wcYear}`;
        if (!sentMailIdsRef.current.has(wcStartKey)) {
          sentMailIdsRef.current.add(wcStartKey);
          const wcMail: MailMessage = {
            id: wcStartKey,
            sender: 'FIFA',
            role: 'Biuro Rozgrywek FIFA',
            subject: `Mistrzostwa Swiata ${wcYear} - Start!`,
            body: `Mistrzostwa Swiata ${wcYear} oficjalnie sie rozpoczely! Mecze beda rozgrywane w tle zgodnie z kalendarzem, a pelne wyniki i szczegoly znajdziesz w widoku Mistrzostw Swiata.`,
            date: new Date(dateToProcess),
            isRead: false,
            type: MailType.SYSTEM,
            priority: 100,
          };
          setMessages(prev => [wcMail, ...prev]);
        }
      }

      if (wcMonth === 6 && wcDay >= 2 && wcDay <= 12 && nextWcState) {
        const wcGroupDayKey = `WC_GROUP_${wcYear}_${wcDay}`;
        if (!processedDrawIds.includes(wcGroupDayKey)) {
          if (!nextWcState.groupStageComplete) {
            nextWcState = {
              ...nextWcState,
              groups: WorldCupService.simulateGroupDay(nextWcState.groups, nextWcState.teams, wcDay, 6, wcYear, sessionSeed, nationalTeams, players, coaches),
            };
            wcChanged = true;
          }
          newProcessedIds.push(wcGroupDayKey);
        }
      }

      if (wcMonth === 6 && wcDay === 13 && nextWcState) {
        const wcBracketKey = `WC_BRACKET_${wcYear}`;
        if (!processedDrawIds.includes(wcBracketKey)) {
          if (!nextWcState.groupStageComplete) {
            nextWcState = {
              ...nextWcState,
              knockoutMatches: WorldCupService.buildKnockoutBracket(nextWcState.groups, wcYear),
              groupStageComplete: true,
            };
            wcChanged = true;
          }
          newProcessedIds.push(wcBracketKey);
        }
      }

      const isKODay = wcMonth === 6 && (
        (wcDay >= 15 && wcDay <= 18) ||
        (wcDay >= 19 && wcDay <= 22) ||
        (wcDay >= 23 && wcDay <= 24) ||
        (wcDay >= 26 && wcDay <= 27) ||
        wcDay === 29 || wcDay === 30
      );

      if (isKODay && nextWcState) {
        const wcKODayKey = `WC_KO_${wcYear}_${wcDay}`;
        if (!processedDrawIds.includes(wcKODayKey)) {
          if (nextWcState.groupStageComplete && !nextWcState.knockoutComplete) {
            const updatedKO = WorldCupService.simulateKnockoutDay(nextWcState, nextWcState.teams, wcDay, 6, wcYear, sessionSeed, nationalTeams, players, coaches);
            nextWcState = { ...nextWcState, knockoutMatches: updatedKO };

            if (wcDay === 30) {
              const finalMatch = updatedKO.find(m => m.round === 'FINAL');
              const thirdMatch = updatedKO.find(m => m.round === 'THIRD');
              nextWcState = {
                ...nextWcState,
                knockoutComplete: true,
                champion: finalMatch?.winner ?? undefined,
                thirdPlace: thirdMatch?.winner ?? undefined,
              };
              applyWorldCupEffectsAndMail(nextWcState, wcYear);
            }

            wcChanged = true;
          }
          newProcessedIds.push(wcKODayKey);
        }
      }

      if (wcMonth === 6 && wcDay === 30 && nextWcState?.knockoutComplete) {
        applyWorldCupEffectsAndMail(nextWcState, wcYear);
      }

      if (wcChanged && nextWcState) setWcState(nextWcState);
      if (newProcessedIds.length > 0) {
        setProcessedDrawIds(prev => [...prev, ...newProcessedIds.filter(id => !prev.includes(id))]);
      }
    };

    processWorldCupDay();

    if (primaryEvent?.participation === 'player') {
      setTargetJumpTime(null);
      const slot = primaryEvent.slot;

      switch (slot.competition) {

        // ── LE: Losowanie Rundy 1 Preeliminacyjnej ──────────────────────────
        case CompetitionType.EL_R1Q_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          const elTeamIds = ELDrawService.getEligibleTeams(RAW_EUROPA_LEAGUE_CLUBS, sessionSeed);
          const elPairs = ELDrawService.drawPairs(elTeamIds, clubs, dateToProcess, sessionSeed);
          setActiveCupDraw({ id: slot.id, label: slot.label, date: dateToProcess, pairs: elPairs });
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.EL_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LK: Losowanie Rundy 1 Preeliminacyjnej ──────────────────────────
        case CompetitionType.CONF_R1Q_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          const confTeamIds = CONFDrawService.getEligibleTeams(RAW_CONFERENCE_LEAGUE_CLUBS, sessionSeed);
          const confPairs = CONFDrawService.drawPairs(confTeamIds, RAW_CONFERENCE_LEAGUE_CLUBS, clubs, dateToProcess, sessionSeed);
          setActiveCupDraw({ id: slot.id, label: slot.label, date: dateToProcess, pairs: confPairs });
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.CONF_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LK: Mecze Rundy 1 ───────────────────────────────────────────────
        case CompetitionType.CONF_R1Q:
        case CompetitionType.CONF_R1Q_RETURN: {
          const alreadyPlayedCONF = allFixtures.some(f =>
            f.date.toDateString() === dateToProcess.toDateString() &&
            (f.leagueId === CompetitionType.CONF_R1Q || f.leagueId === CompetitionType.CONF_R1Q_RETURN) &&
            f.status === MatchStatus.FINISHED
          );
          if (!alreadyPlayedCONF) {
            if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
            navigateTo(ViewState.PRE_MATCH_CONF_STUDIO);
            skipDayAdvance = true; break;
          }
          break;
        }

        // ── LK: Losowanie Rundy 2 Preeliminacyjnej ──────────────────────────
        case CompetitionType.CONF_R2Q_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          const confR2QPool = CONFDrawService.getR2QPool(RAW_CONFERENCE_LEAGUE_CLUBS, allFixtures, confR2QPolishTeamIds, sessionSeed);
          const confR2QPairs = CONFDrawService.drawR2QPairs(confR2QPool, RAW_CONFERENCE_LEAGUE_CLUBS, clubs, dateToProcess, sessionSeed);
          setActiveCupDraw({ id: slot.id, label: slot.label, date: dateToProcess, pairs: confR2QPairs });
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.CONF_R2Q_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LK: Mecze Rundy 2 ───────────────────────────────────────────────
        case CompetitionType.CONF_R2Q:
        case CompetitionType.CONF_R2Q_RETURN: {
          const alreadyPlayedCONFR2Q = allFixtures.some(f =>
            f.date.toDateString() === dateToProcess.toDateString() &&
            (f.leagueId === CompetitionType.CONF_R2Q || f.leagueId === CompetitionType.CONF_R2Q_RETURN) &&
            f.status === MatchStatus.FINISHED
          );
          if (!alreadyPlayedCONFR2Q) {
            if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
            navigateTo(ViewState.PRE_MATCH_CONF_STUDIO);
            skipDayAdvance = true; break;
          }
          break;
        }

        // ── LK: Losowanie Fazy Grupowej ─────────────────────────────────────
        case CompetitionType.CONF_GROUP_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          const confR2QWinners = CONFDrawService.getGroupStagePool(allFixtures);
          const confGroupsResult = CONFDrawService.drawGroupStage(confR2QWinners, RAW_CONFERENCE_LEAGUE_CLUBS, clubs, sessionSeed);
          setActiveConfGroupDraw({ id: slot.id, label: slot.label, date: dateToProcess, groups: confGroupsResult });
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.CONF_GROUP_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LK: Faza Grupowa ────────────────────────────────────────────────
        case CompetitionType.CONF_GROUP_STAGE: {
          const alreadyPlayedCONFGS = allFixtures.some(f =>
            f.date.toDateString() === dateToProcess.toDateString() &&
            f.leagueId === CompetitionType.CONF_GROUP_STAGE &&
            f.status === MatchStatus.FINISHED
          );
          if (!alreadyPlayedCONFGS) {
            if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
            navigateTo(ViewState.PRE_MATCH_CONF_STUDIO);
            skipDayAdvance = true; break;
          }
          break;
        }

        // ── LK: Losowanie 1/8 Finału ────────────────────────────────────────
        case CompetitionType.CONF_R16_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          if (!confGroups) break; // faza grupowa jeszcze nie zakończona
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.CONF_R16_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LK: 1/8 Finału ──────────────────────────────────────────────────
        case CompetitionType.CONF_R16:
        case CompetitionType.CONF_R16_RETURN: {
          const alreadyPlayedCONFR16 = allFixtures.some(f =>
            f.date.toDateString() === dateToProcess.toDateString() &&
            (f.leagueId === CompetitionType.CONF_R16 || f.leagueId === CompetitionType.CONF_R16_RETURN) &&
            f.status === MatchStatus.FINISHED
          );
          if (!alreadyPlayedCONFR16) {
            if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
            navigateTo(ViewState.PRE_MATCH_CONF_STUDIO);
            skipDayAdvance = true; break;
          }
          break;
        }

        // ── LK: Losowanie 1/4 Finału ────────────────────────────────────────
        case CompetitionType.CONF_QF_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.CONF_QF_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LK: 1/4 Finału ──────────────────────────────────────────────────
        case CompetitionType.CONF_QF:
        case CompetitionType.CONF_QF_RETURN: {
          const alreadyPlayedCONFQF = allFixtures.some(f =>
            f.date.toDateString() === dateToProcess.toDateString() &&
            (f.leagueId === CompetitionType.CONF_QF || f.leagueId === CompetitionType.CONF_QF_RETURN) &&
            f.status === MatchStatus.FINISHED
          );
          if (!alreadyPlayedCONFQF) {
            if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
            navigateTo(ViewState.PRE_MATCH_CONF_STUDIO);
            skipDayAdvance = true; break;
          }
          break;
        }

        // ── LK: Losowanie 1/2 Finału ─────────────────────────────────────────
        case CompetitionType.CONF_SF_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.CONF_SF_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LK: 1/2 Finału ──────────────────────────────────────────────────
        case CompetitionType.CONF_SF:
        case CompetitionType.CONF_SF_RETURN: {
          const alreadyPlayedCONFSF = allFixtures.some(f =>
            f.date.toDateString() === dateToProcess.toDateString() &&
            (f.leagueId === CompetitionType.CONF_SF || f.leagueId === CompetitionType.CONF_SF_RETURN) &&
            f.status === MatchStatus.FINISHED
          );
          if (!alreadyPlayedCONFSF) {
            if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
            navigateTo(ViewState.PRE_MATCH_CONF_STUDIO);
            skipDayAdvance = true; break;
          }
          break;
        }

        // ── LK: Ogłoszenie Finalistów ─────────────────────────────────────
        case CompetitionType.CONF_FINAL_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          const confFinalAlreadyExists = allFixtures.some(f => f.leagueId === CompetitionType.CONF_FINAL);
          if (!confFinalAlreadyExists) {
            const sfWinnersCONF = CONFDrawService.getSFWinners(allFixtures);
            const sfPoolCONF = CONFDrawService.getSFParticipants(allFixtures);
            const safeSFWinnersCONF = CONFDrawService.guaranteeWinners(sfWinnersCONF, sfPoolCONF, 2);
            if (safeSFWinnersCONF.length === 2) {
              const finalDate = new Date(currentDate.getFullYear(), 4, 27);
              const finalFixtureCONF = CONFDrawService.generateFinalFixture(
                safeSFWinnersCONF[0], safeSFWinnersCONF[1], finalDate, finalDate.getFullYear()
              );
              setGlobalFixtures(prev => [...prev, finalFixtureCONF]);
            }
          }
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.CONF_FINAL_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LK: FINAŁ ─────────────────────────────────────────────────────
        case CompetitionType.CONF_FINAL: {
          const confFinalFixture = allFixtures.find(f => f.leagueId === CompetitionType.CONF_FINAL);
          if (!confFinalFixture) break;
          const alreadyPlayedCONFFinal = confFinalFixture.status === MatchStatus.FINISHED;
          if (!alreadyPlayedCONFFinal) {
            if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
            navigateTo(ViewState.PRE_MATCH_CONF_STUDIO);
            skipDayAdvance = true; break;
          }
          if (alreadyPlayedCONFFinal) {
            const mailKey = `CONF_FINAL_RESULT_${confFinalFixture.date.getFullYear()}`;
            if (!sentMailIdsRef.current.has(mailKey)) {
              sentMailIdsRef.current.add(mailKey);
              const h = confFinalFixture.homeScore ?? 0;
              const a = confFinalFixture.awayScore ?? 0;
              let winnerId: string;
              if (h > a) winnerId = confFinalFixture.homeTeamId;
              else if (a > h) winnerId = confFinalFixture.awayTeamId;
              else winnerId = (confFinalFixture.homePenaltyScore ?? 0) >= (confFinalFixture.awayPenaltyScore ?? 0)
                ? confFinalFixture.homeTeamId : confFinalFixture.awayTeamId;
              const winner = clubs.find(c => c.id === winnerId);
              const mail: MailMessage = {
                id: mailKey,
                sender: 'UEFA',
                role: 'Biuro Rozgrywek UEFA',
                subject: `Zdobywca Ligi Konferencji ${confFinalFixture.date.getFullYear()}`,
                body: `Finał Ligi Konferencji zakończony. Zdobywcą Ligi Konferencji ${confFinalFixture.date.getFullYear()} został ${winner?.name ?? winnerId}.`,
                date: new Date(currentDate),
                isRead: false,
                type: MailType.SYSTEM,
                priority: 100,
              };
              setMessages(prev => [mail, ...prev]);
            }
          }
          break;
        }

        // ── LE: Losowanie Rundy 2 Preeliminacyjnej ──────────────────────────
        case CompetitionType.EL_R2Q_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          const elR2QPool = ELDrawService.getR2QPool(RAW_EUROPA_LEAGUE_CLUBS, allFixtures, currentPolishCupWinnerId);
          const elR2QPairs = ELDrawService.drawR2QPairs(elR2QPool, clubs, dateToProcess, sessionSeed);
          setActiveCupDraw({ id: slot.id, label: slot.label, date: dateToProcess, pairs: elR2QPairs });
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.EL_R2Q_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LE: Losowanie Fazy Grupowej ─────────────────────────────────────
        case CompetitionType.EL_GROUP_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          const elR2QWinners = ELDrawService.getGroupStagePool(allFixtures);
          const elGroups = ELDrawService.drawGroupStage(elR2QWinners, RAW_EUROPA_LEAGUE_CLUBS, clubs, sessionSeed);
          setActiveELGroupDraw({ id: slot.id, label: slot.label, date: dateToProcess, groups: elGroups });
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.EL_GROUP_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LE: Losowanie 1/8 Finału ────────────────────────────────────────
        case CompetitionType.EL_R16_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          if (!elGroups) break; // faza grupowa jeszcze nie zakończona
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.EL_R16_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LE: Losowanie 1/4 Finału ────────────────────────────────────────
        case CompetitionType.EL_QF_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.EL_QF_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LE: 1/4 Finału (mecze) ──────────────────────────────────────────
        case CompetitionType.EL_QF:
        case CompetitionType.EL_QF_RETURN: {
          const alreadyPlayedELQF = allFixtures.some(f =>
            f.date.toDateString() === dateToProcess.toDateString() &&
            (f.leagueId === CompetitionType.EL_QF || f.leagueId === CompetitionType.EL_QF_RETURN) &&
            f.status === MatchStatus.FINISHED
          );
          if (!alreadyPlayedELQF) {
            if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
            navigateTo(ViewState.PRE_MATCH_EL_STUDIO);
            skipDayAdvance = true; break;
          }
          break;
        }

        // ── LE: Losowanie 1/2 Finału ────────────────────────────────────────
        case CompetitionType.EL_SF_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.EL_SF_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LE: 1/2 Finału (mecze) ──────────────────────────────────────────
        case CompetitionType.EL_SF:
        case CompetitionType.EL_SF_RETURN: {
          const alreadyPlayedELSF = allFixtures.some(f =>
            f.date.toDateString() === dateToProcess.toDateString() &&
            (f.leagueId === CompetitionType.EL_SF || f.leagueId === CompetitionType.EL_SF_RETURN) &&
            f.status === MatchStatus.FINISHED
          );
          if (!alreadyPlayedELSF) {
            if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
            navigateTo(ViewState.PRE_MATCH_EL_STUDIO);
            skipDayAdvance = true; break;
          }
          if (slot.competition === CompetitionType.EL_SF_RETURN) {
            const allSFReturnDone = allFixtures
              .filter(f => f.leagueId === CompetitionType.EL_SF_RETURN)
              .every(f => f.status === MatchStatus.FINISHED);
            if (allSFReturnDone) {
              const finalAlreadyExists = allFixtures.some(f => f.leagueId === CompetitionType.EL_FINAL);
              if (!finalAlreadyExists) {
                const sfWinnersEL = ELDrawService.getSFWinners(allFixtures);
                const sfPoolEL = ELDrawService.getSFParticipants(allFixtures);
                const safeSFWinnersEL = ELDrawService.guaranteeWinners(sfWinnersEL, sfPoolEL, 2);
                if (safeSFWinnersEL.length === 2) {
                  const finalDateEL = new Date(dateToProcess.getFullYear(), 4, 20);
                  const finalFixtureEL = ELDrawService.generateFinalFixture(
                    safeSFWinnersEL[0], safeSFWinnersEL[1], finalDateEL, finalDateEL.getFullYear()
                  );
                  setGlobalFixtures(prev => [...prev, finalFixtureEL]);
                }
              }
            }
          }
          break;
        }

        // ── LE: Ogłoszenie Finalistów ────────────────────────────────────────
        case CompetitionType.EL_FINAL_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          const elFinalAlreadyExists = allFixtures.some(f => f.leagueId === CompetitionType.EL_FINAL);
          if (!elFinalAlreadyExists) {
            const sfWinnersEL2 = ELDrawService.getSFWinners(allFixtures);
            const sfPoolEL2 = ELDrawService.getSFParticipants(allFixtures);
            const safeSFWinnersEL2 = ELDrawService.guaranteeWinners(sfWinnersEL2, sfPoolEL2, 2);
            if (safeSFWinnersEL2.length === 2) {
              const finalDateEL2 = new Date(dateToProcess.getFullYear(), 4, 20);
              const finalFixtureEL2 = ELDrawService.generateFinalFixture(
                safeSFWinnersEL2[0], safeSFWinnersEL2[1], finalDateEL2, finalDateEL2.getFullYear()
              );
              setGlobalFixtures(prev => [...prev, finalFixtureEL2]);
            }
          }
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.EL_FINAL_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LE: FINAŁ ────────────────────────────────────────────────────────
        case CompetitionType.EL_FINAL: {
          const elFinalFixture = allFixtures.find(f => f.leagueId === CompetitionType.EL_FINAL);
          if (!elFinalFixture) break;
          const alreadyPlayedELFinal = elFinalFixture.status === MatchStatus.FINISHED;
          if (!alreadyPlayedELFinal) {
            if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
            navigateTo(ViewState.PRE_MATCH_EL_STUDIO);
            skipDayAdvance = true; break;
          }
          if (userTeamId) {
            const mailKey = `EL_FINAL_RESULT_${elFinalFixture.date.getFullYear()}`;
            if (!sentMailIdsRef.current.has(mailKey)) {
              sentMailIdsRef.current.add(mailKey);
              const h = elFinalFixture.homeScore ?? 0;
              const a = elFinalFixture.awayScore ?? 0;
              let winnerId: string;
              if (h > a) winnerId = elFinalFixture.homeTeamId;
              else if (a > h) winnerId = elFinalFixture.awayTeamId;
              else winnerId = (elFinalFixture.homePenaltyScore ?? 0) >= (elFinalFixture.awayPenaltyScore ?? 0)
                ? elFinalFixture.homeTeamId : elFinalFixture.awayTeamId;
              const winner = clubs.find(c => c.id === winnerId);
              setCurrentELWinnerId(winnerId);
              const isUserWinner = winnerId === userTeamId;
              const mail: MailMessage = {
                id: mailKey,
                sender: 'UEFA',
                role: 'Biuro Rozgrywek UEFA',
                subject: `Zdobywca Ligi Europy ${elFinalFixture.date.getFullYear()}`,
                body: isUserWinner
                  ? `GRATULACJE! Twój klub zdobył Ligę Europy ${elFinalFixture.date.getFullYear()}!`
                  : `Finał Ligi Europy zakończony. Zdobywcą Ligi Europy ${elFinalFixture.date.getFullYear()} został ${winner?.name ?? winnerId}.`,
                date: new Date(currentDate),
                isRead: false,
                type: MailType.SYSTEM,
                priority: 100,
              };
              setMessages(prev => [mail, ...prev]);
            }
          }
          break;
        }

        // ── LM: Losowanie Rundy 1 Preeliminacyjnej ──────────────────────────
        case CompetitionType.CHAMPIONS_LEAGUE_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          const eligibleIds = CLDrawService.getEligibleTeams(RAW_CHAMPIONS_LEAGUE_CLUBS);
          const pairs = CLDrawService.drawPairs(eligibleIds, clubs, dateToProcess, sessionSeed);
          setActiveCupDraw({ id: slot.id, label: slot.label, date: dateToProcess, pairs });
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.CL_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LM: Losowanie Rundy 2 Preeliminacyjnej ──────────────────────────
        case CompetitionType.CL_R2Q_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          const r2qPool = CLDrawService.getR2QPool(
            RAW_CHAMPIONS_LEAGUE_CLUBS, allFixtures, currentPolishChampionId, userTeamId,
          );
          const r2qPairs = CLDrawService.drawR2QPairs(
            r2qPool, currentPolishChampionId, RAW_CHAMPIONS_LEAGUE_CLUBS, clubs, dateToProcess, sessionSeed,
          );
          setActiveCupDraw({ id: slot.id, label: slot.label, date: dateToProcess, pairs: r2qPairs });
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.CL_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LM: Losowanie Fazy Grupowej ─────────────────────────────────────
        case CompetitionType.CL_GROUP_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          const r2qWinners = CLDrawService.getGroupStagePool(allFixtures, RAW_CHAMPIONS_LEAGUE_CLUBS);
          const groups = CLDrawService.drawGroupStage(
            r2qWinners, RAW_CHAMPIONS_LEAGUE_CLUBS, clubs, sessionSeed,
          );
          setActiveGroupDraw({ id: slot.id, label: slot.label, date: dateToProcess, groups });
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.CL_GROUP_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LM: Faza Grupowa (mecz gracza) ──────────────────────────────────
        case CompetitionType.CL_GROUP_STAGE: {
          const alreadyPlayed = allFixtures.some(f =>
            f.date.toDateString() === dateToProcess.toDateString() &&
            f.leagueId === CompetitionType.CL_GROUP_STAGE &&
            f.status === MatchStatus.FINISHED
          );
          if (!alreadyPlayed) {
            if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
            navigateTo(ViewState.PRE_MATCH_CL_STUDIO);
            skipDayAdvance = true; break;
          }

          break;
        }

 // ── LM: Losowanie 1/8 Finału ────────────────────────────────────────
        case CompetitionType.CL_R16_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          if (!clGroups) break; // faza grupowa jeszcze nie zakończona
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.CL_R16_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LM: 1/8 Finału (mecze) ──────────────────────────────────────────
        case CompetitionType.CL_R16:
        case CompetitionType.CL_R16_RETURN: {
          const alreadyPlayed = allFixtures.some(f =>
            f.date.toDateString() === dateToProcess.toDateString() &&
            (f.leagueId === CompetitionType.CL_R16 || f.leagueId === CompetitionType.CL_R16_RETURN) &&
            f.status === MatchStatus.FINISHED
          );
          if (!alreadyPlayed) {
            if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
            navigateTo(ViewState.PRE_MATCH_CL_STUDIO);
            skipDayAdvance = true; break;
          }
            break;
        }

        // ── LM: Losowanie 1/4 Finału ────────────────────────────────────────
        case CompetitionType.CL_QF_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.CL_QF_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LM: 1/4 Finału (mecze) ──────────────────────────────────────────
        case CompetitionType.CL_QF:
        case CompetitionType.CL_QF_RETURN: {
          const alreadyPlayed = allFixtures.some(f =>
            f.date.toDateString() === dateToProcess.toDateString() &&
            (f.leagueId === CompetitionType.CL_QF || f.leagueId === CompetitionType.CL_QF_RETURN) &&
            f.status === MatchStatus.FINISHED
          );
          if (!alreadyPlayed) {
            if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
            navigateTo(ViewState.PRE_MATCH_CL_STUDIO);
            skipDayAdvance = true; break;
          }
                   break;
        }

        // ── LM: Losowanie 1/2 Finału ────────────────────────────────────────
        case CompetitionType.CL_SF_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.CL_SF_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LM: Ogłoszenie Finalistów ────────────────────────────────────────
        case CompetitionType.CL_FINAL_DRAW: {
          if (processedDrawIds.includes(slot.id)) break;
          // Wygeneruj fixture finałowy jeśli jeszcze nie istnieje
          const finalAlreadyExists = allFixtures.some(f => f.leagueId === CompetitionType.CL_FINAL);
          if (!finalAlreadyExists) {
            const sfWinners = CLDrawService.getSFWinners(allFixtures);
            const sfPool2 = CLDrawService.getSFParticipants(allFixtures);
            const safeSFWinners2 = CLDrawService.guaranteeWinners(sfWinners, sfPool2, 2);
            if (safeSFWinners2.length === 2) {
              const finalDate = new Date(dateToProcess.getFullYear(), 4, 30);
              const finalFixture = CLDrawService.generateFinalFixture(
                safeSFWinners2[0], safeSFWinners2[1], finalDate, finalDate.getFullYear()
              );
              setGlobalFixtures(prev => [...prev, finalFixture]);
            }
          }
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.CL_FINAL_DRAW);
          skipDayAdvance = true; break;
        }

        // ── LM: 1/2 Finału (mecze) ──────────────────────────────────────────
              // ── LM: 1/2 Finału (mecze) ──────────────────────────────────────────
        case CompetitionType.CL_SF:
        case CompetitionType.CL_SF_RETURN: {
          const alreadyPlayed = allFixtures.some(f =>
            f.date.toDateString() === dateToProcess.toDateString() &&
            (f.leagueId === CompetitionType.CL_SF || f.leagueId === CompetitionType.CL_SF_RETURN) &&
            f.status === MatchStatus.FINISHED
          );
          if (!alreadyPlayed) {
            if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
            navigateTo(ViewState.PRE_MATCH_CL_STUDIO);
            skipDayAdvance = true; break;
          }
          // Po rewanżu 1/2 finału: wygeneruj finał i pokaż parę finałową
          if (slot.competition === CompetitionType.CL_SF_RETURN) {
            const allSFReturnDone = allFixtures
              .filter(f => f.leagueId === CompetitionType.CL_SF_RETURN)
              .every(f => f.status === MatchStatus.FINISHED);
            if (allSFReturnDone) {
              const finalAlreadyExists = allFixtures.some(f => f.leagueId === CompetitionType.CL_FINAL);
              if (!finalAlreadyExists) {
                const sfWinners = CLDrawService.getSFWinners(allFixtures);
                const sfPool = CLDrawService.getSFParticipants(allFixtures);
                const safeSFWinners = CLDrawService.guaranteeWinners(sfWinners, sfPool, 2);
                if (safeSFWinners.length === 2) {
                  const finalDate = new Date(dateToProcess.getFullYear(), 4, 30);
                  const finalFixture = CLDrawService.generateFinalFixture(
                    safeSFWinners[0], safeSFWinners[1], finalDate, finalDate.getFullYear()
                  );
                  setGlobalFixtures(prev => [...prev, finalFixture]);
                }
              }
              // Finaliści zostaną ogłoszeni 18 kwietnia przez dedykowany slot CL_FINAL_DRAW
            }
          }
          break;
        }

        // ── LM: FINAŁ ────────────────────────────────────────────────────────
        case CompetitionType.CL_FINAL: {
          const finalFixture = allFixtures.find(f => f.leagueId === CompetitionType.CL_FINAL);
          if (!finalFixture) break;


          const alreadyPlayed = finalFixture.status === MatchStatus.FINISHED;
          if (!alreadyPlayed) {
            if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
            navigateTo(ViewState.PRE_MATCH_CL_STUDIO);
            skipDayAdvance = true; break;
          }
          // Finał rozegrany — wyślij mail o zwycięzcy (raz)
          if (userTeamId) {
            const mailKey = `CL_FINAL_RESULT_${finalFixture.date.getFullYear()}`;
            if (!sentMailIdsRef.current.has(mailKey)) {
              sentMailIdsRef.current.add(mailKey);
              const h = finalFixture.homeScore ?? 0;
              const a = finalFixture.awayScore ?? 0;
              const hasPens = finalFixture.homePenaltyScore != null;
              let winnerId: string;
              if (h > a) winnerId = finalFixture.homeTeamId;
              else if (a > h) winnerId = finalFixture.awayTeamId;
              else winnerId = (finalFixture.homePenaltyScore ?? 0) >= (finalFixture.awayPenaltyScore ?? 0)
                ? finalFixture.homeTeamId : finalFixture.awayTeamId;
              const winner = clubs.find(c => c.id === winnerId);
              setCurrentCLWinnerId(winnerId);
              const isUserWinner = winnerId === userTeamId;
              const mail: MailMessage = {
                id: mailKey,
                sender: 'UEFA',
                role: 'Biuro Rozgrywek UEFA',
                subject: `Mistrz Europy ${finalFixture.date.getFullYear()}`,
                body: isUserWinner
                  ? `GRATULACJE! Twój klub zdobył Puchar Europy! Jesteście Mistrzem Europy ${finalFixture.date.getFullYear()}!`
                  : `Finał Ligi Mistrzów zakończony. Mistrzem Europy ${finalFixture.date.getFullYear()} został ${winner?.name ?? winnerId}.`,
                date: new Date(currentDate),
                isRead: false,
                type: MailType.SYSTEM,
                priority: 100,
              };
              setMessages(prev => [mail, ...prev]);
            }
          }
          break;
        }






        // ── LM: Mecze preeliminacyjne (gracz uczestniczy) ───────────────────
        case CompetitionType.CL_R1Q:
        case CompetitionType.CL_R1Q_RETURN:
        case CompetitionType.CL_R2Q:
        case CompetitionType.CL_R2Q_RETURN: {
          if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
          navigateTo(ViewState.PRE_MATCH_CL_STUDIO);
          skipDayAdvance = true; break;
        }

        // ── LE: Mecze (gracz uczestniczy) ───────────────────────────────────
        case CompetitionType.EL_R1Q:
        case CompetitionType.EL_R1Q_RETURN:
        case CompetitionType.EL_R2Q:
        case CompetitionType.EL_R2Q_RETURN:
        case CompetitionType.EL_GROUP_STAGE:
        case CompetitionType.EL_R16:
        case CompetitionType.EL_R16_RETURN: {
          if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
          navigateTo(ViewState.PRE_MATCH_EL_STUDIO);
          skipDayAdvance = true; break;
        }

        // ── Puchar Polski: Losowanie ─────────────────────────────────────────
        case CompetitionType.POLISH_CUP: {
          if (slot.label.toUpperCase().includes('LOSOWANIE')) {
            if (processedDrawIds.includes(slot.id)) break;
            let participants: string[] = [];
            if (slot.label.includes('1/64')) {
              participants = PolishCupDrawService.getInitialParticipants(clubs);
            } else {
              participants = clubs.filter(c => c.isInPolishCup).map(c => c.id);
              if (participants.length === 0) participants = cupParticipants;
            }
            const cupDrawMapping: Record<string, string> = {
              'LOSOWANIE PUCHARU POLSKI 1/64': 'Puchar Polski: 1/64',
              'LOSOWANIE PUCHARU POLSKI 1/32': 'Puchar Polski: 1/32',
              'LOSOWANIE PUCHARU POLSKI 1/16': 'Puchar Polski: 1/16',
              'LOSOWANIE PUCHARU POLSKI 1/8':  'Puchar Polski: 1/8',
              'LOSOWANIE PUCHARU POLSKI 1/4':  'Puchar Polski: 1/4',
              'LOSOWANIE PUCHARU POLSKI 1/2':  'Puchar Polski: 1/2',
            };
            const matchLabel = cupDrawMapping[slot.label] || slot.label.replace('LOSOWANIE ', '');
            const matchSlot = seasonTemplate?.slots.find(s => s.label === matchLabel);
            const cupPairs = PolishCupDrawService.drawPairs(
              participants, clubs, matchSlot?.start || dateToProcess, matchLabel, sessionSeed,
            );
            setActiveCupDraw({ id: slot.id, label: slot.label, date: dateToProcess, pairs: cupPairs });
            setCupParticipants(participants);
            navigateTo(ViewState.CUP_DRAW);
            skipDayAdvance = true; break;
          }
          // Ogłoszenie finalistów PP — pokaż ekran finalistów (raz)
          if (slot.label.toUpperCase().includes('OGŁOSZENIE') || slot.label.toUpperCase().includes('OGLOSZENIE')) {
            if (processedDrawIds.includes(slot.id)) break;
            setProcessedDrawIds(prev => [...prev, slot.id]);
            navigateTo(ViewState.POLISH_CUP_FINALISTS);
            skipDayAdvance = true; break;
          }
          // Dzień meczowy PP — gracz uczestniczy
          // Jeśli to automatyczny skok: zatrzymaj i wróć na Dashboard (gracz edytuje skład)
          if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
          navigateTo(ViewState.PRE_MATCH_CUP_STUDIO);
          skipDayAdvance = true; break;
        }

        // ── Superpuchar (gracz uczestniczy) ────────────────────────────────
        case CompetitionType.SUPER_CUP: {
          if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
          navigateTo(ViewState.PRE_MATCH_CUP_STUDIO);
          skipDayAdvance = true; break;
        }

        // ── SUPERPUCHAR EUROPY (23 Sierpnia) ─────────────────────────────────
        // Mecz NPC — gracz jest tylko obserwatorem, symulacja w tle
        case CompetitionType.UEFA_SUPER_CUP: {
          if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
          if (processedDrawIds.includes(slot.id)) break; // mecz już przetworzony — dzień przesuwa się normalnie
          const uefaScResult = BackgroundMatchUEFASuperCup.processSuperCupMatch(
            dateToProcess, allFixtures, clubs, players, lineups, seasonNumber, sessionSeed, coaches
          );
          setGlobalFixtures(prev => {
            const clMap = new Map(uefaScResult.updatedFixtures.map(f => [f.id, f]));
            return prev.map(f => {
              const updated = clMap.get(f.id);
              if (updated && (
                updated.status !== f.status ||
                updated.homeScore !== f.homeScore ||
                updated.awayScore !== f.awayScore ||
                updated.homePenaltyScore !== f.homePenaltyScore ||
                updated.awayPenaltyScore !== f.awayPenaltyScore
              )) return updated;
              return f;
            });
          });
          setPlayers(prev => ({ ...prev, ...uefaScResult.updatedPlayers }));
          uefaScResult.matchHistoryEntries.forEach(entry => MatchHistoryService.logMatch(entry));
          const uefaEntry = uefaScResult.matchHistoryEntries.find(e => e.competition === CompetitionType.UEFA_SUPER_CUP);
          if (uefaEntry) setLastUEFASuperCupResult(uefaEntry);
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.UEFA_SUPER_CUP_VIEW);
          skipDayAdvance = true; break;
        }

        // ── OGŁOSZENIE PAR BARAŻOWYCH (24 maja) ─────────────────────────────
        case CompetitionType.PLAYOFF_DRAW_CEREMONY: {
          if (processedDrawIds.includes(slot.id)) break;
          if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }
          const sL2 = [...clubs].filter(c => c.leagueId === 'L_PL_2')
            .sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
          const sL3 = [...clubs].filter(c => c.leagueId === 'L_PL_3')
            .sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
          const l4Pool = [...clubs].filter(c => c.leagueId === 'L_PL_4')
            .sort(() => Math.random() - 0.5);
          setActivePlayoffDraw({
            ekstraklasaPlayoffs: [
              { homeId: sL2[2]?.id || '', awayId: sL2[5]?.id || '', homePos: 3, awayPos: 6 },
              { homeId: sL2[3]?.id || '', awayId: sL2[4]?.id || '', homePos: 4, awayPos: 5 },
            ],
            ligaOnePlayoffs: [
              { homeId: sL3[2]?.id || '', awayId: sL3[5]?.id || '', homePos: 3, awayPos: 6 },
              { homeId: sL3[3]?.id || '', awayId: sL3[4]?.id || '', homePos: 4, awayPos: 5 },
            ],
            relegationPlayoffs: [
              { homeId: sL3[12]?.id || '', awayId: l4Pool[0]?.id || '', homePos: 13, awayPos: 0 },
              { homeId: sL3[13]?.id || '', awayId: l4Pool[1]?.id || '', homePos: 14, awayPos: 0 },
            ],
          });
          setProcessedDrawIds(prev => [...prev, slot.id]);
          navigateTo(ViewState.PLAYOFF_DRAW);
          skipDayAdvance = true; break;
        }

        // ── BARAŻE O UTRZYMANIE — 1. MECZE (26 maja) ────────────────────────────
        // 13. i 14. miejsce 2.Ligi (L_PL_3) vs dwie losowe drużyny z 3.Ligi (L_PL_4)
        // Wyniki są przechowywane w stanie gry do obliczenia agregatu 29 maja.
        case CompetitionType.RELEGATION_PLAYOFF_1: {
          if (processedDrawIds.includes(slot.id)) break;
          if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }

          const pairs = activePlayoffDraw?.relegationPlayoffs;
          if (!pairs || pairs.length < 2) { break; } // bezpieczeństwo — pary muszą być losowane 24 maja

          const p0home = clubs.find(c => c.id === pairs[0].homeId);
          const p0away = clubs.find(c => c.id === pairs[0].awayId);
          const p1home = clubs.find(c => c.id === pairs[1].homeId);
          const p1away = clubs.find(c => c.id === pairs[1].awayId);

          if (!p0home || !p0away || !p1home || !p1away) { break; } // bezpieczeństwo

          // Seed unikalny per data + para — gwarantuje powtarzalność przy tym samym dniu
          const dateSeed26 = dateToProcess.getTime();

          // Sprawdzenie czy drużyna gracza gra w barażu
          const userInPair0_leg1 = userTeamId && (pairs[0].homeId === userTeamId || pairs[0].awayId === userTeamId);
          const userInPair1_leg1 = userTeamId && (pairs[1].homeId === userTeamId || pairs[1].awayId === userTeamId);

          if (userInPair0_leg1 || userInPair1_leg1) {
            const playerPairIdx = userInPair0_leg1 ? 0 : 1;
            const otherPairIdx = playerPairIdx === 0 ? 1 : 0;
            const otherHome = clubs.find(c => c.id === pairs[otherPairIdx].homeId)!;
            const otherAway = clubs.find(c => c.id === pairs[otherPairIdx].awayId)!;
            const otherResult = RelegationPlayoffSimulator.simulateMatch(otherHome, otherAway, dateSeed26 + (otherPairIdx + 1));
            // Placeholder dla pary gracza — zostanie nadpisany po interaktywnym meczu
            const placeholder: RelegationPlayoffLegResult = { homeId: pairs[playerPairIdx].homeId, awayId: pairs[playerPairIdx].awayId, homeGoals: 0, awayGoals: 0 };
            setRelegationPlayoffFirstLegResults(playerPairIdx === 0
              ? { pair0: placeholder, pair1: otherResult }
              : { pair0: otherResult, pair1: placeholder }
            );
            const playerPair = pairs[playerPairIdx];
            setActivePlayoffMatch({
              matchType: 'RELEGATION_LEG1',
              homeClub: clubs.find(c => c.id === playerPair.homeId)!,
              awayClub: clubs.find(c => c.id === playerPair.awayId)!,
              userSide: playerPair.homeId === userTeamId ? 'HOME' : 'AWAY',
              pairIndex: playerPairIdx,
            });
            setProcessedDrawIds(prev => [...prev, slot.id]);
            navigateTo(ViewState.PRE_MATCH_PLAYOFF_STUDIO);
          } else {
            const leg1pair0 = RelegationPlayoffSimulator.simulateMatch(p0home, p0away, dateSeed26 + 1);
            const leg1pair1 = RelegationPlayoffSimulator.simulateMatch(p1home, p1away, dateSeed26 + 2);
            setRelegationPlayoffFirstLegResults({ pair0: leg1pair0, pair1: leg1pair1 });
            setProcessedDrawIds(prev => [...prev, slot.id]);
            navigateTo(ViewState.RELEGATION_PLAYOFF_MATCH_1);
          }
          skipDayAdvance = true; break;
        }

        // ── BARAŻE O UTRZYMANIE — REWANŻE (29 maja) ─────────────────────────────
        // Oblicza agregat z obu meczów. Remis → rzuty karne.
        // Wynik finalny zapisywany w relegationPlayoffFinalResult — używany w startNextSeason.
        case CompetitionType.RELEGATION_PLAYOFF_2: {
          if (processedDrawIds.includes(slot.id)) break;
          if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }

          const firstLeg = relegationPlayoffFirstLegResults;
          const pairs2 = activePlayoffDraw?.relegationPlayoffs;
          if (!firstLeg || !pairs2 || pairs2.length < 2) { break; } // bezpieczeństwo — 1. mecze muszą istnieć

          // W rewanżu strony się zamieniają: dotychczasowy gość gra u siebie
          const p0homeR = clubs.find(c => c.id === pairs2[0].awayId); // 3.Liga gra u siebie w rewanżu
          const p0awayR = clubs.find(c => c.id === pairs2[0].homeId); // 2.Liga gości w rewanżu
          const p1homeR = clubs.find(c => c.id === pairs2[1].awayId);
          const p1awayR = clubs.find(c => c.id === pairs2[1].homeId);

          if (!p0homeR || !p0awayR || !p1homeR || !p1awayR) { break; }

          const dateSeed29 = dateToProcess.getTime();

          // clubs z 2.Ligi — para 0 i para 1 (homeId w leg1 = klub 2.Ligi)
          const clubL3pair0 = clubs.find(c => c.id === pairs2[0].homeId)!;
          const clubL4pair0 = clubs.find(c => c.id === pairs2[0].awayId)!;
          const clubL3pair1 = clubs.find(c => c.id === pairs2[1].homeId)!;
          const clubL4pair1 = clubs.find(c => c.id === pairs2[1].awayId)!;

          // Sprawdzenie czy drużyna gracza gra w rewanżu
          const userInPair0_leg2 = userTeamId && (pairs2[0].homeId === userTeamId || pairs2[0].awayId === userTeamId);
          const userInPair1_leg2 = userTeamId && (pairs2[1].homeId === userTeamId || pairs2[1].awayId === userTeamId);

          if (userInPair0_leg2 || userInPair1_leg2) {
            const playerPairIdx = userInPair0_leg2 ? 0 : 1;
            const otherPairIdx = playerPairIdx === 0 ? 1 : 0;
            // Symuluj tylko rewanż pary bez gracza
            const otherL2Home = clubs.find(c => c.id === pairs2[otherPairIdx].awayId)!; // w rewanżu strony zamienione
            const otherL2Away = clubs.find(c => c.id === pairs2[otherPairIdx].homeId)!;
            const otherLeg2 = RelegationPlayoffSimulator.simulateMatch(otherL2Home, otherL2Away, dateSeed29 + (otherPairIdx + 1));
            const otherClubL3 = otherPairIdx === 0 ? clubL3pair0 : clubL3pair1;
            const otherClubL4 = otherPairIdx === 0 ? clubL4pair0 : clubL4pair1;
            const otherFirstLeg = otherPairIdx === 0 ? firstLeg.pair0 : firstLeg.pair1;
            const otherOutcome = RelegationPlayoffSimulator.resolveAggregate(otherFirstLeg, otherLeg2, otherClubL3, otherClubL4, dateSeed29 + (otherPairIdx === 0 ? 10 : 20));
            // Wynik gracza zostanie ustalony po interaktywnym meczu — zapisujemy tylko drugą parę
            setRelegationPlayoffFinalResult(playerPairIdx === 0
              ? { pair0: null as any, pair1: otherOutcome }
              : { pair0: otherOutcome, pair1: null as any }
            );
            const playerPair = pairs2[playerPairIdx];
            const playerFirstLeg = playerPairIdx === 0 ? firstLeg.pair0 : firstLeg.pair1;
            // W rewanżu strony zamienione: awayId z leg1 (L4) gra u siebie
            setActivePlayoffMatch({
              matchType: 'RELEGATION_LEG2',
              homeClub: clubs.find(c => c.id === playerPair.awayId)!, // L4 gra u siebie w rewanżu
              awayClub: clubs.find(c => c.id === playerPair.homeId)!, // L3 gości w rewanżu
              userSide: playerPair.homeId === userTeamId ? 'AWAY' : 'HOME',
              pairIndex: playerPairIdx,
              firstLegResult: playerFirstLeg,
              otherRelegationPairOutcome: otherOutcome,
            });
            setProcessedDrawIds(prev => [...prev, slot.id]);
            navigateTo(ViewState.PRE_MATCH_PLAYOFF_STUDIO);
          } else {
            const leg2pair0 = RelegationPlayoffSimulator.simulateMatch(p0homeR, p0awayR, dateSeed29 + 1);
            const leg2pair1 = RelegationPlayoffSimulator.simulateMatch(p1homeR, p1awayR, dateSeed29 + 2);
            const outcome0 = RelegationPlayoffSimulator.resolveAggregate(firstLeg.pair0, leg2pair0, clubL3pair0, clubL4pair0, dateSeed29 + 10);
            const outcome1 = RelegationPlayoffSimulator.resolveAggregate(firstLeg.pair1, leg2pair1, clubL3pair1, clubL4pair1, dateSeed29 + 20);
            setRelegationPlayoffFinalResult({ pair0: outcome0, pair1: outcome1 });
            setProcessedDrawIds(prev => [...prev, slot.id]);
            navigateTo(ViewState.RELEGATION_PLAYOFF_MATCH_2);
          }
          skipDayAdvance = true; break;
        }

        // ── Zakończenie sezonu — pauza, gracz czyta emaile i klika "Nowy sezon" ──
        // â”€â”€ BARAÅ»E O AWANS â€” PÃ“ÅFINAÅY (31 maja) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        case CompetitionType.PROMOTION_PLAYOFF_31_MAY: {
          if (processedDrawIds.includes(slot.id)) break;
          if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }

          const ekstraklasaPairs = activePlayoffDraw?.ekstraklasaPlayoffs;
          const ligaOnePairs = activePlayoffDraw?.ligaOnePlayoffs;
          if (!ekstraklasaPairs || !ligaOnePairs || ekstraklasaPairs.length < 2 || ligaOnePairs.length < 2) { break; }

          const e0home = clubs.find(c => c.id === ekstraklasaPairs[0].homeId);
          const e0away = clubs.find(c => c.id === ekstraklasaPairs[0].awayId);
          const e1home = clubs.find(c => c.id === ekstraklasaPairs[1].homeId);
          const e1away = clubs.find(c => c.id === ekstraklasaPairs[1].awayId);
          const l0home = clubs.find(c => c.id === ligaOnePairs[0].homeId);
          const l0away = clubs.find(c => c.id === ligaOnePairs[0].awayId);
          const l1home = clubs.find(c => c.id === ligaOnePairs[1].homeId);
          const l1away = clubs.find(c => c.id === ligaOnePairs[1].awayId);

          if (!e0home || !e0away || !e1home || !e1away || !l0home || !l0away || !l1home || !l1away) { break; }

          // Sekcja przygotowania składów barażowych — kopia silnika pucharowego potrzebuje lineupów
          const e0Lineups = BackgroundPlayOffMatchPolishCup.preparePlayoffLineups(e0home, e0away, players, lineups, userTeamId, coaches);
          const e1Lineups = BackgroundPlayOffMatchPolishCup.preparePlayoffLineups(e1home, e1away, players, lineups, userTeamId, coaches);
          const l0Lineups = BackgroundPlayOffMatchPolishCup.preparePlayoffLineups(l0home, l0away, players, lineups, userTeamId, coaches);
          const l1Lineups = BackgroundPlayOffMatchPolishCup.preparePlayoffLineups(l1home, l1away, players, lineups, userTeamId, coaches);

          const dateSeed31 = dateToProcess.getTime();

          // Sprawdzenie czy drużyna gracza gra w półfinale
          const userInE0 = userTeamId && (e0home.id === userTeamId || e0away.id === userTeamId);
          const userInE1 = userTeamId && (e1home.id === userTeamId || e1away.id === userTeamId);
          const userInL0 = userTeamId && (l0home.id === userTeamId || l0away.id === userTeamId);
          const userInL1 = userTeamId && (l1home.id === userTeamId || l1away.id === userTeamId);
          const userInSemi = userInE0 || userInE1 || userInL0 || userInL1;

          if (userInSemi) {
            // Symuluj wszystkie mecze OPRÓCZ meczu gracza
            const simsE0 = !userInE0 ? BackgroundPlayOffMatchPolishCup.simulatePlayoffMatch(dateToProcess, e0home, e0away, players, e0Lineups, dateSeed31 + 1, 'PROMOTION_EKSTRAKLASA_SEMI_0') : null;
            const simsE1 = !userInE1 ? BackgroundPlayOffMatchPolishCup.simulatePlayoffMatch(dateToProcess, e1home, e1away, players, e1Lineups, dateSeed31 + 2, 'PROMOTION_EKSTRAKLASA_SEMI_1') : null;
            const simsL0 = !userInL0 ? BackgroundPlayOffMatchPolishCup.simulatePlayoffMatch(dateToProcess, l0home, l0away, players, l0Lineups, dateSeed31 + 3, 'PROMOTION_LIGAONE_SEMI_0') : null;
            const simsL1 = !userInL1 ? BackgroundPlayOffMatchPolishCup.simulatePlayoffMatch(dateToProcess, l1home, l1away, players, l1Lineups, dateSeed31 + 4, 'PROMOTION_LIGAONE_SEMI_1') : null;
            const otherSemiResults: Partial<PromotionPlayoffSemiResults> = {};
            if (simsE0) otherSemiResults.ekstraklasaSemi0 = simsE0;
            if (simsE1) otherSemiResults.ekstraklasaSemi1 = simsE1;
            if (simsL0) otherSemiResults.ligaOneSemi0 = simsL0;
            if (simsL1) otherSemiResults.ligaOneSemi1 = simsL1;
            const playerHome = userInE0 ? e0home : userInE1 ? e1home : userInL0 ? l0home : l1home;
            const playerAway = userInE0 ? e0away : userInE1 ? e1away : userInL0 ? l0away : l1away;
            const playerLeague = (userInE0 || userInE1) ? 'EKSTRAKLASA' : 'LIGA_ONE' as 'EKSTRAKLASA' | 'LIGA_ONE';
            const playerPairIdx = (userInE0 || userInL0) ? 0 : 1;
            setActivePlayoffMatch({
              matchType: 'PROMOTION_SEMI',
              homeClub: playerHome,
              awayClub: playerAway,
              userSide: playerHome.id === userTeamId ? 'HOME' : 'AWAY',
              pairIndex: playerPairIdx,
              leagueContext: playerLeague,
              otherPromotionSemiResults: otherSemiResults,
            });
            setProcessedDrawIds(prev => [...prev, slot.id]);
            navigateTo(ViewState.PRE_MATCH_PLAYOFF_STUDIO);
          } else {
            const ekstraklasaSemi0 = BackgroundPlayOffMatchPolishCup.simulatePlayoffMatch(dateToProcess, e0home, e0away, players, e0Lineups, dateSeed31 + 1, 'PROMOTION_EKSTRAKLASA_SEMI_0');
            const ekstraklasaSemi1 = BackgroundPlayOffMatchPolishCup.simulatePlayoffMatch(dateToProcess, e1home, e1away, players, e1Lineups, dateSeed31 + 2, 'PROMOTION_EKSTRAKLASA_SEMI_1');
            const ligaOneSemi0 = BackgroundPlayOffMatchPolishCup.simulatePlayoffMatch(dateToProcess, l0home, l0away, players, l0Lineups, dateSeed31 + 3, 'PROMOTION_LIGAONE_SEMI_0');
            const ligaOneSemi1 = BackgroundPlayOffMatchPolishCup.simulatePlayoffMatch(dateToProcess, l1home, l1away, players, l1Lineups, dateSeed31 + 4, 'PROMOTION_LIGAONE_SEMI_1');
            setPromotionPlayoffSemiResults({ ekstraklasaSemi0, ekstraklasaSemi1, ligaOneSemi0, ligaOneSemi1 });
            setProcessedDrawIds(prev => [...prev, slot.id]);
            navigateTo(ViewState.PROMOTION_PLAYOFF_SEMI_VIEW);
          }
          skipDayAdvance = true; break;
        }

        // â”€â”€ BARAÅ»E O AWANS â€” FINAÅY (4 czerwca) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        case CompetitionType.PROMOTION_PLAYOFF_4_JUNE: {
          if (processedDrawIds.includes(slot.id)) break;
          if (isAutoJumping) { setTargetJumpTime(null); navigateTo(ViewState.DASHBOARD); skipDayAdvance = true; break; }

          const semiResults = promotionPlayoffSemiResults;
          const playoffDraw = activePlayoffDraw;
          if (!semiResults || !playoffDraw) { break; }
          if (playoffDraw.ekstraklasaPlayoffs.length < 2 || playoffDraw.ligaOnePlayoffs.length < 2) { break; }

          const ekstraklasaFinalist0Id = semiResults.ekstraklasaSemi0.winnerId;
          const ekstraklasaFinalist1Id = semiResults.ekstraklasaSemi1.winnerId;
          const ekstraklasaFinalist0Pos = playoffDraw.ekstraklasaPlayoffs[0].homeId === ekstraklasaFinalist0Id
            ? playoffDraw.ekstraklasaPlayoffs[0].homePos
            : playoffDraw.ekstraklasaPlayoffs[0].awayPos;
          const ekstraklasaFinalist1Pos = playoffDraw.ekstraklasaPlayoffs[1].homeId === ekstraklasaFinalist1Id
            ? playoffDraw.ekstraklasaPlayoffs[1].homePos
            : playoffDraw.ekstraklasaPlayoffs[1].awayPos;
          const ekstraklasaClub0 = clubs.find(c => c.id === ekstraklasaFinalist0Id);
          const ekstraklasaClub1 = clubs.find(c => c.id === ekstraklasaFinalist1Id);

          const ligaOneFinalist0Id = semiResults.ligaOneSemi0.winnerId;
          const ligaOneFinalist1Id = semiResults.ligaOneSemi1.winnerId;
          const ligaOneFinalist0Pos = playoffDraw.ligaOnePlayoffs[0].homeId === ligaOneFinalist0Id
            ? playoffDraw.ligaOnePlayoffs[0].homePos
            : playoffDraw.ligaOnePlayoffs[0].awayPos;
          const ligaOneFinalist1Pos = playoffDraw.ligaOnePlayoffs[1].homeId === ligaOneFinalist1Id
            ? playoffDraw.ligaOnePlayoffs[1].homePos
            : playoffDraw.ligaOnePlayoffs[1].awayPos;
          const ligaOneClub0 = clubs.find(c => c.id === ligaOneFinalist0Id);
          const ligaOneClub1 = clubs.find(c => c.id === ligaOneFinalist1Id);

          if (!ekstraklasaClub0 || !ekstraklasaClub1 || !ligaOneClub0 || !ligaOneClub1) { break; }

          const ekstraklasaHomeClub = ekstraklasaFinalist0Pos < ekstraklasaFinalist1Pos ? ekstraklasaClub0 : ekstraklasaClub1;
          const ekstraklasaAwayClub = ekstraklasaHomeClub.id === ekstraklasaClub0.id ? ekstraklasaClub1 : ekstraklasaClub0;
          const ligaOneHomeClub = ligaOneFinalist0Pos < ligaOneFinalist1Pos ? ligaOneClub0 : ligaOneClub1;
          const ligaOneAwayClub = ligaOneHomeClub.id === ligaOneClub0.id ? ligaOneClub1 : ligaOneClub0;

          // Sekcja przygotowania składów finałowych — silnik playoff korzysta ze składów AI lub istniejących lineupów
          const ekstraklasaFinalLineups = BackgroundPlayOffMatchPolishCup.preparePlayoffLineups(ekstraklasaHomeClub, ekstraklasaAwayClub, players, lineups, userTeamId, coaches);
          const ligaOneFinalLineups = BackgroundPlayOffMatchPolishCup.preparePlayoffLineups(ligaOneHomeClub, ligaOneAwayClub, players, lineups, userTeamId, coaches);

          const dateSeed4June = dateToProcess.getTime();

          // Sprawdzenie czy drużyna gracza gra w finale
          const userInEFinal = userTeamId && (ekstraklasaHomeClub.id === userTeamId || ekstraklasaAwayClub.id === userTeamId);
          const userInLFinal = userTeamId && (ligaOneHomeClub.id === userTeamId || ligaOneAwayClub.id === userTeamId);

          if (userInEFinal || userInLFinal) {
            const playerHome = userInEFinal ? ekstraklasaHomeClub : ligaOneHomeClub;
            const playerAway = userInEFinal ? ekstraklasaAwayClub : ligaOneAwayClub;
            const playerLeague: 'EKSTRAKLASA' | 'LIGA_ONE' = userInEFinal ? 'EKSTRAKLASA' : 'LIGA_ONE';
            // Symuluj drugi finał (bez gracza)
            const otherHomeClub = userInEFinal ? ligaOneHomeClub : ekstraklasaHomeClub;
            const otherAwayClub = userInEFinal ? ligaOneAwayClub : ekstraklasaAwayClub;
            const otherLineups = BackgroundPlayOffMatchPolishCup.preparePlayoffLineups(otherHomeClub, otherAwayClub, players, lineups, userTeamId, coaches);
            const otherFinal = BackgroundPlayOffMatchPolishCup.simulatePlayoffMatch(dateToProcess, otherHomeClub, otherAwayClub, players, otherLineups, dateSeed4June + (userInEFinal ? 2 : 1), userInEFinal ? 'PROMOTION_LIGAONE_FINAL' : 'PROMOTION_EKSTRAKLASA_FINAL');
            setActivePlayoffMatch({
              matchType: 'PROMOTION_FINAL',
              homeClub: playerHome,
              awayClub: playerAway,
              userSide: playerHome.id === userTeamId ? 'HOME' : 'AWAY',
              pairIndex: 0,
              leagueContext: playerLeague,
              otherPromotionFinalResult: otherFinal,
            });
            setProcessedDrawIds(prev => [...prev, slot.id]);
            navigateTo(ViewState.PRE_MATCH_PLAYOFF_STUDIO);
          } else {
            const ekstraklasaFinal = BackgroundPlayOffMatchPolishCup.simulatePlayoffMatch(dateToProcess, ekstraklasaHomeClub, ekstraklasaAwayClub, players, ekstraklasaFinalLineups, dateSeed4June + 1, 'PROMOTION_EKSTRAKLASA_FINAL');
            const ligaOneFinal = BackgroundPlayOffMatchPolishCup.simulatePlayoffMatch(dateToProcess, ligaOneHomeClub, ligaOneAwayClub, players, ligaOneFinalLineups, dateSeed4June + 2, 'PROMOTION_LIGAONE_FINAL');
            setPromotionPlayoffFinalResults({ ekstraklasaFinal, ligaOneFinal });
            setProcessedDrawIds(prev => [...prev, slot.id]);
            navigateTo(ViewState.PROMOTION_PLAYOFF_FINAL_VIEW);
          }
          skipDayAdvance = true; break;
        }

              case CompetitionType.OFF_SEASON: {
          setTargetJumpTime(null);

          // ── Podsumowanie sezonu (wysyłane raz, 30 czerwca) ─────────────────
          if (userTeamId) {
            const currentYear = dateToProcess.getFullYear();
            const seasonSummaryKey = `SEASON_SUMMARY_${currentYear}`;
            if (!sentMailIdsRef.current.has(seasonSummaryKey)) {
              const standingsL1 = [...clubs]
                .filter(c => c.leagueId === 'L_PL_1')
                .sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference || b.stats.goalsFor - a.stats.goalsFor);
              const standingsL2 = [...clubs].filter(c => c.leagueId === 'L_PL_2')
                .sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
              const standingsL3 = [...clubs].filter(c => c.leagueId === 'L_PL_3')
                .sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);

              const getAwardsLocal = (leagueId: string, leagueName: string) => {
                const rows = LeagueStatsService.getPlayersForLeague(leagueId, clubs, players);
                const topScorer = LeagueStatsService.getTopScorers(rows, 1)[0]?.player;
                const topAssistant = LeagueStatsService.getTopAssists(rows, 1)[0]?.player;
                return {
                  leagueName,
                  topScorer: { name: topScorer ? `${topScorer.firstName} ${topScorer.lastName}` : 'Brak', goals: topScorer?.stats.goals || 0 },
                  topAssistant: { name: topAssistant ? `${topAssistant.firstName} ${topAssistant.lastName}` : 'Brak', assists: topAssistant?.stats.assists || 0 }
                };
              };

              const summaryDataLocal: SeasonSummaryData = {
                year: currentYear - 1,
                championName: standingsL1[0]?.name || 'Nieznany',
                promotions: [
                  { from: '1. Liga', to: 'Ekstraklasy', teams: standingsL2.slice(0, 2).map(t => t.name) },
                  { from: '2. Liga', to: '1. Ligi', teams: standingsL3.slice(0, 2).map(t => t.name) },
                  { from: 'Regionalna', to: '2. Ligi', teams: [] }
                ],
                relegations: [
                  { from: 'Ekstraklasy', to: '1. Ligi', teams: standingsL1.slice(15, 18).map(t => t.name) },
                  { from: '1. Ligi', to: '2. Ligi', teams: standingsL2.slice(15, 18).map(t => t.name) },
                  { from: '2. Ligi', to: 'Regionalnej', teams: standingsL3.slice(14, 18).map(t => t.name) }
                ],
                leagueAwards: [
                  getAwardsLocal('L_PL_1', 'Ekstraklasa'),
                  getAwardsLocal('L_PL_2', '1. Liga'),
                  getAwardsLocal('L_PL_3', '2. Liga')
                ]
              };

              const summaryMail = MailService.generateSeasonSummaryMail(summaryDataLocal);
              sentMailIdsRef.current.add(seasonSummaryKey);
              setMessages(prev => [summaryMail, ...prev]);
            }
          }

          navigateTo(ViewState.DASHBOARD);
          return; // Data NIE zostaje przesunięta — gracz musi potwierdzić
        }

        default:
          break;
      }
    }

    // ── Puchar Polski / Superpuchar / LM / LE: background — zatrzymaj auto-skok ─────
    // Gracz musi ręcznie kliknąć przycisk na Dashboardzie (wyniki).
    if (isAutoJumping &&
        primaryEvent?.participation === 'background' &&
        (primaryEvent.slot.competition === CompetitionType.POLISH_CUP ||
         primaryEvent.slot.competition === CompetitionType.SUPER_CUP ||
         primaryEvent.slot.competition === CompetitionType.CL_R1Q ||
         primaryEvent.slot.competition === CompetitionType.CL_R1Q_RETURN ||
         primaryEvent.slot.competition === CompetitionType.CL_R2Q ||
         primaryEvent.slot.competition === CompetitionType.CL_R2Q_RETURN ||
         primaryEvent.slot.competition === CompetitionType.CL_GROUP_STAGE ||
         primaryEvent.slot.competition === CompetitionType.CL_R16 ||
         primaryEvent.slot.competition === CompetitionType.CL_R16_RETURN ||
         primaryEvent.slot.competition === CompetitionType.CL_QF ||
         primaryEvent.slot.competition === CompetitionType.CL_QF_RETURN ||
         primaryEvent.slot.competition === CompetitionType.CL_SF ||
         primaryEvent.slot.competition === CompetitionType.CL_SF_RETURN ||
         primaryEvent.slot.competition === CompetitionType.EL_R1Q ||
         primaryEvent.slot.competition === CompetitionType.EL_R1Q_RETURN ||
         primaryEvent.slot.competition === CompetitionType.EL_R2Q ||
         primaryEvent.slot.competition === CompetitionType.EL_R2Q_RETURN ||
         primaryEvent.slot.competition === CompetitionType.EL_GROUP_STAGE ||
         primaryEvent.slot.competition === CompetitionType.CONF_R1Q ||
         primaryEvent.slot.competition === CompetitionType.CONF_R1Q_RETURN ||
         primaryEvent.slot.competition === CompetitionType.CONF_R2Q ||
         primaryEvent.slot.competition === CompetitionType.CONF_R2Q_RETURN ||
         primaryEvent.slot.competition === CompetitionType.CONF_GROUP_STAGE ||
         primaryEvent.slot.competition === CompetitionType.EL_R16 ||
         primaryEvent.slot.competition === CompetitionType.EL_R16_RETURN ||
         primaryEvent.slot.competition === CompetitionType.EL_QF ||
         primaryEvent.slot.competition === CompetitionType.EL_QF_RETURN ||
         primaryEvent.slot.competition === CompetitionType.EL_SF ||
         primaryEvent.slot.competition === CompetitionType.EL_SF_RETURN ||
         primaryEvent.slot.competition === CompetitionType.EL_FINAL ||
         primaryEvent.slot.competition === CompetitionType.CONF_R16 ||
         primaryEvent.slot.competition === CompetitionType.CONF_R16_RETURN ||
         primaryEvent.slot.competition === CompetitionType.CONF_QF ||
         primaryEvent.slot.competition === CompetitionType.CONF_QF_RETURN ||
         primaryEvent.slot.competition === CompetitionType.CONF_SF ||
         primaryEvent.slot.competition === CompetitionType.CONF_SF_RETURN ||
         primaryEvent.slot.competition === CompetitionType.CONF_FINAL)) {
      setTargetJumpTime(null);
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. GUARD + SYMULACJA + FINANSE — wykonywane ZAWSZE, niezależnie od eventu dnia.
    //    Dzięki temu pensje, squad review i inne zadania dnia nie są pomijane
    //    gdy tego samego dnia jest losowanie (LE/LM/PP) lub mecz.
    // ─────────────────────────────────────────────────────────────────────────
    const dateKey = dateToProcess.toDateString();
    if (lastProcessedLeagueDateRef.current === dateKey) {
      DebugLoggerService.log('GUARD', `ZABLOKOWANO advanceDay dla: ${dateKey} (stale closure)`);
      return;
    }
    DebugLoggerService.log('GUARD', `advanceDay PRZECHODZI dla: ${dateKey}`);
    lastProcessedLeagueDateRef.current = dateKey;

    // ── SPARINGI AI: GENEROWANIE PAR (3 lipca) ────────────────────────────────
    if (dateToProcess.getMonth() === 6 && dateToProcess.getDate() === 3 && aiFriendlyPairs.length === 0) {
      const busyClubIds = new Set<string>(
        globalFixtures
          .filter(f => {
            if (f.leagueId !== CompetitionType.FRIENDLY) return false;
            const fDate = f.date instanceof Date ? f.date : new Date(f.date);
            return fDate.getMonth() === 6 && (fDate.getDate() === 8 || fDate.getDate() === 9);
          })
          .flatMap(f => [f.homeTeamId, f.awayTeamId])
      );
      const pairs = AiFriendlyGeneratorService.generate(clubs, userTeamId, dateToProcess.getFullYear(), busyClubIds);
      setAiFriendlyPairs(pairs);
    }

    // ── SPARINGI AI: SYMULACJA W TLE (8 i 9 lipca) ───────────────────────────
    if (dateToProcess.getMonth() === 6 && (dateToProcess.getDate() === 8 || dateToProcess.getDate() === 9)) {
      const dayDate = dateToProcess.getDate();
      const alreadySimulated = aiFriendlyReports.some(r => {
        const d = r.date instanceof Date ? r.date : new Date(r.date);
        return d.getMonth() === 6 && d.getDate() === dayDate;
      });
      if (!alreadySimulated && aiFriendlyPairs.length > 0) {
        const dayPairs = aiFriendlyPairs.filter(p => {
          const d = p.date instanceof Date ? p.date : new Date(p.date);
          return d.getDate() === dayDate;
        });
        const newReports: AiFriendlyMatchReport[] = [];
        dayPairs.forEach((pair, idx) => {
          const homePlayers = getOrGenerateSquad(pair.homeTeamId);
          const awayPlayers = getOrGenerateSquad(pair.awayTeamId);
          if (homePlayers.length < 11 || awayPlayers.length < 11) return;
          const homeClub = clubs.find(c => c.id === pair.homeTeamId);
          const awayClub = clubs.find(c => c.id === pair.awayTeamId);
          const homeCoach = homeClub?.coachId ? (coaches[homeClub.coachId] ?? null) : null;
          const awayCoach = awayClub?.coachId ? (coaches[awayClub.coachId] ?? null) : null;
          const pairSeed = sessionSeed + pair.id.length + idx * 137;
          newReports.push(AiFriendlyMatchSimulator.simulate(pair, homePlayers, awayPlayers, homeCoach, awayCoach, pairSeed));
        });
        if (newReports.length > 0) {
          setAiFriendlyReports(prev => [...prev, ...newReports]);
          newReports.forEach(r => {
            const cardTypeMap: Record<string, 'YELLOW' | 'RED' | 'SECOND_YELLOW'> = {
              YELLOW_CARD: 'YELLOW',
              RED_CARD: 'RED',
              SECOND_YELLOW: 'SECOND_YELLOW',
            };
            MatchHistoryService.logMatch({
              matchId: r.pairId,
              date: (r.date instanceof Date ? r.date : new Date(r.date)).toISOString(),
              season: seasonNumber,
              competition: 'FRIENDLY',
              homeTeamId: r.homeTeamId,
              awayTeamId: r.awayTeamId,
              homeScore: r.homeScore,
              awayScore: r.awayScore,
              addedTime: r.extraTime,
              goals: r.scorers.map(s => ({
                playerId: s.playerId,
                playerName: s.playerName,
                minute: s.minute,
                teamId: s.teamId,
                isPenalty: s.isPenalty,
                assistantId: s.assistId,
                assistantName: s.assistName,
                isMiss: s.isMiss,
              })),
              cards: r.cards.map(c => ({
                playerId: c.playerId,
                playerName: c.playerName,
                minute: c.minute,
                teamId: c.teamId,
                type: cardTypeMap[c.type] ?? 'YELLOW',
              })),
              substitutions: r.substitutions.map(s => ({
                playerOutId: s.playerOutId,
                playerOutName: s.playerOutName,
                playerInId: s.playerInId,
                playerInName: s.playerInName,
                minute: s.minute,
                teamId: s.teamId,
              })),
              injuries: r.injuries.map(i => ({
                playerId: i.playerId,
                playerName: i.playerName,
                minute: i.minute,
                teamId: i.teamId,
                severity: i.severity as InjurySeverity,
                days: i.days,
                type: i.type,
              })),
              ratings: r.ratings,
              homeTacticId: r.homeTacticId,
              awayTacticId: r.awayTacticId,
              homeLineup: r.homeStartingXI,
              awayLineup: r.awayStartingXI,
            });
          });
          const dateLabel = `${dayDate} ${dayDate === 8 ? 'lipca' : 'lipca'}`;
          const lines = newReports.map(r => {
            const hClub = clubs.find(c => c.id === r.homeTeamId);
            const aClub = clubs.find(c => c.id === r.awayTeamId);
            const hName = hClub?.name ?? r.homeTeamId;
            const aName = aClub?.name ?? r.awayTeamId;
            return `${hName} ${r.homeScore}–${r.awayScore} ${aName}`;
          });
          const friendlyNewsMail: MailMessage = {
            id: `MAIL_AI_FRIENDLY_${dayDate}_${dateToProcess.getFullYear()}`,
            sender: 'Serwis Sportowy',
            role: 'Redakcja',
            subject: `Wyniki sparingów — ${dateLabel}`,
            body: `Wyniki sparingów z dnia ${dateLabel}:\n\n${lines.join('\n')}`,
            date: new Date(dateToProcess),
            isRead: false,
            type: MailType.MEDIA,
            priority: 20,
            metadata: { type: 'AI_FRIENDLY_REPORT_LINK' },
          };
          prependUniqueMessages([friendlyNewsMail]);
        }
      }
    }

    // ── OBÓZ ZIMOWY: ZAPROSZENIE (11 grudnia) ────────────────────────────────
    if (hasCompetitionToday(CompetitionType.WINTER_CAMP_INVITE) && userTeamId && !isResigned) {
      const campInviteKey = `WINTER_CAMP_INVITE_${seasonNumber}`;
      if (!sentMailIdsRef.current.has(campInviteKey)) {
        sentMailIdsRef.current.add(campInviteKey);
        const priceSeed = sessionSeed + dateToProcess.getTime() % 100000;
        const prices = generateLocationPrices(priceSeed);
        const spaCost = generateSpaCost(priceSeed);
        setClubs(prev => prev.map(c => c.id === userTeamId ? {
          ...c,
          winterCamp: {
            location: null,
            cost: 0,
            program: null,
            intensity: null,
            spaOption: false,
            isDeclined: false,
            locationPrices: prices,
            spaCost,
            inviteSent: true,
            programChosen: false,
            effectsApplied: false,
          },
        } : c));
        const inviteMail = MailService.createFromTemplate('winter_camp_invite', { CLUB: clubs.find(c => c.id === userTeamId)?.name || '' });
        if (inviteMail) {
          inviteMail.date = new Date(dateToProcess);
          inviteMail.metadata = { type: 'WINTER_CAMP_INVITE', expiryDate: new Date(dateToProcess.getFullYear(), 11, 23).toISOString() };
          setMessages(prev => [inviteMail, ...prev]);
        }
        setWinterCampInvitePending(true);
        setTargetJumpTime(null);
      }
    }

    // ── OBÓZ ZIMOWY: TERMIN WYBORU (23 grudnia) — auto-odrzucenie ────────────
    if (dateToProcess.getMonth() === 11 && dateToProcess.getDate() === 23 && userTeamId && !isResigned) {
      const userClub = clubs.find(c => c.id === userTeamId);
      if (userClub?.winterCamp && !userClub.winterCamp.isDeclined && userClub.winterCamp.location === null) {
        setClubs(prev => prev.map(c => c.id === userTeamId && c.winterCamp
          ? { ...c, winterCamp: { ...c.winterCamp, isDeclined: true } }
          : c));
        setWinterCampInvitePending(false);
      }
    }

    // ── OBÓZ ZIMOWY: PROGRAM (22 grudnia) ───────────────────────────────────
    if (hasCompetitionToday(CompetitionType.WINTER_CAMP_PROGRAM) && userTeamId && !isResigned) {
      const campProgramKey = `WINTER_CAMP_PROGRAM_${seasonNumber}`;
      if (!sentMailIdsRef.current.has(campProgramKey)) {
        const userClub = clubs.find(c => c.id === userTeamId);
        if (userClub?.winterCamp && !userClub.winterCamp.isDeclined && userClub.winterCamp.location !== null) {
          sentMailIdsRef.current.add(campProgramKey);
          const squad = players[userTeamId] || [];
          const suggestion = getAssistantSuggestion(squad, userClub);
          const templateId = suggestion.program === 'tactical' ? 'winter_camp_assistant_tactical' : 'winter_camp_assistant_fitness';
          const assistantMail = MailService.createFromTemplate(templateId, { CLUB: userClub.name });
          if (assistantMail) {
            assistantMail.date = new Date(dateToProcess);
            setMessages(prev => [assistantMail, ...prev]);
          }
          setWinterCampProgramPending(true);
          setTargetJumpTime(null);
        }
      }
    }

    // ── OBÓZ ZIMOWY: ZAKOŃCZENIE (15 stycznia) ───────────────────────────────
    if (hasCompetitionToday(CompetitionType.WINTER_CAMP_END) && userTeamId && !isResigned) {
      const campEndKey = `WINTER_CAMP_END_${seasonNumber}`;
      if (!sentMailIdsRef.current.has(campEndKey)) {
        sentMailIdsRef.current.add(campEndKey);
        const userClub = clubs.find(c => c.id === userTeamId);
        if (userClub?.winterCamp && !userClub.winterCamp.effectsApplied) {
          const squad = players[userTeamId] || [];
          const effectSeed = sessionSeed + dateToProcess.getTime() % 100000 + 777;
          const { effects, moraleDelta } = applyWinterCampEffects(squad, userClub.winterCamp, effectSeed);
          const injuredCount = effects.filter(e => e.injured).length;
          const improvedCount = effects.filter(e => Object.keys(e.attrChanges).some(k => (e.attrChanges as any)[k] > (squad.find(p => p.id === e.playerId)?.attributes as any)[k])).length;
          const locationLabel = userClub.winterCamp.location
            ? ({ turkey: 'Turcja', cyprus: 'Cypr', greece: 'Grecja', poland: 'Polska' } as Record<string,string>)[userClub.winterCamp.location]
            : 'Polska';
          const programLabel = userClub.winterCamp.program
            ? ({ fitness: 'Kondycyjny', tactical: 'Taktyczny', technical: 'Techniczny', strength: 'Siłowy', recovery: 'Regeneracyjny' } as Record<string,string>)[userClub.winterCamp.program]
            : 'Brak';
          const intensityLabel = userClub.winterCamp.intensity
            ? ({ light: 'Lekka', moderate: 'Umiarkowana', intense: 'Intensywna' } as Record<string,string>)[userClub.winterCamp.intensity]
            : 'Brak';
          const moraleSign = moraleDelta >= 0 ? `+${moraleDelta}` : `${moraleDelta}`;
          const reportTemplateId = (userClub.winterCamp.isDeclined || !userClub.winterCamp.programChosen) ? 'winter_camp_report_declined' : 'winter_camp_report_success';
          const reportMail = MailService.createFromTemplate(reportTemplateId, {
            CLUB: userClub.name,
            CAMP_LOCATION: locationLabel,
            CAMP_PROGRAM: programLabel,
            CAMP_INTENSITY: intensityLabel,
            IMPROVED_COUNT: String(improvedCount),
            INJURY_COUNT: String(injuredCount),
            MORALE_CHANGE: moraleSign,
          });
          if (reportMail) {
            reportMail.date = new Date(dateToProcess);
            setMessages(prev => [reportMail, ...prev]);
          }
          setPlayers(prev => {
            const updatedSquad = (prev[userTeamId] || []).map(player => {
              const effect = effects.find(e => e.playerId === player.id);
              if (!effect) return player;
              const newAttrs = { ...player.attributes, ...effect.attrChanges };
              const newDebt = Math.max(0, Math.min(100, (player.fatigueDebt ?? 0) + effect.fatigueDebtDelta));
              const newCondition = Math.max(1, Math.min(100, player.condition + (effect.conditionDelta ?? 0)));
              if (effect.injured) {
                return { ...player, attributes: newAttrs, fatigueDebt: newDebt, condition: newCondition, health: { status: 'INJURED' as any, injury: { type: 'Kontuzja obozowa', daysRemaining: 7 + Math.floor(Math.random() * 8), severity: 'LIGHT' as any, injuryDate: dateToProcess.toISOString().split('T')[0], totalDays: 7 + Math.floor(Math.random() * 8) } } };
              }
              return { ...player, attributes: newAttrs, fatigueDebt: newDebt, condition: newCondition };
            });
            return { ...prev, [userTeamId]: updatedSquad };
          });
          setClubs(prev => prev.map(c => {
            if (c.id !== userTeamId) return c;
            const campCost = c.winterCamp?.cost ?? 0;
            const newBudget = Math.max(0, c.budget - campCost);
            const financeEntry = campCost > 0 ? {
              id: Math.random().toString(36).substr(2, 9),
              date: dateToProcess.toISOString().split('T')[0],
              amount: -campCost,
              type: 'EXPENSE' as const,
              description: `Obóz zimowy (${locationLabel})`,
              previousBalance: c.budget,
            } : null;
            return {
              ...c,
              budget: newBudget,
              morale: Math.min(100, Math.max(0, (c.morale ?? 70) + moraleDelta)),
              financeHistory: financeEntry ? [financeEntry, ...(c.financeHistory || [])].slice(0, 50) : c.financeHistory,
              winterCamp: c.winterCamp ? { ...c.winterCamp, effectsApplied: true } : c.winterCamp,
            };
          }));
        }
      }
    }

    // ── OBÓZ LETNI: ZAPROSZENIE (19 maja) ───────────────────────────────────
    if (hasCompetitionToday(CompetitionType.SUMMER_CAMP_INVITE) && userTeamId && !isResigned) {
      const campInviteKey = `SUMMER_CAMP_INVITE_${seasonNumber}`;
      if (!sentMailIdsRef.current.has(campInviteKey)) {
        sentMailIdsRef.current.add(campInviteKey);
        const priceSeed = sessionSeed + dateToProcess.getTime() % 100000 + 1000;
        const prices = generateSummerLocationPrices(priceSeed);
        const spaCost = generateSummerSpaCost(priceSeed);
        setClubs(prev => prev.map(c => c.id === userTeamId ? {
          ...c,
          summerCamp: {
            location: null,
            cost: 0,
            program: null,
            intensity: null,
            spaOption: false,
            isDeclined: false,
            locationPrices: prices,
            spaCost,
            inviteSent: true,
            programChosen: false,
            effectsApplied: false,
          },
        } : c));
        const inviteMail = MailService.createFromTemplate('summer_camp_invite', { CLUB: clubs.find(c => c.id === userTeamId)?.name || '' });
        if (inviteMail) setMessages(prev => [inviteMail, ...prev]);
        setSummerCampInvitePending(true);
      }
    }

    // ── OBÓZ LETNI: PROGRAM (5 czerwca) ─────────────────────────────────────
    if (hasCompetitionToday(CompetitionType.SUMMER_CAMP_PROGRAM) && userTeamId && !isResigned) {
      const campProgramKey = `SUMMER_CAMP_PROGRAM_${seasonNumber}`;
      if (!sentMailIdsRef.current.has(campProgramKey)) {
        const userClub = clubs.find(c => c.id === userTeamId);
        if (userClub?.summerCamp && !userClub.summerCamp.isDeclined && userClub.summerCamp.location !== null) {
          sentMailIdsRef.current.add(campProgramKey);
          const squad = players[userTeamId] || [];
          const suggestion = getSummerAssistantSuggestion(squad, userClub);
          const templateId = suggestion.program === 'tactical' ? 'summer_camp_assistant_tactical' : 'summer_camp_assistant_fitness';
          const assistantMail = MailService.createFromTemplate(templateId, { CLUB: userClub.name });
          if (assistantMail) setMessages(prev => [assistantMail, ...prev]);
          setSummerCampProgramPending(true);
        }
      }
    }

    // ── OBÓZ LETNI: ZAKOŃCZENIE (28 czerwca) ────────────────────────────────
    if (hasCompetitionToday(CompetitionType.SUMMER_CAMP_END) && userTeamId && !isResigned) {
      const campEndKey = `SUMMER_CAMP_END_${seasonNumber}`;
      if (!sentMailIdsRef.current.has(campEndKey)) {
        sentMailIdsRef.current.add(campEndKey);
        const userClub = clubs.find(c => c.id === userTeamId);
        if (userClub?.summerCamp && !userClub.summerCamp.effectsApplied) {
          const squad = players[userTeamId] || [];
          const effectSeed = sessionSeed + dateToProcess.getTime() % 100000 + 888;
          const { effects, moraleDelta } = applySummerCampEffects(squad, userClub.summerCamp, effectSeed);
          const injuredCount = effects.filter(e => e.injured).length;
          const improvedCount = effects.filter(e => Object.keys(e.attrChanges).some(k => (e.attrChanges as any)[k] > (squad.find(p => p.id === e.playerId)?.attributes as any)[k])).length;
          const locationLabel = userClub.summerCamp.location
            ? ({ poland: 'Polska', czech_republic: 'Czechy', slovakia: 'Słowacja', austria: 'Austria', switzerland: 'Szwajcaria' } as Record<string,string>)[userClub.summerCamp.location]
            : 'Polska';
          const programLabel = userClub.summerCamp.program
            ? ({ fitness: 'Kondycyjny', tactical: 'Taktyczny', technical: 'Techniczny', strength: 'Siłowy', recovery: 'Regeneracyjny' } as Record<string,string>)[userClub.summerCamp.program]
            : 'Brak';
          const intensityLabel = userClub.summerCamp.intensity
            ? ({ light: 'Lekka', moderate: 'Umiarkowana', intense: 'Intensywna' } as Record<string,string>)[userClub.summerCamp.intensity]
            : 'Brak';
          const moraleSign = moraleDelta >= 0 ? `+${moraleDelta}` : `${moraleDelta}`;
          const reportTemplateId = (userClub.summerCamp.isDeclined || !userClub.summerCamp.programChosen) ? 'summer_camp_report_declined' : 'summer_camp_report_success';
          const reportMail = MailService.createFromTemplate(reportTemplateId, {
            CLUB: userClub.name,
            CAMP_LOCATION: locationLabel,
            CAMP_PROGRAM: programLabel,
            CAMP_INTENSITY: intensityLabel,
            IMPROVED_COUNT: String(improvedCount),
            INJURY_COUNT: String(injuredCount),
            MORALE_CHANGE: moraleSign,
          });
          if (reportMail) setMessages(prev => [reportMail, ...prev]);
          setPlayers(prev => {
            const updatedSquad = (prev[userTeamId] || []).map(player => {
              const effect = effects.find(e => e.playerId === player.id);
              if (!effect) return player;
              const newAttrs = { ...player.attributes, ...effect.attrChanges };
              const newDebt = Math.max(0, Math.min(100, (player.fatigueDebt ?? 0) + effect.fatigueDebtDelta));
              const newCondition = Math.max(1, Math.min(100, player.condition + (effect.conditionDelta ?? 0)));
              if (effect.injured) {
                return { ...player, attributes: newAttrs, fatigueDebt: newDebt, condition: newCondition, health: { status: 'INJURED' as any, injury: { type: 'Kontuzja obozowa', daysRemaining: 7 + Math.floor(Math.random() * 8), severity: 'LIGHT' as any, injuryDate: dateToProcess.toISOString().split('T')[0], totalDays: 7 + Math.floor(Math.random() * 8) } } };
              }
              return { ...player, attributes: newAttrs, fatigueDebt: newDebt, condition: newCondition };
            });
            return { ...prev, [userTeamId]: updatedSquad };
          });
          setClubs(prev => prev.map(c => {
            if (c.id !== userTeamId) return c;
            const campCost = c.summerCamp?.cost ?? 0;
            const newBudget = Math.max(0, c.budget - campCost);
            const financeEntry = campCost > 0 ? {
              id: Math.random().toString(36).substr(2, 9),
              date: dateToProcess.toISOString().split('T')[0],
              amount: -campCost,
              type: 'EXPENSE' as const,
              description: `Obóz letni (${locationLabel})`,
              previousBalance: c.budget,
            } : null;
            return {
              ...c,
              budget: newBudget,
              morale: Math.min(100, Math.max(0, (c.morale ?? 70) + moraleDelta)),
              financeHistory: financeEntry ? [financeEntry, ...(c.financeHistory || [])].slice(0, 50) : c.financeHistory,
              summerCamp: c.summerCamp ? { ...c.summerCamp, effectsApplied: true } : c.summerCamp,
            };
          }));
        }
      }
    }

    let pendingSponsorAmount: number | null = null;
    let pendingSponsorDate: string | null = null;
    let pendingSponsorNextCheckDate: string | null = null;
    let pendingNoSponsorNextCheckDate: string | null = null;

    // ── SPONSOR: losowe sprawdzenie co kilkanaście dni ───────────────────────
    if (userTeamId && !isResigned) {
      const userClub = clubs.find(c => c.id === userTeamId);
      if (userClub && !userClub.sponsorAcquiredThisSeason) {
        const todayStr = dateToProcess.toISOString().split('T')[0];
        const shouldCheck = !userClub.nextSponsorCheckDate || todayStr >= userClub.nextSponsorCheckDate;
        if (shouldCheck) {
          const mgmt = userClub.management;
          const avg = mgmt
            ? (mgmt.cfo.doswiadczenie + mgmt.cfo.zdolnosciMarketingowe +
               mgmt.marketingDirector.doswiadczenie + mgmt.marketingDirector.zdolnosciMarketingowe) / 4
            : 5;
          const probability = FinanceService.getSponsorCheckProbability(avg);
          const nextCheckDays = 10 + Math.floor(Math.random() * 11);
          const nextCheckDate = new Date(dateToProcess);
          nextCheckDate.setDate(nextCheckDate.getDate() + nextCheckDays);
          const nextCheckStr = nextCheckDate.toISOString().split('T')[0];
          if (Math.random() < probability) {
            const amount = FinanceService.getSponsorAmount(avg);
            const sponsorMailKey = `SPONSOR_${seasonNumber}`;
            pendingSponsorAmount = amount;
            pendingSponsorDate = todayStr;
            pendingSponsorNextCheckDate = nextCheckStr;
            if (!sentMailIdsRef.current.has(sponsorMailKey)) {
              sentMailIdsRef.current.add(sponsorMailKey);
              const sponsorMail: MailMessage = {
                id: `sponsor_${Date.now()}`,
                sender: 'Dział Marketingu',
                role: 'Dyrektor Marketingu',
                subject: 'Nowy sponsor klubu',
                body: `Z przyjemnością informujemy, że udało nam się pozyskać nowego sponsora dla naszego klubu. Kontrakt wchodzi w życie natychmiast, a środki zostały zasilone na konto klubu. Szczegóły finansowe dostępne są w wykazie finansowym.`,
                date: new Date(dateToProcess),
                isRead: false,
                type: MailType.MEDIA,
                priority: 2,
              };
              setMessages(prev => [sponsorMail, ...prev]);
            }
          } else {
            pendingNoSponsorNextCheckDate = nextCheckStr;
          }
        }
      }
    }

    // ── Symulacja meczów reprezentacji ──────────────────────────────────────
    // Gdy primaryEvent to NATIONAL_TEAM_MATCH: pobierz mecze z NT_SCHEDULE_BY_YEAR,
    // zasymuluj wyniki w tle i wyświetl je graczowi w NationalTeamResultsView.
    // Data zostanie przesunięta dopiero gdy gracz kliknie "Kontynuuj" w tym widoku.
    // Używamy processedDrawIds żeby nie symulować ponownie przy tym samym slocie.
    if (primaryEvent?.kind === EventKind.NATIONAL_TEAM_MATCH &&
        !processedDrawIds.includes(primaryEvent.slot.id)) {
      const matchDay = getNTMatchDayForDate(dateToProcess, dateToProcess.getFullYear());
      if (matchDay) {
        // Seed = timestamp daty gry — gwarantuje powtarzalność wyników przy tym samym dniu
        const dateSeed = dateToProcess.getTime();

        // ── Baraże MŚ 2026: Losowanie (29 listopada 2025) ──────────────────────
        if (matchDay.eventType === 'WCQ_PLAYOFF_DRAW') {
          const playoffState = WCQPlayoffService.conductDraw(
            nationalTeams,
            dateToProcess.getFullYear(),
            seasonNumber,
            dateSeed
          );
          setWcqPlayoffState(playoffState);
          setProcessedDrawIds(prev => [...prev, primaryEvent.slot.id]);
          setTargetJumpTime(null);
          lastProcessedLeagueDateRef.current = '';
          navigateTo(ViewState.WCQ_PLAYOFF_DRAW_VIEW);
          return;
        }

        // ── Baraże MŚ 2026: Półfinały (17 marca 2026) ─────────────────────────
        if (matchDay.eventType === 'WCQ_PLAYOFF_SF') {
          if (wcqPlayoffState) {
            const updatedState = WCQPlayoffService.simulateSF(wcqPlayoffState, nationalTeams, players, coaches, dateSeed);
            setWcqPlayoffState(updatedState);
            const playoffSfMailKey = `WCQ_PLAYOFF_POLAND_SF_${seasonNumber}`;
            if (!sentMailIdsRef.current.has(playoffSfMailKey)) {
              const playoffSfMail = MailService.generateWCQPlayoffPolandMail(updatedState, 'SF', dateToProcess);
              if (playoffSfMail) {
                sentMailIdsRef.current.add(playoffSfMailKey);
                setMessages(prev => [playoffSfMail, ...prev]);
              }
            }
          }
          setProcessedDrawIds(prev => [...prev, primaryEvent.slot.id]);
          setTargetJumpTime(null);
          lastProcessedLeagueDateRef.current = '';
          navigateTo(ViewState.WCQ_PLAYOFF_RESULTS_SF);
          return;
        }

        // ── Baraże MŚ 2026: Finały (20 marca 2026) ────────────────────────────
        if (matchDay.eventType === 'WCQ_PLAYOFF_FINAL') {
          if (wcqPlayoffState) {
            const updatedState = WCQPlayoffService.simulateFinal(wcqPlayoffState, nationalTeams, players, coaches, dateSeed);
            setWcqPlayoffState(updatedState);
            const playoffFinalMailKey = `WCQ_PLAYOFF_POLAND_FINAL_${seasonNumber}`;
            if (!sentMailIdsRef.current.has(playoffFinalMailKey)) {
              const playoffFinalMail = MailService.generateWCQPlayoffPolandMail(updatedState, 'FINAL', dateToProcess);
              if (playoffFinalMail) {
                sentMailIdsRef.current.add(playoffFinalMailKey);
                setMessages(prev => [playoffFinalMail, ...prev]);
              }
            }
          }
          setProcessedDrawIds(prev => [...prev, primaryEvent.slot.id]);
          setTargetJumpTime(null);
          lastProcessedLeagueDateRef.current = '';
          navigateTo(ViewState.WCQ_PLAYOFF_RESULTS_FINAL);
          return;
        }

        // ── Normalne mecze reprezentacji ─────────────────────────────────────
        const ntSimulation = NationalTeamSimulator.simulateMatchDay(
          matchDay,
          dateSeed,
          dateToProcess,
          nationalTeams,
          players,
          coaches,
          seasonNumber,
          sessionSeed
        );
        setPlayers(ntSimulation.updatedPlayers);
        ntSimulation.matchHistoryEntries.forEach(entry => MatchHistoryService.logMatch(entry));
        setLastNTMatchResults(ntSimulation.results);
        // ── Po ostatniej kolejce fazy grupowej MŚ (17 listopada) → email-podsumowanie ──
        if (dateToProcess.getMonth() === 10 && dateToProcess.getDate() === 17) {
          const wcqSummaryKey = `WCQ_GROUPS_SUMMARY_${seasonNumber}`;
          if (!sentMailIdsRef.current.has(wcqSummaryKey)) {
            sentMailIdsRef.current.add(wcqSummaryKey);
            const wcqSummary = WCQPlayoffService.getWCQGroupSummary(nationalTeams, seasonNumber);
            const wcqMail = MailService.generateWCQGroupsSummaryMail(wcqSummary.groups, wcqSummary.extras, dateToProcess);
            setMessages(prev => [wcqMail, ...prev]);
          }
        }
        setProcessedDrawIds(prev => [...prev, primaryEvent.slot.id]);
        setTargetJumpTime(null);
        navigateTo(ViewState.NATIONAL_TEAM_RESULTS);
        // Zresetuj GUARD — następne wywołanie advanceDay (po kliknięciu "Kontynuuj")
        // musi przejść i przesunąć datę
        lastProcessedLeagueDateRef.current = '';
        return;
      }
    }

    // ── LOSOWANIE MISTRZOSTW ŚWIATA (12 Grudnia roku poprzedzającego MŚ) ─────
    {
      const nextYear = dateToProcess.getFullYear() + 1;
      const curMonth = dateToProcess.getMonth() + 1;
      const curDay = dateToProcess.getDate();
      if (WorldCupService.isWorldCupYear(nextYear) && curMonth === 12 && curDay === 12 && !wcState) {
        const wcDrawKey = `WC_DRAW_${nextYear}`;
        if (!sentMailIdsRef.current.has(wcDrawKey)) {
          sentMailIdsRef.current.add(wcDrawKey);
          const wcTeams = WorldCupService.assembleTeamsForDraw(nationalTeams, seasonNumber, nextYear, sessionSeed);
          const { groups: wcGroups } = WorldCupService.drawGroupsWithFIFARules(wcTeams, sessionSeed, nextYear);
          const newWcState: WCState = {
            year: nextYear,
            teams: wcTeams,
            groups: wcGroups,
            knockoutMatches: [],
            playerEffects: [],
            groupStageComplete: false,
            knockoutComplete: false,
            drawComplete: true,
            playoffSlotsResolved: false,
          };
          setWcState(newWcState);
          const wcDrawMail: MailMessage = {
            id: wcDrawKey,
            sender: 'FIFA',
            role: 'Biuro Rozgrywek FIFA',
            subject: `Losowanie Grup MŚ ${nextYear} — 12 Grudnia`,
            body: `Ceremonia losowania grup Mistrzostw Świata ${nextYear} właśnie się odbyła! 44 drużyny z całego świata poznały swoich grupowych rywali. 4 miejsca są zarezerwowane dla zwycięzców baraży UEFA (marzec ${nextYear}). Otwórz widok losowania aby zobaczyć pełny wynik ceremonii.`,
            date: new Date(dateToProcess),
            isRead: false,
            type: MailType.SYSTEM,
            priority: 100,
          };
          setMessages(prev => [wcDrawMail, ...prev]);
          navigateTo(ViewState.WC_DRAW);
        }
      }
    }

    const simulation = BackgroundMatchProcessor.processLeagueEvent(dateToProcess, userTeamId, allFixtures, clubs, players, lineups, seasonNumber, coaches, sessionSeed);
    
    // 2. Obliczanie regeneracji kondycji i urazów
    const diffTime = Math.abs(dateToProcess.getTime() - lastRecoveryDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const recoveryDelta = diffDays > 0 ? diffDays : 1;
    const userClubForRecovery = userTeamId ? simulation.updatedClubs.find(c => c.id === userTeamId) : null;
    const recoveryBoost = userClubForRecovery && isRecoveryFocusReady(userClubForRecovery, dateToProcess.toISOString().split('T')[0]) ? 1.15 : 1.0;
    const medicalQuality = (() => {
      if (!userClubForRecovery) return undefined;
      const physioMembers = (userClubForRecovery.staffIds ?? [])
        .map(id => staffMembers[id])
        .filter((s): s is StaffMember => s?.role === StaffRole.PHYSIOTHERAPIST);
      const doctorMembers = (userClubForRecovery.staffIds ?? [])
        .map(id => staffMembers[id])
        .filter((s): s is StaffMember => s?.role === StaffRole.CLUB_DOCTOR);
      const qualityValues: number[] = [];
      if (physioMembers.length > 0) {
        qualityValues.push(physioMembers.reduce((sum, s) =>
          sum + ((s.attributes.sportsMassage ?? 10) + (s.attributes.rehabilitation ?? 10) + (s.attributes.muscleInjuries ?? 10)) / 3, 0
        ) / physioMembers.length);
      }
      if (doctorMembers.length > 0) {
        qualityValues.push(doctorMembers.reduce((sum, s) =>
          sum + ((s.attributes.diagnostics ?? 10) + (s.attributes.sportsSurgery ?? 10) + (s.attributes.pharmacology ?? 10)) / 3, 0
        ) / doctorMembers.length);
      }
      return qualityValues.length > 0
        ? Math.round(qualityValues.reduce((a, b) => a + b, 0) / qualityValues.length)
        : undefined;
    })();
    const recoveredPlayers = RecoveryService.applyDailyRecovery(simulation.updatedPlayers, dateToProcess, activeIntensity, recoveryDelta, recoveryBoost, medicalQuality, userTeamId ?? undefined);

    // 3. Budowanie finalnego wyniku
    // 2 lipca: automatyczny przegląd składów AI na początku sezonu
    let postReviewPlayers = recoveredPlayers;
    let postReviewClubs = simulation.updatedClubs;
    // 20 lipca: przedsprzedaż karnetów sezonowych (przed Kolejką 1 — 24 lipca)
    if (dateToProcess.getMonth() === 6 && dateToProcess.getDate() === 20) {
      const seasonYear = dateToProcess.getFullYear();
      const seasonLabel = `${seasonYear}/${String(seasonYear + 1).slice(2)}`;
      postReviewClubs = postReviewClubs.map(club => {
        const seasonTicketPackage = FinanceService.calculateSeasonTicketPackageForClub(club);
        const seasonTicketRevenue = seasonTicketPackage.revenue;
        const ticketsSold = seasonTicketPackage.ticketsSold;
        const newFinanceLog = {
          id: Math.random().toString(36).substr(2, 9),
          date: dateToProcess.toISOString().split('T')[0],
          amount: seasonTicketRevenue,
          type: 'INCOME' as const,
          description: `Przedsprzedaż karnetów: ${ticketsSold.toLocaleString('pl-PL')} szt.`,
          previousBalance: club.budget
        };
        return {
          ...club,
          budget: club.budget + seasonTicketRevenue,
          financeHistory: [newFinanceLog, ...(club.financeHistory || [])].slice(0, 50)
        };
      });
      // E-mail do gracza z raportem
      if (userTeamId) {
        const userClub = postReviewClubs.find(c => c.id === userTeamId);
        if (userClub) {
          const ticketMail = MailService.generateSeasonTicketMail(
            { name: userClub.name, stadiumName: userClub.stadiumName, stadiumCapacity: userClub.stadiumCapacity, reputation: userClub.reputation, leagueId: userClub.leagueId, country: userClub.country },
            seasonLabel,
            dateToProcess
          );
          setMessages(prev => [ticketMail, ...prev]);
        }
      }
    }

    // 20 lipca: roczny wynajem stref VIP i lóż (Skybox)
    // Warunek: tylko Ekstraklasa (tier 1) i pojemność stadionu > 15 000
    if (dateToProcess.getMonth() === 6 && dateToProcess.getDate() === 20) {
      postReviewClubs = postReviewClubs.map(club => {
        const vipRevenue = FinanceService.calculateVIPBoxRevenueForClub(club);
        if (vipRevenue <= 0) return club;
        const newFinanceLog = {
          id: Math.random().toString(36).substr(2, 9),
          date: dateToProcess.toISOString().split('T')[0],
          amount: vipRevenue,
          type: 'INCOME' as const,
          description: `Wynajem stref VIP i lóż (Skybox) — sezon`,
          previousBalance: club.budget
        };
        return {
          ...club,
          budget: club.budget + vipRevenue,
          financeHistory: [newFinanceLog, ...(club.financeHistory || [])].slice(0, 50)
        };
      });
    }

    if (dateToProcess.getMonth() === 6 && dateToProcess.getDate() === 2) {
      const updatedCoachesJuly = AiTransferDecisionService.updateCoachFavorites(postReviewClubs, postReviewPlayers, coaches, dateToProcess, sessionSeed, userTeamId);
      postReviewPlayers = AiContractService.updateClubStars(postReviewClubs, postReviewPlayers, userTeamId, updatedCoachesJuly, dateToProcess, sessionSeed);
      const review = AiContractService.performSeasonSquadReview(postReviewClubs, postReviewPlayers, dateToProcess, userTeamId);
      postReviewClubs = review.updatedClubs;
      postReviewPlayers = review.updatedPlayers;
      const weakReviewSummer = AiContractService.processWeakPlayerContractCuts(postReviewClubs, postReviewPlayers, dateToProcess, userTeamId);
      postReviewClubs = weakReviewSummer.updatedClubs;
      postReviewPlayers = weakReviewSummer.updatedPlayers;
      postReviewPlayers = AiScoutingService.updateTransferInterests(postReviewClubs, postReviewPlayers, dateToProcess, userTeamId, sessionSeed);
      const seasonDecision = AiTransferDecisionService.processSeasonStart(postReviewClubs, postReviewPlayers, updatedCoachesJuly, dateToProcess, userTeamId);
      postReviewClubs = seasonDecision.updatedClubs;
      postReviewPlayers = seasonDecision.updatedPlayers;
      setCoaches(updatedCoachesJuly);
      DebugLoggerService.log('SQUAD_REVIEW', `Przegląd składów AI (2 lipca) wykonany.`, true);
      
      // Wyplata pensji zawodników na start sezonu
      postReviewClubs = postReviewClubs.map(club => {
        const squad = postReviewPlayers[club.id] || [];
        const totalSalaries = FinanceService.calculateTotalSalaries(squad);
        
        // Obliczanie wynagrodzenia trenera (1-3 * 2.5% budżetu rocznie)
        const trainerSalaryFactor = (1 + Math.random() * 2) * 0.025; // 2.5% - 7.5%
        const trainerSalary = Math.floor(club.budget * trainerSalaryFactor);
        
        const totalCost = totalSalaries + trainerSalary;
        const newBudget = club.budget - totalCost;
        
        // Tworzymy wpisy do finansów
        const financeLogsToAdd: any[] = [];
        
        if (totalSalaries > 0) {
          financeLogsToAdd.push({
            id: Math.random().toString(36).substr(2, 9),
            date: dateToProcess.toISOString().split('T')[0],
            amount: -totalSalaries,
            type: 'EXPENSE' as const,
            description: `Pensje zawodników za sezon`,
            previousBalance: club.budget
          });
        }
        
        if (trainerSalary > 0) {
          financeLogsToAdd.push({
            id: Math.random().toString(36).substr(2, 9),
            date: dateToProcess.toISOString().split('T')[0],
            amount: -trainerSalary,
            type: 'EXPENSE' as const,
            description: `Wynagrodzenie sztabu trenera`,
            previousBalance: club.budget - totalSalaries
          });
        }
        
        return {
          ...club,
          budget: newBudget,
          financeHistory: [...financeLogsToAdd, ...(club.financeHistory || [])].slice(0, 50)
        };
      });
    }

    if (userTeamId) {
      if (pendingSponsorAmount !== null && pendingSponsorDate !== null && pendingSponsorNextCheckDate !== null) {
        postReviewClubs = postReviewClubs.map(c => {
          if (c.id !== userTeamId) return c;
          const financeLog = {
            id: Math.random().toString(36).substr(2, 9),
            date: pendingSponsorDate!,
            amount: pendingSponsorAmount!,
            type: 'INCOME' as const,
            description: 'Przychód ze sponsoringu — nowy kontrakt sponsorski',
            previousBalance: c.budget,
          };
          return {
            ...c,
            budget: c.budget + pendingSponsorAmount!,
            sponsorAcquiredThisSeason: true,
            nextSponsorCheckDate: pendingSponsorNextCheckDate!,
            financeHistory: [financeLog, ...(c.financeHistory || [])].slice(0, 50),
          };
        });
      } else if (pendingNoSponsorNextCheckDate !== null) {
        postReviewClubs = postReviewClubs.map(c =>
          c.id === userTeamId ? { ...c, nextSponsorCheckDate: pendingNoSponsorNextCheckDate! } : c
        );
      }

      const boardMonitorUpdate = pendingBoardMonitorUpdate;
      if (boardMonitorUpdate !== null) {
        postReviewClubs = postReviewClubs.map(c => {
          if (c.id !== userTeamId) return c;
          if (boardMonitorUpdate.action === 'NONE') {
            return {
              ...c,
              boardBudgetMonitorState: boardMonitorUpdate.newState,
            };
          }

          const financeLogId = `BOARD_SHIFT_${boardMonitorUpdate.dateKey}_${boardMonitorUpdate.action}`;
          const financeLog = {
            id: financeLogId,
            date: boardMonitorUpdate.dateKey,
            amount: boardMonitorUpdate.action === 'RESTORE' ? -boardMonitorUpdate.amountChanged : boardMonitorUpdate.amountChanged,
            type: boardMonitorUpdate.action === 'RESTORE' ? 'EXPENSE' as const : 'INCOME' as const,
            description: boardMonitorUpdate.action === 'RESTORE'
              ? 'Przesunięcie środków z rezerwy zarządu na budżet transferowy'
              : boardMonitorUpdate.action === 'RESERVE_SUPPORT'
                ? 'Awaryjne wsparcie salda z rezerwy zarządu'
                : 'Awaryjne wsparcie salda z rezerwy zarządu i budżetu transferowego',
            previousBalance: c.budget,
          };

          return {
            ...c,
            budget: boardMonitorUpdate.newBudget,
            transferBudget: boardMonitorUpdate.newTransferBudget,
            reserveBudget: boardMonitorUpdate.newReserveBudget,
            boardBudgetMonitorState: boardMonitorUpdate.newState,
            boardBudgetLastShiftDate: boardMonitorUpdate.dateKey,
            boardBudgetLastShiftAction: boardMonitorUpdate.action,
            financeHistory: boardMonitorUpdate.amountChanged > 0 && !(c.financeHistory || []).some(item => item.id === financeLogId)
              ? [financeLog, ...(c.financeHistory || [])].slice(0, 50)
              : c.financeHistory,
          };
        });
      }
    }

const finalResult: SimulationOutput = {
      ...simulation,
      updatedClubs: postReviewClubs,
      updatedPlayers: postReviewPlayers,
      // TUTAJ WSTAW TEN KOD
      newOffers: simulation.newOffers || []
      // KONIEC KODU
    };
    
    // 4. Aktualizacja wszystkich stanów za jednym razem (applySimulationResult)
       // 4. Aktualizacja wszystkich stanów za jednym razem (applySimulationResult)
    applySimulationResult(finalResult);

    if (userTeamId) {
      const formatPln = (value?: number) => `${(value || 0).toLocaleString('pl-PL')} PLN`;
      const gulfMegaOfferMails: MailMessage[] = (finalResult.aiTransferLogEntries || [])
        .filter(entry => entry.isGulfMegaOffer && (entry.status === 'OFFER_MADE' || entry.status === 'TRANSFER_SIGNED'))
        .map(entry => {
          const signed = entry.status === 'TRANSFER_SIGNED';
          const fromClub = entry.fromClub || 'poprzedni klub';
          const years = entry.contractYears || 1;
          return {
            id: `gulf-mega-${entry.id}`,
            sender: 'Dział Transferowy',
            role: 'Rynek międzynarodowy',
            subject: signed
              ? `Bajeczny kontrakt podpisany: ${entry.playerName}`
              : `Gigantyczna oferta z Azji: ${entry.playerName}`,
            body: signed
              ? `${entry.playerName} zaakceptował ofertę klubu ${entry.toClub}. Zawodnik przechodzi z: ${fromClub}. Kontrakt: ${years} ${years === 1 ? 'rok' : 'lata'}, pensja ${formatPln(entry.salary)}, premia za podpis ${formatPln(entry.bonus)}.`
              : `${entry.toClub} złożył gigantyczną ofertę zawodnikowi ${entry.playerName}. Źródło zainteresowania: ${fromClub}. Propozycja: ${years} ${years === 1 ? 'rok' : 'lata'}, pensja ${formatPln(entry.salary)}, premia za podpis ${formatPln(entry.bonus)}.`,
            date: new Date(dateToProcess),
            isRead: false,
            type: MailType.SYSTEM,
            priority: signed ? 85 : 75,
          };
        });

      if (gulfMegaOfferMails.length > 0) prependUniqueMessages(gulfMegaOfferMails);
    }

    // 4c. Generowanie terminarza rezerw (4 lipca każdego sezonu)
    if (dateToProcess.getMonth() === 6 && dateToProcess.getDate() === 4 && userTeamId) {
      const userClub = clubs.find(c => c.id === userTeamId);
      const alreadyGenerated = reserveFixtures.some(f => f.id.startsWith(`res_r1_${seasonNumber}_`));
      if (userClub && !alreadyGenerated) {
        const polishClubs = clubs.filter(c =>
          c.leagueId === 'L_PL_1' || c.leagueId === 'L_PL_2' || c.leagueId === 'L_PL_3' || c.leagueId === 'L_PL_4'
        );
        const schedule = ReserveScheduleService.generate(userClub, polishClubs, seasonNumber, sessionSeed);
        setReserveFixtures(schedule);
      }
    }

    // 4d. Symulacja meczu rezerw w tle
    if (userTeamId && reserves.length > 0 && reserveCoachId) {
      const todayIso = dateToProcess.toISOString().split('T')[0];
      const reserveFixture = reserveFixtures.find(f => !f.resultId && (typeof f.date === 'string' ? f.date : new Date(f.date).toISOString().split('T')[0]).startsWith(todayIso));
      if (reserveFixture) {
        const opponentClub = clubs.find(c => c.id === reserveFixture.opponentClubId);
        const oppReputation = opponentClub?.reputation ?? 5;
        const matchSeed = sessionSeed + (dateToProcess.getTime() % 1000000);
        const opponentPlayers = ReserveOpponentGeneratorService.generate(reserveFixture.opponentClubId, oppReputation, matchSeed);
        const reserveCoachObj = coaches[reserveCoachId];
        if (reserveCoachObj) {
          const engineResult = ReserveMatchEngine.simulate(
            reserves,
            opponentPlayers,
            reserveCoachObj,
            oppReputation,
            reserveFixture.isHome,
            matchSeed,
            dateToProcess.toISOString()
          );
          const userClub = clubs.find(c => c.id === userTeamId);
          const userTeamName = `${userClub?.shortName || userClub?.name || 'Drużyna'} II`;
          const opponentName = `${opponentClub?.shortName || opponentClub?.name || 'Rywal'} II`;
          const matchResult: ReserveMatchResult = {
            id: `res_match_${dateToProcess.getTime()}`,
            date: dateToProcess.toISOString(),
            season: seasonNumber,
            homeTeamName: reserveFixture.isHome ? userTeamName : opponentName,
            awayTeamName: reserveFixture.isHome ? opponentName : userTeamName,
            isUserHome: reserveFixture.isHome,
            homeScore: engineResult.homeScore,
            awayScore: engineResult.awayScore,
            venue: reserveFixture.isHome
              ? (userClub?.stadiumName ?? 'Stadion')
              : (opponentClub?.stadiumName ?? 'Stadion'),
            opponentClubId: reserveFixture.opponentClubId,
            goals: engineResult.goals,
            missedPenalties: engineResult.missedPenalties,
            cards: engineResult.cards,
            substitutions: engineResult.substitutions,
            injuries: engineResult.injuries,
            ratings: engineResult.ratings,
            userStartingXI: engineResult.userStartingXI,
            manOfTheMatch: engineResult.manOfTheMatch,
            matchPlayers: engineResult.matchPlayers,
          };
          setReserveFixtures(prev => prev.map(f =>
            f.id === reserveFixture.id ? { ...f, resultId: matchResult.id } : f
          ));
          setReserveMatchResults(prev => [...prev, matchResult]);
          setReserves(prev => {
            const updatedInjured = engineResult.updatedUserReserves;
            return prev.map(p => {
              const injuredVersion = updatedInjured.find(u => u.id === p.id);
              const basePlayer = injuredVersion ?? p;
              const servedReserveSuspension = (p.suspensionMatches ?? 0) > 0;
              const baseSuspension = servedReserveSuspension
                ? Math.max(0, (basePlayer.suspensionMatches ?? 0) - 1)
                : (basePlayer.suspensionMatches ?? 0);
              const rating = engineResult.ratings[p.id];
              const wasInXI = engineResult.userStartingXI.includes(p.id);
              const wasSub = engineResult.substitutions.some(s => s.playerInId === p.id);
              if (!wasInXI && !wasSub) {
                return { ...basePlayer, suspensionMatches: baseSuspension };
              }
              const userSide = reserveFixture.isHome ? 'HOME' : 'AWAY';
              const playerGoals = engineResult.goals.filter(g => g.teamId === userSide && g.playerId === p.id).length;
              const playerAssists = engineResult.goals.filter(g => g.teamId === userSide && g.assistantId === p.id).length;
              const playerYellowCards = engineResult.cards.filter(c => c.playerId === p.id && c.type === 'YELLOW').length;
              const playerRedCards = engineResult.cards.filter(c => c.playerId === p.id && (c.type === 'RED' || c.type === 'SECOND_YELLOW')).length;
              const gotRedCard = playerRedCards > 0;
              const prev2 = basePlayer.reserveStats ?? { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, totalRatingPoints: 0 };
              const newStats: ReserveSeasonStats = {
                matches: (prev2.matches ?? 0) + 1,
                goals: (prev2.goals ?? 0) + playerGoals,
                assists: (prev2.assists ?? 0) + playerAssists,
                yellowCards: (prev2.yellowCards ?? 0) + playerYellowCards,
                redCards: (prev2.redCards ?? 0) + playerRedCards,
                totalRatingPoints: (prev2.totalRatingPoints ?? 0) + (rating ?? 6.0),
              };
              return {
                ...basePlayer,
                reserveStats: newStats,
                suspensionMatches: gotRedCard ? 1 : baseSuspension
              };
            });
          });
        }
      }
    }

    // 4e. Regeneracja kondycji rezerw
    if (reserves.length > 0) {
      setReserves(prev => {
        const reservesMap = { RES: prev };
        return RecoveryService.applyDailyRecovery(reservesMap, dateToProcess, TrainingIntensity.NORMAL, recoveryDelta, 1.0)['RES'];
      });
    }

    // 4b. Symulacja meczów CL w tle (11 i 15 lipca)
    // Pomijamy dzień UEFA_SUPER_CUP — mecz jest przetwarzany bezpośrednio w case CompetitionType.UEFA_SUPER_CUP
    const isUEFASuperCupDay = primaryEvent?.slot.competition === CompetitionType.UEFA_SUPER_CUP;
    const clResult = isUEFASuperCupDay
      ? { updatedFixtures: allFixtures, updatedPlayers: postReviewPlayers, matchHistoryEntries: [] as MatchHistoryEntry[] }
      : BackgroundMatchProcessorCL.processChampionsLeagueEvent(
          dateToProcess, userTeamId, allFixtures, clubs, postReviewPlayers, lineups, seasonNumber, sessionSeed, coaches
        );
    // WAŻNE: używamy functional update + porównania, aby nie nadpisać wyników ligowych
    // (clResult.updatedFixtures zawiera WSZYSTKIE fixtures ze starego allFixtures)
    // Pomijamy aktualizację fixtures i graczy z clResult gdy to dzień UEFA Super Cup,
    // bo clResult.updatedFixtures = stare allFixtures (SCHEDULED) i nadpisałoby FINISHED z case UEFA_SUPER_CUP
    if (!isUEFASuperCupDay) {
      setGlobalFixtures(prev => {
        const clMap = new Map(clResult.updatedFixtures.map(f => [f.id, f]));
        return prev.map(f => {
          const clF = clMap.get(f.id);
          if (clF && (
            clF.status !== f.status ||
            clF.homeScore !== f.homeScore ||
            clF.awayScore !== f.awayScore ||
            clF.homePenaltyScore !== f.homePenaltyScore ||
            clF.awayPenaltyScore !== f.awayPenaltyScore
          )) {
            return clF;
          }
          return f;
        });
      });
      if (clResult.matchHistoryEntries.length > 0) {
        const clParticipantIds = new Set(
          clResult.matchHistoryEntries.flatMap(entry => [entry.homeTeamId, entry.awayTeamId])
        );
        setPlayers(prev => {
          const nextPlayers = { ...prev };
          clParticipantIds.forEach(clubId => {
            const updatedSquad = clResult.updatedPlayers[clubId];
            if (updatedSquad) nextPlayers[clubId] = updatedSquad;
          });
          return nextPlayers;
        });
      }
    }
    clResult.matchHistoryEntries.forEach(entry => MatchHistoryService.logMatch(entry));

    // Przetwarzanie bonusów za Superpuchar Polski
    const updatedClubsForSuperCup = finalResult.updatedClubs.map(club => {
      const superCupFixture = clResult.updatedFixtures.find(f => f.leagueId === 'SUPER_CUP' && f.status === MatchStatus.FINISHED);
      
      if (superCupFixture && (club.id === superCupFixture.homeTeamId || club.id === superCupFixture.awayTeamId)) {
        // Sprawdzenie czy bonus za Superpuchar był już kiedykolwiek przyznany (ignorujemy datę)
        const bonusAlreadyApplied = club.financeHistory?.some(entry => 
          entry.description === 'Nagroda za zwycięstwo w Superpucharze Polski' || 
          entry.description === 'Nagroda za udział w Superpucharze Polski'
        );
        
        if (bonusAlreadyApplied) {
          return club;
        }
        
        let isWinner = false;
        
        // Sprawdzenie czy klub wygrał w regulaminowym czasie
        if (club.id === superCupFixture.homeTeamId && (superCupFixture.homeScore || 0) > (superCupFixture.awayScore || 0)) {
          isWinner = true;
        } else if (club.id === superCupFixture.awayTeamId && (superCupFixture.awayScore || 0) > (superCupFixture.homeScore || 0)) {
          isWinner = true;
        }
        
        // Sprawdzenie dla rzutów karnych w przypadku remisu
        if (!isWinner && superCupFixture.homeScore === superCupFixture.awayScore && superCupFixture.homePenaltyScore !== undefined) {
          if (club.id === superCupFixture.homeTeamId && (superCupFixture.homePenaltyScore || 0) > (superCupFixture.awayPenaltyScore || 0)) {
            isWinner = true;
          } else if (club.id === superCupFixture.awayTeamId && (superCupFixture.awayPenaltyScore || 0) > (superCupFixture.homePenaltyScore || 0)) {
            isWinner = true;
          }
        }
        
        const bonusAmount = FinanceService.calculateSuperCupBonus(isWinner);
        
        const financeLog = {
          id: Math.random().toString(36).substring(2, 9),
          date: dateToProcess.toISOString().split('T')[0],
          amount: bonusAmount,
          type: 'INCOME' as const,
          description: isWinner ? 'Nagroda za zwycięstwo w Superpucharze Polski' : 'Nagroda za udział w Superpucharze Polski',
          previousBalance: club.budget
        };
        
        return {
          ...club,
          budget: club.budget + bonusAmount,
          financeHistory: [financeLog, ...(club.financeHistory || [])].slice(0, 50)
        };
      }
      
      return club;
    });
    
    // Aktualizacja boardConfidence dla wszystkich klubów
    const leagueGroups = new Map<string, { id: string; points: number; goalDifference: number }[]>();
    updatedClubsForSuperCup.forEach(c => {
      const arr = leagueGroups.get(c.leagueId) || [];
      arr.push({ id: c.id, points: c.stats.points, goalDifference: c.stats.goalDifference });
      leagueGroups.set(c.leagueId, arr);
    });
    const leagueSortedIds = new Map<string, string[]>();
    leagueGroups.forEach((arr, lId) => {
      const sorted = [...arr].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
      leagueSortedIds.set(lId, sorted.map(c => c.id));
    });
    const updatedClubsWithConfidence = updatedClubsForSuperCup.map(club => {
      const resultScore = (club.stats.wins * 4) - (club.stats.losses * 6);
      let newConfidence: number;
      if (club.leagueId === 'NONE') {
        const base = 100 - (club.reputation * 2);
        newConfidence = Math.min(99, Math.max(5, base + resultScore + (club.europeanBonusPoints ?? 0) + (club.sportingDirectorBoardInfluence ?? 0)));
      } else {
        const rankList = leagueSortedIds.get(club.leagueId) || [];
        const rank = rankList.indexOf(club.id) + 1 || 1;
        const rankImpact = (18 - rank) * 2;
        newConfidence = Math.min(100, Math.max(5, 75 + resultScore + rankImpact - (club.reputation * 2) + (club.sportingDirectorBoardInfluence ?? 0)));
      }
      return { ...club, boardConfidence: newConfidence };
    });
    setClubs(updatedClubsWithConfidence);

    // 5. Integracja NOWYCH OFERT AI do stanu

    // 5. Integracja NOWYCH OFERT AI do stanu
    if (finalResult.newOffers && finalResult.newOffers.length > 0) {
      setPendingNegotiations(prev => [...prev, ...finalResult.newOffers]);
    }

    // 6. Generowanie Raportu Dnia i Poczty (używamy finalResult zamiast result)
    if (userTeamId) {
      const userClub = finalResult.updatedClubs.find(c => c.id === userTeamId)!;
      const leagueClubs = finalResult.updatedClubs.filter(c => c.leagueId === userClub.leagueId);
      const sorted = [...leagueClubs].sort((a,b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
      const userRank = sorted.findIndex(c => c.id === userTeamId) + 1;
      
      const resultScore = (userClub.stats.wins * 4) - (userClub.stats.losses * 6);
      let confidence: number;
      if (userClub.leagueId === 'NONE') {
        const base = 100 - (userClub.reputation * 2);
        confidence = Math.min(99, Math.max(5, base + resultScore + (userClub.europeanBonusPoints ?? 0) + (userClub.sportingDirectorBoardInfluence ?? 0)));
      } else {
        const rankImpact = (18 - userRank) * 2;
        confidence = Math.min(100, Math.max(5, 75 + resultScore + rankImpact - (userClub.reputation * 2) + (userClub.sportingDirectorBoardInfluence ?? 0)));
      }
      
      const recentFixture = allFixtures.find(f => f.date.toDateString() === dateToProcess.toDateString() && (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId));
      const nextFixture = allFixtures
        .filter(f =>
          (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId) &&
          f.status === MatchStatus.SCHEDULED &&
          new Date(f.date).setHours(0, 0, 0, 0) >= new Date(dateToProcess).setHours(0, 0, 0, 0)
        )
        .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
      
      // Zastosowanie recoveredPlayers zapewnia świeże dane w mailach
      const newMails = MailService.generateDailyMails(dateToProcess, userClub, recoveredPlayers, finalResult.updatedClubs, userRank, confidence, recentFixture, nextFixture, messages, lineups[userTeamId]);
      if (newMails.length > 0) prependUniqueMessages(newMails);

      const directorCommunication = SportingDirectorService.generateCommunicationMails({
        club: userClub,
        players: recoveredPlayers[userTeamId] || [],
        date: dateToProcess,
        recentFixture,
      });
      if (directorCommunication.length > 0) {
        prependUniqueMessages(directorCommunication, true);
      }
    }

    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayIso = nextDay.toISOString().split('T')[0];

    // --- STAFF: miesięczny przegląd kończących się kontraktów ---
    if (userTeamId && !isResigned && nextDay.getDate() === 1) {
      const userClub = clubs.find(c => c.id === userTeamId);
      const userSquad = players[userTeamId] || [];
      if (userClub) {
        const contractMail = buildContractStaffAlert(userClub, userSquad, nextDay, lineups[userTeamId]);
        if (contractMail && !sentMailIdsRef.current.has(contractMail.id)) {
          sentMailIdsRef.current.add(contractMail.id);
          setMessages(prev => {
            if (prev.some(message => message.id === contractMail.id)) return prev;
            return [contractMail, ...prev];
          });
        }
      }
    }
    // --- END STAFF CONTRACT REVIEW ---

    // --- SPORTING DIRECTOR: active objective review ---
    if (userTeamId && !isResigned) {
      const userSquad = players[userTeamId] || [];
      setClubs(prev => {
        const userClub = prev.find(c => c.id === userTeamId);
        if (!userClub || !userClub.sportingDirector || !userClub.sportingDirectorObjective) return prev;

        const objectiveReview = SportingDirectorService.evaluateActiveObjective({
          club: userClub,
          players: userSquad,
          date: nextDay,
          leagueClubs: prev.filter(c => c.leagueId === userClub.leagueId),
        });

        if (!objectiveReview.mail) return prev;
        prependUniqueMessages([objectiveReview.mail], true);
        return prev.map(c => c.id === userTeamId ? objectiveReview.updatedClub : c);
      });
    }
    // --- END SPORTING DIRECTOR ---

    // --- SPORTING DIRECTOR: transfer window policy ---
    if (
      userTeamId &&
      !isResigned &&
      ((nextDay.getMonth() === 6 && nextDay.getDate() === 1) || (nextDay.getMonth() === 0 && nextDay.getDate() === 12))
    ) {
      const userSquad = players[userTeamId] || [];
      setClubs(prev => {
        const userClub = prev.find(c => c.id === userTeamId);
        if (!userClub || !userClub.sportingDirector) return prev;

        const policy = SportingDirectorService.createTransferWindowPolicy({
          club: userClub,
          players: userSquad,
          date: nextDay,
        });

        if (!policy.mail) return prev;
        prependUniqueMessages([policy.mail], true);
        return prev.map(c => c.id === userTeamId ? policy.updatedClub : c);
      });
    }
    // --- END SPORTING DIRECTOR ---

    // --- SPORTING DIRECTOR: monthly manager review ---
    if (userTeamId && !isResigned && nextDay.getDate() === 1) {
      const userSquad = players[userTeamId] || [];
      setClubs(prev => {
        const userClub = prev.find(c => c.id === userTeamId);
        if (!userClub || !userClub.sportingDirector || userClub.leagueId === 'NONE') return prev;

        const leagueClubs = prev.filter(c => c.leagueId === userClub.leagueId);
        const review = SportingDirectorService.reviewManagerMonthly({
          club: userClub,
          players: userSquad,
          leagueClubs,
          date: nextDay,
        });
        const relationshipPressure = SportingDirectorService.evaluateRelationshipPressure({
          club: review.updatedClub,
          date: nextDay,
        });
        const objective = SportingDirectorService.createMonthlyObjective({
          club: relationshipPressure.updatedClub,
          players: userSquad,
          date: nextDay,
          leagueClubs,
          fixtures: allFixtures,
        });
        const budgetAdjustment = SportingDirectorService.applyTransferBudgetAdjustment({
          club: objective.updatedClub,
          players: userSquad,
          date: nextDay,
        });

        const directorMails = [
          objective.mail,
          relationshipPressure.mail,
          review.mail,
          budgetAdjustment.mail,
          ...SportingDirectorService.generateCommunicationMails({
            club: budgetAdjustment.updatedClub,
            players: userSquad,
            date: nextDay,
          }),
        ].filter(Boolean) as MailMessage[];
        if (directorMails.length > 0) {
          prependUniqueMessages(directorMails, true);
        }
        return prev.map(c => c.id === userTeamId ? budgetAdjustment.updatedClub : c);
      });
    }
    // --- END SPORTING DIRECTOR ---

    if (userTeamId) {
      const userClub = clubs.find(c => c.id === userTeamId);
      if (userClub) {
        const neglectStatus = WeeklyMotivationService.getNeglectStatus(userClub, nextDay);

        if (!userClub.lastMotivationDate && !userClub.motivationMonitoringStartDate) {
          setClubs(prev => prev.map(c => c.id === userTeamId ? {
            ...c,
            motivationMonitoringStartDate: nextDayIso,
            motivationNeglectLevel: c.motivationNeglectLevel ?? 0,
          } : c));
        } else if (neglectStatus.isOverdue) {
          const squad = players[userTeamId] || [];
          const captain = squad.find(p => p.id === userClub.captainId) || squad[0];
          const captainName = captain ? `${captain.firstName} ${captain.lastName}` : 'Kapitan druzyny';
          const reminderLevel = userClub.motivationNeglectLevel ?? 0;
          const captainMailBody =
            reminderLevel <= 0
              ? 'Trenerze,\n\nW szatni zaczyna brakować wspólnego impulsu. Chłopaki czekają na rozmowę, bo atmosfera powoli się rozluznia i nie wszyscy są już na tej samej fali.\n\nMyslę, że kilka słów od trenera dobrze by nam teraz zrobiło.\n\n' + captainName
              : reminderLevel === 1
                ? 'Trenerze,\n\nW szatni widać, że zbyt długo nie było żadnej rozmowy. Atmosfera nie jest jeszcze zła, ale pojawia się frustracja i coraz cześciej każdy idzie w swoją stronę.\n\nDrużyna potrzebuje jasnego sygnału i zebrania nas razem.\n\n' + captainName
                : 'Trenerze,\n\nAtmosfera w szatni wyraźnie się psuje i zawodnicy od dawna czekają na reakcję. Bez rozmowy będzie nam coraz trudniej utrzymać jedność i koncentracje.\n\nTo jest moment, w którym zespół potrzebuje trenera najbardziej.\n\n' + captainName;

          setClubs(prev => prev.map(c => {
            if (c.id !== userTeamId) return c;
            return {
              ...c,
              morale: Math.max(5, Math.min(95, (c.morale ?? 50) - neglectStatus.nextPenalty)),
              motivationMonitoringStartDate: c.motivationMonitoringStartDate ?? c.lastMotivationDate ?? nextDayIso,
              motivationNeglectLevel: (c.motivationNeglectLevel ?? 0) + 1,
            };
          }));

          if ((userClub.morale ?? 50) <= 64) {
            setMessages(prev => [{
              id: `CAPTAIN_MOTIVATION_${Date.now()}`,
              sender: captainName,
              role: 'Kapitan druzyny',
              subject: reminderLevel <= 0 ? 'Atmosfera w szatni' : 'Drużyna czeka na rozmowę',
              body: captainMailBody,
              date: new Date(nextDay),
              isRead: false,
              type: MailType.STAFF,
              priority: 58,
            }, ...prev]);
          }
        }
      }
    }
    // Nowy sezon jest teraz uruchamiany przez confirmSeasonEnd (przycisk "NOWY SEZON" na Dashboardzie)
    // Fallback: jeśli data jakoś przeskoczyła bez zatrzymania na OFF_SEASON (np. save z przyszłości)
    // if (nextDay.getMonth() === 6 && nextDay.getDate() === 1) startNextSeason(nextDay.getFullYear());

    // STAGE 1 PRO: Board Review at Checkpoints (Rounds 17, 24, 34)
 
// NOWA LOGIKA: SESJE ZARZĄDU (7 Grudnia, 1 Marca, 1 Czerwca)
    const isBoardMeeting = (nextDay.getMonth() === 11 && nextDay.getDate() === 7) || // 7 Grudnia
                           (nextDay.getMonth() === 2 && nextDay.getDate() === 1) ||  // 1 Marca
                           (nextDay.getMonth() === 5 && nextDay.getDate() === 1);   // 1 Czerwca

    if (isBoardMeeting) {
      const updatedCoaches = { ...coaches };
      const updatedClubsList = [...clubs];
      const newMails: MailMessage[] = [];

      updatedClubsList.forEach(club => {
        if (club.id === userTeamId || !club.coachId) return;
        if (club.leagueId !== 'L_PL_1' && club.leagueId !== 'L_PL_2' && club.leagueId !== 'L_PL_3') return;
        
        const coach = updatedCoaches[club.coachId];
        
        // 6-MIESIĘCZNY OKRES OCHRONNY (Immunitet)
        const hireDate = new Date(coach.hiredDate);
        const diffTime = Math.abs(nextDay.getTime() - hireDate.getTime());
        const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44);
        const isProtected = diffMonths < 6;

        if (isProtected) return; // Zarząd nawet nie otwiera teczki tego trenera

        const leagueClubs = updatedClubsList.filter(c => c.leagueId === club.leagueId);
        const sorted = [...leagueClubs].sort((a,b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
        const rank = sorted.findIndex(c => c.id === club.id) + 1;

        const evaluation = CoachService.evaluatePerformance(club, coach, rank);
        
        if (evaluation.fire) {

// ZASTĄP TEN KOD (sekcja zwolnienia AI) TYM KODEM:
          // 1. Wyślij informację do mediów
           const playerClub = updatedClubsList.find(c => c.id === userTeamId);
          const playerTier = parseInt(playerClub?.leagueId.split('_')[2] || '4');
          const firingClubTier = parseInt(club.leagueId.split('_')[2] || '4');

          // Wiadomość trafia do skrzynki tylko, jeśli liga zwolnienia jest równa lub wyższa (niższy Tier) niż gracza
          if (firingClubTier <= playerTier) {
            newMails.push(MailService.generateCoachFiredMail(club.name, `${coach.firstName} ${coach.lastName}`, rank));
          }
          // 2. Wykonaj fizyczne zwolnienie
          Object.keys(coach.attributes).forEach(attr => {
            const key = attr as keyof typeof coach.attributes;
            coach.attributes[key] = Math.max(1, coach.attributes[key] - 1);
          });
          
          coach.blacklist[club.id] = nextDay.getFullYear() + 5;
          coach.currentClubId = null;
          coach.favoritePlayerIds = undefined;
          coach.history[coach.history.length-1].toYear = nextDay.getFullYear();
          coach.history[coach.history.length-1].toMonth = nextDay.getMonth()+1;
          // Szukanie następcy
          const candidates = Object.values(updatedCoaches).filter(c => 
            !c.currentClubId && (!c.blacklist[club.id] || c.blacklist[club.id] <= nextDay.getFullYear())
          );
          const replacement = candidates.sort((a,b) => b.attributes.experience - a.attributes.experience)[0];
          
          if (replacement) {
            replacement.currentClubId = club.id;
            replacement.favoritePlayerIds = undefined;
            replacement.history.push({
              clubId: club.id, clubName: club.name,
              fromYear: nextDay.getFullYear(), fromMonth: nextDay.getMonth()+1,
              toYear: null, toMonth: null
            });
            club.coachId = replacement.id;
          }
        }
      });
        if (newMails.length > 0) setMessages(prev => [...newMails, ...prev]);
      setCoaches(updatedCoaches);
      setClubs(updatedClubsList);
    }


    // --- SCOUT ASSISTANT: Raport przedmeczowy (dzień przed meczem ligowym lub pucharowym) ---
    if (userTeamId) {
      const tomorrowStr = nextDay.toDateString();
      const tomorrowFixture = allFixtures.find(f =>
        f.date.toDateString() === tomorrowStr &&
        f.status === 'SCHEDULED' &&
        (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId) &&
        (typeof f.leagueId === 'string' && (
          f.leagueId.startsWith('L_PL_') ||
          f.leagueId === 'POLISH_CUP' ||
          f.leagueId === 'SUPER_CUP' ||
          (f.leagueId.startsWith('CL_') && !f.leagueId.endsWith('_DRAW')) ||
          (f.leagueId.startsWith('EL_') && !f.leagueId.endsWith('_DRAW'))
        ))
      );

      if (tomorrowFixture) {
        const scoutMailKey = `SCOUT_REPORT_${tomorrowFixture.id}`;
        if (!sentMailIdsRef.current.has(scoutMailKey)) {
          const opponentId = tomorrowFixture.homeTeamId === userTeamId
            ? tomorrowFixture.awayTeamId
            : tomorrowFixture.homeTeamId;
          const opponentClub = clubs.find(c => c.id === opponentId);
          const opponentPlayers = players[opponentId] || [];
          const opponentLineup = lineups[opponentId];
          const userPlayersList = players[userTeamId] || [];
          const userLineup = lineups[userTeamId];

          if (opponentClub && opponentLineup && userLineup) {
            const clLeagueNames: Record<string, string> = {
              'CL_R1Q': 'LM - Kwalifikacje R1',
              'CL_R1Q_RETURN': 'LM - Kwalifikacje R1 Rewanż',
              'CL_R2Q': 'LM - Kwalifikacje R2',
              'CL_R2Q_RETURN': 'LM - Kwalifikacje R2 Rewanż',
              'CL_GROUP_STAGE': 'Liga Mistrzów - Faza Grupowa',
              'CL_R16': 'Liga Mistrzów - 1/8 Finału',
              'CL_R16_RETURN': 'LM - 1/8 Finału Rewanż',
              'CL_QF': 'Liga Mistrzów - Ćwierćfinał',
              'CL_QF_RETURN': 'LM - Ćwierćfinał Rewanż',
              'CL_SF': 'Liga Mistrzów - Półfinał',
              'CL_SF_RETURN': 'LM - Półfinał Rewanż',
              'CL_FINAL': 'Liga Mistrzów - Finał',
              'EL_R1Q': 'LE - Kwalifikacje R1',
              'EL_R1Q_RETURN': 'LE - Kwalifikacje R1 Rewanż',
              'EL_R2Q': 'LE - Kwalifikacje R2',
              'EL_R2Q_RETURN': 'LE - Kwalifikacje R2 Rewanż',
              'EL_GROUP_STAGE': 'Liga Europy - Faza Grupowa',
              'EL_R16': 'Liga Europy - 1/8 Finału',
              'EL_R16_RETURN': 'LE - 1/8 Finału Rewanż',
              'EL_QF': 'Liga Europy - Ćwierćfinał',
              'EL_QF_RETURN': 'LE - Ćwierćfinał Rewanż',
              'EL_SF': 'Liga Europy - Półfinał',
              'EL_SF_RETURN': 'LE - Półfinał Rewanż',
              'EL_FINAL': 'Liga Europy - Finał',
            };
            const leagueName = tomorrowFixture.leagueId === 'L_PL_1' ? 'Ekstraklasa'
              : tomorrowFixture.leagueId === 'L_PL_2' ? '1. Liga'
              : tomorrowFixture.leagueId === 'L_PL_3' ? '2. Liga'
              : tomorrowFixture.leagueId === 'POLISH_CUP' ? 'Puchar Polski'
              : tomorrowFixture.leagueId === 'SUPER_CUP' ? 'Superpuchar'
              : clLeagueNames[tomorrowFixture.leagueId as string] ?? 'Liga Mistrzów';
            const opponentLeagueStandings = [...clubs]
              .filter(c => c.leagueId === opponentClub.leagueId)
              .sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
            const opponentLeaguePosition = opponentLeagueStandings.findIndex(c => c.id === opponentClub.id) + 1;
            const scoutClub = clubs.find(c => c.id === userTeamId);
            const scoutStaff = (scoutClub?.staffIds ?? [])
              .map(id => staffMembers[id])
              .filter((s): s is StaffMember => !!s);
            const assistantExp = (() => {
              const assistants = scoutStaff.filter(s => s.role === StaffRole.ASSISTANT_COACH);
              if (assistants.length === 0) return 5;
              return Math.round(
                assistants.reduce((sum, s) => sum + (s.attributes.experience ?? 10), 0) / assistants.length
              );
            })();
            const analystQuality = (() => {
              const analysts = scoutStaff.filter(s => s.role === StaffRole.VIDEO_ANALYST);
              if (analysts.length === 0) return 5;
              return Math.round(
                analysts.reduce((sum, s) => {
                  const vals = Object.values(s.attributes) as number[];
                  return sum + vals.reduce((a, b) => a + b, 0) / vals.length;
                }, 0) / analysts.length
              );
            })();
            const analysisQuality = Math.round((assistantExp + analystQuality) / 2);
            const isHome = tomorrowFixture.homeTeamId === userTeamId;
            const scoutMail = ScoutAssistantService.generatePreMatchReport({
              opponentClub,
              opponentPlayers,
              opponentLineup,
              userPlayers: userPlayersList,
              userLineup,
              matchDate: tomorrowFixture.date,
              managerName: managerProfile?.firstName || 'Managerze',
              clubs,
              opponentLeaguePosition,
              opponentLeaguePoints: opponentClub.stats.points,
              opponentLeagueGoalDiff: opponentClub.stats.goalDifference,
              leagueName,
              analysisQuality,
              userClubId: userTeamId!,
              isHome,
            });
            sentMailIdsRef.current.add(scoutMailKey);
            setMessages(prev => [scoutMail, ...prev]);
          }
        }
      }
    }
    // --- END SCOUT ASSISTANT ---

    // --- INCOMING TRANSFER OFFERS (AI -> Player's Club) ---
    if (userTeamId && !isResigned) {
      const userSquad = players[userTeamId] || [];
      const userClub = clubs.find(c => c.id === userTeamId)!;
      const isInsideWindow = (() => {
        const m = nextDay.getMonth(); const d = nextDay.getDate();
        const isSummer = (m === 6 && d >= 1) || m === 7 || (m === 8 && d <= 8);
        const isWinter = (m === 0 && d >= 12) || (m === 1 && d <= 13);
        return isSummer || isWinter;
      })();
      const dateStr = nextDay.toISOString().split('T')[0];
      const newIncomingMails: MailMessage[] = [];
      const spontaneousInterestAdds = new Map<string, Set<string>>();
      const newOffersToAdd: IncomingTransferOffer[] = [];
      const queueIncomingMail = (mail: MailMessage) => {
        if (mail.metadata?.type !== 'INCOMING_TRANSFER_OFFER') {
          newIncomingMails.push(mail);
          return;
        }

        const mailOfferId = mail.metadata.offerId;
        const duplicateExists = [...messages, ...newIncomingMails].some(existingMail =>
          existingMail.metadata?.type === 'INCOMING_TRANSFER_OFFER' &&
          existingMail.metadata.offerId === mailOfferId &&
          existingMail.subject === mail.subject
        );

        if (!duplicateExists) {
          newIncomingMails.push(mail);
        }
      };

      
        // 1. Przetwarzaj timery istniejących ofert
        const { updatedOffers, actions } = IncomingTransferService.processDailyTimers(incomingOffers, dateStr);
        let processed = [...updatedOffers];

        actions.forEach(action => {
          const off = processed.find(o => o.id === action.offerId);
          if (!off) return;
          let player: Player | undefined;
          for (const cId in players) {
            player = players[cId].find(p => p.id === off.playerId);
            if (player) break;
          }
          const buyerClub = clubs.find(c => c.id === off.buyerClubId);
          if (!player || !buyerClub || !userClub) return;

          if (action.type === 'SEND_REMINDER') {
            queueIncomingMail(MailService.generateIncomingOfferReminderMail(
              player, buyerClub.name, off.fee, userClub.name, nextDay, off.id
            ));
          } else if (action.type === 'EXPIRE') {
            newIncomingMails.push(MailService.generateIncomingOfferExpiredMail(
              player, buyerClub.name, userClub.name, nextDay
            ));
          } else if (action.type === 'PROCESS_AI_COUNTER') {
            const seed = nextDay.getTime() + off.id.charCodeAt(0);
            const result = IncomingTransferService.processAICounterResponse(off, seed);
            const idx = processed.findIndex(o => o.id === off.id);
            if (result.verdict === 'ACCEPT') {
              const resolveIn = Math.random() < 0.5 ? 2 : 3;
              const resolveDate = IncomingTransferService.addDays(dateStr, resolveIn);
              processed[idx] = {
                ...processed[idx],
                status: IncomingOfferStatus.NEGOTIATION_IN_PROGRESS,
                fee: result.newFee ?? off.counterFee ?? off.fee,
                playerNegotiationStartedAt: dateStr,
                playerNegotiationResolvesAt: resolveDate,
              };
              queueIncomingMail(MailService.generateAIAcceptedCounterMail(
                player, buyerClub.name, processed[idx].fee, userClub.name, nextDay, off.id
              ));
            } else if (result.verdict === 'COUNTER' && result.newFee) {
              processed[idx] = {
                ...processed[idx],
                status: IncomingOfferStatus.AI_COUNTERED,
                aiCounterFee: result.newFee,
                negotiationRound: processed[idx].negotiationRound + 1,
              };
              queueIncomingMail(MailService.generateAICounteredMail(
                player, buyerClub.name, result.newFee, processed[idx].negotiationRound, userClub.name, nextDay, off.id
              ));
            } else {
              processed[idx] = { ...processed[idx], status: IncomingOfferStatus.EXPIRED };
              newIncomingMails.push(MailService.generateAIRejectedCounterMail(
                player, buyerClub.name, userClub.name, nextDay
              ));
            }
          } else if (action.type === 'RESOLVE_PLAYER_NEGOTIATION') {
            const seed = nextDay.getTime() + off.id.charCodeAt(1);
            const result = IncomingTransferService.simulatePlayerNegotiation(player, buyerClub, userClub, seed, nextDay);
            const idx = processed.findIndex(o => o.id === off.id);
            processed[idx] = { ...processed[idx], playerNegotiationResult: result };
            if (result === 'accepted') {
              processed[idx].status = IncomingOfferStatus.AWAITING_CONFIRMATION;
              queueIncomingMail(MailService.generatePlayerAcceptedConfirmMail(
                player, buyerClub.name, off.fee,
                IncomingTransferService.getTimingLabel(off.timing),
                userClub.name, nextDay, off.id
              ));
            } else {
              processed[idx].status = IncomingOfferStatus.PLAYER_REFUSED;
              newIncomingMails.push(MailService.generatePlayerRefusedMail(
                player, buyerClub.name, userClub.name, nextDay
              ));
            }
          }
        });

        // 2. Generuj nowe oferty AI
        const dailyOfferRoll = IncomingTransferService.seededRandom(nextDay.getTime() + 404);
        const maxDailyNewOffers = isInsideWindow
          ? (dailyOfferRoll < 0.08 ? 2 : 1)
          : (dailyOfferRoll < 0.80 ? 0 : 1);
        const rotateBySeed = <T,>(items: T[], seedOffset: number): T[] => {
          if (items.length <= 1) return items;
          const start = Math.floor(IncomingTransferService.seededRandom(nextDay.getTime() + seedOffset) * items.length);
          return [...items.slice(start), ...items.slice(0, start)];
        };
        const aiClubs = rotateBySeed(clubs.filter(c => c.id !== userTeamId), 911);
        const offerCandidateSquad = rotateBySeed(userSquad, 1301);
        aiClubs.forEach(aiClub => {
          if (newOffersToAdd.length >= maxDailyNewOffers) return;
          const buyerSquad = players[aiClub.id] || [];
          offerCandidateSquad.forEach(p => {
            if (newOffersToAdd.length >= maxDailyNewOffers) return;
            const seed = IncomingTransferService.buildOfferSeed(nextDay, aiClub.id, p.id);
            const offerDecision = IncomingTransferService.shouldGenerateOffer(
              p,
              aiClub,
              userClub,
              [...newOffersToAdd, ...processed],
              seed,
              nextDay,
              userSquad,
              buyerSquad
            );
            if (!offerDecision.shouldGenerate) return;
            const { fee, aiMaxFee, aiUrgency, timing } = IncomingTransferService.calculateOffer(
              p, aiClub, userClub, isInsideWindow, seed
            );
            if (fee <= 0 || fee > aiClub.budget) return;
            const boardPressure = IncomingTransferService.evaluateBoardPressure({ fee }, p, userClub, aiClub, seed);
            const buyerLeague = leagues.find(l => l.id === aiClub.leagueId);
            const newOffer: IncomingTransferOffer = {
              id: `inc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              playerId: p.id,
              buyerClubId: aiClub.id,
              fee,
              timing,
              status: IncomingOfferStatus.EMAIL_SENT,
              createdAt: dateStr,
              emailSentAt: dateStr,
              aiMaxFee,
              aiUrgency,
              negotiationRound: 0,
              boardPressure,
            };
            newOffersToAdd.push(newOffer);
            if (offerDecision.source === 'SPONTANEOUS') {
              const existingClubs = spontaneousInterestAdds.get(p.id) ?? new Set<string>();
              existingClubs.add(aiClub.id);
              spontaneousInterestAdds.set(p.id, existingClubs);
            }
            queueIncomingMail(MailService.generateIncomingOfferMail(
              p, aiClub.name, buyerLeague?.name ?? aiClub.leagueId,
              fee, IncomingTransferService.getTimingLabel(timing),
              userClub.name, boardPressure, nextDay, newOffer.id
            ));
          });
        });

        // 3. Prekontrakty AI: ostatni rok umowy, bez zgody klubu sprzedającego.
        // Klub AI może dogadać się bezpośrednio z zawodnikiem, a transfer wykona się w dniu końca kontraktu.
        const hasRecentAiPreContract = transferOffers.some(offer => {
          if (!offer.id.startsWith('AI_PRECONTRACT_')) return false;
          if (offer.status !== TransferOfferStatus.AGREED_PRECONTRACT) return false;
          const createdAt = new Date(offer.createdAt);
          const daysSince = Math.floor((nextDay.getTime() - createdAt.getTime()) / 86_400_000);
          return daysSince >= 0 && daysSince < 21;
        });
        let aiPreContractSigned = hasRecentAiPreContract;
        aiClubs.forEach(aiClub => {
          if (aiPreContractSigned) return;
          const buyerSquad = players[aiClub.id] || [];
          offerCandidateSquad.forEach(p => {
            if (aiPreContractSigned) return;
            if (p.transferPendingClubId) return;
            if (p.transferOfferBanUntil && nextDay < new Date(p.transferOfferBanUntil)) return;
            if (!IncomingTransferService.isPlausibleBuyerForPlayer(p, aiClub, buyerSquad)) return;

            const contractDaysLeft = Math.floor((new Date(p.contractEndDate).getTime() - nextDay.getTime()) / 86_400_000);
            if (contractDaysLeft <= 0 || contractDaysLeft > 365) return;

            const existingPreContract = transferOffers.some(offer =>
              offer.playerId === p.id &&
              offer.status === TransferOfferStatus.AGREED_PRECONTRACT
            );
            if (existingPreContract) return;

            const seed = IncomingTransferService.buildOfferSeed(nextDay, aiClub.id, `${p.id}_PRECONTRACT`);
            const isShortlisted = !!p.interestedClubs?.includes(aiClub.id);
            const repDelta = aiClub.reputation - userClub.reputation;
            const samePosition = buyerSquad.filter(player => player.position === p.position);
            const positionAverage = samePosition.length > 0
              ? samePosition.reduce((sum, player) => sum + player.overallRating, 0) / samePosition.length
              : IncomingTransferService.getSquadAverageOverall(buyerSquad);
            const sportingFit = p.overallRating >= positionAverage + 1;
            if (!sportingFit && !isShortlisted && repDelta < 2) return;

            const interestedClubsForMindflow = (p.interestedClubs || [])
              .map(clubId => clubs.find(club => club.id === clubId))
              .filter((club): club is Club => !!club);
            const contractMindflow = PlayerContractMindflowService.evaluate({
              player: p,
              currentClub: userClub,
              currentSquad: userSquad,
              currentDate: nextDay,
              interestedClubs: interestedClubsForMindflow,
              targetClub: aiClub,
              targetSquad: buyerSquad,
            });

            if (!contractMindflow.externalOfferGate.willListen) return;
            if (!contractMindflow.externalOfferGate.canSignPreContract) return;

            let chance = contractDaysLeft <= 90 ? 0.055 : contractDaysLeft <= 180 ? 0.035 : 0.018;
            if (isShortlisted) chance *= 2.5;
            if (repDelta >= 3) chance *= 1.8;
            else if (repDelta >= 1) chance *= 1.35;
            else if (repDelta < 0) chance *= 0.45;
            if (p.squadRole === 'KEY_PLAYER' || p.isUntouchable) chance *= 0.55;
            if (p.isNegotiationPermanentBlocked) chance *= 2.0;
            chance *= contractMindflow.externalOfferGate.preContractChanceMultiplier;

            if (IncomingTransferService.seededRandom(seed + 73) >= Math.min(0.18, chance)) return;

            const negotiation = IncomingTransferService.simulatePlayerNegotiation(p, aiClub, userClub, seed + 101, nextDay);
            if (negotiation !== 'accepted') return;

            const rawPreContractSalary = Math.max(
              FinanceService.getFairMarketSalary(p.overallRating),
              Math.round(p.annualSalary * (repDelta >= 2 ? 1.20 : repDelta >= 0 ? 1.12 : 1.35) / 10000) * 10000
            );
            const preContractSalaryCeiling = FinanceService.calculatePolishLeagueSalaryCeiling(
              FinanceService.getClubTier(aiClub),
              aiClub.reputation
            );
            const salary = preContractSalaryCeiling
              ? Math.min(rawPreContractSalary, preContractSalaryCeiling)
              : rawPreContractSalary;
            const bonus = Math.round(p.annualSalary * (p.age < 24 ? 0.35 : p.age <= 30 ? 0.55 : 0.75) / 10000) * 10000;
            const years = p.age <= 27 ? 4 : p.age <= 31 ? 3 : p.age <= 34 ? 2 : 1;
            if (aiClub.transferBudget < salary * years + bonus) return;

            const preContractId = `AI_PRECONTRACT_${p.id}_${aiClub.id}_${dateStr}`;
            const agreedOffer: TransferOffer = {
              id: preContractId,
              playerId: p.id,
              sellerClubId: userTeamId,
              buyerClubId: aiClub.id,
              fee: 0,
              timing: TransferTiming.CONTRACT_END,
              salary,
              bonus,
              years,
              createdAt: dateStr,
              status: TransferOfferStatus.AGREED_PRECONTRACT,
              effectiveDate: p.contractEndDate,
              sellerReason: 'Zawodnik podpisał umowę obowiązującą od wygaśnięcia obecnego kontraktu.',
              playerReason: 'Zawodnik uznał, że to korzystny następny krok w karierze.',
              attemptNumber: 1,
              maxAttempts: 1,
            };

            setTransferOffers(prev => {
              if (prev.some(offer => offer.id === agreedOffer.id || (
                offer.playerId === p.id &&
                offer.status === TransferOfferStatus.AGREED_PRECONTRACT
              ))) return prev;
              return [agreedOffer, ...prev].slice(0, 100);
            });

            setPlayers(prev => ({
              ...prev,
              [userTeamId]: (prev[userTeamId] || []).map(player =>
                player.id === p.id
                  ? {
                      ...player,
                      transferPendingClubId: aiClub.id,
                      transferReportDate: p.contractEndDate,
                      transferPendingFee: 0,
                      transferPendingSalary: salary,
                      transferPendingBonus: bonus,
                      transferPendingContractYears: years,
                      interestedClubs: [],
                    }
                  : player
              )
            }));

            const mailKey = `MAIL_AI_PRECONTRACT_${preContractId}`;
            if (!sentMailIdsRef.current.has(mailKey)) {
              sentMailIdsRef.current.add(mailKey);
              newIncomingMails.push({
                id: mailKey,
                sender: `Agent gracza ${p.lastName}`,
                role: 'Agencja menedżerska',
                subject: `Prekontrakt podpisany: ${p.firstName} ${p.lastName}`,
                body: `${p.firstName} ${p.lastName} uzgodnił warunki z klubem ${aiClub.name}. Zawodnik dołączy do nich po wygaśnięciu obecnej umowy, czyli ${new Date(p.contractEndDate).toLocaleDateString('pl-PL')}.\n\nTo konsekwencja wejścia w ostatni rok kontraktu. Jeśli chcemy unikać takich sytuacji, kluczowe rozmowy trzeba zaczynać zanim zostanie 12 miesięcy umowy.`,
                date: new Date(nextDay),
                isRead: false,
                type: MailType.STAFF,
                priority: 99,
              });
            }

            aiPreContractSigned = true;
          });
        });

      setIncomingOffers([...newOffersToAdd, ...processed].slice(0, 200));

      if (newIncomingMails.length > 0) {
        setMessages(prev => [...newIncomingMails, ...prev]);
      }

      if (spontaneousInterestAdds.size > 0) {
        setPlayers(prev => {
          const userPlayers = prev[userTeamId] || [];
          let changed = false;

          const updatedUserPlayers = userPlayers.map(player => {
            const clubsToAdd = spontaneousInterestAdds.get(player.id);
            if (!clubsToAdd || clubsToAdd.size === 0) return player;

            const existingInterestedClubs = player.interestedClubs || [];
            const mergedInterestedClubs = [
              ...existingInterestedClubs,
              ...Array.from(clubsToAdd).filter(clubId => !existingInterestedClubs.includes(clubId))
            ];

            if (mergedInterestedClubs.length === existingInterestedClubs.length) return player;
            changed = true;
            return { ...player, interestedClubs: mergedInterestedClubs };
          });

          if (!changed) return prev;
          return { ...prev, [userTeamId]: updatedUserPlayers };
        });
      }
    }
    // --- END INCOMING TRANSFER OFFERS ---

    // ── AKADEMIA: tygodniowy tick (każdy poniedziałek) ───────────────────────
    if (academy && userTeamId && nextDay.getDay() === 1) {
      // 1. Tygodniowy rozwój wychowanków
      const developed = AcademyService.processWeeklyDevelopment(
        academy.youthPlayers,
        academy.level,
        academy.operationalBudgetWeekly
      );

      // 2. Sprawdź zakończone misje skautingowe
      const { updatedMissions, completedMissions, updatedYouthPlayers } =
        AcademyService.processCompletedMissions({ ...academy, youthPlayers: developed }, nextDay);

      // 3. Zwolnij skautów po zakończeniu misji
      const scoutIdsToFree = completedMissions.filter(m => m.scoutId).map(m => m.scoutId!);
      if (scoutIdsToFree.length > 0) {
        setScoutPool(prev => prev.map(s => scoutIdsToFree.includes(s.id) ? { ...s, isOnMission: false } : s));
      }

      // 3b. Wyniki misji regionalnych — skaut może wrócić z pustymi rękami
      let finalYouthPlayers = [...updatedYouthPlayers];
      const regionalMissionResults = new Map<string, YouthPlayer[]>();
      completedMissions.forEach(m => {
        if (!m.isRegionScouting) return;
        const scout = scoutPool.find(s => s.id === m.scoutId);
        const networkDepth = scout?.networkDepth ?? 10;
        const slotsLeft = ACADEMY_MAX_SLOTS[academy.level] - finalYouthPlayers.length;
        const found = AcademyService.resolveRegionalScoutingResult(m, academy.level, slotsLeft, networkDepth, new Date(nextDay));
        regionalMissionResults.set(m.id, found);
        finalYouthPlayers = [...finalYouthPlayers, ...found];
      });

      // Maile o zakończonych misjach (poza updaterem — unikamy podwójnego wywołania w StrictMode)
      if (completedMissions.length > 0) {
        const mails: MailMessage[] = completedMissions.map(m => {
          if (m.isRegionScouting) {
            const foundYouths = regionalMissionResults.get(m.id) ?? [];
            const body = foundYouths.length > 0
              ? `Skaut wrócił z misji skautingowej. Udało się pozyskać ${foundYouths.length} wychowanka${foundYouths.length > 1 ? 'ów' : ''}: ${foundYouths.map(y => `${y.firstName} ${y.lastName} (${y.age} l.)`).join(', ')}. Sprawdź zakładkę Wychowankowie.`
              : `Skaut wrócił z misji z pustymi rękami. Tym razem nie udało się znaleźć odpowiednich kandydatów do akademii.`;
            return {
              id: `SCOUT_DONE_${m.id}`,
              sender: 'Szef Skautingu Akademii',
              role: 'Akademia Piłkarska',
              subject: foundYouths.length > 0 ? `Skaut wrócił — znaleziono ${foundYouths.length} talent${foundYouths.length > 1 ? 'ów' : ''}` : 'Skaut wrócił bez kandydatów',
              body,
              date: new Date(nextDay),
              isRead: false,
              type: MailType.STAFF,
              priority: foundYouths.length > 0 ? 65 : 40,
            };
          }
          const targetYouth = finalYouthPlayers.find(yp => yp.id === m.targetYouthPlayerId);
          const body = targetYouth
            ? `Raport o ${targetYouth.firstName} ${targetYouth.lastName}: talent oceniony jako ${targetYouth.revealedTalentRating ?? 'AVERAGE'}. Zalecamy dalszą obserwację.`
            : `Zakończono obserwację. Raport dostępny w Akademii.`;
          return {
            id: `SCOUT_DONE_${m.id}`,
            sender: 'Szef Skautingu Akademii',
            role: 'Akademia Piłkarska',
            subject: m.targetYouthPlayerId ? `Raport skautingowy: ${targetYouth?.lastName ?? '—'}` : 'Raport skautingowy',
            body,
            date: new Date(nextDay),
            isRead: false,
            type: MailType.STAFF,
            priority: 50,
          };
        });
        setMessages(msgs => [...mails, ...msgs]);
      }

      // 4. Sprawdź zakończenie upgrade'u akademii
      const upgradeCheck = AcademyService.checkUpgradeCompletion(academy, nextDay);
      if (upgradeCheck.completed && upgradeCheck.newLevel) {
        const upgradeMail: MailMessage = {
          id: `ACAD_UPGRADE_${Date.now()}`,
          sender: 'Dyrektor Akademii',
          role: 'Akademia Piłkarska',
          subject: `Modernizacja Akademii ukończona – Poziom ${upgradeCheck.newLevel}!`,
          body: `Prace budowlane dobiegły końca. Akademia Piłkarska osiągnęła Poziom ${upgradeCheck.newLevel}. Zwiększono liczbę miejsc i jakość szkolenia.`,
          date: new Date(nextDay),
          isRead: false,
          type: MailType.BOARD,
          priority: 85,
        };
        setMessages(msgs => [upgradeMail, ...msgs]);
      }

      // Czysty updater — bez efektów ubocznych (setMessages/setScoutPool wywołane wyżej)
      const capturedFinalYouthPlayers = finalYouthPlayers;
      const capturedUpdatedMissions = updatedMissions;
      const capturedUpgradeCheck = upgradeCheck;
      setAcademy(prev => {
        if (!prev) return prev;
        const baseResult: ClubAcademy = {
          ...prev,
          youthPlayers: capturedFinalYouthPlayers,
          activeMissions: capturedUpdatedMissions,
        };
        if (capturedUpgradeCheck.completed && capturedUpgradeCheck.newLevel) {
          return {
            ...baseResult,
            level: capturedUpgradeCheck.newLevel,
            upgradeInProgress: false,
            upgradeCompletionDate: undefined,
            operationalBudgetWeekly: AcademyService.getDefaultOperationalBudget(capturedUpgradeCheck.newLevel),
          };
        }
        return baseResult;
      });

      // 5. Tygońniówki zatrudnionych skautów
      const employedThisWeek = scoutPool.filter(s => s.employedByClubId === userTeamId);
      if (employedThisWeek.length > 0) {
        const totalSalary = employedThisWeek.reduce((sum, s) => sum + s.weeklySalary, 0);
        setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, budget: c.budget - totalSalary } : c));
        addFinanceLog(userTeamId, `Tygońniówki skautów (${employedThisWeek.length})`, -totalSalary, nextDay);
      }

      // 6. Odświeżenie rynku skautów co 45 dni
      if (scoutMarketRefreshDate) {
        const lastRefresh = new Date(scoutMarketRefreshDate);
        const daysSince = Math.floor((nextDay.getTime() - lastRefresh.getTime()) / 86400000);
        if (daysSince >= 45) {
          const userClub = clubs.find(c => c.id === userTeamId);
          if (userClub) {
            const newMarket = ScoutService.generateMarket(scoutPool, userClub.reputation ?? 5, userClub.board?.kompetencja);
            setScoutMarket(newMarket);
            setScoutMarketRefreshDate(nextDay.toISOString().split('T')[0]);
          }
        }
      }

      // 7. Tygodniowe utrzymanie wychowanków ze skauta
      const signedScoutYouths = academy.youthPlayers.filter(
        yp => yp.contractSigned === true && (yp.weeklyMaintenanceCost ?? 0) > 0
      );
      if (signedScoutYouths.length > 0) {
        const totalMaintenance = signedScoutYouths.reduce((sum, yp) => sum + (yp.weeklyMaintenanceCost ?? 0), 0);
        setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, budget: c.budget - totalMaintenance } : c));
        addFinanceLog(userTeamId, `Utrzymanie wychowanków skauta (${signedScoutYouths.length})`, -totalMaintenance, nextDay);
      }
    }

    // ── AKADEMIA: nabór wychowanków (1 Sierpnia każdego roku) ─────────────────
    if (academy && userTeamId && nextDay.getMonth() === 7 && nextDay.getDate() === 1
        && academy.lastIntakeYear < nextDay.getFullYear()) {
      const newYouths = AcademyService.generateYouthIntake(
        academy.level,
        academy.regionFocus,
        nextDay.getFullYear(),
        academy.youthPlayers.length
      );
      if (newYouths.length > 0) {
        const intakeMail: MailMessage = {
          id: `ACAD_INTAKE_${nextDay.getFullYear()}`,
          sender: 'Dyrektor Akademii',
          role: 'Akademia Piłkarska',
          subject: `Nowy Nabór Akademii ${nextDay.getFullYear()}`,
          body: `Do akademii dołączyło ${newYouths.length} nowych wychowanków (rocznik ${nextDay.getFullYear()}). Ich ukryte talenty czekają na odkrycie przez skautów. Odwiedź Akademię, aby sprawdzić profil każdego zawodnika.`,
          date: new Date(nextDay),
          isRead: false,
          type: MailType.STAFF,
          priority: 75,
        };
        setMessages(msgs => [intakeMail, ...msgs]);
        const capturedNewYouths = newYouths;
        setAcademy(prev => {
          if (!prev || prev.lastIntakeYear >= nextDay.getFullYear()) return prev;
          return {
            ...prev,
            youthPlayers: [...prev.youthPlayers, ...capturedNewYouths],
            lastIntakeYear: nextDay.getFullYear(),
          };
        });
      }
    }

    // ── AKADEMIA: decyzja właściciela o rozbudowie (sprawdzana codziennie) ────
    if (academy && userTeamId && academy.upgradeProposalStatus === 'PENDING' && academy.upgradeProposalDecisionDate) {
      const decisionDate = new Date(academy.upgradeProposalDecisionDate);
      if (nextDay >= decisionDate) {
        const userClub = clubs.find(c => c.id === userTeamId);
        const decision = AcademyService.evaluateUpgradeProposal(academy, userClub?.reputation ?? 5);
        if (decision === 'APPROVED') {
          const approveMail: MailMessage = {
            id: `ACAD_APPROVED_${Date.now()}`,
            sender: 'Właściciel Klubu',
            role: 'Zarząd',
            subject: `✅ Zgoda na rozbudowę Akademii do Poziomu ${academy.level + 1}`,
            body: `Po dokładnej analizie sytuacji finansowej i sportowej klubu, zarząd wyraża zgodę na rozbudowę Akademii Piłkarskiej do Poziomu ${academy.level + 1}. Możesz teraz zlecić rozpoczęcie prac budowlanych w zakładce Infrastruktura.`,
            date: new Date(nextDay),
            isRead: false,
            type: MailType.BOARD,
            priority: 85,
          };
          setMessages(msgs => [approveMail, ...msgs]);
          setAcademy(prev => prev ? {
            ...prev,
            upgradeProposalStatus: 'APPROVED',
            upgradeProposalDecisionDate: undefined,
          } : prev);
        } else {
          const rejectedUntil = new Date(nextDay);
          rejectedUntil.setDate(rejectedUntil.getDate() + 90);
          const rejectMail: MailMessage = {
            id: `ACAD_REJECTED_${Date.now()}`,
            sender: 'Właściciel Klubu',
            role: 'Zarząd',
            subject: `❌ Odmowa rozbudowy Akademii`,
            body: `Zarząd przeanalizował sytuację i podjął decyzję o odmowie finansowania rozbudowy Akademii w chwili obecnej. Prosimy o poprawę wyników sportowych i sytuacji finansowej klubu. Kolejny wniosek można złożyć po ${rejectedUntil.toLocaleDateString('pl-PL')}.`,
            date: new Date(nextDay),
            isRead: false,
            type: MailType.BOARD,
            priority: 80,
          };
          setMessages(msgs => [rejectMail, ...msgs]);
          setAcademy(prev => prev ? {
            ...prev,
            upgradeProposalStatus: 'REJECTED',
            upgradeProposalDecisionDate: undefined,
            upgradeProposalRejectedUntil: rejectedUntil.toISOString().split('T')[0],
          } : prev);
        }
      }
    }

    // ── ULUBIEŃCY TRENERÓW AI: aktualizacja (1. dzień miesiąca) ─────────────
    if (nextDay.getDate() === 1) {
      const updatedCoachesMonthly = AiTransferDecisionService.updateCoachFavorites(clubs, players, coaches, nextDay, sessionSeed, userTeamId);
      setCoaches(updatedCoachesMonthly);
      setPlayers(prev => AiContractService.updateClubStars(clubs, prev, userTeamId, updatedCoachesMonthly, nextDay, sessionSeed));
    }

    // ── KOSZTY OPERACYJNE: odliczenie miesięczne (1. dzień miesiąca) ─────────
    if (nextDay.getDate() === 1) {
      const dateStr = nextDay.toISOString().split('T')[0];
      setClubs(prev => prev.map(club => {
        if (club.leagueId === 'NONE') return club;
        const monthlyCost = FinanceService.calculateMonthlyOperationalCosts(club);
        const mgmtSalary = FinanceService.calculateManagementMonthlySalary(club);
        const budgetAfterOps = club.budget - monthlyCost;
        const newBudget = budgetAfterOps - mgmtSalary;
        const opexEntry = {
          id: `OPEX_${club.id}_${dateStr}`,
          date: dateStr,
          amount: -monthlyCost,
          type: 'EXPENSE' as const,
          description: 'Koszty operacyjne (stadion, infrastruktura, administracja)',
          previousBalance: club.budget,
        };
        const mgmtEntry = mgmtSalary > 0 ? {
          id: `MGMT_${club.id}_${dateStr}`,
          date: dateStr,
          amount: -mgmtSalary,
          type: 'EXPENSE' as const,
          description: 'Wynagrodzenia zarządu',
          previousBalance: budgetAfterOps,
        } : null;
        const newEntries = mgmtEntry
          ? [mgmtEntry, opexEntry]
          : [opexEntry];
        return {
          ...club,
          budget: newBudget,
          financeHistory: [...newEntries, ...(club.financeHistory || [])].slice(0, 50),
        };
      }));
    }

    // ── RATUNEK WŁAŚCICIELA: miesięczne sprawdzenie długu ────────────────────
    if (nextDay.getDate() === 1) {
      const rescueDateStr = nextDay.toISOString().split('T')[0];
      const rescueMap: Record<string, { amount: number; ownerName: string; clubName: string }> = {};
      clubs.forEach(club => {
        if (club.leagueId === 'NONE' || club.ownerRescueThisSeason || !club.management) return;
        const projected = club.budget
          - FinanceService.calculateMonthlyOperationalCosts(club)
          - FinanceService.calculateManagementMonthlySalary(club);
        if (projected >= -1_000_000) return;
        const prob = FinanceService.getOwnerRescueProbability(club.management.owner.hojnosc);
        if (Math.random() < prob) {
          const debt = Math.abs(projected);
          const bonus = FinanceService.getOwnerRescueBonus(club.management.owner.hojnosc);
          rescueMap[club.id] = {
            amount: debt + bonus,
            ownerName: `${club.management.owner.firstName} ${club.management.owner.lastName}`,
            clubName: club.name,
          };
        }
      });
      if (Object.keys(rescueMap).length > 0) {
        setClubs(prev => prev.map(club => {
          const rescue = rescueMap[club.id];
          if (!rescue) return club;
          const rescueEntry = {
            id: `RESCUE_${club.id}_${rescueDateStr}`,
            date: rescueDateStr,
            amount: rescue.amount,
            type: 'INCOME' as const,
            description: `Zastrzyk kapitałowy od właściciela — ratowanie klubu`,
            previousBalance: club.budget,
          };
          return {
            ...club,
            budget: club.budget + rescue.amount,
            ownerRescueThisSeason: true,
            financeHistory: [rescueEntry, ...(club.financeHistory || [])].slice(0, 50),
          };
        }));
        if (userTeamId) {
          const userClub = clubs.find(c => c.id === userTeamId);
          if (userClub) {
            Object.entries(rescueMap).forEach(([clubId, info]) => {
              const rescuedClub = clubs.find(c => c.id === clubId);
              if (!rescuedClub || rescuedClub.leagueId !== userClub.leagueId) return;
              const mailKey = `OWNER_RESCUE_${clubId}_${seasonNumber}`;
              if (!sentMailIdsRef.current.has(mailKey)) {
                sentMailIdsRef.current.add(mailKey);
                const mail: MailMessage = {
                  id: `rescue_${Date.now()}`,
                  sender: 'Przegląd Sportowy',
                  role: 'Redakcja',
                  subject: `${info.ownerName} ratuje ${info.clubName} przed katastrofą finansową`,
                  body: `Właściciel klubu ${info.clubName}, ${info.ownerName}, zdecydował się pokryć zobowiązania finansowe klubu z własnej kieszeni. Klub znajdował się w poważnych tarapatach finansowych zagrażających jego dalszemu funkcjonowaniu. Decyzja właściciela ocaliła klub przed bankructwem i pozwoli kontynuować rozgrywki sezonu.`,
                  date: new Date(nextDay),
                  isRead: false,
                  type: MailType.MEDIA,
                  priority: 3,
                };
                setMessages(prev => [mail, ...prev]);
              }
            });
          }
        }
      }
    }

    // ── SPRAWOZDANIE FINANSOWE: mail miesięczny (1. dzień miesiąca) ──────────
    if (nextDay.getDate() === 1 && userTeamId) {
      const monthLabel = nextDay.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
      const reportMail = {
        id: `FINANCE_REPORT_${nextDay.toISOString().split('T')[0]}`,
        sender: 'Biuro Ligowe PZPN',
        role: 'Dział Finansowy',
        subject: `Sprawozdanie finansowe lig — ${monthLabel}`,
        body: `Szanowny Panie Menedżerze,\n\nPrzesyłamy miesięczne sprawozdanie finansowe polskich lig piłkarskich.\n\nAby zobaczyć aktualne salda drużyn, proszę wybrać ligę z przycisków poniżej.`,
        date: new Date(nextDay),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 30,
        metadata: { type: 'LEAGUE_FINANCE_REPORT' as const },
      };
      setMessages(prev => [reportMail, ...prev]);
    }

    // ── ROZBUDOWA STADIONU: codzienna aktualizacja faz ───────────────────────
    if (userTeamId && !isResigned) {
      const userClub = clubs.find(c => c.id === userTeamId);
      if (userClub && (userClub.stadiumExpansionProjects?.length ?? 0) > 0) {
        const dateStr = nextDay.toISOString().split('T')[0];
        const { updatedClub, events } = StadiumExpansionService.advanceDay(userClub, dateStr);
        if (events.length > 0) {
          setClubs(prev => prev.map(c => c.id === userTeamId ? updatedClub : c));
          const stadiumMails: MailMessage[] = events.map(ev => ({
            id: `STADIUM_EV_${ev.projectId}_${dateStr}_${ev.newPhase}`,
            sender: 'Zarząd Klubu',
            role: 'Dyrektor Infrastruktury',
            subject: ev.subject,
            body: ev.body,
            date: new Date(nextDay),
            isRead: false,
            type: MailType.BOARD,
            priority: ev.isGoodNews ? 65 : 80,
          }));
          setMessages(prev => [...stadiumMails, ...prev]);
          if (events.some(e => e.newPhase === 'COMPLETED')) {
            showGameNotification({
              title: 'Rozbudowa zakończona!',
              message: `Nowa trybuna na stadionie ${userClub.stadiumName} jest gotowa!`,
              tone: 'success',
            });
          }
        }
      }
    }
    // ── END ROZBUDOWA STADIONU ────────────────────────────────────────────────

    // ── AKADEMIA: losowy event (1. dzień miesiąca) ────────────────────────────
    if (academy && userTeamId && nextDay.getDate() === 1 && academy.youthPlayers.length > 0) {
      const userClub = clubs.find(c => c.id === userTeamId);
      const eventMsg = AcademyService.tryGenerateEvent(academy, nextDay, userClub?.name ?? 'Klub');
      if (eventMsg) {
        setMessages(prev => [{
          id: `ACAD_EVENT_${Date.now()}`,
          sender: 'Dyrektor Akademii',
          role: 'Akademia Piłkarska',
          subject: 'Wiadomość z Akademii',
          body: eventMsg,
          date: new Date(nextDay),
          isRead: false,
          type: MailType.STAFF,
          priority: 45,
        }, ...prev]);
      }
    }
    // ── END AKADEMIA ──────────────────────────────────────────────────────────

    // Nie przesuwamy daty jeśli gracz musi jeszcze zagrać mecz lub potwierdzić akcję tego dnia
    if (skipDayAdvance) {
      // Resetuj GUARD ref — następne wywołanie advanceDay dla tej samej daty
      // MUSI przejść i faktycznie przesunąć datę (slot będzie już w processedDrawIds)
      lastProcessedLeagueDateRef.current = '';
      return;
    }

    setCurrentDate(nextDay);
    setLastRecoveryDate(new Date(dateToProcess));
  }, [currentDate, userTeamId, allFixtures, applySimulationResult, startNextSeason, viewState, seasonTemplate, cupParticipants, clubs, processedDrawIds, navigateTo, globalFixtures, targetJumpTime, leagues, incomingOffers, messages, activePlayoffDraw, relegationPlayoffFirstLegResults, relegationPlayoffFinalResult, promotionPlayoffSemiResults, promotionPlayoffFinalResults, sessionSeed, academy, players, showGameNotification, isResigned, buildContractStaffAlert, transferOffers, lineups]);


   const confirmCLGroupDraw = () => {
    if (!activeGroupDraw) return;
    // Zapisz grupy trwale przed wyczyszczeniem activeGroupDraw
    setClGroups(activeGroupDraw.groups);

    // Generuj fixtury fazy grupowej (6 kolejek)
    const year = activeGroupDraw.date.getFullYear();
    const matchdayDates = [
      new Date(year, 8,  18),  // MD1 — 18 września
      new Date(year, 9,  17),  // MD2 — 17 października
      new Date(year, 9,  25),  // MD3 — 25 października
      new Date(year, 10, 25),  // MD4 — 25 listopada
      new Date(year, 11,  4),  // MD5 — 4 grudnia
      new Date(year, 11, 14),  // MD6 — 14 grudnia
    ];
    const groupFixtures = CLDrawService.generateGroupStageFixtures(
      activeGroupDraw.groups,
      matchdayDates,
      year,
    );
    setGlobalFixtures(prev => [...prev, ...groupFixtures]);

    setProcessedDrawIds(prev => [...prev, activeGroupDraw.id]);
    setActiveGroupDraw(null);
    if (userTeamId && activeGroupDraw.groups.some(g => g.includes(userTeamId))) {
      const userClub = clubs.find(c => c.id === userTeamId);
      const mail: MailMessage = {
        id: `CL_GROUP_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Losowanie Fazy Grupowej Ligi Mistrzów',
        body: `Zakończono ceremonię losowania fazy grupowej Ligi Mistrzów. Sprawdź skład swojej grupy.`,
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 85
      };
      const congratsMail = MailService.createFromTemplate('board_european_advance_group_cl', { 'CLUB': userClub?.name ?? '' });
      setMessages(prev => [mail, congratsMail, ...prev]);
      setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, europeanBonusPoints: (c.europeanBonusPoints ?? 0) + 4 } : c));
    }
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  };

  const confirmELGroupDraw = () => {
    if (!activeELGroupDraw) return;
    setElGroups(activeELGroupDraw.groups);

    const year = activeELGroupDraw.date.getFullYear();
    const matchdayDates = [
      new Date(year, 8,  19),  // MD1 — 19 września
      new Date(year, 9,  18),  // MD2 — 18 października
      new Date(year, 9,  26),  // MD3 — 26 października
      new Date(year, 10, 26),  // MD4 — 26 listopada
      new Date(year, 11,  5),  // MD5 — 5 grudnia
      new Date(year, 11, 15),  // MD6 — 15 grudnia
    ];
    const groupFixtures = ELDrawService.generateGroupStageFixtures(
      activeELGroupDraw.groups,
      matchdayDates,
      year,
    );
    setGlobalFixtures(prev => [...prev, ...groupFixtures]);

    setProcessedDrawIds(prev => [...prev, activeELGroupDraw.id]);
    setActiveELGroupDraw(null);
    if (userTeamId && activeELGroupDraw.groups.some(g => g.includes(userTeamId))) {
      const userClub = clubs.find(c => c.id === userTeamId);
      const mail: MailMessage = {
        id: `EL_GROUP_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Losowanie Fazy Grupowej Ligi Europy',
        body: `Zakończono ceremonię losowania fazy grupowej Ligi Europy. Sprawdź skład swojej grupy.`,
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 82
      };
      const congratsMail = MailService.createFromTemplate('board_european_advance_group_el', { 'CLUB': userClub?.name ?? '' });
      setMessages(prev => [mail, congratsMail, ...prev]);
      setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, europeanBonusPoints: (c.europeanBonusPoints ?? 0) + 3 } : c));
    }
    const nextDayEL = new Date(currentDate);
    nextDayEL.setDate(nextDayEL.getDate() + 1);
    setCurrentDate(nextDayEL);
    navigateTo(ViewState.DASHBOARD);
  };

  const confirmCONFGroupDraw = () => {
    if (!activeConfGroupDraw) return;
    setConfGroups(activeConfGroupDraw.groups);
    const year = activeConfGroupDraw.date.getFullYear();
    const matchdayDates = [
      new Date(year, 8,  20),
      new Date(year, 9,  19),
      new Date(year, 9,  27),
      new Date(year, 10, 27),
      new Date(year, 11,  6),
      new Date(year, 11, 16),
    ];
    const groupFixtures = CONFDrawService.generateGroupStageFixtures(activeConfGroupDraw.groups, matchdayDates, year);
    setGlobalFixtures(prev => [...prev, ...groupFixtures]);
    setProcessedDrawIds(prev => [...prev, activeConfGroupDraw.id]);
    setActiveConfGroupDraw(null);
    if (userTeamId && activeConfGroupDraw.groups.some(g => g.includes(userTeamId))) {
      const userClub = clubs.find(c => c.id === userTeamId);
      const mail: MailMessage = {
        id: `CONF_GROUP_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Losowanie Fazy Grupowej Ligi Konferencji',
        body: `Zakończono ceremonię losowania fazy grupowej Ligi Konferencji UEFA. Sprawdź skład swojej grupy.`,
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 84
      };
      const congratsMail = MailService.createFromTemplate('board_european_advance_group_conf', { 'CLUB': userClub?.name ?? '' });
      setMessages(prev => [mail, congratsMail, ...prev]);
      setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, europeanBonusPoints: (c.europeanBonusPoints ?? 0) + 2 } : c));
    }
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  };

  const confirmCONFR16Draw = useCallback(() => {
    if (!confGroups) return;
    const drawYear = currentDate.getFullYear();
    const leg1Date = new Date(drawYear + 1, 0, 21); // 21 stycznia
    const leg2Date = new Date(drawYear + 1, 0, 29); // 29 stycznia
    const fixtureYear = drawYear + 1;

    const r16Fixtures = CONFDrawService.generateCONFR16Fixtures(
      confGroups, allFixtures, leg1Date, leg2Date, fixtureYear,
    );
    setGlobalFixtures(prev => [...prev, ...r16Fixtures]);

    if (userTeamId) {
      const isUserIn = r16Fixtures.some(
        f => f.leagueId === CompetitionType.CONF_R16 &&
             (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId)
      );
      const mail: MailMessage = {
        id: `CONF_R16_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Losowanie 1/8 Finału Ligi Konferencji',
        body: isUserIn
          ? 'Twój klub awansował do 1/8 finału Ligi Konferencji! Sprawdź swojego rywala w historii LK.'
          : 'Przeprowadzono losowanie 1/8 finału Ligi Konferencji. Sprawdź pary w historii LK.',
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 87,
      };
      if (isUserIn) {
        const userClub = clubs.find(c => c.id === userTeamId);
        const congratsMail = MailService.createFromTemplate('board_european_advance_r16_conf', { 'CLUB': userClub?.name ?? '' });
        setMessages(prev => [mail, congratsMail, ...prev]);
        setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, europeanBonusPoints: (c.europeanBonusPoints ?? 0) + 2 } : c));
      } else {
        setMessages(prev => [mail, ...prev]);
      }
    }

    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  }, [confGroups, allFixtures, currentDate, userTeamId, navigateTo]);

  const confirmCONFQFDraw = useCallback(() => {
    const drawYear = currentDate.getFullYear();
    const leg1Date = new Date(drawYear, 1, 18); // 18 lutego
    const leg2Date = new Date(drawYear, 2, 4);  // 4 marca
    const fixtureYear = drawYear;

    const r16Winners = CONFDrawService.getR16Winners(allFixtures);
    const r16Pool = CONFDrawService.getR16Participants(allFixtures);
    const safeR16Winners = CONFDrawService.guaranteeWinners(r16Winners, r16Pool, 8);
    const qfFixtures = CONFDrawService.generateCONFQFFixtures(
      safeR16Winners, leg1Date, leg2Date, fixtureYear, sessionSeed,
    );
    setGlobalFixtures(prev => [...prev, ...qfFixtures]);

    if (userTeamId) {
      const isUserIn = qfFixtures.some(
        f => f.leagueId === CompetitionType.CONF_QF &&
             (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId)
      );
      const mail: MailMessage = {
        id: `CONF_QF_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Losowanie 1/4 Finału Ligi Konferencji',
        body: isUserIn
          ? 'Twój klub awansował do 1/4 finału Ligi Konferencji! Sprawdź swojego rywala w historii LK.'
          : 'Przeprowadzono losowanie 1/4 finału Ligi Konferencji. Sprawdź pary w historii LK.',
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 86,
      };
      if (isUserIn) {
        const userClub = clubs.find(c => c.id === userTeamId);
        const congratsMail = MailService.createFromTemplate('board_european_advance_qf_conf', { 'CLUB': userClub?.name ?? '' });
        setMessages(prev => [mail, congratsMail, ...prev]);
        setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, europeanBonusPoints: (c.europeanBonusPoints ?? 0) + 3 } : c));
      } else {
        setMessages(prev => [mail, ...prev]);
      }
    }

    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  }, [allFixtures, currentDate, userTeamId, sessionSeed, navigateTo]);

  const confirmCONFSFDraw = useCallback(() => {
    const drawYear = currentDate.getFullYear();
    const leg1Date = new Date(drawYear, 2, 28); // 28 marca
    const leg2Date = new Date(drawYear, 3, 17); // 17 kwietnia
    const fixtureYear = drawYear;

    const qfWinners = CONFDrawService.getQFWinners(allFixtures);
    const qfPool = CONFDrawService.getQFParticipants(allFixtures);
    const safeQFWinners = CONFDrawService.guaranteeWinners(qfWinners, qfPool, 4);
    const sfFixtures = CONFDrawService.generateCONFSFFixtures(
      safeQFWinners, leg1Date, leg2Date, fixtureYear, sessionSeed,
    );
    setGlobalFixtures(prev => [...prev, ...sfFixtures]);

    if (userTeamId) {
      const isUserIn = sfFixtures.some(
        f => f.leagueId === CompetitionType.CONF_SF &&
             (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId)
      );
      const mail: MailMessage = {
        id: `CONF_SF_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Losowanie 1/2 Finału Ligi Konferencji',
        body: isUserIn
          ? 'Twój klub awansował do 1/2 finału Ligi Konferencji! Sprawdź swojego rywala w historii LK.'
          : 'Przeprowadzono losowanie 1/2 finału Ligi Konferencji. Sprawdź pary w historii LK.',
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 88,
      };
      if (isUserIn) {
        const userClub = clubs.find(c => c.id === userTeamId);
        const congratsMail = MailService.createFromTemplate('board_european_advance_sf_conf', { 'CLUB': userClub?.name ?? '' });
        setMessages(prev => [mail, congratsMail, ...prev]);
        setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, europeanBonusPoints: (c.europeanBonusPoints ?? 0) + 4 } : c));
      } else {
        setMessages(prev => [mail, ...prev]);
      }
    }

    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  }, [allFixtures, currentDate, userTeamId, sessionSeed, navigateTo]);

  const confirmELR16Draw = useCallback(() => {
    if (!elGroups) return;
    const drawYear = currentDate.getFullYear();
    const leg1Date = new Date(drawYear + 1, 0, 20); // 20 stycznia
    const leg2Date = new Date(drawYear + 1, 0, 26); // 26 stycznia
    const fixtureYear = drawYear + 1;

    const r16Fixtures = ELDrawService.generateELR16Fixtures(
      elGroups, allFixtures, leg1Date, leg2Date, fixtureYear,
    );
    setGlobalFixtures(prev => [...prev, ...r16Fixtures]);

    if (userTeamId) {
      const isUserIn = r16Fixtures.some(
        f => f.leagueId === CompetitionType.EL_R16 &&
             (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId)
      );
      const mail: MailMessage = {
        id: `EL_R16_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Losowanie 1/8 Finału Ligi Europy',
        body: isUserIn
          ? 'Twój klub awansował do 1/8 finału Ligi Europy! Sprawdź swojego rywala w historii LE.'
          : 'Przeprowadzono losowanie 1/8 finału Ligi Europy. Sprawdź pary w historii LE.',
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 88,
      };
      if (isUserIn) {
        const userClub = clubs.find(c => c.id === userTeamId);
        const congratsMail = MailService.createFromTemplate('board_european_advance_r16_el', { 'CLUB': userClub?.name ?? '' });
        setMessages(prev => [mail, congratsMail, ...prev]);
        setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, europeanBonusPoints: (c.europeanBonusPoints ?? 0) + 3 } : c));
      } else {
        setMessages(prev => [mail, ...prev]);
      }
    }

    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  }, [allFixtures, currentDate, elGroups, userTeamId, navigateTo]);

  const confirmCLR16Draw = useCallback(() => {
    if (!clGroups) return;
    // Draw jest w grudniu roku Y → mecze są w styczniu roku Y+1
    const drawYear = currentDate.getFullYear();
    const leg1Date = new Date(drawYear + 1, 0, 19); // 19 stycznia
    const leg2Date = new Date(drawYear + 1, 0, 25); // 25 stycznia
    const fixtureYear = drawYear + 1;

    const r16Fixtures = CLDrawService.generateR16Fixtures(
      clGroups, allFixtures, leg1Date, leg2Date, fixtureYear,
    );
    setGlobalFixtures(prev => [...prev, ...r16Fixtures]);

    if (userTeamId) {
      const isUserIn = r16Fixtures.some(
        f => f.leagueId === CompetitionType.CL_R16 &&
             (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId)
      );
      const mail: MailMessage = {
        id: `CL_R16_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Losowanie 1/8 Finału Ligi Mistrzów',
        body: isUserIn
          ? 'Twój klub awansował do 1/8 finału Ligi Mistrzów! Sprawdź swojego rywala w historii LM.'
          : 'Przeprowadzono losowanie 1/8 finału Ligi Mistrzów. Sprawdź pary w historii LM.',
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 90,
      };
      if (isUserIn) {
        const userClub = clubs.find(c => c.id === userTeamId);
        const congratsMail = MailService.createFromTemplate('board_european_advance_r16_cl', { 'CLUB': userClub?.name ?? '' });
        setMessages(prev => [mail, congratsMail, ...prev]);
        setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, europeanBonusPoints: (c.europeanBonusPoints ?? 0) + 4 } : c));
      } else {
        setMessages(prev => [mail, ...prev]);
      }
    }

        const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
        navigateTo(ViewState.DASHBOARD);
  }, [allFixtures, currentDate, userTeamId, sessionSeed, navigateTo]);

  const confirmCLQFDraw = useCallback(() => {
    const drawYear = currentDate.getFullYear();
    const leg1Date = new Date(drawYear, 1, 16); // 16 lutego
    const leg2Date = new Date(drawYear, 2, 2);  // 2 marca
    const fixtureYear = drawYear;

    const r16Winners = CLDrawService.getR16Winners(allFixtures);
    const r16Pool = CLDrawService.getR16Participants(allFixtures);
    const safeR16Winners = CLDrawService.guaranteeWinners(r16Winners, r16Pool, 8);
    const qfFixtures = CLDrawService.generateQFFixtures(
      safeR16Winners, leg1Date, leg2Date, fixtureYear, sessionSeed,
    );
    setGlobalFixtures(prev => [...prev, ...qfFixtures]);

    if (userTeamId) {
      const isUserIn = qfFixtures.some(
        f => f.leagueId === CompetitionType.CL_QF &&
             (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId)
      );
      const mail: MailMessage = {
        id: `CL_QF_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Losowanie 1/4 Finału Ligi Mistrzów',
        body: isUserIn
          ? 'Twój klub awansował do 1/4 finału Ligi Mistrzów! Sprawdź swojego rywala w historii LM.'
          : 'Przeprowadzono losowanie 1/4 finału Ligi Mistrzów. Sprawdź pary w historii LM.',
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 90,
      };
      if (isUserIn) {
        const userClub = clubs.find(c => c.id === userTeamId);
        const congratsMail = MailService.createFromTemplate('board_european_advance_qf_cl', { 'CLUB': userClub?.name ?? '' });
        setMessages(prev => [mail, congratsMail, ...prev]);
        setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, europeanBonusPoints: (c.europeanBonusPoints ?? 0) + 5 } : c));
      } else {
        setMessages(prev => [mail, ...prev]);
      }
    }

    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  }, [allFixtures, currentDate, userTeamId, sessionSeed, navigateTo]);

  const confirmCLSFDraw = useCallback(() => {
    const drawYear = currentDate.getFullYear();
    const leg1Date = new Date(drawYear, 2, 26); // 26 marca
    const leg2Date = new Date(drawYear, 3, 15); // 15 kwietnia
    const fixtureYear = drawYear;

    const qfWinners = CLDrawService.getQFWinners(allFixtures);
    const qfPool = CLDrawService.getQFParticipants(allFixtures);
    const safeQFWinners = CLDrawService.guaranteeWinners(qfWinners, qfPool, 4);
    const sfFixtures = CLDrawService.generateSFFixtures(
      safeQFWinners, leg1Date, leg2Date, fixtureYear, sessionSeed,
    );
    setGlobalFixtures(prev => [...prev, ...sfFixtures]);

    if (userTeamId) {
      const isUserIn = sfFixtures.some(
        f => f.leagueId === CompetitionType.CL_SF &&
             (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId)
      );
      const mail: MailMessage = {
        id: `CL_SF_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Losowanie 1/2 Finału Ligi Mistrzów',
        body: isUserIn
          ? 'Twój klub awansował do 1/2 finału Ligi Mistrzów! Sprawdź swojego rywala w historii LM.'
          : 'Przeprowadzono losowanie 1/2 finału Ligi Mistrzów. Sprawdź pary w historii LM.',
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 90,
      };
      if (isUserIn) {
        const userClub = clubs.find(c => c.id === userTeamId);
        const congratsMail = MailService.createFromTemplate('board_european_advance_sf_cl', { 'CLUB': userClub?.name ?? '' });
        setMessages(prev => [mail, congratsMail, ...prev]);
        setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, europeanBonusPoints: (c.europeanBonusPoints ?? 0) + 6 } : c));
      } else {
        setMessages(prev => [mail, ...prev]);
      }
    }

    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  }, [allFixtures, currentDate, userTeamId, sessionSeed, navigateTo]);

  const confirmELQFDraw = useCallback(() => {
    const drawYear = currentDate.getFullYear();
    const leg1Date = new Date(drawYear, 1, 17); // 17 lutego
    const leg2Date = new Date(drawYear, 2, 3);  // 3 marca
    const fixtureYear = drawYear;

    const r16Winners = ELDrawService.getR16Winners(allFixtures);
    const r16Pool = ELDrawService.getR16Participants(allFixtures);
    const safeR16Winners = ELDrawService.guaranteeWinners(r16Winners, r16Pool, 8);
    const qfFixtures = ELDrawService.generateQFFixtures(
      safeR16Winners, leg1Date, leg2Date, fixtureYear, sessionSeed,
    );
    setGlobalFixtures(prev => [...prev, ...qfFixtures]);

    if (userTeamId) {
      const isUserIn = qfFixtures.some(
        f => f.leagueId === CompetitionType.EL_QF &&
             (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId)
      );
      const mail: MailMessage = {
        id: `EL_QF_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Losowanie 1/4 Finału Ligi Europy',
        body: isUserIn
          ? 'Twój klub awansował do 1/4 finału Ligi Europy! Sprawdź swojego rywala w historii LE.'
          : 'Przeprowadzono losowanie 1/4 finału Ligi Europy. Sprawdź pary w historii LE.',
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 88,
      };
      if (isUserIn) {
        const userClub = clubs.find(c => c.id === userTeamId);
        const congratsMail = MailService.createFromTemplate('board_european_advance_qf_el', { 'CLUB': userClub?.name ?? '' });
        setMessages(prev => [mail, congratsMail, ...prev]);
        setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, europeanBonusPoints: (c.europeanBonusPoints ?? 0) + 4 } : c));
      } else {
        setMessages(prev => [mail, ...prev]);
      }
    }

    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  }, [allFixtures, currentDate, userTeamId, sessionSeed, navigateTo]);

  const confirmELSFDraw = useCallback(() => {
    const drawYear = currentDate.getFullYear();
    const leg1Date = new Date(drawYear, 2, 27); // 27 marca
    const leg2Date = new Date(drawYear, 3, 16); // 16 kwietnia
    const fixtureYear = drawYear;

    const qfWinners = ELDrawService.getQFWinners(allFixtures);
    const qfPool = ELDrawService.getQFParticipants(allFixtures);
    const safeQFWinners = ELDrawService.guaranteeWinners(qfWinners, qfPool, 4);
    const sfFixtures = ELDrawService.generateSFFixtures(
      safeQFWinners, leg1Date, leg2Date, fixtureYear, sessionSeed,
    );
    setGlobalFixtures(prev => [...prev, ...sfFixtures]);

    if (userTeamId) {
      const isUserIn = sfFixtures.some(
        f => f.leagueId === CompetitionType.EL_SF &&
             (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId)
      );
      const mail: MailMessage = {
        id: `EL_SF_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Losowanie 1/2 Finału Ligi Europy',
        body: isUserIn
          ? 'Twój klub awansował do 1/2 finału Ligi Europy! Sprawdź swojego rywala w historii LE.'
          : 'Przeprowadzono losowanie 1/2 finału Ligi Europy. Sprawdź pary w historii LE.',
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 88,
      };
      if (isUserIn) {
        const userClub = clubs.find(c => c.id === userTeamId);
        const congratsMail = MailService.createFromTemplate('board_european_advance_sf_el', { 'CLUB': userClub?.name ?? '' });
        setMessages(prev => [mail, congratsMail, ...prev]);
        setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, europeanBonusPoints: (c.europeanBonusPoints ?? 0) + 5 } : c));
      } else {
        setMessages(prev => [mail, ...prev]);
      }
    }

    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  }, [allFixtures, currentDate, userTeamId, sessionSeed, navigateTo]);

  const confirmELFinalDraw = useCallback(() => {
    const finalAlreadyExists = allFixtures.some(f => f.leagueId === CompetitionType.EL_FINAL);
    if (!finalAlreadyExists) {
      const sfWinners = ELDrawService.getSFWinners(allFixtures);
      const sfPool = ELDrawService.getSFParticipants(allFixtures);
      const safeSFWinners = ELDrawService.guaranteeWinners(sfWinners, sfPool, 2);
      if (safeSFWinners.length === 2) {
        const finalDate = new Date(currentDate.getFullYear(), 4, 20);
        const finalFixture = ELDrawService.generateFinalFixture(
          safeSFWinners[0], safeSFWinners[1], finalDate, finalDate.getFullYear()
        );
        setGlobalFixtures(prev => [...prev, finalFixture]);
      }
    }

    if (userTeamId) {
      const sfWinners = ELDrawService.getSFWinners(allFixtures);
      const isUserIn = sfWinners.includes(userTeamId);
      const mail: MailMessage = {
        id: `EL_FINAL_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Ogłoszenie Finalistów Ligi Europy',
        body: isUserIn
          ? 'Twój klub awansował do Finału Ligi Europy! Sprawdź szczegóły w historii LE.'
          : 'Ogłoszono finaliśtów Ligi Europy. Sprawdź parę finałową w historii LE.',
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 90,
      };
      if (isUserIn) {
        const userClub = clubs.find(c => c.id === userTeamId);
        const congratsMail = MailService.createFromTemplate('board_european_advance_final_el', { 'CLUB': userClub?.name ?? '' });
        setMessages(prev => [mail, congratsMail, ...prev]);
        setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, europeanBonusPoints: (c.europeanBonusPoints ?? 0) + 6 } : c));
      } else {
        setMessages(prev => [mail, ...prev]);
      }
    }

    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  }, [allFixtures, currentDate, userTeamId, navigateTo]);

  const confirmCONFFinalDraw = useCallback(() => {
    const finalAlreadyExists = allFixtures.some(f => f.leagueId === CompetitionType.CONF_FINAL);
    if (!finalAlreadyExists) {
      const sfWinners = CONFDrawService.getSFWinners(allFixtures);
      const sfPool = CONFDrawService.getSFParticipants(allFixtures);
      const safeSFWinners = CONFDrawService.guaranteeWinners(sfWinners, sfPool, 2);
      if (safeSFWinners.length === 2) {
        const finalDate = new Date(currentDate.getFullYear(), 4, 27);
        const finalFixture = CONFDrawService.generateFinalFixture(
          safeSFWinners[0], safeSFWinners[1], finalDate, finalDate.getFullYear()
        );
        setGlobalFixtures(prev => [...prev, finalFixture]);
      }
    }
    if (userTeamId) {
      const sfWinners = CONFDrawService.getSFWinners(allFixtures);
      const isUserIn = sfWinners.includes(userTeamId);
      const mail: MailMessage = {
        id: `CONF_FINAL_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Ogłoszenie Finalistów Ligi Konferencji',
        body: isUserIn
          ? 'Twój klub awansował do Finału Ligi Konferencji! Sprawdź szczegóły w historii LK.'
          : 'Ogłoszono finalistów Ligi Konferencji. Sprawdź parę finałową w historii LK.',
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 90,
      };
      if (isUserIn) {
        const userClub = clubs.find(c => c.id === userTeamId);
        const congratsMail = MailService.createFromTemplate('board_european_advance_final_conf', { 'CLUB': userClub?.name ?? '' });
        setMessages(prev => [mail, congratsMail, ...prev]);
        setClubs(prev => prev.map(c => c.id === userTeamId ? { ...c, europeanBonusPoints: (c.europeanBonusPoints ?? 0) + 5 } : c));
      } else {
        setMessages(prev => [mail, ...prev]);
      }
    }
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  }, [allFixtures, currentDate, userTeamId, navigateTo]);

  const confirmPlayoffDraw = useCallback(() => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  }, [currentDate, navigateTo]);

  // ── BARAŻE O UTRZYMANIE — przyciski "Dalej" ──────────────────────────────

  // Gracz potwierdza widok wyników 26 maja — przechodzi do następnego dnia
  const confirmRelegationPlayoffMatch1 = useCallback(() => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  }, [currentDate, navigateTo]);

  // Gracz potwierdza widok wyników 29 maja — czyści stan i przechodzi do następnego dnia
  const confirmRelegationPlayoffMatch2 = useCallback(() => {
    // Nie czyścimy relegationPlayoffFinalResult — startNextSeason potrzebuje go do zmiany lig
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  }, [currentDate, navigateTo]);

  // Gracz potwierdza widok półfinałów 31 maja — przechodzi do następnego dnia
  const confirmPromotionPlayoffSemi = useCallback(() => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  }, [currentDate, navigateTo]);

  // Gracz potwierdza widok finałów 4 czerwca — przechodzi do następnego dnia
  const confirmPromotionPlayoffFinal = useCallback(() => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  }, [currentDate, navigateTo]);

  const confirmSeasonEnd = useCallback(() => {
    const nextSeasonYear = currentDate.getFullYear() + 1;
    // Uruchom nowy sezon i przesuń datę na 1 lipca
    // Przegląd składów AI zostanie wykonany automatycznie 2 lipca przez advanceDay
    startNextSeason(nextSeasonYear);
    setCurrentDate(new Date(nextSeasonYear, 6, 1));
  }, [currentDate, userTeamId, startNextSeason]);

  const confirmCupDraw = (pairs: Fixture[]) => {
    if (!activeCupDraw) return;
    const drawId = activeCupDraw.id;
    
    const participantIds = new Set<string>();
    pairs.forEach(f => { participantIds.add(f.homeTeamId); participantIds.add(f.awayTeamId); });
    
    setClubs(prev => prev.map(c => ({
       ...c,
       isInPolishCup: participantIds.has(c.id)
    })));

       setGlobalFixtures(prev => [...prev, ...pairs]);

    // ── Tworzenie fixtures meczowych po losowaniu ──
    const year = currentDate.getFullYear();
  


    setProcessedDrawIds(prev => [...prev, drawId]);


    setActiveCupDraw(null);

    if (userTeamId) {
      const isUserIn = pairs.some(f => f.homeTeamId === userTeamId || f.awayTeamId === userTeamId);
      const mail: MailMessage = { 
        id: `CUP_DRAW_${Date.now()}`, 
        sender: 'Sekretariat PZPN', 
        role: 'Biuro Rozgrywek', 
        subject: 'Zakończono losowanie Pucharu Polski', 
        body: isUserIn ? `Wylosowano pary nadchodzącej rundy. Nasz zespół trafił na kolejnego przeciwnika. Szczegóły w terminarzu.` : `Zakończono losowanie kolejnej rundy Pucharu Polski. Nasz zespół niestety odpadł z rozgrywek.`, 
        date: new Date(currentDate), 
        isRead: false, 
        type: MailType.SYSTEM, 
        priority: 80 
      };
      setMessages(prev => [mail, ...prev]);
    }

    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  };

  const confirmCLDraw = (pairs: Fixture[]) => {
    if (!activeCupDraw) return;
    const drawId = activeCupDraw.id;
    setGlobalFixtures(prev => [...prev, ...pairs]);

    const year = currentDate.getFullYear();
    const matchFixtures: Fixture[] = [];
    const isR2Q = pairs.length > 0 && pairs[0].leagueId === CompetitionType.CL_R2Q_DRAW;

    pairs.forEach((pair, i) => {
      const pairNum = i + 1;
      if (isR2Q) {
        matchFixtures.push({
          id: `CL_R2Q_MATCH_${pairNum}_${year}`,
          leagueId: CompetitionType.CL_R2Q,
          homeTeamId: pair.homeTeamId,
          awayTeamId: pair.awayTeamId,
          date: new Date(year, 6, 27),  // 27 lipca
          status: MatchStatus.SCHEDULED,
          homeScore: null,
          awayScore: null,
        });
        matchFixtures.push({
          id: `CL_R2Q_MATCH_${pairNum}_${year}_RETURN`,
          leagueId: CompetitionType.CL_R2Q_RETURN,
          homeTeamId: pair.awayTeamId,
          awayTeamId: pair.homeTeamId,
          date: new Date(year, 7, 14),  // 14 sierpnia
          status: MatchStatus.SCHEDULED,
          homeScore: null,
          awayScore: null,
        });
      } else {
        matchFixtures.push({
          id: `CL_R1Q_MATCH_${pairNum}_${year}`,
          leagueId: CompetitionType.CL_R1Q,
          homeTeamId: pair.homeTeamId,
          awayTeamId: pair.awayTeamId,
          date: new Date(year, 6, 11),
          status: MatchStatus.SCHEDULED,
          homeScore: null,
          awayScore: null,
        });
        matchFixtures.push({
          id: `CL_R1Q_MATCH_${pairNum}_${year}_RETURN`,
          leagueId: CompetitionType.CL_R1Q_RETURN,
          homeTeamId: pair.awayTeamId,
          awayTeamId: pair.homeTeamId,
          date: new Date(year, 6, 15),
          status: MatchStatus.SCHEDULED,
          homeScore: null,
          awayScore: null,
        });
      }
    });
    setGlobalFixtures(prev => [...prev, ...matchFixtures]);
    // ── koniec ──


    setProcessedDrawIds(prev => [...prev, drawId]);
    setActiveCupDraw(null);
    if (userTeamId) {
      const isUserIn = pairs.some(f => f.homeTeamId === userTeamId || f.awayTeamId === userTeamId);
      const mail: MailMessage = {
        id: `CL_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Zakończono losowanie Ligi Mistrzów',
        body: isUserIn
          ? `Wylosowano pary rundy wstępnej Ligi Mistrzów. Nasz zespół trafił na przeciwnika. Szczegóły dostępne w drabince rozgrywek.`
          : `Zakończono ceremonię losowania rundy wstępnej Ligi Mistrzów. Zapraszamy do zapoznania się z wylosowanymi parami.`,
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 85
      };
      setMessages(prev => [mail, ...prev]);
    }
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  };

  // ── Liga Europy: potwierdzenie losowania R1Q ─────────────────────────────
  const confirmELDraw = (pairs: Fixture[]) => {
    if (!activeCupDraw) return;
    const drawId = activeCupDraw.id;

    // Zapisz pary (draw fixtures)
    setGlobalFixtures(prev => [...prev, ...pairs]);

    const year = currentDate.getFullYear();
    const matchFixtures: Fixture[] = [];

    pairs.forEach((pair, i) => {
      const pairNum = i + 1;
      matchFixtures.push({
        id: `EL_R1Q_MATCH_${pairNum}_${year}`,
        leagueId: CompetitionType.EL_R1Q,
        homeTeamId: pair.homeTeamId,
        awayTeamId: pair.awayTeamId,
        date: new Date(year, 6, 5),   // 5 lipca
        status: MatchStatus.SCHEDULED,
        homeScore: null,
        awayScore: null,
      });
      matchFixtures.push({
        id: `EL_R1Q_MATCH_${pairNum}_${year}_RETURN`,
        leagueId: CompetitionType.EL_R1Q_RETURN,
        homeTeamId: pair.awayTeamId,
        awayTeamId: pair.homeTeamId,
        date: new Date(year, 6, 10),  // 10 lipca
        status: MatchStatus.SCHEDULED,
        homeScore: null,
        awayScore: null,
      });
    });
    setGlobalFixtures(prev => [...prev, ...matchFixtures]);

    setProcessedDrawIds(prev => [...prev, drawId]);
    setActiveCupDraw(null);

    if (userTeamId) {
      const mail: MailMessage = {
        id: `EL_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Zakończono losowanie Ligi Europy — Runda 1',
        body: 'Zakończono ceremonię losowania Rundy 1 Kwalifikacyjnej Ligi Europy UEFA. Zapraszamy do zapoznania się z wylosowanymi parami.',
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 82,
      };
      setMessages(prev => [mail, ...prev]);
    }

    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  };

  // ── Liga Konferencji: potwierdzenie losowania R1Q ────────────────────────
  const confirmCONFDraw = (pairs: Fixture[]) => {
    if (!activeCupDraw) return;
    const drawId = activeCupDraw.id;

    // Zapisz pary (draw fixtures)
    setGlobalFixtures(prev => [...prev, ...pairs]);

    const year = currentDate.getFullYear();
    const matchFixtures: Fixture[] = [];

    pairs.forEach((pair, i) => {
      const pairNum = i + 1;
      matchFixtures.push({
        id: `CONF_R1Q_MATCH_${pairNum}_${year}`,
        leagueId: CompetitionType.CONF_R1Q,
        homeTeamId: pair.homeTeamId,
        awayTeamId: pair.awayTeamId,
        date: new Date(year, 6, 14),   // 14 lipca
        status: MatchStatus.SCHEDULED,
        homeScore: null,
        awayScore: null,
      });
      matchFixtures.push({
        id: `CONF_R1Q_MATCH_${pairNum}_${year}_RETURN`,
        leagueId: CompetitionType.CONF_R1Q_RETURN,
        homeTeamId: pair.awayTeamId,
        awayTeamId: pair.homeTeamId,
        date: new Date(year, 6, 17),  // 17 lipca
        status: MatchStatus.SCHEDULED,
        homeScore: null,
        awayScore: null,
      });
    });
    setGlobalFixtures(prev => [...prev, ...matchFixtures]);

    setProcessedDrawIds(prev => [...prev, drawId]);
    setActiveCupDraw(null);

    if (userTeamId) {
      const mail: MailMessage = {
        id: `CONF_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Zakończono losowanie Ligi Konferencji — Runda 1',
        body: 'Zakończono ceremonię losowania Rundy 1 Kwalifikacyjnej Ligi Konferencji UEFA. Zapraszamy do zapoznania się z wylosowanymi parami.',
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 87,
      };
      setMessages(prev => [mail, ...prev]);
    }

    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  };

  // ── Liga Konferencji: potwierdzenie losowania R2Q ───────────────────────
  const confirmCONFR2QDraw = (pairs: Fixture[]) => {
    if (!activeCupDraw) return;
    const drawId = activeCupDraw.id;

    setGlobalFixtures(prev => [...prev, ...pairs]);

    const year = currentDate.getFullYear();
    const matchFixtures: Fixture[] = [];

    pairs.forEach((pair, i) => {
      const pairNum = i + 1;
      matchFixtures.push({
        id: `CONF_R2Q_MATCH_${pairNum}_${year}`,
        leagueId: CompetitionType.CONF_R2Q,
        homeTeamId: pair.homeTeamId,
        awayTeamId: pair.awayTeamId,
        date: new Date(year, 6, 28),   // 28 lipca
        status: MatchStatus.SCHEDULED,
        homeScore: null,
        awayScore: null,
      });
      matchFixtures.push({
        id: `CONF_R2Q_MATCH_${pairNum}_${year}_RETURN`,
        leagueId: CompetitionType.CONF_R2Q_RETURN,
        homeTeamId: pair.awayTeamId,
        awayTeamId: pair.homeTeamId,
        date: new Date(year, 7, 16),  // 16 sierpnia
        status: MatchStatus.SCHEDULED,
        homeScore: null,
        awayScore: null,
      });
    });
    setGlobalFixtures(prev => [...prev, ...matchFixtures]);

    setProcessedDrawIds(prev => [...prev, drawId]);
    setActiveCupDraw(null);

    if (userTeamId) {
      const mail: MailMessage = {
        id: `CONF_R2Q_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Zakończono losowanie Ligi Konferencji — Runda 2',
        body: 'Zakończono ceremonię losowania Rundy 2 Kwalifikacyjnej Ligi Konferencji UEFA. Zapraszamy do zapoznania się z wylosowanymi parami.',
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 87,
      };
      setMessages(prev => [mail, ...prev]);
    }

    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  };

  // ── Liga Europy: potwierdzenie losowania R2Q ─────────────────────────────
  const confirmELR2QDraw = (pairs: Fixture[]) => {
    if (!activeCupDraw) return;
    const drawId = activeCupDraw.id;

    setGlobalFixtures(prev => [...prev, ...pairs]);

    const year = currentDate.getFullYear();
    const matchFixtures: Fixture[] = [];

    pairs.forEach((pair, i) => {
      const pairNum = i + 1;
      matchFixtures.push({
        id: `EL_R2Q_MATCH_${pairNum}_${year}`,
        leagueId: CompetitionType.EL_R2Q,
        homeTeamId: pair.homeTeamId,
        awayTeamId: pair.awayTeamId,
        date: new Date(year, 7, 8),   // 8 sierpnia
        status: MatchStatus.SCHEDULED,
        homeScore: null,
        awayScore: null,
      });
      matchFixtures.push({
        id: `EL_R2Q_MATCH_${pairNum}_${year}_RETURN`,
        leagueId: CompetitionType.EL_R2Q_RETURN,
        homeTeamId: pair.awayTeamId,
        awayTeamId: pair.homeTeamId,
        date: new Date(year, 7, 15),  // 15 sierpnia
        status: MatchStatus.SCHEDULED,
        homeScore: null,
        awayScore: null,
      });
    });
    setGlobalFixtures(prev => [...prev, ...matchFixtures]);

    setProcessedDrawIds(prev => [...prev, drawId]);
    setActiveCupDraw(null);

    if (userTeamId) {
      const mail: MailMessage = {
        id: `EL_R2Q_DRAW_${Date.now()}`,
        sender: 'UEFA',
        role: 'Biuro Rozgrywek UEFA',
        subject: 'Zakończono losowanie Ligi Europy — Runda 2',
        body: 'Zakończono ceremonię losowania Rundy 2 Kwalifikacyjnej Ligi Europy UEFA. Zapraszamy do zapoznania się z wylosowanymi parami.',
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 82,
      };
      setMessages(prev => [mail, ...prev]);
    }

    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    navigateTo(ViewState.DASHBOARD);
  };

  const markMessageRead = (id: string) => setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  const deleteMessage = (id: string) => setMessages(prev => prev.filter(m => m.id !== id));

  const respondToSportingDirectorObjective = useCallback((response: import('../types').SportingDirectorObjectiveResponse) => {
    if (!userTeamId) return;

    const userClub = clubs.find(c => c.id === userTeamId);
    if (!userClub?.sportingDirector || !userClub.sportingDirectorObjective || userClub.sportingDirectorObjective.status !== 'ACTIVE') {
      showGameNotification({
        title: 'Brak aktywnego celu',
        message: 'Dyrektor sportowy nie ma teraz celu do omowienia.',
        tone: 'info',
      });
      return;
    }

    if (sportingDirectorObjectiveResponseLockRef.current === userClub.sportingDirectorObjective.id) {
      showGameNotification({
        title: 'Odpowiedz juz wyslana',
        message: 'Dyrektor czeka juz na rozliczenie tego celu.',
        tone: 'info',
      });
      return;
    }

    sportingDirectorObjectiveResponseLockRef.current = userClub.sportingDirectorObjective.id;

    const decision = SportingDirectorService.respondToObjective({
      club: userClub,
      date: currentDate,
      response,
    });

    setClubs(prev => prev.map(club => club.id === userTeamId ? decision.updatedClub : club));
    if (decision.mail) {
      prependUniqueMessages([decision.mail], true);
    }
    showGameNotification({
      title: 'Rozmowa z dyrektorem',
      message: decision.message,
      tone: response === 'CHALLENGE' ? 'warning' : 'info',
    });
  }, [clubs, currentDate, showGameNotification, userTeamId]);

  const submitBoardClubRequest = useCallback((requestType: BoardClubRequestType) => {
    if (!userTeamId) return;
    const userClub = clubs.find(c => c.id === userTeamId);
    if (!userClub) return;

    const date = currentDate instanceof Date ? currentDate : new Date(currentDate);
    const squad = players[userTeamId] || [];
    const wageBill = FinanceService.calculateTotalSalaries(squad);
    const avgSalary = squad.length > 0 ? Math.round(wageBill / squad.length) : 0;
    const formatPln = (value: number) => `${Math.round(value).toLocaleString('pl-PL')} PLN`;
    const levelScore = (level?: import('../types').BoardAttributeLevel): number => ({
      bardzo_niska: 0,
      niska: 1,
      przecietna: 2,
      wysoka: 3,
      bardzo_wysoka: 4,
    }[level ?? 'przecietna']);

    if (requestType === 'WAGE_COST_CONTROL') {
      const pressureRatio = userClub.budget > 0 ? wageBill / userClub.budget : 9;
      const pressureLabel = pressureRatio >= 0.85
        ? 'bardzo wysoka'
        : pressureRatio >= 0.65
          ? 'wysoka'
          : pressureRatio >= 0.45
            ? 'umiarkowana'
            : 'bezpieczna';
      const message = `Roczny fundusz płac: ${formatPln(wageBill)}. Średnia pensja: ${formatPln(avgSalary)}. Presja względem salda klubu: ${pressureLabel}.`;

      setMessages(prev => [{
        id: `BOARD_WAGE_REPORT_${userTeamId}_${Date.now()}`,
        sender: 'Zarząd Klubu',
        role: 'Dyrektor finansowy',
        subject: 'Raport kontroli kosztów płac',
        body: `Panie Managerze,\n\nPrzygotowaliśmy krótką ocenę struktury płacowej pierwszej drużyny.\n\n${message}\n\n${pressureRatio >= 0.65 ? 'Zalecamy ostrożność przy nowych kontraktach i rozważenie sprzedaży lub renegocjacji najdroższych umów.' : 'Aktualna struktura płac nie wymaga natychmiastowej interwencji.'}\n\nZ poważaniem,\nZarząd Klubu`,
        date,
        isRead: false,
        type: MailType.BOARD,
        priority: 62,
      }, ...prev]);
      showGameNotification({
        title: 'Raport płacowy',
        message,
        tone: pressureRatio >= 0.65 ? 'warning' : 'info',
      });
      return;
    }

    if (requestType === 'RESERVE_STATUS') {
      const reserveBudget = Math.max(0, userClub.reserveBudget ?? FinanceService.calculateInitialReserveBudget(userClub.budget, userClub.reputation));
      const transferCap = FinanceService.calculateTransferBudgetCap(userClub.budget, userClub.reputation, wageBill);
      const reserveLabel = reserveBudget >= transferCap * 0.45
        ? 'wysoka'
        : reserveBudget >= transferCap * 0.22
          ? 'stabilna'
          : reserveBudget > 0
            ? 'niska'
            : 'wyczerpana';
      const message = `Rezerwa zarządu: ${formatPln(reserveBudget)}. Ocena: ${reserveLabel}. Te środki mogą zostać użyte przy specjalnych prośbach, dofinansowaniu budżetu transferowego albo awaryjnym wsparciu salda klubu.`;

      setMessages(prev => [{
        id: `BOARD_RESERVE_REPORT_${userTeamId}_${Date.now()}`,
        sender: 'Zarząd Klubu',
        role: 'Dyrektor finansowy',
        subject: 'Raport rezerwy zarządu',
        body: `Panie Managerze,\n\n${message}\n\nZ poważaniem,\nZarząd Klubu`,
        date,
        isRead: false,
        type: MailType.BOARD,
        priority: 62,
      }, ...prev]);
      showGameNotification({
        title: 'Rezerwa zarządu',
        message,
        tone: reserveBudget > 0 ? 'info' : 'warning',
      });
      return;
    }

    const requestsUsed = userClub.boardBudgetRequestsThisSeason ?? 0;
    if (requestsUsed >= 2) {
      showGameNotification({
        title: 'Wniosek odrzucony',
        message: 'Zarząd wyczerpał limit specjalnych próśb finansowych w tym sezonie.',
        tone: 'warning',
      });
      return;
    }

    const board = userClub.board;
    const confidence = userClub.boardConfidence ?? 70;
    const generosity = levelScore(board?.hojnosc);
    const ambition = levelScore(board?.ambicja);
    const greed = levelScore(board?.chciwosc);
    const competence = levelScore(board?.kompetencja);
    const reserveBudget = Math.max(0, userClub.reserveBudget ?? FinanceService.calculateInitialReserveBudget(userClub.budget, userClub.reputation));
    const reservePressure = reserveBudget <= 0 ? -35 : reserveBudget < userClub.budget * 0.025 ? -14 : 0;
    const wagePressureRatio = userClub.budget > 0 ? wageBill / userClub.budget : 9;
    const pressureBonus = userClub.budget < Math.max(wageBill * 0.65, 2_000_000) ? 10 : 0;
    const roll = Math.random() * 100;
    let chance = 12 + generosity * 7 + Math.max(0, confidence - 55) * 0.25 - greed * 6;
    const financialChanceCap = {
      CLUB_FUNDS: [5, 16, 34, 56, 76],
      TRANSFER_BUDGET: [7, 20, 40, 62, 82],
    } as const;
    let amount = 0;
    let subject = '';
    let successTitle = '';
    let successMessage = '';
    let updatedClubPatch: Partial<Club> = {};

    if (requestType === 'CLUB_FUNDS') {
      chance += pressureBonus - 18 + (wagePressureRatio >= 0.9 ? 8 : 0) + reservePressure;
      const generosityAmountFactor = [0.018, 0.028, 0.045, 0.065, 0.085][generosity];
      amount = Math.max(150_000, Math.round(userClub.budget * generosityAmountFactor));
      amount = Math.min(amount, Math.max(350_000, userClub.reputation * (450_000 + generosity * 220_000)));
      amount = Math.min(amount, reserveBudget);
      if (amount <= 0) chance = 0;
      chance = Math.min(chance, financialChanceCap.CLUB_FUNDS[generosity] + Math.floor(pressureBonus * 0.5));
      subject = 'Dodatkowe środki klubowe';
      successTitle = 'Środki przyznane';
      successMessage = `Zarząd przyznał dodatkowe środki klubowe z rezerwy: ${formatPln(amount)}.`;
      updatedClubPatch = {
        budget: userClub.budget + amount,
        reserveBudget: reserveBudget - amount,
      };
    }

    if (requestType === 'TRANSFER_BUDGET') {
      chance += ambition * 4 - 14 + reservePressure;
      amount = Math.max(200_000, Math.round(userClub.transferBudget * (0.045 + generosity * 0.018) + userClub.budget * (0.008 + generosity * 0.004)));
      amount = Math.min(amount, Math.max(450_000, userClub.reputation * (550_000 + generosity * 240_000)));
      amount = Math.min(amount, reserveBudget);
      const transferBudgetCap = FinanceService.calculateTransferBudgetCap(userClub.budget, userClub.reputation, wageBill);
      const nextTransferBudget = Math.max(
        userClub.transferBudget,
        Math.min(userClub.transferBudget + amount, transferBudgetCap)
      );
      amount = Math.max(0, nextTransferBudget - userClub.transferBudget);
      if (amount <= 0) chance = 0;
      chance = Math.min(chance, financialChanceCap.TRANSFER_BUDGET[generosity]);
      subject = 'Zwiększenie budżetu transferowego';
      successTitle = 'Budżet transferowy zwiększony';
      successMessage = `Zarząd przesunął z rezerwy na budżet transferowy ${formatPln(amount)}.`;
      updatedClubPatch = {
        transferBudget: nextTransferBudget,
        reserveBudget: reserveBudget - amount,
      };
    }

    if (requestType === 'EXCEPTIONAL_CONTRACT') {
      chance += competence * 5 + Math.max(0, confidence - 60) * 0.25 - 10 + (reserveBudget < avgSalary ? -8 : 0);
      subject = 'Zgoda na wyjątkowy kontrakt';
      successTitle = 'Zgoda kontraktowa';
      successMessage = 'Zarząd przyznał jednorazową zgodę na wyjątkowy kontrakt. Zgoda złagodzi veto zarządu przy najbliższym zaakceptowanym kontrakcie.';
      updatedClubPatch = { boardExceptionalContractApprovals: (userClub.boardExceptionalContractApprovals ?? 0) + 1 };
    }

    const approved = chance > 0 && roll <= Math.max(2, Math.min(82, chance));
    const nextRequestsUsed = requestsUsed + 1;
    const financeLog = amount > 0 && approved && (requestType === 'CLUB_FUNDS' || requestType === 'TRANSFER_BUDGET')
      ? {
          id: Math.random().toString(36).substr(2, 9),
          date: date.toISOString().split('T')[0],
          amount: requestType === 'CLUB_FUNDS' ? amount : -amount,
          type: requestType === 'CLUB_FUNDS' ? 'INCOME' as const : 'EXPENSE' as const,
          description: requestType === 'CLUB_FUNDS'
            ? 'Przesunięcie środków z rezerwy zarządu na saldo klubu'
            : 'Przesunięcie środków z rezerwy zarządu na budżet transferowy',
          previousBalance: userClub.budget,
        }
      : null;

    setClubs(prev => prev.map(c => {
      if (c.id !== userTeamId) return c;
      if (!approved) {
        return { ...c, boardBudgetRequestsThisSeason: nextRequestsUsed };
      }
      return {
        ...c,
        ...updatedClubPatch,
        boardBudgetRequestsThisSeason: nextRequestsUsed,
        financeHistory: financeLog ? [financeLog, ...(c.financeHistory || [])].slice(0, 50) : c.financeHistory,
      };
    }));

    const resultMessage = approved
      ? successMessage
      : `Zarząd odrzucił wniosek: ${subject.toLowerCase()}. W obecnej sytuacji klub nie chce zwiększać ryzyka finansowego.`;

    setMessages(prev => [{
      id: `BOARD_REQ_${requestType}_${userTeamId}_${Date.now()}`,
      sender: 'Zarząd Klubu',
      role: approved ? 'Prezes Zarządu' : 'Dyrektor finansowy',
      subject: approved ? `Wniosek zaakceptowany — ${subject}` : `Wniosek odrzucony — ${subject}`,
      body: `Panie Managerze,\n\n${resultMessage}\n\nWykorzystane specjalne prośby w tym sezonie: ${nextRequestsUsed}/2.\n\nZ poważaniem,\nZarząd Klubu`,
      date,
      isRead: false,
      type: MailType.BOARD,
      priority: approved ? 72 : 66,
    }, ...prev]);

    showGameNotification({
      title: approved ? successTitle : 'Wniosek odrzucony',
      message: resultMessage,
      tone: approved ? 'success' : 'warning',
    });
  }, [clubs, currentDate, players, showGameNotification, userTeamId]);

  const requestStadiumExpansion = useCallback((stand: StadiumStand, requestedIncrease: number) => {
    if (!userTeamId) return;
    const userClub = clubs.find(c => c.id === userTeamId);
    if (!userClub) return;
    const dateStr = currentDate instanceof Date
      ? currentDate.toISOString().split('T')[0]
      : String(currentDate);
    const project = StadiumExpansionService.createRequest(userTeamId, stand, requestedIncrease, dateStr);
    setClubs(prev => prev.map(c =>
      c.id === userTeamId
        ? { ...c, stadiumExpansionProjects: [...(c.stadiumExpansionProjects ?? []), project] }
        : c
    ));
    const standLabel = StadiumExpansionService.getStandLabel(stand);
    setMessages(prev => [{
      id: `STADIUM_REQ_${project.id}`,
      sender: 'Zarząd Klubu',
      role: 'Sekretariat',
      subject: `Wniosek o rozbudowę przyjęty — ${standLabel}`,
      body: `Szanowny Panie Menedżerze,\n\nPotwierdzamy przyjęcie wniosku o rozbudowę stadionu (${standLabel}).\n\nWniosek zostanie rozpatrzony przez zarząd w ciągu 2–4 tygodni. O decyzji zostanie Pan niezwłocznie poinformowany drogą mailową.\n\nZ poważaniem,\nSekretariat Klubu`,
      date: new Date(dateStr),
      isRead: false,
      type: MailType.BOARD,
      priority: 60,
    }, ...prev]);
    showGameNotification({
      title: 'Wniosek złożony',
      message: `Wniosek o rozbudowę (${standLabel}) trafił do zarządu. Odpowiedź w ciągu 2–4 tygodni.`,
      tone: 'info',
    });
  }, [clubs, currentDate, showGameNotification, userTeamId]);

 const updatePlayer = (clubId: string, playerId: string, newData: Partial<Player>) => {
    setPlayers(prev => ({
      ...prev,
      [clubId]: prev[clubId].map(p => p.id === playerId ? { ...p, ...newData } : p)
    }));
  };

  const importSquad = (entries: { clubId: string; players: ImportedSquadPlayer[] }[]) => {
    const newPlayersChunk: Record<string, Player[]> = {};
    const newLineupsChunk: Record<string, Lineup> = {};
    const now = currentDate instanceof Date ? currentDate : new Date(currentDate);
    entries.forEach(({ clubId, players: imported }) => {
      const squad: Player[] = imported.map((p, idx) => {
        const nat = p.nationality ?? Region.POLAND;
        const country = p.nationalityCountry ?? pickNationalityForRegion(nat);
        const attrs = { ...p.attributes };
        const overall = PlayerAttributesGenerator.calculateOverall(attrs, p.position);
        const contractYears = p.age < 25 ? 3 : p.age < 32 ? 2 : 1;
        const contractEnd = p.contractEndDate
          ? p.contractEndDate
          : new Date(now.getFullYear() + contractYears, now.getMonth(), now.getDate()).toISOString();
        const salary = p.annualSalary ?? Math.round(overall * 800);
        const mval = p.marketValue ?? Math.round(overall * 3000);
        const id = `IMPORT_${clubId}_${idx}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
        return PlayerMoraleService.ensurePlayerState({
          id, firstName: p.firstName, lastName: p.lastName, age: p.age,
          clubId, nationality: nat, nationalityCountry: country,
          position: p.position, overallRating: overall, attributes: attrs,
          stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
          health: { status: HealthStatus.HEALTHY },
          condition: 80, suspensionMatches: 0,
          cupSuspensionMatches: 0, euroSuspensionMatches: 0, nationalSuspensionMatches: 0,
          contractEndDate: contractEnd, annualSalary: salary, marketValue: mval,
          history: [], boardLockoutUntil: null, isUntouchable: false,
          negotiationStep: 0, negotiationLockoutUntil: null, contractLockoutUntil: null,
          fatigueDebt: 0, isNegotiationPermanentBlocked: false,
          transferLockoutUntil: null, freeAgentLockoutUntil: null,
        } as Player);
      });
      newPlayersChunk[clubId] = squad;
      const coach = Object.values(coaches).find(c => c.currentClubId === clubId) ?? null;
      newLineupsChunk[clubId] = LineupService.autoPickLineup(clubId, squad, '4-4-2', coach);
    });
    const hasImportedPlayers = Object.keys(newPlayersChunk).length > 0;
    const canReviewNT = hasImportedPlayers && nationalTeams.length > 0;

    if (!canReviewNT) {
      setPlayers(prev => ({ ...prev, ...newPlayersChunk }));
      setLineups(prev => ({ ...prev, ...newLineupsChunk }));
      return;
    }

    const mergedPlayers = { ...players, ...newPlayersChunk };
    let currentTeams = nationalTeams;
    let currentPlayers = mergedPlayers;
    for (let i = 0; i < 8; i++) {
      const review = NationalTeamService.reviewMonthlySquad(currentTeams, coaches, currentPlayers);
      const anyChanged = review.updatedTeams.some((t, idx) => t !== currentTeams[idx]) || review.playerUpdates.length > 0;
      if (!anyChanged) break;
      currentTeams = review.updatedTeams;
      if (review.playerUpdates.length > 0) {
        const updateMap: Record<string, string | null> = {};
        review.playerUpdates.forEach(u => { updateMap[u.id] = u.assignedNationalTeamId; });
        const updatedPlayers: Record<string, Player[]> = {};
        for (const [clubId, squad] of Object.entries(currentPlayers)) {
          updatedPlayers[clubId] = squad.map(p =>
            p.id in updateMap ? { ...p, assignedNationalTeamId: updateMap[p.id] } : p
          );
        }
        currentPlayers = updatedPlayers;
      }
    }

    setPlayers(currentPlayers);
    if (currentTeams !== nationalTeams) setNationalTeams(currentTeams);
    setLineups(prev => ({ ...prev, ...newLineupsChunk }));
  };

  const toggleTransferList = (playerId: string, price?: number) => {
    if (!userTeamId) return;
    const squad = players[userTeamId] || [];
    const player = squad.find(p => p.id === playerId);
    if (player) {
      if (player.transferPendingClubId) return;
      const userClub = clubs.find(c => c.id === userTeamId);
      if (!player.isOnTransferList && userClub?.sportingDirector) {
        const directorDecision = SportingDirectorService.evaluateTransferListDecision({
          club: userClub,
          player,
          squad,
          requestedPrice: price,
          date: currentDate,
        });

        if (directorDecision.blocked) {
          setClubs(prev => prev.map(c => c.id === userTeamId ? directorDecision.updatedClub : c));
          if (directorDecision.mail) prependUniqueMessages([directorDecision.mail], true);
          showGameNotification({
            title: 'Ruch zablokowany',
            message: `Dyrektor sportowy blokuje ruch: ${directorDecision.message}`,
            tone: 'warning',
          });
          return;
        }
      }

      const isAddingToTransferList = !player.isOnTransferList;
      let moraleAdjustedPlayer = PlayerMoraleService.ensurePlayerState(player);
      if (isAddingToTransferList) {
        const hasRequestedTransferList = !!moraleAdjustedPlayer.transferListDemandUntil;
        if (hasRequestedTransferList) {
          moraleAdjustedPlayer = {
            ...PlayerMoraleService.withMoraleChange(moraleAdjustedPlayer, 8, 'Trener zgodził się na listę transferową', currentDate),
            transferListDemandUntil: null,
          };
        } else {
          const personality = moraleAdjustedPlayer.moralePersonality ?? 'CALM';
          const moralePenalty = personality === 'LOYAL'
            ? -14
            : personality === 'AMBITIOUS' || personality === 'EGOIST'
              ? -12
              : -9;
          moraleAdjustedPlayer = PlayerMoraleService.withMoraleChange(
            moraleAdjustedPlayer,
            moralePenalty,
            'Wystawienie na listę transferową bez zgody zawodnika',
            currentDate
          );
        }
      }

      updatePlayer(userTeamId, playerId, {
        morale: moraleAdjustedPlayer.morale,
        moralePersonality: moraleAdjustedPlayer.moralePersonality,
        moraleHistory: moraleAdjustedPlayer.moraleHistory,
        transferListDemandUntil: moraleAdjustedPlayer.transferListDemandUntil,
        squadRole: isAddingToTransferList ? null : player.squadRole,
        isUntouchable: isAddingToTransferList ? false : player.isUntouchable,
        isOnTransferList: !player.isOnTransferList,
        transferListPrice: !player.isOnTransferList ? price : undefined
      });
    }
  };

  const toggleUntouchable = (playerId: string) => {
    if (!userTeamId) return;
    const squad = players[userTeamId] || [];
    const player = squad.find(p => p.id === playerId);
    if (!player || player.transferPendingClubId) return;

    const isMarkingUntouchable = !player.isUntouchable;
    updatePlayer(userTeamId, playerId, {
      isUntouchable: isMarkingUntouchable,
      isOnTransferList: isMarkingUntouchable ? false : player.isOnTransferList,
      transferListPrice: isMarkingUntouchable ? undefined : player.transferListPrice,
    });
  };

  const setSquadRole = (playerId: string, role: 'STARTER' | 'KEY_PLAYER' | null) => {
    if (!userTeamId) return;
    const squad = players[userTeamId] || [];
    const player = squad.find(p => p.id === playerId);
    if (!player) return;
    const updates: Partial<Player> = { squadRole: role };
    if (role === 'KEY_PLAYER') {
      updates.isOnTransferList = false;
      updates.transferListPrice = undefined;
    }
    updatePlayer(userTeamId, playerId, updates);
  };

  const navigateToIncomingOffer = (offerId: string): void => {
    setViewedIncomingOfferId(offerId);
    navigateWithoutHistory(ViewState.INCOMING_OFFER);
  };

  const respondToIncomingOffer = (
    offerId: string,
    response: 'accept' | 'counter' | 'reject',
    counterFee?: number
  ): void => {
    if (!userTeamId) return;

    setIncomingOffers(prev => {
      const idx = prev.findIndex(o => o.id === offerId);
      if (idx === -1) return prev;
      const offer = prev[idx];

      let player: Player | undefined;
      for (const cId in players) {
        player = players[cId].find(p => p.id === offer.playerId);
        if (player) break;
      }
      const buyerClub = clubs.find(c => c.id === offer.buyerClubId);
      const sellerClub = clubs.find(c => c.id === userTeamId);
      if (!player || !buyerClub || !sellerClub) return prev;

      const dateStr = new Date(currentDate).toISOString().split('T')[0];
      const updated = [...prev];
      const currentActiveFee =
        offer.status === IncomingOfferStatus.AI_COUNTERED
          ? offer.aiCounterFee ?? offer.fee
          : offer.fee;

      if (response === 'reject') {
        updated[idx] = { ...offer, status: IncomingOfferStatus.REJECTED_BY_MANAGER };
        if (offer.boardPressure) {
          const penaltyMail: MailMessage = {
            id: `board_reject_penalty_${Date.now()}`,
            sender: 'Zarząd Klubu',
            role: 'Prezes Zarządu',
            subject: `Niezadowolenie zarządu — odrzucona oferta za ${player.firstName} ${player.lastName}`,
            body: `Panie Managerze,\n\nZ niepokojem przyjęliśmy Pana decyzję o odrzuceniu oferty klubu ${buyerClub.name} za zawodnika ${player.firstName} ${player.lastName}.\n\nBiorąc pod uwagę sytuację finansową klubu i atrakcyjność propozycji, zarząd wyraża swoje niezadowolenie z tej decyzji.\n\nZarząd ${sellerClub.name}`,
            date: currentDate,
            isRead: false,
            type: MailType.BOARD,
            priority: 2,
          };
          setMessages(prev2 => [penaltyMail, ...prev2]);
        }
      } else if (
        response === 'counter' &&
        counterFee !== undefined &&
        offer.negotiationRound < 3
      ) {
        updated[idx] = {
          ...offer,
          status: IncomingOfferStatus.COUNTER_PENDING_AI,
          counterFee: Math.max(counterFee, currentActiveFee),
          negotiationRound: offer.negotiationRound + 1,
          playerNegotiationStartedAt: dateStr,
        };
      } else if (response === 'accept') {
        if (sellerClub.sportingDirector) {
          const directorDecision = SportingDirectorService.evaluateIncomingSaleDecision({
            club: sellerClub,
            player,
            squad: players[userTeamId] || [],
            buyerClub,
            fee: currentActiveFee,
            date: currentDate,
          });

          if (directorDecision.blocked) {
            updated[idx] = { ...offer, status: IncomingOfferStatus.REJECTED_AT_CONFIRM };
            setClubs(prevClubs => prevClubs.map(c => c.id === sellerClub.id ? directorDecision.updatedClub : c));
            if (directorDecision.mail) prependUniqueMessages([directorDecision.mail], true);
            showGameNotification({
              title: 'Transfer zawetowany',
              message: `Dyrektor sportowy zawetował transfer: ${directorDecision.message}`,
              tone: 'warning',
            });
            return updated;
          }
        }

        const resolveIn = Math.random() < 0.5 ? 2 : 3;
        const resolveDate = IncomingTransferService.addDays(dateStr, resolveIn);
        const acceptedFee = currentActiveFee;
        updated[idx] = {
          ...offer,
          fee: acceptedFee,
          status: IncomingOfferStatus.NEGOTIATION_IN_PROGRESS,
          playerNegotiationStartedAt: dateStr,
          playerNegotiationResolvesAt: resolveDate,
        };
      }

      return updated;
    });
  };

  const confirmIncomingTransfer = (offerId: string, confirm: boolean): void => {
    if (!userTeamId) return;

    const offer = incomingOffers.find(o => o.id === offerId);
    if (!offer || offer.status !== IncomingOfferStatus.AWAITING_CONFIRMATION) return;

    if (!confirm) {
      setIncomingOffers(prev => prev.map(o =>
        o.id === offerId ? { ...o, status: IncomingOfferStatus.REJECTED_AT_CONFIRM } : o
      ));
      return;
    }

    let player: Player | undefined;
    for (const cId in players) {
      player = players[cId].find(p => p.id === offer.playerId);
      if (player) break;
    }
    const buyerClub = clubs.find(c => c.id === offer.buyerClubId);
    const sellerClub = clubs.find(c => c.id === userTeamId);
    if (!player || !buyerClub || !sellerClub) return;

    if (sellerClub.sportingDirector) {
      const directorDecision = SportingDirectorService.evaluateIncomingSaleDecision({
        club: sellerClub,
        player,
        squad: players[userTeamId] || [],
        buyerClub,
        fee: offer.fee,
        date: currentDate,
      });

      if (directorDecision.blocked) {
        setIncomingOffers(prev => prev.map(o =>
          o.id === offerId ? { ...o, status: IncomingOfferStatus.REJECTED_AT_CONFIRM } : o
        ));
        setClubs(prev => prev.map(c => c.id === sellerClub.id ? directorDecision.updatedClub : c));
        if (directorDecision.mail) prependUniqueMessages([directorDecision.mail], true);
        showGameNotification({
          title: 'Transfer zawetowany',
          message: `Dyrektor sportowy zawetował transfer: ${directorDecision.message}`,
          tone: 'warning',
        });
        return;
      }
    }

    // Estymuj warunki kontraktu (negocjowane przez AI w tle)
    const estimatedSalary = Math.round(player.annualSalary * 1.15 / 10000) * 10000;
    const estimatedYears = player.age <= 27 ? 3 : player.age <= 32 ? 2 : 1;
    const resolveEffectiveDate = (): string | undefined => {
      if (offer.timing === TransferTiming.IMMEDIATE) return undefined;
      if (offer.timing === TransferTiming.CONTRACT_END) return player.contractEndDate;

      const effectiveDate = new Date(currentDate);
      if (offer.timing === TransferTiming.IN_SIX_MONTHS) {
        effectiveDate.setMonth(effectiveDate.getMonth() + 6);
        return effectiveDate.toISOString();
      }

      if (offer.timing === TransferTiming.IN_TWELVE_MONTHS) {
        effectiveDate.setFullYear(effectiveDate.getFullYear() + 1);
        return effectiveDate.toISOString();
      }

      return undefined;
    };
    const effectiveDate = resolveEffectiveDate();

    const syntheticOffer: TransferOffer = {
      id: offer.id,
      playerId: offer.playerId,
      sellerClubId: userTeamId,
      buyerClubId: offer.buyerClubId,
      fee: offer.timing === TransferTiming.CONTRACT_END ? 0 : offer.fee,
      timing: offer.timing,
      salary: estimatedSalary,
      bonus: 0,
      years: estimatedYears,
      createdAt: offer.createdAt,
      status: TransferOfferStatus.READY_TO_FINALIZE,
      effectiveDate,
      attemptNumber: offer.negotiationRound,
      maxAttempts: 3,
    };

    if (offer.timing !== TransferTiming.IMMEDIATE) {
      const agreedOffer: TransferOffer = {
        ...syntheticOffer,
        status: TransferOfferStatus.AGREED_PRECONTRACT,
        effectiveDate: effectiveDate || player.contractEndDate
      };

      setTransferOffers(prev => [agreedOffer, ...prev].slice(0, 100));
      setPlayers(prev => ({
        ...prev,
        [userTeamId]: (prev[userTeamId] || []).map(p =>
          p.id === player!.id
            ? {
                ...p,
                transferPendingClubId: buyerClub.id,
                transferReportDate: agreedOffer.effectiveDate || player!.contractEndDate,
                interestedClubs: [],
                isOnTransferList: false,
              }
            : p
        )
      }));
      setIncomingOffers(prev => prev.map(o => {
        if (o.id === offerId) return { ...o, status: IncomingOfferStatus.COMPLETED };
        if (
          o.playerId === offer.playerId &&
          o.status !== IncomingOfferStatus.COMPLETED &&
          o.status !== IncomingOfferStatus.REJECTED_BY_MANAGER &&
          o.status !== IncomingOfferStatus.REJECTED_AT_CONFIRM &&
          o.status !== IncomingOfferStatus.PLAYER_REFUSED
        ) return { ...o, status: IncomingOfferStatus.EXPIRED };
        return o;
      }));
      navigateWithoutHistory(ViewState.DASHBOARD);
      return;
    }

    const result = TransferExecutionService.finalizeTransfer(syntheticOffer, clubs, players, currentDate);
    setClubs(result.updatedClubs);
    setPlayers(result.updatedPlayers);
    setLineups(prev => {
      const next = { ...prev };
      const updatedSellerSquad = result.updatedPlayers[sellerClub.id] || [];

      if (next[sellerClub.id]) {
        next[sellerClub.id] = LineupService.repairLineup(next[sellerClub.id], updatedSellerSquad);
      }

      return next;
    });
    setIncomingOffers(prev => prev.map(o => {
      if (o.id === offerId) return { ...o, status: IncomingOfferStatus.COMPLETED };
      if (
        o.playerId === offer.playerId &&
        o.status !== IncomingOfferStatus.COMPLETED &&
        o.status !== IncomingOfferStatus.REJECTED_BY_MANAGER &&
        o.status !== IncomingOfferStatus.REJECTED_AT_CONFIRM &&
        o.status !== IncomingOfferStatus.PLAYER_REFUSED
      ) return { ...o, status: IncomingOfferStatus.EXPIRED };
      return o;
    }));
    navigateWithoutHistory(ViewState.DASHBOARD);
  };

  const submitTransferOffer = useCallback((playerId: string, offerInput: TransferClubBidInput): TransferOfferSubmissionResult => {
    if (!userTeamId) {
      return { ok: false, status: 'VALIDATION_ERROR', message: 'Najpierw musisz wybrać klub użytkownika.' };
    }

    const buyerClub = clubs.find(c => c.id === userTeamId);
    if (!buyerClub) {
      return { ok: false, status: 'VALIDATION_ERROR', message: 'Nie znaleziono danych twojego klubu.' };
    }

    let sellerClubId: string | null = null;
    let targetPlayer: Player | null = null;
    for (const clubId in players) {
      const found = players[clubId].find(p => p.id === playerId);
      if (found) {
        sellerClubId = clubId;
        targetPlayer = found;
        break;
      }
    }

    if (!sellerClubId || !targetPlayer) {
      return { ok: false, status: 'VALIDATION_ERROR', message: 'Nie znaleziono wskazanego zawodnika.' };
    }

    const sellerClub = clubs.find(c => c.id === sellerClubId);
    if (!sellerClub) {
      return { ok: false, status: 'VALIDATION_ERROR', message: 'Nie znaleziono klubu sprzedającego.' };
    }

    const buyerSquad = players[userTeamId] || [];
    const sellerSquad = players[sellerClubId] || [];
    const sellerCoachFavoriteIds = sellerClub.coachId ? coaches[sellerClub.coachId]?.favoritePlayerIds : undefined;
    const sellerOpeningStance = TransferSellerLogicService.getNegotiationStance(
      targetPlayer,
      sellerClub,
      buyerClub,
      sellerSquad,
      currentDate,
      offerInput.timing,
      sellerClub.board?.kompetencja,
      sellerCoachFavoriteIds
    );
    const latestClubOffer = transferOffers.find(
      offer =>
        offer.playerId === playerId &&
        offer.buyerClubId === userTeamId &&
        offer.timing === offerInput.timing &&
        (
          offer.status === TransferOfferStatus.SELLER_COUNTERED ||
          offer.status === TransferOfferStatus.SELLER_REJECTED ||
          offer.status === TransferOfferStatus.PLAYER_NEGOTIATION
        )
    ) || null;

    const existingNegotiation = transferOffers.find(
      offer =>
        offer.playerId === playerId &&
        offer.buyerClubId === userTeamId &&
        (
          offer.status === TransferOfferStatus.PLAYER_NEGOTIATION ||
          offer.status === TransferOfferStatus.AGREED_PRECONTRACT
        )
    );
    if (existingNegotiation) {
      return {
        ok: false,
        status: 'VALIDATION_ERROR',
        message: existingNegotiation.status === TransferOfferStatus.AGREED_PRECONTRACT
          ? 'Masz juz podpisane porozumienie z tym zawodnikiem.'
          : 'Kwota z klubem jest juz uzgodniona. Przejdz do rozmowy z zawodnikiem.'
      };
    }

    if (targetPlayer.transferLockoutUntil && new Date(currentDate) < new Date(targetPlayer.transferLockoutUntil)) {
      return {
        ok: false,
        status: 'VALIDATION_ERROR',
        message: `Ten klub nie chce wracac do rozmow w sprawie tego zawodnika przed ${new Date(targetPlayer.transferLockoutUntil).toLocaleDateString('pl-PL')}.`
      };
    }

    if (targetPlayer.transferOfferBanUntil && new Date(currentDate) < new Date(targetPlayer.transferOfferBanUntil)) {
      return {
        ok: false,
        status: 'VALIDATION_ERROR',
        message: `Ten zawodnik niedawno zmienil klub. Zlozenie nowej oferty bedzie mozliwe dopiero po ${new Date(targetPlayer.transferOfferBanUntil).toLocaleDateString('pl-PL')}.`
      };
    }

    if (offerInput.timing !== TransferTiming.CONTRACT_END && !sellerOpeningStance.allowTalks) {
      return {
        ok: false,
        status: 'VALIDATION_ERROR',
        message: sellerOpeningStance.reason
      };
    }

    const buyerDecision = TransferBuyerLogicService.validateClubBid(
      targetPlayer,
      buyerClub,
      buyerSquad,
      offerInput,
      currentDate
    );

    if (!buyerDecision.approved) {
      return { ok: false, status: 'VALIDATION_ERROR', message: buyerDecision.reason };
    }

    const createdOffer: TransferOffer = {
      id: `TRANSFER_${Date.now()}_${playerId}`,
      playerId,
      sellerClubId,
      buyerClubId: userTeamId,
      fee: Math.round(offerInput.fee),
      timing: offerInput.timing,
      createdAt: currentDate.toISOString(),
      status: TransferOfferStatus.SELLER_REVIEW,
      attemptNumber: latestClubOffer?.status === TransferOfferStatus.SELLER_COUNTERED
        ? latestClubOffer.attemptNumber + 1
        : 1,
      maxAttempts: latestClubOffer?.maxAttempts || TransferSellerLogicService.generateNegotiationAttemptLimit()
    };

    const resolveEffectiveDate = () => {
      const effectiveDate = new Date(currentDate);

      if (offerInput.timing === TransferTiming.IN_SIX_MONTHS) {
        effectiveDate.setMonth(effectiveDate.getMonth() + 6);
        return effectiveDate.toISOString();
      }

      if (offerInput.timing === TransferTiming.IN_TWELVE_MONTHS) {
        effectiveDate.setFullYear(effectiveDate.getFullYear() + 1);
        return effectiveDate.toISOString();
      }

      return targetPlayer.contractEndDate;
    };

    if (offerInput.timing === TransferTiming.CONTRACT_END) {
      const preContractOffer: TransferOffer = {
        ...createdOffer,
        fee: 0,
        status: TransferOfferStatus.PLAYER_NEGOTIATION,
        effectiveDate: resolveEffectiveDate(),
        sellerReason: `Zawodnik moze podpisac umowe obowiazujaca od ${new Date(targetPlayer.contractEndDate).toLocaleDateString('pl-PL')}. Klub nie otrzyma odstepnego.`
      };

      setTransferOffers(prev => [preContractOffer, ...prev].slice(0, 100));
      setMessages(prev => [{
        id: `MAIL_TRANSFER_PRECONTRACT_${preContractOffer.id}`,
        sender: 'Dzial prawny',
        role: 'Rejestr kontraktow',
        subject: `Mozesz rozmawiac z ${targetPlayer.firstName} ${targetPlayer.lastName}`,
        body: `${preContractOffer.sellerReason}\n\nJesli uzgodnisz warunki z zawodnikiem, dolaczy do twojego klubu po wygasnieciu obecnej umowy.`,
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 95
      }, ...prev]);

      return {
        ok: true,
        status: TransferOfferStatus.PLAYER_NEGOTIATION,
        message: `${preContractOffer.sellerReason}\n\nMozesz przejsc bezposrednio do rozmowy z zawodnikiem.`,
        offer: preContractOffer
      };
    }

    const sellerDecision = TransferSellerLogicService.evaluateSellerDecision(
      offerInput,
      targetPlayer,
      sellerClub,
      buyerClub,
      sellerSquad,
      currentDate,
      {
        currentAskingPrice: latestClubOffer?.status === TransferOfferStatus.SELLER_COUNTERED
          ? latestClubOffer.askingPrice
          : sellerOpeningStance.askingPrice,
        attemptNumber: createdOffer.attemptNumber,
        maxAttempts: createdOffer.maxAttempts
      },
      sellerCoachFavoriteIds
    );

    if (sellerDecision.verdict === 'REJECT') {
      const transferLockoutDate = new Date(currentDate);
      transferLockoutDate.setMonth(transferLockoutDate.getMonth() + 3);
      setPlayers(prev => ({
        ...prev,
        [sellerClubId]: (prev[sellerClubId] || []).map(player =>
          player.id === targetPlayer.id
            ? { ...player, transferLockoutUntil: transferLockoutDate.toISOString() }
            : player
        )
      }));

      const rejectedOffer: TransferOffer = {
        ...createdOffer,
        status: TransferOfferStatus.SELLER_REJECTED,
        askingPrice: sellerDecision.askingPrice,
        sellerReason: sellerDecision.reason
      };
      setTransferOffers(prev => [rejectedOffer, ...prev].slice(0, 100));
      setMessages(prev => [{
        id: `MAIL_TRANSFER_REJECT_${rejectedOffer.id}`,
        sender: sellerClub.name,
        role: 'Zarząd klubu',
        subject: `Oferta odrzucona: ${targetPlayer.firstName} ${targetPlayer.lastName}`,
        body: `${sellerDecision.reason}\n\nKlub zamyka rozmowy w sprawie tego zawodnika do ${transferLockoutDate.toLocaleDateString('pl-PL')}.`,
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 92
      }, ...prev]);

      return {
        ok: false,
        status: TransferOfferStatus.SELLER_REJECTED,
        message: `${sellerDecision.reason}\n\nKolejna oferta bedzie mozliwa dopiero po ${transferLockoutDate.toLocaleDateString('pl-PL')}.`,
        offer: rejectedOffer
      };
    }

    if (sellerDecision.verdict === 'COUNTER') {
      const counterOffer: TransferOffer = {
        ...createdOffer,
        status: TransferOfferStatus.SELLER_COUNTERED,
        askingPrice: sellerDecision.askingPrice,
        sellerReason: sellerDecision.reason
      };
      setTransferOffers(prev => [counterOffer, ...prev].slice(0, 100));
      setMessages(prev => [{
        id: `MAIL_TRANSFER_COUNTER_${counterOffer.id}`,
        sender: sellerClub.name,
        role: 'Zarzad klubu',
        subject: `Klub przedstawia oczekiwania za ${targetPlayer.firstName} ${targetPlayer.lastName}`,
        body: sellerDecision.reason,
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 94
      }, ...prev]);

      return { ok: false, status: TransferOfferStatus.SELLER_COUNTERED, message: sellerDecision.reason, offer: counterOffer };
    }

    /* const playerDecision = TransferPlayerDecisionService.evaluateMove(
      offerInput,
      targetPlayer,
      sellerClub,
      buyerClub,
      sellerSquad,
      buyerSquad,
      currentDate
    );

    if (!playerDecision.accepted) {
      const playerRejectedOffer = {
        ...createdOffer,
        status: TransferOfferStatus.PLAYER_REJECTED,
        sellerReason: sellerDecision.reason,
        playerReason: playerDecision.reason
      };
      setTransferOffers(prev => [playerRejectedOffer, ...prev].slice(0, 100));
      setMessages(prev => [{
        id: `MAIL_TRANSFER_PLAYER_REJECT_${playerRejectedOffer.id}`,
        sender: `Agent gracza ${targetPlayer.lastName}`,
        role: 'Agencja menadżerska',
        subject: `Zawodnik odrzucił transfer: ${targetPlayer.firstName} ${targetPlayer.lastName}`,
        body: playerDecision.reason,
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 94
      }, ...prev]);

      return { ok: false, status: TransferOfferStatus.PLAYER_REJECTED, message: playerDecision.reason, offer: playerRejectedOffer };
    }

    const readyOffer: TransferOffer = {
      ...createdOffer,
      status: TransferOfferStatus.READY_TO_FINALIZE,
      sellerReason: sellerDecision.reason,
      playerReason: playerDecision.reason
    };

    const execution = TransferExecutionService.finalizeTransfer(
      readyOffer,
      clubs,
      players,
      currentDate
    );

    setClubs(execution.updatedClubs);
    setPlayers(execution.updatedPlayers);
    setLineups(prev => {
      const next = { ...prev };
      const updatedSellerSquad = execution.updatedPlayers[sellerClub.id] || [];
      const updatedBuyerSquad = execution.updatedPlayers[buyerClub.id] || [];

      if (next[sellerClub.id]) {
        next[sellerClub.id] = LineupService.repairLineup(next[sellerClub.id], updatedSellerSquad);
      }

      if (next[buyerClub.id]) {
        const buyerLineup = next[buyerClub.id];
        const allKnownIds = new Set([
          ...buyerLineup.bench,
          ...buyerLineup.reserves,
          ...(buyerLineup.startingXI.filter(Boolean) as string[])
        ]);

        if (!allKnownIds.has(playerId)) {
          next[buyerClub.id] = {
            ...buyerLineup,
            reserves: [...buyerLineup.reserves, playerId]
          };
        }
      }

      return next;
    });

    const completedOffer = { ...readyOffer, status: TransferOfferStatus.COMPLETED };
    setTransferOffers(prev => [completedOffer, ...prev].slice(0, 100));
    setMessages(prev => [{
      id: `MAIL_TRANSFER_DONE_${completedOffer.id}`,
      sender: 'Centrum transferowe',
      role: 'System rejestracji transferów',
      subject: `Transfer potwierdzony: ${targetPlayer.firstName} ${targetPlayer.lastName}`,
      body: `${targetPlayer.firstName} ${targetPlayer.lastName} dołącza do ${buyerClub.name}. Klub ${sellerClub.name} zaakceptował ofertę ${offerInput.fee.toLocaleString()} PLN, a zawodnik podpisał kontrakt na ${offerInput.years} lata.`,
      date: new Date(currentDate),
      isRead: false,
      type: MailType.SYSTEM,
      priority: 98
    }, ...prev]);

    return {
      ok: true,
      status: TransferOfferStatus.COMPLETED,
      message: `${targetPlayer.firstName} ${targetPlayer.lastName} zaakceptował transfer do ${buyerClub.name}.`,
      offer: completedOffer
    };
    */

    const acceptedOffer: TransferOffer = {
      ...createdOffer,
      status: TransferOfferStatus.PLAYER_NEGOTIATION,
      askingPrice: sellerDecision.askingPrice,
      sellerReason: sellerDecision.reason
    };

    setTransferOffers(prev => [acceptedOffer, ...prev].slice(0, 100));
    setMessages(prev => [{
      id: `MAIL_TRANSFER_ACCEPT_${acceptedOffer.id}`,
      sender: sellerClub.name,
      role: 'Zarzad klubu',
      subject: `Kluby uzgodnily kwote za ${targetPlayer.firstName} ${targetPlayer.lastName}`,
      body: `${sellerDecision.reason}\n\nMozesz teraz przejsc do rozmowy z zawodnikiem i ustalic warunki kontraktu.`,
      date: new Date(currentDate),
      isRead: false,
      type: MailType.SYSTEM,
      priority: 96
    }, ...prev]);

    return {
      ok: true,
      status: TransferOfferStatus.PLAYER_NEGOTIATION,
      message: `${sellerDecision.reason}\n\nKluby uzgodnily warunki transferu. Teraz musisz porozmawiac z zawodnikiem.`,
      offer: acceptedOffer
    };
  }, [userTeamId, clubs, players, currentDate, transferOffers]);

  const finalizeTransferNegotiation = useCallback((offerId: string, contractInput: TransferContractInput, bypassBoardCheck?: boolean): TransferOfferSubmissionResult => {
    if (!userTeamId) {
      return { ok: false, status: 'VALIDATION_ERROR', message: 'Najpierw musisz wybrac klub uzytkownika.' };
    }

    const transferOffer = transferOffers.find(offer => offer.id === offerId);
    if (!transferOffer) {
      return { ok: false, status: 'VALIDATION_ERROR', message: 'Nie znaleziono aktywnej oferty transferowej.' };
    }

    if (transferOffer.buyerClubId !== userTeamId) {
      return { ok: false, status: 'VALIDATION_ERROR', message: 'Ta oferta nie nalezy do twojego klubu.' };
    }

    if (transferOffer.status !== TransferOfferStatus.PLAYER_NEGOTIATION) {
      return { ok: false, status: 'VALIDATION_ERROR', message: 'Najpierw musisz uzgodnic kwote z klubem sprzedajacym.' };
    }

    const buyerClub = clubs.find(c => c.id === transferOffer.buyerClubId);
    const sellerClub = clubs.find(c => c.id === transferOffer.sellerClubId);
    if (!buyerClub || !sellerClub) {
      return { ok: false, status: 'VALIDATION_ERROR', message: 'Brakuje danych jednego z klubow.' };
    }

    const buyerSquad = players[buyerClub.id] || [];
    const sellerSquad = players[sellerClub.id] || [];
    const targetPlayer = sellerSquad.find(p => p.id === transferOffer.playerId);
    if (!targetPlayer) {
      return { ok: false, status: 'VALIDATION_ERROR', message: 'Zawodnik nie jest juz dostepny w klubie sprzedajacym.' };
    }

    const buyerBidValidation = TransferBuyerLogicService.validateClubBid(
      targetPlayer,
      buyerClub,
      buyerSquad,
      { fee: transferOffer.fee, timing: transferOffer.timing },
      currentDate
    );
    if (!buyerBidValidation.approved) {
      return { ok: false, status: 'VALIDATION_ERROR', message: buyerBidValidation.reason };
    }

    const contractValidation = TransferBuyerLogicService.validateContractTerms(
      targetPlayer,
      buyerClub,
      buyerSquad,
      contractInput,
      bypassBoardCheck
    );
    if (!contractValidation.approved) {
      return { ok: false, status: 'VALIDATION_ERROR', message: contractValidation.reason };
    }

    const totalCommitment = transferOffer.fee + contractInput.salary * contractInput.years + contractInput.bonus;
    if (totalCommitment > buyerClub.transferBudget) {
      return { ok: false, status: 'VALIDATION_ERROR', message: `Łączny koszt transferu i kontraktu (${totalCommitment.toLocaleString('pl-PL')} PLN) przekracza dostępny budżet transferowy (${buyerClub.transferBudget.toLocaleString('pl-PL')} PLN).` };
    }

    const playerDecision = TransferPlayerDecisionService.evaluateMove(
      contractInput,
      targetPlayer,
      sellerClub,
      buyerClub,
      sellerSquad,
      buyerSquad,
      currentDate
    );

    if (!playerDecision.accepted) {
      const transferLockoutDate = new Date(currentDate);
      transferLockoutDate.setMonth(transferLockoutDate.getMonth() + 3);
      setPlayers(prev => ({
        ...prev,
        [sellerClub.id]: (prev[sellerClub.id] || []).map(player =>
          player.id === targetPlayer.id
            ? { ...player, transferLockoutUntil: transferLockoutDate.toISOString() }
            : player
        )
      }));

      const rejectedOffer: TransferOffer = {
        ...transferOffer,
        salary: Math.round(contractInput.salary),
        bonus: Math.round(contractInput.bonus),
        years: contractInput.years,
        goalBonus: contractInput.goalBonus,
        assistBonus: contractInput.assistBonus,
        cleanSheetBonus: contractInput.cleanSheetBonus,
        status: TransferOfferStatus.PLAYER_REJECTED,
        playerReason: playerDecision.reason
      };

      setTransferOffers(prev => prev.map(offer => offer.id === offerId ? rejectedOffer : offer));
      setMessages(prev => [{
        id: `MAIL_TRANSFER_PLAYER_REJECT_${rejectedOffer.id}`,
        sender: `Agent gracza ${targetPlayer.lastName}`,
        role: 'Agencja menadzerska',
        subject: `Zawodnik odrzucil transfer: ${targetPlayer.firstName} ${targetPlayer.lastName}`,
        body: `${playerDecision.reason}\n\nZawodnik nie chce wracac do rozmow przed ${transferLockoutDate.toLocaleDateString('pl-PL')}.`,
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 95
      }, ...prev]);

      return {
        ok: false,
        status: TransferOfferStatus.PLAYER_REJECTED,
        message: `${playerDecision.reason}\n\nKolejna proba bedzie mozliwa dopiero po ${transferLockoutDate.toLocaleDateString('pl-PL')}.`,
        offer: rejectedOffer
      };
    }

    const readyOffer: TransferOffer = {
      ...transferOffer,
      salary: Math.round(contractInput.salary),
      bonus: Math.round(contractInput.bonus),
      years: contractInput.years,
      goalBonus: contractInput.goalBonus,
      assistBonus: contractInput.assistBonus,
      cleanSheetBonus: contractInput.cleanSheetBonus,
      status: TransferOfferStatus.READY_TO_FINALIZE,
      playerReason: playerDecision.reason
    };

    const directorPurchaseDecision = buyerClub.sportingDirector
      ? SportingDirectorService.evaluateIncomingPurchaseDecision({
          club: buyerClub,
          player: targetPlayer,
          squad: buyerSquad,
          sellerClub,
          fee: readyOffer.fee,
          contract: contractInput,
          date: currentDate,
        })
      : null;

    if (directorPurchaseDecision?.blocked) {
      setClubs(prev => prev.map(club => club.id === buyerClub.id ? directorPurchaseDecision.updatedClub : club));
      if (directorPurchaseDecision.mail) prependUniqueMessages([directorPurchaseDecision.mail], true);
      return {
        ok: false,
        status: 'VALIDATION_ERROR',
        message: `Dyrektor sportowy zablokowal transfer: ${directorPurchaseDecision.message}`,
        offer: transferOffer,
      };
    }

    const finalFee = directorPurchaseDecision?.negotiatedFee && directorPurchaseDecision.negotiatedFee < readyOffer.fee
      ? directorPurchaseDecision.negotiatedFee
      : readyOffer.fee;
    const finalReadyOffer: TransferOffer = {
      ...readyOffer,
      fee: finalFee,
    };

    const clubsAfterDirectorApproval = directorPurchaseDecision && directorPurchaseDecision.relationDelta !== 0
      ? clubs.map(club => club.id === buyerClub.id ? directorPurchaseDecision.updatedClub : club)
      : clubs;

    if (transferOffer.timing !== TransferTiming.IMMEDIATE) {
      const agreedOffer: TransferOffer = {
        ...finalReadyOffer,
        status: TransferOfferStatus.AGREED_PRECONTRACT,
        effectiveDate: transferOffer.effectiveDate || targetPlayer.contractEndDate
      };

      if (directorPurchaseDecision?.relationDelta) {
        setClubs(clubsAfterDirectorApproval);
      }
      setTransferOffers(prev => prev.map(offer => offer.id === offerId ? agreedOffer : offer));
      setPlayers(prev => ({
        ...prev,
        [sellerClub.id]: (prev[sellerClub.id] || []).map(player =>
          player.id === targetPlayer.id
            ? {
                ...player,
                transferPendingClubId: buyerClub.id,
                transferReportDate: agreedOffer.effectiveDate || targetPlayer.contractEndDate,
                transferPendingFee: finalFee,
                transferPendingSalary: Math.round(contractInput.salary),
                transferPendingBonus: Math.round(contractInput.bonus),
                transferPendingContractYears: contractInput.years,
                interestedClubs: [],
                isOnTransferList: false,
              }
            : player
        )
      }));
      prependUniqueMessages([
        ...(directorPurchaseDecision?.mail ? [directorPurchaseDecision.mail] : []),
        {
        id: `MAIL_TRANSFER_PRECONTRACT_DONE_${agreedOffer.id}`,
        sender: `Agent gracza ${targetPlayer.lastName}`,
        role: 'Agencja menadzerska',
        subject: `Umowa podpisana: ${targetPlayer.firstName} ${targetPlayer.lastName}`,
        body: transferOffer.timing === TransferTiming.CONTRACT_END
          ? `${targetPlayer.firstName} ${targetPlayer.lastName} zaakceptowal warunki kontraktu. Dolaczy do ${buyerClub.name} od ${new Date(agreedOffer.effectiveDate || targetPlayer.contractEndDate).toLocaleDateString('pl-PL')} po wygasnieciu obecnej umowy.`
          : `${targetPlayer.firstName} ${targetPlayer.lastName} zaakceptowal warunki kontraktu. Transfer do ${buyerClub.name} zostal uzgodniony z data ${new Date(agreedOffer.effectiveDate || currentDate).toLocaleDateString('pl-PL')}.`,
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 98
      }]);

      return {
        ok: true,
        status: TransferOfferStatus.AGREED_PRECONTRACT,
        message: transferOffer.timing === TransferTiming.CONTRACT_END
          ? `${targetPlayer.firstName} ${targetPlayer.lastName} podpisal umowe z data obowiazywania od ${new Date(agreedOffer.effectiveDate || targetPlayer.contractEndDate).toLocaleDateString('pl-PL')}.`
          : `${targetPlayer.firstName} ${targetPlayer.lastName} zaakceptowal transfer z data wejscia w zycie ${new Date(agreedOffer.effectiveDate || currentDate).toLocaleDateString('pl-PL')}.`,
        offer: agreedOffer
      };
    }

    const execution = TransferExecutionService.finalizeTransfer(
      finalReadyOffer,
      clubsAfterDirectorApproval,
      players,
      currentDate
    );

    setClubs(execution.updatedClubs);
    setPlayers(execution.updatedPlayers);
    setLineups(prev => {
      const next = { ...prev };
      const updatedSellerSquad = execution.updatedPlayers[sellerClub.id] || [];

      if (next[sellerClub.id]) {
        next[sellerClub.id] = LineupService.repairLineup(next[sellerClub.id], updatedSellerSquad);
      }

      if (next[buyerClub.id]) {
        const buyerLineup = next[buyerClub.id];
        const allKnownIds = new Set([
          ...buyerLineup.bench,
          ...buyerLineup.reserves,
          ...(buyerLineup.startingXI.filter(Boolean) as string[])
        ]);

        if (!allKnownIds.has(readyOffer.playerId)) {
          next[buyerClub.id] = {
            ...buyerLineup,
            reserves: [...buyerLineup.reserves, readyOffer.playerId]
          };
        }
      }

      return next;
    });

    const completedOffer: TransferOffer = {
      ...finalReadyOffer,
      status: TransferOfferStatus.COMPLETED
    };

    setTransferOffers(prev => prev.map(offer => offer.id === offerId ? completedOffer : offer));
    prependUniqueMessages([
      ...(directorPurchaseDecision?.mail ? [directorPurchaseDecision.mail] : []),
      {
      id: `MAIL_TRANSFER_DONE_${completedOffer.id}`,
      sender: 'Centrum transferowe',
      role: 'System rejestracji transferow',
      subject: `Transfer potwierdzony: ${targetPlayer.firstName} ${targetPlayer.lastName}`,
      body: `${targetPlayer.firstName} ${targetPlayer.lastName} dolacza do ${buyerClub.name}. Klub ${sellerClub.name} zaakceptowal kwote ${completedOffer.fee.toLocaleString()} PLN, a zawodnik podpisal kontrakt na ${contractInput.years} lata.`,
      date: new Date(currentDate),
      isRead: false,
      type: MailType.SYSTEM,
      priority: 98
    }]);

    return {
      ok: true,
      status: TransferOfferStatus.COMPLETED,
      message: `${targetPlayer.firstName} ${targetPlayer.lastName} zaakceptowal transfer do ${buyerClub.name}.`,
      offer: completedOffer
    };
  }, [userTeamId, transferOffers, clubs, players, currentDate]);

const finalizeFreeAgentContract = useCallback((mailId: string) => {
    const mail = messages.find(m => m.id === mailId);
    // TUTAJ WSTAW TEN KOD (Weryfikacja typu metadanych)
    if (!mail || !mail.metadata || mail.metadata.type !== 'CONTRACT_OFFER' || !userTeamId) return;

    const { playerId, salary, years, bonus, goalBonus, assistBonus, cleanSheetBonus } = mail.metadata;
    // KONIEC KODU
    const freeAgents = players['FREE_AGENTS'] || [];
    const playerToSign = freeAgents.find(p => p.id === playerId);
    const userClub = clubs.find(c => c.id === userTeamId);
    const userSquad = players[userTeamId] || [];

    if (!playerToSign || !userClub) return;
    const resolvedPlayer = playerToSign;

    const failForNoFunds = () => {
      const lockoutDate = new Date(currentDate);
      lockoutDate.setFullYear(lockoutDate.getFullYear() + 1);

      setPlayers(prevPlayers => ({
        ...prevPlayers,
        ['FREE_AGENTS']: (prevPlayers['FREE_AGENTS'] || []).map(player =>
          player.id === resolvedPlayer.id
            ? {
                ...player,
                freeAgentLockoutUntil: null,
                isNegotiationPermanentBlocked: false,
                freeAgentClubLockouts: FreeAgentNegotiationService.buildClubLockouts(
                  player.freeAgentClubLockouts,
                  userTeamId,
                  lockoutDate.toISOString()
                )
              }
            : player
        )
      }));

      const offendedMail: MailMessage = {
        id: `MAIL_FA_NO_FUNDS_${mail.id}`,
        sender: `Agent gracza ${resolvedPlayer.lastName}`,
        role: 'Agencja Menadzerska',
        subject: `Rozmowy zerwane: ${resolvedPlayer.firstName} ${resolvedPlayer.lastName}`,
        body: `Po ponownej weryfikacji okazalo sie, ze klub ${userClub.name} nie ma srodkow na realizacje uzgodnionych warunkow. Moj klient potraktowal to jako brak powagi. Wracamy do rozmow najwczesniej po ${lockoutDate.toLocaleDateString('pl-PL')}.`,
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 96
      };

      setMessages(prev => [offendedMail, ...prev.filter(existingMail => existingMail.id !== mailId)]);

      return showGameNotification({
        title: 'Transfer anulowany',
        message: `${resolvedPlayer.firstName} ${resolvedPlayer.lastName} zerwal rozmowy z ${userClub.name} po wykryciu braku srodkow. Kolejna proba bedzie mozliwa dopiero za rok.`,
        tone: 'error'
      });
    };

    // 1. Zabierz bonus i wartość kontraktu (pensja × lata) z budżetu transferowego
    const contractCost = bonus + salary * years;
    if (contractCost > userClub.transferBudget) {
      return failForNoFunds();
    }

    const hasExceptionalContractApproval = (userClub.boardExceptionalContractApprovals ?? 0) > 0;
    if (!hasExceptionalContractApproval) {
      const boardDecision = FinanceService.evaluateFASigningBoardDecision(
        resolvedPlayer,
        salary,
        bonus,
        userSquad,
        userClub
      );
      if (!boardDecision.approved) {
        return showGameNotification({
          title: 'Veto zarzadu',
          message: boardDecision.reason,
          tone: 'error'
        });
      }
    }

    const directorFreeAgentDecision = userClub.sportingDirector
      ? SportingDirectorService.evaluateFreeAgentSigningDecision({
          club: userClub,
          player: resolvedPlayer,
          squad: userSquad,
          contract: { salary, years, bonus, goalBonus, assistBonus, cleanSheetBonus },
          date: currentDate,
        })
      : null;

    if (directorFreeAgentDecision?.blocked) {
      setClubs(prev => prev.map(c => c.id === userTeamId ? directorFreeAgentDecision.updatedClub : c));
      setMessages(prev => prev.filter(existingMail => existingMail.id !== mailId));
      if (directorFreeAgentDecision.mail) {
        prependUniqueMessages([directorFreeAgentDecision.mail], true);
      }

      return showGameNotification({
        title: 'Weto dyrektora sportowego',
        message: directorFreeAgentDecision.message,
        tone: 'error'
      });
    }

    const nextTransferBudget = Math.max(0, userClub.transferBudget - contractCost);

    setClubs(prev => prev.map(c => c.id === userTeamId ? {
      ...(directorFreeAgentDecision?.relationDelta ? directorFreeAgentDecision.updatedClub : c),
      transferBudget: nextTransferBudget,
      boardExceptionalContractApprovals: hasExceptionalContractApproval
        ? Math.max(0, (c.boardExceptionalContractApprovals ?? 0) - 1)
        : c.boardExceptionalContractApprovals,
      financeHistory: [
        {
          id: Math.random().toString(36).substr(2, 9),
          date: currentDate.toISOString().split('T')[0],
          amount: -contractCost,
          type: 'EXPENSE' as const,
          description: `Kontrakt z wolnym agentem: ${resolvedPlayer.lastName} (${years}L × ${salary.toLocaleString('pl-PL')} PLN + bonus)`
        },
        ...(c.financeHistory || [])
      ].slice(0, 50)
    } : c));

    // 2. Przygotuj dane piłkarza (nowy klub, pensja, data)
    const newEndDate = new Date(currentDate.getFullYear() + years, 5, 30).toISOString();
    const transferLockoutDate = new Date(currentDate);
    transferLockoutDate.setMonth(transferLockoutDate.getMonth() + 3);
   // AKTUALIZACJA HISTORII - TUTAJ WSTAW TEN KOD
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const updatedHistory = PlayerCareerService.movePlayer(
      resolvedPlayer,
      { clubName: userClub?.name || 'Nieznany Klub', clubId: userTeamId },
      currentYear,
      currentMonth
    );

    const updatedPlayer = {
      ...resolvedPlayer,
      clubId: userTeamId,
      annualSalary: salary,
      goalBonus: goalBonus ?? undefined,
      assistBonus: assistBonus ?? undefined,
      cleanSheetBonus: cleanSheetBonus ?? undefined,
      contractEndDate: newEndDate,
      transferLockoutUntil: transferLockoutDate.toISOString(),
      marketValue: FinanceService.calculateMarketValue(
        { ...resolvedPlayer, clubId: userTeamId },
        userClub?.reputation ?? 5,
        userClub?.tier ?? 1,
        userClub?.country
      ),
      history: updatedHistory // Podpinamy zaktualizowaną historię
    };

    // 3. Przenieś piłkarza: usuń z wolnych, dodaj do klubu
    setPlayers(prev => ({
      ...prev,
      ['FREE_AGENTS']: prev['FREE_AGENTS'].filter(p => p.id !== playerId),
      [userTeamId]: [...(prev[userTeamId] || []), updatedPlayer]
    }));

    // 4. Usuń wiadomość e-mail
    setMessages(prev => prev.filter(m => m.id !== mailId));
    if (directorFreeAgentDecision?.mail) {
      prependUniqueMessages([directorFreeAgentDecision.mail], true);
    }
    return showGameNotification({
      title: 'Transfer sfinalizowany',
      message: `${resolvedPlayer.firstName} ${resolvedPlayer.lastName} dolaczyl do kadry ${userClub?.name || ''}.`,
      tone: 'success'
    });
  }, [messages, players, userTeamId, currentDate, clubs, showGameNotification]);

  useEffect(() => {
    const duePreContracts = transferOffers.filter(offer =>
      offer.status === TransferOfferStatus.AGREED_PRECONTRACT &&
      offer.effectiveDate &&
      new Date(currentDate).setHours(0, 0, 0, 0) >= new Date(offer.effectiveDate).setHours(0, 0, 0, 0)
    );

    if (duePreContracts.length === 0) return;

    let nextClubs = clubs;
    let nextPlayers = players;
    let nextLineups = { ...lineups };
    const completedIds = new Set<string>();
    const completionMessages: MailMessage[] = [];

    duePreContracts.forEach(offer => {
      const sellerClub = nextClubs.find(club => club.id === offer.sellerClubId);
      const buyerClub = nextClubs.find(club => club.id === offer.buyerClubId);
      const sellerSquad = nextPlayers[offer.sellerClubId] || [];
      const targetPlayer = sellerSquad.find(player => player.id === offer.playerId);

      if (!sellerClub || !buyerClub || !targetPlayer) return;

      const execution = TransferExecutionService.finalizeTransfer(
        offer,
        nextClubs,
        nextPlayers,
        new Date(offer.effectiveDate || currentDate)
      );

      nextClubs = execution.updatedClubs;
      nextPlayers = execution.updatedPlayers;

      const updatedSellerSquad = execution.updatedPlayers[sellerClub.id] || [];
      if (nextLineups[sellerClub.id]) {
        nextLineups[sellerClub.id] = LineupService.repairLineup(nextLineups[sellerClub.id], updatedSellerSquad);
      }

      if (nextLineups[buyerClub.id]) {
        const buyerLineup = nextLineups[buyerClub.id];
        const allKnownIds = new Set([
          ...buyerLineup.bench,
          ...buyerLineup.reserves,
          ...(buyerLineup.startingXI.filter(Boolean) as string[])
        ]);

        if (!allKnownIds.has(offer.playerId)) {
          nextLineups[buyerClub.id] = {
            ...buyerLineup,
            reserves: [...buyerLineup.reserves, offer.playerId]
          };
        }
      }

      completedIds.add(offer.id);
      completionMessages.push({
        id: `MAIL_TRANSFER_PRECONTRACT_EXEC_${offer.id}`,
        sender: 'Centrum transferowe',
        role: 'System rejestracji transferow',
        subject: `Transfer wszedl w zycie: ${targetPlayer.firstName} ${targetPlayer.lastName}`,
        body: `${targetPlayer.firstName} ${targetPlayer.lastName} dolaczyl do ${buyerClub.name} zgodnie z podpisana wczesniej umowa obowiazujaca od ${new Date(offer.effectiveDate || currentDate).toLocaleDateString('pl-PL')}.`,
        date: new Date(currentDate),
        isRead: false,
        type: MailType.SYSTEM,
        priority: 97
      });
    });

    if (completedIds.size === 0) return;

    setClubs(nextClubs);
    setPlayers(nextPlayers);
    setLineups(nextLineups);
    setTransferOffers(prev => prev.map(offer =>
      completedIds.has(offer.id)
        ? { ...offer, status: TransferOfferStatus.COMPLETED }
        : offer
    ));
    setMessages(prev => [...completionMessages, ...prev]);
  }, [currentDate, transferOffers, clubs, players, lineups]);

  useEffect(() => {
    if (targetJumpTime !== null && viewState !== ViewState.CUP_DRAW) {
      const today = new Date(currentDate).setHours(0,0,0,0);
      if (today < targetJumpTime) {
        const timer = setTimeout(() => {
          advanceDay();
        }, 5);
        return () => clearTimeout(timer);
      } else {
        setTargetJumpTime(null);
      }
    }
  }, [currentDate, targetJumpTime, advanceDay, viewState]);

  // ── Premie UEFA za Puchary Europejskie ─────────────────────────────────────
  useEffect(() => {
    if (!userTeamId) return;

    const GROUP_STAGES: string[] = [CompetitionType.CL_GROUP_STAGE, CompetitionType.EL_GROUP_STAGE, CompetitionType.CONF_GROUP_STAGE];
    const RETURN_LEG_MAP: Record<string, { comp: 'CL'|'EL'|'CONF'; event: 'Q1_ADVANCE'|'Q2_ADVANCE'|'R16'|'QF'|'SF'; label: string }> = {
      [CompetitionType.CL_R1Q_RETURN]:   { comp: 'CL',   event: 'Q1_ADVANCE', label: 'awans do II rundy kwalifikacyjnej Ligi Mistrzów' },
      [CompetitionType.CL_R2Q_RETURN]:   { comp: 'CL',   event: 'Q2_ADVANCE', label: 'awans do fazy ligowej Ligi Mistrzów' },
      [CompetitionType.CL_R16_RETURN]:   { comp: 'CL',   event: 'R16',        label: 'awans do ćwierćfinału Ligi Mistrzów' },
      [CompetitionType.CL_QF_RETURN]:    { comp: 'CL',   event: 'QF',         label: 'awans do półfinału Ligi Mistrzów' },
      [CompetitionType.CL_SF_RETURN]:    { comp: 'CL',   event: 'SF',         label: 'awans do finału Ligi Mistrzów' },
      [CompetitionType.EL_R1Q_RETURN]:   { comp: 'EL',   event: 'Q1_ADVANCE', label: 'awans do II rundy kwalifikacyjnej Ligi Europy' },
      [CompetitionType.EL_R2Q_RETURN]:   { comp: 'EL',   event: 'Q2_ADVANCE', label: 'awans do fazy ligowej Ligi Europy' },
      [CompetitionType.EL_R16_RETURN]:   { comp: 'EL',   event: 'R16',        label: 'awans do ćwierćfinału Ligi Europy' },
      [CompetitionType.EL_QF_RETURN]:    { comp: 'EL',   event: 'QF',         label: 'awans do półfinału Ligi Europy' },
      [CompetitionType.EL_SF_RETURN]:    { comp: 'EL',   event: 'SF',         label: 'awans do finału Ligi Europy' },
      [CompetitionType.CONF_R1Q_RETURN]: { comp: 'CONF', event: 'Q1_ADVANCE', label: 'awans do II rundy kwalifikacyjnej Ligi Konferencji' },
      [CompetitionType.CONF_R2Q_RETURN]: { comp: 'CONF', event: 'Q2_ADVANCE', label: 'awans do fazy ligowej Ligi Konferencji' },
      [CompetitionType.CONF_R16_RETURN]: { comp: 'CONF', event: 'R16',        label: 'awans do ćwierćfinału Ligi Konferencji' },
      [CompetitionType.CONF_QF_RETURN]:  { comp: 'CONF', event: 'QF',         label: 'awans do półfinału Ligi Konferencji' },
      [CompetitionType.CONF_SF_RETURN]:  { comp: 'CONF', event: 'SF',         label: 'awans do finału Ligi Konferencji' },
    };
    const FINALS_MAP: Record<string, { comp: 'CL'|'EL'|'CONF'; name: string }> = {
      [CompetitionType.CL_FINAL]:   { comp: 'CL',   name: 'Ligi Mistrzów' },
      [CompetitionType.EL_FINAL]:   { comp: 'EL',   name: 'Ligi Europy' },
      [CompetitionType.CONF_FINAL]: { comp: 'CONF', name: 'Ligi Konferencji' },
    };
    const GROUP_STAGE_COMP: Record<string, 'CL'|'EL'|'CONF'> = {
      [CompetitionType.CL_GROUP_STAGE]:   'CL',
      [CompetitionType.EL_GROUP_STAGE]:   'EL',
      [CompetitionType.CONF_GROUP_STAGE]: 'CONF',
    };
    const GROUP_STAGE_NAMES: Record<string, string> = {
      CL: 'Ligi Mistrzów', EL: 'Ligi Europy', CONF: 'Ligi Konferencji',
    };

    const awardPrize = (prize: number, description: string, date: string) => {
      setClubs(prev => prev.map(c => {
        if (c.id !== userTeamId) return c;
        const log: FinanceLog = {
          id: `UEFA_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          date,
          amount: prize,
          type: 'INCOME',
          description,
          previousBalance: c.budget,
        };
        return { ...c, budget: c.budget + prize, financeHistory: [log, ...(c.financeHistory || [])].slice(0, 50) };
      }));
    };

    const userEurFixtures = globalFixtures.filter(f =>
      f.status === MatchStatus.FINISHED &&
      (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId) &&
      (GROUP_STAGES.includes(f.leagueId) || !!RETURN_LEG_MAP[f.leagueId] || !!FINALS_MAP[f.leagueId])
    );

    userEurFixtures.forEach(f => {
      const fDate = f.date instanceof Date ? f.date.toISOString().split('T')[0] : new Date(f.date).toISOString().split('T')[0];
      const isHome = f.homeTeamId === userTeamId;
      const teamScore = isHome ? (f.homeScore ?? 0) : (f.awayScore ?? 0);
      const oppScore  = isHome ? (f.awayScore ?? 0) : (f.homeScore ?? 0);

      // ── Faza grupowa / ligowa: premia za wygraną lub remis ──────────────
      if (GROUP_STAGES.includes(f.leagueId)) {
        const comp = GROUP_STAGE_COMP[f.leagueId];
        const compName = GROUP_STAGE_NAMES[comp];
        if (teamScore > oppScore) {
          const key = `UEFA_GS_WIN_${f.id}`;
          if (!sentMailIdsRef.current.has(key)) {
            sentMailIdsRef.current.add(key);
            awardPrize(FinanceService.calculateEuropeanPrizeMoney(comp, 'WIN'), `Premia UEFA — zwycięstwo w fazie ligowej ${compName}`, fDate);
          }
        } else if (teamScore === oppScore) {
          const key = `UEFA_GS_DRAW_${f.id}`;
          if (!sentMailIdsRef.current.has(key)) {
            sentMailIdsRef.current.add(key);
            awardPrize(FinanceService.calculateEuropeanPrizeMoney(comp, 'DRAW'), `Premia UEFA — remis w fazie ligowej ${compName}`, fDate);
          }
        }
        return;
      }

      // ── Rewanże — ustalenie zwycięzcy agregatu ──────────────────────────
      const retInfo = RETURN_LEG_MAP[f.leagueId];
      if (retInfo) {
        const key = `UEFA_ADV_${f.id}`;
        if (sentMailIdsRef.current.has(key)) return;
        const firstLegId = f.id.replace('_RETURN', '');
        const firstLeg = globalFixtures.find(fl => fl.id === firstLegId);
        if (!firstLeg || firstLeg.homeScore === null || firstLeg.awayScore === null) return;

        const leg1HomeId = firstLeg.homeTeamId;
        const leg1AwayId = firstLeg.awayTeamId;
        const firstLegHomeIsReturnAway = f.awayTeamId === leg1HomeId;
        const retH = f.homeScore ?? 0;
        const retA = f.awayScore ?? 0;
        const aggH = firstLegHomeIsReturnAway
          ? (firstLeg.homeScore ?? 0) + retA
          : (firstLeg.homeScore ?? 0) + retH;
        const aggA = firstLegHomeIsReturnAway
          ? (firstLeg.awayScore ?? 0) + retH
          : (firstLeg.awayScore ?? 0) + retA;

        let winnerId: string | null = null;
        if (aggH > aggA) winnerId = leg1HomeId;
        else if (aggA > aggH) winnerId = leg1AwayId;
        else {
          const pH = f.homePenaltyScore ?? 0;
          const pA = f.awayPenaltyScore ?? 0;
          if (pH > pA) winnerId = f.homeTeamId;
          else if (pA > pH) winnerId = f.awayTeamId;
        }
        if (winnerId !== userTeamId) return;

        sentMailIdsRef.current.add(key);
        awardPrize(FinanceService.calculateEuropeanPrizeMoney(retInfo.comp, retInfo.event), `Premia UEFA — ${retInfo.label}`, fDate);

        // Awans z kwalifikacji do fazy ligowej → osobna premia za uczestnictwo
        if (retInfo.event === 'Q2_ADVANCE') {
          const gsKey = `UEFA_GS_ENTRY_${f.id}`;
          if (!sentMailIdsRef.current.has(gsKey)) {
            sentMailIdsRef.current.add(gsKey);
            const gsName = GROUP_STAGE_NAMES[retInfo.comp];
            awardPrize(FinanceService.calculateEuropeanPrizeMoney(retInfo.comp, 'GROUP_STAGE_ENTRY'), `Premia UEFA — uczestnictwo w fazie ligowej ${gsName}`, fDate);
          }
        }
        return;
      }

      // ── Finał — premia za udział + premia za zwycięstwo ─────────────────
      const finalInfo = FINALS_MAP[f.leagueId];
      if (finalInfo) {
        const finalistKey = `UEFA_FINALIST_${f.id}`;
        if (!sentMailIdsRef.current.has(finalistKey)) {
          sentMailIdsRef.current.add(finalistKey);
          awardPrize(FinanceService.calculateEuropeanPrizeMoney(finalInfo.comp, 'FINALIST'), `Premia UEFA — udział w finale ${finalInfo.name}`, fDate);
        }
        const h = f.homeScore ?? 0;
        const a = f.awayScore ?? 0;
        let winnerId: string | null = null;
        if (h > a) winnerId = f.homeTeamId;
        else if (a > h) winnerId = f.awayTeamId;
        else {
          const pH = f.homePenaltyScore ?? 0;
          const pA = f.awayPenaltyScore ?? 0;
          if (pH > pA) winnerId = f.homeTeamId;
          else if (pA > pH) winnerId = f.awayTeamId;
        }
        if (winnerId === userTeamId) {
          const winnerKey = `UEFA_WINNER_${f.id}`;
          if (!sentMailIdsRef.current.has(winnerKey)) {
            sentMailIdsRef.current.add(winnerKey);
            awardPrize(FinanceService.calculateEuropeanPrizeMoney(finalInfo.comp, 'WINNER'), `Premia UEFA — zwycięstwo w ${finalInfo.name}`, fDate);
          }
        }
      }
    });
  }, [globalFixtures, userTeamId, setClubs]);

  const jumpToDate = (date: Date) => setTargetJumpTime(new Date(date).setHours(0,0,0,0));
  const jumpToNextEvent = () => {
    if (nextEvent) {
       const today = new Date(currentDate).setHours(0, 0, 0, 0);
       const eventDate = new Date(nextEvent.startDate).setHours(0, 0, 0, 0);
       if (eventDate <= today) advanceDay();
       else jumpToDate(nextEvent.startDate);
    } else advanceDay();
  };

  const viewClubDetails = (clubId: string) => { setViewedClubId(clubId); navigateTo(ViewState.CLUB_DETAILS); };
  const viewPlayerDetails = (playerId: string) => { setViewedPlayerId(playerId); navigateTo(ViewState.PLAYER_CARD); };
  const viewCoachDetails = (coachId: string) => { setViewedCoachId(coachId); navigateTo(ViewState.COACH_CARD); };
  const viewRefereeDetails = (refId: string) => { setViewedRefereeId(refId); navigateTo(ViewState.REFEREE_CARD); };

  useEffect(() => {
    if (userTeamId && seasonTemplate) {
      const userClub = clubs.find(c => c.id === userTeamId);
      const tierStr = userClub?.leagueId.split('_')[2];
      const tier = tierStr ? parseInt(tierStr) : 1;
      const ev = CalendarEngine.getNextPlayerEvent(currentDate, userTeamId, tier, leagueSchedules, seasonTemplate, allFixtures, clubs);
      setNextEvent(ev);
    }
  }, [currentDate, userTeamId, leagueSchedules, seasonTemplate, clubs, allFixtures]);

  return (
    <GameContext.Provider value={{
      currentDate, viewState, clubs, leagues, players, viewCoachDetails, coaches, staffMembers, lineups, fixtures: allFixtures, userTeamId, seasonTemplate, leagueSchedules, nextEvent,
    viewedClubId, viewedPlayerId, viewedCoachId, viewedRefereeId, previousViewState, lastMatchSummary, roundResults, isJumping: targetJumpTime !== null,
      lastRecoveryDate,
      managerProfile, seasonNumber, activeMatchState, messages, activeTrainingId, cupParticipants, activeCupDraw, activePlayoffDraw, confirmPlayoffDraw,
      activeIntensity, setTrainingIntensity: setActiveIntensity, trainingProgressHistory, reserveProgressHistory,
      startNewGame, getSaveState, loadGameFromFile, saveManagerProfile, selectUserTeam, advanceDay, jumpToDate, jumpToNextEvent, navigateTo, navigateWithoutHistory, updateLineup, viewClubDetails, viewPlayerDetails, viewRefereeDetails, getOrGenerateSquad,
      setPlayers, setClubs, setLastMatchSummary, addRoundResults, applySimulationResult, setActiveMatchState, pendingMatchKits, setPendingMatchKits,
      pendingFriendlyRequests, addFriendlyRequest, cancelFriendly,
      aiFriendlyPairs, aiFriendlyReports,
      activeFriendlyFixtureId, activeFriendlyConditions, setActiveFriendlyConditions,
      setMessages, pendingNegotiations, setPendingNegotiations, finalizeFreeAgentContract, transferOffers, submitTransferOffer, finalizeTransferNegotiation, incomingOffers, viewedIncomingOfferId, respondToIncomingOffer, confirmIncomingTransfer, navigateToIncomingOffer, transferNewsActiveTab, setTransferNewsActiveTab, contractManagementInitialMode, setContractManagementInitialMode, europeanStatus, setEuropeanStatus, aiTransferLog,
            markMessageRead, deleteMessage, setActiveTrainingId, confirmCupDraw, confirmCLDraw, confirmELDraw, confirmELR2QDraw, confirmCONFDraw, confirmCONFR2QDraw, activeGroupDraw,
    confirmCLGroupDraw, confirmELGroupDraw, confirmELR16Draw, confirmCLQFDraw, confirmCLSFDraw, confirmCLR16Draw, confirmELQFDraw, confirmELSFDraw, confirmELFinalDraw, confirmCONFGroupDraw, confirmCONFR16Draw, confirmCONFQFDraw, confirmCONFSFDraw, confirmCONFFinalDraw, confirmSeasonEnd, clGroups, activeELGroupDraw, elGroups, activeConfGroupDraw, confGroups, processBackgroundCupMatches, processCLMatchDay, sessionSeed, updatePlayer, importSquad, toggleTransferList, toggleUntouchable, setSquadRole, addFinanceLog, supercupWinners, addSupercupWinner, currentCLWinnerId, currentELWinnerId, lastUEFASuperCupResult, setLastUEFASuperCupResult, elHistoryInitialRound, setElHistoryInitialRound, confHistoryInitialRound, setConfHistoryInitialRound,
    nationalTeams, setNationalTeams,
    lastNTMatchResults, setLastNTMatchResults,
    wcqPlayoffState, setWcqPlayoffState,
    wcState, setWcState,
    europeanViewTab, setEuropeanViewTab, selectedNTId, setSelectedNTId, isResigned, resignFromClub,
    gameNotification, showGameNotification, clearGameNotification, respondToSportingDirectorObjective, requestStadiumExpansion, submitBoardClubRequest,
    // ── BARAŻE O UTRZYMANIE ─────────────────────────────────────────────────
    relegationPlayoffFirstLegResults, relegationPlayoffFinalResult,
    confirmRelegationPlayoffMatch1, confirmRelegationPlayoffMatch2,
    promotionPlayoffSemiResults, promotionPlayoffFinalResults,
    confirmPromotionPlayoffSemi, confirmPromotionPlayoffFinal,
    activePlayoffMatch, setActivePlayoffMatch,
    setRelegationPlayoffFirstLegResults, setRelegationPlayoffFinalResult,
    setPromotionPlayoffSemiResults, setPromotionPlayoffFinalResults,
    reserves, setReserves, reserveCoachId,
    reserveFixtures, setReserveFixtures,
    reserveMatchResults, setReserveMatchResults,
    academy, initAcademy, submitUpgradeProposal, startAcademyUpgrade, promoteYouthPlayer, dismissYouthPlayer, setYouthFocus, startScoutMission, setAcademyRegionFocus, setAcademyOperationalBudget, signYouthPlayerContract,
    scoutPool, scoutMarket, employedScouts, hireScout, fireScout, refreshScoutMarket, scoutMarketRefreshDate, scoutMarketManualRefreshCount, scoutMarketPeriodStart,
    pendingOpenTalk, setPendingOpenTalk,
    applyWeeklyMotivation, conductIndividualTalk, fireStaffMember, extendStaffContract, negotiateStaffContract, hireStaffMember,
    winterCampInvitePending, winterCampProgramPending,
    clearWinterCampInvitePending, clearWinterCampProgramPending, reopenWinterCampInvite,
    saveWinterCampLocation, saveWinterCampProgram,
    summerCampInvitePending, summerCampProgramPending,
    clearSummerCampInvitePending, clearSummerCampProgramPending,
    saveSummerCampLocation, saveSummerCampProgram,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) throw new Error('useGame must be used within a GameProvider');
  return context;
};
