import { Player, PlayerMoralePersonality } from '../types';

export type PlayerTransferConversationMood = 'OPEN' | 'RESTLESS' | 'DETERMINED' | 'HOSTILE';
export type PlayerTransferConversationTone = 'RESPECT' | 'PLAN' | 'FIRMNESS';
export type PlayerTransferConversationOutcome = 'ACCEPTED_PLAN' | 'INSISTS_ON_LEAVING' | 'IGNORED';

export interface PlayerTransferConversationAnswer {
  id: string;
  text: string;
  tone: PlayerTransferConversationTone;
  points: number;
  reaction: string;
}

export interface PlayerTransferConversationQuestion {
  id: string;
  playerText: string;
  answers: PlayerTransferConversationAnswer[];
}

export interface PlayerTransferConversationSession {
  mood: PlayerTransferConversationMood;
  questions: PlayerTransferConversationQuestion[];
  currentQuestionIndex: number;
  score: number;
  targetScore: number;
  answeredCount: number;
  lastReaction: string | null;
  uncertaintyModifier: number;
}

export interface PlayerTransferConversationResult {
  outcome: PlayerTransferConversationOutcome;
  score: number;
  targetScore: number;
  moraleDelta: number;
  title: string;
  summary: string;
}

const QUESTIONS: PlayerTransferConversationQuestion[] = [
  {
    id: 'BLOCKED',
    playerText: 'Trenerze, chciałbym porozmawiać o swojej przyszłości. Mam wrażenie, że status „nie na sprzedaż” zamyka mi drogę do kolejnego kroku w karierze.',
    answers: [
      { id: 'BLOCKED_R', tone: 'RESPECT', points: 3, text: 'Nie chcę blokować twojej kariery. Chronimy cię, bo jesteś ważny, ale uczciwie wysłuchamy naprawdę dobrej oferty.', reaction: 'Doceniam to, ale chcę mieć pewność, że klub rzeczywiście będzie gotowy rozmawiać.' },
      { id: 'BLOCKED_P', tone: 'PLAN', points: 2, text: 'Status nie oznacza zamkniętych drzwi. Oznacza tylko, że odejście musi mieć sens sportowy dla ciebie i dla klubu.', reaction: 'Rozumiem logikę, chociaż nie chcę, żeby stała się wygodnym pretekstem do odrzucania wszystkiego.' },
      { id: 'BLOCKED_F', tone: 'FIRMNESS', points: -2, text: 'Masz kontrakt i jesteś nam potrzebny. Na dziś nie ma tematu odejścia.', reaction: 'Właśnie takiej odpowiedzi się obawiałem. To brzmi jak zamknięcie rozmowy.' },
    ],
  },
  {
    id: 'AMBITION',
    playerText: 'Czuję, że jestem gotowy sprawdzić się na wyższym poziomie. Nie chcę przegapić właściwego momentu.',
    answers: [
      { id: 'AMBITION_R', tone: 'RESPECT', points: 3, text: 'Rozumiem twoją ambicję i nie zamierzam jej tłumić. Chcę tylko, żeby kolejny klub był dla ciebie realnym krokiem naprzód.', reaction: 'To jest dla mnie ważne. Nie chcę odchodzić gdziekolwiek, ale chcę mieć możliwość rozwoju.' },
      { id: 'AMBITION_P', tone: 'PLAN', points: 3, text: 'Ustalmy wspólne kryterium: odpowiedni poziom sportowy klubu i oferta, która odzwierciedla twoją wartość.', reaction: 'Jeśli kryteria będą uczciwe, jestem gotów ich wysłuchać.' },
      { id: 'AMBITION_F', tone: 'FIRMNESS', points: -1, text: 'W tym sezonie twoje ambicje muszą zejść na dalszy plan. Najważniejsza jest drużyna.', reaction: 'Zawsze daję drużynie wszystko, ale moja kariera też ma znaczenie.' },
    ],
  },
  {
    id: 'OFFERS',
    playerText: 'Co dokładnie oznacza „dobra oferta”? Nie chcę później usłyszeć, że żadna propozycja nie była wystarczająca.',
    answers: [
      { id: 'OFFERS_P', tone: 'PLAN', points: 3, text: 'Klub musi odpowiadać twojemu poziomowi, a warunki nie mogą być przypadkowe. Nie sprzedamy cię pierwszemu chętnemu tylko po to, żeby zamknąć temat.', reaction: 'To brzmi rozsądnie. Zależy mi na jakości następnego kroku, nie na samym transferze.' },
      { id: 'OFFERS_R', tone: 'RESPECT', points: 2, text: 'Będziemy oceniać propozycje poważnie i bez uprzedzeń. Jeśli pojawi się właściwy kierunek, porozmawiamy otwarcie.', reaction: 'Dobrze. Oczekuję właśnie otwartej rozmowy, kiedy pojawią się konkrety.' },
      { id: 'OFFERS_F', tone: 'FIRMNESS', points: -2, text: 'To klub ustali cenę i sam oceni, czy oferta jest wystarczająca. Nie muszę składać deklaracji.', reaction: 'W takim razie nadal nie mam żadnej gwarancji, że naprawdę bierzecie pod uwagę moje zdanie.' },
    ],
  },
  {
    id: 'TRUST',
    playerText: 'Skąd mam wiedzieć, że kiedy pojawi się propozycja, klub nie odrzuci jej automatycznie?',
    answers: [
      { id: 'TRUST_R', tone: 'RESPECT', points: 3, text: 'Nie proszę cię o ślepe zaufanie. Oceniaj nas po tym, jak potraktujemy realne oferty. Ja zobowiązuję się rozmawiać z tobą wprost.', reaction: 'Taka deklaracja ma dla mnie znaczenie. Chcę być partnerem w tej rozmowie.' },
      { id: 'TRUST_P', tone: 'PLAN', points: 2, text: 'Każdą poważną propozycję przeanalizujemy osobno. Status ochronny nie będzie automatycznym wetem.', reaction: 'W porządku. Potrzebuję zobaczyć, że ten plan naprawdę działa w praktyce.' },
      { id: 'TRUST_F', tone: 'FIRMNESS', points: -2, text: 'Musisz zaufać decyzjom klubu. Nie będziemy konsultować z tobą każdej oferty.', reaction: 'To moja przyszłość. Trudno mi zaakceptować, że mam nie mieć nic do powiedzenia.' },
    ],
  },
  {
    id: 'VALUE',
    playerText: 'Rozumiem, że jestem ważny dla drużyny, ale czy to ma oznaczać, że właśnie dlatego nie mogę odejść?',
    answers: [
      { id: 'VALUE_R', tone: 'RESPECT', points: 3, text: 'Twoja wartość nie może być dla ciebie karą. Dlatego chcemy znaleźć rozwiązanie, które nie będzie pochopne ani niesprawiedliwe.', reaction: 'Dobrze to słyszeć. Nie chcę być ukarany za to, że daję drużynie jakość.' },
      { id: 'VALUE_P', tone: 'PLAN', points: 2, text: 'Twoja rola podnosi wymagania wobec potencjalnego transferu. Następny krok powinien być naprawdę wart zmiany.', reaction: 'Zgadzam się, pod warunkiem że klub nie będzie celowo stawiał zaporowych warunków.' },
      { id: 'VALUE_F', tone: 'FIRMNESS', points: -2, text: 'Najlepsi zawodnicy są potrzebni najbardziej. To naturalne, że nie chcemy cię oddawać.', reaction: 'Naturalne dla klubu, ale niekoniecznie dobre dla mojej kariery.' },
    ],
  },
  {
    id: 'TIMING',
    playerText: 'Jeśli mam jeszcze zostać, chcę wiedzieć, czy rozmawiamy o kilku tygodniach, czy o całym sezonie.',
    answers: [
      { id: 'TIMING_P', tone: 'PLAN', points: 3, text: 'Nie będę udawał, że znam dokładną datę. Uzgodnijmy jednak, że przy poważnej ofercie wracamy do rozmowy bez zwłoki.', reaction: 'To uczciwe. Nie oczekuję daty z kalendarza, tylko realnej otwartości.' },
      { id: 'TIMING_R', tone: 'RESPECT', points: 2, text: 'Rozumiem, że nie chcesz czekać bez końca. Będę informował cię jasno, jeśli stanowisko klubu się zmieni.', reaction: 'Dobrze. Najgorsza byłaby dla mnie cisza i ciągłe odkładanie tematu.' },
      { id: 'TIMING_F', tone: 'FIRMNESS', points: -2, text: 'Nie będę wyznaczał terminów. Skup się na grze, a klub zajmie się resztą.', reaction: 'To nie odpowiada na moje pytanie. Nie chcę odkładać kariery na czas nieokreślony.' },
    ],
  },
  {
    id: 'CLUB_LEVEL',
    playerText: 'Czy klub odrzuci ofertę tylko dlatego, że uzna zainteresowany zespół za zbyt słaby?',
    answers: [
      { id: 'CLUB_LEVEL_P', tone: 'PLAN', points: 3, text: 'Będziemy patrzeć na poziom sportowy, rolę, którą ci proponują, i realną perspektywę rozwoju. Sama nazwa klubu nie wystarczy.', reaction: 'To rozsądne kryteria. Sam też nie chcę podejmować decyzji wyłącznie na podstawie nazwy.' },
      { id: 'CLUB_LEVEL_R', tone: 'RESPECT', points: 2, text: 'Twoje zdanie również będzie ważne. Jeśli uznasz kierunek za dobry, nie zignorujemy tego bez rozmowy.', reaction: 'Właśnie o to proszę. Chcę być traktowany poważnie przy wyborze kolejnego kroku.' },
      { id: 'CLUB_LEVEL_F', tone: 'FIRMNESS', points: -1, text: 'Jeżeli uznamy klub za niewłaściwy, oferta zostanie odrzucona. Nie będziemy ryzykować.', reaction: 'Rozumiem ostrożność, ale chcę mieć wpływ na ocenę tego ryzyka.' },
    ],
  },
  {
    id: 'PROMISE',
    playerText: 'Czy może mi pan obiecać, że nie będziecie zatrzymywać mnie za wszelką cenę?',
    answers: [
      { id: 'PROMISE_R', tone: 'RESPECT', points: 3, text: 'Mogę obiecać uczciwe podejście. Nie oddamy cię przypadkowo, ale nie będziemy też udawać, że twoje ambicje nie istnieją.', reaction: 'To wystarczy. Nie potrzebuję łatwej obietnicy, tylko uczciwego traktowania.' },
      { id: 'PROMISE_P', tone: 'PLAN', points: 2, text: 'Nie ma automatycznej zgody ani automatycznej odmowy. Jest wspólna ocena konkretnej propozycji.', reaction: 'Przyjmuję to. Chcę zobaczyć takie podejście, gdy pojawi się oferta.' },
      { id: 'PROMISE_F', tone: 'FIRMNESS', points: -2, text: 'Nie będę składał obietnic transferowych. Klub musi chronić własny interes.', reaction: 'A ja muszę chronić własną karierę. Wygląda na to, że nadal patrzymy na sprawę zupełnie inaczej.' },
    ],
  },
  {
    id: 'CLOSING',
    playerText: 'Czyli mam zostać, pracować normalnie i wierzyć, że klub podejdzie uczciwie do właściwej oferty?',
    answers: [
      { id: 'CLOSING_R', tone: 'RESPECT', points: 3, text: 'Tak. Doceniam, że mówisz o tym otwarcie. Nie chcę cię stracić, ale nie chcę też budować tej relacji na przymusie.', reaction: 'W porządku, trenerze. Daję klubowi kredyt zaufania, ale będę pamiętał o tej rozmowie.' },
      { id: 'CLOSING_P', tone: 'PLAN', points: 3, text: 'Tak. Status „nie na sprzedaż” pozostaje, ale traktujemy go jako ochronę przed przypadkowym transferem, nie jako zakaz rozmów.', reaction: 'Mogę to zaakceptować. Najważniejsze, żeby status nie stał się zamkniętymi drzwiami.' },
      { id: 'CLOSING_F', tone: 'FIRMNESS', points: -2, text: 'Masz zostać i grać najlepiej, jak potrafisz. Na tym zakończmy temat.', reaction: 'Rozumiem stanowisko. Nie oznacza to jednak, że się z nim zgadzam.' },
    ],
  },
];

const stableHash = (input: string): number => {
  let hash = 0;
  for (let index = 0; index < input.length; index++) {
    hash = ((hash << 5) - hash + input.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 7919) * 10000;
  return x - Math.floor(x);
};

const shuffle = <T,>(items: T[], seed: number): T[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(seededRandom(seed + index * 37) * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

const getMood = (player: Player): PlayerTransferConversationMood => {
  const morale = player.morale ?? 50;
  if (morale <= 20) return 'HOSTILE';
  if (morale <= 34) return 'DETERMINED';
  if (morale <= 49) return 'RESTLESS';
  return 'OPEN';
};

const getPreferredTone = (personality: PlayerMoralePersonality): PlayerTransferConversationTone => {
  if (personality === 'PROFESSIONAL' || personality === 'AMBITIOUS' || personality === 'CONFIDENT') return 'PLAN';
  if (personality === 'EGOIST') return 'FIRMNESS';
  return 'RESPECT';
};

export const PlayerTransferMindflowService = {
  getMoodLabel: (mood: PlayerTransferConversationMood): string => {
    if (mood === 'HOSTILE') return 'Bardzo napięty';
    if (mood === 'DETERMINED') return 'Zdecydowany';
    if (mood === 'RESTLESS') return 'Niespokojny';
    return 'Otwarty na rozmowę';
  },

  createSession: (player: Player, date: Date, sessionSeed: number): PlayerTransferConversationSession => {
    const seed = sessionSeed + stableHash(`${player.id}_${date.toISOString().slice(0, 10)}_TRANSFER`);
    const mood = getMood(player);
    const questionCount = mood === 'OPEN' ? 3 : mood === 'RESTLESS' ? 4 : mood === 'DETERMINED' ? 5 : 6;
    const personality = player.moralePersonality ?? 'CALM';
    const personalityResistance = personality === 'EGOIST' ? 3 : personality === 'AMBITIOUS' ? 2 : personality === 'CONFIDENT' ? 1 : personality === 'LOYAL' ? -2 : 0;
    const moodResistance = mood === 'HOSTILE' ? 3 : mood === 'DETERMINED' ? 2 : mood === 'RESTLESS' ? 1 : 0;
    const uncertaintyModifier = Math.floor(seededRandom(seed + 101) * 5) - 2;

    return {
      mood,
      questions: shuffle(QUESTIONS, seed).slice(0, questionCount),
      currentQuestionIndex: 0,
      score: 0,
      targetScore: Math.min(questionCount * 3, questionCount * 2 + personalityResistance + moodResistance + uncertaintyModifier),
      answeredCount: 0,
      lastReaction: null,
      uncertaintyModifier,
    };
  },

  answer: (session: PlayerTransferConversationSession, player: Player, answer: PlayerTransferConversationAnswer): PlayerTransferConversationSession => {
    const preferredTone = getPreferredTone(player.moralePersonality ?? 'CALM');
    const toneBonus = answer.points > 0 && answer.tone === preferredTone ? 1 : 0;
    return {
      ...session,
      currentQuestionIndex: session.currentQuestionIndex + 1,
      answeredCount: session.answeredCount + 1,
      score: session.score + answer.points + toneBonus,
      lastReaction: answer.reaction,
    };
  },

  finish: (session: PlayerTransferConversationSession, ignored = false): PlayerTransferConversationResult => {
    if (ignored) {
      return {
        outcome: 'IGNORED',
        score: session.score,
        targetScore: session.targetScore,
        moraleDelta: -3,
        title: 'Rozmowa przerwana',
        summary: 'Zawodnik uznał, że trener nie traktuje jego przyszłości poważnie. Nadal domaga się otwarcia drogi do transferu.',
      };
    }

    if (session.score >= session.targetScore) {
      return {
        outcome: 'ACCEPTED_PLAN',
        score: session.score,
        targetScore: session.targetScore,
        moraleDelta: 3,
        title: 'Kredyt zaufania',
        summary: 'Zawodnik zaakceptował status „nie na sprzedaż” jako ochronę przed przypadkowym transferem. Oczekuje jednak uczciwej rozmowy przy naprawdę dobrej ofercie.',
      };
    }

    return {
      outcome: 'INSISTS_ON_LEAVING',
      score: session.score,
      targetScore: session.targetScore,
      moraleDelta: -5,
      title: 'Zawodnik pozostaje nieprzekonany',
      summary: 'Zawodnik nie zgadza się z polityką klubu i nadal chce otwarcia drogi do odejścia.',
    };
  },
};
