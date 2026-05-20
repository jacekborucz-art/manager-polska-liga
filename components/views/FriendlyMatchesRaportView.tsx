import React, { useState } from 'react';
import { AiFriendlyMatchReport, ViewState } from '../../types';
import { useGame } from '../../context/GameContext';
import { AiFriendlyMatchDetailModal } from '../modals/AiFriendlyMatchDetailModal';
import { getClubLogo } from '../../resources/ClubLogoAssets';

export const FriendlyMatchesRaportView: React.FC = () => {
  const { aiFriendlyReports, clubs, navigateTo } = useGame();
  const [selectedReport, setSelectedReport] = useState<AiFriendlyMatchReport | null>(null);

  const grouped = aiFriendlyReports.reduce<Record<string, AiFriendlyMatchReport[]>>((acc, r) => {
    const d = r.date instanceof Date ? r.date : new Date(r.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  const formatDateLabel = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pl-PL', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-5 px-8 py-5 border-b border-white/5 bg-slate-950/90 backdrop-blur-xl">
        <button
          onClick={() => navigateTo(ViewState.DASHBOARD)}
          className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xl font-black"
        >
          ‹
        </button>
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.4em] text-green-400">Centrum sparingowe</div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
            Wyniki sparingów 
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        {sortedDates.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-24 gap-4">
            <div className="text-4xl opacity-20">🤝</div>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">
              Brak rozegranych sparingów AI
            </p>
          </div>
        )}

        {sortedDates.map(dateKey => (
          <div key={dateKey} className="mb-10">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">
              {formatDateLabel(dateKey)}
            </div>

            <div className="space-y-2">
              {grouped[dateKey].map(report => {
                const homeClub = clubs.find(c => c.id === report.homeTeamId);
                const awayClub = clubs.find(c => c.id === report.awayTeamId);
                const hName = homeClub?.name ?? report.homeTeamId;
                const aName = awayClub?.name ?? report.awayTeamId;

                return (
                  <div
                    key={report.pairId}
                    className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/[0.06] hover:border-white/15 transition-all"
                    style={{ background: `linear-gradient(to right, ${homeClub?.colorsHex[0] ?? '#1e293b'}22 0%, transparent 40%, transparent 60%, ${awayClub?.colorsHex[0] ?? '#1e293b'}22 100%)` }}
                  >
                    {/* Home team */}
                    <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                      <span className="text-[11px] font-black uppercase italic text-white text-right truncate">{hName}</span>
                      {getClubLogo(homeClub?.id ?? '')
                        ? <img src={getClubLogo(homeClub?.id ?? '')} alt="" className="w-9 h-9 object-contain shrink-0" />
                        : <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 shrink-0 flex flex-col">
                            <div className="flex-1" style={{ backgroundColor: homeClub?.colorsHex[0] ?? '#555' }} />
                            <div className="flex-1" style={{ backgroundColor: homeClub?.colorsHex[1] ?? homeClub?.colorsHex[0] ?? '#333' }} />
                          </div>
                      }
                    </div>

                    {/* Score button */}
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/8 border border-white/15 hover:bg-white/15 hover:border-white/30 transition-all active:scale-95 shrink-0"
                    >
                      <span className="text-xl font-black tabular-nums text-white">{report.homeScore}</span>
                      <span className="text-slate-500 font-black text-base">–</span>
                      <span className="text-xl font-black tabular-nums text-white">{report.awayScore}</span>
                    </button>

                    {/* Away team */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getClubLogo(awayClub?.id ?? '')
                        ? <img src={getClubLogo(awayClub?.id ?? '')} alt="" className="w-9 h-9 object-contain shrink-0" />
                        : <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 shrink-0 flex flex-col">
                            <div className="flex-1" style={{ backgroundColor: awayClub?.colorsHex[0] ?? '#555' }} />
                            <div className="flex-1" style={{ backgroundColor: awayClub?.colorsHex[1] ?? awayClub?.colorsHex[0] ?? '#333' }} />
                          </div>
                      }
                      <span className="text-[11px] font-black uppercase italic text-white truncate">{aName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedReport && (
        <AiFriendlyMatchDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};
