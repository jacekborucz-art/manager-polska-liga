import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { MatchEventType, type Player } from '../../../types';
import type { CupTeamInput, CupTeamSide } from '../../../services/match/engines/cupV2';
import {
  type MatchEngineV2Frame,
  type MatchEngineV2PlaybackSpeed,
  type MatchEngineV2PlaybackState,
  type MatchEngineV2Point,
  type MatchEngineV2Snapshot,
  type MatchEngineV2TransmissionMode,
  type MatchEngineV2VisualCue,
} from '../../../services/match/engines/v2';
import { useMatchEngineV2Frame } from './useMatchEngineV2Frame';

const VIEW_WIDTH = 1920;
const VIEW_HEIGHT = 1080;
const PITCH = { x: 690, y: 158, width: 540, height: 720 } as const;

type MatchLiveV2PrototypeProps = {
  snapshot: MatchEngineV2Snapshot;
  playback: MatchEngineV2PlaybackState;
  home: CupTeamInput;
  away: CupTeamInput;
  homeLogo?: string;
  awayLogo?: string;
  homeColor?: string;
  awayColor?: string;
  managedSide?: CupTeamSide;
  onTogglePause?: () => void;
  onSetSpeed?: (speed: MatchEngineV2PlaybackSpeed) => void;
  onSetSceneSpeed?: (sceneSpeed: MatchEngineV2PlaybackSpeed) => void;
  onToggleRenderMode?: () => void;
  onSetTransmissionMode?: (mode: MatchEngineV2TransmissionMode) => void;
  onToggleGoalReplays?: () => void;
  onOpenTactics?: () => void;
  onOpenSubstitutions?: () => void;
  onReplayStateChange?: (active: boolean) => void;
  isHalfTime?: boolean;
  primaryControlLabel?: string;
  onExit?: () => void;
};

type SvgControlProps = {
  x: number;
  y: number;
  width: number;
  label: string;
  active?: boolean;
  accent?: string;
  onActivate?: () => void;
};

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const fullName = (player?: Player): string =>
  player ? `${player.firstName} ${player.lastName}` : 'Nieznany zawodnik';

const roleLabel = (player?: Player): string => player?.position ?? '—';

/**
 * Substitutes {actor}/{receiver} placeholders with real names. The engine
 * only ever hands over player ids in commentaryTemplate, never a name, so a
 * saved match or a different squad never bakes a stale name into the script.
 */
const resolveCommentary = (
  template: string,
  cue: MatchEngineV2VisualCue,
  home: CupTeamInput,
  away: CupTeamInput,
): string => {
  const findPlayer = (playerId?: string): Player | undefined =>
    playerId
      ? home.players.find(item => item.id === playerId) ?? away.players.find(item => item.id === playerId)
      : undefined;
  return template
    .replace('{actor}', fullName(findPlayer(cue.actorId)))
    .replace('{receiver}', fullName(findPlayer(cue.secondaryPlayerId)));
};

const textSizeForLength = (value: string, normal: number, compact: number, tiny: number): number =>
  value.length > 27 ? tiny : value.length > 20 ? compact : normal;

const fitTextLength = (value: string, maximumLength: number) =>
  value.length > 24 ? { textLength: maximumLength, lengthAdjust: 'spacingAndGlyphs' as const } : {};

const padClockUnit = (value: number): string => String(Math.max(0, Math.floor(value))).padStart(2, '0');

/**
 * The authoritative label already handles stoppage-time "45+2" notation, but
 * only refreshes on the coarse authoritative cadence. Between those updates
 * this shows the same football second counting up smoothly on its own; the
 * "+X" form itself isn't replicated cosmetically, so stoppage keeps showing
 * the last authoritative label until the next real tick confirms a new one.
 */
const cosmeticClockLabel = (frame: MatchEngineV2Frame, snapshot: MatchEngineV2Snapshot): string => {
  if (snapshot.displayClock.stoppageMinute) return snapshot.displayClock.label;
  const second = Math.max(0, frame.displaySecond);
  return `${padClockUnit(second / 60)}:${padClockUnit(second % 60)}`;
};

const mapPoint = (point: MatchEngineV2Point): MatchEngineV2Point => ({
  x: PITCH.x + clamp(point.x, 0, 68) / 68 * PITCH.width,
  // HOME attacks towards metre 105, displayed at the top of the vertical pitch.
  y: PITCH.y + PITCH.height - clamp(point.y, 0, 105) / 105 * PITCH.height,
});

/** Human-readable SVG signal for an action whose team shape is easy to miss. */
export const getMatchEngineV2SceneLabel = (cue: MatchEngineV2VisualCue | null | undefined): string | null => {
  if (!cue) return null;
  if (cue.scriptedHighlight && cue.highlightScriptTitle) {
    const sceneProgress = cue.highlightSceneIndex && cue.highlightSceneCount
      ? ` · ${cue.highlightSceneIndex}/${cue.highlightSceneCount}`
      : '';
    return `${cue.highlightScriptTitle}${sceneProgress}`;
  }
  if (cue.setPieceKind === 'PENALTY' || cue.sourceEventType === MatchEventType.PENALTY_AWARDED) return 'RZUT KARNY';
  if (
    cue.setPieceKind === 'FREE_KICK_DIRECT' ||
    cue.setPieceKind === 'FREE_KICK_WIDE' ||
    cue.sourceEventType === MatchEventType.FREE_KICK ||
    cue.sourceEventType === MatchEventType.FREE_KICK_DANGEROUS
  ) return 'RZUT WOLNY';
  if (
    cue.setPieceKind === 'CORNER' ||
    cue.sourceEventType === MatchEventType.CORNER ||
    cue.sourceEventType === MatchEventType.CORNER_TAKEN
  ) return 'RZUT ROŻNY';
  if (cue.sourceEventType === MatchEventType.THROW_IN) return 'AUT';
  if (cue.sourceEventType === MatchEventType.OFFSIDE) return 'SPALONY';
  if (cue.sourceEventType === MatchEventType.DRIBBLING || cue.kind === 'DRIBBLE') return 'RAJD Z PIŁKĄ';
  return null;
};

const SvgControl = ({ x, y, width, label, active, accent = '#35e6b2', onActivate }: SvgControlProps) => {
  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (!onActivate || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onActivate();
  };
  return (
    <g
      role="button"
      tabIndex={onActivate ? 0 : -1}
      aria-label={label}
      onClick={onActivate}
      onKeyDown={handleKeyDown}
      className={onActivate ? 'cursor-pointer outline-none' : undefined}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height="48"
        rx="9"
        fill={active ? `${accent}22` : '#0b1527'}
        stroke={active ? accent : '#263550'}
        strokeWidth={active ? 1.5 : 1}
        className="v2-control-surface"
      />
      <path d={`M ${x + 12} ${y + 7} H ${x + width - 12}`} stroke={active ? accent : '#ffffff'} strokeOpacity="0.2" />
      <text
        x={x + width / 2}
        y={y + 29}
        textAnchor="middle"
        fill={active ? '#ffffff' : '#c7d4e7'}
        fontSize="12"
        className="font-black italic uppercase tracking-tighter"
      >
        {label}
      </text>
    </g>
  );
};

const TeamCrest = ({ x, y, logo, color, name }: { x: number; y: number; logo?: string; color: string; name: string }) => (
  <g>
    <circle cx={x} cy={y} r="38" fill="#081322" stroke={color} strokeWidth="2" />
    <circle cx={x} cy={y} r="31" fill={color} fillOpacity="0.13" />
    {logo ? (
      <image href={logo} x={x - 28} y={y - 28} width="56" height="56" preserveAspectRatio="xMidYMid meet">
        <title>{name}</title>
      </image>
    ) : (
      <text x={x} y={y + 8} textAnchor="middle" fill="#ffffff" fontSize="22" className="font-black italic uppercase tracking-tighter">
        {name.slice(0, 2)}
      </text>
    )}
  </g>
);

const TeamLineupPanel = ({
  side,
  x,
  team,
  color,
  snapshot,
  panelGradientId,
}: {
  side: CupTeamSide;
  x: number;
  team: CupTeamInput;
  color: string;
  snapshot: MatchEngineV2Snapshot;
  panelGradientId: string;
}) => {
  const lookup = new Map(team.players.map(player => [player.id, player]));
  const currentOrder = team.lineup.startingXI.filter((id): id is string => Boolean(id));
  const activePlayers = Object.values(snapshot.spatial.players)
    .filter(player => player.side === side && player.isOnPitch)
    .sort((left, right) => currentOrder.indexOf(left.playerId) - currentOrder.indexOf(right.playerId));

  return (
    <g>
      <rect x={x} y="158" width="545" height="720" rx="18" fill={`url(#${panelGradientId})`} stroke={color} strokeOpacity="0.28" />
      <path d={`M ${x + 22} 218 H ${x + 523}`} stroke={color} strokeOpacity="0.55" />
      <text x={x + 25} y="193" fill="#ffffff" fontSize="19" className="font-black italic uppercase tracking-tighter">
        {side === 'HOME' ? 'SKŁAD GOSPODARZY' : 'SKŁAD GOŚCI'}
      </text>
      <text x={x + 520} y="193" textAnchor="end" fill={color} fontSize="11" className="font-black italic uppercase tracking-tighter">
        {team.tactic.name}
      </text>

      {activePlayers.map((spatialPlayer, index) => {
        const player = lookup.get(spatialPlayer.playerId);
        const stats = snapshot.result.playerStats[side]?.[spatialPlayer.playerId];
        const fatigue = snapshot.result.finalState.fatigue[spatialPlayer.playerId] ?? player?.condition ?? 100;
        const yellowCards = snapshot.result.finalState.yellowCards[spatialPlayer.playerId] ?? 0;
        const injured = Boolean(snapshot.result.finalState.injuries[spatialPlayer.playerId]);
        const rowY = 230 + index * 55;
        const playerName = fullName(player);
        return (
          <g key={spatialPlayer.playerId}>
            <rect x={x + 15} y={rowY} width="515" height="47" rx="9" fill={index % 2 ? '#101b2d' : '#0c1729'} stroke="#ffffff" strokeOpacity="0.055" />
            <rect x={x + 15} y={rowY} width="4" height="47" rx="2" fill={color} />
            <circle cx={x + 45} cy={rowY + 23.5} r="14" fill={color} fillOpacity="0.16" stroke={color} strokeOpacity="0.8" />
            <text x={x + 45} y={rowY + 27.5} textAnchor="middle" fill={color} fontSize="8" className="font-black italic uppercase tracking-tighter">
              {roleLabel(player)}
            </text>
            <text
              x={x + 70}
              y={rowY + 21}
              fill="#f8fbff"
              fontSize={textSizeForLength(playerName, 14, 12, 10.5)}
              className="font-black italic uppercase tracking-tighter"
              {...fitTextLength(playerName, 245)}
            >
              {playerName}
              <title>{playerName}</title>
            </text>
            <rect x={x + 70} y={rowY + 31} width="245" height="4" rx="2" fill="#233047" />
            <rect x={x + 70} y={rowY + 31} width={245 * clamp(fatigue, 0, 100) / 100} height="4" rx="2" fill={fatigue < 62 ? '#fb7185' : fatigue < 76 ? '#fbbf24' : '#35e6b2'} />
            {yellowCards > 0 && <rect x={x + 337} y={rowY + 16} width="9" height="14" rx="2" fill="#facc15" />}
            {injured && (
              <text x={x + 358} y={rowY + 28} fill="#fb7185" fontSize="11" className="font-black italic uppercase tracking-tighter">URAZ</text>
            )}
            <text x={x + 448} y={rowY + 20} textAnchor="end" fill="#71819a" fontSize="9" className="font-black italic uppercase tracking-tighter">
              OCENA
            </text>
            <text x={x + 510} y={rowY + 29} textAnchor="end" fill={stats?.rating && stats.rating >= 7 ? '#35e6b2' : '#ffffff'} fontSize="17" className="font-black italic uppercase tracking-tighter">
              {(stats?.rating ?? 6).toFixed(1)}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export const MatchLiveV2Prototype = ({
  snapshot,
  playback,
  home,
  away,
  homeLogo,
  awayLogo,
  homeColor = '#3b82f6',
  awayColor = '#f43f5e',
  managedSide = 'HOME',
  onTogglePause,
  onSetSpeed,
  onSetSceneSpeed,
  onToggleRenderMode,
  onSetTransmissionMode,
  onToggleGoalReplays,
  onOpenTactics,
  onOpenSubstitutions,
  onReplayStateChange,
  isHalfTime = false,
  primaryControlLabel,
  onExit,
}: MatchLiveV2PrototypeProps) => {
  const rawId = useId();
  const [transmissionMenuOpen, setTransmissionMenuOpen] = useState(false);
  const definitionId = `match-v2-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const frame = useMatchEngineV2Frame(snapshot, playback, `${home.clubId}:${away.clubId}`);
  const latestCue = frame.activeCue;
  const commentaryOnly = playback.transmissionMode === 'COMMENTARY_ONLY';
  const interactivePitch = playback.renderMode === 'INTERACTIVE' && !commentaryOnly;
  const fullMatchPresentation = interactivePitch && playback.transmissionMode === 'FULL_MATCH';
  const animatedScene = interactivePitch && Boolean(latestCue);
  // In KEY_MOMENTS and ALL_ACTIONS the pitch is a calm tactical board between
  // highlights: formation anchors only, with no ball. FULL_MATCH deliberately
  // opts back into the continuous experimental stream.
  const useLivePlayerPositions = fullMatchPresentation || animatedScene;
  const showBall = fullMatchPresentation || animatedScene;
  const showCommentaryPanel = playback.renderMode === 'CLASSIC' || commentaryOnly;
  const sceneLabel = getMatchEngineV2SceneLabel(latestCue);
  const activeCommentary = latestCue?.commentaryTemplate
    ? resolveCommentary(latestCue.commentaryTemplate, latestCue, home, away)
    : null;
  const cueStart = latestCue ? mapPoint(latestCue.start) : null;
  const cueEnd = latestCue ? mapPoint(latestCue.end) : null;
  const ball = mapPoint(frame.ball);
  const ballY = ball.y - frame.ball.z * 5;
  const ballScale = 1 + frame.ball.z * 0.08;
  const ballRotation = (frame.visualClockMs * 0.18 + frame.cueProgress * 210) % 360;
  const latestEvents = snapshot.result.events.filter(event => event.second <= snapshot.second).slice(-6).reverse();
  const nextSpeed: Record<MatchEngineV2PlaybackSpeed, MatchEngineV2PlaybackSpeed> = { 1: 2, 2: 3, 3: 1 };
  const speedLabel: Record<MatchEngineV2PlaybackSpeed, string> = { 1: 'NORMALNE', 2: 'WOLNIEJ', 3: 'DUŻO WOLNIEJ' };
  // Independent from TEMPO above: only stretches how long an authored action
  // scene plays, never the pacing of quiet in-between play.
  const nextSceneSpeed: Record<MatchEngineV2PlaybackSpeed, MatchEngineV2PlaybackSpeed> = { 1: 2, 2: 3, 3: 1 };
  const sceneSpeedLabel: Record<MatchEngineV2PlaybackSpeed, string> = { 1: 'NORMALNE', 2: 'WOLNIEJ', 3: 'DUŻO WOLNIEJ' };
  const transmissionLabel: Record<MatchEngineV2TransmissionMode, string> = {
    COMMENTARY_ONLY: 'TYLKO KOMENTARZ',
    KEY_MOMENTS: 'KLUCZOWE AKCJE',
    ALL_ACTIONS: 'WSZYSTKIE AKCJE',
    FULL_MATCH: 'PEŁNY MECZ',
  };
  const coachSummary = snapshot.coachPresentation[managedSide].summary;
  const momentum = clamp(snapshot.result.finalState.momentum, -100, 100);
  const momentumWidth = Math.abs(momentum) / 100 * 220;
  const celebratingColor = frame.goalCelebration.side === 'AWAY' ? awayColor : homeColor;
  const celebratingTeam = frame.goalCelebration.side === 'AWAY' ? away.name : home.name;
  const ballOwner = snapshot.spatial.ball.ownerId
    ? home.players.find(player => player.id === snapshot.spatial.ball.ownerId) ??
      away.players.find(player => player.id === snapshot.spatial.ball.ownerId)
    : undefined;
  const possessionTeam = snapshot.result.finalState.possession === 'HOME' ? home.name : away.name;
  const quietPlayLabel = playback.transmissionMode === 'KEY_MOMENTS'
    ? 'OCZEKIWANIE NA KLUCZOWĄ AKCJĘ • USTAWIENIE TAKTYCZNE'
    : playback.transmissionMode === 'ALL_ACTIONS'
      ? 'OCZEKIWANIE NA KOLEJNĄ AKCJĘ • USTAWIENIE TAKTYCZNE'
      : ballOwner
        ? `PRZY PIŁCE: ${fullName(ballOwner)} • ${possessionTeam}`
        : snapshot.spatial.ball.phase === 'TRAVELLING'
          ? `PIŁKA W LOCIE • ${possessionTeam}`
          : `POSIADANIE: ${possessionTeam}`;
  const activeActor = latestCue?.actorId
    ? home.players.find(player => player.id === latestCue.actorId) ?? away.players.find(player => player.id === latestCue.actorId)
    : undefined;
  const activeReceiver = latestCue?.secondaryPlayerId
    ? home.players.find(player => player.id === latestCue.secondaryPlayerId) ?? away.players.find(player => player.id === latestCue.secondaryPlayerId)
    : undefined;
  const actionParticipantsLabel = activeActor
    ? activeReceiver
      ? `${activeActor.lastName} DO ${activeReceiver.lastName}`
      : `${latestCue?.kind ?? 'AKCJA'}: ${activeActor.lastName}`
    : null;

  useEffect(() => {
    // Goal presentation freezes authoritative advancement for four real
    // seconds just like a replay, while its own SVG animation keeps running.
    onReplayStateChange?.(frame.blockSimulation);
  }, [frame.blockSimulation, onReplayStateChange]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#030914] text-white">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full select-none"
        role="img"
        aria-label={`Silnik meczu 2.0: ${home.name} kontra ${away.name}`}
        data-pitch-state={showCommentaryPanel ? 'COMMENTARY' : animatedScene ? 'HIGHLIGHT' : fullMatchPresentation ? 'FULL_MATCH' : 'TACTICAL_IDLE'}
      >
        <defs>
          <linearGradient id={`${definitionId}-background`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#071426" />
            <stop offset="0.46" stopColor="#030914" />
            <stop offset="1" stopColor="#081629" />
          </linearGradient>
          <linearGradient id={`${definitionId}-panel`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#111d31" stopOpacity="0.96" />
            <stop offset="1" stopColor="#07101f" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id={`${definitionId}-pitch`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0a4935" />
            <stop offset="0.5" stopColor="#063925" />
            <stop offset="1" stopColor="#082e22" />
          </linearGradient>
          <linearGradient id={`${definitionId}-goal-celebration`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#020712" stopOpacity="0.97" />
            <stop offset="0.5" stopColor={celebratingColor} stopOpacity="0.82" />
            <stop offset="1" stopColor="#020712" stopOpacity="0.97" />
          </linearGradient>
          <radialGradient id={`${definitionId}-ball`} cx="35%" cy="28%" r="70%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.65" stopColor="#dbeafe" />
            <stop offset="1" stopColor="#64748b" />
          </radialGradient>
          <pattern id={`${definitionId}-grass`} width="90" height="90" patternUnits="userSpaceOnUse">
            <rect width="45" height="90" fill="#ffffff" fillOpacity="0.022" />
          </pattern>
          <pattern id={`${definitionId}-grid`} width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#69b8ff" strokeOpacity="0.05" strokeWidth="1" />
          </pattern>
          <filter id={`${definitionId}-glow`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`${definitionId}-shadow`} x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="#000000" floodOpacity="0.65" />
          </filter>
        </defs>

        <style>{`
          @keyframes v2-player-action { 50% { opacity: .38; stroke-width: 4; } }
          @keyframes v2-receiver-action { to { stroke-dashoffset: -24; } }
          @keyframes v2-goal-flash { 0%, 100% { opacity: 1; } 50% { opacity: .38; } }
          @keyframes v2-scan { from { transform: translateX(-260px); } to { transform: translateX(2100px); } }
          .v2-player-action { animation: v2-player-action .72s ease-in-out infinite; }
          .v2-receiver-action { stroke-dasharray: 5 4; animation: v2-receiver-action .75s linear infinite; }
          .v2-goal-flash { animation: v2-goal-flash .55s step-end infinite; }
          .v2-header-scan { animation: v2-scan 7s ease-in-out infinite; }
          .v2-control-surface { transition: filter .16s ease, stroke-opacity .16s ease; }
          g[role='button']:hover .v2-control-surface, g[role='button']:focus .v2-control-surface { filter: brightness(1.35); stroke-opacity: 1; }
          @media (prefers-reduced-motion: reduce) { .v2-player-action, .v2-receiver-action, .v2-goal-flash, .v2-header-scan { animation: none; } }
        `}</style>

        <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill={`url(#${definitionId}-background)`} />
        <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill={`url(#${definitionId}-grid)`} />
        <ellipse cx="380" cy="270" rx="520" ry="420" fill={homeColor} fillOpacity="0.065" />
        <ellipse cx="1540" cy="270" rx="520" ry="420" fill={awayColor} fillOpacity="0.065" />

        <rect x="28" y="22" width="1864" height="110" rx="22" fill="#081223" stroke="#31415c" />
        <rect x="80" y="32" width="250" height="4" rx="2" fill={homeColor} />
        <rect x="1590" y="32" width="250" height="4" rx="2" fill={awayColor} />
        <rect x="-220" y="23" width="180" height="108" fill="#ffffff" fillOpacity="0.04" className="v2-header-scan" />

        <TeamCrest x={125} y={77} logo={homeLogo} color={homeColor} name={home.name} />
        <TeamCrest x={1795} y={77} logo={awayLogo} color={awayColor} name={away.name} />
        <text x="182" y="73" fill="#ffffff" fontSize={textSizeForLength(home.name, 25, 21, 18)} className="font-black italic uppercase tracking-tighter" {...fitTextLength(home.name, 390)}>
          {home.name}
        </text>
        <text x="182" y="98" fill={homeColor} fontSize="10" className="font-black italic uppercase tracking-tighter">GOSPODARZE • {home.tactic.name}</text>
        <text x="1738" y="73" textAnchor="end" fill="#ffffff" fontSize={textSizeForLength(away.name, 25, 21, 18)} className="font-black italic uppercase tracking-tighter" {...fitTextLength(away.name, 390)}>
          {away.name}
        </text>
        <text x="1738" y="98" textAnchor="end" fill={awayColor} fontSize="10" className="font-black italic uppercase tracking-tighter">GOŚCIE • {away.tactic.name}</text>

        <g filter={`url(#${definitionId}-shadow)`}>
          <path d="M 765 35 H 1155 L 1190 77 L 1155 119 H 765 L 730 77 Z" fill="#050b15" stroke="#40516e" />
          <text x="900" y="89" textAnchor="end" fill="#ffffff" fontSize="52" className="font-black italic uppercase tracking-tighter">{snapshot.result.homeScore}</text>
          <text x="960" y="85" textAnchor="middle" fill="#64748b" fontSize="34" className="font-black italic uppercase tracking-tighter">:</text>
          <text x="1020" y="89" fill="#ffffff" fontSize="52" className="font-black italic uppercase tracking-tighter">{snapshot.result.awayScore}</text>
          <text x="960" y="111" textAnchor="middle" fill="#35e6b2" fontSize="12" className="font-black italic uppercase tracking-tighter">{cosmeticClockLabel(frame, snapshot)}</text>
        </g>
        <text x="960" y="29" textAnchor="middle" fill="#7dd3fc" fontSize="9" className="font-black italic uppercase tracking-tighter">
          SILNIK 2.0 • PROTOTYP
        </text>
        <SvgControl x={1748} y={47} width={112} label="WYJDŹ" onActivate={onExit} />

        <g data-momentum-bar="true">
          <text x="710" y="149" textAnchor="end" fill={homeColor} fontSize="8.5" className="font-black italic uppercase tracking-tighter">GOSPODARZE</text>
          <rect x="724" y="138" width="472" height="12" rx="6" fill="#081322" stroke="#2b3c57" />
          <rect x="732" y="141" width="220" height="6" rx="3" fill={homeColor} fillOpacity="0.14" />
          <rect x="968" y="141" width="220" height="6" rx="3" fill={awayColor} fillOpacity="0.14" />
          {momentum >= 0 ? (
            <rect x={952 - momentumWidth} y="140" width={momentumWidth} height="8" rx="4" fill={homeColor} filter={`url(#${definitionId}-glow)`} />
          ) : (
            <rect x="968" y="140" width={momentumWidth} height="8" rx="4" fill={awayColor} filter={`url(#${definitionId}-glow)`} />
          )}
          <path d="M 960 135 V 153" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
          <text x="960" y="132" textAnchor="middle" fill="#dbe7f6" fontSize="8.5" className="font-black italic uppercase tracking-tighter">MOMENTUM</text>
          <text x="1210" y="149" fill={awayColor} fontSize="8.5" className="font-black italic uppercase tracking-tighter">GOŚCIE</text>
        </g>

        <TeamLineupPanel side="HOME" x={35} team={home} color={homeColor} snapshot={snapshot} panelGradientId={`${definitionId}-panel`} />
        <TeamLineupPanel side="AWAY" x={1340} team={away} color={awayColor} snapshot={snapshot} panelGradientId={`${definitionId}-panel`} />

        {/* The grass extends outside the white touchlines to resemble a real playing surface. */}
        <rect x={PITCH.x - 24} y={PITCH.y - 22} width={PITCH.width + 48} height={PITCH.height + 44} rx="4" fill={`url(#${definitionId}-pitch)`} filter={`url(#${definitionId}-shadow)`} />
        <rect x={PITCH.x - 24} y={PITCH.y - 22} width={PITCH.width + 48} height={PITCH.height + 44} fill={`url(#${definitionId}-grass)`} />
        <g fill="none" stroke="#d9fff0" strokeOpacity="0.72" strokeWidth="2">
          <rect x={PITCH.x} y={PITCH.y} width={PITCH.width} height={PITCH.height} />
          <line x1={PITCH.x} y1={PITCH.y + PITCH.height / 2} x2={PITCH.x + PITCH.width} y2={PITCH.y + PITCH.height / 2} />
          <circle cx={PITCH.x + PITCH.width / 2} cy={PITCH.y + PITCH.height / 2} r="65" />
          <circle cx={PITCH.x + PITCH.width / 2} cy={PITCH.y + PITCH.height / 2} r="3" fill="#d9fff0" />
          <rect x={PITCH.x + 102} y={PITCH.y} width={PITCH.width - 204} height="116" />
          <rect x={PITCH.x + 190} y={PITCH.y} width={PITCH.width - 380} height="48" />
          <circle cx={PITCH.x + PITCH.width / 2} cy={PITCH.y + 78} r="3" fill="#d9fff0" />
          <path d={`M ${PITCH.x + 205} ${PITCH.y + 116} A 70 70 0 0 0 ${PITCH.x + PITCH.width - 205} ${PITCH.y + 116}`} />
          <rect x={PITCH.x + 102} y={PITCH.y + PITCH.height - 116} width={PITCH.width - 204} height="116" />
          <rect x={PITCH.x + 190} y={PITCH.y + PITCH.height - 48} width={PITCH.width - 380} height="48" />
          <circle cx={PITCH.x + PITCH.width / 2} cy={PITCH.y + PITCH.height - 78} r="3" fill="#d9fff0" />
          <path d={`M ${PITCH.x + 205} ${PITCH.y + PITCH.height - 116} A 70 70 0 0 1 ${PITCH.x + PITCH.width - 205} ${PITCH.y + PITCH.height - 116}`} />
          <rect x={PITCH.x + PITCH.width / 2 - 56} y={PITCH.y - 12} width="112" height="12" />
          <rect x={PITCH.x + PITCH.width / 2 - 56} y={PITCH.y + PITCH.height} width="112" height="12" />
        </g>

        {animatedScene && latestCue?.sourceEventType === MatchEventType.OFFSIDE && cueEnd && (
          <g data-offside-line="true" pointerEvents="none">
            <line
              x1={PITCH.x}
              y1={cueEnd.y}
              x2={PITCH.x + PITCH.width}
              y2={cueEnd.y}
              stroke="#fb7185"
              strokeWidth="3"
              strokeDasharray="10 7"
              filter={`url(#${definitionId}-glow)`}
            />
          </g>
        )}

        {animatedScene && latestCue?.kind === 'DRIBBLE' && cueStart && (
          <circle
            data-dribble-pulse="true"
            cx={ball.x}
            cy={ball.y}
            r={16 + Math.sin(frame.visualClockMs / 90) * 3}
            fill="none"
            stroke={latestCue.side === 'AWAY' ? awayColor : homeColor}
            strokeWidth="2.5"
            strokeOpacity="0.82"
            filter={`url(#${definitionId}-glow)`}
          />
        )}

        {animatedScene && sceneLabel && (
          <g data-match-scene={sceneLabel} pointerEvents="none" filter={`url(#${definitionId}-shadow)`}>
            <path
              d={`M ${PITCH.x + 166} ${PITCH.y + 18} H ${PITCH.x + 374} L ${PITCH.x + 390} ${PITCH.y + 37} L ${PITCH.x + 374} ${PITCH.y + 56} H ${PITCH.x + 166} L ${PITCH.x + 150} ${PITCH.y + 37} Z`}
              fill="#040b16"
              fillOpacity="0.94"
              stroke={latestCue?.side === 'AWAY' ? awayColor : homeColor}
              strokeWidth="1.5"
            />
            <text
              x={PITCH.x + PITCH.width / 2}
              y={PITCH.y + 42}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="14"
              className="font-black italic uppercase tracking-tighter"
            >
              {sceneLabel}
            </text>
          </g>
        )}

        {animatedScene && actionParticipantsLabel && (
          <g data-action-participants="true" pointerEvents="none" filter={`url(#${definitionId}-shadow)`}>
            <rect
              x={PITCH.x + 154}
              y={PITCH.y + 64}
              width={PITCH.width - 308}
              height="27"
              rx="7"
              fill="#020712"
              fillOpacity="0.88"
              stroke={latestCue?.side === 'AWAY' ? awayColor : homeColor}
              strokeOpacity="0.72"
            />
            <text
              x={PITCH.x + PITCH.width / 2}
              y={PITCH.y + 82}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="10.5"
              className="font-black italic uppercase tracking-tighter"
              {...fitTextLength(actionParticipantsLabel, PITCH.width - 330)}
            >
              {actionParticipantsLabel}
            </text>
          </g>
        )}

        {interactivePitch && Object.values(snapshot.spatial.players).filter(player => player.isOnPitch).map(spatialPlayer => {
          const team = spatialPlayer.side === 'HOME' ? home : away;
          const player = team.players.find(item => item.id === spatialPlayer.playerId);
          const renderedPlayer = frame.players[spatialPlayer.playerId];
          const position = mapPoint(
            useLivePlayerPositions
              ? renderedPlayer?.position ?? spatialPlayer.position
              : spatialPlayer.anchor
          );
          const color = spatialPlayer.side === 'HOME' ? homeColor : awayColor;
          const label = player?.lastName ?? spatialPlayer.role;
          const isActor = animatedScene && latestCue?.actorId === spatialPlayer.playerId;
          const isReceiver = animatedScene && latestCue?.secondaryPlayerId === spatialPlayer.playerId;
          return (
            <g key={spatialPlayer.playerId} data-player-token={spatialPlayer.playerId}>
              {isActor && <circle cx={position.x} cy={position.y} r="25" fill="none" stroke={color} strokeWidth="2" className="v2-player-action" />}
              {isReceiver && <circle cx={position.x} cy={position.y} r="23" fill="none" stroke="#ffffff" strokeOpacity="0.72" strokeWidth="1.5" className="v2-receiver-action" />}
              <circle cx={position.x} cy={position.y} r="18" fill="#05101b" stroke={color} strokeWidth="3" filter={`url(#${definitionId}-shadow)`} />
              <circle cx={position.x} cy={position.y} r="12" fill={color} fillOpacity="0.28" />
              <text x={position.x} y={position.y + 3.5} textAnchor="middle" fill="#ffffff" fontSize="8" className="font-black italic uppercase tracking-tighter">
                {spatialPlayer.role}
              </text>
              <rect x={position.x - 31} y={position.y + 22} width="62" height="13" rx="5" fill="#020712" fillOpacity="0.92" />
              <text x={position.x} y={position.y + 31.5} textAnchor="middle" fill="#ffffff" fontSize={textSizeForLength(label, 7.5, 6.5, 5.8)} className="font-black italic uppercase tracking-tighter" {...fitTextLength(label, 56)}>
                {label}
                <title>{fullName(player)}</title>
              </text>
            </g>
          );
        })}

        {/* In highlight modes the ball exists on screen only while the
            broadcast is showing an important scene. The quiet interval is a
            clean tactical formation, exactly like a waiting studio board. */}
        {showBall && (
          <g className="v2-ball" data-football="true" filter={`url(#${definitionId}-glow)`}>
            <ellipse cx={ball.x} cy={ball.y + 7} rx={8.5 + frame.ball.z * 1.6} ry="3.2" fill="#000000" fillOpacity={0.3 + frame.ball.z * 0.06} />
            <g transform={`translate(${ball.x} ${ballY}) scale(${ballScale}) rotate(${ballRotation})`}>
              <circle cx="0" cy="0" r="8.6" fill={`url(#${definitionId}-ball)`} stroke="#07111f" strokeWidth="0.9" />
              <polygon points="0,-3.4 3.2,-1.1 2,2.8 -2,2.8 -3.2,-1.1" fill="#0b1220" />
              <path d="M 0 -3.4 L 0 -8.2 M 3.2 -1.1 L 7.8 -2.6 M 2 2.8 L 4.7 7 M -2 2.8 L -4.7 7 M -3.2 -1.1 L -7.8 -2.6" fill="none" stroke="#1e293b" strokeWidth="0.85" />
              <path d="M -2.5 -7.7 L 0 -8.2 L 2.5 -7.4 L 3.2 -5.1 L 0 -3.4 L -3.2 -5.1 Z" fill="#111827" />
              <path d="M 7.8 -2.6 L 8.4 .2 L 6.7 2.8 L 4.2 2 L 3.2 -1.1 Z" fill="#111827" />
              <path d="M 4.7 7 L 2.1 8.2 L -.5 7.9 L -1.2 5.5 L 2 2.8 Z" fill="#111827" />
              <path d="M -4.7 7 L -7 5.1 L -7.8 2.5 L -5.3 1.5 L -2 2.8 Z" fill="#111827" />
              <path d="M -7.8 -2.6 L -6.7 -5.2 L -4.4 -7 L -2.8 -5 L -3.2 -1.1 Z" fill="#111827" />
              <circle cx="-2.4" cy="-3.8" r="1.2" fill="#ffffff" fillOpacity="0.48" />
            </g>
          </g>
        )}

        {frame.goalCelebration.active && (
          <g data-goal-celebration="active" pointerEvents="none">
            <rect x={PITCH.x + 42} y={PITCH.y + 286} width={PITCH.width - 84} height="150" rx="22" fill={`url(#${definitionId}-goal-celebration)`} stroke={celebratingColor} strokeWidth="3" filter={`url(#${definitionId}-shadow)`} />
            <text x={PITCH.x + PITCH.width / 2} y={PITCH.y + 366} textAnchor="middle" fill="#ffffff" fontSize="74" className="v2-goal-flash font-black italic uppercase tracking-tighter">GOL!</text>
            <text x={PITCH.x + PITCH.width / 2} y={PITCH.y + 405} textAnchor="middle" fill="#ffffff" fontSize="17" className="font-black italic uppercase tracking-tighter">{celebratingTeam}</text>
            <rect x={PITCH.x + 112} y={PITCH.y + 420} width={PITCH.width - 224} height="4" rx="2" fill="#ffffff" fillOpacity="0.18" />
            <rect x={PITCH.x + 112} y={PITCH.y + 420} width={(PITCH.width - 224) * frame.goalCelebration.progress} height="4" rx="2" fill={celebratingColor} />
          </g>
        )}

        {isHalfTime && (
          <g data-half-time="active" pointerEvents="none">
            <rect x={PITCH.x - 10} y={PITCH.y + 160} width={PITCH.width + 20} height="400" rx="24" fill="#020712" fillOpacity="0.95" stroke="#7dd3fc" strokeWidth="2" filter={`url(#${definitionId}-shadow)`} />
            <text x={PITCH.x + PITCH.width / 2} y={PITCH.y + 300} textAnchor="middle" fill="#7dd3fc" fontSize="18" className="font-black italic uppercase tracking-tighter">PRZERWA</text>
            <text x={PITCH.x + PITCH.width / 2} y={PITCH.y + 370} textAnchor="middle" fill="#ffffff" fontSize="64" className="font-black italic uppercase tracking-tighter">{snapshot.result.homeScore} : {snapshot.result.awayScore}</text>
            <text x={PITCH.x + PITCH.width / 2} y={PITCH.y + 414} textAnchor="middle" fill="#dbe7f6" fontSize="13" className="font-black italic uppercase tracking-tighter">WYNIK DO PRZERWY</text>
            <text x={PITCH.x + PITCH.width / 2} y={PITCH.y + 474} textAnchor="middle" fill="#35e6b2" fontSize="15" className="font-black italic uppercase tracking-tighter">KLIKNIJ „II POŁOWA”, ABY WZNOWIĆ MECZ</text>
          </g>
        )}

        {frame.replay.active && (
          <g data-goal-replay="active" pointerEvents="none">
            <rect x={PITCH.x + 82} y={PITCH.y + 18} width={PITCH.width - 164} height="66" rx="12" fill="#020712" fillOpacity="0.9" stroke="#fbbf24" strokeWidth="1.5" filter={`url(#${definitionId}-shadow)`} />
            <text x={PITCH.x + PITCH.width / 2} y={PITCH.y + 47} textAnchor="middle" fill="#fbbf24" fontSize="17" className="font-black italic uppercase tracking-tighter">
              POWTÓRKA GOLA
            </text>
            <text x={PITCH.x + PITCH.width / 2} y={PITCH.y + 68} textAnchor="middle" fill="#ffffff" fontSize="9" className="font-black italic uppercase tracking-tighter">
              AKCJA {Math.max(1, frame.replay.cueIndex)} / {Math.max(1, frame.replay.cueCount)}
            </text>
            <rect x={PITCH.x + 112} y={PITCH.y + 75} width={PITCH.width - 224} height="3" rx="1.5" fill="#334155" />
            <rect x={PITCH.x + 112} y={PITCH.y + 75} width={(PITCH.width - 224) * frame.replay.progress} height="3" rx="1.5" fill="#fbbf24" />
          </g>
        )}

        {showCommentaryPanel && (
          <g>
            <rect x={PITCH.x + 38} y={PITCH.y + 205} width={PITCH.width - 76} height="310" rx="18" fill="#030914" fillOpacity="0.92" stroke="#35e6b2" strokeOpacity="0.45" />
            <text x={PITCH.x + PITCH.width / 2} y={PITCH.y + 242} textAnchor="middle" fill="#35e6b2" fontSize="14" className="font-black italic uppercase tracking-tighter">KOMENTARZ MECZOWY</text>
            {latestEvents.map((event, index) => (
              <g key={event.id}>
                <text x={PITCH.x + 58} y={PITCH.y + 280 + index * 38} fill={event.side === 'AWAY' ? awayColor : homeColor} fontSize="10" className="font-black italic uppercase tracking-tighter">{event.minute}'</text>
                <text x={PITCH.x + 94} y={PITCH.y + 280 + index * 38} fill="#e8eef8" fontSize="10.5" className="font-black italic uppercase tracking-tighter" {...fitTextLength(event.text, PITCH.width - 155)}>
                  {event.text}
                  <title>{event.text}</title>
                </text>
              </g>
            ))}
          </g>
        )}

        <g>
          <rect x={PITCH.x - 24} y="890" width={PITCH.width + 48} height="32" rx="8" fill="#071221" stroke="#31415c" />
          <circle cx={PITCH.x - 4} cy="906" r="4" fill="#35e6b2" />
          <text x={PITCH.x + 10} y="910" fill="#dbe7f6" fontSize="9.5" className="font-black italic uppercase tracking-tighter" {...fitTextLength(coachSummary, PITCH.width - 18)}>
            {coachSummary}
            <title>{coachSummary}</title>
          </text>
        </g>

        <rect x="28" y="942" width="1864" height="108" rx="22" fill="#07111f" stroke="#31415c" />
        <SvgControl x={60} y={972} width={155} label={primaryControlLabel ?? (playback.paused ? 'WZNÓW' : 'PAUZA')} active={!playback.paused || isHalfTime} accent="#35e6b2" onActivate={onTogglePause} />
        <SvgControl x={228} y={972} width={116} label={`TEMPO ${speedLabel[playback.speed]}`} active accent="#60a5fa" onActivate={() => onSetSpeed?.(nextSpeed[playback.speed])} />
        <SvgControl x={357} y={972} width={238} label={playback.renderMode === 'INTERACTIVE' ? 'WIDOK INTERAKTYWNY' : 'WIDOK KLASYCZNY'} active={playback.renderMode === 'INTERACTIVE'} accent="#22d3ee" onActivate={onToggleRenderMode} />
        <SvgControl
          x={608}
          y={972}
          width={224}
          label={transmissionLabel[playback.transmissionMode]}
          active={playback.transmissionMode !== 'COMMENTARY_ONLY'}
          accent="#a78bfa"
          onActivate={() => setTransmissionMenuOpen(open => !open)}
        />
        {transmissionMenuOpen && (
          <g data-transmission-menu="open" filter={`url(#${definitionId}-shadow)`}>
            <rect x="598" y="732" width="244" height="228" rx="12" fill="#050b16" fillOpacity="0.98" stroke="#a78bfa" strokeOpacity="0.7" />
            {(['COMMENTARY_ONLY', 'KEY_MOMENTS', 'ALL_ACTIONS', 'FULL_MATCH'] as MatchEngineV2TransmissionMode[]).map((mode, index) => (
              <SvgControl
                key={mode}
                x={608}
                y={740 + index * 54}
                width={224}
                label={transmissionLabel[mode]}
                active={playback.transmissionMode === mode}
                accent="#a78bfa"
                onActivate={() => {
                  onSetTransmissionMode?.(mode);
                  setTransmissionMenuOpen(false);
                }}
              />
            ))}
          </g>
        )}
        <SvgControl x={845} y={972} width={185} label={playback.goalReplays ? 'POWTÓRKI WŁ.' : 'POWTÓRKI WYŁ.'} active={playback.goalReplays} accent="#fbbf24" onActivate={onToggleGoalReplays} />
        <SvgControl x={1043} y={972} width={204} label="TAKTYKA I POLECENIA" accent={homeColor} onActivate={onOpenTactics} />
        <SvgControl x={1260} y={972} width={150} label="ZMIANY" accent="#fb7185" onActivate={onOpenSubstitutions} />
        <SvgControl x={1423} y={972} width={140} label={`SCENA ${sceneSpeedLabel[playback.sceneSpeed]}`} active accent="#f472b6" onActivate={() => onSetSceneSpeed?.(nextSceneSpeed[playback.sceneSpeed])} />
        <SvgControl
          x={1576}
          y={972}
          width={284}
          label={frame.replay.active
            ? `POWTÓRKA GOLA • AKCJA ${Math.max(1, frame.replay.cueIndex)} Z ${Math.max(1, frame.replay.cueCount)}`
            : activeCommentary
              ? activeCommentary
              : latestCue
                ? `${actionParticipantsLabel ?? latestCue.kind} • ${snapshot.result.finalState.possession === 'HOME' ? home.name : away.name}`
                : quietPlayLabel}
          active={Boolean(latestCue) || frame.replay.active}
          accent={frame.replay.active ? '#fbbf24' : latestCue?.side === 'AWAY' ? awayColor : homeColor}
        />
      </svg>
    </div>
  );
};
