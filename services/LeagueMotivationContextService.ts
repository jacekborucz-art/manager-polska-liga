import type { Club, Fixture } from '../types';
import { getFixtureRoundNumber } from './MatchPressureService';

export type LeagueMotivationContext =
  | 'LAST_ROUND_GENERAL'
  | 'TITLE_OR_PROMOTION_SECURED'
  | 'TITLE_DECIDER'
  | 'DIRECT_PROMOTION_DECIDER'
  | 'PLAYOFF_PLACE_DECIDER'
  | 'RELEGATION_DECIDER'
  | 'EUROPE_PLACE_DECIDER'
  | 'ALREADY_RELEGATED';

export interface LeagueMotivationInput {
  fixture: Fixture;
  userClub: Club;
  opponentClub: Club;
  standings: Club[];
  fixtures: Fixture[];
}

const DIRECT_PROMOTION_PLACES = 2;
const PROMOTION_PLAYOFF_LAST_PLACE = 6;

const getRelegationPlaces = (leagueId: string, teamCount: number): number => {
  if (leagueId === 'L_PL_3') return Math.min(4, teamCount - 1);
  return Math.min(3, teamCount - 1);
};

const isEkstraklasa = (leagueId: string): boolean => leagueId === 'L_PL_1';

const getRemainingMatchesIncludingCurrent = (fixtures: Fixture[], leagueId: string, clubId: string): number =>
  fixtures.filter(fixture =>
    fixture.leagueId === leagueId &&
    fixture.status !== 'FINISHED' &&
    (fixture.homeTeamId === clubId || fixture.awayTeamId === clubId)
  ).length;

const sortStandings = (clubs: Club[]): Club[] =>
  [...clubs].sort((a, b) =>
    b.stats.points - a.stats.points ||
    b.stats.goalDifference - a.stats.goalDifference ||
    b.stats.goalsFor - a.stats.goalsFor
  );

export const detectLeagueMotivationContext = ({
  fixture,
  userClub,
  opponentClub,
  standings,
  fixtures,
}: LeagueMotivationInput): LeagueMotivationContext | null => {
  if (typeof fixture.leagueId !== 'string') return null;

  const leagueId = fixture.leagueId;
  const table = sortStandings(standings);
  const teamCount = table.length;
  const rank = table.findIndex(club => club.id === userClub.id) + 1;
  if (rank <= 0 || teamCount < 4) return null;

  const roundNumber = getFixtureRoundNumber(fixture, userClub, opponentClub);
  const remainingIncludingCurrent = getRemainingMatchesIncludingCurrent(fixtures, leagueId, userClub.id);
  const remainingAfterCurrent = Math.max(0, remainingIncludingCurrent - 1);
  const isFinalMatch = remainingIncludingCurrent <= 1 || roundNumber >= Math.max(1, (teamCount - 1) * 2);
  const points = userClub.stats.points;

  const relegationPlaces = getRelegationPlaces(leagueId, teamCount);
  const safetyRank = Math.max(1, teamCount - relegationPlaces);
  const safetyClub = table[safetyRank - 1];
  const canStillReachSafety = safetyClub ? points + remainingIncludingCurrent * 3 >= safetyClub.stats.points : true;

  if (!canStillReachSafety) return 'ALREADY_RELEGATED';

  if (isEkstraklasa(leagueId)) {
    const runnerUp = table[1];
    const titleSecured = rank === 1 && runnerUp && points > runnerUp.stats.points + remainingIncludingCurrent * 3;
    const titleCanBeSecured = rank === 1 && runnerUp && points + 3 > runnerUp.stats.points + remainingAfterCurrent * 3;
    const drawLikelyEnoughForTitle = rank === 1 && runnerUp && points + 1 >= runnerUp.stats.points + remainingAfterCurrent * 3;

    if (titleSecured) return 'TITLE_OR_PROMOTION_SECURED';
    if (titleCanBeSecured || (isFinalMatch && drawLikelyEnoughForTitle)) return 'TITLE_DECIDER';

    if (rank >= 2 && rank <= 5 && (isFinalMatch || roundNumber >= 29)) return 'EUROPE_PLACE_DECIDER';
  } else {
    const secondPlace = table[DIRECT_PROMOTION_PLACES - 1];
    const thirdPlace = table[DIRECT_PROMOTION_PLACES];
    const seventhPlace = table[PROMOTION_PLAYOFF_LAST_PLACE];
    const promotionSecured = rank <= DIRECT_PROMOTION_PLACES &&
      thirdPlace &&
      points > thirdPlace.stats.points + remainingIncludingCurrent * 3;
    const directPromotionCanBeSecured =
      rank <= DIRECT_PROMOTION_PLACES
        ? !!thirdPlace && points + 3 >= thirdPlace.stats.points + remainingAfterCurrent * 3
        : rank === DIRECT_PROMOTION_PLACES + 1 &&
          !!secondPlace &&
          points + 3 >= secondPlace.stats.points + remainingAfterCurrent * 3;
    const playoffPlaceCanBeSecured = rank >= 3 &&
      rank <= PROMOTION_PLAYOFF_LAST_PLACE + 2 &&
      seventhPlace &&
      points + 3 >= seventhPlace.stats.points + remainingAfterCurrent * 3;

    if (promotionSecured) return 'TITLE_OR_PROMOTION_SECURED';
    if (directPromotionCanBeSecured) return 'DIRECT_PROMOTION_DECIDER';
    if (playoffPlaceCanBeSecured && (isFinalMatch || roundNumber >= 29)) return 'PLAYOFF_PLACE_DECIDER';
  }

  if (rank >= safetyRank - 2 && (isFinalMatch || roundNumber >= 29)) return 'RELEGATION_DECIDER';
  if (isFinalMatch) return 'LAST_ROUND_GENERAL';

  return null;
};

export const getLeagueMotivationContextLabel = (context: LeagueMotivationContext | null | undefined): string | null => {
  if (!context) return null;
  if (context === 'LAST_ROUND_GENERAL') return 'OSTATNI MECZ SEZONU';
  if (context === 'TITLE_OR_PROMOTION_SECURED') return 'CEL JUŻ OSIĄGNIĘTY';
  if (context === 'TITLE_DECIDER') return 'MECZ O MISTRZOSTWO';
  if (context === 'DIRECT_PROMOTION_DECIDER') return 'MECZ O AWANS';
  if (context === 'PLAYOFF_PLACE_DECIDER') return 'MECZ O BARAŻE';
  if (context === 'RELEGATION_DECIDER') return 'WALKA O UTRZYMANIE';
  if (context === 'EUROPE_PLACE_DECIDER') return 'WALKA O PUCHARY';
  return 'SPADEK PRZESĄDZONY';
};
