import React from 'react';
import { useModalClose } from '../ui/useModalClose';
import { BoardClubRequestType, Club } from '../../types';

interface BoardRequestModalProps {
  club: Club;
  onClose: () => void;
  onSelectStadium: () => void;
  onSelectRequest: (requestType: BoardClubRequestType) => void;
}

interface RequestCard {
  type: BoardClubRequestType;
  category: string;
  title: string;
  description: string;
  meta: string;
  tone: 'emerald' | 'amber' | 'sky' | 'slate';
}

const requestCards: RequestCard[] = [
  {
    type: 'CLUB_FUNDS',
    category: 'Finanse',
    title: 'Dodatkowe środki klubowe',
    description: 'Poproś zarząd o jednorazowy zastrzyk gotówki do głównego salda klubu.',
    meta: 'Zwiększa budżet klubu',
    tone: 'emerald',
  },
  {
    type: 'TRANSFER_BUDGET',
    category: 'Transfery',
    title: 'Zwiększenie budżetu transferowego',
    description: 'Wniosek o przesunięcie środków z rezerwy zarządu do puli na transfery i kontrakty.',
    meta: 'Rezerwa zarządu → budżet transferowy',
    tone: 'amber',
  },
  {
    type: 'RESERVE_STATUS',
    category: 'Finanse',
    title: 'Stan rezerwy zarządu',
    description: 'Poproś dyrektora finansowego o informację, ile środków zarząd trzyma poza głównym saldem klubu.',
    meta: 'Raport bez kosztu',
    tone: 'emerald',
  },
  {
    type: 'EXCEPTIONAL_CONTRACT',
    category: 'Kontrakty',
    title: 'Zgoda na wyjątkowy kontrakt',
    description: 'Jednorazowa zgoda zarządu na bardziej ryzykowną pensję lub bonus przy najbliższej zaakceptowanej umowie.',
    meta: 'Łagodzi sprzeciw zarządu',
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

const toneClasses: Record<RequestCard['tone'], { text: string; dot: string; hover: string; wash: string }> = {
  emerald: {
    text: 'text-emerald-300',
    dot: 'bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.7)]',
    hover: 'hover:border-emerald-300/45',
    wash: 'from-emerald-400/10',
  },
  amber: {
    text: 'text-amber-300',
    dot: 'bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.68)]',
    hover: 'hover:border-amber-300/45',
    wash: 'from-amber-400/10',
  },
  sky: {
    text: 'text-sky-300',
    dot: 'bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.68)]',
    hover: 'hover:border-sky-300/45',
    wash: 'from-sky-400/10',
  },
  slate: {
    text: 'text-slate-300',
    dot: 'bg-slate-300 shadow-[0_0_12px_rgba(203,213,225,0.5)]',
    hover: 'hover:border-slate-300/35',
    wash: 'from-slate-300/10',
  },
};

export const BoardRequestScene: React.FC = () => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 1660 920"
    preserveAspectRatio="xMidYMid slice"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="board-request-shell" x1="40" y1="20" x2="1590" y2="900" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10283B" />
        <stop offset="0.47" stopColor="#08172A" />
        <stop offset="1" stopColor="#030814" />
      </linearGradient>
      <linearGradient id="board-request-office" x1="40" y1="20" x2="500" y2="900" gradientUnits="userSpaceOnUse">
        <stop stopColor="#173D52" />
        <stop offset="0.52" stopColor="#0A2639" />
        <stop offset="1" stopColor="#04101C" />
      </linearGradient>
      <linearGradient id="board-request-window" x1="250" y1="110" x2="250" y2="390" gradientUnits="userSpaceOnUse">
        <stop stopColor="#5CAEC5" stopOpacity="0.35" />
        <stop offset="0.56" stopColor="#174D68" stopOpacity="0.42" />
        <stop offset="1" stopColor="#071525" stopOpacity="0.78" />
      </linearGradient>
      <linearGradient id="board-request-table" x1="250" y1="500" x2="250" y2="850" gradientUnits="userSpaceOnUse">
        <stop stopColor="#16485A" />
        <stop offset="1" stopColor="#071624" />
      </linearGradient>
      <linearGradient id="board-request-accent" x1="450" y1="0" x2="590" y2="920" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" />
        <stop offset="0.45" stopColor="#14B8A6" />
        <stop offset="1" stopColor="#0EA5E9" stopOpacity="0.2" />
      </linearGradient>
      <radialGradient id="board-request-reading-glow" cx="0" cy="0" r="1" gradientTransform="translate(1100 430) rotate(90) scale(550 790)" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0EA5E9" stopOpacity="0.1" />
        <stop offset="1" stopColor="#14B8A6" stopOpacity="0" />
      </radialGradient>
      <pattern id="board-request-dots" width="22" height="22" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#BAE6FD" fillOpacity="0.07" />
      </pattern>
      <filter id="board-request-shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="28" stdDeviation="32" floodColor="#000000" floodOpacity="0.65" />
      </filter>
      <filter id="board-request-blur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="22" />
      </filter>
      <clipPath id="board-request-clip">
        <rect x="2" y="2" width="1656" height="916" rx="48" />
      </clipPath>
      <clipPath id="board-request-window-clip">
        <rect x="46" y="108" width="408" height="275" rx="18" />
      </clipPath>
    </defs>

    <g filter="url(#board-request-shadow)">
      <rect x="2" y="2" width="1656" height="916" rx="48" fill="url(#board-request-shell)" />
    </g>

    <g clipPath="url(#board-request-clip)">
      <rect width="1660" height="920" fill="url(#board-request-shell)" />
      <rect width="1660" height="920" fill="url(#board-request-dots)" />
      <rect x="470" width="1190" height="920" fill="url(#board-request-reading-glow)" />

      <path d="M0 0H516C487 183 496 328 535 454C574 580 558 742 477 920H0V0Z" fill="url(#board-request-office)" />
      <path d="M472 0C446 180 456 329 500 460C538 574 526 736 446 920H500C575 720 586 568 547 446C507 318 502 179 535 0H472Z" fill="url(#board-request-accent)" opacity="0.64" />
      <path d="M509 0C484 179 493 325 538 453C576 562 565 723 490 920" stroke="#FEF3C7" strokeOpacity="0.16" strokeWidth="2" />

      {/* Pełne boisko piłkarskie widoczne z gabinetu zarządu. */}
      <g clipPath="url(#board-request-window-clip)">
        <rect x="46" y="108" width="408" height="275" fill="#06121E" />

        {/* Obrzeże stadionu i rzędy trybun otaczające murawę. */}
        <rect x="57" y="116" width="386" height="259" rx="24" fill="#0A1C2B" stroke="#7DD3FC" strokeOpacity="0.12" strokeWidth="3" />
        <path d="M74 126H426M68 137H432M74 365H426M68 354H432" stroke="#BAE6FD" strokeOpacity="0.12" strokeWidth="5" strokeDasharray="3 9" />
        <path d="M58 174v136M442 174v136" stroke="#FDE68A" strokeOpacity="0.1" strokeWidth="7" strokeDasharray="3 10" />

        {/* Murawa z naprzemiennymi pasami koszenia. */}
        <rect x="76" y="139" width="348" height="210" rx="3" fill="#0B665B" />
        <rect x="76" y="139" width="43.5" height="210" fill="#D1FAE5" fillOpacity="0.045" />
        <rect x="163" y="139" width="43.5" height="210" fill="#D1FAE5" fillOpacity="0.045" />
        <rect x="250" y="139" width="43.5" height="210" fill="#D1FAE5" fillOpacity="0.045" />
        <rect x="337" y="139" width="43.5" height="210" fill="#D1FAE5" fillOpacity="0.045" />

        {/* Wszystkie podstawowe oznaczenia prawdziwego boiska. */}
        <g stroke="#D1FAE5" strokeOpacity="0.58" strokeWidth="2.2" strokeLinejoin="round">
          <rect x="76" y="139" width="348" height="210" rx="2" />
          <path d="M250 139v210" />
          <circle cx="250" cy="244" r="34" />
          <circle cx="250" cy="244" r="2.5" fill="#D1FAE5" />

          {/* Lewa połowa: pole karne, bramkowe, łuk, punkt karny i bramka. */}
          <path d="M76 181h70v126H76" />
          <path d="M76 213h30v62H76" />
          <path d="M146 216c17 4 27 14 27 28s-10 24-27 28" />
          <circle cx="124" cy="244" r="2.5" fill="#D1FAE5" />
          <path d="M76 222H66v44h10" />
          <path d="M66 222 61 228v32l5 6" opacity="0.48" />

          {/* Prawa połowa: pole karne, bramkowe, łuk, punkt karny i bramka. */}
          <path d="M424 181h-70v126h70" />
          <path d="M424 213h-30v62h30" />
          <path d="M354 216c-17 4-27 14-27 28s10 24 27 28" />
          <circle cx="376" cy="244" r="2.5" fill="#D1FAE5" />
          <path d="M424 222h10v44h-10" />
          <path d="m434 222 5 6v32l-5 6" opacity="0.48" />

          {/* Łuki narożne. */}
          <path d="M76 151c7 0 12-5 12-12M412 139c0 7 5 12 12 12M76 337c7 0 12 5 12 12M412 349c0-7 5-12 12-12" />
        </g>

        {/* Subtelne światło murawy i punkty ustawienia zawodników. */}
        <ellipse cx="250" cy="244" rx="174" ry="105" fill="#34D399" fillOpacity="0.035" />
        <g fill="#FBBF24" fillOpacity="0.78">
          <circle cx="112" cy="244" r="3.5" />
          <circle cx="185" cy="195" r="3.5" />
          <circle cx="185" cy="293" r="3.5" />
          <circle cx="223" cy="244" r="3.5" />
        </g>
        <g fill="#38BDF8" fillOpacity="0.8">
          <circle cx="388" cy="244" r="3.5" />
          <circle cx="315" cy="195" r="3.5" />
          <circle cx="315" cy="293" r="3.5" />
          <circle cx="277" cy="244" r="3.5" />
        </g>
      </g>
      <rect x="46" y="108" width="408" height="275" rx="18" stroke="#BAE6FD" strokeOpacity="0.2" strokeWidth="5" />

      {/* Ekran prezentacyjny z planem stadionu. */}
      <g transform="translate(73 415)">
        <rect width="354" height="128" rx="13" fill="#061522" stroke="#7DD3FC" strokeOpacity="0.26" strokeWidth="3" />
        <path d="M18 24h88M18 42h56" stroke="#BAE6FD" strokeOpacity="0.22" strokeWidth="4" strokeLinecap="round" />
        <g transform="translate(270 65)" stroke="#A7F3D0" strokeOpacity="0.42" strokeWidth="2">
          <ellipse rx="57" ry="35" />
          <ellipse rx="42" ry="24" />
          <rect x="-25" y="-11" width="50" height="22" rx="2" />
          <path d="M-57 0h15M42 0h15M0-35v11M0 24v11" />
        </g>
        <path d="M20 91h119M20 106h82" stroke="#FDE68A" strokeOpacity="0.2" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* Stół konferencyjny i dokumenty – bez uproszczonych sylwetek ludzi. */}
      <ellipse cx="250" cy="842" rx="214" ry="28" fill="#010710" fillOpacity="0.76" />
      <path d="M117 571H383L462 810H38L117 571Z" fill="url(#board-request-table)" stroke="#93C5D8" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M117 571H383" stroke="#A7F3D0" strokeOpacity="0.35" strokeWidth="5" />
      <path d="M78 690H422M54 766h392" stroke="#67E8F9" strokeOpacity="0.11" strokeWidth="2" />
      <path d="M108 810 94 862M392 810l14 52" stroke="#06111D" strokeWidth="18" />

      <g transform="translate(105 624) rotate(-5)">
        <rect width="105" height="68" rx="6" fill="#E2E8F0" fillOpacity="0.09" stroke="#BAE6FD" strokeOpacity="0.2" strokeWidth="2" />
        <path d="M15 17h58M15 29h74M15 41h52M15 53h67" stroke="#E0F2FE" strokeOpacity="0.27" strokeWidth="3" strokeLinecap="round" />
        <circle cx="86" cy="17" r="8" fill="#FBBF24" fillOpacity="0.28" />
      </g>
      <g transform="translate(281 617) rotate(4)">
        <path d="M0 12h82l14 72H10L0 12Z" fill="#B78323" fillOpacity="0.2" stroke="#FDE68A" strokeOpacity="0.32" strokeWidth="2" />
        <path d="M0 12 13 0h31l9 12" fill="#FBBF24" fillOpacity="0.2" />
        <path d="M19 34h57M21 47h48M23 60h54" stroke="#FEF3C7" strokeOpacity="0.27" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform="translate(205 724)">
        <rect width="91" height="54" rx="5" fill="#071522" stroke="#67E8F9" strokeOpacity="0.3" strokeWidth="2" />
        <path d="M14 39 29 28l12 5 16-18 20 8" stroke="#34D399" strokeOpacity="0.52" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="29" cy="28" r="3" fill="#FBBF24" />
        <circle cx="57" cy="15" r="3" fill="#34D399" />
      </g>

      {/* Dyskretna geometria boiska i pieczęci klubowej w części decyzyjnej. */}
      <g transform="translate(1125 495)" opacity="0.05" stroke="#38BDF8" strokeWidth="3">
        <rect x="-390" y="-207" width="780" height="414" rx="18" />
        <path d="M0-207V207" />
        <circle r="75" />
        <circle r="4" fill="#38BDF8" />
        <path d="M-390-101h116v202h-116M390-101H274v202h116M-390-51h55v102h-55M390-51h-55v102h55" />
        <path d="M-274-39c31 5 50 18 50 39s-19 34-50 39M274-39c-31 5-50 18-50 39s19 34 50 39" />
        <path d="M-390-207c14 0 25 11 25 25M390-207c-14 0-25 11-25 25M-390 207c14 0 25-11 25-25M390 207c-14 0-25-11-25-25" />
      </g>
      <g transform="translate(1465 760) rotate(-12)" opacity="0.045" stroke="#FDE68A" strokeWidth="6">
        <circle r="188" />
        <circle r="153" />
        <path d="M0-128 91-91 128 0 91 91 0 128-91 91-128 0-91-91Z" />
        <path d="M0-128V0M91-91 0 0M128 0H0M91 91 0 0M0 128V0M-91 91 0 0M-128 0H0M-91-91 0 0" />
      </g>

      <ellipse cx="1100" cy="910" rx="500" ry="34" fill="#14B8A6" fillOpacity="0.1" filter="url(#board-request-blur)" />
      <path d="M525 872H1560" stroke="#67E8F9" strokeOpacity="0.14" />
      <path d="M525 877H970" stroke="#FBBF24" strokeOpacity="0.46" strokeWidth="3" />
    </g>

    <rect x="2" y="2" width="1656" height="916" rx="48" stroke="#D1FAE5" strokeOpacity="0.14" strokeWidth="2" />
  </svg>
);

export const BoardRequestModal: React.FC<BoardRequestModalProps> = ({
  club,
  onClose,
  onSelectStadium,
  onSelectRequest,
}) => {
  const { closeModal, exitClass } = useModalClose(onClose);
  const reserveBudget = Math.max(0, club.reserveBudget ?? 0);

  const renderRequest = (card: RequestCard) => {
    const tone = toneClasses[card.tone];

    return (
      <button
        key={card.type}
        type="button"
        onClick={() => onSelectRequest(card.type)}
        className={`group relative grid min-h-[92px] w-full grid-cols-[132px_minmax(0,1fr)_auto] items-center gap-5 overflow-hidden border-b border-white/10 px-1 py-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/60 ${tone.hover}`}
      >
        <span className={`absolute inset-y-2 left-0 w-0 rounded-r-full bg-gradient-to-r ${tone.wash} to-transparent transition-[width] duration-300 group-hover:w-full`} />
        <span className={`relative flex items-center gap-2 text-[12px] font-medium tracking-normal ${tone.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
          {card.category}
        </span>
        <span className="relative min-w-0">
          <span className="block text-[18px] font-semibold leading-snug tracking-[-0.01em] text-slate-100 transition-colors group-hover:text-white">
            {card.title}
          </span>
          <span className="mt-1 block max-w-[760px] text-[13px] font-normal leading-relaxed tracking-normal text-slate-300/65">
            {card.description}
          </span>
          <span className={`mt-1.5 block text-[11px] font-medium tracking-normal ${tone.text} opacity-65`}>
            {card.meta}
          </span>
        </span>
        <span className={`relative mr-3 text-xl font-light opacity-55 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 ${tone.text}`}>→</span>
      </button>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-[1200] flex items-center justify-center overflow-hidden bg-[#010307]/90 p-7 backdrop-blur-xl ${exitClass}`}
      onClick={closeModal}
    >
      <div
        className="relative h-[min(920px,calc(100vh-56px))] w-[min(1660px,calc(100vw-64px))] overflow-hidden rounded-[48px]"
        onClick={event => event.stopPropagation()}
      >
        <BoardRequestScene />

        <button
          type="button"
          onClick={closeModal}
          aria-label="Zamknij prośbę do zarządu"
          className="absolute right-9 top-8 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#071321]/85 text-lg font-semibold text-slate-300 shadow-[0_8px_22px_rgba(0,0,0,0.35)] transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
        >
          ✕
        </button>

        <div className="relative z-10 grid h-full grid-cols-[500px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col justify-between px-14 pb-12 pt-11">
            <div>
              <div className="flex items-center gap-3 text-[15px] font-semibold tracking-normal text-amber-100">
                <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.72)]" />
                Komunikacja z zarządem
              </div>
              <p className="mt-2 text-sm font-normal tracking-normal text-cyan-100/50">Gabinet zarządu</p>
            </div>

            <div className="mb-2 max-w-[335px]">
              <p className="text-[12px] font-medium tracking-normal text-amber-200/65">Klub</p>
              <h2 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.025em] text-white">
                {club.name}
              </h2>

              <div className="mt-7 border-y border-white/10 py-5">
                <p className="text-[12px] font-medium tracking-normal text-cyan-100/55">Rezerwa zarządu</p>
                <p className="mt-2 text-[30px] font-semibold leading-none tracking-[-0.025em] text-white">
                  {reserveBudget.toLocaleString('pl-PL')} <span className="text-base font-medium text-amber-300">PLN</span>
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-5 text-sm">
                <div>
                  <p className="text-cyan-100/45">Stadion</p>
                  <p className="mt-1 font-medium text-slate-100">{club.stadiumName}</p>
                </div>
                <div>
                  <p className="text-cyan-100/45">Pojemność</p>
                  <p className="mt-1 font-medium text-slate-100">{club.stadiumCapacity.toLocaleString('pl-PL')}</p>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex min-h-0 flex-col pb-10 pl-14 pr-16 pt-12">
            <header className="shrink-0 pr-20">
              <p className="text-sm font-medium tracking-normal text-amber-300/85">Centrum decyzyjne klubu</p>
              <h1 className="mt-2 text-[42px] font-semibold leading-[1.12] tracking-[-0.025em] text-white">
                Prośba do zarządu
              </h1>
              <p className="mt-3 max-w-[860px] text-[16px] font-normal leading-relaxed tracking-normal text-slate-300/65">
                Wybierz temat oficjalnego wniosku. Zarząd oceni finanse, sytuację sportową oraz dotychczasową pracę trenera.
              </p>
            </header>

            <section className="mt-6 min-h-0 flex-1 overflow-y-auto pr-3 custom-scrollbar">
              <button
                type="button"
                onClick={onSelectStadium}
                className="group relative grid min-h-[98px] w-full grid-cols-[132px_minmax(0,1fr)_auto] items-center gap-5 overflow-hidden border-y border-white/10 px-1 py-4 text-left transition-colors duration-200 hover:border-amber-300/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300/60"
              >
                <span className="absolute inset-y-2 left-0 w-0 rounded-r-full bg-gradient-to-r from-amber-400/10 to-transparent transition-[width] duration-300 group-hover:w-full" />
                <span className="relative flex items-center gap-2 text-[12px] font-medium tracking-normal text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.68)]" />
                  Infrastruktura
                </span>
                <span className="relative min-w-0">
                  <span className="block text-[18px] font-semibold leading-snug tracking-[-0.01em] text-slate-100 transition-colors group-hover:text-white">
                    Rozbudowa stadionu
                  </span>
                  <span className="mt-1 block max-w-[760px] text-[13px] font-normal leading-relaxed tracking-normal text-slate-300/65">
                    Złóż wniosek o rozbudowę jednej z trybun stadionu {club.stadiumName}. Zarząd przeanalizuje zasadność inwestycji.
                  </span>
                  <span className="mt-1.5 block text-[11px] font-medium tracking-normal text-amber-300/65">
                    {club.stadiumCapacity.toLocaleString('pl-PL')} miejsc
                  </span>
                </span>
                <span className="relative mr-3 text-xl font-light text-amber-300/60 transition-all duration-200 group-hover:translate-x-1 group-hover:text-amber-300">→</span>
              </button>

              {requestCards.map(renderRequest)}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};
