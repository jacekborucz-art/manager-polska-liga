import { Club, Fixture, HealthStatus, IndividualTalkType, MailMessage, MailType, MatchStatus, Player, PlayerMoralePersonality, TrainingIntensity } from '../types';

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

const getTransferListDemandCopy = (
  player: Player,
  personality: PlayerMoralePersonality,
  seeksHigherReputation: boolean
): { subject: string; body: string } => {
  if (seeksHigherReputation) {
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

  ensurePlayerState: (player: Player): Player => ({
    ...player,
    morale: player.morale ?? PlayerMoraleService.getInitialMorale(player),
    moralePersonality: player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player),
    moraleHistory: player.moraleHistory ?? [],
    lastIndividualTalkDate: player.lastIndividualTalkDate ?? null,
    promisedMinutesBaseline: player.promisedMinutesBaseline ?? null,
    lastMoraleDemandDate: player.lastMoraleDemandDate ?? null,
    minutesDemandUntil: player.minutesDemandUntil ?? null,
    minutesDemandBaseline: player.minutesDemandBaseline ?? null,
    roleDemandUntil: player.roleDemandUntil ?? null,
    requestedSquadRole: player.requestedSquadRole ?? null,
    transferListDemandUntil: player.transferListDemandUntil ?? null,
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
    !!player.minutesDemandUntil || !!player.roleDemandUntil || !!player.transferListDemandUntil,

  applyContractSigningMindflowReset: (player: Player, currentDate: Date): Player => ({
    ...player,
    moraleDemandLockoutUntil: PlayerMoraleService.getMoraleDemandLockoutUntil(currentDate),
    lastMoraleDemandDate: null,
    minutesDemandUntil: null,
    minutesDemandBaseline: null,
    roleDemandUntil: null,
    requestedSquadRole: null,
    transferListDemandUntil: null,
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

    return {
      ...withMorale,
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
        },
        fulfilled: true,
        expired: false,
        moraleDelta,
      };
    }

    if (expired) {
      const personality = withMorale.moralePersonality ?? 'CALM';
      const moraleDelta = personality === 'LOYAL' || personality === 'CALM'
        ? -6
        : personality === 'AMBITIOUS' || personality === 'EGOIST'
          ? -12
          : -9;
      return {
        player: {
          ...withMorale,
          ...PlayerMoraleService.withMoraleChange(withMorale, moraleDelta, 'Niespełniona obietnica minut', currentDate),
          promisedMinutesUntil: null,
          promisedMinutesBaseline: null,
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

  processPlayerDemands: (
    club: Club,
    squad: Player[],
    currentDate: Date,
    existingMessages: MailMessage[] = [],
    fixtures?: Fixture[]
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

    const hasRecentMail = (player: Player, requestType: 'MINUTES' | 'ROLE' | 'TRANSFER_LIST'): boolean =>
      existingMessages.some(mail =>
        mail.metadata?.type === 'PLAYER_MORALE_REQUEST' &&
        mail.metadata.playerId === player.id &&
        mail.metadata.requestType === requestType &&
        new Date(mail.date).getTime() >= currentDate.getTime() - 21 * DAY_MS
      );

    const hasLeagueFixtureDuringDemandWindow = (fixtures ?? []).some(f =>
      f.status === MatchStatus.SCHEDULED &&
      f.leagueId === club.leagueId &&
      (f.homeTeamId === club.id || f.awayTeamId === club.id) &&
      f.date.getTime() >= currentDate.getTime() &&
      f.date.getTime() <= deadline.getTime()
    );

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
        isHealthyEnough &&
        !demandCooldown &&
        !isDemandLockedAfterContract &&
        !hasActiveDemand &&
        !withMorale.transferPendingClubId &&
        hasLeagueFixtureDuringDemandWindow &&
        !withMorale.minutesDemandUntil &&
        !hasRecentMail(withMorale, 'MINUTES') &&
        minutesGap >= minutesMindset.minimumMinutesGap &&
        perceivedReadiness >= minutesMindset.readinessThreshold;

      const isClearlyAboveSquadLevel = withMorale.overallRating >= squadAverage + 7 && rank <= Math.max(3, Math.ceil(squad.length * 0.12));
      const transferAmbitionBias =
        personality === 'EGOIST' ? 12 :
        personality === 'AMBITIOUS' ? 9 :
        personality === 'CONFIDENT' ? 6 :
        personality === 'PROFESSIONAL' ? -2 :
        personality === 'LOYAL' ? -9 :
        personality === 'CALM' ? -6 :
        -3;
      const transferMoodPressure =
        (withMorale.morale ?? 50) <= 24 ? 12 :
        (withMorale.morale ?? 50) <= 39 ? 7 :
        (withMorale.morale ?? 50) <= 54 ? 3 :
        0;
      const transferRandomFactor = Math.floor(seededRng(stableHash(`${withMorale.id}_${dateKey}`), 43) * 13) - 6;
      const hasExcellentForm = recentAverageRating !== null && recentAverageRating >= 7;
      const reputationStepUpPressure = Math.max(0, 12 - club.reputation) * 2;
      const wantsHigherReputationMove =
        isClearlyAboveSquadLevel &&
        hasExcellentForm &&
        club.reputation < 12 &&
        reputationStepUpPressure + transferAmbitionBias + transferRandomFactor >= 13;
      const protectedExitPressure =
        Math.round((withMorale.overallRating - squadAverage) * 2) +
        (rank <= 3 ? 10 : 4) +
        reputationStepUpPressure +
        transferAmbitionBias +
        transferMoodPressure +
        transferRandomFactor;
      const wantsProtectedExitConversation = !!withMorale.isUntouchable && protectedExitPressure >= 22;
      const shouldRequestTransferList =
        isClearlyAboveSquadLevel &&
        isHealthyEnough &&
        !demandCooldown &&
        !isDemandLockedAfterContract &&
        !hasActiveDemand &&
        !withMorale.isOnTransferList &&
        !withMorale.transferPendingClubId &&
        !withMorale.transferListDemandUntil &&
        !hasRecentMail(withMorale, 'TRANSFER_LIST') &&
        (
          wantsProtectedExitConversation ||
          wantsHigherReputationMove ||
          (withMorale.morale ?? 50) <= (personality === 'LOYAL' ? 28 : personality === 'PROFESSIONAL' ? 34 : 44 + pressureBonus * 6)
        );

      if (createdMails.length >= 2) return withMorale;

      if (shouldRequestTransferList) {
        const mailId = `PLAYER_TRANSFER_LIST_REQUEST_${withMorale.id}_${dateKey}`;
        const demandCopy = getTransferListDemandCopy(withMorale, personality, wantsHigherReputationMove);
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
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, -3, 'Zawodnik prosi o wystawienie na listę transferową', currentDate);
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
        };
      } else if (expired) {
        const personality = withMorale.moralePersonality ?? 'CALM';
        const penalty = personality === 'LOYAL' || personality === 'CALM' ? -6 : personality === 'EGOIST' || personality === 'AMBITIOUS' ? -12 : -9;
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, penalty, 'Zignorowana prośba o więcej występów', currentDate),
          minutesDemandUntil: null,
          minutesDemandBaseline: null,
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
