import type { BriefingSpeech } from '../data/prematch_briefing_pl';
import { BriefingSpeechType, PREMATCH_BRIEFINGS } from '../data/prematch_briefing_pl';
import type { CoachAttributes } from '../types';
import type { LeagueMotivationContext } from './LeagueMotivationContextService';
export { PREMATCH_BRIEFINGS };
export type { BriefingSpeechType };

export type BriefingScenario = 'UNDERDOG' | 'EQUAL' | 'FAVORITE';
export type BriefingMatchStage = 'LEAGUE' | 'FRIENDLY' | 'CUP' | 'CUP_SEMIFINAL' | 'CUP_FINAL';

export interface ScenarioBriefingOption extends BriefingSpeech {
  originalIndex: number;
}

export interface BriefingEffect {
  actionMod: number;
  goalMod: number;
  momentumBonus: number;
  expiryMinute: number;
  fatigueMult: number;
  rivalBoost: number;
  /**
   * Direct open-play suppression applied against the user team when the opponent has
   * a tactical read on a repeated plan. This stays optional because most briefing
   * effects motivate one side only; the match engine only reads it from AI briefing
   * packages that explicitly punish user predictability.
   */
  userActionSuppression?: number;
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

const BRIEFING_SCENARIO_RULES: Record<BriefingSpeechType, BriefingScenario[]> = {
  UPRISING: ['UNDERDOG'],
  FORTRESS: ['UNDERDOG', 'EQUAL'],
  WOUNDED_PRIDE: ['UNDERDOG', 'EQUAL'],
  KAMIKAZE: ['UNDERDOG', 'EQUAL'],
  TACTICIAN: ['UNDERDOG', 'EQUAL', 'FAVORITE'],
  BLITZ: ['UNDERDOG', 'EQUAL', 'FAVORITE'],
  PATIENCE: ['UNDERDOG', 'EQUAL', 'FAVORITE'],
  PROFESSIONALISM: ['UNDERDOG', 'EQUAL', 'FAVORITE'],
  LOOSE: ['FAVORITE'],
  DOMINANCE: ['EQUAL', 'FAVORITE'],
};

type CupBriefingStage = Exclude<BriefingMatchStage, 'LEAGUE' | 'FRIENDLY'>;

const FRIENDLY_PREMATCH_BRIEFINGS: BriefingSpeech[] = [
  { id: 'FR_PB_1', text: 'To sparing, ale nie spacer. Chcę zobaczyć odwagę, zaangażowanie i reakcję na mocniejszego rywala.', hiddenType: 'UPRISING' },
  { id: 'FR_PB_2', text: 'Gramy odpowiedzialnie. Najważniejsze są organizacja, asekuracja i dobre nawyki bez niepotrzebnego ryzyka.', hiddenType: 'FORTRESS' },
  { id: 'FR_PB_3', text: 'To dobry moment, żeby pokazać charakter. Nie gramy o punkty, ale gramy o zaufanie i miejsce w zespole.', hiddenType: 'WOUNDED_PRIDE' },
  { id: 'FR_PB_4', text: 'Chcę intensywności od pierwszej minuty. Sparing ma nam dać odpowiedź, kto jest gotowy na większe obciążenia.', hiddenType: 'KAMIKAZE' },
  { id: 'FR_PB_5', text: 'Trzymamy się planu. Testujemy założenia, podejmujemy dobre decyzje i uczymy się z każdej sytuacji.', hiddenType: 'TACTICIAN' },
  { id: 'FR_PB_6', text: 'Zacznijmy wysoko i aktywnie. Chcę zobaczyć pressing, szybki odbiór i energię po stracie piłki.', hiddenType: 'BLITZ' },
  { id: 'FR_PB_7', text: 'Nie forsujemy tempa bez sensu. Budujemy akcje cierpliwie, utrzymujemy rytm i dbamy o jakość podań.', hiddenType: 'PATIENCE' },
  { id: 'FR_PB_8', text: 'Pełna koncentracja. Sparing ma być profesjonalny: bez prostych strat, bez głupich fauli, bez chaosu.', hiddenType: 'PROFESSIONALISM' },
  { id: 'FR_PB_9', text: 'Podejdźmy do tego spokojnie. Minuty, rytm i zdrowie są dziś równie ważne jak sam wynik.', hiddenType: 'LOOSE' },
  { id: 'FR_PB_10', text: 'Narzucamy swój styl. Chcę widzieć pewność, tempo i zawodników, którzy biorą odpowiedzialność za grę.', hiddenType: 'DOMINANCE' },
];

const CUP_PREMATCH_BRIEFINGS: Record<CupBriefingStage, BriefingSpeech[]> = {
  CUP: [
    { id: 'CUP_PB_1', text: 'To jest puchar. Tu nie ma tabeli, nie ma kalkulacji. Jeden mecz może zmienić wszystko.', hiddenType: 'UPRISING' },
    { id: 'CUP_PB_2', text: 'Gramy mądrze i cierpliwie. Puchar wygrywa ten, kto najlepiej znosi presję.', hiddenType: 'FORTRESS' },
    { id: 'CUP_PB_3', text: 'Nie patrzymy na nazwę rywala. Dzisiaj liczy się tylko awans i nasza odpowiedź na boisku.', hiddenType: 'WOUNDED_PRIDE' },
    { id: 'CUP_PB_4', text: 'Od pierwszego gwizdka chcę widzieć walkę o każdą piłkę. W pucharze nie ma drugiej szansy.', hiddenType: 'KAMIKAZE' },
    { id: 'CUP_PB_5', text: 'Plan jest jasny. Nie dajemy się ponieść emocjom i cierpliwie szukamy momentu.', hiddenType: 'TACTICIAN' },
    { id: 'CUP_PB_6', text: 'Zaczynamy agresywnie. Niech od razu poczują, że ten mecz będzie dla nich ciężki.', hiddenType: 'BLITZ' },
    { id: 'CUP_PB_7', text: 'Puchar potrafi być nerwowy. Zachowujemy spokój, gramy dokładnie i czekamy na swoje szanse.', hiddenType: 'PATIENCE' },
    { id: 'CUP_PB_8', text: 'Pełna koncentracja przez całe spotkanie. Bez prostych strat, bez prezentów, bez paniki.', hiddenType: 'PROFESSIONALISM' },
    { id: 'CUP_PB_9', text: 'Jesteśmy mocniejsi, ale puchar karze pychę. Kontrola, spokój i szacunek do rywala.', hiddenType: 'LOOSE' },
    { id: 'CUP_PB_10', text: 'Narzućmy im nasze tempo. Niech od pierwszej minuty wiedzą, kto chce grać dalej.', hiddenType: 'DOMINANCE' },
  ],
  CUP_SEMIFINAL: [
    { id: 'SF_PB_1', text: 'Jesteśmy o krok od finału. Nikt nie odda nam tego miejsca, musimy je sobie zabrać.', hiddenType: 'UPRISING' },
    { id: 'SF_PB_2', text: 'Półfinał wygrywa się głową. Bronimy razem, atakujemy razem i nie tracimy struktury.', hiddenType: 'FORTRESS' },
    { id: 'SF_PB_3', text: 'Przez cały sezon pracowaliśmy, żeby być w takim meczu. Teraz pokażmy, że tu należymy.', hiddenType: 'WOUNDED_PRIDE' },
    { id: 'SF_PB_4', text: 'To półfinał. Każdy sprint, każdy wślizg i każda decyzja ma prowadzić nas do finału.', hiddenType: 'KAMIKAZE' },
    { id: 'SF_PB_5', text: 'Wiemy, gdzie są ich słabości. Trzymamy się planu i nie pozwalamy emocjom przejąć meczu.', hiddenType: 'TACTICIAN' },
    { id: 'SF_PB_6', text: 'Uderzamy od startu. W półfinale trzeba pokazać odwagę zanim rywal złapie rytm.', hiddenType: 'BLITZ' },
    { id: 'SF_PB_7', text: 'Finał nie musi przyjść w pierwszych minutach. Gramy spokojnie, cierpliwie i konsekwentnie.', hiddenType: 'PATIENCE' },
    { id: 'SF_PB_8', text: 'Półfinał wymaga dojrzałości. Zero głupich fauli, zero rozkojarzenia, pełna odpowiedzialność.', hiddenType: 'PROFESSIONALISM' },
    { id: 'SF_PB_9', text: 'Mamy jakość, żeby wejść do finału. Nie podpalamy się, robimy swoje.', hiddenType: 'LOOSE' },
    { id: 'SF_PB_10', text: 'To jest nasza szansa na finał. Narzucamy tempo, wygrywamy pojedynki i idziemy po swoje.', hiddenType: 'DOMINANCE' },
  ],
  CUP_FINAL: [
    { id: 'FINAL_PB_1', text: 'To jest finał. Dzisiaj możecie zrobić coś, co zostanie z tym klubem na lata.', hiddenType: 'UPRISING' },
    { id: 'FINAL_PB_2', text: 'Finały wygrywa się dyscypliną. Każdy metr boiska bronimy razem i bez paniki.', hiddenType: 'FORTRESS' },
    { id: 'FINAL_PB_3', text: 'Nieważne, co było przed tym meczem. Dzisiaj macie szansę udowodnić wszystko jednym występem.', hiddenType: 'WOUNDED_PRIDE' },
    { id: 'FINAL_PB_4', text: 'Dzisiaj zostawiamy na boisku wszystko. Finał nie wybacza półśrodków.', hiddenType: 'KAMIKAZE' },
    { id: 'FINAL_PB_5', text: 'Trofeum wygrywa drużyna, która ufa planowi. Chłodna głowa, czyste decyzje, pełna koncentracja.', hiddenType: 'TACTICIAN' },
    { id: 'FINAL_PB_6', text: 'Pierwsze minuty mają należeć do nas. Niech od razu poczują, że przyszliśmy po puchar.', hiddenType: 'BLITZ' },
    { id: 'FINAL_PB_7', text: 'Finał może trwać długo. Nie szarpiemy, nie panikujemy, cierpliwie budujemy przewagę.', hiddenType: 'PATIENCE' },
    { id: 'FINAL_PB_8', text: 'To mecz o trofeum. Każda decyzja ma być odpowiedzialna, każda strata naprawiona natychmiast.', hiddenType: 'PROFESSIONALISM' },
    { id: 'FINAL_PB_9', text: 'Jesteśmy gotowi na ten finał. Spokojnie, z klasą, bez lekceważenia rywala.', hiddenType: 'LOOSE' },
    { id: 'FINAL_PB_10', text: 'Dzisiaj nie tylko gramy finał. Dzisiaj mamy go wygrać. Odważnie, wysoko, bez cofania się.', hiddenType: 'DOMINANCE' },
  ],
};

const LEAGUE_STAKES_PREMATCH_BRIEFINGS: Record<LeagueMotivationContext, BriefingSpeech[]> = {
  LAST_ROUND_GENERAL: [
    { id: 'LG_LAST_PB_1', text: 'To ostatni mecz sezonu. Zamykamy go z godnością, koncentracją i pełnym profesjonalizmem.', hiddenType: 'PROFESSIONALISM' },
    { id: 'LG_LAST_PB_2', text: 'Nieważne, co mówi tabela. Ostatni gwizdek sezonu ma pokazać, kim jesteśmy jako drużyna.', hiddenType: 'WOUNDED_PRIDE' },
    { id: 'LG_LAST_PB_3', text: 'Nie szarpiemy się bez sensu. Gramy dojrzale, cierpliwie i kończymy sezon dobrą piłką.', hiddenType: 'PATIENCE' },
    { id: 'LG_LAST_PB_4', text: 'Ostatnia kolejka często zostaje w pamięci. Dajcie kibicom powód, żeby bili wam brawo.', hiddenType: 'DOMINANCE' },
  ],
  TITLE_OR_PROMOTION_SECURED: [
    { id: 'LG_DONE_PB_1', text: 'Cel jest już osiągnięty, ale mistrzowie i drużyny awansujące nie odpuszczają standardów.', hiddenType: 'PROFESSIONALISM' },
    { id: 'LG_DONE_PB_2', text: 'Możemy czuć dumę, ale nie samozadowolenie. Wyjdźcie i pokażcie, dlaczego jesteśmy na szczycie.', hiddenType: 'DOMINANCE' },
    { id: 'LG_DONE_PB_3', text: 'Bez głupiego ryzyka. Gramy spokojnie, z klasą i szacunkiem do pracy wykonanej przez cały sezon.', hiddenType: 'PATIENCE' },
    { id: 'LG_DONE_PB_4', text: 'To ma być święto, ale święto z piłką przy nodze i kontrolą nad meczem.', hiddenType: 'TACTICIAN' },
  ],
  TITLE_DECIDER: [
    { id: 'LG_TITLE_PB_1', text: 'Dzisiaj możemy zostać mistrzami. Nie czekamy na cudze wyniki. Bierzemy to na boisku.', hiddenType: 'DOMINANCE' },
    { id: 'LG_TITLE_PB_2', text: 'Mistrzostwo wygrywa się głową. Każde podanie, każdy odbiór, każda decyzja ma znaczenie.', hiddenType: 'TACTICIAN' },
    { id: 'LG_TITLE_PB_3', text: 'Remis może wystarczyć, ale nie wychodzimy po remis. Wychodzimy po pewność i kontrolę.', hiddenType: 'PROFESSIONALISM' },
    { id: 'LG_TITLE_PB_4', text: 'Przez cały sezon pracowaliście na tę chwilę. Teraz nie wolno zrobić kroku w tył.', hiddenType: 'KAMIKAZE' },
  ],
  DIRECT_PROMOTION_DECIDER: [
    { id: 'LG_PROMO_PB_1', text: 'Dzisiejszy mecz może dać nam awans. Nie odkładamy marzeń na później, załatwiamy to teraz.', hiddenType: 'DOMINANCE' },
    { id: 'LG_PROMO_PB_2', text: 'Awans wymaga chłodnej głowy. Niech presja pracuje dla nas, nie przeciwko nam.', hiddenType: 'TACTICIAN' },
    { id: 'LG_PROMO_PB_3', text: 'Każdy z was wie, ile kosztował ten sezon. Jeszcze dziewięćdziesiąt minut pełnej odpowiedzialności.', hiddenType: 'PROFESSIONALISM' },
    { id: 'LG_PROMO_PB_4', text: 'Nie patrzcie na tabelę. Patrzcie na piłkę, na rywala i na przestrzeń, którą mamy wykorzystać.', hiddenType: 'PATIENCE' },
  ],
  PLAYOFF_PLACE_DECIDER: [
    { id: 'LG_PLAYOFF_PB_1', text: 'To mecz o baraże. Jedno spotkanie może przedłużyć nasze marzenia o awansie.', hiddenType: 'WOUNDED_PRIDE' },
    { id: 'LG_PLAYOFF_PB_2', text: 'Nie ma kalkulowania. Musimy być odważni, ale mądrzy. Baraże trzeba sobie wyrwać.', hiddenType: 'KAMIKAZE' },
    { id: 'LG_PLAYOFF_PB_3', text: 'Taki mecz wygrywa drużyna, która nie traci struktury pod presją. Trzymamy plan.', hiddenType: 'TACTICIAN' },
    { id: 'LG_PLAYOFF_PB_4', text: 'Od pierwszej minuty niech wiedzą, że walczymy o coś większego niż trzy punkty.', hiddenType: 'BLITZ' },
  ],
  RELEGATION_DECIDER: [
    { id: 'LG_STAY_PB_1', text: 'To jest walka o utrzymanie. Nie gramy pięknie dla ocen, gramy o życie tego klubu w lidze.', hiddenType: 'KAMIKAZE' },
    { id: 'LG_STAY_PB_2', text: 'Presja jest ogromna, ale panika nic nam nie da. Dyscyplina, asekuracja i walka do końca.', hiddenType: 'FORTRESS' },
    { id: 'LG_STAY_PB_3', text: 'Każdy metr boiska ma znaczenie. Jeśli trzeba cierpieć, cierpimy razem.', hiddenType: 'WOUNDED_PRIDE' },
    { id: 'LG_STAY_PB_4', text: 'Nie pozwólcie, żeby strach prowadził ten mecz. Prowadzić ma plan i charakter.', hiddenType: 'TACTICIAN' },
  ],
  EUROPE_PLACE_DECIDER: [
    { id: 'LG_EUROPE_PB_1', text: 'Dzisiaj gramy o miejsce, które może otworzyć klubowi Europę. To jest konkretna stawka.', hiddenType: 'DOMINANCE' },
    { id: 'LG_EUROPE_PB_2', text: 'Puchary zdobywa się dojrzałością. Bez chaosu, bez prezentów, z pełną koncentracją.', hiddenType: 'PROFESSIONALISM' },
    { id: 'LG_EUROPE_PB_3', text: 'To jest mecz dla zawodników, którzy chcą grać na większej scenie. Pokażcie tę ambicję.', hiddenType: 'WOUNDED_PRIDE' },
    { id: 'LG_EUROPE_PB_4', text: 'Narzućmy tempo od początku. Niech rywal poczuje, że to my chcemy Europy bardziej.', hiddenType: 'BLITZ' },
  ],
  ALREADY_RELEGATED: [
    { id: 'LG_DOWN_PB_1', text: 'Spadek jest przesądzony, ale herb nadal jest na koszulce. Ostatnie mecze pokażą nasz charakter.', hiddenType: 'WOUNDED_PRIDE' },
    { id: 'LG_DOWN_PB_2', text: 'Nie odzyskamy tabeli jednym meczem, ale możemy odzyskać trochę dumy i zaufania kibiców.', hiddenType: 'PROFESSIONALISM' },
    { id: 'LG_DOWN_PB_3', text: 'Gramy spokojnie, odpowiedzialnie i bez rozsypywania się. To pierwszy krok do odbudowy.', hiddenType: 'PATIENCE' },
    { id: 'LG_DOWN_PB_4', text: 'Nie uciekamy od bólu tego sezonu. Wychodzimy i walczymy, bo klub zasługuje na reakcję.', hiddenType: 'KAMIKAZE' },
  ],
};

const getBriefingPool = (matchStage: BriefingMatchStage): BriefingSpeech[] =>
  matchStage === 'FRIENDLY'
    ? FRIENDLY_PREMATCH_BRIEFINGS
    : matchStage === 'LEAGUE'
      ? PREMATCH_BRIEFINGS
      : CUP_PREMATCH_BRIEFINGS[matchStage];

export const getBriefingsForScenario = (
  scenario: BriefingScenario,
  matchStage: BriefingMatchStage = 'LEAGUE',
  leagueMotivationContext?: LeagueMotivationContext | null
): ScenarioBriefingOption[] =>
  (matchStage === 'LEAGUE' && leagueMotivationContext
    ? LEAGUE_STAKES_PREMATCH_BRIEFINGS[leagueMotivationContext]
    : getBriefingPool(matchStage))
    .map((speech, originalIndex) => ({ ...speech, originalIndex }))
    .filter((speech) => BRIEFING_SCENARIO_RULES[speech.hiddenType].includes(scenario));

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
    'Zawodnicy krzyczą, wstają, i są wyraźnie podbudowani.',
    'To było mocne przemówienie.',
    'Atomosfera poprawia się. To nie była zwyykła motywacja. To coś zupełnie innego.',
  ],
  SURPRISE_NEG: [
    'Zbyt wiele naraz. Widać, że kilku zawodników myśli za dużo i nie jest skoncentrowanych na meczu.',
    'Cisza taka, jakby ktoś powiedział coś w nieodpowiednim momencie.',
    'Coś poszło nie tak. Kilku zawodników ma nieprzeniknione miny.',
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

export const calculateAiCoachBriefingEffect = (
  ownRep: number,
  opponentRep: number,
  coachAttributes: CoachAttributes | null | undefined,
  seed: number,
  matchStage: BriefingMatchStage = 'LEAGUE',
  leagueMotivationContext?: LeagueMotivationContext | null
): BriefingEffect => {
  const motivation = coachAttributes?.motivation ?? 50;
  const decisionMaking = coachAttributes?.decisionMaking ?? 50;
  const experience = coachAttributes?.experience ?? 50;

  const realScenario = detectScenario(ownRep, opponentRep);
  const rngContext = seededRng(seed, 701);
  const rngType = seededRng(seed, 702);
  const rngNoise = seededRng(seed, 703);

  const readChance = Math.min(
    0.92,
    Math.max(
      0.30,
      0.35 + (decisionMaking / 100) * 0.28 + (experience / 100) * 0.22 + (motivation / 100) * 0.12
    )
  );

  const scenarios: BriefingScenario[] = ['UNDERDOG', 'EQUAL', 'FAVORITE'];
  const selectedScenario = rngContext < readChance
    ? realScenario
    : scenarios[Math.floor(rngContext * scenarios.length)];

  const options = getBriefingsForScenario(selectedScenario, matchStage, leagueMotivationContext);
  if (options.length === 0) return getSilenceEffect();

  const pressureBias = (motivation - 50) / 50;
  const controlBias = ((decisionMaking + experience) / 2 - 50) / 50;
  const preferredTypes: BriefingSpeechType[] =
    realScenario === 'UNDERDOG'
      ? (pressureBias > 0.25 ? ['UPRISING', 'WOUNDED_PRIDE', 'KAMIKAZE'] : ['FORTRESS', 'TACTICIAN', 'PATIENCE'])
      : realScenario === 'FAVORITE'
        ? (controlBias > 0.15 ? ['PROFESSIONALISM', 'TACTICIAN', 'DOMINANCE'] : ['LOOSE', 'DOMINANCE', 'BLITZ'])
        : (pressureBias > 0.2 ? ['BLITZ', 'DOMINANCE', 'WOUNDED_PRIDE'] : ['TACTICIAN', 'PROFESSIONALISM', 'PATIENCE']);

  const preferred = options.filter(option => preferredTypes.includes(option.hiddenType));
  const pool = preferred.length > 0 && rngType < readChance ? preferred : options;
  const chosen = pool[Math.floor(rngType * pool.length)];
  const effectSeed = seed + Math.round((motivation + decisionMaking + experience) * 13) + Math.floor(rngNoise * 1000);

  return calculateBriefingEffect(chosen.hiddenType, realScenario, effectSeed, chosen.originalIndex);
};
