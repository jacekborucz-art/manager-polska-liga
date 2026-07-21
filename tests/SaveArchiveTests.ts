import { strict as assert } from 'node:assert';
import { MailType, MatchHistoryEntry } from '../types';
import { MatchHistoryService } from '../services/MatchHistoryService';
import { SaveArchiveService } from '../services/SaveArchiveService';

const currentSeason = 6;
const currentDate = new Date(2030, 6, 1);

assert.equal(SaveArchiveService.getFirstDetailedSeason(currentSeason), 2);

const baseMail = {
  sender: 'Test',
  role: 'Test',
  subject: 'Test',
  body: 'Test',
  isRead: true,
  type: MailType.SYSTEM,
  priority: 1,
};

const retainedMessages = SaveArchiveService.pruneMessages([
  { ...baseMail, id: 'old-info', date: new Date(2025, 6, 1) },
  { ...baseMail, id: 'recent-info', date: new Date(2026, 6, 1) },
  { ...baseMail, id: 'old-summary', date: new Date(2025, 6, 1), metadata: { type: 'SEASON_SUMMARY', championName: 'A', promotions: [], relegations: [], leagueAwards: [] } },
  { ...baseMail, id: 'old-action', date: new Date(2025, 6, 1), metadata: { type: 'INCOMING_TRANSFER_OFFER', offerId: 'offer' } },
], currentDate);

assert.deepEqual(retainedMessages.map(mail => mail.id), ['recent-info', 'old-summary']);

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
MatchHistoryService.logMatch(match(2));
assert.equal(MatchHistoryService.archiveBeforeSeason(2), 1);

const history = MatchHistoryService.getAll();
assert.equal(history[0].archived, true);
assert.equal(history[0].timeline, undefined);
assert.deepEqual(history[0].goals, []);
assert.equal(history[1].archived, undefined);
assert.equal(history[1].timeline?.length, 1);
assert.ok(JSON.stringify(history[0]).length < JSON.stringify(match(1)).length);

console.log('SaveArchiveTests: OK');
