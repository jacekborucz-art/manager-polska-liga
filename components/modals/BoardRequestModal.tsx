
import React from 'react';
import { Club } from '../../types';

interface BoardRequestModalProps {
  club: Club;
  onClose: () => void;
  onSelectStadium: () => void;
}

export const BoardRequestModal: React.FC<BoardRequestModalProps> = ({ club, onClose, onSelectStadium }) => {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
      <div
        className="relative w-full max-w-lg rounded-[36px] border border-white/10 bg-slate-950/95 shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
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
            <p className="text-[9px] font-black italic uppercase tracking-tighter text-sky-300/80">Komunikacja</p>
            <h2 className="mt-1 text-2xl font-black italic uppercase tracking-tighter text-white">PROŚBA DO ZARZĄDU</h2>
            <p className="mt-2 text-[11px] font-black italic uppercase tracking-tighter text-slate-400">
              Wybierz temat oficjalnej prośby do zarządu {club.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onSelectStadium}
            className="w-full rounded-[20px] border border-amber-400/25 bg-amber-500/10 p-5 text-left transition-all hover:border-amber-400/40 hover:bg-amber-500/15 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[8px] font-black italic uppercase tracking-tighter text-amber-300/70">Infrastruktura</p>
                <p className="mt-1 text-base font-black italic uppercase tracking-tighter text-white">ROZBUDOWA STADIONU</p>
                <p className="mt-2 text-[10px] font-black italic uppercase tracking-tighter leading-relaxed text-slate-400">
                  Złóż wniosek o rozbudowę jednej z trybun {club.stadiumName}. Zarząd oceni sytuację finansową i sportową klubu przed podjęciem decyzji.
                </p>
              </div>
              <span className="shrink-0 text-xl text-amber-400/50 group-hover:text-amber-400 transition-colors">→</span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-[9px] font-black italic uppercase tracking-tighter text-slate-500">
              <span>{club.stadiumCapacity.toLocaleString('pl-PL')} miejsc</span>
              <span>·</span>
              <span>{club.stadiumName}</span>
            </div>
          </button>

          <div className="rounded-[20px] border border-white/5 bg-black/20 p-5 opacity-35 cursor-not-allowed select-none">
            <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Wkrótce</p>
            <p className="mt-1 text-base font-black italic uppercase tracking-tighter text-slate-600">WIĘCEJ OPCJI</p>
            <p className="mt-1 text-[10px] font-black italic uppercase tracking-tighter text-slate-600">
              Kolejne tematy rozmów z zarządem pojawią się w przyszłości.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
