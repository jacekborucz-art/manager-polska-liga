
import React from 'react';

interface StadiumSVGProps {
  capacity: number;
  primaryColor?: string;
}

interface TierConfig {
  mainH: number;
  oppH: number;
  sideW: number;
  hasCorners: boolean;
  hasLighting: boolean;
  hasUpperTierMain: boolean;
  hasUpperTierAll: boolean;
}

const TIERS: TierConfig[] = [
  { mainH: 46,  oppH: 0,   sideW: 0,   hasCorners: false, hasLighting: false, hasUpperTierMain: false, hasUpperTierAll: false },
  { mainH: 62,  oppH: 30,  sideW: 0,   hasCorners: false, hasLighting: false, hasUpperTierMain: false, hasUpperTierAll: false },
  { mainH: 78,  oppH: 46,  sideW: 40,  hasCorners: false, hasLighting: false, hasUpperTierMain: false, hasUpperTierAll: false },
  { mainH: 94,  oppH: 60,  sideW: 56,  hasCorners: true,  hasLighting: true,  hasUpperTierMain: false, hasUpperTierAll: false },
  { mainH: 110, oppH: 72,  sideW: 68,  hasCorners: true,  hasLighting: true,  hasUpperTierMain: true,  hasUpperTierAll: false },
  { mainH: 122, oppH: 82,  sideW: 78,  hasCorners: true,  hasLighting: true,  hasUpperTierMain: true,  hasUpperTierAll: true  },
  { mainH: 134, oppH: 92,  sideW: 86,  hasCorners: true,  hasLighting: true,  hasUpperTierMain: true,  hasUpperTierAll: true  },
  { mainH: 144, oppH: 100, sideW: 94,  hasCorners: true,  hasLighting: true,  hasUpperTierMain: true,  hasUpperTierAll: true  },
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

// Koordynaty boiska — perspektywa agresywna
const NY   = 246;   // Near Y (dół, przy głównej trybuniecie)
const FY   = 143;   // Far Y  (góra, przy trybunie naprzeciwko)
const NLX  = 120;   // Near Left X
const NRX  = 440;   // Near Right X   → nearW = 320
const FLX  = 190;   // Far Left X
const FRX  = 370;   // Far Right X    → farW  = 180
const NEAR_W  = NRX - NLX;   // 320
const FAR_W   = FRX - FLX;   // 180
const FAR_SC  = FAR_W / NEAR_W;      // ≈ 0.5625
const SIDE_DROP = 0.20;               // pochylenie boczne (Y na jednostkę X)
const ROOF_D    = 14;                 // głębokość pasa dachu trybuny głównej
const ROOF_DF   = Math.round(ROOF_D * FAR_SC);

const C_DARK   = '#152d45';
const C_SHADOW = '#07101e';
const C_ROOF   = '#4d7da0';
const C_ROOF_F = '#3d6480';
const C_SIDE_T = '#182e44';
const C_WALL   = '#172a3e';
const C_WALL2  = '#0f2035';

const lerp = (a: number, b: number, v: number) => a + (b - a) * v;
const pts  = (arr: [number, number][]) => arr.map(([x, y]) => `${x},${y}`).join(' ');

export const StadiumSVG: React.FC<StadiumSVGProps> = ({ capacity, primaryColor = '#336699' }) => {
  const t      = TIERS[getTierIndex(capacity)];
  const oppScH = Math.round(t.oppH * FAR_SC);
  const wallH  = ROOF_D + t.mainH;

  // Zewnętrzne punkty bocznych trybun
  const rOutNX = NRX + t.sideW;
  const rOutNY = NY  + Math.round(t.sideW * SIDE_DROP);
  const rOutFX = FRX + Math.round(t.sideW * FAR_SC);
  const rOutFY = FY  + Math.round(t.sideW * SIDE_DROP * FAR_SC);
  const lOutNX = NLX - t.sideW;
  const lOutNY = NY  + Math.round(t.sideW * SIDE_DROP);
  const lOutFX = FLX - Math.round(t.sideW * FAR_SC);
  const lOutFY = FY  + Math.round(t.sideW * SIDE_DROP * FAR_SC);

  // Perspektywiczne rzutowanie boiska: gx∈[0,1] lewo→prawo, gy∈[0,1] daleko→blisko
  const pt = (gx: number, gy: number) => ({
    x: lerp(lerp(FLX, NLX, gy), lerp(FRX, NRX, gy), gx),
    y: lerp(FY, NY, gy),
  });
  const ps = (gx: number, gy: number) => { const r = pt(gx, gy); return `${r.x},${r.y}`; };

  // Linie rzędów — horyzontalne (na przedniej ścianie)
  const HRows = ({ x, y, w, h, step = 7 }: { x: number; y: number; w: number; h: number; step?: number }) => (
    <>
      {Array.from({ length: Math.floor((h - 4) / step) }, (_, i) => {
        const ly = y + i * step + 5;
        return <line key={i} x1={x} y1={ly} x2={x + w} y2={ly} stroke="rgba(0,0,0,0.22)" strokeWidth={1} />;
      })}
    </>
  );

  // Linie rzędów — perspektywiczne (na powierzchni bocznej trybuny)
  const SRows = ({ x1i, y1i, x1o, y1o, x2i, y2i, x2o, y2o, n }: {
    x1i: number; y1i: number; x1o: number; y1o: number;
    x2i: number; y2i: number; x2o: number; y2o: number; n: number;
  }) => (
    <>
      {Array.from({ length: n }, (_, i) => {
        const v = (i + 0.5) / n;
        return <line key={i}
          x1={lerp(x1i, x1o, v)} y1={lerp(y1i, y1o, v)}
          x2={lerp(x2i, x2o, v)} y2={lerp(y2i, y2o, v)}
          stroke="rgba(0,0,0,0.18)" strokeWidth={0.8} />;
      })}
    </>
  );

  // Linie rzędów — na bocznej ścianie czołowej (lekko skośne)
  const WallRows = ({ x1: ax, y1: ay, x2: bx, y2: by, h, step = 8 }: {
    x1: number; y1: number; x2: number; y2: number; h: number; step?: number;
  }) => (
    <>
      {Array.from({ length: Math.floor((h - 4) / step) }, (_, i) => {
        const d = i * step + 5;
        return <line key={i} x1={ax} y1={ay + d} x2={bx} y2={by + d}
          stroke="rgba(0,0,0,0.18)" strokeWidth={0.8} />;
      })}
    </>
  );

  return (
    <svg viewBox="0 0 560 430" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="bgG"   x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#06111e" />
          <stop offset="100%" stopColor="#020c18" />
        </linearGradient>
        <linearGradient id="pitG"  x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#16592a" />
          <stop offset="100%" stopColor="#1c7236" />
        </linearGradient>
        <linearGradient id="mFG"   x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#284f6e" />
          <stop offset="100%" stopColor="#1a3550" />
        </linearGradient>
        <linearGradient id="oFG"   x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1e3d5c" />
          <stop offset="100%" stopColor="#243f5a" />
        </linearGradient>
      </defs>

      {/* Tło */}
      <rect width="560" height="430" fill="url(#bgG)" />

      {/* ── TRYBUNA NAPRZECIWKO (góra, far) ─────────────────────────── */}
      {t.oppH > 0 && (
        <g>
          <rect x={FLX} y={FY - oppScH - 5} width={FAR_W} height={5} fill={C_SHADOW} />
          <rect x={FLX} y={FY - oppScH} width={FAR_W} height={oppScH} fill="url(#oFG)" />
          <rect x={FLX} y={FY - oppScH} width={FAR_W} height={oppScH} fill={primaryColor} fillOpacity={0.28} />
          <HRows x={FLX} y={FY - oppScH} w={FAR_W} h={oppScH} step={6} />
          {t.hasUpperTierAll && (
            <>
              <rect x={FLX} y={FY - oppScH} width={FAR_W} height={Math.round(oppScH * 0.40)} fill={C_DARK} />
              <rect x={FLX} y={FY - oppScH} width={FAR_W} height={Math.round(oppScH * 0.40)} fill={primaryColor} fillOpacity={0.16} />
              <HRows x={FLX} y={FY - oppScH} w={FAR_W} h={Math.round(oppScH * 0.40)} step={6} />
              <rect x={FLX} y={FY - oppScH + Math.round(oppScH * 0.40) - 2} width={FAR_W} height={3} fill={C_ROOF_F} />
            </>
          )}
          <rect x={FLX} y={FY - ROOF_DF} width={FAR_W} height={ROOF_DF} fill={C_ROOF_F} />
        </g>
      )}

      {/* ── TRYBUNY BOCZNE — surface top ───────────────────────────── */}
      {t.sideW > 0 && (
        <g>
          {/* Prawa */}
          <polygon points={pts([[NRX,NY],[rOutNX,rOutNY],[rOutFX,rOutFY],[FRX,FY]])} fill={C_SIDE_T} />
          <polygon points={pts([[NRX,NY],[rOutNX,rOutNY],[rOutFX,rOutFY],[FRX,FY]])} fill={primaryColor} fillOpacity={0.22} />
          <SRows x1i={NRX} y1i={NY} x1o={rOutNX} y1o={rOutNY}
                 x2i={FRX}  y2i={FY}  x2o={rOutFX} y2o={rOutFY}
                 n={Math.max(2, Math.floor(t.sideW / 9))} />
          {/* Lewa */}
          <polygon points={pts([[NLX,NY],[lOutNX,lOutNY],[lOutFX,lOutFY],[FLX,FY]])} fill={C_SIDE_T} />
          <polygon points={pts([[NLX,NY],[lOutNX,lOutNY],[lOutFX,lOutFY],[FLX,FY]])} fill={primaryColor} fillOpacity={0.22} />
          <SRows x1i={NLX} y1i={NY} x1o={lOutNX} y1o={lOutNY}
                 x2i={FLX}  y2i={FY}  x2o={lOutFX} y2o={lOutFY}
                 n={Math.max(2, Math.floor(t.sideW / 9))} />
        </g>
      )}

      {/* ── NAROŻNIKI far (łączą trybuny boczne z trybuną naprzeciwko) */}
      {t.hasCorners && t.sideW > 0 && t.oppH > 0 && (
        <g>
          <polygon
            points={pts([[FRX,FY],[rOutFX,rOutFY],[rOutFX,rOutFY-oppScH],[FRX,FY-oppScH]])}
            fill={C_SIDE_T} fillOpacity={0.80}
          />
          <polygon
            points={pts([[FLX,FY],[lOutFX,lOutFY],[lOutFX,lOutFY-oppScH],[FLX,FY-oppScH]])}
            fill={C_SIDE_T} fillOpacity={0.80}
          />
        </g>
      )}

      {/* ── BOISKO ─────────────────────────────────────────────────── */}
      <polygon points={pts([[NLX-2,NY+2],[NRX+2,NY+2],[FRX+2,FY-2],[FLX-2,FY-2]])} fill="#0c3a18" />
      <polygon points={pts([[NLX,NY],[NRX,NY],[FRX,FY],[FLX,FY]])} fill="url(#pitG)" />

      {/* ── LINIE BOISKA (perspektywa) ─────────────────────────────── */}
      {(() => {
        const P  = 0.050;
        const PAW1 = 0.27, PAW2 = 0.73, PAH = 0.20;
        const GAW1 = 0.39, GAW2 = 0.61, GAH = 0.072;
        const c  = pt(0.5, 0.5);
        const rx = (pt(0.58, 0.5).x - pt(0.42, 0.5).x) / 2;
        const ry = (pt(0.5, 0.58).y - pt(0.5, 0.42).y) / 2;
        const s1 = pt(0.5, 0.17), s2 = pt(0.5, 0.83);
        const GW = 0.115;
        const g1a = pt(0.5 - GW/2, 0), g1b = pt(0.5 + GW/2, 0);
        const g2a = pt(0.5 - GW/2, 1), g2b = pt(0.5 + GW/2, 1);
        const GD = 5;
        return (
          <g>
            <polygon points={`${ps(P,P)} ${ps(1-P,P)} ${ps(1-P,1-P)} ${ps(P,1-P)}`}
              fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth={1} />
            <line x1={pt(0,0.5).x} y1={pt(0,0.5).y} x2={pt(1,0.5).x} y2={pt(1,0.5).y}
              stroke="rgba(255,255,255,0.62)" strokeWidth={1} />
            <ellipse cx={c.x} cy={c.y} rx={rx} ry={ry}
              fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth={1} />
            <circle cx={c.x} cy={c.y} r={2.5} fill="rgba(255,255,255,0.78)" />
            <polygon points={`${ps(PAW1,0)} ${ps(PAW2,0)} ${ps(PAW2,PAH)} ${ps(PAW1,PAH)}`}
              fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth={1} />
            <polygon points={`${ps(PAW1,1-PAH)} ${ps(PAW2,1-PAH)} ${ps(PAW2,1)} ${ps(PAW1,1)}`}
              fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth={1} />
            <polygon points={`${ps(GAW1,0)} ${ps(GAW2,0)} ${ps(GAW2,GAH)} ${ps(GAW1,GAH)}`}
              fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth={1} />
            <polygon points={`${ps(GAW1,1-GAH)} ${ps(GAW2,1-GAH)} ${ps(GAW2,1)} ${ps(GAW1,1)}`}
              fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth={1} />
            <circle cx={s1.x} cy={s1.y} r={2} fill="rgba(255,255,255,0.72)" />
            <circle cx={s2.x} cy={s2.y} r={2} fill="rgba(255,255,255,0.72)" />
            <polygon
              points={`${g1a.x},${g1a.y} ${g1b.x},${g1b.y} ${g1b.x},${g1b.y - GD} ${g1a.x},${g1a.y - GD}`}
              fill="none" stroke="rgba(255,255,255,0.82)" strokeWidth={1.2} />
            <polygon
              points={`${g2a.x},${g2a.y} ${g2b.x},${g2b.y} ${g2b.x},${g2b.y + GD} ${g2a.x},${g2a.y + GD}`}
              fill="none" stroke="rgba(255,255,255,0.82)" strokeWidth={1.2} />
          </g>
        );
      })()}

      {/* ── ŚCIANY CZOŁOWE TRYBUN BOCZNYCH (kluczowe dla efektu 3D) ── */}
      {t.sideW > 0 && (
        <g>
          {/* Prawa — ściana czołowa */}
          <polygon points={pts([[NRX,NY],[rOutNX,rOutNY],[rOutNX,rOutNY+wallH],[NRX,NY+wallH]])} fill={C_WALL} />
          <polygon points={pts([[NRX,NY],[rOutNX,rOutNY],[rOutNX,rOutNY+wallH],[NRX,NY+wallH]])} fill={primaryColor} fillOpacity={0.18} />
          <WallRows x1={NRX} y1={NY} x2={rOutNX} y2={rOutNY} h={wallH} />
          <line x1={NRX} y1={NY} x2={rOutNX} y2={rOutNY} stroke={C_ROOF} strokeWidth={2.5} />
          {/* Outer edge shadow */}
          <line x1={rOutNX} y1={rOutNY} x2={rOutNX} y2={rOutNY + wallH} stroke={C_SHADOW} strokeWidth={3} />

          {/* Lewa — ściana czołowa */}
          <polygon points={pts([[NLX,NY],[lOutNX,lOutNY],[lOutNX,lOutNY+wallH],[NLX,NY+wallH]])} fill={C_WALL} />
          <polygon points={pts([[NLX,NY],[lOutNX,lOutNY],[lOutNX,lOutNY+wallH],[NLX,NY+wallH]])} fill={primaryColor} fillOpacity={0.18} />
          <WallRows x1={NLX} y1={NY} x2={lOutNX} y2={lOutNY} h={wallH} />
          <line x1={NLX} y1={NY} x2={lOutNX} y2={lOutNY} stroke={C_ROOF} strokeWidth={2.5} />
          <line x1={lOutNX} y1={lOutNY} x2={lOutNX} y2={lOutNY + wallH} stroke={C_SHADOW} strokeWidth={3} />
        </g>
      )}

      {/* ── NAROŻNIKI near (między trybuną główną a boczną) ─────────── */}
      {t.hasCorners && t.sideW > 0 && (
        <g>
          <polygon
            points={pts([[NRX,NY+ROOF_D],[rOutNX,rOutNY+ROOF_D],[rOutNX,rOutNY+wallH],[NRX,NY+wallH]])}
            fill={C_WALL2} fillOpacity={0.85}
          />
          <polygon
            points={pts([[NLX,NY+ROOF_D],[lOutNX,lOutNY+ROOF_D],[lOutNX,lOutNY+wallH],[NLX,NY+wallH]])}
            fill={C_WALL2} fillOpacity={0.85}
          />
        </g>
      )}

      {/* ── GŁÓWNA TRYBUNA (dół, near) — dominujący element widoku ─── */}
      {t.mainH > 0 && (
        <g>
          {/* Dach — widoczna górna powierzchnia */}
          <rect x={NLX} y={NY} width={NEAR_W} height={ROOF_D} fill={C_ROOF} />
          {/* Gradient świetlny na dachu */}
          <rect x={NLX} y={NY} width={NEAR_W} height={Math.round(ROOF_D * 0.45)} fill="rgba(255,255,255,0.07)" />

          {/* Górny tier */}
          {t.hasUpperTierMain && (
            <>
              <rect x={NLX} y={NY + ROOF_D} width={NEAR_W} height={Math.round(t.mainH * 0.38)} fill={C_DARK} />
              <rect x={NLX} y={NY + ROOF_D} width={NEAR_W} height={Math.round(t.mainH * 0.38)} fill={primaryColor} fillOpacity={0.24} />
              <HRows x={NLX} y={NY + ROOF_D} w={NEAR_W} h={Math.round(t.mainH * 0.38)} />
              <rect x={NLX} y={NY + ROOF_D + Math.round(t.mainH * 0.38) - 2} width={NEAR_W} height={3} fill={C_ROOF} />
            </>
          )}

          {/* Dolny (główny) tier */}
          {(() => {
            const tierStart = NY + ROOF_D + (t.hasUpperTierMain ? Math.round(t.mainH * 0.38) + 1 : 0);
            const tierH     = t.mainH - (t.hasUpperTierMain ? Math.round(t.mainH * 0.38) + 1 : 0);
            return (
              <>
                <rect x={NLX} y={tierStart} width={NEAR_W} height={tierH} fill="url(#mFG)" />
                <rect x={NLX} y={tierStart} width={NEAR_W} height={tierH} fill={primaryColor} fillOpacity={0.38} />
                <HRows x={NLX} y={tierStart} w={NEAR_W} h={tierH} />
              </>
            );
          })()}

          {/* Fundament (cień pod trybuną) */}
          <rect x={NLX} y={NY + ROOF_D + t.mainH} width={NEAR_W} height={7} fill={C_SHADOW} />
          {/* Krawędź dachu — linia highlight */}
          <line x1={NLX} y1={NY} x2={NRX} y2={NY} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
        </g>
      )}

      {/* ── MASZTY OŚWIETLENIOWE ────────────────────────────────────── */}
      {t.hasLighting && t.sideW > 0 && (
        <g>
          {([
            [lOutNX - 12, lOutNY + wallH + 4],
            [rOutNX + 2,  rOutNY + wallH + 4],
            [lOutFX - 10, FY - oppScH - 14],
            [rOutFX + 2,  FY - oppScH - 14],
          ] as [number, number][]).map(([lx, ly], i) => (
            <g key={i}>
              <rect x={lx} y={ly} width={10} height={10} rx={1} fill="#6b2d0a" />
              <rect x={lx+1} y={ly+1} width={8} height={8} rx={0.5} fill="#fbbf24" fillOpacity={0.55} />
              <rect x={lx+3} y={ly+3} width={4} height={4} rx={0.5} fill="#fef08a" fillOpacity={0.88} />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
};
