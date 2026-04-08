import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { PlayerPosition, PlayerAttributes, ViewState, Player } from '../../types';
import { Button } from '../ui/Button';
import rezerwyBg from '../../Graphic/themes/rezerwy.png';
import { getClubLogo } from '../../resources/ClubLogoAssets';

const POSITION_LABEL: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'BR',
  [PlayerPosition.DEF]: 'OBR',
  [PlayerPosition.MID]: 'POM',
  [PlayerPosition.FWD]: 'NAP',
};

const POSITION_ROW_BG: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'bg-yellow-900/40',
  [PlayerPosition.DEF]: 'bg-blue-900/40',
  [PlayerPosition.MID]: 'bg-emerald-900/40',
  [PlayerPosition.FWD]: 'bg-red-900/40',
};

const ATTR_KEYS: (keyof PlayerAttributes)[] = [
  'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking',
  'finishing', 'technique', 'vision', 'dribbling', 'heading', 'positioning',
  'goalkeeping', 'freeKicks', 'talent', 'penalties', 'corners', 'aggression',
  'crossing', 'leadership', 'mentality', 'workRate',
];

const ATTR_LABELS: Record<string, string> = {
  strength: 'SIŁ',
  stamina: 'WYT',
  pace: 'PRD',
  defending: 'OBR',
  passing: 'POD',
  attacking: 'ATK',
  finishing: 'SKU',
  technique: 'TEC',
  vision: 'WIZ',
  dribbling: 'DRY',
  heading: 'GŁO',
  positioning: 'POZ',
  goalkeeping: 'BR',
  freeKicks: 'WRZ',
  talent: 'TAL',
  penalties: 'KAR',
  corners: 'ROZ',
  aggression: 'AGR',
  crossing: 'DOŚ',
  leadership: 'LID',
  mentality: 'MEN',
  workRate: 'PRA',
};

const ATTR_FULL_NAMES: Record<string, string> = {
  strength: 'Siła fizyczna',
  stamina: 'Wytrzymałość',
  pace: 'Prędkość',
  defending: 'Obrona',
  passing: 'Podania',
  attacking: 'Atak',
  finishing: 'Skuteczność',
  technique: 'Technika',
  vision: 'Wizja gry',
  dribbling: 'Drybling',
  heading: 'Główkowanie',
  positioning: 'Pozycjonowanie',
  goalkeeping: 'Bramkarstwo',
  freeKicks: 'Rzuty wolne',
  talent: 'Talent',
  penalties: 'Rzuty karne',
  corners: 'Rozgrywanie',
  aggression: 'Agresja',
  crossing: 'Dośrodkowania',
  leadership: 'Liderstwo',
  mentality: 'Mentalność',
  workRate: 'Pracowitość',
};

const POSITION_ORDER = [PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD];

// Kluczowe atrybuty dla danej pozycji — jeśli wartość ≤ 35, atrybut oznaczony jako alarmująco niski
const POSITION_KEY_ATTRS: Record<PlayerPosition, (keyof PlayerAttributes)[]> = {
  [PlayerPosition.GK]:  ['goalkeeping', 'positioning', 'strength'],
  [PlayerPosition.DEF]: ['defending', 'heading', 'strength', 'positioning'],
  [PlayerPosition.MID]: ['passing', 'vision', 'stamina', 'technique'],
  [PlayerPosition.FWD]: ['finishing', 'attacking', 'pace', 'positioning'],
};
const WEAK_THRESHOLD = 35;

const isWeakForPosition = (pos: PlayerPosition, attr: keyof PlayerAttributes, val: number): boolean =>
  val <= WEAK_THRESHOLD && POSITION_KEY_ATTRS[pos].includes(attr);

const POSITION_FULL_NAME: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]:  'Bramkarz',
  [PlayerPosition.DEF]: 'Obrońca',
  [PlayerPosition.MID]: 'Pomocnik',
  [PlayerPosition.FWD]: 'Napastnik',
};

const POSITION_BADGE_STYLE: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]:  'bg-yellow-500/20 border border-yellow-500/60 text-yellow-300',
  [PlayerPosition.DEF]: 'bg-blue-500/20 border border-blue-500/60 text-blue-300',
  [PlayerPosition.MID]: 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300',
  [PlayerPosition.FWD]: 'bg-red-500/20 border border-red-500/60 text-red-300',
};

const POS_PRAISE: Record<PlayerPosition, string[]> = {
  [PlayerPosition.GK]: [
    'Dobry refleks, pewny na przedpolu.',
    'Spokojny pod presją, komenderuje obroną.',
    'Świetne wyjścia z bramki, nie boi się konfrontacji.',
    'Bardzo dobra gra na linii.',
    'Czyta grę rywalów lepiej niż większość zawodników w jego wieku.',
  ],
  [PlayerPosition.DEF]: [
    'Silny w powietrzu i dominuje przy stałych fragmentach.',
    'Dobra praca nóg, wychodzi z pressingu bez strat.',
    'Dobry timing przy wślizgach, rzadko popełnia błędy pozycyjne.',
    'Mocny fizycznie, bardzo szybki',
    'Bardzo dobry stoper',
    'Potrafi bardzo dobrze uwolnić się spod pressingu.',
  ],
  [PlayerPosition.MID]: [
    'Świetna wizja gry. Widzi więcej niż inni.',
    'Technicznie wyróżniający się w ciasnych sytuacjach.',
    'Mocno pracuje przez całe spotkanie, nie odpuszcza żadnej piłki.',
    'Aktywny w pressingu, odzyskuje cenne piłki.',
    'Kreatywny i trudny do przewidzenia, potrafi zaskoczyć rywala.',
    'Inteligentne poruszanie bez piłki, zawsze dostępny do podania.',
  ],
  [PlayerPosition.FWD]: [
    'Instynkt strzeleck, dobrze potrafi odnaleźć się w polu karnym.',
    'Szybki w akcjach 1 na 1, trudny do zatrzymania.',
    'Dobra gra głową, groźny przy dośrodkowaniach.',
    'Potrafi utrzymać piłkę i wciągnąć obrońców.',
    'Nieprzewidywalny w polu karnym, zawsze szuka wykończenia.',
    'Świetna gra bez piłki.',
  ],
};

const POS_CONCERN: Record<PlayerPosition, string[]> = {
  [PlayerPosition.GK]: [
    'Niepewny przy wyjściach.',
    'Słaba gra nogami, rywal może to wykorzystać.',
  ],
  [PlayerPosition.DEF]: [
    'Problemy z powrotami po akcjach ofensywnych.',
    'Za słaby w powietrzu jak na tę pozycję.',
  ],
  [PlayerPosition.MID]: [
    'Słaba gra bez piłki.',
    'Słabe pressing, nie wraca wystarczająco szybko.',
  ],
  [PlayerPosition.FWD]: [
    'Wykończenie wymaga dużej pracy, gdyż marnuje zbyt wiele okazji.',
    'Niepewny w kluczowych momentach meczu.',
  ],
};

const COACH_INTROS = [
  'Przejrzałem dokładnie kadrę. Oto moje obserwacje z ostatnich tygodni:',
  'Obserwowałem chłopaków na treningach i meczach sparingowych. Mam kilka uwag:',
  'To ciekawy zespół, są tu zawodnicy z potencjałem, ale też tacy wymagający pracy:',
  'Będąc obiektywnym widzę, że:',
  'Po ostatnim miesiącu intensywnych treningów mogę przedstawić moje spostrzeżenia:',
  'Obserwuję ich uważnie od jakiegoś czasu i mam konkretne wnioski:',
];

interface ReportEntry {
  player: Player;
  perceivedTalent: number;
  note: string;
  tier: 'gem' | 'solid' | 'concern';
}

interface CoachReport {
  intro: string;
  highlights: ReportEntry[];
  concerns: ReportEntry[];
}

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateCoachReport(players: Player[], seed: number): CoachReport {
  const rng = seededRand(seed);
  const rand = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

  const evaluated = players.map(p => {
    // Bias: 0.35–1.65 — trener może mocno niedocenić lub przecenić zawodnika
    const bias = 0.35 + rng() * 1.3;
    const perceivedTalent = Math.round(Math.min(99, Math.max(1, p.attributes.talent * bias)));
    return { player: p, perceivedTalent };
  });

  evaluated.sort((a, b) => b.perceivedTalent - a.perceivedTalent);

  const topCount = 3 + Math.floor(rng() * 3); // 3–5
  const highlights: ReportEntry[] = evaluated.slice(0, topCount).map(e => ({
    player: e.player,
    perceivedTalent: e.perceivedTalent,
    note: rand(POS_PRAISE[e.player.position]),
    tier: e.perceivedTalent >= 68 ? 'gem' : 'solid',
  }));

  const concerns: ReportEntry[] = evaluated
    .filter(e => {
      const keyAttrs = POSITION_KEY_ATTRS[e.player.position];
      return keyAttrs.some(attr => e.player.attributes[attr] <= WEAK_THRESHOLD);
    })
    .slice(0, 2)
    .map(e => ({
      player: e.player,
      perceivedTalent: e.perceivedTalent,
      note: rand(POS_CONCERN[e.player.position]),
      tier: 'concern' as const,
    }));

  return { intro: rand(COACH_INTROS), highlights, concerns };
}

export const ReservesView: React.FC = () => {
  const { reserves, navigateTo, viewPlayerDetails, userTeamId, clubs, currentDate, seasonNumber,
          players, setPlayers, setReserves, lineups, updateLineup,
          coaches, viewCoachDetails, reserveCoachId } = useGame();
  const [showReport, setShowReport] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; player: Player } | null>(null);

  const moveToFirstTeam = (player: Player) => {
    if (!userTeamId) return;
    setReserves(prev => prev.filter(p => p.id !== player.id));
    setPlayers(prev => ({ ...prev, [userTeamId]: [...(prev[userTeamId] ?? []), player] }));
    const currentLineup = lineups[userTeamId];
    if (currentLineup) {
      updateLineup(userTeamId, { ...currentLineup, reserves: [...currentLineup.reserves, player.id] });
    }
  };

  const myClub = clubs.find(c => c.id === userTeamId);
  const reserveCoach = reserveCoachId ? coaches[reserveCoachId] : null;

  const weekKey = useMemo(
    () => Math.floor(currentDate.getTime() / (7 * 24 * 3600 * 1000)) + seasonNumber * 1000,
    [currentDate, seasonNumber]
  );

  const weeklyReport = useMemo(
    () => reserves.length > 0 ? generateCoachReport(reserves, weekKey) : null,
    [reserves, weekKey]
  );

  const sortedReserves = useMemo(() => {
    return [...reserves].sort((a, b) => {
      const posA = POSITION_ORDER.indexOf(a.position);
      const posB = POSITION_ORDER.indexOf(b.position);
      if (posA !== posB) return posA - posB;
      return b.overallRating - a.overallRating;
    });
  }, [reserves]);

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={rezerwyBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.35 }}
        />
        <div className="absolute inset-0 bg-slate-950/65" />
      </div>

    <div className="min-h-screen text-slate-50 p-4 relative z-10">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {myClub && getClubLogo(myClub.id) && (
              <img
                src={getClubLogo(myClub.id)}
                alt={myClub.name}
                className="w-16 h-16 object-contain drop-shadow-2xl shrink-0"
              />
            )}
            <div>
              {myClub && (
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">{myClub.name} II</p>
              )}
              <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-400 to-slate-600">REZERWY</h1>
              {myClub && (
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">{reserves.length} zawodników</p>
              )}
              {reserveCoach && (
                <button
                  onClick={() => viewCoachDetails(reserveCoach.id)}
                  className="mt-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80 hover:text-amber-300 transition-colors group"
                >
                  <span className="text-amber-500/60 group-hover:text-amber-400 transition-colors">🎽</span>
                  <span>Trener rezerw: {reserveCoach.firstName} {reserveCoach.lastName}</span>
                  <span className="text-amber-600/50 group-hover:text-amber-400 transition-colors">{reserveCoach.nationalityFlag}</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowReport(true)}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600/15 border border-amber-500/40 text-amber-400 font-black italic uppercase tracking-widest text-xs hover:bg-amber-600/25 hover:border-amber-400/60 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
            >
              <span>📋</span>
              <span>Analiza trenera</span>
            </button>
            <button
              onClick={() => navigateTo(ViewState.DASHBOARD)}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-black italic uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Powrót</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="px-2 py-2 text-left sticky left-0 bg-slate-800 z-10 whitespace-nowrap">Poz</th>
                <th className="px-2 py-2 text-left sticky left-[44px] bg-slate-800 z-10 whitespace-nowrap min-w-[130px]">Zawodnik</th>
                {ATTR_KEYS.map(key => (
                  <th key={key} title={ATTR_FULL_NAMES[key]} className="px-1 py-2 text-center whitespace-nowrap cursor-help">{ATTR_LABELS[key]}</th>
                ))}
                <th className="px-2 py-2 text-center whitespace-nowrap">Wiek</th>
              </tr>
            </thead>
            <tbody>
              {sortedReserves.map((player) => (
                <tr
                  key={player.id}
                  className={`${POSITION_ROW_BG[player.position]} border-b border-slate-700/50 hover:brightness-110 transition-all cursor-pointer`}
                  onClick={() => viewPlayerDetails(player.id)}
                  onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, player }); }}
                >
                  <td className={`px-1 py-1.5 sticky left-0 z-10 ${POSITION_ROW_BG[player.position]}`}>
                    <div className="relative group/pos w-9">
                      <div className={`w-9 h-7 rounded-full flex items-center justify-center text-[9px] font-black italic tracking-tight ${POSITION_BADGE_STYLE[player.position]}`}>
                        {POSITION_LABEL[player.position]}
                      </div>
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 opacity-0 group-hover/pos:opacity-100 transition-opacity duration-150">
                        <div className="bg-slate-900 border border-slate-600 text-slate-100 text-[10px] font-black uppercase tracking-widest whitespace-nowrap px-2 py-1 rounded-lg shadow-xl">
                          {POSITION_FULL_NAME[player.position]}
                        </div>
                        <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-600 rotate-45 mx-auto -mt-1" />
                      </div>
                    </div>
                  </td>
                  <td className={`px-2 py-1.5 sticky left-[44px] z-10 whitespace-nowrap ${POSITION_ROW_BG[player.position]}`}>
                    <span className="font-semibold italic tracking-tight uppercase text-slate-100 text-[15px]">{player.firstName} {player.lastName}</span>
                  </td>
                  {ATTR_KEYS.map(key => {
                    const val = player.attributes[key];
                    const isTop = val >= 65;
                    const isWeak = isWeakForPosition(player.position, key, val);
                    return (
                      <td key={key} className={`px-1 py-1.5 text-center font-medium italic tracking-tight text-[11px] ${isTop ? 'text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]' : isWeak ? 'text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.5)]' : 'text-slate-100'}`} style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 1px rgba(0,0,0,1)' }}>
                        {val}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5 text-center text-slate-300 font-medium">{player.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {contextMenu && (
      <div
        className="fixed z-[9999] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 min-w-[220px]"
        style={{ top: contextMenu.y, left: contextMenu.x }}
        onMouseLeave={() => setContextMenu(null)}
      >
        <button
          onClick={() => { moveToFirstTeam(contextMenu.player); setContextMenu(null); }}
          className="w-full px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-3"
        >
          <span className="text-base">↑</span> Przenieś do 1. drużyny
        </button>
        <div className="my-1 border-t border-white/10" />
        <button
          onClick={() => { viewPlayerDetails(contextMenu.player.id); setContextMenu(null); }}
          className="w-full px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-colors flex items-center gap-3"
        >
          <span className="text-base">👤</span> Karta zawodnika
        </button>
      </div>
    )}

    {showReport && weeklyReport && (
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80"
        onClick={() => setShowReport(false)}
      >
        <div
          className="relative w-full max-w-2xl mx-4 bg-slate-900 border border-white/10 rounded-[32px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* gradient top bar */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

          {/* header */}
          <div className="flex items-center justify-between px-7 pt-7 pb-4 border-b border-white/5 shrink-0">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.45em] text-amber-500 mb-1">📋 Raport tygodniowy</p>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">Trener Rezerw</h2>
            </div>
            <button
              onClick={() => setShowReport(false)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-sm font-black"
            >
              ✕
            </button>
          </div>

          {/* scrollable body */}
          <div className="overflow-y-auto px-7 py-5 space-y-6">
            {/* intro */}
            <p className="text-[13px] text-slate-300 italic leading-relaxed border-l-2 border-slate-600 pl-4">
              {weeklyReport.intro}
            </p>

            {/* highlights */}
            {weeklyReport.highlights.length > 0 && (
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-amber-500 mb-3">◆ Na uwagę zasługują</p>
                <div className="space-y-3">
                  {weeklyReport.highlights.map(e => (
                    <div
                      key={e.player.id}
                      className="bg-slate-800/60 rounded-2xl px-4 py-3 cursor-pointer hover:bg-slate-800 transition-colors border border-white/5"
                      onClick={() => { viewPlayerDetails(e.player.id); setShowReport(false); }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-9 h-6 rounded-full flex items-center justify-center text-[8px] font-black italic shrink-0 ${POSITION_BADGE_STYLE[e.player.position]}`}>
                          {POSITION_LABEL[e.player.position]}
                        </div>
                        <span className={`text-sm font-black italic uppercase tracking-tight ${e.tier === 'gem' ? 'text-amber-300' : 'text-white'}`}>
                          {e.player.firstName} {e.player.lastName}
                        </span>
                        {e.tier === 'gem' && (
                          <span className="text-[7px] font-black uppercase tracking-widest text-amber-500 border border-amber-700/50 rounded px-1.5 py-0.5">★ TALENT</span>
                        )}
                        <span className="text-[9px] text-slate-500 ml-auto">{e.player.age} lat</span>
                      </div>
                      <p className="text-[12px] text-slate-300 leading-relaxed">
                        Myślę, że na uwagę zasługuje <span className={`font-bold ${e.tier === 'gem' ? 'text-amber-300' : 'text-white'}`}>{e.player.firstName} {e.player.lastName}</span>, ponieważ <span className="italic text-slate-400">{e.note}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* concerns */}
            {weeklyReport.concerns.length > 0 && (
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-red-500 mb-3">⚠ Niepokoi mnie</p>
                <div className="space-y-3">
                  {weeklyReport.concerns.map(e => (
                    <div
                      key={e.player.id}
                      className="bg-red-950/30 rounded-2xl px-4 py-3 cursor-pointer hover:bg-red-950/50 transition-colors border border-red-900/30"
                      onClick={() => { viewPlayerDetails(e.player.id); setShowReport(false); }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-9 h-6 rounded-full flex items-center justify-center text-[8px] font-black italic shrink-0 ${POSITION_BADGE_STYLE[e.player.position]}`}>
                          {POSITION_LABEL[e.player.position]}
                        </div>
                        <span className="text-sm font-black italic uppercase tracking-tight text-red-300">
                          {e.player.firstName} {e.player.lastName}
                        </span>
                        <span className="text-[9px] text-slate-500 ml-auto">{e.player.age} lat</span>
                      </div>
                      <p className="text-[12px] text-slate-300 leading-relaxed">
                        Martwi mnie <span className="font-bold text-red-300">{e.player.firstName} {e.player.lastName}</span> — <span className="italic text-slate-400">{e.note}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};
