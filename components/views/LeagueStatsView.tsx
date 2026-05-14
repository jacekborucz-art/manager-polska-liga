import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState } from '../../types';
import { LeagueStatsService } from '../../services/LeagueStatsService';
import { PlayerPresentationService } from '../../services/PlayerPresentationService';

type StatTab = 'SCORERS' | 'ASSISTS' | 'YELLOW_CARDS' | 'RED_CARDS' | 'INJURIES';
type LeagueTab = {
  id: string;
  label: string;
  title: string;
  accent: string;
};

const STAT_TABS: Array<{ id: StatTab; label: string; icon: string }> = [
  { id: 'SCORERS', label: 'STRZELCY', icon: '\u26bd' },
  { id: 'ASSISTS', label: 'ASYSTY', icon: 'A' },
  { id: 'YELLOW_CARDS', label: '\u017b\u00d3\u0141TE', icon: '\u25a0' },
  { id: 'RED_CARDS', label: 'CZERWONE', icon: '\u25a0' },
  { id: 'INJURIES', label: 'SZPITAL', icon: '+' },
];

const LEAGUE_TABS: LeagueTab[] = [
  { id: 'L_PL_1', label: 'EKST', title: 'Ekstraklasa', accent: '#fbbf24' },
  { id: 'L_PL_2', label: '1 L', title: '1 Liga', accent: '#3b82f6' },
  { id: 'L_PL_3', label: '2 L', title: '2 Liga', accent: '#10b981' },
  { id: 'L_CL', label: 'CHAMPIONS LEAGUE', title: 'Champions League', accent: '#f59e0b' },
  { id: 'L_EL', label: 'EUROPE LEAGUE', title: 'Europe League', accent: '#f97316' },
  { id: 'L_CONF', label: 'CONF LEAGUE', title: 'Conf League', accent: '#22c55e' },
];

export const LeagueStatsView: React.FC = () => {
  const { clubs, players, navigateTo, viewPlayerDetails } = useGame();

  const displayLeagues = useMemo(() => LEAGUE_TABS, []);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(displayLeagues[0]?.id || 'L_PL_1');
  const [activeTab, setActiveTab] = useState<StatTab>('SCORERS');

  const selectedLeague = useMemo(
    () => displayLeagues.find((league) => league.id === selectedLeagueId),
    [displayLeagues, selectedLeagueId]
  );

  const leagueColor = useMemo(() => {
    return selectedLeague?.accent || '#fbbf24';
  }, [selectedLeague]);

  const statsData = useMemo(() => {
    const rawData = LeagueStatsService.getPlayersForLeague(selectedLeagueId, clubs, players);

    switch (activeTab) {
      case 'SCORERS':
        return LeagueStatsService.getTopScorers(rawData, 50, selectedLeagueId);
      case 'ASSISTS':
        return LeagueStatsService.getTopAssists(rawData, 50, selectedLeagueId);
      case 'YELLOW_CARDS':
        return LeagueStatsService.getYellowCardsList(rawData, 50, selectedLeagueId);
      case 'RED_CARDS':
        return LeagueStatsService.getRedCardsList(rawData, 50, selectedLeagueId);
      case 'INJURIES':
        return LeagueStatsService.getInjuryList(rawData);
      default:
        return [];
    }
  }, [activeTab, clubs, players, selectedLeagueId]);

  const isInjuriesTab = activeTab === 'INJURIES';
  const tableMinWidthClass = isInjuriesTab ? 'min-w-[1260px]' : 'min-w-[1180px]';
  const emptyStateColSpan = isInjuriesTab ? 4 : 5;

  return (
    <div className="relative mx-auto flex h-[calc(100vh-3rem)] max-w-[1600px] flex-col gap-4 overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
        <div
          className="absolute right-[-10%] top-[-10%] h-[60%] w-[60%] rounded-full opacity-20 blur-[150px] transition-all duration-1000"
          style={{ background: leagueColor }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="flex shrink-0 items-center justify-between rounded-[32px] border border-white/10 bg-white/5 px-8 py-5 shadow-2xl backdrop-blur-3xl">
        <div className="flex items-center gap-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl shadow-inner">
            {'\ud83c\udfc6'}
          </div>
          <div>
            <h1 className="leading-none text-3xl font-black italic uppercase tracking-tighter text-white">
              Statystyki Ligowe
            </h1>
            <div className="mt-1.5 flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: leagueColor }}>
                {selectedLeague?.title}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                Rankingi Sezonu
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex rounded-2xl border border-white/5 bg-black/40 p-1.5 shadow-inner">
            {displayLeagues.map((league) => (
              <button
                key={league.id}
                onClick={() => setSelectedLeagueId(league.id)}
                className={`rounded-xl px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all active:translate-y-[2px] ${
                  selectedLeagueId === league.id
                    ? 'border-t border-x border-b border-t-white/40 border-x-white/20 border-b-black/60 bg-white text-slate-900'
                    : 'border-t border-x border-b border-t-white/10 border-x-white/5 border-b-black/40 text-slate-500 hover:bg-white/5 hover:text-slate-300'
                }`}
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
              >
                {league.label}
              </button>
            ))}
          </div>

          <div className="mx-2 h-10 w-px bg-white/10" />

          <button
            onClick={() => navigateTo(ViewState.DASHBOARD)}
            className="rounded-2xl border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 bg-white/5 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 active:translate-y-[2px]"
            style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)' }}
          >
            {'\u2190 Wyjd\u017a'}
          </button>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 px-2">
        {STAT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 rounded-2xl px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:translate-y-[2px] ${
              activeTab === tab.id
                ? 'border-t border-x border-b border-t-white/30 border-x-white/15 border-b-black/60 bg-slate-900 text-white'
                : 'border-t border-x border-b border-t-white/10 border-x-white/5 border-b-black/40 bg-black/20 text-slate-500 hover:bg-black/40 hover:text-slate-300'
            }`}
            style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-[40px] border border-white/5 bg-slate-900/30 shadow-2xl backdrop-blur-2xl">
        <div className="custom-scrollbar flex-1 overflow-auto p-6">
          <table className={`w-full min-w-max border-separate border-spacing-y-2 text-left ${tableMinWidthClass}`}>
            <colgroup>
              {!isInjuriesTab && <col className="w-[88px]" />}
              <col className="w-[360px]" />
              <col className="w-[360px]" />
              {isInjuriesTab ? (
                <>
                  <col className="w-[320px]" />
                  <col className="w-[160px]" />
                </>
              ) : (
                <>
                  <col className="w-[120px]" />
                  <col className="w-[140px]" />
                </>
              )}
            </colgroup>

            <thead className="sticky top-0 z-20">
              <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                {!isInjuriesTab && (
                  <th className="bg-slate-950/95 px-6 py-5 text-center align-middle">#</th>
                )}
                <th className="bg-slate-950/95 px-6 py-5 text-left align-middle">Zawodnik</th>
                <th className="bg-slate-950/95 px-6 py-5 text-left align-middle">Klub</th>

                {activeTab === 'SCORERS' && (
                  <>
                    <th className="bg-slate-950/95 px-6 py-5 text-center align-middle">Mecze</th>
                    <th
                      className="bg-slate-950/95 px-6 py-5 text-center align-middle"
                      style={{ color: leagueColor }}
                    >
                      <span
                        aria-label="Gol"
                        title="Gol"
                        className="inline-block text-base leading-none"
                      >
                        {'\u26bd'}
                      </span>
                    </th>
                  </>
                )}

                {activeTab === 'ASSISTS' && (
                  <>
                    <th className="bg-slate-950/95 px-6 py-5 text-center align-middle">Mecze</th>
                    <th
                      className="bg-slate-950/95 px-6 py-5 text-center align-middle"
                      style={{ color: leagueColor }}
                    >
                      Asysty
                    </th>
                  </>
                )}

                {activeTab === 'YELLOW_CARDS' && (
                  <>
                    <th className="bg-slate-950/95 px-6 py-5 text-center align-middle">Mecze</th>
                    <th className="bg-slate-950/95 px-6 py-5 text-center align-middle text-yellow-500">
                      <span
                        aria-label="Żółta kartka"
                        title="Żółta kartka"
                        className="inline-block text-base leading-none"
                      >
                        {'\ud83d\udfe8'}
                      </span>
                    </th>
                  </>
                )}

                {activeTab === 'RED_CARDS' && (
                  <>
                    <th className="bg-slate-950/95 px-6 py-5 text-center align-middle">Mecze</th>
                    <th className="bg-slate-950/95 px-6 py-5 text-center align-middle text-red-500">
                      <span
                        aria-label="Czerwona kartka"
                        title="Czerwona kartka"
                        className="inline-block text-base leading-none"
                      >
                        {'\ud83d\udfe5'}
                      </span>
                    </th>
                  </>
                )}

                {isInjuriesTab && (
                  <>
                    <th className="bg-slate-950/95 px-6 py-5 text-left align-middle">Uraz</th>
                    <th className="bg-slate-950/95 px-6 py-5 text-center align-middle">Dni</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {statsData.map((row, index) => {
                const { player, club } = row;
                const playerStats = LeagueStatsService.getStatsForLeagueId(player, selectedLeagueId);

                return (
                  <tr
                    key={player.id}
                    onClick={() => viewPlayerDetails(player.id)}
                    className="group h-20 cursor-pointer bg-white/[0.02] transition-all duration-300 hover:bg-white/[0.05]"
                  >
                    {!isInjuriesTab && (
                      <td className="px-6 text-center align-middle">
                        <span className="font-mono text-sm font-black text-slate-500">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>
                    )}

                    <td className="px-6 align-middle">
                      <div className="flex flex-col whitespace-nowrap">
                        <span className="text-sm font-black uppercase italic tracking-tight text-white transition-colors group-hover:text-blue-400">
                          {player.lastName} {player.firstName}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-widest ${PlayerPresentationService.getPositionColorClass(player.position)}`}
                        >
                          {player.position} {'\u2022'} {player.age} lat
                        </span>
                      </div>
                    </td>

                    <td className="px-6 align-middle">
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <div className="flex h-6 w-1 shrink-0 flex-col overflow-hidden rounded-full border border-white/10">
                          <div style={{ backgroundColor: club.colorsHex[0] }} className="flex-1" />
                          <div
                            style={{ backgroundColor: club.colorsHex[1] || club.colorsHex[0] }}
                            className="flex-1"
                          />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {club.name}
                        </span>
                      </div>
                    </td>

                    {activeTab === 'SCORERS' && (
                      <>
                        <td className="px-6 text-center align-middle font-mono text-sm font-bold text-slate-500">
                          {playerStats.matchesPlayed}
                        </td>
                        <td className="px-6 text-center align-middle">
                          <span className="inline-block font-mono text-2xl font-black tracking-tighter text-white tabular-nums transition-transform group-hover:scale-110">
                            {playerStats.goals}
                          </span>
                        </td>
                      </>
                    )}

                    {activeTab === 'ASSISTS' && (
                      <>
                        <td className="px-6 text-center align-middle font-mono text-sm font-bold text-slate-500">
                          {playerStats.matchesPlayed}
                        </td>
                        <td className="px-6 text-center align-middle">
                          <span className="inline-block font-mono text-2xl font-black tracking-tighter text-white tabular-nums transition-transform group-hover:scale-110">
                            {playerStats.assists}
                          </span>
                        </td>
                      </>
                    )}

                    {activeTab === 'YELLOW_CARDS' && (
                      <>
                        <td className="px-6 text-center align-middle font-mono text-sm font-bold text-slate-500">
                          {playerStats.matchesPlayed}
                        </td>
                        <td className="px-6 text-center align-middle">
                          <span className="inline-block font-mono text-2xl font-black tracking-tighter text-yellow-500 tabular-nums transition-transform group-hover:scale-110">
                            {playerStats.yellowCards}
                          </span>
                        </td>
                      </>
                    )}

                    {activeTab === 'RED_CARDS' && (
                      <>
                        <td className="px-6 text-center align-middle font-mono text-sm font-bold text-slate-500">
                          {playerStats.matchesPlayed}
                        </td>
                        <td className="px-6 text-center align-middle">
                          <span className="inline-block font-mono text-2xl font-black tracking-tighter text-red-500 tabular-nums transition-transform group-hover:scale-110">
                            {playerStats.redCards}
                          </span>
                        </td>
                      </>
                    )}

                    {isInjuriesTab && (
                      <>
                        <td className="px-6 align-middle">
                          <span className="whitespace-nowrap text-xs font-bold italic text-red-400">
                            {player.health.injury?.type || 'St\u0142uczenie'}
                          </span>
                        </td>
                        <td className="px-6 text-center align-middle">
                          <div className="inline-flex min-w-[120px] items-center justify-center rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-1">
                            <span className="font-mono text-sm font-black text-red-500 tabular-nums">
                              {player.health.injury?.daysRemaining}
                            </span>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}

              {statsData.length === 0 && (
                <tr>
                  <td colSpan={emptyStateColSpan} className="py-20 text-center opacity-20">
                    <div className="mb-4 text-4xl">{'\ud83c\udfdc\ufe0f'}</div>
                    <div className="text-sm font-black uppercase tracking-[0.3em] italic">
                      Brak danych w tej kategorii
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};
