
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { ImportedSquadPlayer } from '../../context/GameContext';
import { ViewState, PlayerPosition, Region, PlayerAttributes, Player, HealthStatus } from '../../types';
import { PlayerAttributesGenerator } from '../../services/PlayerAttributesGenerator';
import { pickNationalityForRegion, REGION_TO_NT_LIST } from '../../services/NationalityService';
import { NameGeneratorService } from '../../services/NameGeneratorService';
import { FinanceService } from '../../services/FinanceService';

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

const COUNTRY_OPTIONS = (Object.entries(REGION_TO_NT_LIST) as [Region, { name: string; reputation: number }[]][])
  .flatMap(([region, countries]) => countries.map(country => ({
    region,
    name: country.name,
    reputation: country.reputation
  })))
  .sort((a, b) => a.name.localeCompare(b.name, 'pl'));

const getCountriesForRegion = (region: Region) =>
  COUNTRY_OPTIONS
    .filter(country => country.region === region)
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'));

const findRegionForCountry = (countryName: string): Region | null =>
  COUNTRY_OPTIONS.find(country => country.name === countryName)?.region ?? null;

const getDefaultCountryForRegion = (region: Region): string => {
  const regionCountries = getCountriesForRegion(region);
  return regionCountries[0]?.name ?? pickNationalityForRegion(region);
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
  [PlayerPosition.GK]:  'text-yellow-400 border-t-yellow-400/60 border-x-yellow-500/30 border-b-black/60 bg-yellow-500/20',
  [PlayerPosition.DEF]: 'text-blue-400   border-t-blue-400/60   border-x-blue-500/30   border-b-black/60 bg-blue-500/20',
  [PlayerPosition.MID]: 'text-green-400  border-t-green-400/60  border-x-green-500/30  border-b-black/60 bg-green-500/20',
  [PlayerPosition.FWD]: 'text-red-400    border-t-red-400/60    border-x-red-500/30    border-b-black/60 bg-red-500/20',
};

const inputCls  = 'bg-black/40 border border-slate-700 rounded text-emerald-400 font-black italic uppercase tracking-tighter text-xs outline-none focus:border-yellow-500 transition-colors';
const selectCls = 'bg-black/40 border border-slate-700 rounded text-white   font-black italic uppercase tracking-tighter text-xs outline-none focus:border-yellow-500 transition-colors cursor-pointer';
const labelCls  = 'text-yellow-400 text-xs font-black italic uppercase tracking-tighter';

const EXPORT_COUNTRY_CODES = ['ENG', 'ESP', 'ITA', 'GER', 'FRA', 'POR', 'BUL', 'BEL', 'NED', 'AUT', 'SCO', 'TUR', 'SUI', 'CZE', 'SWE', 'CRO', 'SRB', 'DEN', 'GRE', 'KSA', 'QAT', 'USA', 'ARG', 'BRA'];
const EXPORT_GROUP_ORDER = ['L_PL_1', 'L_PL_2', 'L_PL_3', 'L_PL_4', ...EXPORT_COUNTRY_CODES];
const EXPORT_INTERNATIONAL_LEAGUE_IDS = ['L_CL', 'L_EL', 'L_CONF', 'L_ASIA', 'L_NA'];

const emptyStats = () => ({
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  cleanSheets: 0,
  matchesPlayed: 0,
  minutesPlayed: 0,
  seasonalChanges: {},
  ratingHistory: []
});

const getClubEditorTier = (leagueId: string, reputation = 5): number => {
  const polishTier = leagueId.match(/^L_PL_(\d)$/)?.[1];
  if (polishTier) return parseInt(polishTier, 10);
  if (reputation >= 16) return 1;
  if (reputation >= 11) return 2;
  if (reputation >= 7) return 3;
  return 4;
};

const getTierFilterForClub = (leagueId: string): string => {
  const polishTier = leagueId.match(/^L_PL_(\d)$/)?.[1];
  return polishTier ?? 'ALL';
};

export const EditorView: React.FC = () => {
  const { clubs, players, currentDate, getOrGenerateSquad, updatePlayer, setPlayers, importSquad, navigateTo, showGameNotification } = useGame();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<string>('');

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        const entries: { clubId: string; players: ImportedSquadPlayer[] }[] = Array.isArray(raw) ? raw : [raw];
        const valid: { clubId: string; players: ImportedSquadPlayer[] }[] = [];
        let errors = 0;
        entries.forEach(entry => {
          const match = clubs.find(c => c.id === entry.clubId || c.name === entry.clubId);
          if (!match || !Array.isArray(entry.players) || entry.players.length === 0) { errors++; return; }
          valid.push({ clubId: match.id, players: entry.players });
        });
        if (valid.length === 0) {
          setImportMsg(`Błąd: żaden klub nie pasuje (${errors} błędów).`);
          return;
        }
        importSquad(valid);
        const totalPlayers = valid.reduce((s, e) => s + e.players.length, 0);
        setImportMsg(`Zaimportowano ${totalPlayers} zawodników do ${valid.length} klub(ów).${errors > 0 ? ` (${errors} błędów)` : ''}`);
      } catch {
        setImportMsg('Błąd parsowania pliku JSON.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSelected, setExportSelected] = useState<Set<string>>(new Set());
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');

  const allExportableClubs = useMemo(() =>
    clubs.filter(c =>
      c.leagueId === 'L_PL_1' || c.leagueId === 'L_PL_2' || c.leagueId === 'L_PL_3' || c.leagueId === 'L_PL_4' ||
      (EXPORT_INTERNATIONAL_LEAGUE_IDS.includes(c.leagueId) && EXPORT_COUNTRY_CODES.includes(c.country ?? ''))
    ),
  [clubs]);

  const exportClubsByTier = useMemo(() => {
    const map: Record<string, typeof allExportableClubs> = {};
    allExportableClubs.forEach(c => {
      const key = EXPORT_INTERNATIONAL_LEAGUE_IDS.includes(c.leagueId) ? (c.country ?? c.leagueId) : c.leagueId;
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map;
  }, [allExportableClubs]);

  const TIER_LABELS: Record<string, string> = {
    'L_PL_1': 'Ekstraklasa (Liga 1)',
    'L_PL_2': 'Liga 2',
    'L_PL_3': 'Liga 3',
    'L_PL_4': 'Liga 4',
    'ENG': 'Anglia',
    'ESP': 'Hiszpania',
    'ITA': 'Włochy',
    'GER': 'Niemcy',
    'FRA': 'Francja',
    'POR': 'Portugalia',
    'BUL': 'Bułgaria',
    'BEL': 'Belgia',
    'NED': 'Holandia',
    'AUT': 'Austria',
    'SCO': 'Szkocja',
    'TUR': 'Turcja',
    'SUI': 'Szwajcaria',
    'CZE': 'Czechy',
    'SWE': 'Szwecja',
    'CRO': 'Chorwacja',
    'SRB': 'Serbia',
    'DEN': 'Dania',
    'GRE': 'Grecja',
    'KSA': 'Arabia Saudyjska',
    'QAT': 'Katar',
    'USA': 'USA',
    'ARG': 'Argentyna',
    'BRA': 'Brazylia',
  };

  const toggleExportClub = (id: string) => {
    setExportSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleExportTier = (leagueId: string) => {
    const tierIds = (exportClubsByTier[leagueId] ?? []).map(c => c.id);
    const allSelected = tierIds.every(id => exportSelected.has(id));
    setExportSelected(prev => {
      const next = new Set(prev);
      if (allSelected) tierIds.forEach(id => next.delete(id));
      else tierIds.forEach(id => next.add(id));
      return next;
    });
  };

  const handleExportConfirm = () => {
    if (exportSelected.size === 0) return;
    const data = Array.from(exportSelected).map(clubId => {
      const squad = getOrGenerateSquad(clubId);
      return {
        clubId,
        players: squad.map(p => ({
          firstName: p.firstName,
          lastName: p.lastName,
          age: p.age,
          position: p.position,
          nationality: p.nationality,
          nationalityCountry: p.nationalityCountry ?? '',
          annualSalary: p.annualSalary,
          marketValue: p.marketValue ?? 0,
          contractEndDate: p.contractEndDate,
          attributes: { ...p.attributes },
        })),
      };
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportSelected.size === 1
      ? `skład_${clubs.find(c => c.id === Array.from(exportSelected)[0])?.name ?? 'klub'}.json`
      : `składy_${exportSelected.size}_klubów.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    setExportSelected(new Set());
  };

  const [selectedTier, setSelectedTier]     = useState<string>('1');
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  const [firstName, setFirstName]           = useState('');
  const [lastName,  setLastName]            = useState('');
  const [age,       setAge]                 = useState<number>(20);
  const [nationality, setNationality]       = useState<Region>(Region.POLAND);
  const [nationalityCountry, setNationalityCountry] = useState<string>('Polska');
  const [position,  setPosition]            = useState<PlayerPosition>(PlayerPosition.MID);
  const [attrs,     setAttrs]               = useState<PlayerAttributes>({ ...DEFAULT_ATTRS });
  const [annualSalary,  setAnnualSalary]    = useState<number>(0);
  const [marketValue,   setMarketValue]     = useState<number>(0);
  const [contractEndDate, setContractEndDate] = useState<string>('');

  const filteredClubs = useMemo(() => {
    const list = selectedTier === 'ALL'
      ? clubs
      : clubs.filter(c => c.leagueId === `L_PL_${selectedTier}`);
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
  }, [clubs, selectedTier]);

  const clubPlayers = useMemo(() => {
    if (!selectedClubId) return [];
    return getOrGenerateSquad(selectedClubId);
  }, [selectedClubId, getOrGenerateSquad, players]);

  const selectedClub = useMemo(() => clubs.find(c => c.id === selectedClubId), [clubs, selectedClubId]);
  const nationalityCountryOptions = useMemo(() => {
    const regionCountries = getCountriesForRegion(nationality);
    if (nationalityCountry && !regionCountries.some(country => country.name === nationalityCountry)) {
      return [{ region: nationality, name: nationalityCountry, reputation: 1 }, ...regionCountries];
    }
    return regionCountries;
  }, [nationality, nationalityCountry]);

  const sortedPlayers = useMemo(() => {
    return [...clubPlayers].sort((a, b) => {
      const pd = POS_ORDER[a.position] - POS_ORDER[b.position];
      return pd !== 0 ? pd : b.overallRating - a.overallRating;
    });
  }, [clubPlayers]);

  const playerSearchResults = useMemo(() => {
    const q = playerSearch.trim().toLowerCase();
    if (!q) return [];

    const byKey = new Map<string, { player: Player; clubName: string; clubId: string }>();
    Object.entries(players).forEach(([clubId, squad]) => {
      const clubName = clubs.find(c => c.id === clubId)?.name ?? (clubId === 'FREE_AGENTS' ? 'Bez klubu' : clubId);
      squad.forEach(player => {
        byKey.set(`${clubId}:${player.id}`, { player, clubName, clubId });
      });
    });

    clubPlayers.forEach(player => {
      const clubName = selectedClub?.name ?? selectedClubId;
      byKey.set(`${selectedClubId}:${player.id}`, { player, clubName, clubId: selectedClubId });
    });

    return Array.from(byKey.values())
      .filter(({ player, clubName }) => {
        const haystack = `${player.firstName} ${player.lastName} ${clubName} ${player.position} ${player.overallRating} ${player.nationalityCountry ?? ''}`.toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => b.player.overallRating - a.player.overallRating)
      .slice(0, 80);
  }, [playerSearch, players, clubs, clubPlayers, selectedClub, selectedClubId]);

  const liveOvr = useMemo(() => PlayerAttributesGenerator.calculateOverall(attrs, position), [attrs, position]);

  // Gradient tła z kolorów drużyny
  const bgGradient = useMemo(() => {
    const colors = selectedClub?.colorsHex;
    if (!colors || colors.length === 0) return undefined;
    const c0 = colors[0];
    const c1 = colors[1] ?? colors[0];
    return `linear-gradient(150deg, ${c0}28 0%, ${c1}18 60%, transparent 100%)`;
  }, [selectedClub]);

  const resetPlayerForm = () => {
    setFirstName('');
    setLastName('');
    setAge(20);
    setNationality(Region.POLAND);
    setNationalityCountry('Polska');
    setPosition(PlayerPosition.MID);
    setAttrs({ ...DEFAULT_ATTRS });
    setAnnualSalary(0);
    setMarketValue(0);
    const now = currentDate instanceof Date ? currentDate : new Date(currentDate);
    setContractEndDate(new Date(now.getFullYear() + 2, 5, 30).toISOString().substring(0, 10));
  };

  const applyAutoFinance = (nextAttrs = attrs, nextPosition = position, nextAge = age) => {
    if (!selectedClub) return;
    const nextOvr = PlayerAttributesGenerator.calculateOverall(nextAttrs, nextPosition);
    const salary = FinanceService.getFairMarketSalary(nextOvr);
    const tempPlayer = {
      id: 'EDITOR_PREVIEW',
      firstName: firstName || 'Nowy',
      lastName: lastName || 'Zawodnik',
      age: nextAge,
      clubId: selectedClub.id,
      nationality,
      nationalityCountry,
      position: nextPosition,
      overallRating: nextOvr,
      attributes: nextAttrs,
      annualSalary: salary,
      contractEndDate: contractEndDate || '',
    } as Player;
    setAnnualSalary(salary);
    setMarketValue(FinanceService.calculateMarketValue(
      tempPlayer,
      selectedClub.reputation,
      getClubEditorTier(selectedClub.leagueId, selectedClub.reputation),
      selectedClub.country
    ));
  };

  useEffect(() => {
    if (isCreatingPlayer) return;
    if (selectedPlayerId && selectedClubId) {
      const p = clubPlayers.find(pl => pl.id === selectedPlayerId);
      if (p) {
        setFirstName(p.firstName);
        setLastName(p.lastName);
        setAge(p.age);
        setNationality(p.nationality);
        setNationalityCountry(p.nationalityCountry ?? pickNationalityForRegion(p.nationality));
        setPosition(p.position);
        setAttrs({ ...p.attributes });
        setAnnualSalary(p.annualSalary);
        setMarketValue(p.marketValue ?? 0);
        setContractEndDate(p.contractEndDate ? String(p.contractEndDate).substring(0, 10) : '');
      }
    } else {
      resetPlayerForm();
    }
  }, [selectedPlayerId, clubPlayers, selectedClubId, isCreatingPlayer]);

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

  const handleNationalityRegionChange = (region: Region) => {
    setNationality(region);
    setNationalityCountry(getDefaultCountryForRegion(region));
  };

  const handleNationalityCountryChange = (countryName: string) => {
    const region = findRegionForCountry(countryName);
    if (region) setNationality(region);
    setNationalityCountry(countryName);
  };

  const handleRandomProfile = () => {
    const club = selectedClub;
    const tier = club ? getClubEditorTier(club.leagueId, club.reputation) : 2;
    const rep = club?.reputation ?? 8;
    const generatedAge = 16 + Math.floor(Math.random() * 22);
    const generated = PlayerAttributesGenerator.generateAttributes(position, tier, rep, generatedAge, !!club && !club.leagueId.startsWith('L_PL_'));
    const name = NameGeneratorService.getRandomName(nationality);
    setFirstName(name.firstName);
    setLastName(name.lastName);
    setAge(generatedAge);
    setNationalityCountry(pickNationalityForRegion(nationality));
    setAttrs(generated.attributes);
    setTimeout(() => applyAutoFinance(generated.attributes, position, generatedAge), 0);
  };

  const startCreatePlayer = () => {
    setSelectedPlayerId('');
    setIsCreatingPlayer(true);
    resetPlayerForm();
  };

  const handleSelectSearchResult = (clubId: string, playerId: string) => {
    const club = clubs.find(c => c.id === clubId);
    setSelectedTier(club ? getTierFilterForClub(club.leagueId) : 'ALL');
    setSelectedClubId(clubId);
    setSelectedPlayerId(playerId);
    setIsCreatingPlayer(false);
  };

  const handleAgeChange = (val: string) => {
    let n = parseInt(val);
    if (isNaN(n)) n = 15;
    setAge(Math.min(45, Math.max(15, n)));
  };

  const handleSave = () => {
    if (!selectedClubId) {
      showGameNotification({
        title: 'Brak klubu',
        message: 'Najpierw wybierz klub, do którego ma trafić zawodnik.',
        tone: 'warning'
      });
      return;
    }
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    if (isCreatingPlayer && !trimmedFirstName && !trimmedLastName) {
      showGameNotification({
        title: 'Brak danych',
        message: 'Podaj imię albo nazwisko zawodnika.',
        tone: 'warning'
      });
      return;
    }
    const newOvr = PlayerAttributesGenerator.calculateOverall(attrs, position);
    if (isCreatingPlayer) {
      const club = clubs.find(c => c.id === selectedClubId);
      const now = currentDate instanceof Date ? currentDate : new Date(currentDate);
      const contractDate = contractEndDate
        ? new Date(contractEndDate).toISOString()
        : new Date(now.getFullYear() + 2, 5, 30).toISOString();
      const newPlayer: Player = {
        id: `EDITOR_${selectedClubId}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        age,
        clubId: selectedClubId,
        nationality,
        nationalityCountry,
        position,
        overallRating: newOvr,
        attributes: { ...attrs },
        stats: emptyStats(),
        cupStats: emptyStats(),
        euroStats: emptyStats(),
        nationalStats: emptyStats(),
        health: { status: HealthStatus.HEALTHY },
        condition: 100,
        suspensionMatches: 0,
        cupSuspensionMatches: 0,
        euroSuspensionMatches: 0,
        nationalSuspensionMatches: 0,
        annualSalary,
        marketValue,
        contractEndDate: contractDate,
        history: [{
          clubName: club?.name ?? selectedClubId,
          clubId: selectedClubId,
          fromYear: now.getFullYear(),
          fromMonth: now.getMonth() + 1,
          toYear: null,
          toMonth: null
        }],
        boardLockoutUntil: null,
        isUntouchable: false,
        negotiationStep: 0,
        negotiationLockoutUntil: null,
        contractLockoutUntil: null,
        fatigueDebt: 0,
        isNegotiationPermanentBlocked: false,
        transferLockoutUntil: null,
        freeAgentLockoutUntil: null,
        freeAgentClubLockouts: {}
      };
      setPlayers(prev => ({
        ...prev,
        [selectedClubId]: [...(prev[selectedClubId] ?? []), newPlayer]
      }));
      setSelectedPlayerId(newPlayer.id);
      setIsCreatingPlayer(false);
      showGameNotification({
        title: 'Zawodnik stworzony',
        message: `${newPlayer.firstName} ${newPlayer.lastName} dołącza do klubu. OVR: ${newOvr}.`,
        tone: 'success'
      });
      return;
    }
    if (!selectedPlayerId) return;
    updatePlayer(selectedClubId, selectedPlayerId, {
      firstName, lastName, age, nationality, nationalityCountry, position,
      attributes: { ...attrs }, overallRating: newOvr,
      annualSalary, marketValue, contractEndDate
    });
    showGameNotification({
      title: 'Zapisano zawodnika',
      message: `${firstName} ${lastName} ma teraz OVR: ${newOvr}.`,
      tone: 'success'
    });
  };

  const isSelected = !!selectedPlayerId || isCreatingPlayer;
  const displayedPlayers = playerSearch.trim() ? playerSearchResults : sortedPlayers.map(player => ({
    player,
    clubName: selectedClub?.name ?? selectedClubId,
    clubId: selectedClubId
  }));

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col overflow-hidden text-white font-black italic uppercase tracking-tighter">

      {/* HEADER */}
      <div className="flex items-center gap-4 px-5 py-2.5 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <span className="text-sm text-white mr-2">Edytor Piłkarzy</span>
        <span className="w-px h-4 bg-slate-700" />
        {['1', '2', '3', '4', 'ALL'].map(tier => (
          <button
            key={tier}
            onClick={() => { setSelectedTier(tier); setSelectedClubId(''); setSelectedPlayerId(''); setIsCreatingPlayer(false); }}
            className={`px-3 py-1 rounded text-xs transition-all active:translate-y-[2px] border-t border-x border-b ${selectedTier === tier ? 'bg-blue-600 border-t-blue-400/60 border-x-blue-500/30 border-b-black/60 text-white' : 'bg-white/5 border-t-white/10 border-x-white/5 border-b-black/40 text-slate-400 hover:bg-white/10 hover:text-white'}`}
          >
            {tier === 'ALL' ? 'Wszystkie kluby' : `Liga ${tier}`}
          </button>
        ))}
        <select
          value={selectedClubId}
          onChange={(e) => { setSelectedClubId(e.target.value); setSelectedPlayerId(''); setIsCreatingPlayer(false); }}
          className={`${selectCls} px-2 py-1 min-w-[200px]`}
        >
          <option value="">— wybierz klub —</option>
          {filteredClubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-3">
          {importMsg && (
            <span className="text-xs text-emerald-400 max-w-xs truncate">{importMsg}</span>
          )}
          <button
            onClick={startCreatePlayer}
            className="px-4 py-1.5 bg-emerald-800 rounded text-xs text-emerald-200 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-emerald-400/60 border-x-emerald-600/30 border-b-black/60"
          >
            Stwórz zawodnika
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            onClick={() => { setShowExportModal(true); setExportSelected(new Set()); }}
            className="px-4 py-1.5 bg-slate-700 rounded text-xs text-slate-300 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60"
          >
            Eksportuj składy
          </button>
          <button
            onClick={() => { setImportMsg(''); fileInputRef.current?.click(); }}
            className="px-4 py-1.5 bg-blue-900 rounded text-xs text-blue-300 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-blue-400/60 border-x-blue-700/30 border-b-black/60"
          >
            Importuj składy z pliku
          </button>
          <button
            onClick={() => navigateTo(ViewState.DASHBOARD)}
            className="px-4 py-1.5 bg-slate-800 rounded text-xs text-slate-300 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-white/10 border-x-white/5 border-b-black/60"
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
                      className={`px-2 py-1 rounded border-t border-x border-b text-xs transition-all active:translate-y-[2px] ${position === pos ? POS_COLOR[pos] : 'text-slate-500 border-t-white/10 border-x-white/5 border-b-black/40 bg-white/5 hover:text-white'}`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className={`${labelCls} mb-1`}>Region</div>
                <select value={nationality} onChange={(e) => handleNationalityRegionChange(e.target.value as Region)}
                  className={`${selectCls} px-2 py-1.5 w-36`}>
                  {Object.values(Region).map(r => (
                    <option key={r} value={r}>{REGION_LABELS[r]}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className={`${labelCls} mb-1`}>Narodowość</div>
                <select value={nationalityCountry} onChange={(e) => handleNationalityCountryChange(e.target.value)}
                  className={`${selectCls} px-2 py-1.5 w-44`}>
                  {nationalityCountryOptions.map(country => (
                    <option key={`${country.region}_${country.name}`} value={country.name}>{country.name}</option>
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
                className="px-6 py-2 bg-emerald-700 hover:bg-emerald-600 rounded text-sm text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-emerald-400/60 border-x-emerald-600/30 border-b-black/60">
                {isCreatingPlayer ? 'Dodaj do klubu' : 'Zapisz zmiany'}
              </button>
              <button onClick={handleRandomProfile}
                className="px-4 py-2 bg-blue-900 rounded text-sm text-blue-200 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-blue-400/60 border-x-blue-700/30 border-b-black/60">
                Losuj zawodnika
              </button>
              <button onClick={handleRandom}
                className="px-4 py-2 bg-slate-800 rounded text-sm text-slate-300 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-white/10 border-x-white/5 border-b-black/60">
                Wartości losowe
              </button>
              <button onClick={() => applyAutoFinance()}
                className="px-4 py-2 bg-slate-800 rounded text-sm text-slate-300 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-white/10 border-x-white/5 border-b-black/60">
                Przelicz finanse
              </button>
            </div>

          </div>
        </div>

        {/* PRAWA — LISTA ZAWODNIKÓW */}
        <div className="w-96 border-l border-slate-800 flex flex-col flex-shrink-0 bg-slate-900/40">
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-900 space-y-2">
            <span className="text-xs text-yellow-400">
              {playerSearch.trim() ? `Wyniki (${displayedPlayers.length})` : `Zawodnicy ${selectedClubId ? `(${clubPlayers.length})` : ''}`}
            </span>
            <input
              type="text"
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              className={`${inputCls} w-full px-2 py-1.5`}
              placeholder="szukaj zawodnika..."
            />
          </div>
          <div className="flex-1 overflow-y-auto editor-scroll">
            {!selectedClubId && !playerSearch.trim() ? (
              <div className="p-6 text-center text-slate-600 text-xs">Wybierz klub albo wpisz nazwisko</div>
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
                  {displayedPlayers.map(({ player: p, clubName, clubId }) => (
                    <tr
                      key={`${clubId}:${p.id}`}
                      onClick={() => handleSelectSearchResult(clubId, p.id)}
                      className={`border-b border-slate-800/50 cursor-pointer transition-colors ${selectedPlayerId === p.id && selectedClubId === clubId ? 'bg-blue-600/20' : 'hover:bg-slate-800/50'}`}
                    >
                      <td className="px-3 py-1.5">
                        <span className={p.position === PlayerPosition.GK ? 'text-yellow-400' : p.position === PlayerPosition.DEF ? 'text-blue-400' : p.position === PlayerPosition.MID ? 'text-green-400' : 'text-red-400'}>
                          {p.position}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-white">
                        <div>{p.lastName}</div>
                        {playerSearch.trim() && <div className="text-[9px] text-slate-500 truncate max-w-[92px]">{clubName}</div>}
                      </td>
                      <td className="px-2 py-1.5 text-slate-400">{p.firstName}</td>
                      <td className="px-3 py-1.5 text-right text-emerald-400 tabular-nums">{p.overallRating}</td>
                    </tr>
                  ))}
                  {displayedPlayers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-slate-600">Brak wyników</td>
                    </tr>
                  )}
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

      {showExportModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setShowExportModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-[520px] max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
              <span className="text-sm text-yellow-400">Wybierz kluby do eksportu</span>
              <button onClick={() => setShowExportModal(false)} className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto editor-scroll px-5 py-3">
              {EXPORT_GROUP_ORDER.map(leagueId => {
                const tierClubs = exportClubsByTier[leagueId] ?? [];
                if (tierClubs.length === 0) return null;
                const allChecked = tierClubs.every(c => exportSelected.has(c.id));
                return (
                  <div key={leagueId} className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-yellow-400">{TIER_LABELS[leagueId]}</span>
                      <button
                        onClick={() => toggleExportTier(leagueId)}
                        className="text-[10px] px-2 py-0.5 rounded border-t border-x border-b border-t-white/10 border-x-white/5 border-b-black/40 bg-white/5 text-slate-400 hover:text-white transition-all active:translate-y-[2px]"
                      >
                        {allChecked ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {tierClubs.map(c => (
                        <label key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-slate-800 transition-colors">
                          <input
                            type="checkbox"
                            checked={exportSelected.has(c.id)}
                            onChange={() => toggleExportClub(c.id)}
                            className="accent-yellow-400"
                          />
                          <span className="text-xs text-white">{c.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-slate-700 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-slate-400">Zaznaczono: {exportSelected.size} klub(ów)</span>
              <button
                onClick={handleExportConfirm}
                disabled={exportSelected.size === 0}
                className="px-5 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-xs text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-emerald-400/60 border-x-emerald-600/30 border-b-black/60 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Pobierz plik JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
