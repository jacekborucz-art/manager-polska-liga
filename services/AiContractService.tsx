import { Club, Player, PendingNegotiation, PlayerPosition, TransferTiming, TransferClubBidInput, TransferContractInput, AiTransferLogEntry } from '../types';
import { FinanceService as FinanceLogic } from './FinanceService';
import { TransferSellerLogicService } from './TransferSellerLogicService';
import { TransferPlayerDecisionService } from './TransferPlayerDecisionService';
import { FreeAgentNegotiationService } from './FreeAgentNegotiationService';
import { PlayerCareerService } from './PlayerCareerService';

/**
 * Sprawdza czy aktualnie trwa okno transferowe.
 * Nie dotyczy wolnych agentów — ci mogą być podpisywani przez cały rok.
 *
 * Letnie:  1 lipca  (m6, d1)  — 8 września  (m8, d8)  włącznie
 * Zimowe: 12 stycznia (m0, d12) — 13 lutego (m1, d13) włącznie
 */
const _isTransferWindowOpen = (currentDate: Date): boolean => {
  const month = currentDate.getMonth();
  const day = currentDate.getDate();

  const isSummer =
    (month === 6 && day >= 1) ||
    month === 7 ||
    (month === 8 && day <= 8);

  const isWinter =
    (month === 0 && day >= 12) ||
    (month === 1 && day <= 13);

  return isSummer || isWinter;
};

/**
 * Zwraca datę otwarcia najbliższego okna transferowego (dla negocjacji poza oknem).
 * Letnie:  1 lipca   Zimowe: 12 stycznia
 */
const _getNextWindowStart = (currentDate: Date): Date => {
  const month = currentDate.getMonth();
  const day = currentDate.getDate();
  const year = currentDate.getFullYear();
  if (month === 0 && day < 12) return new Date(year, 0, 12);
  if ((month === 1 && day >= 14) || (month >= 2 && month <= 5)) return new Date(year, 6, 1);
  return new Date(year + 1, 0, 12);
};

const _hasActiveTransferLockout = (player: Player, currentDate: Date): boolean => {
  return !!player.transferLockoutUntil && currentDate < new Date(player.transferLockoutUntil);
};

const _buildTransferLockoutUntil = (currentDate: Date): string => {
  const lockoutDate = new Date(currentDate);
  lockoutDate.setMonth(lockoutDate.getMonth() + 3);
  return lockoutDate.toISOString();
};

const _buildTransferOfferBanUntil = (currentDate: Date): string => {
  const banDate = new Date(currentDate);
  banDate.setFullYear(banDate.getFullYear() + 1);
  return banDate.toISOString();
};

const _hasActiveTransferOfferBan = (player: Player, currentDate: Date): boolean => {
  return !!player.transferOfferBanUntil && currentDate < new Date(player.transferOfferBanUntil);
};

const _getTransferListOpportunity = (
  player: Player,
  buyerClub: Club,
  sellerClub: Club
): { scoreBonus: number; budgetBoost: number } => {
  if (!player.isOnTransferList) return { scoreBonus: 0, budgetBoost: 0 };

  const repDelta = sellerClub.reputation - buyerClub.reputation;
  const buyerIdealOvr = 30 + buyerClub.reputation * 4.5;
  const sellerIdealOvr = 30 + sellerClub.reputation * 4.5;
  const qualityVsSeller = player.overallRating - sellerIdealOvr;

  let scoreBonus = 0;
  let budgetBoost = 0;

  if (repDelta >= -1 && repDelta <= 2) {
    scoreBonus += 12;
    budgetBoost += 0.10;
  } else if (repDelta <= 5 && player.overallRating >= buyerIdealOvr - 2) {
    scoreBonus += 6;
    budgetBoost += 0.05;
  }

  if (sellerClub.reputation >= buyerClub.reputation) scoreBonus += 4;

  if (qualityVsSeller >= 4) {
    scoreBonus += 12;
    budgetBoost += 0.10;
  } else if (qualityVsSeller >= 1) {
    scoreBonus += 8;
    budgetBoost += 0.05;
  }

  if (player.age <= 29) scoreBonus += 3;
  if (player.age >= 33) scoreBonus -= 2;

  return {
    scoreBonus: Math.max(0, scoreBonus),
    budgetBoost: Math.min(0.20, Math.max(0, budgetBoost))
  };
};

interface ClubNeedAssessment {
  position: PlayerPosition;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: 'SHORTAGE' | 'CONTRACT_LOSS' | 'INJURY' | 'QUALITY_GAP' | 'FORM_PANIC' | 'IMPULSE';
  starterRequired: boolean;
}

/**
 * Centralna diagnoza potrzeb transferowych klubu AI.
 * Zastępuje trzy oddzielne kopie logiki w funkcjach zakupowych.
 *
 * Triggery:
 *   SHORTAGE      — za mało zawodników na pozycji (CRITICAL)
 *   CONTRACT_LOSS — lider odmówił przedłużenia i wkrótce odejdzie (HIGH)
 *   INJURY        — lider kontuzjowany >30 dni (HIGH)
 *   FORM_PANIC    — ≥3 porażki z ostatnich 5 → losowa "winna" pozycja (HIGH)
 *   QUALITY_GAP   — najlepszy OVR poniżej idealOvr−8 (MEDIUM)
 *   IMPULSE       — 6% szansy "trener chciał" upgrade (LOW)
 *
 * Nieprzewidywalność:
 *   - Szum ±15% na QUALITY_GAP (seed per klub+miesiąc) — różne progi reakcji
 *   - FORM_PANIC losuje JEDNĄ pozycję, nie wszystkie
 *   - "Reluctant buyer": 10% szansy pominięcia MEDIUM/LOW w danym miesiącu
 *   - Budget aggression: bogate kluby mają próg IMPULSE ×2
 */
const _assessClubNeeds = (
  club: Club,
  squad: Player[],
  currentDate: Date
): ClubNeedAssessment[] => {
  const monthKey = currentDate.getFullYear() * 100 + currentDate.getMonth();
  const clubHash = Math.abs(club.id.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0));
  const seed = (clubHash ^ (monthKey * 2654435761)) >>> 0;
  const seededRand = (offset: number): number => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const positions: PlayerPosition[] = ['GK', 'DEF', 'MID', 'FWD'];
  const minCounts: Record<PlayerPosition, number> = { GK: 2, DEF: 5, MID: 4, FWD: 3 };
  const idealOvr = 30 + club.reputation * 4.5;

  // FORM_PANIC: ≥3 strat z ostatnich 5 → losuje się JEDNA pozycja "winna" serii
  const recentForm = (club.stats as any)?.form as string[] | undefined || [];
  const recentLosses = recentForm.slice(-5).filter(r => r === 'P').length;
  const panicPosition: PlayerPosition | null = recentLosses >= 3
    ? positions[Math.floor(seededRand(9999) * positions.length)]
    : null;

  const results: ClubNeedAssessment[] = [];

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    const posSquad = squad.filter(p => p.position === pos);
    const posCount = posSquad.length;
    const keyPlayer = [...posSquad].sort((a, b) => b.overallRating - a.overallRating)[0];
    const bestOvr = keyPlayer?.overallRating || 0;

    // Szum ±15% per pozycja — różne kluby mają różne progi QUALITY_GAP
    const urgencyNoise = 1 + (seededRand(i * 37 + 1) * 0.30 - 0.15);

    // TRIGGER 1: SHORTAGE (CRITICAL)
    if (posCount < minCounts[pos]) {
      results.push({ position: pos, urgency: 'CRITICAL', reason: 'SHORTAGE', starterRequired: true });
      continue;
    }

    // TRIGGER 2: CONTRACT_LOSS (HIGH)
    // Lider odmówił przedłużenia — wiadomo że odejdzie, szukaj następcy z wyprzedzeniem
    const daysToExpiry = keyPlayer
      ? Math.floor((new Date(keyPlayer.contractEndDate).getTime() - currentDate.getTime()) / 86_400_000)
      : 999;
    if (keyPlayer?.isNegotiationPermanentBlocked && daysToExpiry < 180 && daysToExpiry > 0) {
      results.push({ position: pos, urgency: 'HIGH', reason: 'CONTRACT_LOSS', starterRequired: true });
      continue;
    }

    // TRIGGER 3: INJURY (HIGH)
    // Lider kontuzjowany >30 dni — rotacyjny zastępca wystarczy
    if (keyPlayer?.health.status === 'INJURED' && (keyPlayer.health.injury?.daysRemaining || 0) > 30) {
      results.push({ position: pos, urgency: 'HIGH', reason: 'INJURY', starterRequired: false });
      continue;
    }

    // TRIGGER 4: FORM_PANIC (HIGH)
    // Losowa "winna" pozycja po serii porażek — zarząd wywiera presję na jedną pozycję
    if (pos === panicPosition) {
      results.push({ position: pos, urgency: 'HIGH', reason: 'FORM_PANIC', starterRequired: true });
      continue;
    }

    // TRIGGER 5: QUALITY_GAP (MEDIUM) — z szumem: różne kluby reagują przy różnych progach
    const ovrGap = (idealOvr - bestOvr) * urgencyNoise;
    if (ovrGap > 8) {
      results.push({
        position: pos,
        urgency: 'MEDIUM',
        reason: 'QUALITY_GAP',
        starterRequired: ovrGap > 14
      });
      continue;
    }

    // TRIGGER 6: IMPULSE (LOW) — "trener chciał" — bogaty klub ma wyższy próg
    const budgetAggression = club.budget > FinanceLogic.getFairMarketSalary(idealOvr) * 18 ? 2.0 : 1.0;
    if (seededRand(i * 113 + 7) < 0.06 * budgetAggression) {
      results.push({ position: pos, urgency: 'LOW', reason: 'IMPULSE', starterRequired: false });
    }
  }

  // "Reluctant buyer": 10% szansy że klub z MEDIUM/LOW potrzebami odpuszcza w tym miesiącu
  if (seededRand(42) < 0.10) {
    return results.filter(r => r.urgency === 'CRITICAL' || r.urgency === 'HIGH');
  }

  const urgencyOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  return results.sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency]);
};

export const AiContractService = {
  /**
   * Przetwarza wszystkie kluby AI w poszukiwaniu kończących się kontraktów.
   */
  processClubsContracts: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]> } => {
    
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };

    updatedClubs = updatedClubs.map(club => {
      // Pomijamy klub gracza i kluby bez przypisanych piłkarzy
      if (club.id === userTeamId || !updatedPlayersMap[club.id]) return club;

      let currentClub = { ...club };
      const squad = updatedPlayersMap[club.id];

      updatedPlayersMap[club.id] = squad.map(player => {
        const p = { ...player };
        
        // 1. Sprawdzenie czy kontrakt wygasa (poniżej 365 dni)
        const daysLeft = Math.floor((new Date(p.contractEndDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft > 365) return p;

        // 2. Blokady: Czy zawodnik chce w ogóle rozmawiać?
        const isLocked = p.negotiationLockoutUntil && currentDate < new Date(p.negotiationLockoutUntil);
        if (isLocked || p.isNegotiationPermanentBlocked) return p;

        // 3. Obliczanie oferty AI
        // AI oferuje podwyżkę 10-25% zależnie od reputacji klubu
        const salaryMultiplier = 1.10 + (club.reputation / 100);
        const proposedSalary = Math.floor(p.annualSalary * salaryMultiplier);
        
        // Bonus za podpis - AI oferuje ok 50% tego co zawodnik chce, o ile klub ma kasę
        const baseDemand = FinanceLogic.calculatePlayerBonusDemand(p, proposedSalary, club.reputation);
        const proposedBonus = Math.floor(baseDemand * 0.75);

        // Czy klub ma na to pieniądze w puli bonusowej?
        if (proposedBonus > currentClub.signingBonusPool) return p;

        // 4. Ewaluacja silnikiem gry
        const newEndDate = new Date(currentDate.getFullYear() + 2, 5, 30).toISOString(); // Nowa umowa na +2 lata
        const result = FinanceLogic.evaluateContractLogic(p, proposedSalary, proposedBonus, newEndDate, currentDate, club.reputation);

        if (result.accepted) {
          // SUKCES: Piłkarz zostaje
          currentClub.signingBonusPool -= proposedBonus;
          currentClub.budget -= proposedBonus;
          return {
            ...p,
            annualSalary: proposedSalary,
            contractEndDate: newEndDate,
            negotiationStep: 0,
            isOnTransferList: false // Zdejmij z listy jeśli podpisał
          };
        } else {
          // PORAŻKA: Zwiększ licznik prób
          const nextStep = (p.negotiationStep || 0) + 1;
          const lockout = new Date(currentDate);
          lockout.setDate(lockout.getDate() + 21); // Blokada na 3 tygodnie

          const permanentBlock = nextStep >= 3;
          
          return {
            ...p,
            negotiationStep: nextStep,
            negotiationLockoutUntil: lockout.toISOString(),
            isNegotiationPermanentBlocked: permanentBlock,
            isOnTransferList: permanentBlock // Jeśli obraził się na amen -> trafia na listę transferową
          };
        }
      });

      return currentClub;
    });

    return { updatedClubs, updatedPlayers: updatedPlayersMap };
  },

  // TUTAJ WSTAW TEN KOD - SYSTEM REKRUTACJI FAIR PLAY
  /**
   * Analizuje wolnych agentów i generuje oferty oczekujące dla klubów AI.
   */
processAiRecruitment: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]>, newOffers: PendingNegotiation[] } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const newOffers: PendingNegotiation[] = []; // AI nie używa już flow PendingNegotiation

    const freeAgents = updatedPlayersMap['FREE_AGENTS'] || [];
    if (freeAgents.length === 0) return { updatedClubs, updatedPlayers: updatedPlayersMap, newOffers };

    updatedClubs = updatedClubs.map(club => {
      if (club.id === userTeamId) return club;

      // DYNAMICZNA diagnoza potrzeb kadrowych:
      // klub szuka nie tylko brakow ilosciowych, ale tez upgrade'u na zbyt slabej pozycji.
      const squad = updatedPlayersMap[club.id] || [];
      const minCounts: Record<string, number> = { GK: 2, DEF: 5, MID: 4, FWD: 3 };
      const idealOvr = 30 + club.reputation * 4.5;
      const needsFA = _assessClubNeeds(club, squad, currentDate);
      if (needsFA.length === 0) return club;

      // OGRANICZENIE CZĘSTOTLIWOŚCI: klub może mieć tylko 1 aktywną negocjację z wolnym agentem
      const alreadyNegotiating = freeAgents.some(fa => fa.aiNegotiationClubId === club.id);
      if (alreadyNegotiating) return club;

      if (club.budget <= 250_000) return club;

      // Szukanie kandydata: pasująca pozycja, OVR w zasięgu, nie jest już w negocjacji z innym AI, brak blokady
      // Używamy updatedPlayersMap zamiast freeAgents — freeAgents to stary snapshot sprzed pętli.
      // Bez tego kilka klubów może w jednej iteracji zgłosić się do tego samego agenta.
      const candidate = (updatedPlayersMap['FREE_AGENTS'] || []).find(fa => {
        const needFA = needsFA.find(n => n.position === fa.position);
        if (!needFA) return false;
        const faMinOvr = needFA.urgency === 'CRITICAL' ? idealOvr - 16 : idealOvr - 12;
        if (fa.overallRating > idealOvr + 7 || fa.overallRating < faMinOvr) return false;
        if (fa.aiNegotiationClubId) return false;
        if (FreeAgentNegotiationService.isClubLockedOut(fa, club.id, currentDate)) return false;

        const posSquad = squad.filter(p => p.position === fa.position);
        const weakestExisting = [...posSquad].sort((a, b) => a.overallRating - b.overallRating)[0];
        const hasShortage = posSquad.length < minCounts[fa.position];
        const isUpgrade = !!weakestExisting && fa.overallRating >= weakestExisting.overallRating + 2;

        return hasShortage || isUpgrade;
      });

      if (!candidate) return club;

      // Oznacz wolnego agenta jako "w negocjacji" — okno 4 dni dla gracza na kontr-ofertę
      const responseDate = new Date(currentDate);
      responseDate.setDate(responseDate.getDate() + 4);

      const faList = updatedPlayersMap['FREE_AGENTS'];
      const idx = faList.findIndex(p => p.id === candidate.id);
      if (idx !== -1) {
        updatedPlayersMap['FREE_AGENTS'] = faList.map((p, i) =>
          i === idx
            ? { ...p, aiNegotiationClubId: club.id, aiNegotiationResponseDate: responseDate.toISOString() }
            : p
        );
      }

      return club;
    });

    return { updatedClubs, updatedPlayers: updatedPlayersMap, newOffers };
  },

/**
   * Rozwiązuje zakończone negocjacje AI z wolnymi agentami.
   * Wywoływana codziennie. Gdy aiNegotiationResponseDate <= dziś:
   *   - Ocenia akceptację oferty używając reputacji AI-klubu
   *   - Jeśli TAK: przenosi zawodnika do składu AI-klubu
   *   - Jeśli NIE: czyści pola, ustawia blokadę 90 dni
   */
  resolveAiFreeAgentNegotiations: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]> } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };

    const freeAgents = updatedPlayersMap['FREE_AGENTS'] || [];
    const today = currentDate.getTime();

    const due = freeAgents.filter(fa =>
      fa.aiNegotiationClubId &&
      fa.aiNegotiationResponseDate &&
      new Date(fa.aiNegotiationResponseDate).getTime() <= today
    );

    if (due.length === 0) return { updatedClubs, updatedPlayers: updatedPlayersMap };

    for (const fa of due) {
      const aiClub = updatedClubs.find(c => c.id === fa.aiNegotiationClubId);

      if (!aiClub || aiClub.id === userTeamId) {
        // Klub nie istnieje lub to klub gracza — wyczyść flagi
        updatedPlayersMap['FREE_AGENTS'] = (updatedPlayersMap['FREE_AGENTS'] || []).map(p =>
          p.id === fa.id ? { ...p, aiNegotiationClubId: undefined, aiNegotiationResponseDate: undefined } : p
        );
        continue;
      }

      const proposedSalary = FinanceLogic.getFairMarketSalary(fa.overallRating);
      const proposedBonus = Math.floor(proposedSalary * 0.4);
      const newEndDate = new Date(currentDate.getFullYear() + 2, 5, 30).toISOString();

      if (aiClub.budget < proposedBonus + proposedSalary) {
        // Brak środków — wyczyść flagę
        updatedPlayersMap['FREE_AGENTS'] = (updatedPlayersMap['FREE_AGENTS'] || []).map(p =>
          p.id === fa.id ? { ...p, aiNegotiationClubId: undefined, aiNegotiationResponseDate: undefined } : p
        );
        continue;
      }

      const result = FinanceLogic.evaluateContractLogic(fa, proposedSalary, proposedBonus, newEndDate, currentDate, aiClub.reputation);

      if (result.accepted) {
        // Przenieś zawodnika do składu AI-klubu
        updatedPlayersMap['FREE_AGENTS'] = (updatedPlayersMap['FREE_AGENTS'] || []).filter(p => p.id !== fa.id);

        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const updatedHistory = PlayerCareerService.movePlayer(
          fa,
          { clubName: aiClub.name, clubId: aiClub.id },
          currentYear,
          currentMonth
        );

        const signedPlayer: Player = {
          ...fa,
          clubId: aiClub.id,
          annualSalary: proposedSalary,
          contractEndDate: newEndDate,
          aiNegotiationClubId: undefined,
          aiNegotiationResponseDate: undefined,
          isOnTransferList: false,
          history: updatedHistory,
          transferLockoutUntil: _buildTransferLockoutUntil(currentDate)
        };

        updatedPlayersMap[aiClub.id] = [...(updatedPlayersMap[aiClub.id] || []), signedPlayer];

        updatedClubs = updatedClubs.map(c =>
          c.id === aiClub.id ? { ...c, budget: c.budget - proposedBonus } : c
        );
      } else {
        // Odrzucenie — blokada 90 dni
        const lockout = new Date(currentDate);
        lockout.setDate(lockout.getDate() + 90);
        updatedPlayersMap['FREE_AGENTS'] = (updatedPlayersMap['FREE_AGENTS'] || []).map(p =>
          p.id === fa.id
            ? {
                ...p,
                aiNegotiationClubId: undefined,
                aiNegotiationResponseDate: undefined,
                freeAgentLockoutUntil: null,
                freeAgentClubLockouts: FreeAgentNegotiationService.buildClubLockouts(
                  p.freeAgentClubLockouts,
                  aiClub.id,
                  lockout.toISOString()
                )
              }
            : p
        );
      }
    }

    return { updatedClubs, updatedPlayers: updatedPlayersMap };
  },

  /**
   * Przygotowanie finansowania zakupów.
   * Dla klubów z potrzebami kadrowymi ale zbyt niskim budżetem — listuje na sprzedaż
   * najbardziej zbędnego zawodnika, aby wygospodarować środki na wzmocnienie.
   * Wywoływana codziennie (stagger co 7 dni per klub).
   */
  processAiSquadFinancing: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]> } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };

    const hashClubFin = (id: string): number => {
      let h = 0;
      for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
      return Math.abs(h);
    };

    const dayOfYear = Math.floor(
      (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86_400_000
    );

    for (const club of updatedClubs) {
      if (club.id === userTeamId) continue;
      const finStagger = _isTransferWindowOpen(currentDate) ? 5 : 14;
      if ((dayOfYear + hashClubFin(club.id)) % finStagger !== 0) continue;

      const squad = updatedPlayersMap[club.id] || [];
      const positions: PlayerPosition[] = [
        PlayerPosition.GK,
        PlayerPosition.DEF,
        PlayerPosition.MID,
        PlayerPosition.FWD
      ];
      const minCounts: Record<string, number> = { GK: 2, DEF: 5, MID: 4, FWD: 3 };
      const idealOvr = 30 + club.reputation * 4.5;

      const hasNeeds = positions.some(pos => {
        const posSquad = squad.filter(p => p.position === pos);
        if (posSquad.length < minCounts[pos]) return true;
        const weakest = [...posSquad].sort((a, b) => a.overallRating - b.overallRating)[0];
        return weakest && weakest.overallRating < idealOvr - 1;
      });

      if (!hasNeeds) continue;

      // Szacowany minimalny koszt wzmocnienia dla tego poziomu reputacji
      const estimatedMinCost = FinanceLogic.getFairMarketSalary(idealOvr - 8) * 6;
      if (club.budget >= estimatedMinCost * 0.5) continue;

      // Szukaj najbardziej zbędnego zawodnika: pozycja z nadmiarem, najniższy stosunek OVR do pensji
      const expendable = squad
        .filter(p =>
          !p.isUntouchable &&
          !p.isOnTransferList &&
          !p.transferPendingClubId &&
          squad.filter(s => s.position === p.position).length > minCounts[p.position]
        )
        .sort((a, b) => {
          const scoreA = a.overallRating - (a.annualSalary / 100_000);
          const scoreB = b.overallRating - (b.annualSalary / 100_000);
          return scoreA - scoreB;
        })[0];

      if (!expendable) continue;

      updatedPlayersMap[club.id] = (updatedPlayersMap[club.id] || []).map(p =>
        p.id === expendable.id ? { ...p, isOnTransferList: true } : p
      );
    }

    return { updatedClubs, updatedPlayers: updatedPlayersMap };
  },

  /**
   * Szuka okazji transferowych na liście transferowej dla każdego AI-klubu.
   * Wywoływana codziennie — wewnętrzny stagger (hash klubu % 4) sprawia, że
   * każdy klub sprawdza rynek co ~4 dni w inny dzień cyklu.
   *
   * Logika:
   *   - Dynamiczna diagnoza potrzeb kadrowych
   *   - Normalny zakres OVR: [idealOvr-8, idealOvr+10]
   *   - Bargain hunting: [idealOvr+10, idealOvr+20] tylko gdy cena ≤ 35% budżetu
   *   - Pełna symulacja: getNegotiationStance → evaluateSellerDecision → evaluateMove
   *   - Jeśli obie strony akceptują → tag TRSF (transferPendingClubId + transferReportDate +3 dni)
   */
  processAiTransferListSignings: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]>, logEntries: AiTransferLogEntry[] } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const logEntries: AiTransferLogEntry[] = [];

    // Poza oknem: negocjacje dozwolone, ale rzadsze — zawodnik przejdzie w kolejnym oknie
    const windowOpen = _isTransferWindowOpen(currentDate);

    const hashClub = (id: string): number => {
      let h = 0;
      for (let i = 0; i < id.length; i++) {
        h = ((h << 5) - h + id.charCodeAt(i)) | 0;
      }
      return Math.abs(h);
    };

    const dayOfYear = Math.floor(
      (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86_400_000
    );

    // Zbuduj płaską listę zawodników z listy transferowej (bez wolnych agentów i drużyny gracza)
    const transferListed: Player[] = Object.entries(updatedPlayersMap)
      .filter(([clubId]) => clubId !== 'FREE_AGENTS' && clubId !== userTeamId)
      .flatMap(([, squad]) => squad)
      .filter(p =>
        p.isOnTransferList &&
        !p.transferPendingClubId &&
        p.clubId !== userTeamId
      );

    if (transferListed.length === 0) return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };

    // Mutable kopia listy by usuwać zajętych kandydatów w trakcie pętli
    const available = [...transferListed];

    const sellerClubMap = new Map(updatedClubs.map(c => [c.id, c]));

    for (const club of clubs) {
      if (club.id === userTeamId) continue;

      // Stagger: w oknie co 2 dni (pilność), poza oknem co 12 dni (przyszłe okno)
      const stagger = windowOpen ? 2 : 12;
      if ((dayOfYear + hashClub(club.id)) % stagger !== 0) continue;

      // Strategia rekrutacyjna: deterministyczna per klub, różna dla każdego agenta
      // 0=bargain hunter, 1=youth investor, 2=star chaser, 3=pragmatist
      const clubStrategy = hashClub(club.id) % 4;

      const squad = updatedPlayersMap[club.id] || [];
      if (squad.length >= 32) continue;
      if (club.budget <= 250_000) continue;

      const minCounts: Record<string, number> = { GK: 2, DEF: 5, MID: 4, FWD: 3 };
      const idealOvr = 30 + club.reputation * 4.5;
      const needsTL = _assessClubNeeds(club, squad, currentDate);
      if (needsTL.length === 0) continue;
      const needsTLMap = new Map(needsTL.map(n => [n.position as string, n]));

      // Oceń kandydatów
      const candidates = available.filter(p => {
        if (p.clubId === club.id) return false;
        if (_hasActiveTransferLockout(p, currentDate)) return false;
        if (_hasActiveTransferOfferBan(p, currentDate)) return false;
        const needTL = needsTLMap.get(p.position);
        if (!needTL) return false;

        // OVR range zależy od pilności: CRITICAL szuka szerzej (desperacja), LOW tylko wąski upgrade
        // ovrCap: idealOvr powyżej 95 jest nieosiągalne — klampujemy by top kluby w ogóle widziały kandydatów
        const ovrCap = Math.min(idealOvr, 95);
        const ovrLow = needTL.urgency === 'CRITICAL' ? ovrCap - 14 :
                       needTL.urgency === 'HIGH'     ? ovrCap - 11 :
                       needTL.urgency === 'LOW'      ? ovrCap - 4  : ovrCap - 8;
        const ovrHigh = needTL.urgency === 'LOW' ? ovrCap + 5 : ovrCap + 10;
        const normalRange = p.overallRating >= ovrLow && p.overallRating <= ovrHigh;
        const bargainRange = p.overallRating > ovrHigh && p.overallRating <= ovrCap + 20;
        if (!normalRange && !bargainRange) return false;

        // Kandydat musi być lepszy od obecnego najsłabszego na tej pozycji (upgrade check)
        const posSquad = (updatedPlayersMap[club.id] || []).filter(sq => sq.position === p.position);
        const weakestExisting = [...posSquad].sort((a, b) => a.overallRating - b.overallRating)[0];
        if (posSquad.length >= minCounts[p.position] && weakestExisting && p.overallRating <= weakestExisting.overallRating) return false;

        const sellerClub = sellerClubMap.get(p.clubId || '');
        if (!sellerClub) return false;
        const marketOpportunity = _getTransferListOpportunity(p, club, sellerClub);

        const sellerSquad = updatedPlayersMap[p.clubId || ''] || [];
        const askingPrice = TransferSellerLogicService.estimateAskingPrice(p, sellerClub, sellerSquad, currentDate);
        const proposedSalary = FinanceLogic.getFairMarketSalary(p.overallRating);

        const budgetCapNormal = Math.min(0.78, (clubStrategy === 2 ? 0.65 : 0.50) + marketOpportunity.budgetBoost);
        const budgetCapBargain = Math.min(0.60, (clubStrategy === 2 ? 0.45 : 0.35) + marketOpportunity.budgetBoost);
        if (bargainRange && askingPrice > club.budget * budgetCapBargain) return false;
        if (normalRange && askingPrice > club.budget * budgetCapNormal) return false;
        if (clubStrategy === 1 && p.age > 26) return false;
        if (club.budget < askingPrice + proposedSalary * 0.5) return false;

        return true;
      });

      if (candidates.length === 0) continue;

      // Wybierz kandydata wg strategii agenta rekrutacyjnego
      let sortedCandidates = [...candidates];
      if (clubStrategy === 1) {
        // Youth investor: najmłodszy, potem najwyższy OVR
        sortedCandidates.sort((a, b) => {
          const aSeller = sellerClubMap.get(a.clubId || '');
          const bSeller = sellerClubMap.get(b.clubId || '');
          const aBonus = aSeller ? _getTransferListOpportunity(a, club, aSeller).scoreBonus : 0;
          const bBonus = bSeller ? _getTransferListOpportunity(b, club, bSeller).scoreBonus : 0;
          return a.age - b.age || (b.overallRating + bBonus) - (a.overallRating + aBonus);
        });
      } else if (clubStrategy === 0) {
        // Bargain hunter: lista transferowa i wygasające kontrakty najpierw, potem tańszy OVR
        sortedCandidates.sort((a, b) => {
          const aSeller = sellerClubMap.get(a.clubId || '');
          const bSeller = sellerClubMap.get(b.clubId || '');
          const aVal = (a.isOnTransferList ? 20 : 0)
            + (new Date(a.contractEndDate).getTime() - currentDate.getTime() < 365 * 86_400_000 ? 10 : 0)
            + (aSeller ? _getTransferListOpportunity(a, club, aSeller).scoreBonus : 0);
          const bVal = (b.isOnTransferList ? 20 : 0)
            + (new Date(b.contractEndDate).getTime() - currentDate.getTime() < 365 * 86_400_000 ? 10 : 0)
            + (bSeller ? _getTransferListOpportunity(b, club, bSeller).scoreBonus : 0);
          return bVal - aVal || a.overallRating - b.overallRating;
        });
      } else {
        // Star chaser / pragmatist: najwyższy OVR
        sortedCandidates.sort((a, b) => {
          const aSeller = sellerClubMap.get(a.clubId || '');
          const bSeller = sellerClubMap.get(b.clubId || '');
          const aBonus = aSeller ? _getTransferListOpportunity(a, club, aSeller).scoreBonus : 0;
          const bBonus = bSeller ? _getTransferListOpportunity(b, club, bSeller).scoreBonus : 0;
          return (b.overallRating + bBonus) - (a.overallRating + aBonus);
        });
      }
      const best = sortedCandidates[0];
      const sellerClub = sellerClubMap.get(best.clubId || '');
      if (!sellerClub) continue;

      const sellerSquad = updatedPlayersMap[best.clubId || ''] || [];
      const askingPrice = TransferSellerLogicService.estimateAskingPrice(best, sellerClub, sellerSquad, currentDate);

      // Sprawdź czy sprzedający dopuszcza rozmowy.
      // Poza oknem negocjujemy z timingiem IN_SIX_MONTHS — daje realistyczną premię cenową
      // i poprawnie klasyfikuje ochronę przed sprzedażą do rywala (blocksShortDelaySale).
      const transferTiming = windowOpen ? TransferTiming.IMMEDIATE : TransferTiming.IN_SIX_MONTHS;
      const stance = TransferSellerLogicService.getNegotiationStance(
        best, sellerClub, club, sellerSquad, currentDate, transferTiming
      );
      if (!stance.allowTalks) continue;

      // AI płaci pełną cenę wywoławczą
      const bidInput: TransferClubBidInput = { fee: stance.askingPrice, timing: transferTiming };
      const sellerDecision = TransferSellerLogicService.evaluateSellerDecision(
        bidInput, best, sellerClub, club, sellerSquad, currentDate
      );
      if (sellerDecision.verdict !== 'ACCEPT') continue;

      // Sprawdź czy zawodnik chce przejść
      // Bonus zależy od kierunku ruchu reputacyjnego: ruch w dół wymaga wyższego bonusu by zawodnik zaakceptował
      const repDeltaTL = club.reputation - sellerClub.reputation;
      const salaryMultAI_TL = repDeltaTL <= -2 ? 1.40 : repDeltaTL === -1 ? 1.25 : 1.12;
      const proposedSalary = Math.max(FinanceLogic.getFairMarketSalary(best.overallRating), Math.round(best.annualSalary * salaryMultAI_TL));
      const ageBonusMult_TL = best.age < 24 ? 0.40 : best.age <= 29 ? 0.65 : best.age <= 33 ? 1.00 : 1.30;
      const repBonusPremium_TL = repDeltaTL < 0 ? 0.40 : repDeltaTL === 0 ? 0.10 : 0;
      const negRandTL = 0.75 + Math.random() * 0.50;
      const proposedBonus = Math.floor(best.annualSalary * (ageBonusMult_TL + repBonusPremium_TL) * negRandTL);
      const contractYears = best.age <= 27 ? 4 : best.age <= 30 ? 3 : best.age <= 34 ? 2 : 1;
      const contractInput: TransferContractInput = { salary: proposedSalary, bonus: proposedBonus, years: contractYears };

      const playerDecision = TransferPlayerDecisionService.evaluateMove(
        contractInput, best, sellerClub, club, sellerSquad, squad, currentDate
      );
      if (!playerDecision.accepted) {
        logEntries.push({
          id: `TL_REJ_${best.id}_${club.id}_${currentDate.getTime()}`,
          date: currentDate.toISOString(),
          playerName: `${best.lastName} ${best.firstName}`,
          playerOvr: best.overallRating,
          playerPosition: best.position,
          fromClub: sellerClub.name,
          toClub: club.name,
          status: 'PLAYER_REJECTED',
          reason: playerDecision.reason,
          fee: askingPrice,
        });
        continue;
      }

      // Obie strony OK → tag TRSF + data meldunku
      // W oknie: za 3 dni. Poza oknem: start kolejnego okna transferowego.
      const reportDate = windowOpen
        ? new Date(currentDate.getTime() + 3 * 86_400_000)
        : _getNextWindowStart(currentDate);

      const sellerClubId = best.clubId || '';
      updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).map(p =>
        p.id === best.id
          ? { ...p, transferPendingClubId: club.id, transferReportDate: reportDate.toISOString() }
          : p
      );

      logEntries.push({
        id: `TL_OFFER_${best.id}_${club.id}_${currentDate.getTime()}`,
        date: currentDate.toISOString(),
        playerName: `${best.lastName} ${best.firstName}`,
        playerOvr: best.overallRating,
        playerPosition: best.position,
        fromClub: sellerClub.name,
        toClub: club.name,
        status: 'OFFER_MADE',
        fee: askingPrice,
      });

      // Usuń zawodnika z dostępnej listy by inne kluby go nie wybrały w tej samej iteracji
      const idx = available.findIndex(p => p.id === best.id);
      if (idx !== -1) available.splice(idx, 1);

      // Opłata transferowa płatna natychmiast przy podpisaniu umowy
      updatedClubs = updatedClubs.map(c => {
        if (c.id === club.id) return { ...c, budget: c.budget - askingPrice };
        if (c.id === sellerClubId) return { ...c, budget: c.budget + askingPrice };
        return c;
      });
    }

    return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };
  },

  /**
   * Realizuje zainteresowania transferowe AI — kluby próbują pozyskać zawodników
   * z interestedClubs którzy NIE są na liście transferowej.
   * Uzupełnia processAiTransferListSignings który obsługuje tylko isOnTransferList.
   * Wywoływana codziennie (stagger co 6 dni per klub).
   */
  processAiInterestedPlayerTargeting: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]>, logEntries: AiTransferLogEntry[] } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const logEntries: AiTransferLogEntry[] = [];

    // Poza oknem: podejścia dozwolone, ale rzadsze — transfer nastąpi w kolejnym oknie
    const windowOpen = _isTransferWindowOpen(currentDate);

    const hashClubInt = (id: string): number => {
      let h = 0;
      for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
      return Math.abs(h);
    };

    const dayOfYear = Math.floor(
      (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86_400_000
    );

    const sellerClubMap = new Map(updatedClubs.map(c => [c.id, c]));

    for (const club of clubs) {
      if (club.id === userTeamId) continue;
      // Stagger: w oknie co 3 dni, poza oknem co 15 dni
      const staggerInt = windowOpen ? 3 : 15;
      if ((dayOfYear + hashClubInt(club.id)) % staggerInt !== 0) continue;
      if (club.budget <= 500_000) continue;

      const squad = updatedPlayersMap[club.id] || [];
      if (squad.length >= 32) continue;

      // Jeden aktywny zakup na raz
      const alreadyBuying = Object.values(updatedPlayersMap)
        .flat()
        .some(p => p.transferPendingClubId === club.id);
      if (alreadyBuying) continue;

      const idealOvr = 30 + club.reputation * 4.5;
      const needsIT = _assessClubNeeds(club, squad, currentDate);
      if (needsIT.length === 0) continue;
      const needsITMap = new Map(needsIT.map(n => [n.position as string, n]));

      // Kandydaci: gracze z interestedClubs zawierającym ten klub, niewystawieni na listę
      const targets = Object.entries(updatedPlayersMap)
        .filter(([cId]) => cId !== 'FREE_AGENTS' && cId !== club.id && cId !== userTeamId)
        .flatMap(([, sq]) => sq)
        .filter(p =>
          (p.interestedClubs || []).includes(club.id) &&
          !_hasActiveTransferLockout(p, currentDate) &&
          !_hasActiveTransferOfferBan(p, currentDate) &&
          !p.isOnTransferList &&
          !p.transferPendingClubId &&
          needsITMap.has(p.position) &&
          p.overallRating >= (needsITMap.get(p.position)!.urgency === 'CRITICAL' ? Math.min(idealOvr, 95) - 14 : Math.min(idealOvr, 95) - 8) &&
          p.overallRating <= Math.min(idealOvr, 95) + 12
        );

      if (targets.length === 0) continue;

      const target = [...targets].sort((a, b) => b.overallRating - a.overallRating)[0];
      const sellerClub = sellerClubMap.get(target.clubId || '');
      if (!sellerClub) continue;

      const sellerSquad = updatedPlayersMap[target.clubId || ''] || [];
      const askingPrice = TransferSellerLogicService.estimateAskingPrice(target, sellerClub, sellerSquad, currentDate);
      const proposedSalary = FinanceLogic.getFairMarketSalary(target.overallRating);

      if (club.budget < askingPrice + proposedSalary * 0.5) continue;
      // Bogatsze kluby mogą przeznaczyć większy % budżetu na jeden transfer: rep=10→60%, rep=15→67.5%, rep=20→70%
      const budgetCapIT = Math.min(0.70, 0.45 + club.reputation * 0.015);
      if (askingPrice > club.budget * budgetCapIT) continue;

      // Poza oknem: timing IN_SIX_MONTHS — poprawna premia cenowa i klasyfikacja ochrony rywala.
      const transferTimingInt = windowOpen ? TransferTiming.IMMEDIATE : TransferTiming.IN_SIX_MONTHS;
      const stance = TransferSellerLogicService.getNegotiationStance(
        target, sellerClub, club, sellerSquad, currentDate, transferTimingInt
      );
      if (!stance.allowTalks) continue;

      const bidInput: TransferClubBidInput = { fee: stance.askingPrice, timing: transferTimingInt };
      const sellerDecision = TransferSellerLogicService.evaluateSellerDecision(
        bidInput, target, sellerClub, club, sellerSquad, currentDate
      );
      if (sellerDecision.verdict !== 'ACCEPT') continue;

      // Bonus zależy od kierunku ruchu reputacyjnego: ruch w dół wymaga wyższego bonusu by zawodnik zaakceptował
      const repDeltaIT = club.reputation - sellerClub.reputation;
      const salaryMultAI_IT = repDeltaIT <= -2 ? 1.40 : repDeltaIT === -1 ? 1.25 : 1.12;
      const proposedSalaryIT = Math.max(FinanceLogic.getFairMarketSalary(target.overallRating), Math.round(target.annualSalary * salaryMultAI_IT));
      const ageBonusMult_IT = target.age < 24 ? 0.40 : target.age <= 29 ? 0.65 : target.age <= 33 ? 1.00 : 1.30;
      const repBonusPremium_IT = repDeltaIT < 0 ? 0.40 : repDeltaIT === 0 ? 0.10 : 0;
      const negRandIT = 0.75 + Math.random() * 0.50;
      const proposedBonus = Math.floor(target.annualSalary * (ageBonusMult_IT + repBonusPremium_IT) * negRandIT);
      const contractYears = target.age <= 27 ? 4 : target.age <= 30 ? 3 : target.age <= 34 ? 2 : 1;
      const contractInput: TransferContractInput = { salary: proposedSalaryIT, bonus: proposedBonus, years: contractYears };

      const playerDecision = TransferPlayerDecisionService.evaluateMove(
        contractInput, target, sellerClub, club, sellerSquad, squad, currentDate
      );
      if (!playerDecision.accepted) {
        logEntries.push({
          id: `IT_REJ_${target.id}_${club.id}_${currentDate.getTime()}`,
          date: currentDate.toISOString(),
          playerName: `${target.lastName} ${target.firstName}`,
          playerOvr: target.overallRating,
          playerPosition: target.position,
          fromClub: sellerClub.name,
          toClub: club.name,
          status: 'PLAYER_REJECTED',
          reason: playerDecision.reason,
          fee: askingPrice,
        });
        continue;
      }

      // W oknie: za 3 dni. Poza oknem: start kolejnego okna transferowego.
      const reportDate = windowOpen
        ? new Date(currentDate.getTime() + 3 * 86_400_000)
        : _getNextWindowStart(currentDate);

      const sellerClubId = target.clubId || '';
      updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).map(p =>
        p.id === target.id
          ? { ...p, transferPendingClubId: club.id, transferReportDate: reportDate.toISOString() }
          : p
      );

      logEntries.push({
        id: `IT_OFFER_${target.id}_${club.id}_${currentDate.getTime()}`,
        date: currentDate.toISOString(),
        playerName: `${target.lastName} ${target.firstName}`,
        playerOvr: target.overallRating,
        playerPosition: target.position,
        fromClub: sellerClub.name,
        toClub: club.name,
        status: 'OFFER_MADE',
        fee: askingPrice,
      });

      // Opłata transferowa płatna natychmiast przy podpisaniu umowy
      updatedClubs = updatedClubs.map(c => {
        if (c.id === club.id) return { ...c, budget: c.budget - askingPrice };
        if (c.id === sellerClubId) return { ...c, budget: c.budget + askingPrice };
        return c;
      });
    }

    return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };
  },

  /**
   * Wykonuje oczekujące transfery AI (tag TRSF) gdy transferReportDate <= dziś.
   * Wywoływana codziennie.
   *
   * Przy wykonaniu:
   *   - Ponowna weryfikacja budżetu kupującego (mógł zmaleć w międzyczasie)
   *   - Przenosi zawodnika ze składu sprzedającego do kupującego
   *   - Rozlicza opłatę transferową między klubami
   *   - Czyści tagi TRSF
   */
  resolveAiTransferPending: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]>, logEntries: AiTransferLogEntry[] } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const logEntries: AiTransferLogEntry[] = [];
    const today = currentDate.getTime();

    // Okno transferowe zamknięte — zawodnicy z tagiem TRSF czekają, nie są przenoszeni
    if (!_isTransferWindowOpen(currentDate)) {
      return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };
    }

    for (const sellerClubId of Object.keys(updatedPlayersMap)) {
      if (sellerClubId === 'FREE_AGENTS') continue;

      const squad = updatedPlayersMap[sellerClubId] || [];
      const due = squad.filter(p =>
        p.transferPendingClubId &&
        p.transferReportDate &&
        new Date(p.transferReportDate).getTime() <= today
      );

      for (const player of due) {
        const buyerClubId = player.transferPendingClubId!;
        const buyerClub = updatedClubs.find(c => c.id === buyerClubId);
        const sellerClub = updatedClubs.find(c => c.id === sellerClubId);

        if (!buyerClub || !sellerClub) {
          updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).map(p =>
            p.id === player.id ? { ...p, transferPendingClubId: undefined, transferReportDate: undefined } : p
          );
          continue;
        }

        // Spójna z logiką negocjacji: bonus zależy od kierunku ruchu reputacyjnego
        const repDeltaRes = buyerClub.reputation - sellerClub.reputation;
        const salaryMultAI_Res = repDeltaRes <= -2 ? 1.40 : repDeltaRes === -1 ? 1.25 : 1.12;
        const proposedSalary = Math.max(FinanceLogic.getFairMarketSalary(player.overallRating), Math.round(player.annualSalary * salaryMultAI_Res));
        const ageBonusMult_Res = player.age < 24 ? 0.40 : player.age <= 29 ? 0.65 : player.age <= 33 ? 1.00 : 1.30;
        const repBonusPremium_Res = repDeltaRes < 0 ? 0.40 : repDeltaRes === 0 ? 0.10 : 0;
        const proposedBonus = Math.floor(player.annualSalary * (ageBonusMult_Res + repBonusPremium_Res));

        // Opłata transferowa została już pobrana przy podpisaniu umowy (processAiTransferListSignings / processAiInterestedPlayerTargeting)
        // Weryfikacja: czy kupujący ma środki na bonus dla zawodnika przy meldunku
        if (buyerClub.budget < proposedBonus) {
          // Zwrot opłaty transferowej — kupujący zapłacił przy negocjacji, ale transfer odpada.
          // Bez zwrotu klub traci pieniądze i nie dostaje zawodnika.
          const refundFee = TransferSellerLogicService.estimateAskingPrice(player, sellerClub, updatedPlayersMap[sellerClubId] || [], currentDate);
          updatedClubs = updatedClubs.map(c => {
            if (c.id === buyerClubId) return { ...c, budget: c.budget + refundFee };
            if (c.id === sellerClubId) return { ...c, budget: c.budget - refundFee };
            return c;
          });
          updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).map(p =>
            p.id === player.id ? { ...p, transferPendingClubId: undefined, transferReportDate: undefined } : p
          );
          logEntries.push({
            id: `RES_NOBUDGET_${player.id}_${buyerClubId}_${currentDate.getTime()}`,
            date: currentDate.toISOString(),
            playerName: `${player.lastName} ${player.firstName}`,
            playerOvr: player.overallRating,
            playerPosition: player.position,
            fromClub: sellerClub.name,
            toClub: buyerClub.name,
            status: 'CANCELLED_NO_BUDGET',
            reason: `Kupujący nie miał środków na bonus przy meldunku (potrzeba: ${proposedBonus.toLocaleString('pl-PL')} PLN)`,
            fee: refundFee,
          });
          continue;
        }

        const contractYears = player.age <= 27 ? 4 : player.age <= 30 ? 3 : player.age <= 34 ? 2 : 1;
        const newEndDate = new Date(currentDate.getFullYear() + contractYears, 5, 30).toISOString();

        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const updatedHistory = PlayerCareerService.movePlayer(
          player,
          { clubName: buyerClub.name, clubId: buyerClubId },
          currentYear,
          currentMonth
        );

        const transferredPlayer: Player = {
          ...player,
          clubId: buyerClubId,
          annualSalary: proposedSalary,
          contractEndDate: newEndDate,
          transferPendingClubId: undefined,
          transferReportDate: undefined,
          isOnTransferList: false,
          interestedClubs: (player.interestedClubs || []).filter(clubId => clubId !== buyerClubId),
          history: updatedHistory,
          transferLockoutUntil: _buildTransferLockoutUntil(currentDate),
          transferOfferBanUntil: _buildTransferOfferBanUntil(currentDate)
        };

        // Przenieś zawodnika
        updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).filter(p => p.id !== player.id);
        updatedPlayersMap[buyerClubId] = [...(updatedPlayersMap[buyerClubId] || []), transferredPlayer];

        logEntries.push({
          id: `RES_SIGNED_${player.id}_${buyerClubId}_${currentDate.getTime()}`,
          date: currentDate.toISOString(),
          playerName: `${player.lastName} ${player.firstName}`,
          playerOvr: player.overallRating,
          playerPosition: player.position,
          fromClub: sellerClub.name,
          toClub: buyerClub.name,
          status: 'TRANSFER_SIGNED',
        });

        // Tylko bonus dla zawodnika przy meldunku — opłata transferowa zapłacona już przy podpisaniu
        updatedClubs = updatedClubs.map(c => {
          if (c.id === buyerClubId) return { ...c, budget: c.budget - proposedBonus };
          return c;
        });
      }
    }

    return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };
  },

/**
   * Miesięczny przegląd wydajności zawodników AI-klubów.
   * Wywoływany 1. dnia każdego miesiąca.
   *
   * Zawodnik trafia na listę transferową jeśli spełni JEDNO z kryteriów:
   *   A) Wydajnościowe — słabe statystyki sezonowe (min. 6 meczów):
   *      - FWD: goals/gp < 0.08
   *      - MID: (goals+assists)/gp < 0.07
   *      - DEF/GK: średnia ratingHistory (ostatnie 5) < 5.5
   *   B) Brak gry — mniej niż 35% oczekiwanych meczów i nie kontuzjowany
   *
   * Zabezpieczenia (anty-chaos):
   *   - isUntouchable → nigdy nie wystawiony
   *   - Minimalna głębokość składu: GK≥2, DEF≥4, MID≥4, FWD≥2
   *   - Losowość 30–50% per zawodnik per miesiąc (seed deterministyczny)
   *   - Max 2 zawodników wystawionych per klub per miesiąc
   */
  processMonthlyPlayerReview: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedPlayers: Record<string, Player[]> } => {
    const updatedPlayersMap = { ...playersMap };

    // Miesiące od startu sezonu (sezon startuje lipiec = miesiąc 6)
    const currentMonth = currentDate.getMonth();
    const monthsIntoSeason = currentMonth >= 6
      ? currentMonth - 6
      : currentMonth + 6; // styczeń–czerwiec = 6–11 miesięcy

    // Za mało danych — nie oceniamy przez pierwsze 2 miesiące sezonu
    if (monthsIntoSeason < 2) return { updatedPlayers: updatedPlayersMap };

    // Oczekiwana liczba meczów ligowych na ten moment sezonu (~2 mecze/miesiąc)
    const expectedMatches = monthsIntoSeason * 2;

    for (const club of clubs) {
      if (club.id === userTeamId) continue;
      const squad = updatedPlayersMap[club.id];
      if (!squad || squad.length === 0) continue;

      // Liczniki głębokości składu (ochrona minimalna)
      const counts = {
        GK:  squad.filter(p => p.position === 'GK').length,
        DEF: squad.filter(p => p.position === 'DEF').length,
        MID: squad.filter(p => p.position === 'MID').length,
        FWD: squad.filter(p => p.position === 'FWD').length,
      };
      const minCounts = { GK: 2, DEF: 4, MID: 4, FWD: 2 };

      let listedThisMonth = 0;
      const updatedSquad = squad.map(player => {
        // Nie listujemy więcej niż 2 w miesiącu
        if (listedThisMonth >= 2) return player;

        // Pomijamy zawodników już na liście, nietykalnych lub z uzgodnionym transferem
        if (player.isOnTransferList || player.isUntouchable || !!player.transferPendingClubId) return player;

        // Minimalna głębokość — jeśli wystawienie zejdzie poniżej minimum, pomijamy
        const posKey = player.position as keyof typeof counts;
        if (counts[posKey] <= minCounts[posKey]) return player;

        const gp = player.stats.matchesPlayed;

        // Kryterium B: brak gry (nie licząc kontuzjowanych)
        const playRatio = gp / Math.max(1, expectedMatches);
        const isRarelyPlaying = playRatio < 0.35 && player.health.status !== 'INJURED';

        // Kryterium A: słaba wydajność (min. 6 meczów)
        let isPoorPerformer = false;
        if (gp >= 6) {
          if (player.position === 'FWD') {
            isPoorPerformer = (player.stats.goals / gp) < 0.08;
          } else if (player.position === 'MID') {
            isPoorPerformer = ((player.stats.goals + player.stats.assists) / gp) < 0.07;
          } else {
            // DEF / GK — średnia ratingHistory
            const hist = player.stats.ratingHistory || [];
            if (hist.length >= 5) {
              const avgRating = hist.slice(-5).reduce((s, r) => s + r, 0) / 5;
              isPoorPerformer = avgRating < 5.5;
            }
          }
        }

        if (!isRarelyPlaying && !isPoorPerformer) return player;

        // Losowość 30–50% — nie wszystkie kluby reagują w tym samym miesiącu
        const monthKey = currentDate.getFullYear() * 100 + (currentDate.getMonth() + 1);
        const seed = Math.abs(
          (monthKey * 31337) ^
          player.id.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0) ^
          club.id.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
        );
        const rand = (Math.sin(seed) * 10000);
        const chance = rand - Math.floor(rand);
        const listingChance = 0.30 + (club.reputation / 100) * 0.20; // 30–50%
        if (chance > listingChance) return player;

        // Wystawiamy na listę transferową
        counts[posKey]--;
        listedThisMonth++;
        return { ...player, isOnTransferList: true };
      });

      updatedPlayersMap[club.id] = updatedSquad;
    }

    return { updatedPlayers: updatedPlayersMap };
  },

performSeasonSquadReview: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]> } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };

    updatedClubs = updatedClubs.map(club => {
      if (club.id === userTeamId) return club;

      const squad = updatedPlayersMap[club.id] || [];
      if (squad.length === 0) return club;

      const counts = {
        GK: squad.filter(p => p.position === 'GK').length,
        DEF: squad.filter(p => p.position === 'DEF').length,
        MID: squad.filter(p => p.position === 'MID').length,
        FWD: squad.filter(p => p.position === 'FWD').length
      };

      const rankedSquad = [...squad].sort((a, b) => {
        const scoreA = a.overallRating - (a.age - 18) * 1.5;
        const scoreB = b.overallRating - (b.age - 18) * 1.5;
        return scoreA - scoreB;
      });

      const numToRemove = Math.floor(Math.random() * 5);
      let removedCount = 0;
      let finalSquad = [...squad];
      let currentClub = { ...club };

      for (const candidate of rankedSquad) {
        if (removedCount >= numToRemove) break;

        let canRemove = false;
        if (candidate.position === 'GK' && counts.GK > 3) canRemove = true;
        else if (candidate.position === 'DEF' && counts.DEF > 7) canRemove = true;
        else if (candidate.position === 'MID' && counts.MID > 7) canRemove = true;
        else if (candidate.position === 'FWD' && counts.FWD > 4) canRemove = true;

        if (canRemove) {
          const decision = FinanceLogic.evaluateReleaseVsList(candidate);
          
          if (decision === 'RELEASE') {
            const cost = candidate.annualSalary * 0.4;
            if (currentClub.budget >= cost) {
              const currentYear = currentDate.getFullYear();
              const currentMonth = currentDate.getMonth() + 1;
              const updatedHistory = PlayerCareerService.movePlayer(
                candidate,
                { clubName: 'BEZ KLUBU', clubId: 'FREE_AGENTS' },
                currentYear,
                currentMonth
              );

              const releasedPlayer: Player = {
                ...candidate,
                clubId: 'FREE_AGENTS',
                annualSalary: 0,
                contractEndDate: '',
                marketValue: 0,
                negotiationStep: 0,
                isNegotiationPermanentBlocked: false,
                isOnTransferList: false,
                interestedClubs: [],
                transferPendingClubId: undefined,
                transferReportDate: undefined,
                history: updatedHistory
              };

              currentClub.budget -= cost;
              finalSquad = finalSquad.filter(p => p.id !== candidate.id);
              updatedPlayersMap['FREE_AGENTS'] = [...(updatedPlayersMap['FREE_AGENTS'] || []), releasedPlayer];
            }
          } else {
            finalSquad = finalSquad.map(p => p.id === candidate.id ? { ...p, isOnTransferList: true } : p);
          }
          
          counts[candidate.position as keyof typeof counts]--;
          removedCount++;
        }
      }

      currentClub.squadNeeds = {
        GK: Math.max(0, 3 - counts.GK),
        DEF: Math.max(0, 7 - counts.DEF),
        MID: Math.max(0, 7 - counts.MID),
        FWD: Math.max(0, 4 - counts.FWD)
      };

      updatedPlayersMap[club.id] = finalSquad;
      return currentClub;
    });

    return { updatedClubs, updatedPlayers: updatedPlayersMap };
  },

  /**
   * Przegląd 3 najsłabszych zawodników każdego AI-klubu.
   * Wywoływana 2 lipca (start sezonu) i 12 stycznia (przerwa zimowa).
   *
   * Algorytm:
   *   1. Znajdź 3 najsłabszych (ranking: OVR - (wiek-18)*1.5)
   *   2. Zaproponuj niższy/krótszy kontrakt (75-85% pensji, 1 rok)
   *   3. Jeśli zawodnik odmówi → 50/50: zwolnienie LUB lista transferowa
   *   4. Przy zwolnieniu sprawdź: czy budżet >= 40% pensji i czy skład ma zapas na pozycji
   *   5. Jeśli za drogo lub za mało zawodników na pozycji → lista zamiast zwolnienia
   */
  processWeakPlayerContractCuts: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]> } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };

    const minDepth: Record<string, number> = { GK: 2, DEF: 5, MID: 4, FWD: 3 };

    for (const club of clubs) {
      if (club.id === userTeamId) continue;

      const squad = updatedPlayersMap[club.id] || [];
      if (squad.length < 12) continue;

      const eligible = squad.filter(p =>
        !p.isOnTransferList &&
        !p.transferPendingClubId &&
        !p.isNegotiationPermanentBlocked
      );
      if (eligible.length === 0) continue;

      const ranked = [...eligible].sort((a, b) => {
        const scoreA = a.overallRating - (a.age - 18) * 1.5;
        const scoreB = b.overallRating - (b.age - 18) * 1.5;
        return scoreA - scoreB;
      });

      const weakPlayers = ranked.slice(0, 3);
      let finalSquad = [...squad];
      let currentClubCopy = { ...updatedClubs.find(c => c.id === club.id)! };

      for (const player of weakPlayers) {
        const salaryReduction = 0.15 + Math.random() * 0.10;
        const proposedSalary = Math.max(50_000, Math.floor(player.annualSalary * (1 - salaryReduction)));

        const acceptChance = player.age >= 32 ? 0.40 : player.age >= 29 ? 0.25 : 0.15;
        const accepted = Math.random() < acceptChance;

        if (accepted) {
          const newEndDate = new Date(currentDate);
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);
          newEndDate.setMonth(5);
          newEndDate.setDate(30);
          finalSquad = finalSquad.map(p =>
            p.id === player.id
              ? { ...p, annualSalary: proposedSalary, contractEndDate: newEndDate.toISOString() }
              : p
          );
        } else {
          if (Math.random() < 0.5) {
            const releaseCost = Math.floor(player.annualSalary * 0.4);
            const posCountAfter = finalSquad.filter(p => p.position === player.position && p.id !== player.id).length;
            const canRelease = currentClubCopy.budget >= releaseCost && posCountAfter >= (minDepth[player.position] || 3);

            if (canRelease) {
              const currentYear = currentDate.getFullYear();
              const currentMonth = currentDate.getMonth() + 1;
              const updatedHistory = PlayerCareerService.movePlayer(
                player,
                { clubName: 'BEZ KLUBU', clubId: 'FREE_AGENTS' },
                currentYear,
                currentMonth
              );
              const releasedPlayer: Player = {
                ...player,
                clubId: 'FREE_AGENTS',
                annualSalary: 0,
                contractEndDate: '',
                marketValue: 0,
                negotiationStep: 0,
                isNegotiationPermanentBlocked: false,
                isOnTransferList: false,
                interestedClubs: [],
                transferPendingClubId: undefined,
                transferReportDate: undefined,
                history: updatedHistory
              };
              finalSquad = finalSquad.filter(p => p.id !== player.id);
              updatedPlayersMap['FREE_AGENTS'] = [...(updatedPlayersMap['FREE_AGENTS'] || []), releasedPlayer];
              currentClubCopy.budget -= releaseCost;
            } else {
              finalSquad = finalSquad.map(p =>
                p.id === player.id ? { ...p, isOnTransferList: true } : p
              );
            }
          } else {
            finalSquad = finalSquad.map(p =>
              p.id === player.id ? { ...p, isOnTransferList: true } : p
            );
          }
        }
        updatedPlayersMap[club.id] = finalSquad;
      }

      updatedClubs = updatedClubs.map(c => c.id === club.id ? currentClubCopy : c);
    }

    return { updatedClubs, updatedPlayers: updatedPlayersMap };
  },

  updateClubStars: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    userTeamId: string | null
  ): Record<string, Player[]> => {
    const updatedPlayersMap = { ...playersMap };

    const getStarCount = (reputation: number): number => {
      if (reputation >= 18) return 11;
      if (reputation >= 15) return 7;
      if (reputation >= 12) return 4;
      if (reputation >= 6)  return 3;
      return 2;
    };

    for (const club of clubs) {
      if (club.id === userTeamId) continue;
      const squad = updatedPlayersMap[club.id];
      if (!squad || squad.length === 0) continue;

      const starCount = getStarCount(club.reputation);
      const sorted = [...squad].sort((a, b) => b.overallRating - a.overallRating);
      const starIds = new Set(sorted.slice(0, starCount).map(p => p.id));

      updatedPlayersMap[club.id] = squad.map(p => ({
        ...p,
        isUntouchable: starIds.has(p.id)
      }));
    }

    return updatedPlayersMap;
  }

};
