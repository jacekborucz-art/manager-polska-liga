import { strict as assert } from 'node:assert';
import { performance } from 'node:perf_hooks';
import { HealthStatus, Player, PlayerPosition, Region } from '../types';
import { IncomingTransferService } from '../services/IncomingTransferService';

const makePlayer = (id: string, position: PlayerPosition, overallRating: number): Player => ({
  id,
  firstName: 'Test',
  lastName: id,
  age: 19 + (overallRating % 15),
  clubId: 'BUYER',
  nationality: Region.POLAND,
  position,
  overallRating,
  attributes: {
    strength: 60, stamina: 60, pace: 60, defending: 60, passing: 60, attacking: 60,
    finishing: 60, technique: 60, vision: 60, dribbling: 60, heading: 60, positioning: 60,
    goalkeeping: 10, freeKicks: 50, talent: 70, penalties: 50, corners: 50, aggression: 50,
    crossing: 50, leadership: 50, mentality: 60, workRate: 60,
  },
  stats: {
    goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0,
    matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [],
  },
  health: { status: HealthStatus.HEALTHY },
  condition: 100,
  suspensionMatches: 0,
  contractEndDate: '2052-06-30',
  annualSalary: 100_000,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 0,
} as Player);

const positions = [PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD];
const buyerSquads = Array.from({ length: 1_213 }, (_, clubIndex) =>
  Array.from({ length: 24 }, (_, playerIndex) => makePlayer(
    `BUYER_${clubIndex}_${playerIndex}`,
    positions[playerIndex % positions.length],
    48 + ((clubIndex * 7 + playerIndex * 3) % 35)
  ))
);
const candidates = Array.from({ length: 360 }, (_, index) => makePlayer(
  `CANDIDATE_${index}`,
  positions[index % positions.length],
  52 + ((index * 11) % 35)
));

const snapshots = buyerSquads.map(squad => IncomingTransferService.buildLoanSquadNeedSnapshot(squad));
let legacyChecksum = 0;
const legacyStartedAt = performance.now();
for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
  const candidate = candidates[candidateIndex];
  for (let buyerIndex = candidateIndex % 3; buyerIndex < buyerSquads.length; buyerIndex += 3) {
    const result = IncomingTransferService.getLoanSquadNeed(
      candidate,
      buyerSquads[buyerIndex]
    );
    legacyChecksum += result.fits ? Math.round(result.needScore * 10) : -1;
  }
}
const legacyElapsedMs = performance.now() - legacyStartedAt;

let optimizedChecksum = 0;
const optimizedStartedAt = performance.now();
for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
  const candidate = candidates[candidateIndex];
  // Sampling every third buyer mirrors the seller staggering used by the real
  // daily market while still exercising more than 145,000 squad-fit decisions.
  for (let buyerIndex = candidateIndex % 3; buyerIndex < buyerSquads.length; buyerIndex += 3) {
    const result = IncomingTransferService.getLoanSquadNeed(
      candidate,
      buyerSquads[buyerIndex],
      snapshots[buyerIndex]
    );
    optimizedChecksum += result.fits ? Math.round(result.needScore * 10) : -1;
  }
}
const optimizedElapsedMs = performance.now() - optimizedStartedAt;

assert.notEqual(optimizedChecksum, 0, 'benchmark musi wykorzystać wyniki obliczeń, a nie zostać pominięty');
assert.equal(optimizedChecksum, legacyChecksum, 'optymalizacja musi zachować dokładnie te same decyzje potrzeb kadry');
assert.ok(
  optimizedElapsedMs < 1_500,
  `ponowne użycie profilu kadry jest zbyt wolne: ${optimizedElapsedMs.toFixed(1)} ms`
);

console.log(
  `AiLoanMarketPerformanceTests: OK (legacy ${legacyElapsedMs.toFixed(1)} ms, ` +
  `optimized ${optimizedElapsedMs.toFixed(1)} ms, checksum ${optimizedChecksum})`
);
