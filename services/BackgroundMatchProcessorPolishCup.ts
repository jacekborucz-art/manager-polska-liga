import { Fixture, Club, Player, MatchStatus, Lineup, CompetitionType, HealthStatus, InjurySeverity, MatchCardEntry, MatchEventType, MatchGoalEntry, MatchInjuryEntry, MatchSubstitutionEntry, PlayerPosition, PlayerStats, Referee } from '../types';
import { PolandWeatherService } from './PolandWeatherService';
import { PlayerStatsService } from './PlayerStatsService';
import { AiMatchPreparationService } from './AiMatchPreparationService';
import { MatchHistoryService } from './MatchHistoryService';
import { GoalAttributionService } from './GoalAttributionService';
import { TacticRepository } from '../resources/tactics_db';
import { RefereeService } from './RefereeService';
import { rollInjuryBySeverity } from './InjuryCatalog';
import { KitSelectionService } from './KitSelectionService';
import { PolishCupVenueService } from './PolishCupVenueService';
// ============================================================
//  WBUDOWANY SILNIK PUCHAROWY — symulacja minuta po minucie
//  Zastępuje wywołanie LeagueBackgroundMatchEngine.simulate()
// ============================================================

interface CupMatchResult {
  homeScore: number;
  awayScore: number;
  scorers: { playerId: string; assistId?: string; minute: number; isPenalty: boolean }[];
  cards: { playerId: string; type: MatchEventType; minute: number }[];
  injuries: { playerId: string; minute: number; severity: InjurySeverity; days: number; type: string }[];
  substitutions: MatchSubstitutionEntry[];
  fatigue: Record<string, number>;
  fatigueDebtMap: Record<string, number>;
  penaltyHome?: number;
  penaltyAway?: number;
  wentToExtraTime: boolean;
  referee: Referee;
}

const formatPlayerReportName = (player: Pick<Player, 'firstName' | 'lastName'>): string => {
  const lastName = player.lastName.trim();
  return lastName ? `${player.firstName.charAt(0)}. ${lastName}` : player.firstName;
};

const simulateCupMatch = (
  home: Club,
  away: Club,
  hPlayers: Player[],
  aPlayers: Player[],
  hLineup: Lineup,
  aLineup: Lineup,
  seed: number,
  weatherEqualizer: number,
  isNeutralVenue: boolean
): CupMatchResult => {

  // ── SEEDED RNG ──────────────────────────────────────────────
  let rngState = ((seed ^ 0xdeadbeef) >>> 0) || 1;
  const rng = () => {
    rngState = (rngState * 1664525 + 1013904223) & 0xffffffff;
    return (rngState >>> 0) / 0xffffffff;
  };

  // Losowanie sędziego na mecz
  const referee: Referee = RefereeService.assignPolishReferee(`${home.id}_${away.id}_${seed}`, 3); // 3 = ważność meczu

  // ── POMOCNICZE STRUKTURY ────────────────────────────────────
  const scorers: CupMatchResult['scorers'] = [];
  const cards: CupMatchResult['cards'] = [];
  const injuries: CupMatchResult['injuries'] = [];
  const substitutions: MatchSubstitutionEntry[] = [];
  const fatigue: Record<string, number> = {};
  const fatigueDebtMap: Record<string, number> = {};

  // Aktywne składy (mutable — zmienia się po czerwonych kartkach)
  let homeXI: (string | null)[] = [...hLineup.startingXI];
  let awayXI: (string | null)[] = [...aLineup.startingXI];

  // Liczniki czerwonych kartek (wpływają na XG na bieżąco)
  let homeRedCount = 0;
  let awayRedCount = 0;

  // Liczniki goli (do nasycenia)
  let homeGoals = 0;
  let awayGoals = 0;

  // Zbiór użytych minut goli (unikamy duplikatów)
  const usedGoalMinutes = new Set<number>();

  // ── SIŁA DRUŻYN ─────────────────────────────────────────────
  const getTeamStrength = (players: Player[], xi: (string | null)[]) => {
    const active = players.filter(p => xi.includes(p.id));
    if (active.length === 0) return { att: 40, def: 40, gk: 40, overall: 40 };
    const att = active.reduce((s, p) => s + (p.attributes.attacking + p.attributes.finishing + p.attributes.passing) / 3, 0) / active.length;
    const def = active.reduce((s, p) => s + (p.attributes.defending + p.attributes.stamina) / 2, 0) / active.length;
    const gkPlayer = players.find(p => p.id === xi[0]);
    const gk = gkPlayer?.attributes.goalkeeping || 40;
    const overall = (att + def + gk) / 3;
    return { att, def, gk, overall };
  };

  // ── REPUTACJA I TAKTYKA ─────────────────────────────────────
  const hTactic = TacticRepository.getById(hLineup.tacticId);
  const aTactic = TacticRepository.getById(aLineup.tacticId);
  // Bonus za własne boisko: ~0.2 gola na mecz = 0.002/min (naukowe badania: ok. 0.15-0.25 gola)
  const homeAdvantageBonus = isNeutralVenue ? 0 : 0.0022;

  // ── DZIENNA FORMA (losowa) ───────────────────────────────────
  const homeDailyForm = (rng() - 0.5) * 0.3; // -0.15 do +0.15
  const awayDailyForm = (rng() - 0.5) * 0.3;


// ── MNOŻNIK CZERWONYCH KARTEK ────────────────────────────────
  const redCardMultiplier = (redCount: number): number => {
    if (redCount === 0) return 1.0;
    if (redCount === 1) return 0.60; // drużyna w 10 nadal strzela, tylko rzadziej
    if (redCount === 2) return 0.34;
    return 0.18;
  };

  // ── FUNKCJA: OBLICZ XG PER MINUTA ───────────────────────────
  // Formuła MULTIPLIKATYWNA — klasa drużyny jest mnożnikiem, nie dodatkiem.
  // Dzięki temu duże różnice klas (Ekstraklasa vs IV liga) realnie dominują wynik.
  const computeMinuteXG = () => {
    const hStr = getTeamStrength(hPlayers, homeXI);
    const aStr = getTeamStrength(aPlayers, awayXI);

    // Baza XG dla równych drużyn: ~0.014/min → 1.26 gola × 2 drużyny ≈ 2.5 gole w meczu
    const baseXG = 0.014;
    const ATTR_FLOOR = 20; // dolny próg atrybutów — unikamy dzielenia przez bliskie zeru wartości

    // ── Stosunek sił (atak atakującego vs obrona przeciwnika) ──
    // homeAttEff > 1  → home atakuje lepiej niż away broni (korzyść dla home)
    // homeAttEff < 1  → home atakuje gorzej niż away broni (kara dla home)
    const homeAttEff = Math.max(ATTR_FLOOR, hStr.att) / Math.max(ATTR_FLOOR, aStr.def);
    const awayAttEff = Math.max(ATTR_FLOOR, aStr.att) / Math.max(ATTR_FLOOR, hStr.def);
    const avgAttEff = (homeAttEff + awayAttEff) / 2;

    // Normalizacja + potęgowanie (exp=1.5 wzmacnia różnicę klas bez przesady)
    // Przy równych drużynach: homeStrMult = awayStrMult = 1.0
    // Ekstraklasa att=65 def=62 vs Tier4 att=38 def=38 → home ~1.8×, away ~0.38×
    const homeStrMult = Math.pow((homeAttEff / avgAttEff), 1.5);
    const awayStrMult = Math.pow((awayAttEff / avgAttEff), 1.5);

    // ── Mnożnik reputacji — różnica klas (Tier1 vs Tier4) ──────
    // Skalę reputacji mają polskie kluby 2-10, więc używamy stosunku, nie różnicy
    // pow(4, 0.3) ≈ 1.52 — Legia (rep=10) vs Tier4 (rep=2) daje ~1.5× bonus dla Legii
    const REP_FLOOR = 1;
    const repRatio = Math.pow(
      Math.max(REP_FLOOR, home.reputation) / Math.max(REP_FLOOR, away.reputation),
      0.3
    );

    // ── Taktyka (małe korekty addytywne) ───────────────────────
    const homeTacticBonus = (hTactic.attackBias - 50) / 5000;
    const awayTacticBonus = (aTactic.attackBias - 50) / 5000;

    // ── Łączone XG bazowe (multiplikatywne siła × reputacja + addytywne detale) ──
    // homeAdvantageBonus jest addytywny: ~0.0022/min ≈ +0.2 gola przez 90 min
    const homeXGBase = baseXG * homeStrMult * repRatio
      + homeTacticBonus + homeAdvantageBonus + homeDailyForm * 0.002;
    const awayXGBase = baseXG * awayStrMult / repRatio
      + awayTacticBonus + awayDailyForm * 0.002;

    // ── Kara za czerwone kartki ─────────────────────────────────
    const homeXGAfterRed = homeXGBase * redCardMultiplier(homeRedCount) * (1 + awayRedCount * 0.28);
    const awayXGAfterRed = awayXGBase * redCardMultiplier(awayRedCount) * (1 + homeRedCount * 0.28);

    // ── Pogoda (zła pogoda wyrównuje nieco szanse — chaos terenu) ──
    const homeXGWeather = homeXGAfterRed * weatherEqualizer;
    const awayXGWeather = awayXGAfterRed * weatherEqualizer;

    return {
      home: Math.max(0.003, homeXGWeather),
      away: Math.max(0.003, awayXGWeather)
    };
  };

  // ── FUNKCJA: WSPÓŁCZYNNIK CHAOSU ─────────────────────────────
  // equalness 1.0 = zespoły równe  → chaos losowy [10%–20%]
  // equalness 0.0 = duża różnica klas → chaos losowy [2%–10%]
  // Próg DIFF_MAX = 25 pkt (T1 overall ≈64, T4 overall ≈39 → diff ≈ 25)
  const getChaosChance = () => {
    const hStr = getTeamStrength(hPlayers, homeXI);
    const aStr = getTeamStrength(aPlayers, awayXI);
    const strengthDiff = Math.abs(hStr.overall - aStr.overall);
    const DIFF_MAX = 25;
    // equalness: 1.0 przy diff=0 (równe), 0.0 przy diff≥DIFF_MAX (nierówne)
    const equalness = Math.max(0, 1 - strengthDiff / DIFF_MAX);
    // Zakres [min, max] rośnie proporcjonalnie do wyrównania sił
    const minChaos = 0.02 + equalness * 0.08; // 2%  → 10%
    const maxChaos = 0.10 + equalness * 0.10; // 10% → 20%
        return (minChaos + rng() * (maxChaos - minChaos)) * experienceFactor;
  };

    // Wpływ doświadczenia sędziego na chaos (im mniej doświadczony, tym większy chaos)
    const experienceFactor = 1 + (50 - (referee.experience || 50)) / 100; // domyślnie 1.0

  // ── FUNKCJA: NASYCENIE ───────────────────────────────────────
  // Po 3 bramkach w meczu stopniowy spadek szansy na kolejną
  const getSaturationFactor = () => {
    const totalGoals = homeGoals + awayGoals;
    if (totalGoals <= 3) return 1.0;
    if (totalGoals === 4) return 0.60;
    if (totalGoals === 5) return 0.40;
    if (totalGoals === 6) return 0.28;
    if (totalGoals === 7) return 0.18;
    return 0.10; // 8+ goli — bardzo trudno o kolejną
  };

  // ── FUNKCJA: WYBÓR STRZELCA ──────────────────────────────────
  const pickScorer = (players: Player[], xi: (string | null)[], isHome: boolean) => {
    const activeIds = xi.filter(id => id !== null) as string[];
    return GoalAttributionService.pickScorer(players, activeIds, false, rng);
  };

  const pickAssistant = (players: Player[], xi: (string | null)[], scorerId: string) => {
    const activeIds = xi.filter(id => id !== null) as string[];
    return GoalAttributionService.pickAssistant(players, activeIds, scorerId, false, rng);
  };

  // ── FUNKCJA: LOSOWANIE KARTKI ────────────────────────────────
  const maybeGiveCard = (minute: number) => {
    // Szansa na żółtą kartkę w danej minucie ~0.8% na drużynę
     // Szanse na kartki zależne od sędziego
    const strictnessFactor = 1 + (referee.strictness - 50) / 100; // 0.5–1.5
    const decisionFactor = 1 + (referee.consistency - 50) / 200; // 0.75–1.25

    const YELLOW_CHANCE = 0.008 * strictnessFactor * decisionFactor;
    const RED_DIRECT_CHANCE = 0.001 * strictnessFactor * decisionFactor;

    for (const [side, xi, players] of [
      ['HOME', homeXI, hPlayers],
      ['AWAY', awayXI, aPlayers]
    ] as ['HOME' | 'AWAY', (string | null)[], Player[]][]) {
      const activeIds = xi.filter(id => id !== null) as string[];
      if (activeIds.length === 0) continue;

      if (rng() < RED_DIRECT_CHANCE) {
        // Bezpośrednia czerwona
        const victimId = activeIds[Math.floor(rng() * activeIds.length)];
        cards.push({ playerId: victimId, type: MatchEventType.RED_CARD, minute });

        // Usuń zawodnika ze składu
        if (side === 'HOME') {
          homeXI = homeXI.map(id => id === victimId ? null : id);
          homeRedCount++;
        } else {
          awayXI = awayXI.map(id => id === victimId ? null : id);
          awayRedCount++;
        }
      } else if (rng() < YELLOW_CHANCE) {
        const victimId = activeIds[Math.floor(rng() * activeIds.length)];

        // Sprawdź czy to już druga żółta
        const existingYellows = cards.filter(c =>
          c.playerId === victimId && c.type === MatchEventType.YELLOW_CARD
        ).length;

        cards.push({ playerId: victimId, type: MatchEventType.YELLOW_CARD, minute });

        if (existingYellows >= 1) {
          // Druga żółta = czerwona
          cards.push({ playerId: victimId, type: MatchEventType.RED_CARD, minute });
          if (side === 'HOME') {
            homeXI = homeXI.map(id => id === victimId ? null : id);
            homeRedCount++;
          } else {
            awayXI = awayXI.map(id => id === victimId ? null : id);
            awayRedCount++;
          }
        }
      }
    }
  };

  // ── FUNKCJA: LOSOWANIE KONTUZJI ──────────────────────────────
  const maybeGiveInjury = (minute: number) => {
        // Im mniej doświadczony sędzia, tym większa szansa na kontuzję
    const experienceFactor = 1 + (50 - (referee.experience || 50)) / 100;
    const INJURY_CHANCE = 0.003 * experienceFactor;

    const sides: [Player[], (string | null)[]][] = [
      [hPlayers, homeXI],
      [aPlayers, awayXI]
    ];

    for (const [players, xi] of sides) {
      if (rng() < INJURY_CHANCE) {
        const activeIds = (xi as (string | null)[]).filter(id => id !== null) as string[];
        if (activeIds.length === 0) continue;
        // Nie kontuzjuj już kontuzjowanego
        const healthyIds = activeIds.filter(id => !injuries.find(inj => inj.playerId === id));
        if (healthyIds.length === 0) continue;

        const victimId = healthyIds[Math.floor(rng() * healthyIds.length)];
        const isSevere = rng() < 0.15;
        const severity = isSevere ? InjurySeverity.SEVERE : InjurySeverity.LIGHT;
        const { days, type } = rollInjuryBySeverity(severity, rng);
        injuries.push({
          playerId: victimId,
          minute,
          severity,
          days,
          type
        });
      }
    }
  };

  // ── FUNKCJA: ZMIANY ─────────────────────────────────────────
  const maybeMakeSubstitution = (minute: number) => {
    const sides: [Player[], Lineup, (string | null)[], string, (next: (string | null)[]) => void][] = [
      [hPlayers, hLineup, homeXI, home.id, next => { homeXI = next; }],
      [aPlayers, aLineup, awayXI, away.id, next => { awayXI = next; }],
    ];

    for (const [players, lineup, xi, teamId, setXi] of sides) {
      const activeIds = xi.filter((id): id is string => !!id);
      const replacement = (lineup.bench ?? [])
        .map(id => players.find(player => player.id === id))
        .filter((player): player is Player => !!player && !activeIds.includes(player.id) && player.condition >= 60)
        .sort((a, b) => b.condition - a.condition)[0];
      const outgoing = xi
        .map((id, index) => ({ id, index, player: players.find(candidate => candidate.id === id) }))
        .filter(entry => entry.index > 0 && !!entry.id && !!entry.player)
        .sort((a, b) => (a.player?.condition ?? 100) - (b.player?.condition ?? 100))[0];
      if (!replacement || !outgoing?.id || !outgoing.player) continue;

      const nextXi = [...xi];
      nextXi[outgoing.index] = replacement.id;
      setXi(nextXi);
      substitutions.push({
        playerOutId: outgoing.player.id,
        playerOutName: formatPlayerReportName(outgoing.player),
        playerInId: replacement.id,
        playerInName: formatPlayerReportName(replacement),
        minute,
        teamId,
      });
    }
  };

  // ── FUNKCJA: ZMĘCZENIE ───────────────────────────────────────
  const computeFatigue = (players: Player[], xi: (string | null)[]) => {
    xi.forEach(pId => {
      if (!pId) return;
      const p = players.find(x => x.id === pId);
      if (!p) return;
      const stamina = p.attributes.stamina || 50;
      const stamEff = Math.pow((100 - stamina) / 100, 1.2) * 10;
      let drain = 2.5 + rng() * 1.5 + stamEff * 0.5 + 1.5;
      if (p.position === PlayerPosition.GK) drain *= 0.75 + (stamina / 100) * 0.10;
      fatigue[pId] = drain;
      const gkDebtFactor = p.position === PlayerPosition.GK
        ? Math.max(0.70, Math.min(0.90, 0.75 + Math.max(0, (p.age - 27) * 0.004) - (stamina / 100) * 0.05))
        : 1;
      fatigueDebtMap[pId] = (5 + (100 - stamina) * 0.15) * gkDebtFactor;
    });
  };

  // ── SYMULACJA GŁÓWNA: 90 MINUT ───────────────────────────────
  const simulateMinutes = (fromMinute: number, toMinute: number) => {
    for (let minute = fromMinute; minute <= toMinute; minute++) {
      if (minute === 60 || minute === 75 || minute === 105) maybeMakeSubstitution(minute);

      // 1. Kartki
      maybeGiveCard(minute);

      // 2. Kontuzje
      maybeGiveInjury(minute);

      // 3. Szansa na gola
      const xg = computeMinuteXG();
      const chaos = getChaosChance();
      const saturation = getSaturationFactor();

      // Szansa HOME
      const homeChance = xg.home * saturation * (1 + (rng() < chaos ? rng() * 0.1 : 0));
      if (rng() < homeChance) {
        // Sprawdź czy minuta nie jest zajęta
        let goalMin = minute;
        while (usedGoalMinutes.has(goalMin) && goalMin <= toMinute + 5) goalMin++;
        usedGoalMinutes.add(goalMin);

        const scorer = pickScorer(hPlayers, homeXI, true);
        if (!scorer) { homeGoals++; continue; }
        const assistant = pickAssistant(hPlayers, homeXI, scorer.id);
        const isPenalty = rng() < 0.08;
        scorers.push({ playerId: scorer.id, assistId: assistant?.id, minute: goalMin, isPenalty });
        homeGoals++;
      }

      // Szansa AWAY
      const awayChance = xg.away * saturation * (1 + (rng() < chaos ? rng() * 0.1 : 0));
      if (rng() < awayChance) {
        let goalMin = minute;
        while (usedGoalMinutes.has(goalMin) && goalMin <= toMinute + 5) goalMin++;
        usedGoalMinutes.add(goalMin);

        const scorer = pickScorer(aPlayers, awayXI, false);
        if (!scorer) { awayGoals++; continue; }
        const assistant = pickAssistant(aPlayers, awayXI, scorer.id);
        const isPenalty = rng() < 0.08;
        scorers.push({ playerId: scorer.id, assistId: assistant?.id, minute: goalMin, isPenalty });
        awayGoals++;
      }
    }
  };

  // Symulacja 90 minut
  simulateMinutes(1, 90);

  // Zmęczenie po 90 minutach
  computeFatigue(hPlayers, hLineup.startingXI);
  computeFatigue(aPlayers, aLineup.startingXI);

  // ── DOGRYWKA (jeśli remis po 90') ───────────────────────────
  let wentToExtraTime = false;
  if (homeGoals === awayGoals) {
    wentToExtraTime = true;
    simulateMinutes(91, 120);
  }

  // ── KARNE (jeśli remis po dogrywce) ─────────────────────────
  let penaltyHome: number | undefined;
  let penaltyAway: number | undefined;

  if (homeGoals === awayGoals) {
    // Pełna seria 5 strzałów każda drużyna
    // Atrybut finishing strzelca vs goalkeeping bramkarza decyduje
    const simulatePenaltySeries = (
      shooters: Player[],
      shooterXI: (string | null)[],
      keeper: Player | undefined
    ): number => {
      const activeShooters = shooterXI
        .filter(id => id !== null)
        .map(id => shooters.find(p => p.id === id))
        .filter((p): p is Player => !!p)
        .slice(0, 5);

      let scored = 0;
      for (const shooter of activeShooters) {
        const finishing = shooter.attributes.finishing || 50;
        const keeperSave = keeper?.attributes.goalkeeping || 50;
        // Bazowa szansa na gola z karnego ~75%, modyfikowana atrybutami
        const penChance = 0.75 + (finishing - keeperSave) / 200;
        if (rng() < Math.min(0.95, Math.max(0.40, penChance))) {
          scored++;
        }
      }
      return scored;
    };

    const homeGK = hPlayers.find(p => p.id === homeXI[0]);
    const awayGK = aPlayers.find(p => p.id === awayXI[0]);

    penaltyHome = simulatePenaltySeries(hPlayers, homeXI, awayGK);
    penaltyAway = simulatePenaltySeries(aPlayers, awayXI, homeGK);

    // Jeśli po serii nadal remis — dogrywka jeden na jednego aż do rozstrzygnięcia
    while (penaltyHome === penaltyAway) {
      const hShooter = hPlayers.find(p => homeXI.includes(p.id) && p.position !== PlayerPosition.GK);
      const aShooter = aPlayers.find(p => awayXI.includes(p.id) && p.position !== PlayerPosition.GK);
      const hFinishing = hShooter?.attributes.finishing || 50;
      const aFinishing = aShooter?.attributes.finishing || 50;
      const hSave = awayGK?.attributes.goalkeeping || 50;
      const aSave = homeGK?.attributes.goalkeeping || 50;

      const hScored = rng() < Math.min(0.95, Math.max(0.40, 0.75 + (hFinishing - hSave) / 200));
      const aScored = rng() < Math.min(0.95, Math.max(0.40, 0.75 + (aFinishing - aSave) / 200));

      if (hScored && !aScored) penaltyHome! += 1;
      else if (!hScored && aScored) penaltyAway! += 1;
      // Jeśli oba wpadły lub oba nie — kontynuuj
    }
  }

  return {
    homeScore: homeGoals,
    awayScore: awayGoals,
    scorers,
    cards,
    injuries,
    substitutions,
    fatigue,
    fatigueDebtMap,
    penaltyHome,
    penaltyAway,
    wentToExtraTime,
    referee
  };
};

// ============================================================
//  GŁÓWNY PROCESOR — logika biznesowa pucharu
// ============================================================

export const BackgroundMatchProcessorPolishCup = {
  processCupEvent: (
    currentDate: Date,
    userTeamId: string | null,
    fixtures: Fixture[],
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    lineups: Record<string, Lineup>,
    careerSeed: number,
    seasonNumber: number
  ): {
    updatedFixtures: Fixture[],
    updatedPlayers: Record<string, Player[]>,
    updatedLineups: Record<string, Lineup>,
    updatedClubs: Club[]
  } => {

    const dateStr = currentDate.toDateString();
    const todayCupFixtures = fixtures.filter(f =>
      f.date.toDateString() === dateStr &&
      f.status === MatchStatus.SCHEDULED &&
      (f.leagueId === CompetitionType.POLISH_CUP || f.leagueId === CompetitionType.SUPER_CUP) &&
      f.homeTeamId !== userTeamId &&
      f.awayTeamId !== userTeamId
    );

    let currentFixtures = [...fixtures];
    let currentPlayers = { ...playersMap };
    let currentClubs = [...clubs];

    const newLineups = AiMatchPreparationService.prepareAllTeams(clubs, playersMap, lineups, userTeamId);

    if (todayCupFixtures.length === 0) {
      return { updatedFixtures: fixtures, updatedPlayers: playersMap, updatedLineups: newLineups, updatedClubs: currentClubs };
    }

    todayCupFixtures.forEach(fixture => {
      const home = currentClubs.find(c => c.id === fixture.homeTeamId)!;
      const away = currentClubs.find(c => c.id === fixture.awayTeamId)!;
      const hPlayers = currentPlayers[home.id] || [];
      const aPlayers = currentPlayers[away.id] || [];
      const hLineup = newLineups[home.id];
      const aLineup = newLineups[away.id];

      if (!hLineup || !aLineup) return;

      // ── SEED ───────────────────────────────────────────────
      const clubSalt = home.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const matchHash = fixture.id.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
      const seed = (matchHash ^ clubSalt) ^ (currentDate.getTime() / 1000 | 0) ^ careerSeed;

      // ── POGODA ─────────────────────────────────────────────
      const weatherSeed = `${fixture.id}_${currentDate.getTime()}`;
      const weather = PolandWeatherService.getWeather(currentDate, weatherSeed);
      const isBadWeather = weather.precipitationChance > 50 || weather.tempC < 2;
      const weatherEqualizer = isBadWeather ? 0.82 : 1.0;

      // ── NEUTRALNY TEREN ────────────────────────────────────
      const venue = PolishCupVenueService.getVenue(fixture, home);
      const isNeutralVenue = venue.isNeutral;

      // ── SYMULACJA MECZU ────────────────────────────────────
      const result = simulateCupMatch(
        home, away, hPlayers, aPlayers, hLineup, aLineup,
        seed, weatherEqualizer, isNeutralVenue
      );

      const finalHomeScore = result.homeScore;
      const finalAwayScore = result.awayScore;
      const penaltyHome = result.penaltyHome;
      const penaltyAway = result.penaltyAway;

      // ── ZAPIS DO HISTORII ──────────────────────────────────
      const allMatchPlayers = hPlayers.concat(aPlayers);
      const getPlayerName = (playerId: string): string => {
        const player = allMatchPlayers.find(candidate => candidate.id === playerId);
        return player ? formatPlayerReportName(player) : 'Nieznany';
      };
      const goals: MatchGoalEntry[] = result.scorers.map(s => {
        const player = allMatchPlayers.find(candidate => candidate.id === s.playerId);
        const assistant = s.assistId ? allMatchPlayers.find(candidate => candidate.id === s.assistId) : undefined;
        return {
          playerId: s.playerId,
          playerName: getPlayerName(s.playerId),
          minute: s.minute,
          teamId: player?.clubId ?? '?',
          isPenalty: !!s.isPenalty,
          assistantId: assistant?.id,
          assistantName: assistant ? getPlayerName(assistant.id) : undefined,
        };
      });
      const yellowCounts: Record<string, number> = {};
      const cards: MatchCardEntry[] = [];
      result.cards.forEach(card => {
        if (card.type === MatchEventType.YELLOW_CARD) {
          yellowCounts[card.playerId] = (yellowCounts[card.playerId] || 0) + 1;
          cards.push({
            playerId: card.playerId,
            playerName: getPlayerName(card.playerId),
            minute: card.minute,
            teamId: allMatchPlayers.find(candidate => candidate.id === card.playerId)?.clubId ?? '?',
            type: yellowCounts[card.playerId] === 2 ? 'SECOND_YELLOW' : 'YELLOW',
          });
          return;
        }

        const isDuplicateSecondYellow = result.cards.some(candidate =>
          candidate.playerId === card.playerId &&
          candidate.minute === card.minute &&
          candidate.type === MatchEventType.YELLOW_CARD
        );
        if (!isDuplicateSecondYellow) {
          cards.push({
            playerId: card.playerId,
            playerName: getPlayerName(card.playerId),
            minute: card.minute,
            teamId: allMatchPlayers.find(candidate => candidate.id === card.playerId)?.clubId ?? '?',
            type: 'RED',
          });
        }
      });
      const injuries: MatchInjuryEntry[] = result.injuries.map(injury => ({
        playerId: injury.playerId,
        playerName: getPlayerName(injury.playerId),
        minute: injury.minute,
        teamId: allMatchPlayers.find(candidate => candidate.id === injury.playerId)?.clubId ?? '?',
        severity: injury.severity,
        days: injury.days,
        type: injury.type,
      }));
      const allStarters = [
        ...hLineup.startingXI.filter((id): id is string => !!id),
        ...aLineup.startingXI.filter((id): id is string => !!id),
      ];
      const ratings = Object.fromEntries(allStarters.map((id, index) => [id, 6.1 + ((seed + index * 17) % 18) / 10]));
      const attendance = Math.round(venue.capacity * Math.min(0.98, 0.72 + (home.reputation + away.reputation) * 0.018));
      RefereeService.recordMatchStats(
        result.referee.id,
        RefereeService.generateMatchRating(result.referee),
        cards.filter(card => card.type === 'YELLOW' || card.type === 'SECOND_YELLOW').length,
        cards.filter(card => card.type === 'RED' || card.type === 'SECOND_YELLOW').length
      );
      MatchHistoryService.logMatch({
        matchId: fixture.id,
        date: currentDate.toDateString(),
        competition: fixture.leagueId,
        homeTeamId: home.id,
        season: seasonNumber,
        awayTeamId: away.id,
        homeScore: finalHomeScore,
        awayScore: finalAwayScore,
        homePenaltyScore: penaltyHome,
        awayPenaltyScore: penaltyAway,
        isExtraTime: result.wentToExtraTime,
        attendance,
        venue: venue.name,
        weather,
        goals,
        cards,
        substitutions: result.substitutions,
        injuries,
        timeline: [],
        refereeName: `${result.referee.firstName} ${result.referee.lastName}`,
        homeLineup: hLineup.startingXI.filter((id): id is string => !!id),
        awayLineup: aLineup.startingXI.filter((id): id is string => !!id),
        ratings,
        homeTacticId: hLineup.tacticId,
        awayTacticId: aLineup.tacticId,
        kits: KitSelectionService.selectOptimalKits(home, away),
      });

      // ── AKTUALIZACJA TERMINARZA ────────────────────────────
      currentFixtures = currentFixtures.map(f => f.id === fixture.id ? {
        ...f,
        homeScore: finalHomeScore,
        awayScore: finalAwayScore,
        homePenaltyScore: penaltyHome,
        awayPenaltyScore: penaltyAway,
        status: MatchStatus.FINISHED
      } : f);

      // ── AWANS ──────────────────────────────────────────────
      const isHomeWinner = penaltyHome !== undefined
        ? penaltyHome > penaltyAway!
        : finalHomeScore > finalAwayScore;

      currentClubs = currentClubs.map(c => {
        if (c.id === home.id) return { ...c, isInPolishCup: isHomeWinner };
        if (c.id === away.id) return { ...c, isInPolishCup: !isHomeWinner };
        return c;
      });

      // ── STATYSTYKI PUCHARU (cupStats + cupSuspensionMatches) ──────────────
      const totalMinutes = result.wentToExtraTime ? 120 : 90;
      const getMinutesPlayedMap = (lineup: Lineup, teamId: string): Record<string, number> => {
        const minutesMap = Object.fromEntries(
          lineup.startingXI.filter((id): id is string => !!id).map(id => [id, totalMinutes])
        );
        result.substitutions
          .filter(substitution => substitution.teamId === teamId)
          .sort((a, b) => a.minute - b.minute)
          .forEach(substitution => {
            const remainingMinutes = Math.max(0, totalMinutes - substitution.minute);
            if (substitution.playerOutId) {
              minutesMap[substitution.playerOutId] = Math.max(0, (minutesMap[substitution.playerOutId] ?? totalMinutes) - remainingMinutes);
            }
            if (substitution.playerInId) {
              minutesMap[substitution.playerInId] = (minutesMap[substitution.playerInId] ?? 0) + remainingMinutes;
            }
          });
        return minutesMap;
      };
      const homeMinutesPlayed = getMinutesPlayedMap(hLineup, home.id);
      const awayMinutesPlayed = getMinutesPlayedMap(aLineup, away.id);
      const emptyS = (): PlayerStats => ({ goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [] });

      for (const [cId, minutesMap] of [[home.id, homeMinutesPlayed], [away.id, awayMinutesPlayed]] as [string, Record<string, number>][]) {
        currentPlayers[cId] = currentPlayers[cId].map(p => {
          const minutesPlayed = minutesMap[p.id];
          if (minutesPlayed === undefined) return p;
          const cup = { ...(p.cupStats ?? emptyS()) };
          cup.matchesPlayed += 1;
          cup.minutesPlayed += minutesPlayed;
          return { ...p, cupStats: cup };
        });
      }
      for (const cId of [home.id, away.id]) {
        currentPlayers[cId] = currentPlayers[cId].map(p => ({
          ...p,
          cupSuspensionMatches: Math.max(0, (p.cupSuspensionMatches ?? 0) - 1)
        }));
      }
      result.scorers.forEach(s => {
        for (const cId of Object.keys(currentPlayers)) {
          currentPlayers[cId] = currentPlayers[cId].map(p => {
            if (p.id === s.playerId) return { ...p, cupStats: { ...(p.cupStats ?? emptyS()), goals: (p.cupStats?.goals ?? 0) + 1 } };
            if (s.assistId && p.id === s.assistId) return { ...p, cupStats: { ...(p.cupStats ?? emptyS()), assists: (p.cupStats?.assists ?? 0) + 1 } };
            return p;
          });
        }
      });
      result.cards.forEach(card => {
        for (const cId of Object.keys(currentPlayers)) {
          currentPlayers[cId] = currentPlayers[cId].map(p => {
            if (p.id !== card.playerId) return p;
            const cup = { ...(p.cupStats ?? emptyS()) };
            let cupSusp = p.cupSuspensionMatches ?? 0;
            if (card.type === MatchEventType.YELLOW_CARD) {
              cup.yellowCards += 1;
              if (cup.yellowCards % 4 === 0) cupSusp += 1;
            }
            if (card.type === MatchEventType.RED_CARD) {
              cup.redCards += 1;
              const isSecondYellow = result.cards.some(candidate =>
                candidate.playerId === card.playerId &&
                candidate.minute === card.minute &&
                candidate.type === MatchEventType.YELLOW_CARD
              );
              cupSusp += isSecondYellow ? 2 : 3;
            }
            return { ...p, cupStats: cup, cupSuspensionMatches: cupSusp };
          });
        }
      });

      // ── ZMĘCZENIE I KONTUZJE ───────────────────────────────
      for (const clubId of [home.id, away.id]) {
        currentPlayers[clubId] = currentPlayers[clubId].map(p => {
          let updatedP = { ...p };

          // Drenaż kondycji
          if (result.fatigue[p.id] !== undefined) {
            updatedP.condition = Math.max(0, updatedP.condition - result.fatigue[p.id]);
          }

          // Dług zmęczeniowy
          if (result.fatigueDebtMap[p.id]) {
            updatedP.fatigueDebt = Math.min(100, (updatedP.fatigueDebt || 0) + result.fatigueDebtMap[p.id]);
          }

          // Twardy cap kondycji
          const maxCap = 100 - (updatedP.fatigueDebt || 0);
          updatedP.condition = Math.min(maxCap, updatedP.condition);

          // Kontuzje
          const injury = result.injuries.find(inj => inj.playerId === p.id);
          if (injury) {
            // Losowanie długości kontuzji — używamy deterministycznego seeda
            const injSeed = (seed + p.id.charCodeAt(0)) % 15;
            const basePenalty = injury.severity === InjurySeverity.SEVERE ? 55 : 20;
            const condAfterPenalty = Math.max(0, updatedP.condition - (basePenalty + injSeed));
            updatedP.health = {
              status: HealthStatus.INJURED,
              injury: {
                type: injury.type,
                daysRemaining: injury.days,
                severity: injury.severity,
                injuryDate: currentDate.toISOString(),
                totalDays: injury.days,
                conditionAtInjury: condAfterPenalty
              }
            };
            updatedP.condition = condAfterPenalty;
          }

          return updatedP;
        });
      }
    });

    return {
      updatedFixtures: currentFixtures,
      updatedPlayers: currentPlayers,
      updatedLineups: newLineups,
      updatedClubs: currentClubs
    };
  }
};
