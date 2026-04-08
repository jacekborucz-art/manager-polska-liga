import React, { useState, useMemo, useRef } from 'react';
import { CalendarSlot, CompetitionType, Club, PendingFriendlyRequest } from '../../types';

interface FriendlySchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  slots: CalendarSlot[];
  clubs: Club[];
  userTeamId: string;
  pendingFriendlyRequests: PendingFriendlyRequest[];
  onConfirmFriendly: (req: Omit<PendingFriendlyRequest, 'id'>) => void;
}

type Venue = 'HOME' | 'AWAY' | 'NEUTRAL';

interface Suggestion {
  club: Club;
  venue: Venue;
  acceptChance: number;  // 0-100
}

const WEEKDAY_LABELS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

const MONTH_NAMES_PL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

const VENUE_LABELS: Record<Venue, { label: string; short: string; color: string; bg: string }> = {
  HOME:    { label: 'U siebie',          short: 'DOM',     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  AWAY:    { label: 'Na wyjeździe',       short: 'WYJ',     color: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/20' },
  NEUTRAL: { label: 'Teren neutralny',    short: 'NEU',     color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
};

function buildCalendarGrid(year: number, month: number): (number | null)[] {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pickVenueRandom(rand: () => number): Venue {
  const r = rand();
  if (r < 0.35) return 'HOME';
  if (r < 0.65) return 'AWAY';
  return 'NEUTRAL';
}

// HOME = gracz gra u siebie → rywal musi przyjechać → niższe szanse
// AWAY = gracz jedzie do rywala → rywal gra u siebie → wyższe szanse
// NEUTRAL = teren neutralny → ~50/50
function calcAcceptChance(userRep: number, targetRep: number, venue: Venue, isManual = false): number {
  const repDiff = targetRep - userRep; // positive → opponent stronger
  let base: number;
  if (venue === 'HOME') base = 35;         // rywal musi podróżować → mniejsza chęć
  else if (venue === 'NEUTRAL') base = 52; // teren neutralny → zbliżone do 50/50
  else base = 70;                          // AWAY: rywal gra u siebie → chętny
  base -= repDiff * 12;                    // silniejszy rywal = mniej chętny
  const cap = isManual ? 50 : 95;
  return Math.max(5, Math.min(cap, Math.round(base)));
}

function isPolishClub(club: Club): boolean {
  return club.leagueId.startsWith('L_PL') || club.country === 'POL' || !club.country;
}

export const FriendlySchedulerModal: React.FC<FriendlySchedulerModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  slots,
  clubs,
  userTeamId,
  pendingFriendlyRequests,
  onConfirmFriendly,
}) => {
  const today = useMemo(() => new Date(currentDate), [currentDate]);
  const userClub = useMemo(() => clubs.find(c => c.id === userTeamId), [clubs, userTeamId]);

  // Minimum date: tomorrow (at least 1 day in advance for any team)
  const minDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [today]);

  const daysUntilDate = (dateStr: string): number => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const match = new Date(y, m - 1, d);
    match.setHours(0, 0, 0, 0);
    const t = new Date(today);
    t.setHours(0, 0, 0, 0);
    return Math.round((match.getTime() - t.getTime()) / 86400000);
  };

  // ---------- step 1 state ----------
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ---------- step 2 state ----------
  const [step, setStep] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualVenue, setManualVenue] = useState<Venue>('AWAY');
  const [selectedOpponent, setSelectedOpponent] = useState<{ club: Club; venue: Venue; chance: number } | null>(null);

  // Stable suggestion seed based on modal mount (randomised once per open)
  const seedRef = useRef(Math.floor(Math.random() * 999999));

  // ---------- friendly date set ----------
  const friendlyDates = useMemo(() => {
    const set = new Set<string>();
    slots.filter(s => s.competition === CompetitionType.FRIENDLY).forEach(s => {
      const start = new Date(s.start); start.setHours(0, 0, 0, 0);
      const end   = new Date(s.end);   end.setHours(0, 0, 0, 0);
      const cur = new Date(start);
      while (cur <= end) {
        set.add(`${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return set;
  }, [slots]);

  // ---------- suggested clubs (drawn once) ----------
  const suggestedList = useMemo((): Suggestion[] => {
    if (!userClub) return [];
    const userRep = userClub.reputation;
    const rand = seededRandom(seedRef.current);

    const pool = clubs.filter(c =>
      c.id !== userTeamId &&
      Math.abs(c.reputation - userRep) <= 2
    );

    // Prefer Polish clubs (60% of list), rest European
    const polish  = pool.filter(c => isPolishClub(c));
    const foreign = pool.filter(c => !isPolishClub(c));

    const shuffled = (arr: Club[]) => [...arr].sort(() => rand() - 0.5);
    const pickN    = (arr: Club[], n: number) => shuffled(arr).slice(0, n);

    const polishCount  = Math.min(6, polish.length);
    const foreignCount = Math.min(12 - polishCount, foreign.length);

    const picked = [...pickN(polish, polishCount), ...pickN(foreign, foreignCount)]
      .sort(() => rand() - 0.5)
      .slice(0, 12);

    return picked.map(club => {
      const venue = pickVenueRandom(rand);
      return { club, venue, acceptChance: calcAcceptChance(userRep, club.reputation, venue) };
    });
  }, [clubs, userTeamId, userClub]);

  // ---------- manual search results ----------
  const manualResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return clubs
      .filter(c => c.id !== userTeamId && c.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [clubs, userTeamId, searchQuery]);

  if (!isOpen) return null;

  // ---------- helpers ----------
  const cells        = buildCalendarGrid(viewYear, viewMonth);
  const dateKey      = (day: number) => `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const isSelected   = (day: number) => selectedDate === dateKey(day);
  const isFriendly   = (day: number) => friendlyDates.has(dateKey(day));
  const isToday      = (day: number) => day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  // Pending = already has a sent proposal waiting for response
  const hasPending   = (day: number) => pendingFriendlyRequests.some(r => r.proposedDate === dateKey(day));

  // A date is bookable if: it's a friendly slot, at least 1 day in the future, no pending request yet
  const isBookable   = (day: number) => {
    if (!isFriendly(day)) return false;
    if (hasPending(day)) return false;
    const [y, m, d] = [viewYear, viewMonth, day];
    const matchDate = new Date(y, m, d);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate >= minDate;
  };

  const handleDayClick = (day: number | null) => {
    if (!day || !isBookable(day)) return;
    setSelectedDate(prev => { const k = dateKey(day); return prev === k ? null : k; });
  };

  const formatDate = (str: string) => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m-1, d).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const manualChance = (club: Club) =>
    calcAcceptChance(userClub?.reputation ?? 5, club.reputation, manualVenue, true);

  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const getChanceColor = (chance: number) => {
    if (chance >= 75) return 'text-emerald-400';
    if (chance >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const venueInfo = VENUE_LABELS;

  // ---------- render ----------
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

      <div className="relative z-10 w-full mx-4 bg-slate-950 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
           style={{ maxWidth: step === 1 ? '42rem' : '60rem', maxHeight: '90vh' }}>

        {/* ─── HEADER ─── */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-xl shadow-inner">
              🤝
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
                Zaplanuj Sparing
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-green-400 mt-1">
                {step === 1 ? 'Krok 1/2 — Wybierz datę' : `Krok 2/2 — Wybierz przeciwnika · ${selectedDate ? formatDate(selectedDate) : ''}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => { setStep(1); setSelectedOpponent(null); }}
                className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
              >
                ← Wróć
              </button>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90 text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ─── STEP 1: CALENDAR ─── */}
        {step === 1 && (
          <>
            <div className="px-8 pt-6 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-5">
                <button onClick={goToPrevMonth} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-90 text-lg font-bold">‹</button>
                <div className="text-center">
                  <div className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 mb-0.5">{viewYear}</div>
                  <div className="text-2xl font-black italic uppercase tracking-tight text-white">{MONTH_NAMES_PL[viewMonth]}</div>
                </div>
                <button onClick={goToNextMonth} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-90 text-lg font-bold">›</button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {WEEKDAY_LABELS.map(l => (
                  <div key={l} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-600 py-1">{l}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 pb-6">
                {cells.map((day, idx) => {
                  if (!day) return <div key={`e-${idx}`} />;
                  const avail   = isBookable(day);
                  const pending = hasPending(day);
                  const sel     = isSelected(day);
                  const tod     = isToday(day);
                  return (
                    <button
                      key={`d-${day}`}
                      onClick={() => handleDayClick(day)}
                      disabled={!avail}
                      className={`
                        relative aspect-square rounded-2xl border flex flex-col items-center justify-center
                        text-base font-black transition-all duration-150
                        ${!avail && !pending
                          ? 'bg-transparent border-transparent text-slate-700 cursor-not-allowed'
                          : pending
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 cursor-not-allowed'
                            : sel
                              ? 'bg-white border-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105'
                              : tod
                                ? 'bg-white/20 border-white/50 text-white hover:bg-white/30 active:scale-95 cursor-pointer'
                                : 'bg-white/5 border-white/15 text-white hover:bg-white/15 hover:border-white/40 active:scale-95 cursor-pointer'
                        }
                      `}
                    >
                      <span className="text-lg leading-none">{day}</span>
                      {pending && <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/80" title="Oczekuje na odpowiedź" />}
                      {tod && !sel && avail && !pending && <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-white/60" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-8 pb-7 border-t border-white/5 pt-5 flex items-center justify-between shrink-0">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                {selectedDate
                  ? <span className="text-green-400 font-black">{formatDate(selectedDate)}</span>
                  : 'Wybierz datę sparingu'}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={onClose} className="px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95">
                  Anuluj
                </button>
                <button
                  disabled={!selectedDate}
                  onClick={() => { setStep(2); setSelectedOpponent(null); setSearchQuery(''); }}
                  className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${selectedDate ? 'bg-green-500/20 border-green-500/40 text-green-300 hover:bg-green-500/30' : 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed'}`}
                >
                  Dalej →
                </button>
              </div>
            </div>
          </>
        )}

        {/* ─── STEP 2: OPPONENT SELECTION ─── */}
        {step === 2 && (
          <div className="flex flex-1 overflow-hidden">

            {/* Left: suggestions */}
            <div className="flex-1 overflow-y-auto p-6 border-r border-white/5">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">
                🎲 Sugerowane drużyny
              </div>
              <div className="space-y-2">
                {suggestedList.map(({ club, venue, acceptChance }) => {
                  const vInfo = venueInfo[venue];
                  const selected = selectedOpponent?.club.id === club.id && selectedOpponent.venue === venue;
                  return (
                    <button
                      key={`sug-${club.id}`}
                      onClick={() => setSelectedOpponent({ club, venue, chance: acceptChance })}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-150 active:scale-[0.99] ${
                        selected
                          ? 'bg-white/10 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                          : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/15'
                      }`}
                    >
                      {/* Color swatch */}
                      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 flex flex-col shadow-inner border border-white/10">
                        <div className="flex-1" style={{ backgroundColor: club.colorsHex[0] }} />
                        <div className="flex-1" style={{ backgroundColor: club.colorsHex[1] || club.colorsHex[0] }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-black text-white uppercase italic truncate leading-tight">{club.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${vInfo.bg} ${vInfo.color}`}>{vInfo.short}</span>
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{vInfo.label}</span>
                        </div>
                      </div>

                      {selected && <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: manual search */}
            <div className="w-72 flex flex-col overflow-hidden p-6">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">
                🔍 Inna drużyna
              </div>

              {/* Venue selector */}
              <div className="flex gap-1.5 mb-4">
                {(['HOME', 'AWAY', 'NEUTRAL'] as Venue[]).map(v => {
                  const vi = venueInfo[v];
                  return (
                    <button
                      key={v}
                      onClick={() => setManualVenue(v)}
                      className={`flex-1 py-2 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${
                        manualVenue === v
                          ? `${vi.bg} ${vi.color} border-current`
                          : 'bg-black/20 border-white/5 text-slate-600 hover:border-white/10'
                      }`}
                    >
                      {vi.short}
                    </button>
                  );
                })}
              </div>

              {/* Search input */}
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Szukaj drużyny..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-[11px] font-bold placeholder-slate-600 outline-none focus:border-white/25 focus:bg-white/8 transition-all mb-3"
              />

              {/* Results */}
              <div className="flex-1 overflow-y-auto space-y-1.5">
                {searchQuery.length < 2 && (
                  <p className="text-[10px] text-slate-600 font-bold text-center mt-4 px-2">Wpisz min. 2 znaki aby wyszukać drużynę</p>
                )}
                {manualResults.map(club => {
                  const chance = manualChance(club);
                  const vInfo = venueInfo[manualVenue];
                  const selected = selectedOpponent?.club.id === club.id;
                  return (
                    <button
                      key={`man-${club.id}`}
                      onClick={() => setSelectedOpponent({ club, venue: manualVenue, chance })}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border transition-all active:scale-[0.99] ${
                        selected
                          ? 'bg-white/10 border-white/30'
                          : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-xl overflow-hidden shrink-0 flex flex-col border border-white/10">
                        <div className="flex-1" style={{ backgroundColor: club.colorsHex[0] }} />
                        <div className="flex-1" style={{ backgroundColor: club.colorsHex[1] || club.colorsHex[0] }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black text-white uppercase italic truncate">{club.name}</div>
                        <span className={`text-[8px] font-black ${vInfo.color}`}>{vInfo.label}</span>
                      </div>
                      {selected && <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── FOOTER (step 2) ─── */}
        {step === 2 && (
          <div className="px-6 pb-6 pt-4 border-t border-white/5 shrink-0 flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              {selectedOpponent
                ? (() => {
                    const days = selectedDate ? daysUntilDate(selectedDate) : 99;
                    const isForeign = selectedOpponent && !isPolishClub(selectedOpponent.club);
                    const tooClose = isForeign && days < 3;
                    return (
                      <span className="font-black">
                        <span className={tooClose ? 'text-rose-400' : 'text-green-400'}>{selectedOpponent.club.name}</span>
                        {' · '}{venueInfo[selectedOpponent.venue].label}
                        {tooClose && (
                          <span className="block text-[10px] text-rose-400 mt-0.5 normal-case tracking-normal">
                            ⚠ Drużyna zagraniczna — wymagane min. 3 dni przed meczem
                          </span>
                        )}
                      </span>
                    );
                  })()
                : 'Wybierz przeciwnika'}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95">
                Anuluj
              </button>
              <button
                disabled={(() => {
                  if (!selectedOpponent || !selectedDate) return true;
                  const days = daysUntilDate(selectedDate);
                  if (!isPolishClub(selectedOpponent.club) && days < 3) return true;
                  return false;
                })()}
                onClick={() => {
                  if (!selectedOpponent || !selectedDate) return;
                  const responseD = new Date(today);
                  responseD.setDate(responseD.getDate() + 1);
                  const responseDate = `${responseD.getFullYear()}-${String(responseD.getMonth()+1).padStart(2,'0')}-${String(responseD.getDate()).padStart(2,'0')}`;
                  onConfirmFriendly({
                    proposedDate: selectedDate,
                    opponentClubId: selectedOpponent.club.id,
                    venue: selectedOpponent.venue,
                    chance: selectedOpponent.chance,
                    responseDate,
                  });
                  onClose();
                }}
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${
                  (() => {
                    if (!selectedOpponent || !selectedDate) return 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed';
                    const days = daysUntilDate(selectedDate);
                    if (!isPolishClub(selectedOpponent.club) && days < 3) return 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed';
                    return 'bg-green-500/20 border-green-500/40 text-green-300 hover:bg-green-500/30';
                  })()
                }`}
              >
                Wyślij propozycję →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
