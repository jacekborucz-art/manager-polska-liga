import type { Club, Coach, Fixture } from '../types';
import type { BriefingEffect } from './PreMatchBriefingService';
import type { TalkEffect } from './HalftimeTalkService';
import type { DebriefEffect } from './PostMatchDebriefService';

export type MatchStakes = 'TITLE_RACE' | 'EUROPE_RACE' | 'RELEGATION_FIGHT' | 'MID_TABLE' | 'LOW_STAKES';

export interface TeamPressureProfile {
  rank: number;
  stakes: MatchStakes;
  intensityMultiplier: number;
  composureMultiplier: number;
  cardMultiplier: number;
  fatigueMultiplier: number;
  lateChaseMultiplier: number;
  resignationMultiplier: number;
}

export interface MatchPressureContext {
  roundNumber: number;
  isLateSeason: boolean;
  rivalryMultiplier: number;
  home: TeamPressureProfile;
  away: TeamPressureProfile;
}

export interface LivePressureModifiers {
  initiativeMultiplier: number;
  shotMultiplier: number;
  cardMultiplier: number;
  penaltyMultiplier: number;
  injuryMultiplier: number;
  fatigueDrainExtra: number;
}

export const NEUTRAL_PRESSURE_PROFILE: TeamPressureProfile = {
  rank: 10,
  stakes: 'MID_TABLE',
  intensityMultiplier: 1,
  composureMultiplier: 1,
  cardMultiplier: 1,
  fatigueMultiplier: 1,
  lateChaseMultiplier: 0,
  resignationMultiplier: 1,
};

export const NEUTRAL_LIVE_PRESSURE_MODIFIERS: LivePressureModifiers = {
  initiativeMultiplier: 1,
  shotMultiplier: 1,
  cardMultiplier: 1,
  penaltyMultiplier: 1,
  injuryMultiplier: 1,
  fatigueDrainExtra: 0,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const getFixtureRoundNumber = (fixture: Fixture, home: Club, away: Club): number => {
  const match = fixture.id.match(/_R(\d+)_/);
  if (match) return Number(match[1]);
  return Math.max(home.stats.played, away.stats.played) + 1;
};

const getCoachAttr = (coach: Coach | null | undefined, attr: 'motivation' | 'experience' | 'decisionMaking'): number => {
  return Number(coach?.attributes?.[attr] ?? 50);
};

const getStakes = (rank: number, roundNumber: number): MatchStakes => {
  if (rank <= 3) return 'TITLE_RACE';
  if (rank <= 5) return 'EUROPE_RACE';
  if (rank >= 13) return 'RELEGATION_FIGHT';
  if (roundNumber >= 31 && rank >= 7 && rank <= 13) return 'LOW_STAKES';
  return 'MID_TABLE';
};

const buildPressureProfile = (
  club: Club,
  rank: number,
  opponentRank: number,
  roundNumber: number,
  isLateSeason: boolean,
  coach: Coach | null | undefined,
  isHomeSide: boolean
): TeamPressureProfile => {
  const stakes = isLateSeason ? getStakes(rank, roundNumber) : 'MID_TABLE';
  const phase = isLateSeason ? clamp((roundNumber - 25) / 9, 0, 1) : 0;
  const morale = club.morale ?? 50;
  const coachControl = clamp(((getCoachAttr(coach, 'motivation') + getCoachAttr(coach, 'experience')) / 2 - 50) / 50, -1, 1);
  const directRival = Math.abs(rank - opponentRank) <= 2 ? 1 : 0;
  const homeComposure = isHomeSide ? 0.006 : -0.004;
  const awayIntensity = isHomeSide ? 0 : 0.004;

  let intensityMultiplier = 1;
  let composureMultiplier = 1;
  let cardMultiplier = 1;
  let fatigueMultiplier = 1;
  let lateChaseMultiplier = 0;
  let resignationMultiplier = 1;

  if (stakes === 'TITLE_RACE' || stakes === 'EUROPE_RACE') {
    const titleWeight = stakes === 'TITLE_RACE' ? 1 : 0.75;
    intensityMultiplier += phase * (0.025 + directRival * 0.012 + awayIntensity) * titleWeight;
    composureMultiplier += phase * (coachControl * 0.018 + homeComposure - (morale < 40 ? 0.012 : 0));
    cardMultiplier += phase * (0.035 + directRival * 0.025);
    fatigueMultiplier += phase * 0.020;
    lateChaseMultiplier = phase * (0.030 + directRival * 0.015);
  } else if (stakes === 'RELEGATION_FIGHT') {
    intensityMultiplier += phase * (0.040 + directRival * 0.018 + awayIntensity + (morale >= 55 ? 0.010 : 0));
    composureMultiplier += phase * (coachControl * 0.020 + homeComposure - (morale < 45 ? 0.025 : 0.005));
    cardMultiplier += phase * (0.090 + directRival * 0.035);
    fatigueMultiplier += phase * 0.045;
    lateChaseMultiplier = phase * (0.075 + directRival * 0.025);
    resignationMultiplier = morale < 35 ? 1 - phase * 0.080 : 1;
  } else if (stakes === 'LOW_STAKES') {
    intensityMultiplier -= phase * 0.010;
    fatigueMultiplier -= phase * 0.010;
  }

  return {
    rank,
    stakes,
    intensityMultiplier: clamp(intensityMultiplier, 0.96, 1.08),
    composureMultiplier: clamp(composureMultiplier, 0.93, 1.04),
    cardMultiplier: clamp(cardMultiplier, 0.95, 1.18),
    fatigueMultiplier: clamp(fatigueMultiplier, 0.98, 1.08),
    lateChaseMultiplier: clamp(lateChaseMultiplier, 0, 0.12),
    resignationMultiplier: clamp(resignationMultiplier, 0.90, 1),
  };
};

export const buildMatchPressureContext = (
  fixture: Fixture,
  home: Club,
  away: Club,
  standings: Club[],
  homeCoach?: Coach | null,
  awayCoach?: Coach | null
): MatchPressureContext => {
  const roundNumber = getFixtureRoundNumber(fixture, home, away);
  const isLateSeason = roundNumber > 25 || Math.min(home.stats.played, away.stats.played) >= 25;
  const homeRank = standings.findIndex(c => c.id === home.id) + 1 || 10;
  const awayRank = standings.findIndex(c => c.id === away.id) + 1 || 10;
  const homeProfile = buildPressureProfile(home, homeRank, awayRank, roundNumber, isLateSeason, homeCoach, true);
  const awayProfile = buildPressureProfile(away, awayRank, homeRank, roundNumber, isLateSeason, awayCoach, false);
  const topClash = homeRank <= 5 && awayRank <= 5;
  const relegationClash = homeRank >= 13 && awayRank >= 13;
  const directTableRival = Math.abs(homeRank - awayRank) <= 2;
  const phase = isLateSeason ? clamp((roundNumber - 25) / 9, 0, 1) : 0;
  const rivalryMultiplier = 1 + phase * (topClash || relegationClash ? 0.030 : directTableRival ? 0.015 : 0);

  return {
    roundNumber,
    isLateSeason,
    rivalryMultiplier: clamp(rivalryMultiplier, 1, 1.035),
    home: homeProfile,
    away: awayProfile,
  };
};

export const getPressureProfileForSide = (
  pressureContext: MatchPressureContext | null | undefined,
  side: 'HOME' | 'AWAY'
): TeamPressureProfile => {
  if (!pressureContext?.isLateSeason) return NEUTRAL_PRESSURE_PROFILE;
  return side === 'HOME' ? pressureContext.home : pressureContext.away;
};

const getPressureWeight = (profile: TeamPressureProfile): number => {
  if (profile.stakes === 'TITLE_RACE') return 1.0;
  if (profile.stakes === 'EUROPE_RACE') return 0.75;
  if (profile.stakes === 'RELEGATION_FIGHT') return 1.15;
  if (profile.stakes === 'LOW_STAKES') return 0.20;
  return 0;
};

const amplifyNumber = (value: number, amp: number, min: number, max: number) => {
  return clamp(value * amp, min, max);
};

const amplifyDistanceFromOne = (value: number, amp: number, min: number, max: number) => {
  return clamp(1 + (value - 1) * amp, min, max);
};

export const getLivePressureModifiers = (
  profile: TeamPressureProfile,
  scoreDiff: number,
  minute: number,
  isUserSide: boolean
): LivePressureModifiers => {
  const weight = getPressureWeight(profile);
  if (weight <= 0) return NEUTRAL_LIVE_PRESSURE_MODIFIERS;

  const lateGamePressure = clamp((minute - 60) / 35, 0, 1);
  const isChasing = scoreDiff < 0;
  const collapse = isChasing && scoreDiff <= -2 ? profile.resignationMultiplier : 1;
  const chaseBoost = isChasing
    ? 1 + lateGamePressure * profile.lateChaseMultiplier * Math.min(1.2, Math.abs(scoreDiff) * 0.55)
    : 1;
  const userAutoShare = isUserSide ? 0.45 : 1;
  const soften = (value: number) => 1 + (value - 1) * userAutoShare;

  const initiativeBase = profile.intensityMultiplier * chaseBoost * collapse;
  const shotBase = profile.intensityMultiplier * profile.composureMultiplier * chaseBoost * collapse;
  const cardBase = profile.cardMultiplier * (isChasing ? 1 + lateGamePressure * profile.lateChaseMultiplier * 0.75 : 1);
  const fatigueExtraBase = Math.max(
    0,
    (profile.fatigueMultiplier - 1) * 0.075 + (isChasing ? lateGamePressure * profile.lateChaseMultiplier * 0.035 : 0)
  );

  return {
    initiativeMultiplier: clamp(soften(initiativeBase), 0.96, 1.10),
    shotMultiplier: clamp(soften(shotBase), 0.92, 1.14),
    cardMultiplier: clamp(soften(cardBase), 0.95, 1.22),
    penaltyMultiplier: clamp(soften(1 + (cardBase - 1) * 0.45), 0.97, 1.12),
    injuryMultiplier: clamp(soften(1 + fatigueExtraBase * 1.8), 1, 1.10),
    fatigueDrainExtra: clamp(fatigueExtraBase * userAutoShare, 0, 0.010),
  };
};

export const adjustBriefingEffectForPressure = (
  effect: BriefingEffect,
  profile: TeamPressureProfile
): BriefingEffect => {
  const weight = getPressureWeight(profile);
  if (weight <= 0) return effect;

  const emotionalScore = effect.actionMod + effect.goalMod + effect.momentumBonus / 120 - Math.max(0, effect.rivalBoost) * 0.05;
  const isPositive = emotionalScore >= 0;
  const amp = 1 + weight * (isPositive ? 0.28 : 0.45);
  const fatigueAmp = 1 + weight * (isPositive ? 0.20 : 0.35);

  return {
    ...effect,
    actionMod: amplifyNumber(effect.actionMod, amp, -0.09, 0.11),
    goalMod: amplifyNumber(effect.goalMod, amp, -0.08, 0.09),
    momentumBonus: Math.round(amplifyNumber(effect.momentumBonus, amp, -35, 38)),
    fatigueMult: amplifyDistanceFromOne(effect.fatigueMult, fatigueAmp, 0.86, 1.16),
    rivalBoost: amplifyNumber(effect.rivalBoost, amp, -0.05, 0.90),
  };
};

export const adjustTalkEffectForPressure = (
  effect: TalkEffect,
  profile: TeamPressureProfile,
  scoreDiff: number
): TalkEffect => {
  const weight = getPressureWeight(profile);
  if (weight <= 0) return effect;

  const matchStateAmp = scoreDiff < 0 ? 1.15 : scoreDiff === 0 ? 1.05 : 0.90;
  const isPositive = effect.momentumDelta >= 0;
  const amp = 1 + weight * matchStateAmp * (isPositive ? 0.30 : 0.50);
  const rfAmp = 1 + weight * (isPositive ? 0.18 : 0.28);

  return {
    ...effect,
    momentumDelta: Math.round(amplifyNumber(effect.momentumDelta, amp, -35, 38) * 10) / 10,
    tempoResponseFactor: Number(amplifyDistanceFromOne(effect.tempoResponseFactor, rfAmp, 0.68, 1.34).toFixed(2)),
    mindsetResponseFactor: Number(amplifyDistanceFromOne(effect.mindsetResponseFactor, rfAmp, 0.68, 1.34).toFixed(2)),
    intensityResponseFactor: Number(amplifyDistanceFromOne(effect.intensityResponseFactor, rfAmp, 0.68, 1.34).toFixed(2)),
    fatigueRegenBonus: Math.round(amplifyNumber(effect.fatigueRegenBonus, amp, -4, 5) * 10) / 10,
  };
};

export const adjustDebriefEffectForPressure = (
  effect: DebriefEffect,
  profile: TeamPressureProfile,
  scoreDiff: number
): DebriefEffect => {
  const weight = getPressureWeight(profile);
  if (weight <= 0) return effect;

  const resultAmp = scoreDiff > 0 ? 1.05 : scoreDiff === 0 ? 0.90 : 1.25;
  const isPositive = effect.moraleDelta >= 0;
  const amp = 1 + weight * resultAmp * (isPositive ? 0.28 : 0.48);

  return {
    ...effect,
    moraleDelta: Math.round(amplifyNumber(effect.moraleDelta, amp, -24, 22)),
  };
};

export const getAiHalftimePressureMultiplier = (
  profile: TeamPressureProfile,
  coach?: Coach | null
): number => {
  const weight = getPressureWeight(profile);
  if (weight <= 0) return 1;

  const experienceControl = clamp((getCoachAttr(coach, 'experience') - 50) / 50, -1, 1);
  const decisionControl = clamp((getCoachAttr(coach, 'decisionMaking') - 50) / 50, -1, 1);
  return clamp(1 + weight * (0.12 + experienceControl * 0.10 + decisionControl * 0.06), 0.90, 1.34);
};
