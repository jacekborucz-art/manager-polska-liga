import { Player, PlayerPosition, WeatherSnapshot } from '../../../types';
import { PlayerMoraleService } from '../../PlayerMoraleService';

export type LiveOwnGoalContext = 'openPlay' | 'chaos' | 'corner';

export type ResolveLiveOwnGoalInputs = {
  context: LiveOwnGoalContext;
  defendingPlayers: Player[];
  defendingLineup: (string | null)[];
  defendingFatigue: Record<string, number>;
  weather?: WeatherSnapshot | null;
  pressureMultiplier?: number;
  rng: () => number;
};

export type LiveOwnGoalResult = {
  player: Player;
  chance: number;
  commentary: string;
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const getContextBaseChance = (context: LiveOwnGoalContext): number => {
  if (context === 'corner') return 0.026;
  if (context === 'chaos') return 0.022;
  return 0.012;
};

const getPlayerRiskWeight = (player: Player, slotIndex: number, fatigue: number): number => {
  const attributes = player.attributes;
  const roleWeight =
    player.position === PlayerPosition.DEF ? 1.25 :
    player.position === PlayerPosition.GK ? 0.78 :
    player.position === PlayerPosition.MID ? 0.82 :
    0.48;
  const slotWeight = slotIndex === 0 ? 0.72 : slotIndex >= 1 && slotIndex <= 5 ? 1.18 : 0.62;
  const fatigueWeight = fatigue < 60 ? 1.45 : fatigue < 75 ? 1.22 : fatigue < 85 ? 1.10 : 1.0;
  const defensiveRead =
    attributes.defending * 0.30 +
    attributes.positioning * 0.24 +
    attributes.technique * 0.16 +
    attributes.mentality * 0.16 +
    attributes.strength * 0.08 +
    attributes.workRate * 0.06;
  const weaknessWeight = 1 + clamp((68 - defensiveRead) / 52, -0.18, 0.55);

  return roleWeight * slotWeight * fatigueWeight * weaknessWeight;
};

const chooseWeightedPlayer = (
  candidates: { player: Player; weight: number }[],
  rng: () => number
): Player | null => {
  const totalWeight = candidates.reduce((sum, candidate) => sum + candidate.weight, 0);
  if (totalWeight <= 0) return null;

  let roll = clamp(rng(), 0, 1) * totalWeight;
  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll <= 0) return candidate.player;
  }

  return candidates[candidates.length - 1]?.player ?? null;
};

export const calculateLiveOwnGoalChance = ({
  context,
  defendingPlayers,
  defendingLineup,
  defendingFatigue,
  weather,
  pressureMultiplier = 1,
}: Omit<ResolveLiveOwnGoalInputs, 'rng'>): number => {
  const activeIds = defendingLineup.filter((id): id is string => id !== null);
  if (activeIds.length === 0) return 0;

  const activeDefenders = defendingPlayers.filter(player => activeIds.includes(player.id));
  if (activeDefenders.length === 0) return 0;

  const averageDefensiveRead = activeDefenders.reduce((sum, player) => {
    const attributes = player.attributes;
    return sum + (
      attributes.defending * 0.30 +
      attributes.positioning * 0.24 +
      attributes.technique * 0.16 +
      attributes.mentality * 0.16 +
      attributes.strength * 0.08 +
      attributes.workRate * 0.06
    );
  }, 0) / activeDefenders.length;
  const redZoneCount = activeIds.filter(id => (defendingFatigue[id] ?? 100) < 60).length;
  const tiredCount = activeIds.filter(id => (defendingFatigue[id] ?? 100) < 75).length;
  const moralePenalty = activeDefenders.reduce((sum, player) => {
    const morale = player.morale ?? 50;
    return sum + (morale < 40 ? (40 - morale) / 900 : 0);
  }, 0);
  const rainPressure = weather && weather.precipitationChance > 55
    ? clamp((weather.precipitationChance - 55) / 90, 0, 0.22)
    : 0;
  const qualityPressure = clamp((66 - averageDefensiveRead) / 90, -0.10, 0.24);
  const fatiguePressure = clamp(tiredCount * 0.045 + redZoneCount * 0.055, 0, 0.34);
  const teamMoraleMultiplier = activeDefenders.reduce(
    (sum, player) => sum + PlayerMoraleService.getMatchMultiplier(player),
    0
  ) / activeDefenders.length;
  const moraleMultiplierPressure = clamp((1 - teamMoraleMultiplier) * 0.28, -0.06, 0.12);
  const contextBase = getContextBaseChance(context);

  return clamp(
    contextBase *
      (1 + qualityPressure + fatiguePressure + moralePenalty + moraleMultiplierPressure + rainPressure) *
      clamp(pressureMultiplier, 0.75, 1.45),
    0.004,
    0.052
  );
};

export const buildLiveOwnGoalCommentary = (
  context: LiveOwnGoalContext,
  ownGoalPlayerName: string,
  rng: () => number
): string => {
  const variants = context === 'corner'
    ? [
        `Gol samobójczy! ${ownGoalPlayerName} niefortunnie przecina dośrodkowanie z rzutu rożnego i kieruje piłkę do własnej bramki!`,
        `Ale pech! Po rożnym ${ownGoalPlayerName} próbuje wybijać, piłka odbija się od niego i wpada do siatki!`,
        `Samobój po stałym fragmencie! ${ownGoalPlayerName} źle układa ciało i zaskakuje własnego bramkarza!`,
      ]
    : context === 'chaos'
      ? [
          `Gol samobójczy! W ogromnym zamieszaniu ${ownGoalPlayerName} dotyka piłki jako ostatni i ta wpada do bramki!`,
          `Chaos w polu karnym kończy się samobójem! ${ownGoalPlayerName} interweniuje rozpaczliwie, ale pakuje piłkę do własnej siatki!`,
          `Niefortunna interwencja! ${ownGoalPlayerName} próbuje ratować sytuację i pokonuje własnego bramkarza!`,
        ]
      : [
          `Gol samobójczy! ${ownGoalPlayerName} przecina groźne podanie, ale kieruje piłkę do własnej bramki!`,
          `Fatalny pech obrońcy! ${ownGoalPlayerName} próbuje zatrzymać akcję i zaskakuje własnego bramkarza!`,
          `Samobój! Pod presją ${ownGoalPlayerName} interweniuje nieczysto i piłka wpada do siatki!`,
        ];
  const index = Math.floor(clamp(rng(), 0, 0.999999) * variants.length);
  return variants[index];
};

/**
 * Match engine own-goal note
 *
 * What this resolver does:
 * It turns a small share of already-dangerous attacking outcomes into own goals. The function is not
 * a separate random goal generator; it is called only after the live engine has already created a real
 * goal-level situation such as open play finishing, penalty-box chaos, or a corner. That keeps total
 * scoring balance stable while adding the football detail that some goals are caused by a defender's
 * last touch.
 *
 * Why the probability is contextual:
 * Own goals should be rare in normal play, slightly more likely during corners and chaos, and more
 * likely when the defending team is tired, technically weak under pressure, low on morale, or playing
 * in heavy rain. These inputs mirror football causes instead of adding a flat arcade roll to every
 * minute. The hard cap keeps extreme conditions from producing a silly number of own goals.
 *
 * How the responsible player is selected:
 * Defenders and players in defensive slots receive the largest weight, exhausted players receive more
 * risk, and strong defensive/technical/mental attributes reduce the chance of being selected. The
 * goalkeeper can still be selected, but at a lower weight because keeper own goals happen and should
 * remain possible without dominating the event.
 *
 * How the result should be used:
 * The scoring side still receives the team goal, but the returned player is from the defending side.
 * MatchLiveView stores that player as ownGoalPlayerId/ownGoalPlayerName and marks isOwnGoal so UI,
 * reports, ratings, morale, and season stats can avoid crediting a normal goal to the wrong player.
 */
export const resolveLiveOwnGoal = ({
  context,
  defendingPlayers,
  defendingLineup,
  defendingFatigue,
  weather,
  pressureMultiplier = 1,
  rng,
}: ResolveLiveOwnGoalInputs): LiveOwnGoalResult | null => {
  const chance = calculateLiveOwnGoalChance({
    context,
    defendingPlayers,
    defendingLineup,
    defendingFatigue,
    weather,
    pressureMultiplier,
  });

  if (rng() >= chance) return null;

  const candidates = defendingLineup
    .map((id, slotIndex) => {
      if (!id) return null;
      const player = defendingPlayers.find(candidate => candidate.id === id);
      if (!player) return null;
      return {
        player,
        weight: getPlayerRiskWeight(player, slotIndex, defendingFatigue[player.id] ?? 100),
      };
    })
    .filter((candidate): candidate is { player: Player; weight: number } => candidate !== null);
  const player = chooseWeightedPlayer(candidates, rng);
  if (!player) return null;

  return {
    player,
    chance,
    commentary: buildLiveOwnGoalCommentary(context, player.lastName, rng),
  };
};
