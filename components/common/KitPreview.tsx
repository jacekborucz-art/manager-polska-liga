import React, { useId } from 'react';
import { ClubKitPattern } from '../../types';

export interface KitPreviewProps {
  shirt: string;
  shirtSecondary?: string;
  shorts: string;
  socks: string;
  pattern?: ClubKitPattern;
  className?: string;
  showShorts?: boolean;
  label?: string | number;
  labelColor?: string;
}

export const KitPreview: React.FC<KitPreviewProps> = ({
  shirt,
  shirtSecondary,
  shorts,
  socks,
  pattern = 'solid',
  className = 'h-20 w-20',
  showShorts = true,
  label,
  labelColor = '#ffffff',
}) => {
  const rawId = useId().replace(/:/g, '');
  const shirtClipId = `kit-shirt-${rawId}`;
  const stripeId = `kit-stripes-${rawId}`;
  const shirtPath = 'M18 6l7 5h8l7-5 12 8-4 12-7-2v23H17V24l-7 2-4-12L18 6z';
  const stripeColor = shirtSecondary ?? shorts;
  const stripePattern =
    pattern === 'horizontal_stripes'
      ? { width: 8, height: 10, path: <rect x="0" y="0" width="8" height="5" fill={stripeColor} fillOpacity="0.92" /> }
      : { width: 10, height: 8, path: <rect x="0" y="0" width="5" height="8" fill={stripeColor} fillOpacity="0.92" /> };

  return (
    <svg viewBox="0 0 58 64" className={`${className} drop-shadow-[0_10px_16px_rgba(0,0,0,0.5)]`}>
      <defs>
        <clipPath id={shirtClipId}>
          <path d={shirtPath} />
        </clipPath>
        {pattern !== 'solid' && (
          <pattern id={stripeId} patternUnits="userSpaceOnUse" width={stripePattern.width} height={stripePattern.height}>
            <rect width={stripePattern.width} height={stripePattern.height} fill={shirt} />
            {stripePattern.path}
          </pattern>
        )}
      </defs>
      <path d={shirtPath} fill={shirt} stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" />
      {pattern !== 'solid' && <rect x="6" y="6" width="46" height="41" fill={`url(#${stripeId})`} clipPath={`url(#${shirtClipId})`} />}
      <path d="M25 11l4 5 4-5" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" />
      {label !== undefined && (
        <text x="29" y="33" textAnchor="middle" fontSize="10" fontWeight="900" fontStyle="italic" fill={labelColor}>
          {label}
        </text>
      )}
      {showShorts && (
        <>
          <path d="M18 49h22l3 12H32l-3-7-3 7H15l3-12z" fill={shorts} stroke="rgba(255,255,255,0.24)" strokeWidth="1.4" />
          <path d="M17 61h9v3h-9v-3zm15 0h9v3h-9v-3z" fill={socks} />
        </>
      )}
    </svg>
  );
};
