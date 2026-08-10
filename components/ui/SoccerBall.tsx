import React, { useId } from 'react';

type SoccerBallProps = {
  className?: string;
};

export const SoccerBall: React.FC<SoccerBallProps> = ({
  className = 'w-12 h-12 drop-shadow-[0_6px_12px_rgba(0,0,0,0.55)]',
}) => {
  const assetId = useId().replace(/:/g, '');
  const gradientId = `soccerBallShine-${assetId}`;
  const clipId = `soccerBallClip-${assetId}`;

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="47" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="47" fill={`url(#${gradientId})`} stroke="#0f172a" strokeWidth="2.5" />
      <g clipPath={`url(#${clipId})`}>
        <polygon points="50,32.5 66.6,44.6 60.3,64.2 39.7,64.2 33.4,44.6" fill="#0f172a" />
        <g stroke="#0f172a" strokeWidth="2.5" fill="none">
          <path d="M50 32.5 L50 3" />
          <path d="M66.6 44.6 L94.7 35.5" />
          <path d="M60.3 64.2 L77.6 88" />
          <path d="M39.7 64.2 L22.4 88" />
          <path d="M33.4 44.6 L5.3 35.5" />
        </g>
        <polygon points="50,11 37.6,2 42.4,-12.5 57.6,-12.5 62.4,2" fill="#0f172a" />
        <polygon points="87.1,37.9 91.9,23.4 107.1,23.4 111.9,37.9 99.5,46.9" fill="#0f172a" />
        <polygon points="73,81.6 88.2,81.6 93,96.1 80.6,105.1 68.2,96.1" fill="#0f172a" />
        <polygon points="27,81.6 31.8,96.1 19.4,105.1 7,96.1 11.8,81.6" fill="#0f172a" />
        <polygon points="12.9,37.9 0.5,46.9 -11.9,37.9 -7.1,23.4 8.1,23.4" fill="#0f172a" />
        <ellipse cx="36" cy="26" rx="11" ry="6" fill="#ffffff" opacity="0.3" />
      </g>
    </svg>
  );
};
