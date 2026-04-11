import React from 'react';
import { useGame } from '../../context/GameContext';
import { MatchCardEntry, MatchGoalEntry, ViewState, WCQPlayoffMatchResult, WCQPlayoffPath } from '../../types';
import worldCupBg from '../../Graphic/themes/worldcup.png';

// ─── FLAG / COLOUR HELPERS (mirrored from NationalTeamResultsView) ─────────────

const NT_FLAG_CODE_MAP: Record<string, string> = {
  Albania: 'al', Andora: 'ad', Armenia: 'am', Austria: 'at', Azerbejdżan: 'az',
  Belgia: 'be', Białoruś: 'by', 'Bośnia i Hercegowina': 'ba', Bułgaria: 'bg', Chorwacja: 'hr',
  Cypr: 'cy', Czarnogóra: 'me', Czechy: 'cz', Dania: 'dk', Estonia: 'ee',
  Finlandia: 'fi', Francja: 'fr', Gibraltar: 'gi', Grecja: 'gr', Gruzja: 'ge',
  Hiszpania: 'es', Holandia: 'nl', Irlandia: 'ie', Islandia: 'is', Izrael: 'il',
  Kazachstan: 'kz', Kosovo: 'xk', Liechtenstein: 'li', Litwa: 'lt', Luksemburg: 'lu',
  Łotwa: 'lv', 'Macedonia Północna': 'mk', Malta: 'mt', Mołdawia: 'md', Niemcy: 'de',
  Norwegia: 'no', Polska: 'pl', Portugalia: 'pt', Rumunia: 'ro', 'San Marino': 'sm',
  Serbia: 'rs', Słowacja: 'sk', Słowenia: 'si', Szkocja: 'gb-sct', Szwajcaria: 'ch',
  Szwecja: 'se', Turcja: 'tr', Ukraina: 'ua', Walia: 'gb-wls', Węgry: 'hu',
  Włochy: 'it', 'Wyspy Owcze': 'fo', Anglia: 'gb-eng', 'Irlandia Północna': 'gb-nir',
};

const NT_TEAM_COLORS: Record<string, [string, string, string]> = {
  Albania: ['#E41E20','#000000','#E41E20'],
  Andora: ['#0032A0','#FEDD00','#D52B1E'],
  Armenia: ['#D90012','#0033A0','#F2A800'],
  Austria: ['#ED2939','#FFFFFF','#ED2939'],
  'Azerbejdżan': ['#00B9E4','#ED2939','#3F9C35'],
  Belgia: ['#000000','#FFD100','#EF3340'],
  'Białoruś': ['#D22730','#00AF66','#FFFFFF'],
  'Bośnia i Hercegowina': ['#002395','#FECB00','#002395'],
  'Bułgaria': ['#FFFFFF','#00966E','#D62612'],
  Chorwacja: ['#FF0000','#FFFFFF','#0000FF'],
  Cypr: ['#FFFFFF','#D57800','#FFFFFF'],
  'Czarnogóra': ['#C40308','#FFD700','#C40308'],
  Czechy: ['#11457E','#FFFFFF','#D7141A'],
  Dania: ['#C60C30','#FFFFFF','#C60C30'],
  Estonia: ['#4891D9','#000000','#FFFFFF'],
  Finlandia: ['#003580','#FFFFFF','#003580'],
  Francja: ['#0055A4','#FFFFFF','#EF4135'],
  Gibraltar: ['#D40000','#FFFFFF','#D40000'],
  Grecja: ['#0D5EAF','#FFFFFF','#0D5EAF'],
  Gruzja: ['#E41E20','#FFFFFF','#E41E20'],
  Hiszpania: ['#AA151B','#F1BF00','#AA151B'],
  Holandia: ['#FF4F00','#FFFFFF','#0000FF'],
  Irlandia: ['#169B62','#FFFFFF','#FF883E'],
  'Irlandia Północna': ['#006600','#FFFFFF','#006600'],
  Islandia: ['#02529C','#FFFFFF','#DC1E35'],
  Izrael: ['#0038B8','#FFFFFF','#0038B8'],
  Kazachstan: ['#00AFCA','#FEC50C','#00AFCA'],
  Kosovo: ['#244AA5','#D0A650','#244AA5'],
  Liechtenstein: ['#002B7F','#CE1126','#FFD100'],
  Litwa: ['#FDB913','#006A44','#C1272D'],
  Luksemburg: ['#00A3E0','#FFFFFF','#EF3340'],
  'Łotwa': ['#9E3039','#FFFFFF','#9E3039'],
  'Macedonia Północna': ['#D20000','#FFD700','#D20000'],
  Malta: ['#CF142B','#FFFFFF','#CF142B'],
  'Mołdawia': ['#0033A0','#FFD100','#CE1126'],
  Niemcy: ['#DD0000','#000000','#FFCE00'],
  Norwegia: ['#BA0C2F','#FFFFFF','#00205B'],
  Polska: ['#DC143C','#FFFFFF','#DC143C'],
  Portugalia: ['#006600','#FF0000','#006600'],
  Rumunia: ['#002B7F','#FCD116','#CE1126'],
  'San Marino': ['#5EB6E4','#FFFFFF','#5EB6E4'],
  Serbia: ['#C6363C','#0C4076','#FFFFFF'],
  'Słowacja': ['#0B4EA2','#FFFFFF','#EF3340'],
  'Słowenia': ['#005DA4','#FFFFFF','#ED1C24'],
  Szkocja: ['#0065BD','#FFFFFF','#0065BD'],
  Szwajcaria: ['#FF0000','#FFFFFF','#FF0000'],
  Szwecja: ['#006AA7','#FECC00','#006AA7'],
  Turcja: ['#E30A17','#FFFFFF','#E30A17'],
  Ukraina: ['#005BBB','#FFD500','#005BBB'],
  Walia: ['#D30731','#FFFFFF','#006400'],
  'Węgry': ['#CD2A3E','#FFFFFF','#436F4D'],
  'Włochy': ['#009246','#FFFFFF','#CE2B37'],
  'Wyspy Owcze': ['#0035AD','#FFFFFF','#D21034'],
  Anglia: ['#C8102E','#FFFFFF','#C8102E'],
};

function getMatchGradient(home: string, away: string): string {
  const hc = NT_TEAM_COLORS[home]?.[0] ?? '#334155';
  const ac = NT_TEAM_COLORS[away]?.[0] ?? '#334155';
  return `linear-gradient(to right, ${hc}55 0%, transparent 45%, transparent 55%, ${ac}55 100%)`;
}

function getNTFlagCode(name: string): string | null {
  if (name === 'Anglia') return 'gb-eng';
  if (name === 'Szkocja') return 'gb-sct';
  if (name === 'Walia') return 'gb-wls';
  if (name === 'Irlandia Północna') return 'gb-nir';
  return NT_FLAG_CODE_MAP[name]?.toLowerCase() ?? null;
}

const NTFlag: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => {
  const code = getNTFlagCode(name);
  if (!code) return (
    <div className={`flex items-center justify-center rounded-sm border border-white/10 bg-white/5 text-[9px] font-black text-slate-200 ${className}`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
  return <img src={`https://flagcdn.com/w40/${code}.png`} alt={name} className={`object-cover rounded-sm border border-white/10 ${className}`} />;
};

function translateWeather(d: string): string {
  const m: Record<string, string> = {
    'Clear sky': 'Bezchmurnie', 'Snow storm': 'Burza śnieżna', Thunderstorm: 'Burza',
    Snowfall: 'Opady śniegu', 'Heavy rain': 'Ulewa', Sleet: 'Deszcz ze śniegiem',
    'Light rain': 'Lekki deszcz', 'Strong wind': 'Silny wiatr', Heat: 'Upał',
    Frost: 'Mróz', Cloudy: 'Pochmurno',
  };
  return m[d] ?? d;
}

// ─── GENERIC EVENT LIST ────────────────────────────────────────────────────────

interface EventListProps<T> {
  items: T[];
  align: 'left' | 'right';
  renderItem: (item: T) => React.ReactNode;
  getKey: (item: T) => string;
}

function EventList<T>({ items, align, renderItem, getKey }: EventListProps<T>) {
  if (!items.length) return <div className="min-h-[16px]" />;
  return (
    <div className={`flex flex-wrap gap-x-3 gap-y-0.5 ${align === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}>
      {items.map(item => (
        <span key={getKey(item)} className="inline-flex items-center gap-1">
          {renderItem(item)}
        </span>
      ))}
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function matchGoals(r: WCQPlayoffMatchResult, side: 'home' | 'away'): MatchGoalEntry[] {
  const id = side === 'home' ? r.homeTeamId : r.awayTeamId;
  if (!id || !r.goals) return [];
  return r.goals.filter(g => g.teamId === id);
}

function matchCards(r: WCQPlayoffMatchResult, side: 'home' | 'away'): MatchCardEntry[] {
  const id = side === 'home' ? r.homeTeamId : r.awayTeamId;
  if (!id || !r.cards) return [];
  return r.cards.filter(c => c.teamId === id);
}

function fmtGoal(g: MatchGoalEntry, wentToET: boolean): string {
  const minStr = !wentToET && g.minute > 90 ? `90+${g.minute - 90}` : `${g.minute}`;
  return `${minStr}' ${g.playerName}${g.isPenalty ? ' (k.)' : ''}`;
}

function cardIcon(c: MatchCardEntry): string {
  return c.type === 'YELLOW' ? '🟨' : '🟥';
}

function fmtCard(c: MatchCardEntry): string {
  return c.type === 'SECOND_YELLOW'
    ? `${c.minute}' ${c.playerName} (2. żółta)`
    : `${c.minute}' ${c.playerName}`;
}

// ─── PATH COLORS ──────────────────────────────────────────────────────────────

const PATH_COLORS: Record<string, { accent: string; badge: string; winner: string }> = {
  A: { accent: 'text-amber-400',   badge: 'border-amber-400/30 bg-amber-400/10 text-amber-400',   winner: 'bg-amber-400/15 border-amber-400/40 text-amber-200' },
  B: { accent: 'text-sky-400',     badge: 'border-sky-400/30 bg-sky-400/10 text-sky-400',         winner: 'bg-sky-400/15 border-sky-400/40 text-sky-200' },
  C: { accent: 'text-emerald-400', badge: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400', winner: 'bg-emerald-400/15 border-emerald-400/40 text-emerald-200' },
  D: { accent: 'text-rose-400',    badge: 'border-rose-400/30 bg-rose-400/10 text-rose-400',      winner: 'bg-rose-400/15 border-rose-400/40 text-rose-200' },
};

// ─── FULL MATCH CARD ──────────────────────────────────────────────────────────

const FullMatchCard: React.FC<{
  label: string;
  labelAccent: string;
  result: WCQPlayoffMatchResult;
  winner?: string;
}> = ({ label, labelAccent, result, winner }) => {
  const hGoals = matchGoals(result, 'home');
  const aGoals = matchGoals(result, 'away');
  const hCards = matchCards(result, 'home');
  const aCards = matchCards(result, 'away');

  const homeWon = winner === result.homeTeam;
  const awayWon = winner === result.awayTeam;
  const wentPK = !!result.penaltyWinner;
  const wentET = !!result.wentToExtraTime && !result.penaltyWinner;
  const hasDetails = hGoals.length > 0 || aGoals.length > 0 || hCards.length > 0 || aCards.length > 0;

  const metaParts = [
    result.venue,
    result.attendance ? `${result.attendance.toLocaleString('pl-PL')} widzów` : null,
    result.weather ? `${translateWeather(result.weather.description)} ${result.weather.tempC}°C` : null,
    result.refereeName ? `Sędzia: ${result.refereeName}` : null,
  ].filter(Boolean);

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* Label */}
      <div className="px-4 py-2 bg-white/[0.03] border-b border-white/[0.05]">
        <span className={`text-[9px] font-black uppercase tracking-[0.35em] ${labelAccent}`}>{label}</span>
      </div>

      <div className="px-5 py-4">
        {/* Meta */}
        {metaParts.length > 0 && (
          <div className="flex justify-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950/70 border border-white/[0.06] rounded-lg px-3 py-1.5">
              {metaParts.join(' · ')}
            </span>
          </div>
        )}

        {/* Score row */}
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
            <NTFlag name={result.homeTeam} className="h-5 w-7 shrink-0" />
            {homeWon && <span className={`text-[9px] font-black ${labelAccent} shrink-0`}>✓</span>}
            <span className={`text-base font-black italic uppercase tracking-tighter truncate ${homeWon ? 'text-white' : 'text-slate-400'}`}>
              {result.homeTeam}
            </span>
          </div>

          <div className="flex flex-col items-center mx-5 shrink-0">
            <span className={`text-2xl font-black italic uppercase tracking-tighter tabular-nums ${homeWon || awayWon ? 'text-white' : 'text-slate-300'}`}>
              {result.homeGoals} : {result.awayGoals}
            </span>
            {wentET && (
              <span className="text-[8px] font-black uppercase tracking-widest text-amber-400">Po dog.</span>
            )}
            {wentPK && (
              <span className="text-[8px] font-black uppercase tracking-widest text-amber-400">
                {result.homePenaltyGoals !== undefined ? `${result.homePenaltyGoals} : ${result.awayPenaltyGoals} p.k.` : 'p.k.'}
              </span>
            )}
          </div>

          <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
            <span className={`text-base font-black italic uppercase tracking-tighter truncate ${awayWon ? 'text-white' : 'text-slate-400'}`}>
              {result.awayTeam}
            </span>
            {awayWon && <span className={`text-[9px] font-black ${labelAccent} shrink-0`}>✓</span>}
            <NTFlag name={result.awayTeam} className="h-5 w-7 shrink-0" />
          </div>
        </div>

        {/* Goals + cards */}
        {hasDetails && (
          <div className="mt-3 pt-3 border-t border-white/[0.05] space-y-2">
            {(hGoals.length > 0 || aGoals.length > 0) && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <EventList items={hGoals} align="right" getKey={g => `${g.playerId}-${g.minute}`}
                    renderItem={g => (<><span className="text-emerald-400 text-[11px]">⚽</span><span className="text-xs text-slate-200">{fmtGoal(g, !!result.wentToExtraTime)}</span></>)} />
                </div>
                <div className="w-12 shrink-0" />
                <div className="flex-1">
                  <EventList items={aGoals} align="left" getKey={g => `${g.playerId}-${g.minute}`}
                    renderItem={g => (<><span className="text-emerald-400 text-[11px]">⚽</span><span className="text-xs text-slate-200">{fmtGoal(g, !!result.wentToExtraTime)}</span></>)} />
                </div>
              </div>
            )}
            {(hCards.length > 0 || aCards.length > 0) && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <EventList items={hCards} align="right" getKey={c => `${c.playerId}-${c.minute}-${c.type}`}
                    renderItem={c => (<><span>{cardIcon(c)}</span><span className="text-xs text-slate-300">{fmtCard(c)}</span></>)} />
                </div>
                <div className="w-12 shrink-0" />
                <div className="flex-1">
                  <EventList items={aCards} align="left" getKey={c => `${c.playerId}-${c.minute}-${c.type}`}
                    renderItem={c => (<><span>{cardIcon(c)}</span><span className="text-xs text-slate-300">{fmtCard(c)}</span></>)} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PATH SECTION ─────────────────────────────────────────────────────────────

const PathSection: React.FC<{
  path: WCQPlayoffPath;
  mode: 'SF' | 'FINAL';
}> = ({ path, mode }) => {
  const colors = PATH_COLORS[path.pathLabel];
  const isFinal = mode === 'FINAL';

  return (
    <div className="bg-slate-950/50 border border-white/[0.07] rounded-3xl p-5 flex flex-col gap-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none" />

      {/* Path header */}
      <div className="flex items-center gap-3 pb-2 border-b border-white/[0.06] relative">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-lg ${colors.badge}`}>
          {path.pathLabel}
        </div>
        <span className="text-white/60 text-xs font-black uppercase tracking-widest">Ścieżka {path.pathLabel}</span>
      </div>

      {/* SF mode: 2 full cards side by side + upcoming final strip */}
      {!isFinal && (
        <>
          <div className="flex flex-col gap-3">
            {path.sf1Result && (
              <FullMatchCard
                label="Półfinał 1"
                labelAccent={colors.accent}
                result={path.sf1Result}
                winner={path.sf1Winner}
              />
            )}
            {path.sf2Result && (
              <FullMatchCard
                label="Półfinał 2"
                labelAccent={colors.accent}
                result={path.sf2Result}
                winner={path.sf2Winner}
              />
            )}
          </div>

          {path.finalHome && path.finalAway && (
            <>
              <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent, #F59E0B, transparent)' }} />
              <div className="flex flex-col items-center gap-1 text-center rounded-xl px-3 py-2"
                style={{ background: getMatchGradient(path.finalHome, path.finalAway) }}>
                <span className="text-[9px] font-black italic uppercase tracking-tighter text-white">
                  Finał: 20 marca
                </span>
                <div className="flex items-center gap-3">
                  <NTFlag name={path.finalHome} className="h-5 w-7 shrink-0" />
                  <span className="text-lg font-black italic uppercase tracking-tighter text-slate-200">{path.finalHome}</span>
                  <span className="text-lg font-black italic uppercase tracking-tighter text-slate-500">vs</span>
                  <span className="text-lg font-black italic uppercase tracking-tighter text-slate-200">{path.finalAway}</span>
                  <NTFlag name={path.finalAway} className="h-5 w-7 shrink-0" />
                </div>
              </div>
              <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent, #F59E0B, transparent)' }} />
            </>
          )}
        </>
      )}

      {/* FINAL mode: full final + winner banner */}
      {isFinal && (
        <>
          {/* Full final match card */}
          {path.finalResult && (
            <FullMatchCard
              label="Finał ścieżki"
              labelAccent={colors.accent}
              result={path.finalResult}
              winner={path.qualifier}
            />
          )}

          {/* Qualifier banner */}
          {path.qualifier && (
            <div className={`px-4 py-3 rounded-2xl border text-center ${colors.winner}`}>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-70 mb-1">🎟️ Awans na MŚ 2026</p>
              <div className="flex items-center justify-center gap-2">
                <NTFlag name={path.qualifier} className="h-5 w-7 shrink-0" />
                <p className="text-base font-black uppercase tracking-wide">{path.qualifier}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── MAIN VIEW ────────────────────────────────────────────────────────────────

interface Props {
  mode: 'SF' | 'FINAL';
}

export const WCQPlayoffResultsView: React.FC<Props> = ({ mode }) => {
  const { wcqPlayoffState, advanceDay, navigateTo } = useGame();

  if (!wcqPlayoffState) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
        Brak danych baraży.
      </div>
    );
  }

  const isFinal = mode === 'FINAL';
  const title = isFinal ? 'Baraże MŚ 2026 — Finały' : 'Baraże MŚ 2026 — Półfinały';
  const subtitle = isFinal
    ? '20 marca 2026 · Wyłoniono 4 kwalifikantów na Mistrzostwa Świata'
    : '17 marca 2026 · Wyłoniono finalistów 4 ścieżek';

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{ backgroundImage: `url(${worldCupBg})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.22)' }} />
        <div className="absolute inset-0 bg-slate-950/72" />
      </div>

      <div className="relative z-10 flex flex-col h-full overflow-auto">
        <div className="flex-1 p-5 flex flex-col gap-4 max-w-[1400px] mx-auto w-full">

          {/* Header */}
          <div className="bg-slate-950/50 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-3xl p-5 flex items-center justify-between shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
            <div className="flex items-center gap-5 relative">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shrink-0">
                {isFinal ? '🎟️' : '⚽'}
              </div>
              <div>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.5em]">
                  UEFA · Kwalifikacje Mistrzostw Świata 2026
                </p>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none mt-0.5">
                  {title}
                </h1>
                <p className="text-slate-500 text-[10px] mt-1">{subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => { advanceDay(); navigateTo(ViewState.DASHBOARD); }}
              className="px-8 py-4 bg-white hover:bg-white/90 text-slate-900 font-black italic uppercase tracking-widest rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 text-sm shrink-0 relative"
            >
              KONTYNUUJ →
            </button>
          </div>

          {/* 2×2 path grid */}
          <div className="flex flex-col gap-4">
            {(['A', 'B', 'C', 'D'] as const).map(label => {
              const path = wcqPlayoffState.paths.find(p => p.pathLabel === label);
              if (!path) return null;
              return <PathSection key={label} path={path} mode={mode} />;
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
