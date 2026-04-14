import { Club, Player, Coach, PlayerPosition } from '../types';
import { LineupService } from './LineupService';
import { FinanceService } from './FinanceService';

// ─── Typy wewnętrzne ──────────────────────────────────────────────────────────

interface PositionStrength {
  position: 'DEF' | 'MID' | 'FWD';
  realAvgOvr: number;
  perceivedAvgOvr: number;
  playerIds: string[];
}

export interface SeasonTransferPlan {
  clubId: string;
  weakPositions: PositionStrength[];
  playersMarkedForSaleIds: string[];
  targetMinOvr: number;
  reinforcementSlots: number;
}

// ─── Stałe ───────────────────────────────────────────────────────────────────

const LINEUP_POSITIONS: ('DEF' | 'MID' | 'FWD')[] = ['DEF', 'MID', 'FWD'];

// ─── Pomocnicze funkcje prywatne ──────────────────────────────────────────────

/**
 * Liczy błąd percepcji trenera na podstawie doświadczenia.
 * exp ≥ 70 → ±3%  |  exp 50-69 → ±12%  |  exp 30-49 → ±22%  |  exp < 30 → ±32%
 */
const _perceptionError = (exp: number): number => {
  if (exp >= 70) return 0.03;
  if (exp >= 50) return 0.12;
  if (exp >= 30) return 0.22;
  return 0.32;
};

/**
 * Deterministyczny pseudo-random na podstawie seed.
 */
const _seededRandom = (seed: number): number => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

/**
 * Buduje wyjściową 11 dla AI-klubu, zwraca listę obiektów Player.
 */
const _getStartingEleven = (club: Club, squad: Player[], coach: Coach | null): Player[] => {
  const defaultTactic = coach?.favoriteTactics?.neutral || '4-4-2';
  const lineup = LineupService.autoPickLineup(club.id, squad, defaultTactic, coach);
  const startingIds = new Set((lineup.startingXI || []).filter(Boolean) as string[]);
  return squad.filter(p => startingIds.has(p.id));
};

/**
 * Oblicza siłę każdej linii (DEF/MID/FWD) na podstawie wyjściowej 11.
 */
const _calcPositionStrengths = (starters: Player[]): PositionStrength[] => {
  return LINEUP_POSITIONS.map(pos => {
    const group = starters.filter(p => p.position === pos);
    const avgOvr = group.length > 0
      ? group.reduce((sum, p) => sum + p.overallRating, 0) / group.length
      : 0;
    return {
      position: pos,
      realAvgOvr: avgOvr,
      perceivedAvgOvr: avgOvr,
      playerIds: group.map(p => p.id),
    };
  });
};

/**
 * Nakłada szum percepcji trenera na obliczone siły linii.
 * Niższe doświadczenie = większy błąd w ocenie.
 */
const _applyCoachPerception = (
  strengths: PositionStrength[],
  exp: number,
  clubSeed: number
): PositionStrength[] => {
  const errorRange = _perceptionError(exp);
  return strengths.map((s, i) => {
    const noise = (_seededRandom(clubSeed + i * 31) * 2 - 1) * errorRange;
    return { ...s, perceivedAvgOvr: Math.max(1, s.realAvgOvr * (1 + noise)) };
  });
};

/**
 * Wybiera 1 lub 2 najsłabsze linie na podstawie percepcji trenera.
 * exp < 34  → zawsze widzi tylko 1 linię
 * exp ≥ 34  → widzi 1-2 linie (2 jeśli różnica między najsłabszą a 2. jest > 3 pkt OVR)
 */
const _selectWeakPositions = (
  strengths: PositionStrength[],
  exp: number
): PositionStrength[] => {
  const sorted = [...strengths].sort((a, b) => a.perceivedAvgOvr - b.perceivedAvgOvr);

  if (exp < 34) {
    return [sorted[0]];
  }

  const gap = sorted[1].perceivedAvgOvr - sorted[0].perceivedAvgOvr;
  if (gap > 3) {
    return [sorted[0], sorted[1]];
  }
  return [sorted[0]];
};

/**
 * Dla każdej słabej pozycji wskazuje 1 zawodnika do sprzedaży:
 * najstarszego spośród najsłabszych (wiek jako tiebreaker) na tej pozycji.
 * Nie oznacza zawodnika jeśli po jego odejściu na pozycji zostałoby < minimalnej głębokości.
 */
const _pickPlayerForSale = (
  position: PlayerPosition,
  squad: Player[]
): Player | null => {
  const MIN_DEPTH: Record<PlayerPosition, number> = { GK: 2, DEF: 4, MID: 3, FWD: 2 };
  const posGroup = squad.filter(p => p.position === position && !p.isOnTransferList);
  if (posGroup.length <= MIN_DEPTH[position]) return null;

  const sorted = [...posGroup].sort((a, b) => {
    const ovrDiff = a.overallRating - b.overallRating;
    if (Math.abs(ovrDiff) >= 3) return ovrDiff;
    return b.age - a.age;
  });

  return sorted[0] || null;
};

// ─── Serwis publiczny ─────────────────────────────────────────────────────────

export const AiTransferDecisionService = {

  /**
   * Główna funkcja sezonu — wywoływana 2 lipca dla każdego AI-klubu.
   *
   * Dla każdego klubu:
   *   1. Buduje wyjściową 11 i liczy siłę linii DEF/MID/FWD
   *   2. Nakłada błąd percepcji trenera (zależny od experience)
   *   3. Wskazuje 1-2 najsłabsze linie
   *   4. Oznacza 1 zawodnika per słaba linia jako wystawionych na sprzedaż
   *
   * Doświadczenie trenera (Option A — błąd percepcji):
   *   exp < 34  → widzi tylko 1 problem, duży szum → może wskazać złą linię
   *   exp 34-66 → widzi 1-2 problemy, umiarkowany szum
   *   exp > 66  → widzi 1-2 problemy precyzyjnie, mały szum
   */
  processSeasonStart: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    coachesMap: Record<string, Coach>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[]; updatedPlayers: Record<string, Player[]> } => {

    let updatedPlayers = { ...playersMap };

    for (const club of clubs) {
      if (club.id === userTeamId) continue;

      const squad = updatedPlayers[club.id];
      if (!squad || squad.length === 0) continue;

      const coach = club.coachId ? (coachesMap[club.coachId] || null) : null;
      const exp = coach?.attributes.experience ?? 50;

      // Seed deterministyczny per klub + rok — każdy trener ma stały "charakter" w danym sezonie
      const clubSeed = currentDate.getFullYear() * 1000 +
        Math.abs(club.id.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0) % 1000);

      // 1. Wyjściowa 11
      const starters = _getStartingEleven(club, squad, coach);
      if (starters.length < 7) continue;

      // 2. Siła linii (realna)
      const strengths = _calcPositionStrengths(starters);

      // 3. Percepcja trenera (z błędem)
      const perceivedStrengths = _applyCoachPerception(strengths, exp, clubSeed);

      // 4. Najsłabsze linie
      const weakPositions = _selectWeakPositions(perceivedStrengths, exp);

      // 5. Oznacz zawodników do sprzedaży — 1 per słaba pozycja
      const updatedSquad = squad.map(p => ({ ...p }));

      for (const weak of weakPositions) {
        const candidate = _pickPlayerForSale(weak.position as PlayerPosition, updatedSquad);
        if (!candidate) continue;

        const tier = FinanceService.getClubTier(club);
        const marketValue = FinanceService.calculateMarketValue(candidate, club.reputation, tier);
        const reducedPrice = Math.round(marketValue * 0.72 / 50_000) * 50_000;

        const idx = updatedSquad.findIndex(p => p.id === candidate.id);
        if (idx !== -1) {
          updatedSquad[idx] = {
            ...updatedSquad[idx],
            isOnTransferList: true,
            transferListPrice: Math.max(50_000, reducedPrice),
          };
        }
      }

      updatedPlayers = { ...updatedPlayers, [club.id]: updatedSquad };
    }

    return { updatedClubs: clubs, updatedPlayers };
  },

};
