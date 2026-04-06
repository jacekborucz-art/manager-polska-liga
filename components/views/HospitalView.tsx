import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState, HealthStatus } from '../../types';
import { Button } from '../ui/Button';

export const HospitalView: React.FC = () => {
  const { navigateTo, userTeamId, players } = useGame();

  const injuredPlayers = useMemo(() => {
    if (!userTeamId) return [];
    const squad = players[userTeamId] || [];
    return squad.filter(p => p.health.status === HealthStatus.INJURED && p.health.injury);
  }, [players, userTeamId]);

  return (
    <div className="min-h-screen text-slate-50 p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl">
              🏥
            </div>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
                Szpital
              </h1>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">
                Kontuzjowani zawodnicy
              </p>
            </div>
          </div>
          <Button onClick={() => navigateTo(ViewState.DASHBOARD)} variant="secondary">
            ← Powrót
          </Button>
        </div>

        {injuredPlayers.length === 0 ? (
          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-12 text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-slate-400 font-semibold uppercase tracking-widest text-sm">
              Brak kontuzjowanych zawodników
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 w-10">#</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Zawodnik</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Pozycja</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Przyczyna kontuzji</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Dni do powrotu</th>
                </tr>
              </thead>
              <tbody>
                {injuredPlayers.map((player, index) => (
                  <tr
                    key={player.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-white">
                        {player.firstName} {player.lastName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black bg-slate-800 border border-white/10 px-2 py-1 rounded-lg text-slate-300">
                        {player.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {player.health.injury!.type}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-black ${player.health.injury!.daysRemaining <= 7 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {player.health.injury!.daysRemaining} dni
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
