import { NationalTeam, Coach, Player, Region, PlayerPosition, HealthStatus } from '../types';
import { NT_SCHEDULE_BY_YEAR } from '../resources/NationalTeamSchedule';
import { pickNationalityForRegion } from './NationalityService';
import { NATIONAL_TEAMS_EUROPE } from '../resources/static_db/NationalTeams/NationalTeamsEurope';
import { NATIONAL_TEAMS_AFRICA } from '../resources/static_db/NationalTeams/NationalTeamsAfrica';
import { NATIONAL_TEAMS_CONMEBOL } from '../resources/static_db/NationalTeams/NationalTeamsCONMEBOL';
import { NATIONAL_TEAMS_CONCACAF } from '../resources/static_db/NationalTeams/NationalTeamsCONCACAF';
import { NATIONAL_TEAMS_AFC } from '../resources/static_db/NationalTeams/NationalTeamsAFC';
import { NATIONAL_TEAMS_OFC } from '../resources/static_db/NationalTeams/NationalTeamsOFC';
import { TACTICS_DB } from '../resources/tactics_db';
import {
  STATIC_CLUBS,
  STATIC_CL_CLUBS,
  STATIC_EL_CLUBS,
  STATIC_CONF_CLUBS,
  STATIC_ASIAN_CLUBS,
  STATIC_AFRICAN_CLUBS,
  STATIC_NA_CLUBS,
  STATIC_SA_CLUBS
} from '../constants';
import { NameGeneratorService } from './NameGeneratorService';
import { PlayerAttributesGenerator, REGION_PROFILE } from './PlayerAttributesGenerator';
import { createDefaultNationalTeamKits } from '../resources/ClubKits';

// Skład kadry: 3 GK + 8 DEF + 8 MID + 6 FWD = 25 zawodników
const NT_GK = 3;
const NT_DEF = 8;
const NT_MID = 8;
const NT_FWD = 6;

const NT_TIER_OVR_CAP: Record<number, number> = {
  1: 99, 2: 87, 3: 77, 4: 67, 5: 57,
};

const KNOWN_CLUBS = [
  ...STATIC_CLUBS,
  ...STATIC_CL_CLUBS,
  ...STATIC_EL_CLUBS,
  ...STATIC_CONF_CLUBS,
  ...STATIC_ASIAN_CLUBS,
  ...STATIC_AFRICAN_CLUBS,
  ...STATIC_NA_CLUBS,
  ...STATIC_SA_CLUBS
];

const CLUB_COUNTRY_BY_ID = new Map<string, string>(
  KNOWN_CLUBS.flatMap(club => club.country ? [[club.id, club.country] as const] : [])
);

const CLUB_REPUTATION_BY_ID = new Map<string, number>(
  KNOWN_CLUBS.map(club => [club.id, club.reputation])
);

const CLUB_LEAGUE_ID_BY_ID = new Map<string, string>(
  KNOWN_CLUBS.map(club => [club.id, club.leagueId])
);

const FREE_AGENT_CLUB_ID = 'FREE_AGENTS';

const isFreeAgentPlayer = (player?: Pick<Player, 'clubId'> | null): boolean =>
  player?.clubId === FREE_AGENT_CLUB_ID;

const calcPolishNTScore = (player: Player): number => {
  const clubRep = CLUB_REPUTATION_BY_ID.get(player.clubId) ?? 1;
  const jitter = Math.floor(Math.random() * 7) - 3;
  return player.overallRating * 2 + clubRep + jitter;
};

type TeamSelectionRule = {
  maxOverall?: number;
  starThreshold?: number;
  minStars?: number;
  maxStars?: number;
  fallbackMaxOverall?: number;
};

const TEAM_SELECTION_RULES: Record<string, TeamSelectionRule> = {
  Liechtenstein: { maxOverall: 55, starThreshold: 55, maxStars: 0, fallbackMaxOverall: 55 },
  'San Marino': { maxOverall: 52, starThreshold: 52, maxStars: 0, fallbackMaxOverall: 52 },
  Luksemburg: { maxOverall: 55, starThreshold: 55, maxStars: 1 },
  Norwegia: { minStars: 3, maxStars: 5 },
  Walia: { maxOverall: 75, starThreshold: 73, maxStars: 2 },
  Irlandia: { maxOverall: 75, starThreshold: 73, maxStars: 2 },
  'Irlandia Północna': { maxOverall: 69, starThreshold: 68, maxStars: 1 },
  Szkocja: { maxOverall: 79, starThreshold: 77, maxStars: 2 },
  Jamajka: { maxOverall: 74, starThreshold: 72, maxStars: 2 },
  'Nowa Zelandia': { maxOverall: 72, starThreshold: 70, maxStars: 2 },
  Iran: { maxOverall: 76, starThreshold: 75, maxStars: 1 },
};

const sortTeamsByPriority = (teams: NationalTeam[]): NationalTeam[] =>
  [...teams].sort((a, b) => b.reputation - a.reputation || a.name.localeCompare(b.name));

const getTeamRule = (team: Pick<NationalTeam, 'name'>): TeamSelectionRule | undefined =>
  TEAM_SELECTION_RULES[team.name];

const getTeamOvrCap = (team: Pick<NationalTeam, 'name' | 'tier' | 'continent' | 'reputation'>): number => {
  let cap = NT_TIER_OVR_CAP[team.tier] ?? 62;

  if (team.continent === 'Africa') {
    if (team.reputation < 8) cap = Math.min(cap, 67);
    else if (team.reputation < 10) cap = Math.min(cap, 70);
    else if (team.reputation < 13) cap = Math.min(cap, 74);
  }

  if (team.continent === 'Oceania') {
    cap = Math.min(cap, team.name === 'Australia' ? 76 : team.name === 'Nowa Zelandia' ? 72 : 64);
  }

  const rule = getTeamRule(team);
  if (rule?.maxOverall !== undefined) {
    cap = Math.min(cap, rule.maxOverall);
  }

  return cap;
};

const isTeamStarPlayer = (
  team: Pick<NationalTeam, 'name' | 'tier' | 'continent' | 'reputation'>,
  player: Pick<Player, 'overallRating'>
): boolean => {
  const rule = getTeamRule(team);
  if (rule?.starThreshold !== undefined && player.overallRating >= rule.starThreshold) return true;
  return player.overallRating > getTeamOvrCap(team);
};

const getCoachStarAllowance = (coachExp: number): number => {
  if (coachExp >= 75) return 3;
  if (coachExp >= 40) return 2;
  return 1;
};

const getMaxStarsForTeam = (team: Pick<NationalTeam, 'name'>, coachExp: number = 50): number => {
  const rule = getTeamRule(team);
  if (!rule) return getCoachStarAllowance(coachExp);

  if (rule.minStars !== undefined) {
    const minStars = rule.minStars;
    const maxStars = rule.maxStars ?? minStars;
    if (coachExp >= 75) return maxStars;
    if (coachExp >= 40) return Math.min(maxStars, minStars + 1);
    return minStars;
  }

  return rule.maxStars ?? getCoachStarAllowance(coachExp);
};

const getSyntheticRegionProfile = (
  teamName: string,
  region: Region
): { baseOffset: number; starChance: number } | undefined => {
  if (teamName === 'Luksemburg') return { baseOffset: -4, starChance: 0.04 };
  if (teamName === 'Liechtenstein') return { baseOffset: -12, starChance: 0.008 };
  if (teamName === 'San Marino') return { baseOffset: -18, starChance: 0.003 };
  return REGION_PROFILE[region];
};

const isEligibleForTeam = (
  team: NationalTeam,
  player: Player,
  squadIds: string[] = [],
  assignedPlayerIds?: Set<string>,
  options: { bypassOverallCap?: boolean } = {}
): boolean => {
  if (assignedPlayerIds?.has(player.id)) return false;
  if (squadIds.includes(player.id)) return false;
  if (player.assignedNationalTeamId && player.assignedNationalTeamId !== team.id) return false;
  if (!options.bypassOverallCap && player.overallRating > getTeamOvrCap(team)) return false;

  if (team.name === 'Liechtenstein') {
    const clubCountry = CLUB_COUNTRY_BY_ID.get(player.clubId);
    const isLiechtensteinClubPlayer = clubCountry === 'LIE';
    const isGermanFallback =
      (player.nationalityCountry === 'Niemcy' || (!player.nationalityCountry && player.nationality === Region.GERMANY)) &&
      (options.bypassOverallCap || player.overallRating <= (getTeamRule(team)?.fallbackMaxOverall ?? 60));
    return isLiechtensteinClubPlayer || isGermanFallback;
  }

  if (player.nationalityCountry) {
    if (player.nationalityCountry !== team.name) return false;
  } else {
    if (player.nationality !== team.region) return false;
  }

  if (team.region === Region.POLAND) {
    const clubLeagueId = CLUB_LEAGUE_ID_BY_ID.get(player.clubId);
    const isEkstraklasa = clubLeagueId === 'L_PL_1';
    const isTopForeign = clubLeagueId === 'L_CL' || clubLeagueId === 'L_EL' || clubLeagueId === 'L_CONF';
    if (!isEkstraklasa && !isTopForeign) return false;
  }

  if (team.reputation >= 14 && team.region !== Region.POLAND) {
    const clubLeagueId = CLUB_LEAGUE_ID_BY_ID.get(player.clubId);
    if (clubLeagueId && clubLeagueId.startsWith('L_PL_') && clubLeagueId !== 'L_PL_1') return false;
  }

  return true;
};

const NT_FREEZE_DAYS = 7;

export const NationalTeamService = {

  // ─── 1. INICJALIZACJA ────────────────────────────────────────────────────────

  initializeNationalTeams: (): NationalTeam[] => {
    const sources = [
      { prefix: 'NT_EUR', data: NATIONAL_TEAMS_EUROPE },
      { prefix: 'NT_AFR', data: NATIONAL_TEAMS_AFRICA },
      { prefix: 'NT_SAM', data: NATIONAL_TEAMS_CONMEBOL },
      { prefix: 'NT_NAM', data: NATIONAL_TEAMS_CONCACAF },
      { prefix: 'NT_ASI', data: NATIONAL_TEAMS_AFC },
      { prefix: 'NT_OFC', data: NATIONAL_TEAMS_OFC },
    ] as const;

    const result: NationalTeam[] = [];
    sources.forEach(({ prefix, data }) => {
      (data as any[]).forEach((entry, index) => {
        result.push({
          id: `${prefix}_${index}`,
          name: entry.name,
          continent: entry.continent,
          tier: entry.tier,
          colorsHex: entry.colors,
          kits: createDefaultNationalTeamKits(entry.colors),
          stadiumName: entry.stadium,
          stadiumCapacity: entry.capacity,
          reputation: entry.reputation,
          region: entry.region as Region,
          coachId: null,
          squadPlayerIds: [],
          tacticId: null,
        });
      });
    });
    return result;
  },

  // ─── 2. WYBÓR TAKTYKI ────────────────────────────────────────────────────────

  selectTacticForCoach: (coach: Coach): string => {
    // Deterministyczny wybór na podstawie hash ID trenera
    // Trener z wysokim decisionMaking preferuje wyspecjalizowane taktyki
    const hash = coach.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const dm = coach.attributes.decisionMaking;

    let pool = TACTICS_DB;
    if (dm >= 70) {
      const specialized = TACTICS_DB.filter(t => t.attackBias > 60 || t.defenseBias > 60);
      if (specialized.length > 0) pool = specialized;
    } else {
      const neutral = TACTICS_DB.filter(t => t.attackBias >= 40 && t.attackBias <= 65);
      if (neutral.length > 0) pool = neutral;
    }
    return pool[hash % pool.length].id;
  },

  // ─── 3. PRZYPISANIE TRENERÓW ─────────────────────────────────────────────────

  assignCoachesToNationalTeams: (
    nationalTeams: NationalTeam[],
    ntCoachList: Coach[]
  ): { updatedTeams: NationalTeam[]; updatedCoaches: Record<string, Coach> } => {
    const coachesMap: Record<string, Coach> = {};
    ntCoachList.forEach(c => { coachesMap[c.id] = { ...c }; });

    const updatedTeams = nationalTeams.map(t => ({ ...t }));

    // Progi doświadczenia trenera w zależności od reputacji reprezentacji
    const getExpRange = (rep: number): [number, number] => {
      if (rep >= 18) return [85, 99];
      if (rep >= 14) return [65, 84];
      if (rep >= 10) return [40, 64];
      if (rep >= 6)  return [20, 39];
      return [5, 19];
    };

    // Sortuj malejąco po reputacji – najlepsze drużyny dostają trenerów jako pierwsze
    const sortedByRep = [...updatedTeams].sort((a, b) => b.reputation - a.reputation);

    for (const team of sortedByRep) {
      const [minExp, maxExp] = getExpRange(team.reputation);
      const available = Object.values(coachesMap).filter(c => !c.currentNationalTeamId);

      // Priorytet 1: ten sam region i właściwe doświadczenie
      let coach = available.find(c =>
        c.nationality === team.region &&
        c.attributes.experience >= minExp &&
        c.attributes.experience <= maxExp
      );

      // Priorytet 2: właściwe doświadczenie (dowolny region)
      if (!coach) {
        coach = available.find(c =>
          c.attributes.experience >= minExp &&
          c.attributes.experience <= maxExp
        );
      }

      // Priorytet 3: rozszerzone doświadczenie ±10
      if (!coach) {
        coach = available.find(c =>
          c.attributes.experience >= Math.max(0, minExp - 10) &&
          c.attributes.experience <= Math.min(99, maxExp + 10)
        );
      }

      // Priorytet 4: jakikolwiek wolny trener
      if (!coach) {
        coach = available[0];
      }

      if (coach) {
        coachesMap[coach.id].currentNationalTeamId = team.id;
        team.coachId = coach.id;
        team.tacticId = NationalTeamService.selectTacticForCoach(coach);
      }
    }

    return { updatedTeams, updatedCoaches: coachesMap };
  },

  // ─── 4. GENEROWANIE ZAWODNIKA NT ─────────────────────────────────────────────

  generatePlayerForNT: (
    teamId: string,
    region: Region,
    teamName: string,
    position: PlayerPosition,
    teamReputation: number,
    index: number,
    usedNames: Set<string>,
    overallCap?: number
  ): Player => {
    // Mapowanie reputacji NT (1-20) na tier dla generatora atrybutów (1-4)
    let tier: number;
    if (teamReputation >= 16) tier = 1;
    else if (teamReputation >= 12) tier = 2;
    else if (teamReputation >= 7)  tier = 3;
    else tier = 4;

    const regionProfile = getSyntheticRegionProfile(teamName, region);
    const buildCandidate = () => {
      const age = 18 + Math.floor(Math.random() * 16); // 18-33 lat
      const genData = PlayerAttributesGenerator.generateAttributes(position, tier, teamReputation, age, tier <= 2, undefined, regionProfile);
      return { age, genData };
    };

    let candidate = buildCandidate();
    if (overallCap !== undefined) {
      let bestCandidate = candidate;
      for (let attempt = 0; attempt < 10; attempt++) {
        const nextCandidate = buildCandidate();
        if (nextCandidate.genData.overall <= overallCap) {
          candidate = nextCandidate;
          break;
        }
        if (nextCandidate.genData.overall < bestCandidate.genData.overall) {
          bestCandidate = nextCandidate;
        }
        candidate = bestCandidate;
      }
    }

    let namePair = NameGeneratorService.getRandomName(region);
    let fullName = `${namePair.firstName} ${namePair.lastName}`;
    let attempts = 0;
    while (usedNames.has(fullName) && attempts < 50) {
      namePair = NameGeneratorService.getRandomName(region);
      fullName = `${namePair.firstName} ${namePair.lastName}`;
      attempts++;
    }
    usedNames.add(fullName);

    const { age, genData } = candidate;

    return {
      id: `NT_${teamId}_${String(index).padStart(3, '0')}`,
      firstName: namePair.firstName,
      lastName: namePair.lastName,
      clubId: 'FREE_AGENTS',
      position,
      nationality: region,
      nationalityCountry: teamName,
      age,
      fatigueDebt: 0,
      overallRating: genData.overall,
      attributes: genData.attributes,
      stats: {
        matchesPlayed: 0,
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        cleanSheets: 0,
        seasonalChanges: {},
        ratingHistory: []
      },
      cupStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
      euroStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
      nationalStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] },
      cupSuspensionMatches: 0,
      euroSuspensionMatches: 0,
      nationalSuspensionMatches: 0,
      health: { status: HealthStatus.HEALTHY },
      condition: 100,
      suspensionMatches: 0,
      contractEndDate: new Date(2028, 5, 30).toISOString(),
      annualSalary: 0,
      history: [],
      boardLockoutUntil: null,
      isUntouchable: false,
      negotiationStep: 0,
      negotiationLockoutUntil: null,
      contractLockoutUntil: null,
      freeAgentLockoutUntil: null,
      freeAgentClubLockouts: {},
      isNegotiationPermanentBlocked: false,
      transferLockoutUntil: null,
    } as Player;
  },

  // ─── 5. GENEROWANIE SKŁADU DLA JEDNEJ DRUŻYNY ───────────────────────────────

  generateSquadForTeam: (
    team: NationalTeam,
    coachExp: number,
    allPlayers: Record<string, Player[]>,
    assignedPlayerIds: Set<string>
  ): { squadPlayerIds: string[]; newPlayers: Player[]; selectedPlayerIds: string[] } => {
    // Wyklucz wolnych agentów — trener szuka tylko wśród zawodników z klubów
    const allPlayersList = Object.entries(allPlayers)
      .filter(([key]) => key !== FREE_AGENT_CLUB_ID)
      .flatMap(([, arr]) => arr);

    const ovrCap = getTeamOvrCap(team);

    const byPos = (pos: PlayerPosition): Player[] =>
      allPlayersList
        .filter(p => {
          if (p.position !== pos) return false;
          return isEligibleForTeam(team, p, [], assignedPlayerIds, { bypassOverallCap: true });
        })
        .map(p => ({ player: p, score: team.region === Region.POLAND ? calcPolishNTScore(p) : p.overallRating }))
        .sort((a, b) => b.score - a.score)
        .map(x => x.player);

    const poolGK  = byPos(PlayerPosition.GK);
    const poolDEF = byPos(PlayerPosition.DEF);
    const poolMID = byPos(PlayerPosition.MID);
    const poolFWD = byPos(PlayerPosition.FWD);

    // Współczynnik okna selekcji: trener z exp=99 widzi top 100%, exp=0 widzi top 40%
    const windowFactor = 0.4 + 0.6 * (coachExp / 99);

    const squadPlayerIds: string[] = [];
    const newPlayers: Player[] = [];
    const selectedPlayerIds: string[] = [];
    const usedNames = new Set<string>();
    let genIndex = 0;
    let selectedStarCount = 0;
    const maxStars = getMaxStarsForTeam(team, coachExp);

    const process = (pool: Player[], needed: number, pos: PlayerPosition) => {
      const topWindow = Math.max(needed, Math.ceil(pool.length * windowFactor));
      const candidatePool = pool.slice(0, topWindow);
      const acceptedPlayers: Player[] = [];

      for (const player of candidatePool) {
        if (isTeamStarPlayer(team, player) && selectedStarCount >= maxStars) continue;
        acceptedPlayers.push(player);
        if (acceptedPlayers.length >= needed) break;
      }

      acceptedPlayers.forEach(player => {
        squadPlayerIds.push(player.id);
        selectedPlayerIds.push(player.id);
        assignedPlayerIds.add(player.id);
        if (isTeamStarPlayer(team, player)) selectedStarCount++;
      });

      const missing = Math.max(0, needed - acceptedPlayers.length);
      for (let i = 0; i < missing; i++) {
        const syntheticCap = selectedStarCount >= maxStars && getTeamRule(team)?.starThreshold !== undefined
          ? Math.min(ovrCap, (getTeamRule(team)?.starThreshold ?? ovrCap) - 1)
          : ovrCap;
        const np = NationalTeamService.generatePlayerForNT(
          team.id, team.region, team.name, pos, team.reputation, genIndex++, usedNames, syntheticCap
        );
        np.assignedNationalTeamId = team.id;
        if (isTeamStarPlayer(team, np)) selectedStarCount++;
        newPlayers.push(np);
        squadPlayerIds.push(np.id);
        assignedPlayerIds.add(np.id);
      }
    };

    process(poolGK,  NT_GK,  PlayerPosition.GK);
    process(poolDEF, NT_DEF, PlayerPosition.DEF);
    process(poolMID, NT_MID, PlayerPosition.MID);
    process(poolFWD, NT_FWD, PlayerPosition.FWD);

    return { squadPlayerIds, newPlayers, selectedPlayerIds };
  },

  // ─── 6. GENEROWANIE SKŁADÓW DLA WSZYSTKICH DRUŻYN ───────────────────────────

  generateAllSquads: (
    nationalTeams: NationalTeam[],
    ntCoaches: Record<string, Coach>,
    allPlayers: Record<string, Player[]>
  ): { updatedTeams: NationalTeam[]; newPlayers: Player[]; playerUpdates: { id: string; assignedNationalTeamId: string }[] } => {
    const updatedTeams: NationalTeam[] = [];
    const allNewPlayers: Player[] = [];
    const allPlayerUpdates: { id: string; assignedNationalTeamId: string }[] = [];
    const assignedPlayerIds = new Set<string>();

    for (const team of sortTeamsByPriority(nationalTeams)) {
      const coach = team.coachId ? ntCoaches[team.coachId] : null;
      const coachExp = coach ? coach.attributes.experience : 50;

      const { squadPlayerIds, newPlayers, selectedPlayerIds } = NationalTeamService.generateSquadForTeam(
        team, coachExp, allPlayers, assignedPlayerIds
      );

      selectedPlayerIds.forEach(id => allPlayerUpdates.push({ id, assignedNationalTeamId: team.id }));
      updatedTeams.push({ ...team, squadPlayerIds });
      allNewPlayers.push(...newPlayers);
    }

    const updatedById = new Map(updatedTeams.map(team => [team.id, team]));
    return {
      updatedTeams: nationalTeams.map(team => updatedById.get(team.id) ?? team),
      newPlayers: allNewPlayers,
      playerUpdates: allPlayerUpdates
    };
  },

  // ─── 7. MIESIĘCZNY PRZEGLĄD KADRY ───────────────────────────────────────────

  reviewMonthlySquad: (
    nationalTeams: NationalTeam[],
    coaches: Record<string, Coach>,
    allPlayers: Record<string, Player[]>
  ): { updatedTeams: NationalTeam[]; playerUpdates: { id: string; assignedNationalTeamId: string | null }[]; calledUpFromClub: { playerId: string; teamName: string }[] } => {
    // Priorytet 1: zawodnicy klubowi (nie wolni agenci, nie generowani przez NT)
    const clubPlayersList = Object.entries(allPlayers)
      .filter(([key]) => key !== FREE_AGENT_CLUB_ID)
      .flatMap(([, arr]) => arr)
      .filter(p => !p.id.startsWith('NT_'));

    // Miesieczny przeglad nie powoluje prawdziwych wolnych agentow.
    const playerMap: Record<string, Player> = {};
    Object.values(allPlayers).flat().forEach(p => { playerMap[p.id] = p; });

    const updatedTeams: NationalTeam[] = [];
    const allPlayerUpdates: { id: string; assignedNationalTeamId: string | null }[] = [];
    const calledUpFromClub: { playerId: string; teamName: string }[] = [];

    const getThreshold = (exp: number): number => {
      if (exp >= 80) return 1;
      if (exp >= 60) return 2;
      if (exp >= 40) return 3;
      return 5;
    };

    const POSITIONS: PlayerPosition[] = [PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD];

    for (const team of sortTeamsByPriority(nationalTeams)) {
      const coach = team.coachId ? coaches[team.coachId] : null;
      const coachExp = coach ? coach.attributes.experience : 50;
      const threshold = getThreshold(coachExp);

      const squadIds = [...team.squadPlayerIds];
      let changed = false;

      for (const pos of POSITIONS) {
        const REQUIRED: Record<PlayerPosition, number> = {
          [PlayerPosition.GK]:  NT_GK,
          [PlayerPosition.DEF]: NT_DEF,
          [PlayerPosition.MID]: NT_MID,
          [PlayerPosition.FWD]: NT_FWD,
        };
        const required = REQUIRED[pos] ?? 0;

        const squadAtPos = squadIds
          .map((id, idx) => ({ id, idx, player: playerMap[id] }))
          .filter(entry => entry.player?.position === pos);

        const missing = required - squadAtPos.length;
        if (missing > 0) {
          let selectedStarCount = squadIds
            .map(id => playerMap[id])
            .filter((player): player is Player => !!player)
            .filter(player => isTeamStarPlayer(team, player)).length;
          const maxStars = getMaxStarsForTeam(team, coachExp);
          const isEligibleFiller = (p: Player): boolean => {
            if (p.position !== pos) return false;
            if (p.health.status !== HealthStatus.HEALTHY) return false;
            return isEligibleForTeam(team, p, squadIds, undefined, { bypassOverallCap: true });
          };
          const fillers = clubPlayersList
            .filter(isEligibleFiller)
            .map(p => ({ player: p, score: team.region === Region.POLAND ? calcPolishNTScore(p) : p.overallRating }))
            .sort((a, b) => b.score - a.score)
            .map(x => x.player);
          const acceptedFillers: Player[] = [];
          for (const filler of fillers) {
            if (isTeamStarPlayer(team, filler) && selectedStarCount >= maxStars) continue;
            acceptedFillers.push(filler);
            if (isTeamStarPlayer(team, filler)) selectedStarCount++;
            if (acceptedFillers.length >= missing) break;
          }
          acceptedFillers.forEach(p => {
            squadIds.push(p.id);
            allPlayerUpdates.push({ id: p.id, assignedNationalTeamId: team.id });
            calledUpFromClub.push({ playerId: p.id, teamName: team.name });
            changed = true;
          });
        }

        if (squadAtPos.length === 0) continue;

        const weakest = squadAtPos.sort((a, b) =>
          (a.player?.overallRating ?? 0) - (b.player?.overallRating ?? 0)
        )[0];

        const freeAgentInSquad = squadAtPos
          .filter(entry => isFreeAgentPlayer(entry.player))
          .sort((a, b) => (a.player?.overallRating ?? 0) - (b.player?.overallRating ?? 0))[0] ?? null;
        const replacementTarget = freeAgentInSquad ?? weakest;
        const replacementTargetOvr = replacementTarget.player?.overallRating ?? 0;

        const isEligible = (p: Player): boolean => {
          if (p.position !== pos) return false;
          if (p.health.status !== HealthStatus.HEALTHY) return false;
          return isEligibleForTeam(team, p, squadIds, undefined, { bypassOverallCap: true });
        };

        const starsWithoutWeakest = squadIds
          .filter(id => id !== replacementTarget.id)
          .map(id => playerMap[id])
          .filter((player): player is Player => !!player)
          .filter(player => isTeamStarPlayer(team, player)).length;
        const maxStars = getMaxStarsForTeam(team, coachExp);

        // Priorytet 1: najlepszy kandydat klubowy, który mieści się w limicie gwiazd
        const candidate = clubPlayersList
          .filter(isEligible)
          .map(p => ({ player: p, score: team.region === Region.POLAND ? calcPolishNTScore(p) : p.overallRating }))
          .sort((a, b) => b.score - a.score)
          .map(x => x.player)
          .find(player => !isTeamStarPlayer(team, player) || starsWithoutWeakest < maxStars) ?? null;

        // Jesli w kadrze zostal wolny agent, klubowy kandydat wypycha go bez progu OVR.
        if (!candidate) continue;
        if (!freeAgentInSquad && candidate.overallRating - replacementTargetOvr < threshold) continue;

        squadIds[replacementTarget.idx] = candidate.id;
        allPlayerUpdates.push({ id: replacementTarget.id, assignedNationalTeamId: null });
        allPlayerUpdates.push({ id: candidate.id, assignedNationalTeamId: team.id });
        calledUpFromClub.push({ playerId: candidate.id, teamName: team.name });
        changed = true;
      }

      updatedTeams.push(changed ? { ...team, squadPlayerIds: squadIds } : team);
    }

    const updatedById = new Map(updatedTeams.map(team => [team.id, team]));
    return {
      updatedTeams: nationalTeams.map(team => updatedById.get(team.id) ?? team),
      playerUpdates: allPlayerUpdates,
      calledUpFromClub
    };
  },

  // ─── 8. DZIENNY PRZEGLĄD KONTUZJI ────────────────────────────────────────────

  reviewDailyInjuries: (
    nationalTeams: NationalTeam[],
    allPlayers: Record<string, Player[]>,
    _currentDate: Date
  ): { updatedTeams: NationalTeam[]; newPlayers: Player[]; playerUpdates: { id: string; assignedNationalTeamId: string }[] } => {
    // Wyklucz wolnych agentów — zastępca musi być zawodnikiem klubowym
    const allPlayersList = Object.entries(allPlayers)
      .filter(([key]) => key !== FREE_AGENT_CLUB_ID)
      .flatMap(([, arr]) => arr);
    const playerMap: Record<string, Player> = {};
    allPlayersList.forEach(p => { playerMap[p.id] = p; });

    const updatedTeams: NationalTeam[] = [];
    const allNewPlayers: Player[] = [];
    const allPlayerUpdates: { id: string; assignedNationalTeamId: string }[] = [];

    for (const team of sortTeamsByPriority(nationalTeams)) {
      const squadIds = [...team.squadPlayerIds];
      let genIndex = team.squadPlayerIds.length;
      const usedNames = new Set<string>();
      let changed = false;

      for (let i = 0; i < squadIds.length; i++) {
        const player = playerMap[squadIds[i]];
        if (!player) continue;
        if (player.health.status !== HealthStatus.INJURED) continue;

        // Szukaj zdrowego zastępcy: ten sam region i pozycja, jeszcze nie w kadrze
        const starsWithoutInjured = squadIds
          .filter((_, idx) => idx !== i)
          .map(id => playerMap[id])
          .filter((candidate): candidate is Player => !!candidate)
          .filter(candidate => isTeamStarPlayer(team, candidate)).length;
        const replacement = allPlayersList
          .filter(p =>
            p.position === player.position &&
            p.health.status === HealthStatus.HEALTHY &&
            isEligibleForTeam(team, p, squadIds, undefined, { bypassOverallCap: true })
          )
          .sort((a, b) => b.overallRating - a.overallRating)
          .find(candidate => !isTeamStarPlayer(team, candidate) || starsWithoutInjured < getMaxStarsForTeam(team)) ?? null;

        if (replacement) {
          squadIds[i] = replacement.id;
          allPlayerUpdates.push({ id: replacement.id, assignedNationalTeamId: team.id });
        } else {
          // Dogeneruj brakującego zawodnika
          const syntheticCap = starsWithoutInjured >= getMaxStarsForTeam(team) && getTeamRule(team)?.starThreshold !== undefined
            ? Math.min(getTeamOvrCap(team), (getTeamRule(team)?.starThreshold ?? getTeamOvrCap(team)) - 1)
            : getTeamOvrCap(team);
          const np = NationalTeamService.generatePlayerForNT(
            team.id, team.region, team.name, player.position, team.reputation, genIndex++, usedNames, syntheticCap
          );
          np.assignedNationalTeamId = team.id;
          allNewPlayers.push(np);
          squadIds[i] = np.id;
        }
        changed = true;
      }

      updatedTeams.push(changed ? { ...team, squadPlayerIds: squadIds } : team);
    }

    const updatedById = new Map(updatedTeams.map(team => [team.id, team]));
    return {
      updatedTeams: nationalTeams.map(team => updatedById.get(team.id) ?? team),
      newPlayers: allNewPlayers,
      playerUpdates: allPlayerUpdates
    };
  },

  // ─── 9. SPRAWDZENIE OKNA ZAMROŻENIA KADRY ────────────────────────────────────

  isSquadFrozen: (currentDate: Date, seasonStartYear: number): boolean => {
    const schedule = NT_SCHEDULE_BY_YEAR[seasonStartYear];
    if (!schedule) return false;

    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    const limitMs = today.getTime() + NT_FREEZE_DAYS * 24 * 60 * 60 * 1000;

    return schedule.some(md => {
      const calYear = md.month >= 6 ? seasonStartYear : seasonStartYear + 1;
      const matchDate = new Date(calYear, md.month, md.day);
      matchDate.setHours(0, 0, 0, 0);
      const matchMs = matchDate.getTime();
      return matchMs >= today.getTime() && matchMs <= limitMs;
    });
  },
};
