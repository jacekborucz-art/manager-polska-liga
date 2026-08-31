import { MatchEventType } from '../../../../types';
import type { CupChance, CupShotOutcome, CupTeamRuntimeProfile } from './CupMatchTypes';
import { clamp, weightedScore } from './CupMath';

export const CupShotResolver = {
  /**
   * Bramka nie jest losowana bezpośrednio. Najpierw istnieje CupChance z xG,
   * potem jakość strzału, potem reakcja bramkarza i dopiero ich różnica
   * rozstrzyga: gol, obrona, niecelny, blok, słupek, poprzeczka albo róg.
   */
  resolveShot: ({
    chance,
    attacking,
    defending,
    shooterFatigue,
    keeperFatigue,
    weatherPenalty,
    scoreDiff,
    roll,
  }: {
    chance: CupChance;
    attacking: CupTeamRuntimeProfile;
    defending: CupTeamRuntimeProfile;
    shooterFatigue: number;
    keeperFatigue: number;
    weatherPenalty: number;
    scoreDiff: number;
    roll: (salt: number) => number;
  }): CupShotOutcome => {
    const shooter = chance.shooter;
    const keeper = defending.goalkeeper;
    const marker = chance.marker;

    const shooterExecution =
      weightedScore(shooter.attributes, {
        finishing: 0.28,
        technique: 0.18,
        mentality: 0.14,
        attacking: 0.12,
        positioning: 0.10,
        strength: 0.07,
        heading: chance.pattern === 'WING_PLAY' || chance.pattern === 'SET_PIECE' ? 0.08 : 0.03,
        pace: chance.kind === 'ONE_ON_ONE' ? 0.08 : 0.03,
      }) *
      clamp(0.72 + shooterFatigue / 285, 0.72, 1.07) -
      chance.pressure * 0.10 -
      weatherPenalty;

    const markerPressure = marker
      ? weightedScore(marker.attributes, {
          defending: 0.28,
          positioning: 0.24,
          strength: 0.14,
          pace: 0.12,
          heading: 0.08,
          aggression: 0.07,
          mentality: 0.07,
        })
      : defending.defensiveShape;

    const keeperScore = keeper
      ? weightedScore(keeper.attributes, {
          goalkeeping: 0.38,
          positioning: 0.20,
          mentality: 0.12,
          strength: 0.08,
          pace: 0.08,
          leadership: 0.05,
          technique: 0.04,
          passing: 0.05,
        }) * clamp(0.72 + keeperFatigue / 285, 0.72, 1.07)
      : defending.goalkeeperQuality;

    const shotQuality = clamp(
      chance.xG +
      (shooterExecution - 50) * 0.0022 -
      (markerPressure - 50) * 0.0012 +
      (chance.angle - 0.5) * 0.035 -
      Math.max(0, chance.distance - 13) * 0.003,
      0.005,
      0.55
    );

    const finishingEdge = attacking.finishing - defending.defensiveShape;
    const executionEdge = shooterExecution - keeperScore;
    const mismatchSoftener = clamp(1 - Math.max(0, finishingEdge - 12) * 0.006, 0.82, 1);
    const leadDampener =
      scoreDiff >= 5 ? 0.42 :
      scoreDiff >= 4 ? 0.54 :
      scoreDiff >= 3 ? 0.68 :
      scoreDiff >= 2 ? 0.82 :
      1;
    const goalChanceCap =
      chance.pattern === 'SET_PIECE' && chance.xG >= 0.60 ? 0.84 :
      scoreDiff >= 5 ? 0.16 :
      scoreDiff >= 4 ? 0.20 :
      scoreDiff >= 3 ? 0.25 :
      0.34;
    const goalChance = clamp(
      (
        chance.xG * 1.04 * mismatchSoftener +
        clamp(executionEdge * 0.0014, -0.045, 0.055) +
        clamp(finishingEdge * 0.00035, -0.025, 0.030)
      ) * leadDampener -
        weatherPenalty * 0.001,
      0.004,
      goalChanceCap
    );
    const scored = roll(40) < goalChance;
    const isPenalty = chance.pattern === 'SET_PIECE' && chance.xG >= 0.60;
    const shotTempoDampener = clamp(1 - Math.max(0, scoreDiff - 2) * 0.055, 0.78, 1);
    const onTargetChance = clamp((0.24 + shotQuality * 1.25 + executionEdge * 0.0012) * shotTempoDampener, 0.14, 0.72);
    const isOnTarget = scored || roll(41) < onTargetChance;
    const postChance = clamp(0.012 + shotQuality * 0.055, 0.01, 0.045);
    const barChance = clamp(0.010 + shotQuality * 0.045, 0.008, 0.040);
    const saveChance = isOnTarget ? clamp(0.72 - shotQuality * 1.55 + (keeperScore - shooterExecution) * 0.004, 0.18, 0.88) : 0;
    if (scored) {
      return {
        eventType: isPenalty
          ? MatchEventType.PENALTY_SCORED
          : chance.kind === 'ONE_ON_ONE'
            ? MatchEventType.ONE_ON_ONE_GOAL
            : MatchEventType.GOAL,
        goal: true,
        onTarget: true,
        corner: false,
        save: false,
        xG: chance.xG,
        momentumDelta: 18,
        text: `${shooter.lastName} kończy akcję strzałem do siatki.`,
      };
    }

    if (isPenalty) {
      const saved = isOnTarget && roll(45) < saveChance;
      return {
        eventType: MatchEventType.PENALTY_MISSED,
        goal: false,
        onTarget: isOnTarget,
        corner: false,
        save: saved,
        xG: chance.xG,
        momentumDelta: -4,
        text: saved
          ? `${keeper?.lastName ?? 'Bramkarz'} broni rzut karny zawodnika ${shooter.lastName}.`
          : `${shooter.lastName} nie wykorzystuje rzutu karnego.`,
      };
    }

    if (roll(43) < postChance) {
      return {
        eventType: MatchEventType.SHOT_POST,
        goal: false,
        onTarget: false,
        corner: false,
        save: false,
        xG: chance.xG,
        momentumDelta: 5,
        text: `${shooter.lastName} trafia w słupek.`,
      };
    }

    if (roll(44) < barChance) {
      return {
        eventType: MatchEventType.SHOT_BAR,
        goal: false,
        onTarget: false,
        corner: false,
        save: false,
        xG: chance.xG,
        momentumDelta: 5,
        text: `${shooter.lastName} uderza w poprzeczkę.`,
      };
    }

    if (isOnTarget && roll(45) < saveChance) {
      const corner = roll(46) < 0.18 + shotQuality * 0.25;
      return {
        eventType: chance.kind === 'ONE_ON_ONE' ? MatchEventType.ONE_ON_ONE_SAVE : MatchEventType.SAVE,
        goal: false,
        onTarget: true,
        corner,
        save: true,
        xG: chance.xG,
        momentumDelta: corner ? 3 : 1,
        text: `${keeper?.lastName ?? 'Bramkarz'} broni strzał zawodnika ${shooter.lastName}.`,
      };
    }

    // A blocked shot reuses an already failed shot outcome. It adds the
    // defender and rebound context without silently reducing goal probability.
    const blockChance = marker
      ? clamp(0.08 + markerPressure * 0.0017 + chance.pressure * 0.0011, 0.10, 0.34)
      : 0;
    if (!isOnTarget && marker && roll(48) < blockChance) {
      // Reuse the original missed-shot corner roll so categorising a block
      // cannot increase attacking possessions or change score calibration.
      const corner = roll(47) < 0.08 + attacking.crossing * 0.0007;
      return {
        eventType: MatchEventType.SHOT_BLOCKED,
        goal: false,
        onTarget: false,
        corner,
        save: false,
        xG: chance.xG,
        momentumDelta: corner ? 3 : 1,
        text: `${marker.lastName} blokuje strzał zawodnika ${shooter.lastName}.`,
      };
    }

    return {
      eventType: isOnTarget ? MatchEventType.SHOT_ON_TARGET : MatchEventType.SHOT,
      goal: false,
      onTarget: isOnTarget,
      corner: !isOnTarget && roll(47) < 0.08 + attacking.crossing * 0.0007,
      save: false,
      xG: chance.xG,
      momentumDelta: isOnTarget ? 2 : 0.5,
      text: `${shooter.lastName} oddaje strzał, ale akcja nie kończy się golem.`,
    };
  },
};
