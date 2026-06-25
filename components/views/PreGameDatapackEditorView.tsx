import React, { useMemo, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import {
  Club,
  ClubKit,
  ClubKitPattern,
  ClubManagement,
  Coach,
  HealthStatus,
  NationalTeam,
  Player,
  PlayerAttributes,
  PlayerLoanInfo,
  PlayerPosition,
  Region,
  StaffMember,
  StaffRole,
  ViewState,
} from '../../types';
import { createDefaultClubKits, createDefaultNationalTeamKits, getClubKits, getNationalTeamKits } from '../../resources/ClubKits';
import { KitPreview } from '../common/KitPreview';
import { PlayerAttributesGenerator } from '../../services/PlayerAttributesGenerator';
import { STAFF_ROLE_ATTRS } from '../../services/StaffGenerationService';
import { CoachService } from '../../services/CoachService';
import { pickNationalityForRegion, REGION_TO_NT_LIST } from '../../services/NationalityService';

type EditorScreen = 'MENU' | 'TEAMS' | 'NATIONAL_TEAMS';
type TeamTab = 'SQUAD' | 'CLUB' | 'FINANCE' | 'KITS' | 'STAFF' | 'BOARD';
type EditorSearchResult =
  | { type: 'CLUB'; id: string; title: string; subtitle: string }
  | { type: 'PLAYER'; id: string; clubId: string; title: string; subtitle: string }
  | { type: 'COACH'; id: string; clubId: string | null; title: string; subtitle: string }
  | { type: 'STAFF'; id: string; clubId: string | null; title: string; subtitle: string }
  | { type: 'BOARD'; clubId: string; boardKey: string; title: string; subtitle: string }
  | { type: 'NATIONAL_TEAM'; id: string; title: string; subtitle: string };
type ContractLookupVariant = {
  id: string;
  label: string;
  sourceName: string;
  sourceUrl: string;
  contractEndDate: string;
  annualSalary: number;
  marketValue: number;
  confidence: number;
  note: string;
  sourceText?: string;
  marketValueOptions?: number[];
};

const FREE_AGENTS_ID = 'FREE_AGENTS';
const EDITOR_DATAPACK_IMPORTED_STORAGE_KEY = 'polish_league_editor_datapack_imported';

const inputCls = 'bg-black/45 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-yellow-400 font-black italic uppercase tracking-tighter';
const selectCls = `${inputCls} cursor-pointer`;
const labelCls = 'text-[10px] text-slate-400 font-black italic uppercase tracking-tighter';

const COUNTRY_OPTIONS = (Object.entries(REGION_TO_NT_LIST) as [Region, { name: string; reputation: number }[]][])
  .flatMap(([region, countries]) => countries.map(country => ({ region, name: country.name, reputation: country.reputation })))
  .sort((a, b) => a.name.localeCompare(b.name, 'pl'));

const findRegionForCountry = (countryName: string): Region =>
  COUNTRY_OPTIONS.find(country => country.name === countryName)?.region ?? Region.POLAND;

const getDefaultCountryForRegion = (region: Region): string =>
  COUNTRY_OPTIONS.find(country => country.region === region)?.name ?? pickNationalityForRegion(region) ?? 'Polska';

const getCountrySelectValue = (value?: string | null): string => {
  if (value && COUNTRY_OPTIONS.some(country => country.name === value)) return value;
  if (value && (Object.values(Region) as string[]).includes(value)) return getDefaultCountryForRegion(value as Region);
  return getDefaultCountryForRegion(Region.POLAND);
};

const ATTR_KEYS: (keyof PlayerAttributes)[] = [
  'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking',
  'finishing', 'technique', 'vision', 'dribbling', 'heading', 'positioning',
  'goalkeeping', 'freeKicks', 'talent', 'penalties', 'corners', 'aggression',
  'crossing', 'leadership', 'mentality', 'workRate',
];

const ATTR_LABELS: Record<keyof PlayerAttributes, string> = {
  strength: 'Siła',
  stamina: 'Kondycja',
  pace: 'Szybkość',
  defending: 'Obrona',
  passing: 'Podania',
  attacking: 'Atak',
  finishing: 'Wykończenie',
  technique: 'Technika',
  vision: 'Wizja',
  dribbling: 'Drybling',
  heading: 'Główkowanie',
  positioning: 'Ustawienie',
  goalkeeping: 'Bramkarstwo',
  freeKicks: 'Rzuty wolne',
  talent: 'Talent',
  penalties: 'Karne',
  corners: 'Rożne',
  aggression: 'Agresja',
  crossing: 'Dośrodkowania',
  leadership: 'Przywództwo',
  mentality: 'Mentalność',
  workRate: 'Pracowitość',
};

const POSITION_LABELS: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'BR',
  [PlayerPosition.DEF]: 'OBR',
  [PlayerPosition.MID]: 'POM',
  [PlayerPosition.FWD]: 'NAP',
};

const POSITION_ORDER: Record<PlayerPosition, number> = {
  [PlayerPosition.GK]: 0,
  [PlayerPosition.DEF]: 1,
  [PlayerPosition.MID]: 2,
  [PlayerPosition.FWD]: 3,
};

const POSITION_GROUPS: PlayerPosition[] = [PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD];

const POSITION_GROUP_LABELS: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'BRAMKARZE',
  [PlayerPosition.DEF]: 'OBROŃCY',
  [PlayerPosition.MID]: 'POMOCNICY',
  [PlayerPosition.FWD]: 'NAPASTNICY',
};

const POSITION_ROW_CLASSES: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-l-4 border-l-yellow-400',
  [PlayerPosition.DEF]: 'bg-blue-500/10 hover:bg-blue-500/20 border-l-4 border-l-blue-400',
  [PlayerPosition.MID]: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-l-4 border-l-emerald-400',
  [PlayerPosition.FWD]: 'bg-red-500/10 hover:bg-red-500/20 border-l-4 border-l-red-400',
};

const POSITION_SECTION_CLASSES: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'bg-yellow-500/10 border-yellow-400/50',
  [PlayerPosition.DEF]: 'bg-blue-500/10 border-blue-400/50',
  [PlayerPosition.MID]: 'bg-emerald-500/10 border-emerald-400/50',
  [PlayerPosition.FWD]: 'bg-red-500/10 border-red-400/50',
};

const getPlayerStatusValue = (player: Player): string => {
  if (player.isUntouchable) return 'UNTOUCHABLE';
  if (player.isOnTransferList) return 'TRANSFER_LIST';
  if (player.isAvailableForLoan) return 'AVAILABLE_LOAN';
  if (player.squadRole === 'STARTER') return 'STARTER';
  if (player.squadRole === 'KEY_PLAYER') return 'KEY_PLAYER';
  return 'NONE';
};

const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  [StaffRole.ASSISTANT_COACH]: 'Asystent trenera',
  [StaffRole.GOALKEEPER_COACH]: 'Trener bramkarzy',
  [StaffRole.FITNESS_COACH]: 'Trener przygotowania',
  [StaffRole.VIDEO_ANALYST]: 'Analityk video',
  [StaffRole.PHYSIOTHERAPIST]: 'Fizjoterapeuta',
  [StaffRole.CLUB_DOCTOR]: 'Lekarz klubowy',
};

const KIT_PATTERN_OPTIONS: { value: ClubKitPattern; label: string }[] = [
  { value: 'solid', label: 'Gładka' },
  { value: 'horizontal_stripes', label: 'Pasy poziome' },
  { value: 'vertical_stripes', label: 'Pasy pionowe' },
  { value: 'diagonal_stripe', label: 'Pas ukośny' },
  { value: 'center_band', label: 'Pas przez środek' },
  { value: 'center_vertical_stripe', label: 'Pionowy środek' },
];

const BOARD_FIELDS: Record<string, { label: string; keys: string[] }> = {
  owner: { label: 'Właściciel', keys: ['cierpliwosc', 'ambicja', 'hojnosc', 'doswiadczenie'] },
  ceo: { label: 'Prezes', keys: ['cierpliwosc', 'ambicja', 'hojnosc', 'doswiadczenie'] },
  sportingDirector: { label: 'Dyrektor sportowy', keys: ['patience', 'control', 'flexibility', 'ambition', 'footballKnowledge', 'negotiation', 'developmentVision', 'financialDiscipline'] },
  cfo: { label: 'Dyrektor finansowy', keys: ['hojnosc', 'doswiadczenie', 'zdolnosciMarketingowe', 'dyscyplinaFinansowa'] },
  coo: { label: 'Dyrektor operacyjny', keys: ['doswiadczenie', 'organizacja', 'zarzadzanieInfrastruktura', 'efektywnoscKosztowa', 'logistykaIPlanowanie'] },
  marketingDirector: { label: 'Dyrektor marketingu', keys: ['doswiadczenie', 'zdolnosciMarketingowe'] },
  academyDirector: { label: 'Dyrektor akademii', keys: ['doswiadczenie', 'rozwojMlodziezy', 'zarzadzanie'] },
};

const createDefaultBoardPerson = (key: string, clubId: string) => {
  const common = {
    id: `DATAPACK_BOARD_${clubId}_${key}_${Date.now()}`,
    firstName: 'Nowy',
    lastName: BOARD_FIELDS[key]?.label ?? 'Członek zarządu',
    age: 45,
    nationality: Region.POLAND,
    nationalityCountry: getDefaultCountryForRegion(Region.POLAND),
  };

  if (key === 'sportingDirector') {
    return {
      ...common,
      patience: 50,
      control: 50,
      flexibility: 50,
      ambition: 50,
      footballKnowledge: 50,
      negotiation: 50,
      developmentVision: 50,
      financialDiscipline: 50,
      relationshipWithManager: 50,
      personality: 'PARTNER',
    };
  }

  if (key === 'cfo') {
    return { ...common, hojnosc: 10, doswiadczenie: 10, zdolnosciMarketingowe: 10, dyscyplinaFinansowa: 10, monthlySalary: 12_000 };
  }

  if (key === 'coo') {
    return { ...common, doswiadczenie: 10, organizacja: 10, zarzadzanieInfrastruktura: 10, efektywnoscKosztowa: 10, logistykaIPlanowanie: 10, monthlySalary: 12_000 };
  }

  if (key === 'marketingDirector') {
    return { ...common, doswiadczenie: 10, zdolnosciMarketingowe: 10, monthlySalary: 10_000 };
  }

  if (key === 'academyDirector') {
    return { ...common, doswiadczenie: 10, rozwojMlodziezy: 10, zarzadzanie: 10, monthlySalary: 10_000 };
  }

  return { ...common, cierpliwosc: 10, ambicja: 10, hojnosc: 10, doswiadczenie: 10, monthlySalary: 15_000 };
};

const createDefaultManagement = (clubId: string): ClubManagement => ({
  owner: createDefaultBoardPerson('owner', clubId) as ClubManagement['owner'],
  cfo: createDefaultBoardPerson('cfo', clubId) as ClubManagement['cfo'],
  coo: createDefaultBoardPerson('coo', clubId) as ClubManagement['coo'],
  marketingDirector: createDefaultBoardPerson('marketingDirector', clubId) as ClubManagement['marketingDirector'],
});

const DEFAULT_ATTRS: PlayerAttributes = {
  strength: 50,
  stamina: 50,
  pace: 50,
  defending: 50,
  passing: 50,
  attacking: 50,
  finishing: 50,
  technique: 50,
  vision: 50,
  dribbling: 50,
  heading: 50,
  positioning: 50,
  goalkeeping: 50,
  freeKicks: 50,
  talent: 50,
  penalties: 50,
  corners: 50,
  aggression: 50,
  crossing: 50,
  leadership: 50,
  mentality: 50,
  workRate: 50,
};

const emptyStats = () => ({
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  cleanSheets: 0,
  matchesPlayed: 0,
  minutesPlayed: 0,
  seasonalChanges: {},
  ratingHistory: [],
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const toNumber = (value: string, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const dateInput = (value?: string | null) => value ? value.substring(0, 10) : '';
const isoFromDateInput = (value: string) => value ? new Date(value).toISOString() : new Date().toISOString();
const formatMoney = (value?: number | null) => `${Math.max(0, Math.round(value ?? 0)).toLocaleString('pl-PL')} PLN`;
const EUR_TO_PLN_EDITOR_RATE = 4.3;

const parseMoneyTokenToPln = (amountText: string, unitText?: string) => {
  const amount = Number(amountText.replace(/\s/g, '').replace(',', '.'));
  if (!Number.isFinite(amount)) return 0;
  const unit = (unitText ?? '').toLowerCase();
  const multiplier = unit === 'm' || unit.includes('million') || unit.includes('mln') || unit.includes('mil')
    ? 1_000_000
    : unit === 'k' || unit.includes('thousand') || unit.includes('tys')
      ? 1_000
      : 1;
  return Math.round(amount * multiplier * EUR_TO_PLN_EDITOR_RATE);
};

const findMoneyInText = (text: string) => {
  const euroPrefix = text.match(/(?:€|eur)\s*([\d\s.,]+)\s*(m|million|mil|mln|k|thousand|tys)?/i);
  if (euroPrefix) return parseMoneyTokenToPln(euroPrefix[1], euroPrefix[2]);
  const euroSuffix = text.match(/([\d\s.,]+)\s*(m|million|mil|mln|k|thousand|tys)?\s*(?:€|eur)/i);
  if (euroSuffix) return parseMoneyTokenToPln(euroSuffix[1], euroSuffix[2]);
  return 0;
};

const findMoneyOptionsInText = (text: string) => {
  const values: number[] = [];
  const pushValue = (amount?: string, unit?: string) => {
    if (!amount) return;
    const value = parseMoneyTokenToPln(amount, unit);
    if (value > 0) values.push(value);
  };

  for (const match of text.matchAll(/(?:€|eur)\s*([\d\s.,]+)\s*(m|million|mil|mln|k|thousand|tys)?/gi)) {
    pushValue(match[1], match[2]);
  }
  for (const match of text.matchAll(/([\d\s.,]+)\s*(m|million|mil|mln|k|thousand|tys)?\s*(?:€|eur)/gi)) {
    pushValue(match[1], match[2]);
  }

  return Array.from(new Set(values)).sort((a, b) => b - a).slice(0, 6);
};

const parseLookupDate = (text: string) => {
  const iso = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dotted = text.match(/\b(\d{1,2})[./-](\d{1,2})[./-](20\d{2})\b/);
  if (dotted) return `${dotted[3]}-${dotted[2].padStart(2, '0')}-${dotted[1].padStart(2, '0')}`;
  const monthNames: Record<string, string> = {
    jan: '01', january: '01', sty: '01', styczen: '01', stycznia: '01',
    feb: '02', february: '02', lut: '02', luty: '02', lutego: '02',
    mar: '03', march: '03', marca: '03',
    apr: '04', april: '04', kwi: '04', kwiecien: '04', kwietnia: '04',
    may: '05', maj: '05', maja: '05',
    jun: '06', june: '06', cze: '06', czerwiec: '06', czerwca: '06',
    jul: '07', july: '07', lip: '07', lipiec: '07', lipca: '07',
    aug: '08', august: '08', sie: '08', sierpien: '08', sierpnia: '08',
    sep: '09', sept: '09', september: '09', wrz: '09', wrzesien: '09', wrzesnia: '09',
    oct: '10', october: '10', paz: '10', paź: '10', pazdziernik: '10', październik: '10', pazdziernika: '10', października: '10',
    nov: '11', november: '11', lis: '11', listopad: '11', listopada: '11',
    dec: '12', december: '12', gru: '12', grudzien: '12', grudnia: '12',
  };
  const named = text.toLowerCase().match(/\b([a-ząćęłńóśźż]+)\.?\s+(\d{1,2}),?\s+(20\d{2})\b|\b(\d{1,2})\s+([a-ząćęłńóśźż]+)\.?\s+(20\d{2})\b/);
  if (!named) return '';
  const month = named[1] ? monthNames[named[1]] : monthNames[named[5]];
  const day = named[2] ?? named[4];
  const year = named[3] ?? named[6];
  return month ? `${year}-${month}-${day.padStart(2, '0')}` : '';
};

const parseContractLookupText = (text: string) => {
  const lower = text.toLowerCase();
  const salaryContext = lower.match(/(?:salary|wage|pensja|zarobki|wynagrodzenie).{0,80}/i)?.[0] ?? '';
  const valueContext = lower.match(/(?:market value|wartość rynkowa|wartosc rynkowa|value).{0,80}/i)?.[0] ?? text;
  const valueOptions = findMoneyOptionsInText(valueContext).length ? findMoneyOptionsInText(valueContext) : findMoneyOptionsInText(text);
  return {
    contractEndDate: parseLookupDate(text),
    annualSalary: salaryContext ? findMoneyInText(salaryContext) : 0,
    marketValue: valueOptions[0] ?? 0,
    marketValueOptions: valueOptions,
  };
};

export const PreGameDatapackEditorView: React.FC = () => {
  const {
    clubs,
    coaches,
    currentDate,
    getOrGenerateSquad,
    importEditorFullPack,
    navigateTo,
    players,
    setClubs,
    setCoaches,
    setPlayers,
    setStaffMembers,
    setNationalTeams,
    showGameNotification,
    staffMembers,
    nationalTeams,
    lineups,
  } = useGame();

  const importRef = useRef<HTMLInputElement>(null);
  const [screen, setScreen] = useState<EditorScreen>('MENU');
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [tab, setTab] = useState<TeamTab>('SQUAD');
  const [clubQuery, setClubQuery] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedCoachId, setSelectedCoachId] = useState<string>('');
  const [selectedBoardKey, setSelectedBoardKey] = useState<string>('owner');
  const [isCoachEditorOpen, setIsCoachEditorOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [selectedNationalTeamId, setSelectedNationalTeamId] = useState<string>('');
  const [nationalTeamQuery, setNationalTeamQuery] = useState('');
  const [contractLookupPlayerId, setContractLookupPlayerId] = useState<string>('');
  const [contractLookupVariants, setContractLookupVariants] = useState<ContractLookupVariant[]>([]);
  const [hasImportedEditorDatapack, setHasImportedEditorDatapack] = useState(() =>
    typeof window !== 'undefined' && window.localStorage.getItem(EDITOR_DATAPACK_IMPORTED_STORAGE_KEY) === '1'
  );

  const editableClubs = useMemo(
    () => clubs.filter(club => club.id !== 'UNEMPLOYED_MANAGER').sort((a, b) => a.name.localeCompare(b.name, 'pl')),
    [clubs]
  );

  const filteredClubs = useMemo(() => {
    const q = clubQuery.trim().toLowerCase();
    return editableClubs
      .filter(club => !q || `${club.name} ${club.leagueId} ${club.country ?? ''}`.toLowerCase().includes(q))
      .slice(0, 120);
  }, [clubQuery, editableClubs]);

  const filteredNationalTeams = useMemo(() => {
    const q = nationalTeamQuery.trim().toLowerCase();
    return [...nationalTeams]
      .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
      .filter(team => !q || `${team.name} ${team.continent} ${team.region}`.toLowerCase().includes(q))
      .slice(0, 160);
  }, [nationalTeamQuery, nationalTeams]);

  const selectedClub = useMemo(
    () => editableClubs.find(club => club.id === selectedClubId) ?? null,
    [editableClubs, selectedClubId]
  );
  const selectedNationalTeam = useMemo(
    () => nationalTeams.find(team => team.id === selectedNationalTeamId) ?? null,
    [nationalTeams, selectedNationalTeamId]
  );
  const isFreeAgentsPool = selectedClubId === FREE_AGENTS_ID;

  const squad = useMemo(
    () => {
      const source = isFreeAgentsPool
        ? players[FREE_AGENTS_ID] ?? []
        : selectedClubId
          ? getOrGenerateSquad(selectedClubId)
          : [];
      return [...source].sort((a, b) => POSITION_ORDER[a.position] - POSITION_ORDER[b.position] || b.overallRating - a.overallRating);
    },
    [getOrGenerateSquad, isFreeAgentsPool, players, selectedClubId]
  );

  const selectedPlayer = useMemo(
    () => squad.find(player => player.id === selectedPlayerId) ?? squad[0] ?? null,
    [selectedPlayerId, squad]
  );
  const contractLookupPlayer = useMemo(
    () => Object.values(players).flat().find(player => player.id === contractLookupPlayerId) ?? squad.find(player => player.id === contractLookupPlayerId) ?? null,
    [contractLookupPlayerId, players, squad]
  );

  const clubCoach = selectedClub?.coachId ? coaches[selectedClub.coachId] ?? null : null;
  const freeCoaches = useMemo(
    () => Object.values(coaches)
      .filter(coach => !coach.currentClubId && !coach.currentNationalTeamId)
      .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'pl')),
    [coaches]
  );
  const selectedCoach = selectedCoachId ? coaches[selectedCoachId] ?? null : null;
  const clubStaff = useMemo(
    () => (selectedClub?.staffIds ?? []).map(id => staffMembers[id]).filter(Boolean),
    [selectedClub, staffMembers]
  );
  const selectedStaff = selectedStaffId ? staffMembers[selectedStaffId] ?? null : null;
  const kits = selectedClub ? getClubKits(selectedClub) : [];

  const globalSearchResults = useMemo<EditorSearchResult[]>(() => {
    const query = globalSearchQuery.trim().toLowerCase();
    if (query.length < 2) return [];

    const clubNameById = new Map(editableClubs.map(club => [club.id, club.name]));
    const results: EditorSearchResult[] = [];
    const matches = (...values: Array<string | number | null | undefined>) =>
      values.some(value => String(value ?? '').toLowerCase().includes(query));

    editableClubs.forEach(club => {
      if (matches(club.name, club.shortName, club.leagueId, club.country)) {
        results.push({
          type: 'CLUB',
          id: club.id,
          title: club.name,
          subtitle: `KLUB · ${club.leagueId} · REP ${club.reputation}`,
        });
      }

      Object.entries(BOARD_FIELDS).forEach(([boardKey, config]) => {
        const person = boardKey === 'sportingDirector' ? club.sportingDirector : (club.management as any)?.[boardKey];
        if (!person) return;
        const fullName = `${person.firstName} ${person.lastName}`;
        if (matches(fullName, config.label, club.name)) {
          results.push({
            type: 'BOARD',
            clubId: club.id,
            boardKey,
            title: fullName,
            subtitle: `ZARZĄD · ${config.label} · ${club.name}`,
          });
        }
      });
    });

    nationalTeams.forEach(team => {
      if (matches(team.name, team.continent, team.region, team.reputation)) {
        results.push({
          type: 'NATIONAL_TEAM',
          id: team.id,
          title: team.name,
          subtitle: `REPREZENTACJA · ${team.continent} · REP ${team.reputation}`,
        });
      }
    });

    Object.values(players).flat().forEach(player => {
      const clubName = player.clubId === FREE_AGENTS_ID ? 'Wolny agent' : clubNameById.get(player.clubId) ?? player.clubId;
      const fullName = `${player.firstName} ${player.lastName}`;
      if (matches(fullName, clubName, POSITION_LABELS[player.position], player.nationalityCountry, player.nationality)) {
        results.push({
          type: 'PLAYER',
          id: player.id,
          clubId: player.clubId,
          title: fullName,
          subtitle: `PIŁKARZ · ${POSITION_LABELS[player.position]} · ${clubName}`,
        });
      }
    });

    Object.values(coaches).forEach(coach => {
      const clubName = coach.currentClubId ? clubNameById.get(coach.currentClubId) ?? coach.currentClubId : 'Wolny trener';
      const fullName = `${coach.firstName} ${coach.lastName}`;
      if (matches(fullName, clubName, coach.nationality)) {
        results.push({
          type: 'COACH',
          id: coach.id,
          clubId: coach.currentClubId ?? null,
          title: fullName,
          subtitle: `TRENER · ${clubName}`,
        });
      }
    });

    Object.values(staffMembers).forEach(staff => {
      const clubName = staff.currentClubId ? clubNameById.get(staff.currentClubId) ?? staff.currentClubId : 'Bez klubu';
      const role = STAFF_ROLE_LABELS[staff.role] ?? staff.role;
      const fullName = `${staff.firstName} ${staff.lastName}`;
      if (matches(fullName, role, clubName, staff.nationality)) {
        results.push({
          type: 'STAFF',
          id: staff.id,
          clubId: staff.currentClubId ?? null,
          title: fullName,
          subtitle: `SZTAB · ${role} · ${clubName}`,
        });
      }
    });

    return results.slice(0, 30);
  }, [coaches, editableClubs, globalSearchQuery, nationalTeams, players, staffMembers]);

  const updateClub = (patch: Partial<Club>) => {
    if (!selectedClubId) return;
    setClubs(prev => prev.map(club => club.id === selectedClubId ? { ...club, ...patch } : club));
  };

  const updateNationalTeam = (teamId: string, patch: Partial<NationalTeam>) => {
    setNationalTeams(prev => prev.map(team => team.id === teamId ? { ...team, ...patch } : team));
  };

  const updateNationalTeamKit = (team: NationalTeam, kitIndex: number, patch: Partial<ClubKit>) => {
    const nextKits = getNationalTeamKits(team).map((kit, index) => index === kitIndex ? { ...kit, ...patch } : kit);
    updateNationalTeam(team.id, {
      kits: nextKits,
      colorsHex: nextKits.map(kit => kit.shirt).filter(Boolean).slice(0, 4),
    });
  };

  const updateNationalTeamColors = (team: NationalTeam, nextColors: string[]) => {
    const currentKits = getNationalTeamKits(team);
    const nextKits = createDefaultNationalTeamKits(nextColors).map((kit, index) => ({
      ...kit,
      id: currentKits[index]?.id ?? kit.id,
      name: currentKits[index]?.name ?? kit.name,
      pattern: currentKits[index]?.pattern ?? kit.pattern,
    }));
    updateNationalTeam(team.id, { colorsHex: nextColors, kits: nextKits });
  };

  const openSearchResult = (result: EditorSearchResult) => {
    setScreen('TEAMS');
    setSelectedPlayerId('');
    setSelectedStaffId('');
    setSelectedCoachId('');
    setIsCoachEditorOpen(false);

    if (result.type === 'CLUB') {
      setSelectedClubId(result.id);
      setTab('CLUB');
      return;
    }

    if (result.type === 'NATIONAL_TEAM') {
      setScreen('NATIONAL_TEAMS');
      setSelectedNationalTeamId(result.id);
      return;
    }

    if (result.type === 'PLAYER') {
      setSelectedClubId(result.clubId);
      setSelectedPlayerId(result.id);
      setTab('SQUAD');
      return;
    }

    if (result.type === 'COACH') {
      setSelectedClubId(result.clubId ?? FREE_AGENTS_ID);
      setSelectedCoachId(result.id);
      setTab('STAFF');
      setIsCoachEditorOpen(!result.clubId);
      return;
    }

    if (result.type === 'STAFF') {
      setSelectedClubId(result.clubId ?? FREE_AGENTS_ID);
      setSelectedStaffId(result.id);
      setTab('STAFF');
      return;
    }

    setSelectedClubId(result.clubId);
    setSelectedBoardKey(result.boardKey);
    setTab('BOARD');
  };

  const openTeamsEditor = () => {
    setScreen('TEAMS');
    setSelectedClubId('');
    setSelectedPlayerId('');
    setSelectedStaffId('');
    setSelectedCoachId('');
    setSelectedBoardKey('owner');
    setTab('SQUAD');
    setIsCoachEditorOpen(false);
  };

  const openFreeAgentsPool = () => {
    setScreen('TEAMS');
    setSelectedClubId(FREE_AGENTS_ID);
    setSelectedPlayerId('');
    setSelectedStaffId('');
    setSelectedCoachId('');
    setTab('SQUAD');
    setIsCoachEditorOpen(false);
  };

  const openNationalTeamsEditor = () => {
    setScreen('NATIONAL_TEAMS');
    setSelectedNationalTeamId(nationalTeams[0]?.id ?? '');
    setSelectedClubId('');
    setSelectedPlayerId('');
    setSelectedStaffId('');
    setSelectedCoachId('');
    setIsCoachEditorOpen(false);
  };

  const getCurrentSquadForPersistence = () => {
    if (!selectedClubId) return [];
    if (isFreeAgentsPool) return squad;
    return squad.filter(player => player.clubId === selectedClubId);
  };

  const updatePlayer = (playerId: string, patch: Partial<Player>) => {
    setPlayers(prev => {
      const next = { ...prev };
      let sourceClubId = '';
      let currentPlayer: Player | null = null;

      Object.entries(next).some(([clubId, clubPlayers]) => {
        const index = clubPlayers.findIndex(player => player.id === playerId);
        if (index === -1) return false;
        sourceClubId = clubId;
        currentPlayer = clubPlayers[index];
        return true;
      });

      if (!currentPlayer) {
        currentPlayer = squad.find(player => player.id === playerId) ?? null;
        sourceClubId = currentPlayer?.clubId ?? selectedClubId;
        if (!currentPlayer || !sourceClubId) return prev;
        if (!next[sourceClubId]) next[sourceClubId] = getCurrentSquadForPersistence();
      }

      const targetClubId = patch.clubId ?? currentPlayer.clubId;
      const updated = { ...currentPlayer, ...patch, clubId: targetClubId };
      next[sourceClubId] = (next[sourceClubId] ?? []).filter(player => player.id !== playerId);
      next[targetClubId] = [...(next[targetClubId] ?? []).filter(player => player.id !== playerId), updated];
      return next;
    });

    if (patch.clubId !== undefined) {
      setClubs(prev => prev.map(club => {
        const isTargetClub = patch.clubId !== FREE_AGENTS_ID && club.id === patch.clubId;
        const rosterIds = isTargetClub
          ? Array.from(new Set([...(club.rosterIds ?? []), playerId]))
          : (club.rosterIds ?? []).filter(id => id !== playerId);
        return {
          ...club,
          rosterIds,
          captainId: isTargetClub ? club.captainId : (club.captainId === playerId ? null : club.captainId),
          penaltyTakerId: isTargetClub ? club.penaltyTakerId : (club.penaltyTakerId === playerId ? null : club.penaltyTakerId),
          freeKickTakerId: isTargetClub ? club.freeKickTakerId : (club.freeKickTakerId === playerId ? null : club.freeKickTakerId),
        };
      }));
    }
  };

  const buildContractLookupVariants = (player: Player): ContractLookupVariant[] => {
    const playerName = `${player.firstName} ${player.lastName}`.trim();
    const clubName = editableClubs.find(club => club.id === player.clubId)?.name ?? '';
    const baseQuery = [playerName, clubName, 'contract expires salary market value'].filter(Boolean).join(' ');
    const transfermarktQuery = playerName;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(`${baseQuery} Transfermarkt`)}`;
    const transfermarktUrl = `https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(transfermarktQuery || playerName)}`;
    const newsUrl = `https://www.google.com/search?q=${encodeURIComponent(`${baseQuery} contract extension`)}`;

    return [
      {
        id: 'current',
        label: 'Wariant 1',
        sourceName: 'Aktualne dane datapacka',
        sourceUrl: googleUrl,
        contractEndDate: dateInput(player.contractEndDate),
        annualSalary: player.annualSalary ?? 0,
        marketValue: player.marketValue ?? 0,
        confidence: 50,
        note: 'Punkt startowy z obecnego datapacka. Możesz porównać z wynikami wyszukiwania.',
      },
      {
        id: 'transfermarkt',
        label: 'Wariant 2',
        sourceName: 'Transfermarkt / profil zawodnika',
        sourceUrl: transfermarktUrl,
        contractEndDate: '',
        annualSalary: 0,
        marketValue: 0,
        confidence: 70,
        note: 'Wklej datę kontraktu i wartość po sprawdzeniu profilu zawodnika.',
      },
      {
        id: 'press',
        label: 'Wariant 3',
        sourceName: 'Media / komunikat klubu',
        sourceUrl: newsUrl,
        contractEndDate: '',
        annualSalary: 0,
        marketValue: 0,
        confidence: 60,
        note: 'Dobry wariant, gdy klub lub media podały przedłużenie kontraktu albo nową pensję.',
      },
    ];
  };

  const openContractLookup = (player: Player) => {
    setContractLookupPlayerId(player.id);
    setContractLookupVariants(buildContractLookupVariants(player));
  };

  const updateContractLookupVariant = (variantId: string, patch: Partial<ContractLookupVariant>) => {
    setContractLookupVariants(prev => prev.map(variant => variant.id === variantId ? { ...variant, ...patch } : variant));
  };

  const updateContractLookupSourceText = (variantId: string, sourceText: string) => {
    const parsed = parseContractLookupText(sourceText);
    setContractLookupVariants(prev => prev.map(variant => {
      if (variant.id !== variantId) return variant;
      return {
        ...variant,
        sourceText,
        contractEndDate: parsed.contractEndDate || variant.contractEndDate,
        annualSalary: parsed.annualSalary > 0 ? parsed.annualSalary : variant.annualSalary,
        marketValue: parsed.marketValue > 0 ? parsed.marketValue : variant.marketValue,
        marketValueOptions: parsed.marketValueOptions.length > 0 ? parsed.marketValueOptions : variant.marketValueOptions,
        note: parsed.contractEndDate || parsed.annualSalary > 0 || parsed.marketValue > 0
          ? `Automatycznie odczytano z wklejonego tekstu. Kurs edytora: 1 EUR = ${EUR_TO_PLN_EDITOR_RATE.toFixed(2)} PLN.`
          : variant.note,
      };
    }));
  };

  const readContractLookupClipboard = async (variantId: string) => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        showGameNotification({ title: 'Schowek jest pusty', message: 'Skopiuj fragment z Transfermarkt i spróbuj ponownie.', tone: 'error' });
        return;
      }
      updateContractLookupSourceText(variantId, text);
    } catch {
      showGameNotification({ title: 'Brak dostępu do schowka', message: 'Wklej tekst ręcznie w pole źródła.', tone: 'error' });
    }
  };

  const applyContractLookupVariant = (player: Player, variant: ContractLookupVariant) => {
    const patch: Partial<Player> = {};
    if (variant.contractEndDate) patch.contractEndDate = isoFromDateInput(variant.contractEndDate);
    if (variant.annualSalary > 0) patch.annualSalary = Math.round(variant.annualSalary);
    if (variant.marketValue > 0) patch.marketValue = Math.round(variant.marketValue);
    updatePlayer(player.id, patch);
    setContractLookupPlayerId('');
    setContractLookupVariants([]);
    showGameNotification({
      title: 'Zastosowano wariant kontraktu',
      message: `${player.firstName} ${player.lastName}: ${variant.sourceName}.`,
      tone: 'success',
    });
  };

  const deletePlayer = (player: Player) => {
    const playerName = `${player.firstName} ${player.lastName}`;
    if (!window.confirm(`Usunąć zawodnika ${playerName} z datapacka?`)) return;

    setPlayers(prev => {
      const next = { ...prev };
      const sourceClubId = player.clubId || selectedClubId;
      if (sourceClubId && !next[sourceClubId]) {
        next[sourceClubId] = getCurrentSquadForPersistence();
      }
      Object.keys(next).forEach(clubId => {
        next[clubId] = next[clubId].filter(item => item.id !== player.id);
      });
      return next;
    });

    setClubs(prev => prev.map(club => ({
      ...club,
      rosterIds: club.rosterIds.filter(id => id !== player.id),
      captainId: club.captainId === player.id ? null : club.captainId,
      penaltyTakerId: club.penaltyTakerId === player.id ? null : club.penaltyTakerId,
      freeKickTakerId: club.freeKickTakerId === player.id ? null : club.freeKickTakerId,
    })));

    setSelectedPlayerId('');
    showGameNotification({
      title: 'Usunięto zawodnika',
      message: `${playerName} został usunięty z datapacka.`,
      tone: 'success',
    });
  };

  const makeLoanInfo = (
    parentClubId: string,
    destinationClubId: string,
    startDate: string,
    endDate: string
  ): PlayerLoanInfo | null => {
    const parentClub = editableClubs.find(club => club.id === parentClubId);
    const destinationClub = editableClubs.find(club => club.id === destinationClubId);
    if (!parentClub || !destinationClub || !startDate || !endDate) return null;
    return {
      parentClubId,
      parentClubName: parentClub.name,
      destinationClubId,
      destinationClubName: destinationClub.name,
      startDate: isoFromDateInput(startDate),
      endDate: isoFromDateInput(endDate),
    };
  };

  const updatePlayerStatus = (player: Player, value: string) => {
    updatePlayer(player.id, {
      isUntouchable: value === 'UNTOUCHABLE',
      isOnTransferList: value === 'TRANSFER_LIST',
      isAvailableForLoan: value === 'AVAILABLE_LOAN',
      squadRole: value === 'STARTER' || value === 'KEY_PLAYER' ? value : null,
    });
  };

  const updateCoach = (coachId: string, patch: Partial<Coach>) => {
    setCoaches(prev => ({
      ...prev,
      [coachId]: {
        ...prev[coachId],
        ...patch,
      },
    }));
  };

  const assignCoachToClub = (coach: Coach, nextClubId: string | null) => {
    if (!nextClubId) {
      setCoaches(prev => ({
        ...prev,
        [coach.id]: {
          ...prev[coach.id],
          currentClubId: null,
          currentNationalTeamId: null,
          isNationalTeamCoach: false,
          hiredDate: '',
          contractEndDate: '',
        },
      }));
      setClubs(prev => prev.map(club => club.coachId === coach.id ? { ...club, coachId: undefined } : club));
      setNationalTeams(prev => prev.map(team => team.coachId === coach.id ? { ...team, coachId: null } : team));
      setSelectedClubId(FREE_AGENTS_ID);
      setSelectedCoachId(coach.id);
      return;
    }

    const targetClub = editableClubs.find(club => club.id === nextClubId);
    const replacedCoachId = targetClub?.coachId && targetClub.coachId !== coach.id ? targetClub.coachId : null;
    const replacedCoach = replacedCoachId ? coaches[replacedCoachId] : null;

    if (targetClub && replacedCoach) {
      const accepted = window.confirm(
        `${targetClub.name} ma już trenera: ${replacedCoach.firstName} ${replacedCoach.lastName}.\n\nCzy chcesz go zastąpić? Stary trener trafi na listę wolnych agentów, a jego kontrakt klubowy zostanie zresetowany.`
      );
      if (!accepted) return;
    }

    const hiredDate = (currentDate instanceof Date ? currentDate : new Date(currentDate)).toISOString();
    const contractEndDate = CoachService.getDefaultContractEndDate(hiredDate);

    setCoaches(prev => {
      const next = { ...prev };
      if (replacedCoachId && next[replacedCoachId]) {
        next[replacedCoachId] = {
          ...next[replacedCoachId],
          currentClubId: null,
          hiredDate: '',
          contractEndDate: '',
        };
      }
      next[coach.id] = {
        ...next[coach.id],
        currentClubId: nextClubId,
        currentNationalTeamId: null,
        isNationalTeamCoach: false,
        hiredDate,
        contractEndDate,
      };
      return next;
    });

    setClubs(prev => prev.map(club => {
      if (club.coachId === coach.id && club.id !== nextClubId) return { ...club, coachId: undefined };
      if (club.id === nextClubId) return { ...club, coachId: coach.id };
      return club;
    }));
    setNationalTeams(prev => prev.map(team => team.coachId === coach.id ? { ...team, coachId: null } : team));

    setSelectedClubId(nextClubId);
    setSelectedCoachId(coach.id);
    showGameNotification({
      title: replacedCoach ? 'Zmieniono trenera klubu' : 'Przypisano trenera',
      message: replacedCoach
        ? `${coach.firstName} ${coach.lastName} zastąpił ${replacedCoach.firstName} ${replacedCoach.lastName}. Poprzedni trener jest wolnym agentem.`
        : `${coach.firstName} ${coach.lastName} został przypisany do klubu.`,
      tone: 'success',
    });
  };

  const assignCoachToNationalTeam = (coach: Coach, nextNationalTeamId: string | null) => {
    if (!nextNationalTeamId) {
      setCoaches(prev => ({
        ...prev,
        [coach.id]: {
          ...prev[coach.id],
          currentNationalTeamId: null,
          isNationalTeamCoach: false,
        },
      }));
      setNationalTeams(prev => prev.map(team => team.coachId === coach.id ? { ...team, coachId: null } : team));
      setSelectedCoachId(coach.id);
      return;
    }

    const targetTeam = nationalTeams.find(team => team.id === nextNationalTeamId);
    const replacedCoachId = targetTeam?.coachId && targetTeam.coachId !== coach.id ? targetTeam.coachId : null;
    const replacedCoach = replacedCoachId ? coaches[replacedCoachId] : null;

    if (targetTeam && replacedCoach) {
      const accepted = window.confirm(
        `${targetTeam.name} ma już selekcjonera: ${replacedCoach.firstName} ${replacedCoach.lastName}.\n\nCzy chcesz go zastąpić? Poprzedni selekcjoner straci przypisanie do reprezentacji.`
      );
      if (!accepted) return;
    }

    setCoaches(prev => {
      const next = { ...prev };
      if (replacedCoachId && next[replacedCoachId]) {
        next[replacedCoachId] = {
          ...next[replacedCoachId],
          currentNationalTeamId: null,
          isNationalTeamCoach: false,
        };
      }
      next[coach.id] = {
        ...next[coach.id],
        currentClubId: null,
        currentNationalTeamId: nextNationalTeamId,
        isNationalTeamCoach: true,
      };
      return next;
    });

    setClubs(prev => prev.map(club => club.coachId === coach.id ? { ...club, coachId: undefined } : club));
    setNationalTeams(prev => prev.map(team => {
      if (team.coachId === coach.id && team.id !== nextNationalTeamId) return { ...team, coachId: null };
      if (team.id === nextNationalTeamId) return { ...team, coachId: coach.id };
      return team;
    }));

    setSelectedClubId(FREE_AGENTS_ID);
    setSelectedCoachId(coach.id);
    showGameNotification({
      title: 'Przypisano selekcjonera',
      message: targetTeam ? `${coach.firstName} ${coach.lastName} został selekcjonerem reprezentacji ${targetTeam.name}.` : 'Trener został przypisany do reprezentacji.',
      tone: 'success',
    });
  };

  const createPlayer = (targetClubId = selectedClub?.id ?? FREE_AGENTS_ID) => {
    const now = currentDate instanceof Date ? currentDate : new Date(currentDate);
    const targetClub = editableClubs.find(club => club.id === targetClubId) ?? null;
    const contractEndDate = new Date(now.getFullYear() + 2, 5, 30).toISOString();
    const overallRating = PlayerAttributesGenerator.calculateOverall(DEFAULT_ATTRS, PlayerPosition.MID);
    const player: Player = {
      id: `DATAPACK_PLAYER_${targetClubId}_${Date.now()}`,
      firstName: 'Nowy',
      lastName: 'Zawodnik',
      age: 18,
      clubId: targetClubId,
      nationality: Region.POLAND,
      nationalityCountry: getDefaultCountryForRegion(Region.POLAND),
      position: PlayerPosition.MID,
      secondaryPosition: null,
      secondaryPositionRating: undefined,
      overallRating,
      attributes: { ...DEFAULT_ATTRS },
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
      contractEndDate,
      annualSalary: 60_000,
      marketValue: 100_000,
      loan: null,
      isAvailableForLoan: false,
      isOnTransferList: false,
      isUntouchable: false,
      squadRole: null,
      history: [{
        clubName: targetClub?.name ?? 'Wolny agent',
        clubId: targetClubId,
        fromYear: now.getFullYear(),
        fromMonth: now.getMonth() + 1,
        toYear: null,
        toMonth: null,
      }],
      boardLockoutUntil: null,
      negotiationStep: 0,
      negotiationLockoutUntil: null,
      contractLockoutUntil: null,
      fatigueDebt: 0,
      isNegotiationPermanentBlocked: false,
      transferLockoutUntil: null,
      freeAgentLockoutUntil: null,
      freeAgentClubLockouts: {},
      reputacja: 50,
      lojalnosc: 50,
    };
    setPlayers(prev => ({ ...prev, [targetClubId]: [...(prev[targetClubId] ?? []), player] }));
    if (targetClubId !== FREE_AGENTS_ID) {
      setClubs(prev => prev.map(club => club.id === targetClubId
        ? { ...club, rosterIds: Array.from(new Set([...(club.rosterIds ?? []), player.id])) }
        : club
      ));
    }
    if (targetClubId === FREE_AGENTS_ID) {
      setSelectedClubId(FREE_AGENTS_ID);
      setTab('SQUAD');
      setScreen('TEAMS');
    }
    setSelectedPlayerId(player.id);
    showGameNotification({ title: 'Dodano zawodnika', message: targetClub ? 'Nowy zawodnik jest gotowy do edycji.' : 'Nowy wolny zawodnik jest gotowy do edycji.', tone: 'success' });
  };

  const createCoach = (targetClubId: string | null = selectedClub?.id ?? null) => {
    const hiredDate = (currentDate instanceof Date ? currentDate : new Date(currentDate)).toISOString();
    const base = CoachService.createRandomCoach(true);
    const coach: Coach = {
      ...base,
      id: `DATAPACK_COACH_${targetClubId ?? 'FREE'}_${Date.now()}`,
      firstName: 'Nowy',
      lastName: 'Trener',
      age: 45,
      nationality: getDefaultCountryForRegion(Region.POLAND),
      currentClubId: targetClubId,
      currentNationalTeamId: null,
      isNationalTeamCoach: false,
      hiredDate,
      contractEndDate: CoachService.getDefaultContractEndDate(hiredDate),
      annualSalary: 120_000,
      expPoints: 1,
      attributes: { experience: 50, decisionMaking: 50, motivation: 50, training: 50 },
      history: [],
      seasonStats: [],
      blacklist: {},
    };
    setCoaches(prev => ({ ...prev, [coach.id]: coach }));
    if (targetClubId) {
      updateClub({ coachId: coach.id });
    } else {
      setSelectedClubId(FREE_AGENTS_ID);
      setTab('STAFF');
      setScreen('TEAMS');
    }
    setSelectedCoachId(coach.id);
    showGameNotification({ title: 'Dodano trenera', message: targetClubId ? 'Nowy trener został przypisany do klubu.' : 'Nowy wolny trener jest gotowy do edycji.', tone: 'success' });
  };

  const createStaff = (role: StaffRole) => {
    if (!selectedClub) return;
    const attrs = Object.fromEntries((STAFF_ROLE_ATTRS[role] ?? []).map(item => [item.key, 10]));
    const hiredDate = (currentDate instanceof Date ? currentDate : new Date(currentDate)).toISOString();
    const contract = new Date(hiredDate);
    contract.setFullYear(contract.getFullYear() + 2);
    const staff: StaffMember = {
      id: `DATAPACK_STAFF_${selectedClub.id}_${role}_${Date.now()}`,
      firstName: 'Nowy',
      lastName: 'Sztabowiec',
      age: 35,
      nationality: 'Polska',
      nationalityFlag: '🇵🇱',
      role,
      attributes: attrs,
      currentClubId: selectedClub.id,
      hiredDate,
      contractEndDate: contract.toISOString(),
      salary: 6_000,
      history: [],
    };
    setStaffMembers(prev => ({ ...prev, [staff.id]: staff }));
    updateClub({ staffIds: [...(selectedClub.staffIds ?? []), staff.id] });
    setSelectedStaffId(staff.id);
  };

  const updateKit = (index: number, patch: Partial<ClubKit>) => {
    if (!selectedClub) return;
    const next = getClubKits(selectedClub).map((kit, i) => i === index ? { ...kit, ...patch } : kit);
    updateClub({ kits: next, colorsHex: [next[0].shirt, next[1].shirt, next[2].shirt, next[3].shirt] });
  };

  const updateBoardPerson = (key: string, patch: Record<string, unknown>) => {
    if (!selectedClub) return;
    if (key === 'sportingDirector') {
      updateClub({ sportingDirector: { ...(selectedClub.sportingDirector as any), ...patch } as any });
      return;
    }
    updateClub({
      management: {
        ...(selectedClub.management ?? {} as ClubManagement),
        [key]: { ...((selectedClub.management as any)?.[key] ?? {}), ...patch },
      } as ClubManagement,
    });
  };

  const createBoardPerson = (key: string) => {
    if (!selectedClub) return;
    const person = createDefaultBoardPerson(key, selectedClub.id);

    if (key === 'sportingDirector') {
      updateClub({ sportingDirector: person as any });
    } else {
      updateClub({
        management: {
          ...(selectedClub.management ?? createDefaultManagement(selectedClub.id)),
          [key]: person,
        } as ClubManagement,
      });
    }

    setSelectedBoardKey(key);
    showGameNotification({
      title: 'Dodano członka zarządu',
      message: `${BOARD_FIELDS[key]?.label ?? 'Nowa osoba'} jest gotowa do edycji.`,
      tone: 'success',
    });
  };

  const exportFullPack = () => {
    const exportPlayers = selectedClubId && squad.length && !players[selectedClubId]
      ? { ...players, [selectedClubId]: getCurrentSquadForPersistence() }
      : players;
    const exportClubs = selectedClubId && selectedClubId !== FREE_AGENTS_ID && exportPlayers[selectedClubId]
      ? clubs.map(club => club.id === selectedClubId
        ? { ...club, rosterIds: exportPlayers[selectedClubId].map(player => player.id) }
        : club
      )
      : clubs;
    const data = {
      type: 'editor_full_pack',
      version: 2,
      exportedAt: new Date().toISOString(),
      clubs: exportClubs,
      players: exportPlayers,
      coaches,
      staffMembers,
      nationalTeams,
      lineups,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'datapack_full_editor.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFullPack = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = importEditorFullPack(JSON.parse(await file.text()), { nextView: ViewState.PREGAME_DATAPACK_EDITOR });
      if (result.success) {
        window.localStorage.setItem(EDITOR_DATAPACK_IMPORTED_STORAGE_KEY, '1');
        setHasImportedEditorDatapack(true);
      }
      showGameNotification({
        title: result.success ? 'Datapack zaimportowany' : 'Błąd importu',
        message: result.message,
        tone: result.success ? 'success' : 'error',
      });
    } catch {
      showGameNotification({ title: 'Błąd importu', message: 'Plik nie jest poprawnym JSON.', tone: 'error' });
    }
    event.target.value = '';
  };

  const renderField = (label: string, value: string | number, onChange: (value: string) => void, type = 'text') => (
    <label className="flex flex-col gap-1">
      <span className={labelCls}>{label}</span>
      <input type={type} value={value} onChange={event => onChange(event.target.value)} className={inputCls} />
    </label>
  );

  const renderCoachEditor = (coach: Coach) => (
    <>
      <div className="grid grid-cols-4 gap-3">
        {renderField('Imię', coach.firstName, value => updateCoach(coach.id, { firstName: value }))}
        {renderField('Nazwisko', coach.lastName, value => updateCoach(coach.id, { lastName: value }))}
        {renderField('Wiek', coach.age, value => updateCoach(coach.id, { age: clamp(toNumber(value, coach.age), 18, 80) }), 'number')}
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Narodowość</span>
          <select value={getCountrySelectValue(coach.nationality)} onChange={event => updateCoach(coach.id, { nationality: event.target.value })} className={selectCls}>
            {COUNTRY_OPTIONS.map(country => <option key={`${country.region}-${country.name}`} value={country.name}>{country.name}</option>)}
          </select>
        </label>
        {renderField('Pensja roczna', coach.annualSalary, value => updateCoach(coach.id, { annualSalary: Math.max(0, Math.round(toNumber(value))) }), 'number')}
        {renderField('Kontrakt do', dateInput(coach.contractEndDate), value => updateCoach(coach.id, { contractEndDate: isoFromDateInput(value) }), 'date')}
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Przypisanie</span>
          <select value={coach.currentClubId ?? FREE_AGENTS_ID} onChange={event => {
            const nextClubId = event.target.value === FREE_AGENTS_ID ? null : event.target.value;
            assignCoachToClub(coach, nextClubId);
          }} className={selectCls}>
            <option value={FREE_AGENTS_ID}>Wolny trener</option>
            {editableClubs.map(club => <option key={club.id} value={club.id}>{club.name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Reprezentacja</span>
          <select value={coach.currentNationalTeamId ?? ''} onChange={event => {
            const nextNationalTeamId = event.target.value || null;
            assignCoachToNationalTeam(coach, nextNationalTeamId);
          }} className={selectCls}>
            <option value="">Brak reprezentacji</option>
            {nationalTeams
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
              .map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-5">
        {Object.entries(coach.attributes).map(([key, value]) => (
          <label key={key} className="grid grid-cols-[1fr_64px] gap-2 items-center">
            <span className={labelCls}>{key}</span>
            <input type="number" min={1} max={99} value={value} onChange={event => updateCoach(coach.id, {
              attributes: {
                ...coach.attributes,
                [key]: clamp(toNumber(event.target.value), 1, 99),
              },
            })} className={`${inputCls} text-center`} />
          </label>
        ))}
      </div>
    </>
  );

  return (
    <div className="h-screen w-full bg-slate-950 text-white overflow-hidden font-black italic uppercase tracking-tighter">
      <input ref={importRef} type="file" accept=".json" className="hidden" onChange={importFullPack} />

      <div className="h-full flex">
        <aside className="w-72 border-r border-white/10 bg-black/35 p-5 flex flex-col gap-4">
          <button onClick={() => navigateTo(ViewState.START_MENU)} className="text-left text-[11px] text-slate-400 hover:text-white">← MENU GŁÓWNE</button>
          <div>
            <div className="text-3xl text-yellow-400 leading-none">EDYTOR</div>
            <div className="text-xs text-slate-500 mt-1">DATAPACK PRZED STARTEM GRY</div>
          </div>
          <button onClick={() => setScreen('MENU')} className={`rounded px-4 py-3 text-left border ${screen === 'MENU' ? 'bg-yellow-500 text-black border-yellow-300' : 'bg-white/5 border-white/10 text-slate-300'}`}>MENU EDYTORA</button>
          <button onClick={openTeamsEditor} className={`rounded px-4 py-3 text-left border ${screen === 'TEAMS' && !isFreeAgentsPool ? 'bg-yellow-500 text-black border-yellow-300' : 'bg-white/5 border-white/10 text-slate-300'}`}>EDYTUJ DRUŻYNY</button>
          <button onClick={openNationalTeamsEditor} className={`rounded px-4 py-3 text-left border ${screen === 'NATIONAL_TEAMS' ? 'bg-yellow-500 text-black border-yellow-300' : 'bg-white/5 border-white/10 text-slate-300'}`}>EDYTUJ REPREZENTACJE</button>
          <button onClick={openFreeAgentsPool} className={`rounded px-4 py-3 text-left border ${screen === 'TEAMS' && isFreeAgentsPool ? 'bg-yellow-500 text-black border-yellow-300' : 'bg-white/5 border-white/10 text-slate-300'}`}>WOLNI AGENCI</button>
          <div className="mt-auto grid gap-2">
            <button onClick={() => importRef.current?.click()} className="rounded bg-emerald-700 hover:bg-emerald-600 px-4 py-3 text-xs">IMPORTUJ DATAPACK</button>
            <button onClick={exportFullPack} className="rounded bg-cyan-700 hover:bg-cyan-600 px-4 py-3 text-xs">EKSPORTUJ DATAPACK</button>
          </div>
        </aside>

        {screen === 'MENU' && (
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-6xl">
              <div className="text-[11px] text-emerald-400 mb-2">STRONA GŁÓWNA EDYTORA</div>
              <h1 className="text-5xl text-white leading-none mb-6">WYBIERZ CO CHCESZ ZMIENIĆ</h1>
              {!hasImportedEditorDatapack && (
                <div className="rounded-lg border border-red-500/40 bg-red-950/60 p-5 mb-6 shadow-lg shadow-red-950/20">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <div className="text-2xl text-red-200 font-black italic uppercase tracking-tighter">NAJPIERW WCZYTAJ DATAPACK</div>
                      <div className="text-xs text-slate-200 mt-2 normal-case not-italic tracking-normal font-normal">
                        Edytor działa na danych z datapacka. Jeśli wejdziesz dalej bez importu, baza może być pusta albo niepełna i nie będzie czego sensownie edytować.
                      </div>
                      <div className="text-[10px] text-red-100/80 mt-3">
                        Wczytaj plik wyeksportowany ze starego lub nowego edytora, a dopiero potem edytuj kluby, zawodników, trenerów, sztab i reprezentacje.
                      </div>
                    </div>
                    <button onClick={() => importRef.current?.click()} className="shrink-0 rounded bg-red-500 hover:bg-red-400 text-black px-5 py-3 text-xs font-black italic uppercase tracking-tighter">
                      WCZYTAJ DATAPACK
                    </button>
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-yellow-500/25 bg-yellow-500/10 p-4 mb-6">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <div className="text-xl text-yellow-400">WYSZUKIWARKA DATAPACKA</div>
                    <div className="text-[10px] text-slate-500">Znajdź klub, piłkarza, trenera, sztab albo członka zarządu.</div>
                  </div>
                  {globalSearchQuery && (
                    <button onClick={() => setGlobalSearchQuery('')} className="rounded bg-white/10 hover:bg-white/20 px-3 py-2 text-[10px]">WYCZYŚĆ</button>
                  )}
                </div>
                <input
                  value={globalSearchQuery}
                  onChange={event => setGlobalSearchQuery(event.target.value)}
                  placeholder="WPISZ MINIMUM 2 ZNAKI..."
                  className={`${inputCls} w-full text-sm py-3`}
                />
                {globalSearchQuery.trim().length >= 2 && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                    {globalSearchResults.length > 0 ? globalSearchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${'id' in result ? result.id : `${result.clubId}-${result.boardKey}`}-${index}`}
                        onClick={() => openSearchResult(result)}
                        className="rounded border border-white/10 bg-black/25 hover:bg-yellow-500 hover:text-black px-3 py-2 text-left transition-colors"
                      >
                        <div className="text-xs truncate">{result.title}</div>
                        <div className="text-[10px] opacity-70 truncate">{result.subtitle}</div>
                      </button>
                    )) : (
                      <div className="col-span-full rounded border border-white/10 bg-black/25 px-3 py-4 text-center text-xs text-slate-500">BRAK WYNIKÓW</div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <button onClick={openTeamsEditor} className="min-h-44 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-6 text-left hover:bg-yellow-500 hover:text-black transition-colors">
                  <div className="text-2xl">EDYTUJ DRUŻYNY</div>
                  <div className="text-xs mt-3 opacity-70">Kluby, składy, zawodnicy, trenerzy, sztab, finanse, koszulki i zarząd.</div>
                </button>
                <button onClick={openNationalTeamsEditor} className="min-h-44 rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-left hover:bg-red-600 transition-colors">
                  <div className="text-2xl">EDYTUJ REPREZENTACJE</div>
                  <div className="text-xs mt-3 opacity-70">Kadry narodowe, selekcjonerzy, reputacja, stadiony i kolory reprezentacji.</div>
                </button>
                <button onClick={openFreeAgentsPool} className="min-h-44 rounded-lg border border-orange-500/30 bg-orange-500/10 p-6 text-left hover:bg-orange-600 transition-colors">
                  <div className="text-2xl">WOLNI AGENCI</div>
                  <div className="text-xs mt-3 opacity-70">Osobna lista wolnych piłkarzy i trenerów bez przypisania do klubu.</div>
                </button>
                <button onClick={() => createPlayer(FREE_AGENTS_ID)} className="min-h-44 rounded-lg border border-sky-500/30 bg-sky-500/10 p-6 text-left hover:bg-sky-600 transition-colors">
                  <div className="text-2xl">STWÓRZ PIŁKARZA</div>
                  <div className="text-xs mt-3 opacity-70">Dodaje nowego wolnego agenta bez przypisywania do klubu.</div>
                </button>
                <button onClick={() => createCoach(null)} className="min-h-44 rounded-lg border border-violet-500/30 bg-violet-500/10 p-6 text-left hover:bg-violet-600 transition-colors">
                  <div className="text-2xl">STWÓRZ TRENERA</div>
                  <div className="text-xs mt-3 opacity-70">Dodaje nowego wolnego trenera do bazy datapacka.</div>
                </button>
                <button onClick={() => importRef.current?.click()} className="min-h-44 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6 text-left hover:bg-emerald-600 transition-colors">
                  <div className="text-2xl">WCZYTAJ DATAPACK</div>
                  <div className="text-xs mt-3 opacity-70">Import full packa z obecnego lub nowego edytora.</div>
                </button>
                <button onClick={exportFullPack} className="min-h-44 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-6 text-left hover:bg-cyan-600 transition-colors">
                  <div className="text-2xl">ZAPISZ DATAPACK</div>
                  <div className="text-xs mt-3 opacity-70">Eksport pełnej bazy: kluby, zawodnicy, sztab, trenerzy i reprezentacje.</div>
                </button>
              </div>
            </div>
          </main>
        )}

        {screen === 'NATIONAL_TEAMS' && (
          <main className="flex-1 flex overflow-hidden">
            <section className="w-80 border-r border-white/10 bg-slate-900/40 flex flex-col">
              <div className="p-4 border-b border-white/10">
                <div className="text-yellow-400 text-lg mb-3">WYBIERZ REPREZENTACJĘ</div>
                <input value={nationalTeamQuery} onChange={event => setNationalTeamQuery(event.target.value)} placeholder="SZUKAJ REPREZENTACJI..." className={`${inputCls} w-full`} />
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredNationalTeams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedNationalTeamId(team.id)}
                    className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/10 ${selectedNationalTeamId === team.id ? 'bg-yellow-500/20 text-yellow-200' : 'text-slate-200'}`}
                  >
                    <div className="text-sm">{team.name}</div>
                    <div className="text-[10px] text-slate-500">{team.continent} · REP {team.reputation}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="flex-1 overflow-y-auto p-6">
              {!selectedNationalTeam ? (
                <div className="h-full flex items-center justify-center text-slate-600 text-xl">WYBIERZ REPREZENTACJĘ</div>
              ) : (
                <div className="max-w-6xl space-y-5">
                  <div className="rounded-lg border border-white/10 bg-slate-900/50 p-5">
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>
                        <div className="text-3xl text-white">{selectedNationalTeam.name}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {selectedNationalTeam.continent} · {selectedNationalTeam.squadPlayerIds.length} zawodników · REP {selectedNationalTeam.reputation}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {renderField('Nazwa', selectedNationalTeam.name, value => updateNationalTeam(selectedNationalTeam.id, { name: value }))}
                      {renderField('Kontynent', selectedNationalTeam.continent, value => updateNationalTeam(selectedNationalTeam.id, { continent: value }))}
                      {renderField('Stolica', selectedNationalTeam.capital ?? '', value => updateNationalTeam(selectedNationalTeam.id, { capital: value }))}
                      {renderField('Reputacja', selectedNationalTeam.reputation, value => updateNationalTeam(selectedNationalTeam.id, { reputation: clamp(toNumber(value, selectedNationalTeam.reputation), 1, 99) }), 'number')}
                      {renderField('Tier', selectedNationalTeam.tier, value => updateNationalTeam(selectedNationalTeam.id, { tier: clamp(toNumber(value, selectedNationalTeam.tier), 1, 10) }), 'number')}
                      {renderField('Stadion', selectedNationalTeam.stadiumName, value => updateNationalTeam(selectedNationalTeam.id, { stadiumName: value }))}
                      {renderField('Pojemność', selectedNationalTeam.stadiumCapacity, value => updateNationalTeam(selectedNationalTeam.id, { stadiumCapacity: Math.max(0, Math.round(toNumber(value))) }), 'number')}
                      <label className="flex flex-col gap-1">
                        <span className={labelCls}>Selekcjoner</span>
                        <select value={selectedNationalTeam.coachId ?? ''} onChange={event => {
                          const nextCoachId = event.target.value || null;
                          if (!nextCoachId) {
                            const oldCoachId = selectedNationalTeam.coachId;
                            updateNationalTeam(selectedNationalTeam.id, { coachId: null });
                            if (oldCoachId) {
                              setCoaches(prev => prev[oldCoachId] ? ({
                                ...prev,
                                [oldCoachId]: {
                                  ...prev[oldCoachId],
                                  currentNationalTeamId: null,
                                  isNationalTeamCoach: false,
                                },
                              }) : prev);
                            }
                            return;
                          }
                          const coach = coaches[nextCoachId];
                          if (coach) assignCoachToNationalTeam(coach, selectedNationalTeam.id);
                        }} className={selectCls}>
                          <option value="">Brak selekcjonera</option>
                          {Object.values(coaches)
                            .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'pl'))
                            .map(coach => <option key={coach.id} value={coach.id}>{coach.firstName} {coach.lastName}</option>)}
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-slate-900/50 p-5">
                    <div className="text-xl text-yellow-400 mb-4">KOLORY REPREZENTACJI</div>
                    <div className="grid grid-cols-4 gap-3">
                      {(selectedNationalTeam.colorsHex.length ? selectedNationalTeam.colorsHex : ['#ffffff', '#ff0000']).map((color, index) => (
                        <label key={index} className="flex flex-col gap-1">
                          <span className={labelCls}>Kolor {index + 1}</span>
                          <input
                            type="color"
                            value={color}
                            onChange={event => {
                              const next = [...selectedNationalTeam.colorsHex];
                              next[index] = event.target.value;
                              updateNationalTeamColors(selectedNationalTeam, next);
                            }}
                            className="h-10 w-full rounded bg-black border border-slate-700"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-slate-900/50 p-5">
                    <div className="text-xl text-yellow-400 mb-4">KOSZULKI REPREZENTACJI</div>
                    <div className="grid grid-cols-3 gap-4">
                      {getNationalTeamKits(selectedNationalTeam).map((kit, index) => (
                        <div key={kit.id} className="rounded border border-white/10 bg-black/25 p-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm text-white">{kit.name}</div>
                              <div className="text-[10px] text-slate-500">Komplet {index + 1}</div>
                            </div>
                            <KitPreview shirt={kit.shirt} shirtSecondary={kit.shirtSecondary} shorts={kit.shorts} socks={kit.socks} pattern={kit.pattern} className="h-24 w-24" />
                          </div>
                          {renderField('Nazwa kompletu', kit.name, value => updateNationalTeamKit(selectedNationalTeam, index, { name: value }))}
                          <label className="flex flex-col gap-1">
                            <span className={labelCls}>Wzór</span>
                            <select value={kit.pattern} onChange={event => updateNationalTeamKit(selectedNationalTeam, index, { pattern: event.target.value as ClubKitPattern })} className={selectCls}>
                              {KIT_PATTERN_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {([
                              ['Koszulka', 'shirt'],
                              ['Drugi kolor', 'shirtSecondary'],
                              ['Spodenki', 'shorts'],
                              ['Getry', 'socks'],
                            ] as [string, keyof ClubKit][]).map(([label, key]) => (
                              <label key={key} className="flex flex-col gap-1">
                                <span className={labelCls}>{label}</span>
                                <input
                                  type="color"
                                  value={(kit[key] as string) || '#ffffff'}
                                  onChange={event => updateNationalTeamKit(selectedNationalTeam, index, { [key]: event.target.value })}
                                  className="h-9 w-full rounded bg-black border border-slate-700"
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </main>
        )}

        {screen === 'TEAMS' && (
          <main className="flex-1 flex overflow-hidden">
            <section className="w-80 border-r border-white/10 bg-slate-900/40 flex flex-col">
              <div className="p-4 border-b border-white/10">
                <div className="text-yellow-400 text-lg mb-3">WYBIERZ KLUB</div>
                <input value={clubQuery} onChange={event => setClubQuery(event.target.value)} placeholder="SZUKAJ KLUBU..." className={`${inputCls} w-full`} />
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredClubs.map(club => (
                  <button
                    key={club.id}
                    onClick={() => { setSelectedClubId(club.id); setSelectedPlayerId(''); setSelectedStaffId(''); setSelectedCoachId(club.coachId ?? ''); }}
                    className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/10 ${selectedClubId === club.id ? 'bg-yellow-500/20 text-yellow-200' : 'text-slate-200'}`}
                  >
                    <div className="text-sm">{club.name}</div>
                    <div className="text-[10px] text-slate-500">{club.leagueId} · REP {club.reputation}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="flex-1 flex flex-col overflow-hidden">
              {!selectedClub && !isFreeAgentsPool ? (
                <div className="h-full flex items-center justify-center text-slate-600 text-xl">WYBIERZ KLUB ALBO PULĘ WOLNYCH OSÓB</div>
              ) : (
                <>
                  <div className="p-5 border-b border-white/10 bg-black/30">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-3xl text-white">{isFreeAgentsPool ? 'Wolni zawodnicy i trenerzy' : selectedClub?.name}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {isFreeAgentsPool
                            ? `${squad.length} wolnych zawodników · ${freeCoaches.length} wolnych trenerów`
                            : `${selectedClub?.stadiumName} · ${squad.length} zawodników · budżet ${(selectedClub?.budget ?? 0).toLocaleString('pl-PL')} PLN`}
                        </div>
                      </div>
                      <button onClick={() => navigateTo(ViewState.TEAM_SELECTION)} className="rounded bg-emerald-700 hover:bg-emerald-600 px-4 py-2 text-xs">ZACZNIJ GRĘ</button>
                    </div>
                    <div className="flex gap-2 mt-5">
                      {(isFreeAgentsPool ? [
                        ['SQUAD', 'ZAWODNICY'],
                        ['STAFF', 'TRENERZY'],
                      ] : [
                        ['SQUAD', 'SKŁAD'],
                        ['CLUB', 'KLUB'],
                        ['FINANCE', 'FINANSE'],
                        ['KITS', 'KOSZULKI'],
                        ['STAFF', 'SZTAB'],
                        ['BOARD', 'ZARZĄD'],
                      ]).map(([value, label]) => (
                        <button key={value} onClick={() => setTab(value as TeamTab)} className={`rounded px-3 py-2 text-[11px] border ${tab === value ? 'bg-yellow-500 text-black border-yellow-300' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>{label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5">
                    {tab === 'SQUAD' && (
                      <div className="space-y-5">
                        <div className="rounded-lg border border-white/10 overflow-hidden bg-slate-900/50">
                          <div className="p-3 flex justify-between items-center border-b border-white/10">
                            <span className="text-yellow-400">{isFreeAgentsPool ? 'WOLNI ZAWODNICY' : 'SKŁAD DRUŻYNY'}</span>
                            <div className="flex gap-2">
                              {!isFreeAgentsPool && <button onClick={() => createPlayer(selectedClub?.id)} className="rounded bg-emerald-700 px-3 py-1 text-[10px]">+ ZAWODNIK</button>}
                            </div>
                          </div>
                          <div className={isFreeAgentsPool ? 'max-h-[65vh] overflow-y-auto p-3 space-y-3' : 'p-3 space-y-3'}>
                            {POSITION_GROUPS.map(position => {
                              const positionPlayers = squad.filter(player => player.position === position);
                              if (positionPlayers.length === 0) return null;
                              return (
                                <div key={position} className={`rounded border overflow-hidden ${POSITION_SECTION_CLASSES[position]}`}>
                                  <div className="px-3 py-2 text-[11px] text-white/90 border-b border-white/10 flex justify-between">
                                    <span>{POSITION_GROUP_LABELS[position]}</span>
                                    <span>{positionPlayers.length}</span>
                                  </div>
                                  <div className={isFreeAgentsPool ? 'grid grid-cols-2 xl:grid-cols-3' : 'grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}>
                                    {positionPlayers.map(player => (
                                      <button key={player.id} onClick={() => setSelectedPlayerId(player.id)} className={`w-full grid grid-cols-[42px_1fr_42px] gap-2 px-3 py-2 text-left border-b border-white/5 transition-colors ${POSITION_ROW_CLASSES[player.position]} ${selectedPlayer?.id === player.id ? 'ring-1 ring-yellow-300/70 bg-yellow-500/25' : ''}`}>
                                        <span className="text-[10px] text-white/80">{POSITION_LABELS[player.position]}</span>
                                        <span className="text-xs truncate">{player.firstName} {player.lastName}</span>
                                        <span className="text-xs text-emerald-400 text-right">{player.overallRating}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {selectedPlayer && (
                          <div className="rounded-lg border border-white/10 bg-slate-900/50 p-5">
                            <div className="flex items-center justify-between gap-3 mb-4">
                              <div className="text-xl text-yellow-400">EDYCJA ZAWODNIKA</div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => openContractLookup(selectedPlayer)} className="rounded bg-cyan-700 hover:bg-cyan-600 px-4 py-2 text-xs text-white">ZNAJDŹ INFO O KONTRAKCIE</button>
                                <button onClick={() => deletePlayer(selectedPlayer)} className="rounded bg-red-800 hover:bg-red-700 px-4 py-2 text-xs text-white">USUŃ ZAWODNIKA</button>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                              {renderField('Imię', selectedPlayer.firstName, value => updatePlayer(selectedPlayer.id, { firstName: value }))}
                              {renderField('Nazwisko', selectedPlayer.lastName, value => updatePlayer(selectedPlayer.id, { lastName: value }))}
                              {renderField('Wiek', selectedPlayer.age, value => updatePlayer(selectedPlayer.id, { age: clamp(toNumber(value, selectedPlayer.age), 15, 45) }), 'number')}
                              <label className="flex flex-col gap-1">
                                <span className={labelCls}>Narodowość</span>
                                <select
                                  value={selectedPlayer.nationalityCountry ?? getDefaultCountryForRegion(selectedPlayer.nationality)}
                                  onChange={event => {
                                    const nationalityCountry = event.target.value;
                                    updatePlayer(selectedPlayer.id, {
                                      nationalityCountry,
                                      nationality: findRegionForCountry(nationalityCountry),
                                    });
                                  }}
                                  className={selectCls}
                                >
                                  {COUNTRY_OPTIONS.map(country => <option key={`${country.region}-${country.name}`} value={country.name}>{country.name}</option>)}
                                </select>
                              </label>
                              <label className="flex flex-col gap-1">
                                <span className={labelCls}>Pozycja</span>
                                <select value={selectedPlayer.position} onChange={event => {
                                  const position = event.target.value as PlayerPosition;
                                  updatePlayer(selectedPlayer.id, { position, overallRating: PlayerAttributesGenerator.calculateOverall(selectedPlayer.attributes, position) });
                                }} className={selectCls}>
                                  {Object.values(PlayerPosition).map(position => <option key={position} value={position}>{POSITION_LABELS[position]}</option>)}
                                </select>
                              </label>
                              <label className="flex flex-col gap-1">
                                <span className={labelCls}>2. pozycja</span>
                                <select value={selectedPlayer.secondaryPosition ?? ''} onChange={event => {
                                  const secondaryPosition = event.target.value ? event.target.value as PlayerPosition : null;
                                  updatePlayer(selectedPlayer.id, {
                                    secondaryPosition,
                                    secondaryPositionRating: secondaryPosition ? selectedPlayer.secondaryPositionRating ?? 50 : undefined,
                                  });
                                }} className={selectCls}>
                                  <option value="">Brak</option>
                                  {Object.values(PlayerPosition)
                                    .filter(position => position !== selectedPlayer.position)
                                    .map(position => <option key={position} value={position}>{POSITION_LABELS[position]}</option>)}
                                </select>
                              </label>
                              {renderField('Ocena 2. poz.', selectedPlayer.secondaryPositionRating ?? 50, value => updatePlayer(selectedPlayer.id, { secondaryPositionRating: clamp(toNumber(value, selectedPlayer.secondaryPositionRating ?? 50), 1, 99) }), 'number')}
                              {renderField('Pensja roczna', selectedPlayer.annualSalary, value => updatePlayer(selectedPlayer.id, { annualSalary: Math.max(0, Math.round(toNumber(value))) }), 'number')}
                              {renderField('Wartość', selectedPlayer.marketValue ?? 0, value => updatePlayer(selectedPlayer.id, { marketValue: Math.max(0, Math.round(toNumber(value))) }), 'number')}
                              {renderField('Kontrakt do', dateInput(selectedPlayer.contractEndDate), value => updatePlayer(selectedPlayer.id, { contractEndDate: isoFromDateInput(value) }), 'date')}
                              <label className="flex flex-col gap-1">
                                <span className={labelCls}>Przypisanie</span>
                                <select value={selectedPlayer.clubId} onChange={event => {
                                  const nextClubId = event.target.value;
                                  updatePlayer(selectedPlayer.id, { clubId: nextClubId });
                                  setSelectedClubId(nextClubId);
                                  setSelectedPlayerId(selectedPlayer.id);
                                }} className={selectCls}>
                                  <option value={FREE_AGENTS_ID}>Wolny agent</option>
                                  {editableClubs.map(club => <option key={club.id} value={club.id}>{club.name}</option>)}
                                </select>
                              </label>
                            </div>

                            <div className="grid grid-cols-4 gap-3 mt-5 rounded-lg border border-white/10 bg-black/20 p-4">
                              <label className="flex flex-col gap-1">
                                <span className={labelCls}>Status zawodnika</span>
                                <select value={getPlayerStatusValue(selectedPlayer)} onChange={event => updatePlayerStatus(selectedPlayer, event.target.value)} className={selectCls}>
                                  <option value="NONE">Normalny</option>
                                  <option value="UNTOUCHABLE">Nie na sprzedaż</option>
                                  <option value="TRANSFER_LIST">Wystawiony na listę</option>
                                  <option value="AVAILABLE_LOAN">Dostępny do wypożyczenia</option>
                                  <option value="STARTER">Pierwsza 11</option>
                                  <option value="KEY_PLAYER">Kluczowy zawodnik</option>
                                </select>
                              </label>
                              {renderField('Mecze w reprezentacji', selectedPlayer.nationalStats?.matchesPlayed ?? 0, value => updatePlayer(selectedPlayer.id, { nationalStats: { ...emptyStats(), ...(selectedPlayer.nationalStats ?? {}), matchesPlayed: Math.max(0, Math.round(toNumber(value))) } }), 'number')}
                              {renderField('Gole w reprezentacji', selectedPlayer.nationalStats?.goals ?? 0, value => updatePlayer(selectedPlayer.id, { nationalStats: { ...emptyStats(), ...(selectedPlayer.nationalStats ?? {}), goals: Math.max(0, Math.round(toNumber(value))) } }), 'number')}
                              {renderField('Reputacja', selectedPlayer.reputacja ?? 50, value => updatePlayer(selectedPlayer.id, { reputacja: clamp(toNumber(value, selectedPlayer.reputacja ?? 50), 1, 99) }), 'number')}
                              {renderField('Lojalność', selectedPlayer.lojalnosc ?? 50, value => updatePlayer(selectedPlayer.id, { lojalnosc: clamp(toNumber(value, selectedPlayer.lojalnosc ?? 50), 1, 99) }), 'number')}
                            </div>

                            <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-4">
                              <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!selectedPlayer.transferPendingClubId || !!selectedPlayer.transferReportDate}
                                  onChange={event => {
                                    if (!event.target.checked) {
                                      updatePlayer(selectedPlayer.id, {
                                        transferPendingClubId: undefined,
                                        transferReportDate: undefined,
                                        transferPendingFee: undefined,
                                        transferPendingSalary: undefined,
                                        transferPendingBonus: undefined,
                                        transferPendingContractYears: undefined,
                                      });
                                      return;
                                    }
                                    const targetClub = editableClubs.find(club => club.id !== selectedPlayer.clubId) ?? editableClubs[0];
                                    updatePlayer(selectedPlayer.id, {
                                      transferPendingClubId: targetClub?.id,
                                      transferReportDate: new Date(currentDate).toISOString(),
                                      transferPendingFee: 0,
                                      transferPendingSalary: selectedPlayer.annualSalary,
                                      transferPendingContractYears: selectedPlayer.transferPendingContractYears ?? 2,
                                      isOnTransferList: false,
                                      isAvailableForLoan: false,
                                    });
                                  }}
                                  className="accent-yellow-400"
                                />
                                <span className={labelCls}>Uzgodniony transfer do nowego klubu</span>
                              </label>
                              {(selectedPlayer.transferPendingClubId || selectedPlayer.transferReportDate) && (
                                <div className="grid grid-cols-5 gap-3 mt-3">
                                  <label className="flex flex-col gap-1">
                                    <span className={labelCls}>Nowy klub</span>
                                    <select value={selectedPlayer.transferPendingClubId ?? ''} onChange={event => updatePlayer(selectedPlayer.id, { transferPendingClubId: event.target.value })} className={selectCls}>
                                      <option value="">Wybierz klub</option>
                                      {editableClubs.map(club => <option key={club.id} value={club.id}>{club.name}</option>)}
                                    </select>
                                  </label>
                                  {renderField('Data przejścia', dateInput(selectedPlayer.transferReportDate), value => updatePlayer(selectedPlayer.id, { transferReportDate: isoFromDateInput(value) }), 'date')}
                                  {renderField('Kwota transferu', selectedPlayer.transferPendingFee ?? 0, value => updatePlayer(selectedPlayer.id, { transferPendingFee: Math.max(0, Math.round(toNumber(value))) }), 'number')}
                                  {renderField('Nowa pensja', selectedPlayer.transferPendingSalary ?? 0, value => updatePlayer(selectedPlayer.id, { transferPendingSalary: Math.max(0, Math.round(toNumber(value))) }), 'number')}
                                  {renderField('Lata kontraktu', selectedPlayer.transferPendingContractYears ?? 1, value => updatePlayer(selectedPlayer.id, { transferPendingContractYears: clamp(toNumber(value, selectedPlayer.transferPendingContractYears ?? 1), 1, 10) }), 'number')}
                                  <div className="col-span-5 text-[10px] text-slate-500 normal-case not-italic tracking-normal font-normal">
                                    Kwota 0 oznacza wolny transfer.
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-4">
                              <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!selectedPlayer.loan}
                                  onChange={event => {
                                    if (!event.target.checked) {
                                      updatePlayer(selectedPlayer.id, { loan: null });
                                      return;
                                    }
                                    const parentClub = editableClubs.find(club => club.id === selectedPlayer.clubId) ?? editableClubs[0];
                                    const destinationClub = editableClubs.find(club => club.id !== parentClub?.id);
                                    const start = new Date(currentDate);
                                    const end = new Date(currentDate);
                                    end.setFullYear(end.getFullYear() + 1);
                                    if (parentClub && destinationClub) {
                                      updatePlayer(selectedPlayer.id, {
                                        loan: makeLoanInfo(parentClub.id, destinationClub.id, start.toISOString().substring(0, 10), end.toISOString().substring(0, 10)),
                                        isAvailableForLoan: false,
                                      });
                                    }
                                  }}
                                  className="accent-yellow-400"
                                />
                                <span className={labelCls}>Wypożyczony do innego klubu</span>
                              </label>
                              {selectedPlayer.loan && (
                                <div className="grid grid-cols-4 gap-3 mt-3">
                                  <label className="flex flex-col gap-1">
                                    <span className={labelCls}>Klub macierzysty</span>
                                    <select value={selectedPlayer.loan.parentClubId} onChange={event => {
                                      const loan = makeLoanInfo(event.target.value, selectedPlayer.loan?.destinationClubId ?? '', dateInput(selectedPlayer.loan?.startDate), dateInput(selectedPlayer.loan?.endDate));
                                      updatePlayer(selectedPlayer.id, { loan });
                                    }} className={selectCls}>
                                      {editableClubs.map(club => <option key={club.id} value={club.id}>{club.name}</option>)}
                                    </select>
                                  </label>
                                  <label className="flex flex-col gap-1">
                                    <span className={labelCls}>Klub wypożyczenia</span>
                                    <select value={selectedPlayer.loan.destinationClubId} onChange={event => {
                                      const loan = makeLoanInfo(selectedPlayer.loan?.parentClubId ?? '', event.target.value, dateInput(selectedPlayer.loan?.startDate), dateInput(selectedPlayer.loan?.endDate));
                                      updatePlayer(selectedPlayer.id, { loan });
                                    }} className={selectCls}>
                                      {editableClubs.map(club => <option key={club.id} value={club.id}>{club.name}</option>)}
                                    </select>
                                  </label>
                                  {renderField('Wypożyczenie od', dateInput(selectedPlayer.loan.startDate), value => {
                                    const loan = makeLoanInfo(selectedPlayer.loan?.parentClubId ?? '', selectedPlayer.loan?.destinationClubId ?? '', value, dateInput(selectedPlayer.loan?.endDate));
                                    updatePlayer(selectedPlayer.id, { loan });
                                  }, 'date')}
                                  {renderField('Wypożyczenie do', dateInput(selectedPlayer.loan.endDate), value => {
                                    const loan = makeLoanInfo(selectedPlayer.loan?.parentClubId ?? '', selectedPlayer.loan?.destinationClubId ?? '', dateInput(selectedPlayer.loan?.startDate), value);
                                    updatePlayer(selectedPlayer.id, { loan });
                                  }, 'date')}
                                  <div className="col-span-4 text-[10px] text-amber-300">
                                    {selectedPlayer.loan.parentClubName} → {selectedPlayer.loan.destinationClubName}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-5">
                              {ATTR_KEYS.map(key => (
                                <label key={key} className="grid grid-cols-[1fr_64px] items-center gap-2">
                                  <span className={labelCls}>{ATTR_LABELS[key]}</span>
                                  <input
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={selectedPlayer.attributes[key]}
                                    onChange={event => {
                                      const attributes = { ...selectedPlayer.attributes, [key]: clamp(toNumber(event.target.value, selectedPlayer.attributes[key]), 1, 99) };
                                      updatePlayer(selectedPlayer.id, {
                                        attributes,
                                        overallRating: PlayerAttributesGenerator.calculateOverall(attributes, selectedPlayer.position),
                                      });
                                    }}
                                    className={`${inputCls} text-center`}
                                  />
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {tab === 'CLUB' && (
                      <div className="grid grid-cols-3 gap-4 max-w-4xl">
                        {renderField('Nazwa zespołu', selectedClub.name, value => updateClub({ name: value }))}
                        {renderField('Krótka nazwa', selectedClub.shortName, value => updateClub({ shortName: value }))}
                        {renderField('Reputacja', selectedClub.reputation, value => updateClub({ reputation: clamp(toNumber(value, selectedClub.reputation), 1, 20) }), 'number')}
                        {renderField('Stadion', selectedClub.stadiumName, value => updateClub({ stadiumName: value }))}
                        {renderField('Pojemność', selectedClub.stadiumCapacity, value => updateClub({ stadiumCapacity: Math.max(0, Math.round(toNumber(value))) }), 'number')}
                        {renderField('Kraj', selectedClub.country ?? '', value => updateClub({ country: value }))}
                        {(selectedClub.colorsHex ?? ['#ffffff', '#111827']).slice(0, 4).map((color, index) => (
                          <label key={index} className="flex flex-col gap-1">
                            <span className={labelCls}>Kolor {index + 1}</span>
                            <input type="color" value={color} onChange={event => {
                              const colors = [...(selectedClub.colorsHex ?? [])];
                              colors[index] = event.target.value;
                              updateClub({ colorsHex: colors, kits: createDefaultClubKits(colors) });
                            }} className="h-10 w-full rounded bg-black border border-slate-700" />
                          </label>
                        ))}
                      </div>
                    )}

                    {tab === 'FINANCE' && (
                      <div className="grid grid-cols-4 gap-4 max-w-5xl">
                        {renderField('Budżet klubu', selectedClub.budget, value => updateClub({ budget: Math.round(toNumber(value)) }), 'number')}
                        {renderField('Budżet transferowy', selectedClub.transferBudget, value => updateClub({ transferBudget: Math.round(toNumber(value)) }), 'number')}
                        {renderField('Budżet rezerw', selectedClub.reserveBudget ?? 0, value => updateClub({ reserveBudget: Math.round(toNumber(value)) }), 'number')}
                        {renderField('Bonusy za podpis', selectedClub.signingBonusPool ?? 0, value => updateClub({ signingBonusPool: Math.round(toNumber(value)) }), 'number')}
                        {renderField('Rygor zarządu', selectedClub.boardStrictness ?? 50, value => updateClub({ boardStrictness: clamp(toNumber(value), 1, 99) }), 'number')}
                      </div>
                    )}

                    {tab === 'KITS' && (
                      <div className="grid grid-cols-2 gap-4">
                        {kits.map((kit, index) => (
                          <div key={kit.id} className="rounded-lg border border-white/10 bg-slate-900/50 p-4 grid grid-cols-[140px_1fr] gap-4">
                            <div className="flex items-center justify-center bg-black/30 rounded">
                              <KitPreview shirt={kit.shirt} shirtSecondary={kit.shirtSecondary} shorts={kit.shorts} socks={kit.socks} pattern={kit.pattern} className="h-24 w-24" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {renderField('Nazwa', kit.name, value => updateKit(index, { name: value }))}
                              <label className="flex flex-col gap-1">
                                <span className={labelCls}>Wzór</span>
                                <select value={kit.pattern ?? 'solid'} onChange={event => updateKit(index, { pattern: event.target.value as ClubKitPattern })} className={selectCls}>
                                  {KIT_PATTERN_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                              </label>
                              {(['shirt', 'shirtSecondary', 'shorts', 'socks'] as const).map(field => (
                                <label key={field} className="flex flex-col gap-1">
                                  <span className={labelCls}>{field}</span>
                                  <input type="color" value={(kit[field] as string) ?? '#ffffff'} onChange={event => updateKit(index, { [field]: event.target.value })} className="h-9 w-full rounded bg-black border border-slate-700" />
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {tab === 'STAFF' && (
                      <div className="grid grid-cols-[360px_1fr] gap-5">
                        <div className="rounded-lg border border-white/10 bg-slate-900/50 overflow-hidden">
                          <div className="p-3 border-b border-white/10 flex justify-between items-center">
                            <span className="text-yellow-400">{isFreeAgentsPool ? 'WOLNI TRENERZY' : 'TRENER I SZTAB'}</span>
                            <div className="flex gap-2">
                              {!isFreeAgentsPool && <button onClick={() => createCoach(selectedClub?.id ?? null)} className="rounded bg-emerald-700 px-3 py-1 text-[10px]">+ TRENER</button>}
                            </div>
                          </div>
                          {isFreeAgentsPool ? (
                            freeCoaches.map(coach => (
                              <button
                                key={coach.id}
                                onClick={() => { setSelectedCoachId(coach.id); setSelectedStaffId(''); setIsCoachEditorOpen(true); }}
                                className={`w-full text-left px-3 py-2 border-b border-white/5 ${selectedCoachId === coach.id ? 'bg-yellow-500/20' : 'hover:bg-white/5'}`}
                              >
                                <div className="text-xs">{coach.firstName} {coach.lastName}</div>
                                <div className="text-[10px] text-slate-500">Wolny trener · {coach.nationality}</div>
                              </button>
                            ))
                          ) : (
                            <>
                              {clubCoach && (
                                <button
                                  onClick={() => { setSelectedCoachId(clubCoach.id); setSelectedStaffId(''); }}
                                  className={`w-full text-left px-3 py-2 border-b border-white/5 ${selectedCoachId === clubCoach.id ? 'bg-yellow-500/20' : 'hover:bg-white/5'}`}
                                >
                                  <div className="text-xs">{clubCoach.firstName} {clubCoach.lastName}</div>
                                  <div className="text-[10px] text-slate-500">Trener główny · {clubCoach.nationality}</div>
                                </button>
                              )}
                              <div className="p-3 grid grid-cols-2 gap-2 border-b border-white/10">
                                {Object.values(StaffRole).map(role => (
                                  <button key={role} onClick={() => createStaff(role)} className="rounded bg-white/5 hover:bg-white/10 px-2 py-2 text-[10px] text-slate-300">+ {STAFF_ROLE_LABELS[role]}</button>
                                ))}
                              </div>
                              {clubStaff.map(staff => (
                                <button key={staff.id} onClick={() => { setSelectedStaffId(staff.id); setSelectedCoachId(''); }} className={`w-full text-left px-3 py-2 border-b border-white/5 ${selectedStaffId === staff.id ? 'bg-yellow-500/20' : 'hover:bg-white/5'}`}>
                                  <div className="text-xs">{staff.firstName} {staff.lastName}</div>
                                  <div className="text-[10px] text-slate-500">{STAFF_ROLE_LABELS[staff.role]}</div>
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                        <div className="rounded-lg border border-white/10 bg-slate-900/50 p-5">
                          {selectedCoach ? (
                            isFreeAgentsPool ? (
                              <div className="text-slate-500 text-xs">Edycja wolnego trenera otwiera się w osobnym oknie po kliknięciu na liście.</div>
                            ) : (
                              <>
                                <div className="text-xl text-yellow-400 mb-4">EDYCJA TRENERA</div>
                                {renderCoachEditor(selectedCoach)}
                              </>
                            )
                          ) : selectedStaff ? (
                            <>
                              <div className="text-xl text-yellow-400 mb-4">EDYCJA CZŁONKA SZTABU</div>
                              <div className="grid grid-cols-4 gap-3">
                                {renderField('Imię', selectedStaff.firstName, value => setStaffMembers(prev => ({ ...prev, [selectedStaff.id]: { ...selectedStaff, firstName: value } })))}
                                {renderField('Nazwisko', selectedStaff.lastName, value => setStaffMembers(prev => ({ ...prev, [selectedStaff.id]: { ...selectedStaff, lastName: value } })))}
                                {renderField('Wiek', selectedStaff.age, value => setStaffMembers(prev => ({ ...prev, [selectedStaff.id]: { ...selectedStaff, age: clamp(toNumber(value, selectedStaff.age), 18, 80) } })), 'number')}
                                <label className="flex flex-col gap-1">
                                  <span className={labelCls}>Narodowość</span>
                                  <select value={getCountrySelectValue(selectedStaff.nationality)} onChange={event => setStaffMembers(prev => ({ ...prev, [selectedStaff.id]: { ...selectedStaff, nationality: event.target.value } }))} className={selectCls}>
                                    {COUNTRY_OPTIONS.map(country => <option key={`${country.region}-${country.name}`} value={country.name}>{country.name}</option>)}
                                  </select>
                                </label>
                                {renderField('Pensja', selectedStaff.salary, value => setStaffMembers(prev => ({ ...prev, [selectedStaff.id]: { ...selectedStaff, salary: Math.max(0, Math.round(toNumber(value))) } })), 'number')}
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-5">
                                {(STAFF_ROLE_ATTRS[selectedStaff.role] ?? []).map(({ key, label }) => (
                                  <label key={key} className="grid grid-cols-[1fr_64px] gap-2 items-center">
                                    <span className={labelCls}>{label}</span>
                                    <input type="number" min={1} max={20} value={selectedStaff.attributes[key] ?? 10} onChange={event => setStaffMembers(prev => ({
                                      ...prev,
                                      [selectedStaff.id]: {
                                        ...selectedStaff,
                                        attributes: { ...selectedStaff.attributes, [key]: clamp(toNumber(event.target.value), 1, 20) },
                                      },
                                    }))} className={`${inputCls} text-center`} />
                                  </label>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="text-slate-600">WYBIERZ OSOBĘ ZE SZTABU ALBO DODAJ NOWĄ.</div>
                          )}
                        </div>
                      </div>
                    )}

                    {tab === 'BOARD' && (
                      <div className="grid grid-cols-[280px_1fr] gap-5">
                        <div className="rounded-lg border border-white/10 bg-slate-900/50 overflow-hidden">
                          {Object.entries(BOARD_FIELDS).map(([key, config]) => {
                            const person = key === 'sportingDirector' ? selectedClub.sportingDirector : (selectedClub.management as any)?.[key];
                            return (
                              <button key={key} onClick={() => person ? setSelectedBoardKey(key) : createBoardPerson(key)} className={`w-full text-left px-4 py-3 border-b border-white/5 ${selectedBoardKey === key ? 'bg-yellow-500/20' : 'hover:bg-white/5'} ${person ? '' : 'bg-emerald-500/5 text-emerald-200'}`}>
                                <div className="text-xs">{config.label}</div>
                                <div className="text-[10px] text-slate-500">{person ? `${person.firstName} ${person.lastName}` : '+ Dodaj brakującą osobę'}</div>
                              </button>
                            );
                          })}
                        </div>
                        {(() => {
                          const person = selectedBoardKey === 'sportingDirector' ? selectedClub.sportingDirector : (selectedClub.management as any)?.[selectedBoardKey];
                          if (!person) return (
                            <div className="rounded-lg border border-white/10 bg-slate-900/50 p-5">
                              <div className="text-xl text-yellow-400 mb-2">{BOARD_FIELDS[selectedBoardKey].label}</div>
                              <div className="text-slate-500 text-xs mb-4">TA ROLA NIE JEST OBSADZONA.</div>
                              <button onClick={() => createBoardPerson(selectedBoardKey)} className="rounded bg-emerald-700 hover:bg-emerald-600 px-4 py-2 text-xs">+ DODAJ CZŁONKA ZARZĄDU</button>
                            </div>
                          );
                          return (
                            <div className="rounded-lg border border-white/10 bg-slate-900/50 p-5">
                              <div className="text-xl text-yellow-400 mb-4">{BOARD_FIELDS[selectedBoardKey].label}</div>
                              <div className="grid grid-cols-4 gap-3">
                                {renderField('Imię', person.firstName, value => updateBoardPerson(selectedBoardKey, { firstName: value }))}
                                {renderField('Nazwisko', person.lastName, value => updateBoardPerson(selectedBoardKey, { lastName: value }))}
                                {renderField('Wiek', person.age, value => updateBoardPerson(selectedBoardKey, { age: clamp(toNumber(value, person.age), 18, 90) }), 'number')}
                                {'monthlySalary' in person && renderField('Pensja mies.', person.monthlySalary ?? 0, value => updateBoardPerson(selectedBoardKey, { monthlySalary: Math.max(0, Math.round(toNumber(value))) }), 'number')}
                              </div>
                              <div className="grid grid-cols-3 gap-2 mt-5">
                                {BOARD_FIELDS[selectedBoardKey].keys.map(key => (
                                  <label key={key} className="grid grid-cols-[1fr_64px] gap-2 items-center">
                                    <span className={labelCls}>{key}</span>
                                    <input type="number" min={1} max={selectedBoardKey === 'sportingDirector' ? 99 : 20} value={person[key] ?? 1} onChange={event => updateBoardPerson(selectedBoardKey, { [key]: clamp(toNumber(event.target.value), 1, selectedBoardKey === 'sportingDirector' ? 99 : 20) })} className={`${inputCls} text-center`} />
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          </main>
        )}
      </div>

      {contractLookupPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <div className="w-full max-w-6xl max-h-[88vh] overflow-y-auto rounded-lg border border-cyan-500/30 bg-slate-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-5 border-b border-white/10 pb-4">
              <div>
                <div className="text-xl text-cyan-300">SZUKAJ INFORMACJI O KONTRAKCIE</div>
                <div className="text-[10px] text-slate-500">
                  {contractLookupPlayer.firstName} {contractLookupPlayer.lastName} · obecnie: kontrakt do {dateInput(contractLookupPlayer.contractEndDate) || 'brak'} · pensja {formatMoney(contractLookupPlayer.annualSalary)}
                </div>
              </div>
              <button onClick={() => { setContractLookupPlayerId(''); setContractLookupVariants([]); }} className="rounded bg-white/10 hover:bg-white/20 px-4 py-2 text-xs">ZAMKNIJ</button>
            </div>

            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4 mb-4">
              <div className="text-sm text-cyan-200">TRYB BEZPIECZNY</div>
              <div className="text-[11px] text-slate-300 normal-case not-italic tracking-normal font-normal mt-1">
                Edytor nie scrapuje stron automatycznie. Otwórz źródło, sprawdź dane, wpisz wartości w jednym z wariantów i dopiero wtedy kliknij UŻYJ WARIANTU.
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {contractLookupVariants.map(variant => (
                <div key={variant.id} className="rounded-lg border border-white/10 bg-black/25 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg text-white">{variant.label}</div>
                      <div className="text-[10px] text-slate-500">{variant.sourceName}</div>
                    </div>
                    <a href={variant.sourceUrl} target="_blank" rel="noreferrer" className="rounded bg-cyan-700 hover:bg-cyan-600 px-3 py-2 text-[10px] text-white">
                      OTWÓRZ ŹRÓDŁO
                    </a>
                  </div>

                  <label className="flex flex-col gap-1">
                    <span className={labelCls}>Źródło / opis</span>
                    <input value={variant.sourceName} onChange={event => updateContractLookupVariant(variant.id, { sourceName: event.target.value })} className={inputCls} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className={labelCls}>Wklej tekst ze źródła</span>
                    <textarea
                      value={variant.sourceText ?? ''}
                      onChange={event => updateContractLookupSourceText(variant.id, event.target.value)}
                      placeholder="Np. Market value €2.50m albo Contract expires Jun 30, 2028"
                      className={`${inputCls} min-h-16 normal-case not-italic tracking-normal font-normal`}
                    />
                    <button type="button" onClick={() => readContractLookupClipboard(variant.id)} className="rounded bg-cyan-700 hover:bg-cyan-600 px-3 py-2 text-[10px] text-white">
                      ODCZYTAJ ZE SCHOWKA
                    </button>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className={labelCls}>Kontrakt do</span>
                    <input type="date" value={variant.contractEndDate} onChange={event => updateContractLookupVariant(variant.id, { contractEndDate: event.target.value })} className={inputCls} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className={labelCls}>Pensja roczna PLN</span>
                    <input type="number" min={0} value={variant.annualSalary} onChange={event => updateContractLookupVariant(variant.id, { annualSalary: Math.max(0, Math.round(toNumber(event.target.value))) })} className={inputCls} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className={labelCls}>Wartość rynkowa PLN</span>
                    <input type="number" min={0} value={variant.marketValue} onChange={event => updateContractLookupVariant(variant.id, { marketValue: Math.max(0, Math.round(toNumber(event.target.value))) })} className={inputCls} />
                    {variant.marketValueOptions && variant.marketValueOptions.length > 0 && (
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {variant.marketValueOptions.map(value => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => updateContractLookupVariant(variant.id, { marketValue: value })}
                            className={`rounded border px-2 py-1 text-[10px] ${variant.marketValue === value ? 'bg-yellow-500 text-black border-yellow-300' : 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10'}`}
                          >
                            {formatMoney(value)}
                          </button>
                        ))}
                      </div>
                    )}
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className={labelCls}>Pewność 0-100</span>
                    <input type="number" min={0} max={100} value={variant.confidence} onChange={event => updateContractLookupVariant(variant.id, { confidence: clamp(toNumber(event.target.value, variant.confidence), 0, 100) })} className={inputCls} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className={labelCls}>Notatka</span>
                    <textarea value={variant.note} onChange={event => updateContractLookupVariant(variant.id, { note: event.target.value })} className={`${inputCls} min-h-20 normal-case not-italic tracking-normal font-normal`} />
                  </label>

                  <div className="rounded border border-white/10 bg-white/5 p-3 text-[10px] text-slate-400 normal-case not-italic tracking-normal font-normal">
                    Zastosuje tylko pola z wpisanymi wartościami. Puste daty i wartości 0 nie nadpiszą danych zawodnika.
                  </div>
                  <button onClick={() => applyContractLookupVariant(contractLookupPlayer, variant)} className="w-full rounded bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-3 text-xs">
                    UŻYJ WARIANTU
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isCoachEditorOpen && selectedCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <div className="w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-lg border border-yellow-500/30 bg-slate-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-5 border-b border-white/10 pb-4">
              <div>
                <div className="text-xl text-yellow-400">EDYCJA TRENERA</div>
                <div className="text-[10px] text-slate-500">{selectedCoach.firstName} {selectedCoach.lastName}</div>
              </div>
              <button onClick={() => setIsCoachEditorOpen(false)} className="rounded bg-white/10 hover:bg-white/20 px-4 py-2 text-xs">ZAMKNIJ</button>
            </div>
            {renderCoachEditor(selectedCoach)}
          </div>
        </div>
      )}
    </div>
  );
};
