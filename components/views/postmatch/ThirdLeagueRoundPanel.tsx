import React, { useMemo, useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { LeagueRoundResults, MatchResult, MatchStatus } from '../../../types';
import {
  THIRD_LEAGUE_GROUP_IDS,
  THIRD_LEAGUE_GROUP_NAMES,
  ThirdLeagueGroupId,
} from '../../../services/PolishThirdLeagueService';

interface ThirdLeagueRoundPanelProps {
  currentRoundResults: LeagueRoundResults | null;
  roundNumber: number | null;
  onClose: () => void;
}

const positionClass = (position: number): string => {
  if (position === 1) return 'bg-blue-600 text-white';
  if (position === 2) return 'bg-sky-500 text-white';
  if (position >= 15) return 'bg-red-600 text-white';
  return 'bg-slate-800 text-slate-300';
};

const formClass = (result: 'W' | 'R' | 'P'): string =>
  result === 'W' ? 'bg-emerald-500' : result === 'R' ? 'bg-amber-500' : 'bg-red-600';

export const ThirdLeagueRoundPanel: React.FC<ThirdLeagueRoundPanelProps> = ({
  currentRoundResults,
  roundNumber,
  onClose,
}) => {
  const { clubs, leagueSchedules } = useGame();
  const [groupId, setGroupId] = useState<ThirdLeagueGroupId>('L_PL_4_G1');

  const standings = useMemo(() => clubs
    .filter(club => club.leagueId === groupId && club.isDefaultActive)
    .sort((a, b) =>
      b.stats.points - a.stats.points ||
      b.stats.goalDifference - a.stats.goalDifference ||
      b.stats.goalsFor - a.stats.goalsFor ||
      a.name.localeCompare(b.name, 'pl')
    ), [clubs, groupId]);

  const results = useMemo<MatchResult[]>(() => {
    const savedResults = currentRoundResults?.thirdLeagueResults?.[groupId];
    if (savedResults?.length) return savedResults;

    // Fixtures are a safe fallback for a save made before round-result cards
    // began storing III-liga arrays. They are already persisted and contain the
    // authoritative score, so the studio never needs to resimulate a match.
    const matchday = leagueSchedules[groupId]?.matchdays.find(day => day.roundNumber === roundNumber);
    return (matchday?.fixtures ?? [])
      .filter(fixture =>
        fixture.status === MatchStatus.FINISHED &&
        fixture.homeScore !== null &&
        fixture.awayScore !== null
      )
      .map(fixture => {
        const home = clubs.find(club => club.id === fixture.homeTeamId);
        const away = clubs.find(club => club.id === fixture.awayTeamId);
        return {
          homeTeamName: home?.name ?? fixture.homeTeamId,
          awayTeamName: away?.name ?? fixture.awayTeamId,
          homeScore: fixture.homeScore!,
          awayScore: fixture.awayScore!,
          homeColors: home?.colorsHex ?? ['#334155', '#64748b'],
          awayColors: away?.colorsHex ?? ['#334155', '#64748b'],
          matchId: fixture.id,
        };
      });
  }, [clubs, currentRoundResults, groupId, leagueSchedules, roundNumber]);

  return (
    <div
      className="absolute inset-0 z-50 rounded-[42px] bg-slate-950 border border-cyan-400/20 shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col animate-fade-in isolate"
      // Use an explicit opaque color as a safety net. The previous percentage
      // opacity utility allowed the post-match studio to remain visible below
      // this panel, causing two sets of fixtures and tables to overlap visually.
      style={{ backgroundColor: '#020617' }}
    >
      <div className="px-7 py-5 border-b border-white/10 bg-cyan-950 shrink-0 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between gap-5">
          <div>
            <h2 className="font-black italic uppercase tracking-tighter text-3xl text-white">Betclic 3. Liga</h2>
            <p className="font-black italic uppercase tracking-tighter text-[10px] text-cyan-300 mt-1">Wyniki kolejki {roundNumber ?? '–'} i aktualne tabele</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-black italic uppercase tracking-tighter px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            Zamknij ×
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          {THIRD_LEAGUE_GROUP_IDS.map(id => (
            <button
              type="button"
              key={id}
              onClick={() => setGroupId(id)}
              className={`font-black italic uppercase tracking-tighter rounded-xl px-4 py-2.5 text-[11px] border transition-colors ${
                groupId === id
                  ? 'bg-rose-600 border-rose-400 text-white'
                  : 'bg-slate-900/80 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {THIRD_LEAGUE_GROUP_NAMES[id]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[minmax(360px,0.75fr)_minmax(760px,1.55fr)] gap-4 p-5">
        <section className="min-h-0 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
          <h3 className="font-black italic uppercase tracking-tighter text-sm text-white px-5 py-4 bg-cyan-950/50 border-b border-white/5">Wyniki</h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
            {results.map((result, index) => (
              <div key={result.matchId ?? `${groupId}-${index}`} className="grid grid-cols-[1fr_54px_1fr] items-center gap-2 px-4 py-3 hover:bg-white/[0.03]">
                <div className="min-w-0 flex items-center justify-end gap-2 text-right">
                  <span className="font-black italic uppercase tracking-tighter text-[10px] text-slate-200 truncate">{result.homeTeamName}</span>
                  <i className="w-2 h-7 rounded-full shrink-0" style={{ backgroundColor: result.homeColors[0] }} />
                </div>
                <span className="font-black italic uppercase tracking-tighter text-center text-sm text-emerald-300 bg-slate-950 rounded-lg py-1.5 border border-white/5">{result.homeScore}:{result.awayScore}</span>
                <div className="min-w-0 flex items-center gap-2">
                  <i className="w-2 h-7 rounded-full shrink-0" style={{ backgroundColor: result.awayColors[0] }} />
                  <span className="font-black italic uppercase tracking-tighter text-[10px] text-slate-200 truncate">{result.awayTeamName}</span>
                </div>
              </div>
            ))}
            {results.length === 0 && (
              <p className="font-black italic uppercase tracking-tighter p-10 text-center text-xs text-slate-500">Brak rozegranych spotkań w tej kolejce</p>
            )}
          </div>
        </section>

        <section className="min-h-0 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
          <h3 className="font-black italic uppercase tracking-tighter text-sm text-white px-5 py-4 bg-cyan-950/50 border-b border-white/5">Aktualna tabela</h3>
          <div className="grid grid-cols-[42px_minmax(210px,1fr)_repeat(7,46px)_128px] bg-slate-950 px-3 py-2 text-[9px] shrink-0 border-b border-white/5">
            {['#', 'Drużyna', 'M', 'Z', 'R', 'P', 'B', 'RB', 'Pkt', 'Forma'].map(label => (
              <span key={label} className="font-black italic uppercase tracking-tighter text-center">{label}</span>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {standings.map((club, index) => (
              <div key={club.id} className="grid grid-cols-[42px_minmax(210px,1fr)_repeat(7,46px)_128px] items-center px-3 py-2 border-t border-white/5 hover:bg-white/[0.03] text-[10px]">
                <span className={`font-black italic uppercase tracking-tighter w-7 h-6 rounded flex items-center justify-center ${positionClass(index + 1)}`}>{index + 1}</span>
                <span className="font-black italic uppercase tracking-tighter truncate flex items-center gap-2 pr-2">
                  <i className="w-2 h-6 rounded-full shrink-0" style={{ backgroundColor: club.colorsHex[0] }} />
                  {club.name}
                </span>
                <span className="font-black italic uppercase tracking-tighter text-center">{club.stats.played}</span>
                <span className="font-black italic uppercase tracking-tighter text-center">{club.stats.wins}</span>
                <span className="font-black italic uppercase tracking-tighter text-center">{club.stats.draws}</span>
                <span className="font-black italic uppercase tracking-tighter text-center">{club.stats.losses}</span>
                <span className="font-black italic uppercase tracking-tighter text-center">{club.stats.goalsFor}:{club.stats.goalsAgainst}</span>
                <span className="font-black italic uppercase tracking-tighter text-center">{club.stats.goalDifference}</span>
                <span className="font-black italic uppercase tracking-tighter text-center text-white">{club.stats.points}</span>
                <span className="flex justify-center gap-1">
                  {(club.stats.form ?? []).slice(-5).map((form, formIndex) => (
                    <i key={formIndex} className={`font-black italic uppercase tracking-tighter not-italic w-5 h-5 rounded flex items-center justify-center text-[9px] text-white ${formClass(form)}`}>
                      {form === 'W' ? 'Z' : form}
                    </i>
                  ))}
                </span>
              </div>
            ))}
          </div>
          <div className="font-black italic uppercase tracking-tighter px-4 py-2.5 border-t border-white/5 text-[9px] text-slate-400 flex gap-5 shrink-0">
            <span><i className="inline-block w-2.5 h-2.5 bg-blue-600 rounded mr-1.5" />Awans</span>
            <span><i className="inline-block w-2.5 h-2.5 bg-sky-500 rounded mr-1.5" />Baraże</span>
            <span><i className="inline-block w-2.5 h-2.5 bg-red-600 rounded mr-1.5" />Bazowy spadek</span>
          </div>
        </section>
      </div>
    </div>
  );
};
