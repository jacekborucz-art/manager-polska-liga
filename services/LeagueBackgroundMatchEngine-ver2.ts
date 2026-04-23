
import { TacticRepository } from '@/resources/tactics_db';
import { Fixture, Club, Player, Lineup, MatchEventType, InjurySeverity, Referee, WeatherSnapshot, Coach, PlayerAttributes, PlayerPosition } from '../types';
import { GoalAttributionService } from './GoalAttributionService';
import { rollInjuryBySeverity } from './InjuryCatalog';
import { NEUTRAL_PRESSURE_PROFILE, type MatchPressureContext } from './MatchPressureService';

export interface BackgroundMatchResultV2 {
  homeScore: number;
  awayScore: number;
  // TUTAJ WSTAW TEN KOD (Dodano assistId i parametry urazu)
 scorers: { playerId: string; assistId?: string; minute: number; isPenalty: boolean; isMiss?: boolean; varDisallowed?: boolean }[];
  cards: { playerId: string; type: MatchEventType; minute: number }[];
  injuries: { playerId: string; severity: InjurySeverity; minute: number; days: number; type: string }[];
  playedPlayerIds: string[];
  fatigue: Record<string, number>;
  fatigueDebtMap: Record<string, number>;
  ratings: Record<string, number>;
}

export const LeagueBackgroundMatchEngineV2 = {
  simulate: (
    _fixture: Fixture,
    _homeClub: Club,
    _awayClub: Club,
    homePlayers: Player[],
    awayPlayers: Player[],
    homeLineup: Lineup,
    awayLineup: Lineup,
    homeCoach: Coach,
    awayCoach: Coach,
    referee: Referee,
    weather: WeatherSnapshot,
    seed: number,
    pressureContext?: MatchPressureContext
  ): BackgroundMatchResultV2 => {
    
    // Generator liczb pseudolosowych na podstawie ziarna
    const seededRng = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

 // 1. STARCIE TAKTYK (Tactic Battle)
   // 1. TACTIC CLASH MATRIX (Scale 0-7)
    // Mapowanie: Twoja Taktyka vs Taktyka Przeciwnika
    const TACTIC_CLASH_MATRIX: Record<string, Record<string, number>> = {
      '4-4-2': { '4-4-2': 4, '4-3-3': 3, '5-4-1': 2, '4-2-3-1': 4, '3-5-2': 5, '3-4-3': 3, '5-3-2': 3, '4-5-1': 4, '4-4-2-DIAMOND': 6 },
      '4-3-3': { '4-4-2': 5, '4-3-3': 4, '5-4-1': 2, '4-2-3-1': 5, '3-5-2': 4, '3-4-3': 6, '5-3-2': 2, '4-5-1': 3, '4-4-2-DIAMOND': 5 },
      '5-4-1': { '4-4-2': 6, '4-3-3': 7, '5-4-1': 4, '4-2-3-1': 5, '3-5-2': 3, '3-4-3': 6, '5-3-2': 4, '4-5-1': 4, '4-4-2-DIAMOND': 7 },
      '4-2-3-1': { '4-4-2': 4, '4-3-3': 3, '5-4-1': 3, '4-2-3-1': 4, '3-5-2': 6, '3-4-3': 4, '5-3-2': 4, '4-5-1': 5, '4-4-2-DIAMOND': 4 },
      '3-5-2': { '4-4-2': 3, '4-3-3': 4, '5-4-1': 5, '4-2-3-1': 2, '3-5-2': 4, '3-4-3': 5, '5-3-2': 5, '4-5-1': 3, '4-4-2-DIAMOND': 4 }
      // Pozostałe formacje mapowane są domyślnie na 4 (neutralnie)
    };

    const getEffectivenessMult = (score: number) => {
      if (score <= 1) return 0.70; // Drastyczna przewaga przeciwnika
      if (score <= 3) return 0.85; // Odczuwalna trudność
      if (score === 4) return 1.00; // Balans
      if (score <= 6) return 1.15; // Przewaga taktyczna
      return 1.35;                   // Dominacja taktyczna
    };

    let hSubsUsed = 0;
    let aSubsUsed = 0;

      // Im mniej doświadczony sędzia, tym większy chaos meczu
   const experienceFactor = 1 + (50 - (referee.experience || 50)) / 100; // domyślnie 1.0
   const globalChaos = ((seededRng(1) * 0.30) - 0.15) * experienceFactor;
   
    const homeFieldBonus = 1.0015 + ((seededRng as any)(2) * 0.0085);
    const hPressure = pressureContext?.home ?? NEUTRAL_PRESSURE_PROFILE;
    const aPressure = pressureContext?.away ?? NEUTRAL_PRESSURE_PROFILE;
    const rivalryMultiplier = pressureContext?.rivalryMultiplier ?? 1;
    const weatherFinMod = weather.description.toLowerCase().includes('deszcz') ? 0.99 : 1.1;
    const weatherHeatDrain = weather.tempC > 30 ? 1.2 : 1.0;

    // Inicjalizacja kondycji i stanu meczu
    const homeFatigue: Record<string, number> = {};
    const awayFatigue: Record<string, number> = {};
    homePlayers.forEach(p => homeFatigue[p.id] = p.condition);
    awayPlayers.forEach(p => awayFatigue[p.id] = p.condition);


//Kalkulacja formy 
const calculateFormBoost = (form: ('W' | 'R' | 'P')[]): number => {
      if (!form || form.length < 3) return 1.0;
      const lastThree = form.slice(-3);
      const isOnFire = lastThree.every(r => r === 'W');
      return isOnFire ? 1.025 : 1.0;
    };

    const homeFormBoost = calculateFormBoost(_homeClub.stats.form || []);
    const awayFormBoost = calculateFormBoost(_awayClub.stats.form || []);

const allPlayedIds = new Set<string>([
      ...homeLineup.startingXI.filter(id => id !== null),
      ...awayLineup.startingXI.filter(id => id !== null)
    ] as string[]);

    let homeScore = 0;
    let awayScore = 0;
    const scorers: any[] = [];
    const cards: any[] = [];
    const injuries: any[] = [];
    let homeRedImpact = 1.0;
    let awayRedImpact = 1.0;
    const playerYellowCounts = new Map<string, number>();
    const expelledIds = new Set<string>();

    // Funkcja obliczająca sumę atrybutów STARTING XI uwzględniającą kondycję
    const getTeamPower = (players: Player[], lineup: Lineup, fMap: Record<string, number>) => {
      const xi = players.filter(p => lineup.startingXI.includes(p.id));
      const sum = (attr: keyof PlayerAttributes) => xi.reduce((acc, p) => {
        const currentCond = fMap[p.id] || 100;
        return acc + (p.attributes[attr] * (currentCond / 100));
      }, 0);

      return {
        atk: sum('attacking'),
        def: sum('defending'),
        tech: sum('technique'),
        stam: sum('stamina'),
        str: sum('strength'),
        fin: sum('finishing'),
        pace: sum('pace'),
        pass: sum('passing'),
        drib: sum('dribbling'),
        gk: sum('goalkeeping'),
        vis: sum('vision')
      };
    };

    // 2. GŁÓWNA PĘTLA MINUTOWA (Discrete Event Simulation)
    for (let minute = 1; minute <= 95; minute++) {
      
      const hPwr = getTeamPower(homePlayers, homeLineup, homeFatigue);

// 2.0. FILTROWANIE GRACZY LIVE (Stage 1 PRO - Naprawa błędów 1 i 2)
      const hActiveXI = homeLineup.startingXI.filter(id => id !== null) as string[];
      const aActiveXI = awayLineup.startingXI.filter(id => id !== null) as string[];

      const aPwr = getTeamPower(awayPlayers, awayLineup, awayFatigue);

      // 2a. SYMULACJA ZMIAN (Substitutions) - minuty 60 i 75
  // 2a. ZAAWANSOWANA LOGIKA TRENERA AI
      const performSub = (lineup: Lineup, pPool: Player[], fMap: Record<string, number>, side: 'H' | 'A') => {
        const usedCount = side === 'H' ? hSubsUsed : aSubsUsed;
        // Zasada rezerwy: nie wykorzystuj 5. zmiany przed 88. minutą
        if (usedCount >= 5 || (usedCount === 4 && minute < 88)) return;

        const tiredIdx = lineup.startingXI.findIndex(id => id && fMap[id] < 88.5);
        if (tiredIdx !== -1) {
          const roleNeeded = TacticRepository.getById(lineup.tacticId).slots[tiredIdx].role;
          const candidate = lineup.bench.find(id => pPool.find(p => p.id === id)?.position === roleNeeded && !lineup.startingXI.includes(id));
          if (candidate) {
            lineup.startingXI[tiredIdx] = candidate;
            allPlayedIds.add(candidate);
            if (side === 'H') hSubsUsed++; else aSubsUsed++;
          }
        }
      };

      // Zmiany w przerwie (Losowe 1-2)
      if (minute === 45 && seededRng(minute + 99) < 0.37) {
        performSub(homeLineup, homePlayers, homeFatigue, 'H');
        if (seededRng(minute + 101) < 0.5) performSub(homeLineup, homePlayers, homeFatigue, 'H');
      }
      
      // Główne okno zmian (70+)
      if (minute >= 60 && minute % 4 === 0) {
        performSub(homeLineup, homePlayers, homeFatigue, 'H');
        performSub(awayLineup, awayPlayers, awayFatigue, 'A');
      }

      
      
      
      
      // 2b. REALIZM WYNIKÓW (Nasycenie / Satiety) *********************************************************************************
      // Każdy kolejny gol jest trudniejszy do zdobycia (brak hokejowych wyników)
       // 2b. REALIZM WYNIKÓW (Nasycenie / Satiety) *********************************************************************************
      const hSatiety = 1 / (1 + (homeScore * 0.31));
      const aSatiety = 1 / (1 + (awayScore * 0.31));

      // WPŁYW TRENERÓW
      // Doświadczenie + decyzyjność -> kreacja / obrona
      // Motywacja -> atak / wykończenie / kondycja
      const hCoachAtkBonus = (homeCoach.attributes.motivation * 0.15) + (homeCoach.attributes.experience * 0.1);
      const hCoachDefBonus = (homeCoach.attributes.decisionMaking * 0.2);
      const aCoachAtkBonus = (awayCoach.attributes.motivation * 0.15) + (awayCoach.attributes.experience * 0.1);
      const aCoachDefBonus = (awayCoach.attributes.decisionMaking * 0.2);

      let crowdPressureMod = 1.0;
      const isHomeLosing = homeScore < awayScore;
      const lateGamePressure = minute > 60 ? Math.min(1, (minute - 60) / 35) : 0;
      const homeGoalDiff = homeScore - awayScore;
      const awayGoalDiff = awayScore - homeScore;
      const homeIsChasing = homeGoalDiff < 0;
      const awayIsChasing = awayGoalDiff < 0;
      const homeLowMoraleCollapse = homeIsChasing && homeGoalDiff <= -2 ? hPressure.resignationMultiplier : 1;
      const awayLowMoraleCollapse = awayIsChasing && awayGoalDiff <= -2 ? aPressure.resignationMultiplier : 1;
      const hLateChaseMod = homeIsChasing
        ? 1 + lateGamePressure * hPressure.lateChaseMultiplier * Math.min(1.25, Math.abs(homeGoalDiff) * 0.55)
        : 1;
      const aLateChaseMod = awayIsChasing
        ? 1 + lateGamePressure * aPressure.lateChaseMultiplier * Math.min(1.25, Math.abs(awayGoalDiff) * 0.55)
        : 1;
      const hPressureAttackMod = hPressure.intensityMultiplier * hPressure.composureMultiplier * hLateChaseMod * homeLowMoraleCollapse;
      const aPressureAttackMod = aPressure.intensityMultiplier * aPressure.composureMultiplier * aLateChaseMod * awayLowMoraleCollapse;

// Presja narasta liniowo: od 0% w 45 minucie do ~12% w 95 minucie

      if (isHomeLosing && minute > 45) {
    const timeAnxiety = ((minute - 20) / 75) * 0.10;


    // Kibice dużych klubów wywierają o 30% silniejszą presję niż w małych klubach
    const reputationPressure = (_homeClub.reputation / 10) * 0.03;   
    crowdPressureMod = Math.max(0.80, 1.0 - (timeAnxiety + reputationPressure));
}
  

// Sprawdzenie czy w bramce stoi faktyczny bramkarz
      const hHasRealGk = homePlayers.find(p => p.id === homeLineup.startingXI[0])?.position === 'GK';
      const aHasRealGk = awayPlayers.find(p => p.id === awayLineup.startingXI[0])?.position === 'GK';

      let hGkPanic = 1.0;
      let aGkPanic = 1.0;

      let hGoalLambda = ((hPwr.atk * 0.4 + hPwr.fin * 0.6 + hCoachAtkBonus) / (aPwr.def + aPwr.gk + aCoachDefBonus)) * 0.018;
      let aGoalLambda = ((aPwr.atk * 0.4 + aPwr.fin * 0.6 + aCoachAtkBonus) / (hPwr.def + hPwr.gk + hCoachDefBonus)) * 0.018;

      if (!hHasRealGk) aGkPanic = 1.2 + (seededRng(minute + 55) * 0.6); 
      if (!aHasRealGk) hGkPanic = 1.2 + (seededRng(minute + 55) * 0.6);

      // homeFieldBonus teraz tylko dla gospodarza, gość nie dostaje kary (1/bonus)
      // TACTICAL BATTLE CALCULATIONS (Stage 1 Pro)
      // Pobieramy bazę z matrycy (default 4) i dodajemy roll chaosu (0.0 - 1.5)
      const hBaseScore = TACTIC_CLASH_MATRIX[homeLineup.tacticId]?.[awayLineup.tacticId] || 4;
      const aBaseScore = TACTIC_CLASH_MATRIX[awayLineup.tacticId]?.[homeLineup.tacticId] || 4;

      const hMinuteChaos = seededRng(minute + 900) * 1.5;
      const aMinuteChaos = seededRng(minute + 900) * 1.5;

      const hTacticMod = getEffectivenessMult(Math.round(hBaseScore + hMinuteChaos));
      const aTacticMod = getEffectivenessMult(Math.round(aBaseScore + aMinuteChaos));

      // APLIKACJA LAMBDA GENROWANIE SYTUACJI BRAMKOWYCH 
     hGoalLambda *= (1 + globalChaos)  * weatherFinMod * awayRedImpact * hSatiety * homeFieldBonus * hTacticMod * hGkPanic * homeFormBoost * crowdPressureMod * hPressureAttackMod * rivalryMultiplier;
      aGoalLambda *= (1 + globalChaos) * weatherFinMod * homeRedImpact * aSatiety * aTacticMod * aGkPanic * awayFormBoost * aPressureAttackMod * rivalryMultiplier;

      // LOSOWANIE BRAMEK (Bernoulli) ***************************************************************************************
    if (seededRng(minute + 100) < hGoalLambda) {
        const scorer = GoalAttributionService.pickScorer(homePlayers, hActiveXI, false, () => seededRng(minute + 500));
        if (scorer) {
          const assistant = GoalAttributionService.pickAssistant(homePlayers, hActiveXI, scorer.id, false, () => seededRng(minute + 501));
          const isVarDisallowed = seededRng(minute + 502) < 0.04;
          if (!isVarDisallowed) homeScore++;
          scorers.push({ playerId: scorer.id, assistId: assistant?.id, minute, isPenalty: false, varDisallowed: isVarDisallowed });
        }
      }

      if (seededRng(minute + 200) < aGoalLambda) {
        const scorer = GoalAttributionService.pickScorer(awayPlayers, aActiveXI, false, () => seededRng(minute + 600));
        if (scorer) {
          const assistant = GoalAttributionService.pickAssistant(awayPlayers, aActiveXI, scorer.id, false, () => seededRng(minute + 601));
          const isVarDisallowed = seededRng(minute + 602) < 0.04;
          if (!isVarDisallowed) awayScore++;
          scorers.push({ playerId: scorer.id, assistId: assistant?.id, minute, isPenalty: false, varDisallowed: isVarDisallowed });
        }
      }

      // LOSOWANIE KARNYCH (Zależne od surowości sędziego)
            // Im mniej doświadczony sędzia, tym większa szansa na kontrowersyjny karny
      const penaltyExperienceFactor = 1 + (50 - (referee.experience || 50)) / 100;
      const penaltyProb = (referee.strictness / 7000) * penaltyExperienceFactor;
      if (seededRng(minute + 700) < penaltyProb) {
        const side = seededRng(minute + 701) < 0.5 ? 'H' : 'A';
        const isScored = seededRng(minute + 702) < 0.78; // 78% skuteczności karnych
        const kicker = GoalAttributionService.pickScorer(side === 'H' ? homePlayers : awayPlayers, (side === 'H' ? homeLineup : awayLineup).startingXI as string[], false, () => seededRng(minute + 703));
        if (!kicker) break; // brak kandydatów (np. czerwona kartka wyczyściła skład)
        if (isScored) {
          if (side === 'H') homeScore++; else awayScore++;
          scorers.push({ playerId: kicker.id, minute, isPenalty: true });
        } else {
          scorers.push({ playerId: kicker.id, minute, isPenalty: true, isMiss: true });
        }
      }

      // LOSOWANIE KARTEK
            // Im mniej doświadczony sędzia, tym większa szansa na kartkę
      const yellowExperienceFactor = 1 + (50 - (referee.experience || 50)) / 100;
      const yellowBaseProb = (0.001 + (referee.strictness / 7500)) * yellowExperienceFactor;
      const hCardRoll = seededRng(minute + 300);
      const aCardRoll = seededRng(minute + 300);
      const hDesperationCardMod = homeIsChasing ? 1 + lateGamePressure * hPressure.lateChaseMultiplier * 0.75 : 1;
      const aDesperationCardMod = awayIsChasing ? 1 + lateGamePressure * aPressure.lateChaseMultiplier * 0.75 : 1;
      const hCardPressureMod = hPressure.cardMultiplier * hDesperationCardMod * rivalryMultiplier;
      const aCardPressureMod = aPressure.cardMultiplier * aDesperationCardMod * rivalryMultiplier;

      // Gospodarz ma przywilej korzyści (bias)
      const hBias = (referee.advantageTendency / 5000);

    const processCardLogic = (side: 'H' | 'A', activeXI: string[], roll: number, bias: number, sideCardMultiplier: number) => {
        if (roll < (yellowBaseProb * sideCardMultiplier) + bias && activeXI.length > 0) {
          const pId = activeXI[Math.floor(seededRng(minute + 333) * activeXI.length)];
          if (!pId || expelledIds.has(pId)) return;

          const currentYellows = (playerYellowCounts.get(pId) || 0) + 1;
          const isDirectRed = seededRng(minute + 334) < ((referee.strictness / 35000) * sideCardMultiplier);

          if (isDirectRed || currentYellows >= 2) {
            // WYKLUCZENIE
            cards.push({ playerId: pId, type: MatchEventType.RED_CARD, minute });
            expelledIds.add(pId);
            if (side === 'H') {
              homeRedImpact += 0.15;
              homeLineup.startingXI = homeLineup.startingXI.map(id => id === pId ? null : id);
            } else {
              awayRedImpact += 0.15;
              awayLineup.startingXI = awayLineup.startingXI.map(id => id === pId ? null : id);
            }
          } else {
            // ŻÓŁTA KARTKA
            playerYellowCounts.set(pId, currentYellows);
            cards.push({ playerId: pId, type: MatchEventType.YELLOW_CARD, minute });
          }
        }
      };

      processCardLogic('H', hActiveXI, hCardRoll, -hBias, hCardPressureMod);
      processCardLogic('A', aActiveXI, aCardRoll, (hBias / 2), aCardPressureMod);


// 2c. SYMULACJA KONTUZJI (0.4% szansy na minutę na mecz)
       const experienceFactor = 1 + (50 - (referee.experience || 50)) / 100;
      const injuryChance = 0.004 * experienceFactor;
      if (seededRng(minute + 800) < injuryChance) {
        const side = seededRng(minute + 801) < 0.5 ? 'H' : 'A';
        const pPool = side === 'H' ? homePlayers : awayPlayers;
        const lineup = side === 'H' ? homeLineup : awayLineup;
        const pIdx = Math.floor(seededRng(minute + 802) * 11);
        const pId = lineup.startingXI[pIdx];

        if (pId) {
          const durRoll = seededRng(minute + 803);
          const severity = durRoll < 0.84 ? InjurySeverity.LIGHT : InjurySeverity.SEVERE;
          let injuryRollOffset = 808;
          const { days, type } = rollInjuryBySeverity(
            severity,
            () => seededRng(minute + injuryRollOffset++)
          );

          injuries.push({ playerId: pId, severity, minute, days, type });
          
          // Reakcja trenera: jeśli SEVERE, wymuś zmianę i usuń gracza z boiska
          if (severity === InjurySeverity.SEVERE) {
             performSub(lineup, pPool, side === 'H' ? homeFatigue : awayFatigue, side);
             lineup.startingXI[pIdx] = null; 
          }
        }
      }



      // DRENAŻ KONDYCJI (Co minutę)
      const baseDrain = 0.22 * weatherHeatDrain;
      const hPressureDrain = hPressure.fatigueMultiplier * (homeIsChasing ? 1 + lateGamePressure * hPressure.lateChaseMultiplier * 0.50 : 1);
      const aPressureDrain = aPressure.fatigueMultiplier * (awayIsChasing ? 1 + lateGamePressure * aPressure.lateChaseMultiplier * 0.50 : 1);
homeLineup.startingXI.forEach((id, idx) => {
  if (id) {
    const p = homePlayers.find(px => px.id === id);
    let currentDrain = baseDrain * hPressureDrain;
      if (p?.position === 'GK') {
      // Redukcja drenażu o losową wartość 10-30% (mnożnik 0.7 - 0.9)
      const gkReduction = 0.4 + (seededRng(minute + idx + 500) * 0.2);
      currentDrain *= gkReduction;
    }
        homeFatigue[id] = Math.max(0, homeFatigue[id] - currentDrain);
  }
});

    awayLineup.startingXI.forEach((id, idx) => {
        if (id) {
          const p = awayPlayers.find(px => px.id === id);
          const awaySidePressureDrain = aPressureDrain;
          let currentDrain = baseDrain; // Korzystamy z zadeklarowanego wcześniej baseDrain
          currentDrain *= awaySidePressureDrain;
          if (p?.position === 'GK') {
            const gkReduction = 0.7 + (seededRng(minute + idx + 600) * 0.2); // Zmieniony offset dla Gości
            currentDrain *= gkReduction;
          }
          awayFatigue[id] = Math.max(0, awayFatigue[id] - currentDrain);
        }
      });
    }

// 3. OBLICZANIE DŁUGU PRZEMĘCZENIA PO MECZU (Stage 1 PRO)
    const fatigueDebtMap: Record<string, number> = {};
    const calculateDebt = (lineup: Lineup, players: Player[]) => {
      lineup.startingXI.forEach(id => {
        if (!id) return;
        const p = players.find(px => px.id === id);
        if (p) {
          const staminaAttr = p.attributes.stamina || 50;
          const matchDebt = 5 + ((100 - staminaAttr) * 0.15);
          fatigueDebtMap[id] = matchDebt;
        }
      });
    };
    calculateDebt(homeLineup, homePlayers);
    calculateDebt(awayLineup, awayPlayers);

// TUTAJ WSTAW TEN KOD - GENERATOR OCEN (STAGE 1 PRO)
    const ratings: Record<string, number> = {};
    const homeWin = homeScore > awayScore;
    const awayWin = awayScore > homeScore;
    const isDraw = homeScore === awayScore;

    const generateRating = (pId: string, isHome: boolean) => {
      const p = (isHome ? homePlayers : awayPlayers).find(x => x.id === pId);
      if (!p) return;

      const teamWon = isHome ? homeWin : awayWin;
      // TUTAJ WSTAW TEN KOD - Używamy 90 jako stałej zamiast 'minute'
      const r = seededRng(pId.length + 90 + 999); 
      
      // 1. Nota bazowa
      let score = teamWon ? (6.2 + r * 1.5) : (isDraw ? (5.2 + r * 1.5) : (4.0 + r * 1.8));

      // 2. Bonusy za bramki i asysty
      const pGoals = scorers.filter(s => s.playerId === pId).length;
      const pAssists = scorers.filter(s => s.assistId === pId).length;
      score += (pGoals * 1.0) + (pAssists * 0.6);

      // 3. Bonusy/Kary defensywne (GK i DEF)
      const conceded = isHome ? awayScore : homeScore;
      if (p.position === PlayerPosition.GK || p.position === PlayerPosition.DEF) {
        if (conceded === 0) score += 1.2;
        else score -= (conceded * 0.3);
      }

      // 4. Kary za kartki
      const pCards = cards.filter(c => c.playerId === pId);
      pCards.forEach(c => {
        if (c.type === MatchEventType.RED_CARD) score -= 3.0;
        if (c.type === MatchEventType.YELLOW_CARD) score -= 0.5;
      });

      // 5. Finalny limit 1-10
      ratings[pId] = parseFloat(Math.min(10, Math.max(1, score)).toFixed(1));
    };

   const finalHomeXI = homeLineup.startingXI.filter(id => id !== null) as string[];
    const finalAwayXI = awayLineup.startingXI.filter(id => id !== null) as string[];

    finalHomeXI.forEach(id => generateRating(id, true));
    finalAwayXI.forEach(id => generateRating(id, false));

    return {
      homeScore,
      awayScore,
      scorers,
      cards,
      ratings,
   injuries,
     playedPlayerIds: Array.from(allPlayedIds),
      fatigue: { ...homeFatigue, ...awayFatigue },
      fatigueDebtMap
    };
  }
};
