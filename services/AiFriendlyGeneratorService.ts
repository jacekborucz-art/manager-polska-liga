import { Club, AiFriendlyPair } from '../types';


const EUROPEAN_LEAGUE_IDS = ['L_CL', 'L_EL', 'L_CONF'];
const PAIRS_PER_DAY = 20;

export class AiFriendlyGeneratorService {
  static generate(clubs: Club[], userTeamId: string | null, year: number, busyClubIds: Set<string> = new Set()): AiFriendlyPair[] {
    const primaryPolish = clubs.filter(c =>
      ['L_PL_1', 'L_PL_2', 'L_PL_3'].includes(c.leagueId) && c.id !== userTeamId && !busyClubIds.has(c.id)
    );
    const secondaryPolish = clubs.filter(c =>
      c.leagueId === 'L_PL_4' && c.id !== userTeamId && !busyClubIds.has(c.id)
    );
    const polishClubs = [...primaryPolish, ...secondaryPolish];
    const europeanClubs = clubs.filter(c =>
      EUROPEAN_LEAGUE_IDS.includes(c.leagueId) && !busyClubIds.has(c.id)
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

        const availablePrimary = primaryPolish.filter(c => !usedIds.has(c.id));
        const availableSecondary = secondaryPolish.filter(c => !usedIds.has(c.id));
        const pickPool = (Math.random() < 0.9 && availablePrimary.length > 0) ? availablePrimary : (availableSecondary.length > 0 ? availableSecondary : availablePrimary);
        const polishTeam = pickPool[Math.floor(Math.random() * pickPool.length)];
        const roll = Math.random() * 100;
        let opponent: Club | null = null;

        if (roll < 70) {
          // 70% - polska druzyna
          const candidates = polishClubs.filter(c =>
            !usedIds.has(c.id) &&
            c.id !== polishTeam.id &&
            c.reputation >= polishTeam.reputation - 5 &&
            c.reputation <= polishTeam.reputation + 3
          );
          if (candidates.length > 0) {
            opponent = candidates[Math.floor(Math.random() * candidates.length)];
          }
        }

        if (!opponent) {
          // 30% lub fallback - druzyna europejska
          const candidates = europeanClubs.filter(c =>
            !usedIds.has(c.id) &&
            c.reputation >= polishTeam.reputation - 3 &&
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
