
import React from 'react';

interface StadiumSVGProps {
  capacity: number;
  primaryColor?: string;
}

interface TierConfig {
  mainH: number;
  oppH: number;
  northW: number;
  southW: number;
  hasCorners: boolean;
  hasLighting: boolean;
  hasUpperTierMain: boolean;
  hasUpperTierAll: boolean;
}

const TIERS: TierConfig[] = [
  { mainH: 22,  oppH: 12,  northW: 0,   southW: 0,   hasCorners: false, hasLighting: false, hasUpperTierMain: false, hasUpperTierAll: false },
  { mainH: 32,  oppH: 16,  northW: 16,  southW: 0,   hasCorners: false, hasLighting: false, hasUpperTierMain: false, hasUpperTierAll: false },
  { mainH: 44,  oppH: 20,  northW: 20,  southW: 20,  hasCorners: false, hasLighting: false, hasUpperTierMain: false, hasUpperTierAll: false },
  { mainH: 62,  oppH: 36,  northW: 36,  southW: 36,  hasCorners: true,  hasLighting: true,  hasUpperTierMain: false, hasUpperTierAll: false },
  { mainH: 80,  oppH: 54,  northW: 54,  southW: 54,  hasCorners: true,  hasLighting: true,  hasUpperTierMain: true,  hasUpperTierAll: false },
  { mainH: 96,  oppH: 70,  northW: 70,  southW: 70,  hasCorners: true,  hasLighting: true,  hasUpperTierMain: true,  hasUpperTierAll: true  },
  { mainH: 114, oppH: 88,  northW: 88,  southW: 88,  hasCorners: true,  hasLighting: true,  hasUpperTierMain: true,  hasUpperTierAll: true  },
  { mainH: 132, oppH: 106, northW: 106, southW: 106, hasCorners: true,  hasLighting: true,  hasUpperTierMain: true,  hasUpperTierAll: true  },
];

const getTierIndex = (capacity: number): number => {
  if (capacity <= 2000)  return 0;
  if (capacity <= 5000)  return 1;
  if (capacity <= 10000) return 2;
  if (capacity <= 20000) return 3;
  if (capacity <= 35000) return 4;
  if (capacity <= 49000) return 5;
  if (capacity <= 79000) return 6;
  return 7;
};

const PX = 152;
const PY = 138;
const PW = 256;
const PH = 136;
const DP = 8;

const RowLines: React.FC<{ x: number; y: number; w: number; h: number; vertical?: boolean; color?: string }> = ({
  x, y, w, h, vertical = false, color = '#0f172a',
}) => {
  const step = 5;
  const count = vertical ? Math.floor(w / step) : Math.floor(h / step);
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        if (vertical) {
          const lx = x + i * step + 3;
          return <line key={i} x1={lx} y1={y} x2={lx} y2={y + h} stroke={color} strokeWidth={0.7} />;
        }
        const ly = y + i * step + 3;
        return <line key={i} x1={x} y1={ly} x2={x + w} y2={ly} stroke={color} strokeWidth={0.7} />;
      })}
    </>
  );
};

export const StadiumSVG: React.FC<StadiumSVGProps> = ({ capacity, primaryColor = '#334155' }) => {
  const t = TIERS[getTierIndex(capacity)];
  const SC = primaryColor;
  const DARK = '#0c1322';
  const ROOF = '#475569';

  const mainY = PY + PH;
  const oppTop = PY - t.oppH;
  const northX = PX + PW;
  const southX = PX - t.southW;

  return (
    <svg viewBox="0 0 560 430" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#166534" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
      </defs>

      <rect width="560" height="430" fill="#070d18" />

      {/* MAIN STAND */}
      {t.mainH > 0 && (
        <g>
          <polygon
            points={`${PX + PW},${mainY} ${PX + PW + DP},${mainY - DP / 2} ${PX + PW + DP},${mainY + t.mainH - DP / 2} ${PX + PW},${mainY + t.mainH}`}
            fill={DARK}
          />
          <rect x={PX} y={mainY} width={PW} height={t.mainH} fill={SC} fillOpacity={0.3} />
          <RowLines x={PX} y={mainY} w={PW} h={t.mainH} />
          {t.hasUpperTierMain && (
            <rect x={PX} y={mainY} width={PW} height={Math.round(t.mainH * 0.38)} fill={SC} fillOpacity={0.18} />
          )}
          <rect x={PX} y={mainY} width={PW} height={3} fill={ROOF} />
          <rect x={PX} y={mainY + t.mainH} width={PW} height={5} fill={DARK} />
        </g>
      )}

      {/* OPPOSITE STAND */}
      {t.oppH > 0 && (
        <g>
          <polygon
            points={`${PX + PW},${oppTop} ${PX + PW + DP},${oppTop - DP / 2} ${PX + PW + DP},${oppTop + t.oppH - DP / 2} ${PX + PW},${oppTop + t.oppH}`}
            fill={DARK}
          />
          <rect x={PX} y={oppTop} width={PW} height={t.oppH} fill={SC} fillOpacity={0.2} />
          <RowLines x={PX} y={oppTop} w={PW} h={t.oppH} />
          {t.hasUpperTierAll && (
            <rect x={PX} y={oppTop + Math.round(t.oppH * 0.62)} width={PW} height={Math.round(t.oppH * 0.38)} fill={SC} fillOpacity={0.15} />
          )}
          <rect x={PX} y={oppTop + t.oppH - 3} width={PW} height={3} fill={ROOF} />
          <rect x={PX} y={oppTop} width={PW} height={5} fill={DARK} />
        </g>
      )}

      {/* NORTH END (right) */}
      {t.northW > 0 && (
        <g>
          <polygon
            points={`${northX},${PY} ${northX + DP},${PY - DP / 2} ${northX + t.northW + DP},${PY - DP / 2} ${northX + t.northW},${PY}`}
            fill={DARK}
          />
          <rect x={northX} y={PY} width={t.northW} height={PH} fill={SC} fillOpacity={0.22} />
          <RowLines x={northX} y={PY} w={t.northW} h={PH} vertical />
          {t.hasUpperTierAll && (
            <rect x={northX} y={PY} width={Math.round(t.northW * 0.38)} height={PH} fill={SC} fillOpacity={0.15} />
          )}
          <rect x={northX} y={PY} width={3} height={PH} fill={ROOF} />
          <rect x={northX + t.northW} y={PY} width={5} height={PH} fill={DARK} />
        </g>
      )}

      {/* SOUTH END (left) */}
      {t.southW > 0 && (
        <g>
          <polygon
            points={`${southX},${PY} ${southX + DP},${PY - DP / 2} ${PX + DP},${PY - DP / 2} ${PX},${PY}`}
            fill={DARK}
          />
          <rect x={southX} y={PY} width={t.southW} height={PH} fill={SC} fillOpacity={0.22} />
          <RowLines x={southX} y={PY} w={t.southW} h={PH} vertical />
          {t.hasUpperTierAll && (
            <rect x={PX - Math.round(t.southW * 0.38)} y={PY} width={Math.round(t.southW * 0.38)} height={PH} fill={SC} fillOpacity={0.15} />
          )}
          <rect x={PX - 3} y={PY} width={3} height={PH} fill={ROOF} />
          <rect x={southX} y={PY} width={5} height={PH} fill={DARK} />
        </g>
      )}

      {/* CORNER PIECES */}
      {t.hasCorners && t.southW > 0 && t.northW > 0 && (
        <g>
          <rect x={southX} y={oppTop} width={t.southW} height={t.oppH} fill={SC} fillOpacity={0.12} />
          <rect x={northX} y={oppTop} width={t.northW} height={t.oppH} fill={SC} fillOpacity={0.12} />
          <rect x={southX} y={mainY} width={t.southW} height={t.mainH} fill={SC} fillOpacity={0.12} />
          <rect x={northX} y={mainY} width={t.northW} height={t.mainH} fill={SC} fillOpacity={0.12} />
        </g>
      )}

      {/* PITCH */}
      <rect x={PX} y={PY} width={PW} height={PH} fill="url(#pitchGrad)" />
      <rect x={PX + 8} y={PY + 8} width={PW - 16} height={PH - 16} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={0.9} />
      <line x1={PX} y1={PY + PH / 2} x2={PX + PW} y2={PY + PH / 2} stroke="rgba(255,255,255,0.5)" strokeWidth={0.9} />
      <circle cx={PX + PW / 2} cy={PY + PH / 2} r={26} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={0.9} />
      <circle cx={PX + PW / 2} cy={PY + PH / 2} r={2} fill="rgba(255,255,255,0.65)" />
      <rect x={PX + PW / 2 - 38} y={PY + 8} width={76} height={26} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={0.9} />
      <rect x={PX + PW / 2 - 38} y={PY + PH - 34} width={76} height={26} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={0.9} />
      <rect x={PX + PW / 2 - 14} y={PY - 1} width={28} height={5} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={1} />
      <rect x={PX + PW / 2 - 14} y={PY + PH - 4} width={28} height={5} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={1} />

      {/* LIGHTING TOWERS */}
      {t.hasLighting && t.southW > 0 && t.northW > 0 && (
        <g>
          {([
            [southX - 16, oppTop - 16],
            [northX + t.northW + 6, oppTop - 16],
            [southX - 16, mainY + t.mainH + 6],
            [northX + t.northW + 6, mainY + t.mainH + 6],
          ] as [number, number][]).map(([lx, ly], i) => (
            <g key={i}>
              <rect x={lx} y={ly} width={10} height={10} rx={1} fill="#fbbf24" fillOpacity={0.45} />
              <rect x={lx + 2} y={ly + 2} width={6} height={6} rx={0.5} fill="#fef08a" fillOpacity={0.7} />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
};
