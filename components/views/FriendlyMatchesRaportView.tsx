import React, { useEffect, useMemo, useState } from 'react';
import { AiFriendlyMatchReport, ViewState } from '../../types';
import { useGame } from '../../context/GameContext';
import { AiFriendlyMatchDetailModal } from '../modals/AiFriendlyMatchDetailModal';
import { getClubLogo } from '../../resources/ClubLogoAssets';

type DateFilter = 'ALL' | string;

const toDateKey = (value: Date | string): string => {
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const FriendlyMatchesRaportView: React.FC = () => {
  const {
    aiFriendlyReports,
    aiFriendlyReportsDateFilter,
    clubs,
    navigateTo,
    setAiFriendlyReportsDateFilter,
  } = useGame();
  const [selectedReport, setSelectedReport] = useState<AiFriendlyMatchReport | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<DateFilter>(aiFriendlyReportsDateFilter ?? 'ALL');

  const grouped = useMemo(
    () => aiFriendlyReports.reduce<Record<string, AiFriendlyMatchReport[]>>((acc, report) => {
      const key = toDateKey(report.date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(report);
      return acc;
    }, {}),
    [aiFriendlyReports]
  );

  const sortedDates = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  useEffect(() => {
    if (!aiFriendlyReportsDateFilter) {
      return;
    }

    setSelectedDateKey(grouped[aiFriendlyReportsDateFilter] ? aiFriendlyReportsDateFilter : 'ALL');
  }, [aiFriendlyReportsDateFilter, grouped]);

  const visibleDates = selectedDateKey === 'ALL'
    ? sortedDates
    : sortedDates.filter(dateKey => dateKey === selectedDateKey);

  const formatDateLabel = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleFilterChange = (dateKey: DateFilter) => {
    setSelectedDateKey(dateKey);
    setAiFriendlyReportsDateFilter(dateKey === 'ALL' ? null : dateKey);
  };

  const handleBack = () => {
    setAiFriendlyReportsDateFilter(null);
    navigateTo(ViewState.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-5 border-b border-white/5 bg-slate-950/90 px-8 py-5 backdrop-blur-xl">
        <button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl font-black text-slate-400 transition-all hover:bg-white/10 hover:text-white"
        >
          ‹
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-black italic uppercase tracking-tighter text-green-400">Centrum sparingowe</div>
          <h1 className="text-2xl font-black italic uppercase leading-none tracking-tighter text-white">
            Wyniki sparingów
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-10">
        {sortedDates.length > 1 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleFilterChange('ALL')}
              className={`rounded-2xl border px-4 py-2 text-[10px] font-black italic uppercase tracking-tighter transition-all ${
                selectedDateKey === 'ALL'
                  ? 'border-green-300/50 bg-green-400/15 text-green-200'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              Wszystkie
            </button>
            {sortedDates.map(dateKey => (
              <button
                key={dateKey}
                onClick={() => handleFilterChange(dateKey)}
                className={`rounded-2xl border px-4 py-2 text-[10px] font-black italic uppercase tracking-tighter transition-all ${
                  selectedDateKey === dateKey
                    ? 'border-green-300/50 bg-green-400/15 text-green-200'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {formatDateLabel(dateKey)}
              </button>
            ))}
          </div>
        )}

        {sortedDates.length === 0 && (
          <div className="mt-24 flex flex-col items-center justify-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl font-black italic uppercase tracking-tighter text-slate-600">!</div>
            <p className="text-[11px] font-black italic uppercase tracking-tighter text-slate-500">
              Brak rozegranych sparingów AI
            </p>
          </div>
        )}

        {visibleDates.map(dateKey => (
          <div key={dateKey} className="mb-10">
            <div className="mb-4 text-[10px] font-black italic uppercase tracking-tighter text-slate-500">
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
                    className="flex items-center gap-4 rounded-2xl border border-white/[0.06] px-5 py-4 transition-all hover:border-white/15"
                    style={{ background: `linear-gradient(to right, ${homeClub?.colorsHex[0] ?? '#1e293b'}22 0%, transparent 40%, transparent 60%, ${awayClub?.colorsHex[0] ?? '#1e293b'}22 100%)` }}
                  >
                    {/* Home team */}
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-3 text-right">
                      <span className="truncate text-[11px] font-black italic uppercase text-white">{hName}</span>
                      {getClubLogo(homeClub?.id ?? '')
                        ? <img src={getClubLogo(homeClub?.id ?? '')} alt="" className="h-9 w-9 shrink-0 object-contain" />
                        : <div className="flex h-9 w-9 shrink-0 flex-col overflow-hidden rounded-xl border border-white/10">
                            <div className="flex-1" style={{ backgroundColor: homeClub?.colorsHex[0] ?? '#555' }} />
                            <div className="flex-1" style={{ backgroundColor: homeClub?.colorsHex[1] ?? homeClub?.colorsHex[0] ?? '#333' }} />
                          </div>
                      }
                    </div>

                    {/* Score button */}
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-5 py-2.5 transition-all hover:border-white/30 hover:bg-white/15 active:scale-95"
                    >
                      <span className="text-xl font-black tabular-nums text-white">{report.homeScore}</span>
                      <span className="text-base font-black text-slate-500">–</span>
                      <span className="text-xl font-black tabular-nums text-white">{report.awayScore}</span>
                    </button>

                    {/* Away team */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {getClubLogo(awayClub?.id ?? '')
                        ? <img src={getClubLogo(awayClub?.id ?? '')} alt="" className="h-9 w-9 shrink-0 object-contain" />
                        : <div className="flex h-9 w-9 shrink-0 flex-col overflow-hidden rounded-xl border border-white/10">
                            <div className="flex-1" style={{ backgroundColor: awayClub?.colorsHex[0] ?? '#555' }} />
                            <div className="flex-1" style={{ backgroundColor: awayClub?.colorsHex[1] ?? awayClub?.colorsHex[0] ?? '#333' }} />
                          </div>
                      }
                      <span className="truncate text-[11px] font-black italic uppercase text-white">{aName}</span>
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
