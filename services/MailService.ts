import { Club, Player, MailMessage, MailType, Fixture, MatchStatus, HealthStatus, InjurySeverity, RetirementInfo, Lineup, WCQPlayoffMatchResult, WCQPlayoffState } from '../types';
import { MAIL_TEMPLATES, MailTemplate } from '../data/mail_templates_pl';
import { FinanceService } from './FinanceService';
import { RivalryService } from './RivalryService';
import { MediaInterviewService } from './MediaInterviewService';

export interface SeasonSummaryData {
  year: number;
  championName: string;
  promotions: { from: string, to: string, teams: string[] }[];
  relegations: { from: string, to: string, teams: string[] }[];
  leagueAwards: {
    leagueName: string;
    topScorer: { name: string, goals: number };
    topAssistant: { name: string, assists: number };
  }[];
}

type WCQPlayoffMailStage = 'SF' | 'FINAL';

const getWCQPlayoffWinner = (result: WCQPlayoffMatchResult): string => {
  if (result.penaltyWinner) return result.penaltyWinner;
  return result.homeGoals > result.awayGoals ? result.homeTeam : result.awayTeam;
};

const formatWCQPlayoffScore = (result: WCQPlayoffMatchResult): string => {
  const baseScore = `${result.homeGoals}:${result.awayGoals}`;
  if (result.penaltyWinner && result.homePenaltyGoals !== undefined && result.awayPenaltyGoals !== undefined) {
    return `${baseScore} (${result.homePenaltyGoals}:${result.awayPenaltyGoals} k.)`;
  }
  if (result.wentToExtraTime) return `${baseScore} po dogr.`;
  return baseScore;
};

const formatWCQPlayoffScoreForTeam = (result: WCQPlayoffMatchResult, teamName: string): string => {
  if (result.homeTeam !== teamName && result.awayTeam !== teamName) {
    return formatWCQPlayoffScore(result);
  }

  const teamIsHome = result.homeTeam === teamName;
  const teamGoals = teamIsHome ? result.homeGoals : result.awayGoals;
  const opponentGoals = teamIsHome ? result.awayGoals : result.homeGoals;
  const baseScore = `${teamGoals}:${opponentGoals}`;

  if (result.penaltyWinner && result.homePenaltyGoals !== undefined && result.awayPenaltyGoals !== undefined) {
    const teamPens = teamIsHome ? result.homePenaltyGoals : result.awayPenaltyGoals;
    const opponentPens = teamIsHome ? result.awayPenaltyGoals : result.homePenaltyGoals;
    return `${baseScore} (${teamPens}:${opponentPens} k.)`;
  }
  if (result.wentToExtraTime) return `${baseScore} po dogr.`;
  return baseScore;
};

const startOfDay = (date: Date): number => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized.getTime();
};

const getDayDifference = (from: Date, to: Date): number =>
  Math.round((startOfDay(to) - startOfDay(from)) / 86400000);

const getYearMonthKey = (date: Date): string =>
  `${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}`;

const getMailDate = (mail: MailMessage): Date | null => {
  const mailDate = mail.date instanceof Date ? mail.date : new Date(mail.date);
  return Number.isNaN(mailDate.getTime()) ? null : mailDate;
};

const isBeforeLeagueSeasonEnd = (date: Date): boolean => {
  const seasonEndYear = date.getMonth() >= 7 ? date.getFullYear() + 1 : date.getFullYear();
  return startOfDay(date) <= new Date(seasonEndYear, 4, 23).getTime();
};

const getClubBoardSignatory = (club: Club, templateRole: string): { name: string; role: string } => {
  const formatName = (person?: { firstName: string; lastName: string }): string | null =>
    person ? `${person.firstName} ${person.lastName}` : null;

  if (templateRole === 'Prezes Zarządu') {
    const ceoName = formatName(club.management?.ceo);
    if (ceoName) return { name: ceoName, role: 'Prezes Zarządu' };

    const ownerName = formatName(club.management?.owner);
    if (ownerName) return { name: ownerName, role: 'Właściciel' };
  }

  if (templateRole === 'Dyrektor Sportowy') {
    const sportingDirectorName = formatName(club.sportingDirector);
    if (sportingDirectorName) return { name: sportingDirectorName, role: 'Dyrektor Sportowy' };
  }

  if (templateRole === 'Właściciel Klubu') {
    const ownerName = formatName(club.management?.owner);
    if (ownerName) return { name: ownerName, role: 'Właściciel' };
  }

  return { name: 'Zarząd Klubu', role: templateRole };
};

const buildRivalryWarningMail = (
  currentDate: Date,
  userClub: Club,
  allClubs: Club[],
  nextFixture?: Fixture
): MailMessage | null => {
  if (!nextFixture || nextFixture.status !== MatchStatus.SCHEDULED) return null;

  const daysUntilKickoff = getDayDifference(currentDate, nextFixture.date);
  if (daysUntilKickoff < 0 || daysUntilKickoff > 1) return null;

  const opponentId = nextFixture.homeTeamId === userClub.id ? nextFixture.awayTeamId : nextFixture.homeTeamId;
  const opponentClub = allClubs.find(club => club.id === opponentId);
  if (!opponentClub) return null;

  const rivalryContext = RivalryService.getMatchContext(userClub, opponentClub);
  if (!rivalryContext.isRivalry) return null;

  const intro =
    rivalryContext.tier === 'CLASSIC' || rivalryContext.tier === 'DERBY'
      ? 'Dla kibiców ten mecz to święta wojna.'
      : 'Dla kibiców ten mecz jest sprawą honoru.';

  const pressureLine =
    rivalryContext.tier === 'CLASSIC'
      ? 'Tu nie wystarczy poprawny występ. Oczekujemy drużyny gotowej oddać wszystko, bo takie mecze budują pozycję klubu na lata.'
      : rivalryContext.tier === 'DERBY'
        ? 'W derbach nie ma miejsca na alibi. Oczekujemy walki o każdą piłkę, ostrości w pojedynkach i pełnego zaangażowania od pierwszej do ostatniej minuty.'
        : 'To nie jest zwykła kolejka. Oczekujemy pełnego zaangażowania, charakteru i gotowości do gry na granicy sportowej intensywności.';

  return {
    id: `FANS_RIVALRY_WARNING_${nextFixture.id}`,
    sender: `Stowarzyszenie Kibiców ${userClub.name}`,
    role: 'Głos Trybun',
    subject: `${rivalryContext.label ?? 'Wielki mecz'}: kibice oczekują pełnego zaangażowania`,
    body: [
      'Trenerze,',
      '',
      `Przed meczem z ${opponentClub.name} chcemy powiedzieć to jasno: ${intro}`,
      '',
      pressureLine,
      '',
      'Nie prosimy o ładny futbol za wszelką cenę. Chcemy zobaczyć zespół, który rozumie wagę tego spotkania, nie cofa nogi i walczy dla herbu oraz dla ludzi na trybunach.',
      '',
      'Kibice poniosą drużynę, ale teraz piłkarze muszą pokazać, że czują temperaturę tego starcia i są gotowi odpowiedzieć na nią na boisku.',
      '',
      `Jutro liczy się tylko jedno: zostawić serce na murawie przeciwko ${opponentClub.name}.`,
      '',
      `Stowarzyszenie Kibiców ${userClub.name}`,
    ].join('\n'),
    date: new Date(currentDate),
    isRead: false,
    type: MailType.FANS,
    priority: rivalryContext.tier === 'CLASSIC' ? 99 : rivalryContext.tier === 'DERBY' ? 97 : 94,
  };
};

export const MailService = {
  
  /**
   * Generuje wiadomość powitalną od zarządu na start kariery.
   */
  generateWelcomeMail: (userClub: Club, squad: Player[], gameDate?: Date): MailMessage => {
    const topPlayers = [...squad].sort((a, b) => b.overallRating - a.overallRating).slice(0, 15);
    const avgSquadOvr = topPlayers.reduce((acc, p) => acc + p.overallRating, 0) / topPlayers.length;

    let tierBaseline = 60;
    if (userClub.leagueId === 'L_PL_1') tierBaseline = 66;
    else if (userClub.leagueId === 'L_PL_2') tierBaseline = 59;
    else if (userClub.leagueId === 'L_PL_3') tierBaseline = 52;

    const strengthFactor = (avgSquadOvr / tierBaseline) * 5; 
    const expectationIndex = (userClub.reputation * 0.3) + (strengthFactor * 0.7);

    const isTopTier = userClub.leagueId === 'L_PL_1';
    let targetLeagueName = "wyższej ligi";
    if (userClub.leagueId === 'L_PL_2') targetLeagueName = "Ekstraklasy";
    if (userClub.leagueId === 'L_PL_3') targetLeagueName = "1. Ligi";

    let templateId = 'board_welcome_mid';
    if (userClub.reputation >= 9) {
      // Top clubs (Legia, Lech etc.) - always elite regardless of squad strength
      templateId = isTopTier ? 'board_welcome_elite' : 'board_welcome_elite_promotion';
    } else if (expectationIndex >= 7.6) {
      templateId = isTopTier ? 'board_welcome_elite' : 'board_welcome_elite_promotion';
    } else if (expectationIndex >= 6.1 || userClub.reputation >= 7) {
      templateId = isTopTier ? 'board_welcome_pro' : 'board_welcome_pro_promotion';
    } else if (expectationIndex <= 4.0) {
      templateId = 'board_welcome_relegation';
    }

    if (!isTopTier && (userClub.leagueId === 'L_PL_2' || userClub.leagueId === 'L_PL_3')) {
      const oczekiwania = userClub.board?.oczekiwania;
      if (oczekiwania === 'bardzo_wysoka') templateId = 'board_welcome_elite_promotion';
      else if (oczekiwania === 'wysoka' || oczekiwania === 'przecietna') templateId = 'board_welcome_pro_promotion';
      else if (oczekiwania === 'bardzo_niska') templateId = 'board_welcome_relegation';
      else templateId = 'board_welcome_mid';
    }

    const template = MAIL_TEMPLATES.find(t => t.id === templateId)!;
    const signatory = getClubBoardSignatory(userClub, template.role);
    const subject = template.subject
      .replace(/\{CLUB\}/g, userClub.name)
      .replace(/\{TARGET_LEAGUE\}/g, targetLeagueName);
    const body = template.body
      .replace(/\{CLUB\}/g, userClub.name)
      .replace(/\{TARGET_LEAGUE\}/g, targetLeagueName)
      .replace(/\{TRANSFER_BUDGET\}/g, userClub.transferBudget.toLocaleString('pl-PL'))
      .replace(/\{BOARD_SIGNATORY_NAME\}/g, signatory.name)
      .replace(/\{BOARD_SIGNATORY_ROLE\}/g, signatory.role);
    
    return {
      id: `WELCOME_MAIL_${Date.now()}`,
      sender: template.sender,
      role: signatory.role,
      subject,
      body,
      date: gameDate ? new Date(gameDate) : new Date(),
      isRead: false,
      type: template.type,
      priority: 100
    };
  },
/**
   * Generuje wiadomość powitalną od Stowarzyszenia Kibiców z analizą składu.
   */
  generateFanWelcomeMail: (userClub: Club, squad: Player[], gameDate?: Date): MailMessage => {
    // Obliczamy średnią 15 najlepszych zawodników
    const topPlayers = [...squad].sort((a, b) => b.overallRating - a.overallRating).slice(0, 15);
    const avgSquadOvr = topPlayers.reduce((acc, p) => acc + p.overallRating, 0) / topPlayers.length;

    // Progi ligowe dla kibiców (Ekstraklasa: 66, 1. Liga: 59, 2. Liga: 52)
    let tierBaseline = 52;
    if (userClub.leagueId === 'L_PL_1') tierBaseline = 66;
    else if (userClub.leagueId === 'L_PL_2') tierBaseline = 59;

    const needsTransfers = avgSquadOvr < tierBaseline;
    const transferDemand = needsTransfers 
      ? "Niepokoi nas jednak głębia składu. Przy obecnych brakach kadrowych ciężko będzie o stabilne wyniki – liczymy, że jeszcze w tym oknie transferowym sprowadzi Pan kogoś, kto realnie podniesie jakość tej drużyny."
      : "Patrząc na chłopaków w szatni, wierzymy, że ta grupa pod Pana wodzą może zwojować tę ligę bez większych posiłków.";

    const template = MAIL_TEMPLATES.find(t => t.id === 'fans_welcome')!;
    
    return {
      id: `FAN_WELCOME_${Date.now()}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject,
      body: template.body
        .replace('{CLUB}', userClub.name)
        .replace('{TRANSFER_DEMAND}', transferDemand),
      date: gameDate ? new Date(gameDate) : new Date(),
      isRead: false,
      type: template.type,
      priority: 90
    };
  },

  generateBoardDecisionMail: (player: Player, club: Club, decision: {status: string, reason: string, woz: number}): MailMessage => {
    let templateId = 'board_bie_approved';
    if (decision.status === 'VETO' || decision.status === 'SOFT_BLOCK') templateId = 'board_bie_veto';
    
    return MailService.createFromTemplate(templateId, {
      'PLAYER': `${player.firstName} ${player.lastName}`,
      'CLUB': club.name
    });
  },

  /**
   * Generuje wielki raport podsumowujący miniony sezon.
   */
  generateTrainingInjuryMail: (player: Player, currentDate: Date): MailMessage => {
    const playerName = `${player.firstName} ${player.lastName}`;
    const days = player.health.injury?.daysRemaining ?? 0;
    const injuryType = player.health.injury?.type ?? 'uraz';

    return {
      id: `TRAINING_INJURY_${player.id}_${currentDate.toISOString().split('T')[0]}`,
      sender: 'Sztab Medyczny',
      role: 'Lekarz klubowy',
      subject: `Kontuzja na treningu: ${playerName}`,
      body: [
        'Trenerze,',
        '',
        `Podczas dzisiejszego treningu ${playerName} doznał kontuzji: ${injuryType}.`,
        '',
        `Zawodnik będzie pauzował przez około ${days} dni.`,
        '',
        'Należy dokonać korekty w składzie na nadchodzący mecz.',
        '',
        'Sztab medyczny będzie monitorował proces leczenia i poinformuje o postępach rehabilitacji.',
      ].join('\n'),
      date: new Date(currentDate),
      isRead: false,
      type: MailType.STAFF,
      priority: 85,
    };
  },

generateSeasonSummaryMail: (data: SeasonSummaryData): MailMessage => {
    const separator = "------------------------------------------";
    const seasonLabel = `${data.year}/${(data.year + 1).toString().slice(2)}`;
    
    let body = `Szanowny Panie Managerze,\n\nPrzedstawiamy oficjalny raport z zakończenia sezonu ${seasonLabel}.\n`;
    body += `${separator}\n\n`;

    body += `🏆  MISTRZ POLSKI\n`;
    body += `    ${data.championName.toUpperCase()}\n`;
    body += `\n${separator}\n\n`;

    body += `📈  AWANSOWALI:\n`;
    if (data.promotions.length > 0) {
      data.promotions.forEach(p => {
        body += `    • ${p.to}: ${p.teams.join(', ')}\n`;
      });
    } else {
      body += `    • Brak awansów (najwyższy szczebel)\n`;
    }
    body += `\n`;

    body += `📉  SPADKOWICZE:\n`;
    data.relegations.forEach(r => {
      body += `    • Z ${r.from}: ${r.teams.join(', ')}\n`;
    });
    body += `\n${separator}\n\n`;

    body += `⚽  ZŁOTE BUTY — NAGRODY INDYWIDUALNE:\n`;
    data.leagueAwards.forEach(a => {
      body += `\n  [${a.leagueName.toUpperCase()}]\n`;
      body += `    🎯 Król Strzelców: ${a.topScorer.name} (${a.topScorer.goals} goli)\n`;
      body += `    👟 Król Asyst:     ${a.topAssistant.name} (${a.topAssistant.assists} asyst)\n`;
    });

    body += `\n${separator}\n\n`;
    body += `Zarząd oraz kibice dziękują za emocje dostarczone w ubiegłym sezonie.\nTeraz czas na nowe wyzwania. Powodzenia w kolejnym!`;

    return {
      id: `SEASON_SUMMARY_${data.year}`,
      sender: 'Polska Liga Futbolu',
      role: 'PZPM',
      subject: `OFICJALNY RAPORT: Podsumowanie Sezonu ${seasonLabel}`,
      body: body,
      date: new Date(data.year + 1, 5, 28),
      isRead: false,
      type: MailType.SYSTEM,
      priority: 150
    };
  },

generateCupFinalMail: (homeName: string, awayName: string, score: string, userTeamId: string | null, winnerId: string, homeDisplayName?: string, awayDisplayName?: string): MailMessage => {
    const isUserHome = homeName === userTeamId;
    const isUserWinner = winnerId === userTeamId;
    const isUserInFinal = homeName === userTeamId || awayName === userTeamId;

    let templateId = 'system_cup_news';
    let replacements: Record<string, string> = {
      'WINNER': winnerId === homeName ? (homeDisplayName ?? homeName) : (awayDisplayName ?? awayName),
      'LOSER': winnerId === homeName ? (awayDisplayName ?? awayName) : (homeDisplayName ?? homeName),
      'SCORE': score
    };

    if (isUserInFinal) {
      templateId = isUserWinner ? 'board_cup_victory' : 'board_cup_final_loss';
      replacements = {
        'CLUB': isUserHome ? (homeDisplayName ?? userTeamId ?? '') : (awayDisplayName ?? userTeamId ?? ''),
        'OPPONENT': isUserHome ? (awayDisplayName ?? awayName) : (homeDisplayName ?? homeName)
      };
    }

    const template = MAIL_TEMPLATES.find(t => t.id === templateId)!;
    let body = template.body;
    let subject = template.subject;

    Object.entries(replacements).forEach(([key, val]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      body = body.replace(regex, val);
      subject = subject.replace(regex, val);
    });

    return {
      id: `CUP_FINAL_${Date.now()}`,
      sender: template.sender,
      role: template.role,
      subject: subject,
      body: body,
      date: new Date(),
      isRead: false,
      type: template.type,
      priority: 150
    };
  },

  generateSuperCupMail: (winnerName: string, opponentName: string, score: string): MailMessage => {
    return MailService.createFromTemplate('board_supercup_win', { 
      'CLUB': winnerName, 
      'OPPONENT': opponentName, 
      'SCORE': score,
      'BONUS': '250 000' 
    });
  },

  generateSuperCupLossMails: (userClub: Club, opponentName: string, userScore: number, oppScore: number): MailMessage[] => {
    const isPenaltyShootout = userScore === oppScore; 
    const diff = isPenaltyShootout ? 1 : (oppScore - userScore);
    const scoreStr = `${userScore}:${oppScore}`;
    const mails: MailMessage[] = [];

    let boardTemplate = 'board_supercup_loss_1';
    let poolIndex = 0; 

    if (diff === 1) {
      boardTemplate = 'board_supercup_loss_1';
      poolIndex = 0;
    } else if (diff === 2) {
      boardTemplate = 'board_supercup_loss_2';
      poolIndex = 1;
    } else if (diff === 3) {
      boardTemplate = 'board_supercup_loss_3';
      poolIndex = 2;
    } else {
      boardTemplate = 'board_supercup_loss_high';
      poolIndex = 3;
      mails.push(MailService.createFromTemplate('fans_supercup_furious', { 'CLUB': userClub.name }));
    }

    mails.push(MailService.createFromTemplate(boardTemplate, { 'CLUB': userClub.name, 'SCORE': scoreStr, 'OPPONENT': opponentName }));

    const pools = [
 [
  "Minimalna porażka po bardzo wyrównanym spotkaniu, w którym {CLUB} przez większość czasu dotrzymywał kroku rywalom. O losach Superpucharu zadecydował jeden moment dekoncentracji w końcówce, który został natychmiast bezlitośnie wykorzystany. Media podkreślają jednak, że styl gry i organizacja zespołu dają solidne podstawy do optymizmu na przyszłość.",
  "Jedna bramka przesądziła o wyniku, choć przebieg meczu absolutnie nie wskazywał na wyraźną przewagę którejkolwiek ze stron. Zespół {CLUB} stworzył sobie kilka sytuacji, ale zabrakło chłodnej głowy przy wykończeniu. Prasa pisze o straconej szansie, lecz jednocześnie chwali charakter i intensywność gry.",
  "Spotkanie mogło zakończyć się w każdą stronę, bo oba zespoły grały odważnie i z dużą determinacją. Ostatecznie to rywale zachowali więcej spokoju w kluczowym fragmencie meczu. Dla {CLUB} to bolesna, ale pouczająca lekcja na starcie sezonu.",
  "Trener może mieć mieszane uczucia po końcowym gwizdku. Z jednej strony wynik boli, z drugiej postawa drużyny pokazuje, że fundamenty pod dobry sezon są już widoczne. Jeden błąd zadecydował o utracie trofeum, ale ogólny obraz gry napawa umiarkowanym optymizmem.",
  "Jednobramkowa porażka to najniższy możliwy wymiar kary w tak prestiżowym meczu. {CLUB} nie był zespołem gorszym, lecz mniej skutecznym w decydujących momentach. Komentatorzy zgodnie twierdzą, że przy odrobinie szczęścia wynik mógłby wyglądać zupełnie inaczej."
],
[
  "Dwie stracone bramki obnażyły problemy {CLUB} w defensywie i organizacji gry w kluczowych fazach spotkania. Przez długie fragmenty mecz był wyrównany, jednak rywale potrafili lepiej wykorzystać swoje okazje. Eksperci mówią o potrzebie szybkich korekt przed startem rozgrywek ligowych.",
  "Porażka różnicą dwóch goli pokazuje, że drużynie wciąż brakuje automatyzmów i odpowiedniego zgrania formacji. Kilka prostych strat i spóźnione reakcje w obronie kosztowały utratę kontroli nad meczem. Sztab szkoleniowy ma materiał do poważnej analizy.",
  "Faworyci wygrali w sposób spokojny i dość kontrolowany, nie pozwalając {CLUB} na rozwinięcie skrzydeł. Choć momentami widać było ambicję i wolę walki, brakowało konkretów pod bramką rywala. Media określają ten wynik jako solidne ostrzeżenie przed nadchodzącym sezonem.",
  "Dwubramkowa porażka to sygnał, że projekt sportowy jest wciąż w fazie budowy. Zespół miał swoje momenty, ale brak konsekwencji i koncentracji w obronie przesądził o losach trofeum. Trener podkreśla potrzebę cierpliwości i dalszej pracy nad strukturą gry.",
  "Superpuchar uciekł, bo rywale byli dziś dojrzalsi taktycznie i bardziej bezwzględni w polu karnym. {CLUB} zaprezentował się poprawnie, lecz bez błysku, który pozwoliłby przechylić szalę zwycięstwa. Prasa mówi o wyniku sprawiedliwym, choć nie druzgocącym."
],
[
  "Trzy stracone gole wywołały pierwszą falę poważnych wątpliwości wobec nowego szkoleniowca. Drużyna wyglądała na zagubioną taktycznie i nie potrafiła zareagować na zmiany w grze rywali. Eksperci zaczynają zadawać pytania, czy obrany kierunek rozwoju jest właściwy.",
  "Styl gry {CLUB} w tym meczu był daleki od oczekiwań kibiców i komentatorów. Brak spójnego planu, chaos w ustawieniu i bierna postawa w defensywie doprowadziły do wysokiej porażki. W studiach telewizyjnych coraz głośniej mówi się o presji, która szybko zaczyna ciążyć na trenerze.",
  "Różnica trzech bramek to już nie przypadek, a wyraźny sygnał alarmowy. Zespół sprawiał wrażenie nieprzygotowanego do gry o stawkę, a reakcje z ławki były spóźnione i nieskuteczne. Dziennikarze zastanawiają się, czy ten projekt ma solidne fundamenty.",
  "Porażka obnażyła braki zarówno w przygotowaniu fizycznym, jak i mentalnym drużyny. {CLUB} nie potrafiła podnieść się po stracie pierwszego gola, a kolejne ciosy tylko pogłębiały chaos. Coraz częściej pojawiają się głosy o potrzebie szybkiej korekty kursu.",
  "To był mecz, który zamiast nadziei przyniósł niepokój. Trzy stracone bramki i brak wyraźnej reakcji zespołu sprawiły, że atmosfera wokół trenera stała się wyraźnie cięższa. Eksperci nie wykluczają, że kolejne spotkania będą dla niego prawdziwym testem przetrwania."
],
[
  "To była prawdziwa katastrofa i jeden z najbardziej bolesnych występów {CLUB} w ostatnich latach. Drużyna została całkowicie zdominowana i nie była w stanie nawiązać równorzędnej walki. Kibice opuszczali stadion w ciszy, a media mówią o kompromitacji na wszystkich płaszczyznach.",
  "Wysoka porażka w Superpucharze miała znamiona sportowej egzekucji. Chaos w obronie, brak organizacji i bezradność w ataku sprawiły, że wynik szybko wymknął się spod kontroli. Komentatorzy nie mają wątpliwości, że to jeden z najgorszych debiutów trenerskich ostatniej dekady.",
  "Rywal zrobił z {CLUB} wszystko, co chciał, a różnica klas była widoczna gołym okiem. Zespół nie potrafił odpowiedzieć ani taktycznie, ani mentalnie, co tylko pogłębiało rozmiary klęski. Prasa pisze o wstrząsie, który może mieć długofalowe konsekwencje.",
  "To spotkanie przejdzie do historii jako symbol totalnego rozkładu gry i braku przygotowania. Każda formacja zawiodła, a błędy indywidualne mnożyły się z minuty na minutę. W klubie zapowiada się gorący okres pełen trudnych rozmów i decyzji.",
  "Kompromitacja była pełna i bezdyskusyjna. {CLUB} został rozbity zarówno piłkarsko, jak i mentalnie, nie pokazując ani charakteru, ani planu na odwrócenie losów meczu. Eksperci mówią wprost: taki występ wymaga natychmiastowej reakcji władz klubu."
]
    ];

    const randomComment = pools[poolIndex][Math.floor(Math.random() * 5)];
    const processedComment = randomComment.replace(/{CLUB}/g, userClub.name);

    mails.push(MailService.createFromTemplate('media_supercup_news', { 
      'CLUB': userClub.name, 
      'MEDIA_COMMENT': processedComment 
    }));

    return mails;
  },

createFromTemplate: (templateId: string, replacements: Record<string, string>): MailMessage => {
    const template = MAIL_TEMPLATES.find(t => t.id === templateId)!;
    let body = template.body;
    let subject = template.subject;

    const clubName = replacements['CLUB'] || "";
    
    const finalReplacements = { ...replacements };
    Object.entries(finalReplacements).forEach(([key, val]) => {
      if (typeof val === 'string') {
        finalReplacements[key] = val.replace(/{CLUB}/g, clubName);
      }
    });

    Object.entries(finalReplacements).forEach(([key, val]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      body = body.replace(regex, val);
      subject = subject.replace(regex, val);
    });

    return {
      id: `${templateId}_${Date.now()}_${Math.random()}`,
      sender: template.sender,
      role: template.role,
      subject,
      body,
      date: new Date(),
      isRead: false,
      type: template.type,
      priority: 85
    };
  },

generateSeasonTicketMail: (club: { name: string; stadiumName: string; stadiumCapacity: number; reputation: number; leagueId: string; country?: string }, seasonLabel: string, gameDate: Date): MailMessage => {
    const ticketPackage = FinanceService.calculateSeasonTicketPackageForClub({
      id: club.name,
      name: club.name,
      shortName: club.name,
      leagueId: club.leagueId,
      colorsHex: [],
      stadiumName: club.stadiumName,
      stadiumCapacity: club.stadiumCapacity,
      reputation: club.reputation,
      isDefaultActive: true,
      colorPrimary: '#000000',
      colorSecondary: '#FFFFFF',
      rosterIds: [],
      budget: 0,
      transferBudget: 0,
      boardStrictness: 5,
      signingBonusPool: 0,
      stats: { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 0, form: [] },
      country: club.country
    });
    const demandLevel = club.reputation >= 8 ? 'bardzo wysokie' : club.reputation >= 6 ? 'dobre' : club.reputation >= 4 ? 'umiarkowane' : 'niskie';
    const formatPLN = (n: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n);

    return MailService.createFromTemplate('board_season_ticket_report', {
      CLUB: club.name,
      SEASON: seasonLabel,
      STADIUM: club.stadiumName,
      CAPACITY: club.stadiumCapacity.toLocaleString('pl-PL'),
      TICKETS_SOLD: ticketPackage.ticketsSold.toLocaleString('pl-PL'),
      REVENUE: formatPLN(ticketPackage.revenue),
      TICKET_PRICE: formatPLN(ticketPackage.seasonTicketPrice),
      DEMAND_LEVEL: demandLevel
    });
  },

  generateRetirementReportMail: (retirements: RetirementInfo[], clubName: string): MailMessage => {
    const title = `Raport Kadry ${clubName}`;
    const hasRetirements = retirements.length > 0;
    let body = hasRetirements
      ? `Szanowny Panie,\r\nPo zakończeniu sezonu następujący zawodnicy postanowili zakończyć kariery, a w ich miejsce do kadry włączeni zostali młodzi zawodnicy z naszej Akademii:\n\n`
      : `Szanowny Panie,\r\nPo zakończeniu sezonu przygotowaliśmy krótką aktualizację kadrową.\n\n`;

    if (!hasRetirements) {
      body += "Po ostatnim sezonie żaden z piłkarzy naszej kadry nie zdecydował się zakończyć kariery.";
    } else {
      retirements.forEach(r => {
        body += `🎖️ ${r.oldPlayerName} (${r.oldPlayerAge} lat) - Zakończył karierę.\n`;
        body += `🌱 Zastąpił go: ${r.newPlayerName} (Potencjał OVR: ${r.newPlayerOverall})\r\n`;
      });
    }

    body += hasRetirements
      ? `\nŻyczymy powodzenia w pracy z nowymi zawodnikami!\n\nDyrektor Sportowy`
      : `\n\nDyrektor Sportowy`;

    return {
      id: `RETIREMENT_${Date.now()}`,
      sender: 'Dyrektor Sportowy',
      role: 'Sztab Szkoleniowy',
      subject: title,
      body: body,
      date: new Date(),
      isRead: false,
      type: MailType.STAFF,
      priority: 95
    };
  },

  generateStaffRetirementMail: (retired: { name: string; age: number; roleLabel: string }[]): MailMessage => {
    const staffList = retired.map(r => `• ${r.name} (${r.age} lat) – ${r.roleLabel}`).join('\n');
    return MailService.createFromTemplate('staff_retirement', { 'STAFF_LIST': staffList });
  },

/**
   * Generuje email-newsa po zakończeniu fazy grupowej kwalifikacji MŚ 2026 (17 listopada).
   * Format: artykuł z dziennika sportowego z listą awansujących i uczestników baraży.
   */
  generateWCQGroupsSummaryMail: (
    groups: Array<{ group: string; winner: string; runnerUp: string }>,
    extras: string[],
    date: Date
  ): MailMessage => {
    const sep = '─────────────────────────────────────────────────';

    const polandWon  = groups.find(g => g.winner === 'Polska');
    const polandRU   = groups.find(g => g.runnerUp === 'Polska');
    const polandExtra = extras.includes('Polska');

    let lead = 'Europejskie kwalifikacje do Mistrzostw Świata 2026 dobiegły końca. Dwanaście grup, tygodnie zaciekłych batalii — Europa zna już komplet uczestników mundialu oraz szesnaścioro śmiałków, którzy powalczą o ostatnie bilety w marcowych barażach.';
    if (polandWon) {
      lead = `TO JEST TO! POLSKA JEDZIE NA MUNDIAL! Biało-Czerwoni wygrali Grupę ${polandWon.group} i zapewnili sobie bezpośredni awans do Mistrzostw Świata 2026. Europejskie kwalifikacje zakończyły się dla nas w najlepszy możliwy sposób.`;
    } else if (polandRU) {
      lead = `Biało-Czerwoni kończą fazę grupową kwalifikacji z 2. miejsca w Grupie ${polandRU.group}. Bezpośredni awans uciekł, ale Polska zagra w marcowych barażach i walka o MŚ 2026 jest wciąż otwarta!`;
    } else if (polandExtra) {
      lead = `Polska z 3. miejsca w grupie wywalczyła jedno z czterech dodatkowych miejsc barażowych. Biało-Czerwoni będą jednym z szesnastu uczestników barażów o MŚ 2026 — losowanie już 29 listopada.`;
    }

    let body = `════════════════════════════════════════════════\n`;
    body += `  SPORT EXPRESS  —  WYDANIE SPECJALNE\n`;
    body += `  KWALIFIKACJE MŚ 2026 — KONIEC FAZY GRUPOWEJ\n`;
    body += `════════════════════════════════════════════════\n\n`;
    body += `${lead}\n\n`;
    body += `${sep}\n`;
    body += `  🏆  BEZPOŚREDNI AWANS — ZWYCIĘZCY 12 GRUP\n`;
    body += `${sep}\n\n`;
    groups.forEach(g => {
      const star = g.winner === 'Polska' ? '  ★  POLSKA!' : '';
      body += `  Gr. ${g.group.padEnd(2)}  ●  ${g.winner}${star}\n`;
    });
    body += `\n${sep}\n`;
    body += `  🥊  BARAŻE MŚ 2026 — 16 UCZESTNIKÓW\n`;
    body += `${sep}\n\n`;
    body += `  Wicemistrzowie grup (miejsca 2.):\n\n`;
    groups.forEach(g => {
      const star = g.runnerUp === 'Polska' ? '  ★  POLSKA!' : '';
      body += `  Gr. ${g.group.padEnd(2)}  →  ${g.runnerUp}${star}\n`;
    });
    if (extras.length > 0) {
      body += `\n  Najlepsze 4 drużyny z 3. miejsc (dodatkowe bilety):\n\n`;
      extras.forEach(name => {
        const star = name === 'Polska' ? '  ★  POLSKA!' : '';
        body += `  ●  ${name}${star}\n`;
      });
    }
    body += `\n${sep}\n\n`;
    body += `  📅  LOSOWANIE DRABINKI BARAŻOWEJ: 29 listopada 2025, Nyon\n\n`;
    body += `UEFA wyznaczy 4 ścieżki eliminacyjne — każda z półfinałem i finałem\n`;
    body += `w marcu 2026. Czterej triumfatorzy uzyskają ostatnie europejskie bilety\n`;
    body += `do USA, Meksyku i Kanady.\n\n`;
    body += `${sep}\n`;
    body += `  © Sport Express / Redakcja Sport Express`;

    const polandInvolved = polandWon || polandRU || polandExtra;
    const subject = polandWon
      ? '🏆 POLSKA NA MUNDIALU! Komplet awansów z kwalifikacji do MŚ 2026'
      : polandRU || polandExtra
        ? '🥊 Polska zagra w barażach! Faza grupowa kwalifikacji zakończona'
        : 'Kwalifikacje MŚ 2026 — Europa wyłoniła 12 bezpośrednich uczestników mundialu';

    return {
      id: `WCQ_GROUPS_NEWS_${date.getFullYear()}`,
      sender: 'Sport Express',
      role: 'Redakcja Sportowa',
      subject,
      body,
      date: new Date(date),
      isRead: false,
      type: MailType.MEDIA,
      priority: polandInvolved ? 140 : 110,
    };
  },

  generateWCQPlayoffPolandMail: (
    playoffState: WCQPlayoffState,
    stage: WCQPlayoffMailStage,
    date: Date
  ): MailMessage | null => {
    const polandPath = playoffState.paths.find(path => {
      if (stage === 'SF') {
        return [path.sf1Result, path.sf2Result].some(
          result => !!result && (result.homeTeam === 'Polska' || result.awayTeam === 'Polska')
        );
      }
      return !!path.finalResult && (path.finalResult.homeTeam === 'Polska' || path.finalResult.awayTeam === 'Polska');
    });

    if (!polandPath) return null;

    const result = stage === 'SF'
      ? [polandPath.sf1Result, polandPath.sf2Result].find(
          match => !!match && (match.homeTeam === 'Polska' || match.awayTeam === 'Polska')
        )
      : polandPath.finalResult;

    if (!result) return null;

    const opponent = result.homeTeam === 'Polska' ? result.awayTeam : result.homeTeam;
    const polandWon = getWCQPlayoffWinner(result) === 'Polska';
    const scoreForPoland = formatWCQPlayoffScoreForTeam(result, 'Polska');
    const sep = '─────────────────────────────────────────────────';
    const stageLabel = stage === 'SF' ? 'PÓŁFINAŁ BARAŻY' : 'FINAŁ BARAŻY';

    let subject: string;
    let lead: string;

    if (stage === 'SF') {
      subject = polandWon
        ? 'Polska w finale baraży do MŚ ! Sport Express po półfinale'
        : 'Polska odpada w półfinale baraży do MŚ';
      lead = polandWon
        ? `Reprezentacja Polski pokonała ${opponent} ${scoreForPoland} w półfinale ścieżki ${polandPath.pathLabel} i zagra w finale baraży o Mistrzostwa Świata. Biało-Czerwonym został już tylko jeden krok do mundialu.`
        : `Reprezentacja Polski przegrała z ${opponent} ${scoreForPoland} w półfinale ścieżki ${polandPath.pathLabel} i odpadła z baraży o Mistrzostwa Świata. Mundial bez Biało-Czerwonych.`;
    } else {
      subject = polandWon
        ? 'POLSKA JEDZIE NA MUNDIAL! Zwycięstwo w finale baraży!!!'
        : 'Polska przegrywa finał baraży. Mundial bez Biało-Czerwonych';
      lead = polandWon
        ? `Reprezentacja Polski wygrywa finał ścieżki ${polandPath.pathLabel}, pokonując ${opponent} ${scoreForPoland}, i wywalczyła awans na Mistrzostwa Świata. Biało-Czerwoni wracają na największą scenę futbolu.`
        : `Reprezentacja Polski przegrała finał ścieżki ${polandPath.pathLabel} z ${opponent} ${scoreForPoland} i nie zagra na Mistrzostwach Świata.`;
    }

    const finalOpponent = polandWon && stage === 'SF'
      ? [polandPath.finalHome, polandPath.finalAway].find(team => team && team !== 'Polska')
      : null;

    let body = `════════════════════════════════════════════════\n`;
    body += `  SPORT EXPRESS  —  WYDANIE SPECJALNE\n`;
    body += `  BARAŻE MŚ  —  ${stageLabel}\n`;
    body += `════════════════════════════════════════════════\n\n`;
    body += `${lead}\n\n`;
    body += `${sep}\n`;
    body += `  WYNIK MECZU\n`;
    body += `${sep}\n\n`;
    body += `  Polska — ${opponent}\n`;
    body += `  ${scoreForPoland}\n\n`;

    if (stage === 'SF' && polandWon && finalOpponent) {
      body += `${sep}\n`;
      body += `  CO DALEJ?\n`;
      body += `${sep}\n\n`;
      body += `  W finale ścieżki ${polandPath.pathLabel} Polska zagra z reprezentacją ${finalOpponent}.\n`;
      body += `  Stawką tego spotkania będzie bezpośredni awans na mundial.\n\n`;
    }

    if (stage === 'FINAL') {
      body += `${sep}\n`;
      body += `  STAWKA ROZSTRZYGNIĘTA\n`;
      body += `${sep}\n\n`;
      body += polandWon
        ? `  Biało-Czerwoni wygrali barażową ścieżkę ${polandPath.pathLabel} i dołączyli do grona uczestników MŚ .\n\n`
        : `  Zwycięzca ścieżki ${polandPath.pathLabel} pojedzie na MŚ, a Polska kończy eliminacje na etapie finału baraży.\n\n`;
    }

    body += `${sep}\n`;
    body += `  © Sport Express / Redakcja Sport Express`;

    return {
      id: `WCQ_PLAYOFF_POLAND_${stage}_${playoffState.seasonYear}_${polandPath.pathLabel}`,
      sender: 'Sport Express',
      role: 'Redakcja Sportowa',
      subject,
      body,
      date: new Date(date),
      isRead: false,
      type: MailType.MEDIA,
      priority: stage === 'FINAL' ? 155 : 145,
      metadata: {
        type: 'WCQ_PLAYOFF_POLAND',
        stage,
        pathLabel: polandPath.pathLabel,
        homeTeam: result.homeTeam,
        awayTeam: result.awayTeam,
        homeScore: result.homeGoals,
        awayScore: result.awayGoals,
        scoreLabel: scoreForPoland,
        polandWon,
        lead,
        finalOpponent,
        penaltyWinner: result.penaltyWinner,
        homePenaltyGoals: result.homePenaltyGoals,
        awayPenaltyGoals: result.awayPenaltyGoals,
        wentToExtraTime: result.wentToExtraTime,
      },
    };
  },

  generateCoachFiredMail: (clubName: string, coachName: string, rank: number): MailMessage => {
    return MailService.createFromTemplate('media_coach_fired', {
      'CLUB': clubName,
      'COACH': coachName,
      'RANK': rank.toString()
    });
  },

  generateBoardWarningMail: (rank: number): MailMessage => {
    return MailService.createFromTemplate('board_coach_warning', {
      'RANK': rank.toString()
    });
  },

  /**
   * Codzienne generowanie poczty z zachowaniem logiki realizmu futbolowego.
   */
  generateDailyMails: (
    currentDate: Date,
    userClub: Club,
    allPlayers: Record<string, Player[]>,
    allClubs: Club[],
    rank: number,
    boardConfidence: number,
    recentFixture?: Fixture,
    nextFixture?: Fixture,
    existingMails: MailMessage[] = [],
    userLineup?: Lineup,
    allFixtures?: Fixture[],
    managerName?: string,
    mediaRelationships: Record<string, number> = {},
    sentUnfriendlyPressMonths: string[] = [],
    sentFriendlyPressMonths: string[] = [],
    seasonNumber = 1
  ): MailMessage[] => {
    const newMails: MailMessage[] = [];
    const played = userClub.stats.played;
    const userSquad = allPlayers[userClub.id] || [];

    const createMail = (templateId: string, replacements: Record<string, string> = {}): MailMessage => {
      const template = MAIL_TEMPLATES.find(t => t.id === templateId) || MAIL_TEMPLATES[0];
      let body = template.body;
      let subject = template.subject;
      
      Object.entries(replacements).forEach(([key, val]) => {
        const regex = new RegExp(`{${key}}`, 'g');
        body = body.replace(regex, val);
        subject = subject.replace(regex, val);
      });

      return {
        id: `MAIL_${currentDate.getTime()}_${templateId}_${Math.random()}`,
        sender: template.sender,
        role: template.role,
        subject: subject,
        body: body,
        date: new Date(currentDate),
        isRead: false,
        type: template.type,
        priority: template.type === MailType.BOARD ? 10 : 5
      };
    };

    if (recentFixture && recentFixture.status === MatchStatus.FINISHED) {
       const isUserHome = recentFixture.homeTeamId === userClub.id;
       const userScore = isUserHome ? recentFixture.homeScore : recentFixture.awayScore;
       const oppScore = isUserHome ? recentFixture.awayScore : recentFixture.homeScore;

       if (userScore !== null && oppScore !== null) {
          if (userScore >= 4 && userScore > oppScore) {
             newMails.push(createMail('board_high_win_praise', { 'CLUB': userClub.name }));
          }
          else if (userScore >= 4 && userScore < oppScore) {
             newMails.push(createMail('fans_bitter_loss_high_score', { 'CLUB': userClub.name }));
          }
          else if (oppScore - userScore >= 3) {
             newMails.push(createMail('fans_furious_loss', { 'CLUB': userClub.name }));
          }
       }
    }

    const rivalryWarningMail = buildRivalryWarningMail(currentDate, userClub, allClubs, nextFixture);
    if (rivalryWarningMail && !existingMails.some(mail => mail.id === rivalryWarningMail.id)) {
      newMails.push(rivalryWarningMail);
    }

    const rng = Math.random();

    const month = currentDate.getMonth() + 1; // 1-based
    const day = currentDate.getDate();
    const isBeforeLastLeagueMatch = isBeforeLeagueSeasonEnd(currentDate);
    const isWinterBreak = (month === 12 && day >= 18) || month === 1;
    const boardPositionMonthKey = getYearMonthKey(currentDate);
    const boardPositionTemplateIds = new Set([
      'board_excellent_position',
      'board_bad_position',
      'board_watching_patience',
    ]);
    const alreadySentBoardPositionThisMonth = existingMails.some(mail => {
      const mailDate = getMailDate(mail);
      if (!mailDate || getYearMonthKey(mailDate) !== boardPositionMonthKey) return false;
      return [...boardPositionTemplateIds].some(templateId => mail.id.includes(`_${templateId}_`));
    });
    const remainingUserLeagueMatches = allFixtures
      ? allFixtures.filter(f =>
          f.status === MatchStatus.SCHEDULED &&
          f.leagueId === userClub.leagueId &&
          (f.homeTeamId === userClub.id || f.awayTeamId === userClub.id) &&
          startOfDay(f.date) >= startOfDay(currentDate)
        ).length
      : Number.POSITIVE_INFINITY;
    const canSendLateSeasonBoardPressure = remainingUserLeagueMatches >= 3;

    if (played >= 3 && isBeforeLastLeagueMatch && !isWinterBreak) {
       // expectedRank: non-linear mapping so high-rep clubs (Legia, Lech) expect top 2,
       // mid-rep clubs expect top 5–9, low-rep clubs expect mid/low table
       const expectedRank = Math.max(1, Math.round(19 - userClub.reputation * 1.7));
       const isHighRepClub = userClub.reputation >= 8;
       const isFirstHalf = played < 17;

       if (!alreadySentBoardPositionThisMonth && rng < 0.15) {
          if (rank <= expectedRank - 3) {
             newMails.push(createMail('board_excellent_position', { 'CLUB': userClub.name }));
          } else if (rank >= expectedRank + 4) {
             if (isHighRepClub && isFirstHalf) {
                // First half of season: high-rep board watches patiently instead of panicking
                newMails.push(createMail('board_watching_patience', { 'CLUB': userClub.name }));
             } else {
                newMails.push(createMail('board_bad_position', { 'CLUB': userClub.name }));
             }
          }
       }

       const form = userClub.stats.form;
       let currentWinStreak = 0;
       for (let i = form.length - 1; i >= 0 && form[i] === 'W'; i--) currentWinStreak++;
       let currentLossStreak = 0;
       for (let i = form.length - 1; i >= 0 && form[i] === 'P'; i--) currentLossStreak++;

       if (boardConfidence < 35 && rng < 0.2 && currentLossStreak >= 3) {
          newMails.push(createMail('board_losing_streak', { 'CLUB': userClub.name }));
       } else if (boardConfidence > 85 && rng < 0.1 && currentWinStreak >= 3) {
          newMails.push(createMail('board_winning_streak', { 'CLUB': userClub.name }));
       }
    }

    // --- STYCZEŃ: jednorazowy email zarządu o formie przed przerwą zimową ---
    if (month === 1 && played >= 5) {
      const alreadySentWinterForm = existingMails.some(m => m.id.includes('WINTER_FORM'));
      if (!alreadySentWinterForm) {
        const recentForm = userClub.stats.form.slice(-5);
        const wins = recentForm.filter(r => r === 'W').length;
        const templateByTone = [
          'board_winter_form_poor',
          'board_winter_form_mixed',
          'board_winter_form_good',
          'board_winter_form_excellent',
        ];
        const formTone = wins >= 4 ? 3 : wins === 3 ? 2 : wins === 2 ? 1 : 0;
        const rankToneFloor = rank === 1 ? 2 : rank <= 3 ? 1 : 0;
        const winterTemplateId = templateByTone[Math.max(formTone, rankToneFloor)];
        const winterMail = createMail(winterTemplateId, { 'CLUB': userClub.name });
        winterMail.id = `WINTER_FORM_${currentDate.getFullYear()}`;
        newMails.push(winterMail);
      }
    }

    // --- PRASA: forma zespołu i nastawienie mediów ---
    if (allFixtures && allFixtures.length > 0) {
      const NON_COMPETITIVE = ['FRIENDLY', 'BREAK', 'OFF_SEASON', 'TRANSFER_WINDOW', 'BOARD'];
      const competitiveFixtures = allFixtures
        .filter(f =>
          f.status === MatchStatus.FINISHED &&
          (f.homeTeamId === userClub.id || f.awayTeamId === userClub.id) &&
          !NON_COMPETITIVE.includes(f.leagueId as string) &&
          !(f.leagueId as string).includes('DRAW')
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const isUserWin = (f: Fixture): boolean => {
        const isHome = f.homeTeamId === userClub.id;
        const userScore = isHome ? (f.homeScore ?? 0) : (f.awayScore ?? 0);
        const oppScore = isHome ? (f.awayScore ?? 0) : (f.homeScore ?? 0);
        return userScore > oppScore;
      };

      const isUserLoss = (f: Fixture): boolean => {
        const isHome = f.homeTeamId === userClub.id;
        const userScore = isHome ? (f.homeScore ?? 0) : (f.awayScore ?? 0);
        const oppScore = isHome ? (f.awayScore ?? 0) : (f.homeScore ?? 0);
        return userScore < oppScore;
      };

      const userLeagueFixtures = competitiveFixtures.filter(f => f.leagueId === userClub.leagueId);
      const latestLeagueFixture = userLeagueFixtures[userLeagueFixtures.length - 1];
      const latestLeagueWasPlayedToday = latestLeagueFixture
        ? startOfDay(latestLeagueFixture.date) === startOfDay(currentDate)
        : false;

      if (latestLeagueFixture && userLeagueFixtures.length >= 3 && latestLeagueWasPlayedToday) {
        const friendlyPressMonthKey = getYearMonthKey(currentDate);
        const alreadySentFriendlyThisMonth =
          sentFriendlyPressMonths.includes(friendlyPressMonthKey) ||
          existingMails.some(m => m.id.startsWith(`PRESS_FRIENDLY_START_${friendlyPressMonthKey}_`));

        if (!alreadySentFriendlyThisMonth) {
          const friendlyNewspaper = MediaInterviewService.pickFriendlyNewspaper(mediaRelationships);
          if (friendlyNewspaper) {
            const recentLeagueFixtures = userLeagueFixtures.slice(-3);
            const recentWins = recentLeagueFixtures.filter(isUserWin).length;
            const recentLosses = recentLeagueFixtures.filter(isUserLoss).length;
            const latestWasWin = isUserWin(latestLeagueFixture);
            const latestWasLoss = isUserLoss(latestLeagueFixture);
            const latestResultType = latestWasWin ? 'WIN' : latestWasLoss ? 'LOSS' : 'DRAW';
            const hasGoodResults = latestWasWin || recentWins >= 2 || recentLosses === 0;
            const isEarlyLeagueSeason = userLeagueFixtures.length <= 5;
            const friendlyMailId = `PRESS_FRIENDLY_START_${friendlyPressMonthKey}_${latestLeagueFixture.id}_${friendlyNewspaper}`;
            const alreadySentFriendly = existingMails.some(m => m.id === friendlyMailId);
            if (!alreadySentFriendly) {
              const managerLastName = MediaInterviewService.getPressManagerLabel(managerName);
              const opponentId = latestLeagueFixture.homeTeamId === userClub.id
                ? latestLeagueFixture.awayTeamId
                : latestLeagueFixture.homeTeamId;
              const opponentName = allClubs.find(club => club.id === opponentId)?.name ?? 'rywalem';
              const venueLabel = latestLeagueFixture.homeTeamId === userClub.id ? 'w domu' : 'na wyjeździe';
              const variant = MediaInterviewService.determineFriendlySeasonPressVariant(
                hasGoodResults,
                latestWasWin,
                isEarlyLeagueSeason
              );
              const friendlyMail = MediaInterviewService.generatePressArticleMail(
                variant,
                friendlyNewspaper,
                managerLastName,
                userClub.name,
                currentDate,
                { opponentName, venueLabel, latestResultType }
              );
              friendlyMail.id = friendlyMailId;
              friendlyMail.date = new Date(currentDate);
              friendlyMail.priority = 52;
              newMails.push(friendlyMail);
            }
          }
        }
      }

      if (competitiveFixtures.length >= 5) {
        const last5 = competitiveFixtures.slice(-5);
        const last6th = competitiveFixtures.length >= 6 ? competitiveFixtures[competitiveFixtures.length - 6] : null;

        const allLast5NonWin = last5.every(f => !isUserWin(f));
        const prev6thWasWin = last6th === null || isUserWin(last6th);

        if (allLast5NonWin && prev6thWasWin) {
          const streakMailId = `PRESS_WINLESS_5_${new Date(last5[last5.length - 1].date).getTime()}`;
          const alreadySent = existingMails.some(m => m.id === streakMailId);
          if (!alreadySent) {
            const streakMail = createMail('press_winless_streak', { 'CLUB': userClub.name });
            streakMail.id = streakMailId;
            newMails.push(streakMail);
          }
        }

        const unfriendlyPressMonthKey = getYearMonthKey(currentDate);
        const alreadySentUnfriendlyThisMonth =
          sentUnfriendlyPressMonths.includes(unfriendlyPressMonthKey) ||
          existingMails.some(m => m.id.startsWith(`PRESS_UNFRIENDLY_LOSS_${unfriendlyPressMonthKey}_`));

        if (
          latestLeagueFixture &&
          userLeagueFixtures.length > 5 &&
          latestLeagueWasPlayedToday &&
          isUserLoss(latestLeagueFixture) &&
          !alreadySentUnfriendlyThisMonth
        ) {
          const unfriendlyNewspaper = MediaInterviewService.pickUnfriendlyNewspaper(mediaRelationships);
          if (unfriendlyNewspaper) {
            const criticalMailId = `PRESS_UNFRIENDLY_LOSS_${unfriendlyPressMonthKey}_${latestLeagueFixture.id}_${unfriendlyNewspaper}`;
            const alreadySentCritical = existingMails.some(m => m.id === criticalMailId);
            if (!alreadySentCritical) {
              const managerLastName = MediaInterviewService.getPressManagerLabel(managerName);
              const variant = MediaInterviewService.determineUnfriendlySeasonPressVariant();
              const criticalMail = MediaInterviewService.generatePressArticleMail(
                variant,
                unfriendlyNewspaper,
                managerLastName,
                userClub.name,
                currentDate
              );
              criticalMail.id = criticalMailId;
              criticalMail.date = new Date(currentDate);
              criticalMail.priority = 55;
              newMails.push(criticalMail);
            }
          }
        }
      }
    }

    // --- TYGODNIOWY MAIL NACISKU ZARZĄDU (każdy poniedziałek) ---
    // Obliczenie gap wg tej samej logiki co CoachService.evaluatePerformance
    if (currentDate.getDay() === 1 && userClub.leagueId !== 'NONE' && played > 0 && isBeforeLastLeagueMatch && canSendLateSeasonBoardPressure) {
      const board = userClub.board;
      if (board) {
        const EXPECTED_RANK_FROM_BOARD: Record<string, number> = {
          bardzo_wysoka: 3, wysoka: 6, przecietna: 12, niska: 15, bardzo_niska: 18,
        };
        const AMBICJA_OFFSET: Record<string, number> = {
          bardzo_wysoka: -2, wysoka: -1, przecietna: 0, niska: 2, bardzo_niska: 4,
        };
        const MIN_MATCHES_PRESSURE: Record<string, number> = {
          bardzo_wysoka: 22, wysoka: 17, przecietna: 13, niska: 9, bardzo_niska: 6,
        };
        const boardExpected  = EXPECTED_RANK_FROM_BOARD[board.oczekiwania];
        const repExpected    = Math.max(1, 15 - userClub.reputation);
        const baseExpected   = Math.max(boardExpected, repExpected);
        const expectedRankW  = Math.max(1, baseExpected + AMBICJA_OFFSET[board.ambicja]);
        const minMatchesPr   = MIN_MATCHES_PRESSURE[board.cierpliwosc];
        const gap            = rank - expectedRankW;

        if (played >= minMatchesPr && gap > 0) {
          if (gap >= 7 || (rank >= 16 && userClub.reputation >= 7)) {
            newMails.push(createMail('board_pressure_critical', { 'CLUB': userClub.name }));
          } else if (gap >= 4) {
            newMails.push(createMail('board_pressure_warning', { 'CLUB': userClub.name }));
          } else if (gap >= 2) {
            newMails.push(createMail('board_pressure_concern', { 'CLUB': userClub.name }));
          }
        }
      }
    }

    if (rng < 0.2) {
       const leagueId = userClub.leagueId;
       const otherClubs = allClubs.filter(c => c.leagueId === leagueId && c.id !== userClub.id);
       
       let victim: Player | null = null;
       let victimClub: Club | null = null;

       for (const club of otherClubs) {
          const squad = allPlayers[club.id] || [];
          const injuredStar = squad.find(p => 
            p.health.status === HealthStatus.INJURED && 
            p.health.injury?.severity === InjurySeverity.SEVERE &&
            p.overallRating >= 75 &&
            (p.health.injury?.daysRemaining ?? 0) >= 31
          );
          if (injuredStar) {
            victim = injuredStar;
            victimClub = club;
            break;
          }
       }

       if (victim && victimClub) {
          const alreadySent = existingMails.some(m =>
            m.subject.includes(victim!.lastName)
          );
          if (!alreadySent) {
            newMails.push(createMail('media_league_star_injured', {
               'PLAYER': victim.lastName,
               'OTHER_CLUB': victimClub.name,
               'DAYS': victim.health.injury?.daysRemaining.toString() || '30'
            }));
          }
       }
    }

    const squadIds = new Set([
       ...(userLineup?.startingXI.filter(Boolean) as string[] ?? []),
       ...(userLineup?.bench ?? [])
    ]);
    const isInSquad = (p: Player) => squadIds.size === 0 || squadIds.has(p.id);

    const mildFatiguePlayer = userSquad.find(p =>
       p.condition < 85 && p.condition >= 80 &&
       isInSquad(p) &&
       p.health.status !== HealthStatus.INJURED
    );
    if (mildFatiguePlayer && rng < 0.3) {
       const alreadySentMild = existingMails.some(m =>
         m.subject.includes(mildFatiguePlayer.lastName)
       );
       if (!alreadySentMild) {
         newMails.push(createMail('staff_fatigue_check', { 'PLAYER': mildFatiguePlayer.lastName }));
       }
    }

    const overworkedPlayer = userSquad.find(p =>
       p.condition < 80 &&
       isInSquad(p) &&
       p.health.status !== HealthStatus.INJURED
    );
    if (overworkedPlayer && rng < 0.3) {
       const alreadySentFatigue = existingMails.some(m =>
         m.subject.includes(overworkedPlayer.lastName)
       );
       if (!alreadySentFatigue) {
         newMails.push(createMail('staff_fatigue_warning', { 'PLAYER': overworkedPlayer.lastName }));
       }
    }

    const severeInjury = userSquad.find(p => p.health.status === HealthStatus.INJURED && p.health.injury?.severity === InjurySeverity.SEVERE && p.health.injury.daysRemaining >= 12);
    if (severeInjury && rng < 0.15) {
       const alreadySentSevere = existingMails.some(m =>
         m.subject.includes(severeInjury.lastName)
       );
       if (!alreadySentSevere) {
         newMails.push(createMail('staff_severe_injury', { 
           'PLAYER': severeInjury.lastName, 
           'DAYS': severeInjury.health.injury?.daysRemaining.toString() || '30' 
         }));
       }
    }

    // --- 3 LIPCA: Email z prośbą o wywiad (objęcie stanowiska) ---
    if (seasonNumber === 1 && month === 7 && day === 3) {
      const interviewMailId = `MEDIA_INTERVIEW_OBJECIE_${currentDate.getFullYear()}`;
      const alreadySent = existingMails.some(m => m.id === interviewMailId);
      if (!alreadySent) {
        const mail = MediaInterviewService.generateTakingOverInterviewMail(
          userClub,
          userSquad,
          managerName ?? `${userClub.name} trener`,
          currentDate
        );
        newMails.push(mail);
      }
    }

    return newMails;
  },

  generateIncomingOfferMail(
    player: Player,
    buyerClubName: string,
    buyerLeagueName: string,
    fee: number,
    timing: string,
    sellerClubName: string,
    boardPressure: boolean,
    currentDate: Date,
    offerId: string
  ): MailMessage {
    const playerName = `${player.firstName} ${player.lastName}`;
    const responseDeadline = new Date(currentDate);
    responseDeadline.setDate(responseDeadline.getDate() + 5);
    const deadlineLabel = responseDeadline.toLocaleDateString('pl-PL');

    return {
      id: `incoming_offer_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: 'Dzial Transferowy',
      role: 'Kierownik ds. Transferow',
      subject: `Pilne: Oficjalna oferta transferowa - ${playerName}`,
      body: [
        'Szanowny Trenerze,',
        '',
        `Informuje, ze do klubu wplynela oficjalna oferta transferowa za ${playerName} zlozona przez ${buyerClubName}.`,
        '',
        'Zarzad oraz pion sportowy prosza o Trenera opinie dotyczaca tej propozycji. Prosimy o przeanalizowanie oferty pod katem sportowym oraz roli zawodnika w kadrze w nadchodzacym czasie.',
        '',
        'Kluczowe informacje:',
        '',
        `Zainteresowany klub: ${buyerClubName}`,
        '',
        `Termin rozpatrzenia: Mamy 5 dni na udzielenie oficjalnej odpowiedzi (do dnia ${deadlineLabel}).`,
        '',
        'Bede wdzieczny za informacje zwrotna lub propozycje krotkiego spotkania, abysmy mogli wspolnie wypracowac ostateczne stanowisko klubu w tej sprawie.',
        '',
        'Z powazaniem,',
        '',
        `Dzial Transferowy ${sellerClubName}`,
      ].join('\n'),
      date: currentDate,
      isRead: false,
      type: MailType.SYSTEM,
      priority: boardPressure ? 2 : 1,
      metadata: { type: 'INCOMING_TRANSFER_OFFER', offerId },
    };
    const boardNote = boardPressure
      ? 'UWAGA: Zarząd rozważa sprzedaż ze względów finansowych lub atrakcyjności oferty. Odrzucenie może negatywnie wpłynąć na zaufanie zarządu.\n\n'
      : '';
    const template = MAIL_TEMPLATES.find(t => t.id === 'incoming_offer_initial')!;
    const body = template.body
      .replace('{PLAYER}', `${player.firstName} ${player.lastName}`)
      .replace('{BUYER_CLUB}', buyerClubName)
      .replace('{BUYER_LEAGUE}', buyerLeagueName)
      .replace('{FEE}', fee.toLocaleString('pl-PL'))
      .replace('{TIMING}', timing)
      .replace('{BOARD_PRESSURE_NOTE}', boardNote)
      .replace('{CLUB}', sellerClubName);
    return {
      id: `incoming_offer_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject.replace('{PLAYER}', `${player.firstName} ${player.lastName}`),
      body,
      date: currentDate,
      isRead: false,
      type: template.type,
      priority: boardPressure ? 2 : 1,
      metadata: { type: 'INCOMING_TRANSFER_OFFER', offerId },
    };
  },

  generateIncomingLoanOfferMail(
    player: Player,
    buyerClubName: string,
    buyerLeagueName: string,
    loanFee: number,
    loanDuration: string,
    wageCoveragePercent: number,
    sellerClubName: string,
    currentDate: Date,
    offerId: string
  ): MailMessage {
    const playerName = `${player.firstName} ${player.lastName}`;
    const responseDeadline = new Date(currentDate);
    responseDeadline.setDate(responseDeadline.getDate() + 5);
    const deadlineLabel = responseDeadline.toLocaleDateString('pl-PL');

    return {
      id: `incoming_loan_offer_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: 'Dział Transferowy',
      role: 'Kierownik ds. Wypożyczeń',
      subject: `Oferta wypożyczenia - ${playerName}`,
      body: [
        'Szanowny Trenerze,',
        '',
        `Do klubu wpłynęła oficjalna oferta wypożyczenia zawodnika ${playerName}.`,
        '',
        'ZAINTERESOWANY KLUB',
        `${buyerClubName} (${buyerLeagueName})`,
        '',
        'UZASADNIENIE OFERTY',
        'Klub argumentuje, że zawodnik byłby realnym wzmocnieniem ich kadry i deklaruje gotowość do przejęcia części kosztów kontraktu.',
        '',
        'WARUNKI PROPOZYCJI',
        `• Okres: ${loanDuration}`,
        `• Pokrycie kontraktu: ${wageCoveragePercent}%`,
        `• Opłata za wypożyczenie: ${loanFee.toLocaleString('pl-PL')} PLN`,
        '',
        'DECYZJA',
        `Termin rozpatrzenia: do dnia ${deadlineLabel}.`,
        'Decyzję można podjąć bez oczekiwania na kolejną turę negocjacji.',
        '',
        'Z poważaniem,',
        `Dział Transferowy ${sellerClubName}`,
      ].join('\n'),
      date: currentDate,
      isRead: false,
      type: MailType.SYSTEM,
      priority: 1,
      metadata: { type: 'INCOMING_TRANSFER_OFFER', offerId },
    };
  },

  generateIncomingOfferReminderMail(
    player: Player,
    buyerClubName: string,
    fee: number,
    sellerClubName: string,
    currentDate: Date,
    offerId: string
  ): MailMessage {
    const template = MAIL_TEMPLATES.find(t => t.id === 'incoming_offer_reminder')!;
    const body = template.body
      .replace('{PLAYER}', `${player.firstName} ${player.lastName}`)
      .replace('{BUYER_CLUB}', buyerClubName)
      .replace('{FEE}', fee.toLocaleString('pl-PL'))
      .replace('{CLUB}', sellerClubName);
    return {
      id: `incoming_reminder_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject.replace('{PLAYER}', `${player.firstName} ${player.lastName}`),
      body,
      date: currentDate,
      isRead: false,
      type: template.type,
      priority: 2,
      metadata: { type: 'INCOMING_TRANSFER_OFFER', offerId },
    };
  },

  generateIncomingOfferExpiredMail(
    player: Player,
    buyerClubName: string,
    sellerClubName: string,
    currentDate: Date
  ): MailMessage {
    const template = MAIL_TEMPLATES.find(t => t.id === 'incoming_offer_expired')!;
    const body = template.body
      .replace('{PLAYER}', `${player.firstName} ${player.lastName}`)
      .replace(/{BUYER_CLUB}/g, buyerClubName)
      .replace('{CLUB}', sellerClubName);
    return {
      id: `incoming_expired_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject.replace('{PLAYER}', `${player.firstName} ${player.lastName}`),
      body,
      date: currentDate,
      isRead: false,
      type: template.type,
      priority: 0,
    };
  },

  generateAIAcceptedCounterMail(
    player: Player,
    buyerClubName: string,
    fee: number,
    sellerClubName: string,
    currentDate: Date,
    offerId: string
  ): MailMessage {
    const template = MAIL_TEMPLATES.find(t => t.id === 'incoming_offer_ai_accepted_counter')!;
    const body = template.body
      .replace('{PLAYER}', `${player.firstName} ${player.lastName}`)
      .replace('{BUYER_CLUB}', buyerClubName)
      .replace('{FEE}', fee.toLocaleString('pl-PL'))
      .replace('{CLUB}', sellerClubName);
    return {
      id: `incoming_ai_acc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject
        .replace('{BUYER_CLUB}', buyerClubName)
        .replace('{PLAYER}', `${player.firstName} ${player.lastName}`),
      body,
      date: currentDate,
      isRead: false,
      type: template.type,
      priority: 2,
      metadata: { type: 'INCOMING_TRANSFER_OFFER', offerId },
    };
  },

  generateAICounteredMail(
    player: Player,
    buyerClubName: string,
    aiCounterFee: number,
    round: number,
    sellerClubName: string,
    currentDate: Date,
    offerId: string
  ): MailMessage {
    const template = MAIL_TEMPLATES.find(t => t.id === 'incoming_offer_ai_countered')!;
    const body = template.body
      .replace('{PLAYER}', `${player.firstName} ${player.lastName}`)
      .replace('{BUYER_CLUB}', buyerClubName)
      .replace('{AI_COUNTER_FEE}', aiCounterFee.toLocaleString('pl-PL'))
      .replace('{ROUND}', round.toString())
      .replace('{CLUB}', sellerClubName);
    return {
      id: `incoming_ai_ctr_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject
        .replace('{BUYER_CLUB}', buyerClubName)
        .replace('{PLAYER}', `${player.firstName} ${player.lastName}`),
      body,
      date: currentDate,
      isRead: false,
      type: template.type,
      priority: 2,
      metadata: { type: 'INCOMING_TRANSFER_OFFER', offerId },
    };
  },

  generateAIRejectedCounterMail(
    player: Player,
    buyerClubName: string,
    sellerClubName: string,
    currentDate: Date
  ): MailMessage {
    const template = MAIL_TEMPLATES.find(t => t.id === 'incoming_offer_ai_rejected_counter')!;
    const body = template.body
      .replace('{PLAYER}', `${player.firstName} ${player.lastName}`)
      .replace('{BUYER_CLUB}', buyerClubName)
      .replace('{CLUB}', sellerClubName);
    return {
      id: `incoming_ai_rej_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject
        .replace('{BUYER_CLUB}', buyerClubName)
        .replace('{PLAYER}', `${player.firstName} ${player.lastName}`),
      body,
      date: currentDate,
      isRead: false,
      type: template.type,
      priority: 1,
    };
  },

  generatePlayerAcceptedConfirmMail(
    player: Player,
    buyerClubName: string,
    fee: number,
    timing: string,
    sellerClubName: string,
    currentDate: Date,
    offerId: string
  ): MailMessage {
    const template = MAIL_TEMPLATES.find(t => t.id === 'incoming_offer_player_accepted_confirm')!;
    const body = template.body
      .replace('{PLAYER}', `${player.firstName} ${player.lastName}`)
      .replace('{BUYER_CLUB}', buyerClubName)
      .replace('{FEE}', fee.toLocaleString('pl-PL'))
      .replace('{TIMING}', timing)
      .replace('{CLUB}', sellerClubName);
    return {
      id: `incoming_plr_acc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject
        .replace('{PLAYER}', `${player.firstName} ${player.lastName}`),
      body,
      date: currentDate,
      isRead: false,
      type: template.type,
      priority: 3,
      metadata: { type: 'INCOMING_TRANSFER_OFFER', offerId },
    };
  },

  generatePlayerRefusedMail(
    player: Player,
    buyerClubName: string,
    sellerClubName: string,
    currentDate: Date
  ): MailMessage {
    const template = MAIL_TEMPLATES.find(t => t.id === 'incoming_offer_player_refused')!;
    const body = template.body
      .replace('{PLAYER}', `${player.firstName} ${player.lastName}`)
      .replace('{BUYER_CLUB}', buyerClubName)
      .replace('{CLUB}', sellerClubName);
    return {
      id: `incoming_plr_ref_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender: template.sender,
      role: template.role,
      subject: template.subject
        .replace('{PLAYER}', `${player.firstName} ${player.lastName}`)
        .replace('{BUYER_CLUB}', buyerClubName),
      body,
      date: currentDate,
      isRead: false,
      type: template.type,
      priority: 1,
    };
  },

  generateNTCallUpMail: (player: Player, nationalTeamName: string, date: Date): MailMessage => {
    return {
      id: `NT_CALLUP_${player.id}_${date.getFullYear()}_${date.getMonth()}`,
      sender: 'Biuro Ligowe',
      role: 'Administrator rozgrywek',
      subject: `Powołanie reprezentacyjne: ${player.firstName} ${player.lastName}`,
      body: `Informujemy, że Twój zawodnik ${player.firstName} ${player.lastName} (${player.position}, ${player.overallRating} OVR) został powołany do reprezentacji narodowej ${nationalTeamName}.\n\nW terminach zgrupowań i meczów reprezentacyjnych zawodnik będzie niedostępny dla Twojego klubu.`,
      date,
      isRead: false,
      type: MailType.STAFF,
      priority: 70,
    };
  },
};
