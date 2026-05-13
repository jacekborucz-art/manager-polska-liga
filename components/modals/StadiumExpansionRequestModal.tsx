
import React, { useState } from 'react';
import { Club, StadiumStand } from '../../types';
import { StadiumExpansionService, STAND_OPTIONS } from '../../services/StadiumExpansionService';

interface StadiumExpansionRequestModalProps {
  club: Club;
  attendanceHistory: number[];
  onClose: () => void;
  onSubmit: (stand: StadiumStand, requestedIncrease: number) => void;
}

export const StadiumExpansionRequestModal: React.FC<StadiumExpansionRequestModalProps> = ({
  club,
  attendanceHistory,
  onClose,
  onSubmit,
}) => {
  const [selected, setSelected] = useState<StadiumStand | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selected) return;
    const increase = StadiumExpansionService.getDefaultIncrease(selected);
    onSubmit(selected, increase);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
        <div
          className="relative w-full max-w-md rounded-[36px] border border-white/10 bg-slate-950/95 p-8 shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-[9px] font-black italic uppercase tracking-tighter text-emerald-300/80">Sukces</p>
          <h2 className="mt-2 text-2xl font-black italic uppercase tracking-tighter text-white">WNIOSEK ZŁOŻONY</h2>
          <p className="mt-3 text-sm font-black italic uppercase tracking-tighter leading-relaxed text-slate-300">
            Wniosek o rozbudowę {selected ? StadiumExpansionService.getStandLabel(selected).toLowerCase() : ''} został
            przekazany do zarządu. Zarząd zapozna się z wnioskiem w ciągu najbliższych tygodni.
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-[16px] border border-emerald-400/25 bg-emerald-500/10 py-3 text-sm font-black italic uppercase tracking-tighter text-emerald-300 hover:bg-emerald-500/15 transition-all"
          >
            Zamknij
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[36px] border border-white/10 bg-slate-950/95 shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm font-black"
        >
          ✕
        </button>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-[9px] font-black italic uppercase tracking-tighter text-amber-300/80">Rozbudowa stadionu</p>
            <h2 className="mt-1 text-2xl font-black italic uppercase tracking-tighter text-white">WYBIERZ ELEMENT</h2>
            <p className="mt-2 text-[10px] font-black italic uppercase tracking-tighter text-slate-400">
              Pojemność obecna: {club.stadiumCapacity.toLocaleString('pl-PL')} miejsc
            </p>
          </div>

          <div className="space-y-2">
            {STAND_OPTIONS.map(({ stand }) => {
              const eligibility = StadiumExpansionService.checkEligibility(club, stand, attendanceHistory);
              const increase = StadiumExpansionService.getDefaultIncrease(stand);
              const cost = StadiumExpansionService.estimateCost(stand, increase);
              const isSelected = selected === stand;

              return (
                <button
                  key={stand}
                  type="button"
                  disabled={!eligibility.eligible}
                  onClick={() => setSelected(stand)}
                  className={`w-full rounded-[18px] border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-amber-400/40 bg-amber-500/15'
                      : eligibility.eligible
                        ? 'border-white/5 bg-black/20 hover:border-white/10 hover:bg-black/30'
                        : 'border-white/5 bg-black/10 opacity-45 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black italic uppercase tracking-tighter text-white">
                      {StadiumExpansionService.getStandLabel(stand)}
                    </p>
                    {increase > 0 && (
                      <p className="shrink-0 text-[10px] font-black italic uppercase tracking-tighter text-slate-400">
                        +{increase.toLocaleString('pl-PL')} miejsc
                      </p>
                    )}
                  </div>
                  <p className="mt-1 text-[10px] font-black italic uppercase tracking-tighter text-amber-300/80">
                    ~{cost.toLocaleString('pl-PL')} PLN
                  </p>
                  {!eligibility.eligible && (
                    <p className="mt-1 text-[9px] font-black italic uppercase tracking-tighter text-red-400/80">
                      {eligibility.reasons[0]}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          <div className="rounded-[18px] border border-white/5 bg-black/20 p-4">
            <p className="text-[9px] font-black italic uppercase tracking-tighter text-slate-500">Informacja</p>
            <p className="mt-2 text-[10px] font-black italic uppercase tracking-tighter leading-relaxed text-slate-400">
              Podane koszty są szacunkowe. Ostateczna wycena zostanie ustalona po analizie wykonalności i przetargu. Rozbudowa przebiega w kilku etapach i trwa od kilku miesięcy do ponad roku.
            </p>
          </div>

          <button
            type="button"
            disabled={!selected}
            onClick={handleSubmit}
            className="w-full rounded-[20px] border border-amber-400/25 bg-amber-500/10 py-4 text-sm font-black italic uppercase tracking-tighter text-amber-300 transition-all hover:bg-amber-500/15 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ZŁÓŻ WNIOSEK DO ZARZĄDU
          </button>
        </div>
      </div>
    </div>
  );
};
