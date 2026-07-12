import { Club, Player, PlayerPosition, Coach, InstructionTempo, InstructionMindset, InstructionIntensity, InstructionPressing, InstructionCounterAttack, InstructionPassing } from '../types';
import { TacticRepository } from '../resources/tactics_db';
import { AiOpponentMatchReport } from './AiOpponentAnalysisService';

type AiInstructions = {
  tempo: InstructionTempo;
  mindset: InstructionMindset;
  intensity: InstructionIntensity;
  pressing?: InstructionPressing;
  counterAttack?: InstructionCounterAttack;
  passing?: InstructionPassing;
  // AI Exploit Window:
  // Optional minute until which MatchLiveView may keep this in-match instruction active even
  // if the next AI decision tick returns null. This exists because a good coach should not
  // instantly abandon a discovered player mistake (for example no second-half substitutions,
  // a tired defensive line, or an overcommitted FAST + OFFENSIVE setup) just because the next
  // periodic decision cycle has no new tactical change.
  //
  // Calibration:
  // - Duration is produced in decideInMatchInstructions from coachScore and a small seeded
  //   random component. Raising the duration makes AI pressure feel more persistent.
  // - Keep this as a minute marker rather than a boolean so MatchLiveView can expire the
  //   pressure without coupling itself to the scoring logic below.
  exploitUntilMinute?: number;
};

type InMatchDecisionContext = {
  aiAvgFatigue?: number;
  aiLowestFatigue?: number;
  aiShots?: number;
  userShots?: number;
  aiShotsOnTarget?: number;
  userShotsOnTarget?: number;
  aiSubsRemaining?: number;
  aiStakes?: 'TITLE_RACE' | 'EUROPE_RACE' | 'RELEGATION_FIGHT' | 'MID_TABLE' | 'LOW_STAKES';
  userStakes?: 'TITLE_RACE' | 'EUROPE_RACE' | 'RELEGATION_FIGHT' | 'MID_TABLE' | 'LOW_STAKES';
  aiRank?: number;
  userRank?: number;
  isLateSeason?: boolean;
  rivalryMultiplier?: number;
  aiSentOffCount?: number;
  // Player-side weakness signals for the AI exploit detector. These are intentionally passed
  // as already-normalized match facts instead of making this service inspect MatchLiveState
  // directly. That keeps the tactical brain focused on decisions and lets MatchLiveView own
  // live-state extraction.
  //
  // Calibration:
  // - userAvgFatigue/userLowestFatigue affect how quickly AI reads tired legs.
  // - userSubsRemaining is inverted from "subs used"; 4-5 remaining after 60' means the
  //   player barely used the bench and should become easier to punish if AI has rotated.
  // - userGoalkeeperCrisis is a high-confidence signal and therefore receives a large weight.
  userAvgFatigue?: number;
  userLowestFatigue?: number;
  userSubsRemaining?: number;
  userSentOffCount?: number;
  userGoalkeeperCrisis?: boolean;
  userTempo?: InstructionTempo;
  aiPaceAvg?: number;
  aiTechAvg?: number;
  userPaceAvg?: number;
  userTechAvg?: number;
};

const seededRng = (seed: number, minute: number, offset: number = 0): number => {
  let s = seed + minute + offset;
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
};

// Reguły spójności: DEFENSIVE nigdy FAST; OFFENSIVE nigdy SLOW ani CAUTIOUS
const enforceConsistency = (m: InstructionMindset, t: InstructionTempo, i: InstructionIntensity): AiInstructions => {
  let tempo = t, mindset = m, intensity = i;
  if (mindset === 'DEFENSIVE' && tempo === 'FAST') tempo = 'NORMAL';
  if (mindset === 'OFFENSIVE') {
    if (tempo === 'SLOW') tempo = 'NORMAL';
    if (intensity === 'CAUTIOUS') intensity = 'NORMAL';
  }
  return { tempo, mindset, intensity };
};

const getTopLineAvg = (players: Player[], pos: PlayerPosition, topN: number): number => {
  const line = players
    .filter(p => p.position === pos)
    .sort((a, b) => b.overallRating - a.overallRating)
    .slice(0, topN);
  if (line.length === 0) return 60;
  return line.reduce((s, p) => s + p.overallRating, 0) / line.length;
};

const getStakesWeight = (stakes?: InMatchDecisionContext['aiStakes']): number => {
  if (stakes === 'TITLE_RACE') return 1.0;
  if (stakes === 'RELEGATION_FIGHT') return 1.15;
  if (stakes === 'EUROPE_RACE') return 0.78;
  if (stakes === 'LOW_STAKES') return 0.16;
  return 0.42;
};

const pickInMatchPassing = (
  seed: number,
  minute: number,
  coachAccuracy: number,
  paceGap: number,
  techGap: number,
  accurateOffset: number,
  randomOffset: number
): InstructionPassing => {
  // Shared helper for in-match pass-style decisions, including the exploit branch below.
  // The same pace/tech interpretation is used for normal AI choices and exploit windows:
  // pace advantage favors LONG transitions, while technical superiority or pace deficit
  // favors SHORT combinations.
  //
  // Calibration:
  // - coachAccuracy is the primary knob. Higher values make strong coaches pick the
  //   "correct" pass style more often; lower values increase random pass-style noise.
  // - The offset arguments keep seeded random streams stable and separated by caller.
  if (seededRng(seed, minute, accurateOffset) < coachAccuracy) {
    if (paceGap >= 3) return 'LONG';
    if (paceGap <= -3 || techGap >= 3) return 'SHORT';
    return 'MIXED';
  }
  const opts: InstructionPassing[] = ['SHORT', 'MIXED', 'LONG'];
  return opts[Math.floor(seededRng(seed, minute, randomOffset) * 3)];
};

export const AiCoachTacticsService = {

  // ─── ANALIZA PRZEDMECZOWA ─────────────────────────────────────────────────
  // Trener AI analizuje drużynę gracza i ustawia instrukcje startowe.
  // decisionMaking → jakość analizy; experience → zakres analizowanych sygnałów.
  decidePreMatchInstructions: (
    ownClub: Club,
    ownCoach: Coach | null,
    ownPlayers: Player[],
    userClub: Club,
    userPlayers: Player[],
    userTacticId: string,
    seed: number,
    opponentReport?: AiOpponentMatchReport
  ): AiInstructions => {
    const decisionMaking = ownCoach?.attributes.decisionMaking ?? 50;
    const experience = ownCoach?.attributes.experience ?? 50;

    const userFwdAvg = opponentReport?.perceivedLineStrengths.attack ?? getTopLineAvg(userPlayers, PlayerPosition.FWD, 3);
    const userDefAvg = opponentReport?.perceivedLineStrengths.defense ?? getTopLineAvg(userPlayers, PlayerPosition.DEF, 4);
    const userTacticDefBias = TacticRepository.getById(opponentReport?.predictedTacticId ?? userTacticId)?.defenseBias ?? 50;
    const repDiff = ownClub.reputation - userClub.reputation;

    // Suma sygnałów: dodatnia = sugeruje OFFENSIVE, ujemna = sugeruje DEFENSIVE
    let signalScore = 0;

    // Niedoświadczony trener patrzy tylko na reputację (1 sygnał)
    if (opponentReport) {
      if (opponentReport.recommendedApproach === 'PRESS') signalScore += 2;
      if (opponentReport.recommendedApproach === 'DIRECT') signalScore += 1;
      if (opponentReport.recommendedApproach === 'CONTROL') signalScore += 0.5;
      if (opponentReport.recommendedApproach === 'COUNTER') signalScore -= 1.5;
      if (opponentReport.recommendedApproach === 'LOW_BLOCK') signalScore -= 2;

      if (opponentReport.predictedStyle === 'OFFENSIVE') signalScore -= 1;
      if (opponentReport.predictedStyle === 'DEFENSIVE') signalScore += 1;
      if (opponentReport.perceivedFatigueLevel === 'EXHAUSTED') signalScore += 1.5;
      else if (opponentReport.perceivedFatigueLevel === 'TIRED') signalScore += 0.75;
    } else if (experience < 40) {
      signalScore = repDiff >= 2 ? 1 : repDiff <= -2 ? -1 : 0;
    } else {
      // Słaba obrona gracza → atak
      if (userDefAvg < 58) signalScore += 2;
      else if (userDefAvg < 65) signalScore += 1;
      // Mocny atak gracza → obrona
      if (userFwdAvg > 72) signalScore -= 2;
      else if (userFwdAvg > 65) signalScore -= 1;
      // Taktyka gracza
      if (userTacticDefBias > 65) signalScore += 1;
      if (userTacticDefBias < 40) signalScore -= 1;
      // Reputacja
      if (repDiff >= 3) signalScore += 2;
      else if (repDiff >= 1) signalScore += 1;
      else if (repDiff <= -3) signalScore -= 2;
      else if (repDiff <= -1) signalScore -= 1;
    }

    let mindset: InstructionMindset;
    let tempo: InstructionTempo;
    let intensity: InstructionIntensity;

    if (signalScore >= 2) {
      mindset = 'OFFENSIVE'; tempo = 'FAST'; intensity = 'NORMAL';
    } else if (signalScore <= -2) {
      mindset = 'DEFENSIVE'; tempo = 'SLOW'; intensity = 'CAUTIOUS';
    } else {
      mindset = 'NEUTRAL'; tempo = 'NORMAL'; intensity = 'NORMAL';
    }

    // Słaby decisionMaking → losowe odchylenie od analizy
    const decisionNoiseChance = opponentReport
      ? Math.max(0.03, 0.32 - opponentReport.confidence * 0.25)
      : (decisionMaking < 40 ? 0.35 : 0);
    if (decisionNoiseChance > 0) {
      const rng1 = seededRng(seed, 0, 301);
      if (rng1 < decisionNoiseChance) {
        const rng2 = seededRng(seed, 0, 302);
        const opts: InstructionMindset[] = ['DEFENSIVE', 'NEUTRAL', 'OFFENSIVE'];
        mindset = opts[Math.floor(rng2 * 3)];
      }
    }

    const consistent = enforceConsistency(mindset, tempo, intensity);
    const wantsCounter = opponentReport?.recommendedApproach === 'COUNTER'
      || opponentReport?.recommendedApproach === 'LOW_BLOCK';
    const wantsPressing = opponentReport?.recommendedApproach === 'PRESS'
      && !wantsCounter
      && consistent.mindset !== 'DEFENSIVE';

    const ownPaceAvg       = ownPlayers.length > 0 ? ownPlayers.reduce((s, p) => s + p.attributes.pace, 0) / ownPlayers.length : 60;
    const ownTechAvg       = ownPlayers.length > 0 ? ownPlayers.reduce((s, p) => s + p.attributes.technique, 0) / ownPlayers.length : 60;
    const ownHeadingAvg    = ownPlayers.length > 0 ? ownPlayers.reduce((s, p) => s + p.attributes.heading, 0) / ownPlayers.length : 60;
    const ownAggAvg        = ownPlayers.length > 0 ? ownPlayers.reduce((s, p) => s + p.attributes.aggression, 0) / ownPlayers.length : 60;
    const userPaceAvgPre    = userPlayers.length > 0 ? userPlayers.reduce((s, p) => s + p.attributes.pace, 0) / userPlayers.length : 60;
    const userTechAvgPre    = userPlayers.length > 0 ? userPlayers.reduce((s, p) => s + p.attributes.technique, 0) / userPlayers.length : 60;
    const userHeadingAvgPre = userPlayers.length > 0 ? userPlayers.reduce((s, p) => s + p.attributes.heading, 0) / userPlayers.length : 60;
    const userAggAvgPre     = userPlayers.length > 0 ? userPlayers.reduce((s, p) => s + p.attributes.aggression, 0) / userPlayers.length : 60;
    const preCoachScore = (experience * 0.55 + decisionMaking * 0.45) / 100;
    const preCoachAccuracy = 0.35 + preCoachScore * 0.50;
    const prePaceGap    = ownPaceAvg    - userPaceAvgPre;
    const preTechGap    = ownTechAvg    - userTechAvgPre;
    const preHeadingGap = ownHeadingAvg - userHeadingAvgPre;
    const preAggGap     = ownAggAvg     - userAggAvgPre;
    let passScore = 0;
    if (prePaceGap >= 3)     passScore += 2;
    if (prePaceGap <= -3)    passScore -= 2;
    if (preTechGap >= 3)     passScore -= 2;
    if (preTechGap <= -3)    passScore += 2;
    if (preHeadingGap >= 3)  passScore += 1;
    if (preHeadingGap <= -3) passScore -= 1;
    if (preAggGap <= -3)     passScore -= 1;
    let prePassing: InstructionPassing = 'MIXED';
    if (seededRng(seed, 0, 303) < preCoachAccuracy) {
      if (passScore >= 2) prePassing = 'LONG';
      else if (passScore <= -2) prePassing = 'SHORT';
    } else {
      const opts: InstructionPassing[] = ['SHORT', 'MIXED', 'LONG'];
      prePassing = opts[Math.floor(seededRng(seed, 0, 304) * 3)];
    }
    console.log(
      `[AI PRE] ${ownClub.name} | pace gap=${prePaceGap.toFixed(1)} tech gap=${preTechGap.toFixed(1)} ` +
      `heading gap=${preHeadingGap.toFixed(1)} agg gap=${preAggGap.toFixed(1)} ` +
      `| passScore=${passScore} acc=${preCoachAccuracy.toFixed(2)} → ${prePassing}`
    );

    return {
      ...consistent,
      pressing: wantsPressing ? 'PRESSING' : 'NORMAL',
      counterAttack: wantsCounter ? 'COUNTER' : 'NORMAL',
      passing: prePassing,
    };
  },

  // ─── DECYZJA W TRAKCIE MECZU ─────────────────────────────────────────────
  // Co 10-20 min trener AI ocenia sytuację i aktualizuje instrukcje.
  // Zwraca null jeśli trener decyduje się nic nie zmieniać.
  decideInMatchInstructions: (
    aiScoreDiff: number,       // aiScore - userScore (perspektywa AI)
    aiMomentum: number,        // pozytywny = AI dominuje, ujemny = gracz dominuje
    minute: number,
    decisionMaking: number,
    experience: number,
    lastGoalBoostMinute: number,
    seed: number,
    userMindset: InstructionMindset,
    userTacticAttackBias: number,
    aiTacticDefenseBias: number,
    context?: InMatchDecisionContext
  ): AiInstructions | null => {
    const rng1 = seededRng(seed, minute, 401);
    const rng2 = seededRng(seed, minute, 402);
    const rng3 = seededRng(seed, minute, 403);

    const aiSentOffCount = context?.aiSentOffCount ?? 0;
    if (aiSentOffCount > 0) {
      const coachScore = (experience * 0.55 + decisionMaking * 0.45) / 100;
      const defensiveChance = 0.30 + coachScore * 0.62;
      const mindset: InstructionMindset = rng1 < defensiveChance ? 'DEFENSIVE' : 'NEUTRAL';
      const slowChance = 0.20 + (experience / 100) * 0.68;
      const tempo: InstructionTempo = rng2 < slowChance ? 'SLOW' : 'NORMAL';
      const paceGap = (context?.aiPaceAvg ?? 60) - (context?.userPaceAvg ?? 60);
      const techGap = (context?.aiTechAvg ?? 60) - (context?.userTechAvg ?? 60);
      const coachAccuracy = 0.40 + coachScore * 0.50;
      let passing: InstructionPassing = 'MIXED';
      if (rng3 < coachAccuracy) {
        if (paceGap >= 3) passing = 'LONG';
        else if (paceGap <= -3 || techGap >= 3) passing = 'SHORT';
      } else {
        const opts: InstructionPassing[] = ['SHORT', 'MIXED', 'LONG'];
        passing = opts[Math.floor(seededRng(seed, minute, 704) * 3)];
      }
      const base = enforceConsistency(mindset, tempo, 'NORMAL');
      return { ...base, pressing: 'NORMAL', counterAttack: 'COUNTER', passing };
    }

    const isSecondHalfDecisionWindow = minute >= 46 && minute <= 75;
    const aiAvgFatigue = context?.aiAvgFatigue ?? 100;
    const aiLowestFatigue = context?.aiLowestFatigue ?? 100;
    const aiShots = context?.aiShots ?? 0;
    const userShots = context?.userShots ?? 0;
    const aiShotsOnTarget = context?.aiShotsOnTarget ?? 0;
    const userShotsOnTarget = context?.userShotsOnTarget ?? 0;
    const aiSubsRemaining = context?.aiSubsRemaining ?? 5;
    const userAvgFatigue = context?.userAvgFatigue ?? 100;
    const userLowestFatigue = context?.userLowestFatigue ?? 100;
    const userSubsRemaining = context?.userSubsRemaining ?? 5;
    const userSentOffCount = context?.userSentOffCount ?? 0;
    const userGoalkeeperCrisis = context?.userGoalkeeperCrisis ?? false;
    const userTempo = context?.userTempo ?? 'NORMAL';
    const aiStakes = context?.aiStakes ?? 'MID_TABLE';
    const userStakes = context?.userStakes ?? 'MID_TABLE';
    const aiRank = context?.aiRank ?? 10;
    const userRank = context?.userRank ?? 10;
    const isLateSeason = context?.isLateSeason ?? false;
    const rivalryMultiplier = context?.rivalryMultiplier ?? 1;
    const shotBalance = aiShots - userShots;
    const sotBalance = aiShotsOnTarget - userShotsOnTarget;
    const gameLooksGood = aiMomentum >= 16 || shotBalance >= 2 || sotBalance >= 1;
    const gameLooksBad = aiMomentum <= -24 || shotBalance <= -3 || sotBalance <= -2;
    const seriousFatigue = aiAvgFatigue < 67 || aiLowestFatigue < 46;
    const isFinalPhase = minute >= 76;
    const isLastStand = minute >= 84;
    const aiStakesWeight = getStakesWeight(aiStakes);
    const userStakesWeight = getStakesWeight(userStakes);
    const pressureDrama = (isLateSeason ? aiStakesWeight : aiStakesWeight * 0.45) * rivalryMultiplier;
    const tablePressure = aiRank <= 5 || aiRank >= 13 || userRank <= 5 || userRank >= 13;
    const mustProtect = aiScoreDiff > 0 && (pressureDrama >= 0.70 || userStakesWeight >= 0.75 || tablePressure);
    const mustChase = aiScoreDiff < 0 && (pressureDrama >= 0.70 || aiStakes !== 'LOW_STAKES');
    const avoidCollapse = aiScoreDiff <= -2 && (pressureDrama >= 0.90 || aiStakes === 'RELEGATION_FIGHT');
    const paceGap = (context?.aiPaceAvg ?? 60) - (context?.userPaceAvg ?? 60);
    const techGap = (context?.aiTechAvg ?? 60) - (context?.userTechAvg ?? 60);
    const coachScore = (experience * 0.55 + decisionMaking * 0.45) / 100;
    const coachAccuracy = 0.35 + coachScore * 0.50;
    const passingForExploit = pickInMatchPassing(seed, minute, coachAccuracy, paceGap, techGap, 601, 602);

    // AI Exploit Window scoring:
    // This block lets the AI identify and temporarily attack a player mistake instead of
    // only reacting to scoreline/momentum. It is intentionally additive and bounded:
    // many small cues can convince an elite coach, while weak coaches require an obvious
    // collapse or may never react.
    //
    // What is rewarded:
    // - Player overcommitment: FAST + OFFENSIVE, high attackBias, or pushing while not behind.
    // - Player fatigue and bench negligence: low average/lowest fatigue, many unused player
    //   substitutions after 60', especially when AI has already used several changes.
    // - Structural errors: red card while still pushing, goalkeeper crisis, or exhausted line.
    //
    // Calibration:
    // - Increase individual exploitScore weights to make AI punish that mistake more often.
    // - Lower exploitThreshold values to make coaches react more frequently.
    // - Raise aiAvgFatigue > 58 if you want AI to avoid pressing when tired.
    // - Lower exploitReadChance base/multiplier if exploit windows feel too deterministic.
    // - The substitution mismatch weights are currently +0.85 for "player has 4-5 subs left,
    //   AI has 3+ used" and +0.35 extra when AI used all 5 after 70'. These are the main knobs
    //   for punishing a player who refuses to rotate in the second half.
    let exploitScore = 0;
    const userIsPushing = userMindset === 'OFFENSIVE' || userTempo === 'FAST' || userTacticAttackBias >= 68;
    if (userMindset === 'OFFENSIVE' && userTempo === 'FAST') exploitScore += 1.35;
    else if (userIsPushing) exploitScore += 0.45;
    if (userTacticAttackBias >= 76) exploitScore += 0.55;
    if (userAvgFatigue < 72) exploitScore += 0.55;
    if (userLowestFatigue < 50) exploitScore += 0.75;
    if (userSubsRemaining <= 1 && minute >= 60) exploitScore += 0.45;
    if (userSubsRemaining >= 4 && aiSubsRemaining <= 2 && minute >= 60) exploitScore += 0.85;
    if (userSubsRemaining >= 4 && aiSubsRemaining === 0 && minute >= 70) exploitScore += 0.35;
    if (userSentOffCount > 0 && userIsPushing) exploitScore += 1.20;
    if (userGoalkeeperCrisis) exploitScore += 1.80;
    if (shotBalance >= -1 && sotBalance >= -1 && userIsPushing) exploitScore += 0.40;
    if (aiMomentum > -18 && userIsPushing) exploitScore += 0.35;
    if (aiScoreDiff >= 0 && userIsPushing) exploitScore += 0.35;
    if (aiScoreDiff <= -2) exploitScore -= 0.40;
    if (seriousFatigue) exploitScore -= 1.20;
    if (aiSentOffCount > 0) exploitScore -= 2.00;

    const exploitThreshold =
      coachScore >= 0.78 ? 1.35 :
      coachScore >= 0.62 ? 1.90 :
      coachScore >= 0.46 ? 2.55 :
      99;
    const exploitReadChance = Math.max(
      0,
      Math.min(0.96, 0.18 + coachScore * 0.72 + Math.max(0, exploitScore - exploitThreshold) * 0.12)
    );
    if (
      exploitScore >= exploitThreshold &&
      aiAvgFatigue > 58 &&
      aiScoreDiff > -3 &&
      rng2 < exploitReadChance
    ) {
      const duration = 5 + Math.round(coachScore * 5) + Math.floor(seededRng(seed, minute, 701) * 4);
      return {
        mindset: 'OFFENSIVE',
        tempo: 'FAST',
        intensity: aiAvgFatigue > 72 ? 'AGGRESSIVE' : 'NORMAL',
        pressing: aiAvgFatigue > 66 && coachScore >= 0.55 ? 'PRESSING' : 'NORMAL',
        counterAttack: 'NORMAL',
        passing: passingForExploit,
        exploitUntilMinute: Math.min(90, minute + duration),
      };
    }

    // Szansa braku reakcji — słaby trener często się waha
    let noActionChance = decisionMaking < 40 ? 0.40 : decisionMaking < 60 ? 0.15 : 0.05;
    if (isSecondHalfDecisionWindow) {
      if (gameLooksGood && aiScoreDiff >= 0 && !seriousFatigue) noActionChance += 0.16;
      if (gameLooksBad || seriousFatigue || aiScoreDiff < 0) noActionChance -= 0.12;
      noActionChance = Math.max(0.03, Math.min(0.58, noActionChance));
    } else if (isFinalPhase) {
      if (aiScoreDiff === 0 && aiStakes === 'LOW_STAKES' && !gameLooksBad) noActionChance += 0.18;
      if (mustChase || mustProtect || seriousFatigue || gameLooksBad) noActionChance -= 0.16 + pressureDrama * 0.08;
      if (isLastStand && mustChase) noActionChance -= 0.10;
      noActionChance = Math.max(0.02, Math.min(0.55, noActionChance));
    }
    if (userMindset === 'OFFENSIVE' && userTempo === 'FAST' && !seriousFatigue) {
      noActionChance = Math.max(0.02, noActionChance - 0.08);
    }
    if (rng1 < noActionChance) return null;

    // Doświadczony trener reaguje wcześniej na niekorzystny wynik
    const lateThreshold = experience > 70 ? 40 : experience > 50 ? 55 : 65;

    let mindset: InstructionMindset = 'NEUTRAL';
    let tempo: InstructionTempo = 'NORMAL';
    let intensity: InstructionIntensity = 'NORMAL';

    // Priorytet 1: Gol kontaktowy przy wyniku -1 → impuls
    const recentContactGoal = lastGoalBoostMinute >= 0 && (minute - lastGoalBoostMinute) < 10 && aiScoreDiff === -1;
    if (recentContactGoal) {
      return enforceConsistency('OFFENSIVE', 'FAST', 'NORMAL');
    }

    // Priorytet 1b: zarządzanie drugą połową do około 75 minuty.
    if (isSecondHalfDecisionWindow) {
      if (aiScoreDiff < 0) {
        if (gameLooksGood && !seriousFatigue) {
          mindset = 'OFFENSIVE'; tempo = 'NORMAL'; intensity = 'NORMAL';
        } else if (seriousFatigue && aiSubsRemaining > 0) {
          mindset = 'OFFENSIVE'; tempo = 'NORMAL'; intensity = 'NORMAL';
        } else {
          mindset = 'OFFENSIVE'; tempo = 'FAST'; intensity = aiAvgFatigue > 70 ? 'AGGRESSIVE' : 'NORMAL';
        }
      } else if (aiScoreDiff > 0) {
        if (seriousFatigue || gameLooksBad) {
          mindset = 'DEFENSIVE'; tempo = 'SLOW'; intensity = 'CAUTIOUS';
        } else if (gameLooksGood && aiMomentum >= 28 && decisionMaking < 58) {
          mindset = 'NEUTRAL'; tempo = 'NORMAL'; intensity = 'NORMAL';
        } else {
          mindset = 'DEFENSIVE'; tempo = 'SLOW'; intensity = 'NORMAL';
        }
      } else {
        if (gameLooksGood && !seriousFatigue) {
          mindset = decisionMaking >= 62 ? 'NEUTRAL' : 'OFFENSIVE';
          tempo = decisionMaking >= 62 ? 'NORMAL' : 'FAST';
          intensity = 'NORMAL';
        } else if (gameLooksBad) {
          mindset = 'OFFENSIVE';
          tempo = aiAvgFatigue > 68 ? 'FAST' : 'NORMAL';
          intensity = aiAvgFatigue > 72 ? 'AGGRESSIVE' : 'NORMAL';
        } else if (seriousFatigue) {
          mindset = 'NEUTRAL'; tempo = 'SLOW'; intensity = 'CAUTIOUS';
        } else {
          return null;
        }
      }
    // Priorytet 1c: dramaturgia końcówki po 75 minucie.
    } else if (isFinalPhase) {
      if (aiScoreDiff < 0) {
        if (avoidCollapse && minute < 86 && gameLooksBad && aiAvgFatigue < 61) {
          mindset = 'NEUTRAL'; tempo = 'NORMAL'; intensity = 'NORMAL';
        } else if (isLastStand && mustChase && aiAvgFatigue >= 58) {
          mindset = 'OFFENSIVE'; tempo = 'FAST'; intensity = 'AGGRESSIVE';
        } else if (mustChase) {
          mindset = 'OFFENSIVE';
          tempo = seriousFatigue ? 'NORMAL' : 'FAST';
          intensity = aiAvgFatigue > 66 ? 'AGGRESSIVE' : 'NORMAL';
        } else if (aiStakes === 'LOW_STAKES' && aiScoreDiff <= -2 && gameLooksBad) {
          mindset = 'NEUTRAL'; tempo = 'SLOW'; intensity = 'CAUTIOUS';
        } else {
          mindset = 'OFFENSIVE'; tempo = 'NORMAL'; intensity = 'NORMAL';
        }
      } else if (aiScoreDiff > 0) {
        if (mustProtect || isLastStand) {
          mindset = 'DEFENSIVE'; tempo = 'SLOW'; intensity = seriousFatigue ? 'CAUTIOUS' : 'NORMAL';
        } else if (gameLooksGood && aiScoreDiff >= 2) {
          mindset = 'NEUTRAL'; tempo = 'SLOW'; intensity = 'CAUTIOUS';
        } else {
          mindset = 'DEFENSIVE'; tempo = 'SLOW'; intensity = 'NORMAL';
        }
      } else {
        if (aiStakes === 'LOW_STAKES' && !gameLooksBad) {
          mindset = 'NEUTRAL'; tempo = 'SLOW'; intensity = 'CAUTIOUS';
        } else if ((aiStakes === 'TITLE_RACE' || aiStakes === 'EUROPE_RACE') && gameLooksGood && !seriousFatigue) {
          mindset = 'OFFENSIVE'; tempo = 'FAST'; intensity = minute >= 84 ? 'AGGRESSIVE' : 'NORMAL';
        } else if (aiStakes === 'RELEGATION_FIGHT' && userStakes === 'RELEGATION_FIGHT') {
          mindset = gameLooksBad ? 'DEFENSIVE' : 'NEUTRAL';
          tempo = gameLooksBad ? 'SLOW' : 'NORMAL';
          intensity = seriousFatigue ? 'CAUTIOUS' : 'NORMAL';
        } else if (gameLooksBad && !seriousFatigue) {
          mindset = 'OFFENSIVE'; tempo = 'FAST'; intensity = 'NORMAL';
        } else {
          return null;
        }
      }
    // Priorytet 2: Wynikowe
    } else if (aiScoreDiff <= -2) {
      mindset = 'OFFENSIVE'; tempo = 'FAST'; intensity = 'NORMAL';
    } else if (aiScoreDiff === -1 && minute >= lateThreshold) {
      mindset = 'OFFENSIVE'; tempo = 'FAST'; intensity = 'AGGRESSIVE';
    } else if (aiScoreDiff === -1) {
      mindset = 'OFFENSIVE'; tempo = 'NORMAL'; intensity = 'NORMAL';
    } else if (aiScoreDiff >= 3) {
      mindset = 'NEUTRAL'; tempo = 'SLOW'; intensity = 'CAUTIOUS';
    } else if (aiScoreDiff === 1 && minute > 80) {
      mindset = 'DEFENSIVE'; tempo = 'SLOW'; intensity = 'AGGRESSIVE';
    } else if (aiScoreDiff === 1 && minute > 70) {
      mindset = 'DEFENSIVE'; tempo = 'SLOW'; intensity = 'NORMAL';
    // Priorytet 3: Momentum
    } else if (aiMomentum < -67) {
      // Gracz dominuje — przerwij rytm agresją
      mindset = 'NEUTRAL'; tempo = 'SLOW'; intensity = 'AGGRESSIVE';
    } else if (aiMomentum > 50 && aiScoreDiff === 0) {
      // AI dominuje przy remisie — wykorzystaj impet
      mindset = 'OFFENSIVE'; tempo = 'FAST'; intensity = 'NORMAL';
    } else {
      return null;
    }

    // Odchylenie dla słabego decisionMaking
    if (decisionMaking < 50) {
      const deviationChance = (50 - decisionMaking) / 100;
      if (rng2 < deviationChance) {
        const which = Math.floor(rng3 * 3);
        if (which === 0) {
          const tempos: InstructionTempo[] = ['SLOW', 'NORMAL', 'FAST'];
          tempo = tempos[Math.floor(rng3 * 3)];
        } else if (which === 1) {
          const mindsets: InstructionMindset[] = ['DEFENSIVE', 'NEUTRAL', 'OFFENSIVE'];
          mindset = mindsets[Math.floor(rng3 * 3)];
        } else {
          const intensities: InstructionIntensity[] = ['CAUTIOUS', 'NORMAL', 'AGGRESSIVE'];
          intensity = intensities[Math.floor(rng3 * 3)];
        }
      }
    }

    // ─── PRESSING I KONTRATAK ───────────────────────────────────────────────
    let pressing: InstructionPressing = 'NORMAL';
    let counterAttack: InstructionCounterAttack = 'NORMAL';

    // KONTRATAK: AI gra defensywnie + gracz gra ofensywnie + mindset AI nie jest OFFENSIVE
    const aiIsDefensive = aiTacticDefenseBias >= 55 || aiScoreDiff > 0;
    const userIsOffensive = userTacticAttackBias >= 60 || userMindset === 'OFFENSIVE';
    if (aiIsDefensive && userIsOffensive && mindset !== 'OFFENSIVE') {
      let counterChance: number;
      if (experience >= 70 && decisionMaking >= 60) counterChance = 0.45;
      else if (experience >= 55) counterChance = 0.25;
      else if (experience >= 40) counterChance = 0.10;
      else counterChance = 0.04;
      if (seededRng(seed, minute, 501) < counterChance) counterAttack = 'COUNTER';
      else if (experience < 40 && seededRng(seed, minute, 502) < 0.05) counterAttack = 'COUNTER';
    }

    // PRESSING: ofensywne nastawienie lub przewaga momentum + wyklucza się z kontrą
    if (counterAttack !== 'COUNTER') {
      const pressingCondition = (mindset === 'OFFENSIVE' && !seriousFatigue) || (aiMomentum > 30 && aiAvgFatigue > 66);
      if (pressingCondition) {
        let pressingChance: number;
        if (experience >= 70) pressingChance = 0.35;
        else if (experience >= 55) pressingChance = 0.20;
        else if (experience >= 40) pressingChance = 0.08;
        else pressingChance = 0.03;
        if (seededRng(seed, minute, 503) < pressingChance) pressing = 'PRESSING';
      } else if (experience < 40 && seededRng(seed, minute, 504) < 0.04) {
        pressing = 'PRESSING';
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    if ((isSecondHalfDecisionWindow || isFinalPhase) && seriousFatigue && aiScoreDiff >= 0) {
      pressing = 'NORMAL';
      counterAttack = aiScoreDiff > 0 && userIsOffensive ? 'COUNTER' : counterAttack;
    }

    if (isFinalPhase && mustChase && !seriousFatigue && counterAttack !== 'COUNTER' && aiAvgFatigue > 60) {
      pressing = experience >= 55 || pressureDrama >= 0.75 ? 'PRESSING' : pressing;
    }

    const passing = pickInMatchPassing(seed, minute, coachAccuracy, paceGap, techGap, 601, 602);
    console.log(
      `[AI IN-MATCH min=${minute}] pace gap=${paceGap.toFixed(1)} tech gap=${techGap.toFixed(1)} ` +
      `acc=${coachAccuracy.toFixed(2)} → ${passing} | mindset=${mindset} tempo=${tempo}`
    );

    return { ...enforceConsistency(mindset, tempo, intensity), pressing, counterAttack, passing };
  },
};
