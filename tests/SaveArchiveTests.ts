import { strict as assert } from 'node:assert';
import { MailType, MatchHistoryEntry } from '../types';
import { MatchHistoryService } from '../services/MatchHistoryService';
import { SaveArchiveService } from '../services/SaveArchiveService';
import { getSaveFileName, SaveState, serializeSaveState } from '../services/SaveGameService';

assert.equal(SaveArchiveService.shouldArchiveAfterSeason(4), false);
assert.equal(SaveArchiveService.shouldArchiveAfterSeason(5), true);
assert.equal(SaveArchiveService.shouldArchiveAfterSeason(6), false);
assert.equal(SaveArchiveService.shouldArchiveAfterSeason(10), true);

const archiveCutoff = new Date(2030, 6, 1);

const baseMail = {
  sender: 'Test',
  role: 'Test',
  subject: 'Test',
  body: 'Test',
  isRead: true,
  type: MailType.SYSTEM,
  priority: 1,
};

const retainedMessages = SaveArchiveService.archiveMessagesBefore([
  { ...baseMail, id: 'old-info', date: new Date(2025, 6, 1) },
  { ...baseMail, id: 'recent-info', date: new Date(2030, 6, 1) },
  { ...baseMail, id: 'old-summary', date: new Date(2025, 6, 1), metadata: { type: 'SEASON_SUMMARY', championName: 'A', promotions: [], relegations: [], leagueAwards: [] } },
  { ...baseMail, id: 'old-action', date: new Date(2025, 6, 1), metadata: { type: 'INCOMING_TRANSFER_OFFER', offerId: 'offer' } },
], archiveCutoff);

assert.deepEqual(retainedMessages.map(mail => mail.id), ['recent-info', 'old-summary']);

const retainedReserveResults = SaveArchiveService.archiveReserveResultsBefore([
  { season: 5 } as any,
  { season: 6 } as any,
], 6);
assert.deepEqual(retainedReserveResults.map(result => result.season), [6]);

const retainedFriendlyPairs = SaveArchiveService.archiveAiFriendlyPairsBefore([
  { date: new Date(2029, 6, 1) } as any,
  { date: new Date(2030, 6, 1) } as any,
], archiveCutoff);
assert.equal(retainedFriendlyPairs.length, 1);

const fullSave = {
  messages: [{ id: 'old-message' }, { id: 'new-message' }],
  reserveMatchResults: [{ season: 1 }, { season: 6 }],
  matchHistory: [{ matchId: 'old-detailed-match', timeline: [{ minute: 1 }] }],
  aiFriendlyPairs: [{ id: 'old-friendly' }],
  aiFriendlyReports: [{ id: 'old-friendly-report' }],
} as unknown as SaveState;
const serializedFullSave = JSON.parse(serializeSaveState(fullSave, new Date('2030-07-01T00:00:00.000Z')));
assert.equal(serializedFullSave.messages.length, 2);
assert.equal(serializedFullSave.reserveMatchResults.length, 2);
assert.equal(serializedFullSave.matchHistory[0].timeline.length, 1);
assert.equal(serializedFullSave.aiFriendlyPairs.length, 1);
assert.equal(serializedFullSave.aiFriendlyReports.length, 1);
assert.equal(getSaveFileName(new Date('2030-07-01T00:00:00.000Z')), 'futbol_manager_2030-07-01.json');

const match = (season: number): MatchHistoryEntry => ({
  matchId: `match-${season}`,
  date: `${2024 + season}-08-01`,
  season,
  competition: 'L_PL_1',
  homeTeamId: 'home',
  awayTeamId: 'away',
  homeScore: 2,
  awayScore: 1,
  goals: [{ playerId: 'p1', playerName: 'Gracz', minute: 10, teamId: 'home', isPenalty: false }],
  cards: [],
  timeline: [{ minute: 10, teamSide: 'HOME', type: 'GOAL' as any, text: 'Gol' }],
  ratings: { p1: 8.2 },
});

MatchHistoryService.clear();
MatchHistoryService.logMatch(match(1));
MatchHistoryService.logMatch(match(5));
MatchHistoryService.logMatch(match(6));
assert.equal(MatchHistoryService.archiveBeforeSeason(6), 2);

const history = MatchHistoryService.getAll();
assert.equal(history[0].archived, true);
assert.equal(history[0].timeline, undefined);
assert.deepEqual(history[0].goals, []);
assert.equal(history[1].archived, true);
assert.equal(history[2].archived, undefined);
assert.equal(history[2].timeline?.length, 1);
assert.ok(JSON.stringify(history[0]).length < JSON.stringify(match(1)).length);

console.log('SaveArchiveTests: OK');
