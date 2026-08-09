import { TransferScoutingService } from '../services/TransferScoutingService';
import {
  Club,
  HealthStatus,
  Player,
  PlayerPosition,
  Region,
  TransferScout,
  TransferScoutingFilters,
} from '../types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const pool = TransferScoutingService.generateScoutPool(20260809);
assert(pool.length === 48, 'Rynek powinien zawierać powiększoną pulę 48 skautów transferowych.');
assert(TransferScoutingService.getMaxScouts() === 3, 'Klub może zatrudnić maksymalnie trzech skautów transferowych.');
assert(pool.filter(scout => scout.nationality === Region.POLAND).length === 36, '75% rynku skautów powinno pochodzić z Polski.');
const europeanScoutRegions = new Set([
  Region.BALKANS, Region.CZ_SK, Region.IBERIA, Region.GERMANY, Region.FRANCE, Region.EX_USSR,
  Region.ROMANIA, Region.SCANDINAVIA, Region.ENGLAND, Region.ITALY, Region.BENELUX,
  Region.HUNGARIAN, Region.BALTIC,
]);
assert(pool.filter(scout => europeanScoutRegions.has(scout.nationality)).length === 11, 'Około 23% rynku powinno pochodzić z pozostałej części Europy.');
assert(pool.filter(scout => scout.nationality !== Region.POLAND && !europeanScoutRegions.has(scout.nationality)).length === 1, 'Około 2% rynku powinno pochodzić spoza Europy.');
assert(pool.every(scout => scout.reputation >= 1 && scout.reputation <= 5), 'Każdy skaut powinien mieć reputację od 1 do 5 gwiazdek.');
assert(
  pool.every(scout => Math.max(scout.judgment, scout.reach, scout.speed, scout.experience) >= 15),
  'Każdy skaut powinien mieć wyraźną mocną stronę zamiast niskiej, ogólnej oceny gwiazdkowej.'
);

const weakScout: TransferScout = {
  ...pool[0],
  id: 'TRANSFER_SCOUT_WEAK',
  judgment: 4,
  reach: 4,
  speed: 4,
  experience: 4,
  regionalSpecialty: undefined,
};
const strongScout: TransferScout = {
  ...pool[1],
  id: 'TRANSFER_SCOUT_STRONG',
  judgment: 19,
  reach: 19,
  speed: 19,
  experience: 19,
  regionalSpecialty: Region.BRAZIL,
  positionSpecialty: PlayerPosition.MID,
};

const filters: TransferScoutingFilters = {
  position: PlayerPosition.MID,
  region: Region.BRAZIL,
  ageMin: 18,
  ageMax: 25,
  contractStatus: 'FREE_AGENT',
  likelihood: 'ANY',
  attributes: {
    pace: { min: 60, max: 99 },
    passing: { min: 60, max: 99 },
  },
};

assert(
  TransferScoutingService.getAssignmentDays(strongScout, filters) < TransferScoutingService.getAssignmentDays(weakScout, filters),
  'Lepszy skaut ze specjalizacją powinien szybciej przygotować raport.'
);

const userClub = {
  id: 'USER_CLUB',
  name: 'Klub Testowy',
  country: 'Polska',
  leagueId: 'L_PL_1',
  reputation: 8,
} as Club;

const scoutContractOffer = { durationYears: 2 as const, weeklySalary: pool[0].weeklySalary };
const scoutContract = TransferScoutingService.buildScoutContract(pool[0], scoutContractOffer, new Date('2026-08-09T12:00:00Z'));
assert(scoutContract.endDate === '2028-08-09', 'Dwuletni kontrakt skauta powinien kończyć się po dwóch latach.');
assert(scoutContract.earlyTerminationPenalty > 0, 'Kontrakt powinien zawierać karę za wcześniejsze rozwiązanie.');
assert(scoutContract.earlyTerminationPenalty % 10_000 === 0, 'Kara kontraktowa powinna być zaokrąglona do 10 000 PLN.');
assert(scoutContract.weeklySalary % 500 === 0, 'Pensja tygodniowa skauta powinna być zaokrąglona do 500 PLN.');
assert(
  TransferScoutingService.evaluateContractOffer(pool[0], userClub, scoutContractOffer, new Date('2026-08-09T12:00:00Z')).status
    === TransferScoutingService.evaluateContractOffer(pool[0], userClub, scoutContractOffer, new Date('2026-08-09T12:00:00Z')).status,
  'Decyzja skauta o podpisaniu tej samej oferty musi być stabilna.'
);

const makePlayer = (index: number): Player => ({
  id: `HIDDEN_PLAYER_${index}`,
  firstName: 'Ukryty',
  lastName: `Zawodnik${index}`,
  age: 18 + (index % 7),
  clubId: 'FREE_AGENTS',
  nationality: Region.BRAZIL,
  nationalityCountry: 'Brazylia',
  position: PlayerPosition.MID,
  overallRating: 58 + (index % 18),
  attributes: {
    strength: 65, stamina: 70, pace: 68 + (index % 20), defending: 50,
    passing: 70, attacking: 66, finishing: 55, technique: 72, vision: 68,
    dribbling: 70, heading: 45, positioning: 64, goalkeeping: 5, freeKicks: 55,
    talent: 70, penalties: 55, corners: 60, aggression: 50, crossing: 65,
    leadership: 45, mentality: 65, workRate: 70,
  },
  stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
  health: { status: HealthStatus.HEALTHY },
  condition: 100,
  suspensionMatches: 0,
  contractEndDate: '2026-08-09',
  annualSalary: 400_000 + index * 10_000,
  marketValue: 5_000_000 + index * 100_000,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 0,
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
  reputacja: 55 + index,
  lojalnosc: 50,
} as Player);

const candidates = Array.from({ length: 30 }, (_, index) => makePlayer(index));
const playersByClub = { FREE_AGENTS: candidates, USER_CLUB: [] };
const currentDate = new Date('2026-08-09T12:00:00Z');
const probabilityA = TransferScoutingService.getInterestProbability(candidates[0], userClub, null, playersByClub, currentDate);
const probabilityB = TransferScoutingService.getInterestProbability(candidates[0], userClub, null, playersByClub, currentDate);
assert(probabilityA === probabilityB, 'RNG zainteresowania zawodnika musi być stabilne dla pary zawodnik–klub.');

const assignment = TransferScoutingService.buildAssignment(strongScout, userClub.id, filters, currentDate);
const report = TransferScoutingService.resolveAssignment(
  assignment,
  strongScout,
  userClub,
  [userClub],
  playersByClub,
  new Date(assignment.completionDate),
);
assert(report.candidates.length > 0, 'Dobry skaut powinien znaleźć kandydatów spełniających szerokie kryteria.');
assert(report.candidates.length <= 9, 'Pojedynczy raport nie powinien zawierać więcej niż dziewięciu kandydatów.');
assert(
  report.candidates.every(candidate => candidates.some(player => player.id === candidate.playerId)),
  'Raport musi zawierać istniejących zawodników ze świata gry, a nie nowe wygenerowane rekordy.'
);

const selectedLikelihood = report.candidates[0].likelihood;
const exactLikelihoodReport = TransferScoutingService.resolveAssignment(
  { ...assignment, filters: { ...filters, likelihood: selectedLikelihood } },
  strongScout,
  userClub,
  [userClub],
  playersByClub,
  new Date(assignment.completionDate),
);
assert(exactLikelihoodReport.candidates.length > 0, 'Opcja „Każda” musi pozwalać najpierw znaleźć kandydatów z dowolną szansą transferu.');
assert(
  exactLikelihoodReport.candidates.every(candidate => candidate.likelihood === selectedLikelihood),
  'Wybrana szansa transferu powinna zwracać wyłącznie kandydatów z tej kategorii.'
);

const expiringPlayers = candidates.map((player, index) => ({
  ...player,
  id: `EXPIRING_PLAYER_${index}`,
  clubId: 'SOURCE_CLUB',
  contractEndDate: '2027-02-01',
}));
const validContractPlayers = candidates.map((player, index) => ({
  ...player,
  id: `VALID_CONTRACT_PLAYER_${index}`,
  clubId: 'SOURCE_CLUB',
  contractEndDate: '2028-08-09',
}));
const contractedPlayersByClub = {
  SOURCE_CLUB: [...expiringPlayers, ...validContractPlayers],
  USER_CLUB: [],
};
const expiringReport = TransferScoutingService.resolveAssignment(
  { ...assignment, filters: { ...filters, contractStatus: 'EXPIRING' } },
  strongScout,
  userClub,
  [userClub],
  contractedPlayersByClub,
  new Date(assignment.completionDate),
);
assert(expiringReport.candidates.length > 0, 'Skaut powinien znaleźć zawodników z kontraktem wygasającym w ciągu roku.');
assert(
  expiringReport.candidates.every(candidate => candidate.playerId.startsWith('EXPIRING_PLAYER_')),
  'Filtr wygasającego kontraktu nie może zwracać kontraktów ważnych dłużej niż rok.'
);

const validContractReport = TransferScoutingService.resolveAssignment(
  { ...assignment, filters: { ...filters, contractStatus: 'VALID' } },
  strongScout,
  userClub,
  [userClub],
  contractedPlayersByClub,
  new Date(assignment.completionDate),
);
assert(validContractReport.candidates.length > 0, 'Skaut powinien znaleźć zawodników z kontraktem ważnym dłużej niż rok.');
assert(
  validContractReport.candidates.every(candidate => candidate.playerId.startsWith('VALID_CONTRACT_PLAYER_')),
  'Filtr ważnego kontraktu nie może zwracać umów wygasających w ciągu roku.'
);

console.log('TransferScoutingTests: OK');
