import React, { useState } from 'react';
import { SummerCampLocation, SummerCampProgram, SummerCampIntensity, SummerCampState } from '../../types';

// ─── LOCATION MODAL ──────────────────────────────────────────────────────────

interface SummerCampLocationModalProps {
  prices: SummerCampState['locationPrices'];
  spaCost: number;
  clubBudget: number;
  onConfirm: (location: SummerCampLocation | null, cost: number, spaOption: boolean) => void;
}

const LOCATION_LABELS: Record<SummerCampLocation, string> = {
  poland:         'Polska',
  czech_republic: 'Czechy (Praga)',
  slovakia:       'Słowacja (Bratysława)',
  austria:        'Austria (Wiedeń)',
  switzerland:    'Szwajcaria (Zurych)',
};

const LOCATION_FLAGS: Record<SummerCampLocation, string> = {
  poland:         '🇵🇱',
  czech_republic: '🇨🇿',
  slovakia:       '🇸🇰',
  austria:        '🇦🇹',
  switzerland:    '🇨🇭',
};

const LOCATION_DESC: Record<SummerCampLocation, string> = {
  poland:         'Tańsza opcja krajowa. Blisko bazy, umiarkowany klimat, bez konieczności podróży zagranicznej.',
  czech_republic: 'Przyjazny klimat, dobra infrastruktura treningowa, krótki dojazd. Solidna opcja na letnie przygotowania.',
  slovakia:       'Umiarkowane temperatury, spokojne otoczenie, dobre warunki do solidnej pracy treningowej.',
  austria:        'Alpejski klimat — idealne warunki latem. Nowoczesna infrastruktura i wysoki poziom spartnerów sparingowych.',
  switzerland:    'Prestiżowe ośrodki treningowe w alpejskich kurortach. Doskonałe warunki klimatyczne i najwyższy standard.',
};

export const SummerCampLocationModal: React.FC<SummerCampLocationModalProps> = ({
  prices,
  spaCost,
  clubBudget,
  onConfirm,
}) => {
  const [selected, setSelected] = useState<SummerCampLocation | null>(null);
  const [spaOption, setSpaOption] = useState(false);

  const totalCost = selected ? prices[selected] + (spaOption ? spaCost : 0) : 0;
  const canAfford = (loc: SummerCampLocation) => clubBudget >= prices[loc];

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(selected, totalCost, spaOption);
  };

  const handleDecline = () => {
    onConfirm(null, 0, false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl mx-4 rounded-2xl border border-green-500/30 bg-slate-900/95 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-green-500/20 bg-green-900/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⛺</span>
            <div>
              <h2 className="text-lg font-bold text-green-300">Propozycja Zarządu: Obóz Letni</h2>
              <p className="text-xs text-green-400/70">14 – 28 czerwca · Wybierz lokalizację</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-slate-300">
            Zarząd proponuje zorganizowanie letniego obozu przygotowawczego przed nowym sezonem. Wybierz destynację lub zrezygnuj z obozu.
          </p>

          {/* Location cards */}
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(prices) as SummerCampLocation[]).map(loc => {
              const affordable = canAfford(loc);
              const isSelected = selected === loc;
              return (
                <button
                  key={loc}
                  disabled={!affordable}
                  onClick={() => affordable && setSelected(loc)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? 'border-green-400 bg-green-900/30 shadow-lg shadow-green-500/10'
                      : affordable
                      ? 'border-slate-600/50 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
                      : 'border-slate-700/30 bg-slate-900/30 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{LOCATION_FLAGS[loc]}</span>
                    <span className={`font-semibold text-sm ${isSelected ? 'text-green-300' : 'text-white'}`}>
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
            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
          >
            Potwierdzam wybór
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── PROGRAM MODAL ───────────────────────────────────────────────────────────

interface SummerCampProgramModalProps {
  campLocation: SummerCampLocation;
  assistantSuggestion: { program: SummerCampProgram; reason: string };
  onConfirm: (program: SummerCampProgram, intensity: SummerCampIntensity) => void;
}

const PROGRAM_LABELS: Record<SummerCampProgram, string> = {
  fitness:   'Kondycyjny',
  tactical:  'Taktyczny',
  technical: 'Techniczny',
  strength:  'Siłowy',
  recovery:  'Regeneracyjny',
};

const PROGRAM_DESC: Record<SummerCampProgram, string> = {
  fitness:   'Poprawa staminy i ogólnej kondycji fizycznej. Dobra baza pod wymagający nowy sezon.',
  tactical:  'Praca nad mentality, ustawieniem i wizją gry. Idealne przy problemach wynikowych.',
  technical: 'Doskonalenie techniki, dryblingi, jakość podań. Podnosi poziom gry indywidualnej.',
  strength:  'Siła, gra głową, obrona. Korzyści dla defensywnych i ofensywnych zawodników.',
  recovery:  'Priorytet: regeneracja. Redukcja długu zmęczeniowego. Brak zysku atrybutów, ale świeży start przed sezonem.',
};

const PROGRAM_ICONS: Record<SummerCampProgram, string> = {
  fitness:   '🏃',
  tactical:  '🧠',
  technical: '⚽',
  strength:  '💪',
  recovery:  '🛌',
};

const INTENSITY_LABELS: Record<SummerCampIntensity, string> = {
  light:    'Lekka',
  moderate: 'Umiarkowana',
  intense:  'Intensywna',
};

const INTENSITY_DESC: Record<SummerCampIntensity, { bonus: string; risk: string }> = {
  light:    { bonus: '+0–1 do atrybutu (małe szanse)',      risk: 'Niskie ryzyko kontuzji' },
  moderate: { bonus: '+0–1 do atrybutu (dobre szanse)',     risk: 'Umiarkowane ryzyko kontuzji' },
  intense:  { bonus: '+1–2 do atrybutu (wysokie szanse)',   risk: 'Wysokie ryzyko kontuzji!' },
};

const LOCATION_LABELS_SHORT: Record<SummerCampLocation, string> = {
  poland:         'Polska',
  czech_republic: 'Czechy',
  slovakia:       'Słowacja',
  austria:        'Austria',
  switzerland:    'Szwajcaria',
};

export const SummerCampProgramModal: React.FC<SummerCampProgramModalProps> = ({
  campLocation,
  assistantSuggestion,
  onConfirm,
}) => {
  const [selectedProgram, setSelectedProgram] = useState<SummerCampProgram>(assistantSuggestion.program);
  const [selectedIntensity, setSelectedIntensity] = useState<SummerCampIntensity>('moderate');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl mx-4 rounded-2xl border border-green-500/30 bg-slate-900/95 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-green-500/20 bg-green-900/15">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="text-lg font-bold text-green-300">Plan Obozu Letniego</h2>
              <p className="text-xs text-green-400/70">Lokalizacja: {LOCATION_LABELS_SHORT[campLocation]} · 14–28 czerwca</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Assistant suggestion */}
          <div className="rounded-xl border border-green-500/25 bg-green-900/15 p-3">
            <div className="flex items-start gap-2">
              <span className="text-green-400 text-sm mt-0.5">💬</span>
              <div>
                <div className="text-xs font-semibold text-green-300 mb-1">Sugestia Asystenta Trenera</div>
                <p className="text-xs text-slate-300 leading-relaxed">{assistantSuggestion.reason}</p>
                <div className="mt-1.5 text-xs text-green-400">
                  Polecany program: <span className="font-semibold">{PROGRAM_LABELS[assistantSuggestion.program]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Program selection */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Program treningowy</div>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(PROGRAM_LABELS) as SummerCampProgram[]).map(prog => {
                const isSelected = selectedProgram === prog;
                const isSuggested = assistantSuggestion.program === prog;
                return (
                  <button
                    key={prog}
                    onClick={() => setSelectedProgram(prog)}
                    className={`flex items-center gap-3 rounded-lg border p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-green-400 bg-green-900/25'
                        : 'border-slate-600/40 bg-slate-800/30 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-lg w-7 text-center">{PROGRAM_ICONS[prog]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-green-300' : 'text-white'}`}>
                          {PROGRAM_LABELS[prog]}
                        </span>
                        {isSuggested && (
                          <span className="text-xs bg-green-600/40 text-green-300 px-1.5 py-0.5 rounded-full border border-green-500/30">
                            Polecany
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">{PROGRAM_DESC[prog]}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      isSelected ? 'border-green-400 bg-green-500' : 'border-slate-600'
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
              {(Object.keys(INTENSITY_LABELS) as SummerCampIntensity[]).map(intens => {
                const isSelected = selectedIntensity === intens;
                const info = INTENSITY_DESC[intens];
                const riskColor = intens === 'light' ? 'text-green-400' : intens === 'moderate' ? 'text-yellow-400' : 'text-red-400';
                return (
                  <button
                    key={intens}
                    onClick={() => setSelectedIntensity(intens)}
                    className={`rounded-lg border p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-green-400 bg-green-900/25'
                        : 'border-slate-600/40 bg-slate-800/30 hover:border-slate-500'
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${isSelected ? 'text-green-300' : 'text-white'}`}>
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
            className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-all"
          >
            Zatwierdzam plan obozu
          </button>
        </div>
      </div>
    </div>
  );
};
