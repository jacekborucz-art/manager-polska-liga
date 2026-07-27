import { MatchEventType } from '../../../../types';
import type { CupChance, CupShotOutcome, CupTeamRuntimeProfile } from './CupMatchTypes';
import { clamp, pickWeighted, weightedScore } from './CupMath';

export const CupOwnGoalResolver = {
  /**
   * Samobój nie powinien być osobnym "losowym golem". Może powstać tylko przy
   * realnym zagrożeniu: mocnym dośrodkowaniu, chaosie po stałym fragmencie,
   * odbiciu strzału albo desperackiej interwencji obrońcy.
   */
  maybeOwnGoal: ({
    chance,
    defending,
    roll,
  }: {
    chance: CupChance;
    defending: CupTeamRuntimeProfile;
    roll: (salt: number) => number;
  }): CupShotOutcome | null => {
    const chaos =
      chance.pattern === 'WING_PLAY' ? 0.012 :
      chance.pattern === 'SET_PIECE' ? 0.018 :
      chance.kind === 'BIG_CHANCE' || chance.kind === 'ONE_ON_ONE' ? 0.010 :
      0.004;
    const pressureMod = chance.pressure * 0.00018;
    const ownGoalChance = clamp(chaos + pressureMod + Math.max(0, 52 - defending.defensiveShape) * 0.00018, 0.002, 0.045);

    if (roll(701) > ownGoalChance || defending.defenders.length === 0) return null;

    const defender = pickWeighted(defending.defenders.map(player => ({
      item: player,
      weight: Math.max(1, 100 - weightedScore(player.attributes, {
        defending: 0.30,
        positioning: 0.25,
        mentality: 0.15,
        heading: 0.10,
        strength: 0.10,
        technique: 0.05,
        workRate: 0.05,
      })),
    })), roll(702));

    return {
      eventType: MatchEventType.GOAL,
      goal: true,
      onTarget: true,
      corner: false,
      save: false,
      xG: chance.xG,
      momentumDelta: 16,
      assistEligible: false,
      isOwnGoal: true,
      ownGoalPlayerId: defender.id,
      text: `${defender.lastName} niefortunnie kieruje piłkę do własnej bramki.`,
    };
  },
};
