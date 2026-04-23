import { MatchContext, MatchLiveState, Player, MatchEventType } from '../types';
import { TacticRepository } from '../resources/tactics_db';
import { analyzeClubFormImpact } from './MatchFormService';
import { applyFocusToFormImpact } from './MatchPrepFocusService';

export const MomentumService = {
  /**
   * Zwraca wartość natychmiastowego przesunięcia paska na podstawie typu zdarzenia.
   */
  getEventImpulse: (type: MatchEventType, side: 'HOME' | 'AWAY'): number => {
    const power = side === 'HOME' ? 1 : -1;
    switch (type) {
      case MatchEventType.GOAL: return 45 * power;
      case MatchEventType.SHOT_ON_TARGET: return 15 * power;
      case MatchEventType.SHOT_POST:
      case MatchEventType.SHOT_BAR: return 20 * power;
      case MatchEventType.PRESSURE: return 12 * power;
      case MatchEventType.CORNER: return 8 * power;
      case MatchEventType.BLUNDER: return -25 * power;
      case MatchEventType.STUMBLE:
      case MatchEventType.MISPLACED_PASS: return -10 * power;
      case MatchEventType.RED_CARD: return -40 * power;
      case MatchEventType.YELLOW_CARD: return -5 * power;
      case MatchEventType.GK_LONG_THROW: return 5 * power;
      case MatchEventType.DRIBBLING: return 7 * power;
      case MatchEventType.PENALTY_AWARDED: return 30 * power;
      case MatchEventType.PENALTY_SCORED: return 40 * power;
      case MatchEventType.PENALTY_MISSED: return -35 * power;
      default: return 0;
    }
  },

  /**
   * Computes the "Natural Target" for momentum based on stats and tactics.
   * v2.8: forma klubu liczona na pełnym oknie ostatnich 5 spotkań.
   */
  calculateNaturalTarget: (ctx: MatchContext, state: MatchLiveState): number => {
    let target = (ctx.homeClub.reputation - ctx.awayClub.reputation) * 0.5;
    if (ctx.homeAdvantage) target += 5;

    const getTeamTechPower = (players: Player[], lineupIds: string[]) => {
      const active = players.filter(p => lineupIds.includes(p.id));
      if (active.length === 0) return 50;
      const sum = active.reduce(
        (acc, p) => acc + ((p.attributes.technique * 0.4) + (p.attributes.passing * 0.4) + (p.attributes.pace * 0.2)),
        0
      );
      return sum / active.length;
    };

    const homePower = getTeamTechPower(ctx.homePlayers, state.homeLineup.startingXI);
    const awayPower = getTeamTechPower(ctx.awayPlayers, state.awayLineup.startingXI);
    target += (homePower - awayPower) * 1.2;

    const homeTactic = TacticRepository.getById(state.homeLineup.tacticId);
    const awayTactic = TacticRepository.getById(state.awayLineup.tacticId);
    target += (homeTactic.attackBias - awayTactic.attackBias) * 0.4;

    const techGap = homePower - awayPower;
    if (homeTactic.attackBias > 65 && techGap < -8) target += techGap < -15 ? -12 : -6;
    if (homeTactic.defenseBias > 65 && techGap < -8) target += techGap < -15 ? 8 : 4;
    if (awayTactic.attackBias > 65 && techGap > 8) target += techGap > 15 ? 12 : 6;
    if (awayTactic.defenseBias > 65 && techGap > 8) target += techGap > 15 ? -8 : -4;

    const matchDateStr = ctx.fixture.date instanceof Date ? ctx.fixture.date.toISOString().split('T')[0] : String(ctx.fixture.date);
    const matchSeed = new Date(matchDateStr).getTime() / 100000;
    const homeFormImpact = applyFocusToFormImpact(analyzeClubFormImpact(ctx.homeClub.stats.form, ctx.homeCoach), ctx.homeClub, matchDateStr, matchSeed);
    const awayFormImpact = applyFocusToFormImpact(analyzeClubFormImpact(ctx.awayClub.stats.form, ctx.awayCoach), ctx.awayClub, matchDateStr, matchSeed + 1);
    target += homeFormImpact.momentumBonus - awayFormImpact.momentumBonus;

    const homeMoraleBonus = ((ctx.homeClub.morale ?? 50) - 50) / 50 * 6;
    const awayMoraleBonus = ((ctx.awayClub.morale ?? 50) - 50) / 50 * 6;
    target += homeMoraleBonus - awayMoraleBonus;

    const homeDeepSlump = homeFormImpact.isDeepSlump;
    const awayDeepSlump = awayFormImpact.isDeepSlump;
    const lowerBound = homeDeepSlump && !awayDeepSlump ? -92 : awayDeepSlump && !homeDeepSlump ? -78 : -85;
    const upperBound = awayDeepSlump && !homeDeepSlump ? 92 : homeDeepSlump && !awayDeepSlump ? 78 : 85;

    const getDefAvgRating = (players: Player[], xi: (string | null)[]): number => {
      const defList = players.filter(p => xi.includes(p.id) && p.position === 'DEF');
      if (defList.length === 0) return 6.5;
      const avgRatings = defList.map(p => {
        const recent = p.stats?.ratingHistory?.slice(-5) ?? [];
        return recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : 6.5;
      });
      return avgRatings.reduce((a, b) => a + b, 0) / avgRatings.length;
    };

    const homeDefAvg = getDefAvgRating(ctx.homePlayers, state.homeLineup.startingXI);
    const awayDefAvg = getDefAvgRating(ctx.awayPlayers, state.awayLineup.startingXI);

    let homeDefBonus = 0;
    if (homeDefAvg >= 7.0) homeDefBonus = Math.min(4, (homeDefAvg - 7.0) * 2);
    else if (homeDefAvg < 6.4) homeDefBonus = Math.max(-4, (homeDefAvg - 6.4) * 2);

    let awayDefBonus = 0;
    if (awayDefAvg >= 7.0) awayDefBonus = Math.min(4, (awayDefAvg - 7.0) * 2);
    else if (awayDefAvg < 6.4) awayDefBonus = Math.max(-4, (awayDefAvg - 6.4) * 2);

    target += homeDefBonus - awayDefBonus;

    const homeCaptain = ctx.homeClub.captainId ? ctx.homePlayers.find(p => p.id === ctx.homeClub.captainId) : null;
    const awayCaptain = ctx.awayClub.captainId ? ctx.awayPlayers.find(p => p.id === ctx.awayClub.captainId) : null;
    const homeCaptainOnPitch = homeCaptain ? state.homeLineup.startingXI.includes(homeCaptain.id) : false;
    const awayCaptainOnPitch = awayCaptain ? state.awayLineup.startingXI.includes(awayCaptain.id) : false;
    const homeCaptainLeadership = homeCaptainOnPitch ? homeCaptain!.attributes.leadership : 50;
    const awayCaptainLeadership = awayCaptainOnPitch ? awayCaptain!.attributes.leadership : 50;
    target += ((homeCaptainLeadership - awayCaptainLeadership) / 100) * 6;

    return Math.max(lowerBound, Math.min(upperBound, target));
  },

  /**
   * Dynamiczny silnik Momentum v2.6 - Zmęczenie drużyny wpływa na pasek momentum.
   */
  computeMomentum: (
    ctx: MatchContext,
    state: MatchLiveState,
    lastEventType?: MatchEventType,
    lastEventSide?: 'HOME' | 'AWAY',
    homeFatigueMap?: Record<string, number>,
    awayFatigueMap?: Record<string, number>
  ): number => {
    const naturalTarget = MomentumService.calculateNaturalTarget(ctx, state);

    let impulse = 0;
    if (lastEventType && lastEventSide) {
      impulse = MomentumService.getEventImpulse(lastEventType, lastEventSide);
    }

    const jitter = (Math.random() - 0.5) * 3;

    const homeIds = state.homeLineup.startingXI.filter((id): id is string => id !== null);
    const awayIds = state.awayLineup.startingXI.filter((id): id is string => id !== null);
    const homeAvgMentality = homeIds.reduce((acc, id) => {
      const player = ctx.homePlayers.find(x => x.id === id);
      return acc + (player?.attributes.mentality ?? 50);
    }, 0) / Math.max(1, homeIds.length);
    const awayAvgMentality = awayIds.reduce((acc, id) => {
      const player = ctx.awayPlayers.find(x => x.id === id);
      return acc + (player?.attributes.mentality ?? 50);
    }, 0) / Math.max(1, awayIds.length);
    const activeMentality = lastEventSide === 'HOME' ? homeAvgMentality : awayAvgMentality;
    const mentalityErrorMod = 1.0 - ((activeMentality - 50) / 100) * 0.40;
    const humanError = Math.random() < (0.015 * mentalityErrorMod)
      ? (Math.random() - 0.5) * 16 * mentalityErrorMod
      : 0;

    const getAvgFatigue = (lineup: (string | null)[], fatigueMap: Record<string, number>): number => {
      const ids = lineup.filter((id): id is string => id !== null);
      if (ids.length === 0) return 100;
      return ids.reduce((acc, id) => acc + (fatigueMap[id] ?? 100), 0) / ids.length;
    };

    const homeAvg = homeFatigueMap ? getAvgFatigue(state.homeLineup.startingXI, homeFatigueMap) : 100;
    const awayAvg = awayFatigueMap ? getAvgFatigue(state.awayLineup.startingXI, awayFatigueMap) : 100;
    const fatiguePenalty = (avg: number): number => {
      if (avg < 35) return 8;
      if (avg < 50) return 5;
      if (avg < 70) return 2;
      return 0;
    };
    const fatigueBalance = fatiguePenalty(awayAvg) - fatiguePenalty(homeAvg);

    const current = state.momentum + impulse;
    const lerpFactor = 0.08;
    const nextVal = current + (naturalTarget - current) * lerpFactor + jitter + humanError + fatigueBalance;

    return Math.max(-100, Math.min(100, nextVal));
  }
};
