import {
  Club,
  Player,
  SummerCampLocation,
  SummerCampProgram,
  SummerCampIntensity,
  SummerCampState,
  PlayerAttributes,
} from '../types';

// ─── Generowanie cen ─────────────────────────────────────────────────────────

function roundTo10k(value: number): number {
  return Math.round(value / 10000) * 10000;
}

export function generateSummerLocationPrices(seed: number): SummerCampState['locationPrices'] {
  const rng = (offset: number) => Math.abs(Math.sin(seed + offset) * 10000) % 1;
  return {
    poland:         roundTo10k(250000 + rng(1) * 250000),
    czech_republic: roundTo10k(250000 + rng(2) * 250000),
    slovakia:       roundTo10k(250000 + rng(3) * 250000),
    austria:        roundTo10k(450000 + rng(4) * 400000),
    switzerland:    roundTo10k(700000 + rng(5) * 300000),
  };
}

export function generateSummerSpaCost(seed: number): number {
  const rng = Math.abs(Math.sin(seed + 199) * 10000) % 1;
  return roundTo10k(20000 + rng * 40000);
}

// ─── Program → atrybuty ──────────────────────────────────────────────────────

type AttributeKey = keyof PlayerAttributes;

const PROGRAM_ATTRS: Record<SummerCampProgram, { main: AttributeKey; secondary: AttributeKey[] }> = {
  fitness:   { main: 'stamina',    secondary: ['strength'] },
  tactical:  { main: 'mentality',  secondary: ['positioning', 'vision'] },
  technical: { main: 'technique',  secondary: ['dribbling', 'passing'] },
  strength:  { main: 'strength',   secondary: ['heading', 'defending'] },
  recovery:  { main: 'stamina',    secondary: [] },
};

// ─── Obliczanie bonusu atrybutu (workRate-dependent) ─────────────────────────

function calcBonus(workRate: number, intensity: SummerCampIntensity, rng: number): number {
  const wr = workRate / 99;

  if (wr < 0.30) return rng < 0.30 ? -1 : 0;
  if (wr < 0.50) {
    if (intensity === 'intense')  return rng < 0.15 ? -1 : 0;
    return rng < 0.10 ? -1 : 0;
  }
  const chances: Record<SummerCampIntensity, [number, number]> = {
    light:    [0.30, 0.00],
    moderate: [0.60, 0.10],
    intense:  [0.70, 0.30],
  };
  const [c1, c2] = chances[intensity];
  if (rng < c2) return 2;
  if (rng < c1) return 1;
  return 0;
}

// ─── Clamp atrybutu ──────────────────────────────────────────────────────────

function clampAttr(val: number): number {
  return Math.min(99, Math.max(1, val));
}

// ─── Efekty obozu ────────────────────────────────────────────────────────────

export interface SummerCampEffect {
  playerId: string;
  firstName: string;
  lastName: string;
  attrChanges: Partial<PlayerAttributes>;
  injured: boolean;
  fatigueDebtDelta: number;
}

export interface SummerCampResult {
  effects: SummerCampEffect[];
  moraleDelta: number;
}

export function applySummerCampEffects(
  players: Player[],
  camp: SummerCampState,
  seed: number,
): SummerCampResult {
  const effects: SummerCampEffect[] = [];
  let moraleDelta = 0;

  if (camp.isDeclined) {
    moraleDelta = -(5 + Math.floor(Math.abs(Math.sin(seed + 201) * 6)));
    players.forEach((player, i) => {
      const rng = Math.abs(Math.sin(seed + 301 + i) * 10000) % 1;
      if (rng < 0.15) {
        const attrs = Object.keys(player.attributes) as AttributeKey[];
        const idx = Math.floor(Math.abs(Math.sin(seed + 401 + i) * 10000) % attrs.length);
        const key = attrs[idx];
        const attrChanges: Partial<PlayerAttributes> = { [key]: clampAttr((player.attributes[key] as number) - 1) };
        effects.push({ playerId: player.id, firstName: player.firstName, lastName: player.lastName, attrChanges, injured: false, fatigueDebtDelta: 0 });
      }
    });
    return { effects, moraleDelta };
  }

  if (!camp.program || !camp.intensity || !camp.location) return { effects, moraleDelta: 0 };

  const program = PROGRAM_ATTRS[camp.program];
  const intensity = camp.intensity;
  const hasSpa = camp.spaOption;

  const injuryMultipliers: Record<SummerCampIntensity, number> = { light: 0.4, moderate: 1.0, intense: 2.2 };
  const baseInjuryChance = 0.015 * injuryMultipliers[intensity] * (hasSpa ? 0.7 : 1.0);

  const localLocations: SummerCampLocation[] = ['poland', 'czech_republic', 'slovakia'];
  moraleDelta = localLocations.includes(camp.location) ? 3 : 5;
  if (hasSpa) moraleDelta += 3;

  players.forEach((player, i) => {
    const workRate = player.attributes.workRate ?? 50;
    const rngMain   = Math.abs(Math.sin(seed + 501 + i * 7)  * 10000) % 1;
    const rngSec1   = Math.abs(Math.sin(seed + 601 + i * 7)  * 10000) % 1;
    const rngSec2   = Math.abs(Math.sin(seed + 701 + i * 7)  * 10000) % 1;
    const rngInjury = Math.abs(Math.sin(seed + 801 + i * 7)  * 10000) % 1;

    const attrChanges: Partial<PlayerAttributes> = {};

    if (camp.program === 'recovery') {
      // program regeneracyjny — tylko fatigue
    } else {
      const mainBonus = calcBonus(workRate, intensity, rngMain);
      if (mainBonus !== 0) {
        attrChanges[program.main] = clampAttr((player.attributes[program.main] as number) + mainBonus);
      }
      if (program.secondary[0]) {
        const sec1Bonus = calcBonus(workRate, intensity, rngSec1);
        if (sec1Bonus > 0) {
          attrChanges[program.secondary[0]] = clampAttr((player.attributes[program.secondary[0]] as number) + sec1Bonus);
        }
      }
      if (program.secondary[1]) {
        const sec2Bonus = calcBonus(workRate, intensity, rngSec2);
        if (sec2Bonus > 0 && rngSec2 < 0.4) {
          attrChanges[program.secondary[1]] = clampAttr((player.attributes[program.secondary[1]] as number) + sec2Bonus);
        }
      }
    }

    const fatigueDebtDelta = camp.program === 'recovery' ? -20 : intensity === 'intense' ? 5 : intensity === 'moderate' ? 2 : 0;
    const injured = rngInjury < baseInjuryChance;

    if (Object.keys(attrChanges).length > 0 || injured || fatigueDebtDelta !== 0) {
      effects.push({ playerId: player.id, firstName: player.firstName, lastName: player.lastName, attrChanges, injured, fatigueDebtDelta });
    }
  });

  return { effects, moraleDelta };
}

// ─── Asystent: sugestia programu ─────────────────────────────────────────────

export interface SummerAssistantSuggestion {
  program: SummerCampProgram;
  reason: string;
}

export function getSummerAssistantSuggestion(players: Player[], club: Club): SummerAssistantSuggestion {
  if (!players.length) return { program: 'fitness', reason: 'Brak danych o składzie — sugeruję trening kondycyjny jako bazę przed nowym sezonem.' };

  const avgStamina   = players.reduce((s, p) => s + p.attributes.stamina,    0) / players.length;
  const avgMentality = players.reduce((s, p) => s + p.attributes.mentality,  0) / players.length;
  const avgTechnique = players.reduce((s, p) => s + p.attributes.technique,  0) / players.length;
  const avgStrength  = players.reduce((s, p) => s + p.attributes.strength,   0) / players.length;
  const avgFatigue   = players.reduce((s, p) => s + (p.fatigueDebt ?? 0),    0) / players.length;

  if (avgFatigue > 30) {
    return { program: 'recovery', reason: `Średni dług zmęczeniowy składu wynosi ${avgFatigue.toFixed(0)} pkt — drużyna potrzebuje regeneracji przed startem nowego sezonu.` };
  }
  const wins  = club.stats?.wins  ?? 0;
  const draws = club.stats?.draws ?? 0;
  const losses= club.stats?.losses?? 0;
  const played = wins + draws + losses;
  const winRate = played > 0 ? wins / played : 0.5;

  if (winRate < 0.35 && avgMentality < 60) {
    return { program: 'tactical', reason: `Drużyna wygrała tylko ${Math.round(winRate * 100)}% meczów, a średnia mentality wynosi ${avgMentality.toFixed(0)}. Praca taktyczna przed nowym sezonem powinna być priorytetem.` };
  }
  if (avgStamina < 58) {
    return { program: 'fitness', reason: `Średnia stamina składu to ${avgStamina.toFixed(0)} — baza kondycyjna jest zbyt słaba na wymagający nowy sezon.` };
  }
  if (avgTechnique < 55) {
    return { program: 'technical', reason: `Średnia technika składu to ${avgTechnique.toFixed(0)}. Praca nad techniką przełoży się na jakość gry w nadchodzącym sezonie.` };
  }
  if (avgStrength < 55) {
    return { program: 'strength', reason: `Średnia siła składu to ${avgStrength.toFixed(0)} — warto zadbać o przygotowanie motoryczne przed startem sezonu.` };
  }
  return { program: 'fitness', reason: `Skład prezentuje się wyrównanie. Trening kondycyjny to solidna inwestycja w przygotowanie do nowego sezonu.` };
}
