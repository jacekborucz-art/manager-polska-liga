
import { Club, ReserveFixture } from '../types';

const SEASON_START_MONTH = 7; // sierpień (0-indexed)
const SEASON_START_DAY = 1;
const WINTER_BREAK_START_MONTH = 11; // grudzień
const WINTER_BREAK_START_DAY = 1;
const SECOND_HALF_START_MONTH = 2; // marzec
const SECOND_HALF_START_DAY = 1;
const SEASON_END_MONTH = 5; // czerwiec
const SEASON_END_DAY = 30;
const MAX_OPPONENTS = 17;

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function firstSaturdayOnOrAfter(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const daysToSat = day === 6 ? 0 : (6 - day);
  d.setDate(d.getDate() + daysToSat);
  return d;
}

function isInWinterBreak(date: Date): boolean {
  const m = date.getMonth();
  const d = date.getDate();
  if (m === 11 && d >= WINTER_BREAK_START_DAY) return true;
  if (m === 0) return true;
  if (m === 1) return true;
  if (m === 2 && d < SECOND_HALF_START_DAY) return true;
  return false;
}

function isAfterSeasonEnd(date: Date, year: number): boolean {
  if (date.getFullYear() > year + 1) return true;
  if (date.getFullYear() === year + 1 && date.getMonth() > SEASON_END_MONTH) return true;
  if (date.getFullYear() === year + 1 && date.getMonth() === SEASON_END_MONTH && date.getDate() > SEASON_END_DAY) return true;
  return false;
}

export const ReserveScheduleService = {
  generate(
    userClub: Club,
    allPolishClubs: Club[],
    season: number,
    seed: number
  ): ReserveFixture[] {
    const userTier = userClub.tier ?? 1;
    const maxTier = Math.max(...allPolishClubs.map(c => c.tier ?? 1));

    let lowerTier: number;
    let upperTier: number;
    if (userTier < maxTier) {
      lowerTier = userTier + 1;
      upperTier = userTier;
    } else {
      lowerTier = userTier;
      upperTier = userTier - 1 > 0 ? userTier - 1 : userTier;
    }

    const pool = allPolishClubs.filter(c =>
      c.id !== userClub.id &&
      (c.tier === upperTier || c.tier === lowerTier)
    );

    const shuffled = seededShuffle(pool, seed);
    const opponents = shuffled.slice(0, MAX_OPPONENTS);

    const fixtures: ReserveFixture[] = [];
    const seasonYear = season + 2024;

    // Runda 1: sierpień → przerwa zimowa (głównie soboty, co 4. mecz w środę)
    let weekSat1 = firstSaturdayOnOrAfter(new Date(seasonYear, SEASON_START_MONTH, SEASON_START_DAY));
    for (let i = 0; i < opponents.length; i++) {
      while (isInWinterBreak(weekSat1)) {
        weekSat1.setDate(weekSat1.getDate() + 7);
      }

      const matchDate1 = new Date(weekSat1);
      if (i % 4 === 3) {
        matchDate1.setDate(matchDate1.getDate() - 3); // środa zamiast soboty
        if (isInWinterBreak(matchDate1)) {
          matchDate1.setDate(matchDate1.getDate() + 3); // fallback na sobotę
        }
      }
      if (isInWinterBreak(matchDate1)) break;

      fixtures.push({
        id: `res_r1_${season}_${i}`,
        date: matchDate1.toISOString(),
        isHome: i % 2 === 0,
        opponentClubId: opponents[i].id,
        opponentClubName: opponents[i].name,
        round: 1,
      });
      weekSat1.setDate(weekSat1.getDate() + 7);
    }

    // Runda 2: marzec → koniec czerwca, odwrócone dom/wyjazd (głównie soboty, co 4. mecz w środę)
    let weekSat2 = firstSaturdayOnOrAfter(new Date(seasonYear + 1, SECOND_HALF_START_MONTH, SECOND_HALF_START_DAY));
    for (let i = 0; i < opponents.length; i++) {
      const matchDate2 = new Date(weekSat2);
      if (i % 4 === 3) {
        matchDate2.setDate(matchDate2.getDate() - 3); // środa zamiast soboty
        if (isInWinterBreak(matchDate2)) {
          matchDate2.setDate(matchDate2.getDate() + 3); // fallback na sobotę
        }
      }
      if (isAfterSeasonEnd(matchDate2, seasonYear)) break;

      fixtures.push({
        id: `res_r2_${season}_${i}`,
        date: matchDate2.toISOString(),
        isHome: i % 2 !== 0,
        opponentClubId: opponents[i].id,
        opponentClubName: opponents[i].name,
        round: 2,
      });
      weekSat2.setDate(weekSat2.getDate() + 7);
    }

    return fixtures;
  },
};
