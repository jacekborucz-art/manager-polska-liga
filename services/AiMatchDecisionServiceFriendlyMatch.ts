import { MatchLiveState, MatchContext, Player, PlayerPosition, Lineup, SubstitutionRecord, InjurySeverity } from '../types';
import { TacticRepository } from '../resources/tactics_db';
import { LineupService } from './LineupService';
// [AI-COACH-FIX] applyTacticReassignment — ten sam mechanizm naprawy "remapowania składu" co w
// silniku ligowym (AiMatchDecisionService.ts). Patrz tam obszerny komentarz przy definicji: bez
// tego, zmiana taktyki w trakcie meczu tylko zmieniała nazwę taktyki, a 11 zawodników zostawało na
// starych miejscach — więc np. pomocnik mógł "automatycznie" zostać napastnikiem (bo to samo miejsce
// na boisku znaczy inną rolę w nowej taktyce) bez żadnej faktycznej zmiany ustawienia, i dostawać
// karę za grę nie na swojej pozycji.
import { applyTacticReassignment } from './AiMatchDecisionService';

const FRIENDLY_OFFENSIVE_TACTICS = ['4-4-2-OFF', '4-3-3', '3-5-2', '4-3-2-1', '4-3-3-F9', '3-4-2-1', '3-4-3'];
const FRIENDLY_DEFENSIVE_TACTICS = ['5-4-1', '4-4-2-DEF', '5-3-2', '6-3-1', '5-2-1-2', '4-5-1'];

const getLineupFitForTactic = (lineup: Lineup, players: Player[], tacticId: string): number => {
  const tactic = TacticRepository.getById(tacticId);
  return lineup.startingXI.reduce((sum, playerId, idx) => {
    if (!playerId) return sum;
    const player = players.find(p => p.id === playerId);
    if (!player) return sum;
    return sum + LineupService.calculateFitScore(player, tactic.slots[idx].role);
  }, 0);
};

const chooseFriendlyScoreTacticResponse = (
  lineup: Lineup,
  players: Player[],
  scoreDiff: number
): string | null => {
  const pool = scoreDiff < 0
    ? (scoreDiff <= -2 ? FRIENDLY_OFFENSIVE_TACTICS : ['4-4-2-OFF', '4-3-3', '3-5-2', '4-3-2-1'])
    : FRIENDLY_DEFENSIVE_TACTICS;
  const currentTactic = TacticRepository.getById(lineup.tacticId);
  const currentFit = getLineupFitForTactic(lineup, players, lineup.tacticId);

  const candidates = pool
    .filter(tacticId => tacticId !== lineup.tacticId)
    .map(tacticId => {
      const tactic = TacticRepository.getById(tacticId);
      const fitLoss = Math.max(0, currentFit - getLineupFitForTactic(lineup, players, tacticId));
      const intentGain = scoreDiff < 0
        ? tactic.attackBias - currentTactic.attackBias
        : tactic.defenseBias - currentTactic.defenseBias;
      const chaseDeficit = scoreDiff < 0 ? Math.min(3, Math.abs(scoreDiff)) : 0;
      const ultraOpenRisk = scoreDiff < 0
        ? Math.max(0, tactic.attackBias - 78) * 0.22 +
          Math.max(0, 42 - tactic.defenseBias) * (0.16 + chaseDeficit * 0.06)
        : 0;
      const structureBreakRisk = scoreDiff < 0 && currentTactic.defenseBias - tactic.defenseBias > 25
        ? (currentTactic.defenseBias - tactic.defenseBias - 25) * 0.12
        : 0;
      return {
        tacticId,
        score: intentGain - fitLoss * 0.24 - ultraOpenRisk - structureBreakRisk
      };
    })
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.tacticId ?? null;
};

/**
 * Wersja serwisu decyzyjnego AI dla meczów sparingowych.
 * Różnice względem AiMatchDecisionService:
 *  - Parametr `maxSubs` zastępuje hardkodowany limit 5 zmian (AI szanuje umowę gracza)
 *  - PRIORYTET 2 (wypełnianie luk po kontuzjach) jest nieograniczony — zmiana po kontuzji
 *    to zmiana dodatkowa i nie wlicza się do zwykłego limitu zmian
 */
export const AiMatchDecisionServiceFriendlyMatch = {
  makeDecisions: (
    state: MatchLiveState,
    ctx: MatchContext,
    side: 'HOME' | 'AWAY',
    isPriority: boolean = false,
    isHalftime: boolean = false,
    maxSubs: number = 5
  ): { newLineup?: Lineup, newSubsCount?: number, subRecord?: SubstitutionRecord, newTacticId?: string, lastAiActionMinute?: number, aiTacticLocked?: boolean, logs: string[] } => {

    const isHome = side === 'HOME';
    const logs: string[] = [];
    let aiTacticLockResult: boolean | undefined = undefined;

    // 1. CZAS REAKCJI (COOLDOWN)
    const cooldown = isPriority || isHalftime ? 0 : 4;
    const lastAction = state.lastAiActionMinute || 0;
    if (!isPriority && !isHalftime && (state.minute - lastAction < cooldown)) {
      return { logs: [] };
    }

    const currentLineup = isHome ? state.homeLineup : state.awayLineup;
    const currentSubsCount = isHome ? state.subsCountHome : state.subsCountAway;
    const currentFatigue = isHome ? state.homeFatigue : state.awayFatigue;
    const currentInjuries = isHome ? state.homeInjuries : state.awayInjuries;
    const myPlayers = isHome ? ctx.homePlayers : ctx.awayPlayers;
    const mySubsHistory = isHome ? state.homeSubsHistory : state.awaySubsHistory;

    const outIds = new Set(mySubsHistory.map(s => s.playerOutId));

    const myScore = isHome ? state.homeScore : state.awayScore;
    const oppScore = isHome ? state.awayScore : state.homeScore;
    const scoreDiff = myScore - oppScore;

    // 2. SZANSA NA PODJĘCIE DZIAŁANIA (Intuicja)
    let reactionChance = 0.35;
    if (isHalftime) {
      reactionChance = scoreDiff < 0 ? 0.85 : (scoreDiff === 0 ? 0.50 : 0.25);
    } else {
      reactionChance = isPriority ? 1.0 : (state.minute < 45 ? 0.30 : (state.minute < 75 ? 0.75 : 0.95));
      if (scoreDiff < 0) reactionChance += 0.20;
    }

    if (Math.random() > reactionChance && !isPriority) return { logs: [] };

    let newLineup = { ...currentLineup, startingXI: [...currentLineup.startingXI], bench: [...currentLineup.bench] };
    let newSubsCount = currentSubsCount;
    let subRecord: SubstitutionRecord | undefined;
    let newTacticId: string | undefined;
    let updatedActionMinute = state.minute;

    // [AI-COACH-FIX] let (było: const) — odświeżane zaraz po każdej zmianie newLineup.tacticId (patrz
    // "tactic = TacticRepository..." niżej), żeby sprawdzenie "dziury w obronie" po czerwonej kartce
    // czytało mapę rola->miejsce NOWEJ taktyki, nie tej sprzed zmiany.
    let tactic = TacticRepository.getById(newLineup.tacticId);
    const applyTactic = (tacticId: string, lockSlotZeroId?: string) => {
      newLineup = applyTacticReassignment(newLineup, myPlayers, tacticId, lockSlotZeroId);
      tactic = TacticRepository.getById(newLineup.tacticId);
      newTacticId = tacticId;
    };

    // --- PRIORYTET 1: BRAK BRAMKARZA / CZERWONA KARTKA GK ---
    const gkInSlot = newLineup.startingXI[0];
    if (gkInSlot === null) {
      const bestGkOnBench = newLineup.bench
        .map(id => myPlayers.find(p => p.id === id)).filter((p): p is Player => !!p)
        .filter(p => p && p.position === PlayerPosition.GK && !outIds.has(p.id))
        .sort((a, b) => b.overallRating - a.overallRating)[0];

      // OPCJA A: Mamy zmiany i bramkarza na ławce -> Standardowa procedura
      if (bestGkOnBench && currentSubsCount < maxSubs) {
        let fieldPlayerIdx = -1;
        for (let i = newLineup.startingXI.length - 1; i >= 1; i--) {
          if (newLineup.startingXI[i] !== null) { fieldPlayerIdx = i; break; }
        }
        if (fieldPlayerIdx !== -1) {
          const playerOutId = newLineup.startingXI[fieldPlayerIdx]!;
          newLineup.startingXI[fieldPlayerIdx] = null;
          newLineup.startingXI[0] = bestGkOnBench.id;
          newLineup.bench = newLineup.bench.filter(id => id !== bestGkOnBench.id);
          newSubsCount++;
          subRecord = { playerOutId, playerInId: bestGkOnBench.id, minute: state.minute };
          logs.push(` Bramkarz rezerwowy ${bestGkOnBench.lastName} zastępuje gracza z pola!`);
        }
      }
      // OPCJA B: Brak zmian LUB brak GK na ławce -> Gracz z pola musi wejść do bramki
      else {
        const fieldCandidates = newLineup.startingXI
          .map((id, idx) => ({ id, idx }))
          .filter(item => item.id !== null && item.idx !== 0)
          .map(item => ({ ...item, p: myPlayers.find(p => p.id === item.id)! }))
          .sort((a, b) => (b.p.attributes.positioning + b.p.attributes.strength) - (a.p.attributes.positioning + a.p.attributes.strength));

        if (fieldCandidates.length > 0) {
          const bestCandidate = fieldCandidates[0];
          newLineup.startingXI[0] = bestCandidate.id;
          newLineup.startingXI[bestCandidate.idx] = null;
          logs.push(` Niecodzienna sytuacja na boisku. ${bestCandidate.p.lastName} musi stanąć między słupkami!`);
        }
      }
    }

    // --- SYSTEM KONSOLIDACJI DEFENSYWNEJ (SKD) ---
    const mySentOffCount = state.sentOffIds.filter(id => myPlayers.some(p => p.id === id)).length;

    if (mySentOffCount > 0) {
      // A. Zmiana taktyki na defensywną
      if (!newTacticId && !state.aiTacticLocked) {
        const ultraDefTactics = ['5-4-1', '4-4-2-DEF', '5-3-2', '6-3-1', '4-5-1'];
        const solidDefTactics = ['4-4-2-DEF', '5-3-2', '4-5-1', '5-2-1-2'];
        const tacticPool = scoreDiff >= 0 ? ultraDefTactics : solidDefTactics;
        const candidates = tacticPool.filter(t => t !== newLineup.tacticId);
        if (candidates.length > 0) {
          const chosenTactic = candidates[Math.floor(Math.random() * candidates.length)];
          // [AI-COACH-FIX] applyTacticReassignment — patrz komentarz przy imporcie na górze pliku.
          applyTactic(chosenTactic);
          updatedActionMinute = state.minute;
          aiTacticLockResult = true;
          logs.push(`Zmiana taktyki po czerwonej kartce: ${newTacticId}.`);
        }
      } else if (state.aiTacticLocked) {
        aiTacticLockResult = true;
      }

      // B. Sprawdzenie czy w linii obrony jest "dziura" (null)
      const defSlots = tactic.slots.filter(s => s.role === PlayerPosition.DEF).map(s => s.index);
      const emptyDefIdx = defSlots.find(idx => newLineup.startingXI[idx] === null);

      if (emptyDefIdx !== undefined && !subRecord) {
        // Opcja 1: Mamy zmiany -> Standardowa zmiana taktyczna
        if (newSubsCount < maxSubs) {
          const bestDefOnBench = newLineup.bench
            .map(id => myPlayers.find(p => p.id === id)).filter((p): p is Player => !!p)
            .filter(p => p.position === PlayerPosition.DEF && !outIds.has(p.id))
            .sort((a, b) => b.overallRating - a.overallRating)[0];

          if (bestDefOnBench) {
            let sacrificeIdx = -1;
            for (let i = newLineup.startingXI.length - 1; i >= 0; i--) {
              const pid = newLineup.startingXI[i];
              if (pid !== null && (tactic.slots[i].role === PlayerPosition.FWD || tactic.slots[i].role === PlayerPosition.MID)) {
                sacrificeIdx = i;
                break;
              }
            }

            if (sacrificeIdx !== -1) {
              const playerOutId = newLineup.startingXI[sacrificeIdx]!;
              newLineup.startingXI[sacrificeIdx] = null;
              newLineup.startingXI[emptyDefIdx] = bestDefOnBench.id;
              newLineup.bench = newLineup.bench.filter(id => id !== bestDefOnBench.id);
              newSubsCount++;
              subRecord = { playerOutId, playerInId: bestDefOnBench.id, minute: state.minute };
              logs.push(`Zmiana wymuszona sytuacją. ${bestDefOnBench.lastName} wchodzi do obrony.`);
            }
          }
        }
        // Opcja 2: Brak zmian -> Przesuwamy najlepszego defensywnego pomocnika do obrony
        else {
          const bestInternalCover = newLineup.startingXI
            .map((id, idx) => ({ id, idx }))
            .filter(item => item.id !== null && tactic.slots[item.idx].role !== PlayerPosition.DEF && tactic.slots[item.idx].role !== PlayerPosition.GK)
            .map(item => ({ ...item, p: myPlayers.find(p => p.id === item.id)! }))
            .sort((a, b) => b.p.attributes.defending - a.p.attributes.defending)[0];

          if (bestInternalCover) {
            newLineup.startingXI[emptyDefIdx] = bestInternalCover.id;
            newLineup.startingXI[bestInternalCover.idx] = null;
            logs.push(` Brak zmian w drużynie. ${bestInternalCover.p.lastName} musi zagrać w obronie.`);
          }
        }
      }
    }

    // --- PRIORYTET 2: WYPEŁNIANIE LUK PO KONTUZJACH (ZMIANA DODATKOWA — POZA LIMITEM) ---
    // Zasada sparing: krytyczna kontuzja = dodatkowa zmiana, nie wlicza się do limitu
    if (!subRecord) {
      const emptySlotIdx = newLineup.startingXI.findIndex(id => id === null);

      if (emptySlotIdx !== -1) {
        // Sprawdź czy luka jest po kontuzji (nie po czerwonej kartce)
        const mySentOffCount2 = state.sentOffIds.filter(id => myPlayers.some(p => p.id === id)).length;
        const currentOnPitchCount = newLineup.startingXI.filter(id => id !== null).length;
        const maxAllowedOnPitch = 11 - mySentOffCount2;

        if (currentOnPitchCount < maxAllowedOnPitch) {
          const requiredRole = tactic.slots[emptySlotIdx].role;
          const injuryOutIds = new Set(mySubsHistory.map(s => s.playerOutId));

          const benchPool = newLineup.bench
            .map(id => myPlayers.find(p => p.id === id)).filter((p): p is Player => !!p)
            .filter(p => p && !injuryOutIds.has(p.id));

          let bestSub = null;
          if (requiredRole === PlayerPosition.GK) {
            bestSub = benchPool.find(p => p.position === PlayerPosition.GK);
          } else {
            bestSub = benchPool
              .filter(p => p.position !== PlayerPosition.GK)
              .sort((a, b) => LineupService.calculateFitScore(b, requiredRole) - LineupService.calculateFitScore(a, requiredRole))[0];
          }

          if (bestSub) {
            newLineup.startingXI[emptySlotIdx] = bestSub.id;
            newLineup.bench = newLineup.bench.filter(id => id !== bestSub.id);
            // Zmiana po kontuzji NIE wlicza się do limitu — newSubsCount bez zmian
            subRecord = { playerOutId: 'NONE', playerInId: bestSub.id, minute: state.minute };
            updatedActionMinute = state.minute;
            logs.push(`Zmiana awaryjna (kontuzja), ${bestSub.lastName} wchodzi w miejsce zniesionego gracza.`);
          }
        }
      }
    }

    // --- SMART SUBS: ZMĘCZENIE I TAKTYKA ---
    if (!subRecord && currentSubsCount < maxSubs) {
      let playerOutId: string | null = null;
      let reason = "";

      const injuredId = newLineup.startingXI.find(id => id && currentInjuries[id] === InjurySeverity.SEVERE);

      if (injuredId) {
        playerOutId = injuredId;
        reason = "kontuzja";
      } else if (isHalftime || state.minute > 55) {
        const fatigueThreshold = isHalftime ? 92 : 88;

        const candidates = newLineup.startingXI
          .filter(id => id !== null)
          .map(id => ({ id: id!, fatigue: currentFatigue[id!] || 100 }))
          .filter(c => c.fatigue < fatigueThreshold)
          .sort((a, b) => a.fatigue - b.fatigue);

        if (candidates.length > 0) {
          playerOutId = candidates[0].id;
          reason = isHalftime ? "Zmiana taktyczna" : "";
        } else if (isHalftime && scoreDiff < 0) {
          const fieldPlayers = newLineup.startingXI
            .slice(1)
            .filter(id => id !== null)
            .map(id => myPlayers.find(p => p.id === id))
            .filter((p): p is Player => p !== undefined)
            .sort((a, b) => a.overallRating - b.overallRating);

          if (fieldPlayers.length > 0) {
            playerOutId = fieldPlayers[0].id;
            reason = "impuls managera";
          }
        }
      }

      if (playerOutId) {
        const slotIdx = newLineup.startingXI.indexOf(playerOutId);
        const requiredRole = tactic.slots[slotIdx].role;
        const smartOutIds = new Set(mySubsHistory.map(s => s.playerOutId));

        const benchPool = newLineup.bench
          .map(id => myPlayers.find(p => p.id === id)!)
          .filter(p => p && !smartOutIds.has(p.id));

        let bestSub = null;
        if (requiredRole === PlayerPosition.GK) {
          bestSub = benchPool.filter(p => p.position === PlayerPosition.GK).sort((a, b) => b.overallRating - a.overallRating)[0];
        } else {
          bestSub = benchPool
            .filter(p => p.position !== PlayerPosition.GK)
            .sort((a, b) => {
              let scoreA = LineupService.calculateFitScore(a, requiredRole);
              let scoreB = LineupService.calculateFitScore(b, requiredRole);
              if (scoreDiff < 0 && b.position === PlayerPosition.FWD) scoreB += 25;
              return scoreB - scoreA;
            })[0];
        }

        if (bestSub) {
          const pOut = myPlayers.find(p => p.id === playerOutId);
          newLineup = LineupService.swapPlayers(newLineup, playerOutId, bestSub.id, slotIdx);
          newSubsCount = currentSubsCount + 1;
          subRecord = { playerOutId, playerInId: bestSub.id, minute: state.minute };
          logs.push(`${isHalftime ? '' : state.minute + '\''} ${bestSub.lastName} zastępuje ${pOut?.lastName} ${reason}.`);
        }
      }
    }

    // --- REAKCJA TAKTYCZNA ---
    const tacticCooldown = 12;
    const canChangeTactic = !state.aiTacticLocked && (state.minute - (state.lastAiActionMinute || 0)) >= tacticCooldown;

    if (state.minute > 20 && !newTacticId && canChangeTactic) {
      if (scoreDiff < -1 && state.minute > 45) {
        const chosenTactic = chooseFriendlyScoreTacticResponse(newLineup, myPlayers, scoreDiff);
        if (chosenTactic) {
          // [AI-COACH-FIX] applyTacticReassignment — patrz komentarz przy imporcie na górze pliku.
          applyTactic(chosenTactic);
          updatedActionMinute = state.minute;
          logs.push(`Zmiana ustawienia na ${newTacticId}.`);
        }
      } else if (scoreDiff > 0 && state.minute > 75 && mySentOffCount === 0) {
        const chosenTactic = chooseFriendlyScoreTacticResponse(newLineup, myPlayers, scoreDiff);
        if (chosenTactic) {
          // [AI-COACH-FIX] applyTacticReassignment — patrz komentarz przy imporcie na górze pliku.
          applyTactic(chosenTactic);
          updatedActionMinute = state.minute;
          logs.push(`Zmiana ustawienia na ${newTacticId}.`);
        }
      }
    }

    return {
      newLineup,
      newSubsCount,
      subRecord,
      newTacticId,
      lastAiActionMinute: updatedActionMinute,
      aiTacticLocked: aiTacticLockResult,
      logs
    };
  }
};
