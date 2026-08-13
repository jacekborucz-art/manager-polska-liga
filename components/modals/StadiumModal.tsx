
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

const StadiumModalScene: React.FC<{ primaryColor: string; secondaryColor: string }> = ({ primaryColor, secondaryColor }) => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="stadium-shell" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#061827" />
        <stop offset="0.52" stopColor="#071221" />
        <stop offset="1" stopColor="#030914" />
      </linearGradient>
      <linearGradient id="stadium-club-glow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={primaryColor} stopOpacity="0.24" />
        <stop offset="0.55" stopColor={secondaryColor} stopOpacity="0.08" />
        <stop offset="1" stopColor="#06111f" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="stadium-spot" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#38bdf8" stopOpacity="0.14" />
        <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
      </radialGradient>
      <pattern id="stadium-grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1" fill="#7dd3fc" fillOpacity="0.11" />
      </pattern>
      <pattern id="stadium-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
        <line x1="0" y1="0" x2="0" y2="10" stroke="#bae6fd" strokeOpacity="0.055" strokeWidth="2" />
      </pattern>
      <filter id="stadium-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="9" />
      </filter>
    </defs>

    <rect width="1600" height="900" rx="48" fill="url(#stadium-shell)" />
    <rect width="1600" height="900" rx="48" fill="url(#stadium-club-glow)" />
    <rect x="22" y="22" width="1556" height="856" rx="36" fill="url(#stadium-grid)" />
    <ellipse cx="440" cy="390" rx="470" ry="410" fill="url(#stadium-spot)" />

    <g opacity="0.16" fill="none" stroke="#7dd3fc">
      <path d="M50 190H1550" strokeOpacity="0.3" />
      <path d="M50 770H1550" strokeOpacity="0.24" />
      <path d="M1135 190V770" strokeOpacity="0.22" />
    </g>

    <g transform="translate(1240 585) rotate(-8)" opacity="0.11" fill="none" stroke="#67e8f9">
      <ellipse cx="0" cy="0" rx="278" ry="178" strokeWidth="3" />
      <ellipse cx="0" cy="0" rx="236" ry="139" strokeWidth="13" strokeOpacity="0.48" />
      <rect x="-179" y="-94" width="358" height="188" rx="8" strokeWidth="2" />
      <line x1="0" y1="-94" x2="0" y2="94" strokeWidth="2" />
      <circle cx="0" cy="0" r="29" strokeWidth="2" />
      <path d="M-179-47h49v94h-49M179-47h-49v94h49" strokeWidth="2" />
      <path d="M-246-118q246-78 492 0M-246 118q246 78 492 0" strokeWidth="8" strokeOpacity="0.45" />
    </g>

    <g opacity="0.12" fill="url(#stadium-hatch)">
      <path d="M0 0h430l-76 900H0z" />
      <path d="M1310 0h290v900h-195z" />
    </g>

    <path d="M38 73h310" stroke={primaryColor} strokeOpacity="0.6" strokeWidth="3" />
    <path d="M1250 827h302" stroke={secondaryColor} strokeOpacity="0.48" strokeWidth="3" />
    <circle cx="348" cy="73" r="5" fill={primaryColor} filter="url(#stadium-soft-glow)" />
  </svg>
);

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
  const primaryColor = club.colorsHex?.[0] || '#0ea5e9';
  const secondaryColor = club.colorsHex?.[1] || '#f59e0b';

  return (
    <div className={`fixed inset-0 z-[400] flex items-center justify-center overflow-hidden bg-[#010307]/90 p-6 backdrop-blur-xl ${exitClass}`} onClick={closeModal}>
      <div
        className="relative h-[min(900px,calc(100vh-48px))] w-[min(1600px,calc(100vw-48px))] overflow-hidden rounded-[48px] border border-cyan-100/15 shadow-[0_45px_110px_rgba(0,0,0,0.72)]"
        onClick={e => e.stopPropagation()}
      >
        <StadiumModalScene primaryColor={primaryColor} secondaryColor={secondaryColor} />

        <button
          type="button"
          onClick={closeModal}
          aria-label="Zamknij szczegóły stadionu"
          className="absolute right-8 top-7 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#06111f]/88 text-base font-black text-slate-300 shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-colors hover:border-cyan-200/35 hover:bg-cyan-300/10 hover:text-white"
        >
          ✕
        </button>

        <div className="relative z-10 grid h-full min-h-0 grid-rows-[142px_minmax(0,1fr)_106px] px-10 pb-8 pt-7">
          <header className="flex items-center justify-between border-b border-cyan-100/10 pr-16">
            <div className="flex min-w-0 items-center gap-5">
              {logo && (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] border border-white/10 bg-[#06111f]/75 p-2 shadow-[0_12px_34px_rgba(0,0,0,0.35)] backdrop-blur-sm">
                  <img src={logo} alt={club.name} className="h-full w-full object-contain drop-shadow-lg" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-black italic uppercase tracking-tighter text-amber-300/85">Infrastruktura</p>
                <h2 className="mt-1 truncate text-[36px] font-semibold leading-tight tracking-[-0.025em] text-white">{club.stadiumName}</h2>
                <div className="mt-2 flex items-center gap-3">
                  <span className="rounded-full border border-cyan-200/15 bg-cyan-300/10 px-3 py-1 text-[9px] font-black italic uppercase tracking-tighter text-cyan-100/80">
                    {getTierLabel(club.stadiumCapacity)}
                  </span>
                  <span className="text-[12px] font-medium text-slate-400">{club.name}</span>
                </div>
              </div>
            </div>

            <div className="mr-2 text-right">
              <p className="text-[9px] font-black italic uppercase tracking-tighter text-slate-400">Łączna pojemność</p>
              <p className="mt-1 text-[38px] font-semibold leading-none tracking-[-0.035em] text-white">
                {club.stadiumCapacity.toLocaleString('pl-PL')}
              </p>
              <p className="mt-1 text-[9px] font-black italic uppercase tracking-tighter text-amber-300/75">miejsc</p>
            </div>
          </header>

          <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_420px] gap-7 py-6">
            <section className="relative min-h-0 overflow-hidden rounded-[30px] border border-cyan-100/15 bg-[#020812]/80 shadow-[0_24px_54px_rgba(0,0,0,0.34)]">
              <div className="absolute inset-x-0 top-0 z-10 flex h-12 items-center justify-between bg-gradient-to-b from-[#020812]/85 to-transparent px-5">
                <p className="text-[9px] font-black italic uppercase tracking-tighter text-cyan-100/70">Widok 3D stadionu</p>
                <div className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
                  {getTierLabel(club.stadiumCapacity)}
                </div>
              </div>
              <Stadium3DViewer capacity={club.stadiumCapacity} primaryColor={primaryColor} seatColors={club.stadiumSeatColors} />
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
                <path d="M22 72V22h50M928 22h50v50M22 528v50h50M978 528v50h-50" fill="none" stroke="#a5f3fc" strokeOpacity="0.34" strokeWidth="2" />
                <path d="M350 578h300" stroke={primaryColor} strokeOpacity="0.7" strokeWidth="3" />
              </svg>
            </section>

            <aside className="min-h-0 overflow-y-auto rounded-[30px] border border-cyan-100/10 bg-[#04101d]/88 px-6 py-5 shadow-[0_20px_46px_rgba(0,0,0,0.3)] backdrop-blur-[5px] custom-scrollbar">
              <section>
                <p className="text-[9px] font-black italic uppercase tracking-tighter text-amber-300/80">Charakterystyka</p>
                <p className="mt-3 text-[14px] font-normal leading-[1.65] tracking-normal text-slate-200/80">
                  {getTierDescription(club.stadiumCapacity)}
                </p>
              </section>

              <section className="mt-6 border-t border-white/10 pt-5">
                <p className="text-[11px] font-black italic uppercase tracking-tighter text-cyan-100/65">Pojemność trybun</p>
                <div className="mt-5 space-y-5">
                  {stands.map(({ label, seats, pct }, index) => {
                    const barColor = index % 2 === 0 ? primaryColor : secondaryColor;
                    return (
                    <div key={label} className="border-b border-white/[0.065] pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-end justify-between gap-4">
                        <p className="text-[12px] font-black italic uppercase tracking-tighter leading-tight text-slate-200/85">{label}</p>
                        <p className="shrink-0 text-[17px] font-semibold leading-none tracking-[-0.02em] text-white">{seats.toLocaleString('pl-PL')}</p>
                      </div>
                      <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/[0.055] bg-[#01060c]/75 shadow-[inset_0_2px_5px_rgba(0,0,0,0.72)]">
                        <div
                          className="relative h-full overflow-hidden rounded-full transition-[width] duration-700 ease-out"
                          style={{
                            width: `${pct * 2.75}%`,
                            background: `linear-gradient(90deg, ${barColor}a8 0%, ${barColor} 78%, #ffffff 180%)`,
                            boxShadow: `0 0 14px ${barColor}73`,
                          }}
                        >
                          <span className="absolute inset-x-1 top-px h-[2px] rounded-full bg-white/40" />
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </section>

              {activeProjects.length > 0 && (
                <section className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-[9px] font-black italic uppercase tracking-tighter text-amber-300/75">W toku</p>
                  <div className="mt-3 space-y-3">
                    {activeProjects.map(project => (
                      <div key={project.id} className="border-l-2 border-amber-300/45 bg-amber-300/[0.045] px-3 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] font-black italic uppercase tracking-tighter text-white">{StadiumExpansionService.getStandLabel(project.stand)}</p>
                          <span className={`shrink-0 rounded-full border px-2 py-1 text-[7px] font-black italic uppercase tracking-tighter ${PHASE_COLOR[project.phase] ?? 'border-white/10 text-slate-400'}`}>
                            {StadiumExpansionService.getPhaseLabel(project.phase)}
                          </span>
                        </div>
                        <p className="mt-1 text-[9px] font-black italic uppercase tracking-tighter text-slate-400">
                          Termin fazy: {new Date(project.phaseEndDate).toLocaleDateString('pl-PL')}
                        </p>
                        {project.requestedCapacityIncrease > 0 && (
                          <p className="mt-1 text-[9px] font-black italic uppercase tracking-tighter text-amber-200/75">
                            +{project.requestedCapacityIncrease.toLocaleString('pl-PL')} miejsc
                          </p>
                        )}
                        {project.financeType === 'CITY_AID' && (
                          <p className="mt-1 text-[9px] font-black italic uppercase tracking-tighter text-cyan-300/75">
                            Finansowanie z udziałem miasta{project.cityAidAmount ? `: ${project.cityAidAmount.toLocaleString('pl-PL')} PLN` : ''}
                          </p>
                        )}
                        {project.log.length > 0 && (
                          <p className="mt-2 text-[10px] font-normal leading-relaxed text-slate-300/65">{project.log[project.log.length - 1].message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {completedProjects.length > 0 && (
                <section className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-[9px] font-black italic uppercase tracking-tighter text-emerald-300/70">Zrealizowane</p>
                  <div className="mt-3 space-y-2">
                    {completedProjects.map(project => (
                      <div key={project.id} className="flex items-center justify-between border-l-2 border-emerald-300/40 px-3 py-2">
                        <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-300">{StadiumExpansionService.getStandLabel(project.stand)}</p>
                        <span className="text-[9px] font-black italic uppercase tracking-tighter text-emerald-300">
                          +{project.approvedCapacityIncrease ?? project.requestedCapacityIncrease} miejsc
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          </div>

          <button
            type="button"
            onClick={onRequestExpansion}
            className="group relative overflow-hidden rounded-[24px] border border-amber-300/25 bg-[#130f0b]/82 px-6 text-left shadow-[inset_3px_0_0_rgba(251,191,36,0.72),0_12px_28px_rgba(0,0,0,0.25)] transition-all hover:border-amber-200/45 hover:bg-amber-300/10"
          >
            <div className="flex h-full items-center justify-between gap-8">
              <div>
                <p className="text-[9px] font-black italic uppercase tracking-tighter text-amber-300/80">Inwestycja</p>
                <p className="mt-1 text-[19px] font-black italic uppercase tracking-tighter text-white">Złóż wniosek o rozbudowę</p>
                <p className="mt-1 text-[11px] font-normal tracking-normal text-slate-300/65">Wybierz trybunę do rozbudowy — zarząd oceni warunki i podejmie decyzję</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/20 bg-amber-300/10 text-xl text-amber-200 transition-transform group-hover:translate-x-1">→</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
