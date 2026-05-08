import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Player, PlayerPosition, ReserveFixture, ReserveMatchPlayerEntry, ReserveMatchResult, Club } from '../../types';

interface Props {
  onClose: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getRatingColor(r: number): string {
  if (r >= 8) return 'text-green-400';
  if (r >= 7) return 'text-yellow-300';
  if (r >= 6) return 'text-orange-300';
  return 'text-red-400';
}

function getDisplayScore(result: ReserveMatchResult): { homeScore: number; awayScore: number } {
  const homeGoals = result.goals.filter(g => g.teamId === 'HOME').length;
  const awayGoals = result.goals.filter(g => g.teamId === 'AWAY').length;
  const eventScoreMatchesTotal = homeGoals + awayGoals === result.homeScore + result.awayScore;
  if (eventScoreMatchesTotal && (homeGoals !== result.homeScore || awayGoals !== result.awayScore)) {
    return { homeScore: homeGoals, awayScore: awayGoals };
  }
  return { homeScore: result.homeScore, awayScore: result.awayScore };
}

interface MatchDetailModalProps {
  result: ReserveMatchResult;
  reserves: Player[];
  clubs: Club[];
  userTeamId: string | null;
  fixture: ReserveFixture | null;
  onClose: () => void;
}

type MatchTeamId = 'HOME' | 'AWAY';
type EventKind = 'goal' | 'yellow' | 'red' | 'sub' | 'injury' | 'missed_penalty';

const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ result, reserves, clubs, userTeamId, fixture, onClose }) => {
  const userTeamSide: MatchTeamId = result.isUserHome ? 'HOME' : 'AWAY';
  const userClub = clubs.find(c => c.id === userTeamId);
  const userFullName = userClub ? `${userClub.name} II` : (result.isUserHome ? result.homeTeamName : result.awayTeamName);
  const oppFullName = fixture ? `${fixture.opponentClubName} II` : (result.isUserHome ? result.awayTeamName : result.homeTeamName);
  const fullHomeTeamName = result.isUserHome ? userFullName : oppFullName;
  const fullAwayTeamName = result.isUserHome ? oppFullName : userFullName;
  const oppClub = clubs.find(c => c.id === fixture?.opponentClubId);
  const homeClubColors = result.isUserHome ? (userClub?.colorsHex ?? []) : (oppClub?.colorsHex ?? []);
  const awayClubColors = result.isUserHome ? (oppClub?.colorsHex ?? []) : (userClub?.colorsHex ?? []);
  const homeC = homeClubColors[0] ?? '#1e3a5f';
  const awayC = awayClubColors[0] ?? '#5f1e1e';
  const scoreGradient = `linear-gradient(to right, ${homeC}99 0%, ${homeC}33 38%, transparent 50%, ${awayC}33 62%, ${awayC}99 100%)`;
  const homeClubData = result.isUserHome ? userClub : oppClub;
  const awayClubData = result.isUserHome ? oppClub : userClub;
  const fallbackPlayers: ReserveMatchPlayerEntry[] = result.userStartingXI.map(id => {
    const player = reserves.find(r => r.id === id);
    return {
      id,
      name: player ? `${player.firstName} ${player.lastName}` : id,
      position: player?.position ?? PlayerPosition.MID,
      teamId: userTeamSide,
      starter: true,
      rating: result.ratings[id],
    };
  });

  const matchPlayers = result.matchPlayers?.length ? result.matchPlayers : fallbackPlayers;
  const homePlayers = matchPlayers.filter(p => p.teamId === 'HOME');
  const awayPlayers = matchPlayers.filter(p => p.teamId === 'AWAY');

  const getPlayersByTeam = (teamId: MatchTeamId) => (teamId === 'HOME' ? homePlayers : awayPlayers);
  const getPlayerRating = (playerId?: string): number | undefined =>
    playerId ? matchPlayers.find(p => p.id === playerId)?.rating ?? result.ratings[playerId] : undefined;

  const formatRating = (rating?: number): string => (typeof rating === 'number' ? rating.toFixed(1) : '-');
  const ratingColor = (playerId?: string, rating?: number): string => {
    if (playerId && playerId === result.manOfTheMatch) return 'text-yellow-300 font-black';
    if (typeof rating !== 'number') return 'text-gray-500';
    return getRatingColor(rating);
  };

  const goalsFor = (teamId: MatchTeamId) => result.goals.filter(g => g.teamId === teamId);
  const cardsFor = (teamId: MatchTeamId) => result.cards.filter(c => c.teamId === teamId);
  const subsFor = (teamId: MatchTeamId) => result.substitutions.filter(s => s.teamId === teamId);
  const injuriesFor = (teamId: MatchTeamId) => result.injuries.filter(i => i.teamId === teamId);
  const missedPenaltiesFor = (teamId: MatchTeamId) => (result.missedPenalties ?? []).filter(p => p.teamId === teamId);

  const teamScorers = (teamId: MatchTeamId): string => {
    const goals = goalsFor(teamId);
    if (goals.length === 0) return '-';
    return goals.map(g => `${g.playerName} ${g.minute}'${g.isPenalty ? ' k.' : ''}`).join(', ');
  };

  const renderClubLogo = (club: Club | undefined) => {
    if (club?.logoFile) {
      return <img src={new URL(`../../Graphic/logo/${club.logoFile}`, import.meta.url).href} alt="" className="w-14 h-14 object-contain shrink-0" />;
    }
    const c1 = club?.colorsHex?.[0] ?? '#374151';
    const c2 = club?.colorsHex?.[1] ?? c1;
    return (
      <div className="w-14 h-14 rounded-xl border border-white/10 flex flex-col overflow-hidden shrink-0">
        <div className="flex-1" style={{ backgroundColor: c1 }} />
        <div className="flex-1" style={{ backgroundColor: c2 }} />
      </div>
    );
  };

  const cardLabel = (type: string): string => {
    if (type === 'RED') return 'CZ';
    if (type === 'SECOND_YELLOW') return '2Z';
    return 'ZK';
  };

  const positionBadge = (pos: PlayerPosition): { label: string; cls: string } => {
    if (pos === PlayerPosition.GK) return { label: 'BR', cls: 'bg-yellow-500 text-black' };
    if (pos === PlayerPosition.DEF) return { label: 'OBR', cls: 'bg-blue-600 text-white' };
    if (pos === PlayerPosition.MID) return { label: 'POM', cls: 'bg-green-600 text-white' };
    return { label: 'NAP', cls: 'bg-red-600 text-white' };
  };

  const eventBadgeClass = (kind: EventKind): string => {
    if (kind === 'goal') return 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20';
    if (kind === 'yellow') return 'bg-yellow-300/15 text-yellow-200 border-yellow-300/20';
    if (kind === 'red') return 'bg-red-400/15 text-red-300 border-red-400/20';
    if (kind === 'injury') return 'bg-orange-400/15 text-orange-300 border-orange-400/20';
    if (kind === 'missed_penalty') return 'bg-red-600/15 text-red-400 border-red-600/20';
    return 'bg-sky-400/15 text-sky-300 border-sky-400/20';
  };

  const renderPlayerRow = (player: ReserveMatchPlayerEntry, compact = false) => {
    const rating = player.rating ?? result.ratings[player.id];
    const isMom = player.id === result.manOfTheMatch;
    const playerGoals = result.goals.filter(g => g.playerId === player.id || g.playerName === player.name);
    const playerCard = result.cards.find(c => c.playerId === player.id || c.playerName === player.name);
    const playerInjury = result.injuries.find(i => i.playerId === player.id || i.playerName === player.name);
    return (
      <div
        key={`${player.teamId}-${player.id}-${compact ? 'bench' : 'xi'}`}
        className={`grid grid-cols-[38px_1fr_44px] items-center gap-2 rounded-md border px-2 py-1.5 ${
          isMom ? 'border-yellow-300/35 bg-yellow-300/10' : 'border-white/5 bg-white/[0.03]'
        }`}
      >
        <span className={`inline-flex items-center justify-center rounded px-1 py-0.5 text-[9px] ${positionBadge(player.position).cls}`}>{positionBadge(player.position).label}</span>
        <span className="flex items-center gap-1 flex-wrap">
          <span className={`text-sm font-semibold ${isMom ? 'text-yellow-300' : compact ? 'text-gray-300' : 'text-white'}`}>
            {player.name}
          </span>
          {isMom && <span className="shrink-0 text-yellow-400 text-sm">★</span>}
          {playerGoals.length > 0 && (
            <span className="shrink-0 text-sm">{'⚽'.repeat(Math.min(playerGoals.length, 3))}</span>
          )}
          {playerCard && (
            <span className="flex items-center gap-0.5 shrink-0">
              <span className={`inline-block h-3.5 w-2.5 rounded-[2px] ${playerCard.type === 'YELLOW' ? 'bg-yellow-400' : 'bg-red-500'}`} />
              <span className="text-[9px] font-bold text-gray-400">{playerCard.minute}'</span>
            </span>
          )}
          {playerInjury && (
            <span className="shrink-0 rounded border border-red-500/30 bg-red-500/20 px-1 text-[9px] font-black text-red-400">✚</span>
          )}
        </span>
        <span className={`text-right text-sm ${ratingColor(player.id, rating)}`}>{formatRating(rating)}</span>
      </div>
    );
  };

  const renderEvents = (teamId: MatchTeamId) => {
    const events = [
      ...goalsFor(teamId).map(g => ({
        minute: g.minute,
        kind: 'goal' as EventKind,
        label: 'GOL',
        text: `${g.playerName}${g.assistantName ? ` (as. ${g.assistantName})` : ''}${g.isPenalty ? ' (karny)' : ''}`,
      })),
      ...missedPenaltiesFor(teamId).map(p => ({
        minute: p.minute,
        kind: 'missed_penalty' as EventKind,
        label: 'K.',
        text: `${p.playerName} — niestrzelony karny`,
      })),
      ...cardsFor(teamId).map(c => ({
        minute: c.minute,
        kind: (c.type === 'RED' || c.type === 'SECOND_YELLOW' ? 'red' : 'yellow') as EventKind,
        label: cardLabel(c.type),
        text: c.playerName,
      })),
      ...injuriesFor(teamId).map(i => ({
        minute: i.minute,
        kind: 'injury' as EventKind,
        label: 'KON',
        text: `${i.playerName} (${i.type}, ${i.days} dni)`,
      })),
    ].sort((a, b) => a.minute - b.minute);

    if (events.length === 0) {
      return <div className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-gray-500">Brak zdarzen</div>;
    }

    return (
      <div className="space-y-1.5">
        {events.map((event, idx) => (
          <div key={`${event.minute}-${event.label}-${idx}`} className="flex items-center gap-2 text-xs">
            <span className="w-8 shrink-0 font-mono font-bold text-yellow-300">{event.minute}'</span>
            <span className={`w-9 shrink-0 rounded border px-1.5 py-0.5 text-center text-[10px] font-black ${eventBadgeClass(event.kind)}`}>
              {event.label}
            </span>
            <span className="min-w-0 truncate text-gray-200">{event.text}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderSubstitutions = (teamId: MatchTeamId) => {
    const substitutions = subsFor(teamId);
    if (substitutions.length === 0) {
      return <div className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-gray-500">Brak zmian</div>;
    }

    return (
      <div className="space-y-1.5">
        {substitutions.map((sub, idx) => {
          const incomingRating = getPlayerRating(sub.playerInId);
          return (
            <div key={`${sub.minute}-${sub.playerInId}-${idx}`} className="rounded-md border border-sky-400/10 bg-sky-400/[0.04] px-2 py-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-yellow-300">{sub.minute}'</span>
                <span className={`font-bold ${ratingColor(sub.playerInId, incomingRating)}`}>{formatRating(incomingRating)}</span>
              </div>
              <div className="mt-1 grid grid-cols-[28px_1fr] gap-x-2 text-gray-400">
                <span className="text-[13px] font-black text-red-400">←</span>
                <span className="truncate">{sub.playerOutName}</span>
                <span className="text-[13px] font-black text-emerald-400">→</span>
                <span className="truncate font-semibold text-white">{sub.playerInName}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTeamPanel = (teamId: MatchTeamId) => {
    const players = getPlayersByTeam(teamId);
    const starters = players.filter(p => p.starter);
    const usedBench = players.filter(p => !p.starter);
    const teamName = teamId === 'HOME' ? fullHomeTeamName : fullAwayTeamName;
    const displayScore = getDisplayScore(result);
    const score = teamId === 'HOME' ? displayScore.homeScore : displayScore.awayScore;

    return (
      <section className="rounded-xl border border-white/10 bg-gray-950/45 p-4">
        <div className="mb-4">
          <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Sklad startowy</div>
          <div className="space-y-1.5">
            {starters.length > 0
              ? starters.map(player => renderPlayerRow(player))
              : <div className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-gray-500">Brak danych skladu</div>}
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Zmiany</div>
          {renderSubstitutions(teamId)}
        </div>

        {usedBench.length > 0 && (
          <div>
            <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Rezerwowi z minutami</div>
            <div className="space-y-1.5">
              {usedBench.map(player => renderPlayerRow(player, true))}
            </div>
          </div>
        )}
      </section>
    );
  };

  const renderPitch = () => {
    const homePosY: Record<string, number> = { GK: 0.93, DEF: 0.80, MID: 0.67, FWD: 0.54 };
    const awayPosY: Record<string, number> = { GK: 0.07, DEF: 0.20, MID: 0.33, FWD: 0.46 };
    const homeStarters = homePlayers.filter(p => p.starter);
    const awayStarters = awayPlayers.filter(p => p.starter);

    const buildDots = (players: ReserveMatchPlayerEntry[], isHome: boolean) => {
      const posY = isHome ? homePosY : awayPosY;
      return ([PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD] as PlayerPosition[]).flatMap(pos => {
        const group = players.filter(p => p.position === pos);
        const y = posY[pos] ?? 0.5;
        return group.map((p, i) => ({ player: p, x: (i + 1) / (group.length + 1), y }));
      });
    };

    const homeDots = buildDots(homeStarters, true);
    const awayDots = buildDots(awayStarters, false);
    const allDots = [
      ...homeDots.map(d => ({ ...d, isHome: true })),
      ...awayDots.map(d => ({ ...d, isHome: false })),
    ];

    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '2/3' }}>
        <img
          src={new URL('../../Graphic/themes/bojo2.png', import.meta.url).href}
          alt="boisko"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0">
          {allDots.map(({ player, x, y, isHome }) => {
            const lastName = player.name.split(' ').pop() ?? player.name;
            const short = lastName.substring(0, 7);
            const isMom = player.id === result.manOfTheMatch;
            return (
              <div
                key={`pitch-${player.id}`}
                className="absolute flex flex-col items-center gap-0.5"
                style={{ left: `${x * 100}%`, top: `${y * 100}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                  style={{ backgroundColor: isHome ? (homeClubColors[0] ?? '#1d4ed8') : (awayClubColors[0] ?? '#dc2626'), borderColor: isHome ? (homeClubColors[1] ?? homeClubColors[0] ?? '#93c5fd') : (awayClubColors[1] ?? awayClubColors[0] ?? '#fca5a5') }}
                />
                <span className="text-[7px] font-black not-italic text-white leading-none bg-black/70 px-0.5 rounded whitespace-nowrap">{short}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const displayScore = getDisplayScore(result);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div
        className="w-full max-w-[96vw] max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-600/70 backdrop-blur-sm p-5 shadow-2xl font-black italic uppercase tracking-tighter"
        style={{ backgroundColor: 'rgba(16,24,39,0.30)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Raport meczowy rezerw</div>
            <h2 className="mt-1 text-2xl font-black text-white">Raport meczowy</h2>
          </div>
          <button onClick={onClose} className="rounded-lg border border-white/10 px-3 py-1.5 text-lg text-gray-300 hover:border-white/25 hover:text-white">x</button>
        </div>

        <div className="mb-5 overflow-hidden rounded-2xl border border-white/10" style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}>
          <div className="px-5 pt-4 text-center text-xs font-semibold text-slate-400">
            {formatDate(result.date)} - {result.venue}
          </div>
          <div className="relative flex items-center px-5 pt-5 pb-3" style={{ background: scoreGradient }}>
            <div className="flex-1 flex items-center justify-end gap-3 pr-28">
              <div className="text-right text-3xl text-white not-italic">{fullHomeTeamName}</div>
              {renderClubLogo(homeClubData)}
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-5xl text-white whitespace-nowrap not-italic">
              {displayScore.homeScore}<span className="px-4 text-slate-500">:</span>{displayScore.awayScore}
            </div>
            <div className="flex-1 flex items-center justify-start gap-3 pl-28">
              {renderClubLogo(awayClubData)}
              <div className="text-3xl text-white not-italic">{fullAwayTeamName}</div>
            </div>
          </div>
          <div className="flex px-5 pb-4" style={{ background: scoreGradient }}>
            {(['HOME', 'AWAY'] as MatchTeamId[]).map(teamId => {
              const goals = goalsFor(teamId);
              const reds = cardsFor(teamId).filter(c => c.type === 'RED' || c.type === 'SECOND_YELLOW');
              const missed = missedPenaltiesFor(teamId);
              const isHome = teamId === 'HOME';
              return (
                <div key={teamId} className={`flex-1 flex flex-col gap-0.5 text-sm font-normal text-white ${isHome ? 'items-end pr-28' : 'items-start pl-28'}`}>
                  {goals.length === 0 && reds.length === 0 && missed.length === 0 && <span></span>}
                  {goals.map((g, i) => {
                    const parts = g.playerName.split(' ');
                    const short = parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(' ')}` : g.playerName;
                    return <span key={i}>{short} {g.minute}'{g.isPenalty ? ' k.' : ''}</span>;
                  })}
                  {missed.map((p, i) => {
                    const parts = p.playerName.split(' ');
                    const short = parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(' ')}` : p.playerName;
                    return (
                      <span key={`mp-${i}`} className="flex items-center gap-1 text-red-400">
                        <span className="text-red-500 font-bold text-base leading-none">✕</span>
                        <span>{short} {p.minute}'</span>
                      </span>
                    );
                  })}
                  {reds.map((c, i) => {
                    const parts = c.playerName.split(' ');
                    const short = parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(' ')}` : c.playerName;
                    return (
                      <span key={i} className="flex items-center gap-1">
                        <span className="inline-block w-2.5 h-3.5 rounded-[2px] bg-red-500 shrink-0" />
                        <span>{short} {c.minute}'</span>
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center">
        <div className="grid grid-cols-[370px_340px_370px] gap-4 items-start">
          {renderTeamPanel('HOME')}
          {renderPitch()}
          {renderTeamPanel('AWAY')}
        </div>
        </div>
      </div>
    </div>
  );
};

export const ReserveScheduleModal: React.FC<Props> = ({ onClose }) => {
  const { reserveFixtures, reserveMatchResults, reserves, seasonNumber, clubs, userTeamId } = useGame();
  const [selectedResult, setSelectedResult] = useState<ReserveMatchResult | null>(null);
  const [selectedFixture, setSelectedFixture] = useState<ReserveFixture | null>(null);

  const seasonFixtures = reserveFixtures.filter(f => {
    const result = f.resultId ? reserveMatchResults.find(r => r.id === f.resultId) : null;
    return !result || result.season === seasonNumber || f.id.includes(`_${seasonNumber}_`);
  });

  const getResult = (f: ReserveFixture): ReserveMatchResult | undefined =>
    f.resultId ? reserveMatchResults.find(r => r.id === f.resultId) : undefined;

  const getResultLabel = (f: ReserveFixture): { text: string; color: string } | null => {
    const r = getResult(f);
    if (!r) return null;
    const displayScore = getDisplayScore(r);
    const userScore = r.isUserHome ? displayScore.homeScore : displayScore.awayScore;
    const oppScore = r.isUserHome ? displayScore.awayScore : displayScore.homeScore;
    if (userScore > oppScore) return { text: `${userScore}:${oppScore}`, color: 'text-green-400' };
    if (userScore === oppScore) return { text: `${userScore}:${oppScore}`, color: 'text-yellow-300' };
    return { text: `${userScore}:${oppScore}`, color: 'text-red-400' };
  };

  const getOppColors = (clubId: string): string[] => {
    const club = clubs.find(c => c.id === clubId);
    return club?.colorsHex ?? ['#374151', '#1f2937'];
  };

  const makeGradient = (colors: string[]): string => {
    const c1 = colors[0] ?? '#374151';
    const c2 = colors[1] ?? colors[0] ?? '#1f2937';
    return `linear-gradient(90deg, ${c1}22 0%, ${c2}33 50%, ${c1}11 100%)`;
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80" onClick={onClose}>
        <div
          className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[85vh] overflow-y-auto p-5"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-lg italic uppercase tracking-tighter">Terminarz Rezerw - Sezon {seasonNumber}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">x</button>
          </div>

          {seasonFixtures.length === 0 && (
            <div className="text-gray-400 text-sm text-center py-8">
              Terminarz zostanie wygenerowany 4 lipca.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {([1, 2] as const).map(round => {
              const roundFixtures = seasonFixtures.filter(f => f.round === round);
              if (roundFixtures.length === 0) return null;
              const roundLabel = round === 1 ? 'Runda Jesienna' : 'Runda Wiosenna';
              return (
                <div key={round} className="border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs italic uppercase tracking-tighter text-gray-400">{roundLabel}</span>
                    <div className="flex-1 h-px bg-gray-700" />
                  </div>
                  <div className="space-y-1">
                    {roundFixtures.map((f) => {
                      const resultLabel = getResultLabel(f);
                      const result = getResult(f);
                      const oppLabel = `${f.opponentClubName} II`;
                      const oppColors = getOppColors(f.opponentClubId);
                      const gradient = makeGradient(oppColors);
                      return (
                        <div
                          key={f.id}
                          className={`flex items-center justify-between px-2 py-1.5 rounded-md text-sm border border-white/5 ${result ? 'cursor-pointer hover:brightness-125' : ''}`}
                          style={{ background: gradient }}
                          onClick={() => { if (result) { setSelectedResult(result); setSelectedFixture(f); } }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span className={`text-xs w-4 shrink-0 italic uppercase tracking-tighter ${f.isHome ? 'text-green-400' : 'text-blue-400'}`}>
                              {f.isHome ? 'D' : 'W'}
                            </span>
                            <span className="text-gray-300 text-xs w-16 shrink-0 italic uppercase tracking-tighter">{formatDate(f.date)}</span>
                            <div className="shrink-0">
                              {resultLabel ? (
                                <span className={`text-xs italic uppercase tracking-tighter ${resultLabel.color}`}>{resultLabel.text}</span>
                              ) : (
                                <span className="text-gray-500 text-xs italic">-</span>
                              )}
                            </div>
                            <span className="text-white text-xs italic uppercase tracking-tighter">{oppLabel}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedResult && (
        <MatchDetailModal
          result={selectedResult}
          reserves={reserves}
          clubs={clubs}
          userTeamId={userTeamId}
          fixture={selectedFixture}
          onClose={() => { setSelectedResult(null); setSelectedFixture(null); }}
        />
      )}
    </>
  );
};
