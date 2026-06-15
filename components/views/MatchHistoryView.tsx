
import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState, MatchHistoryEntry, MatchEventType, CompetitionType, WCState, Club, NationalTeam, NationsLeagueState, UefaNationalRankingState } from '../../types';
import { MatchHistoryService } from '../../services/MatchHistoryService';
import { ChampionshipHistoryService } from '../../data/championship_history';
import { RefereeService } from '../../services/RefereeService';
import { computeGroupStandings } from '../../services/WorldCupService';
import { UefaNationalRankingService } from '../../services/UefaNationalRankingService';
import historiaBg from '../../Graphic/themes/historia.png';
import { PolishCupVenueService } from '../../services/PolishCupVenueService';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { MatchReportModalPolishLeague } from '../modals/MatchReportModalPolishLeague';

const WC_ROUND_LABEL: Record<string, string> = {
  R32: '1/16 Finału',
  R16: '1/8 Finału',
  QF: 'Ćwierćfinał',
  SF: 'Półfinał',
  THIRD: 'O 3. miejsce',
  FINAL: 'Finał',
};

const getTeamLogoUrl = (team?: Club | NationalTeam) => {
  if (!team) return null;
  return getClubLogo(team.id) ?? (team.logoFile ? new URL(`../../Graphic/logo/${team.logoFile}`, import.meta.url).href : null);
};

const TeamMark: React.FC<{ team?: Club | NationalTeam; className?: string }> = ({ team, className = 'w-9 h-9' }) => {
  const logo = getTeamLogoUrl(team);

  if (logo) {
    return <img src={logo} alt="" className={`${className} object-contain shrink-0 drop-shadow-lg`} />;
  }

  const colors = team?.colorsHex ?? ['#64748b', '#1e293b'];
  return (
    <div className={`${className} rounded-xl border border-white/10 flex flex-col overflow-hidden shrink-0 shadow-lg`}>
      <div className="flex-1" style={{ backgroundColor: colors[0] ?? '#64748b' }} />
      <div className="flex-1" style={{ backgroundColor: colors[1] ?? colors[0] ?? '#1e293b' }} />
    </div>
  );
};

function WorldCupArchive({ wcState }: { wcState: WCState | null }) {
  if (!wcState) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-30">
        <span className="text-7xl mb-6">🏆</span>
        <p className="text-xl font-black uppercase tracking-[0.4em] italic text-center">Brak danych MŚ</p>
      </div>
    );
  }

  const rounds: Array<'R32' | 'R16' | 'QF' | 'SF' | 'THIRD' | 'FINAL'> = ['R32', 'R16', 'QF', 'SF', 'THIRD', 'FINAL'];

  return (
    <div className="p-8 space-y-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.45em]">Mistrzostwa Świata</p>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">{wcState.year}</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</p>
          <p className="text-sm font-black uppercase text-white">
            {wcState.knockoutComplete ? 'Turniej zakończony' : wcState.groupStageComplete ? 'Faza pucharowa' : 'Faza grupowa'}
          </p>
          {wcState.champion && <p className="text-xs font-bold text-amber-300 mt-1">Mistrz: {wcState.champion}</p>}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-6 mb-5 px-2">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] whitespace-nowrap">Grupy</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>
        <div className="grid grid-cols-1 gap-5">
          {wcState.groups.map(group => {
            const standings = computeGroupStandings(group);
            return (
              <div key={group.label} className="bg-slate-900/40 rounded-3xl border border-white/10 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black italic uppercase tracking-tight text-white">Grupa {group.label}</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{group.matches.length} meczów</span>
                </div>

                <table className="w-full text-xs mb-5">
                  <thead>
                    <tr className="text-white/35 uppercase">
                      <th className="text-left pb-2">Drużyna</th>
                      <th className="w-8 text-center">M</th>
                      <th className="w-8 text-center">W</th>
                      <th className="w-8 text-center">R</th>
                      <th className="w-8 text-center">P</th>
                      <th className="w-14 text-center">B</th>
                      <th className="w-10 text-center text-white/60">Pkt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, idx) => (
                      <tr key={s.name} className={`border-t border-white/5 ${idx < 2 ? 'text-white' : 'text-white/45'}`}>
                        <td className="py-2 font-bold">
                          <span className={`inline-block w-5 mr-2 text-center ${idx < 2 ? 'text-amber-300' : 'text-white/25'}`}>{idx + 1}</span>
                          {s.name}
                        </td>
                        <td className="text-center">{s.M}</td>
                        <td className="text-center">{s.W}</td>
                        <td className="text-center">{s.D}</td>
                        <td className="text-center">{s.L}</td>
                        <td className="text-center">{s.GF}:{s.GA}</td>
                        <td className="text-center font-black text-white">{s.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="space-y-2">
                  {group.matches.length > 0 ? group.matches.map((match, idx) => (
                    <div key={`${group.label}-${idx}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl bg-black/25 border border-white/5 px-4 py-3">
                      <span className="text-right text-[10px] font-black uppercase text-slate-300 truncate">{match.home}</span>
                      <span className="min-w-[72px] text-center font-mono text-sm font-black text-emerald-300">{match.homeGoals}:{match.awayGoals}</span>
                      <span className="text-left text-[10px] font-black uppercase text-slate-300 truncate">{match.away}</span>
                      <span className="col-span-3 text-center text-[9px] font-bold uppercase tracking-widest text-white/25">{match.date}</span>
                    </div>
                  )) : (
                    <div className="rounded-2xl bg-black/20 border border-white/5 px-4 py-5 text-center text-[10px] font-black uppercase tracking-widest text-white/25">
                      Mecze nie zostały jeszcze rozegrane
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-6 mb-5 px-2">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.5em] whitespace-nowrap">Faza pucharowa</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>
        {wcState.knockoutMatches.length > 0 ? (
          <div className="space-y-7">
            {rounds.map(round => {
              const matches = wcState.knockoutMatches.filter(match => match.round === round);
              if (matches.length === 0) return null;
              return (
                <div key={round} className="bg-slate-900/30 rounded-3xl border border-white/10 p-5">
                  <h3 className="text-lg font-black italic uppercase tracking-tight text-white mb-4">{WC_ROUND_LABEL[round]}</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {matches.map(match => (
                      <div key={match.id} className="rounded-2xl bg-black/25 border border-white/5 px-4 py-4">
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                          <span className={`text-right text-[10px] font-black uppercase truncate ${match.winner === match.home ? 'text-white' : 'text-slate-500'}`}>{match.home ?? 'TBD'}</span>
                          <span className="min-w-[92px] text-center font-mono text-sm font-black text-emerald-300">
                            {match.winner ? `${match.homeGoals ?? 0}:${match.awayGoals ?? 0}` : '-:-'}
                          </span>
                          <span className={`text-left text-[10px] font-black uppercase truncate ${match.winner === match.away ? 'text-white' : 'text-slate-500'}`}>{match.away ?? 'TBD'}</span>
                        </div>
                        {(match.wentToET || match.wentToPenalties || match.winner) && (
                          <div className="mt-2 text-center text-[9px] font-bold uppercase tracking-widest text-white/35">
                            {match.winner && <>Zwycięzca: <span className="text-amber-300">{match.winner}</span></>}
                            {match.wentToET && <span> · po dogr.</span>}
                            {match.wentToPenalties && <span> · k. {match.homePenalties}:{match.awayPenalties}</span>}
                          </div>
                        )}
                        <div className="mt-2 text-center text-[9px] font-bold uppercase tracking-widest text-white/20">{match.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl bg-black/20 border border-white/5 px-6 py-14 text-center text-sm font-black uppercase tracking-[0.25em] text-white/25">
            Drabinka zostanie wygenerowana po fazie grupowej
          </div>
        )}
      </div>
    </div>
  );
}

function NationsLeagueArchive({
  state,
  history,
  nationalTeams,
  onSelectMatch,
}: {
  state: NationsLeagueState | null;
  history: MatchHistoryEntry[];
  nationalTeams: NationalTeam[];
  onSelectMatch: (match: MatchHistoryEntry) => void;
}) {
  const ntById = new Map(nationalTeams.map(team => [team.id, team]));
  const matches = history
    .filter(match => String(match.competition).includes('Liga Narodów UEFA'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!state) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-30">
        <span className="text-7xl mb-6">UNL</span>
        <p className="text-xl font-black uppercase tracking-[0.4em] italic text-center">Liga Narodów ruszy w sezonie 2026/27</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.45em]">Liga Narodów UEFA</p>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">{state.editionLabel}</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</p>
          <p className="text-sm font-black uppercase text-white">
            {state.completed ? 'Zakończona' : state.stage === 'LEAGUE_PHASE' ? 'Faza ligowa' : state.stage === 'QUARTER_FINALS' ? 'Ćwierćfinały' : 'Finały'}
          </p>
          {state.finals?.champion && <p className="text-xs font-bold text-amber-300 mt-1">Zwycięzca: {state.finals.champion}</p>}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-6 mb-5 px-2">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] whitespace-nowrap">Tabele</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {state.groups.map(group => (
            <div key={group.id} className="bg-slate-900/40 rounded-3xl border border-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black italic uppercase tracking-tight text-white">Liga {group.tier} · Grupa {group.id}</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{group.teams.length} drużyny</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/35 uppercase">
                    <th className="text-left pb-2">Drużyna</th>
                    <th className="w-8 text-center">M</th>
                    <th className="w-8 text-center">W</th>
                    <th className="w-8 text-center">R</th>
                    <th className="w-8 text-center">P</th>
                    <th className="w-14 text-center">B</th>
                    <th className="w-10 text-center text-white/60">Pkt</th>
                  </tr>
                </thead>
                <tbody>
                  {group.standings.map((row, idx) => (
                    <tr key={row.teamName} className={`border-t border-white/5 ${idx === 0 ? 'text-amber-300' : idx === group.standings.length - 1 ? 'text-rose-300/70' : 'text-white/70'}`}>
                      <td className="py-2 font-bold">
                        <span className="inline-block w-5 mr-2 text-center text-white/25">{idx + 1}</span>
                        {row.teamName}
                      </td>
                      <td className="text-center">{row.played}</td>
                      <td className="text-center">{row.wins}</td>
                      <td className="text-center">{row.draws}</td>
                      <td className="text-center">{row.losses}</td>
                      <td className="text-center">{row.goalsFor}:{row.goalsAgainst}</td>
                      <td className="text-center font-black text-white">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-6 mb-5 px-2">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em] whitespace-nowrap">Rozegrane mecze</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>
        <div className="grid grid-cols-1 gap-3">
          {matches.length > 0 ? matches.map(match => {
            const home = ntById.get(match.homeTeamId);
            const away = ntById.get(match.awayTeamId);
            return (
              <button
                key={match.matchId}
                onClick={() => onSelectMatch(match)}
                className="group relative p-5 bg-slate-900/40 rounded-3xl border border-white/5 hover:border-white/20 cursor-pointer flex justify-between items-center transition-all duration-300 hover:scale-[1.005]"
              >
                <div className="flex-1 flex justify-center items-center gap-8">
                  <div className="flex items-center gap-3 w-64 justify-end">
                    <TeamMark team={home} />
                    <span className="truncate uppercase italic font-black text-base text-slate-300 group-hover:text-white transition-colors">{home?.name ?? match.homeTeamId}</span>
                  </div>
                  <div className="bg-black/60 px-6 py-3 rounded-2xl text-emerald-400 font-mono text-xl shadow-inner min-w-[100px] text-center border border-white/10 group-hover:border-cyan-500/30 transition-all tabular-nums">
                    {match.homeScore} <span className="text-slate-700 mx-1">:</span> {match.awayScore}
                  </div>
                  <div className="flex items-center gap-3 w-64 justify-start">
                    <span className="truncate uppercase italic font-black text-base text-slate-300 group-hover:text-white transition-colors">{away?.name ?? match.awayTeamId}</span>
                    <TeamMark team={away} />
                  </div>
                </div>
              </button>
            );
          }) : (
            <div className="rounded-3xl bg-black/20 border border-white/5 px-6 py-14 text-center text-sm font-black uppercase tracking-[0.25em] text-white/25">
              Mecze Ligi Narodów nie zostały jeszcze rozegrane
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const COUNTRY_CODE_MAP: Record<string, string> = {
  'Portugalia': 'pt', 'Hiszpania': 'es', 'Francja': 'fr', 'Niemcy': 'de',
  'Holandia': 'nl', 'Włochy': 'it', 'Dania': 'dk', 'Chorwacja': 'hr',
  'Anglia': 'gb-eng', 'Belgia': 'be', 'Turcja': 'tr', 'Serbia': 'rs',
  'Norwegia': 'no', 'Walia': 'gb-wls', 'Grecja': 'gr', 'Czechy': 'cz',
  'Szwajcaria': 'ch', 'Austria': 'at', 'Szkocja': 'gb-sct', 'Ukraina': 'ua',
  'Szwecja': 'se', 'Polska': 'pl', 'Węgry': 'hu', 'Rumunia': 'ro',
  'Bośnia i Hercegowina': 'ba', 'Irlandia': 'ie', 'Izrael': 'il',
  'Słowenia': 'si', 'Gruzja': 'ge', 'Albania': 'al',
  'Macedonia Północna': 'mk', 'Kosovo': 'xk', 'Słowacja': 'sk',
  'Irlandia Północna': 'gb-nir', 'Bułgaria': 'bg', 'Islandia': 'is',
  'Finlandia': 'fi', 'Czarnogóra': 'me', 'Armenia': 'am',
  'Białoruś': 'by', 'Luksemburg': 'lu', 'Wyspy Owcze': 'fo',
  'Kazachstan': 'kz', 'Estonia': 'ee', 'Cypr': 'cy', 'Litwa': 'lt',
  'Łotwa': 'lv', 'Mołdawia': 'md', 'Azerbejdżan': 'az', 'Malta': 'mt',
  'Andora': 'ad', 'Gibraltar': 'gi', 'Liechtenstein': 'li', 'San Marino': 'sm',
};

function UefaNationalRankingArchive({
  state,
  nationalTeams,
}: {
  state: UefaNationalRankingState | null;
  nationalTeams: NationalTeam[];
}) {
  const ranking = UefaNationalRankingService.ensureState(state, nationalTeams);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.45em]">Ranking UEFA reprezentacji</p>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Europa</h2>
        </div>
        <div className="text-right max-w-xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Źródło startowe</p>
          <p className="text-xs font-bold text-white/60">{ranking.source}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/50 overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_90px_90px_110px_90px] gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/35 border-b border-white/10">
          <span>Pozycja</span>
          <span>Reprezentacja</span>
          <span className="text-center">Zmiana</span>
          <span className="text-center">Liga</span>
          <span className="text-right">Punkty</span>
          <span className="text-right">Ostatnio</span>
        </div>
        <div className="divide-y divide-white/5">
          {ranking.entries.map(entry => {
            const movement = (entry.previousRank ?? entry.rank) - entry.rank;
            return (
              <div key={entry.teamName} className="grid grid-cols-[80px_1fr_90px_90px_110px_90px] gap-3 px-5 py-3 items-center text-sm text-white/75 hover:bg-white/[0.03] transition-colors">
                <span className="font-mono text-white/45">#{entry.rank}</span>
                <div className="flex items-center gap-3 min-w-0">
                  {COUNTRY_CODE_MAP[entry.teamName] && (
                    <img
                      src={`https://flagcdn.com/20x15/${COUNTRY_CODE_MAP[entry.teamName]}.png`}
                      alt=""
                      className="shrink-0 rounded-sm"
                      style={{ width: 24, height: 18 }}
                    />
                  )}
                  <span className="truncate font-black italic uppercase tracking-tighter text-white">{entry.teamName}</span>
                </div>
                <span className={`text-center font-black ${movement > 0 ? 'text-emerald-400' : movement < 0 ? 'text-rose-400' : 'text-white/25'}`}>
                  {movement > 0 ? `+${movement}` : movement}
                </span>
                <span className="text-center">
                  <span className="inline-flex min-w-8 justify-center rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-black text-cyan-300">{entry.leagueTier ?? '-'}</span>
                </span>
                <span className="text-right font-mono text-white">{entry.points}</span>
                <span className={`text-right font-mono ${entry.lastDelta ? 'text-emerald-300' : 'text-white/25'}`}>
                  {entry.lastDelta ? `+${entry.lastDelta}` : '0'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


export const MatchHistoryView: React.FC = () => {
  const { navigateTo, clubs, nationalTeams, seasonNumber, supercupWinners, viewClubDetails, viewPlayerDetails, viewRefereeDetails, players, wcState, nationsLeagueState, uefaNationalRankingState } = useGame();
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const [selectedSeason, setSelectedSeason] = useState<number>(seasonNumber);
  const [selectedMatch, setSelectedMatch] = useState<MatchHistoryEntry | null>(null);
  const [viewMode, setViewMode] = useState<'matches' | 'champions' | 'worldCup' | 'nationsLeague' | 'uefaRanking'>('matches');
  const [selectedWorldCupYear, setSelectedWorldCupYear] = useState<number>(wcState?.year ?? 2026);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const history = useMemo(() => MatchHistoryService.getAll(), [refreshTrigger]);
  const championshipHistory = useMemo(() => ChampionshipHistoryService.getAll(), [refreshTrigger, supercupWinners]);
  
  // SUPERPUCHAR POLSKI - ostatni mecz turnieju
  const supercupWinnersFromMatches = useMemo(() => {
    const supercupMatches = history.filter(m => 
      m.competition === CompetitionType.SUPER_CUP &&
      m.homeScore !== null
    );
    
    const winners: Record<string, any> = {};
    supercupMatches.forEach(match => {
      let winnerId: string | null = null;
      
      if (match.homeScore > match.awayScore) {
        winnerId = match.homeTeamId;
      } else if (match.awayScore > match.homeScore) {
        winnerId = match.awayTeamId;
      } else if (match.homePenaltyScore !== undefined && match.awayPenaltyScore !== undefined) {
        winnerId = match.homePenaltyScore > match.awayPenaltyScore ? match.homeTeamId : match.awayTeamId;
      }
      
      if (winnerId) {
        const winnerClub = clubs.find(c => c.id === winnerId);
        if (winnerClub) {
          const date = new Date(match.date);
          const month = date.getMonth();
          const year = date.getFullYear();
          const seasonStart = month >= 6 ? year : year - 1;
          const seasonKey = `${seasonStart}/${seasonStart + 1}`;
          
          winners[seasonKey] = {
            season: seasonKey,
            winner: winnerClub.name,
            year: seasonStart + 1
          };
        }
      }
    });
    
    const result = Object.values(winners);
    console.log('⚡ Superpuchar winners:', result);
    return result;
  }, [history, clubs]);

  // EKSTRAKLASA - Zwycięzca sezonu z localStorage
  const ekstraklasaWinner = useMemo(() => {
    try {
      const stored = localStorage?.getItem('fm_championship_history');
      const history = stored ? JSON.parse(stored) : [];
      const winners = history
        .filter((c: any) => c.competition === 'EKSTRAKLASA')
        .sort((a: any, b: any) => b.year - a.year);
      console.log('🥇 Ekstraklasa winners:', winners);
      return winners;
    } catch (e) {
      console.error('Failed to load Ekstraklasa winners:', e);
      return [];
    }
  }, [refreshTrigger]);

  // PUCHAR POLSKI - Ostatni mecz (finał)
  const pucharWinner = useMemo(() => {
    const cupMatches = history.filter(m => 
      m.competition.includes('PUCHAR') && 
      !m.competition.includes('SUPER') &&
      m.homeScore !== null
    );
    
    const winners: Record<string, any> = {};
    cupMatches.forEach(match => {
      let winnerId: string | null = null;
      
      if (match.homeScore > match.awayScore) {
        winnerId = match.homeTeamId;
      } else if (match.awayScore > match.homeScore) {
        winnerId = match.awayTeamId;
      } else if (match.homePenaltyScore !== undefined && match.awayPenaltyScore !== undefined) {
        winnerId = match.homePenaltyScore > match.awayPenaltyScore ? match.homeTeamId : match.awayTeamId;
      }
      
      if (winnerId) {
        const winnerClub = clubs.find(c => c.id === winnerId);
        if (winnerClub) {
          const date = new Date(match.date);
          const month = date.getMonth();
          const year = date.getFullYear();
          const seasonStart = month >= 6 ? year : year - 1;
          const seasonKey = `${seasonStart}/${seasonStart + 1}`;
          
          winners[seasonKey] = {
            season: seasonKey,
            winner: winnerClub.name,
            year: seasonStart + 1
          };
        }
      }
    });
    
    const result = Object.values(winners);
    console.log('🏆 Puchar Polski winners:', result);
    return result;
  }, [history, clubs]);

  // LIGA MISTRZÓW - Finał (ostatni mecz CL_FINAL)
  const clWinner = useMemo(() => {
    const clMatches = history.filter(m => 
      m.competition.includes('LIGA_MISTRZOW') || m.competition.includes('FINAL') &&
      m.homeScore !== null
    );
    
    const winners: Record<string, any> = {};
    clMatches.forEach(match => {
      let winnerId: string | null = null;
      let runnerId: string | null = null;
      
      if (match.homeScore > match.awayScore) {
        winnerId = match.homeTeamId;
        runnerId = match.awayTeamId;
      } else if (match.awayScore > match.homeScore) {
        winnerId = match.awayTeamId;
        runnerId = match.homeTeamId;
      } else if (match.homePenaltyScore !== undefined && match.awayPenaltyScore !== undefined) {
        winnerId = match.homePenaltyScore > match.awayPenaltyScore ? match.homeTeamId : match.awayTeamId;
        runnerId = match.homePenaltyScore > match.awayPenaltyScore ? match.awayTeamId : match.homeTeamId;
      }
      
      if (winnerId && runnerId) {
        const winnerClub = clubs.find(c => c.id === winnerId);
        const runnerClub = clubs.find(c => c.id === runnerId);
        
        if (winnerClub && runnerClub) {
          const date = new Date(match.date);
          const year = date.getFullYear();
          const seasonStart = year;
          const seasonKey = `${seasonStart}/${seasonStart + 1}`;
          
          winners[seasonKey] = {
            season: seasonKey,
            winner: winnerClub.name,
            runnerUp: runnerClub.name,
            year: seasonStart + 1
          };
        }
      }
    });
    
    const result = Object.values(winners).sort((a, b) => b.year - a.year);
    console.log('⭐ Liga Mistrzów:', result);
    return result;
  }, [history, clubs]);

  // LIGA EUROPY - Finał
  const elWinner = useMemo(() => {
    const matches = history.filter(m =>
      m.competition === 'EL_FINAL' &&
      m.homeScore !== null
    );
    const winners: Record<string, any> = {};
    matches.forEach(match => {
      let winnerId: string | null = null;
      let runnerId: string | null = null;
      if (match.homeScore > match.awayScore) { winnerId = match.homeTeamId; runnerId = match.awayTeamId; }
      else if (match.awayScore > match.homeScore) { winnerId = match.awayTeamId; runnerId = match.homeTeamId; }
      else if (match.homePenaltyScore !== undefined && match.awayPenaltyScore !== undefined) {
        const hw = match.homePenaltyScore > match.awayPenaltyScore;
        winnerId = hw ? match.homeTeamId : match.awayTeamId;
        runnerId = hw ? match.awayTeamId : match.homeTeamId;
      }
      if (winnerId && runnerId) {
        const winnerClub = clubs.find(c => c.id === winnerId);
        const runnerClub = clubs.find(c => c.id === runnerId);
        if (winnerClub && runnerClub) {
          const date = new Date(match.date);
          const year = date.getFullYear();
          const seasonKey = `${year}/${year + 1}`;
          winners[seasonKey] = { season: seasonKey, winner: winnerClub.name, runnerUp: runnerClub.name, year: year + 1 };
        }
      }
    });
    return Object.values(winners).sort((a, b) => b.year - a.year);
  }, [history, clubs]);

  // LIGA KONFERENCJI - Finał
  const confWinner = useMemo(() => {
    const matches = history.filter(m =>
      m.competition === 'CONF_FINAL' &&
      m.homeScore !== null
    );
    const winners: Record<string, any> = {};
    matches.forEach(match => {
      let winnerId: string | null = null;
      let runnerId: string | null = null;
      if (match.homeScore > match.awayScore) { winnerId = match.homeTeamId; runnerId = match.awayTeamId; }
      else if (match.awayScore > match.homeScore) { winnerId = match.awayTeamId; runnerId = match.homeTeamId; }
      else if (match.homePenaltyScore !== undefined && match.awayPenaltyScore !== undefined) {
        const hw = match.homePenaltyScore > match.awayPenaltyScore;
        winnerId = hw ? match.homeTeamId : match.awayTeamId;
        runnerId = hw ? match.awayTeamId : match.homeTeamId;
      }
      if (winnerId && runnerId) {
        const winnerClub = clubs.find(c => c.id === winnerId);
        const runnerClub = clubs.find(c => c.id === runnerId);
        if (winnerClub && runnerClub) {
          const date = new Date(match.date);
          const year = date.getFullYear();
          const seasonKey = `${year}/${year + 1}`;
          winners[seasonKey] = { season: seasonKey, winner: winnerClub.name, runnerUp: runnerClub.name, year: year + 1 };
        }
      }
    });
    return Object.values(winners).sort((a, b) => b.year - a.year);
  }, [history, clubs]);

  // SUPERPUCHAR EUROPY - zwycięzcy z historii meczów
  const uefaSupercupWinner = useMemo(() => {
    const matches = history.filter(m =>
      m.competition === CompetitionType.UEFA_SUPER_CUP &&
      m.homeScore !== null
    );

    const winners: Record<string, any> = {};
    matches.forEach(match => {
      let winnerId: string | null = null;
      let loserId: string | null = null;

      if (match.homeScore > match.awayScore) {
        winnerId = match.homeTeamId;
        loserId = match.awayTeamId;
      } else if (match.awayScore > match.homeScore) {
        winnerId = match.awayTeamId;
        loserId = match.homeTeamId;
      } else if (match.homePenaltyScore !== undefined && match.awayPenaltyScore !== undefined) {
        const homeWins = match.homePenaltyScore > match.awayPenaltyScore;
        winnerId = homeWins ? match.homeTeamId : match.awayTeamId;
        loserId = homeWins ? match.awayTeamId : match.homeTeamId;
      }

      if (winnerId) {
        const winnerClub = clubs.find(c => c.id === winnerId);
        const loserClub = loserId ? clubs.find(c => c.id === loserId) : null;
        if (winnerClub) {
          const date = new Date(match.date);
          const month = date.getMonth();
          const year = date.getFullYear();
          const seasonStart = month >= 6 ? year : year - 1;
          const seasonKey = `${seasonStart}/${seasonStart + 1}`;
          winners[seasonKey] = {
            season: seasonKey,
            winner: winnerClub.name,
            runnerUp: loserClub?.name ?? '-',
            year: seasonStart + 1
          };
        }
      }
    });

    return Object.values(winners).sort((a, b) => b.year - a.year);
  }, [history, clubs]);

  // Odśwież dane gdy komponent się montuje
  useEffect(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Odśwież dane gdy przełączamy na widok zwycięzców
  useEffect(() => {
    if (viewMode === 'champions') {
      setRefreshTrigger(prev => prev + 1);
    }
  }, [viewMode]);

  // Odśwież dane gdy zmienią się supercupWinners
  useEffect(() => {
    setRefreshTrigger(prev => prev + 1);
  }, [supercupWinners]);

  useEffect(() => {
    if (wcState) setSelectedWorldCupYear(wcState.year);
  }, [wcState?.year]);
  
  const groupedHistory = useMemo(() => {
    const base = history.filter(m => {
      const matchSeason = m.season === selectedSeason;
      if (selectedLeague === 'ALL') return matchSeason;
      
  // Superpuchar i Puchar Polski pod jednym filtrem pucharowym
      if (selectedLeague === 'POLISH_CUP') {
        return matchSeason && (
          m.competition.includes('CUP') || 
          m.competition.includes('PUCHAR') || 
          m.competition.includes('SUPER')
        );
      }
      
      if (selectedLeague === 'CL') return matchSeason && m.competition.startsWith('CL_');
      if (selectedLeague === 'EL') return matchSeason && m.competition.startsWith('EL_');
      if (selectedLeague === 'CONF') return matchSeason && m.competition.startsWith('CONF_');
      if (selectedLeague === 'NT') return matchSeason && (nationalTeams.some(t => t.id === m.homeTeamId) || nationalTeams.some(t => t.id === m.awayTeamId));
      if (selectedLeague === 'FRIENDLY') return matchSeason && m.competition === 'FRIENDLY';

      return matchSeason && m.competition === selectedLeague;
    });
    
    const groups: { label: string, matches: MatchHistoryEntry[] }[] = [];
    const map = new Map<string, MatchHistoryEntry[]>();

    const newestFirst = [...base].reverse();

    newestFirst.forEach(m => {
      const key = `${m.competition}_${m.date}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });

   map.forEach((matches, key) => {
  let compName = 'NIEZNANE ROZGRYWKI';

  const comp = matches[0].competition;

  if (comp.includes('L_PL_1')) compName = 'EKSTRAKLASA';
  else if (comp.includes('L_PL_2')) compName = '1. LIGA';
  else if (comp.includes('L_PL_3')) compName = '2. LIGA';
  else if (comp === CompetitionType.UEFA_SUPER_CUP || comp.includes('UEFA_SUPER_CUP')) {
    compName = 'SUPERPUCHAR EUROPY';
  } else if (comp === CompetitionType.POLISH_CUP || comp.includes('POLISH_CUP') || comp.includes('CUP')) {
    compName = 'PUCHAR POLSKI';
  } else if (comp === CompetitionType.SUPER_CUP || comp.includes('SUPER_CUP')) {
    compName = 'SUPERPUCHAR POLSKI';
  } else if (comp.startsWith('CL_')) compName = 'LIGA MISTRZÓW';
  else if (comp.startsWith('EL_')) compName = 'LIGA EUROPY';
  else if (comp.startsWith('CONF_')) compName = 'LIGA KONFERENCJI';  else if (comp === 'FRIENDLY' || comp === CompetitionType.FRIENDLY) compName = 'MECZ TOWARZYSKI';  else if (nationalTeams.some(t => t.id === matches[0].homeTeamId) || nationalTeams.some(t => t.id === matches[0].awayTeamId)) compName = comp;

  // Dodaj datę do labelu (opcjonalnie, ale czytelniej)
  const rawDate = matches[0].date;
  const parsedDate = new Date(rawDate);
  const formattedDate = isNaN(parsedDate.getTime())
    ? rawDate
    : parsedDate.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  groups.push({
    label: `${compName} • ${formattedDate}`,
    matches
  });
});

    return groups; 
  }, [history, selectedLeague, selectedSeason, nationalTeams]);

  const getClub = (id: string) => clubs.find(c => c.id === id) || nationalTeams.find(t => t.id === id);
  const filterButtonClass = (isActive: boolean) => `group relative w-full h-14 rounded-xl overflow-hidden border text-center transition-all duration-300 hover:-translate-y-0.5 active:translate-y-[2px] before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-transform before:duration-500 hover:before:translate-x-full ${
    isActive
      ? 'bg-slate-900 border-white/20 shadow-2xl scale-[1.02] text-white'
      : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/10 hover:bg-slate-900/60 hover:text-slate-200 hover:shadow-[0_10px_24px_rgba(59,130,246,0.22)]'
  }`;
  const filterItems = [
    { id: 'ALL', label: 'WSZYSTKO', code: 'ALL', accent: '#3b82f6' },
    { id: 'L_PL_1', label: 'EKSTRAKLASA', code: 'EKS', accent: '#facc15' },
    { id: 'L_PL_2', label: '1. LIGA', code: '1L', accent: '#38bdf8' },
    { id: 'L_PL_3', label: '2. LIGA', code: '2L', accent: '#fb923c' },
    { id: 'POLISH_CUP', label: 'PUCHAR POLSKI', code: 'PP', accent: '#ef4444' },
    { id: 'CL', label: 'LIGA MISTRZÓW', code: 'CL', accent: '#60a5fa' },
    { id: 'EL', label: 'PUCHAR LIGI EUROPY', code: 'EL', accent: '#f97316' },
    { id: 'CONF', label: 'PUCHAR LIGI KONFERENCJI', code: 'LK', accent: '#22c55e' },
    { id: 'NT', label: 'MECZE MIĘDZYNARODOWE', code: 'NT', accent: '#14b8a6' },
    { id: 'FRIENDLY', label: 'MECZE TOWARZYSKIE', code: 'FR', accent: '#a78bfa' }
  ];

  return (
    <>
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-cover bg-center scale-105 opacity-60" style={{ backgroundImage: `url(${historiaBg})` }} />
      <div className="absolute inset-0 bg-black/85" />
    </div>
    <div className="h-[calc(100vh-3rem)] max-w-[1400px] mx-auto flex flex-col gap-4 animate-fade-in text-white">
      {/* HEADER */}
      <div className="relative flex items-center justify-between px-8 py-5 bg-white/25 rounded-[32px] border border-white/10 shrink-0 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner">📜</div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Historia wyników</h1>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">ARCHIWUM ROZGRYWEK</p>
          </div>
        </div>
        <button
          onClick={() => navigateTo(ViewState.DASHBOARD)}
          className="relative overflow-hidden px-8 py-3 rounded-2xl bg-white/5 border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 text-xs font-black uppercase tracking-widest text-center hover:bg-white/10 hover:border-white/30 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(59,130,246,0.22)] transition-all active:translate-y-[2px] before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-transform before:duration-500 hover:before:translate-x-full"
          style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)' }}
        >
          &larr; Wyjdź
        </button>
      </div>

      <div className="relative flex-1 flex gap-6 min-h-0">
        {/* SIDEBAR FILTERS */}
        <div className="w-64 flex flex-col gap-1.5 shrink-0 bg-slate-900/40 rounded-[35px] border border-white/5 p-3">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 px-2">Kategorie</span>
            <button
              onClick={() => { setViewMode('champions'); setSelectedLeague('ALL'); }}
              className={filterButtonClass(viewMode === 'champions')}
            >
              <div className="absolute right-[-5px] top-[-5px] text-4xl font-black italic text-white/[0.03] select-none group-hover:text-white/[0.06] transition-colors">WIN</div>
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-400" />
              <div className={`absolute inset-0 transition-opacity pointer-events-none ${viewMode === 'champions' ? 'opacity-10' : 'opacity-0 group-hover:opacity-5'}`} style={{ background: 'linear-gradient(90deg, #facc15, transparent)' }} />
              <div className="relative z-10 flex h-full items-center justify-center px-5">
                <span className="font-black italic uppercase tracking-tighter text-xs">ZWYCIĘZCY</span>
              </div>
            </button>
            <button
              onClick={() => { setViewMode('worldCup'); setSelectedLeague('WORLD_CUP'); }}
              className={filterButtonClass(viewMode === 'worldCup')}
            >
              <div className="absolute right-[-5px] top-[-5px] text-4xl font-black italic text-white/[0.03] select-none group-hover:text-white/[0.06] transition-colors">MS</div>
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400" />
              <div className={`absolute inset-0 transition-opacity pointer-events-none ${viewMode === 'worldCup' ? 'opacity-10' : 'opacity-0 group-hover:opacity-5'}`} style={{ background: 'linear-gradient(90deg, #f59e0b, transparent)' }} />
              <div className="relative z-10 flex h-full items-center justify-center px-5">
                <span className="font-black italic uppercase tracking-tighter text-xs">MISTRZOSTWA ŚWIATA</span>
              </div>
            </button>
            <button
              onClick={() => { setViewMode('nationsLeague'); setSelectedLeague('NATIONS_LEAGUE'); }}
              className={filterButtonClass(viewMode === 'nationsLeague')}
            >
              <div className="absolute right-[-5px] top-[-5px] text-4xl font-black italic text-white/[0.03] select-none group-hover:text-white/[0.06] transition-colors">UNL</div>
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-400" />
              <div className={`absolute inset-0 transition-opacity pointer-events-none ${viewMode === 'nationsLeague' ? 'opacity-10' : 'opacity-0 group-hover:opacity-5'}`} style={{ background: 'linear-gradient(90deg, #22d3ee, transparent)' }} />
              <div className="relative z-10 flex h-full items-center justify-center px-5">
                <span className="font-black italic uppercase tracking-tighter text-xs">LIGA NARODÓW</span>
              </div>
            </button>
            <button
              onClick={() => { setViewMode('uefaRanking'); setSelectedLeague('UEFA_RANKING'); }}
              className={filterButtonClass(viewMode === 'uefaRanking')}
            >
              <div className="absolute right-[-5px] top-[-5px] text-4xl font-black italic text-white/[0.03] select-none group-hover:text-white/[0.06] transition-colors">RKG</div>
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-sky-400" />
              <div className={`absolute inset-0 transition-opacity pointer-events-none ${viewMode === 'uefaRanking' ? 'opacity-10' : 'opacity-0 group-hover:opacity-5'}`} style={{ background: 'linear-gradient(90deg, #38bdf8, transparent)' }} />
              <div className="relative z-10 flex h-full items-center justify-center px-5">
                <span className="font-black italic uppercase tracking-tighter text-xs">RANKING UEFA</span>
              </div>
            </button>
            {viewMode === 'matches' && filterItems.map(l => (
              <button
                key={l.id}
                onClick={() => { setViewMode('matches'); setSelectedLeague(l.id); }}
                className={filterButtonClass(selectedLeague === l.id && viewMode === 'matches')}
              >
                <div className="absolute right-[-5px] top-[-5px] text-4xl font-black italic text-white/[0.03] select-none group-hover:text-white/[0.06] transition-colors">{l.code}</div>
                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: l.accent }} />
                <div
                  className={`absolute inset-0 transition-opacity pointer-events-none ${selectedLeague === l.id && viewMode === 'matches' ? 'opacity-10' : 'opacity-0 group-hover:opacity-5'}`}
                  style={{ background: `linear-gradient(90deg, ${l.accent}, transparent)` }}
                />
                <div className="relative z-10 flex h-full items-center justify-center px-5">
                  <span className="font-black italic uppercase tracking-tighter text-xs">{l.label}</span>
                </div>
              </button>
            ))}

            {viewMode === 'uefaRanking' && (
              <div className="mt-auto p-4 bg-black/20 rounded-2xl border border-white/5">
                 <span className="text-[8px] font-bold text-slate-600 uppercase block mb-1">Ranking</span>
                 <span className="text-xl font-black italic text-white">
                   {uefaNationalRankingState?.entries.length ?? nationalTeams.filter(team => team.continent === 'Europe' && team.name !== 'Rosja').length}
                   <span className="text-[10px] opacity-40"> KADR</span>
                 </span>
              </div>
            )}
            <div className={`${viewMode === 'uefaRanking' ? 'hidden ' : ''}mt-auto p-4 bg-black/20 rounded-2xl border border-white/5`}>
               <span className="text-[8px] font-bold text-slate-600 uppercase block mb-1">{viewMode === 'matches' ? 'Statystyka' : viewMode === 'worldCup' ? 'Turniej' : viewMode === 'nationsLeague' ? 'Edycja' : 'Historia'}</span>
               <span className="text-xl font-black italic text-white">
                 {viewMode === 'matches' ? history.length : viewMode === 'worldCup' ? (wcState?.year ?? '-') : viewMode === 'nationsLeague' ? (nationsLeagueState?.editionLabel ?? '2026/27') : championshipHistory.length}
                 <span className="text-[10px] opacity-40"> {viewMode === 'matches' ? 'MECZÓW' : viewMode === 'worldCup' ? 'MŚ' : viewMode === 'nationsLeague' ? 'UNL' : 'WPISÓW'}</span>
               </span>
            </div>
        </div>

        {/* MATCH LIST */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/30 rounded-[40px] border border-white/5">
          {viewMode === 'matches' ? (
            <>
              <div className="px-8 pt-8 flex gap-4">
                 {Array.from({length: seasonNumber}, (_, i) => i + 1).map(s => (
                   <button
                     key={s}
                     onClick={() => setSelectedSeason(s)}
                     className={`relative overflow-hidden px-6 py-2 rounded-xl text-xs font-black text-center transition-all hover:-translate-y-0.5 hover:border-white/30 hover:shadow-[0_10px_24px_rgba(59,130,246,0.22)] active:translate-y-[2px] before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-transform before:duration-500 hover:before:translate-x-full ${
                       selectedSeason === s
                         ? 'border-t border-x border-b border-t-white/40 border-x-white/20 border-b-black/60 bg-white text-black'
                         : 'border-t border-x border-b border-t-white/10 border-x-white/5 border-b-black/40 bg-white/5 text-slate-500'}`}
                     style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                   >
                     SEZON {s}
                   </button>
                 ))}
              </div>
              <div className="p-8 space-y-10">
                {groupedHistory.length > 0 ? groupedHistory.map((group, gIdx) => (
              <div key={gIdx} className="space-y-4">
                <div className="flex items-center gap-6 px-4">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] whitespace-nowrap">{group.label}</span>
                  <div className="h-px bg-white/5 flex-1" />
                  <span className="text-[10px] font-mono text-slate-600 italic uppercase">{(() => { const d = new Date(group.matches[0].date); return isNaN(d.getTime()) ? group.matches[0].date : d.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(); })()}</span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {group.matches.map((m, i) => {
                    const home = getClub(m.homeTeamId);
                    const away = getClub(m.awayTeamId);
                    return (
                      <div 
                        key={i} 
                        onClick={() => setSelectedMatch(m)} 
                        className={`group relative p-5 bg-slate-900/40 rounded-3xl border border-white/5 hover:border-white/20 cursor-pointer flex justify-between items-center transition-all duration-300
                          ${selectedMatch?.matchId === m.matchId ? 'ring-2 ring-blue-500 bg-blue-900/20 shadow-2xl scale-[1.01]' : 'hover:scale-[1.005]'}`}
                      >
                        <div className="flex-1 flex justify-center items-center gap-8">
                          <div className="flex items-center gap-3 w-64 justify-end">
                             <TeamMark team={home} />
                             <span className="truncate uppercase italic font-black text-base text-slate-300 group-hover:text-white transition-colors">{home?.name || 'Nieznany'}</span>
                          </div>
                          
                          <div className="bg-black/60 px-6 py-3 rounded-2xl text-emerald-400 font-mono text-xl shadow-inner min-w-[100px] text-center border border-white/10 group-hover:border-blue-500/30 transition-all tabular-nums">
  {m.homeScore} <span className="text-slate-700 mx-1">:</span> {m.awayScore}
  {m.homePenaltyScore !== undefined ? (
    <span className="text-[9px] block text-rose-500 mt-1 font-black uppercase tracking-tighter">
      k. {m.homePenaltyScore}:{m.awayPenaltyScore}
    </span>
  ) : m.goals.some(g => g.minute > 95) ? (
    <span className="text-[9px] block text-yellow-500 mt-1 font-black uppercase tracking-tighter">
      po dogr.
    </span>
  ) : null}
</div>

                          <div className="flex items-center gap-3 w-64 justify-start">
                             <span className="truncate uppercase italic font-black text-base text-slate-300 group-hover:text-white transition-colors">{away?.name || 'Nieznany'}</span>
                             <TeamMark team={away} />
                          </div>
                        </div>

                        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                           <span className="text-blue-500 text-xl">→</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )) : (
                <div className="h-64 flex flex-col items-center justify-center opacity-20">
                 <span className="text-8xl mb-6">🏜️</span>
                 <p className="text-xl font-black uppercase tracking-[0.4em] italic text-center">Brak rozegranych meczów</p>
              </div>
            )}
              </div>
            </>
          ) : viewMode === 'worldCup' ? (
            <>
              <div className="px-8 pt-8 flex gap-4">
                {[wcState?.year ?? selectedWorldCupYear].map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedWorldCupYear(year)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all active:translate-y-[2px] ${
                      selectedWorldCupYear === year
                        ? 'border-t border-x border-b border-t-white/40 border-x-white/20 border-b-black/60 bg-white text-black'
                        : 'border-t border-x border-b border-t-white/10 border-x-white/5 border-b-black/40 bg-white/5 text-slate-500'}`}
                    style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                  >
                    {year}
                  </button>
                ))}
              </div>
              <WorldCupArchive wcState={wcState && wcState.year === selectedWorldCupYear ? wcState : null} />
            </>
          ) : viewMode === 'nationsLeague' ? (
            <NationsLeagueArchive
              state={nationsLeagueState}
              history={history}
              nationalTeams={nationalTeams}
              onSelectMatch={setSelectedMatch}
            />
          ) : viewMode === 'uefaRanking' ? (
            <UefaNationalRankingArchive
              state={uefaNationalRankingState}
              nationalTeams={nationalTeams}
            />
          ) : (
            // CHAMPIONS VIEW
            <div className="p-8 space-y-12">
              {/* EKSTRAKLASA */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🏆</span>
                  <h3 className="text-lg font-black uppercase tracking-wider italic text-white">EKSTRAKLASA</h3>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-blue-600/20 border-b border-white/5">
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Sezon</th>
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Zwycięzca</th>
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">II Miejsce</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ekstraklasaWinner.map((entry, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 text-sm font-black text-slate-300">{entry.season}</td>
                          <td className="px-6 py-3 text-sm font-black text-yellow-400">{entry.winner}</td>
                          <td className="px-6 py-3 text-sm font-black text-slate-400">{entry.runnerUp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PUCHAR POLSKI */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🛡️</span>
                  <h3 className="text-lg font-black uppercase tracking-wider italic text-white">PUCHAR POLSKI</h3>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-purple-600/20 border-b border-white/5">
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Sezon</th>
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Zdobywca</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pucharWinner.sort((a, b) => b.year - a.year).map((entry, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 text-sm font-black text-slate-300">{entry.season}</td>
                          <td className="px-6 py-3 text-sm font-black text-yellow-400">{entry.winner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SUPERPUCHAR POLSKI */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">⚡</span>
                  <h3 className="text-lg font-black uppercase tracking-wider italic text-white">SUPERPUCHAR POLSKI</h3>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-yellow-600/20 border-b border-white/5">
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Sezon</th>
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Zwycięzca</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supercupWinnersFromMatches.sort((a, b) => b.year - a.year).map((entry, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 text-sm font-black text-slate-300">{entry.season}</td>
                          <td className="px-6 py-3 text-sm font-black text-yellow-400">{entry.winner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SUPERPUCHAR EUROPY */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">☀️</span>
                  <h3 className="text-lg font-black uppercase tracking-wider italic text-white">SUPERPUCHAR EUROPY</h3>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-amber-600/20 border-b border-white/5">
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Sezon</th>
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Zwycięzca</th>
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Finalista</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uefaSupercupWinner.map((entry, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 text-sm font-black text-slate-300">{entry.season}</td>
                          <td className="px-6 py-3 text-sm font-black text-yellow-400">{entry.winner}</td>
                          <td className="px-6 py-3 text-sm font-black text-slate-400">{entry.runnerUp}</td>
                        </tr>
                      ))}
                      {uefaSupercupWinner.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-xs text-slate-600 uppercase tracking-widest">Brak danych</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LIGA MISTRZÓW */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🌟</span>
                  <h3 className="text-lg font-black uppercase tracking-wider italic text-white">LIGA MISTRZÓW UEFA</h3>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-indigo-600/20 border-b border-white/5">
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Sezon</th>
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Zwycięzca</th>
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Finalista</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clWinner.sort((a, b) => b.year - a.year).map((entry, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 text-sm font-black text-slate-300">{entry.season}</td>
                          <td className="px-6 py-3 text-sm font-black text-yellow-400">{entry.winner}</td>
                          <td className="px-6 py-3 text-sm font-black text-slate-400">{entry.runnerUp || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LIGA EUROPY */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🟠</span>
                  <h3 className="text-lg font-black uppercase tracking-wider italic text-white">LIGA EUROPY UEFA</h3>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-orange-600/20 border-b border-white/5">
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Sezon</th>
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Zwycięzca</th>
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Finalista</th>
                      </tr>
                    </thead>
                    <tbody>
                      {elWinner.map((entry, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 text-sm font-black text-slate-300">{entry.season}</td>
                          <td className="px-6 py-3 text-sm font-black text-yellow-400">{entry.winner}</td>
                          <td className="px-6 py-3 text-sm font-black text-slate-400">{entry.runnerUp}</td>
                        </tr>
                      ))}
                      {elWinner.length === 0 && (
                        <tr><td colSpan={3} className="px-6 py-4 text-center text-xs text-slate-600 uppercase tracking-widest">Brak danych</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LIGA KONFERENCJI */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🟢</span>
                  <h3 className="text-lg font-black uppercase tracking-wider italic text-white">LIGA KONFERENCJI UEFA</h3>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-green-700/20 border-b border-white/5">
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Sezon</th>
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Zwycięzca</th>
                        <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-widest">Finalista</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confWinner.map((entry, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 text-sm font-black text-slate-300">{entry.season}</td>
                          <td className="px-6 py-3 text-sm font-black text-yellow-400">{entry.winner}</td>
                          <td className="px-6 py-3 text-sm font-black text-slate-400">{entry.runnerUp}</td>
                        </tr>
                      ))}
                      {confWinner.length === 0 && (
                        <tr><td colSpan={3} className="px-6 py-4 text-center text-xs text-slate-600 uppercase tracking-widest">Brak danych</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
      </div>

      </div>

      {/* DETAIL MODAL */}
      {selectedMatch && String(selectedMatch.competition).includes('Liga Narodów UEFA') ? (
        <MatchReportModalPolishLeague
          matchId={selectedMatch.matchId}
          onClose={() => setSelectedMatch(null)}
          teamType="national"
        />
      ) : selectedMatch && (() => {
        const homeClub = getClub(selectedMatch.homeTeamId);
        const awayClub = getClub(selectedMatch.awayTeamId);
        return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-fade-in" onClick={() => setSelectedMatch(null)}>
           <div className="max-w-6xl w-full border border-white/15 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden relative" onClick={e => e.stopPropagation()} style={{ background: `linear-gradient(135deg, ${homeClub?.colorsHex?.[0] ?? '#0f172a'}33 0%, #0f172a 40%, #0f172a 60%, ${awayClub?.colorsHex?.[0] ?? '#0f172a'}33 100%)` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />

              {/* Nagłówek */}
              <div className="pt-8 px-8 pb-0 text-center">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{(() => {
                   const c = selectedMatch.competition;
                   const map: Record<string, string> = {
                     'CL_R1Q': 'Liga Mistrzów · 1. Runda Kwalifikacyjna',
                     'CL_R1Q_RETURN': 'Liga Mistrzów · 1. Runda Kwalifikacyjna — Rewanż',
                     'CL_R2Q': 'Liga Mistrzów · 2. Runda Kwalifikacyjna',
                     'CL_R2Q_RETURN': 'Liga Mistrzów · 2. Runda Kwalifikacyjna — Rewanż',
                     'CL_GROUP_STAGE': 'Liga Mistrzów · Faza Grupowa',
                     'CL_R16': 'Liga Mistrzów · 1/8 Finału',
                     'CL_R16_RETURN': 'Liga Mistrzów · 1/8 Finału — Rewanż',
                     'CL_QF': 'Liga Mistrzów · Ćwierćfinał',
                     'CL_QF_RETURN': 'Liga Mistrzów · Ćwierćfinał — Rewanż',
                     'CL_SF': 'Liga Mistrzów · Półfinał',
                     'CL_SF_RETURN': 'Liga Mistrzów · Półfinał — Rewanż',
                     'CL_FINAL': 'Liga Mistrzów · Finał',
                     'EL_R1Q': 'Liga Europy · 1. Runda Kwalifikacyjna',
                     'EL_R1Q_RETURN': 'Liga Europy · 1. Runda Kwalifikacyjna — Rewanż',
                     'EL_R2Q': 'Liga Europy · 2. Runda Kwalifikacyjna',
                     'EL_R2Q_RETURN': 'Liga Europy · 2. Runda Kwalifikacyjna — Rewanż',
                     'EL_R16': 'Liga Europy · 1/8 Finału',
                     'EL_R16_RETURN': 'Liga Europy · 1/8 Finału — Rewanż',
                     'EL_QF': 'Liga Europy · Ćwierćfinał',
                     'EL_QF_RETURN': 'Liga Europy · Ćwierćfinał — Rewanż',
                     'EL_SF': 'Liga Europy · Półfinał',
                     'EL_SF_RETURN': 'Liga Europy · Półfinał — Rewanż',
                     'EL_FINAL': 'Liga Europy · Finał',
                     'CONF_R1Q': 'Liga Konferencji · 1. Runda Kwalifikacyjna',
                     'CONF_R1Q_RETURN': 'Liga Konferencji · 1. Runda Kwalifikacyjna — Rewanż',
                     'CONF_R2Q': 'Liga Konferencji · 2. Runda Kwalifikacyjna',
                     'CONF_R2Q_RETURN': 'Liga Konferencji · 2. Runda Kwalifikacyjna — Rewanż',
                     'CONF_R16': 'Liga Konferencji · 1/8 Finału',
                     'CONF_R16_RETURN': 'Liga Konferencji · 1/8 Finału — Rewanż',
                     'CONF_QF': 'Liga Konferencji · Ćwierćfinał',
                     'CONF_QF_RETURN': 'Liga Konferencji · Ćwierćfinał — Rewanż',
                     'CONF_SF': 'Liga Konferencji · Półfinał',
                     'CONF_SF_RETURN': 'Liga Konferencji · Półfinał — Rewanż',
                     'CONF_FINAL': 'Liga Konferencji · Finał',
                     'POLISH_CUP': 'Puchar Polski',
                     'PLAYOFF': 'Baraże',
                   };
                   if (map[c]) return map[c];
                   if (c.startsWith('L_PL_')) return `Ekstraklasa · Kolejka ${c.replace('L_PL_', '')}`;
                   return c;
                 })()}</p>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mt-0.5">{new Date(selectedMatch.date).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              {/* Karta meczu */}
              <div className="px-8 py-6">

                 {/* Meta-bar */}
                 <div className="mb-4 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                    <div className="flex gap-6 text-slate-400">
                       <span>Stadion: <span className="text-white">{homeClub ? PolishCupVenueService.getHistoryVenue(selectedMatch, homeClub) : selectedMatch.venue}</span></span>
                       {selectedMatch.attendance && <span>Widzów: <span className="text-white">{selectedMatch.attendance.toLocaleString('pl-PL')}</span></span>}
                       {selectedMatch.weather && (
                         <span>Pogoda: <span className="text-white">
                           {(() => {
                             const d = selectedMatch.weather!.description.toLowerCase();
                             if (d.includes('zamieć') || d.includes('blizzard')) return '🌨️';
                             if (d.includes('burza')) return '⛈️';
                             if (d.includes('śnieg') || d.includes('snieg')) return '❄️';
                             if (d.includes('ulewny') || d.includes('heavy rain')) return '🌧️';
                             if (d.includes('deszcz') || d.includes('rain') || d.includes('lekki deszcz')) return '🌦️';
                             if (d.includes('wiatr') || d.includes('wind')) return '💨';
                             if (d.includes('zachmurzenie') || d.includes('pochmurno') || d.includes('cloudy')) return '☁️';
                             return '☀️';
                           })()}{' '}{selectedMatch.weather!.description} {selectedMatch.weather!.tempC}°C
                         </span></span>
                       )}
                    </div>
                    {selectedMatch.refereeName && (
                      <span className="text-slate-400">Sędzia: {(() => {
                        const ref = RefereeService.pool.find(r => `${r.firstName} ${r.lastName}` === selectedMatch.refereeName);
                        return ref
                          ? <button onClick={e => { e.stopPropagation(); viewRefereeDetails(ref.id); }} className="text-white hover:text-amber-300 hover:underline cursor-pointer transition-colors">{selectedMatch.refereeName}</button>
                          : <span className="text-white">{selectedMatch.refereeName}</span>;
                      })()}</span>
                    )}
                 </div>

                 {/* Drużyny + wynik */}
                    <div className="flex items-center justify-between">
                    <div className="flex-1 flex items-center justify-end gap-3">
                       <TeamMark team={homeClub} className="w-10 h-10" />
                       {homeClub
                         ? <button onClick={e => { e.stopPropagation(); viewClubDetails(homeClub.id); }} className="font-black italic uppercase tracking-tighter text-2xl text-white leading-tight text-right hover:text-amber-300 transition-colors cursor-pointer">{homeClub.name}</button>
                         : <span className="font-black italic uppercase tracking-tighter text-2xl text-white leading-tight text-right">{homeClub?.name}</span>
                       }
                    </div>
                    <div className="flex items-center gap-2 mx-8 min-w-[120px] justify-center">
                       <span className="text-2xl font-black tabular-nums text-white">{selectedMatch.homeScore}</span>
                       <span className="text-slate-500 text-xl font-black">:</span>
                       <span className="text-2xl font-black tabular-nums text-white">{selectedMatch.awayScore}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-start gap-3">
                       {awayClub
                         ? <button onClick={e => { e.stopPropagation(); viewClubDetails(awayClub.id); }} className="font-black italic uppercase tracking-tighter text-2xl text-white leading-tight hover:text-amber-300 transition-colors cursor-pointer">{awayClub.name}</button>
                         : <span className="font-black italic uppercase tracking-tighter text-2xl text-white leading-tight">{awayClub?.name}</span>
                       }
                       <TeamMark team={awayClub} className="w-10 h-10" />
                    </div>
                 </div>

                 {/* Karne / dogrywka */}
                 {selectedMatch.homePenaltyScore !== undefined && (
                   <div className="text-center mt-1">
                      <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">k. {selectedMatch.homePenaltyScore}:{selectedMatch.awayPenaltyScore}</span>
                   </div>
                 )}
                 {selectedMatch.homePenaltyScore === undefined && selectedMatch.goals.some(g => g.minute > 95) && (
                   <div className="text-center mt-1">
                      <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">po dogrywce</span>
                   </div>
                 )}

                 {/* Zdarzenia */}
                 {(() => {
                    const homeGoals = selectedMatch.goals.filter(g => g.teamId === selectedMatch.homeTeamId).sort((a, b) => a.minute - b.minute);
                    const awayGoals = selectedMatch.goals.filter(g => g.teamId === selectedMatch.awayTeamId).sort((a, b) => a.minute - b.minute);
                    const homeCards = selectedMatch.cards.filter(c => c.teamId === selectedMatch.homeTeamId).sort((a, b) => a.minute - b.minute);
                    const awayCards = selectedMatch.cards.filter(c => c.teamId === selectedMatch.awayTeamId).sort((a, b) => a.minute - b.minute);

                    if (!homeGoals.length && !awayGoals.length && !homeCards.length && !awayCards.length) return null;

                    return (
                      <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
                         {(homeGoals.length > 0 || awayGoals.length > 0) && (
                           <div className="grid grid-cols-2 gap-6">
                              <div className="flex flex-wrap gap-x-3 gap-y-1 justify-start text-left text-sm text-slate-200">
                                 {homeGoals.map(g => {
                                   const isVAR = !!(g as any).varDisallowed;
                                   return (
                                     <span key={`hg-${g.minute}-${g.playerName}`} className={`inline-flex items-center gap-1.5 ${isVAR ? 'text-slate-500' : ''}`}>
                                        <span className={`text-[13px] ${(g as any).isMiss ? 'text-rose-400' : isVAR ? 'opacity-40' : 'text-emerald-300'}`}>{(g as any).isMiss ? '❌' : '⚽'}</span>
                                        {isVAR
                                          ? <s>{g.minute}' {g.playerName}{(g as any).isPenalty ? ' (k.)' : ''} VAR</s>
                                          : g.playerId
                                            ? <button onClick={e => { e.stopPropagation(); viewPlayerDetails(g.playerId!); }} className="hover:text-amber-300 hover:underline cursor-pointer transition-colors">{g.minute}' {g.playerName}{(g as any).isPenalty ? ' (k.)' : ''}</button>
                                            : <span>{g.minute}' {g.playerName}{(g as any).isPenalty ? ' (k.)' : ''}</span>
                                        }
                                     </span>
                                   );
                                 })}
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 justify-end text-right text-sm text-slate-200">
                                 {awayGoals.map(g => {
                                   const isVAR = !!(g as any).varDisallowed;
                                   return (
                                     <span key={`ag-${g.minute}-${g.playerName}`} className={`inline-flex items-center gap-1.5 ${isVAR ? 'text-slate-500' : ''}`}>
                                        <span className={`text-[13px] ${(g as any).isMiss ? 'text-rose-400' : isVAR ? 'opacity-40' : 'text-emerald-300'}`}>{(g as any).isMiss ? '❌' : '⚽'}</span>
                                        {isVAR
                                          ? <s>{g.minute}' {g.playerName}{(g as any).isPenalty ? ' (k.)' : ''} VAR</s>
                                          : g.playerId
                                            ? <button onClick={e => { e.stopPropagation(); viewPlayerDetails(g.playerId!); }} className="hover:text-amber-300 hover:underline cursor-pointer transition-colors">{g.minute}' {g.playerName}{(g as any).isPenalty ? ' (k.)' : ''}</button>
                                            : <span>{g.minute}' {g.playerName}{(g as any).isPenalty ? ' (k.)' : ''}</span>
                                        }
                                     </span>
                                   );
                                 })}
                              </div>
                           </div>
                         )}
                         {(homeCards.length > 0 || awayCards.length > 0) && (
                           <div className="grid grid-cols-2 gap-6">
                              <div className="flex flex-wrap gap-x-3 gap-y-1 justify-start text-left text-xs text-slate-300">
                                 {homeCards.map(c => (
                                   <span key={`hc-${c.minute}-${c.type}`} className="inline-flex items-center gap-1.5">
                                      <span>{c.type === 'YELLOW' ? '🟨' : '🟥'}</span>
                                      {c.playerId
                                        ? <button onClick={e => { e.stopPropagation(); viewPlayerDetails(c.playerId!); }} className="hover:text-amber-300 hover:underline cursor-pointer transition-colors">{c.minute}' {c.playerName}{c.type === 'SECOND_YELLOW' ? ' (2. żółta)' : ''}</button>
                                        : <span>{c.minute}' {c.playerName}{c.type === 'SECOND_YELLOW' ? ' (2. żółta)' : ''}</span>
                                      }
                                   </span>
                                 ))}
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 justify-end text-right text-xs text-slate-300">
                                 {awayCards.map(c => (
                                   <span key={`ac-${c.minute}-${c.type}`} className="inline-flex items-center gap-1.5">
                                      <span>{c.type === 'YELLOW' ? '🟨' : '🟥'}</span>
                                      {c.playerId
                                        ? <button onClick={e => { e.stopPropagation(); viewPlayerDetails(c.playerId!); }} className="hover:text-amber-300 hover:underline cursor-pointer transition-colors">{c.minute}' {c.playerName}{c.type === 'SECOND_YELLOW' ? ' (2. żółta)' : ''}</button>
                                        : <span>{c.minute}' {c.playerName}{c.type === 'SECOND_YELLOW' ? ' (2. żółta)' : ''}</span>
                                      }
                                   </span>
                                 ))}
                              </div>
                           </div>
                         )}
                      </div>
                    );
                 })()}
              </div>

              {/* Zamknij */}
              <div className="px-8 pb-8 text-center">
                 <button onClick={() => setSelectedMatch(null)} className="px-16 py-3 bg-white text-slate-900 font-black italic uppercase tracking-widest rounded-2xl text-xs border-t border-x border-b border-t-white/40 border-x-white/20 border-b-black/60 transition-all active:translate-y-[2px]" style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)' }}>
                    Zamknij raport
                 </button>
              </div>
           </div>
        </div>
        );
      })()}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-left { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-right { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-left { animation: slide-left 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-right { animation: slide-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
    </>
  );
};
