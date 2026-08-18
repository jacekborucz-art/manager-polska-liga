import { TransferScoutingService } from '../services/TransferScoutingService';
import {
  TransferPlayerDecisionService,
  getContextualPrestigeAssessment,
  getScoutAdjustedAcceptanceChanceCap,
  getScoutNegotiationPower,
  getScoutTalkOpeningChance,
} from '../services/TransferPlayerDecisionService';
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
assert(pool.every(scout => scout.retirementEligibleAge >= 58 && scout.retirementEligibleAge <= 66), 'Każdy skaut powinien mieć indywidualnie losowany próg emerytalny.');
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
  reputation: 1,
  regionalSpecialty: undefined,
};
const strongScout: TransferScout = {
  ...pool[1],
  id: 'TRANSFER_SCOUT_STRONG',
  judgment: 19,
  reach: 19,
  speed: 19,
  experience: 19,
  reputation: 5,
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

const retirementPool = pool.map((scout, index) => ({
  ...scout,
  age: 80,
  retirementEligibleAge: 58,
  isOnAssignment: index === 0,
}));
const annualCareerResult = TransferScoutingService.processAnnualScoutCareers(retirementPool, 2035);
assert(annualCareerResult.retiredScouts.length > 0, 'Coroczne losowanie powinno pozwalać skautom kończyć karierę.');
assert(annualCareerResult.scouts.length === 48, 'Każdy emerytowany skaut powinien zostać zastąpiony nowym kandydatem.');
assert(!annualCareerResult.retiredScouts.some(scout => scout.id === retirementPool[0].id), 'Skaut będący na aktywnym zadaniu nie może przejść na emeryturę przed zakończeniem pracy.');

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
assert(report.scoutInfluence?.reputation === 5, 'Raport powinien zachować reputację skauta potrzebną do późniejszych negocjacji.');
assert(report.scoutInfluence?.experience === 19, 'Raport powinien zachować doświadczenie skauta również po jego odejściu z klubu.');
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

const weakInfluence = {
  reputation: weakScout.reputation,
  judgment: weakScout.judgment,
  reach: weakScout.reach,
  speed: weakScout.speed,
  experience: weakScout.experience,
};
const eliteInfluence = {
  reputation: strongScout.reputation,
  judgment: 20,
  reach: 20,
  speed: 20,
  experience: 20,
};
assert(
  getScoutNegotiationPower(eliteInfluence) > getScoutNegotiationPower(weakInfluence),
  'Reputacja i doświadczenie elitarnego skauta powinny dawać wyraźnie większą siłę negocjacyjną.'
);

const renownedPlayer = {
  ...candidates[0],
  id: 'RENOWNED_PLAYER',
  clubId: 'TOP_MARKET_CLUB',
  nationality: Region.ENGLAND,
  overallRating: 84,
  reputacja: 86,
} as Player;
const elitePlayerOutsideTopMarkets = {
  ...renownedPlayer,
  id: 'ELITE_OUTSIDE_TOP_MARKETS',
  nationality: Region.BRAZIL,
  overallRating: 90,
  reputacja: 92,
} as Player;
const topMarketClub = {
  id: 'TOP_MARKET_CLUB',
  name: 'Klub angielski',
  country: 'ENG',
  reputation: 18,
} as Club;
const nonTopMarketClub = {
  ...topMarketClub,
  id: 'NON_TOP_MARKET_CLUB',
  country: 'BRA',
} as Club;
const polishFirstLeagueClub = { ...userClub, leagueId: 'L_PL_2', reputation: 7 } as Club;
const polishSecondLeagueClub = { ...userClub, leagueId: 'L_PL_3', reputation: 5 } as Club;

const eliteGeneralTalkChance = getScoutTalkOpeningChance(
  elitePlayerOutsideTopMarkets,
  nonTopMarketClub,
  polishFirstLeagueClub,
  eliteInfluence,
);
assert(eliteGeneralTalkChance >= 0.10, 'Elitarny skaut powinien mieć odczuwalną szansę przełamania odmowy klasowego zawodnika poza topowymi rynkami.');
assert(
  eliteGeneralTalkChance > getScoutTalkOpeningChance(elitePlayerOutsideTopMarkets, nonTopMarketClub, polishFirstLeagueClub, weakInfluence),
  'Słaby skaut nie może przekonywać klasowych zawodników równie skutecznie jak elitarny.'
);

const firstLeagueTopMarketCap = getScoutAdjustedAcceptanceChanceCap(
  renownedPlayer,
  topMarketClub,
  polishFirstLeagueClub,
  eliteInfluence,
);
const secondLeagueTopMarketCap = getScoutAdjustedAcceptanceChanceCap(
  renownedPlayer,
  topMarketClub,
  polishSecondLeagueClub,
  eliteInfluence,
);
assert(firstLeagueTopMarketCap <= 0.035, 'Renomowany zawodnik z topowego rynku powinien bardzo rzadko trafiać do polskiej 1. Ligi.');
assert(secondLeagueTopMarketCap < firstLeagueTopMarketCap, 'Im niższa polska liga, tym niższy musi być limit szansy na prestiżowy transfer.');
assert(secondLeagueTopMarketCap > 0, 'Nawet w niższej polskiej lidze musi pozostać minimalne RNG na wyjątkowy transfer.');

const globalIcon = {
  ...renownedPlayer,
  id: 'GLOBAL_FOOTBALL_ICON',
  age: 36,
  overallRating: 88,
  reputacja: 99,
  isOnTransferList: true,
} as Player;
(['L_PL_1', 'L_PL_2', 'L_PL_3', 'L_PL_4'] as const).forEach(leagueId => {
  const polishClub = { ...userClub, leagueId } as Club;
  const iconTransferCap = getScoutAdjustedAcceptanceChanceCap(
    globalIcon,
    nonTopMarketClub,
    polishClub,
    eliteInfluence,
  );
  const iconTalkChance = getScoutTalkOpeningChance(
    globalIcon,
    nonTopMarketClub,
    polishClub,
    eliteInfluence,
  );
  assert(iconTransferCap === 0.000001, 'Globalna ikona futbolu może trafić do polskiej ligi najwyżej raz na milion prób.');
  assert(iconTalkChance <= 0.000001, 'Skaut nie może obejść limitu raz na milion przy rozmowach z globalną ikoną.');
});

const elitePolishClubReputations = [17, 18, 19, 20] as const;
const expectedGlobalIconCaps = [0.0005, 0.0025, 0.01, 0.03] as const;
const progressiveIconCaps = elitePolishClubReputations.map(reputation => getScoutAdjustedAcceptanceChanceCap(
  globalIcon,
  nonTopMarketClub,
  { ...userClub, leagueId: 'L_PL_1', reputation } as Club,
  eliteInfluence,
));
progressiveIconCaps.forEach((chance, index) => {
  assert(chance === expectedGlobalIconCaps[index], 'Szansa na globalną ikonę musi rosnąć progresywnie wraz z reputacją polskiego klubu 17–20.');
  if (index > 0) {
    assert(chance > progressiveIconCaps[index - 1], 'Każdy kolejny punkt elitarnej reputacji klubu musi zwiększać małe RNG transferowe.');
  }
});

const regularStarCaps = elitePolishClubReputations.map(reputation => getScoutAdjustedAcceptanceChanceCap(
  renownedPlayer,
  topMarketClub,
  { ...userClub, leagueId: 'L_PL_1', reputation } as Club,
  eliteInfluence,
));
assert(regularStarCaps[3] > regularStarCaps[0], 'Polski klub o reputacji 20 powinien mieć wyraźnie większą szansę na zwykłą gwiazdę niż klub o reputacji 17.');

const domesticLeagueStar = {
  ...renownedPlayer,
  id: 'DOMESTIC_LEAGUE_STAR',
  clubId: 'WARTA_LIKE_CLUB',
  nationality: Region.IBERIA,
  overallRating: 81,
  reputacja: 82,
} as Player;
const wartaLikeClub = {
  id: 'WARTA_LIKE_CLUB',
  name: 'Klub z 1. Ligi',
  country: 'POL',
  leagueId: 'L_PL_2',
  reputation: 4,
} as Club;
const wislaLikeClub = {
  id: 'WISLA_LIKE_CLUB',
  name: 'Klub z Ekstraklasy',
  country: 'POL',
  leagueId: 'L_PL_1',
  reputation: 6,
} as Club;
const domesticUpgradeAssessment = getContextualPrestigeAssessment(
  domesticLeagueStar,
  wartaLikeClub,
  wislaLikeClub,
);
assert(!domesticUpgradeAssessment.blocksNegotiation, 'Zawodnik grający już w Polsce nie może odrzucać rozmów z klubem z wyższej ligi jako zbyt słabym kierunkiem.');
assert(domesticUpgradeAssessment.band === 'NATURAL', 'Przejście do wyższej polskiej ligi i klubu o lepszej reputacji powinno być traktowane jako naturalny awans sportowy.');
assert(domesticUpgradeAssessment.chanceCap >= 0.90, 'Wyraźny krajowy awans sportowy powinien dawać wysoką, ale nie gwarantowaną szansę na porozumienie.');
assert(
  getScoutAdjustedAcceptanceChanceCap(domesticLeagueStar, wartaLikeClub, wislaLikeClub) >= 0.90,
  'Końcowy limit akceptacji nie może ponownie blokować krajowego awansu sportowego.'
);
assert(
  TransferPlayerDecisionService.buildNegotiationPlan(
    domesticLeagueStar,
    wartaLikeClub,
    wislaLikeClub,
    [domesticLeagueStar],
    [],
    currentDate,
  ).willingToTalk,
  'Przy krajowym awansie sportowym zawodnik powinien przedstawić warunki kontraktu zamiast natychmiast odmawiać rozmów.'
);

const entryFromPortugalAssessment = getContextualPrestigeAssessment(
  domesticLeagueStar,
  { ...topMarketClub, id: 'PORTUGUESE_CLUB', country: 'POR' } as Club,
  wislaLikeClub,
);
assert(entryFromPortugalAssessment.band !== 'NATURAL', 'Wyjątek dla krajowego awansu nie może ułatwiać pierwszego transferu klasowego zawodnika z zagranicy do Polski.');

const domesticDowngradeAssessment = getContextualPrestigeAssessment(
  domesticLeagueStar,
  wislaLikeClub,
  wartaLikeClub,
);
assert(domesticDowngradeAssessment.band !== 'NATURAL', 'Przejście do niższej polskiej ligi i słabszego klubu nadal powinno podlegać normalnemu filtrowi prestiżu.');

console.log('TransferScoutingTests: OK');
