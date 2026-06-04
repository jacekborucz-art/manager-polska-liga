import { TalkType, ScoreContext, HALFTIME_TALKS, FRIENDLY_HALFTIME_TALKS, TalkOption } from '../data/halftime_talks_pl';
import type { Player } from '../types';

export type { TalkType, ScoreContext };

export interface TalkEffect {
  momentumDelta: number;
  tempoResponseFactor: number;
  mindsetResponseFactor: number;
  intensityResponseFactor: number;
  fatigueRegenBonus: number;
  reactionText: string;
}

// ─── TEKSTY REAKCJI (ukryte przed graczem jaki jest efekt) ───────────────────
const REACTION_TEXTS: Record<TalkType, string[]> = {
  CALM: [
    'Zawodnicy spokojnie kiwają głowami.',
    'W szatni zapada cisza. Każdy skupia się na taktyce.',
    'Drużyna wygląda na skupioną.',
    'Kilku zawodników wymienia spojrzenia. Zrozumieli.',
  ],
  AGGRESSIVE: [
    'Szatnia wydaje się mocno zmotywowana.',
    'Słychać okrzyki. Kilku graczy wstaje z ławki.',
    'Napięcie w szatni sięga zenitu.',
    'Zawodnicy wychodzą z szatni w bojowym nastroju.',
  ],
  PRAISE: [
    'Widać zadowolenie na twarzach zawodników.',
    'Kilku graczy uśmiecha się. Atmosfera jest dobra.',
    'Zawodnicy wygladają na pewnych siebie. ',
    'W szatni daje się wyczuć pozytywną atmosferę.',
  ],
  CRITICIZE: [
    'Szatnia milczy. Niektórzy wbijają wzrok w podłogę.',
    'Kilku zawodników wymienia spojrzenia. Widać napięcie.',
    'Atmosfera jest gęsta. Każdy wie, że musi dać więcej.',
    'Jeden z liderów wstaje i zaczyna mówić do reszty.',
  ],
  SILENCE: [
    'Cisza w szatni. Każdy z własną myślą.',
    'Nikt nic nie mówi. Minuty przerwy mijają w skupieniu.',
    'Zawodnicy patrzą po sobie. Brak słów mówi wszystko.',
    'Szatnia odpoczynek w milczeniu. Nikt nie odzywa.',
  ],
  FRIENDLY_SAFE: [
    'Starszyzna drużyny przyjmuje to ze spokojem. Młodsi zawodnicy wyglądają na trochę przygaszonych.',
    'Zmęczeni gracze wyraźnie łapią oddech, ale kilku ambitnych piłkarzy chce grać ostrzej.',
    'Szatnia rozumie, że zdrowie jest ważniejsze od wyniku.',
    'Część zawodników zwalnia tempo w głowie, reszta skupia się na prostszej grze.',
  ],
  FRIENDLY_COMPETE: [
    'Młodsi zawodnicy prostują plecy. Kilku rezerwowych wygląda, jakby właśnie dostało swoją szansę.',
    'W szatni robi się głośniej. Ambitni gracze chcą udowodnić, że zasługują na skład.',
    'Piłkarze o mocnym charakterze reagują natychmiast, ale zmęczeni wyglądają mniej pewnie.',
    'Rywalizacja o miejsce w składzie wyraźnie podkręca atmosferę.',
  ],
  FRIENDLY_EXPERIMENT: [
    'Kreatywni zawodnicy zaczynają żywo dyskutować o rozwiązaniach z treningu.',
    'Młodsi gracze słuchają uważnie. Liderzy pilnują, żeby pomysł nie zmienił się w chaos.',
    'Szatnia wygląda na gotową do testowania nowych wariantów.',
    'Kilku piłkarzy kiwa głową, jakby dokładnie czekało na taki sygnał.',
  ],
  FRIENDLY_DISCIPLINE: [
    'Liderzy biorą odpowiedzialność za ustawienie zespołu.',
    'Szatnia uspokaja się. Zawodnicy skupiają się na organizacji i prostych decyzjach.',
    'Piłkarze o wysokiej mentalności reagują najlepiej. Reszta szybko łapie rytm.',
    'Widać mniej emocji, ale więcej koncentracji.',
  ],
};

// ─── WYZNACZENIE KONTEKSTU WYNIKU ─────────────────────────────────────────────
export const getScoreContext = (userScore: number, oppScore: number): ScoreContext => {
  const diff = userScore - oppScore;
  const total = userScore + oppScore;
  if (diff === 0) return total <= 1 ? 'DRAW_LOW' : 'DRAW_HIGH';
  if (diff === 1) return 'WINNING_ONE';
  if (diff >= 2) return 'WINNING_HIGH';
  if (diff === -1) return 'LOSING_ONE';
  return 'LOSING_HIGH';
};

// ─── POBRANIE OPCJI DLA KONTEKSTU ────────────────────────────────────────────
export const getTalksForContext = (context: ScoreContext): TalkOption[] => {
  return HALFTIME_TALKS[context];
};

export const getFriendlyTalksForContext = (_context: ScoreContext): TalkOption[] => {
  return FRIENDLY_HALFTIME_TALKS;
};

// ─── SEEDED RNG ──────────────────────────────────────────────────────────────
const seededRng = (seed: number, offset: number): number => {
  const s = seed + offset;
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const avg = (values: number[], fallback: number): number => {
  if (values.length === 0) return fallback;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

// ─── SPARING: PROFIL SZATNI I WPŁYW NA DRUGĄ POŁOWĘ ─────────────────────────
export const calculateFriendlyTalkEffect = (
  talkType: TalkType,
  context: ScoreContext,
  momentumEndOf1st: number,
  avgFatigue: number,
  userShots: number,
  seed: number,
  optionIndex: number,
  playersOnPitch: Player[] = []
): TalkEffect => {
  if (talkType === 'SILENCE') {
    return calculateTalkEffect(talkType, context, momentumEndOf1st, avgFatigue, userShots, seed, optionIndex);
  }

  const rng1 = seededRng(seed, optionIndex + 31);
  const rng2 = seededRng(seed, optionIndex + 32);
  const rng3 = seededRng(seed, optionIndex + 33);

  const moraleValues = playersOnPitch.map(player => player.morale ?? 55);
  const leadershipValues = playersOnPitch.map(player => player.attributes.leadership);
  const mentalityValues = playersOnPitch.map(player => player.attributes.mentality);
  const workRateValues = playersOnPitch.map(player => player.attributes.workRate);
  const aggressionValues = playersOnPitch.map(player => player.attributes.aggression);
  const overallValues = playersOnPitch.map(player => player.overallRating);

  const avgMorale = avg(moraleValues, 55);
  const avgLeadership = avg(leadershipValues, 50);
  const avgMentality = avg(mentalityValues, 50);
  const avgWorkRate = avg(workRateValues, 50);
  const avgAggression = avg(aggressionValues, 50);
  const avgOverall = avg(overallValues, 50);

  const youngShare = playersOnPitch.length > 0
    ? playersOnPitch.filter(player => player.age <= 22).length / playersOnPitch.length
    : 0.25;
  const veteranShare = playersOnPitch.length > 0
    ? playersOnPitch.filter(player => player.age >= 30).length / playersOnPitch.length
    : 0.20;
  const tiredFactor = clamp((60 - avgFatigue) / 35, 0, 1);
  const moraleFactor = clamp((avgMorale - 50) / 35, -1, 1);
  const leadershipFactor = clamp((avgLeadership - 50) / 40, -1, 1);
  const mentalityFactor = clamp((avgMentality - 50) / 40, -1, 1);
  const workRateFactor = clamp((avgWorkRate - 50) / 40, -1, 1);
  const aggressionFactor = clamp((avgAggression - 50) / 40, -1, 1);
  const qualityFactor = clamp((avgOverall - 55) / 35, -1, 1);
  const scorePressure =
    context === 'LOSING_HIGH' ? 0.75
    : context === 'LOSING_ONE' ? 0.45
    : context === 'WINNING_HIGH' ? -0.35
    : context === 'WINNING_ONE' ? -0.15
    : 0;

  let momentumDelta = 0;
  let tempoRF = 1;
  let mindsetRF = 1;
  let intensityRF = 1;
  let regenBonus = 0;

  if (talkType === 'FRIENDLY_SAFE') {
    const fit = 0.35 + tiredFactor * 0.75 + veteranShare * 0.35 + leadershipFactor * 0.20 - youngShare * 0.25 - scorePressure * 0.20;
    momentumDelta = 1.5 + fit * 5 - youngShare * 3 + (rng1 - 0.5) * 3;
    tempoRF = 0.88 - tiredFactor * 0.04;
    mindsetRF = 1.02 + leadershipFactor * 0.04;
    intensityRF = 0.86 - tiredFactor * 0.03;
    regenBonus = 2.5 + tiredFactor * 2.5;
  } else if (talkType === 'FRIENDLY_COMPETE') {
    const fit = 0.25 + youngShare * 0.55 + workRateFactor * 0.45 + moraleFactor * 0.25 + aggressionFactor * 0.20 - tiredFactor * 0.60;
    momentumDelta = 3 + fit * 9 + scorePressure * 3 + (rng1 - 0.5) * 5;
    tempoRF = 1.07 + workRateFactor * 0.05;
    mindsetRF = 1.04 + moraleFactor * 0.05;
    intensityRF = 1.14 + aggressionFactor * 0.05;
    regenBonus = -1.2 - tiredFactor * 1.8;
  } else if (talkType === 'FRIENDLY_EXPERIMENT') {
    const fit = 0.20 + mentalityFactor * 0.45 + qualityFactor * 0.25 + youngShare * 0.25 - tiredFactor * 0.15;
    momentumDelta = 2 + fit * 7 + (userShots >= 4 ? 1.5 : 0) + (rng1 - 0.5) * 4;
    tempoRF = 1.05 + mentalityFactor * 0.04;
    mindsetRF = 1.10 + qualityFactor * 0.04;
    intensityRF = 0.99 + workRateFactor * 0.04;
    regenBonus = 0.4;
  } else if (talkType === 'FRIENDLY_DISCIPLINE') {
    const fit = 0.30 + leadershipFactor * 0.55 + mentalityFactor * 0.45 + veteranShare * 0.20 - aggressionFactor * 0.15;
    momentumDelta = 2.5 + fit * 6 - Math.max(0, momentumEndOf1st) * 0.03 + (rng1 - 0.5) * 3;
    tempoRF = 0.96;
    mindsetRF = 1.12 + leadershipFactor * 0.05;
    intensityRF = 0.97 + mentalityFactor * 0.04;
    regenBonus = 1.0 + tiredFactor;
  }

  const rfNoise = (rng2 - 0.5) * 0.06;
  const reactions = REACTION_TEXTS[talkType] ?? REACTION_TEXTS.SILENCE;

  return {
    momentumDelta: Math.round(clamp(momentumDelta, -10, 18) * 10) / 10,
    tempoResponseFactor: parseFloat(clamp(tempoRF + rfNoise, 0.78, 1.20).toFixed(2)),
    mindsetResponseFactor: parseFloat(clamp(mindsetRF + rfNoise * 0.7, 0.82, 1.22).toFixed(2)),
    intensityResponseFactor: parseFloat(clamp(intensityRF + rfNoise * 0.8, 0.78, 1.22).toFixed(2)),
    fatigueRegenBonus: Math.round(regenBonus * 10) / 10,
    reactionText: reactions[Math.floor(rng3 * reactions.length)],
  };
};

// ─── GŁÓWNA KALKULACJA — 7 WĄTKÓW PSYCHOLOGII ────────────────────────────────
export const calculateTalkEffect = (
  talkType: TalkType,
  context: ScoreContext,
  momentumEndOf1st: number,
  avgFatigue: number,
  userShots: number,
  seed: number,
  optionIndex: number
): TalkEffect => {

  const rng1 = seededRng(seed, optionIndex + 1);
  const rng2 = seededRng(seed, optionIndex + 2);
  const rng3 = seededRng(seed, optionIndex + 3);
  const rng4 = seededRng(seed, optionIndex + 4);

  // ── Wątek 1: Trafność kontekstowa ─────────────────────────────────────────
  // Czy typ rozmowy pasuje do sytuacji? (+1.0 = idealne, -1.0 = błąd)
  const getContextFit = (): number => {
    if (talkType === 'CALM') {
      if (context === 'WINNING_HIGH') return 1.0;
      if (context === 'WINNING_ONE') return 0.7;
      if (context === 'DRAW_LOW') return 0.6;
      if (context === 'DRAW_HIGH') return 0.3;
      if (context === 'LOSING_ONE') return 0.1;
      if (context === 'LOSING_HIGH') return -0.7;
    }
    if (talkType === 'AGGRESSIVE') {
      if (context === 'LOSING_HIGH') return 1.0;
      if (context === 'LOSING_ONE') return 0.8;
      if (context === 'DRAW_LOW') return 0.5;
      if (context === 'DRAW_HIGH') return 0.4;
      if (context === 'WINNING_ONE') return -0.2;
      if (context === 'WINNING_HIGH') return -0.5;
    }
    if (talkType === 'PRAISE') {
      if (context === 'WINNING_HIGH') return 0.9;
      if (context === 'WINNING_ONE') return 0.8;
      if (context === 'DRAW_HIGH') return 0.5;
      if (context === 'DRAW_LOW') return 0.3;
      if (context === 'LOSING_ONE') return 0.1;
      if (context === 'LOSING_HIGH') return -0.4;
    }
    if (talkType === 'CRITICIZE') {
      if (context === 'LOSING_HIGH') return 0.6;
      if (context === 'LOSING_ONE') return 0.4;
      if (context === 'DRAW_LOW') return 0.2;
      if (context === 'DRAW_HIGH') return 0.1;
      if (context === 'WINNING_ONE') return -0.3;
      if (context === 'WINNING_HIGH') return -0.6;
    }
    return 0; // SILENCE
  };
  const contextFit = getContextFit();

  // ── Wątek 2: Stan momentum na koniec 1. połowy ────────────────────────────
  // Drużyna w dołku (< -30) potrzebuje agresji bardziej niż spokoju
  const getMomentumMod = (): number => {
    if (talkType === 'AGGRESSIVE' && momentumEndOf1st < -30) return 0.15;
    if (talkType === 'CALM' && momentumEndOf1st > 30) return 0.10;
    if (talkType === 'AGGRESSIVE' && momentumEndOf1st > 50) return -0.10;
    if (talkType === 'CALM' && momentumEndOf1st < -50) return -0.12;
    return 0;
  };
  const momentumMod = getMomentumMod();

  // ── Wątek 3: Zmęczenie drużyny ────────────────────────────────────────────
  // Zmęczona drużyna (> 50% avg fatigue zużyte = avgFatigue < 50) słabiej reaguje na agresję
  const fatigueTired = avgFatigue < 50;
  const getFatigueMod = (): number => {
    if (talkType === 'AGGRESSIVE' && fatigueTired) return -0.08;
    if (talkType === 'CALM' && !fatigueTired) return 0.05;
    return 0;
  };
  const fatigueMod = getFatigueMod();

  // ── Wątek 4: Strzały (jakość gry) ────────────────────────────────────────
  // Dużo strzałów mimo przegranej → PRAISE ma sens nawet przy złym wyniku
  const goodPerformanceDespiteScore =
    (context === 'LOSING_ONE' || context === 'LOSING_HIGH') && userShots >= 4;
  const getPerfMod = (): number => {
    if (talkType === 'PRAISE' && goodPerformanceDespiteScore) return 0.12;
    if (talkType === 'CRITICIZE' && userShots === 0) return 0.10;
    return 0;
  };
  const perfMod = getPerfMod();

  // ── Wątek 5: Wariancja per typ ────────────────────────────────────────────
  // CRITICIZE = bardzo wysoka; SILENCE = bardzo niska
  const getVarianceRange = (): { min: number; max: number } => {
    if (talkType === 'CALM')       return { min: -8,  max: 12  };
    if (talkType === 'AGGRESSIVE') return { min: -10, max: 25  };
    if (talkType === 'PRAISE')     return { min: -8,  max: 18  };
    if (talkType === 'CRITICIZE')  return { min: -20, max: 20  };
    return                                { min: -8,  max: -2  }; // SILENCE
  };
  const { min, max } = getVarianceRange();

  // Wylosowana bazowa wartość momentum delta (w zakresie min..max)
  const rawBase = min + rng1 * (max - min);

  // ── Wątek 6: Modyfikatory response factors ────────────────────────────────
  // Określone przed losowaniem — zależą od typu
  const getBaseResponseFactors = () => {
    if (talkType === 'CALM') return {
      tempoRF:     0.90,
      mindsetRF:   1.00,
      intensityRF: 0.95,
      regenBonus:  1.5,
    };
    if (talkType === 'AGGRESSIVE') return {
      tempoRF:     1.05,
      mindsetRF:   0.95,
      intensityRF: 1.15,
      regenBonus:  -1.0,
    };
    if (talkType === 'PRAISE') return {
      tempoRF:     1.00,
      mindsetRF:   1.10,
      intensityRF: 1.00,
      regenBonus:  0.5,
    };
    if (talkType === 'CRITICIZE') return {
      tempoRF:     1.00,
      mindsetRF:   1.00,
      intensityRF: 1.00,
      regenBonus:  0.0,
    };
    return {  // SILENCE
      tempoRF:     1.00,
      mindsetRF:   1.00,
      intensityRF: 1.00,
      regenBonus:  0.0,
    };
  };
  const baseRF = getBaseResponseFactors();

  // ── Wątek 7: Finalny wynik + korekta CRITICIZE ────────────────────────────
  // Dla CRITICIZE: losujemy czy efekt idzie pozytywnie czy negatywnie
  // Szansa na pozytywny efekt rośnie przy słabym wyniku, maleje przy dobrym
  let isCriticizePositive = false;
  if (talkType === 'CRITICIZE') {
    const posChance =
      context === 'LOSING_HIGH' ? 0.55
      : context === 'LOSING_ONE' ? 0.48
      : context === 'DRAW_LOW'   ? 0.40
      : context === 'DRAW_HIGH'  ? 0.35
      : context === 'WINNING_ONE' ? 0.25
      : 0.18; // WINNING_HIGH
    isCriticizePositive = rng2 < posChance;
  }

  // Finalne przeliczenie momentum delta
  const totalModifier = 1.0 + contextFit + momentumMod + fatigueMod + perfMod;
  let finalMomentumDelta = rawBase * Math.max(0.1, totalModifier);

  // CRITICIZE: jeśli negatywny → odwracamy kierunek i zmniejszamy RF
  let finalTempoRF     = baseRF.tempoRF;
  let finalMindsetRF   = baseRF.mindsetRF;
  let finalIntensityRF = baseRF.intensityRF;
  let finalRegenBonus  = baseRF.regenBonus;

  if (talkType === 'CRITICIZE') {
    if (isCriticizePositive) {
      finalMomentumDelta = Math.abs(finalMomentumDelta);
      finalTempoRF     = 1.10;
      finalMindsetRF   = 1.10;
      finalIntensityRF = 1.10;
    } else {
      finalMomentumDelta = -Math.abs(finalMomentumDelta);
      finalTempoRF     = 0.85;
      finalMindsetRF   = 0.85;
      finalIntensityRF = 0.85;
    }
  }

  // Clamp końcowy momentum delta
  finalMomentumDelta = Math.max(-20, Math.min(25, finalMomentumDelta));
  finalMomentumDelta = Math.round(finalMomentumDelta * 10) / 10;

  // Losowy tekst reakcji
  const reactions = REACTION_TEXTS[talkType];
  const reactionText = reactions[Math.floor(rng3 * reactions.length)];

  // Drobna losowa fluktuacja response factors (±0.05)
  const rfNoise = (rng4 - 0.5) * 0.10;
  finalTempoRF     = Math.max(0.75, Math.min(1.25, finalTempoRF     + rfNoise));
  finalMindsetRF   = Math.max(0.75, Math.min(1.25, finalMindsetRF   + rfNoise * 0.7));
  finalIntensityRF = Math.max(0.75, Math.min(1.25, finalIntensityRF + rfNoise * 0.8));

  return {
    momentumDelta:         finalMomentumDelta,
    tempoResponseFactor:   parseFloat(finalTempoRF.toFixed(2)),
    mindsetResponseFactor: parseFloat(finalMindsetRF.toFixed(2)),
    intensityResponseFactor: parseFloat(finalIntensityRF.toFixed(2)),
    fatigueRegenBonus:     finalRegenBonus,
    reactionText,
  };
};

// ─── ROZMOWA MOTYWACYJNA TRENERA PRZECIWNIKA ──────────────────────────────────
export const calculateOpponentCoachTalkEffect = (
  decisionMaking: number,
  experience: number,
  oppScoreContext: ScoreContext,
  seed: number
): number => {
  const rng1 = seededRng(seed, 97);
  const rng2 = seededRng(seed, 98);

  const baseChance = 0.30 + (decisionMaking / 100) * 0.35 + (experience / 100) * 0.20;
  const contextBonus =
    oppScoreContext === 'LOSING_HIGH' ? 0.10
    : oppScoreContext === 'LOSING_ONE' ? 0.07
    : oppScoreContext === 'DRAW_LOW' || oppScoreContext === 'DRAW_HIGH' ? 0.03
    : 0;

  const finalChance = Math.min(0.90, baseChance + contextBonus);
  const isPositive = rng1 < finalChance;

  const strength = 5 + (decisionMaking / 100) * 10 + (experience / 100) * 8;
  const delta = strength * (rng2 * 0.6 + 0.4);

  return Math.round((isPositive ? delta : -delta * 0.7) * 10) / 10;
};
