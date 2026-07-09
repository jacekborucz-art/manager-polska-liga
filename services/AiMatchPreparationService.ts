
import { Club, Player, PlayerPosition, Lineup, HealthStatus, Coach } from '../types';
import { LineupService } from './LineupService';
import { PlayerMoraleService } from './PlayerMoraleService';

export const AiMatchPreparationService = {

  prepareAllTeams: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentLineups: Record<string, Lineup>,
    userTeamId: string | null,
    coaches: Record<string, Coach> = {}
  ): Record<string, Lineup> => {
    
    const updatedLineups: Record<string, Lineup> = { ...currentLineups };

    clubs.forEach(club => {
      // Nie zmieniaj składu gracza tutaj, to dzieje się w GameContext lub przed meczem
      if (club.id === userTeamId) return;

      const squad = playersMap[club.id];
   if (!squad || squad.length === 0) return;
      // --- STAGE 1 PRO: FRESHNESS POOL ---
      const AI_FRESH_THRESHOLD = 87;
      const readySquad = squad.filter(p => p.condition >= AI_FRESH_THRESHOLD);
      const analysisSquad = readySquad.length >= 14 ? readySquad : squad.filter(p => p.condition >= 75);

      // 1. Wybierz najlepszą taktykę startową na podstawie dostępnych zdrowych graczy
     const bestTacticId = AiMatchPreparationService.determineBestStartingTactic(club, analysisSquad);

      // 2. Pobierz aktualny skład lub stwórz nowy z inteligentnie dobraną taktyką
      const clubCoach = club.coachId ? (coaches[club.coachId] ?? null) : null;
      const seedParts = [
        club.id,
        bestTacticId,
        club.stats?.played ?? 0,
        club.stats?.points ?? 0,
        club.stats?.goalsFor ?? 0,
        club.stats?.goalsAgainst ?? 0
      ];
      let lineup = LineupService.autoPickLineup(club.id, squad, bestTacticId, clubCoach, {
        formAware: true,
        selectionSeed: seedParts.join('_')
      });
      if (!lineup) {
        // Brak składu lub utknięcie w domyślnym 4-4-2 — trener dobiera skład pod swoje taktyki
        lineup = LineupService.autoPickLineup(club.id, squad, bestTacticId, clubCoach, {
          formAware: true,
          selectionSeed: seedParts.join('_')
        });
      }

      // 3. Napraw skład (wywal zawieszonych/rannych i wypełnij luki inteligentnie)
      updatedLineups[club.id] = LineupService.repairLineup(lineup, squad);
    });

    return updatedLineups;
  },

/**
   * Analizuje kadrę i wybiera optymalną formację startową na podstawie reputacji klubu i siły linii.
   */
determineBestStartingTactic: (club: Club, players: Player[]): string => {
    const defStr = AiMatchPreparationService.calculateTopLineStrength(players, PlayerPosition.DEF, 5);
    const midStr = AiMatchPreparationService.calculateTopLineStrength(players, PlayerPosition.MID, 5);
    const fwdStr = AiMatchPreparationService.calculateTopLineStrength(players, PlayerPosition.FWD, 3);

    // Outsiderzy (Reputacja <= 4) - Preferują defensywę
    if (club.reputation <= 4) {
      if (defStr > fwdStr) return '5-4-1';
      return '4-5-1';
    }

    // Giganci (Reputacja >= 8) - Preferują dominację
    if (club.reputation >= 8) {
      if (fwdStr > defStr) return '4-3-3';
      return '4-2-3-1';
    }

    // Bardzo mocny środek pola
    if (midStr > defStr + 3 && midStr > fwdStr + 3) {
      return '3-5-2';
    }

    // Mocny atak, słabsza obrona
    if (fwdStr > defStr + 5) {
      return '4-3-3';
    }

    // Solidna obrona, szukanie kontroli
    if (defStr > fwdStr + 3) {
      return '4-1-4-1';
    }

    // Default dla zrównoważonych zespołów
    return '4-4-2';
  },

  calculateTopLineStrength: (players: Player[], pos: PlayerPosition, topN: number): number => {
    const linePlayers = players
      .filter(p => p.position === pos)
      .sort((a, b) =>
        PlayerMoraleService.getEffectiveOverall(PlayerMoraleService.ensurePlayerState(b)) -
        PlayerMoraleService.getEffectiveOverall(PlayerMoraleService.ensurePlayerState(a))
      )
      .slice(0, topN);

    if (linePlayers.length === 0) return 0;
    const total = linePlayers.reduce((sum, p) =>
      sum + PlayerMoraleService.getEffectiveOverall(PlayerMoraleService.ensurePlayerState(p)), 0);
    return total / linePlayers.length;
  }
};
