import React, { useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ImportedSquadPlayer } from '../../context/GameContext';
import { ViewState } from '../../types';

interface FileResult {
  name: string;
  clubs: number;
  players: number;
  errors: number;
}

export const SquadImportView: React.FC = () => {
  const { clubs, importSquad, navigateTo } = useGame();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileResults, setFileResults] = useState<FileResult[]>([]);
  const [pendingEntries, setPendingEntries] = useState<{ clubId: string; players: ImportedSquadPlayer[] }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (files: FileList) => {
    const collected: { clubId: string; players: ImportedSquadPlayer[] }[] = [];
    const results: FileResult[] = [];
    let processed = 0;
    const total = files.length;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const raw = JSON.parse(ev.target?.result as string);
          const entries: { clubId: string; players: ImportedSquadPlayer[] }[] = Array.isArray(raw) ? raw : [raw];
          let validCount = 0;
          let errorCount = 0;
          let playerCount = 0;

          entries.forEach(entry => {
            const match = clubs.find(c => c.id === entry.clubId || c.name === entry.clubId);
            if (!match || !Array.isArray(entry.players) || entry.players.length === 0) {
              errorCount++;
              return;
            }
            collected.push({ clubId: match.id, players: entry.players });
            validCount++;
            playerCount += entry.players.length;
          });

          results.push({ name: file.name, clubs: validCount, players: playerCount, errors: errorCount });
        } catch {
          results.push({ name: file.name, clubs: 0, players: 0, errors: 1 });
        }

        processed++;
        if (processed === total) {
          setFileResults(prev => [...prev, ...results]);
          setPendingEntries(prev => [...prev, ...collected]);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };

  const handleConfirm = () => {
    if (pendingEntries.length > 0) importSquad(pendingEntries);
    navigateTo(ViewState.DASHBOARD);
  };

  const handleSkip = () => {
    navigateTo(ViewState.DASHBOARD);
  };

  const handleClear = () => {
    setFileResults([]);
    setPendingEntries([]);
  };

  const totalClubs = fileResults.reduce((s, r) => s + r.clubs, 0);
  const totalPlayers = fileResults.reduce((s, r) => s + r.players, 0);
  const totalErrors = fileResults.reduce((s, r) => s + r.errors, 0);

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white font-black italic uppercase tracking-tighter">

      <div className="w-[560px] flex flex-col gap-5">

        {/* HEADER */}
        <div>
          <div className="text-2xl text-yellow-400 leading-tight">Wczytaj składy z pliku</div>
          <div className="text-xs text-slate-400 mt-1 normal-case not-italic tracking-normal font-normal">
            Opcjonalnie. Pliki JSON w formacie identycznym z eksportem edytora. Możesz wgrać kilka plików naraz.
          </div>
        </div>

        {/* DROP ZONE */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg px-8 py-10 flex flex-col items-center gap-3 cursor-pointer transition-colors
            ${isDragging ? 'border-yellow-400 bg-yellow-400/10' : 'border-slate-700 bg-slate-900/40 hover:border-slate-500'}`}
        >
          <div className="text-3xl text-slate-500">↑</div>
          <div className="text-sm text-slate-300">Kliknij lub upuść pliki JSON</div>
          <div className="text-xs text-slate-600 normal-case not-italic tracking-normal font-normal">Obsługa wielu plików jednocześnie</div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* WYNIKI */}
        {fileResults.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs text-yellow-400">Wgrane pliki ({fileResults.length})</span>
              <button
                onClick={handleClear}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors normal-case not-italic tracking-normal font-normal"
              >
                Wyczyść
              </button>
            </div>
            <div className="divide-y divide-slate-800/60 max-h-52 overflow-y-auto">
              {fileResults.map((r, i) => (
                <div key={i} className="px-4 py-2 flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${r.clubs > 0 ? 'bg-emerald-400' : 'bg-red-500'}`} />
                  <span className="text-xs text-slate-300 flex-1 truncate normal-case not-italic tracking-normal font-normal">{r.name}</span>
                  {r.clubs > 0 && (
                    <span className="text-xs text-emerald-400 whitespace-nowrap">{r.clubs} kl. / {r.players} zaw.</span>
                  )}
                  {r.errors > 0 && (
                    <span className="text-xs text-red-400 whitespace-nowrap">{r.errors} błęd.</span>
                  )}
                </div>
              ))}
            </div>
            {fileResults.length > 1 && (
              <div className="px-4 py-2 border-t border-slate-800 flex items-center gap-2">
                <span className="text-xs text-slate-500">Łącznie:</span>
                <span className="text-xs text-emerald-400">{totalClubs} klubów / {totalPlayers} zawodników</span>
                {totalErrors > 0 && <span className="text-xs text-red-400">/ {totalErrors} błędów</span>}
              </div>
            )}
          </div>
        )}

        {/* PRZYCISKI */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleConfirm}
            disabled={pendingEntries.length === 0}
            className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 rounded text-sm text-white transition-colors active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Importuj i zacznij grę
          </button>
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 hover:text-white hover:border-slate-500 transition-colors active:scale-95"
          >
            Pomiń
          </button>
        </div>

      </div>
    </div>
  );
};
