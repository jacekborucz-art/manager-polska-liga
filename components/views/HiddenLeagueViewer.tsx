import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Club, MatchStatus, ViewState } from '../../types';
import {
  THIRD_LEAGUE_GROUP_IDS,
  THIRD_LEAGUE_GROUP_NAMES,
  ThirdLeagueGroupId,
} from '../../services/PolishThirdLeagueService';
import { LeagueStatsService } from '../../services/LeagueStatsService';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import thirdLeagueTableBackground from '../../Graphic/themes/third-league-table-bg.svg';
import thirdLeagueLogo from '../../Graphic/logo/leagues/betclick3liga.png';

type MainTab = 'TABLE' | 'FIXTURES' | 'STATS';
type StatTab = 'GOALS' | 'ASSISTS' | 'APPEARANCES' | 'YELLOW' | 'RED' | 'CLEAN_SHEETS' | 'RATING';

const positionClass = (position: number): string => {
  if (position === 1) return 'bg-blue-600 text-white';
  if (position === 2) return 'bg-sky-500 text-white';
  if (position >= 15) return 'bg-red-600 text-white';
  return 'bg-slate-800 text-slate-300';
};

// The coloured surface sits behind the club identity instead of tinting the
// whole statistical row. This keeps every number equally readable while making
// the direct-promotion, playoff and relegation zones immediately visible.
const clubNameZoneClass = (position: number): string => {
  if (position === 1) return 'bg-blue-600/25 border-blue-400/30';
  if (position === 2) return 'bg-sky-500/20 border-sky-400/30';
  if (position >= 15) return 'bg-red-600/20 border-red-500/30';
  return 'bg-transparent border-transparent';
};

// Most screens use the central id-based asset map. The logoFile fallback also
// supports datapack clubs and older database entries which own a crest file but
// have not yet received an explicit key in ClubLogoAssets.
const clubLogoUrl = (club: Club | undefined): string | undefined => {
  if (!club) return undefined;
  return getClubLogo(club.id) ?? (club.logoFile
    ? new URL(`../../Graphic/logo/${club.logoFile}`, import.meta.url).href
    : undefined);
};

const resultLabel = (home: number | null, away: number | null): string =>
  home === null || away === null ? '–' : `${home}:${away}`;

export const HiddenLeagueViewer: React.FC = () => {
  const { clubs, players, leagueSchedules, viewClubDetails, navigateTo } = useGame();
  const [groupId, setGroupId] = useState<ThirdLeagueGroupId>('L_PL_4_G1');
  const [mainTab, setMainTab] = useState<MainTab>('TABLE');
  const [statTab, setStatTab] = useState<StatTab>('GOALS');
  const [round, setRound] = useState(1);

  const groupClubs = useMemo(() => clubs
    .filter(club => club.leagueId === groupId && club.isDefaultActive)
    .sort((a, b) =>
      b.stats.points - a.stats.points ||
      b.stats.goalDifference - a.stats.goalDifference ||
      b.stats.goalsFor - a.stats.goalsFor ||
      a.name.localeCompare(b.name, 'pl')
    ), [clubs, groupId]);

  const matchday = leagueSchedules[groupId]?.matchdays.find(item => item.roundNumber === round);
  const rows = useMemo(
    () => LeagueStatsService.getPlayersForLeague(groupId, clubs, players),
    [clubs, groupId, players]
  );
  const ranking = useMemo(() => {
    switch (statTab) {
      case 'ASSISTS': return LeagueStatsService.getTopAssists(rows, 50, groupId);
      case 'APPEARANCES': return LeagueStatsService.getAppearancesList(rows, 50, groupId);
      case 'YELLOW': return LeagueStatsService.getYellowCardsList(rows, 50, groupId);
      case 'RED': return LeagueStatsService.getRedCardsList(rows, 50, groupId);
      case 'CLEAN_SHEETS': return LeagueStatsService.getCleanSheetsList(rows, 50, groupId);
      case 'RATING': return LeagueStatsService.getAverageRatingList(rows, 50, groupId);
      default: return LeagueStatsService.getTopScorers(rows, 50, groupId);
    }
  }, [groupId, rows, statTab]);

  const valueFor = (playerId: string): string => {
    const player = ranking.find(row => row.player.id === playerId)?.player;
    const stats = player ? LeagueStatsService.getStatsForLeagueId(player, groupId) : null;
    if (!stats) return '0';
    if (statTab === 'GOALS') return String(stats.goals);
    if (statTab === 'ASSISTS') return String(stats.assists);
    if (statTab === 'APPEARANCES') return String(stats.matchesPlayed);
    if (statTab === 'YELLOW') return String(stats.yellowCards);
    if (statTab === 'RED') return String(stats.redCards);
    if (statTab === 'CLEAN_SHEETS') return String(stats.cleanSheets);
    return stats.ratingHistory.length
      ? (stats.ratingHistory.reduce((sum, rating) => sum + rating, 0) / stats.ratingHistory.length).toFixed(2)
      : '–';
  };

  return (
    <div className="relative isolate h-screen bg-[#030712] flex items-center justify-center p-3 animate-fade-in overflow-hidden text-slate-100">
      {/* The SVG is intentionally rendered as a single non-interactive layer.
          It gives every III-liga tab the same visual identity without adding
          repeated DOM effects to each of the dense table rows. */}
      <img
        src={thirdLeagueTableBackground}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 w-full h-full object-cover pointer-events-none select-none"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950/5 via-slate-950/20 to-slate-950/60 pointer-events-none" />

      {/* A separate masked layer keeps the supplied league crest recognisable
          as a watermark while removing the hard square edge of the PNG. It is
          placed below every interactive panel and never intercepts pointer or
          accessibility events. */}
      <div
        aria-hidden="true"
        className="absolute z-0 right-[2%] top-[54%] -translate-y-1/2 w-[clamp(360px,34vw,650px)] aspect-square pointer-events-none select-none opacity-[0.11]"
        style={{
          WebkitMaskImage: 'radial-gradient(circle at center, #000 34%, rgba(0,0,0,0.82) 48%, transparent 74%)',
          maskImage: 'radial-gradient(circle at center, #000 34%, rgba(0,0,0,0.82) 48%, transparent 74%)',
        }}
      >
        <img
          src={thirdLeagueLogo}
          alt=""
          className="w-full h-full object-contain mix-blend-screen saturate-[0.75] contrast-125 drop-shadow-[0_0_42px_rgba(239,68,68,0.32)]"
        />
      </div>

      {/* Header, navigation and the active league view form one centred shell.
          Keeping the shell height content-driven centres the complete interface
          vertically, while max-height and the main scrollbar protect smaller
          displays from clipping any league data. */}
      <div className="relative z-10 w-full max-w-[1500px] max-h-[calc(100vh-24px)] flex flex-col overflow-hidden rounded-[22px] border border-cyan-300/10 shadow-[0_28px_90px_rgba(2,8,23,0.58)]">
      <header className="bg-[#07111f]/72 backdrop-blur-xl border-b border-cyan-300/10 px-4 py-3 shrink-0 shadow-[0_12px_40px_rgba(2,8,23,0.45)]">
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-white/20 bg-white shadow-[0_0_28px_rgba(239,68,68,0.28)]">
              <img src={thirdLeagueLogo} alt="Logo Betclic 3. Ligi" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-black italic uppercase tracking-tighter text-2xl text-white drop-shadow-[0_2px_12px_rgba(56,189,248,0.2)]">Betclic 3. Liga</h1>
              <p className="font-black italic uppercase tracking-tighter text-[10px] text-emerald-400 mt-0.5">Sezon 2026/2027 • rozgrywki symulowane w tle</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateTo(ViewState.FOURTH_LEAGUE)}
            className="font-black italic uppercase tracking-tighter px-5 h-[42px] rounded-xl border border-cyan-300/20 bg-cyan-950/45 hover:bg-cyan-900/55 text-[11px]"
          >
            IV liga
          </button>
          <button
            type="button"
            onClick={() => navigateTo(ViewState.DASHBOARD)}
            className="group relative w-[132px] h-[42px] shrink-0 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
          >
            {/* The visible shape is fully vector-based. Separate glow and shine
                paths make hover feedback possible without introducing another
                raster button asset or conflicting with the league background. */}
            <svg viewBox="0 0 132 42" aria-hidden="true" className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                <linearGradient id="thirdLeagueExitFill" x1="8" y1="3" x2="124" y2="39" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#12233D" />
                  <stop offset="0.55" stopColor="#0B172B" />
                  <stop offset="1" stopColor="#07111F" />
                </linearGradient>
                <linearGradient id="thirdLeagueExitStroke" x1="0" y1="0" x2="132" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#67E8F9" stopOpacity="0.9" />
                  <stop offset="0.52" stopColor="#3B82F6" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#FB7185" stopOpacity="0.72" />
                </linearGradient>
                <linearGradient id="thirdLeagueExitShine" x1="20" y1="0" x2="95" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="white" stopOpacity="0" />
                  <stop offset="0.48" stopColor="white" stopOpacity="0.38" />
                  <stop offset="0.62" stopColor="#67E8F9" stopOpacity="0.16" />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <filter id="thirdLeagueExitGlow" x="-20%" y="-55%" width="140%" height="210%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <path d="M10 1H121L131 11V31L121 41H10L1 32V10L10 1Z" fill="#38BDF8" fillOpacity="0.12" filter="url(#thirdLeagueExitGlow)" className="opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
              <path d="M10 1H121L131 11V31L121 41H10L1 32V10L10 1Z" fill="url(#thirdLeagueExitFill)" stroke="url(#thirdLeagueExitStroke)" strokeWidth="1.3" />
              <path d="M11 4H118L124 10H8L11 4Z" fill="white" fillOpacity="0.06" />
              <path d="M35 2L72 2L99 40H62L35 2Z" fill="url(#thirdLeagueExitShine)" className="opacity-0 -translate-x-6 transition-all duration-500 group-hover:opacity-70 group-hover:translate-x-5" />
              <path d="M8 31V12M124 12V31" stroke="#67E8F9" strokeOpacity="0.28" strokeWidth="1" />
            </svg>
            <span className="font-black italic uppercase tracking-tighter relative z-10 text-[11px] text-slate-100 group-hover:text-white transition-colors">
              Wyjdź
            </span>
          </button>
          </div>
        </div>
      </header>

      <main className="min-h-0 overflow-y-auto custom-scrollbar p-3">
        <div className="w-full space-y-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {THIRD_LEAGUE_GROUP_IDS.map(id => (
              <button key={id} onClick={() => { setGroupId(id); setRound(1); }} className={`font-black italic uppercase tracking-tighter rounded-xl px-4 py-2.5 text-xs border backdrop-blur-md transition-all ${groupId === id ? 'bg-blue-600/90 border-blue-300/70 text-white shadow-[0_8px_26px_rgba(37,99,235,0.28),inset_0_1px_0_rgba(255,255,255,0.22)]' : 'bg-[#07111f]/72 border-white/10 text-slate-400 hover:text-white hover:border-cyan-300/25 hover:bg-[#0b1930]/80'}`}>
                {THIRD_LEAGUE_GROUP_NAMES[id]}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 bg-[#07111f]/72 backdrop-blur-xl border border-cyan-300/10 rounded-xl p-1.5 shadow-[0_10px_30px_rgba(2,8,23,0.35)]">
            {([['TABLE', 'Tabela'], ['FIXTURES', 'Mecze'], ['STATS', 'Statystyki']] as Array<[MainTab, string]>).map(([id, label]) => (
              <button key={id} onClick={() => setMainTab(id)} className={`font-black italic uppercase tracking-tighter px-5 py-1.5 rounded-lg text-[11px] transition-all ${mainTab === id ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-[0_5px_16px_rgba(225,29,72,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>{label}</button>
            ))}
          </div>

          {mainTab === 'TABLE' && (
            <section className="bg-[#07111f]/82 backdrop-blur-xl border border-cyan-300/10 rounded-2xl overflow-x-auto shadow-[0_22px_65px_rgba(2,8,23,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="grid grid-cols-[44px_minmax(340px,1fr)_repeat(8,54px)_132px] items-center h-8 bg-gradient-to-r from-cyan-950/90 via-sky-950/80 to-blue-950/85 border-b border-cyan-300/10 px-3 text-[9px] min-w-[1100px]">
                {['#', 'Drużyna', 'M', 'Z', 'R', 'P', 'BZ', 'BS', 'RB', 'Pkt', 'Forma'].map(label => <span key={label} className="font-black italic uppercase tracking-tighter text-center">{label}</span>)}
              </div>
              <div className="min-w-[1100px]">
                {groupClubs.map((club, index) => {
                  const position = index + 1;
                  const logo = clubLogoUrl(club);
                  return (
                    <button key={club.id} onClick={() => viewClubDetails(club.id)} className="w-full h-[35px] grid grid-cols-[44px_minmax(340px,1fr)_repeat(8,54px)_132px] items-center px-3 border-t border-white/[0.055] hover:bg-cyan-300/[0.045] text-xs transition-colors">
                      <span className={`font-black italic uppercase tracking-tighter w-7 h-6 rounded-md flex items-center justify-center ${positionClass(position)}`}>{position}</span>
                      <span className={`font-black italic uppercase tracking-tighter h-7 min-w-0 mr-2 px-2 rounded-lg border text-left flex items-center gap-2 ${clubNameZoneClass(position)}`}>
                        {logo
                          ? <img src={logo} alt="" className="w-6 h-6 object-contain shrink-0 drop-shadow" />
                          : <i className="w-1.5 h-5 rounded-full shrink-0" style={{ backgroundColor: club.colorsHex[0] }} />}
                        <span className="whitespace-nowrap pr-3 leading-none">{club.name}</span>
                      </span>
                      {[club.stats.played, club.stats.wins, club.stats.draws, club.stats.losses, club.stats.goalsFor, club.stats.goalsAgainst, club.stats.goalDifference, club.stats.points].map((value, valueIndex) => <span key={valueIndex} className="font-black italic uppercase tracking-tighter text-center">{value}</span>)}
                      <span className="flex justify-center gap-1">
                        {(club.stats.form ?? []).map((result, formIndex) => <i key={formIndex} className={`font-black italic uppercase tracking-tighter not-italic w-5 h-5 rounded flex items-center justify-center text-[9px] ${result === 'W' ? 'bg-emerald-500' : result === 'R' ? 'bg-amber-500' : 'bg-red-600'}`}>{result}</i>)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-cyan-300/10 bg-slate-950/24 px-4 py-2 flex flex-wrap gap-5 text-[10px] text-slate-400 min-w-[1100px]">
                <span className="font-black italic uppercase tracking-tighter"><i className="inline-block w-3 h-3 bg-blue-600 rounded mr-2" />Awans do Betclic 2. Ligi</span>
                <span className="font-black italic uppercase tracking-tighter"><i className="inline-block w-3 h-3 bg-sky-500 rounded mr-2" />Baraże o awans</span>
                <span className="font-black italic uppercase tracking-tighter"><i className="inline-block w-3 h-3 bg-red-600 rounded mr-2" />Bazowa strefa spadkowa</span>
              </div>
            </section>
          )}

          {mainTab === 'FIXTURES' && (
            <section className="bg-[#07111f]/82 backdrop-blur-xl border border-cyan-300/10 rounded-2xl overflow-hidden shadow-[0_22px_65px_rgba(2,8,23,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-950/80 via-sky-950/65 to-blue-950/75 border-b border-cyan-300/10">
                <button onClick={() => setRound(value => Math.max(1, value - 1))} className="font-black italic uppercase tracking-tighter px-4 py-2 rounded-lg bg-white/5">← Poprzednia</button>
                <div className="text-center"><h2 className="font-black italic uppercase tracking-tighter text-xl">Kolejka {round}</h2><p className="font-black italic uppercase tracking-tighter text-[10px] text-slate-500">{matchday?.start.toLocaleDateString('pl-PL') ?? 'Brak terminu'}</p></div>
                <button onClick={() => setRound(value => Math.min(34, value + 1))} className="font-black italic uppercase tracking-tighter px-4 py-2 rounded-lg bg-white/5">Następna →</button>
              </div>
              <div className="divide-y divide-white/5">
                {(matchday?.fixtures ?? []).map(fixture => {
                  const home = clubs.find(club => club.id === fixture.homeTeamId);
                  const away = clubs.find(club => club.id === fixture.awayTeamId);
                  const homeLogo = clubLogoUrl(home);
                  const awayLogo = clubLogoUrl(away);
                  return <div key={fixture.id} className="grid grid-cols-[1fr_100px_1fr] items-center gap-4 px-4 py-2.5">
                    <button onClick={() => home && viewClubDetails(home.id)} className="font-black italic uppercase tracking-tighter flex items-center justify-end gap-2 text-right hover:text-blue-400">
                      {homeLogo && <img src={homeLogo} alt="" className="w-7 h-7 object-contain shrink-0" />}
                      <span>{home?.name ?? fixture.homeTeamId}</span>
                    </button>
                    <span className={`font-black italic uppercase tracking-tighter text-center rounded-lg py-2 ${fixture.status === MatchStatus.FINISHED ? 'bg-slate-800 text-white' : 'bg-black/30 text-slate-500'}`}>{resultLabel(fixture.homeScore, fixture.awayScore)}</span>
                    <button onClick={() => away && viewClubDetails(away.id)} className="font-black italic uppercase tracking-tighter flex items-center gap-2 text-left hover:text-blue-400">
                      {awayLogo && <img src={awayLogo} alt="" className="w-7 h-7 object-contain shrink-0" />}
                      <span>{away?.name ?? fixture.awayTeamId}</span>
                    </button>
                  </div>;
                })}
              </div>
            </section>
          )}

          {mainTab === 'STATS' && (
            <section className="bg-[#07111f]/82 backdrop-blur-xl border border-cyan-300/10 rounded-2xl overflow-hidden shadow-[0_22px_65px_rgba(2,8,23,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-r from-cyan-950/80 via-sky-950/65 to-blue-950/75 border-b border-cyan-300/10">
                {([['GOALS', 'Strzelcy'], ['ASSISTS', 'Asysty'], ['APPEARANCES', 'Mecze'], ['YELLOW', 'Żółte kartki'], ['RED', 'Czerwone kartki'], ['CLEAN_SHEETS', 'Czyste konta'], ['RATING', 'Oceny']] as Array<[StatTab, string]>).map(([id, label]) => (
                  <button key={id} onClick={() => setStatTab(id)} className={`font-black italic uppercase tracking-tighter px-4 py-2 rounded-lg text-xs ${statTab === id ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}>{label}</button>
                ))}
              </div>
              <div className="divide-y divide-white/5">
                {ranking.map((row, index) => <button key={row.player.id} onClick={() => viewClubDetails(row.club.id)} className="w-full grid grid-cols-[55px_1fr_minmax(180px,1fr)_90px] items-center px-3 py-2 hover:bg-white/[0.04]">
                  <span className="font-black italic uppercase tracking-tighter text-slate-500">{index + 1}.</span>
                  <span className="font-black italic uppercase tracking-tighter text-left">{row.player.firstName} {row.player.lastName}</span>
                  <span className="font-black italic uppercase tracking-tighter flex items-center gap-2 text-left text-xs text-slate-500">
                    {clubLogoUrl(row.club) && <img src={clubLogoUrl(row.club)} alt="" className="w-6 h-6 object-contain shrink-0" />}
                    <span className="truncate">{row.club.name}</span>
                  </span>
                  <span className="font-black italic uppercase tracking-tighter text-xl text-right text-emerald-400">{valueFor(row.player.id)}</span>
                </button>)}
                {ranking.length === 0 && <p className="font-black italic uppercase tracking-tighter p-10 text-center text-slate-600">Brak danych statystycznych</p>}
              </div>
            </section>
          )}
        </div>
      </main>
      </div>
    </div>
  );
};
