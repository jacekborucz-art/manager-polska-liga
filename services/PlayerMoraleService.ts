import { BoardAttributeLevel, Club, Fixture, HealthStatus, IndividualTalkType, MailMessage, MailType, MatchStatus, Player, PlayerMindsetState, PlayerMoralePersonality, TrainingIntensity } from '../types';

export interface PlayerMoraleInfo {
  label: string;
  colorClass: string;
  barClass: string;
  description: string;
}

export interface IndividualTalkResult {
  moraleDelta: number;
  newMorale: number;
  isPositive: boolean;
  reactionText: string;
}

export interface PromiseReviewResult {
  player: Player;
  fulfilled: boolean;
  expired: boolean;
  moraleDelta: number;
}

export interface MoraleDemandProcessResult {
  players: Player[];
  mails: MailMessage[];
}

export interface IndividualTalkOption {
  type: IndividualTalkType;
  title: string;
  description: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const PERSONALITIES: PlayerMoralePersonality[] = [
  'PROFESSIONAL',
  'AMBITIOUS',
  'SENSITIVE',
  'CONFIDENT',
  'NERVOUS',
  'LOYAL',
  'EGOIST',
  'CALM',
];

export const INDIVIDUAL_TALK_OPTIONS: IndividualTalkOption[] = [
  {
    type: 'PRAISE',
    title: 'Pochwal ostatni występ',
    description: 'Świetny występ. Takiej energii i jakości potrzebuję od ciebie dalej.',
  },
  {
    type: 'MOTIVATE',
    title: 'Zmotywuj przed meczem',
    description: 'Dzisiaj liczę na ciebie. Wyjdź odważnie i pokaż swoją jakość.',
  },
  {
    type: 'SUPPORT',
    title: 'Wesprzyj po błędzie',
    description: 'Głowa do góry. Błędy się zdarzają, ale wierzę, że szybko wrócisz na właściwy poziom.',
  },
  {
    type: 'CRITICIZE',
    title: 'Skrytykuj słabą formę',
    description: 'Oczekuję więcej. Masz umiejętności, ale musisz pokazać większą jakość i koncentrację.',
  },
  {
    type: 'PROMISE_MINUTES',
    title: 'Obiecaj więcej minut',
    description: 'Dostaniesz więcej minut. Bądź gotowy, bo będę chciał dać ci szansę.',
  },
  {
    type: 'DEMAND_WORK',
    title: 'Zachęć do cięższej pracy',
    description: 'Potrzebuję od ciebie cięższej pracy na treningach. Stać cię na więcej.',
  },
];

const seededRng = (seed: number, offset: number): number => {
  const x = Math.sin(seed + offset * 9973) * 10000;
  return x - Math.floor(x);
};

const dateOnly = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dayDiff = (from: Date, to: Date): number =>
  Math.floor((dateOnly(to).getTime() - dateOnly(from).getTime()) / DAY_MS);

const stableHash = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const toDateKey = (date: Date): string => date.toISOString().split('T')[0];

const roleLabel = (role: 'STARTER' | 'KEY_PLAYER' | null | undefined): string => {
  if (role === 'KEY_PLAYER') return 'kluczowy zawodnik';
  if (role === 'STARTER') return 'podstawowa jedenastka';
  return 'bez określonego statusu';
};

const boardAttributeScore = (level: BoardAttributeLevel | undefined): number => {
  if (level === 'bardzo_wysoka') return 4;
  if (level === 'wysoka') return 3;
  if (level === 'przecietna') return 2;
  if (level === 'niska') return 1;
  if (level === 'bardzo_niska') return 0;
  return 2;
};

const roundTransferPrice = (value: number): number => {
  const step = value >= 10_000_000 ? 500_000 : value >= 1_000_000 ? 100_000 : 25_000;
  return Math.max(step, Math.ceil(value / step) * step);
};

const estimateProtectedExitPrice = (player: Player, club: Club, squadAverage: number): number => {
  const marketValue = player.marketValue ?? Math.max(150_000, Math.round(player.overallRating * player.overallRating * 4200));
  const squadPremium = Math.max(0, player.overallRating - squadAverage) * 0.035;
  const clubPremium = Math.max(0, club.reputation - 7) * 0.025;
  const untouchablePremium = player.isUntouchable ? 0.28 : 0.12;
  return roundTransferPrice(marketValue * (1.15 + untouchablePremium + squadPremium + clubPremium));
};

const shouldBoardSupportProtectedExit = (
  player: Player,
  club: Club,
  squadAverage: number,
  transferRandomFactor: number
): boolean => {
  const marketValue = player.marketValue ?? 0;
  const annualSalary = player.annualSalary ?? 0;
  const saleLooksValuable =
    marketValue >= Math.max(500_000, annualSalary * 3) ||
    player.overallRating >= squadAverage + 9;

  if (!saleLooksValuable) return false;

  const greedScore = boardAttributeScore(club.board?.chciwosc);
  const ambitionScore = boardAttributeScore(club.board?.ambicja);
  const financialPressure =
    club.transferBudget < marketValue * 0.35 ? 4 :
    club.budget < marketValue * 0.2 ? 3 :
    0;
  const confidencePressure = (club.boardConfidence ?? 70) < 55 ? 3 : 0;
  const sportingResistance = ambitionScore >= 3 && player.overallRating >= squadAverage + 10 ? 3 : 0;

  return greedScore * 2 + financialPressure + confidencePressure + transferRandomFactor - sportingResistance >= 5;
};

interface SeasonOutputProfile {
  goals: number;
  assists: number;
  goalContributions: number;
  matches: number;
  averageRating: number | null;
}

const getSeasonOutputProfile = (player: Player): SeasonOutputProfile => {
  const statGroups = [player.stats, player.cupStats, player.euroStats].filter(Boolean);
  const goals = statGroups.reduce((sum, stats) => sum + (stats?.goals ?? 0), 0);
  const assists = statGroups.reduce((sum, stats) => sum + (stats?.assists ?? 0), 0);
  const matches = statGroups.reduce((sum, stats) => sum + (stats?.matchesPlayed ?? 0), 0);
  const ratings = statGroups.flatMap(stats => stats?.ratingHistory ?? []);
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : null;

  return {
    goals,
    assists,
    goalContributions: goals + assists,
    matches,
    averageRating,
  };
};

const hasStandoutSeasonOutput = (player: Player, profile: SeasonOutputProfile): boolean => {
  if (profile.matches < 10) return false;

  const excellentRatings = profile.matches >= 14 && (profile.averageRating ?? 0) >= 7.22;
  if (excellentRatings) return true;

  if (player.position === 'FWD') {
    return profile.goals >= 14 || profile.goalContributions >= 20;
  }

  if (player.position === 'MID') {
    return profile.assists >= 10 || profile.goalContributions >= 16;
  }

  if (player.position === 'DEF') {
    return profile.goalContributions >= 8 || (profile.matches >= 16 && (profile.averageRating ?? 0) >= 7.1);
  }

  return (player.stats.cleanSheets ?? 0) >= 10 || (profile.matches >= 16 && (profile.averageRating ?? 0) >= 7.05);
};

const formatSeasonOutputSummary = (profile: SeasonOutputProfile): string => {
  const ratingPart = profile.averageRating !== null
    ? `, średnia ocen ${profile.averageRating.toFixed(2).replace('.', ',')}`
    : '';
  return `${profile.goals} goli, ${profile.assists} asyst${ratingPart}`;
};

const isAvailableForMinutesDemand = (player: Player): boolean =>
  player.health.status === HealthStatus.HEALTHY &&
  player.condition >= 75 &&
  (player.fatigueDebt ?? 0) <= 55;

const getContractDaysLeft = (player: Player, currentDate: Date): number => {
  if (!player.contractEndDate) return 9999;
  const contractEnd = new Date(player.contractEndDate);
  if (Number.isNaN(contractEnd.getTime())) return 9999;
  return Math.floor((contractEnd.getTime() - currentDate.getTime()) / DAY_MS);
};

const getAgeTransferStabilityBias = (player: Player): number => {
  const isEliteLatePrime = player.age >= 26 && player.overallRating >= 85;

  if (player.age < 26) return 0;
  if (player.age <= 28) return isEliteLatePrime ? -1 : -4;
  if (player.age <= 31) return isEliteLatePrime ? -3 : -8;
  if (player.age <= 34) return isEliteLatePrime ? -8 : -14;
  return isEliteLatePrime ? -12 : -20;
};

type MinutesDemandApproach = 'PATIENT' | 'CALM' | 'ASSERTIVE' | 'BRAZEN';

interface MinutesDemandMindset {
  approach: MinutesDemandApproach;
  selfBeliefBias: number;
  minimumMinutesGap: number;
  readinessThreshold: number;
  priority: number;
  moraleDrop: number;
}

const getMinutesDemandMindset = (personality: PlayerMoralePersonality): MinutesDemandMindset => {
  const mindsets: Record<PlayerMoralePersonality, MinutesDemandMindset> = {
    PROFESSIONAL: { approach: 'CALM', selfBeliefBias: 0, minimumMinutesGap: 0.18, readinessThreshold: 64, priority: 3, moraleDrop: -1 },
    AMBITIOUS: { approach: 'ASSERTIVE', selfBeliefBias: 8, minimumMinutesGap: 0.12, readinessThreshold: 53, priority: 4, moraleDrop: -2 },
    SENSITIVE: { approach: 'PATIENT', selfBeliefBias: -2, minimumMinutesGap: 0.22, readinessThreshold: 66, priority: 3, moraleDrop: -2 },
    CONFIDENT: { approach: 'ASSERTIVE', selfBeliefBias: 7, minimumMinutesGap: 0.14, readinessThreshold: 55, priority: 4, moraleDrop: -2 },
    NERVOUS: { approach: 'PATIENT', selfBeliefBias: -5, minimumMinutesGap: 0.25, readinessThreshold: 70, priority: 3, moraleDrop: -2 },
    LOYAL: { approach: 'PATIENT', selfBeliefBias: -6, minimumMinutesGap: 0.24, readinessThreshold: 72, priority: 2, moraleDrop: -1 },
    EGOIST: { approach: 'BRAZEN', selfBeliefBias: 12, minimumMinutesGap: 0.08, readinessThreshold: 46, priority: 5, moraleDrop: -3 },
    CALM: { approach: 'PATIENT', selfBeliefBias: -4, minimumMinutesGap: 0.22, readinessThreshold: 69, priority: 2, moraleDrop: -1 },
  };
  return mindsets[personality];
};

const getMinutesDemandCopy = (player: Player, approach: MinutesDemandApproach, recentAverageRating: number | null): { subject: string; body: string } => {
  const formSentence = recentAverageRating !== null && recentAverageRating >= 7
    ? `Moje ostatnie występy też dają mi argumenty. Średnia ocen z ostatnich meczów to ${recentAverageRating.toFixed(1).replace('.', ',')}.`
    : 'Czuję się gotowy, żeby dać drużynie więcej na boisku.';

  if (approach === 'BRAZEN') {
    return {
      subject: `Żądanie większej liczby minut: ${player.lastName}`,
      body: `Trenerze,\n\nPowiem wprost: przy mojej jakości obecna liczba minut jest nie do zaakceptowania. Widzę zawodników, którzy dostają więcej szans, choć nie dają drużynie więcej ode mnie. ${formSentence}\n\nOczekuję realnej zmiany w najbliższych tygodniach. Nie zamierzam bez końca czekać na ławce, gdy wiem, że zasługuję na grę.\n\n${player.firstName} ${player.lastName}`,
    };
  }

  if (approach === 'ASSERTIVE') {
    return {
      subject: `Rozmowa o większej liczbie minut: ${player.lastName}`,
      body: `Trenerze,\n\nChciałbym jasno porozmawiać o swojej sytuacji. Uważam, że jestem gotowy na większą odpowiedzialność, a obecna liczba minut nie odpowiada mojej pozycji w kadrze. ${formSentence}\n\nProszę o realną szansę w najbliższych tygodniach. Chcę udowodnić swoją wartość na boisku, ale potrzebuję do tego uczciwej okazji.\n\n${player.firstName} ${player.lastName}`,
    };
  }

  if (approach === 'CALM') {
    return {
      subject: `Prośba o więcej występów: ${player.lastName}`,
      body: `Trenerze,\n\nChciałbym spokojnie porozmawiać o swojej roli. Szanuję decyzje sztabu, ale czuję, że mogę dać drużynie więcej. ${formSentence}\n\nNie oczekuję gwarancji miejsca w składzie. Proszę jedynie o realną możliwość pokazania, że zasługuję na więcej minut.\n\n${player.firstName} ${player.lastName}`,
    };
  }

  return {
    subject: `Prośba o szansę: ${player.lastName}`,
    body: `Trenerze,\n\nWiem, że o miejsce w składzie trzeba cierpliwie walczyć i nie chcę stawiać sprawy na ostrzu noża. Czuję jednak, że jestem gotowy, by pomóc drużynie częściej. ${formSentence}\n\nJeśli pojawi się okazja, proszę dać mi szansę. Chciałbym odpowiedzieć na boisku i pokazać, że można na mnie liczyć.\n\n${player.firstName} ${player.lastName}`,
  };
};

const getDevelopmentExitDemandCopy = (
  player: Player,
  personality: PlayerMoralePersonality,
  totalMinutes: number
): { subject: string; body: string; priority: number; moraleDrop: number } => {
  const minutesLine = totalMinutes > 0
    ? `W tym sezonie mam tylko ${totalMinutes} minut i to nie wystarcza, żeby się rozwijać.`
    : 'W tym sezonie praktycznie nie dostaję minut i nie mogę się rozwijać bez gry.';
  const exitLine = player.age <= 23
    ? 'Jestem w wieku, w którym potrzebuję regularnych występów, a nie samego czekania na ławce.'
    : 'Potrzebuję regularnej gry, żeby utrzymać rytm i swoją pozycję sportową.';

  if (personality === 'EGOIST' || personality === 'AMBITIOUS') {
    return {
      subject: `Prośba o odejście albo wypożyczenie: ${player.lastName}`,
      body: `Trenerze,\n\nRozmawialiśmy już o minutach, ale moja sytuacja się nie zmieniła. ${minutesLine} ${exitLine}\n\nJeśli nie ma dla mnie realnego miejsca w zespole, proszę o wystawienie mnie na listę transferową albo zgodę na wypożyczenie. Chcę grać, rozwijać się i mieć jasną drogę do kolejnego kroku.\n\nNie chcę przeciągać tej sytuacji. Potrzebuję konkretnej decyzji klubu.\n\n${player.firstName} ${player.lastName}`,
      priority: 5,
      moraleDrop: -5,
    };
  }

  if (personality === 'LOYAL' || personality === 'PROFESSIONAL' || personality === 'CALM') {
    return {
      subject: `Prośba o rozwiązanie sytuacji z minutami: ${player.lastName}`,
      body: `Trenerze,\n\nSzanuję decyzje sztabu, ale po mojej prośbie o więcej minut dalej nie dostałem realnej szansy. ${minutesLine} ${exitLine}\n\nJeśli w najbliższym czasie nie ma dla mnie miejsca w drużynie, proszę o zgodę na wypożyczenie, a jeśli to nie będzie możliwe, o rozważenie transferu. Chcę zachować profesjonalizm, ale potrzebuję gry.\n\n${player.firstName} ${player.lastName}`,
      priority: 4,
      moraleDrop: -3,
    };
  }

  return {
    subject: `Rozmowa o przyszłości po braku minut: ${player.lastName}`,
    body: `Trenerze,\n\nPo mojej prośbie o więcej występów sytuacja się nie zmieniła. ${minutesLine} ${exitLine}\n\nChciałbym porozmawiać o rozwiązaniu: albo dostanę realną ścieżkę do gry tutaj, albo klub pozwoli mi odejść bądź pójść na wypożyczenie. Dla mojego rozwoju najważniejsze są teraz regularne minuty.\n\n${player.firstName} ${player.lastName}`,
    priority: 4,
    moraleDrop: -4,
  };
};

const getTransferListDemandCopy = (
  player: Player,
  personality: PlayerMoralePersonality,
  trigger: 'HIGHER_REPUTATION' | 'STANDOUT_SEASON' | 'STRONG_INTEREST' | 'DEFAULT',
  seasonOutputSummary?: string
): { subject: string; body: string } => {
  if (trigger === 'STANDOUT_SEASON') {
    const outputSentence = seasonOutputSummary
      ? `Ten sezon daje mi konkretne argumenty: ${seasonOutputSummary}.`
      : 'Ten sezon daje mi konkretne argumenty sportowe.';
    return {
      subject: `Prośba po mocnym sezonie: ${player.lastName}`,
      body: `Trenerze,\n\nCzuję, że po takim sezonie powinienem zrobić kolejny krok w karierze. ${outputSentence} Uważam, że moja forma może zainteresować mocniejsze kluby i nie chcę przegapić tego momentu.\n\nProszę o wystawienie mnie na listę transferową albo jasną deklarację, że klub będzie gotów rozmawiać, jeśli pojawi się odpowiednia oferta. Chcę zachować profesjonalizm, ale potrzebuję uczciwej drogi do rozwoju.\n\n${player.firstName} ${player.lastName}`,
    };
  }

  if (trigger === 'STRONG_INTEREST') {
    return {
      subject: `Prośba o zgodę na rozmowy: ${player.lastName}`,
      body: `Trenerze,\n\nWiem, że interesują się mną kluby o wyższej reputacji. Dla mnie to jasny sygnał, że mogę spróbować gry na wyższym poziomie i chciałbym potraktować tę szansę poważnie.\n\nProszę o wystawienie mnie na listę transferową albo zgodę na rozmowy przy odpowiedniej ofercie. Nie chcę odchodzić w konflikcie, ale czuję, że ten moment może być ważny dla mojej kariery.\n\n${player.firstName} ${player.lastName}`,
    };
  }

  if (trigger === 'HIGHER_REPUTATION') {
    return {
      subject: `Rozmowa o kolejnym kroku w karierze: ${player.lastName}`,
      body: `Trenerze,\n\nCzuję, że sportowo jestem gotowy na kolejny krok. Moja forma i poziom, który pokazuję na boisku, dają mi przekonanie, że powinienem spróbować gry w klubie o wyższej reputacji i większych ambicjach.\n\nSzanuję drużynę i nie chcę odchodzić za wszelką cenę. Proszę jednak o zgodę na odejście, jeśli pojawi się odpowiednia oferta z mocniejszego klubu. Chciałbym, żebyśmy uczciwie porozmawiali o mojej przyszłości.\n\n${player.firstName} ${player.lastName}`,
    };
  }

  if (player.isUntouchable) {
    if (personality === 'EGOIST' || personality === 'AMBITIOUS' || personality === 'CONFIDENT') {
      return {
        subject: `Rozmowa o mojej przyszłości: ${player.lastName}`,
        body: `Trenerze,\n\nChciałbym porozmawiać o swojej przyszłości. Wiem, że klub oznaczył mnie jako zawodnika „nie na sprzedaż”, ale nie chcę, żeby ten status zamknął mi drogę do kolejnego kroku w karierze.\n\nCzuję, że jestem gotowy na nowe wyzwanie. Nie oczekuję zgody na pierwszy przypadkowy transfer, ale chcę jasnej deklaracji, że przy naprawdę dobrej ofercie klub będzie gotowy usiąść do rozmów.\n\n${player.firstName} ${player.lastName}`,
      };
    }

    return {
      subject: `Prośba o rozmowę o przyszłości: ${player.lastName}`,
      body: `Trenerze,\n\nDoceniam, że klub uważa mnie za ważnego zawodnika. Chciałbym jednak spokojnie porozmawiać o statusie „nie na sprzedaż”. W dłuższej perspektywie chciałbym mieć możliwość zrobienia kolejnego kroku w karierze.\n\nNie zależy mi na konflikcie ani odejściu do przypadkowego zespołu. Proszę tylko, aby klub pozostał otwarty na naprawdę dobrą ofertę i potraktował moje ambicje poważnie.\n\n${player.firstName} ${player.lastName}`,
    };
  }

  return {
    subject: `Prośba o listę transferową: ${player.lastName}`,
    body: `Trenerze,\n\nNie czuję się już dobrze w tej drużynie. Mam poczucie, że mój poziom sportowy i ambicje rozchodzą się z miejscem, w którym obecnie jesteśmy jako zespół.\n\nProszę o zgodę na wystawienie mnie na listę transferową. Chcę zachować profesjonalizm, ale potrzebuję jasnej drogi do zmiany otoczenia.\n\n${player.firstName} ${player.lastName}`,
  };
};

const getPlayerTalkResponse = (talkType: IndividualTalkType, isPositive: boolean): string => {
  const responses: Record<IndividualTalkType, { positive: string; negative: string }> = {
    PRAISE: {
      positive: 'Dziękuję, trenerze. Dobrze to słyszeć. Postaram się utrzymać ten poziom.',
      negative: 'Doceniam słowa, ale czuję, że mogłem dać drużynie jeszcze więcej.',
    },
    MOTIVATE: {
      positive: 'Jestem gotowy. Wyjdę na boisko z pełnym zaangażowaniem.',
      negative: 'Rozumiem, trenerze, ale potrzebuję jeszcze chwili, żeby złapać pewność.',
    },
    SUPPORT: {
      positive: 'Dzięki za wsparcie. To dla mnie ważne. Odpowiem na boisku.',
      negative: 'Wiem, że chciał pan dobrze, ale dalej siedzi mi to w głowie.',
    },
    CRITICIZE: {
      positive: 'Przyjmuję to. Wiem, że muszę dać więcej i popracuję nad tym.',
      negative: 'Rozumiem uwagi, ale czuję, że ocena była zbyt surowa.',
    },
    PROMISE_MINUTES: {
      positive: 'Dobrze, trenerze. Będę gotowy, kiedy dostanę swoją szansę.',
      negative: 'Chcę w to wierzyć, ale muszę zobaczyć, że naprawdę dostanę okazję.',
    },
    DEMAND_WORK: {
      positive: 'Ma pan rację. Podkręcę tempo na treningach.',
      negative: 'Pracuję ciężko, trenerze. Mam nadzieję, że też pan to zauważy.',
    },
  };

  const response = responses[talkType];
  return isPositive ? response.positive : response.negative;
};

const isSameOrHigherRole = (
  currentRole: 'STARTER' | 'KEY_PLAYER' | null | undefined,
  requestedRole: 'STARTER' | 'KEY_PLAYER' | null | undefined
): boolean => {
  if (!requestedRole) return true;
  if (requestedRole === 'STARTER') return currentRole === 'STARTER' || currentRole === 'KEY_PLAYER';
  return currentRole === 'KEY_PLAYER';
};

type PlayerMindsetKey =
  | 'coachTrust'
  | 'clubHappiness'
  | 'squadBelonging'
  | 'roleClarity'
  | 'playingTimeSatisfaction'
  | 'developmentSatisfaction'
  | 'transferOpenness'
  | 'conflictLevel';

type PlayerMindsetDelta = Partial<Record<PlayerMindsetKey, number>>;

export const PlayerMoraleService = {
  clamp: (morale: number): number => Math.max(0, Math.min(100, Math.round(morale))),

  getInitialMorale: (player: Pick<Player, 'id' | 'age' | 'attributes'>): number => {
    const base = 52 + Math.round(((player.attributes.mentality ?? 50) - 50) * 0.10);
    const ageBonus = player.age <= 21 ? 3 : player.age >= 31 ? 1 : 0;
    const variation = Math.floor(seededRng(stableHash(player.id), 3) * 17) - 6;
    return PlayerMoraleService.clamp(base + ageBonus + variation);
  },

  getInitialPersonality: (player: Pick<Player, 'id' | 'attributes'>): PlayerMoralePersonality => {
    const attrs = player.attributes;
    if ((attrs.workRate ?? 50) >= 75 && (attrs.mentality ?? 50) >= 68) return 'PROFESSIONAL';
    if ((attrs.talent ?? 50) >= 78 || (attrs.attacking ?? 50) >= 76) return 'AMBITIOUS';
    if ((attrs.leadership ?? 50) >= 76) return 'CONFIDENT';
    if ((attrs.aggression ?? 50) >= 76) return 'EGOIST';
    const index = Math.floor(seededRng(stableHash(player.id), 7) * PERSONALITIES.length);
    return PERSONALITIES[index] ?? 'CALM';
  },

  getInitialMindset: (player: Player): PlayerMindsetState => {
    const morale = player.morale ?? PlayerMoraleService.getInitialMorale(player);
    const personality = player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player);
    const professionalBonus = personality === 'PROFESSIONAL' ? 6 : personality === 'LOYAL' ? 8 : personality === 'EGOIST' ? -8 : 0;
    const ambitionPressure = personality === 'AMBITIOUS' || personality === 'EGOIST' ? 8 : personality === 'CALM' ? -4 : 0;
    const hasRole = player.squadRole === 'STARTER' || player.squadRole === 'KEY_PLAYER';
    const youngDevelopmentNeed = player.age <= 23 ? 5 : 0;
    const ageStability = player.age >= 35 ? 16 : player.age >= 32 ? 11 : player.age >= 29 ? 7 : player.age >= 26 ? 3 : 0;

    return {
      coachTrust: PlayerMoraleService.clamp(morale + professionalBonus),
      clubHappiness: PlayerMoraleService.clamp(morale + Math.round(professionalBonus * 0.5)),
      squadBelonging: PlayerMoraleService.clamp(morale + (personality === 'LOYAL' ? 10 : 0) - (player.isOnTransferList ? 18 : 0)),
      roleClarity: PlayerMoraleService.clamp(55 + (hasRole ? 12 : -4) + professionalBonus),
      playingTimeSatisfaction: PlayerMoraleService.clamp(morale + (hasRole ? 5 : -4)),
      developmentSatisfaction: PlayerMoraleService.clamp(morale - youngDevelopmentNeed + (player.trainingFocus ? 4 : 0)),
      transferOpenness: PlayerMoraleService.clamp(45 - morale + ambitionPressure - ageStability + (player.isOnTransferList ? 35 : 0) + ((player.interestedClubs?.length ?? 0) * 5)),
      conflictLevel: PlayerMoraleService.clamp(55 - morale + Math.max(0, ambitionPressure)),
      lastUpdatedAt: undefined,
      history: [],
    };
  },

  normalizeMindset: (player: Player): PlayerMindsetState => {
    const initial = PlayerMoraleService.getInitialMindset(player);
    const existing = player.playerMindset;
    if (!existing) return initial;

    return {
      coachTrust: PlayerMoraleService.clamp(existing.coachTrust ?? initial.coachTrust),
      clubHappiness: PlayerMoraleService.clamp(existing.clubHappiness ?? initial.clubHappiness),
      squadBelonging: PlayerMoraleService.clamp(existing.squadBelonging ?? initial.squadBelonging),
      roleClarity: PlayerMoraleService.clamp(existing.roleClarity ?? initial.roleClarity),
      playingTimeSatisfaction: PlayerMoraleService.clamp(existing.playingTimeSatisfaction ?? initial.playingTimeSatisfaction),
      developmentSatisfaction: PlayerMoraleService.clamp(existing.developmentSatisfaction ?? initial.developmentSatisfaction),
      transferOpenness: PlayerMoraleService.clamp(existing.transferOpenness ?? initial.transferOpenness),
      conflictLevel: PlayerMoraleService.clamp(existing.conflictLevel ?? initial.conflictLevel),
      lastUpdatedAt: existing.lastUpdatedAt,
      history: existing.history ?? [],
    };
  },

  inferMindsetDelta: (reason: string, moraleDelta: number): PlayerMindsetDelta => {
    const text = reason.toLowerCase();
    const impact = Math.max(1, Math.min(10, Math.abs(moraleDelta)));
    const sign = moraleDelta >= 0 ? 1 : -1;
    const deltas: PlayerMindsetDelta = {
      clubHappiness: sign * Math.max(1, Math.round(impact * 0.7)),
      conflictLevel: sign > 0 ? -Math.max(1, Math.round(impact * 0.6)) : Math.max(1, Math.round(impact * 0.8)),
    };

    const add = (key: PlayerMindsetKey, value: number) => {
      deltas[key] = (deltas[key] ?? 0) + value;
    };

    if (text.includes('rozmow') || text.includes('trener') || text.includes('obietnic')) {
      add('coachTrust', sign * Math.max(1, Math.round(impact * 0.9)));
    }
    if (text.includes('minut') || text.includes('występ') || text.includes('gry w następnym meczu')) {
      add('playingTimeSatisfaction', sign * Math.max(2, impact));
      add('coachTrust', sign * Math.max(1, Math.round(impact * 0.5)));
    }
    if (text.includes('rola') || text.includes('status') || text.includes('podstawowa') || text.includes('kluczowy')) {
      add('roleClarity', sign * Math.max(2, impact));
      add('coachTrust', sign * Math.max(1, Math.round(impact * 0.5)));
    }
    if (text.includes('rozw') || text.includes('wypożyczenie') || text.includes('braku minut')) {
      add('developmentSatisfaction', sign * Math.max(2, impact));
    }
    if (text.includes('transfer') || text.includes('odej') || text.includes('sprzeda') || text.includes('ofert')) {
      add('transferOpenness', sign > 0 ? -Math.max(1, Math.round(impact * 0.7)) : Math.max(2, impact));
      add('coachTrust', sign * Math.max(1, Math.round(impact * 0.4)));
    }
    if (text.includes('rezerw')) {
      add('squadBelonging', sign * Math.max(2, impact));
      add('roleClarity', sign * Math.max(1, Math.round(impact * 0.6)));
    }
    if (text.includes('konflikt') || text.includes('zignorowan') || text.includes('odrzucon') || text.includes('niespełnion')) {
      add('conflictLevel', Math.max(2, impact));
      add('coachTrust', -Math.max(2, impact));
    }
    if (text.includes('naturalna stabilizacja')) {
      return {
        clubHappiness: sign,
        conflictLevel: sign > 0 ? -1 : 1,
      };
    }

    return deltas;
  },

  withMindsetChange: (player: Player, deltas: PlayerMindsetDelta, reason: string, date: Date): Player => {
    const current = PlayerMoraleService.normalizeMindset(player);
    const next: PlayerMindsetState = { ...current };
    let changed = false;

    (Object.entries(deltas) as Array<[PlayerMindsetKey, number]>).forEach(([key, delta]) => {
      if (!delta) return;
      const previousValue = next[key];
      const nextValue = PlayerMoraleService.clamp(previousValue + delta);
      if (nextValue === previousValue) return;
      next[key] = nextValue;
      changed = true;
    });

    if (!changed) return { ...player, playerMindset: current };

    const entry = {
      id: `MINDSET_${player.id}_${date.getTime()}_${stableHash(reason)}`,
      date: toDateKey(date),
      reason,
      deltas,
    };

    return {
      ...player,
      playerMindset: {
        ...next,
        lastUpdatedAt: toDateKey(date),
        history: [entry, ...(current.history ?? [])].slice(0, 16),
      },
    };
  },

  ensurePlayerState: (player: Player): Player => ({
    ...player,
    morale: player.morale ?? PlayerMoraleService.getInitialMorale(player),
    moralePersonality: player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player),
    moraleHistory: player.moraleHistory ?? [],
    playerMindset: PlayerMoraleService.normalizeMindset(player),
    lastIndividualTalkDate: player.lastIndividualTalkDate ?? null,
    promisedMinutesUntil: player.promisedMinutesUntil ?? null,
    promisedMinutesBaseline: player.promisedMinutesBaseline ?? null,
    promisedRoleNextMatchFixtureId: player.promisedRoleNextMatchFixtureId ?? null,
    lastMoraleDemandDate: player.lastMoraleDemandDate ?? null,
    minutesDemandUntil: player.minutesDemandUntil ?? null,
    minutesDemandBaseline: player.minutesDemandBaseline ?? null,
    unresolvedMinutesDemandDate: player.unresolvedMinutesDemandDate ?? null,
    unresolvedMinutesDemandBaseline: player.unresolvedMinutesDemandBaseline ?? null,
    developmentExitDemandUntil: player.developmentExitDemandUntil ?? null,
    developmentExitDemandBaseline: player.developmentExitDemandBaseline ?? null,
    lastTemptingOfferConflictDate: player.lastTemptingOfferConflictDate ?? null,
    roleDemandUntil: player.roleDemandUntil ?? null,
    requestedSquadRole: player.requestedSquadRole ?? null,
    transferListDemandUntil: player.transferListDemandUntil ?? null,
    reserveProtestUntil: player.reserveProtestUntil ?? null,
    moraleDemandLockoutUntil: player.moraleDemandLockoutUntil ?? null,
  }),

  getMoraleDemandLockoutUntil: (currentDate: Date): string => {
    const lockoutUntil = new Date(currentDate);
    lockoutUntil.setFullYear(lockoutUntil.getFullYear() + 1);
    return lockoutUntil.toISOString();
  },

  isMoraleDemandLocked: (player: Player, currentDate: Date): boolean => {
    if (!player.moraleDemandLockoutUntil) return false;
    const lockoutUntil = new Date(player.moraleDemandLockoutUntil);
    return !Number.isNaN(lockoutUntil.getTime()) && dateOnly(currentDate).getTime() < dateOnly(lockoutUntil).getTime();
  },

  hasActiveMoraleDemand: (player: Player): boolean =>
    !!player.minutesDemandUntil ||
    !!player.roleDemandUntil ||
    !!player.transferListDemandUntil ||
    !!player.developmentExitDemandUntil ||
    !!player.reserveProtestUntil,

  applyContractSigningMindflowReset: (player: Player, currentDate: Date): Player => ({
    ...player,
    playerMindset: PlayerMoraleService.withMindsetChange(
      PlayerMoraleService.ensurePlayerState(player),
      {
        coachTrust: 8,
        clubHappiness: 6,
        roleClarity: 4,
        transferOpenness: -12,
        conflictLevel: -12,
      },
      'Podpisanie kontraktu i wyciszenie żądań',
      currentDate
    ).playerMindset,
    moraleDemandLockoutUntil: PlayerMoraleService.getMoraleDemandLockoutUntil(currentDate),
    lastMoraleDemandDate: null,
    promisedMinutesUntil: null,
    minutesDemandUntil: null,
    minutesDemandBaseline: null,
    unresolvedMinutesDemandDate: null,
    unresolvedMinutesDemandBaseline: null,
    developmentExitDemandUntil: null,
    developmentExitDemandBaseline: null,
    lastTemptingOfferConflictDate: null,
    promisedRoleNextMatchFixtureId: null,
    roleDemandUntil: null,
    requestedSquadRole: null,
    transferListDemandUntil: null,
    reserveProtestUntil: null,
  }),

  withMoraleChange: (player: Player, delta: number, reason: string, date: Date): Player => {
    const withMorale = PlayerMoraleService.ensurePlayerState(player);
    const previousMorale = withMorale.morale ?? 50;
    const nextMorale = PlayerMoraleService.clamp(previousMorale + delta);
    if (delta === 0 || nextMorale === previousMorale) return withMorale;

    const entry = {
      id: `MORALE_${withMorale.id}_${date.getTime()}_${Math.abs(delta)}_${stableHash(reason)}`,
      date: toDateKey(date),
      delta: nextMorale - previousMorale,
      reason,
      moraleAfter: nextMorale,
    };

    const withUpdatedMindset = PlayerMoraleService.withMindsetChange(
      withMorale,
      PlayerMoraleService.inferMindsetDelta(reason, nextMorale - previousMorale),
      reason,
      date
    );

    return {
      ...withMorale,
      playerMindset: withUpdatedMindset.playerMindset,
      morale: nextMorale,
      moraleHistory: [entry, ...(withMorale.moraleHistory ?? [])].slice(0, 12),
    };
  },

  getInfo: (morale: number = 50): PlayerMoraleInfo => {
    if (morale <= 19) {
      return { label: 'Bardzo słabe', colorClass: 'text-red-500', barClass: 'bg-red-500', description: 'Zawodnik gra spięty i łatwiej traci pewność po błędzie.' };
    }
    if (morale <= 39) {
      return { label: 'Słabe', colorClass: 'text-orange-400', barClass: 'bg-orange-500', description: 'Potrzebuje dobrego występu albo rozmowy, żeby wrócić do rytmu.' };
    }
    if (morale <= 59) {
      return { label: 'Normalne', colorClass: 'text-slate-200', barClass: 'bg-slate-400', description: 'Stabilne nastawienie bez wyraźnych odchyleń.' };
    }
    if (morale <= 79) {
      return { label: 'Wysokie', colorClass: 'text-emerald-400', barClass: 'bg-emerald-500', description: 'Zawodnik jest pewniejszy w decyzjach i aktywniejszy w meczu.' };
    }
    return { label: 'Bardzo wysokie', colorClass: 'text-yellow-400', barClass: 'bg-yellow-400', description: 'Zawodnik jest w świetnym nastawieniu i może grać powyżej bazowej oceny.' };
  },

  getPersonalityLabel: (personality: PlayerMoralePersonality = 'CALM'): string => {
    const labels: Record<PlayerMoralePersonality, string> = {
      PROFESSIONAL: 'Profesjonalista',
      AMBITIOUS: 'Ambitny',
      SENSITIVE: 'Wrażliwy',
      CONFIDENT: 'Pewny siebie',
      NERVOUS: 'Nerwowy',
      LOYAL: 'Lojalny',
      EGOIST: 'Egoista',
      CALM: 'Spokojny',
    };
    return labels[personality];
  },

  canTalk: (player: Player, currentDate: Date): boolean => {
    if (!player.lastIndividualTalkDate) return true;
    const last = new Date(player.lastIndividualTalkDate);
    if (Number.isNaN(last.getTime())) return true;
    return dayDiff(last, currentDate) >= 7;
  },

  getNextTalkDate: (player: Player): Date | null => {
    if (!player.lastIndividualTalkDate) return null;
    const last = new Date(player.lastIndividualTalkDate);
    if (Number.isNaN(last.getTime())) return null;
    const next = new Date(last);
    next.setDate(next.getDate() + 7);
    return next;
  },

  calculateTalkResult: (player: Player, talkType: IndividualTalkType, currentDate: Date, seed: number): IndividualTalkResult => {
    const personality = player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player);
    const morale = player.morale ?? PlayerMoraleService.getInitialMorale(player);
    const recentRating = player.stats.ratingHistory?.at(-1) ?? 6.5;
    const rng = seededRng(seed + stableHash(player.id) + currentDate.getTime(), talkType.length);

    let base = 3;
    let successChance = 0.58;

    if (talkType === 'PRAISE') {
      base = recentRating >= 7.2 ? 7 : 3;
      successChance = recentRating >= 7.2 ? 0.78 : 0.45;
      if (personality === 'CONFIDENT' || personality === 'EGOIST') successChance += 0.08;
    }

    if (talkType === 'MOTIVATE') {
      base = 5;
      if (personality === 'AMBITIOUS' || personality === 'CONFIDENT') successChance += 0.12;
      if (personality === 'CALM') successChance += 0.04;
    }

    if (talkType === 'SUPPORT') {
      base = morale < 45 ? 7 : 4;
      successChance = 0.70;
      if (personality === 'SENSITIVE' || personality === 'NERVOUS') successChance += 0.12;
      if (personality === 'EGOIST') successChance -= 0.08;
    }

    if (talkType === 'CRITICIZE') {
      base = recentRating < 6.3 ? 6 : 2;
      successChance = recentRating < 6.3 ? 0.52 : 0.34;
      if (personality === 'PROFESSIONAL' || personality === 'AMBITIOUS') successChance += 0.18;
      if (personality === 'SENSITIVE' || personality === 'NERVOUS') successChance -= 0.22;
      if (personality === 'EGOIST') successChance -= 0.15;
    }

    if (talkType === 'PROMISE_MINUTES') {
      base = player.squadRole === 'KEY_PLAYER' ? 2 : 6;
      successChance = 0.68;
      if (personality === 'AMBITIOUS' || personality === 'EGOIST') successChance += 0.08;
      if (personality === 'LOYAL') successChance -= 0.05;
    }

    if (talkType === 'DEMAND_WORK') {
      base = 4;
      successChance = 0.50;
      if (personality === 'PROFESSIONAL' || personality === 'AMBITIOUS') successChance += 0.18;
      if (personality === 'SENSITIVE') successChance -= 0.16;
    }

    successChance = Math.max(0.12, Math.min(0.88, successChance));
    const isPositive = rng < successChance;
    const swing = 1 + Math.floor(seededRng(seed, talkType.charCodeAt(0)) * 3);
    const backfireRisk =
      0.22
      + (talkType === 'CRITICIZE' || talkType === 'DEMAND_WORK' ? 0.18 : 0)
      + (talkType === 'PROMISE_MINUTES' ? 0.10 : 0)
      + (personality === 'SENSITIVE' || personality === 'NERVOUS' ? 0.18 : 0)
      + (personality === 'EGOIST' ? 0.10 : 0);
    const backfireRoll = seededRng(seed + stableHash(player.id), talkType.charCodeAt(0) + 31);
    const severeBackfire = !isPositive && backfireRoll < Math.min(0.72, backfireRisk);
    const negativeDrop = 10 + base + (swing * 3) + (severeBackfire ? 16 + Math.round(morale * 0.12) : 0);
    const rawMoraleDelta = isPositive ? base + swing : -negativeDrop;
    const rawNewMorale = PlayerMoraleService.clamp(morale + rawMoraleDelta);
    const newMorale = !isPositive && talkType === 'CRITICIZE'
      ? Math.min(rawNewMorale, 39)
      : rawNewMorale;
    const moraleDelta = newMorale - morale;

    const reactionText = getPlayerTalkResponse(talkType, isPositive);

    return { moraleDelta, newMorale, isPositive, reactionText };
  },

  applyTrainingMood: (player: Player, intensity: TrainingIntensity): number => {
    const personality = player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player);
    const fatigue = player.fatigueDebt ?? 0;
    let delta = 0;

    if (intensity === TrainingIntensity.HEAVY) {
      delta = personality === 'PROFESSIONAL' || personality === 'AMBITIOUS' ? 1 : -1;
      if (fatigue > 45) delta -= 2;
      if (player.condition < 65) delta -= 1;
    } else if (intensity === TrainingIntensity.LIGHT) {
      delta = fatigue > 35 || player.condition < 70 ? 2 : 0;
      if (personality === 'AMBITIOUS' && fatigue < 20) delta -= 1;
    }

    return delta;
  },

  getMatchMultiplier: (player: Player): number => {
    const morale = player.morale ?? 50;
    if (morale <= 19) return 0.92;
    if (morale <= 39) return 0.96;
    if (morale <= 59) return 1.00;
    if (morale <= 79) return 1.03;
    return 1.06;
  },

  getEffectiveOverall: (player: Player): number =>
    Math.round(player.overallRating * PlayerMoraleService.getMatchMultiplier(player)),

  applyNaturalDrift: (player: Player): Player => {
    const morale = player.morale ?? PlayerMoraleService.getInitialMorale(player);
    const drift = morale > 60 ? -1 : morale < 40 ? 1 : 0;
    return { ...player, morale: PlayerMoraleService.clamp(morale + drift) };
  },

  getTotalMinutesPlayed: (player: Player): number =>
    (player.stats?.minutesPlayed ?? 0) + ((player.reserveStats?.matches ?? 0) * 90),

  reviewMinutePromise: (player: Player, currentDate: Date): PromiseReviewResult => {
    const withMorale = PlayerMoraleService.ensurePlayerState(player);
    if (!withMorale.promisedMinutesUntil) {
      return { player: withMorale, fulfilled: false, expired: false, moraleDelta: 0 };
    }

    const baseline = withMorale.promisedMinutesBaseline ?? PlayerMoraleService.getTotalMinutesPlayed(withMorale);
    const currentMinutes = PlayerMoraleService.getTotalMinutesPlayed(withMorale);
    const deadline = new Date(withMorale.promisedMinutesUntil);
    const fulfilled = currentMinutes > baseline;
    const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();

    if (fulfilled) {
      const moraleDelta = 3;
      return {
        player: {
          ...withMorale,
          ...PlayerMoraleService.withMoraleChange(withMorale, moraleDelta, 'Obietnica minut spełniona', currentDate),
          promisedMinutesUntil: null,
          promisedMinutesBaseline: null,
          promisedRoleNextMatchFixtureId: null,
        },
        fulfilled: true,
        expired: false,
        moraleDelta,
      };
    }

    if (expired && !isAvailableForMinutesDemand(withMorale)) {
      return {
        player: {
          ...withMorale,
          promisedMinutesUntil: null,
          promisedMinutesBaseline: null,
          promisedRoleNextMatchFixtureId: null,
        },
        fulfilled: false,
        expired: true,
        moraleDelta: 0,
      };
    }

    if (expired) {
      const personality = withMorale.moralePersonality ?? 'CALM';
      const isRoleNextMatchPromise = !!withMorale.promisedRoleNextMatchFixtureId;
      const moraleDelta = isRoleNextMatchPromise
        ? (
            personality === 'LOYAL' || personality === 'CALM'
              ? -8
              : personality === 'AMBITIOUS' || personality === 'EGOIST'
                ? -16
                : -12
          )
        : (
            personality === 'LOYAL' || personality === 'CALM'
              ? -6
              : personality === 'AMBITIOUS' || personality === 'EGOIST'
                ? -12
                : -9
          );
      return {
        player: {
          ...withMorale,
          ...PlayerMoraleService.withMoraleChange(
            withMorale,
            moraleDelta,
            isRoleNextMatchPromise ? 'Niespełniona obietnica gry w następnym meczu' : 'Niespełniona obietnica minut',
            currentDate
          ),
          promisedMinutesUntil: null,
          promisedMinutesBaseline: null,
          promisedRoleNextMatchFixtureId: null,
        },
        fulfilled: false,
        expired: true,
        moraleDelta,
      };
    }

    return { player: withMorale, fulfilled: false, expired: false, moraleDelta: 0 };
  },

  processPeriodicReview: (players: Player[], currentDate: Date): Player[] =>
    players.map(player => {
      const demandReview = PlayerMoraleService.reviewPlayerDemands(player, currentDate);
      const promiseReview = PlayerMoraleService.reviewMinutePromise(demandReview, currentDate);
      const drifted = PlayerMoraleService.applyNaturalDrift(promiseReview.player);
      if ((drifted.morale ?? 50) !== (promiseReview.player.morale ?? 50)) {
        return PlayerMoraleService.withMoraleChange(promiseReview.player, (drifted.morale ?? 50) - (promiseReview.player.morale ?? 50), 'Naturalna stabilizacja morale', currentDate);
      }
      return drifted;
    }),

  processReserveProtestReviews: (
    players: Player[],
    currentDate: Date,
    existingMessages: MailMessage[] = []
  ): MoraleDemandProcessResult => {
    const mails: MailMessage[] = [];
    const dateKey = toDateKey(currentDate);
    const transferDeadline = new Date(currentDate);
    transferDeadline.setDate(transferDeadline.getDate() + 14);
    const transferDeadlineKey = toDateKey(transferDeadline);

    const reviewedPlayers = players.map(player => {
      let withMorale = PlayerMoraleService.ensurePlayerState(player);
      if (!withMorale.reserveProtestUntil) return withMorale;

      const protestDeadline = new Date(withMorale.reserveProtestUntil);
      const expired = !Number.isNaN(protestDeadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(protestDeadline).getTime();
      if (withMorale.isOnTransferList) {
        return {
          ...PlayerMoraleService.withMoraleChange(
            withMorale,
            4,
            'Trener otworzył drogę do transferu po proteście rezerw',
            currentDate
          ),
          reserveProtestUntil: null,
        };
      }

      if (!expired) return withMorale;

      const contractDaysLeft = getContractDaysLeft(withMorale, currentDate);
      if (contractDaysLeft <= 365) {
        return { ...withMorale, reserveProtestUntil: null };
      }

      const personality = withMorale.moralePersonality ?? 'CALM';
      const penalty =
        personality === 'EGOIST' || personality === 'AMBITIOUS' ? -14 :
        personality === 'CONFIDENT' || personality === 'NERVOUS' ? -11 :
        personality === 'LOYAL' || personality === 'PROFESSIONAL' ? -7 :
        -9;
      withMorale = PlayerMoraleService.withMoraleChange(
        withMorale,
        penalty,
        'Zignorowany protest po zesłaniu do rezerw',
        currentDate
      );

      const mailId = `PLAYER_RESERVE_PROTEST_ESCALATION_${withMorale.id}_${dateKey}`;
      const hasDuplicateMail = existingMessages.some(mail => mail.id === mailId) || mails.some(mail => mail.id === mailId);
      if (!hasDuplicateMail) {
        const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
        mails.push({
          id: mailId,
          sender: playerName,
          role: 'Zawodnik',
          subject: `Żądanie po braku reakcji: ${withMorale.lastName}`,
          body: [
            'Trenerze,',
            '',
            'Nie dostałem jasnej odpowiedzi po przesunięciu mnie do rezerw. Odbieram to jako sygnał, że klub nie widzi mnie już realnie w pierwszym zespole.',
            '',
            'W tej sytuacji proszę o wystawienie mnie na listę transferową. Chcę mieć możliwość znalezienia klubu, w którym będę traktowany zgodnie z moim poziomem sportowym.',
            '',
            `Proszę o decyzję do ${transferDeadline.toLocaleDateString('pl-PL')}.`,
            '',
            playerName,
          ].join('\n'),
          date: new Date(currentDate),
          isRead: false,
          type: MailType.STAFF,
          priority: 5,
          metadata: {
            type: 'PLAYER_MORALE_REQUEST',
            playerId: withMorale.id,
            requestType: 'TRANSFER_LIST',
            responseDeadline: transferDeadlineKey,
          },
        });
      }

      return {
        ...withMorale,
        reserveProtestUntil: null,
        transferListDemandUntil: withMorale.transferListDemandUntil ?? transferDeadlineKey,
        lastMoraleDemandDate: dateKey,
      };
    });

    return { players: reviewedPlayers, mails };
  },

  processPlayerDemands: (
    club: Club,
    squad: Player[],
    currentDate: Date,
    existingMessages: MailMessage[] = [],
    fixtures?: Fixture[],
    allClubs: Club[] = []
  ): MoraleDemandProcessResult => {
    if (squad.length === 0 || club.stats.played < 4 || currentDate.getDay() !== 1) {
      return { players: squad.map(PlayerMoraleService.ensurePlayerState), mails: [] };
    }

    const dateKey = toDateKey(currentDate);
    const deadline = new Date(currentDate);
    deadline.setDate(deadline.getDate() + 14);
    const deadlineKey = toDateKey(deadline);
    const sortedByQuality = [...squad].sort((a, b) => b.overallRating - a.overallRating);
    const squadAverage = squad.reduce((sum, player) => sum + player.overallRating, 0) / squad.length;
    const rankById = new Map(sortedByQuality.map((player, index) => [player.id, index + 1]));
    const byPosition = new Map<string, Player[]>();
    squad.forEach(player => {
      byPosition.set(player.position, [...(byPosition.get(player.position) ?? []), player]);
    });
    byPosition.forEach((playersForPosition, position) => {
      byPosition.set(position, [...playersForPosition].sort((a, b) => b.overallRating - a.overallRating));
    });

    const hasRecentMail = (player: Player, requestType: 'MINUTES' | 'ROLE' | 'ROLE_PLAYTIME' | 'TRANSFER_LIST' | 'DEVELOPMENT_EXIT'): boolean =>
      existingMessages.some(mail =>
        mail.metadata?.type === 'PLAYER_MORALE_REQUEST' &&
        mail.metadata.playerId === player.id &&
        mail.metadata.requestType === requestType &&
        new Date(mail.date).getTime() >= currentDate.getTime() - 21 * DAY_MS
      );

    const nextLeagueFixtureDuringDemandWindow = (fixtures ?? [])
      .filter(f =>
        f.status === MatchStatus.SCHEDULED &&
        f.leagueId === club.leagueId &&
        (f.homeTeamId === club.id || f.awayTeamId === club.id) &&
        f.date.getTime() >= currentDate.getTime() &&
        f.date.getTime() <= deadline.getTime()
      )
      .sort((a, b) => fDate(a).getTime() - fDate(b).getTime())[0] ?? null;

    const hasLeagueFixtureDuringDemandWindow = !!nextLeagueFixtureDuringDemandWindow;

    function fDate(fixture: Fixture): Date {
      return fixture.date instanceof Date ? fixture.date : new Date(fixture.date);
    }

    const createdMails: MailMessage[] = [];
    const nextPlayers = squad.map(player => {
      let withMorale = PlayerMoraleService.ensurePlayerState(player);
      const rank = rankById.get(player.id) ?? squad.length;
      const positionRank = (byPosition.get(player.position) ?? []).findIndex(posPlayer => posPlayer.id === player.id) + 1 || 99;
      const totalMinutes = PlayerMoraleService.getTotalMinutesPlayed(withMorale);
      const possibleMinutes = Math.max(1, club.stats.played * 90);
      const minutesShare = totalMinutes / possibleMinutes;
      const personality = withMorale.moralePersonality ?? 'CALM';
      const lastDemand = withMorale.lastMoraleDemandDate ? new Date(withMorale.lastMoraleDemandDate) : null;
      const demandCooldown = lastDemand && !Number.isNaN(lastDemand.getTime()) && dayDiff(lastDemand, currentDate) < 21;
      const isDemandLockedAfterContract = PlayerMoraleService.isMoraleDemandLocked(withMorale, currentDate);
      const hasActiveDemand = PlayerMoraleService.hasActiveMoraleDemand(withMorale);
      const isHealthyEnough = withMorale.health.status === HealthStatus.HEALTHY || ((withMorale.health.injury?.daysRemaining ?? 0) <= 3);
      const hasSportingArgument = withMorale.overallRating >= squadAverage - 1 && (rank <= Math.max(8, Math.ceil(squad.length * 0.35)) || positionRank <= 2);
      const pressureBonus = personality === 'AMBITIOUS' || personality === 'EGOIST' || personality === 'CONFIDENT' ? 1 : 0;
      const ignoresStatusNoise = personality === 'LOYAL' || personality === 'CALM' || personality === 'PROFESSIONAL';
      const contractDaysLeft = getContractDaysLeft(withMorale, currentDate);
      const isContractEndingSoon = contractDaysLeft <= 365;

      const roleExpectation: 'STARTER' | 'KEY_PLAYER' | null =
        rank <= 3 || (positionRank === 1 && withMorale.overallRating >= squadAverage + 3)
          ? 'KEY_PLAYER'
          : rank <= 8 || positionRank <= 2
            ? 'STARTER'
            : null;

      const shouldRequestRole =
        !!roleExpectation &&
        !isSameOrHigherRole(withMorale.squadRole, roleExpectation) &&
        hasSportingArgument &&
        isHealthyEnough &&
        !demandCooldown &&
        !isDemandLockedAfterContract &&
        !hasActiveDemand &&
        !withMorale.transferPendingClubId &&
        hasLeagueFixtureDuringDemandWindow &&
        !hasRecentMail(withMorale, 'ROLE') &&
        (withMorale.morale ?? 50) <= (ignoresStatusNoise ? 34 : 48 + pressureBonus * 6);

      const expectedShare =
        withMorale.squadRole === 'KEY_PLAYER' || roleExpectation === 'KEY_PLAYER'
          ? 0.68
          : withMorale.squadRole === 'STARTER' || roleExpectation === 'STARTER'
            ? 0.48
            : 0.35;
      const minutesMindset = getMinutesDemandMindset(personality);
      const recentRatings = (withMorale.stats.ratingHistory ?? []).slice(-3);
      const recentAverageRating = recentRatings.length > 0
        ? recentRatings.reduce((sum, rating) => sum + rating, 0) / recentRatings.length
        : null;
      const formArgument = recentAverageRating === null
        ? 0
        : recentAverageRating >= 7.2
          ? 12
          : recentAverageRating >= 6.8
            ? 7
            : recentAverageRating < 6.2
              ? -8
              : 0;
      const positionOpportunity = positionRank === 1 ? 20 : positionRank === 2 ? 12 : positionRank === 3 ? 3 : -10;
      const squadOpportunity = rank <= 3 ? 14 : rank <= 8 ? 8 : rank <= Math.ceil(squad.length * 0.5) ? 2 : -8;
      const roleConfidence = withMorale.squadRole === 'KEY_PLAYER' ? 12 : withMorale.squadRole === 'STARTER' ? 7 : 0;
      const moraleUrgency = (withMorale.morale ?? 50) <= 25 ? 14 : (withMorale.morale ?? 50) <= 40 ? 8 : (withMorale.morale ?? 50) <= 55 ? 3 : 0;
      const perceivedReadiness =
        38 +
        Math.round((withMorale.overallRating - squadAverage) * 3) +
        positionOpportunity +
        squadOpportunity +
        roleConfidence +
        formArgument +
        moraleUrgency +
        minutesMindset.selfBeliefBias;
      const minutesGap = expectedShare - minutesShare;
      const hasPerceivedSportingArgument =
        hasSportingArgument ||
        (
          (minutesMindset.approach === 'ASSERTIVE' || minutesMindset.approach === 'BRAZEN') &&
          withMorale.overallRating >= squadAverage - 4 &&
          positionRank <= 3
        );

      const shouldRequestMinutes =
        hasPerceivedSportingArgument &&
        isAvailableForMinutesDemand(withMorale) &&
        !demandCooldown &&
        !isDemandLockedAfterContract &&
        !hasActiveDemand &&
        !withMorale.transferPendingClubId &&
        hasLeagueFixtureDuringDemandWindow &&
        !withMorale.minutesDemandUntil &&
        !hasRecentMail(withMorale, 'MINUTES') &&
        minutesGap >= minutesMindset.minimumMinutesGap &&
        perceivedReadiness >= minutesMindset.readinessThreshold;

      const shouldRequestDevelopmentExit =
        !!withMorale.unresolvedMinutesDemandDate &&
        isAvailableForMinutesDemand(withMorale) &&
        !demandCooldown &&
        !isDemandLockedAfterContract &&
        !hasActiveDemand &&
        !withMorale.isOnTransferList &&
        !withMorale.isAvailableForLoan &&
        !withMorale.loan &&
        !withMorale.transferPendingClubId &&
        !withMorale.developmentExitDemandUntil &&
        !hasRecentMail(withMorale, 'DEVELOPMENT_EXIT') &&
        (
          totalMinutes <= (withMorale.unresolvedMinutesDemandBaseline ?? totalMinutes) ||
          minutesShare < Math.max(0.12, expectedShare * 0.45)
        );

      const prominentRoleWithoutMinutes =
        (withMorale.squadRole === 'KEY_PLAYER' || withMorale.squadRole === 'STARTER') &&
        isAvailableForMinutesDemand(withMorale) &&
        !demandCooldown &&
        !isDemandLockedAfterContract &&
        !hasActiveDemand &&
        !withMorale.transferPendingClubId &&
        hasLeagueFixtureDuringDemandWindow &&
        !hasRecentMail(withMorale, 'ROLE_PLAYTIME') &&
        totalMinutes === 0;

      const isClearlyAboveSquadLevel = withMorale.overallRating >= squadAverage + 7 && rank <= Math.max(3, Math.ceil(squad.length * 0.12));
      const transferAmbitionBias =
        personality === 'EGOIST' ? 12 :
        personality === 'AMBITIOUS' ? 9 :
        personality === 'CONFIDENT' ? 6 :
        personality === 'PROFESSIONAL' ? -2 :
        personality === 'LOYAL' ? -9 :
        personality === 'CALM' ? -6 :
        -3;
      const ageTransferStabilityBias = getAgeTransferStabilityBias(withMorale);
      const eliteLatePrimeMoveBoost =
        withMorale.age >= 26 &&
        withMorale.overallRating >= 85 &&
        club.reputation < 16
          ? 7
          : 0;
      const transferMoodPressure =
        (withMorale.morale ?? 50) <= 24 ? 12 :
        (withMorale.morale ?? 50) <= 39 ? 7 :
        (withMorale.morale ?? 50) <= 54 ? 3 :
        0;
      const transferRandomFactor = Math.floor(seededRng(stableHash(`${withMorale.id}_${dateKey}`), 43) * 13) - 6;
      const hasExcellentForm = recentAverageRating !== null && recentAverageRating >= 7;
      const seasonOutput = getSeasonOutputProfile(withMorale);
      const hasStandoutSeason = hasStandoutSeasonOutput(withMorale, seasonOutput);
      const interestedClubs = (withMorale.interestedClubs ?? [])
        .map(clubId => allClubs.find(candidateClub => candidateClub.id === clubId))
        .filter((candidateClub): candidateClub is Club => !!candidateClub && candidateClub.id !== club.id);
      const highestInterestedClubReputation = interestedClubs.reduce(
        (maxReputation, interestedClub) => Math.max(maxReputation, interestedClub.reputation),
        0
      );
      const highReputationInterestDelta = highestInterestedClubReputation - club.reputation;
      const hasHighReputationInterest = highReputationInterestDelta >= 3;
      const reputationStepUpPressure = Math.max(0, 12 - club.reputation) * 2;
      const wantsHigherReputationMove =
        isClearlyAboveSquadLevel &&
        hasExcellentForm &&
        club.reputation < 12 &&
        reputationStepUpPressure + transferAmbitionBias + ageTransferStabilityBias + eliteLatePrimeMoveBoost + transferRandomFactor >= 13;
      const wantsBreakoutSeasonMove =
        hasStandoutSeason &&
        club.reputation < 14 &&
        (withMorale.overallRating >= squadAverage + 2 || rank <= Math.max(8, Math.ceil(squad.length * 0.35))) &&
        reputationStepUpPressure + transferAmbitionBias + ageTransferStabilityBias + eliteLatePrimeMoveBoost + transferRandomFactor + (hasHighReputationInterest ? 9 : 0) >= 10;
      const wantsHighReputationInterestMove =
        hasHighReputationInterest &&
        (isClearlyAboveSquadLevel || hasStandoutSeason || withMorale.overallRating >= squadAverage + 3) &&
        highReputationInterestDelta * 3 + transferAmbitionBias + ageTransferStabilityBias + eliteLatePrimeMoveBoost + transferRandomFactor >= (personality === 'LOYAL' ? 13 : 9);
      const protectedExitPressure =
        Math.round((withMorale.overallRating - squadAverage) * 2) +
        (rank <= 3 ? 10 : 4) +
        reputationStepUpPressure +
        transferAmbitionBias +
        ageTransferStabilityBias +
        eliteLatePrimeMoveBoost +
        transferMoodPressure +
        transferRandomFactor;
      const wantsProtectedExitConversation = !!withMorale.isUntouchable && protectedExitPressure >= 22;
      const boardSupportsProtectedExit =
        wantsProtectedExitConversation &&
        (wantsHigherReputationMove || wantsBreakoutSeasonMove || wantsHighReputationInterestMove) &&
        shouldBoardSupportProtectedExit(withMorale, club, squadAverage, transferRandomFactor);
      const protectedExitPrice = boardSupportsProtectedExit
        ? estimateProtectedExitPrice(withMorale, club, squadAverage)
        : undefined;
      const transferListMoraleThreshold =
        personality === 'LOYAL' ? 28 :
        personality === 'PROFESSIONAL' ? 34 :
        44 + pressureBonus * 6;
      const wantsExitBecauseUnhappy =
        (withMorale.morale ?? 50) <= transferListMoraleThreshold &&
        (
          personality !== 'LOYAL' ||
          (withMorale.morale ?? 50) <= 24 ||
          transferMoodPressure + transferRandomFactor >= 10
        );
      const shouldRequestTransferList =
        (isClearlyAboveSquadLevel || wantsExitBecauseUnhappy || wantsBreakoutSeasonMove || wantsHighReputationInterestMove) &&
        isHealthyEnough &&
        !demandCooldown &&
        !isDemandLockedAfterContract &&
        !hasActiveDemand &&
        !isContractEndingSoon &&
        !withMorale.isOnTransferList &&
        !withMorale.transferPendingClubId &&
        !withMorale.transferListDemandUntil &&
        !hasRecentMail(withMorale, 'TRANSFER_LIST') &&
        (
          wantsProtectedExitConversation ||
          wantsHigherReputationMove ||
          wantsBreakoutSeasonMove ||
          wantsHighReputationInterestMove ||
          wantsExitBecauseUnhappy
        );

      if (createdMails.length >= 2) return withMorale;

      if (prominentRoleWithoutMinutes) {
        const mailId = `PLAYER_ROLE_PLAYTIME_REQUEST_${withMorale.id}_${dateKey}`;
        const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
        const currentRoleLabel = roleLabel(withMorale.squadRole);
        createdMails.push({
          id: mailId,
          sender: playerName,
          role: 'Zawodnik',
          subject: `ZAWODNIK ${playerName} prosi o rozmowę w sprawie jego roli w zespole`,
          body: [
            'Trenerze,',
            '',
            `Chciałbym porozmawiać o mojej roli w zespole. Jestem oznaczony jako ${currentRoleLabel}, jestem zdrowy i gotowy do gry, ale mimo to nie dostaję minut.`,
            '',
            'Potrzebuję jasnej informacji, czy nadal widzi mnie Pan w tej roli. Chcę grać więcej i pokazać na boisku, że mogę pomóc drużynie.',
            '',
            'Nie chcę robić konfliktu, ale ta sytuacja zaczyna wpływać na moje nastawienie.',
            '',
            playerName,
          ].join('\n'),
          date: new Date(currentDate),
          isRead: false,
          type: MailType.STAFF,
          priority: withMorale.squadRole === 'KEY_PLAYER' ? 5 : 4,
          metadata: {
            type: 'PLAYER_MORALE_REQUEST',
            playerId: withMorale.id,
            requestType: 'ROLE_PLAYTIME',
            requestedRole: withMorale.squadRole,
            nextFixtureId: nextLeagueFixtureDuringDemandWindow?.id,
            responseDeadline: deadlineKey,
          },
        });
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, -2, 'Ważny zawodnik prosi o rozmowę po braku minut', currentDate);
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          minutesDemandUntil: deadlineKey,
          minutesDemandBaseline: totalMinutes,
        };
      }

      if (shouldRequestDevelopmentExit) {
        const mailId = `PLAYER_DEVELOPMENT_EXIT_REQUEST_${withMorale.id}_${dateKey}`;
        const demandCopy = getDevelopmentExitDemandCopy(withMorale, personality, totalMinutes);
        createdMails.push({
          id: mailId,
          sender: `${withMorale.firstName} ${withMorale.lastName}`,
          role: 'Zawodnik',
          subject: demandCopy.subject,
          body: demandCopy.body,
          date: new Date(currentDate),
          isRead: false,
          type: MailType.STAFF,
          priority: demandCopy.priority,
          metadata: {
            type: 'PLAYER_MORALE_REQUEST',
            playerId: withMorale.id,
            requestType: 'DEVELOPMENT_EXIT',
            responseDeadline: deadlineKey,
          },
        });
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, demandCopy.moraleDrop, 'Brak minut eskaluje do prośby o odejście lub wypożyczenie', currentDate);
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          unresolvedMinutesDemandDate: null,
          unresolvedMinutesDemandBaseline: null,
          developmentExitDemandUntil: deadlineKey,
          developmentExitDemandBaseline: totalMinutes,
        };
      }

      if (shouldRequestTransferList) {
        const mailId = `PLAYER_TRANSFER_LIST_REQUEST_${withMorale.id}_${dateKey}`;
        const transferDemandTrigger =
          wantsHighReputationInterestMove ? 'STRONG_INTEREST' :
          wantsBreakoutSeasonMove ? 'STANDOUT_SEASON' :
          wantsHigherReputationMove ? 'HIGHER_REPUTATION' :
          'DEFAULT';
        const demandCopy = getTransferListDemandCopy(
          withMorale,
          personality,
          transferDemandTrigger,
          hasStandoutSeason ? formatSeasonOutputSummary(seasonOutput) : undefined
        );
        createdMails.push({
          id: mailId,
          sender: `${withMorale.firstName} ${withMorale.lastName}`,
          role: 'Zawodnik',
          subject: demandCopy.subject,
          body: demandCopy.body,
          date: new Date(currentDate),
          isRead: false,
          type: MailType.STAFF,
          priority: 4,
          metadata: {
            type: 'PLAYER_MORALE_REQUEST',
            playerId: withMorale.id,
            requestType: 'TRANSFER_LIST',
            responseDeadline: deadlineKey,
          },
        });
        if (boardSupportsProtectedExit && protectedExitPrice && createdMails.length < 2) {
          createdMails.push({
            id: `BOARD_PROTECTED_EXIT_SUPPORT_${withMorale.id}_${dateKey}`,
            sender: 'Zarząd Klubu',
            role: 'Zarząd',
            subject: `Zarząd jest gotów rozważyć sprzedaż: ${withMorale.lastName}`,
            body: [
              'Trenerze,',
              '',
              `${withMorale.firstName} ${withMorale.lastName} zgłosił sprzeciw wobec statusu „nie na sprzedaż” i uważa, że jest gotowy na grę w klubie o wyższej reputacji.`,
              '',
              `Po analizie sytuacji zarząd uważa, że przy odpowiednio wysokiej ofercie sprzedaż może być korzystna dla klubu. Dlatego zdejmujemy status „nie na sprzedaż” i dopuszczamy rozmowy od kwoty około ${protectedExitPrice.toLocaleString('pl-PL')} PLN.`,
              '',
              'To nie oznacza zgody na dowolną ofertę, ale chcemy zostawić klubowi realną drogę do dobrej transakcji i jednocześnie ograniczyć konflikt z zawodnikiem.',
            ].join('\n'),
            date: new Date(currentDate),
            isRead: false,
            type: MailType.BOARD,
            priority: 5,
          });
        }
        withMorale = PlayerMoraleService.withMoraleChange(
          withMorale,
          boardSupportsProtectedExit ? 1 : -3,
          boardSupportsProtectedExit
            ? 'Zarząd otwiera drogę do sprzedaży po sprzeciwie zawodnika'
            : 'Zawodnik prosi o wystawienie na listę transferową',
          currentDate
        );
        if (boardSupportsProtectedExit && protectedExitPrice) {
          return {
            ...withMorale,
            lastMoraleDemandDate: dateKey,
            transferListDemandUntil: null,
            isUntouchable: false,
            isOnTransferList: true,
            transferListPrice: protectedExitPrice,
            squadRole: null,
            isAvailableForLoan: false,
          };
        }
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          transferListDemandUntil: deadlineKey,
        };
      }

      if (shouldRequestRole && roleExpectation) {
        const mailId = `PLAYER_ROLE_REQUEST_${withMorale.id}_${dateKey}`;
        createdMails.push({
          id: mailId,
          sender: `${withMorale.firstName} ${withMorale.lastName}`,
          role: 'Zawodnik',
          subject: `Rozmowa o statusie: ${withMorale.lastName}`,
          body: `Trenerze,\n\nChciałbym porozmawiać o mojej roli w drużynie. Patrząc na moją pozycję w kadrze i poziom sportowy, uważam, że powinienem mieć status: ${roleLabel(roleExpectation)}.\n\nNie chodzi mi o konflikt, ale o jasny sygnał, że klub widzi mnie zgodnie z moją wartością dla zespołu. Jeśli sytuacja się nie zmieni, trudno będzie mi utrzymać pełne zaangażowanie.\n\n${withMorale.firstName} ${withMorale.lastName}`,
          date: new Date(currentDate),
          isRead: false,
          type: MailType.STAFF,
          priority: roleExpectation === 'KEY_PLAYER' ? 4 : 3,
          metadata: {
            type: 'PLAYER_MORALE_REQUEST',
            playerId: withMorale.id,
            requestType: 'ROLE',
            requestedRole: roleExpectation,
            responseDeadline: deadlineKey,
          },
        });
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, -2, `Zawodnik domaga się statusu: ${roleLabel(roleExpectation)}`, currentDate);
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          roleDemandUntil: deadlineKey,
          requestedSquadRole: roleExpectation,
        };
      }

      if (shouldRequestMinutes) {
        const mailId = `PLAYER_MINUTES_REQUEST_${withMorale.id}_${dateKey}`;
        const demandCopy = getMinutesDemandCopy(withMorale, minutesMindset.approach, recentAverageRating);
        createdMails.push({
          id: mailId,
          sender: `${withMorale.firstName} ${withMorale.lastName}`,
          role: 'Zawodnik',
          subject: demandCopy.subject,
          body: demandCopy.body,
          date: new Date(currentDate),
          isRead: false,
          type: MailType.STAFF,
          priority: minutesMindset.priority,
          metadata: {
            type: 'PLAYER_MORALE_REQUEST',
            playerId: withMorale.id,
            requestType: 'MINUTES',
            responseDeadline: deadlineKey,
          },
        });
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, minutesMindset.moraleDrop, 'Zawodnik domaga się większej liczby występów', currentDate);
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          minutesDemandUntil: deadlineKey,
          minutesDemandBaseline: totalMinutes,
        };
      }

      return withMorale;
    });

    return { players: nextPlayers, mails: createdMails };
  },

  reviewPlayerDemands: (player: Player, currentDate: Date): Player => {
    let withMorale = PlayerMoraleService.ensurePlayerState(player);

    if (withMorale.transferListDemandUntil) {
      const deadline = new Date(withMorale.transferListDemandUntil);
      const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
      if (withMorale.isOnTransferList) {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, 8, 'Trener zgodził się na listę transferową', currentDate),
          transferListDemandUntil: null,
        };
      } else if (expired) {
        const personality = withMorale.moralePersonality ?? 'CALM';
        const penalty = personality === 'LOYAL' || personality === 'PROFESSIONAL' ? -8 : personality === 'EGOIST' || personality === 'AMBITIOUS' ? -16 : -12;
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, penalty, 'Odrzucona prośba o listę transferową', currentDate),
          transferListDemandUntil: null,
        };
      }
    }

    if (withMorale.minutesDemandUntil) {
      const deadline = new Date(withMorale.minutesDemandUntil);
      const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
      const baseline = withMorale.minutesDemandBaseline ?? PlayerMoraleService.getTotalMinutesPlayed(withMorale);
      const hasPlayed = PlayerMoraleService.getTotalMinutesPlayed(withMorale) > baseline;
      if (hasPlayed) {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, 4, 'Dostał szansę po prośbie o minuty', currentDate),
          minutesDemandUntil: null,
          minutesDemandBaseline: null,
          unresolvedMinutesDemandDate: null,
          unresolvedMinutesDemandBaseline: null,
        };
      } else if (expired && !isAvailableForMinutesDemand(withMorale)) {
        withMorale = {
          ...withMorale,
          minutesDemandUntil: null,
          minutesDemandBaseline: null,
        };
      } else if (expired) {
        const personality = withMorale.moralePersonality ?? 'CALM';
        const penalty = personality === 'LOYAL' || personality === 'CALM' ? -6 : personality === 'EGOIST' || personality === 'AMBITIOUS' ? -12 : -9;
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, penalty, 'Zignorowana prośba o więcej występów', currentDate),
          minutesDemandUntil: null,
          minutesDemandBaseline: null,
          unresolvedMinutesDemandDate: toDateKey(currentDate),
          unresolvedMinutesDemandBaseline: PlayerMoraleService.getTotalMinutesPlayed(withMorale),
        };
      }
    }

    if (withMorale.developmentExitDemandUntil) {
      const deadline = new Date(withMorale.developmentExitDemandUntil);
      const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
      const fulfilled = !!withMorale.isOnTransferList || !!withMorale.isAvailableForLoan || !!withMorale.loan;
      if (fulfilled) {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, 6, 'Klub zgodził się na transfer lub wypożyczenie po braku minut', currentDate),
          developmentExitDemandUntil: null,
          developmentExitDemandBaseline: null,
          unresolvedMinutesDemandDate: null,
          unresolvedMinutesDemandBaseline: null,
        };
      } else if (expired) {
        const personality = withMorale.moralePersonality ?? 'CALM';
        const penalty =
          personality === 'LOYAL' || personality === 'PROFESSIONAL' ? -10 :
          personality === 'EGOIST' || personality === 'AMBITIOUS' ? -18 :
          -14;
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, penalty, 'Zignorowana prośba o odejście lub wypożyczenie po braku minut', currentDate),
          developmentExitDemandUntil: null,
          developmentExitDemandBaseline: null,
          unresolvedMinutesDemandDate: null,
          unresolvedMinutesDemandBaseline: null,
        };
      }
    }

    if (withMorale.roleDemandUntil && withMorale.requestedSquadRole) {
      const deadline = new Date(withMorale.roleDemandUntil);
      const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
      const fulfilled = isSameOrHigherRole(withMorale.squadRole, withMorale.requestedSquadRole);
      if (fulfilled) {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, withMorale.requestedSquadRole === 'KEY_PLAYER' ? 6 : 4, 'Otrzymał oczekiwany status w drużynie', currentDate),
          roleDemandUntil: null,
          requestedSquadRole: null,
        };
      } else if (expired) {
        const personality = withMorale.moralePersonality ?? 'CALM';
        const penalty = personality === 'PROFESSIONAL' || personality === 'LOYAL' ? -5 : personality === 'EGOIST' || personality === 'AMBITIOUS' ? -13 : -9;
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, penalty, 'Zignorowana prośba o wyższy status', currentDate),
          roleDemandUntil: null,
          requestedSquadRole: null,
        };
      }
    }

    return withMorale;
  },
};
