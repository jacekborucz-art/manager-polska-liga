import { NATIONAL_TEAMS_EUROPE } from '../resources/static_db/NationalTeams/NationalTeamsEurope';
import { EuroQualifiersService } from '../services/EuroQualifiersService';
import { NationalTeam, NTMatchResult } from '../types';

const assert = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const nationalTeams: NationalTeam[] = NATIONAL_TEAMS_EUROPE.map((team, index) => ({
  id: `TEST_NT_${index}`,
  name: team.name,
  continent: team.continent,
  tier: team.tier,
  colorsHex: team.colors,
  stadiumName: team.stadium,
  stadiumCapacity: team.capacity,
  reputation: team.reputation,
  region: team.region,
  coachId: null,
  squadPlayerIds: [],
  tacticId: null,
}));

const state = EuroQualifiersService.createInitialState(nationalTeams, 2028);

assert(state.groups.length === 12, `Oczekiwano 12 grup, otrzymano ${state.groups.length}.`);

state.groups.forEach(group => {
  const fixtures = state.fixtures.filter(fixture => fixture.groupId === group.id && fixture.stage === 'GROUP_STAGE');
  const expectedFixtureCount = group.teams.length * (group.teams.length - 1);
  assert(
    fixtures.length === expectedFixtureCount,
    `Grupa ${group.id}: oczekiwano ${expectedFixtureCount} meczów, otrzymano ${fixtures.length}.`
  );

  const directedPairs = new Set(fixtures.map(fixture => `${fixture.home}__${fixture.away}`));
  assert(
    directedPairs.size === expectedFixtureCount,
    `Grupa ${group.id}: co najmniej jedna para dom/wyjazd została powielona.`
  );

  const fixturesByDate = new Map<string, typeof fixtures>();
  fixtures.forEach(fixture => {
    const key = `${fixture.year}-${fixture.month}-${fixture.day}`;
    fixturesByDate.set(key, [...(fixturesByDate.get(key) ?? []), fixture]);
  });

  fixturesByDate.forEach((dateFixtures, dateKey) => {
    const teamsOnDate = dateFixtures.flatMap(fixture => [fixture.home, fixture.away]);
    assert(
      new Set(teamsOnDate).size === teamsOnDate.length,
      `Grupa ${group.id}: reprezentacja ma dwa mecze w terminie ${dateKey}.`
    );
  });
});

[14, 17].forEach(day => {
  const novemberFixtures = state.fixtures.filter(fixture => fixture.year === 2027 && fixture.month === 10 && fixture.day === day);
  assert(novemberFixtures.length === 24, `${day} listopada: oczekiwano 24 meczów, otrzymano ${novemberFixtures.length}.`);
  const teamsOnDate = novemberFixtures.flatMap(fixture => [fixture.home, fixture.away]);
  assert(
    new Set(teamsOnDate).size === teamsOnDate.length,
    `${day} listopada: reprezentacja została zaplanowana więcej niż raz.`
  );
});

const results: NTMatchResult[] = state.fixtures.map((fixture, index) => ({
  home: fixture.home,
  away: fixture.away,
  homeGoals: index % 4,
  awayGoals: (index + 1) % 3,
  competitionLabel: `Eliminacje EURO 2028 - Grupa ${fixture.groupId}`,
  group: fixture.groupId,
  matchId: `TEST_EUROQ_${index}`,
}));

const legacyMissingFixture = state.fixtures.find(fixture => fixture.year === 2027 && fixture.month === 10 && fixture.day === 17);
assert(legacyMissingFixture, 'Nie znaleziono meczu do testu odzyskiwania starego zapisu.');
const legacyPartialResults = results.filter(result =>
  result.home !== legacyMissingFixture?.home || result.away !== legacyMissingFixture?.away
);
const legacyPartialState = EuroQualifiersService.applyResults(state, legacyPartialResults);
const recoveryMatchDay = EuroQualifiersService.getMatchDayForDate(legacyPartialState, new Date(2027, 10, 18));
assert(
  recoveryMatchDay?.matches.some(match => match.home === legacyMissingFixture?.home && match.away === legacyMissingFixture?.away),
  'Zaległy mecz ze starego zapisu nie został przeniesiony do okna naprawczego.'
);
const legacyRecoveredState = EuroQualifiersService.applyResults(
  legacyPartialState,
  results.filter(result => result.home === legacyMissingFixture?.home && result.away === legacyMissingFixture?.away)
);
assert(legacyRecoveredState.stage === 'PLAYOFFS', 'Po odzyskaniu zaległego meczu eliminacje nie przeszły do baraży.');

const overduePlayoffState = EuroQualifiersService.ensurePlayoffsReady(
  legacyPartialState,
  new Date(2028, 2, 17)
);
if (!overduePlayoffState || overduePlayoffState.stage !== 'PLAYOFFS') {
  throw new Error('Stary zapis po oknie grupowym nie utworzył awaryjnie baraży.');
}
assert(
  overduePlayoffState.playoffPaths.length > 0,
  'Awaryjnie domknięte eliminacje nie mają utworzonych ścieżek barażowych.'
);
const overduePlayoffMatchDay = EuroQualifiersService.getMatchDayForDate(overduePlayoffState, new Date(2028, 2, 17));
assert(
  overduePlayoffMatchDay && overduePlayoffMatchDay.matches.length > 0,
  'Po awaryjnym domknięciu grup 17 marca nie znaleziono meczów barażowych.'
);

const completedGroups = EuroQualifiersService.applyResults(state, results);
assert(completedGroups.stage === 'PLAYOFFS', 'Po komplecie wyników eliminacje nie przeszły do baraży.');
assert(
  completedGroups.groups.every(group => group.standings.every(row => row.played === (group.teams.length - 1) * 2)),
  'Po komplecie wyników nie wszystkie reprezentacje mają pełną liczbę rozegranych meczów.'
);

console.log('EuroQualifiersScheduleTests: OK');
