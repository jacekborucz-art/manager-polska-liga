import { Player, Club, PendingNegotiation, NegotiationStatus } from '../types';

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const getClubTier = (club: Club): number => {
  if (typeof club.tier === 'number' && Number.isFinite(club.tier)) {
    return club.tier;
  }

  const parsedTier = Number((club.leagueId || '').split('_')[2]);
  return Number.isFinite(parsedTier) && parsedTier > 0 ? parsedTier : 4;
};

const getSquadAverageOverall = (squad: Player[]): number =>
  squad.length > 0
    ? squad.reduce((sum, player) => sum + player.overallRating, 0) / squad.length
    : 0;

const getSquadTopOverall = (squad: Player[]): number =>
  squad.length > 0
    ? squad.reduce((best, player) => Math.max(best, player.overallRating), 0)
    : 0;

const getRealisticClubCeiling = (club: Club, player: Player, squad: Player[]): number => {
  const tier = getClubTier(club);
  const samePosition = squad
    .filter(squadPlayer => squadPlayer.position === player.position)
    .sort((a, b) => b.overallRating - a.overallRating);

  const squadAverage = getSquadAverageOverall(squad);
  const squadTop = getSquadTopOverall(squad);
  const bestSamePosition = samePosition[0]?.overallRating ?? 0;
  const fallbackSquadBase = 41 + club.reputation * 2.6 - (tier - 1) * 4.2;
  const stadiumBoost = clamp((Math.log10(Math.max(club.stadiumCapacity, 1000)) - 3.0) * 4.2, 0, 6.5);
  const prestigeCeiling = 44 + club.reputation * 2.15 + stadiumBoost - (tier - 1) * 5.6;
  const squadCeiling = Math.max(
    squadAverage > 0 ? squadAverage + 8 : fallbackSquadBase,
    bestSamePosition > 0 ? bestSamePosition + 4 : fallbackSquadBase,
    squadTop > 0 ? squadTop + 1 : fallbackSquadBase
  );

  let realisticCeiling = Math.max(prestigeCeiling, squadCeiling);

  if (tier === 1) realisticCeiling += 1.5;
  if (club.reputation >= 9) realisticCeiling += 1.5;
  if (player.age >= 30) realisticCeiling += 2;
  if (player.age >= 33) realisticCeiling += 2;
  if (player.age >= 36) realisticCeiling += 2;

  return realisticCeiling;
};

export const FreeAgentNegotiationService = {
  getClubLockoutUntil: (player: Player, clubId: string | null | undefined, currentDate: Date): string | null => {
    if (!clubId) return null;

    const lockoutUntil = player.freeAgentClubLockouts?.[clubId];
    if (!lockoutUntil) return null;

    const today = new Date(currentDate).setHours(0, 0, 0, 0);
    const lockoutDate = new Date(lockoutUntil).setHours(0, 0, 0, 0);
    return today < lockoutDate ? lockoutUntil : null;
  },

  isClubLockedOut: (player: Player, clubId: string | null | undefined, currentDate: Date): boolean => {
    return !!FreeAgentNegotiationService.getClubLockoutUntil(player, clubId, currentDate);
  },

  buildClubLockouts: (
    currentLockouts: Record<string, string> | undefined,
    clubId: string,
    lockoutUntil: string
  ): Record<string, string> => {
    return {
      ...(currentLockouts || {}),
      [clubId]: lockoutUntil
    };
  },

  evaluateInitialInterest: (player: Player, club: Club, squad: Player[] = []): { interested: boolean, message: string } => {
    const tier = getClubTier(club);

    if (player.overallRating > 69 && club.reputation < 5) {
      if (Math.random() > 0.01) {
        return {
          interested: false,
          message: 'Moj klient nie jest zainteresowany gra na tym poziomie rozgrywkowym. Szukamy klubu o wiekszej renomie.'
        };
      }
    }

    const realisticCeiling = getRealisticClubCeiling(club, player, squad);
    const excessOverCeiling = player.overallRating - realisticCeiling;

    if (tier >= 2 && player.overallRating >= 82 && player.age <= 32 && excessOverCeiling >= 4) {
      return {
        interested: false,
        message: 'Moj klient uwaza, ze ten ruch bylby zbyt duzym krokiem w dol pod wzgledem poziomu ligi i projektu sportowego.'
      };
    }

    if (excessOverCeiling >= 9 && player.age <= 32) {
      return {
        interested: false,
        message: 'Moj klient szuka projektu sportowego blizszego jego obecnym ambicjom. Na ten moment roznica poziomu jest zbyt duza.'
      };
    }

    if (excessOverCeiling > 0) {
      const chance = clamp(
        0.72 -
          excessOverCeiling * 0.10 +
          (tier === 1 ? 0.08 : 0) +
          (club.reputation >= 8 ? 0.05 : 0) +
          (player.age >= 33 ? 0.12 : player.age >= 30 ? 0.06 : 0) -
          (tier >= 3 ? 0.10 : 0),
        0.01,
        0.70
      );

      if (Math.random() > chance) {
        return {
          interested: false,
          message: player.age >= 33
            ? 'Moj klient rozwazy jeszcze podobne kierunki, ale oczekuje klubu z mocniejszym argumentem sportowym.'
            : 'Moj klient celuje w klub, w ktorym poziom ligi i jakosc kadry beda blizsze jego aktualnej klasie.'
        };
      }
    }

    const isPolishClub = club.leagueId?.startsWith('L_PL_');
    if (isPolishClub && player.overallRating > 82) {
      const chance = 0.50 - (player.overallRating - 83) * (0.49 / 16);
      if (Math.random() > chance) {
        return {
          interested: false,
          message: 'Moj klient rozwaza wylacznie oferty z silniejszych lig. Poziom rozgrywkowy jest dla niego niewystarczajacy.'
        };
      }
    }

    return { interested: true, message: '' };
  },

  createNegotiationEntry: (player: Player, club: Club, salary: number, bonus: number, years: number, currentDate: Date, squad: Player[]): PendingNegotiation => {
    const avgSalary = squad.length > 0 ? squad.reduce((sum, currentPlayer) => sum + currentPlayer.annualSalary, 0) / squad.length : 120000;
    const expected = player.overallRating * 2000;
    const rating = salary / expected;

    let daysToWait = 2;
    if (rating < 0.5) daysToWait = 1;
    else if (rating < 0.9) daysToWait = 7 + Math.floor(Math.random() * 7);
    else daysToWait = 3 + Math.floor(Math.random() * 3);

    const responseDate = new Date(currentDate);
    responseDate.setDate(responseDate.getDate() + daysToWait);

    return {
      id: `NEG_${Date.now()}_${player.id}`,
      playerId: player.id,
      clubId: club.id,
      salary,
      bonus,
      years,
      responseDate: responseDate.toISOString(),
      status: NegotiationStatus.PENDING
    };
  }
};
