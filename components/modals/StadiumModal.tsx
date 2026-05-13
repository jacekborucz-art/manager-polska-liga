
import React from 'react';
import { Club } from '../../types';
import { StadiumSVG } from '../stadium/StadiumSVG';
import { StadiumExpansionService } from '../../services/StadiumExpansionService';

interface StadiumModalProps {
  club: Club;
  onClose: () => void;
  onRequestExpansion: () => void;
}

const getTierLabel = (capacity: number): string => {
  if (capacity <= 2000)  return 'Stadion minimalny';
  if (capacity <= 5000)  return 'Stadion małego klubu';
  if (capacity <= 10000) return 'Stadion lokalny';
  if (capacity <= 20000) return 'Stadion regionalny';
  if (capacity <= 35000) return 'Obiekt krajowy';
  if (capacity <= 49000) return 'Obiekt ekstraklasy';
  if (capacity <= 79000) return 'Arena narodowa';
  return 'Obiekt światowej klasy';
};

const PHASE_COLOR: Record<string, string> = {
  BOARD_REVIEW:       'border-sky-400/25 bg-sky-500/15 text-sky-300',
  FEASIBILITY_STUDY:  'border-amber-400/25 bg-amber-500/15 text-amber-300',
  PLANNING_PERMISSION:'border-yellow-400/25 bg-yellow-500/15 text-yellow-300',
  TENDER:             'border-purple-400/25 bg-purple-500/15 text-purple-300',
  CONSTRUCTION:       'border-orange-400/25 bg-orange-500/15 text-orange-300',
  SAFETY_INSPECTION:  'border-teal-400/25 bg-teal-500/15 text-teal-300',
  COMPLETED:          'border-emerald-400/25 bg-emerald-500/15 text-emerald-300',
  REJECTED:           'border-red-400/25 bg-red-500/15 text-red-300',
};

export const StadiumModal: React.FC<StadiumModalProps> = ({ club, onClose, onRequestExpansion }) => {
  const activeProjects = (club.stadiumExpansionProjects ?? []).filter(
    p => p.phase !== 'COMPLETED' && p.phase !== 'REJECTED'
  );
  const completedProjects = (club.stadiumExpansionProjects ?? []).filter(
    p => p.phase === 'COMPLETED'
  );

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[36px] border border-white/10 bg-slate-950/95 shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
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
            <p className="text-[9px] font-black italic uppercase tracking-tighter text-amber-300/80">Infrastruktura</p>
            <h2 className="mt-1 text-3xl font-black italic uppercase tracking-tighter text-white">{club.stadiumName}</h2>
          </div>

          <div className="rounded-[24px] border border-white/5 bg-black/40 overflow-hidden" style={{ aspectRatio: '4/3' }}>
            <StadiumSVG capacity={club.stadiumCapacity} primaryColor={club.colorsHex?.[0]} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[18px] border border-white/5 bg-black/30 p-4">
              <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Pojemność</p>
              <p className="mt-1 text-xl font-black italic uppercase tracking-tighter text-white">
                {club.stadiumCapacity.toLocaleString('pl-PL')}
              </p>
            </div>
            <div className="rounded-[18px] border border-white/5 bg-black/30 p-4">
              <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Kategoria</p>
              <p className="mt-1 text-xs font-black italic uppercase tracking-tighter text-amber-300">
                {getTierLabel(club.stadiumCapacity)}
              </p>
            </div>
            <div className="rounded-[18px] border border-white/5 bg-black/30 p-4">
              <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Aktywne projekty</p>
              <p className={`mt-1 text-xl font-black italic uppercase tracking-tighter ${activeProjects.length > 0 ? 'text-amber-300' : 'text-white'}`}>
                {activeProjects.length}
              </p>
            </div>
          </div>

          {activeProjects.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] font-black italic uppercase tracking-tighter text-slate-500">W toku</p>
              {activeProjects.map(project => (
                <div key={project.id} className="rounded-[18px] border border-amber-400/15 bg-amber-500/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black italic uppercase tracking-tighter text-white">
                      {StadiumExpansionService.getStandLabel(project.stand)}
                    </p>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[8px] font-black italic uppercase tracking-tighter ${PHASE_COLOR[project.phase] ?? 'border-white/10 text-slate-400'}`}>
                      {StadiumExpansionService.getPhaseLabel(project.phase)}
                    </span>
                  </div>
                  {project.requestedCapacityIncrease > 0 && (
                    <p className="mt-1 text-[10px] font-black italic uppercase tracking-tighter text-slate-400">
                      +{project.requestedCapacityIncrease.toLocaleString('pl-PL')} miejsc
                    </p>
                  )}
                  <p className="mt-1 text-[9px] font-black italic uppercase tracking-tighter text-slate-500">
                    Termin fazy: {new Date(project.phaseEndDate).toLocaleDateString('pl-PL')}
                  </p>
                  {project.log.length > 0 && (
                    <p className="mt-2 text-[9px] font-black italic uppercase tracking-tighter text-slate-400 border-t border-white/5 pt-2">
                      {project.log[project.log.length - 1].message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {completedProjects.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] font-black italic uppercase tracking-tighter text-slate-500">Zrealizowane</p>
              {completedProjects.map(project => (
                <div key={project.id} className="rounded-[18px] border border-emerald-400/10 bg-emerald-500/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black italic uppercase tracking-tighter text-slate-300">
                      {StadiumExpansionService.getStandLabel(project.stand)}
                    </p>
                    <span className="shrink-0 text-[8px] font-black italic uppercase tracking-tighter text-emerald-400">
                      +{project.approvedCapacityIncrease ?? project.requestedCapacityIncrease} miejsc
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onRequestExpansion}
            className="w-full rounded-[20px] border border-amber-400/25 bg-amber-500/10 p-4 text-left transition-all hover:border-amber-400/40 hover:bg-amber-500/15"
          >
            <p className="text-[8px] font-black italic uppercase tracking-tighter text-amber-300/80">Inwestycja</p>
            <p className="mt-1 text-base font-black italic uppercase tracking-tighter text-white">ZŁÓŻ WNIOSEK O ROZBUDOWĘ</p>
            <p className="mt-1 text-[10px] font-black italic uppercase tracking-tighter text-slate-400">
              Wybierz trybunę do rozbudowy — zarząd oceni warunki i podejmie decyzję
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
