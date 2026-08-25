import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Club, ViewState } from '../../types';
import {
  FOURTH_LEAGUE_IDS,
  FOURTH_LEAGUE_NAMES,
  FourthLeagueId,
  PolishFourthLeagueService,
} from '../../services/PolishFourthLeagueService';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import thirdLeagueTableBackground from '../../Graphic/themes/third-league-table-bg.svg';
import thirdLeagueLogo from '../../Graphic/logo/leagues/betclick3liga.png';

type MainTab = 'TABLE' | 'FIXTURES' | 'STATS';
type StatTab = 'GOALS' | 'ASSISTS' | 'APPEARANCES' | 'YELLOW' | 'RED' | 'RATING';

const clubLogoUrl = (club: Club | undefined): string | undefined => {
  if (!club) return undefined;
  return getClubLogo(club.id) ?? (club.logoFile
    ? new URL(`../../Graphic/logo/${club.logoFile}`, import.meta.url).href
    : undefined);
};

const positionClass = (position: number, size: number): string => {
  if (position === 1) return 'bg-blue-600 text-white';
  if (position === 2) return 'bg-sky-500 text-white';
  if (position > size - 4) return 'bg-red-600 text-white';
  return 'bg-slate-800 text-slate-300';
};

const nameZoneClass = (position: number, size: number): string => {
  if (position === 1) return 'bg-blue-600/25 border-blue-400/35';
  if (position === 2) return 'bg-sky-500/20 border-sky-400/30';
  if (position > size - 4) return 'bg-red-600/20 border-red-500/30';
  return 'bg-transparent border-transparent';
};

export const FourthLeagueViewer: React.FC = () => {
  const { clubs, fourthLeagueState, navigateTo } = useGame();
  const [leagueId, setLeagueId] = useState<FourthLeagueId>('L_PL_5_DS');
  const [tab, setTab] = useState<MainTab>('TABLE');
  const [statTab, setStatTab] = useState<StatTab>('GOALS');
  const [round, setRound] = useState(1);

  const table = useMemo(
    () => PolishFourthLeagueService.getTable(clubs, leagueId),
    [clubs, leagueId]
  );
  const fixtures = fourthLeagueState?.fixtures[leagueId] ?? [];
  const roundFixtures = fixtures.filter(fixture => fixture.round === round);
  const maxRound = fixtures.reduce((maximum, fixture) => Math.max(maximum, fixture.round), 1);
  const roundDate = roundFixtures[0]?.date ? new Date(roundFixtures[0].date) : null;
  const clubById = useMemo(() => new Map(clubs.map(club => [club.id, club])), [clubs]);
  const ranking = useMemo(() => {
    const rows = [...(fourthLeagueState?.playerStats[leagueId] ?? [])];
    const value = (row: typeof rows[number]): number => {
      if (statTab === 'ASSISTS') return row.assists;
      if (statTab === 'APPEARANCES') return row.appearances;
      if (statTab === 'YELLOW') return row.yellowCards;
      if (statTab === 'RED') return row.redCards;
      if (statTab === 'RATING') return row.appearances ? row.ratingTotal / row.appearances : 0;
      return row.goals;
    };
    return rows.sort((left, right) => value(right) - value(left) || right.appearances - left.appearances).slice(0, 50);
  }, [fourthLeagueState, leagueId, statTab]);

  const statValue = (row: typeof ranking[number]): string => {
    if (statTab === 'ASSISTS') return String(row.assists);
    if (statTab === 'APPEARANCES') return String(row.appearances);
    if (statTab === 'YELLOW') return String(row.yellowCards);
    if (statTab === 'RED') return String(row.redCards);
    if (statTab === 'RATING') return row.appearances ? (row.ratingTotal / row.appearances).toFixed(2) : '–';
    return String(row.goals);
  };

  return (
    <div className="relative isolate h-screen bg-[#030712] flex items-center justify-center p-3 overflow-hidden text-slate-100">
      <img src={thirdLeagueTableBackground} alt="" aria-hidden="true" className="absolute inset-0 -z-20 w-full h-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950/10 via-slate-950/25 to-slate-950/70" />
      <img src={thirdLeagueLogo} alt="" aria-hidden="true" className="absolute right-[3%] top-1/2 -translate-y-1/2 w-[34vw] max-w-[620px] opacity-[0.07] mix-blend-screen pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1500px] max-h-[calc(100vh-24px)] flex flex-col overflow-hidden rounded-[22px] border border-cyan-300/10 bg-[#06101d]/35 shadow-[0_28px_90px_rgba(2,8,23,0.62)]">
        <header className="px-4 py-3 bg-[#07111f]/78 backdrop-blur-xl border-b border-cyan-300/10 flex items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="font-black italic uppercase tracking-tighter text-2xl">IV liga</h1>
            <p className="font-black italic uppercase tracking-tighter text-[10px] text-emerald-400">16 lig wojewódzkich • uproszczona symulacja w tle</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigateTo(ViewState.HIDDEN_LEAGUE)} className="font-black italic uppercase tracking-tighter px-5 py-2.5 rounded-xl border border-cyan-300/20 bg-cyan-950/50 hover:bg-cyan-900/60 text-xs">III liga</button>
            <button onClick={() => navigateTo(ViewState.DASHBOARD)} className="font-black italic uppercase tracking-tighter px-5 py-2.5 rounded-xl border border-rose-300/25 bg-gradient-to-r from-slate-900 to-[#101b31] hover:border-cyan-300/50 text-xs shadow-[0_0_18px_rgba(56,189,248,0.12)]">Wyjdź</button>
          </div>
        </header>

        <main className="min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-2">
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-1.5">
            {FOURTH_LEAGUE_IDS.map(id => (
              <button key={id} onClick={() => { setLeagueId(id); setRound(1); }} className={`font-black italic uppercase tracking-tighter rounded-lg px-2 py-2 text-[9px] border transition-all ${leagueId === id ? 'bg-blue-600/90 border-blue-300/70 text-white' : 'bg-[#07111f]/78 border-white/10 text-slate-400 hover:text-white'}`}>
                {FOURTH_LEAGUE_NAMES[id].replace(/^IV liga /, '')}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 bg-[#07111f]/78 border border-cyan-300/10 rounded-xl p-1.5">
            {([['TABLE', 'Tabela'], ['FIXTURES', 'Mecze'], ['STATS', 'Statystyki']] as Array<[MainTab, string]>).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} className={`font-black italic uppercase tracking-tighter px-5 py-1.5 rounded-lg text-[11px] ${tab === id ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white' : 'text-slate-400 hover:bg-white/5'}`}>{label}</button>
            ))}
          </div>

          {tab === 'TABLE' && (
            <section className="rounded-2xl overflow-x-auto border border-cyan-300/10 bg-[#07111f]/84 backdrop-blur-xl">
              <div className="grid grid-cols-[44px_minmax(350px,1fr)_repeat(8,54px)_132px] h-8 items-center px-3 bg-gradient-to-r from-cyan-950/90 to-blue-950/85 text-[9px] min-w-[1100px]">
                {['#', 'Drużyna', 'M', 'Z', 'R', 'P', 'BZ', 'BS', 'RB', 'Pkt', 'Forma'].map(label => <span key={label} className="font-black italic uppercase tracking-tighter text-center">{label}</span>)}
              </div>
              <div className="min-w-[1100px]">
                {table.map((club, index) => {
                  const position = index + 1;
                  const logo = clubLogoUrl(club);
                  return <div key={club.id} className="h-[34px] grid grid-cols-[44px_minmax(350px,1fr)_repeat(8,54px)_132px] items-center px-3 border-t border-white/[0.055] text-xs">
                    <span className={`font-black italic uppercase tracking-tighter w-7 h-6 rounded-md flex items-center justify-center ${positionClass(position, table.length)}`}>{position}</span>
                    <span className={`font-black italic uppercase tracking-tighter h-7 min-w-0 mr-2 px-2 rounded-lg border text-left flex items-center gap-2 ${nameZoneClass(position, table.length)}`}>
                      {logo ? <img src={logo} alt="" className="w-6 h-6 object-contain shrink-0" /> : <i className="w-1.5 h-5 rounded-full shrink-0" style={{ backgroundColor: club.colorsHex[0] }} />}
                      <span className="whitespace-nowrap">{club.name}</span>
                    </span>
                    {[club.stats.played, club.stats.wins, club.stats.draws, club.stats.losses, club.stats.goalsFor, club.stats.goalsAgainst, club.stats.goalDifference, club.stats.points].map((value, valueIndex) => <span key={valueIndex} className="font-black italic uppercase tracking-tighter text-center">{value}</span>)}
                    <span className="flex justify-center gap-1">{club.stats.form.map((result, formIndex) => <i key={formIndex} className={`font-black italic uppercase tracking-tighter not-italic w-5 h-5 rounded flex items-center justify-center text-[9px] ${result === 'W' ? 'bg-emerald-500' : result === 'R' ? 'bg-amber-500' : 'bg-red-600'}`}>{result}</i>)}</span>
                  </div>;
                })}
              </div>
              <div className="font-black italic uppercase tracking-tighter px-4 py-2 border-t border-cyan-300/10 text-[9px] text-slate-400 flex gap-5 min-w-[1100px]">
                <span><i className="inline-block w-3 h-3 bg-blue-600 rounded mr-2" />Mistrz – awans do III ligi</span>
                <span><i className="inline-block w-3 h-3 bg-sky-500 rounded mr-2" />Wicemistrz – baraż</span>
                <span><i className="inline-block w-3 h-3 bg-red-600 rounded mr-2" />Orientacyjna strefa spadkowa</span>
              </div>
            </section>
          )}

          {tab === 'FIXTURES' && (
            <section className="rounded-2xl overflow-hidden border border-cyan-300/10 bg-[#07111f]/84 backdrop-blur-xl">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-950/90 to-blue-950/80">
                <button onClick={() => setRound(value => Math.max(1, value - 1))} className="font-black italic uppercase tracking-tighter px-4 py-2 rounded-lg bg-white/5">Poprzednia</button>
                <div className="text-center"><h2 className="font-black italic uppercase tracking-tighter text-lg">Kolejka {round}</h2><p className="font-black italic uppercase tracking-tighter text-[9px] text-slate-500">{roundDate?.toLocaleDateString('pl-PL') ?? 'Brak terminu'}</p></div>
                <button onClick={() => setRound(value => Math.min(maxRound, value + 1))} className="font-black italic uppercase tracking-tighter px-4 py-2 rounded-lg bg-white/5">Następna</button>
              </div>
              <div className="divide-y divide-white/5">
                {roundFixtures.map(fixture => {
                  const home = clubById.get(fixture.homeClubId);
                  const away = clubById.get(fixture.awayClubId);
                  return <div key={fixture.id} className="grid grid-cols-[1fr_90px_1fr] items-center gap-4 px-4 py-2">
                    <span className="font-black italic uppercase tracking-tighter text-right">{home?.name ?? fixture.homeClubId}</span>
                    <span className="font-black italic uppercase tracking-tighter text-center rounded-lg py-2 bg-slate-900/80">{fixture.homeGoals === null ? '–' : `${fixture.homeGoals}:${fixture.awayGoals}`}</span>
                    <span className="font-black italic uppercase tracking-tighter text-left">{away?.name ?? fixture.awayClubId}</span>
                  </div>;
                })}
              </div>
            </section>
          )}

          {tab === 'STATS' && (
            <section className="rounded-2xl overflow-hidden border border-cyan-300/10 bg-[#07111f]/84 backdrop-blur-xl">
              <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-r from-cyan-950/90 to-blue-950/80">
                {([['GOALS', 'Strzelcy'], ['ASSISTS', 'Asysty'], ['APPEARANCES', 'Mecze'], ['YELLOW', 'Żółte kartki'], ['RED', 'Czerwone kartki'], ['RATING', 'Oceny']] as Array<[StatTab, string]>).map(([id, label]) => <button key={id} onClick={() => setStatTab(id)} className={`font-black italic uppercase tracking-tighter px-4 py-2 rounded-lg text-xs ${statTab === id ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}>{label}</button>)}
              </div>
              <div className="divide-y divide-white/5">
                {ranking.map((row, index) => <div key={row.id} className="grid grid-cols-[55px_1fr_minmax(180px,1fr)_90px] items-center px-3 py-2">
                  <span className="font-black italic uppercase tracking-tighter text-slate-500">{index + 1}.</span>
                  <span className="font-black italic uppercase tracking-tighter">{row.name}</span>
                  <span className="font-black italic uppercase tracking-tighter text-xs text-slate-500">{clubById.get(row.clubId)?.name ?? row.clubId}</span>
                  <span className="font-black italic uppercase tracking-tighter text-xl text-right text-emerald-400">{statValue(row)}</span>
                </div>)}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
