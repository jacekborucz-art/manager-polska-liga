
import React from 'react';
import { useModalClose } from '../ui/useModalClose';
import { Club } from '../../types';
import { Stadium3DViewer } from '../stadium/Stadium3DViewer';
import { StadiumExpansionService } from '../../services/StadiumExpansionService';
import { getClubLogo } from '../../resources/ClubLogoAssets';

interface StadiumModalProps {
  club: Club;
  onClose: () => void;
  onRequestExpansion: () => void;
}

const getTierLabel = (capacity: number): string => {
  if (capacity <= 2000)  return 'Stadion minimalny';
  if (capacity <= 5000)  return 'Stadion małego klubu';
  if (capacity <= 8000)  return 'Stadion lokalny';
  if (capacity <= 15000) return 'Stadion regionalny';
  if (capacity <= 22000) return 'Obiekt ligowy';
  if (capacity <= 30000) return 'Obiekt krajowy';
  if (capacity <= 60000) return 'Arena europejska';
  return 'Obiekt światowej klasy';
};

const getTierDescription = (capacity: number): string => {
  if (capacity <= 2000)  return 'Obiekt amatorski z trybunami po jednej stronie boiska. Brak stałego zadaszenia i oświetlenia.';
  if (capacity <= 5000)  return 'Skromny stadion z trybunami po dwóch stronach. Podstawowe warunki dla kibiców regionalnych, częściowe zadaszenie.';
  if (capacity <= 8000)  return 'Obiekt III/IV ligi z trzema trybunami, częściowym zadaszeniem i oświetleniem narożnym.';
  if (capacity <= 15000) return 'Klasyczny stadion ligowy. Cztery zadaszone trybuny z krzesełkami wokół całego boiska.';
  if (capacity <= 22000) return 'Profesjonalna zamknięta misa. Spełnia wymagania ekstraklasy — komfortowe miejsce dla kibiców z pełnym oświetleniem.';
  if (capacity <= 30000) return 'Duży obiekt z pełną misą i połączonymi narożnikami. Odpowiedni na mecze europejskie pierwszej rundy.';
  if (capacity <= 60000) return 'Arena europejska z jednolitą wysoką misą, pełnym nagłośnieniem i nowoczesnym zapleczem VIP. Spełnia normy UEFA.';
  return 'Kolosalna arena światowej klasy. Jeden z największych stadionów w Europie Środkowej. Dostosowany do finałów europejskich.';
};

const getStandsBreakdown = (capacity: number) => {
  const main     = Math.round(capacity * 0.32);
  const opposite = Math.round(capacity * 0.30);
  const north    = Math.round(capacity * 0.19);
  const south    = capacity - main - opposite - north;
  return [
    { label: 'Trybuna Główna',       seats: main,     pct: 32 },
    { label: 'Trybuna Naprzeciwko',  seats: opposite, pct: 30 },
    { label: 'Trybuna Północna',     seats: north,    pct: 19 },
    { label: 'Trybuna Południowa',   seats: south,    pct: 19 },
  ];
};

const PHASE_COLOR: Record<string, string> = {
  BOARD_REVIEW:        'border-sky-400/25 bg-sky-500/15 text-sky-300',
  CITY_AID_REVIEW:     'border-cyan-400/25 bg-cyan-500/15 text-cyan-300',
  FEASIBILITY_STUDY:   'border-amber-400/25 bg-amber-500/15 text-amber-300',
  PLANNING_PERMISSION: 'border-yellow-400/25 bg-yellow-500/15 text-yellow-300',
  TENDER:              'border-purple-400/25 bg-purple-500/15 text-purple-300',
  CONSTRUCTION:        'border-orange-400/25 bg-orange-500/15 text-orange-300',
  SAFETY_INSPECTION:   'border-teal-400/25 bg-teal-500/15 text-teal-300',
  COMPLETED:           'border-emerald-400/25 bg-emerald-500/15 text-emerald-300',
  REJECTED:            'border-red-400/25 bg-red-500/15 text-red-300',
};

export const StadiumModal: React.FC<StadiumModalProps> = ({ club, onClose, onRequestExpansion }) => {
  const { closeModal, exitClass } = useModalClose(onClose);
  const activeProjects = (club.stadiumExpansionProjects ?? []).filter(
    p => p.phase !== 'COMPLETED' && p.phase !== 'REJECTED'
  );
  const completedProjects = (club.stadiumExpansionProjects ?? []).filter(
    p => p.phase === 'COMPLETED'
  );
  const logo = getClubLogo(club.id);
  const stands = getStandsBreakdown(club.stadiumCapacity);

  return (
    <div className={`fixed inset-0 z-[400] flex items-center justify-center p-4 ${exitClass}`} onClick={closeModal}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[36px] border border-white/10 bg-slate-950/95 shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm font-black"
        >
          ✕
        </button>

        <div className="p-6 space-y-5">

          {/* ── GÓRNA SEKCJA: LEWA KOLUMNA INFO + PRAWA KOLUMNA 3D ── */}
          <div className="flex gap-5 items-stretch min-h-[440px]">

            {/* LEWA — opis stadionu */}
            <div className="w-[260px] shrink-0 flex flex-col gap-3">

              {/* Logo + nazwa */}
              <div className="rounded-[22px] border border-white/5 bg-black/30 p-4 flex flex-col items-center gap-3">
                {logo && (
                  <img src={logo} alt={club.name} className="w-16 h-16 object-contain drop-shadow-lg" />
                )}
                <div className="text-center">
                  <p className="text-[8px] font-black italic uppercase tracking-tighter text-amber-300/80">Infrastruktura</p>
                  <h2 className="mt-0.5 text-base font-black italic uppercase tracking-tighter text-white leading-tight">{club.stadiumName}</h2>
                  <p className="mt-1 text-[9px] font-black italic uppercase tracking-tighter text-amber-300">{getTierLabel(club.stadiumCapacity)}</p>
                </div>
              </div>

              {/* Pojemność */}
              <div className="rounded-[18px] border border-white/5 bg-black/30 p-4">
                <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Łączna pojemność</p>
                <p className="mt-1 text-3xl font-black italic uppercase tracking-tighter text-white">
                  {club.stadiumCapacity.toLocaleString('pl-PL')}
                </p>
                <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">miejsc</p>
              </div>

              {/* Opis */}
              <div className="rounded-[18px] border border-white/5 bg-black/30 p-4">
                <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500 mb-2">Charakterystyka</p>
                <p className="text-[10px] font-medium italic text-slate-400 leading-relaxed">
                  {getTierDescription(club.stadiumCapacity)}
                </p>
              </div>

              {/* Trybuny */}
              <div className="rounded-[18px] border border-white/5 bg-black/30 p-4 space-y-3">
                <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Pojemność trybun</p>
                {stands.map(({ label, seats, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-400">{label}</p>
                      <p className="text-[9px] font-black italic uppercase tracking-tighter text-white">{seats.toLocaleString('pl-PL')}</p>
                    </div>
                    <div className="h-1 rounded-full bg-white/5">
                      <div
                        className="h-1 rounded-full bg-amber-400/50"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* PRAWA — widok 3D */}
            <div className="flex-1 rounded-[24px] border border-white/5 bg-black/40 overflow-hidden">
              <Stadium3DViewer capacity={club.stadiumCapacity} primaryColor={club.colorsHex?.[0]} seatColors={club.stadiumSeatColors} />
            </div>

          </div>

          {/* ── PROJEKTY W TOKU ── */}
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
                  {project.financeType === 'CITY_AID' && (
                    <p className="mt-1 text-[9px] font-black italic uppercase tracking-tighter text-cyan-300/80">
                      Finansowanie z udziałem miasta{project.cityAidAmount ? `: ${project.cityAidAmount.toLocaleString('pl-PL')} PLN` : ''}
                    </p>
                  )}
                  {project.log.length > 0 && (
                    <p className="mt-2 text-[9px] font-black italic uppercase tracking-tighter text-slate-400 border-t border-white/5 pt-2">
                      {project.log[project.log.length - 1].message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── PROJEKTY ZREALIZOWANE ── */}
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

          {/* ── PRZYCISK ROZBUDOWY ── */}
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
