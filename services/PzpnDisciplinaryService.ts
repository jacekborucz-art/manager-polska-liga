import { Club, FinanceLog, Fixture, MailMessage, MailType, MatchStatus } from '../types';
import { RivalryService } from './RivalryService';

export interface PzpnDisciplinaryEvent {
  id: string;
  seasonNumber: number;
  date: string;
  fixtureId: string;
  leagueId: string;
  clubId: string;
  clubName: string;
  opponentName: string;
  fineAmount: number;
  awayBanMatches: number;
  reason: string;
  seasonOrdinal: number;
}

interface EvaluateArgs {
  fixture: Fixture;
  homeClub: Club;
  awayClub: Club;
  seasonNumber: number;
  currentDate: Date;
  sessionSeed: number;
  existingEvents: PzpnDisciplinaryEvent[];
}

const POLISH_LEAGUES = new Set(['L_PL_1', 'L_PL_2', 'L_PL_3']);
const EVENT_HISTORY_LIMIT = 150;

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededRandom = (seed: string): number => {
  let x = hashString(seed) || 1;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return ((x >>> 0) % 1_000_000) / 1_000_000;
};

const getDateKey = (date: Date | string): string => {
  const parsed = date instanceof Date ? date : new Date(date);
  return parsed.toISOString().split('T')[0];
};

const getLeagueTier = (leagueId: string): number => {
  const parsed = Number(leagueId.split('_')[2]);
  return Number.isFinite(parsed) ? parsed : 1;
};

const getSeasonCap = (sessionSeed: number, seasonNumber: number): number =>
  1 + Math.floor(seededRandom(`${sessionSeed}:pzpn-cap:${seasonNumber}`) * 5);

const getFineRange = (leagueId: string): [number, number] => {
  switch (getLeagueTier(leagueId)) {
    case 1:
      return [45_000, 220_000];
    case 2:
      return [18_000, 85_000];
    case 3:
      return [8_000, 42_000];
    default:
      return [5_000, 25_000];
  }
};

const roundFine = (value: number): number => Math.round(value / 1_000) * 1_000;

const getReason = (roll: number): string => {
  if (roll < 0.28) return 'użycie środków pirotechnicznych';
  if (roll < 0.52) return 'rzucanie przedmiotów na murawę';
  if (roll < 0.76) return 'obraźliwe okrzyki i naruszenie porządku na stadionie';
  return 'zakłócenie bezpieczeństwa podczas meczu';
};

export const PzpnDisciplinaryService = {
  isEligibleFixture(fixture: Fixture): boolean {
    return fixture.status === MatchStatus.FINISHED && POLISH_LEAGUES.has(String(fixture.leagueId));
  },

  getSeasonCap,

  evaluateAfterMatch({
    fixture,
    homeClub,
    awayClub,
    seasonNumber,
    currentDate,
    sessionSeed,
    existingEvents,
  }: EvaluateArgs): PzpnDisciplinaryEvent | null {
    if (!this.isEligibleFixture(fixture)) return null;

    const fixtureEventId = `PZPN_FANS_${seasonNumber}_${fixture.id}`;
    if (existingEvents.some(event => event.fixtureId === fixture.id || event.id === fixtureEventId)) return null;

    const seasonEvents = existingEvents.filter(event => event.seasonNumber === seasonNumber);
    if (seasonEvents.length >= getSeasonCap(sessionSeed, seasonNumber)) return null;

    const rivalry = RivalryService.getMatchContext(homeClub, awayClub);
    const highRiskBoost = rivalry.tier === 'CLASSIC'
      ? 0.026
      : rivalry.tier === 'DERBY'
        ? 0.020
        : rivalry.tier === 'RIVAL'
          ? 0.012
          : 0;
    const reputationBoost = Math.min(0.008, ((homeClub.reputation + awayClub.reputation) / 20) * 0.006);
    const probability = 0.004 + highRiskBoost + reputationBoost;
    const baseSeed = `${sessionSeed}:pzpn-event:${seasonNumber}:${fixture.id}`;

    if (seededRandom(`${baseSeed}:trigger`) >= probability) return null;

    const awayClubRoll = seededRandom(`${baseSeed}:club`);
    const punishedClub = awayClubRoll < (rivalry.isDerby ? 0.45 : 0.35) ? awayClub : homeClub;
    const opponentClub = punishedClub.id === homeClub.id ? awayClub : homeClub;
    const [minFine, maxFine] = getFineRange(String(fixture.leagueId));
    const reputationMultiplier = 0.85 + (punishedClub.reputation / 10) * 0.35;
    const fineRoll = seededRandom(`${baseSeed}:fine`);
    const fineAmount = roundFine((minFine + (maxFine - minFine) * fineRoll) * reputationMultiplier);

    return {
      id: fixtureEventId,
      seasonNumber,
      date: getDateKey(currentDate),
      fixtureId: fixture.id,
      leagueId: String(fixture.leagueId),
      clubId: punishedClub.id,
      clubName: punishedClub.name,
      opponentName: opponentClub.name,
      fineAmount,
      awayBanMatches: 1 + Math.floor(seededRandom(`${baseSeed}:ban`) * 4),
      reason: getReason(seededRandom(`${baseSeed}:reason`)),
      seasonOrdinal: seasonEvents.length + 1,
    };
  },

  applyEventToClubs(clubs: Club[], event: PzpnDisciplinaryEvent): Club[] {
    return clubs.map(club => {
      if (club.id !== event.clubId) return club;

      const financeLog: FinanceLog = {
        id: `FIN_${event.id}`,
        date: event.date,
        amount: -event.fineAmount,
        type: 'EXPENSE',
        description: `Kara PZPN za zachowanie kibiców`,
        previousBalance: club.budget,
      };

      return {
        ...club,
        budget: club.budget - event.fineAmount,
        financeHistory: [financeLog, ...(club.financeHistory || [])].slice(0, 50),
      };
    });
  },

  createMail(event: PzpnDisciplinaryEvent, currentDate: Date, userTeamId: string | null): MailMessage {
    const isUserClub = event.clubId === userTeamId;
    const caseLabel = (event.seasonOrdinal ?? 1) <= 1 ? 'pierwszy' : 'kolejny';
    return {
      id: `MAIL_${event.id}`,
      sender: 'Gazeta Sportowa',
      role: 'Gazeta Sportowa',
      subject: `KARA FINANSOWA DLA ${event.clubName.toUpperCase()}`,
      body: `ŹRÓDŁO: GAZETA SPORTOWA

KARA FINANSOWA DLA ${event.clubName.toUpperCase()}

PZNP nałożył karę finansową na ${event.clubName} za zachowanie kibiców.

Komisja Dyscyplinarna PZNP poinformowała o nałożeniu kary finansowej na ${event.clubName} w wysokości ${event.fineAmount.toLocaleString('pl-PL')} złotych w związku z niewłaściwym zachowaniem kibiców podczas ostatniego spotkania ligowego z ${event.opponentName}.

Jak przekazano w oficjalnym komunikacie federacji, sankcja ma związek z incydentami odnotowanymi na trybunach, które naruszały obowiązujące przepisy organizacyjne i regulamin rozgrywek. Szczegółowy charakter przewinień nie został szerzej opisany, jednak według informacji przekazanych przez związek, decyzja została podjęta po analizie raportów delegata meczowego oraz dokumentacji zgromadzonej po zakończeniu spotkania.

Klub ${event.clubName} nie wydał dotychczas oficjalnego stanowiska w sprawie decyzji Komisji Dyscyplinarnej. Nie wiadomo również, czy władze klubu zdecydują się na złożenie odwołania od nałożonej sankcji.

To ${caseLabel} przypadek w bieżącym sezonie, gdy organy dyscyplinarne PZNP reagują na incydenty związane z zachowaniem kibiców podczas wydarzeń piłkarskich. Federacja od dłuższego czasu podkreśla, że kwestie bezpieczeństwa oraz przestrzegania regulaminów stadionowych pozostają jednym z priorytetów organizacji rozgrywek.

Informacyjnie: kibice ukaranego klubu otrzymali zakaz wyjazdów na ${event.awayBanMatches} ${event.awayBanMatches === 1 ? 'mecz' : 'mecze'}.`,
      date: currentDate,
      isRead: false,
      type: MailType.MEDIA,
      priority: isUserClub ? 8 : 4,
    };
  },

  mergeEvents(existingEvents: PzpnDisciplinaryEvent[], newEvents: PzpnDisciplinaryEvent[]): PzpnDisciplinaryEvent[] {
    const seen = new Set<string>();
    return [...newEvents, ...existingEvents]
      .filter(event => {
        if (seen.has(event.id)) return false;
        seen.add(event.id);
        return true;
      })
      .slice(0, EVENT_HISTORY_LIMIT);
  },
};
