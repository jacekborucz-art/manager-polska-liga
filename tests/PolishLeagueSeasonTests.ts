import { strict as assert } from 'node:assert';
import { STATIC_CLUBS } from '../constants';
import { PolishLeagueSeasonService } from '../services/PolishLeagueSeasonService';
import { ReserveTeamLeagueService } from '../services/ReserveTeamLeagueService';
import { ReserveTeamFinanceService } from '../services/ReserveTeamFinanceService';
import { PolishCupDrawService, POLISH_CUP_BYE_TEAM_ID } from '../services/PolishCupDrawService';
import { MatchStatus } from '../types';

const clubs2025 = PolishLeagueSeasonService.buildClubsForCareerStart(STATIC_CLUBS, 2025);
assert.equal(clubs2025.filter(club => club.leagueId === 'L_PL_1').length, 18);
assert.equal(clubs2025.filter(club => club.leagueId === 'L_PL_2').length, 18);
assert.equal(clubs2025.filter(club => club.leagueId === 'L_PL_3').length, 18);
assert.deepEqual(
  clubs2025.filter(club => club.leagueId === 'L_PL_3').map(club => club.id),
  [
    'PL_UNIA_SKIERNIEWICE',
    'PL_WARTA_POZNAN',
    'PL_OLIMPIA_GRUDZIADZ',
    'PL_PODBESKIDZIE_BIELSKO_BIALA',
    'PL_SLASK_WROCLAW_II',
    'PL_SANDECJA_NOWY_SACZ',
    'PL_PODHALE_NOWY_TARG',
    'PL_CHOJNICZANKA_CHOJNICE',
    'PL_REKORD_BIELSKO_BIALA',
    'PL_STAL_STALOWA_WOLA',
    'PL_HUTNIK_KRAKOW',
    'PL_SWIT_SZCZECIN',
    'PL_RESOVIA',
    'PL_SOKOL_KLECZEW',
    'PL_ZAGLEBIE_SOSNOWIEC',
    'PL_KKS_1925_KALISZ',
    'PL_LKS_II_LODZ',
    'PL_GKS_JASTRZEBIE',
  ]
);

const clubs2026 = PolishLeagueSeasonService.buildClubsForCareerStart(STATIC_CLUBS, 2026);
const activeLeagueIds = ['L_PL_1', 'L_PL_2', 'L_PL_3'] as const;
activeLeagueIds.forEach((leagueId, index) => {
  const leagueClubs = clubs2026.filter(club => club.leagueId === leagueId);
  assert.equal(leagueClubs.length, 18, `${leagueId} musi zawierać 18 klubów`);
  assert.ok(leagueClubs.every(club => club.tier === index + 1));
  assert.ok(leagueClubs.every(club => club.isDefaultActive));
});

const configuredIds = activeLeagueIds.flatMap(leagueId =>
  clubs2026.filter(club => club.leagueId === leagueId).map(club => club.id)
);
assert.equal(new Set(configuredIds).size, 54, 'klub nie może występować jednocześnie w dwóch ligach');

assert.equal(clubs2026.find(club => club.id === 'PL_WISLA_KRAKOW')?.leagueId, 'L_PL_1');
assert.equal(clubs2026.find(club => club.id === 'PL_SLASK_WROCLAW')?.leagueId, 'L_PL_1');
assert.equal(clubs2026.find(club => club.id === 'PL_WIECZYSTA_KRAKOW')?.leagueId, 'L_PL_1');
assert.equal(clubs2026.find(club => club.id === 'PL_ARKA_GDYNIA')?.leagueId, 'L_PL_2');
assert.equal(clubs2026.find(club => club.id === 'PL_TERMALICA_NIECIECZA')?.leagueId, 'L_PL_2');
assert.equal(clubs2026.find(club => club.id === 'PL_LECHIA_GDANSK')?.leagueId, 'L_PL_2');

const slaskReserves = clubs2026.find(club => club.id === 'PL_SLASK_WROCLAW_II');
const legiaReserves = clubs2026.find(club => club.id === 'PL_LEGIA_WARSZAWA_II');
assert.equal(slaskReserves?.leagueId, 'L_PL_3');
assert.equal(legiaReserves?.leagueId, 'L_PL_3');
assert.notEqual(slaskReserves?.id, clubs2026.find(club => club.id === 'PL_SLASK_WROCLAW')?.id);
assert.notEqual(legiaReserves?.id, clubs2026.find(club => club.id === 'PL_LEGIA_WARSZAWA')?.id);

const slaskSecondLeagueTable = clubs2025
  .filter(club => club.leagueId === 'L_PL_3')
  .map((club, index) => ({ ...club, stats: { ...club.stats, points: 100 - index } }));
const slaskReservesIndex = slaskSecondLeagueTable.findIndex(club => club.id === 'PL_SLASK_WROCLAW_II');
const secondPlacedClub = slaskSecondLeagueTable[1];
slaskSecondLeagueTable[1] = slaskSecondLeagueTable[slaskReservesIndex];
slaskSecondLeagueTable[slaskReservesIndex] = secondPlacedClub;

const shiftedPromotion = ReserveTeamLeagueService.selectPromotionPlaces(
  slaskSecondLeagueTable,
  'L_PL_2',
  clubs2025
);
assert.deepEqual(
  shiftedPromotion.direct.map(candidate => candidate.tablePosition),
  [1, 3],
  'nieuprawnione rezerwy z 2. miejsca muszą przesunąć bezpośredni awans na 3. miejsce'
);
assert.deepEqual(
  shiftedPromotion.playoffs.map(candidate => candidate.tablePosition),
  [4, 5, 6, 7],
  'po pominięciu rezerw strefa barażowa musi sięgać 7. miejsca'
);

assert.equal(
  ReserveTeamLeagueService.canEnterLeague('PL_LKS_II_LODZ', 'L_PL_1', clubs2025),
  false,
  'rezerwy nigdy nie mogą awansować do Ekstraklasy'
);

assert.equal(
  ReserveTeamLeagueService.canParticipateAsTransferBuyer('PL_LEGIA_WARSZAWA_II'),
  false,
  'rezerwy nie mogą kupować zawodników'
);

// Transfer-policy matrix for reserve teams and their parent clubs:
// - a reserve team cannot buy from another club,
// - it can still sign a free agent,
// - an ordinary first-team transfer remains valid,
// - a parent first team cannot buy or loan from its own reserves,
// - an unrelated club may still purchase a player owned by the reserves.
// These assertions protect the asymmetric rule from being accidentally reduced
// to a blanket ban on every outgoing transfer involving a reserve team.
assert.equal(
  ReserveTeamLeagueService.canRecruitPlayerFrom('PL_LEGIA_WARSZAWA_II', 'PL_LECH_POZNAN'),
  false,
  'rezerwy nie mogą pozyskiwać zawodników należących do innych klubów'
);
assert.equal(
  ReserveTeamLeagueService.canRecruitPlayerFrom('PL_LEGIA_WARSZAWA_II', 'FREE_AGENTS'),
  true,
  'rezerwy mogą podpisywać wolnych agentów'
);
assert.equal(
  ReserveTeamLeagueService.canRecruitPlayerFrom('PL_LEGIA_WARSZAWA', 'PL_LECH_POZNAN'),
  true,
  'zakaz nie może blokować rynku transferowego pierwszym drużynom'
);
assert.equal(
  ReserveTeamLeagueService.canRecruitPlayerFrom('PL_LEGIA_WARSZAWA', 'PL_LEGIA_WARSZAWA_II'),
  false,
  'pierwsza drużyna nie może kupować ani wypożyczać zawodników ze swoich rezerw'
);
assert.equal(
  ReserveTeamLeagueService.canRecruitPlayerFrom('PL_LECH_POZNAN', 'PL_LEGIA_WARSZAWA_II'),
  true,
  'rezerwy nadal mogą sprzedawać swoich zawodników innym klubom'
);

const financeParent = {
  ...clubs2025.find(club => club.id === 'PL_LEGIA_WARSZAWA')!,
  budget: 10_000_000,
  financeHistory: [],
};
const financeReserve = {
  ...clubs2025.find(club => club.id === 'PL_LEGIA_WARSZAWA_II')!,
  budget: 5_000_000,
  transferBudget: 2_000_000,
  financeHistory: [],
  reserveTeamSeasonGrant: undefined,
  reserveTeamSeasonGrantRate: undefined,
  reserveTeamSeasonGrantYear: undefined,
  reserveTeamEmergencySupportYear: undefined,
};
const clubsAfterReserveFunding = ReserveTeamFinanceService.allocateSeasonFunding(
  [financeParent, financeReserve],
  {
    seasonStartYear: 2025,
    sessionSeed: 12345,
    date: new Date(2025, 6, 1),
    resetReserveBalances: true,
  }
);
const fundedParent = clubsAfterReserveFunding.find(club => club.id === financeParent.id)!;
const fundedReserve = clubsAfterReserveFunding.find(club => club.id === financeReserve.id)!;
assert.ok(
  fundedReserve.budget >= 200_000 && fundedReserve.budget <= 500_000,
  'rezerwy muszą otrzymać losowe 2–5% budżetu pierwszej drużyny'
);
assert.equal(
  fundedParent.budget + fundedReserve.budget,
  financeParent.budget,
  'dotacja dla rezerw musi zostać odjęta od budżetu pierwszej drużyny'
);
assert.equal(fundedReserve.transferBudget, 0, 'rezerwy nie mogą otrzymać budżetu transferowego');
assert.ok(
  fundedParent.financeHistory?.some(log =>
    log.type === 'EXPENSE' &&
    log.amount === -fundedReserve.budget &&
    log.description.includes('Finansowanie drużyny rezerw')
  ),
  'raport finansowy pierwszej drużyny musi pokazać wydatek na rezerwy'
);
const clubsAfterLoadFundingCheck = ReserveTeamFinanceService.ensureSeasonFunding(
  clubsAfterReserveFunding,
  {
    seasonStartYear: 2025,
    sessionSeed: 12345,
    date: new Date(2025, 10, 1),
    resetReserveBalances: true,
  }
);
assert.equal(
  clubsAfterLoadFundingCheck.find(club => club.id === financeParent.id)!.budget,
  fundedParent.budget,
  'LOAD nie może ponownie pobierać dotacji z budżetu pierwszej drużyny'
);

const reserveWithLowBalance = clubsAfterReserveFunding.map(club =>
  club.id === fundedReserve.id ? { ...club, budget: 0 } : club
);
const clubsAfterEmergencySupport = ReserveTeamFinanceService.applyEmergencySupport(
  reserveWithLowBalance,
  new Date(2025, 9, 15)
);
const emergencyParent = clubsAfterEmergencySupport.find(club => club.id === financeParent.id)!;
const emergencyReserve = clubsAfterEmergencySupport.find(club => club.id === financeReserve.id)!;
assert.ok(emergencyReserve.budget > 0, 'znaczny spadek salda rezerw musi uruchomić wsparcie pierwszej drużyny');
assert.ok(
  emergencyParent.financeHistory?.some(log =>
    log.type === 'EXPENSE' && log.description.includes('Awaryjne wsparcie finansowe drużyny rezerw')
  ),
  'awaryjne wsparcie rezerw musi znaleźć się w wydatkach pierwszej drużyny'
);
const clubsAfterRepeatedEmergencyCheck = ReserveTeamFinanceService.applyEmergencySupport(
  clubsAfterEmergencySupport,
  new Date(2025, 9, 16)
);
assert.equal(
  clubsAfterRepeatedEmergencyCheck.find(club => club.id === financeParent.id)!.budget,
  emergencyParent.budget,
  'wsparcie awaryjne może zostać przyznane tylko raz w sezonie'
);
assert.equal(
  ReserveTeamLeagueService.canEnterLeague('PL_SLASK_WROCLAW_II', 'L_PL_2', clubs2025),
  false,
  'rezerwy nie mogą wejść do ligi pierwszej drużyny'
);
assert.equal(
  ReserveTeamLeagueService.canEnterLeague('PL_LKS_II_LODZ', 'L_PL_3', clubs2025),
  true,
  'rezerwy mogą wejść poziom wyżej, jeśli pierwsza drużyna gra w innej lidze'
);
assert.equal(
  ReserveTeamLeagueService.canEnterLeague(
    'PL_LKS_II_LODZ',
    'L_PL_3',
    clubs2025,
    new Map([['PL_LKS_LODZ', 'L_PL_3']])
  ),
  false,
  'rezerwy z 3. ligi nie mogą wejść do 2. ligi zajmowanej przez pierwszy zespół'
);

const oldSavePlayoffResolution = ReserveTeamLeagueService.resolvePlayoffWinner(
  { homeId: 'PL_SLASK_WROCLAW_II', awayId: 'PL_WARTA_POZNAN', winnerId: 'PL_SLASK_WROCLAW_II' },
  'L_PL_2',
  clubs2025
);
assert.equal(
  oldSavePlayoffResolution,
  'PL_WARTA_POZNAN',
  'przy starym zapisie miejsce po nieuprawnionym zwycięzcy barażu przejmuje drugi finalista'
);

const parentDropsToLigaOne = ReserveTeamLeagueService.createLeagueProjection(clubs2026, [
  { clubIds: ['PL_LEGIA_WARSZAWA'], targetLeagueId: 'L_PL_2' },
  { clubIds: ['PL_LEGIA_WARSZAWA_II'], targetLeagueId: 'L_PL_2' },
]);
assert.equal(
  ReserveTeamLeagueService.canEnterLeague(
    'PL_LEGIA_WARSZAWA_II',
    'L_PL_2',
    clubs2026,
    parentDropsToLigaOne
  ),
  false,
  'spadek pierwszej drużyny z Ekstraklasy musi zablokować awans rezerw do 1. Ligi'
);
assert.deepEqual(
  ReserveTeamLeagueService.findSameLeagueConflicts(clubs2026, parentDropsToLigaOne),
  [{ reserveClubId: 'PL_LEGIA_WARSZAWA_II', parentClubId: 'PL_LEGIA_WARSZAWA', leagueId: 'L_PL_2' }]
);

const parentPromotesToEkstraklasa = ReserveTeamLeagueService.createLeagueProjection(clubs2025, [
  { clubIds: ['PL_SLASK_WROCLAW'], targetLeagueId: 'L_PL_1' },
]);
assert.equal(
  ReserveTeamLeagueService.canEnterLeague(
    'PL_SLASK_WROCLAW_II',
    'L_PL_2',
    clubs2025,
    parentPromotesToEkstraklasa
  ),
  true,
  'awans pierwszej drużyny do Ekstraklasy musi pozwolić rezerwom wejść do 1. Ligi'
);
assert.deepEqual(
  ReserveTeamLeagueService.selectPromotionPlaces(
    slaskSecondLeagueTable,
    'L_PL_2',
    clubs2025,
    2,
    4,
    parentPromotesToEkstraklasa
  ).direct.map(candidate => candidate.tablePosition),
  [1, 2],
  'po awansie pierwszej drużyny rezerwy zachowują wywalczone miejsce bezpośredniego awansu'
);

const parentDropsToLigaTwo = ReserveTeamLeagueService.createLeagueProjection(clubs2025, [
  { clubIds: ['PL_LKS_LODZ'], targetLeagueId: 'L_PL_3' },
]);
assert.equal(
  ReserveTeamLeagueService.canEnterLeague(
    'PL_LKS_II_LODZ',
    'L_PL_3',
    clubs2025,
    parentDropsToLigaTwo
  ),
  false,
  'spadek pierwszej drużyny do 2. Ligi musi zablokować awans rezerw do 2. Ligi'
);

const parentPromotesToLigaOne = ReserveTeamLeagueService.createLeagueProjection(clubs2025, [
  { clubIds: ['PL_LKS_LODZ'], targetLeagueId: 'L_PL_2' },
]);
assert.equal(
  ReserveTeamLeagueService.canEnterLeague(
    'PL_LKS_II_LODZ',
    'L_PL_3',
    clubs2025,
    parentPromotesToLigaOne
  ),
  true,
  'awans pierwszej drużyny do 1. Ligi musi pozwolić rezerwom wejść do 2. Ligi'
);

const guaranteedCupClubIds = clubs2025
  .filter(club => ['L_PL_1', 'L_PL_2', 'L_PL_3'].includes(club.leagueId))
  .map(club => club.id);
const cupParticipantsSeedA = PolishCupDrawService.getInitialParticipants(clubs2025, 12345, 2025);
const cupParticipantsSeedARepeat = PolishCupDrawService.getInitialParticipants(clubs2025, 12345, 2025);
const cupParticipantsSeedB = PolishCupDrawService.getInitialParticipants(clubs2025, 98765, 2025);

assert.equal(cupParticipantsSeedA.length, 128, 'Puchar Polski musi rozpoczynać 128 klubów');
assert.equal(new Set(cupParticipantsSeedA).size, 128, 'uczestnicy Pucharu Polski nie mogą się powtarzać');
assert.ok(
  guaranteedCupClubIds.every(clubId => cupParticipantsSeedA.includes(clubId)),
  'wszystkie kluby Ekstraklasy, 1. Ligi i 2. Ligi muszą mieć gwarantowany udział'
);
assert.deepEqual(
  cupParticipantsSeedA,
  cupParticipantsSeedARepeat,
  'to samo ziarno kariery i sezonu musi odtwarzać tę samą pulę po LOAD'
);
assert.notDeepEqual(
  cupParticipantsSeedA.slice(guaranteedCupClubIds.length),
  cupParticipantsSeedB.slice(guaranteedCupClubIds.length),
  'inna kariera powinna losować inny zestaw klubów z L_PL_4'
);

// Existing careers can already contain an odd cup field after the old
// four-group third-league selector returned only 126 initial participants.
// The draw must preserve every real club and express the unmatched club as a
// completed bye instead of writing an undefined team id into the save.
const oddCupParticipants = cupParticipantsSeedA.slice(0, 63);
const oddCupPairs = PolishCupDrawService.drawPairs(
  oddCupParticipants,
  clubs2025,
  new Date(2026, 8, 14),
  'Puchar Polski: 1/32',
  12345
);
const byePairs = oddCupPairs.filter(pair => pair.awayTeamId === POLISH_CUP_BYE_TEAM_ID);
assert.equal(oddCupPairs.length, 32, '63 uczestników musi utworzyć 31 meczów i jeden wolny los');
assert.equal(byePairs.length, 1, 'nieparzysta runda musi zawierać dokładnie jeden wolny los');
assert.equal(byePairs[0].status, MatchStatus.FINISHED, 'wolny los nie może oczekiwać na symulację meczu');
assert.equal(byePairs[0].homeScore, 1, 'wolny los musi jednoznacznie wskazywać awansujący klub');
assert.ok(oddCupParticipants.includes(byePairs[0].homeTeamId), 'wolny los musi należeć do prawdziwego uczestnika rundy');

console.log('PolishLeagueSeasonTests: OK');
