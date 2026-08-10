import assert from 'node:assert/strict';
import { Club, HealthStatus, Player, PlayerPosition, Region } from '../types';
import { AiContractService } from '../services/AiContractService';
import { AiScoutingService } from '../services/AiScoutingService';

const makeClub = (id: string, name: string, reputation: number, rosterIds: string[] = []): Club => ({
  id,
  name,
  shortName: name,
  country: 'USA',
  leagueId: 'L_OTHER',
  tier: 1,
  reputation,
  budget: 100_000_000,
  transferBudget: 100_000_000,
  rosterIds,
  stats: { form: [] },
} as Club);

const makePendingFreeAgent = (): Player => ({
  id: 'ROBERT_LEWANDOWSKI_TEST',
  firstName: 'Robert',
  lastName: 'Lewandowski',
  age: 37,
  clubId: 'FREE_AGENTS',
  position: PlayerPosition.FWD,
  nationality: Region.POLAND,
  nationalityCountry: 'Polska',
  overallRating: 85,
  reputacja: 19,
  lojalnosc: 70,
  attributes: {
    pace: 78, acceleration: 76, strength: 88, stamina: 75,
    finishing: 89, passing: 75, vision: 76, technique: 82,
    dribbling: 83, crossing: 65, defending: 38, positioning: 82,
    attacking: 85, mentality: 87, workRate: 78, aggression: 63,
    leadership: 83, goalkeeping: 5, reflexes: 5, handling: 5,
    aerial: 85, talent: 78, freeKicks: 80, penalties: 98, corners: 69,
  },
  stats: {
    matchesPlayed: 0, minutesPlayed: 0, goals: 0, assists: 0,
    yellowCards: 0, redCards: 0, cleanSheets: 0,
    seasonalChanges: {}, ratingHistory: [],
  },
  health: { status: HealthStatus.HEALTHY },
  condition: 100,
  fatigueDebt: 0,
  suspensionMatches: 0,
  annualSalary: 0,
  marketValue: 1_800_000,
  contractEndDate: '2026-07-01T00:00:00.000Z',
  transferPendingClubId: 'CHI',
  transferReportDate: '2026-07-07T18:00:00.000Z',
  transferPendingFee: 0,
  transferPendingSalary: 5_000_000,
  transferPendingBonus: 1_000_000,
  transferPendingContractYears: 2,
  interestedClubs: ['OTHER'],
  aiNegotiationClubId: 'OTHER',
  aiNegotiationResponseDate: '2026-07-06T00:00:00.000Z',
  isOnTransferList: true,
  isAvailableForLoan: true,
  history: [
    {
      clubName: 'FC Barcelona', clubId: 'BARCA',
      fromYear: 2025, fromMonth: 7, toYear: 2026, toMonth: 7,
    },
    {
      clubName: 'BEZ KLUBU', clubId: 'FREE_AGENTS',
      fromYear: 2026, fromMonth: 7, toYear: null, toMonth: null,
    },
  ],
} as Player);

const chicago = makeClub('CHI', 'Chicago Fire FC', 8);
const barcelona = makeClub('BARCA', 'FC Barcelona', 20);
const other = makeClub('OTHER', 'Inny klub', 12);
const pending = makePendingFreeAgent();

const beforeDate = AiContractService.resolveAiTransferPending(
  [chicago, barcelona, other],
  { FREE_AGENTS: [pending], CHI: [], BARCA: [], OTHER: [] },
  new Date('2026-07-06T00:00:00.000Z'),
  null
);
const protectedBeforeDate = beforeDate.updatedPlayers.FREE_AGENTS[0];
assert.equal(protectedBeforeDate.transferPendingClubId, 'CHI');
assert.deepEqual(protectedBeforeDate.interestedClubs, []);
assert.equal(protectedBeforeDate.aiNegotiationClubId, undefined);
assert.equal(protectedBeforeDate.isOnTransferList, false);
assert.equal(protectedBeforeDate.isAvailableForLoan, false);

const resolved = AiContractService.resolveAiTransferPending(
  beforeDate.updatedClubs,
  beforeDate.updatedPlayers,
  new Date('2026-07-08T00:00:00.000Z'),
  null
);

assert.equal(resolved.updatedPlayers.FREE_AGENTS.length, 0);
assert.equal(resolved.updatedPlayers.CHI.length, 1);
const signed = resolved.updatedPlayers.CHI[0];
assert.equal(signed.id, pending.id);
assert.equal(signed.clubId, 'CHI');
assert.equal(signed.transferPendingClubId, undefined);
assert.equal(signed.transferReportDate, undefined);
assert.deepEqual(signed.interestedClubs, []);
assert.equal(signed.annualSalary, 5_000_000);
assert.equal(signed.history.at(-1)?.clubId, 'CHI');
assert.equal(signed.history.at(-2)?.clubId, 'FREE_AGENTS');
assert.equal(signed.history.at(-2)?.toYear, 2026);
assert.ok(resolved.updatedClubs.find(club => club.id === 'CHI')?.rosterIds.includes(pending.id));
assert.equal(resolved.logEntries.filter(entry => entry.status === 'TRANSFER_SIGNED').length, 1);

const secondPass = AiContractService.resolveAiTransferPending(
  resolved.updatedClubs,
  resolved.updatedPlayers,
  new Date('2026-07-09T00:00:00.000Z'),
  null
);
assert.equal(secondPass.logEntries.length, 0);
assert.equal(secondPass.updatedPlayers.CHI.filter(player => player.id === pending.id).length, 1);

const scoutingResult = AiScoutingService.updateTransferInterests(
  [other],
  { FREE_AGENTS: [makePendingFreeAgent()], OTHER: [] },
  new Date('2026-07-01T00:00:00.000Z'),
  null,
  12345
);
assert.deepEqual(scoutingResult.FREE_AGENTS[0].interestedClubs, []);

const recruitmentResult = AiContractService.processAiRecruitment(
  [other],
  { FREE_AGENTS: [makePendingFreeAgent()], OTHER: [] },
  new Date('2026-07-02T00:00:00.000Z'),
  null
);
assert.equal(recruitmentResult.updatedPlayers.FREE_AGENTS[0].aiNegotiationClubId, undefined);
assert.equal(recruitmentResult.updatedPlayers.FREE_AGENTS[0].transferPendingClubId, 'CHI');

console.log('PendingFreeAgentTransferTests: OK');
