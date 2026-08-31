import type { Player, PlayerAttributes, PlayerPosition as PlayerPositionType } from '../../../../types';
import { PlayerPosition } from '../../../../types';
import type { CupInjurySeverity, CupTeamInput, CupTeamRuntimeProfile } from './CupMatchTypes';
import { average, clamp, fatigueMultiplier, moraleMultiplier, weightedScore } from './CupMath';

type AttributeKey = keyof PlayerAttributes;

const activePlayers = (team: CupTeamInput): Player[] => {
  const ids = new Set(team.lineup.startingXI.filter((id): id is string => Boolean(id)));
  return team.players.filter(player => ids.has(player.id));
};

const byPosition = (players: Player[], position: PlayerPositionType): Player[] =>
  players.filter(player => player.position === position);

const injuryMultiplier = (player: Player, injuries: Record<string, CupInjurySeverity>): number => {
  const severity = injuries[player.id];
  if (!severity) return 1;
  if (severity === 'SEVERE') {
    return player.position === PlayerPosition.GK ? 0.46 : 0.38;
  }
  return player.position === PlayerPosition.GK ? 0.74 : 0.68;
};

const attr = (
  players: Player[],
  fatigue: Record<string, number>,
  injuries: Record<string, CupInjurySeverity>,
  weights: Partial<Record<AttributeKey, number>>,
  fallback = 50
): number => average(players.map(player =>
  weightedScore(player.attributes, weights, fallback) *
  fatigueMultiplier(fatigue[player.id] ?? player.condition) *
  injuryMultiplier(player, injuries)
), fallback);

const shapeFromTactic = (team: CupTeamInput) => {
  const slots = team.tactic.slots;
  const avgX = average(slots.map(slot => slot.x), 50);
  const avgY = average(slots.map(slot => slot.y), 50);
  const width = average(slots.map(slot => Math.abs(slot.x - avgX)), 20);

  return {
    tacticalWidth: clamp(35 + width * 1.2, 25, 85),
    lineHeight: clamp(avgY, 25, 85),
  };
};

export const CupTeamProfileService = {
  /**
   * Profil drużyny jest warstwą agregującą atrybuty zawodników, taktykę,
   * kondycję i morale. Silnik nie powinien w kolejnych fazach liczyć
   * "surowej sumy" zawodników, bo to tworzy sztuczne przewagi formacji.
   * Zamiast tego każda faza dostaje jakość danej funkcji zespołu.
   */
  buildProfile: (
    team: CupTeamInput,
    fatigue: Record<string, number>,
    redCards: Record<string, boolean>,
    injuries: Record<string, CupInjurySeverity> = {}
  ): CupTeamRuntimeProfile => {
    const active = activePlayers(team).filter(player => !redCards[player.id]);
    const naturalGoalkeeper = active.find(player => player.position === PlayerPosition.GK);
    // A red card or an injury can remove the only natural goalkeeper after all
    // substitutions were used. Football still requires somebody to occupy the
    // goal, so select the most suitable active outfield player. His ordinary
    // goalkeeping attributes remain authoritative and naturally produce a
    // large sporting penalty without leaving later shot events unattributed.
    const emergencyGoalkeeper = naturalGoalkeeper ? undefined : [...active].sort((left, right) =>
      weightedScore(right.attributes, { goalkeeping: 0.55, positioning: 0.20, mentality: 0.15, strength: 0.10 }) -
      weightedScore(left.attributes, { goalkeeping: 0.55, positioning: 0.20, mentality: 0.15, strength: 0.10 })
    )[0];
    const goalkeeper = naturalGoalkeeper ?? emergencyGoalkeeper;
    const outfield = active.filter(player => player.id !== goalkeeper?.id);
    const defenders = byPosition(outfield, PlayerPosition.DEF);
    const midfielders = byPosition(outfield, PlayerPosition.MID);
    const forwards = byPosition(outfield, PlayerPosition.FWD);
    const moraleMod = moraleMultiplier((team.morale * 0.52) + (team.preMatchMotivation * 0.32) + (team.stadiumSupport * 0.16));
    const shape = shapeFromTactic(team);

    const injuredActiveCount = active.filter(player => injuries[player.id]).length;
    const severeActiveCount = active.filter(player => injuries[player.id] === 'SEVERE').length;
    const unfitShapePenalty = clamp(1 - injuredActiveCount * 0.018 - severeActiveCount * 0.045, 0.72, 1);

    const buildUp = attr([...defenders, ...midfielders, goalkeeper].filter(Boolean) as Player[], fatigue, injuries, {
      passing: 0.28,
      technique: 0.18,
      vision: 0.16,
      positioning: 0.12,
      mentality: 0.14,
      workRate: 0.12,
    }) * moraleMod;

    const midfieldControl = attr(midfielders.length > 0 ? midfielders : outfield, fatigue, injuries, {
      passing: 0.22,
      technique: 0.20,
      vision: 0.18,
      positioning: 0.12,
      stamina: 0.10,
      workRate: 0.12,
      mentality: 0.06,
    }) * moraleMod;

    const progression = attr(outfield, fatigue, injuries, {
      pace: 0.13,
      passing: 0.17,
      technique: 0.18,
      dribbling: 0.16,
      vision: 0.13,
      workRate: 0.11,
      mentality: 0.07,
      strength: 0.05,
    }) * moraleMod;

    const chanceCreation = attr([...midfielders, ...forwards], fatigue, injuries, {
      vision: 0.22,
      passing: 0.18,
      technique: 0.16,
      attacking: 0.14,
      crossing: 0.12,
      dribbling: 0.10,
      mentality: 0.08,
    }) * moraleMod;

    const finishing = attr(forwards.length > 0 ? forwards : outfield, fatigue, injuries, {
      finishing: 0.28,
      attacking: 0.17,
      technique: 0.15,
      positioning: 0.13,
      mentality: 0.12,
      strength: 0.06,
      pace: 0.05,
      heading: 0.04,
    }) * moraleMod;

    const defensiveShape = attr([...defenders, ...midfielders], fatigue, injuries, {
      defending: 0.28,
      positioning: 0.22,
      strength: 0.12,
      pace: 0.10,
      heading: 0.08,
      workRate: 0.10,
      mentality: 0.10,
    }) * moraleMod;

    const pressing = attr(outfield, fatigue, injuries, {
      workRate: 0.23,
      stamina: 0.18,
      aggression: 0.16,
      pace: 0.14,
      defending: 0.11,
      positioning: 0.09,
      mentality: 0.09,
    }) * (team.instructions.pressing === 'PRESSING' ? 1.10 : 0.96);

    const tacticAttackMod = clamp(1 + (team.tactic.attackBias - 50) * 0.0035, 0.86, 1.16);
    const tacticDefenseMod = clamp(1 + (team.tactic.defenseBias - 50) * 0.0038, 0.84, 1.18);
    const tacticPressMod = clamp(1 + (team.tactic.pressingIntensity - 50) * 0.0034, 0.88, 1.16);
    const tempoBuildMod =
      team.instructions.tempo === 'FAST' ? 1.035 :
      team.instructions.tempo === 'SLOW' ? 0.972 :
      1;
    const mindsetAttackMod =
      team.instructions.mindset === 'OFFENSIVE' ? 1.055 :
      team.instructions.mindset === 'DEFENSIVE' ? 0.952 :
      1;
    const mindsetDefenseMod =
      team.instructions.mindset === 'DEFENSIVE' ? 1.062 :
      team.instructions.mindset === 'OFFENSIVE' ? 0.952 :
      1;
    const intensityPressMod =
      team.instructions.intensity === 'AGGRESSIVE' ? 1.085 :
      team.instructions.intensity === 'CAUTIOUS' ? 0.928 :
      1;
    const markingDefenseMod =
      team.instructions.marking === 'MAN' ? 1.035 :
      team.instructions.marking === 'NONE' ? 0.925 :
      1;
    const markingDisciplineMod =
      team.instructions.marking === 'MAN' ? 1.10 :
      team.instructions.marking === 'NONE' ? 0.88 :
      1;
    const passingProgressionMod =
      team.instructions.passing === 'SHORT' ? 1.025 :
      team.instructions.passing === 'LONG' ? 0.985 :
      1;

    return {
      side: team.side,
      activePlayers: active,
      goalkeeper,
      outfieldPlayers: outfield,
      defenders,
      midfielders,
      forwards,
      buildUp: buildUp * tempoBuildMod * passingProgressionMod,
      midfieldControl: midfieldControl * (team.instructions.passing === 'SHORT' ? 1.018 : 1),
      progression: progression * tacticAttackMod * tempoBuildMod * passingProgressionMod,
      chanceCreation: chanceCreation * tacticAttackMod * mindsetAttackMod,
      finishing,
      crossing: attr(outfield, fatigue, injuries, { crossing: 0.34, technique: 0.18, passing: 0.16, vision: 0.12, pace: 0.10, mentality: 0.10 }) * tacticAttackMod,
      aerialThreat: attr(outfield, fatigue, injuries, { heading: 0.32, strength: 0.22, positioning: 0.18, attacking: 0.12, mentality: 0.08, pace: 0.08 }),
      defensiveShape: defensiveShape * tacticDefenseMod * mindsetDefenseMod * markingDefenseMod * unfitShapePenalty,
      pressing: pressing * tacticPressMod * intensityPressMod,
      counterThreat: attr([...midfielders, ...forwards], fatigue, injuries, { pace: 0.20, passing: 0.18, vision: 0.17, dribbling: 0.15, technique: 0.12, attacking: 0.11, mentality: 0.07 }),
      setPieces: attr(active, fatigue, injuries, { freeKicks: 0.26, corners: 0.22, crossing: 0.18, heading: 0.14, technique: 0.10, mentality: 0.10 }),
      goalkeeperQuality: goalkeeper ? weightedScore(goalkeeper.attributes, { goalkeeping: 0.38, positioning: 0.20, mentality: 0.14, strength: 0.08, pace: 0.06, passing: 0.06, technique: 0.04, leadership: 0.04 }) * fatigueMultiplier(fatigue[goalkeeper.id] ?? goalkeeper.condition) * injuryMultiplier(goalkeeper, injuries) : 35,
      disciplineRisk: attr(outfield, fatigue, injuries, { aggression: 0.32, mentality: -0.12, positioning: -0.10, defending: 0.08, workRate: 0.12 }, 50) * intensityPressMod * markingDisciplineMod,
      staminaReserve: attr(active, fatigue, injuries, { stamina: 0.50, workRate: 0.25, mentality: 0.15, strength: 0.10 }),
      leadership: attr(active, fatigue, injuries, { leadership: 0.55, mentality: 0.25, workRate: 0.12, stamina: 0.08 }, 50),
      mentality: attr(active, fatigue, injuries, { mentality: 0.44, leadership: 0.18, workRate: 0.16, aggression: 0.07, stamina: 0.08, positioning: 0.07 }),
      tacticalWidth: shape.tacticalWidth,
      lineHeight: shape.lineHeight,
    };
  },
};
