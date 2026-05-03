import React, { useRef, useState } from 'react';
import wcBgImg from '../../Graphic/themes/worldcup.png';
import { useGame } from '../../context/GameContext';
import { ViewState, WCTeam } from '../../types';

const HEADING_FONT = 'font-black italic uppercase tracking-tighter';
const BTN_FONT = 'font-black italic uppercase tracking-widest';

const FLAG_CODE_MAP: Record<string, string> = {
  Albania: 'AL', Andora: 'AD', Armenia: 'AM', Austria: 'AT', Azerbejdżan: 'AZ',
  Belgia: 'BE', Białoruś: 'BY', 'Bośnia i Hercegowina': 'BA', Bułgaria: 'BG', Chorwacja: 'HR',
  Cypr: 'CY', Czarnogóra: 'ME', Czechy: 'CZ', Dania: 'DK', Estonia: 'EE',
  Finlandia: 'FI', Francja: 'FR', Gibraltar: 'GI', Grecja: 'GR', Gruzja: 'GE',
  Hiszpania: 'ES', Holandia: 'NL', Irlandia: 'IE', Islandia: 'IS', Izrael: 'IL',
  Kazachstan: 'KZ', Kosovo: 'XK', Liechtenstein: 'LI', Litwa: 'LT', Luksemburg: 'LU',
  Łotwa: 'LV', 'Macedonia Północna': 'MK', Malta: 'MT', Mołdawia: 'MD', Niemcy: 'DE',
  Norwegia: 'NO', Polska: 'PL', Portugalia: 'PT', Rosja: 'RU', Rumunia: 'RO',
  'San Marino': 'SM', Serbia: 'RS', Słowacja: 'SK', Słowenia: 'SI', Szwajcaria: 'CH',
  Szwecja: 'SE', Turcja: 'TR', Ukraina: 'UA', Węgry: 'HU', Włochy: 'IT', 'Wyspy Owcze': 'FO',
  Algieria: 'DZ', Angola: 'AO', 'Burkina Faso': 'BF', Kamerun: 'CM', "Côte d'Ivoire": 'CI',
  Egipt: 'EG', Ghana: 'GH', Gwinea: 'GN', Maroko: 'MA', Mali: 'ML', Nigeria: 'NG',
  Senegal: 'SN', 'RPA': 'ZA', Tanzania: 'TZ', Tunezja: 'TN', Uganda: 'UG', Zambia: 'ZM',
  Argentyna: 'AR', Boliwia: 'BO', Brazylia: 'BR', Chile: 'CL', Ekwador: 'EC',
  Kolumbia: 'CO', Peru: 'PE', Paragwaj: 'PY', Urugwaj: 'UY', Wenezuela: 'VE',
  Meksyk: 'MX', Kanada: 'CA', 'Stany Zjednoczone': 'US', Kostaryka: 'CR', Honduras: 'HN',
  Jamajka: 'JM', Panama: 'PA', 'Trynidad i Tobago': 'TT', Kuba: 'CU',
  Australia: 'AU', Chiny: 'CN', Indie: 'IN', Indonezja: 'ID', Iran: 'IR',
  Irak: 'IQ', Japonia: 'JP', 'Korea Południowa': 'KR', 'Arabia Saudyjska': 'SA',
  'Zjednoczone Emiraty Arabskie': 'AE', Uzbekistan: 'UZ', 'Wietnam': 'VN', Katar: 'QA',
  'Nowa Zelandia': 'NZ', Fiji: 'FJ', Salwador: 'SV', Szkocja: 'GB-SCT', Walia: 'GB-WLS',
  'Irlandia Północna': 'GB-NIR', Anglia: 'GB-ENG',
};

function getFlagCode(name: string): string | null {
  return FLAG_CODE_MAP[name]?.toLowerCase() ?? null;
}

function DrawFlag({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const code = getFlagCode(name);
  const cls = size === 'sm' ? 'w-5 h-3' : 'h-5 w-7';
  if (!code) {
    return (
      <div className={`${cls} rounded-sm border border-white/10 bg-white/10 flex items-center justify-center text-[8px] font-black text-slate-300 shrink-0`}>
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={name}
      className={`${cls} object-cover rounded-sm border border-white/10 shrink-0`}
    />
  );
}

const POT_COLORS = [
  { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-300', label: 'KOSZYK 1' },
  { bg: 'bg-sky-500/20',   border: 'border-sky-500/50',   text: 'text-sky-300',   label: 'KOSZYK 2' },
  { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-300', label: 'KOSZYK 3' },
  { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-300', label: 'KOSZYK 4' },
];

const CONF_LABEL: Record<string, string> = {
  UEFA: 'UEFA', CAF: 'CAF', AFC: 'AFC', CONMEBOL: 'CONM', CONCACAF: 'CONC', OFC: 'OFC', INTERCONT: 'INT',
};

function TeamChip({ team, drawnTo, isActive }: { team: WCTeam; drawnTo?: string; isActive: boolean }) {
  const isDrawn = !!drawnTo;
  const isTBD = team.isPlayoffSlot;
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-300 ${
      isActive ? 'ring-2 ring-amber-400 bg-amber-400/10' :
      isDrawn ? 'opacity-40' :
      'bg-white/[0.04] border border-white/[0.06]'
    }`}>
      {isTBD ? (
        <div className="w-5 h-3 rounded-sm border border-dashed border-white/30 bg-white/5 shrink-0" />
      ) : (
        <DrawFlag name={team.name} size="sm" />
      )}
      <span className={`text-[10px] font-bold truncate max-w-[80px] ${isTBD ? 'text-white/30 italic' : 'text-white/90'}`}>
        {isTBD ? `Zw. Ścieżki ${team.name.replace('TBD_PATH_', '')}` : team.name}
      </span>
      {team.isHost && <span className="text-[8px] text-amber-400 font-black">★</span>}
      {isDrawn && <span className="text-[9px] text-white/30 ml-auto">→{drawnTo}</span>}
    </div>
  );
}

function GroupSlot({ label, teams, revealedCount }: { label: string; teams: string[]; revealedCount: number }) {
  const isTBD = (name: string) => name.startsWith('TBD_PATH_');
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-2.5">
      <div className="relative flex justify-center mb-2 overflow-hidden rounded-lg py-0.5">
        <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(to right, transparent 0%, #f59e0b 25%, #ffffff 50%, #f59e0b 75%, transparent 100%)' }} />
        <span className={`${HEADING_FONT} text-sm text-white relative z-10`}>Grupa {label}</span>
      </div>
      <div className="flex flex-col gap-1">
        {teams.slice(0, revealedCount).map((name, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-500 ${
              i === revealedCount - 1 ? 'bg-amber-400/15 border border-amber-400/30 scale-[1.02]' : 'bg-white/[0.05]'
            }`}
          >
            {isTBD(name) ? (
              <>
                <div className="w-4 h-2.5 rounded-sm border border-dashed border-white/20 bg-white/5 shrink-0" />
                <span className="text-[9px] text-white/30 italic">Zw. Ścieżki {name.replace('TBD_PATH_', '')}</span>
              </>
            ) : (
              <>
                <DrawFlag name={name} size="sm" />
                <span className="text-[10px] text-white/90 font-semibold truncate">{name}</span>
              </>
            )}
          </div>
        ))}
        {Array.from({ length: Math.max(0, 4 - revealedCount) }).map((_, i) => (
          <div key={`empty-${i}`} className="h-[26px] rounded-md border border-dashed border-white/10 bg-white/[0.02]" />
        ))}
      </div>
    </div>
  );
}

type DrawStep = { potIndex: number; teamIndex: number; groupLabel: string };

function buildDrawSteps(pots: WCTeam[][], groups: { label: string; teams: string[] }[]): DrawStep[] {
  const steps: DrawStep[] = [];
  // Budujemy sekwencję: dla każdego koszyka, każda drużyna → znalazienie jej grupy
  for (let p = 0; p < pots.length; p++) {
    for (let t = 0; t < pots[p].length; t++) {
      const teamName = pots[p][t].name;
      const group = groups.find(g => g.teams.includes(teamName));
      if (group) {
        steps.push({ potIndex: p, teamIndex: t, groupLabel: group.label });
      }
    }
  }
  return steps;
}

const WCDrawView: React.FC = () => {
  const { wcState, navigateTo } = useGame();
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [ceremonyStarted, setCeremonyStarted] = useState(false);
  const [ceremonyDone, setCeremonyDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!wcState?.drawComplete) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ backgroundImage: `url(${wcBgImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="text-white/60 text-lg font-bold">Losowanie jeszcze się nie odbyło.</div>
        <button className="ml-4 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-bold" onClick={() => navigateTo(ViewState.DASHBOARD)}>Powrót</button>
      </div>
    );
  }

  // Budujemy poty na podstawie danych z wcState
  // Pots są odtwarzane z teams: Pot1 = hosty + 9 najlepszych, itd.
  // Uproszczenie: podział wg reputacji (tak jak w drawGroupsWithFIFARules)
  const hosts = wcState.teams.filter(t => t.isHost);
  const tbdTeams = wcState.teams.filter(t => t.isPlayoffSlot);
  const nonHostNonTBD = wcState.teams
    .filter(t => !t.isHost && !t.isPlayoffSlot)
    .sort((a, b) => b.reputation - a.reputation);

  const pot1: WCTeam[] = [...hosts, ...nonHostNonTBD.slice(0, 12 - hosts.length)];
  const pot2: WCTeam[] = nonHostNonTBD.slice(12 - hosts.length, 24 - hosts.length);
  const pot3: WCTeam[] = nonHostNonTBD.slice(24 - hosts.length, 36 - hosts.length);
  const pot4: WCTeam[] = [...nonHostNonTBD.slice(36 - hosts.length), ...tbdTeams];
  const pots: WCTeam[][] = [pot1, pot2, pot3, pot4];

  const drawSteps = buildDrawSteps(pots, wcState.groups);
  const totalSteps = drawSteps.length;

  // Ile drużyn już wylosowanych per grupa
  const revealedPerGroup: Record<string, number> = {};
  for (let i = 0; i < revealedSteps; i++) {
    const step = drawSteps[i];
    if (step) revealedPerGroup[step.groupLabel] = (revealedPerGroup[step.groupLabel] ?? 0) + 1;
  }

  // Która drużyna jest aktualnie "aktywna" w koszyku
  const currentStep = revealedSteps > 0 ? drawSteps[revealedSteps - 1] : null;

  const startCeremony = () => {
    setCeremonyStarted(true);
    let step = 0;
    const tick = () => {
      step++;
      setRevealedSteps(step);
      if (step < totalSteps) {
        timerRef.current = setTimeout(tick, 1500);
      } else {
        setCeremonyDone(true);
      }
    };
    timerRef.current = setTimeout(tick, 800);
  };

  const skipToEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRevealedSteps(totalSteps);
    setCeremonyStarted(true);
    setCeremonyDone(true);
  };

  const handleGoToWorld = () => {
    navigateTo(ViewState.WORLD_CUP);
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col"
      style={{ backgroundImage: `url(${wcBgImg})`, backgroundSize: 'cover', backgroundPosition: 'center top' }}
    >
      <div className="absolute inset-0 bg-slate-950/75 pointer-events-none" />

      <div className="relative z-10 flex flex-col flex-1 px-4 py-5 max-w-7xl mx-auto w-full">

        {/* Nagłówek */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className={`${HEADING_FONT} text-4xl text-white`}>
              Ceremonia Losowania
              <span className="text-amber-400 ml-3">MŚ {wcState.year}</span>
            </div>
            <div className="text-xs text-white/50 mt-1">12 Grudnia · Losowanie Grup · FIFA</div>
          </div>
          <div className="flex items-center gap-3">
            {!ceremonyStarted && (
              <>
                <button
                  className={`${BTN_FONT} text-xs px-6 py-2.5 rounded-2xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all`}
                  onClick={startCeremony}
                >
                  Ceremonia
                </button>
                <button
                  className={`${BTN_FONT} text-xs px-5 py-2.5 rounded-2xl bg-white/10 text-white border border-white/10 hover:bg-white/20 transition-all`}
                  onClick={skipToEnd}
                >
                  Pomiń do końca
                </button>
              </>
            )}
            {ceremonyStarted && !ceremonyDone && (
              <button
                className={`${BTN_FONT} text-xs px-5 py-2.5 rounded-2xl bg-white/10 text-white border border-white/10 hover:bg-white/20 transition-all`}
                onClick={skipToEnd}
              >
                Pomiń do końca
              </button>
            )}
            {ceremonyDone && (
              <button
                className={`${BTN_FONT} text-xs px-6 py-2.5 rounded-2xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all`}
                onClick={handleGoToWorld}
              >
                Podgląd Grup →
              </button>
            )}
            <button
              className={`${BTN_FONT} text-xs px-5 py-2.5 rounded-2xl bg-white/10 text-white border border-white/10 hover:bg-white/20 transition-all`}
              onClick={() => navigateTo(ViewState.DASHBOARD)}
            >
              Powrót
            </button>
          </div>
        </div>

        {/* Info o TBD */}
        <div className="mb-4 flex items-center gap-3 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm border border-dashed border-white/30 inline-block" />
            4 miejsca zarezerwowane dla zwycięzców baraży UEFA (marzec {wcState.year})
          </span>
          {wcState.playoffSlotsResolved && (
            <span className="text-green-400 font-bold">✓ Barażyści znani</span>
          )}
          {!wcState.playoffSlotsResolved && (
            <span className="text-amber-400">⏳ Barażyści zostaną ujawnieni w marcu</span>
          )}
        </div>

        <div className="flex gap-4 flex-1">
          {/* Lewa strona: 4 koszyki */}
          <div className="w-[280px] shrink-0 flex flex-col gap-3">
            {pots.map((pot, p) => {
              const pc = POT_COLORS[p];
              const isActivePot = !ceremonyDone && currentStep?.potIndex === p;
              return (
                <div
                  key={p}
                  className={`${pc.bg} border ${pc.border} rounded-2xl p-3 transition-all duration-300 ${isActivePot ? 'ring-2 ring-amber-400/50' : ''}`}
                >
                  <div className={`text-[10px] font-black uppercase tracking-widest ${pc.text} mb-2`}>
                    {POT_COLORS[p].label}
                    {isActivePot && <span className="ml-2 animate-pulse">●</span>}
                  </div>
                  <div className="flex flex-col gap-1">
                    {pot.map((team, t) => {
                      const drawnStep = drawSteps.findIndex(s => s.potIndex === p && s.teamIndex === t);
                      const isDrawn = drawnStep >= 0 && drawnStep < revealedSteps;
                      const isActivePotTeam = !ceremonyDone && currentStep?.potIndex === p && currentStep?.teamIndex === t;
                      const drawnGroup = isDrawn ? drawSteps[drawnStep]?.groupLabel : undefined;
                      return (
                        <TeamChip
                          key={team.name}
                          team={team}
                          drawnTo={drawnGroup}
                          isActive={isActivePotTeam}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prawa strona: 12 grup */}
          <div className="flex-1">
            {/* Pasek postępu */}
            {ceremonyStarted && !ceremonyDone && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                  <span>Losowanie w toku...</span>
                  <span>{revealedSteps} / {totalSteps}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${(revealedSteps / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {!ceremonyStarted && (
              <div className="mb-3 flex items-center justify-center h-8">
                <span className="text-white/30 text-sm italic">Kliknij "Ceremonia" aby rozpocząć losowanie lub "Pomiń do końca" aby zobaczyć wynik</span>
              </div>
            )}
            {ceremonyDone && (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-green-400 text-sm font-bold">✓ Losowanie zakończone</span>
                <span className="text-white/40 text-xs">· wszystkie grupy wypełnione</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {wcState.groups.map(group => (
                <GroupSlot
                  key={group.label}
                  label={group.label}
                  teams={group.teams}
                  revealedCount={!ceremonyStarted ? 0 : revealedPerGroup[group.label] ?? 0}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WCDrawView;
