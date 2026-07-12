import React, { useEffect, useMemo, useState } from 'react';
import nationalTeamsBg from '../../Graphic/themes/national_teams_view.png';
import { useGame } from '../../context/GameContext';
import {
  MatchCardEntry,
  MatchGoalEntry,
  MatchHistoryEntry,
  NationalTeam,
  NationsLeagueFixture,
  NationsLeagueGroup,
  NationsLeagueState,
  NationsLeagueTier,
  UefaNationalRankingState,
  ViewState,
} from '../../types';
import { MatchHistoryService } from '../../services/MatchHistoryService';
import { NationsLeagueService } from '../../services/NationsLeagueService';

const HEADING_FONT = 'font-black italic uppercase tracking-tighter';
const BTN_FONT = 'font-black italic uppercase tracking-widest';

type TabId = 'tabele' | 'mecze' | 'baraze' | 'finaly' | 'statystyki' | 'ranking';

const TIER_META: Record<NationsLeagueTier, { label: string; color: string; border: string; bg: string }> = {
  A: { label: 'Liga A', color: 'text-amber-300', border: 'border-amber-400/30', bg: 'bg-amber-500/10' },
  B: { label: 'Liga B', color: 'text-sky-300', border: 'border-sky-400/30', bg: 'bg-sky-500/10' },
  C: { label: 'Liga C', color: 'text-emerald-300', border: 'border-emerald-400/30', bg: 'bg-emerald-500/10' },
  D: { label: 'Liga D', color: 'text-violet-300', border: 'border-violet-400/30', bg: 'bg-violet-500/10' },
};

const COUNTRY_CODE_MAP: Record<string, string> = {
  Portugalia: 'pt', Hiszpania: 'es', Francja: 'fr', Niemcy: 'de', Holandia: 'nl',
  Włochy: 'it', Dania: 'dk', Chorwacja: 'hr', Anglia: 'gb-eng', Belgia: 'be',
  Turcja: 'tr', Serbia: 'rs', Norwegia: 'no', Walia: 'gb-wls', Grecja: 'gr',
  Czechy: 'cz', Szwajcaria: 'ch', Austria: 'at', Szkocja: 'gb-sct', Ukraina: 'ua',
  Szwecja: 'se', Polska: 'pl', Węgry: 'hu', Rumunia: 'ro', Irlandia: 'ie',
  Izrael: 'il', Słowenia: 'si', Gruzja: 'ge', Albania: 'al', Kosovo: 'xk',
  Słowacja: 'sk', Islandia: 'is', Finlandia: 'fi', Armenia: 'am',
  Luksemburg: 'lu', Estonia: 'ee', Cypr: 'cy', Litwa: 'lt', Malta: 'mt',
  Andora: 'ad', Gibraltar: 'gi', Liechtenstein: 'li', 'San Marino': 'sm',
  'Bośnia i Hercegowina': 'ba', 'Macedonia Północna': 'mk', 'Irlandia Północna': 'gb-nir',
  Bułgaria: 'bg', Czarnogóra: 'me', Białoruś: 'by', 'Wyspy Owcze': 'fo',
  Kazachstan: 'kz', Łotwa: 'lv', Mołdawia: 'md', Azerbejdżan: 'az',
};

function flagCode(name: string): string | null {
  return COUNTRY_CODE_MAP[name] ?? null;
}

function TeamFlag({ name, className = 'h-5 w-7' }: { name: string; className?: string }) {
  const code = flagCode(name);
  if (!code) {
    return (
      <div className={`${className} flex shrink-0 items-center justify-center rounded-sm border border-white/10 bg-white/10 text-[9px] font-black text-white/70`}>
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return <img src={`https://flagcdn.com/w40/${code}.png`} alt={name} className={`${className} shrink-0 rounded-sm border border-white/10 object-cover`} />;
}

function getFixtureDate(state: NationsLeagueState, fixture: NationsLeagueFixture): Date {
  const year = fixture.month >= 6 ? state.editionStartYear : state.editionStartYear + 1;
  return new Date(year, fixture.month, fixture.day);
}

function stageLabel(fixture: NationsLeagueFixture): string {
  if (fixture.stage === 'LEAGUE_PHASE') return `${fixture.groupId ?? fixture.tier} · Kolejka ${fixture.round}`;
  if (fixture.stage === 'QUARTER_FINALS') return `Ćwierćfinał · Mecz ${fixture.round}`;
  if (fixture.stage === 'PLAYOFFS') return `Baraż ${fixture.playoffLevel ?? ''} · Mecz ${fixture.round}`;
  if (fixture.id === 'UNL_THIRD') return 'Mecz o 3. miejsce';
  if (fixture.id === 'UNL_FINAL') return 'Finał';
  return `Final Four · Półfinał ${fixture.round}`;
}

function resultText(fixture: NationsLeagueFixture): string {
  if (!fixture.played) return '- : -';
  const score = `${fixture.homeGoals ?? 0} : ${fixture.awayGoals ?? 0}`;
  if (fixture.homePenaltyScore !== undefined && fixture.awayPenaltyScore !== undefined) {
    return `${score} (${fixture.homePenaltyScore}:${fixture.awayPenaltyScore} k.)`;
  }
  if (fixture.isExtraTime) return `${score} pd.`;
  return score;
}

function GroupTable({ group }: { group: NationsLeagueGroup }) {
  const meta = TIER_META[group.tier];
  return (
    <section className={`rounded-xl border ${meta.border} ${meta.bg} p-4`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className={`${HEADING_FONT} text-xl text-white`}>Grupa {group.id}</h3>
        <span className={`${BTN_FONT} text-[10px] ${meta.color}`}>{meta.label}</span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/10 text-white/35">
            <th className="pb-2 text-left">Drużyna</th>
            <th className="w-8 text-center">M</th>
            <th className="w-8 text-center">W</th>
            <th className="w-8 text-center">R</th>
            <th className="w-8 text-center">P</th>
            <th className="w-12 text-center">B</th>
            <th className="w-10 text-center text-white/70">Pkt</th>
          </tr>
        </thead>
        <tbody>
          {group.standings.map((row, index) => (
            <tr key={row.teamName} className="border-b border-white/5 last:border-b-0">
              <td className="py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`w-5 text-center font-black ${index === 0 ? 'text-amber-300' : index === group.standings.length - 1 ? 'text-rose-300' : 'text-white/35'}`}>
                    {index + 1}
                  </span>
                  <TeamFlag name={row.teamName} />
                  <span className="truncate font-bold uppercase text-white/85">{row.teamName}</span>
                </div>
              </td>
              <td className="text-center text-white/65">{row.played}</td>
              <td className="text-center text-white/65">{row.wins}</td>
              <td className="text-center text-white/65">{row.draws}</td>
              <td className="text-center text-white/65">{row.losses}</td>
              <td className="text-center text-white/65">{row.goalsFor}:{row.goalsAgainst}</td>
              <td className="text-center font-black text-white">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function FixtureRow({ state, fixture, compact = false }: { state: NationsLeagueState; fixture: NationsLeagueFixture; compact?: boolean }) {
  const date = getFixtureDate(state, fixture);
  const winner = fixture.played
    ? fixture.homePenaltyScore !== undefined && fixture.awayPenaltyScore !== undefined
      ? fixture.homePenaltyScore > fixture.awayPenaltyScore ? fixture.home : fixture.away
      : (fixture.homeGoals ?? 0) !== (fixture.awayGoals ?? 0)
        ? (fixture.homeGoals ?? 0) > (fixture.awayGoals ?? 0) ? fixture.home : fixture.away
        : null
    : null;

  return (
    <div className="rounded-xl border border-white/[0.07] bg-slate-950/45 px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest text-white/35">
        <span>{stageLabel(fixture)}</span>
        <span>{date.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_112px_minmax(0,1fr)] items-center gap-3">
        <div className={`flex min-w-0 items-center justify-end gap-2 text-right ${winner === fixture.home ? 'text-white' : 'text-white/65'}`}>
          <span className={`${compact ? 'text-xs' : 'text-sm'} truncate font-black uppercase`}>{fixture.home}</span>
          <TeamFlag name={fixture.home} />
        </div>
        <div className="rounded-lg bg-black/45 px-3 py-2 text-center font-mono text-sm font-black tabular-nums text-emerald-300">
          {resultText(fixture)}
        </div>
        <div className={`flex min-w-0 items-center justify-start gap-2 ${winner === fixture.away ? 'text-white' : 'text-white/65'}`}>
          <TeamFlag name={fixture.away} />
          <span className={`${compact ? 'text-xs' : 'text-sm'} truncate font-black uppercase`}>{fixture.away}</span>
        </div>
      </div>
    </div>
  );
}

function buildScorers(history: MatchHistoryEntry[], teamNameById: Map<string, string>) {
  const rows = new Map<string, { playerName: string; playerId?: string; teamId: string; teamName: string; goals: number }>();
  history.forEach(match => {
    match.goals.forEach(goal => {
      if ((goal as MatchGoalEntry).isOwnGoal || (goal as MatchGoalEntry).isMiss) return;
      const key = `${goal.playerName}_${goal.teamId}`;
      const current = rows.get(key) ?? {
        playerName: goal.playerName,
        playerId: goal.playerId,
        teamId: goal.teamId,
        teamName: teamNameById.get(goal.teamId) ?? goal.teamId,
        goals: 0
      };
      current.playerId = current.playerId ?? goal.playerId;
      current.teamName = teamNameById.get(goal.teamId) ?? current.teamName;
      current.goals += 1;
      rows.set(key, current);
    });
  });
  return [...rows.values()].sort((a, b) => b.goals - a.goals || a.playerName.localeCompare(b.playerName)).slice(0, 12);
}

function buildEditionHistory(state: NationsLeagueState, allHistory: MatchHistoryEntry[]) {
  const fixtureMatchIds = new Set(
    state.fixtures
      .map(fixture => fixture.matchId)
      .filter((matchId): matchId is string => !!matchId)
  );
  const editionLabel = `Liga Narodów UEFA ${state.editionLabel}`;
  const seen = new Set<string>();

  return allHistory.filter(match => {
    const belongsToEdition = (!!match.matchId && fixtureMatchIds.has(match.matchId)) || String(match.competition).includes(editionLabel);
    if (!belongsToEdition) return false;
    const key = match.matchId ? `${match.season}:${match.matchId}` : `${match.date}:${match.homeTeamId}:${match.awayTeamId}:${match.competition}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildTeamNameById(fixtures: NationsLeagueFixture[], history: MatchHistoryEntry[], nationalTeams: NationalTeam[]) {
  const names = new Map<string, string>(nationalTeams.map(team => [team.id, team.name]));
  const fixtureByMatchId = new Map(
    fixtures
      .filter(fixture => !!fixture.matchId)
      .map(fixture => [fixture.matchId as string, fixture])
  );

  // Match history stores technical national-team IDs, while Nations League fixtures keep the readable team names used in the UI.
  history.forEach(match => {
    const fixture = match.matchId ? fixtureByMatchId.get(match.matchId) : undefined;
    if (!fixture) return;
    names.set(match.homeTeamId, fixture.home);
    names.set(match.awayTeamId, fixture.away);
  });

  return names;
}

function buildDiscipline(history: MatchHistoryEntry[], teamNameById: Map<string, string>) {
  const rows = new Map<string, { teamId: string; teamName: string; yellow: number; red: number }>();
  history.forEach(match => {
    match.cards.forEach((card: MatchCardEntry) => {
      const current = rows.get(card.teamId) ?? { teamId: card.teamId, teamName: teamNameById.get(card.teamId) ?? card.teamId, yellow: 0, red: 0 };
      if (card.type === 'YELLOW') current.yellow += 1;
      else current.red += 1;
      rows.set(card.teamId, current);
    });
  });
  return [...rows.values()]
    .sort((a, b) => (b.red * 3 + b.yellow) - (a.red * 3 + a.yellow) || a.teamName.localeCompare(b.teamName))
    .slice(0, 10);
}

function RankingTab({ rankingState }: { rankingState: UefaNationalRankingState | null }) {
  const entries = rankingState?.entries ?? [];
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/45">
      <div className="grid grid-cols-[70px_minmax(0,1fr)_70px_90px_100px] gap-3 border-b border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/35">
        <span>Pozycja</span>
        <span>Reprezentacja</span>
        <span className="text-center">Liga</span>
        <span className="text-right">Pkt fazy</span>
        <span className="text-right">Ruch</span>
      </div>
      <div className="divide-y divide-white/5">
        {entries.map(entry => {
          const movement = entry.lastDelta ?? 0;
          return (
            <div key={entry.teamName} className="grid grid-cols-[70px_minmax(0,1fr)_70px_90px_100px] items-center gap-3 px-5 py-3 text-sm text-white/75">
              <span className="font-mono text-white/45">#{entry.rank}</span>
              <div className="flex min-w-0 items-center gap-3">
                <TeamFlag name={entry.teamName} />
                <span className="truncate font-bold uppercase">{entry.teamName}</span>
              </div>
              <span className="text-center font-black text-sky-300">{entry.leagueTier ?? '-'}</span>
              <span className="text-right font-mono text-white">{entry.points}</span>
              <span className={`text-right font-mono ${movement > 0 ? 'text-emerald-300' : movement < 0 ? 'text-rose-300' : 'text-white/35'}`}>
                {movement > 0 ? `+${movement}` : movement}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const NationsLeagueView: React.FC = () => {
  const { nationsLeagueState, nationsLeagueArchive, nationalTeams, uefaNationalRankingState, navigateTo, viewPlayerDetails } = useGame();
  const [activeTab, setActiveTab] = useState<TabId>('tabele');
  const editions = useMemo(() => {
    const byYear = new Map<number, NationsLeagueState>();
    nationsLeagueArchive.forEach(entry => byYear.set(entry.editionStartYear, NationsLeagueService.repairLeaguePhaseStandings(entry)));
    if (nationsLeagueState) byYear.set(nationsLeagueState.editionStartYear, NationsLeagueService.repairLeaguePhaseStandings(nationsLeagueState));
    return [...byYear.values()].sort((a, b) => b.editionStartYear - a.editionStartYear);
  }, [nationsLeagueArchive, nationsLeagueState]);
  const [selectedEditionStartYear, setSelectedEditionStartYear] = useState<number | null>(
    nationsLeagueState?.editionStartYear ?? editions[0]?.editionStartYear ?? null
  );
  const displayState = editions.find(entry => entry.editionStartYear === selectedEditionStartYear) ?? editions[0] ?? null;

  useEffect(() => {
    if (nationsLeagueState) setSelectedEditionStartYear(nationsLeagueState.editionStartYear);
  }, [nationsLeagueState?.editionStartYear]);

  const history = useMemo(
    () => displayState
      ? buildEditionHistory(displayState, MatchHistoryService.getAll())
      : [],
    [displayState]
  );
  const fixtures = useMemo(
    () => displayState
      ? [...displayState.fixtures].sort((a, b) => getFixtureDate(displayState, a).getTime() - getFixtureDate(displayState, b).getTime() || a.id.localeCompare(b.id))
      : [],
    [displayState]
  );
  const leagueFixtures = fixtures.filter(fixture => fixture.stage === 'LEAGUE_PHASE');
  const playoffFixtures = fixtures.filter(fixture => fixture.stage === 'PLAYOFFS');
  const knockoutFixtures = fixtures.filter(fixture => fixture.stage === 'QUARTER_FINALS' || fixture.stage === 'FINALS');
  const teamNameById = useMemo(() => buildTeamNameById(fixtures, history, nationalTeams), [fixtures, history, nationalTeams]);
  const scorers = useMemo(() => buildScorers(history, teamNameById), [history, teamNameById]);
  const discipline = useMemo(() => buildDiscipline(history, teamNameById), [history, teamNameById]);

  if (!displayState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className={`${HEADING_FONT} mb-3 text-4xl text-white`}>Liga Narodów UEFA</h1>
          <p className="mb-6 text-sm font-bold uppercase tracking-widest text-white/40">Pierwsza edycja ruszy po losowaniu 17 lipca 2026</p>
          <button className={`${BTN_FONT} rounded-lg bg-white px-6 py-3 text-xs text-slate-950`} onClick={() => navigateTo(ViewState.DASHBOARD)}>
            Powrót
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'tabele', label: 'Tabele' },
    { id: 'mecze', label: 'Mecze' },
    { id: 'baraze', label: 'Baraże' },
    { id: 'finaly', label: 'Finały' },
    { id: 'statystyki', label: 'Statystyki' },
    { id: 'ranking', label: 'Ranking UEFA' },
  ];

  const progress = fixtures.length > 0 ? Math.round((fixtures.filter(fixture => fixture.played).length / fixtures.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: `url(${nationalTeamsBg})` }} />
      <div className="fixed inset-0 bg-slate-950/78" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1420px] flex-col px-6 py-6">
        <header className="mb-6 flex items-start justify-between gap-5">
          <div>
            <p className={`${BTN_FONT} mb-1 text-[10px] text-sky-300`}>UEFA Nations League</p>
            <h1 className={`${HEADING_FONT} text-5xl text-white`}>
              Liga Narodów
              <span className="ml-3 text-sky-300">{displayState.editionLabel}</span>
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/45">
              <span>{displayState.completed ? 'Rozgrywki zakończone' : displayState.stage === 'LEAGUE_PHASE' ? 'Faza ligowa' : displayState.stage === 'QUARTER_FINALS' ? 'Ćwierćfinały i baraże' : displayState.stage === 'PLAYOFFS' ? 'Baraże' : 'Final Four'}</span>
              <span className="h-1 w-1 rounded-full bg-white/25" />
              <span>{fixtures.filter(fixture => fixture.played).length} / {fixtures.length} meczów</span>
              {displayState.finals?.champion && (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/25" />
                  <span className="text-amber-300">Zwycięzca: {displayState.finals.champion}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button className={`${BTN_FONT} rounded-lg border border-white/10 bg-white/10 px-5 py-2.5 text-xs text-white hover:bg-white/20`} onClick={() => navigateTo(ViewState.NATIONS_LEAGUE_DRAW)}>
              Losowanie
            </button>
            <button className={`${BTN_FONT} rounded-lg border border-white/10 bg-white/10 px-5 py-2.5 text-xs text-white hover:bg-white/20`} onClick={() => navigateTo(ViewState.MATCH_HISTORY_BROWSER)}>
              Historia
            </button>
            <button className={`${BTN_FONT} rounded-lg bg-white px-5 py-2.5 text-xs text-slate-950 hover:bg-slate-200`} onClick={() => navigateTo(ViewState.DASHBOARD)}>
              Powrót
            </button>
          </div>
        </header>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-sky-300 transition-all" style={{ width: `${progress}%` }} />
        </div>

        {editions.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {editions.map(edition => (
              <button
                key={edition.editionStartYear}
                className={`${BTN_FONT} rounded-lg px-4 py-2 text-[10px] transition-all ${
                  displayState.editionStartYear === edition.editionStartYear
                    ? 'bg-white text-slate-950'
                    : 'border border-white/10 bg-white/[0.06] text-white/55 hover:bg-white/[0.12]'
                }`}
                onClick={() => setSelectedEditionStartYear(edition.editionStartYear)}
              >
                {edition.editionLabel}
              </button>
            ))}
          </div>
        )}

        <nav className="mb-5 flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${BTN_FONT} rounded-lg px-5 py-2.5 text-xs transition-all ${
                activeTab === tab.id
                  ? 'bg-sky-300 text-slate-950'
                  : 'border border-white/10 bg-white/[0.07] text-white/70 hover:bg-white/[0.12]'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto rounded-xl border border-white/10 bg-slate-950/55 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          {activeTab === 'tabele' && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {displayState.groups.map(group => <GroupTable key={group.id} group={group} />)}
            </div>
          )}

          {activeTab === 'mecze' && (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {leagueFixtures.map(fixture => <FixtureRow key={fixture.id} state={displayState} fixture={fixture} compact />)}
            </div>
          )}

          {activeTab === 'baraze' && (
            <div className="space-y-6">
              {(displayState.playoffs ?? []).length > 0 ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {(displayState.playoffs ?? []).map(tie => {
                    const firstLeg = displayState.fixtures.find(fixture => fixture.id === tie.firstLegId);
                    const secondLeg = displayState.fixtures.find(fixture => fixture.id === tie.secondLegId);
                    return (
                      <section key={tie.id} className="rounded-xl border border-white/10 bg-slate-950/45 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h3 className={`${HEADING_FONT} text-2xl text-white`}>Baraż {tie.level}</h3>
                          <span className={`${BTN_FONT} text-[10px] ${tie.winner ? 'text-emerald-300' : 'text-white/35'}`}>
                            {tie.winner ? `Wyżej: ${tie.winner}` : 'Do rozegrania'}
                          </span>
                        </div>
                        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-3">
                          <div className="min-w-0 text-right">
                            <div className="truncate text-sm font-black uppercase text-white">{tie.highLeagueTeam}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/35">broni wyższej ligi</div>
                          </div>
                          <div className={`${HEADING_FONT} text-center text-xl text-sky-300`}>vs</div>
                          <div className="min-w-0 text-left">
                            <div className="truncate text-sm font-black uppercase text-white">{tie.lowLeagueTeam}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/35">walczy o awans</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {firstLeg && <FixtureRow state={displayState} fixture={firstLeg} compact />}
                          {secondLeg && <FixtureRow state={displayState} fixture={secondLeg} compact />}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <div className={`${HEADING_FONT} py-16 text-center text-2xl text-white/25`}>Baraże zostaną wygenerowane po fazie ligowej</div>
              )}
            </div>
          )}

          {activeTab === 'finaly' && (
            <div className="space-y-6">
              {displayState.finals?.champion && (
                <section className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-6 text-center">
                  <p className={`${BTN_FONT} mb-2 text-[10px] text-amber-300`}>Triumfator edycji</p>
                  <div className="flex items-center justify-center gap-4">
                    <TeamFlag name={displayState.finals.champion} className="h-8 w-12" />
                    <h2 className={`${HEADING_FONT} text-4xl text-amber-200`}>{displayState.finals.champion}</h2>
                    <TeamFlag name={displayState.finals.champion} className="h-8 w-12" />
                  </div>
                </section>
              )}
              {knockoutFixtures.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {knockoutFixtures.map(fixture => <FixtureRow key={fixture.id} state={displayState} fixture={fixture} />)}
                </div>
              ) : (
                <div className={`${HEADING_FONT} py-16 text-center text-2xl text-white/25`}>Faza finałowa zostanie wygenerowana po fazie ligowej</div>
              )}
            </div>
          )}

          {activeTab === 'statystyki' && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <section className="rounded-xl border border-white/10 bg-slate-950/45 p-5">
                <h3 className={`${HEADING_FONT} mb-4 text-2xl text-white`}>Strzelcy</h3>
                <div className="space-y-2">
                  {scorers.length > 0 ? scorers.map((row, index) => (
                    <button
                      key={`${row.playerName}-${row.teamId}`}
                      type="button"
                      disabled={!row.playerId}
                      onClick={() => row.playerId && viewPlayerDetails(row.playerId)}
                      className={`grid w-full grid-cols-[40px_28px_minmax(0,1fr)_60px] items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2 text-left transition-all ${row.playerId ? 'cursor-pointer hover:bg-white/[0.08] hover:ring-1 hover:ring-sky-300/30' : 'cursor-default'}`}
                    >
                      <span className="font-mono text-white/35">#{index + 1}</span>
                      <span className="flex h-5 w-7 items-center justify-center">
                        <TeamFlag name={row.teamName} className="h-4 w-7" />
                      </span>
                      <span className={`truncate text-sm font-bold text-white/80 ${row.playerId ? 'hover:text-sky-200' : ''}`}>{row.playerName}</span>
                      <span className="text-right font-mono font-black text-emerald-300">{row.goals}</span>
                    </button>
                  )) : <p className={`${BTN_FONT} py-8 text-center text-[10px] text-white/25`}>Brak goli w tej edycji</p>}
                </div>
              </section>

              <section className="rounded-xl border border-white/10 bg-slate-950/45 p-5">
                <h3 className={`${HEADING_FONT} mb-4 text-2xl text-white`}>Dyscyplina</h3>
                <div className="space-y-2">
                  {discipline.length > 0 ? discipline.map(row => (
                    <div key={row.teamId} className="grid grid-cols-[minmax(0,1fr)_70px_70px] items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <TeamFlag name={row.teamName} />
                        <span className="truncate text-sm font-bold uppercase text-white/80">{row.teamName}</span>
                      </span>
                      <span className="text-right font-mono text-yellow-300">{row.yellow} ŻK</span>
                      <span className="text-right font-mono text-rose-300">{row.red} CK</span>
                    </div>
                  )) : <p className={`${BTN_FONT} py-8 text-center text-[10px] text-white/25`}>Brak kartek w tej edycji</p>}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'ranking' && <RankingTab rankingState={uefaNationalRankingState} />}
        </main>
      </div>
    </div>
  );
};

export default NationsLeagueView;
