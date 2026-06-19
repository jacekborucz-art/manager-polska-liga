import { MatchLiveState, MatchContext, Player, PlayerPosition, Lineup, SubstitutionRecord, InjurySeverity, Coach } from '../types';
import { TacticRepository } from '../resources/tactics_db';
import { LineupService, FAVORITE_TACTIC_MAP } from './LineupService';
import { PlayerMoraleService } from './PlayerMoraleService';

const MAX_LEAGUE_SUBS = 5;

const DEFENSIVE_TACTICS = ['5-4-1', '4-4-2-DEF', '5-3-2', '6-3-1', '5-2-1-2', '4-5-1'];
const SOLID_DEFENSIVE_TACTICS = ['4-4-2-DEF', '5-3-2', '4-5-1', '5-2-1-2'];
const OFFENSIVE_TACTICS = ['4-4-2-OFF', '4-3-3', '3-5-2', '4-3-2-1', '4-3-3-F9', '3-4-2-1', '3-4-3'];
const DESPERATION_TACTICS = ['4-2-4'];

// [AI-COACH-CALIBRATION] FAVORITE_TACTIC_BONUS — "ulubiona taktyka to pierwszy wybór, nie nakaz".
// Gdy trener ocenia, na jaką taktykę się przestawić, kandydat zgodny z jego Coach.favoriteTactics
// (neutralna/ofensywna/defensywna — w zależności od tego, czy reaguje na przegrywanie czy na
// prowadzenie) dostaje tę premię DOLICZONĄ do zwykłej oceny "score" (fit + intencja). To NIE jest
// blokada innych taktyk — jeśli inna taktyka lepiej pasuje do zawodników na boisku, różnica w "score"
// i tak ją wybierze. Premia ma tylko przeważyć remisy/bliskie wyniki na korzyść stylu trenera.
// ZAKRES: te same funkcje liczą "score" w jednostkach zbliżonych do "punktów intencji" (patrz
// getTacticIntentScore — różnice score między kandydatami to zwykle 5-30). Premia 4 jest więc
// wyczuwalna, ale nie dominująca.
// KALIBRACJA: zwiększ, jeśli chcesz, żeby trenerzy byli bardziej "wierni" swojemu stylowi nawet przy
// gorszym dopasowaniu do składu; zmniejsz/wyzeruj, jeśli wolisz, żeby o wyborze decydowało wyłącznie
// dopasowanie do obecnych zawodników i sytuacji meczowej.
const FAVORITE_TACTIC_BONUS = 4;

// [AI-COACH-CALIBRATION] getFavoriteTacticBonus — mapuje scoreDiff na to, KTÓRA z 3 ulubionych
// taktyk trenera (offensive/neutral/defensive) jest "aktywna" w danej sytuacji:
//   scoreDiff < 0  (przegrywamy)   -> ulubiona taktyka OFENSYWNA trenera
//   scoreDiff > 0  (wygrywamy)     -> ulubiona taktyka DEFENSYWNA trenera (chce dowieźć wynik)
//   scoreDiff === 0 (remis)        -> ulubiona taktyka NEUTRALNA trenera
// Korzysta z TEGO SAMEGO FAVORITE_TACTIC_MAP, co przedmeczowy wybór składu w LineupService —
// jeśli trener "woli" np. '3-4-3', to ten sam '3-4-3' dostanie premię i przed, i w trakcie meczu.
const getFavoriteTacticBonus = (tacticId: string, coach: Coach | null | undefined, scoreDiff: number): number => {
  if (!coach?.favoriteTactics) return 0;
  const favoriteName = scoreDiff < 0
    ? coach.favoriteTactics.offensive
    : scoreDiff > 0
      ? coach.favoriteTactics.defensive
      : coach.favoriteTactics.neutral;
  const favoriteTacticId = FAVORITE_TACTIC_MAP[favoriteName];
  return favoriteTacticId === tacticId ? FAVORITE_TACTIC_BONUS : 0;
};

type AiLateMatchContext = {
  aiStakes?: 'TITLE_RACE' | 'EUROPE_RACE' | 'RELEGATION_FIGHT' | 'MID_TABLE' | 'LOW_STAKES';
  userStakes?: 'TITLE_RACE' | 'EUROPE_RACE' | 'RELEGATION_FIGHT' | 'MID_TABLE' | 'LOW_STAKES';
  aiRank?: number;
  userRank?: number;
  isLateSeason?: boolean;
  rivalryMultiplier?: number;
};

type AiDecisionResult = {
  newLineup?: Lineup;
  newSubsCount?: number;
  subRecord?: SubstitutionRecord;
  newTacticId?: string;
  lastAiActionMinute?: number;
  lastAiSubMinute?: number;
  lastAiFormationMinute?: number;
  aiTacticLocked?: boolean;
  aiTacticLockUntilMinute?: number;
  aiLateTacticChanges?: number;
  aiLateTacticScoreDiffAtLastChange?: number;
  logs: string[];
};

const getCoachQuality = (coach: Coach | null | undefined): number => {
  if (!coach) return 50;
  return (coach.attributes.experience * 0.48) + (coach.attributes.decisionMaking * 0.52);
};

const getStakesWeight = (stakes?: AiLateMatchContext['aiStakes']): number => {
  if (stakes === 'TITLE_RACE') return 1.0;
  if (stakes === 'RELEGATION_FIGHT') return 1.15;
  if (stakes === 'EUROPE_RACE') return 0.78;
  if (stakes === 'LOW_STAKES') return 0.16;
  return 0.42;
};

const getPlayer = (players: Player[], id: string | null): Player | null => {
  if (!id) return null;
  return players.find(p => p.id === id) ?? null;
};

const getReadinessOverall = (player: Player): number =>
  PlayerMoraleService.getEffectiveOverall(PlayerMoraleService.ensurePlayerState(player));

const getReadinessMultiplier = (player: Player): number =>
  PlayerMoraleService.getLineupReadinessMultiplier(PlayerMoraleService.ensurePlayerState(player));

// [AI-COACH-CALIBRATION] getEmergencyFieldScore — ocena, jak dobrze dany zawodnik nadaje się do roli `role`.
// PARAMETR useSecondaryPositions (domyślnie false = zachowanie 1:1 jak przed zmianą, żeby nic poza
// nowym mechanizmem zmiany taktyki nie zmieniło swojego zachowania):
//   - false: ocena liczona wyłącznie na podstawie pozycji głównej zawodnika (player.position).
//   - true:  jeśli zawodnik ma wpisaną pozycję pomocniczą (player.secondaryPositionRating) zgodną
//            z `role`, dostaje dodatkowy bonus z PlayerPositionFitService.getFitScoreBonus (patrz
//            LineupService.calculateFitScore). Bez tego AI przy przebudowie składu pod nową taktykę
//            ignorowało fakt, że np. pomocnik ma realny atrybut gry na skrzydle ataku — i traktowało
//            go tak samo źle, jak zawodnika bez żadnych predyspozycji do tej pozycji.
// KALIBRACJA: siła bonusu za pozycję pomocniczą NIE jest tu — jest w PlayerPositionFitService
// (getFitScoreBonus/getPenaltyFactor), żeby był jeden, wspólny punkt prawdy dla całej gry (AI i silnik
// meczu liczą to tak samo). Zmieniaj tam, nie tutaj.
const getEmergencyFieldScore = (player: Player, role: PlayerPosition, useSecondaryPositions: boolean = false): number => {
  if (player.position !== PlayerPosition.GK) return LineupService.calculateFitScore(player, role, { useSecondaryPositions });
  if (role === PlayerPosition.GK) return LineupService.calculateFitScore(player, role, { useSecondaryPositions });
  return (
    player.overallRating * 0.35 +
    player.attributes.positioning * 0.25 +
    player.attributes.strength * 0.2 +
    player.attributes.mentality * 0.2
  ) * getReadinessMultiplier(player);
};

// [AI-COACH-CALIBRATION] getLineupFitScore — suma dopasowania całego składu do danej taktyki.
// `useSecondaryPositions` przekazywane dalej do getEmergencyFieldScore — patrz komentarz wyżej.
const getLineupFitScore = (lineupIds: (string | null)[], tacticId: string, players: Player[], useSecondaryPositions: boolean = false): number => {
  const tactic = TacticRepository.getById(tacticId);
  return tactic.slots.reduce((sum, slot) => {
    const player = getPlayer(players, lineupIds[slot.index]);
    if (!player) return sum - 750;
    return sum + getEmergencyFieldScore(player, slot.role, useSecondaryPositions);
  }, 0);
};

const pickBestFieldPlayerForGoal = (lineup: Lineup, players: Player[]): { player: Player; index: number } | null => {
  const candidates = lineup.startingXI
    .map((id, index) => ({ id, index, player: getPlayer(players, id) }))
    .filter((entry): entry is { id: string; index: number; player: Player } => entry.index !== 0 && !!entry.player)
    .sort((a, b) => {
      const scoreA = (a.player.attributes.positioning + a.player.attributes.strength + a.player.attributes.mentality * 0.6) * getReadinessMultiplier(a.player);
      const scoreB = (b.player.attributes.positioning + b.player.attributes.strength + b.player.attributes.mentality * 0.6) * getReadinessMultiplier(b.player);
      return scoreB - scoreA;
    });
  return candidates.length > 0 ? { player: candidates[0].player, index: candidates[0].index } : null;
};

const getAvailableBench = (lineup: Lineup, players: Player[], subsHistory: SubstitutionRecord[]): Player[] => {
  const outIds = new Set(subsHistory.map(s => s.playerOutId));
  const inIds = new Set(subsHistory.map(s => s.playerInId));
  return lineup.bench
    .map(id => players.find(p => p.id === id))
    .filter((p): p is Player => !!p && !outIds.has(p.id) && !inIds.has(p.id));
};

const buildDirectSubLineup = (lineup: Lineup, injuredId: string, sub: Player, slotIdx: number): Lineup => {
  const nextLineup = {
    ...lineup,
    startingXI: [...lineup.startingXI],
    bench: lineup.bench.filter(id => id !== sub.id && id !== injuredId),
    reserves: [...lineup.reserves]
  };

  nextLineup.startingXI[slotIdx] = sub.id;
  if (!nextLineup.reserves.includes(injuredId)) nextLineup.reserves.push(injuredId);
  return nextLineup;
};

const chooseNoBenchGoalkeeperResponse = (
  lineup: Lineup,
  players: Player[],
  injuredGoalkeeperId: string,
  subsHistory: SubstitutionRecord[]
): { lineup: Lineup; sub: Player; fieldCover: Player } | null => {
  const fieldCover = pickBestFieldPlayerForGoal(lineup, players);
  if (!fieldCover) return null;

  const tactic = TacticRepository.getById(lineup.tacticId);
  const fieldRole = tactic.slots[fieldCover.index]?.role ?? PlayerPosition.MID;
  const benchPool = getAvailableBench(lineup, players, subsHistory).filter(p => p.position !== PlayerPosition.GK);
  if (benchPool.length === 0) return null;

  const bestFieldSub = [...benchPool].sort((a, b) => getEmergencyFieldScore(b, fieldRole) - getEmergencyFieldScore(a, fieldRole))[0];
  if (!bestFieldSub) return null;

  const nextLineup: Lineup = {
    ...lineup,
    startingXI: [...lineup.startingXI],
    bench: lineup.bench.filter(id => id !== bestFieldSub.id && id !== injuredGoalkeeperId),
    reserves: lineup.reserves.includes(injuredGoalkeeperId) ? [...lineup.reserves] : [...lineup.reserves, injuredGoalkeeperId]
  };

  nextLineup.startingXI[0] = fieldCover.player.id;
  nextLineup.startingXI[fieldCover.index] = bestFieldSub.id;
  return { lineup: nextLineup, sub: bestFieldSub, fieldCover: fieldCover.player };
};

// [AI-COACH-CALIBRATION] assignPlayersToTactic — TO JEST SERCE NAPRAWY BŁĘDU "remapowania składu".
// Dostaje listę ID zawodników obecnie na boisku (candidateIds) i NOWĄ taktykę (tacticId), a zwraca
// nowy układ startingXI, w którym każde miejsce (slot) dostało najlepiej dopasowanego z dostępnych
// zawodników. Funkcja istniała już wcześniej i była używana do SAMEJ OCENY (czy warto zmienić
// taktykę), ale wynik tej oceny był odrzucany — w 6 miejscach w tym pliku AI zmieniało `tacticId`
// nigdy nie wywołując tej funkcji do faktycznego przesunięcia zawodników. Efekt: pomocnik stojący
// na miejscu nr 7 w 4-4-2 (rola MID) zostawał na tym samym miejscu po zmianie na 4-2-4, gdzie
// miejsce nr 7 to już rola FWD — i silnik meczu czytał go jako napastnika, mimo że nikt go tam
// nie "wstawił". Stąd kara za grę nie na swojej pozycji bez żadnej faktycznej zmiany personalnej.
// Od teraz KAŻDA zmiana taktyki w tym pliku MUSI iść przez applyTacticReassignment (patrz niżej),
// które wywołuje tę funkcję i synchronizuje startingXI z nowym tacticId.
// PARAMETR useSecondaryPositions: patrz komentarz przy getEmergencyFieldScore — przy przebudowie
// składu pod nową taktykę chcemy wiedzieć, że np. pomocnik z dobrym atrybutem gry na skrzydle ataku
// jest realną opcją na FWD, a nie tylko "najmniej złym z najgorszych".
// PARAMETR lockSlotZeroId (opcjonalny): używany WYŁĄCZNIE w sytuacjach awaryjnych, gdy zawodnik z
// pola już został wcześniej "wstawiony" do bramki (bo nie ma bramkarza na ławce ani w składzie) —
// chcemy przebudować pozostałe 10 miejsc pod nową taktykę, ale NIE pozwolić funkcji jeszcze raz
// "wybrać", kto stoi w bramce (inna formuła oceny w tej funkcji niż ta, która już wybrała tego
// zawodnika w pickBestFieldPlayerForGoal, mogłaby wybrać kogoś innego — niespójność bez sensu).
const assignPlayersToTactic = (candidateIds: string[], tacticId: string, players: Player[], useSecondaryPositions: boolean = false, lockSlotZeroId?: string): (string | null)[] | null => {
  const tactic = TacticRepository.getById(tacticId);
  const remaining = new Set(candidateIds);
  const lineup: (string | null)[] = new Array(11).fill(null);

  if (lockSlotZeroId && remaining.has(lockSlotZeroId)) {
    lineup[0] = lockSlotZeroId;
    remaining.delete(lockSlotZeroId);
  }

  for (const slot of tactic.slots) {
    if (lineup[slot.index] !== null) continue; // miejsce już obsadzone przez lockSlotZeroId

    const pool = Array.from(remaining)
      .map(id => players.find(p => p.id === id))
      .filter((p): p is Player => !!p);

    // [AI-COACH-FIX] continue (było: return null) — gdy zespół gra w osłabieniu (czerwona kartka),
    // candidateIds ma MNIEJ niż 11 nazwisk, a tactic.slots nowej taktyki wciąż ma 11 miejsc. Stare
    // "return null" przerywało WHOLE przebudowę składu w takiej sytuacji (applyTacticReassignment
    // wtedy po prostu nic nie robił — zero korzyści ze zmiany taktyki po czerwonej kartce!). Teraz
    // brakujące miejsce zostaje po prostu puste (null) i przebudowa idzie dalej. Każda taktyka w
    // tactics_db.ts ma sloty w kolejności GK -> DEF -> MID -> FWD, więc przy niedoborze 1 zawodnika
    // to ZAWSZE ostatni (napastnik) slot zostaje pusty — co jest dokładnie tym, czego chcemy (boisko
    // "oddaje" w ataku, nie w obronie, gdy gramy w 10).
    if (pool.length === 0) continue;

    const samePosition = pool.filter(p => p.position === slot.role);
    const selectable = samePosition.length > 0
      ? samePosition
      : slot.role === PlayerPosition.GK
        ? pool.filter(p => p.position !== PlayerPosition.GK)
        : slot.role === PlayerPosition.MID
          ? (pool.filter(p => p.position === PlayerPosition.DEF).length > 0
              ? pool.filter(p => p.position === PlayerPosition.DEF)
              : pool.filter(p => p.position !== PlayerPosition.GK))
          : slot.role === PlayerPosition.FWD
            ? (pool.filter(p => p.position === PlayerPosition.MID).length > 0
                ? pool.filter(p => p.position === PlayerPosition.MID)
                : pool.filter(p => p.position !== PlayerPosition.GK))
            : (pool.filter(p => p.position === PlayerPosition.MID).length > 0
                ? pool.filter(p => p.position === PlayerPosition.MID)
                : pool.filter(p => p.position !== PlayerPosition.GK));

    const fallback = selectable.length > 0 ? selectable : pool;
    const selected = [...fallback].sort((a, b) => getEmergencyFieldScore(b, slot.role, useSecondaryPositions) - getEmergencyFieldScore(a, slot.role, useSecondaryPositions))[0];

    lineup[slot.index] = selected.id;
    remaining.delete(selected.id);
  }

  return lineup;
};

// [AI-COACH-CALIBRATION] applyTacticReassignment — JEDYNE miejsce, które powinno zmieniać lineup.tacticId
// w reakcji na wynik/sytuację (poza bezpośrednią wymianą zawodnika przy kontuzji, która już wcześniej
// robiła to poprawnie przez assignPlayersToTactic). Zwraca NOWY obiekt Lineup z zsynchronizowanym
// tacticId + startingXI. Jeśli przebudowa się nie powiedzie (np. brakuje zawodników na boisku —
// teoretycznie niemożliwe przy 11 vs 11, ale przy czerwonych kartkach liczba aktywnych graczy może
// być mniejsza), funkcja NIE zmienia nic i zwraca oryginalny lineup z niezmienionym tacticId —
// lepiej zostać przy obecnej, działającej taktyce niż wejść w połowicznie poprawiony stan.
// Eksportowane: AiMatchDecisionServiceFriendlyMatch i AiMatchDecisionCupService używają TEJ SAMEJ
// funkcji do naprawy identycznego błędu remapowania składu — jeden punkt prawdy, nie duplikować.
export const applyTacticReassignment = (lineup: Lineup, players: Player[], newTacticId: string, lockSlotZeroId?: string): Lineup => {
  const activeIds = lineup.startingXI.filter((id): id is string => !!id);
  const assignedXI = assignPlayersToTactic(activeIds, newTacticId, players, true, lockSlotZeroId);
  if (!assignedXI) return lineup;
  return { ...lineup, tacticId: newTacticId, startingXI: assignedXI };
};

const chooseInjuryResponse = (
  lineup: Lineup,
  players: Player[],
  injuredId: string,
  slotIdx: number,
  scoreDiff: number,
  coachQuality: number,
  subsHistory: SubstitutionRecord[],
  canChangeTactic: boolean
): { lineup: Lineup; sub: Player; newTacticId?: string; note: string } | null => {
  const currentTactic = TacticRepository.getById(lineup.tacticId);
  const requiredRole = currentTactic.slots[slotIdx]?.role ?? PlayerPosition.MID;
  const benchPool = getAvailableBench(lineup, players, subsHistory);
  if (benchPool.length === 0) return null;

  const rolePool = requiredRole === PlayerPosition.GK
    ? benchPool.filter(p => p.position === PlayerPosition.GK)
    : benchPool.filter(p => p.position !== PlayerPosition.GK);
  const emergencyPool = rolePool.length > 0 ? rolePool : benchPool;
  const directSub = [...emergencyPool].sort((a, b) => getEmergencyFieldScore(b, requiredRole) - getEmergencyFieldScore(a, requiredRole))[0];
  if (!directSub) return null;

  const directLineup = buildDirectSubLineup(lineup, injuredId, directSub, slotIdx);
  let bestResponse = {
    lineup: directLineup,
    sub: directSub,
    score: getLineupFitScore(directLineup.startingXI, directLineup.tacticId, players, true),
    note: directSub.position === PlayerPosition.GK && requiredRole !== PlayerPosition.GK
      ? 'awaryjnie bramkarz wchodzi w pole'
      : 'zmiana po pozycji'
  };

  if (canChangeTactic && requiredRole !== PlayerPosition.GK) {
    const tacticalPool = scoreDiff < 0 ? [...OFFENSIVE_TACTICS, ...SOLID_DEFENSIVE_TACTICS] : [...SOLID_DEFENSIVE_TACTICS, ...OFFENSIVE_TACTICS];
    const tacticIds = Array.from(new Set(tacticalPool)).filter(id => id !== lineup.tacticId);
    const activeIds = lineup.startingXI.filter((id): id is string => !!id && id !== injuredId);

    for (const tacticId of tacticIds) {
      for (const sub of benchPool) {
        const assignedXI = assignPlayersToTactic([...activeIds, sub.id], tacticId, players, true);
        if (!assignedXI) continue;
        const tacticLineup: Lineup = {
          ...lineup,
          tacticId,
          startingXI: assignedXI,
          bench: lineup.bench.filter(id => id !== sub.id && id !== injuredId),
          reserves: lineup.reserves.includes(injuredId) ? lineup.reserves : [...lineup.reserves, injuredId]
        };
        const score = getLineupFitScore(assignedXI, tacticId, players, true);
        if (score > bestResponse.score) {
          bestResponse = { lineup: tacticLineup, sub, score, note: `zmiana ustawienia na ${tacticId}` };
        }
      }
    }
  }

  const directScore = getLineupFitScore(directLineup.startingXI, directLineup.tacticId, players, true);
  const requiredGain = Math.max(2.5, 8 - coachQuality * 0.06);
  if (bestResponse.lineup.tacticId !== lineup.tacticId && bestResponse.score < directScore + requiredGain) {
    return { lineup: directLineup, sub: directSub, note: directSub.position === PlayerPosition.GK && requiredRole !== PlayerPosition.GK ? 'awaryjnie bramkarz wchodzi w pole' : 'zmiana po pozycji' };
  }

  return {
    lineup: bestResponse.lineup,
    sub: bestResponse.sub,
    newTacticId: bestResponse.lineup.tacticId !== lineup.tacticId ? bestResponse.lineup.tacticId : undefined,
    note: bestResponse.note
  };
};

const getLightInjuryUrgency = (
  player: Player,
  fatigue: number,
  minute: number,
  subsRemaining: number,
  scoreDiff: number
): number => {
  const conditionPressure = Math.max(0, 100 - fatigue) * 0.95;
  const matchPhasePressure = minute < 35 ? 0 : Math.min(18, (minute - 35) * 0.45);
  const playerResistance = Math.max(0, player.attributes.mentality - 50) * 0.28;
  const physicalBuffer = ((player.attributes.stamina || 50) + (player.attributes.strength || 50)) * 0.08;
  const subsPressure = subsRemaining <= 1 && fatigue > 52 ? -14 : 0;
  const chasingGameBonus = scoreDiff < 0 && player.position !== PlayerPosition.GK ? 6 : 0;

  return 30 + conditionPressure + matchPhasePressure + chasingGameBonus + subsPressure - playerResistance - physicalBuffer;
};

const shouldTryLightInjurySub = (
  urgency: number,
  player: Player,
  fatigue: number,
  coachQuality: number,
  isPriority: boolean,
  isHalftime: boolean
): boolean => {
  if (fatigue < 42) return true;
  const threshold = (isPriority || isHalftime ? 70 : 82) - coachQuality * 0.32;
  if (urgency >= threshold) return true;

  let chance = (urgency - threshold + 22) / 48;
  chance += (coachQuality - 50) / 180;
  if (fatigue < 58) chance += 0.22;
  if (player.attributes.mentality > 74 && fatigue > 55) chance -= 0.16;

  return Math.random() < Math.max(0.04, Math.min(0.92, chance));
};

type HalftimeStatus = 'PROTECT_RESULT' | 'CONTROL_GAME' | 'CHASE_EXPECTED_RESULT' | 'CHASE_UNDERDOG' | 'NEUTRAL';

const getLineupAverageRating = (lineupIds: (string | null)[], players: Player[]): number => {
  const activePlayers = lineupIds
    .map(id => getPlayer(players, id))
    .filter((p): p is Player => !!p);

  if (activePlayers.length === 0) return 60;
  return activePlayers.reduce((sum, player) => sum + getReadinessOverall(player), 0) / activePlayers.length;
};

// ============================================================================================
// [AI-COACH MIND-FLOW] — sekcja "plan przedmeczowy + adherencja do planu"
// ============================================================================================
// Cała ta sekcja (do końca bloku applyPlanDeviation) implementuje ustaloną w rozmowie zasadę:
// "każdy trener ma PLAN na każdą sytuację (siła rywala x wynik), ustalony zanim mecz się zacznie,
// i w trakcie meczu GO TRZYMA — ale nie 100% czasu. Słabszy/mniej doświadczony trener, zaskoczony
// przebiegiem gry, w derbach czy meczu o wszystko, czasem PORZUCA plan i reaguje impulsywnie —
// a impulsywna reakcja to czyste 50/50: czasem wypala, czasem jest błędem."
// Celowo NIE jest to jedna, prosta, łatwa do wyuczenia przez gracza zależność (np. "słaby trener =
// zawsze panikuje") — adherencja do planu zależy od kilku NIEZALEŻNYCH czynników na raz (patrz
// getPlanAdherenceProbability), z których część (ukryty nastrój meczowy) jest dla gracza całkowicie
// niewidoczna i niezwiązana z żadną obserwowalną zmienną w grze.
// ============================================================================================

// 5 kategorii siły względnej rywala (zastąpienie/uzupełnienie istniejącego 2-kategoriowego
// isClearFavorite/isClearUnderdog z assessHalftimeStatus o szerszą skalę, potrzebną do PLAN_TABLE).
// Progi (3.5 i 8.0) w jednostkach getLineupAverageRating (średnia "overall" składu, z uwzględnieniem
// zmęczenia/morale przez getReadinessOverall) — 3.5 to już istniejący próg "wyraźnej" różnicy w tym
// pliku (assessHalftimeStatus), 8.0 to nowy, drugi próg dla "OGROMNEJ" różnicy. KALIBRACJA: podnieś
// progi, jeśli zbyt często trafiasz w kategorie MUCH_*, opuść, jeśli zbyt rzadko.
type OpponentStrengthTier = 'MUCH_STRONGER' | 'STRONGER' | 'EVEN' | 'WEAKER' | 'MUCH_WEAKER';

const getOpponentStrengthTier = (
  myLineup: Lineup,
  oppLineup: Lineup,
  myPlayers: Player[],
  oppPlayers: Player[]
): { tier: OpponentStrengthTier; strengthDiff: number } => {
  const myXiStrength = getLineupAverageRating(myLineup.startingXI, myPlayers);
  const oppXiStrength = getLineupAverageRating(oppLineup.startingXI, oppPlayers);
  const strengthDiff = myXiStrength - oppXiStrength; // > 0 = MY jesteśmy silniejsi od rywala

  if (strengthDiff <= -8) return { tier: 'MUCH_STRONGER', strengthDiff }; // rywal OGROMNIE silniejszy
  if (strengthDiff <= -3.5) return { tier: 'STRONGER', strengthDiff };    // rywal silniejszy
  if (strengthDiff < 3.5) return { tier: 'EVEN', strengthDiff };          // wyrównany
  if (strengthDiff < 8) return { tier: 'WEAKER', strengthDiff };          // rywal słabszy
  return { tier: 'MUCH_WEAKER', strengthDiff };                          // rywal OGROMNIE słabszy
};

type CoachScoreState = 'WINNING' | 'DRAWING' | 'LOSING';

const getCoachScoreState = (scoreDiff: number): CoachScoreState =>
  scoreDiff > 0 ? 'WINNING' : scoreDiff < 0 ? 'LOSING' : 'DRAWING';

// "posture" steruje DWOMA rzeczami w dalszej części pliku (patrz miejsca z komentarzem
// [AI-COACH-FIX] applyTacticReassignment, gdzie pool kandydatów jest filtrowany przez
// crossFamilyAllowed, oraz getPostureEagernessBonus poniżej):
//   PARK_BUS  — maksymalna zachowawczość, próg do zmiany taktyki najwyższy
//   CONTROL   — kontrola wyniku, lekka zachowawczość
//   BALANCED  — stan "neutralny", zero dodatkowego nacisku w żadną stronę
//   PUSH      — zauważalna presja na poprawę sytuacji, niższy próg do zmiany
//   ALL_IN    — maksymalna presja, najniższy próg, dopuszczona zmiana szyku formacji najwcześniej
type CoachPosture = 'PARK_BUS' | 'CONTROL' | 'BALANCED' | 'PUSH' | 'ALL_IN';

type CoachPlanIntent = {
  posture: CoachPosture;
  // czy PLAN (bez porzucenia go) dopuszcza JAKĄKOLWIEK zmianę taktyki w 1. połowie poza Warstwą 0/1
  // (kontuzja/czerwona kartka) — zgodnie z zasadą "w 1. połowie trener kręci tempem/nastawieniem,
  // nie przebudowuje formacji, OPRÓCZ naprawdę alarmujących sytuacji" z rozmowy.
  allowFirstHalfTacticChange: boolean;
  // od której minuty PLAN odblokowuje zmianę SZYKU formacji (inna liczba DEF/MID/FWD, wymagająca
  // applyTacticReassignment) — przed tą minutą dozwolone są tylko bezpieczne zmiany w obrębie tej
  // samej rodziny formacji (patrz getSameFamilyTactics), które z definicji nie przestawiają nikogo
  // na inną rolę.
  crossFamilyEscalationMinute: number;
};

// [AI-COACH-CALIBRATION] PLAN_TABLE — dokładny zapis tabeli "siła rywala x wynik" ustalonej w
// rozmowie. To jest GŁÓWNE miejsce kalibracji "charakteru" trenerów w reakcji na sytuację meczową.
// Każda zmiana liczby w crossFamilyEscalationMinute przesuwa, jak szybko trener jest skłonny
// PRZEBUDOWAĆ FORMACJĘ (a nie tylko dostosować tempo/nastawienie). Każda zmiana posture przesuwa,
// jak chętnie reaguje w ogóle (patrz getPostureEagernessBonus).
const PLAN_TABLE: Record<OpponentStrengthTier, Record<CoachScoreState, CoachPlanIntent>> = {
  MUCH_STRONGER: {
    WINNING: { posture: 'PARK_BUS', allowFirstHalfTacticChange: false, crossFamilyEscalationMinute: 70 },
    DRAWING: { posture: 'CONTROL', allowFirstHalfTacticChange: false, crossFamilyEscalationMinute: 75 },
    LOSING: { posture: 'BALANCED', allowFirstHalfTacticChange: false, crossFamilyEscalationMinute: 65 }
  },
  STRONGER: {
    WINNING: { posture: 'CONTROL', allowFirstHalfTacticChange: false, crossFamilyEscalationMinute: 70 },
    DRAWING: { posture: 'BALANCED', allowFirstHalfTacticChange: false, crossFamilyEscalationMinute: 70 },
    LOSING: { posture: 'PUSH', allowFirstHalfTacticChange: false, crossFamilyEscalationMinute: 60 }
  },
  EVEN: {
    WINNING: { posture: 'CONTROL', allowFirstHalfTacticChange: false, crossFamilyEscalationMinute: 65 },
    DRAWING: { posture: 'BALANCED', allowFirstHalfTacticChange: false, crossFamilyEscalationMinute: 60 },
    LOSING: { posture: 'PUSH', allowFirstHalfTacticChange: false, crossFamilyEscalationMinute: 50 }
  },
  WEAKER: {
    WINNING: { posture: 'BALANCED', allowFirstHalfTacticChange: false, crossFamilyEscalationMinute: 60 },
    DRAWING: { posture: 'PUSH', allowFirstHalfTacticChange: true, crossFamilyEscalationMinute: 45 },
    LOSING: { posture: 'ALL_IN', allowFirstHalfTacticChange: true, crossFamilyEscalationMinute: 40 }
  },
  MUCH_WEAKER: {
    WINNING: { posture: 'PUSH', allowFirstHalfTacticChange: false, crossFamilyEscalationMinute: 70 },
    DRAWING: { posture: 'ALL_IN', allowFirstHalfTacticChange: true, crossFamilyEscalationMinute: 35 },
    // LOSING z dużo słabszym rywalem to JEDYNY zaplanowany wyjątek od "nie zmieniamy w 1. połowie"
    // (crossFamilyEscalationMinute: 1) — ustalone wprost w rozmowie jako "katastrofa wizerunkowa".
    LOSING: { posture: 'ALL_IN', allowFirstHalfTacticChange: true, crossFamilyEscalationMinute: 1 }
  }
};

const getCoachPlan = (tier: OpponentStrengthTier, scoreState: CoachScoreState): CoachPlanIntent =>
  PLAN_TABLE[tier][scoreState];

// [AI-COACH-CALIBRATION] getPostureEagernessBonus — przekłada posture na liczbę dodawaną/odejmowaną
// od "requiredScore" (progu potrzebnego do zaakceptowania zmiany taktyki) w chooseScoreTacticResponse.
// Dodatnia wartość = WYŻSZY próg = trener MNIEJ chętny do zmiany. Ujemna = NIŻSZY próg = chętniej
// zmienia. Skala zgodna z jednostkami requiredScore w chooseScoreTacticResponse (tam typowe wartości
// to 4-16) — stąd zakres -6..+6 tutaj jest "silny, ale nie dominujący" modyfikator.
const getPostureEagernessBonus = (posture: CoachPosture): number => {
  switch (posture) {
    case 'PARK_BUS': return 6;
    case 'CONTROL': return 3;
    case 'BALANCED': return 0;
    case 'PUSH': return -3;
    case 'ALL_IN': return -6;
  }
};

// Rodziny formacji o IDENTYCZNEJ mapie rola->miejsce (sprawdzone w resources/tactics_db.ts) — zmiana
// w obrębie jednej rodziny NIGDY nie przestawia nikogo na inną rolę, więc jest "bezpieczna" nawet
// w 1. połowie / bez przeliczania składu. KALIBRACJA: jeśli w tactics_db.ts pojawi się nowa taktyka
// będąca wariantem istniejącego szyku (te samo role na tych samych indeksach slotów), dopisz ją tutaj.
const TACTIC_FAMILIES: string[][] = [
  ['4-4-2', '4-4-2-OFF', '4-4-2-DEF', '4-4-2-DIAMOND']
];

const getSameFamilyTactics = (tacticId: string): string[] =>
  TACTIC_FAMILIES.find(family => family.includes(tacticId)) ?? [tacticId];

// Proste, STABILNE hashowanie tekstu na liczbę w [0,1). Celowo NIE używamy tu Math.random() — wynik
// musi być identyczny przy każdym wywołaniu makeDecisions w trakcie TEGO SAMEGO meczu (to jest
// "ukryty nastrój meczowy" trenera, ustalony raz, na starcie meczu, nie losowany co minutę).
// Wejście (fixtureId+side+sól) gwarantuje, że dwa różne mecze / dwie strony tego samego meczu dostają
// inną, niezależną wartość.
const hashToUnitInterval = (text: string): number => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % 1000003;
  }
  return Math.abs(hash) / 1000003;
};

type PlanAdherenceInput = {
  fixtureId: string;
  side: 'HOME' | 'AWAY';
  coachExperience: number; // 0-100, Coach.attributes.experience
  tier: OpponentStrengthTier;
  momentum: number; // state.momentum, zakres ok. -100..100
  lateSeasonDrama: number; // już liczone w makeDecisions z aiStakes/userStakes/isLateSeason
  rivalryMultiplier: number;
};

// [AI-COACH-CALIBRATION] getPlanAdherenceProbability — szansa (0..1), że trener W TEJ KONKRETNEJ
// chwili trzyma się swojego planu (PLAN_TABLE). Jeśli losowanie tę szansę przegra, trener PORZUCA
// plan i improwizuje (patrz resolvePlanAdherence/applyPlanDeviation) — z wynikiem czystego 50/50.
// 4 NIEZALEŻNE składowe (rozmyślnie różne źródła, żeby gracz nie mógł wyuczyć się jednego prostego
// wzorca typu "słaby trener = zawsze panikuje"):
//   1) DOŚWIADCZENIE (główny czynnik, ustalony w rozmowie): skala 1-99 -> ±0.24.
//   2) UKRYTY NASTRÓJ MECZOWY: stały na CAŁY mecz, niewidoczny dla gracza, niezwiązany z żadną
//      obserwowalną zmienną w grze -> ±0.08.
//   3) ROZJAZD MOMENTUM vs OCZEKIWANIA wynikające z tieru siły: jeśli przebieg gry bardzo różni się
//      od tego, czego sugerowałby tier (np. "powinniśmy dominować, a jesteśmy przepychani") —
//      NAWET dobry trener może się "zagubić w planie" -> do -0.25.
//   4) RANGA MECZU / RYWALIZACJA: derby/wysoka stawka podnoszą emocjonalność KAŻDEGO trenera -> do -0.15.
// WYNIK ograniczony do [0.15, 0.95] — żaden trener nie jest 100% przewidywalny ani 100% chaotyczny.
const getPlanAdherenceProbability = (input: PlanAdherenceInput): number => {
  const experienceComponent = (input.coachExperience - 50) * 0.0048; // -0.24..+0.24

  const hiddenMood = hashToUnitInterval(`${input.fixtureId}:${input.side}:mood`); // 0..1, stałe na mecz
  const hiddenMoodComponent = (hiddenMood - 0.5) * 0.16; // -0.08..+0.08

  // Czego "powinniśmy" doświadczać w przebiegu gry, sądząc tylko po tierze siły: jeśli rywal jest
  // słabszy (WEAKER/MUCH_WEAKER), oczekiwane momentum jest DODATNIE (powinniśmy dominować); jeśli
  // silniejszy, oczekiwane momentum jest UJEMNE; EVEN -> oczekiwane momentum to 0 (brak dominacji).
  const expectedMomentumSign =
    input.tier === 'WEAKER' || input.tier === 'MUCH_WEAKER' ? 1
    : input.tier === 'STRONGER' || input.tier === 'MUCH_STRONGER' ? -1
    : 0;
  const actualMomentumNormalized = Math.max(-1, Math.min(1, input.momentum / 100));
  const momentumDivergence01 = Math.abs(actualMomentumNormalized - expectedMomentumSign) / 2; // 0..1
  const momentumDivergencePenalty = momentumDivergence01 * 0.25; // 0..0.25

  const stakesVolatilityPenalty = Math.max(0, Math.min(0.15,
    input.lateSeasonDrama * 0.10 + (input.rivalryMultiplier - 1) * 0.05
  ));

  const probability = 0.50 + experienceComponent + hiddenMoodComponent - momentumDivergencePenalty - stakesVolatilityPenalty;
  return Math.max(0.15, Math.min(0.95, probability));
};

type PlanDecisionOutcome = 'FOLLOW_PLAN' | 'IMPROVISE_WELL' | 'IMPROVISE_BADLY';

// [AI-COACH-CALIBRATION] resolvePlanAdherence — JEDYNE miejsce, które losuje, czy trener trzyma się
// planu. Porzucenie planu to ZAWSZE czyste 50/50 dobry/zły wynik improwizacji — ustalone wprost w
// rozmowie jako "jak w życiu", BEZ wpływu atrybutów trenera na ten konkretny rzut (atrybuty wpływają
// tylko na to, JAK CZĘŚCIEJ do porzucenia planu dochodzi, czyli na getPlanAdherenceProbability wyżej).
const resolvePlanAdherence = (input: PlanAdherenceInput): PlanDecisionOutcome => {
  if (Math.random() < getPlanAdherenceProbability(input)) return 'FOLLOW_PLAN';
  return Math.random() < 0.5 ? 'IMPROVISE_WELL' : 'IMPROVISE_BADLY';
};

type BadImprovisationMode = 'FREEZE' | 'SUBOPTIMAL' | 'SPECTACULAR';

// [AI-COACH-CALIBRATION] rozkład 65/25/10 SKOPIOWANY Z ISTNIEJĄCEGO mechanizmu błędu trenera w
// AiMatchDecisionCupService.tsx (sekcja "PROGRESYWNY MECHANIZM BŁĘDÓW TRENERA") — ten sam rozkład:
// najczęściej trener po prostu nie reaguje (65%), czasem reaguje słabo/nie na temat (25%), rzadko
// reaguje spektakularnie źle (10%). Użycie tego samego rozkładu w obu silnikach (ligowym i
// pucharowym) to świadoma decyzja o konsekwencji, nie przypadek.
const rollBadImprovisationMode = (): BadImprovisationMode => {
  const roll = Math.random();
  if (roll < 0.65) return 'FREEZE';
  if (roll < 0.90) return 'SUBOPTIMAL';
  return 'SPECTACULAR';
};

// [AI-COACH-CALIBRATION] applyPlanDeviation — przekłada wynik resolvePlanAdherence na KONKRETNE,
// efektywne parametry użyte dalej w makeDecisions (effective posture / effective escalation minute /
// czy ten tick ma być całkowicie "zamrożony"). To jest miejsce, w którym "porzucenie planu" faktycznie
// zmienia zachowanie — patrz użycie w makeDecisions (zmienne effectivePlan / aiFrozenByBadImprovisation).
const applyPlanDeviation = (
  plan: CoachPlanIntent,
  outcome: PlanDecisionOutcome,
  tier: OpponentStrengthTier,
  scoreState: CoachScoreState
): { plan: CoachPlanIntent; freezeThisTick: boolean; badMode?: BadImprovisationMode } => {
  if (outcome === 'FOLLOW_PLAN') return { plan, freezeThisTick: false };

  if (outcome === 'IMPROVISE_WELL') {
    // "Udana improwizacja" — trener trafia w decyzję odważniejszą/szybszą niż plan przewidywał, i
    // (z definicji "udana") wychodzi mu to na dobre. Eskalujemy o jeden poziom + przybliżamy moment
    // odblokowania zmiany szyku formacji o 15 minut (nie wcześniej niż minuta 1).
    const posturesInOrder: CoachPosture[] = ['PARK_BUS', 'CONTROL', 'BALANCED', 'PUSH', 'ALL_IN'];
    const currentIdx = posturesInOrder.indexOf(plan.posture);
    const escalatedPosture = posturesInOrder[Math.min(posturesInOrder.length - 1, currentIdx + 1)];
    return {
      plan: {
        posture: escalatedPosture,
        allowFirstHalfTacticChange: plan.allowFirstHalfTacticChange,
        crossFamilyEscalationMinute: Math.max(1, plan.crossFamilyEscalationMinute - 15)
      },
      freezeThisTick: false
    };
  }

  // IMPROVISE_BADLY
  const badMode = rollBadImprovisationMode();
  if (badMode === 'FREEZE') return { plan, freezeThisTick: true, badMode };

  if (badMode === 'SUBOPTIMAL') {
    // Reaguje, ale "nie na temat" — czyta sytuację jakby wynik był o jeden poziom inny niż faktyczny
    // (np. zachowuje się jak przy remisie, choć faktycznie prowadzi/przegrywa o gol). Pożyczamy plan
    // z SĄSIEDNIEGO stanu wyniku dla TEGO SAMEGO tieru — to wciąż SENSOWNY, istniejący wpis w
    // PLAN_TABLE (nie losowy szum), tylko nie ten, który faktycznie pasuje do sytuacji.
    // WINNING <-> DRAWING <-> LOSING: zawsze przesuwamy w stronę DRAWING (środek), bo to jedyny
    // kierunek, który ma sens z OBU krańców (z WINNING i z LOSING) bez specjalnych przypadków.
    const neighborScoreState: CoachScoreState = scoreState === 'DRAWING' ? 'LOSING' : 'DRAWING';
    return { plan: getCoachPlan(tier, neighborScoreState), freezeThisTick: false, badMode };
  }

  // SPECTACULAR — najbardziej dramatyczny błąd: trener całkowicie błędnie ocenia wagę sytuacji,
  // odblokowuje zmianę szyku formacji NATYCHMIAST (nawet w 1. połowie) i ustawia najbardziej
  // ekstremalne posture (ALL_IN) niezależnie od tego, czy sytuacja na to wskazuje.
  return {
    plan: { posture: 'ALL_IN', allowFirstHalfTacticChange: true, crossFamilyEscalationMinute: 1 },
    freezeThisTick: false,
    badMode
  };
};

const assessHalftimeStatus = (
  myLineup: Lineup,
  oppLineup: Lineup,
  myPlayers: Player[],
  oppPlayers: Player[],
  scoreDiff: number
): { status: HalftimeStatus; strengthDiff: number } => {
  const myXiStrength = getLineupAverageRating(myLineup.startingXI, myPlayers);
  const oppXiStrength = getLineupAverageRating(oppLineup.startingXI, oppPlayers);
  const strengthDiff = myXiStrength - oppXiStrength;
  const isClearFavorite = strengthDiff >= 3.5;
  const isClearUnderdog = strengthDiff <= -3.5;

  if (isClearUnderdog && scoreDiff >= 0) return { status: 'PROTECT_RESULT', strengthDiff };
  if (isClearFavorite && scoreDiff <= 0) return { status: 'CHASE_EXPECTED_RESULT', strengthDiff };
  if (scoreDiff > 0) return { status: 'CONTROL_GAME', strengthDiff };
  if (scoreDiff < 0) return { status: isClearUnderdog ? 'CHASE_UNDERDOG' : 'CHASE_EXPECTED_RESULT', strengthDiff };
  return { status: 'NEUTRAL', strengthDiff };
};

const getHalftimeReactionChance = (status: HalftimeStatus, coachQuality: number, scoreDiff: number): number => {
  const coachBonus = (coachQuality - 50) * 0.006;
  switch (status) {
    case 'CHASE_EXPECTED_RESULT':
      return Math.max(0.55, Math.min(0.98, 0.78 + coachBonus + Math.abs(Math.min(0, scoreDiff)) * 0.06));
    case 'PROTECT_RESULT':
      return Math.max(0.45, Math.min(0.94, 0.68 + coachBonus));
    case 'CONTROL_GAME':
      return Math.max(0.25, Math.min(0.76, 0.44 + coachBonus));
    case 'CHASE_UNDERDOG':
      return Math.max(0.30, Math.min(0.82, 0.48 + coachBonus + Math.abs(scoreDiff) * 0.05));
    default:
      return Math.max(0.18, Math.min(0.62, 0.34 + coachBonus));
  }
};

const getTacticIntentScore = (tacticId: string, scoreDiff: number): number => {
  const tactic = TacticRepository.getById(tacticId);
  const counts = tactic.slots.reduce((acc, slot) => {
    acc[slot.role] = (acc[slot.role] ?? 0) + 1;
    return acc;
  }, {} as Record<PlayerPosition, number>);

  const defenders = counts[PlayerPosition.DEF] ?? 0;
  const midfielders = counts[PlayerPosition.MID] ?? 0;
  const forwards = counts[PlayerPosition.FWD] ?? 0;

  if (scoreDiff < 0) {
    const urgency = Math.min(3, Math.abs(scoreDiff));
    return forwards * (18 + urgency * 5) + midfielders * 4 - defenders * (6 + urgency);
  }

  return defenders * 16 + midfielders * 5 - forwards * 12;
};

const shouldReactToScore = (
  scoreDiff: number,
  minute: number,
  coachQuality: number,
  isHalftime: boolean
): boolean => {
  if (scoreDiff === 0) return false;

  const absDiff = Math.abs(scoreDiff);
  if (isHalftime) return scoreDiff < 0 || (scoreDiff > 0 && minute >= 45);

  let pressure = absDiff * 20;
  if (scoreDiff < 0) pressure += minute >= 25 ? 18 : 4;
  if (scoreDiff <= -2) pressure += minute >= 25 ? 26 : 10;
  if (scoreDiff <= -3) pressure += 20;
  if (scoreDiff > 0 && minute >= 70) pressure += 18;
  if (scoreDiff > 0 && minute < 65) pressure -= 28;

  const threshold = 82 - coachQuality * 0.38;
  if (pressure >= threshold) return true;

  const chance = Math.max(0.03, Math.min(0.75, (pressure - threshold + 24) / 60 + (coachQuality - 50) / 220));
  return Math.random() < chance;
};

const chooseScoreTacticResponse = (
  lineup: Lineup,
  players: Player[],
  scoreDiff: number,
  coachQuality: number,
  coach: Coach | null | undefined = null,
  // [AI-COACH-FIX] crossFamilyAllowed=true zachowuje DOKŁADNIE stare zachowanie (pełna pula
  // OFFENSIVE_TACTICS/DEFENSIVE_TACTICS) — domyślne true, żeby wywołania, które nie przekazują tego
  // argumentu (jeśli jakieś zostały), się nie zepsuły. W makeDecisions zawsze przekazujemy realną
  // wartość z crossFamilyAllowed (plan przedmeczowy, patrz PLAN_TABLE.crossFamilyEscalationMinute).
  crossFamilyAllowed: boolean = true,
  // [AI-COACH-FIX] postureEagernessBonus — patrz getPostureEagernessBonus. Domyślnie 0 = stare
  // zachowanie (próg "requiredScore" niezmieniony).
  postureEagernessBonus: number = 0
): string | null => {
  // useSecondaryPositions=true: oceniamy taktykę tak, jak ona FAKTYCZNIE zostanie wystawiona przez
  // applyTacticReassignment (które też liczy z pozycjami pomocniczymi) — inaczej moglibyśmy odrzucić
  // dobrą taktykę tylko dlatego, że ocena nie widziała, że ktoś ma realny atrybut na drugiej pozycji.
  const currentFit = getLineupFitScore(lineup.startingXI, lineup.tacticId, players, true);
  const currentIntent = getTacticIntentScore(lineup.tacticId, scoreDiff);
  const fullPool = scoreDiff < 0
    ? (scoreDiff <= -2 ? OFFENSIVE_TACTICS : ['4-4-2-OFF', '4-3-3', '3-5-2', '4-3-2-1'])
    : DEFENSIVE_TACTICS;
  // [AI-COACH-FIX] crossFamilyAllowed=false: ZANIM plan odblokuje zmianę szyku formacji (np. w
  // 1. połowie), ograniczamy pulę do wariantów TEJ SAMEJ rodziny co obecna taktyka (getSameFamilyTactics)
  // — bezpieczne, bo nie przestawiają nikogo na inną rolę. Jeśli obecna taktyka nie ma rodziny
  // (np. graliśmy 4-3-3), pula degeneruje się do samej obecnej taktyki, czyli efektywnie "brak zmiany
  // dostępnej teraz" — to jest poprawne zachowanie (patrz komentarz przy TACTIC_FAMILIES).
  const pool = crossFamilyAllowed ? fullPool : fullPool.filter(t => getSameFamilyTactics(lineup.tacticId).includes(t));

  const candidates = Array.from(new Set(pool))
    .filter(tacticId => tacticId !== lineup.tacticId)
    .map(tacticId => {
      const assignedXI = assignPlayersToTactic(lineup.startingXI.filter((id): id is string => !!id), tacticId, players, true);
      if (!assignedXI || assignedXI.some(s => s === null)) return null;
      const fit = getLineupFitScore(assignedXI, tacticId, players, true);
      const intent = getTacticIntentScore(tacticId, scoreDiff);
      const fitLoss = Math.max(0, currentFit - fit);
      const tactic = TacticRepository.getById(tacticId);
      const currentTactic = TacticRepository.getById(lineup.tacticId);
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
        // [AI-COACH-CALIBRATION] + getFavoriteTacticBonus: "pierwszy wybór, nie nakaz" — patrz
        // komentarz przy definicji funkcji. Dodane na końcu, żeby nie zmieniać wag już istniejących
        // składników (intent/fitLoss), tylko delikatnie przeważać remisy w stronę stylu trenera.
        score: intent - currentIntent - fitLoss * (0.18 + coachQuality / 650) - ultraOpenRisk - structureBreakRisk + getFavoriteTacticBonus(tacticId, coach, scoreDiff)
      };
    })
    .filter((entry): entry is { tacticId: string; score: number } => !!entry)
    .sort((a, b) => b.score - a.score);

  const best = candidates[0];
  if (!best) return null;

  // [AI-COACH-FIX] + postureEagernessBonus: PUSH/ALL_IN (plan mówi "trzeba reagować") obniżają próg,
  // PARK_BUS/CONTROL (plan mówi "nie ma potrzeby") go podnoszą — patrz getPostureEagernessBonus.
  // Math.max(2, ...) na końcu, żeby nawet przy najbardziej agresywnym posture próg nie spadł do
  // zera/ujemnej wartości (zero wymagań do zmiany taktyki byłoby nierealistyczne).
  const requiredScore = Math.max(2, (scoreDiff < 0
    ? Math.max(4, 13 - coachQuality * 0.08 - Math.abs(scoreDiff) * 3)
    : Math.max(6, 16 - coachQuality * 0.06)) + postureEagernessBonus);

  return best.score >= requiredScore ? best.tacticId : null;
};

const hasReliableGoalkeeper = (lineup: Lineup, players: Player[]): boolean => {
  const keeper = getPlayer(players, lineup.startingXI[0]);
  return keeper?.position === PlayerPosition.GK;
};

const getCounterThreatScore = (lineup: Lineup, players: Player[]): number => {
  const active = lineup.startingXI
    .map(id => getPlayer(players, id))
    .filter((p): p is Player => !!p && p.position !== PlayerPosition.GK);
  const forwards = active.filter(p => p.position === PlayerPosition.FWD);
  const mids = active.filter(p => p.position === PlayerPosition.MID);
  const paceFinish = [...forwards, ...mids]
    .map(p => (
      p.attributes.pace * 0.34 +
      p.attributes.finishing * 0.24 +
      p.attributes.dribbling * 0.18 +
      p.attributes.passing * 0.12 +
      p.attributes.vision * 0.12
    ) * getReadinessMultiplier(p))
    .sort((a, b) => b - a)
    .slice(0, 4);
  if (paceFinish.length === 0) return 45;
  return paceFinish.reduce((sum, value) => sum + value, 0) / paceFinish.length;
};

const chooseOpponentGoalkeeperCrisisResponse = (
  lineup: Lineup,
  players: Player[],
  oppLineup: Lineup,
  oppPlayers: Player[],
  scoreDiff: number,
  coachQuality: number,
  coach: Coach | null | undefined = null,
  crossFamilyAllowed: boolean = true
): { tacticId: string; reason: 'smart_pressure' | 'reckless_push' } | null => {
  if (hasReliableGoalkeeper(oppLineup, oppPlayers)) return null;

  const currentTactic = TacticRepository.getById(lineup.tacticId);
  // useSecondaryPositions=true — patrz komentarz w chooseScoreTacticResponse: ocena musi odpowiadać
  // temu, co applyTacticReassignment faktycznie wystawi na boisko.
  const currentFit = getLineupFitScore(lineup.startingXI, lineup.tacticId, players, true);
  const counterThreat = getCounterThreatScore(oppLineup, oppPlayers);
  const coachControl = Math.max(0, Math.min(1, (coachQuality - 45) / 35));
  const chaseNeed = scoreDiff < 0 ? Math.min(1, Math.abs(scoreDiff) / 2) : 0;
  const protectionNeed = scoreDiff > 0 ? Math.min(1, scoreDiff / 2) : 0;
  const riskTolerance = Math.max(0.18, Math.min(0.88, 0.38 + coachControl * 0.28 + chaseNeed * 0.20 - protectionNeed * 0.18));

  const smartPool = ['4-4-2-OFF', '4-3-3', '3-5-2', '4-3-2-1', '4-3-3-F9', '4-4-2'];
  const recklessPool = ['4-2-4', '3-4-3', '3-4-2-1', '4-4-2-OFF'];
  const fullPool = coachQuality >= 62 || counterThreat >= 68 ? smartPool : recklessPool;
  // [AI-COACH-FIX] crossFamilyAllowed=false — patrz identyczny mechanizm i komentarz w
  // chooseScoreTacticResponse: przed odblokowaniem zmiany szyku formacji przez plan, ograniczamy się
  // do bezpiecznych wariantów tej samej rodziny co obecna taktyka.
  const pool = crossFamilyAllowed ? fullPool : fullPool.filter(t => getSameFamilyTactics(lineup.tacticId).includes(t));

  const candidates = Array.from(new Set(pool))
    .filter(tacticId => tacticId !== lineup.tacticId)
    .map(tacticId => {
      const tactic = TacticRepository.getById(tacticId);
      const assignedXI = assignPlayersToTactic(lineup.startingXI.filter((id): id is string => !!id), tacticId, players, true);
      if (!assignedXI || assignedXI.some(s => s === null)) return null;
      const fit = getLineupFitScore(assignedXI, tacticId, players, true);
      const fitLoss = Math.max(0, currentFit - fit);
      const attackGain = Math.max(0, tactic.attackBias - currentTactic.attackBias) * 0.42;
      const pressureGain = Math.max(0, tactic.pressingIntensity - currentTactic.pressingIntensity) * 0.20;
      const counterExposure = Math.max(0, tactic.attackBias - 62) * Math.max(0, counterThreat - 58) * 0.020;
      const defensiveLoss = Math.max(0, currentTactic.defenseBias - tactic.defenseBias) * 0.14;
      const counterRiskWeight = 0.95 + coachControl * 0.55 - riskTolerance * 0.45;
      const controlledPressureBonus =
        tactic.attackBias >= 58 && tactic.attackBias <= 74 && tactic.defenseBias >= 42
          ? coachControl * 4
          : 0;
      const recklessBonus =
        coachQuality < 56 && tactic.attackBias >= 78 && scoreDiff <= 0
          ? 5
          : 0;
      const score =
        attackGain +
        pressureGain +
        controlledPressureBonus +
        recklessBonus -
        counterExposure * counterRiskWeight -
        defensiveLoss * (0.25 + protectionNeed) -
        fitLoss * 0.18 +
        // [AI-COACH-CALIBRATION] premia za ulubioną taktykę trenera — patrz getFavoriteTacticBonus.
        // Tu scoreDiff>0 (prowadzimy, polujemy na kryzys bramkarski rywala) traktujemy jak "wygrywamy"
        // w sensie wyboru ulubionej taktyki defensywnej — ale to wciąż ATAK na słabego bramkarza, więc
        // do tej premii dorzucamy też ulubioną taktykę OFENSYWNĄ, gdyby trener miał taką preferencję
        // przy każdym wyniku różnym od remisu — stąd przekazujemy -1 zamiast scoreDiff, żeby zawsze
        // sprawdzić wariant "ofensywny" ulubionych taktyk (ta funkcja z definicji szuka ataku).
        getFavoriteTacticBonus(tacticId, coach, -1);
      return { tacticId, score, attackBias: tactic.attackBias };
    })
    .filter((entry): entry is { tacticId: string; score: number; attackBias: number } => !!entry)
    .sort((a, b) => b.score - a.score);

  const best = candidates[0];
  if (!best) return null;

  const requiredScore = Math.max(4, 11 - coachQuality * 0.07 - chaseNeed * 3 + protectionNeed * 2);
  if (best.score < requiredScore) return null;

  return {
    tacticId: best.tacticId,
    reason: best.attackBias >= 78 && coachQuality < 60 ? 'reckless_push' : 'smart_pressure'
  };
};

const chooseHalftimeTacticResponse = (
  lineup: Lineup,
  players: Player[],
  status: HalftimeStatus,
  coachQuality: number,
  scoreDiff: number,
  coach: Coach | null | undefined = null,
  postureEagernessBonus: number = 0
): string | null => {
  const tacticalScoreDiff = status === 'PROTECT_RESULT' || status === 'CONTROL_GAME' ? Math.max(1, scoreDiff) : Math.min(-1, scoreDiff);
  // crossFamilyAllowed=true na stałe: ta funkcja jest wywoływana WYŁĄCZNIE w przerwie meczu (patrz
  // wywołanie w makeDecisions), a w przerwie crossFamilyAllowed jest i tak zawsze true (isHalftime).
  const candidate = chooseScoreTacticResponse(lineup, players, tacticalScoreDiff, coachQuality, coach, true, postureEagernessBonus);
  if (!candidate) return null;

  if (status === 'NEUTRAL') return null;
  return candidate;
};

const chooseScoreImpulseSub = (
  lineup: Lineup,
  players: Player[],
  fatigue: Record<string, number>,
  subsHistory: SubstitutionRecord[],
  scoreDiff: number,
  coachQuality: number,
  minute: number
): { playerOutId: string; playerIn: Player; slotIdx: number; reason: string } | null => {
  // [AI-COACH-FIX] minute < 46 (było: < 35) — "w 1. połowie trener raczej nie wymienia zawodników,
  // chyba że nastąpi krytyczna sytuacja (kontuzja, czerwona kartka)" (ustalone w rozmowie). Impulsywna
  // zmiana z powodu samego wyniku NIE jest tu krytyczną sytuacją — Warstwa 0/1 (kontuzje/czerwone
  // kartki) ma własne, osobne ścieżki w makeDecisions i nie jest tym ograniczona.
  if (scoreDiff >= 0 || minute < 46) return null;

  const tactic = TacticRepository.getById(lineup.tacticId);
  const benchPool = getAvailableBench(lineup, players, subsHistory).filter(p => p.position !== PlayerPosition.GK);
  if (benchPool.length === 0) return null;

  const candidates = lineup.startingXI
    .map((id, slotIdx) => ({ id, slotIdx, role: tactic.slots[slotIdx]?.role }))
    .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition } =>
      !!entry.id && entry.role !== PlayerPosition.GK && entry.role !== PlayerPosition.DEF
    )
    .map(entry => {
      const currentPlayer = getPlayer(players, entry.id);
      if (!currentPlayer) return null;
      const currentScore = getEmergencyFieldScore(currentPlayer, entry.role) + ((fatigue[entry.id] ?? 100) - 70) * 0.18;
      const bestSub = [...benchPool]
        .sort((a, b) => {
          const scoreA = getEmergencyFieldScore(a, entry.role) + (a.position === PlayerPosition.FWD ? 10 : 0);
          const scoreB = getEmergencyFieldScore(b, entry.role) + (b.position === PlayerPosition.FWD ? 10 : 0);
          return scoreB - scoreA;
        })[0];
      if (!bestSub) return null;
      const subScore = getEmergencyFieldScore(bestSub, entry.role) + (bestSub.position === PlayerPosition.FWD ? 10 : 0);
      return { ...entry, currentPlayer, bestSub, gain: subScore - currentScore };
    })
    .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition; currentPlayer: Player; bestSub: Player; gain: number } => !!entry)
    .sort((a, b) => b.gain - a.gain);

  const best = candidates[0];
  if (!best) return null;

  const requiredGain = Math.max(4, 14 - coachQuality * 0.08 - Math.abs(scoreDiff) * 3);
  if (best.gain < requiredGain) return null;

  return {
    playerOutId: best.id,
    playerIn: best.bestSub,
    slotIdx: best.slotIdx,
    reason: scoreDiff <= -2 ? 'mocna reakcja na wynik' : 'impuls ofensywny'
  };
};

const chooseTacticSupportSub = (
  lineup: Lineup,
  players: Player[],
  fatigue: Record<string, number>,
  subsHistory: SubstitutionRecord[],
  scoreDiff: number,
  coachQuality: number,
  minute: number
): { playerOutId: string; playerIn: Player; slotIdx: number; reason: string } | null => {
  const tactic = TacticRepository.getById(lineup.tacticId);
  const benchPool = getAvailableBench(lineup, players, subsHistory).filter(p => p.position !== PlayerPosition.GK);
  if (benchPool.length === 0) return null;

  const candidates = lineup.startingXI
    .map((id, slotIdx) => ({ id, slotIdx, role: tactic.slots[slotIdx]?.role }))
    .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition } =>
      !!entry.id && entry.role !== PlayerPosition.GK
    )
    .map(entry => {
      const currentPlayer = getPlayer(players, entry.id);
      if (!currentPlayer) return null;
      const currentFatigue = fatigue[entry.id] ?? 100;
      const currentScore = getEmergencyFieldScore(currentPlayer, entry.role, true) + (currentFatigue - 72) * 0.12;
      const roleMismatch = currentPlayer.position !== entry.role;
      const bestSub = [...benchPool]
        .sort((a, b) => {
          const chaseA = scoreDiff < 0 && a.position === PlayerPosition.FWD ? 8 : 0;
          const chaseB = scoreDiff < 0 && b.position === PlayerPosition.FWD ? 8 : 0;
          const protectA = scoreDiff > 0 && a.position === PlayerPosition.DEF ? 7 : 0;
          const protectB = scoreDiff > 0 && b.position === PlayerPosition.DEF ? 7 : 0;
          return (
            getEmergencyFieldScore(b, entry.role, true) + chaseB + protectB -
            (getEmergencyFieldScore(a, entry.role, true) + chaseA + protectA)
          );
        })[0];
      if (!bestSub) return null;
      const bestSubScore = getEmergencyFieldScore(bestSub, entry.role, true) +
        ((bestSub.condition ?? 100) - 72) * 0.10 +
        (scoreDiff < 0 && bestSub.position === PlayerPosition.FWD ? 8 : 0) +
        (scoreDiff > 0 && bestSub.position === PlayerPosition.DEF ? 7 : 0);
      const naturalRoleFix = roleMismatch && bestSub.position === entry.role ? 10 : 0;
      const roleMismatchPressure = roleMismatch ? 7 : 0;
      const fatiguePressure = Math.max(0, 66 - currentFatigue) * 0.18;
      const gain = bestSubScore - currentScore + naturalRoleFix + roleMismatchPressure + fatiguePressure;
      return { ...entry, currentPlayer, bestSub, gain, roleMismatch };
    })
    .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition; currentPlayer: Player; bestSub: Player; gain: number; roleMismatch: boolean } => !!entry)
    .sort((a, b) => b.gain - a.gain);

  const best = candidates[0];
  if (!best) return null;

  const baseRequiredGain = Math.max(4, 12 - coachQuality * 0.08 - (minute >= 75 ? 2 : 0));
  const requiredGain = best.roleMismatch ? Math.max(2, baseRequiredGain - 5) : baseRequiredGain;
  if (best.gain < requiredGain) return null;

  return {
    playerOutId: best.id,
    playerIn: best.bestSub,
    slotIdx: best.slotIdx,
    reason: best.roleMismatch ? 'korekta pozycji po zmianie ustawienia' : 'dopasowanie profilu do nowej taktyki'
  };
};

const chooseHalftimeExpectationSub = (
  lineup: Lineup,
  players: Player[],
  fatigue: Record<string, number>,
  subsHistory: SubstitutionRecord[],
  status: HalftimeStatus,
  coachQuality: number,
  strengthDiff: number
): { playerOutId: string; playerIn: Player; slotIdx: number; reason: string } | null => {
  if (status !== 'CHASE_EXPECTED_RESULT' && status !== 'CHASE_UNDERDOG') return null;

  const tactic = TacticRepository.getById(lineup.tacticId);
  const benchPool = getAvailableBench(lineup, players, subsHistory).filter(p => p.position !== PlayerPosition.GK);
  if (benchPool.length === 0) return null;

  const candidates = lineup.startingXI
    .map((id, slotIdx) => ({ id, slotIdx, role: tactic.slots[slotIdx]?.role }))
    .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition } =>
      !!entry.id && entry.role !== PlayerPosition.GK && entry.role !== PlayerPosition.DEF
    )
    .map(entry => {
      const currentPlayer = getPlayer(players, entry.id);
      if (!currentPlayer) return null;
      const currentFatigue = fatigue[entry.id] ?? 100;
      const currentScore = getEmergencyFieldScore(currentPlayer, entry.role) + (currentFatigue - 72) * 0.16;
      const bestSub = [...benchPool]
        .sort((a, b) => {
          const bonusA = a.position === PlayerPosition.FWD ? 12 : a.position === PlayerPosition.MID ? 5 : 0;
          const bonusB = b.position === PlayerPosition.FWD ? 12 : b.position === PlayerPosition.MID ? 5 : 0;
          return getEmergencyFieldScore(b, entry.role) + bonusB - (getEmergencyFieldScore(a, entry.role) + bonusA);
        })[0];
      if (!bestSub) return null;
      const subScore = getEmergencyFieldScore(bestSub, entry.role) + (bestSub.position === PlayerPosition.FWD ? 12 : bestSub.position === PlayerPosition.MID ? 5 : 0);
      return { ...entry, currentPlayer, bestSub, gain: subScore - currentScore };
    })
    .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition; currentPlayer: Player; bestSub: Player; gain: number } => !!entry)
    .sort((a, b) => b.gain - a.gain);

  const best = candidates[0];
  if (!best) return null;

  const pressureBonus = status === 'CHASE_EXPECTED_RESULT' ? Math.min(6, Math.max(0, strengthDiff)) : -2;
  const requiredGain = Math.max(3, 13 - coachQuality * 0.07 - pressureBonus);
  if (best.gain < requiredGain) return null;

  return {
    playerOutId: best.id,
    playerIn: best.bestSub,
    slotIdx: best.slotIdx,
    reason: status === 'CHASE_EXPECTED_RESULT' ? 'przerwa: wynik poniżej oczekiwań' : 'przerwa: próba odwrócenia meczu'
  };
};

const chooseProtectResultSub = (
  lineup: Lineup,
  players: Player[],
  fatigue: Record<string, number>,
  subsHistory: SubstitutionRecord[],
  coachQuality: number,
  minute: number,
  reason: string,
  strengthDiff: number
): { playerOutId: string; playerIn: Player; slotIdx: number; reason: string } | null => {
  const tactic = TacticRepository.getById(lineup.tacticId);
  const benchPool = getAvailableBench(lineup, players, subsHistory).filter(p => p.position !== PlayerPosition.GK);
  if (benchPool.length === 0) return null;

  const candidates = lineup.startingXI
    .map((id, slotIdx) => ({ id, slotIdx, role: tactic.slots[slotIdx]?.role }))
    .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition } =>
      !!entry.id && entry.role !== PlayerPosition.GK
    )
    .map(entry => {
      const currentPlayer = getPlayer(players, entry.id);
      if (!currentPlayer) return null;
      const currentFatigue = fatigue[entry.id] ?? 100;
      const currentDefValue = currentPlayer.attributes.defending + currentPlayer.attributes.positioning * 0.55 + currentPlayer.attributes.strength * 0.35;
      const currentAttackValue = currentPlayer.attributes.finishing + currentPlayer.attributes.passing * 0.45 + currentPlayer.attributes.pace * 0.35;
      const tiredPenalty = Math.max(0, 76 - currentFatigue) * 0.22;
      const vulnerability = currentAttackValue - currentDefValue * 0.55 + tiredPenalty + (entry.role === PlayerPosition.FWD ? 10 : entry.role === PlayerPosition.MID ? 3 : -6);
      const bestSub = [...benchPool]
        .sort((a, b) => {
          const roleA = getEmergencyFieldScore(a, entry.role);
          const roleB = getEmergencyFieldScore(b, entry.role);
          const protectA = a.position === PlayerPosition.DEF ? 20 : a.position === PlayerPosition.MID ? 9 : -10;
          const protectB = b.position === PlayerPosition.DEF ? 20 : b.position === PlayerPosition.MID ? 9 : -10;
          return roleB + protectB - (roleA + protectA);
        })[0];
      if (!bestSub) return null;
      const subScore = getEmergencyFieldScore(bestSub, entry.role) + (bestSub.position === PlayerPosition.DEF ? 20 : bestSub.position === PlayerPosition.MID ? 9 : -10);
      const outScore = getEmergencyFieldScore(currentPlayer, entry.role) + (currentFatigue - 72) * 0.12;
      return { ...entry, currentPlayer, bestSub, gain: subScore - outScore + vulnerability * 0.18 };
    })
    .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition; currentPlayer: Player; bestSub: Player; gain: number } => !!entry)
    .sort((a, b) => b.gain - a.gain);

  const best = candidates[0];
  if (!best) return null;

  const favoritePressure = Math.max(0, strengthDiff) * 0.35;
  const minutePressure = minute >= 60 ? 3 : 0;
  const requiredGain = Math.max(1, 12 - coachQuality * 0.08 - favoritePressure - minutePressure);
  if (best.gain < requiredGain) return null;

  return {
    playerOutId: best.id,
    playerIn: best.bestSub,
    slotIdx: best.slotIdx,
    reason
  };
};

export const AiMatchDecisionService = {
  makeDecisions: (
    state: MatchLiveState,
    ctx: MatchContext,
    side: 'HOME' | 'AWAY',
    isPriority: boolean = false,
    isHalftime: boolean = false,
    lateMatchContext?: AiLateMatchContext
  ): AiDecisionResult => {
    const isHome = side === 'HOME';
    const logs: string[] = [];
    let aiTacticLockResult: boolean | undefined = undefined;

    const currentLineup = isHome ? state.homeLineup : state.awayLineup;
    const currentSubsCount = isHome ? state.subsCountHome : state.subsCountAway;
    const currentFatigue = isHome ? state.homeFatigue : state.awayFatigue;
    const currentInjuries = isHome ? state.homeInjuries : state.awayInjuries;
    const myPlayers = isHome ? ctx.homePlayers : ctx.awayPlayers;
    const oppPlayers = isHome ? ctx.awayPlayers : ctx.homePlayers;
    const mySubsHistory = isHome ? state.homeSubsHistory : state.awaySubsHistory;
    const myCoach = isHome ? ctx.homeCoach : ctx.awayCoach;
    const coachQuality = getCoachQuality(myCoach);

    const subCooldown = isPriority || isHalftime ? 0 : Math.max(2, Math.round(6 - (coachQuality / 100) * 4));
    const lastSubAction = state.lastAiSubMinute ?? state.lastAiActionMinute ?? 0;
    if (!isPriority && !isHalftime && (state.minute - lastSubAction < subCooldown)) {
      return { logs: [] };
    }

    const myScore = isHome ? state.homeScore : state.awayScore;
    const oppScore = isHome ? state.awayScore : state.homeScore;
    const scoreDiff = myScore - oppScore;
    const oppLineup = isHome ? state.awayLineup : state.homeLineup;
    const halftimeAssessment = assessHalftimeStatus(currentLineup, oppLineup, myPlayers, oppPlayers, scoreDiff);
    const opponentGoalkeeperCrisis = !hasReliableGoalkeeper(oppLineup, oppPlayers);
    const isFinalPhase = state.minute >= 76;
    const aiStakes = lateMatchContext?.aiStakes ?? 'MID_TABLE';
    const userStakes = lateMatchContext?.userStakes ?? 'MID_TABLE';
    const aiRank = lateMatchContext?.aiRank ?? 10;
    const userRank = lateMatchContext?.userRank ?? 10;
    const stakesWeight = getStakesWeight(aiStakes);
    const userStakesWeight = getStakesWeight(userStakes);
    const rivalryMultiplier = lateMatchContext?.rivalryMultiplier ?? 1;
    const lateSeasonDrama = (lateMatchContext?.isLateSeason ? stakesWeight : stakesWeight * 0.45) * rivalryMultiplier;
    const tablePressure = aiRank <= 5 || aiRank >= 13 || userRank <= 5 || userRank >= 13;
    const mustProtectLate = isFinalPhase && scoreDiff > 0 && (lateSeasonDrama >= 0.70 || userStakesWeight >= 0.75 || tablePressure);
    const mustChaseLate = isFinalPhase && scoreDiff < 0 && (lateSeasonDrama >= 0.70 || aiStakes !== 'LOW_STAKES');
    const avoidCollapseLate = isFinalPhase && scoreDiff <= -2 && (lateSeasonDrama >= 0.90 || aiStakes === 'RELEGATION_FIGHT');
    const desperationAllows4_2_4 = isFinalPhase && scoreDiff <= -2 && (aiStakes === 'TITLE_RACE' || aiStakes === 'RELEGATION_FIGHT');

    // [AI-COACH MIND-FLOW] Tu wchodzi "plan przedmeczowy" — patrz cała sekcja zdefiniowana wyżej
    // (getOpponentStrengthTier .. applyPlanDeviation). Liczone RAZ na wywołanie makeDecisions, bo
    // od tego zależy: (1) czy ten tick ma być całkowicie "zamrożony" (poniżej, w gate reactionChance),
    // (2) czy dyskrecjonalna (nie wymuszona Warstwą 0/1) zmiana taktyki jest w ogóle dopuszczona w
    // 1. połowie, (3) jak chętnie/jak szybko (posture) trener sięga po zmianę szyku formacji.
    const strengthAssessment = getOpponentStrengthTier(currentLineup, oppLineup, myPlayers, oppPlayers);
    const coachScoreState = getCoachScoreState(scoreDiff);
    const basePlan = getCoachPlan(strengthAssessment.tier, coachScoreState);
    const planAdherenceOutcome = resolvePlanAdherence({
      fixtureId: state.fixtureId,
      side,
      coachExperience: myCoach?.attributes.experience ?? 50,
      tier: strengthAssessment.tier,
      momentum: side === 'HOME' ? state.momentum : -state.momentum,
      lateSeasonDrama,
      rivalryMultiplier
    });
    const { plan: effectivePlan, freezeThisTick: aiFrozenByBadImprovisation } = applyPlanDeviation(basePlan, planAdherenceOutcome, strengthAssessment.tier, coachScoreState);

    let reactionChance = 0.35;
    if (isHalftime) {
      reactionChance = getHalftimeReactionChance(halftimeAssessment.status, coachQuality, scoreDiff);
    } else {
      reactionChance = isPriority ? 1.0 : (state.minute < 45 ? 0.30 : (state.minute < 75 ? 0.75 : 0.95));
      if (scoreDiff < 0) reactionChance += 0.20;
      if (opponentGoalkeeperCrisis) reactionChance += coachQuality >= 60 ? 0.28 : 0.16;
      if (isFinalPhase && (mustProtectLate || mustChaseLate)) reactionChance += 0.08 + lateSeasonDrama * 0.08;
      if (isFinalPhase && aiStakes === 'LOW_STAKES' && scoreDiff === 0) reactionChance -= 0.12;
      // [AI-COACH-CALIBRATION] ranga meczu poza końcówką: wcześniej lateSeasonDrama wpływało na
      // zachowanie trenera WYŁĄCZNIE od minuty 76 (isFinalPhase). Mecz o mistrzostwo/spadek powinien
      // być inny od 1. minuty, nie tylko w doliczonym czasie — stąd ten sam czynnik, przeskalowany
      // od 0 (minuta 0) do swojej pełnej wartości (minuta 75), żeby końcówka (gdzie już DZIAŁA pełny
      // mustProtectLate/mustChaseLate) nie dostała tego bonusu PODWÓJNIE.
      if (!isFinalPhase) reactionChance += lateSeasonDrama * 0.05 * Math.min(1, state.minute / 75);
    }
    const urgentTacticalContext =
      isPriority ||
      isHalftime ||
      mustProtectLate ||
      mustChaseLate ||
      avoidCollapseLate ||
      opponentGoalkeeperCrisis ||
      (scoreDiff < 0 && state.minute >= 60);

    reactionChance = Math.max(0.08, Math.min(0.98, reactionChance + (coachQuality - 50) * 0.004));
    if (urgentTacticalContext) {
      reactionChance = Math.max(reactionChance, isFinalPhase ? 0.82 : 0.72);
    }

    // [AI-COACH-FIX] aiFrozenByBadImprovisation — "porzucenie planu" w wariancie FREEZE (65% z
    // IMPROVISE_BADLY, patrz rollBadImprovisationMode): trener w tej minucie po prostu nic nie robi,
    // mimo że sytuacja by tego wymagała. Dopisane do TEGO SAMEGO gate co istniejący reactionChance,
    // bo to już jest jedyne miejsce w pliku, które kontroluje "czy w ogóle coś tickować" dla
    // dyskrecjonalnej (nie wymuszonej Warstwą 0/1 — kontuzja/czerwona/brak bramkarza) reakcji —
    // Warstwa 0/1 działa NIŻEJ w kodzie i nie jest tym gate'em w żaden sposób ograniczona.
    if (!isPriority) {
      if (Math.random() > reactionChance) return { logs: [] };
      if (aiFrozenByBadImprovisation && !urgentTacticalContext) return { logs: [] };
    }

    let newLineup = { ...currentLineup, startingXI: [...currentLineup.startingXI], bench: [...currentLineup.bench], reserves: [...currentLineup.reserves] };
    let newSubsCount = currentSubsCount;
    let subRecord: SubstitutionRecord | undefined;
    let newTacticId: string | undefined;
    let updatedActionMinute: number | undefined;
    let updatedSubMinute: number | undefined;
    let updatedFormationMinute: number | undefined;
    let updatedLateTacticChanges: number | undefined;
    let updatedLateTacticScoreDiff: number | undefined;
    let tacticLockUntilMinute: number | undefined = state.aiTacticLockUntilMinute;
    const lateTacticChanges = state.aiLateTacticChanges ?? 0;
    const lastLateTacticScoreDiff = state.aiLateTacticScoreDiffAtLastChange;
    const isExtremeLateTacticNeed =
      isFinalPhase &&
      lateTacticChanges < 2 &&
      state.minute >= 84 &&
      lateSeasonDrama >= 0.85 &&
      scoreDiff !== 0 &&
      lastLateTacticScoreDiff !== undefined &&
      Math.sign(scoreDiff) !== Math.sign(lastLateTacticScoreDiff);
    const canUsePlannedLateTactic = !isFinalPhase || lateTacticChanges === 0 || isExtremeLateTacticNeed;
    const markSubAction = () => {
      updatedActionMinute = state.minute;
      updatedSubMinute = state.minute;
    };
    const markFormationAction = (lockMinutes: number = 0) => {
      updatedActionMinute = state.minute;
      updatedFormationMinute = state.minute;
      if (lockMinutes > 0) {
        tacticLockUntilMinute = Math.max(tacticLockUntilMinute ?? 0, state.minute + lockMinutes);
        aiTacticLockResult = true;
      }
    };
    const markPlannedFormationAction = (lockMinutes: number = 0) => {
      markFormationAction(lockMinutes);
      if (isFinalPhase) {
        updatedLateTacticChanges = lateTacticChanges + 1;
        updatedLateTacticScoreDiff = scoreDiff;
      }
    };
    const applyTactic = (tacticId: string, lockSlotZeroId?: string) => {
      newLineup = applyTacticReassignment(newLineup, myPlayers, tacticId, lockSlotZeroId);
      tactic = TacticRepository.getById(newLineup.tacticId);
      newTacticId = tacticId;
    };
    const buildResult = (): AiDecisionResult => ({
      newLineup,
      newSubsCount,
      subRecord,
      newTacticId,
      lastAiActionMinute: updatedActionMinute,
      lastAiSubMinute: updatedSubMinute,
      lastAiFormationMinute: updatedFormationMinute,
      aiTacticLocked: aiTacticLockResult,
      aiTacticLockUntilMinute: tacticLockUntilMinute,
      aiLateTacticChanges: updatedLateTacticChanges,
      aiLateTacticScoreDiffAtLastChange: updatedLateTacticScoreDiff,
      logs
    });

    // [AI-COACH-FIX] let (było: const) — `tactic` musi być odświeżane (patrz "tactic = TacticRepository...
    // " w 7 miejscach niżej) zaraz po KAŻDEJ zmianie newLineup.tacticId w tej funkcji. Bez tego dalsza
    // część makeDecisions (np. sprawdzenie "czy jest dziura w obronie" po czerwonej kartce, albo wybór
    // zmiennika za zmęczenie) czytałaby mapę rola->miejsce ze STAREJ taktyki, mimo że skład już został
    // przebudowany pod nową — czyli ten sam błąd remapowania, tylko przesunięty o jeden krok dalej.
    let tactic = TacticRepository.getById(newLineup.tacticId);
    const mySentOffCount = state.sentOffIds.filter(id => myPlayers.some(p => p.id === id)).length;
    // [AI-COACH-CALIBRATION] tacticCooldown — minimalny odstęp (w minutach) między dwiema zmianami
    // taktyki tego samego trenera. Wcześniej była to STAŁA wartość 12 dla każdego trenera, co było
    // niespójne z `subCooldown` (linia ~806), który już od dawna skaluje się jakością trenera —
    // zgodnie z zasadą "lepszy trener reaguje szybciej, ma krótszy cooldown" (ustalone w rozmowie
    // o mind-flow trenera AI). Wzór skalibrowany tak, żeby przy coachQuality≈50 (przeciętny trener)
    // wciąż wychodziło ~12, czyli zachowanie "typowego" trenera AI się NIE zmienia — zmienia się tylko
    // rozstrzał między bardzo słabym (wolniejszy, do 16 min) i bardzo dobrym (szybszy, do 8 min) trenerem.
    // ZAKRES: 8 (coachQuality=100) .. 16 (coachQuality=0). KALIBRACJA: zwiększ stałe 16/8, żeby
    // poszerzyć/zmniejszyć różnicę między słabym i dobrym trenerem; getCoachQuality (góra pliku)
    // liczy coachQuality z experience*0.48 + decisionMaking*0.52, w skali 0-100.
    const tacticCooldown = Math.max(8, Math.round(16 - (coachQuality / 100) * 8));
    const tacticLockActive = (state.aiTacticLockUntilMinute ?? 0) > state.minute;
    const lastFormationAction = state.lastAiFormationMinute ?? state.lastAiActionMinute ?? 0;
    const canChangeTactic = !tacticLockActive && (state.minute - lastFormationAction) >= tacticCooldown;
    const canChangeTacticNow = isHalftime || canChangeTactic;
    // [AI-COACH-FIX] canChangeTacticDiscretionary — "w 1. połowie trener kręci tempem/nastawieniem,
    // nie przebudowuje formacji, OPRÓCZ naprawdę alarmujących sytuacji" (ustalone w rozmowie). UWAGA:
    // używać WYŁĄCZNIE przy DYSKRECJONALNYCH (nie wymuszonych) zmianach taktyki — reakcja na
    // czerwoną kartkę / kontuzję bramkarza (Warstwa 0/1, dalej w kodzie) celowo NIE jest tym
    // ograniczona, bo to są właśnie te "alarmujące sytuacje", które plan z definicji omija.
    // effectivePlan.allowFirstHalfTacticChange to JEDYNY zaplanowany wyjątek (patrz PLAN_TABLE:
    // przegrywanie z dużo słabszym rywalem) — poza tym 1. połowa = brak zmian formacji.
    const canChangeTacticDiscretionary = canChangeTacticNow &&
      (state.minute >= 46 || isHalftime || isPriority || effectivePlan.allowFirstHalfTacticChange);
    // [AI-COACH-FIX] crossFamilyAllowed — przed effectivePlan.crossFamilyEscalationMinute dozwolone
    // są TYLKO bezpieczne zmiany w obrębie tej samej rodziny formacji (getSameFamilyTactics) — czyli
    // takie, które z definicji nie przestawiają nikogo na inną rolę (patrz TACTIC_FAMILIES). Po tej
    // minucie dozwolona jest pełna zmiana szyku (inna liczba DEF/MID/FWD, wymagająca
    // applyTacticReassignment z prawdziwym przeliczeniem składu).
    const crossFamilyAllowed = isHalftime || isPriority || state.minute >= effectivePlan.crossFamilyEscalationMinute;
    const postureEagernessBonus = getPostureEagernessBonus(effectivePlan.posture);
    const tryApplyTacticSupportSub = (): boolean => {
      if (subRecord || newSubsCount >= MAX_LEAGUE_SUBS) return false;
      const supportSub = chooseTacticSupportSub(
        newLineup,
        myPlayers,
        currentFatigue,
        mySubsHistory,
        scoreDiff,
        coachQuality,
        state.minute
      );
      if (!supportSub) return false;

      const pOut = getPlayer(myPlayers, supportSub.playerOutId);
      newLineup = LineupService.swapPlayers(newLineup, supportSub.playerOutId, supportSub.playerIn.id, supportSub.slotIdx);
      newSubsCount++;
      subRecord = { playerOutId: supportSub.playerOutId, playerInId: supportSub.playerIn.id, minute: state.minute };
      markSubAction();
      logs.push(`${state.minute}' ${supportSub.playerIn.lastName} zastępuje ${pOut?.lastName} (${supportSub.reason}).`);
      return true;
    };

    const severeInjuredId = newLineup.startingXI.find(id => id && currentInjuries[id] === InjurySeverity.SEVERE);
    if (severeInjuredId) {
      const slotIdx = newLineup.startingXI.indexOf(severeInjuredId);
      const injuredPlayer = getPlayer(myPlayers, severeInjuredId);

      if (newSubsCount >= MAX_LEAGUE_SUBS) {
        if (slotIdx === 0) {
          const fieldCover = pickBestFieldPlayerForGoal(newLineup, myPlayers);
          if (fieldCover) {
            newLineup.startingXI[0] = fieldCover.player.id;
            newLineup.startingXI[fieldCover.index] = null;
            if (!newLineup.reserves.includes(severeInjuredId)) newLineup.reserves.push(severeInjuredId);
            const defensiveTactic = DEFENSIVE_TACTICS.find(id => id !== newLineup.tacticId);
            if (defensiveTactic && canChangeTactic) {
              // [AI-COACH-FIX] lockSlotZeroId=fieldCover.player.id: ${fieldCover.player.lastName} już
              // stoi w bramce (decyzja podjęta linię wyżej przez pickBestFieldPlayerForGoal) — nie
              // pozwalamy applyTacticReassignment jeszcze raz "wybrać" bramkarza inną formułą, tylko
              // przebudowujemy pozostałe 10 miejsc pod nową, defensywną taktykę.
              applyTactic(defensiveTactic, fieldCover.player.id);
              markFormationAction(tacticCooldown);
            }
            logs.push(`Brak zmian. ${fieldCover.player.lastName} przejmuje bramkę po kontuzji ${injuredPlayer?.lastName ?? 'bramkarza'}, a drużyna cofa ustawienie.`);
          }
        } else {
          logs.push(`Brak zmian. ${injuredPlayer?.lastName ?? 'Kontuzjowany zawodnik'} musi opuścić boisko, zespół gra w osłabieniu.`);
        }

        return buildResult();
      }

      if (slotIdx === 0) {
        const hasBenchGoalkeeper = getAvailableBench(newLineup, myPlayers, mySubsHistory).some(p => p.position === PlayerPosition.GK);
        if (!hasBenchGoalkeeper) {
          const noGkResponse = chooseNoBenchGoalkeeperResponse(newLineup, myPlayers, severeInjuredId, mySubsHistory);
          if (noGkResponse) {
            newLineup = noGkResponse.lineup;
            newSubsCount++;
            subRecord = { playerOutId: severeInjuredId, playerInId: noGkResponse.sub.id, minute: state.minute };
            const defensiveTactic = DEFENSIVE_TACTICS.find(id => id !== newLineup.tacticId);
            if (defensiveTactic && canChangeTactic) {
              // lockSlotZeroId=noGkResponse.fieldCover.id — patrz komentarz przy poprzednim bloku z tym samym wzorcem.
              applyTactic(defensiveTactic, noGkResponse.fieldCover.id);
              markFormationAction(tacticCooldown);
            }
            markSubAction();
            logs.push(`${state.minute}' ${noGkResponse.fieldCover.lastName} przejmuje bramkę, a ${noGkResponse.sub.lastName} wchodzi w pole po kontuzji ${injuredPlayer?.lastName ?? 'bramkarza'}.`);

            return buildResult();
          }
        }
      }

      const injuryResponse = chooseInjuryResponse(
        newLineup,
        myPlayers,
        severeInjuredId,
        slotIdx,
        scoreDiff,
        coachQuality,
        mySubsHistory,
        canChangeTactic
      );

        if (injuryResponse) {
          newLineup = injuryResponse.lineup;
          newSubsCount++;
          subRecord = { playerOutId: severeInjuredId, playerInId: injuryResponse.sub.id, minute: state.minute };
          markSubAction();
          if (injuryResponse.newTacticId) {
            newTacticId = injuryResponse.newTacticId;
            tactic = TacticRepository.getById(newLineup.tacticId); // odśwież — patrz komentarz przy `let tactic`
            markFormationAction();
          }
        logs.push(`${state.minute}' ${injuryResponse.sub.lastName} zastępuje ${injuredPlayer?.lastName ?? 'kontuzjowanego'} (${injuryResponse.note}).`);

        return buildResult();
      }

      if (slotIdx === 0) {
        const fieldCover = pickBestFieldPlayerForGoal(newLineup, myPlayers);
        if (fieldCover) {
          newLineup.startingXI[0] = fieldCover.player.id;
          newLineup.startingXI[fieldCover.index] = null;
          if (!newLineup.reserves.includes(severeInjuredId)) newLineup.reserves.push(severeInjuredId);
          const defensiveTactic = DEFENSIVE_TACTICS.find(id => id !== newLineup.tacticId);
          if (defensiveTactic && canChangeTactic) {
            // lockSlotZeroId=fieldCover.player.id — patrz komentarz przy pierwszym bloku z tym samym wzorcem (linia ~921).
            applyTactic(defensiveTactic, fieldCover.player.id);
            markFormationAction(tacticCooldown);
          }
          logs.push(`Brak rezerwowego bramkarza. ${fieldCover.player.lastName} przejmuje bramkę po kontuzji ${injuredPlayer?.lastName ?? 'bramkarza'}.`);

          return buildResult();
        }
      }
    }

    const gkInSlot = newLineup.startingXI[0];
    if (gkInSlot === null) {
      const benchPool = getAvailableBench(newLineup, myPlayers, mySubsHistory);
      const bestGkOnBench = benchPool
        .filter(p => p.position === PlayerPosition.GK)
        .sort((a, b) => getReadinessOverall(b) - getReadinessOverall(a))[0];

      if (bestGkOnBench && currentSubsCount < MAX_LEAGUE_SUBS) {
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
          markSubAction();
          logs.push(`Bramkarz rezerwowy ${bestGkOnBench.lastName} zastępuje gracza z pola.`);
        }
      } else {
        const fieldCover = pickBestFieldPlayerForGoal(newLineup, myPlayers);
        if (fieldCover) {
          newLineup.startingXI[0] = fieldCover.player.id;
          newLineup.startingXI[fieldCover.index] = null;
          logs.push(`Niecodzienna sytuacja. ${fieldCover.player.lastName} musi stanąć między słupkami.`);
        }
      }
    }

    if (mySentOffCount > 0) {
      if (!newTacticId && !tacticLockActive) {
        const tacticPool = scoreDiff >= 0 ? DEFENSIVE_TACTICS : SOLID_DEFENSIVE_TACTICS;
        const candidates = tacticPool.filter(t => t !== newLineup.tacticId);
        if (candidates.length > 0) {
          // [AI-COACH-FIX] applyTacticReassignment — TO JEST GŁÓWNA NAPRAWA opisanego błędu: bez tego
          // wiersza zmieniał się tylko newLineup.tacticId, a 11 zawodników zostawało na starych
          // miejscach, więc po czerwonej kartce mogli "automatycznie" stać się obrońcami/pomocnikami/
          // napastnikami bez żadnej faktycznej zmiany ustawienia — i dostawać karę za złą pozycję.
          applyTactic(candidates[0]);
          markFormationAction(tacticCooldown);
          logs.push(`Zmiana taktyki po czerwonej kartce: ${newTacticId}.`);
        }
      } else if (tacticLockActive) {
        aiTacticLockResult = true;
      }

      const defSlots = tactic.slots.filter(s => s.role === PlayerPosition.DEF).map(s => s.index);
      const emptyDefIdx = defSlots.find(idx => newLineup.startingXI[idx] === null);

      if (emptyDefIdx !== undefined && !subRecord) {
        if (newSubsCount < MAX_LEAGUE_SUBS) {
          const bestDefOnBench = getAvailableBench(newLineup, myPlayers, mySubsHistory)
            .filter(p => p.position === PlayerPosition.DEF)
            .sort((a, b) => getReadinessOverall(b) - getReadinessOverall(a))[0];

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
              markSubAction();
              logs.push(`Zmiana wymuszona sytuacją. ${bestDefOnBench.lastName} wchodzi do obrony.`);
            }
          }
        } else {
          const bestInternalCover = newLineup.startingXI
            .map((id, idx) => ({ id, idx, player: getPlayer(myPlayers, id) }))
            .filter((item): item is { id: string; idx: number; player: Player } =>
              !!item.player && tactic.slots[item.idx].role !== PlayerPosition.DEF && tactic.slots[item.idx].role !== PlayerPosition.GK
            )
            .sort((a, b) =>
              (b.player.attributes.defending * getReadinessMultiplier(b.player)) -
              (a.player.attributes.defending * getReadinessMultiplier(a.player))
            )[0];

          if (bestInternalCover) {
            newLineup.startingXI[emptyDefIdx] = bestInternalCover.id;
            newLineup.startingXI[bestInternalCover.idx] = null;
            logs.push(`Brak zmian. ${bestInternalCover.player.lastName} musi zagrać w obronie.`);
          }
        }
      }
    }

    if (!subRecord && currentSubsCount < MAX_LEAGUE_SUBS) {
      const emptySlotIdx = newLineup.startingXI.findIndex(id => id === null);

      if (emptySlotIdx !== -1) {
        const currentOnPitchCount = newLineup.startingXI.filter(id => id !== null).length;
        const maxAllowedOnPitch = 11 - mySentOffCount;

        if (currentOnPitchCount < maxAllowedOnPitch) {
          const requiredRole = tactic.slots[emptySlotIdx].role;
          const benchPool = getAvailableBench(newLineup, myPlayers, mySubsHistory);
          const rolePool = requiredRole === PlayerPosition.GK
            ? benchPool.filter(p => p.position === PlayerPosition.GK)
            : benchPool.filter(p => p.position !== PlayerPosition.GK);
          const finalPool = rolePool.length > 0 ? rolePool : benchPool;
          const bestSub = [...finalPool].sort((a, b) => getEmergencyFieldScore(b, requiredRole) - getEmergencyFieldScore(a, requiredRole))[0];

          if (bestSub) {
            newLineup.startingXI[emptySlotIdx] = bestSub.id;
            newLineup.bench = newLineup.bench.filter(id => id !== bestSub.id);
            newSubsCount = currentSubsCount + 1;
            subRecord = { playerOutId: 'NONE', playerInId: bestSub.id, minute: state.minute };
            markSubAction();
            logs.push(`Zmiana, ${bestSub.lastName} wchodzi w miejsce zniesionego gracza.`);
          }
        }
      }
    }

    if (!subRecord && currentSubsCount < MAX_LEAGUE_SUBS) {
      const subsRemaining = MAX_LEAGUE_SUBS - currentSubsCount;
      const lightInjuryCandidates = newLineup.startingXI
        .filter((id): id is string => !!id && currentInjuries[id] === InjurySeverity.LIGHT)
        .map(id => {
          const player = getPlayer(myPlayers, id);
          const fatigue = currentFatigue[id] ?? 100;
          if (!player) return null;
          return {
            id,
            player,
            fatigue,
            urgency: getLightInjuryUrgency(player, fatigue, state.minute, subsRemaining, scoreDiff)
          };
        })
        .filter((entry): entry is { id: string; player: Player; fatigue: number; urgency: number } => !!entry)
        .sort((a, b) => b.urgency - a.urgency);

      const lightCandidate = lightInjuryCandidates.find(entry =>
        shouldTryLightInjurySub(entry.urgency, entry.player, entry.fatigue, coachQuality, isPriority, isHalftime)
      );

      if (lightCandidate) {
        const slotIdx = newLineup.startingXI.indexOf(lightCandidate.id);
        const allowTacticalResponse = canChangeTacticNow && coachQuality >= 58 && lightCandidate.urgency >= 48;
        const injuryResponse = chooseInjuryResponse(
          newLineup,
          myPlayers,
          lightCandidate.id,
          slotIdx,
          scoreDiff,
          coachQuality,
          mySubsHistory,
          allowTacticalResponse
        );

        if (injuryResponse) {
          newLineup = injuryResponse.lineup;
          newSubsCount = currentSubsCount + 1;
          subRecord = { playerOutId: lightCandidate.id, playerInId: injuryResponse.sub.id, minute: state.minute };
          markSubAction();
          if (injuryResponse.newTacticId) {
            newTacticId = injuryResponse.newTacticId;
            tactic = TacticRepository.getById(newLineup.tacticId); // odśwież — patrz komentarz przy `let tactic`
            markFormationAction();
          }
          const reason = lightCandidate.fatigue < 58 ? 'lekki uraz i spadek kondycji' : 'profilaktyka po urazie';
          logs.push(`${state.minute}' ${injuryResponse.sub.lastName} zastępuje ${lightCandidate.player.lastName} (${reason}).`);
        }
      }
    }

    if (isHalftime && !subRecord && halftimeAssessment.status !== 'NEUTRAL') {
      const plannedTactic = !newTacticId && canChangeTacticNow
        ? chooseHalftimeTacticResponse(newLineup, myPlayers, halftimeAssessment.status, coachQuality, scoreDiff, myCoach, postureEagernessBonus)
        : null;

      if (plannedTactic) {
        // [AI-COACH-FIX] applyTacticReassignment — patrz szerszy komentarz przy bloku czerwonej kartki.
        applyTactic(plannedTactic);
        markFormationAction();
        tryApplyTacticSupportSub();
        const statusText = halftimeAssessment.status === 'PROTECT_RESULT'
          ? 'korzystny wynik z mocniejszym rywalem'
          : halftimeAssessment.status === 'CONTROL_GAME'
            ? 'kontrola korzystnego wyniku'
            : 'wynik poniżej oczekiwań';
        logs.push(`${state.minute}' Przerwa: trener ocenia ${statusText} i koryguje ustawienie na ${plannedTactic}.`);
      }

      if (!subRecord && currentSubsCount < MAX_LEAGUE_SUBS) {
        const halftimeSub = chooseHalftimeExpectationSub(
          newLineup,
          myPlayers,
          currentFatigue,
          mySubsHistory,
          halftimeAssessment.status,
          coachQuality,
          halftimeAssessment.strengthDiff
        );

        if (halftimeSub) {
          const pOut = getPlayer(myPlayers, halftimeSub.playerOutId);
          newLineup = LineupService.swapPlayers(newLineup, halftimeSub.playerOutId, halftimeSub.playerIn.id, halftimeSub.slotIdx);
          newSubsCount = currentSubsCount + 1;
          subRecord = { playerOutId: halftimeSub.playerOutId, playerInId: halftimeSub.playerIn.id, minute: state.minute };
          markSubAction();
          logs.push(`${state.minute}' ${halftimeSub.playerIn.lastName} zastępuje ${pOut?.lastName} (${halftimeSub.reason}).`);
        }
      }
    }

    const shouldProtectResultWindow =
      !subRecord &&
      currentSubsCount < MAX_LEAGUE_SUBS &&
      (halftimeAssessment.status === 'PROTECT_RESULT' || halftimeAssessment.status === 'CONTROL_GAME') &&
      (isHalftime || (state.minute >= 60 && state.minute <= 75 && scoreDiff >= 0));

    if (shouldProtectResultWindow) {
      const protectReason = isHalftime
        ? halftimeAssessment.status === 'PROTECT_RESULT'
          ? 'przerwa: dowiezienie wyniku z faworytem'
          : 'przerwa: zabezpieczenie przewagi'
        : halftimeAssessment.status === 'PROTECT_RESULT'
          ? '60-75: wynik ponad stan, zabezpieczenie'
          : '60-75: kontrola korzystnego wyniku';
      const protectSub = chooseProtectResultSub(
        newLineup,
        myPlayers,
        currentFatigue,
        mySubsHistory,
        coachQuality,
        state.minute,
        protectReason,
        halftimeAssessment.strengthDiff
      );

      if (protectSub) {
        const pOut = getPlayer(myPlayers, protectSub.playerOutId);
        newLineup = LineupService.swapPlayers(newLineup, protectSub.playerOutId, protectSub.playerIn.id, protectSub.slotIdx);
        newSubsCount = currentSubsCount + 1;
        subRecord = { playerOutId: protectSub.playerOutId, playerInId: protectSub.playerIn.id, minute: state.minute };
        markSubAction();
        logs.push(`${state.minute}' ${protectSub.playerIn.lastName} zastępuje ${pOut?.lastName} (${protectSub.reason}).`);
      }
    }

    if (!newTacticId && opponentGoalkeeperCrisis && canChangeTacticDiscretionary && canUsePlannedLateTactic) {
      const goalkeeperCrisisResponse = chooseOpponentGoalkeeperCrisisResponse(
        newLineup,
        myPlayers,
        oppLineup,
        oppPlayers,
        scoreDiff,
        coachQuality,
        myCoach,
        crossFamilyAllowed
      );

      if (goalkeeperCrisisResponse) {
        // [AI-COACH-FIX] applyTacticReassignment — patrz szerszy komentarz przy bloku czerwonej kartki.
        applyTactic(goalkeeperCrisisResponse.tacticId);
        markFormationAction(goalkeeperCrisisResponse.reason === 'reckless_push' ? 6 : 10);
        tryApplyTacticSupportSub();
        logs.push(
          goalkeeperCrisisResponse.reason === 'reckless_push'
            ? `${state.minute}' Trener widzi problem z bramkarzem rywala i każe mocno zaatakować: ${newTacticId}.`
            : `${state.minute}' Trener wykorzystuje kryzys bramkarski rywala, ale zostawia zabezpieczenie przed kontrą: ${newTacticId}.`
        );
      }
    }

    if (!subRecord && shouldReactToScore(scoreDiff, state.minute, coachQuality, isHalftime)) {
      const plannedTactic = !newTacticId && canChangeTacticDiscretionary && canUsePlannedLateTactic
        ? chooseScoreTacticResponse(newLineup, myPlayers, scoreDiff, coachQuality, myCoach, crossFamilyAllowed, postureEagernessBonus)
        : null;

      if (plannedTactic) {
        // [AI-COACH-FIX] applyTacticReassignment — patrz szerszy komentarz przy bloku czerwonej kartki.
        applyTactic(plannedTactic);
        markPlannedFormationAction(isFinalPhase ? 18 : 0);
        tryApplyTacticSupportSub();
        const direction = scoreDiff < 0 ? 'odważniej' : 'bezpieczniej';
        logs.push(`${state.minute}' Trener reaguje na wynik i ustawia zespół ${direction}: ${plannedTactic}.`);
      }

      // [AI-COACH-FIX] usunięto wcześniejsze "scoreDiff <= -2 || state.minute >= 40" jako osobne
      // wcześniejsze odblokowanie zmiany — to były dokładnie te "szablonowe", przedwczesne reakcje
      // sprzed 1. połowy, o których mówiliśmy. Teraz: zmiana z powodu wyniku tylko od 46. minuty
      // (chooseScoreImpulseSub ma to też wewnątrz, na wszelki wypadek) albo w przerwie.
      if (!subRecord && currentSubsCount < MAX_LEAGUE_SUBS && (state.minute >= 46 || isHalftime)) {
        const impulseSub = chooseScoreImpulseSub(
          newLineup,
          myPlayers,
          currentFatigue,
          mySubsHistory,
          scoreDiff,
          coachQuality,
          state.minute
        );

        if (impulseSub) {
          const pOut = getPlayer(myPlayers, impulseSub.playerOutId);
          newLineup = LineupService.swapPlayers(newLineup, impulseSub.playerOutId, impulseSub.playerIn.id, impulseSub.slotIdx);
          newSubsCount = currentSubsCount + 1;
          subRecord = { playerOutId: impulseSub.playerOutId, playerInId: impulseSub.playerIn.id, minute: state.minute };
          markSubAction();
          logs.push(`${state.minute}' ${impulseSub.playerIn.lastName} zastępuje ${pOut?.lastName} (${impulseSub.reason}).`);
        }
      }
    }

    if (!subRecord && currentSubsCount < MAX_LEAGUE_SUBS && isFinalPhase) {
      const benchPool = getAvailableBench(newLineup, myPlayers, mySubsHistory).filter(p => p.position !== PlayerPosition.GK);
      const tacticSlots = TacticRepository.getById(newLineup.tacticId).slots;
      const canUseBench = benchPool.length > 0;

      if (canUseBench && (mustProtectLate || avoidCollapseLate || mustChaseLate)) {
        const protectMode = mustProtectLate || (avoidCollapseLate && (state.minute < 86 || coachQuality >= 62));
        const fieldCandidates = newLineup.startingXI
          .map((id, slotIdx) => ({ id, slotIdx, role: tacticSlots[slotIdx]?.role }))
          .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition } =>
            !!entry.id && entry.role !== PlayerPosition.GK
          )
          .map(entry => {
            const player = getPlayer(myPlayers, entry.id);
            if (!player) return null;
            const fatigue = currentFatigue[entry.id] ?? 100;
            const tiredPenalty = Math.max(0, 72 - fatigue) * 0.34;
            const attackValue = player.attributes.finishing + player.attributes.passing * 0.5 + player.attributes.pace * 0.35;
            const defendValue = player.attributes.defending + player.attributes.positioning * 0.55 + player.attributes.strength * 0.35;
            const urgency = protectMode
              ? attackValue - defendValue * 0.55 + tiredPenalty
              : defendValue - attackValue * 0.55 + tiredPenalty;
            return { ...entry, player, fatigue, urgency };
          })
          .filter((entry): entry is { id: string; slotIdx: number; role: PlayerPosition; player: Player; fatigue: number; urgency: number } => !!entry)
          .sort((a, b) => b.urgency - a.urgency);

        const outgoing = fieldCandidates[0];
        if (outgoing) {
          const bestSub = [...benchPool]
            .sort((a, b) => {
              const roleA = getEmergencyFieldScore(a, outgoing.role);
              const roleB = getEmergencyFieldScore(b, outgoing.role);
              const protectA = a.position === PlayerPosition.DEF ? 20 : a.position === PlayerPosition.MID ? 8 : -8;
              const protectB = b.position === PlayerPosition.DEF ? 20 : b.position === PlayerPosition.MID ? 8 : -8;
              const chaseA = a.position === PlayerPosition.FWD ? 22 : a.position === PlayerPosition.MID ? 8 : -10;
              const chaseB = b.position === PlayerPosition.FWD ? 22 : b.position === PlayerPosition.MID ? 8 : -10;
              return (roleB + (protectMode ? protectB : chaseB)) - (roleA + (protectMode ? protectA : chaseA));
            })[0];

          if (bestSub) {
            const subScore = getEmergencyFieldScore(bestSub, outgoing.role);
            const outScore = getEmergencyFieldScore(outgoing.player, outgoing.role) + ((outgoing.fatigue - 70) * 0.12);
            const requiredGain = protectMode
              ? Math.max(-6, 8 - coachQuality * 0.10 - lateSeasonDrama * 4)
              : Math.max(-3, 10 - coachQuality * 0.09 - lateSeasonDrama * 5);

            if (subScore - outScore >= requiredGain || outgoing.fatigue < 68 || state.minute >= 84) {
              newLineup = LineupService.swapPlayers(newLineup, outgoing.id, bestSub.id, outgoing.slotIdx);
              newSubsCount = currentSubsCount + 1;
              subRecord = { playerOutId: outgoing.id, playerInId: bestSub.id, minute: state.minute };
              markSubAction();
              const reason = protectMode
                ? mustProtectLate
                  ? 'końcówka: obrona wyniku'
                  : 'końcówka: ograniczenie strat'
                : 'końcówka: wszystko na jedną kartę';
              logs.push(`${state.minute}' ${bestSub.lastName} zastępuje ${outgoing.player.lastName} (${reason}).`);
            }
          }
        }
      }

      if (!newTacticId && canChangeTacticNow && canUsePlannedLateTactic) {
        const lateTacticScoreDiff = mustChaseLate && !avoidCollapseLate ? Math.min(-1, scoreDiff) : Math.max(1, scoreDiff);
        const lateTactic = (mustChaseLate || mustProtectLate || avoidCollapseLate)
          ? chooseScoreTacticResponse(newLineup, myPlayers, lateTacticScoreDiff, coachQuality, myCoach, crossFamilyAllowed, postureEagernessBonus)
          : null;
        if (lateTactic) {
          // [AI-COACH-FIX] applyTacticReassignment — patrz szerszy komentarz przy bloku czerwonej kartki.
          applyTactic(lateTactic);
          markPlannedFormationAction(isExtremeLateTacticNeed ? 12 : 18);
          tryApplyTacticSupportSub();
          const direction = mustChaseLate && !avoidCollapseLate ? 'rzuca zespół do ataku' : 'zamyka końcówkę bezpieczniej';
          logs.push(`${state.minute}' Trener ${direction}: ${lateTactic}.`);
        }
      }
    }

    if (!subRecord && currentSubsCount < MAX_LEAGUE_SUBS) {
      let playerOutId: string | null = null;
      let reason = '';

      if (isHalftime || state.minute >= 46) {
        const fatigueThreshold = isHalftime
          ? halftimeAssessment.status === 'PROTECT_RESULT'
            ? 72
            : halftimeAssessment.status === 'CONTROL_GAME'
              ? 78
              : halftimeAssessment.status === 'CHASE_EXPECTED_RESULT'
                ? 90
                : halftimeAssessment.status === 'CHASE_UNDERDOG'
                  ? 84
                  : 82
          : state.minute < 56
            ? scoreDiff < 0
              ? 72
              : scoreDiff > 0
                ? 62
                : 68
          : 88;
        const candidates = newLineup.startingXI
          .filter((id): id is string => id !== null)
          .map(id => ({ id, fatigue: currentFatigue[id] || 100 }))
          .filter(c => c.fatigue < fatigueThreshold)
          .sort((a, b) => a.fatigue - b.fatigue);

        if (candidates.length > 0) {
          playerOutId = candidates[0].id;
          reason = isHalftime ? 'zmiana taktyczna' : 'zmęczenie';
        } else if (isHalftime && scoreDiff < 0) {
          const fieldPlayers = newLineup.startingXI
            .slice(1)
            .filter((id): id is string => id !== null)
            .map(id => getPlayer(myPlayers, id))
            .filter((p): p is Player => !!p)
            .sort((a, b) => getReadinessOverall(a) - getReadinessOverall(b));

          if (fieldPlayers.length > 0) {
            playerOutId = fieldPlayers[0].id;
            reason = 'impuls managera';
          }
        }
      }

      if (playerOutId) {
        const slotIdx = newLineup.startingXI.indexOf(playerOutId);
        const requiredRole = tactic.slots[slotIdx].role;
        const benchPool = getAvailableBench(newLineup, myPlayers, mySubsHistory);
        const rolePool = requiredRole === PlayerPosition.GK
          ? benchPool.filter(p => p.position === PlayerPosition.GK)
          : benchPool.filter(p => p.position !== PlayerPosition.GK);
        const bestSub = [...rolePool].sort((a, b) => {
          let scoreA = getEmergencyFieldScore(a, requiredRole);
          let scoreB = getEmergencyFieldScore(b, requiredRole);
          if (scoreDiff < 0 && b.position === PlayerPosition.FWD) scoreB += 25;
          if (scoreDiff < 0 && a.position === PlayerPosition.FWD) scoreA += 25;
          return scoreB - scoreA;
        })[0];

        if (bestSub) {
          const pOut = getPlayer(myPlayers, playerOutId);
          newLineup = LineupService.swapPlayers(newLineup, playerOutId, bestSub.id, slotIdx);
          newSubsCount = currentSubsCount + 1;
          subRecord = { playerOutId, playerInId: bestSub.id, minute: state.minute };
          markSubAction();
          logs.push(`${isHalftime ? '' : state.minute + '\''} ${bestSub.lastName} zastępuje ${pOut?.lastName} (${reason}).`);
        }
      }
    }

    if (state.minute > 20 && !newTacticId && canChangeTactic && canUsePlannedLateTactic) {
      if (scoreDiff < -1 && state.minute > 45) {
        const lateTactic = chooseScoreTacticResponse(newLineup, myPlayers, scoreDiff, coachQuality, myCoach, crossFamilyAllowed, postureEagernessBonus);
        if (lateTactic) {
          // [AI-COACH-FIX] applyTacticReassignment — patrz szerszy komentarz przy bloku czerwonej kartki.
          applyTactic(lateTactic);
          markPlannedFormationAction(isFinalPhase ? 18 : 0);
          tryApplyTacticSupportSub();
          logs.push(`Zmiana ustawienia na ${newTacticId}.`);
        }
      } else if (scoreDiff > 0 && state.minute > 75 && mySentOffCount === 0) {
        const lateTactic = chooseScoreTacticResponse(newLineup, myPlayers, scoreDiff, coachQuality, myCoach, crossFamilyAllowed, postureEagernessBonus);
        if (lateTactic) {
          // [AI-COACH-FIX] applyTacticReassignment — patrz szerszy komentarz przy bloku czerwonej kartki.
          applyTactic(lateTactic);
          markPlannedFormationAction(18);
          tryApplyTacticSupportSub();
          logs.push(`Zmiana ustawienia na ${newTacticId}.`);
        }
      }
    }

    return buildResult();
  }
};
