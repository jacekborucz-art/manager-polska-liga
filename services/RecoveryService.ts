import { Player, HealthStatus, TrainingIntensity, InjurySeverity } from '../types';

const seededRange = (seed: string, min: number, max: number): number => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const normalized = (hash >>> 0) / 4294967295;
  return min + (max - min) * normalized;
};

const getPlayerHealingDelayFactor = (player: Player): number => {
  const strength = Math.max(1, Math.min(99, player.attributes.strength || 1));
  const injurySeed = `${player.id}_${player.health.injury?.injuryDate ?? ''}_${player.health.injury?.type ?? ''}`;
  const strengthRandomTolerance = seededRange(`${injurySeed}_strength`, 0.005, 0.01);
  const strengthDeficitSteps = Math.max(0, (99 - strength) / 9);
  const strengthDelay = Math.pow(strengthDeficitSteps, 1.22) * strengthRandomTolerance;

  const ageRandomTolerance = seededRange(`${injurySeed}_age`, 0.006, 0.012);
  const agePenaltySteps = Math.max(0, (player.age - 30) / 4);
  const ageDelay = Math.pow(agePenaltySteps, 1.18) * ageRandomTolerance;

  return 1 + strengthDelay + ageDelay;
};

const FREE_AGENT_BUCKET_ID = 'FREE_AGENTS';

/**
 * A WeakMap is deliberately used instead of persisted game state. Once a
 * FREE_AGENTS array is proven to contain only fully recovered players with no
 * date-driven recovery fields, later days can reuse it without visiting 15k+
 * dormant records. Any signing, release, injury, call-up or negotiation replaces
 * the array and therefore invalidates the cache automatically. Save files do
 * not change and loading a save simply rebuilds this knowledge on the first day.
 */
const settledFreeAgentPools = new WeakMap<Player[], string>();

const getRecoveryCacheSignature = (intensity: TrainingIntensity, recoveryMult: number): string =>
  `${intensity}:${recoveryMult.toFixed(6)}`;

const hasSameStringEntries = (
  left?: Record<string, string>,
  right?: Record<string, string>
): boolean => {
  if (left === right) return true;
  const leftEntries = Object.entries(left ?? {});
  const rightEntries = Object.entries(right ?? {});
  if (leftEntries.length !== rightEntries.length) return false;
  return leftEntries.every(([key, value]) => right?.[key] === value);
};

const hasSameHealth = (left: Player['health'], right: Player['health']): boolean => {
  if (left.status !== right.status) return false;
  if (!left.injury || !right.injury) return left.injury === right.injury;
  return (
    left.injury.type === right.injury.type &&
    left.injury.daysRemaining === right.injury.daysRemaining &&
    left.injury.severity === right.injury.severity &&
    left.injury.injuryDate === right.injury.injuryDate &&
    left.injury.totalDays === right.injury.totalDays &&
    left.injury.conditionAtInjury === right.injury.conditionAtInjury
  );
};

const isRecoverySettled = (player: Player): boolean =>
  player.health.status !== HealthStatus.INJURED &&
  (player.fatigueDebt ?? 0) <= 0 &&
  player.condition >= 100 &&
  !player.nationalTeamRecoveryUntil &&
  !player.nationalTeamMajorTournamentRecoveryUntil &&
  !player.negotiationLockoutUntil &&
  Object.keys(player.freeAgentClubLockouts ?? {}).length === 0;

export const RecoveryService = {
  /**
   * Wykonuje dobową regenerację dla wszystkich zawodników.
   * daysCount: pozwala na precyzyjne odliczanie czasu.
   */
  applyDailyRecovery: (playersMap: Record<string, Player[]>, currentDate: Date, intensity: TrainingIntensity, daysCount: number = 1, recoveryMult: number = 1.0, medicalQuality?: number, userTeamId?: string): Record<string, Player[]> => {
    let updatedMap = playersMap;
    const recoveryCacheSignature = getRecoveryCacheSignature(intensity, recoveryMult);

    for (const clubId in playersMap) {
      const sourceSquad = playersMap[clubId];
      if (
        clubId === FREE_AGENT_BUCKET_ID &&
        settledFreeAgentPools.get(sourceSquad) === recoveryCacheSignature
      ) {
        continue;
      }

      const effectiveMedicalQuality = (userTeamId && clubId === userTeamId) ? medicalQuality : undefined;
      const medicalSpeedFactor = (() => {
        if (!effectiveMedicalQuality) return 1.0;
        const q = effectiveMedicalQuality;
        if (q >= 17) return 1.20 + (q - 17) / 3 * 0.10;
        if (q >= 14) return 1.12 + (q - 14) / 3 * 0.08;
        if (q >= 10) return 1.05 + (q - 10) / 4 * 0.07;
        return 1.00 + (q - 1) / 9 * 0.05;
      })();
      let updatedSquad: Player[] | null = null;
      for (let playerIndex = 0; playerIndex < sourceSquad.length; playerIndex++) {
        const player = sourceSquad[playerIndex];
        // Clone the nested injury record before changing daysRemaining/severity.
        // The previous shallow clone could mutate the source save object while
        // supposedly producing a new daily state.
        const updated: Player = {
          ...player,
          health: player.health.injury
            ? { ...player.health, injury: { ...player.health.injury } }
            : player.health,
        };
        const recoveryUntil = player.nationalTeamRecoveryUntil
          ? new Date(player.nationalTeamRecoveryUntil).setHours(23, 59, 59, 999)
          : 0;
        const majorTournamentRecoveryUntil = player.nationalTeamMajorTournamentRecoveryUntil
          ? new Date(player.nationalTeamMajorTournamentRecoveryUntil).setHours(23, 59, 59, 999)
          : 0;
        const currentRecoveryDay = new Date(currentDate).setHours(0, 0, 0, 0);
        const isInjured = player.health.status === HealthStatus.INJURED;
        const hasNationalTeamRecovery = !isInjured && recoveryUntil >= currentRecoveryDay;
        const hasMajorTournamentRecovery = !isInjured && majorTournamentRecoveryUntil >= currentRecoveryDay;
        const nationalTeamDebtRecoveryMult = hasMajorTournamentRecovery ? 3.0 : hasNationalTeamRecovery ? 2.0 : 1.0;
        const nationalTeamConditionRecoveryMult = hasMajorTournamentRecovery ? 1.85 : hasNationalTeamRecovery ? 1.35 : 1.0;
        if (player.nationalTeamRecoveryUntil && !hasNationalTeamRecovery) {
          updated.nationalTeamRecoveryUntil = null;
        }
        if (player.nationalTeamMajorTournamentRecoveryUntil && !hasMajorTournamentRecovery) {
          updated.nationalTeamMajorTournamentRecoveryUntil = null;
        }

// TUTAJ WSTAW TEN KOD
        // 1. MODYFIKATORY REGENERACJI (Age & Injury Factor)
        let ageModifier = 1.0;
        if (player.age <= 24) ageModifier = 0.8;
        else if (player.age <= 29) ageModifier = 0.6;
        else {
          const normalizedCond = Math.max(0, Math.min(1, (player.condition - 50) / 49));
          const normalizedStr = Math.max(0, Math.min(1, (player.attributes.strength - 50) / 49));
          const physicalFactor = (normalizedCond + normalizedStr) / 2;
          ageModifier = 0.3 + 0.3 * physicalFactor;
        }

        const injuryModifier = isInjured ? 0.5 : 1.0;

        // 2. SPŁATA DŁUGU PRZEMĘCZENIA (Fatigue Debt Recovery)
        // Bazowa spłata zależy od Siły (99 STR = ~1.1 pkt długu / doba)
        const debtRecoveryBase = 1.5 + (player.attributes.strength * 0.02); 
        const totalDebtRecovered = debtRecoveryBase * ageModifier * injuryModifier * daysCount * nationalTeamDebtRecoveryMult;
        updated.fatigueDebt = Math.max(0, (updated.fatigueDebt || 0) - totalDebtRecovered);

        // 3. OBLICZANIE REGENERACJI KONDYCJI (Respecting Max Cap)
        // Nowy sufit kondycji:
        const maxConditionCap = 100 - updated.fatigueDebt;
        
        const strengthFactor = player.attributes.strength / 100;
        const staminaFactor = player.attributes.stamina / 100;
        
        let dailyRate = (2.45 + (strengthFactor * 1.5) + (staminaFactor * 1.5)) * recoveryMult * nationalTeamConditionRecoveryMult;

        // WPŁYW WYBRANEJ INTENSYWNOŚCI (STAGE 1 PRO)
        if (intensity === TrainingIntensity.LIGHT) {
          dailyRate += 0.5; // Bonus za lekki trening (+2% extra)
        } else if (intensity === TrainingIntensity.HEAVY) {
          dailyRate -= 2.0; // Drenaż kondycji przy ciężkim treningu
        }
        
        // Bonus odnowy biologicznej: Dla graczy poniżej 80% kondycji organizm reaguje mocniej
        if (updated.condition < 60) {
          dailyRate *= 0.5;
        }

        // Skalowanie przez liczbę dni (Delta)
        if (updated.health.status === HealthStatus.INJURED && updated.health.injury?.injuryDate && (updated.health.injury.totalDays || 0) > 1) {
          const condAtInjury = updated.health.injury.conditionAtInjury ?? updated.condition;
          const injStart = new Date(updated.health.injury.injuryDate).setHours(0,0,0,0);
          const simDay   = new Date(currentDate).setHours(0,0,0,0);
          const daysPassed = Math.max(0, Math.floor((simDay - injStart) / (1000 * 60 * 60 * 24)));
          const healingDelayFactor = getPlayerHealingDelayFactor(updated);
          const effTotalDays = Math.max(2, Math.round(((updated.health.injury.totalDays || 1) * healingDelayFactor) / medicalSpeedFactor));
          const targetCond = condAtInjury + (99 - condAtInjury) * (daysPassed / (effTotalDays - 1));
          updated.condition = Math.min(99, Math.max(condAtInjury, targetCond));
        } else {
          const totalConditionChange = dailyRate * ageModifier * injuryModifier * daysCount;
          updated.condition = Math.max(0, Math.min(maxConditionCap, updated.condition + totalConditionChange* 0.88));
        }

        // 2. BEZWZGLĘDNA REGENERACJA URAZU (Absolute Recovery Logic - STAGE 1 PRO)
        if (updated.health.status === HealthStatus.INJURED && updated.health.injury?.injuryDate) {
          const injuryStart = new Date(updated.health.injury.injuryDate).setHours(0,0,0,0);
          const currentSimDate = new Date(currentDate).setHours(0,0,0,0);
          
          // Obliczamy ile realnie dni minęło od daty wypadku
          const diffMs = currentSimDate - injuryStart;
          const totalDaysPassed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
          
          // Pozostałe dni to pierwotna długość (totalDays) minus upływ czasu
          const rawTotalDays = updated.health.injury.totalDays || updated.health.injury.daysRemaining;
          const healingDelayFactor = getPlayerHealingDelayFactor(updated);
          const effTotalDays2 = Math.max(1, Math.round((rawTotalDays * healingDelayFactor) / medicalSpeedFactor));
          const actualRemaining = effTotalDays2 - totalDaysPassed;

          if (actualRemaining <= 0) {
            // Czas minął - zawodnik zdrowy
            updated.health = { status: HealthStatus.HEALTHY };
          } else {
            // Aktualizacja licznika wstecznego
            updated.health.injury.daysRemaining = actualRemaining;
            // Limit energii dynamiczny: im więcej dni pozostało, tym niższy limit
            // Przy 7 dniach → max 80% (fatigueDebt=20), przy 30+ → ok. 10%
            updated.fatigueDebt = Math.min(90, Math.round(actualRemaining * 20 / 7));
            // Korekta severity: lekki uraz nie może trwać dłużej niż 14 dni
            if (updated.health.injury.severity === InjurySeverity.LIGHT && actualRemaining > 14) {
              updated.health.injury.severity = InjurySeverity.SEVERE;
            }
          }
        }

        // AUTOMATYCZNE ODBLOKOWYWANIE NEGOCJACJI
        if (updated.negotiationLockoutUntil) {
          const lockoutDate = new Date(updated.negotiationLockoutUntil).setHours(0,0,0,0);
          const currentSimDate = new Date(currentDate).setHours(0,0,0,0);
          
          if (currentSimDate >= lockoutDate) {
            updated.negotiationLockoutUntil = null; // Czas minął, zawodnik jest gotów do rozmów
          }
        }

        if (updated.freeAgentClubLockouts) {
          const currentSimDate = new Date(currentDate).setHours(0, 0, 0, 0);
          const activeClubLockouts = Object.fromEntries(
            Object.entries(updated.freeAgentClubLockouts).filter(([, lockoutUntil]) =>
              new Date(lockoutUntil).setHours(0, 0, 0, 0) > currentSimDate
            )
          );
          if (!hasSameStringEntries(updated.freeAgentClubLockouts, activeClubLockouts)) {
            updated.freeAgentClubLockouts = activeClubLockouts;
          }
        }

        const playerChanged =
          updated.fatigueDebt !== player.fatigueDebt ||
          updated.condition !== player.condition ||
          !hasSameHealth(updated.health, player.health) ||
          updated.nationalTeamRecoveryUntil !== player.nationalTeamRecoveryUntil ||
          updated.nationalTeamMajorTournamentRecoveryUntil !== player.nationalTeamMajorTournamentRecoveryUntil ||
          updated.negotiationLockoutUntil !== player.negotiationLockoutUntil ||
          !hasSameStringEntries(updated.freeAgentClubLockouts, player.freeAgentClubLockouts);

        const nextPlayer = playerChanged ? updated : player;
        if (nextPlayer !== player && !updatedSquad) {
          updatedSquad = sourceSquad.slice(0, playerIndex);
        }
        if (updatedSquad) updatedSquad.push(nextPlayer);
      }

      const finalSquad = updatedSquad ?? sourceSquad;
      if (finalSquad !== sourceSquad) {
        if (updatedMap === playersMap) updatedMap = { ...playersMap };
        updatedMap[clubId] = finalSquad;
      }

      if (clubId === FREE_AGENT_BUCKET_ID && finalSquad.every(isRecoverySettled)) {
        settledFreeAgentPools.set(finalSquad, recoveryCacheSignature);
      }
    }

    return updatedMap;
  }
};
