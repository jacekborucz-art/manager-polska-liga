import React from 'react';
import { Club } from '../../types';
import { KitSelection } from '../../services/KitSelectionService';
import { getClubKitVariantsForClub, KitVariant } from '../../resources/PlayerCardAssets';
import { KitPreview } from './KitPreview';

interface MatchKitSelectionModalProps {
  club: Club;
  selectedKit: KitSelection['home'];
  onClose: () => void;
  onSelect: (variant: KitVariant) => void;
}

/**
 * One shared modal keeps league and cup kit selection visually and functionally
 * identical. The studio owns the selected state because it must pass the final
 * home/away pairing to its specific live-match engine.
 */
export const MatchKitSelectionModal: React.FC<MatchKitSelectionModalProps> = ({
  club,
  selectedKit,
  onClose,
  onSelect
}) => (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-[1px] p-6 animate-fade-in"
    onClick={onClose}
  >
    <div
      className="max-w-6xl w-full bg-slate-900/30 border border-white/10 rounded-[50px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative"
      onClick={event => event.stopPropagation()}
    >
      <div className="p-12 border-b border-white/5 bg-white/5 flex justify-between items-center">
        <div>
          <h2 className="text-4xl text-white font-black italic uppercase tracking-tighter">Wybierz koszulkę</h2>
          <p className="text-[12px] text-blue-500 mt-1 font-black italic uppercase tracking-tighter">{club.name}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Zamknij wybór koszulki"
          className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all text-3xl font-light"
        >
          &times;
        </button>
      </div>

      <div className="p-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {getClubKitVariantsForClub(club).map((variant, index) => {
            const isSelected = selectedKit.primary === variant.hex && selectedKit.pattern === variant.pattern;

            return (
              <button
                key={variant.id ?? `${variant.hex}-${variant.pattern ?? 'solid'}-${index}`}
                onClick={() => onSelect(variant)}
                aria-label={`Wybierz koszulkę ${variant.name ?? index + 1}`}
                className={`flex flex-col items-center gap-5 p-8 rounded-3xl border-2 transition-all hover:scale-105 active:scale-95 ${
                  isSelected
                    ? 'border-white/60 bg-white/10 shadow-[0_0_40px_rgba(255,255,255,0.15)]'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.07]'
                }`}
              >
                <div className="flex h-64 w-44 items-center justify-center rounded-2xl bg-black/30">
                  <KitPreview
                    shirt={variant.hex}
                    shirtSecondary={variant.shirtSecondaryHex}
                    shorts={variant.secondaryHex ?? variant.hex}
                    socks={variant.socksHex ?? variant.secondaryHex ?? variant.hex}
                    pattern={variant.pattern}
                    className="h-44 w-44"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: variant.hex }} />
                  {isSelected && <span className="text-[11px] text-white font-black italic uppercase tracking-tighter">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-10 bg-black/30 border-t border-white/5 text-center">
        <p className="text-[12px] text-slate-500 font-black italic uppercase tracking-tighter">
          Koszulka przeciwnika zostanie dobrana automatycznie
        </p>
      </div>
    </div>
  </div>
);
