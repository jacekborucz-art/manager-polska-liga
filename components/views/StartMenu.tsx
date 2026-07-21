
import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState } from '../../types';
import bgImg from '../../Graphic/themes/main_theme.png';
import { importSaveFromFile } from '../../services/SaveGameService';
import { useGameScaler } from '../GameScaler';

const EDITOR_DATAPACK_IMPORTED_STORAGE_KEY = 'polish_league_editor_datapack_imported';

const MenuIcon: React.FC<{ type: string }> = ({ type }) => {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  };
  switch (type) {
    case 'trophy':
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12" {...common}>
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
          <path d="M17 5h2.5a.5.5 0 0 1 .5.5C20 8 18.5 9.6 16.5 10" />
          <path d="M7 5H4.5a.5.5 0 0 0-.5.5C4 8 5.5 9.6 7.5 10" />
        </svg>
      );
    case 'book':
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12" {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M9 7h7" />
          <path d="M9 11h5" />
        </svg>
      );
    case 'database':
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12" {...common}>
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
          <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
        </svg>
      );
    case 'package':
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12" {...common}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.27 6.96L12 12.01l8.73-5.05" />
          <path d="M12 22.08V12" />
        </svg>
      );
    case 'save':
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12" {...common}>
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <path d="M17 21v-8H7v8" />
          <path d="M7 3v5h8" />
        </svg>
      );
    case 'gear':
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12" {...common}>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'exit':
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12" {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      );
    default:
      return null;
  }
};

const BallSvg: React.FC = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 drop-shadow-[0_6px_12px_rgba(0,0,0,0.55)]">
    <defs>
      <radialGradient id="menuBallShine" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="65%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#94a3b8" />
      </radialGradient>
      <clipPath id="menuBallClip">
        <circle cx="50" cy="50" r="47" />
      </clipPath>
    </defs>
    <circle cx="50" cy="50" r="47" fill="url(#menuBallShine)" stroke="#0f172a" strokeWidth="2.5" />
    <g clipPath="url(#menuBallClip)">
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

export const StartMenu: React.FC = () => {
  const { startNewGame, navigateTo, loadGameFromFile, importEditorFullPack, showGameNotification } = useGame();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showResolutionNotice, setShowResolutionNotice] = useState(false);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };
  const requestFullscreenSafely = () => {
    if (document.fullscreenElement || !document.documentElement.requestFullscreen) return;
    void document.documentElement.requestFullscreen().catch(() => undefined);
  };
  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);
  const { mobileMode, toggleMobile } = useGameScaler();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fullPackInputRef = useRef<HTMLInputElement>(null);

  // --- BALL STATE ---
  const [ballX, setBallX] = useState<number | null>(null);
  const [hopKey, setHopKey] = useState(0);
  const [kick, setKick] = useState<{ x: number } | null>(null);
  const menuAreaRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastBallXRef = useRef<number | null>(null);
  const kickTimeoutRef = useRef<number | null>(null);

  const hopBallTo = (index: number) => {
    if (kick) return;
    const area = menuAreaRef.current;
    const btn = buttonRefs.current[index];
    if (!area || !btn) return;
    const areaRect = area.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const x = btnRect.left + btnRect.width / 2 - areaRect.left;
    if (lastBallXRef.current === null || Math.abs(lastBallXRef.current - x) > 2) {
      lastBallXRef.current = x;
      setBallX(x);
      setHopKey(k => k + 1);
    }
  };

  const kickBall = () => {
    if (kick) return;
    const dir = Math.random() < 0.5 ? -1 : 1;
    setKick({ x: dir * (140 + Math.random() * 180) });
    if (kickTimeoutRef.current) window.clearTimeout(kickTimeoutRef.current);
    kickTimeoutRef.current = window.setTimeout(() => {
      setKick(null);
      setHopKey(k => k + 1);
    }, 1000);
  };

  useEffect(() => () => {
    if (kickTimeoutRef.current) window.clearTimeout(kickTimeoutRef.current);
  }, []);

  const handleFileLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    requestFullscreenSafely();
    try {
      const data = await importSaveFromFile(file);
      loadGameFromFile(data);
      requestAnimationFrame(requestFullscreenSafely);
      window.setTimeout(requestFullscreenSafely, 150);
    } catch {
      showGameNotification({
        title: 'Nieprawidłowy zapis',
        message: 'Wybrany plik nie wygląda jak prawidłowy zapis gry.',
        tone: 'error'
      });
    }
    e.target.value = '';
  };

  const handleFullPackLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      const result = importEditorFullPack(raw);
      if (result.success) {
        window.localStorage.setItem(EDITOR_DATAPACK_IMPORTED_STORAGE_KEY, '1');
      }
      showGameNotification({
        title: result.success ? 'Full pack zaimportowany' : 'Nieprawidłowy full pack',
        message: result.message,
        tone: result.success ? 'success' : 'error'
      });
    } catch {
      showGameNotification({
        title: 'Błąd importu',
        message: 'Wybrany plik nie wygląda jak prawidłowy full pack edytora.',
        tone: 'error'
      });
    }
    e.target.value = '';
  };

  const handleNewGameClick = () => {
    startNewGame(2025);
  };

  const menuItems = [
    {
      key: 'new-game',
      tag: 'ROZPOCZNIJ',
      title: 'NOWA GRA',
      icon: 'trophy',
      accent: '#34d399',
      className: 'bg-emerald-600/10 border-emerald-500/20 hover:bg-emerald-600 hover:border-emerald-400 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.5)]',
      tagClass: 'text-emerald-500 group-hover:text-emerald-100',
      iconClass: 'text-emerald-400 group-hover:text-white',
      onClick: handleNewGameClick
    },
    {
      key: 'manual',
      tag: 'GUIDE',
      title: 'INSTRUKCJA',
      icon: 'book',
      accent: '#60a5fa',
      className: 'bg-blue-600/10 border-blue-500/20 hover:bg-blue-600 hover:border-blue-400 hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.5)]',
      tagClass: 'text-blue-500 group-hover:text-blue-100',
      iconClass: 'text-blue-400 group-hover:text-white',
      onClick: () => navigateTo(ViewState.GAME_MANUAL)
    },
    {
      key: 'editor',
      tag: 'BAZA GRY',
      title: 'EDYTOR',
      icon: 'database',
      accent: '#facc15',
      className: 'bg-yellow-600/10 border-yellow-500/20 hover:bg-yellow-600 hover:border-yellow-300 hover:shadow-[0_30px_60px_-15px_rgba(234,179,8,0.5)]',
      tagClass: 'text-yellow-400 group-hover:text-yellow-100',
      iconClass: 'text-yellow-400 group-hover:text-white',
      onClick: () => navigateTo(ViewState.PREGAME_DATAPACK_EDITOR)
    },
    {
      key: 'datapack',
      tag: 'ZAŁADUJ',
      title: 'DATAPACK',
      icon: 'package',
      accent: '#34d399',
      className: 'bg-emerald-900/20 border-emerald-500/20 hover:bg-emerald-700 hover:border-emerald-300 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.5)]',
      tagClass: 'text-emerald-400 group-hover:text-emerald-100',
      iconClass: 'text-emerald-400 group-hover:text-white',
      onClick: () => fullPackInputRef.current?.click()
    },
    {
      key: 'load',
      tag: 'KONTYNUUJ',
      title: 'WCZYTAJ',
      icon: 'save',
      accent: '#94a3b8',
      className: 'bg-slate-600/10 border-slate-500/20 hover:bg-slate-600 hover:border-slate-400 hover:shadow-[0_30px_60px_-15px_rgba(100,116,139,0.5)]',
      tagClass: 'text-slate-400 group-hover:text-slate-100',
      iconClass: 'text-slate-300 group-hover:text-white',
      onClick: () => fileInputRef.current?.click()
    },
    {
      key: 'options',
      tag: 'KONFIGURUJ',
      title: 'OPCJE',
      icon: 'gear',
      accent: '#cbd5e1',
      className: 'bg-slate-900/60 border-white/5 hover:bg-white/5 hover:border-white/20 shadow-xl',
      tagClass: 'text-slate-500 group-hover:text-slate-200',
      iconClass: 'text-slate-300 group-hover:text-white group-hover:rotate-90',
      onClick: () => setShowOptions(true)
    },
    {
      key: 'exit',
      tag: 'ZAKOŃCZ',
      title: 'WYJŚCIE',
      icon: 'exit',
      accent: '#f87171',
      className: 'bg-red-600/10 border-red-500/20 hover:bg-red-600 hover:border-red-400 hover:shadow-[0_30px_60px_-15px_rgba(220,38,38,0.5)]',
      tagClass: 'text-red-500 group-hover:text-red-100',
      iconClass: 'text-red-400 group-hover:text-white',
      onClick: () => { window.close(); window.location.href = 'about:blank'; }
    }
  ];

  return (
    <div className="h-screen w-full flex flex-col items-center justify-end bg-slate-950 overflow-hidden relative">

      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-[60] w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-lg"
        title={isFullscreen ? 'Wyjdź z pełnego ekranu' : 'Pełny ekran'}
      >
        {isFullscreen ? '⊠' : '⛶'}
      </button>

      {/* DISCLAIMER POPUP */}
      {showDisclaimer && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative max-w-3xl w-full mx-6 max-h-[80vh] overflow-y-auto bg-slate-900/40 border border-white/10 rounded-[24px] p-8" style={{ fontFamily: "'Archivo', sans-serif" }}>
            <button
              onClick={() => { setShowDisclaimer(false); setShowResolutionNotice(true); }}
              className="absolute top-4 right-4 text-4xl text-white/40 hover:text-white transition-colors leading-none"
            >
              ✕
            </button>
            <p className="text-[13px] font-black text-emerald-500 uppercase tracking-widest mb-4">DISCLAIMER / INFORMACJA PRAWNA</p>
            <div className="flex flex-col gap-3 text-[15px] font-black italic text-slate-300 tracking-wide leading-relaxed">
              <p><span className="text-white">„Futbol Manager"</span> jest niekomercyjnym, fanowskim projektem open-source tworzonym hobbystycznie i udostępnianym bezpłatnie.</p>
              <p>Projekt nie jest powiązany, sponsorowany, zatwierdzony ani wspierany przez żaden klub piłkarski, ligę, federację, organizację sportową ani właściciela znaków towarowych.</p>
              <p>Wszelkie nazwy klubów, lig, rozgrywek, miejsc, stadionów oraz inne oznaczenia mogące odnosić się do rzeczywistych podmiotów zostały użyte wyłącznie w celach identyfikacyjnych, informacyjnych lub fanowskich. Wszelkie prawa do znaków towarowych, nazw, marek i innych oznaczeń należą do ich prawowitych właścicieli.</p>
              <p>Gra nie zawiera oficjalnych herbów, logotypów, sponsorów, licencjonowanych grafik, oficjalnych strojów ani materiałów wizualnych należących do klubów, lig lub innych podmiotów trzecich.</p>
              <p>Postacie występujące w grze są fikcyjne. Ewentualna zbieżność imion, nazwisk lub danych z rzeczywistymi osobami jest przypadkowa.</p>
              <p>Projekt nie generuje przychodów, nie zawiera płatnych funkcji, reklam ani elementów monetyzacji.</p>
              <p>Właściciele praw, którzy uważają, że określony element projektu narusza ich prawa, mogą skontaktować się z autorem w celu jego usunięcia lub zmiany.</p>
              <p className="text-white">Autor: JayJayBi &nbsp;|&nbsp; Data: marzec 2026</p>
            </div>
          </div>
        </div>
      )}

      {/* RESOLUTION NOTICE POPUP */}
      {showResolutionNotice && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative max-w-3xl w-full mx-6 bg-slate-900/40 border border-white/10 rounded-[24px] p-12">
            <button
              onClick={() => setShowResolutionNotice(false)}
              className="absolute top-4 right-4 text-4xl text-white/40 hover:text-white transition-colors leading-none"
            >
              ✕
            </button>
            <p className="text-[22px] font-black text-amber-500 uppercase tracking-widest text-center mb-4">WYMAGANIA EKRANU</p>
            <div className="w-full h-px bg-amber-500/30 mb-6" />
            <div className="flex flex-col gap-5 text-[20px] font-black italic text-slate-300 tracking-wide leading-relaxed">
              <p>Gra jest zoptymalizowana do rozdzielczości <span className="text-white">1920x1080</span>. Można grać przy wyższej rozdzielczości, jednak przy niższej układ grafiki może być nieprawidłowy.</p>
              <p>Dla najlepszego doświadczenia przy rozdzielczości <span className="text-white">1920x1080</span> zalecamy włączenie trybu <span className="text-white">pełnoekranowego</span>.</p>
              <p className="text-slate-400">Pełny ekran możesz włączyć:</p>
              <ul className="flex flex-col gap-2 text-slate-300 pl-2">
                <li>— klawiszem <span className="text-white">Fn + F11</span> na klawiaturze</li>
                <li>— z menu głównego: <span className="text-white">OPCJE → WŁĄCZ PEŁNY EKRAN</span></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 1. CINEMATIC BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        {/* Real Football Background - High Contrast Stadium */}
        <div
          className="absolute inset-0 scale-110 opacity-70 mix-blend-luminosity animate-pulse-slow"
          style={{ backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 opacity-70" />

        {/* Dynamic Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Cyber Grid */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* 2. CENTRAL CONTENT */}
      <div className="relative z-10 flex flex-col items-center max-w-[1320px] w-full px-6 text-center animate-fade-in pb-8">

        {/* Action Menu + Bouncing Ball */}
        <div ref={menuAreaRef} className="relative w-full pt-24">

          {/* BOUNCING BALL */}
          <div
            className="absolute top-6 z-20 w-12 pointer-events-none"
            style={{
              left: ballX ?? '50%',
              transform: 'translateX(-50%)',
              transition: 'left 0.5s cubic-bezier(0.4, 1.1, 0.55, 1)'
            }}
          >
            {kick ? (
              <div className="menu-ball-kick" style={{ '--kick-x': `${kick.x}px` } as React.CSSProperties}>
                <BallSvg />
              </div>
            ) : (
              <div key={hopKey} className="menu-ball-hop">
                <div className="menu-ball-idle">
                  <BallSvg />
                </div>
              </div>
            )}
            {!kick && (
              <div className="menu-ball-shadow absolute left-1/2 -ml-5 w-10 h-2 rounded-full bg-black/50 blur-[3px]" style={{ top: 56 }} />
            )}
          </div>

          <input ref={fullPackInputRef} type="file" accept=".json" className="hidden" onChange={handleFullPackLoad} />
          <input ref={fileInputRef} type="file" accept=".json,.gz,.json.gz" className="hidden" onChange={handleFileLoad} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 w-full">
            {menuItems.map((item, i) => (
              <button
                key={item.key}
                ref={el => { buttonRefs.current[i] = el; }}
                onMouseEnter={() => hopBallTo(i)}
                onClick={() => { kickBall(); item.onClick(); }}
                className={`group relative h-52 border rounded-[28px] p-6 transition-all duration-500 hover:-translate-y-2 overflow-hidden ${item.className}`}
              >
                {/* SVG pitch lines */}
                <svg
                  className="absolute inset-0 w-full h-full text-white opacity-[0.08] group-hover:opacity-25 transition-opacity duration-500 pointer-events-none"
                  viewBox="0 0 100 145"
                  preserveAspectRatio="none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path d="M26 0 V15 H74 V0" vectorEffect="non-scaling-stroke" />
                  <path d="M38 0 V6 H62 V0" vectorEffect="non-scaling-stroke" />
                  <path d="M38 15 A 14 8 0 0 0 62 15" vectorEffect="non-scaling-stroke" />
                  <circle cx="50" cy="145" r="22" vectorEffect="non-scaling-stroke" />
                  <circle cx="50" cy="122" r="1.5" fill="currentColor" stroke="none" />
                </svg>
                {/* Hover sheen */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Running neon border */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <rect
                    pathLength={100}
                    fill="none"
                    strokeWidth="2"
                    strokeDasharray="16 9"
                    strokeLinecap="round"
                    className="menu-run-stroke opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ x: 3, y: 3, width: 'calc(100% - 6px)', height: 'calc(100% - 6px)', rx: 25, stroke: item.accent }}
                  />
                </svg>
                <div className="relative z-10 flex flex-col h-full items-center justify-between">
                  <span className={`flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${item.iconClass}`}>
                    <MenuIcon type={item.icon} />
                  </span>
                  <div className="text-center">
                    <span className={`block text-[11px] font-black uppercase tracking-widest mb-1 ${item.tagClass}`}>{item.tag}</span>
                    <span className="text-2xl font-black italic uppercase tracking-tighter whitespace-nowrap text-white">{item.title}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {showOptions && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setShowOptions(false)}
          >
            <div
              className="relative flex flex-col items-center gap-4 p-8 bg-slate-950/95 border border-white/10 rounded-[32px] w-full max-w-sm mx-6 backdrop-blur-3xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowOptions(false)}
                className="absolute top-4 right-4 text-2xl text-white/40 hover:text-white transition-colors leading-none"
              >✕</button>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">OPCJE</p>

              <button
                onClick={toggleFullscreen}
                className={`group relative w-full h-16 rounded-[32px] px-8 transition-all duration-500 hover:-translate-y-1 overflow-hidden border ${isFullscreen ? 'bg-red-600/20 border-red-500/30 hover:bg-red-600 hover:border-red-400 hover:shadow-[0_20px_40px_-10px_rgba(220,38,38,0.5)]' : 'bg-emerald-600/20 border-emerald-500/30 hover:bg-emerald-600 hover:border-emerald-400 hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.5)] animate-fullscreen-pulse'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex items-center justify-center">
                  <span className="text-[13px] font-black text-white/50 group-hover:text-white uppercase tracking-widest transition-colors">
                    {isFullscreen ? 'WYŁĄCZ PEŁNY EKRAN' : 'WŁĄCZ PEŁNY EKRAN'}
                  </span>
                </div>
              </button>

              <button
                onClick={toggleMobile}
                className={`group relative w-full h-16 rounded-[32px] px-8 transition-all duration-500 hover:-translate-y-1 overflow-hidden border ${mobileMode ? 'bg-teal-600/40 border-teal-400/60 hover:bg-teal-700 hover:border-teal-300 hover:shadow-[0_20px_40px_-10px_rgba(20,184,166,0.5)]' : 'bg-teal-600/20 border-teal-500/30 hover:bg-teal-600 hover:border-teal-400 hover:shadow-[0_20px_40px_-10px_rgba(20,184,166,0.5)] animate-mobile-pulse'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex items-center justify-center">
                  <span className="text-[18px] font-black text-white/90 group-hover:text-white uppercase tracking-widest transition-colors">
                    {mobileMode ? 'WYŁĄCZ WERSJĘ MOBILNĄ' : 'WŁĄCZ WERSJĘ MOBILNĄ'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-20 flex flex-col items-center gap-2">
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">VERSION 1.5</p>
           <p className="text-[9px] font-bold text-slate-700">BY JAY BI &copy; 2025</p>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.15); }
        }
        .animate-pulse-slow { animation: pulse-slow 20s infinite ease-in-out; }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes fullscreen-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.3); }
          50% { box-shadow: 0 0 30px rgba(16,185,129,0.7), 0 0 60px rgba(16,185,129,0.3); border-color: rgba(16,185,129,0.8); }
        }
        .animate-fullscreen-pulse { animation: fullscreen-pulse 2.5s ease-in-out infinite; }

        @keyframes mobile-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(20,184,166,0.2); border-color: rgba(20,184,166,0.3); }
          50% { box-shadow: 0 0 30px rgba(20,184,166,0.7), 0 0 60px rgba(20,184,166,0.3); border-color: rgba(20,184,166,0.8); }
        }
        .animate-mobile-pulse { animation: mobile-pulse 2.5s ease-in-out infinite; }

        @keyframes menu-ball-hop {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-90px) rotate(180deg); }
          75% { transform: translateY(0) rotate(300deg); }
          87% { transform: translateY(-22px) rotate(330deg); }
          100% { transform: translateY(0) rotate(360deg); }
        }
        .menu-ball-hop { animation: menu-ball-hop 0.55s cubic-bezier(0.3, 0.9, 0.4, 1); }

        @keyframes menu-ball-idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .menu-ball-idle { animation: menu-ball-idle 1.6s ease-in-out infinite; }

        @keyframes menu-ball-shadow {
          0%, 100% { transform: scaleX(1); opacity: 0.45; }
          50% { transform: scaleX(0.72); opacity: 0.25; }
        }
        .menu-ball-shadow { animation: menu-ball-shadow 1.6s ease-in-out infinite; }

        @keyframes menu-ball-kick {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(var(--kick-x), -110vh) rotate(900deg); }
        }
        .menu-ball-kick { animation: menu-ball-kick 0.9s cubic-bezier(0.2, 0.6, 0.35, 1) forwards; }

        @keyframes menu-run-stroke {
          to { stroke-dashoffset: -100; }
        }
        .menu-run-stroke { animation: menu-run-stroke 1.2s linear infinite; }
      `}</style>
    </div>
  );
};
