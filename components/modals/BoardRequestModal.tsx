
import React from 'react';
import { BoardClubRequestType, Club } from '../../types';

interface BoardRequestModalProps {
  club: Club;
  onClose: () => void;
  onSelectStadium: () => void;
  onSelectRequest: (requestType: BoardClubRequestType) => void;
}

const requestCards: {
  type: BoardClubRequestType;
  category: string;
  title: string;
  description: string;
  meta: string;
  tone: string;
}[] = [
  {
    type: 'CLUB_FUNDS',
    category: 'Finanse',
    title: 'Dodatkowe środki klubowe',
    description: 'Poproś zarząd o jednorazowy zastrzyk gotówki do głównego salda klubu.',
    meta: 'Zwiększa budget',
    tone: 'emerald',
  },
  {
    type: 'TRANSFER_BUDGET',
    category: 'Transfery',
    title: 'Zwiększenie budżetu transferowego',
    description: 'Wniosek o przesunięcie dodatkowych środków do puli na transfery i kontrakty.',
    meta: 'Zwiększa transferBudget',
    tone: 'amber',
  },
  {
    type: 'EXCEPTIONAL_CONTRACT',
    category: 'Kontrakty',
    title: 'Zgoda na wyjątkowy kontrakt',
    description: 'Jednorazowa zgoda zarządu na bardziej ryzykowną pensję lub bonus przy najbliższej zaakceptowanej umowie.',
    meta: 'Łagodzi veto zarządu',
    tone: 'sky',
  },
  {
    type: 'WAGE_COST_CONTROL',
    category: 'Analiza',
    title: 'Kontrola kosztów płac',
    description: 'Poproś dyrektora finansowego o raport rocznego funduszu płac względem salda klubu.',
    meta: 'Raport bez kosztu',
    tone: 'slate',
  },
];

const toneClasses: Record<string, { border: string; bg: string; text: string }> = {
  emerald: { border: 'border-emerald-400/25 hover:border-emerald-400/45', bg: 'bg-emerald-500/10 hover:bg-emerald-500/15', text: 'text-emerald-300/80' },
  amber: { border: 'border-amber-400/25 hover:border-amber-400/45', bg: 'bg-amber-500/10 hover:bg-amber-500/15', text: 'text-amber-300/80' },
  sky: { border: 'border-sky-400/25 hover:border-sky-400/45', bg: 'bg-sky-500/10 hover:bg-sky-500/15', text: 'text-sky-300/80' },
  slate: { border: 'border-white/10 hover:border-white/20', bg: 'bg-white/5 hover:bg-white/10', text: 'text-slate-300/80' },
};

export const BoardRequestModal: React.FC<BoardRequestModalProps> = ({ club, onClose, onSelectStadium, onSelectRequest }) => {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[36px] border border-white/10 bg-slate-950/95 shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
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

          <div className="grid grid-cols-1 gap-4">
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

            {requestCards.map(card => {
              const tone = toneClasses[card.tone];
              return (
                <button
                  key={card.type}
                  type="button"
                  onClick={() => onSelectRequest(card.type)}
                  className={`w-full rounded-[20px] border p-5 text-left transition-all group ${tone.border} ${tone.bg}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`text-[8px] font-black italic uppercase tracking-tighter ${tone.text}`}>{card.category}</p>
                      <p className="mt-1 text-base font-black italic uppercase tracking-tighter text-white">{card.title}</p>
                      <p className="mt-2 text-[10px] font-black italic uppercase tracking-tighter leading-relaxed text-slate-400">
                        {card.description}
                      </p>
                    </div>
                    <span className={`shrink-0 text-xl transition-colors ${tone.text}`}>→</span>
                  </div>
                  <div className="mt-3 text-[9px] font-black italic uppercase tracking-tighter text-slate-500">
                    {card.meta}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
