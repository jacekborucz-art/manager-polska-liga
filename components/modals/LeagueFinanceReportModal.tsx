import React from 'react';
import { Club } from '../../types';

interface LeagueFinanceReportModalProps {
  leagueName: string;
  clubs: Club[];
  onClose: () => void;
}

export const LeagueFinanceReportModal: React.FC<LeagueFinanceReportModalProps> = ({ leagueName, clubs, onClose }) => {
  const sorted = [...clubs].sort((a, b) => b.budget - a.budget);

  const fmt = (n: number) =>
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-slate-900/80 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="border-b border-white/5 bg-white/5 px-8 py-6 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Sprawozdanie Finansowe</span>
            <h2 className="mt-1 text-xl font-black italic uppercase tracking-tight text-white">{leagueName}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/8 text-slate-300 hover:bg-white/20 hover:text-white transition-all"
          >
            x
          </button>
        </div>

        <div className="custom-scrollbar overflow-y-auto max-h-[60vh]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="py-3 px-6 text-left text-[9px] font-black uppercase tracking-widest text-slate-500">#</th>
                <th className="py-3 px-6 text-left text-[9px] font-black uppercase tracking-widest text-slate-500">Klub</th>
                <th className="py-3 px-6 text-right text-[9px] font-black uppercase tracking-widest text-slate-500">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((club, i) => (
                <tr key={club.id} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="py-3 px-6 text-[10px] font-black text-slate-600">{i + 1}</td>
                  <td className="py-3 px-6 text-sm font-semibold text-white">{club.name}</td>
                  <td className={`py-3 px-6 text-right text-sm font-black tabular-nums ${club.budget >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {fmt(club.budget)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-white/5 bg-black/20 px-8 py-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl bg-white px-8 py-3 text-xs font-black italic uppercase tracking-widest text-slate-900 shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
