import React, { useState, useMemo } from 'react';
import ntBgImg from '../../Graphic/themes/national_teams_view.png';
import bojoImg from '../../Graphic/themes/bojo.png';
import saWorldBgImg from '../../Graphic/themes/innekluby.png';
import allTeamsBgImg from '../../Graphic/themes/allteams.png';
import allCupsBgImg from '../../Graphic/themes/allcups.png';
import { useGame } from '../../context/GameContext';
import { ViewState, NationalTeam, Player, PlayerPosition, PlayerAttributes } from '../../types';
import { RAW_CHAMPIONS_LEAGUE_CLUBS, generateEuropeanClubId } from '../../resources/static_db/clubs/ChampionsLeagueTeams';
import { RAW_EUROPA_LEAGUE_CLUBS, generateELClubId } from '../../resources/static_db/clubs/EuropeLeagueTeams';
import { RAW_CONFERENCE_LEAGUE_CLUBS, generateCONFClubId } from '../../resources/static_db/clubs/ConferenceLeagueTeams';
import { RAW_PL_CLUBS, generateClubId } from '../../resources/static_db/clubs/pl_clubs';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { CLUBS_SOUTH_AMERICA } from '../../resources/static_db/clubs/SouthamericanTeams';
import { generateSAClubId } from '../../resources/static_db/clubs/SouthamericanTeams';
import { CLUBS_AFRICAN, generateAfricanClubId } from '../../resources/static_db/clubs/african_teams';
import { MatchHistoryService } from '../../services/MatchHistoryService';
import { NT_SCHEDULE_BY_YEAR } from '../../resources/NationalTeamSchedule';
import { TacticRepository } from '../../resources/tactics_db';
import { CLUBS_ASIAN, generateAsianClubId } from '../../resources/static_db/clubs/asian_teams';
import { CLUBS_NORTH_AMERICA, generateNorthAmericaClubId } from '../../resources/static_db/clubs/northAME_teams';

const FLAG_COLUMNS = 5;

const GLASS_CARD = "bg-slate-950/20 border border-white/[0.07] shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[40px] relative overflow-hidden";
const GLOSS_LAYER = "absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none";
const MANAGER_HEADING_FONT = "font-black italic uppercase tracking-tighter";
const MANAGER_BUTTON_FONT = "font-black italic uppercase tracking-widest";

const FLAG_CODE: Record<string, string> = {
  ALB: 'al', AND: 'ad', ARM: 'am', AUT: 'at', AZE: 'az',
  BEL: 'be', BIA: 'by', BLR: 'by', BIH: 'ba', BUL: 'bg',
  CRO: 'hr', CYP: 'cy', CZE: 'cz', DEN: 'dk',
  ENG: 'gb-eng', ESP: 'es', EST: 'ee',
  FIN: 'fi', FRA: 'fr', FRO: 'fo',
  GEO: 'ge', GER: 'de', GIB: 'gi', GRE: 'gr',
  HUN: 'hu', IRL: 'ie', ISL: 'is', ISR: 'il', ITA: 'it',
  KAZ: 'kz', KOS: 'xk', LAT: 'lv', LIE: 'li', LTU: 'lt', LUX: 'lu',
  MDA: 'md', MKD: 'mk', MLT: 'mt', MNE: 'me',
  NED: 'nl', NIR: 'gb-nir', NOR: 'no',
  POL: 'pl', POR: 'pt', RUS: 'ru',
  SCO: 'gb-sct', SMR: 'sm', SRB: 'rs', SVK: 'sk', SVN: 'si',
  SWE: 'se', SUI: 'ch', TUR: 'tr', UKR: 'ua', WAL: 'gb-wls',
  ARG: 'ar', BRA: 'br', URU: 'uy', COL: 'co', ECU: 'ec',
  CHI: 'cl', PAR: 'py', PER: 'pe', BOL: 'bo', VEN: 've',
  KSA: 'sa', UAE: 'ae', JPN: 'jp',
  EGY: 'eg', RSA: 'za', TUN: 'tn', MAR: 'ma',
  USA: 'us', MEX: 'mx',
  AUS: 'au', CHN: 'cn', IRN: 'ir', KOR: 'kr',
  MAS: 'my', QAT: 'qa', ROU: 'ro', THA: 'th',
};

const COUNTRY_NAME: Record<string, string> = {
  ALB: 'Albania', AND: 'Andora', ARM: 'Armenia', AUT: 'Austria', AZE: 'Azerbejdżan',
  BEL: 'Belgia', BIA: 'Białoruś', BLR: 'Białoruś', BIH: 'Bośnia i Hercegowina', BUL: 'Bułgaria',
  CRO: 'Chorwacja', CYP: 'Cypr', CZE: 'Czechy', DEN: 'Dania',
  ENG: 'Anglia', ESP: 'Hiszpania', EST: 'Estonia',
  FIN: 'Finlandia', FRA: 'Francja', FRO: 'Wyspy Owcze',
  GEO: 'Gruzja', GER: 'Niemcy', GIB: 'Gibraltar', GRE: 'Grecja',
  HUN: 'Węgry', IRL: 'Irlandia', ISL: 'Islandia', ISR: 'Izrael', ITA: 'Włochy',
  KAZ: 'Kazachstan', KOS: 'Kosowo', LAT: 'Łotwa', LIE: 'Liechtenstein', LTU: 'Litwa', LUX: 'Luksemburg',
  MDA: 'Mołdawia', MKD: 'Macedonia Płn.', MLT: 'Malta', MNE: 'Czarnogóra',
  NED: 'Holandia', NIR: 'Irlandia Płn.', NOR: 'Norwegia',
  POL: 'Polska', POR: 'Portugalia', RUS: 'Rosja',
  SCO: 'Szkocja', SMR: 'San Marino', SRB: 'Serbia', SVK: 'Słowacja', SVN: 'Słowenia',
  SWE: 'Szwecja', SUI: 'Szwajcaria', TUR: 'Turcja', UKR: 'Ukraina', WAL: 'Walia',
  ARG: 'Argentyna', BRA: 'Brazylia', URU: 'Urugwaj', COL: 'Kolumbia', ECU: 'Ekwador',
  CHI: 'Chile', PAR: 'Paragwaj', PER: 'Peru', BOL: 'Boliwia', VEN: 'Wenezuela',
  KSA: 'Arabia Saudyjska', UAE: 'ZEA', JPN: 'Japonia',
  EGY: 'Egipt', RSA: 'RPA', TUN: 'Tunezja', MAR: 'Maroko',
  USA: 'USA', MEX: 'Meksyk',
  AUS: 'Australia', CHN: 'Chiny', IRN: 'Iran', KOR: 'Korea Płd.',
  MAS: 'Malezja', QAT: 'Katar', ROU: 'Rumunia', THA: 'Tajlandia',
};

const flagUrl = (code: string) =>
  `https://flagcdn.com/w40/${FLAG_CODE[code] ?? code.toLowerCase()}.png`;

const getCountryLabel = (code: string): string => COUNTRY_NAME[code] ?? code;

const hasCountryFlag = (code: string): boolean =>
  Boolean(FLAG_CODE[code] || code.length === 2);

interface ClubEntry {
  id: string;
  name: string;
  reputation: number;
  colors: string[];
  tier?: number;
}

function buildCountryClubMap(): Record<string, ClubEntry[]> {
  const map: Record<string, ClubEntry[]> = {};
  const seen = new Set<string>();

  const add = (country: string, entry: ClubEntry) => {
    const key = `${country}::${entry.name}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (!map[country]) map[country] = [];
    map[country].push(entry);
  };

  RAW_CHAMPIONS_LEAGUE_CLUBS.forEach(c => {
    add(c.country, { id: generateEuropeanClubId(c.name), name: c.name, reputation: c.reputation, colors: c.colors });
  });
  RAW_EUROPA_LEAGUE_CLUBS.forEach(c => {
    add(c.country, { id: generateELClubId(c.name), name: c.name, reputation: c.reputation, colors: c.colors });
  });
  RAW_CONFERENCE_LEAGUE_CLUBS.forEach(c => {
    add(c.country, { id: generateCONFClubId(c.name), name: c.name, reputation: c.reputation, colors: c.colors });
  });
  RAW_PL_CLUBS.forEach(c => {
    add('POL', { id: generateClubId(c.name), name: c.name, reputation: c.reputation, colors: c.colors, tier: c.tier });
  });

  Object.values(map).forEach(arr => arr.sort((a, b) => b.reputation - a.reputation));
  return map;
}

const COUNTRY_CLUB_MAP = buildCountryClubMap();

const buildWorldClubMap = (
  clubs: Array<{ name: string; country: string; reputation: number; colors: string[] }>,
  idGenerator: (name: string) => string
): Record<string, ClubEntry[]> => {
  const map: Record<string, ClubEntry[]> = {};

  clubs.forEach(club => {
    const id = idGenerator(club.name);
    if (!map[club.country]) map[club.country] = [];
    map[club.country].push({
      id,
      name: club.name,
      reputation: club.reputation,
      colors: club.colors
    });
  });

  Object.values(map).forEach(arr => arr.sort((a, b) => b.reputation - a.reputation));
  return map;
};

const getSortedCountryCodes = (clubMap: Record<string, ClubEntry[]>): string[] =>
  Object.keys(clubMap).sort((a, b) => getCountryLabel(a).localeCompare(getCountryLabel(b), 'pl'));

const SA_CLUB_MAP = buildWorldClubMap(CLUBS_SOUTH_AMERICA, generateSAClubId);
const AFRICA_CLUB_MAP = buildWorldClubMap(CLUBS_AFRICAN, generateAfricanClubId);
const ASIA_CLUB_MAP = buildWorldClubMap(CLUBS_ASIAN, generateAsianClubId);
const NORTH_AMERICA_CLUB_MAP = buildWorldClubMap(CLUBS_NORTH_AMERICA, generateNorthAmericaClubId);

const SA_COUNTRY_ORDER = getSortedCountryCodes(SA_CLUB_MAP);
const AFRICA_COUNTRY_ORDER = getSortedCountryCodes(AFRICA_CLUB_MAP);
const ASIA_COUNTRY_ORDER = getSortedCountryCodes(ASIA_CLUB_MAP);
const NORTH_AMERICA_COUNTRY_ORDER = getSortedCountryCodes(NORTH_AMERICA_CLUB_MAP);

const WORLD_REGIONS = [
  { key: 'SA', label: 'Ameryka Poludniowa' },
  { key: 'AFR', label: 'Afryka' },
  { key: 'ASIA', label: 'Azja' },
  { key: 'NA', label: 'Ameryka Polnocna' },
] as const;

type WorldRegionKey = typeof WORLD_REGIONS[number]['key'];

const ClubColorBadge: React.FC<{ club: ClubEntry }> = ({ club }) => {
  const logo = getClubLogo(club.id);
  if (logo) {
    return (
      <img
        src={logo}
        alt={club.name}
        className="w-10 h-10 object-contain shrink-0"
      />
    );
  }
  return (
    <div className="flex shrink-0 rounded overflow-hidden w-10 h-10 border border-white/10">
      <div className="flex-1" style={{ backgroundColor: club.colors[0] }} />
      <div className="flex-1" style={{ backgroundColor: club.colors[1] || '#222' }} />
    </div>
  );
};

const ClubRow: React.FC<{ club: ClubEntry; onSelect: () => void }> = ({ club, onSelect }) => (
  <button
    onClick={onSelect}
    className="group relative w-full h-[70px] rounded-xl overflow-hidden transition-all duration-200 border border-white/[0.04] hover:border-white/[0.12] mb-0.5 text-left"
  >
    <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: club.colors[0] }} />
    <div className="absolute right-2 top-[-4px] text-5xl font-black italic text-white/[0.035] select-none group-hover:text-white/[0.065] transition-colors leading-none tracking-tighter">
      {club.name.substring(0, 4).toUpperCase()}
    </div>
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      style={{ background: `linear-gradient(90deg, ${club.colors[0]}22, transparent)` }}
    />
    <div className="relative h-full flex items-center pl-5 pr-4 gap-4">
      <ClubColorBadge club={club} />
      <span className={`flex-1 text-base text-slate-300 group-hover:text-white transition-colors truncate ${MANAGER_HEADING_FONT}`}>
        {club.name}
      </span>
      <span className="text-[11px] text-slate-600 tabular-nums shrink-0 font-mono">rep. {club.reputation}</span>
      <span className="text-slate-700 group-hover:text-slate-400 transition-colors text-base shrink-0">›</span>
    </div>
  </button>
);

const WorldClubGrid: React.FC<{
  countryOrder: string[];
  clubMap: Record<string, ClubEntry[]>;
  onSelectClub: (clubId: string) => void;
}> = ({ countryOrder, clubMap, onSelectClub }) => (
  <div className="grid grid-cols-3 gap-6">
    {countryOrder.filter(code => clubMap[code]?.length > 0).map(code => (
      <div key={code}>
        <div className="flex items-center gap-3 mb-3">
          {hasCountryFlag(code) ? (
            <img src={flagUrl(code)} alt={getCountryLabel(code)} className="h-6 w-9 object-cover rounded shadow-lg" />
          ) : (
            <div className="h-6 min-w-9 px-2 rounded bg-white/10 border border-white/10 text-[9px] font-black flex items-center justify-center text-slate-300">
              {code}
            </div>
          )}
          <span className={`text-sm text-white ${MANAGER_HEADING_FONT}`}>{getCountryLabel(code)}</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[10px] text-slate-600 font-medium">{clubMap[code].length} klubów</span>
        </div>
        <div className="space-y-1">
          {clubMap[code].map((club, idx) => {
            const c0 = club.colors?.[0] ?? '#6366f1';
            const c1 = club.colors?.[1] ?? c0;
            const c2 = club.colors?.[2] ?? c1;
            return (
              <button
                key={club.id}
                onClick={() => onSelectClub(club.id)}
                className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.05] hover:border-white/[0.14] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-150"
              >
                <span className="w-4 text-[10px] font-black text-slate-700 group-hover:text-slate-500 transition-colors text-right shrink-0">{idx + 1}</span>
                <div
                  className="w-9 h-7 rounded-md shrink-0 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${c0} 0%, ${c0} 50%, ${c1} 50%, ${c1} 100%)`, border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="w-full h-full" style={{ background: `linear-gradient(to bottom, ${c2}22, transparent)` }} />
                </div>
                <span className={`flex-1 text-[11px] text-slate-200 group-hover:text-white transition-colors text-left truncate ${MANAGER_HEADING_FONT}`}>{club.name}</span>
                <span className="text-slate-700 group-hover:text-slate-400 transition-colors text-xs shrink-0">›</span>
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

// ─── REPREZENTACJE ───────────────────────────────────────────────────────────

const CONTINENTS = [
  { key: 'RANKING',       label: 'Ranking' },
  { key: 'Europe',        label: 'Europa' },
  { key: 'Africa',        label: 'Afryka' },
  { key: 'South America', label: 'Ameryka Pd.' },
  { key: 'North America', label: 'Ameryka Śr i Półn.' },
  { key: 'Asia',          label: 'Azja' },
  { key: 'Oceania',       label: 'Oceania' },
];

const TIER_BADGE: Record<number, string> = {
  1: 'text-amber-400 bg-amber-400/10 border border-amber-400/30',
  2: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/30',
  3: 'text-sky-400 bg-sky-400/10 border border-sky-400/30',
  4: 'text-slate-300 bg-white/[0.06] border border-white/[0.12]',
  5: 'text-slate-500 bg-white/[0.03] border border-white/[0.07]',
};

const POS_LABEL: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]:  'BR',
  [PlayerPosition.DEF]: 'OBR',
  [PlayerPosition.MID]: 'POL',
  [PlayerPosition.FWD]: 'NAP',
};

const POS_COLOR: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]:  'text-yellow-400 bg-yellow-400/10',
  [PlayerPosition.DEF]: 'text-blue-400 bg-blue-400/10',
  [PlayerPosition.MID]: 'text-green-400 bg-green-400/10',
  [PlayerPosition.FWD]: 'text-red-400 bg-red-400/10',
};

const repColor = (rep: number): string => {
  if (rep >= 16) return 'text-yellow-400';
  if (rep >= 11) return 'text-green-400';
  if (rep >= 6)  return 'text-blue-400';
  return 'text-slate-500';
};

const tierStars = (tier: number): string => '★'.repeat(Math.max(0, 6 - tier)) + '☆'.repeat(Math.min(5, tier - 1));

const EMOJI_FONT_STACK = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

const flagEmojiFromIso2 = (code: string): string => {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return '\u{1F3F3}';
  return String.fromCodePoint(
    ...normalized.split('').map(char => 0x1F1E6 + (char.charCodeAt(0) - 65))
  );
};

const subdivisionFlagEmoji = (tags: string): string => `\u{1F3F4}${tags}\u{E007F}`;

const SPECIAL_NT_FLAGS: Record<string, string> = {
  Anglia: subdivisionFlagEmoji('\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}'),
  Szkocja: subdivisionFlagEmoji('\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}'),
  Walia: subdivisionFlagEmoji('\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}'),
};

/*
const NT_FLAG_CODE_MAP: Record<string, string> = {
  Albania: 'AL', Andora: 'AD', Armenia: 'AM', Austria: 'AT', AzerbejdÅ¼an: 'AZ',
  Belgia: 'BE', BiaÅ‚oruÅ›: 'BY', 'BoÅ›nia i Hercegowina': 'BA', BuÅ‚garia: 'BG', Chorwacja: 'HR',
  Cypr: 'CY', CzarnogÃ³ra: 'ME', Czechy: 'CZ', Dania: 'DK', Estonia: 'EE',
  Finlandia: 'FI', Francja: 'FR', Gibraltar: 'GI', Grecja: 'GR', Gruzja: 'GE',
  Hiszpania: 'ES', Holandia: 'NL', Irlandia: 'IE', Islandia: 'IS', Izrael: 'IL',
  Kazachstan: 'KZ', Kosovo: 'XK', Liechtenstein: 'LI', Litwa: 'LT', Luksemburg: 'LU',
  'Åotwa': 'LV', 'Macedonia PÃ³Å‚nocna': 'MK', Malta: 'MT', 'MoÅ‚dawia': 'MD', Niemcy: 'DE',
  Norwegia: 'NO', Polska: 'PL', Portugalia: 'PT', Rosja: 'RU', Rumunia: 'RO',
  'San Marino': 'SM', Serbia: 'RS', 'SÅ‚owacja': 'SK', 'SÅ‚owenia': 'SI',
  Szwajcaria: 'CH', Szwecja: 'SE', Turcja: 'TR', Ukraina: 'UA',
  'WÄ™gry': 'HU', 'WÅ‚ochy': 'IT', 'Wyspy Owcze': 'FO',
  Algieria: 'DZ', Angola: 'AO', Benin: 'BJ', Botswana: 'BW', 'Burkina Faso': 'BF',
  Burundi: 'BI', Czad: 'TD', 'DÅ¼ibuti': 'DJ', Egipt: 'EG', Erytrea: 'ER',
  Eswatini: 'SZ', Etiopia: 'ET', Gabon: 'GA', Gambia: 'GM', Ghana: 'GH',
  Gwinea: 'GN', 'Gwinea Bissau': 'GW', 'Gwinea RÃ³wnikowa': 'GQ', Kamerun: 'CM', Kenia: 'KE',
  Komory: 'KM', Kongo: 'CG', 'Demokratyczna Republika Konga': 'CD', Lesotho: 'LS', Liberia: 'LR',
  Libia: 'LY', Madagaskar: 'MG', Malawi: 'MW', Mali: 'ML', Maroko: 'MA',
  Mauretania: 'MR', Mauritius: 'MU', Mozambik: 'MZ', Namibia: 'NA', Niger: 'NE',
  Nigeria: 'NG', 'Republika PoÅ‚udniowej Afryki': 'ZA', 'Republika ÅšrodkowoafrykaÅ„ska': 'CF', Rwanda: 'RW',
  Senegal: 'SN', Seszele: 'SC', 'Sierra Leone': 'SL', Somalia: 'SO', Sudan: 'SD',
  'Sudan PoÅ‚udniowy': 'SS', 'Wyspy ÅšwiÄ™tego Tomasza i KsiÄ…Å¼Ä™ca': 'ST', Tanzania: 'TZ', Togo: 'TG',
  Tunezja: 'TN', Uganda: 'UG', 'WybrzeÅ¼e KoÅ›ci SÅ‚oniowej': 'CI', 'Wyspy Zielonego PrzylÄ…dka': 'CV',
  Zambia: 'ZM', Zimbabwe: 'ZW',
  Argentyna: 'AR', Brazylia: 'BR', Urugwaj: 'UY', Kolumbia: 'CO', Chile: 'CL',
  Peru: 'PE', Ekwador: 'EC', Paragwaj: 'PY', Boliwia: 'BO', Wenezuela: 'VE',
  'Stany Zjednoczone': 'US', Meksyk: 'MX', Kanada: 'CA', Kostaryka: 'CR', Panama: 'PA',
  Honduras: 'HN', Salwador: 'SV', Gwatemala: 'GT', Nikaragua: 'NI', Belize: 'BZ',
  Jamajka: 'JM', 'Trynidad i Tobago': 'TT', Haiti: 'HT', 'CuraÃ§ao': 'CW', Surinam: 'SR',
  Kuba: 'CU', 'Republika Dominikany': 'DO', 'Antigua i Barbuda': 'AG', Aruba: 'AW',
  Bahamy: 'BS', Barbados: 'BB', Bermudy: 'BM', Dominika: 'DM', Grenada: 'GD',
  Kajmany: 'KY', Montserrat: 'MS', 'Saint Kitts i Nevis': 'KN', 'Saint Lucia': 'LC',
  'Saint Vincent i Grenadyny': 'VC', 'Turks i Caicos': 'TC',
  'Arabia Saudyjska': 'SA', Bahrajn: 'BH', Irak: 'IQ', Iran: 'IR', Jemen: 'YE',
  Jordania: 'JO', Katar: 'QA', Kuwejt: 'KW', Liban: 'LB', Oman: 'OM',
  Palestyna: 'PS', Syria: 'SY', ZEA: 'AE', Australia: 'AU', Chiny: 'CN',
  Filipiny: 'PH', Indonezja: 'ID', Japonia: 'JP', 'KambodÅ¼a': 'KH', 'Korea PÅD': 'KR',
  'Korea PÅN': 'KP', Laos: 'LA', Malezja: 'MY', Macau: 'MO', Mjanma: 'MM',
  Singapur: 'SG', Tajlandia: 'TH', 'Timor Wschodni': 'TL', Wietnam: 'VN', Afganistan: 'AF',
  Bangladesz: 'BD', Bhutan: 'BT', Hongkong: 'HK', Indie: 'IN', Kirgistan: 'KG',
  Malediwy: 'MV', Mongolia: 'MN', Nepal: 'NP', Pakistan: 'PK', 'Sri Lanka': 'LK',
  'TadÅ¼ykistan': 'TJ', Turkmenistan: 'TM', Uzbekistan: 'UZ',
  'Nowa Zelandia': 'NZ', 'FidÅ¼i': 'FJ', 'Wyspy Salomona': 'SB', 'Papua-Nowa Gwinea': 'PG',
  Tahiti: 'PF', 'Nowa Kaledonia': 'NC', Vanuatu: 'VU', Samoa: 'WS',
  'Samoa AmerykaÅ„skie': 'AS', Tonga: 'TO', 'Wyspy Cooka': 'CK',
};
*/

const NT_FLAG_CODE_MAP_SAFE: Record<string, string> = {
  'Albania': 'AL', 'Andora': 'AD', 'Armenia': 'AM', 'Austria': 'AT', 'Azerbejdżan': 'AZ',
  'Belgia': 'BE', 'Białoruś': 'BY', 'Bośnia i Hercegowina': 'BA', 'Bułgaria': 'BG', 'Chorwacja': 'HR',
  'Cypr': 'CY', 'Czarnogóra': 'ME', 'Czechy': 'CZ', 'Dania': 'DK', 'Estonia': 'EE',
  'Finlandia': 'FI', 'Francja': 'FR', 'Gibraltar': 'GI', 'Grecja': 'GR', 'Gruzja': 'GE',
  'Hiszpania': 'ES', 'Holandia': 'NL', 'Irlandia': 'IE', 'Islandia': 'IS', 'Izrael': 'IL',
  'Kazachstan': 'KZ', 'Kosovo': 'XK', 'Liechtenstein': 'LI', 'Litwa': 'LT', 'Luksemburg': 'LU',
  'Łotwa': 'LV', 'Macedonia Północna': 'MK', 'Malta': 'MT', 'Mołdawia': 'MD', 'Niemcy': 'DE',
  'Norwegia': 'NO', 'Polska': 'PL', 'Portugalia': 'PT', 'Rosja': 'RU', 'Rumunia': 'RO',
  'San Marino': 'SM', 'Serbia': 'RS', 'Słowacja': 'SK', 'Słowenia': 'SI',
  'Szwajcaria': 'CH', 'Szwecja': 'SE', 'Turcja': 'TR', 'Ukraina': 'UA',
  'Węgry': 'HU', 'Włochy': 'IT', 'Wyspy Owcze': 'FO',
  'Algieria': 'DZ', 'Angola': 'AO', 'Benin': 'BJ', 'Botswana': 'BW', 'Burkina Faso': 'BF',
  'Burundi': 'BI', 'Czad': 'TD', 'Dżibuti': 'DJ', 'Egipt': 'EG', 'Erytrea': 'ER',
  'Eswatini': 'SZ', 'Etiopia': 'ET', 'Gabon': 'GA', 'Gambia': 'GM', 'Ghana': 'GH',
  'Gwinea': 'GN', 'Gwinea Bissau': 'GW', 'Gwinea Równikowa': 'GQ', 'Kamerun': 'CM', 'Kenia': 'KE',
  'Komory': 'KM', 'Kongo': 'CG', 'Demokratyczna Republika Konga': 'CD', 'Lesotho': 'LS', 'Liberia': 'LR',
  'Libia': 'LY', 'Madagaskar': 'MG', 'Malawi': 'MW', 'Mali': 'ML', 'Maroko': 'MA',
  'Mauretania': 'MR', 'Mauritius': 'MU', 'Mozambik': 'MZ', 'Namibia': 'NA', 'Niger': 'NE',
  'Nigeria': 'NG', 'Republika Południowej Afryki': 'ZA', 'Republika Środkowoafrykańska': 'CF', 'Rwanda': 'RW',
  'Senegal': 'SN', 'Seszele': 'SC', 'Sierra Leone': 'SL', 'Somalia': 'SO', 'Sudan': 'SD',
  'Sudan Południowy': 'SS', 'Wyspy Świętego Tomasza i Książęca': 'ST', 'Tanzania': 'TZ', 'Togo': 'TG',
  'Tunezja': 'TN', 'Uganda': 'UG', 'Wybrzeże Kości Słoniowej': 'CI', 'Wyspy Zielonego Przylądka': 'CV',
  'Zambia': 'ZM', 'Zimbabwe': 'ZW',
  'Argentyna': 'AR', 'Brazylia': 'BR', 'Urugwaj': 'UY', 'Kolumbia': 'CO', 'Chile': 'CL',
  'Peru': 'PE', 'Ekwador': 'EC', 'Paragwaj': 'PY', 'Boliwia': 'BO', 'Wenezuela': 'VE',
  'Stany Zjednoczone': 'US', 'Meksyk': 'MX', 'Kanada': 'CA', 'Kostaryka': 'CR', 'Panama': 'PA',
  'Honduras': 'HN', 'Salwador': 'SV', 'Gwatemala': 'GT', 'Nikaragua': 'NI', 'Belize': 'BZ',
  'Jamajka': 'JM', 'Trynidad i Tobago': 'TT', 'Haiti': 'HT', 'Curaçao': 'CW', 'Surinam': 'SR',
  'Kuba': 'CU', 'Republika Dominikany': 'DO', 'Antigua i Barbuda': 'AG', 'Aruba': 'AW',
  'Bahamy': 'BS', 'Barbados': 'BB', 'Bermudy': 'BM', 'Dominika': 'DM', 'Grenada': 'GD',
  'Kajmany': 'KY', 'Montserrat': 'MS', 'Saint Kitts i Nevis': 'KN', 'Saint Lucia': 'LC',
  'Saint Vincent i Grenadyny': 'VC', 'Turks i Caicos': 'TC',
  'Arabia Saudyjska': 'SA', 'Bahrajn': 'BH', 'Irak': 'IQ', 'Iran': 'IR', 'Jemen': 'YE',
  'Jordania': 'JO', 'Katar': 'QA', 'Kuwejt': 'KW', 'Liban': 'LB', 'Oman': 'OM',
  'Palestyna': 'PS', 'Syria': 'SY', 'ZEA': 'AE', 'Australia': 'AU', 'Chiny': 'CN',
  'Filipiny': 'PH', 'Indonezja': 'ID', 'Japonia': 'JP', 'Kambodża': 'KH', 'Korea PŁD': 'KR',
  'Korea PŁN': 'KP', 'Laos': 'LA', 'Malezja': 'MY', 'Macau': 'MO', 'Mjanma': 'MM',
  'Singapur': 'SG', 'Tajlandia': 'TH', 'Timor Wschodni': 'TL', 'Wietnam': 'VN', 'Afganistan': 'AF',
  'Bangladesz': 'BD', 'Bhutan': 'BT', 'Hongkong': 'HK', 'Indie': 'IN', 'Kirgistan': 'KG',
  'Malediwy': 'MV', 'Mongolia': 'MN', 'Nepal': 'NP', 'Pakistan': 'PK', 'Sri Lanka': 'LK',
  'Tadżykistan': 'TJ', 'Turkmenistan': 'TM', 'Uzbekistan': 'UZ',
  'Nowa Zelandia': 'NZ', 'Fidżi': 'FJ', 'Wyspy Salomona': 'SB', 'Papua-Nowa Gwinea': 'PG',
  'Tahiti': 'PF', 'Nowa Kaledonia': 'NC', 'Vanuatu': 'VU', 'Samoa': 'WS',
  'Samoa Amerykańskie': 'AS', 'Tonga': 'TO', 'Wyspy Cooka': 'CK',
};

const getNTFlagEmoji = (name: string): string =>
  SPECIAL_NT_FLAGS[name] ?? (NT_FLAG_CODE_MAP_SAFE[name] ? flagEmojiFromIso2(NT_FLAG_CODE_MAP_SAFE[name]) : '\u{1F3F3}');

const getNTFlagImageCode = (name: string): string | null => {
  if (name === 'Anglia') return 'gb-eng';
  if (name === 'Szkocja') return 'gb-sct';
  if (name === 'Walia') return 'gb-wls';
  return NT_FLAG_CODE_MAP_SAFE[name]?.toLowerCase() ?? null;
};

const NTFlagBadge: React.FC<{ teamName: string; className?: string }> = ({ teamName, className = '' }) => {
  const code = getNTFlagImageCode(teamName);
  if (!code) {
    return (
      <div className={`flex items-center justify-center rounded-md border border-white/10 bg-white/5 text-xs font-black text-slate-200 ${className}`}>
        {teamName.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={teamName}
      className={`object-cover rounded-md border border-white/10 bg-white/5 ${className}`}
    />
  );
};

const NTCard: React.FC<{ team: NationalTeam; coachName: string; onSelect: () => void; showTier?: boolean; rank?: number }> = ({ team, onSelect, showTier, rank }) => (
  <button
    onClick={onSelect}
    className="group relative w-full rounded-xl overflow-hidden transition-all duration-200 border border-white/[0.05] hover:border-white/[0.15] mb-1 text-left"
    style={{ background: `linear-gradient(90deg, ${team.colorsHex[0]}18, transparent 60%)` }}
  >
    <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: team.colorsHex[0] }} />
    <div className="absolute right-2 top-[-4px] text-6xl font-black italic text-white/[0.03] select-none group-hover:text-white/[0.06] transition-colors leading-none tracking-tighter">
      {team.name.substring(0, 4).toUpperCase()}
    </div>
    <div className="relative h-[62px] flex items-center pl-6 pr-5 gap-4">
      {rank !== undefined && (
        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/20 text-sm font-black tabular-nums text-white shrink-0">
          {rank}
        </span>
      )}
      <NTFlagBadge teamName={team.name} className="w-10 h-10" />
      <span className="flex-1 text-lg font-black italic uppercase tracking-wide text-white truncate">
        {team.name}
      </span>
      {showTier && (
        <span className={`text-xs font-black uppercase px-3 py-1 rounded shrink-0 ${TIER_BADGE[team.tier] ?? TIER_BADGE[5]}`}>
          Tier {team.tier}
        </span>
      )}
      <span className="text-white/30 group-hover:text-white/70 transition-colors text-lg shrink-0">›</span>
    </div>
  </button>
);

const ratingColor = (r: number): string => {
  if (r >= 80) return 'text-amber-400';
  if (r >= 65) return 'text-emerald-400';
  if (r >= 50) return 'text-sky-400';
  return 'text-white';
};

const ratingBg = (r: number): string => {
  if (r >= 80) return 'bg-amber-400/10 border-amber-400/20';
  if (r >= 65) return 'bg-emerald-400/10 border-emerald-400/20';
  if (r >= 50) return 'bg-sky-400/10 border-sky-400/20';
  return 'bg-slate-700/20 border-white/[0.05]';
};

const avgRating = (players: Player[]): number =>
  players.length === 0 ? 0 : Math.round(players.reduce((s, p) => s + p.overallRating, 0) / players.length);

const NT_FLAG_MAP: Record<string, string> = {
  // Europa
  "Albania": "🇦🇱", "Andora": "🇦🇩", "Armenia": "🇦🇲", "Austria": "🇦🇹", "Azerbejdżan": "🇦🇿",
  "Belgia": "🇧🇪", "Białoruś": "🇧🇾", "Bośnia i Hercegowina": "🇧🇦", "Bułgaria": "🇧🇬", "Chorwacja": "🇭🇷",
  "Cypr": "🇨🇾", "Czarnogóra": "🇲🇪", "Czechy": "🇨🇿", "Dania": "🇩🇰", "Estonia": "🇪🇪",
  "Finlandia": "🇫🇮", "Francja": "🇫🇷", "Gibraltar": "🇬🇮", "Grecja": "🇬🇷", "Gruzja": "🇬🇪",
  "Hiszpania": "🇪🇸", "Holandia": "🇳🇱", "Irlandia": "🇮🇪", "Islandia": "🇮🇸", "Izrael": "🇮🇱",
  "Kazachstan": "🇰🇿", "Kosovo": "🇽🇰", "Liechtenstein": "🇱🇮", "Litwa": "🇱🇹", "Luksemburg": "🇱🇺",
  "Łotwa": "🇱🇻", "Macedonia Północna": "🇲🇰", "Malta": "🇲🇹", "Mołdawia": "🇲🇩", "Niemcy": "🇩🇪",
  "Norwegia": "🇳🇴", "Polska": "🇵🇱", "Portugalia": "🇵🇹", "Rosja": "🇷🇺", "Rumunia": "🇷🇴",
  "San Marino": "🇸🇲", "Serbia": "🇷🇸", "Słowacja": "🇸🇰", "Słowenia": "🇸🇮", "Szkocja": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Szwajcaria": "🇨🇭", "Szwecja": "🇸🇪", "Turcja": "🇹🇷", "Ukraina": "🇺🇦", "Walia": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  "Węgry": "🇭🇺", "Włochy": "🇮🇹", "Wyspy Owcze": "🇫🇴", "Anglia": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  // Afryka
  "Algieria": "🇩🇿", "Angola": "🇦🇴", "Benin": "🇧🇯", "Botswana": "🇧🇼", "Burkina Faso": "🇧🇫",
  "Burundi": "🇧🇮", "Czad": "🇹🇩", "Dżibuti": "🇩🇯", "Egipt": "🇪🇬", "Erytrea": "🇪🇷",
  "Eswatini": "🇸🇿", "Etiopia": "🇪🇹", "Gabon": "🇬🇦", "Gambia": "🇬🇲", "Ghana": "🇬🇭",
  "Gwinea": "🇬🇳", "Gwinea Bissau": "🇬🇼", "Gwinea Równikowa": "🇬🇶", "Kamerun": "🇨🇲", "Kenia": "🇰🇪",
  "Komory": "🇰🇲", "Kongo": "🇨🇬", "Demokratyczna Republika Konga": "🇨🇩", "Lesotho": "🇱🇸", "Liberia": "🇱🇷",
  "Libia": "🇱🇾", "Madagaskar": "🇲🇬", "Malawi": "🇲🇼", "Mali": "🇲🇱", "Maroko": "🇲🇦",
  "Mauretania": "🇲🇷", "Mauritius": "🇲🇺", "Mozambik": "🇲🇿", "Namibia": "🇳🇦", "Niger": "🇳🇪",
  "Nigeria": "🇳🇬", "Republika Południowej Afryki": "🇿🇦", "Republika Środkowoafrykańska": "🇨🇫", "Rwanda": "🇷🇼",
  "Senegal": "🇸🇳", "Seszele": "🇸🇨", "Sierra Leone": "🇸🇱", "Somalia": "🇸🇴", "Sudan": "🇸🇩",
  "Sudan Południowy": "🇸🇸", "Wyspy Świętego Tomasza i Książęca": "🇸🇹", "Tanzania": "🇹🇿", "Togo": "🇹🇬",
  "Tunezja": "🇹🇳", "Uganda": "🇺🇬", "Wybrzeże Kości Słoniowej": "🇨🇮", "Wyspy Zielonego Przylądka": "🇨🇻",
  "Zambia": "🇿🇲", "Zimbabwe": "🇿🇼",
  // Ameryka Południowa
  "Argentyna": "🇦🇷", "Brazylia": "🇧🇷", "Urugwaj": "🇺🇾", "Kolumbia": "🇨🇴", "Chile": "🇨🇱",
  "Peru": "🇵🇪", "Ekwador": "🇪🇨", "Paragwaj": "🇵🇾", "Boliwia": "🇧🇴", "Wenezuela": "🇻🇪",
  // CONCACAF
  "Stany Zjednoczone": "🇺🇸", "Meksyk": "🇲🇽", "Kanada": "🇨🇦", "Kostaryka": "🇨🇷", "Panama": "🇵🇦",
  "Honduras": "🇭🇳", "Salwador": "🇸🇻", "Gwatemala": "🇬🇹", "Nikaragua": "🇳🇮", "Belize": "🇧🇿",
  "Jamajka": "🇯🇲", "Trynidad i Tobago": "🇹🇹", "Haiti": "🇭🇹", "Curaçao": "🇨🇼", "Surinam": "🇸🇷",
  "Kuba": "🇨🇺", "Republika Dominikany": "🇩🇴", "Antigua i Barbuda": "🇦🇬", "Aruba": "🇦🇼",
  "Bahamy": "🇧🇸", "Barbados": "🇧🇧", "Bermudy": "🇧🇲", "Dominika": "🇩🇲", "Grenada": "🇬🇩",
  "Kajmany": "🇰🇾", "Montserrat": "🇲🇸", "Saint Kitts i Nevis": "🇰🇳", "Saint Lucia": "🇱🇨",
  "Saint Vincent i Grenadyny": "🇻🇨", "Turks i Caicos": "🇹🇨",
  // Azja
  "Arabia Saudyjska": "🇸🇦", "Bahrajn": "🇧🇭", "Irak": "🇮🇶", "Iran": "🇮🇷", "Jemen": "🇾🇪",
  "Jordania": "🇯🇴", "Katar": "🇶🇦", "Kuwejt": "🇰🇼", "Liban": "🇱🇧", "Oman": "🇴🇲",
  "Palestyna": "🇵🇸", "Syria": "🇸🇾", "ZEA": "🇦🇪", "Australia": "🇦🇺", "Chiny": "🇨🇳",
  "Filipiny": "🇵🇭", "Indonezja": "🇮🇩", "Japonia": "🇯🇵", "Kambodża": "🇰🇭", "Korea PŁD": "🇰🇷",
  "Korea PŁN": "🇰🇵", "Laos": "🇱🇦", "Malezja": "🇲🇾", "Macau": "🇲🇴", "Mjanma": "🇲🇲",
  "Singapur": "🇸🇬", "Tajlandia": "🇹🇭", "Timor Wschodni": "🇹🇱", "Wietnam": "🇻🇳", "Afganistan": "🇦🇫",
  "Bangladesz": "🇧🇩", "Bhutan": "🇧🇹", "Hongkong": "🇭🇰", "Indie": "🇮🇳", "Kirgistan": "🇰🇬",
  "Malediwy": "🇲🇻", "Mongolia": "🇲🇳", "Nepal": "🇳🇵", "Pakistan": "🇵🇰", "Sri Lanka": "🇱🇰",
  "Tadżykistan": "🇹🇯", "Turkmenistan": "🇹🇲", "Uzbekistan": "🇺🇿",
  // Oceania
  "Nowa Zelandia": "🇳🇿", "Fidżi": "🇫🇯", "Wyspy Salomona": "🇸🇧", "Papua-Nowa Gwinea": "🇵🇬",
  "Tahiti": "🇵🇫", "Nowa Kaledonia": "🇳🇨", "Vanuatu": "🇻🇺", "Samoa": "🇼🇸",
  "Samoa Amerykańskie": "🇦🇸", "Tonga": "🇹🇴", "Wyspy Cooka": "🇨🇰",
};

const getNTFlag = (name: string): string => NT_FLAG_MAP[name] ?? '🏳';

type NTScheduleFilter = 'upcoming' | 'played' | 'all';

interface TeamScheduleItem {
  id: string;
  date: Date;
  dateLabel: string;
  home: string;
  away: string;
  competitionLabel: string;
  group?: string;
  result?: {
    homeGoals: number;
    awayGoals: number;
  };
  played: boolean;
}

const NT_MONTH_SHORT = ['STY', 'LUT', 'MAR', 'KWI', 'MAJ', 'CZE', 'LIP', 'SIE', 'WRZ', 'PAŹ', 'LIS', 'GRU'];

interface TacticalLineupSlot {
  slot: {
    index: number;
    role: PlayerPosition;
    x: number;
    y: number;
  };
  player: Player | null;
}

const TacticalKitIcon: React.FC<{
  primary: string;
  secondary: string;
  trim: string;
  shorts: string;
  label: string;
}> = ({ primary, secondary, trim, shorts, label }) => {
  const shirtText = primary.toLowerCase() === '#ffffff' || primary.toLowerCase() === '#f8fafc' ? '#0f172a' : '#ffffff';

  return (
    <div className="relative flex flex-col items-center">
        <div className="relative w-[22px] h-[22px] rounded-xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/12 to-transparent z-10 pointer-events-none" />
          <svg viewBox="0 0 24 24" className="absolute inset-[2px] w-[18px] h-[18px] drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)]">
            <path d="M7 2L2 5v4l3 1v10h14V10l3-1V5l-5-3-2 2-2-2-2 2-2-2z" fill={primary} />
            <path d="M12 4L10 6L12 8L14 6L12 4Z" fill={secondary} fillOpacity="0.8" />
            <path d="M7 2L2 5v4l3 1V6.5L8.3 5l1.7 2.3h4L15.7 5 19 6.5V10l3-1V5l-5-3-2 2-2-2-2 2-2-2z" fill={secondary} fillOpacity="0.35" />
            <path d="M12 7.2v11.8" stroke={trim} strokeWidth="1.3" strokeOpacity="0.85" />
            <text x="12" y="15.6" textAnchor="middle" fontSize="3.6" fontWeight="900" fontStyle="italic" fill={shirtText}>
              {label}
            </text>
          </svg>
          <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45 pointer-events-none" />
        </div>
        <svg viewBox="0 0 28 18" className="-mt-1 w-[14px] h-[9px] drop-shadow-[0_3px_4px_rgba(0,0,0,0.35)]">
          <path d="M4 2h20l2 4-3 10H16l-2-6-2 6H5L2 6z" fill={shorts} stroke={trim} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M14 3v12" stroke={trim} strokeWidth="1.1" strokeOpacity="0.65" />
        </svg>
    </div>
  );
};

const NTSquadView: React.FC<{ team: NationalTeam; coachName: string; playerById: Record<string, Player>; clubById: Record<string, string>; nationalTeamIdByName: Record<string, string>; currentDate: Date; onPlayerClick: (id: string) => void }> = ({ team, coachName, playerById, clubById, nationalTeamIdByName, currentDate, onPlayerClick }) => {
  const squad = team.squadPlayerIds.map(id => playerById[id]).filter(Boolean) as Player[];

  const POS_ORDER: Record<PlayerPosition, number> = {
    [PlayerPosition.GK]: 0, [PlayerPosition.DEF]: 1, [PlayerPosition.MID]: 2, [PlayerPosition.FWD]: 3,
  };
  const sorted = [...squad].sort((a, b) => {
    const d = POS_ORDER[a.position] - POS_ORDER[b.position];
    return d !== 0 ? d : b.overallRating - a.overallRating;
  });

  const avg = avgRating(squad);
  const accent = team.colorsHex[0] || '#6366f1';
  const tactic = team.tacticId ? TacticRepository.getById(team.tacticId) : null;

  const POS_ROW_BG: Record<PlayerPosition, string> = {
    [PlayerPosition.GK]:  'bg-yellow-500/[0.08]',
    [PlayerPosition.DEF]: 'bg-blue-500/[0.07]',
    [PlayerPosition.MID]: 'bg-emerald-500/[0.07]',
    [PlayerPosition.FWD]: 'bg-red-500/[0.08]',
  };

  const POS_BADGE: Record<PlayerPosition, string> = {
    [PlayerPosition.GK]:  'text-yellow-400 bg-yellow-400/15 border border-yellow-400/30',
    [PlayerPosition.DEF]: 'text-blue-400 bg-blue-400/15 border border-blue-400/30',
    [PlayerPosition.MID]: 'text-emerald-400 bg-emerald-400/15 border border-emerald-400/30',
    [PlayerPosition.FWD]: 'text-red-400 bg-red-400/15 border border-red-400/30',
  };

  const POS_SHORT: Record<PlayerPosition, string> = {
    [PlayerPosition.GK]: 'BR', [PlayerPosition.DEF]: 'OBR', [PlayerPosition.MID]: 'POL', [PlayerPosition.FWD]: 'NAP',
  };

  const attrColor = (v: number): string => {
    if (v >= 80) return 'text-amber-400 font-black italic';
    if (v >= 65) return 'text-emerald-400 font-black italic';
    if (v >= 50) return 'text-sky-400 font-black italic';
    return 'text-white font-black italic';
  };

  const GRID = '52px 1fr minmax(0,140px) 36px 36px 36px 36px 36px 36px 36px 36px 36px 36px 36px 36px 36px 36px 52px';

  const T = 'font-black italic uppercase tracking-wide text-white';
  const [scheduleFilter, setScheduleFilter] = useState<NTScheduleFilter>('upcoming');
  const positionCounts = squad.reduce<Record<PlayerPosition, number>>((acc, player) => {
    acc[player.position] += 1;
    return acc;
  }, {
    [PlayerPosition.GK]: 0,
    [PlayerPosition.DEF]: 0,
    [PlayerPosition.MID]: 0,
    [PlayerPosition.FWD]: 0,
  });
  const injuredCount = squad.filter(player => player.health.status === 'INJURED').length;
  const availableCount = squad.length - injuredCount;
  const leaders = [...squad].sort((a, b) => b.overallRating - a.overallRating).slice(0, 5);
  const attributeProfile = [
    { label: 'Tempo', short: 'PAC', value: Math.round(squad.reduce((sum, player) => sum + player.attributes.pace, 0) / Math.max(squad.length, 1)) },
    { label: 'Atak', short: 'ATT', value: Math.round(squad.reduce((sum, player) => sum + player.attributes.attacking, 0) / Math.max(squad.length, 1)) },
    { label: 'Obrona', short: 'DEF', value: Math.round(squad.reduce((sum, player) => sum + player.attributes.defending, 0) / Math.max(squad.length, 1)) },
    { label: 'Podania', short: 'PAS', value: Math.round(squad.reduce((sum, player) => sum + player.attributes.passing, 0) / Math.max(squad.length, 1)) },
    { label: 'Technika', short: 'TEC', value: Math.round(squad.reduce((sum, player) => sum + player.attributes.technique, 0) / Math.max(squad.length, 1)) },
  ];
  const squadSections = [
    { label: 'Bramkarze', short: 'BR', value: positionCounts[PlayerPosition.GK], tone: 'text-yellow-400', bg: 'from-yellow-500/20 to-transparent' },
    { label: 'Obrońcy', short: 'OBR', value: positionCounts[PlayerPosition.DEF], tone: 'text-blue-400', bg: 'from-blue-500/20 to-transparent' },
    { label: 'Pomocnicy', short: 'POL', value: positionCounts[PlayerPosition.MID], tone: 'text-emerald-400', bg: 'from-emerald-500/20 to-transparent' },
    { label: 'Napastnicy', short: 'NAP', value: positionCounts[PlayerPosition.FWD], tone: 'text-red-400', bg: 'from-red-500/20 to-transparent' },
  ];
  const tacticalLineup = useMemo<TacticalLineupSlot[]>(() => {
    if (!tactic) return [];

    const pools: Record<PlayerPosition, Player[]> = {
      [PlayerPosition.GK]: squad.filter(player => player.position === PlayerPosition.GK).sort((a, b) => b.overallRating - a.overallRating),
      [PlayerPosition.DEF]: squad.filter(player => player.position === PlayerPosition.DEF).sort((a, b) => b.overallRating - a.overallRating),
      [PlayerPosition.MID]: squad.filter(player => player.position === PlayerPosition.MID).sort((a, b) => b.overallRating - a.overallRating),
      [PlayerPosition.FWD]: squad.filter(player => player.position === PlayerPosition.FWD).sort((a, b) => b.overallRating - a.overallRating),
    };
    const fallback = [...squad].sort((a, b) => b.overallRating - a.overallRating);
    const used = new Set<string>();

    const pickPlayer = (role: PlayerPosition): Player | null => {
      const fromRole = pools[role].find(player => !used.has(player.id));
      if (fromRole) return fromRole;
      return fallback.find(player => !used.has(player.id)) ?? null;
    };

    return tactic.slots.map(slot => {
      const player = pickPlayer(slot.role);
      if (player) used.add(player.id);
      return { slot, player };
    });
  }, [squad, tactic]);

  const kitPrimary = team.colorsHex[0] || '#ffffff';
  const kitSecondary = team.colorsHex[1] || '#dc2626';
  const kitTrim = team.colorsHex[2] || kitSecondary;
  const shortsColor = kitPrimary.toLowerCase() === '#ffffff' ? kitSecondary : kitPrimary;
  const teamSchedule = useMemo<TeamScheduleItem[]>(() => {
    const seasonStartYear = currentDate.getMonth() >= 6 ? currentDate.getFullYear() : currentDate.getFullYear() - 1;
    const historyById = new Map(
      MatchHistoryService.getTeamHistory(team.id).map(entry => [entry.matchId, entry] as const)
    );

    return (NT_SCHEDULE_BY_YEAR[seasonStartYear] ?? [])
      .flatMap(matchDay => matchDay.matches
        .filter(match => match.home === team.name || match.away === team.name)
        .map(match => {
          const matchYear = matchDay.month >= 6 ? seasonStartYear : seasonStartYear + 1;
          const date = new Date(matchYear, matchDay.month, matchDay.day);
          const homeId = nationalTeamIdByName[match.home];
          const awayId = nationalTeamIdByName[match.away];
          const matchId = homeId && awayId
            ? ['NT', date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0'), homeId, awayId].join('_')
            : `NT_${date.getTime()}_${match.home}_${match.away}`;
          const historyEntry = historyById.get(matchId);

          return {
            id: matchId,
            date,
            dateLabel: `${date.getDate()} ${NT_MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`,
            home: match.home,
            away: match.away,
            competitionLabel: match.competitionLabel ?? matchDay.competitionLabel,
            group: match.group,
            result: historyEntry ? { homeGoals: historyEntry.homeScore, awayGoals: historyEntry.awayScore } : undefined,
            played: Boolean(historyEntry),
          };
        }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [currentDate, nationalTeamIdByName, team.id, team.name]);

  const filteredSchedule = useMemo(() => {
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
    const upcoming = teamSchedule.filter(match => !match.played && match.date.getTime() >= today);
    const played = teamSchedule.filter(match => match.played || match.date.getTime() < today);

    if (scheduleFilter === 'upcoming') return upcoming;
    if (scheduleFilter === 'played') return [...played].sort((a, b) => b.date.getTime() - a.date.getTime());
    return [...teamSchedule].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [currentDate, scheduleFilter, teamSchedule]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.92fr)] gap-5 items-start">
      <div className="min-w-0">
      {/* ── Nagłówek drużyny ── */}
      <div
        className="rounded-2xl overflow-hidden mb-5 border border-white/[0.07] relative"
        style={{ background: `linear-gradient(135deg, ${accent}22 0%, transparent 60%)` }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${accent}, ${team.colorsHex[1] || accent}88, transparent)` }} />
        <div className="flex gap-4 px-5 py-4 items-center">
          <NTFlagBadge teamName={team.name} className="w-[52px] h-[52px] rounded-xl" />
          <div className="flex-1 min-w-0">
            <div className={`text-xl leading-tight truncate ${T}`}>{team.name}</div>
            <div className={`text-[10px] mt-0.5 ${T}`}>
              {team.continent} · Tier {team.tier} · <span className={repColor(team.reputation)}>Rep. {team.reputation}/20</span>
            </div>
          </div>
          <div className="flex gap-6 shrink-0">
            <div className="text-center">
              <div className={`text-2xl tabular-nums ${T} ${ratingColor(avg)}`}>{avg}</div>
              <div className={`text-[8px] tracking-widest ${T}`}>śr. rating</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl tabular-nums ${T}`}>{squad.length}</div>
              <div className={`text-[8px] tracking-widest ${T}`}>zawodników</div>
            </div>
          </div>
        </div>
        <div className="flex border-t border-white/[0.06]">
          <div className="flex-1 px-5 py-2.5 border-r border-white/[0.06]">
            <div className={`text-[8px] tracking-widest mb-0.5 ${T}`}>Trener</div>
            <div className={`text-xs truncate ${T}`}>{coachName || '—'}</div>
          </div>
          <div className="flex-1 px-5 py-2.5">
            <div className={`text-[8px] tracking-widest mb-0.5 ${T}`}>Taktyka</div>
            <div className={`text-xs truncate ${T}`}>{tactic?.name || '—'}</div>
          </div>
        </div>
      </div>

      {/* ── Tabela składu ── */}
      <div className="rounded-xl overflow-hidden border border-white/[0.08]">
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
        {/* Nagłówek kolumn */}
        <div
          className={`grid px-4 py-2.5 bg-slate-800/80 border-b border-white/[0.10] text-[9px] ${T}`}
          style={{ gridTemplateColumns: GRID }}
        >
          <span>Poz</span>
          <span>Zawodnik</span>
          <span className="text-center">Klub</span>
          <span className="text-center border-r border-amber-400/10">TMP</span>
          <span className="text-center border-r border-amber-400/10">ATK</span>
          <span className="text-center border-r border-amber-400/10">OBR</span>
          <span className="text-center border-r border-amber-400/10">POD</span>
          <span className="text-center border-r border-amber-400/10">TEC</span>
          <span className="text-center border-r border-amber-400/10">WYT</span>
          <span className="text-center border-r border-amber-400/10">STR</span>
          <span className="text-center border-r border-amber-400/10">WIZ</span>
          <span className="text-center border-r border-amber-400/10">DRY</span>
          <span className="text-center border-r border-amber-400/10">POZ</span>
          <span className="text-center border-r border-amber-400/10">GŁO</span>
          <span className="text-center border-r border-amber-400/10">R.W</span>
          <span className="text-center border-r border-amber-400/10">TAL</span>
          <span className="text-center border-r border-amber-400/10">AGR</span>
          <span className="text-right">OVL</span>
        </div>
        {/* Wiersze zawodników */}
        {sorted.map(p => {
          const injured = p.health.status === 'INJURED';
          const clubName = p.clubId === 'FREE_AGENTS' ? 'Wolny agent' : (clubById[p.clubId] || '—');
          return (
            <button
              key={p.id}
              onClick={() => onPlayerClick(p.id)}
              className={`group w-full grid text-left px-4 py-2.5 transition-all duration-100 border-b border-amber-400/15 hover:bg-white/[0.07] ${POS_ROW_BG[p.position]} ${injured ? 'opacity-50' : ''} relative`}
              style={{ gridTemplateColumns: GRID }}
            >
              {injured && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-red-500" />}
              {/* POZ */}
              <span className="flex items-center">
                <span className={`text-[8px] font-black italic uppercase px-1.5 py-0.5 rounded ${POS_BADGE[p.position]}`}>
                  {POS_SHORT[p.position]}
                </span>
              </span>
              {/* Zawodnik */}
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs truncate font-normal italic uppercase tracking-wide text-white">
                  {p.firstName} {p.lastName}
                </span>
                {injured && <span className={`text-[8px] text-red-400 shrink-0 ${T}`}>⛌</span>}
              </span>
              {/* Klub */}
              <span className={`text-[8px] truncate self-stretch flex items-center justify-center px-2 -my-2.5 bg-slate-950 ${T}`}>{clubName}</span>
              {/* Atrybuty */}
              <span title="Tempo" className={`text-[11px] tabular-nums text-center self-center border-r border-amber-400/10 cursor-help ${attrColor(p.attributes.pace)}`}>{p.attributes.pace}</span>
              <span title="Atak" className={`text-[11px] tabular-nums text-center self-center border-r border-amber-400/10 cursor-help ${attrColor(p.attributes.attacking)}`}>{p.attributes.attacking}</span>
              <span title="Obrona" className={`text-[11px] tabular-nums text-center self-center border-r border-amber-400/10 cursor-help ${attrColor(p.attributes.defending)}`}>{p.attributes.defending}</span>
              <span title="Podania" className={`text-[11px] tabular-nums text-center self-center border-r border-amber-400/10 cursor-help ${attrColor(p.attributes.passing)}`}>{p.attributes.passing}</span>
              <span title="Technika" className={`text-[11px] tabular-nums text-center self-center border-r border-amber-400/10 cursor-help ${attrColor(p.attributes.technique)}`}>{p.attributes.technique}</span>
              <span title="Wytrzymałość" className={`text-[11px] tabular-nums text-center self-center border-r border-amber-400/10 cursor-help ${attrColor(p.attributes.stamina)}`}>{p.attributes.stamina}</span>
              <span title="Strzały" className={`text-[11px] tabular-nums text-center self-center border-r border-amber-400/10 cursor-help ${attrColor(p.attributes.finishing)}`}>{p.attributes.finishing}</span>
              <span title="Wizja gry" className={`text-[11px] tabular-nums text-center self-center border-r border-amber-400/10 cursor-help ${attrColor(p.attributes.vision)}`}>{p.attributes.vision}</span>
              <span title="Drybling" className={`text-[11px] tabular-nums text-center self-center border-r border-amber-400/10 cursor-help ${attrColor(p.attributes.dribbling)}`}>{p.attributes.dribbling}</span>
              <span title="Pozycjonowanie" className={`text-[11px] tabular-nums text-center self-center border-r border-amber-400/10 cursor-help ${attrColor(p.attributes.positioning)}`}>{p.attributes.positioning}</span>
              <span title="Gra głową" className={`text-[11px] tabular-nums text-center self-center border-r border-amber-400/10 cursor-help ${attrColor(p.attributes.heading)}`}>{p.attributes.heading}</span>
              <span title="Rzuty wolne" className={`text-[11px] tabular-nums text-center self-center border-r border-amber-400/10 cursor-help ${attrColor(p.attributes.freeKicks)}`}>{p.attributes.freeKicks}</span>
              <span title="Talent" className={`text-[11px] tabular-nums text-center self-center border-r border-amber-400/10 cursor-help ${attrColor(p.attributes.talent)}`}>{p.attributes.talent}</span>
              <span title="Agresja" className={`text-[11px] tabular-nums text-center self-center border-r border-amber-400/10 cursor-help ${attrColor(p.attributes.aggression)}`}>{p.attributes.aggression}</span>
              {/* OVR */}
              <span title="Ocena ogólna" className={`text-sm tabular-nums text-right self-center cursor-help ${T} ${ratingColor(p.overallRating)}`}>{p.overallRating}</span>
            </button>
          );
        })}
          </div>
        </div>
      </div>
      </div>

      <div className="min-w-0 space-y-4 xl:sticky xl:top-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_220px] gap-4 items-start">
          <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-green-500/15">
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.08]">
              <div>
                <div className="text-[10px] font-black italic uppercase tracking-[0.3em] text-slate-400">Taktyka</div>
                <div className={`text-sm mt-1 ${T}`}>{tactic?.name || 'Ustawienie reprezentacji'}</div>
              </div>
            </div>
            <div className="p-3">
              <div className="relative w-full max-w-[420px] mx-auto aspect-[1024/891] rounded-xl p-[2px] bg-gradient-to-br from-white/25 via-white/5 to-white/15">
                <div className="relative w-full h-full overflow-hidden rounded-xl bg-slate-950/80">
                  <img src={bojoImg} alt="Boisko taktyczne" className="absolute inset-0 w-full h-full object-contain opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950/35" />
                {tacticalLineup.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                    <div>
                      <div className="text-[10px] font-black italic uppercase tracking-[0.22em] text-slate-500">Brak slotów taktyki</div>
                      <div className={`mt-2 text-xs ${T}`}>Ta reprezentacja nie ma jeszcze ustawienia do wyrenderowania.</div>
                    </div>
                  </div>
                ) : (
                  tacticalLineup.map(({ slot, player }) => {
                    const fullName = player
                      ? `${player.firstName[0]}. ${player.lastName}`
                      : POS_SHORT[slot.role];
                    const label = (player?.lastName || POS_SHORT[slot.role]).slice(0, 2).toUpperCase();
                    return (
                      <div
                        key={`${slot.index}-${player?.id ?? slot.role}`}
                        className="absolute flex flex-col items-center gap-1"
                        style={{ left: `${slot.x * 100}%`, top: `${slot.y * 100}%`, transform: 'translate(-50%, calc(-50% - 30px))' }}
                      >
                        <TacticalKitIcon
                          primary={slot.role === PlayerPosition.GK ? '#facc15' : kitPrimary}
                          secondary={slot.role === PlayerPosition.GK ? '#1e293b' : kitSecondary}
                          trim={slot.role === PlayerPosition.GK ? '#000000' : kitTrim}
                          shorts={slot.role === PlayerPosition.GK ? '#111827' : shortsColor}
                          label={label}
                        />
                        <div className="text-[9px] font-black italic uppercase text-white whitespace-nowrap" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)' }}>
                          {fullName}
                        </div>
                      </div>
                    );
                  })
                )}
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl border border-white/[0.08] overflow-hidden"
            style={{ background: `linear-gradient(160deg, ${accent}20 0%, rgba(15,23,42,0.92) 55%, rgba(2,6,23,0.96) 100%)` }}
          >
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.08]">
              <div className="text-[10px] font-black italic uppercase tracking-[0.3em] text-slate-400">Szybki przegląd</div>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {[
                { label: 'Fit', value: availableCount, tone: 'text-emerald-400' },
                { label: 'Kont.', value: injuredCount, tone: 'text-red-400' },
                ...squadSections.map(s => ({ label: s.short, value: s.value, tone: s.tone })),
              ].map(item => (
                <div key={item.label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-2.5 text-center">
                  <div className="text-[9px] font-black italic uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
                  <div className={`mt-1 text-lg tabular-nums ${T} ${item.tone}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-slate-950/75 overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black italic uppercase tracking-[0.3em] text-slate-400">Terminarz</div>
                  <div className={`text-sm mt-1 ${T}`}>{team.name}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { id: 'upcoming' as const, label: 'Nadchodzące' },
                  { id: 'played' as const, label: 'Wyniki' },
                  { id: 'all' as const, label: 'Wszystkie' },
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setScheduleFilter(filter.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] border transition-all ${MANAGER_BUTTON_FONT} ${
                      scheduleFilter === filter.id
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                        : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 max-h-[300px] overflow-y-auto">
              {filteredSchedule.length === 0 ? (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-6 text-center">
                  <div className="text-[10px] font-black italic uppercase tracking-[0.22em] text-slate-500">Brak spotkań</div>
                  <div className="mt-2 text-xs font-black italic uppercase tracking-[0.16em] text-slate-300">
                    Dla wybranego filtra nie ma jeszcze meczów do pokazania.
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                  {filteredSchedule.map(match => {
                    const opponent = match.home === team.name ? match.away : match.home;
                    const isHome = match.home === team.name;
                    return (
                      <div
                        key={match.id}
                        className={`px-4 py-3 border-b last:border-b-0 ${
                          match.result
                            ? 'border-white/[0.06] bg-amber-400/[0.04]'
                            : 'border-white/[0.05] bg-white/[0.02]'
                        }`}
                      >
                        <div className="text-[11px] font-black italic uppercase tracking-[0.08em] text-slate-100 break-words">
                          <span className="text-slate-300">{match.dateLabel}</span>
                          <span className={`mx-1.5 ${isHome ? 'text-emerald-300' : 'text-sky-300'}`}>
                            ({isHome ? 'DOM' : 'WYJ.'})
                          </span>
                          <span className="text-white">{opponent}</span>
                          <span className={`mx-1.5 ${match.result ? 'text-amber-300' : 'text-slate-500'}`}>-</span>
                          <span className={match.result ? 'text-amber-300' : 'text-slate-500'}>
                            {match.result ? `${match.result.homeGoals}:${match.result.awayGoals}` : '—'}
                          </span>
                        </div>
                        <div className="mt-1 text-[10px] font-black italic uppercase tracking-[0.16em] text-slate-500 truncate">
                            {match.competitionLabel}{match.group ? ` · GRUPA ${match.group}` : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-slate-950/70 overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-white/[0.08]">
            <div className="text-[10px] font-black italic uppercase tracking-[0.3em] text-slate-400">Liderzy</div>
            <div className={`text-lg mt-1 ${T}`}>Kluczowi zawodnicy</div>
          </div>
          <div className="p-3 space-y-2">
            {leaders.map((player, index) => {
              const clubName = player.clubId === 'FREE_AGENTS' ? 'Wolny agent' : (clubById[player.clubId] || '—');
              return (
                <button
                  key={player.id}
                  onClick={() => onPlayerClick(player.id)}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-left transition-all hover:bg-white/[0.06] hover:border-white/[0.12]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-[10px] font-black italic text-slate-300 shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs truncate ${T}`}>{player.firstName} {player.lastName}</div>
                        <div className="text-[10px] font-black italic uppercase tracking-[0.2em] text-slate-500 truncate">
                          {clubName}
                        </div>
                      </div>
                    </div>
                    <div className={`text-xl tabular-nums shrink-0 ${T} ${ratingColor(player.overallRating)}`}>
                      {player.overallRating}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-slate-950/70 overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-white/[0.08]">
            <div className="text-[10px] font-black italic uppercase tracking-[0.3em] text-slate-400">Profil</div>
            <div className={`text-lg mt-1 ${T}`}>Charakterystyka zespołu</div>
          </div>
          <div className="p-4 space-y-4">
            {attributeProfile.map(stat => (
              <div key={stat.short}>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="text-[10px] font-black italic uppercase tracking-[0.22em] text-slate-400">{stat.label}</div>
                  <div className={`text-sm tabular-nums ${T} ${attrColor(stat.value)}`}>{stat.value}</div>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(8, Math.min(stat.value, 100))}%`, background: `linear-gradient(90deg, ${accent}, ${team.colorsHex[1] || accent})` }}
                  />
                </div>
              </div>
            ))}

            {tactic && (
              <div className="pt-2 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3">
                  <div className="text-[9px] font-black italic uppercase tracking-[0.18em] text-slate-500">Atak</div>
                  <div className="mt-2 text-lg font-black italic text-white tabular-nums">{tactic.attackBias}</div>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3">
                  <div className="text-[9px] font-black italic uppercase tracking-[0.18em] text-slate-500">Obrona</div>
                  <div className="mt-2 text-lg font-black italic text-white tabular-nums">{tactic.defenseBias}</div>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3">
                  <div className="text-[9px] font-black italic uppercase tracking-[0.18em] text-slate-500">Pressing</div>
                  <div className="mt-2 text-lg font-black italic text-white tabular-nums">{tactic.pressingIntensity}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── GŁÓWNY KOMPONENT ─────────────────────────────────────────────────────────

export const EuropeanClubsView: React.FC = () => {
  const { navigateTo, viewClubDetails, viewPlayerDetails, nationalTeams, coaches, players, clubs,
          europeanViewTab: activeTab, setEuropeanViewTab: setActiveTab,
          selectedNTId, setSelectedNTId, previousViewState, currentDate } = useGame();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeContinent, setActiveContinent] = useState<string>('Europe');
  const [activeWorldRegion, setActiveWorldRegion] = useState<WorldRegionKey>('SA');
  const selectedNT = nationalTeams.find(t => t.id === selectedNTId) ?? null;
  const setSelectedNT = (t: NationalTeam | null) => setSelectedNTId(t?.id ?? null);

  const countries = useMemo(() => {
    return Object.keys(COUNTRY_CLUB_MAP)
      .sort((a, b) => getCountryLabel(a).localeCompare(getCountryLabel(b), 'pl'));
  }, []);

  const handleBack = () => {
    if (selectedNT) { setSelectedNT(null); return; }
    if (selectedCountry) { setSelectedCountry(null); return; }
    navigateTo(ViewState.DASHBOARD);
  };

  const clubsForCountry = selectedCountry ? (COUNTRY_CLUB_MAP[selectedCountry] || []) : [];

  // Mapy pomocnicze dla reprezentacji
  const playerById = useMemo<Record<string, Player>>(() => {
    const map: Record<string, Player> = {};
    Object.values(players).flat().forEach(p => { map[p.id] = p; });
    return map;
  }, [players]);

  const clubById = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    clubs.forEach(c => { map[c.id] = c.name; });
    return map;
  }, [clubs]);

  const nationalTeamIdByName = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    nationalTeams.forEach(nt => { map[nt.name] = nt.id; });
    return map;
  }, [nationalTeams]);

  const continentTeams = useMemo(() => {
    if (activeContinent === 'RANKING') {
      const avgOverall = (team: NationalTeam): number => {
        const ratings = team.squadPlayerIds.map(id => playerById[id]?.overallRating ?? 0).filter(r => r > 0);
        return ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : 0;
      };
      return [...nationalTeams].sort((a, b) => {
        const diff = avgOverall(b) - avgOverall(a);
        if (diff !== 0) return diff;
        if (b.reputation !== a.reputation) return b.reputation - a.reputation;
        return a.tier - b.tier;
      });
    }
    return nationalTeams
      .filter(t => t.continent === activeContinent)
      .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
  }, [nationalTeams, activeContinent, playerById]);

  const getCoachName = (team: NationalTeam): string => {
    if (!team.coachId) return '';
    const coach = coaches[team.coachId];
    if (!coach) return '';
    return `${coach.firstName} ${coach.lastName}`;
  };

  const ambientColor = activeTab === 'nt' ? '#10b981' : (selectedCountry ? '#3b82f6' : '#6366f1');

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center relative">
      {activeTab === 'nt' && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div
            className="absolute inset-0 scale-110 opacity-40 mix-blend-luminosity"
            style={{ backgroundImage: `url(${ntBgImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/60 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 opacity-60" />
        </div>
      )}
      {activeTab === 'clubs' && selectedCountry === 'WORLD' && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: `url(${saWorldBgImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/50 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60" />
        </div>
      )}
      {activeTab === 'clubs' && !selectedCountry && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-25"
            style={{ backgroundImage: `url(${allTeamsBgImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/50 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60" />
        </div>
      )}
      {activeTab === 'clubs' && selectedCountry && selectedCountry !== 'WORLD' && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-25"
            style={{ backgroundImage: `url(${allCupsBgImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/50 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60" />
        </div>
      )}
      {/* Background ambient glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[30%] w-[60%] h-[60%] rounded-full blur-[180px] opacity-10"
          style={{ background: ambientColor }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[150px] opacity-8"
          style={{ background: '#0ea5e9' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className={`relative z-10 w-full transition-all duration-300 ${activeTab === 'clubs' && selectedCountry === 'POL' ? 'max-w-[1600px]' : activeTab === 'clubs' && selectedCountry === 'WORLD' ? 'max-w-5xl' : activeTab === 'clubs' && selectedCountry && selectedCountry !== 'POL' ? 'max-w-4xl' : activeTab === 'clubs' ? 'max-w-[1500px]' : selectedNT ? 'max-w-[92vw]' : 'max-w-[1280px]'}`}>

        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={handleBack}
            className={`px-3 py-1.5 rounded-lg bg-slate-800/80 border border-white/10 text-xs text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors ${MANAGER_BUTTON_FONT}`}
          >
            ← Wróć
          </button>
          <div>
            {activeTab === 'clubs' && !selectedCountry && (
              <h1 className={`text-base text-white ${MANAGER_HEADING_FONT}`}>Reprezentacje i Kluby Europejskie</h1>
            )}
            {activeTab === 'clubs' && selectedCountry && selectedCountry !== 'WORLD' && (
              <div className="flex items-center gap-3">
                {hasCountryFlag(selectedCountry) ? (
                  <img src={flagUrl(selectedCountry)} alt={getCountryLabel(selectedCountry)} className="h-5 shadow-sm rounded-sm" />
                ) : (
                  <div className="h-5 min-w-8 px-2 rounded bg-white/10 border border-white/10 text-[8px] font-black flex items-center justify-center text-slate-300">
                    {selectedCountry}
                  </div>
                )}
                <h1 className={`text-base text-white ${MANAGER_HEADING_FONT}`}>{getCountryLabel(selectedCountry)}</h1>
                <span className="text-[10px] text-slate-500">{clubsForCountry.length} klubów</span>
              </div>
            )}
            {activeTab === 'clubs' && selectedCountry === 'WORLD' && (
              <div className="flex items-center gap-3">
                <span className="text-xl">🌍</span>
                <h1 className={`text-base text-white ${MANAGER_HEADING_FONT}`}>Inne drużyny</h1>
              </div>
            )}
            {activeTab === 'nt' && !selectedNT && (
              <h1 className={`text-base text-white ${MANAGER_HEADING_FONT}`}>Reprezentacje Narodowe</h1>
            )}
            {activeTab === 'nt' && selectedNT && (
              <h1 className={`text-base text-white ${MANAGER_HEADING_FONT}`}>{selectedNT.name} — Skład</h1>
            )}
          </div>
        </div>

        {/* Główne zakładki: Kluby | Reprezentacje */}
        {!selectedCountry && !selectedNT && (
          <div className="flex gap-2 mb-4">
            {(['clubs', 'nt'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-2xl text-[11px] transition-all ${MANAGER_BUTTON_FONT} ${
                  activeTab === tab
                    ? 'bg-indigo-500 text-white shadow-[0_0_24px_rgba(99,102,241,0.35)]'
                    : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] border border-white/[0.08]'
                }`}
              >
                {tab === 'clubs' ? '🏟 Kluby' : '🌍 Reprezentacje'}
              </button>
            ))}
          </div>
        )}

        {/* Glass card */}
        <div className={GLASS_CARD}>
          <div className={GLOSS_LAYER} />

          {/* Ghost label */}
          <div className="absolute right-[-10px] bottom-[-20px] text-[8rem] font-black italic text-white/[0.02] select-none pointer-events-none leading-none">
            {activeTab === 'clubs' ? (selectedCountry ? selectedCountry : 'EUR') : 'NT'}
          </div>

          <div className="relative z-10 p-2">

            {/* ── ZAKŁADKA KLUBY ─────────────────────────────────────────────── */}

            {activeTab === 'clubs' && selectedCountry && selectedCountry !== 'POL' && selectedCountry !== 'WORLD' && (
              <div className="grid grid-cols-2 gap-x-3 p-2">
                {clubsForCountry.map(club => (
                  <ClubRow key={club.id} club={club} onSelect={() => viewClubDetails(club.id)} />
                ))}
              </div>
            )}

            {activeTab === 'clubs' && selectedCountry === 'POL' && (
              <div className="grid grid-cols-4 gap-3 p-2">
                {([1, 2, 3, 4] as const).map(tier => {
                  const tierClubs = clubsForCountry.filter(club => club.tier === tier);
                  if (tierClubs.length === 0) return null;

                  const tierName = tier === 1
                    ? 'Ekstraklasa'
                    : tier === 2
                      ? 'I Liga'
                      : tier === 3
                        ? 'II Liga'
                        : 'III Liga i niższe';

                  return (
                    <div key={tier} className="relative rounded-[28px] overflow-hidden bg-slate-900/40 border border-white/[0.06] min-w-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
                      <div className="absolute right-2 bottom-[-8px] text-[4rem] font-black italic text-white/[0.03] select-none pointer-events-none leading-none tracking-tighter">
                        {tier === 1 ? 'EKS' : tier === 2 ? 'I L' : tier === 3 ? 'II L' : 'III'}
                      </div>
                      <div className="relative z-10 px-4 pt-4 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-white/[0.05] mb-1">
                        {tierName}
                        <span className="ml-2 text-slate-600 font-normal normal-case tracking-normal">
                          {tierClubs.length} klubów
                        </span>
                      </div>
                      <div className="relative z-10 px-1 pb-1">
                        {tierClubs.map(club => (
                          <ClubRow key={club.id} club={club} onSelect={() => viewClubDetails(club.id)} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'clubs' && selectedCountry === 'WORLD' && (
              <div className="p-6">
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {WORLD_REGIONS.map(region => (
                    <button
                      key={region.key}
                      onClick={() => setActiveWorldRegion(region.key)}
                      className={`px-5 py-2 rounded-xl text-[10px] transition-all ${MANAGER_BUTTON_FONT} ${
                        activeWorldRegion === region.key
                          ? 'bg-sky-500 text-white shadow-[0_0_16px_rgba(14,165,233,0.28)]'
                          : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] border border-white/[0.08]'
                      }`}
                    >
                      {region.label}
                    </button>
                  ))}
                </div>
                {activeWorldRegion === 'SA' && (
                <div className="grid grid-cols-3 gap-6">
                  {SA_COUNTRY_ORDER.filter(code => SA_CLUB_MAP[code]?.length > 0).map(code => (
                    <div key={code}>
                      {/* Country header */}
                      <div className="flex items-center gap-3 mb-3">
                        <img src={flagUrl(code)} alt={COUNTRY_NAME[code]} className="h-6 w-9 object-cover rounded shadow-lg" />
                        <span className={`text-sm text-white ${MANAGER_HEADING_FONT}`}>{COUNTRY_NAME[code]}</span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="text-[10px] text-slate-600 font-medium">{SA_CLUB_MAP[code].length} klubów</span>
                      </div>
                      {/* Club rows */}
                      <div className="space-y-1">
                        {SA_CLUB_MAP[code].map((club, idx) => {
                          const c0 = club.colors?.[0] ?? '#6366f1';
                          const c1 = club.colors?.[1] ?? c0;
                          const c2 = club.colors?.[2] ?? c1;
                          return (
                            <button
                              key={club.id}
                              onClick={() => viewClubDetails(club.id)}
                              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.05] hover:border-white/[0.14] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-150"
                            >
                              {/* Rank */}
                              <span className="w-4 text-[10px] font-black text-slate-700 group-hover:text-slate-500 transition-colors text-right shrink-0">{idx + 1}</span>
                              {/* Club color badge */}
                              <div
                                className="w-9 h-7 rounded-md shrink-0 overflow-hidden"
                                style={{ background: `linear-gradient(135deg, ${c0} 0%, ${c0} 50%, ${c1} 50%, ${c1} 100%)`, border: '1px solid rgba(255,255,255,0.1)' }}
                              >
                                <div className="w-full h-full" style={{ background: `linear-gradient(to bottom, ${c2}22, transparent)` }} />
                              </div>
                              {/* Club name */}
                              <span className={`flex-1 text-[11px] text-slate-200 group-hover:text-white transition-colors text-left truncate ${MANAGER_HEADING_FONT}`}>{club.name}</span>
                              <span className="text-slate-700 group-hover:text-slate-400 transition-colors text-xs shrink-0">›</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                )}
                {activeWorldRegion === 'AFR' && (
                  <WorldClubGrid countryOrder={AFRICA_COUNTRY_ORDER} clubMap={AFRICA_CLUB_MAP} onSelectClub={viewClubDetails} />
                )}
                {activeWorldRegion === 'ASIA' && (
                  <WorldClubGrid countryOrder={ASIA_COUNTRY_ORDER} clubMap={ASIA_CLUB_MAP} onSelectClub={viewClubDetails} />
                )}
                {activeWorldRegion === 'NA' && (
                  <WorldClubGrid countryOrder={NORTH_AMERICA_COUNTRY_ORDER} clubMap={NORTH_AMERICA_CLUB_MAP} onSelectClub={viewClubDetails} />
                )}
              </div>
            )}

            {activeTab === 'clubs' && !selectedCountry && (
              <div
                className="grid gap-2 p-4"
                style={{
                  gridAutoFlow: 'column',
                  gridTemplateRows: `repeat(${Math.ceil((countries.length + 1) / FLAG_COLUMNS)}, auto)`,
                  gridTemplateColumns: `repeat(${FLAG_COLUMNS}, minmax(0, 1fr))`
                }}
              >
                {[...countries, 'WORLD'].map(code => (
                  <button
                    key={code}
                    onClick={() => setSelectedCountry(code)}
                    className="group relative flex flex-col items-center gap-2.5 px-3 py-3 rounded-2xl overflow-hidden transition-all duration-200 text-center bg-slate-900/40 border border-white/[0.07] hover:border-white/[0.18] hover:bg-slate-800/50 min-h-[88px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
                    {code === 'WORLD' ? (
                      <>
                        <span className="relative text-[2.8rem] leading-none mt-1">🌍</span>
                        <span className={`relative text-[10px] text-slate-400 group-hover:text-white transition-colors leading-tight w-full text-center truncate ${MANAGER_HEADING_FONT}`}>
                          Inne drużyny
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="absolute right-1 bottom-[-2px] text-[2.2rem] font-black italic text-white/[0.05] select-none group-hover:text-white/[0.09] transition-colors leading-none pointer-events-none tracking-tighter">
                          {code}
                        </div>
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04), transparent)' }}
                        />
                        {hasCountryFlag(code) ? (
                          <img
                            src={flagUrl(code)}
                            alt={getCountryLabel(code)}
                            className="relative w-[72px] h-[46px] object-cover rounded-md shadow-lg"
                          />
                        ) : (
                          <div className="relative w-[72px] h-[46px] rounded-md shadow-lg bg-white/10 border border-white/10 flex items-center justify-center text-sm font-black text-slate-200">
                            {code}
                          </div>
                        )}
                        <span className={`relative text-[10px] text-slate-400 group-hover:text-white transition-colors leading-tight w-full text-center truncate ${MANAGER_HEADING_FONT}`}>
                          {getCountryLabel(code)}
                        </span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ── ZAKŁADKA REPREZENTACJE ─────────────────────────────────────── */}

            {activeTab === 'nt' && !selectedNT && (
              <div className="p-2">
                {/* Sub-zakładki kontynentów */}
                <div className="flex flex-wrap gap-2 mb-5 justify-center">
                  {CONTINENTS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveContinent(key)}
                      className={`px-5 py-2 rounded-xl text-xs transition-all ${MANAGER_BUTTON_FONT} ${
                        activeContinent === key
                          ? 'bg-emerald-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.3)]'
                          : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] border border-white/[0.08]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Licznik */}
                <div className="text-[11px] text-slate-600 font-semibold uppercase tracking-widest mb-3 px-1">
                  {continentTeams.length} reprezentacji
                </div>

                {/* Lista drużyn */}
                {nationalTeams.length === 0 ? (
                  <div className="text-center py-12 text-slate-600 text-sm">
                    Brak danych — uruchom nową grę
                  </div>
                ) : (
                  continentTeams.map((team, i) => (
                    <NTCard
                      key={team.id}
                      team={team}
                      coachName={getCoachName(team)}
                      onSelect={() => setSelectedNT(team)}
                      showTier={activeContinent === 'RANKING'}
                      rank={activeContinent === 'RANKING' ? i + 1 : undefined}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'nt' && selectedNT && (
              <div className="p-2">
                <NTSquadView
                  team={selectedNT}
                  coachName={getCoachName(selectedNT)}
                  playerById={playerById}
                  clubById={clubById}
                  nationalTeamIdByName={nationalTeamIdByName}
                  currentDate={currentDate}
                  onPlayerClick={viewPlayerDetails}
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
