import React, { useState, useMemo } from 'react';
import { CalendarSlot, CompetitionType } from '../../types';

interface FriendlySchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  slots: CalendarSlot[];
}

const WEEKDAY_LABELS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

const MONTH_NAMES_PL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

function buildCalendarGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  // Monday-based week: 0=Mon, 6=Sun. JS getDay(): 0=Sun, 1=Mon...
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export const FriendlySchedulerModal: React.FC<FriendlySchedulerModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  slots,
}) => {
  const today = useMemo(() => new Date(currentDate), [currentDate]);

  // Build Set of date strings (YYYY-MM-DD) that fall within any FRIENDLY slot
  const friendlyDates = useMemo(() => {
    const set = new Set<string>();
    slots
      .filter(s => s.competition === CompetitionType.FRIENDLY)
      .forEach(s => {
        const start = new Date(s.start);
        const end = new Date(s.end);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        const cur = new Date(start);
        while (cur <= end) {
          set.add(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`);
          cur.setDate(cur.getDate() + 1);
        }
      });
    return set;
  }, [slots]);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (!isOpen) return null;

  const cells = buildCalendarGrid(viewYear, viewMonth);

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const dateKey = (day: number) => `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isSelected = (day: number) => selectedDate === dateKey(day);

  const isFriendlyDate = (day: number) => friendlyDates.has(dateKey(day));

  const handleDayClick = (day: number | null) => {
    if (!day || !isFriendlyDate(day)) return;
    setSelectedDate(prev => {
      const key = dateKey(day);
      return prev === key ? null : key;
    });
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return null;
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pl-PL', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 bg-slate-950 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-xl shadow-inner">
              🤝
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
                Zaplanuj Sparing
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-green-400 mt-1">
                Wybierz datę meczu towarzyskiego
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Calendar navigation */}
        <div className="px-8 pt-6">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={goToPrevMonth}
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-90 text-lg font-bold"
            >
              ‹
            </button>

            <div className="text-center">
              <div className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 mb-0.5">
                {viewYear}
              </div>
              <div className="text-2xl font-black italic uppercase tracking-tight text-white">
                {MONTH_NAMES_PL[viewMonth]}
              </div>
            </div>

            <button
              onClick={goToNextMonth}
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-90 text-lg font-bold"
            >
              ›
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAY_LABELS.map(label => (
              <div key={label} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-600 py-1">
                {label}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-2 pb-6">
            {cells.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} />;
              }

              const available = isFriendlyDate(day);
              const todayFlag = isToday(day);
              const sel = isSelected(day);

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => handleDayClick(day)}
                  disabled={!available}
                  className={`
                    relative aspect-square rounded-2xl border flex flex-col items-center justify-center
                    text-base font-black transition-all duration-150
                    ${!available
                      ? 'bg-transparent border-transparent text-slate-700 cursor-not-allowed'
                      : sel
                        ? 'bg-white border-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105'
                        : todayFlag
                          ? 'bg-white/20 border-white/50 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)] hover:bg-white/30 active:scale-95 cursor-pointer'
                          : 'bg-white/5 border-white/15 text-white hover:bg-white/15 hover:border-white/40 active:scale-95 cursor-pointer'
                    }
                  `}
                >
                  <span className="text-lg leading-none">{day}</span>
                  {todayFlag && !sel && available && (
                    <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-white/60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 border-t border-white/5 pt-5 flex items-center justify-between">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            {selectedDate
              ? <span className="text-green-400 font-black">{formatSelectedDate()}</span>
              : 'Brak wybranej daty'}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            >
              Anuluj
            </button>
            <button
              disabled={!selectedDate}
              onClick={() => { /* dalsze akcje w kolejnej iteracji */ }}
              className={`
                px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border
                ${selectedDate
                  ? 'bg-green-500/20 border-green-500/40 text-green-300 hover:bg-green-500/30'
                  : 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed'}
              `}
            >
              Dalej →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
