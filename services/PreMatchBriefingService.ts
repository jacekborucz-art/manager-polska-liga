import { BriefingSpeechType, PREMATCH_BRIEFINGS } from '../data/prematch_briefing_pl';
export { PREMATCH_BRIEFINGS };
export type { BriefingSpeechType };

export type BriefingScenario = 'UNDERDOG' | 'EQUAL' | 'FAVORITE';

export interface BriefingEffect {
  actionMod: number;
  goalMod: number;
  momentumBonus: number;
  expiryMinute: number;
  fatigueMult: number;
  rivalBoost: number;
  label: string;
  reactionText: string;
  wasSurprise: boolean;
}

// ─── WYKRYWANIE SCENARIUSZA ────────────────────────────────────────────────────
export const detectScenario = (userRep: number, oppRep: number): BriefingScenario => {
  const gap = oppRep - userRep;
  if (gap >= 4) return 'UNDERDOG';
  if (gap <= -4) return 'FAVORITE';
  return 'EQUAL';
};

// ─── SEEDED RNG ───────────────────────────────────────────────────────────────
const seededRng = (seed: number, offset: number): number => {
  const s = seed + offset * 7919;
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
};

// ─── PULE TEKSTÓW REAKCJI ─────────────────────────────────────────────────────
type ReactionQuality = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'SURPRISE_POS' | 'SURPRISE_NEG';

const REACTION_POOL: Record<ReactionQuality, string[]> = {
  POSITIVE: [
    'Szatnia cała w emocjach. Zawodnicy wstają, a w ich oczach widać ogromną determinację',
    'Kapitan motywuje druzynę. Wszyscy słuchają w milczeniu.',
    'Zawodnicy wychodzą na boisko gotowi na wszystko.',
    'Determinacja na twarzach. Drużyna jest gotowa.',
  ],
  NEUTRAL: [
    'Zawodnicy kiwają głowami. Trudno powiedzieć, czy coś do nich dotarło.',
    'Kilka osób wymienia spojrzenia. Cisza.',
    'Drużyna wygląda na skupioną, ale trudno wyczuć emocje.',
    'Każdy zabiera się za własne myśli. Brak wyraźnej reakcji.',
  ],
  NEGATIVE: [
    'Kilku zawodników patrzy ze zdziwieniem. Coś tu nie gra.',
    'Ta przemowa chyba nie za bardzo trafiła do nich.  Widać lekką konsternację.',
    'Jeden z zawodników kręci głową. Napięcie w szatni wyraźnie wzrosło.',
    'W szatni zapanowała cisza. Tak jakby ktoś powiedział trochę za dużo lub za mało.',
  ],
  SURPRISE_POS: [
    'Coś eksploduje w tej szatni. Zawodnicy krzyczą, wstają, rzucają ręcznikami. Nigdy tak nie wyglądali.',
    'Łzy w oczach napastnika. Kapitan ściska go za ramię. Ta mowa zmieniła wszystko.',
    'Szatnia wybucha. To nie jest zwykła mobilizacja — to coś zupełnie innego.',
  ],
  SURPRISE_NEG: [
    'Zbyt wiele naraz. Widać, że kilku zawodników myśli za dużo i nie jest skoncentrowanych na meczu.',
    'Cisza jest głucha. Jakbyś powiedział złe słowo w złym miejscu i o złym czasie.',
    'Coś pękło w złą stronę. Kilku liderów ma kamienne, nieprzeniknione miny.',
  ],
};

const pickReaction = (quality: ReactionQuality, rng: number): string => {
  const pool = REACTION_POOL[quality];
  return pool[Math.floor(rng * pool.length)];
};

// ─── GŁÓWNA KALKULACJA EFEKTU ─────────────────────────────────────────────────
export const calculateBriefingEffect = (
  hiddenType: BriefingSpeechType,
  scenario: BriefingScenario,
  seed: number,
  optionIndex: number
): BriefingEffect => {
  const rng1 = seededRng(seed, optionIndex + 1);
  const rng2 = seededRng(seed, optionIndex + 2);
  const rng3 = seededRng(seed, optionIndex + 3);

  type EffectDef = {
    actionMod: number;
    goalMod: number;
    momentumBonus: number;
    expiryMinute: number;
    fatigueMult: number;
    rivalBoost: number;
    label: string;
    quality: ReactionQuality;
    surpriseChance: number;
    surpriseEffect: Omit<EffectDef, 'surpriseChance' | 'surpriseEffect'>;
  };

  const getEffectDef = (): EffectDef => {
    // ── UPRISING ──────────────────────────────────────────────────────────────
    if (hiddenType === 'UPRISING') {
      if (scenario === 'UNDERDOG') return {
        actionMod: 0.040, goalMod: 0.030, momentumBonus: 18, expiryMinute: 35,
        fatigueMult: 1.00, rivalBoost: 0, label: 'NICZEGO DO STRACENIA',
        quality: 'POSITIVE', surpriseChance: 0.20,
        surpriseEffect: { actionMod: 0.080, goalMod: 0.060, momentumBonus: 28, expiryMinute: 55, fatigueMult: 1.00, rivalBoost: 0, label: 'TRANS BOJOWY', quality: 'SURPRISE_POS' },
      };
      if (scenario === 'EQUAL') return {
        actionMod: 0.010, goalMod: 0.010, momentumBonus: 5, expiryMinute: 20,
        fatigueMult: 1.00, rivalBoost: 0, label: 'LEKKA MOBILIZACJA',
        quality: 'NEUTRAL', surpriseChance: 0,
        surpriseEffect: { actionMod: 0.010, goalMod: 0.010, momentumBonus: 5, expiryMinute: 20, fatigueMult: 1.00, rivalBoost: 0, label: 'LEKKA MOBILIZACJA', quality: 'NEUTRAL' },
      };
      // FAVORITE — zła mowa do faworytem
      return {
        actionMod: -0.025, goalMod: -0.020, momentumBonus: -8, expiryMinute: 25,
        fatigueMult: 1.00, rivalBoost: 0, label: 'DEZORIENTACJA',
        quality: 'NEGATIVE', surpriseChance: 0,
        surpriseEffect: { actionMod: -0.025, goalMod: -0.020, momentumBonus: -8, expiryMinute: 25, fatigueMult: 1.00, rivalBoost: 0, label: 'DEZORIENTACJA', quality: 'NEGATIVE' },
      };
    }

    // ── FORTRESS ──────────────────────────────────────────────────────────────
    if (hiddenType === 'FORTRESS') {
      if (scenario === 'UNDERDOG') return {
        actionMod: 0.020, goalMod: 0.015, momentumBonus: 8, expiryMinute: 90,
        fatigueMult: 0.970, rivalBoost: -0.25, label: 'MUR DEFENSYWNY',
        quality: 'POSITIVE', surpriseChance: 0.15,
        surpriseEffect: { actionMod: 0.020, goalMod: 0.015, momentumBonus: 8, expiryMinute: 90, fatigueMult: 0.960, rivalBoost: -0.45, label: 'MUR DEFENSYWNY+', quality: 'SURPRISE_POS' },
      };
      if (scenario === 'EQUAL') return {
        actionMod: 0.010, goalMod: 0.005, momentumBonus: 0, expiryMinute: 50,
        fatigueMult: 0.980, rivalBoost: 0, label: 'OSTROŻNA GRA',
        quality: 'NEUTRAL', surpriseChance: 0,
        surpriseEffect: { actionMod: 0.010, goalMod: 0.005, momentumBonus: 0, expiryMinute: 50, fatigueMult: 0.980, rivalBoost: 0, label: 'OSTROŻNA GRA', quality: 'NEUTRAL' },
      };
      return {
        actionMod: -0.010, goalMod: 0, momentumBonus: -5, expiryMinute: 30,
        fatigueMult: 0.980, rivalBoost: 0, label: 'ZBY ZACHOWAWCZE',
        quality: 'NEGATIVE', surpriseChance: 0,
        surpriseEffect: { actionMod: -0.010, goalMod: 0, momentumBonus: -5, expiryMinute: 30, fatigueMult: 0.980, rivalBoost: 0, label: 'ZBY ZACHOWAWCZE', quality: 'NEGATIVE' },
      };
    }

    // ── WOUNDED PRIDE ─────────────────────────────────────────────────────────
    if (hiddenType === 'WOUNDED_PRIDE') {
      if (scenario === 'UNDERDOG') return {
        actionMod: 0.050, goalMod: 0.035, momentumBonus: 14, expiryMinute: 25,
        fatigueMult: 1.00, rivalBoost: 0, label: 'ZŁOŚĆ I AMBICJA',
        quality: 'POSITIVE', surpriseChance: 0.25,
        surpriseEffect: { actionMod: -0.020, goalMod: -0.010, momentumBonus: -12, expiryMinute: 20, fatigueMult: 1.00, rivalBoost: 0, label: 'BACKFIRE — ZA DUŻO EMOCJI', quality: 'SURPRISE_NEG' },
      };
      if (scenario === 'EQUAL') return {
        actionMod: 0.025, goalMod: 0.020, momentumBonus: 8, expiryMinute: 20,
        fatigueMult: 1.00, rivalBoost: 0, label: 'MOTYWACJA PRZEZ ZŁOŚĆ',
        quality: 'POSITIVE', surpriseChance: 0.15,
        surpriseEffect: { actionMod: -0.015, goalMod: 0, momentumBonus: -8, expiryMinute: 15, fatigueMult: 1.00, rivalBoost: 0, label: 'BACKFIRE — EMOCJE', quality: 'SURPRISE_NEG' },
      };
      return {
        actionMod: -0.030, goalMod: -0.015, momentumBonus: -5, expiryMinute: 20,
        fatigueMult: 1.00, rivalBoost: 0, label: 'AROGANCJA',
        quality: 'NEGATIVE', surpriseChance: 0,
        surpriseEffect: { actionMod: -0.030, goalMod: -0.015, momentumBonus: -5, expiryMinute: 20, fatigueMult: 1.00, rivalBoost: 0, label: 'AROGANCJA', quality: 'NEGATIVE' },
      };
    }

    // ── KAMIKAZE ──────────────────────────────────────────────────────────────
    if (hiddenType === 'KAMIKAZE') {
      if (scenario === 'UNDERDOG') return {
        actionMod: 0.060, goalMod: 0.045, momentumBonus: 22, expiryMinute: 38,
        fatigueMult: 1.10, rivalBoost: 0, label: 'SERCE NA DŁONI',
        quality: 'POSITIVE', surpriseChance: 0.30,
        surpriseEffect: { actionMod: 0.060, goalMod: 0.045, momentumBonus: 22, expiryMinute: 28, fatigueMult: 1.22, rivalBoost: 0, label: 'SERCE NA DŁONI — WYPALENIE', quality: 'SURPRISE_NEG' },
      };
      if (scenario === 'EQUAL') return {
        actionMod: 0.020, goalMod: 0.015, momentumBonus: 8, expiryMinute: 25,
        fatigueMult: 1.05, rivalBoost: 0, label: 'INTENSYWNA GRA',
        quality: 'NEUTRAL', surpriseChance: 0.20,
        surpriseEffect: { actionMod: 0.040, goalMod: 0.030, momentumBonus: 15, expiryMinute: 30, fatigueMult: 1.08, rivalBoost: 0, label: 'INTENSYWNA GRA+', quality: 'SURPRISE_POS' },
      };
      return {
        actionMod: -0.010, goalMod: 0, momentumBonus: 0, expiryMinute: 20,
        fatigueMult: 1.05, rivalBoost: 0, label: 'NIEPOTRZEBNE RYZYKO',
        quality: 'NEUTRAL', surpriseChance: 0,
        surpriseEffect: { actionMod: -0.010, goalMod: 0, momentumBonus: 0, expiryMinute: 20, fatigueMult: 1.05, rivalBoost: 0, label: 'NIEPOTRZEBNE RYZYKO', quality: 'NEUTRAL' },
      };
    }

    // ── TACTICIAN ─────────────────────────────────────────────────────────────
    if (hiddenType === 'TACTICIAN') {
      if (scenario === 'UNDERDOG') return {
        actionMod: 0.005, goalMod: 0.005, momentumBonus: 0, expiryMinute: 40,
        fatigueMult: 1.00, rivalBoost: 0, label: 'ZIMNA GŁOWA',
        quality: 'NEUTRAL', surpriseChance: 0,
        surpriseEffect: { actionMod: 0.005, goalMod: 0.005, momentumBonus: 0, expiryMinute: 40, fatigueMult: 1.00, rivalBoost: 0, label: 'ZIMNA GŁOWA', quality: 'NEUTRAL' },
      };
      if (scenario === 'EQUAL') return {
        actionMod: 0.025, goalMod: 0.020, momentumBonus: 5, expiryMinute: 90,
        fatigueMult: 0.980, rivalBoost: 0, label: 'TAKTYCZNA WYŻSZOŚĆ',
        quality: 'POSITIVE', surpriseChance: 0.10,
        surpriseEffect: { actionMod: 0.025, goalMod: 0.020, momentumBonus: 5, expiryMinute: 90, fatigueMult: 0.960, rivalBoost: 0, label: 'TAKTYCZNA WYŻSZOŚĆ+', quality: 'SURPRISE_POS' },
      };
      return {
        actionMod: 0.020, goalMod: 0.015, momentumBonus: 5, expiryMinute: 90,
        fatigueMult: 0.980, rivalBoost: -0.10, label: 'KONTROLA MECZU',
        quality: 'POSITIVE', surpriseChance: 0.10,
        surpriseEffect: { actionMod: 0.020, goalMod: 0.015, momentumBonus: 5, expiryMinute: 90, fatigueMult: 0.975, rivalBoost: -0.15, label: 'KONTROLA MECZU+', quality: 'SURPRISE_POS' },
      };
    }

    // ── BLITZ ─────────────────────────────────────────────────────────────────
    if (hiddenType === 'BLITZ') {
      if (scenario === 'UNDERDOG') return {
        actionMod: 0.045, goalMod: 0.035, momentumBonus: 22, expiryMinute: 20,
        fatigueMult: 1.00, rivalBoost: 0, label: 'BŁYSKAWICZNY START',
        quality: 'POSITIVE', surpriseChance: 0.15,
        surpriseEffect: { actionMod: 0.045, goalMod: 0.035, momentumBonus: 22, expiryMinute: 20, fatigueMult: 1.10, rivalBoost: 0, label: 'BŁYSKAWICZNY START — WYCZERPANIE', quality: 'SURPRISE_NEG' },
      };
      if (scenario === 'EQUAL') return {
        actionMod: 0.070, goalMod: 0.050, momentumBonus: 25, expiryMinute: 18,
        fatigueMult: 1.00, rivalBoost: 0, label: 'UDERZENIE NA WEJŚCIE',
        quality: 'POSITIVE', surpriseChance: 0.20,
        surpriseEffect: { actionMod: 0.070, goalMod: 0.050, momentumBonus: 25, expiryMinute: 18, fatigueMult: 1.08, rivalBoost: 0, label: 'UDERZENIE NA WEJŚCIE — WYPALENIE', quality: 'SURPRISE_NEG' },
      };
      return {
        actionMod: 0.030, goalMod: 0.020, momentumBonus: 12, expiryMinute: 20,
        fatigueMult: 1.00, rivalBoost: 0, label: 'SZYBKI START',
        quality: 'POSITIVE', surpriseChance: 0,
        surpriseEffect: { actionMod: 0.030, goalMod: 0.020, momentumBonus: 12, expiryMinute: 20, fatigueMult: 1.00, rivalBoost: 0, label: 'SZYBKI START', quality: 'POSITIVE' },
      };
    }

    // ── PATIENCE ──────────────────────────────────────────────────────────────
    if (hiddenType === 'PATIENCE') {
      // Zawsze ten sam efekt — bezpieczny w każdym scenariuszu
      return {
        actionMod: 0.010, goalMod: 0.008, momentumBonus: 0, expiryMinute: 90,
        fatigueMult: 0.950, rivalBoost: 0, label: 'CIERPLIWOŚĆ',
        quality: 'NEUTRAL', surpriseChance: 0.05,
        surpriseEffect: { actionMod: 0, goalMod: 0, momentumBonus: -5, expiryMinute: 20, fatigueMult: 0.950, rivalBoost: 0, label: 'BRAK MOBILIZACJI', quality: 'SURPRISE_NEG' },
      };
    }

    // ── PROFESSIONALISM ───────────────────────────────────────────────────────
    if (hiddenType === 'PROFESSIONALISM') {
      if (scenario === 'UNDERDOG') return {
        actionMod: 0.005, goalMod: 0.005, momentumBonus: 0, expiryMinute: 50,
        fatigueMult: 1.00, rivalBoost: 0, label: 'SPOKOJNE NASTAWIENIE',
        quality: 'NEUTRAL', surpriseChance: 0,
        surpriseEffect: { actionMod: 0.005, goalMod: 0.005, momentumBonus: 0, expiryMinute: 50, fatigueMult: 1.00, rivalBoost: 0, label: 'SPOKOJNE NASTAWIENIE', quality: 'NEUTRAL' },
      };
      if (scenario === 'EQUAL') return {
        actionMod: 0.015, goalMod: 0.010, momentumBonus: 3, expiryMinute: 70,
        fatigueMult: 1.00, rivalBoost: -0.10, label: 'PROFESJONALIZM',
        quality: 'POSITIVE', surpriseChance: 0,
        surpriseEffect: { actionMod: 0.015, goalMod: 0.010, momentumBonus: 3, expiryMinute: 70, fatigueMult: 1.00, rivalBoost: -0.10, label: 'PROFESJONALIZM', quality: 'POSITIVE' },
      };
      return {
        actionMod: 0.025, goalMod: 0.020, momentumBonus: 5, expiryMinute: 90,
        fatigueMult: 1.00, rivalBoost: -0.20, label: 'KLASA I SPOKÓJ',
        quality: 'POSITIVE', surpriseChance: 0.05,
        surpriseEffect: { actionMod: 0.030, goalMod: 0.025, momentumBonus: 8, expiryMinute: 90, fatigueMult: 1.00, rivalBoost: -0.30, label: 'KLASA I SPOKÓJ+', quality: 'SURPRISE_POS' },
      };
    }

    // ── LOOSE ─────────────────────────────────────────────────────────────────
    if (hiddenType === 'LOOSE') {
      if (scenario === 'UNDERDOG') return {
        actionMod: 0.005, goalMod: 0, momentumBonus: 0, expiryMinute: 60,
        fatigueMult: 0.940, rivalBoost: 0, label: 'OSZCZĘDNOŚĆ SIŁ',
        quality: 'NEUTRAL', surpriseChance: 0,
        surpriseEffect: { actionMod: 0.005, goalMod: 0, momentumBonus: 0, expiryMinute: 60, fatigueMult: 0.940, rivalBoost: 0, label: 'OSZCZĘDNOŚĆ SIŁ', quality: 'NEUTRAL' },
      };
      if (scenario === 'EQUAL') return {
        actionMod: -0.010, goalMod: -0.005, momentumBonus: -5, expiryMinute: 60,
        fatigueMult: 0.940, rivalBoost: 0, label: 'ZA DUŻY RELAKS',
        quality: 'NEUTRAL', surpriseChance: 0.25,
        surpriseEffect: { actionMod: -0.025, goalMod: -0.020, momentumBonus: -12, expiryMinute: 45, fatigueMult: 0.940, rivalBoost: 0.20, label: 'BRAK SKUPIENIA', quality: 'SURPRISE_NEG' },
      };
      // FAVORITE — wysokie ryzyko zlekceważenia rywala
      const isBackfire = rng1 < 0.40;
      if (isBackfire) return {
        actionMod: -0.040, goalMod: -0.030, momentumBonus: -18, expiryMinute: 90,
        fatigueMult: 0.940, rivalBoost: 0.40, label: 'ZLEKCEWAŻENIE RYWALA',
        quality: 'SURPRISE_NEG', surpriseChance: 0,
        surpriseEffect: { actionMod: -0.040, goalMod: -0.030, momentumBonus: -18, expiryMinute: 90, fatigueMult: 0.940, rivalBoost: 0.40, label: 'ZLEKCEWAŻENIE RYWALA', quality: 'SURPRISE_NEG' },
      };
      return {
        actionMod: 0, goalMod: 0, momentumBonus: 0, expiryMinute: 90,
        fatigueMult: 0.900, rivalBoost: 0, label: 'OSZCZĘDNOŚĆ SIŁ',
        quality: 'NEUTRAL', surpriseChance: 0,
        surpriseEffect: { actionMod: 0, goalMod: 0, momentumBonus: 0, expiryMinute: 90, fatigueMult: 0.900, rivalBoost: 0, label: 'OSZCZĘDNOŚĆ SIŁ', quality: 'NEUTRAL' },
      };
    }

    // ── DOMINANCE ─────────────────────────────────────────────────────────────
    if (hiddenType === 'DOMINANCE') {
      if (scenario === 'UNDERDOG') return {
        actionMod: -0.015, goalMod: -0.010, momentumBonus: -8, expiryMinute: 25,
        fatigueMult: 1.00, rivalBoost: 0, label: 'ZŁA MOWA',
        quality: 'NEGATIVE', surpriseChance: 0,
        surpriseEffect: { actionMod: -0.015, goalMod: -0.010, momentumBonus: -8, expiryMinute: 25, fatigueMult: 1.00, rivalBoost: 0, label: 'ZŁA MOWA', quality: 'NEGATIVE' },
      };
      if (scenario === 'EQUAL') return {
        actionMod: 0.015, goalMod: 0.010, momentumBonus: 8, expiryMinute: 35,
        fatigueMult: 1.00, rivalBoost: 0, label: 'DETERMINACJA',
        quality: 'POSITIVE', surpriseChance: 0,
        surpriseEffect: { actionMod: 0.015, goalMod: 0.010, momentumBonus: 8, expiryMinute: 35, fatigueMult: 1.00, rivalBoost: 0, label: 'DETERMINACJA', quality: 'POSITIVE' },
      };
      return {
        actionMod: 0.030, goalMod: 0.025, momentumBonus: 16, expiryMinute: 45,
        fatigueMult: 1.00, rivalBoost: 0, label: 'DOMINACJA',
        quality: 'POSITIVE', surpriseChance: 0.30,
        surpriseEffect: { actionMod: 0.025, goalMod: 0.020, momentumBonus: 10, expiryMinute: 45, fatigueMult: 1.05, rivalBoost: 0.50, label: 'RYWAL ZMOBILIZOWANY', quality: 'SURPRISE_NEG' },
      };
    }

    // fallback
    return {
      actionMod: 0, goalMod: 0, momentumBonus: 0, expiryMinute: 0,
      fatigueMult: 1.00, rivalBoost: 0, label: 'BRAK EFEKTU',
      quality: 'NEUTRAL', surpriseChance: 0,
      surpriseEffect: { actionMod: 0, goalMod: 0, momentumBonus: 0, expiryMinute: 0, fatigueMult: 1.00, rivalBoost: 0, label: 'BRAK EFEKTU', quality: 'NEUTRAL' },
    };
  };

  const def = getEffectDef();
  const isSurprise = def.surpriseChance > 0 && rng2 < def.surpriseChance;
  const chosen = isSurprise ? def.surpriseEffect : def;

  return {
    actionMod:     chosen.actionMod,
    goalMod:       chosen.goalMod,
    momentumBonus: chosen.momentumBonus,
    expiryMinute:  chosen.expiryMinute,
    fatigueMult:   chosen.fatigueMult,
    rivalBoost:    chosen.rivalBoost,
    label:         chosen.label,
    reactionText:  pickReaction(chosen.quality, rng3),
    wasSurprise:   isSurprise,
  };
};

// ─── NEUTRALNY EFEKT (gracz milczy) ──────────────────────────────────────────
export const getSilenceEffect = (): BriefingEffect => ({
  actionMod:     0,
  goalMod:       0,
  momentumBonus: 0,
  expiryMinute:  0,
  fatigueMult:   1.00,
  rivalBoost:    0,
  label:         'MILCZENIE',
  reactionText:  'Szatnia w ciszy. Każdy przygotowuje się sam.',
  wasSurprise:   false,
});
