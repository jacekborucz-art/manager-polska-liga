import { Player, PlayerPosition, Club, HealthStatus, Region, RetirementInfo, StaffMember, Coach, StaffRole, PlayerSeasonHistoryEntry } from '../types';
import { NameGeneratorService } from './NameGeneratorService';
import { PlayerAttributesGenerator } from './PlayerAttributesGenerator';
import { FinanceService } from './FinanceService';
import { PlayerCareerService } from './PlayerCareerService';
import { pickNationalityForRegion } from './NationalityService';

const AI_TRANSITION_MIN_POSITION_COUNTS: Record<PlayerPosition, number> = {
  [PlayerPosition.GK]: 3,
  [PlayerPosition.DEF]: 8,
  [PlayerPosition.MID]: 8,
  [PlayerPosition.FWD]: 4,
};
const AI_TRANSITION_MIN_SQUAD_SIZE = Object.values(AI_TRANSITION_MIN_POSITION_COUNTS).reduce((sum, count) => sum + count, 0);

const countByPosition = (squad: Player[]): Record<PlayerPosition, number> => ({
  [PlayerPosition.GK]: squad.filter(player => player.position === PlayerPosition.GK).length,
  [PlayerPosition.DEF]: squad.filter(player => player.position === PlayerPosition.DEF).length,
  [PlayerPosition.MID]: squad.filter(player => player.position === PlayerPosition.MID).length,
  [PlayerPosition.FWD]: squad.filter(player => player.position === PlayerPosition.FWD).length,
});

const buildProtectedAiExpiredContractIds = (squad: Player[], seasonEndDate: Date): Set<string> => {
  const expiredCandidates = squad.filter(player =>
    player.contractEndDate &&
    new Date(player.contractEndDate) <= seasonEndDate &&
    !player.transferPendingClubId
  );

  const expiredIds = new Set(expiredCandidates.map(player => player.id));
  const retained = squad.filter(player => !expiredIds.has(player.id));
  const counts = countByPosition(retained);
  const protectedIds = new Set<string>();

  const candidatesByUsefulness = [...expiredCandidates].sort((a, b) => {
    const needA = counts[a.position] < AI_TRANSITION_MIN_POSITION_COUNTS[a.position] ? 1 : 0;
    const needB = counts[b.position] < AI_TRANSITION_MIN_POSITION_COUNTS[b.position] ? 1 : 0;
    return needB - needA || b.overallRating - a.overallRating || a.age - b.age;
  });

  for (const candidate of candidatesByUsefulness) {
    const needsTotalDepth = retained.length < AI_TRANSITION_MIN_SQUAD_SIZE;
    const needsPositionDepth = counts[candidate.position] < AI_TRANSITION_MIN_POSITION_COUNTS[candidate.position];
    if (!needsTotalDepth && !needsPositionDepth) continue;

    protectedIds.add(candidate.id);
    retained.push(candidate);
    counts[candidate.position]++;
  }

  return protectedIds;
};

export const SeasonTransitionService = {
  /**
   * Przetwarza przejście zawodników między sezonami: emerytury i nowi gracze.
   */
    processSquadTransition: (
    playersMap: Record<string, Player[]>,
    clubs: Club[],
    seasonEndDate: Date,
    userTeamId: string | null
  ): { updatedPlayers: Record<string, Player[]>, retirementLogs: RetirementInfo[], releasedPlayers: Player[] } => {
    const updatedMap = { ...playersMap };
    const logs: RetirementInfo[] = [];
const releasedPlayers: Player[] = [];  // ← NOWA LINIA
    for (const clubId in updatedMap) {
      const club = clubs.find(c => c.id === clubId);
      if (!club) continue;

      // Wyciągamy poziom ligowy dla generatora atrybutów
      let leagueTier = 4;
      if (club.leagueId === 'L_PL_1') leagueTier = 1;
      else if (club.leagueId === 'L_PL_2') leagueTier = 2;
      else if (club.leagueId === 'L_PL_3') leagueTier = 3;

      const currentSquad = updatedMap[clubId];
      const nextSquad: Player[] = [];
      const protectedAiExpiredContractIds = clubId !== userTeamId
        ? buildProtectedAiExpiredContractIds(currentSquad, seasonEndDate)
        : new Set<string>();

           currentSquad.forEach(player => {
        // NOWA LOGIKA: Wygasły kontrakt → wolny agent (tylko AI-kluby)
        const contractExpired = player.contractEndDate && new Date(player.contractEndDate) <= seasonEndDate;
        if (contractExpired && clubId !== userTeamId && !player.transferPendingClubId && !protectedAiExpiredContractIds.has(player.id)) {
          const released = {
            ...PlayerCareerService.resetClubStatsForNewEntry(player),
            clubId: 'FREE_AGENTS',
            annualSalary: 0,
            history: PlayerCareerService.movePlayer(
              player,
              { clubName: 'BEZ KLUBU', clubId: 'FREE_AGENTS' },
              seasonEndDate.getFullYear(),
              7,
              { clubName: club.name, clubId: club.id }
            )
          };
          releasedPlayers.push(released);
          return; // nie trafia do nextSquad
        }

        const retirementLocked = !!player.retirementLockUntil && new Date(player.retirementLockUntil) > seasonEndDate;

        // Logika emerytury: > 35 lat + losowa decyzja (0,1)
        if (player.age >= 35 && !retirementLocked && Math.random() < 0.5) {
          // Zawodnik odchodzi - generujemy Newgena na jego miejsce
          const newgen = SeasonTransitionService.generateNewgen(
            clubId,
            player.position,
            leagueTier,
            club.reputation,
            club.budget,
            nextSquad.length,
            club.country,
            player.nationality
          );
          nextSquad.push(newgen);
          logs.push({
            oldPlayerName: `${player.firstName} ${player.lastName}`,
            oldPlayerAge: player.age,
            newPlayerName: `${newgen.firstName} ${newgen.lastName}`,
            newPlayerOverall: newgen.overallRating,
            clubId: clubId
          });
        } else {
          // Zawodnik zostaje - starzeje się o rok i resetuje statystyki
          const prevSeasonHistory = player.seasonHistory || [];
          const prevForThisClub = prevSeasonHistory.filter(s => s.clubId === player.clubId);
          const prevTotalMatches = prevForThisClub.reduce((s, e) => s + e.matchesPlayed, 0);
          const prevTotalGoals = prevForThisClub.reduce((s, e) => s + e.goals, 0);
          const prevTotalAssists = prevForThisClub.reduce((s, e) => s + e.assists, 0);
          const prevTotalYellow = prevForThisClub.reduce((s, e) => s + e.yellowCards, 0);
          const prevTotalRed = prevForThisClub.reduce((s, e) => s + e.redCards, 0);
          const totalMatches = (player.stats?.matchesPlayed || 0) + (player.cupStats?.matchesPlayed || 0) + (player.euroStats?.matchesPlayed || 0);
          const totalGoals = (player.stats?.goals || 0) + (player.cupStats?.goals || 0) + (player.euroStats?.goals || 0);
          const totalAssists = (player.stats?.assists || 0) + (player.cupStats?.assists || 0) + (player.euroStats?.assists || 0);
          const totalYellow = (player.stats?.yellowCards || 0) + (player.cupStats?.yellowCards || 0) + (player.euroStats?.yellowCards || 0);
          const totalRed = (player.stats?.redCards || 0) + (player.cupStats?.redCards || 0) + (player.euroStats?.redCards || 0);
          const ratingHistory = player.stats?.ratingHistory || [];
          const seasonAvgRating = ratingHistory.length > 0
            ? parseFloat((ratingHistory.reduce((s: number, r: number) => s + r, 0) / ratingHistory.length).toFixed(1))
            : null;
          const lastHistEntry = [...(player.history || [])].reverse().find(h => h.clubId === player.clubId && h.toYear === null);
          const seasonYear = seasonEndDate.getFullYear() - 1;
          const isFirstSeasonAtClub = prevForThisClub.length === 0;
          const fromYear = isFirstSeasonAtClub && lastHistEntry ? lastHistEntry.fromYear : seasonYear;
          const fromMonth = isFirstSeasonAtClub && lastHistEntry ? lastHistEntry.fromMonth : 7;
          const seasonEntry: PlayerSeasonHistoryEntry = {
            season: seasonYear,
            clubId: player.clubId,
            clubName: club.name,
            fromYear,
            fromMonth,
            toYear: seasonEndDate.getFullYear(),
            toMonth: 6,
            matchesPlayed: Math.max(0, totalMatches - prevTotalMatches),
            goals: Math.max(0, totalGoals - prevTotalGoals),
            assists: Math.max(0, totalAssists - prevTotalAssists),
            yellowCards: Math.max(0, totalYellow - prevTotalYellow),
            redCards: Math.max(0, totalRed - prevTotalRed),
            averageRating: seasonAvgRating
          };
          nextSquad.push({
            ...player,
            age: player.age + 1,
            contractEndDate: contractExpired && protectedAiExpiredContractIds.has(player.id)
              ? new Date(seasonEndDate.getFullYear() + 1, 5, 30).toISOString()
              : player.contractEndDate,
            negotiationStep: contractExpired && protectedAiExpiredContractIds.has(player.id) ? 0 : player.negotiationStep,
            negotiationLockoutUntil: contractExpired && protectedAiExpiredContractIds.has(player.id) ? null : player.negotiationLockoutUntil,
            isNegotiationPermanentBlocked: contractExpired && protectedAiExpiredContractIds.has(player.id)
              ? false
              : player.isNegotiationPermanentBlocked,
            isOnTransferList: contractExpired && protectedAiExpiredContractIds.has(player.id) ? false : player.isOnTransferList,
            retirementLockUntil: player.retirementLockUntil && new Date(player.retirementLockUntil) <= seasonEndDate
              ? null
              : player.retirementLockUntil,
            condition: 100, // Pełna regeneracja na start sezonu
            suspensionMatches: 0, // Reset kar ligowych
            stats: PlayerCareerService.emptyStats(),
            cupStats: PlayerCareerService.emptyStats(),
            euroStats: PlayerCareerService.emptyStats(),
            cupSuspensionMatches: 0,
            euroSuspensionMatches: 0,
            oneTimeBonusPromise: null,
            seasonHistory: [...prevSeasonHistory, seasonEntry]
          });
        }
      });

      updatedMap[clubId] = nextSquad;
    }

        return { updatedPlayers: updatedMap, retirementLogs: logs, releasedPlayers };
  },

  /**
   * Tworzy nowego, młodego zawodnika w miejsce emeryta.
   */
  generateNewgen: (
    clubId: string,
    position: PlayerPosition,
    tier: number,
    reputation: number,
    clubBudget: number,
    index: number,
    clubCountry?: string,
    forceRegion?: Region
  ): Player => {
    const region = forceRegion ?? (Math.random() < 0.85 ? Region.POLAND : NameGeneratorService.getRandomForeignRegion());
    const namePair = NameGeneratorService.getRandomName(region);

    // Nowe atrybuty w oparciu o poziom ligowy
    const age = 16 + Math.floor(Math.random() * 4);
    const genData = PlayerAttributesGenerator.generateAttributes(position, tier, reputation, age);

    const salary = FinanceService.calculateNewgenSalary(clubBudget, genData.overall, age);
    
    const newPlayer: Player = {
      id: `NEWGEN_${clubId}_${Date.now()}_${index}`,
      firstName: namePair.firstName,
      lastName: namePair.lastName,
      clubId: clubId,
      position: position,
      nationality: region,
      nationalityCountry: pickNationalityForRegion(region),
      age: age,
      fatigueDebt: 0,
      overallRating: genData.overall,
      attributes: genData.attributes,
      condition: 100,
      suspensionMatches: 0,
      annualSalary: salary,
      contractEndDate: new Date(new Date().getFullYear() + 4, 5, 30).toISOString(),
      health: { status: HealthStatus.HEALTHY },
      stats: {
        goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0,
        seasonalChanges: {},  ratingHistory: []
      },
      cupStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
      euroStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
      nationalStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
      cupSuspensionMatches: 0,
      euroSuspensionMatches: 0,
      nationalSuspensionMatches: 0,
      history: [{
        clubName: "Akademia",
        clubId: clubId,
        fromYear: new Date().getFullYear(),
        fromMonth: 7,
        toYear: null,
        toMonth: null
      }],
      boardLockoutUntil: null,
      isUntouchable: false,
      negotiationStep: 0,
      negotiationLockoutUntil: null,
      contractLockoutUntil: null,
      isNegotiationPermanentBlocked: false,
      lojalnosc: Math.floor(Math.random() * 99) + 1,
      transferLockoutUntil: null,
      freeAgentLockoutUntil: null,
      freeAgentClubLockouts: {},
      isOnTransferList: false
    };

    newPlayer.marketValue = FinanceService.calculateMarketValue(newPlayer, reputation, tier, clubCountry);

    return newPlayer;
  },


/**
   * Tworzy słabego, tymczasowego bramkarza w sytuacji kryzysowej.
   */
  generateEmergencyGK: (
    clubId: string,
    tier: number,
    reputation: number,
    targetOverall?: number,
    currentDate: Date = new Date()
  ): Player => {
    const namePair = NameGeneratorService.getRandomName(Region.POLAND);
    // Generujemy atrybuty dla najniższego poziomu (Tier 4, Rep 1)
   const genData = PlayerAttributesGenerator.generateAttributes(PlayerPosition.GK, tier, reputation, 18);
    
    const forcedOvr = targetOverall !== undefined
      ? Math.max(30, Math.min(95, Math.round(targetOverall)))
      : 45 + Math.floor(Math.random() * 12);
    
    return {
      id: `EMERGENCY_GK_${clubId}_${currentDate.getTime()}`,
      firstName: namePair.firstName,
      lastName: namePair.lastName,
      age: 18,
      clubId,
      position: PlayerPosition.GK,
      nationality: Region.POLAND,
      nationalityCountry: 'Polska',
      overallRating: forcedOvr,
      attributes: genData.attributes,
      condition: 100,
      fatigueDebt: 0,
      suspensionMatches: 0,
      annualSalary: 15000,
      contractEndDate: new Date(currentDate.getFullYear(), 11, 31).toISOString(),
      health: { status: HealthStatus.HEALTHY },
      stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
      cupStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
      euroStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
      nationalStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
      cupSuspensionMatches: 0,
      euroSuspensionMatches: 0,
      nationalSuspensionMatches: 0,
      history: [{ clubName: "Awaryjny nabór", clubId: clubId, fromYear: currentDate.getFullYear(), fromMonth: currentDate.getMonth() + 1, toYear: null, toMonth: null }],
      boardLockoutUntil: null,
      isUntouchable: false,
      negotiationStep: 0,
      negotiationLockoutUntil: null,
      contractLockoutUntil: null,
      isNegotiationPermanentBlocked: false,
      lojalnosc: Math.floor(Math.random() * 99) + 1,
      transferLockoutUntil: null,
      freeAgentLockoutUntil: null,
      freeAgentClubLockouts: {},
      isOnTransferList: false
    };
  },

  cullAndRefreshFreeAgents: (freeAgents: Player[], seasonYear: number): { remaining: Player[], newYouth: Player[] } => {
    const sorted = [...freeAgents].sort((a, b) => (a.overallRating || 0) - (b.overallRating || 0));
    const count = 400 + Math.floor(Math.random() * 201);
    const toRemove = sorted.slice(0, Math.min(count, sorted.length));
    const remaining = sorted.slice(toRemove.length);
    const positions = [PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD];
    const newYouth: Player[] = [];
    toRemove.forEach((removed, idx) => {
      const region = removed.nationality ?? (Math.random() < 0.7 ? Region.POLAND : NameGeneratorService.getRandomForeignRegion());
      const namePair = NameGeneratorService.getRandomName(region);
      const position = positions[Math.floor(Math.random() * positions.length)];
      const age = 16 + Math.floor(Math.random() * 4);
      const randomTier = Math.floor(Math.random() * 4) + 1;
      const randomRep = Math.floor(Math.random() * 10) + 1;
      const genData = PlayerAttributesGenerator.generateAttributes(position, randomTier, randomRep, age);
      newYouth.push({
        id: `FREE_YOUTH_${seasonYear}_${Date.now()}_${idx}`,
        firstName: namePair.firstName,
        lastName: namePair.lastName,
        age: age,
        fatigueDebt: 0,
        clubId: 'FREE_AGENTS',
        nationality: region,
        nationalityCountry: pickNationalityForRegion(region),
        position: position,
        overallRating: genData.overall,
        attributes: genData.attributes,
        condition: 90,
        suspensionMatches: 0,
        annualSalary: 0,
        contractEndDate: '',
        marketValue: 0,
        health: { status: HealthStatus.HEALTHY },
        stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, ratingHistory: [], seasonalChanges: {} },
        cupStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
        euroStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
        nationalStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
        cupSuspensionMatches: 0,
        euroSuspensionMatches: 0,
        nationalSuspensionMatches: 0,
        history: [{ clubName: 'BEZ KLUBU', clubId: 'FREE_AGENTS', fromYear: seasonYear, fromMonth: 7, toYear: null, toMonth: null }],
        boardLockoutUntil: null,
        isUntouchable: false,
        negotiationStep: 0,
        negotiationLockoutUntil: null,
        contractLockoutUntil: null,
        isNegotiationPermanentBlocked: false,
        lojalnosc: Math.floor(Math.random() * 99) + 1,
        transferLockoutUntil: null,
        freeAgentLockoutUntil: null,
        freeAgentClubLockouts: {}
      });
    });
    return { remaining, newYouth };
  },

  processStaffRetirement: (
    staffMembers: Record<string, StaffMember>,
    coaches: Record<string, Coach>,
    clubs: Club[],
    userTeamId: string | null
  ): {
    updatedStaff: Record<string, StaffMember>;
    updatedCoaches: Record<string, Coach>;
    retiredFromUserTeam: { name: string; age: number; roleLabel: string }[];
    clubStaffUpdates: Record<string, { staffIds: string[]; coachId?: string | null }>;
  } => {
    const roleLabels: Record<string, string> = {
      [StaffRole.ASSISTANT_COACH]: 'Asystent Trenera',
      [StaffRole.GOALKEEPER_COACH]: 'Trener Bramkarzy',
      [StaffRole.FITNESS_COACH]: 'Trener Przygotowania Fizycznego',
      [StaffRole.VIDEO_ANALYST]: 'Analityk Video',
      [StaffRole.PHYSIOTHERAPIST]: 'Fizjoterapeuta',
      [StaffRole.CLUB_DOCTOR]: 'Lekarz Klubowy'
    };
    const updatedStaff: Record<string, StaffMember> = {};
    const updatedCoaches: Record<string, Coach> = {};
    const retiredFromUserTeam: { name: string; age: number; roleLabel: string }[] = [];
    const clubStaffUpdates: Record<string, { staffIds: string[]; coachId?: string | null }> = {};
    clubs.forEach(c => {
      clubStaffUpdates[c.id] = { staffIds: [...(c.staffIds ?? [])], coachId: c.coachId };
    });
    for (const id in staffMembers) {
      const member = staffMembers[id];
      if (member.age >= 69 && Math.random() < 0.5) {
        if (member.currentClubId === userTeamId && userTeamId) {
          retiredFromUserTeam.push({ name: `${member.firstName} ${member.lastName}`, age: member.age, roleLabel: roleLabels[member.role] ?? member.role });
        }
        if (member.currentClubId && clubStaffUpdates[member.currentClubId]) {
          clubStaffUpdates[member.currentClubId].staffIds = clubStaffUpdates[member.currentClubId].staffIds.filter(sid => sid !== id);
        }
      } else {
        updatedStaff[id] = { ...member, age: member.age + 1 };
      }
    }
    for (const id in coaches) {
      const coach = coaches[id];
      if (coach.age >= 69 && Math.random() < 0.5) {
        if (coach.currentClubId === userTeamId && userTeamId) {
          retiredFromUserTeam.push({ name: `${coach.firstName} ${coach.lastName}`, age: coach.age, roleLabel: 'Trener Główny' });
        }
        if (coach.currentClubId && clubStaffUpdates[coach.currentClubId]) {
          clubStaffUpdates[coach.currentClubId].coachId = null;
        }
      } else {
        updatedCoaches[id] = { ...coach, age: coach.age + 1 };
      }
    }
    return { updatedStaff, updatedCoaches, retiredFromUserTeam, clubStaffUpdates };
  }
};
