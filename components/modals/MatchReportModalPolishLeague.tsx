
import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { MatchHistoryService } from '../../services/MatchHistoryService';
import { PlayerPosition, Player, ClubKitPattern, NationalTeam } from '../../types';
import { TacticRepository } from '../../resources/tactics_db';
import { KitSelection, KitSelectionService } from '../../services/KitSelectionService';
import { KitPreview } from '../common/KitPreview';
import bojo2Pitch from '../../Graphic/themes/bojo2.png';

interface MatchReportModalProps {
  matchId: string | null;
  onClose: () => void;
  teamType?: 'club' | 'national';
}

const GLASS_PANEL = "bg-slate-900/40 backdrop-blur-[80px] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]";

const GOALKEEPER_KIT_POOL = [
  '#facc15', // żółty
  '#16a34a', // zielony
  '#f97316', // pomarańczowy
  '#881337', // bordowy
  '#0891b2', // turkusowy
  '#1d4ed8', // niebieski
  '#111111', // czarny
  '#f5f0dc', // kremowy
];

const pickGoalkeeperColor = (blocked: string[]): string => {
  const scored = GOALKEEPER_KIT_POOL.map(c => ({
    color: c,
    minDist: Math.min(...blocked.map(b => KitSelectionService.getColorDistance(c, b)))
  }));
  scored.sort((a, b) => b.minDist - a.minDist);
  return scored[0].color;
};

const MIN_REPORT_KIT_DISTANCE = 120;

const resolveReportKits = (
  savedKits: KitSelection | undefined,
  homeClub: Parameters<typeof KitSelectionService.selectOptimalKits>[0],
  awayClub: Parameters<typeof KitSelectionService.selectOptimalKits>[1]
): KitSelection => {
  const recalculated = KitSelectionService.selectOptimalKits(homeClub, awayClub);
  if (!savedKits) return recalculated;
  return KitSelectionService.getKitClashScore(savedKits.home, savedKits.away) < MIN_REPORT_KIT_DISTANCE
    ? recalculated
    : savedKits;
};

const resolveNationalReportKits = (
  savedKits: KitSelection | undefined,
  homeTeam: NationalTeam,
  awayTeam: NationalTeam
): KitSelection => {
  if (savedKits) return savedKits;
  const homePrimary = homeTeam.colorsHex?.[0] ?? '#dc2626';
  const homeSecondary = homeTeam.colorsHex?.[1] ?? '#ffffff';
  const awayPrimary = awayTeam.colorsHex?.[0] ?? '#2563eb';
  const awaySecondary = awayTeam.colorsHex?.[1] ?? '#ffffff';
  const clash = KitSelectionService.getKitClashScore(
    { primary: homePrimary, secondary: homeSecondary },
    { primary: awayPrimary, secondary: awaySecondary }
  );
  const awayShirt = clash < MIN_REPORT_KIT_DISTANCE ? awaySecondary : awayPrimary;
  const awayShorts = clash < MIN_REPORT_KIT_DISTANCE ? awayPrimary : awaySecondary;

  return {
    home: {
      primary: homePrimary,
      shirtSecondary: homeSecondary,
      secondary: homeSecondary,
      pattern: 'solid',
      text: KitSelectionService.isColorLight(homePrimary) ? '#000000' : '#ffffff',
    },
    away: {
      primary: awayShirt,
      shirtSecondary: awayShorts,
      secondary: awayShorts,
      pattern: 'solid',
      text: KitSelectionService.isColorLight(awayShirt) ? '#000000' : '#ffffff',
    },
  };
};

const isColorDark = (hex: string): boolean => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) < 80;
};

const getPitchSlotTop = (isHome: boolean, slotY: number): string =>
  `${isHome ? 55 + slotY * 32 : 45 - slotY * 32}%`;

type ReportSubstitution = {
  playerOutId?: string;
  playerOutName: string;
  playerInId?: string;
  playerInName: string;
  minute: number;
  teamId: string;
};

type ReportCard = {
  playerId?: string;
  playerName: string;
  minute: number;
  teamId: string;
  type: string;
};

const getChronologicalTeamEvents = (
  lineupIds: string[],
  rawSubs: ReportSubstitution[],
  cards: ReportCard[],
  teamId: string
): ReportSubstitution[] => {
  const current: (string | null)[] = [...lineupIds];
  const result: ReportSubstitution[] = [];
  const redExits = cards
    .filter(card => !!card.playerId && card.teamId === teamId && (card.type === 'RED' || card.type === 'SECOND_YELLOW'))
    .map(card => ({
      kind: 'red' as const,
      minute: card.minute,
      playerOutId: card.playerId as string,
      playerOutName: card.playerName,
    }));
  const timeline = [
    ...rawSubs.map(sub => ({ kind: 'sub' as const, minute: sub.minute, sub })),
    ...redExits,
  ].sort((a, b) => a.minute - b.minute || (a.kind === 'red' ? -1 : 1));

  timeline.forEach(event => {
    if (event.kind === 'sub') {
      if (!event.sub.playerOutId) return;
      const idx = current.indexOf(event.sub.playerOutId);
      if (idx === -1) return;
      current[idx] = event.sub.playerInId ?? null;
      result.push(event.sub);
      return;
    }

    const idx = current.indexOf(event.playerOutId);
    if (idx === -1) return;
    current[idx] = null;
    result.push({
      playerOutId: event.playerOutId,
      playerOutName: event.playerOutName,
      playerInName: '',
      minute: event.minute,
      teamId,
    });
  });

  return result;
};

const PitchKit: React.FC<{
  player?: Player | null;
  left: string;
  top: string;
  primary: string;
  shirtSecondary?: string;
  secondary: string;
  pattern?: ClubKitPattern;
  isMom?: boolean;
  isRedCarded?: boolean;
}> = ({ player, left, top, primary, shirtSecondary, secondary, pattern, isMom, isRedCarded }) => {
  if (!player) return null;
  const label = `${player.firstName.charAt(0)}. ${player.lastName}`;
  return (
    <div
      className="absolute z-20 flex flex-col items-center gap-0"
      style={{ left, top, transform: 'translate(-50%, -50%)', filter: isRedCarded ? 'grayscale(1)' : undefined, opacity: isRedCarded ? 0.35 : undefined }}
    >
      <div className="relative flex flex-col items-center">
        <KitPreview
          shirt={primary}
          shirtSecondary={shirtSecondary}
          shorts={secondary}
          socks={secondary}
          pattern={pattern}
          className={`h-[36px] w-[32px] ${isMom ? 'filter drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]' : ''}`}
        />
        {isMom && <span className="absolute -top-1 right-1 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.95)]" />}
      </div>
      <div className={`mt-[2px] max-w-[64px] rounded border px-[3px] py-[1px] text-center shadow-[0_4px_10px_rgba(0,0,0,0.5)] ${isMom ? 'bg-amber-500/90 border-amber-300' : 'bg-black/85 border-white/10'}`}>
        <span className={`block truncate text-[6.5px] font-black uppercase tracking-[0.1em] ${isMom ? 'text-black' : 'text-white'}`}>
          {label}
        </span>
      </div>
    </div>
  );
};

const getCompetitionName = (comp: string) => {
  if (comp.includes('L_PL_1')) return 'Ekstraklasa';
  if (comp.includes('L_PL_2')) return '1. Liga';
  if (comp.includes('L_PL_3')) return '2. Liga';
  if (comp === 'UEFA_SUPER_CUP') return 'Superpuchar Europy';
  if (comp.includes('CUP')) return 'Puchar Polski';
  if (comp.includes('SUPER')) return 'Superpuchar';
  return comp;
};

export const MatchReportModalPolishLeague: React.FC<MatchReportModalProps> = ({ matchId, onClose, teamType = 'club' }) => {
  const { clubs, players, nationalTeams } = useGame();

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const origX = pos ? pos.x : window.innerWidth / 2;
    const origY = pos ? pos.y : window.innerHeight / 2;
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX, origY };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
    };
    const onUp = () => { dragRef.current = null; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  const match = useMemo(
    () => (matchId ? MatchHistoryService.getAll().find(m => m.matchId === matchId) ?? null : null),
    [matchId]
  );

  const homeClub = useMemo(
    () => match
      ? teamType === 'national'
        ? nationalTeams.find(t => t.id === match.homeTeamId) ?? null
        : clubs.find(c => c.id === match.homeTeamId) ?? null
      : null,
    [match, clubs, nationalTeams, teamType]
  );

  const awayClub = useMemo(
    () => match
      ? teamType === 'national'
        ? nationalTeams.find(t => t.id === match.awayTeamId) ?? null
        : clubs.find(c => c.id === match.awayTeamId) ?? null
      : null,
    [match, clubs, nationalTeams, teamType]
  );

  const allPlayersFlat = useMemo(() => Object.values(players).flat(), [players]);

  const homePlayers = useMemo(
    () => {
      if (!homeClub) return [];
      if (teamType === 'national') {
        const team = homeClub as NationalTeam;
        return team.squadPlayerIds.map(id => allPlayersFlat.find(p => p.id === id) ?? null).filter(Boolean) as Player[];
      }
      return players[homeClub.id] ?? [];
    },
    [homeClub, players, allPlayersFlat, teamType]
  );

  const awayPlayers = useMemo(
    () => {
      if (!awayClub) return [];
      if (teamType === 'national') {
        const team = awayClub as NationalTeam;
        return team.squadPlayerIds.map(id => allPlayersFlat.find(p => p.id === id) ?? null).filter(Boolean) as Player[];
      }
      return players[awayClub.id] ?? [];
    },
    [awayClub, players, allPlayersFlat, teamType]
  );

  const motmId = useMemo(() => {
    if (!match?.ratings) return null;
    let bestId: string | null = null;
    let bestRating = 0;
    Object.entries(match.ratings).forEach(([id, r]) => {
      if (r > bestRating) { bestRating = r; bestId = id; }
    });
    return bestId;
  }, [match]);

  if (!matchId || !match || !homeClub || !awayClub) return null;

  const kits = teamType === 'national'
    ? resolveNationalReportKits(match.kits, homeClub as NationalTeam, awayClub as NationalTeam)
    : resolveReportKits(match.kits, homeClub as Parameters<typeof KitSelectionService.selectOptimalKits>[0], awayClub as Parameters<typeof KitSelectionService.selectOptimalKits>[1]);
  const homeShortName = 'shortName' in homeClub ? homeClub.shortName : homeClub.name;
  const awayShortName = 'shortName' in awayClub ? awayClub.shortName : awayClub.name;

  // Buduje chronologiczną listę zdarzeń dla drużyny (gole + czerwone kartki + niestrzelone karne)
  const buildEvents = (teamId: string) => {
    const events: { minute: number; icon: string; name: string; extra?: string; varDisallowed?: boolean; isMiss?: boolean; isInjury?: boolean; injurySeverity?: string }[] = [];

    match.goals
      .filter(g => g.teamId === teamId && !g.isMiss)
      .forEach(g => events.push({
        minute: g.minute,
        icon: '⚽',
        name: g.playerName,
        extra: g.isPenalty ? '(k)' : undefined,
        varDisallowed: g.varDisallowed
      }));

    match.goals
      .filter(g => g.teamId === teamId && g.isMiss && g.isPenalty)
      .forEach(g => events.push({
        minute: g.minute,
        icon: '⚽',
        name: g.playerName,
        extra: '(k)',
        isMiss: true
      }));

    (match.missedPenalties ?? [])
      .filter(g => g.teamId === teamId)
      .forEach(g => events.push({
        minute: g.minute,
        icon: '⚽',
        name: g.playerName,
        extra: '(k)',
        isMiss: true
      }));

    match.cards
      .filter(c => c.teamId === teamId && (c.type === 'RED' || c.type === 'SECOND_YELLOW'))
      .forEach(c => events.push({
        minute: c.minute,
        icon: '🟥',
        name: c.playerName
      }));

    (match.injuries ?? [])
      .filter(i => i.teamId === teamId)
      .forEach(i => events.push({
        minute: i.minute,
        icon: '✚',
        name: i.playerName,
        isInjury: true,
        injurySeverity: i.severity
      }));

    return events.sort((a, b) => a.minute - b.minute);
  };

  const homeEvents = buildEvents(match.homeTeamId);
  const awayEvents = buildEvents(match.awayTeamId);

  const fmtName = (name: string) => name.includes(' ') ? name.charAt(0) + '. ' + name.split(' ').slice(1).join(' ') : name;

  const renderTeamEvents = (events: ReturnType<typeof buildEvents>, align: 'left' | 'right') => (
    <div className={`flex flex-wrap gap-x-4 gap-y-0.5 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      {events.map((e, i) => e.varDisallowed ? (
        <span key={i} className="text-[10px] font-black text-slate-500 uppercase italic whitespace-nowrap flex items-center gap-1">
          {align === 'right'
            ? <><s>{fmtName(e.name)}{e.extra ? ` ${e.extra}` : ''} {e.minute}'</s>&nbsp;⚽(VAR)</>
            : <>⚽(VAR)&nbsp;<s>{e.minute}' {fmtName(e.name)}{e.extra ? ` ${e.extra}` : ''}</s></>
          }
        </span>
      ) : e.isMiss ? (
        <span key={i} className="text-[10px] font-black text-slate-500 uppercase italic whitespace-nowrap flex items-center gap-1">
          {align === 'right'
            ? <><s>{fmtName(e.name)} {e.extra} {e.minute}'</s>&nbsp;⚽</>
            : <>⚽&nbsp;<s>{e.minute}' {fmtName(e.name)} {e.extra}</s></>
          }
        </span>
      ) : e.isInjury ? (
        <span key={i} className={`text-[10px] font-black ${e.injurySeverity === 'SEVERE' ? 'text-red-500' : 'text-white'} uppercase italic whitespace-nowrap`}>
          {align === 'right'
            ? <>{fmtName(e.name)} {e.minute}' {e.icon}</>
            : <>{e.icon} {e.minute}' {fmtName(e.name)}</>
          }
        </span>
      ) : (
        <span key={i} className="text-[10px] font-black text-white uppercase italic whitespace-nowrap">
          {align === 'right'
            ? <>{fmtName(e.name)}{e.extra ? ` ${e.extra}` : ''} {e.minute}' {e.icon}</>
            : <>{e.icon} {e.minute}' {fmtName(e.name)}{e.extra ? ` ${e.extra}` : ''}</>
          }
        </span>
      ))}
    </div>
  );

  const renderLineup = (side: 'home' | 'away') => {
    const lineupIds = side === 'home' ? (match.homeLineup ?? []) : (match.awayLineup ?? []);
    const teamPlayers = side === 'home' ? homePlayers : awayPlayers;
    const clubId = side === 'home' ? homeClub.id : awayClub.id;
    const rawSubs = (match.substitutions?.filter(s => s.teamId === clubId) ?? []) as ReportSubstitution[];
    const subs = getChronologicalTeamEvents(lineupIds, rawSubs, match.cards as ReportCard[], clubId);
    const injuries = match.injuries?.filter(i => i.teamId === clubId) ?? [];

    if (lineupIds.length === 0) {
      return (
        <div className="flex items-center justify-center opacity-30 py-8">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Brak danych składu</span>
        </div>
      );
    }

    const findPlayer = (id: string) => teamPlayers.find(p => p.id === id) ?? allPlayersFlat.find(p => p.id === id) ?? null;
    const sortedSubs = [...subs].sort((a, b) => a.minute - b.minute);
    const subbedOutIds = new Set(rawSubs.map(s => s.playerOutId).filter(Boolean) as string[]);
    const injuryExits = injuries.filter(inj =>
      inj.severity === 'SEVERE' &&
      lineupIds.includes(inj.playerId) &&
      !subbedOutIds.has(inj.playerId)
    );
    const finalLineupIds: (string | null)[] = [...lineupIds];
    sortedSubs.forEach(sub => {
      if (!sub.playerOutId) return;
      const idx = finalLineupIds.indexOf(sub.playerOutId);
      if (idx !== -1) finalLineupIds[idx] = sub.playerInId ?? null;
    });
    injuryExits.forEach(inj => {
      const idx = finalLineupIds.indexOf(inj.playerId);
      if (idx !== -1) finalLineupIds[idx] = null;
    });

    const finalPlayers = finalLineupIds
      .map(id => id ? findPlayer(id) : null)
      .filter((player): player is Player => !!player);

    const offSubs = [
      ...sortedSubs.filter(sub => !!sub.playerOutId),
      ...injuryExits.map(inj => ({
        playerOutId: inj.playerId,
        playerOutName: inj.playerName,
        playerInId: undefined as string | undefined,
        playerInName: '',
        minute: inj.minute,
        teamId: clubId,
      }))
    ].sort((a, b) => a.minute - b.minute);

    const renderPlayerRow = (
      player: Player | null,
      key: string,
      displayNameFallback: string,
      status: 'active' | 'off',
      minute?: number
    ) => {
      const playerId = player?.id;
      const rating = playerId ? match.ratings?.[playerId] : undefined;
      const isMOTM = motmId === playerId;
      const playerGoals = playerId ? match.goals.filter(g => g.playerId === playerId && !g.isMiss) : [];
      const playerVarGoals = playerGoals.filter(g => g.varDisallowed);
      const playerValidGoals = playerGoals.filter(g => !g.varDisallowed);
      const yellowCards = playerId ? match.cards.filter(c => c.playerId === playerId && c.type === 'YELLOW') : [];
      const redCard = playerId ? match.cards.find(c => c.playerId === playerId && (c.type === 'RED' || c.type === 'SECOND_YELLOW')) : undefined;
      const injury = playerId ? injuries.find(i => i.playerId === playerId) : undefined;
      const subIn = playerId ? sortedSubs.find(s => s.playerInId === playerId) : undefined;
      const displayName = player
        ? `${player.firstName.charAt(0)}. ${player.lastName}`
        : displayNameFallback;
      const isRedCarded = !!redCard;

      return (
        <div
          key={key}
          className={`flex items-center gap-1.5 px-1.5 py-[4px] rounded-md transition-all ${
            isMOTM
              ? 'bg-amber-500/15 border border-amber-500/30'
              : isRedCarded
                ? 'bg-red-900/10 border border-red-900/20 opacity-50'
                : status === 'off'
                  ? 'border border-transparent bg-black/10 opacity-75'
                  : 'border border-transparent hover:bg-white/5'
          }`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-black shrink-0 border ${
            player?.position === PlayerPosition.GK ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            : player?.position === PlayerPosition.DEF ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
            : player?.position === PlayerPosition.MID ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            : player?.position === PlayerPosition.FWD ? 'bg-red-500/20 border-red-500/40 text-red-300'
            : 'bg-slate-500/20 border-slate-500/40 text-slate-300'
          }`}>
            {player?.position ?? '?'}
          </div>

          <span className={`flex-1 text-[9px] font-bold uppercase truncate ${
            isMOTM ? 'text-amber-300' : isRedCarded ? 'text-slate-500 line-through' : status === 'off' ? 'text-slate-500' : 'text-slate-200'
          }`}>
            {displayName}
          </span>

          <div className="flex items-center gap-0.5 shrink-0">
            {isMOTM && <span className="text-amber-400 text-[9px]">⭐</span>}
            {playerValidGoals.length === 1 && (
              <span title={`Gol ${playerValidGoals[0].minute}'`} className="text-[9px]">⚽</span>
            )}
            {playerValidGoals.length > 1 && (
              <span title={playerValidGoals.map(g => `Gol ${g.minute}'`).join(', ')} className="text-[9px]">⚽({playerValidGoals.length})</span>
            )}
            {playerVarGoals.length > 0 && (
              <span title={playerVarGoals.map(g => `Gol nieuznany VAR ${g.minute}'`).join(', ')} className="text-[9px] opacity-40 line-through">⚽</span>
            )}
            {yellowCards.map((c, i) => (
              <span key={i} title={`Żółta ${c.minute}'`} className="text-[9px]">🟨</span>
            ))}
            {redCard && <span title={`Czerwona ${redCard.minute}'`} className="text-[9px]">🟥</span>}
            {injury && <span title={`Kontuzja ${injury.severity === 'SEVERE' ? 'ciężka' : 'lekka'} ${injury.minute}'`} className={`text-[11px] font-black ${injury.severity === 'SEVERE' ? 'text-red-600' : 'text-white'}`}>✚</span>}
            {status === 'active' && subIn && <span title={`Wejście ${subIn.minute}'`} className="text-[7px] text-emerald-400">↑{subIn.minute}'</span>}
            {status === 'off' && minute !== undefined && <span title={`Zejście ${minute}'`} className="text-[7px] text-red-400">↓{minute}'</span>}
          </div>

          {rating !== undefined ? (
            <div className={`w-7 h-6 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${isMOTM ? 'bg-amber-500 text-black' : 'bg-black/40 text-white border border-white/10'}`}>
              {rating.toFixed(1)}
            </div>
          ) : (
            <div className="w-7 h-6 rounded flex items-center justify-center text-[9px] font-black shrink-0 bg-black/20 text-slate-600 border border-white/5">
              –
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-[2px]">
        {finalPlayers.map(player => renderPlayerRow(player, player.id, '?', 'active'))}

        {offSubs.length > 0 && (() => {
          return (
            <>
              <div className="border-t border-white/5 my-1" />
              {offSubs.map(sub => {
                const player = sub.playerOutId ? findPlayer(sub.playerOutId) : null;
                const key = sub.playerOutId ?? `sub-out-${sub.minute}-${sub.playerOutName}`;
                return renderPlayerRow(player, key, sub.playerOutName, 'off', sub.minute);
              })}
            </>
          );
        })()}
      </div>
    );
  };

  const renderPitch = () => {
    const homeTactic = match.homeTacticId ? TacticRepository.getById(match.homeTacticId) : null;
    const awayTactic = match.awayTacticId ? TacticRepository.getById(match.awayTacticId) : null;

    const homeRawSubs = (match.substitutions?.filter(s => s.teamId === homeClub.id) ?? []) as ReportSubstitution[];
    const awayRawSubs = (match.substitutions?.filter(s => s.teamId === awayClub.id) ?? []) as ReportSubstitution[];
    const homeSubs = getChronologicalTeamEvents(match.homeLineup ?? [], homeRawSubs, match.cards as ReportCard[], homeClub.id);
    const awaySubs = getChronologicalTeamEvents(match.awayLineup ?? [], awayRawSubs, match.cards as ReportCard[], awayClub.id);
    const findAnyPlayer = (id: string) => allPlayersFlat.find(p => p.id === id) ?? null;
    const getFinalXI = (lineupIds: string[], subs: typeof homeSubs) => {
      const current: (string | null)[] = [...lineupIds];
      [...subs].sort((a, b) => a.minute - b.minute).forEach(sub => {
        if (!sub.playerOutId) return;
        const idx = current.indexOf(sub.playerOutId);
        if (idx !== -1) current[idx] = sub.playerInId ?? null;
      });
      return current.map(id => id ? findAnyPlayer(id) : null);
    };

    const homeXI = getFinalXI(match.homeLineup ?? [], homeSubs);
    const awayXI = getFinalXI(match.awayLineup ?? [], awaySubs);

    const homePrimary = kits.home.primary;
    const homeSecondary = kits.home.secondary;
    const awayPrimary = kits.away.primary;
    const awaySecondary = kits.away.secondary;

    const homeGKColor = pickGoalkeeperColor([homePrimary, homeSecondary, awayPrimary, awaySecondary]);
    const awayGKColor = pickGoalkeeperColor([homePrimary, homeSecondary, awayPrimary, awaySecondary, homeGKColor]);

    const homeFormation = homeTactic?.name ?? '–';
    const awayFormation = awayTactic?.name ?? '–';

    return (
      <div className="flex flex-col items-center gap-1 h-full">
        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest shrink-0">{homeFormation}</span>
        <div className="relative w-full flex-1 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <img src={bojo2Pitch} alt="boisko" className="absolute inset-0 w-full h-full object-fill" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10 pointer-events-none" />
          <div className="absolute inset-0">
            {homeTactic && homeTactic.slots.map((slot, i) => {
              const player = homeXI[i] ?? null;
              const isGK = slot.role === PlayerPosition.GK;
              const primary = isGK ? homeGKColor : homePrimary;
              const secondary = isGK ? homeGKColor : homeSecondary;
              const isRedCarded = !!player && match.cards.some(c => c.playerId === player.id && (c.type === 'RED' || c.type === 'SECOND_YELLOW'));
              return (
                <PitchKit
                  key={`h-${i}`}
                  player={player}
                  isMom={!!player && motmId === player.id}
                  isRedCarded={isRedCarded}
                  left={`${slot.x * 100}%`}
                  top={
                    isGK
                      ? `calc(${getPitchSlotTop(true, slot.y)} + 40px)`
                      : slot.role === PlayerPosition.DEF
                        ? `calc(${getPitchSlotTop(true, slot.y)} + 25px)`
                        : slot.role === PlayerPosition.MID
                          ? `calc(${getPitchSlotTop(true, slot.y)} - 5px)`
                          : `calc(${getPitchSlotTop(true, slot.y)} - 30px)`
                  }
                  primary={primary}
                  shirtSecondary={isGK ? undefined : kits.home.shirtSecondary}
                  secondary={secondary}
                  pattern={isGK ? 'solid' : kits.home.pattern}
                />
              );
            })}

            {awayTactic && awayTactic.slots.map((slot, i) => {
              const player = awayXI[i] ?? null;
              const isGK = slot.role === PlayerPosition.GK;
              const primary = isGK ? awayGKColor : awayPrimary;
              const secondary = isGK ? awayGKColor : awaySecondary;
              const isRedCarded = !!player && match.cards.some(c => c.playerId === player.id && (c.type === 'RED' || c.type === 'SECOND_YELLOW'));
              return (
                <PitchKit
                  key={`a-${i}`}
                  player={player}
                  isMom={!!player && motmId === player.id}
                  isRedCarded={isRedCarded}
                  left={`${slot.x * 100}%`}
                  top={
                    isGK
                      ? `calc(${getPitchSlotTop(false, slot.y)} - 40px)`
                      : slot.role === PlayerPosition.DEF
                        ? `calc(${getPitchSlotTop(false, slot.y)} - 23px)`
                        : slot.role === PlayerPosition.MID
                          ? `calc(${getPitchSlotTop(false, slot.y)} + 5px)`
                          : `calc(${getPitchSlotTop(false, slot.y)} + 30px)`
                  }
                  primary={primary}
                  shirtSecondary={isGK ? undefined : kits.away.shirtSecondary}
                  secondary={secondary}
                  pattern={isGK ? 'solid' : kits.away.pattern}
                />
              );
            })}
          </div>
        </div>
        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest shrink-0">{awayFormation}</span>
      </div>
    );
  };

  const weatherText = match.weather
    ? `${match.weather.description} ${match.weather.tempC}°C`
    : '–';

  return (
    <div className="fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className={`${GLASS_PANEL} w-full max-w-6xl max-h-[96vh] rounded-[40px] flex flex-col overflow-hidden`}
        style={{
          position: 'fixed',
          left: pos ? pos.x : '50%',
          top: pos ? pos.y : '50%',
          transform: pos ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)',
          maxWidth: '72rem',
          width: 'calc(100% - 2rem)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white/5 border-b border-white/5 px-8 py-4 flex justify-between items-center shrink-0 cursor-grab active:cursor-grabbing select-none" onMouseDown={onMouseDown}>
          <div>
            <h2 className="text-lg font-black italic text-white uppercase tracking-tighter">Raport Meczowy</h2>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">{getCompetitionName(match.competition)} · {match.date.slice(0, 10)}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all text-2xl">×</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Match conditions row */}
          <div className="px-8 py-3 flex items-center gap-6 border-b border-white/5 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Stadion</span>
              <span className="text-[10px] font-black text-slate-300 uppercase italic">{match.venue || homeClub.stadiumName}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Widzów</span>
              <span className="text-[10px] font-black text-emerald-400 tabular-nums">{match.attendance?.toLocaleString() ?? '–'}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Pogoda</span>
              <span className="text-[10px] font-black text-slate-300">{weatherText}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Sędzia</span>
              <span className="text-[10px] font-black text-slate-300 uppercase italic">{match.refereeName ?? '–'}</span>
            </div>
          </div>

          {/* Score panel — nazwy druzyn wyrownane, wynik bez tla */}
          <div className="px-8 pt-5 pb-3">
            {/* Row 1: kity + nazwy + wynik (zawsze wyrownane) */}
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center justify-end min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <KitPreview
                    shirt={kits.home.primary}
                    shirtSecondary={kits.home.shirtSecondary}
                    shorts={kits.home.secondary}
                    socks={kits.home.secondary}
                    pattern={kits.home.pattern}
                    className={`h-[58px] w-[52px] ${isColorDark(kits.home.primary) ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]' : ''}`}
                  />
                  <div className="flex flex-col items-end min-w-0">
                    <span className="text-2xl font-black italic text-white uppercase tracking-tighter text-right leading-none truncate pr-1">{homeClub.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center shrink-0 gap-1">
                <span className="text-6xl font-black text-white tabular-nums tracking-tight">
                  {match.homeScore} <span className="text-slate-600">:</span> {match.awayScore}
                </span>
                {match.isExtraTime && (
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Po dogrywce</span>
                )}
                {match.homePenaltyScore !== undefined && (
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Karne: {match.homePenaltyScore} – {match.awayPenaltyScore}
                  </span>
                )}
              </div>

              <div className="flex-1 flex items-center justify-start min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col items-start overflow-hidden min-w-0">
                    <span className="text-2xl font-black italic text-white uppercase tracking-tighter text-left leading-none truncate w-full pr-2">{awayClub.name}</span>
                  </div>
                  <KitPreview
                    shirt={kits.away.primary}
                    shirtSecondary={kits.away.shirtSecondary}
                    shorts={kits.away.secondary}
                    socks={kits.away.secondary}
                    pattern={kits.away.pattern}
                    className={`h-[58px] w-[52px] ${isColorDark(kits.away.primary) ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: wydarzenia chronologiczne (nie przesuwaja nazw) */}
            <div className="flex items-start gap-4 mt-2">
              <div className="flex-1 flex justify-end">
                {renderTeamEvents(homeEvents, 'right')}
              </div>
              <div className="shrink-0" style={{ minWidth: '180px' }} />
              <div className="flex-1 flex justify-start">
                {renderTeamEvents(awayEvents, 'left')}
              </div>
            </div>
          </div>

          {/* Lineup + Pitch + Lineup */}
          <div className="px-8 pb-6 grid gap-3" style={{ gridTemplateColumns: '250px 1fr 250px' }}>
            <div className={`${GLASS_PANEL} rounded-[20px] p-3`}>
              <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 text-center">
                {homeShortName}
              </h3>
              {renderLineup('home')}
            </div>

            <div className="rounded-xl overflow-hidden opacity-[0.85]" style={{ minHeight: '420px' }}>
              {renderPitch()}
            </div>

            <div className={`${GLASS_PANEL} rounded-[20px] p-3`}>
              <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 text-center">
                {awayShortName}
              </h3>
              {renderLineup('away')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
