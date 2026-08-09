import type { Player } from '../types';
import { ClubStrengthService } from './ClubStrengthService';

export const PLAYER_REPUTATION_MIN = 1;
export const PLAYER_REPUTATION_MAX = 99;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const normalizeOverall = (overall: number): number =>
  clamp((clamp(overall, 1, 99) - 35) / 64, 0, 1);

export const PlayerPrestigeService = {
  /** Docelowa reputacja wynikająca z poziomu sportowego i ekspozycji klubu. */
  getReputationTarget(overall: number, clubReputation: number): number {
    const sportingRecognition = 5 + Math.pow(normalizeOverall(overall), 1.15) * 76;
    const clubExposure = ClubStrengthService.getExposure(clubReputation) * 18;
    return clamp(sportingRecognition + clubExposure, PLAYER_REPUTATION_MIN, PLAYER_REPUTATION_MAX);
  },

  /** Reputacja startowa bez progów i podłóg; mały rozrzut zachowuje różnorodność świata. */
  calculateGeneratedReputation(
    overall: number,
    clubReputation: number,
    random: () => number = Math.random,
  ): number {
    const variation = (clamp(random(), 0, 1) - 0.5) * 4;
    return Math.round(clamp(
      PlayerPrestigeService.getReputationTarget(overall, clubReputation) + variation,
      PLAYER_REPUTATION_MIN,
      PLAYER_REPUTATION_MAX,
    ));
  },

  /** Jeden płynny prestiż używany przy ocenie realności transferu. */
  getTransferPrestige(player: Pick<Player, 'overallRating' | 'reputacja'>): number {
    const overall = clamp(player.overallRating, 1, 99);
    const reputation = clamp(player.reputacja ?? overall, PLAYER_REPUTATION_MIN, PLAYER_REPUTATION_MAX);
    return clamp(overall * 0.72 + reputation * 0.28, PLAYER_REPUTATION_MIN, PLAYER_REPUTATION_MAX);
  },

  isGlobalIcon(player: Pick<Player, 'overallRating' | 'reputacja'>): boolean {
    const overall = clamp(player.overallRating, 1, 99);
    const reputation = clamp(player.reputacja ?? overall, PLAYER_REPUTATION_MIN, PLAYER_REPUTATION_MAX);
    const prestige = PlayerPrestigeService.getTransferPrestige(player);
    return prestige >= 94 || (reputation >= 97 && overall >= 85) || (overall >= 97 && reputation >= 85);
  },
};
