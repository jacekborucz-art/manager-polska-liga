import assert from 'node:assert/strict';
import { CompetitionType, MatchStatus, type Club, type MatchContext } from '../types';
import { CupMatchEngineV2, CupSampleMatchFactory } from '../services/match/engines/cupV2';
import { CupShadowSimulationService } from '../services/match/adapters/cupV2';

const makeClub = (id: string, name: string, reputation: number, stadiumCapacity: number, morale: number): Club => ({
  id,
  name,
  shortName: name.split(' ')[0],
  leagueId: 'POLISH_CUP_TEST',
  tier: 1,
  colorsHex: ['#111827', '#f8fafc'],
  stadiumName: `${name} Arena`,
  stadiumCapacity,
  reputation,
  country: 'POL',
  isDefaultActive: false,
  rosterIds: [],
  stats: {} as Club['stats'],
  budget: 0,
  transferBudget: 0,
  boardStrictness: 5,
  signingBonusPool: 0,
  morale,
}) as Club;

const sample = CupSampleMatchFactory.makeInput(11, 'EQUAL');

const ctx: MatchContext = {
  fixture: {
    id: 'PP_TEST_LIVE_MATCH',
    leagueId: CompetitionType.POLISH_CUP,
    homeTeamId: sample.home.clubId,
    awayTeamId: sample.away.clubId,
    date: new Date('2026-09-24T18:00:00'),
    status: MatchStatus.SCHEDULED,
    homeScore: null,
    awayScore: null,
    attendance: 6800,
  },
  homeClub: makeClub(sample.home.clubId, 'Olimpia Testowa', 55, 9000, 60),
  awayClub: makeClub(sample.away.clubId, 'Raków Testowy', 55, 18000, 60),
  homePlayers: sample.home.players,
  awayPlayers: sample.away.players,
  homeAdvantage: true,
  competition: CompetitionType.POLISH_CUP,
};

const handle = CupShadowSimulationService.createLiveMatch(ctx, {
  homeLineup: sample.home.lineup,
  awayLineup: sample.away.lineup,
  homeInstructions: sample.home.instructions,
  awayInstructions: sample.away.instructions,
  userSide: 'HOME',
  manualSubstitutionSide: 'HOME',
  seedSuffix: 'live_match_test',
});

// 1) Nie liczy meczu z góry: po starcie (minuta 0) nie ma żadnych zdarzeń poza kickoffem.
const kickoffReport = CupShadowSimulationService.tickLiveMatch(handle, 0);
assert.equal(kickoffReport.result.finalState.second, 0);
assert.equal(kickoffReport.result.events.length, 0, 'Na minucie 0 mecz nie powinien mieć żadnych zdarzeń zasymulowanych z góry');
assert.equal(kickoffReport.result.winner, undefined, 'Zwycięzca nie może być znany na starcie');

// 2) Dolicz do 20. minuty i zapamiętaj zdarzenia sprzed tego punktu.
const reportAt20 = CupShadowSimulationService.tickLiveMatch(handle, 20 * 60);
assert.equal(reportAt20.result.finalState.second, 20 * 60);
const eventsBefore20 = [...reportAt20.result.events];

// 3) Zmień taktykę w trakcie (mutacja input.home.instructions) — to powinno wpłynąć
// tylko na przyszłość, nie na to, co już się wydarzyło.
handle.live.input.home.instructions = { ...handle.live.input.home.instructions, tempo: 'FAST', mindset: 'OFFENSIVE' };

// 4) Ręczna zmiana zawodnika w trakcie meczu.
const startingPlayerId = handle.live.input.home.lineup.startingXI.find((id): id is string => Boolean(id))!;
const benchPlayerId = handle.live.input.home.lineup.bench[0];
assert.ok(startingPlayerId, 'Test wymaga zawodnika w składzie startowym');
assert.ok(benchPlayerId, 'Test wymaga zawodnika na ławce');
const substitutionApplied = CupMatchEngineV2.applyManualSubstitution(handle.live, 'HOME', startingPlayerId, benchPlayerId);
assert.equal(substitutionApplied, true, 'Zmiana powinna się udać dla zawodnika ze składu i z ławki');
assert.ok(!handle.live.input.home.lineup.startingXI.includes(startingPlayerId), 'Schodzący zawodnik nie może zostać w składzie');
assert.ok(handle.live.input.home.lineup.startingXI.includes(benchPlayerId), 'Wchodzący zawodnik musi trafić do składu');

// 4b) Zawodnik, który już zszedł z boiska, nie może wrócić — nawet jeśli jest teraz
// na "ławce" (bo tam trafia po zejściu). To jest dokładnie zgłoszony błąd.
assert.ok(handle.live.input.home.lineup.bench.includes(startingPlayerId), 'Schodzący zawodnik trafia na ławkę (techniczne miejsce), ale to nie znaczy, że może wrócić');
const secondPlayerToBringOn = handle.live.input.home.lineup.bench.find(id => id !== startingPlayerId);
assert.ok(secondPlayerToBringOn, 'Test wymaga drugiego dostępnego zawodnika na ławce');
const illegalReturnAttempt = CupMatchEngineV2.applyManualSubstitution(handle.live, 'HOME', secondPlayerToBringOn!, startingPlayerId);
assert.equal(illegalReturnAttempt, false, 'Zawodnik, który już zszedł z boiska, nie może zostać wprowadzony ponownie');
assert.ok(!handle.live.input.home.lineup.startingXI.includes(startingPlayerId), 'Zablokowana próba nie może jednak wpuścić go na boisko');

// 4c) Zawodnik z czerwoną kartką jest zamrożony — nie można wprowadzić za niego rezerwowego.
const redCardedPlayerId = handle.live.input.home.lineup.startingXI.find((id): id is string => Boolean(id))!;
assert.ok(redCardedPlayerId, 'Test wymaga zawodnika w składzie do oznaczenia czerwoną kartką');
handle.live.state.redCards[redCardedPlayerId] = true;
const remainingBenchPlayerId = handle.live.input.home.lineup.bench.find(id => id !== startingPlayerId)!;
assert.ok(remainingBenchPlayerId, 'Test wymaga wolnego zawodnika na ławce');
const substitutionForRedCardAttempt = CupMatchEngineV2.applyManualSubstitution(handle.live, 'HOME', redCardedPlayerId, remainingBenchPlayerId);
assert.equal(substitutionForRedCardAttempt, false, 'Nie można wprowadzić zmiany za zawodnika z czerwoną kartką');
assert.ok(handle.live.input.home.lineup.startingXI.includes(redCardedPlayerId), 'Zawodnik z czerwoną kartką zostaje na swoim miejscu w składzie (drużyna gra w osłabieniu)');

// 5) Dolicz dalej do 40. minuty.
const reportAt40 = CupShadowSimulationService.tickLiveMatch(handle, 40 * 60);
assert.equal(reportAt40.result.finalState.second, 40 * 60);

// Kluczowy test: zdarzenia sprzed zmiany (< 20. minuty) muszą być identyczne co do liczby i treści —
// zmiana taktyki/zawodnika w 20. minucie NIE MOŻE przepisać przeszłości.
const eventsBefore20AfterFurtherSim = reportAt40.result.events.filter(event => event.second < 20 * 60);
assert.equal(
  eventsBefore20AfterFurtherSim.length,
  eventsBefore20.filter(event => event.second < 20 * 60).length,
  'Liczba zdarzeń sprzed zmiany nie może się zmienić po zmianie taktyki/zawodnika',
);
eventsBefore20.filter(event => event.second < 20 * 60).forEach((event, index) => {
  assert.equal(eventsBefore20AfterFurtherSim[index]?.id, event.id, `Zdarzenie #${index} sprzed zmiany musi zostać identyczne (id: ${event.id})`);
});

// Manualna zmiana zawodnika musi być widoczna jako zdarzenie ZMIANY w logu.
const manualSubEvent = reportAt40.result.events.find(event => event.id.startsWith('cupv2_manual_substitution_'));
assert.ok(manualSubEvent, 'Ręczna zmiana zawodnika musi wygenerować zdarzenie w logu meczu');

// 6) Dolicz mecz do końca (z dużym marginesem na dogrywkę/karne) i sprawdź, że kończy się poprawnie.
let finalResult = null as ReturnType<typeof CupMatchEngineV2.advanceLiveMatch>;
let guard = 0;
while (!finalResult && guard < 400) {
  finalResult = CupMatchEngineV2.advanceLiveMatch(handle.live, handle.live.state.second + 30);
  guard += 1;
}
assert.ok(finalResult, 'Mecz musi się kiedyś zakończyć (winner ustalony albo karne)');
assert.ok(finalResult!.winner === 'HOME' || finalResult!.winner === 'AWAY', 'Mecz pucharowy musi mieć zwycięzcę');
assert.ok(Object.keys(finalResult!.playerStats.HOME).length > 0, 'Statystyki graczy HOME muszą być policzone na koniec');
assert.ok(Object.keys(finalResult!.playerStats.AWAY).length > 0, 'Statystyki graczy AWAY muszą być policzone na koniec');

console.log('CupV2LiveMatchTests: OK', {
  finalScore: `${finalResult!.homeScore}:${finalResult!.awayScore}`,
  winner: finalResult!.winner,
  decidedByPenalties: finalResult!.decidedByPenalties,
  totalEvents: finalResult!.events.length,
});
