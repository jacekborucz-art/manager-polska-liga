import React, { useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ImportedSquadPlayer } from '../../context/GameContext';
import { ClubKit, ClubManagement, Coach, SportingDirector, StaffMember, ViewState } from '../../types';
import { getClubKits } from '../../resources/ClubKits';

interface FileResult {
  name: string;
  clubs: number;
  players: number;
  kits: number;
  staff: number;
  management: number;
  errors: number;
}

interface PendingKitImport {
  clubId: string;
  kits: ClubKit[];
}

interface PendingStaffImport {
  clubId: string;
  coach?: Coach | null;
  staff?: StaffMember[];
}

interface PendingManagementImport {
  clubId: string;
  management: ClubManagement;
  sportingDirector?: SportingDirector | null;
}

export const SquadImportView: React.FC = () => {
  const { clubs, importSquad, navigateTo, setClubs, setCoaches, setStaffMembers } = useGame();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileResults, setFileResults] = useState<FileResult[]>([]);
  const [pendingEntries, setPendingEntries] = useState<{ clubId: string; players: ImportedSquadPlayer[] }[]>([]);
  const [pendingKits, setPendingKits] = useState<PendingKitImport[]>([]);
  const [pendingStaff, setPendingStaff] = useState<PendingStaffImport[]>([]);
  const [pendingManagement, setPendingManagement] = useState<PendingManagementImport[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const findClubId = (entry: Record<string, unknown>): string | null => {
    const clubId = typeof entry.clubId === 'string' ? entry.clubId : '';
    const clubName = typeof entry.clubName === 'string' ? entry.clubName : typeof entry.name === 'string' ? entry.name : '';
    const match = clubs.find(c => c.id === clubId || c.name === clubId || c.name === clubName);
    return match?.id ?? null;
  };

  const splitLegacyManagement = (management: unknown): { management?: ClubManagement; sportingDirector?: SportingDirector | null } => {
    if (!management || typeof management !== 'object' || Array.isArray(management)) return {};
    const { sportingDirector, ...managementWithoutSportingDirector } = management as Record<string, unknown>;
    return {
      management: managementWithoutSportingDirector as ClubManagement,
      sportingDirector: sportingDirector as SportingDirector | undefined,
    };
  };

  const processFiles = (files: FileList) => {
    const collected: { clubId: string; players: ImportedSquadPlayer[] }[] = [];
    const collectedKits: PendingKitImport[] = [];
    const collectedStaff: PendingStaffImport[] = [];
    const collectedManagement: PendingManagementImport[] = [];
    const results: FileResult[] = [];
    let processed = 0;
    const total = files.length;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const raw = JSON.parse(ev.target?.result as string);
          const rawEntries = Array.isArray(raw?.clubs) ? raw.clubs : Array.isArray(raw) ? raw : [raw];
          let validCount = 0;
          let errorCount = 0;
          let playerCount = 0;
          let kitCount = 0;
          let staffCount = 0;
          let managementCount = 0;

          rawEntries.forEach((entry: Record<string, unknown>) => {
            const clubId = findClubId(entry);
            if (!clubId) {
              errorCount++;
              return;
            }

            if (Array.isArray(entry.players) && entry.players.length > 0) {
              collected.push({ clubId, players: entry.players as ImportedSquadPlayer[] });
              validCount++;
              playerCount += entry.players.length;
              return;
            }

            if (Array.isArray(entry.kits) && entry.kits.length > 0) {
              collectedKits.push({ clubId, kits: entry.kits as ClubKit[] });
              validCount++;
              kitCount++;
              return;
            }

            if (entry.management && typeof entry.management === 'object') {
              const { management, sportingDirector: legacySportingDirector } = splitLegacyManagement(entry.management);
              collectedManagement.push({
                clubId,
                management: management as ClubManagement,
                sportingDirector: (entry.sportingDirector as SportingDirector | undefined) ?? legacySportingDirector ?? null,
              });
              validCount++;
              managementCount++;
              return;
            }

            if ((entry.coach && typeof entry.coach === 'object') || Array.isArray(entry.staff)) {
              collectedStaff.push({
                clubId,
                coach: entry.coach && typeof entry.coach === 'object' ? entry.coach as Coach : null,
                staff: Array.isArray(entry.staff) ? entry.staff as StaffMember[] : [],
              });
              validCount++;
              staffCount++;
              return;
            }

            errorCount++;
          });

          results.push({ name: file.name, clubs: validCount, players: playerCount, kits: kitCount, staff: staffCount, management: managementCount, errors: errorCount });
        } catch {
          results.push({ name: file.name, clubs: 0, players: 0, kits: 0, staff: 0, management: 0, errors: 1 });
        }

        processed++;
        if (processed === total) {
          setFileResults(prev => [...prev, ...results]);
          setPendingEntries(prev => [...prev, ...collected]);
          setPendingKits(prev => [...prev, ...collectedKits]);
          setPendingStaff(prev => [...prev, ...collectedStaff]);
          setPendingManagement(prev => [...prev, ...collectedManagement]);
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
    if (pendingKits.length > 0) {
      setClubs(prev => prev.map(club => {
        const entry = pendingKits.find(item => item.clubId === club.id);
        return entry ? { ...club, kits: getClubKits({ ...club, kits: entry.kits }) } : club;
      }));
    }
    if (pendingStaff.length > 0) {
      setCoaches(prev => {
        const next = { ...prev };
        pendingStaff.forEach(entry => {
          if (entry.coach?.id) next[entry.coach.id] = { ...next[entry.coach.id], ...entry.coach, currentClubId: entry.clubId };
        });
        return next;
      });
      setStaffMembers(prev => {
        const next = { ...prev };
        pendingStaff.forEach(entry => {
          (entry.staff ?? []).forEach(staff => {
            if (staff?.id) next[staff.id] = { ...next[staff.id], ...staff, currentClubId: entry.clubId };
          });
        });
        return next;
      });
      setClubs(prev => prev.map(club => {
        const entry = pendingStaff.find(item => item.clubId === club.id);
        if (!entry) return club;
        return {
          ...club,
          coachId: entry.coach?.id ?? club.coachId,
          staffIds: entry.staff && entry.staff.length > 0 ? entry.staff.map(staff => staff.id) : club.staffIds,
        };
      }));
    }
    if (pendingManagement.length > 0) {
      setClubs(prev => prev.map(club => {
        const entry = pendingManagement.find(item => item.clubId === club.id);
        return entry ? {
          ...club,
          management: { ...club.management, ...entry.management } as ClubManagement,
          sportingDirector: entry.sportingDirector ?? club.sportingDirector,
        } : club;
      }));
    }
    navigateTo(ViewState.DASHBOARD);
  };

  const handleSkip = () => {
    navigateTo(ViewState.DASHBOARD);
  };

  const handleClear = () => {
    setFileResults([]);
    setPendingEntries([]);
    setPendingKits([]);
    setPendingStaff([]);
    setPendingManagement([]);
  };

  const totalClubs = fileResults.reduce((s, r) => s + r.clubs, 0);
  const totalPlayers = fileResults.reduce((s, r) => s + r.players, 0);
  const totalKits = fileResults.reduce((s, r) => s + r.kits, 0);
  const totalStaff = fileResults.reduce((s, r) => s + r.staff, 0);
  const totalManagement = fileResults.reduce((s, r) => s + r.management, 0);
  const totalErrors = fileResults.reduce((s, r) => s + r.errors, 0);
  const hasPendingImports = pendingEntries.length > 0 || pendingKits.length > 0 || pendingStaff.length > 0 || pendingManagement.length > 0;

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white font-black italic uppercase tracking-tighter">

      <div className="w-[560px] flex flex-col gap-5">

        {/* HEADER */}
        <div>
          <div className="text-2xl text-yellow-400 leading-tight">Wczytaj składy z pliku</div>
          <div className="text-xs text-slate-400 mt-1 normal-case not-italic tracking-normal font-normal">
            Opcjonalnie. Możesz wgrać składy, stroje ligi, sztab ligi i zarząd ligi z eksportów edytora.
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {['Składy', 'Stroje', 'Sztab', 'Zarząd'].map(label => (
            <div key={label} className="rounded border border-slate-800 bg-slate-900/40 px-3 py-2 text-center text-[10px] text-slate-300 font-black italic uppercase tracking-tighter">
              {label}
            </div>
          ))}
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
                    <span className="text-xs text-emerald-400 whitespace-nowrap">
                      {[
                        r.players > 0 ? `${r.players} zaw.` : '',
                        r.kits > 0 ? `${r.kits} str.` : '',
                        r.staff > 0 ? `${r.staff} szt.` : '',
                        r.management > 0 ? `${r.management} zarz.` : '',
                      ].filter(Boolean).join(' / ')}
                    </span>
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
                <span className="text-xs text-emerald-400">
                  {totalClubs} klubów
                  {totalPlayers > 0 ? ` / ${totalPlayers} zawodników` : ''}
                  {totalKits > 0 ? ` / ${totalKits} strojów` : ''}
                  {totalStaff > 0 ? ` / ${totalStaff} sztabów` : ''}
                  {totalManagement > 0 ? ` / ${totalManagement} zarządów` : ''}
                </span>
                {totalErrors > 0 && <span className="text-xs text-red-400">/ {totalErrors} błędów</span>}
              </div>
            )}
          </div>
        )}

        {/* PRZYCISKI */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleConfirm}
            disabled={!hasPendingImports}
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
