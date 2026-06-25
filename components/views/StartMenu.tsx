
import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState } from '../../types';
import bgImg from '../../Graphic/themes/main_theme.png';
import { importSaveFromFile } from '../../services/SaveGameService';
import { useGameScaler } from '../GameScaler';

const EDITOR_DATAPACK_IMPORTED_STORAGE_KEY = 'polish_league_editor_datapack_imported';

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
  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);
  const { mobileMode, toggleMobile } = useGameScaler();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fullPackInputRef = useRef<HTMLInputElement>(null);
  const handleFileLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importSaveFromFile(file);
      loadGameFromFile(data);
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
      <div className="relative z-10 flex flex-col items-center max-w-[1180px] w-full px-6 text-center animate-fade-in pb-8">
        
        

      

        {/* Action Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 w-full max-w-[1180px] mx-auto">
                                                                      
          
          <button 
            onClick={handleNewGameClick}
            className="group relative h-48 bg-emerald-600/10 border border-emerald-500/20 rounded-[32px] p-6 transition-all duration-500 hover:bg-emerald-600 hover:border-emerald-400 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.5)] overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative z-10 flex flex-col h-full items-center justify-between">
                <span className="text-4xl group-hover:scale-125 transition-transform duration-500">🏆</span>
                <div className="text-center">
                  <span className="block text-[10px] font-black text-emerald-500 group-hover:text-emerald-100 uppercase tracking-widest mb-1">ROZPOCZNIJ</span>
                  <span className="text-2xl font-black italic uppercase tracking-tighter whitespace-nowrap text-white">NOWA GRA</span>
                </div>
             </div>
          </button>

          <button 
            onClick={() => navigateTo(ViewState.GAME_MANUAL)}
            className="group relative h-48 bg-blue-600/10 border border-blue-500/20 rounded-[32px] p-6 transition-all duration-500 hover:bg-blue-600 hover:border-blue-400 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.5)] overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative z-10 flex flex-col h-full items-center justify-between">
                <span className="text-4xl group-hover:scale-125 transition-transform duration-500">📚</span>
                <div className="text-center">
                  <span className="block text-[10px] font-black text-blue-500 group-hover:text-blue-100 uppercase tracking-widest mb-1">GUIDE</span>
                  <span className="text-2xl font-black text-white italic uppercase tracking-tighter">INSTRUKCJA</span>
                </div>
             </div>
          </button>

          <button
            onClick={() => navigateTo(ViewState.PREGAME_DATAPACK_EDITOR)}
            className="group relative h-48 bg-yellow-600/10 border border-yellow-500/20 rounded-[32px] p-6 transition-all duration-500 hover:bg-yellow-600 hover:border-yellow-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(234,179,8,0.5)] overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative z-10 flex flex-col h-full items-center justify-between">
                <span className="text-4xl group-hover:scale-125 transition-transform duration-500">DB</span>
                <div className="text-center">
                  <span className="block text-[10px] font-black italic uppercase tracking-tighter text-yellow-400 group-hover:text-yellow-100 mb-1">BAZA GRY</span>
                  <span className="text-2xl font-black italic uppercase tracking-tighter text-white">EDYTOR</span>
                </div>
             </div>
          </button>

          <input ref={fullPackInputRef} type="file" accept=".json" className="hidden" onChange={handleFullPackLoad} />
          <button
            onClick={() => fullPackInputRef.current?.click()}
            className="group relative h-48 bg-emerald-900/20 border border-emerald-500/20 rounded-[32px] p-6 transition-all duration-500 hover:bg-emerald-700 hover:border-emerald-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.5)] overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative z-10 flex flex-col h-full items-center justify-between">
                <span className="text-4xl group-hover:scale-125 transition-transform duration-500">📦</span>
                <div className="text-center">
                  <span className="block text-[10px] font-black italic uppercase tracking-tighter text-emerald-400 group-hover:text-emerald-100 mb-1">ZAŁADUJ</span>
                  <span className="text-2xl font-black italic uppercase tracking-tighter text-white">DATAPACK</span>
                </div>
             </div>
          </button>

          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileLoad} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-48 bg-slate-600/10 border border-slate-500/20 rounded-[32px] p-6 transition-all duration-500 hover:bg-slate-600 hover:border-slate-400 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(100,116,139,0.5)] overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative z-10 flex flex-col h-full items-center justify-between">
                <span className="text-4xl group-hover:scale-125 transition-transform duration-500">💾</span>
                <div className="text-center">
                  <span className="block text-[10px] font-black text-slate-400 group-hover:text-slate-100 uppercase tracking-widest mb-1">KONTYNUUJ</span>
                  <span className="text-2xl font-black text-white italic uppercase tracking-tighter">WCZYTAJ</span>
                </div>
             </div>
          </button>

          <button
            onClick={() => setShowOptions(true)}
            className="group relative h-48 bg-slate-900/60 border border-white/5 rounded-[32px] p-6 transition-all duration-500 hover:bg-white/5 hover:border-white/20 hover:-translate-y-2 overflow-hidden shadow-xl"
          >
             <div className="relative z-10 flex flex-col h-full items-center justify-between">
                <span className="text-4xl group-hover:rotate-90 transition-transform duration-700">⚙️</span>
                <div className="text-center">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">KONFIGURUJ</span>
                  <span className="text-2xl font-black text-white italic uppercase tracking-tighter">OPCJE</span>
                </div>
             </div>
          </button>

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
      `}</style>
    </div>
  );
};
