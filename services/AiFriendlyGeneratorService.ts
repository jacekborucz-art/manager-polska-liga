import { Club, AiFriendlyPair } from '../types';


const EUROPEAN_LEAGUE_IDS = ['L_CL', 'L_EL', 'L_CONF'];
const PAIRS_PER_DAY = 20;
const JANUARY_PAIRS_PER_DAY = 40;

interface AiFriendlyGeneratorOptions {
  dates?: Date[];
  pairsPerDay?: number;
  minDaysBetweenMatches?: number;
}

const buildDateRange = (year: number, month: number, startDay: number, endDay: number): Date[] =>
  Array.from({ length: endDay - startDay + 1 }, (_, idx) => new Date(year, month, startDay + idx));

export class AiFriendlyGeneratorService {
  static getSummerFriendlyDates(year: number): Date[] {
    return [
      new Date(year, 6, 8),
      new Date(year, 6, 9),
    ];
  }

  static getWinterFriendlyDates(year: number): Date[] {
    return buildDateRange(year, 0, 2, 18);
  }

  static generate(clubs: Club[], userTeamId: string | null, year: number, busyClubIds: Set<string> = new Set(), options: AiFriendlyGeneratorOptions = {}): AiFriendlyPair[] {
    const primaryPolish = clubs.filter(c =>
      ['L_PL_1', 'L_PL_2', 'L_PL_3'].includes(c.leagueId) && c.id !== userTeamId && !busyClubIds.has(c.id)
    );
    const secondaryPolish = clubs.filter(c =>
      c.leagueId === 'L_PL_4' && c.id !== userTeamId && !busyClubIds.has(c.id)
    );
    const polishClubs = [...primaryPolish, ...secondaryPolish];
    const europeanClubs = clubs.filter(c =>
      EUROPEAN_LEAGUE_IDS.includes(c.leagueId) && c.id !== userTeamId && !busyClubIds.has(c.id)
    );

    const pairs: AiFriendlyPair[] = [];
    const dates = options.dates ?? AiFriendlyGeneratorService.getSummerFriendlyDates(year);
    const pairsPerDay = options.pairsPerDay ?? PAIRS_PER_DAY;
    const minDaysBetweenMatches = options.minDaysBetweenMatches ?? dates.length;
    const lastPlayedDateIndex = new Map<string, number>();
    const usedPairKeys = new Set<string>();
    const pairKey = (a: string, b: string): string => [a, b].sort().join('__');

    for (let dateIndex = 0; dateIndex < dates.length; dateIndex++) {
      const date = dates[dateIndex];
      const usedToday = new Set<string>();
      let count = 0;
      let attempts = 0;
      const isAvailable = (club: Club): boolean =>
        !usedToday.has(club.id) &&
        (lastPlayedDateIndex.get(club.id) === undefined || dateIndex - (lastPlayedDateIndex.get(club.id) ?? -999) >= minDaysBetweenMatches);

      while (count < pairsPerDay && attempts < 3000) {
        attempts++;

        const availablePolish = polishClubs.filter(isAvailable);
        if (availablePolish.length === 0) break;

        const availablePrimary = primaryPolish.filter(isAvailable);
        const availableSecondary = secondaryPolish.filter(isAvailable);
        const pickPool = (Math.random() < 0.9 && availablePrimary.length > 0) ? availablePrimary : (availableSecondary.length > 0 ? availableSecondary : availablePrimary);
        const polishTeam = pickPool[Math.floor(Math.random() * pickPool.length)];
        const roll = Math.random() * 100;
        let opponent: Club | null = null;

        if (roll < 70) {
          // 70% - polska druzyna
          const candidates = polishClubs.filter(c =>
            isAvailable(c) &&
            c.id !== polishTeam.id &&
            !usedPairKeys.has(pairKey(polishTeam.id, c.id)) &&
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
            isAvailable(c) &&
            !usedPairKeys.has(pairKey(polishTeam.id, c.id)) &&
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

        usedToday.add(polishTeam.id);
        usedToday.add(opponent.id);
        lastPlayedDateIndex.set(polishTeam.id, dateIndex);
        lastPlayedDateIndex.set(opponent.id, dateIndex);
        usedPairKeys.add(pairKey(polishTeam.id, opponent.id));
        count++;
      }
    }

    return pairs;
  }

  static generateWinter(clubs: Club[], userTeamId: string | null, year: number, busyClubIds: Set<string> = new Set()): AiFriendlyPair[] {
    return AiFriendlyGeneratorService.generate(clubs, userTeamId, year, busyClubIds, {
      dates: AiFriendlyGeneratorService.getWinterFriendlyDates(year),
      pairsPerDay: JANUARY_PAIRS_PER_DAY,
      minDaysBetweenMatches: 2,
    });
  }
}
