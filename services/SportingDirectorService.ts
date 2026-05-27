import { Club, Fixture, MailMessage, MailType, MatchStatus, Player, Region, SportingDirector, SportingDirectorObjective, SportingDirectorObjectiveResponse, SportingDirectorObjectiveType, SportingDirectorPersonality, SportingDirectorPolicyItem, TransferContractInput } from '../types';
import { NameGeneratorService } from './NameGeneratorService';

type DirectorNationality = {
  region: Region;
  country: string;
};

type AttributeKey =
  | 'patience'
  | 'control'
  | 'flexibility'
  | 'ambition'
  | 'footballKnowledge'
  | 'negotiation'
  | 'developmentVision'
  | 'financialDiscipline';

const EUROPEAN_NATIONALITIES: DirectorNationality[] = [
  { region: Region.GERMANY, country: 'Niemcy' },
  { region: Region.FRANCE, country: 'Francja' },
  { region: Region.TURKEY, country: 'Turcja' },
  { region: Region.BENELUX, country: 'Belgia' },
  { region: Region.BENELUX, country: 'Holandia' },
  { region: Region.CZ_SK, country: 'Czechy' },
  { region: Region.CZ_SK, country: 'Slowacja' },
  { region: Region.SPAIN, country: 'Hiszpania' },
  { region: Region.ITALY, country: 'Wlochy' },
  { region: Region.IBERIA, country: 'Portugalia' },
  { region: Region.BALKANS, country: 'Chorwacja' },
  { region: Region.BALKANS, country: 'Serbia' },
  { region: Region.SCANDINAVIA, country: 'Dania' },
  { region: Region.SWEDEN, country: 'Szwecja' },
  { region: Region.ROMANIA, country: 'Rumunia' },
  { region: Region.HUNGARIAN, country: 'Wegry' },
];

const PERSONALITIES: SportingDirectorPersonality[] = [
  'CONTROLLER',
  'VISIONARY',
  'ACCOUNTANT',
  'PARTNER',
  'POLITICIAN',
  'TALENT_HUNTER',
];

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

const randomInt = (min: number, max: number, rng: () => number): number =>
  Math.floor(min + rng() * (max - min + 1));

const weightedAge = (rng: () => number): number => {
  const roll = rng();
  if (roll < 0.12) return randomInt(34, 40, rng);
  if (roll < 0.82) return randomInt(41, 58, rng);
  return randomInt(59, 68, rng);
};

const pickNationality = (rng: () => number): DirectorNationality => {
  if (rng() < 0.9) {
    return { region: Region.POLAND, country: 'Polska' };
  }

  return EUROPEAN_NATIONALITIES[randomInt(0, EUROPEAN_NATIONALITIES.length - 1, rng)];
};

const pickPersonality = (club: Club, rng: () => number): SportingDirectorPersonality => {
  const candidates = [...PERSONALITIES];

  if ((club.reputation ?? 5) >= 8 && rng() < 0.25) return 'CONTROLLER';
  if ((club.budget ?? 0) < 5_000_000 && rng() < 0.25) return 'ACCOUNTANT';

  return candidates[randomInt(0, candidates.length - 1, rng)];
};

const baseAttributes = (rng: () => number): Record<AttributeKey, number> => ({
  patience: randomInt(7, 15, rng),
  control: randomInt(7, 15, rng),
  flexibility: randomInt(7, 15, rng),
  ambition: randomInt(7, 15, rng),
  footballKnowledge: randomInt(7, 15, rng),
  negotiation: randomInt(7, 15, rng),
  developmentVision: randomInt(7, 15, rng),
  financialDiscipline: randomInt(7, 15, rng),
});

const applyPersonality = (
  attrs: Record<AttributeKey, number>,
  personality: SportingDirectorPersonality,
  rng: () => number
): Record<AttributeKey, number> => {
  const adjust = (key: AttributeKey, delta: number) => {
    attrs[key] = clamp(attrs[key] + delta + randomInt(-1, 1, rng), 1, 20);
  };

  switch (personality) {
    case 'CONTROLLER':
      adjust('control', 5);
      adjust('ambition', 2);
      adjust('flexibility', -4);
      adjust('patience', -2);
      break;
    case 'VISIONARY':
      adjust('developmentVision', 5);
      adjust('ambition', 3);
      adjust('patience', 2);
      adjust('financialDiscipline', -2);
      break;
    case 'ACCOUNTANT':
      adjust('financialDiscipline', 5);
      adjust('negotiation', 3);
      adjust('ambition', -2);
      adjust('developmentVision', -1);
      break;
    case 'PARTNER':
      adjust('flexibility', 5);
      adjust('patience', 4);
      adjust('control', -4);
      adjust('footballKnowledge', 2);
      break;
    case 'POLITICIAN':
      adjust('control', 3);
      adjust('negotiation', 2);
      adjust('flexibility', -2);
      adjust('footballKnowledge', -1);
      break;
    case 'TALENT_HUNTER':
      adjust('developmentVision', 5);
      adjust('footballKnowledge', 3);
      adjust('negotiation', 2);
      adjust('financialDiscipline', -1);
      break;
    default:
      break;
  }

  return attrs;
};

const buildId = (clubId: string, firstName: string, lastName: string, rng: () => number): string =>
  `SD_${clubId}_${firstName}_${lastName}_${randomInt(1000, 9999, rng)}`.replace(/\W+/g, '_').toUpperCase();

const getLeaguePosition = (club: Club, leagueClubs: Club[]): number => {
  const sorted = [...leagueClubs].sort((a, b) =>
    b.stats.points - a.stats.points ||
    b.stats.goalDifference - a.stats.goalDifference ||
    b.stats.goalsFor - a.stats.goalsFor
  );
  const index = sorted.findIndex(entry => entry.id === club.id);
  return index >= 0 ? index + 1 : leagueClubs.length;
};

const getExpectedPosition = (club: Club, leagueSize: number): number => {
  const reputation = clamp(club.reputation ?? 5, 1, 10);
  return clamp(Math.round(leagueSize + 1 - (reputation / 10) * leagueSize), 1, leagueSize);
};

const getResultScoreFloor = (params: {
  club: Club;
  leaguePosition: number;
  expectedPosition: number;
  boardConfidence: number;
}): number => {
  const { club, leaguePosition, expectedPosition, boardConfidence } = params;
  const outperformance = expectedPosition - leaguePosition;

  if (leaguePosition === 1) {
    return expectedPosition >= 4 ? 84 : 78;
  }

  if (leaguePosition === 2) {
    if (expectedPosition === 1) return 70;
    if (expectedPosition >= 5) return 78;
    if (expectedPosition >= 3) return 72;
  }

  if (outperformance >= 4) return 74;
  if (outperformance >= 2) return 68;
  if (leaguePosition <= expectedPosition) return boardConfidence >= 80 ? 64 : 60;

  if ((club.boardConfidence ?? 75) >= 88 && outperformance >= 1) {
    return 66;
  }

  return 0;
};

const getRecentFormScore = (club: Club): number => {
  const recent = (club.stats.form || []).slice(-5);
  if (recent.length === 0) return 0;
  const points = recent.reduce((sum, result) => {
    if (result === 'W') return sum + 3;
    if (result === 'R') return sum + 1;
    return sum;
  }, 0);
  return (points / (recent.length * 3)) * 100;
};

const getYouthUsageScore = (players: Player[]): number => {
  const prospects = players.filter(player => player.age <= 21 && player.attributes.talent >= 70);
  if (prospects.length === 0) return 55;

  const totalMinutesSignal = prospects.reduce((sum, player) => {
    const playerCap = player.attributes.talent >= 80 ? 540 : 360;
    return sum + Math.min(getPlayerMinutes(player), playerCap);
  }, 0);
  const maxSignal = prospects.reduce((sum, player) => sum + (player.attributes.talent >= 80 ? 540 : 360), 0);
  return clamp((totalMinutesSignal / Math.max(1, maxSignal)) * 100, 0, 100);
};

const getFinancialScore = (club: Club): number => {
  if (club.budget < 0) return 10;
  if (club.budget < 1_000_000) return 35;
  if (club.budget < 5_000_000) return 55;
  return 75;
};

const personalityReviewBias = (director: SportingDirector): number => {
  switch (director.personality) {
    case 'CONTROLLER':
      return -4;
    case 'ACCOUNTANT':
      return director.financialDiscipline >= 15 ? -2 : 0;
    case 'PARTNER':
      return 5;
    case 'VISIONARY':
    case 'TALENT_HUNTER':
      return director.developmentVision >= 15 ? 2 : 0;
    case 'POLITICIAN':
      return -2;
    default:
      return 0;
  }
};

const getTone = (score: number): 'POSITIVE' | 'MIXED' | 'NEGATIVE' => {
  if (score >= 64) return 'POSITIVE';
  if (score >= 42) return 'MIXED';
  return 'NEGATIVE';
};

const getPlayerSquadRank = (player: Player, squad: Player[]): number => {
  const sorted = [...squad].sort((a, b) => b.overallRating - a.overallRating);
  const index = sorted.findIndex(entry => entry.id === player.id);
  return index >= 0 ? index + 1 : squad.length;
};

const isYoungAsset = (player: Player): boolean =>
  player.age <= 22 && player.attributes.talent >= 72;

const getEstimatedValue = (player: Player): number =>
  player.marketValue || player.transferListPrice || Math.max(100_000, player.overallRating * player.overallRating * 1200);

const getTotalWageBill = (players: Player[]): number =>
  players.reduce((sum, player) => sum + Math.max(0, player.annualSalary || 0), 0);

const getPlayerMinutes = (player: Player | undefined): number =>
  player?.stats?.minutesPlayed ?? Math.max(0, (player?.stats?.matchesPlayed ?? 0) * 70);

const getYouthProspects = (players: Player[]): Player[] =>
  players.filter(player => player.age <= 21 && player.attributes.talent >= 68);

const getYouthMinutesSignal = (players: Player[]): number =>
  getYouthProspects(players).reduce((sum, player) => sum + getPlayerMinutes(player), 0);

const getUnderusedYouthProspects = (club: Club, players: Player[]): Player[] => {
  const matchesPlayed = Math.max(1, club.stats.played);
  return getYouthProspects(players).filter(player => {
    const minutes = getPlayerMinutes(player);
    const baseline = player.attributes.talent >= 80
      ? Math.min(540, matchesPlayed * 45)
      : player.attributes.talent >= 74
        ? Math.min(420, matchesPlayed * 32)
        : Math.min(300, matchesPlayed * 24);
    return minutes < baseline;
  });
};

const buildDirectorMail = (params: {
  club: Club;
  director: SportingDirector;
  date: Date;
  subject: string;
  body: string;
  priority?: number;
  key?: string;
  metadata?: MailMessage['metadata'];
}): MailMessage => ({
  id: params.key
    ? `SPORTING_DIRECTOR_${slugify(params.club.id)}_${slugify(params.key)}`
    : `SPORTING_DIRECTOR_${slugify(params.club.id)}_${params.date.getTime()}_${slugify(params.subject)}`,
  sender: `${params.director.firstName} ${params.director.lastName}`,
  role: 'Dyrektor sportowy',
  subject: params.subject,
  body: params.body,
  date: new Date(params.date),
  isRead: false,
  type: MailType.BOARD,
  priority: params.priority ?? 76,
  metadata: params.metadata,
});

const playerName = (player: Player): string => `${player.firstName} ${player.lastName}`;

const toPolicyItem = (player: Player, note: string): SportingDirectorPolicyItem => ({
  playerId: player.id,
  playerName: playerName(player),
  note,
});

const uniqueById = (players: Player[]): Player[] => {
  const seen = new Set<string>();
  return players.filter(player => {
    if (seen.has(player.id)) return false;
    seen.add(player.id);
    return true;
  });
};

const pickProtectedPlayers = (squad: Player[], director: SportingDirector): SportingDirectorPolicyItem[] => {
  const candidates = [...squad]
    .filter(player => player.squadRole === 'KEY_PLAYER' || player.overallRating >= 68 || isYoungAsset(player))
    .sort((a, b) =>
      ((b.squadRole === 'KEY_PLAYER' ? 16 : 0) + b.overallRating + b.attributes.talent * 0.35 + (isYoungAsset(b) ? director.developmentVision : 0) + ((b.attributes.leadership ?? 0) >= 80 ? 10 : 0)) -
      ((a.squadRole === 'KEY_PLAYER' ? 16 : 0) + a.overallRating + a.attributes.talent * 0.35 + (isYoungAsset(a) ? director.developmentVision : 0) + ((a.attributes.leadership ?? 0) >= 80 ? 10 : 0))
    );

  return uniqueById(candidates).slice(0, 3).map(player => {
    const note = isYoungAsset(player)
      ? 'chroniony jako kapital rozwojowy'
      : player.squadRole === 'KEY_PLAYER'
        ? 'filary projektu sportowego'
        : 'wysoka wartosc sportowa dla skladu';
    return toPolicyItem(player, note);
  });
};

const pickSellCandidates = (squad: Player[], protectedIds: Set<string>, director: SportingDirector): SportingDirectorPolicyItem[] => {
  const averageOvr = squad.length > 0
    ? squad.reduce((sum, player) => sum + player.overallRating, 0) / squad.length
    : 60;

  const candidates = [...squad]
    .filter(player => !protectedIds.has(player.id) && player.squadRole !== 'KEY_PLAYER')
    .sort((a, b) => {
      const score = (player: Player): number =>
        (player.age >= 30 ? 16 : 0) +
        (player.overallRating < averageOvr - 4 ? 12 : 0) +
        (player.annualSalary > 900_000 ? director.financialDiscipline : 0) +
        (player.contractEndDate ? Math.max(0, 2028 - new Date(player.contractEndDate).getFullYear()) * 2 : 0) -
        (player.attributes.talent >= 72 && player.age <= 23 ? 20 : 0);
      return score(b) - score(a);
    });

  return candidates.slice(0, 3).map(player => {
    const note = player.age >= 30
      ? 'mozliwa sprzedaz przy dobrej ofercie'
      : player.overallRating < averageOvr - 4
        ? 'nie daje przewagi na tle kadry'
        : 'do rozwazenia przy presji budzetowej';
    return toPolicyItem(player, note);
  });
};

const pickDevelopmentPlayers = (squad: Player[], protectedIds: Set<string>): SportingDirectorPolicyItem[] =>
  [...squad]
    .filter(player => player.age <= 21 && player.attributes.talent >= 68)
    .sort((a, b) => b.attributes.talent - a.attributes.talent || b.overallRating - a.overallRating)
    .slice(0, 3)
    .map(player => toPolicyItem(
      player,
      protectedIds.has(player.id) ? 'minuty i cierpliwosc, bez pochopnej sprzedazy' : 'wprowadzac ostroznie do rotacji'
    ));

const getPositionFitScore = (player: Player, squad: Player[]): number => {
  const samePosition = squad.filter(squadPlayer => squadPlayer.position === player.position);
  if (samePosition.length === 0) return 24;

  const bestAtPosition = Math.max(...samePosition.map(squadPlayer => squadPlayer.overallRating));
  const positionDepth = samePosition.length;
  let score = player.overallRating - bestAtPosition;
  if (positionDepth < 2) score += 8;
  if (player.overallRating >= bestAtPosition + 2) score += 8;
  return score;
};

const getYouthAppearanceSignal = (players: Player[]): number =>
  getYouthProspects(players).reduce((sum, player) => sum + player.stats.matchesPlayed, 0);

const addDaysIso = (date: Date, days: number): string => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
};

const SPORTING_DIRECTOR_OBJECTIVE_COOLDOWN_DAYS = 18;

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getDaysBetweenIsoDates = (fromIso: string, toIso: string): number => {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
};

const getUpcomingLeagueFixturesBlock = (
  club: Club,
  fixtures: Fixture[] | undefined,
  fromDate: Date,
  desiredMatches: number,
  baseDueDays: number
): Fixture[] => {
  if (!fixtures?.length || desiredMatches <= 0) return [];

  const startTime = new Date(toIsoDate(fromDate)).getTime();
  const hardLimit = addDays(fromDate, Math.max(baseDueDays, 14)).getTime();
  const leagueFixtures = fixtures
    .filter(fixture =>
      fixture.status === MatchStatus.SCHEDULED &&
      fixture.leagueId === club.leagueId &&
      (fixture.homeTeamId === club.id || fixture.awayTeamId === club.id) &&
      fixture.date.getTime() >= startTime
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const block: Fixture[] = [];
  let previousTime: number | null = null;

  for (const fixture of leagueFixtures) {
    const currentTime = fixture.date.getTime();
    const gapDays = previousTime == null ? 0 : (currentTime - previousTime) / (1000 * 60 * 60 * 24);
    if (block.length > 0 && gapDays > 18) break;
    if (block.length > 0 && currentTime > hardLimit) break;
    block.push(fixture);
    previousTime = currentTime;
    if (block.length >= desiredMatches) break;
  }

  return block;
};

const calibrateObjectiveToSchedule = (params: {
  club: Club;
  date: Date;
  fixtures?: Fixture[];
  type: SportingDirectorObjectiveType;
  title: string;
  description: string;
  target: number;
  dueDays: number;
  contextTag?: SportingDirectorObjective['contextTag'];
}): {
  title: string;
  description: string;
  target: number;
  dueAt: string;
  contextTag?: SportingDirectorObjective['contextTag'];
} => {
  const { club, date, fixtures, type, title, description, target, dueDays, contextTag } = params;
  const fallbackDueAt = addDaysIso(date, dueDays);

  if (type !== 'POINTS_RUN' && type !== 'DEFENSIVE_RUN' && type !== 'WIN_NEXT_MATCH' && type !== 'AVOID_DEFEAT' && type !== 'HOLD_TOP_SPOT' && type !== 'STAY_IN_TOP_THREE' && type !== 'PLAYER_MINUTES' && type !== 'YOUTH_DEVELOPMENT') {
    return { title, description, target, dueAt: fallbackDueAt, contextTag };
  }

  const desiredMatches =
    type === 'POINTS_RUN'
      ? contextTag === 'ULTIMATUM' ? 5 : 3
      : type === 'DEFENSIVE_RUN'
        ? 3
        : type === 'PLAYER_MINUTES'
          ? (target >= 270 ? 5 : 3)
          : type === 'YOUTH_DEVELOPMENT'
            ? (target >= 360 ? 5 : 4)
            : 1;
  const searchDays = (type === 'PLAYER_MINUTES' || type === 'YOUTH_DEVELOPMENT') ? 90 : dueDays;
  const block = getUpcomingLeagueFixturesBlock(club, fixtures, date, desiredMatches, searchDays);

  if (block.length === 0) {
    return { title, description, target, dueAt: fallbackDueAt, contextTag };
  }

  const dueAt = toIsoDate(addDays(block[block.length - 1].date, 1));

  if (type === 'POINTS_RUN') {
    const maxPoints = block.length * 3;
    const calibratedTarget = Math.min(target, maxPoints);
    const descriptionPrefix = block.length === 1
      ? 'W najblizszym meczu ligowym'
      : `W najblizszych ${block.length} meczach ligowych`;
    const calibratedDescription = contextTag === 'ULTIMATUM'
      ? `${descriptionPrefix} oczekuje co najmniej ${calibratedTarget} ${calibratedTarget === 1 ? 'punktu' : calibratedTarget >= 2 && calibratedTarget <= 4 ? 'punktow' : 'punktow'}. Jesli nie bedzie reakcji, moja cierpliwosc i wplyw na zarzad wyraznie sie zmienia.`
      : `${descriptionPrefix} oczekuje co najmniej ${calibratedTarget} ${calibratedTarget === 1 ? 'punktu' : calibratedTarget >= 2 && calibratedTarget <= 4 ? 'punktow' : 'punktow'} w lidze.`;
    return {
      title,
      description: calibratedDescription,
      target: calibratedTarget,
      dueAt,
      contextTag,
    };
  }

  if (type === 'WIN_NEXT_MATCH' || type === 'AVOID_DEFEAT') {
    const calibratedDescription = type === 'WIN_NEXT_MATCH'
      ? 'Oczekuje zwyciestwa w najblizszym meczu ligowym. Ten mecz ma pokazac, ze druzyna potrafi odpowiedziec konkretem.'
      : 'Oczekuje minimum punktu w najblizszym meczu ligowym. Nie akceptuje, zeby sztab oddal ten mecz bez reakcji.';
    return {
      title,
      description: calibratedDescription,
      target,
      dueAt,
      contextTag,
    };
  }

  if (type === 'HOLD_TOP_SPOT' || type === 'STAY_IN_TOP_THREE') {
    const calibratedDescription = type === 'HOLD_TOP_SPOT'
      ? 'Oczekuje utrzymania pozycji lidera po najblizszym meczu ligowym. Skoro jestesmy na gorze, trzeba to obronic.'
      : 'Oczekuje utrzymania zespolu w czolowce po najblizszym meczu ligowym. Nie mozemy wypasc z top 3 przy obecnym ukladzie.';
    return {
      title,
      description: calibratedDescription,
      target,
      dueAt,
      contextTag,
    };
  }

  if (type === 'PLAYER_MINUTES' || type === 'YOUTH_DEVELOPMENT') {
    return { title, description, target, dueAt, contextTag };
  }

  const calibratedDescription = block.length === 1
    ? `W najblizszym meczu ligowym oczekuje poprawy kontroli meczu. Maksymalnie ${target} straconych goli do terminu oceny.`
    : `W najblizszych ${block.length} meczach ligowych oczekuje poprawy kontroli meczu. Maksymalnie ${target} straconych goli do terminu oceny.`;

  return {
    title,
    description: calibratedDescription,
    target,
    dueAt,
    contextTag,
  };
};

const getObjectiveContext = (
  club: Club,
  director: SportingDirector,
  leagueClubs?: Club[]
): {
  boardConfidence: number;
  leaguePosition: number | null;
  expectedPosition: number | null;
  isLeader: boolean;
  isClearlyAboveExpectation: boolean;
  isUnderPressure: boolean;
} => {
  const boardConfidence = club.boardConfidence ?? 75;
  const leaguePosition = leagueClubs && leagueClubs.length > 0
    ? getLeaguePosition(club, leagueClubs)
    : null;
  const expectedPosition = leagueClubs && leagueClubs.length > 0
    ? getExpectedPosition(club, Math.max(1, leagueClubs.length))
    : null;
  const isLeader = leaguePosition === 1;
  const isClearlyAboveExpectation = leaguePosition !== null && expectedPosition !== null
    ? leaguePosition <= Math.max(1, expectedPosition - 2)
    : false;
  const isUnderPressure =
    boardConfidence < 46 ||
    director.relationshipWithManager < 32 ||
    (leaguePosition !== null && expectedPosition !== null && leaguePosition > expectedPosition + 2);

  return {
    boardConfidence,
    leaguePosition,
    expectedPosition,
    isLeader,
    isClearlyAboveExpectation,
    isUnderPressure,
  };
};

const chooseObjectiveType = (
  club: Club,
  players: Player[],
  director: SportingDirector,
  leagueClubs?: Club[]
): SportingDirectorObjectiveType => {
  const underusedYouthProspects = getUnderusedYouthProspects(club, players);
  const youthUsageScore = getYouthUsageScore(players);
  const wageBill = getTotalWageBill(players);
  const averageSalary = players.length > 0 ? wageBill / players.length : 0;
  const payrollPressure = club.budget < averageSalary * 4 || wageBill > Math.max(club.budget * 0.8, 6_000_000);
  const context = getObjectiveContext(club, director, leagueClubs);

  if ((director.relationshipWithManager < 30 && context.boardConfidence < 46) || (context.boardConfidence < 35 && director.control >= 14)) {
    return 'POINTS_RUN';
  }

  if (payrollPressure && director.financialDiscipline >= 14) {
    return 'WAGE_DISCIPLINE';
  }

  if (
    underusedYouthProspects.length > 0 &&
    youthUsageScore < 58 &&
    (director.personality === 'TALENT_HUNTER' || director.personality === 'VISIONARY' || director.developmentVision >= 15)
  ) {
    const topProspect = [...underusedYouthProspects].sort((a, b) =>
      b.attributes.talent - a.attributes.talent ||
      b.overallRating - a.overallRating ||
      getPlayerMinutes(a) - getPlayerMinutes(b)
    )[0];
    return (director.developmentVision >= 15 && (topProspect?.attributes.talent ?? 0) >= 74) ? 'PLAYER_MINUTES' : 'YOUTH_DEVELOPMENT';
  }

  if ((context.isLeader || context.isClearlyAboveExpectation) && context.boardConfidence >= 68) {
    if (underusedYouthProspects.length > 0) {
      return director.developmentVision >= 14 ? 'PLAYER_MINUTES' : 'YOUTH_DEVELOPMENT';
    }
    if ((club.stats.goalsAgainst / Math.max(1, club.stats.played)) > 1.2) {
      return 'DEFENSIVE_RUN';
    }
    return context.isLeader ? 'HOLD_TOP_SPOT' : 'STAY_IN_TOP_THREE';
  }

  if (director.personality === 'ACCOUNTANT' || director.control >= 15) {
    return 'DEFENSIVE_RUN';
  }

  if ((club.stats.goalsAgainst / Math.max(1, club.stats.played)) > 1.55 && director.footballKnowledge >= 13) {
    return 'DEFENSIVE_RUN';
  }

  return demandingNextMatchObjective(club, director);
};

const demandingNextMatchObjective = (club: Club, director: SportingDirector): SportingDirectorObjectiveType => {
  const form = club.stats.form.slice(-3);
  const losses = form.filter(result => result === 'L').length;
  if (losses >= 2 || director.control >= 15 || director.ambition >= 15) {
    return 'WIN_NEXT_MATCH';
  }
  return 'AVOID_DEFEAT';
};

const buildObjectiveDetails = (
  type: SportingDirectorObjectiveType,
  director: SportingDirector,
  club?: Club,
  focusPlayer?: Player | null,
  squad?: Player[],
  leagueClubs?: Club[]
): {
  title: string;
  description: string;
  target: number;
  dueDays?: number;
  contextTag?: SportingDirectorObjective['contextTag'];
} => {
  const demanding = director.relationshipWithManager < 35 || director.ambition >= 15 || director.control >= 15;
  const context = club ? getObjectiveContext(club, director, leagueClubs) : null;

  switch (type) {
    case 'WIN_NEXT_MATCH':
      return {
        title: 'Cel dyrektora: wygrac kolejny mecz',
        description: 'Oczekuje zwyciestwa w najblizszym meczu ligowym. Potrzebuje czytelnej odpowiedzi druzyny na boisku.',
        target: 3,
        dueDays: 10,
      };
    case 'AVOID_DEFEAT':
      return {
        title: 'Cel dyrektora: nie przegrac kolejnego meczu',
        description: 'Oczekuje minimum punktu w najblizszym meczu ligowym. W tym momencie najwazniejsza jest stabilna reakcja zespolu.',
        target: 1,
        dueDays: 10,
      };
    case 'HOLD_TOP_SPOT':
      return {
        title: 'Cel dyrektora: utrzymac fotel lidera',
        description: 'Oczekuje utrzymania pierwszego miejsca po najblizszym meczu ligowym. Skoro jestesmy na szczycie, trzeba to potwierdzic.',
        target: 1,
        dueDays: 10,
      };
    case 'STAY_IN_TOP_THREE':
      return {
        title: 'Cel dyrektora: utrzymac sie w czolowce',
        description: 'Oczekuje utrzymania druzyny w top 3 po najblizszym meczu ligowym. Taki poziom trzeba teraz obronic.',
        target: 3,
        dueDays: 10,
      };
    case 'PLAYER_MINUTES': {
      const playerLabel = focusPlayer ? `${focusPlayer.firstName} ${focusPlayer.lastName}` : 'wskazanego mlodego zawodnika';
      return {
        title: `Cel dyrektora: minuty dla ${focusPlayer?.lastName ?? 'mlodego'}`,
        description: demanding
          ? `Chce, zeby ${playerLabel} dostal co najmniej 270 minut w najblizszych 5 meczach. To jest dla mnie test, czy sztab rzeczywiscie rozwija talent.`
          : `Oczekuje, ze ${playerLabel} dostanie co najmniej 180 minut w najblizszych tygodniach. Potrzebuje dla niego realnej sciezki rozwoju.`,
        target: demanding ? 270 : 180,
        dueDays: demanding ? 35 : 28,
      };
    }
    case 'WAGE_DISCIPLINE': {
      const wageBill = getTotalWageBill(squad || []);
      const reductionTarget = Math.max(180_000, Math.round(wageBill * (demanding ? 0.07 : 0.045)));
      return {
        title: 'Cel dyrektora: obnizyc budzet plac',
        description: demanding
          ? `Musisz obciac roczny budzet plac przynajmniej o ${reductionTarget.toLocaleString('pl-PL')} PLN. Ta struktura wynagrodzen staje sie dla klubu ryzykowna.`
          : `Chce zobaczyc redukcje budzetu plac o co najmniej ${reductionTarget.toLocaleString('pl-PL')} PLN. Potrzebujemy wiekszej dyscypliny finansowej.`,
        target: reductionTarget,
        dueDays: 35,
        contextTag: 'WAGE_ALERT',
      };
    }
    case 'YOUTH_DEVELOPMENT':
      return {
        title: 'Cel dyrektora: minuty dla mlodych',
        description: demanding
          ? 'W najblizszych tygodniach oczekuje co najmniej 360 lacznych minut dla zawodnikow U21 o wysokim potencjale.'
          : 'W najblizszych tygodniach oczekuje co najmniej 240 lacznych minut dla zawodnikow U21 o wysokim potencjale.',
        target: demanding ? 360 : 240,
      };
    case 'DEFENSIVE_RUN':
      return {
        title: 'Cel dyrektora: uporzadkowac defensywe',
        description: demanding
          ? 'W kolejnych spotkaniach liga musi wygladac stabilniej. Maksymalnie 3 stracone gole do terminu oceny.'
          : 'W kolejnych spotkaniach oczekuje poprawy kontroli meczu. Maksymalnie 5 straconych goli do terminu oceny.',
        target: demanding ? 3 : 5,
      };
    case 'POINTS_RUN':
    default:
      if ((club?.boardConfidence ?? 75) < 40 || director.relationshipWithManager < 30) {
        return {
          title: 'Cel dyrektora: ultimatum punktowe',
          description: 'To jest ultimatum. Oczekuje 7 punktow w 5 meczach ligowych. Jesli nie bedzie reakcji, moja cierpliwosc i wplyw na zarzad wyraznie sie zmienia.',
          target: 7,
          dueDays: 35,
          contextTag: 'ULTIMATUM',
        };
      }
      if (context?.isLeader && context.boardConfidence >= 75) {
        return {
          title: 'Cel dyrektora: utrzymac tempo lidera',
          description: 'Jestesmy na czele i nie chce nerwowych ruchow. Oczekuje spokojnego utrzymania poziomu: minimum 4 punkty ligowe do terminu oceny.',
          target: 4,
          dueDays: 21,
        };
      }
      if (context?.isClearlyAboveExpectation && context.boardConfidence >= 68) {
        return {
          title: 'Cel dyrektora: podtrzymac dobra serie',
          description: 'Druzyna pracuje ponad oczekiwania. Chce, zeby ten trend zostal utrzymany: minimum 5 punktow ligowych do terminu oceny.',
          target: 5,
          dueDays: 28,
        };
      }
      return {
        title: 'Cel dyrektora: seria punktowa',
        description: demanding
          ? 'W najblizszym okresie oczekuje co najmniej 8 punktow w lidze do terminu oceny.'
          : 'W najblizszym okresie oczekuje co najmniej 6 punktow w lidze do terminu oceny.',
        target: demanding ? 8 : 6,
        dueDays: 28,
      };
  }
};

const evaluateObjectiveProgress = (
  objective: SportingDirectorObjective,
  club: Club,
  players: Player[],
  leagueClubs?: Club[]
): { completed: boolean; note: string; progress: number } => {
  if (objective.type === 'WIN_NEXT_MATCH') {
    const pointsGained = club.stats.points - objective.baselinePoints;
    const matchesPlayed = club.stats.played - objective.baselinePlayed;
    return {
      completed: matchesPlayed >= 1 && pointsGained >= 3,
      progress: pointsGained,
      note: `Kolejny mecz ligowy: ${pointsGained >= 3 ? 'zwyciestwo' : matchesPlayed >= 1 ? 'bez zwyciestwa' : 'jeszcze nie rozegrany'}.`,
    };
  }

  if (objective.type === 'AVOID_DEFEAT') {
    const pointsGained = club.stats.points - objective.baselinePoints;
    const matchesPlayed = club.stats.played - objective.baselinePlayed;
    return {
      completed: matchesPlayed >= 1 && pointsGained >= 1,
      progress: pointsGained,
      note: `Kolejny mecz ligowy: ${pointsGained >= 1 ? 'minimum punkt wykonane' : matchesPlayed >= 1 ? 'porażka' : 'jeszcze nie rozegrany'}.`,
    };
  }

  if (objective.type === 'HOLD_TOP_SPOT' || objective.type === 'STAY_IN_TOP_THREE') {
    if (!leagueClubs || leagueClubs.length === 0) {
      return {
        completed: false,
        progress: 0,
        note: 'Brak danych ligowych do oceny pozycji zespolu.',
      };
    }
    const currentRank = getLeaguePosition(club, leagueClubs);
    const matchesPlayed = club.stats.played - objective.baselinePlayed;
    const targetRank = objective.type === 'HOLD_TOP_SPOT' ? 1 : 3;
    return {
      completed: matchesPlayed >= 1 && currentRank <= targetRank,
      progress: currentRank,
      note: `Po najblizszym meczu ligowym zespol zajmuje ${currentRank}. miejsce (cel: max ${targetRank}).`,
    };
  }

  if (objective.type === 'POINTS_RUN') {
    const pointsGained = club.stats.points - objective.baselinePoints;
    return {
      completed: pointsGained >= objective.target,
      progress: pointsGained,
      note: `Zdobyte punkty: ${pointsGained}/${objective.target}.`,
    };
  }

  if (objective.type === 'YOUTH_DEVELOPMENT') {
    const usesLegacyAppearances = objective.target <= 10 && objective.baselineYouthMinutes == null;
    const youthProgress = usesLegacyAppearances
      ? getYouthAppearanceSignal(players) - objective.baselineYouthAppearances
      : getYouthMinutesSignal(players) - (objective.baselineYouthMinutes ?? objective.baselineYouthAppearances);
    return {
      completed: youthProgress >= objective.target,
      progress: youthProgress,
      note: usesLegacyAppearances
        ? `Wystepy mlodych zawodnikow: ${youthProgress}/${objective.target}.`
        : `Minuty mlodych zawodnikow: ${youthProgress}/${objective.target}.`,
    };
  }

  if (objective.type === 'PLAYER_MINUTES') {
    const targetPlayer = players.find(player => player.id === objective.targetPlayerId);
    const gainedMinutes = getPlayerMinutes(targetPlayer) - (objective.baselinePlayerMinutes ?? 0);
    return {
      completed: gainedMinutes >= objective.target,
      progress: gainedMinutes,
      note: `${objective.targetPlayerName ?? 'Wskazany zawodnik'} dostal ${gainedMinutes}/${objective.target} minut.`,
    };
  }

  if (objective.type === 'WAGE_DISCIPLINE') {
    const currentWageBill = getTotalWageBill(players);
    const saved = Math.max(0, (objective.baselineWageBill ?? currentWageBill) - currentWageBill);
    return {
      completed: saved >= objective.target,
      progress: saved,
      note: `Redukcja budzetu plac: ${saved.toLocaleString('pl-PL')}/${objective.target.toLocaleString('pl-PL')} PLN.`,
    };
  }

  const goalsConceded = club.stats.goalsAgainst - objective.baselineGoalsAgainst;
  const matchesPlayed = club.stats.played - objective.baselinePlayed;
  return {
    completed: matchesPlayed >= 2 && goalsConceded <= objective.target,
    progress: goalsConceded,
    note: `Stracone gole: ${goalsConceded}/${objective.target}. Mecze w okresie: ${matchesPlayed}.`,
  };
};

const softenObjective = (objective: SportingDirectorObjective): SportingDirectorObjective => {
  const dueAt = addDaysIso(new Date(objective.dueAt), 7);

  if (objective.type === 'WIN_NEXT_MATCH') {
    return { ...objective, type: 'AVOID_DEFEAT', title: 'Cel dyrektora: nie przegrac kolejnego meczu', description: 'Oczekuje minimum punktu w najblizszym meczu ligowym. W tym momencie najwazniejsza jest stabilna reakcja zespolu.', target: 1, dueAt };
  }

  if (objective.type === 'HOLD_TOP_SPOT') {
    return { ...objective, type: 'STAY_IN_TOP_THREE', title: 'Cel dyrektora: utrzymac sie w czolowce', description: 'Oczekuje utrzymania druzyny w top 3 po najblizszym meczu ligowym. Taki poziom trzeba teraz obronic.', target: 3, dueAt };
  }

  if (objective.type === 'POINTS_RUN') {
    return { ...objective, target: Math.max(3, objective.target - 2), dueAt };
  }

  if (objective.type === 'YOUTH_DEVELOPMENT') {
    const nextTarget = objective.target <= 10 ? Math.max(1, objective.target - 1) : Math.max(120, objective.target - 90);
    return { ...objective, target: nextTarget, dueAt };
  }

  if (objective.type === 'PLAYER_MINUTES') {
    return { ...objective, target: Math.max(90, objective.target - 90), dueAt };
  }

  if (objective.type === 'WAGE_DISCIPLINE') {
    return { ...objective, target: Math.max(100_000, Math.round(objective.target * 0.75)), dueAt };
  }

  return { ...objective, target: objective.target + 2, dueAt };
};

const sharpenObjective = (objective: SportingDirectorObjective): SportingDirectorObjective => {
  if (objective.type === 'AVOID_DEFEAT') {
    return { ...objective, type: 'WIN_NEXT_MATCH', title: 'Cel dyrektora: wygrac kolejny mecz', description: 'Oczekuje zwyciestwa w najblizszym meczu ligowym. Potrzebuje czytelnej odpowiedzi druzyny na boisku.', target: 3 };
  }

  if (objective.type === 'STAY_IN_TOP_THREE') {
    return { ...objective, type: 'HOLD_TOP_SPOT', title: 'Cel dyrektora: utrzymac fotel lidera', description: 'Oczekuje utrzymania pierwszego miejsca po najblizszym meczu ligowym. Skoro jestesmy na szczycie, trzeba to potwierdzic.', target: 1 };
  }

  if (objective.type === 'POINTS_RUN') {
    return { ...objective, target: objective.target + 1 };
  }

  if (objective.type === 'YOUTH_DEVELOPMENT') {
    const nextTarget = objective.target <= 10 ? objective.target + 1 : objective.target + 90;
    return { ...objective, target: nextTarget };
  }

  if (objective.type === 'PLAYER_MINUTES') {
    return { ...objective, target: objective.target + 90 };
  }

  if (objective.type === 'WAGE_DISCIPLINE') {
    return { ...objective, target: Math.round(objective.target * 1.2) };
  }

  return { ...objective, target: Math.max(1, objective.target - 1) };
};

const buildReviewBody = (params: {
  club: Club;
  director: SportingDirector;
  score: number;
  relationDelta: number;
  influenceDelta: number;
  leaguePosition: number;
  expectedPosition: number;
  formScore: number;
  youthScore: number;
  financialScore: number;
  tone: 'POSITIVE' | 'MIXED' | 'NEGATIVE';
}): string => {
  const {
    club,
    director,
    score,
    relationDelta,
    influenceDelta,
    leaguePosition,
    expectedPosition,
    formScore,
    youthScore,
    financialScore,
    tone,
  } = params;

  const opening = tone === 'POSITIVE'
    ? 'Ten miesiac oceniam pozytywnie. Widze wyniki i kierunek pracy, ktory daje klubowi argumenty do dalszego zaufania.'
    : tone === 'MIXED'
      ? 'Ten miesiac oceniam ostroznie. Sa elementy, ktore wygladaja dobrze, ale widze tez obszary wymagajace szybkiej poprawy.'
      : 'Ten miesiac budzi moj niepokoj. Oczekuje jasnej reakcji, bo klub nie moze dryfowac bez odpowiedzi sportowej.';

  const overallLine = score >= 78
    ? 'Ogólna ocena: jestem bardzo zadowolony z pracy sztabu.'
    : score >= 64
      ? 'Ogólna ocena: ten kierunek pracy mi odpowiada.'
      : score >= 50
        ? 'Ogólna ocena: sytuacja jest pod kontrola, ale oczekuje wyrazniejszego progresu.'
        : score >= 38
          ? 'Ogólna ocena: widze za malo argumentow, by byc spokojnym o obecny kierunek.'
          : 'Ogólna ocena: obecny obraz druzyny wyraznie mnie nie przekonuje.';

  const pressureLine = director.control >= 15
    ? 'Bede blisko przygladal sie decyzjom kadrowym i transferowym. Przy tej skali kontroli oczekuje, ze wazne ruchy beda miec mocne uzasadnienie.'
    : director.flexibility >= 15
      ? 'Nie zamierzam reagowac nerwowo na pojedyncze wahania formy, ale chce widziec spojny plan.'
      : 'Nie interesuja mnie deklaracje bez przejscia na boisko. Liczy sie trend, praca z kadra i dyscyplina decyzji.';

  const youthLine = youthScore >= 78
    ? director.developmentVision >= 14
      ? `Rozwoj mlodych wyglada dobrze. W tym obszarze klub idzie w kierunku, ktory uwazam za wlasciwy dla ${club.name}.`
      : 'Rozwoj mlodych nie budzi moich zastrzezen.'
    : youthScore >= 55
      ? director.developmentVision >= 14
        ? 'Rozwoj mlodych jest poprawny, ale oczekuje odwazniejszego i bardziej konsekwentnego prowadzenia talentow.'
        : 'Rozwoj mlodych jest w porzadku, ale wciaz widze rezerwe.'
      : director.developmentVision >= 14
        ? 'Rozwoj mlodych jest dla mnie zbyt slaby. Klub nie moze gubic talentu przez brak jasnej sciezki.'
        : 'Rozwoj mlodych wymaga wiekszej uwagi ze strony sztabu.';

  const financeLine = financialScore >= 72
    ? director.financialDiscipline >= 14
      ? 'Sytuacja finansowa wyglada stabilnie. Struktura kosztow nie wymaga teraz nerwowych ruchow.'
      : 'Finanse klubu wygladaja bezpiecznie i daja nam normalna przestrzen do decyzji sportowych.'
    : financialScore >= 48
      ? director.financialDiscipline >= 14
        ? 'Finanse sa jeszcze pod kontrola, ale nie chce widziec niepotrzebnego ryzyka przy placach i kontraktach.'
        : 'Finanse wymagaja ostroznosci, choc sytuacja nie jest alarmowa.'
      : director.financialDiscipline >= 14
        ? 'Sytuacja finansowa zaczyna mnie niepokoic. Oczekuje wiekszej dyscypliny przy wydatkach i kontraktach.'
        : 'Finanse klubu wygladaja niepokojaco i trzeba uwazniej prowadzic decyzje kosztowe.';

  const relationLine = relationDelta >= 4
    ? 'Nasza relacja robocza wyraznie sie poprawia.'
    : relationDelta >= 1
      ? 'Nasza relacja robocza delikatnie sie poprawia.'
      : relationDelta === 0
        ? 'Nasza relacja robocza na razie pozostaje bez zmian.'
        : relationDelta <= -4
          ? 'Nasza relacja robocza wyraznie sie pogarsza.'
        : 'Nasza relacja robocza lekko sie pogarsza.';

  const boardLine = influenceDelta >= 4
    ? 'Przekazuje zarzadowi wyraznie pozytywny sygnal o pracy sztabu.'
    : influenceDelta >= 1
      ? 'Przekazuje zarzadowi umiarkowanie pozytywny sygnal o kierunku pracy sztabu.'
      : influenceDelta === 0
        ? 'Na ten moment nie zmieniam tonu wobec zarzadu.'
        : influenceDelta <= -4
          ? 'Przekazuje zarzadowi mocno krytyczny sygnal i oczekuje wzrostu presji.'
          : 'Przekazuje zarzadowi bardziej ostrozny sygnal niz dotad.';

  const formLine = formScore >= 74
    ? 'Forma z ostatnich spotkan daje mi argumenty do spokoju.'
    : formScore >= 52
      ? 'Forma z ostatnich spotkan jest nierowna i oczekuje wiekszej powtarzalnosci.'
      : 'Forma z ostatnich spotkan jest zbyt slaba, bym mogl przejsc nad tym spokojnie.';

  const positionLine = expectedPosition === 1
    ? leaguePosition === 1
      ? 'Pozycja w lidze odpowiada obecnym oczekiwaniom klubu. Jestesmy liderem i tego poziomu chcemy bronic.'
      : leaguePosition === 2
        ? 'Pozycja w lidze jest bardzo blisko celu. Jestesmy teraz na 2. miejscu, a oczekiwaniem klubu pozostaje realna walka o 1. miejsce.'
        : `Pozycja w lidze jest ponizej oczekiwan. Jestesmy teraz na ${leaguePosition}. miejscu, a klub oczekuje walki o 1. miejsce.`
    : leaguePosition < expectedPosition
      ? `Pozycja w lidze jest lepsza niz zakladany poziom klubu. Jestesmy teraz na ${leaguePosition}. miejscu, a wewnetrznie oczekiwalem okolic ${expectedPosition}. miejsca.`
      : leaguePosition === expectedPosition
        ? `Pozycja w lidze odpowiada obecnym oczekiwaniom klubu. Jestesmy teraz na ${leaguePosition}. miejscu.`
        : leaguePosition === expectedPosition + 1
          ? `Miejsce, które aktualnie zajmujemy w tabeli, jest lekko poniżej oczekiwań klubu. Wydaje mi się, że przy potencjale tej kadry powinniśmy realnie walczyć o wyższą pozycję.`
          : `Miejsce, które aktualnie zajmujemy w tabeli, jest zdecydowanie poniżej oczekiwań klubu. Wydaje mi się, że przy potencjale tej kadry powinniśmy realnie walczyć o wyższą pozycję.`;

  return [
    'Szanowny Panie Trenerze,',
    '',
    'Chciałbym odnieść się do obecnej sytuacji sportowej zespołu.',
    '',
    positionLine,
    '',
    tone === 'NEGATIVE'
      ? 'Nie oczekuję nagłych zmian decyzji, ale oczekujemy wyraźnej poprawy w najbliższych tygodniach. Ważne będzie ustabilizowanie formy, lepsze wykorzystanie zawodników oraz większa konsekwencja w grze.'
      : tone === 'MIXED'
        ? 'Widzę pewne obiecujące sygnały, ale oczekuję większej konsekwencji w kolejnych tygodniach. Stabilizacja formy i lepsze wykorzystanie potencjału kadry to priorytety na ten okres.'
        : 'Widzę wyraźne przełożenie wysiłku na wyniki. Kontynuujmy w tym kierunku i dbajmy o utrzymanie tego poziomu gry.',
    '',
    tone !== 'POSITIVE'
      ? 'Proszę o przygotowanie krótkiej oceny sytuacji oraz planu działań, który pozwoli nam wrócić na poziom zgodny z założeniami zarządu klubu.'
      : 'Dziękuję za dobrze wykonaną pracę i czekam na dalsze efekty w nadchodzących kolejkach.',
    '',
    'Z poważaniem,',
    `${director.firstName} ${director.lastName}`,
    `Dyrektor Sportowy, ${club.name}`,
  ].join('\n');
};

const getDevelopmentTarget = (players: Player[], club?: Club): Player | null => {
  const candidatePool = club ? getUnderusedYouthProspects(club, players) : getYouthProspects(players);
  return [...candidatePool]
    .sort((a, b) =>
      b.attributes.talent - a.attributes.talent ||
      b.overallRating - a.overallRating ||
      getPlayerMinutes(a) - getPlayerMinutes(b)
    )[0] ?? null;
};

const hasAdequateReplacement = (player: Player, squad: Player[]): boolean =>
  squad.some(candidate =>
    candidate.id !== player.id &&
    candidate.position === player.position &&
    candidate.overallRating >= player.overallRating - 5
  );

const isLockerRoomLeader = (player: Player, club: Club): boolean =>
  club.captainId === player.id || (player.attributes.leadership ?? 0) >= 80;

const hasMarketingWeight = (player: Player): boolean =>
  player.overallRating >= 77 ||
  (player.stats.goals ?? 0) + (player.stats.assists ?? 0) >= 14;

const buildDirectorAdvice = (params: {
  club: Club;
  player?: Player;
  squad?: Player[];
  fee?: number;
  salary?: number;
  years?: number;
}): string[] => {
  const { club, player, squad = [], fee, salary, years } = params;
  const director = club.sportingDirector;
  if (!director) return [];

  const notes: string[] = [];
  if (player) {
    if (isYoungAsset(player) && director.developmentVision >= 13) {
      notes.push('Chroni mlodych z wysokim potencjalem i nie lubi sprzedazy bez planu rozwoju.');
    }
    if (isLockerRoomLeader(player, club)) {
      notes.push('Duza wage przyklada do wpływu zawodnika na szatnie i hierarchie druzyny.');
    }
    if (hasMarketingWeight(player)) {
      notes.push('Patrzy tez na znaczenie marketingowe i wizerunkowe pilkarza.');
    }
  }
  if (typeof fee === 'number' && player) {
    const feeRatio = getEstimatedValue(player) > 0 ? fee / getEstimatedValue(player) : 1;
    if (feeRatio < 1 && director.financialDiscipline >= 13) {
      notes.push('Nie lubi schodzic ponizej wewnetrznej wyceny przy negocjacjach.');
    }
    if (feeRatio > 1.35 && director.financialDiscipline >= 13) {
      notes.push('Przy zbyt wysokiej cenie potrafi przyhamowac rozmowy i szukac lepszych warunkow.');
    }
  }
  if (typeof salary === 'number') {
    const averageSalary = squad.length > 0 ? getTotalWageBill(squad) / squad.length : salary;
    if (salary > averageSalary * 1.7 && director.financialDiscipline >= 13) {
      notes.push('Pilnuje struktury plac i nie chce rozbijac szatni jedna pensja.');
    }
  }
  if (typeof years === 'number' && player && player.age >= 30 && years >= 3) {
    notes.push('Dlugi kontrakt dla starszego pilkarza bedzie dla niego ryzykowny.');
  }
  if (director.relationshipWithManager >= 75) {
    notes.push('Przy dobrej relacji daje trenerowi wiecej swobody.');
  } else if (director.relationshipWithManager <= 35) {
    notes.push('Przy slabej relacji chetniej wchodzi w decyzje trenera.');
  }

  return notes.slice(0, 3);
};

export const SportingDirectorService = {
  generateForClub(club: Club, rng: () => number = Math.random): SportingDirector {
    const nationality = pickNationality(rng);
    const name = NameGeneratorService.getRandomName(nationality.region);
    const personality = pickPersonality(club, rng);
    const attrs = applyPersonality(baseAttributes(rng), personality, rng);

    return {
      id: buildId(club.id, name.firstName, name.lastName, rng),
      firstName: name.firstName,
      lastName: name.lastName,
      age: weightedAge(rng),
      nationality: nationality.region,
      nationalityCountry: nationality.country,
      patience: attrs.patience,
      control: attrs.control,
      flexibility: attrs.flexibility,
      ambition: attrs.ambition,
      footballKnowledge: attrs.footballKnowledge,
      negotiation: attrs.negotiation,
      developmentVision: attrs.developmentVision,
      financialDiscipline: attrs.financialDiscipline,
      relationshipWithManager: randomInt(45, 65, rng),
      personality,
    };
  },

  ensureForUserClub(clubs: Club[], userTeamId: string | null, rng: () => number = Math.random): Club[] {
    if (!userTeamId) return clubs;

    return clubs.map(club => {
      if (club.id !== userTeamId || club.sportingDirector) return club;
      return {
        ...club,
        sportingDirector: this.generateForClub(club, rng),
      };
    });
  },

  reviewManagerMonthly(params: {
    club: Club;
    players: Player[];
    leagueClubs: Club[];
    date: Date;
  }): { updatedClub: Club; mail: MailMessage | null; relationDelta: number; influenceDelta: number; score: number } {
    const { club, players, leagueClubs, date } = params;
    const director = club.sportingDirector;
    if (!director) return { updatedClub: club, mail: null, relationDelta: 0, influenceDelta: 0, score: 50 };

    const reviewDate = date.toISOString().slice(0, 10);
    if (club.lastSportingDirectorReviewDate === reviewDate) {
      return { updatedClub: club, mail: null, relationDelta: 0, influenceDelta: 0, score: 50 };
    }

    const leaguePosition = getLeaguePosition(club, leagueClubs);
    const expectedPosition = getExpectedPosition(club, Math.max(1, leagueClubs.length));
    const positionGap = expectedPosition - leaguePosition;
    const formScore = getRecentFormScore(club);
    const youthScore = getYouthUsageScore(players);
    const financialScore = getFinancialScore(club);
    const boardConfidence = club.boardConfidence ?? 75;

    const patienceShield = (director.patience + director.flexibility) * 0.55;
    const ambitionPressure = (director.ambition + director.control) * 0.65;
    const positionScore = clamp(55 + positionGap * 8, 0, 100);
    const developmentWeight = director.developmentVision >= 14 ? 0.22 : 0.13;
    const financialWeight = director.financialDiscipline >= 14 ? 0.22 : 0.12;
    const resultWeight = 1 - developmentWeight - financialWeight;

    const baseScore =
      ((positionScore * 0.58 + formScore * 0.42) * resultWeight) +
      (youthScore * developmentWeight) +
      (financialScore * financialWeight);

    const rawScore = clamp(baseScore + patienceShield - ambitionPressure + personalityReviewBias(director), 0, 100);
    const resultScoreFloor = getResultScoreFloor({
      club,
      leaguePosition,
      expectedPosition,
      boardConfidence,
    });
    const score = Math.max(rawScore, resultScoreFloor);
    const tone = getTone(score);
    let relationDelta = Math.round((score - 50) / 9);

    if (leaguePosition <= expectedPosition && tone === 'NEGATIVE') {
      relationDelta = Math.max(relationDelta, 0);
    }
    if (leaguePosition === 1 && expectedPosition >= 3) {
      relationDelta = Math.max(relationDelta, 3);
    } else if (leaguePosition === 2 && expectedPosition >= 5) {
      relationDelta = Math.max(relationDelta, 2);
    }

    if (tone === 'NEGATIVE' && director.control >= 15) relationDelta -= 1;
    if (tone === 'POSITIVE' && director.flexibility >= 15) relationDelta += 1;
    relationDelta = clamp(relationDelta, -8, 7);

    let influenceDelta = 0;
    if (tone === 'NEGATIVE') {
      influenceDelta = relationDelta <= -4 ? -5 : -3;
      if (leaguePosition > expectedPosition + 2) influenceDelta -= 1;
      if (director.relationshipWithManager < 35) influenceDelta -= 1;
    } else if (tone === 'POSITIVE') {
      influenceDelta = relationDelta >= 4 ? 3 : 2;
      if (leaguePosition <= expectedPosition - 2) influenceDelta += 1;
    } else if (relationDelta <= -2) {
      influenceDelta = -1;
    } else if (relationDelta >= 2 && leaguePosition <= expectedPosition) {
      influenceDelta = 1;
    }
    influenceDelta = clamp(influenceDelta, -6, 4);

    const updatedDirector: SportingDirector = {
      ...director,
      relationshipWithManager: clamp(director.relationshipWithManager + relationDelta, 0, 100),
    };

    const updatedClub: Club = {
      ...club,
      sportingDirector: updatedDirector,
      sportingDirectorBoardInfluence: clamp((club.sportingDirectorBoardInfluence ?? 0) + influenceDelta, -18, 14),
      boardConfidence: clamp((club.boardConfidence ?? 75) + influenceDelta, 0, 100),
      lastSportingDirectorReviewDate: reviewDate,
    };

    const mail: MailMessage = {
      id: `SPORTING_DIRECTOR_REVIEW_${club.id}_${reviewDate}`,
      sender: `${director.firstName} ${director.lastName}`,
      role: 'Dyrektor sportowy',
      subject: tone === 'POSITIVE'
        ? 'Miesieczna ocena pracy: kierunek jest dobry'
        : tone === 'MIXED'
          ? 'Miesieczna ocena pracy: potrzebuje konkretow'
          : 'Miesieczna ocena pracy: oczekuje reakcji',
      body: buildReviewBody({
        club,
        director,
        score,
        relationDelta,
        influenceDelta,
        leaguePosition,
        expectedPosition,
        formScore,
        youthScore,
        financialScore,
        tone,
      }),
      date: new Date(date),
      isRead: false,
      type: MailType.BOARD,
      priority: tone === 'NEGATIVE' ? 92 : tone === 'MIXED' ? 72 : 58,
    };

    return {
      updatedClub,
      mail,
      relationDelta,
      influenceDelta,
      score,
    };
  },

  evaluateRelationshipPressure(params: {
    club: Club;
    date: Date;
  }): { updatedClub: Club; mail: MailMessage | null; influenceDelta: number } {
    const { club, date } = params;
    const director = club.sportingDirector;
    if (!director) return { updatedClub: club, mail: null, influenceDelta: 0 };

    const eventDate = date.toISOString().slice(0, 7);
    if (club.lastSportingDirectorRelationshipEventDate === eventDate) {
      return { updatedClub: club, mail: null, influenceDelta: 0 };
    }

    const relationship = director.relationshipWithManager;
    const currentInfluence = club.sportingDirectorBoardInfluence ?? 0;
    let influenceDelta = 0;
    let subject = '';
    let body = '';
    let priority = 70;

    if (relationship <= 24) {
      influenceDelta = director.control >= 15 ? -8 : -6;
      subject = 'Sygnal do zarzadu: potrzebuje reakcji';
      body =
        'Trenerze,\n\nnasza wspolpraca jest w trudnym miejscu. Przekazalem zarzadowi, ze potrzebujemy bardziej zdecydowanej kontroli nad kierunkiem sportowym klubu.\n\n' +
        'Nie chodzi o jeden mecz. Chodzi o zaufanie do procesu, transferow i rozwoju druzyny. Od teraz zarzad bedzie patrzyl na Twoje decyzje ostrzej.\n\n' +
        `${director.firstName} ${director.lastName}`;
      priority = 94;
    } else if (relationship <= 34 && director.control + director.ambition >= 28) {
      influenceDelta = -4;
      subject = 'Rozmowa z zarzadem o kierunku sportowym';
      body =
        'Trenerze,\n\npo ostatnich tygodniach poprosilem zarzad o uwazniejsze monitorowanie sytuacji sportowej. Wciaz mamy przestrzen do wspolpracy, ale oczekuje jasniejszych decyzji i mniej improwizacji.\n\n' +
        'Najblizszy miesiac bedzie wazny dla odbudowy zaufania.\n\n' +
        `${director.firstName} ${director.lastName}`;
      priority = 86;
    } else if (relationship >= 84) {
      influenceDelta = director.flexibility >= 14 || director.personality === 'PARTNER' ? 5 : 3;
      subject = 'Wsparcie pionu sportowego';
      body =
        'Trenerze,\n\nprzekazalem zarzadowi, ze kierunek pracy sztabu jest spojny z planem sportowym klubu. Przy tej relacji masz u mnie wiecej przestrzeni na decyzje, nawet jesli pojedyncze wyniki beda nierowne.\n\n' +
        'To nie jest czek in blanco, ale masz moje wsparcie.\n\n' +
        `${director.firstName} ${director.lastName}`;
      priority = 55;
    } else {
      return { updatedClub: club, mail: null, influenceDelta: 0 };
    }

    const nextInfluence = clamp(currentInfluence + influenceDelta, -18, 14);
    const nextConfidence = clamp((club.boardConfidence ?? 75) + influenceDelta, 0, 100);
    const updatedClub: Club = {
      ...club,
      boardConfidence: nextConfidence,
      sportingDirectorBoardInfluence: nextInfluence,
      lastSportingDirectorRelationshipEventDate: eventDate,
    };

    const mail = buildDirectorMail({
      club,
      director,
      date,
      subject,
      body,
      priority,
      key: `RELATIONSHIP_${club.id}_${eventDate}_${subject}`,
    });

    return {
      updatedClub,
      mail,
      influenceDelta,
    };
  },

  createMonthlyObjective(params: {
    club: Club;
    players: Player[];
    date: Date;
    leagueClubs?: Club[];
    fixtures?: Fixture[];
  }): { updatedClub: Club; mail: MailMessage | null } {
    const { club, players, date, leagueClubs, fixtures } = params;
    const director = club.sportingDirector;
    if (!director) return { updatedClub: club, mail: null };
    if (club.leagueId === 'NONE' || club.stats.played < 3) return { updatedClub: club, mail: null };
    if (club.sportingDirectorObjective && ['ACTIVE', 'AWAITING_REVIEW'].includes(club.sportingDirectorObjective.status)) {
      return { updatedClub: club, mail: null };
    }

    const objectiveMonth = date.toISOString().slice(0, 7);
    if (club.lastSportingDirectorObjectiveDate === objectiveMonth) {
      return { updatedClub: club, mail: null };
    }

    const todayIso = toIsoDate(date);
    if (club.lastSportingDirectorObjectiveResolvedDate) {
      const daysSinceResolution = getDaysBetweenIsoDates(club.lastSportingDirectorObjectiveResolvedDate, todayIso);
      if (daysSinceResolution < SPORTING_DIRECTOR_OBJECTIVE_COOLDOWN_DAYS) {
        return { updatedClub: club, mail: null };
      }
    }

    const type = chooseObjectiveType(club, players, director, leagueClubs);

    const upcomingMatchCount = (fixtures ?? []).filter(f =>
      f.status === MatchStatus.SCHEDULED &&
      f.leagueId === club.leagueId &&
      (f.homeTeamId === club.id || f.awayTeamId === club.id) &&
      f.date.getTime() >= date.getTime() &&
      f.date.getTime() <= addDays(date, 35).getTime()
    ).length;
    if (type !== 'WAGE_DISCIPLINE' && upcomingMatchCount < 2) {
      return { updatedClub: club, mail: null };
    }

    const focusPlayer = type === 'PLAYER_MINUTES' ? getDevelopmentTarget(players, club) : null;
    const details = buildObjectiveDetails(type, director, club, focusPlayer, players, leagueClubs);
    const issuedAt = date.toISOString().slice(0, 10);
    const calibrated = calibrateObjectiveToSchedule({
      club,
      date,
      fixtures,
      type,
      title: details.title,
      description: details.description,
      target: details.target,
      dueDays: details.dueDays ?? 28,
      contextTag: details.contextTag,
    });
    const dueAt = calibrated.dueAt;
    const objective: SportingDirectorObjective = {
      id: `SD_OBJECTIVE_${club.id}_${issuedAt}_${type}`,
      type,
      issuedAt,
      dueAt,
      status: 'ACTIVE',
      title: calibrated.title,
      description: calibrated.description,
      target: calibrated.target,
      baselinePoints: club.stats.points,
      baselinePlayed: club.stats.played,
      baselineGoalsAgainst: club.stats.goalsAgainst,
      baselineYouthAppearances: getYouthAppearanceSignal(players),
      baselineYouthMinutes: getYouthMinutesSignal(players),
      baselinePlayerMinutes: focusPlayer ? getPlayerMinutes(focusPlayer) : undefined,
      baselineWageBill: type === 'WAGE_DISCIPLINE' ? getTotalWageBill(players) : undefined,
      targetPlayerId: focusPlayer?.id,
      targetPlayerName: focusPlayer ? playerName(focusPlayer) : undefined,
      contextTag: calibrated.contextTag ?? 'STANDARD',
    };

    const body = [
      'Trenerze,',
      '',
      'Po miesiecznej ocenie wyznaczam konkretny cel operacyjny dla sztabu.',
      '',
      calibrated.description,
      `Termin oceny: ${new Date(dueAt).toLocaleDateString('pl-PL')}.`,
      '',
      'Realizacja celu poprawi nasza relacje robocza i pomoze wzmocnic Pana pozycje przed zarzadem. Brak realizacji bedzie mial konsekwencje.',
      '',
      `${director.firstName} ${director.lastName}`,
      `Dyrektor sportowy ${club.name}`,
    ].join('\n');

    return {
      updatedClub: {
        ...club,
        sportingDirectorObjective: objective,
        lastSportingDirectorObjectiveDate: objectiveMonth,
      },
      mail: buildDirectorMail({
        club,
        director,
        date,
        subject: objective.title,
      body,
      priority: director.relationshipWithManager < 35 ? 88 : 73,
      key: `OBJECTIVE_${club.id}_${objective.id}`,
      metadata: {
        type: 'SPORTING_DIRECTOR_OBJECTIVE',
        objectiveId: objective.id,
      },
    }),
  };
},

  evaluateActiveObjective(params: {
    club: Club;
    players: Player[];
    date: Date;
    leagueClubs?: Club[];
  }): { updatedClub: Club; mail: MailMessage | null } {
    const { club, players, date, leagueClubs } = params;
    const director = club.sportingDirector;
    const objective = club.sportingDirectorObjective;
    if (!director || !objective || !['ACTIVE', 'AWAITING_REVIEW'].includes(objective.status)) {
      return { updatedClub: club, mail: null };
    }

    const today = date.toISOString().slice(0, 10);
    if (today < objective.dueAt) {
      return { updatedClub: club, mail: null };
    }

    const MATCH_BASED_TYPES = ['WIN_NEXT_MATCH', 'AVOID_DEFEAT', 'HOLD_TOP_SPOT', 'STAY_IN_TOP_THREE', 'DEFENSIVE_RUN', 'POINTS_RUN'];
    if (MATCH_BASED_TYPES.includes(objective.type)) {
      const matchesPlayed = club.stats.played - objective.baselinePlayed;
      if (matchesPlayed === 0) {
        return {
          updatedClub: { ...club, sportingDirectorObjective: { ...objective, dueAt: addDaysIso(new Date(objective.dueAt), 7) } },
          mail: null,
        };
      }
    }

    const result = evaluateObjectiveProgress(objective, club, players, leagueClubs);
    const completed = result.completed;
    const relationDelta = completed
      ? (director.flexibility >= 14 || director.personality === 'PARTNER' ? 5 : 3)
      : -(director.control >= 15 || director.personality === 'CONTROLLER' ? 6 : 4);
    const influenceDelta = completed ? 3 : -4;
    const updatedDirector: SportingDirector = {
      ...director,
      relationshipWithManager: clamp(director.relationshipWithManager + relationDelta, 0, 100),
    };
    const updatedObjective: SportingDirectorObjective = {
      ...objective,
      status: completed ? 'COMPLETED' : 'FAILED',
      resultNote: result.note,
    };
    const nextInfluence = clamp((club.sportingDirectorBoardInfluence ?? 0) + influenceDelta, -18, 14);
    const nextConfidence = clamp((club.boardConfidence ?? 75) + influenceDelta, 0, 100);
    const updatedClub: Club = {
      ...club,
      sportingDirector: updatedDirector,
      sportingDirectorObjective: updatedObjective,
      sportingDirectorBoardInfluence: nextInfluence,
      boardConfidence: nextConfidence,
      lastSportingDirectorObjectiveResolvedDate: today,
    };

    const body = completed
      ? [
          'Trenerze,',
          '',
          'Cel wyznaczony przez pion sportowy zostal zrealizowany.',
          result.note,
          '',
          `Relacja robocza poprawia sie o ${relationDelta} pkt. Przekaze zarzadowi, ze sztab odpowiedzial konkretem.`,
          '',
          `${director.firstName} ${director.lastName}`,
          `Dyrektor sportowy ${club.name}`,
        ].join('\n')
      : [
          'Trenerze,',
          '',
          'Cel wyznaczony przez pion sportowy nie zostal zrealizowany.',
          result.note,
          '',
          `Relacja robocza spada o ${Math.abs(relationDelta)} pkt. Zarzad otrzyma ode mnie sygnal, ze presja na wynik i kierunek pracy musi wzrosnac.`,
          '',
          `${director.firstName} ${director.lastName}`,
          `Dyrektor sportowy ${club.name}`,
        ].join('\n');

    return {
      updatedClub,
      mail: buildDirectorMail({
        club,
        director,
        date,
        subject: completed ? `Cel zrealizowany: ${objective.title}` : `Cel niezrealizowany: ${objective.title}`,
        body,
        priority: completed ? 60 : 91,
        key: `OBJECTIVE_REVIEW_${club.id}_${objective.id}_${completed ? 'DONE' : 'FAILED'}`,
      }),
    };
  },

  respondToObjective(params: {
    club: Club;
    date: Date;
    response: SportingDirectorObjectiveResponse;
  }): { updatedClub: Club; mail: MailMessage | null; message: string } {
    const { club, date, response } = params;
    const director = club.sportingDirector;
    const objective = club.sportingDirectorObjective;
    if (!director || !objective || objective.status !== 'ACTIVE') {
      return { updatedClub: club, mail: null, message: 'Brak aktywnego celu dyrektora.' };
    }

    const updateClub = (
      nextObjective: SportingDirectorObjective,
      relationDelta: number,
      influenceDelta: number,
      subject: string,
      bodyLines: string[],
      priority = 72
    ) => {
      const updatedDirector: SportingDirector = {
        ...director,
        relationshipWithManager: clamp(director.relationshipWithManager + relationDelta, 0, 100),
      };
      const updatedClub: Club = {
        ...club,
        sportingDirector: updatedDirector,
        sportingDirectorObjective: nextObjective,
        sportingDirectorBoardInfluence: clamp((club.sportingDirectorBoardInfluence ?? 0) + influenceDelta, -18, 14),
        boardConfidence: clamp((club.boardConfidence ?? 75) + influenceDelta, 0, 100),
      };
      const body = [
        'Trenerze,',
        '',
        ...bodyLines,
        '',
        `${director.firstName} ${director.lastName}`,
        `Dyrektor sportowy ${club.name}`,
      ].join('\n');

      return {
        updatedClub,
        mail: buildDirectorMail({
          club,
          director,
          date,
          subject,
          body,
          priority,
          key: `OBJECTIVE_RESPONSE_${club.id}_${objective.id}_${response}_${subject}`,
        }),
      };
    };
    if (response === 'ACCEPT') {
      const nextObjective: SportingDirectorObjective = {
        ...objective,
        status: 'AWAITING_REVIEW',
        managerResponse: 'ACCEPTED',
        resultNote: `Cel czeka teraz na ocene w dniu ${new Date(objective.dueAt).toLocaleDateString('pl-PL')}.`,
      };
      const result = updateClub(
        nextObjective,
        1,
        0,
        'Cel przyjety do realizacji',
        [
          'Doceniam jasna deklaracje. Cel pozostaje bez zmian i bedzie rozliczony w wyznaczonym terminie.',
          'Taka odpowiedz pomaga utrzymac normalna wspolprace pionu sportowego ze sztabem.',
        ],
        58
      );
      return { ...result, message: 'Cel zaakceptowany.' };
    }

    if (response === 'NEGOTIATE') {
      if (objective.renegotiated) {
        const result = updateClub(
          { ...objective, managerResponse: 'NEGOTIATED' },
          -1,
          0,
          'Cel nie bedzie dalej negocjowany',
          [
            'Ten cel byl juz korygowany. Nie bede go ponownie zmiekczal, bo zarzad oczekuje konkretu.',
            'Prosze pracowac w ramach obecnych ustalen.',
          ],
          80
        );
        return { ...result, message: 'Dyrektor odrzucil ponowna negocjacje celu.' };
      }

      const negotiationScore =
        director.flexibility * 2 +
        director.patience +
        director.relationshipWithManager * 0.35 -
        director.control * 1.45;
      const accepts = negotiationScore >= 34 || director.personality === 'PARTNER';

      if (accepts) {
        const nextObjective: SportingDirectorObjective = {
          ...softenObjective(objective),
          status: 'AWAITING_REVIEW',
          managerResponse: 'NEGOTIATED',
          renegotiated: true,
          resultNote: '',
        };
        nextObjective.resultNote = `Skorygowany cel czeka na ocene w dniu ${new Date(nextObjective.dueAt).toLocaleDateString('pl-PL')}.`;
        const result = updateClub(
          nextObjective,
          1,
          1,
          'Cel skorygowany po rozmowie',
          [
            'Przyjmuje argumenty sztabu. Koryguje cel i wydluzam termin oceny o tydzien.',
            `Nowy termin: ${new Date(nextObjective.dueAt).toLocaleDateString('pl-PL')}.`,
            'To jest kompromis, nie rezygnacja z wymagan.',
          ],
          64
        );
        return { ...result, message: 'Dyrektor zgodzil sie zlagodzic cel.' };
      }

      const result = updateClub(
        {
          ...objective,
          status: 'AWAITING_REVIEW',
          managerResponse: 'NEGOTIATED',
          resultNote: `Cel pozostaje bez zmian i czeka na ocene w dniu ${new Date(objective.dueAt).toLocaleDateString('pl-PL')}.`,
        },
        -2,
        -1,
        'Negocjacja celu odrzucona',
        [
          'Nie akceptuje tej prosby. Cel jest adekwatny do sytuacji i do oczekiwan zarzadu.',
          'Odbieram te negocjacje jako probe obnizenia odpowiedzialnosci sztabu.',
        ],
        84
      );
      return { ...result, message: 'Dyrektor odrzucil negocjacje celu.' };
    }

    const nextObjective: SportingDirectorObjective = {
      ...sharpenObjective(objective),
      status: 'AWAITING_REVIEW',
      managerResponse: 'CHALLENGED',
      resultNote: '',
    };
    nextObjective.resultNote = `Zaostrzony cel czeka na ocene w dniu ${new Date(nextObjective.dueAt).toLocaleDateString('pl-PL')}.`;
    const result = updateClub(
      nextObjective,
      -(director.control >= 15 ? 5 : 4),
      -2,
      'Sprzeciw wobec celu',
      [
        'Przyjmuje do wiadomosci, ze kwestionuje Pan moj cel. W tej sytuacji nie zamierzam go lagodzic.',
        'Przeciwnie: zarzad otrzyma informacje, ze sztab odrzuca kierunek pionu sportowego.',
        'Cel zostaje zaostrzony, a margines zaufania maleje.',
      ],
      92
    );
    return { ...result, message: 'Cel zostal zakwestionowany. Dyrektor zaostrzyl wymagania.' };
  },

  evaluateTransferListDecision(params: {
    club: Club;
    player: Player;
    squad: Player[];
    requestedPrice?: number;
    date: Date;
  }): { blocked: boolean; message: string; updatedClub: Club; mail?: MailMessage } {
    const { club, player, squad, requestedPrice, date } = params;
    const director = club.sportingDirector;
    if (!director) return { blocked: false, message: 'Brak dyrektora sportowego.', updatedClub: club };

    const squadRank = getPlayerSquadRank(player, squad);
    const estimatedValue = getEstimatedValue(player);
    const priceRatio = requestedPrice && requestedPrice > 0 ? requestedPrice / estimatedValue : 1;
    const keyPlayer = player.squadRole === 'KEY_PLAYER' || squadRank <= 3;
    const starter = player.squadRole === 'STARTER' || squadRank <= 8;
    const youngAsset = isYoungAsset(player);
    const lockerRoomLeader = isLockerRoomLeader(player, club);
    const marketingWeight = hasMarketingWeight(player);
    const weakReplacement = !hasAdequateReplacement(player, squad);
    const protectedByPolicy = club.sportingDirectorPolicy?.protectedPlayers.some(item => item.playerId === player.id) ?? false;
    const sellCandidateByPolicy = club.sportingDirectorPolicy?.sellCandidates.some(item => item.playerId === player.id) ?? false;

    let resistance = director.control * 2.1 + director.ambition * 1.15 - director.flexibility * 1.25;
    if (keyPlayer) resistance += 28;
    else if (starter) resistance += 14;
    if (youngAsset) resistance += director.developmentVision * 1.7;
    if (lockerRoomLeader) resistance += 12;
    if (marketingWeight) resistance += 10;
    if (weakReplacement) resistance += 18;
    if (protectedByPolicy) resistance += 18;
    if (sellCandidateByPolicy) resistance -= 18;
    if (priceRatio < 0.9) resistance += director.financialDiscipline * 1.4;
    if (director.relationshipWithManager < 40) resistance += 10;
    if (director.personality === 'CONTROLLER') resistance += 12;
    if (director.personality === 'TALENT_HUNTER' && youngAsset) resistance += 14;
    if (director.personality === 'ACCOUNTANT' && priceRatio >= 1.2) resistance -= 14;
    if (director.personality === 'PARTNER') resistance -= 12;

    const blocked = resistance >= 58;
    if (!blocked) {
      return { blocked: false, message: 'Dyrektor sportowy nie blokuje tej decyzji.', updatedClub: club };
    }

    const reason = protectedByPolicy
      ? `${player.firstName} ${player.lastName} znajduje sie na liscie zawodnikow chronionych w polityce sportowej.`
      : lockerRoomLeader
      ? 'To wazny zawodnik dla szatni i nie chce tracic go bez mocnego uzasadnienia.'
      : youngAsset
      ? 'Nie sprzedajemy takiego talentu bez planu zastepstwa i dalszego rozwoju kadry.'
      : marketingWeight
        ? 'Ten zawodnik jest dla klubu wazny sportowo i marketingowo.'
        : weakReplacement
          ? 'Nie zgadzam sie na oslabienie tej pozycji bez czytelnego planu zastepstwa.'
      : keyPlayer
        ? `${player.firstName} ${player.lastName} jest zbyt wazny sportowo, aby wystawiac go na liste bez mocniejszego planu.`
        : priceRatio < 0.9
          ? `Proponowana cena jest zbyt niska wzgledem wartosci zawodnika.`
          : `Ten ruch nie pasuje obecnie do polityki kadrowej klubu.`;

    const updatedDirector: SportingDirector = {
      ...director,
      relationshipWithManager: clamp(director.relationshipWithManager - 2, 0, 100),
    };
    const updatedClub: Club = { ...club, sportingDirector: updatedDirector };
    const body = [
      'Trenerze,',
      '',
      `Blokuje wystawienie zawodnika ${player.firstName} ${player.lastName} na liste transferowa.`,
      reason,
      '',
      'Jesli chce Pan wrocic do tematu, potrzebuje lepszego uzasadnienia sportowego albo wyzszej wyceny.',
      '',
      `${director.firstName} ${director.lastName}`,
      `Dyrektor sportowy ${club.name}`,
    ].join('\n');

      return {
        blocked: true,
        message: reason,
        updatedClub,
        mail: buildDirectorMail({
        club,
        director,
        date,
          subject: `Blokada listy transferowej: ${player.lastName}`,
          body,
          priority: 82,
          key: `TRANSFER_LIST_BLOCK_${club.id}_${player.id}_${date.toISOString().slice(0, 10)}`,
        }),
      };
  },

  evaluateIncomingSaleDecision(params: {
    club: Club;
    player: Player;
    squad: Player[];
    buyerClub: Club;
    fee: number;
    date: Date;
  }): { blocked: boolean; message: string; updatedClub: Club; mail?: MailMessage } {
    const { club, player, squad, buyerClub, fee, date } = params;
    const director = club.sportingDirector;
    if (!director) return { blocked: false, message: 'Brak dyrektora sportowego.', updatedClub: club };

    const squadRank = getPlayerSquadRank(player, squad);
    const estimatedValue = getEstimatedValue(player);
    const feeRatio = estimatedValue > 0 ? fee / estimatedValue : 1;
    const keyPlayer = player.squadRole === 'KEY_PLAYER' || squadRank <= 3;
    const starter = player.squadRole === 'STARTER' || squadRank <= 8;
    const youngAsset = isYoungAsset(player);
    const directRival = club.leagueId !== 'NONE' && club.leagueId === buyerClub.leagueId;
    const lockerRoomLeader = isLockerRoomLeader(player, club);
    const marketingWeight = hasMarketingWeight(player);
    const weakReplacement = !hasAdequateReplacement(player, squad);
    const protectedByPolicy = club.sportingDirectorPolicy?.protectedPlayers.some(item => item.playerId === player.id) ?? false;
    const sellCandidateByPolicy = club.sportingDirectorPolicy?.sellCandidates.some(item => item.playerId === player.id) ?? false;

    let resistance = director.control * 1.9 + director.ambition * 1.25 - director.flexibility * 1.35;
    if (keyPlayer) resistance += 30;
    else if (starter) resistance += 12;
    if (youngAsset) resistance += director.developmentVision * 1.55;
    if (lockerRoomLeader) resistance += 10;
    if (marketingWeight) resistance += 10;
    if (weakReplacement) resistance += 16;
    if (protectedByPolicy) resistance += 20;
    if (sellCandidateByPolicy) resistance -= 20;
    if (feeRatio < 1.05) resistance += director.financialDiscipline * 1.45;
    if (directRival && !player.isOnTransferList) resistance += 14;
    if (director.relationshipWithManager < 35) resistance += 12;
    if (director.personality === 'CONTROLLER') resistance += 10;
    if (director.personality === 'TALENT_HUNTER' && youngAsset) resistance += 13;
    if (director.personality === 'ACCOUNTANT' && feeRatio >= 1.35) resistance -= 22;
    if (director.personality === 'PARTNER') resistance -= 10;
    if (player.isOnTransferList) resistance -= 18;

    const blocked = resistance >= 64;
    if (!blocked) {
      return { blocked: false, message: 'Dyrektor sportowy akceptuje kierunek rozmow.', updatedClub: club };
    }

    const reason = protectedByPolicy
      ? `${player.firstName} ${player.lastName} jest wpisany jako zawodnik chroniony w aktualnej polityce sportowej.`
      : lockerRoomLeader
      ? 'To wazny zawodnik dla szatni i nie chce otwierac takiego ruchu w tym momencie.'
      : youngAsset
      ? `${player.firstName} ${player.lastName} ma zbyt duzy potencjal rozwojowy, zeby sprzedawac go w tej chwili.`
      : marketingWeight
        ? `${player.firstName} ${player.lastName} jest dla klubu wazny marketingowo i sportowo.`
        : weakReplacement
          ? 'Nie zgadzam sie na oslabienie tej pozycji bez gotowego planu zastepstwa.'
      : keyPlayer
        ? `${player.firstName} ${player.lastName} jest filarem kadry i sprzedaz oslabia projekt sportowy.`
        : directRival
          ? `Nie chce wzmacniac bezposredniego rywala ligowego bez wyjatkowej oferty.`
          : `Oferta ${buyerClub.name} nie broni sie sportowo ani finansowo.`;

    const updatedDirector: SportingDirector = {
      ...director,
      relationshipWithManager: clamp(director.relationshipWithManager - 3, 0, 100),
    };
    const updatedClub: Club = { ...club, sportingDirector: updatedDirector };
    const body = [
      'Trenerze,',
      '',
      `Nie wyrazam zgody na sprzedaz zawodnika ${player.firstName} ${player.lastName} do ${buyerClub.name}.`,
      reason,
      '',
      `Oferta: ${fee.toLocaleString('pl-PL')} PLN. Nasza wewnetrzna wycena: okolo ${estimatedValue.toLocaleString('pl-PL')} PLN.`,
      'Ten transfer zostaje zatrzymany na poziomie pionu sportowego.',
      '',
      `${director.firstName} ${director.lastName}`,
      `Dyrektor sportowy ${club.name}`,
    ].join('\n');

    return {
      blocked: true,
      message: reason,
      updatedClub,
      mail: buildDirectorMail({
        club,
        director,
        date,
        subject: `Weto transferowe: ${player.lastName}`,
        body,
        priority: 88,
        key: `SALE_BLOCK_${club.id}_${player.id}_${buyerClub.id}_${date.toISOString().slice(0, 10)}`,
      }),
    };
  },

  evaluateIncomingPurchaseDecision(params: {
    club: Club;
    player: Player;
    squad: Player[];
    sellerClub: Club;
    fee: number;
    contract: TransferContractInput;
    date: Date;
  }): { blocked: boolean; message: string; updatedClub: Club; mail?: MailMessage; relationDelta: number; negotiatedFee?: number } {
    const { club, player, squad, sellerClub, fee, contract, date } = params;
    const director = club.sportingDirector;
    if (!director) return { blocked: false, message: 'Brak dyrektora sportowego.', updatedClub: club, relationDelta: 0 };

    const estimatedValue = getEstimatedValue(player);
    const feeRatio = estimatedValue > 0 ? fee / estimatedValue : 1;
    const totalCommitment = fee + contract.salary * contract.years + contract.bonus;
    const budgetUsage = club.transferBudget > 0 ? totalCommitment / club.transferBudget : 9;
    const averageSalary = squad.length > 0
      ? squad.reduce((sum, squadPlayer) => sum + squadPlayer.annualSalary, 0) / squad.length
      : contract.salary;
    const salaryRatio = averageSalary > 0 ? contract.salary / averageSalary : 1;
    const positionFit = getPositionFitScore(player, squad);
    const youngAsset = isYoungAsset(player);

    let resistance = director.control * 1.5 + director.financialDiscipline * 1.7 - director.flexibility * 1.1;
    if (feeRatio > 1.35) resistance += 20;
    if (feeRatio > 1.65) resistance += 18;
    if (budgetUsage > 0.55) resistance += 18;
    if (budgetUsage > 0.8) resistance += 18;
    if (salaryRatio > 1.8) resistance += 16;
    if (player.age >= 31 && contract.years >= 3) resistance += 22;
    if (player.age >= 29 && totalCommitment > estimatedValue * 1.7) resistance += 14;
    if (positionFit < -4) resistance += 16;
    if (youngAsset && director.developmentVision >= 13) resistance -= 18;
    if (positionFit >= 8) resistance -= 16;
    if (director.personality === 'ACCOUNTANT') resistance += 10;
    if (director.personality === 'TALENT_HUNTER' && youngAsset) resistance -= 14;
    if (director.personality === 'VISIONARY' && player.age <= 24) resistance -= 10;
    if (director.personality === 'PARTNER') resistance -= 10;
    if (director.relationshipWithManager < 35) resistance += 10;

    const blocked = resistance >= 72;
    const canNegotiateBetter = !blocked && director.negotiation >= 14 && feeRatio > 1.05 && budgetUsage <= 0.82;
    const negotiatedFee = canNegotiateBetter ? Math.max(Math.round(estimatedValue * 0.98 / 50_000) * 50_000, Math.round(fee * 0.93 / 50_000) * 50_000) : undefined;
    const finalFee = negotiatedFee && negotiatedFee < fee ? negotiatedFee : fee;
    const finalCommitment = finalFee + contract.salary * contract.years + contract.bonus;
    const finalBudgetUsage = club.transferBudget > 0 ? finalCommitment / club.transferBudget : budgetUsage;
    const positive = !blocked && (youngAsset || positionFit >= 8 || feeRatio <= 0.9) && budgetUsage <= 0.7;
    const relationDelta = blocked ? -3 : positive ? 2 : 0;
    const updatedDirector: SportingDirector = {
      ...director,
      relationshipWithManager: clamp(director.relationshipWithManager + relationDelta, 0, 100),
    };
    const updatedClub: Club = { ...club, sportingDirector: updatedDirector };

    const reason = blocked
      ? feeRatio > 1.65
        ? `Cena za ${playerName(player)} jest zbyt wysoka wzgledem naszej wyceny.`
        : budgetUsage > 0.8
          ? `Ten transfer pochlonalby zbyt duza czesc budzetu transferowego.`
          : player.age >= 31 && contract.years >= 3
            ? `Kontrakt dla zawodnika w tym wieku jest zbyt dlugi i ryzykowny.`
            : positionFit < -4
              ? `Nie widze pilnej potrzeby wzmacniania tej pozycji takim kosztem.`
              : `Ten ruch nie pasuje do aktualnej polityki sportowej klubu.`
      : negotiatedFee && negotiatedFee < fee
        ? `${playerName(player)} pasuje sportowo, a ja zepchnalem kwote do ${negotiatedFee.toLocaleString('pl-PL')} PLN.`
      : positive
        ? `${playerName(player)} pasuje do kierunku sportowego klubu. Akceptuje ten ruch.`
        : `Dyrektor sportowy nie blokuje transferu, ale bedzie ocenial jego skutki.`;

    if (!blocked && !positive) {
      return { blocked: false, message: reason, updatedClub: club, relationDelta: 0 };
    }

    const body = blocked
      ? [
          'Trenerze,',
          '',
          `Blokuje finalizacje transferu ${playerName(player)} z klubu ${sellerClub.name}.`,
          reason,
          '',
          `Kwota transferu: ${fee.toLocaleString('pl-PL')} PLN. Laczne zobowiazanie: ${totalCommitment.toLocaleString('pl-PL')} PLN.`,
          'Prosze szukac rozwiazania lepiej dopasowanego do budzetu i potrzeb kadry.',
          '',
          `${director.firstName} ${director.lastName}`,
          `Dyrektor sportowy ${club.name}`,
        ].join('\n')
      : [
          'Trenerze,',
          '',
          `Akceptuje finalizacje transferu ${playerName(player)} z klubu ${sellerClub.name}.`,
          reason,
          '',
          negotiatedFee && negotiatedFee < fee
            ? `Po mojej rozmowie finalna kwota schodzi z ${fee.toLocaleString('pl-PL')} PLN do ${negotiatedFee.toLocaleString('pl-PL')} PLN.`
            : `Laczne zobowiazanie po tej decyzji wynosi ${finalCommitment.toLocaleString('pl-PL')} PLN.`,
          finalBudgetUsage > 0.7 ? 'To dalej kosztowny ruch, ale miesci sie jeszcze w granicach akceptowalnego ryzyka.' : 'To jest ruch zgodny z kierunkiem, ktory chcemy budowac.',
          '',
          `${director.firstName} ${director.lastName}`,
          `Dyrektor sportowy ${club.name}`,
        ].join('\n');

    return {
      blocked,
      message: reason,
      updatedClub,
      relationDelta,
      negotiatedFee,
      mail: buildDirectorMail({
        club,
        director,
        date,
        subject: blocked ? `Weto transferowe: ${player.lastName}` : `Akceptacja transferu: ${player.lastName}`,
        body,
        priority: blocked ? 90 : 62,
        key: `PURCHASE_${blocked ? 'BLOCK' : 'OK'}_${club.id}_${player.id}_${sellerClub.id}_${date.toISOString().slice(0, 10)}`,
      }),
    };
  },

  evaluateFreeAgentSigningDecision(params: {
    club: Club;
    player: Player;
    squad: Player[];
    contract: TransferContractInput;
    date: Date;
  }): { blocked: boolean; message: string; updatedClub: Club; mail?: MailMessage; relationDelta: number } {
    const { club, player, squad, contract, date } = params;
    const director = club.sportingDirector;
    if (!director) return { blocked: false, message: 'Brak dyrektora sportowego.', updatedClub: club, relationDelta: 0 };

    const totalCommitment = contract.salary * contract.years + contract.bonus;
    const budgetUsage = club.transferBudget > 0 ? totalCommitment / club.transferBudget : 9;
    const averageSalary = squad.length > 0
      ? squad.reduce((sum, squadPlayer) => sum + squadPlayer.annualSalary, 0) / squad.length
      : contract.salary;
    const salaryRatio = averageSalary > 0 ? contract.salary / averageSalary : 1;
    const positionFit = getPositionFitScore(player, squad);
    const youngAsset = isYoungAsset(player);

    let resistance = director.control * 1.4 + director.financialDiscipline * 1.9 - director.flexibility * 1.15;
    if (budgetUsage > 0.45) resistance += 14;
    if (budgetUsage > 0.7) resistance += 18;
    if (salaryRatio > 1.65) resistance += 16;
    if (salaryRatio > 2.2) resistance += 18;
    if (player.age >= 31 && contract.years >= 3) resistance += 24;
    if (player.age >= 34 && contract.years >= 2) resistance += 16;
    if (positionFit < -5) resistance += 18;
    if (positionFit >= 8) resistance -= 14;
    if (youngAsset && director.developmentVision >= 13) resistance -= 16;
    if (director.personality === 'ACCOUNTANT') resistance += 12;
    if (director.personality === 'TALENT_HUNTER' && youngAsset) resistance -= 16;
    if (director.personality === 'PARTNER') resistance -= 10;
    if (director.relationshipWithManager < 35) resistance += 10;

    const blocked = resistance >= 70;
    const positive = !blocked && (positionFit >= 8 || youngAsset || salaryRatio <= 0.9) && budgetUsage <= 0.55;
    const relationDelta = blocked ? -2 : positive ? 1 : 0;
    const updatedDirector: SportingDirector = {
      ...director,
      relationshipWithManager: clamp(director.relationshipWithManager + relationDelta, 0, 100),
    };
    const updatedClub: Club = { ...club, sportingDirector: updatedDirector };

    const reason = blocked
      ? budgetUsage > 0.7
        ? `Kontrakt dla ${playerName(player)} za mocno obciaza budzet transferowy.`
        : salaryRatio > 2.2
          ? `Pensja jest zbyt wysoka wzgledem struktury plac w kadrze.`
          : player.age >= 31 && contract.years >= 3
            ? `Nie akceptuje tak dlugiego kontraktu dla zawodnika w tym wieku.`
            : positionFit < -5
              ? `Ta pozycja nie wymaga tak kosztownego wzmocnienia.`
              : `Ten kontrakt nie pasuje do polityki sportowej i finansowej klubu.`
      : positive
        ? `${playerName(player)} jest sensownym ruchem na wolnym rynku. Akceptuje podpis.`
        : 'Dyrektor sportowy nie blokuje kontraktu, ale bedzie obserwowal jego skutki.';

    if (!blocked && !positive) {
      return { blocked: false, message: reason, updatedClub: club, relationDelta: 0 };
    }

    const body = blocked
      ? [
          'Trenerze,',
          '',
          `Blokuje podpisanie kontraktu z wolnym agentem ${playerName(player)}.`,
          reason,
          '',
          `Laczne zobowiazanie: ${totalCommitment.toLocaleString('pl-PL')} PLN. Pensja roczna: ${contract.salary.toLocaleString('pl-PL')} PLN.`,
          'Prosze wrocic z tansza lub krotsza propozycja, jesli nadal uwaza Pan ten ruch za konieczny.',
          '',
          `${director.firstName} ${director.lastName}`,
          `Dyrektor sportowy ${club.name}`,
        ].join('\n')
      : [
          'Trenerze,',
          '',
          `Akceptuje podpisanie kontraktu z wolnym agentem ${playerName(player)}.`,
          reason,
          '',
          'To dobry moment, zeby wykorzystac okazje rynkowa.',
          '',
          `${director.firstName} ${director.lastName}`,
          `Dyrektor sportowy ${club.name}`,
        ].join('\n');

    return {
      blocked,
      message: reason,
      updatedClub,
      relationDelta,
      mail: buildDirectorMail({
        club,
        director,
        date,
        subject: blocked ? `Weto kontraktu: ${player.lastName}` : `Akceptacja kontraktu: ${player.lastName}`,
        body,
        priority: blocked ? 86 : 58,
        key: `FREE_AGENT_${blocked ? 'BLOCK' : 'OK'}_${club.id}_${player.id}_${date.toISOString().slice(0, 10)}`,
      }),
    };
  },

  getIncomingSaleAdvisory(params: {
    club: Club;
    player: Player;
    squad: Player[];
    fee: number;
  }): string[] {
    const { club, player, squad, fee } = params;
    const replacementReady = hasAdequateReplacement(player, squad);
    const notes = buildDirectorAdvice({ club, player, squad, fee });

    if (!replacementReady) notes.unshift('Na tej pozycji nie widzi dzis czytelnego planu zastępstwa.');
    if (isLockerRoomLeader(player, club)) notes.unshift('To zawodnik bardzo ważny dla szatni.');
    return [...new Set(notes)].slice(0, 3);
  },

  getIncomingPurchaseAdvisory(params: {
    club: Club;
    player: Player;
    squad: Player[];
    fee: number;
    salary?: number;
    years?: number;
  }): string[] {
    return buildDirectorAdvice(params);
  },

  getContractRenewalAdvisory(params: {
    club: Club;
    player: Player;
    squad: Player[];
    salary: number;
    years: number;
  }): string[] {
    const { club, player, squad, salary, years } = params;
    const notes = buildDirectorAdvice({ club, player, squad, salary, years });
    if (player.age <= 22 && club.sportingDirector?.developmentVision && club.sportingDirector.developmentVision >= 13) {
      notes.unshift('Jesli to mlody gracz, dyrektor zaakceptuje pensje latwiej, gdy idzie za tym jasna sciezka rozwoju.');
    }
    return [...new Set(notes)].slice(0, 3);
  },

  evaluateContractRenewalDecision(params: {
    club: Club;
    player: Player;
    squad: Player[];
    salary: number;
    years: number;
    bonus: number;
  }): { blocked: boolean; reason: string } {
    const { club, player, squad, salary, years, bonus } = params;
    const director = club.sportingDirector;
    if (!director) return { blocked: false, reason: 'Brak dyrektora sportowego.' };

    const averageSalary = squad.length > 0 ? getTotalWageBill(squad) / squad.length : salary;
    const salaryRatio = averageSalary > 0 ? salary / averageSalary : 1;
    let resistance = director.control * 1.1 + director.financialDiscipline * 1.6 - director.flexibility;

    if (salaryRatio > 1.75) resistance += 22;
    if (salaryRatio > 2.15) resistance += 18;
    if (player.age >= 31 && years >= 3) resistance += 24;
    if (bonus > Math.max(250_000, salary * 0.45)) resistance += 12;
    if (director.relationshipWithManager < 35) resistance += 10;
    if (director.personality === 'ACCOUNTANT') resistance += 12;
    if (isYoungAsset(player) && director.developmentVision >= 14) resistance -= 16;
    if (player.squadRole === 'KEY_PLAYER') resistance -= 10;

    if (resistance < 66) {
      return { blocked: false, reason: 'Dyrektor sportowy nie blokuje odnowienia umowy.' };
    }

    const reason =
      salaryRatio > 2.15
        ? 'Dyrektor sportowy nie zgadza sie na tak wysoka pensje wzgledem obecnej struktury plac.'
        : player.age >= 31 && years >= 3
          ? 'Dyrektor sportowy nie akceptuje tak dlugiej umowy dla zawodnika w tym wieku.'
          : bonus > Math.max(250_000, salary * 0.45)
            ? 'Dyrektor sportowy uznal bonus za podpis za zbyt wysoki.'
            : 'Dyrektor sportowy nie widzi uzasadnienia dla takiego pakietu kontraktowego.';

    return { blocked: true, reason };
  },

  getTeamAnalysisPerspective(club: Club): { summary: string; protected: SportingDirectorPolicyItem[]; development: SportingDirectorPolicyItem[]; sales: SportingDirectorPolicyItem[] } | null {
    if (!club.sportingDirector || !club.sportingDirectorPolicy) return null;
    return {
      summary: club.sportingDirectorPolicy.summary,
      protected: club.sportingDirectorPolicy.protectedPlayers,
      development: club.sportingDirectorPolicy.developmentPlayers,
      sales: club.sportingDirectorPolicy.sellCandidates,
    };
  },

  generateCommunicationMails(params: {
    club: Club;
    players: Player[];
    date: Date;
    recentFixture?: { status?: string | null; homeScore?: number | null; awayScore?: number | null; homeTeamId?: string; awayTeamId?: string } | null;
  }): MailMessage[] {
    const { club, players, date, recentFixture } = params;
    const director = club.sportingDirector;
    if (!director) return [];

    const mails: MailMessage[] = [];
    const isoDate = date.toISOString().slice(0, 10);
    const monthKey = date.toISOString().slice(0, 7);
    const recentForm = club.stats.form.slice(-5);
    const wins = recentForm.filter(result => result === 'W').length;
    const losses = recentForm.filter(result => result === 'L').length;
    const youthTarget = getDevelopmentTarget(players, club);
    const wageBill = getTotalWageBill(players);
    const averageSalary = players.length > 0 ? wageBill / players.length : 0;
    const payrollPressure = club.budget < averageSalary * 4 || wageBill > Math.max(club.budget * 0.8, 6_000_000);
    const seasonIsUnderway = club.stats.played >= 1;
    const enoughSeasonSample = club.stats.played >= 3;

    if (seasonIsUnderway && recentFixture?.status === 'FINISHED' && wins >= 4) {
      mails.push(buildDirectorMail({
        club,
        director,
        date,
        subject: 'Pochwala za ostatnia serie',
        body: [
          'Trenerze,',
          '',
          'Dobra seria daje klubowi tlen i pokazuje, ze sztab ma druzyne pod kontrola.',
          'W takich momentach latwiej mi bronic Twoich decyzji przed zarzadem i dawac Ci wiecej swobody na rynku.',
          '',
          `${director.firstName} ${director.lastName}`,
          `Dyrektor sportowy ${club.name}`,
        ].join('\n'),
        priority: 57,
        key: `COMM_WIN_STREAK_${club.id}_${isoDate}`,
      }));
    } else if (seasonIsUnderway && recentFixture?.status === 'FINISHED' && losses >= 3) {
      mails.push(buildDirectorMail({
        club,
        director,
        date,
        subject: 'Ostrzezenie po zlej serii',
        body: [
          'Trenerze,',
          '',
          'Seria porazek zaczyna podkopywac spokoj w klubie. Nie chodzi juz o pojedynczy wynik, tylko o kierunek.',
          'Potrzebuje szybkiej reakcji taktycznej i kadrowej, bo cierpliwosc zarzadu nie bedzie nieskonczona.',
          '',
          `${director.firstName} ${director.lastName}`,
          `Dyrektor sportowy ${club.name}`,
        ].join('\n'),
        priority: 85,
        key: `COMM_LOSS_STREAK_${club.id}_${isoDate}`,
      }));
    }

    if (date.getDate() === 1 && enoughSeasonSample && youthTarget && director.developmentVision >= 12) {
      const targetMinutes = getPlayerMinutes(youthTarget);
      mails.push(buildDirectorMail({
        club,
        director,
        date,
        subject: `Sugestia rozwoju: ${youthTarget.lastName}`,
        body: [
          'Trenerze,',
          '',
          `Chce zwrocic szczegolna uwage na rozwoj ${playerName(youthTarget)}. To profil, ktory warto chronic i wprowadzac coraz odwazniej.`,
          `Na dzis dostal tylko ${targetMinutes} minut, wiec oczekuje dla niego jasniejszej sciezki boiskowej: wiecej minut i cierpliwosci bez pochopnych ocen.`,
          '',
          `${director.firstName} ${director.lastName}`,
          `Dyrektor sportowy ${club.name}`,
        ].join('\n'),
        priority: 63,
        key: `COMM_YOUTH_${club.id}_${monthKey}_${youthTarget.id}`,
      }));
    }

    if (date.getDate() === 1 && enoughSeasonSample && payrollPressure) {
      mails.push(buildDirectorMail({
        club,
        director,
        date,
        subject: 'Presja finansowa w pionie sportowym',
        body: [
          'Trenerze,',
          '',
          'Struktura kosztow kadry zaczyna ciagnac klub w zla strone. Nie chce blokowac wszystkiego, ale potrzebuje wiekszej dyscypliny przy pensjach i kontraktach.',
          `Roczny budzet plac jest dzis dla mnie zbyt ciezki: ${wageBill.toLocaleString('pl-PL')} PLN.`,
          '',
          `${director.firstName} ${director.lastName}`,
          `Dyrektor sportowy ${club.name}`,
        ].join('\n'),
        priority: 82,
        key: `COMM_FINANCE_${club.id}_${monthKey}`,
      }));
    }

    if (date.getDate() === 1 && enoughSeasonSample && (club.boardConfidence ?? 75) < 46) {
      mails.push(buildDirectorMail({
        club,
        director,
        date,
        subject: 'Presja na wynik rosnie',
        body: [
          'Trenerze,',
          '',
          'Zarzad zaczyna patrzec na wyniki coraz ostrzej. Moja rola nie polega na sianiu paniki, ale musze otwarcie powiedziec: margines bledu robi sie mniejszy.',
          'Najblizszy miesiac bedzie mial duze znaczenie dla oceny calego pionu sportowego.',
          '',
          `${director.firstName} ${director.lastName}`,
          `Dyrektor sportowy ${club.name}`,
        ].join('\n'),
        priority: 84,
        key: `COMM_RESULTS_${club.id}_${monthKey}`,
      }));
    }

    return mails;
  },

  applyTransferBudgetAdjustment(params: {
    club: Club;
    players: Player[];
    date: Date;
  }): { updatedClub: Club; mail: MailMessage | null } {
    const { club, players, date } = params;
    const director = club.sportingDirector;
    if (!director) return { updatedClub: club, mail: null };

    const budgetKey = date.toISOString().slice(0, 7);
    if (club.lastSportingDirectorBudgetAdjustmentDate === budgetKey) {
      return { updatedClub: club, mail: null };
    }

    const wageBill = getTotalWageBill(players);
    const payrollPressure = wageBill > Math.max(club.budget * 0.8, 6_500_000);
    const goodTrust = director.relationshipWithManager >= 78 && (club.boardConfidence ?? 75) >= 68;
    const healthyBudget = club.budget >= 7_500_000;

    let adjustment = 0;
    let subject = '';
    let body = '';

    if (payrollPressure && director.financialDiscipline >= 14) {
      adjustment = -Math.max(250_000, Math.round(club.transferBudget * 0.08));
      subject = 'Korekta budzetu transferowego w dol';
      body = [
        'Trenerze,',
        '',
        'Przy obecnej presji plac i kosztow kadry ograniczam dostepny budzet transferowy. To ma ostudzic zbyt agresywne ruchy do czasu poprawy struktury finansowej.',
        `Korekta: ${adjustment.toLocaleString('pl-PL')} PLN.`,
        '',
        `${director.firstName} ${director.lastName}`,
        `Dyrektor sportowy ${club.name}`,
      ].join('\n');
    } else if (goodTrust && healthyBudget && director.flexibility >= 13) {
      adjustment = Math.max(200_000, Math.round(club.transferBudget * 0.06));
      subject = 'Wieksza swoboda na rynku';
      body = [
        'Trenerze,',
        '',
        'Przy obecnej relacji i stabilnej sytuacji klubu daje Ci troche wiecej przestrzeni na rynku. Oczekuje jednak, ze wykorzystasz to rozsadnie.',
        `Dodatkowy margines: +${adjustment.toLocaleString('pl-PL')} PLN.`,
        '',
        `${director.firstName} ${director.lastName}`,
        `Dyrektor sportowy ${club.name}`,
      ].join('\n');
    }

    if (adjustment === 0) {
      return {
        updatedClub: {
          ...club,
          lastSportingDirectorBudgetAdjustmentDate: budgetKey,
        },
        mail: null,
      };
    }

    const updatedClub: Club = {
      ...club,
      transferBudget: Math.max(0, club.transferBudget + adjustment),
      lastSportingDirectorBudgetAdjustmentDate: budgetKey,
    };

    return {
      updatedClub,
      mail: buildDirectorMail({
        club,
        director,
        date,
        subject,
        body,
        priority: adjustment < 0 ? 83 : 61,
        key: `BUDGET_SHIFT_${club.id}_${budgetKey}`,
      }),
    };
  },

  createTransferWindowPolicy(params: {
    club: Club;
    players: Player[];
    date: Date;
  }): { updatedClub: Club; mail: MailMessage | null } {
    const { club, players, date } = params;
    const director = club.sportingDirector;
    if (!director) return { updatedClub: club, mail: null };

    const policyDate = date.toISOString().slice(0, 10);
    if (club.lastSportingDirectorPolicyDate === policyDate) {
      return { updatedClub: club, mail: null };
    }

    const month = date.getMonth();
    const windowType = month === 6 ? 'SUMMER' : 'WINTER';
    const protectedPlayers = pickProtectedPlayers(players, director);
    const protectedIds = new Set(protectedPlayers.map(item => item.playerId));
    const sellCandidates = pickSellCandidates(players, protectedIds, director);
    const developmentPlayers = pickDevelopmentPlayers(players, protectedIds);

    const summary = director.personality === 'ACCOUNTANT'
      ? 'Priorytet: kontrola budzetu i sprzedaz tylko za kwoty powyzej wyceny.'
      : director.personality === 'TALENT_HUNTER' || director.personality === 'VISIONARY'
        ? 'Priorytet: ochrona talentu, minuty dla mlodych i rozsadne odmlodzenie kadry.'
        : director.personality === 'CONTROLLER'
          ? 'Priorytet: zadnych pochopnych ruchow bez zgody pionu sportowego.'
          : 'Priorytet: elastyczna praca na rynku, ale bez naruszania rdzenia zespolu.';
    const budgetDirective = director.financialDiscipline >= 14
      ? 'Budzet transferowy ma pracowac ostroznie. Wysokie pensje i oferty ponizej wyceny beda blokowane czesciej.'
      : director.flexibility >= 14
        ? 'Na rynku dopuszczam troche wiecej swobody, jesli ruch ma sens sportowy.'
        : 'Budzet transferowy zostaje pod normalnym nadzorem pionu sportowego.';

    const policy = {
      issuedAt: policyDate,
      windowType,
      protectedPlayers,
      sellCandidates,
      developmentPlayers,
      summary,
      budgetDirective,
      transferBudgetAdjustment: 0,
    };

    const listLine = (title: string, items: SportingDirectorPolicyItem[]): string => {
      if (items.length === 0) return `${title}: brak jednoznacznych wskazan.`;
      return `${title}:\n${items.map(item => `- ${item.playerName}: ${item.note}`).join('\n')}`;
    };

    const body = [
      'Trenerze,',
      '',
      `Przed ${windowType === 'SUMMER' ? 'letnim' : 'zimowym'} oknem transferowym przedstawiam aktualna polityke sportowa klubu.`,
      '',
      summary,
      budgetDirective,
      '',
      listLine('Zawodnicy chronieni', protectedPlayers),
      '',
      listLine('Kandydaci do sprzedazy', sellCandidates),
      '',
      listLine('Mlodzi do rozwoju', developmentPlayers),
      '',
      'Te wskazania beda mialy znaczenie przy mojej ocenie ruchow kadrowych w tym oknie.',
      '',
      `${director.firstName} ${director.lastName}`,
      `Dyrektor sportowy ${club.name}`,
    ].join('\n');

    const updatedClub: Club = {
      ...club,
      lastSportingDirectorPolicyDate: policyDate,
      sportingDirectorPolicy: policy,
    };

    const mail = buildDirectorMail({
      club,
      director,
      date,
      subject: windowType === 'SUMMER'
        ? 'Polityka sportowa przed letnim oknem'
        : 'Polityka sportowa przed zimowym oknem',
      body,
      priority: 74,
      key: `POLICY_${club.id}_${policyDate}`,
    });

    return { updatedClub, mail };
  },
};
