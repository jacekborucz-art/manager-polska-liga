import React, { useState } from 'react';
import { WinterCampLocation, WinterCampProgram, WinterCampIntensity, WinterCampState } from '../../types';

// ─── LOCATION MODAL ──────────────────────────────────────────────────────────

interface WinterCampLocationModalProps {
  prices: WinterCampState['locationPrices'];
  spaCost: number;
  clubBudget: number;
  onConfirm: (location: WinterCampLocation | null, cost: number, spaOption: boolean) => void;
}

const LOCATION_LABELS: Record<WinterCampLocation, string> = {
  turkey:  'Turcja (Antalya)',
  cyprus:  'Cypr (Limassol)',
  greece:  'Grecja (Ateny)',
  poland:  'Polska',
};

const LOCATION_FLAGS: Record<WinterCampLocation, string> = {
  turkey: '🇹🇷',
  cyprus: '🇨🇾',
  greece: '🇬🇷',
  poland: '🇵🇱',
};

const LOCATION_DESC: Record<WinterCampLocation, string> = {
  turkey:  'Doskonałe warunki pogodowe, boiska premium, silna konkurencja sparingowa z europejskich klubów.',
  cyprus:  'Ciepły klimat, nowoczesna infrastruktura treningowa, spokojne przygotowanie do wiosny.',
  greece:  'Dobry klimat, solidna infrastruktura, mniej intensywna scena sparingowa.',
  poland:  'Tańsza opcja krajowa. Ograniczona infrastruktura, ale blisko do bazy.',
};

export const WinterCampLocationModal: React.FC<WinterCampLocationModalProps> = ({
  prices,
  spaCost,
  clubBudget,
  onConfirm,
}) => {
  const [selected, setSelected] = useState<WinterCampLocation | null>(null);
  const [spaOption, setSpaOption] = useState(false);

  const totalCost = selected ? prices[selected] + (spaOption ? spaCost : 0) : 0;
  const canAfford = (loc: WinterCampLocation) => clubBudget >= prices[loc];

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(selected, totalCost, spaOption);
  };

  const handleDecline = () => {
    onConfirm(null, 0, false);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl mx-4 rounded-2xl border border-amber-500/30 bg-slate-900/95 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-500/20 bg-amber-900/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏕️</span>
            <div>
              <h2 className="text-lg font-bold text-amber-300">Propozycja Zarządu: Obóz Zimowy</h2>
              <p className="text-xs text-amber-400/70">2 – 15 stycznia · Wybierz lokalizację</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-slate-300">
            Zarząd proponuje zorganizowanie zimowego obozu przygotowawczego. Wybierz destynację lub zrezygnuj z obozu.
          </p>

          {/* Location cards */}
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(prices) as WinterCampLocation[]).map(loc => {
              const affordable = canAfford(loc);
              const isSelected = selected === loc;
              return (
                <button
                  key={loc}
                  disabled={!affordable}
                  onClick={() => affordable && setSelected(loc)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-amber-900/30 shadow-lg shadow-amber-500/10'
                      : affordable
                      ? 'border-slate-600/50 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
                      : 'border-slate-700/30 bg-slate-900/30 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{LOCATION_FLAGS[loc]}</span>
                    <span className={`font-semibold text-sm ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                      {LOCATION_LABELS[loc]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2 leading-snug">{LOCATION_DESC[loc]}</p>
                  <div className={`text-sm font-bold ${affordable ? 'text-green-400' : 'text-red-400'}`}>
                    {prices[loc].toLocaleString('pl-PL')} PLN
                  </div>
                  {!affordable && (
                    <div className="text-xs text-red-400/70 mt-0.5">Niewystarczający budżet</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* SPA option */}
          {selected && (
            <div
              onClick={() => setSpaOption(v => !v)}
              className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                spaOption ? 'border-blue-400/60 bg-blue-900/20' : 'border-slate-600/40 bg-slate-800/30 hover:border-slate-500'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${spaOption ? 'border-blue-400 bg-blue-500' : 'border-slate-500'}`}>
                {spaOption && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Odnowa biologiczna / SPA</div>
                <div className="text-xs text-slate-400">Zmniejsza ryzyko kontuzji o 30%, poprawia morale. Dodatkowy koszt: <span className="text-blue-300">{spaCost.toLocaleString('pl-PL')} PLN</span></div>
              </div>
            </div>
          )}

          {/* Budget summary */}
          {selected && (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Koszt obozu:</span>
                <span className="text-white font-medium">{prices[selected].toLocaleString('pl-PL')} PLN</span>
              </div>
              {spaOption && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-400">Odnowa biologiczna:</span>
                  <span className="text-blue-300 font-medium">+ {spaCost.toLocaleString('pl-PL')} PLN</span>
                </div>
              )}
              <div className="flex justify-between text-sm mt-1 pt-1 border-t border-slate-700/50">
                <span className="text-slate-300 font-semibold">Łącznie:</span>
                <span className={`font-bold ${totalCost <= clubBudget ? 'text-green-400' : 'text-red-400'}`}>
                  {totalCost.toLocaleString('pl-PL')} PLN
                </span>
              </div>
              <div className="flex justify-between text-xs mt-1 text-slate-500">
                <span>Budżet klubu:</span>
                <span>{clubBudget.toLocaleString('pl-PL')} PLN</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/50 flex gap-3 justify-end">
          <button
            onClick={handleDecline}
            className="px-4 py-2 rounded-lg border border-slate-600/50 text-slate-400 hover:border-slate-500 hover:text-slate-300 text-sm transition-all"
          >
            Rezygnuję z obozu
          </button>
          <button
            disabled={!selected || totalCost > clubBudget}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
          >
            Potwierdzam wybór
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── PROGRAM MODAL ───────────────────────────────────────────────────────────

interface WinterCampProgramModalProps {
  campLocation: WinterCampLocation;
  assistantSuggestion: { program: WinterCampProgram; reason: string };
  onConfirm: (program: WinterCampProgram, intensity: WinterCampIntensity) => void;
}

const PROGRAM_LABELS: Record<WinterCampProgram, string> = {
  fitness:   'Kondycyjny',
  tactical:  'Taktyczny',
  technical: 'Techniczny',
  strength:  'Siłowy',
  recovery:  'Regeneracyjny',
};

const PROGRAM_DESC: Record<WinterCampProgram, string> = {
  fitness:   'Poprawa staminy i ogólnej kondycji fizycznej. Dobra baza pod wymagającą wiosnę.',
  tactical:  'Praca nad mentality, ustawieniem i wizją gry. Idealne przy problemach wynikowych.',
  technical: 'Doskonalenie techniki, dryblingi, jakość podań. Podnosi poziom gry indywidualnej.',
  strength:  'Siła, gra głową, obrona. Korzyści dla defensywnych i ofensywnych zawodników.',
  recovery:  'Priorytet: regeneracja. Redukcja długu zmęczeniowego. Brak zysku atrybutów, ale świeży start.',
};

const PROGRAM_ICONS: Record<WinterCampProgram, string> = {
  fitness:   '🏃',
  tactical:  '🧠',
  technical: '⚽',
  strength:  '💪',
  recovery:  '🛌',
};

const INTENSITY_LABELS: Record<WinterCampIntensity, string> = {
  light:    'Lekka',
  moderate: 'Umiarkowana',
  intense:  'Intensywna',
};

const INTENSITY_DESC: Record<WinterCampIntensity, { bonus: string; risk: string }> = {
  light:    { bonus: '+0–1 do atrybutu (małe szanse)',      risk: 'Niskie ryzyko kontuzji' },
  moderate: { bonus: '+0–1 do atrybutu (dobre szanse)',     risk: 'Umiarkowane ryzyko kontuzji' },
  intense:  { bonus: '+1–2 do atrybutu (wysokie szanse)',   risk: 'Wysokie ryzyko kontuzji!' },
};

const LOCATION_LABELS_SHORT: Record<WinterCampLocation, string> = {
  turkey: 'Turcja',
  cyprus: 'Cypr',
  greece: 'Grecja',
  poland: 'Polska',
};

export const WinterCampProgramModal: React.FC<WinterCampProgramModalProps> = ({
  campLocation,
  assistantSuggestion,
  onConfirm,
}) => {
  const [selectedProgram, setSelectedProgram] = useState<WinterCampProgram>(assistantSuggestion.program);
  const [selectedIntensity, setSelectedIntensity] = useState<WinterCampIntensity>('moderate');

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl mx-4 rounded-2xl border border-blue-500/30 bg-slate-900/95 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-blue-500/20 bg-blue-900/15">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="text-lg font-bold text-blue-300">Plan Obozu Zimowego</h2>
              <p className="text-xs text-blue-400/70">Lokalizacja: {LOCATION_LABELS_SHORT[campLocation]} · 2–15 stycznia</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Assistant suggestion */}
          <div className="rounded-xl border border-blue-500/25 bg-blue-900/15 p-3">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 text-sm mt-0.5">💬</span>
              <div>
                <div className="text-xs font-semibold text-blue-300 mb-1">Sugestia Asystenta Trenera</div>
                <p className="text-xs text-slate-300 leading-relaxed">{assistantSuggestion.reason}</p>
                <div className="mt-1.5 text-xs text-blue-400">
                  Polecany program: <span className="font-semibold">{PROGRAM_LABELS[assistantSuggestion.program]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Program selection */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Program treningowy</div>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(PROGRAM_LABELS) as WinterCampProgram[]).map(prog => {
                const isSelected = selectedProgram === prog;
                const isSuggested = assistantSuggestion.program === prog;
                return (
                  <button
                    key={prog}
                    onClick={() => setSelectedProgram(prog)}
                    className={`flex items-center gap-3 rounded-lg border p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-blue-400 bg-blue-900/25'
                        : 'border-slate-600/40 bg-slate-800/30 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-lg w-7 text-center">{PROGRAM_ICONS[prog]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                          {PROGRAM_LABELS[prog]}
                        </span>
                        {isSuggested && (
                          <span className="text-xs bg-blue-600/40 text-blue-300 px-1.5 py-0.5 rounded-full border border-blue-500/30">
                            Polecany
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">{PROGRAM_DESC[prog]}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      isSelected ? 'border-blue-400 bg-blue-500' : 'border-slate-600'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intensity selection */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Intensywność treningu</div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(INTENSITY_LABELS) as WinterCampIntensity[]).map(intens => {
                const isSelected = selectedIntensity === intens;
                const info = INTENSITY_DESC[intens];
                const riskColor = intens === 'light' ? 'text-green-400' : intens === 'moderate' ? 'text-yellow-400' : 'text-red-400';
                return (
                  <button
                    key={intens}
                    onClick={() => setSelectedIntensity(intens)}
                    className={`rounded-lg border p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-blue-400 bg-blue-900/25'
                        : 'border-slate-600/40 bg-slate-800/30 hover:border-slate-500'
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                      {INTENSITY_LABELS[intens]}
                    </div>
                    <div className="text-xs text-slate-400 leading-snug mb-1">{info.bonus}</div>
                    <div className={`text-xs font-medium ${riskColor}`}>{info.risk}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/50 flex justify-end">
          <button
            onClick={() => onConfirm(selectedProgram, selectedIntensity)}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all"
          >
            Zatwierdzam plan obozu
          </button>
        </div>
      </div>
    </div>
  );
};
