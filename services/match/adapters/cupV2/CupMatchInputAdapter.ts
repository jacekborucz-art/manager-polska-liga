import type {
  Club,
  Lineup,
  MatchContext,
  Player,
  PlayerAttributes,
  Referee,
  TacticalInstructions,
  WeatherSnapshot,
} from '../../../../types';
import { TacticRepository } from '../../../../resources/tactics_db';
import { PolandWeatherService } from '../../../PolandWeatherService';
import { PolishCupVenueService } from '../../../PolishCupVenueService';
import { RefereeService } from '../../../RefereeService';
import type { CupMatchInput, CupTeamInput, CupTeamSide } from '../../engines/cupV2';
import { clamp } from '../../engines/cupV2';

export type CupAdapterTeamDiagnostics = {
  side: CupTeamSide;
  clubId: string;
  name: string;
  tacticId: string;
  foundStartingPlayers: number;
  missingStartingSlots: number;
  hasGoalkeeper: boolean;
  averageOverall: number;
  weightedQuality: number;
  morale: number;
  preMatchMotivation: number;
  stadiumSupport: number;
};

export type CupMatchInputAdapterDiagnostics = {
  seed: string;
  venueName: string;
  neutralVenue: boolean;
  pitchQuality: number;
  attendance: number;
  stadiumCapacity: number;
  refereeId: string;
  weatherDescription?: string;
  home: CupAdapterTeamDiagnostics;
  away: CupAdapterTeamDiagnostics;
  expectedFavorite?: CupTeamSide;
  qualityGap: number;
};

export type CupMatchInputAdapterResult = {
  input: CupMatchInput;
  diagnostics: CupMatchInputAdapterDiagnostics;
};

export type CupMatchInputAdapterOptions = {
  homeLineup: Lineup;
  awayLineup: Lineup;
  homeInstructions?: Partial<TacticalInstructions>;
  awayInstructions?: Partial<TacticalInstructions>;
  referee?: Referee;
  weather?: WeatherSnapshot;
  pitchQuality?: number;
  attendance?: number;
  seedSuffix?: string;
  userSide?: CupTeamSide;
  userPreMatchMotivation?: number;
  aiPreMatchMotivation?: number;
  enableExtraTime?: boolean;
  enablePenaltyShootout?: boolean;
};

const DEFAULT_INSTRUCTIONS: TacticalInstructions = {
  tempo: 'NORMAL',
  mindset: 'NEUTRAL',
  intensity: 'NORMAL',
  passing: 'MIXED',
  pressing: 'NORMAL',
  counterAttack: 'NORMAL',
  marking: 'ZONE',
  lastChangeMinute: 0,
  expiryMinute: -1,
  tempoExpiry: -1,
  mindsetExpiry: -1,
  intensityExpiry: -1,
  tempoCooldown: -1,
  mindsetCooldown: -1,
  intensityCooldown: -1,
  passingCooldown: -1,
  pressingCooldown: -1,
  counterAttackCooldown: -1,
  markingCooldown: -1,
  tempoResponseFactor: 1,
  mindsetResponseFactor: 1,
  intensityResponseFactor: 1,
  passingResponseFactor: 1,
  pressingResponseFactor: 1,
  counterAttackResponseFactor: 1,
  markingResponseFactor: 1,
};

const ATTRIBUTE_WEIGHTS: Record<keyof PlayerAttributes, number> = {
  strength: 0.55,
  stamina: 0.75,
  pace: 0.72,
  defending: 0.95,
  passing: 1.0,
  attacking: 0.95,
  finishing: 0.84,
  technique: 1.0,
  vision: 0.88,
  dribbling: 0.76,
  heading: 0.46,
  positioning: 0.88,
  goalkeeping: 0.42,
  freeKicks: 0.24,
  talent: 0.22,
  penalties: 0.18,
  corners: 0.18,
  aggression: 0.5,
  crossing: 0.46,
  leadership: 0.36,
  mentality: 0.84,
  workRate: 0.78,
};

const stableHash = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const mergeInstructions = (instructions?: Partial<TacticalInstructions>): TacticalInstructions => ({
  ...DEFAULT_INSTRUCTIONS,
  ...instructions,
});

const getStartingPlayers = (lineup: Lineup, players: Player[]): Player[] => {
  const byId = new Map(players.map(player => [player.id, player]));
  return lineup.startingXI
    .map(playerId => playerId ? byId.get(playerId) : undefined)
    .filter((player): player is Player => Boolean(player));
};

const average = (values: number[], fallback = 50): number =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;

const calculateWeightedQuality = (players: Player[]): number => {
  if (players.length === 0) return 50;
  const totalWeight = Object.values(ATTRIBUTE_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  const score = players.reduce((teamSum, player) => {
    const attrScore = (Object.entries(ATTRIBUTE_WEIGHTS) as Array<[keyof PlayerAttributes, number]>)
      .reduce((sum, [key, weight]) => sum + (player.attributes[key] ?? 50) * weight, 0) / totalWeight;
    const condition = clamp(player.condition ?? 75, 35, 100);
    const form = clamp(player.form ?? 50, 20, 90);
    const morale = clamp(player.morale ?? 50, 15, 95);
    return teamSum + attrScore * 0.82 + condition * 0.08 + form * 0.06 + morale * 0.04;
  }, 0) / players.length;

  return Math.round(score * 100) / 100;
};

const calculateMotivation = (
  side: CupTeamSide,
  homeClub: Club,
  awayClub: Club,
  override?: number,
): number => {
  if (typeof override === 'number') return clamp(override, 0, 100);

  const self = side === 'HOME' ? homeClub : awayClub;
  const opponent = side === 'HOME' ? awayClub : homeClub;
  const reputationGap = opponent.reputation - self.reputation;
  const underdogLift = clamp(reputationGap / 3, -6, 12);
  const moraleLift = clamp(((self.morale ?? 50) - 50) * 0.18, -5, 6);

  return Math.round(clamp(58 + underdogLift + moraleLift, 35, 85));
};

const calculateStadiumSupport = (
  side: CupTeamSide,
  neutralVenue: boolean,
  attendance: number,
  stadiumCapacity: number,
): number => {
  if (neutralVenue) return 50;

  const occupancy = stadiumCapacity > 0 ? clamp(attendance / stadiumCapacity, 0.25, 1) : 0.7;
  const homeSupport = clamp(52 + occupancy * 9, 54, 63);
  return side === 'HOME' ? Math.round(homeSupport) : Math.round(100 - homeSupport);
};

const estimatePitchQuality = (
  ctx: MatchContext,
  weather: WeatherSnapshot | undefined,
  neutralVenue: boolean,
): number => {
  const month = ctx.fixture.date.getMonth();
  const stadiumBase = neutralVenue
    ? 92
    : ctx.homeClub.stadiumCapacity >= 30_000
      ? 82
      : ctx.homeClub.stadiumCapacity >= 12_000
        ? 76
        : 70;
  const winterPenalty = month === 11 || month <= 1 ? 5 : month === 2 ? 3 : 0;
  const weatherPenalty = weather ? Math.round((weather.weatherIntensity ?? 0) * 12) : 0;
  const hashNoise = (stableHash(`${ctx.fixture.id}_pitch`) % 7) - 3;

  return Math.round(clamp(stadiumBase - winterPenalty - weatherPenalty + hashNoise, 48, 96));
};

const buildTeamInput = ({
  side,
  club,
  players,
  lineup,
  instructions,
  morale,
  preMatchMotivation,
  stadiumSupport,
}: {
  side: CupTeamSide;
  club: Club;
  players: Player[];
  lineup: Lineup;
  instructions: TacticalInstructions;
  morale: number;
  preMatchMotivation: number;
  stadiumSupport: number;
}): CupTeamInput => ({
  side,
  clubId: club.id,
  name: club.name,
  players,
  lineup,
  tactic: TacticRepository.getById(lineup.tacticId),
  instructions,
  morale,
  preMatchMotivation,
  stadiumSupport,
});

const diagnoseTeam = (team: CupTeamInput): CupAdapterTeamDiagnostics => {
  const starters = getStartingPlayers(team.lineup, team.players);
  return {
    side: team.side,
    clubId: team.clubId,
    name: team.name,
    tacticId: team.lineup.tacticId,
    foundStartingPlayers: starters.length,
    missingStartingSlots: Math.max(0, 11 - starters.length),
    hasGoalkeeper: starters.some(player => player.position === 'GK'),
    averageOverall: Math.round(average(starters.map(player => player.overallRating)) * 100) / 100,
    weightedQuality: calculateWeightedQuality(starters),
    morale: team.morale,
    preMatchMotivation: team.preMatchMotivation,
    stadiumSupport: team.stadiumSupport,
  };
};

export const CupMatchInputAdapter = {
  fromMatchContext: (ctx: MatchContext, options: CupMatchInputAdapterOptions): CupMatchInputAdapterResult => {
    const seed = `${ctx.fixture.id}_cup_v2_${options.seedSuffix ?? 'shadow'}`;
    const venue = PolishCupVenueService.getVenue(ctx.fixture, ctx.homeClub);
    const neutralVenue = Boolean(ctx.fixture.neutralVenue ?? venue.isNeutral);
    const weather = options.weather ?? PolandWeatherService.getWeather(ctx.fixture.date, seed);
    const referee = options.referee ?? RefereeService.assignPolishReferee(seed, neutralVenue ? 5 : 4);
    const stadiumCapacity = venue.capacity ?? ctx.homeClub.stadiumCapacity;
    const attendance = Math.round(options.attendance ?? ctx.fixture.attendance ?? Math.max(1800, stadiumCapacity * (neutralVenue ? 0.82 : 0.68)));
    const pitchQuality = Math.round(options.pitchQuality ?? estimatePitchQuality(ctx, weather, neutralVenue));
    const homeInstructions = mergeInstructions(options.homeInstructions);
    const awayInstructions = mergeInstructions(options.awayInstructions);
    const homeMotivation = calculateMotivation(
      'HOME',
      ctx.homeClub,
      ctx.awayClub,
      options.userSide === 'HOME' ? options.userPreMatchMotivation : options.aiPreMatchMotivation,
    );
    const awayMotivation = calculateMotivation(
      'AWAY',
      ctx.homeClub,
      ctx.awayClub,
      options.userSide === 'AWAY' ? options.userPreMatchMotivation : options.aiPreMatchMotivation,
    );

    const home = buildTeamInput({
      side: 'HOME',
      club: ctx.homeClub,
      players: ctx.homePlayers,
      lineup: options.homeLineup,
      instructions: homeInstructions,
      morale: clamp(ctx.homeClub.morale ?? 50, 0, 100),
      preMatchMotivation: homeMotivation,
      stadiumSupport: calculateStadiumSupport('HOME', neutralVenue, attendance, stadiumCapacity),
    });
    const away = buildTeamInput({
      side: 'AWAY',
      club: ctx.awayClub,
      players: ctx.awayPlayers,
      lineup: options.awayLineup,
      instructions: awayInstructions,
      morale: clamp(ctx.awayClub.morale ?? 50, 0, 100),
      preMatchMotivation: awayMotivation,
      stadiumSupport: calculateStadiumSupport('AWAY', neutralVenue, attendance, stadiumCapacity),
    });

    const homeDiagnostics = diagnoseTeam(home);
    const awayDiagnostics = diagnoseTeam(away);
    const qualityGap = Math.round((homeDiagnostics.weightedQuality - awayDiagnostics.weightedQuality) * 100) / 100;
    const expectedFavorite = Math.abs(qualityGap) < 1.25 ? undefined : qualityGap > 0 ? 'HOME' : 'AWAY';

    return {
      input: {
        seed,
        home,
        away,
        environment: {
          weather,
          pitchQuality,
          stadiumCapacity,
          attendance,
          referee,
        },
        config: {
          enableExtraTime: options.enableExtraTime ?? true,
          enablePenaltyShootout: options.enablePenaltyShootout ?? true,
        },
        calibration: {
          scenario: neutralVenue ? 'REAL_CUP_NEUTRAL' : 'REAL_CUP',
          homeQuality: homeDiagnostics.weightedQuality,
          awayQuality: awayDiagnostics.weightedQuality,
          expectedFavorite,
        },
      },
      diagnostics: {
        seed,
        venueName: venue.name,
        neutralVenue,
        pitchQuality,
        attendance,
        stadiumCapacity,
        refereeId: referee.id,
        weatherDescription: weather?.description,
        home: homeDiagnostics,
        away: awayDiagnostics,
        expectedFavorite,
        qualityGap,
      },
    };
  },
};
