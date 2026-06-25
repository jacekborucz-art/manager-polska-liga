import { Player, PlayerMoralePersonality } from '../types';

export type PlayerTransferListObjectionOutcome = 'CONVINCED' | 'BROKEN' | 'IGNORED';
export type PlayerTransferListObjectionTone = 'EMPATHY' | 'HONESTY' | 'AUTHORITY';

export interface PlayerTransferListObjectionAnswer {
  id: string;
  text: string;
  tone: PlayerTransferListObjectionTone;
  points: number;
  reaction: string;
}

export interface PlayerTransferListObjectionQuestion {
  id: string;
  playerText: string;
  answers: PlayerTransferListObjectionAnswer[];
}

export interface PlayerTransferListObjectionSession {
  questions: PlayerTransferListObjectionQuestion[];
  currentQuestionIndex: number;
  score: number;
  targetScore: number;
  answeredCount: number;
  diceRoll: number;
  lastReaction: string | null;
}

export interface PlayerTransferListObjectionResult {
  outcome: PlayerTransferListObjectionOutcome;
  score: number;
  targetScore: number;
  diceRoll: number;
  moraleDelta: number;
  moraleToMinimum: boolean;
  removeFromTransferList: boolean;
  title: string;
  summary: string;
}

const QUESTIONS: PlayerTransferListObjectionQuestion[] = [
  {
    id: 'WHY',
    playerText: 'Trenerze, zobaczyłem, że jestem na liście transferowej. Nie prosiłem o odejście. Chcę wiedzieć, dlaczego klub tak zdecydował.',
    answers: [
      { id: 'WHY_H', tone: 'HONESTY', points: 3, text: 'To decyzja sportowa, nie osobista. Muszę przebudować kadrę i szukać środków, ale chcę ci uczciwie wyjaśnić cały kontekst.', reaction: 'Doceniam, że mówi pan wprost. Nadal boli, ale przynajmniej rozumiem, że to nie jest kara.' },
      { id: 'WHY_E', tone: 'EMPATHY', points: 2, text: 'Rozumiem, że to dla ciebie szok. Powinienem był porozmawiać z tobą wcześniej i biorę za to odpowiedzialność.', reaction: 'Właśnie tego zabrakło. Chciałem usłyszeć to od trenera, nie zobaczyć w statusie.' },
      { id: 'WHY_A', tone: 'AUTHORITY', points: -3, text: 'Klub ma prawo wystawić zawodnika na listę. Nie każda decyzja wymaga wcześniejszej zgody piłkarza.', reaction: 'Czyli mam po prostu przyjąć, że ktoś zdecydował o mojej przyszłości za moimi plecami.' },
    ],
  },
  {
    id: 'PLACE',
    playerText: 'Czy ja w ogóle mam jeszcze miejsce w tej drużynie? Bo jeśli nie, chcę usłyszeć to jasno.',
    answers: [
      { id: 'PLACE_H', tone: 'HONESTY', points: 3, text: 'Masz miejsce, jeśli pokażesz, że jesteś gotów walczyć. Lista nie zamyka ci drzwi do składu, ale sytuacja jest poważna.', reaction: 'To trudne, ale konkretne. Jeśli nadal mogę coś zmienić, chcę wiedzieć, na jakich zasadach.' },
      { id: 'PLACE_E', tone: 'EMPATHY', points: 2, text: 'Nie skreślam cię jako człowieka ani zawodnika. Chcę jednak być uczciwy: rozważamy różne scenariusze.', reaction: 'Rozumiem, choć to dalej brzmi niepewnie. Potrzebuję poczuć, że nie jestem tylko numerem w budżecie.' },
      { id: 'PLACE_A', tone: 'AUTHORITY', points: -2, text: 'Twoje miejsce zależy od tego, czy zaakceptujesz decyzję klubu bez robienia problemu.', reaction: 'Robieniem problemu nazywa pan to, że pytam o własną przyszłość?' },
    ],
  },
  {
    id: 'STAY',
    playerText: 'Chcę zostać i udowodnić swoją wartość. Czy trener jest gotów dać mi jeszcze realną szansę?',
    answers: [
      { id: 'STAY_E', tone: 'EMPATHY', points: 3, text: 'Tak. Jeśli chcesz zostać, nie zamknę ci drogi. Decyzja była trudna, ale twoja reakcja ma dla mnie znaczenie.', reaction: 'Tego potrzebowałem. Nie obiecuję, że od razu zapomnę, ale mogę wrócić do pracy z innym nastawieniem.' },
      { id: 'STAY_H', tone: 'HONESTY', points: 2, text: 'Dostaniesz szansę, ale muszę też chronić interes klubu. Jeśli przyjdzie dobra oferta, będziemy musieli ją rozważyć.', reaction: 'To uczciwe, chociaż nadal trudne. Przynajmniej wiem, że mogę walczyć o swoją pozycję.' },
      { id: 'STAY_A', tone: 'AUTHORITY', points: -3, text: 'Na razie decyzja się nie zmienia. Najlepsze, co możesz zrobić, to nie utrudniać sprawy.', reaction: 'W takim razie wygląda na to, że ta rozmowa nic dla pana nie znaczyła.' },
    ],
  },
];

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 7919) * 10000;
  return x - Math.floor(x);
};

const stableHash = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const getPreferredTone = (personality: PlayerMoralePersonality): PlayerTransferListObjectionTone => {
  if (personality === 'SENSITIVE' || personality === 'LOYAL' || personality === 'NERVOUS') return 'EMPATHY';
  if (personality === 'PROFESSIONAL' || personality === 'CALM') return 'HONESTY';
  return 'AUTHORITY';
};

export const PlayerTransferListObjectionService = {
  createSession: (player: Player, date: Date, sessionSeed: number): PlayerTransferListObjectionSession => {
    const seed = sessionSeed + stableHash(`${player.id}_${date.toISOString().split('T')[0]}_TRANSFER_LIST_OBJECTION`);
    const morale = player.morale ?? 50;
    const loyalty = Math.max(1, Math.min(99, player.lojalnosc ?? 50));
    const targetScore = morale < 35 || loyalty > 70 ? 8 : loyalty < 35 ? 5 : 6;

    return {
      questions: QUESTIONS,
      currentQuestionIndex: 0,
      score: 0,
      targetScore,
      answeredCount: 0,
      diceRoll: Math.floor(seededRandom(seed) * 6) + 1,
      lastReaction: null,
    };
  },

  answer: (
    session: PlayerTransferListObjectionSession,
    player: Player,
    answer: PlayerTransferListObjectionAnswer
  ): PlayerTransferListObjectionSession => {
    const preferredTone = getPreferredTone(player.moralePersonality ?? 'CALM');
    const toneBonus = answer.points > 0 && answer.tone === preferredTone ? 1 : 0;

    return {
      ...session,
      score: session.score + answer.points + toneBonus,
      answeredCount: session.answeredCount + 1,
      currentQuestionIndex: session.currentQuestionIndex + 1,
      lastReaction: answer.reaction,
    };
  },

  finish: (session: PlayerTransferListObjectionSession, ignored = false): PlayerTransferListObjectionResult => {
    if (ignored) {
      return {
        outcome: 'IGNORED',
        score: session.score,
        targetScore: session.targetScore,
        diceRoll: session.diceRoll,
        moraleDelta: -20,
        moraleToMinimum: true,
        removeFromTransferList: false,
        title: 'Rozmowa przerwana',
        summary: 'Zawodnik uznał, że trener nie chce nawet wyjaśnić decyzji. Morale spada do minimum, a relacja z trenerem zostaje mocno naruszona.',
      };
    }

    const finalScore = session.score + session.diceRoll;
    const convinced = finalScore >= session.targetScore;

    return convinced
      ? {
          outcome: 'CONVINCED',
          score: finalScore,
          targetScore: session.targetScore,
          diceRoll: session.diceRoll,
          moraleDelta: 4,
          moraleToMinimum: false,
          removeFromTransferList: false,
          title: 'Zawodnik przyjął wyjaśnienia',
          summary: `Rzut rozmowy: ${session.diceRoll}. Zawodnik nadal nie jest zachwycony decyzją, ale przyjął argumenty trenera i wraca do pracy.`,
        }
      : {
          outcome: 'BROKEN',
          score: finalScore,
          targetScore: session.targetScore,
          diceRoll: session.diceRoll,
          moraleDelta: -30,
          moraleToMinimum: true,
          removeFromTransferList: false,
          title: 'Rozmowa załamała relację',
          summary: `Rzut rozmowy: ${session.diceRoll}. Zawodnik nie uwierzył w wyjaśnienia. Odbiera listę transferową jako zdradę zaufania, a morale spada do minimum.`,
        };
  },
};
