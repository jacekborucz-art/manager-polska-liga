import { strict as assert } from 'node:assert';
import {
  BackgroundMatchProcessorPolishCup,
  getPolishCupCoachMatchProfile,
} from '../services/BackgroundMatchProcessorPolishCup';
import { MatchHistoryService } from '../services/MatchHistoryService';
import { TacticRepository } from '../resources/tactics_db';
import {
  Club,
  Coach,
  CompetitionType,
  Fixture,
  HealthStatus,
  InjurySeverity,
  MatchStatus,
  Player,
  PlayerPosition,
} from '../types';

const makePlayer = (clubId: string, id: string, position: PlayerPosition, level: number): Player => ({
  id,
  clubId,
  firstName: 'Test',
  lastName: id,
  position,
  overallRating: level,
  condition: 100,
  morale: 75,
  suspensionMatches: 0,
  cupSuspensionMatches: 0,
  euroSuspensionMatches: 0,
  health: { status: HealthStatus.HEALTHY },
  stats: { matchesPlayed: 0, minutesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, seasonalChanges: {}, ratingHistory: [] },
  attributes: {
    strength: level,
    stamina: level,
    pace: level,
    acceleration: level,
    defending: level,
    passing: level,
    attacking: level,
    finishing: level,
    technique: level,
    vision: level,
    dribbling: level,
    heading: level,
    positioning: level,
    goalkeeping: level,
    freeKicks: level,
    talent: level,
    penalties: level,
    corners: level,
    aggression: level,
    crossing: level,
    leadership: level,
    mentality: level,
    workRate: level,
  },
} as Player);

const makeCoach = (id: string, clubId: string, quality: number, tactics: Coach['favoriteTactics']): Coach => ({
  id,
  firstName: 'Coach',
  lastName: id,
  age: 48,
  nationality: 'Polska',
  nationalityFlag: 'PL',
  currentClubId: clubId,
  hiredDate: '2025-07-01',
  contractEndDate: '2027-06-30',
  annualSalary: 1,
  expPoints: 100,
  blacklist: {},
  attributes: { experience: quality, decisionMaking: quality, motivation: quality, training: quality },
  favoriteTactics: tactics,
  history: [],
  seasonStats: [],
});

const homeClub = {
  id: 'POLISH_CUP_HOME',
  name: 'Pucharowi Gospodarze',
  coachId: 'POLISH_CUP_HOME_COACH',
  leagueId: 'L_PL_1',
  reputation: 10,
  stadiumName: 'Stadion Testowy',
  stadiumCapacity: 20_000,
  stats: {},
} as Club;
const awayClub = {
  id: 'POLISH_CUP_AWAY',
  name: 'Pucharowi Goście',
  coachId: 'POLISH_CUP_AWAY_COACH',
  leagueId: 'L_PL_2',
  reputation: 5,
  stadiumName: 'Stadion Gości',
  stadiumCapacity: 10_000,
  stats: {},
} as Club;

const homeCoach = makeCoach(homeClub.coachId!, homeClub.id, 90, {
  offensive: '4-3-3 Atak',
  neutral: '4-2-3-1',
  defensive: '5-4-1',
});
const awayCoach = makeCoach(awayClub.coachId!, awayClub.id, 70, {
  offensive: '4-3-3 Atak',
  neutral: '4-4-2',
  defensive: '5-4-1',
});
const coaches = { [homeCoach.id]: homeCoach, [awayCoach.id]: awayCoach };

const homePlayers: Player[] = [
  makePlayer(homeClub.id, 'home_gk_1', PlayerPosition.GK, 82),
  makePlayer(homeClub.id, 'home_gk_2', PlayerPosition.GK, 76),
  ...Array.from({ length: 4 }, (_, index) => makePlayer(homeClub.id, `home_def_${index}`, PlayerPosition.DEF, 80 - index)),
  ...Array.from({ length: 6 }, (_, index) => makePlayer(homeClub.id, `home_mid_${index}`, PlayerPosition.MID, 81 - index)),
  makePlayer(homeClub.id, 'home_fwd_fit', PlayerPosition.FWD, 80),
  { ...makePlayer(homeClub.id, 'home_fwd_cup_suspended', PlayerPosition.FWD, 90), cupSuspensionMatches: 1 },
  {
    ...makePlayer(homeClub.id, 'home_fwd_injured', PlayerPosition.FWD, 90),
    health: {
      status: HealthStatus.INJURED,
      injury: {
        type: 'Test injury',
        daysRemaining: 20,
        totalDays: 20,
        injuryDate: '2025-08-01',
        severity: InjurySeverity.SEVERE,
      },
    },
  },
  { ...makePlayer(homeClub.id, 'home_fwd_unfit', PlayerPosition.FWD, 90), condition: 40 },
];
const awayPlayers: Player[] = [
  makePlayer(awayClub.id, 'away_gk_1', PlayerPosition.GK, 72),
  makePlayer(awayClub.id, 'away_gk_2', PlayerPosition.GK, 68),
  ...Array.from({ length: 6 }, (_, index) => makePlayer(awayClub.id, `away_def_${index}`, PlayerPosition.DEF, 70 - index)),
  ...Array.from({ length: 6 }, (_, index) => makePlayer(awayClub.id, `away_mid_${index}`, PlayerPosition.MID, 70 - index)),
  ...Array.from({ length: 2 }, (_, index) => makePlayer(awayClub.id, `away_fwd_${index}`, PlayerPosition.FWD, 70 - index)),
];
const fixture: Fixture = {
  id: 'POLISH_CUP_AI_COACH_TEST',
  leagueId: CompetitionType.POLISH_CUP,
  homeTeamId: homeClub.id,
  awayTeamId: awayClub.id,
  date: new Date(2025, 7, 10),
  status: MatchStatus.SCHEDULED,
  homeScore: null,
  awayScore: null,
};

MatchHistoryService.clear();
const result = BackgroundMatchProcessorPolishCup.processCupEvent(
  new Date(fixture.date),
  null,
  [fixture],
  [homeClub, awayClub],
  { [homeClub.id]: homePlayers, [awayClub.id]: awayPlayers },
  {},
  123456,
  1,
  coaches
);

const homeLineup = result.updatedLineups[homeClub.id];
assert.ok(homeLineup, 'trener gospodarzy musi przygotować skład na mecz pucharowy');
assert.equal(homeLineup.tacticId, '4-2-3-1', 'brak dostępnych napastników musi odrzucić ulubione 4-3-3 i wybrać wykonalne 4-2-3-1');
assert.equal(homeLineup.startingXI.filter(Boolean).length, 11, 'trener musi wystawić pełną jedenastkę');
assert.equal(homeLineup.startingXI.includes('home_fwd_cup_suspended'), false, 'zawieszenie pucharowe musi wykluczyć zawodnika');
assert.equal(homeLineup.startingXI.includes('home_fwd_injured'), false, 'poważna kontuzja musi wykluczyć zawodnika');
assert.equal(homeLineup.startingXI.includes('home_fwd_unfit'), false, 'zbyt niska kondycja musi wykluczyć zawodnika');

const tactic = TacticRepository.getById(homeLineup.tacticId);
homeLineup.startingXI.forEach((playerId, slotIndex) => {
  const player = homePlayers.find(candidate => candidate.id === playerId);
  assert.ok(player, `slot ${slotIndex} musi zawierać zawodnika gospodarzy`);
  assert.equal(player?.position, tactic.slots[slotIndex].role, `slot ${slotIndex} musi być obsadzony naturalną pozycją`);
});

const report = MatchHistoryService.getAll().find(entry => entry.matchId === fixture.id);
assert.ok(report, 'mecz Pucharu Polski w tle musi utworzyć raport');
assert.equal(report?.homeStartingTacticId, '4-2-3-1', 'raport musi zapisać rzeczywistą formację startową trenera');
assert.equal(report?.homeTacticId, '4-2-3-1', 'raport nie może wrócić do domyślnego 4-4-2');

const eliteProfile = getPolishCupCoachMatchProfile(homeCoach);
const weakProfile = getPolishCupCoachMatchProfile(makeCoach('WEAK_COACH', 'WEAK_CLUB', 10, homeCoach.favoriteTactics));
assert.ok(eliteProfile.attackingMultiplier > weakProfile.attackingMultiplier, 'motywacja i trening lepszego trenera muszą wzmacniać organizację ataku');
assert.ok(eliteProfile.defensiveMultiplier > weakProfile.defensiveMultiplier, 'decyzje i doświadczenie lepszego trenera muszą wzmacniać organizację obrony');
assert.ok(eliteProfile.penaltyAdjustment > weakProfile.penaltyAdjustment, 'trener musi wpływać także na przygotowanie serii rzutów karnych');

console.log('PolishCupAiCoachPreparationTests: OK');
