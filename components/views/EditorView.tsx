
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { ImportedSquadPlayer } from '../../context/GameContext';
import { ViewState, PlayerPosition, Region, PlayerAttributes, Player, PlayerLoanInfo, HealthStatus, Club, ClubManagement, ClubKit } from '../../types';
import { PlayerAttributesGenerator } from '../../services/PlayerAttributesGenerator';
import { pickNationalityForRegion, REGION_TO_NT_LIST } from '../../services/NationalityService';
import { NameGeneratorService } from '../../services/NameGeneratorService';
import { FinanceService } from '../../services/FinanceService';
import { LineupService } from '../../services/LineupService';
import { SquadGeneratorService } from '../../services/SquadGeneratorService';
import { STAFF_ROLE_ATTRS } from '../../services/StaffGenerationService';
import { createDefaultClubKits, createDefaultNationalTeamKits, getClubKits, getNationalTeamKits } from '../../resources/ClubKits';
import { KitPreview } from '../common/KitPreview';

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

const STAFF_ROLE_LABELS: Record<string, string> = {
  ASSISTANT_COACH: 'Asystent trenera',
  GOALKEEPER_COACH: 'Trener bramkarzy',
  FITNESS_COACH: 'Trener fitness',
  VIDEO_ANALYST: 'Analityk video',
  PHYSIOTHERAPIST: 'Fizjoterapeuta',
  CLUB_DOCTOR: 'Lekarz klubowy',
};

const COACH_ATTR_LABELS: { key: string; label: string }[] = [
  { key: 'experience',     label: 'Doświadczenie' },
  { key: 'decisionMaking', label: 'Podejmowanie decyzji' },
  { key: 'motivation',     label: 'Motywacja' },
  { key: 'training',       label: 'Trening' },
];

const MANAGEMENT_ROLE_LABELS: Record<string, string> = {
  owner:             'Właściciel',
  ceo:               'Prezes',
  sportingDirector:  'Dyrektor sportowy',
  cfo:               'Dyrektor finansowy',
  coo:               'Dyrektor operacyjny',
  marketingDirector: 'Dyrektor marketingu',
  academyDirector:   'Dyrektor akademii',
};

const MANAGEMENT_KEYS: (keyof ClubManagement)[] = ['owner', 'ceo', 'cfo', 'coo', 'marketingDirector', 'academyDirector'];
const ZARZAD_PERSON_KEYS = ['owner', 'ceo', 'sportingDirector', 'cfo', 'coo', 'marketingDirector', 'academyDirector'] as const;
type ZarzadPersonKey = typeof ZARZAD_PERSON_KEYS[number];

const KIT_PATTERN_OPTIONS: { value: NonNullable<ClubKit['pattern']>; label: string }[] = [
  { value: 'solid',              label: 'Zwykła' },
  { value: 'horizontal_stripes', label: 'Pasy poziome' },
  { value: 'vertical_stripes',   label: 'Pasy pionowe' },
  { value: 'diagonal_stripe',    label: 'Pas ukośny' },
  { value: 'center_band',        label: 'Pas poziomy pośrodku' },
  { value: 'center_vertical_stripe', label: 'Pas pionowy pośrodku' },
];

const NT_CONTINENT_BTNS = [
  { value: 'Europe',        label: 'Europa' },
  { value: 'Africa',        label: 'Afryka' },
  { value: 'Asia',          label: 'Azja' },
  { value: 'North America', label: 'Ameryka Płn.' },
  { value: 'South America', label: 'Ameryka Płd.' },
  { value: 'Oceania',       label: 'Oceania' },
] as const;

const MANAGEMENT_ATTR_LABELS: Record<string, { key: string; label: string }[]> = {
  owner:             [{ key: 'cierpliwosc', label: 'Cierpliwość' }, { key: 'ambicja', label: 'Ambicja' }, { key: 'hojnosc', label: 'Hojność' }, { key: 'doswiadczenie', label: 'Doświadczenie' }],
  ceo:               [{ key: 'cierpliwosc', label: 'Cierpliwość' }, { key: 'ambicja', label: 'Ambicja' }, { key: 'hojnosc', label: 'Hojność' }, { key: 'doswiadczenie', label: 'Doświadczenie' }],
  sportingDirector:  [{ key: 'patience', label: 'Cierpliwość' }, { key: 'control', label: 'Kontrola' }, { key: 'flexibility', label: 'Elastyczność' }, { key: 'ambition', label: 'Ambicja' }, { key: 'footballKnowledge', label: 'Wiedza piłkarska' }, { key: 'negotiation', label: 'Negocjacje' }, { key: 'developmentVision', label: 'Wizja rozwoju' }, { key: 'financialDiscipline', label: 'Dyscyplina finansowa' }],
  cfo:               [{ key: 'hojnosc', label: 'Hojność' }, { key: 'doswiadczenie', label: 'Doświadczenie' }, { key: 'zdolnosciMarketingowe', label: 'Zdolności marketingowe' }, { key: 'dyscyplinaFinansowa', label: 'Dyscyplina finansowa' }],
  coo:               [{ key: 'doswiadczenie', label: 'Doświadczenie' }, { key: 'organizacja', label: 'Organizacja' }, { key: 'zarzadzanieInfrastruktura', label: 'Zarządzanie infrastrukturą' }, { key: 'efektywnoscKosztowa', label: 'Efektywność kosztowa' }, { key: 'logistykaIPlanowanie', label: 'Logistyka i planowanie' }],
  marketingDirector: [{ key: 'doswiadczenie', label: 'Doświadczenie' }, { key: 'zdolnosciMarketingowe', label: 'Zdolności marketingowe' }],
  academyDirector:   [{ key: 'doswiadczenie', label: 'Doświadczenie' }, { key: 'rozwojMlodziezy', label: 'Rozwój młodzieży' }, { key: 'zarzadzanie', label: 'Zarządzanie' }],
};

const splitLegacyManagement = (management: unknown): { management?: ClubManagement; sportingDirector?: unknown } => {
  if (!management || typeof management !== 'object' || Array.isArray(management)) return {};
  const { sportingDirector, ...managementWithoutSportingDirector } = management as Record<string, unknown>;
  return {
    management: managementWithoutSportingDirector as unknown as ClubManagement,
    sportingDirector,
  };
};

const getZarzadPerson = (club: Club | null | undefined, key: string): any => {
  if (!club) return null;
  if (key === 'sportingDirector') return club.sportingDirector;
  return (club.management as Record<string, any> | undefined)?.[key];
};

const LEAGUE_FILTER_BTNS = [
  { label: 'Ekstraklasa', filter: 'L_PL_1' },
  { label: '1 Liga',      filter: 'L_PL_2' },
  { label: '2 Liga',      filter: 'L_PL_3' },
  { label: '3 Liga',      filter: 'L_PL_4' },
] as const;

const EXPORT_COUNTRY_CODES = ['ENG', 'ESP', 'ITA', 'GER', 'FRA', 'POR', 'BUL', 'BEL', 'NED', 'AUT', 'SCO', 'TUR', 'SUI', 'CZE', 'SVK', 'SWE', 'CRO', 'SRB', 'DEN', 'GRE', 'KSA', 'QAT', 'USA', 'ARG', 'BRA', 'RUS', 'BLR'];
const EXPORT_GROUP_ORDER = ['L_PL_1', 'L_PL_2', 'L_PL_3', 'L_PL_4', ...EXPORT_COUNTRY_CODES];
const EXPORT_INTERNATIONAL_LEAGUE_IDS = ['L_CL', 'L_EL', 'L_CONF', 'L_ASIA', 'L_NA', 'L_SA'];
const CLUB_CONTINENT_EXPORT_OPTIONS = [
  { value: 'Europe',        label: 'Europa',        leagueIds: ['L_CL', 'L_EL', 'L_CONF'] },
  { value: 'Africa',        label: 'Afryka',        leagueIds: ['L_AFRICA'] },
  { value: 'Asia',          label: 'Azja',          leagueIds: ['L_ASIA'] },
  { value: 'North America', label: 'Ameryka Płn.',  leagueIds: ['L_NA'] },
  { value: 'South America', label: 'Ameryka Płd.',  leagueIds: ['L_SA'] },
] as const;

const getClubDataExportEntry = (club: Club) => ({
  clubId: club.id,
  name: club.name,
  stadiumName: club.stadiumName,
  stadiumCapacity: club.stadiumCapacity,
  reputation: club.reputation,
  colorsHex: club.colorsHex,
  kits: getClubKits(club),
  budget: club.budget,
  transferBudget: club.transferBudget,
  reserveBudget: club.reserveBudget ?? 0,
  signingBonusPool: club.signingBonusPool,
});

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

const toDateInputValue = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).substring(0, 10);
  return date.toISOString().substring(0, 10);
};

const toIsoDate = (value: string): string => new Date(value).toISOString();

export const EditorView: React.FC = () => {
  const { clubs, players, lineups, coaches, staffMembers, nationalTeams, currentDate, getOrGenerateSquad, updatePlayer, updateLineup, setPlayers, importSquad, navigateTo, showGameNotification, setClubs, setCoaches, setStaffMembers, setNationalTeams, userTeamId } = useGame();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<string>('');

  const clubImportRef = useRef<HTMLInputElement>(null);
  const [clubImportMsg, setClubImportMsg] = useState('');
  const [clubContinentExport, setClubContinentExport] = useState('Europe');

  const kitLeagueImportRef = useRef<HTMLInputElement>(null);
  const [kitImportMsg, setKitImportMsg] = useState('');

  const ntImportRef = useRef<HTMLInputElement>(null);
  const [ntImportMsg, setNTImportMsg] = useState('');

  const sztabImportRef = useRef<HTMLInputElement>(null);
  const [sztabImportMsg, setSztabImportMsg] = useState('');

  const zarzadImportRef = useRef<HTMLInputElement>(null);
  const [zarzadImportMsg, setZarzadImportMsg] = useState('');

  const handleExportClubData = () => {
    if (!selectedTeamClub) return;
    const data = getClubDataExportEntry(selectedTeamClub);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dane_${selectedTeamClub.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportContinentClubData = () => {
    const continent = CLUB_CONTINENT_EXPORT_OPTIONS.find(option => option.value === clubContinentExport);
    if (!continent) return;
    const continentClubs = clubs
      .filter(club => continent.leagueIds.some(leagueId => leagueId === club.leagueId))
      .filter(club => continent.value !== 'Europe' || (!club.leagueId.startsWith('L_PL_') && club.country !== 'POL'))
      .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
    if (continentClubs.length === 0) return;
    const data = continentClubs.map(getClubDataExportEntry);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dane_klubow_${continent.label.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClubData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        const entries = Array.isArray(raw) ? raw : [raw];
        let updated = 0;
        let errors = 0;
        setClubs(prev => {
          let next = [...prev];
          entries.forEach((entry: Record<string, unknown>) => {
            const idx = next.findIndex(c => c.id === entry.clubId || c.name === entry.name);
            if (idx === -1) { errors++; return; }
            const c = next[idx];
            next[idx] = {
              ...c,
              name:             typeof entry.name === 'string'            ? entry.name            : c.name,
              stadiumName:      typeof entry.stadiumName === 'string'      ? entry.stadiumName      : c.stadiumName,
              stadiumCapacity:  typeof entry.stadiumCapacity === 'number'  ? entry.stadiumCapacity  : c.stadiumCapacity,
              reputation:       typeof entry.reputation === 'number'       ? entry.reputation       : c.reputation,
              colorsHex:        Array.isArray(entry.colorsHex)             ? entry.colorsHex        : c.colorsHex,
              kits:             Array.isArray(entry.kits)                  ? entry.kits as ClubKit[] : c.kits,
              budget:           typeof entry.budget === 'number'           ? entry.budget           : c.budget,
              transferBudget:   typeof entry.transferBudget === 'number'   ? entry.transferBudget   : c.transferBudget,
              reserveBudget:    typeof entry.reserveBudget === 'number'    ? entry.reserveBudget    : c.reserveBudget,
              signingBonusPool: typeof entry.signingBonusPool === 'number' ? entry.signingBonusPool : c.signingBonusPool,
            };
            updated++;
          });
          return next;
        });
        setClubImportMsg(
          updated > 0
            ? `Zaktualizowano ${updated} klub(ów).${errors > 0 ? ` (${errors} nieznanych)` : ''}`
            : `Błąd: żaden klub nie pasuje (${errors} wpisów).`
        );
      } catch {
        setClubImportMsg('Błąd parsowania pliku JSON.');
      }
      if (clubImportRef.current) clubImportRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleExportLeagueKits = () => {
    if (!teamLeagueFilter || teamLeagueKitClubs.length === 0) return;
    const leagueName = TIER_LABELS[teamLeagueFilter] ?? teamLeagueFilter;
    const data = {
      type: 'club_kits_bundle',
      scope: teamLeagueFilter,
      leagueName,
      clubs: teamLeagueKitClubs.map(club => ({
        clubId: club.id,
        clubName: club.name,
        leagueId: club.leagueId,
        country: club.country ?? '',
        kits: getClubKits(club),
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stroje_${leagueName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportLeagueKits = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        const entries = Array.isArray(raw?.clubs)
          ? raw.clubs
          : Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.kits)
              ? [raw]
              : [];
        if (entries.length === 0) {
          setKitImportMsg('Błąd: plik nie zawiera listy strojów klubów.');
          return;
        }
        let updated = 0;
        let skipped = 0;
        let selectedKits: ClubKit[] | null = null;
        setClubs(prev => prev.map(club => {
          const entry = entries.find((item: Record<string, unknown>) =>
            Array.isArray(item.kits) && (
              item.clubId === club.id ||
              item.clubName === club.name ||
              item.name === club.name
            )
          ) as { kits?: ClubKit[] } | undefined;
          if (!entry?.kits) return club;
          const kits = getClubKits({ ...club, kits: entry.kits });
          updated++;
          if (club.id === selectedTeamClub?.id) selectedKits = kits;
          return { ...club, kits };
        }));
        skipped = entries.length - updated;
        if (selectedKits) setEditTeamKits(selectedKits);
        setKitImportMsg(updated > 0
          ? `Zaimportowano stroje ${updated} klubów.${skipped > 0 ? ` (${skipped} pominięto)` : ''}`
          : 'Błąd: żaden klub z pliku nie pasuje.'
        );
      } catch {
        setKitImportMsg('Błąd parsowania pliku JSON.');
      }
      if (kitLeagueImportRef.current) kitLeagueImportRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleExportNationalTeamData = () => {
    const data = {
      type: 'national_teams',
      teams: nationalTeams.map(team => ({
        teamId: team.id,
        name: team.name,
        continent: team.continent,
        stadiumName: team.stadiumName,
        stadiumCapacity: team.stadiumCapacity,
        reputation: team.reputation,
        colorsHex: team.colorsHex,
        kits: getNationalTeamKits(team),
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reprezentacje.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportNationalTeamData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        const entries = Array.isArray(raw?.teams)
          ? raw.teams
          : Array.isArray(raw)
            ? raw
            : [raw];
        let updated = 0;
        let skipped = 0;
        let selectedTeamKits: ClubKit[] | null = null;
        setNationalTeams(prev => prev.map(team => {
          const entry = entries.find((item: Record<string, unknown>) =>
            item.teamId === team.id ||
            item.id === team.id ||
            item.name === team.name
          ) as Record<string, unknown> | undefined;
          if (!entry) return team;
          const nextTeam = {
            ...team,
            stadiumName: typeof entry.stadiumName === 'string' ? entry.stadiumName : team.stadiumName,
            stadiumCapacity: typeof entry.stadiumCapacity === 'number' ? entry.stadiumCapacity : team.stadiumCapacity,
            reputation: typeof entry.reputation === 'number'
              ? Math.min(20, Math.max(1, entry.reputation))
              : team.reputation,
            colorsHex: Array.isArray(entry.colorsHex) ? entry.colorsHex as string[] : team.colorsHex,
            kits: Array.isArray(entry.kits) ? entry.kits as ClubKit[] : team.kits,
          };
          const kits = getNationalTeamKits(nextTeam);
          updated++;
          if (team.id === selectedNTEditorTeam?.id) selectedTeamKits = kits;
          return { ...nextTeam, kits };
        }));
        skipped = entries.length - updated;
        if (selectedTeamKits) setEditNTKits(selectedTeamKits);
        setNTImportMsg(updated > 0
          ? `Zaimportowano ${updated} reprezentację(-e).${skipped > 0 ? ` (${skipped} pominięto)` : ''}`
          : 'Błąd: żadna reprezentacja z pliku nie pasuje.'
        );
      } catch {
        setNTImportMsg('Błąd parsowania pliku JSON.');
      }
      if (ntImportRef.current) ntImportRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleImportSztab = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        let updated = 0;
        if (raw.coach && typeof raw.coach === 'object' && raw.coach.id) {
          setCoaches(prev => ({ ...prev, [raw.coach.id]: { ...prev[raw.coach.id], ...raw.coach } }));
          updated++;
        }
        if (Array.isArray(raw.staff)) {
          raw.staff.forEach((s: any) => {
            if (s && s.id) {
              setStaffMembers(prev => ({ ...prev, [s.id]: { ...prev[s.id], ...s } }));
              updated++;
            }
          });
        }
        setSztabImportMsg(updated > 0 ? `Zaimportowano ${updated} osób.` : 'Brak danych do importu.');
      } catch {
        setSztabImportMsg('Błąd parsowania pliku JSON.');
      }
      if (sztabImportRef.current) sztabImportRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleImportZarzad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        if (!raw.clubId || !raw.management) {
          setZarzadImportMsg('Błąd: plik nie zawiera wymaganych danych.');
          return;
        }
        const { management, sportingDirector: legacySportingDirector } = splitLegacyManagement(raw.management);
        const importedSportingDirector = raw.sportingDirector ?? legacySportingDirector;
        let found = false;
        setClubs(prev => prev.map(c => {
          if (c.id !== raw.clubId) return c;
          found = true;
          return {
            ...c,
            management: { ...c.management, ...management } as ClubManagement,
            sportingDirector: importedSportingDirector ?? c.sportingDirector,
          };
        }));
        setZarzadImportMsg(found ? `Zarząd klubu "${raw.clubName ?? raw.clubId}" zaktualizowany.` : `Błąd: klub o ID "${raw.clubId}" nie znaleziony.`);
      } catch {
        setZarzadImportMsg('Błąd parsowania pliku JSON.');
      }
      if (zarzadImportRef.current) zarzadImportRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleExportSztab = () => {
    if (!sztabClub) return;
    const coachObj = sztabClub.coachId ? coaches[sztabClub.coachId] ?? null : null;
    const staffArr = (sztabClub.staffIds ?? []).map(id => staffMembers[id]).filter(Boolean);
    const data = { clubId: sztabClub.id, clubName: sztabClub.name, coach: coachObj, staff: staffArr };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sztab_${sztabClub.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportZarzad = () => {
    if (!zarzadClub) return;
    const data = {
      clubId: zarzadClub.id,
      clubName: zarzadClub.name,
      management: zarzadClub.management ?? null,
      sportingDirector: zarzadClub.sportingDirector ?? null,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zarzad_${zarzadClub.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportLeagueSztab = () => {
    if (!sztabLeagueFilter) return;
    const leagueName = TIER_LABELS[sztabLeagueFilter] ?? sztabLeagueFilter;
    const leagueClubs = clubs
      .filter(club => club.leagueId === sztabLeagueFilter)
      .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
    const data = {
      type: 'staff_bundle',
      scope: sztabLeagueFilter,
      leagueName,
      clubs: leagueClubs.map(club => ({
        clubId: club.id,
        clubName: club.name,
        coach: club.coachId ? coaches[club.coachId] ?? null : null,
        staff: (club.staffIds ?? []).map(id => staffMembers[id]).filter(Boolean),
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sztab_${leagueName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportLeagueZarzad = () => {
    if (!zarzadLeagueFilter) return;
    const leagueName = TIER_LABELS[zarzadLeagueFilter] ?? zarzadLeagueFilter;
    const leagueClubs = clubs
      .filter(club => club.leagueId === zarzadLeagueFilter)
      .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
    const data = {
      type: 'management_bundle',
      scope: zarzadLeagueFilter,
      leagueName,
      clubs: leagueClubs.map(club => ({
        clubId: club.id,
        clubName: club.name,
        management: club.management ?? null,
        sportingDirector: club.sportingDirector ?? null,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zarzad_${leagueName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
    'SVK': 'Słowacja',
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
    'RUS': 'Rosja',
    'BLR': 'Białoruś',
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
          clubId: p.clubId,
          position: p.position,
          secondaryPosition: p.secondaryPosition ?? null,
          secondaryPositionRating: p.secondaryPositionRating ?? 0,
          nationality: p.nationality,
          nationalityCountry: p.nationalityCountry ?? '',
          annualSalary: p.annualSalary,
          marketValue: p.marketValue ?? 0,
          contractEndDate: p.contractEndDate,
          loan: p.loan ?? null,
          transferPendingClubId: p.transferPendingClubId ?? '',
          transferReportDate: p.transferReportDate ?? '',
          transferPendingFee: p.transferPendingFee ?? 0,
          transferPendingSalary: p.transferPendingSalary ?? 0,
          transferPendingBonus: p.transferPendingBonus ?? 0,
          transferPendingContractYears: p.transferPendingContractYears ?? 0,
          isAvailableForLoan: !!p.isAvailableForLoan,
          isOnTransferList: !!p.isOnTransferList,
          isUntouchable: !!p.isUntouchable,
          squadRole: p.squadRole ?? null,
          attributes: { ...p.attributes },
          nationalStats: {
            matchesPlayed: p.nationalStats?.matchesPlayed ?? 0,
            goals: p.nationalStats?.goals ?? 0,
          },
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

  const [activeSection, setActiveSection] = useState<'GRACZE' | 'FINANSE' | 'KLUBY' | 'REPREZENTACJE' | 'SZTAB' | 'ZARZĄD' | 'TRENERZY'>('GRACZE');
  const [clubsLeagueFilter, setClubsLeagueFilter] = useState<string>('L_PL_1');
  const [editingSigningPool, setEditingSigningPool] = useState<Record<string, string>>({});
  const [trenerzySearch, setTrenerzySearch] = useState('');
  const [trenerzySelectedId, setTrenerzySelectedId] = useState('');
  const [editTrenerFirstName, setEditTrenerFirstName] = useState('');
  const [editTrenerLastName, setEditTrenerLastName] = useState('');
  const [editTrenerAge, setEditTrenerAge] = useState('');
  const [editTrenerNationality, setEditTrenerNationality] = useState('');
  const [editTrenerAttrs, setEditTrenerAttrs] = useState<Record<string, number>>({});
  const [editTrenerTacticOffensive, setEditTrenerTacticOffensive] = useState('');
  const [editTrenerTacticNeutral, setEditTrenerTacticNeutral] = useState('');
  const [editTrenerTacticDefensive, setEditTrenerTacticDefensive] = useState('');

  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [teamSearchClubId, setTeamSearchClubId] = useState('');
  const [teamLeagueFilter, setTeamLeagueFilter] = useState('');
  const [editTeamBudget, setEditTeamBudget] = useState('');
  const [editTeamTransferBudget, setEditTeamTransferBudget] = useState('');
  const [editTeamReserveBudget, setEditTeamReserveBudget] = useState('');
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamStadiumName, setEditTeamStadiumName] = useState('');
  const [editTeamStadiumCapacity, setEditTeamStadiumCapacity] = useState('');
  const [editTeamReputation, setEditTeamReputation] = useState('');
  const [editTeamColors, setEditTeamColors] = useState<string[]>([]);
  const [editTeamKits, setEditTeamKits] = useState<ClubKit[]>([]);
  const [editTeamSigningPool, setEditTeamSigningPool] = useState('');
  const [showRepairPanel, setShowRepairPanel] = useState(false);

  const [ntContinentFilter, setNTContinentFilter] = useState('Europe');
  const [selectedNTEditorId, setSelectedNTEditorId] = useState('');
  const [editNTStadiumName, setEditNTStadiumName] = useState('');
  const [editNTStadiumCapacity, setEditNTStadiumCapacity] = useState('');
  const [editNTReputation, setEditNTReputation] = useState('');
  const [editNTKits, setEditNTKits] = useState<ClubKit[]>([]);

  const [sztabLeagueFilter, setSztabLeagueFilter] = useState('');
  const [sztabSearchQuery, setSztabSearchQuery] = useState('');
  const [sztabClubId, setSztabClubId] = useState('');
  const [sztabPersonId, setSztabPersonId] = useState('');
  const [sztabPersonType, setSztabPersonType] = useState<'coach' | 'staff' | null>(null);
  const [editSztabFirstName, setEditSztabFirstName] = useState('');
  const [editSztabLastName, setEditSztabLastName] = useState('');
  const [editSztabAge, setEditSztabAge] = useState('');
  const [editSztabAttrs, setEditSztabAttrs] = useState<Record<string, number>>({});
  const [editSztabSalary, setEditSztabSalary] = useState('');
  const [editSztabContractEnd, setEditSztabContractEnd] = useState('');

  const [zarzadLeagueFilter, setZarzadLeagueFilter] = useState('');
  const [zarzadSearchQuery, setZarzadSearchQuery] = useState('');
  const [zarzadClubId, setZarzadClubId] = useState('');
  const [zarzadPersonKey, setZarzadPersonKey] = useState<string | null>(null);
  const [editZarzadFirstName, setEditZarzadFirstName] = useState('');
  const [editZarzadLastName, setEditZarzadLastName] = useState('');
  const [editZarzadAge, setEditZarzadAge] = useState('');
  const [editZarzadAttrs, setEditZarzadAttrs] = useState<Record<string, number>>({});

  const [selectedTier, setSelectedTier]     = useState<string>('1');
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  const [firstName, setFirstName]           = useState('');
  const [lastName,  setLastName]            = useState('');
  const [age,       setAge]                 = useState<number>(20);
  const [nationality, setNationality]       = useState<Region>(Region.POLAND);
  const [nationalityCountry, setNationalityCountry] = useState<string>('Polska');
  const [position,  setPosition]            = useState<PlayerPosition>(PlayerPosition.MID);
  const [secondaryPosition, setSecondaryPosition] = useState<PlayerPosition | null>(null);
  const [secondaryPositionRating, setSecondaryPositionRating] = useState<number>(50);
  const [attrs,     setAttrs]               = useState<PlayerAttributes>({ ...DEFAULT_ATTRS });
  const [annualSalary,  setAnnualSalary]    = useState<number>(0);
  const [marketValue,   setMarketValue]     = useState<number>(0);
  const [contractEndDate, setContractEndDate] = useState<string>('');
  const [isLoanedOut, setIsLoanedOut] = useState(false);
  const [loanParentClubId, setLoanParentClubId] = useState<string>('');
  const [loanDestinationClubId, setLoanDestinationClubId] = useState<string>('');
  const [loanStartDate, setLoanStartDate] = useState<string>('');
  const [loanEndDate, setLoanEndDate] = useState<string>('');
  const [hasPendingTransfer, setHasPendingTransfer] = useState(false);
  const [transferPendingClubId, setTransferPendingClubId] = useState<string>('');
  const [transferReportDate, setTransferReportDate] = useState<string>('');
  const [transferPendingFee, setTransferPendingFee] = useState<number>(0);
  const [transferPendingSalary, setTransferPendingSalary] = useState<number>(0);
  const [transferPendingContractYears, setTransferPendingContractYears] = useState<number>(1);
  const [playerTargetClubId, setPlayerTargetClubId] = useState<string>('');
  const [isUntouchable, setIsUntouchable] = useState(false);
  const [isOnTransferList, setIsOnTransferList] = useState(false);
  const [isAvailableForLoan, setIsAvailableForLoan] = useState(false);
  const [squadRole, setSquadRole] = useState<'STARTER' | 'KEY_PLAYER' | null>(null);
  const [nationalMatchesPlayed, setNationalMatchesPlayed] = useState(0);
  const [nationalGoals, setNationalGoals] = useState(0);

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
  const loanClubOptions = useMemo(() =>
    [...clubs]
      .sort((a, b) => a.name.localeCompare(b.name, 'pl')),
  [clubs]);
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

  const handlePrimaryPositionChange = (pos: PlayerPosition) => {
    setPosition(pos);
    setSecondaryPosition(prev => prev === pos ? null : prev);
  };

  const handleSecondaryRatingChange = (value: string) => {
    const parsed = parseInt(value, 10);
    setSecondaryPositionRating(Number.isNaN(parsed) ? 50 : Math.max(1, Math.min(99, parsed)));
  };

  // Gradient tła z kolorów drużyny
  const bgGradient = useMemo(() => {
    const colors = selectedClub?.colorsHex;
    if (!colors || colors.length === 0) return undefined;
    const c0 = colors[0];
    const c1 = colors[1] ?? colors[0];
    return `linear-gradient(150deg, ${c0}28 0%, ${c1}18 60%, transparent 100%)`;
  }, [selectedClub]);

  const teamSearchResults = useMemo(() => {
    const q = teamSearchQuery.trim().toLowerCase();
    if (teamLeagueFilter) {
      const isPolish = teamLeagueFilter.startsWith('L_PL_');
      return clubs
        .filter(c => isPolish ? c.leagueId === teamLeagueFilter : c.country === teamLeagueFilter)
        .filter(c => !q || c.name.toLowerCase().includes(q) || (c.shortName ?? '').toLowerCase().includes(q))
        .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
        .slice(0, 50);
    }
    if (!q) return [];
    return clubs
      .filter(c => c.name.toLowerCase().includes(q) || (c.shortName ?? '').toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
      .slice(0, 30);
  }, [teamSearchQuery, teamLeagueFilter, clubs]);

  const teamLeagueKitClubs = useMemo(() => {
    if (!teamLeagueFilter) return [];
    const isPolish = teamLeagueFilter.startsWith('L_PL_');
    return clubs
      .filter(c => isPolish ? c.leagueId === teamLeagueFilter : c.country === teamLeagueFilter)
      .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
  }, [clubs, teamLeagueFilter]);

  const selectedTeamClub = useMemo(() => clubs.find(c => c.id === teamSearchClubId), [clubs, teamSearchClubId]);
  const selectedTeamSquad = useMemo(() => teamSearchClubId ? getOrGenerateSquad(teamSearchClubId) : [], [teamSearchClubId, getOrGenerateSquad, players]);
  const selectedTeamCoach = useMemo(() => selectedTeamClub?.coachId ? coaches[selectedTeamClub.coachId] ?? null : null, [selectedTeamClub, coaches]);
  const selectedTeamStaff = useMemo(() => {
    if (!selectedTeamClub?.staffIds) return [];
    return selectedTeamClub.staffIds.map(id => staffMembers[id]).filter(Boolean);
  }, [selectedTeamClub, staffMembers]);

  const filteredNationalTeams = useMemo(() =>
    nationalTeams
      .filter(team => team.continent === ntContinentFilter)
      .sort((a, b) => a.name.localeCompare(b.name, 'pl')),
  [nationalTeams, ntContinentFilter]);

  const selectedNTEditorTeam = useMemo(() =>
    nationalTeams.find(team => team.id === selectedNTEditorId) ?? null,
  [nationalTeams, selectedNTEditorId]);

  const sztabSearchResults = useMemo(() => {
    if (sztabLeagueFilter) {
      const isPolish = sztabLeagueFilter.startsWith('L_PL_');
      return clubs.filter(c => isPolish ? c.leagueId === sztabLeagueFilter : c.country === sztabLeagueFilter);
    }
    if (!sztabSearchQuery.trim()) return [];
    const q = sztabSearchQuery.toLowerCase();
    return clubs.filter(c => c.name.toLowerCase().includes(q)).slice(0, 12);
  }, [sztabSearchQuery, sztabLeagueFilter, clubs]);

  const trenerzySearchResults = useMemo(() => {
    const q = trenerzySearch.trim().toLowerCase();
    if (!q) return [];
    return Object.values(coaches)
      .filter(coach => {
        const clubName = clubs.find(c => c.id === coach.currentClubId)?.name ?? '';
        const haystack = `${coach.firstName} ${coach.lastName} ${clubName}`.toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => `${a.lastName}`.localeCompare(`${b.lastName}`, 'pl'))
      .slice(0, 50);
  }, [trenerzySearch, coaches, clubs]);

  const handleTrenerSelect = (id: string) => {
    const coach = coaches[id];
    if (!coach) return;
    setTrenerzySelectedId(id);
    setEditTrenerFirstName(coach.firstName);
    setEditTrenerLastName(coach.lastName);
    setEditTrenerAge(String(coach.age));
    const nationalityValue = COUNTRY_OPTIONS.some(c => c.name === coach.nationality)
      ? coach.nationality
      : getDefaultCountryForRegion(coach.nationality as Region);
    setEditTrenerNationality(nationalityValue);
    setEditTrenerAttrs({ ...coach.attributes });
    setEditTrenerTacticOffensive(coach.favoriteTactics.offensive);
    setEditTrenerTacticNeutral(coach.favoriteTactics.neutral);
    setEditTrenerTacticDefensive(coach.favoriteTactics.defensive);
  };

  const handleTrenerSave = () => {
    if (!trenerzySelectedId) return;
    const age = parseInt(editTrenerAge, 10);
    if (isNaN(age)) return;
    setCoaches(prev => ({
      ...prev,
      [trenerzySelectedId]: {
        ...prev[trenerzySelectedId],
        firstName: editTrenerFirstName,
        lastName: editTrenerLastName,
        age,
        nationality: editTrenerNationality,
        attributes: editTrenerAttrs as any,
        favoriteTactics: {
          offensive: editTrenerTacticOffensive,
          neutral: editTrenerTacticNeutral,
          defensive: editTrenerTacticDefensive,
        },
      },
    }));
    showGameNotification({ title: 'Zapisano', message: `${editTrenerFirstName} ${editTrenerLastName} — dane zaktualizowane.`, tone: 'success' });
  };

  const sztabClub = useMemo(() => clubs.find(c => c.id === sztabClubId) ?? null, [clubs, sztabClubId]);
  const sztabClubPersons = useMemo(() => {
    if (!sztabClub) return [];
    const result: { id: string; type: 'coach' | 'staff'; label: string }[] = [];
    if (sztabClub.coachId && sztabClub.coachId !== userTeamId) {
      const coach = coaches[sztabClub.coachId];
      if (coach && coach.currentClubId !== userTeamId) {
        result.push({ id: coach.id, type: 'coach', label: `${coach.firstName} ${coach.lastName} — Trener` });
      }
    }
    (sztabClub.staffIds ?? []).forEach(sid => {
      const s = staffMembers[sid];
      if (s) result.push({ id: s.id, type: 'staff', label: `${s.firstName} ${s.lastName} — ${s.role}` });
    });
    return result;
  }, [sztabClub, coaches, staffMembers, userTeamId]);

  const zarzadSearchResults = useMemo(() => {
    if (zarzadLeagueFilter) {
      const isPolish = zarzadLeagueFilter.startsWith('L_PL_');
      return clubs.filter(c => isPolish ? c.leagueId === zarzadLeagueFilter : c.country === zarzadLeagueFilter);
    }
    if (!zarzadSearchQuery.trim()) return [];
    const q = zarzadSearchQuery.toLowerCase();
    return clubs.filter(c => c.name.toLowerCase().includes(q)).slice(0, 12);
  }, [zarzadSearchQuery, zarzadLeagueFilter, clubs]);

  const zarzadClub = useMemo(() => clubs.find(c => c.id === zarzadClubId) ?? null, [clubs, zarzadClubId]);

  useEffect(() => {
    if (selectedTeamClub) {
      setEditTeamBudget(String(selectedTeamClub.budget));
      setEditTeamTransferBudget(String(selectedTeamClub.transferBudget));
      setEditTeamReserveBudget(String(selectedTeamClub.reserveBudget ?? 0));
      setEditTeamName(selectedTeamClub.name);
      setEditTeamStadiumName(selectedTeamClub.stadiumName);
      setEditTeamStadiumCapacity(String(selectedTeamClub.stadiumCapacity));
      setEditTeamReputation(String(selectedTeamClub.reputation));
      setEditTeamColors([...selectedTeamClub.colorsHex]);
      setEditTeamKits(getClubKits(selectedTeamClub));
      setEditTeamSigningPool(String(selectedTeamClub.signingBonusPool));
    }
  }, [teamSearchClubId]);

  useEffect(() => {
    if (!selectedNTEditorTeam) return;
    setEditNTStadiumName(selectedNTEditorTeam.stadiumName);
    setEditNTStadiumCapacity(String(selectedNTEditorTeam.stadiumCapacity));
    setEditNTReputation(String(selectedNTEditorTeam.reputation));
    setEditNTKits(getNationalTeamKits(selectedNTEditorTeam));
  }, [selectedNTEditorTeam]);


  const handleRepairClubFinances = () => {
    setClubs(prev => prev.map(club => {
      const tier = FinanceService.getClubTier(club);
      const isPolish = club.leagueId.startsWith('L_PL_');
      const budget = isPolish
        ? FinanceService.calculateInitialBudget(tier, club.reputation)
        : FinanceService.calculateEuropeanInitialBudget(tier, club.reputation, club.country ?? '', club.name, club.stadiumCapacity);
      const transferBudget = FinanceService.calculateInitialTransferBudget(budget, club.reputation);
      const reserveBudget  = FinanceService.calculateInitialReserveBudget(budget, club.reputation);
      const signingBonusPool = FinanceService.calculateInitialSigningPool(budget, club.reputation);
      return { ...club, budget, transferBudget, reserveBudget, signingBonusPool };
    }));
    showGameNotification({
      title: 'Finanse naprawione',
      message: `Budżety wszystkich ${clubs.length} klubów zostały zresetowane do wartości początkowych.`,
      tone: 'success'
    });
  };

  const handleRepairFreeAgents = () => {
    const freeAgents = players['FREE_AGENTS'] ?? [];
    const problematic = freeAgents.filter(
      p => p.isUntouchable || p.squadRole === 'STARTER' || p.squadRole === 'KEY_PLAYER'
    );
    if (problematic.length === 0) {
      showGameNotification({
        title: 'Brak problemów',
        message: 'Żaden wolny agent nie posiada nieprawidłowych statusów.',
        tone: 'success'
      });
      return;
    }
    const fixed = freeAgents.map(p =>
      (p.isUntouchable || p.squadRole === 'STARTER' || p.squadRole === 'KEY_PLAYER')
        ? { ...p, isUntouchable: false, squadRole: null as null }
        : p
    );
    setPlayers(prev => ({ ...prev, FREE_AGENTS: fixed }));
    const untouchableCount = problematic.filter(p => p.isUntouchable).length;
    const roleCount = problematic.filter(p => p.squadRole === 'STARTER' || p.squadRole === 'KEY_PLAYER').length;
    const parts: string[] = [];
    if (untouchableCount > 0) parts.push(`${untouchableCount} × "Nie na sprzedaż"`);
    if (roleCount > 0) parts.push(`${roleCount} × "Pierwsza 11 / Kluczowy"`);
    showGameNotification({
      title: `Naprawiono ${problematic.length} wolnych agentów`,
      message: `Usunięte statusy: ${parts.join(', ')}.`,
      tone: 'success'
    });
  };

  const handleRepairSquads = () => {
    const aiClubs = clubs.filter(c => c.id !== userTeamId);
    let fixedClubs = 0;
    let generatedPlayers = 0;
    const nextPlayers: typeof players = { ...players };
    const seasonYear = (currentDate instanceof Date ? currentDate : new Date(currentDate)).getFullYear();
    aiClubs.forEach(club => {
      const currentSquad = nextPlayers[club.id] ?? [];
      if (currentSquad.length < 22) {
        const newPlayers = SquadGeneratorService.generateYouthPlayersForClub(club, currentSquad, seasonYear);
        if (newPlayers.length > 0) {
          nextPlayers[club.id] = [...currentSquad, ...newPlayers];
          fixedClubs++;
          generatedPlayers += newPlayers.length;
        }
      }
    });
    setPlayers(nextPlayers);
    if (fixedClubs === 0) {
      showGameNotification({ title: 'Brak problemów', message: 'Wszystkie kluby AI mają co najmniej 22 zawodników.', tone: 'success' });
    } else {
      showGameNotification({ title: `Naprawiono ${fixedClubs} składów`, message: `Wygenerowano ${generatedPlayers} zawodników dla ${fixedClubs} klubów AI.`, tone: 'success' });
    }
  };

  const updateEditTeamKit = (index: number, patch: Partial<ClubKit>) => {
    setEditTeamKits(prev => {
      const base = prev.length === 4 ? prev : createDefaultClubKits(editTeamColors);
      return base.map((kit, idx) => idx === index ? { ...kit, ...patch } : kit);
    });
  };

  const resetEditTeamKitsFromColors = () => {
    setEditTeamKits(createDefaultClubKits(editTeamColors));
  };

  const updateEditNTKit = (index: number, patch: Partial<ClubKit>) => {
    setEditNTKits(prev => {
      const base = prev.length === 3
        ? prev
        : createDefaultNationalTeamKits(selectedNTEditorTeam?.colorsHex);
      return base.map((kit, idx) => idx === index ? { ...kit, ...patch } : kit);
    });
  };

  const copyEditNTKitColorToBaseParts = (index: number, source: 'shirt' | 'shorts' | 'socks') => {
    const kit = editNTKits[index];
    if (!kit) return;
    const color = kit[source];
    updateEditNTKit(index, { shirt: color, shorts: color, socks: color });
  };

  const handleSaveNationalTeam = () => {
    if (!selectedNTEditorTeam) return;
    const stadiumName = editNTStadiumName.trim();
    const stadiumCapacity = Math.max(0, parseInt(editNTStadiumCapacity, 10) || 0);
    const reputation = Math.min(20, Math.max(1, parseInt(editNTReputation, 10) || 1));
    const kits = (editNTKits.length === 3 ? editNTKits : createDefaultNationalTeamKits(selectedNTEditorTeam.colorsHex))
      .map(kit => ({ ...kit, isActive: true }));

    setNationalTeams(prev => prev.map(team => team.id === selectedNTEditorTeam.id
      ? {
          ...team,
          stadiumName,
          stadiumCapacity,
          reputation,
          colorsHex: kits.map(kit => kit.shirt),
          kits,
        }
      : team));
    showGameNotification({
      title: 'Zapisano reprezentację',
      message: `Dane reprezentacji ${selectedNTEditorTeam.name} zostały zaktualizowane.`,
      tone: 'success'
    });
  };

  const handleSztabPersonSelect = (id: string, type: 'coach' | 'staff') => {
    setSztabPersonId(id);
    setSztabPersonType(type);
    if (type === 'coach') {
      const c = coaches[id];
      if (!c) return;
      setEditSztabFirstName(c.firstName);
      setEditSztabLastName(c.lastName);
      setEditSztabAge(String(c.age));
      setEditSztabAttrs({ ...c.attributes } as Record<string, number>);
      setEditSztabSalary('');
      setEditSztabContractEnd('');
    } else {
      const s = staffMembers[id];
      if (!s) return;
      setEditSztabFirstName(s.firstName);
      setEditSztabLastName(s.lastName);
      setEditSztabAge(String(s.age));
      setEditSztabAttrs({ ...s.attributes });
      setEditSztabSalary(String(s.salary ?? ''));
      setEditSztabContractEnd(s.contractEndDate ? s.contractEndDate.substring(0, 10) : '');
    }
  };

  const handleSztabSave = () => {
    if (!sztabPersonId || !sztabPersonType) return;
    const age = parseInt(editSztabAge, 10);
    if (Number.isNaN(age)) return;
    if (sztabPersonType === 'coach') {
      setCoaches(prev => ({
        ...prev,
        [sztabPersonId]: {
          ...prev[sztabPersonId],
          firstName: editSztabFirstName,
          lastName: editSztabLastName,
          age,
          attributes: editSztabAttrs as unknown as typeof prev[string]['attributes'],
        },
      }));
    } else {
      const salary = parseInt(editSztabSalary, 10);
      setStaffMembers(prev => ({
        ...prev,
        [sztabPersonId]: {
          ...prev[sztabPersonId],
          firstName: editSztabFirstName,
          lastName: editSztabLastName,
          age,
          attributes: editSztabAttrs,
          ...(Number.isNaN(salary) ? {} : { salary }),
          ...(editSztabContractEnd ? { contractEndDate: new Date(editSztabContractEnd).toISOString() } : {}),
        },
      }));
    }
    showGameNotification({ title: 'Zapisano', message: `${editSztabFirstName} ${editSztabLastName} — dane zaktualizowane.`, tone: 'success' });
  };

  const handleZarzadPersonSelect = (key: string) => {
    const person = getZarzadPerson(zarzadClub, key);
    if (!person) return;
    setZarzadPersonKey(key as ZarzadPersonKey);
    setEditZarzadFirstName(person.firstName ?? '');
    setEditZarzadLastName(person.lastName ?? '');
    setEditZarzadAge(String(person.age ?? ''));
    const attrKeys = MANAGEMENT_ATTR_LABELS[key]?.map((a: { key: string }) => a.key) ?? [];
    const attrs: Record<string, number> = {};
    attrKeys.forEach((k: string) => { if (typeof person[k] === 'number') attrs[k] = person[k]; });
    setEditZarzadAttrs(attrs);
  };

  const handleZarzadSave = () => {
    if (!zarzadClubId || !zarzadPersonKey) return;
    setClubs(prev => prev.map(c => {
      if (c.id !== zarzadClubId) return c;
      const oldPerson = getZarzadPerson(c, zarzadPersonKey) ?? {};
      const updatedPerson = { ...oldPerson, firstName: editZarzadFirstName, lastName: editZarzadLastName, age: parseInt(editZarzadAge, 10) || oldPerson.age, ...editZarzadAttrs };
      if (zarzadPersonKey === 'sportingDirector') {
        return { ...c, sportingDirector: updatedPerson };
      }
      return { ...c, management: { ...c.management, [zarzadPersonKey]: updatedPerson } as ClubManagement };
    }));
    showGameNotification({ title: 'Zapisano', message: `${editZarzadFirstName} ${editZarzadLastName} — dane zaktualizowane.`, tone: 'success' });
  };

  const resetPlayerForm = () => {
    setFirstName('');
    setLastName('');
    setAge(20);
    setNationality(Region.POLAND);
    setNationalityCountry('Polska');
    setPosition(PlayerPosition.MID);
    setSecondaryPosition(null);
    setSecondaryPositionRating(50);
    setAttrs({ ...DEFAULT_ATTRS });
    setAnnualSalary(0);
    setMarketValue(0);
    setIsLoanedOut(false);
    setLoanParentClubId('');
    setLoanDestinationClubId('');
    setLoanStartDate('');
    setLoanEndDate('');
    setHasPendingTransfer(false);
    setTransferPendingClubId('');
    setTransferReportDate('');
    setTransferPendingFee(0);
    setPlayerTargetClubId(selectedClubId);
    setIsUntouchable(false);
    setIsOnTransferList(false);
    setIsAvailableForLoan(false);
    setNationalMatchesPlayed(0);
    setNationalGoals(0);
    const now = currentDate instanceof Date ? currentDate : new Date(currentDate);
    setContractEndDate(new Date(now.getFullYear() + 2, 5, 30).toISOString().substring(0, 10));
  };

  const buildLoanInfo = (): PlayerLoanInfo | null => {
    if (!isLoanedOut) return null;
    const parentClub = clubs.find(c => c.id === loanParentClubId);
    const destinationClub = clubs.find(c => c.id === loanDestinationClubId);
    if (!parentClub || !destinationClub || !loanStartDate || !loanEndDate) return null;
    return {
      parentClubId: parentClub.id,
      parentClubName: parentClub.name,
      destinationClubId: destinationClub.id,
      destinationClubName: destinationClub.name,
      startDate: toIsoDate(loanStartDate),
      endDate: toIsoDate(loanEndDate),
    };
  };

  const movePlayerBetweenClubs = (sourceClubId: string, targetClubId: string, player: Player) => {
    const nextPlayers: Record<string, Player[]> = { ...players };
    Object.entries(nextPlayers).forEach(([clubId, squad]) => {
      nextPlayers[clubId] = squad.filter(p => p.id !== player.id);
    });
    nextPlayers[targetClubId] = [...(nextPlayers[targetClubId] ?? []), player];
    setPlayers(nextPlayers);

    if (lineups[sourceClubId]) {
      updateLineup(sourceClubId, LineupService.repairLineup(lineups[sourceClubId], nextPlayers[sourceClubId] ?? []));
    }
    if (lineups[targetClubId]) {
      updateLineup(targetClubId, LineupService.autoPickLineup(targetClubId, nextPlayers[targetClubId] ?? []));
    }
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
        setSecondaryPosition(p.secondaryPosition && p.secondaryPosition !== p.position ? p.secondaryPosition : null);
        setSecondaryPositionRating(Math.max(1, Math.min(99, p.secondaryPositionRating ?? 50)));
        setAttrs({ ...p.attributes });
        setAnnualSalary(p.annualSalary);
        setMarketValue(p.marketValue ?? 0);
        setContractEndDate(p.contractEndDate ? String(p.contractEndDate).substring(0, 10) : '');
        setIsLoanedOut(!!p.loan);
        setLoanParentClubId(p.loan?.parentClubId ?? (p.loan ? '' : selectedClubId));
        setLoanDestinationClubId(p.loan?.destinationClubId ?? '');
        setLoanStartDate(toDateInputValue(p.loan?.startDate));
        setLoanEndDate(toDateInputValue(p.loan?.endDate));
        setHasPendingTransfer(!!p.transferPendingClubId);
        setTransferPendingClubId(p.transferPendingClubId ?? '');
        setTransferReportDate(toDateInputValue(p.transferReportDate));
        setTransferPendingFee(p.transferPendingFee ?? 0);
        setTransferPendingSalary(p.transferPendingSalary ?? 0);
        setTransferPendingContractYears(p.transferPendingContractYears ?? 1);
        setPlayerTargetClubId(p.clubId ?? selectedClubId);
        setIsUntouchable(p.isUntouchable ?? false);
        setIsOnTransferList(p.isOnTransferList ?? false);
        setIsAvailableForLoan(p.isAvailableForLoan ?? false);
        setSquadRole(p.squadRole ?? null);
        setNationalMatchesPlayed(p.nationalStats?.matchesPlayed ?? 0);
        setNationalGoals(p.nationalStats?.goals ?? 0);
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
    const loan = buildLoanInfo();
    if (isLoanedOut && !loan) {
      showGameNotification({
        title: 'Brak danych wypożyczenia',
        message: 'Wybierz klub macierzysty, klub wypożyczenia oraz daty od i do.',
        tone: 'warning'
      });
      return;
    }
    if (loan && loan.parentClubId === loan.destinationClubId) {
      showGameNotification({
        title: 'Błędne wypożyczenie',
        message: 'Klub macierzysty i klub wypożyczenia muszą być różne.',
        tone: 'warning'
      });
      return;
    }
    if (loan && new Date(loan.endDate).getTime() <= new Date(loan.startDate).getTime()) {
      showGameNotification({
        title: 'Błędne daty wypożyczenia',
        message: 'Data końca wypożyczenia musi być późniejsza niż data początku.',
        tone: 'warning'
      });
      return;
    }
    const targetClubId = loan?.destinationClubId ?? playerTargetClubId;
    if (hasPendingTransfer && (!transferPendingClubId || !transferReportDate)) {
      showGameNotification({
        title: 'Brak danych transferu',
        message: 'Wybierz nowy klub i datę przejścia zawodnika.',
        tone: 'warning'
      });
      return;
    }
    if (hasPendingTransfer && transferPendingClubId === targetClubId) {
      showGameNotification({
        title: 'Błędny transfer',
        message: 'Nowy klub w uzgodnionym transferze musi być inny niż obecny klub zawodnika.',
        tone: 'warning'
      });
      return;
    }
    const pendingTransferFields = hasPendingTransfer
      ? {
          transferPendingClubId,
          transferReportDate: toIsoDate(transferReportDate),
          transferPendingFee: transferPendingFee > 0 ? transferPendingFee : undefined,
          transferPendingSalary: transferPendingSalary > 0 ? transferPendingSalary : undefined,
          transferPendingContractYears: transferPendingContractYears > 0 ? transferPendingContractYears : undefined,
          interestedClubs: [] as string[],
          isOnTransferList: false,
          isAvailableForLoan: false,
        }
      : {
          transferPendingClubId: undefined,
          transferReportDate: undefined,
          transferPendingFee: undefined,
          transferPendingSalary: undefined,
          transferPendingBonus: undefined,
          transferPendingContractYears: undefined,
        };
    const cleanSecondaryPosition = secondaryPosition && secondaryPosition !== position ? secondaryPosition : null;
    const cleanSecondaryPositionRating = cleanSecondaryPosition ? secondaryPositionRating : undefined;
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
        clubId: targetClubId,
        nationality,
        nationalityCountry,
        position,
        secondaryPosition: cleanSecondaryPosition,
        secondaryPositionRating: cleanSecondaryPositionRating,
        overallRating: newOvr,
        attributes: { ...attrs },
        stats: emptyStats(),
        cupStats: emptyStats(),
        euroStats: emptyStats(),
        nationalStats: { ...emptyStats(), matchesPlayed: nationalMatchesPlayed, goals: nationalGoals },
        health: { status: HealthStatus.HEALTHY },
        condition: 100,
        suspensionMatches: 0,
        cupSuspensionMatches: 0,
        euroSuspensionMatches: 0,
        nationalSuspensionMatches: 0,
        annualSalary,
        marketValue,
        loan,
        ...pendingTransferFields,
        isAvailableForLoan: hasPendingTransfer ? false : isAvailableForLoan,
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
        isUntouchable: isUntouchable,
        squadRole: squadRole,
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
        [targetClubId]: [...(prev[targetClubId] ?? []), newPlayer]
      }));
      if (targetClubId !== selectedClubId) {
        const targetSquad = [...(players[targetClubId] ?? []), newPlayer];
        if (lineups[targetClubId]) {
          updateLineup(targetClubId, LineupService.autoPickLineup(targetClubId, targetSquad));
        }
        setSelectedClubId(targetClubId);
      }
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
    const existingPlayer = clubPlayers.find(p => p.id === selectedPlayerId);
    if (!existingPlayer) return;
    const updatedPlayer: Player = {
      ...existingPlayer,
      firstName, lastName, age, nationality, nationalityCountry, position,
      secondaryPosition: cleanSecondaryPosition,
      secondaryPositionRating: cleanSecondaryPositionRating,
      attributes: { ...attrs }, overallRating: newOvr,
      annualSalary, marketValue, contractEndDate, loan, clubId: targetClubId,
      ...pendingTransferFields,
      isUntouchable: isUntouchable,
      isOnTransferList: hasPendingTransfer ? false : isOnTransferList,
      isAvailableForLoan: loan || hasPendingTransfer ? false : isAvailableForLoan,
      squadRole: squadRole,
      nationalStats: { ...(existingPlayer.nationalStats ?? emptyStats()), matchesPlayed: nationalMatchesPlayed, goals: nationalGoals }
    };
    if (targetClubId !== selectedClubId) {
      movePlayerBetweenClubs(selectedClubId, targetClubId, updatedPlayer);
      setSelectedClubId(targetClubId);
      setSelectedPlayerId(updatedPlayer.id);
    } else {
      updatePlayer(selectedClubId, selectedPlayerId, updatedPlayer);
    }
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
        <span className="text-sm text-white mr-2">Edytor</span>
        <span className="w-px h-4 bg-slate-700" />
        {(['GRACZE', 'TRENERZY', 'KLUBY', 'REPREZENTACJE', 'SZTAB', 'ZARZĄD', 'FINANSE'] as const).map(sec => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            className={`px-3 py-1 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${activeSection === sec ? 'bg-yellow-600 border-t-yellow-400/60 border-x-yellow-500/30 border-b-black/60 text-white' : 'bg-white/5 border-t-white/10 border-x-white/5 border-b-black/40 text-slate-400 hover:bg-white/10 hover:text-white'}`}
            style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)', ...(sec === 'FINANSE' ? { display: 'none' } : {}) }}
          >
            {sec}
          </button>
        ))}
        <span className="w-px h-4 bg-slate-700" />
        {activeSection === 'GRACZE' && (
          <>
            {['1', '2', '3', '4', 'ALL'].map(tier => (
              <button
                key={tier}
                onClick={() => { setSelectedTier(tier); setSelectedClubId(''); setSelectedPlayerId(''); setIsCreatingPlayer(false); }}
                className={`px-3 py-1 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${selectedTier === tier ? 'bg-blue-600 border-t-blue-400/60 border-x-blue-500/30 border-b-black/60 text-white' : 'bg-white/5 border-t-white/10 border-x-white/5 border-b-black/40 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
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
            <button
              onClick={() => setShowRepairPanel(p => !p)}
              className={`px-3 py-1 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${showRepairPanel ? 'bg-orange-600 border-t-orange-400/60 border-x-orange-500/30 border-b-black/60 text-white' : 'bg-orange-900/60 border-t-orange-400/30 border-x-orange-700/20 border-b-black/60 text-orange-300 hover:text-white hover:bg-orange-800'}`}
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >
              Napraw problemy
            </button>
          </>
        )}
        {activeSection === 'FINANSE' && (
          <>
            {[{id: 'L_PL_1', label: 'Ekstraklasa'}, {id: 'L_PL_2', label: 'Liga 1'}, {id: 'L_PL_3', label: 'Liga 2'}, {id: 'L_PL_4', label: 'Liga 3'}].map(lg => (
              <button
                key={lg.id}
                onClick={() => setClubsLeagueFilter(lg.id)}
                className={`px-3 py-1 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${clubsLeagueFilter === lg.id ? 'bg-blue-600 border-t-blue-400/60 border-x-blue-500/30 border-b-black/60 text-white' : 'bg-white/5 border-t-white/10 border-x-white/5 border-b-black/40 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
              >
                {lg.label}
              </button>
            ))}
          </>
        )}
        {activeSection === 'REPREZENTACJE' && (
          <>
            {NT_CONTINENT_BTNS.map(continent => (
              <button
                key={continent.value}
                onClick={() => { setNTContinentFilter(continent.value); setSelectedNTEditorId(''); }}
                className={`px-2.5 py-1 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${ntContinentFilter === continent.value ? 'bg-blue-600 border-t-blue-400/60 border-x-blue-500/30 border-b-black/60 text-white' : 'bg-white/5 border-t-white/10 border-x-white/5 border-b-black/40 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
              >
                {continent.label}
              </button>
            ))}
          </>
        )}
        <div className="ml-auto flex items-center gap-3">
          {importMsg && (
            <span className="text-xs text-emerald-400 max-w-xs truncate">{importMsg}</span>
          )}
          {clubImportMsg && (
            <span className="text-xs text-blue-400 max-w-xs truncate">{clubImportMsg}</span>
          )}
          {kitImportMsg && (
            <span className="text-xs text-yellow-300 max-w-xs truncate">{kitImportMsg}</span>
          )}
          {ntImportMsg && (
            <span className="text-xs text-blue-300 max-w-xs truncate">{ntImportMsg}</span>
          )}
          {activeSection === 'KLUBY' && (
            <>
              <button
                onClick={handleExportClubData}
                disabled={!selectedTeamClub}
                className="px-4 py-1.5 bg-slate-700 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest text-slate-300 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
              >
                Eksportuj dane klubu
              </button>
              <select
                value={clubContinentExport}
                onChange={(e) => setClubContinentExport(e.target.value)}
                className={`${selectCls} px-2 py-1.5`}
                title="Wybierz kontynent eksportowanych klubów."
              >
                {CLUB_CONTINENT_EXPORT_OPTIONS.map(continent => (
                  <option key={continent.value} value={continent.value}>{continent.label}</option>
                ))}
              </select>
              <button
                onClick={handleExportContinentClubData}
                className="px-4 py-1.5 bg-slate-700 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest text-slate-300 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60"
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                title="Eksportuje dane klubów z wybranego kontynentu. Eksport Europy pomija polskie drużyny."
              >
                Eksportuj kontynent
              </button>
              <button
                onClick={() => { setClubImportMsg(''); clubImportRef.current?.click(); }}
                className="px-4 py-1.5 bg-blue-900 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest text-blue-300 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-blue-400/60 border-x-blue-700/30 border-b-black/60"
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
              >
                Importuj dane z pliku
              </button>
              <input
                ref={clubImportRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportClubData}
              />
              <button
                onClick={handleExportLeagueKits}
                disabled={!teamLeagueFilter || teamLeagueKitClubs.length === 0}
                className="px-4 py-1.5 bg-slate-700 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest text-slate-300 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                title="Eksportuje stroje wszystkich klubów z aktualnie wybranego filtra ligi."
              >
                Eksportuj stroje ligi
              </button>
              <button
                onClick={() => { setKitImportMsg(''); kitLeagueImportRef.current?.click(); }}
                className="px-4 py-1.5 bg-yellow-800 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest text-yellow-100 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-yellow-300/50 border-x-yellow-700/30 border-b-black/60"
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                title="Importuje stroje wielu klubów z jednego pliku JSON."
              >
                Importuj stroje ligi
              </button>
              <input
                ref={kitLeagueImportRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportLeagueKits}
              />
            </>
          )}
          {activeSection === 'REPREZENTACJE' && (
            <>
              <button
                onClick={handleExportNationalTeamData}
                className="px-4 py-1.5 bg-slate-700 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest text-slate-300 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60"
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                title="Eksportuje wszystkie reprezentacje do jednego pliku JSON."
              >
                Eksportuj reprezentacje
              </button>
              <button
                onClick={() => { setNTImportMsg(''); ntImportRef.current?.click(); }}
                className="px-4 py-1.5 bg-blue-900 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest text-blue-300 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-blue-400/60 border-x-blue-700/30 border-b-black/60"
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
              >
                Importuj reprezentację
              </button>
              <input
                ref={ntImportRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportNationalTeamData}
              />
            </>
          )}
          <button
            onClick={startCreatePlayer}
            className="px-4 py-1.5 bg-emerald-800 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest text-emerald-200 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-emerald-400/60 border-x-emerald-600/30 border-b-black/60"
            style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
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
            className="px-4 py-1.5 bg-slate-700 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest text-slate-300 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60"
            style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
          >
            Eksportuj składy
          </button>
          <button
            onClick={() => { setImportMsg(''); fileInputRef.current?.click(); }}
            className="px-4 py-1.5 bg-blue-900 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest text-blue-300 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-blue-400/60 border-x-blue-700/30 border-b-black/60"
            style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
          >
            Importuj składy z pliku
          </button>
          <button
            onClick={() => navigateTo(ViewState.DASHBOARD)}
            className="px-4 py-1.5 bg-slate-800 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest text-slate-300 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-white/10 border-x-white/5 border-b-black/60"
            style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
          >
            Wyjdź
          </button>
        </div>
      </div>

      {/* SEKCJA FINANSE */}
      {activeSection === 'FINANSE' && (
        <div className="flex-1 overflow-y-auto px-6 py-4 editor-scroll">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 pr-4 text-slate-400 font-black uppercase tracking-tighter">Klub</th>
                <th className="text-right py-2 px-3 text-slate-400 font-black uppercase tracking-tighter">Budżet</th>
                <th className="text-right py-2 px-3 text-slate-400 font-black uppercase tracking-tighter">Transferowy</th>
                <th className="text-right py-2 px-3 text-yellow-400 font-black uppercase tracking-tighter">Pula podpisów</th>
                <th className="text-right py-2 pl-3 text-slate-400 font-black uppercase tracking-tighter">Rezerwa</th>
                <th className="py-2 pl-4 text-slate-400 font-black uppercase tracking-tighter">Ustaw pulę</th>
              </tr>
            </thead>
            <tbody>
              {clubs
                .filter(c => c.leagueId === clubsLeagueFilter)
                .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
                .map(club => (
                  <tr key={club.id} className="border-b border-slate-800 hover:bg-white/5 transition-colors">
                    <td className="py-2 pr-4 text-white font-black">{club.name}</td>
                    <td className="py-2 px-3 text-right text-slate-300 tabular-nums">{club.budget.toLocaleString('pl-PL')} zł</td>
                    <td className="py-2 px-3 text-right text-emerald-400 tabular-nums">{club.transferBudget.toLocaleString('pl-PL')} zł</td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      <span className={club.signingBonusPool === 0 ? 'text-red-400 font-black' : 'text-yellow-400'}>
                        {club.signingBonusPool.toLocaleString('pl-PL')} zł
                      </span>
                    </td>
                    <td className="py-2 pl-3 text-right text-slate-400 tabular-nums">{(club.reserveBudget ?? 0).toLocaleString('pl-PL')} zł</td>
                    <td className="py-2 pl-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step={100000}
                          value={editingSigningPool[club.id] ?? ''}
                          placeholder={String(FinanceService.calculateInitialSigningPool(club.budget, club.reputation))}
                          onChange={e => setEditingSigningPool(prev => ({ ...prev, [club.id]: e.target.value }))}
                          className={`${inputCls} px-2 py-1 w-32 tabular-nums`}
                        />
                        <button
                          onClick={() => {
                            const val = parseInt(editingSigningPool[club.id] ?? '', 10);
                            if (isNaN(val) || val < 0) return;
                            setClubs(prev => prev.map(c => c.id === club.id ? { ...c, signingBonusPool: val } : c));
                            setEditingSigningPool(prev => { const next = { ...prev }; delete next[club.id]; return next; });
                          }}
                          className="px-3 py-1 rounded-[16px] text-[10px] font-black uppercase italic tracking-widest bg-yellow-700 hover:bg-yellow-600 text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-yellow-400/60 border-x-yellow-600/30 border-b-black/60 whitespace-nowrap"
                          style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                        >
                          Ustaw
                        </button>
                        <button
                          onClick={() => {
                            const recommended = FinanceService.calculateInitialSigningPool(club.budget, club.reputation);
                            setClubs(prev => prev.map(c => c.id === club.id ? { ...c, signingBonusPool: recommended } : c));
                            setEditingSigningPool(prev => { const next = { ...prev }; delete next[club.id]; return next; });
                          }}
                          className="px-3 py-1 rounded-[16px] text-[10px] font-black uppercase italic tracking-widest bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-white/10 border-x-white/5 border-b-black/60 whitespace-nowrap"
                          style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                        >
                          Auto
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SEKCJA TRENERZY */}
      {activeSection === 'TRENERZY' && (
        <div className="flex-1 overflow-hidden flex gap-0">

          {/* LEWA — szukajka + lista */}
          <div className="w-[480px] flex-shrink-0 flex flex-col border-r border-slate-800 overflow-hidden">
            <div className="px-4 pt-4 pb-3 flex-shrink-0">
              <input
                type="text"
                value={trenerzySearch}
                onChange={(e) => { setTrenerzySearch(e.target.value); setTrenerzySelectedId(''); }}
                className={`${inputCls} px-3 py-2 w-full`}
                placeholder="szukaj trenera po nazwisku lub klubie..."
              />
              {trenerzySearch.trim() && trenerzySearchResults.length === 0 && (
                <div className="text-xs text-slate-500 mt-2">Brak wyników.</div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto editor-scroll">
              {trenerzySearchResults.length > 0 && (
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-900 z-10">
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 pl-4 pr-2 text-slate-400 font-black uppercase tracking-tighter">Trener</th>
                      <th className="text-left py-2 px-2 text-slate-400 font-black uppercase tracking-tighter">Wiek</th>
                      <th className="text-left py-2 px-2 text-slate-400 font-black uppercase tracking-tighter">Klub</th>
                      <th className="text-right py-2 px-2 text-slate-400 font-black uppercase tracking-tighter">Dośw.</th>
                      <th className="text-right py-2 pl-2 pr-4 text-slate-400 font-black uppercase tracking-tighter">Trening</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trenerzySearchResults.map(coach => {
                      const clubName = clubs.find(c => c.id === coach.currentClubId)?.name ?? '—';
                      const isSelected = coach.id === trenerzySelectedId;
                      return (
                        <tr
                          key={coach.id}
                          onClick={() => handleTrenerSelect(coach.id)}
                          className={`border-b border-slate-800 cursor-pointer transition-colors ${isSelected ? 'bg-yellow-600/20 border-l-2 border-l-yellow-500' : 'hover:bg-white/5'}`}
                        >
                          <td className="py-2 pl-4 pr-2 text-white font-black">
                            {coach.firstName} {coach.lastName}
                            {coach.currentNationalTeamId && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-blue-700/50 text-blue-300 border border-blue-600/40">NT</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-slate-300">{coach.age}</td>
                          <td className="py-2 px-2 text-emerald-400">{clubName}</td>
                          <td className="py-2 px-2 text-right text-yellow-400 tabular-nums">{coach.attributes.experience}</td>
                          <td className="py-2 pl-2 pr-4 text-right text-slate-300 tabular-nums">{coach.attributes.training}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* PRAWA — formularz edycji */}
          <div className="flex-1 overflow-y-auto px-6 py-4 editor-scroll">
            {!trenerzySelectedId && (
              <div className="text-xs text-slate-500 mt-4">Wybierz trenera z listy, aby edytować jego dane.</div>
            )}
            {trenerzySelectedId && (
              <div className="max-w-lg">
                <div className="text-xs text-yellow-400 mb-2">{editTrenerFirstName} {editTrenerLastName}</div>
                {(() => {
                  const coach = coaches[trenerzySelectedId];
                  if (!coach?.currentNationalTeamId) return null;
                  const nt = nationalTeams.find(t => t.id === coach.currentNationalTeamId);
                  return (
                    <div className="mb-4 px-3 py-2 rounded bg-blue-900/40 border border-blue-600/40 text-xs text-blue-300 font-black uppercase tracking-tighter">
                      Trener reprezentacji: {nt?.name ?? coach.currentNationalTeamId}
                    </div>
                  );
                })()}

                {/* Dane osobowe */}
                <div className="mb-5">
                  <div className={`${labelCls} mb-2`}>Dane osobowe</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className={`${labelCls} text-[10px] mb-1`}>Imię</div>
                      <input
                        type="text"
                        value={editTrenerFirstName}
                        onChange={(e) => setEditTrenerFirstName(e.target.value)}
                        className={`${inputCls} px-2 py-1 w-full`}
                      />
                    </div>
                    <div>
                      <div className={`${labelCls} text-[10px] mb-1`}>Nazwisko</div>
                      <input
                        type="text"
                        value={editTrenerLastName}
                        onChange={(e) => setEditTrenerLastName(e.target.value)}
                        className={`${inputCls} px-2 py-1 w-full`}
                      />
                    </div>
                    <div>
                      <div className={`${labelCls} text-[10px] mb-1`}>Wiek</div>
                      <input
                        type="number"
                        min={20}
                        max={80}
                        value={editTrenerAge}
                        onChange={(e) => setEditTrenerAge(e.target.value)}
                        className={`${inputCls} px-2 py-1 w-full`}
                      />
                    </div>
                    <div>
                      <div className={`${labelCls} text-[10px] mb-1`}>Narodowość</div>
                      <select
                        value={editTrenerNationality}
                        onChange={(e) => setEditTrenerNationality(e.target.value)}
                        className={`${selectCls} px-2 py-1 w-full`}
                      >
                        {COUNTRY_OPTIONS.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Atrybuty */}
                <div className="mb-5">
                  <div className={`${labelCls} mb-2`}>Atrybuty</div>
                  <div className="grid grid-cols-2 gap-3">
                    {COACH_ATTR_LABELS.map(({ key, label }) => (
                      <div key={key}>
                        <div className={`${labelCls} text-[10px] mb-1`}>{label}</div>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={editTrenerAttrs[key] ?? ''}
                          onChange={(e) => {
                            let n = parseInt(e.target.value, 10);
                            if (isNaN(n)) n = 1;
                            setEditTrenerAttrs(prev => ({ ...prev, [key]: Math.min(99, Math.max(1, n)) }));
                          }}
                          className={`${inputCls} px-2 py-1 w-full`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ulubione taktyki */}
                <div className="mb-6">
                  <div className={`${labelCls} mb-2`}>Ulubione taktyki</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className={`${labelCls} text-[10px] mb-1 text-orange-400`}>Ofensywna</div>
                      <select
                        value={editTrenerTacticOffensive}
                        onChange={(e) => setEditTrenerTacticOffensive(e.target.value)}
                        className={`${selectCls} px-2 py-1 w-full`}
                      >
                        {['4-3-3 Atak', '3-4-3', 'Wysoki Pressing', 'Total Football', '4-1-2-1-2'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className={`${labelCls} text-[10px] mb-1 text-blue-400`}>Neutralna</div>
                      <select
                        value={editTrenerTacticNeutral}
                        onChange={(e) => setEditTrenerTacticNeutral(e.target.value)}
                        className={`${selectCls} px-2 py-1 w-full`}
                      >
                        {['4-4-2', '4-3-3 Zrównoważona', '3-5-2', '4-5-1', '4-2-3-1', '5-3-2'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className={`${labelCls} text-[10px] mb-1 text-teal-400`}>Defensywna</div>
                      <select
                        value={editTrenerTacticDefensive}
                        onChange={(e) => setEditTrenerTacticDefensive(e.target.value)}
                        className={`${selectCls} px-2 py-1 w-full`}
                      >
                        {['5-4-1', '5-3-2 Blok', '4-4-2 Kontratak', 'Niski Blok', '4-5-1 Defensywna', '3-6-1'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleTrenerSave}
                  className="px-6 py-2 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest bg-yellow-700 hover:bg-yellow-600 text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-yellow-400/60 border-x-yellow-600/30 border-b-black/60"
                  style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                >
                  Zapisz zmiany
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEKCJA KLUBY */}
      {activeSection === 'KLUBY' && (
        <div className="flex-1 overflow-y-auto px-6 py-4 editor-scroll">

          {showRepairPanel && (
            <div className="mb-5 p-4 border border-orange-700/40 bg-orange-950/30 rounded-lg">
              <div className="text-xs text-orange-400 mb-3">Narzędzia naprawy</div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-start gap-3 p-3 border border-slate-700 bg-black/30 rounded">
                  <div className="flex-1">
                    <div className="text-xs text-white mb-0.5">Napraw finanse klubów</div>
                    <div className="text-[10px] text-slate-500">Resetuje budżet, transfery, rezerwę i pulę podpisów wszystkich klubów do wartości początkowych (na podstawie reputacji i tieru).</div>
                  </div>
                  <button
                    onClick={handleRepairClubFinances}
                    className="flex-shrink-0 px-3 py-1.5 bg-orange-700 hover:bg-orange-600 rounded-[16px] text-[10px] font-black uppercase italic tracking-widest text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-orange-400/60 border-x-orange-600/30 border-b-black/60 whitespace-nowrap"
                    style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                  >
                    Uruchom
                  </button>
                </div>
                <div className="flex items-start gap-3 p-3 border border-slate-700 bg-black/30 rounded">
                  <div className="flex-1">
                    <div className="text-xs text-white mb-0.5">Napraw wolnych agentów</div>
                    <div className="text-[10px] text-slate-500">Skanuje listę wolnych agentów i usuwa statusy "Nie na sprzedaż" oraz "Pierwsza 11 / Kluczowy" — zawodnicy bez klubu nie powinni ich posiadać.</div>
                  </div>
                  <button
                    onClick={handleRepairFreeAgents}
                    className="flex-shrink-0 px-3 py-1.5 bg-orange-700 hover:bg-orange-600 rounded-[16px] text-[10px] font-black uppercase italic tracking-widest text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-orange-400/60 border-x-orange-600/30 border-b-black/60 whitespace-nowrap"
                    style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                  >
                    Uruchom
                  </button>
                </div>
                <div className="flex items-start gap-3 p-3 border border-slate-700 bg-black/30 rounded">
                  <div className="flex-1">
                    <div className="text-xs text-white mb-0.5">Napraw składy</div>
                    <div className="text-[10px] text-slate-500">Skanuje wszystkie kluby AI — jeśli skład liczy mniej niż 22 zawodników, dogenerowuje brakujących (min. 2 bramkarzy, wiek 18–23, atrybuty wg reputacji).</div>
                  </div>
                  <button
                    onClick={handleRepairSquads}
                    className="flex-shrink-0 px-3 py-1.5 bg-orange-700 hover:bg-orange-600 rounded-[16px] text-[10px] font-black uppercase italic tracking-widest text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-orange-400/60 border-x-orange-600/30 border-b-black/60 whitespace-nowrap"
                    style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                  >
                    Uruchom
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4 flex items-start gap-3 flex-wrap">
            <div className="relative flex-shrink-0">
              <input
                type="text"
                value={teamSearchQuery}
                onChange={(e) => { setTeamSearchQuery(e.target.value); if (!e.target.value.trim()) setTeamSearchClubId(''); }}
                className={`${inputCls} px-3 py-2 w-64`}
                placeholder="szukaj drużyny..."
              />
              {teamSearchResults.length > 0 && (teamSearchQuery.trim() || teamLeagueFilter) && !teamSearchClubId && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded z-20 max-h-64 overflow-y-auto editor-scroll">
                  {teamSearchResults.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setTeamSearchClubId(c.id); setTeamSearchQuery(c.name); setTeamLeagueFilter(''); }}
                      className="w-full text-left px-3 py-2 text-xs text-white hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0"
                    >
                      <span className="font-black">{c.name}</span>
                      <span className="text-slate-500 ml-2 text-[10px]">{c.leagueId}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {([
                { label: 'Ekstraklasa', filter: 'L_PL_1' },
                { label: '1 Liga',      filter: 'L_PL_2' },
                { label: '2 Liga',      filter: 'L_PL_3' },
                { label: '3 Liga',      filter: 'L_PL_4' },
                { label: 'Anglia',      filter: 'ENG' },
                { label: 'Hiszpania',   filter: 'ESP' },
                { label: 'Niemcy',      filter: 'GER' },
                { label: 'Włochy',      filter: 'ITA' },
                { label: 'Francja',     filter: 'FRA' },
                { label: 'Portugalia',  filter: 'POR' },
                { label: 'Belgia',      filter: 'BEL' },
                { label: 'Holandia',    filter: 'NED' },
              ] as { label: string; filter: string }[]).map(({ label, filter }) => (
                <button
                  key={filter}
                  onClick={() => {
                    if (teamLeagueFilter === filter) {
                      setTeamLeagueFilter('');
                    } else {
                      setTeamLeagueFilter(filter);
                      setTeamSearchClubId('');
                      setTeamSearchQuery('');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${teamLeagueFilter === filter ? 'bg-yellow-600 border-t-yellow-400/60 border-x-yellow-500/30 border-b-black/60 text-white' : 'bg-white/5 border-t-white/10 border-x-white/5 border-b-black/40 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                  style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {selectedTeamClub && (
            <div>
              <div className="flex items-center gap-4 pb-3 mb-4 border-b border-slate-700">
                {selectedTeamClub.logoFile && (
                  <img src={new URL(`../../Graphic/logo/${selectedTeamClub.logoFile}`, import.meta.url).href} alt="" className="w-12 h-12 object-contain flex-shrink-0" />
                )}
                <div className="text-3xl text-white">{selectedTeamClub.name}</div>
                <span className="text-xs text-slate-500 ml-2">{selectedTeamClub.leagueId} • Rep: {selectedTeamClub.reputation}</span>
                <div className="flex items-center gap-1 ml-2">
                  {selectedTeamClub.colorsHex.map((c, i) => (
                    <span key={i} className="w-4 h-4 rounded-full border border-white/30 flex-shrink-0" style={{ background: c }} title={c} />
                  ))}
                </div>
                <span className="text-xs text-slate-500">{selectedTeamClub.stadiumName} • {selectedTeamClub.stadiumCapacity.toLocaleString('pl-PL')} miejsc</span>
              </div>

              <div className="grid grid-cols-4 gap-6">

                {/* SKŁAD */}
                <div>
                  <div className="text-xs text-yellow-400 mb-2">Skład ({selectedTeamSquad.length})</div>
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-1 text-slate-400 font-black uppercase tracking-tighter">Poz.</th>
                        <th className="text-left py-1 text-slate-400 font-black uppercase tracking-tighter">Zawodnik</th>
                        <th className="text-right py-1 text-slate-400 font-black uppercase tracking-tighter">OVR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...selectedTeamSquad]
                        .sort((a, b) => POS_ORDER[a.position] - POS_ORDER[b.position] || b.overallRating - a.overallRating)
                        .map(p => (
                          <tr key={p.id} className="border-b border-slate-800/50">
                            <td className="py-1">
                              <span className={p.position === PlayerPosition.GK ? 'text-yellow-400' : p.position === PlayerPosition.DEF ? 'text-blue-400' : p.position === PlayerPosition.MID ? 'text-green-400' : 'text-red-400'}>
                                {p.position}
                              </span>
                            </td>
                            <td className="py-1 text-white">{p.lastName} {p.firstName}</td>
                            <td className="py-1 text-right text-emerald-400 tabular-nums">{p.overallRating}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* SZTAB */}
                <div>
                  <div className="text-xs text-yellow-400 mb-2">Sztab</div>
                  {selectedTeamCoach && (
                    <div className="mb-2 p-2 border border-slate-800 bg-black/20 rounded">
                      <div className="text-[10px] text-slate-500 mb-0.5">Trener</div>
                      <div className="text-xs text-white font-black">{selectedTeamCoach.firstName} {selectedTeamCoach.lastName}</div>
                      <div className="text-[10px] text-slate-400">{selectedTeamCoach.nationality} • {selectedTeamCoach.age} lat</div>
                    </div>
                  )}
                  {selectedTeamStaff.map(s => (
                    <div key={s.id} className="mb-2 p-2 border border-slate-800 bg-black/20 rounded">
                      <div className="text-[10px] text-slate-500 mb-0.5">{STAFF_ROLE_LABELS[s.role] ?? s.role}</div>
                      <div className="text-xs text-white font-black">{s.firstName} {s.lastName}</div>
                      <div className="text-[10px] text-slate-400">{s.nationality} • {s.age} lat</div>
                    </div>
                  ))}
                  {!selectedTeamCoach && selectedTeamStaff.length === 0 && (
                    <div className="text-xs text-slate-600">Brak danych sztabu</div>
                  )}
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-6 self-start">
                {/* FINANSE */}
                <div>
                  <div className="text-xs text-yellow-400 mb-2">Finanse</div>
                  <div className="space-y-3">
                    <div>
                      <div className={`${labelCls} mb-1`}>Budżet główny (PLN)</div>
                      <input type="number" min={0} value={editTeamBudget}
                        onChange={(e) => setEditTeamBudget(e.target.value)}
                        className={`${inputCls} w-full px-2 py-1.5 tabular-nums`} />
                    </div>
                    <div>
                      <div className={`${labelCls} mb-1`}>Budżet transferowy (PLN)</div>
                      <input type="number" min={0} value={editTeamTransferBudget}
                        onChange={(e) => setEditTeamTransferBudget(e.target.value)}
                        className={`${inputCls} w-full px-2 py-1.5 tabular-nums`} />
                    </div>
                    <div>
                      <div className={`${labelCls} mb-1`}>Budżet rezerwowy (PLN)</div>
                      <input type="number" min={0} value={editTeamReserveBudget}
                        onChange={(e) => setEditTeamReserveBudget(e.target.value)}
                        className={`${inputCls} w-full px-2 py-1.5 tabular-nums`} />
                    </div>
                    <div>
                      <div className={`${labelCls} mb-1`} style={{ color: '#facc15' }}>Pula podpisów (PLN)</div>
                      <input type="number" min={0} value={editTeamSigningPool}
                        onChange={(e) => setEditTeamSigningPool(e.target.value)}
                        className={`${inputCls} w-full px-2 py-1.5 tabular-nums`} />
                    </div>
                    <button
                      onClick={() => {
                        const b = parseInt(editTeamBudget) || 0;
                        const tb = parseInt(editTeamTransferBudget) || 0;
                        const rb = parseInt(editTeamReserveBudget) || 0;
                        const sp = parseInt(editTeamSigningPool) || 0;
                        setClubs(prev => prev.map(c => c.id === selectedTeamClub.id ? { ...c, budget: b, transferBudget: tb, reserveBudget: rb, signingBonusPool: sp } : c));
                        showGameNotification({ title: 'Zapisano finanse', message: `Finanse ${selectedTeamClub.name} zostały zaktualizowane.`, tone: 'success' });
                      }}
                      className="w-full px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-[18px] text-[10px] font-black uppercase italic tracking-widest text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-emerald-400/60 border-x-emerald-600/30 border-b-black/60"
                      style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                    >
                      Zapisz finanse
                    </button>
                  </div>
                </div>

                {/* DANE KLUBU */}
                <div>
                  <div className="text-xs text-yellow-400 mb-2">Dane klubu</div>
                  <div className="space-y-3">
                    <div>
                      <div className={`${labelCls} mb-1`}>Nazwa zespołu</div>
                      <input type="text" value={editTeamName}
                        onChange={(e) => setEditTeamName(e.target.value)}
                        className={`${inputCls} w-full px-2 py-1.5`} />
                    </div>
                    <div>
                      <div className={`${labelCls} mb-1`}>Nazwa stadionu</div>
                      <input type="text" value={editTeamStadiumName}
                        onChange={(e) => setEditTeamStadiumName(e.target.value)}
                        className={`${inputCls} w-full px-2 py-1.5`} />
                    </div>
                    <div>
                      <div className={`${labelCls} mb-1`}>Pojemność</div>
                      <input type="number" min={0} value={editTeamStadiumCapacity}
                        onChange={(e) => setEditTeamStadiumCapacity(e.target.value)}
                        className={`${inputCls} w-full px-2 py-1.5 tabular-nums`} />
                    </div>
                    <div>
                      <div className={`${labelCls} mb-1`}>Reputacja (1–20)</div>
                      <input type="number" min={1} max={20} value={editTeamReputation}
                        onChange={(e) => setEditTeamReputation(e.target.value)}
                        className={`${inputCls} w-full px-2 py-1.5 tabular-nums`} />
                    </div>
                    <div>
                      <div className={`${labelCls} mb-2`}>Kolory</div>
                      <div className="flex items-start gap-2 flex-wrap">
                        {editTeamColors.map((color, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div className="text-[10px] text-slate-500">Kolor {i + 1}</div>
                            <div className="relative w-10 h-10 rounded border border-slate-600 overflow-hidden cursor-pointer">
                              <div className="w-full h-full" style={{ background: color }} />
                              <input
                                type="color"
                                value={color}
                                onChange={(e) => {
                                  const next = [...editTeamColors];
                                  next[i] = e.target.value;
                                  setEditTeamColors(next);
                                }}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                              />
                            </div>
                            <div className="text-[9px] text-slate-500 tabular-nums">{color}</div>
                            {editTeamColors.length > 1 && (
                              <button
                                onClick={() => setEditTeamColors(prev => prev.filter((_, idx) => idx !== i))}
                                className="text-[9px] text-red-500 hover:text-red-400 leading-none"
                              >
                                usuń
                              </button>
                            )}
                          </div>
                        ))}
                        {editTeamColors.length < 4 && (
                          <div className="flex flex-col items-center gap-1 mt-5">
                            <button
                              onClick={() => setEditTeamColors(prev => [...prev, '#ffffff'])}
                              className="w-10 h-10 rounded border border-dashed border-slate-600 text-slate-500 hover:text-white hover:border-slate-400 text-lg flex items-center justify-center transition-colors"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className={labelCls}>Stroje meczowe</div>
                    <button
                      onClick={resetEditTeamKitsFromColors}
                      className="text-[9px] text-slate-400 hover:text-yellow-300 font-black italic uppercase tracking-tighter transition-colors"
                    >
                      z barw
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {editTeamKits.map((kit, index) => (
                      <div key={kit.id || index} className={`relative rounded-lg border p-2.5 ${index >= 2 && !kit.isActive ? 'border-slate-800 bg-black/10 opacity-55' : 'border-slate-700 bg-black/25'}`}>
                        {index >= 2 && (
                          <label className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded border border-slate-700 bg-slate-950/90 px-1.5 py-1 text-[8px] text-slate-400 font-black italic uppercase tracking-tighter">
                            <input
                              type="checkbox"
                              checked={!!kit.isActive}
                              onChange={(e) => updateEditTeamKit(index, { isActive: e.target.checked })}
                              className="h-3 w-3 accent-yellow-500"
                            />
                            aktywny
                          </label>
                        )}
                        <input
                          type="text"
                          value={kit.name}
                          onChange={(e) => updateEditTeamKit(index, { name: e.target.value })}
                          className={`${inputCls} mb-2 min-w-0 px-2 py-1 text-[10px]`}
                        />
                        <select
                          value={kit.pattern ?? 'solid'}
                          onChange={(e) => updateEditTeamKit(index, { pattern: e.target.value as NonNullable<ClubKit['pattern']> })}
                          className={`${inputCls} mb-2 w-full px-2 py-1 text-[9px]`}
                        >
                          {KIT_PATTERN_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <div className="flex items-center justify-center">
                          <KitPreview
                            shirt={kit.shirt}
                            shirtSecondary={kit.shirtSecondary}
                            shorts={kit.shorts}
                            socks={kit.socks}
                            pattern={kit.pattern}
                            className="h-20 w-20"
                          />
                        </div>
                        <div className="mt-2 space-y-1">
                          {([
                            'shirt',
                            ...(kit.pattern && kit.pattern !== 'solid' ? ['shirtSecondary' as const] : []),
                            'shorts',
                            'socks'
                          ] as const).map(part => (
                            <div key={part} className="flex items-center justify-between gap-2">
                              <span className="text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">
                                {part === 'shirt' ? 'kosz.' : part === 'shirtSecondary' ? 'pas' : part === 'shorts' ? 'spod.' : 'getry'}
                              </span>
                              <div className="flex items-center gap-1">
                                {part !== 'shirt' && (
                                  <button
                                    type="button"
                                    onClick={() => updateEditTeamKit(index, { [part]: kit.shirt } as Partial<ClubKit>)}
                                    className="rounded border border-slate-700 bg-white/5 px-1.5 py-1 text-[7px] text-slate-400 hover:border-yellow-400/60 hover:text-yellow-300 font-black italic uppercase tracking-tighter transition-colors"
                                    title="Skopiuj kolor koszulki"
                                  >
                                    = kosz.
                                  </button>
                                )}
                                <div className="relative h-6 w-10 overflow-hidden rounded border border-slate-600">
                                  <div className="h-full w-full" style={{ background: kit[part] ?? kit.shorts }} />
                                  <input
                                    type="color"
                                    value={kit[part] ?? kit.shorts}
                                    onChange={(e) => updateEditTeamKit(index, { [part]: e.target.value } as Partial<ClubKit>)}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const cap = parseInt(editTeamStadiumCapacity) || 0;
                      const rep = Math.min(20, Math.max(1, parseInt(editTeamReputation) || 1));
                      const trimmedName = editTeamName.trim();
                      if (!trimmedName) return;
                      const kits = (editTeamKits.length === 4 ? editTeamKits : createDefaultClubKits(editTeamColors))
                        .map((kit, index) => ({ ...kit, isActive: index < 2 ? true : Boolean(kit.isActive) }));
                      setClubs(prev => prev.map(c => c.id === selectedTeamClub.id ? {
                        ...c,
                        name: trimmedName,
                        stadiumName: editTeamStadiumName.trim(),
                        stadiumCapacity: cap,
                        reputation: rep,
                        colorsHex: editTeamColors.filter(Boolean),
                        kits
                      } : c));
                      setTeamSearchQuery(trimmedName);
                      showGameNotification({ title: 'Zapisano dane', message: `Dane ${trimmedName} zostały zaktualizowane.`, tone: 'success' });
                    }}
                    className="mt-4 w-full px-5 py-3 bg-blue-800 hover:bg-blue-700 rounded-[20px] text-[11px] font-black uppercase italic tracking-widest text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-blue-400/60 border-x-blue-700/30 border-b-black/60"
                    style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.55), 0 8px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                  >
                    Zapisz dane
                  </button>
                </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* SEKCJA REPREZENTACJE */}
      {activeSection === 'REPREZENTACJE' && (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-72 flex-shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-900/45 p-3 editor-scroll">
            <div className={`${labelCls} mb-3`}>
              Reprezentacje: {NT_CONTINENT_BTNS.find(continent => continent.value === ntContinentFilter)?.label}
            </div>
            <div className="space-y-1">
              {filteredNationalTeams.map(team => (
                <button
                  key={team.id}
                  onClick={() => setSelectedNTEditorId(team.id)}
                  className={`w-full rounded border px-3 py-2 text-left text-xs transition-colors ${selectedNTEditorId === team.id ? 'border-blue-500/60 bg-blue-900/50 text-white' : 'border-slate-800 bg-black/20 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70'}`}
                >
                  <span className="block">{team.name}</span>
                  <span className="mt-0.5 block text-[9px] text-slate-500">Rep. {team.reputation} • Tier {team.tier}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 editor-scroll">
            {!selectedNTEditorTeam && (
              <div className="flex h-full items-center justify-center text-sm text-slate-600">
                Wybierz reprezentację z listy
              </div>
            )}

            {selectedNTEditorTeam && (
              <div className="mx-auto max-w-5xl">
                <div className="mb-5 flex items-center gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-3xl text-white">{selectedNTEditorTeam.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{selectedNTEditorTeam.continent} • Tier {selectedNTEditorTeam.tier}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    {getNationalTeamKits(selectedNTEditorTeam).map(kit => (
                      <span key={kit.id} className="h-5 w-5 rounded-full border border-white/30" style={{ background: kit.shirt }} title={kit.name} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className={`${labelCls} mb-1`}>Stadion</div>
                    <input
                      type="text"
                      value={editNTStadiumName}
                      onChange={(e) => setEditNTStadiumName(e.target.value)}
                      className={`${inputCls} w-full px-3 py-2`}
                    />
                  </div>
                  <div>
                    <div className={`${labelCls} mb-1`}>Pojemność</div>
                    <input
                      type="number"
                      min={0}
                      value={editNTStadiumCapacity}
                      onChange={(e) => setEditNTStadiumCapacity(e.target.value)}
                      className={`${inputCls} w-full px-3 py-2 tabular-nums`}
                    />
                  </div>
                  <div>
                    <div className={`${labelCls} mb-1`}>Reputacja (1–20)</div>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={editNTReputation}
                      onChange={(e) => setEditNTReputation(e.target.value)}
                      className={`${inputCls} w-full px-3 py-2 tabular-nums`}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className={`${labelCls} mb-3`}>Stroje reprezentacji</div>
                  <div className="grid grid-cols-3 gap-4">
                    {editNTKits.map((kit, index) => (
                      <div key={kit.id || index} className="rounded-lg border border-slate-700 bg-black/25 p-3">
                        <div className="mb-2 text-xs text-white">{kit.name}</div>
                        <select
                          value={kit.pattern ?? 'solid'}
                          onChange={(e) => updateEditNTKit(index, { pattern: e.target.value as NonNullable<ClubKit['pattern']> })}
                          className={`${selectCls} mb-3 w-full px-2 py-1.5 text-[10px]`}
                        >
                          {KIT_PATTERN_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <div className="flex justify-center">
                          <KitPreview
                            shirt={kit.shirt}
                            shirtSecondary={kit.shirtSecondary}
                            shorts={kit.shorts}
                            socks={kit.socks}
                            pattern={kit.pattern}
                            className="h-28 w-28"
                          />
                        </div>
                        <div className="mt-3 space-y-2">
                          {([
                            ['shirt', 'Koszulka'],
                            ...(kit.pattern && kit.pattern !== 'solid' ? [['shirtSecondary', 'Wzór']] : []),
                            ['shorts', 'Spodenki'],
                            ['socks', 'Getry'],
                          ] as [keyof ClubKit, string][]).map(([part, label]) => (
                            <div key={part} className="flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-500">{label}</span>
                              <div className="relative h-7 w-12 overflow-hidden rounded border border-slate-600">
                                <div className="h-full w-full" style={{ background: String(kit[part] ?? kit.shorts) }} />
                                <input
                                  type="color"
                                  value={String(kit[part] ?? kit.shorts)}
                                  onChange={(e) => updateEditNTKit(index, { [part]: e.target.value } as Partial<ClubKit>)}
                                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 border-t border-slate-800 pt-2">
                          <div className="mb-1.5 text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Kopiuj kolor na cały komplet</div>
                          <div className="grid grid-cols-3 gap-1">
                            {([
                              ['shirt', 'Kosz.'],
                              ['shorts', 'Spod.'],
                              ['socks', 'Getry'],
                            ] as const).map(([source, label]) => (
                              <button
                                key={source}
                                type="button"
                                onClick={() => copyEditNTKitColorToBaseParts(index, source)}
                                className="rounded border border-slate-700 bg-white/5 px-1 py-1 text-[8px] text-slate-400 font-black italic uppercase tracking-tighter transition-colors hover:border-yellow-400/60 hover:text-yellow-300"
                                title={`Skopiuj kolor: ${label}`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveNationalTeam}
                  className="mt-6 w-full rounded-[20px] border-x border-b border-t border-b-black/60 border-x-blue-700/30 border-t-blue-400/60 bg-blue-800 px-5 py-3 text-[11px] font-black italic uppercase tracking-widest text-white transition-all hover:bg-blue-700 active:translate-y-[2px]"
                  style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.55), 0 8px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                >
                  Zapisz reprezentację
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      {activeSection === 'GRACZE' && (
      <div className="flex flex-1 overflow-hidden">

        {/* LEWA — FORMULARZ */}
        <div
          className={`flex-1 overflow-y-auto px-5 py-3 transition-opacity duration-200 editor-scroll relative`}
          style={{ background: bgGradient }}
        >
          {/* Overlay ciemności aby formularz był czytelny */}
          <div className="absolute inset-0 bg-slate-950/70 pointer-events-none" />

          {showRepairPanel && (
            <div className="relative z-10 mb-4 p-4 border border-orange-700/40 bg-orange-950/30 rounded-lg">
              <div className="text-xs text-orange-400 mb-3">Narzędzia naprawy</div>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 p-3 border border-slate-700 bg-black/30 rounded">
                  <div className="flex-1">
                    <div className="text-xs text-white mb-0.5">Napraw finanse klubów</div>
                    <div className="text-[10px] text-slate-500">Resetuje budżet, transfery, rezerwę i pulę podpisów wszystkich klubów do wartości początkowych (na podstawie reputacji i tieru).</div>
                  </div>
                  <button
                    onClick={handleRepairClubFinances}
                    className="flex-shrink-0 px-3 py-1.5 bg-orange-700 hover:bg-orange-600 rounded-[16px] text-[10px] font-black uppercase italic tracking-widest text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-orange-400/60 border-x-orange-600/30 border-b-black/60 whitespace-nowrap"
                    style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                  >
                    Uruchom
                  </button>
                </div>
                <div className="flex items-start gap-3 p-3 border border-slate-700 bg-black/30 rounded">
                  <div className="flex-1">
                    <div className="text-xs text-white mb-0.5">Napraw wolnych agentów</div>
                    <div className="text-[10px] text-slate-500">Skanuje listę wolnych agentów i usuwa statusy "Nie na sprzedaż" oraz "Pierwsza 11 / Kluczowy" — zawodnicy bez klubu nie powinni ich posiadać.</div>
                  </div>
                  <button
                    onClick={handleRepairFreeAgents}
                    className="flex-shrink-0 px-3 py-1.5 bg-orange-700 hover:bg-orange-600 rounded-[16px] text-[10px] font-black uppercase italic tracking-widest text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-orange-400/60 border-x-orange-600/30 border-b-black/60 whitespace-nowrap"
                    style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                  >
                    Uruchom
                  </button>
                </div>
                <div className="flex items-start gap-3 p-3 border border-slate-700 bg-black/30 rounded">
                  <div className="flex-1">
                    <div className="text-xs text-white mb-0.5">Napraw składy</div>
                    <div className="text-[10px] text-slate-500">Skanuje wszystkie kluby AI — jeśli skład liczy mniej niż 22 zawodników, dogenerowuje brakujących (min. 2 bramkarzy, wiek 18–23, atrybuty wg reputacji).</div>
                  </div>
                  <button
                    onClick={handleRepairSquads}
                    className="flex-shrink-0 px-3 py-1.5 bg-orange-700 hover:bg-orange-600 rounded-[16px] text-[10px] font-black uppercase italic tracking-widest text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-orange-400/60 border-x-orange-600/30 border-b-black/60 whitespace-nowrap"
                    style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                  >
                    Uruchom
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={`relative z-10 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>

            {/* IMIĘ NAZWISKO + OVR | Logo + NAZWA DRUŻYNY */}
            <div className="mb-3 pb-3 border-b border-yellow-400/10 flex items-center gap-4 bg-yellow-400/[0.04] rounded-lg px-3 pt-2">
              <div className="text-4xl text-white leading-none font-black italic">
                {firstName || '—'} {lastName}
              </div>
              <div className="w-14 h-14 rounded-full border-2 border-white/30 bg-black/40 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-[9px] text-yellow-400 leading-none mb-0.5">OVR</span>
                <span className="text-3xl text-white tabular-nums leading-none">{liveOvr}</span>
              </div>
              <span className="w-px h-10 bg-white/15 mx-1" />
              {selectedClub?.logoFile && (
                <img
                  src={new URL(`../../Graphic/logo/${selectedClub.logoFile}`, import.meta.url).href}
                  alt=""
                  className="w-10 h-10 object-contain flex-shrink-0"
                />
              )}
              <div className="text-2xl text-white leading-none">
                {selectedClub?.name ?? '—'}
              </div>
            </div>

            {/* IMIĘ / NAZWISKO pola */}
            <div className="flex gap-3 mb-2 bg-white/[0.03] rounded-lg px-3 py-2">
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

            {/* KLUB / STATUS / REPREZENTACJA */}
            <div className="flex gap-3 items-end mb-3 bg-slate-900/50 rounded-lg px-3 py-2">
              <div>
                <div className={`${labelCls} mb-1`}>Klub</div>
                <select
                  value={playerTargetClubId}
                  onChange={(e) => setPlayerTargetClubId(e.target.value)}
                  className={`${selectCls} px-2 py-1.5 w-56`}
                >
                  <option value="FREE_AGENTS">— Wolny agent —</option>
                  {[...clubs].sort((a, b) => a.name.localeCompare(b.name, 'pl')).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className={`${labelCls} mb-1`}>Status</div>
                <select
                  value={isUntouchable ? 'UNTOUCHABLE' : isOnTransferList ? 'TRANSFER_LIST' : isAvailableForLoan ? 'AVAILABLE_LOAN' : squadRole === 'STARTER' ? 'STARTER' : squadRole === 'KEY_PLAYER' ? 'KEY_PLAYER' : 'NONE'}
                  onChange={(e) => {
                    const v = e.target.value;
                    setIsUntouchable(v === 'UNTOUCHABLE');
                    setIsOnTransferList(v === 'TRANSFER_LIST');
                    setIsAvailableForLoan(v === 'AVAILABLE_LOAN');
                    setSquadRole(v === 'STARTER' ? 'STARTER' : v === 'KEY_PLAYER' ? 'KEY_PLAYER' : null);
                  }}
                  className={`${selectCls} px-2 py-1.5 w-52`}
                >
                  <option value="NONE">Brak</option>
                  <option value="UNTOUCHABLE">Nie na sprzedaż</option>
                  <option value="TRANSFER_LIST">Na liście transferowej</option>
                  <option value="AVAILABLE_LOAN">Dostępny na wypożyczenie</option>
                  <option value="STARTER">Pierwsza 11</option>
                  <option value="KEY_PLAYER">Kluczowy zawodnik</option>
                </select>
              </div>
              <div>
                <div className={`${labelCls} mb-1`}>Reprez. mecze</div>
                <input type="number" min={0} value={nationalMatchesPlayed}
                  onChange={(e) => setNationalMatchesPlayed(parseInt(e.target.value) || 0)}
                  className={`${inputCls} w-20 px-2 py-1.5 text-center`} />
              </div>
              <div>
                <div className={`${labelCls} mb-1`}>Reprez. bramki</div>
                <input type="number" min={0} value={nationalGoals}
                  onChange={(e) => setNationalGoals(parseInt(e.target.value) || 0)}
                  className={`${inputCls} w-20 px-2 py-1.5 text-center`} />
              </div>
            </div>

            {/* WIEK / POZYCJA / NARODOWOŚĆ */}
            <div className="flex gap-3 items-end mb-3 bg-white/[0.03] rounded-lg px-3 py-2">
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
                      onClick={() => handlePrimaryPositionChange(pos)}
                      className={`px-2 py-1 rounded border-t border-x border-b text-xs transition-all active:translate-y-[2px] ${position === pos ? POS_COLOR[pos] : 'text-slate-500 border-t-white/10 border-x-white/5 border-b-black/40 bg-white/5 hover:text-white'}`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className={`${labelCls} mb-1`}>2. pozycja</div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setSecondaryPosition(null);
                      setSecondaryPositionRating(50);
                    }}
                    className={`px-2 py-1 rounded border-t border-x border-b text-xs transition-all active:translate-y-[2px] ${secondaryPosition === null ? 'text-white border-t-white/30 border-x-white/15 border-b-black/60 bg-slate-700' : 'text-slate-500 border-t-white/10 border-x-white/5 border-b-black/40 bg-white/5 hover:text-white'}`}
                  >
                    BRAK
                  </button>
                  {([PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD] as PlayerPosition[]).filter(pos => pos !== position).map(pos => (
                    <button
                      key={pos}
                      onClick={() => setSecondaryPosition(pos)}
                      className={`px-2 py-1 rounded border-t border-x border-b text-xs transition-all active:translate-y-[2px] ${secondaryPosition === pos ? POS_COLOR[pos] : 'text-slate-500 border-t-white/10 border-x-white/5 border-b-black/40 bg-white/5 hover:text-white'}`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className={`${labelCls} mb-1`}>Ocena 2. poz.</div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={99}
                    value={secondaryPositionRating}
                    disabled={!secondaryPosition}
                    onChange={(e) => handleSecondaryRatingChange(e.target.value)}
                    className="w-24 accent-amber-400 disabled:opacity-30"
                  />
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={secondaryPositionRating}
                    disabled={!secondaryPosition}
                    onChange={(e) => handleSecondaryRatingChange(e.target.value)}
                    className={`${inputCls} w-14 px-2 py-1.5 text-center disabled:opacity-30`}
                  />
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

            {/* UZGODNIONY TRANSFER */}
            <div className="mb-3 p-3 border border-slate-800 bg-black/20 rounded">
              <label className="inline-flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={hasPendingTransfer}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHasPendingTransfer(checked);
                    if (!checked) {
                      setTransferPendingClubId('');
                      setTransferReportDate('');
                      setTransferPendingFee(0);
                      setTransferPendingSalary(0);
                      setTransferPendingContractYears(1);
                    }
                  }}
                  className="accent-yellow-400"
                />
                <span className={`${labelCls}`}>Uzgodniony transfer do nowego klubu</span>
              </label>
              {hasPendingTransfer && (
                <div className="flex flex-wrap gap-3 items-end">
                  <div>
                    <div className={`${labelCls} mb-1`}>Nowy klub</div>
                    <select
                      value={transferPendingClubId}
                      onChange={(e) => setTransferPendingClubId(e.target.value)}
                      className={`${selectCls} px-2 py-1.5 w-64`}
                    >
                      <option value="">— wybierz klub —</option>
                      {loanClubOptions.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className={`${labelCls} mb-1`}>Data przejścia</div>
                    <input
                      type="date"
                      value={transferReportDate}
                      onChange={(e) => setTransferReportDate(e.target.value)}
                      className={`${inputCls} px-2 py-1.5`}
                    />
                  </div>
                  <div>
                    <div className={`${labelCls} mb-1`}>Kwota transferu (PLN)</div>
                    <input
                      type="number"
                      min={0}
                      value={transferPendingFee}
                      onChange={(e) => setTransferPendingFee(parseInt(e.target.value, 10) || 0)}
                      className={`${inputCls} w-36 px-2 py-1.5 text-right`}
                    />
                  </div>
                  <div>
                    <div className={`${labelCls} mb-1`}>Nowa pensja roczna (PLN)</div>
                    <input
                      type="number"
                      min={0}
                      value={transferPendingSalary}
                      onChange={(e) => setTransferPendingSalary(parseInt(e.target.value, 10) || 0)}
                      className={`${inputCls} w-36 px-2 py-1.5 text-right`}
                    />
                  </div>
                  <div>
                    <div className={`${labelCls} mb-1`}>Lata kontraktu</div>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={transferPendingContractYears}
                      onChange={(e) => setTransferPendingContractYears(parseInt(e.target.value, 10) || 1)}
                      className={`${inputCls} w-20 px-2 py-1.5 text-center`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* WYPOŻYCZENIE */}
            <div className="mb-3 p-3 border border-slate-800 bg-black/20 rounded">
              <label className="inline-flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={isLoanedOut}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsLoanedOut(checked);
                    if (checked && !loanParentClubId) setLoanParentClubId(selectedClubId);
                  }}
                  className="accent-yellow-400"
                />
                <span className={`${labelCls}`}>Wypożyczony do innego klubu</span>
              </label>
              {isLoanedOut && (
                <div className="flex gap-3 items-end">
                  <div>
                    <div className={`${labelCls} mb-1`}>Klub macierzysty</div>
                    <select
                      value={loanParentClubId}
                      onChange={(e) => setLoanParentClubId(e.target.value)}
                      className={`${selectCls} px-2 py-1.5 w-64`}
                    >
                      <option value="">— wybierz klub —</option>
                      {loanClubOptions.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className={`${labelCls} mb-1`}>Klub wypożyczenia</div>
                    <select
                      value={loanDestinationClubId}
                      onChange={(e) => setLoanDestinationClubId(e.target.value)}
                      className={`${selectCls} px-2 py-1.5 w-64`}
                    >
                      <option value="">— wybierz klub —</option>
                      {loanClubOptions.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className={`${labelCls} mb-1`}>Od</div>
                    <input
                      type="date"
                      value={loanStartDate}
                      onChange={(e) => setLoanStartDate(e.target.value)}
                      className={`${inputCls} px-2 py-1.5`}
                    />
                  </div>
                  <div>
                    <div className={`${labelCls} mb-1`}>Do</div>
                    <input
                      type="date"
                      value={loanEndDate}
                      onChange={(e) => setLoanEndDate(e.target.value)}
                      className={`${inputCls} px-2 py-1.5`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ATRYBUTY */}
            <div className="mb-3 bg-slate-900/60 rounded-lg px-3 pt-3 pb-1 border border-white/5">
              <div className="mb-2 text-center">
                <span className="text-[17px] text-yellow-400">Atrybuty</span>
                <div className="mt-1.5 h-px bg-yellow-400/30" />
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  {Array.from({ length: Math.ceil(ATTR_KEYS.length / 3) }, (_, rowIdx) => (
                    <tr key={rowIdx} className={`border-b border-slate-800/50 ${rowIdx % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                      {ATTR_KEYS.slice(rowIdx * 3, rowIdx * 3 + 3).map(key => (
                        <td key={key} className="py-[2px] pr-6">
                          <div className="flex items-center gap-3">
                            <span className="text-yellow-400 text-[15px] whitespace-nowrap w-44 flex-shrink-0">{ATTR_LABELS[key]}</span>
                            <input
                              type="number" min={1} max={99} value={attrs[key]}
                              onChange={(e) => handleAttrChange(key, e.target.value)}
                              onBlur={(e) => handleAttrChange(key, e.target.value)}
                              className={`${inputCls} w-[48px] h-[38px] p-0 text-center text-[18px] leading-none`}
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
      )}

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

      {/* SEKCJA SZTAB */}
      {activeSection === 'SZTAB' && (
        <div className="flex flex-1 overflow-hidden">

          {/* LEWA — wyszukiwarka + lista osób */}
          <div className="w-80 border-r border-slate-800 flex flex-col flex-shrink-0 bg-slate-900/40">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900 space-y-2">
              <div className="flex flex-wrap gap-1">
                {LEAGUE_FILTER_BTNS.map(({ label, filter }) => (
                  <button
                    key={filter}
                    onClick={() => {
                      if (sztabLeagueFilter === filter) {
                        setSztabLeagueFilter('');
                      } else {
                        setSztabLeagueFilter(filter);
                        setSztabSearchQuery('');
                        setSztabClubId('');
                        setSztabPersonId('');
                        setSztabPersonType(null);
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] transition-all active:translate-y-[2px] border-t border-x border-b ${sztabLeagueFilter === filter ? 'bg-yellow-600 border-t-yellow-400/60 border-x-yellow-500/30 border-b-black/60 text-white' : 'bg-white/5 border-t-white/10 border-x-white/5 border-b-black/40 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {sztabLeagueFilter && (
                <button
                  onClick={handleExportLeagueSztab}
                  className="w-full px-3 py-1.5 rounded text-[10px] bg-cyan-900/60 hover:bg-cyan-700 text-cyan-300 hover:text-white transition-colors border border-cyan-800/40 font-black italic uppercase tracking-tighter"
                  title="Eksportuj sztab wszystkich klubów z wybranej polskiej ligi do jednego pliku JSON."
                >
                  Eksportuj sztab ligi
                </button>
              )}
              <div className="relative">
                <input
                  type="text"
                  value={sztabSearchQuery}
                  onChange={(e) => { setSztabSearchQuery(e.target.value); if (!e.target.value.trim()) setSztabClubId(''); setSztabLeagueFilter(''); }}
                  className={`${inputCls} px-3 py-2 w-full`}
                  placeholder="szukaj klubu..."
                />
                {sztabSearchResults.length > 0 && sztabSearchQuery.trim() && !sztabClubId && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-slate-900 border border-slate-700 rounded z-20 max-h-52 overflow-y-auto editor-scroll">
                    {sztabSearchResults.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSztabClubId(c.id); setSztabSearchQuery(c.name); setSztabPersonId(''); setSztabPersonType(null); }}
                        className="w-full text-left px-3 py-2 text-xs text-white hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0"
                      >
                        <span className="font-black">{c.name}</span>
                        <span className="text-slate-500 ml-2 text-[10px]">{c.leagueId}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lista klubów (filtr ligi) lub lista osób (wybrany klub) */}
            <div className="flex-1 overflow-y-auto editor-scroll">
              {!sztabClubId && sztabLeagueFilter && (
                sztabSearchResults.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSztabClubId(c.id); setSztabSearchQuery(c.name); setSztabPersonId(''); setSztabPersonType(null); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0"
                  >
                    <span className="font-black">{c.name}</span>
                  </button>
                ))
              )}
              {sztabClubId && (
                <>
                  <div className="px-4 py-2 text-[10px] text-yellow-400 border-b border-slate-800 flex items-center justify-between">
                    <span>{sztabClub?.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleExportSztab}
                        title="Eksportuj dane sztabu tego klubu (trener główny + cały personel pomocniczy) do pliku JSON. Plik można zachować jako kopię zapasową lub zaimportować w innej grze."
                        className="px-2 py-0.5 rounded text-[10px] bg-cyan-900/60 hover:bg-cyan-700 text-cyan-300 hover:text-white transition-colors border border-cyan-800/40"
                      >
                        Eksportuj
                      </button>
                      <button
                        onClick={() => sztabImportRef.current?.click()}
                        title="Importuj dane sztabu z pliku JSON (format: sztab_*.json). Aktualizuje trenera i personel na podstawie ID — klub musi istnieć w grze."
                        className="px-2 py-0.5 rounded text-[10px] bg-emerald-900/60 hover:bg-emerald-700 text-emerald-300 hover:text-white transition-colors border border-emerald-800/40"
                      >
                        Importuj
                      </button>
                      <input ref={sztabImportRef} type="file" accept=".json" className="hidden" onChange={handleImportSztab} />
                    </div>
                  </div>
                  {sztabImportMsg && (
                    <div className={`px-4 py-1.5 text-[10px] border-b border-slate-800/50 ${sztabImportMsg.startsWith('Błąd') ? 'text-red-400' : 'text-emerald-400'}`}>
                      {sztabImportMsg}
                    </div>
                  )}
                  {sztabClubPersons.length === 0 && (
                    <div className="px-4 py-3 text-[10px] text-slate-500">Brak przypisanego sztabu.</div>
                  )}
                  {sztabClubPersons.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSztabPersonSelect(p.id, p.type)}
                      className={`w-full text-left px-4 py-2.5 border-b border-slate-800/50 last:border-0 transition-colors ${sztabPersonId === p.id ? 'bg-yellow-600/20' : 'hover:bg-slate-800'}`}
                    >
                      <div className="text-xs text-white font-black">{p.type === 'coach' ? coaches[p.id]?.firstName : staffMembers[p.id]?.firstName} {p.type === 'coach' ? coaches[p.id]?.lastName : staffMembers[p.id]?.lastName}</div>
                      <div className={`text-[10px] mt-0.5 ${p.type === 'coach' ? 'text-amber-400' : 'text-slate-400'}`}>
                        {p.type === 'coach' ? 'Trener główny' : STAFF_ROLE_LABELS[staffMembers[p.id]?.role ?? ''] ?? staffMembers[p.id]?.role}
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* PRAWA — formularz edycji osoby */}
          <div className="flex-1 overflow-y-auto px-6 py-5 editor-scroll">
            {!sztabPersonId ? (
              <div className="text-slate-600 text-xs mt-8">Wybierz klub, a następnie osobę ze sztabu.</div>
            ) : (
              <div className="max-w-xl">
                <div className="text-lg text-white mb-4">{editSztabFirstName} {editSztabLastName}</div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div>
                    <div className={labelCls + ' mb-1'}>Imię</div>
                    <input className={`${inputCls} px-2 py-1.5 w-full`} value={editSztabFirstName} onChange={e => setEditSztabFirstName(e.target.value)} />
                  </div>
                  <div>
                    <div className={labelCls + ' mb-1'}>Nazwisko</div>
                    <input className={`${inputCls} px-2 py-1.5 w-full`} value={editSztabLastName} onChange={e => setEditSztabLastName(e.target.value)} />
                  </div>
                  <div>
                    <div className={labelCls + ' mb-1'}>Wiek</div>
                    <input type="number" min={18} max={80} className={`${inputCls} px-2 py-1.5 w-full`} value={editSztabAge} onChange={e => setEditSztabAge(e.target.value)} />
                  </div>
                </div>

                <div className="text-xs text-yellow-400 mb-3">Atrybuty</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6">
                  {(sztabPersonType === 'coach' ? COACH_ATTR_LABELS : (STAFF_ROLE_ATTRS[staffMembers[sztabPersonId]?.role] ?? [])).map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 flex-1">{label}</span>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        className={`${inputCls} px-2 py-0.5 w-16 text-center`}
                        value={editSztabAttrs[key] ?? 1}
                        onChange={e => setEditSztabAttrs(prev => ({ ...prev, [key]: Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)) }))}
                      />
                    </div>
                  ))}
                </div>

                <div className="text-xs text-yellow-400 mb-3">Kontrakt</div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div>
                    <div className={labelCls + ' mb-1'}>Wynagrodzenie (mies.)</div>
                    {sztabPersonType === 'staff' ? (
                      <input
                        type="number"
                        min={0}
                        className={`${inputCls} px-2 py-1.5 w-full`}
                        value={editSztabSalary}
                        onChange={e => setEditSztabSalary(e.target.value)}
                      />
                    ) : (
                      <div className="text-xs text-slate-500 italic py-1.5">brak danych</div>
                    )}
                  </div>
                  <div>
                    <div className={labelCls + ' mb-1'}>Koniec kontraktu</div>
                    {sztabPersonType === 'staff' ? (
                      <input
                        type="date"
                        className={`${inputCls} px-2 py-1.5 w-full`}
                        value={editSztabContractEnd}
                        onChange={e => setEditSztabContractEnd(e.target.value)}
                      />
                    ) : (
                      <div className="text-xs text-slate-500 italic py-1.5">brak danych</div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSztabSave}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 rounded text-xs text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-emerald-400/60 border-x-emerald-600/30 border-b-black/60"
                >
                  Zapisz
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEKCJA ZARZĄD */}
      {activeSection === 'ZARZĄD' && (
        <div className="flex flex-1 overflow-hidden">

          {/* LEWA — wyszukiwarka + lista członków */}
          <div className="w-80 border-r border-slate-800 flex flex-col flex-shrink-0 bg-slate-900/40">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900 space-y-2">
              <div className="flex flex-wrap gap-1">
                {LEAGUE_FILTER_BTNS.map(({ label, filter }) => (
                  <button
                    key={filter}
                    onClick={() => {
                      if (zarzadLeagueFilter === filter) {
                        setZarzadLeagueFilter('');
                      } else {
                        setZarzadLeagueFilter(filter);
                        setZarzadSearchQuery('');
                        setZarzadClubId('');
                        setZarzadPersonKey(null);
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] transition-all active:translate-y-[2px] border-t border-x border-b ${zarzadLeagueFilter === filter ? 'bg-yellow-600 border-t-yellow-400/60 border-x-yellow-500/30 border-b-black/60 text-white' : 'bg-white/5 border-t-white/10 border-x-white/5 border-b-black/40 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {zarzadLeagueFilter && (
                <button
                  onClick={handleExportLeagueZarzad}
                  className="w-full px-3 py-1.5 rounded text-[10px] bg-cyan-900/60 hover:bg-cyan-700 text-cyan-300 hover:text-white transition-colors border border-cyan-800/40 font-black italic uppercase tracking-tighter"
                  title="Eksportuj zarząd wszystkich klubów z wybranej polskiej ligi do jednego pliku JSON."
                >
                  Eksportuj zarząd ligi
                </button>
              )}
              <div className="relative">
                <input
                  type="text"
                  value={zarzadSearchQuery}
                  onChange={(e) => { setZarzadSearchQuery(e.target.value); if (!e.target.value.trim()) { setZarzadClubId(''); setZarzadPersonKey(null); } setZarzadLeagueFilter(''); }}
                  className={`${inputCls} px-3 py-2 w-full`}
                  placeholder="szukaj klubu..."
                />
                {zarzadSearchResults.length > 0 && zarzadSearchQuery.trim() && !zarzadClubId && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-slate-900 border border-slate-700 rounded z-20 max-h-52 overflow-y-auto editor-scroll">
                    {zarzadSearchResults.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setZarzadClubId(c.id); setZarzadSearchQuery(c.name); setZarzadPersonKey(null); }}
                        className="w-full text-left px-3 py-2 text-xs text-white hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0"
                      >
                        <span className="font-black">{c.name}</span>
                        <span className="text-slate-500 ml-2 text-[10px]">{c.leagueId}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto editor-scroll">
              {!zarzadClubId && zarzadLeagueFilter && (
                zarzadSearchResults.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setZarzadClubId(c.id); setZarzadSearchQuery(c.name); setZarzadPersonKey(null); }}
                    className={`w-full text-left px-4 py-2.5 text-xs border-b border-slate-800/50 last:border-0 transition-colors ${zarzadClubId === c.id ? 'bg-yellow-600/20 text-white' : 'text-white hover:bg-slate-800'}`}
                  >
                    <span className="font-black">{c.name}</span>
                  </button>
                ))
              )}
              {zarzadClubId && (
                <>
                  <div className="px-4 py-2 text-[10px] text-yellow-400 border-b border-slate-800 flex items-center justify-between">
                    <span>{zarzadClub?.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleExportZarzad}
                        title="Eksportuj dane zarządu tego klubu (właściciel, prezes, dyrektorzy) do pliku JSON. Plik można zachować jako kopię zapasową lub zaimportować w innej grze."
                        className="px-2 py-0.5 rounded text-[10px] bg-cyan-900/60 hover:bg-cyan-700 text-cyan-300 hover:text-white transition-colors border border-cyan-800/40"
                      >
                        Eksportuj
                      </button>
                      <button
                        onClick={() => zarzadImportRef.current?.click()}
                        title="Importuj dane zarządu z pliku JSON (format: zarzad_*.json). Aktualizuje zarząd klubu na podstawie clubId zawartego w pliku — klub musi istnieć w grze."
                        className="px-2 py-0.5 rounded text-[10px] bg-emerald-900/60 hover:bg-emerald-700 text-emerald-300 hover:text-white transition-colors border border-emerald-800/40"
                      >
                        Importuj
                      </button>
                      <input ref={zarzadImportRef} type="file" accept=".json" className="hidden" onChange={handleImportZarzad} />
                    </div>
                  </div>
                  {zarzadImportMsg && (
                    <div className={`px-4 py-1.5 text-[10px] border-b border-slate-800/50 ${zarzadImportMsg.startsWith('Błąd') ? 'text-red-400' : 'text-emerald-400'}`}>
                      {zarzadImportMsg}
                    </div>
                  )}
                  {ZARZAD_PERSON_KEYS.filter(k => !!getZarzadPerson(zarzadClub, k)).map(k => {
                    const person = getZarzadPerson(zarzadClub, k);
                    return (
                      <button
                        key={k}
                        onClick={() => handleZarzadPersonSelect(k)}
                        className={`w-full text-left px-4 py-2.5 border-b border-slate-800/50 last:border-0 transition-colors ${zarzadPersonKey === k ? 'bg-yellow-600/20' : 'hover:bg-slate-800'}`}
                      >
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest">{MANAGEMENT_ROLE_LABELS[k]}</div>
                        <div className="text-xs text-white font-black mt-0.5">{person.firstName} {person.lastName}</div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* PRAWA — formularz edycji */}
          <div className="flex-1 overflow-y-auto px-6 py-5 editor-scroll">
            {!zarzadPersonKey ? (
              <div className="text-slate-600 text-xs mt-8">Wybierz klub, a następnie członka zarządu.</div>
            ) : (
              <div className="max-w-xl">
                <div className="text-xs text-slate-400 mb-1">{MANAGEMENT_ROLE_LABELS[zarzadPersonKey]}</div>
                <div className="text-lg text-white mb-4">{editZarzadFirstName} {editZarzadLastName}</div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div>
                    <div className={labelCls + ' mb-1'}>Imię</div>
                    <input className={`${inputCls} px-2 py-1.5 w-full`} value={editZarzadFirstName} onChange={e => setEditZarzadFirstName(e.target.value)} />
                  </div>
                  <div>
                    <div className={labelCls + ' mb-1'}>Nazwisko</div>
                    <input className={`${inputCls} px-2 py-1.5 w-full`} value={editZarzadLastName} onChange={e => setEditZarzadLastName(e.target.value)} />
                  </div>
                  <div>
                    <div className={labelCls + ' mb-1'}>Wiek</div>
                    <input type="number" min={18} max={90} className={`${inputCls} px-2 py-1.5 w-full`} value={editZarzadAge} onChange={e => setEditZarzadAge(e.target.value)} />
                  </div>
                </div>
                <div className="text-xs text-yellow-400 mb-3">Atrybuty</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6">
                  {(MANAGEMENT_ATTR_LABELS[zarzadPersonKey] ?? []).map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 flex-1">{label}</span>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        className={`${inputCls} px-2 py-0.5 w-16 text-center`}
                        value={editZarzadAttrs[key] ?? 1}
                        onChange={e => setEditZarzadAttrs(prev => ({ ...prev, [key]: Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)) }))}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleZarzadSave}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 rounded text-xs text-white transition-all active:translate-y-[2px] border-t border-x border-b border-t-emerald-400/60 border-x-emerald-600/30 border-b-black/60"
                >
                  Zapisz
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
