
import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState, StaffRole } from '../../types';
import { STAFF_ROLE_ATTRS } from '../../services/StaffGenerationService';

type StatusFilter = 'ALL' | 'FREE_AGENT' | 'CONTRACT';
type NegPhase = 'proposal' | 'staff_counter' | 'confirm_payment' | 'result';

const ROLE_LABELS: Record<StaffRole, string> = {
  [StaffRole.ASSISTANT_COACH]:  'Asystent trenera',
  [StaffRole.GOALKEEPER_COACH]: 'Trener bramkarzy',
  [StaffRole.FITNESS_COACH]:    'Trener mot.',
  [StaffRole.VIDEO_ANALYST]:    'Analityk video',
  [StaffRole.PHYSIOTHERAPIST]:  'Fizjoterapeuta',
  [StaffRole.CLUB_DOCTOR]:      'Lekarz',
};

const ROLE_LABELS_FULL: Record<StaffRole, string> = {
  [StaffRole.ASSISTANT_COACH]:  'Asystent trenera',
  [StaffRole.GOALKEEPER_COACH]: 'Trener bramkarzy',
  [StaffRole.FITNESS_COACH]:    'Trener przygotowania motorycznego',
  [StaffRole.VIDEO_ANALYST]:    'Analityk video',
  [StaffRole.PHYSIOTHERAPIST]:  'Fizjoterapeuta',
  [StaffRole.CLUB_DOCTOR]:      'Lekarz klubowy',
};

const ROLE_COLORS: Record<StaffRole, string> = {
  [StaffRole.ASSISTANT_COACH]:  'text-blue-400',
  [StaffRole.GOALKEEPER_COACH]: 'text-yellow-400',
  [StaffRole.FITNESS_COACH]:    'text-emerald-400',
  [StaffRole.VIDEO_ANALYST]:    'text-purple-400',
  [StaffRole.PHYSIOTHERAPIST]:  'text-rose-400',
  [StaffRole.CLUB_DOCTOR]:      'text-cyan-400',
};

const ATTR_HEADER_LABELS: Record<string, string> = {
  offensiveTactics: 'T-OFFEN',
  defensiveTactics: 'T-DEFEN',
  motivation: 'MOTYW',
  communication: 'KOMUN',
  opponentAnalysis: 'A-PRZEC',
  individualWork: 'P-INDYW',
  dressingRoom: 'Z-SZAT',
  gkTechnique: 'T-BRAM',
  positioning: 'UST-BRAM',
  footwork: 'G-NOG',
  reflexes: 'REF-REAK',
  mentalTraining: 'T-MENT',
  defenseComm: 'K-OBR',
  penaltyAnalysis: 'A-KARN',
  periodization: 'PER-TREN',
  fitnessTests: 'T-WYDOL',
  nutrition: 'DIET',
  injuryPrevention: 'P-KONT',
  recovery: 'REGEN',
  strengthTraining: 'T-SIŁ',
  speedTraining: 'T-SZYB',
  videoAnalysis: 'A-VIDEO',
  tactics: 'TAKT',
  statsAnalysis: 'A-STAT',
  scouting: 'SKAUT',
  reporting: 'RAPORT',
  software: 'OPR-ANAL',
  setPieces: 'A-STFRAG',
  sportsMassage: 'M-SPORT',
  rehabilitation: 'REHAB',
  muscleInjuries: 'L-KMIĘŚ',
  taping: 'TAPING',
  manualTherapy: 'T-MAN',
  matchRecovery: 'R-MECZ',
  diagnostics: 'DIAGN',
  sportsSurgery: 'CH-SPORT',
  pharmacology: 'FARMA',
  cardiology: 'KARD-SPORT',
  injuryTreatment: 'L-KONT',
  medicalTests: 'B-MED',
  healthManagement: 'Z-ZDROW',
};

const REGION_LABELS: Record<string, string> = {
  POLAND: 'Polska', ENGLAND: 'Anglia', GERMANY: 'Niemcy', FRANCE: 'Francja',
  SPAIN: 'Hiszpania', ITALY: 'Włochy', BALKANS: 'Bałkany', CZ_SK: 'Czechy/Słowacja',
  SCANDINAVIA: 'Skandynawia', EX_USSR: 'Europa Wschodnia', BALTIC: 'Kraje Bałtyckie',
  ROMANIA: 'Rumunia', SOUTH_AMERICA: 'Ameryka Płd.', AFRICA: 'Afryka',
  NORTH_AMERICA: 'Ameryka Płn.', ASIA: 'Azja', MIDDLE_EAST: 'Bliski Wschód',
  PORTUGAL: 'Portugalia', NETHERLANDS: 'Holandia', BELGIUM: 'Belgia',
};

const MONTHS_PL = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];

const _persisted = {
  searchTerm: '',
  roleFilter: 'ALL' as StaffRole | 'ALL',
  ageMin: 22,
  ageMax: 70,
  nationalityFilter: 'ALL',
  statusFilter: 'ALL' as StatusFilter,
};

// staffId → data wygaśnięcia blokady (ISO string)
const _offerBlocks = new Map<string, string>();

type InterestLevel = 'VERY_HIGH' | 'HIGH' | 'DOUBTFUL' | 'LOW' | 'NONE';

const INTEREST_LABELS: Record<InterestLevel, string> = {
  VERY_HIGH: 'Bardzo wysoka',
  HIGH:      'Wysoka',
  DOUBTFUL:  'Wątpliwa',
  LOW:       'Niska',
  NONE:      'Brak',
};

const INTEREST_COLORS: Record<InterestLevel, string> = {
  VERY_HIGH: 'text-emerald-400',
  HIGH:      'text-lime-400',
  DOUBTFUL:  'text-yellow-400',
  LOW:       'text-orange-400',
  NONE:      'text-red-500',
};

const INTEREST_FREE_ACCEPT: Record<InterestLevel, number> = {
  VERY_HIGH: 0.70,
  HIGH:      0.45,
  DOUBTFUL:  0.20,
  LOW:       0.08,
  NONE:      0.02,
};

const INTEREST_MULTIPLIER: Record<InterestLevel, number> = {
  VERY_HIGH: 1.5,
  HIGH:      1.0,
  DOUBTFUL:  0.5,
  LOW:       0.2,
  NONE:      0.05,
};

function getStaffOverall(attrs: Record<string, number>): number {
  const vals = Object.values(attrs);
  if (vals.length === 0) return 8;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function getInterestLevel(attrs: Record<string, number>, userClubRep: number): InterestLevel {
  const overall = getStaffOverall(attrs);
  const minRep = overall >= 17 ? 8 : overall >= 14 ? 6 : overall >= 10 ? 4 : overall >= 6 ? 2 : 1;
  const gap = userClubRep - minRep;
  if (gap >= 2)  return 'VERY_HIGH';
  if (gap >= 0)  return 'HIGH';
  if (gap >= -1) return 'DOUBTFUL';
  if (gap >= -3) return 'LOW';
  return 'NONE';
}

export const StaffSearchView: React.FC = () => {
  const { staffMembers, clubs, navigateTo, currentDate, userTeamId, hireStaffMember } = useGame();

  const [searchTerm, setSearchTerm] = useState(_persisted.searchTerm);
  const [roleFilter, setRoleFilter] = useState<StaffRole | 'ALL'>(_persisted.roleFilter);
  const [ageMin, setAgeMin] = useState(_persisted.ageMin);
  const [ageMax, setAgeMax] = useState(_persisted.ageMax);
  const [nationalityFilter, setNationalityFilter] = useState(_persisted.nationalityFilter);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(_persisted.statusFilter);

  // Karta staffu
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [negOpen, setNegOpen] = useState(false);
  const [negPhase, setNegPhase] = useState<NegPhase>('proposal');
  const [negProposedSalary, setNegProposedSalary] = useState(0);
  const [negProposedYears, setNegProposedYears] = useState(2);
  const [negSalaryStr, setNegSalaryStr] = useState('');
  const [staffCounterSalary, setStaffCounterSalary] = useState(0);
  const [staffCounterYears, setStaffCounterYears] = useState(2);
  const [agreedSalary, setAgreedSalary] = useState(0);
  const [agreedYears, setAgreedYears] = useState(2);
  const [kaucja, setKaucja] = useState(0);
  const [negResultMsg, setNegResultMsg] = useState('');
  const [negResultOk, setNegResultOk] = useState(false);

  const clubById = useMemo(() => new Map(clubs.map(c => [c.id, c])), [clubs]);
  const allStaff = useMemo(() => Object.values(staffMembers), [staffMembers]);
  const userClubRep = useMemo(() => clubs.find(c => c.id === userTeamId)?.reputation ?? 5, [clubs, userTeamId]);
  const selectedMember = useMemo(() => selectedStaffId ? (staffMembers[selectedStaffId] ?? null) : null, [selectedStaffId, staffMembers]);

  const nationalityOptions = useMemo(() =>
    Array.from(new Set(allStaff.map(s => s.nationality).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pl')),
  [allStaff]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return allStaff.filter(s => {
      if (s.currentClubId === userTeamId) return false;
      if (term && !`${s.firstName} ${s.lastName}`.toLowerCase().includes(term)) return false;
      if (roleFilter !== 'ALL' && s.role !== roleFilter) return false;
      if (s.age < ageMin || s.age > ageMax) return false;
      if (nationalityFilter !== 'ALL' && s.nationality !== nationalityFilter) return false;
      if (statusFilter === 'FREE_AGENT' && s.currentClubId !== null) return false;
      if (statusFilter === 'CONTRACT' && s.currentClubId === null) return false;
      return true;
    });
  }, [allStaff, searchTerm, roleFilter, ageMin, ageMax, nationalityFilter, statusFilter, userTeamId]);

  const handleRoleFilter = (r: StaffRole | 'ALL') => { setRoleFilter(r); _persisted.roleFilter = r; };
  const handleSearch = (v: string) => { setSearchTerm(v); _persisted.searchTerm = v; };
  const handleNationality = (v: string) => { setNationalityFilter(v); _persisted.nationalityFilter = v; };
  const handleStatus = (v: StatusFilter) => { setStatusFilter(v); _persisted.statusFilter = v; };
  const handleAgeMin = (v: number) => { setAgeMin(v); _persisted.ageMin = v; };
  const handleAgeMax = (v: number) => { setAgeMax(v); _persisted.ageMax = v; };

  const closeCard = () => { setSelectedStaffId(null); setIsMenuOpen(false); setActionMsg(null); setNegOpen(false); };

  const openNegotiation = () => {
    if (!selectedMember) return;
    setIsMenuOpen(false);
    setActionMsg(null);

    // Sprawdź blokadę 6-miesięczną
    const blockExpiry = _offerBlocks.get(selectedMember.id);
    if (blockExpiry) {
      const now = currentDate instanceof Date ? currentDate : new Date(currentDate);
      if (now < new Date(blockExpiry)) {
        const d = new Date(blockExpiry);
        const df = `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
        setActionMsg({ text: `Oferta zablokowana do ${df}.`, ok: false });
        return;
      }
    }

    const attrVals = Object.values(selectedMember.attributes);
    const avg = attrVals.length > 0 ? attrVals.reduce((a, b) => a + b, 0) / attrVals.length : 8;
    const base = 20_000 + Math.round((avg / 20) * 180_000);
    const proposed = Math.round(base / 10_000) * 10_000;
    const years = avg >= 15 ? 3 : avg >= 10 ? 2 : 1;
    setNegProposedSalary(proposed);
    setNegProposedYears(years);
    setNegPhase('proposal');
    setNegOpen(true);
  };

  const handleSendOffer = (salary: number, years: number) => {
    if (!selectedMember) return;

    // Sprawdzenie zarządu — limit zatrudnienia dla roli
    const userClubForCheck = clubs.find(c => c.id === userTeamId);
    if (userClubForCheck) {
      const tier = userClubForCheck.tier ?? 1;
      const rep  = userClubForCheck.reputation ?? 5;
      const role = selectedMember.role;

      // Deterministyczny hash ID klubu — dla "losowych" limitów liga 4
      const clubHash = userClubForCheck.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

      const getMax = (): number => {
        switch (role) {
          case StaffRole.ASSISTANT_COACH:
          case StaffRole.GOALKEEPER_COACH:
          case StaffRole.FITNESS_COACH:
            return tier <= 1 ? 2 : 1;

          case StaffRole.VIDEO_ANALYST:
            if (tier >= 4) return clubHash % 2 === 0 ? 0 : 1;
            return tier <= 1 ? 2 : 1;

          case StaffRole.PHYSIOTHERAPIST:
            if (rep >= 8) return 6;
            if (rep >= 5) return 3;
            return 1 + (clubHash % 2); // małe kluby: 1 lub 2

          case StaffRole.CLUB_DOCTOR:
            if (rep >= 8) return 2 + (clubHash % 2); // duże kluby: 2 lub 3
            return 1;

          default: return 1;
        }
      };

      const maxAllowed = getMax();
      const currentCount = (userClubForCheck.staffIds ?? [])
        .map(id => staffMembers[id])
        .filter(Boolean)
        .filter(s => s.role === role)
        .length;

      if (currentCount >= maxAllowed) {
        setNegResultMsg('Zarząd uważa, że mamy już odpowiednią ilość osób na tej pozycji.');
        setNegResultOk(false);
        setNegPhase('result');
        return;
      }
    }

    const interest = getInterestLevel(selectedMember.attributes, userClubRep);

    // Wolny agent — szanse bazują tylko na zainteresowaniu
    if (!selectedMember.currentClubId) {
      const freeAccept     = INTEREST_FREE_ACCEPT[interest];
      const freeNegotiate  = freeAccept * 0.6;
      const roll = Math.random();
      if (roll < freeAccept) {
        setAgreedSalary(salary);
        setAgreedYears(years);
        setKaucja(0);
        setNegPhase('confirm_payment');
      } else if (roll < freeAccept + freeNegotiate) {
        const counterSal = Math.round(salary * (1.1 + Math.random() * 0.2) / 10_000) * 10_000;
        const counterYrs = Math.min(3, years + (Math.random() < 0.4 ? 1 : 0));
        setStaffCounterSalary(counterSal);
        setStaffCounterYears(counterYrs);
        setNegPhase('staff_counter');
      } else {
        setNegResultMsg('Jestem zadowolony ze swojej sytuacji. Dziękuję za ofertę.');
        setNegResultOk(false);
        setNegPhase('result');
      }
      return;
    }

    // Zatrudniony — repDiff jako baza, interest jako mnożnik
    const userClub = clubs.find(c => c.id === userTeamId);
    const staffClub = clubById.get(selectedMember.currentClubId);
    const userRep = userClub?.reputation ?? 5;
    const staffRep = staffClub?.reputation ?? 5;
    const repDiff = userRep - staffRep;

    let acceptChance: number;
    let negotiateChance: number;
    if (repDiff >= 5)       { acceptChance = 0.25; negotiateChance = 0.35; }
    else if (repDiff >= 2)  { acceptChance = 0.15; negotiateChance = 0.25; }
    else if (repDiff >= -1) { acceptChance = 0.08; negotiateChance = 0.12; }
    else if (repDiff >= -3) { acceptChance = 0.03; negotiateChance = 0.05; }
    else                    { acceptChance = 0.01; negotiateChance = 0.02; }

    const mult = INTEREST_MULTIPLIER[interest];
    acceptChance    = Math.min(0.90, acceptChance    * mult);
    negotiateChance = Math.min(0.90, negotiateChance * mult);

    const roll = Math.random();

    const setBlock = () => {
      const now = currentDate instanceof Date ? new Date(currentDate) : new Date(currentDate);
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + 6);
      _offerBlocks.set(selectedMember.id, expiry.toISOString());
    };

    if (roll < acceptChance) {
      // Akceptuje — pokaż kaucję do zapłaty
      const k = Math.round(selectedMember.salary / 2 / 10_000) * 10_000;
      setAgreedSalary(salary);
      setAgreedYears(years);
      setKaucja(k);
      setNegPhase('confirm_payment');
      return;
    }

    if (roll < acceptChance + negotiateChance) {
      // Negocjuje — staff proponuje własne warunki
      const counterSal = Math.round(salary * (1.1 + Math.random() * 0.2) / 10_000) * 10_000;
      const counterYrs = Math.min(3, years + (Math.random() < 0.4 ? 1 : 0));
      setStaffCounterSalary(counterSal);
      setStaffCounterYears(counterYrs);
      setNegPhase('staff_counter');
      return;
    }

    // Odrzuca
    setBlock();
    setNegResultMsg('Jestem zadowolony z pracy w obecnym klubie. Dziękuję za ofertę. Do widzenia.');
    setNegResultOk(false);
    setNegPhase('result');
  };

  const handleAcceptStaffCounter = () => {
    if (!selectedMember) return;
    const k = selectedMember.currentClubId ? Math.round(selectedMember.salary / 2 / 10_000) * 10_000 : 0;
    setAgreedSalary(staffCounterSalary);
    setAgreedYears(staffCounterYears);
    setKaucja(k);
    setNegPhase('confirm_payment');
  };

  const handleConfirmPayment = () => {
    if (!selectedMember) return;
    const result = hireStaffMember(selectedMember.id, agreedSalary, agreedYears, kaucja);
    if (result.success) {
      closeCard();
    } else {
      setNegResultMsg(result.message);
      setNegResultOk(false);
      setNegPhase('result');
    }
  };

  const getClubName = (s: typeof allStaff[0]): string => {
    if (!s.currentClubId) return '—';
    return clubById.get(s.currentClubId)?.name ?? '—';
  };

  const ALL_ATTRS = useMemo(() => {
    const seen = new Set<string>();
    const result: { key: string; label: string; role: StaffRole }[] = [];
    (Object.entries(STAFF_ROLE_ATTRS) as [StaffRole, { key: string; label: string }[]][]).forEach(([role, attrs]) => {
      attrs.forEach(a => {
        if (a.key === 'experience') return;
        if (!seen.has(a.key)) { seen.add(a.key); result.push({ ...a, role }); }
      });
    });
    return result;
  }, []);

  const ROLE_GROUPS = useMemo(() => {
    const groups: { role: StaffRole; count: number }[] = [];
    ALL_ATTRS.forEach(a => {
      const last = groups[groups.length - 1];
      if (last && last.role === a.role) last.count++;
      else groups.push({ role: a.role, count: 1 });
    });
    return groups;
  }, [ALL_ATTRS]);

  return (
    <div className="relative isolate min-h-screen bg-[#070B14] text-white flex flex-col overflow-hidden">

      {/* GLASS BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(126,34,206,0.18),transparent_32%),radial-gradient(circle_at_82%_72%,rgba(14,116,144,0.12),transparent_38%),linear-gradient(135deg,rgba(15,23,42,0.72),rgba(2,6,23,0.96))]" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute -left-20 top-28 -rotate-12 select-none whitespace-nowrap text-[96px] font-black italic uppercase tracking-tighter text-white/[0.025]">Manager Futbolu</div>
        <div className="absolute right-[-110px] top-[42%] -rotate-12 select-none whitespace-nowrap text-[112px] font-black italic uppercase tracking-tighter text-white/[0.025]">Manager Futbolu</div>
        <div className="absolute left-[24%] bottom-[-28px] -rotate-12 select-none whitespace-nowrap text-[104px] font-black italic uppercase tracking-tighter text-white/[0.02]">Manager Futbolu</div>
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/[0.055] via-white/[0.018] to-transparent" />
      </div>

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/10 bg-slate-950/35 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="text-3xl">🧑‍💼</div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">WYSZUKAJ <span className="text-purple-400">WSPÓŁPRACOWNIKÓW</span></h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] mt-1">Baza danych PZPN • Rynek Sztabu</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo(ViewState.JOB_MARKET)}
            className="px-8 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/[0.15] transition-all shadow-xl active:scale-95 group"
          >
            <span className="group-hover:text-emerald-400 transition-colors">&larr; Centrum Transferowe</span>
          </button>
        </div>
      </header>

      {/* FILTRY */}
      <div className="relative z-10 px-8 py-4 border-b border-white/10 bg-slate-900/25 backdrop-blur-xl flex flex-wrap gap-4 items-end shrink-0">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Szukaj</span>
          <input
            type="text"
            placeholder="Imię lub nazwisko..."
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[11px] font-black text-white outline-none focus:border-purple-500/50 w-52 placeholder:text-slate-600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pozycja</span>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => handleRoleFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${roleFilter === 'ALL' ? 'bg-purple-500/30 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
            >
              Wszyscy
            </button>
            {Object.values(StaffRole).map(role => (
              <button
                key={role}
                onClick={() => handleRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${roleFilter === role ? 'bg-purple-500/30 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Wiek</span>
          <div className="flex items-center gap-2">
            <input type="number" value={ageMin} min={16} max={ageMax} onChange={e => handleAgeMin(parseInt(e.target.value) || 16)} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-black text-emerald-400 outline-none w-16 text-center" />
            <span className="text-slate-500 text-xs">—</span>
            <input type="number" value={ageMax} min={ageMin} max={80} onChange={e => handleAgeMax(parseInt(e.target.value) || 80)} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-black text-rose-400 outline-none w-16 text-center" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Narodowość</span>
          <select value={nationalityFilter} onChange={e => handleNationality(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[11px] font-black text-white outline-none focus:border-purple-500/50 w-44">
            <option value="ALL">Każda</option>
            {nationalityOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</span>
          <div className="flex gap-1">
            {(['ALL', 'FREE_AGENT', 'CONTRACT'] as StatusFilter[]).map(s => (
              <button key={s} onClick={() => handleStatus(s)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${statusFilter === s ? 'bg-purple-500/30 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                {s === 'ALL' ? 'Wszyscy' : s === 'FREE_AGENT' ? 'Wolny agent' : 'Kontrakt'}
              </button>
            ))}
          </div>
        </div>
        <div className="ml-auto flex flex-col items-end justify-end">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Wyniki</span>
          <span className="text-lg font-black text-purple-400">{filtered.length.toLocaleString('pl-PL')}</span>
        </div>
      </div>

      {/* TABELA MATRIX */}
      <div className="relative z-10 flex-1 overflow-auto px-8 py-4 bg-slate-950/20 backdrop-blur-sm">
        <table className="border-collapse table-auto">
          <thead>
            <tr>
              <th colSpan={7} className="border-b border-white/10" />
              {ROLE_GROUPS.map(g => (
                <th key={g.role} colSpan={g.count} className={`pb-1 px-1 text-center text-[8px] font-black uppercase tracking-widest whitespace-nowrap border-l border-white/10 ${ROLE_COLORS[g.role]}`}>
                  {ROLE_LABELS[g.role]}
                </th>
              ))}
              <th className="pb-1 px-1 text-center text-[8px] font-black uppercase tracking-widest text-amber-400 whitespace-nowrap border-l border-white/10">Wspólne</th>
            </tr>
            <tr className="border-b border-white/10">
              <th className="py-1 px-2 text-left text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap align-bottom">LP</th>
              <th className="py-1 px-2 text-left text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap align-bottom">Imię i nazwisko</th>
              <th className="py-1 px-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap align-bottom">Wiek</th>
              <th className="py-1 px-2 text-left text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap align-bottom">Narodowość</th>
              <th className="py-1 px-2 text-left text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap align-bottom">Pozycja</th>
              <th className="py-1 px-2 text-left text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap align-bottom">Klub</th>
              <th className="py-1 px-2 text-left text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap align-bottom">Zainteresowanie</th>
              {ALL_ATTRS.map((a, i) => {
                const isFirstOfGroup = i === 0 || ALL_ATTRS[i - 1].role !== a.role;
                return (
                  <th key={a.key} title={a.label} className={`py-1 px-0 w-8 align-bottom cursor-help ${isFirstOfGroup ? 'border-l border-white/10' : ''}`}>
                    <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '90px' }} className={`text-[10px] uppercase tracking-wide whitespace-nowrap flex items-center ${ROLE_COLORS[a.role]}`}>
                      {ATTR_HEADER_LABELS[a.key] ?? a.label}
                    </div>
                  </th>
                );
              })}
              <th title="Doświadczenie" className="py-1 px-0 w-8 align-bottom border-l border-white/10 cursor-help">
                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '90px' }} className="mx-auto text-[10px] uppercase tracking-wide whitespace-nowrap flex items-center text-amber-400">
                  Dośw.
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((staff, idx) => (
              <tr key={staff.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                <td className="py-1 px-2 text-[10px] font-black text-slate-500 tabular-nums whitespace-nowrap">{idx + 1}</td>
                <td
                  className="py-1 px-2 text-[11px] font-black uppercase tracking-tight text-white whitespace-nowrap cursor-pointer hover:text-purple-300 transition-colors"
                  onClick={() => { setSelectedStaffId(staff.id); setIsMenuOpen(false); setActionMsg(null); setNegOpen(false); }}
                >
                  {staff.firstName} {staff.lastName}
                </td>
                <td className="py-1 px-2 text-[11px] font-black text-emerald-400 text-center tabular-nums whitespace-nowrap">{staff.age}</td>
                <td className="py-1 px-2 whitespace-nowrap">
                  <span className="text-[10px] font-black text-slate-300">{staff.nationality}</span>
                </td>
                <td className="py-1 px-2 whitespace-nowrap">
                  <span className={`text-[10px] font-black uppercase tracking-tight ${ROLE_COLORS[staff.role]}`}>{ROLE_LABELS[staff.role]}</span>
                </td>
                <td className="py-1 px-2 whitespace-nowrap">
                  {staff.currentClubId ? (
                    <span className="text-[10px] font-black uppercase tracking-tight text-white">{getClubName(staff)}</span>
                  ) : (
                    <span className="text-amber-400 uppercase tracking-widest text-[9px] font-black">Wolny agent</span>
                  )}
                </td>
                <td className="py-1 px-2 whitespace-nowrap">
                  {(() => {
                    const lvl = getInterestLevel(staff.attributes, userClubRep);
                    return <span className={`text-[10px] font-black uppercase tracking-tight ${INTEREST_COLORS[lvl]}`}>{INTEREST_LABELS[lvl]}</span>;
                  })()}
                </td>
                {ALL_ATTRS.map((a, i) => {
                  const val = staff.attributes[a.key];
                  const isFirstOfGroup = i === 0 || ALL_ATTRS[i - 1].role !== a.role;
                  return (
                    <td
                      key={a.key}
                      title={`${a.label}: ${val ?? 'brak danych'}`}
                      className={`py-1 px-0 w-8 text-center cursor-help ${isFirstOfGroup ? 'border-l border-white/10' : ''}`}
                    >
                      {val !== undefined ? (
                        <span className="text-[11px] font-black tabular-nums text-slate-200">{val}</span>
                      ) : (
                        <span className="text-[11px] font-black text-slate-700">.</span>
                      )}
                    </td>
                  );
                })}
                <td
                  title={`Doświadczenie: ${staff.attributes['experience'] ?? 'brak danych'}`}
                  className="py-1 px-0 w-8 text-center border-l border-white/10 cursor-help"
                >
                  {staff.attributes['experience'] !== undefined ? (
                    <span className="text-[11px] font-black tabular-nums text-amber-400">{staff.attributes['experience']}</span>
                  ) : (
                    <span className="text-[11px] font-black text-slate-700">.</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8 + ALL_ATTRS.length} className="py-16 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  Brak wyników dla wybranych filtrów
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* KARTA STAFFU — MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={closeCard}>
          <div
            className="relative w-[460px] bg-slate-950/70 rounded-[32px] shadow-[0_50px_120px_rgba(0,0,0,0.95)] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* NAGŁÓWEK KARTY */}
            <div className="flex flex-col items-center pt-8 pb-6 px-8 bg-slate-900/40 border-b border-white/6 relative">
              {/* dropdown Akcje */}
              <div className="absolute left-6 top-6">
                <button
                  onClick={e => { e.stopPropagation(); setIsMenuOpen(p => !p); setActionMsg(null); }}
                  className="text-[11px] font-black italic uppercase tracking-tighter text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800/80 shadow-[0_4px_12px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.08)_inset] active:shadow-[0_1px_4px_rgba(0,0,0,0.6)] active:translate-y-px select-none"
                >
                  ⚙ Akcje
                </button>
                {isMenuOpen && (
                  <div className="absolute left-0 top-9 z-50 w-52 rounded-xl border border-white/10 bg-slate-900/95 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.06)_inset] overflow-hidden">
                    <button
                      onClick={e => { e.stopPropagation(); openNegotiation(); }}
                      className="w-full text-left px-4 py-2.5 text-[12px] font-black italic uppercase tracking-tighter text-emerald-300 hover:bg-emerald-900/30 hover:text-emerald-200 transition-colors"
                    >
                      Zaproponuj kontrakt
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[11px] font-black italic uppercase tracking-tighter text-slate-500">{ROLE_LABELS_FULL[selectedMember.role]}</span>
              <span className="text-[24px] font-black italic uppercase tracking-tighter text-white mt-1 whitespace-nowrap">{selectedMember.firstName} {selectedMember.lastName}</span>
              <span className="text-[12px] text-slate-400 mt-0.5">{REGION_LABELS[selectedMember.nationality] ?? selectedMember.nationality} · {selectedMember.age} lat</span>
              <button onClick={closeCard} className="absolute right-6 top-6 text-slate-600 hover:text-white transition-colors text-lg">✕</button>
              {actionMsg && (
                <div className={`mt-3 px-4 py-2 rounded-lg text-[11px] font-black italic uppercase tracking-tighter ${actionMsg.ok ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'}`}>
                  {actionMsg.text}
                </div>
              )}
            </div>

            {/* ATRYBUTY */}
            <div className="px-8 pt-5 pb-3 bg-gradient-to-br from-amber-950/50 via-stone-900/60 to-orange-950/40">
              <div className="flex flex-col gap-2">
                {STAFF_ROLE_ATTRS[selectedMember.role].map(({ key, label }) => {
                  const val = selectedMember.attributes[key] ?? 0;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-[11px] font-black italic uppercase tracking-tighter text-slate-400 w-52 shrink-0">{label}</span>
                      <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${(val / 20) * 100}%` }} />
                      </div>
                      <span className="text-[13px] font-black italic text-white w-6 text-right">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* KONTRAKT */}
            <div className="px-8 pt-4 pb-4 mt-2 bg-gradient-to-br from-yellow-900/60 via-yellow-800/40 to-amber-900/50 border-t border-yellow-600/30">
              <div className="text-[11px] font-black italic uppercase tracking-tighter text-yellow-400/80 mb-2 text-center">Informacje o kontrakcie</div>
              <div className="border-b border-white/20 mb-3" />
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] font-black italic uppercase tracking-tighter text-yellow-300/60 mb-1">Zarobki roczne</div>
                  <span className="text-[15px] font-black italic tracking-tighter text-white">{selectedMember.salary.toLocaleString('pl-PL')} PLN</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black italic uppercase tracking-tighter text-yellow-300/60 mb-1">Kontrakt do</div>
                  <span className="text-[15px] font-black italic tracking-tighter text-white">
                    {(() => { const d = new Date(selectedMember.contractEndDate); return `${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`; })()}
                  </span>
                </div>
              </div>
            </div>

            {/* HISTORIA */}
            <div className="px-8 pt-4 pb-7 border-t border-amber-800/30 bg-gradient-to-br from-amber-950/50 via-stone-900/60 to-orange-950/40">
              <div className="text-[10px] font-black italic uppercase tracking-tighter text-slate-300 mb-2 text-center">Historia kariery</div>
              <div className="border-b border-white/20 mb-3" />
              {selectedMember.history.length === 0 ? (
                <span className="text-[12px] italic text-slate-600">Brak historii</span>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedMember.history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[14px] font-black italic uppercase tracking-tighter text-white">{h.clubName}</span>
                      <span className="text-[11px] italic text-slate-200">
                        {MONTHS_PL[(h.fromMonth ?? 1) - 1]} {h.fromYear} — {h.toYear ? `${MONTHS_PL[(h.toMonth ?? 1) - 1]} ${h.toYear}` : 'obecnie'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MODAL NEGOCJACJI — ZAPROPONUJ KONTRAKT */}
            {negOpen && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 rounded-[32px]" onClick={e => e.stopPropagation()}>
                <div className="px-8 py-7 flex flex-col items-center gap-3 w-full max-w-[360px] text-center">
                  <span className="text-[13px] font-black italic uppercase tracking-tighter text-emerald-400">Zaproponuj kontrakt</span>
                  <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">{ROLE_LABELS_FULL[selectedMember.role]}</span>
                  <span className="text-[18px] font-black italic uppercase tracking-tighter text-white">{selectedMember.firstName} {selectedMember.lastName}</span>
                  <div className="border-b border-white/15 w-full" />

                  {/* FAZA 1 — gracz ustawia ofertę */}
                  {negPhase === 'proposal' && (
                    <>
                      <span className="text-[11px] italic text-slate-400 mt-1">Twoja propozycja kontraktu:</span>
                      <div className="flex flex-col gap-3 w-full mt-1">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">Wynagrodzenie (PLN/rok)</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setNegProposedSalary(v => Math.max(0, v - 10_000))} className="w-8 h-8 rounded-lg border border-white/15 bg-slate-800/80 text-white font-black text-lg hover:bg-slate-700/80 transition-colors flex items-center justify-center">−</button>
                            <input
                              type="text"
                              value={negSalaryStr || negProposedSalary.toLocaleString('pl-PL') + ' PLN'}
                              onFocus={() => setNegSalaryStr(String(negProposedSalary))}
                              onChange={e => setNegSalaryStr(e.target.value.replace(/[^0-9]/g, ''))}
                              onBlur={() => { const v = parseInt(negSalaryStr, 10); if (!isNaN(v)) setNegProposedSalary(v); setNegSalaryStr(''); }}
                              className="text-[16px] font-black italic tracking-tighter text-yellow-400 min-w-[150px] text-center bg-transparent border-b border-yellow-700/60 outline-none"
                            />
                            <button onClick={() => setNegProposedSalary(v => v + 10_000)} className="w-8 h-8 rounded-lg border border-white/15 bg-slate-800/80 text-white font-black text-lg hover:bg-slate-700/80 transition-colors flex items-center justify-center">+</button>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">Czas kontraktu</span>
                          <div className="flex gap-2">
                            {[1, 2, 3].map(y => (
                              <button key={y} onClick={() => setNegProposedYears(y)} className={`px-4 py-2 rounded-lg text-[12px] font-black italic uppercase tracking-tighter border transition-colors ${negProposedYears === y ? 'border-emerald-500/60 bg-emerald-800/50 text-emerald-300' : 'border-white/15 bg-slate-800/60 text-slate-400 hover:text-white'}`}>
                                {y} {y === 1 ? 'rok' : 'lata'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="border-b border-white/15 w-full" />
                      <div className="flex gap-3 mt-1">
                        <button onClick={() => setNegOpen(false)} className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-slate-300 border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]">Anuluj</button>
                        <button
                          onClick={() => handleSendOffer(negProposedSalary, negProposedYears)}
                          className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-white border border-emerald-700/60 bg-emerald-900/70 hover:bg-emerald-800/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]"
                        >
                          Wyślij ofertę
                        </button>
                      </div>
                    </>
                  )}

                  {/* FAZA 2 — kontroferta pracownika */}
                  {negPhase === 'staff_counter' && (
                    <>
                      <span className="text-[11px] italic text-slate-400 mt-1">Jestem zainteresowany, ale mam inne oczekiwania:</span>
                      <div className="flex gap-6 mt-2">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 mb-0.5">Wynagrodzenie</span>
                          <span className="text-[20px] font-black italic tracking-tighter text-yellow-400">{staffCounterSalary.toLocaleString('pl-PL')} PLN</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 mb-0.5">Czas kontraktu</span>
                          <span className="text-[20px] font-black italic tracking-tighter text-white">{staffCounterYears} {staffCounterYears === 1 ? 'rok' : 'lata'}</span>
                        </div>
                      </div>
                      <div className="border-b border-white/15 w-full" />
                      <div className="flex gap-3 mt-1">
                        <button
                          onClick={() => { setNegResultMsg('Oferta odrzucona.'); setNegResultOk(false); setNegPhase('result'); }}
                          className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-slate-300 border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]"
                        >
                          Odrzuć
                        </button>
                        <button
                          onClick={handleAcceptStaffCounter}
                          className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-white border border-emerald-700/60 bg-emerald-900/70 hover:bg-emerald-800/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]"
                        >
                          Akceptuj
                        </button>
                      </div>
                    </>
                  )}

                  {/* FAZA 3 — potwierdzenie kaucji */}
                  {negPhase === 'confirm_payment' && (
                    <>
                      {kaucja > 0 ? (
                        <>
                          <span className="text-[11px] italic text-slate-400 mt-1">Pracownik zgadza się na transfer. Wymagana kaucja dla obecnego klubu:</span>
                          <span className="text-[26px] font-black italic tracking-tighter text-yellow-400 mt-1">{kaucja.toLocaleString('pl-PL')} PLN</span>
                          <span className="text-[10px] italic text-slate-500">(6 miesięcznych pensji pracownika)</span>
                        </>
                      ) : (
                        <span className="text-[11px] italic text-slate-400 mt-1">Pracownik zgadza się na warunki kontraktu.</span>
                      )}
                      <div className="border-b border-white/15 w-full" />
                      <div className="flex gap-3 mt-1">
                        <button onClick={() => setNegOpen(false)} className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-slate-300 border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]">Anuluj</button>
                        <button
                          onClick={handleConfirmPayment}
                          className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-white border border-yellow-700/60 bg-yellow-900/70 hover:bg-yellow-800/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]"
                        >
                          Zapłać kaucję i zatrudnij
                        </button>
                      </div>
                    </>
                  )}

                  {/* FAZA 4 — wynik */}
                  {negPhase === 'result' && (
                    <>
                      <div className={`mt-2 px-5 py-3 rounded-xl text-[12px] font-black italic uppercase tracking-tighter ${negResultOk ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'}`}>
                        {negResultMsg}
                      </div>
                      <button onClick={() => setNegOpen(false)} className="mt-3 px-6 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-slate-300 border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]">Zamknij</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
