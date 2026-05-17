import { Club, AiFriendlyPair } from '../types';

const POLISH_LEAGUE_IDS = ['L_PL_1', 'L_PL_2', 'L_PL_3', 'L_PL_4'];
const EUROPEAN_LEAGUE_IDS = ['L_CL', 'L_EL', 'L_CONF'];
const PAIRS_PER_DAY = 20;

export class AiFriendlyGeneratorService {
  static generate(clubs: Club[], userTeamId: string | null, year: number): AiFriendlyPair[] {
    const polishClubs = clubs.filter(c =>
      POLISH_LEAGUE_IDS.includes(c.leagueId) && c.id !== userTeamId
    );
    const europeanClubs = clubs.filter(c =>
      EUROPEAN_LEAGUE_IDS.includes(c.leagueId)
    );

    const pairs: AiFriendlyPair[] = [];
    const usedIds = new Set<string>();

    const dates = [
      new Date(year, 6, 8),
      new Date(year, 6, 9),
    ];

    for (const date of dates) {
      let count = 0;
      let attempts = 0;

      while (count < PAIRS_PER_DAY && attempts < 1000) {
        attempts++;

        const availablePolish = polishClubs.filter(c => !usedIds.has(c.id));
        if (availablePolish.length === 0) break;

        const polishTeam = availablePolish[Math.floor(Math.random() * availablePolish.length)];
        const roll = Math.random() * 100;
        let opponent: Club | null = null;

        if (roll < 1) {
          // 1% - ta sama polska liga
          const candidates = polishClubs.filter(c =>
            !usedIds.has(c.id) &&
            c.id !== polishTeam.id &&
            c.leagueId === polishTeam.leagueId &&
            c.reputation >= polishTeam.reputation - 5 &&
            c.reputation <= polishTeam.reputation + 3
          );
          if (candidates.length > 0) {
            opponent = candidates[Math.floor(Math.random() * candidates.length)];
          }
        } else if (roll < 98) {
          // 97% - drużyna europejska
          const candidates = europeanClubs.filter(c =>
            !usedIds.has(c.id) &&
            c.reputation >= polishTeam.reputation - 3 &&
            c.reputation <= polishTeam.reputation + 3
          );
          if (candidates.length > 0) {
            opponent = candidates[Math.floor(Math.random() * candidates.length)];
          }
        } else {
          // 2% - inna polska liga
          const candidates = polishClubs.filter(c =>
            !usedIds.has(c.id) &&
            c.id !== polishTeam.id &&
            c.leagueId !== polishTeam.leagueId &&
            c.reputation >= polishTeam.reputation - 5 &&
            c.reputation <= polishTeam.reputation + 3
          );
          if (candidates.length > 0) {
            opponent = candidates[Math.floor(Math.random() * candidates.length)];
          }
        }

        if (!opponent) continue;

        const isPolishHome = Math.random() > 0.5;
        const homeTeamId = isPolishHome ? polishTeam.id : opponent.id;
        const awayTeamId = isPolishHome ? opponent.id : polishTeam.id;

        pairs.push({
          id: `AI_FRIENDLY_${year}_${date.getMonth()}_${date.getDate()}_${count}`,
          homeTeamId,
          awayTeamId,
          date: new Date(date),
        });

        usedIds.add(polishTeam.id);
        usedIds.add(opponent.id);
        count++;
      }
    }

    return pairs;
  }
}
