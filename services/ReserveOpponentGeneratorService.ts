
import { Player, PlayerPosition, Region, HealthStatus } from '../types';
import { PL_MALE_FIRSTNAMES, PL_MALE_LASTNAMES } from '../resources/static_db/names/pl_data';

// Podział 20 zawodników per mecz
const POSITION_SLOTS: { position: PlayerPosition; count: number }[] = [
  { position: PlayerPosition.GK, count: 2 },
  { position: PlayerPosition.DEF, count: 6 },
  { position: PlayerPosition.MID, count: 7 },
  { position: PlayerPosition.FWD, count: 5 },
];

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (Math.abs(s) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function generateAttr(base: number, rng: () => number, spread: number): number {
  return clamp(Math.round(base + (rng() - 0.5) * spread * 2), 1, 99);
}

export const ReserveOpponentGeneratorService = {
  generate(clubId: string, clubReputation: number, seed: number): Player[] {
    const rng = seededRng(seed);
    const players: Player[] = [];

    // Bazowy rating zależny od reputacji (1–10)
    // Reputacja 10 → base ~62, reputacja 1 → base ~30
    const baseAttr = 24 + clubReputation * 4;

    let slotIdx = 0;
    for (const { position, count } of POSITION_SLOTS) {
      for (let i = 0; i < count; i++) {
        const firstName = pick(PL_MALE_FIRSTNAMES, rng);
        const lastName = pick(PL_MALE_LASTNAMES, rng);
        const age = 17 + Math.floor(rng() * 10);

        const atk = generateAttr(baseAttr, rng, 12);
        const def = generateAttr(baseAttr, rng, 12);
        const gk = position === PlayerPosition.GK
          ? generateAttr(baseAttr + 8, rng, 10)
          : generateAttr(10, rng, 6);
        const fin = position === PlayerPosition.FWD
          ? generateAttr(baseAttr + 5, rng, 10)
          : generateAttr(baseAttr - 5, rng, 10);
        const pass = generateAttr(baseAttr, rng, 12);
        const pace = generateAttr(baseAttr, rng, 15);
        const tech = generateAttr(baseAttr, rng, 12);
        const vis = generateAttr(baseAttr, rng, 10);
        const str = generateAttr(baseAttr, rng, 12);
        const stam = generateAttr(baseAttr, rng, 10);
        const head = generateAttr(baseAttr, rng, 12);
        const pos = generateAttr(baseAttr, rng, 10);
        const drb = generateAttr(baseAttr, rng, 12);
        const fk = generateAttr(baseAttr - 10, rng, 8);
        const pen = generateAttr(baseAttr - 5, rng, 10);
        const cor = generateAttr(baseAttr - 8, rng, 8);
        const agg = generateAttr(baseAttr, rng, 15);
        const cros = generateAttr(baseAttr, rng, 12);
        const lead = generateAttr(baseAttr - 10, rng, 10);
        const ment = generateAttr(baseAttr, rng, 10);
        const work = generateAttr(baseAttr, rng, 10);
        const talent = generateAttr(40, rng, 25);

        const overall = Math.round(
          position === PlayerPosition.GK
            ? (gk * 0.5 + pos * 0.25 + str * 0.15 + ment * 0.1)
            : position === PlayerPosition.DEF
              ? (def * 0.4 + head * 0.2 + str * 0.15 + pos * 0.15 + stam * 0.1)
              : position === PlayerPosition.MID
                ? (pass * 0.25 + vis * 0.2 + tech * 0.2 + stam * 0.2 + atk * 0.15)
                : (fin * 0.35 + atk * 0.3 + pace * 0.2 + tech * 0.15)
        );

        const player: Player = {
          id: `opp_${clubId}_${seed}_${slotIdx}`,
          firstName,
          lastName,
          age,
          clubId,
          nationality: Region.POLAND,
          position,
          overallRating: clamp(overall, 1, 99),
          condition: 85 + Math.floor(rng() * 15),
          suspensionMatches: 0,
          contractEndDate: '2026-06-30',
          annualSalary: 0,
          fatigueDebt: 0,
          boardLockoutUntil: null,
          isUntouchable: false,
          negotiationStep: 0,
          negotiationLockoutUntil: null,
          contractLockoutUntil: null,
          isNegotiationPermanentBlocked: false,
          transferLockoutUntil: null,
          freeAgentLockoutUntil: null,
          history: [],
          health: { status: HealthStatus.HEALTHY },
          attributes: {
            strength: str,
            stamina: stam,
            pace,
            defending: def,
            passing: pass,
            attacking: atk,
            finishing: fin,
            technique: tech,
            vision: vis,
            dribbling: drb,
            heading: head,
            positioning: pos,
            goalkeeping: gk,
            freeKicks: fk,
            talent,
            penalties: pen,
            corners: cor,
            aggression: agg,
            crossing: cros,
            leadership: lead,
            mentality: ment,
            workRate: work,
          },
          stats: {
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 0,
            matchesPlayed: 0,
            minutesPlayed: 0,
            seasonalChanges: {},
            ratingHistory: [],
          },
        };

        players.push(player);
        slotIdx++;
      }
    }

    return players;
  },
};
