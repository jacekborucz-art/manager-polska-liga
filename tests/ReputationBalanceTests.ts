import { strict as assert } from 'node:assert';
import type { Club, Player, PlayerStats } from '../types';
import { ClubStrengthService } from '../services/ClubStrengthService';
import { PlayerPrestigeService } from '../services/PlayerPrestigeService';
import { PlayerReputationGrowthService } from '../services/PlayerReputationGrowthService';

const stats = (
  matchesPlayed: number,
  minutesPlayed: number,
  rating: number | null,
): PlayerStats => ({
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  cleanSheets: 0,
  matchesPlayed,
  minutesPlayed,
  seasonalChanges: {},
  ratingHistory: rating === null ? [] : Array.from({ length: matchesPlayed }, () => rating),
});

const player = (
  id: string,
  overallRating: number,
  reputation: number,
  age: number,
  seasonStats: PlayerStats,
): Player => ({
  id,
  clubId: 'CLUB',
  overallRating,
  reputacja: reputation,
  age,
  stats: seasonStats,
  cupStats: stats(0, 0, null),
  euroStats: stats(0, 0, null),
  nationalStats: stats(0, 0, null),
} as Player);

const club = {
  id: 'CLUB',
  leagueId: 'L_PL_1',
  reputation: 10,
  isDefaultActive: true,
} as Club;

assert.equal(ClubStrengthService.getLevel(10), 76);
assert.equal(ClubStrengthService.getLevel(11), 78);
assert.equal(ClubStrengthService.getLevel(17), 90);
assert.equal(ClubStrengthService.getLevel(20), 96);
assert.equal(ClubStrengthService.getLevel(99), 96, 'siła klubu musi respektować limit reputacji 20');

const generatedAt79 = PlayerPrestigeService.calculateGeneratedReputation(79, 10, () => 0.5);
const generatedAt80 = PlayerPrestigeService.calculateGeneratedReputation(80, 10, () => 0.5);
assert.ok(generatedAt80 >= generatedAt79, 'reputacja ma rosnąć wraz z OVR');
assert.ok(generatedAt80 - generatedAt79 <= 2, 'na OVR 80 nie może występować dawny skok progowy');

const generatedBelowClubThreshold = PlayerPrestigeService.calculateGeneratedReputation(75, 9.99, () => 0.5);
const generatedAboveClubThreshold = PlayerPrestigeService.calculateGeneratedReputation(75, 10.01, () => 0.5);
assert.ok(
  Math.abs(generatedAboveClubThreshold - generatedBelowClubThreshold) <= 1,
  'próg reputacji klubu 10 nie może tworzyć skoku reputacji zawodnika',
);

const prestigeAt89 = PlayerPrestigeService.getTransferPrestige({ overallRating: 75, reputacja: 89 });
const prestigeAt90 = PlayerPrestigeService.getTransferPrestige({ overallRating: 75, reputacja: 90 });
assert.ok(prestigeAt90 > prestigeAt89);
assert.ok(prestigeAt90 - prestigeAt89 < 1, 'reputacja 90 nie może skokowo zmieniać prestiżu na 90');
assert.equal(
  PlayerPrestigeService.isGlobalIcon({ overallRating: 88, reputacja: 99 }),
  true,
  'absolutnie rozpoznawalny zawodnik musi zachować ochronę globalnej ikony',
);

const activePlayer = player('ACTIVE', 80, 60, 28, stats(30, 2_200, 7.6));
const inactiveVeteran = player('VETERAN', 80, 90, 38, stats(0, 0, null));
const weakPlayer = player('WEAK', 72, 60, 29, stats(25, 1_800, 6.0));
const minimumPlayer = player('MINIMUM', 40, 1, 22, stats(0, 0, null));
const untrackedForeignPlayer = {
  ...player('UNTRACKED', 70, 80, 28, stats(0, 0, null)),
  clubId: 'FOREIGN',
} as Player;
const foreignClub = {
  ...club,
  id: 'FOREIGN',
  leagueId: 'L_CL',
  reputation: 10,
} as Club;

const seasonUpdate = PlayerReputationGrowthService.applySeasonEndUpdate(
  {
    CLUB: [activePlayer, inactiveVeteran, weakPlayer],
    FOREIGN: [untrackedForeignPlayer],
    FREE_AGENTS: [minimumPlayer],
  },
  [club, foreignClub],
  [],
  1,
);

assert.ok(
  (seasonUpdate.CLUB.find(entry => entry.id === 'ACTIVE')?.reputacja ?? 0) > 60,
  'regularna gra i bardzo dobre oceny powinny zwiększać reputację',
);
assert.ok(
  (seasonUpdate.CLUB.find(entry => entry.id === 'VETERAN')?.reputacja ?? 99) < 90,
  'starszy niegrający zawodnik powinien tracić reputację',
);
assert.ok(
  (seasonUpdate.CLUB.find(entry => entry.id === 'WEAK')?.reputacja ?? 99) < 60,
  'słaby sezon powinien obniżać reputację',
);
assert.equal(
  seasonUpdate.FREE_AGENTS[0]?.reputacja,
  1,
  'spadek reputacji nie może zejść poniżej 1',
);
assert.equal(
  seasonUpdate.FOREIGN[0]?.reputacja,
  80,
  'brak symulowanej ligi zagranicznej nie może być błędnie uznany za brak gry',
);

console.log('Reputation balance tests passed.');
