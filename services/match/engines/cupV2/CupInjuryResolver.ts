import { MatchEventType } from '../../../../types';
import type { CupMatchEvent, CupTeamRuntimeProfile, CupTickContext } from './CupMatchTypes';
import { clamp, pickWeighted } from './CupMath';

export const CupInjuryResolver = {
  /**
   * Kontuzje powinny wynikać z obciążenia meczu: zmęczenia, pressingu,
   * intensywności pojedynków, pogody i jakości murawy. Nie losujemy ich
   * równomiernie co minutę, bo wtedy nie reagują na styl gry.
   */
  maybeCreateInjury: ({
    ctx,
    profile,
    contactIntensity,
    salt,
  }: {
    ctx: CupTickContext;
    profile: CupTeamRuntimeProfile;
    contactIntensity: number;
    salt: number;
  }): CupMatchEvent | null => {
    const pitchRisk = (100 - ctx.input.environment.pitchQuality) * 0.00012;
    const weatherRisk = (ctx.input.environment.weather?.weatherIntensity ?? 0) * 0.006;
    const fatigueRisk = Math.max(0, 62 - profile.staminaReserve) * 0.00055;
    const injuryChance = clamp(0.0015 + pitchRisk + weatherRisk + fatigueRisk + contactIntensity * 0.010, 0.0005, 0.035);

    if (ctx.random(salt) > injuryChance || profile.activePlayers.length === 0) return null;

    const injured = pickWeighted(profile.activePlayers.map(player => ({
      item: player,
      weight: Math.max(1, 105 - (ctx.state.fatigue[player.id] ?? player.condition) + contactIntensity * 20),
    })), ctx.random(salt + 1));

    const severe = ctx.random(salt + 2) < clamp(0.08 + contactIntensity * 0.16 + Math.max(0, 45 - injured.attributes.strength) * 0.002, 0.04, 0.35);

    return {
      id: `cupv2_injury_${ctx.state.second}_${injured.id}`,
      second: ctx.state.second,
      minute: Math.floor(ctx.state.second / 60) + 1,
      side: profile.side,
      type: severe ? MatchEventType.INJURY_SEVERE : MatchEventType.INJURY_LIGHT,
      playerId: injured.id,
      text: `${injured.lastName} potrzebuje pomocy medycznej po intensywnym starciu.`,
      detail: {
        contactIntensity,
        pitchQuality: ctx.input.environment.pitchQuality,
        weatherIntensity: ctx.input.environment.weather?.weatherIntensity ?? 0,
      },
    };
  },
};

