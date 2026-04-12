import React, { useState, useMemo } from 'react';
import { Club } from '../../types';
import { WEEKLY_MOTIVATION_TALKS, MotivationTalkOption } from '../../data/weekly_motivation_talks_pl';
import { WeeklyMotivationService, MotivationTalkResult } from '../../services/WeeklyMotivationService';

interface Props {
  club: Club;
  leaguePosition: number;
  teamCount: number;
  seed: number;
  onConfirm: (talk: MotivationTalkOption, result: MotivationTalkResult) => void;
  onClose: () => void;
}

const getMoraleLabel = (morale: number): { label: string; color: string } => {
  if (morale <= 20) return { label: 'BARDZO NISKIE', color: 'text-red-500' };
  if (morale <= 35) return { label: 'NISKIE', color: 'text-orange-400' };
  if (morale <= 64) return { label: 'NEUTRALNE', color: 'text-white' };
  if (morale <= 79) return { label: 'WYSOKIE', color: 'text-green-400' };
  return { label: 'BARDZO WYSOKIE', color: 'text-yellow-400' };
};

const getSeasonPhaseLabel = (played: number): string => {
  if (played < 5) return 'Początek sezonu';
  if (played <= 27) return 'Środek sezonu';
  return 'Końcówka sezonu';
};

const getFormSummary = (form: ('W' | 'R' | 'P')[]): { text: string; color: string } => {
  const recent = form.slice(-5);
  const wins = recent.filter(r => r === 'W').length;
  const losses = recent.filter(r => r === 'P').length;
  if (recent.length === 0) return { text: 'Brak wyników', color: 'text-slate-500' };
  if (wins >= 4) return { text: 'Znakomita forma', color: 'text-green-400' };
  if (wins >= 3) return { text: 'Dobra forma', color: 'text-emerald-400' };
  if (losses >= 4) return { text: 'Poważny kryzys', color: 'text-red-500' };
  if (losses >= 3) return { text: 'Słaba forma', color: 'text-orange-400' };
  return { text: 'Przeciętna forma', color: 'text-slate-300' };
};

export const WeeklyMotivationModal: React.FC<Props> = ({ club, leaguePosition, teamCount, seed, onConfirm, onClose }) => {
  const [selectedTalk, setSelectedTalk] = useState<MotivationTalkOption | null>(null);
  const [result, setResult] = useState<MotivationTalkResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const morale = club.morale ?? 50;
  const moraleInfo = getMoraleLabel(morale);
  const formInfo = getFormSummary(club.stats.form || []);
  const seasonPhase = getSeasonPhaseLabel(club.stats.played || 0);
  const ctx = WeeklyMotivationService.buildContext(club, leaguePosition, teamCount);

  const moraleBarColor = useMemo(() => {
    if (morale <= 20) return 'bg-red-500';
    if (morale <= 35) return 'bg-orange-400';
    if (morale <= 64) return 'bg-slate-400';
    if (morale <= 79) return 'bg-green-500';
    return 'bg-yellow-400';
  }, [morale]);

  const handleSelect = (talk: MotivationTalkOption) => {
    if (confirmed) return;
    setSelectedTalk(talk);
    setResult(null);
  };

  const handleConfirm = () => {
    if (!selectedTalk) return;
    const res = WeeklyMotivationService.calculate(selectedTalk, ctx, seed);
    setResult(res);
    setConfirmed(true);
  };

  const handleApply = () => {
    if (!selectedTalk || !result) return;
    onConfirm(selectedTalk, result);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-[900px] max-h-[90vh] flex flex-col bg-slate-950 border border-white/10 rounded-[40px] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden">

        {/* HEADER */}
        <div className="px-10 pt-8 pb-6 border-b border-white/10 bg-white/[0.02] shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1">ROZMOWA TYGODNIOWA</div>
              <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">Motywacja Drużyny</h2>
            </div>
            <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors text-2xl font-black leading-none mt-1">✕</button>
          </div>

          {/* SYTUACJA DRUŻYNY */}
          <div className="mt-5 flex gap-4">
            {/* Morale */}
            <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Morale szatni</div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                <div className={`h-full ${moraleBarColor} rounded-full`} style={{ width: `${morale}%` }} />
              </div>
              <span className={`text-[11px] font-black uppercase tracking-widest ${moraleInfo.color}`}>{moraleInfo.label}</span>
            </div>
            {/* Forma */}
            <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Ostatnie wyniki</div>
              <div className="flex gap-1 mb-2">
                {(club.stats.form || []).slice(-5).map((r, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black
                    ${r === 'W' ? 'bg-emerald-500/20 text-emerald-300' : r === 'R' ? 'bg-slate-500/20 text-slate-400' : 'bg-red-500/20 text-red-400'}`}>
                    {r}
                  </div>
                ))}
                {(club.stats.form || []).length === 0 && <span className="text-[9px] text-slate-600">-</span>}
              </div>
              <span className={`text-[11px] font-black uppercase tracking-widest ${formInfo.color}`}>{formInfo.text}</span>
            </div>
            {/* Tabela */}
            <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Miejsce w tabeli</div>
              <div className="text-3xl font-black italic text-white mb-1">{leaguePosition > 0 ? `${leaguePosition}.` : '—'}</div>
         
            </div>
            {/* Faza sezonu */}
            <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Faza sezonu</div>
              <div className="text-[13px] font-black italic text-white mt-1">{seasonPhase}</div>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">{club.stats.played || 0} meczów</span>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 flex gap-0 min-h-0 overflow-hidden">

          {/* LISTA OPCJI */}
          <div className="w-[55%] overflow-y-auto custom-scrollbar border-r border-white/5 py-4 px-6">
            <div className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-600 mb-3 px-2">Wybierz podejście</div>
            <div className="flex flex-col gap-2">
              {WEEKLY_MOTIVATION_TALKS.map(talk => {
                const isSelected = selectedTalk?.type === talk.type;
                return (
                  <button
                    key={talk.type}
                    onClick={() => handleSelect(talk)}
                    disabled={confirmed}
                    className={`text-left px-5 py-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-blue-500/15 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/15'
                    } ${confirmed ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className={`text-[14px] font-black italic uppercase tracking-tighter mb-1 ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                      {talk.title}
                    </div>
                    <div className="text-[14px] text-slate-500 leading-relaxed line-clamp-2">{talk.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PANEL PRAWY */}
          <div className="flex-1 flex flex-col p-6 gap-4">
            {!selectedTalk && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-slate-700">
                  <div className="text-5xl mb-4 opacity-30">💬</div>
                  <div className="text-[14px] font-black uppercase tracking-widest">Wybierz podejście z listy</div>
                </div>
              </div>
            )}

            {selectedTalk && !confirmed && (
              <div className="flex-1 flex flex-col gap-4">
                <div className="bg-white/[0.03] rounded-[24px] border border-white/10 p-6">
                  <div className="text-[14px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Wybrane podejście</div>
                  <div className="text-xl font-black italic uppercase tracking-tight text-white mb-3">{selectedTalk.title}</div>
                  <p className="text-[14px] text-slate-400 leading-relaxed">{selectedTalk.description}</p>
                </div>
<button
                  onClick={handleConfirm}
                  className="mt-auto px-8 py-4 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-[11px] font-black uppercase italic tracking-widest text-blue-300 hover:bg-blue-600/30 hover:border-blue-400 transition-all active:scale-95 shadow-lg"
                >
                  Przeprowadź rozmowę →
                </button>
              </div>
            )}

            {confirmed && result && selectedTalk && (
              <div className="flex-1 flex flex-col gap-4">
                <div className={`rounded-[24px] border p-6 ${result.isPositive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className={`text-[9px] font-black uppercase tracking-[0.4em] mb-2 ${result.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {result.isPositive ? 'Reakcja pozytywna' : 'Reakcja negatywna'}
                  </div>
                  <p className={`text-[12px] leading-relaxed font-medium ${result.isPositive ? 'text-emerald-200' : 'text-red-200'}`}>
                    {result.reactionText}
                  </p>
                </div>
<button
                  onClick={handleApply}
                  className="mt-auto px-8 py-4 rounded-2xl bg-white text-slate-900 text-[11px] font-black uppercase italic tracking-widest hover:scale-105 transition-all active:scale-95 shadow-xl"
                >
                  Zatwierdź i zamknij
                </button>
              </div>
            )}
          </div>
        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 3px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
        `}</style>
      </div>
    </div>
  );
};
