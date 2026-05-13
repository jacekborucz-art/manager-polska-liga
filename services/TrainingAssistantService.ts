import { TRAINING_CYCLES } from '../data/training_definitions_pl';
import { Player, PlayerAttributes, PlayerPosition, TrainingCycle } from '../types';

type TrainableAttribute = Exclude<keyof PlayerAttributes, 'talent'>;

interface WeightedItem<T> {
  item: T;
  weight: number;
}

export interface TrainingAssistantPlan {
  cycleId: string;
  playerFocuses: Record<string, TrainableAttribute>;
}

const OUTFIELD_CYCLE_IDS = new Set([
  'T_TACTICAL_PERIOD',
  'T_GEGENPRESSING',
  'T_TIKI_TAKA',
  'T_CATENACCIO',
  'T_FINISHING',
  'T_SAQ',
  'T_AIR_DOM',
  'T_SET_PIECES',
  'T_RECOVERY_YOGA',
  'T_HIGH_PRESS',
  'T_COUNTER_ATTACK'
]);

const POSITION_FOCUS_POOLS: Record<PlayerPosition, TrainableAttribute[]> = {
  [PlayerPosition.GK]: ['goalkeeping', 'positioning', 'passing', 'vision', 'stamina', 'mentality', 'leadership'],
  [PlayerPosition.DEF]: ['defending', 'strength', 'positioning', 'heading', 'pace', 'passing', 'workRate', 'aggression', 'crossing'],
  [PlayerPosition.MID]: ['passing', 'technique', 'vision', 'dribbling', 'stamina', 'workRate', 'mentality', 'defending', 'pace', 'crossing', 'attacking', 'freeKicks'],
  [PlayerPosition.FWD]: ['finishing', 'attacking', 'pace', 'dribbling', 'technique', 'heading', 'positioning', 'workRate', 'strength', 'penalties']
};

const ROLE_BONUS: Record<PlayerPosition, Partial<Record<TrainableAttribute, number>>> = {
  [PlayerPosition.GK]: {
    goalkeeping: 20,
    positioning: 12,
    passing: 8,
    vision: 5,
    mentality: 6
  },
  [PlayerPosition.DEF]: {
    defending: 20,
    strength: 12,
    positioning: 13,
    heading: 10,
    pace: 6,
    workRate: 5
  },
  [PlayerPosition.MID]: {
    passing: 18,
    technique: 15,
    vision: 16,
    dribbling: 10,
    stamina: 8,
    mentality: 6,
    attacking: 5,
    defending: 5
  },
  [PlayerPosition.FWD]: {
    finishing: 20,
    attacking: 16,
    pace: 10,
    dribbling: 9,
    technique: 7,
    heading: 7,
    penalties: 4,
    positioning: 8
  }
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const average = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const averageAttribute = (players: Player[], attr: TrainableAttribute): number =>
  average(players.map(player => player.attributes[attr] ?? 0));

const weightedPick = <T>(items: WeightedItem<T>[], rng: () => number): T => {
  const totalWeight = items.reduce((sum, entry) => sum + entry.weight, 0);

  if (totalWeight <= 0) {
    return items[0].item;
  }

  let roll = rng() * totalWeight;
  for (const entry of items) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.item;
    }
  }

  return items[items.length - 1].item;
};

const getCycleScore = (cycle: TrainingCycle, players: Player[], rng: () => number): number => {
  const outfieldPlayers = players.filter(player => player.position !== PlayerPosition.GK);
  const defenders = players.filter(player => player.position === PlayerPosition.DEF);
  const midfielders = players.filter(player => player.position === PlayerPosition.MID);
  const forwards = players.filter(player => player.position === PlayerPosition.FWD);
  const avgAge = average(players.map(player => player.age));
  const avgCondition = average(players.map(player => player.condition));

  const baseNeed =
    average(cycle.primaryAttributes.map(attr => clamp(82 - averageAttribute(players, attr as TrainableAttribute), 0, 35))) * 1.7 +
    average(cycle.secondaryAttributes.map(attr => clamp(80 - averageAttribute(players, attr as TrainableAttribute), 0, 25))) * 1.1;

  let score = 12 + baseNeed;

  switch (cycle.id) {
    case 'T_TACTICAL_PERIOD':
      score += average([
        clamp(82 - averageAttribute(outfieldPlayers, 'vision'), 0, 28),
        clamp(82 - averageAttribute(outfieldPlayers, 'positioning'), 0, 28),
        clamp(80 - averageAttribute(outfieldPlayers, 'passing'), 0, 24)
      ]);
      break;
    case 'T_GEGENPRESSING':
      score += average([
        clamp(82 - averageAttribute(outfieldPlayers, 'stamina'), 0, 32),
        clamp(82 - averageAttribute(outfieldPlayers, 'workRate'), 0, 30),
        clamp(82 - averageAttribute(outfieldPlayers, 'pace'), 0, 28),
        clamp(80 - averageAttribute(outfieldPlayers, 'aggression'), 0, 24)
      ]);
      score -= Math.max(0, 78 - avgCondition) * 0.8;
      score -= Math.max(0, avgAge - 29) * 4;
      break;
    case 'T_TIKI_TAKA':
      score += average([
        clamp(84 - averageAttribute(outfieldPlayers, 'passing'), 0, 34),
        clamp(84 - averageAttribute(outfieldPlayers, 'technique'), 0, 30),
        clamp(82 - averageAttribute(outfieldPlayers, 'vision'), 0, 28),
        clamp(80 - averageAttribute(outfieldPlayers, 'dribbling'), 0, 24)
      ]);
      score += midfielders.length * 0.9;
      break;
    case 'T_CATENACCIO':
      score += average([
        clamp(84 - averageAttribute(defenders, 'defending'), 0, 34),
        clamp(82 - averageAttribute(defenders, 'positioning'), 0, 28),
        clamp(82 - averageAttribute(defenders, 'strength'), 0, 28),
        clamp(80 - averageAttribute(defenders, 'heading'), 0, 22)
      ]);
      score += defenders.length * 1.1;
      break;
    case 'T_FINISHING':
      score += average([
        clamp(84 - averageAttribute(forwards, 'finishing'), 0, 34),
        clamp(82 - averageAttribute(forwards, 'attacking'), 0, 28),
        clamp(80 - averageAttribute(forwards, 'technique'), 0, 22)
      ]);
      score += forwards.length * 1.2;
      break;
    case 'T_SAQ':
      score += average([
        clamp(84 - averageAttribute(outfieldPlayers, 'pace'), 0, 34),
        clamp(82 - averageAttribute(outfieldPlayers, 'dribbling'), 0, 28),
        clamp(80 - averageAttribute(outfieldPlayers, 'stamina'), 0, 22)
      ]);
      score -= Math.max(0, 76 - avgCondition) * 0.6;
      break;
    case 'T_AIR_DOM':
      score += average([
        clamp(84 - averageAttribute(defenders.concat(forwards), 'heading'), 0, 34),
        clamp(82 - averageAttribute(players, 'strength'), 0, 28),
        clamp(80 - averageAttribute(defenders, 'defending'), 0, 24)
      ]);
      break;
    case 'T_SET_PIECES':
      score += average([
        clamp(82 - averageAttribute(players, 'freeKicks'), 0, 26),
        clamp(82 - averageAttribute(players, 'corners'), 0, 26),
        clamp(80 - averageAttribute(players, 'penalties'), 0, 20),
        clamp(80 - averageAttribute(players, 'passing'), 0, 20)
      ]);
      score -= 4;
      break;
    case 'T_RECOVERY_YOGA':
      score += Math.max(0, 82 - avgCondition) * 2.2;
      score += Math.max(0, avgAge - 28) * 2.5;
      break;
    case 'T_HIGH_PRESS':
      score += average([
        clamp(84 - averageAttribute(outfieldPlayers, 'workRate'), 0, 34),
        clamp(82 - averageAttribute(outfieldPlayers, 'aggression'), 0, 28),
        clamp(82 - averageAttribute(outfieldPlayers, 'stamina'), 0, 28),
        clamp(80 - averageAttribute(outfieldPlayers, 'defending'), 0, 22)
      ]);
      score -= Math.max(0, 78 - avgCondition) * 0.7;
      score -= Math.max(0, avgAge - 30) * 4.5;
      break;
    case 'T_COUNTER_ATTACK':
      score += average([
        clamp(84 - averageAttribute(players, 'pace'), 0, 34),
        clamp(82 - averageAttribute(forwards.concat(midfielders), 'attacking'), 0, 28),
        clamp(82 - averageAttribute(forwards, 'finishing'), 0, 28),
        clamp(80 - averageAttribute(outfieldPlayers, 'workRate'), 0, 20)
      ]);
      score += forwards.length * 1.1;
      break;
    default:
      break;
  }

  score *= 0.88 + rng() * 0.24;

  return Math.max(1, score);
};

const chooseCycle = (players: Player[], rng: () => number): TrainingCycle => {
  const cycleCandidates = TRAINING_CYCLES.filter(cycle => OUTFIELD_CYCLE_IDS.has(cycle.id));
  const scored = cycleCandidates
    .map(cycle => ({ cycle, score: getCycleScore(cycle, players, rng) }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);

  return weightedPick(
    scored.map(entry => ({
      item: entry.cycle,
      weight: entry.score
    })),
    rng
  );
};

const chooseFocus = (player: Player, cycle: TrainingCycle, rng: () => number, assistantIndividualWork: number = 10): TrainableAttribute => {
  const pool = POSITION_FOCUS_POOLS[player.position];
  const scored = pool
    .map(attr => {
      const attrValue = player.attributes[attr] ?? 0;
      const weakness = clamp(82 - attrValue, 0, 38) * 1.35;
      const teamSync = cycle.primaryAttributes.includes(attr) ? 14 : (cycle.secondaryAttributes.includes(attr) ? 8 : 0);
      const roleBonus = ROLE_BONUS[player.position][attr] ?? 0;
      const ageAdjustment = player.age >= 32 && ['pace', 'stamina', 'workRate'].includes(attr) ? -3 : 0;
      const elitePenalty = attrValue >= 88 ? 8 : attrValue >= 82 ? 4 : 0;
      const jitterMultiplier = assistantIndividualWork <= 7 ? 2.5 : assistantIndividualWork >= 15 ? 0.4 : 1.0;
      const jitter = rng() * 6 * jitterMultiplier;

      return {
        attr,
        score: Math.max(1, 8 + weakness + teamSync + roleBonus + ageAdjustment + jitter - elitePenalty)
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);

  return weightedPick(
    scored.map(entry => ({
      item: entry.attr,
      weight: entry.score
    })),
    rng
  );
};

const POSITION_KEY_ATTRS: Record<PlayerPosition, TrainableAttribute[]> = {
  [PlayerPosition.GK]: ['goalkeeping', 'positioning', 'passing', 'vision', 'stamina'],
  [PlayerPosition.DEF]: ['defending', 'strength', 'positioning', 'heading', 'pace'],
  [PlayerPosition.MID]: ['passing', 'technique', 'vision', 'stamina', 'dribbling'],
  [PlayerPosition.FWD]: ['finishing', 'attacking', 'pace', 'dribbling', 'technique']
};

const POSITION_IMPORTANCE: Record<PlayerPosition, Partial<Record<TrainableAttribute, number>>> = {
  [PlayerPosition.GK]:  { goalkeeping: 3.0, positioning: 2.5, vision: 1.5, stamina: 1.2, passing: 0.6 },
  [PlayerPosition.DEF]: { defending: 3.0, positioning: 2.5, strength: 2.0, heading: 1.8, pace: 1.5 },
  [PlayerPosition.MID]: { passing: 2.8, vision: 2.8, technique: 2.5, stamina: 2.0, dribbling: 1.8 },
  [PlayerPosition.FWD]: { finishing: 3.0, attacking: 2.5, pace: 2.0, dribbling: 2.0, technique: 1.8 }
};

const ATTR_LABELS_REP: Record<string, string> = {
  strength: 'Siła', stamina: 'Kondycja', pace: 'Szybkość', defending: 'Obrona',
  passing: 'Podania', attacking: 'Atak', finishing: 'Wykończenie', technique: 'Technika',
  vision: 'Wizja', dribbling: 'Drybling', heading: 'Gra głową', positioning: 'Ustawianie',
  goalkeeping: 'Bramkarstwo', freeKicks: 'Rzuty wolne', penalties: 'Jedenastki',
  corners: 'Rożne', aggression: 'Agresja', crossing: 'Dośrodkowania',
  leadership: 'Przywództwo', mentality: 'Mentalność', workRate: 'Pracowitość'
};

export interface PlayerReport {
  overallAssessment: string;
  valueForTeam: 'WYSOKA' | 'SREDNIA' | 'NISKA';
  valueColor: string;
  weakAttributes: { attr: string; label: string; value: number }[];
  strongAttributes: { attr: string; label: string; value: number }[];
  notableTraits: { label: string; isWarning: boolean }[];
  recommendedFocus: TrainableAttribute;
  recommendedFocusLabel: string;
  recommendedCycleName: string;
  developmentPotential: 'WYSOKI' | 'SREDNI' | 'NISKI';
  potentialColor: string;
  investmentText: string;
  trainingRecommendationText: string;
  positionEffectivenessText: string;
  positionEffectivenessScore: number;
}

const TRAIT_DESCRIPTORS: { attr: TrainableAttribute; label: string; isWarning: boolean; leagueBonus: number }[] = [
  { attr: 'leadership',   label: 'Materiał na kapitana drużyny',                       isWarning: false, leagueBonus: 5 },
  { attr: 'penalties',    label: 'Groźny wykonawca rzutów karnych',                    isWarning: false, leagueBonus: 5 },
  { attr: 'freeKicks',    label: 'Groźny wykonawca rzutów wolnych',                    isWarning: false, leagueBonus: 5 },
  { attr: 'corners',      label: 'Precyzyjny wykonawca rzutów rożnych',                isWarning: false, leagueBonus: 5 },
  { attr: 'crossing',     label: 'Ponadprzeciętne dośrodkowania',                      isWarning: false, leagueBonus: 5 },
  { attr: 'heading',      label: 'Groźny w grze głową',                                isWarning: false, leagueBonus: 5 },
  { attr: 'pace',         label: 'Ponadprzeciętna szybkość',                           isWarning: false, leagueBonus: 5 },
  { attr: 'finishing',    label: 'Wyjątkowo skuteczne wykończenie',                    isWarning: false, leagueBonus: 5 },
  { attr: 'passing',      label: 'Wysokiej jakości podania',                           isWarning: false, leagueBonus: 5 },
  { attr: 'dribbling',    label: 'Wyróżniający się drybling',                          isWarning: false, leagueBonus: 5 },
  { attr: 'technique',    label: 'Wyjątkowa technika indywidualna',                    isWarning: false, leagueBonus: 5 },
  { attr: 'vision',       label: 'Doskonałe czytanie gry i wizja',                     isWarning: false, leagueBonus: 5 },
  { attr: 'mentality',    label: 'Silna mentalność, odporność na presję',              isWarning: false, leagueBonus: 5 },
  { attr: 'workRate',     label: 'Wyjątkowa pracowitość i zaangażowanie',              isWarning: false, leagueBonus: 5 },
  { attr: 'strength',     label: 'Wyróżniająca się siła fizyczna',                     isWarning: false, leagueBonus: 5 },
  { attr: 'stamina',      label: 'Ponadprzeciętna wytrzymałość',                       isWarning: false, leagueBonus: 5 },
  { attr: 'defending',    label: 'Wyróżniające się umiejętności defensywne',           isWarning: false, leagueBonus: 5 },
  { attr: 'attacking',    label: 'Wysokie zaangażowanie ofensywne',                    isWarning: false, leagueBonus: 5 },
  { attr: 'positioning',  label: 'Doskonałe ustawianie i inteligencja pozycyjna',      isWarning: false, leagueBonus: 5 },
  { attr: 'goalkeeping',  label: 'Wyróżniające się umiejętności bramkarskie',          isWarning: false, leagueBonus: 5 },
  { attr: 'aggression',   label: 'Wysoka agresja, ryzyko fauli i żółtych kartek',      isWarning: true,  leagueBonus: 8 },
];

const ATTR_CONTEXT: Record<string, string> = {
  goalkeeping: 'To fundament gry bramkarza.od niej zależą kluczowe interwencje i pewność całej drużyny.',
  defending: 'Obrona jest absolutną podstawą dla defensora.bez niej zawodnik nie spełnia minimum swojej pozycji.',
  finishing: 'To najważniejsza cecha napastnika, bezpośrednio przekładająca się na liczbę strzelonych bramek.',
  passing: 'Jakość podań decyduje o sprawności rozgrywania piłki i tworzeniu sytuacji bramkowych.',
  technique: 'Technika wpływa na precyzję każdego zagrania i jakość pierwszego kontaktu z piłką.',
  vision: 'Wizja gry umożliwia czytanie sytuacji i podejmowanie lepszych decyzji przy każdej akcji.',
  stamina: 'Kondycja determinuje skuteczność w końcowych minutach meczu, gdy decydują się losy spotkania.',
  pace: 'Szybkość daje kluczową przewagę w sytuacjach jeden na jeden oraz przy odzyskiwaniu pozycji.',
  strength: 'Siła fizyczna jest niezbędna w duelach bezpośrednich i grze pod presją rywala.',
  positioning: 'Ustawianie decyduje o znalezieniu się w odpowiednim miejscu zarówno w ataku jak i obronie.',
  heading: 'Gra głową jest szczególnie istotna przy stałych fragmentach gry i dośrodkowaniach z boku boiska.',
  dribbling: 'Drybling pozwala mijać rywali i tworzyć przewagi liczebne w kluczowych momentach.',
  attacking: 'Zaangażowanie ofensywne bezpośrednio wpływa na tworzenie i finalizowanie akcji bramkowych.',
  workRate: 'Pracowitość widoczna jest przez cały mecz.niski poziom tej cechy powoduje odpadanie z gry szybciej niż rywale.',
  mentality: 'Mentalność decyduje o reakcji pod presją.kluczowa w najtrudniejszych momentach sezonu.',
  leadership: 'Przywództwo podnosi morale drużyny i jest bezcenne w chwilach kryzysu.',
  aggression: 'Odpowiedni poziom agresji jest niezbędny do skutecznego pressingu i odbioru piłki.',
  crossing: 'Dośrodkowania tworzą sytuacje bramkowe i są kluczowym narzędziem ataku pozycyjnego.',
  freeKicks: 'Rzuty wolne to cenna broń przy stałych fragmentach gry z potencjałem bezpośrednim na bramkę.',
  penalties: 'Skuteczność z jedenastki może zaważyć na wynikach.umiejętność warta systematycznego rozwijania.',
  corners: 'Rożne inicjują groźne sytuacje bramkowe.ich jakość ma mierzalny wpływ na liczbę goli.'
};

const POSITION_NARRATIVES: Partial<Record<string, Partial<Record<PlayerPosition, string>>>> = {
  goalkeeping: {
    [PlayerPosition.GK]: 'Trenerze, to jest ten obszar, na który zwróciłbym uwagę w pierwszej kolejności. Braki w bramkarstwie bezpośrednio kosztują nas bramki.i to w sytuacjach, które powinniśmy kontrolować. Dopóki ta cecha nie osiągnie przyzwoitego poziomu, wszystko inne schodzi na dalszy plan.'
  },
  positioning: {
    [PlayerPosition.GK]: 'Moim zdaniem kluczowym problemem jest ustawianie. Widzę, że zawodnik reaguje za późno, bo nie zajmuje właściwej pozycji przed strzałem. To coś, co można poprawić.i co przełoży się na wyniki szybciej niż inne cechy.',
    [PlayerPosition.DEF]: 'Polecam skupić się na ustawianiu.widzę, że zawodnik za często daje się zaskoczyć za plecami. Dobra pozycja wyjściowa to podstawa skutecznej obrony i eliminuje wiele zbędnych pojedynków.',
    [PlayerPosition.FWD]: 'Napastnik, który jest we właściwym miejscu we właściwym czasie, potrzebuje mniej umiejętności do zdobycia bramki. Moim zdaniem to właśnie ustawianie ogranicza go najbardziej.warto to przepracować.'
  },
  defending: {
    [PlayerPosition.DEF]: 'Nie ma co owijać w bawełnę.ten zawodnik ma wyraźne problemy z kryciem rywali. Polecam priorytetowo zaadresować umiejętności defensywne, bo to bezpośrednio wpływa na szczelność całej naszej formacji.',
    [PlayerPosition.MID]: 'Widzę, że przy stratach piłki ten pomocnik zostawia za dużo przestrzeni. Dziś piłka wymaga defensywnego zaangażowania od wszystkich.polecam poświęcić temu uwagę w planie treningowym.'
  },
  finishing: {
    [PlayerPosition.FWD]: 'Szczerze mówiąc, to jest dla mnie priorytet numer jeden. Napastnik, który nie potrafi wykańczać akcji, marnuje pracę całej drużyny. Każdy trening powinien zawierać elementy finalizacji, dopóki ta cecha nie osiągnie odpowiedniego poziomu.'
  },
  passing: {
    [PlayerPosition.MID]: 'Polecam skupić się na podaniach.to serce gry pomocnika. Widzę, że zawodnik traci piłkę w momentach, gdy powinien utrzymać tempo akcji. Pewne podanie to podstawa dominacji w środku pola.',
    [PlayerPosition.DEF]: 'Moim zdaniem warto popracować nad podaniami.defensor bez pewnego wyprowadzenia skazuje drużynę na grę długimi piłkami. To ogranicza nasze możliwości taktyczne od pierwszej minuty.',
    [PlayerPosition.GK]: 'Przy okazji.warto zwrócić uwagę na wyprowadzanie piłki. To nie jest priorytet, ale błędy przy krótkich podaniach zdarzają się w newralgicznych momentach i warto je wyeliminować.'
  },
  pace: {
    [PlayerPosition.FWD]: 'Widzę, że rywale coraz lepiej radzą sobie z tym zawodnikiem właśnie dlatego, że nie jest zaskoczeniem szybkościowym. Polecam trening szybkości.w nowoczesnej piłce ta cecha to przewaga, której nie można zignorować.',
    [PlayerPosition.DEF]: 'Zwróciłbym uwagę na szybkość.przy dzisiejszym tempie gry defensor bez odpowiedniej prędkości jest regularnie wystawiany za plecy. To ryzyko, które warto zminimalizować.'
  },
  vision: {
    [PlayerPosition.MID]: 'Moim zdaniem wizja gry to właśnie to, co oddziela dobrego pomocnika od bardzo dobrego. Widzę, że zawodnik gra zbyt przewidywalnie.przy lepszej wizji zacznie kreować akcje zamiast tylko je wykonywać.',
    [PlayerPosition.GK]: 'Warto popracować nad wizją gry.bramkarz, który potrafi czytać sytuację przed wyprowadzeniem, staje się pierwszym rozgrywającym. To daje nam realną przewagę przy budowaniu akcji.'
  },
  stamina: {
    [PlayerPosition.MID]: 'Widzę wyraźny spadek zaangażowania w końcowych minutach. Polecam priorytetowo zaadresować kondycję.pomocnik, który odpada fizycznie w drugiej połowie, traci wpływ na grę dokładnie wtedy, gdy najbardziej go potrzebujemy.',
    [PlayerPosition.FWD]: 'Szczerze.ten zawodnik znika z gry w końcówkach. A to właśnie wtedy pojawiają się największe szanse. Polecam skupić się na kondycji, żeby utrzymał intensywność przez pełne 90 minut.'
  },
  strength: {
    [PlayerPosition.DEF]: 'Polecam zainwestować w siłę fizyczną.ten defensor przegrywa za dużo duelów bezpośrednich. Przy wrzutkach i pressingu rywala ta słabość jest regularnie wykorzystywana.',
    [PlayerPosition.FWD]: 'Moim zdaniem siła to brakujący element u tego zawodnika. Napastnik, który potrafi utrzymać piłkę plecami do bramki i wygrać starcie fizyczne, otwiera przestrzeń dla całego zespołu.'
  },
  heading: {
    [PlayerPosition.DEF]: 'Zwróciłbym uwagę na grę głową.przy stałych fragmentach ten defensor jest regularnie pokonywany w powietrzu. To bezpośrednie zagrożenie, które warto wyeliminować jak najszybciej.',
    [PlayerPosition.FWD]: 'Warto poćwiczyć grę głową.napastnik, który stanowi zagrożenie przy dośrodkowaniach, zmusza obronę do znacznie trudniejszych wyborów taktycznych.'
  },
  technique: {
    [PlayerPosition.MID]: 'Moim zdaniem technika to ten fundament, którego temu zawodnikowi brakuje. Bez niej nawet dobra pozycja i szybkość nie wystarczą.traci piłkę w miejscach, gdzie nie powinien.',
    [PlayerPosition.FWD]: 'Polecam skupić się na technice.widzę, że zawodnik marnuje szanse nie dlatego, że jest w złej pozycji, ale dlatego, że pierwsze przyjęcie go zawodzi. To naprawialne.'
  },
  dribbling: {
    [PlayerPosition.FWD]: 'Moim zdaniem drybling to właśnie to, czego temu napastnikowi brakuje do bycia groźnym jeden na jeden. Przy lepszym dryblu otworzy przestrzeń tam, gdzie obrona jest najszczelniejsza.',
    [PlayerPosition.MID]: 'Polecam poćwiczyć drybling.pomocnik, który potrafi wyjść z pressingu z piłką przy nodze, daje drużynie czas i przestrzeń w trudnych momentach.'
  },
  attacking: {
    [PlayerPosition.FWD]: 'Widzę, że ten zawodnik zbyt rzadko angażuje się w akcje ofensywne w kluczowych strefach. Polecam popracować nad aktywnością ofensywną.napastnik musi być tam, gdzie dzieje się gra.',
    [PlayerPosition.MID]: 'Moim zdaniem ten pomocnik zostawia za dużo potencjału ofensywnego niewykorzystanego. Przy większym zaangażowaniu w akcje ataku stałby się realnym zagrożeniem dla rywali.'
  }
};

const buildAgeExperienceIntro = (player: Player): string => {
  const { age } = player;
  const matches = player.stats.matchesPlayed;
  const talent = player.attributes.talent;

  if (age <= 19 && matches < 15)
    return `Trenerze, pamiętajmy że mówimy o zawodniku z minimalnym doświadczeniem meczowym. Jest na samym początku drogi.`;
  if (age <= 19)
    return `Mamy tu młodego zawodnika, który jak na swój wiek zebrał już całkiem przyzwoite doświadczenie. To dopiero początek kariery, błędy są naturalną częścią procesu.`;
  if (age <= 22 && talent >= 72)
    return `To młody, perspektywiczny zawodnik z dużym talentem. Właśnie teraz, w tym oknie, możemy go ukształtować na miarę jego możliwości.`;
  if (age <= 22)
    return `Zawodnik wciąż jest w fazie kształtowania się. Mamy czas, ale warto już teraz nadać odpowiedni kierunek.`;
  if (age <= 26 && matches >= 60)
    return `Mówimy o zawodniku z solidnym doświadczeniem (${matches} meczów) w kwiecie wieku. To idealny moment na wyciąganie maksimum.`;
  if (age <= 26)
    return `Rozwijająca się kariera. Zawodnik jest na etapie, gdzie konsekwentny trening przynosi największe efekty.`;
  if (age <= 30 && matches >= 100)
    return `To doświadczony zawodnik, ${matches} meczów robi swoje. Jest jeszcze w stanie się rozwijać, ale wymaga przemyślanego podejścia.`;
  if (age <= 30)
    return `Zawodnik jest w szczytowym okresie kariery. Poprawy już nie przyjdą same, wymagają ukierunkowanej pracy.`;
  if (age <= 33 && matches >= 120)
    return `Mówimy o weteranie z bogatym doświadczeniem (${matches} meczów). Nie oczekuję skoków, ale doświadczenie rekompensuje wiele braków.`;
  if (age <= 33)
    return `Zawodnik zbliża się do końca szczytowego okresu. To moment, gdy każdy sezon treningowy liczy się podwójnie.`;
  return `Przy ${matches} meczach na karku mamy do czynienia z prawdziwym weteranem. Progres będzie ograniczony, priorytetem jest utrzymanie poziomu.`;
};

const buildTrainingRecommendationText = (player: Player, priorityAttr: string): string => {
  const pos = player.position;
  const label = ATTR_LABELS_REP[priorityAttr] || priorityAttr;
  const intro = buildAgeExperienceIntro(player);
  const narrative =
    POSITION_NARRATIVES[priorityAttr]?.[pos] ||
    `Polecam skupić uwagę na cesze ${label.toLowerCase()}.w mojej ocenie to właśnie tutaj jest największy potencjał do poprawy. Odpowiedni program treningowy powinien przynieść wymierne efekty.`;
  return `${intro} ${narrative}`;
};

const buildInvestmentText = (player: Player): string => {
  const { age, overallRating } = player;
  const talent = player.attributes.talent;
  if (age <= 20 && talent >= 75 && overallRating >= 68) return 'Wyjątkowy talent. Priorytet inwestycyjny.może stać się gwiazdą drużyny.';
  if (age <= 23 && talent >= 70) return 'Obiecujący młody zawodnik z wysokim potencjałem wzrostu. Zdecydowanie warto inwestować.';
  if (age <= 23 && talent >= 60) return 'Młody gracz z solidnym potencjałem. Regularny trening przyniesie wymierne efekty.';
  if (age <= 27 && overallRating >= 78) return 'Zawodnik w kwiecie wieku, wysoka forma. Solidna inwestycja długoterminowa.';
  if (age <= 27 && overallRating >= 65) return 'Dobry wiek i zadowalający poziom. Wart kontynuowania rozwoju.';
  if (age <= 30 && overallRating >= 75) return 'Doświadczony gracz w szczytowej formie. Wartościowy, choć wzrost ograniczony.';
  if (age <= 30 && overallRating >= 65) return 'Solidny zawodnik z niewielkim potencjałem wzrostu. Utrzymanie formy jako cel.';
  if (age > 32 && overallRating >= 74) return 'Doświadczony weteran wysokiej klasy. Krótkoterminowy atut drużyny.';
  if (age > 32) return 'Zawodnik u zmierzchu kariery. Inwestycja nieopłacalna.rozważ planowanie zmiany.';
  return 'Przeciętny poziom i ograniczony potencjał. Warto rozważyć sprzedaż lub znalezienie zastępstwa.';
};

const POS_LABEL: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'bramkarz',
  [PlayerPosition.DEF]: 'defensor',
  [PlayerPosition.MID]: 'pomocnik',
  [PlayerPosition.FWD]: 'napastnik'
};

const buildOverallAssessment = (
  player: Player,
  relToPos: number,
  relToTeam: number,
  posAvgOvr: number,
  samePosCount: number,
  isTeamTopOvr: boolean,
  isTopGoalscorer: boolean,
  isTopAssist: boolean,
  seed: number,
  traitsText: string,
  weakText: string
): string => {
  const pos = POS_LABEL[player.position];
  const { age } = player;
  const talent = player.attributes.talent;
  const alone = samePosCount === 0;
  const t = traitsText ? ` ${traitsText}` : '';
  const w = weakText ? ` ${weakText}` : '';
  const v = seed % 3;

  if (isTeamTopOvr && player.position === PlayerPosition.FWD && isTopGoalscorer) return [
    `Trenerze, to nasz najlepszy zawodnik. Napastnik z najwyższą oceną w składzie i jednocześnie czołowy strzelec.${t} Bez niego jesteśmy o klasę słabsi.`,
    `Najlepsza karta w naszej talii. Ten napastnik wyraźnie przewyższa resztę składu, a jego skuteczność przed bramką mówi sama za siebie.${t} To fundament naszego ataku.`,
    `Mówię wprost: bez tego zawodnika jesteśmy słabsi o klasę. Najlepszy gracz w drużynie i nasz czołowy strzelec.${t}`
  ][v];

  if (isTeamTopOvr && player.position === PlayerPosition.FWD) return [
    `Trenerze, to nasz najlepszy zawodnik. Napastnik kluczowy dla ofensywy, wokół którego budowana jest gra ataku.${t}`,
    `Najwyżej oceniany zawodnik w składzie. Ten napastnik daje nam jakość w ataku, której nie ma nikt inny w drużynie.${t}`,
    `To lider naszej ofensywy i najlepszy zawodnik w drużynie.${t} Każda decyzja taktyczna powinna uwzględniać jego rolę w grze.`
  ][v];

  if (isTeamTopOvr && player.position === PlayerPosition.MID && isTopAssist) return [
    `Trenerze, to silnik naszego środka pola. Najlepszy zawodnik w drużynie i lider asyst, który dyktuje tempo gry w każdym meczu.${t}`,
    `Ciężko znaleźć kogoś lepszego w składzie. Ten pomocnik dominuje w środku pola, a liczba asyst świadczy, że kreuje grę na najwyższym poziomie.${t}`,
    `To mózg naszej drużyny. Najwyższy poziom w składzie, przy tym doskonałe kreowanie akcji.${t} Wszystkie kluczowe decyzje taktyczne muszą uwzględniać jego rolę.`
  ][v];

  if (isTeamTopOvr && player.position === PlayerPosition.MID) return [
    `Trenerze, to kluczowe ogniwo środka pola i najlepszy zawodnik w drużynie. Jego wpływ na grę jest wyraźnie odczuwalny.${t}`,
    `Najlepszy zawodnik w naszym składzie. Ten pomocnik nadaje rytm całej drużynie i jest punktem odniesienia dla reszty.${t}`,
    `Kreator gry i nasz najcenniejszy zawodnik. Bez niego środek pola traci na jakości i tempo akcji spada.${t}`
  ][v];

  if (isTeamTopOvr && player.position === PlayerPosition.GK) return [
    `Trenerze, mamy szczęście że ten bramkarz stoi między słupkami. Najlepszy zawodnik w drużynie.${t} Jego pewność udziela się całej defensywie.`,
    `To fundament naszej obrony. Najwyżej oceniany zawodnik w składzie, a w bramce daje całemu zespołowi poczucie bezpieczeństwa.${t}`,
    `Mówię to rzadko, ale ten bramkarz to klasa sama w sobie. Najlepszy w naszym składzie i widać to na boisku.${t}`
  ][v];

  if (isTeamTopOvr) return [
    `Trenerze, to nasz najlepszy zawodnik na tej pozycji. Wyróżnia się poziomem na tle całego składu.${t} Kluczowy dla stabilności formacji.`,
    `Gwiazda drużyny na swojej pozycji. Żaden inny zawodnik w składzie nie osiąga takiego poziomu.${t} To gracz, wokół którego warto budować taktykę.`,
    `Fundament formacji i najlepszy zawodnik w drużynie.${t} Jego brak byłby odczuwalny zarówno jakościowo jak i mentalnie dla reszty składu.`
  ][v];

  if (!alone && relToPos > 10) return [
    `Trenerze, ten ${pos} zdecydowanie wyróżnia się na tle pozostałych na tej pozycji.${t} Trudno byłoby go zastąpić bez wyraźnego spadku jakości formacji.`,
    `To nasz kluczowy ${pos}. Wyraźna różnica jakościowa w stosunku do reszty na tej pozycji jest widoczna od pierwszych minut.${t}`,
    `Najlepszy ${pos} w drużynie z dużą przewagą.${t} Taki zawodnik podnosi standardy całej formacji.`
  ][v];

  if (!alone && relToPos > 5) return [
    `Ten ${pos} plasuje się wyraźnie powyżej drużynowej normy na tej pozycji.${t} Solidna inwestycja, która zwraca się na boisku.`,
    `Trenerze, warto docenić tego zawodnika. Regularnie prezentuje poziom powyżej reszty ${pos}ów w drużynie.${t}`,
    `Widać wyraźną różnicę jakościową między tym ${pos}em a pozostałymi.${t} Zawodnik, który podnosi standardy całej linii.`
  ][v];

  if (!alone && relToPos > 0 && age < 23 && talent >= 68) return [
    `Trenerze, to obiecujący młody zawodnik. Nieco powyżej drużynowej normy, ale jego potencjał to właśnie to, co mnie tu interesuje.${t} Przy odpowiednim prowadzeniu może stać się kluczowym graczem.`,
    `Nieznacznie powyżej średniej drużynowej, ale nie to jest najważniejsze. Ten młody zawodnik ma predyspozycje do dalszego rozwoju.${t} Teraz jest idealny moment na ukształtowanie go.`,
    `Na razie solidny poziom, ale przyszłość tego zawodnika wygląda obiecująco.${t} To właśnie teraz jest moment, żeby nadać właściwy kierunek jego karierze.`
  ][v];

  if (!alone && relToPos > -3) return [
    `Trenerze, ten zawodnik plasuje się w granicach drużynowej normy dla swojej pozycji.${t} Solidny element składu, choć trudno mówić o wyjątkowości.`,
    `Ani wybitny lider, ani słabe ogniwo. Ten ${pos} prezentuje poziom zbliżony do drużynowej przeciętnej.${t}`,
    `Zawodnik drużynowej normy. Na tle kolegów z pozycji nie wyróżnia się ani pozytywnie, ani negatywnie.${t} Cenny, ale nie ktoś, na kim powinniśmy budować taktykę.`
  ][v];

  if (!alone && relToPos > -8) return [
    `Trenerze, muszę powiedzieć wprost: ten zawodnik jest nieznacznie poniżej drużynowego standardu na tej pozycji.${w} Wymagana poprawa lub przemyślane wzmocnienie składu.`,
    `Widzę, że ten ${pos} ma pewne trudności z osiąganiem poziomu reszty formacji.${w} Nie jest to dramatyczna sytuacja, ale warto ją zaadresować.`,
    `Poziom poniżej drużynowej normy na tej pozycji.${w} Nie jest to jeszcze kryzys, ale bez interwencji może się pogłębić.`
  ][v];

  if (!alone && relToPos <= -8) return [
    `Trenerze, będę szczery: ten zawodnik wyraźnie odstaje od reszty ${pos}ów w drużynie.${w} To słabe ogniwo formacji, które rywale będą wykorzystywać.`,
    `Muszę zwrócić uwagę na ten problem. Ten ${pos} prezentuje poziom znacznie poniżej drużynowego standardu.${w} Konieczna jest pilna interwencja.`,
    `To jest dla mnie priorytet. Ten zawodnik wyraźnie obniża jakość całej formacji.${w} Trzeba to rozwiązać, czy przez intensywny trening, czy przez zmianę w składzie.`
  ][v];

  if (relToTeam > 5) return [
    `Jeden z mocniejszych zawodników w drużynie. Jego wkład przekracza drużynową średnią i jest odczuwalny na boisku.${t}`,
    `Ten zawodnik wyróżnia się poziomem na tle całego składu.${t} Jego jakość jest zauważalna i warta podkreślenia.`,
    `Powyżej drużynowej przeciętnej i to widać w grze.${t} Solidny zawodnik, na którym można polegać.`
  ][v];

  return [
    `Prezentuje poziom zbliżony do drużynowej średniej.${t} Solidny zawodnik bez wyraźnych odchyleń in plus ani in minus.`,
    `Poziom drużynowej normy. Na tle składu nie wyróżnia się szczególnie, ale robi swoją robotę.${t}`,
    `Zawodnik w granicach drużynowej przeciętnej.${t} Nie jest liderem, ale nie jest też słabym ogniwem.`
  ][v];
};

const buildPositionEffectivenessText = (
  posEffRelative: number,
  posEff: number,
  position: PlayerPosition,
  samePosCount: number
): string => {
  const pos = POS_LABEL[position];
  if (samePosCount === 0) {
    if (posEff >= 75) return `Kluczowe atrybuty na tej pozycji prezentują się na wysokim poziomie.skuteczność na boisku jest wyraźna.`;
    if (posEff >= 65) return `Kluczowe atrybuty na zadowalającym poziomie, choć kilka obszarów wymaga dalszej pracy.`;
    return `Kluczowe atrybuty wymagają intensywnej pracy.skuteczność na tej pozycji jest ograniczona.`;
  }
  if (posEffRelative > 8) return `Przewyższa pozostałych ${pos}ów w drużynie pod względem kluczowych atrybutów.to widoczna różnica jakościowa.`;
  if (posEffRelative > 3) return `Nieznacznie powyżej drużynowej średniej dla tej pozycji w kluczowych atrybutach. Solidna skuteczność.`;
  if (posEffRelative > -4) return `Kluczowe atrybuty zbliżone do pozostałych ${pos}ów w drużynie.żadnych wyraźnych odchyleń.`;
  if (posEffRelative > -9) return `Nieznacznie poniżej drużynowego standardu w kluczowych atrybutach. Kilka obszarów wymaga poprawy.`;
  return `Kluczowe atrybuty wyraźnie odbiegają od standardów pozostałych ${pos}ów w drużynie. Poprawa jest priorytetem.`;
};

const POSITION_ALLOWED_CYCLES: Record<PlayerPosition, Set<string>> = {
  [PlayerPosition.GK]:  new Set(['T_TACTICAL_PERIOD', 'T_RECOVERY_YOGA', 'T_SET_PIECES']),
  [PlayerPosition.DEF]: new Set(['T_CATENACCIO', 'T_TACTICAL_PERIOD', 'T_AIR_DOM', 'T_RECOVERY_YOGA', 'T_HIGH_PRESS', 'T_GEGENPRESSING', 'T_COUNTER_ATTACK']),
  [PlayerPosition.MID]: new Set(['T_TIKI_TAKA', 'T_TACTICAL_PERIOD', 'T_GEGENPRESSING', 'T_HIGH_PRESS', 'T_COUNTER_ATTACK', 'T_SAQ', 'T_SET_PIECES']),
  [PlayerPosition.FWD]: new Set(['T_FINISHING', 'T_COUNTER_ATTACK', 'T_SAQ', 'T_GEGENPRESSING', 'T_HIGH_PRESS', 'T_TIKI_TAKA'])
};

const chooseCycleForPosition = (player: Player, rng: () => number): TrainingCycle => {
  const allowed = POSITION_ALLOWED_CYCLES[player.position];
  const cycleCandidates = TRAINING_CYCLES.filter(cycle => allowed.has(cycle.id));
  const scored = cycleCandidates
    .map(cycle => ({ cycle, score: getCycleScore(cycle, [player], rng) }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);

  return weightedPick(
    scored.map(entry => ({
      item: entry.cycle,
      weight: entry.score
    })),
    rng
  );
};

const buildNotableTraitsNarrative = (traits: { label: string; isWarning: boolean }[]): string => {
  const positives = traits.filter(t => !t.isWarning).map(t => t.label.toLowerCase());
  const warnings = traits.filter(t => t.isWarning).map(t => t.label.toLowerCase());

  const parts: string[] = [];

  if (positives.length === 1)
    parts.push(`Warto podkreślić jego ${positives[0]}.`);
  else if (positives.length === 2)
    parts.push(`Warto podkreślić jego ${positives[0]} oraz ${positives[1]}.`);
  else if (positives.length >= 3)
    parts.push(`Warto podkreślić jego ${positives.slice(0, -1).join(', ')} oraz ${positives[positives.length - 1]}.`);

  if (warnings.length > 0)
    parts.push(`Uwaga, Trenerze: ${warnings.join(', ')} — warto mieć to na uwadze przy ustawianiu składu.`);

  return parts.join(' ');
};

export const generatePlayerReport = (player: Player, teamPlayers: Player[], leaguePlayers: Player[]): PlayerReport => {
  const keyAttrs = POSITION_KEY_ATTRS[player.position];
  const talent = player.attributes.talent;

  // Szum deterministyczny.hash z ID gracza, symuluje tolerancję błędu asystenta (±3)
  const seed = player.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const noise = (seed % 7) - 3;

  // Kontekst drużynowy
  const samePos = teamPlayers.filter(p => p.position === player.position && p.id !== player.id);
  const posAvgOvr = samePos.length > 0 ? average(samePos.map(p => p.overallRating)) : player.overallRating;
  const teamAvgOvr = teamPlayers.length > 0 ? average(teamPlayers.map(p => p.overallRating)) : player.overallRating;
  const posAvgKeyAttrs = samePos.length > 0
    ? average(keyAttrs.map(attr => average(samePos.map(p => p.attributes[attr] ?? 0))))
    : average(keyAttrs.map(attr => player.attributes[attr] ?? 0));

  const effectiveOvr = player.overallRating + noise;
  const relToPos = effectiveOvr - posAvgOvr;
  const relToTeam = effectiveOvr - teamAvgOvr;

  // Słabe i mocne.sortowanie ważone ważnością pozycji
  const importanceMap = POSITION_IMPORTANCE[player.position];
  const scored = keyAttrs.map(attr => ({
    attr,
    label: ATTR_LABELS_REP[attr] || attr,
    value: player.attributes[attr] ?? 0,
    need: (Math.max(0, 80 - (player.attributes[attr] ?? 0))) * (importanceMap[attr] ?? 1.0),
    strength: ((player.attributes[attr] ?? 0)) * (importanceMap[attr] ?? 1.0)
  })).sort((a, b) => b.need - a.need);

  // Średnia ligowa per atrybut dla zawodników na tej samej pozycji
  const leaguePosPeers = leaguePlayers.filter(p => p.position === player.position && p.id !== player.id);
  const leagueAttrAvg = (attr: TrainableAttribute): number =>
    leaguePosPeers.length > 0 ? average(leaguePosPeers.map(p => p.attributes[attr] ?? 0)) : 70;

  // Słaby: poniżej średniej ligowej dla tej cechy (z małą tolerancją ±noise)
  // Mocny: powyżej średniej ligowej dla tej cechy
  const weakAttributes = scored
    .filter(a => a.value < leagueAttrAvg(a.attr as TrainableAttribute) + noise - 2)
    .slice(0, 3)
    .map(({ attr, label, value }) => ({ attr, label, value }));

  const weakAttrsSet = new Set(weakAttributes.map(a => a.attr));

  const strongAttributes = [...scored]
    .filter(a => a.value > leagueAttrAvg(a.attr as TrainableAttribute) + noise + 2 && !weakAttrsSet.has(a.attr))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)
    .map(({ attr, label, value }) => ({ attr, label, value }));

  const posEff = average(keyAttrs.map(a => player.attributes[a] ?? 0));
  const posEffRelative = posEff - posAvgKeyAttrs;
  const positionEffectivenessScore = Math.round(posEff);
  const positionEffectivenessText = buildPositionEffectivenessText(posEffRelative, posEff, player.position, samePos.length);

  const isTeamTopOvr = !teamPlayers.find(p => p.id !== player.id && p.overallRating > player.overallRating);
  const isTopGoalscorer = player.position === PlayerPosition.FWD &&
    !teamPlayers.find(p => p.id !== player.id && p.position === PlayerPosition.FWD && (p.stats.goals ?? 0) > (player.stats.goals ?? 0));
  const isTopAssist = player.position === PlayerPosition.MID &&
    !teamPlayers.find(p => p.id !== player.id && p.position === PlayerPosition.MID && (p.stats.assists ?? 0) > (player.stats.assists ?? 0));

  const recommendedFocus = scored[0].attr as TrainableAttribute;
  const recommendedFocusLabel = scored[0].label;
  const bestCycle = chooseCycleForPosition(player, Math.random);

  // Wartość dla drużyny.relatywna do kolegów na pozycji
  const valueForTeam: 'WYSOKA' | 'SREDNIA' | 'NISKA' =
    relToPos > 7 ? 'WYSOKA' :
    relToPos > -5 ? 'SREDNIA' : 'NISKA';
  const valueColor =
    valueForTeam === 'WYSOKA' ? 'text-emerald-400' :
    valueForTeam === 'SREDNIA' ? 'text-amber-400' : 'text-rose-400';

  const developmentPotential: 'WYSOKI' | 'SREDNI' | 'NISKI' =
    (player.age < 21 && talent >= 70) || (player.age < 24 && talent >= 75) ? 'WYSOKI' :
    (player.age < 27 && talent >= 65) || (player.age < 30 && talent >= 72) ? 'SREDNI' :
    'NISKI';
  const potentialColor =
    developmentPotential === 'WYSOKI' ? 'text-emerald-400' :
    developmentPotential === 'SREDNI' ? 'text-amber-400' : 'text-rose-400';

  const notableTraits = TRAIT_DESCRIPTORS
    .filter(t => {
      const val = player.attributes[t.attr] ?? 0;
      const avg = leagueAttrAvg(t.attr);
      return val > avg + t.leagueBonus + noise;
    })
    .map(t => ({ label: t.label, isWarning: t.isWarning }));

  const traitsNarrative = buildNotableTraitsNarrative(notableTraits);
  const weakText = weakAttributes.length > 0
    ? `Zwróciłbym uwagę na ${weakAttributes.slice(0, 2).map(a => a.label.toLowerCase()).join(' i ')}, które odstają od ligowej normy na tej pozycji.`
    : '';
  const overallAssessment = buildOverallAssessment(
    player, relToPos, relToTeam, posAvgOvr, samePos.length,
    isTeamTopOvr, isTopGoalscorer, isTopAssist,
    seed, traitsNarrative, weakText
  );

  return {
    overallAssessment,
    valueForTeam,
    valueColor,
    weakAttributes,
    strongAttributes,
    notableTraits,
    recommendedFocus,
    recommendedFocusLabel,
    recommendedCycleName: bestCycle.name,
    developmentPotential,
    potentialColor,
    investmentText: buildInvestmentText(player),
    trainingRecommendationText: buildTrainingRecommendationText(player, scored[0].attr),
    positionEffectivenessText,
    positionEffectivenessScore
  };
};

export const TrainingAssistantService = {
  buildPlan(players: Player[], rng: () => number = Math.random, assistantIndividualWork: number = 10): TrainingAssistantPlan {
    const cycle = chooseCycle(players, rng);
    const playerFocuses = players.reduce<Record<string, TrainableAttribute>>((acc, player) => {
      acc[player.id] = chooseFocus(player, cycle, rng, assistantIndividualWork);
      return acc;
    }, {});

    return {
      cycleId: cycle.id,
      playerFocuses
    };
  }
};
