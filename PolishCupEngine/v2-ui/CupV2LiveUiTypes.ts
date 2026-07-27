import type { Club, MatchEventType, PlayerPosition, TacticalInstructions } from '../../types';

export type CupV2UiSide = 'HOME' | 'AWAY';

export type CupV2KitUi = {
  primary: string;
  secondary: string;
  text: string;
  shirtSecondary?: string;
};

export type CupV2TeamHeaderUi = {
  side: CupV2UiSide;
  club: Club;
  logo?: string | null;
  score: number;
  penaltyScore?: number;
  kit: CupV2KitUi;
  momentum: number;
};

export type CupV2MatchHeaderState = {
  title: string;
  venue: string;
  minuteLabel: string;
  phaseLabel: string;
  isFinished: boolean;
  winnerLabel?: string;
  home: CupV2TeamHeaderUi;
  away: CupV2TeamHeaderUi;
};

export type CupV2TeamStatsUi = {
  possession: number;
  shots: number;
  shotsOnTarget: number;
  xG: number;
  corners: number;
  fouls: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
};

export type CupV2PlayerLiveCard = {
  id: string;
  side: CupV2UiSide;
  name: string;
  shortName: string;
  position: PlayerPosition;
  overall: number;
  rating: number;
  fatigue: number;
  isStarter: boolean;
  isBench: boolean;
  isOnPitch: boolean;
  hasLeftPitch: boolean;
  isActiveEvent: boolean;
  substitutedOnMinute?: number;
  substitutedOffMinute?: number;
  goals: number;
  ownGoals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  xG: number;
  fouls: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
  injury?: 'LIGHT' | 'SEVERE';
};

export type CupV2PitchPlayerNode = CupV2PlayerLiveCard & {
  x: number;
  y: number;
  kit: CupV2KitUi;
};

export type CupV2TimelineEvent = {
  id: string;
  minute: number;
  side?: CupV2UiSide;
  type: MatchEventType;
  text: string;
  playerId?: string;
  secondaryPlayerId?: string;
  isGoal: boolean;
  isCard: boolean;
  isInjury: boolean;
  isShootout: boolean;
};

export type CupV2PenaltyShootoutUi = {
  home: number;
  away: number;
  attempts: {
    id: string;
    side: CupV2UiSide;
    playerName: string;
    scored: boolean;
    saved: boolean;
  }[];
};

export type CupV2TacticalPanelState = {
  availableFormations: { id: string; name: string }[];
  instructions: TacticalInstructions;
  captainId?: string | null;
  penaltyTakerId?: string | null;
  freeKickTakerId?: string | null;
  substitutionsUsed: number;
  substitutionsLimit: number;
};

export type CupV2LiveUiState = {
  minute: number;
  currentSecond: number;
  isHalfTime: boolean;
  isFinished: boolean;
  isExtraTime: boolean;
  isShootout: boolean;
  header: CupV2MatchHeaderState;
  stats: Record<CupV2UiSide, CupV2TeamStatsUi>;
  players: Record<CupV2UiSide, CupV2PlayerLiveCard[]>;
  pitchNodes: CupV2PitchPlayerNode[];
  recentEvents: CupV2TimelineEvent[];
  allElapsedEvents: CupV2TimelineEvent[];
  tactical: CupV2TacticalPanelState;
  penaltyShootout?: CupV2PenaltyShootoutUi;
  activePlayerId?: string;
};
