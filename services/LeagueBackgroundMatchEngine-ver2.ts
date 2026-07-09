
import { TacticRepository } from '@/resources/tactics_db';
import { Fixture, Club, Player, Lineup, MatchEventType, InjurySeverity, Referee, WeatherSnapshot, Coach, PlayerAttributes, PlayerPosition } from '../types';
import { GoalAttributionService } from './GoalAttributionService';
import { getAIFocusLambdaBoost } from './MatchPrepFocusService';
import { rollInjuryBySeverity } from './InjuryCatalog';
import { NEUTRAL_PRESSURE_PROFILE, type MatchPressureContext } from './MatchPressureService';
import { CoachPreMatchMoraleService } from './CoachPreMatchMoraleService';
import { TeamFormImpactService } from './TeamFormImpactService';

export interface BackgroundMatchResultV2 {
  homeScore: number;
  awayScore: number;
  // TUTAJ WSTAW TEN KOD (Dodano assistId i parametry urazu)
 scorers: { playerId: string; assistId?: string; minute: number; isPenalty: boolean; isMiss?: boolean; varDisallowed?: boolean }[];
  cards: { playerId: string; type: MatchEventType; minute: number }[];
  injuries: { playerId: string; severity: InjurySeverity; minute: number; days: number; type: string }[];
  substitutions: { playerOutId: string; playerInId: string; minute: number; isHome: boolean }[];
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
    const substitutions: { playerOutId: string; playerInId: string; minute: number; isHome: boolean }[] = [];
    const lightInjuredOnPitch = new Map<string, number>();
    const substitutedInIds = new Set<string>();
    const substitutedOutIds = new Set<string>();

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
    const matchDateStr = _fixture.date instanceof Date ? _fixture.date.toISOString().split('T')[0] : String(_fixture.date);
    const homePrepBoost = getAIFocusLambdaBoost(homeCoach, seed + 999, _homeClub, matchDateStr);
    const awayPrepBoost = getAIFocusLambdaBoost(awayCoach, seed + 1001, _awayClub, matchDateStr);

    const calcMoraleDebuff = (players: Player[], lineup: Lineup): number => {
      let debuff = 1.0;
      lineup.startingXI.forEach(id => {
        const player = players.find(p => p.id === id);
        if (!player) return;
        const morale = (player as any).morale ?? 50;
        if (morale <= 19) debuff *= 0.93;
        else if (morale <= 39) debuff *= 0.955;
      });
      return debuff;
    };
    const hMoraleDebuff = calcMoraleDebuff(homePlayers, homeLineup);
    const aMoraleDebuff = calcMoraleDebuff(awayPlayers, awayLineup);
    const hClubMoraleMult = CoachPreMatchMoraleService.getPreMatchMoraleMultiplier(_homeClub, homeCoach);
    const aClubMoraleMult = CoachPreMatchMoraleService.getPreMatchMoraleMultiplier(_awayClub, awayCoach);

const allPlayedIds = new Set<string>([
      ...homeLineup.startingXI.filter(id => id !== null),
      ...awayLineup.startingXI.filter(id => id !== null)
    ] as string[]);

    let homeScore = 0;
    let awayScore = 0;
    const scorers: any[] = [];
    const cards: any[] = [];
    const injuries: any[] = [];
    let homeRedPenalty = 1.0;
    let awayRedPenalty = 1.0;
    let homeRedCount = 0;
    let awayRedCount = 0;
    const playerYellowCounts = new Map<string, number>();
    const expelledIds = new Set<string>();

    const shortHandedGoalChance = (redCount: number): number => {
      if (redCount >= 2) return 0.001;
      if (redCount === 1) return 0.28;
      return 1;
    };

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
    const getPlayerPosition = (players: Player[], playerId: string | null): PlayerPosition | undefined => {
      if (!playerId) return undefined;
      return players.find(p => p.id === playerId)?.position;
    };

    const findBenchReplacement = (
      lineup: Lineup,
      players: Player[],
      roleNeeded: PlayerPosition
    ): string | undefined => {
      const isAvailable = (id: string) => !lineup.startingXI.includes(id) && !substitutedOutIds.has(id);
      const hasPosition = (id: string, position: PlayerPosition) => getPlayerPosition(players, id) === position;

      if (roleNeeded === PlayerPosition.GK) {
        return lineup.bench.find(id => isAvailable(id) && hasPosition(id, PlayerPosition.GK));
      }

      return lineup.bench.find(id => isAvailable(id) && hasPosition(id, roleNeeded))
        ?? lineup.bench.find(id => isAvailable(id) && getPlayerPosition(players, id) !== PlayerPosition.GK);
    };

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

        const tacticSlots = TacticRepository.getById(lineup.tacticId).slots;
        const tiredIdx = lineup.startingXI.findIndex((id, idx) => {
          if (!id || fMap[id] >= 88.5 || substitutedInIds.has(id)) return false;
          const roleNeeded = tacticSlots[idx]?.role;
          if (!roleNeeded) return false;
          return roleNeeded !== PlayerPosition.GK && getPlayerPosition(pPool, id) !== PlayerPosition.GK;
        });
        if (tiredIdx !== -1) {
          const roleNeeded = tacticSlots[tiredIdx]?.role ?? PlayerPosition.MID;
          const candidate = findBenchReplacement(lineup, pPool, roleNeeded);
          if (candidate) {
            const outId = lineup.startingXI[tiredIdx] as string;
            lineup.startingXI[tiredIdx] = candidate;
            allPlayedIds.add(candidate);
            substitutions.push({ playerOutId: outId, playerInId: candidate, minute, isHome: side === 'H' });
            substitutedInIds.add(candidate);
            substitutedOutIds.add(outId);
            if (side === 'H') hSubsUsed++; else aSubsUsed++;
          }
        }
      };

      // REAKCJA TRENERA NA CZERWONĄ KARTKĘ
      const respondToRedCard = (expelledId: string, side: 'H' | 'A') => {
        const usedCount = side === 'H' ? hSubsUsed : aSubsUsed;
        if (usedCount >= 5) return;
        const lineup = side === 'H' ? homeLineup : awayLineup;
        const pPool = side === 'H' ? homePlayers : awayPlayers;
        const fMap = side === 'H' ? homeFatigue : awayFatigue;
        const coach = side === 'H' ? homeCoach : awayCoach;
        const coachExp = coach.attributes.experience ?? 50;
        const expelledPlayer = pPool.find(p => p.id === expelledId);
        if (!expelledPlayer) return;
        // Im bardziej doświadczony trener, tym większa szansa na szybką reakcję
        const reactionProb = 0.40 + (coachExp / 100) * 0.55;
        if (seededRng(minute + 336) > reactionProb) return;
        const expelledPos = expelledPlayer.position;
        let targetToSubOff: string | null = null;
        const isOutfieldAvailableToSubOff = (id: string | null) =>
          !!id && getPlayerPosition(pPool, id) !== PlayerPosition.GK && !substitutedInIds.has(id);
        if (coachExp >= 55) {
          // Doświadczony trener: łata dziurę pozycyjną — ściąga napastnika/pomocnika, wpuszcza odpowiedni typ
          if (expelledPos === PlayerPosition.GK) {
            targetToSubOff = lineup.startingXI.find(id => isOutfieldAvailableToSubOff(id)) ?? null;
          } else if (expelledPos === PlayerPosition.DEF) {
            targetToSubOff = lineup.startingXI.find(id => id && pPool.find(p => p.id === id)?.position === PlayerPosition.FWD && !substitutedInIds.has(id)) ?? null;
          } else if (expelledPos === PlayerPosition.MID) {
            targetToSubOff = lineup.startingXI.find(id => id && pPool.find(p => p.id === id)?.position === PlayerPosition.FWD && !substitutedInIds.has(id)) ?? null;
          } else if (expelledPos === PlayerPosition.FWD) {
            targetToSubOff = lineup.startingXI.find(id => id && pPool.find(p => p.id === id)?.position === PlayerPosition.MID && !substitutedInIds.has(id)) ?? null;
          }
        } else {
          // Mało doświadczony trener: ściąga najbardziej zmęczonego
          let minFatigue = Infinity;
          lineup.startingXI.forEach(id => {
            if (!isOutfieldAvailableToSubOff(id)) return;
            const f = fMap[id] ?? 100;
            if (f < minFatigue) { minFatigue = f; targetToSubOff = id; }
          });
        }
        if (!targetToSubOff) return;
        const candidate = findBenchReplacement(lineup, pPool, expelledPos);
        if (!candidate) return;
        const outIdx = lineup.startingXI.indexOf(targetToSubOff);
        if (outIdx === -1) return;
        if (expelledPos === PlayerPosition.GK) {
          const keeperSlotIdx = lineup.startingXI[0] === null ? 0 : lineup.startingXI.findIndex(id => id === null);
          if (keeperSlotIdx === -1) return;
          substitutions.push({ playerOutId: targetToSubOff, playerInId: candidate, minute, isHome: side === 'H' });
          lineup.startingXI[outIdx] = null;
          lineup.startingXI[keeperSlotIdx] = candidate;
          allPlayedIds.add(candidate);
          substitutedInIds.add(candidate);
          substitutedOutIds.add(targetToSubOff);
          if (side === 'H') hSubsUsed++; else aSubsUsed++;
          return;
        }
        substitutions.push({ playerOutId: targetToSubOff, playerInId: candidate, minute, isHome: side === 'H' });
        lineup.startingXI[outIdx] = candidate;
        allPlayedIds.add(candidate);
        substitutedInIds.add(candidate);
        substitutedOutIds.add(targetToSubOff);
        if (side === 'H') hSubsUsed++; else aSubsUsed++;
      };

      // Zmiany w przerwie (wynik-aware + doświadczenie trenera)
      if (minute === 45) {
        const performHalfTimeSubs = (side: 'H' | 'A') => {
          const lineup = side === 'H' ? homeLineup : awayLineup;
          const pPool = side === 'H' ? homePlayers : awayPlayers;
          const fMap = side === 'H' ? homeFatigue : awayFatigue;
          const coach = side === 'H' ? homeCoach : awayCoach;
          const coachExp = coach.attributes.experience ?? 50;
          const coachDec = coach.attributes.decisionMaking ?? 50;
          const myScore = side === 'H' ? homeScore : awayScore;
          const oppScore = side === 'H' ? awayScore : homeScore;
          const goalDiff = myScore - oppScore;
          let changeProb: number;
          let maxChanges: number;
          if (goalDiff <= -2) {
            changeProb = 0.70 + (coachDec / 100) * 0.25;
            maxChanges = 2;
          } else if (goalDiff === -1) {
            changeProb = 0.55 + (coachDec / 100) * 0.20;
            maxChanges = 2;
          } else if (goalDiff === 0) {
            changeProb = 0.25 + (coachExp / 100) * 0.15;
            maxChanges = 1;
          } else {
            changeProb = 0.10 + (coachExp / 100) * 0.10;
            maxChanges = 1;
          }
          const seedOffset = side === 'H' ? 99 : 102;
          if (seededRng(minute + seedOffset) < changeProb) {
            performSub(lineup, pPool, fMap, side);
            if (maxChanges >= 2 && seededRng(minute + seedOffset + 4) < 0.55) {
              performSub(lineup, pPool, fMap, side);
            }
          }
        };
        performHalfTimeSubs('H');
        performHalfTimeSubs('A');
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
      const formImpact = TeamFormImpactService.calculateMatchImpact(homePlayers, awayPlayers, homeLineup, awayLineup);

      // APLIKACJA LAMBDA GENROWANIE SYTUACJI BRAMKOWYCH 
     hGoalLambda *= (1 + globalChaos)  * weatherFinMod * homeRedPenalty * shortHandedGoalChance(homeRedCount) * hSatiety * homeFieldBonus * hTacticMod * hGkPanic * homeFormBoost * homePrepBoost * crowdPressureMod * hPressureAttackMod * rivalryMultiplier * hMoraleDebuff * hClubMoraleMult * formImpact.homeGoalChanceMultiplier;
      aGoalLambda *= (1 + globalChaos) * weatherFinMod * awayRedPenalty * shortHandedGoalChance(awayRedCount) * aSatiety * aTacticMod * aGkPanic * awayFormBoost * awayPrepBoost * aPressureAttackMod * rivalryMultiplier * aMoraleDebuff * aClubMoraleMult * formImpact.awayGoalChanceMultiplier;

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
      const penaltyProb = (referee.strictness / 35000) * penaltyExperienceFactor;
      if (seededRng(minute + 700) < penaltyProb) {
        const side = seededRng(minute + 701) < 0.5 ? 'H' : 'A';
        if (seededRng(minute + 704) > shortHandedGoalChance(side === 'H' ? homeRedCount : awayRedCount)) continue;
        const isScored = seededRng(minute + 702) < 0.78; // 78% skuteczności karnych
        const kicker = GoalAttributionService.pickScorer(side === 'H' ? homePlayers : awayPlayers, (side === 'H' ? homeLineup : awayLineup).startingXI as string[], false, () => seededRng(minute + 703));
        if (!kicker) continue; // brak kandydatów (np. czerwona kartka wyczyściła skład)
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
      const aCardRoll = seededRng(minute + 400);
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
              homeRedCount += 1;
              const hReduction = homeRedCount === 1 ? (0.15 + seededRng(minute + 335) * 0.15) : 0.10;
              homeRedPenalty *= (1 - hReduction);
              homeLineup.startingXI = homeLineup.startingXI.map(id => id === pId ? null : id);
            } else {
              awayRedCount += 1;
              const aReduction = awayRedCount === 1 ? (0.15 + seededRng(minute + 335) * 0.15) : 0.10;
              awayRedPenalty *= (1 - aReduction);
              awayLineup.startingXI = awayLineup.startingXI.map(id => id === pId ? null : id);
            }
            respondToRedCard(pId, side);
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

          const fMap = side === 'H' ? homeFatigue : awayFatigue;
          const injuryPenalty = severity === InjurySeverity.SEVERE ? 55 : 20;
          if (fMap[pId as string] !== undefined) fMap[pId as string] = Math.max(0, fMap[pId as string] - injuryPenalty);

          // Reakcja trenera: jeśli SEVERE, wymuś zmianę kontuzjowanego
          if (severity === InjurySeverity.SEVERE) {
            const usedCount = side === 'H' ? hSubsUsed : aSubsUsed;
            const canSub = usedCount < 5 && !(usedCount === 4 && minute < 88);
            if (canSub) {
              const roleNeeded = TacticRepository.getById(lineup.tacticId).slots[pIdx]?.role ?? PlayerPosition.MID;
              const candidate = findBenchReplacement(lineup, pPool, roleNeeded);
              if (candidate) {
                substitutions.push({ playerOutId: pId as string, playerInId: candidate, minute, isHome: side === 'H' });
                lineup.startingXI[pIdx] = candidate;
                allPlayedIds.add(candidate);
                substitutedInIds.add(candidate);
                substitutedOutIds.add(pId as string);
                if (side === 'H') hSubsUsed++; else aSubsUsed++;
              } else {
                lineup.startingXI[pIdx] = null;
              }
            } else {
              lineup.startingXI[pIdx] = null;
            }
          } else {
            // LIGHT — zawodnik sygnalizuje chęć zmiany zależnie od mentalności
            const mentality = pPool.find(p => p.id === pId)?.attributes.mentality ?? 50;
            const wantsOffProb = Math.max(0.05, (100 - mentality) / 100 * 0.75);
            const wantsOff = seededRng(minute + 810) < wantsOffProb;
            if (wantsOff) {
              const usedCount = side === 'H' ? hSubsUsed : aSubsUsed;
              const canSub = usedCount < 5 && !(usedCount === 4 && minute < 88);
              if (canSub) {
                const roleNeeded = TacticRepository.getById(lineup.tacticId).slots[pIdx]?.role ?? PlayerPosition.MID;
                const candidate = findBenchReplacement(lineup, pPool, roleNeeded);
                if (candidate) {
                  substitutions.push({ playerOutId: pId as string, playerInId: candidate, minute, isHome: side === 'H' });
                  lineup.startingXI[pIdx] = candidate;
                  allPlayedIds.add(candidate);
                  substitutedInIds.add(candidate);
                  substitutedOutIds.add(pId as string);
                  if (side === 'H') hSubsUsed++; else aSubsUsed++;
                } else {
                  lightInjuredOnPitch.set(pId as string, 0.4);
                }
              } else {
                lightInjuredOnPitch.set(pId as string, 0.4);
              }
            } else {
              // Wojownik — gra z bólem, drobny dodatkowy drenaż kondycji
              lightInjuredOnPitch.set(pId as string, 0.25);
            }
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
      const gkReduction = 0.75 + ((p?.attributes?.stamina || 50) / 100) * 0.10;
      currentDrain *= gkReduction;
    }
        homeFatigue[id] = Math.max(0, homeFatigue[id] - currentDrain);
        if (lightInjuredOnPitch.has(id)) homeFatigue[id] = Math.max(0, homeFatigue[id] - lightInjuredOnPitch.get(id)!);
  }
});

    awayLineup.startingXI.forEach((id, idx) => {
        if (id) {
          const p = awayPlayers.find(px => px.id === id);
          const awaySidePressureDrain = aPressureDrain;
          let currentDrain = baseDrain; // Korzystamy z zadeklarowanego wcześniej baseDrain
          currentDrain *= awaySidePressureDrain;
          if (p?.position === 'GK') {
            const gkReduction = 0.75 + ((p?.attributes?.stamina || 50) / 100) * 0.10;
            currentDrain *= gkReduction;
          }
          awayFatigue[id] = Math.max(0, awayFatigue[id] - currentDrain);
          if (lightInjuredOnPitch.has(id)) awayFatigue[id] = Math.max(0, awayFatigue[id] - lightInjuredOnPitch.get(id)!);
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
          const gkDebtFactor = p.position === PlayerPosition.GK
            ? Math.max(0.70, Math.min(0.90, 0.75 + Math.max(0, (p.age - 27) * 0.004) - (staminaAttr / 100) * 0.05))
            : 1;
          const matchDebt = (5 + ((100 - staminaAttr) * 0.15)) * gkDebtFactor;
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
      substitutions,
     playedPlayerIds: Array.from(allPlayedIds),
      fatigue: { ...homeFatigue, ...awayFatigue },
      fatigueDebtMap
    };
  }
};
