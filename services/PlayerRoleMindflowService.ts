import { Player, PlayerMoralePersonality } from '../types';

export type PlayerRoleConversationMood = 'CALM' | 'UNEASY' | 'UPSET' | 'ANGRY';
export type PlayerRoleConversationTone = 'EMPATHY' | 'HONESTY' | 'AUTHORITY';
export type PlayerRoleConversationOutcome = 'CONVINCED' | 'NOT_CONVINCED' | 'IGNORED';

export interface PlayerRoleConversationAnswer {
  id: string;
  text: string;
  tone: PlayerRoleConversationTone;
  points: number;
  reaction: string;
}

export interface PlayerRoleConversationQuestion {
  id: string;
  playerText: string;
  answers: PlayerRoleConversationAnswer[];
}

export interface PlayerRoleConversationSession {
  mood: PlayerRoleConversationMood;
  questions: PlayerRoleConversationQuestion[];
  currentQuestionIndex: number;
  score: number;
  targetScore: number;
  answeredCount: number;
  lastReaction: string | null;
}

export interface PlayerRoleConversationResult {
  outcome: PlayerRoleConversationOutcome;
  score: number;
  targetScore: number;
  moraleDelta: number;
  title: string;
  summary: string;
}

const QUESTION_POOL: PlayerRoleConversationQuestion[] = [
  {
    id: 'VALUE',
    playerText: 'Trenerze, chciałbym z panem porozmawiać. Mam wrażenie, że moja obecna rola nie odpowiada temu, ile mogę dać tej drużynie.',
    answers: [
      { id: 'VALUE_E', tone: 'EMPATHY', points: 3, text: 'Rozumiem twoją frustrację. Widzę twoją wartość i chcę uczciwie wyjaśnić, jak wygląda sytuacja.', reaction: 'Dobrze. Zależało mi przede wszystkim na tym, żeby trener potraktował mój temat poważnie.' },
      { id: 'VALUE_H', tone: 'HONESTY', points: 2, text: 'Doceniam twoje umiejętności, ale status musi wynikać z całego obrazu, nie tylko z ambicji.', reaction: 'Rozumiem, choć liczę na konkrety. Chcę wiedzieć, czego dokładnie mi brakuje.' },
      { id: 'VALUE_A', tone: 'AUTHORITY', points: -2, text: 'To trener ustala hierarchię. Twoim zadaniem jest zaakceptować decyzję i trenować.', reaction: 'Przyszedłem porozmawiać, a nie usłyszeć, że mam siedzieć cicho.' },
    ],
  },
  {
    id: 'MINUTES',
    playerText: 'Patrzę na liczbę minut i trudno mi zrozumieć, dlaczego zawodnicy w podobnej formie dostają więcej szans.',
    answers: [
      { id: 'MINUTES_H', tone: 'HONESTY', points: 3, text: 'Masz prawo o to pytać. Przy wyborze składu liczą się też rywal, taktyka i równowaga zespołu.', reaction: 'Jeśli za decyzjami stoi plan, jestem w stanie to przyjąć. Nie chcę tylko wypaść z obiegu.' },
      { id: 'MINUTES_E', tone: 'EMPATHY', points: 2, text: 'Wiem, że ławka jest trudna. Nie ignoruję twojej pracy i będę uważnie patrzył na kolejne tygodnie.', reaction: 'Doceniam to, ale chciałbym zobaczyć, że te słowa przełożą się na decyzje.' },
      { id: 'MINUTES_A', tone: 'AUTHORITY', points: -2, text: 'Minuty nie są przydzielane za samo niezadowolenie. Musisz zasłużyć na nie bez dyskusji.', reaction: 'Nie oczekuję prezentu. Oczekuję uczciwego traktowania.' },
    ],
  },
  {
    id: 'PROMISE',
    playerText: 'Czy może mi pan powiedzieć wprost, czy naprawdę jestem częścią planu na ten sezon?',
    answers: [
      { id: 'PROMISE_H', tone: 'HONESTY', points: 3, text: 'Jesteś częścią planu, ale nie będę obiecywał miejsca niezależnie od formy. Chcę uczciwej rywalizacji.', reaction: 'To brzmi rozsądnie. Potrzebuję jasnych zasad, a nie pustych obietnic.' },
      { id: 'PROMISE_E', tone: 'EMPATHY', points: 2, text: 'Nie zamierzam cię odstawić. Wiem, że możesz być ważny, nawet jeśli dziś hierarchia wygląda inaczej.', reaction: 'Dobrze to słyszeć. Nadal chciałbym mieć realną szansę, by to udowodnić.' },
      { id: 'PROMISE_A', tone: 'AUTHORITY', points: -2, text: 'Nikt nie ma gwarancji. Jeśli trzeba, cały sezon spędzisz na ławce.', reaction: 'W takim razie trudno mi uwierzyć, że klub widzi dla mnie miejsce.' },
    ],
  },
  {
    id: 'FORM',
    playerText: 'Uważam, że moja forma daje mi argumenty. Co jeszcze mam zrobić, żeby zasłużyć na większe zaufanie?',
    answers: [
      { id: 'FORM_H', tone: 'HONESTY', points: 3, text: 'Utrzymaj regularność i pokaż, że realizujesz założenia bez względu na rolę. Wtedy trudno będzie cię pominąć.', reaction: 'To jest konkret. Skupię się na tym i będę oczekiwał uczciwej oceny.' },
      { id: 'FORM_E', tone: 'EMPATHY', points: 2, text: 'Widzę postęp i nie chcę go lekceważyć. Potrzebuję jeszcze trochę czasu, żeby poukładać skład.', reaction: 'Mogę dać trenerowi trochę czasu, o ile naprawdę jestem obserwowany.' },
      { id: 'FORM_A', tone: 'AUTHORITY', points: -2, text: 'Jeśli musisz pytać, widocznie wciąż robisz za mało.', reaction: 'To nie daje mi żadnej odpowiedzi. Chcę wiedzieć, na czym stoję.' },
    ],
  },
  {
    id: 'RESPECT',
    playerText: 'Nie chodzi wyłącznie o nazwę statusu. Chcę czuć, że klub okazuje mi szacunek.',
    answers: [
      { id: 'RESPECT_E', tone: 'EMPATHY', points: 3, text: 'Masz rację, szacunek jest ważny. Powinienem lepiej komunikować ci decyzje, nawet gdy nie są dla ciebie łatwe.', reaction: 'Tego właśnie oczekiwałem. Nie musimy zgadzać się we wszystkim, ale rozmowa ma znaczenie.' },
      { id: 'RESPECT_H', tone: 'HONESTY', points: 2, text: 'Szanuję cię, ale nie mogę używać statusu jako gestu. Musi mieć sportowe uzasadnienie.', reaction: 'Rozumiem. Chcę tylko mieć pewność, że kryteria są takie same dla wszystkich.' },
      { id: 'RESPECT_A', tone: 'AUTHORITY', points: -2, text: 'Szacunek okazuje się pracą na treningu, a nie rozmowami o etykietach.', reaction: 'To nie jest odpowiedź na to, z czym do pana przyszedłem.' },
    ],
  },
  {
    id: 'COMPETITION',
    playerText: 'Czy naprawdę uważa pan, że zawodnicy przede mną są obecnie lepsi ode mnie?',
    answers: [
      { id: 'COMPETITION_H', tone: 'HONESTY', points: 3, text: 'W tej chwili dają mi nieco więcej w konkretnych zadaniach. To nie znaczy, że hierarchia jest zamknięta.', reaction: 'Nie jest mi łatwo to usłyszeć, ale przynajmniej wiem, że mogę coś zmienić.' },
      { id: 'COMPETITION_E', tone: 'EMPATHY', points: 2, text: 'Różnice są niewielkie. Rozumiem, dlaczego czujesz się pominięty, i będę oceniał was na bieżąco.', reaction: 'W porządku. Chcę, żeby moja praca rzeczywiście była brana pod uwagę.' },
      { id: 'COMPETITION_A', tone: 'AUTHORITY', points: -2, text: 'Skoro grają, to znaczy, że są lepsi. Nie ma sensu tego roztrząsać.', reaction: 'W takim razie ta rozmowa zaczyna tracić sens.' },
    ],
  },
  {
    id: 'PATIENCE',
    playerText: 'Jak długo mam jeszcze cierpliwie czekać? Nie chcę stracić kolejnych miesięcy.',
    answers: [
      { id: 'PATIENCE_H', tone: 'HONESTY', points: 3, text: 'Nie poproszę cię o cierpliwość bez końca. Najbliższe tygodnie pokażą, jak zmienia się twoja pozycja.', reaction: 'Mogę zaakceptować uczciwy okres oceny. Chcę tylko, żeby nie był bezterminowy.' },
      { id: 'PATIENCE_E', tone: 'EMPATHY', points: 2, text: 'Rozumiem obawę. Twoja kariera jest ważna i nie zamierzam trzymać cię w niepewności.', reaction: 'Dobrze. To dla mnie ważniejsze niż sama deklaracja statusu.' },
      { id: 'PATIENCE_A', tone: 'AUTHORITY', points: -2, text: 'Będziesz czekał tak długo, jak uznam to za potrzebne.', reaction: 'Nie mogę spokojnie zaakceptować takiego podejścia.' },
    ],
  },
  {
    id: 'TEAM',
    playerText: 'Mam wrażenie, że inni w szatni też nie rozumieją mojej sytuacji. To zaczyna wpływać na moje nastawienie.',
    answers: [
      { id: 'TEAM_E', tone: 'EMPATHY', points: 3, text: 'Nie chcę, żebyś czuł się odsunięty. Porozmawiajmy otwarcie i oddzielmy fakty od frustracji.', reaction: 'Doceniam to. Nie zależy mi na robieniu zamieszania w szatni.' },
      { id: 'TEAM_H', tone: 'HONESTY', points: 2, text: 'Rozumiem, ale hierarchii nie będziemy ustalać na podstawie komentarzy z szatni.', reaction: 'Zgoda. Mówię o tym tylko dlatego, że sytuacja nie dotyczy już wyłącznie mnie.' },
      { id: 'TEAM_A', tone: 'AUTHORITY', points: -2, text: 'Jeśli podważasz moje decyzje przy kolegach, to sam pogarszasz swoją sytuację.', reaction: 'Nie podważam decyzji. Próbuję wyjaśnić problem, zanim stanie się większy.' },
    ],
  },
  {
    id: 'AMBITION',
    playerText: 'Mam ambicje. Chcę rozwijać się i grać o coś więcej niż okazjonalne wejścia z ławki.',
    answers: [
      { id: 'AMBITION_E', tone: 'EMPATHY', points: 3, text: 'I właśnie takiego podejścia potrzebuję. Ambicja jest wartością, jeśli przekujesz ją w pracę dla zespołu.', reaction: 'Dokładnie o to mi chodzi. Chcę dostać możliwość pokazania tej ambicji na boisku.' },
      { id: 'AMBITION_H', tone: 'HONESTY', points: 2, text: 'Ambicja jest ważna, ale musi iść w parze z cierpliwością i regularnością.', reaction: 'Rozumiem. Nie chcę drogi na skróty, tylko uczciwej perspektywy.' },
      { id: 'AMBITION_A', tone: 'AUTHORITY', points: -2, text: 'Każdy mówi, że ma ambicje. To nie wyróżnia cię na tle reszty.', reaction: 'Liczyłem na poważniejszą odpowiedź.' },
    ],
  },
  {
    id: 'TACTICS',
    playerText: 'Czy problemem jest to, że nie pasuję do pana taktyki?',
    answers: [
      { id: 'TACTICS_H', tone: 'HONESTY', points: 3, text: 'Nie przekreślam cię taktycznie. Są elementy, które możesz poprawić, ale nadal widzę dla ciebie miejsce.', reaction: 'To ważne. Jeśli wiem, nad czym pracować, mogę odpowiedzieć na boisku.' },
      { id: 'TACTICS_E', tone: 'EMPATHY', points: 2, text: 'Każdy zawodnik potrzebuje chwili, żeby odnaleźć się w systemie. Nie zamykam przed tobą drzwi.', reaction: 'W porządku. Potrzebuję tylko pewności, że te drzwi naprawdę pozostają otwarte.' },
      { id: 'TACTICS_A', tone: 'AUTHORITY', points: -2, text: 'Jeśli nie pasujesz, musisz się dostosować. Taktyka nie będzie układana pod ciebie.', reaction: 'Nie prosiłem o ustawianie drużyny pode mnie. Chciałem zrozumieć decyzję.' },
    ],
  },
  {
    id: 'CONSISTENCY',
    playerText: 'Mam wrażenie, że po jednym słabszym meczu od razu tracę miejsce, a inni dostają więcej czasu.',
    answers: [
      { id: 'CONSISTENCY_E', tone: 'EMPATHY', points: 3, text: 'Rozumiem, że możesz tak to odbierać. Powinienem dawać ci czytelniejszą informację po meczach.', reaction: 'To pomogłoby mi skupić się na grze zamiast zastanawiać się, co właściwie się zmieniło.' },
      { id: 'CONSISTENCY_H', tone: 'HONESTY', points: 2, text: 'Nie chodzi o jeden mecz. Oceniam serię występów, treningi i to, czego potrzebuje zespół.', reaction: 'Przyjmuję to, choć będę chciał zobaczyć, że ta zasada działa wobec wszystkich.' },
      { id: 'CONSISTENCY_A', tone: 'AUTHORITY', points: -2, text: 'Jeżeli jeden słabszy mecz wystarcza, żebyś wypadł ze składu, powinieneś grać lepiej.', reaction: 'Takie podejście nie pomaga mi zrozumieć sytuacji.' },
    ],
  },
  {
    id: 'FUTURE',
    playerText: 'Czy mam rozumieć, że jeśli nic się nie zmieni, klub nie będzie robił mi problemów przy odejściu?',
    answers: [
      { id: 'FUTURE_H', tone: 'HONESTY', points: 3, text: 'Najpierw spróbujmy poprawić sytuację tutaj. Jeśli nie znajdziemy rozwiązania, wrócimy do tematu uczciwie.', reaction: 'To rozsądne. Nie chcę odchodzić pochopnie, ale muszę myśleć o swojej karierze.' },
      { id: 'FUTURE_E', tone: 'EMPATHY', points: 2, text: 'Rozumiem, że bierzesz to pod uwagę. Chcę jednak najpierw odzyskać twoje zaufanie do naszego planu.', reaction: 'Jestem gotów wysłuchać planu, jeśli za słowami pójdą działania.' },
      { id: 'FUTURE_A', tone: 'AUTHORITY', points: -2, text: 'Masz kontrakt i klub zdecyduje, czy gdziekolwiek odejdziesz.', reaction: 'Właśnie dlatego chciałem porozmawiać, zanim sytuacja stanie się naprawdę trudna.' },
    ],
  },
  {
    id: 'TRAINING',
    playerText: 'Na treningach daję z siebie wszystko. Czy sztab naprawdę tego nie widzi?',
    answers: [
      { id: 'TRAINING_E', tone: 'EMPATHY', points: 3, text: 'Widzimy twoją pracę i nie przechodzimy obok niej obojętnie. To jeden z powodów, dla których rozmawiamy.', reaction: 'Dobrze wiedzieć, że ta praca nie znika bez śladu.' },
      { id: 'TRAINING_H', tone: 'HONESTY', points: 2, text: 'Widzę zaangażowanie. Teraz potrzebuję, żebyś utrzymał ten poziom i przeniósł go na mecze.', reaction: 'To uczciwe. Będę gotowy, kiedy pojawi się okazja.' },
      { id: 'TRAINING_A', tone: 'AUTHORITY', points: -2, text: 'Ciężki trening to minimum, a nie argument za specjalnym traktowaniem.', reaction: 'Nie prosiłem o specjalne traktowanie. Chciałem wiedzieć, czy moja praca ma znaczenie.' },
    ],
  },
  {
    id: 'LEADERSHIP',
    playerText: 'Czuję odpowiedzialność za ten zespół. Trudno mi ją brać na siebie, gdy moja pozycja pozostaje niejasna.',
    answers: [
      { id: 'LEADERSHIP_E', tone: 'EMPATHY', points: 3, text: 'Doceniam, że myślisz o drużynie. Możesz być ważnym głosem także wtedy, gdy hierarchia jeszcze się układa.', reaction: 'To dla mnie ważne. Chcę pomagać drużynie, a nie walczyć z nią o własną pozycję.' },
      { id: 'LEADERSHIP_H', tone: 'HONESTY', points: 2, text: 'Lider pokazuje wartość również w trudniejszym momencie. To może działać na twoją korzyść.', reaction: 'Rozumiem. Postaram się zachować właściwe podejście.' },
      { id: 'LEADERSHIP_A', tone: 'AUTHORITY', points: -2, text: 'Najpierw zapracuj na pozycję, dopiero później mów o odpowiedzialności.', reaction: 'Nie sądzę, żebyśmy w ten sposób doszli do porozumienia.' },
    ],
  },
  {
    id: 'ROLE_NAME',
    playerText: 'Skoro widzi pan dla mnie miejsce, dlaczego po prostu nie może pan zmienić mojego statusu już teraz?',
    answers: [
      { id: 'ROLE_NAME_H', tone: 'HONESTY', points: 3, text: 'Bo status powinien potwierdzać rzeczywistość, a nie ją wyprzedzać. Chcę, żebyś wywalczył go na boisku.', reaction: 'Nie jest to odpowiedź, na którą liczyłem, ale rozumiem jej logikę.' },
      { id: 'ROLE_NAME_E', tone: 'EMPATHY', points: 2, text: 'Rozumiem, że taki gest byłby dla ciebie ważny. Potrzebuję jednak jeszcze trochę czasu na ocenę zespołu.', reaction: 'Mogę to przyjąć, jeśli rzeczywiście nie zostanę odsunięty na bok.' },
      { id: 'ROLE_NAME_A', tone: 'AUTHORITY', points: -2, text: 'Bo nie będę zmieniał decyzji tylko dlatego, że przyszedłeś do mojego gabinetu.', reaction: 'Nie oczekiwałem automatycznej zgody. Oczekiwałem rozmowy.' },
    ],
  },
  {
    id: 'TRUST',
    playerText: 'Mam zaufać, że sytuacja się poprawi. Co ma sprawić, że tym razem będzie inaczej?',
    answers: [
      { id: 'TRUST_H', tone: 'HONESTY', points: 3, text: 'Nie proszę o ślepe zaufanie. Oceniaj mnie po decyzjach w najbliższych tygodniach, tak jak ja oceniam ciebie.', reaction: 'To uczciwe postawienie sprawy. Dam tej sytuacji jeszcze szansę.' },
      { id: 'TRUST_E', tone: 'EMPATHY', points: 2, text: 'Rozumiem twoją ostrożność. Chcę odbudować zaufanie spokojnie, bez składania obietnic bez pokrycia.', reaction: 'Doceniam, że nie próbuje mnie pan zbyć łatwą deklaracją.' },
      { id: 'TRUST_A', tone: 'AUTHORITY', points: -2, text: 'Nie muszę cię przekonywać. Masz wykonywać swoją pracę.', reaction: 'W takim razie nie wiem, po co w ogóle zaczęliśmy tę rozmowę.' },
    ],
  },
  {
    id: 'PRESSURE',
    playerText: 'Nie chcę stawiać ultimatum, ale obecna sytuacja naprawdę zaczyna mnie męczyć.',
    answers: [
      { id: 'PRESSURE_E', tone: 'EMPATHY', points: 3, text: 'Słyszę to i nie zamierzam bagatelizować sprawy. Spróbujmy znaleźć rozwiązanie bez niepotrzebnego konfliktu.', reaction: 'Na tym mi zależy. Nie przyszedłem tutaj po to, żeby robić awanturę.' },
      { id: 'PRESSURE_H', tone: 'HONESTY', points: 2, text: 'Rozumiem, ale presja nie może decydować o składzie. Mogę obiecać ci uczciwą ocenę.', reaction: 'Akceptuję to. Chcę być oceniany uczciwie, nie uprzywilejowany.' },
      { id: 'PRESSURE_A', tone: 'AUTHORITY', points: -2, text: 'Jeśli to ma być ultimatum, rozmowa może skończyć się od razu.', reaction: 'Wyraźnie powiedziałem, że nie chcę ultimatum. Widzę jednak, że trudno się porozumieć.' },
    ],
  },
  {
    id: 'EXAMPLE',
    playerText: 'Patrzę na innych zawodników i widzę, że ich status zmienia się szybciej. Dlaczego wobec mnie jest inaczej?',
    answers: [
      { id: 'EXAMPLE_H', tone: 'HONESTY', points: 3, text: 'Każda sytuacja jest inna. Mogę jednak przyznać, że powinienem wyraźniej komunikować ci kryteria.', reaction: 'Właśnie tego potrzebuję. Nie oczekuję porównywania mnie z każdym kolegą.' },
      { id: 'EXAMPLE_E', tone: 'EMPATHY', points: 2, text: 'Rozumiem, że może to wyglądać niesprawiedliwie. Przyjrzę się temu jeszcze raz bez uprzedzeń.', reaction: 'Dobrze. Zależy mi, żeby moja sytuacja została oceniona naprawdę indywidualnie.' },
      { id: 'EXAMPLE_A', tone: 'AUTHORITY', points: -2, text: 'Nie interesuj się statusem kolegów. Skup się na sobie.', reaction: 'Skupiam się na sobie, ale trudno nie zauważyć różnych standardów.' },
    ],
  },
  {
    id: 'DECISION',
    playerText: 'Potrzebuję jasnej odpowiedzi: czy jest pan gotów jeszcze raz przemyśleć moją rolę?',
    answers: [
      { id: 'DECISION_H', tone: 'HONESTY', points: 3, text: 'Tak. Nie obiecuję zmiany od razu, ale twoje argumenty biorę poważnie i hierarchia nie jest zamknięta.', reaction: 'Taka odpowiedź mi wystarczy. Chcę mieć poczucie, że nadal mogę wpłynąć na swoją sytuację.' },
      { id: 'DECISION_E', tone: 'EMPATHY', points: 2, text: 'Tak. Widzę, że to dla ciebie ważne, i nie chcę kończyć rozmowy bez realnej refleksji.', reaction: 'Dziękuję. Tego oczekiwałem, przychodząc na tę rozmowę.' },
      { id: 'DECISION_A', tone: 'AUTHORITY', points: -2, text: 'Moja decyzja została podjęta. Nie będziemy wracać do tego tematu.', reaction: 'W takim razie nie czuję, żeby ta rozmowa cokolwiek zmieniła.' },
    ],
  },
  {
    id: 'CLOSING',
    playerText: 'Jeśli mam odpuścić temat statusu, potrzebuję wiedzieć, że ta rozmowa naprawdę coś dla pana znaczyła.',
    answers: [
      { id: 'CLOSING_E', tone: 'EMPATHY', points: 3, text: 'Znaczyła. Doceniam, że przyszedłeś porozmawiać wprost. Chcę, żebyśmy dalej pracowali bez niepotrzebnego napięcia.', reaction: 'W porządku, trenerze. Dajmy sobie szansę rozwiązać to na boisku.' },
      { id: 'CLOSING_H', tone: 'HONESTY', points: 2, text: 'Tak. Nie zmienię zasad, ale twoje argumenty będą miały znaczenie przy kolejnych decyzjach.', reaction: 'Przyjmuję to. Będę oczekiwał, że za tą rozmową pójdzie uczciwa ocena.' },
      { id: 'CLOSING_A', tone: 'AUTHORITY', points: -2, text: 'Powiedziałem już wszystko. Wracaj do treningów.', reaction: 'Rozumiem. Wygląda na to, że nie mamy już o czym rozmawiać.' },
    ],
  },
];

const MOOD_LABELS: Record<PlayerRoleConversationMood, string> = {
  CALM: 'Spokojny',
  UNEASY: 'Zaniepokojony',
  UPSET: 'Rozdrażniony',
  ANGRY: 'Wściekły',
};

const stableHash = (input: string): number => {
  let hash = 0;
  for (let index = 0; index < input.length; index++) {
    hash = ((hash << 5) - hash + input.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9973) * 10000;
  return x - Math.floor(x);
};

const shuffle = <T,>(items: T[], seed: number): T[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(seededRandom(seed + index * 31) * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

const getPreferredTone = (personality: PlayerMoralePersonality): PlayerRoleConversationTone => {
  if (personality === 'PROFESSIONAL' || personality === 'CONFIDENT') return 'HONESTY';
  if (personality === 'AMBITIOUS' || personality === 'EGOIST') return 'AUTHORITY';
  return 'EMPATHY';
};

const getMood = (player: Player): PlayerRoleConversationMood => {
  const morale = player.morale ?? 50;
  if (morale <= 19) return 'ANGRY';
  if (morale <= 34) return 'UPSET';
  if (morale <= 49) return 'UNEASY';
  return 'CALM';
};

const getQuestionCount = (mood: PlayerRoleConversationMood, seed: number): number => {
  const base = mood === 'CALM' ? 3 : mood === 'UNEASY' ? 4 : mood === 'UPSET' ? 5 : 6;
  return Math.min(7, base + (seededRandom(seed + 19) > 0.62 ? 1 : 0));
};

export const PlayerRoleMindflowService = {
  getMoodLabel: (mood: PlayerRoleConversationMood): string => MOOD_LABELS[mood],

  createSession: (player: Player, date: Date, sessionSeed: number): PlayerRoleConversationSession => {
    const seed = sessionSeed + stableHash(`${player.id}_${date.toISOString().split('T')[0]}`);
    const mood = getMood(player);
    const questionCount = getQuestionCount(mood, seed);
    const moodDifficulty = mood === 'CALM' ? 0 : mood === 'UNEASY' ? 1 : mood === 'UPSET' ? 2 : 3;

    return {
      mood,
      questions: shuffle(QUESTION_POOL, seed).slice(0, questionCount),
      currentQuestionIndex: 0,
      score: 0,
      targetScore: Math.min(questionCount * 3, questionCount * 2 + moodDifficulty),
      answeredCount: 0,
      lastReaction: null,
    };
  },

  answer: (session: PlayerRoleConversationSession, player: Player, answer: PlayerRoleConversationAnswer): PlayerRoleConversationSession => {
    const personality = player.moralePersonality ?? 'CALM';
    const preferredTone = getPreferredTone(personality);
    const toneBonus = answer.points > 0 && answer.tone === preferredTone ? 1 : 0;

    return {
      ...session,
      score: session.score + answer.points + toneBonus,
      answeredCount: session.answeredCount + 1,
      currentQuestionIndex: session.currentQuestionIndex + 1,
      lastReaction: answer.reaction,
    };
  },

  finish: (session: PlayerRoleConversationSession, ignored = false): PlayerRoleConversationResult => {
    if (ignored) {
      return {
        outcome: 'IGNORED',
        score: session.score,
        targetScore: session.targetScore,
        moraleDelta: -2,
        title: 'Rozmowa przerwana',
        summary: 'Zawodnik odebrał zakończenie rozmowy jako zlekceważenie problemu. Jego żądanie pozostaje aktywne.',
      };
    }

    const convinced = session.score >= session.targetScore;
    return convinced
      ? {
          outcome: 'CONVINCED',
          score: session.score,
          targetScore: session.targetScore,
          moraleDelta: 3,
          title: 'Zawodnik przekonany',
          summary: 'Zawodnik zaakceptował wyjaśnienia trenera i wycofał żądanie natychmiastowej zmiany statusu.',
        }
      : {
          outcome: 'NOT_CONVINCED',
          score: session.score,
          targetScore: session.targetScore,
          moraleDelta: -4,
          title: 'Brak porozumienia',
          summary: 'Zawodnik nie przyjął argumentów trenera. Jego żądanie pozostaje aktywne.',
        };
  },
};
