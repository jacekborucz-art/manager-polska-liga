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

export const RecoveryService = {
  /**
   * Wykonuje dobową regenerację dla wszystkich zawodników.
   * daysCount: pozwala na precyzyjne odliczanie czasu.
   */
  applyDailyRecovery: (playersMap: Record<string, Player[]>, currentDate: Date, intensity: TrainingIntensity, daysCount: number = 1, recoveryMult: number = 1.0, medicalQuality?: number, userTeamId?: string): Record<string, Player[]> => {
    const updatedMap = { ...playersMap };

    for (const clubId in updatedMap) {
      const effectiveMedicalQuality = (userTeamId && clubId === userTeamId) ? medicalQuality : undefined;
      const medicalSpeedFactor = (() => {
        if (!effectiveMedicalQuality) return 1.0;
        const q = effectiveMedicalQuality;
        if (q >= 17) return 1.20 + (q - 17) / 3 * 0.10;
        if (q >= 14) return 1.12 + (q - 14) / 3 * 0.08;
        if (q >= 10) return 1.05 + (q - 10) / 4 * 0.07;
        return 1.00 + (q - 1) / 9 * 0.05;
      })();
      updatedMap[clubId] = updatedMap[clubId].map(player => {
        const updated = { ...player };

// TUTAJ WSTAW TEN KOD
        // 1. MODYFIKATORY REGENERACJI (Age & Injury Factor)
        let ageModifier = 1.0;
        if (player.age <= 24) ageModifier = 0.8;       // Młode organizmy (bonus)
        else if (player.age <= 29) ageModifier = 0.6;  // Szczyt formy
        else if (player.age <= 34) ageModifier = 0.17; // Powolny spadek
        else ageModifier = 0.7;                        // Weterani (wolna regeneracja)

        const injuryModifier = player.health.status === HealthStatus.INJURED ? 0.5 : 1.0;

        // 2. SPŁATA DŁUGU PRZEMĘCZENIA (Fatigue Debt Recovery)
        // Bazowa spłata zależy od Siły (99 STR = ~1.1 pkt długu / doba)
        const debtRecoveryBase = 1.5 + (player.attributes.strength * 0.02); 
        const totalDebtRecovered = debtRecoveryBase * ageModifier * injuryModifier * daysCount;
        updated.fatigueDebt = Math.max(0, (updated.fatigueDebt || 0) - totalDebtRecovered);

        // 3. OBLICZANIE REGENERACJI KONDYCJI (Respecting Max Cap)
        // Nowy sufit kondycji:
        const maxConditionCap = 100 - updated.fatigueDebt;
        
        const strengthFactor = player.attributes.strength / 100;
        const staminaFactor = player.attributes.stamina / 100;
        
        let dailyRate = (2.45 + (strengthFactor * 1.5) + (staminaFactor * 1.5)) * recoveryMult;

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
          updated.freeAgentClubLockouts = Object.fromEntries(
            Object.entries(updated.freeAgentClubLockouts).filter(([, lockoutUntil]) =>
              new Date(lockoutUntil).setHours(0, 0, 0, 0) > currentSimDate
            )
          );
        }

        return updated;
      });
    }

    return updatedMap;
  }
};
