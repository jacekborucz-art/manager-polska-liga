import { Club, MailMessage, MailType, Newspaper, Player } from '../types';
import { INTERVIEW_POOL, InterviewAnswer, InterviewQuestion, InterviewScore, ManagerProfileScore } from '../data/media_interviews_pl';
import { PRESS_ARTICLES, PressArticleContext, PressVariant } from '../data/press_articles_pl';
import { directRivalries, rivalryGroups } from './rivalries.data';

export type SeasonInterviewSituation =
  | 'SEZON_AWANS'
  | 'SEZON_MISTRZ'
  | 'SEZON_PUCHAR'
  | 'SEZON_DUBLET'
  | 'SEZON_BRAK_AWANSU'
  | 'SEZON_EUROPEJSKIE_PUCHARY'
  | 'SEZON_UNIWERSALNY';

export const NEWSPAPER_DISPLAY_NAMES: Record<Newspaper, string> = {
  [Newspaper.GAZETA_SPORTOWA]: 'Gazeta Sportowa',
  [Newspaper.DWIE_BRAMKI]: 'Dwie Bramki',
  [Newspaper.PILKA_NOZNA]: 'Piłka Nożna',
  [Newspaper.FUTBOL_NAD_WISLA]: 'Futbol nad Wisłą',
  [Newspaper.DZIENNIK_SPORTOWY]: 'Dziennik Sportowy',
};

export const INITIAL_RELATIONSHIP = 50;
export const MIN_RELATIONSHIP = 0;
export const MAX_RELATIONSHIP = 100;
const MIN_PRESS_SURNAME_LENGTH = 3;
const DENIED_PRESS_OUTCOMES: { variant: PressVariant; relationshipDelta: number; weight: number }[] = [
  { variant: 'ODMOWA_NEGATYWNA', relationshipDelta: -12, weight: 70 },
  { variant: 'ODMOWA_NEUTRALNA', relationshipDelta: -6, weight: 15 },
  { variant: 'ODMOWA_POZYTYWNA', relationshipDelta: -2, weight: 15 },
];
const UNFRIENDLY_RELATIONSHIP_THRESHOLD = 38;
const UNFRIENDLY_SEASON_PRESS_VARIANTS: PressVariant[] = [
  'NIEPRZYCHYLNE_AUTORYTET',
  'NIEPRZYCHYLNE_SZATNIA',
  'NIEPRZYCHYLNE_KRYZYS',
];
const FRIENDLY_RELATIONSHIP_THRESHOLD = 62;
const FRIENDLY_GOOD_RESULTS_PRESS_VARIANTS: PressVariant[] = [
  'PRZYCHYLNE_DOBRY_START',
  'PRZYCHYLNE_ZWYCIESKI_START',
  'PRZYCHYLNE_SZATNIA',
];
const FRIENDLY_GOOD_RESULTS_MID_SEASON_PRESS_VARIANTS: PressVariant[] = [
  'PRZYCHYLNE_DOBRA_FORMA',
];
const FRIENDLY_WEAK_START_PRESS_VARIANTS: PressVariant[] = [
  'PRZYCHYLNE_SZATNIA',
  'PRZYCHYLNE_SLABY_OPTYMIZM',
  'PRZYCHYLNE_SLABY_SZATNIA',
];
const FRIENDLY_WEAK_MID_SEASON_PRESS_VARIANTS: PressVariant[] = [
  'PRZYCHYLNE_TRUDNY_OKRES',
];

export interface MediaDeclineOutcome {
  variant: PressVariant;
  relationshipDelta: number;
}

export class MediaInterviewService {
  static getPressManagerLabel(managerName?: string): string {
    const normalized = managerName?.trim().replace(/\s+/g, ' ');
    if (!normalized) return 'nowego trenera';

    const parts = normalized.split(' ');
    const lastPart = parts[parts.length - 1] ?? '';
    if (lastPart.length >= MIN_PRESS_SURNAME_LENGTH) return lastPart;
    if (parts.length > 1) return normalized;

    return 'nowego trenera';
  }

  static initRelationships(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const newspaper of Object.values(Newspaper)) {
      result[newspaper] = INITIAL_RELATIONSHIP;
    }
    return result;
  }

  static pickQuestion(newspaper: Newspaper): InterviewQuestion | null {
    const pool = INTERVIEW_POOL[newspaper];
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  static pickQuestionVariant(question: InterviewQuestion): string {
    const { questionVariants } = question;
    return questionVariants[Math.floor(Math.random() * questionVariants.length)];
  }

  static updateRelationship(
    mediaRelationships: Record<string, number>,
    newspaper: Newspaper,
    delta: number
  ): Record<string, number> {
    const current = mediaRelationships[newspaper] ?? INITIAL_RELATIONSHIP;
    const updated = Math.min(MAX_RELATIONSHIP, Math.max(MIN_RELATIONSHIP, current + delta));
    return { ...mediaRelationships, [newspaper]: updated };
  }

  static calculateTotalScore(answers: InterviewAnswer[]): InterviewScore {
    return answers.reduce(
      (acc, a) => ({
        morale:    acc.morale    + a.score.morale,
        kibice:    acc.kibice    + a.score.kibice,
        zarzad:    acc.zarzad    + a.score.zarzad,
        zawodnicy: acc.zawodnicy + a.score.zawodnicy,
      }),
      { morale: 0, kibice: 0, zarzad: 0, zawodnicy: 0 }
    );
  }

  private static getRivalClubName(clubName: string): string {
    const direct = directRivalries.find(r => r.clubs.includes(clubName));
    if (direct) {
      return direct.clubs.find(c => c !== clubName) ?? 'rywal';
    }
    const group = rivalryGroups.find(r => r.clubs.includes(clubName));
    if (group) {
      return group.clubs.find(c => c !== clubName) ?? 'rywal';
    }
    return 'rywal';
  }

  static buildPlaceholders(
    userClub: Club,
    squad: Player[],
    managerName: string
  ): Record<string, string> {
    const captain = userClub.captainId
      ? squad.find(p => p.id === userClub.captainId)
      : null;
    const captainName = captain
      ? `${captain.firstName} ${captain.lastName}`
      : squad.length > 0
        ? `${squad[0].firstName} ${squad[0].lastName}`
        : 'kapitan';

    const sorted = [...squad].sort((a, b) => b.overallRating - a.overallRating);
    const starPlayer = sorted[0];
    const starPlayerName = starPlayer
      ? `${starPlayer.firstName} ${starPlayer.lastName}`
      : 'lider drużyny';

    const sortedByAge = [...squad].sort((a, b) => a.age - b.age);
    const youngPlayer = sortedByAge[0];
    const youngPlayerName = youngPlayer
      ? `${youngPlayer.firstName} ${youngPlayer.lastName}`
      : 'młody zawodnik';

    const rivalClubName = MediaInterviewService.getRivalClubName(userClub.name);

    const objective = userClub.sportingDirectorObjective?.title ?? '';
    const boardExpectations = objective || 'realizację celów sezonowych';
    const clubObjective = objective || 'awans w rozgrywkach';

    return {
      clubName: userClub.name,
      previousManager: 'poprzedni trener',
      captainName,
      starPlayer: starPlayerName,
      youngPlayer: youngPlayerName,
      rivalClub: rivalClubName,
      boardExpectations,
      clubObjective,
      managerName,
    };
  }

  static generateTakingOverInterviewMail(
    userClub: Club,
    squad: Player[],
    managerName: string,
    currentDate: Date
  ): MailMessage {
    const newspapers = Object.values(Newspaper);
    const newspaper = newspapers[Math.floor(Math.random() * newspapers.length)];
    const displayName = NEWSPAPER_DISPLAY_NAMES[newspaper];

    const pool = INTERVIEW_POOL[newspaper].filter(
      q => q.situation === 'OBJECIE_STANOWISKA' && q.answers.length > 0
    );
    const count = Math.min(pool.length, Math.floor(Math.random() * 5) + 6);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const questionIds = shuffled.slice(0, count).map(q => q.id);

    const placeholders = MediaInterviewService.buildPlaceholders(userClub, squad, managerName);

    const deadline = new Date(currentDate);
    deadline.setDate(deadline.getDate() + 7);

    return {
      id: `MEDIA_INTERVIEW_OBJECIE_${currentDate.getFullYear()}`,
      sender: displayName,
      role: 'Dziennikarz',
      subject: `${managerName} trenerem ${userClub.name}`,
      body: `Redakcja ${displayName} zwraca się z prośbą o udzielenie wywiadu w związku z objęciem stanowiska trenera ${userClub.name}.\n\nTermin odpowiedzi: ${deadline.toLocaleDateString('pl-PL')}.`,
      date: new Date(currentDate),
      isRead: false,
      type: MailType.MEDIA,
      priority: 60,
      metadata: {
        type: 'INTERVIEW_REQUEST',
        newspaper,
        questionIds,
        placeholders,
        deadline: deadline.toISOString(),
      },
    };
  }

  static generateSeasonInterviewMail(
    userClub: Club,
    squad: Player[],
    managerName: string,
    currentDate: Date,
    situation: SeasonInterviewSituation
  ): MailMessage {
    const newspapers = Object.values(Newspaper);
    const newspaper = newspapers[Math.floor(Math.random() * newspapers.length)];
    const displayName = NEWSPAPER_DISPLAY_NAMES[newspaper];

    const pool = INTERVIEW_POOL[newspaper].filter(
      q => q.situation === situation && q.answers.length > 0
    );
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const questionIds = shuffled.slice(0, Math.min(pool.length, 6)).map(q => q.id);

    const placeholders = MediaInterviewService.buildPlaceholders(userClub, squad, managerName);

    const deadline = new Date(currentDate);
    deadline.setDate(deadline.getDate() + 7);

    const subjectBySituation: Record<SeasonInterviewSituation, string> = {
      SEZON_AWANS: `Nowy sezon po awansie ${userClub.name}`,
      SEZON_MISTRZ: `${userClub.name} zaczyna sezon jako mistrz Polski`,
      SEZON_PUCHAR: `${userClub.name} po zdobyciu Pucharu Polski`,
      SEZON_DUBLET: `${userClub.name} po historycznym dublecie`,
      SEZON_BRAK_AWANSU: `${userClub.name} przed kolejną próbą awansu`,
      SEZON_EUROPEJSKIE_PUCHARY: `${userClub.name} przed grą w Europie`,
      SEZON_UNIWERSALNY: `${userClub.name} przed nowym sezonem`,
    };

    return {
      id: `MEDIA_INTERVIEW_SEASON_${situation}_${currentDate.getFullYear()}_${userClub.id}`,
      sender: displayName,
      role: 'Dziennikarz',
      subject: subjectBySituation[situation],
      body: `Redakcja ${displayName} zwraca się z prośbą o udzielenie wywiadu przed startem nowego sezonu.\n\nTermin odpowiedzi: ${deadline.toLocaleDateString('pl-PL')}.`,
      date: new Date(currentDate),
      isRead: false,
      type: MailType.MEDIA,
      priority: 55,
      metadata: {
        type: 'INTERVIEW_REQUEST',
        newspaper,
        questionIds,
        placeholders,
        deadline: deadline.toISOString(),
      },
    };
  }

  static generateInterviewRequestMail(
    newspaper: Newspaper,
    currentDate: Date,
    question: InterviewQuestion
  ): MailMessage {
    const displayName = NEWSPAPER_DISPLAY_NAMES[newspaper];
    const questionText = MediaInterviewService.pickQuestionVariant(question);
    return {
      id: `INTERVIEW_REQUEST_${newspaper}_${currentDate.getTime()}`,
      sender: displayName,
      role: 'Dziennikarz',
      subject: `Prośba o wywiad — ${displayName}`,
      body: `Redakcja ${displayName} zwraca się z prośbą o udzielenie wywiadu.\n\nPytanie: ${questionText}`,
      date: new Date(currentDate),
      isRead: false,
      type: MailType.MEDIA,
      priority: 30,
      metadata: {
        type: 'INTERVIEW_REQUEST',
        newspaper,
        questionIds: [question.id],
        placeholders: {},
        deadline: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }

  static sumProfileScore(answers: InterviewAnswer[]): ManagerProfileScore {
    return answers.reduce(
      (acc, a) => ({
        optymizm:        acc.optymizm        + a.profileScore.optymizm,
        realizm:         acc.realizm         + a.profileScore.realizm,
        pewnoscSiebie:   acc.pewnoscSiebie   + a.profileScore.pewnoscSiebie,
        dyplomacja:      acc.dyplomacja      + a.profileScore.dyplomacja,
        presjaZespol:    acc.presjaZespol    + a.profileScore.presjaZespol,
        presjaZarzad:    acc.presjaZarzad    + a.profileScore.presjaZarzad,
        ambicja:         acc.ambicja         + a.profileScore.ambicja,
        ryzykoKonfliktu: acc.ryzykoKonfliktu + a.profileScore.ryzykoKonfliktu,
        zaufanieKibicow: acc.zaufanieKibicow + a.profileScore.zaufanieKibicow,
        zaufanieSzatni:  acc.zaufanieSzatni  + a.profileScore.zaufanieSzatni,
      }),
      { optymizm: 0, realizm: 0, pewnoscSiebie: 0, dyplomacja: 0, presjaZespol: 0, presjaZarzad: 0, ambicja: 0, ryzykoKonfliktu: 0, zaufanieKibicow: 0, zaufanieSzatni: 0 }
    );
  }

  static determinePressVariant(total: ManagerProfileScore): PressVariant {
    if (total.optymizm >= 9 && total.ambicja >= 5 && total.realizm <= 2)
      return 'ZBYTNI_OPTYMISTA';
    if (total.pewnoscSiebie >= 8 && total.ambicja >= 5 && total.optymizm >= 5 && total.realizm <= 5)
      return 'SHOWMAN';
    if (total.presjaZespol >= 2 && total.pewnoscSiebie >= 4 && total.ryzykoKonfliktu >= 3)
      return 'TWARDY_LIDER';
    if (total.dyplomacja >= 9 && total.pewnoscSiebie <= 3 && total.ambicja <= 3 && total.optymizm <= 4)
      return 'ZBYT_DYPLOMATYCZNY';
    if (total.dyplomacja >= 7 && total.realizm >= 4 && total.ambicja >= 4 && total.pewnoscSiebie >= 3)
      return 'WIZJONER';
    if (total.realizm >= 7 && total.dyplomacja >= 3 && total.optymizm <= 6 && total.ryzykoKonfliktu <= 3)
      return 'PRAGMATYK';
    return 'OPTYMISTA';
  }

  static determineDeniedPressOutcome(): MediaDeclineOutcome {
    const totalWeight = DENIED_PRESS_OUTCOMES.reduce((sum, outcome) => sum + outcome.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const outcome of DENIED_PRESS_OUTCOMES) {
      roll -= outcome.weight;
      if (roll <= 0) {
        return {
          variant: outcome.variant,
          relationshipDelta: outcome.relationshipDelta,
        };
      }
    }

    const fallback = DENIED_PRESS_OUTCOMES[0];
    return {
      variant: fallback.variant,
      relationshipDelta: fallback.relationshipDelta,
    };
  }

  static pickUnfriendlyNewspaper(mediaRelationships: Record<string, number>): Newspaper | null {
    const unfriendlyNewspapers = Object.values(Newspaper).filter(
      newspaper => (mediaRelationships[newspaper] ?? INITIAL_RELATIONSHIP) <= UNFRIENDLY_RELATIONSHIP_THRESHOLD
    );

    if (unfriendlyNewspapers.length === 0) return null;
    return unfriendlyNewspapers[Math.floor(Math.random() * unfriendlyNewspapers.length)];
  }

  static pickFriendlyNewspaper(mediaRelationships: Record<string, number>): Newspaper | null {
    const friendlyNewspapers = Object.values(Newspaper).filter(
      newspaper => (mediaRelationships[newspaper] ?? INITIAL_RELATIONSHIP) >= FRIENDLY_RELATIONSHIP_THRESHOLD
    );

    if (friendlyNewspapers.length === 0) return null;
    return friendlyNewspapers[Math.floor(Math.random() * friendlyNewspapers.length)];
  }

  static determineUnfriendlySeasonPressVariant(): PressVariant {
    return UNFRIENDLY_SEASON_PRESS_VARIANTS[
      Math.floor(Math.random() * UNFRIENDLY_SEASON_PRESS_VARIANTS.length)
    ];
  }

  static determineFriendlySeasonPressVariant(
    hasGoodResults: boolean,
    latestWasWin = true,
    isEarlySeason = true
  ): PressVariant {
    const baseVariants = hasGoodResults
      ? isEarlySeason
        ? FRIENDLY_GOOD_RESULTS_PRESS_VARIANTS
        : FRIENDLY_GOOD_RESULTS_MID_SEASON_PRESS_VARIANTS
      : isEarlySeason
        ? FRIENDLY_WEAK_START_PRESS_VARIANTS
        : FRIENDLY_WEAK_MID_SEASON_PRESS_VARIANTS;
    const variants = baseVariants.filter(variant =>
      latestWasWin || variant !== 'PRZYCHYLNE_ZWYCIESKI_START'
    );
    return variants[Math.floor(Math.random() * variants.length)];
  }

  static generatePressArticleMail(
    variant: PressVariant,
    newspaper: Newspaper,
    managerLastName: string,
    clubName: string,
    currentDate: Date,
    context?: PressArticleContext
  ): MailMessage {
    const displayName = NEWSPAPER_DISPLAY_NAMES[newspaper];
    const article = PRESS_ARTICLES[variant];
    const deliveryDate = new Date(currentDate);
    deliveryDate.setDate(deliveryDate.getDate() + 2 + Math.floor(Math.random() * 2));
    return {
      id: `PRESS_ARTICLE_${newspaper}_${currentDate.getTime()}`,
      sender: displayName,
      role: 'Dziennikarz',
      subject: article.headline(managerLastName, clubName, context),
      body: article.body(managerLastName, clubName, context),
      date: deliveryDate,
      isRead: false,
      type: MailType.PRESS,
      priority: 45,
    };
  }
}
