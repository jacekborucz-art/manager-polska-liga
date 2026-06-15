import { MailMessage, MailType, NationalTeam, WCState, WCTeam } from '../types';
import { WorldCupService } from './WorldCupService';

export interface WorldCupHistoryBackfillResult {
  latestWorldCupState: WCState | null;
  messages: MailMessage[];
}

function buildWorldCupMessage(state: WCState, careerStartDate: Date): MailMessage {
  const champion = state.champion ?? 'nieznany zwycięzca';
  const thirdPlace = state.thirdPlace ? ` Trzecie miejsce zajmuje ${state.thirdPlace}.` : '';

  return {
    id: `world-cup-backfill-${state.year}`,
    sender: 'FIFA',
    role: 'Organizator rozgrywek',
    subject: `Uzupełniono historię MŚ ${state.year}: ${champion}`,
    body: `Ponieważ kariera rozpoczyna się po zakończeniu turnieju, Mistrzostwa Świata ${state.year} zostały zasymulowane w tle. Mistrzem świata zostaje ${champion}.${thirdPlace} Szczegóły turnieju są dostępne w widoku historii MŚ.`,
    date: careerStartDate,
    isRead: false,
    type: MailType.SYSTEM,
    priority: 2,
  };
}

function createSeededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function pickWeightedEuropeanQualifiers(nationalTeams: NationalTeam[], seed: number, count: number): NationalTeam[] {
  const random = createSeededRandom(seed);
  const candidates = nationalTeams
    .filter(team => team.continent === 'Europe')
    .map(team => ({
      team,
      score: team.reputation + random() * 8,
    }))
    .sort((a, b) => b.score - a.score);

  return candidates.slice(0, count).map(candidate => candidate.team);
}

function applyRandomizedUefaQualifiers(teams: WCTeam[], nationalTeams: NationalTeam[], seed: number): WCTeam[] {
  const uefaSlots = teams
    .map((team, index) => ({ team, index }))
    .filter(entry => entry.team.confederation === 'UEFA')
    .slice(0, 16);

  const qualifiers = pickWeightedEuropeanQualifiers(nationalTeams, seed, uefaSlots.length);
  const nextTeams = [...teams];

  uefaSlots.forEach((slot, slotIndex) => {
    const qualifier = qualifiers[slotIndex];
    if (!qualifier) return;

    nextTeams[slot.index] = {
      ...slot.team,
      name: qualifier.name,
      reputation: qualifier.reputation,
      colors: qualifier.colorsHex,
      isHost: false,
      isPlayoffSlot: false,
    };
  });

  return nextTeams;
}

export const WorldCupHistoryBackfillService = {
  simulateSkippedWorldCups(
    careerStartYear: number,
    nationalTeams: NationalTeam[],
    seed: number,
  ): WorldCupHistoryBackfillResult {
    const careerStartDate = new Date(careerStartYear, 6, 1);
    const messages: MailMessage[] = [];
    let latestWorldCupState: WCState | null = null;

    for (let year = 2026; year <= careerStartYear; year += 4) {
      if (!WorldCupService.isWorldCupYear(year)) continue;

      const tournamentEndDate = new Date(year, 5, 30);
      if (careerStartDate <= tournamentEndDate) continue;

      const wcSeed = seed ^ (year * 7919);
      const baseTeams = WorldCupService.assembleTeams(nationalTeams, null, 1, year, wcSeed);
      const teams = applyRandomizedUefaQualifiers(baseTeams, nationalTeams, wcSeed ^ 0x51f1fa);
      const groups = WorldCupService.drawGroups(teams, wcSeed, year);
      const initialState = WorldCupService.createInitialState(teams, groups, year);
      const simulation = WorldCupService.simulateFullTournament(initialState, wcSeed);

      latestWorldCupState = {
        ...simulation.state,
        drawComplete: true,
        playoffSlotsResolved: true,
        groupStageComplete: true,
        knockoutComplete: true,
      };
      messages.push(buildWorldCupMessage(latestWorldCupState, careerStartDate));
    }

    return { latestWorldCupState, messages };
  },
};
