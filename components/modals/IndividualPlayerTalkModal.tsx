import React from 'react';
import { IndividualTalkType } from '../../types';
import { INDIVIDUAL_TALK_OPTIONS, IndividualTalkResult } from '../../services/PlayerMoraleService';

interface Props {
  playerName: string;
  clubName: string;
  clubLogoUrl: string | null;
  positionLabel: string;
  overall: number;
  moraleLabel: string;
  canTalk: boolean;
  nextTalkLabel: string;
  result: IndividualTalkResult | null;
  onSelect: (type: IndividualTalkType) => void;
  onClose: () => void;
}

export const PlayerConversationScene: React.FC = () => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 1660 920"
    preserveAspectRatio="xMidYMid slice"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="talk-shell" x1="30" y1="10" x2="1580" y2="920" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0A213C" />
        <stop offset="0.48" stopColor="#07162A" />
        <stop offset="1" stopColor="#030815" />
      </linearGradient>
      <linearGradient id="talk-office" x1="0" y1="40" x2="520" y2="900" gradientUnits="userSpaceOnUse">
        <stop stopColor="#153F5C" />
        <stop offset="0.48" stopColor="#0A2339" />
        <stop offset="1" stopColor="#030914" />
      </linearGradient>
      <linearGradient id="talk-sky" x1="245" y1="105" x2="245" y2="390" gradientUnits="userSpaceOnUse">
        <stop stopColor="#72B9D0" stopOpacity="0.48" />
        <stop offset="0.55" stopColor="#1A5474" stopOpacity="0.35" />
        <stop offset="1" stopColor="#071A2C" stopOpacity="0.76" />
      </linearGradient>
      <linearGradient id="talk-pitch" x1="250" y1="185" x2="250" y2="430" gradientUnits="userSpaceOnUse">
        <stop stopColor="#238777" stopOpacity="0.62" />
        <stop offset="1" stopColor="#075052" stopOpacity="0.82" />
      </linearGradient>
      <linearGradient id="talk-accent" x1="450" y1="0" x2="610" y2="920" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34D399" />
        <stop offset="0.55" stopColor="#06B6D4" />
        <stop offset="1" stopColor="#2563EB" stopOpacity="0.18" />
      </linearGradient>
      <radialGradient id="talk-reading-glow" cx="0" cy="0" r="1" gradientTransform="translate(1110 450) rotate(90) scale(540 790)" gradientUnits="userSpaceOnUse">
        <stop stopColor="#14B8A6" stopOpacity="0.1" />
        <stop offset="1" stopColor="#0EA5E9" stopOpacity="0" />
      </radialGradient>
      <pattern id="talk-dots" width="22" height="22" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#A5F3FC" fillOpacity="0.075" />
      </pattern>
      <filter id="talk-shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="28" stdDeviation="32" floodColor="#000000" floodOpacity="0.62" />
      </filter>
      <filter id="talk-blur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="22" />
      </filter>
      <filter id="talk-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
      <clipPath id="talk-clip">
        <rect x="2" y="2" width="1656" height="916" rx="48" />
      </clipPath>
      <clipPath id="talk-window-clip">
        <rect x="45" y="103" width="410" height="330" rx="18" />
      </clipPath>
    </defs>

    <g filter="url(#talk-shadow)">
      <rect x="2" y="2" width="1656" height="916" rx="48" fill="url(#talk-shell)" />
    </g>

    <g clipPath="url(#talk-clip)">
      <rect width="1660" height="920" fill="url(#talk-shell)" />
      <rect width="1660" height="920" fill="url(#talk-dots)" />
      <rect x="470" width="1190" height="920" fill="url(#talk-reading-glow)" />

      {/* Gabinet trenera zajmuje całą lewą część sceny. */}
      <path d="M0 0H516C486 185 496 331 536 456C574 575 559 737 478 920H0V0Z" fill="url(#talk-office)" />
      <path d="M474 0C446 187 456 330 501 462C538 570 526 736 447 920H500C575 718 586 568 548 449C508 320 503 180 536 0H474Z" fill="url(#talk-accent)" opacity="0.68" />
      <path d="M510 0C485 181 494 326 539 454C576 561 566 721 491 920" stroke="#A7F3D0" strokeOpacity="0.18" strokeWidth="2" />

      {/* Panoramiczne okno: stadion i pełne boisko w perspektywie. */}
      <g clipPath="url(#talk-window-clip)">
        <rect x="45" y="103" width="410" height="330" fill="url(#talk-sky)" />
        <path d="M45 188C116 149 188 137 250 137C324 137 396 154 455 191V278H45V188Z" fill="#081523" fillOpacity="0.66" />
        <path d="M45 206C121 171 187 161 250 161C320 161 391 174 455 208" stroke="#A5F3FC" strokeOpacity="0.16" strokeWidth="9" />
        <path d="M45 232C128 198 190 190 250 190C317 190 381 200 455 233" stroke="#BAE6FD" strokeOpacity="0.11" strokeWidth="18" strokeDasharray="3 10" />
        <g fill="#E0F2FE" opacity="0.5" filter="url(#talk-soft-glow)">
          <path d="M70 112h8l20 94h-6z" />
          <path d="M430 112h-8l-20 94h6z" />
        </g>
        <g stroke="#94A3B8" strokeOpacity="0.4" strokeWidth="3">
          <path d="M72 111 93 210M426 111l-21 99" />
          <path d="M61 133h27M411 133h27" />
        </g>

        <path d="M111 178H389L452 432H48L111 178Z" fill="url(#talk-pitch)" />
        <g opacity="0.14" fill="#D1FAE5">
          <path d="M111 178h47l-25 254H48z" />
          <path d="M205 178h46v254h-71z" />
          <path d="M297 178h45l72 254h-70z" />
        </g>
        <g stroke="#D1FAE5" strokeOpacity="0.54" strokeWidth="2.4" strokeLinejoin="round">
          <path d="M111 178H389L452 432H48L111 178Z" />
          <path d="M89 297H411" />
          <ellipse cx="250" cy="297" rx="54" ry="31" />
          <path d="M250 294v6" strokeLinecap="round" />

          {/* Pole karne, pole bramkowe, łuk i bramka po stronie północnej. */}
          <path d="M174 178 169 223H331L326 178" />
          <path d="M215 178 213 198H287L285 178" />
          <path d="M219 223c4 15 16 23 31 23s27-8 31-23" />
          <path d="M250 207v4" strokeLinecap="round" />
          <path d="M226 178v-13h48v13" />
          <path d="M226 165l8 7h32l8-7" opacity="0.55" />

          {/* Pole karne, pole bramkowe, łuk i bramka po stronie południowej. */}
          <path d="M121 432 135 363H365L379 432" />
          <path d="M185 432 191 398H309L315 432" />
          <path d="M195 363c7-22 27-34 55-34s48 12 55 34" />
          <path d="M250 382v5" strokeLinecap="round" />
          <path d="M207 432v16h86v-16" />
          <path d="m207 448 13-9h60l13 9" opacity="0.55" />

          <path d="M111 178c8 0 14 5 15 12M389 178c-8 0-14 5-15 12M48 432c11 0 21-8 23-21M452 432c-11 0-21-8-23-21" />
        </g>
        <path d="M250 103V178" stroke="#BAE6FD" strokeOpacity="0.15" strokeWidth="4" />
        <path d="M45 275H74M426 275h29" stroke="#BAE6FD" strokeOpacity="0.12" strokeWidth="4" />
      </g>
      <rect x="45" y="103" width="410" height="330" rx="18" stroke="#BAE6FD" strokeOpacity="0.22" strokeWidth="5" />
      <path d="M250 105V177" stroke="#BAE6FD" strokeOpacity="0.12" strokeWidth="4" />
      <path d="M45 433h410" stroke="#67E8F9" strokeOpacity="0.28" strokeWidth="5" />

      {/* Pusty gabinet klubowy: koszulka, trofea i stanowisko analityczne. */}
      <path d="M45 455H455" stroke="#8BD7D0" strokeOpacity="0.12" strokeWidth="2" />

      {/* Oprawiona koszulka klubowa. */}
      <g>
        <rect x="61" y="473" width="164" height="164" rx="11" fill="#071522" stroke="#9BD8D0" strokeOpacity="0.24" strokeWidth="3" />
        <rect x="73" y="485" width="140" height="140" rx="5" fill="#0B2332" stroke="#D1FAE5" strokeOpacity="0.09" strokeWidth="2" />
        <path d="M119 514 96 529l13 31 17-8v54h51v-54l17 8 13-31-23-15-17-9c-4 9-10 13-16 13s-12-4-16-13l-16 9Z" fill="#0E665F" fillOpacity="0.58" stroke="#A7F3D0" strokeOpacity="0.43" strokeWidth="3" strokeLinejoin="round" />
        <path d="M136 505c2 12 7 18 15 18s13-6 16-18" stroke="#D1FAE5" strokeOpacity="0.36" strokeWidth="3" />
        <path d="M151 527v68M126 552h51" stroke="#D1FAE5" strokeOpacity="0.14" strokeWidth="2" />
        <path d="M107 615h88" stroke="#67E8F9" strokeOpacity="0.2" strokeWidth="2" />
      </g>

      {/* Półka z pucharem i piłką. */}
      <g>
        <path d="M259 617H438" stroke="#8CC8D3" strokeOpacity="0.42" strokeWidth="5" strokeLinecap="round" />
        <path d="M274 617v19M423 617v19" stroke="#56788C" strokeOpacity="0.42" strokeWidth="5" strokeLinecap="round" />

        <path d="M286 515h53v18c0 24-10 40-26 45-16-5-27-21-27-45v-18Z" fill="#9B7425" fillOpacity="0.62" stroke="#FDE68A" strokeOpacity="0.58" strokeWidth="3" />
        <path d="M286 524h-17c0 22 9 33 28 34M339 524h17c0 22-9 33-28 34" stroke="#FDE68A" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" />
        <path d="M313 578v18M292 601h42M301 592h24" stroke="#FDE68A" strokeOpacity="0.55" strokeWidth="5" strokeLinecap="round" />
        <path d="M294 515h37l-5-11h-27Z" fill="#FBBF24" fillOpacity="0.45" />

        <g transform="translate(395 568)">
          <circle r="34" fill="#091724" stroke="#B7E4DD" strokeOpacity="0.5" strokeWidth="3" />
          <path d="M0-12 12-4 8 10-8 10-12-4Z" fill="#A7F3D0" fillOpacity="0.22" stroke="#D1FAE5" strokeOpacity="0.42" strokeWidth="2" />
          <path d="M0-12V-33M12-4l19-7M8 10l12 18M-8 10l-12 18M-12-4l-19-7" stroke="#D1FAE5" strokeOpacity="0.35" strokeWidth="2" />
          <path d="M0-33 20-27 31-11 31 11 20 28 0 34-20 28-31 11-31-11-20-27Z" stroke="#D1FAE5" strokeOpacity="0.22" strokeWidth="2" />
        </g>
      </g>

      {/* Nowoczesne biurko, pusty fotel i ekran z analizą boiska. */}
      <ellipse cx="248" cy="812" rx="217" ry="31" fill="#020713" fillOpacity="0.72" />
      <path d="M286 651c13-17 34-27 58-27 37 0 67 25 72 60l6 54H274l6-54c1-12 3-23 6-33Z" fill="#071522" stroke="#76A9B8" strokeOpacity="0.28" strokeWidth="4" />
      <path d="M299 651c12-10 27-15 45-15 29 0 53 17 62 43" stroke="#A7F3D0" strokeOpacity="0.13" strokeWidth="3" strokeLinecap="round" />

      <path d="M73 679H429L454 767H47L73 679Z" fill="#0B1B2D" stroke="#7DD3FC" strokeOpacity="0.27" strokeWidth="3" />
      <path d="M73 679H429" stroke="#A7F3D0" strokeOpacity="0.34" strokeWidth="4" />
      <path d="M59 724H442" stroke="#34D399" strokeOpacity="0.2" strokeWidth="2" />

      <g transform="translate(204 594)">
        <path d="M0 0H134L122 82H12L0 0Z" fill="#06131F" stroke="#8BD7D0" strokeOpacity="0.42" strokeWidth="3" strokeLinejoin="round" />
        <rect x="12" y="11" width="110" height="59" rx="4" fill="#0A3538" />
        <g transform="translate(67 40)" stroke="#A7F3D0" strokeOpacity="0.45" strokeWidth="1.5">
          <rect x="-47" y="-23" width="94" height="46" rx="2" />
          <path d="M0-23V23" />
          <ellipse rx="10" ry="8" />
          <path d="M-47-13h15v26h-15M47-13H32v26h15M-47-7h7v14h-7M47-7h-7v14h7" />
        </g>
        <path d="M12 82h110l18 10H-6Z" fill="#102C3C" stroke="#8BD7D0" strokeOpacity="0.3" strokeWidth="2" />
      </g>

      <path d="M98 702h70l12 7H88Z" fill="#102B39" stroke="#BAE6FD" strokeOpacity="0.23" strokeWidth="2" />
      <path d="M102 698h62M113 690h40" stroke="#BAE6FD" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" />
      <path d="M108 767 94 835M397 767l16 68" stroke="#07101D" strokeWidth="14" />
      <path d="M58 835H445" stroke="#23485C" strokeOpacity="0.48" strokeWidth="4" />

      {/* Subtelna piłkarska geometria w części tekstowej. */}
      <g transform="translate(1465 745) rotate(-12)" opacity="0.05" stroke="#A7F3D0" strokeWidth="6">
        <circle r="190" />
        <path d="M0-190 110-154 176-59 176 59 110 154 0 190-110 154-176 59-176-59-110-154Z" />
        <path d="M0-72 68-22 42 58-42 58-68-22Z" fill="#A7F3D0" fillOpacity="0.17" />
        <path d="M0-72V-190M68-22l108-37M42 58l68 96M-42 58l-68 96M-68-22l-108-37" />
      </g>
      <g transform="translate(1160 478)" opacity="0.052" stroke="#38BDF8" strokeWidth="3">
        <rect x="-390" y="-206" width="780" height="412" rx="18" />
        <path d="M0-206V206" />
        <circle r="75" />
        <circle r="4" fill="#38BDF8" />
        <path d="M-390-101h116v202h-116M390-101H274v202h116M-390-51h55v102h-55M390-51h-55v102h55" />
        <path d="M-274-39c31 5 50 18 50 39s-19 34-50 39M274-39c-31 5-50 18-50 39s19 34 50 39" />
        <path d="M-390-38h-13v76h13M390-38h13v76h-13" />
        <path d="M-390-206c14 0 25 11 25 25M390-206c-14 0-25 11-25 25M-390 206c14 0 25-11 25-25M390 206c-14 0-25-11-25-25" />
      </g>

      <ellipse cx="1110" cy="910" rx="490" ry="34" fill="#14B8A6" fillOpacity="0.11" filter="url(#talk-blur)" />
      <path d="M525 872H1560" stroke="#67E8F9" strokeOpacity="0.14" />
      <path d="M525 877H975" stroke="#34D399" strokeOpacity="0.48" strokeWidth="3" />
    </g>

    <rect x="2" y="2" width="1656" height="916" rx="48" stroke="#D1FAE5" strokeOpacity="0.14" strokeWidth="2" />
  </svg>
);

export const IndividualPlayerTalkModal: React.FC<Props> = ({
  playerName,
  clubName,
  clubLogoUrl,
  positionLabel,
  overall,
  moraleLabel,
  canTalk,
  nextTalkLabel,
  result,
  onSelect,
  onClose,
}) => (
  <div
    className="fixed inset-0 z-[260] flex items-center justify-center overflow-hidden bg-[#010307]/90 p-7 backdrop-blur-xl animate-fade-in"
    onClick={onClose}
  >
    <div
      className="relative h-[min(920px,calc(100vh-56px))] w-[min(1660px,calc(100vw-64px))] overflow-hidden rounded-[48px]"
      onClick={event => event.stopPropagation()}
    >
      <PlayerConversationScene />

      <button
        type="button"
        onClick={onClose}
        aria-label="Zamknij rozmowę"
        className="absolute right-8 top-8 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-950/30 text-2xl font-light text-slate-300 transition-colors hover:border-cyan-200/40 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
      >
        ×
      </button>

      <div className="relative z-10 grid h-full grid-cols-[500px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col justify-between px-14 pb-12 pt-11">
          <div>
            <div className="flex items-center gap-3 text-[15px] font-semibold tracking-normal text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.75)]" />
              Indywidualna rozmowa
            </div>
            <p className="mt-2 text-sm font-normal tracking-normal text-cyan-100/55">Gabinet trenera</p>
          </div>

          <div className="mb-2 max-w-[330px]">
            <div className="mb-5 flex items-center gap-4">
              {clubLogoUrl ? (
                <img src={clubLogoUrl} alt="" className="h-16 w-16 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200/25 bg-emerald-300/10 text-xl font-semibold text-emerald-100">
                  {playerName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-[13px] font-normal text-cyan-100/55">{clubName}</p>
                <p className="mt-1 text-[20px] font-semibold leading-tight tracking-[-0.01em] text-white">{playerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm font-normal text-slate-300/70">
              <span>{positionLabel}</span>
              <span className="h-1 w-1 rounded-full bg-emerald-300/60" />
              <span>OVR {overall}</span>
              <span className="h-1 w-1 rounded-full bg-emerald-300/60" />
              <span>{moraleLabel}</span>
            </div>
            <p className="mt-5 text-sm font-normal leading-relaxed tracking-normal text-slate-300/60">
              Wybierz ton rozmowy odpowiedni do sytuacji zawodnika i relacji z trenerem.
            </p>
          </div>
        </aside>

        <main className="flex min-h-0 flex-col pb-11 pl-14 pr-16 pt-12">
          <header className="shrink-0 pr-16">
            <p className="text-sm font-medium tracking-normal text-emerald-300/80">Rozmowa w cztery oczy</p>
            <h2 className="mt-2 text-[42px] font-semibold leading-[1.12] tracking-[-0.025em] text-white">
              {result ? 'Reakcja zawodnika' : `Porozmawiaj z ${playerName}`}
            </h2>
          </header>

          {result ? (
            <section className="flex min-h-0 flex-1 flex-col justify-center pb-10">
              <div className="max-w-[980px]">
                <div className={`flex items-center gap-3 text-[13px] font-medium ${result.isPositive ? 'text-emerald-300' : 'text-rose-300'}`}>
                  <span className={`h-2 w-2 rounded-full ${result.isPositive ? 'bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.75)]' : 'bg-rose-300 shadow-[0_0_12px_rgba(253,164,175,0.72)]'}`} />
                  Odpowiedź zawodnika
                </div>
                <p className="mt-6 text-[34px] font-medium leading-[1.35] tracking-[-0.02em] text-slate-50">
                  „{result.reactionText}”
                </p>
                <div className="mt-10 flex items-center gap-4 border-t border-white/10 pt-5 text-sm font-normal text-slate-300/65">
                  <span>Wpływ na morale</span>
                  <span className={`text-lg font-semibold ${result.moraleDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {result.moraleDelta > 0 ? '+' : ''}{result.moraleDelta}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="group ml-auto mt-14 flex min-w-[300px] items-center justify-between border-b border-emerald-300/35 py-4 text-left text-[17px] font-medium text-slate-100 transition-colors hover:border-emerald-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
              >
                Zakończ rozmowę
                <span className="text-xl font-light text-emerald-300/75 transition-transform group-hover:translate-x-1">→</span>
              </button>
            </section>
          ) : (
            <section className="mt-8 flex min-h-0 flex-1 flex-col">
              {!canTalk && (
                <div className="mb-5 max-w-[1020px] border-l-2 border-amber-300/70 py-1 pl-5 text-[15px] font-normal leading-relaxed text-amber-100/80">
                  Kolejna rozmowa będzie możliwa {nextTalkLabel}.
                </div>
              )}

              <p className="shrink-0 text-[17px] font-normal leading-relaxed tracking-normal text-slate-300/70">
                Wybierz temat rozmowy
              </p>

              <div className="mt-3 grid min-h-0 flex-1 grid-cols-2 gap-x-10 overflow-y-auto pr-3 custom-scrollbar">
                {INDIVIDUAL_TALK_OPTIONS.map((option, optionIndex) => (
                  <button
                    key={option.type}
                    type="button"
                    disabled={!canTalk}
                    onClick={() => onSelect(option.type)}
                    className={`group relative flex min-h-[108px] items-center border-b border-white/10 py-4 text-left transition-colors duration-200 first:border-t focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300/60 ${
                      canTalk
                        ? 'hover:border-emerald-300/35'
                        : 'cursor-not-allowed opacity-35'
                    }`}
                  >
                    <span className="absolute inset-y-2 left-0 w-0 rounded-r-full bg-gradient-to-r from-emerald-400/10 to-transparent transition-[width] duration-300 group-hover:w-full" />
                    <span className="relative w-12 shrink-0 self-start pt-2 text-[13px] font-medium text-emerald-300/65">
                      {String(optionIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="relative pr-6">
                      <span className="block text-[17px] font-semibold leading-snug tracking-[-0.01em] text-slate-100 transition-colors group-hover:text-white">
                        {option.title}
                      </span>
                      <span className="mt-1.5 block text-[14px] font-normal leading-[1.4] tracking-normal text-slate-400/75">
                        {option.description}
                      </span>
                    </span>
                    <span className="relative ml-auto mr-2 text-xl font-light text-emerald-300/0 transition-all duration-200 group-hover:translate-x-1 group-hover:text-emerald-300/80">→</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  </div>
);
