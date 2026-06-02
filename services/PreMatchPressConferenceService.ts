import { Club, CoachAttributes, Fixture } from '../types';
import type { BriefingEffect } from './PreMatchBriefingService';
import { RivalryService } from './RivalryService';

export type PressConferenceTone = 'CALM' | 'CONFIDENT' | 'MOTIVATING' | 'CAUTIOUS' | 'PROVOCATIVE';

export interface PressConferenceAnswer {
  id: string;
  tone: PressConferenceTone;
  text: string;
  moraleDelta: number;
  focusDelta: number;
  pressureDelta: number;
}

export interface PressConferenceQuestion {
  id: string;
  category: 'TABLE' | 'FORM' | 'OPPONENT' | 'MATCH_CONTEXT';
  journalist: string;
  text: string;
  answers: PressConferenceAnswer[];
}

export interface PressConferenceData {
  fixtureId: string;
  headline: string;
  opponentStatement: string | null;
  questions: PressConferenceQuestion[];
}

export interface PressConferenceMatchEffect {
  fixtureId: string;
  userTeamId: string;
  opponentTeamId: string;
  userMoraleDelta: number;
  userFocusDelta: number;
  userPressureDelta: number;
  opponentMoraleDelta: number;
  opponentFocusDelta: number;
  opponentPressureDelta: number;
  opponentReaction: string | null;
}

export interface PressConferenceFixture extends Pick<Fixture, 'id' | 'homeTeamId' | 'awayTeamId'> {}

const stableHash = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const average = (values: number[]): number =>
  values.length > 0 ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

const toBriefingEffect = (moraleDelta: number, focusDelta: number, pressureDelta: number, label: string): BriefingEffect => ({
  actionMod: clamp((moraleDelta * 0.006) + (focusDelta * 0.004) - (Math.max(0, pressureDelta) * 0.002), -0.045, 0.045),
  goalMod: clamp((moraleDelta * 0.004) + (focusDelta * 0.003) - (Math.max(0, pressureDelta) * 0.002), -0.035, 0.035),
  momentumBonus: clamp(Math.round(moraleDelta * 2 + focusDelta - pressureDelta), -14, 14),
  expiryMinute: 35,
  fatigueMult: clamp(1 + Math.max(0, pressureDelta) * 0.004, 1, 1.04),
  rivalBoost: 0,
  label,
  reactionText: '',
  wasSurprise: false,
});

const getRank = (club: Club, clubs: Club[]): number => {
  const table = clubs
    .filter(candidate => candidate.leagueId === club.leagueId)
    .sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
  const rank = table.findIndex(candidate => candidate.id === club.id);
  return rank >= 0 ? rank + 1 : 0;
};

const getFormLabel = (club: Club): string => {
  const recent = club.stats.form.slice(-5);
  if (recent.length === 0) return 'trudną do oceny';
  const points = recent.reduce((sum, result) => sum + (result === 'W' ? 3 : result === 'R' ? 1 : 0), 0);
  if (points >= 13) return 'znakomitą';
  if (points >= 10) return 'dobrą';
  if (points >= 6) return 'nierówną';
  if (points >= 3) return 'słabą';
  return 'bardzo słabą';
};

const answers = (
  prefix: string,
  calm: string,
  confident: string,
  motivating: string,
  cautious: string,
): PressConferenceAnswer[] => [
  { id: `${prefix}_CALM`, tone: 'CALM', text: calm, moraleDelta: 1, focusDelta: 2, pressureDelta: -1 },
  { id: `${prefix}_CONFIDENT`, tone: 'CONFIDENT', text: confident, moraleDelta: 2, focusDelta: 0, pressureDelta: 2 },
  { id: `${prefix}_MOTIVATING`, tone: 'MOTIVATING', text: motivating, moraleDelta: 3, focusDelta: 1, pressureDelta: 1 },
  { id: `${prefix}_CAUTIOUS`, tone: 'CAUTIOUS', text: cautious, moraleDelta: 0, focusDelta: 3, pressureDelta: -2 },
];

const getOpponentStatement = (fixtureId: string, opponent: Club): string => {
  const statements = [
    `Trener ${opponent.name} stwierdził: „Wiemy, jak zagrają. Niczym nas nie zaskoczą”.`,
    `Trener ${opponent.name} powiedział: „Ich wyniki wyglądają dobrze, ale boisko szybko weryfikuje takie serie”.`,
    `Trener ${opponent.name} podkreślił: „To groźna drużyna. Musimy zagrać z pełnym szacunkiem i cierpliwością”.`,
  ];
  return statements[stableHash(fixtureId) % statements.length];
};

export const PreMatchPressConferenceService = {
  calculateMatchEffect(
    fixtureId: string,
    userTeamId: string,
    opponentTeamId: string,
    selectedAnswers: PressConferenceAnswer[],
    opponentCoachAttributes?: CoachAttributes | null,
  ): PressConferenceMatchEffect {
    const provocativeCount = selectedAnswers.filter(answer => answer.tone === 'PROVOCATIVE').length;
    const coachControl = (
      (opponentCoachAttributes?.motivation ?? 50) +
      (opponentCoachAttributes?.experience ?? 50) +
      (opponentCoachAttributes?.decisionMaking ?? 50)
    ) / 3;
    const reactionRoll = (stableHash(`${fixtureId}_${selectedAnswers.map(answer => answer.id).join('_')}`) % 1000) / 1000;
    const opponentMobilized = provocativeCount > 0 && reactionRoll < clamp(0.42 + (coachControl - 50) * 0.006, 0.22, 0.72);
    const opponentMoraleDelta = provocativeCount === 0 ? 0 : opponentMobilized ? 3 : -2;
    const opponentFocusDelta = provocativeCount === 0 ? 0 : opponentMobilized ? 2 : -2;
    const opponentPressureDelta = provocativeCount === 0 ? 0 : opponentMobilized ? 1 : 3;

    return {
      fixtureId,
      userTeamId,
      opponentTeamId,
      userMoraleDelta: average(selectedAnswers.map(answer => answer.moraleDelta)),
      userFocusDelta: average(selectedAnswers.map(answer => answer.focusDelta)),
      userPressureDelta: average(selectedAnswers.map(answer => answer.pressureDelta)),
      opponentMoraleDelta,
      opponentFocusDelta,
      opponentPressureDelta,
      opponentReaction: provocativeCount === 0
        ? null
        : opponentMobilized
          ? 'Prowokacja zmobilizowała rywala.'
          : 'Prowokacja wytrąciła rywala z równowagi.',
    };
  },

  getTeamMatchEffect(effect: PressConferenceMatchEffect | null | undefined, teamId: string): BriefingEffect | null {
    if (!effect) return null;
    if (teamId === effect.userTeamId) {
      return toBriefingEffect(effect.userMoraleDelta, effect.userFocusDelta, effect.userPressureDelta, 'KONFERENCJA PRASOWA');
    }
    if (teamId === effect.opponentTeamId) {
      return toBriefingEffect(effect.opponentMoraleDelta, effect.opponentFocusDelta, effect.opponentPressureDelta, 'REAKCJA NA PROWOKACJĘ');
    }
    return null;
  },

  findMatchEffect(
    effects: Record<string, PressConferenceMatchEffect>,
    fixtureId: string,
    userTeamId: string,
    opponentTeamId: string,
  ): PressConferenceMatchEffect | null {
    return effects[fixtureId] ?? Object.values(effects).reverse().find(effect =>
      effect.userTeamId === userTeamId && effect.opponentTeamId === opponentTeamId
    ) ?? null;
  },

  combineWithBriefing(conferenceEffect: BriefingEffect | null | undefined, briefingEffect: BriefingEffect): BriefingEffect {
    if (!conferenceEffect) return briefingEffect;
    return {
      actionMod: clamp(conferenceEffect.actionMod + briefingEffect.actionMod, -0.10, 0.12),
      goalMod: clamp(conferenceEffect.goalMod + briefingEffect.goalMod, -0.09, 0.11),
      momentumBonus: clamp(conferenceEffect.momentumBonus + briefingEffect.momentumBonus, -36, 42),
      expiryMinute: Math.max(conferenceEffect.expiryMinute, briefingEffect.expiryMinute),
      fatigueMult: clamp(conferenceEffect.fatigueMult * briefingEffect.fatigueMult, 0.84, 1.18),
      rivalBoost: clamp(conferenceEffect.rivalBoost + briefingEffect.rivalBoost, -0.10, 1),
      label: `${conferenceEffect.label} + ${briefingEffect.label}`,
      reactionText: briefingEffect.reactionText,
      wasSurprise: briefingEffect.wasSurprise,
    };
  },

  generate(
    fixture: PressConferenceFixture,
    userClub: Club,
    opponent: Club,
    clubs: Club[],
  ): PressConferenceData {
    const userRank = getRank(userClub, clubs);
    const opponentRank = getRank(opponent, clubs);
    const enoughRounds = Math.max(userClub.stats.played, opponent.stats.played) >= 6;
    const isHome = fixture.homeTeamId === userClub.id;
    const rivalry = RivalryService.getMatchContext(
      fixture.homeTeamId === userClub.id ? userClub : opponent,
      fixture.awayTeamId === userClub.id ? userClub : opponent,
    );
    const opponentStatement = getOpponentStatement(fixture.id, opponent);

    const tableText = enoughRounds && userRank === 1
      ? `Pozycja lidera zwiększa oczekiwania. Czy zespół jest gotowy udźwignąć presję przed meczem z ${opponent.name}?`
      : enoughRounds && userRank > 0 && userRank >= 13
        ? `Jesteście w dolnej części tabeli. Czy spotkanie z ${opponent.name} może stać się punktem zwrotnym?`
        : enoughRounds && userRank > 0
          ? `Zajmujecie ${userRank}. miejsce w tabeli. Jakiego sygnału oczekuje pan od drużyny w kolejnym meczu?`
          : `Sezon dopiero nabiera kształtu. Czego oczekuje pan od drużyny w meczu z ${opponent.name}?`;

    const opponentText = opponentRank > 0 && opponentRank <= 4
      ? `${opponent.name} jest w ścisłej czołówce. Jak odpowie pan na słowa trenera rywala i skalę tego wyzwania?`
      : `${opponentStatement} Jak odpowie pan na tę wypowiedź?`;

    const contextText = rivalry.isRivalry
      ? `${rivalry.label ?? 'Ten mecz'} budzi wyjątkowe emocje. Jak zamierza pan utrzymać koncentrację zespołu?`
      : isHome
        ? `Gracie u siebie. Czy wsparcie trybun oznacza dziś dodatkową odpowiedzialność?`
        : `Czeka was mecz wyjazdowy. Czy presja trybun rywala może wpłynąć na drużynę?`;

    return {
      fixtureId: fixture.id,
      headline: `${userClub.name} przed meczem z ${opponent.name}`,
      opponentStatement,
      questions: [
        {
          id: `${fixture.id}_FORM`,
          category: 'FORM',
          journalist: 'Gazeta Sportowa',
          text: `Pański zespół prezentuje ostatnio ${getFormLabel(userClub)} formę. Jakie jest nastawienie drużyny przed tym spotkaniem?`,
          answers: answers(
            `${fixture.id}_FORM`,
            'Pracujemy spokojnie. Liczy się dobre wykonanie planu od pierwszej minuty.',
            'Jesteśmy gotowi i wierzymy w swoją jakość. Chcemy to pokazać na boisku.',
            'Oczekuję odwagi i pełnego zaangażowania. Każdy zawodnik ma dziś znaczenie.',
            'Musimy zachować koncentrację. Sam wynik nie przyjdzie bez ciężkiej pracy.',
          ),
        },
        {
          id: `${fixture.id}_TABLE`,
          category: 'TABLE',
          journalist: 'Dziennik Sportowy',
          text: tableText,
          answers: answers(
            `${fixture.id}_TABLE`,
            'Tabela jest ważna, ale dzisiaj interesuje nas przede wszystkim najbliższe zadanie.',
            'Znamy swoją wartość. Naszym celem jest zwycięstwo.',
            'To dobry moment, żeby pokazać charakter i zrobić kolejny krok razem.',
            'Nie wolno nam wybiegać myślami za daleko. Najpierw wykonajmy swoją pracę.',
          ),
        },
        {
          id: `${fixture.id}_OPPONENT`,
          category: rivalry.isRivalry ? 'MATCH_CONTEXT' : 'OPPONENT',
          journalist: 'Futbol nad Wisłą',
          text: rivalry.isRivalry ? `${opponentText} ${contextText}` : `${opponentText} ${contextText}`,
          answers: [
            ...answers(
              `${fixture.id}_OPPONENT`,
              'Szanujemy rywala, ale skupiamy się na sobie. Odpowiedź damy na boisku.',
              'Może mówić, co chce. Moi zawodnicy wiedzą, na co ich stać.',
              'Takie słowa powinny nas napędzać. Wyjdziemy skoncentrowani i odważni.',
              'Nie możemy dać się wciągnąć w grę słów. Najważniejsza jest dyscyplina.',
            ),
            {
              id: `${fixture.id}_OPPONENT_PROVOCATIVE`,
              tone: 'PROVOCATIVE',
              text: 'Jeżeli rywal uważa, że wie o nas wszystko, może się bardzo zdziwić.',
              moraleDelta: -1,
              focusDelta: -2,
              pressureDelta: 4,
            },
          ],
        },
      ],
    };
  },
};
