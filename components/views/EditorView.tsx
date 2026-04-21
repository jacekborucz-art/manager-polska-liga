
import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState, PlayerPosition, Region, PlayerAttributes } from '../../types';
import { PlayerAttributesGenerator } from '../../services/PlayerAttributesGenerator';

const ATTR_KEYS: (keyof PlayerAttributes)[] = [
  'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking',
  'finishing', 'technique', 'vision', 'dribbling', 'heading', 'positioning',
  'goalkeeping', 'freeKicks', 'talent', 'penalties', 'corners', 'aggression',
  'crossing', 'leadership', 'mentality', 'workRate'
];

const ATTR_LABELS: Record<keyof PlayerAttributes, string> = {
  strength: 'Siła', stamina: 'Kondycja', pace: 'Szybkość', defending: 'Obrona',
  passing: 'Podania', attacking: 'Atak', finishing: 'Wykończenie', technique: 'Technika',
  vision: 'Wizja', dribbling: 'Drybling', heading: 'Główkowanie', positioning: 'Ustawienie',
  goalkeeping: 'Bramkarstwo', freeKicks: 'Rzuty wolne', talent: 'Talent',
  penalties: 'Rzuty karne', corners: 'Rożne', aggression: 'Agresja',
  crossing: 'Dośrodkowania', leadership: 'Przywództwo', mentality: 'Mentalność', workRate: 'Zaangażowanie'
};

const REGION_LABELS: Record<Region, string> = {
  [Region.POLAND]: 'Polska', [Region.BALKANS]: 'Bałkany', [Region.CZ_SK]: 'Czechy/Słowacja',
  [Region.SSA]: 'Afryka Sub.', [Region.IBERIA]: 'Iberia', [Region.NORTH_AMERICA]: 'Ameryka Płn.',
  [Region.MEXICO]: 'Meksyk', [Region.OCEANIA]: 'Oceania', [Region.SWEDEN]: 'Szwecja',
  [Region.SCANDINAVIA]: 'Skandynawia', [Region.EX_USSR]: 'Była ZSRR', [Region.SPAIN]: 'Hiszpania',
  [Region.ENGLAND]: 'Anglia', [Region.GERMANY]: 'Niemcy', [Region.ITALY]: 'Włochy',
  [Region.FRANCE]: 'Francja', [Region.JAPAN]: 'Japonia', [Region.KOREA]: 'Korea',
  [Region.ARGENTINA]: 'Argentyna', [Region.BRAZIL]: 'Brazylia', [Region.TURKEY]: 'Turcja',
  [Region.ARABIA]: 'Arabia', [Region.FINLAND]: 'Finlandia', [Region.GEORGIA]: 'Gruzja',
  [Region.ARMENIA]: 'Armenia', [Region.ALBANIA]: 'Albania', [Region.ROMANIA]: 'Rumunia',
  [Region.BALTIC]: 'Bałtyk', [Region.BENELUX]: 'Benelux', [Region.HUNGARIAN]: 'Węgry',
  [Region.MALTESE]: 'Malta', [Region.ISRAELI]: 'Izrael', [Region.GREEK]: 'Grecja',
  [Region.AZERBAIJANI]: 'Azerbejdżan', [Region.KAZAKH]: 'Kazachstan',
  [Region.SOUTH_AMERICAN]: 'Ameryka Płd.'
};

const DEFAULT_ATTRS: PlayerAttributes = {
  strength: 50, stamina: 50, pace: 50, defending: 50, passing: 50, attacking: 50,
  finishing: 50, technique: 50, vision: 50, dribbling: 50, heading: 50, positioning: 50,
  goalkeeping: 50, freeKicks: 50, talent: 50, penalties: 50, corners: 50, aggression: 50,
  crossing: 50, leadership: 50, mentality: 50, workRate: 50
};

const POS_ORDER: Record<PlayerPosition, number> = {
  [PlayerPosition.GK]: 0, [PlayerPosition.DEF]: 1,
  [PlayerPosition.MID]: 2, [PlayerPosition.FWD]: 3
};

const POS_COLOR: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]:  'text-yellow-400 border-yellow-500 bg-yellow-500/20',
  [PlayerPosition.DEF]: 'text-blue-400   border-blue-500   bg-blue-500/20',
  [PlayerPosition.MID]: 'text-green-400  border-green-500  bg-green-500/20',
  [PlayerPosition.FWD]: 'text-red-400    border-red-500    bg-red-500/20',
};

const inputCls  = 'bg-black/40 border border-slate-700 rounded text-emerald-400 font-black italic uppercase tracking-tighter text-xs outline-none focus:border-yellow-500 transition-colors';
const selectCls = 'bg-black/40 border border-slate-700 rounded text-white   font-black italic uppercase tracking-tighter text-xs outline-none focus:border-yellow-500 transition-colors cursor-pointer';
const labelCls  = 'text-yellow-400 text-xs font-black italic uppercase tracking-tighter';

export const EditorView: React.FC = () => {
  const { clubs, players, getOrGenerateSquad, updatePlayer, navigateTo } = useGame();

  const [selectedTier, setSelectedTier]     = useState<string>('1');
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  const [firstName, setFirstName]           = useState('');
  const [lastName,  setLastName]            = useState('');
  const [age,       setAge]                 = useState<number>(20);
  const [nationality, setNationality]       = useState<Region>(Region.POLAND);
  const [position,  setPosition]            = useState<PlayerPosition>(PlayerPosition.MID);
  const [attrs,     setAttrs]               = useState<PlayerAttributes>({ ...DEFAULT_ATTRS });
  const [annualSalary,  setAnnualSalary]    = useState<number>(0);
  const [marketValue,   setMarketValue]     = useState<number>(0);
  const [contractEndDate, setContractEndDate] = useState<string>('');

  const filteredClubs = useMemo(() => clubs.filter(c => c.leagueId === `L_PL_${selectedTier}`), [clubs, selectedTier]);

  const clubPlayers = useMemo(() => {
    if (!selectedClubId) return [];
    return getOrGenerateSquad(selectedClubId);
  }, [selectedClubId, getOrGenerateSquad, players]);

  const selectedClub = useMemo(() => clubs.find(c => c.id === selectedClubId), [clubs, selectedClubId]);

  const sortedPlayers = useMemo(() => {
    return [...clubPlayers].sort((a, b) => {
      const pd = POS_ORDER[a.position] - POS_ORDER[b.position];
      return pd !== 0 ? pd : b.overallRating - a.overallRating;
    });
  }, [clubPlayers]);

  const liveOvr = useMemo(() => PlayerAttributesGenerator.calculateOverall(attrs, position), [attrs, position]);

  // Gradient tła z kolorów drużyny
  const bgGradient = useMemo(() => {
    const colors = selectedClub?.colorsHex;
    if (!colors || colors.length === 0) return undefined;
    const c0 = colors[0];
    const c1 = colors[1] ?? colors[0];
    return `linear-gradient(150deg, ${c0}28 0%, ${c1}18 60%, transparent 100%)`;
  }, [selectedClub]);

  useEffect(() => {
    if (selectedPlayerId && selectedClubId) {
      const p = clubPlayers.find(pl => pl.id === selectedPlayerId);
      if (p) {
        setFirstName(p.firstName);
        setLastName(p.lastName);
        setAge(p.age);
        setNationality(p.nationality);
        setPosition(p.position);
        setAttrs({ ...p.attributes });
        setAnnualSalary(p.annualSalary);
        setMarketValue(p.marketValue ?? 0);
        setContractEndDate(p.contractEndDate);
      }
    } else {
      setFirstName(''); setLastName(''); setAge(20);
      setNationality(Region.POLAND); setPosition(PlayerPosition.MID);
      setAttrs({ ...DEFAULT_ATTRS }); setAnnualSalary(0); setMarketValue(0); setContractEndDate('');
    }
  }, [selectedPlayerId, clubPlayers, selectedClubId]);

  const handleAttrChange = (key: keyof PlayerAttributes, val: string) => {
    let n = parseInt(val);
    if (isNaN(n)) n = 1;
    setAttrs(prev => ({ ...prev, [key]: Math.min(99, Math.max(1, n)) }));
  };

  const handleRandom = () => {
    const r = {} as PlayerAttributes;
    ATTR_KEYS.forEach(k => { r[k] = Math.floor(Math.random() * 99) + 1; });
    setAttrs(r);
  };

  const handleAgeChange = (val: string) => {
    let n = parseInt(val);
    if (isNaN(n)) n = 15;
    setAge(Math.min(45, Math.max(15, n)));
  };

  const handleSave = () => {
    if (!selectedClubId || !selectedPlayerId) return;
    const newOvr = PlayerAttributesGenerator.calculateOverall(attrs, position);
    updatePlayer(selectedClubId, selectedPlayerId, {
      firstName, lastName, age, nationality, position,
      attributes: { ...attrs }, overallRating: newOvr,
      annualSalary, marketValue, contractEndDate
    });
    alert(`Zapisano: ${firstName} ${lastName} (OVR: ${newOvr})`);
  };

  const isSelected = !!selectedPlayerId;

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col overflow-hidden text-white font-black italic uppercase tracking-tighter">

      {/* HEADER */}
      <div className="flex items-center gap-4 px-5 py-2.5 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <span className="text-sm text-white mr-2">Edytor Piłkarzy</span>
        <span className="w-px h-4 bg-slate-700" />
        {['1', '2', '3', '4'].map(tier => (
          <button
            key={tier}
            onClick={() => { setSelectedTier(tier); setSelectedClubId(''); setSelectedPlayerId(''); }}
            className={`px-3 py-1 rounded text-xs transition-colors border ${selectedTier === tier ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-slate-700 text-slate-400 hover:text-white'}`}
          >
            Liga {tier}
          </button>
        ))}
        <select
          value={selectedClubId}
          onChange={(e) => { setSelectedClubId(e.target.value); setSelectedPlayerId(''); }}
          className={`${selectCls} px-2 py-1 min-w-[200px]`}
        >
          <option value="">— wybierz klub —</option>
          {filteredClubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="ml-auto">
          <button
            onClick={() => navigateTo(ViewState.DASHBOARD)}
            className="px-4 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
          >
            Wyjdź
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEWA — FORMULARZ */}
        <div
          className={`flex-1 overflow-y-auto px-5 py-3 transition-opacity duration-200 editor-scroll relative`}
          style={{ background: bgGradient }}
        >
          {/* Overlay ciemności aby formularz był czytelny */}
          <div className="absolute inset-0 bg-slate-950/70 pointer-events-none" />
          <div className={`relative z-10 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>

            {/* NAZWA DRUŻYNY — między headerem a formularzem */}
            <div className="mb-3 pb-3 border-b border-white/10 flex items-center gap-4">
              {selectedClub?.logoFile && (
                <img
                  src={new URL(`../../Graphic/logo/${selectedClub.logoFile}`, import.meta.url).href}
                  alt=""
                  className="w-16 h-16 object-contain flex-shrink-0"
                />
              )}
              <div className="text-5xl text-white leading-none">
                {selectedClub?.name ?? '—'}
              </div>
            </div>

            {/* OVR KOŁO + IMIĘ I NAZWISKO */}
            <div className="flex items-center gap-5 mb-4 pb-3 border-b border-white/10">
              {/* Kółko OVR */}
              <div className="w-20 h-20 rounded-full border-2 border-white/30 bg-black/40 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-[9px] text-yellow-400 leading-none mb-0.5">OVR</span>
                <span className="text-4xl text-white tabular-nums leading-none">{liveOvr}</span>
              </div>
              {/* Imię i nazwisko — duże */}
              <div>
                <div className="text-3xl text-white leading-tight">
                  {firstName || '—'}
                </div>
                <div className="text-3xl text-white leading-tight">
                  {lastName}
                </div>
              </div>
            </div>

            {/* IMIĘ / NAZWISKO pola */}
            <div className="flex gap-3 mb-2">
              <div>
                <div className={`${labelCls} mb-1`}>Imię</div>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className={`${inputCls} w-40 px-2 py-1.5`} placeholder="imię..." />
              </div>
              <div>
                <div className={`${labelCls} mb-1`}>Nazwisko</div>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className={`${inputCls} w-40 px-2 py-1.5`} placeholder="nazwisko..." />
              </div>
            </div>

            {/* WIEK / POZYCJA / NARODOWOŚĆ */}
            <div className="flex gap-3 items-end mb-3">
              <div>
                <div className={`${labelCls} mb-1`}>Wiek</div>
                <input type="number" min={15} max={45} value={age}
                  onChange={(e) => handleAgeChange(e.target.value)}
                  onBlur={(e) => handleAgeChange(e.target.value)}
                  className={`${inputCls} w-14 px-2 py-1.5 text-center`} />
              </div>
              <div>
                <div className={`${labelCls} mb-1`}>Pozycja</div>
                <div className="flex gap-1">
                  {([PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD] as PlayerPosition[]).map(pos => (
                    <button
                      key={pos}
                      onClick={() => setPosition(pos)}
                      className={`px-2 py-1 rounded border text-xs transition-colors ${position === pos ? POS_COLOR[pos] : 'text-slate-500 border-slate-700 bg-transparent hover:text-white'}`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className={`${labelCls} mb-1`}>Narodowość</div>
                <select value={nationality} onChange={(e) => setNationality(e.target.value as Region)}
                  className={`${selectCls} px-2 py-1.5 w-36`}>
                  {Object.values(Region).map(r => (
                    <option key={r} value={r}>{REGION_LABELS[r]}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className={`${labelCls} mb-1`}>Wartość rynkowa (PLN)</div>
                <input type="number" min={0} value={marketValue}
                  onChange={(e) => setMarketValue(parseInt(e.target.value) || 0)}
                  className={`${inputCls} w-36 px-2 py-1.5 text-right`} />
              </div>
              <div>
                <div className={`${labelCls} mb-1`}>Pensja roczna (PLN)</div>
                <input type="number" min={0} value={annualSalary}
                  onChange={(e) => setAnnualSalary(parseInt(e.target.value) || 0)}
                  className={`${inputCls} w-36 px-2 py-1.5 text-right`} />
              </div>
              <div>
                <div className={`${labelCls} mb-1`}>Kontrakt do</div>
                <input type="date" value={contractEndDate ? contractEndDate.substring(0, 10) : ''}
                  onChange={(e) => setContractEndDate(e.target.value)}
                  className={`${inputCls} px-2 py-1.5`} />
              </div>
            </div>

            {/* ATRYBUTY */}
            <div className="mb-3">
              <div className="mb-2">
                <span className="text-xs text-yellow-400">Atrybuty</span>
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  {Array.from({ length: Math.ceil(ATTR_KEYS.length / 3) }, (_, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-slate-800/50">
                      {ATTR_KEYS.slice(rowIdx * 3, rowIdx * 3 + 3).map(key => (
                        <td key={key} className="py-[2px] pr-6">
                          <div className="flex items-center gap-3">
                            <span className="text-yellow-400 text-lg whitespace-nowrap w-44 flex-shrink-0">{ATTR_LABELS[key]}</span>
                            <input
                              type="number" min={1} max={99} value={attrs[key]}
                              onChange={(e) => handleAttrChange(key, e.target.value)}
                              onBlur={(e) => handleAttrChange(key, e.target.value)}
                              className={`${inputCls} w-[58px] h-[58px] p-0 text-center text-[28px] leading-none`}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


            {/* PRZYCISKI */}
            <div className="pt-2 flex gap-3">
              <button onClick={handleSave}
                className="px-6 py-2 bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 rounded text-sm text-white transition-colors active:scale-95">
                Zapisz zmiany
              </button>
              <button onClick={handleRandom}
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-300 hover:text-white hover:border-slate-400 transition-colors">
                Wartości losowe
              </button>
            </div>

          </div>
        </div>

        {/* PRAWA — LISTA ZAWODNIKÓW */}
        <div className="w-72 border-l border-slate-800 flex flex-col flex-shrink-0 bg-slate-900/40">
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-900">
            <span className="text-xs text-yellow-400">
              Zawodnicy {selectedClubId ? `(${clubPlayers.length})` : ''}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto editor-scroll">
            {!selectedClubId ? (
              <div className="p-6 text-center text-slate-600 text-xs">Wybierz klub</div>
            ) : (
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 sticky top-0">
                    <th className="text-left px-3 py-1.5 text-yellow-400 w-10">Poz.</th>
                    <th className="text-left px-2 py-1.5 text-yellow-400">Nazwisko</th>
                    <th className="text-left px-2 py-1.5 text-yellow-400">Imię</th>
                    <th className="text-right px-3 py-1.5 text-yellow-400 w-10">OVR</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map(p => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPlayerId(p.id)}
                      className={`border-b border-slate-800/50 cursor-pointer transition-colors ${selectedPlayerId === p.id ? 'bg-blue-600/20' : 'hover:bg-slate-800/50'}`}
                    >
                      <td className="px-3 py-1.5">
                        <span className={p.position === PlayerPosition.GK ? 'text-yellow-400' : p.position === PlayerPosition.DEF ? 'text-blue-400' : p.position === PlayerPosition.MID ? 'text-green-400' : 'text-red-400'}>
                          {p.position}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-white">{p.lastName}</td>
                      <td className="px-2 py-1.5 text-slate-400">{p.firstName}</td>
                      <td className="px-3 py-1.5 text-right text-emerald-400 tabular-nums">{p.overallRating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      <style>{`
        .editor-scroll::-webkit-scrollbar { width: 4px; }
        .editor-scroll::-webkit-scrollbar-track { background: transparent; }
        .editor-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>
    </div>
  );
};
