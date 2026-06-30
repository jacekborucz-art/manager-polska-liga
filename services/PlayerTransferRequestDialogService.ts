// ═════════════════════════════════════════════════════════════════════════════
// PlayerTransferRequestDialogService
//
// Obsługuje 4 ścieżki rozmowy managera z zawodnikiem po odebraniu prośby
// o wystawienie na listę transferową (mail PLAYER_MORALE_REQUEST / TRANSFER_LIST).
//
// ── ŚCIEŻKI ──────────────────────────────────────────────────────────────────
//   A — PROMISE_CONTRACT:    manager obiecuje lepszy kontrakt (sub-dialog 3 pytania)
//   B — ALLOW_END_OF_SEASON: zgoda na odejście po sezonie (sub-dialog 1 pytanie)
//   C — REFUSE_IMPORTANT:    odmowa — zawodnik jest zbyt ważny (sub-dialog 2 pytania)
//   D — REFUSE_NO_TALK:      odmowa rozmowy (bez dialogu, natychmiastowe konsekwencje)
//
// ── REAKCJE GRACZA ────────────────────────────────────────────────────────────
//   AGREED   – akceptuje decyzję managera natychmiast
//   THINKING – zastanawia się 5–14 dni → po tym czasie AGREED lub REFUSED
//              (odpowiedź trafia do skrzynki jako mail TRANSFER_REQUEST_PLAYER_RESPONSE)
//   REFUSED  – odrzuca, konflikt narasta
//
// ── SZANSE REAKCJI ────────────────────────────────────────────────────────────
//   Kalkulacja opiera się na 4 czynnikach + losowości:
//     1. coachTrust (mindset)        — zaufanie do trenera
//     2. conflictLevel (mindset)     — narastający konflikt
//     3. transferOpenness (mindset)  — gotowość do odejścia
//     4. dialogScore / maxScore      — wynik sub-dialogu (A, B, C)
//   + modyfikator osobowości (moralePersonality)
//   + modyfikator morale (player.morale)
//   + RNG ±10% (seed deterministyczny z daty + player.id)
//
//   Progi: AGREED ≥ 0.65 | THINKING ≥ 0.35 | REFUSED < 0.35
//
// ── OBIETNICA KONTRAKTOWA (ścieżka A) ─────────────────────────────────────────
//   Gracz SAMODZIELNIE wybiera oczekiwaną podwyżkę z puli [15,25,35,45,50,75,100]%.
//   Wybór jest losowy, ale ważony: wyższy coachTrust → niższe żądania; wyższy
//   transferOpenness / conflictLevel → wyższe żądania.
//
//   Wartość jest zapisana w player.transferContractPromise.salaryRaisePct.
//   !! WAŻNE: PlayerContractMindflowService POWINIEN sprawdzać to pole przy
//   kolejnych rozmowach kontraktowych i uwzględniać obietnicę w ocenie oferty. !!
//
//   Jeśli obietnica NIE zostanie spełniona do deadlineAt (koniec sezonu):
//     → conflictLevel +25, coachTrust −30, morale −16, sufit morale 59 do czasu nowego kontraktu
//     → mail TRANSFER_CONTRACT_PROMISE_BROKEN
//
//   Przypomnienie 14 dni przed deadline:
//     → mail TRANSFER_CONTRACT_PROMISE_REMINDER (bez kar)
//
// ── ZGODA NA ODEJŚCIE PO SEZONIE (ścieżka B) ─────────────────────────────────
//   Flaga player.transferAllowAfterSeason = true + deadline (koniec sezonu).
//   Jeśli po sezonie zawodnik NIE jest na liście transferowej:
//     → conflictLevel +20, coachTrust −25, morale −6
//     → mail TRANSFER_AFTER_SEASON_BROKEN
//
// ── DAILY CHECKS (wywoływane z GameContext.advanceDay) ───────────────────────
//   PlayerTransferRequestDialogService.reviewPendingResponse(player, currentDate, seed)
//   PlayerTransferRequestDialogService.reviewContractPromise(player, currentDate)
//   PlayerTransferRequestDialogService.reviewAllowAfterSeason(player, currentDate)
//
// ── POWIĄZANE PLIKI ───────────────────────────────────────────────────────────
//   types.ts              → TransferContractPromise, TransferRequestPendingResponse
//   PlayerCard.tsx        → setIsTransferRequestDialogOpen (trigger modalа)
//   PlayerTransferRequestModal.tsx → UI (wybór ścieżki + sub-dialog + wynik)
//   GameContext.tsx       → resolvePlayerTransferRequestDialog (stosuje skutki)
//   MailDetailsModal.tsx  → przycisk "Porozmawiaj" przy TRANSFER_LIST requestType
// ═════════════════════════════════════════════════════════════════════════════

import {
  MailMessage,
  MailType,
  Player,
  PlayerMoralePersonality,
  TransferContractPromise,
  TransferRequestPendingResponse,
} from '../types';
import { PlayerMoraleService } from './PlayerMoraleService';

// ─────────────────────────────────────────────────────────────────────────────
// Typy eksportowane
// ─────────────────────────────────────────────────────────────────────────────

/** Wybór managera — który wariant odpowiedzi na prośbę o listę transferową. */
export type TransferRequestManagerChoice =
  | 'PROMISE_CONTRACT'    // A: obiecuję lepszy kontrakt
  | 'ALLOW_END_OF_SEASON' // B: możesz odejść, ale dopiero po sezonie
  | 'REFUSE_IMPORTANT'    // C: nie pozwolę ci odejść — jesteś zbyt ważny
  | 'REFUSE_NO_TALK';     // D: nie chcę w ogóle rozmawiać

/** Reakcja gracza po rozmowie lub po upływie czasu zastanowienia. */
export type TransferRequestPlayerReaction = 'AGREED' | 'THINKING' | 'REFUSED';

/** Pojedyncza opcja odpowiedzi managera w sub-dialogu. */
export interface TransferRequestDialogAnswer {
  id: string;
  text: string;
  /** Liczba punktów (dodatnia lub ujemna) — wpływa na finalną szansę AGREED. */
  points: number;
  /** Tekst reakcji gracza wyświetlany po wyborze tej odpowiedzi. */
  reaction: string;
}

/** Pytanie gracza w sub-dialogu (A, B lub C). */
export interface TransferRequestDialogQuestion {
  id: string;
  playerText: string;
  answers: TransferRequestDialogAnswer[];
}

/** Aktywna sesja sub-dialogu (tworzona przez createSession, aktualizowana przez answer). */
export interface TransferRequestDialogSession {
  managerChoice: TransferRequestManagerChoice;
  questions: TransferRequestDialogQuestion[];
  currentQuestionIndex: number;
  /** Suma punktów z dotychczasowych odpowiedzi. */
  score: number;
  /** Reakcja gracza po ostatniej odpowiedzi (do wyświetlenia w UI). */
  lastReaction: string | null;
}

/** Pełny wynik dialogu przekazywany do GameContext.resolvePlayerTransferRequestDialog. */
export interface TransferRequestDialogResult {
  managerChoice: TransferRequestManagerChoice;
  reaction: TransferRequestPlayerReaction;
  /** Liczba dni oczekiwania na odpowiedź (dla THINKING); null = odpowiedź natychmiastowa. */
  responseDelayDays: number | null;
  moraleDelta: number;
  /** Delty mindset stosowane przez GameContext.withMindsetChange. */
  mindsetDeltas: {
    coachTrust?: number;
    clubHappiness?: number;
    transferOpenness?: number;
    conflictLevel?: number;
  };
  /** Obiekt obietnicy do zapisania jako player.transferContractPromise (ścieżka A, tylko AGREED/THINKING). */
  promiseMade: TransferContractPromise | null;
  /** true = ustaw player.transferAllowAfterSeason = true (ścieżka B, AGREED/THINKING). */
  allowAfterSeasonFlag: boolean;
  /** Dane dla player.transferRequestPendingResponse (tylko gdy reaction = 'THINKING'). */
  pendingResponse: TransferRequestPendingResponse | null;
  title: string;
  summary: string;
}

/** Wynik codziennego przeglądu obietnicy — zaktualizowany gracz + ewentualne maile do skrzynki. */
export interface TransferRequestReviewResult {
  player: Player;
  mails: MailMessage[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Stałe kalibracyjne
// Wszystkie progi i wartości są zebrane tu, żeby łatwo je edytować.
// ─────────────────────────────────────────────────────────────────────────────

/** Pula możliwych % podwyżek, które zawodnik może wybrać (ścieżka A).
 *  Gracz wybiera losowo z wagami (niższe = bardziej prawdopodobne przy wysokim zaufaniu). */
const POSSIBLE_RAISES = [15, 25, 35, 45, 50, 75, 100] as const;

/** Próg reakcji AGREED — powyżej tej wartości gracz zgadza się od razu.
 *  Kalibracja: zwiększ wartość, aby gra była trudniejsza (gracze rzadziej zgadzają się). */
const AGREED_THRESHOLD = 0.65;

/** Próg reakcji THINKING — powyżej tej wartości (a poniżej AGREED_THRESHOLD) gracz zastanawia się.
 *  Kalibracja: zmniejsz wartość, aby gracze rzadziej twardego odmawiali. */
const THINKING_THRESHOLD = 0.35;

/** Ile dni przed deadlineAt wysyłamy przypomnienie o obietnicy kontraktowej. */
const CONTRACT_PROMISE_REMINDER_DAYS_BEFORE = 14;

/** Min/max dni oczekiwania na odpowiedź gdy gracz jest w stanie THINKING.
 *  delayDays = MIN_THINKING_DAYS + floor(rng * THINKING_DAYS_RANGE) */
const MIN_THINKING_DAYS = 5;
const THINKING_DAYS_RANGE = 10; // = max 14 dni

// ─────────────────────────────────────────────────────────────────────────────
// Sub-dialogi — pytania i odpowiedzi
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ścieżka A (PROMISE_CONTRACT) — 3 pytania gracza o obietnicę kontraktu.
 * Maks wynik: 9 punktów (3 × 3).
 * Pytania dotyczą: terminu propozycji, konkretnych warunków, i "co jeśli nie dojdziemy do porozumienia".
 */
const QUESTIONS_A: TransferRequestDialogQuestion[] = [
  {
    id: 'A_TIMING',
    playerText: 'Kiedy mogę spodziewać się tej propozycji? Miesiącami słyszę "wkrótce", a konkrety nigdy nie nadchodzą.',
    answers: [
      {
        id: 'A_TIMING_SOON',
        text: 'Usiądziemy do stołu zaraz po zakończeniu sezonu. Mam to zaplanowane.',
        points: 3,
        reaction: 'To brzmi jak konkret. Czekam na to spotkanie — nie zapomnę o tej rozmowie.',
      },
      {
        id: 'A_TIMING_PROCESS',
        text: 'Przejdziemy przez to etapami — najpierw skupiamy się na sezonie, potem rozmowy kontraktowe.',
        points: 2,
        reaction: 'Rozumiem, ale nie chcę, żeby "etapy" zamieniły się w wieczne odkładanie.',
      },
      {
        id: 'A_TIMING_VAGUE',
        text: 'Trudno mi teraz podawać konkretne daty. Wiele zależy od sytuacji.',
        points: -2,
        reaction: 'Właśnie tego się obawiałem. Znów brak konkretów — dokładnie tak jak poprzednim razem.',
      },
    ],
  },
  {
    id: 'A_WHAT',
    playerText: 'Co dokładnie obiecujesz? Podwyżkę pensji, dłuższy kontrakt, nową rolę? Chcę wiedzieć, o czym mówimy.',
    answers: [
      {
        id: 'A_WHAT_SALARY',
        text: 'Przede wszystkim wyraźna podwyżka pensji, adekwatna do twojego wkładu dla drużyny. To jest fundament.',
        points: 3,
        reaction: 'To brzmi poważnie. Pensja to coś konkretnego — mam to zapamiętane.',
      },
      {
        id: 'A_WHAT_ALL',
        text: 'Kompleksowy pakiet — pensja, warunki, rola. Siądziemy i omówimy wszystko razem.',
        points: 2,
        reaction: 'Jeśli to nie jest puste słowo, jestem otwarty na taką rozmowę.',
      },
      {
        id: 'A_WHAT_UNCLEAR',
        text: 'To zależy od możliwości finansowych klubu w danym momencie. Nie mogę obiecywać konkretów z wyprzedzeniem.',
        points: -1,
        reaction: 'Czyli dalej nie wiem, co mi obiecujesz. Dla mnie to nie jest obietnica — to jest gra na czas.',
      },
    ],
  },
  {
    id: 'A_FALLBACK',
    playerText: 'A jeśli nie dojdziemy do porozumienia? Czy wtedy otworzysz mi drogę do odejścia?',
    answers: [
      {
        id: 'A_FALLBACK_YES',
        text: 'Jeśli uczciwie nie znajdziemy wspólnego języka — nie będę cię tu trzymał siłą. Otworzę ci drogę.',
        points: 3,
        reaction: 'To jest uczciwe. Daję ci tę szansę. Pamiętam każde słowo tej rozmowy.',
      },
      {
        id: 'A_FALLBACK_TRY',
        text: 'Zależy mi na tym, żebyś został. Ale rozumiem, że nie mogę oczekiwać lojalności bez konkretów.',
        points: 2,
        reaction: 'Doceniam szczerość. Zobaczymy, czy słowa przełożą się na działanie.',
      },
      {
        id: 'A_FALLBACK_NO',
        text: 'Masz kontrakt i dopóki on obowiązuje, nie rozmawiamy o transferze.',
        points: -2,
        reaction: 'Czyli złapałeś mnie w pułapkę z obietnicą. Zapamiętam tę odpowiedź.',
      },
    ],
  },
];

/**
 * Ścieżka B (ALLOW_END_OF_SEASON) — 1 pytanie gracza o gwarancję odejścia.
 * Maks wynik: 3 punkty.
 * Pytanie dotyczy tego, czy obietnica jest bezwarunkowa i wiążąca.
 */
const QUESTIONS_B: TransferRequestDialogQuestion[] = [
  {
    id: 'B_GUARANTEE',
    playerText: 'Czy to jest pewne? Chcę wiedzieć, że po sezonie nie pojawią się nowe warunki ani preteksty, żeby mnie zatrzymać.',
    answers: [
      {
        id: 'B_GUARANTEE_FIRM',
        text: 'Masz moje słowo. Po zakończeniu sezonu będziesz mógł odejść bez żadnych przeszkód z mojej strony.',
        points: 3,
        reaction: 'To jest jasne i uczciwe. Dotrzymaj słowa — to wszystko, o co proszę.',
      },
      {
        id: 'B_GUARANTEE_CONDITIONAL',
        text: 'Tak — pod warunkiem, że przez resztę sezonu dajesz z siebie absolutnie wszystko dla drużyny.',
        points: 1,
        reaction: 'Zawsze gram na sto procent. Ale ten warunek mnie trochę niepokoi — co jeśli zdaniem trenera "to nie wszystko"?',
      },
      {
        id: 'B_GUARANTEE_UNSURE',
        text: 'Będziemy rozmawiać kiedy nadejdzie ten czas. Nie chcę obiecywać czegoś z takim wyprzedzeniem.',
        points: -2,
        reaction: 'To nie jest odpowiedź. To kolejne odkładanie decyzji. Nie wiem, czemu w ogóle to uzgadniamy.',
      },
    ],
  },
];

/**
 * Ścieżka C (REFUSE_IMPORTANT) — 2 pytania gracza kwestionujące odmowę.
 * Maks wynik: 6 punktów (2 × 3).
 * Pytania dotyczą: dlaczego nie może sprawdzić ofert, co on sam ma z tej decyzji.
 */
const QUESTIONS_C: TransferRequestDialogQuestion[] = [
  {
    id: 'C_WHY',
    playerText: 'Nie proszę o odejście — proszę o możliwość sprawdzenia rynku. Dlaczego nie mogę przynajmniej posłuchać ofert?',
    answers: [
      {
        id: 'C_WHY_UNDERSTAND',
        text: 'Rozumiem, że chcesz znać swoje opcje. Ale teraz twój spokój i skupienie są kluczowe dla całej drużyny.',
        points: 3,
        reaction: 'Przynajmniej słyszę zrozumienie. Choć to dla mnie bardzo trudna sytuacja.',
      },
      {
        id: 'C_WHY_VALUE',
        text: 'Bo twoja pozycja jest zbyt ważna — nie możemy ryzykować destabilizacji przez otwarte okno transferowe.',
        points: 2,
        reaction: 'Cenię to, że jestem ważny. Ale nie chcę, żeby to stało się wymówką na zawsze.',
      },
      {
        id: 'C_WHY_HARD_NO',
        text: 'Bo tak zdecydowałem i nie podlega to dyskusji.',
        points: -3,
        reaction: 'Rozumiem, że tu nie ma miejsca na moje zdanie. To mówi mi bardzo dużo.',
      },
    ],
  },
  {
    id: 'C_BENEFIT',
    playerText: 'Co ja z tego mam? Klub chroni swój interes — rozumiem to. Ale kto chroni mój?',
    answers: [
      {
        id: 'C_BENEFIT_FUTURE',
        text: 'Zostanie tu w tej formie to też inwestycja w twoją karierę. Obiecuję, że to przyniesie ci konkretne korzyści.',
        points: 3,
        reaction: 'Jeśli to nie jest puste słowo — trzymam cię za słowo. Pamiętam tę obietnicę.',
      },
      {
        id: 'C_BENEFIT_TEAM',
        text: 'Tu chodzi o więcej niż jedną osobę. Jesteś przykładem dla całej szatni — i to też ma realną wartość.',
        points: 1,
        reaction: 'Zawsze grałem dla drużyny. Mam tylko nadzieję, że to nie jest ostatnie słowo na ten temat.',
      },
      {
        id: 'C_BENEFIT_AUTHORITY',
        text: 'W piłce są decyzje podejmowane przez klub. To jest jedna z nich.',
        points: -3,
        reaction: 'Rozumiem komunikat. Moje zdanie się tu nie liczy. Zapamiętam to.',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Funkcje pomocnicze
// ─────────────────────────────────────────────────────────────────────────────

/** Deterministyczny RNG na bazie seeda (bez Math.random). */
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 7919) * 10000;
  return x - Math.floor(x);
};

/** Deterministyczny hash stringa na liczbę całkowitą. */
const stableHash = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

/**
 * Oblicza % podwyżki losowo wybrany przez zawodnika (ścieżka A, AGREED lub THINKING).
 *
 * Algorytm: każdemu poziomowi z POSSIBLE_RAISES przypisywana jest waga.
 * Wyższy coachTrust → gracz ufa trenerowi i prosi o mniejszą podwyżkę.
 * Wyższy transferOpenness lub conflictLevel → gracz chce odejść i żąda więcej.
 *
 * Kalibracja: zmień wagi poniżej lub rozszerz pulę POSSIBLE_RAISES.
 */
const pickSalaryRaisePct = (player: Player, seed: number): number => {
  const mindset = player.playerMindset;
  const coachTrust = mindset?.coachTrust ?? 50;
  const transferOpenness = mindset?.transferOpenness ?? 50;
  const conflictLevel = mindset?.conflictLevel ?? 50;
  const loyalty = Math.max(1, Math.min(99, player.lojalnosc ?? 50));

  // Waga rośnie dla wyższych % przy wysokim konflikcie/otwartości na transfer,
  // a maleje dla wyższych % przy wysokim zaufaniu do trenera.
  const weights = POSSIBLE_RAISES.map((_, i) => {
    let w = 1.0;
    if (coachTrust > 60) w += (POSSIBLE_RAISES.length - 1 - i) * 0.12; // preferuje niższe %
    if (loyalty > 60) w += (POSSIBLE_RAISES.length - 1 - i) * 0.08;    // lojalny częściej wybiera niższą podwyżkę
    if (loyalty < 40) w += i * 0.08;                                   // niska lojalność podbija żądania
    if (transferOpenness > 60) w += i * 0.15;  // preferuje wyższe %
    if (conflictLevel > 50) w += i * 0.10;     // preferuje wyższe %
    return Math.max(0.1, w);
  });

  const total = weights.reduce((a, b) => a + b, 0);
  const rand = seededRandom(seed + 42) * total;
  let cumulative = 0;
  for (let i = 0; i < POSSIBLE_RAISES.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) return POSSIBLE_RAISES[i];
  }
  return POSSIBLE_RAISES[POSSIBLE_RAISES.length - 1];
};

/**
 * Oblicza reakcję gracza na daną ścieżkę + wynik dialogu.
 *
 * Zwraca reakcję (AGREED / THINKING / REFUSED) oraz ewentualną liczbę dni oczekiwania.
 *
 * Kalibracja: zmień AGREED_THRESHOLD i THINKING_THRESHOLD powyżej,
 * lub wagi poszczególnych czynników w blokach if poniżej.
 */
const computePlayerReaction = (
  player: Player,
  choice: TransferRequestManagerChoice,
  dialogScore: number,
  maxDialogScore: number,
  seed: number
): { reaction: TransferRequestPlayerReaction; delayDays: number | null } => {
  // Ścieżka D zawsze daje REFUSED bez losowania
  if (choice === 'REFUSE_NO_TALK') {
    return { reaction: 'REFUSED', delayDays: null };
  }

  const mindset = player.playerMindset;
  const coachTrust = mindset?.coachTrust ?? 50;
  const conflictLevel = mindset?.conflictLevel ?? 50;
  const transferOpenness = mindset?.transferOpenness ?? 50;
  const morale = player.morale ?? 50;
  const loyalty = Math.max(1, Math.min(99, player.lojalnosc ?? 50));
  const personality: PlayerMoralePersonality = player.moralePersonality ?? 'CALM';

  // Znormalizowany wynik dialogu [0, 1]
  const dialogRatio = maxDialogScore > 0 ? Math.max(0, dialogScore) / maxDialogScore : 0;

  let chance = 0;

  if (choice === 'PROMISE_CONTRACT') {
    // Zaufanie do trenera ma największy wpływ; wysoka gotowość na transfer utrudnia przekonanie
    chance = (coachTrust / 100) * 0.35
      + dialogRatio * 0.30
      + ((100 - transferOpenness) / 100) * 0.20
      + ((100 - conflictLevel) / 100) * 0.15;

  } else if (choice === 'ALLOW_END_OF_SEASON') {
    // Gracz głównie chce pewności że MOŻE odejść; wysoka otwartość = łatwiej zaakceptować
    chance = (transferOpenness / 100) * 0.30
      + dialogRatio * 0.35
      + ((100 - conflictLevel) / 100) * 0.20
      + (coachTrust / 100) * 0.15;

  } else if (choice === 'REFUSE_IMPORTANT') {
    // Najtrudniejsza ścieżka — wymaga wysokiego zaufania i dobrego dialogu
    chance = (coachTrust / 100) * 0.40
      + dialogRatio * 0.35
      + ((100 - conflictLevel) / 100) * 0.15
      + ((100 - transferOpenness) / 100) * 0.10;
  }

  // Modyfikator osobowości
  // Kalibracja: zmień wartości poniżej (zakres zazwyczaj -0.25 do +0.20)
  const personalityMods: Partial<Record<PlayerMoralePersonality, number>> = {
    LOYAL: 0.15,       // lojalny łatwiej przyjmuje argumenty managera
    CALM: 0.05,
    SENSITIVE: 0.05,
    PROFESSIONAL: 0.05,
    NERVOUS: -0.05,
    CONFIDENT: -0.05,
    AMBITIOUS: -0.12,  // ambitny jest trudniejszy do przekonania
    EGOIST: -0.22,     // egoist jest najtrudniejszy
  };
  chance += personalityMods[personality] ?? 0;

  // Modyfikator lojalności: 1 daje ok. -12%, 50 neutralnie, 99 ok. +12%.
  // Działa niezależnie od osobowości LOYAL, bo to osobny liczbowy atrybut zawodnika.
  chance += ((loyalty - 50) / 49) * 0.12;

  // Modyfikator morale — bardzo niskie morale prawie zawsze kończy się REFUSED
  if (morale < 20) chance -= 0.25;
  else if (morale < 35) chance -= 0.15;
  else if (morale >= 65) chance += 0.10;

  // RNG ±10% (seed deterministyczny, wynik ten sam przy tym samym seedzie)
  chance += seededRandom(seed) * 0.20 - 0.10;
  chance = Math.max(0, Math.min(1, chance));

  if (chance >= AGREED_THRESHOLD) {
    return { reaction: 'AGREED', delayDays: null };
  } else if (chance >= THINKING_THRESHOLD) {
    const delayDays = MIN_THINKING_DAYS + Math.floor(seededRandom(seed + 17) * THINKING_DAYS_RANGE);
    return { reaction: 'THINKING', delayDays };
  } else {
    return { reaction: 'REFUSED', delayDays: null };
  }
};

/**
 * Oblicza efekty na morale i mindset zależnie od ścieżki i reakcji.
 * Kalibracja: zmień wartości poniżej. Ujemne conflictLevel = spada konflikt (dobrze).
 */
const computeEffects = (
  choice: TransferRequestManagerChoice,
  reaction: TransferRequestPlayerReaction
): {
  moraleDelta: number;
  mindsetDeltas: TransferRequestDialogResult['mindsetDeltas'];
} => {
  if (choice === 'REFUSE_NO_TALK') {
    return { moraleDelta: -6, mindsetDeltas: { coachTrust: -20, conflictLevel: 15 } };
  }

  if (choice === 'PROMISE_CONTRACT') {
    if (reaction === 'AGREED') return { moraleDelta: 3, mindsetDeltas: { coachTrust: 5, conflictLevel: -8, transferOpenness: -10 } };
    if (reaction === 'THINKING') return { moraleDelta: 1, mindsetDeltas: { coachTrust: 2, conflictLevel: -3, transferOpenness: -5 } };
    return { moraleDelta: -4, mindsetDeltas: { coachTrust: -10, conflictLevel: 12, transferOpenness: 8 } };
  }

  if (choice === 'ALLOW_END_OF_SEASON') {
    if (reaction === 'AGREED') return { moraleDelta: 5, mindsetDeltas: { clubHappiness: 5, conflictLevel: -10, transferOpenness: -5 } };
    if (reaction === 'THINKING') return { moraleDelta: 2, mindsetDeltas: { clubHappiness: 2, conflictLevel: -5 } };
    return { moraleDelta: -3, mindsetDeltas: { conflictLevel: 8, transferOpenness: 5 } };
  }

  // REFUSE_IMPORTANT
  if (reaction === 'AGREED' || reaction === 'THINKING') {
    return { moraleDelta: 1, mindsetDeltas: { coachTrust: 3, conflictLevel: -5 } };
  }
  return { moraleDelta: -5, mindsetDeltas: { coachTrust: -8, conflictLevel: 15, transferOpenness: 10 } };
};

/**
 * Buduje tekst tytułu i podsumowania wyniku dialogu.
 */
const buildSummary = (
  choice: TransferRequestManagerChoice,
  reaction: TransferRequestPlayerReaction,
  promise: TransferContractPromise | null
): { title: string; summary: string } => {
  if (choice === 'REFUSE_NO_TALK') {
    return {
      title: 'Trener odmówił rozmowy',
      summary: 'Zawodnik czuje się zignorowany. Napięcie w relacji z trenerem wzrosło. Gracz nadal chce znaleźć się na liście transferowej.',
    };
  }

  if (choice === 'PROMISE_CONTRACT') {
    if (reaction === 'AGREED') return { title: 'Zawodnik przyjął obietnicę', summary: `Zawodnik zaakceptował obietnicę lepszego kontraktu. Oczekuje podwyżki o ${promise?.salaryRaisePct ?? '?'}% przed końcem sezonu. Gracz będzie to pamiętał.` };
    if (reaction === 'THINKING') return { title: 'Zawodnik się zastanawia', summary: `Zawodnik przyjął propozycję do przemyślenia. Oczekuje podwyżki o ${promise?.salaryRaisePct ?? '?'}%. Odpowie w ciągu kilku dni.` };
    return { title: 'Obietnica nie przekonała gracza', summary: 'Zawodnik nie uwierzył w obietnicę kontraktu. Nadal dąży do wystawienia na listę transferową.' };
  }

  if (choice === 'ALLOW_END_OF_SEASON') {
    if (reaction === 'AGREED') return { title: 'Zawodnik zaakceptował plan', summary: 'Zawodnik zgadza się zostać do końca sezonu. Trener musi dotrzymać słowa i wystawić go na listę po sezonie.' };
    if (reaction === 'THINKING') return { title: 'Zawodnik się zastanawia', summary: 'Zawodnik przemyśli propozycję odejścia po sezonie. Odpowie w ciągu kilku dni.' };
    return { title: 'Zawodnik odrzucił plan', summary: 'Zawodnik uznał termin za zbyt odległy lub propozycję za niewiążącą. Napięcie wzrosło.' };
  }

  // REFUSE_IMPORTANT
  if (reaction === 'AGREED' || reaction === 'THINKING') return { title: 'Zawodnik przyjął odmowę', summary: 'Zawodnik przyjął argumenty trenera, choć niechętnie. Sytuacja jest stabilna — ale tymczasowa.' };
  return { title: 'Zawodnik odrzuca odmowę', summary: 'Zawodnik nie zaakceptował odmowy. Konflikt narasta. Gracz może w przyszłości ponownie domagać się transferu.' };
};

// ─────────────────────────────────────────────────────────────────────────────
// SERWIS — eksportowane metody
// ─────────────────────────────────────────────────────────────────────────────

export const PlayerTransferRequestDialogService = {

  /** Zwraca listę pytań dla wybranej ścieżki managera (pusta dla D). */
  getQuestionsForChoice: (choice: TransferRequestManagerChoice): TransferRequestDialogQuestion[] => {
    if (choice === 'PROMISE_CONTRACT') return QUESTIONS_A;
    if (choice === 'ALLOW_END_OF_SEASON') return QUESTIONS_B;
    if (choice === 'REFUSE_IMPORTANT') return QUESTIONS_C;
    return [];
  },

  /** Zwraca maks możliwy wynik dla danej ścieżki (suma punktów przy wszystkich +3). */
  getMaxScore: (choice: TransferRequestManagerChoice): number => {
    if (choice === 'PROMISE_CONTRACT') return QUESTIONS_A.length * 3;
    if (choice === 'ALLOW_END_OF_SEASON') return QUESTIONS_B.length * 3;
    if (choice === 'REFUSE_IMPORTANT') return QUESTIONS_C.length * 3;
    return 0;
  },

  /**
   * Tworzy nową sesję sub-dialogu dla wybranej ścieżki.
   * Wywoływane przez modal po kliknięciu jednego z 4 przycisków wyboru ścieżki.
   */
  createSession: (choice: TransferRequestManagerChoice): TransferRequestDialogSession => ({
    managerChoice: choice,
    questions: PlayerTransferRequestDialogService.getQuestionsForChoice(choice),
    currentQuestionIndex: 0,
    score: 0,
    lastReaction: null,
  }),

  /**
   * Rejestruje odpowiedź managera w sesji i zwraca zaktualizowaną sesję.
   * Wywoływane przez modal po kliknięciu jednej z opcji odpowiedzi.
   */
  answer: (
    session: TransferRequestDialogSession,
    answerId: string
  ): TransferRequestDialogSession => {
    const question = session.questions[session.currentQuestionIndex];
    if (!question) return session;
    const chosen = question.answers.find(a => a.id === answerId);
    if (!chosen) return session;
    return {
      ...session,
      currentQuestionIndex: session.currentQuestionIndex + 1,
      score: session.score + chosen.points,
      lastReaction: chosen.reaction,
    };
  },

  /**
   * Finalizuje dialog i oblicza pełny wynik.
   * Wywoływane przez modal po zakończeniu wszystkich pytań.
   *
   * @param session        aktywna sesja sub-dialogu (null tylko dla ścieżki D)
   * @param player         zawodnik, z którym trwa rozmowa
   * @param choice         wybrana ścieżka managera
   * @param currentDate    bieżąca data gry
   * @param seasonEndDate  koniec sezonu (deadline obietnic A i B)
   * @param seed           seed RNG z GameContext.sessionSeed
   */
  finish: (
    session: TransferRequestDialogSession | null,
    player: Player,
    choice: TransferRequestManagerChoice,
    currentDate: Date,
    seasonEndDate: Date,
    seed: number
  ): TransferRequestDialogResult => {
    const dialogScore = session?.score ?? 0;
    const maxScore = PlayerTransferRequestDialogService.getMaxScore(choice);

    // Seed deterministyczny: ten sam wynik dla tego samego gracza/daty/seeda
    const playerSeed = stableHash(
      `${player.id}_TRANSFER_REQUEST_${currentDate.toISOString().slice(0, 10)}_${seed}`
    );

    const { reaction, delayDays } = computePlayerReaction(player, choice, dialogScore, maxScore, playerSeed);
    const { moraleDelta, mindsetDeltas } = computeEffects(choice, reaction);

    // ── Obietnica kontraktowa (ścieżka A, tylko gdy AGREED lub THINKING) ──────
    let promiseMade: TransferContractPromise | null = null;
    if (choice === 'PROMISE_CONTRACT' && (reaction === 'AGREED' || reaction === 'THINKING')) {
      const raisePct = pickSalaryRaisePct(player, playerSeed + 99);
      promiseMade = {
        madeAt: currentDate.toISOString(),
        deadlineAt: seasonEndDate.toISOString(),
        salaryRaisePct: raisePct,
        reminderSentAt: null,
        broken: false,
      };
    }

    // ── Flaga odejścia po sezonie (ścieżka B, tylko gdy AGREED lub THINKING) ──
    const allowAfterSeasonFlag =
      choice === 'ALLOW_END_OF_SEASON' && (reaction === 'AGREED' || reaction === 'THINKING');

    // ── Oczekująca odpowiedź (tylko gdy THINKING) ─────────────────────────────
    let pendingResponse: TransferRequestPendingResponse | null = null;
    if (reaction === 'THINKING' && delayDays !== null && choice !== 'REFUSE_NO_TALK') {
      const responseDate = new Date(currentDate);
      responseDate.setDate(responseDate.getDate() + delayDays);
      pendingResponse = {
        managerChoice: choice as 'PROMISE_CONTRACT' | 'ALLOW_END_OF_SEASON' | 'REFUSE_IMPORTANT',
        responseExpectedBy: responseDate.toISOString(),
        dialogScore,
        promisedRaisePct: promiseMade?.salaryRaisePct ?? null,
      };
    }

    const { title, summary } = buildSummary(choice, reaction, promiseMade);

    return {
      managerChoice: choice,
      reaction,
      responseDelayDays: delayDays,
      moraleDelta,
      mindsetDeltas,
      promiseMade,
      allowAfterSeasonFlag,
      pendingResponse,
      title,
      summary,
    };
  },

  // ── DAILY CHECKS ────────────────────────────────────────────────────────────
  // Poniższe trzy metody są wywoływane codziennie z GameContext.advanceDay.
  // Każda zwraca { player, mails } — zaktualizowanego gracza i ewentualne maile.
  // GameContext odpowiada za zapisanie gracza i wstawienie maili do skrzynki.
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Sprawdza oczekującą odpowiedź gracza (THINKING).
   * Jeśli deadline minął → gracz podejmuje ostateczną decyzję (AGREED lub REFUSED).
   * Wynik trafia do skrzynki jako mail TRANSFER_REQUEST_PLAYER_RESPONSE.
   * Skutki morale/mindset są dołączone do zwróconego gracza.
   */
  reviewPendingResponse: (
    player: Player,
    currentDate: Date,
    seed: number
  ): TransferRequestReviewResult => {
    const pending = player.transferRequestPendingResponse;
    if (!pending) return { player, mails: [] };

    const deadline = new Date(pending.responseExpectedBy);
    if (currentDate < deadline) return { player, mails: [] };

    // Deadline minął — oblicz ostateczną decyzję gracza
    const playerSeed = stableHash(
      `${player.id}_PENDING_FINAL_${currentDate.toISOString().slice(0, 10)}_${seed}`
    );
    const maxScore = PlayerTransferRequestDialogService.getMaxScore(pending.managerChoice);
    const { reaction } = computePlayerReaction(
      player,
      pending.managerChoice,
      pending.dialogScore,
      maxScore,
      playerSeed
    );

    // THINKING nie może być wynikiem finalnym — traktuj jako REFUSED
    const finalReaction: 'AGREED' | 'REFUSED' = reaction === 'THINKING' ? 'REFUSED' : reaction;
    const { moraleDelta, mindsetDeltas } = computeEffects(pending.managerChoice, finalReaction);

    // Zastosuj efekty
    let updated = PlayerMoraleService.withMoraleChange(
      player,
      moraleDelta,
      finalReaction === 'AGREED'
        ? 'Gracz podjął decyzję po czasie zastanowienia — akceptuje'
        : 'Gracz podjął decyzję po czasie zastanowienia — odmawia',
      currentDate
    );
    updated = PlayerMoraleService.withMindsetChange(updated, mindsetDeltas, 'Transfer Request — finalna odpowiedź', currentDate);

    // Buduj tytuł maila
    const choiceLabel =
      pending.managerChoice === 'PROMISE_CONTRACT' ? 'obietnicy kontraktu' :
      pending.managerChoice === 'ALLOW_END_OF_SEASON' ? 'planu odejścia po sezonie' :
      'odmowy transferu';

    const body = finalReaction === 'AGREED'
      ? `Trenerze,\n\nPo przemyśleniu akceptuję Twoją propozycję dotyczącą ${choiceLabel}. Rozumiem stanowisko i jestem gotów działać zgodnie z ustaleniami.\n\n${player.firstName} ${player.lastName}`
      : `Trenerze,\n\nPo przemyśleniu nie mogę zaakceptować propozycji dotyczącej ${choiceLabel}. Moja sytuacja pozostaje nierozwiązana i nadal liczę na inne wyjście.\n\n${player.firstName} ${player.lastName}`;

    const mail: MailMessage = {
      id: `transfer-request-response-${player.id}-${currentDate.toISOString().slice(0, 10)}`,
      sender: `${player.firstName} ${player.lastName}`,
      role: 'Zawodnik',
      subject: `${player.lastName}: odpowiedź po czasie zastanowienia`,
      body,
      date: new Date(currentDate),
      isRead: false,
      type: MailType.STAFF,
      priority: 4,
      metadata: {
        type: 'TRANSFER_REQUEST_PLAYER_RESPONSE',
        playerId: player.id,
        reaction: finalReaction,
        managerChoice: pending.managerChoice,
        promisedRaisePct: pending.promisedRaisePct,
      } as any,
    };

    // Jeśli AGREED i to była ścieżka B — ustaw flagę allowAfterSeason
    const wasPathB = pending.managerChoice === 'ALLOW_END_OF_SEASON';
    const wasPathA = pending.managerChoice === 'PROMISE_CONTRACT';

    updated = {
      ...updated,
      transferRequestPendingResponse: null,
      // Jeśli AGREED i B: ustaw transferAllowAfterSeason (GameContext musi też ustawić deadline)
      transferAllowAfterSeason: finalReaction === 'AGREED' && wasPathB ? true : updated.transferAllowAfterSeason,
      // Jeśli AGREED i A: ustaw obietnicę (dane są w mailu.metadata.promisedRaisePct)
      // GameContext musi odczytać promisedRaisePct z maila i zbudować TransferContractPromise
    };

    // Usuń demand jeśli AGREED
    if (finalReaction === 'AGREED' && (wasPathA || wasPathB)) {
      updated = { ...updated, transferListDemandUntil: null };
    }

    // Jeśli REFUSED na ścieżce C — przywróć demand (gracz nadal chce listy)
    if (finalReaction === 'REFUSED' && pending.managerChoice === 'REFUSE_IMPORTANT') {
      // GameContext może chcieć odnowić demand — decyzja po stronie GameContext
    }

    return { player: updated, mails: [mail] };
  },

  /**
   * Sprawdza obietnicę kontraktową (ścieżka A).
   * 14 dni przed deadlineAt: wysyła mail-przypomnienie TRANSFER_CONTRACT_PROMISE_REMINDER.
   * Po deadlineAt: oznacza jako broken + wysyła mail TRANSFER_CONTRACT_PROMISE_BROKEN.
   *
   * Kary za złamanie (conflictLevel +25, coachTrust −30, morale −16) są tu stosowane.
   * Wywoływane codziennie z GameContext.advanceDay.
   */
  reviewContractPromise: (
    player: Player,
    currentDate: Date
  ): TransferRequestReviewResult => {
    const promise = player.transferContractPromise;
    if (!promise || promise.broken) return { player, mails: [] };

    const deadline = new Date(promise.deadlineAt);
    const reminderDate = new Date(deadline);
    reminderDate.setDate(reminderDate.getDate() - CONTRACT_PROMISE_REMINDER_DAYS_BEFORE);

    const mails: MailMessage[] = [];

    // ── Wyślij przypomnienie 14 dni przed deadline ─────────────────────────
    if (!promise.reminderSentAt && currentDate >= reminderDate && currentDate < deadline) {
      const mail: MailMessage = {
        id: `transfer-promise-reminder-${player.id}-${currentDate.toISOString().slice(0, 10)}`,
        sender: `${player.firstName} ${player.lastName}`,
        role: 'Zawodnik',
        subject: `Przypomnienie od ${player.lastName}: obietnica nowego kontraktu`,
        body: `Trenerze,\n\nChciałem przypomnieć o obietnicy, którą mi złożyłeś. Czekam na propozycję nowego kontraktu z podwyżką wynoszącą przynajmniej ${promise.salaryRaisePct}%. Sezon dobiega końca — zostało już mało czasu.\n\nLiczę na Twoje słowo.\n\n${player.firstName} ${player.lastName}`,
        date: new Date(currentDate),
        isRead: false,
        type: MailType.STAFF,
        priority: 4,
        metadata: {
          type: 'TRANSFER_CONTRACT_PROMISE_REMINDER',
          playerId: player.id,
          salaryRaisePct: promise.salaryRaisePct,
          deadlineAt: promise.deadlineAt,
        } as any,
      };
      mails.push(mail);
      return {
        player: {
          ...player,
          transferContractPromise: { ...promise, reminderSentAt: currentDate.toISOString() },
        },
        mails,
      };
    }

    // ── Deadline minął → złamanie obietnicy ──────────────────────────────────
    if (currentDate > deadline) {
      const mail: MailMessage = {
        id: `transfer-promise-broken-${player.id}-${currentDate.toISOString().slice(0, 10)}`,
        sender: `${player.firstName} ${player.lastName}`,
        role: 'Zawodnik',
        subject: `${player.lastName} czuje się oszukany`,
        body: `Trenerze,\n\nObiecałeś mi lepszy kontrakt. Sezon się skończył, a propozycja nigdy nie nadeszła. Czuję się zdradzony przez kogoś, komu zaufałem.\n\nMoja relacja z tobą uległa poważnemu nadwyrężeniu. Nie wiem, jak mam teraz podchodzić do pracy w tym klubie.\n\n${player.firstName} ${player.lastName}`,
        date: new Date(currentDate),
        isRead: false,
        type: MailType.STAFF,
        priority: 5,
        metadata: {
          type: 'TRANSFER_CONTRACT_PROMISE_BROKEN',
          playerId: player.id,
          salaryRaisePct: promise.salaryRaisePct,
        } as any,
      };
      mails.push(mail);

      // Kary za złamanie obietnicy: conflictLevel +25, coachTrust −30, morale −16
      let penalizedPlayer = PlayerMoraleService.withMoraleChange(
        {
          ...player,
          transferContractPromise: { ...promise, broken: true },
        },
        -16,
        `Złamana obietnica kontraktu: obiecano +${promise.salaryRaisePct}%, nic nie dostał`,
        currentDate
      );
      penalizedPlayer = PlayerMoraleService.withMindsetChange(
        penalizedPlayer,
        { coachTrust: -30, conflictLevel: 25 },
        'Złamana obietnica kontraktu',
        currentDate
      );

      return {
        player: {
          ...penalizedPlayer,
          transferContractPromise: { ...promise, broken: true },
        },
        mails,
      };
    }

    return { player, mails: [] };
  },

  /**
   * Sprawdza obietnicę odejścia po sezonie (ścieżka B).
   * Jeśli transferAllowAfterSeasonDeadline minął i gracz NIE jest na liście → złamanie.
   * Jeśli gracz Jest na liście → czyść flagi (obietnica spełniona, brak kary).
   *
   * Kary za złamanie (conflictLevel +20, coachTrust −25, morale −6) są tu stosowane.
   * Wywoływane codziennie z GameContext.advanceDay.
   */
  reviewAllowAfterSeason: (
    player: Player,
    currentDate: Date
  ): TransferRequestReviewResult => {
    if (!player.transferAllowAfterSeason || !player.transferAllowAfterSeasonDeadline) {
      return { player, mails: [] };
    }

    // Obietnica spełniona — gracz jest już na liście
    if (player.isOnTransferList) {
      return {
        player: {
          ...player,
          transferAllowAfterSeason: false,
          transferAllowAfterSeasonDeadline: null,
        },
        mails: [],
      };
    }

    const deadline = new Date(player.transferAllowAfterSeasonDeadline);
    if (currentDate <= deadline) return { player, mails: [] };

    // Deadline minął, gracz nie na liście → złamanie obietnicy
    const mail: MailMessage = {
      id: `transfer-after-season-broken-${player.id}-${currentDate.toISOString().slice(0, 10)}`,
      sender: `${player.firstName} ${player.lastName}`,
      role: 'Zawodnik',
      subject: `${player.lastName}: obietnica odejścia po sezonie nie została dotrzymana`,
      body: `Trenerze,\n\nObiecałeś, że po zakończeniu sezonu będę mógł odejść. Sezon minął, a ja nadal nie jestem na liście transferowej.\n\nCzuję się oszukany i nie wiem, czy mogę nadal ufać twoim słowom. Oczekuję wyjaśnienia.\n\n${player.firstName} ${player.lastName}`,
      date: new Date(currentDate),
      isRead: false,
      type: MailType.STAFF,
      priority: 5,
      metadata: {
        type: 'TRANSFER_AFTER_SEASON_BROKEN',
        playerId: player.id,
      } as any,
    };

    // Kary: conflictLevel +20, coachTrust −25, morale −6
    let penalizedPlayer = PlayerMoraleService.withMoraleChange(
      player,
      -6,
      'Złamana obietnica odejścia po sezonie',
      currentDate
    );
    penalizedPlayer = PlayerMoraleService.withMindsetChange(
      penalizedPlayer,
      { coachTrust: -25, conflictLevel: 20 },
      'Złamana obietnica odejścia po sezonie',
      currentDate
    );

    return {
      player: {
        ...penalizedPlayer,
        transferAllowAfterSeason: false,
        transferAllowAfterSeasonDeadline: null,
      },
      mails: [mail],
    };
  },
};
