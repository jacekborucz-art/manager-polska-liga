import React, { useMemo, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { NationsLeagueGroup, NationsLeagueTier, ViewState } from '../../types';

const HEADING_FONT = 'font-black italic uppercase tracking-tighter';
const BTN_FONT = 'font-black italic uppercase tracking-widest';

const TIER_META: Record<NationsLeagueTier, { title: string; accent: string; bg: string; border: string }> = {
  A: { title: 'Liga A', accent: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-400/30' },
  B: { title: 'Liga B', accent: 'text-sky-300', bg: 'bg-sky-500/10', border: 'border-sky-400/30' },
  C: { title: 'Liga C', accent: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-400/30' },
  D: { title: 'Liga D', accent: 'text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-400/30' },
};

function TeamBadge({ name, rank }: { name: string; rank?: number }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.04] px-2.5 py-1.5">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10 text-[10px] font-black text-white/75">
        {name.slice(0, 2).toUpperCase()}
      </div>
      <span className="min-w-0 flex-1 truncate text-[13px] font-bold uppercase text-white/90">{name}</span>
      {rank && <span className="text-[10px] font-black text-white/35">#{rank}</span>}
    </div>
  );
}

function GroupCard({
  group,
  revealed,
  rankingMap,
}: {
  group: NationsLeagueGroup;
  revealed: boolean;
  rankingMap: Map<string, number>;
}) {
  const meta = TIER_META[group.tier];
  return (
    <div className={`rounded-xl border ${meta.border} ${meta.bg} p-3 transition-all duration-500 ${revealed ? 'opacity-100' : 'opacity-45'}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className={`${HEADING_FONT} text-lg text-white`}>{group.id}</div>
        <div className={`${BTN_FONT} text-[10px] ${meta.accent}`}>{meta.title}</div>
      </div>
      <div className="space-y-1.5">
        {revealed
          ? group.teams.map(team => <TeamBadge key={team} name={team} rank={rankingMap.get(team)} />)
          : group.teams.map((_, index) => (
              <div key={index} className="h-[34px] rounded-lg border border-dashed border-white/10 bg-white/[0.025]" />
            ))}
      </div>
    </div>
  );
}

const NationsLeagueDrawView: React.FC = () => {
  const { nationsLeagueState, uefaNationalRankingState, navigateTo } = useGame();
  const [ceremonyStarted, setCeremonyStarted] = useState(false);
  const [revealedGroups, setRevealedGroups] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groups = useMemo(
    () => [...(nationsLeagueState?.groups ?? [])].sort((a, b) => a.tier.localeCompare(b.tier) || a.id.localeCompare(b.id)),
    [nationsLeagueState]
  );
  const rankingMap = useMemo(
    () => new Map((uefaNationalRankingState?.entries ?? []).map(row => [row.teamName, row.rank])),
    [uefaNationalRankingState]
  );
  const totalGroups = groups.length;
  const ceremonyDone = totalGroups > 0 && revealedGroups >= totalGroups;

  if (!nationsLeagueState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className={`${HEADING_FONT} mb-4 text-2xl`}>Losowanie Ligi Narodów nie jest jeszcze gotowe</div>
          <button
            className={`${BTN_FONT} rounded-lg bg-white/10 px-5 py-2 text-xs text-white hover:bg-white/20`}
            onClick={() => navigateTo(ViewState.DASHBOARD)}
          >
            Powrót
          </button>
        </div>
      </div>
    );
  }

  const startCeremony = () => {
    setCeremonyStarted(true);
    let step = 0;
    const tick = () => {
      step += 1;
      setRevealedGroups(step);
      if (step < totalGroups) timerRef.current = setTimeout(tick, 650);
    };
    timerRef.current = setTimeout(tick, 450);
  };

  const skipToEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCeremonyStarted(true);
    setRevealedGroups(totalGroups);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_26%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-6 py-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className={`${HEADING_FONT} text-4xl text-white`}>
              Losowanie Ligi Narodów UEFA
              <span className="ml-3 text-sky-300">{nationsLeagueState.editionLabel}</span>
            </div>
            <div className="mt-1 text-xs font-semibold uppercase text-white/45">
              17 lipca · grupy według rankingu UEFA reprezentacji · mecze od września
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {!ceremonyStarted && (
              <button
                className={`${BTN_FONT} rounded-lg bg-sky-400 px-6 py-2.5 text-xs text-slate-950 hover:bg-sky-300`}
                onClick={startCeremony}
              >
                Ceremonia
              </button>
            )}
            {!ceremonyDone && (
              <button
                className={`${BTN_FONT} rounded-lg border border-white/10 bg-white/10 px-5 py-2.5 text-xs text-white hover:bg-white/20`}
                onClick={skipToEnd}
              >
                Pomiń do końca
              </button>
            )}
            {ceremonyDone && (
              <button
                className={`${BTN_FONT} rounded-lg bg-emerald-400 px-6 py-2.5 text-xs text-slate-950 hover:bg-emerald-300`}
                onClick={() => navigateTo(ViewState.MATCH_HISTORY_BROWSER)}
              >
                Podgląd wyników
              </button>
            )}
            <button
              className={`${BTN_FONT} rounded-lg border border-white/10 bg-white/10 px-5 py-2.5 text-xs text-white hover:bg-white/20`}
              onClick={() => navigateTo(ViewState.DASHBOARD)}
            >
              Powrót
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs font-bold uppercase text-white/45">
            <span>{ceremonyDone ? 'Losowanie zakończone' : ceremonyStarted ? 'Losowanie w toku' : 'Ceremonia gotowa'}</span>
            <span>{revealedGroups} / {totalGroups}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-sky-300 transition-all duration-300"
              style={{ width: totalGroups ? `${(revealedGroups / totalGroups) * 100}%` : '0%' }}
            />
          </div>
        </div>

        <div className="grid flex-1 grid-cols-4 gap-4 overflow-y-auto pr-1">
          {groups.map((group, index) => (
            <GroupCard
              key={group.id}
              group={group}
              revealed={ceremonyDone || index < revealedGroups}
              rankingMap={rankingMap}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NationsLeagueDrawView;
