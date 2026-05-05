import { Club, MailMessage, MailType, Player, Region, SportingDirector, SportingDirectorObjective, SportingDirectorObjectiveResponse, SportingDirectorObjectiveType, SportingDirectorPersonality, SportingDirectorPolicyItem, TransferContractInput } from '../types';
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

  const totalStartsSignal = prospects.reduce((sum, player) => sum + Math.min(player.stats.matchesPlayed, 12), 0);
  return clamp((totalStartsSignal / Math.max(1, prospects.length * 8)) * 100, 0, 100);
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

const buildDirectorMail = (params: {
  club: Club;
  director: SportingDirector;
  date: Date;
  subject: string;
  body: string;
  priority?: number;
}): MailMessage => ({
  id: `SPORTING_DIRECTOR_${params.club.id}_${params.date.getTime()}_${Math.round(Math.random() * 10000)}`,
  sender: `${params.director.firstName} ${params.director.lastName}`,
  role: 'Dyrektor sportowy',
  subject: params.subject,
  body: params.body,
  date: new Date(params.date),
  isRead: false,
  type: MailType.BOARD,
  priority: params.priority ?? 76,
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
      ((b.squadRole === 'KEY_PLAYER' ? 16 : 0) + b.overallRating + b.attributes.talent * 0.35 + (isYoungAsset(b) ? director.developmentVision : 0)) -
      ((a.squadRole === 'KEY_PLAYER' ? 16 : 0) + a.overallRating + a.attributes.talent * 0.35 + (isYoungAsset(a) ? director.developmentVision : 0))
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
  players
    .filter(player => player.age <= 21 && player.attributes.talent >= 68)
    .reduce((sum, player) => sum + player.stats.matchesPlayed, 0);

const addDaysIso = (date: Date, days: number): string => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
};

const chooseObjectiveType = (club: Club, players: Player[], director: SportingDirector): SportingDirectorObjectiveType => {
  const hasYouthProspect = players.some(player => player.age <= 21 && player.attributes.talent >= 68);

  if (hasYouthProspect && (director.personality === 'TALENT_HUNTER' || director.personality === 'VISIONARY' || director.developmentVision >= 15)) {
    return 'YOUTH_DEVELOPMENT';
  }

  if (director.personality === 'ACCOUNTANT' || director.control >= 15) {
    return 'DEFENSIVE_RUN';
  }

  if ((club.stats.goalsAgainst / Math.max(1, club.stats.played)) > 1.55 && director.footballKnowledge >= 13) {
    return 'DEFENSIVE_RUN';
  }

  return 'POINTS_RUN';
};

const buildObjectiveDetails = (
  type: SportingDirectorObjectiveType,
  director: SportingDirector
): { title: string; description: string; target: number } => {
  const demanding = director.relationshipWithManager < 35 || director.ambition >= 15 || director.control >= 15;

  switch (type) {
    case 'YOUTH_DEVELOPMENT':
      return {
        title: 'Cel dyrektora: minuty dla mlodych',
        description: demanding
          ? 'W najblizszych tygodniach oczekuje co najmniej 4 wystepow zawodnikow U21 o wysokim potencjale.'
          : 'W najblizszych tygodniach oczekuje co najmniej 3 wystepow zawodnikow U21 o wysokim potencjale.',
        target: demanding ? 4 : 3,
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
      return {
        title: 'Cel dyrektora: seria punktowa',
        description: demanding
          ? 'W najblizszym okresie oczekuje co najmniej 8 punktow w lidze.'
          : 'W najblizszym okresie oczekuje co najmniej 6 punktow w lidze.',
        target: demanding ? 8 : 6,
      };
  }
};

const evaluateObjectiveProgress = (
  objective: SportingDirectorObjective,
  club: Club,
  players: Player[]
): { completed: boolean; note: string; progress: number } => {
  if (objective.type === 'POINTS_RUN') {
    const pointsGained = club.stats.points - objective.baselinePoints;
    return {
      completed: pointsGained >= objective.target,
      progress: pointsGained,
      note: `Zdobyte punkty: ${pointsGained}/${objective.target}.`,
    };
  }

  if (objective.type === 'YOUTH_DEVELOPMENT') {
    const youthAppearances = getYouthAppearanceSignal(players) - objective.baselineYouthAppearances;
    return {
      completed: youthAppearances >= objective.target,
      progress: youthAppearances,
      note: `Wystepy mlodych zawodnikow: ${youthAppearances}/${objective.target}.`,
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

  if (objective.type === 'POINTS_RUN') {
    return { ...objective, target: Math.max(3, objective.target - 2), dueAt };
  }

  if (objective.type === 'YOUTH_DEVELOPMENT') {
    return { ...objective, target: Math.max(1, objective.target - 1), dueAt };
  }

  return { ...objective, target: objective.target + 2, dueAt };
};

const sharpenObjective = (objective: SportingDirectorObjective): SportingDirectorObjective => {
  if (objective.type === 'POINTS_RUN') {
    return { ...objective, target: objective.target + 1 };
  }

  if (objective.type === 'YOUTH_DEVELOPMENT') {
    return { ...objective, target: objective.target + 1 };
  }

  return { ...objective, target: Math.max(1, objective.target - 1) };
};

const buildReviewBody = (params: {
  club: Club;
  director: SportingDirector;
  score: number;
  relationDelta: number;
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

  const pressureLine = director.control >= 15
    ? 'Bede blisko przygladal sie decyzjom kadrowym i transferowym. Przy tej skali kontroli oczekuje, ze wazne ruchy beda miec mocne uzasadnienie.'
    : director.flexibility >= 15
      ? 'Nie zamierzam reagowac nerwowo na pojedyncze wahania formy, ale chce widziec spojny plan.'
      : 'Nie interesuja mnie deklaracje bez przejscia na boisko. Liczy sie trend, praca z kadra i dyscyplina decyzji.';

  const youthLine = director.developmentVision >= 14
    ? `Rozwoj mlodych oceniam na ${Math.round(youthScore)}/100. To dla mnie wazny punkt projektu sportowego ${club.name}.`
    : `Rozwoj mlodych: ${Math.round(youthScore)}/100. Nie jest to jedyny priorytet, ale nie chce, aby klub tracil potencjal.`;

  const financeLine = director.financialDiscipline >= 14
    ? `Finanse oceniam na ${Math.round(financialScore)}/100. Przy moim podejsciu budzet i place beda stale pod kontrola.`
    : `Finanse oceniam na ${Math.round(financialScore)}/100. Mamy przestrzen do decyzji sportowych, ale bez lekkomyslnosci.`;

  const relationLine = relationDelta >= 0
    ? `Relacja robocza poprawia sie o ${relationDelta} pkt.`
    : `Relacja robocza spada o ${Math.abs(relationDelta)} pkt.`;

  return [
    'Trenerze,',
    '',
    opening,
    '',
    `Ocena miesiaca: ${Math.round(score)}/100.`,
    `Pozycja w lidze: ${leaguePosition}. Oczekiwana pozycja wedlug profilu klubu: ${expectedPosition}.`,
    `Forma z ostatnich spotkan: ${Math.round(formScore)}/100.`,
    youthLine,
    financeLine,
    '',
    pressureLine,
    '',
    relationLine,
    '',
    `${director.firstName} ${director.lastName}`,
    `Dyrektor sportowy ${club.name}`,
  ].join('\n');
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
  }): { updatedClub: Club; mail: MailMessage | null; relationDelta: number; score: number } {
    const { club, players, leagueClubs, date } = params;
    const director = club.sportingDirector;
    if (!director) return { updatedClub: club, mail: null, relationDelta: 0, score: 50 };

    const reviewDate = date.toISOString().slice(0, 10);
    if (club.lastSportingDirectorReviewDate === reviewDate) {
      return { updatedClub: club, mail: null, relationDelta: 0, score: 50 };
    }

    const leaguePosition = getLeaguePosition(club, leagueClubs);
    const expectedPosition = getExpectedPosition(club, Math.max(1, leagueClubs.length));
    const positionGap = expectedPosition - leaguePosition;
    const formScore = getRecentFormScore(club);
    const youthScore = getYouthUsageScore(players);
    const financialScore = getFinancialScore(club);

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

    const score = clamp(baseScore + patienceShield - ambitionPressure + personalityReviewBias(director), 0, 100);
    const tone = getTone(score);
    let relationDelta = Math.round((score - 50) / 9);

    if (tone === 'NEGATIVE' && director.control >= 15) relationDelta -= 1;
    if (tone === 'POSITIVE' && director.flexibility >= 15) relationDelta += 1;
    relationDelta = clamp(relationDelta, -8, 7);

    const updatedDirector: SportingDirector = {
      ...director,
      relationshipWithManager: clamp(director.relationshipWithManager + relationDelta, 0, 100),
    };

    const updatedClub: Club = {
      ...club,
      sportingDirector: updatedDirector,
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
  }): { updatedClub: Club; mail: MailMessage | null } {
    const { club, players, date } = params;
    const director = club.sportingDirector;
    if (!director) return { updatedClub: club, mail: null };
    if (club.leagueId === 'NONE' || club.stats.played < 3) return { updatedClub: club, mail: null };
    if (club.sportingDirectorObjective?.status === 'ACTIVE') return { updatedClub: club, mail: null };

    const objectiveMonth = date.toISOString().slice(0, 7);
    if (club.lastSportingDirectorObjectiveDate === objectiveMonth) {
      return { updatedClub: club, mail: null };
    }

    const type = chooseObjectiveType(club, players, director);
    const details = buildObjectiveDetails(type, director);
    const issuedAt = date.toISOString().slice(0, 10);
    const dueAt = addDaysIso(date, 28);
    const objective: SportingDirectorObjective = {
      id: `SD_OBJECTIVE_${club.id}_${issuedAt}_${type}`,
      type,
      issuedAt,
      dueAt,
      status: 'ACTIVE',
      title: details.title,
      description: details.description,
      target: details.target,
      baselinePoints: club.stats.points,
      baselinePlayed: club.stats.played,
      baselineGoalsAgainst: club.stats.goalsAgainst,
      baselineYouthAppearances: getYouthAppearanceSignal(players),
    };

    const body = [
      'Trenerze,',
      '',
      'Po miesiecznej ocenie wyznaczam konkretny cel operacyjny dla sztabu.',
      '',
      details.description,
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
        subject: details.title,
        body,
        priority: director.relationshipWithManager < 35 ? 88 : 73,
      }),
    };
  },

  evaluateActiveObjective(params: {
    club: Club;
    players: Player[];
    date: Date;
  }): { updatedClub: Club; mail: MailMessage | null } {
    const { club, players, date } = params;
    const director = club.sportingDirector;
    const objective = club.sportingDirectorObjective;
    if (!director || !objective || objective.status !== 'ACTIVE') {
      return { updatedClub: club, mail: null };
    }

    const today = date.toISOString().slice(0, 10);
    if (today < objective.dueAt) {
      return { updatedClub: club, mail: null };
    }

    const result = evaluateObjectiveProgress(objective, club, players);
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
        mail: buildDirectorMail({ club, director, date, subject, body, priority }),
      };
    };

    if (response === 'ACCEPT') {
      const nextObjective: SportingDirectorObjective = {
        ...objective,
        managerResponse: 'ACCEPTED',
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
          managerResponse: 'NEGOTIATED',
          renegotiated: true,
        };
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
        { ...objective, managerResponse: 'NEGOTIATED' },
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
      managerResponse: 'CHALLENGED',
    };
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
    const protectedByPolicy = club.sportingDirectorPolicy?.protectedPlayers.some(item => item.playerId === player.id) ?? false;
    const sellCandidateByPolicy = club.sportingDirectorPolicy?.sellCandidates.some(item => item.playerId === player.id) ?? false;

    let resistance = director.control * 2.1 + director.ambition * 1.15 - director.flexibility * 1.25;
    if (keyPlayer) resistance += 28;
    else if (starter) resistance += 14;
    if (youngAsset) resistance += director.developmentVision * 1.7;
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
      : youngAsset
      ? `${player.firstName} ${player.lastName} jest traktowany jako wazny kapital rozwojowy klubu.`
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
    const protectedByPolicy = club.sportingDirectorPolicy?.protectedPlayers.some(item => item.playerId === player.id) ?? false;
    const sellCandidateByPolicy = club.sportingDirectorPolicy?.sellCandidates.some(item => item.playerId === player.id) ?? false;

    let resistance = director.control * 1.9 + director.ambition * 1.25 - director.flexibility * 1.35;
    if (keyPlayer) resistance += 30;
    else if (starter) resistance += 12;
    if (youngAsset) resistance += director.developmentVision * 1.55;
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
      : youngAsset
      ? `${player.firstName} ${player.lastName} ma zbyt duzy potencjal rozwojowy, zeby sprzedawac go w tej chwili.`
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
  }): { blocked: boolean; message: string; updatedClub: Club; mail?: MailMessage; relationDelta: number } {
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
          'To jest ruch zgodny z kierunkiem, ktory chcemy budowac.',
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
        subject: blocked ? `Weto transferowe: ${player.lastName}` : `Akceptacja transferu: ${player.lastName}`,
        body,
        priority: blocked ? 90 : 62,
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

    const policy = {
      issuedAt: policyDate,
      windowType,
      protectedPlayers,
      sellCandidates,
      developmentPlayers,
      summary,
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
    });

    return { updatedClub, mail };
  },
};
