import {
  Club,
  MailMessage,
  MailType,
  MatchSummary,
  Newspaper,
  Player,
  StaffMember,
} from '../types';
import type { PostMatchConferenceOutcome } from './PostMatchPressConferenceService';

export type PostMatchMediaDecision = 'ATTEND' | 'IGNORE' | 'DELEGATE';
export type PostMatchResultType = 'WIN' | 'DRAW' | 'LOSS';

export interface PostMatchMediaResolution {
  decision: Exclude<PostMatchMediaDecision, 'ATTEND'>;
  resultType: PostMatchResultType;
  clubMoraleDelta: number;
  playerMoraleDeltas: Record<string, number>;
  boardConfidenceDelta: number;
  newspaper: Newspaper;
  mediaRelationshipDelta: number;
  article: MailMessage;
  deliveryDate: string;
  assistantQuality?: number;
}

interface ResolveNonAttendanceInput {
  decision: Exclude<PostMatchMediaDecision, 'ATTEND'>;
  summary: MatchSummary;
  userClub: Club;
  squad: Player[];
  startingXIIds: string[];
  managerName: string;
  assistant?: StaffMember | null;
  currentDate: Date;
  recentAbsenceCount: number;
}

const NEWSPAPERS = Object.values(Newspaper);

const PRESS_NAMES: Record<Newspaper, string> = {
  [Newspaper.GAZETA_SPORTOWA]: 'Gazeta Sportowa',
  [Newspaper.DWIE_BRAMKI]: 'Dwie Bramki',
  [Newspaper.PILKA_NOZNA]: 'Piłka Nożna',
  [Newspaper.FUTBOL_NAD_WISLA]: 'Futbol nad Wisłą',
  [Newspaper.DZIENNIK_SPORTOWY]: 'Dziennik Sportowy',
};

const JOURNALISTS = [
  'Michał Trela',
  'Piotr Żelazny',
  'Tomasz Włodarczyk',
  'Robert Błoński',
  'Kamil Wolnicki',
  'Sebastian Staszewski',
];

const stableHash = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

const stableUnit = (seed: string): number => {
  const hash = stableHash(seed);
  const raw = Math.sin(hash * 12.9898 + 78.233) * 43758.5453;
  return raw - Math.floor(raw);
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, Math.round(value)));

const resultFromSummary = (summary: MatchSummary): PostMatchResultType => {
  const userIsHome = summary.homeClub.id === summary.userTeamId;
  const userScore = userIsHome ? summary.homeScore : summary.awayScore;
  const opponentScore = userIsHome ? summary.awayScore : summary.homeScore;
  if (userScore > opponentScore) return 'WIN';
  if (userScore < opponentScore) return 'LOSS';
  return 'DRAW';
};

const getUserScoreDifference = (summary: MatchSummary): number => {
  const userIsHome = summary.homeClub.id === summary.userTeamId;
  const userScore = userIsHome ? summary.homeScore : summary.awayScore;
  const opponentScore = userIsHome ? summary.awayScore : summary.homeScore;
  return userScore - opponentScore;
};

const getRecentFormScore = (club: Club): number => {
  const recent = (club.stats.form ?? []).slice(-5);
  if (recent.length === 0) return 0;
  const weights = [1, 1.2, 1.4, 1.6, 1.8].slice(-recent.length);
  const weighted = recent.reduce((sum, result, index) => {
    const value = result === 'W' ? 1 : result === 'P' ? -1 : 0;
    return sum + value * weights[index];
  }, 0);
  return weighted / weights.reduce((sum, value) => sum + value, 0);
};

const getAssistantQuality = (assistant?: StaffMember | null): number => {
  if (!assistant) return 0;
  const attribute = (key: string): number => assistant.attributes[key] ?? 8;
  return clamp((
    attribute('communication') * 0.35 +
    attribute('motivation') * 0.25 +
    attribute('dressingRoom') * 0.25 +
    attribute('experience') * 0.15
  ) * 5, 0, 100);
};

const getWeightedMentality = (squad: Player[], participantIds: Set<string>, startingXIIds: Set<string>): number => {
  const participants = squad.filter(player => participantIds.has(player.id));
  if (participants.length === 0) return 50;

  /*
   * Starters carry three times the weight of substitutes. This approximates the requested
   * 60/20/20 match-group model without depending on unused-bench data that is not part of
   * MatchSummary. Crucially, this is an average rather than a raw sum, so a club is never
   * rewarded merely for owning a larger squad.
   */
  let weightedTotal = 0;
  let weightTotal = 0;
  participants.forEach(player => {
    const weight = startingXIIds.has(player.id) ? 3 : 1;
    weightedTotal += (player.attributes.mentality ?? 50) * weight;
    weightTotal += weight;
  });
  return weightTotal > 0 ? weightedTotal / weightTotal : 50;
};

const getParticipantIds = (summary: MatchSummary): Set<string> => {
  const performances = summary.homeClub.id === summary.userTeamId
    ? summary.homePlayers
    : summary.awayPlayers;
  return new Set(performances.map(performance => performance.playerId));
};

const unexpectedAdjustment = (seed: string, chance: number): number => {
  /*
   * The second stable roll selects whether the rare deviation protects or hurts the team.
   * A 5% floor is preserved even for an elite assistant, while weaker assistants can be
   * substantially less predictable. Stable hashing prevents save/reload reroll exploits.
   */
  if (stableUnit(`${seed}:trigger`) >= Math.max(0.05, chance)) return 0;
  return stableUnit(`${seed}:direction`) < 0.5 ? -1 : 1;
};

const getIndividualMoraleDelta = (
  player: Player,
  teamDelta: number,
  userClub: Club,
  decision: Exclude<PostMatchMediaDecision, 'ATTEND'>,
): number => {
  let delta = teamDelta;
  const mentality = player.attributes.mentality ?? 50;
  const leadership = player.attributes.leadership ?? 50;

  if (mentality >= 72) delta += 1;
  else if (mentality <= 38) delta -= 1;

  if (player.id === userClub.captainId && leadership >= 68) delta += 1;
  if (player.moralePersonality === 'PROFESSIONAL' || player.moralePersonality === 'CALM') delta += 1;
  if (player.moralePersonality === 'SENSITIVE' || player.moralePersonality === 'NERVOUS') delta -= 1;

  return clamp(delta, decision === 'IGNORE' ? -4 : -3, 0);
};

const IGNORE_ARTICLES: Record<PostMatchResultType, Array<(manager: string) => { subject: string; body: string }>> = {
  LOSS: [
    manager => ({ subject: 'Bez komentarza po porażce', body: `${manager} nie pojawił się na konferencji prasowej po przegranym spotkaniu, pozostawiając pytania dziennikarzy bez odpowiedzi. Przedstawiciele mediów nie kryli rozczarowania. „Najwyraźniej łatwiej jest przegrać mecz niż później o nim porozmawiać” – komentowano.` }),
    manager => ({ subject: 'Puste miejsce na konferencji', body: `Po końcowym gwizdku dziennikarze oczekiwali na trenera ${manager}, jednak szkoleniowiec nie pojawił się na konferencji prasowej. „Szkoda, że defensywa jego zespołu nie potrafiła zniknąć równie skutecznie jak trener” – żartowali przedstawiciele mediów.` }),
    manager => ({ subject: 'Trener zignorował media', body: `${manager} zrezygnował z udziału w konferencji prasowej po porażce swojej drużyny. Decyzja nie spodobała się zgromadzonym dziennikarzom. „Po zwycięstwach mikrofony jakoś nie są takie straszne” – skomentował jeden z reporterów.` }),
    manager => ({ subject: 'Cisza po przegranym meczu', body: `Po nieudanym spotkaniu ${manager} nie zdecydował się stanąć przed dziennikarzami. Na konferencji zabrakło więc zarówno szkoleniowca, jak i odpowiedzi na pytania dotyczące słabej postawy zespołu. „Wygląda na to, że plan na konferencję był równie skuteczny jak plan na mecz” – ironizowali dziennikarze.` }),
    manager => ({ subject: 'Trener unika trudnych pytań', body: `Porażka najwyraźniej nie zachęciła trenera ${manager} do rozmowy z mediami. Szkoleniowiec nie pojawił się na pomeczowej konferencji prasowej, co spotkało się z krytyką dziennikarzy. „Kiedy wynik się nie zgadza, najprościej nie przyjść i nie odpowiadać” – podsumowano jego nieobecność.` }),
  ],
  DRAW: [
    manager => ({ subject: 'Remis bez komentarza trenera', body: `Po zakończonym remisem spotkaniu ${manager} nie pojawił się na konferencji prasowej. Dziennikarze nie kryli niezadowolenia. „Remis na boisku, ale w starciu trener–media zdecydowanie walkower” – komentowano.` }),
    manager => ({ subject: 'Podział punktów i obowiązków', body: `${manager} zignorował pomeczową konferencję i nie odpowiedział na pytania dziennikarzy po remisie swojej drużyny. „Najwyraźniej podział punktów oznacza również podział obowiązków” – ironizowali reporterzy.` }),
    manager => ({ subject: 'Trener nie przyszedł po remisie', body: `Dziennikarze oczekujący na trenera ${manager} po remisowym spotkaniu ostatecznie nie doczekali się szkoleniowca. „Trener zdobył punkt i najwyraźniej uznał, że to wystarczający komentarz” – żartowano.` }),
    manager => ({ subject: 'Konferencja bez trenera', body: `Po remisie ${manager} zdecydował się ominąć konferencję prasową. Jego nieobecność wywołała niezadowolenie wśród przedstawicieli mediów. „Mecz bez rozstrzygnięcia, konferencja bez trenera – konsekwencji odmówić nie można” – komentowano.` }),
    manager => ({ subject: 'Brak odpowiedzi po remisie', body: `${manager} nie pojawił się przed mediami po spotkaniu zakończonym remisem. Dziennikarze pozostali bez odpowiedzi na pytania dotyczące przebiegu meczu. „Najwyraźniej trener uznał, że skoro wynik niczego nie rozstrzygnął, to on również nie ma nic do powiedzenia” – podsumowano.` }),
  ],
  WIN: [
    manager => ({ subject: 'Trzy punkty bez komentarza', body: `Mimo zwycięstwa ${manager} nie pojawił się na pomeczowej konferencji prasowej. Dziennikarze bezskutecznie czekali na komentarz szkoleniowca. „Najwyraźniej trzy punkty zwalniają również z odpowiadania na pytania” – ironizowali przedstawiciele mediów.` }),
    manager => ({ subject: 'Trener zignorował media po zwycięstwie', body: `${manager} zignorował dziennikarzy i nie pojawił się na konferencji po wygranym spotkaniu. „Drużyna zrobiła swoje, trener najwyraźniej uznał, że on już nie musi” – komentowano.` }),
    manager => ({ subject: 'Zwycięstwo bez spotkania z mediami', body: `Po końcowym gwizdku ${manager} nie zdecydował się spotkać z mediami, mimo zwycięstwa swojej drużyny. „Ciekawe, czy po następnym zwycięstwie trener również będzie zbyt zajęty świętowaniem” – żartowali dziennikarze.` }),
    manager => ({ subject: 'Dobry wynik, słaba komunikacja', body: `Zwycięstwo nie wystarczyło, aby ${manager} pojawił się przed dziennikarzami. Szkoleniowiec opuścił pomeczową konferencję bez komentarza. „Wynik dobry, komunikacja z mediami zdecydowanie słabsza” – podsumowali reporterzy.` }),
    manager => ({ subject: 'Po zwycięstwie przemawia tabela', body: `${manager} nie pojawił się na konferencji prasowej po zwycięskim meczu, pozostawiając dziennikarzy bez możliwości zadania pytań. „Najwidoczniej po zwycięstwie przemawia wyłącznie tabela” – skomentowano.` }),
  ],
};

const DELEGATE_ARTICLES: Record<PostMatchResultType, Array<(manager: string, assistant: string) => { subject: string; body: string }>> = {
  LOSS: [
    (manager, assistant) => ({ subject: 'Asystent odpowiada po porażce', body: `Po przegranym spotkaniu ${manager} nie pojawił się na konferencji prasowej, wysyłając w swoim zastępstwie asystenta ${assistant}. Decyzja nie umknęła uwadze dziennikarzy. „Wygląda na to, że za porażki odpowiada dziś asystent” – komentowano z przekąsem.` }),
    (manager, assistant) => ({ subject: 'Trudne pytania dla asystenta', body: `Zamiast trenera ${manager} na konferencji po porażce pojawił się jego asystent ${assistant}. Media nie kryły rozczarowania nieobecnością pierwszego szkoleniowca. „Najtrudniejsze mecze czasem zaczynają się dopiero przed mikrofonami” – ironizowali dziennikarze.` }),
  ],
  DRAW: [
    (manager, assistant) => ({ subject: 'Po remisie przemówił asystent', body: `Po remisowym spotkaniu ${manager} zdecydował się wysłać na konferencję prasową swojego asystenta ${assistant}. „Punkty podzielone, obowiązki najwyraźniej również” – skomentowali dziennikarze.` }),
    (manager, assistant) => ({ subject: 'Asystent zastąpił trenera po remisie', body: `Na pytania mediów po remisie odpowiadał ${assistant}, który zastąpił nieobecnego trenera ${manager}. „Trener nie przegrał, ale najwyraźniej i tak nie miał ochoty tłumaczyć wyniku” – komentowano wśród reporterów.` }),
  ],
  WIN: [
    (manager, assistant) => ({ subject: 'Asystent przed mikrofonami po zwycięstwie', body: `Mimo zwycięstwa ${manager} nie pojawił się na konferencji prasowej. Przed dziennikarzami zastąpił go asystent ${assistant}. „Wygląda na to, że trener zostawił asystentowi nie tylko mikrofon, ale i całą pomeczową robotę” – żartowali dziennikarze.` }),
    (manager, assistant) => ({ subject: 'Po trzech punktach mówił asystent', body: `Po zwycięskim spotkaniu na konferencji prasowej zabrakło trenera ${manager}. W jego imieniu z mediami rozmawiał ${assistant}. „Po trzech punktach trener najwyraźniej uznał, że wynik mówi sam za siebie” – skomentowali reporterzy.` }),
  ],
};

export const PostMatchMediaDecisionService = {
  getJournalist(matchId: string): { journalist: string; newspaper: Newspaper; outlet: string } {
    const newspaper = NEWSPAPERS[stableHash(`${matchId}:newspaper`) % NEWSPAPERS.length];
    return {
      journalist: JOURNALISTS[stableHash(`${matchId}:journalist`) % JOURNALISTS.length],
      newspaper,
      outlet: PRESS_NAMES[newspaper],
    };
  },

  getAssistantQuality,

  countRecentAbsences(messages: MailMessage[], currentDate: Date): number {
    const cutoff = new Date(currentDate);
    cutoff.setDate(cutoff.getDate() - 30);
    return messages.filter(message =>
      message.id.startsWith('POST_MATCH_MEDIA_') &&
      new Date(message.date).getTime() >= cutoff.getTime() &&
      new Date(message.date).getTime() <= currentDate.getTime()
    ).length;
  },

  resolveNonAttendance(input: ResolveNonAttendanceInput): PostMatchMediaResolution {
    const {
      decision,
      summary,
      userClub,
      squad,
      startingXIIds,
      managerName,
      assistant,
      currentDate,
      recentAbsenceCount,
    } = input;
    if (decision === 'DELEGATE' && !assistant) {
      throw new Error('Cannot delegate a post-match conference without an assistant coach.');
    }

    const resultType = resultFromSummary(summary);
    const scoreDifference = getUserScoreDifference(summary);
    const participantIds = getParticipantIds(summary);
    const weightedMentality = getWeightedMentality(squad, participantIds, new Set(startingXIIds));
    const captain = squad.find(player => player.id === userClub.captainId);
    const resilience = weightedMentality * 0.82 + (captain?.attributes.leadership ?? 50) * 0.18;
    const formScore = getRecentFormScore(userClub);
    const assistantQuality = decision === 'DELEGATE' ? getAssistantQuality(assistant) : undefined;

    let clubMoraleDelta = decision === 'IGNORE'
      ? resultType === 'LOSS' ? (scoreDifference <= -4 ? -3 : -2) : resultType === 'DRAW' ? -1 : 0
      : resultType === 'LOSS' ? (scoreDifference <= -4 ? -2 : -1) : 0;

    if (formScore <= -0.4) clubMoraleDelta -= 1;
    else if (formScore >= 0.6) clubMoraleDelta += 1;
    if (resilience >= 70) clubMoraleDelta += 1;
    else if (resilience <= 42) clubMoraleDelta -= 1;

    if (decision === 'DELEGATE') {
      if ((assistantQuality ?? 0) >= 75) clubMoraleDelta += 1;
      else if ((assistantQuality ?? 0) < 38 && resultType === 'LOSS') clubMoraleDelta -= 1;
    }

    const uncertaintyChance = decision === 'DELEGATE'
      ? Math.max(0.05, 0.30 - (assistantQuality ?? 0) * 0.0025)
      : 0.15;
    clubMoraleDelta += unexpectedAdjustment(`${summary.matchId}:${decision}:morale`, uncertaintyChance);
    clubMoraleDelta = clamp(clubMoraleDelta, decision === 'IGNORE' ? -4 : -3, 0);

    const playerMoraleDeltas: Record<string, number> = {};
    squad.forEach(player => {
      if (!participantIds.has(player.id)) return;
      playerMoraleDeltas[player.id] = getIndividualMoraleDelta(player, clubMoraleDelta, userClub, decision);
    });

    let mediaRelationshipDelta = decision === 'IGNORE'
      ? resultType === 'LOSS' ? -7 : resultType === 'DRAW' ? -5 : -4
      : resultType === 'LOSS' ? -3 : resultType === 'DRAW' ? -2 : -1;
    mediaRelationshipDelta -= Math.min(2, recentAbsenceCount);
    if (decision === 'DELEGATE') {
      if ((assistantQuality ?? 0) >= 75) mediaRelationshipDelta += 1;
      else if ((assistantQuality ?? 0) < 38) mediaRelationshipDelta -= 1;
    }
    mediaRelationshipDelta += unexpectedAdjustment(`${summary.matchId}:${decision}:media`, uncertaintyChance);
    mediaRelationshipDelta = clamp(mediaRelationshipDelta, decision === 'IGNORE' ? -10 : -5, 0);

    const boardConfidenceDelta = decision === 'IGNORE'
      ? (recentAbsenceCount >= 2 ? -1 : 0) + (resultType === 'LOSS' && scoreDifference <= -4 ? -1 : 0)
      : recentAbsenceCount >= 3 && resultType === 'LOSS' ? -1 : 0;

    const journalistData = this.getJournalist(summary.matchId);
    const templates = decision === 'IGNORE' ? IGNORE_ARTICLES[resultType] : DELEGATE_ARTICLES[resultType];
    const templateIndex = stableHash(`${summary.matchId}:${decision}:article`) % templates.length;
    const assistantName = assistant ? `${assistant.firstName} ${assistant.lastName}` : '';
    const articleText = decision === 'IGNORE'
      ? (templates[templateIndex] as (manager: string) => { subject: string; body: string })(managerName)
      : (templates[templateIndex] as (manager: string, assistantName: string) => { subject: string; body: string })(managerName, assistantName);
    const delivery = new Date(currentDate);
    delivery.setDate(delivery.getDate() + 1);
    /*
     * advanceDay processes the day being left and only then exposes the next date in
     * the dashboard. Therefore the queue eligibility key is today's date, while the
     * visible mail date is tomorrow. This makes the article present when the player
     * first reaches the next morning instead of one advance too late.
     */
    const deliveryDate = currentDate.toISOString().split('T')[0];

    return {
      decision,
      resultType,
      clubMoraleDelta,
      playerMoraleDeltas,
      boardConfidenceDelta,
      newspaper: journalistData.newspaper,
      mediaRelationshipDelta,
      assistantQuality,
      deliveryDate,
      article: {
        id: `POST_MATCH_MEDIA_${decision}_${summary.matchId}`,
        sender: journalistData.outlet,
        role: `${journalistData.journalist} · Dziennikarz`,
        subject: articleText.subject,
        body: articleText.body,
        date: delivery,
        isRead: false,
        type: MailType.PRESS,
        priority: resultType === 'LOSS' ? 6 : 4,
      },
    };
  },

  getConferenceMediaDelta(outcome: PostMatchConferenceOutcome): number {
    // Positive drama means a worse media relationship; calming answers can repair it.
    return clamp(-outcome.mediaDramaDelta, -10, 5);
  },
};
