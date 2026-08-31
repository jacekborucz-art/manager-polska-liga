import assert from 'node:assert/strict';
import {
  CompetitionType,
  HealthStatus,
  MatchStatus,
  PlayerPosition,
  Region,
  type Club,
  type Fixture,
  type Lineup,
  type MatchContext,
  type Player,
  type PlayerAttributes,
  type TacticalInstructions,
} from '../types';
import { STATIC_CLUBS } from '../constants';
import { TacticRepository } from '../resources/tactics_db';
import { PolishCupDrawService } from '../services/PolishCupDrawService';
import { CupShadowAuditService, type CupShadowAuditCase } from '../services/match/adapters/cupV2';
import { clamp, seededRandom } from '../services/match/engines/cupV2';

const ATTRIBUTE_KEYS: Array<keyof PlayerAttributes> = [
  'strength',
  'stamina',
  'pace',
  'defending',
  'passing',
  'attacking',
  'finishing',
  'technique',
  'vision',
  'dribbling',
  'heading',
  'positioning',
  'goalkeeping',
  'freeKicks',
  'talent',
  'penalties',
  'corners',
  'aggression',
  'crossing',
  'leadership',
  'mentality',
  'workRate',
];

const DEFAULT_INSTRUCTIONS: TacticalInstructions = {
  tempo: 'NORMAL',
  mindset: 'NEUTRAL',
  intensity: 'NORMAL',
  passing: 'MIXED',
  pressing: 'NORMAL',
  counterAttack: 'NORMAL',
  marking: 'ZONE',
  lastChangeMinute: 0,
  expiryMinute: -1,
  tempoExpiry: -1,
  mindsetExpiry: -1,
  intensityExpiry: -1,
  tempoCooldown: -1,
  mindsetCooldown: -1,
  intensityCooldown: -1,
  passingCooldown: -1,
  pressingCooldown: -1,
  counterAttackCooldown: -1,
  markingCooldown: -1,
  tempoResponseFactor: 1,
  mindsetResponseFactor: 1,
  intensityResponseFactor: 1,
  passingResponseFactor: 1,
  pressingResponseFactor: 1,
  counterAttackResponseFactor: 1,
  markingResponseFactor: 1,
};

const POSITION_BOOSTS: Record<PlayerPosition, Partial<Record<keyof PlayerAttributes, number>>> = {
  [PlayerPosition.GK]: { goalkeeping: 18, positioning: 8, mentality: 5, passing: 2 },
  [PlayerPosition.DEF]: { defending: 12, positioning: 9, heading: 7, strength: 5, aggression: 3 },
  [PlayerPosition.MID]: { passing: 10, vision: 8, technique: 8, stamina: 5, workRate: 5 },
  [PlayerPosition.FWD]: { finishing: 12, attacking: 10, pace: 5, dribbling: 5, technique: 4 },
};

const stableTierQuality = (club: Club): number => {
  const tier = club.tier ?? (club.leagueId === 'L_PL_1' ? 1 : club.leagueId === 'L_PL_2' ? 2 : club.leagueId === 'L_PL_3' ? 3 : 4);
  const tierBase = tier === 1 ? 61 : tier === 2 ? 55 : tier === 3 ? 49 : 43;
  return clamp(tierBase + (club.reputation ?? 4) * 2.2, 38, 82);
};

const makeAttributes = (seed: string, position: PlayerPosition, quality: number): PlayerAttributes => {
  const attrs = {} as PlayerAttributes;
  ATTRIBUTE_KEYS.forEach((key, index) => {
    const spread = (seededRandom(seed, index, 501) - 0.5) * 15;
    const positionBoost = POSITION_BOOSTS[position][key] ?? 0;
    attrs[key] = Math.round(clamp(quality + spread + positionBoost, 12, 95));
  });

  if (position !== PlayerPosition.GK) {
    attrs.goalkeeping = Math.round(clamp(10 + seededRandom(seed, 77, 502) * 18, 8, 32));
  }

  return attrs;
};

const overallForPosition = (position: PlayerPosition, attrs: PlayerAttributes): number => {
  const keys: Record<PlayerPosition, Array<keyof PlayerAttributes>> = {
    [PlayerPosition.GK]: ['goalkeeping', 'positioning', 'mentality', 'strength'],
    [PlayerPosition.DEF]: ['defending', 'positioning', 'heading', 'strength', 'pace'],
    [PlayerPosition.MID]: ['passing', 'vision', 'technique', 'stamina', 'workRate'],
    [PlayerPosition.FWD]: ['finishing', 'attacking', 'pace', 'technique', 'positioning'],
  };
  return Math.round(keys[position].reduce((sum, key) => sum + attrs[key], 0) / keys[position].length);
};

const makePlayer = (club: Club, index: number, position: PlayerPosition): Player => {
  const seed = `${club.id}_${index}_${position}`;
  const quality = stableTierQuality(club) + (seededRandom(seed, 3, 503) - 0.5) * 4;
  const attrs = makeAttributes(seed, position, quality);

  return {
    id: `${club.id}_AUDIT_${index}`,
    firstName: 'Audit',
    lastName: `${club.shortName}_${index}`,
    age: 18 + Math.floor(seededRandom(seed, 4, 504) * 18),
    clubId: club.id,
    nationality: Region.POLAND,
    position,
    overallRating: overallForPosition(position, attrs),
    attributes: attrs,
    stats: {
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
      matchesPlayed: 8,
      minutesPlayed: 620,
      seasonalChanges: {},
      ratingHistory: [6.2, 6.5, 6.7],
    },
    health: { status: HealthStatus.HEALTHY },
    condition: Math.round(clamp(82 + seededRandom(seed, 5, 505) * 16, 65, 99)),
    suspensionMatches: 0,
    contractEndDate: '2028-06-30',
    annualSalary: 120000,
    history: [],
    boardLockoutUntil: null,
    isUntouchable: false,
    negotiationStep: 0,
    negotiationLockoutUntil: null,
    contractLockoutUntil: null,
    fatigueDebt: 0,
    form: Math.round(clamp(45 + seededRandom(seed, 6, 506) * 34, 30, 84)),
    morale: Math.round(clamp((club.morale ?? 55) + (seededRandom(seed, 7, 507) - 0.5) * 12, 25, 92)),
    isNegotiationPermanentBlocked: false,
    transferLockoutUntil: null,
    freeAgentLockoutUntil: null,
  } as Player;
};

const makeSquad = (club: Club): Player[] => {
  const positions = [
    PlayerPosition.GK,
    PlayerPosition.GK,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.FWD,
    PlayerPosition.FWD,
    PlayerPosition.FWD,
    PlayerPosition.FWD,
  ];
  return positions.map((position, index) => makePlayer(club, index, position));
};

const buildLineup = (club: Club, squad: Player[], tacticId: string): Lineup => {
  const tactic = TacticRepository.getById(tacticId);
  const used = new Set<string>();
  const take = (role: PlayerPosition): string | null => {
    const candidates = squad
      .filter(player => player.position === role && !used.has(player.id))
      .sort((a, b) => b.overallRating - a.overallRating);
    const player = candidates[0] ?? squad.filter(candidate => !used.has(candidate.id)).sort((a, b) => b.overallRating - a.overallRating)[0];
    if (!player) return null;
    used.add(player.id);
    return player.id;
  };

  return {
    clubId: club.id,
    tacticId,
    startingXI: tactic.slots.map(slot => take(slot.role)),
    bench: squad.filter(player => !used.has(player.id)).map(player => player.id),
    reserves: [],
  };
};

const getTier = (club: Club): number =>
  club.tier ?? (club.leagueId === 'L_PL_1' ? 1 : club.leagueId === 'L_PL_2' ? 2 : club.leagueId === 'L_PL_3' ? 3 : 4);

const tacticFor = (club: Club, opponent: Club, side: 'HOME' | 'AWAY'): string => {
  const qualityGap = stableTierQuality(club) - stableTierQuality(opponent);
  if (qualityGap <= -8) return side === 'HOME' ? '5-2-1-2' : '4-5-1';
  if (qualityGap >= 8) return '4-3-3';
  if (getTier(club) > getTier(opponent)) return '5-4-1';
  return seededRandom(`${club.id}_${opponent.id}_${side}`, 8, 508) > 0.5 ? '4-2-3-1' : '4-4-2';
};

const instructionsFor = (club: Club, opponent: Club, side: 'HOME' | 'AWAY'): TacticalInstructions => {
  const qualityGap = stableTierQuality(club) - stableTierQuality(opponent);
  if (qualityGap <= -8) {
    return { ...DEFAULT_INSTRUCTIONS, mindset: 'DEFENSIVE', tempo: 'NORMAL', passing: 'LONG', counterAttack: 'COUNTER', pressing: 'NORMAL' };
  }
  if (qualityGap >= 8) {
    return { ...DEFAULT_INSTRUCTIONS, mindset: 'OFFENSIVE', tempo: 'FAST', passing: 'MIXED', pressing: 'PRESSING', counterAttack: 'NORMAL' };
  }
  if (side === 'HOME') {
    return { ...DEFAULT_INSTRUCTIONS, mindset: 'NEUTRAL', tempo: 'NORMAL', passing: 'MIXED', pressing: 'PRESSING' };
  }
  return DEFAULT_INSTRUCTIONS;
};

const scenarioFor = (home: Club, away: Club, fixture: Fixture): string => {
  if (fixture.neutralVenue) return 'FINAL_NEUTRAL';
  const tierGap = getTier(home) - getTier(away);
  if (tierGap > 0) return 'LOWER_LEAGUE_HOME';
  if (stableTierQuality(home) - stableTierQuality(away) >= 6) return 'HOME_FAVORITE';
  if (stableTierQuality(away) - stableTierQuality(home) >= 6) return 'AWAY_FAVORITE';
  return 'EQUAL';
};

const makeCases = (): CupShadowAuditCase[] => {
  const activeClubs = STATIC_CLUBS.filter(club => club.isDefaultActive && club.leagueId !== 'NONE');
  const clubById = new Map(activeClubs.map(club => [club.id, { ...club, morale: 48 + (club.reputation ?? 4) * 4 }]));
  const participants = PolishCupDrawService.getInitialParticipants(activeClubs);
  const drawDates = [
    new Date('2026-08-16T18:00:00'),
    new Date('2026-09-20T18:00:00'),
    new Date('2026-10-18T18:00:00'),
    new Date('2026-11-15T18:00:00'),
  ];

  return drawDates.flatMap((date, drawIndex) => {
    const fixtures = PolishCupDrawService.drawPairs(participants, activeClubs, date, '1/64', 7600 + drawIndex);
    return fixtures.slice(0, 64).map((fixture, fixtureIndex) => {
      const home = clubById.get(fixture.homeTeamId);
      const away = clubById.get(fixture.awayTeamId);
      assert.ok(home, `Brak gospodarza dla ${fixture.homeTeamId}`);
      assert.ok(away, `Brak gościa dla ${fixture.awayTeamId}`);

      const homeSquad = makeSquad(home);
      const awaySquad = makeSquad(away);
      const homeLineup = buildLineup(home, homeSquad, tacticFor(home, away, 'HOME'));
      const awayLineup = buildLineup(away, awaySquad, tacticFor(away, home, 'AWAY'));
      const ctx: MatchContext = {
        fixture,
        homeClub: home,
        awayClub: away,
        homePlayers: homeSquad,
        awayPlayers: awaySquad,
        homeAdvantage: true,
        competition: CompetitionType.POLISH_CUP,
      };

      return {
        id: `real_cup_shadow_${drawIndex}_${fixtureIndex}`,
        label: `${home.name} - ${away.name}`,
        scenario: scenarioFor(home, away, fixture),
        ctx,
        homeLineup,
        awayLineup,
        homeInstructions: instructionsFor(home, away, 'HOME'),
        awayInstructions: instructionsFor(away, home, 'AWAY'),
        userSide: 'HOME',
      };
    });
  });
};

const auditCases = makeCases();
const audit = CupShadowAuditService.run(auditCases);

console.table([audit.summary]);
console.table(audit.byScenario.map(row => ({
  scenario: row.scenario,
  matches: row.matches,
  shots: row.avgTotalShots,
  onTarget: row.avgTotalShotsOnTarget,
  goals: row.avgTotalGoals,
  xG: row.avgTotalXg,
  corners: row.avgTotalCorners,
  offsides: row.avgTotalOffsides,
  yellows: row.avgTotalYellowCards,
  lowShotPct: row.lowShotShare,
  hockeyPct: row.hockeyScoreShare,
  highOffsidePct: row.highOffsideShare,
  favWinPct: row.favoriteWinShare,
})));

if (audit.anomalies.length > 0) {
  console.table(audit.anomalies.slice(0, 20));
}

// The active datapack controls how many valid cup participants exist. The old
// fixed value (256) made the audit fail after legitimate database updates even
// though every generated case was simulated correctly.
assert.ok(auditCases.length >= 100, `Za mała próba audytu: ${auditCases.length}`);
assert.equal(audit.summary.matches, auditCases.length);
assert.ok(audit.summary.avgTotalShots >= 12, `Za mało strzałów średnio: ${audit.summary.avgTotalShots}`);
assert.ok(audit.summary.avgTotalShots <= 30, `Za dużo strzałów średnio: ${audit.summary.avgTotalShots}`);
assert.ok(audit.summary.avgTotalShotsOnTarget >= 4, `Za mało celnych średnio: ${audit.summary.avgTotalShotsOnTarget}`);
assert.ok(audit.summary.avgTotalShotsOnTarget <= 14, `Za dużo celnych średnio: ${audit.summary.avgTotalShotsOnTarget}`);
assert.ok(audit.summary.avgTotalGoals >= 1.2, `Za mało goli średnio: ${audit.summary.avgTotalGoals}`);
assert.ok(audit.summary.avgTotalGoals <= 3.6, `Za dużo goli średnio: ${audit.summary.avgTotalGoals}`);
assert.ok(audit.summary.avgTotalOffsides <= 4, `Za dużo spalonych średnio: ${audit.summary.avgTotalOffsides}`);
assert.ok(audit.summary.lowShotShare <= 8, `Za dużo meczów z martwą ofensywą: ${audit.summary.lowShotShare}%`);
assert.ok(audit.summary.hockeyScoreShare <= 1, `Za dużo wyników hokejowych: ${audit.summary.hockeyScoreShare}%`);
assert.ok(audit.summary.highOffsideShare <= 2, `Za dużo meczów z absurdalnymi spalonymi: ${audit.summary.highOffsideShare}%`);
assert.ok((audit.summary.favoriteWinShare ?? 0) >= 48, `Faworyci wygrywają za rzadko: ${audit.summary.favoriteWinShare}%`);
assert.ok(audit.summary.anomalyCount <= 12, `Za dużo anomalii w audycie: ${audit.summary.anomalyCount}`);

console.log('CupMatchEngineV2ShadowAuditTests: OK');
