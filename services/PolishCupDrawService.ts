import { Club, Fixture, MatchStatus, CompetitionType } from '../types';
import { PolishThirdLeagueService } from './PolishThirdLeagueService';
import { PolishFourthLeagueService } from './PolishFourthLeagueService';

/**
 * A stable fixture-side marker used only when an odd number of valid clubs
 * reaches a draw. It is deliberately not a generated Club: the real club on
 * the other side receives a bye and remains in the competition, while normal
 * squad, finance and statistics systems never see a fictional participant.
 */
export const POLISH_CUP_BYE_TEAM_ID = 'POLISH_CUP_BYE';

const createSeededRandom = (seedText: string): (() => number) => {
  let hash = 0;
  for (let i = 0; i < seedText.length; i++) {
    hash = ((hash << 5) - hash) + seedText.charCodeAt(i);
    hash |= 0;
  }

  return () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
};

const shuffleWithSeed = <T>(items: T[], seedText: string): T[] => {
  const shuffled = [...items];
  const seededRandom = createSeededRandom(seedText);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const PolishCupDrawService = {
  /**
   * Przygotowuje listę 128 uczestników dla rundy 1/64.
   */
  getInitialParticipants: (clubs: Club[], sessionSeed: number, seasonStartYear: number): string[] => {
    const tier1 = clubs.filter(c => c.leagueId === 'L_PL_1').map(c => c.id);
    const tier2 = clubs.filter(c => c.leagueId === 'L_PL_2').map(c => c.id);
    const tier3 = clubs.filter(c => c.leagueId === 'L_PL_3').map(c => c.id);
    const thirdLeaguePool = clubs.filter(c =>
      PolishThirdLeagueService.isThirdLeagueId(c.leagueId) || c.leagueId === 'L_PL_4'
    );

    // Wszystkie kluby trzech najwyższych lig mają gwarantowane miejsce.
    // Pozostałe miejsca do 128 są losowane z całej puli L_PL_4. Ziarno kariery
    // i sezonu zapewnia inne zestawy w różnych grach, ale stabilny wynik po LOAD.
    const guaranteedCount = tier1.length + tier2.length + tier3.length;
    const tier4Places = Math.max(0, 128 - guaranteedCount);
    const selectedThirdLeague = shuffleWithSeed(
      thirdLeaguePool,
      `POLISH_CUP_INITIAL_${seasonStartYear}_${sessionSeed}`
    )
      .slice(0, tier4Places)
      .map(c => c.id);

    /**
     * The four-group third tier contains 72 clubs, while the 128-team cup needs
     * 74 entrants below the top three playable divisions. Older data used one
     * large L_PL_4 pool and therefore hid this shortage. Fill only the missing
     * places from the sixteen voivodeship fourth leagues. Keeping this as a
     * second seeded draw preserves the old selection whenever the primary pool
     * is already large enough and makes datapack order irrelevant.
     */
    const missingAfterThirdLeague = Math.max(0, tier4Places - selectedThirdLeague.length);
    const alreadySelected = new Set([...tier1, ...tier2, ...tier3, ...selectedThirdLeague]);
    const fourthLeagueCandidates = clubs.filter(club =>
      PolishFourthLeagueService.isFourthLeagueId(club.leagueId) && !alreadySelected.has(club.id)
    );
    const selectedFourthLeague = shuffleWithSeed(
      fourthLeagueCandidates,
      `POLISH_CUP_FOURTH_LEAGUE_${seasonStartYear}_${sessionSeed}`
    )
      .slice(0, missingAfterThirdLeague)
      .map(club => club.id);

    // The feeder pools are a last-resort compatibility source for incomplete
    // or heavily modified datapacks. In the standard 2026/27 database they are
    // never needed because the regional fourth leagues provide ample clubs.
    const missingAfterFourthLeague = Math.max(
      0,
      tier4Places - selectedThirdLeague.length - selectedFourthLeague.length
    );
    const selectedBeforeFeeder = new Set([
      ...alreadySelected,
      ...selectedFourthLeague,
    ]);
    const feederCandidates = clubs.filter(club =>
      PolishFourthLeagueService.isFourthLeagueFeederId(club.leagueId) &&
      !selectedBeforeFeeder.has(club.id)
    );
    const selectedFeeders = shuffleWithSeed(
      feederCandidates,
      `POLISH_CUP_FEEDER_FALLBACK_${seasonStartYear}_${sessionSeed}`
    )
      .slice(0, missingAfterFourthLeague)
      .map(club => club.id);

    return [
      ...tier1,
      ...tier2,
      ...tier3,
      ...selectedThirdLeague,
      ...selectedFourthLeague,
      ...selectedFeeders,
    ];
  },

  /**
   * Losuje pary z podanej listy uczestników.
   * Używa prostego generatora pseudo-losowego z ziarnem (seed), aby wynik był stały dla danej rundy w danym dniu.
   */
  drawPairs: (participantIds: string[], clubs: Club[], date: Date, roundLabel: string, sessionSeed: number): Fixture[] => {
    // Iniekcja unikalnego ziarna sesji dla pełnej losowości przy każdym starcie nowej gry
    const seededRandom = createSeededRandom(roundLabel + date.getFullYear() + sessionSeed);

    // Fisher-Yates Shuffle (Senior Grade) - eliminuje bias standardowego sortowania
    const validClubIds = new Set(clubs.map(club => club.id));
    const uniqueParticipantIds = Array.from(new Set(participantIds)).filter(id => validClubIds.has(id));
    const shuffled = [...uniqueParticipantIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const fixtures: Fixture[] = [];

    const getTierValue = (clubId: string) => {
      const c = clubs.find(x => x.id === clubId);
      if (!c) return 4;
      if (c.leagueId === 'L_PL_1') return 1;
      if (c.leagueId === 'L_PL_2') return 2;
      if (c.leagueId === 'L_PL_3') return 3;
      return 4;
    };

    const isEkstraklasa = (clubId: string) => getTierValue(clubId) === 1;

    if (roundLabel.includes('1/64')) {
      for (let i = 0; i < shuffled.length; i += 2) {
        const teamA = shuffled[i];
        const teamB = shuffled[i + 1];

        if (!teamA || !teamB || !isEkstraklasa(teamA) || !isEkstraklasa(teamB)) continue;

        for (let j = i + 2; j < shuffled.length; j++) {
          if (!isEkstraklasa(shuffled[j])) {
            [shuffled[i + 1], shuffled[j]] = [shuffled[j], shuffled[i + 1]];
            break;
          }
        }
      }
    }

    const cleanRoundLabel = roundLabel.replace("LOSOWANIE ", "");

    for (let i = 0; i < shuffled.length; i += 2) {
      const teamA = shuffled[i];
      const teamB = shuffled[i + 1];

      /**
       * A malformed legacy save or an incomplete datapack can leave an odd
       * field. Creating a scheduled fixture with an undefined away id used to
       * crash the Polish Cup processor. A completed 1:0 bye fixture keeps the
       * bracket explicit, consumes no match RNG and leaves teamA qualified.
       */
      if (teamA && !teamB) {
        fixtures.push({
          id: `CUP_${cleanRoundLabel.replace(/\s+/g, '_')}_${i}`,
          leagueId: CompetitionType.POLISH_CUP,
          homeTeamId: teamA,
          awayTeamId: POLISH_CUP_BYE_TEAM_ID,
          date: new Date(date),
          status: MatchStatus.FINISHED,
          homeScore: 1,
          awayScore: 0,
        });
        continue;
      }

      if (!teamA || !teamB) continue;

      const tierA = getTierValue(teamA);
      const tierB = getTierValue(teamB);

      let homeTeamId = teamA;
      let awayTeamId = teamB;

      // Zasada: Niższa liga gości wyższą ligę (standard pucharowy)
      if (tierA > tierB) {
        homeTeamId = teamA;
        awayTeamId = teamB;
      } else if (tierB > tierA) {
        homeTeamId = teamB;
        awayTeamId = teamA;
      }

      fixtures.push({
        id: `CUP_${cleanRoundLabel.replace(/\s+/g, '_')}_${i}`,
        leagueId: CompetitionType.POLISH_CUP,
        homeTeamId,
        awayTeamId,
        date: new Date(date),
        status: MatchStatus.SCHEDULED,
        homeScore: null,
        awayScore: null
      });
    }

    return fixtures;
  }
};
