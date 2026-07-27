import type { Player } from '../../../../types';
import type { CupRuntimeState, CupTeamInput, CupTeamRuntimeProfile } from './CupMatchTypes';
import { pickWeighted, weightedScore } from './CupMath';

export type CupSubstitutionProposal = {
  side: 'HOME' | 'AWAY';
  playerOutId: string;
  playerInId: string;
  reason: 'FATIGUE' | 'INJURY' | 'CARD_RISK' | 'TACTICAL';
};

export const CupSubstitutionService = {
  /**
   * Zmiany są planowane przez tę warstwę, ale wykonanie powinno później
   * należeć do integracji z UI i aktualnym LineupService. W V2 najważniejsze
   * jest, żeby potrzeba zmiany wynikała z meczu: zmęczenia, urazu, kartek,
   * wyniku i dopasowania zawodnika z ławki.
   */
  proposeAiSubstitution: ({
    team,
    profile,
    state,
    maxSubstitutions,
  }: {
    team: CupTeamInput;
    profile: CupTeamRuntimeProfile;
    state: CupRuntimeState;
    maxSubstitutions: number;
  }): CupSubstitutionProposal | null => {
    if (state.substitutionsUsed[team.side] >= maxSubstitutions) return null;

    const activeIds = new Set(team.lineup.startingXI.filter((id): id is string => Boolean(id)));
    const bench = team.players.filter(player => team.lineup.bench.includes(player.id));
    if (bench.length === 0) return null;

    const tiredPlayers = profile.activePlayers.filter(player => (state.fatigue[player.id] ?? player.condition) < 55);
    const injuredPlayers = profile.activePlayers.filter(player => state.injuries[player.id]);
    const yellowRiskPlayers = profile.activePlayers.filter(player => (state.yellowCards[player.id] ?? 0) > 0 && player.attributes.aggression > 65);
    const candidatesOut = injuredPlayers.length > 0 ? injuredPlayers : tiredPlayers.length > 0 ? tiredPlayers : yellowRiskPlayers;
    if (candidatesOut.length === 0) return null;

    const playerOut = pickWeighted(candidatesOut.map(player => ({
      item: player,
      weight: state.injuries[player.id] ? 100 : Math.max(1, 100 - (state.fatigue[player.id] ?? player.condition)),
    })), 0.42);

    const replacements = bench.filter(player => !activeIds.has(player.id) && player.position === playerOut.position);
    const pool = replacements.length > 0 ? replacements : bench;
    const playerIn: Player = pickWeighted(pool.map(player => ({
      item: player,
      weight: weightedScore(player.attributes, {
        stamina: 0.22,
        workRate: 0.16,
        mentality: 0.14,
        pace: 0.10,
        technique: 0.10,
        passing: 0.08,
        defending: 0.08,
        attacking: 0.08,
        leadership: 0.04,
      }) + player.overallRating * 0.25,
    })), 0.58);

    return {
      side: team.side,
      playerOutId: playerOut.id,
      playerInId: playerIn.id,
      reason:
        state.injuries[playerOut.id] ? 'INJURY' :
        (state.yellowCards[playerOut.id] ?? 0) > 0 ? 'CARD_RISK' :
        'FATIGUE',
    };
  },
};

