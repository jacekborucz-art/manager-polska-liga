import React, { useState, useEffect } from 'react';

const BASE_W = 1920;
const BASE_H = 1080;

type ScalerState = { scale: number; offsetX: number; offsetY: number };

const calcState = (): ScalerState => {
  const vv = window.visualViewport;
  const w = vv ? vv.width : window.innerWidth;
  const h = vv ? vv.height : window.innerHeight;
  const s = Math.min(w / BASE_W, h / BASE_H);
  return {
    scale: s,
    offsetX: Math.max(0, (w - BASE_W * s) / 2),
    offsetY: Math.max(0, (h - BASE_H * s) / 2),
  };
};

type GameScalerContextType = { mobileMode: boolean; toggleMobile: () => void };
export const GameScalerContext = React.createContext<GameScalerContextType>({ mobileMode: false, toggleMobile: () => {} });
export const useGameScaler = () => React.useContext(GameScalerContext);

export const GameScaler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMode, setMobileMode] = useState(() => localStorage.getItem('mobileScale') === '1');
  const [scaler, setScaler] = useState<ScalerState>(() =>
    localStorage.getItem('mobileScale') === '1' ? calcState() : { scale: 1, offsetX: 0, offsetY: 0 }
  );

  useEffect(() => {
    if (!mobileMode) return;
    const update = () => setScaler(calcState());
    update();
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, [mobileMode]);

  const enableMobile = () => {
    localStorage.setItem('mobileScale', '1');
    setScaler(calcState());
    setMobileMode(true);
  };

  const disableMobile = () => {
    localStorage.setItem('mobileScale', '0');
    setMobileMode(false);
  };

  const toggleMobile = () => mobileMode ? disableMobile() : enableMobile();

  if (!mobileMode) {
    return (
      <GameScalerContext.Provider value={{ mobileMode, toggleMobile }}>
        {children}
      </GameScalerContext.Provider>
    );
  }

  return (
    <GameScalerContext.Provider value={{ mobileMode, toggleMobile }}>
      <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden', position: 'relative', background: '#0f172a' }}>
        <div
          style={{
            width: BASE_W,
            height: BASE_H,
            transform: `scale(${scaler.scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: scaler.offsetY,
            left: scaler.offsetX,
          }}
        >
          {children}
        </div>
        <button
          onClick={disableMobile}
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            zIndex: 9999,
            background: '#1e293b',
            border: '1px solid #3b82f6',
            borderRadius: 8,
            color: '#60a5fa',
            fontSize: 11,
            padding: '4px 8px',
            cursor: 'pointer',
          }}
          title="Wyłącz tryb mobilny"
        >
          🖥
        </button>
      </div>
    </GameScalerContext.Provider>
  );
};

export const PortalScaleWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (localStorage.getItem('mobileScale') !== '1') return <>{children}</>;
  const s = Math.min(window.innerWidth / BASE_W, window.innerHeight / BASE_H);
  const offsetX = Math.max(0, (window.innerWidth - BASE_W * s) / 2);
  const offsetY = Math.max(0, (window.innerHeight - BASE_H * s) / 2);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, overflow: 'hidden' }}>
      <div
        style={{
          width: BASE_W,
          height: BASE_H,
          transform: `scale(${s})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: offsetY,
          left: offsetX,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
};
