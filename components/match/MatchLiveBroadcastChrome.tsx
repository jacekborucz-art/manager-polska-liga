import { MatchEventType } from '../../types';

type KitSide = {
  primary: string;
  text: string;
};

const hexToRgba = (hex: string, alpha: number) => {
  try {
    const h = (hex || '#000000').replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return `rgba(15, 23, 42, ${alpha})`;
  }
};

export const PitchBroadcastOverlay = ({
  homeColor,
  awayColor,
  activeSide,
  eventType,
}: {
  homeColor: string;
  awayColor: string;
  activeSide?: 'HOME' | 'AWAY';
  eventType?: MatchEventType;
}) => {
  const activeColor = activeSide === 'AWAY' ? awayColor : activeSide === 'HOME' ? homeColor : '#ffffff';
  const isMajorEvent =
    eventType === MatchEventType.GOAL ||
    eventType === MatchEventType.SHOT_ON_TARGET ||
    eventType === MatchEventType.PENALTY_SCORED;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="absolute inset-0 w-full h-full live-pitch-svg" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden>
        <defs>
          <filter id="live-pitch-glow-shared">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#live-pitch-glow-shared)" opacity={activeSide ? 1 : 0.2}>
          <path
            d={
              activeSide === 'AWAY'
                ? 'M 50 20 C 70 34, 72 54, 55 72 S 31 104, 50 132'
                : 'M 50 130 C 30 116, 28 96, 45 78 S 69 46, 50 18'
            }
            fill="none"
            stroke={activeColor}
            strokeWidth={isMajorEvent ? 1.7 : 1.1}
            strokeLinecap="round"
            strokeDasharray="4 5"
            className="live-action-path"
          />
          <circle
            cx="50"
            cy={activeSide === 'AWAY' ? 20 : 130}
            r={isMajorEvent ? 3.3 : 2.4}
            fill={activeColor}
            className="live-action-dot"
          />
        </g>
      </svg>
    </div>
  );
};

export const BroadcastMomentumBar = ({
  momentum,
  homeKit,
  awayKit,
}: {
  momentum: number;
  homeKit: KitSide;
  awayKit: KitSide;
}) => {
  const homeWidth = 50 + momentum / 2;
  const awayWidth = 50 - momentum / 2;

  return (
    <div
      className={`group/momentum relative h-8 w-full overflow-hidden rounded-full border border-white/15 bg-black/45 p-1 shadow-[0_18px_45px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl transition-all duration-200 shrink-0 ${
        Math.abs(momentum) > 85 ? 'animate-shake' : ''
      }`}
    >
      <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-70" viewBox="0 0 1000 32" preserveAspectRatio="none" aria-hidden>
        <path
          d="M 0 24 C 96 8, 174 28, 270 12 S 468 24, 572 10 S 764 8, 1000 22"
          fill="none"
          stroke={homeKit.primary}
          strokeOpacity="0.62"
          strokeWidth="1.2"
          strokeLinecap="round"
          className="live-momentum-signal"
        />
        <path
          d="M 1000 9 C 872 26, 762 7, 650 20 S 428 24, 316 10 S 110 7, 0 20"
          fill="none"
          stroke={awayKit.primary}
          strokeOpacity="0.62"
          strokeWidth="1.2"
          strokeLinecap="round"
          className="live-momentum-signal live-momentum-signal-alt"
        />
        <rect x="-110" y="0" width="70" height="32" fill="#ffffff" opacity="0.10" className="live-momentum-scan" />
      </svg>
      <div className="relative z-10 flex h-full overflow-hidden rounded-full bg-white/[0.03]">
        <div
          className="relative flex h-full items-center justify-end overflow-hidden rounded-l-full pr-4 text-[9px] font-black italic uppercase tracking-tighter transition-all duration-300 shadow-[inset_-10px_0_20px_rgba(0,0,0,0.35)]"
          style={{
            backgroundColor: homeKit.primary,
            width: `${homeWidth}%`,
            color: homeKit.text,
            boxShadow: momentum > 75 ? `0 0 28px ${hexToRgba(homeKit.primary, 0.75)}, inset -10px 0 20px rgba(0,0,0,0.35)` : undefined,
          }}
        >
          <div className="absolute inset-0 opacity-35 live-momentum-fill" />
          <span className="relative z-10">{Math.round(homeWidth)}%</span>
        </div>
        <div
          className="relative flex h-full flex-1 items-center justify-start overflow-hidden rounded-r-full pl-4 text-[9px] font-black italic uppercase tracking-tighter transition-all duration-300 shadow-[inset_10px_0_20px_rgba(0,0,0,0.35)]"
          style={{
            backgroundColor: awayKit.primary,
            color: awayKit.text,
            boxShadow: momentum < -75 ? `0 0 28px ${hexToRgba(awayKit.primary, 0.75)}, inset 10px 0 20px rgba(0,0,0,0.35)` : undefined,
          }}
        >
          <div className="absolute inset-0 opacity-35 live-momentum-fill live-momentum-fill-alt" />
          <span className="relative z-10">{Math.round(awayWidth)}%</span>
        </div>
      </div>
    </div>
  );
};

export const MatchLiveBroadcastStyles = () => (
  <style>{`
    @keyframes live-action-dash { to { stroke-dashoffset: -36; } }
    @keyframes live-action-dot { 0%, 100% { transform: scale(1); opacity: 0.75; } 50% { transform: scale(1.35); opacity: 1; } }
    @keyframes live-signal-flow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -64; } }
    @keyframes live-panel-sweep { from { transform: translateX(-130%); } to { transform: translateX(520%); } }
    @keyframes live-momentum-fill { from { background-position: 0 0; } to { background-position: 42px 0; } }

    .live-action-path { animation: live-action-dash 2.2s linear infinite; }
    .live-action-dot { transform-box: fill-box; transform-origin: center; animation: live-action-dot 1.4s ease-in-out infinite; }
    .live-header-signal, .live-tactics-wave, .live-squad-signal, .live-momentum-signal {
      stroke-dasharray: 14 18;
      animation: live-signal-flow 6s linear infinite;
    }
    .live-momentum-signal { stroke-dasharray: 18 18; animation-duration: 5.4s; }
    .live-momentum-signal-alt { animation-direction: reverse; animation-duration: 6.2s; }
    .live-panel-scan, .live-momentum-scan { animation: live-panel-sweep 4.5s ease-in-out infinite; }
    .live-momentum-fill {
      background-image: repeating-linear-gradient(115deg, rgba(255,255,255,0.18) 0 2px, transparent 2px 14px);
      animation: live-momentum-fill 1.9s linear infinite;
    }
    .live-momentum-fill-alt { animation-direction: reverse; }

    @media (prefers-reduced-motion: reduce) {
      .live-action-path,
      .live-action-dot,
      .live-header-signal,
      .live-tactics-wave,
      .live-squad-signal,
      .live-panel-scan,
      .live-momentum-signal,
      .live-momentum-scan,
      .live-momentum-fill {
        animation: none !important;
      }
    }
  `}</style>
);
