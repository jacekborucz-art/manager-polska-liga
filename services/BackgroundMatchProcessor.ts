
import { Fixture, Club, Player, MatchStatus, Lineup, CompetitionType, LeagueRoundResults, MatchResult, HealthStatus, InjurySeverity, Referee, WeatherSnapshot, Coach, AiTransferLogEntry } from '../types';
import { DebugLoggerService } from './DebugLoggerService';
import { LeagueBackgroundMatchEngineV2 } from './LeagueBackgroundMatchEngine-ver2';
import { RefereeService } from './RefereeService';
import { PlayerStatsService } from './PlayerStatsService';
import { MatchHistoryService } from './MatchHistoryService';
import { AiMatchPreparationService } from './AiMatchPreparationService';
import { AiContractService } from './AiContractService';
import { MatchEventType } from '../types';
import { AttendanceService } from './AttendanceService';
import { PolandWeatherService } from './PolandWeatherService';
import { FinanceService } from './FinanceService';
import { PendingNegotiation } from '@/types';
import { AiScoutingService } from './AiScoutingService';
import { buildMatchPressureContext } from './MatchPressureService';
import { SeasonTransitionService } from './SeasonTransitionService';
import { PlayerMoraleService } from './PlayerMoraleService';
import { ThirdLeagueBackgroundService } from './ThirdLeagueBackgroundService';

const formatPlayerReportName = (player: Pick<Player, 'firstName' | 'lastName'>): string => {
  const lastName = player.lastName.trim();
  return lastName ? `${player.firstName.charAt(0)}. ${lastName}` : player.firstName;
};

const clampAiMatchMoraleDelta = (delta: number): number => Math.max(-10, Math.min(10, delta));

const getLossCrisisPenalty = (form: ('W' | 'R' | 'P')[], resultChar: 'W' | 'R' | 'P'): number => {
  if (resultChar !== 'P') return 0;

  const lossesInLastFive = form.filter(result => result === 'P').length;
  if (lossesInLastFive >= 5) return -10;
  if (lossesInLastFive >= 4) return -7;
  if (lossesInLastFive >= 3) return -4;
  return 0;
};

const applyAiMatchMoraleToClub = (
  playersMap: Record<string, Player[]>,
  clubId: string,
  initialSquad: Player[],
  playedPlayerIds: string[],
  scorers: { playerId: string; assistId?: string; isMiss?: boolean }[],
  cards: { playerId: string; type: MatchEventType }[],
  ratings: Record<string, number>,
  resultChar: 'W' | 'R' | 'P',
  scoreDiff: number,
  coach: Coach,
  recentForm: ('W' | 'R' | 'P')[] | undefined,
  currentDate: Date
): Record<string, Player[]> => {
  const squad = playersMap[clubId] || [];
  if (squad.length === 0) return playersMap;

  const playedIds = new Set(playedPlayerIds.filter(id => initialSquad.some(player => player.id === id)));
  const motivation = coach?.attributes?.motivation ?? 50;
  const motivationModifier = Math.max(-2, Math.min(2, Math.round((motivation - 50) / 25)));
  const formAfterMatch = [...(recentForm || []), resultChar].slice(-5) as ('W' | 'R' | 'P')[];
  const lossCrisisPenalty = getLossCrisisPenalty(formAfterMatch, resultChar);
  const baseDelta = resultChar === 'W'
    ? (scoreDiff >= 2 ? 5 : 3)
    : resultChar === 'P'
      ? (scoreDiff <= -3 ? -6 : -3)
      : 0;
  const teamDelta = baseDelta === 0
    ? Math.round(motivationModifier * 0.35)
    : baseDelta + motivationModifier + lossCrisisPenalty;

  const nextSquad = squad.map(player => {
    const withMorale = PlayerMoraleService.ensurePlayerState(player);
    const played = playedIds.has(player.id);
    const rating = ratings[player.id];
    const goals = scorers.filter(goal => goal.playerId === player.id && !goal.isMiss).length;
    const missedPenalties = scorers.filter(goal => goal.playerId === player.id && goal.isMiss).length;
    const assists = scorers.filter(goal => goal.assistId === player.id && !goal.isMiss).length;
    const playerCards = cards.filter(card => card.playerId === player.id);
    const yellowCards = playerCards.filter(card => card.type === MatchEventType.YELLOW_CARD).length;
    const redCards = playerCards.filter(card => card.type === MatchEventType.RED_CARD).length;

    let delta = played ? teamDelta : Math.round(teamDelta * 0.35);

    if (typeof rating === 'number') {
      if (rating >= 8.0) delta += 3;
      else if (rating >= 7.0) delta += 1;
      else if (rating <= 4.5) delta -= 4;
      else if (rating <= 5.5) delta -= 2;
    }

    delta += goals * 3;
    delta += assists * 2;
    delta -= missedPenalties * 3;
    delta -= yellowCards;
    delta -= redCards * 4;

    if (!played && player.squadRole === 'KEY_PLAYER') delta -= 2;
    else if (!played && player.squadRole === 'STARTER') delta -= 1;

    delta = clampAiMatchMoraleDelta(delta);
    const reason = resultChar === 'W'
      ? 'Mecz AI: zwycięstwo i występ zawodnika'
      : resultChar === 'P'
        ? 'Mecz AI: porażka i występ zawodnika'
        : 'Mecz AI: remis i występ zawodnika';

    return PlayerMoraleService.withMoraleChange(withMorale, delta, reason, currentDate);
  });

  return {
    ...playersMap,
    [clubId]: nextSquad,
  };
};

const ensureEmergencyGoalkeepers = (
  clubs: Club[],
  playersMap: Record<string, Player[]>,
  fixtures: Fixture[],
  currentDate: Date,
  userTeamId: string | null
): Record<string, Player[]> => {
  const isEuropeanCompetition = (leagueId: string): boolean =>
    leagueId === CompetitionType.EURO_CUP ||
    leagueId === CompetitionType.UEFA_SUPER_CUP ||
    leagueId.startsWith('CL_') ||
    leagueId.startsWith('EL_') ||
    leagueId.startsWith('CONF_');

  const isGoalkeeperAvailableForFixture = (player: Player, fixture: Fixture): boolean => {
    if (player.position !== 'GK') return false;
    if (player.health.status === HealthStatus.INJURED) return false;

    if (fixture.leagueId === CompetitionType.POLISH_CUP) {
      return (player.cupSuspensionMatches || 0) <= 0;
    }

    if (isEuropeanCompetition(String(fixture.leagueId))) {
      return (player.euroSuspensionMatches || 0) <= 0;
    }

    return (player.suspensionMatches || 0) <= 0;
  };

  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const clubFixturesInThreeDays = new Map<string, Fixture[]>();
  fixtures
    .filter(f => f.status === MatchStatus.SCHEDULED)
    .forEach(fixture => {
      const matchDate = new Date(fixture.date);
      matchDate.setHours(0, 0, 0, 0);
      const daysUntilMatch = Math.round((matchDate.getTime() - today.getTime()) / 86_400_000);
      if (daysUntilMatch === 3) {
        clubFixturesInThreeDays.set(fixture.homeTeamId, [...(clubFixturesInThreeDays.get(fixture.homeTeamId) || []), fixture]);
        clubFixturesInThreeDays.set(fixture.awayTeamId, [...(clubFixturesInThreeDays.get(fixture.awayTeamId) || []), fixture]);
      }
    });

  if (clubFixturesInThreeDays.size === 0) return playersMap;

  let updatedPlayers = { ...playersMap };

  for (const [clubId, upcomingFixtures] of clubFixturesInThreeDays.entries()) {
    if (clubId === userTeamId) continue;

    const club = clubs.find(c => c.id === clubId);
    const squad = updatedPlayers[clubId] || [];
    if (!club || upcomingFixtures.every(fixture => squad.some(p => isGoalkeeperAvailableForFixture(p, fixture)))) continue;

    const averageOverall = squad.length > 0
      ? Math.round(squad.reduce((sum, p) => sum + p.overallRating, 0) / squad.length)
      : 49;
    const targetOverall = averageOverall - 4;
    const tier = club.leagueId === 'L_PL_1'
      ? 1
      : club.leagueId === 'L_PL_2'
        ? 2
        : club.leagueId === 'L_PL_3'
          ? 3
          : 4;
    const emergencyGoalkeeper = SeasonTransitionService.generateEmergencyGK(
      club.id,
      tier,
      club.reputation,
      targetOverall,
      currentDate
    );

    updatedPlayers = {
      ...updatedPlayers,
      [clubId]: [...squad, emergencyGoalkeeper],
    };
  }

  return updatedPlayers;
};

export const BackgroundMatchProcessor = {
  processLeagueEvent: (
    currentDate: Date,
    userTeamId: string | null,
    fixtures: Fixture[],
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    lineups: Record<string, Lineup>,
    seasonNumber: number,
    coaches: Record<string, Coach>,
    // Opcjonalne ziarno sesji — używane przez scouting transferowy.
    // Jeśli nie podane, scouting działa z seed=0 (mniej różnorodny, ale funkcjonalny).
    sessionSeed: number = 0
  ): {
    updatedFixtures: Fixture[],
    updatedClubs: Club[],
    updatedPlayers: Record<string, Player[]>,
    updatedLineups: Record<string, Lineup>,
    newOffers: PendingNegotiation[],
    roundResults: LeagueRoundResults | null,
    seasonNumber: number,
    ratings: Record<string, number>,
    aiTransferLogEntries: AiTransferLogEntry[],
  } => {
    
       const dateStr = currentDate.toDateString();
    const CL_COMPETITION_IDS = new Set([
      CompetitionType.CL_R1Q, CompetitionType.CL_R1Q_RETURN,
      CompetitionType.CL_R2Q, CompetitionType.CL_R2Q_RETURN,
      CompetitionType.CL_GROUP_DRAW, CompetitionType.CL_GROUP_STAGE,
      CompetitionType.CHAMPIONS_LEAGUE_DRAW,
      CompetitionType.CL_R16_DRAW, CompetitionType.CL_R16, CompetitionType.CL_R16_RETURN,
      CompetitionType.CL_QF_DRAW, CompetitionType.CL_QF, CompetitionType.CL_QF_RETURN,
      CompetitionType.CL_SF_DRAW, CompetitionType.CL_SF, CompetitionType.CL_SF_RETURN,
      CompetitionType.CL_FINAL_DRAW, CompetitionType.CL_FINAL,
      CompetitionType.EL_R1Q_DRAW, CompetitionType.EL_R1Q, CompetitionType.EL_R1Q_RETURN,
      CompetitionType.EL_R2Q_DRAW, CompetitionType.EL_R2Q, CompetitionType.EL_R2Q_RETURN,
      CompetitionType.EL_GROUP_DRAW, CompetitionType.EL_GROUP_STAGE,
      CompetitionType.EL_R16_DRAW, CompetitionType.EL_R16, CompetitionType.EL_R16_RETURN,
      CompetitionType.EL_QF_DRAW, CompetitionType.EL_QF, CompetitionType.EL_QF_RETURN,
      CompetitionType.EL_SF_DRAW, CompetitionType.EL_SF, CompetitionType.EL_SF_RETURN,
      CompetitionType.EL_FINAL_DRAW, CompetitionType.EL_FINAL,
      CompetitionType.CONF_R1Q_DRAW, CompetitionType.CONF_R1Q, CompetitionType.CONF_R1Q_RETURN,
      CompetitionType.CONF_R2Q_DRAW, CompetitionType.CONF_R2Q, CompetitionType.CONF_R2Q_RETURN,
      CompetitionType.CONF_GROUP_DRAW, CompetitionType.CONF_GROUP_STAGE,
      CompetitionType.CONF_R16_DRAW, CompetitionType.CONF_R16, CompetitionType.CONF_R16_RETURN,
      CompetitionType.CONF_QF_DRAW, CompetitionType.CONF_QF, CompetitionType.CONF_QF_RETURN,
      CompetitionType.CONF_SF_DRAW, CompetitionType.CONF_SF, CompetitionType.CONF_SF_RETURN,
      CompetitionType.CONF_FINAL_DRAW, CompetitionType.CONF_FINAL,
      CompetitionType.UEFA_SUPER_CUP,
    ]);
    const todayFixtures = fixtures.filter(f =>
      f.date.toDateString() === dateStr &&
      f.status === MatchStatus.SCHEDULED &&
      !CL_COMPETITION_IDS.has(f.leagueId as CompetitionType)
    );
    
    // DEBUG
    DebugLoggerService.log('BMP', `processLeagueEvent: ${dateStr} | SCHEDULED: ${todayFixtures.length} | TOTAL fixtures: ${fixtures.length}`, true);
    const playersAfterEmergencyGoalkeepers = ensureEmergencyGoalkeepers(clubs, playersMap, fixtures, currentDate, userTeamId);
    const newLineups = AiMatchPreparationService.prepareAllTeams(clubs, playersAfterEmergencyGoalkeepers, lineups, userTeamId, coaches);
if (todayFixtures.length === 0) {
      const contractUpdate = AiContractService.processClubsContracts(clubs, playersAfterEmergencyGoalkeepers, currentDate, userTeamId);
      const preContractUpdate = AiContractService.processAiPreContractOpportunities(contractUpdate.updatedClubs, contractUpdate.updatedPlayers, currentDate, userTeamId);
      const depthUpdate = AiContractService.processAiPrioritySquadDepth(contractUpdate.updatedClubs, preContractUpdate.updatedPlayers, currentDate, userTeamId);
      const recruitmentUpdate = AiContractService.processAiRecruitment(depthUpdate.updatedClubs, depthUpdate.updatedPlayers, currentDate, userTeamId);
      const resolvedUpdate = AiContractService.resolveAiFreeAgentNegotiations(recruitmentUpdate.updatedClubs, recruitmentUpdate.updatedPlayers, currentDate, userTeamId);
      const financingUpdate = AiContractService.processAiSquadFinancing(resolvedUpdate.updatedClubs, resolvedUpdate.updatedPlayers, currentDate, userTeamId);
      const transferSigningsUpdate = AiContractService.processAiTransferListSignings(financingUpdate.updatedClubs, financingUpdate.updatedPlayers, currentDate, userTeamId, coaches);
      const interestedTargetingUpdate = AiContractService.processAiInterestedPlayerTargeting(transferSigningsUpdate.updatedClubs, transferSigningsUpdate.updatedPlayers, currentDate, userTeamId, coaches);
      const transferResolvedUpdate = AiContractService.resolveAiTransferPending(interestedTargetingUpdate.updatedClubs, interestedTargetingUpdate.updatedPlayers, currentDate, userTeamId);

      const aiTransferLogEntries: AiTransferLogEntry[] = [
        ...recruitmentUpdate.logEntries,
        ...resolvedUpdate.logEntries,
        ...preContractUpdate.logEntries,
        ...transferSigningsUpdate.logEntries,
        ...interestedTargetingUpdate.logEntries,
        ...transferResolvedUpdate.logEntries,
      ];

      // Aktualizacja zainteresowań transferowych: 1. każdego miesiąca + 12 stycznia (otwarcie okna zimowego).
      // AI-kluby przeglądają rynek i aktualizują swoje listy obserwowanych zawodników.
      let scoutedClubs = transferResolvedUpdate.updatedClubs;
      let scoutedPlayers = transferResolvedUpdate.updatedPlayers;
      const isScoutingDay = currentDate.getDate() === 1 || (currentDate.getMonth() === 0 && currentDate.getDate() === 12);
      if (isScoutingDay) {
        scoutedPlayers = AiScoutingService.updateTransferInterests(
          scoutedClubs,
          scoutedPlayers,
          currentDate,
          userTeamId,
          sessionSeed
        );
        scoutedPlayers = AiContractService.processMonthlyPlayerReview(
          scoutedClubs,
          scoutedPlayers,
          currentDate,
          userTeamId
        ).updatedPlayers;
      }
      if (currentDate.getMonth() === 0 && currentDate.getDate() === 12) {
        const weakReviewWinter = AiContractService.processWeakPlayerContractCuts(scoutedClubs, scoutedPlayers, currentDate, userTeamId);
        scoutedClubs = weakReviewWinter.updatedClubs;
        scoutedPlayers = weakReviewWinter.updatedPlayers;
      }
      scoutedPlayers = AiContractService.enforceTransferListLimits(scoutedPlayers, currentDate, userTeamId);

      return {
        updatedFixtures: fixtures,
        updatedClubs: scoutedClubs,
        updatedPlayers: scoutedPlayers,
        updatedLineups: newLineups,
        newOffers: recruitmentUpdate.newOffers,
        seasonNumber: seasonNumber,
        roundResults: null,
        ratings: {},
        aiTransferLogEntries,
      };
    }

    // 1. Obliczamy rankingi dla wszystkich lig przed symulacją
    const getStandings = (leagueId: string) => {
      return [...clubs]
        .filter(c => c.leagueId === leagueId)
        .sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
    };

    const standingsMap: Record<string, Club[]> = {
      'L_PL_1': getStandings('L_PL_1'),
      'L_PL_2': getStandings('L_PL_2'),
      'L_PL_3': getStandings('L_PL_3'),
    };

    // 2. Generujemy pogodę dla całego dnia meczowego
    const weather = PolandWeatherService.getWeather(currentDate, currentDate.toDateString());
    
    let currentFixtures = [...fixtures];
    let currentClubs = [...clubs];
    let currentPlayers = ThirdLeagueBackgroundService.simulateMatchday(
      currentDate,
      currentClubs,
      playersAfterEmergencyGoalkeepers,
      newLineups,
      coaches,
      weather,
      sessionSeed
    );

    const roundResults: LeagueRoundResults = {
      dateKey: dateStr,
      league1Results: [],
      league2Results: [],
      league3Results: []
    };

    todayFixtures.forEach(fixture => {
      // Pomiń mecz gracza (widok MatchLiveView sam o to dba)
      if (fixture.homeTeamId === userTeamId || fixture.awayTeamId === userTeamId) return;

      const home = currentClubs.find(c => c.id === fixture.homeTeamId)!;
      const away = currentClubs.find(c => c.id === fixture.awayTeamId)!;
      const hPlayers = currentPlayers[home.id] || [];
      const aPlayers = currentPlayers[away.id] || [];
      const hLineup = newLineups[home.id];
      const aLineup = newLineups[away.id];

     if (!hLineup || !aLineup) return;

      const clubSalt = home.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const matchHash = fixture.id.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
      const reloadEntropy = Math.floor(Math.random() * 0x7fffffff);
      const seed = (matchHash ^ clubSalt) ^ (currentDate.getTime() / 1000 | 0) ^ sessionSeed ^ reloadEntropy;
      
      // --- PRZYGOTOWANIE DANYCH DLA V2 ---
      const hCoach = coaches[home.coachId || ''] || { attributes: { experience: 50, decisionMaking: 50, motivation: 50 } };
      const aCoach = coaches[away.coachId || ''] || { attributes: { experience: 50, decisionMaking: 50, motivation: 50 } };
      const assignedRef = RefereeService.assignPolishReferee(fixture.id, 3);
      const leagueStandings = standingsMap[fixture.leagueId as string] || [];
      const pressureContext = buildMatchPressureContext(fixture, home, away, leagueStandings, hCoach as Coach, aCoach as Coach);

      // --- WYBÓR SILNIKA (ODKOMENTUJ WŁAŚCIWY) ---
      
      // STARY SILNIK V1:
      // const result = LeagueBackgroundMatchEngine.simulate(fixture, home, away, hPlayers, aPlayers, hLineup, aLineup, seed);

      const hInitialXI = hLineup.startingXI.filter((id): id is string => id !== null);
      const aInitialXI = aLineup.startingXI.filter((id): id is string => id !== null);

      // NOWY SILNIK V2.0:
      const result = LeagueBackgroundMatchEngineV2.simulate(
        fixture, home, away, hPlayers, aPlayers, hLineup, aLineup,
        hCoach as any, aCoach as any, assignedRef, weather, seed, pressureContext
      );

      const yellowsInMatch = result.cards.filter(c => c.type === MatchEventType.YELLOW_CARD).length;
      const redsInMatch = result.cards.filter(c => c.type === MatchEventType.RED_CARD).length;
      const refereeRating = RefereeService.generateMatchRating(assignedRef);
      RefereeService.recordMatchStats(assignedRef.id, refereeRating, yellowsInMatch, redsInMatch);

      // Obliczamy miejsce gospodarza w tabeli
      const homeRank = leagueStandings.findIndex(c => c.id === home.id) + 1 || 10; 
      const attendance = AttendanceService.calculate(home, homeRank, weather, away);

      MatchHistoryService.logMatch({
        season: seasonNumber,
        matchId: fixture.id,
        date: currentDate.toDateString(),
        competition: fixture.leagueId,
        homeTeamId: home.id,
        awayTeamId: away.id,
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        attendance: attendance,
        refereeName: `${assignedRef.firstName} ${assignedRef.lastName}`,
        goals: result.scorers.map(s => {
          const p = (currentPlayers[home.id].concat(currentPlayers[away.id])).find(x => x.id === s.playerId);
          return {
            playerId: s.playerId,
            playerName: p ? formatPlayerReportName(p) : 'Nieznany',
            minute: s.minute,
            teamId: p ? p.clubId : '?',
            isPenalty: s.isPenalty,
            isMiss: s.isMiss,
            varDisallowed: s.varDisallowed
          };
        }),
        cards: (() => {
   // Logika filtrowania kartek: Jeśli zawodnik ma dostać drugą żółtą, raportujemy tylko Czerwoną (Stage 1 PRO)
          const playerMatchCards: Record<string, string[]> = {};
          const finalCards: any[] = [];

          result.cards.forEach(c => {
            const pId = c.playerId;
            if (!playerMatchCards[pId]) playerMatchCards[pId] = [];
            
            const p = (currentPlayers[home.id].concat(currentPlayers[away.id])).find(x => x.id === pId);
            const playerName = p ? formatPlayerReportName(p) : 'Nieznany';

            if (c.type === MatchEventType.YELLOW_CARD) {
              if (playerMatchCards[pId].includes('YELLOW')) {
                // To jest druga żółta -> zamień na czerwoną w statystyce i nie dodawaj żółtej
                finalCards.push({ playerId: pId, playerName, minute: c.minute, teamId: p?.clubId || '?', type: 'SECOND_YELLOW' });
              } else {
                playerMatchCards[pId].push('YELLOW');
                finalCards.push({ playerId: pId, playerName, minute: c.minute, teamId: p?.clubId || '?', type: 'YELLOW' });
              }
            } else {
              finalCards.push({ playerId: pId, playerName, minute: c.minute, teamId: p?.clubId || '?', type: 'RED' });
            }
          });
          return finalCards;
        })(),
        venue: home.stadiumName,
        weather: weather,
        homeLineup: hInitialXI,
        awayLineup: aInitialXI,
        ratings: result.ratings,
        homeTacticId: hLineup.tacticId,
        awayTacticId: aLineup.tacticId,
        substitutions: result.substitutions.map(s => {
          const allP = currentPlayers[home.id].concat(currentPlayers[away.id]);
          const pOut = allP.find(x => x.id === s.playerOutId);
          const pIn  = allP.find(x => x.id === s.playerInId);
          return {
            playerOutId: s.playerOutId,
            playerOutName: pOut ? formatPlayerReportName(pOut) : 'Nieznany',
            playerInId: s.playerInId,
            playerInName: pIn ? formatPlayerReportName(pIn) : 'Nieznany',
            minute: s.minute,
            teamId: s.isHome ? home.id : away.id
          };
        }),
        injuries: result.injuries.map(inj => {
          const allP = currentPlayers[home.id].concat(currentPlayers[away.id]);
          const p = allP.find(x => x.id === inj.playerId);
          return {
            playerId: inj.playerId,
            playerName: p ? formatPlayerReportName(p) : 'Nieznany',
            minute: inj.minute,
            teamId: p?.clubId ?? '?',
            severity: inj.severity,
            days: inj.days,
            type: inj.type,
          };
        }),
      });
      currentFixtures = currentFixtures.map(f => f.id === fixture.id ? { 
        ...f, 
        homeScore: result.homeScore, 
        awayScore: result.awayScore, 
        status: MatchStatus.FINISHED 
      } : f);

      const homeMatchExpenses = FinanceService.calculateMatchdayExpenses(home, true, attendance);
      const awayMatchExpenses = FinanceService.calculateMatchdayExpenses(away, false);

      const matchResult: MatchResult = {
        homeTeamName: home.name,
        awayTeamName: away.name,
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        homeColors: home.colorsHex,
        awayColors: away.colorsHex,
        matchId: fixture.id
      };

      if (fixture.leagueId === 'L_PL_1') roundResults.league1Results.push(matchResult);
      else if (fixture.leagueId === 'L_PL_2') roundResults.league2Results.push(matchResult);
      else if (fixture.leagueId === 'L_PL_3') roundResults.league3Results.push(matchResult);
      currentClubs = currentClubs.map(c => {
        if (c.id === home.id || c.id === away.id) {
          const isHome = c.id === home.id;
          const pts = isHome 
            ? (result.homeScore > result.awayScore ? 3 : (result.homeScore === result.awayScore ? 1 : 0))
            : (result.awayScore > result.homeScore ? 3 : (result.awayScore === result.homeScore ? 1 : 0));
          
          const resultChar: "W" | "R" | "P" = pts === 3 ? 'W' : (pts === 1 ? 'R' : 'P');
          const newForm = [...(c.stats.form || []), resultChar].slice(-5) as ("W" | "R" | "P")[];

          const _scoreDiff = isHome ? result.homeScore - result.awayScore : result.awayScore - result.homeScore;
          const _moraleDelta = resultChar === 'W' ? (_scoreDiff >= 2 ? 8 : 5) : resultChar === 'P' ? (_scoreDiff <= -3 ? -10 : -5) : 0;
          const _recentTwo = (c.stats.form || []).slice(-2);
          const _seriesBonus = (resultChar === 'W' && _recentTwo.length >= 2 && _recentTwo.every(r => r === 'W')) ? 3 : (resultChar === 'P' && _recentTwo.length >= 2 && _recentTwo.every(r => r === 'P')) ? -4 : 0;
          const _lossCrisisPenalty = getLossCrisisPenalty(newForm, resultChar);
          const _clubCoach = c.id === home.id ? hCoach : aCoach;
          const _coachMotivation = _clubCoach?.attributes?.motivation ?? 50;
          // Motywacja trenera amortyzuje porażki, ale nie może ukryć długiej serii przegranych.
          const _motivationFactor = resultChar === 'P' ? Math.max(0.55, 1.0 - (_coachMotivation / 100) * 0.45) : 1.0;
          const _adjustedMoraleDelta = _moraleDelta < 0 ? Math.round(_moraleDelta * _motivationFactor) : _moraleDelta;
          const _adjustedSeriesBonus = _seriesBonus < 0 ? Math.round(_seriesBonus * _motivationFactor) : _seriesBonus;
          const _adjustedLossCrisisPenalty = Math.round(_lossCrisisPenalty * _motivationFactor);
          const newMorale = Math.max(5, Math.min(95, Math.round((c.morale ?? 50) + _adjustedMoraleDelta + _adjustedSeriesBonus + _adjustedLossCrisisPenalty + (50 - (c.morale ?? 50)) * 0.05)));

          const matchExpenses = isHome ? homeMatchExpenses : awayMatchExpenses;
          const { revenue: ticketRevenue, avgPrice: ticketAvgPrice } = isHome
            ? FinanceService.calculateMatchTicketRevenueForClub(fixture.attendance || 0, c)
            : { revenue: 0, avgPrice: 0 };
          const additionalRevenues = isHome ? FinanceService.calculateMatchdayAdditionalRevenuesForClub(fixture.attendance || 0, c) : null;
          const additionalTotal = additionalRevenues ? (additionalRevenues.catering + additionalRevenues.merchandising + additionalRevenues.programs + additionalRevenues.parking) : 0;

          const clubPlayers = isHome ? hPlayers : aPlayers;
          const opponentScore = isHome ? result.awayScore : result.homeScore;
          let performanceBonusCost = 0;
          result.scorers.forEach(s => {
            const scorer = clubPlayers.find(p => p.id === s.playerId);
            if (scorer?.goalBonus) performanceBonusCost += scorer.goalBonus;
            if (s.assistId) {
              const assister = clubPlayers.find(p => p.id === s.assistId);
              if (assister?.assistBonus) performanceBonusCost += assister.assistBonus;
            }
          });
          if (opponentScore === 0) {
            const playingGK = clubPlayers.find(p => p.position === 'GK' && result.playedPlayerIds.includes(p.id));
            if (playingGK?.cleanSheetBonus) performanceBonusCost += playingGK.cleanSheetBonus;
          }

          const netChange = ticketRevenue + additionalTotal - matchExpenses - performanceBonusCost;

          // Tworzymy logi finansowe z poprzednim saldem
          const financeLogsToAdd: any[] = [];
          let runningBalance = c.budget; // Saldo przed operacjami
          
          if (isHome) {
            // 🏟️ Przychody z biletów
            if (ticketRevenue > 0) {
              financeLogsToAdd.push({
                id: Math.random().toString(36).substr(2, 9),
                date: currentDate.toISOString().split('T')[0],
                amount: ticketRevenue,
                type: 'INCOME' as const,
                description: `Bilety (vs ${away.name}): ${fixture.attendance || 0} widzów @ ${ticketAvgPrice} PLN`,  
                previousBalance: runningBalance
              });
              runningBalance += ticketRevenue;
            }

            // 🍔 Catering i Hospitality
            if (additionalRevenues && additionalRevenues.catering > 0) {
              financeLogsToAdd.push({
                id: Math.random().toString(36).substr(2, 9),
                date: currentDate.toISOString().split('T')[0],
                amount: additionalRevenues.catering,
                type: 'INCOME' as const,
                description: `Catering i Hospitality (vs ${away.name})`,
                previousBalance: runningBalance
              });
              runningBalance += additionalRevenues.catering;
            }

            // 👕 Merchandising
            if (additionalRevenues && additionalRevenues.merchandising > 0) {
              financeLogsToAdd.push({
                id: Math.random().toString(36).substr(2, 9),
                date: currentDate.toISOString().split('T')[0],
                amount: additionalRevenues.merchandising,
                type: 'INCOME' as const,
                description: `Sklep kibica — merchandising (vs ${away.name})`,
                previousBalance: runningBalance
              });
              runningBalance += additionalRevenues.merchandising;
            }

            // 📰 Programy meczowe i reklamy LED
            if (additionalRevenues && additionalRevenues.programs > 0) {
              financeLogsToAdd.push({
                id: Math.random().toString(36).substr(2, 9),
                date: currentDate.toISOString().split('T')[0],
                amount: additionalRevenues.programs,
                type: 'INCOME' as const,
                description: `Programy meczowe i reklamy LED (vs ${away.name})`,
                previousBalance: runningBalance
              });
              runningBalance += additionalRevenues.programs;
            }

            // 🅿️ Parkingi i fanzony
            if (additionalRevenues && additionalRevenues.parking > 0) {
              financeLogsToAdd.push({
                id: Math.random().toString(36).substr(2, 9),
                date: currentDate.toISOString().split('T')[0],
                amount: additionalRevenues.parking,
                type: 'INCOME' as const,
                description: `Parkingi i strefa kibica (vs ${away.name})`,
                previousBalance: runningBalance
              });
              runningBalance += additionalRevenues.parking;
            }
            
            // 💰 Koszty organizacji
            if (matchExpenses > 0) {
              financeLogsToAdd.push({
                id: Math.random().toString(36).substr(2, 9),
                date: currentDate.toISOString().split('T')[0],
                amount: -matchExpenses,
                type: 'EXPENSE' as const,
                description: `Koszty organizacji meczu`,
                previousBalance: runningBalance
              });
              runningBalance -= matchExpenses;
            }
          } else {
            // 🚌 Koszty wyjazdu (away)
            financeLogsToAdd.push({
              id: Math.random().toString(36).substr(2, 9),
              date: currentDate.toISOString().split('T')[0],
              amount: -matchExpenses,
              type: 'EXPENSE' as const,
              description: `Koszty wyjazdu`,
              previousBalance: runningBalance
            });
            runningBalance -= matchExpenses;
          }

          if (performanceBonusCost > 0) {
            financeLogsToAdd.push({
              id: Math.random().toString(36).substr(2, 9),
              date: currentDate.toISOString().split('T')[0],
              amount: -performanceBonusCost,
              type: 'EXPENSE' as const,
              description: `Premie zawodnicze (vs ${isHome ? away.name : home.name})`,
              previousBalance: runningBalance
            });
            runningBalance -= performanceBonusCost;
          }

          return {
            ...c,
            budget: c.budget + netChange,
            financeHistory: [...financeLogsToAdd, ...(c.financeHistory || [])].slice(0, 50),
            morale: newMorale,
            stats: fixture.leagueId === CompetitionType.SUPER_CUP ? {
              ...c.stats,
              form: newForm
            } : {
              ...c.stats,
              played: c.stats.played + 1,
              wins: c.stats.wins + (pts === 3 ? 1 : 0),
              draws: c.stats.draws + (pts === 1 ? 1 : 0),
              losses: c.stats.losses + (pts === 0 ? 1 : 0),
              goalsFor: c.stats.goalsFor + (isHome ? result.homeScore : result.awayScore),
              goalsAgainst: c.stats.goalsAgainst + (isHome ? result.awayScore : result.homeScore),
              goalDifference: c.stats.goalDifference + (isHome ? result.homeScore - result.awayScore : result.awayScore - result.homeScore),
              points: c.stats.points + pts,
              form: newForm
            }
          };
        }
        return c;
      });

      // Aktualizacja statystyk zawodników
    // Uwzględnienie rezerwowych w statystykach meczowych
 
      currentPlayers = PlayerStatsService.processMatchDayEndForClub(currentPlayers, home.id, result.playedPlayerIds.filter(id => hPlayers.some(p => p.id === id)));
      currentPlayers = PlayerStatsService.processMatchDayEndForClub(currentPlayers, away.id, result.playedPlayerIds.filter(id => aPlayers.some(p => p.id === id)));
      
      result.scorers.forEach(s => {
        currentPlayers = PlayerStatsService.applyGoal(currentPlayers, s.playerId, s.assistId);
      });

      result.cards.forEach(card => {
        currentPlayers = PlayerStatsService.applyCard(currentPlayers, card.playerId, card.type);
      });

      const homeResultChar: 'W' | 'R' | 'P' = result.homeScore > result.awayScore ? 'W' : result.homeScore === result.awayScore ? 'R' : 'P';
      const awayResultChar: 'W' | 'R' | 'P' = result.awayScore > result.homeScore ? 'W' : result.homeScore === result.awayScore ? 'R' : 'P';
      currentPlayers = applyAiMatchMoraleToClub(
        currentPlayers,
        home.id,
        hPlayers,
        result.playedPlayerIds,
        result.scorers,
        result.cards,
        result.ratings,
        homeResultChar,
        result.homeScore - result.awayScore,
        hCoach as Coach,
        home.stats.form,
        currentDate
      );
      currentPlayers = applyAiMatchMoraleToClub(
        currentPlayers,
        away.id,
        aPlayers,
        result.playedPlayerIds,
        result.scorers,
        result.cards,
        result.ratings,
        awayResultChar,
        result.awayScore - result.homeScore,
        aCoach as Coach,
        away.stats.form,
        currentDate
      );

      if (result.awayScore === 0) {
        const homeGKs = hPlayers.filter(p => p.position === 'GK' && result.playedPlayerIds.includes(p.id)).map(p => p.id);
        if (homeGKs.length > 0) currentPlayers = PlayerStatsService.applyCleanSheet(currentPlayers, home.id, homeGKs);
      }
      if (result.homeScore === 0) {
        const awayGKs = aPlayers.filter(p => p.position === 'GK' && result.playedPlayerIds.includes(p.id)).map(p => p.id);
        if (awayGKs.length > 0) currentPlayers = PlayerStatsService.applyCleanSheet(currentPlayers, away.id, awayGKs);
      }


      // Zmęczenie i kontuzje
      for (const clubId in currentPlayers) {
        if (clubId === home.id || clubId === away.id) {
           currentPlayers[clubId] = currentPlayers[clubId].map(p => {
              let updatedP = { ...p };
              
              if (result.fatigue[p.id] !== undefined) {
   // TUTAJ WSTAW TEN KOD: Nadpisujemy kondycję zamiast odejmować
   updatedP.condition = result.fatigue[p.id];
}
              if (result.fatigueDebtMap && result.fatigueDebtMap[p.id]) {
                 updatedP.fatigueDebt = Math.min(100, (updatedP.fatigueDebt || 0) + result.fatigueDebtMap[p.id]);
              }

// TUTAJ WSTAW TEN KOD - Rejestracja noty w historii sezonu
   if (result.ratings && result.ratings[p.id]) {
                 if (!updatedP.stats.ratingHistory) updatedP.stats.ratingHistory = [];
                 updatedP.stats.ratingHistory.push(result.ratings[p.id]);
              }

              const injury = result.injuries.find(inj => inj.playerId === p.id);
              if (injury) {
                 const basePenalty = injury.severity === InjurySeverity.SEVERE ? 55 : 20;
                 const randomExtra = Math.floor(Math.random() * 15); 
                 const condAfterPenalty = Math.max(0, updatedP.condition - (basePenalty + randomExtra));
                updatedP.health = {
                    status: HealthStatus.INJURED,
                    injury: {
                       type: injury.type,
                       daysRemaining: injury.days,
                       severity: injury.severity,
                       injuryDate: currentDate.toISOString(), 
                       totalDays: injury.days,
                       conditionAtInjury: condAfterPenalty
                    }
                 };
                 updatedP.condition = condAfterPenalty;
              }
              return updatedP;
           });
        }
      }
    });

    const contractResult = AiContractService.processClubsContracts(currentClubs, currentPlayers, currentDate, userTeamId);

    const preContractFinal = AiContractService.processAiPreContractOpportunities(contractResult.updatedClubs, contractResult.updatedPlayers, currentDate, userTeamId);
    const depthFinal = AiContractService.processAiPrioritySquadDepth(contractResult.updatedClubs, preContractFinal.updatedPlayers, currentDate, userTeamId);
    const finalUpdate = AiContractService.processAiRecruitment(depthFinal.updatedClubs, depthFinal.updatedPlayers, currentDate, userTeamId);
    const resolvedFinal = AiContractService.resolveAiFreeAgentNegotiations(finalUpdate.updatedClubs, finalUpdate.updatedPlayers, currentDate, userTeamId);
    const financingFinal = AiContractService.processAiSquadFinancing(resolvedFinal.updatedClubs, resolvedFinal.updatedPlayers, currentDate, userTeamId);
    const transferSigningsFinal = AiContractService.processAiTransferListSignings(financingFinal.updatedClubs, financingFinal.updatedPlayers, currentDate, userTeamId, coaches);
    const interestedTargetingFinal = AiContractService.processAiInterestedPlayerTargeting(transferSigningsFinal.updatedClubs, transferSigningsFinal.updatedPlayers, currentDate, userTeamId, coaches);
    const transferResolvedFinal = AiContractService.resolveAiTransferPending(interestedTargetingFinal.updatedClubs, interestedTargetingFinal.updatedPlayers, currentDate, userTeamId);

    const aiTransferLogEntriesMatch: AiTransferLogEntry[] = [
      ...finalUpdate.logEntries,
      ...resolvedFinal.logEntries,
      ...preContractFinal.logEntries,
      ...transferSigningsFinal.logEntries,
      ...interestedTargetingFinal.logEntries,
      ...transferResolvedFinal.logEntries,
    ];

    currentClubs = transferResolvedFinal.updatedClubs;
    currentPlayers = transferResolvedFinal.updatedPlayers;
    const newOffers = finalUpdate.newOffers;

    // Aktualizacja zainteresowań transferowych — dotyczy też dni meczowych.
    const isScoutingDayMatch = currentDate.getDate() === 1 || (currentDate.getMonth() === 0 && currentDate.getDate() === 12);
    if (isScoutingDayMatch) {
      currentPlayers = AiScoutingService.updateTransferInterests(
        currentClubs,
        currentPlayers,
        currentDate,
        userTeamId,
        sessionSeed
      );
      currentPlayers = AiContractService.processMonthlyPlayerReview(
        currentClubs,
        currentPlayers,
        currentDate,
        userTeamId
      ).updatedPlayers;
    }
    if (currentDate.getMonth() === 0 && currentDate.getDate() === 12) {
      const weakReviewWinterMatch = AiContractService.processWeakPlayerContractCuts(currentClubs, currentPlayers, currentDate, userTeamId);
      currentClubs = weakReviewWinterMatch.updatedClubs;
      currentPlayers = weakReviewWinterMatch.updatedPlayers;
    }
    currentPlayers = AiContractService.enforceTransferListLimits(currentPlayers, currentDate, userTeamId);

    return {
      updatedFixtures: currentFixtures,
      updatedClubs: currentClubs,
      updatedPlayers: currentPlayers,
      updatedLineups: newLineups,
      newOffers: newOffers,
      roundResults: roundResults,
      seasonNumber: seasonNumber,
      ratings: {},
      aiTransferLogEntries: aiTransferLogEntriesMatch,
    };
  }
};
