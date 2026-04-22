import { DebriefContext, DebriefCommentType, DebriefComment, POST_MATCH_DEBRIEF } from '../data/postmatch_debrief_pl';

export type { DebriefContext, DebriefCommentType };

export interface DebriefEffect {
  moraleDelta: number;
  reactionText: string;
}

// ─── SEEDED RNG ───────────────────────────────────────────────────────────────
const seededRng = (seed: number, offset: number): number => {
  const s = seed + offset;
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
};

// ─── TEKSTY REAKCJI SZATNI ───────────────────────────────────────────────────
const REACTION_NORMAL: Record<DebriefCommentType, string[]> = {
  PRAISE: [
    'Kilku zawodników kiwa głowami. W szatni panuje pozytywna atmosfera.',
    'Widać uśmiechy. Słowa trafiły do drużyny.',
    'Zawodnicy wymieniają spojrzenia. Atmosfera jest dobra.',
    'Jeden z liderów klaszcze. Drużyna reaguje pozytywnie.',
  ],
  AGGRESSIVE: [
    'W szatni narasta napięcie. Kilku zawodników zaciska pięści.',
    'Słychać okrzyki. Drużyna wygląda nakręcona.',
    'Zawodnicy wstają z ławek. Energia jest wyczuwalna.',
    'Intensywność w szatni sięga zenitu. Drużyna jest gotowa.',
  ],
  CALM: [
    'W szatni zapada spokój. Zawodnicy skupiają się.',
    'Kiwają głowami. Spokój udziela się całej drużynie.',
    'Atmosfera jest opanowana. Każdy wie, co robić.',
    'Cisza i skupienie. Drużyna słucha uważnie.',
  ],
  CRITICIZE: [
    'Szatnia milczy. Niektórzy wbijają wzrok w podłogę.',
    'Jeden z liderów wstaje i przemawia do reszty.',
    'Kilku zawodników wymienia nerwowe spojrzenia.',
    'Atmosfera jest gęsta. Każdy wie, że musi dać więcej.',
  ],
  SILENCE: [
    'Zawodnicy wychodzą w milczeniu. Każdy z własną myślą.',
    'Brak słów. Cisza mówi wszystko.',
    'Nikt nic nie mówi. Każdy siedzi z własnymi myślami.',
    'Szatnia w milczeniu. Atmosfera jest ciężka.',
  ],
};

const REACTION_UNEXPECTED: string[] = [
  'Zawodnicy wydają się obojętni. Słowa nie trafiają w czuły punkt.',
  'Cisza. Kilku zawodników patrzy gdzie indziej.',
  'Drużyna nie reaguje tak, jak można by oczekiwać.',
  'Kilka skwaszonych min. Atmosfera nie idzie w dobrą stronę.',
  'Zaskakująca reakcja. Szatnia wydaje się zdezorientowana.',
];

// ─── WYZNACZENIE KONTEKSTU PO MECZU ─────────────────────────────────────────
export const getDebriefContext = (
  userScore: number,
  oppScore: number,
  userRep: number,
  oppRep: number,
  userGoals: { minute: number }[],
  oppGoals: { minute: number }[],
  userHasRedCard: boolean
): DebriefContext => {
  const diff = userScore - oppScore;
  const isWin = diff > 0;
  const isLoss = diff < 0;
  const repRatio = userRep > 0 ? oppRep / userRep : 1;
  const isStrongOpp = repRatio >= 1.20;
  const isWeakOpp = repRatio <= 0.85;

  const lastOppGoalMin = oppGoals.length > 0 ? Math.max(...oppGoals.map(g => g.minute)) : 0;
  const lastUserGoalMin = userGoals.length > 0 ? Math.max(...userGoals.map(g => g.minute)) : 0;

  if (isLoss) {
    if (userHasRedCard) return 'RED_CARD_LOSS';
    if (Math.abs(diff) >= 3) return 'BIG_LOSS';
    if (isWeakOpp) return 'LOSS_WEAK';
    if (isStrongOpp) return 'LOSS_STRONG';
    if (lastOppGoalMin >= 80 && Math.abs(diff) === 1) return 'LAST_MIN_LOSS';
    if (Math.abs(diff) === 1) return 'NARROW_LOSS';
    return 'BIG_LOSS';
  }

  if (isWin) {
    if (diff >= 3) return 'BIG_WIN';
    if (isStrongOpp) return 'WIN_STRONG';
    if (isWeakOpp) return 'WIN_WEAK';
    return 'WIN_NORMAL';
  }

  // Remis
  if (lastOppGoalMin >= 80 && oppGoals.length > 0) return 'DRAW_LAST_MIN_AGAINST';
  if (lastUserGoalMin >= 80 && userGoals.length > 0) return 'DRAW_LAST_MIN_FOR';
  if (isStrongOpp) return 'DRAW_STRONG';
  return 'DRAW';
};

// ─── POBRANIE KOMENTARZY DLA KONTEKSTU ───────────────────────────────────────
export const getCommentsForContext = (context: DebriefContext): DebriefComment[] => {
  return POST_MATCH_DEBRIEF[context];
};

// ─── KONTEKSTOWA TRAFNOŚĆ KOMENTARZA ────────────────────────────────────────
const getContextFit = (type: DebriefCommentType, context: DebriefContext): number => {
  const isWinCtx = ['BIG_WIN', 'WIN_STRONG', 'WIN_WEAK', 'WIN_NORMAL', 'PENALTY_WIN'].includes(context);
  const isLossCtx = ['BIG_LOSS', 'LOSS_STRONG', 'LOSS_WEAK', 'LAST_MIN_LOSS', 'NARROW_LOSS', 'RED_CARD_LOSS', 'PENALTY_LOSS'].includes(context);

  if (type === 'PRAISE') {
    if (isWinCtx) return 0.9;
    if (isLossCtx) return -0.3;
    return 0.4;
  }
  if (type === 'AGGRESSIVE') {
    if (isLossCtx) return 0.8;
    if (context === 'DRAW_LAST_MIN_AGAINST') return 0.7;
    if (isWinCtx) return -0.2;
    return 0.3;
  }
  if (type === 'CALM') {
    if (isWinCtx) return 0.7;
    if (isLossCtx) return -0.1;
    return 0.5;
  }
  if (type === 'CRITICIZE') {
    if (isLossCtx) return 0.5;
    if (context === 'DRAW_LAST_MIN_AGAINST') return 0.5;
    if (isWinCtx) return -0.6;
    return 0.2;
  }
  return 0; // SILENCE
};

// ─── ZAKRESY BAZOWYCH DELT MORALE PER TYP ────────────────────────────────────
const getBaseRange = (type: DebriefCommentType, context: DebriefContext): { min: number; max: number } => {
  const isWinCtx = ['BIG_WIN', 'WIN_STRONG', 'WIN_WEAK', 'WIN_NORMAL', 'PENALTY_WIN'].includes(context);
  const isLossCtx = ['BIG_LOSS', 'LOSS_STRONG', 'LOSS_WEAK', 'LAST_MIN_LOSS', 'NARROW_LOSS', 'RED_CARD_LOSS', 'PENALTY_LOSS'].includes(context);

  if (type === 'PRAISE') {
    if (isWinCtx) return { min: 4, max: 10 };
    if (isLossCtx) return { min: -2, max: 6 };
    return { min: 1, max: 7 };
  }
  if (type === 'AGGRESSIVE') {
    if (isLossCtx) return { min: 2, max: 12 };
    if (isWinCtx) return { min: -4, max: 7 };
    return { min: 1, max: 8 };
  }
  if (type === 'CALM') {
    if (isWinCtx) return { min: 2, max: 7 };
    if (isLossCtx) return { min: -4, max: 4 };
    return { min: 1, max: 6 };
  }
  if (type === 'CRITICIZE') {
    if (isLossCtx) return { min: -8, max: 9 };
    if (isWinCtx) return { min: -10, max: 2 };
    return { min: -7, max: 6 };
  }
  // SILENCE
  return { min: -4, max: -1 };
};

// ─── GŁÓWNA KALKULACJA EFEKTU ODPRAWY ────────────────────────────────────────
export const calculateDebriefEffect = (
  commentType: DebriefCommentType,
  context: DebriefContext,
  seed: number,
  optionIndex: number
): DebriefEffect => {
  const rng1 = seededRng(seed, optionIndex * 11 + 200);
  const rng2 = seededRng(seed, optionIndex * 11 + 201);
  const rng3 = seededRng(seed, optionIndex * 11 + 202);
  const rng4 = seededRng(seed, optionIndex * 11 + 203);

  const { min, max } = getBaseRange(commentType, context);
  const contextFit = getContextFit(commentType, context);

  const rawBase = min + rng1 * (max - min);
  const totalMod = Math.max(0.1, 1.0 + contextFit);
  let delta = rawBase * totalMod;

  // ── 20% czynnik losowy: szatnia może zareagować odwrotnie ─────────────────
  const isUnexpected = rng2 < 0.20;
  let reactionText: string;

  if (isUnexpected) {
    delta = -delta * (0.4 + rng3 * 0.6);
    reactionText = REACTION_UNEXPECTED[Math.floor(rng4 * REACTION_UNEXPECTED.length)];
  } else {
    const pool = REACTION_NORMAL[commentType];
    reactionText = pool[Math.floor(rng3 * pool.length)];
  }

  delta = Math.max(-15, Math.min(15, Math.round(delta)));

  return { moraleDelta: delta, reactionText };
};

// ─── ETYKIETA KONTEKSTU (do wyświetlenia w modalu) ───────────────────────────
export const getDebriefContextLabel = (context: DebriefContext): string => {
  const labels: Record<DebriefContext, string> = {
    BIG_WIN: 'DUŻE ZWYCIĘSTWO',
    WIN_STRONG: 'WYGRANA Z FAWORYTEM',
    WIN_WEAK: 'WYGRANA ZE SŁABSZYM',
    WIN_NORMAL: 'ZWYCIĘSTWO',
    PENALTY_WIN: 'WYGRANA PO KARNYCH',
    PENALTY_LOSS: 'PORAŻKA PO KARNYCH',
    DRAW_LAST_MIN_AGAINST: 'REMIS W OSTATNIEJ CHWILI',
    DRAW_LAST_MIN_FOR: 'URATOWANY REMIS',
    DRAW_STRONG: 'REMIS Z FAWORYTEM',
    DRAW: 'REMIS',
    BIG_LOSS: 'WYSOKA PRZEGRANA',
    LOSS_STRONG: 'PRZEGRANA Z FAWORYTEM',
    LOSS_WEAK: 'PRZEGRANA ZE SŁABSZYM',
    LAST_MIN_LOSS: 'PRZEGRANA W KOŃCÓWCE',
    NARROW_LOSS: 'MINIMALNA PRZEGRANA',
    RED_CARD_LOSS: 'PRZEGRANA Z 10 ZAWODNIKAMI',
  };
  return labels[context];
};

// ─── KOLOR AKCENTU PER KONTEKST ──────────────────────────────────────────────
export const getDebriefAccentColor = (context: DebriefContext): { via: string; badge: string; glow: string } => {
  const isWin = ['BIG_WIN', 'WIN_STRONG', 'WIN_WEAK', 'WIN_NORMAL', 'PENALTY_WIN'].includes(context);
  const isLoss = ['BIG_LOSS', 'LOSS_STRONG', 'LOSS_WEAK', 'LAST_MIN_LOSS', 'NARROW_LOSS', 'RED_CARD_LOSS', 'PENALTY_LOSS'].includes(context);
  const isBigLoss = context === 'BIG_LOSS' || context === 'LOSS_WEAK' || context === 'RED_CARD_LOSS';
  const isBigWin = context === 'BIG_WIN' || context === 'WIN_STRONG';

  if (isBigWin) return { via: 'via-yellow-400', badge: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10', glow: 'rgba(250,204,21,0.10)' };
  if (isWin) return { via: 'via-emerald-400', badge: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10', glow: 'rgba(52,211,153,0.08)' };
  if (isBigLoss) return { via: 'via-red-500', badge: 'text-red-400 border-red-500/40 bg-red-500/10', glow: 'rgba(239,68,68,0.10)' };
  if (isLoss) return { via: 'via-orange-500', badge: 'text-orange-400 border-orange-500/40 bg-orange-500/10', glow: 'rgba(249,115,22,0.08)' };
  if (context === 'DRAW_LAST_MIN_AGAINST') return { via: 'via-orange-400', badge: 'text-orange-400 border-orange-400/40 bg-orange-400/10', glow: 'rgba(251,146,60,0.08)' };
  if (context === 'DRAW_LAST_MIN_FOR' || context === 'DRAW_STRONG') return { via: 'via-blue-400', badge: 'text-blue-400 border-blue-400/40 bg-blue-400/10', glow: 'rgba(96,165,250,0.08)' };
  return { via: 'via-slate-400', badge: 'text-slate-300 border-slate-500/40 bg-slate-500/10', glow: 'rgba(148,163,184,0.05)' };
};
