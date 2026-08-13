import { useState } from 'react';
import {
  BriefingScenario,
  BriefingEffect,
  BriefingMatchStage,
  detectScenario,
  calculateBriefingEffect,
  getBriefingsForScenario,
  getSilenceEffect,
} from '../../services/PreMatchBriefingService';
import { RivalryService } from '../../services/RivalryService';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import type { LeagueMotivationContext } from '../../services/LeagueMotivationContextService';
import { getLeagueMotivationContextLabel } from '../../services/LeagueMotivationContextService';

interface PreMatchBriefingModalProps {
  isOpen: boolean;
  onClose: (effect: BriefingEffect) => void;
  userClubName: string;
  oppClubName: string;
  userRep: number;
  oppRep: number;
  sessionSeed: number;
  matchStage?: BriefingMatchStage;
  userClubColors?: string[];
  oppClubColors?: string[];
  userClubId?: string;
  oppClubId?: string;
  leagueMotivationContext?: LeagueMotivationContext | null;
}

type Phase = 'SELECTING' | 'REACTING';

interface BriefingSceneProps {
  userColor: string;
  opponentColor: string;
  scenarioColor: string;
}

/**
 * Full SVG locker-room scene matching the visual language of the press conference.
 * Dynamic copy and club crests remain HTML so names wrap correctly and logos stay crisp.
 */
export const LockerRoomBriefingScene = ({ userColor, opponentColor, scenarioColor }: BriefingSceneProps) => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 1660 920"
    preserveAspectRatio="xMidYMid slice"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="briefing-shell" x1="65" y1="15" x2="1510" y2="920" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0A2444" />
        <stop offset="0.43" stopColor="#08162D" />
        <stop offset="1" stopColor="#030815" />
      </linearGradient>
      <linearGradient id="briefing-room" x1="15" y1="65" x2="500" y2="900" gradientUnits="userSpaceOnUse">
        <stop stopColor="#153D67" />
        <stop offset="0.6" stopColor="#091A33" />
        <stop offset="1" stopColor="#040A16" />
      </linearGradient>
      <linearGradient id="briefing-accent" x1="420" y1="0" x2="520" y2="920" gradientUnits="userSpaceOnUse">
        <stop stopColor={scenarioColor} stopOpacity="0.9" />
        <stop offset="0.5" stopColor="#2563EB" stopOpacity="0.7" />
        <stop offset="1" stopColor="#22D3EE" stopOpacity="0.12" />
      </linearGradient>
      <linearGradient id="briefing-tunnel" x1="105" y1="360" x2="105" y2="785" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E3A5F" />
        <stop offset="1" stopColor="#030712" />
      </linearGradient>
      <linearGradient id="briefing-pitch-light" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#67E8F9" stopOpacity="0.23" />
        <stop offset="1" stopColor="#22C55E" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="briefing-main-glow" cx="0" cy="0" r="1" gradientTransform="translate(1100 470) rotate(90) scale(530 760)" gradientUnits="userSpaceOnUse">
        <stop stopColor={scenarioColor} stopOpacity="0.075" />
        <stop offset="1" stopColor={scenarioColor} stopOpacity="0" />
      </radialGradient>
      <pattern id="briefing-fine-dots" width="22" height="22" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#93C5FD" fillOpacity="0.08" />
      </pattern>
      <filter id="briefing-shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="28" stdDeviation="32" floodColor="#000000" floodOpacity="0.62" />
      </filter>
      <filter id="briefing-soft-blur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="20" />
      </filter>
      <clipPath id="briefing-clip">
        <rect x="2" y="2" width="1656" height="916" rx="48" />
      </clipPath>
    </defs>

    <g filter="url(#briefing-shadow)">
      <rect x="2" y="2" width="1656" height="916" rx="48" fill="url(#briefing-shell)" />
    </g>

    <g clipPath="url(#briefing-clip)">
      <rect width="1660" height="920" fill="url(#briefing-shell)" />
      <rect width="1660" height="920" fill="url(#briefing-fine-dots)" />
      <rect x="470" width="1190" height="920" fill="url(#briefing-main-glow)" />

      {/* Locker-room half of the composition. */}
      <path d="M0 0H510C482 186 491 325 532 454C570 573 556 738 478 920H0V0Z" fill="url(#briefing-room)" />
      <path d="M477 0C448 188 458 330 503 462C539 570 527 735 447 920H500C574 718 585 568 548 450C508 321 503 180 536 0H477Z" fill="url(#briefing-accent)" />
      <path d="M512 0C487 182 495 327 540 455C576 561 566 721 492 920" stroke="#A5F3FC" strokeOpacity="0.18" strokeWidth="2" />

      {/* Ceiling panels and match-day lighting. */}
      <path d="M0 64H1660" stroke="#94A3B8" strokeOpacity="0.18" strokeWidth="4" />
      <path d="M26 29h426M26 29l47 35M127 29l-47 35M204 29l47 35M328 29l-47 35M404 29l47 35" stroke="#64748B" strokeOpacity="0.22" strokeWidth="3" />
      <g fill="#E0F2FE" fillOpacity="0.7" stroke="#7DD3FC" strokeOpacity="0.28">
        <path d="M69 59h46l-7 22H76z" />
        <path d="M244 59h46l-7 22h-32z" />
        <path d="M397 59h46l-7 22h-32z" />
      </g>

      {/* Individual lockers, shirts and hangers. */}
      <g stroke="#93C5FD" strokeOpacity="0.22" strokeWidth="3">
        <path d="M28 126h132v442H28zM171 126h132v442H171zM314 126h132v442H314z" fill="#07172D" fillOpacity="0.72" />
        <path d="M28 188h132M171 188h132M314 188h132" />
      </g>
      <g stroke="#CBD5E1" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M94 208v24m0 0-43 24h86l-43-24Z" />
        <path d="M237 208v24m0 0-43 24h86l-43-24Z" />
        <path d="M380 208v24m0 0-43 24h86l-43-24Z" />
      </g>
      <g stroke="#E0F2FE" strokeOpacity="0.32" strokeWidth="3" strokeLinejoin="round">
        <path d="M58 259 81 244h26l23 15 21 11-13 42-17-7v114H67V305l-17 7-13-42 21-11Z" fill={userColor} fillOpacity="0.34" />
        <path d="M201 259 224 244h26l23 15 21 11-13 42-17-7v114h-54V305l-17 7-13-42 21-11Z" fill={userColor} fillOpacity="0.26" />
        <path d="M344 259 367 244h26l23 15 21 11-13 42-17-7v114h-54V305l-17 7-13-42 21-11Z" fill={opponentColor} fillOpacity="0.2" />
      </g>
      <g fill="#E0F2FE" fillOpacity="0.18">
        <circle cx="94" cy="344" r="25" />
        <circle cx="237" cy="344" r="25" />
        <circle cx="380" cy="344" r="25" />
      </g>

      {/* Coach's tactics board. */}
      <g transform="translate(242 588) rotate(-2)">
        <rect x="0" y="0" width="232" height="166" rx="12" fill="#081827" stroke="#BAE6FD" strokeOpacity="0.38" strokeWidth="5" />
        <rect x="10" y="10" width="212" height="146" rx="7" fill="#073A3C" fillOpacity="0.76" stroke="#67E8F9" strokeOpacity="0.24" strokeWidth="2" />

        {/* Full football-pitch markings: touchlines, halfway, boxes and goals. */}
        <g stroke="#CFFAFE" strokeOpacity="0.54" strokeWidth="2.2">
          <rect x="16" y="16" width="200" height="134" rx="2" />
          <path d="M116 16v134" />
          <circle cx="116" cy="83" r="25" />
          <circle cx="116" cy="83" r="2.5" fill="#CFFAFE" />

          <path d="M16 45h42v76H16M216 45h-42v76h42" />
          <path d="M16 62h19v42H16M216 62h-19v42h19" />
          <circle cx="69" cy="83" r="2.2" fill="#CFFAFE" />
          <circle cx="163" cy="83" r="2.2" fill="#CFFAFE" />
          <path d="M58 60a27 27 0 0 1 0 46M174 60a27 27 0 0 0 0 46" />

          <path d="M16 68H8v30h8M216 68h8v30h-8" />
          <path d="M16 26a10 10 0 0 0 10-10M206 16a10 10 0 0 0 10 10M16 140a10 10 0 0 1 10 10M206 150a10 10 0 0 1 10-10" />
        </g>

        {/* Two clearly separated tactical formations. */}
        <g fill="#FBBF24" stroke="#FDE68A" strokeOpacity="0.55" strokeWidth="1.5">
          <circle cx="27" cy="83" r="5" />
          <circle cx="57" cy="39" r="5" /><circle cx="57" cy="68" r="5" /><circle cx="57" cy="99" r="5" /><circle cx="57" cy="128" r="5" />
          <circle cx="88" cy="52" r="5" /><circle cx="84" cy="83" r="5" /><circle cx="88" cy="114" r="5" />
          <circle cx="105" cy="69" r="5" /><circle cx="105" cy="101" r="5" />
        </g>
        <g fill="#38BDF8" stroke="#BAE6FD" strokeOpacity="0.55" strokeWidth="1.5">
          <circle cx="205" cy="83" r="5" />
          <circle cx="175" cy="39" r="5" /><circle cx="175" cy="68" r="5" /><circle cx="175" cy="99" r="5" /><circle cx="175" cy="128" r="5" />
          <circle cx="144" cy="52" r="5" /><circle cx="148" cy="83" r="5" /><circle cx="144" cy="114" r="5" />
          <circle cx="127" cy="69" r="5" /><circle cx="127" cy="101" r="5" />
        </g>
        <circle cx="116" cy="83" r="3.5" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />

        <path d="M92 1h48" stroke="#E0F2FE" strokeOpacity="0.42" strokeWidth="5" strokeLinecap="round" />
        <path d="M22 160h188" stroke="#020617" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Bench, bottles and open tunnel to the pitch. */}
      <path d="M20 553H282V615H20z" fill="#0D2947" stroke="#7DD3FC" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M34 615v78M266 615v78M17 693h270" stroke="#64748B" strokeOpacity="0.55" strokeWidth="7" strokeLinecap="round" />
      <g fill="#67E8F9" fillOpacity="0.28" stroke="#BAE6FD" strokeOpacity="0.3">
        <path d="M65 525h16l4 28H61z" /><path d="M107 525h16l4 28h-24z" /><path d="M150 525h16l4 28h-24z" />
      </g>
      <path d="M0 706H170L205 920H0V706Z" fill="url(#briefing-tunnel)" />
      <path d="M0 771H149L173 920H0V771Z" fill="url(#briefing-pitch-light)" />
      <path d="M0 706h170M170 706l35 214" stroke="#7DD3FC" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M0 843h160M32 802l14 118M94 782l34 138" stroke="#86EFAC" strokeOpacity="0.12" strokeWidth="3" />

      {/* Subtle pitch and ball motifs behind the readable content. */}
      <g transform="translate(1190 490)" opacity="0.05" stroke="#38BDF8" strokeWidth="3">
        <rect x="-390" y="-206" width="780" height="412" rx="18" />
        <path d="M0-206V206" />
        <circle r="75" />
        <path d="M-390-101h116v202h-116M390-101H274v202h116" />
      </g>
      <g transform="translate(1470 760) rotate(-13)" opacity="0.05" stroke="#BAE6FD" strokeWidth="6">
        <circle r="184" />
        <path d="M0-184 107-149 171-57 171 57 107 149 0 184-107 149-171 57-171-57-107-149Z" />
        <path d="M0-70 66-21 41 56-41 56-66-21Z" fill="#BAE6FD" fillOpacity="0.15" />
        <path d="M0-70V-184M66-21l105-36M41 56l66 93M-41 56l-66 93M-66-21l-105-36" />
      </g>

      <ellipse cx="1115" cy="910" rx="490" ry="34" fill={scenarioColor} fillOpacity="0.09" filter="url(#briefing-soft-blur)" />
      <path d="M525 873H1560" stroke="#38BDF8" strokeOpacity="0.16" />
      <path d="M525 878H955" stroke={scenarioColor} strokeOpacity="0.58" strokeWidth="3" />
    </g>

    <rect x="2" y="2" width="1656" height="916" rx="48" stroke="#BFDBFE" strokeOpacity="0.14" strokeWidth="2" />
  </svg>
);

export const PreMatchBriefingModal = ({
  isOpen,
  onClose,
  userClubName,
  oppClubName,
  userRep,
  oppRep,
  sessionSeed,
  matchStage = 'LEAGUE',
  userClubColors = ['#1e293b'],
  oppClubColors = ['#1e293b'],
  userClubId,
  oppClubId,
  leagueMotivationContext = null,
}: PreMatchBriefingModalProps) => {
  const [phase, setPhase] = useState<Phase>('SELECTING');
  const [reactionText, setReactionText] = useState('');
  const [pendingEffect, setPendingEffect] = useState<BriefingEffect | null>(null);

  if (!isOpen) return null;

  const scenario: BriefingScenario = detectScenario(userRep, oppRep);
  const availableBriefings = getBriefingsForScenario(scenario, matchStage, leagueMotivationContext);
  const rivalryContext = RivalryService.getMatchContextByNames(userClubName, oppClubName);
  const leagueMotivationLabel = getLeagueMotivationContextLabel(leagueMotivationContext);
  const motivationLabel = leagueMotivationLabel ?? rivalryContext.label;
  const userLogo = userClubId ? getClubLogo(userClubId) : undefined;
  const opponentLogo = oppClubId ? getClubLogo(oppClubId) : undefined;
  const scenarioColor = scenario === 'UNDERDOG' ? '#F87171' : scenario === 'FAVORITE' ? '#34D399' : '#FBBF24';

  const handleSelect = (index: number) => {
    const speech = availableBriefings[index];
    if (!speech) return;

    const effect = calculateBriefingEffect(
      speech.hiddenType,
      scenario,
      sessionSeed,
      speech.originalIndex,
    );
    setReactionText(effect.reactionText);
    setPendingEffect(effect);
    setPhase('REACTING');
  };

  const handleSilence = () => {
    const effect = getSilenceEffect();
    setReactionText(effect.reactionText);
    setPendingEffect(effect);
    setPhase('REACTING');
  };

  const handleConfirm = () => {
    if (pendingEffect) onClose(pendingEffect);
  };

  const getScenarioLabel = (): string => {
    if (scenario === 'UNDERDOG') return 'Jesteś outsiderem';
    if (scenario === 'FAVORITE') return 'Jesteś faworytem';
    return 'Równorzędna walka';
  };

  const getMatchStageLabel = (): string => {
    if (matchStage === 'CUP_FINAL') return 'Finał pucharu';
    if (matchStage === 'CUP_SEMIFINAL') return 'Półfinał pucharu';
    if (matchStage === 'CUP') return 'Mecz pucharowy';
    if (matchStage === 'FRIENDLY') return 'Sparing';
    return 'Mecz o punkty';
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center overflow-hidden bg-[#010307]/90 p-7 backdrop-blur-xl animate-fade-in">
      <div className="relative h-[min(920px,calc(100vh-56px))] w-[min(1660px,calc(100vw-64px))] overflow-hidden rounded-[48px]">
        <LockerRoomBriefingScene
          userColor={userClubColors[0] ?? '#1e293b'}
          opponentColor={oppClubColors[0] ?? '#1e293b'}
          scenarioColor={scenarioColor}
        />

        <div className="relative z-10 grid h-full grid-cols-[500px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col justify-between px-14 pb-12 pt-11">
            <div>
              <div className="flex items-center gap-3 text-[15px] font-semibold tracking-normal text-cyan-100">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inset-0 rounded-full opacity-60 animate-ping" style={{ backgroundColor: scenarioColor }} />
                  <span className="relative m-[3px] h-1.5 w-1.5 rounded-full" style={{ backgroundColor: scenarioColor }} />
                </span>
                Odprawa przedmeczowa
              </div>
              <p className="mt-2 text-sm font-normal tracking-normal text-blue-200/60">{getMatchStageLabel()}</p>
            </div>

            <div className="mb-2 max-w-[320px]">
              {motivationLabel && (
                <p className="mb-3 text-sm font-medium leading-relaxed tracking-normal text-red-200/85">{motivationLabel}</p>
              )}
              <p className="text-[30px] font-semibold leading-tight tracking-[-0.02em] text-white">{getScenarioLabel()}</p>
              <p className="mt-4 text-sm font-normal leading-relaxed tracking-normal text-slate-300/65">
                Wybierz słowa, z którymi drużyna wyjdzie z szatni na boisko.
              </p>
            </div>
          </aside>

          <main className="flex min-h-0 flex-col pb-11 pl-14 pr-16 pt-10">
            <header className="shrink-0">
              <p className="text-sm font-medium tracking-normal text-cyan-300/80">Przed pierwszym gwizdkiem</p>
              <h1 className="mt-1 text-[38px] font-semibold leading-tight tracking-[-0.025em] text-white">Przemowa do drużyny</h1>

              <div className="mt-6 flex items-center border-b border-white/10 pb-6">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  {userLogo && <img src={userLogo} alt={`Herb ${userClubName}`} className="h-16 w-16 shrink-0 object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,0.5)]" />}
                  <span className="min-w-0 text-[27px] font-semibold leading-tight tracking-[-0.02em] text-white">{userClubName}</span>
                </div>

                <div className="mx-8 flex shrink-0 items-center gap-3 text-sm font-medium tracking-normal text-slate-500">
                  <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/20" />
                  kontra
                  <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/20" />
                </div>

                <div className="flex min-w-0 flex-1 items-center justify-end gap-4 text-right">
                  <span className="min-w-0 text-[27px] font-semibold leading-tight tracking-[-0.02em] text-white">{oppClubName}</span>
                  {opponentLogo && <img src={opponentLogo} alt={`Herb ${oppClubName}`} className="h-16 w-16 shrink-0 object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,0.5)]" />}
                </div>
              </div>
            </header>

            {phase === 'SELECTING' && (
              <section className="mt-4 flex min-h-0 flex-1 flex-col">
                <div className="grid min-h-0 flex-1 grid-cols-2 gap-x-9 overflow-y-auto pr-3 briefing-scrollbar">
                  {availableBriefings.map((speech, index) => (
                    <button
                      key={speech.id}
                      onClick={() => handleSelect(index)}
                      className="group relative flex min-h-[92px] items-center border-b border-white/10 py-4 text-left transition-colors duration-200 hover:border-cyan-300/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/60"
                    >
                      <span className="absolute inset-y-2 left-0 w-0 rounded-r-full bg-gradient-to-r from-cyan-400/12 to-transparent transition-[width] duration-300 group-hover:w-full" />
                      <span className="relative w-12 shrink-0 text-[13px] font-medium tracking-normal text-cyan-300/65 transition-colors group-hover:text-cyan-200">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="relative pr-7 text-[16px] font-medium leading-[1.42] tracking-normal text-slate-200 transition-colors group-hover:text-white">
                        {speech.text}
                      </span>
                      <span className="relative ml-auto text-lg font-light text-cyan-300/0 transition-all duration-200 group-hover:translate-x-1 group-hover:text-cyan-300/80">→</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSilence}
                  className="mt-3 flex h-11 shrink-0 items-center justify-center gap-3 text-sm font-normal tracking-normal text-slate-500 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                >
                  <span className="h-px w-14 bg-white/10" />
                  Bez komentarza
                  <span className="h-px w-14 bg-white/10" />
                </button>
              </section>
            )}

            {phase === 'REACTING' && pendingEffect && (
              <section className="flex min-h-0 flex-1 flex-col justify-center pb-8 pt-10">
                <p className="text-sm font-medium tracking-normal text-cyan-300/75">Reakcja szatni</p>
                <p className="mt-4 max-w-[940px] text-[31px] font-semibold leading-[1.34] tracking-[-0.018em] text-white">{reactionText}</p>

                <div className="mt-10 flex items-center gap-4 border-y border-white/10 py-5">
                  <span className="text-sm font-normal tracking-normal text-slate-500">Nastawienie zespołu</span>
                  <span className="text-lg font-semibold tracking-normal" style={{ color: scenarioColor }}>{pendingEffect.label}</span>
                </div>

                <button
                  onClick={handleConfirm}
                  className="group mt-9 flex w-full max-w-[430px] items-center border-b border-white/15 py-4 text-left text-[18px] font-semibold tracking-normal text-white transition-colors hover:border-cyan-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                >
                  Wyjdź z drużyną na boisko
                  <span className="ml-auto text-cyan-300 transition-transform group-hover:translate-x-1">→</span>
                </button>
              </section>
            )}
          </main>
        </div>
      </div>

      <style>{`
        .briefing-scrollbar::-webkit-scrollbar { width: 3px; }
        .briefing-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .briefing-scrollbar::-webkit-scrollbar-thumb { background: rgba(125, 211, 252, 0.18); border-radius: 10px; }
      `}</style>
    </div>
  );
};
